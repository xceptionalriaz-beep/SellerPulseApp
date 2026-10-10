// app/api/listing/image-import/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Image → Listing Import API
//
// Accepts: POST {
//   images:          Array<{ index, name, type, data (base64), isLabel }>
//   labelImageIndex: number | null
//   condition:       'new' | 'used' | 'for_parts'
//   subCondition:    'excellent' | 'good' | 'fair' | 'poor' | null
//   hint:            string | null
// }
//
// Returns: ImageImportResult  (same shape as ImageImportProcessing expects)
//
// AI: Gemini 1.5 Flash + Claude Haiku 3 vision in parallel, Promise.race, 15s each.
// No AbortSignal.timeout() — hangs in Node dev mode.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { ProcessingTask, ProcessingTaskStatus } from '@/app/dashboard/listing-generator/types/url-import.types'

export const maxDuration = 60

// ── Supabase admin client ─────────────────────────────────────────────────────
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── Incoming image shape from client ─────────────────────────────────────────
interface EncodedImage {
    index: number
    name: string
    type: string   // 'image/jpeg' | 'image/png'
    data: string   // base64 (already resized client-side to ≤1024px)
    isLabel: boolean
}

// ── Vision AI output shape ────────────────────────────────────────────────────
interface VisionResult {
    title_raw: string
    title_ebay: string
    cassini_score: number
    description_html: string
    price_suggested: number | null
    category_label: string
    item_specifics: Record<string, string>
    brand: string | null
}

// ── Label extraction output shape ─────────────────────────────────────────────
interface LabelResult {
    ean: string | null
    brand: string | null
    model_number: string | null
}

// ── Map condition + subCondition → eBay condition string ─────────────────────
function buildConditionLabel(
    condition: string,
    subCondition: string | null
): string {
    if (condition === 'new') return 'New'
    if (condition === 'for_parts') return 'For parts or not working'
    // used
    switch (subCondition) {
        case 'excellent': return 'Used – Like New'
        case 'good': return 'Used – Good'
        case 'fair': return 'Used – Acceptable'
        case 'poor': return 'Used – Acceptable'
        default: return 'Used'
    }
}

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

// ── Get authenticated user from cookies ──────────────────────────────────────
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

// ── VeRO brand check ─────────────────────────────────────────────────────────
async function checkVeRO(brand: string | null): Promise<{
    status: 'clear' | 'warning' | 'flagged'
    reason: string | null
    vero_brand: string | null
}> {
    const empty = { status: 'clear' as const, reason: null, vero_brand: null }
    if (!brand || brand.trim().length < 2) return empty
    try {
        const { data } = await supabaseAdmin
            .from('vero_brands')
            .select('brand_name, risk_level')
            .ilike('brand_name', brand.trim())
            .limit(1)
            .maybeSingle()
        if (!data) return empty
        const level = (data.risk_level ?? 'medium').toLowerCase()
        return {
            status: level === 'high' ? 'flagged' : 'warning',
            reason: `${data.brand_name} is a VeRO rights owner — verify you are authorised to sell this brand on eBay`,
            vero_brand: data.brand_name,
        }
    } catch { return empty }
}

// ── Save to listing_drafts ────────────────────────────────────────────────────
async function saveDraft(
    userId: string,
    listing: {
        title_raw: string
        title_ebay: string
        cassini_score: number
        description_html: string
        category_label: string
        condition: string
        ean: string | null
        item_specifics: Record<string, string>
        price_suggested: number | null
        brand: string | null
        vero_status: 'clear' | 'warning' | 'flagged'
        vero_brand: string | null
    }
): Promise<string | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('listing_drafts')
            .insert({
                user_id: userId,
                product_name: listing.title_raw,
                title: listing.title_ebay,
                title_score: listing.cassini_score,
                description_html: listing.description_html,
                category: listing.category_label ?? null,
                condition: listing.condition,
                ean: listing.ean ?? '',
                item_specifics: listing.item_specifics,
                sell_price: listing.price_suggested,
                buy_price: null,
                supplier_price: null,
                markup_percentage: null,
                net_profit: null,
                margin: null,
                seller_type: 'own_stock',
                source_platform: 'image_import',
                supplier_url: null,
                supplier_images: [],
                photos: [],
                main_photo_url: null,
                photo_count: 0,
                vero_status: listing.vero_status,
                vero_brands_found: listing.vero_brand ? [listing.vero_brand] : [],
                status: 'draft',
                current_step: 1,
            })
            .select('id')
            .single()

        if (error || !data) {
            console.warn('[image-import] Failed to save draft:', error?.message)
            return null
        }
        return data.id as string
    } catch (err) {
        console.warn('[image-import] saveDraft threw:', err)
        return null
    }
}

// ── Parse JSON from AI response text ─────────────────────────────────────────
function parseJson<T>(text: string): T | null {
    try {
        const clean = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim()
        return JSON.parse(clean) as T
    } catch { return null }
}

// ── Vision AI — product photos prompt ────────────────────────────────────────
function buildProductPrompt(conditionLabel: string, hint: string | null): string {
    return `You are an expert eBay listing copywriter for Riazify, a UK eBay seller tool.
Analyse these product photos and generate a complete eBay listing optimised for UK buyers.

SELLER PROVIDED:
- Item condition: ${conditionLabel}
- Product hint: ${hint || 'None — identify from photos only'}

OUTPUT RULES — follow strictly:
1. title_raw: What you believe the item is (plain English, one sentence, max 15 words).
2. title_ebay: Max 80 chars. Natural language. Include brand (if visible), key feature, model. No ALL CAPS. No excessive pipes.
3. cassini_score: 0–100 realistic eBay Cassini quality score for your title.
4. description_html: eBay-safe HTML only. Tags allowed: <p><ul><li><strong><table><tr><td>. NO div, style, script, external links. Include: 1 intro paragraph, feature bullet list, condition statement. Max 300 words.
5. price_suggested: Realistic UK eBay selling price in GBP (£). Format: XX.99. Research typical eBay sold prices for this item.
6. category_label: Best eBay category path (e.g. "Cameras & Photography > Digital Cameras").
7. item_specifics: 4–8 key product specs as flat key-value pairs. Always include "Brand" and "Condition".
8. brand: Visible brand name as a string, or null if unbranded/unidentifiable.

Return ONLY valid JSON — no explanation, no markdown fences:
{
  "title_raw": "...",
  "title_ebay": "...",
  "cassini_score": 85,
  "description_html": "<p>...</p><ul><li>...</li></ul>",
  "price_suggested": 24.99,
  "category_label": "...",
  "item_specifics": { "Brand": "...", "Condition": "${conditionLabel}" },
  "brand": "..." | null
}`
}

// ── Vision AI — label/barcode photo prompt ────────────────────────────────────
const LABEL_PROMPT = `Look closely at this product label or packaging photo.
Extract the following information if visible:
1. EAN or barcode number — a 13-digit number (or 12-digit UPC). Return only digits, no spaces or hyphens.
2. Brand name — the manufacturer or brand printed on the label.
3. Model number or product name — the specific model/SKU/part number.

Return ONLY valid JSON — no explanation:
{ "ean": "1234567890123" | null, "brand": "BrandName" | null, "model_number": "Model123" | null }`

// ── Gemini 1.5 Flash vision call ──────────────────────────────────────────────
async function analyseWithGemini(
    productImages: EncodedImage[],
    prompt: string,
    geminiKey: string
): Promise<VisionResult | null> {
    try {
        const timeout = new Promise<null>(resolve => setTimeout(() => resolve(null), 15_000))

        // Build parts: images first, then the text prompt
        const parts: unknown[] = productImages.map(img => ({
            inlineData: { mimeType: img.type, data: img.data },
        }))
        parts.push({ text: prompt })

        const req = fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts }],
                    generationConfig: { maxOutputTokens: 2000, temperature: 0.3 },
                }),
            }
        ).catch(() => null)

        const res = await Promise.race([req, timeout])
        if (!res || !res.ok) return null

        const data = await res.json() as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
        }
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
        if (!text) return null

        const parsed = parseJson<VisionResult>(text)
        if (parsed) await trackUsage('gemini')
        return parsed
    } catch (err) {
        console.warn('[image-import] Gemini vision failed:', err)
        return null
    }
}

// ── Anthropic Claude Haiku vision call ───────────────────────────────────────
async function analyseWithAnthropic(
    productImages: EncodedImage[],
    prompt: string,
    anthropicKey: string
): Promise<VisionResult | null> {
    try {
        const timeout = new Promise<null>(resolve => setTimeout(() => resolve(null), 15_000))

        // Build content: images first, then text
        const content: unknown[] = productImages.map(img => ({
            type: 'image',
            source: { type: 'base64', media_type: img.type, data: img.data },
        }))
        content.push({ type: 'text', text: prompt })

        const req = fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5',
                max_tokens: 2000,
                messages: [{ role: 'user', content }],
            }),
        }).catch(() => null)

        const res = await Promise.race([req, timeout])
        if (!res || !res.ok) return null

        const data = await res.json() as { content?: Array<{ text?: string }> }
        const text = data.content?.[0]?.text?.trim() ?? ''
        if (!text) return null

        const parsed = parseJson<VisionResult>(text)
        if (parsed) await trackUsage('anthropic')
        return parsed
    } catch (err) {
        console.warn('[image-import] Anthropic vision failed:', err)
        return null
    }
}

// ── Label data extraction (Gemini preferred, Anthropic fallback) ──────────────
async function extractLabelData(
    labelImage: EncodedImage,
    geminiKey: string | null,
    anthropicKey: string | null
): Promise<LabelResult> {
    const empty: LabelResult = { ean: null, brand: null, model_number: null }

    async function tryGemini(): Promise<LabelResult | null> {
        if (!geminiKey) return null
        try {
            const timeout = new Promise<null>(resolve => setTimeout(() => resolve(null), 10_000))
            const req = fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { inlineData: { mimeType: labelImage.type, data: labelImage.data } },
                                { text: LABEL_PROMPT },
                            ],
                        }],
                        generationConfig: { maxOutputTokens: 200, temperature: 0.1 },
                    }),
                }
            ).catch(() => null)
            const res = await Promise.race([req, timeout])
            if (!res || !res.ok) return null
            const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
            return parseJson<LabelResult>(text)
        } catch { return null }
    }

    async function tryAnthropic(): Promise<LabelResult | null> {
        if (!anthropicKey) return null
        try {
            const timeout = new Promise<null>(resolve => setTimeout(() => resolve(null), 10_000))
            const req = fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': anthropicKey,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: 'claude-haiku-4-5',
                    max_tokens: 200,
                    messages: [{
                        role: 'user',
                        content: [
                            { type: 'image', source: { type: 'base64', media_type: labelImage.type, data: labelImage.data } },
                            { type: 'text', text: LABEL_PROMPT },
                        ],
                    }],
                }),
            }).catch(() => null)
            const res = await Promise.race([req, timeout])
            if (!res || !res.ok) return null
            const data = await res.json() as { content?: Array<{ text?: string }> }
            const text = data.content?.[0]?.text?.trim() ?? ''
            return parseJson<LabelResult>(text)
        } catch { return null }
    }

    try {
        const [g, a] = await Promise.all([tryGemini(), tryAnthropic()])
        return g ?? a ?? empty
    } catch { return empty }
}

// ── Main POST handler ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    const userId = await getAuthUserId()

    // ── Parse body ──────────────────────────────────────────────────────────────
    const body = await req.json().catch(() => ({})) as {
        images?: EncodedImage[]
        labelImageIndex?: number | null
        condition?: string
        subCondition?: string | null
        hint?: string | null
    }

    const { images, labelImageIndex, condition, subCondition, hint } = body

    if (!images || images.length === 0 || !condition) {
        return NextResponse.json(
            { success: false, error_code: 'invalid_request', error_message: 'images and condition are required' },
            { status: 400 }
        )
    }

    // ── Separate product photos from label photo ────────────────────────────────
    const productImages = images.filter(img => !img.isLabel)
    const labelImage = images.find(img => img.isLabel) ?? null

    if (productImages.length === 0) {
        return NextResponse.json(
            { success: false, error_code: 'no_product_images', error_message: 'At least one product photo is required' },
            { status: 400 }
        )
    }

    const conditionLabel = buildConditionLabel(condition, subCondition ?? null)

    // ── Task list ───────────────────────────────────────────────────────────────
    const tasks: ProcessingTask[] = [
        { id: 'upload', label: 'Preparing and uploading photos', status: 'pending' },
        { id: 'analyse', label: 'AI analysing product images', status: 'pending' },
        { id: 'identify', label: 'Identifying item and extracting details', status: 'pending' },
        { id: 'title', label: 'Writing eBay-optimised title', status: 'pending' },
        { id: 'describe', label: 'Generating listing description', status: 'pending' },
        { id: 'pricing', label: 'Suggesting price range', status: 'pending' },
        { id: 'vero', label: 'VeRO brand check', status: 'pending' },
    ]
    function set(id: string, status: ProcessingTaskStatus, detail?: string) {
        const t = tasks.find(t => t.id === id)
        if (t) { t.status = status; if (detail) t.detail = detail }
    }

    // ── Step 1: Upload (already done client-side — just mark it) ───────────────
    set('upload', 'done', `${images.length} photo${images.length > 1 ? 's' : ''} received`)

    // ── Step 2: Vision AI — product photos + label extraction in parallel ───────
    set('analyse', 'running')

    const [geminiKey, anthropicKey] = await Promise.all([
        getKey('gemini'),
        getKey('anthropic'),
    ])

    const productPrompt = buildProductPrompt(conditionLabel, hint ?? null)

    // Run product vision + label extraction concurrently
    const [geminiResult, anthropicResult, labelData] = await Promise.all([
        geminiKey ? analyseWithGemini(productImages, productPrompt, geminiKey) : Promise.resolve(null),
        anthropicKey ? analyseWithAnthropic(productImages, productPrompt, anthropicKey) : Promise.resolve(null),
        labelImage ? extractLabelData(labelImage, geminiKey, anthropicKey) : Promise.resolve<LabelResult>({ ean: null, brand: null, model_number: null }),
    ])

    // Take whichever vision model responded; prefer Gemini
    const vision = geminiResult ?? anthropicResult
    const hasAi = !!vision

    set('analyse', 'done', hasAi ? 'Vision AI complete' : 'AI unavailable — using defaults')

    // ── Step 3: Identify ────────────────────────────────────────────────────────
    set('identify', 'running')

    // Merge label brand into vision result if vision didn't find one
    const brandFromLabel = labelData.brand
    const finalBrand = vision?.brand ?? brandFromLabel ?? null
    const finalEan = labelData.ean ?? null

    // Merge model number into item_specifics if found
    const baseSpecifics: Record<string, string> = {
        Brand: finalBrand ?? 'Unbranded',
        Condition: conditionLabel,
        ...(vision?.item_specifics ?? {}),
    }
    if (labelData.model_number) {
        baseSpecifics['Model'] = labelData.model_number
    }
    if (finalEan) {
        baseSpecifics['EAN'] = finalEan
    }

    set('identify', 'done', hasAi ? 'Item recognised' : 'Item details estimated')

    // ── Step 4: Title ───────────────────────────────────────────────────────────
    set('title', 'running')
    const titleRaw = vision?.title_raw ?? (hint ?? 'Unknown product')
    const titleEbay = vision?.title_ebay ?? (hint ? hint.slice(0, 80) : 'Product listing')
    const cassini = vision?.cassini_score ?? 60
    set('title', 'done', hasAi ? `Cassini score: ${cassini}` : 'Default title used')

    // ── Step 5: Description ─────────────────────────────────────────────────────
    set('describe', 'running')
    const descHtml = vision?.description_html
        ?? `<p>${conditionLabel} item${hint ? ` — ${hint}` : ''}. Please see photos for full details.</p>`
    set('describe', 'done', hasAi ? 'Description generated' : 'Default description used')

    // ── Step 6: Pricing ─────────────────────────────────────────────────────────
    set('pricing', 'running')
    const priceSuggested = vision?.price_suggested ?? null
    set('pricing', 'done', priceSuggested ? `£${priceSuggested.toFixed(2)} suggested` : 'Set price in wizard')

    // ── Step 7: VeRO ────────────────────────────────────────────────────────────
    set('vero', 'running')
    const vero = await checkVeRO(finalBrand)
    set(
        'vero',
        vero.status === 'flagged' ? 'failed' : 'done',
        vero.status === 'clear'
            ? 'No VeRO issues found'
            : `⚠ ${vero.vero_brand} — verify before listing`
    )

    // ── Mark any remaining tasks done ───────────────────────────────────────────
    for (const t of tasks) {
        if (t.status === 'pending' || t.status === 'running') t.status = 'done'
    }

    // ── Build listing object ─────────────────────────────────────────────────────
    const listing = {
        title_raw: titleRaw,
        title_ebay: titleEbay,
        cassini_score: cassini,
        images: [] as string[],  // no hosted URLs yet — seller uploads in wizard
        price_suggested: priceSuggested,
        price_currency: 'GBP',
        description_html: descHtml,
        brand: finalBrand,
        ean: finalEan,
        condition: conditionLabel,
        category_label: vision?.category_label ?? 'General',
        category_ebay_id: null as string | null,
        item_specifics: baseSpecifics,
        vero_status: vero.status,
        vero_reason: vero.reason,
        vero_brand: vero.vero_brand,
        imported_at: new Date().toISOString(),
    }

    // ── Save draft ──────────────────────────────────────────────────────────────
    let draftId: string | null = null
    if (userId) {
        draftId = await saveDraft(userId, listing)
    }

    return NextResponse.json({
        success: true,
        draft_id: draftId,
        tasks,
        listing,
    })
}
