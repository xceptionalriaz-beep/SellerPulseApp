// ── locationEngine.ts ─────────────────────────────────────────────────────────
// Step 11: Location Rules — UK vs US vs AU vs CA Keywords
//
// Why this matters:
//   eBay is a marketplace. Buyers search in THEIR vocabulary.
//   A UK buyer searches "trainers" not "sneakers".
//   A US buyer searches "faucet" not "tap".
//   Wrong vocabulary = invisible in search = zero sales.
//
// What this engine does:
//   1.  Vocabulary translation — UK/US/AU/CA word equivalents
//   2.  Spelling normalisation — colour/color, aluminium/aluminum
//   3.  Size system translation — UK/US clothing and shoe sizes
//   4.  Marketplace keywords — "Free UK Postage" vs "Free US Shipping"
//   5.  Detect wrong-locale words in title and flag them
//   6.  Suggest locale-correct replacements
//   7.  Filter injection queue by locale — only inject locale-correct words
//   8.  Category-specific locale rules (auto, clothing, electronics etc.)
//   9.  AU and CA locale support (Australian and Canadian English)
//  10.  Score how locale-optimised the current title is
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────
export type Locale = 'UK' | 'US' | 'AU' | 'CA' | 'DE' | 'FR' | 'IT' | 'ES'

export interface LocaleWord {
    uk: string    // British English
    us: string    // American English
    au?: string    // Australian English (if different from UK)
    ca?: string    // Canadian English (if different from US)
    category: string
}

export interface LocaleAnalysis {
    locale: Locale
    wrongWords: { word: string; correct: string; position: number }[]
    spellingErrors: { word: string; correct: string; position: number }[]
    missingLocale: string[]     // locale keywords not in title
    localeScore: number       // 0-100
    tip: string
}

// ── VOCABULARY TRANSLATION TABLE ──────────────────────────────────────────────
// UK word → US word (bidirectional)
export const LOCALE_VOCABULARY: LocaleWord[] = [

    // ── FOOTWEAR ────────────────────────────────────────────────────────────────
    { uk: 'trainers', us: 'sneakers', category: 'footwear' },
    { uk: 'pumps', us: 'flats', category: 'footwear' },
    { uk: 'wellingtons', us: 'rain boots', au: 'gumboots', category: 'footwear' },
    { uk: 'wellies', us: 'rain boots', au: 'gumboots', category: 'footwear' },
    { uk: 'plimsolls', us: 'canvas shoes', category: 'footwear' },
    { uk: 'court shoes', us: 'pumps', category: 'footwear' },

    // ── CLOTHING ────────────────────────────────────────────────────────────────
    { uk: 'jumper', us: 'sweater', category: 'clothing' },
    { uk: 'pullover', us: 'sweater', category: 'clothing' },
    { uk: 'cardigan', us: 'cardigan', category: 'clothing' },
    { uk: 'trousers', us: 'pants', category: 'clothing' },
    { uk: 'tracksuit', us: 'sweatsuit', category: 'clothing' },
    { uk: 'joggers', us: 'sweatpants', category: 'clothing' },
    { uk: 'waistcoat', us: 'vest', category: 'clothing' },
    // Note: vest is ambiguous — waistcoat covered above
    { uk: 'dressing gown', us: 'bathrobe', category: 'clothing' },
    { uk: 'nightdress', us: 'nightgown', category: 'clothing' },
    { uk: 'tights', us: 'pantyhose', category: 'clothing' },
    { uk: 'dungarees', us: 'overalls', category: 'clothing' },
    { uk: 'cagoule', us: 'anorak', category: 'clothing' },
    { uk: 'mac', us: 'raincoat', category: 'clothing' },
    { uk: 'polo neck', us: 'turtleneck', category: 'clothing' },
    { uk: 'roll neck', us: 'turtleneck', category: 'clothing' },
    { uk: 'braces', us: 'suspenders', category: 'clothing' },

    // ── BABY & KIDS ─────────────────────────────────────────────────────────────
    { uk: 'nappy', us: 'diaper', au: 'nappy', category: 'baby' },
    { uk: 'nappies', us: 'diapers', au: 'nappies', category: 'baby' },
    { uk: 'dummy', us: 'pacifier', au: 'dummy', category: 'baby' },
    { uk: 'cot', us: 'crib', category: 'baby' },
    { uk: 'pushchair', us: 'stroller', au: 'pram', category: 'baby' },
    { uk: 'pram', us: 'baby carriage', category: 'baby' },
    { uk: 'buggy', us: 'stroller', category: 'baby' },
    { uk: 'babygrow', us: 'onesie', category: 'baby' },
    { uk: 'muslins', us: 'burp cloths', category: 'baby' },
    { uk: 'moses basket', us: 'bassinet', category: 'baby' },

    // ── HOME & KITCHEN ──────────────────────────────────────────────────────────
    { uk: 'tap', us: 'faucet', category: 'home' },
    { uk: 'cooker', us: 'stove', category: 'home' },
    { uk: 'hob', us: 'stovetop', category: 'home' },
    { uk: 'worktop', us: 'countertop', category: 'home' },
    { uk: 'kitchen roll', us: 'paper towel', category: 'home' },
    { uk: 'washing up liquid', us: 'dish soap', category: 'home' },
    { uk: 'bin', us: 'trash can', category: 'home' },
    { uk: 'rubbish bin', us: 'garbage can', category: 'home' },
    { uk: 'washing machine', us: 'washer', category: 'home' },
    { uk: 'tumble dryer', us: 'clothes dryer', category: 'home' },
    { uk: 'hoover', us: 'vacuum', category: 'home' },
    { uk: 'sellotape', us: 'scotch tape', category: 'home' },
    { uk: 'anti-clockwise', us: 'counterclockwise', category: 'home' },
    { uk: 'skirting board', us: 'baseboard', category: 'home' },
    { uk: 'courgette', us: 'zucchini', category: 'food' },
    { uk: 'aubergine', us: 'eggplant', category: 'food' },
    { uk: 'crisps', us: 'chips', category: 'food' },

    // ── AUTOMOTIVE ──────────────────────────────────────────────────────────────
    { uk: 'bonnet', us: 'hood', category: 'automotive' },
    { uk: 'boot', us: 'trunk', category: 'automotive' },
    { uk: 'windscreen', us: 'windshield', category: 'automotive' },
    { uk: 'number plate', us: 'license plate', category: 'automotive' },
    { uk: 'indicator', us: 'turn signal', category: 'automotive' },
    { uk: 'gear lever', us: 'gear shift', category: 'automotive' },
    { uk: 'handbrake', us: 'parking brake', category: 'automotive' },
    { uk: 'motorway', us: 'freeway', category: 'automotive' },
    { uk: 'spanner', us: 'wrench', category: 'tools' },
    { uk: 'Allen key', us: 'hex key', category: 'tools' },
    { uk: 'spirit level', us: 'level', category: 'tools' },

    // ── ELECTRONICS & TECH ──────────────────────────────────────────────────────
    { uk: 'mobile', us: 'cell phone', category: 'electronics' },
    { uk: 'mobile phone', us: 'cell phone', category: 'electronics' },
    { uk: 'torch', us: 'flashlight', au: 'torch', category: 'electronics' },
    { uk: 'aerial', us: 'antenna', category: 'electronics' },
    { uk: 'socket', us: 'outlet', category: 'electronics' },
    { uk: 'plug', us: 'plug', category: 'electronics' },
    { uk: 'mains', us: 'power outlet', category: 'electronics' },
    { uk: 'freeview', us: 'over the air', category: 'electronics' },

    // ── HEALTH & BEAUTY ─────────────────────────────────────────────────────────
    { uk: 'plaster', us: 'band-aid', category: 'health' },
    { uk: 'sticking plaster', us: 'adhesive bandage', category: 'health' },
    { uk: 'paracetamol', us: 'acetaminophen', category: 'health' },
    { uk: 'cotton wool', us: 'cotton balls', category: 'beauty' },
    { uk: 'deodorant roll-on', us: 'deodorant roll-on', category: 'beauty' },

    // ── GARDEN & OUTDOOR ────────────────────────────────────────────────────────
    { uk: 'garden', us: 'yard', category: 'garden' },
    { uk: 'shed', us: 'tool shed', category: 'garden' },
    { uk: 'allotment', us: 'vegetable garden', category: 'garden' },
    { uk: 'secateurs', us: 'pruning shears', category: 'garden' },

    // ── CANADIAN & AUSTRALIAN ENGLISH ──────────────────────────────────────────
    { uk: 'woolly hat', us: 'beanie', au: 'beanie', ca: 'toque', category: 'clothing' },
    { uk: 'sofa', us: 'couch', ca: 'chesterfield', category: 'home' },
    { uk: 'flip flops', us: 'flip flops', au: 'thongs', category: 'footwear' },
    { uk: 'swimsuit', us: 'swimsuit', au: 'bathers', category: 'clothing' },
    { uk: 'chemist', us: 'drugstore', au: 'chemist', category: 'health' },
    { uk: 'pickup truck', us: 'pickup truck', au: 'ute', category: 'automotive' },
    { uk: 'napkin', us: 'napkin', ca: 'serviette', category: 'home' },
    { uk: 'singlet', us: 'tank top', au: 'singlet', category: 'clothing' },

    // ── SPORTS ──────────────────────────────────────────────────────────────────
    { uk: 'football', us: 'soccer', category: 'sports' },
    { uk: 'football boots', us: 'soccer cleats', category: 'sports' },
    { uk: 'kit', us: 'uniform', category: 'sports' },
    { uk: 'athletics', us: 'track and field', category: 'sports' },
    { uk: 'pitch', us: 'field', category: 'sports' },

    // ── GENERAL / SEASONAL ──────────────────────────────────────────────────────
    { uk: 'autumn', us: 'fall', category: 'seasonal' },
    { uk: 'holiday', us: 'vacation', category: 'general' },
    { uk: 'post', us: 'mail', category: 'general' },
    { uk: 'postage', us: 'shipping', category: 'general' },
    { uk: 'dispatch', us: 'ship', category: 'general' },
    { uk: 'colour', us: 'color', category: 'spelling' },
    { uk: 'favourite', us: 'favorite', category: 'spelling' },
    { uk: 'organise', us: 'organize', category: 'spelling' },
    { uk: 'aluminium', us: 'aluminum', category: 'spelling' },
    { uk: 'catalogue', us: 'catalog', category: 'spelling' },
    { uk: 'centre', us: 'center', category: 'spelling' },
    { uk: 'fibre', us: 'fiber', category: 'spelling' },
    { uk: 'grey', us: 'gray', category: 'spelling' },
    { uk: 'tyre', us: 'tire', category: 'automotive' },
    { uk: 'mould', us: 'mold', category: 'general' },
    { uk: 'odour', us: 'odor', category: 'general' },
    { uk: 'kerb', us: 'curb', category: 'automotive' },
    { uk: 'jewellery', us: 'jewelry', category: 'jewellery' },
    { uk: 'pyjamas', us: 'pajamas', category: 'clothing' },
    { uk: 'practice', us: 'practice', category: 'general' },
    { uk: 'defence', us: 'defense', category: 'general' },
    { uk: 'licence', us: 'license', category: 'general' },
    { uk: 'programme', us: 'program', category: 'general' },
    { uk: 'sceptical', us: 'skeptical', category: 'general' },
    { uk: 'travelling', us: 'traveling', category: 'general' },
    { uk: 'fulfil', us: 'fulfill', category: 'general' },
    { uk: 'woollen', us: 'woolen', category: 'clothing' },
    { uk: 'vapour', us: 'vapor', category: 'general' },
    { uk: 'sulphur', us: 'sulfur', category: 'general' },
    { uk: 'draught', us: 'draft', category: 'general' },
    { uk: 'aeroplane', us: 'airplane', category: 'general' },
    { uk: 'acknowledgement', us: 'acknowledgment', category: 'general' },
]

// ── Build lookup maps ─────────────────────────────────────────────────────────
// UK → US and US → UK for fast lookup
const UK_TO_US = new Map<string, string>()
const US_TO_UK = new Map<string, string>()
const UK_TO_AU = new Map<string, string>()

for (const entry of LOCALE_VOCABULARY) {
    UK_TO_US.set(entry.uk.toLowerCase(), entry.us.toLowerCase())
    US_TO_UK.set(entry.us.toLowerCase(), entry.uk.toLowerCase())
    if (entry.au) UK_TO_AU.set(entry.uk.toLowerCase(), entry.au.toLowerCase())
}

// ── Marketplace-specific keywords ─────────────────────────────────────────────
// Words and phrases specific to each eBay marketplace
export const MARKETPLACE_KEYWORDS: Record<Locale, {
    preferred: string[]    // good to inject
    avoid: string[]    // wrong for this locale
    postage: string      // how to say "shipping"
    seller: string      // how to say "UK/US Seller"
}> = {
    UK: {
        preferred: ['UK Stock', 'Genuine UK Stock', 'Fast Dispatch'],
        avoid: ['US Seller', 'Free US Shipping', 'USPS', 'US Stock', 'Ships from US'],
        postage: 'Free UK Postage',
        seller: 'UK Seller',
    },
    US: {
        preferred: ['US Stock', 'Genuine US Stock', 'Fast Shipping'],
        avoid: ['UK Seller', 'Free UK Postage', 'Royal Mail', 'UK Stock'],
        postage: 'Free US Shipping',
        seller: 'US Seller',
    },
    AU: {
        preferred: ['AU Stock', 'Australian Stock', 'Fast Dispatch'],
        avoid: ['UK Seller', 'US Seller', 'US Stock', 'UK Stock', 'Royal Mail', 'USPS'],
        postage: 'Free AU Postage',
        seller: 'AU Seller',
    },
    CA: {
        preferred: ['Canada Stock', 'Canadian Stock', 'Fast Shipping'],
        avoid: ['UK Seller', 'US Seller', 'UK Stock', 'US Stock'],
        postage: 'Free CA Shipping',
        seller: 'CA Seller',
    },
    DE: {
        preferred: ['DE Seller', 'Kostenloser Versand', 'DE Lager', 'DHL', 'Schneller Versand'],
        avoid: ['UK Seller', 'US Seller', 'Free UK Postage', 'Free US Shipping'],
        postage: 'Kostenloser Versand',
        seller: 'DE Seller',
    },
    FR: {
        preferred: ['Vendeur FR', 'Livraison Gratuite', 'Stock FR', 'Colissimo'],
        avoid: ['UK Seller', 'US Seller', 'Free UK Postage', 'Free US Shipping'],
        postage: 'Livraison Gratuite',
        seller: 'Vendeur FR',
    },
    IT: {
        preferred: ['Venditore IT', 'Spedizione Gratuita', 'Stock IT'],
        avoid: ['UK Seller', 'US Seller', 'Free UK Postage', 'Free US Shipping'],
        postage: 'Spedizione Gratuita',
        seller: 'Venditore IT',
    },
    ES: {
        preferred: ['Vendedor ES', 'Envío Gratis', 'Stock ES'],
        avoid: ['UK Seller', 'US Seller', 'Free UK Postage', 'Free US Shipping'],
        postage: 'Envío Gratis',
        seller: 'Vendedor ES',
    },
}

// ── Clothing size translation ─────────────────────────────────────────────────
// UK ↔ US size systems
export const CLOTHING_SIZE_MAP = {
    // Women's clothing
    womens: {
        uk_to_us: { '6': '2', '8': '4', '10': '6', '12': '8', '14': '10', '16': '12', '18': '14', '20': '16' },
        us_to_uk: { '0': '4', '2': '6', '4': '8', '6': '10', '8': '12', '10': '14', '12': '16', '14': '18' },
    },
    // Men's clothing (same in UK and US for numeric, but terminology differs)
    mens: {
        uk_to_us: { 'S': 'S', 'M': 'M', 'L': 'L', 'XL': 'XL', 'XXL': 'XXL' },
        us_to_uk: { 'S': 'S', 'M': 'M', 'L': 'L', 'XL': 'XL', 'XXL': 'XXL' },
    },
}

export const SHOE_SIZE_MAP = {
    // Women's shoe sizes UK ↔ US
    womens: {
        uk_to_us: { '3': '5', '3.5': '5.5', '4': '6', '4.5': '6.5', '5': '7', '5.5': '7.5', '6': '8', '6.5': '8.5', '7': '9', '7.5': '9.5', '8': '10' },
        us_to_uk: { '5': '3', '5.5': '3.5', '6': '4', '6.5': '4.5', '7': '5', '7.5': '5.5', '8': '6', '8.5': '6.5', '9': '7', '9.5': '7.5', '10': '8' },
    },
    // Men's shoe sizes UK ↔ US
    mens: {
        uk_to_us: { '6': '7', '6.5': '7.5', '7': '8', '7.5': '8.5', '8': '9', '8.5': '9.5', '9': '10', '9.5': '10.5', '10': '11', '10.5': '11.5', '11': '12' },
        us_to_uk: { '7': '6', '7.5': '6.5', '8': '7', '8.5': '7.5', '9': '8', '9.5': '8.5', '10': '9', '10.5': '9.5', '11': '10', '11.5': '10.5', '12': '11' },
    },
}

// ── Detect locale from title ──────────────────────────────────────────────────
// Infer likely locale from vocabulary in the title
export function detectLocaleFromTitle(title: string): {
    likelyLocale: Locale
    confidence: 'high' | 'medium' | 'low'
    signals: string[]
} {
    const tl = title.toLowerCase()
    const signals: string[] = []
    let ukScore = 0
    let usScore = 0

    function wBound(text: string, phrase: string): boolean {
        const esc = phrase.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
        return new RegExp(`(?<![a-z])${esc}(?![a-z])`, 'i').test(text)
    }
    for (const entry of LOCALE_VOCABULARY) {
        if (wBound(tl, entry.uk)) { ukScore += 2; signals.push(`UK: ${entry.uk}`) }
        if (wBound(tl, entry.us)) { usScore += 2; signals.push(`US: ${entry.us}`) }
    }

    // Check marketplace keywords
    for (const kw of MARKETPLACE_KEYWORDS.UK.preferred) {
        if (tl.includes(kw.toLowerCase())) { ukScore += 3; signals.push(`UK marketplace: "${kw}"`) }
    }
    for (const kw of MARKETPLACE_KEYWORDS.US.preferred) {
        if (tl.includes(kw.toLowerCase())) { usScore += 3; signals.push(`US marketplace: "${kw}"`) }
    }

    if (/[£]/.test(title)) { ukScore += 5; signals.push('Currency: GBP') }
    if (/AU\$/.test(title)) { ukScore += 3; signals.push('Currency: AUD') }
    if (/CA\$/.test(title)) { usScore += 3; signals.push('Currency: CAD') }
    if (/\$/.test(title) && !/AU|CA/.test(title)) { usScore += 5; signals.push('Currency: USD') }
    const likelyLocale: Locale = ukScore > usScore ? 'UK' : 'US'
    const diff = Math.abs(ukScore - usScore)
    const confidence = diff >= 4 ? 'high' : diff >= 2 ? 'medium' : 'low'

    return { likelyLocale, confidence, signals: signals.slice(0, 5) }
}

// ── Get the locale-correct word ───────────────────────────────────────────────
export function getLocaleWord(word: string, targetLocale: Locale): string {
    const wl = word.toLowerCase()

    switch (targetLocale) {
        case 'UK':
        case 'AU':
            // US → UK
            if (US_TO_UK.has(wl)) {
                const ukWord = US_TO_UK.get(wl)!
                // AU may have a different word
                if (targetLocale === 'AU') {
                    const auWord = UK_TO_AU.get(ukWord)
                    if (auWord) return preserveCase(word, auWord)
                }
                return preserveCase(word, ukWord)
            }
            return word

        case 'US':
        case 'CA':
            // UK → US
            if (UK_TO_US.has(wl)) return preserveCase(word, UK_TO_US.get(wl)!)
            return word

        default:
            return word
    }
}

// ── Preserve original capitalisation when translating ─────────────────────────
function preserveCase(original: string, translated: string): string {
    if (original === original.toUpperCase()) return translated.toUpperCase()
    if (original.charAt(0) === original.charAt(0).toUpperCase()) {
        return translated.charAt(0).toUpperCase() + translated.slice(1)
    }
    return translated
}

// ── Check if a word is wrong for this locale ──────────────────────────────────
export function isWrongLocaleWord(word: string, targetLocale: Locale): boolean {
    const wl = word.toLowerCase()
    if (targetLocale === 'UK' || targetLocale === 'AU') {
        if (US_TO_UK.has(wl)) return true
        return LOCALE_VOCABULARY.some(e => e.us.toLowerCase() === wl && e.uk.toLowerCase() !== wl)
    }
    if (targetLocale === 'US' || targetLocale === 'CA') {
        if (UK_TO_US.has(wl)) return true
        return LOCALE_VOCABULARY.some(e => e.uk.toLowerCase() === wl && e.us.toLowerCase() !== wl)
    }
    return false
}

// ── Translate entire title to target locale ───────────────────────────────────
export function translateTitle(title: string, targetLocale: Locale): {
    translated: string
    changes: { from: string; to: string; position: number }[]
} {
    const words = title.split(/\s+/)
    const changes: { from: string; to: string; position: number }[] = []

    // First check multi-word phrases (more specific)
    let result = title
    for (const entry of LOCALE_VOCABULARY) {
        const from = targetLocale === 'US' || targetLocale === 'CA' ? entry.uk : entry.us
        const to = targetLocale === 'US' || targetLocale === 'CA' ? entry.us : entry.uk

        if (!from.includes(' ') && !to.includes(' ')) continue // handle single words below

        // Multi-word phrase replacement
        const regex = new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
        if (regex.test(result)) {
            const pos = result.toLowerCase().indexOf(from.toLowerCase())
            result = result.replace(regex, preserveCase(from, to))
            changes.push({ from, to, position: pos })
        }
    }

    // Single word translation — skip words already translated by multi-word pass
    const alreadyTranslated = new Set(changes.flatMap(c => c.to.toLowerCase().split(/\s+/)))
    const translatedWords = result.split(/\s+/).map((word, i) => {
        if (alreadyTranslated.has(word.toLowerCase())) return word
        const translated = getLocaleWord(word, targetLocale)
        if (translated !== word) {
            changes.push({ from: word, to: translated, position: i })
        }
        return translated
    })

    return {
        translated: translatedWords.join(' ').slice(0, 80),
        changes,
    }
}

// ── Filter injection keywords by locale ───────────────────────────────────────
// Remove wrong-locale words from the injection queue
export function filterByLocale(keywords: string[], targetLocale: Locale): string[] {
    return keywords.filter(kw => {
        const kwl = kw.toLowerCase()

        // Check marketplace avoid list
        const avoid = MARKETPLACE_KEYWORDS[targetLocale]?.avoid ?? []
        if (avoid.some(a => kwl.includes(a.toLowerCase()))) return false

        // Check if any word in the keyword is wrong locale
        // Exception: 'football' is valid on US eBay for American football products
        const words = kwl.split(/\s+/)
        const isNFLContext = kwl.includes('football') &&
            /nfl|american|touchdown|quarterback|superbowl/.test(kwl)
        if (!isNFLContext && words.some(w => isWrongLocaleWord(w, targetLocale))) return false

        return true
    })
}

// ── Get locale-preferred injection keywords ────────────────────────────────────
// Returns the best keywords to inject for this locale
export function getLocaleKeywords(
    locale: Locale,
    category: string,
    title: string,
    maxWords: number = 3,
): string[] {
    const titleLow = title.toLowerCase()
    const preferred = MARKETPLACE_KEYWORDS[locale]?.preferred ?? []

    return preferred
        .filter(kw => {
            if (titleLow.includes(kw.toLowerCase())) return false
            if (kw.length + 1 > 80 - title.length) return false
            return true
        })
        .slice(0, maxWords)
}

// ── Analyse locale compliance of a title ─────────────────────────────────────
export function analyseLocale(title: string, targetLocale: Locale): LocaleAnalysis {
    const words = title.split(/\s+/)
    const tl = title.toLowerCase()

    const wrongWords: { word: string; correct: string; position: number }[] = []
    const spellingErrors: { word: string; correct: string; position: number }[] = []

    // Check each word
    words.forEach((word, i) => {
        const wl = word.toLowerCase()

        if (isWrongLocaleWord(word, targetLocale)) {
            const correct = getLocaleWord(word, targetLocale)
            const entry = LOCALE_VOCABULARY.find(e =>
                (targetLocale === 'UK' && e.us.toLowerCase() === wl) ||
                (targetLocale === 'US' && e.uk.toLowerCase() === wl)
            )

            if (entry?.category === 'spelling') {
                spellingErrors.push({ word, correct, position: i })
            } else {
                wrongWords.push({ word, correct, position: i })
            }
        }
    })

    // What locale keywords are missing?
    const preferred = MARKETPLACE_KEYWORDS[targetLocale]?.preferred ?? []
    const missingLocale = preferred
        .filter(kw => !tl.includes(kw.toLowerCase()))
        .slice(0, 3)

    // Score
    const totalIssues = wrongWords.length + spellingErrors.length
    const localeScore = Math.max(0, 100 - (totalIssues * 20))

    // Tip
    let tip = ''
    if (wrongWords.length > 0) {
        tip = `Replace "${wrongWords[0].word}" with "${wrongWords[0].correct}" for ${targetLocale} buyers`
    } else if (spellingErrors.length > 0) {
        tip = `Fix spelling: "${spellingErrors[0].word}" → "${spellingErrors[0].correct}" (${targetLocale} spelling)`
    } else if (missingLocale.length > 0) {
        tip = `Add "${missingLocale[0]}" to attract ${targetLocale} buyers`
    } else {
        tip = `✅ Title well optimised for ${targetLocale} marketplace`
    }

    return { locale: targetLocale, wrongWords, spellingErrors, missingLocale, localeScore, tip }
}

// ── Translate injection queue ─────────────────────────────────────────────────
// Translate all keywords in a queue to the target locale
export function translateQueue(keywords: string[], targetLocale: Locale): string[] {
    return keywords
        .map(kw => {
            const { translated } = translateTitle(kw, targetLocale)
            return translated
        })
        .filter(kw => kw.length > 0)
}


// ── Size translation ─────────────────────────────────────────────────────────
export function translateSizeInTitle(
    title: string,
    fromLocale: 'UK' | 'US',
    toLocale: 'UK' | 'US',
    sizeType: 'mens-shoe' | 'womens-shoe' | 'womens-clothing' = 'womens-shoe',
): { translated: string; changes: { from: string; to: string }[] } {
    if (fromLocale === toLocale) return { translated: title, changes: [] }
    const changes: { from: string; to: string }[] = []
    let result = title

    const sizeMap: Record<string, string> =
        sizeType === 'mens-shoe' ? (fromLocale === 'UK' ? SHOE_SIZE_MAP.mens.uk_to_us : SHOE_SIZE_MAP.mens.us_to_uk) :
            sizeType === 'womens-shoe' ? (fromLocale === 'UK' ? SHOE_SIZE_MAP.womens.uk_to_us : SHOE_SIZE_MAP.womens.us_to_uk) :
    /* womens-clothing */            (fromLocale === 'UK' ? CLOTHING_SIZE_MAP.womens.uk_to_us : CLOTHING_SIZE_MAP.womens.us_to_uk)

    for (const [from, to] of Object.entries(sizeMap)) {
        const escaped = from.replace('.', '\\.')
        const regex = new RegExp(`(?<=\\bsize\\s|\\buk\\s|\\bus\\s|\\b)${escaped}(?=\\b)`, 'gi')
        if (regex.test(result)) {
            result = result.replace(regex, to)
            changes.push({ from, to })
        }
    }
    return { translated: result.slice(0, 80), changes }
}

// ── Apply locale to a spun title ──────────────────────────────────────────────
// Main function called by spin engine — translates title to target locale
export function applyLocale(
    title: string,
    targetLocale: Locale,
): string {
    if (targetLocale === 'UK' || targetLocale === 'US' || targetLocale === 'AU' || targetLocale === 'CA') {
        const { translated } = translateTitle(title, targetLocale)
        return translated
    }
    return title  // non-English locales — return as-is for now
}

// ── Score title locale compliance ─────────────────────────────────────────────
export function scoreLocaleCompliance(title: string, targetLocale: Locale): {
    score: number
    tip: string
} {
    const analysis = analyseLocale(title, targetLocale)
    return { score: analysis.localeScore, tip: analysis.tip }
}
