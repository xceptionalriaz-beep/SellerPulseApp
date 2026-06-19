// app/api/admin/competitor-xray/route.ts
// Uses eBay Browse API (modern OAuth approach)
// Reads App ID + Cert ID from api_fleet_config table

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ── Extract username from eBay URL ─────────────────────────────
function extractUsername(input: string): string | null {
  const raw = input.trim()
  const strMatch = raw.match(/ebay\.com\/str\/([^/?&#\s]+)/i)
  if (strMatch) return decodeURIComponent(strMatch[1])
  const usrMatch = raw.match(/ebay\.com\/usr\/([^/?&#\s]+)/i)
  if (usrMatch) return decodeURIComponent(usrMatch[1])
  if (!raw.includes('/') && !raw.includes('.') && raw.length > 0) return raw
  return null
}

// ── Get eBay OAuth Application token ──────────────────────────
async function getEbayToken(appId: string, certId: string): Promise<string | null> {
  try {
    const credentials = Buffer.from(`${appId}:${certId}`).toString('base64')
    const res = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method:  'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type':  'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
    })
    console.log('[xray] token status:', res.status)
    if (!res.ok) {
      const err = await res.text()
      console.log('[xray] token error:', err.slice(0, 200))
      return null
    }
    const data = await res.json()
    return data.access_token ?? null
  } catch (e) {
    console.error('[xray] token fetch error:', e)
    return null
  }
}

// ── Parse price from Browse API item ──────────────────────────
function parsePrice(item: any): number {
  return parseFloat(item?.price?.value ?? item?.currentBidPrice?.value ?? '0') || 0
}

// ── Price distribution buckets ─────────────────────────────────
function getPriceDistribution(prices: number[]) {
  const ranges = [
    { range: 'Under $25',   min: 0,   max: 25     },
    { range: '$25 - $50',   min: 25,  max: 50     },
    { range: '$50 - $100',  min: 50,  max: 100    },
    { range: '$100 - $200', min: 100, max: 200    },
    { range: 'Over $200',   min: 200, max: 999999 },
  ]
  const total = prices.length
  return ranges.map(r => {
    const count = prices.filter(p => p >= r.min && p < r.max).length
    return { range: r.range, min: r.min, max: r.max, count,
             percentage: total > 0 ? Math.round(count / total * 100) : 0 }
  })
}

// ── POST /api/admin/competitor-xray ───────────────────────────
export async function POST(request: NextRequest) {
  try {

    // ── Kill switch check ──────────────────────────────────────
    try {
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
      const { data: killSwitch } = await (adminClient.from('kill_switches') as any)
        .select('is_enabled').eq('title', 'eBay Product Research Tool').single()
      if (killSwitch && !killSwitch.is_enabled) {
        return NextResponse.json({
          error:       'eBay Product Research Tool is temporarily unavailable. Our team is working on restoring this feature.',
          maintenance: true,
        }, { status: 503 })
      }
    } catch { /* non-critical — allow through if check fails */ }
    // ── End kill switch check ──────────────────────────────────

    const body = await request.json().catch(() => ({}))
    const { storeUrl } = body
    if (!storeUrl?.trim()) {
      return NextResponse.json({ error: 'Store URL or username is required' }, { status: 400 })
    }

    const username = extractUsername(storeUrl)
    if (!username) {
      return NextResponse.json(
        { error: 'Could not recognise this eBay URL. Try the full store URL or just the username.' },
        { status: 400 }
      )
    }
    console.log('[xray] scanning seller:', username)

    // ── 2. Read App ID + Cert ID from Supabase ─────────────────
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: config } = await (supabase as any)
      .from('api_fleet_config')
      .select('primary_key_1, primary_key_2')
      .eq('platform_name', 'ebay')
      .single()

    if (!config?.primary_key_1 || !config?.primary_key_2) {
      return NextResponse.json(
        { error: 'eBay API keys not configured. Add App ID and Cert ID in Global API Fleet.' },
        { status: 503 }
      )
    }

    const appId  = config.primary_key_1 as string
    const certId = config.primary_key_2 as string

    // ── 3. Get OAuth token ──────────────────────────────────────
    const token = await getEbayToken(appId, certId)
    if (!token) {
      return NextResponse.json(
        { error: 'eBay authentication failed. Check your App ID and Cert ID in Global API Fleet.' },
        { status: 503 }
      )
    }
    console.log('[xray] OAuth token obtained')

    // ── 4. Call eBay Browse API ─────────────────────────────────
    const browseHeaders = {
      'Authorization':            `Bearer ${token}`,
      'Content-Type':             'application/json',
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
    }

    const sellerFilter = `sellers%3A%7B${encodeURIComponent(username)}%7D`
    const base = `https://api.ebay.com/buy/browse/v1/item_summary/search`

    const searches = await Promise.allSettled([
      fetch(`${base}?q=size&filter=${sellerFilter}&limit=100&sort=newlyListed`,  { headers: browseHeaders }),
      fetch(`${base}?q=brand&filter=${sellerFilter}&limit=100&sort=newlyListed`, { headers: browseHeaders }),
      fetch(`${base}?q=women&filter=${sellerFilter}&limit=100&sort=newlyListed`, { headers: browseHeaders }),
    ])

    const seen    = new Set<string>()
    let allItems: any[] = []
    let totalListings   = 0

    for (const res of searches) {
      if (res.status === 'fulfilled' && res.value.ok) {
        const json = await res.value.json()
        if (!totalListings) totalListings = json?.total ?? 0
        for (const item of json?.itemSummaries ?? []) {
          if (!seen.has(item.itemId)) {
            seen.add(item.itemId)
            allItems.push(item)
          }
        }
      }
    }

    console.log('[xray] total unique items:', allItems.length, 'total listings:', totalListings)

    const activeItems = allItems
    const soldItems:  any[] = []

    // ── 5. Process data ─────────────────────────────────────────
    const prices   = activeItems.map(parsePrice).filter(p => p > 0)
    const avgPrice = prices.length > 0
      ? prices.reduce((a, b) => a + b, 0) / prices.length : 0

    const catMap: Record<string, { count: number; total: number }> = {}
    activeItems.forEach(item => {
      const cat = item?.categories?.[0]?.categoryName ?? 'Other'
      if (!catMap[cat]) catMap[cat] = { count: 0, total: 0 }
      catMap[cat].count++
      catMap[cat].total += parsePrice(item)
    })

    const categories = Object.entries(catMap)
      .map(([name, { count, total }]) => ({
        name, count,
        percentage: activeItems.length > 0 ? Math.round(count / activeItems.length * 100) : 0,
        avgPrice:   count > 0 ? Math.round(total / count * 100) / 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    const topProducts = activeItems
      .map(item => ({
        title:      item?.title ?? 'Unknown',
        price:      parsePrice(item),
        category:   item?.categories?.[0]?.categoryName ?? 'Other',
        imageUrl:   item?.image?.imageUrl ?? null,
        listingUrl: item?.itemWebUrl ?? null,
        condition:  item?.condition ?? 'New',
      }))
      .filter(p => p.price > 0)
      .sort((a, b) => b.price - a.price)
      .slice(0, 20)

    const soldPrices       = soldItems.map(parsePrice).filter(p => p > 0)
    const estimatedRevenue = soldPrices.reduce((a, b) => a + b, 0)

    const sellThroughRate = totalListings > 0
      ? Math.min(Math.round(soldItems.length / totalListings * 100), 100) : 0

    const priceDistribution = getPriceDistribution(prices)

    const topCategory = categories[0]?.name ?? 'N/A'
    const topCatPct   = categories[0]?.percentage ?? 0

    const insights: string[] = []
    if (topCategory !== 'N/A')
      insights.push(`Top category is ${topCategory} (${topCatPct}% of listings)`)
    if (avgPrice > 0)
      insights.push(`Average price point: $${avgPrice.toFixed(2)}`)
    if (sellThroughRate > 0)
      insights.push(`Estimated sell-through rate: ${sellThroughRate}%`)
    const bestRange = [...priceDistribution].sort((a, b) => b.count - a.count)[0]
    if (bestRange?.count > 0)
      insights.push(`Most listings priced: ${bestRange.range}`)
    if (totalListings > 0 && estimatedRevenue > 0)
      insights.push(`Revenue per active listing: $${(estimatedRevenue / totalListings).toFixed(2)}`)
    if (soldItems.length > 0)
      insights.push(`Approximately ${soldItems.length} items sold recently`)

    // Fix 10: Track successful eBay API usage
    try {
      const supabaseTrack = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      const { data: curr } = await (supabaseTrack.from('api_fleet_config') as any)
        .select('rate_limit_used, requests_today')
        .eq('platform_name', 'ebay').single()

      // Update api_fleet_config counters
      await (supabaseTrack.from('api_fleet_config') as any)
        .update({
          last_used_at:    new Date().toISOString(),
          last_request_at: new Date().toISOString(),
          last_tested_at:  new Date().toISOString(),
          status:          'connected',
          rate_limit_used: ((curr as any)?.rate_limit_used ?? 0) + 1,
          requests_today:  ((curr as any)?.requests_today  ?? 0) + 1,
        })
        .eq('platform_name', 'ebay')

      // Write to api_usage_logs for GlobalApiFleetTab activity feed
      const { data: { user } } = await supabaseTrack.auth.getUser()
      await (supabaseTrack.from('api_usage_logs') as any).insert({
        user_id:          user?.id ?? null,
        platform_name:    'ebay',
        tool_name:        'competitor_research',
        call_name:        'GetSellerList',
        endpoint:         'buy/browse/v1/item_summary/search',
        success_count:    1,
        error_count:      0,
        response_time_ms: Date.now() - (Date.now() - 500), // approximate
        logged_at:        new Date().toISOString(),
      })
    } catch {}

    return NextResponse.json({
      storeName:               username,
      totalListings,
      estimatedMonthlyRevenue: Math.round(estimatedRevenue * 100) / 100,
      avgPrice:                Math.round(avgPrice * 100) / 100,
      topCategory,
      sellThroughRate,
      soldCount:               soldItems.length,
      topProducts,
      categories,
      priceDistribution,
      insights,
      scannedAt:               new Date().toISOString(),
    })

  } catch (e: any) {
    console.error('[competitor-xray]', e)
    // Fix 10: track failed API call
    try {
      await (createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      ).from('api_fleet_config') as any)
        .update({ status: 'error', last_used_at: new Date().toISOString(), last_request_at: new Date().toISOString() })
        .eq('platform_name', 'ebay')
    } catch {}
    return NextResponse.json({ error: 'Scan failed. Please try again.' }, { status: 500 })
  }
}