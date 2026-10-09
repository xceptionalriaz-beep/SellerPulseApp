// ── brandEngine.ts ────────────────────────────────────────────────────────────
// Step 9: Brand Protection — Smart Detection (works for ANY brand)
//
// Philosophy:
//   eBay has millions of brands — we can't hardcode them all.
//   Instead we TEACH the engine what a brand looks like and let it
//   detect any brand intelligently using 4 methods.
//
// Detection Methods (in priority order):
//   1. Pattern engine    — capitalised word before product noun = brand
//   2. Competing titles  — most common position-0 word in top listings = brand
//   3. Ambiguous seed    — ~50 words that need context to resolve (Apple, Ring)
//   4. Capitalisation    — seller's own capitalisation is the brand signal
//
// Protection Rules:
//   - Brand words are ALWAYS locked (never removed, never swapped)
//   - Multi-word brands stay together (New Balance, Dr Martens)
//   - Original capitalisation always preserved
//   - Compatible brands also protected (iPhone case for Samsung = both locked)
//   - If spin removes brand → guardFn reinserts it
// ─────────────────────────────────────────────────────────────────────────────

import { PRODUCT_NOUNS, MULTI_WORD_PRODUCTS, COLOURS } from './productNouns'
import { isFillerWord } from './fillerWords'
import { isSpecWord } from './specWords'
import { CONDITION_WORDS } from './productNouns'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface BrandResult {
    brand: string | null    // detected brand (original case from title)
    brandLower: string | null    // lowercase for comparisons
    brandPosition: number           // word index in title (-1 = not found)
    isMultiWord: boolean          // e.g. 'New Balance', 'Dr Martens'
    confidence: 'high' | 'medium' | 'low' | 'none'
    source: 'pattern' | 'competing' | 'seed' | 'none'
    compatibleBrand: string | null    // e.g. 'Samsung' in 'iPhone case for Samsung'
    allBrands: string[]         // all detected brand words (primary + compat)
}

// ── Method 3: Ambiguous seed list ────────────────────────────────────────────
// ONLY words that look like regular words but are also brands.
// These need context to resolve. ~50 entries max.
const AMBIGUOUS_BRANDS: Record<string, {
    contextClues: string[]  // nearby words that confirm it's a brand
    notBrandIf: string[]  // nearby words that mean it's NOT a brand
}> = {
    // Tech
    'apple': { contextClues: ['iphone', 'ipad', 'mac', 'airpods', 'watch', 'pencil', 'tv'], notBrandIf: ['juice', 'fruit', 'pie', 'cider', 'tree', 'sauce'] },
    'ring': { contextClues: ['doorbell', 'camera', 'security', 'video', 'alarm', 'chime'], notBrandIf: ['gold', 'silver', 'diamond', 'engagement', 'wedding', 'boxing'] },
    'sharp': { contextClues: ['tv', 'television', 'aquos', 'microwave', 'fridge'], notBrandIf: ['knife', 'blade', 'pencil', 'pin', 'needle', 'edge'] },
    'echo': { contextClues: ['alexa', 'dot', 'show', 'studio', 'smart'], notBrandIf: ['chamber', 'sound', 'reverb'] },
    'nest': { contextClues: ['thermostat', 'cam', 'doorbell', 'protect', 'hub'], notBrandIf: ['bird', 'egg', 'box'] },

    // Clothing/Footwear — multi-word brands where first word is common
    'new': { contextClues: ['balance'], notBrandIf: ['with tags', 'in box', 'sealed', 'unopened', 'condition', 'used', 'year'] },
    'north': { contextClues: ['face'], notBrandIf: ['east', 'west', 'south', 'star', 'pole'] },
    'under': { contextClues: ['armour'], notBrandIf: ['side', 'wear', 'neath', 'ground'] },
    'dr': { contextClues: ['martens', 'marten'], notBrandIf: [] },
    'stone': { contextClues: ['island'], notBrandIf: ['paving', 'wall', 'garden', 'stepping', 'gravel'] },
    'cp': { contextClues: ['company'], notBrandIf: [] },
    'off': { contextClues: ['white'], notBrandIf: ['road', 'season', 'peak', 'side', 'cut', 'line'] },
    'the': { contextClues: ['north face', 'ordinary'], notBrandIf: [] },
    'le': { contextClues: ['creuset'], notBrandIf: [] },

    // Beauty/Fashion
    'mac': { contextClues: ['cosmetics', 'makeup', 'lipstick', 'foundation', 'studio'], notBrandIf: ['book', 'pro', 'mini', 'apple', 'computer', 'laptop'] },
    'la': { contextClues: ['mer', 'roche', 'posay', 'prairie'], notBrandIf: [] },

    // Sports
    'wilson': { contextClues: ['tennis', 'racket', 'golf', 'ball'], notBrandIf: ['president', 'mr', 'street'] },
    'head': { contextClues: ['tennis', 'racket', 'ski'], notBrandIf: ['band', 'board', 'light', 'phone', 'set', 'ache'] },

    // Home
    'hunter': { contextClues: ['wellington', 'boot', 'welly', 'rain'], notBrandIf: ['knife', 'game', 'deer'] },
    'next': { contextClues: ['clothing', 'dress', 'shirt', 'jeans', 'kids'], notBrandIf: ['day', 'week', 'gen', 'door', 'step'] },

    // Cars
    'range': { contextClues: ['rover', 'sport', 'evoque', 'velar'], notBrandIf: ['cooker', 'oven', 'hood'] },
    'land': { contextClues: ['rover', 'discovery', 'defender', 'freelander'], notBrandIf: ['lord', 'mark', 'scape', 'slide'] },

    // Media/Gaming
    'star': { contextClues: ['wars', 'trek'], notBrandIf: ['fish', 'light', 'burst', 'board'] },
    'hot': { contextClues: ['wheels', 'wheel'], notBrandIf: ['tub', 'dog', 'chocolate', 'cross', 'water'] },

    // Other
    'signal': { contextClues: ['app', 'messenger'], notBrandIf: ['light', 'fire', 'box'] },
    'nothing': { contextClues: ['phone', 'ear', 'buds'], notBrandIf: [] },
}

// ── Words that are NEVER brands ───────────────────────────────────────────────
// Built from existing engines — no duplication needed
const NOT_BRAND_CATEGORIES = {
    conditions: new Set([
        ...Object.values(CONDITION_WORDS).flatMap(s => [...s])
    ]),
    sizes: new Set([
        'small', 'medium', 'large', 'xl', 'xxl', 'xs', 'mini', 'micro', 'nano',
        'compact', 'slim', 'thin', 'wide', 'tall', 'short', 'long', 'giant', 'jumbo',
        'extra', 'standard', 'regular', 'full', 'half', 'king', 'queen', 'single', 'double',
    ]),
    generics: new Set([
        'premium', 'professional', 'quality', 'genuine', 'original', 'official',
        'luxury', 'authentic', 'certified', 'advanced', 'superior', 'deluxe',
        'super', 'ultra', 'mega', 'pro', 'plus', 'max', 'lite', 'basic', 'classic',
        'smart', 'digital', 'electric', 'wireless', 'cordless', 'portable', 'wearable',
        'heavy', 'light', 'fast', 'quick', 'heavy', 'duty', 'duty',
        'indoor', 'outdoor', 'waterproof', 'heavy', 'duty',
        'replacement', 'compatible', 'universal', 'generic', 'standard',
        'best', 'top', 'high', 'low', 'good', 'great', 'perfect',
    ]),
}

// ── Build a flat set of ALL product nouns for fast lookup ─────────────────────
function buildProductNounSet(): Set<string> {
    const s = new Set<string>()
    for (const cat of Object.values(PRODUCT_NOUNS)) {
        for (const noun of cat.nouns) s.add(noun.toLowerCase())
    }
    for (const mwp of MULTI_WORD_PRODUCTS) {
        for (const w of mwp.phrase.toLowerCase().split(' ')) s.add(w)
    }
    return s
}
let _productNounSet: Set<string> | null = null
function getProductNounSet(): Set<string> {
    if (!_productNounSet) _productNounSet = buildProductNounSet()
    return _productNounSet
}

// ── Check if a word disqualifies as a brand ───────────────────────────────────
function isNotBrand(word: string): boolean {
    const wl = word.toLowerCase()
    if (wl.length < 2) return true  // too short
    if (/^\d/.test(wl)) return true  // starts with number
    if (/^[a-z]/.test(word)) return true  // starts lowercase = not brand
    if (COLOURS.has(wl)) return true  // colour word
    if (isFillerWord(wl)) return true  // filler
    if (!!isSpecWord(wl)) return true  // spec
    if (NOT_BRAND_CATEGORIES.conditions.has(wl)) return true  // condition
    if (NOT_BRAND_CATEGORIES.sizes.has(wl)) return true  // size
    if (NOT_BRAND_CATEGORIES.generics.has(wl)) return true  // generic
    if (getProductNounSet().has(wl)) return true  // it IS a product noun
    return false
}

// ── Method 3: Resolve ambiguous brand with context ───────────────────────────
function resolveAmbiguousBrand(
    word: string,
    titleLow: string,
): 'brand' | 'not-brand' | 'unknown' {
    const wl = word.toLowerCase()
    const entry = AMBIGUOUS_BRANDS[wl]
    if (!entry) return 'unknown'

    // Check if any NOT-brand context word is present
    for (const notWord of entry.notBrandIf) {
        if (titleLow.includes(notWord)) return 'not-brand'
    }
    // Check if any brand-confirming context word is present
    for (const clue of entry.contextClues) {
        if (titleLow.includes(clue)) return 'brand'
    }
    return 'unknown'
}

// ── Multi-word brand detection ────────────────────────────────────────────────
// Check AMBIGUOUS_BRANDS for multi-word resolutions
const MULTI_WORD_SEEDS: string[] = [
    'new balance', 'north face', 'the north face', 'under armour',
    'dr martens', 'dr. martens', 'stone island', 'cp company',
    'off white', 'le creuset', 'la mer', 'la roche posay',
    'land rover', 'range rover', 'hot wheels', 'games workshop',
    'tommy hilfiger', 'calvin klein', 'hugo boss', 'ralph lauren',
    'tag heuer', 'jo malone', 'molton brown', 'the ordinary',
    'maxi cosi', 'tommee tippee', 'fisher price', 'silver cross',
    'bang olufsen', 'bowers wilkins',
]

function detectMultiWordBrand(
    titleLow: string,
    words: string[],
): { brand: string; position: number } | null {
    for (const mb of MULTI_WORD_SEEDS) {
        const idx = titleLow.indexOf(mb)
        if (idx === -1) continue
        // Find word position
        const mbWords = mb.split(' ')
        const pos = words.findIndex(w => w.toLowerCase() === mbWords[0])
        if (pos === -1) continue
        // Get original capitalisation from title
        const original = words.slice(pos, pos + mbWords.length).join(' ')
        return { brand: original, position: pos }
    }
    return null
}

// ── Compatible brand detection ────────────────────────────────────────────────
// Finds secondary brand (what the product is designed to work WITH)
function detectCompatibleBrand(
    titleLow: string,
    words: string[],
    primaryBrand: string,
): string | null {
    const signals = ['for ', 'compatible with ', 'fits ', 'designed for ', 'works with ']

    for (const signal of signals) {
        const idx = titleLow.indexOf(signal)
        if (idx === -1) continue

        const afterIdx = idx + signal.length
        const afterWords = titleLow.slice(afterIdx).split(/\s+/).slice(0, 4)

        for (let i = 0; i < afterWords.length; i++) {
            const w = afterWords[i]
            if (w === primaryBrand.toLowerCase()) continue
            // Check multi-word first
            const twoWord = afterWords.slice(i, i + 2).join(' ')
            if (MULTI_WORD_SEEDS.includes(twoWord)) return twoWord
            // Single word — must pass pattern check
            const origWord = words.find(ow => ow.toLowerCase() === w)
            if (origWord && !isNotBrand(origWord)) return w
        }
    }
    return null
}

// ── Memoisation cache ─────────────────────────────────────────────────────────
const _brandCache = new Map<string, BrandResult>()

// ── MAIN DETECTION FUNCTION ───────────────────────────────────────────────────
export function detectBrand(
    title: string,
    competingPosition1: string[] = [],  // from analyseCompetingTitles().position1Words
): BrandResult {
    // Check cache first
    const cacheKey = title + '|' + competingPosition1.slice(0, 3).join(',')
    if (_brandCache.has(cacheKey)) return _brandCache.get(cacheKey)!

    const words = title.split(/\s+/)
    const titleLow = title.toLowerCase()

    // ── Method 1a: Multi-word seed brands ─────────────────────────────────────
    const mwResult = detectMultiWordBrand(titleLow, words)
    if (mwResult) {
        const compatBrand = detectCompatibleBrand(titleLow, words, mwResult.brand.toLowerCase())
        return {
            brand: mwResult.brand,
            brandLower: mwResult.brand.toLowerCase(),
            brandPosition: mwResult.position,
            isMultiWord: true,
            confidence: 'high',
            source: 'seed',
            compatibleBrand: compatBrand,
            allBrands: [
                mwResult.brand.toLowerCase(),
                ...(compatBrand ? [compatBrand] : []),
            ],
        }
    }

    // ── Method 2: Competing titles position-0 analysis ────────────────────────
    // If top sellers consistently put the same capitalised word first → brand
    if (competingPosition1.length > 0) {
        for (const pos1Word of competingPosition1.slice(0, 3)) {
            const p1l = pos1Word.toLowerCase()
            if (titleLow.includes(p1l) && !isNotBrand(pos1Word)) {
                // Verify it's actually in the title at an early position
                const idx = words.findIndex(w => w.toLowerCase() === p1l)
                if (idx !== -1 && idx <= 3) {
                    const compatBrand = detectCompatibleBrand(titleLow, words, p1l)
                    return {
                        brand: words[idx],     // original capitalisation
                        brandLower: p1l,
                        brandPosition: idx,
                        isMultiWord: false,
                        confidence: 'high',
                        source: 'competing',
                        compatibleBrand: compatBrand,
                        allBrands: [p1l, ...(compatBrand ? [compatBrand] : [])],
                    }
                }
            }
        }
    }

    // ── Method 1b: Pattern engine (capitalised word before product noun) ───────
    // Find the first product noun in the title
    let nounIdx = -1
    for (let i = 0; i < words.length; i++) {
        if (getProductNounSet().has(words[i].toLowerCase())) {
            nounIdx = i
            break
        }
    }

    // Also check multi-word products
    if (nounIdx === -1) {
        for (const mwp of MULTI_WORD_PRODUCTS) {
            if (titleLow.includes(mwp.phrase.toLowerCase())) {
                nounIdx = words.findIndex(w =>
                    w.toLowerCase() === mwp.phrase.toLowerCase().split(' ')[0]
                )
                if (nounIdx !== -1) break
            }
        }
    }

    // If no product noun found, scan ALL words
    const scanEnd = nounIdx > 0 ? nounIdx : words.length

    for (let i = 0; i < scanEnd; i++) {
        const w = words[i]
        const wl = w.toLowerCase()

        // Must start with capital letter
        if (!w || w.charAt(0) !== w.charAt(0).toUpperCase()) continue
        if (w.charAt(0) === w.charAt(0).toLowerCase()) continue  // not actually capitalised

        // Check ambiguous brands first (need context)
        if (AMBIGUOUS_BRANDS[wl]) {
            const resolved = resolveAmbiguousBrand(w, titleLow)
            if (resolved === 'brand') {
                const compatBrand = detectCompatibleBrand(titleLow, words, wl)
                return {
                    brand: w,
                    brandLower: wl,
                    brandPosition: i,
                    isMultiWord: false,
                    confidence: 'high',
                    source: 'seed',
                    compatibleBrand: compatBrand,
                    allBrands: [wl, ...(compatBrand ? [compatBrand] : [])],
                }
            }
            if (resolved === 'not-brand') continue
            // 'unknown' — fall through to pattern check with medium confidence
        }

        // Pattern check — is this a valid brand candidate?
        if (isNotBrand(w)) continue

        // All-caps check — 'USB', 'LED', 'XL' are not brands
        if (/^[A-Z]{2,}$/.test(words[i]) && words[i].length <= 4) continue  // USB, LED, XL etc

        // Passed all filters → it's a brand (medium confidence if no seed confirmation)
        const confidence = AMBIGUOUS_BRANDS[wl] ? 'medium' : 'high'
        const compatBrand = detectCompatibleBrand(titleLow, words, wl)
        return {
            brand: w,
            brandLower: wl,
            brandPosition: i,
            isMultiWord: false,
            confidence,
            source: 'pattern',
            compatibleBrand: compatBrand,
            allBrands: [wl, ...(compatBrand ? [compatBrand] : [])],
        }
    }

    // ── Method 4: Capitalisation fallback ────────────────────────────────────
    // No brand found by pattern — check if seller capitalised any word unusually
    // e.g. all other words lowercase but one is Capitalised = likely brand
    const lowerWords = words.filter(w => w.length > 2 && /^[a-z]/.test(w))
    const capsWords = words.filter((w, i) => {
        // Include position 0 — brand is often first word
        return w.length >= 3 &&
            /^[A-Z]/.test(w) &&
            !isNotBrand(w) &&
            !/^[A-Z]{2,}$/.test(w)
    })

    if (capsWords.length === 1 && lowerWords.length >= 2) {
        // One unusually capitalised word among mainly lowercase = likely brand
        const w = capsWords[0]
        const wl = w.toLowerCase()
        const idx = words.indexOf(w)
        return {
            brand: w,
            brandLower: wl,
            brandPosition: idx,
            isMultiWord: false,
            confidence: 'medium',
            source: 'pattern',
            compatibleBrand: null,
            allBrands: [wl],
        }
    }

    // ── All-caps title fallback ──────────────────────────────────────────────
    // 'NIKE AIR MAX 90' — all uppercase, first word = brand
    const allCaps = words.every(w => w === w.toUpperCase() && /[A-Z]/.test(w))
    if (allCaps && words.length > 1) {
        const firstWord = words[0]
        const fwl = firstWord.toLowerCase()
        if (!isNotBrand(firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase())) {
            const compatBrand = detectCompatibleBrand(titleLow, words, fwl)
            return {
                brand: firstWord,
                brandLower: fwl,
                brandPosition: 0,
                isMultiWord: false,
                confidence: 'medium',
                source: 'pattern',
                compatibleBrand: compatBrand,
                allBrands: [fwl, ...(compatBrand ? [compatBrand] : [])],
            }
        }
    }

    // No brand detected
    const noBrand: BrandResult = {
        brand: null,
        brandLower: null,
        brandPosition: -1,
        isMultiWord: false,
        confidence: 'none',
        source: 'none',
        compatibleBrand: null,
        allBrands: [],
    }
    _brandCache.set(cacheKey, noBrand)
    return noBrand
}

// ── Get all brand words as a Set for fast lookup in spinner ───────────────────
export function getBrandWordSet(brandResult: BrandResult): Set<string> {
    // Words that are condition/grammar words and should NOT be locked even if
    // they appear in a multi-word brand like 'New Balance' or 'The North Face'
    const NEVER_LOCK = new Set(['new', 'the', 'a', 'an', 'of', 'and', 'or', 'for', 'in', 'by', 'le', 'la', 'dr'])

    const s = new Set<string>()
    for (const b of brandResult.allBrands) {
        const bWords = b.split(' ')
        if (bWords.length === 1) {
            // Single-word brand — always lock it
            s.add(b.toLowerCase())
        } else {
            // Multi-word brand — only lock words that are UNIQUE to this brand
            for (const w of bWords) {
                const wl = w.toLowerCase()
                if (!NEVER_LOCK.has(wl) && wl.length >= 3) s.add(wl)
            }
        }
    }
    return s
}

// ── Check if a specific word is part of a detected brand ─────────────────────
export function isBrandWord(word: string, brandResult: BrandResult): boolean {
    const wl = word.toLowerCase()
    for (const b of brandResult.allBrands) {
        if (wl === b) return true
        if (b.includes(' ')) {
            for (const bw of b.split(' ')) {
                if (wl === bw) return true
            }
        }
    }
    return false
}

// ── Reinsert brand if spin accidentally removed it ────────────────────────────
export function guardBrandInTitle(
    spunTitle: string,
    brandResult: BrandResult,
): string {
    if (!brandResult.brand || !brandResult.brandLower) return spunTitle

    const spunLow = spunTitle.toLowerCase()
    const brandLow = brandResult.brandLower

    // Brand already present — nothing to do
    if (spunLow.includes(brandLow)) return spunTitle

    // Brand removed — reinsert
    // Prefer position 0 (brand goes first) unless it was originally later
    const words = spunTitle.split(/\s+/)
    const pos = brandResult.brandPosition <= 1 ? 0 : Math.min(brandResult.brandPosition, words.length)
    words.splice(pos, 0, brandResult.brand)

    const restored = words.join(' ')
    return restored.length <= 80 ? restored : restored.slice(0, 80).trim()
}

// ── Score brand presence and positioning ──────────────────────────────────────
export function scoreBrandPresence(
    title: string,
    brandResult: BrandResult,
): { score: number; tip: string } {
    if (!brandResult.brand) {
        return { score: 50, tip: 'No brand detected — generic item or brand not in title' }
    }

    const titleLow = title.toLowerCase()
    const brandLow = brandResult.brandLower!

    if (!titleLow.includes(brandLow)) {
        return { score: 0, tip: `Brand "${brandResult.brand}" missing from title` }
    }

    const words = title.split(/\s+/)
    const pos = words.findIndex(w => w.toLowerCase().includes(brandLow.split(' ')[0]))
    const isEarly = pos <= 2

    // Check capitalisation preserved
    const origWord = words[pos] ?? ''
    const brandFirst = brandResult.brand.split(' ')[0]
    const capsOk = origWord === brandFirst

    let score = 60
    if (isEarly) score += 30
    if (capsOk) score += 10

    let tip = ''
    if (score === 100) {
        tip = `✅ "${brandResult.brand}" correctly placed and capitalised`
    } else if (!isEarly) {
        tip = `Move "${brandResult.brand}" earlier — buyers search by brand name first`
    } else if (!capsOk) {
        tip = `Check capitalisation of "${brandResult.brand}"`
    }

    return { score, tip }
}

// ── MAIN INTEGRATION FUNCTION for spin engine ─────────────────────────────────
// Single call returns everything the spinner needs
export function getBrandProtection(
    title: string,
    competingPosition1: string[] = [],  // pass from analyseCompetingTitles result
): {
    brandResult: BrandResult
    lockedWords: Set<string>
    guardFn: (spun: string) => string
} {
    const brandResult = detectBrand(title, competingPosition1)
    const lockedWords = getBrandWordSet(brandResult)

    return {
        brandResult,
        lockedWords,
        guardFn: (spun: string) => guardBrandInTitle(spun, brandResult),
    }
}
