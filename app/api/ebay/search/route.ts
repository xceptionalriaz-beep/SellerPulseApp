// app/api/ebay/search/route.ts
// Real eBay keyword search for Title Builder
// Uses Finding API to get real keyword data

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── Get eBay OAuth token using App ID + Cert ID ─────────────────
async function getAppToken(): Promise<string | null> {
  try {
    const clientId = process.env.NEXT_PUBLIC_EBAY_CLIENT_ID!
    const clientSecret = process.env.EBAY_CLIENT_SECRET!
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const res = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
    })

    if (!res.ok) return null
    const data = await res.json()
    return data.access_token ?? null
  } catch { return null }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword')?.trim()
  const marketplace = searchParams.get('marketplace') ?? 'EBAY_US'
  const limit = parseInt(searchParams.get('limit') ?? '20')

  if (!keyword) return NextResponse.json({ error: 'keyword required' }, { status: 400 })

  const start = Date.now()

  try {
    // ── Get app-level token ─────────────────────────────────
    const token = await getAppToken()
    if (!token) return NextResponse.json({ error: 'Failed to get eBay token' }, { status: 500 })

    // ── Search eBay using Browse API ────────────────────────
    const searchRes = await fetch(
      `https://api.ebay.com/buy/browse/v1/item_summary/search` +
      `?q=${encodeURIComponent(keyword)}` +
      `&limit=${limit}` +
      `&sort=BEST_MATCH` +
      `&filter=buyingOptions:{FIXED_PRICE}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': marketplace,
          'X-EBAY-C-ENDUSERCTX': 'contextualLocation=country=US',
        }
      }
    )

    if (!searchRes.ok) {
      const err = await searchRes.text()
      console.error('[ebay-search] API error:', err)
      return NextResponse.json({ error: 'eBay search failed' }, { status: 500 })
    }

    const data = await searchRes.json()
    const items = data.itemSummaries ?? []

    // ── Process results into keyword tables format ──────────
    // Everything below is derived from real fields in the Browse API response.
    // No random/simulated numbers — anything eBay doesn't expose (true search
    // volume, sold-count, historical trend) is simply omitted or marked N/A
    // rather than faked, since that data requires eBay's restricted
    // Marketplace Insights API which this app is not currently approved for.

    // Stopwords — filtered from both unigrams and bigrams
    const STOP = new Set([
      'with', 'from', 'this', 'that', 'your', 'have', 'will', 'been', 'they',
      'for', 'and', 'the', 'not', 'are', 'but', 'can', 'all', 'new', 'its',
      'was', 'one', 'our', 'out', 'who', 'get', 'has', 'him', 'his', 'how',
      'did', 'let', 'put', 'say', 'she', 'too', 'use', 'way',
    ])

    // Track word frequency AND running price per word (unigrams)
    const titleWords: Record<string, { count: number; priceSum: number }> = {}
    // Track 2-word phrase (bigram) frequency + price
    const bigramWords: Record<string, { count: number; priceSum: number }> = {}
    // Words already in the seed keyword — filter these from generic (they're obvious)
    const seedWords = new Set(keyword.toLowerCase().split(/\s+/).filter(w => w.length > 2))

    items.forEach((item: any) => {
      const price = parseFloat(item.price?.value ?? 0)
      const words: string[] = String(item.title ?? '').toLowerCase()
        .split(/\s+/)
        .map((w: string) => w.replace(/[^\w]/g, ''))
        .filter((w: string) => w.length > 3 && !STOP.has(w) && !seedWords.has(w))

      // Unigrams — count each word once per listing
      new Set(words).forEach((word: string) => {
        if (!titleWords[word]) titleWords[word] = { count: 0, priceSum: 0 }
        titleWords[word].count += 1
        titleWords[word].priceSum += price
      })

      // Bigrams — extract 2-word phrases (sliding window)
      for (let i = 0; i < words.length - 1; i++) {
        const w1 = words[i], w2 = words[i + 1]
        if (!w1 || !w2) continue
        const bigram = `${w1} ${w2}`
        if (!bigramWords[bigram]) bigramWords[bigram] = { count: 0, priceSum: 0 }
        bigramWords[bigram].count += 1
        bigramWords[bigram].priceSum += price
      }
    })

    // Sort unigrams by frequency
    const sortedWords = Object.entries(titleWords)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 15)

    // Sort bigrams by frequency — only keep bigrams that appear in 2+ listings
    const sortedBigrams = Object.entries(bigramWords)
      .filter(([, stats]) => stats.count >= 2)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 8)

    // Build long-tail keywords from real, individual competing listings
    // Now includes thumbnail image + listing URL for clickthrough
    const longTailKeywords = items.slice(0, 10).map((item: any) => {
      const price = parseFloat(item.price?.value ?? 0)
      const shippingCost = item.shippingOptions?.[0]?.shippingCost?.value
      const shippingLabel = shippingCost === undefined ? 'N/A'
        : parseFloat(shippingCost) === 0 ? 'Free' : `$${parseFloat(shippingCost).toFixed(2)}`
      return {
        kw: item.title?.slice(0, 65) ?? keyword,
        search: item.condition ?? 'N/A',
        comp: shippingLabel,
        sales: `$${price.toFixed(2)}`,
        image: item.thumbnailImages?.[0]?.imageUrl ?? item.image?.imageUrl ?? '',
        itemId: item.itemId ?? '',
        url: item.itemWebUrl ?? '',
      }
    })

    // Build generic keywords — mix of high-value bigrams first, then unigrams
    // Bigrams appear first because they're more specific and more useful to inject
    const sampleSize = items.length || 1

    const genericFromBigrams = sortedBigrams.map(([phrase, stats]) => {
      const avgPrice = stats.priceSum / stats.count
      const densityPct = Math.round((stats.count / sampleSize) * 100)
      return {
        kw: phrase.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        search: `${stats.count}/${sampleSize}`,
        comp: `${densityPct}`,
        sales: `$${avgPrice.toFixed(2)}`,
        type: 'phrase',  // used by the UI to show a "phrase" badge
      }
    })

    const genericFromWords = sortedWords.map(([word, stats]) => {
      const avgPrice = stats.priceSum / stats.count
      const densityPct = Math.round((stats.count / sampleSize) * 100)
      return {
        kw: word.charAt(0).toUpperCase() + word.slice(1),
        search: `${stats.count}/${sampleSize}`,
        comp: `${densityPct}`,
        sales: `$${avgPrice.toFixed(2)}`,
        type: 'word',
      }
    })

    // Merge: bigrams first, then unigrams that aren't already covered by a bigram
    const bigramWords2 = new Set(sortedBigrams.flatMap(([phrase]) => phrase.split(' ')))
    const filteredWords = genericFromWords.filter(row =>
      !bigramWords2.has(row.kw.toLowerCase())
    )
    const genericKeywords = [...genericFromBigrams, ...filteredWords].slice(0, 15)

    // ── Saturation score — real signal: total live matching listings ──
    const total = data.total ?? 0
    const saturScore = Math.min(total / 100000, 1)

    // ── Price Distribution — real data from fetched listings. ──
    // Each value is the price of one listing, sorted ascending.
    // The HeroChart renders these as a distribution curve so sellers
    // can see the price spread of live competing listings at a glance.
    // (Historical trend data requires eBay's restricted Marketplace
    // Insights API; this is an honest replacement using data we have.)
    const trendData: number[] = items
      .map((item: any) => parseFloat(item.price?.value ?? 0))
      .filter((p: number) => p > 0)
      .sort((a: number, b: number) => a - b)

    const responseTime = Date.now() - start

    // ── Log API usage ───────────────────────────────────────
    try {
      const { data: curr } = await (adminClient.from('api_fleet_config') as any)
        .select('rate_limit_used, requests_today')
        .eq('platform_name', 'ebay').single()

      await (adminClient.from('api_fleet_config') as any).update({
        last_used_at: new Date().toISOString(),
        last_request_at: new Date().toISOString(),
        status: 'connected',
        rate_limit_used: ((curr as any)?.rate_limit_used ?? 0) + 1,
        requests_today: ((curr as any)?.requests_today ?? 0) + 1,
      }).eq('platform_name', 'ebay')

      await (adminClient.from('api_usage_logs') as any).insert({
        platform_name: 'ebay',
        tool_name: 'title_builder',
        call_name: 'FindItemsByKeywords',
        endpoint: 'buy/browse/v1/item_summary/search',
        success_count: 1,
        error_count: 0,
        response_time_ms: responseTime,
        logged_at: new Date().toISOString(),
      })
    } catch { }

    return NextResponse.json({
      keyword,
      total,
      saturScore,
      trendData,
      longTailKeywords,
      genericKeywords,
      responseTime,
    })

  } catch (err: any) {
    console.error('[ebay-search]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
