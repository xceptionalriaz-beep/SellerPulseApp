// src/utils/keywordParser.ts
// ─────────────────────────────────────────────────────────────────────────────
// Advanced Multi-Signal Keyword Estimation Engine v3
// Now with category-specific multipliers for accurate per-market estimates.
// ─────────────────────────────────────────────────────────────────────────────

import { EbayCategory, CATEGORY_PROFILES } from './categoryDetector'

export interface KeywordMetricsInput {
    search: string
    comp: string
    type: string
    avgPrice: string
    totalListings: number
    marketMedianPrice: number
    rankPosition: number
    totalKeywords: number
    seedKeyword: string
    category: EbayCategory
    confidence: 'high' | 'medium' | 'low' | 'none'
}

// ── Zik Formula — used when keyword's own eBay total is available ─────────────
// Calibrated: BeefFlavor 2.1M listings → 4,200 searches (Zik = 4,196) ✓
export function zikFormula(
    keywordOwnTotal: number,
    category: EbayCategory = 'default',
    confidence: 'high' | 'medium' | 'low' | 'none' = 'high'
): { avgSearches: number; estSalesUnits: number } {

    const profile = CATEGORY_PROFILES[category]

    // Confidence scales the category multiplier
    const confidenceScale = confidence === 'high' ? 1.0
        : confidence === 'medium' ? 0.75
            : confidence === 'low' ? 0.50
                : 1.0  // none → use full default

    const effectiveSearchMult = confidence === 'none'
        ? CATEGORY_PROFILES.default.searchMultiplier
        : profile.searchMultiplier * confidenceScale + CATEGORY_PROFILES.default.searchMultiplier * (1 - confidenceScale)

    const effectiveConvRate = confidence === 'none'
        ? CATEGORY_PROFILES.default.conversionRate
        : profile.conversionRate * confidenceScale + CATEGORY_PROFILES.default.conversionRate * (1 - confidenceScale)

    const avgSearches = Math.max(10, Math.round(keywordOwnTotal * 0.002 * effectiveSearchMult))
    const estSalesUnits = Math.max(1, Math.round(keywordOwnTotal * effectiveConvRate))

    return { avgSearches, estSalesUnits }
}

// ── 7-Signal Fallback Formula — used when own total is unavailable ────────────
export function parseKeywordMetrics(
    input: KeywordMetricsInput
): { avgSearches: number; estSalesUnits: number } {

    const {
        search, comp, type, avgPrice,
        totalListings, marketMedianPrice,
        rankPosition, totalKeywords,
        category, confidence
    } = input

    const profile = CATEGORY_PROFILES[category]
    const confidenceScale = confidence === 'high' ? 1.0 : confidence === 'medium' ? 0.75 : confidence === 'low' ? 0.50 : 1.0
    const effectiveSearchM = confidence === 'none' ? CATEGORY_PROFILES.default.searchMultiplier
        : profile.searchMultiplier * confidenceScale + CATEGORY_PROFILES.default.searchMultiplier * (1 - confidenceScale)
    const effectiveConvR = confidence === 'none' ? CATEGORY_PROFILES.default.conversionRate
        : profile.conversionRate * confidenceScale + CATEGORY_PROFILES.default.conversionRate * (1 - confidenceScale)

    // Signal 1: Density ratio
    const matches = search?.match(/^(\d+)\/(\d+)$/)
    const count = matches ? parseInt(matches[1], 10) : 1
    const sampleSize = matches ? parseInt(matches[2], 10) : 50
    const R = sampleSize > 0 ? count / sampleSize : 0.02

    // Signal 2: Intent type
    const W_intent = type === 'phrase' ? 1.25 : 0.90

    // Signal 3: Market size tier
    let marketTier: number
    if (totalListings >= 1_000_000) marketTier = 0.15
    else if (totalListings >= 100_000) marketTier = 0.12
    else if (totalListings >= 10_000) marketTier = 0.10
    else marketTier = 0.07

    // Signal 4: Price ratio
    const kPrice = parseFloat(avgPrice.replace(/[^0-9.]/g, '')) || marketMedianPrice
    const priceRatio = kPrice / (marketMedianPrice > 0 ? marketMedianPrice : kPrice)
    const W_price = priceRatio < 0.5 ? 1.40 : priceRatio < 0.75 ? 1.20 : priceRatio < 1.25 ? 1.00 : priceRatio < 2.0 ? 0.80 : 0.60

    // Signal 5: Rank boost
    const rankRatio = totalKeywords > 1 ? (rankPosition - 1) / (totalKeywords - 1) : 0
    const W_rank = 1.8 - (rankRatio * 1.2)

    // Signal 6: Competition
    const compNum = parseInt(comp, 10) || 0
    const C = 1 + (compNum / 100) * 0.25

    // Signal 7: Category multiplier
    const base = totalListings * marketTier
    const avgSearches = Math.round(R * base * W_intent * W_price * W_rank * C * effectiveSearchM)
    const estSalesUnits = Math.max(1, Math.round(avgSearches * effectiveConvR))

    return {
        avgSearches: Math.max(10, avgSearches),
        estSalesUnits: Math.max(1, estSalesUnits),
    }
}

// ── Convenience wrapper ───────────────────────────────────────────────────────
export function parseKeywordMetricsSimple(
    search: string,
    comp: string,
    type: string,
    totalListings: number = 10000,
    avgPrice: string = '$10.00',
    marketMedianPrice: number = 10,
    rankPosition: number = 25,
    totalKeywords: number = 50,
    seedKeyword: string = '',
    category: EbayCategory = 'default',
    confidence: 'high' | 'medium' | 'low' | 'none' = 'none'
): { avgSearches: number; estSalesUnits: number } {
    return parseKeywordMetrics({
        search, comp, type, avgPrice,
        totalListings, marketMedianPrice,
        rankPosition, totalKeywords, seedKeyword,
        category, confidence
    })
}

// ── Formatters ────────────────────────────────────────────────────────────────
export function formatSearches(n: number): string {
    return n.toLocaleString()
}

export function formatSales(n: number): string {
    return n.toLocaleString()
}
