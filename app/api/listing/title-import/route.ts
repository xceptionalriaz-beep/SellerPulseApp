// app/api/listing/title-import/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Title → Listing Import API
//
// Accepts: POST { title, condition?, useAiTitle?, useAiPrice? }
// Returns: TitleImportResponse (same BarcodeImportResult shape — reuses preview)
//
// Lookup cascade (first match wins):
//   1. UPCitemdb title search      (paid key from vault; free trial also works)
//   2. Gemini web-search prompt    (finds product data from title alone)
//   3. Anthropic fallback prompt   (generates best-effort product data)
//
// After product data is found:
//   → AI generates eBay title + HTML description (if useAiTitle = true)
//   → AI suggests price (if useAiPrice = true)
//   → VeRO brand check
//   → Draft saved to listing_drafts
//   → TitleImportResponse returned
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type {
    BarcodeImportResult,
    BarcodeImportErrorCode,
    BarcodeProductData,
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

// ── Raw product shape ─────────────────────────────────────────────────────────
interface RawProduct {
    title: string
    brand?: string
    description?: string
    images: string[]
    category?: string
    price_market?: number
    model?: string
    features?: string[]
}

// ── AI listing result shape ───────────────────────────────────────────────────
interface AiListingResult {
    title_ebay: string
    cassini_score: number
    description_html: string
    price_suggested: number | null
    category_label: string
    item_specifics: Record<string, string>
}

// ── VeRO check ────────────────────────────────────────────────────────────────
async function checkVeRO(
    brand: string | null,
    titleText?: string | null,
    anthropicKey?: string | null
): Promise<{ status: 'clear' | 'warning' | 'flagged'; reason: string | null; vero_brand: string | null }> {
    const empty = { status: 'clear' as const, reason: null, vero_brand: null }
    if (!brand || brand.trim().length < 2) {
        // Still scan the title even if no brand field
        if (!titleText || titleText.length < 2) return empty
    }
    const brandClean = (brand ?? '').trim()

    try {
        // Layer 1: exact DB match on brand
        if (brandClean.length >= 2) {
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
        if (anthropicKey && brandClean.length >= 2) {
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
                            content: `Is the brand "${brandClean}" known to be registered with eBay's VeRO (Verified Rights Owner) programme, or is it a major brand that aggressively enforces IP on eBay UK?\n\nReply ONLY with valid JSON:\n{"risk": "high" | "medium" | "low", "reason": "one sentence"}`,
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
    originalTitle: string,
    condition: string
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
                condition,
                ean: product.ean ?? null,
                item_specifics: product.item_specifics,
                sell_price: product.price_suggested ?? null,
                buy_price: null,
                supplier_price: null,
                markup_percentage: null,
                net_profit: null,
                margin: null,
                seller_type: 'own_stock',
                source_platform: 'title_import',
                supplier_url: null,
                supplier_images: product.images,
                photos: [],
                main_photo_url: product.images[0] ?? null,
                photo_count: 0,
                vero_status: product.vero_status,
                vero_brands_found: product.vero_brand ? [product.vero_brand] : [],
                status: 'draft',
                current_step: 1,
                notes: `Imported via Title to Listing — original search: "${originalTitle}"`,
            })
            .select('id')
            .single()

        if (error || !data) {
            console.warn('[title-import] Failed to save draft:', error?.message)
            return null
        }
        return data.id as string
    } catch (err) {
        console.warn('[title-import] saveDraft threw:', err)
        return null
    }
}

// ── Step 1: UPCitemdb title search ────────────────────────────────────────────
// Searches by product name instead of barcode. Works on free trial (limited)
// and unlocks more results with a paid key from vault.
async function searchUpcItemDb(title: string, userKey?: string | null): Promise<RawProduct | null> {
    try {
        const encoded = encodeURIComponent(title)
        const base = userKey
            ? `https://api.upcitemdb.com/prod/v1/search?s=${encoded}&type=product`
            : `https://api.upcitemdb.com/prod/trial/search?s=${encoded}&type=product`

        const res = await fetch(base, {
            signal: AbortSignal.timeout(8_000),
            headers: { 'Accept': 'application/json' },
        })

        if (res.status === 429) {
            console.warn('[title-import] UPCitemdb rate limited')
            return null
        }
        if (!res.ok) return null

        const data = await res.json() as {
            code?: string
            total?: number
            items?: Array<{
                title?: string
                brand?: string
                description?: string
                category?: string
                images?: string[]
                lowest_recorded_price?: number
                highest_recorded_price?: number
            }>
        }

        const item = data.items?.[0]
        if (!item?.title || item.title.trim().length < 2) return null

        await trackUsage('upcitemdb')

        const priceAnchor = item.lowest_recorded_price && item.highest_recorded_price
            ? (item.lowest_recorded_price + item.highest_recorded_price) / 2
            : item.lowest_recorded_price ?? undefined

        return {
            title: item.title.trim(),
            brand: item.brand?.trim() ?? undefined,
            description: item.description?.trim() ?? undefined,
            images: (item.images ?? []).slice(0, 8),
            category: item.category?.trim() ?? undefined,
            price_market: priceAnchor,
        }
    } catch { return null }
}

// ── Step 2: Gemini web-search product lookup ──────────────────────────────────
// Uses Gemini's knowledge + web context to find structured product data from
// a plain-text product title.
async function searchWithGemini(title: string, geminiKey: string): Promise<RawProduct | null> {
    const prompt = `You are a product research assistant for a UK eBay seller tool.
The seller has typed this product name: "${title}"

Search your knowledge to find the most likely product this refers to.
Return structured product data that can be used to create an eBay listing.

Reply ONLY with valid JSON, no explanation:
{
  "title": "Full product name including brand, model, and key specs",
  "brand": "Brand name or null",
  "description": "2-3 sentence product description highlighting key features",
  "category": "Product category (e.g. Consumer Electronics > Headphones)",
  "model": "Model number/name if known",
  "features": ["feature 1", "feature 2", "feature 3"],
  "images": [],
  "price_market": null
}

If you cannot identify a real product from this title, still return a best-effort JSON.
Use null for fields you don't know. Keep images as empty array — we will find those separately.`

    try {
        const timeout = new Promise<null>(r => setTimeout(() => r(null), 12_000))
        const req = fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.2, maxOutputTokens: 400 },
                }),
            }
        ).catch(() => null)

        const res = await Promise.race([req, timeout])
        if (!res || !res.ok) return null

        const d = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
        const text = d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
        const parsed = parseJson<RawProduct>(text)

        if (parsed?.title && parsed.title.trim().length > 2) {
            await trackUsage('gemini')
            return { ...parsed, images: parsed.images ?? [] }
        }
        return null
    } catch { return null }
}

// ── Step 3: Anthropic fallback product lookup ─────────────────────────────────
async function searchWithAnthropic(title: string, anthropicKey: string): Promise<RawProduct | null> {
    const prompt = `You are a product research assistant for a UK eBay seller tool.
The seller has typed this product name: "${title}"

Find the most likely product this refers to and return structured data.

Reply ONLY with valid JSON:
{
  "title": "Full product name including brand, model, key specs",
  "brand": "Brand name or null",
  "description": "2-3 sentence product description",
  "category": "Product category",
  "model": "Model number if known",
  "features": ["key feature 1", "key feature 2"],
  "images": [],
  "price_market": null
}`

    try {
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
                max_tokens: 400,
                messages: [{ role: 'user', content: prompt }],
            }),
        }).catch(() => null)

        const res = await Promise.race([req, timeout])
        if (!res || !res.ok) return null

        const d = await res.json() as { content?: Array<{ text?: string }> }
        const text = d.content?.[0]?.text?.trim() ?? ''
        const parsed = parseJson<RawProduct>(text)

        if (parsed?.title && parsed.title.trim().length > 2) {
            await trackUsage('anthropic')
            return { ...parsed, images: parsed.images ?? [] }
        }
        return null
    } catch { return null }
}

// ── AI transform: raw product → eBay listing fields ──────────────────────────
function buildAiTransformPrompt(raw: RawProduct, condition: string, originalTitle: string): string {
    const featureList = raw.features?.length
        ? `\n- Key features: ${raw.features.slice(0, 5).join(', ')}`
        : ''

    return `You are an expert eBay listing copywriter for Riazify, a UK eBay seller tool.
Generate a complete eBay listing for this product, optimised for UK buyers.

PRODUCT DATA:
- Seller searched for: "${originalTitle}"
- Product identified as: ${raw.title}
- Brand: ${raw.brand ?? 'Unknown'}
- Model: ${raw.model ?? 'Unknown'}
- Category hint: ${raw.category ?? 'General'}
- Description: ${raw.description?.slice(0, 400) ?? 'None'}${featureList}
- Condition: ${condition}
- Market price anchor: ${raw.price_market ? `£${raw.price_market.toFixed(2)}` : 'Not available — estimate from knowledge'}

OUTPUT RULES — follow strictly:
1. title_ebay: Max 80 chars. Natural language. Include brand, model, key feature, condition hint if not New. No ALL CAPS. Optimised for eBay Cassini.
2. cassini_score: 0–100 realistic eBay Cassini quality score for your title.
3. description_html: eBay-safe HTML only. Tags: <p><ul><li><strong>. NO div/style/script. Include intro paragraph, feature bullets, condition note. Max 300 words.
4. price_suggested: Realistic UK eBay selling price in GBP. Number only (e.g. 24.99). Account for condition — Used items should be lower.
5. category_label: Best eBay category path (e.g. "Sound & Vision > Headphones").
6. item_specifics: 4–8 key-value pairs — Brand, Model, Type, Condition, MPN, Colour, Size, etc.

Reply ONLY with valid JSON:
{
  "title_ebay": "...",
  "cassini_score": 78,
  "description_html": "<p>...</p>",
  "price_suggested": 19.99,
  "category_label": "...",
  "item_specifics": { "Brand": "...", "Model": "..." }
}`
}

async function aiTransformWithGemini(
    raw: RawProduct,
    condition: string,
    originalTitle: string,
    geminiKey: string
): Promise<AiListingResult | null> {
    try {
        const prompt = buildAiTransformPrompt(raw, condition, originalTitle)
        const timeout = new Promise<null>(r => setTimeout(() => r(null), 12_000))
        const req = fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.3, maxOutputTokens: 600 },
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
    condition: string,
    originalTitle: string,
    anthropicKey: string
): Promise<AiListingResult | null> {
    try {
        const prompt = buildAiTransformPrompt(raw, condition, originalTitle)
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
                max_tokens: 600,
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

// ── Request / Response types ──────────────────────────────────────────────────
export interface TitleImportResponse {
    success: boolean
    result?: BarcodeImportResult   // reuses the same shape — preview works out of the box
    errorCode?: BarcodeImportErrorCode
    message?: string
}

// ── Main POST handler ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    const userId = await getAuthUserId()

    // ── Parse body ──────────────────────────────────────────────────────────────
    const body = await req.json().catch(() => ({})) as {
        title?: string
        condition?: string
        useAiTitle?: boolean
        useAiPrice?: boolean
    }

    const rawTitle = (body.title ?? '').trim()
    const condition = (body.condition ?? 'New').trim()
    const useAiTitle = body.useAiTitle !== false   // default true
    const useAiPrice = body.useAiPrice !== false   // default true

    // ── Validate ────────────────────────────────────────────────────────────────
    if (!rawTitle || rawTitle.length < 3) {
        return NextResponse.json(
            { success: false, errorCode: 'not_found', message: 'Please enter at least 3 characters to search.' },
            { status: 400 }
        )
    }
    if (rawTitle.length > 200) {
        return NextResponse.json(
            { success: false, errorCode: 'not_found', message: 'Title too long — keep it under 200 characters.' },
            { status: 400 }
        )
    }

    // ── Step 1: Fetch API keys ──────────────────────────────────────────────────
    const [geminiKey, anthropicKey, upcitemdbKey] = await Promise.all([
        getKey('gemini'),
        getKey('anthropic'),
        getKey('upcitemdb'),
    ])

    // ── Step 2: Product lookup cascade ─────────────────────────────────────────
    let raw: RawProduct | null = null
    let source: string = 'ai_simulation'

    // 2a — UPCitemdb title search (fast, has images + prices if found)
    raw = await searchUpcItemDb(rawTitle, upcitemdbKey)
    if (raw) source = 'upcitemdb'

    // 2b — Gemini web-search lookup (uses AI knowledge of real products)
    if (!raw && geminiKey) {
        raw = await searchWithGemini(rawTitle, geminiKey)
        if (raw) source = 'ai_simulation'
    }

    // 2c — Anthropic fallback
    if (!raw && anthropicKey) {
        raw = await searchWithAnthropic(rawTitle, anthropicKey)
        if (raw) source = 'ai_simulation'
    }

    // 2d — Bare minimum fallback: use the title itself as the product
    //      We never return not_found for title imports — AI can always work with a name
    if (!raw) {
        if (!geminiKey && !anthropicKey) {
            return NextResponse.json(
                {
                    success: false,
                    errorCode: 'config_error' as BarcodeImportErrorCode,
                    message: 'No AI keys configured. Add a Gemini or Anthropic key in API Vault to use Title to Listing.',
                },
                { status: 503 }
            )
        }
        // Use the raw title as-is — AI transform will do its best
        raw = {
            title: rawTitle,
            brand: extractBrandFromTitle(rawTitle),
            images: [],
        }
        source = 'ai_simulation'
    }

    // ── Step 3: AI transform → eBay listing fields ──────────────────────────────
    let ai: AiListingResult | null = null

    if (useAiTitle && (geminiKey || anthropicKey)) {
        const [aiGemini, aiAnthropic] = await Promise.all([
            geminiKey ? aiTransformWithGemini(raw, condition, rawTitle, geminiKey) : Promise.resolve(null),
            anthropicKey ? aiTransformWithAnthropic(raw, condition, rawTitle, anthropicKey) : Promise.resolve(null),
        ])
        ai = aiGemini ?? aiAnthropic
    }

    // Fallbacks when AI disabled or unavailable
    const titleEbay = useAiTitle ? (ai?.title_ebay ?? raw.title.slice(0, 80)) : raw.title.slice(0, 80)
    const cassini = ai?.cassini_score ?? 60
    const descHtml = useAiTitle
        ? (ai?.description_html
            ?? `<p>${raw.title}${raw.brand ? ` by ${raw.brand}` : ''}. ${raw.description ?? 'See product details.'}</p>`)
        : `<p>${raw.title}${raw.brand ? ` by ${raw.brand}` : ''}. ${raw.description ?? 'See product details.'}</p>`
    const categoryLabel = ai?.category_label ?? raw.category ?? 'General'
    const itemSpecifics: Record<string, string> = {
        Brand: raw.brand ?? 'Unbranded',
        Condition: condition,
        ...(raw.model ? { Model: raw.model } : {}),
        ...(ai?.item_specifics ?? {}),
    }

    // Price: AI suggestion → market anchor × 0.85 → null
    let priceSuggested: number | undefined = undefined
    if (useAiPrice) {
        if (ai?.price_suggested && ai.price_suggested > 0) {
            priceSuggested = ai.price_suggested
        } else if (raw.price_market && raw.price_market > 0) {
            priceSuggested = parseFloat((raw.price_market * 0.85).toFixed(2))
        }
    }

    // ── Step 4: VeRO check ──────────────────────────────────────────────────────
    const vero = await checkVeRO(raw.brand ?? null, titleEbay, anthropicKey)

    // ── Step 5: Build product data ──────────────────────────────────────────────
    const product: BarcodeProductData = {
        title: raw.title,
        title_ebay: titleEbay,
        brand: raw.brand ?? undefined,
        description_html: descHtml,
        description_is_fallback: !useAiTitle || !ai?.description_html,
        images: raw.images,
        category_label: categoryLabel,
        condition,
        item_specifics: itemSpecifics,
        // Price intelligence
        price_suggested: priceSuggested,
        price_avg_sold: undefined,
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

    // ── Step 6: Save draft ──────────────────────────────────────────────────────
    let draftId: string | null = null
    if (userId) {
        draftId = await saveDraft(userId, product, rawTitle, condition)
    }

    // ── Step 7: Return result ───────────────────────────────────────────────────
    const result: BarcodeImportResult = {
        barcode: rawTitle,          // reuses barcode field as the search term
        barcodeType: 'unknown',         // not applicable for title import
        source: source as 'upcitemdb' | 'ai_simulation',
        product,
        draft_id: draftId ?? undefined,
    }

    return NextResponse.json({ success: true, result } satisfies TitleImportResponse)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Best-effort brand extraction from a product title.
 * Looks for known brand patterns at the start of the title.
 * Used only as a last-resort fallback when no API returned brand data.
 */
function extractBrandFromTitle(title: string): string | undefined {
    const firstWord = title.trim().split(/\s+/)[0]
    if (!firstWord || firstWord.length < 2) return undefined

    // Common generic words that are NOT brands
    const notBrands = new Set([
        'new', 'used', 'vintage', 'rare', 'original', 'genuine', 'authentic',
        'professional', 'premium', 'deluxe', 'super', 'ultra', 'mini', 'large',
        'black', 'white', 'red', 'blue', 'green', 'grey', 'silver', 'gold',
        'set', 'pack', 'pair', 'lot', 'bundle', 'kit', 'box',
    ])

    if (notBrands.has(firstWord.toLowerCase())) return undefined
    return firstWord
}
