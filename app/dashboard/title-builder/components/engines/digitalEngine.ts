// ── digitalEngine.ts ──────────────────────────────────────────────────────────
// Step 12: Digital vs Physical Product Rules
//
// Why this matters:
//   Digital products on eBay have completely different rules:
//   - NO shipping words (nothing to ship)
//   - NO condition words (digital has no condition)
//   - NO location words (instant delivery anywhere)
//   - MUST have delivery method keywords ("Instant Download", "Email Delivery")
//   - MUST have access/license type ("Lifetime", "Commercial License")
//   - Buyers search very differently ("instant download", "cd key", "region free")
//
// What this engine does:
//   1.  Detect if product is digital or physical
//   2.  Classify digital sub-type (software, printable, game key, font etc.)
//   3.  Define forbidden words for digital titles (shipping, condition, location)
//   4.  Define required keywords per digital sub-type
//   5.  Score digital title compliance
//   6.  Optimise digital titles (inject correct keywords, remove forbidden ones)
//   7.  Handle platform-specific keywords (Steam, PSN, Xbox, Canva, Photoshop)
//   8.  Handle compatibility keywords (Windows/Mac, PC/Mobile)
//   9.  Handle region/license keywords (Global, EU, US, Commercial, Personal)
//  10.  Physical product rules — what to KEEP that digital omits
// ─────────────────────────────────────────────────────────────────────────────

import { DIGITAL_SIGNALS } from './productNouns'
import { isFillerWithContext } from './fillerWords'

// Words that contain digital signal substrings but are NOT digital
// e.g. 'key' in 'monkey', 'turkey', 'hockey', 'jockey'
const DIGITAL_FALSE_POSITIVES = new Set([
    'monkey', 'turkey', 'hockey', 'jockey', 'donkey', 'kidney', 'barley',
    'barcode', 'decode', 'unicode', 'encode', 'recode', 'postcode', 'zipcode',
    'happy', 'clapper', 'wrapper', 'snapper', 'zipper', 'mapped',
    'vocal', 'focal', 'local', 'token', 'spoken', 'broken',
    'subscribe', 'subscription' // handled as subtype trigger, not signal
])

// ── Types ─────────────────────────────────────────────────────────────────────
export type ProductType = 'digital' | 'physical'

export type DigitalSubType =
    | 'software-key'      // Windows, Office, antivirus license keys
    | 'game-key'          // Steam, PSN, Xbox, Nintendo game codes
    | 'subscription'      // Netflix, Spotify, VPN, cloud storage
    | 'printable'         // PDF planners, invitations, wall art
    | 'template'          // Canva, Word, PowerPoint, Photoshop templates
    | 'font'              // TTF, OTF, WOFF font files
    | 'ebook'             // PDF, EPUB, Kindle books
    | 'course'            // Video courses, tutorials, masterclasses
    | 'pattern'           // Sewing, knitting, crochet patterns
    | 'graphics'          // SVG, PNG clipart, vector files
    | 'music'             // MP3, WAV, loops, samples, beats
    | 'video'             // Stock footage, LUTs, presets
    | 'spreadsheet'       // Excel, Google Sheets templates
    | 'gift-card'         // Amazon, iTunes, Google Play gift cards
    | 'account'           // Gaming accounts, streaming accounts
    | 'unknown-digital'   // Digital but subtype unclear

export interface DigitalProduct {
    isDigital: true
    subType: DigitalSubType
    confidence: 'high' | 'medium' | 'low'
    platform: string | null      // Steam, PSN, Canva, Windows, etc.
    region: string | null      // Global, EU, US, UK, Region Free
    license: string | null      // Commercial, Personal, Lifetime
    format: string | null      // PDF, EPUB, TTF, MP3, etc.
    signals: string[]           // words that triggered detection
}

export interface PhysicalProduct {
    isDigital: false
}

export type ProductTypeResult = DigitalProduct | PhysicalProduct

export interface DigitalAnalysis {
    product: DigitalProduct
    forbiddenPresent: string[]       // wrong words currently in title
    missingRequired: string[]       // keywords that should be there
    missingPlatform: string | null  // platform keyword missing
    missingRegion: string | null  // region keyword missing
    score: number          // 0-100
    tip: string
    optimisedTitle: string         // suggested improved title
}

// ── DIGITAL SIGNAL PATTERNS ───────────────────────────────────────────────────
// More precise than the basic DIGITAL_SIGNALS set in productNouns.ts

const DIGITAL_PATTERNS: Record<DigitalSubType, {
    triggers: RegExp[]           // patterns that identify this subtype
    required: string[]           // must have at least one of these
    preferred: string[]           // good to have
    forbidden: string[]           // never in digital titles of this type
    platforms: string[]           // associated platforms
}> = {
    'software-key': {
        triggers: [/\b(windows|office|antivirus|norton|mcafee|kaspersky|adobe|autocad|malwarebytes)\b/i,
            /\b(product key|licence key|license key|activation key|serial key|cd key)\b/i],
        required: ['Key', 'License', 'Activation', 'Code', 'Digital'],
        preferred: ['Instant Delivery', 'Email Delivery', 'Lifetime', 'Full Version', 'PC'],
        forbidden: ['postage', 'shipping', 'dispatch', 'delivery days', 'uk seller', 'us seller',
            'new', 'used', 'sealed', 'box', 'physical', 'dvd'],
        platforms: ['Windows', 'Mac', 'PC', 'Microsoft', 'Adobe', 'Office', 'Norton', 'Kaspersky'],
    },
    'game-key': {
        triggers: [/\b(steam|psn|xbox|nintendo|ea play|ubisoft|epic games|gog)\b/i,
            /\b(game key|game code|cd key|redeem code|download code)\b/i,
            /\b(ps4|ps5|xbox one|xbox series|switch)\s+(game|key|code)\b/i],
        required: ['Key', 'Code', 'Digital', 'Download'],
        preferred: ['Instant Delivery', 'Region Free', 'Global', 'Email Delivery', 'Full Game'],
        forbidden: ['postage', 'shipping', 'dispatch', 'uk seller', 'us seller', 'new', 'used',
            'sealed', 'box', 'physical', 'disc', 'bluray'],
        platforms: ['Steam', 'PSN', 'Xbox', 'Nintendo', 'PC', 'PS4', 'PS5', 'Switch'],
    },
    'subscription': {
        triggers: [/\b(netflix|spotify|amazon prime|disney\+|hbo|apple tv|youtube premium)\b/i,
            /\b(vpn|nordvpn|expressvpn|subscription|account|membership)\b/i,
            /\b(\d+\s*month|annual|yearly|lifetime)\s*(plan|sub|subscription|access)\b/i],
        required: ['Subscription', 'Account', 'Access', 'Months', 'Premium'],
        preferred: ['Instant Delivery', 'Email Delivery', 'Lifetime', 'Premium'],
        forbidden: ['postage', 'shipping', 'dispatch', 'uk seller', 'physical', 'sealed', 'box'],
        platforms: ['Netflix', 'Spotify', 'Disney+', 'Amazon', 'Apple', 'YouTube', 'VPN'],
    },
    'printable': {
        triggers: [/\b(printable|print at home|instant download)\b/i,
            /\b(pdf|a4|a5|letter size|us letter)\s*(download|template|print)\b/i,
            /\b(planner|invitation|party|birthday|wedding)\s*(printable|pdf|template)\b/i],
        required: ['Printable', 'PDF', 'Digital', 'Download'],
        preferred: ['Instant Download', 'A4', 'A5', 'Print at Home', 'Editable'],
        forbidden: ['postage', 'shipping', 'dispatch', 'uk seller', 'us seller', 'physical',
            'new', 'used', 'condition', 'sealed'],
        platforms: [],
    },
    'template': {
        triggers: [/\b(canva|photoshop|illustrator|indesign|powerpoint|word|google slides)\b/i,
            /\b(template|mockup|editable|commercial use|commercial license)\b/i],
        required: ['Template', 'Digital', 'Editable', 'Download'],
        preferred: ['Commercial License', 'Instant Download', 'Commercial Use',
            'Personal Use', 'High Resolution'],
        forbidden: ['postage', 'shipping', 'dispatch', 'uk seller', 'us seller', 'new', 'used',
            'sealed', 'physical', 'box'],
        platforms: ['Canva', 'Photoshop', 'Illustrator', 'Word', 'PowerPoint', 'InDesign'],
    },
    'font': {
        triggers: [/\b(font|typeface|typography)\b/i,
            /\b(ttf|otf|woff|woff2)\b/i,
            /\b(script|serif|sans.serif|handwritten|calligraphy)\s+font\b/i],
        required: ['Font', 'Digital', 'Download'],
        preferred: ['Commercial License', 'Personal Use', 'Commercial Use',
            'TTF', 'OTF', 'Instant Download', 'Web Font'],
        forbidden: ['postage', 'shipping', 'dispatch', 'uk seller', 'physical', 'sealed'],
        platforms: [],
    },
    'ebook': {
        triggers: [/\b(ebook|e-book|epub|kindle|pdf book)\b/i,
            /\b(digital book|read online|instant access)\b/i],
        required: ['eBook', 'PDF', 'Digital', 'Download'],
        preferred: ['Instant Download', 'EPUB', 'Kindle Compatible', 'Lifetime Access'],
        forbidden: ['postage', 'shipping', 'dispatch', 'uk seller', 'new', 'used',
            'sealed', 'physical', 'paperback', 'hardback'],
        platforms: ['Kindle', 'PDF', 'EPUB'],
    },
    'course': {
        triggers: [/\b(course|masterclass|tutorial|training|workshop|bootcamp)\b/i,
            /\b(video course|online course|lifetime access|certificate)\b/i],
        required: ['Course', 'Digital', 'Access', 'Online'],
        preferred: ['Lifetime Access', 'Video Course', 'Certificate', 'Instant Access',
            'Beginner', 'Advanced', 'HD Video'],
        forbidden: ['postage', 'shipping', 'dispatch', 'uk seller', 'physical', 'sealed', 'new'],
        platforms: [],
    },
    'pattern': {
        triggers: [/\b(sewing pattern|knitting pattern|crochet pattern)\b/i,
            /\b(pdf pattern|digital pattern|instant download pattern)\b/i],
        required: ['Pattern', 'PDF', 'Digital', 'Download'],
        preferred: ['Instant Download', 'Printable', 'Instructions Included',
            'Beginner', 'Easy', 'Step by Step'],
        forbidden: ['postage', 'shipping', 'dispatch', 'uk seller', 'physical', 'new', 'used'],
        platforms: [],
    },
    'graphics': {
        triggers: [/\b(svg|clipart|vector|stock photo|graphic|illustration)\b/i,
            /\b(commercial use|royalty free|instant download)\s+(svg|clipart|vector)\b/i],
        required: ['SVG', 'Digital', 'Download', 'Clipart'],
        preferred: ['Commercial License', 'Commercial Use', 'Instant Download',
            'High Resolution', 'PNG', 'Vector', 'Royalty Free'],
        forbidden: ['postage', 'shipping', 'dispatch', 'uk seller', 'physical', 'new', 'used'],
        platforms: [],
    },
    'music': {
        triggers: [/\b(beat|loop|sample|stem|wav|mp3|midi|sound pack)\b/i,
            /\b(royalty free|license|music production|instrumental)\b/i],
        required: ['Download', 'Digital', 'License'],
        preferred: ['Royalty Free', 'Commercial License', 'WAV', 'MP3',
            'Instant Download', 'High Quality', 'Stems Included'],
        forbidden: ['postage', 'shipping', 'dispatch', 'uk seller', 'physical', 'new', 'used'],
        platforms: [],
    },
    'video': {
        triggers: [/\b(lut|preset|stock footage|video template|after effects|premiere pro)\b/i,
            /\b(motion graphic|video effect|transition pack)\b/i],
        required: ['Download', 'Digital', 'Video'],
        preferred: ['Instant Download', 'Commercial License', 'High Resolution',
            '4K', 'HD', 'Compatible', 'After Effects'],
        forbidden: ['postage', 'shipping', 'dispatch', 'uk seller', 'physical', 'new', 'used'],
        platforms: ['After Effects', 'Premiere', 'Final Cut', 'DaVinci'],
    },
    'spreadsheet': {
        triggers: [/\b(excel|google sheets|spreadsheet|budget tracker|financial model)\b/i,
            /\b(xlsx|xls|csv)\s*(template|tracker|planner)\b/i],
        required: ['Spreadsheet', 'Template', 'Digital', 'Download'],
        preferred: ['Instant Download', 'Editable', 'Excel', 'Google Sheets',
            'Lifetime Access', 'Instructions Included'],
        forbidden: ['postage', 'shipping', 'dispatch', 'uk seller', 'physical', 'new', 'used'],
        platforms: ['Excel', 'Google Sheets', 'Numbers'],
    },
    'gift-card': {
        triggers: [/\b(gift card|gift voucher|itunes|google play|amazon|steam gift)\b/i,
            /\b(e-gift|egift|digital gift|prepaid card)\b/i],
        required: ['Gift Card', 'Digital', 'Code'],
        preferred: ['Instant Delivery', 'Email Delivery', 'No Expiry'],
        forbidden: ['postage', 'shipping', 'dispatch', 'uk seller', 'physical', 'new', 'used', 'pre-owned'],
        platforms: ['Amazon', 'iTunes', 'Google Play', 'Steam', 'Xbox', 'PSN'],
    },
    'account': {
        // ⚠️ EBAY POLICY WARNING: Selling account credentials violates eBay ToS
        // This sub-type is detected for awareness only — advise seller to review eBay policies
        triggers: [/\b(account|login|credentials|username|password)\b/i,
            /\b(gaming account|spotify account|netflix account|prime account)\b/i],
        required: ['Account', 'Access', 'Digital'],
        preferred: ['Instant Delivery', 'Email Delivery', 'Lifetime', 'Premium'],
        forbidden: ['postage', 'shipping', 'dispatch', 'uk seller', 'physical', 'new', 'used'],
        platforms: ['Netflix', 'Spotify', 'Amazon', 'Gaming'],
    },
    'unknown-digital': {
        triggers: [],
        required: ['Digital', 'Download'],
        // eBay policy: digital items MUST state delivery method
        preferred: ['Instant Download', 'Email Delivery', 'Download via Email', 'Lifetime Access'],
        forbidden: ['postage', 'shipping', 'dispatch', 'uk seller', 'us seller', 'physical',
            'sealed', 'new', 'used', 'condition'],
        platforms: [],
    },
}

// ── Words ALWAYS forbidden in digital titles ──────────────────────────────────
const DIGITAL_FORBIDDEN_ALWAYS = new Set([
    // Shipping
    'postage', 'post', 'shipping', 'dispatch', 'delivery days', 'tracked',
    'royal mail', 'evri', 'hermes', 'parcel', 'first class', 'second class',
    'recorded', 'signed for', 'free postage', 'free shipping', 'fast dispatch',
    'next day', 'same day', 'express', 'standard delivery',
    // Location/seller
    'uk seller', 'us seller', 'au seller', 'uk stock', 'us stock', 'au stock',
    'ships from', 'ships to', 'international shipping',
    // Note: 'worldwide' is POSITIVE for digital — removed from forbidden list
    // Physical condition
    'new in box', 'brand new sealed', 'factory sealed', 'shrink wrapped',
    'open box', 'ex display',
    // Physical descriptors
    'weighs', 'weight', 'dimensions', 'size chart', 'physical item',
    'actual item', 'item pictured',
])

// ── Platform detection ────────────────────────────────────────────────────────
const PLATFORM_PATTERNS: { pattern: RegExp; platform: string }[] = [
    { pattern: /\bsteam\b/i, platform: 'Steam' },
    { pattern: /\bpsn\b|\bplaystation\b/i, platform: 'PSN' },
    { pattern: /\bxbox\b/i, platform: 'Xbox' },
    { pattern: /\bnintendo\b|\bswitch\b/i, platform: 'Nintendo' },
    { pattern: /\bwindows\b/i, platform: 'Windows' },
    { pattern: /\bmac\s*os\b|\bmacos\b/i, platform: 'Mac' },
    { pattern: /\badobe\b/i, platform: 'Adobe' },
    { pattern: /\bcanva\b/i, platform: 'Canva' },
    { pattern: /\boffice\s*3\d\d\b|\bms office\b/i, platform: 'Microsoft Office' },
    { pattern: /\bnetflix\b/i, platform: 'Netflix' },
    { pattern: /\bspotify\b/i, platform: 'Spotify' },
    { pattern: /\bamazon prime\b/i, platform: 'Amazon Prime' },
    { pattern: /\bdisney\+?\b/i, platform: 'Disney+' },
    { pattern: /\bkindl[ei]\b/i, platform: 'Kindle' },
    { pattern: /\bepub\b/i, platform: 'EPUB' },
]

// ── Region detection ──────────────────────────────────────────────────────────
const REGION_PATTERNS: { pattern: RegExp; region: string }[] = [
    { pattern: /\bglobal\b/i, region: 'Global' },
    { pattern: /\bregion free\b/i, region: 'Region Free' },
    { pattern: /\bworldwide\b/i, region: 'Worldwide' },
    { pattern: /\beu\s+region\b|\beurope\b/i, region: 'EU' },
    { pattern: /\buk\s+only\b|\buk\s+region\b/i, region: 'UK' },
    { pattern: /\bus\s+only\b|\bus\s+region\b/i, region: 'US' },
    { pattern: /\bna\s+region\b|\bnorth america\b/i, region: 'NA' },
]

// ── License detection ─────────────────────────────────────────────────────────
const LICENSE_PATTERNS: { pattern: RegExp; license: string }[] = [
    { pattern: /\bcommercial\s+licen[cs]e\b/i, license: 'Commercial License' },
    { pattern: /\bcommercial\s+use\b/i, license: 'Commercial Use' },
    { pattern: /\bpersonal\s+use\b/i, license: 'Personal Use' },
    { pattern: /\blifetime\s+licen[cs]e\b/i, license: 'Lifetime License' },
    { pattern: /\blifetime\s+access\b/i, license: 'Lifetime Access' },
    { pattern: /\bsingle\s+user\b/i, license: 'Single User' },
    { pattern: /\bmulti.?user\b/i, license: 'Multi User' },
    { pattern: /\broyalty.?free\b/i, license: 'Royalty Free' },
]

// ── Format detection ──────────────────────────────────────────────────────────
const FORMAT_PATTERNS: { pattern: RegExp; format: string }[] = [
    { pattern: /\bpdf\b/i, format: 'PDF' },
    { pattern: /\bepub\b/i, format: 'EPUB' },
    { pattern: /\bmobi\b/i, format: 'MOBI' },
    { pattern: /\bmp3\b/i, format: 'MP3' },
    { pattern: /\bwav\b/i, format: 'WAV' },
    { pattern: /\bsvg\b/i, format: 'SVG' },
    { pattern: /\bttf\b/i, format: 'TTF' },
    { pattern: /\botf\b/i, format: 'OTF' },
    { pattern: /\bxlsx?\b/i, format: 'Excel' },
    { pattern: /\bpng\b/i, format: 'PNG' },
    { pattern: /\bjpeg?\b/i, format: 'JPG' },
    // Note: 'zip' removed — matches 'ZIP Code' (US postal code) as false positive
    // { pattern: /\bzip\b/i,    format: 'ZIP' },
]

// ── Memoisation cache ─────────────────────────────────────────────────────────
const _digitalCache = new Map<string, ProductTypeResult>()

// ── MAIN DETECTION FUNCTION ───────────────────────────────────────────────────
export function detectProductType(title: string): ProductTypeResult {
    if (_digitalCache.has(title)) return _digitalCache.get(title)!
    const tl = title.toLowerCase()

    // ── Check if it's digital at all ─────────────────────────────────────────
    // Use word boundary to avoid false positives like 'podcast' matching 'pod'
    // Check digital signals with false-positive protection
    const hasDigitalSignal = [...DIGITAL_SIGNALS].some(signal => {
        const esc = signal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        if (!new RegExp(`(?<![a-z])${esc}(?![a-z])`).test(tl)) return false
        // Check it's not a false positive (e.g. 'key' in 'monkey')
        const matchWord = tl.match(new RegExp(`(?<![a-z])(${esc})(?![a-z])`, 'i'))?.[1]
        if (matchWord && DIGITAL_FALSE_POSITIVES.has(tl.split(/\s+/).find(w => w.includes(matchWord)) ?? '')) return false
        return true
    })

    if (!hasDigitalSignal) {
        const r: ProductTypeResult = { isDigital: false }
        _digitalCache.set(title, r)
        return r
    }

    // ── Detect sub-type ────────────────────────────────────────────────────────
    let subType: DigitalSubType = 'unknown-digital'
    let confidence: 'high' | 'medium' | 'low' = 'low'
    const signals: string[] = []

    // Score ALL sub-types and pick highest match (avoid order-dependent results)
    let bestScore = 0
    for (const [type, config] of Object.entries(DIGITAL_PATTERNS) as [DigitalSubType, typeof DIGITAL_PATTERNS[DigitalSubType]][]) {
        if (type === 'unknown-digital') continue
        let matches = 0
        const typeSignals: string[] = []
        for (const trigger of config.triggers) {
            if (trigger.test(tl)) { matches++; typeSignals.push(trigger.source.substring(0, 30)) }
        }
        if (matches > bestScore) {
            bestScore = matches
            subType = type
            confidence = matches >= 2 ? 'high' : 'medium'
            signals.push(...typeSignals)
        }
    }

    // ── Detect platform ────────────────────────────────────────────────────────
    let platform: string | null = null
    for (const { pattern, platform: p } of PLATFORM_PATTERNS) {
        if (pattern.test(tl)) { platform = p; break }
    }

    // ── Detect region ─────────────────────────────────────────────────────────
    let region: string | null = null
    for (const { pattern, region: r } of REGION_PATTERNS) {
        if (pattern.test(tl)) { region = r; break }
    }

    // ── Detect license ────────────────────────────────────────────────────────
    let license: string | null = null
    for (const { pattern, license: l } of LICENSE_PATTERNS) {
        if (pattern.test(tl)) { license = l; break }
    }

    // ── Detect format ─────────────────────────────────────────────────────────
    let format: string | null = null
    for (const { pattern, format: f } of FORMAT_PATTERNS) {
        if (pattern.test(tl)) { format = f; break }
    }

    const result: ProductTypeResult = {
        isDigital: true,
        subType,
        confidence,
        platform,
        region,
        license,
        format,
        signals,
    }
    _digitalCache.set(title, result)
    return result
}

// ── Check if a word is forbidden in digital titles ────────────────────────────
export function isDigitalForbiddenWord(word: string, subType: DigitalSubType): boolean {
    const wl = word.toLowerCase()

    // Always forbidden
    if (DIGITAL_FORBIDDEN_ALWAYS.has(wl)) return true

    // Subtype-specific forbidden words — use exact match or word boundary
    const config = DIGITAL_PATTERNS[subType]
    if (config.forbidden.some(f => {
        if (wl === f) return true
        // Word boundary check to avoid 'renewal' matching 'new'
        if (!f.includes(' ')) {
            const esc = f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            return new RegExp(`(?<![a-z])${esc}(?![a-z])`).test(wl)
        }
        return wl.includes(f)
    })) return true

    // Shipping words in general
    if (/\b(postag|dispatch|ship|deliver|royal mail|evri|hermes|tracked)\b/i.test(wl)) return true

    return false
}

// ── Filter injection queue for digital products ───────────────────────────────
export function filterForDigital(
    keywords: string[],
    subType: DigitalSubType,
): string[] {
    return keywords.filter(kw => {
        const kwl = kw.toLowerCase()
        const words = kwl.split(/\s+/)

        // Remove keywords with forbidden words
        if (words.some(w => isDigitalForbiddenWord(w, subType))) return false

        // Remove physical descriptors
        if (/\b(physical|in box|sealed|postage|shipping|dispatch|uk seller|us seller)\b/i.test(kwl)) return false

        // Remove condition words — but allow 'new' in context like 'New Release', 'New Version'
        if (/\b(used|refurbished|faulty|sealed|mint|pre-owned|graded)\b/i.test(kwl)) return false
        // 'new' only forbidden if standalone condition signal, not 'New Release', 'New Version'
        if (/^new$/i.test(kwl.trim()) || /\bnew in box\b|\bbrand new\b/i.test(kwl)) return false

        return true
    })
}

// ── Get keywords to inject for digital products ───────────────────────────────
export function getDigitalKeywords(
    product: DigitalProduct,
    title: string,
    maxWords: number = 4,
    buyerPower: string[] = [],   // from analyseBuyerSearch().powerKeywords
): string[] {
    const titleLow = title.toLowerCase()
    const charsLeft = 80 - title.length
    const config = DIGITAL_PATTERNS[product.subType]

    // Merge live buyer keywords (filtered for digital) with config preferred
    const liveSafe = buyerPower.filter(kw => {
        const kwl = kw.toLowerCase()
        if (/\b(postage|shipping|dispatch|uk seller|us seller|physical|sealed)\b/i.test(kwl)) return false
        if (/\b(new|used|refurbished|faulty|pre-owned)\b/i.test(kwl)) return false
        return true
    })

    const candidates: string[] = [
        ...liveSafe.slice(0, 2),   // live buyer data first (most relevant)
        ...config.preferred,
        // Add platform if detected AND not already in title
        ...(product.platform && !titleLow.includes(product.platform.toLowerCase()) ? [`${product.platform} Compatible`] : []),
        // Add region if missing
        ...(!product.region ? ['Global', 'Region Free'] : []),
        // Add license type if missing
        ...(!product.license && config.preferred.includes('Commercial License')
            ? ['Commercial License'] : []),
    ]

    return candidates
        .filter(kw => {
            if (titleLow.includes(kw.toLowerCase())) return false
            if (kw.length + 1 > charsLeft) return false
            return true
        })
        .slice(0, maxWords)
}

// ── Analyse digital title compliance ─────────────────────────────────────────
export function analyseDigital(title: string): DigitalAnalysis | null {
    const product = detectProductType(title)
    if (!product.isDigital) return null

    const titleLow = title.toLowerCase()
    const config = DIGITAL_PATTERNS[product.subType]

    // Find forbidden words present in title
    const words = title.split(/\s+/)
    const forbiddenPresent = words.filter(w =>
        isDigitalForbiddenWord(w, product.subType)
    )

    // Find required keywords missing
    const missingRequired = config.required.filter(req =>
        !titleLow.includes(req.toLowerCase())
    )

    // Platform missing?
    const missingPlatform = product.platform === null &&
        config.platforms.length > 0 ? config.platforms[0] : null

    // Region missing?
    const missingRegion = product.region === null &&
        ['software-key', 'game-key'].includes(product.subType)
        ? 'Global' : null

    // Score
    let score = 100
    score -= forbiddenPresent.length * 15   // forbidden words penalty
    score -= missingRequired.length * 10    // missing required penalty
    if (missingRegion) score -= 5
    score = Math.max(0, Math.min(100, score))

    // Build optimised title
    const optimisedTitle = buildOptimalDigitalTitle(title, product)

    // Tip
    let tip = ''
    if (forbiddenPresent.length > 0) {
        tip = `Remove "${forbiddenPresent[0]}" — shipping/condition words don't apply to digital items`
    } else if (missingRequired.length > 0) {
        tip = `Add "${missingRequired[0]}" — buyers search for this with digital products`
    } else if (missingRegion) {
        tip = `Add "Global" or "Region Free" — important for digital buyer confidence`
    } else {
        tip = `✅ Digital title well optimised`
    }

    return {
        product,
        forbiddenPresent,
        missingRequired,
        missingPlatform,
        missingRegion,
        score,
        tip,
        optimisedTitle,
    }
}

// ── Build optimised digital title ─────────────────────────────────────────────
// Removes forbidden words and injects correct digital keywords
export function buildOptimalDigitalTitle(
    title: string,
    product: DigitalProduct,
): string {
    const words = title.split(/\s+/)
    const config = DIGITAL_PATTERNS[product.subType]

    // Remove forbidden words — check both individual words AND multi-word phrases
    let cleaned = words
        .filter(w => !isDigitalForbiddenWord(w, product.subType))
        .join(' ')
    // Also remove multi-word forbidden phrases that survived word-by-word filter
    const multiWordForbidden = ['free postage', 'free shipping', 'fast dispatch',
        'uk seller', 'us seller', 'new in box', 'brand new sealed', 'royal mail']
    for (const phrase of multiWordForbidden) {
        const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'gi')
        cleaned = cleaned.replace(regex, '').replace(/\s+/g, ' ').trim()
    }

    // Inject required + preferred keywords
    let result = cleaned
    const inject = getDigitalKeywords(product, result, 4)

    for (const kw of inject) {
        if (result.length + 1 + kw.length <= 80) {
            result += ` ${kw}`
        }
        if (result.length >= 75) break
    }

    return result.slice(0, 80).trim()
}

// ── Score digital compliance for spin engine ──────────────────────────────────
export function scoreDigitalCompliance(title: string): {
    score: number
    tip: string
} {
    const analysis = analyseDigital(title)
    if (!analysis) return { score: 100, tip: 'Physical product — standard rules apply' }
    return { score: analysis.score, tip: analysis.tip }
}

// ── PHYSICAL PRODUCT RULES ────────────────────────────────────────────────────
// What physical products MUST have that digital products omit

export const PHYSICAL_REQUIRED_SIGNALS = new Set([
    'new', 'used', 'refurbished', 'sealed', 'condition',  // condition
    'uk', 'us', 'au', 'global',                          // location signals (implicit)
])

// Words that are ONLY valid for physical products
export const PHYSICAL_ONLY_WORDS = new Set([
    'postage', 'shipping', 'dispatch', 'delivery', 'tracked', 'signed',
    'royal mail', 'evri', 'hermes', 'next day', 'same day', 'free post',
    'in box', 'sealed', 'unboxed', 'unopened',
    'weighs', 'weight', 'kg', 'lb', 'dimensions',
])

// Check if a word should be removed from a digital title
export function shouldRemoveFromDigital(word: string): boolean {
    const wl = word.toLowerCase()
    if (PHYSICAL_ONLY_WORDS.has(wl)) return true
    if (DIGITAL_FORBIDDEN_ALWAYS.has(wl)) return true
    return false
}

// ── Export all constants for external use ─────────────────────────────────────
export { DIGITAL_PATTERNS, PLATFORM_PATTERNS, REGION_PATTERNS, LICENSE_PATTERNS }
