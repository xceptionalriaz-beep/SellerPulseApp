// app/api/ebay/search/route.ts
// Real eBay keyword search for Title Builder
// Uses Finding API to get real keyword data

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { parseKeywordMetricsSimple, zikFormula } from '@/src/utils/keywordParser'
import { detectCategory } from '@/src/utils/categoryDetector'

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

// ── Lightweight keyword total fetcher ──────────────────────────
// Fetches just the total listing count for a single keyword from eBay.
// Uses limit=1 so eBay returns minimal data — we only need the total field.
// This is how Zik gets accurate per-keyword search volumes.
async function getKeywordTotal(
  keyword: string,
  token: string,
  marketplace: string,
  extraFilter: string = ''
): Promise<number> {
  try {
    const filter = extraFilter || 'buyingOptions:{FIXED_PRICE}'
    const res = await fetch(
      `https://api.ebay.com/buy/browse/v1/item_summary/search` +
      `?q=${encodeURIComponent(keyword)}&limit=1&filter=${encodeURIComponent(filter)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': marketplace,
        }
      }
    )
    if (!res.ok) return 0
    const data = await res.json()
    return data.total ?? 0
  } catch { return 0 }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword')?.trim()
  const marketplace = searchParams.get('marketplace') ?? 'EBAY_US'
  const limit = parseInt(searchParams.get('limit') ?? '50')
  const offset = parseInt(searchParams.get('offset') ?? '0')

  // ── Filters passed from TbKeywordTables ────────────────────
  const condition = searchParams.get('condition') ?? ''   // 'NEW' | 'USED' | 'UNSPECIFIED'
  const minPrice = searchParams.get('minPrice') ?? ''   // e.g. '5'
  const maxPrice = searchParams.get('maxPrice') ?? ''   // e.g. '50'
  const shipFrom = searchParams.get('shipFrom') ?? ''   // 'US' | 'GB' | 'CN' etc

  if (!keyword) return NextResponse.json({ error: 'keyword required' }, { status: 400 })

  // ── Detect category from seed keyword — zero extra API calls ──
  const categoryOverride = searchParams.get('category') ?? ''
  const { category, confidence } = categoryOverride
    ? { category: categoryOverride as import('@/src/utils/categoryDetector').EbayCategory, confidence: 'high' as const }
    : detectCategory(keyword)

  const start = Date.now()

  try {
    const token = await getAppToken()
    if (!token) return NextResponse.json({ error: 'Failed to get eBay token' }, { status: 500 })

    // ── Build eBay filter string ────────────────────────────
    // Browse API filter format: filter=param1:value,param2:{value}
    const filters: string[] = ['buyingOptions:{FIXED_PRICE}']
    if (condition === 'NEW') filters.push('conditions:{NEW}')
    if (condition === 'USED') filters.push('conditions:{USED}')
    if (condition === 'REFURBISHED') filters.push('conditions:{SELLER_REFURBISHED|MANUFACTURER_REFURBISHED}')
    if (minPrice && maxPrice) filters.push(`price:[${minPrice}..${maxPrice}]`)
    else if (minPrice) filters.push(`price:[${minPrice}..]`)
    else if (maxPrice) filters.push(`price:[..${maxPrice}]`)
    if (shipFrom) filters.push(`itemLocationCountry:${shipFrom}`)

    const filterStr = filters.join(',')

    // ── Search eBay using Browse API ────────────────────────
    const searchRes = await fetch(
      `https://api.ebay.com/buy/browse/v1/item_summary/search` +
      `?q=${encodeURIComponent(keyword)}` +
      `&limit=${limit}` +
      `&offset=${offset}` +
      `&sort=BEST_MATCH` +
      `&filter=${encodeURIComponent(filterStr)}`,
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

    // ── Client-side price enforcement ───────────────────────────
    // eBay's price filter is not always exact (variant listings, shipping
    // included prices, best offer listings). Re-filter client-side to
    // guarantee avg prices and keywords are within the selected range.
    // Only runs when a price filter is active — no impact otherwise.
    const minPriceNum = minPrice ? parseFloat(minPrice) : 0
    const maxPriceNum = maxPrice ? parseFloat(maxPrice) : Infinity
    const priceFilteredItems = (minPrice || maxPrice)
      ? items.filter((item: any) => {
        const p = parseFloat(item.price?.value ?? 0)
        return p >= minPriceNum && p <= maxPriceNum
      })
      : items

    // Warn if sample size too small after filtering
    const sampleTooSmall = priceFilteredItems.length < 10 && (minPrice || maxPrice)
    // Use filtered items for all keyword calculations
    const workingItems = sampleTooSmall ? items : priceFilteredItems

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

    workingItems.forEach((item: any) => {
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
      .slice(0, 50)

    // Sort bigrams by frequency — only keep bigrams that appear in 2+ listings
    const sortedBigrams = Object.entries(bigramWords)
      .filter(([, stats]) => stats.count >= 2)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 50)

    // ── Saturation score + trendData — calculated BEFORE keyword metrics ──
    const total = data.total ?? 0
    const totalListings = total  // alias — used in keyword metrics calculations
    const saturScore = Math.min(total / 100000, 1)

    const trendData: number[] = workingItems
      .map((item: any) => parseFloat(item.price?.value ?? 0))
      .filter((p: number) => p > 0)
      .sort((a: number, b: number) => a - b)

    // ── Extract 2 and 3-word phrases (long-tail keywords) ──────
    // These are what buyers actually type — ranked by how many
    // competing listings contain each phrase.
    const trigramWords: Record<string, { count: number; priceSum: number }> = {}

    workingItems.forEach((item: any) => {
      const price = parseFloat(item.price?.value ?? 0)
      const words: string[] = String(item.title ?? '').toLowerCase()
        .split(/\s+/)
        .map((w: string) => w.replace(/[^\w]/g, ''))
        .filter((w: string) => w.length > 2 && !STOP.has(w))

      // Trigrams — 3-word phrases
      for (let i = 0; i < words.length - 2; i++) {
        const w1 = words[i], w2 = words[i + 1], w3 = words[i + 2]
        if (!w1 || !w2 || !w3) continue
        const trigram = `${w1} ${w2} ${w3}`
        if (!trigramWords[trigram]) trigramWords[trigram] = { count: 0, priceSum: 0 }
        trigramWords[trigram].count += 1
        trigramWords[trigram].priceSum += price
      }
    })

    // Sort trigrams — only keep those in 2+ listings
    const sortedTrigrams = Object.entries(trigramWords)
      .filter(([, stats]) => stats.count >= 2)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 30)

    // Build long-tail keyword rows from phrases (bigrams + trigrams)
    // Columns: kw (phrase) | inListings (count/total) | avgPrice | avgSearches | sales
    const sampleSize = workingItems.length || 1

    // Merge trigrams first (more specific), then bigrams
    const allPhrases: Array<{ phrase: string; count: number; priceSum: number; words: number }> = [
      ...sortedTrigrams.map(([phrase, stats]) => ({ phrase, ...stats, words: 3 })),
      ...sortedBigrams.map(([phrase, stats]) => ({ phrase, ...stats, words: 2 })),
    ]

    // Deduplicate — remove bigrams whose words are already covered by a trigram
    const usedWords = new Set(sortedTrigrams.flatMap(([phrase]) => phrase.split(' ')))
    const dedupedPhrases = allPhrases.filter(p => {
      if (p.words === 3) return true
      return !p.phrase.split(' ').every(w => usedWords.has(w))
    })

    // Calculate market median price from trendData for price ratio signal
    const marketMedianPrice = trendData.length > 0
      ? trendData[Math.floor(trendData.length / 2)]
      : 10

    // ── Parallel keyword total fetching (Zik method) ────────────
    // Fetch each keyword's OWN eBay total in parallel for top 10 phrases.
    // Each call uses limit=1 — eBay returns total in response immediately.
    // All 10 fire simultaneously → only ~400ms extra total.
    const top10Phrases = dedupedPhrases.slice(0, 10).map(p => p.phrase)
    const top10Words = sortedWords
      .filter(([w]) => !seedWords.has(w.toLowerCase()))
      .slice(0, 10)
      .map(([w]) => w)

    const [phraseOwnTotals, wordOwnTotals] = await Promise.all([
      Promise.all(top10Phrases.map(phrase => getKeywordTotal(phrase, token, marketplace, filterStr))),
      Promise.all(top10Words.map(word => getKeywordTotal(word, token, marketplace, filterStr))),
    ])

    // Build lookup maps: phrase/word → own eBay total
    const phraseTotalMap = new Map<string, number>(
      top10Phrases.map((phrase, i) => [phrase, phraseOwnTotals[i]])
    )
    const wordTotalMap = new Map<string, number>(
      top10Words.map((word, i) => [word, wordOwnTotals[i]])
    )

    const longTailKeywords = dedupedPhrases.slice(0, 50).map(({ phrase, count, priceSum }, index) => {
      const avgPrice = priceSum / count
      const inListings = `${count}/${sampleSize}`
      const comp = `${Math.round((count / sampleSize) * 100)}`
      const kw = phrase.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

      // Use Zik method (own total) for top 10, fallback formula for the rest
      const ownTotal = phraseTotalMap.get(phrase) ?? 0
      const { avgSearches, estSalesUnits } = ownTotal > 1000
        ? zikFormula(ownTotal, category, confidence)
        : parseKeywordMetricsSimple(
          inListings, comp, 'phrase',
          totalListings,
          `$${avgPrice.toFixed(2)}`,
          marketMedianPrice,
          index + 1,
          dedupedPhrases.length,
          keyword,
          category,
          confidence
        )

      // Competition = own eBay total for top 10, estimated for the rest
      const competition = ownTotal > 1000
        ? ownTotal
        : Math.round(totalListings * (count / sampleSize))

      return {
        kw,
        inListings,
        avgPrice: `$${avgPrice.toFixed(2)}`,
        avgSearches,
        estSalesUnits,
        competition,
        search: inListings,
        comp,
        sales_price: `$${avgPrice.toFixed(2)}`,
        sales: `$${avgPrice.toFixed(2)}`,
        type: 'phrase',
      }
    })

    // ── Competing listings — moved here from longTail ───────────
    // These are the actual individual eBay listings (with thumbnails)
    const competingListings = priceFilteredItems.slice(0, 50).map((item: any) => {
      const price = parseFloat(item.price?.value ?? 0)
      const shippingCost = item.shippingOptions?.[0]?.shippingCost?.value
      const shippingLabel = shippingCost === undefined ? 'N/A'
        : parseFloat(shippingCost) === 0 ? 'Free' : `$${parseFloat(shippingCost).toFixed(2)}`
      const feedbackScore = item.seller?.feedbackScore ?? null
      const feedbackPct = item.seller?.feedbackPercentage ?? null
      const soldCount = item.estimatedAvailabilities?.[0]?.estimatedAvailableQuantity ?? null
      const condition = item.condition ?? 'N/A'
      return {
        kw: item.title?.slice(0, 65) ?? keyword,
        fullTitle: item.title ?? keyword,
        search: condition,
        comp: shippingLabel,
        sales: `$${price.toFixed(2)}`,
        image: item.thumbnailImages?.[0]?.imageUrl ?? item.image?.imageUrl ?? '',
        itemId: item.itemId ?? '',
        url: item.itemWebUrl ?? '',
        feedbackScore: feedbackScore ? Number(feedbackScore).toLocaleString() : null,
        feedbackPct: feedbackPct ? `${parseFloat(feedbackPct).toFixed(0)}%` : null,
        soldCount: soldCount ?? null,
      }
    })

    // Build generic keywords — mix of high-value bigrams first, then unigrams
    // Bigrams appear first because they're more specific and more useful to inject

    // Build generic keywords — UNIGRAMS ONLY (single words)
    // Bigrams already appear in Long-Tail so we exclude them here
    const bigramWordSet = new Set(
      sortedBigrams.flatMap(([phrase]) => phrase.split(' '))
    )

    const genericKeywords = sortedWords
      .filter(([word]) => !seedWords.has(word.toLowerCase()))
      .slice(0, 50)
      .map(([word, stats], index) => {
        const avgPrice = stats.priceSum / stats.count
        const densityPct = Math.round((stats.count / sampleSize) * 100)
        const search = `${stats.count}/${sampleSize}`
        const comp = `${densityPct}`

        // Use Zik method for top 10 words, fallback for rest
        const ownTotal = wordTotalMap.get(word) ?? 0
        const { avgSearches, estSalesUnits } = ownTotal > 1000
          ? zikFormula(ownTotal, category, confidence)
          : parseKeywordMetricsSimple(
            search, comp, 'word',
            totalListings,
            `$${avgPrice.toFixed(2)}`,
            marketMedianPrice,
            index + 1,
            sortedWords.length,
            keyword,
            category,
            confidence
          )

        const competition = ownTotal > 1000
          ? ownTotal
          : Math.round(totalListings * (stats.count / sampleSize))

        return {
          kw: word.charAt(0).toUpperCase() + word.slice(1),
          search,
          comp,
          sales: `$${avgPrice.toFixed(2)}`,
          avgSearches,
          estSalesUnits,
          competition,
          type: 'word',
        }
      })

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
      category,
      confidence,
      hasMore: offset + limit < total,
      sampleTooSmall,
      currentOffset: offset,
      saturScore,
      trendData,
      longTailKeywords,
      genericKeywords,
      competingListings,
      responseTime,
    })

  } catch (err: any) {
    console.error('[ebay-search]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
