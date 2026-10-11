// app/api/listing-generator/bulk-generate/route.ts
// ─────────────────────────────────────────────────────────────
// Riazify — Bulk Listing Generator
//
// Called once per CSV row by the BulkUploadModal parent component.
// Each call:
//   1. Authenticates the user via Supabase session cookie
//   2. Resolves product data (barcode lookup OR uses supplied title)
//   3. Generates an eBay-optimised title + HTML description via AI
//   4. Runs a VeRO brand check on the resolved title
//   5. Calculates margin / profit when buy_price + sell_price are supplied
//   6. Saves a listing_drafts row
//   7. Returns { ok, draftId, title, veroStatus, message }
//
// AI priority: Anthropic (Haiku) → Gemini (1.5-flash) → no-AI fallback
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient }              from '@supabase/supabase-js'
import { cookies }                   from 'next/headers'

// ── Admin client (service-role) — for AI keys + draft saves ─────────────────
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── VeRO brand list — mirror of /api/b2b/vero/route.ts ───────────────────────
const VERO_BRANDS = [
    { brand: 'Nike',          keywords: ['nike', 'air max', 'air force', 'jordan', 'swoosh'],       risk: 'high'   },
    { brand: 'Adidas',        keywords: ['adidas', 'yeezy', 'ultraboost', 'three stripes'],          risk: 'high'   },
    { brand: 'Apple',         keywords: ['apple', 'iphone', 'macbook', 'airpods', 'ipad'],           risk: 'high'   },
    { brand: 'Louis Vuitton', keywords: ['louis vuitton', 'lv', 'monogram'],                         risk: 'high'   },
    { brand: 'Gucci',         keywords: ['gucci', 'gg supreme'],                                     risk: 'high'   },
    { brand: 'Disney',        keywords: ['disney', 'mickey mouse', 'marvel', 'star wars', 'pixar'],  risk: 'high'   },
    { brand: 'Rolex',         keywords: ['rolex', 'submariner', 'datejust'],                          risk: 'high'   },
    { brand: 'Supreme',       keywords: ['supreme', 'box logo'],                                     risk: 'medium' },
    { brand: 'The North Face',keywords: ['north face', 'tnf'],                                       risk: 'medium' },
    { brand: 'Sony',          keywords: ['sony', 'playstation', 'ps5', 'ps4'],                       risk: 'medium' },
] as const

// ─────────────────────────────────────────────────────────────
// Helper: fetch AI key from API Vault
// ─────────────────────────────────────────────────────────────
async function getAiKey(platform: string): Promise<string | null> {
    try {
        const { data } = await supabaseAdmin
            .from('api_fleet_config')
            .select('primary_key_1, status')
            .eq('platform_name', platform)
            .single()

        if (!data || data.status === 'disconnected' || !data.primary_key_1 || data.primary_key_1 === 'EMPTY') {
            return null
        }
        return data.primary_key_1 as string
    } catch {
        return null
    }
}

async function trackUsage(platform: string) {
    try {
        await supabaseAdmin
            .from('api_fleet_config')
            .update({ last_used_at: new Date().toISOString() })
            .eq('platform_name', platform)
    } catch { /* non-fatal */ }
}

// ─────────────────────────────────────────────────────────────
// Helper: VeRO check
// ─────────────────────────────────────────────────────────────
interface VeroResult {
    isVero:    boolean
    brand:     string | null
    riskLevel: string
    status:    'safe' | 'caution' | 'avoid'
    message:   string
}

async function checkVero(title: string): Promise<VeroResult> {
    const lc = title.toLowerCase()

    // 1. Hardcoded brands
    for (const entry of VERO_BRANDS) {
        if (entry.keywords.some(k => lc.includes(k))) {
            return {
                isVero:    true,
                brand:     entry.brand,
                riskLevel: entry.risk,
                status:    entry.risk === 'high' ? 'avoid' : 'caution',
                message:   `VeRO warning: "${entry.brand}" is a protected brand`,
            }
        }
    }

    // 2. Dynamic brands from Supabase
    try {
        const { data } = await supabaseAdmin.from('vero_brands').select('brand_name')
        const dbBrands: string[] = (data ?? []).map((b: { brand_name: string }) => b.brand_name?.toLowerCase())
        for (const b of dbBrands) {
            if (b && lc.includes(b)) {
                return {
                    isVero:    true,
                    brand:     b,
                    riskLevel: 'high',
                    status:    'avoid',
                    message:   `VeRO warning: "${b}" is a protected brand`,
                }
            }
        }
    } catch { /* use hardcoded only */ }

    return { isVero: false, brand: null, riskLevel: 'low', status: 'safe', message: '' }
}

// ─────────────────────────────────────────────────────────────
// Helper: barcode lookup via UPCitemdb
// Returns a product title (or null if lookup fails / key missing)
// ─────────────────────────────────────────────────────────────
async function lookupBarcode(barcode: string): Promise<string | null> {
    try {
        const res = await fetch(
            `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(barcode)}`,
            { signal: AbortSignal.timeout(8_000) }
        )
        if (!res.ok) return null
        const data = await res.json()
        const item = data?.items?.[0]
        return item?.title ?? null
    } catch {
        return null
    }
}

// ─────────────────────────────────────────────────────────────
// Helper: build AI generation prompt
// ─────────────────────────────────────────────────────────────
function buildBulkPrompt(title: string, condition: string, categoryHint: string): string {
    const condNote = condition === 'used'
        ? 'Condition is used — mention this naturally once.'
        : condition === 'refurbished'
            ? 'Condition is refurbished — briefly reassure buyers about quality.'
            : ''

    return `You are an expert eBay seller. Given a product title, return a JSON object with exactly these fields:
{
  "title": "<eBay-optimised title, max 80 chars, keyword-rich for Cassini SEO>",
  "description": "<valid HTML description — hook line, 3-5 <ul><li> bullet features, 1 closing trust line. Tags: <p><ul><li><strong>. Under 250 words. No price, no shipping, no inline styles.>"
}

Product: ${title}${categoryHint ? `\nCategory hint: ${categoryHint}` : ''}${condNote ? `\n${condNote}` : ''}

Return ONLY the JSON object, no markdown, no commentary.`
}

// ─────────────────────────────────────────────────────────────
// Helper: call Anthropic
// ─────────────────────────────────────────────────────────────
async function generateWithAnthropic(
    apiKey: string,
    prompt: string
): Promise<{ title: string; description: string } | null> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type':      'application/json',
            'x-api-key':         apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model:      'claude-haiku-4-5-20251001',
            max_tokens: 700,
            messages:   [{ role: 'user', content: prompt }],
        }),
        signal: AbortSignal.timeout(25_000),
    })
    if (!res.ok) throw new Error(`Anthropic ${res.status}`)
    const data = await res.json()
    const text = data.content?.[0]?.text?.trim() || ''
    return parseAiJson(text)
}

// ─────────────────────────────────────────────────────────────
// Helper: call Gemini
// ─────────────────────────────────────────────────────────────
async function generateWithGemini(
    apiKey: string,
    prompt: string
): Promise<{ title: string; description: string } | null> {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents:         [{ parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: 700, temperature: 0.7 },
            }),
            signal: AbortSignal.timeout(25_000),
        }
    )
    if (!res.ok) throw new Error(`Gemini ${res.status}`)
    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
    return parseAiJson(text)
}

// ─────────────────────────────────────────────────────────────
// Helper: parse AI JSON response (handles markdown fences)
// ─────────────────────────────────────────────────────────────
function parseAiJson(text: string): { title: string; description: string } | null {
    try {
        // Strip ```json ... ``` fences if present
        const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
        const obj = JSON.parse(cleaned)
        if (obj?.title && obj?.description) return { title: obj.title, description: obj.description }
    } catch { /* fall through */ }
    return null
}

// ─────────────────────────────────────────────────────────────
// Helper: AI generation with Anthropic → Gemini fallback
// Returns best-effort { title, description } — never throws
// ─────────────────────────────────────────────────────────────
async function generateListing(
    rawTitle: string,
    condition: string,
    categoryHint: string
): Promise<{ title: string; description: string; provider: string }> {
    const prompt = buildBulkPrompt(rawTitle, condition, categoryHint)

    // Try Anthropic
    const anthropicKey = await getAiKey('anthropic') ?? process.env.ANTHROPIC_API_KEY ?? null
    if (anthropicKey) {
        try {
            const result = await generateWithAnthropic(anthropicKey, prompt)
            if (result) {
                await trackUsage('anthropic')
                return { ...result, provider: 'anthropic' }
            }
        } catch (e) {
            console.warn('[bulk-generate] Anthropic failed:', e)
        }
    }

    // Try Gemini
    const geminiKey = await getAiKey('gemini') ?? process.env.GEMINI_API_KEY ?? null
    if (geminiKey) {
        try {
            const result = await generateWithGemini(geminiKey, prompt)
            if (result) {
                await trackUsage('gemini')
                return { ...result, provider: 'gemini' }
            }
        } catch (e) {
            console.warn('[bulk-generate] Gemini failed:', e)
        }
    }

    // No-AI fallback — use raw title + empty description placeholder
    return {
        title:       rawTitle.slice(0, 80),
        description: `<p>${rawTitle}</p>`,
        provider:    'none',
    }
}

// ─────────────────────────────────────────────────────────────
// Helper: calculate margin stats
// ─────────────────────────────────────────────────────────────
interface MarginStats {
    markup_percentage: number | null
    net_profit:        number | null
    margin:            number | null
}

function calcMargin(buyStr?: string, sellStr?: string): MarginStats {
    const buy  = buyStr  ? parseFloat(buyStr)  : NaN
    const sell = sellStr ? parseFloat(sellStr) : NaN

    if (isNaN(buy) || isNaN(sell) || sell <= 0) {
        return { markup_percentage: null, net_profit: null, margin: null }
    }

    const profit   = sell - buy
    const margin   = (profit / sell) * 100
    const markup   = buy > 0 ? (profit / buy) * 100 : null

    return {
        markup_percentage: markup  !== null ? parseFloat(markup.toFixed(2))  : null,
        net_profit:        parseFloat(profit.toFixed(2)),
        margin:            parseFloat(margin.toFixed(2)),
    }
}

// ─────────────────────────────────────────────────────────────
// POST /api/listing-generator/bulk-generate
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {

    // ── 1. Auth — validate user via Supabase session cookie ─────────────────
    const cookieStore = await cookies()
    const supabaseUser = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession:   false,
            },
            global: {
                headers: {
                    cookie: cookieStore.toString(),
                },
            },
        }
    )

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ ok: false, error: 'Unauthorised' }, { status: 401 })
    }

    // ── 2. Parse request body ────────────────────────────────────────────────
    let body: {
        title?:       string
        barcode?:     string
        buy_price?:   string
        sell_price?:  string
        sku?:         string
        condition?:   string
        quantity?:    string
        category_id?: string
        images?:      string
        _rowIndex?:   number
    }

    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
    }

    const { title, barcode, buy_price, sell_price, sku, condition, quantity, category_id, images } = body

    // ── 3. Resolve product title ─────────────────────────────────────────────
    let resolvedTitle = title?.trim() || ''
    let barcodeResolved = false

    if (!resolvedTitle && barcode) {
        // Attempt barcode lookup to get a title
        const lookedUp = await lookupBarcode(barcode.trim())
        if (lookedUp) {
            resolvedTitle   = lookedUp
            barcodeResolved = true
        } else {
            // Barcode lookup failed — use barcode itself as a minimal identifier
            // The AI will still generate something, but quality will be low
            resolvedTitle = `Product ${barcode}`
        }
    }

    if (!resolvedTitle) {
        return NextResponse.json(
            { ok: false, error: 'No title or barcode provided — cannot generate listing' },
            { status: 400 }
        )
    }

    // ── 4. AI generation: eBay title + HTML description ──────────────────────
    const cond         = condition?.toLowerCase() || 'used'
    const categoryHint = category_id || ''
    const { title: ebayTitle, description: descHtml, provider } =
        await generateListing(resolvedTitle, cond, categoryHint)

    // ── 5. VeRO check ─────────────────────────────────────────────────────────
    const vero = await checkVero(ebayTitle)

    // ── 6. Margin calculation ─────────────────────────────────────────────────
    const margins = calcMargin(buy_price, sell_price)

    // ── 7. Parse image list ───────────────────────────────────────────────────
    const imageList: string[] = images
        ? images.split(',').map(u => u.trim()).filter(Boolean)
        : []

    // ── 8. Save listing draft ─────────────────────────────────────────────────
    const { data: draftData, error: draftError } = await supabaseAdmin
        .from('listing_drafts')
        .insert({
            user_id:           user.id,
            product_name:      resolvedTitle,
            title:             ebayTitle,
            title_score:       null,
            health_score:      vero.isVero ? 40 : 70,
            description_html:  descHtml,
            category:          category_id ? String(category_id) : null,
            condition:         cond,
            ean:               barcode?.trim() ?? null,
            item_specifics:    {},
            sell_price:        sell_price ? parseFloat(sell_price) : null,
            buy_price:         buy_price  ? parseFloat(buy_price)  : null,
            supplier_price:    null,
            markup_percentage: margins.markup_percentage,
            net_profit:        margins.net_profit,
            margin:            margins.margin,
            seller_type:       'own_stock',
            source_platform:   'bulk_upload',
            supplier_url:      null,
            supplier_images:   imageList,
            photos:            [],
            main_photo_url:    imageList[0] ?? null,
            photo_count:       0,
            vero_status:       vero.status,
            vero_brands_found: vero.brand ? [vero.brand] : [],
            sku:               sku?.trim() || null,
            quantity:          quantity ? parseInt(quantity, 10) : null,
            status:            'draft',
            current_step:      1,
            notes:             [
                `Generated via Bulk Upload · AI: ${provider}`,
                barcodeResolved ? `Barcode ${barcode} resolved via lookup` : null,
            ].filter(Boolean).join(' · '),
        })
        .select('id')
        .single()

    if (draftError || !draftData) {
        console.error('[bulk-generate] saveDraft failed:', draftError?.message)
        return NextResponse.json(
            { ok: false, error: 'Failed to save listing draft. Please try again.' },
            { status: 500 }
        )
    }

    // ── 9. Build response message ─────────────────────────────────────────────
    let message = `Draft saved · ${provider !== 'none' ? `AI: ${provider}` : 'no AI'}`

    if (vero.isVero) {
        message = vero.message  // VeRO warning overrides generic message
    } else if (provider === 'none') {
        message = 'Draft saved — no AI key configured, description is a placeholder'
    }

    return NextResponse.json({
        ok:         true,
        draftId:    draftData.id,
        title:      ebayTitle,
        veroStatus: vero.status,
        veroFound:  vero.brand,
        message,
    })
}
