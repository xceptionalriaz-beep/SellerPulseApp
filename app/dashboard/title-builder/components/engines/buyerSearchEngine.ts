// ── buyerSearchEngine.ts ──────────────────────────────────────────────────────
// Step 5 of the Title Engine Learning Path: Learn What Buyers Actually Search
//
// Purpose:
//   Takes the LIVE keyword data from the eBay API (genericKeywords +
//   longTailKeywords) and transforms it into actionable intelligence for
//   the spin engine. Instead of guessing what buyers search, the engine
//   now KNOWS — from real eBay data for this exact product.
//
// How it works:
//   1. Score every keyword by search volume × in-listing frequency
//   2. Filter out filler, spec-only words, shipping words
//   3. Rank into tiers: POWER (inject first), FILL (inject if space), SKIP
//   4. Detect what's missing from the current title
//   5. Build a prioritised injection queue
//   6. Score the current title against live data
//   7. Detect keyword clusters (groups of related terms)
//   8. Detect seasonal/trend signals
//   9. Detect buyer intent (gift/compatible/bundle/size/colour)
//  10. Mobile optimisation — what should be in first 33 chars
// ─────────────────────────────────────────────────────────────────────────────

import { isFillerWithContext, FILLER_SAFE_LIST } from './fillerWords'
import { findProductNoun } from './productNouns'


export interface RawKeyword {
    kw: string
    search: string   // "2.3K" or "1,200" format
    comp: string   // "72%" in listings
    avgSearches?: number   // raw number if available
}

export interface ScoredKeyword {
    kw: string
    searchVol: number   // normalised 0-10000
    inListings: number   // 0-100 percentage
    score: number   // composite priority score
    tier: 'POWER' | 'FILL' | 'SKIP'
    inTitle: boolean  // already in current title?
    wordCount: number   // 1 = single, 2+ = phrase
    intent: BuyerIntent  // what this keyword signals
}

// ── Buyer intent types ────────────────────────────────────────────────────────
export type BuyerIntent =
    | 'gift'        // buying for someone else
    | 'compatible'  // needs to fit/work with something
    | 'bundle'      // wants multiple items
    | 'size'        // size-specific search
    | 'colour'      // colour-specific search
    | 'condition'   // new/used/refurb preference
    | 'function'    // specific use case
    | 'brand'       // brand-loyal buyer
    | 'material'    // material-specific search
    | 'age'         // age-group specific
    | 'seasonal'    // seasonal/trend buyer
    | 'general'     // no specific intent

// ── Keyword cluster type ──────────────────────────────────────────────────────
export interface KeywordCluster {
    theme: string        // cluster name
    keywords: string[]     // keywords in this cluster
    totalScore: number     // combined score
    topKw: string       // highest scoring keyword
}

export interface BuyerSearchResult {
    // Top keywords ranked by real buyer search data
    powerKeywords: ScoredKeyword[]   // must inject — high search + high listing %
    fillKeywords: ScoredKeyword[]   // inject if space — medium priority
    skipKeywords: ScoredKeyword[]   // already in title or not worth adding

    // What's missing from the current title (ranked)
    missingPower: string[]          // high-value missing keywords
    missingFill: string[]          // medium-value missing keywords

    // Current title quality vs live data
    coverageScore: number            // 0-100 how many power keywords are in title
    topSearchTerms: string[]          // top 5 raw search terms buyers use
    dominantTheme: string            // what buyers are mostly searching for
    dominantIntent: BuyerIntent       // what most buyers want

    // Keyword clusters — groups of related terms
    clusters: KeywordCluster[]

    // Mobile optimisation — what should be in first 33 chars
    mobileKeywords: string[]          // highest priority keywords for mobile view

    // Seasonal/trend signals
    trendingKeywords: string[]        // keywords with unusually high search vol

    // Ready-to-use injection queue (no processing needed)
    injectionQueue: string[]          // ordered list — inject from start

    // eBay algorithm weights first words most heavily
    // This is the single best keyword to put at position 1
    firstPositionKeyword: string | null

    // Raw stats
    totalKeywords: number
    avgSearchVol: number
    avgInListings: number
    maxSearchVol: number            // highest single keyword search volume
}

// ── Parse search volume string → number ──────────────────────────────────────
// Handles: "2.3K", "1,200", "12K", "800", "450.5K" etc.
export function parseSearchVol(raw: string): number {
    if (!raw || raw === 'N/A' || raw === '-') return 0
    const clean = raw.replace(/,/g, '').trim()
    const match = clean.match(/^([\d.]+)\s*([KkMm]?)$/)
    if (!match) return 0
    const num = parseFloat(match[1])
    const suffix = match[2].toUpperCase()
    if (suffix === 'K') return Math.round(num * 1000)
    if (suffix === 'M') return Math.round(num * 1_000_000)
    return Math.round(num)
}

// ── Parse in-listings percentage → 0-100 number ──────────────────────────────
export function parseInListings(raw: string): number {
    if (!raw || raw === 'N/A' || raw === '-') return 0
    const match = raw.replace(/,/g, '').match(/^([\d.]+)/)
    if (!match) return 0
    return Math.min(100, parseFloat(match[1]))
}

// ── Detect buyer intent from a keyword ───────────────────────────────────────
function detectIntent(kw: string): BuyerIntent {
    const k = kw.toLowerCase()
    if (/gift|present|birthday|christmas|xmas|stocking|anniversary|valentine|mother|father|wedding/.test(k)) return 'gift'
    if (/compatible|fits|for|replacement|works with|suitable|adapter|connector/.test(k)) return 'compatible'
    if (/pack|set|kit|bundle|pair|combo|lot|multi|bulk|2x|3x/.test(k)) return 'bundle'
    if (/small|large|medium|mini|giant|xl|xs|xxl|size|inch|cm|mm|litre|ml/.test(k)) return 'size'
    if (/black|white|red|blue|green|pink|grey|gray|silver|gold|purple|yellow|orange|navy|beige/.test(k)) return 'colour'
    if (/new|used|refurbished|sealed|mint|graded|faulty|spares/.test(k)) return 'condition'
    if (/training|exercise|play|charging|cleaning|cooking|garden|office|outdoor|indoor/.test(k)) return 'function'
    if (/nike|adidas|apple|samsung|sony|dyson|lego|bosch|dewalt|makita/.test(k)) return 'brand'
    if (/leather|steel|wood|cotton|silicone|rubber|plastic|nylon|bamboo|ceramic/.test(k)) return 'material'
    if (/puppy|kitten|baby|toddler|adult|senior|kids|children|boys|girls|men|women/.test(k)) return 'age'
    if (/summer|winter|autumn|spring|christmas|halloween|easter|seasonal/.test(k)) return 'seasonal'
    return 'general'
}

// ── Score a keyword — composite of search volume + in-listing frequency ───────
function scoreKeyword(kw: ScoredKeyword): number {
    const volNorm = Math.min(kw.searchVol / 5000, 1) * 100
    const listingPct = kw.inListings
    const base = (volNorm * 0.6) + (listingPct * 0.4)
    const longBonus = kw.wordCount >= 2 ? 1.2 : 1.0
    const shortPenalty = kw.kw.length < 4 ? 0.85 : 1.0
    // High-value intents score higher — they signal strong buyer motivation
    // gift: buying for someone = higher purchase intent
    // compatible: needs to fit something specific = very targeted
    // bundle: wants more = higher AOV
    // size: very specific need = high conversion when matched
    const highValueIntents: BuyerIntent[] = ['gift', 'compatible', 'bundle', 'size']
    const intentBonus = highValueIntents.includes(kw.intent) ? 1.15 : 1.0
    return Math.round(base * longBonus * shortPenalty * intentBonus)
}

// ── Tier assignment based on score ───────────────────────────────────────────
function assignTier(score: number, searchVol: number, inListings: number): 'POWER' | 'FILL' | 'SKIP' {
    // Standard score-based tiers
    if (score >= 55 && searchVol >= 800 && inListings >= 20) return 'POWER'
    if (score >= 45 && searchVol >= 500 && inListings >= 30) return 'POWER'
    if (score >= 35 && searchVol >= 2000 && inListings >= 10) return 'POWER'
    // Edge: very high in-listing% even if search vol is low
    // e.g. 90% of listings use "USB-C" → must be POWER
    if (inListings >= 60 && searchVol >= 100) return 'POWER'
    if (inListings >= 40 && searchVol >= 200) return 'POWER'
    // Standard fill
    if (score >= 20 && (searchVol >= 200 || inListings >= 10)) return 'FILL'
    // Edge: low search but heavily used in listings
    if (inListings >= 25 && searchVol >= 50) return 'FILL'
    // Edge: high search vol but 0% in listings = opportunity gap, sellers missing it
    if (searchVol >= 3000 && inListings === 0) return 'FILL'
    return 'SKIP'
}

// ── Filter: should this keyword be considered for title injection? ────────────
function isUsableKeyword(kw: string, productNoun: string): boolean {
    const kwl = kw.toLowerCase().trim()

    // Too short to add value
    if (kwl.length < 3) return false

    // Pure number — no value
    if (/^\d+$/.test(kwl)) return false

    // Pure measurement spec like "2.5mm", "100W", "5V" — specs engine handles these
    if (/^\d+(\.\d+)?\s*(w|v|a|mm|cm|kg|lb|oz|ml|l|m|ft|inch|db|hz|mhz|ghz)$/i.test(kwl)) return false

    // Multi-word: if ALL words are pure numbers or measurements, skip
    const words = kwl.split(/\s+/)
    if (words.every(w => /^[\d.]+$/.test(w) || /^\d+(\.\d+)?(w|v|mm|cm|kg|hz|mhz|ghz)$/i.test(w))) return false

    // Is it pure filler? Skip — unless it's in the safe list
    if (isFillerWithContext(kwl, '', '') && !FILLER_SAFE_LIST.has(kwl)) return false

    // Skip if it's the product noun itself (already in title)
    if (productNoun && kwl === productNoun.toLowerCase()) return false

    // Skip shipping/delivery words
    if (/^(free|fast|quick|same|next|day|tracked|signed|royal|mail|evri|hermes|parcel|delivery|dispatch|postage|shipping|posted)$/i.test(kwl)) return false

    // Skip eBay policy-violating words
    if (/^(ebay|amazon|paypal|best|offer|buy|now|auction|bid|winning|feedback|seller)$/i.test(kwl)) return false

    return true
}

// ── Detect dominant search theme ─────────────────────────────────────────────
function detectDominantTheme(keywords: ScoredKeyword[]): string {
    const power = keywords.filter(k => k.tier === 'POWER').slice(0, 10)
    if (power.length === 0) return 'general'

    const themeSignals: Record<string, string[]> = {
        'gift': ['gift', 'present', 'birthday', 'christmas', 'stocking'],
        'compatible': ['compatible', 'fits', 'for', 'replacement', 'works with'],
        'interactive': ['interactive', 'smart', 'automatic', 'self', 'motion'],
        'size': ['small', 'large', 'medium', 'mini', 'giant', 'xl', 'xs'],
        'material': ['leather', 'steel', 'wood', 'cotton', 'silicone', 'rubber'],
        'colour': ['black', 'white', 'red', 'blue', 'green', 'pink', 'grey'],
        'function': ['training', 'exercise', 'play', 'charging', 'cleaning'],
        'bundle': ['pack', 'set', 'kit', 'bundle', 'pair', 'combo'],
        'condition': ['new', 'used', 'refurbished', 'sealed', 'mint'],
        'age': ['puppy', 'kitten', 'baby', 'adult', 'senior', 'kids'],
        'seasonal': ['summer', 'winter', 'christmas', 'halloween', 'easter'],
        'brand': ['genuine', 'oem', 'original', 'authentic', 'official'],
    }

    const scores: Record<string, number> = {}
    for (const kw of power) {
        const kwl = kw.kw.toLowerCase()
        for (const [theme, signals] of Object.entries(themeSignals)) {
            if (signals.some(s => kwl.includes(s))) {
                scores[theme] = (scores[theme] ?? 0) + kw.score
            }
        }
    }

    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
    return best ? best[0] : 'general'
}

// ── Detect dominant buyer intent across all power keywords ────────────────────
function detectDominantIntent(keywords: ScoredKeyword[]): BuyerIntent {
    const power = keywords.filter(k => k.tier === 'POWER')
    if (power.length === 0) return 'general'

    const intentCounts: Partial<Record<BuyerIntent, number>> = {}
    for (const kw of power) {
        intentCounts[kw.intent] = (intentCounts[kw.intent] ?? 0) + kw.score
    }

    const best = Object.entries(intentCounts)
        .sort((a, b) => (b[1] as number) - (a[1] as number))[0]

    return (best?.[0] as BuyerIntent) ?? 'general'
}

// ── Cluster keywords by theme ─────────────────────────────────────────────────
// Groups related keywords together so the engine can pick the best cluster
// instead of individual keywords — avoids injecting too many similar words.
function clusterKeywords(keywords: ScoredKeyword[]): KeywordCluster[] {
    const clusterDefs: Record<string, RegExp> = {
        'Gift Buyers': /gift|present|birthday|christmas|stocking|anniversary/i,
        'Size Specific': /small|large|medium|mini|giant|xl|xs|xxl|size/i,
        'Colour Search': /black|white|red|blue|green|pink|grey|gray|silver|gold|purple|navy/i,
        'Compatibility': /compatible|fits|for|replacement|works with|suitable/i,
        'Bundle/Value': /pack|set|kit|bundle|pair|combo|lot|multi|bulk/i,
        'Function/Use': /training|exercise|play|charging|cleaning|cooking|garden|outdoor/i,
        'Material': /leather|steel|wood|cotton|silicone|rubber|nylon|bamboo|ceramic/i,
        'Age/Target': /puppy|kitten|baby|toddler|adult|senior|kids|boys|girls|men|women/i,
        'Condition': /new|used|refurbished|sealed|mint|graded/i,
        'Brand Search': /genuine|oem|original|authentic|official|branded/i,
        'Seasonal': /summer|winter|autumn|spring|christmas|halloween|easter/i,
    }

    const clusters: KeywordCluster[] = []

    for (const [theme, pattern] of Object.entries(clusterDefs)) {
        const matching = keywords.filter(k => pattern.test(k.kw))
        if (matching.length === 0) continue

        const totalScore = matching.reduce((s, k) => s + k.score, 0)
        const topKw = matching.sort((a, b) => b.score - a.score)[0].kw

        clusters.push({
            theme,
            keywords: matching.map(k => k.kw),
            totalScore,
            topKw,
        })
    }

    return clusters.sort((a, b) => b.totalScore - a.totalScore)
}

// ── Detect trending keywords (unusually high search volume) ────────────────────
function detectTrending(keywords: ScoredKeyword[], avgVol: number): string[] {
    // Must be 2.5x average AND have at least 500 searches to be "truly trending"
    // Prevents low-volume averages making 250-search words appear trending
    const relativeThreshold = avgVol * 2.5
    const absoluteMinimum = 500
    const threshold = Math.max(relativeThreshold, absoluteMinimum)

    return keywords
        .filter(k => k.searchVol >= threshold && k.tier !== 'SKIP')
        .sort((a, b) => b.searchVol - a.searchVol)
        .slice(0, 5)
        .map(k => k.kw)
}

// ── Mobile keyword priority ────────────────────────────────────────────────────
// eBay mobile shows first ~33 chars. These are the keywords that MUST
// appear early in the title for mobile visibility.
function getMobileKeywords(
    keywords: ScoredKeyword[],
    currentTitle: string,
): string[] {
    const titleFirst33 = currentTitle.slice(0, 33).toLowerCase()

    // Power keywords not already in first 33 chars — need to move earlier
    return keywords
        .filter(k => k.tier === 'POWER' && !titleFirst33.includes(k.kw.toLowerCase()))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(k => k.kw)
}

// ── MAIN FUNCTION ─────────────────────────────────────────────────────────────
export function analyseBuyerSearch(
    genericKeywords: RawKeyword[],
    longTailKeywords: RawKeyword[],
    currentTitle: string,
): BuyerSearchResult {

    const titleLower = currentTitle.toLowerCase()
    const productInfo = findProductNoun(currentTitle)
    const productNoun = productInfo.noun.toLowerCase()

    // ── 1. Combine and deduplicate all keywords ────────────────────────────────
    // Smart dedup: handles plurals, capitalisation, and near-duplicates
    // e.g. "Cat Toy" and "cat toys" treated as same keyword — keep higher scored one
    const allRaw = [...genericKeywords, ...longTailKeywords]
    const seen = new Set<string>()
    const unique: RawKeyword[] = []

    function normaliseKw(k: string): string {
        return k.toLowerCase().trim()
            .replace(/ies$/, 'y')   // puppies → puppy
            .replace(/ves$/, 'f')   // knives → knife
            .replace(/es$/, '')    // boxes → box (MUST be before /s$/)
            .replace(/s$/, '')    // toys → toy, cats → cat
            .replace(/ing$/, '')     // rolling → roll
            .replace(/ed$/, '')     // charged → charg
            .replace(/er$/, '')     // charger → charg
            .replace(/ly$/, '')     // quickly → quick
    }

    for (const kw of allRaw) {
        const norm = normaliseKw(kw.kw)
        if (!seen.has(norm)) { seen.add(norm); unique.push(kw) }
    }

    // ── 2. Score every keyword ─────────────────────────────────────────────────
    const scored: ScoredKeyword[] = []
    for (const raw of unique) {
        const kwl = raw.kw.toLowerCase().trim()
        if (!isUsableKeyword(raw.kw, productNoun)) continue

        const searchVol = raw.avgSearches ?? parseSearchVol(raw.search)
        const inListings = parseInListings(raw.comp)
        const wordCount = raw.kw.trim().split(/\s+/).length
        const inTitle = titleLower.includes(kwl)
        const intent = detectIntent(raw.kw)

        const base: ScoredKeyword = {
            kw: raw.kw.trim(),
            searchVol, inListings, score: 0,
            tier: 'SKIP', inTitle, wordCount, intent,
        }
        base.score = scoreKeyword(base)
        base.tier = assignTier(base.score, searchVol, inListings)
        scored.push(base)
    }

    // ── 3. Sort by score desc ──────────────────────────────────────────────────
    scored.sort((a, b) => b.score - a.score)

    // ── 4. Split into tiers ────────────────────────────────────────────────────
    const powerKeywords = scored.filter(k => k.tier === 'POWER')
    const fillKeywords = scored.filter(k => k.tier === 'FILL')
    const skipKeywords = scored.filter(k => k.tier === 'SKIP')

    // ── 5. Missing keywords ────────────────────────────────────────────────────
    const missingPower = powerKeywords.filter(k => !k.inTitle).map(k => k.kw)
    const missingFill = fillKeywords.filter(k => !k.inTitle).map(k => k.kw)

    // ── 6. Coverage score ──────────────────────────────────────────────────────
    const coverageScore = powerKeywords.length === 0 ? 100
        : Math.round((powerKeywords.filter(k => k.inTitle).length / powerKeywords.length) * 100)

    // ── 7. Top search terms ────────────────────────────────────────────────────
    const topSearchTerms = scored
        .filter(k => k.searchVol > 0)
        .sort((a, b) => b.searchVol - a.searchVol)
        .slice(0, 5)
        .map(k => k.kw)

    // ── 8. Stats ───────────────────────────────────────────────────────────────
    const withVol = scored.filter(k => k.searchVol > 0)
    const avgSearchVol = withVol.length
        ? Math.round(withVol.reduce((s, k) => s + k.searchVol, 0) / withVol.length) : 0
    const maxSearchVol = withVol.length
        ? Math.max(...withVol.map(k => k.searchVol)) : 0
    const withList = scored.filter(k => k.inListings > 0)
    const avgInListings = withList.length
        ? Math.round(withList.reduce((s, k) => s + k.inListings, 0) / withList.length) : 0

    // ── 9. Advanced analysis ───────────────────────────────────────────────────
    const dominantTheme = detectDominantTheme(scored)
    const dominantIntent = detectDominantIntent(scored)
    const clusters = clusterKeywords(scored)
    const trendingKeywords = detectTrending(scored, avgSearchVol)
    const mobileKeywords = getMobileKeywords(scored, currentTitle)

    // ── 10. Build injection queue ──────────────────────────────────────────────
    // Priority: long-tail POWER → single POWER → long-tail FILL → single FILL
    // Smart queue sort: balance phrase specificity vs raw search volume
    // A single word with 10K searches beats a phrase with 200 searches
    const PHRASE_BONUS = 1.3  // phrases get 30% score boost for specificity
    const sortByWeightedScore = (a: string, b: string) => {
        const aData = scored.find(k => k.kw === a)
        const bData = scored.find(k => k.kw === b)
        const aWords = a.split(' ').length
        const bWords = b.split(' ').length
        const aScore = (aData?.score ?? 0) * (aWords >= 2 ? PHRASE_BONUS : 1.0)
        const bScore = (bData?.score ?? 0) * (bWords >= 2 ? PHRASE_BONUS : 1.0)
        return bScore - aScore
    }

    const injectionQueue: string[] = [
        ...missingPower.sort(sortByWeightedScore),
        ...missingFill.sort(sortByWeightedScore),
    ]

    // Best keyword for position 1 — highest score that's not already first word
    const titleFirstWord = currentTitle.trim().split(/\s+/)[0]?.toLowerCase() ?? ''
    const firstPositionKeyword = powerKeywords.find(k =>
        k.kw.toLowerCase() !== titleFirstWord &&
        !currentTitle.toLowerCase().startsWith(k.kw.toLowerCase())
    )?.kw ?? null

    return {
        powerKeywords,
        fillKeywords,
        skipKeywords,
        missingPower,
        missingFill,
        coverageScore,
        topSearchTerms,
        dominantTheme,
        dominantIntent,
        clusters,
        mobileKeywords,
        trendingKeywords,
        injectionQueue,
        firstPositionKeyword,
        totalKeywords: scored.length,
        avgSearchVol,
        avgInListings,
        maxSearchVol,
    }
}

// ── SMART TITLE BUILDER ───────────────────────────────────────────────────────
export function buildBuyerOptimisedTitle(
    currentTitle: string,
    buyerData: BuyerSearchResult,
    maxLength: number = 80,
    keepWords: Set<string> = new Set(),
): string {
    let result = currentTitle

    for (const kw of buyerData.injectionQueue) {
        const kwl = kw.toLowerCase()
        if (result.toLowerCase().includes(kwl)) continue
        if (result.length + 1 + kw.length > maxLength) continue
        // Mobile keywords go to START so they appear in first 33 chars
        const isMobileKw = buyerData.mobileKeywords.includes(kw)
        if (isMobileKw && result.length > 10) {
            result = `${kw} ${result}`
        } else {
            result = `${result} ${kw}`
        }
        if (result.length >= maxLength * 0.9) break
    }

    return result.length <= maxLength ? result : result.substring(0, maxLength).trim()
}

// ── KEYWORD COVERAGE ANALYSER ─────────────────────────────────────────────────
export function analyseKeywordCoverage(
    title: string,
    buyerData: BuyerSearchResult,
): {
    covered: string[]
    missing: string[]
    score: number
    tip: string
} {
    const titleLower = title.toLowerCase()
    const power = buyerData.powerKeywords.slice(0, 10)

    const covered = power.filter(k => titleLower.includes(k.kw.toLowerCase())).map(k => k.kw)
    const missing = power.filter(k => !titleLower.includes(k.kw.toLowerCase())).map(k => k.kw)
    const score = power.length === 0 ? 100 : Math.round((covered.length / power.length) * 100)

    let tip = ''
    if (score === 100) tip = '✅ All top buyer keywords covered'
    else if (score >= 70) tip = `⚠ Add "${missing[0]}" to boost coverage`
    else if (score >= 40) tip = `⚠ Missing ${missing.length} key buyer terms — add "${missing[0]}" first`
    else tip = `❌ Title misses most buyer searches — inject "${missing.slice(0, 2).join('", "')}"`

    return { covered, missing, score, tip }
}

// ── SEGMENT UPGRADER ──────────────────────────────────────────────────────────
export function getLiveSegmentKeywords(
    buyerData: BuyerSearchResult,
    currentTitle: string,
    maxKeywords: number = 3,
): string[] {
    const titleLower = currentTitle.toLowerCase()

    // First try: return top cluster keywords not in title
    if (buyerData.clusters.length > 0) {
        const topCluster = buyerData.clusters[0]
        const fromCluster = topCluster.keywords
            .filter(kw => !titleLower.includes(kw.toLowerCase()))
            .slice(0, maxKeywords)
        if (fromCluster.length > 0) return fromCluster
    }

    // Fall back: injection queue
    return buyerData.injectionQueue
        .filter(kw => !titleLower.includes(kw.toLowerCase()))
        .slice(0, maxKeywords)
}

// ── MOBILE POSITION ADVISOR ────────────────────────────────────────────────────
// Returns advice on whether the current title is optimised for mobile.
// eBay shows ~33 chars on mobile — the most important keywords MUST be there.
export function getMobilePositionAdvice(
    title: string,
    buyerData: BuyerSearchResult,
): {
    isOptimised: boolean
    firstChars: string   // what shows on mobile
    missing: string[] // power keywords not in first 33 chars
    tip: string
} {
    const firstChars = title.slice(0, 33)
    const missing = buyerData.mobileKeywords

    const isOptimised = missing.length === 0

    let tip = ''
    if (isOptimised) {
        tip = '✅ Key buyer terms visible on mobile'
    } else {
        tip = `⚠ Move "${missing[0]}" to first 33 chars for mobile visibility`
    }

    return { isOptimised, firstChars, missing, tip }
}

// ── DUPLICATE DETECTOR ────────────────────────────────────────────────────────
// Finds keywords that are essentially the same word (stem duplicates)
// so the engine doesn't waste space injecting near-duplicates.
export function findDuplicateKeywords(
    keywords: ScoredKeyword[],
): Map<string, string[]> {
    const groups = new Map<string, string[]>()

    for (const kw of keywords) {
        const words = kw.kw.toLowerCase().split(/\s+/)
        for (const word of words) {
            if (word.length < 4) continue
            // Simple stem: first 5 chars
            const stem = word.slice(0, 7)  // 7 chars prevents false matches like 'inter' matching interest/internet
            if (!groups.has(stem)) groups.set(stem, [])
            const group = groups.get(stem)!
            if (!group.includes(kw.kw)) group.push(kw.kw)
        }
    }

    // Only return groups with actual duplicates
    return new Map([...groups.entries()].filter(([, v]) => v.length > 1))
}

// ── TITLE GAP ANALYSER ────────────────────────────────────────────────────────
// Analyses what's wrong with the current title from a buyer search perspective.
// Returns actionable specific feedback — not generic advice.
export function analyseTitleGaps(
    title: string,
    buyerData: BuyerSearchResult,
): {
    gaps: string[]     // specific things missing
    quickWins: { kw: string; chars: number; benefit: string }[]  // easy injections
    charsLeft: number
    canFitMore: boolean
} {
    const titleLower = title.toLowerCase()
    const charsLeft = 80 - title.length
    const canFitMore = charsLeft >= 4

    const gaps: string[] = []

    // Gap 1: No power keywords at all
    if (buyerData.powerKeywords.filter(k => k.inTitle).length === 0) {
        gaps.push('No high-search keywords from buyer data found in title')
    }

    // Gap 2: Top search term not in title
    if (buyerData.topSearchTerms[0] && !titleLower.includes(buyerData.topSearchTerms[0].toLowerCase())) {
        gaps.push(`Most searched term "${buyerData.topSearchTerms[0]}" is missing`)
    }

    // Gap 3: Dominant intent not addressed
    if (buyerData.dominantIntent === 'gift' && !titleLower.includes('gift')) {
        gaps.push('Most buyers are searching as gift buyers — no gift keyword in title')
    }
    if (buyerData.dominantIntent === 'compatible' && !/compatible|fits|for/.test(titleLower)) {
        gaps.push('Most buyers need compatibility info — missing "Compatible" or "Fits"')
    }

    // Gap 4: Mobile optimisation
    if (buyerData.mobileKeywords.length > 0) {
        gaps.push(`Key keyword "${buyerData.mobileKeywords[0]}" not visible on mobile (first 33 chars)`)
    }

    // Quick wins — keywords that are short enough to add right now
    const quickWins = buyerData.injectionQueue
        .filter(kw => {
            const kwLen = kw.length + 1  // +1 for space
            return kwLen <= charsLeft && !titleLower.includes(kw.toLowerCase())
        })
        .slice(0, 5)
        .map(kw => {
            const kwData = buyerData.powerKeywords.find(k => k.kw === kw)
                ?? buyerData.fillKeywords.find(k => k.kw === kw)
            const benefit = kwData
                ? `${kwData.searchVol >= 1000 ? Math.round(kwData.searchVol / 1000 * 10) / 10 + 'K' : kwData.searchVol} searches · ${kwData.inListings}% of listings`
                : 'in buyer searches'
            return { kw, chars: kw.length + 1, benefit }
        })

    return { gaps, quickWins, charsLeft, canFitMore }
}
