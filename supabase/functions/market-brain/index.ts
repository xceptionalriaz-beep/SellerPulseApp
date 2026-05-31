// @ts-nocheck
// supabase/functions/market-brain/index.ts
// Converted 1:1 from lib/core/services/market_brain_service.dart
// Handles: Cache check → eBay fetch → VeRO scan → Cache save

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oZ2VqZXd3c25ieW91b3p5bWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNDk3MzksImV4cCI6MjA4OTgyNTczOX0.QytlMBqIV74V5HV1vrVMjDERyY2E9-YUgSp3QoXDbgA'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, page = 1, filters } = await req.json()
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const cleanQuery = query.toLowerCase().trim()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // ── Get user from auth header ─────────────────────────────
    const authHeader = req.headers.get('Authorization') ?? ''
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))

    // ── Check active filters ──────────────────────────────────
    // matches Dart hasActiveFilters logic
    const hasActiveFilters = filters && (
      filters.marketplace !== 'US' ||
      filters.shipFrom    !== 'Any' ||
      filters.minPrice    != null   ||
      filters.maxPrice    != null   ||
      filters.minFeedback  > 0      ||
      filters.maxFeedback  < 500    ||
      filters.condition   !== 'Any' ||
      filters.listingType !== 'Fixed'||
      filters.minSales     > 0
    )

    // ══════════════════════════════════════════════════════════
    // ⚡ PHASE 1: CACHE INTERCEPTOR
    // matches Dart Phase 1 cache check
    // ══════════════════════════════════════════════════════════
    if (page === 1 && !hasActiveFilters) {
      try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { data: cachedData } = await supabase
          .from('market_cache')
          .select()
          .eq('search_query', cleanQuery)
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (cachedData) {
          console.log(`⚡ CACHE HIT: Loaded '${cleanQuery}' instantly!`)

          // matches Dart: build FlSpot list from trend_data
          const cachedSpots = (cachedData.trend_data as any[]).map((e: any, i: number) => ({
            x: e.x ?? i,
            y: e.y ?? 0,
          }))

          // matches Dart: safe cached products with fallback fields
          const safeCachedProducts = (cachedData.products as any[]).map((p: any) => ({
            ...p,
            ai_velocity: p.ai_velocity ?? 0.0,
            risk_score:  p.risk_score  ?? 'Medium',
            demand_heat: p.demand_heat ?? 0.05,
            isVero:      p.isVero      ?? false,
            veroMatches: p.veroMatches ?? [],
          }))

          return new Response(JSON.stringify({
            nicheTotalActive:    cachedData.total_active,
            nicheAvgPrice:       cachedData.avg_price,
            nicheMarketVol:      cachedData.market_vol,
            nicheSuccessRate:    cachedData.success_rate,
            nicheSuccessColor:   cachedData.success_color,
            nicheSaturationScore:cachedData.saturation_score,
            nicheAdInsight:      cachedData.ad_insight,
            historicalSalesData: cachedSpots,
            liveProducts:        safeCachedProducts,
            fromCache:           true,
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
      } catch (e) {
        console.warn(`⚠️ Cache read failed, proceeding to fresh fetch: ${e}`)
      }
    }

    // ══════════════════════════════════════════════════════════
    // 🐢 PHASE 2: FRESH FETCH via ebay-search edge function
    // matches Dart: supabase.functions.invoke('ebay-search', body: requestBody)
    // ══════════════════════════════════════════════════════════
    const requestBody: any = { query, page }
    if (hasActiveFilters && filters) requestBody.filters = filters

    const ebayRes = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/ebay-search`,
      {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify(requestBody),
      }
    )

    const data = ebayRes.ok ? await ebayRes.json() : {}

    if (data.error) throw new Error(data.error)

    const itemSummaries: any[]  = data.itemSummaries ?? []
    const totalEbayListings: number = parseInt(data.total?.toString() ?? '0') || 0
    const dynamicTrend: any[]  = data.historicalTrend ?? []

    // ── Build trend data (matches Dart FlSpot list) ───────────
    let newTrendData: { x: number; y: number }[] = []

    if (dynamicTrend.length > 0) {
      newTrendData = dynamicTrend.map((e: any, i: number) => ({
        x: i,
        y: parseFloat(e.volume?.toString() ?? '0'),
      }))
    } else {
      // matches Dart seeded fallback trend
      const seed = [...cleanQuery].reduce((a, c) => a + c.charCodeAt(0), 0)
      let s = seed
      const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }

      const baseDailySales = (totalEbayListings * 0.05) / 30
      for (let i = 0; i <= 30; i++) {
        const noise       = (rand() - 0.5) * 0.7
        const trendFactor = rand() > 0.5 ? 1.15 : 0.85
        const dailyValue  = (baseDailySales + baseDailySales * noise) * (1 + i * 0.01 * (trendFactor - 1))
        newTrendData.push({ x: i, y: Math.max(0, dailyValue) })
      }
    }

    // ── STR & sentiment (matches Dart calculatedSTR logic) ────
    let baseStr = totalEbayListings < 1000 ? 60.0 : totalEbayListings > 50000 ? 15.0 : 35.0
    const seedN = [...cleanQuery].reduce((a, c) => a + c.charCodeAt(0), 0)
    let s2 = seedN
    const rand2 = () => { s2 = (s2 * 1664525 + 1013904223) >>> 0; return s2 / 4294967296 }
    const calculatedSTR = Math.min(95, Math.max(5, baseStr + (rand2() - 0.5) * 20))

    const firstVal    = newTrendData.length > 0 ? newTrendData[0].y       : 0
    const lastVal2    = newTrendData.length > 0 ? newTrendData[newTrendData.length-1].y : 0
    const isTrendingUp = lastVal2 > firstVal

    // matches Dart sentiment labels exactly
    let sentimentLabel: string
    let successColor:   string
    if (isTrendingUp && calculatedSTR > 50) {
      sentimentLabel = '🚀 STRONG BULLISH';  successColor = 'FF16A34A'
    } else if (!isTrendingUp && calculatedSTR < 25) {
      sentimentLabel = '⚠️ HIGH RISK (Saturated)'; successColor = 'FFDC2626'
    } else if (isTrendingUp && calculatedSTR < 40) {
      sentimentLabel = '📈 SPECULATIVE GROWTH';    successColor = 'FF2563EB'
    } else {
      sentimentLabel = '⚖️ NEUTRAL / STEADY';       successColor = 'FF475569'
    }

    const densityScore = Math.min(95, Math.max(5, 100 - calculatedSTR))

    // matches Dart insight strings exactly
    let insight: string
    if (densityScore > 75)      insight = 'High Saturation. Est. 12-15% Ad Rate needed to rank.'
    else if (densityScore > 40) insight = 'Moderate Competition. Est. 5-8% Ad Rate needed.'
    else                        insight = 'Low Competition. Organic ranking highly possible.'

    // ── Price calculations (matches Dart totalPrice / validPrices) ──
    let totalPrice = 0, validPrices = 0
    for (const item of itemSummaries) {
      const val = parseFloat(item.price?.value?.toString() ?? '0')
      if (val > 0) { totalPrice += val; validPrices++ }
    }
    const calculatedAvgPrice  = validPrices > 0 ? totalPrice / validPrices : 0
    const calculatedMarketVol = calculatedAvgPrice * totalEbayListings * 0.10

    // ── Format helpers (matches Dart NumberFormat) ────────────
    const formatCurrency = (n: number) => `$${n.toFixed(2)}`
    const formatCompact  = (n: number) => {
      if (n >= 1000000) return `$${(n/1000000).toFixed(1)}M`
      if (n >= 1000)    return `$${(n/1000).toFixed(0)}K`
      return `$${Math.round(n)}`
    }
    const formatDecimal  = (n: number) => n.toLocaleString('en-US')

    // ══════════════════════════════════════════════════════════
    // 🧠 PRODUCT MAPPING & INTELLIGENCE INJECTION
    // matches Dart mappedProducts logic exactly
    // ══════════════════════════════════════════════════════════
    const mappedProducts = itemSummaries.map((item: any) => {
      const priceData    = item.price
      const imageData    = item.image
      const sellerData   = item.seller
      const locationData = item.itemLocation

      const itemId    = item.itemId?.toString() ?? item.itemWebUrl?.toString() ?? `id_${Math.floor(Math.random()*9999999)}`
      const sellerName= sellerData?.username?.toString() ?? 'Unknown'
      const feedback  = parseFloat(sellerData?.feedbackScore?.toString() ?? '0') || 0
      const itemLoc   = locationData?.country?.toString() ?? 'N/A'
      const sellerLoc = sellerData?.registeredCountry?.toString() ?? itemLoc
      const soldCount = parseInt(item.soldQuantity?.toString() ?? '0') || 0
      const watchers  = parseInt(item.watchCount?.toString()  ?? '0') || 0

      let catPath = 'Unknown'
      if (item.categories?.length > 0) {
        catPath = item.categories[0].categoryName?.toString() ?? 'Unknown'
      }

      return {
        itemId,
        title:                   item.title?.toString() ?? 'Unknown Product',
        image:                   imageData?.imageUrl?.toString() ?? 'https://via.placeholder.com/150',
        sales:                   `$${priceData?.value?.toString() ?? '0.00'}`,
        itemWebUrl:               item.itemWebUrl?.toString(),
        sellerUsername:           sellerName,
        sellerFeedbackScore:      feedback,
        itemLocationCountry:      itemLoc,
        sellerRegisteredCountry:  sellerLoc,
        totalActiveListings:      0,
        totalSold:                soldCount,
        lastSoldDate:             item.lastItemUpdateTime?.toString() ?? item.lastSoldDate?.toString() ?? null,
        watchCount:               watchers,
        isVero:                   false,
        veroMatches:              [],
        category:                 catPath,
        trend:                    'stable',
        upc:                      item.gtin?.toString() ?? null,
        ai_velocity:              parseFloat(item.ai_velocity?.toString() ?? '0') || 0.0,
        risk_score:               item.risk_score?.toString() ?? 'Medium',
        demand_heat:              parseFloat(item.demand_heat?.toString() ?? '0.05') || 0.05,
      }
    })

    // ══════════════════════════════════════════════════════════
    // ✨ VERO SCANNER 3.0
    // matches Dart VeRO Scanner Multi-Match logic exactly
    // ══════════════════════════════════════════════════════════
    try {
      const { data: veroData } = await supabase
        .from('vero_brands')
        .select('brand_name, keywords, risk_level')

      if (veroData) {
        for (const item of mappedProducts) {
          const title   = (item.title ?? '').toLowerCase()
          const matches: any[] = []

          for (const entry of veroData) {
            const brand    = entry.brand_name?.toLowerCase().trim() ?? ''
            const keywords = entry.keywords?.toLowerCase() ?? ''
            let triggeredWord: string | null = null

            if (brand && title.includes(brand)) {
              triggeredWord = brand
            } else if (keywords) {
              for (const kw of keywords.split(',').map((k: string) => k.trim())) {
                if (kw && title.includes(kw)) { triggeredWord = kw; break }
              }
            }

            if (triggeredWord && !matches.some((m: any) => m.brand_name === entry.brand_name)) {
              matches.push({
                brand_name:     entry.brand_name?.toString() ?? 'Unknown',
                severity:       entry.risk_level?.toString() ?? 'High Risk',
                triggered_word: triggeredWord,
              })
            }
          }

          item.veroMatches = matches
        }
      }
    } catch (e) {
      console.error(`🚨 VERO SCANNER ERROR: ${e}`)
    }

    // ── Build result (matches Dart MarketResearchResult) ──────
    const result = {
      nicheTotalActive:    `${formatDecimal(totalEbayListings)}+ listings`,
      nicheAvgPrice:       formatCurrency(calculatedAvgPrice),
      nicheMarketVol:      formatCompact(calculatedMarketVol),
      nicheSuccessRate:    `${calculatedSTR.toFixed(1)}% (${sentimentLabel})`,
      nicheSuccessColor:   successColor,
      nicheSaturationScore:densityScore,
      nicheAdInsight:      insight,
      historicalSalesData: newTrendData,
      liveProducts:        mappedProducts,
      fromCache:           false,
    }

    // ══════════════════════════════════════════════════════════
    // 💾 PHASE 3: SAVE TO CACHE
    // matches Dart Phase 3 cache save
    // ══════════════════════════════════════════════════════════
    if (page === 1 && !hasActiveFilters) {
      try {
        await supabase.from('market_cache').insert({
          user_id:         user?.id ?? null,
          search_query:    cleanQuery,
          total_active:    result.nicheTotalActive,
          avg_price:       result.nicheAvgPrice,
          market_vol:      result.nicheMarketVol,
          success_rate:    result.nicheSuccessRate,
          success_color:   result.nicheSuccessColor,
          saturation_score:result.nicheSaturationScore,
          ad_insight:      result.nicheAdInsight,
          trend_data:      result.historicalSalesData.map((e: any) => ({ x: e.x, y: e.y })),
          products:        result.liveProducts,
        })
        console.log(`💾 CACHE SAVED: '${cleanQuery}'`)
      } catch (e) {
        console.warn(`⚠️ Cache write failed: ${e}`)
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})