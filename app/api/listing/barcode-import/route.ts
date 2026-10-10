// app/api/listing/barcode-import/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Barcode → Listing Import API
//
// Accepts: POST { barcode: string }
// Returns: BarcodeImportResponse
//
// Lookup cascade (first match wins):
//   ISBN-13 / ISBN-10  → Google Books API       (free, unlimited)
//   Any EAN / UPC      → Open Food Facts         (free, unlimited — food items)
//   Any EAN / UPC      → UPCitemdb               (free tier: 100/day)
//   All                → AI simulation fallback  (Gemini → Anthropic)
//
// After product data is found:
//   → VeRO brand check (DB → AI fallback, same as url/image import)
//   → AI generates eBay-optimised title + description (Gemini → Anthropic)
//   → Draft saved to listing_drafts
//   → BarcodeImportResult returned
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
    detectBarcodeType,
    validateCheckDigit,
    type BarcodeImportResult,
    type BarcodeImportErrorCode,
    type BarcodeDataSource,
    type BarcodeProductData,
    type BarcodeType,
} from '@/app/dashboard/listing-generator/types/barcode-import.types'

export const maxDuration = 30

// ── Supabase admin ────────────────────────────────────────────────────────────
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── Read API key from vault ───────────────────────────────────────────────────
async function getKey(platformName: string): Promise<string | null> {
    try {
        const { data } = await supabaseAdmin
            .from('api_fleet_config')
            .select('primary_key_1, status')
            .eq('platform_name', platformName)
            .single()
        if (!data || data.primary_key_1 === 'EMPTY' || data.status === 'disconnected') return null
        return data.primary_key_1
    } catch { return null }
}

// ── Track API usage ───────────────────────────────────────────────────────────
async function trackUsage(platformName: string) {
    try {
        await supabaseAdmin
            .from('api_fleet_config')
            .update({ last_used_at: new Date().toISOString() })
            .eq('platform_name', platformName)
    } catch { /* non-fatal */ }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
async function getAuthUserId(): Promise<string | null> {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { getAll() { return cookieStore.getAll() } } }
        )
        const { data: { user } } = await supabase.auth.getUser()
        return user?.id ?? null
    } catch { return null }
}

// ── Parse JSON safely ─────────────────────────────────────────────────────────
function parseJson<T>(text: string): T | null {
    try {
        const clean = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim()
        return JSON.parse(clean) as T
    } catch { return null }
}

// ── VeRO check (DB exact → title scan → AI fallback) ─────────────────────────
async function checkVeRO(
    brand: string | null,
    titleText?: string | null,
    anthropicKey?: string | null
): Promise<{ status: 'clear' | 'warning' | 'flagged'; reason: string | null; vero_brand: string | null }> {
    const empty = { status: 'clear' as const, reason: null, vero_brand: null }
    if (!brand || brand.trim().length < 2) return empty
    const brandClean = brand.trim()

    try {
        // Layer 1: exact DB match
        const { data } = await supabaseAdmin
            .from('vero_brands')
            .select('brand_name, risk_level')
            .ilike('brand_name', brandClean)
            .limit(1)
            .maybeSingle()

        if (data) {
            const level = (data.risk_level ?? 'medium').toLowerCase()
            return {
                status: level === 'high' ? 'flagged' : 'warning',
                reason: `${data.brand_name} is a VeRO rights owner — verify you are authorised to sell this brand on eBay`,
                vero_brand: data.brand_name,
            }
        }

        // Layer 2: scan title against all known brands
        if (titleText && titleText.length > 2) {
            const { data: allBrands } = await supabaseAdmin
                .from('vero_brands')
                .select('brand_name, risk_level')
                .limit(500)

            if (allBrands) {
                const titleLower = titleText.toLowerCase()
                const hit = allBrands.find(b =>
                    b.brand_name && titleLower.includes(b.brand_name.toLowerCase())
                )
                if (hit) {
                    const level = (hit.risk_level ?? 'medium').toLowerCase()
                    return {
                        status: level === 'high' ? 'flagged' : 'warning',
                        reason: `${hit.brand_name} found in listing title — verify you are authorised to sell this brand on eBay`,
                        vero_brand: hit.brand_name,
                    }
                }
            }
        }

        // Layer 3: AI fallback
        if (anthropicKey) {
            try {
                const timeout = new Promise<null>(r => setTimeout(() => r(null), 6_000))
                const req = fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': anthropicKey,
                        'anthropic-version': '2023-06-01',
                    },
                    body: JSON.stringify({
                        model: 'claude-haiku-4-5',
                        max_tokens: 80,
                        messages: [{
                            role: 'user',
                            content: `Is the brand "${brandClean}" known to be registered with eBay's VeRO (Verified Rights Owner) programme, or is it a major brand that aggressively enforces IP on eBay UK?\n\nReply ONLY with valid JSON, no explanation:\n{"risk": "high" | "medium" | "low", "reason": "one sentence"}`,
                        }],
                    }),
                }).catch(() => null)

                const res = await Promise.race([req, timeout])
                if (res && res.ok) {
                    const d = await res.json() as { content?: Array<{ text?: string }> }
                    const text = d.content?.[0]?.text?.trim() ?? ''
                    const parsed = parseJson<{ risk: string; reason: string }>(text)
                    if (parsed && parsed.risk && parsed.risk !== 'low') {
                        return {
                            status: parsed.risk === 'high' ? 'flagged' : 'warning',
                            reason: parsed.reason ?? `${brandClean} may be a VeRO registered brand — verify before listing`,
                            vero_brand: brandClean,
                        }
                    }
                }
            } catch { /* non-fatal */ }
        }

        return empty
    } catch { return empty }
}

// ── Save draft ────────────────────────────────────────────────────────────────
async function saveDraft(
    userId: string,
    product: BarcodeProductData,
    barcode: string
): Promise<string | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('listing_drafts')
            .insert({
                user_id: userId,
                product_name: product.title,
                title: product.title_ebay,
                title_score: product.cassini_score,
                health_score: product.cassini_score ?? 60,
                description_html: product.description_html,
                category: product.category_label ?? null,
                condition: product.condition,
                ean: product.ean ?? barcode,
                item_specifics: product.item_specifics,
                sell_price: product.price_suggested ?? null,
                buy_price: null,
                supplier_price: null,
                markup_percentage: null,
                net_profit: null,
                margin: null,
                seller_type: 'own_stock',
                source_platform: 'barcode_import',
                supplier_url: null,
                supplier_images: product.images,
                photos: [],
                main_photo_url: product.images[0] ?? null,
                photo_count: 0,
                vero_status: product.vero_status,
                vero_brands_found: product.vero_brand ? [product.vero_brand] : [],
                status: 'draft',
                current_step: 1,
            })
            .select('id')
            .single()

        if (error || !data) {
            console.warn('[barcode-import] Failed to save draft:', error?.message)
            return null
        }
        return data.id as string
    } catch (err) {
        console.warn('[barcode-import] saveDraft threw:', err)
        return null
    }
}

// ── Raw product shape from lookup sources ─────────────────────────────────────
interface RawProduct {
    title: string
    brand?: string
    description?: string
    images: string[]
    category?: string
    price_market?: number   // market price anchor from source (e.g. Amazon price)
    // book-specific
    author?: string
    publisher?: string
    page_count?: number
    // food-specific
    ingredients?: string
}

// ── Lookup: Google Books (ISBN) ───────────────────────────────────────────────
async function lookupGoogleBooks(barcode: string): Promise<RawProduct | null> {
    try {
        const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(barcode)}&maxResults=1`
        const res = await fetch(url, { signal: AbortSignal.timeout(8_000) })
        if (!res.ok) return null

        const data = await res.json() as {
            totalItems: number
            items?: Array<{
                volumeInfo: {
                    title?: string
                    authors?: string[]
                    publisher?: string
                    description?: string
                    pageCount?: number
                    categories?: string[]
                    imageLinks?: { thumbnail?: string; smallThumbnail?: string }
                }
            }>
        }

        if (!data.totalItems || !data.items?.length) return null
        const v = data.items[0].volumeInfo

        const image = v.imageLinks?.thumbnail?.replace('http://', 'https://')
            ?? v.imageLinks?.smallThumbnail?.replace('http://', 'https://')
            ?? null

        return {
            title: v.title ?? 'Unknown Book',
            brand: v.authors?.[0] ?? undefined,  // treat first author as "brand" for VeRO
            author: v.authors?.join(', ') ?? undefined,
            publisher: v.publisher ?? undefined,
            page_count: v.pageCount ?? undefined,
            description: v.description ?? undefined,
            images: image ? [image] : [],
            category: v.categories?.[0] ?? 'Books',
        }
    } catch { return null }
}

// ── Lookup: Open Food Facts (food EANs) ───────────────────────────────────────
async function lookupOpenFoodFacts(barcode: string): Promise<RawProduct | null> {
    try {
        const url = `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`
        const res = await fetch(url, {
            signal: AbortSignal.timeout(8_000),
            headers: { 'User-Agent': 'Riazify/1.0 (contact@riazify.com)' },
        })
        if (!res.ok) return null

        const data = await res.json() as {
            status: number
            product?: {
                product_name?: string
                brands?: string
                image_url?: string
                categories?: string
                ingredients_text?: string
            }
        }

        if (data.status !== 1 || !data.product) return null
        const p = data.product

        // Only use if product name exists — Open Food Facts has many incomplete entries
        if (!p.product_name || p.product_name.trim().length < 2) return null

        return {
            title: p.product_name.trim(),
            brand: p.brands?.split(',')[0]?.trim() ?? undefined,
            images: p.image_url ? [p.image_url] : [],
            category: p.categories?.split(',')[0]?.trim() ?? 'Food & Grocery',
            ingredients: p.ingredients_text ?? undefined,
        }
    } catch { return null }
}

// ── Lookup: UPCitemdb (general EAN / UPC) ─────────────────────────────────────
async function lookupUpcItemDb(barcode: string): Promise<RawProduct | null> {
    try {
        const url = `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(barcode)}`
        const res = await fetch(url, {
            signal: AbortSignal.timeout(8_000),
            headers: { 'Accept': 'application/json' },
        })

        // 429 = rate limited on free tier
        if (res.status === 429) {
            console.warn('[barcode-import] UPCitemdb rate limit hit')
            return null
        }
        if (!res.ok) return null

        const data = await res.json() as {
            code?: string          // 'OK' or 'EXCEED_LIMIT'
            total?: number
            items?: Array<{
                title?: string
                brand?: string
                description?: string
                category?: string
                images?: string[]
                offers?: Array<{ price?: string; currency?: string }>
            }>
        }

        // Free tier exceeded
        if (data.code === 'EXCEED_LIMIT') {
            console.warn('[barcode-import] UPCitemdb daily limit exceeded')
            return null
        }

        if (!data.total || !data.items?.length) return null
        const item = data.items[0]

        if (!item.title || item.title.trim().length < 2) return null

        // Take lowest offer price as market anchor (Amazon / Walmart prices)
        let priceMarket: number | undefined
        if (item.offers?.length) {
            const prices = item.offers
                .map(o => parseFloat(o.price ?? ''))
                .filter(p => !isNaN(p) && p > 0)
            if (prices.length) priceMarket = Math.min(...prices)
        }

        await trackUsage('upcitemdb')

        return {
            title: item.title.trim(),
            brand: item.brand?.trim() ?? undefined,
            description: item.description?.trim() ?? undefined,
            images: (item.images ?? []).filter(Boolean).slice(0, 4),
            category: item.category?.trim() ?? undefined,
            price_market: priceMarket,
        }
    } catch { return null }
}

// ── AI transform: raw product → eBay listing fields ──────────────────────────
interface AiListingResult {
    title_ebay: string
    cassini_score: number
    description_html: string
    price_suggested: number | null
    category_label: string
    item_specifics: Record<string, string>
}

function buildAiPrompt(raw: RawProduct, barcodeType: BarcodeType, barcode: string): string {
    const isBook = barcodeType === 'ISBN13' || barcodeType === 'ISBN10'

    return `You are an expert eBay listing copywriter for Riazify, a UK eBay seller tool.
Generate a complete eBay listing for this product, optimised for UK buyers.

PRODUCT DATA:
- Title from source: ${raw.title}
- Brand: ${raw.brand ?? 'Unknown'}
- Category hint: ${raw.category ?? 'General'}
- Description from source: ${raw.description?.slice(0, 400) ?? 'None'}
${isBook ? `- Author: ${raw.author ?? 'Unknown'}` : ''}
${isBook ? `- Publisher: ${raw.publisher ?? 'Unknown'}` : ''}
${raw.ingredients ? `- Ingredients: ${raw.ingredients.slice(0, 200)}` : ''}
- Barcode: ${barcode} (${barcodeType})
- Market price anchor: ${raw.price_market ? `£${raw.price_market.toFixed(2)} (from Amazon/Walmart)` : 'Not available'}

OUTPUT RULES — follow strictly:
1. title_ebay: Max 80 chars. Natural language. Include brand, key feature, model/edition. No ALL CAPS. No excessive pipes. Optimised for eBay Cassini search.
2. cassini_score: 0–100 realistic eBay Cassini quality score for your title.
3. description_html: eBay-safe HTML only. Tags: <p><ul><li><strong><table><tr><td>. NO div/style/script. Include: 1 intro paragraph, feature bullet list, condition note. Max 300 words.
4. price_suggested: Realistic UK eBay selling price in GBP. Use market anchor as reference. Format: number only (e.g. 24.99). If no data, estimate.
5. category_label: Best eBay category path (e.g. "Books, Comics & Magazines > Fiction > Thrillers").
6. item_specifics: Object of key-value pairs relevant for eBay — Brand, Type, Model, EAN, Author (books), Platform (games), etc. 4–8 pairs max.

Reply ONLY with valid JSON, no explanation:
{
  "title_ebay": "...",
  "cassini_score": 78,
  "description_html": "<p>...</p>",
  "price_suggested": 19.99,
  "category_label": "...",
  "item_specifics": { "Brand": "...", "EAN": "${barcode}" }
}`
}

async function aiTransformWithGemini(
    raw: RawProduct,
    barcodeType: BarcodeType,
    barcode: string,
    geminiKey: string
): Promise<AiListingResult | null> {
    try {
        const prompt = buildAiPrompt(raw, barcodeType, barcode)
        const timeout = new Promise<null>(r => setTimeout(() => r(null), 12_000))
        const req = fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
                }),
            }
        ).catch(() => null)

        const res = await Promise.race([req, timeout])
        if (!res || !res.ok) return null

        const d = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
        const text = d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
        const parsed = parseJson<AiListingResult>(text)
        if (parsed?.title_ebay) {
            await trackUsage('gemini')
            return parsed
        }
        return null
    } catch { return null }
}

async function aiTransformWithAnthropic(
    raw: RawProduct,
    barcodeType: BarcodeType,
    barcode: string,
    anthropicKey: string
): Promise<AiListingResult | null> {
    try {
        const prompt = buildAiPrompt(raw, barcodeType, barcode)
        const timeout = new Promise<null>(r => setTimeout(() => r(null), 12_000))
        const req = fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5',
                max_tokens: 512,
                messages: [{ role: 'user', content: prompt }],
            }),
        }).catch(() => null)

        const res = await Promise.race([req, timeout])
        if (!res || !res.ok) return null

        const d = await res.json() as { content?: Array<{ text?: string }> }
        const text = d.content?.[0]?.text?.trim() ?? ''
        const parsed = parseJson<AiListingResult>(text)
        if (parsed?.title_ebay) {
            await trackUsage('anthropic')
            return parsed
        }
        return null
    } catch { return null }
}

// ── AI simulation fallback (when all lookup sources fail) ─────────────────────
async function aiSimulateLookup(
    barcode: string,
    barcodeType: BarcodeType,
    geminiKey: string | null,
    anthropicKey: string | null
): Promise<RawProduct | null> {
    const prompt = `You are a product database. Given this barcode, describe the most likely product.
Barcode: ${barcode} (type: ${barcodeType})

Reply ONLY with valid JSON:
{
  "title": "product name",
  "brand": "brand name or null",
  "category": "product category",
  "description": "2 sentence product description"
}`

    async function tryGemini() {
        if (!geminiKey) return null
        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.2, maxOutputTokens: 200 },
                    }),
                    signal: AbortSignal.timeout(8_000),
                }
            )
            if (!res.ok) return null
            const d = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
            return parseJson<RawProduct>(d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '')
        } catch { return null }
    }

    async function tryAnthropic() {
        if (!anthropicKey) return null
        try {
            const res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': anthropicKey,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: 'claude-haiku-4-5',
                    max_tokens: 200,
                    messages: [{ role: 'user', content: prompt }],
                }),
                signal: AbortSignal.timeout(8_000),
            })
            if (!res.ok) return null
            const d = await res.json() as { content?: Array<{ text?: string }> }
            return parseJson<RawProduct>(d.content?.[0]?.text?.trim() ?? '')
        } catch { return null }
    }

    const [g, a] = await Promise.all([tryGemini(), tryAnthropic()])
    const result = g ?? a
    if (!result) return null
    return { ...result, images: [] }
}

// ── Main POST handler ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    const userId = await getAuthUserId()

    // Parse body
    const body = await req.json().catch(() => ({})) as { barcode?: string }
    const rawBarcode = (body.barcode ?? '').trim()

    if (!rawBarcode) {
        return NextResponse.json(
            { success: false, errorCode: 'invalid_barcode', message: 'Barcode is required' },
            { status: 400 }
        )
    }

    // ── Step 1: Detect type and validate ────────────────────────────────────────
    const barcodeType = detectBarcodeType(rawBarcode)
    const digits = rawBarcode.replace(/\D/g, '')

    if (barcodeType === 'unknown') {
        return NextResponse.json(
            { success: false, errorCode: 'invalid_barcode' as BarcodeImportErrorCode, message: `"${rawBarcode}" is not a recognised barcode format. Try an EAN-13, UPC-A, or ISBN.` },
            { status: 422 }
        )
    }

    const isValid = validateCheckDigit(digits, barcodeType)
    if (!isValid) {
        return NextResponse.json(
            { success: false, errorCode: 'invalid_barcode' as BarcodeImportErrorCode, message: `Check digit validation failed for "${rawBarcode}". Please double-check the number.` },
            { status: 422 }
        )
    }

    // ── Step 2: Fetch AI keys ────────────────────────────────────────────────────
    const [geminiKey, anthropicKey] = await Promise.all([
        getKey('gemini'),
        getKey('anthropic'),
    ])

    // ── Step 3: Product lookup cascade ──────────────────────────────────────────
    let raw: RawProduct | null = null
    let source: BarcodeDataSource = 'upcitemdb'

    const isIsbn = barcodeType === 'ISBN13' || barcodeType === 'ISBN10'

    if (isIsbn) {
        // Books: Google Books first
        raw = await lookupGoogleBooks(digits)
        if (raw) source = 'google_books'
    }

    if (!raw) {
        // Try Open Food Facts (fast, unlimited, covers food EANs)
        raw = await lookupOpenFoodFacts(digits)
        if (raw) source = 'open_food_facts'
    }

    if (!raw) {
        // General fallback: UPCitemdb
        raw = await lookupUpcItemDb(digits)
        if (raw) source = 'upcitemdb'
    }

    if (!raw) {
        // Last resort: AI simulation
        raw = await aiSimulateLookup(digits, barcodeType, geminiKey, anthropicKey)
        if (raw) source = 'ai_simulation'
    }

    if (!raw) {
        // Truly nothing found
        return NextResponse.json(
            { success: false, errorCode: 'not_found' as BarcodeImportErrorCode, message: `No product found for barcode ${digits}` },
            { status: 404 }
        )
    }

    // ── Step 4: AI transforms raw → eBay listing fields ─────────────────────────
    let ai: AiListingResult | null = null

    if (geminiKey || anthropicKey) {
        const [aiGemini, aiAnthropic] = await Promise.all([
            geminiKey ? aiTransformWithGemini(raw, barcodeType, digits, geminiKey) : Promise.resolve(null),
            anthropicKey ? aiTransformWithAnthropic(raw, barcodeType, digits, anthropicKey) : Promise.resolve(null),
        ])
        ai = aiGemini ?? aiAnthropic
    }

    // Fallbacks when AI unavailable
    const titleEbay = ai?.title_ebay ?? raw.title.slice(0, 80)
    const cassini = ai?.cassini_score ?? 60
    const descHtml = ai?.description_html
        ?? `<p>${raw.title}${raw.brand ? ` by ${raw.brand}` : ''}. Please see product details below.</p>${raw.description ? `<p>${raw.description}</p>` : ''}`
    const categoryLabel = ai?.category_label ?? raw.category ?? 'General'
    const itemSpecifics: Record<string, string> = {
        Brand: raw.brand ?? 'Unbranded',
        EAN: digits,
        ...(ai?.item_specifics ?? {}),
    }
    if (isIsbn && raw.author) itemSpecifics['Author'] = raw.author
    if (raw.publisher) itemSpecifics['Publisher'] = raw.publisher

    // Price: AI suggestion → market anchor × 0.85 (eBay typically 15% below market) → null
    let priceSuggested: number | null = null
    if (ai?.price_suggested && ai.price_suggested > 0) {
        priceSuggested = ai.price_suggested
    } else if (raw.price_market && raw.price_market > 0) {
        priceSuggested = parseFloat((raw.price_market * 0.85).toFixed(2))
    }

    // ── Step 5: VeRO check ───────────────────────────────────────────────────────
    const vero = await checkVeRO(raw.brand ?? null, titleEbay, anthropicKey)

    // ── Step 6: Build product data ───────────────────────────────────────────────
    const product: BarcodeProductData = {
        title: raw.title,
        title_ebay: titleEbay,
        brand: raw.brand ?? undefined,
        description_html: descHtml,
        description_is_fallback: !ai?.description_html,
        images: raw.images,
        category_label: categoryLabel,
        condition: 'New',       // barcode lookups default to new; seller adjusts in wizard
        ean: !isIsbn ? digits : undefined,
        isbn: isIsbn ? digits : undefined,
        author: raw.author ?? undefined,
        publisher: raw.publisher ?? undefined,
        page_count: raw.page_count ?? undefined,
        item_specifics: itemSpecifics,
        // Price intelligence
        price_suggested: priceSuggested ?? undefined,
        price_avg_sold: undefined,  // v2: eBay Finding API
        price_range_low: undefined,
        price_range_high: undefined,
        sold_last_30_days: undefined,
        active_listings_count: undefined,
        // VeRO
        vero_status: vero.status,
        vero_reason: vero.reason,
        vero_brand: vero.vero_brand,
        // Cassini
        cassini_score: cassini,
    }

    // ── Step 7: Save draft ───────────────────────────────────────────────────────
    let draftId: string | null = null
    if (userId) {
        draftId = await saveDraft(userId, product, digits)
    }

    // ── Step 8: Return result ────────────────────────────────────────────────────
    const result: BarcodeImportResult = {
        barcode: digits,
        barcodeType,
        source,
        product,
        draft_id: draftId ?? undefined,
    }

    return NextResponse.json({ success: true, result })
}
