// app/api/ebay/item/route.ts
// Fetch single eBay item by ID or URL
// Used by: Title Builder (extract) + Profit Calculator (auto-fill)

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── Get app-level OAuth token ──────────────────────────────────
async function getAppToken(): Promise<string | null> {
  try {
    const clientId     = process.env.NEXT_PUBLIC_EBAY_CLIENT_ID!
    const clientSecret = process.env.EBAY_CLIENT_SECRET!
    const credentials  = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const res = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method:  'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type':  'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
    })

    if (!res.ok) return null
    const data = await res.json()
    return data.access_token ?? null
  } catch { return null }
}

// ── Extract item ID from URL or raw ID ────────────────────────
function extractItemId(input: string): string | null {
  input = input.trim()

  // Already a pure numeric ID
  if (/^\d+$/.test(input)) return input

  // eBay URL patterns:
  // https://www.ebay.com/itm/TITLE/123456789
  // https://www.ebay.co.uk/itm/123456789
  // https://ebay.com/itm/title-here/123456789?hash=...
  const patterns = [
    /\/itm\/(?:[^\/]+\/)?(\d{10,13})/,
    /\/p\/(\d{10,13})/,
    /item=(\d{10,13})/,
    /(\d{12,13})/,
  ]

  for (const pattern of patterns) {
    const match = input.match(pattern)
    if (match) return match[1]
  }

  return null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const input       = searchParams.get('id') ?? searchParams.get('url') ?? ''
  const marketplace = searchParams.get('marketplace') ?? 'EBAY_US'
  const purpose     = searchParams.get('purpose') ?? 'title' // 'title' | 'profit'

  if (!input) return NextResponse.json({ error: 'id or url required' }, { status: 400 })

  // ── Extract item ID ─────────────────────────────────────────
  const itemId = extractItemId(input)
  if (!itemId) return NextResponse.json({ error: 'Invalid eBay item ID or URL' }, { status: 400 })

  const start = Date.now()

  try {
    // ── Get app token ───────────────────────────────────────
    const token = await getAppToken()
    if (!token) return NextResponse.json({ error: 'Failed to get eBay token' }, { status: 500 })

    // ── Fetch item from eBay Browse API ──────────────────────
    const itemRes = await fetch(
      `https://api.ebay.com/buy/browse/v1/item/v1|${itemId}|0`,
      {
        headers: {
          'Authorization':           `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': marketplace,
        }
      }
    )

    // If Browse API fails try Shopping API
    if (!itemRes.ok) {
      const shoppingRes = await fetch(
        `https://open.api.ebay.com/shopping?callname=GetSingleItem` +
        `&responseencoding=JSON` +
        `&appid=${process.env.NEXT_PUBLIC_EBAY_CLIENT_ID}` +
        `&siteid=0` +
        `&version=967` +
        `&ItemID=${itemId}` +
        `&IncludeSelector=Description,ItemSpecifics,ShippingCosts`,
        { headers: { 'X-EBAY-API-APP-ID': process.env.NEXT_PUBLIC_EBAY_CLIENT_ID! } }
      )

      if (!shoppingRes.ok) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 })
      }

      const shoppingData = await shoppingRes.json()
      const item         = shoppingData.Item

      if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

      const price       = parseFloat(item.CurrentPrice?.Value ?? 0)
      const shipping    = parseFloat(item.ShippingCostSummary?.ShippingServiceCost?.Value ?? 0)
      const categoryId  = item.PrimaryCategoryID ?? ''
      const categoryName = item.PrimaryCategoryName ?? ''

      const responseTime = Date.now() - start
      await logUsage('title_builder', 'GetSingleItem', responseTime)

      return NextResponse.json({
        itemId,
        title:        item.Title ?? '',
        price,
        shipping,
        categoryId,
        categoryName,
        condition:    item.ConditionDisplayName ?? '',
        imageUrl:     item.PictureURL?.[0] ?? '',
        soldCount:    item.QuantitySold ?? 0,
        watchers:     item.WatchCount ?? 0,
        seller:       item.Seller?.UserID ?? '',
        itemUrl:      item.ViewItemURL ?? '',
        purpose,
        responseTime,
      })
    }

    const item = await itemRes.json()

    // ── Extract data for both Title Builder and Profit Calculator
    const price       = parseFloat(item.price?.value ?? 0)
    const shipping    = parseFloat(item.shippingOptions?.[0]?.shippingCost?.value ?? 0)
    const categoryId  = item.categoryPath?.split('|')?.[0] ?? ''
    const categoryName = item.categoryPath ?? ''
    const condition   = item.condition ?? ''
    const imageUrl    = item.image?.imageUrl ?? item.thumbnailImages?.[0]?.imageUrl ?? ''
    const soldCount   = item.estimatedAvailabilities?.[0]?.estimatedAvailableQuantity ?? 0
    const watchers    = item.watchCount ?? 0

    const responseTime = Date.now() - start
    await logUsage(
      purpose === 'profit' ? 'profit_calculator' : 'title_builder',
      'GetItem',
      responseTime
    )

    return NextResponse.json({
      itemId,
      title:       item.title ?? '',
      price,
      shipping,
      categoryId,
      categoryName,
      condition,
      imageUrl,
      soldCount,
      watchers,
      seller:      item.seller?.username ?? '',
      itemUrl:     item.itemWebUrl ?? '',
      purpose,
      responseTime,
    })

  } catch (err: any) {
    console.error('[ebay-item]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── Log API usage ──────────────────────────────────────────────
async function logUsage(toolName: string, callName: string, responseTimeMs: number) {
  try {
    const { data: curr } = await (adminClient.from('api_fleet_config') as any)
      .select('rate_limit_used, requests_today')
      .eq('platform_name', 'ebay').single()

    await (adminClient.from('api_fleet_config') as any).update({
      last_used_at:    new Date().toISOString(),
      last_request_at: new Date().toISOString(),
      status:          'connected',
      rate_limit_used: ((curr as any)?.rate_limit_used ?? 0) + 1,
      requests_today:  ((curr as any)?.requests_today  ?? 0) + 1,
    }).eq('platform_name', 'ebay')

    await (adminClient.from('api_usage_logs') as any).insert({
      platform_name:    'ebay',
      tool_name:        toolName,
      call_name:        callName,
      endpoint:         'buy/browse/v1/item',
      success_count:    1,
      error_count:      0,
      response_time_ms: responseTimeMs,
      logged_at:        new Date().toISOString(),
    })
  } catch {}
}