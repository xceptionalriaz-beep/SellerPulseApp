// app/api/title-builder/optimize/route.ts
//
// Multi-provider AI Optimize — Anthropic, OpenAI, Gemini.
// Full context-aware prompt fixing all 15 identified problems.
//
// Environment:
//   AI_PROVIDER=anthropic  →  ANTHROPIC_API_KEY=sk-ant-...
//   AI_PROVIDER=openai     →  OPENAI_API_KEY=sk-...
//   AI_PROVIDER=gemini     →  GEMINI_API_KEY=AIza-...
// Auto-detects if AI_PROVIDER not set (priority: Anthropic → OpenAI → Gemini).

import { NextRequest, NextResponse } from 'next/server'

// ── Context analysis (server-side) ───────────────────────────────────────────
// These helpers run on the server so we don't trust the client to send
// pre-analysed data — we re-derive it from the raw title ourselves.

/** Detect condition from title text so AI never invents one (Problem 2) */
function detectCondition(title: string): 'new' | 'used' | 'refurb' | 'faulty' | 'unknown' {
    const t = title.toLowerCase()
    if (/\bfor parts\b|\bspares?\b|\brepairs?\b|\bnot working\b|\bfault[yies]\b|\bbroken\b|\bcracked\b|\bdamaged\b|\buntested\b|\bas.?is\b/.test(t)) return 'faulty'
    if (/\brefurb|\brenewed\b|\breconditioned\b|\brestored\b/.test(t)) return 'refurb'
    if (/\bused\b|\bpre.?owned\b|\bsecond.?hand\b|\bworn\b|\bvintage\b/.test(t)) return 'used'
    if (/\bbrand new\b|\bnew\b|\bbnwt\b|\bbnib\b|\bsealed\b|\bunused\b|\bmint\b/.test(t)) return 'new'
    return 'unknown'
}

/** Detect if listing is for a faulty / parts item (Problem 6) */
function isFaultyListing(title: string): boolean {
    return /\bfor parts\b|\bspares?\b|\brepairs?\b|\bnot working\b|\bfault[yies]\b|\bbroken\b|\bcracked\b|\bdamaged\b|\buntested\b|\bas.?is\b/i.test(title)
}

/** Extract numbers and model codes that must not move (Problem 5) */
function extractProtectedTerms(title: string): string[] {
    const protected_: string[] = []
    // Model numbers e.g. S24, XM5, WH1000XM5, 75192
    const modelNums = title.match(/\b[A-Z0-9]*\d[A-Z0-9]*\b/g) ?? []
    modelNums.forEach(m => { if (m.length >= 2) protected_.push(m) })
    // Size codes e.g. W32, L32, XS-M, UK10
    const sizes = title.match(/\b(?:W|L|UK|EU|US)?\d+(?:\.\d+)?(?:\/\d+)?\b/g) ?? []
    sizes.forEach(s => protected_.push(s))
    // Quantity codes e.g. 3x, 3pk, x3
    const qty = title.match(/\b\d+(?:x|pk|pc|pcs|pack)\b|\bx\d+\b/gi) ?? []
    qty.forEach(q => protected_.push(q))
    return [...new Set(protected_)]
}

/** Extract seasonal terms that must be preserved (Problem 10) */
function extractSeasonalTerms(title: string): string[] {
    const seasonal = [
        'halloween', 'christmas', 'xmas', 'easter', 'valentine', 'thanksgiving',
        'birthday', 'anniversary', 'wedding', 'new year', 'diwali', 'eid',
        'hanukkah', 'mothers day', 'fathers day', 'back to school',
    ]
    const lower = title.toLowerCase()
    const found = seasonal.filter(s => lower.includes(s))
    return found
}

/** Extract bundle/quantity signals (Problem 8) */
function hasBundleSignal(title: string): boolean {
    return /\b(?:bundle|lot|pack|set|pair|x\d+|\d+x|\d+\s*pk|trio|duo|twin|multi)\b/i.test(title)
}

// ── Seller type detection ─────────────────────────────────────────────────────
// Detects which of 3 seller archetypes wrote this title so the AI can apply
// the right strategy instead of treating all titles the same.
type SellerType = 'dropshipper' | 'domestic' | 'professional'

interface SellerTypeResult {
    type: SellerType
    confidence: 'high' | 'medium' | 'low'
    signals: string[]   // human-readable reasons (for debugging, not sent to AI)
}

function detectSellerType(title: string, wordCount: number, charCount: number): SellerTypeResult {
    const t = title.toLowerCase()
    const signals: string[] = []

    // ── Dropshipper signals ─────────────────────────────────────────────────────
    // AliExpress / supplier titles have specific patterns:
    // hype openers, year prefix, generic fashion adjectives, broken grammar
    const dropHypeWords = [
        'hot sale', 'hot selling', '2024', '2025', 'trending', 'fashion',
        'luxury', 'high quality', 'top quality', 'good quality', 'best quality',
        'wholesale', 'dropship', 'new arrival', 'hot product', 'popular',
        'factory', 'oem odm', 'customized', 'bulk', 'free shipping',
    ]
    const dropHypeCount = dropHypeWords.filter(w => t.includes(w)).length

    // Supplier titles often have very specific patterns
    const hasYearPrefix = /^20\d\d\s/.test(title)           // starts with year
    const hasHotSale = /\bhot\s+(?:sale|selling)\b/i.test(title)
    const hasFashionHype = /\b(?:luxury|fashion|trending|stylish)\b/i.test(title)
    const hasGenericBrand = /\b(?:generic|no brand|unbranded|custom)\b/i.test(title)
    const hasSupplierStyle = /\b(?:men women|for men women|unisex men women)\b/i.test(title)
    const hasMaterialFirst = /^(?:stainless|silicone|leather|cotton|metal|plastic)\s/i.test(title)

    let dropScore = dropHypeCount * 2
    if (hasYearPrefix) { dropScore += 3; signals.push('year prefix') }
    if (hasHotSale) { dropScore += 3; signals.push('hot sale phrase') }
    if (hasFashionHype) { dropScore += 2; signals.push('fashion hype') }
    if (hasGenericBrand) { dropScore += 2; signals.push('generic brand') }
    if (hasSupplierStyle) { dropScore += 2; signals.push('supplier style') }
    if (hasMaterialFirst) { dropScore += 1; signals.push('material first') }
    if (dropHypeCount > 0) signals.push(`${dropHypeCount} hype words`)

    // ── Domestic / casual seller signals ────────────────────────────────────────
    // Personal language, conversational descriptions, casual condition notes
    const domesticPatterns = [
        /\bmy\b/,              // "my old Sony"
        /\bi('ve| have)\b/,   // "I've had this"
        /\bworks fine\b/,      // casual condition
        /\bgood condition\b/,  // informal
        /\bgreat condition\b/,
        /\bgently used\b/,
        /\bnot sure\b/,        // "not sure of model"
        /\bthink it('s| is)\b/,
        /\bfrom my\b/,         // "from my collection"
        /\bbought.*never\b/,   // "bought but never used"
        /\bno longer need\b/,
        /\bselling because\b/,
        /\bcollection\b.*\bclear\b/, // "collection clearance"
    ]
    const domesticHits = domesticPatterns.filter(p => p.test(t))
    let domesticScore = domesticHits.length * 3
    // Very short titles with only 1-2 words are often domestic sellers
    if (wordCount <= 3) { domesticScore += 2; signals.push('very few words') }
    // No model numbers in a short title = domestic
    if (wordCount < 6 && !/\d/.test(title)) { domesticScore += 2; signals.push('no specs') }
    if (domesticHits.length > 0) signals.push(`${domesticHits.length} casual phrases`)

    // ── Professional signals ─────────────────────────────────────────────────────
    // Well-structured, has model numbers, right length, proper eBay format
    const hasModelNum = /\b[A-Z]\d{2,}|\b\d{4,}\b/.test(title)  // model/set numbers
    const hasCondition = /\bnew\b|\bused\b|\brefurb|\bbnwt\b|\bbnib\b/i.test(title)
    const isGoodLength = charCount >= 40
    const hasSpec = /\b(?:\d+(?:gb|tb|mp|w|v|hz|mm|cm|ft|in|ml|kg|oz|l))\b/i.test(title)
    const properWordCount = wordCount >= 5 && wordCount <= 15

    let proScore = 0
    if (hasModelNum) { proScore += 3; signals.push('model number') }
    if (hasCondition) { proScore += 2; signals.push('condition stated') }
    if (isGoodLength) { proScore += 1; signals.push('good length') }
    if (hasSpec) { proScore += 2; signals.push('has spec') }
    if (properWordCount) { proScore += 1; signals.push('good word count') }

    // ── Determine winner ─────────────────────────────────────────────────────────
    const scores = { dropshipper: dropScore, domestic: domesticScore, professional: proScore }
    const winner = (Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0]) as SellerType
    const max = Math.max(dropScore, domesticScore, proScore)
    const confidence: 'high' | 'medium' | 'low' = max >= 6 ? 'high' : max >= 3 ? 'medium' : 'low'

    return { type: winner, confidence, signals }
}

// ── Title quality assessment ─────────────────────────────────────────────────
// Returns a quality score and a list of what's missing.
// Used by the API to decide whether to call the AI or reject the request.
interface TitleQuality {
    score: number    // 0-100
    ready: boolean   // true = good enough for AI, false = needs more info
    missing: string[]  // what the seller should add
    wordCount: number
}

function assessTitleQuality(title: string, categoryName: string): TitleQuality {
    const words = title.trim().split(/\s+/).filter(Boolean)
    const wordCount = words.length
    const t = title.toLowerCase()
    const missing: string[] = []
    let score = 0

    // Word count (0-25 points)
    if (wordCount >= 8) score += 25
    else if (wordCount >= 5) score += 15
    else if (wordCount >= 3) score += 8
    else if (wordCount >= 2) score += 3

    // Has a product type noun — not just a brand (0-20 points)
    // We check for common product type words across all categories
    const productTypeWords = [
        'case', 'cover', 'cable', 'charger', 'adapter', 'screen', 'battery', 'phone', 'tablet',
        'laptop', 'watch', 'headphone', 'speaker', 'camera', 'keyboard', 'mouse', 'controller',
        'shoe', 'trainer', 'boot', 'jacket', 'shirt', 'dress', 'trouser', 'jean', 'bag', 'hat',
        'toy', 'game', 'book', 'card', 'figure', 'model', 'set', 'kit', 'tool', 'drill',
        'chair', 'table', 'lamp', 'sofa', 'bed', 'rug', 'curtain',
        'ring', 'necklace', 'bracelet', 'earring', 'pendant',
        'car', 'van', 'bike', 'wheel', 'tyre', 'part',
        'dog', 'cat', 'pet', 'bird', 'fish', 'hamster',
    ]
    const hasProductType = productTypeWords.some(w => t.includes(w))
    if (hasProductType) score += 20
    else missing.push('product type (e.g. Case, Cable, Shoe, Toy)')

    // Has at least one spec/descriptor (0-20 points)
    const hasSpec = /\b(?:\d+(?:gb|tb|mp|w|v|hz|mm|cm|ft|in|ml|kg|oz|l|x\d+)|\d+(?:inch|mp|k)|[a-z]{1,2}\d+|\bblack\b|\bwhite\b|\bblue\b|\bred\b|\bgreen\b|\bgrey\b|\bgray\b|\bsize\b|\bnew\b|\bused\b)\b/i.test(title)
    if (hasSpec) score += 20
    else missing.push('a spec or attribute (colour, size, storage, model number)')

    // Character length (0-20 points)
    const chars = title.length
    if (chars >= 40) score += 20
    else if (chars >= 25) score += 10
    else if (chars >= 15) score += 5

    // Has a brand or category context (0-15 points)
    const hasBrand = categoryName.length > 0 || /\b(?:samsung|apple|nike|sony|lego|dewalt|dyson|lg|hp|dell|asus|acer|lenovo|logitech|anker|canon|nikon)\b/i.test(title)
    if (hasBrand) score += 15
    // No penalty — many products are unbranded

    const ready = score >= 35 && wordCount >= 3

    return { score, ready, missing, wordCount }
}

// ── Prompt builder ────────────────────────────────────────────────────────────
interface PromptContext {
    title: string
    keywords: string[]
    categoryName: string
    charCount: number
    marketplace: string
    previousSuggestion: string
    sellerType: SellerType
}

function buildPrompt(ctx: PromptContext): string {
    const {
        title, keywords, categoryName, charCount,
        marketplace, previousSuggestion, sellerType,
    } = ctx

    // ── Derive context from title ──────────────────────────────────────────────
    const condition = detectCondition(title)
    const faulty = isFaultyListing(title)
    const protectedTerms = extractProtectedTerms(title)
    const seasonal = extractSeasonalTerms(title)
    const hasBundle = hasBundleSignal(title)

    // ── Category line ──────────────────────────────────────────────────────────
    const categoryLine = categoryName
        ? `Category: ${categoryName}`
        : 'Category: unknown (infer from title words)'

    // ── Marketplace vocabulary ─────────────────────────────────────────────────
    const marketplaceLine = marketplace === 'UK'
        ? 'Marketplace: eBay UK — use British English (colour, trainers, grey, mum, boot, jumper, trousers)'
        : marketplace === 'AU'
            ? 'Marketplace: eBay Australia — use Australian English spelling'
            : marketplace === 'CA'
                ? 'Marketplace: eBay Canada — use Canadian English'
                : 'Marketplace: eBay US — use American English (color, sneakers, gray, mom)'

    // ── Seller type strategy — the core of the new prompt intelligence ─────────
    // Each seller type needs a completely different AI approach:
    const sellerTypeBlock = sellerType === 'dropshipper'
        ? `Seller type: DROPSHIPPER (supplier/AliExpress title detected)
Strategy: COMPLETELY REWRITE this title in natural buyer English.
- Strip all supplier hype (hot sale, trending, fashion, luxury, 2024, wholesale)
- Remove generic filler (high quality, best quality, good quality)
- Keep genuine technical specs (Bluetooth 5.3, LED, TWS, waterproof ratings)
- Rewrite in the format: [Product Type] [Brand if real] [Key Spec] [Colour/Size]
- Use vocabulary real eBay buyers type, not supplier marketing language
- Example input:  "2024 New Hot Sale Fashion Luxury Wireless Earbuds Bluetooth 5.3 LED"
- Example output: "Wireless Earbuds Bluetooth 5.3 TWS LED Charging Case In-Ear"`
        : sellerType === 'domestic'
            ? `Seller type: DOMESTIC/CASUAL SELLER (personal/conversational language detected)
Strategy: TRANSLATE this casual description into a proper eBay listing title.
- Extract the factual product information (what it is, brand if mentioned, condition clues)
- Convert to professional eBay title format: [Brand] [Product] [Key Info] [Condition]
- Do NOT preserve the casual language — rewrite it entirely in eBay format
- Do NOT invent facts not implied by the description
- Example input:  "old Sony walkman from my dad works fine"
- Example output: "Sony Walkman Portable Cassette Player Working Used Good Condition"`
            : `Seller type: PROFESSIONAL SELLER (structured title detected)
Strategy: SURGICAL IMPROVEMENT — the seller knows eBay. Make targeted upgrades.
- Improve keyword order if needed (highest-volume search terms first)
- Fill remaining character space with genuinely useful buyer terms
- Target a different buyer search segment if current title is already well-optimised
- Make a MEANINGFUL improvement, not just minor rearrangement`

    // ── Length strategy ────────────────────────────────────────────────────────
    const lengthLine = charCount >= 75
        ? `Title length: ${charCount}/80 chars (near limit). Improve keyword quality and word order only.`
        : charCount >= 55
            ? `Title length: ${charCount}/80 chars. Add ${80 - charCount} more chars of high-value buyer search terms.`
            : `Title length: ${charCount}/80 chars (SHORT). Aggressively fill the remaining ${80 - charCount} chars.`

    // ── Condition protection ────────────────────────────────────────────────────
    const conditionLine = condition === 'unknown'
        ? 'Condition: not stated. Do NOT add New, Used, or Brand New — seller will set this in item specifics.'
        : `Condition: "${condition}" confirmed in original. Preserve exactly.`

    // ── Other protection lines ─────────────────────────────────────────────────
    const faultyLine = faulty ? 'FAULTY/PARTS LISTING: Legally required — never remove fault descriptors (cracked, not working, spares, repairs). Never optimise as a working item.' : ''
    const protectedLine = protectedTerms.length > 0 ? `Protected terms — NEVER move, remove, or reformat: ${protectedTerms.join(', ')}` : ''
    const seasonalLine = seasonal.length > 0 ? `Seasonal terms to preserve: ${seasonal.join(', ')}` : ''
    const bundleLine = hasBundle ? 'Bundle/quantity signal present. Preserve it (x3, 3pk, bundle, pair, lot).' : ''
    const keywordLine = keywords.length > 0 ? `Live buyer search terms from eBay (use most relevant): ${keywords.slice(0, 8).join(', ')}` : ''
    const previousLine = previousSuggestion ? `Seller REJECTED this previous suggestion — try a completely different angle: "${previousSuggestion}"` : ''

    const contextBlock = [
        categoryLine, marketplaceLine, sellerTypeBlock, lengthLine,
        conditionLine, faultyLine, protectedLine, seasonalLine,
        bundleLine, keywordLine, previousLine,
    ].filter(Boolean).join('\n')

    const creativityLine = charCount < 45 || sellerType !== 'professional'
        ? 'Be creative and expansive — significant rewriting is needed and expected.'
        : charCount >= 75
            ? 'Be precise — every change must be a measurable improvement.'
            : 'Balance creativity and precision.'

    return `You are a professional eBay listing title specialist with expert knowledge of eBay Cassini search, buyer psychology, and all three eBay seller types: dropshippers, domestic sellers, and professional resellers.

CONTEXT:
${contextBlock}

WHAT MAKES AN EXCELLENT EBAY TITLE:
- First 3 words carry the most Cassini ranking weight — highest-volume search terms go here
- Structure: Brand/ProductType → Key Spec → Condition → Size/Colour/Quantity
- Every word is something a real buyer types into eBay search
- Target 70–80 characters (eBay Cassini sweet spot)
- No word appears twice
- Reads naturally to a human buyer scanning search results

ABSOLUTE RULES:
- Never invent compatibility (Compatible with, Fits, For use with) unless already in original
- Never add a brand not already in the original title
- Never move or remove protected terms or numbers listed above
- Never remove fault descriptors from faulty listings
- ${charCount >= 75 ? 'Near the 80-char limit — do not add words, only improve existing ones' : 'Maximum 80 characters'}
- ${creativityLine}

Original title: "${title}"

Output: ONE optimised title only. No quotes, no explanation, no label, no punctuation at start or end.`
}

// ── Post-process ──────────────────────────────────────────────────────────────
function postProcess(raw: string): string {
    let t = raw
        .replace(/^["'`\-–—•*#]+|["'`\-–—•*#]+$/g, '')
        .replace(/^(here'?s?(?: is)?|output|result|title|optimized title|optimised title|answer)[\s:]+/i, '')
        .trim()
    if (t.length > 80) {
        const cut = t.slice(0, 80)
        const sp = cut.lastIndexOf(' ')
        t = sp > -1 ? t.slice(0, sp) : cut
    }
    return t
}

// ── Dynamic temperature (Problem 15) ─────────────────────────────────────────
// Short title = more creative suggestions needed (higher temp)
// Near-limit title = surgical precision needed (lower temp)
function getTemperature(charCount: number): number {
    if (charCount < 45) return 0.7   // very short — be creative
    if (charCount < 60) return 0.5   // medium — balanced
    return 0.3                        // near limit — be precise
}

// ── Providers ─────────────────────────────────────────────────────────────────
async function callAnthropic(prompt: string, temp: number): Promise<string> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 30,
            temperature: temp,
            messages: [{ role: 'user', content: prompt }],
        }),
    })
    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`)
    const data = await res.json()
    return data.content?.[0]?.text ?? ''
}

async function callOpenAI(prompt: string, temp: number): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            max_tokens: 30,
            temperature: temp,
            messages: [{ role: 'user', content: prompt }],
        }),
    })
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`)
    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? ''
}

async function callGemini(prompt: string, temp: number): Promise<string> {
    const model = 'gemini-2.0-flash'
    const apiKey = process.env.GEMINI_API_KEY
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 30, temperature: temp },
        }),
    })
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`)
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

// ── Provider detection ────────────────────────────────────────────────────────
function detectProvider(): 'anthropic' | 'openai' | 'gemini' | null {
    const set = (process.env.AI_PROVIDER ?? '').toLowerCase()
    if (set === 'anthropic' && process.env.ANTHROPIC_API_KEY) return 'anthropic'
    if (set === 'openai' && process.env.OPENAI_API_KEY) return 'openai'
    if (set === 'gemini' && process.env.GEMINI_API_KEY) return 'gemini'
    if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
    if (process.env.OPENAI_API_KEY) return 'openai'
    if (process.env.GEMINI_API_KEY) return 'gemini'
    return null
}

// ── Handler ───────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const {
            title = '',
            keywords = [],
            categoryName = '',
            marketplace = 'US',
            previousSuggestion = '',
            // quickContext: optional extra info seller provided via the pre-call panel
            // { condition: 'new'|'used'|'faulty', category: 'Electronics'|... }
            quickContext = null,
        } = await req.json()

        if (!title || typeof title !== 'string') {
            return NextResponse.json({ error: 'title is required' }, { status: 400 })
        }

        const cleanTitle = title.trim()
        const words = cleanTitle.split(/\s+/).filter(Boolean)
        const wordCount = words.length
        const charCount = cleanTitle.length

        // ── Quality gate — assess title before burning an API credit ─────────────
        // If the title is too vague, return needsMoreInfo instead of calling the AI.
        // This saves API cost AND gives sellers better results.
        const quality = assessTitleQuality(cleanTitle, categoryName)

        // If seller provided quickContext (from the pre-call panel), that overrides
        // the quality gate — they've given us enough extra info to proceed
        if (!quality.ready && !quickContext) {
            return NextResponse.json({
                needsMoreInfo: true,
                missing: quality.missing,
                score: quality.score,
                wordCount,
                message: wordCount <= 2
                    ? `"${cleanTitle}" is too vague for AI to optimise. Add the product type, condition, and at least one spec so the AI has something to work with.`
                    : `Add a few more details so AI can produce an excellent result.`,
            }, { status: 200 })  // 200 not error — this is a valid response
        }

        const provider = detectProvider()
        if (!provider) {
            return NextResponse.json({
                error: 'No AI provider configured. Set AI_PROVIDER and the matching API key (ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY) in your Vercel environment variables.',
            }, { status: 503 })
        }

        // ── Detect seller type ────────────────────────────────────────────────────
        // Determine which strategy the AI should use for this specific title
        const sellerTypeResult = detectSellerType(cleanTitle, wordCount, charCount)

        // If seller gave us quickContext (condition + category from the pre-call panel),
        // enrich the title with that info so the AI has more to work with
        let enrichedTitle = cleanTitle
        if (quickContext?.condition && quickContext.condition !== 'unknown') {
            const condMap: Record<string, string> = {
                new: 'Brand New',
                used: 'Used',
                faulty: 'For Parts Not Working',
            }
            const condWord = condMap[quickContext.condition]
            if (condWord && !cleanTitle.toLowerCase().includes(condWord.toLowerCase())) {
                enrichedTitle = `${cleanTitle} ${condWord}`
            }
        }
        if (quickContext?.category && !categoryName) {
            // Use the quick-selected category as context
        }

        const temp = getTemperature(charCount)
        const prompt = buildPrompt({
            title: enrichedTitle,
            keywords: Array.isArray(keywords) ? keywords : [],
            categoryName: quickContext?.category || (typeof categoryName === 'string' ? categoryName : ''),
            charCount: enrichedTitle.length,
            marketplace: typeof marketplace === 'string' ? marketplace.toUpperCase() : 'US',
            previousSuggestion: typeof previousSuggestion === 'string' ? previousSuggestion : '',
            sellerType: sellerTypeResult.type,
        })

        let raw = ''
        switch (provider) {
            case 'anthropic': raw = await callAnthropic(prompt, temp); break
            case 'openai': raw = await callOpenAI(prompt, temp); break
            case 'gemini': raw = await callGemini(prompt, temp); break
        }

        const optimizedTitle = postProcess(raw)

        if (!optimizedTitle) {
            return NextResponse.json({ error: 'AI returned an empty title — try again.' }, { status: 500 })
        }

        return NextResponse.json({
            optimizedTitle,
            provider,
            sellerType: sellerTypeResult.type,    // shown in the panel so sellers learn
        })

    } catch (err: any) {
        console.error('[title-optimize]', err.message)
        return NextResponse.json({ error: err.message ?? 'AI optimize failed' }, { status: 500 })
    }
}
