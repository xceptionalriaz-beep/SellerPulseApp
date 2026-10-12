// app/api/inventory/apply-price-drops/route.ts
// Worker: scan all enabled price_drop_rules, find eligible listings,
// drop their price via eBay ReviseFixedPriceItem Trading API, log results.
//
// POST /api/inventory/apply-price-drops
// Called manually from UI or on a daily schedule.

import { createServerClient }  from '@supabase/ssr'
import { createClient }        from '@supabase/supabase-js'
import { cookies }             from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getEbayToken }        from '@/lib/ebay-auth'
import { getSiteId }           from '@/lib/ebay-marketplace'

const adminDb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const EBAY_TRADING_API = 'https://api.ebay.com/ws/api.dll'

// ── Build ReviseFixedPriceItem XML ────────────────────────────
function buildReviseXml(itemId: string, newPrice: number, accessToken: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<ReviseFixedPriceItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${accessToken}</eBayAuthToken>
  </RequesterCredentials>
  <ErrorLanguage>en_US</ErrorLanguage>
  <WarningLevel>High</WarningLevel>
  <Item>
    <ItemID>${itemId}</ItemID>
    <StartPrice>${newPrice.toFixed(2)}</StartPrice>
  </Item>
</ReviseFixedPriceItemRequest>`
}

function parseAck(xml: string): boolean {
  const match = xml.match(/<Ack>(Success|Warning)<\/Ack>/)
  return !!match
}

function parseEbayError(xml: string): string {
  const long  = xml.match(/<LongMessage>([\s\S]*?)<\/LongMessage>/)
  const short = xml.match(/<ShortMessage>([\s\S]*?)<\/ShortMessage>/)
  return (long?.[1] ?? short?.[1] ?? 'Unknown eBay error').trim()
}

// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────
  let userId: string
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    )
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    userId = user.id
  } catch {
    return NextResponse.json({ error: 'Auth failed' }, { status: 401 })
  }

  // ── Load user's marketplace (for siteId header) ────────────
  const { data: profile } = await (adminDb.from('profiles') as any)
    .select('ebay_marketplace')
    .eq('id', userId)
    .single()
  const marketplace = (profile as any)?.ebay_marketplace ?? 'EBAY_US'
  const siteId      = getSiteId(marketplace)

  // ── Get eBay token (auto-refresh if needed) ────────────────
  let accessToken: string
  try {
    accessToken = await getEbayToken(userId)
  } catch (err: any) {
    return NextResponse.json({ error: err.message, notConnected: true }, { status: 400 })
  }

  // ── Load all enabled rules for this user ───────────────────
  const { data: rules } = await (adminDb.from('price_drop_rules') as any)
    .select('*')
    .eq('user_id', userId)
    .eq('enabled', true)
    .not('listing_id', 'is', null) // only per-listing rules for now

  if (!rules || rules.length === 0) {
    return NextResponse.json({ checked: 0, dropped: 0, skipped: 0 })
  }

  const now = new Date()
  const results = { checked: 0, dropped: 0, skipped: 0, errors: 0, details: [] as any[] }

  for (const rule of rules) {
    results.checked++

    // ── Load the listing ────────────────────────────────────
    const { data: listing } = await (adminDb.from('listing_drafts') as any)
      .select('id, title, product_name, sell_price, status, ebay_listing_id, created_at, updated_at')
      .eq('id', rule.listing_id)
      .eq('user_id', userId)
      .single()

    if (!listing) { results.skipped++; continue }

    // Must be published with an eBay listing ID
    if (listing.status !== 'published' || !listing.ebay_listing_id) {
      results.skipped++
      results.details.push({ id: listing.id, title: listing.title, reason: 'not published' })
      continue
    }

    // Max drops reached?
    if (rule.max_drops > 0 && rule.trigger_count >= rule.max_drops) {
      results.skipped++
      results.details.push({ id: listing.id, title: listing.title, reason: 'max drops reached' })
      continue
    }

    // Check days unsold threshold
    // Use updated_at as "last activity" proxy — created_at for fresh listings
    const listingAge = (now.getTime() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24)
    if (listingAge < rule.days_unsold) {
      results.skipped++
      results.details.push({ id: listing.id, title: listing.title, reason: `only ${listingAge.toFixed(1)}d old` })
      continue
    }

    // Don't re-trigger within the same days_unsold window from last trigger
    if (rule.last_triggered_at) {
      const daysSinceTrigger = (now.getTime() - new Date(rule.last_triggered_at).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceTrigger < rule.days_unsold) {
        results.skipped++
        results.details.push({ id: listing.id, title: listing.title, reason: 'recently triggered' })
        continue
      }
    }

    const currentPrice = Number(listing.sell_price)
    if (!currentPrice || currentPrice <= 0) { results.skipped++; continue }

    // Calculate new price
    const rawNewPrice = currentPrice * (1 - rule.drop_percent / 100)
    const newPrice    = rule.min_price ? Math.max(rawNewPrice, Number(rule.min_price)) : rawNewPrice
    const finalPrice  = Math.round(newPrice * 100) / 100 // round to 2dp

    // Skip if price wouldn't actually change meaningfully
    if (Math.abs(finalPrice - currentPrice) < 0.01) {
      results.skipped++
      results.details.push({ id: listing.id, title: listing.title, reason: 'already at min_price floor' })
      continue
    }

    // ── Call eBay ReviseFixedPriceItem ──────────────────────
    const title = listing.title || listing.product_name || 'Untitled'
    let success = false
    let errorMsg: string | null = null
    let rawXml   = ''

    try {
      const xml = buildReviseXml(listing.ebay_listing_id, finalPrice, accessToken)
      const ebayRes = await fetch(EBAY_TRADING_API, {
        method:  'POST',
        headers: {
          'Content-Type':          'text/xml',
          'X-EBAY-API-SITEID':     String(siteId),
          'X-EBAY-API-CALL-NAME':  'ReviseFixedPriceItem',
          'X-EBAY-API-APP-NAME':   process.env.NEXT_PUBLIC_EBAY_CLIENT_ID ?? '',
          'X-EBAY-API-DEV-NAME':   process.env.EBAY_DEV_ID               ?? '',
          'X-EBAY-API-CERT-NAME':  process.env.EBAY_CERT_ID              ?? '',
          'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
        },
        body:   xml,
        signal: AbortSignal.timeout(20_000),
      })
      rawXml  = await ebayRes.text()
      success = parseAck(rawXml)
      if (!success) errorMsg = parseEbayError(rawXml)
    } catch (fetchErr: any) {
      errorMsg = fetchErr.message ?? 'Network error'
    }

    // ── Log the attempt ────────────────────────────────────
    await (adminDb.from('price_drop_log') as any).insert({
      user_id:         userId,
      listing_id:      listing.id,
      listing_title:   title,
      ebay_listing_id: listing.ebay_listing_id,
      old_price:       currentPrice,
      new_price:       finalPrice,
      drop_percent:    rule.drop_percent,
      success,
      error_message:   errorMsg,
      ebay_response:   rawXml ? { xml: rawXml.slice(0, 2000) } : null,
    })

    if (success) {
      // Update listing price in our DB
      await (adminDb.from('listing_drafts') as any)
        .update({ sell_price: finalPrice, updated_at: now.toISOString() })
        .eq('id', listing.id)

      // Update rule: last_triggered_at + increment count
      await (adminDb.from('price_drop_rules') as any)
        .update({
          last_triggered_at: now.toISOString(),
          trigger_count:     rule.trigger_count + 1,
          updated_at:        now.toISOString(),
        })
        .eq('id', rule.id)

      results.dropped++
      results.details.push({
        id: listing.id, title, oldPrice: currentPrice, newPrice: finalPrice, success: true,
      })
    } else {
      results.errors++
      results.details.push({
        id: listing.id, title, success: false, error: errorMsg,
      })
    }
  }

  return NextResponse.json(results)
}

// GET — return recent log entries + active rule count
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    )
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [logRes, rulesRes] = await Promise.all([
      (supabase as any)
        .from('price_drop_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50),
      (supabase as any)
        .from('price_drop_rules')
        .select('id')
        .eq('user_id', user.id)
        .eq('enabled', true)
        .not('listing_id', 'is', null),
    ])

    return NextResponse.json({
      log:         logRes.data  ?? [],
      activeRules: rulesRes.data?.length ?? 0,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
