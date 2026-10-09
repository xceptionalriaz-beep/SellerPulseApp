// ── titleBuilderEngine.ts ─────────────────────────────────────────────────────
// Level 4 — Like AI (Expert)
// Step 13: Build titles from scratch using real search data
// Step 15: Score its own output before returning
// Step 16: Never return worse than input
//
// Unlike titleSpinnerEngine which EDITS an existing title,
// this engine BUILDS the optimal title from real data signals.
//
// The AI-like pipeline:
//   1.  Collect all signals from every engine (buyer, competing, category, condition)
//   2.  Score every candidate word using a weighted matrix
//   3.  Detect the product's "search DNA" (what buyers actually type)
//   4.  Find differentiation opportunities (what competitors miss)
//   5.  Build the title in optimal word order for eBay Cassini algorithm
//   6.  Apply all protection rules (brand, condition, digital, locale)
//   7.  Ensure mobile window (first 33 chars) is maximally effective
//   8.  Self-score the built title against multiple metrics
//   9.  Compare to original — only return if genuinely better
//  10.  Explain exactly what was done and why
// ─────────────────────────────────────────────────────────────────────────────

import {
    findProductNoun, detectColour, detectAgeGroup,
    detectCompatibility, detectConditionFull
} from './productNouns'
import { isSpecWord, findSpecsInTitle } from './specWords'
import { isFillerWithContext } from './fillerWords'
import { detectCategoryV2 } from './categoryEngine'
import {
    analyseBuyerSearch, type RawKeyword,
    type BuyerSearchResult, type ScoredKeyword
} from './buyerSearchEngine'
import {
    analyseCompetingTitles, getIdealWordOrder,
    type CompetingListing,
    type CompetingTitleResult
} from './competingTitleEngine'
import {
    detectConditionWithWord, getConditionKeywords,
    filterByCondition, CONDITION_LENGTH_TARGET,
    getSeasonalConditionKeywords, type Condition
} from './conditionEngine'
import {
    detectBrand, getBrandWordSet,
    guardBrandInTitle, type BrandResult
} from './brandEngine'
import {
    analyseMobile, getMobileWindow,
    MOBILE_CHAR_LIMIT
} from './mobileEngine'
import { applyLocale, filterByLocale, isWrongLocaleWord, type Locale } from './locationEngine'
import {
    detectProductType, filterForDigital,
    getDigitalKeywords
} from './digitalEngine'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BuildInput {
    // Live data from eBay API
    genericKeywords: RawKeyword[]
    longTailKeywords: RawKeyword[]
    competingListings: CompetingListing[]

    // Optional context
    existingTitle?: string      // seller's current title (for comparison)
    categoryName?: string      // eBay category name from API
    condition?: Condition   // new/used/faulty/refurbished
    locale?: Locale      // UK/US/AU/CA
    productHint?: string      // optional hint e.g. "cat toy" from search query
}

export interface WordScore {
    word: string
    score: number     // 0-100 composite score
    searchVol: number     // from buyer data
    inListings: number     // % in competing listings
    competingPos: number     // avg position in competing titles (lower = earlier)
    isBrand: boolean
    isProduct: boolean
    isSpec: boolean
    isFiller: boolean
    isMobilePri: boolean    // should be in first 33 chars
    sources: string[]   // which engines contributed to this score
}

export interface TitleScore {
    total: number    // 0-100 overall score
    breakdown: {
        keywordCoverage: number  // how many POWER keywords included (0-25)
        mobileWindow: number  // quality of first 33 chars (0-25)
        lengthEfficiency: number  // chars used vs 80 optimal (0-20)
        wordOrder: number  // alignment with competing title positions (0-15)
        conditionScore: number  // condition word correctly placed (0-10)
        localeScore: number  // correct locale vocabulary (0-5)
    }
    grade: 'A' | 'B' | 'C' | 'D' | 'F'
    tips: string[]
}

export interface BuildResult {
    // The built title
    title: string
    brandConfidence?: 'high' | 'medium' | 'low' | 'none'  // brand detection confidence

    // Was it better than the original?
    improved: boolean
    originalScore: number    // score of existingTitle (0 if no existing)
    builtScore: number    // score of built title
    improvement: number    // builtScore - originalScore

    // What was built and why
    wordScores: WordScore[]        // every word's score
    searchDNA: SearchDNA          // what makes this product unique in search
    structureUsed: string             // e.g. "[Brand] [Function] [Product] [Spec] [Target]"
    stepsApplied: string[]           // which engines contributed
    reasoning: string[]           // human-readable explanation

    // Scoring breakdown
    scoreBreakdown: TitleScore

    // Alternative variants
    variants: { title: string; score: number; focus: string }[]
}

export interface SearchDNA {
    productNoun: string           // the core product word
    topBuyerTerms: string[]         // what buyers actually search
    topCompetingTerms: string[]        // what top sellers use
    differentiators: string[]         // gaps — what some sellers use, most don't
    dominantIntent: string           // gift/size/function/compatibility etc.
    winningPattern: string           // e.g. "[Function][Product][Spec][Target]"
    mobileKeywords: string[]         // must-have in first 33 chars
}

// ── Score weights (eBay Cassini-inspired) ─────────────────────────────────────
export const SCORE_WEIGHTS = {
    searchVol: 0.30,   // what buyers TYPE — highest weight
    inListings: 0.25,   // what top sellers USE (eBay validates these)
    competingPos: 0.20,   // where top sellers PUT this word (position signal)
    categoryRel: 0.15,   // relevance to detected category
    mobileValue: 0.10,   // does it need to be in first 33 chars
}

// ── Position importance multipliers ──────────────────────────────────────────
// eBay Cassini weights earlier words more heavily
const POSITION_WEIGHT: Record<number, number> = {
    0: 2.0,  // position 1 (most important)
    1: 1.7,  // position 2
    2: 1.5,  // position 3
    3: 1.3,  // position 4
    4: 1.1,  // position 5
    5: 1.0,  // position 6+
}

// ── Word role ordering for title construction ─────────────────────────────────
// This is the optimal structure eBay's algorithm rewards
type WordRole = 'brand' | 'product' | 'function' | 'topKeyword' | 'spec' |
    'target' | 'condition' | 'fill' | 'filler'

const ROLE_ORDER: WordRole[] = [
    'brand',       // Nike, Apple, Dyson — always first
    'product',     // toy, phone, charger — what it IS
    'function',    // interactive, wireless, rechargeable — what it DOES
    'topKeyword',  // highest-search buyer terms
    'spec',        // USB-C, 18W, 4K — measurable specs
    'target',      // kitten, puppy, baby — who/what it's for
    'condition',   // used/new/refurbished — where condition goes
    'fill',        // additional buyer keywords
    'filler',      // last resort
]

// ── Calculate composite word score ───────────────────────────────────────────
function scoreWord(
    word: string,
    buyerData: BuyerSearchResult,
    compData: CompetingTitleResult | null,
    brandResult: BrandResult,
    category: string,
): WordScore {
    const wl = word.toLowerCase()
    const sources: string[] = []

    // Get buyer data — exact match first, then check if word is component of long-tail
    const buyerKw = buyerData.powerKeywords.find(k => k.kw.toLowerCase() === wl)
        ?? buyerData.fillKeywords.find(k => k.kw.toLowerCase() === wl)

    // Long-tail boost: if this word appears in multi-word buyer terms, inherit their score
    const longTailBoost = buyerData.powerKeywords
        .filter(k => k.kw.toLowerCase().includes(wl) && k.kw.toLowerCase() !== wl)
        .reduce((max, k) => Math.max(max, k.score * 0.6), 0)  // 60% of long-tail score

    const searchVol = buyerKw?.searchVol ?? (longTailBoost > 0 ? 500 : 0)
    const inListings = buyerKw?.inListings ?? 0
    if (buyerKw) sources.push('buyer-search')
    if (longTailBoost > 0) sources.push('long-tail-component')

    // Get competing title position for this word
    const compStat = compData?.wordStats.find(w => w.word === wl)
    const competingPos = compStat?.avgPosition ?? 99
    if (compStat) sources.push('competing-titles')

    // Type detection
    const isBrand = brandResult.allBrands.some(b => b.split(' ').includes(wl))
    const isProduct = (() => {
        const info = findProductNoun(word)
        return info.noun.toLowerCase() === wl
    })()
    const isSpec = !!isSpecWord(word)
    const isFiller = isFillerWithContext(wl, '', '') && !isBrand && !isProduct
    const isMobilePri = buyerData.mobileKeywords.includes(word) ||
        (compStat ? compStat.avgPosition < 2 : false)

    // Category relevance score (0-100) — covers all 32 eBay categories
    const CATEGORY_KEYWORDS: Record<string, RegExp> = {
        pets: /interactive|fetch|chew|play|squeaky|catnip|treat|leash|harness/i,
        electronics: /wireless|bluetooth|usb|fast|charge|hd|4k|digital|smart|compatible/i,
        clothing: /cotton|stretch|slim|casual|breathable|fitted|oversized|lightweight/i,
        footwear: /cushioned|breathable|non-slip|grip|waterproof|lightweight|arch/i,
        computing: /ssd|ram|cpu|gpu|wireless|portable|gaming|performance|fast/i,
        gaming: /wireless|compatible|hd|ultra|pro|slim|digital|edition|bundle/i,
        audio: /wireless|bluetooth|noise|cancelling|hifi|stereo|bass|portable/i,
        photography: /waterproof|stabilised|zoom|mirrorless|dslr|lightweight|portable/i,
        automotive: /oem|genuine|compatible|universal|performance|upgraded|stainless/i,
        tools: /cordless|heavy|duty|professional|ergonomic|hardened|precision/i,
        home: /washable|waterproof|easy|clean|modern|adjustable|freestanding/i,
        garden: /weatherproof|heavy|duty|stainless|galvanised|rust|resistant/i,
        kitchen: /dishwasher|safe|non-stick|heat|resistant|bpa|free|stainless/i,
        baby: /washable|hypoallergenic|bpa|free|foldable|adjustable|lightweight/i,
        toys: /interactive|educational|battery|operated|stem|creative|durable/i,
        sports: /breathable|moisture|wicking|lightweight|durable|adjustable/i,
        health: /adjustable|comfortable|breathable|washable|hypoallergenic|latex/i,
        beauty: /fragrance|free|hypoallergenic|vegan|cruelty|free|natural/i,
        collectibles: /limited|edition|rare|authentic|numbered|original|certificate/i,
        jewellery: /sterling|hallmarked|hypoallergenic|adjustable|tarnish|resistant/i,
        books: /illustrated|hardcover|paperback|revised|edition|annotated/i,
        music: /electric|acoustic|professional|beginner|lightweight|portable/i,
        arts: /acid|free|archival|professional|heavyweight|premium|waterproof/i,
    }
    const catRegex = CATEGORY_KEYWORDS[category]
    const catScore = catRegex && catRegex.test(wl) ? 80 : 50

    if (catScore > 60) sources.push('category-engine')

    // Composite score using weights
    const volNorm = Math.min(searchVol / 5000, 1) * 100
    const posScore = compStat ? Math.max(0, 100 - (competingPos * 15)) : 0
    const mobileBonus = isMobilePri ? 20 : 0

    const score = Math.round(
        (volNorm * SCORE_WEIGHTS.searchVol) +
        (inListings * SCORE_WEIGHTS.inListings) +
        (posScore * SCORE_WEIGHTS.competingPos) +
        (catScore * SCORE_WEIGHTS.categoryRel) +
        (mobileBonus * SCORE_WEIGHTS.mobileValue) +
        longTailBoost  // bonus for being part of searched long-tail phrase
    )

    return {
        word, score, searchVol, inListings, competingPos,
        isBrand, isProduct, isSpec, isFiller, isMobilePri, sources,
    }
}

// ── Assign word role ──────────────────────────────────────────────────────────
function assignRole(
    ws: WordScore,
    condition: Condition,
    condWord: string | null,
): WordRole {
    if (ws.isBrand) return 'brand'
    if (ws.isSpec) return 'spec'
    if (ws.isFiller) return 'filler'
    if (ws.isProduct) return 'product'
    // Is it the condition word?
    if (condWord && ws.word.toLowerCase() === condWord.toLowerCase()) return 'condition'
    // High score = top keyword
    if (ws.score >= 60) return ws.isMobilePri ? 'function' : 'topKeyword'
    // Target words (kitten, puppy, baby, kids)
    if (/\b(kitten|puppy|baby|toddler|kids|children|adult|senior|mens|womens|boys|girls)\b/i.test(ws.word)) return 'target'
    // Fill
    return ws.score >= 30 ? 'fill' : 'filler'
}

// ── Extract search DNA ────────────────────────────────────────────────────────
function extractSearchDNA(
    buyerData: BuyerSearchResult,
    compData: CompetingTitleResult | null,
    productNoun: string,
): SearchDNA {
    const topBuyerTerms = buyerData.powerKeywords
        .slice(0, 5)
        .map(k => k.kw)

    const topCompetingTerms = compData?.mustHaveWords.slice(0, 5) ?? []

    // Differentiators — optional words (20-40% of competing titles)
    // These are opportunities — some sellers use them, most don't
    const differentiators = compData?.optionalWords
        .filter(w => !topBuyerTerms.includes(w))
        .slice(0, 3) ?? []

    const dominantIntent = buyerData.dominantIntent

    // Winning pattern from competing titles
    const winningPattern = compData?.titleStructure.pattern.join('→') ?? 'product→keyword→spec'

    const mobileKeywords = buyerData.mobileKeywords.slice(0, 3)

    return {
        productNoun,
        topBuyerTerms,
        topCompetingTerms,
        differentiators,
        dominantIntent,
        winningPattern,
        mobileKeywords,
    }
}

// ── Score a title comprehensively ─────────────────────────────────────────────
function scoreTitle(
    title: string,
    buyerData: BuyerSearchResult,
    compData: CompetingTitleResult | null,
    condition: Condition,
    locale: Locale,
): TitleScore {
    const titleLow = title.toLowerCase()
    const window = getMobileWindow(title)
    const tips: string[] = []

    // 1. Keyword coverage (0-25) — all power keywords not just 8
    const powerKws = buyerData.powerKeywords  // use ALL power keywords
    const topKws = powerKws.slice(0, 5)     // top 5 weighted more heavily
    const covered = powerKws.filter(k => titleLow.includes(k.kw.toLowerCase())).length
    const topCovered = topKws.filter(k => titleLow.includes(k.kw.toLowerCase())).length
    const kwCoverage = powerKws.length > 0
        ? Math.round(((topCovered / Math.max(topKws.length, 1)) * 0.7 +
            (covered / Math.max(powerKws.length, 1)) * 0.3) * 25)
        : 20
    if (covered < powerKws.length) {
        const missing = powerKws.find(k => !titleLow.includes(k.kw.toLowerCase()))
        if (missing) tips.push(`Add "${missing.kw}" (${missing.searchVol.toLocaleString()} searches)`)
    }

    // 2. Mobile window (0-25)
    const mobileWords = window.visible.toLowerCase().split(/\s+/)
    const mobilePowerHits = buyerData.mobileKeywords.filter(k =>
        mobileWords.some(w => w.includes(k.toLowerCase()))
    ).length
    const mobileScore = buyerData.mobileKeywords.length > 0
        ? Math.round((mobilePowerHits / buyerData.mobileKeywords.length) * 25) : 20
    if (mobilePowerHits < buyerData.mobileKeywords.length) {
        const miss = buyerData.mobileKeywords.find(k =>
            !mobileWords.some(w => w.includes(k.toLowerCase()))
        )
        if (miss) tips.push(`Move "${miss}" to first 33 chars for mobile`)
    }

    // 3. Length efficiency (0-20)
    const target = CONDITION_LENGTH_TARGET[condition] ?? { min: 70, max: 80 }
    const len = title.length
    const lenScore = len >= target.min && len <= target.max ? 20
        : len >= target.min - 5 ? 15
            : len >= 60 ? 10
                : 5
    if (len < target.min) tips.push(`Title is ${target.min - len} chars short of optimal`)

    // 4. Word order alignment — uses POSITION_WEIGHT for earlier positions
    // Also uses sequence similarity (not exact position) for fairness
    const orderScore = compData ? (() => {
        const words = title.split(/\s+/)
        const idealOrder = getIdealWordOrder(words, compData)
        let orderTotal = 0
        let maxPoss = 0
        words.forEach((w, i) => {
            const weight = POSITION_WEIGHT[Math.min(i, 5)] ?? 1.0  // Fix 17: cap at 5
            maxPoss += weight
            // Sequence match: allow ±1 position tolerance (not exact index)
            const idealIdx = idealOrder.indexOf(w)
            if (idealIdx !== -1 && Math.abs(idealIdx - i) <= 1) orderTotal += weight
        })
        return Math.round((orderTotal / Math.max(maxPoss, 1)) * 15)
    })() : 10

    // 5. Condition compliance (0-10)
    const { condition: detCond } = detectConditionWithWord(title)
    const condScore = detCond === condition || condition === 'unknown' ? 10 : 5

    // 6. Locale score (0-5) — uses locationEngine for comprehensive check
    const wrongLocaleWords = title.split(/\s+/).filter(w => isWrongLocaleWord(w, locale))
    const localeScore = wrongLocaleWords.length === 0 ? 5
        : wrongLocaleWords.length === 1 ? 3
            : 2
    if (wrongLocaleWords.length > 0) tips.push(`Replace "${wrongLocaleWords[0]}" with ${locale} equivalent`)

    const total = kwCoverage + mobileScore + lenScore + orderScore + condScore + localeScore

    const grade: TitleScore['grade'] =
        total >= 90 ? 'A' :
            total >= 75 ? 'B' :
                total >= 60 ? 'C' :
                    total >= 40 ? 'D' : 'F'

    return {
        total,
        breakdown: {
            keywordCoverage: kwCoverage,
            mobileWindow: mobileScore,
            lengthEfficiency: lenScore,
            wordOrder: orderScore,
            conditionScore: condScore,
            localeScore,
        },
        grade,
        tips,
    }
}

// ── Build candidate pool of words ─────────────────────────────────────────────
function buildCandidatePool(
    buyerData: BuyerSearchResult,
    compData: CompetingTitleResult | null,
    brandResult: BrandResult,
    productNoun: string,
    specWords: string[],
    condition: Condition,
    condWord: string | null,
    category: string,
    colour: string | null,
    ageGroup: { group: string } | null,
    compat: string | null,
    locale: Locale,
): { word: string; role: WordRole; ws: WordScore }[] {

    const seen = new Set<string>()
    const pool: { word: string; role: WordRole; ws: WordScore }[] = []

    // eBay search algorithm ignores these — they waste title characters
    const EBAY_STOP_WORDS = new Set(['a', 'an', 'the', 'and', 'or', 'for', 'of', 'to', 'in', 'is', 'it', 'be', 'as', 'at', 'by', 'we', 'he', 'she', 'they', 'was', 'are', 'been'])

    const addWord = (word: string, extraScore = 0) => {
        const wl = word.toLowerCase()
        if (seen.has(wl) || word.length < 2) return
        if (EBAY_STOP_WORDS.has(wl)) return  // fix 8: skip eBay stop words
        seen.add(wl)  // fix 10: uses wl (lowercase) for dedup — prevents 'Cat'+'cat'

        const ws = scoreWord(word, buyerData, compData, brandResult, category)
        ws.score = Math.min(100, ws.score + extraScore)
        const role = assignRole(ws, condition, condWord)
        pool.push({ word, role, ws })
    }

    // 1. Brand (highest priority)
    if (brandResult.brand) {
        addWord(brandResult.brand, 50)  // brand always gets max priority
    }

    // 2. Product noun
    if (productNoun) addWord(productNoun, 40)

    // 3. All buyer POWER keywords
    for (const k of buyerData.powerKeywords) addWord(k.kw, 20)

    // 4. All buyer FILL keywords
    for (const k of buyerData.fillKeywords) addWord(k.kw, 5)

    // 5. Competing must-have words
    for (const w of compData?.mustHaveWords ?? []) addWord(w, 15)
    for (const w of compData?.strongWords ?? []) addWord(w, 8)
    // Optional words only if they appear in buyer data (fix 4: filter by relevance)
    const buyerWordSet = new Set([
        ...buyerData.powerKeywords.map(k => k.kw.toLowerCase()),
        ...buyerData.fillKeywords.map(k => k.kw.toLowerCase()),
    ])
    for (const w of compData?.optionalWords.slice(0, 8) ?? []) {
        if (buyerWordSet.has(w.toLowerCase())) addWord(w, 8)  // buyer-validated optional
        // else skip — not searched by buyers
    }

    // 6. Spec words from existing title (always include)
    for (const spec of specWords) addWord(spec, 30)

    // 6b. Colour and age group words
    if (colour) {
        for (const c of colour.split(' ')) addWord(c, 20)
    }
    if (ageGroup?.group) addWord(ageGroup.group, 20)
    if (compat) addWord(`for ${compat}`, 20)

    // 7. Condition word
    if (condWord) addWord(condWord, 25)

    // 8. Compatible brand (protect it)
    if (brandResult.compatibleBrand) addWord(`for ${brandResult.compatibleBrand}`, 20)

    // 9. Explicit locale-appropriate filler words (UK Stock, Genuine, Fast Dispatch)
    const FILLER_POOL = locale === 'UK'
        ? ['Genuine', 'Tested', 'Fast Dispatch', 'Quality', 'UK Stock']
        : ['Genuine', 'Tested', 'Fast Shipping', 'Quality', 'US Stock']
    for (const fw of FILLER_POOL) addWord(fw, 1)  // very low score — last resort

    return pool
}

// ── Construct title from pool ─────────────────────────────────────────────────
function constructTitle(
    pool: { word: string; role: WordRole; ws: WordScore }[],
    condition: Condition,
    maxLength: number = 80,
): string {
    // Sort by role order, then by score within each role
    const sorted = [...pool].sort((a, b) => {
        const aRoleIdx = ROLE_ORDER.indexOf(a.role)
        const bRoleIdx = ROLE_ORDER.indexOf(b.role)
        if (aRoleIdx !== bRoleIdx) return aRoleIdx - bRoleIdx
        return b.ws.score - a.ws.score  // higher score first within same role
    })

    const words: string[] = []
    let charCount = 0

    for (const { word, role } of sorted) {
        if (role === 'filler') continue  // skip fillers in initial build
        const addLen = charCount > 0 ? 1 + word.length : word.length
        if (charCount + addLen > maxLength) break
        words.push(word)
        charCount += addLen
    }

    // Fill remaining space with fillers if under target
    if (charCount < maxLength * 0.85) {
        for (const { word, role } of sorted) {
            if (role !== 'filler') continue
            const addLen = charCount > 0 ? 1 + word.length : word.length
            if (charCount + addLen > maxLength) break
            words.push(word)
            charCount += addLen
        }
    }

    return words.join(' ')
}

// ── Build title variants ──────────────────────────────────────────────────────
function buildVariants(
    pool: { word: string; role: WordRole; ws: WordScore }[],
    buyerData: BuyerSearchResult,
    condition: Condition,
    maxLength: number = 80,
): { title: string; score: number; focus: string }[] {
    const variants: { title: string; score: number; focus: string }[] = []

    // Variant 1: Buyer-focused (prioritise highest search vol keywords)
    const buyerPool = [...pool].sort((a, b) => b.ws.searchVol - a.ws.searchVol)
    const buyerTitle = constructTitle(buyerPool, condition, maxLength)
    // Score each variant using scoreTitle for consistency
    variants.push({
        title: buyerTitle,
        score: scoreTitle(buyerTitle, buyerData, null, condition, 'US').total,
        focus: 'Buyer Search Volume',
    })

    // Variant 2: Competitor-aligned (match what top sellers do)
    const compPool = [...pool].sort((a, b) => a.ws.competingPos - b.ws.competingPos)
    const compTitle = constructTitle(compPool, condition, maxLength)
    if (compTitle !== buyerTitle) {
        variants.push({
            title: compTitle,
            score: scoreTitle(compTitle, buyerData, null, condition, 'US').total,
            focus: 'Competitor Aligned',
        })
    }

    // Variant 3: Mobile-first (best keywords in first 33 chars)
    const mobilePool = [...pool].sort((a, b) => {
        const aM = a.ws.isMobilePri ? -1 : 0
        const bM = b.ws.isMobilePri ? -1 : 0
        if (aM !== bM) return aM - bM
        return b.ws.score - a.ws.score
    })
    const mobileTitle = constructTitle(mobilePool, condition, maxLength)
    if (mobileTitle !== buyerTitle && mobileTitle !== compTitle) {
        variants.push({
            title: mobileTitle,
            score: scoreTitle(mobileTitle, buyerData, null, condition, 'US').total,
            focus: 'Mobile Optimised',
        })
    }

    return variants.slice(0, 3)
}

// ── MAIN BUILD FUNCTION ───────────────────────────────────────────────────────
export function buildTitle(input: BuildInput): BuildResult {
    const {
        genericKeywords = [],
        longTailKeywords = [],
        competingListings = [],
        existingTitle = '',
        categoryName = '',
        condition = 'unknown',
        locale = 'US',
        productHint = '',
    } = input

    const stepsApplied: string[] = []
    const reasoning: string[] = []

    // ── Guard: empty input check ────────────────────────────────────────────────
    if (genericKeywords.length === 0 && longTailKeywords.length === 0 &&
        competingListings.length === 0 && !existingTitle && !productHint) {
        return {
            title: '', improved: false, originalScore: 0, builtScore: 0, improvement: 0,
            wordScores: [], searchDNA: {
                productNoun: '', topBuyerTerms: [], topCompetingTerms: [],
                differentiators: [], dominantIntent: 'unknown', winningPattern: '', mobileKeywords: []
            },
            structureUsed: '', stepsApplied: ['GuardEmpty'], reasoning: ['No input data provided'],
            scoreBreakdown: {
                total: 0, breakdown: {
                    keywordCoverage: 0, mobileWindow: 0,
                    lengthEfficiency: 0, wordOrder: 0, conditionScore: 0, localeScore: 0
                },
                grade: 'F', tips: ['Add search keywords or competing listings to build a title']
            },
            variants: [],
        }
    }

    // ── Step 1: Collect all intelligence ─────────────────────────────────────
    stepsApplied.push('Step1:SignalCollection')

    const buyerData = analyseBuyerSearch(genericKeywords, longTailKeywords, existingTitle)
    const compData = competingListings.length >= 3
        ? analyseCompetingTitles(competingListings, existingTitle)
        : null

    reasoning.push(`Analysed ${buyerData.totalKeywords} buyer keywords, ${competingListings.length} competing titles`)

    // ── Step 2: Detect product context ───────────────────────────────────────
    stepsApplied.push('Step2:ProductDetection')

    // Use product hint or top buyer keyword as base for product detection
    const baseText = existingTitle || productHint || buyerData.topSearchTerms[0] || ''
    const productInfo = findProductNoun(baseText)
    const productNoun = productInfo.noun
    const catV2 = detectCategoryV2(baseText)
    const category = catV2.category || 'generic'
    const brandResult = detectBrand(baseText, compData?.position1Words ?? [])

    // Spec words from existing title
    const specWords = existingTitle
        ? findSpecsInTitle(existingTitle).map(s => s.spec)
        : []

    // Colour and age group from existing title
    const colour = existingTitle ? detectColour(existingTitle) : null
    const ageGroup = existingTitle ? detectAgeGroup(existingTitle) : null
    const compat = existingTitle ? detectCompatibility(existingTitle) : null

    // Condition word
    const condResult = detectConditionWithWord(existingTitle || '')
    const condWord = condResult.word
    const effectiveCond = condResult.condition !== 'unknown' ? condResult.condition : condition

    // Digital check
    const digitalResult = detectProductType(baseText)

    reasoning.push(`Product: "${productNoun}" | Category: ${category} | Brand: ${brandResult.brand ?? 'none'} | Condition: ${effectiveCond}`)

    // ── Step 3: Handle digital products ──────────────────────────────────────
    if (digitalResult.isDigital) {
        stepsApplied.push('Step3:DigitalPath')
        const digitalKws = getDigitalKeywords(digitalResult, existingTitle, 5)
        const safeKws = filterForDigital(
            [...buyerData.injectionQueue, ...digitalKws],
            digitalResult.subType
        )
        let digitalTitle = [productNoun, ...safeKws].join(' ').slice(0, 80)
        digitalTitle = applyLocale(digitalTitle, locale)

        const builtScore = scoreTitle(digitalTitle, buyerData, compData, effectiveCond, locale)
        const origScore = existingTitle
            ? scoreTitle(existingTitle, buyerData, compData, effectiveCond, locale)
            : { total: 0, breakdown: { keywordCoverage: 0, mobileWindow: 0, lengthEfficiency: 0, wordOrder: 0, conditionScore: 0, localeScore: 0 }, grade: 'F' as const, tips: [] }

        return {
            title: digitalTitle,
            improved: builtScore.total > origScore.total,
            originalScore: origScore.total,
            builtScore: builtScore.total,
            improvement: builtScore.total - origScore.total,
            wordScores: [],
            searchDNA: extractSearchDNA(buyerData, compData, productNoun),
            structureUsed: '[Digital] [Product] [Keywords] [Delivery]',
            stepsApplied,
            reasoning,
            scoreBreakdown: builtScore,
            variants: [],
        }
    }

    // ── Step 4: Extract search DNA ────────────────────────────────────────────
    stepsApplied.push('Step4:SearchDNA')
    const searchDNA = extractSearchDNA(buyerData, compData, productNoun)
    reasoning.push(`Search DNA: top terms = [${searchDNA.topBuyerTerms.slice(0, 3).join(', ')}] | intent = ${searchDNA.dominantIntent}`)

    // ── Step 5: Score all candidate words ─────────────────────────────────────
    stepsApplied.push('Step5:WordScoring')
    const brandWords = getBrandWordSet(brandResult)
    const pool = buildCandidatePool(
        buyerData, compData, brandResult,
        productNoun, specWords, effectiveCond, condWord, category,
        colour, ageGroup, compat, locale
    )
    const wordScores = pool.map(p => p.ws)
    reasoning.push(`Scored ${pool.length} candidate words`)

    // ── Cluster-aware injection ───────────────────────────────────────────────
    // Buyer clusters = groups of keywords that appear together in searches
    // e.g. 'wireless' + 'bluetooth' always searched together
    // If we include one, we should include the other
    // clusters may not exist on all BuyerSearchResult versions — safe access
    const clusters = (buyerData as any).clusters ?? []
    for (const cluster of clusters.slice(0, 3)) {
        // Check if any cluster keyword is in pool — if so, add all cluster keywords
        const clusterInPool = cluster.keywords.some((kw: string) =>
            pool.some(p => p.word.toLowerCase() === kw.toLowerCase())
        )
        if (clusterInPool) {
            for (const kw of cluster.keywords) {
                const existing = pool.find(p => p.word.toLowerCase() === kw.toLowerCase())
                if (!existing) {
                    // Add missing cluster keyword with cluster bonus
                    const ws = scoreWord(kw, buyerData, compData, brandResult, category)
                    ws.score = Math.min(100, ws.score + 15)  // cluster bonus
                    const role = assignRole(ws, effectiveCond, condWord)
                    pool.push({ word: kw, role, ws })
                }
            }
        }
    }

    // ── Step 6: Find differentiation opportunity ──────────────────────────────
    stepsApplied.push('Step6:Differentiation')
    // If >80% of competing titles use the same first word → use second-highest
    // This makes our title stand out while still being relevant
    let useAlternativeStart = false
    if (compData && compData.position1Words.length > 0) {
        const top1Word = compData.position1Words[0]
        const top1Freq = compData.wordStats.find(w => w.word === top1Word)?.frequency ?? 0
        if (top1Freq >= 80) {
            // 80%+ saturation — differentiate
            useAlternativeStart = true
            reasoning.push(`Differentiating: "${top1Word}" is in ${top1Freq}% of competing titles — starting differently`)
        }
    }

    // ── Step 7: Construct main title ─────────────────────────────────────────
    stepsApplied.push('Step7:TitleConstruction')

    // Adjust pool for differentiation if needed
    let buildPool = [...pool]
    if (useAlternativeStart) {
        // Move position-1 competitor word down in priority
        const top1 = compData!.position1Words[0]
        buildPool = buildPool.map(p =>
            p.word.toLowerCase() === top1
                ? { ...p, role: 'topKeyword' as WordRole }  // demote from function to keyword
                : p
        )
    }

    let builtTitle = constructTitle(buildPool, effectiveCond)
    reasoning.push(`Built title: "${builtTitle}" (${builtTitle.length} chars)`)

    // ── Step 8: Apply all engine rules ───────────────────────────────────────
    stepsApplied.push('Step8:RulesApplication')

    // Brand protection
    builtTitle = guardBrandInTitle(builtTitle, brandResult)

    // Condition keywords + seasonal boost
    const condKws = getConditionKeywords(effectiveCond, builtTitle, 2)
    const seasonKws = getSeasonalConditionKeywords(effectiveCond, 1)
    for (const kw of [...condKws, ...seasonKws]) {
        if (!builtTitle.toLowerCase().includes(kw.toLowerCase()) &&
            builtTitle.length + 1 + kw.length <= 80) {
            builtTitle += ` ${kw}`
        }
    }
    if (seasonKws.length > 0) stepsApplied.push('SeasonalKeywords')

    // Locale translation
    builtTitle = applyLocale(builtTitle, locale)
    stepsApplied.push('Step11:LocaleApplied')

    // Mobile optimisation — ensure best keywords are in first 33 chars
    const mobileAnalysis = analyseMobile(builtTitle, effectiveCond, category, buyerData, compData ?? undefined)
    if (mobileAnalysis.score < 70 && mobileAnalysis.reorderedTitle !== builtTitle) {
        builtTitle = mobileAnalysis.reorderedTitle
        stepsApplied.push('Step10:MobileReordered')
        reasoning.push(`Mobile score improved from ${mobileAnalysis.score} → ${mobileAnalysis.mobileScore}`)
    }

    // Final length guard
    builtTitle = builtTitle.slice(0, 80).trim()

    // ── Step 9 (Step 15): Score the built title ───────────────────────────────
    stepsApplied.push('Step15:SelfScoring')
    const builtScore = scoreTitle(builtTitle, buyerData, compData, effectiveCond, locale)

    // Score original title for comparison
    const origScore = existingTitle
        ? scoreTitle(existingTitle, buyerData, compData, effectiveCond, locale)
        : { total: 0, breakdown: { keywordCoverage: 0, mobileWindow: 0, lengthEfficiency: 0, wordOrder: 0, conditionScore: 0, localeScore: 0 }, grade: 'F' as const, tips: [] }

    // ── Step 10 (Step 16): Never return worse than input ─────────────────────
    stepsApplied.push('Step16:NeverWorse')
    const improved = builtScore.total > origScore.total + 10  // must be meaningfully better (+10 pts)
    const finalTitle = improved ? builtTitle : (existingTitle || builtTitle)

    if (!improved && existingTitle) {
        reasoning.push(`Built title (${builtScore.total}/100) not significantly better than original (${origScore.total}/100) — returning original`)
    } else {
        reasoning.push(`Built title scores ${builtScore.total}/100 vs original ${origScore.total}/100 — improvement of +${builtScore.total - origScore.total}`)
    }

    // ── Step 11: Build variants ───────────────────────────────────────────────
    const variants = buildVariants(buildPool, buyerData, effectiveCond)

    // Structure description
    const structureUsed = ROLE_ORDER
        .filter(role => buildPool.some(p => p.role === role))
        .map(r => `[${r.charAt(0).toUpperCase() + r.slice(1)}]`)
        .join(' ')

    if (brandResult.confidence === 'medium') {
        reasoning.push(`Note: Brand "${brandResult.brand}" detected with medium confidence — verify it's correct`)
    }

    return {
        title: finalTitle,
        improved,
        brandConfidence: brandResult.confidence,
        originalScore: origScore.total,
        builtScore: builtScore.total,
        improvement: builtScore.total - origScore.total,
        wordScores,
        searchDNA,
        structureUsed,
        stepsApplied,
        reasoning,
        scoreBreakdown: builtScore,
        variants,
    }
}


// ── eBay Title Policy Checker ─────────────────────────────────────────────────
// eBay has specific title rules — violations can suppress listing visibility
export interface PolicyViolation {
    type: string
    word: string
    severity: 'critical' | 'warning'
    fix: string
}

export function checkEbayTitlePolicy(title: string): {
    violations: PolicyViolation[]
    isCompliant: boolean
    tip: string
} {
    const violations: PolicyViolation[] = []
    const words = title.split(/\s+/)

    // 1. ALL CAPS words (except known abbreviations like USB, LED, UK, US)
    const allowedCaps = new Set(['USB', 'LED', 'UK', 'US', 'AU', 'CA', 'TV', 'PC', 'DVD', 'CD',
        'HD', '4K', '8K', 'UHD', 'OLED', 'QLED', 'LCD', 'GPS', 'PDF', 'MP3', 'WAV', 'OTF', 'TTF',
        'AC', 'DC', 'VGA', 'HDMI', 'RAM', 'SSD', 'HDD', 'CPU', 'GPU', 'NIB', 'BNIB', 'BNWT', 'VGC',
        'GWO', 'MPN', 'EAN', 'ISBN', 'UPC', 'RRP', 'VAT', 'EU', 'NFL', 'NBA', 'MLB', 'NHL'])
    for (const w of words) {
        if (w.length >= 4 && w === w.toUpperCase() && /[A-Z]/.test(w) && !allowedCaps.has(w)) {
            violations.push({
                type: 'all-caps', word: w, severity: 'warning',
                fix: `Change "${w}" to "${w.charAt(0) + w.slice(1).toLowerCase()}"`,
            })
        }
    }

    // 2. Special characters eBay bans in titles
    const bannedChars = /[™®©℗℠]/g
    const charMatches = title.match(bannedChars)
    if (charMatches) {
        violations.push({
            type: 'special-char', word: charMatches[0], severity: 'critical',
            fix: `Remove "${charMatches[0]}" — eBay bans trademark/copyright symbols in titles`,
        })
    }

    // 3. Price mentions ($, £, €)
    if (/[\$£€]\d|\d[\$£€]/.test(title)) {
        violations.push({
            type: 'price-in-title', word: 'price', severity: 'critical',
            fix: 'Remove price — eBay policy bans prices in titles',
        })
    }

    // 4. Repeated punctuation
    if (/[!?]{2,}|\.{3,}/.test(title)) {
        violations.push({
            type: 'repeated-punctuation', word: '!!', severity: 'warning',
            fix: 'Remove repeated punctuation — eBay policy violation',
        })
    }

    // 5. Seller info in title
    if (/\b(ebay|seller|shop|store|feedback|positive)\b/i.test(title)) {
        violations.push({
            type: 'seller-info', word: 'seller reference', severity: 'critical',
            fix: 'Remove seller/shop references — eBay bans self-promotion in titles',
        })
    }

    // 6. Title too short (eBay wants at least 3 words)
    if (words.length < 3) {
        violations.push({
            type: 'too-short', word: title, severity: 'warning',
            fix: 'Add more keywords — eBay titles need at least 3 words for visibility',
        })
    }

    // 7. Title too long (over 80 chars)
    if (title.length > 80) {
        violations.push({
            type: 'too-long', word: `${title.length} chars`, severity: 'critical',
            fix: `Title is ${title.length - 80} chars over limit — eBay truncates at 80`,
        })
    }

    const isCompliant = violations.filter(v => v.severity === 'critical').length === 0
    const tip = violations.length > 0
        ? violations[0].fix
        : '✅ Title passes all eBay policy checks'

    return { violations, isCompliant, tip }
}

// ── Quick build (simpler version for TbStudio) ────────────────────────────────
// Returns just the title string — no detailed metadata
export function buildTitleQuick(
    genericKeywords: RawKeyword[],
    longTailKeywords: RawKeyword[],
    competingListings: CompetingListing[],
    existingTitle: string = '',
    locale: Locale = 'US',
): string {
    const result = buildTitle({
        genericKeywords,
        longTailKeywords,
        competingListings,
        existingTitle,
        locale,
    })
    return result.title
}

// ── Export score function for external use ────────────────────────────────────
export { scoreTitle as scoreTitleQuality }
