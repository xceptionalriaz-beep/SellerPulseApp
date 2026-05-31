// lib/services/competitorService.ts
// Converted 1:1 from lib/pages/competitor_research/services/competitor_service.dart

import { createClient } from '@/lib/supabase'

const supabase = createClient()

// ─────────────────────────────────────────────
// MODELS
// ─────────────────────────────────────────────

export interface StoreOverview {
  username:         string
  storeName:        string | null
  feedbackScore:    number
  feedbackPercent:  number
  activeListings:   number
  totalSold:        number
  estimatedRevenue: number
  avgPrice:         number
  sellThroughRate:  number
  country:          string | null
  memberSince:      string | null
  storeUrl:         string | null
}

export interface ScannedProduct {
  itemId:           string
  title:            string
  price:            number
  soldCount:        number
  revenue:          number
  sellThrough:      number
  imageUrl:         string | null
  category:         string | null
  condition:        string
  freeShipping:     boolean
  watchCount:       number
  listingType:      string
  trend:            'rising' | 'stable' | 'fading'
  opportunityScore: number
  ebayUrl:          string | null
  topKeywords:      string[]
}

export interface GapProduct {
  title:           string
  category:        string
  estimatedDemand: number
  reason:          string
}

export interface StoreScanResult {
  scanId:      string
  overview:    StoreOverview
  products:    ScannedProduct[]
  gaps:        GapProduct[]
  topKeywords: string[]
  scannedAt:   Date
}

// ─────────────────────────────────────────────
// STATIC HELPERS
// ─────────────────────────────────────────────

export function extractKeywords(title: string): string[] {
  const stopWords = new Set([
    'for','the','and','with','new','used','lot','set','pack','pcs',
    'piece','pieces','inch','free','shipping','fast','buy','sale',
    'best','top','quality','great','original','genuine','authentic',
    'vintage','rare','nice','good',
  ])
  return [...new Set(
    title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .filter(w => w.length > 3 && !stopWords.has(w))
  )].slice(0, 8)
}

export function calculateOpportunityScore({ sold, revenue, sellThrough, watchCount, price }: {
  sold: number; revenue: number; sellThrough: number; watchCount: number; price: number
}): number {
  let score = 0
  if      (sold >= 100) score += 30
  else if (sold >= 50)  score += 22
  else if (sold >= 20)  score += 15
  else if (sold >= 5)   score += 8
  else                  score += 2
  if      (revenue >= 5000) score += 25
  else if (revenue >= 1000) score += 18
  else if (revenue >= 500)  score += 12
  else if (revenue >= 100)  score += 6
  else                      score += 2
  if      (sellThrough >= 80) score += 25
  else if (sellThrough >= 60) score += 18
  else if (sellThrough >= 40) score += 12
  else if (sellThrough >= 20) score += 6
  else                        score += 2
  if      (watchCount >= 50) score += 10
  else if (watchCount >= 20) score += 7
  else if (watchCount >= 10) score += 4
  else                       score += 1
  if      (price >= 10 && price <= 80)  score += 10
  else if (price > 80 && price <= 150)  score += 6
  else                                   score += 2
  return Math.min(10, Math.max(1, Math.round((score / 100) * 9 + 1)))
}

export function calculateTrend(item: any): 'rising' | 'stable' | 'fading' {
  const sold      = item.soldQuantity     ?? 0
  const watches   = item.watchCount       ?? 0
  const available = item.availableQuantity ?? 1
  if (sold > 20 && watches > 10) return 'rising'
  if (sold < 3  && available > 10) return 'fading'
  return 'stable'
}

function estimateCategoryDemand(category: string): number {
  const d: Record<string,number> = {
    'Electronics':92,'Sporting Goods':78,'Home & Garden':85,
    'Health & Beauty':80,'Toys & Hobbies':74,
    'Clothing, Shoes & Accessories':88,'Collectibles':70,'Auto Parts':82,
  }
  return d[category] ?? 65
}

// ─────────────────────────────────────────────
// MAIN SERVICE
// ─────────────────────────────────────────────

export class CompetitorService {
  private static _instance: CompetitorService
  static getInstance(): CompetitorService {
    if (!CompetitorService._instance) CompetitorService._instance = new CompetitorService()
    return CompetitorService._instance
  }

  async scanStore(username: string): Promise<StoreScanResult> {
    try {
      const result = await supabase.functions.invoke('ebay-scan', { body: { username } })
      if (result.error) throw new Error(result.error.message)
      const data = result.data as any
      const o = data.overview as any
      const overview: StoreOverview = {
        username: o.username ?? username, storeName: o.storeName ?? null,
        feedbackScore: o.feedbackScore ?? 0, feedbackPercent: o.feedbackPercent ?? 0,
        activeListings: o.activeListings ?? 0, totalSold: o.totalSold ?? 0,
        estimatedRevenue: o.estimatedRevenue ?? 0, avgPrice: o.avgPrice ?? 0,
        sellThroughRate: o.sellThroughRate ?? 0, country: o.country ?? null,
        memberSince: o.memberSince ?? null,
        storeUrl: o.storeUrl ?? `https://www.ebay.com/str/${username}`,
      }
      const products: ScannedProduct[] = (data.products as any[]).map(p => ({
        itemId: p.itemId ?? '', title: p.title ?? '',
        price: Number(p.price ?? 0), soldCount: p.soldCount ?? 0,
        revenue: Number(p.revenue ?? 0), sellThrough: Number(p.sellThrough ?? 0),
        imageUrl: p.imageUrl ?? null, category: p.category ?? null,
        condition: p.condition ?? 'Unknown', freeShipping: p.freeShipping ?? false,
        watchCount: p.watchCount ?? 0, listingType: p.listingType ?? 'FixedPrice',
        trend: p.trend ?? 'stable', opportunityScore: p.opportunityScore ?? 5,
        ebayUrl: p.ebayUrl ?? null,
        topKeywords: Array.isArray(p.topKeywords) ? p.topKeywords : [],
      }))
      const gaps: GapProduct[] = (data.gaps as any[]).map(g => ({
        title: g.title ?? '', category: g.category ?? '',
        estimatedDemand: Number(g.estimatedDemand ?? 0), reason: g.reason ?? '',
      }))
      const topKeywords: string[] = Array.isArray(data.topKeywords) ? data.topKeywords : []
      const scanId = await this._saveScanToSupabase({ overview, products, gaps, keywords: topKeywords })
      return { scanId, overview, products, gaps, topKeywords, scannedAt: new Date() }
    } catch (e) { console.error('CompetitorService.scanStore:', e); throw e }
  }

  runGapFinder(products: ScannedProduct[]): GapProduct[] {
    const sellerCats = new Set(products.map(p => p.category ?? '').filter(Boolean))
    const highDemand: Record<string,string> = {
      'Electronics':'High search volume, fast-moving items',
      'Sporting Goods':'Growing category, low competition',
      'Home & Garden':'Evergreen demand, high margins',
      'Health & Beauty':'Repeat buyers, strong sell-through',
      'Toys & Hobbies':'Seasonal spikes, great ROI',
      'Clothing, Shoes & Accessories':'High volume, easy to source',
      'Collectibles':'Passionate buyers, premium pricing',
      'Auto Parts':'High AOV, low return rate',
    }
    const gaps: GapProduct[] = []
    for (const [cat, reason] of Object.entries(highDemand)) {
      if (![...sellerCats].some(c => c.toLowerCase().includes(cat.toLowerCase()))) {
        gaps.push({ title:`${cat} products`, category:cat, estimatedDemand:estimateCategoryDemand(cat), reason })
      }
    }
    const catCounts: Record<string,number> = {}
    for (const p of products) if (p.category) catCounts[p.category] = (catCounts[p.category] ?? 0) + 1
    for (const [cat, count] of Object.entries(catCounts)) {
      if (count < 3) gaps.push({ title:`More ${cat} listings`, category:cat, estimatedDemand:65, reason:`Seller has only ${count} item(s) here — big room to expand` })
    }
    return gaps.slice(0, 6)
  }

  extractTopKeywords(products: ScannedProduct[]): string[] {
    const freq: Record<string,number> = {}
    for (const p of products) for (const kw of p.topKeywords) freq[kw] = (freq[kw] ?? 0) + 1
    return Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,20).map(e => e[0])
  }

  private async _saveScanToSupabase({ overview, products, gaps, keywords }: {
    overview: StoreOverview; products: ScannedProduct[]; gaps: GapProduct[]; keywords: string[]
  }): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    const { data: scan } = await (supabase.from('store_scans') as any).insert({
      user_id: user.id, scanned_at: new Date().toISOString(), top_keywords: keywords,
      username: overview.username, store_name: overview.storeName,
      feedback_score: overview.feedbackScore, feedback_percent: overview.feedbackPercent,
      active_listings: overview.activeListings, total_sold: overview.totalSold,
      estimated_revenue: overview.estimatedRevenue, avg_price: overview.avgPrice,
      sell_through_rate: overview.sellThroughRate, country: overview.country,
      member_since: overview.memberSince, store_url: overview.storeUrl,
    }).select('id').single()
    const scanId = (scan as any).id.toString()
    if (products.length > 0) {
      await (supabase.from('scanned_products') as any).insert(products.map(p => ({
        scan_id:p.itemId, item_id:p.itemId, title:p.title, price:p.price,
        sold_count:p.soldCount, revenue:p.revenue, sell_through:p.sellThrough,
        image_url:p.imageUrl, category:p.category, condition:p.condition,
        free_shipping:p.freeShipping, watch_count:p.watchCount,
        listing_type:p.listingType, trend:p.trend,
        opportunity_score:p.opportunityScore, ebay_url:p.ebayUrl,
        top_keywords:p.topKeywords,
      })))
    }
    if (gaps.length > 0) {
      await (supabase.from('scan_gaps') as any).insert(gaps.map(g => ({
        scan_id:scanId, title:g.title, category:g.category,
        estimated_demand:g.estimatedDemand, reason:g.reason,
      })))
    }
    return scanId
  }

  async loadScanHistory(): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data } = await (supabase.from('store_scans') as any)
      .select('id,username,store_name,scanned_at,estimated_revenue,total_sold')
      .eq('user_id', user.id).order('scanned_at', { ascending: false }).limit(20)
    return (data ?? []) as any[]
  }

  async loadScanById(scanId: string): Promise<any|null> {
    const { data: scan } = await (supabase.from('store_scans') as any).select('*').eq('id', scanId).maybeSingle()
    if (!scan) return null
    const { data: products } = await (supabase.from('scanned_products') as any).select('*').eq('scan_id', scanId).order('opportunity_score', { ascending: false })
    const { data: gaps }     = await (supabase.from('scan_gaps') as any).select('*').eq('scan_id', scanId)
    return { scan, products: products ?? [], gaps: gaps ?? [] }
  }

  async saveToListingIdeas(product: ScannedProduct): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await (supabase.from('listing_ideas') as any).upsert({
      user_id:user.id, item_id:product.itemId, title:product.title,
      price:product.price, sold_count:product.soldCount, revenue:product.revenue,
      image_url:product.imageUrl, opportunity_score:product.opportunityScore,
      top_keywords:product.topKeywords, ebay_url:product.ebayUrl,
      saved_at:new Date().toISOString(),
    })
  }

  async removeFromListingIdeas(itemId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await (supabase.from('listing_ideas') as any).delete().eq('user_id', user.id).eq('item_id', itemId)
  }

  async loadListingIdeas(): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data } = await (supabase.from('listing_ideas') as any).select('*').eq('user_id', user.id).order('saved_at', { ascending: false })
    return (data ?? []) as any[]
  }

  async addToWatchlist(store: StoreOverview): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await (supabase.from('watchlist') as any).upsert({
      user_id:user.id, username:store.username, store_name:store.storeName,
      added_at:new Date().toISOString(), last_revenue:store.estimatedRevenue, last_sold:store.totalSold,
    })
  }

  async removeFromWatchlist(username: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await (supabase.from('watchlist') as any).delete().eq('user_id', user.id).eq('username', username)
  }

  async loadWatchlist(): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data } = await (supabase.from('watchlist') as any).select('*').eq('user_id', user.id).order('added_at', { ascending: false })
    return (data ?? []) as any[]
  }

  async isOnWatchlist(username: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { data } = await (supabase.from('watchlist') as any).select('id').eq('user_id', user.id).eq('username', username).maybeSingle()
    return data !== null
  }
}

export const competitorService = CompetitorService.getInstance()