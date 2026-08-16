// ── mobileEngine.ts ───────────────────────────────────────────────────────────
// Step 10: Mobile Rule — Best Keywords in First 33 Characters
//
// Why 33 chars?
//   eBay mobile app truncates titles at ~33 characters in search results.
//   Buyers scrolling on mobile ONLY see those first 33 chars before clicking.
//   If your best keyword is at position 50 → invisible on mobile → fewer clicks.
//
// eBay mobile behaviour by context:
//   Search results list:  ~33 chars visible
//   Search results grid:  ~25 chars visible (even shorter!)
//   Item page title:      Full title shown
//   Promoted listings:    ~40 chars visible
//
// What this engine does:
//   1.  Analyse what's currently in the first 33 chars
//   2.  Score the mobile window (0-100) — are the BEST words there?
//   3.  Identify which high-value words are OUTSIDE the mobile window
//   4.  Build an optimal 33-char window with the right word order
//   5.  Reorder title to put best words first without losing meaning
//   6.  Detect mobile anti-patterns (brand missing, filler first, etc.)
//   7.  Category-specific mobile rules (electronics vs clothing vs collectibles)
//   8.  Competing titles — what do top sellers put in their first 33 chars?
//   9.  Buyer search data — which searched keywords are mobile-invisible?
//  10.  Generate a mobile-optimised title that scores 80+ on mobile window
// ─────────────────────────────────────────────────────────────────────────────

import { isFillerWithContext } from './fillerWords'
import { isSpecWord } from './specWords'
import { findProductNoun } from './productNouns'
import { detectBrand, type BrandResult } from './brandEngine'
import { type BuyerSearchResult } from './buyerSearchEngine'
import { type CompetingTitleResult } from './competingTitleEngine'
import { CONDITION_RULES, type Condition } from './conditionEngine'

// ── Constants ─────────────────────────────────────────────────────────────────
export const MOBILE_CHAR_LIMIT = 33   // standard eBay mobile truncation
export const MOBILE_GRID_LIMIT = 25   // grid view (shorter)
export const PROMOTED_CHAR_LIMIT = 40   // promoted listings
export const FULL_TITLE_LIMIT = 80   // eBay full title

// ── Types ─────────────────────────────────────────────────────────────────────
export interface MobileWindow {
    visible: string    // what buyer sees on mobile (first 33 chars)
    hidden: string    // what's cut off
    charCount: number    // chars in visible portion
    wordCount: number    // complete words visible
    lastWord: string    // last COMPLETE word in mobile window
    cutMidWord: boolean   // does the truncation cut a word in half?
}

export interface MobileWordScore {
    word: string
    score: number     // 0-100 importance score
    inMobile: boolean    // is it in first 33 chars?
    position: number     // word index in title
    charPosition: number     // char position in title
    reason: string     // why it has this score
    type: 'brand' | 'product' | 'keyword' | 'spec' | 'condition' | 'filler' | 'other'
}

export interface MobileAnalysis {
    // Current state
    window: MobileWindow
    score: number         // 0-100 mobile optimisation score
    grade: 'A' | 'B' | 'C' | 'D' | 'F'

    // Word analysis
    wordScores: MobileWordScore[]
    mobileWords: MobileWordScore[]    // words in first 33 chars
    hiddenWords: MobileWordScore[]    // words outside first 33 chars
    misplacedWords: MobileWordScore[]    // high-value words that should be earlier

    // Anti-patterns detected
    antiPatterns: MobileAntiPattern[]

    // Recommendations
    tips: string[]
    quickFix: string           // single most impactful change
    optimalWindow: string           // what the ideal first 33 chars should look like

    // Optimised title
    reorderedTitle: string           // title reordered for mobile (same words, better order)
    mobileScore: number           // score of reorderedTitle
}

export interface MobileAntiPattern {
    type: string
    description: string
    severity: 'critical' | 'major' | 'minor'
    fix: string
}

// ── Word type classifier ──────────────────────────────────────────────────────
function classifyWordType(
    word: string,
    brandResult: BrandResult,
): MobileWordScore['type'] {
    const wl = word.toLowerCase()
    if (brandResult.allBrands.some(b => b.split(' ').includes(wl))) return 'brand'
    if (!!isSpecWord(word)) return 'spec'
    if (isFillerWithContext(wl, '', '')) return 'filler'
    const productInfo = findProductNoun(word)
    if (productInfo.noun.toLowerCase() === wl) return 'product'
    return 'other'
}

// ── Score a word's mobile importance ─────────────────────────────────────────
// How important is it that THIS word appears in the first 33 chars?
function scoreMobileImportance(
    word: string,
    position: number,
    brandResult: BrandResult,
    buyerData?: BuyerSearchResult,
    compData?: CompetingTitleResult,
): { score: number; reason: string } {
    const wl = word.toLowerCase()
    const type = classifyWordType(word, brandResult)
    let score = 0
    let reason = ''

    switch (type) {
        case 'brand':
            // Brand is almost always most important — buyers search by brand
            score = 95
            reason = 'Brand name — buyers search by brand'
            break

        case 'product':
            // Core product noun — must be visible
            score = 90
            reason = 'Product noun — what the item IS'
            break

        case 'spec':
            // Specs matter but less than product noun
            score = 60
            reason = 'Spec word — important for filtering'
            break

        case 'filler':
            // Filler should NEVER be in first 33 chars
            score = 0
            reason = 'Filler word — wastes mobile space'
            break

        case 'other':
            // Default — use buyer/competing data to score
            score = 30
            reason = 'Keyword'
            break
    }

    // Boost if it's in buyer POWER keywords
    if (buyerData) {
        const pwrKw = buyerData.powerKeywords.find(k => k.kw.toLowerCase() === wl)
        if (pwrKw) {
            score = Math.max(score, 70 + Math.round(pwrKw.score / 10))
            reason = `High-search keyword (${pwrKw.searchVol.toLocaleString()} searches)`
        }
    }

    // Boost if competing titles put this word early
    if (compData) {
        const wordStat = compData.wordStats.find(w => w.word === wl)
        if (wordStat && wordStat.avgPosition < 2 && wordStat.frequency >= 40) {
            score = Math.max(score, 80)
            reason = `Top sellers put "${word}" first (avg pos ${wordStat.avgPosition})`
        }
    }

    // Position penalty — if already early, less urgent to move
    if (position <= 2 && score > 50) {
        score = Math.min(100, score + 5)  // small bonus for already being early
    }

    return { score, reason }
}

// ── Get mobile window ────────────────────────────────────────────────────────
export function getMobileWindow(title: string, limit = MOBILE_CHAR_LIMIT): MobileWindow {
    const visible = title.slice(0, limit)
    const hidden = title.slice(limit)
    const words = title.split(/\s+/)
    let charCount = 0
    let wordCount = 0
    let lastWord = ''
    let cutMidWord = false

    for (const word of words) {
        const newLen = charCount + (wordCount > 0 ? 1 : 0) + word.length
        if (newLen <= limit) {
            charCount = newLen
            wordCount++
            lastWord = word
        } else {
            // Check if this word starts within the limit (mid-word cut)
            const startPos = charCount + (wordCount > 0 ? 1 : 0)
            cutMidWord = startPos < limit
            break
        }
    }

    return { visible, hidden, charCount, wordCount, lastWord, cutMidWord }
}

// ── Detect mobile anti-patterns ──────────────────────────────────────────────
function detectAntiPatterns(
    title: string,
    wordScores: MobileWordScore[],
    brandResult: BrandResult,
    condition: Condition,
): MobileAntiPattern[] {
    const patterns: MobileAntiPattern[] = []
    const window = getMobileWindow(title)
    const mobileWds = wordScores.filter(w => w.inMobile)
    const hiddenWds = wordScores.filter(w => !w.inMobile)

    // Anti-pattern 1: Brand not in mobile window
    if (brandResult.brand && !window.visible.toLowerCase().includes(brandResult.brandLower!)) {
        patterns.push({
            type: 'brand-invisible',
            description: `"${brandResult.brand}" not visible on mobile`,
            severity: 'critical',
            fix: `Move "${brandResult.brand}" to start of title`,
        })
    }

    // Anti-pattern 2: Filler words consuming mobile space
    const mobileFiller = mobileWds.filter(w => w.type === 'filler')
    if (mobileFiller.length > 0) {
        patterns.push({
            type: 'filler-in-mobile',
            description: `"${mobileFiller[0].word}" wastes mobile window space`,
            severity: 'major',
            fix: `Remove "${mobileFiller[0].word}" or move to end of title`,
        })
    }

    // Anti-pattern 3: High-value keyword hidden
    const hiddenHigh = hiddenWds.filter(w => w.score >= 70).slice(0, 1)
    if (hiddenHigh.length > 0) {
        patterns.push({
            type: 'high-value-hidden',
            description: `"${hiddenHigh[0].word}" is hidden on mobile (${hiddenHigh[0].reason})`,
            severity: 'major',
            fix: `Move "${hiddenHigh[0].word}" to first 33 chars`,
        })
    }

    // Anti-pattern 4: Title starts with condition word for used/faulty items
    const firstWord = title.split(/\s+/)[0]?.toLowerCase() ?? ''
    const condRule = CONDITION_RULES[condition]
    if (condRule.protectedWords.has(firstWord) && condition !== 'new' && firstWord !== brandResult.brandLower) {
        patterns.push({
            type: 'condition-word-first',
            description: `"${firstWord}" at position 1 — buyers search for product, not condition`,
            severity: 'minor',
            fix: `Put product name before "${firstWord}"`,
        })
    }

    // Anti-pattern 5: Mobile window cut mid-word
    if (window.cutMidWord) {
        patterns.push({
            type: 'mid-word-cut',
            description: `Mobile truncates mid-word ("${window.visible}…") — looks unprofessional`,
            severity: 'minor',
            fix: `Adjust word order so truncation falls between words`,
        })
    }

    // Anti-pattern 6: No product noun in mobile window
    const hasProductInMobile = mobileWds.some(w => w.type === 'product')
    if (!hasProductInMobile && wordScores.some(w => w.type === 'product')) {
        patterns.push({
            type: 'product-noun-hidden',
            description: `Product noun not visible in mobile window`,
            severity: 'critical',
            fix: `Move the product name to the start`,
        })
    }

    // Anti-pattern 7: All specs in mobile window, no buyer keywords
    const mobileSpecs = mobileWds.filter(w => w.type === 'spec').length
    const mobileKeywords = mobileWds.filter(w => w.type === 'other' && w.score >= 50).length
    if (mobileSpecs >= 3 && mobileKeywords === 0) {
        patterns.push({
            type: 'spec-heavy-mobile',
            description: `Mobile window full of specs — no buyer search keywords visible`,
            severity: 'major',
            fix: `Move one buyer keyword before the specs`,
        })
    }

    return patterns
}

// ── Build optimal word order for mobile ──────────────────────────────────────
// Reorders words to maximise mobile window score
// Rules:
//   1. Brand first (if detected)
//   2. Product noun second (if not part of brand)
//   3. Highest-scoring keywords next (up to 33 chars)
//   4. Specs after (important but secondary)
//   5. Condition word per condition rules (new=early, used=late)
//   6. Filler words always last
function buildOptimalOrder(
    words: string[],
    wordScores: MobileWordScore[],
    condition: Condition,
): string[] {
    // Sort into buckets
    const brand = wordScores.filter(w => w.type === 'brand')
    const product = wordScores.filter(w => w.type === 'product')
    const condWords = wordScores.filter(w => w.type === 'condition')
    const highKws = wordScores.filter(w => w.type === 'other' && w.score >= 60)
        .sort((a, b) => b.score - a.score)
    const specs = wordScores.filter(w => w.type === 'spec')
    const mediumKws = wordScores.filter(w => w.type === 'other' && w.score >= 30 && w.score < 60)
        .sort((a, b) => b.score - a.score)
    const lowKws = wordScores.filter(w => w.type === 'other' && w.score < 30)
    const filler = wordScores.filter(w => w.type === 'filler')

    // Condition position
    const condEarly = condition === 'new'
    const condLate = condition === 'used' || condition === 'faulty'
    const condMid = condition === 'refurbished'

    // Build order
    const ordered: string[] = []

    const add = (ws: MobileWordScore[]) => {
        for (const w of ws) {
            if (!ordered.includes(w.word)) ordered.push(w.word)
        }
    }

    // 1. Condition word (if new — goes first for mobile filter visibility)
    if (condEarly) add(condWords)

    // 2. Brand
    add(brand)

    // 3. Product noun
    add(product)

    // 4. High-value buyer keywords (33-char window priority)
    add(highKws)

    // 5. Condition word mid
    if (condMid) add(condWords)

    // 6. Specs
    add(specs)

    // 7. Medium keywords
    add(mediumKws)

    // 8. Condition word late (used/faulty)
    if (condLate) add(condWords)

    // 9. Low keywords
    add(lowKws)

    // 10. Filler last
    add(filler)

    // Any words not yet placed (shouldn't happen but safety)
    for (const w of words) {
        if (!ordered.includes(w)) ordered.push(w)
    }

    return ordered
}

// ── Score calculator ──────────────────────────────────────────────────────────
function calcMobileScore(wordScores: MobileWordScore[]): number {
    const highValue = wordScores.filter(w => w.score >= 70)
    if (highValue.length === 0) return 50  // no high-value words = neutral

    const inMobile = highValue.filter(w => w.inMobile).length
    const coverage = inMobile / highValue.length
    const baseScore = Math.round(coverage * 100)

    // Bonus: no filler in mobile
    const mobileFiller = wordScores.filter(w => w.inMobile && w.type === 'filler').length
    const fillerPenalty = mobileFiller * 10

    // Bonus: brand in mobile
    const brandInMobile = wordScores.some(w => w.inMobile && w.type === 'brand')
    const brandBonus = brandInMobile ? 10 : -20

    // Bonus: product noun in mobile
    const productInMobile = wordScores.some(w => w.inMobile && w.type === 'product')
    const productBonus = productInMobile ? 5 : -15

    return Math.max(0, Math.min(100, baseScore - fillerPenalty + brandBonus + productBonus))
}

// ── Grade from score ──────────────────────────────────────────────────────────
function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A'
    if (score >= 75) return 'B'
    if (score >= 60) return 'C'
    if (score >= 40) return 'D'
    return 'F'
}

// ── Category-specific mobile rules ───────────────────────────────────────────
// Different eBay categories have different mobile search patterns
export const CATEGORY_MOBILE_RULES: Record<string, {
    mustBeFirst: string[]   // word types that MUST be in position 1-2
    limitInMobile: string[]   // word types to LIMIT in mobile window
    tip: string
}> = {
    electronics: {
        mustBeFirst: ['brand', 'product'],
        limitInMobile: ['filler'],
        tip: 'Electronics buyers search Brand + Model — both must be in first 33 chars',
    },
    clothing: {
        mustBeFirst: ['brand', 'product'],
        limitInMobile: ['filler', 'spec'],
        tip: 'Clothing buyers search Brand + Item Type — put those first',
    },
    footwear: {
        mustBeFirst: ['brand', 'product'],
        limitInMobile: ['filler'],
        tip: 'Footwear buyers search Brand + Style — both must be mobile-visible',
    },
    collectibles: {
        mustBeFirst: ['product', 'brand'],
        limitInMobile: ['filler'],
        tip: 'Collectors search by item name + condition grade — both must be early',
    },
    automotive: {
        mustBeFirst: ['brand', 'product'],
        limitInMobile: ['filler', 'other'],
        tip: 'Auto parts buyers search Make + Part — critical to be in first 33 chars',
    },
    toys: {
        mustBeFirst: ['brand', 'product'],
        limitInMobile: ['filler'],
        tip: 'Toy buyers search by Brand + Toy Name — both mobile-visible',
    },
    default: {
        mustBeFirst: ['brand', 'product'],
        limitInMobile: ['filler'],
        tip: 'Put brand and product name in first 33 chars for mobile visibility',
    },
}

// ── MAIN ANALYSIS FUNCTION ────────────────────────────────────────────────────
export function analyseMobile(
    title: string,
    condition: Condition = 'unknown',
    category: string = 'default',
    buyerData?: BuyerSearchResult,
    compData?: CompetingTitleResult,
): MobileAnalysis {
    const words = title.split(/\s+/)
    const window = getMobileWindow(title)
    const brandResult = detectBrand(title, compData?.position1Words ?? [])

    // ── Score every word for mobile importance ──────────────────────────────────
    let charPos = 0
    const wordScores: MobileWordScore[] = words.map((word, i) => {
        const thisCharPos = charPos
        charPos += (i > 0 ? 1 : 0) + word.length

        const { score, reason } = scoreMobileImportance(word, i, brandResult, buyerData, compData)
        const type = classifyWordType(word, brandResult)

        // Check condition word
        const wordType: MobileWordScore['type'] = (() => {
            const wl = word.toLowerCase()
            for (const [cond, words] of Object.entries(CONDITION_RULES)) {
                if ((words as any).protectedWords?.has(wl)) return 'condition'
            }
            return type
        })()

        return {
            word,
            score,
            inMobile: thisCharPos < MOBILE_CHAR_LIMIT,
            position: i,
            charPosition: thisCharPos,
            reason,
            type: wordType,
        }
    })

    // ── Split into mobile/hidden ──────────────────────────────────────────────
    const mobileWords = wordScores.filter(w => w.inMobile)
    const hiddenWords = wordScores.filter(w => !w.inMobile)
    const misplaced = hiddenWords
        .filter(w => w.score >= 65)
        .sort((a, b) => b.score - a.score)

    // ── Detect anti-patterns ─────────────────────────────────────────────────
    const antiPatterns = detectAntiPatterns(title, wordScores, brandResult, condition)

    // ── Calculate score ───────────────────────────────────────────────────────
    const score = calcMobileScore(wordScores)
    const grade = scoreToGrade(score)

    // ── Build optimal order ───────────────────────────────────────────────────
    const optimalWords = buildOptimalOrder(words, wordScores, condition)
    const reorderedTitle = optimalWords.join(' ').slice(0, 80)
    const reorderedScores = analyseMobileScore(reorderedTitle, condition, buyerData, compData)
    const mobileScore = reorderedScores

    // ── What should the ideal 33 chars look like? ─────────────────────────────
    const optimalWindow = getMobileWindow(reorderedTitle).visible

    // ── Generate tips ─────────────────────────────────────────────────────────
    const tips: string[] = []
    const catRule = CATEGORY_MOBILE_RULES[category] ?? CATEGORY_MOBILE_RULES.default

    for (const ap of antiPatterns) {
        tips.push(ap.fix)
    }

    if (misplaced.length > 0 && tips.length < 3) {
        tips.push(`Move "${misplaced[0].word}" earlier — ${misplaced[0].reason}`)
    }

    if (tips.length === 0) {
        tips.push(`✅ Mobile window well optimised — ${score}/100`)
    }

    const quickFix = antiPatterns.find(ap => ap.severity === 'critical')?.fix
        ?? antiPatterns.find(ap => ap.severity === 'major')?.fix
        ?? tips[0]
        ?? '✅ No critical mobile issues found'

    return {
        window,
        score,
        grade,
        wordScores,
        mobileWords,
        hiddenWords,
        misplacedWords: misplaced,
        antiPatterns,
        tips,
        quickFix,
        optimalWindow,
        reorderedTitle,
        mobileScore,
    }
}

// ── Quick mobile score (used internally) ─────────────────────────────────────
function analyseMobileScore(
    title: string,
    condition: Condition,
    buyerData?: BuyerSearchResult,
    compData?: CompetingTitleResult,
): number {
    const words = title.split(/\s+/)
    const brandResult = detectBrand(title)
    let charPos = 0

    const wordScores: MobileWordScore[] = words.map((word, i) => {
        const thisCharPos = charPos
        charPos += (i > 0 ? 1 : 0) + word.length
        const { score, reason } = scoreMobileImportance(word, i, brandResult, buyerData, compData)
        const type = classifyWordType(word, brandResult)
        return {
            word, score,
            inMobile: thisCharPos < MOBILE_CHAR_LIMIT,
            position: i, charPosition: thisCharPos,
            reason, type,
        }
    })
    return calcMobileScore(wordScores)
}

// ── Reorder title for mobile (fast version for spin engine) ───────────────────
// Takes a title and returns mobile-optimised version
export function reorderForMobile(
    title: string,
    condition: Condition = 'unknown',
    buyerData?: BuyerSearchResult,
    compData?: CompetingTitleResult,
): {
    title: string
    scoreBefore: number
    scoreAfter: number
    improved: boolean
} {
    const before = analyseMobileScore(title, condition, buyerData, compData)
    const words = title.split(/\s+/)
    const brandResult = detectBrand(title, compData?.position1Words ?? [])
    let charPos = 0

    const wordScores: MobileWordScore[] = words.map((word, i) => {
        const thisCharPos = charPos
        charPos += (i > 0 ? 1 : 0) + word.length
        const { score, reason } = scoreMobileImportance(word, i, brandResult, buyerData, compData)
        const type = classifyWordType(word, brandResult)
        return {
            word, score,
            inMobile: thisCharPos < MOBILE_CHAR_LIMIT,
            position: i, charPosition: thisCharPos,
            reason, type,
        }
    })

    const optimal = buildOptimalOrder(words, wordScores, condition)
    const result = optimal.join(' ').slice(0, 80)
    const after = analyseMobileScore(result, condition, buyerData, compData)

    return {
        title: result,
        scoreBefore: before,
        scoreAfter: after,
        improved: after > before,
    }
}

// ── Check if a word should be in the mobile window ────────────────────────────
// Used by spin engine to decide injection position
export function shouldBeInMobileWindow(
    word: string,
    title: string,
    buyerData?: BuyerSearchResult,
    compData?: CompetingTitleResult,
): boolean {
    const brandResult = detectBrand(title)
    const { score } = scoreMobileImportance(word, 0, brandResult, buyerData, compData)
    return score >= 65  // 65+ = important enough for mobile window
}

// ── Get mobile gap keywords (what's missing from mobile window) ────────────────
export function getMobileGapKeywords(
    title: string,
    buyerData?: BuyerSearchResult,
): string[] {
    if (!buyerData) return []

    const window = getMobileWindow(title)
    const vis = window.visible.toLowerCase()

    // Power keywords not in mobile window
    return buyerData.powerKeywords
        .filter(k => !vis.includes(k.kw.toLowerCase()))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(k => k.kw)
}

// ── Competing titles mobile analysis ─────────────────────────────────────────
// What do top sellers put in THEIR first 33 chars?
export function analyseCompetingMobile(
    competingTitles: string[],
): {
    commonMobileWords: { word: string; frequency: number }[]
    avgMobileScore: number
    topMobilePatterns: string[]
} {
    if (competingTitles.length === 0) {
        return { commonMobileWords: [], avgMobileScore: 0, topMobilePatterns: [] }
    }

    // Get mobile window of each competing title
    const windows = competingTitles.map(t => getMobileWindow(t).visible.toLowerCase())

    // Count word frequency in mobile windows
    const wordCounts = new Map<string, number>()
    for (const win of windows) {
        const winWords = win.split(/\s+/).filter(w => w.length >= 3)
        const seen = new Set<string>()
        for (const w of winWords) {
            if (!seen.has(w) && !isFillerWithContext(w, '', '')) {
                seen.add(w)
                wordCounts.set(w, (wordCounts.get(w) ?? 0) + 1)
            }
        }
    }

    const commonMobileWords = [...wordCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word, count]) => ({
            word,
            frequency: Math.round((count / windows.length) * 100),
        }))

    // Average mobile score of competing titles
    const scores = competingTitles.map(t =>
        analyseMobileScore(t, 'unknown')
    )
    const avgMobileScore = Math.round(
        scores.reduce((s, sc) => s + sc, 0) / scores.length
    )

    // Most common mobile window patterns (first 3 word types)
    const patterns = competingTitles.map(t => {
        const words = t.split(/\s+/).slice(0, 4)
        const brand = detectBrand(t)
        return words.map(w => classifyWordType(w, brand)).slice(0, 3).join('→')
    })
    const patternCounts = new Map<string, number>()
    for (const p of patterns) {
        patternCounts.set(p, (patternCounts.get(p) ?? 0) + 1)
    }
    const topMobilePatterns = [...patternCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([p]) => p)

    return { commonMobileWords, avgMobileScore, topMobilePatterns }
}
