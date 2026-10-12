// app/api/ebay/publish-listing/route.ts
// ─────────────────────────────────────────────────────────────
// eBay Direct Publish
//
// POST /api/ebay/publish-listing
// Body: { draftId: string }
//
// Flow:
//   1. Auth via Supabase session cookie
//   2. Fetch listing draft from listing_drafts
//   3. Verify health score >= 50 (minimum to publish)
//   4. Get valid eBay access token via lib/ebay-auth.ts
//   5. Build Trading API XML (AddFixedPriceItem)
//   6. POST to eBay Trading API
//   7. Parse ItemID from response
//   8. Save ebay_listing_id + status='published' back to draft
//   9. Return { ok: true, itemId, ebayUrl }
//
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import { createServerClient }        from '@supabase/ssr'
import { cookies }                   from 'next/headers'
import { getEbayToken }              from '@/lib/ebay-auth'

export const maxDuration = 60

// ── Admin client (service-role) ──────────────────────────────
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── eBay Trading API endpoint ────────────────────────────────
const EBAY_TRADING_API = 'https://api.ebay.com/ws/api.dll'

// ─────────────────────────────────────────────────────────────
// Helpers: map condition text → eBay condition ID
// https://developer.ebay.com/devzone/guides/ebayfeatures/Development/Desc-ItemCondition.html
// ─────────────────────────────────────────────────────────────
function conditionToEbayId(condition: string): number {
  const c = (condition ?? '').toLowerCase()
  if (c.includes('new') && c.includes('open'))           return 1500 // New other (see details)
  if (c.includes('new') && c.includes('defect'))         return 1750 // New with defects
  if (c.includes('new') && (c.includes('tag') || c.includes('box') || c === 'new')) return 1000 // New with tags
  if (c.includes('refurb') && c.includes('certif'))      return 2000 // Certified Refurbished
  if (c.includes('seller') && c.includes('refurb'))      return 2500 // Seller Refurbished
  if (c.includes('like') && c.includes('new'))           return 3000 // Like New
  if (c.includes('very') && c.includes('good'))          return 4000 // Very Good
  if (c.includes('good'))                                return 5000 // Good
  if (c.includes('accept'))                              return 6000 // Acceptable
  if (c.includes('part') && c.includes('work'))          return 7000 // For parts/not working
  if (c.includes('used'))                                return 3000 // Default used → Like New
  return 1000 // Default: New
}

// ─────────────────────────────────────────────────────────────
// Helper: escape XML entities
// ─────────────────────────────────────────────────────────────
function escXml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// ─────────────────────────────────────────────────────────────
// Helper: build ItemSpecifics XML from item_specifics object
// ─────────────────────────────────────────────────────────────
function buildItemSpecifics(specifics: Record<string, string> | null | undefined): string {
  if (!specifics || typeof specifics !== 'object') return ''
  const pairs = Object.entries(specifics)
    .filter(([k, v]) => k && v)
    .map(([k, v]) => `
      <NameValueList>
        <Name>${escXml(k)}</Name>
        <Value>${escXml(String(v))}</Value>
      </NameValueList>`)
    .join('')
  if (!pairs) return ''
  return `<ItemSpecifics>${pairs}</ItemSpecifics>`
}

// ─────────────────────────────────────────────────────────────
// Helper: build PictureDetails XML from photo_urls array
// ─────────────────────────────────────────────────────────────
function buildPictureDetails(photoUrls: string[] | null | undefined): string {
  if (!photoUrls || !Array.isArray(photoUrls) || photoUrls.length === 0) return ''
  const pics = photoUrls
    .slice(0, 12) // eBay max 12 pictures
    .filter(Boolean)
    .map(url => `<PictureURL>${escXml(url)}</PictureURL>`)
    .join('')
  if (!pics) return ''
  return `<PictureDetails>${pics}</PictureDetails>`
}

// ─────────────────────────────────────────────────────────────
// Helper: map marketplace string → eBay site ID (integer)
// ─────────────────────────────────────────────────────────────
function marketplaceToSiteId(marketplace: string | null): number {
  const map: Record<string, number> = {
    EBAY_US: 0,
    EBAY_GB: 3,
    EBAY_AU: 15,
    EBAY_CA: 2,
    EBAY_DE: 77,
    EBAY_FR: 71,
    EBAY_IT: 101,
    EBAY_ES: 186,
  }
  return map[marketplace ?? 'EBAY_US'] ?? 0
}

// ─────────────────────────────────────────────────────────────
// Helper: build the full AddFixedPriceItem XML payload
// ─────────────────────────────────────────────────────────────
interface DraftForPublish {
  id:                   string
  title:                string
  description_html:     string | null
  category:             string | null
  sell_price:           number | null
  item_specifics:       Record<string, string> | null
  photo_urls:           string[] | null
  condition:            string | null
  condition_description: string | null
  sku:                  string | null
  quantity:             number | null
  shipping_profile_id:  string | null
  return_policy:        string | null
  listing_duration:     string | null
  user_id:              string
}

function buildAddFixedPriceItemXml(
  draft: DraftForPublish,
  siteId: number
): string {
  const title         = escXml(draft.title ?? 'Untitled Item')
  const description   = draft.description_html
    ? `<![CDATA[${draft.description_html}]]>`
    : `<![CDATA[<p>${escXml(draft.title ?? '')}</p>]]>`
  const price         = (draft.sell_price ?? 0).toFixed(2)
  const quantity      = Math.max(1, draft.quantity ?? 1)
  const conditionId   = conditionToEbayId(draft.condition ?? 'New')
  const conditionDesc = draft.condition_description
    ? `<ConditionDescription>${escXml(draft.condition_description)}</ConditionDescription>`
    : ''
  const duration      = draft.listing_duration ?? 'GTC' // Good 'Til Cancelled
  const sku           = draft.sku
    ? `<SKU>${escXml(draft.sku)}</SKU>`
    : ''

  // Category: use a default if blank — eBay will reject without a valid category
  // Sellers should set the category in their draft for best results
  const primaryCategoryId = draft.category ?? '99' // 99 = "Everything Else"

  const itemSpecifics = buildItemSpecifics(draft.item_specifics)
  const pictureDetails = buildPictureDetails(draft.photo_urls)

  // Shipping: use a simple flat-rate domestic or default if no profile set
  const shippingDetails = `
    <ShippingDetails>
      <ShippingType>Flat</ShippingType>
      <ShippingServiceOptions>
        <ShippingServicePriority>1</ShippingServicePriority>
        <ShippingService>USPSMedia</ShippingService>
        <ShippingServiceCost currencyID="USD">4.99</ShippingServiceCost>
      </ShippingServiceOptions>
    </ShippingDetails>`

  // Return policy
  const returnPolicy = `
    <ReturnPolicy>
      <ReturnsAcceptedOption>ReturnsAccepted</ReturnsAcceptedOption>
      <RefundOption>MoneyBack</RefundOption>
      <ReturnsWithinOption>Days_30</ReturnsWithinOption>
      <ShippingCostPaidByOption>Buyer</ShippingCostPaidByOption>
    </ReturnPolicy>`

  return `<?xml version="1.0" encoding="utf-8"?>
<AddFixedPriceItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>__AUTH_TOKEN__</eBayAuthToken>
  </RequesterCredentials>
  <ErrorLanguage>en_US</ErrorLanguage>
  <WarningLevel>High</WarningLevel>
  <Item>
    <Title>${title}</Title>
    <Description>${description}</Description>
    <PrimaryCategory>
      <CategoryID>${escXml(String(primaryCategoryId))}</CategoryID>
    </PrimaryCategory>
    <StartPrice currencyID="USD">${price}</StartPrice>
    <ConditionID>${conditionId}</ConditionID>
    ${conditionDesc}
    <Country>US</Country>
    <Currency>USD</Currency>
    <DispatchTimeMax>3</DispatchTimeMax>
    <ListingDuration>${duration}</ListingDuration>
    <ListingType>FixedPriceItem</ListingType>
    <Quantity>${quantity}</Quantity>
    ${sku}
    <Site>${siteId === 0 ? 'US' : siteId === 3 ? 'UK' : siteId === 15 ? 'Australia' : 'US'}</Site>
    ${itemSpecifics}
    ${pictureDetails}
    ${shippingDetails}
    ${returnPolicy}
  </Item>
</AddFixedPriceItemRequest>`
}

// ─────────────────────────────────────────────────────────────
// Helper: parse ItemID from Trading API XML response
// ─────────────────────────────────────────────────────────────
function parseItemId(xml: string): string | null {
  const match = xml.match(/<ItemID>(\d+)<\/ItemID>/)
  return match ? match[1] : null
}

// ─────────────────────────────────────────────────────────────
// Helper: parse errors from Trading API XML response
// ─────────────────────────────────────────────────────────────
function parseEbayErrors(xml: string): string[] {
  const errors: string[] = []
  const errorPattern = /<LongMessage>([\s\S]*?)<\/LongMessage>/g
  let match
  while ((match = errorPattern.exec(xml)) !== null) {
    errors.push(match[1].trim())
  }
  if (errors.length === 0) {
    // Try ShortMessage as fallback
    const shortPattern = /<ShortMessage>([\s\S]*?)<\/ShortMessage>/g
    while ((match = shortPattern.exec(xml)) !== null) {
      errors.push(match[1].trim())
    }
  }
  return errors
}

// ─────────────────────────────────────────────────────────────
// POST /api/ebay/publish-listing
// Body: { draftId: string }
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {

  // ── 1. Auth ───────────────────────────────────────────────────────────────
  let userId: string
  try {
    const cookieStore = await cookies()
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    )
    const { data: { user }, error } = await supabaseUser.auth.getUser()
    if (error || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorised' }, { status: 401 })
    }
    userId = user.id
  } catch {
    return NextResponse.json({ ok: false, error: 'Auth failed' }, { status: 401 })
  }

  // ── 2. Parse body ─────────────────────────────────────────────────────────
  let draftId: string
  try {
    const body = await req.json()
    draftId = body.draftId
    if (!draftId) throw new Error('missing draftId')
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body — draftId required' }, { status: 400 })
  }

  // ── 3. Fetch draft ────────────────────────────────────────────────────────
  const { data: draft, error: draftErr } = await (supabaseAdmin
    .from('listing_drafts') as any)
    .select('id, title, description_html, category, sell_price, item_specifics, photo_urls, condition, condition_description, sku, quantity, shipping_profile_id, return_policy, listing_duration, user_id, health_score, ebay_listing_id')
    .eq('id', draftId)
    .single()

  if (draftErr || !draft) {
    return NextResponse.json({ ok: false, error: 'Draft not found' }, { status: 404 })
  }

  // Security: ensure the draft belongs to the authenticated user
  if ((draft as any).user_id !== userId) {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }

  // Already published?
  if ((draft as any).ebay_listing_id) {
    const itemId = (draft as any).ebay_listing_id
    return NextResponse.json({
      ok:      true,
      itemId,
      ebayUrl: `https://www.ebay.com/itm/${itemId}`,
      alreadyPublished: true,
    })
  }

  // Health score gate — must be at least 50 to publish
  const healthScore = (draft as any).health_score ?? 0
  if (healthScore < 50) {
    return NextResponse.json({
      ok:    false,
      error: `Listing quality score (${healthScore}) is too low to publish. Improve your listing to at least 50 before publishing.`,
      healthScore,
    }, { status: 422 })
  }

  // ── 4. Validate required fields ───────────────────────────────────────────
  const title     = (draft as any).title?.trim()
  const sellPrice = parseFloat((draft as any).sell_price ?? 0)

  if (!title) {
    return NextResponse.json({ ok: false, error: 'Listing title is required' }, { status: 422 })
  }
  if (!sellPrice || sellPrice <= 0) {
    return NextResponse.json({ ok: false, error: 'A valid sell price is required' }, { status: 422 })
  }

  // ── 5. Get eBay access token ──────────────────────────────────────────────
  let accessToken: string
  try {
    accessToken = await getEbayToken(userId)
  } catch (err: any) {
    return NextResponse.json({
      ok:    false,
      error: err.message ?? 'eBay not connected — please connect your eBay account in Settings',
      notConnected: true,
    }, { status: 400 })
  }

  // ── 6. Get user's marketplace ─────────────────────────────────────────────
  const { data: profile } = await (supabaseAdmin.from('profiles') as any)
    .select('ebay_marketplace')
    .eq('id', userId)
    .single()

  const marketplace = (profile as any)?.ebay_marketplace ?? 'EBAY_US'
  const siteId = marketplaceToSiteId(marketplace)

  // ── 7. Build Trading API XML ──────────────────────────────────────────────
  const xmlPayload = buildAddFixedPriceItemXml(draft as DraftForPublish, siteId)
    .replace('__AUTH_TOKEN__', accessToken)

  // ── 8. Call eBay Trading API ──────────────────────────────────────────────
  let ebayResponseXml: string
  try {
    const ebayRes = await fetch(EBAY_TRADING_API, {
      method: 'POST',
      headers: {
        'Content-Type':          'text/xml',
        'X-EBAY-API-SITEID':     String(siteId),
        'X-EBAY-API-CALL-NAME':  'AddFixedPriceItem',
        'X-EBAY-API-APP-NAME':   process.env.NEXT_PUBLIC_EBAY_CLIENT_ID ?? '',
        'X-EBAY-API-DEV-NAME':   process.env.EBAY_DEV_ID               ?? '',
        'X-EBAY-API-CERT-NAME':  process.env.EBAY_CERT_ID              ?? '',
        'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
      },
      body: xmlPayload,
      signal: AbortSignal.timeout(30_000),
    })

    ebayResponseXml = await ebayRes.text()
  } catch (err: any) {
    console.error('[publish-listing] eBay fetch failed:', err)
    return NextResponse.json({
      ok:    false,
      error: 'Failed to reach eBay API. Please try again.',
    }, { status: 502 })
  }

  // ── 9. Parse response ─────────────────────────────────────────────────────
  const itemId = parseItemId(ebayResponseXml)

  if (!itemId) {
    // Extract error messages for a helpful response
    const ebayErrors = parseEbayErrors(ebayResponseXml)
    const errorMsg = ebayErrors.length > 0
      ? `eBay rejected the listing: ${ebayErrors[0]}`
      : 'eBay did not return an ItemID. Check listing details and try again.'

    console.error('[publish-listing] eBay response (no ItemID):', ebayResponseXml)

    return NextResponse.json({
      ok:         false,
      error:      errorMsg,
      ebayErrors,
      rawResponse: ebayResponseXml.slice(0, 2000), // truncated for debug
    }, { status: 422 })
  }

  // ── 10. Save ItemID + update status in listing_drafts ─────────────────────
  await (supabaseAdmin.from('listing_drafts') as any).update({
    ebay_listing_id: itemId,
    status:          'published',
    updated_at:      new Date().toISOString(),
  }).eq('id', draftId)

  // ── 11. Log API usage ─────────────────────────────────────────────────────
  try {
    await (supabaseAdmin.from('api_usage_logs') as any).insert({
      user_id:          userId,
      platform_name:    'ebay',
      tool_name:        'listings',
      call_name:        'AddFixedPriceItem',
      endpoint:         'api.ebay.com/ws/api.dll',
      success_count:    1,
      error_count:      0,
      response_time_ms: 1000,
      logged_at:        new Date().toISOString(),
    })
  } catch { /* non-fatal */ }

  // ── 12. Return success ────────────────────────────────────────────────────
  const ebayUrl = `https://www.ebay.com/itm/${itemId}`

  return NextResponse.json({
    ok:     true,
    itemId,
    ebayUrl,
  })
}
