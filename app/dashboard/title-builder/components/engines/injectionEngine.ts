// ── injectionEngine.ts ────────────────────────────────────────────────────────
// The intelligent injection gatekeeper — Problem 1 solution
//
// Every keyword that wants to enter a title MUST pass through shouldInject().
// This replaces the 10+ scattered ad-hoc checks with one smart system.
//
// Checks in order (fail-fast — first rejection wins):
//   1.  Exact duplicate
//   2.  Stem/plural duplicate
//   3.  Hyphen/punctuation variant duplicate
//   4.  Abbreviation duplicate
//   5.  Contradicts storage size  (128gb vs 256gb)
//   6.  Contradicts model tier    (plus vs ultra)
//   7.  Contradicts colour        (black vs white)
//   8.  Contradicts condition     (new vs used)
//   9.  Contradicts generation    (v11 vs v15, s23 vs s24)
//  10.  Contradicts product model (iphone 14 vs iphone 15)
//  11.  Category relevance check  (USB for cat toys = reject)
//  12.  eBay policy violation     (seller, ebay, free shipping)
//  13.  Title length budget       (would exceed 80 chars)
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────
export interface InjectContext {
    category: string      // detected category
    condition: string      // new/used/faulty/refurbished/unknown
    locale: string      // UK/US/AU
    originalWords: string[]    // all words from the ORIGINAL title (before spin)
    currentTitle: string      // title as it is NOW (after previous injections)
    maxLength: number       // 80
}

export interface InjectDecision {
    allow: boolean
    reason: string    // why rejected (for debugging)
}

// ── Stem normaliser — strip common suffixes for comparison ────────────────────
function stem(word: string): string {
    return word.toLowerCase()
        .replace(/ies$/, 'y')      // batteries → battery
        .replace(/ves$/, 'f')      // knives → knife
        .replace(/oes$/, 'o')      // tomatoes → tomato
        .replace(/ses$/, 's')      // dresses → dress
        .replace(/xes$/, 'x')      // boxes → box
        .replace(/zes$/, 'z')      // buzzes → buzz
        .replace(/s$/, '')         // cats → cat, shoes → shoe
        .replace(/ing$/, '')       // running → runn → run (approximate)
        .replace(/tion$/, '')      // interactive → interact
        .replace(/er$/, '')        // runner → run
        .replace(/ly$/, '')        // quickly → quick
        .trim()
}

// Strip all non-alphanumeric for variant comparison
function alphaOnly(word: string): string {
    return word.toLowerCase().replace(/[^a-z0-9]/g, '')
}

// ── Check 1 & 2 & 3 & 4: Duplicate detection ─────────────────────────────────
function isDuplicate(candidate: string, titleWords: string[]): boolean {
    const candLow = candidate.toLowerCase()
    const candStem = stem(candidate)
    const candAlpha = alphaOnly(candidate)

    for (const tw of titleWords) {
        const twLow = tw.toLowerCase()
        const twStem = stem(tw)
        const twAlpha = alphaOnly(tw)

        // Check 1: Exact match
        if (candLow === twLow) return true

        // Check 2: Stem match (cats/cat, dresses/dress, running/run)
        if (candStem === twStem && candStem.length >= 3) return true

        // Check 3: Hyphen/punctuation variant (wh-1000xm5 === wh1000xm5)
        if (candAlpha === twAlpha && candAlpha.length >= 4) return true

        // Check 4: Abbreviation (auto === automatic, mens === men, tv === television)
        const ABBREVIATIONS: Record<string, string[]> = {
            'auto': ['automatic', 'automatically'],
            'mens': ['men', 'male'],
            'womens': ['women', 'female', 'ladies'],
            'kids': ['children', 'child', 'junior', 'youth'],
            'tv': ['television'],
            'pc': ['computer', 'desktop'],
            'usb': ['universal serial bus'],
            'led': ['light emitting diode'],
            'hd': ['high definition', 'high-definition'],
            'uk': ['united kingdom'],
            'us': ['united states', 'usa'],
            'bnib': ['brand new in box'],
            'vgc': ['very good condition'],
        }
        for (const [abbr, expansions] of Object.entries(ABBREVIATIONS)) {
            if (candLow === abbr && expansions.some(e => twLow.includes(e))) return true
            if (twLow === abbr && expansions.some(e => candLow.includes(e))) return true
        }
    }
    return false
}

// ── Check 5: Storage size contradiction ───────────────────────────────────────
// If title has 256GB, never inject 128GB, 512GB etc.
function contradictsStorage(candidate: string, titleWords: string[]): boolean {
    const candStorage = candidate.match(/^(\d+)\s*(gb|tb|mb)\b/i)
    if (!candStorage) return false
    const candSize = parseInt(candStorage[1])
    const candUnit = candStorage[2].toLowerCase()

    for (const tw of titleWords) {
        const twStorage = tw.match(/^(\d+)\s*(gb|tb|mb)\b/i)
        if (!twStorage) continue
        const twSize = parseInt(twStorage[1])
        const twUnit = twStorage[2].toLowerCase()
        if (twUnit === candUnit && twSize !== candSize) return true  // different size same unit
    }
    return false
}

// ── Check 6: Model tier contradiction ─────────────────────────────────────────
// If title has "Ultra", never inject "Plus" (different tier of same product)
function contradictsModelTier(candidate: string, titleWords: string[]): boolean {
    const MODEL_TIERS = [
        ['ultra', 'plus', 'lite', 'mini', 'max', 'pro', 'standard', 'basic', 'se', 'fe'],
        ['pro max', 'pro', 'max', 'mini', 'plus', 'standard'],
    ]

    const candLow = candidate.toLowerCase()
    const titleLow = titleWords.map(w => w.toLowerCase())

    for (const tierGroup of MODEL_TIERS) {
        const candTier = tierGroup.find(t => candLow === t || candLow.includes(` ${t}`) || candLow.includes(`${t} `))
        const titleTier = tierGroup.find(t => titleLow.some(w => w === t || w.includes(` ${t}`) || w.includes(`${t} `)))

        if (candTier && titleTier && candTier !== titleTier) {
            return true  // candidate is a different tier than what's in title
        }
    }
    return false
}

// ── Check 7: Colour contradiction ─────────────────────────────────────────────
// If title has "White", never inject "Black", "Blue", "Red" etc.
const COLOURS = new Set([
    'black', 'white', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink',
    'grey', 'gray', 'silver', 'gold', 'brown', 'navy', 'cream', 'beige', 'coral',
    'teal', 'turquoise', 'maroon', 'olive', 'violet', 'indigo', 'cyan', 'magenta',
    'rose', 'lilac', 'ivory', 'charcoal', 'tan', 'khaki', 'mint', 'aqua', 'burgundy',
])

function contradictsColour(candidate: string, originalWords: string[]): boolean {
    const candLow = candidate.toLowerCase()
    // Is candidate a colour?
    if (!COLOURS.has(candLow)) return false
    // Does original title already have a DIFFERENT colour?
    const originalColours = originalWords.map(w => w.toLowerCase()).filter(w => COLOURS.has(w))
    if (originalColours.length === 0) return false    // no colour in original — allow
    if (originalColours.includes(candLow)) return false // same colour — allow
    // Different colour than original — reject to prevent colour chaos
    return true
}

// ── Check 8: Condition contradiction ──────────────────────────────────────────
const CONDITION_GROUPS = {
    new: ['new', 'sealed', 'brand new', 'bnib', 'bnwt', 'unused', 'unopened'],
    used: ['used', 'pre-owned', 'second hand', 'preloved', 'worn', 'good condition'],
    faulty: ['faulty', 'broken', 'spares', 'parts only', 'for parts', 'damaged'],
    refurbished: ['refurbished', 'reconditioned', 'restored', 'grade a', 'grade b'],
}

function contradictsCondition(candidate: string, condition: string): boolean {
    if (condition === 'unknown') return false
    const candLow = candidate.toLowerCase()

    // Find which condition group the candidate belongs to
    for (const [group, words] of Object.entries(CONDITION_GROUPS)) {
        if (words.some(w => candLow.includes(w))) {
            return group !== condition  // wrong condition group
        }
    }
    return false
}

// ── Check 9: Generation/version contradiction ──────────────────────────────────
// If title has "V15", never inject "V11" or "V12"
// If title has "S24", never inject "S23" or "S22"
function contradictsGeneration(candidate: string, titleWords: string[]): boolean {
    // Pattern: letter(s) followed by number e.g. V15, S24, iPhone14, Gen5
    const candGen = candidate.match(/\b([a-z]+)(\d+)\b/i)
    if (!candGen) return false

    const candPrefix = candGen[1].toLowerCase()
    const candNum = parseInt(candGen[2])

    for (const tw of titleWords) {
        const twGen = tw.match(/\b([a-z]+)(\d+)\b/i)
        if (!twGen) continue
        const twPrefix = twGen[1].toLowerCase()
        const twNum = parseInt(twGen[2])

        // Same prefix letter(s), different number = different generation
        if (candPrefix === twPrefix && candNum !== twNum &&
            Math.abs(candNum - twNum) <= 5) {  // within 5 generations = likely same product line
            return true
        }
    }
    return false
}

// ── Check 10: Product model contradiction ─────────────────────────────────────
// If title has "iPhone 14", never inject "iPhone 15" or "iPhone 13"
function contradictsProductModel(candidate: string, titleWords: string[]): boolean {
    const titleStr = titleWords.join(' ').toLowerCase()
    const candLow = candidate.toLowerCase()

    // iPhone series
    const titleiPhone = titleStr.match(/iphone\s*(\d+)/i)
    const candiPhone = candLow.match(/iphone\s*(\d+)/i)
    if (titleiPhone && candiPhone && titleiPhone[1] !== candiPhone[1]) return true

    // Samsung Galaxy series
    const titleSamsung = titleStr.match(/galaxy\s*(s|a|m|z)(\d+)/i)
    const candSamsung = candLow.match(/galaxy\s*(s|a|m|z)(\d+)/i)
    if (titleSamsung && candSamsung &&
        (titleSamsung[1] !== candSamsung[1] || titleSamsung[2] !== candSamsung[2])) return true

    // iPad series
    const titleiPad = titleStr.match(/ipad\s*(air|mini|pro)?\s*(\d+)/i)
    const candiPad = candLow.match(/ipad\s*(air|mini|pro)?\s*(\d+)/i)
    if (titleiPad && candiPad && titleiPad[2] !== candiPad[2]) return true

    // PlayStation/Xbox generations
    const titlePS = titleStr.match(/\b(ps|playstation)\s*([1-6])\b/i)
    const candPS = candLow.match(/\b(ps|playstation)\s*([1-6])\b/i)
    if (titlePS && candPS && titlePS[2] !== candPS[2]) return true

    const titleXbox = titleStr.match(/\bxbox\s*(one|360|series\s*[xs])\b/i)
    const candXbox = candLow.match(/\bxbox\s*(one|360|series\s*[xs])\b/i)
    if (titleXbox && candXbox && titleXbox[1] !== candXbox[1]) return true

    return false
}

// ── Check 11: Category relevance ──────────────────────────────────────────────
// Is this keyword relevant to the product category?
const CATEGORY_IRRELEVANT: Record<string, string[]> = {
    // Words that make NO sense in these categories
    pets: ['usb', 'hdmi', 'bluetooth', 'wifi', 'download', 'digital', 'software', 'streaming'],
    garden: ['bluetooth', 'wifi', 'download', 'digital', 'streaming', 'usb', 'hdmi'],
    clothing: ['download', 'digital', 'streaming', 'hdmi', 'wifi', 'bluetooth'],
    footwear: ['download', 'digital', 'streaming', 'hdmi', 'wifi', 'bluetooth'],
    jewellery: ['download', 'digital', 'streaming', 'hdmi', 'wifi', 'bluetooth', 'usb'],
    food: ['bluetooth', 'wifi', 'download', 'digital', 'streaming', 'usb', 'hdmi'],
    books: ['bluetooth', 'wifi', 'usb', 'hdmi', 'streaming'],
    baby: ['download', 'digital', 'streaming', 'hdmi'],
    toys: ['download', 'digital', 'streaming'],
    sports: ['download', 'digital', 'streaming'],
    automotive: ['download', 'digital', 'streaming'],
    music: [],  // music can have lots of tech terms
    electronics: [],  // electronics can have anything
    computing: [],  // computing can have anything
}

function isIrrelevantForCategory(candidate: string, category: string): boolean {
    const irrelevant = CATEGORY_IRRELEVANT[category] ?? []
    const candLow = candidate.toLowerCase()
    return irrelevant.some(w => candLow === w || candLow.includes(w))
}

// ── Check 12: eBay policy violations ──────────────────────────────────────────
const POLICY_WORDS = new Set([
    'seller', 'ebay', 'feedback', 'shop', 'store', 'visit', 'follow', 'check',
    'free shipping', 'free postage', 'free delivery', 'fast dispatch',
    'fast shipping', 'fast ship', 'fast post', 'same day',
    'next day', 'royal mail', 'evri', 'hermes', 'usps', 'dhl', 'fedex',
    'uk seller', 'us seller', 'au seller', 'uk stock', 'us stock',
])

function isPolicyViolation(candidate: string): boolean {
    const candLow = candidate.toLowerCase()
    if (POLICY_WORDS.has(candLow)) return true
    // Check if any policy word is contained in the candidate
    for (const pw of POLICY_WORDS) {
        if (candLow.includes(pw)) return true
    }
    return false
}

// ── Check 13: Title length budget ─────────────────────────────────────────────
function exceedsLength(candidate: string, currentTitle: string, maxLength: number): boolean {
    const newLength = currentTitle.length + 1 + candidate.length
    return newLength > maxLength
}

// ── MAIN FUNCTION: shouldInject ───────────────────────────────────────────────
export function shouldInject(
    candidate: string,
    ctx: InjectContext,
): InjectDecision {
    const candTrim = candidate.trim()
    if (!candTrim || candTrim.length < 2) {
        return { allow: false, reason: 'too short or empty' }
    }

    const currentWords = ctx.currentTitle.split(/\s+/).filter(Boolean)
    const originalWords = ctx.originalWords

    // ── Check 1-4: Duplicate ──────────────────────────────────────────────────
    if (isDuplicate(candTrim, currentWords)) {
        return { allow: false, reason: `duplicate of word already in title` }
    }

    // ── Check 5: Storage contradiction ───────────────────────────────────────
    if (contradictsStorage(candTrim, originalWords)) {
        return { allow: false, reason: `contradicts storage size in title` }
    }

    // ── Check 6: Model tier contradiction ─────────────────────────────────────
    if (contradictsModelTier(candTrim, originalWords)) {
        return { allow: false, reason: `contradicts model tier (e.g. ultra vs plus)` }
    }

    // ── Check 7: Colour contradiction ─────────────────────────────────────────
    if (contradictsColour(candTrim, originalWords)) {
        return { allow: false, reason: `contradicts colour already in title` }
    }

    // ── Check 8: Condition contradiction ──────────────────────────────────────
    if (contradictsCondition(candTrim, ctx.condition)) {
        return { allow: false, reason: `contradicts condition (${ctx.condition})` }
    }

    // ── Check 9: Generation contradiction ────────────────────────────────────
    if (contradictsGeneration(candTrim, originalWords)) {
        return { allow: false, reason: `contradicts product generation/version` }
    }

    // ── Check 10: Product model contradiction ─────────────────────────────────
    if (contradictsProductModel(candTrim, originalWords)) {
        return { allow: false, reason: `contradicts product model in title` }
    }

    // ── Check 11: Category relevance ──────────────────────────────────────────
    if (isIrrelevantForCategory(candTrim, ctx.category)) {
        return { allow: false, reason: `irrelevant for category "${ctx.category}"` }
    }

    // ── Check 12: Policy violation ────────────────────────────────────────────
    if (isPolicyViolation(candTrim)) {
        return { allow: false, reason: `eBay policy violation` }
    }

    // ── Check 13: Length budget ───────────────────────────────────────────────
    if (exceedsLength(candTrim, ctx.currentTitle, ctx.maxLength)) {
        return { allow: false, reason: `would exceed ${ctx.maxLength} char limit` }
    }

    // ── Check 14: Minimum word quality ──────────────────────────────────────
    // Reject single-letter words and very short vague words
    if (candTrim.length === 1) {
        return { allow: false, reason: 'single character — not useful in title' }
    }
    // Reject pure number strings (except sizes/specs which would have units)
    if (/^\d+$/.test(candTrim) && candTrim.length < 3) {
        return { allow: false, reason: 'standalone number without unit — not useful' }
    }

    // ── All checks passed ─────────────────────────────────────────────────────
    return { allow: true, reason: 'all checks passed' }
}

// ── Batch filter — filter a list of candidates ────────────────────────────────
export function filterInjectionQueue(
    candidates: string[],
    ctx: InjectContext,
): string[] {
    const allowed: string[] = []
    for (const candidate of candidates) {
        const decision = shouldInject(candidate, ctx)
        if (decision.allow) {
            allowed.push(candidate)
            // Update currentTitle for next candidate so length check is accurate
            ctx = {
                ...ctx,
                currentTitle: ctx.currentTitle + ' ' + candidate,
            }
        }
    }
    return allowed
}
