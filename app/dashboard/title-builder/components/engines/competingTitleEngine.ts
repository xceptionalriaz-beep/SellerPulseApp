// ── competingTitleEngine.ts ───────────────────────────────────────────────────
// Step 6 of the Title Engine Learning Path: Learn From Competing Titles
//
// Purpose:
//   Analyses the fullTitle of top competing eBay listings to learn what
//   winning titles look like for this exact product. The engine extracts
//   word frequency, word position, title structure patterns, and competitive
//   differentiation opportunities.
//
// How it works:
//   1. Word frequency — which words appear in most competing titles?
//   2. Word position — where do top sellers put each word?
//   3. Title structure — what's the winning formula (noun→spec→buyer)?
//   4. Must-have words — appear in 60%+ of titles = industry standard
//   5. Missing words — in competing titles but NOT in your title
//   6. Differentiation — words used by some sellers but not all = opportunity
//   7. Overused words — in 90%+ of titles = saturated, no advantage
//   8. Optimal length — what length do top sellers aim for?
//   9. Position 1 word — what do top sellers put first?
//  10. Combined score — how does your title compare to top sellers?
// ─────────────────────────────────────────────────────────────────────────────

import { isFillerWithContext, FILLER_SAFE_LIST } from './fillerWords'
import { isSpecWord } from './specWords'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CompetingListing {
    kw: string    // display title (first 65 chars)
    fullTitle?: string    // complete eBay listing title (up to 80 chars)
    search: string    // search volume
    comp: string    // competition %
    image?: string
    url?: string
}

export interface WordStat {
    word: string
    count: number    // how many titles contain this word
    frequency: number    // 0-100 percentage of titles
    avgPosition: number   // average position in title (0 = first word)
    positions: number[]  // all positions this word appears at
    isSpec: boolean   // is this a spec word?
    isFiller: boolean   // is this a filler word?
}

export interface TitleStructure {
    pattern: string[]  // e.g. ['product', 'function', 'spec', 'buyer', 'size']
    example: string    // best example title matching this pattern
    frequency: number    // how many titles follow this pattern
}

export interface CompetingTitleResult {
    // Word frequency stats
    wordStats: WordStat[]       // all words sorted by frequency
    mustHaveWords: string[]         // 60%+ of competing titles use these
    strongWords: string[]         // 40-59% of competing titles use these
    optionalWords: string[]         // 20-39% — differentiators
    overusedWords: string[]         // 90%+ — saturated, no advantage

    // What YOUR title is missing vs competitors
    missingMustHave: string[]         // critical gaps
    missingStrong: string[]         // strong gaps
    missingOptional: string[]         // differentiation opportunities

    // Title structure
    avgTitleLength: number           // average chars in competing titles
    avgWordCount: number           // average word count
    optimalLength: number           // recommended target length
    titleStructure: TitleStructure   // winning structure pattern

    // Position intelligence
    position1Words: string[]         // most common first words in competing titles
    position2Words: string[]         // most common second words
    earlyWords: string[]         // words that almost always appear early (pos 0-2)
    lateWords: string[]         // words that almost always appear late (pos 5+)

    // Competitive scoring
    competitiveScore: number           // 0-100 how close your title is to top sellers
    competitiveTip: string           // specific actionable advice

    // Significant phrases (bigrams) found across competing titles
    significantBigrams: string[]        // 2-word phrases used by 20%+ of top sellers

    // Injection queue for spin engine
    injectionQueue: string[]         // ordered by importance — inject from start

    // Confidence level based on how many titles were analysed
    confidence: 'high' | 'medium' | 'low' | 'none'

    // Raw stats
    totalAnalysed: number           // how many competing titles were analysed
    validTitles: number           // titles with full 40+ char content
}

// ── Word position categories ──────────────────────────────────────────────────
type WordRole = 'product' | 'function' | 'spec' | 'buyer' | 'size' |
    'colour' | 'material' | 'brand' | 'condition' | 'modifier' | 'unknown'

// ── Classify what role a word plays ──────────────────────────────────────────
function classifyWordRole(word: string): WordRole {
    const w = word.toLowerCase()

    // Condition — always goes near end of title
    if (/^(new|used|refurbished|sealed|mint|graded|faulty|spares|repair|untested|broken)$/.test(w))
        return 'condition'

    // Colour — usually mid-to-late position
    if (/^(black|white|red|blue|green|pink|grey|gray|silver|gold|purple|navy|clear|rose|beige|brown|orange|yellow|cream|ivory|teal|turquoise|magenta|coral|khaki|olive)$/.test(w))
        return 'colour'

    // Material — usually mid position
    if (/^(leather|steel|wood|cotton|silicone|rubber|nylon|bamboo|ceramic|plastic|aluminium|aluminum|stainless|velvet|suede|canvas|denim|linen|mesh|foam|acrylic|glass|chrome|brass|copper|titanium|carbon|fibre|fiber|waterproof|washable)$/.test(w))
        return 'material'

    // Size — usually late position
    if (/^(small|large|medium|mini|giant|xl|xs|xxl|xxxl|compact|portable|lightweight|heavy|jumbo|micro|nano|slim|thin|wide|narrow|long|short|tall|extra|oversized|travel|full|half)$/.test(w))
        return 'size'

    // Buyer intent — can go early or late depending on product
    if (/^(gift|present|birthday|christmas|xmas|bundle|pack|set|kit|pair|combo|lot|bulk|multipack|value|bargain|deal|kids|boys|girls|men|women|ladies|mens|unisex|adults|children|baby|toddler|puppy|kitten|pet|dog|cat)$/.test(w))
        return 'buyer'

    // Function/use — usually early position (what it does)
    if (/^(interactive|automatic|electric|smart|wireless|rechargeable|cordless|foldable|adjustable|rotatable|collapsible|portable|wearable|waterproof|dustproof|shockproof|anti|non|self|remote|solar|usb|bluetooth|digital|magnetic|thermal|optical|motion|sensor|voice|touch|dual|multi|single|double|triple|fast|quick|slow|heavy|light|auto|manual|wall|desk|floor|ceiling|outdoor|indoor|under|over|counter|mounted|hanging|standing|folding|rolling|sliding|spinning|rotating|floating|led|rgb|dimmable|rechargeable|expandable|stackable|nestable|modular)$/.test(w))
        return 'function'

    // Brand modifier — authentic/genuine signals
    if (/^(genuine|official|original|authentic|branded|oem|compatible|replacement|universal|generic)$/.test(w))
        return 'brand'

    if (isSpecWord(word)) return 'spec'
    return 'unknown'
}

// ── Clean a title for analysis ────────────────────────────────────────────────
function cleanTitle(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s\-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

// ── Extract meaningful words from a title ─────────────────────────────────────
// Short words that ARE meaningful in eBay titles
const SHORT_MEANINGFUL = new Set(['xl', 'xs', 'uk', 'us', 'eu', 'au', 'ca', '2x', '3x', '4x', '5x', 'hd', '4k', '8k', 'uv', 'ir', 'ac', 'dc', 'usb', 'led', 'rgb', 'lcd', 'aaa', 'aa'])

function extractWords(title: string): string[] {
    return cleanTitle(title)
        .split(/\s+/)
        .filter(w => {
            if (w.length < 2) return false
            if (SHORT_MEANINGFUL.has(w)) return true   // always keep meaningful short words
            if (w.length < 3) return false
            if (/^\d+$/.test(w)) return false          // pure numbers = no value
            return true
        })
}

// ── Get the best title to use (fullTitle preferred over kw) ───────────────────
function getBestTitle(listing: CompetingListing): string | null {
    const full = listing.fullTitle?.trim()
    const kw = listing.kw?.trim()

    // Prefer fullTitle if it's a real title (not just keywords)
    // 30 char minimum — shorter strings are keyword fragments, not real titles
    if (full && full.length >= 30) return full
    if (kw && kw.length >= 30) return kw
    return null
}

// ── MAIN ANALYSIS FUNCTION ────────────────────────────────────────────────────
export function analyseCompetingTitles(
    competingListings: CompetingListing[],
    currentTitle: string,
): CompetingTitleResult {

    const titleLower = currentTitle.toLowerCase()

    // ── 1. Extract valid titles ─────────────────────────────────────────────────
    const validTitleStrings: string[] = []
    for (const listing of competingListings) {
        const title = getBestTitle(listing)
        if (title) validTitleStrings.push(title)
    }

    const totalAnalysed = competingListings.length
    const validTitles = validTitleStrings.length

    // Not enough data — return empty result
    if (validTitles < 3) {
        return emptyResult(totalAnalysed, validTitles)
    }

    // ── 2. Word frequency analysis ─────────────────────────────────────────────
    // For each word: count how many titles contain it + track positions
    const wordMap = new Map<string, { titles: Set<number>; positions: number[] }>()

    validTitleStrings.forEach((title, titleIdx) => {
        const words = extractWords(title)
        const seen = new Set<string>()  // prevent double-counting same word in same title

        words.forEach((word, pos) => {
            if (seen.has(word)) return
            seen.add(word)

            if (!wordMap.has(word)) {
                wordMap.set(word, { titles: new Set(), positions: [] })
            }
            const entry = wordMap.get(word)!
            entry.titles.add(titleIdx)
            entry.positions.push(pos)
        })
    })

    // ── 2b. Bigram analysis — detect common 2-word phrases ────────────────────
    // e.g. "cat toy", "interactive ball", "USB charging" — phrases are more specific
    const bigramMap = new Map<string, number>()
    for (const title of validTitleStrings) {
        const words = extractWords(title)
        const seenBigrams = new Set<string>()
        for (let i = 0; i < words.length - 1; i++) {
            const bigram = `${words[i]} ${words[i + 1]}`
            if (!seenBigrams.has(bigram)) {
                seenBigrams.add(bigram)
                bigramMap.set(bigram, (bigramMap.get(bigram) ?? 0) + 1)
            }
        }
    }
    // Keep bigrams that appear in 20%+ of titles — these are significant phrases
    const significantBigrams = [...bigramMap.entries()]
        .filter(([, count]) => count / validTitles >= 0.2)
        .sort((a, b) => b[1] - a[1])
        .map(([bigram]) => bigram)

    // ── 3. Build word stats ─────────────────────────────────────────────────────
    const wordStats: WordStat[] = []

    for (const [word, data] of wordMap.entries()) {
        const count = data.titles.size
        const frequency = Math.round((count / validTitles) * 100)
        const avgPos = data.positions.reduce((s, p) => s + p, 0) / data.positions.length
        const isFiller = isFillerWithContext(word, '', '') && !FILLER_SAFE_LIST.has(word)
        const isSpec = !!isSpecWord(word)

        wordStats.push({
            word,
            count,
            frequency,
            avgPosition: Math.round(avgPos * 10) / 10,
            positions: data.positions,
            isSpec,
            isFiller,
        })
    }

    // Sort by frequency desc, then alphabetically
    wordStats.sort((a, b) => b.frequency - a.frequency || a.word.localeCompare(b.word))

    // ── 4. Categorise by frequency ─────────────────────────────────────────────
    // Skip filler and very common stop words in these lists
    const meaningfulStats = wordStats.filter(w => !w.isFiller && w.word.length >= 3)

    const mustHaveWords = meaningfulStats.filter(w => w.frequency >= 60).map(w => w.word)
    const strongWords = meaningfulStats.filter(w => w.frequency >= 40 && w.frequency < 60).map(w => w.word)
    const optionalWords = meaningfulStats.filter(w => w.frequency >= 20 && w.frequency < 40).map(w => w.word)
    const overusedWords = meaningfulStats.filter(w => w.frequency >= 90).map(w => w.word)

    // ── 5. What's missing from current title ───────────────────────────────────
    const missingMustHave = mustHaveWords.filter(w => !titleLower.includes(w))
    const missingStrong = strongWords.filter(w => !titleLower.includes(w))
    const missingOptional = optionalWords.filter(w => !titleLower.includes(w))

    // ── 6. Length analysis ─────────────────────────────────────────────────────
    const lengths = validTitleStrings.map(t => t.length)
    const avgTitleLength = Math.round(lengths.reduce((s, l) => s + l, 0) / lengths.length)
    const wordCounts = validTitleStrings.map(t => extractWords(t).length)
    const avgWordCount = Math.round(wordCounts.reduce((s, w) => s + w, 0) / wordCounts.length)

    // Top sellers aim for 75-80 chars — that should be our target
    const optimalLength = Math.min(80, Math.max(avgTitleLength, 70))

    // ── 7. Position analysis ───────────────────────────────────────────────────
    // What word is at position 0, 1, 2 most often?
    const pos0Words = new Map<string, number>()
    const pos1Words = new Map<string, number>()
    const pos2Words = new Map<string, number>()

    for (const title of validTitleStrings) {
        const words = extractWords(title)
        if (words[0]) pos0Words.set(words[0], (pos0Words.get(words[0]) ?? 0) + 1)
        if (words[1]) pos1Words.set(words[1], (pos1Words.get(words[1]) ?? 0) + 1)
        if (words[2]) pos2Words.set(words[2], (pos2Words.get(words[2]) ?? 0) + 1)
    }

    const position1Words = [...pos0Words.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([w]) => w)
        .filter(w => !isFillerWithContext(w, '', '') || FILLER_SAFE_LIST.has(w))

    const position2Words = [...pos1Words.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([w]) => w)
        .filter(w => !isFillerWithContext(w, '', '') || FILLER_SAFE_LIST.has(w))

    // Words that almost always appear early (avg position < 2)
    const earlyWords = meaningfulStats
        .filter(w => w.avgPosition < 2 && w.frequency >= 30)
        .map(w => w.word)

    // Words that almost always appear late (avg position > 5)
    const lateWords = meaningfulStats
        .filter(w => w.avgPosition > 5 && w.frequency >= 30)
        .map(w => w.word)

    // ── 8. Title structure ─────────────────────────────────────────────────────
    const titleStructure = detectTitleStructure(validTitleStrings)

    // ── 9. Competitive score ───────────────────────────────────────────────────
    const { score: competitiveScore, tip: competitiveTip } = scoreCompetitiveness(
        currentTitle,
        mustHaveWords,
        strongWords,
        avgTitleLength,
        position1Words,
    )

    // ── 10. Build injection queue ──────────────────────────────────────────────
    // Priority: missing must-have → missing strong → missing optional
    // Within each tier: early words first (they belong near start)
    const sortByPosition = (a: string, b: string) => {
        const aPos = wordStats.find(w => w.word === a.toLowerCase())?.avgPosition ?? 99
        const bPos = wordStats.find(w => w.word === b.toLowerCase())?.avgPosition ?? 99
        return aPos - bPos  // lower position = inject earlier
    }

    // Build injection queue with deduplication
    const queueSeen = new Set<string>()
    const injectionQueue: string[] = []
    for (const kw of [
        ...missingMustHave.sort(sortByPosition),
        ...missingStrong.sort(sortByPosition),
        ...missingOptional.sort(sortByPosition).slice(0, 3),
    ]) {
        const kwl = kw.toLowerCase()
        if (!queueSeen.has(kwl)) {
            queueSeen.add(kwl)
            injectionQueue.push(kw)
        }
    }

    return {
        confidence: (validTitles >= 20 ? 'high'
            : validTitles >= 10 ? 'medium'
                : validTitles >= 3 ? 'low'
                    : 'none') as 'high' | 'medium' | 'low' | 'none',
        wordStats,
        mustHaveWords,
        strongWords,
        optionalWords,
        overusedWords,
        missingMustHave,
        missingStrong,
        missingOptional,
        avgTitleLength,
        avgWordCount,
        optimalLength,
        titleStructure,
        position1Words,
        position2Words,
        earlyWords,
        lateWords,
        competitiveScore,
        competitiveTip,
        significantBigrams,
        injectionQueue,
        totalAnalysed,
        validTitles,
    }
}

// ── Detect the winning title structure pattern ────────────────────────────────
function detectTitleStructure(titles: string[]): TitleStructure {
    // Classify each word in each title by its role
    const patternCounts = new Map<string, { count: number; example: string }>()

    for (const title of titles) {
        const words = extractWords(title)
        const pattern = words.slice(0, 6).map(w => classifyWordRole(w)).join('→')
        const existing = patternCounts.get(pattern)
        if (existing) {
            existing.count++
        } else {
            patternCounts.set(pattern, { count: 1, example: title })
        }
    }

    // Find most common pattern
    const best = [...patternCounts.entries()]
        .sort((a, b) => b[1].count - a[1].count)[0]

    if (!best) {
        return { pattern: ['unknown'], example: titles[0] ?? '', frequency: 0 }
    }

    return {
        pattern: best[0].split('→'),
        example: best[1].example,
        frequency: Math.round((best[1].count / titles.length) * 100),
    }
}

// ── Score how competitive the current title is vs top sellers ─────────────────
function scoreCompetitiveness(
    currentTitle: string,
    mustHaveWords: string[],
    strongWords: string[],
    avgLength: number,
    position1Words: string[],
): { score: number; tip: string } {
    const titleLower = currentTitle.toLowerCase()
    let score = 0
    const tips: string[] = []

    // Must-have words coverage (50 points max)
    const mustCovered = mustHaveWords.filter(w => titleLower.includes(w)).length
    const mustTotal = mustHaveWords.length || 1
    const mustScore = Math.round((mustCovered / mustTotal) * 50)
    score += mustScore

    if (mustCovered < mustTotal) {
        const missing = mustHaveWords.filter(w => !titleLower.includes(w))
        const actualFreq = Math.round((mustCovered / mustTotal) * 100)
        tips.push(`Add "${missing[0]}" — used by 60%+ of top sellers`)
    }

    // Strong words coverage (25 points max)
    const strongCovered = strongWords.filter(w => titleLower.includes(w)).length
    const strongTotal = Math.min(strongWords.length, 5) || 1
    const strongScore = Math.round((strongCovered / strongTotal) * 25)
    score += strongScore

    // Length score (15 points max)
    const lengthDiff = Math.abs(currentTitle.length - avgLength)
    const lengthScore = lengthDiff <= 5 ? 15
        : lengthDiff <= 10 ? 10
            : lengthDiff <= 20 ? 5
                : 0
    score += lengthScore

    if (currentTitle.length < avgLength - 10) {
        tips.push(`Title is ${avgLength - currentTitle.length} chars shorter than top sellers`)
    }

    // Position 1 match (10 points max)
    const firstWord = currentTitle.trim().split(/\s+/)[0]?.toLowerCase() ?? ''
    const pos1Match = position1Words.includes(firstWord)
    const pos1Score = pos1Match ? 10 : 0
    score += pos1Score

    if (!pos1Match && position1Words.length > 0) {
        tips.push(`Top sellers start with "${position1Words[0]}" — consider reordering`)
    }

    const tip = tips.length > 0 ? tips[0] : '✅ Title closely matches top seller patterns'

    return { score: Math.min(100, score), tip }
}

// ── COMBINED ANALYSIS ─────────────────────────────────────────────────────────
// Merges Step 5 (buyer search) + Step 6 (competing titles) into one
// unified injection queue. This is what the spin engine actually uses.
export function buildCombinedInjectionQueue(
    buyerQueue: string[],   // from analyseBuyerSearch().injectionQueue
    competingQueue: string[],   // from analyseCompetingTitles().injectionQueue
    currentTitle: string,
    maxLength: number = 80,
): string[] {
    const titleLower = currentTitle.toLowerCase()
    const seen = new Set<string>()
    const combined: string[] = []

    // Interleave: competing (industry standard) → buyer (search demand)
    // Must-have from competing titles always win because they're eBay algorithm signals
    const maxItems = 20

    // Add competing queue items first (they're industry standards)
    for (const kw of competingQueue) {
        const kwl = kw.toLowerCase()
        if (seen.has(kwl) || titleLower.includes(kwl)) continue
        // No length check here — caller handles title length during injection
        seen.add(kwl)
        combined.push(kw)
        if (combined.length >= maxItems / 2) break
    }

    // Then buyer search queue (what buyers type)
    for (const kw of buyerQueue) {
        const kwl = kw.toLowerCase()
        if (seen.has(kwl) || titleLower.includes(kwl)) continue
        if (combined.length >= maxItems) break
        seen.add(kwl)
        combined.push(kw)
    }

    return combined
}

// ── WORD FREQUENCY SUMMARY ────────────────────────────────────────────────────
// Returns a quick summary of the top N most used words by competitors.
// Used by TbProHud to show "What top sellers use" section.
export function getTopCompetitorWords(
    result: CompetingTitleResult,
    currentTitle: string = '',
    maxWords: number = 10,
): { word: string; frequency: number; inCurrentTitle: boolean }[] {
    const titleLower = currentTitle.toLowerCase()
    return result.wordStats
        .filter(w => !w.isFiller && w.word.length >= 3)
        .slice(0, maxWords)
        .map(w => ({
            word: w.word,
            frequency: w.frequency,
            inCurrentTitle: titleLower.includes(w.word.toLowerCase()),
        }))
}

// ── TITLE POSITION ADVISOR ────────────────────────────────────────────────────
// Tells you where each word should ideally be placed based on what
// top sellers do. Used to reorder words in CLEAN_TIGHTEN mode.
export function getIdealWordOrder(
    words: string[],
    result: CompetingTitleResult,
): string[] {
    return [...words].sort((a, b) => {
        const aPos = result.wordStats.find(w => w.word === a.toLowerCase())?.avgPosition ?? 50
        const bPos = result.wordStats.find(w => w.word === b.toLowerCase())?.avgPosition ?? 50
        return aPos - bPos
    })
}

// ── EMPTY RESULT (when not enough data) ──────────────────────────────────────
function emptyResult(totalAnalysed: number, validTitles: number): CompetingTitleResult {
    return {
        wordStats: [],
        mustHaveWords: [],
        strongWords: [],
        optionalWords: [],
        overusedWords: [],
        missingMustHave: [],
        missingStrong: [],
        missingOptional: [],
        avgTitleLength: 75,
        avgWordCount: 8,
        optimalLength: 78,
        titleStructure: { pattern: [], example: '', frequency: 0 },
        position1Words: [],
        position2Words: [],
        earlyWords: [],
        lateWords: [],
        competitiveScore: 0,
        confidence: 'none' as const,
        competitiveTip: 'Not enough competing titles to analyse',
        significantBigrams: [],
        injectionQueue: [],
        totalAnalysed,
        validTitles,
    }
}
