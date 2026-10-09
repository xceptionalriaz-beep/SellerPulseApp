// ── conditionEngine.ts ────────────────────────────────────────────────────────
// Step 8 of the Title Engine Learning Path: Learn Condition Rules
//
// Purpose:
//   Teaches the engine that NEW and USED items need completely different
//   keywords, positions, and injection strategies. A "Gift" keyword is
//   perfect for new items but wrong for faulty ones. "Working Order" is
//   great for used but unnecessary for sealed new items.
//
// How it works:
//   1. Detect condition precisely (new/used/faulty/refurbished/unknown)
//   2. Define which keywords are SAFE, BANNED, and PREFERRED per condition
//   3. Define where condition words must appear (position rules)
//   4. Filter injection queue — remove wrong-condition keywords
//   5. Inject condition-appropriate keywords from live buyer data
//   6. Protect condition words — never remove or swap them
//   7. Score how well the title matches its condition pattern
// ─────────────────────────────────────────────────────────────────────────────

import { CONDITION_WORDS, detectConditionFull } from './productNouns'

// Current year — used for 'Latest 2024' style keywords
const CURRENT_YEAR = new Date().getFullYear().toString()
const NEXT_YEAR = (new Date().getFullYear() + 1).toString()

// ── Types ─────────────────────────────────────────────────────────────────────
export type Condition = 'new' | 'used' | 'faulty' | 'refurbished' | 'unknown'

export interface ConditionRule {
    condition: Condition

    // Words that MUST stay in the title — never remove
    protectedWords: Set<string>

    // Words that must NEVER be injected for this condition
    bannedInject: Set<string>

    // Words that are ideal to inject for this condition
    preferredInject: string[]

    // Where condition words should appear in the title
    // 'early' = first 33 chars, 'mid' = chars 20-50, 'late' = last 30 chars
    conditionPosition: 'early' | 'mid' | 'late'

    // Should condition word be in first 33 chars (mobile visible)?
    mobileVisible: boolean

    // Buyer intent signals specific to this condition
    buyerSignals: string[]
}

export interface ConditionAnalysis {
    condition: Condition
    detectedWord: string | null    // the actual word found e.g. "Grade A"
    rule: ConditionRule
    isCorrectlyPositioned: boolean    // is condition word in right place?
    positionTip: string           // advice on where to move condition word
    missingPreferred: string[]        // preferred words not yet in title
    bannedPresent: string[]         // banned words that ARE in title (to remove)
    conditionScore: number           // 0-100 how well title follows condition rules
}

// ── New item keywords ─────────────────────────────────────────────────────────
const NEW_PROTECTED = new Set([
    'new', 'brand new', 'brand-new', 'sealed', 'unopened', 'unused', 'unboxed',
    'boxed', 'mint', 'pristine', 'immaculate', 'bnib', 'bnwt', 'bnwob',
    'new with tags', 'new without tags', 'new in box', 'new in packaging',
    'factory sealed', 'shrink wrapped', 'shrink-wrapped',
    // Additional new descriptors
    'nos', 'new old stock', 'deadstock', 'dead stock', 'shelf pull',
    'ex stock', 'overstock', 'surplus stock', 'new surplus',
    'new and sealed', 'new and boxed', 'complete in box', 'cib',
    'never opened', 'never used', 'never worn', 'still tagged',
    'tags attached', 'tags on', 'with tags', 'original tags',
])

const NEW_BANNED_INJECT = new Set([
    'used', 'pre-owned', 'preowned', 'second hand', 'secondhand', 'preloved',
    'pre-loved', 'good condition', 'vgc', 'worn', 'heavily used', 'well used',
    'faulty', 'broken', 'damaged', 'spares', 'parts only', 'for parts',
    'untested', 'not working', 'cracked', 'scratched', 'dented', 'as is',
    'refurbished', 'reconditioned', 'restored', 'graded',
    'working order', 'good working order', 'ex display', 'open box',
])

const NEW_PREFERRED_INJECT = [
    'Gift', 'Present', 'Birthday', 'Christmas',
    'Latest', CURRENT_YEAR, NEXT_YEAR,
    'Fast Dispatch', 'Same Day',
    'Ideal Gift', 'Perfect Gift',
]

// ── Used item keywords ─────────────────────────────────────────────────────────
const USED_PROTECTED = new Set([
    'used', 'pre-owned', 'pre owned', 'second hand', 'secondhand', 'preloved',
    'pre-loved', 'good condition', 'very good', 'near mint', 'vgc', 'excellent',
    'fair condition', 'poor condition', 'heavily used', 'well used', 'worn',
    // Additional common used descriptors
    'good nick', 'gwo', 'g.w.o', 'hardly used', 'lightly used', 'light use',
    'light wear', 'used once', 'used twice', 'barely used', 'gently used',
    'well cared for', 'cared for', 'loved', 'well loved', 'pre used',
    'previously used', 'previously owned', 'ex personal use',
    'ex display', 'ex demo', 'open box', 'returned', 'return',
])

const USED_BANNED_INJECT = new Set([
    'new', 'brand new', 'brand-new', 'sealed', 'unopened', 'bnib', 'bnwt', 'factory sealed',
    'gift', 'present', 'birthday gift', 'christmas gift', 'ideal gift',
    'perfect gift', 'new with tags', 'new in box',
])

const USED_PREFERRED_INJECT = [
    'Genuine', 'Authentic', 'Original',
    'Fully Working', 'Tested Working', 'Good Working Order',
    'Clean', 'Well Maintained',
    'Extras Included',
]

// ── Faulty item keywords ───────────────────────────────────────────────────────
const FAULTY_PROTECTED = new Set([
    'faulty', 'broken', 'damaged', 'spares', 'parts only', 'for parts', 'spares only',
    'untested', 'not working', 'dead', 'cracked', 'scratched', 'dented',
    'as is', 'as seen', 'sold as seen', 'read description', 'repair',
    // Additional common faulty descriptors
    'no power', 'wont turn on', 'wont power on', 'wont boot',
    'smashed screen', 'cracked screen', 'broken screen', 'smashed glass',
    'water damage', 'liquid damage', 'flood damage', 'moisture damage',
    'board fault', 'motherboard fault', 'software fault', 'logic board',
    'intermittent fault', 'cutting out', 'overheating', 'no display',
    'stuck pixels', 'dead pixels', 'lines on screen',
    'collection only', 'local collection', 'as found', 'untried',
])

const FAULTY_BANNED_INJECT = new Set([
    'new', 'brand new', 'sealed', 'bnib', 'gift', 'present', 'mint', 'pristine',
    'working', 'fully working', 'tested working', 'good condition', 'vgc',
    'perfect', 'immaculate',
])

const FAULTY_PREFERRED_INJECT = [
    'Spares', 'Repair', 'For Parts', 'Parts Only',
    'As Is', 'Sold As Seen',
    'Untested', 'Read Description',
    'Project', 'Restoration Project',
    'Dismantled', 'For Scrap',
]

// ── Refurbished item keywords ──────────────────────────────────────────────────
const REFURB_PROTECTED = new Set([
    'refurbished', 'reconditioned', 'restored', 'renewed', 'remanufactured',
    'grade a', 'grade b', 'grade c', 'grade d', 'ex display', 'ex demo',
    'open box', 'tested', 'fully tested', 'tested working', 'fully working',
    'working order', 'good working order', 'graded',
])

const REFURB_BANNED_INJECT = new Set([
    'new', 'brand new', 'sealed', 'bnib', 'bnwt', 'unopened', 'factory sealed',
    'faulty', 'broken', 'damaged', 'for parts', 'as is', 'untested',
    'used', 'pre-owned', 'second hand',
])

const REFURB_PREFERRED_INJECT = [
    'Tested', 'Fully Working', 'Grade A',
    'Warranty', 'Warranty Included',
    'Professionally Refurbished', 'Quality Checked',
    'Excellent Condition', 'Perfect Working Order',
]


// Neutral keywords valid for ANY condition — injected when condition is unknown
const NEUTRAL_PREFERRED_INJECT = [
    'Genuine', 'Original', 'UK Seller',
    'Fast Dispatch', 'Quality',
]

// ── Condition rules registry ───────────────────────────────────────────────────
export const CONDITION_RULES: Record<Condition, ConditionRule> = {
    new: {
        condition: 'new',
        protectedWords: NEW_PROTECTED,
        bannedInject: NEW_BANNED_INJECT,
        preferredInject: NEW_PREFERRED_INJECT,
        conditionPosition: 'early',    // NEW goes first — buyers filter by new
        mobileVisible: true,       // must appear in first 33 chars
        buyerSignals: [
            'gift', 'present', 'birthday', 'christmas', 'sealed',
            'latest', 'current', '2024', '2025',
        ],
    },
    used: {
        condition: 'used',
        protectedWords: USED_PROTECTED,
        bannedInject: USED_BANNED_INJECT,
        preferredInject: USED_PREFERRED_INJECT,
        conditionPosition: 'late',     // USED goes after product noun — don't lead with it
        mobileVisible: false,      // product noun is more important on mobile
        buyerSignals: [
            'genuine', 'authentic', 'original', 'working',
            'bundle', 'clean', 'tested',
        ],
    },
    faulty: {
        condition: 'faulty',
        protectedWords: FAULTY_PROTECTED,
        bannedInject: FAULTY_BANNED_INJECT,
        preferredInject: FAULTY_PREFERRED_INJECT,
        conditionPosition: 'late',     // lead with what the product IS, not that it's broken
        mobileVisible: false,
        buyerSignals: [
            'spares', 'repair', 'parts', 'project', 'cheap', 'bargain',
        ],
    },
    refurbished: {
        condition: 'refurbished',
        protectedWords: REFURB_PROTECTED,
        bannedInject: REFURB_BANNED_INJECT,
        preferredInject: REFURB_PREFERRED_INJECT,
        conditionPosition: 'mid',      // after product noun, before buyer keywords
        mobileVisible: false,
        buyerSignals: [
            'tested', 'warranty', 'grade', 'professional', 'quality',
        ],
    },
    unknown: {
        condition: 'unknown',
        protectedWords: new Set(),
        bannedInject: new Set(),
        preferredInject: [],
        conditionPosition: 'late',
        mobileVisible: false,
        buyerSignals: [],
    },
}

// ── Detect condition with the word that triggered it ──────────────────────────
export function detectConditionWithWord(title: string): {
    condition: Condition
    word: string | null
    confidence: 'high' | 'medium' | 'low'
} {
    const tl = title.toLowerCase()

    // Check in priority order: faulty first (most specific), then refurb, used, new
    const order = ['faulty', 'refurbished', 'used', 'new'] as const

    for (const cond of order) {
        const words = CONDITION_WORDS[cond]
        for (const word of words) {
            // Word boundary check — prevents 'mint' matching 'peppermint sauce'
            // 'dead' matching 'dead ringer', etc.
            let matched = false
            if (word.includes(' ')) {
                matched = tl.includes(word)  // multi-word phrase — substring ok
            } else {
                const esc = word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
                matched = new RegExp(`(?<![a-z])${esc}(?![a-z])`).test(tl)
            }
            if (matched) {
                const displayWord = word.split(' ')
                    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ')
                const ambiguous = new Set(['excellent', 'mint', 'pristine', 'clean', 'tested', 'working', 'original'])
                const conf: 'high' | 'medium' | 'low' = ambiguous.has(word) ? 'medium' : 'high'
                return { condition: cond, word: displayWord, confidence: conf }
            }
        }
    }
    return { condition: 'unknown', word: null, confidence: 'low' }
}

// ── Get position of condition word in title ───────────────────────────────────
function getConditionWordPosition(title: string, conditionWord: string): number {
    const words = title.toLowerCase().split(/\s+/)
    const idx = words.findIndex(w => conditionWord.includes(w) || w.includes(conditionWord.split(' ')[0]))
    return idx === -1 ? 99 : idx
}

// ── Check if condition word is correctly positioned ───────────────────────────
function isCorrectlyPositioned(
    title: string,
    conditionWord: string,
    rule: ConditionRule,
): boolean {
    const pos = getConditionWordPosition(title, conditionWord)
    const words = title.split(/\s+/)
    const totalWords = words.length

    // Position is relative to title — ideally we'd check relative to product noun
    // but we keep it simple: early=first 3 words, mid=middle, late=last 4 words
    switch (rule.conditionPosition) {
        case 'early': return pos <= 2
        case 'mid': return pos >= 1 && pos <= totalWords - 2
        case 'late': return pos >= Math.max(2, totalWords - 4)
        default: return true
    }
}

// ── Build position tip ────────────────────────────────────────────────────────
function buildPositionTip(
    condition: Condition,
    isCorrect: boolean,
    condWord: string | null,
    rule: ConditionRule,
): string {
    if (!condWord || isCorrect) return ''

    switch (condition) {
        case 'new':
            return `Move "${condWord}" to start of title — buyers filter by New and need to see it first`
        case 'used':
            return `Move "${condWord}" towards end of title — lead with what the product IS, not that it's used`
        case 'faulty':
            return `Move "${condWord}" towards end — lead with the product name so buyers find it in search`
        case 'refurbished':
            return `Move "${condWord}" after the product name — e.g. "[Product] Refurbished Grade A [keywords]"`
        default:
            return ''
    }
}

// ── MAIN ANALYSIS FUNCTION ────────────────────────────────────────────────────
export function analyseCondition(title: string): ConditionAnalysis {
    const { condition, word: detectedWord } = detectConditionWithWord(title)
    const rule = CONDITION_RULES[condition]
    const titleLow = title.toLowerCase()

    // Is condition word correctly positioned?
    const isCorrect = detectedWord
        ? isCorrectlyPositioned(title, detectedWord, rule)
        : true

    const positionTip = buildPositionTip(condition, isCorrect, detectedWord, rule)

    // Which preferred words are missing?
    const missingPreferred = rule.preferredInject.filter(
        w => !titleLow.includes(w.toLowerCase())
    )

    // Which banned words are present?
    const bannedPresent = [...rule.bannedInject].filter(
        w => titleLow.includes(w.toLowerCase())
    )

    // Score: having NO condition word = 0 (critical failure)
    // Having wrong condition words = penalty
    let score = 0
    if (!detectedWord) {
        // No condition word at all — score 0, everything else is irrelevant
        score = 0
    } else {
        score += 40                                         // has a condition word
        if (isCorrect) score += 30             // correctly positioned
        else score -= 10             // penalty for wrong position
        if (bannedPresent.length === 0) score += 20         // no banned words present
        else score -= (bannedPresent.length * 5)            // penalty per banned word
        if (missingPreferred.length < 3) score += 10        // has some preferred words
    }

    return {
        condition,
        detectedWord,
        rule,
        isCorrectlyPositioned: isCorrect,
        positionTip,
        missingPreferred,
        bannedPresent,
        conditionScore: Math.min(100, score),
    }
}

// ── FILTER injection queue by condition ───────────────────────────────────────
// This is the key function used by the spin engine.
// Takes any injection queue and removes words banned for this condition.
export function filterByCondition(
    keywords: string[],
    condition: Condition,
): string[] {
    const rule = CONDITION_RULES[condition]
    if (condition === 'unknown') return keywords

    return keywords.filter(kw => {
        const kwl = kw.toLowerCase()
        // Check if any banned word appears in this keyword
        for (const banned of rule.bannedInject) {
            if (kwl.includes(banned)) return false
        }
        return true
    })
}

// ── CHECK if a word is protected for this condition ───────────────────────────
export function isConditionProtected(word: string, condition: Condition): boolean {
    const rule = CONDITION_RULES[condition]
    const wl = word.toLowerCase().trim()
    for (const p of rule.protectedWords) {
        if (wl === p) return true
        // Multi-word protected phrase — check exact inclusion
        if (p.includes(' ') && wl.includes(p)) return true
        // Single word — use word boundary (avoid 'mint' matching 'peppermint')
        if (!p.includes(' ')) {
            const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            if (new RegExp(`(?<![a-z])${escaped}(?![a-z])`).test(wl)) return true
        }
    }
    return false
}

// ── CHECK if a word is banned for injection in this condition ─────────────────
export function isConditionBanned(word: string, condition: Condition): boolean {
    const rule = CONDITION_RULES[condition]
    const wl = word.toLowerCase().trim()
    for (const banned of rule.bannedInject) {
        // Exact match or phrase match — never substring
        if (wl === banned) return true
        // Word boundary check for single-word bans
        if (!banned.includes(' ')) {
            const escaped = banned.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            if (new RegExp(`(?<![a-z])${escaped}(?![a-z])`).test(wl)) return true
        }
        // Multi-word ban — check exact phrase
        if (banned.includes(' ') && wl.includes(banned)) return true
    }
    return false
}

// ── GET preferred injection keywords for this condition ───────────────────────
// Returns condition-appropriate keywords not already in the title
export function getConditionKeywords(
    condition: Condition,
    title: string,
    maxWords: number = 3,
    maxLength: number = 80,  // respect title length limit
): string[] {
    const titleLow = title.toLowerCase()
    const charsLeft = maxLength - title.length

    // For unknown condition — return neutral keywords valid for any condition
    const pool = condition === 'unknown'
        ? NEUTRAL_PREFERRED_INJECT
        : CONDITION_RULES[condition].preferredInject

    return pool
        .filter(kw => {
            if (titleLow.includes(kw.toLowerCase())) return false
            if (kw.length + 1 > charsLeft) return false  // won't fit in title
            return true
        })
        .slice(0, maxWords)
}

// ── REPOSITION condition word in title ────────────────────────────────────────
// Moves the condition word to its correct position if it's in the wrong place.
// Used by CLEAN_TIGHTEN mode.
export function repositionConditionWord(
    title: string,
    condition: Condition,
    condWord: string,
): string {
    if (condition === 'unknown' || !condWord) return title

    const rule = CONDITION_RULES[condition]
    const words = title.split(/\s+/)

    // Remove condition phrase from title — handle multi-word phrases correctly
    // e.g. 'brand new' → remove 'brand' AND 'new' together, not individually
    const condLower = condWord.toLowerCase()
    const titleLower = words.map(w => w.toLowerCase()).join(' ')

    // Try to find and remove the exact phrase first
    const phraseIdx = titleLower.indexOf(condLower)
    let withoutCond: string[]
    if (phraseIdx !== -1) {
        const condWordCount = condWord.split(' ').length
        const wordsBefore = phraseIdx === 0 ? 0 : titleLower.slice(0, phraseIdx).trim().split(' ').length
        withoutCond = [...words.slice(0, wordsBefore), ...words.slice(wordsBefore + condWordCount)]
    } else {
        // Fall back to word-by-word removal
        const condParts = condLower.split(' ')
        withoutCond = words.filter(w => !condParts.includes(w.toLowerCase()))
    }

    if (withoutCond.length === words.length) return title  // word not found

    const condDisplay = condWord.split(' ').map(w =>
        w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ')

    switch (rule.conditionPosition) {
        case 'early':
            // Put at start
            return [condDisplay, ...withoutCond].join(' ').slice(0, 80)
        case 'late':
            // Put at end
            return [...withoutCond, condDisplay].join(' ').slice(0, 80)
        case 'mid':
            // Put after first 2 words
            const before = withoutCond.slice(0, 2)
            const after = withoutCond.slice(2)
            return [...before, condDisplay, ...after].join(' ').slice(0, 80)
        default:
            return title
    }
}

// ── TITLE CONDITION SCORER ────────────────────────────────────────────────────
// How well does this title follow condition best practices?
// Used by TbProHud score cards.
export function scoreConditionCompliance(
    title: string,
    condition: Condition,
): {
    score: number     // 0-100
    tip: string
} {
    if (condition === 'unknown') return { score: 50, tip: 'No condition detected in title' }

    const analysis = analyseCondition(title)

    let tip = ''
    if (!analysis.detectedWord) {
        tip = `Add a condition word (e.g. "${CONDITION_RULES[condition].preferredInject[0]}")`
    } else if (!analysis.isCorrectlyPositioned) {
        tip = analysis.positionTip
    } else if (analysis.bannedPresent.length > 0) {
        tip = `Remove "${analysis.bannedPresent[0]}" — wrong for ${condition} items`
    } else if (analysis.missingPreferred.length > 0) {
        tip = `Add "${analysis.missingPreferred[0]}" to strengthen ${condition} signal`
    } else {
        tip = `✅ Condition words correctly used for ${condition} item`
    }

    return { score: analysis.conditionScore, tip }
}


// ── Detect refurbished grade ─────────────────────────────────────────────────
// Grade A = near new condition (minimal wear)
// Grade B = light cosmetic marks, fully working
// Grade C = visible wear, fully working
// Grade D = heavy wear, may have cosmetic damage
export type RefurbGrade = 'A' | 'B' | 'C' | 'D' | 'unknown'

export function detectRefurbGrade(title: string): RefurbGrade {
    const tl = title.toLowerCase()
    if (/grade[\s-]?a\b|\ba[\s-]?grade|pristine|excellent\scondition|like new/.test(tl)) return 'A'
    if (/grade[\s-]?b\b|\bb[\s-]?grade|good\scondition|very\sgood|light\smarks/.test(tl)) return 'B'
    if (/grade[\s-]?c\b|\bc[\s-]?grade|fair\scondition|visible\swear|scratches/.test(tl)) return 'C'
    if (/grade[\s-]?d\b|\bd[\s-]?grade|heavy\swear|poor\scondition|damaged/.test(tl)) return 'D'
    return 'unknown'
}

// Grade-specific preferred keywords for refurbished items
export const REFURB_GRADE_KEYWORDS: Record<RefurbGrade, string[]> = {
    A: ['Grade A', 'Excellent Condition', 'Near Perfect', 'Fully Working', 'Tested'],
    B: ['Grade B', 'Good Condition', 'Light Marks', 'Fully Working', 'Tested'],
    C: ['Grade C', 'Fair Condition', 'Visible Marks', 'Fully Working', 'Tested'],
    D: ['Grade D', 'Heavy Wear', 'Fully Working', 'Tested', 'Cosmetic Damage'],
    unknown: ['Refurbished', 'Tested', 'Fully Working', 'Quality Checked'],
}


// ── Category-specific condition keywords ─────────────────────────────────────
// Some categories have very different condition expectations
export const CATEGORY_CONDITION_KEYWORDS: Partial<Record<string, Partial<Record<Condition, string[]>>>> = {
    electronics: {
        used: ['Tested', 'Fully Working', 'No Marks', 'Good Screen', 'Battery Good'],
        faulty: ['No Power', 'Cracked Screen', 'Water Damage', 'Board Fault', 'For Parts'],
        refurbished: ['Grade A', 'Tested', 'Battery Health Good', 'Unlocked', 'No Issues'],
    },
    clothing: {
        used: ['Washed', 'Good Condition', 'No Stains', 'No Holes', 'Smoke Free'],
        new: ['BNWT', 'Tags Attached', 'Unworn', 'Still Tagged'],
    },
    books: {
        used: ['Good Condition', 'No Writing', 'No Highlights', 'Clean Pages'],
        new: ['Unread', 'New Copy', 'No Marks'],
    },
    footwear: {
        used: ['Good Condition', 'Light Wear', 'Clean Soles', 'No Creasing'],
        new: ['Unworn', 'New in Box', 'Original Box'],
    },
    jewellery: {
        used: ['Hallmarked', 'No Damage', 'Clean', 'Polished'],
        new: ['Unworn', 'In Pouch', 'Gift Box Included'],
    },
    toys: {
        used: ['Complete', 'All Parts', 'No Missing Pieces', 'Good Condition'],
        new: ['Sealed', 'Unopened', 'In Original Packaging'],
    },
    collectibles: {
        used: ['No Damage', 'Complete', 'Original', 'Authentic'],
        new: ['Mint', 'Unplayed', 'PSA Ready', 'Near Mint'],
    },
}


// ── Seasonal condition keyword boost ─────────────────────────────────────────
// Some condition keywords perform better in specific months
export function getSeasonalConditionKeywords(
    condition: Condition,
    maxWords: number = 2,
): string[] {
    const month = new Date().getMonth() + 1  // 1-12

    if (condition === 'new') {
        // Christmas season (Nov-Dec): gift keywords rank much higher
        if (month === 11 || month === 12) {
            return ['Christmas Gift', 'Stocking Filler', 'Perfect Gift', 'Gift Idea'].slice(0, maxWords)
        }
        // Back to school (August)
        if (month === 8) {
            return ['Back to School', 'Student Essential'].slice(0, maxWords)
        }
        // Valentine's (Feb)
        if (month === 2) {
            return ['Valentine Gift', 'Gift for Her', 'Gift for Him'].slice(0, maxWords)
        }
        // Mother's Day (March UK)
        if (month === 3) {
            return ["Mother's Day Gift", 'Gift for Mum'].slice(0, maxWords)
        }
        // Father's Day (June UK)
        if (month === 6) {
            return ["Father's Day Gift", 'Gift for Dad'].slice(0, maxWords)
        }
    }

    if (condition === 'faulty') {
        // January — people buy parts to fix Christmas gifts
        if (month === 1) {
            return ['Spares', 'Repair', 'Fix Your'].slice(0, maxWords)
        }
    }

    return []
}


// ── Multi-condition conflict detection ────────────────────────────────────────
// Detects when a title has conflicting condition signals
// e.g. 'New Battery Used iPhone' — new AND used in same title
export function detectConditionConflict(title: string): {
    hasConflict: boolean
    conditions: Condition[]
    tip: string
} {
    const tl = title.toLowerCase()
    const found: Condition[] = []

    const order = ['faulty', 'refurbished', 'used', 'new'] as const
    for (const cond of order) {
        for (const word of CONDITION_WORDS[cond]) {
            if (tl.includes(word)) {
                if (!found.includes(cond)) found.push(cond)
                break
            }
        }
    }

    const hasConflict = found.length > 1 && !(
        // Refurbished + tested = OK (not a conflict)
        found.includes('refurbished') && found.length === 2 && found.includes('used')
    )

    let tip = ''
    if (hasConflict) {
        tip = `Title has conflicting conditions: ${found.join(' + ')} — pick ONE and remove the other`
    }

    return { hasConflict, conditions: found, tip }
}


// ── Smart condition suggestion ────────────────────────────────────────────────
// When condition is unknown, look at title clues to suggest what to add
export function suggestCondition(title: string): {
    suggested: Condition
    confidence: 'high' | 'medium' | 'low'
    addWord: string
    reason: string
} {
    const tl = title.toLowerCase()

    // Strong new signals
    if (/sealed|bnib|bnwt|unopened|boxed|shrink|factory/.test(tl)) {
        return { suggested: 'new', confidence: 'high', addWord: 'Brand New', reason: 'title contains packaging words' }
    }
    // Strong faulty signals
    if (/fault|broken|cracked|smashed|repair|parts|spares|damage|dead/.test(tl)) {
        return { suggested: 'faulty', confidence: 'high', addWord: 'Faulty', reason: 'title contains damage words' }
    }
    // Strong refurb signals
    if (/grade [abcd]|refurb|recon|restored|renewed|tested working/.test(tl)) {
        return { suggested: 'refurbished', confidence: 'high', addWord: 'Refurbished', reason: 'title contains refurb words' }
    }
    // Medium used signals — product categories commonly bought used
    if (/vintage|antique|retro|classic|old|original|genuine/.test(tl)) {
        return { suggested: 'used', confidence: 'medium', addWord: 'Used', reason: 'title suggests vintage/pre-owned item' }
    }
    // If nothing detected — suggest new (most common on eBay)
    return { suggested: 'new', confidence: 'low', addWord: 'New', reason: 'no condition signals found — most eBay listings are new' }
}


// ── eBay official condition IDs ──────────────────────────────────────────────
// Used when listing programmatically via eBay API
export const EBAY_CONDITION_IDS: Record<Condition, number> = {
    new: 1000,   // New
    refurbished: 2500,   // Seller Refurbished
    used: 3000,   // Used
    faulty: 7000,   // For Parts or Not Working
    unknown: 0,      // Not set
}

// eBay condition display names
export const EBAY_CONDITION_NAMES: Record<Condition, string> = {
    new: 'New',
    refurbished: 'Seller Refurbished',
    used: 'Used',
    faulty: 'For Parts or Not Working',
    unknown: 'Not Specified',
}

// ── ALL_CONDITIONS_FLAT — quick lookup set ────────────────────────────────────
// Single flat Set of every condition word across all conditions.
// Spinner uses this: "is this word ANY kind of condition word?"
export const ALL_CONDITIONS_FLAT: Set<string> = new Set([
    ...NEW_PROTECTED,
    ...USED_PROTECTED,
    ...FAULTY_PROTECTED,
    ...REFURB_PROTECTED,
])


// ── Buyer persona per condition ───────────────────────────────────────────────
// Who is BUYING items in each condition on eBay?
export const CONDITION_BUYER_PERSONA: Record<Condition, {
    type: string
    motivation: string
    keywords: string[]
}> = {
    new: {
        type: 'Gift givers, collectors, first-time buyers',
        motivation: 'Wants brand new, pristine, often buying as gift',
        keywords: ['gift', 'present', 'birthday', 'christmas', 'collection', 'sealed', 'latest'],
    },
    used: {
        type: 'Bargain hunters, replacement seekers, collectors',
        motivation: 'Wants working item at lower price than new',
        keywords: ['genuine', 'working', 'tested', 'bundle', 'extras', 'authentic', 'original'],
    },
    faulty: {
        type: 'Repair shops, hobbyists, parts hunters, DIYers',
        motivation: 'Needs specific components or to fix something',
        keywords: ['spares', 'repair', 'parts', 'project', 'fix', 'restore', 'component'],
    },
    refurbished: {
        type: 'Value seekers, eco-conscious buyers, business buyers',
        motivation: 'Wants near-new quality at reduced price with some guarantee',
        keywords: ['warranty', 'tested', 'grade', 'certified', 'quality', 'guaranteed'],
    },
    unknown: {
        type: 'General buyers',
        motivation: 'Unknown — add condition word to attract right buyer',
        keywords: [],
    },
}

// ── Recommended title word ORDER per condition ────────────────────────────────
// The winning structure template for each condition type
export const CONDITION_TITLE_TEMPLATE: Record<Condition, string> = {
    new: '[Brand] [Product] [Model] [Colour/Size] [Spec] New [Year]',
    used: '[Brand] [Product] [Model] [Spec] [Condition] [Grade/Description]',
    faulty: '[Brand] [Product] [Model] [Fault Description] Faulty Spares Repair',
    refurbished: '[Brand] [Product] [Model] [Grade] Refurbished [Spec] [Warranty]',
    unknown: '[Brand] [Product] [Model] [Spec] [Colour/Size]',
}

// ── eBay item specifics hints per condition ───────────────────────────────────
export const CONDITION_ITEM_SPECIFICS: Record<Condition, string[]> = {
    new: ['Condition: New', 'MPN (Part Number)', 'EAN/ISBN/UPC', 'Original/Licensed: Yes'],
    used: ['Condition: Used', 'Year Purchased', 'Modifications: None', 'Original Box: No'],
    faulty: ['Condition: For Parts or Not Working', 'Fault Description', 'Powers On: No', 'Model Number'],
    refurbished: ['Condition: Seller Refurbished', 'Grade (A/B/C)', 'Warranty Period', 'Tested By: Seller'],
    unknown: ['Condition: (required)', 'Model Number', 'Brand'],
}

// ── Condition-specific title length targets ───────────────────────────────────
// How many characters to AIM for based on condition
export const CONDITION_LENGTH_TARGET: Record<Condition, { min: number; max: number; reason: string }> = {
    new: { min: 75, max: 80, reason: 'Fill with gift/buyer keywords — buyers filter by new so title works harder' },
    used: { min: 70, max: 78, reason: 'Need space for condition details and working status' },
    faulty: { min: 60, max: 72, reason: 'Need specific fault description — buyers search for exact fault' },
    refurbished: { min: 72, max: 80, reason: 'Need grade + warranty info + product details' },
    unknown: { min: 70, max: 80, reason: 'Fill with product keywords — condition word will add chars later' },
}

// ── UK vs US condition vocabulary ─────────────────────────────────────────────
export const CONDITION_LOCALE_WORDS: Record<'uk' | 'us', Partial<Record<Condition, string[]>>> = {
    uk: {
        used: ['Pre-Owned', 'Good Nick', 'Second Hand', 'VGC', 'GWO', 'Ex Display'],
        new: ['Brand New', 'BNIB', 'BNWT', 'Boxed', 'Sealed'],
        faulty: ['Spares or Repair', 'For Spares', 'Faulty', 'Non Working'],
    },
    us: {
        used: ['Pre-Owned', 'Gently Used', 'Good Used Condition', 'Lightly Used'],
        new: ['Brand New', 'New in Box', 'NIB', 'Factory Sealed', 'Mint'],
        faulty: ['For Parts', 'Not Working', 'As Is', 'Parts Only', 'Broken'],
    },
}

// ── Condition abbreviation expansion ──────────────────────────────────────────
// Maps short codes → full descriptions (for title clarity + search coverage)
export const CONDITION_ABBREVIATIONS: Record<string, string> = {
    'bnib': 'Brand New In Box',
    'bnwt': 'Brand New With Tags',
    'bnwob': 'Brand New Without Box',
    'vgc': 'Very Good Condition',
    'gwo': 'Good Working Order',
    'g.w.o': 'Good Working Order',
    'vgwo': 'Very Good Working Order',
    'nos': 'New Old Stock',
    'cib': 'Complete In Box',
    'nib': 'New In Box',
    'mint': 'Mint Condition',
    'po': 'Pre-Owned',
    'exd': 'Ex Display',
}

// Expand abbreviation in title if found
export function expandConditionAbbreviation(title: string): string {
    let expanded = title
    const titleLower = title.toLowerCase()
    for (const [abbr, full] of Object.entries(CONDITION_ABBREVIATIONS)) {
        // Only expand if standalone word (word boundary)
        const esc = abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(`(?<![a-z])${esc}(?![a-z])`, 'gi')
        if (regex.test(titleLower)) {
            expanded = expanded.replace(regex, full)
            break  // only expand one abbreviation per title
        }
    }
    return expanded.slice(0, 80)
}

// ── Get condition keywords with grade awareness ────────────────────────────────
// For refurbished items: uses grade-specific keywords instead of generic ones
export function getGradeAwareConditionKeywords(
    title: string,
    condition: Condition,
    maxWords: number = 3,
): string[] {
    const titleLow = title.toLowerCase()
    const charsLeft = 80 - title.length

    if (condition === 'refurbished') {
        // Inline grade detection — avoids circular import
        let grade: 'A' | 'B' | 'C' | 'D' | 'unknown' = 'unknown'
        if (/grade[\s-]?a\b|pristine|excellent\scondition/.test(titleLow)) grade = 'A'
        else if (/grade[\s-]?b\b|good\scondition|very\sgood/.test(titleLow)) grade = 'B'
        else if (/grade[\s-]?c\b|fair\scondition|visible\swear/.test(titleLow)) grade = 'C'
        else if (/grade[\s-]?d\b|heavy\swear|poor\scondition/.test(titleLow)) grade = 'D'

        const gradeKws = REFURB_GRADE_KEYWORDS[grade] ?? REFURB_GRADE_KEYWORDS['unknown']
        return gradeKws
            .filter((kw: string) => !titleLow.includes(kw.toLowerCase()) && kw.length + 1 <= charsLeft)
            .slice(0, maxWords)
    }

    return getConditionKeywords(condition, title, maxWords)
}

// ── EXPORT all condition word sets for use in spinner engine ──────────────────
export const ALL_CONDITION_WORDS = {
    new: NEW_PROTECTED,
    used: USED_PROTECTED,
    faulty: FAULTY_PROTECTED,
    refurbished: REFURB_PROTECTED,
}

export const ALL_BANNED_WORDS = {
    new: NEW_BANNED_INJECT,
    used: USED_BANNED_INJECT,
    faulty: FAULTY_BANNED_INJECT,
    refurbished: REFURB_BANNED_INJECT,
}
