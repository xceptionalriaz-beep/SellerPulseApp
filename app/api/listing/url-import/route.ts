// app/api/listing/url-import/route.ts
// ─────────────────────────────────────────────────────────────
// Riazify — URL → Listing Import API
//
// Accepts: POST { url: string, platform: ImportPlatform }
// Returns: UrlImportResult with 7 task statuses + full listing data
//
// Scraping priority per platform:
//   1. Apify (universal — works for ALL platforms when key is set)
//   2. Platform-specific official API (AliExpress affiliate, Amazon PAAPI…)
//   3. AI-powered simulation fallback (always works, no keys needed)
//
// AI transform priority: Gemini → Anthropic → raw data passthrough
// Keys read from api_fleet_config table (Admin → API Vault)
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type {
    ImportPlatform,
    UrlImportResult,
    ImportedListingData,
    RawProductData,
    ProcessingTask,
    ProcessingTaskStatus,
    PlatformDetection,
    ImportedImage,
} from '@/app/dashboard/listing-generator/types/url-import.types'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── AI output shape (what we ask the AI to return) ────────────────────────────
interface AiTransformResult {
    title_ebay: string
    cassini_score: number
    description_html: string
    price_suggested: number | null
    markup_pct: number
    category_label: string
    item_specifics: Record<string, string>
}

// ── Platform display metadata ──────────────────────────────────────────────────
const PLATFORM_META: Record<string, { displayName: string; logoKey: string; currency: 'GBP' | 'USD' }> = {
    amazon_uk: { displayName: 'Amazon', logoKey: 'amazon', currency: 'GBP' },
    amazon_us: { displayName: 'Amazon', logoKey: 'amazon', currency: 'USD' },
    aliexpress: { displayName: 'AliExpress', logoKey: 'aliexpress', currency: 'USD' },
    aliexpress_wholesale: { displayName: 'AliExpress', logoKey: 'aliexpress', currency: 'USD' },
    argos: { displayName: 'Argos', logoKey: 'argos', currency: 'GBP' },
    wayfair_uk: { displayName: 'Wayfair', logoKey: 'wayfair', currency: 'GBP' },
    bq: { displayName: 'B&Q', logoKey: 'bq', currency: 'GBP' },
    ebay: { displayName: 'eBay', logoKey: 'ebay', currency: 'GBP' },
    banggood: { displayName: 'Banggood', logoKey: 'banggood', currency: 'USD' },
    alibaba: { displayName: 'Alibaba', logoKey: 'alibaba', currency: 'USD' },
    temu: { displayName: 'Temu', logoKey: 'temu', currency: 'USD' },
    dhgate: { displayName: 'DHgate', logoKey: 'dhgate', currency: 'USD' },
    walmart: { displayName: 'Walmart', logoKey: 'walmart', currency: 'USD' },
    costco: { displayName: 'Costco', logoKey: 'costco', currency: 'GBP' },
    cj_dropshipping: { displayName: 'CJ Drop', logoKey: 'cj', currency: 'USD' },
    manomano: { displayName: 'ManoMano', logoKey: 'manomano', currency: 'GBP' },
}

// ── Apify actor IDs per platform ──────────────────────────────────────────────
// Dedicated actors give cleaner data. Generic cheerio-scraper is the fallback.
const APIFY_ACTORS: Record<string, { actorId: string; buildInput: (url: string) => object }> = {
    aliexpress: {
        actorId: 'bebity~aliexpress-product-details-scraper',
        buildInput: (url) => ({ startUrls: [{ url }], maxItems: 1 }),
    },
    aliexpress_wholesale: {
        actorId: 'bebity~aliexpress-product-details-scraper',
        buildInput: (url) => ({ startUrls: [{ url }], maxItems: 1 }),
    },
    amazon_uk: {
        actorId: 'junglee~amazon-crawler',
        buildInput: (url) => ({ startUrls: [{ url }], maxItems: 1, country: 'GB' }),
    },
    amazon_us: {
        actorId: 'junglee~amazon-crawler',
        buildInput: (url) => ({ startUrls: [{ url }], maxItems: 1, country: 'US' }),
    },
}

// Platform-specific CSS selectors for cheerio-scraper fallback
const PLATFORM_SELECTORS: Record<string, {
    title: string
    price: string
    images: string
    description: string
    brand?: string
}> = {
    argos: {
        title: '[data-test="product-title"] h1, h1.PDPTitle, h1',
        price: '[data-test="product-price"] strong, .price--color, [class*="Price"]',
        images: '.GalleryThumbnails img, .pdp-image img, [class*="Gallery"] img',
        description: '[data-test="product-description"], .pdp-description, [class*="Description"]',
        brand: '.pdp-brand-name, [class*="Brand"]',
    },
    wayfair_uk: {
        title: '[data-hb-id="ProductDetailInfoBlock-title"] h1, h1',
        price: '[data-testid="price-label"] .Value, .BasePriceBlock, [class*="Price"]',
        images: '.MediaGalleryThumbnails img, [class*="MediaGallery"] img',
        description: '#description .ExpandableContent, [class*="Description"]',
    },
    bq: {
        title: 'h1.productTitle, [data-component="product-title"], h1',
        price: '.product-price .price, [data-component="product-price"], [class*="price"]',
        images: '.productImages img, .productGallery img, [class*="Image"] img',
        description: '.productDescription, [data-component="description"], [class*="description"]',
        brand: '.productBrand, [class*="brand"]',
    },
    ebay: {
        title: '#itemTitle span, h1.it-ttl, [class*="x-item-title"] h1',
        price: '#prcIsum, .x-price-primary span, [class*="x-price"]',
        images: '#icImg, .ux-image-carousel img, [class*="ux-image"] img',
        description: '[class*="x-item-description"] iframe, #viTabs_0_is',
        brand: '[class*="x-item-specifics"] td',
    },
    banggood: {
        title: '.product-name h1, #product_name, h1',
        price: '.main-price span, .flash-price, [class*="price"]',
        images: '.image-main img, .thumb-list img, [class*="product-img"] img',
        description: '#product_description, [class*="product-desc"]',
        brand: '.brand-name, [class*="brand"]',
    },
    temu: {
        title: '[class*="GoodsInfo_title"], [class*="goods-title"], h1',
        price: '[class*="Price_price"], [class*="goods-price"]',
        images: '[class*="Gallery_img"] img, [class*="goods-gallery"] img',
        description: '[class*="GoodsDetail_detail"], [class*="goods-detail"]',
    },
    dhgate: {
        title: '.product-name span, h1.product-title, h1',
        price: '.price-b .present-price, .current-price, [class*="price"]',
        images: '.main-img img, .gallery img, [class*="product-img"] img',
        description: '#productDescription, [class*="product-desc"]',
        brand: '.brand-name',
    },
    walmart: {
        title: '[itemprop="name"], h1.prod-ProductTitle, h1',
        price: '[itemprop="price"], .price-characteristic, [class*="price"]',
        images: '.hover-zoom-hero-image, [class*="ProductImage"] img',
        description: '[data-testid="product-description"], [class*="description"]',
        brand: '[itemprop="brand"]',
    },
    costco: {
        title: '#product-title h1, .product-title, h1',
        price: '.your-price .value, .money-price, [class*="price"]',
        images: '.gallery img, .product-image img, [class*="ProductImage"] img',
        description: '#product-details-tab .content, [class*="product-details"]',
        brand: '.brand',
    },
}

// ── Read API key from vault ────────────────────────────────────────────────────
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

async function getKeys(platformName: string): Promise<[string | null, string | null]> {
    try {
        const { data } = await supabaseAdmin
            .from('api_fleet_config')
            .select('primary_key_1, primary_key_2, status')
            .eq('platform_name', platformName)
            .single()
        if (!data || data.status === 'disconnected') return [null, null]
        return [
            data.primary_key_1 === 'EMPTY' ? null : data.primary_key_1,
            data.primary_key_2 === 'EMPTY' ? null : data.primary_key_2,
        ]
    } catch { return [null, null] }
}

// ── Track API usage ────────────────────────────────────────────────────────────
async function trackUsage(platformName: string) {
    try {
        await supabaseAdmin
            .from('api_fleet_config')
            .update({ last_used_at: new Date().toISOString() })
            .eq('platform_name', platformName)
    } catch { /* non-fatal */ }
}

// ── VeRO brand check against DB ───────────────────────────────────────────────
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
            .select('brand_name, risk_level, keywords')
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

// ── Apify universal scraper ────────────────────────────────────────────────────
async function scrapeWithApify(
    url: string,
    platform: ImportPlatform,
    token: string
): Promise<RawProductData | null> {
    // ── Try dedicated actor first ──────────────────────────────────────────────
    const dedicated = APIFY_ACTORS[platform]
    if (dedicated) {
        try {
            const res = await fetch(
                `https://api.apify.com/v2/acts/${dedicated.actorId}/run-sync-get-dataset-items?token=${token}&timeout=60`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dedicated.buildInput(url)),
                    signal: AbortSignal.timeout(65_000),
                }
            )
            if (res.ok) {
                const items = await res.json() as unknown[]
                if (Array.isArray(items) && items.length > 0) {
                    const normalized = normalizeApifyResponse(items[0] as Record<string, unknown>, platform)
                    if (normalized.title_raw) return normalized
                }
            }
        } catch (err) {
            console.warn('[url-import] Dedicated Apify actor failed:', err)
        }
    }

    // ── Fallback: cheerio-scraper with platform-specific selectors ─────────────
    const selKey = platform.replace('_uk', '').replace('_us', '') as keyof typeof PLATFORM_SELECTORS
    const selectors = PLATFORM_SELECTORS[selKey] ?? PLATFORM_SELECTORS[platform]
    if (!selectors) return null

    try {
        const pageFunction = buildCheerioPageFunction(selectors)
        const res = await fetch(
            `https://api.apify.com/v2/acts/apify~cheerio-scraper/run-sync-get-dataset-items?token=${token}&timeout=60`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startUrls: [{ url }],
                    pageFunction,
                    maxPagesPerCrawl: 1,
                }),
                signal: AbortSignal.timeout(65_000),
            }
        )
        if (!res.ok) return null
        const items = await res.json() as unknown[]
        if (Array.isArray(items) && items.length > 0) {
            return normalizeApifyResponse(items[0] as Record<string, unknown>, platform)
        }
    } catch (err) {
        console.warn('[url-import] Cheerio scraper failed:', err)
    }

    return null
}

// Build the cheerio-scraper pageFunction string from selector config
function buildCheerioPageFunction(
    sel: { title: string; price: string; images: string; description: string; brand?: string }
): string {
    const brandLine = sel.brand
        ? `const brand = $('${sel.brand}').first().text().trim() || null`
        : `const brand = null`

    return `async function pageFunction(context) {
  const { $ } = context
  const title = $('${sel.title}').first().text().trim()
  const priceRaw = $('${sel.price}').first().text().trim()
  const price = parseFloat(priceRaw.replace(/[^0-9.]/g, '')) || null
  const images = []
  $('${sel.images}').each(function(i, el) {
    if (i >= 12) return false
    const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy')
    if (src && src.startsWith('http') && !src.includes('placeholder') && !src.includes('blank.gif')) {
      images.push(src)
    }
  })
  const description = $('${sel.description}').first().text().trim().slice(0, 2000)
  ${brandLine}
  return { title, price, images, description, brand }
}`
}

// Normalize an Apify response item → our RawProductData shape
function normalizeApifyResponse(
    item: Record<string, unknown>,
    platform: ImportPlatform
): RawProductData {
    const str = (k: string) => (typeof item[k] === 'string' ? item[k] as string : '')
    const arr = (k: string) => (Array.isArray(item[k]) ? item[k] as string[] : [])
    const meta = PLATFORM_META[platform]

    // Handle both flat and nested price formats
    let price: number | null = null
    if (typeof item.price === 'number') {
        price = item.price
    } else if (typeof item.price === 'string') {
        price = parseFloat((item.price as string).replace(/[^0-9.]/g, '')) || null
    } else if (item.price && typeof item.price === 'object') {
        const p = item.price as Record<string, unknown>
        price = parseFloat(String(p.value ?? p.amount ?? p.min ?? 0)) || null
    } else if (typeof item.salePrice === 'number') {
        price = item.salePrice
    }

    // Images can be array of strings or array of objects with `url` field
    let images = arr('images')
    if (images.length === 0) images = arr('imageUrls')
    if (images.length === 0 && Array.isArray(item.images)) {
        images = (item.images as unknown[])
            .map(i => (typeof i === 'string' ? i : (i as Record<string, string>)?.url ?? ''))
            .filter(Boolean)
    }

    return {
        title_raw: str('title') || str('name') || str('productName') || '',
        description_raw: str('description') || str('productDescription') || str('shortDescription') || '',
        price_raw: price,
        currency_raw: str('currency') || meta?.currency || 'USD',
        images_raw: images.slice(0, 12),
        brand_raw: str('brand') || str('brandName') || null,
        ean_raw: str('ean') || str('gtin') || str('upc') || null,
        asin_raw: str('asin') || null,
        category_raw: str('category') || str('breadcrumbs') || str('categoryPath') || null,
        condition_raw: 'New',
        item_specifics_raw: {},
        stock_status: 'in_stock',
    }
}

// ── AI listing transformation ──────────────────────────────────────────────────
async function transformWithAI(
    raw: RawProductData,
    platform: ImportPlatform,
    geminiKey: string | null,
    anthropicKey: string | null
): Promise<AiTransformResult | null> {

    const currencySymbol = (raw.currency_raw === 'GBP' || raw.currency_raw === 'USD')
        ? (raw.currency_raw === 'GBP' ? '£' : '$')
        : raw.currency_raw

    const prompt = `You are an expert eBay listing copywriter for Riazify, an eBay seller tool.
Transform this raw supplier product data into an optimised eBay listing ready to publish.

RAW PRODUCT DATA:
- Title:       ${raw.title_raw || 'Unknown product'}
- Price:       ${raw.price_raw ? `${currencySymbol}${raw.price_raw}` : 'Not found'}
- Brand:       ${raw.brand_raw ?? 'Unknown'}
- Category:    ${raw.category_raw ?? 'Unknown'}
- Description: ${raw.description_raw.slice(0, 600) || 'No description'}
- Platform:    ${platform}

OUTPUT RULES — follow strictly:
1. title_ebay: Max 80 chars. Natural language. Include key feature, brand (if present), condition hint. No excessive |. No ALL CAPS spam.
2. cassini_score: 0-100 realistic eBay Cassini quality score for your title.
3. description_html: eBay-safe HTML only. Use <p><ul><li><strong><table><tr><td>. NO div, NO style tags, NO scripts, NO external links. Include: 1 intro paragraph, feature bullet list, condition statement. Max 400 words.
4. price_suggested: Supplier price × 1.4 markup, rounded to .X9 format (e.g. 24.99). If price unknown, suggest 19.99.
5. markup_pct: Always 40.
6. category_label: Best eBay category path (e.g. "Home & Garden > Kitchen, Dining & Bar > Cookware").
7. item_specifics: 3-8 key product specs as flat key-value pairs. Always include "Condition": "New" and "Brand": brand or "Unbranded".

Return ONLY valid JSON — no explanation, no markdown fences:
{
  "title_ebay": "...",
  "cassini_score": 82,
  "description_html": "<p>...</p><ul><li>...</li></ul>",
  "price_suggested": 19.99,
  "markup_pct": 40,
  "category_label": "...",
  "item_specifics": { "Brand": "...", "Condition": "New" }
}`

    // ── Try Gemini first (connected) ───────────────────────────────────────────
    if (geminiKey) {
        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { maxOutputTokens: 2000, temperature: 0.3 },
                    }),
                    signal: AbortSignal.timeout(20_000),
                }
            )
            if (res.ok) {
                const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
                if (text) {
                    const clean = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim()
                    const parsed = JSON.parse(clean) as AiTransformResult
                    await trackUsage('gemini')
                    return parsed
                }
            }
        } catch (err) {
            console.warn('[url-import] Gemini AI transform failed:', err)
        }
    }

    // ── Fallback to Anthropic ──────────────────────────────────────────────────
    if (anthropicKey) {
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
                    max_tokens: 2000,
                    messages: [{ role: 'user', content: prompt }],
                }),
                signal: AbortSignal.timeout(20_000),
            })
            if (res.ok) {
                const data = await res.json() as { content?: Array<{ text?: string }> }
                const text = data.content?.[0]?.text?.trim() ?? ''
                if (text) {
                    const clean = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim()
                    const parsed = JSON.parse(clean) as AiTransformResult
                    await trackUsage('anthropic')
                    return parsed
                }
            }
        } catch (err) {
            console.warn('[url-import] Anthropic AI transform failed:', err)
        }
    }

    return null
}

// ── Margin calculation ─────────────────────────────────────────────────────────
// eBay fee: ~12.75% + £0.30 final value fee
function calcMargin(supplierPrice: number | null, currency: string, markupPct: number) {
    if (!supplierPrice) return { price_suggested: null, margin_gbp: null, margin_pct: null }

    const GBP_RATES: Record<string, number> = { GBP: 1, USD: 0.79, EUR: 0.86, CNY: 0.11 }
    const toGbp = GBP_RATES[currency] ?? 0.79
    const costGbp = supplierPrice * toGbp
    const sellPrice = Math.ceil(costGbp * (1 + markupPct / 100) * 100 - 1) / 100  // rounds to .99
    const ebayFee = sellPrice * 0.1275 + 0.30
    const margin = sellPrice - costGbp - ebayFee

    return {
        price_suggested: sellPrice,
        margin_gbp: Math.round(margin * 100) / 100,
        margin_pct: Math.round((margin / sellPrice) * 100),
    }
}

// ── Simulation fallback raw data ───────────────────────────────────────────────
// Used when scraping is unavailable (no Apify key). AI still transforms it.
function buildSimulatedRaw(platform: ImportPlatform): RawProductData {
    const meta = PLATFORM_META[platform]
    return {
        title_raw: `Sample Product — imported from ${meta?.displayName ?? platform}`,
        description_raw: `This is a sample product sourced from ${meta?.displayName ?? platform}. High quality, ready to ship.`,
        price_raw: 14.99,
        currency_raw: meta?.currency ?? 'USD',
        images_raw: [],
        brand_raw: null,
        ean_raw: null,
        asin_raw: null,
        category_raw: 'General',
        condition_raw: 'New',
        item_specifics_raw: {},
        stock_status: 'in_stock',
    }
}

// ── Main POST handler ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
    // ── Parse & validate ───────────────────────────────────────────────────────
    const body = await req.json().catch(() => ({})) as { url?: string; platform?: string }
    const { url, platform: platformKey } = body

    if (!url || !platformKey) {
        return NextResponse.json(
            { success: false, error_code: 'invalid_url', error_message: 'url and platform are required' },
            { status: 400 }
        )
    }

    try { new URL(url) } catch {
        return NextResponse.json(
            { success: false, error_code: 'invalid_url', error_message: 'Not a valid URL' },
            { status: 400 }
        )
    }

    const platform = platformKey as ImportPlatform
    const platformInfo = PLATFORM_META[platform]

    const platformDetection: PlatformDetection = {
        platform,
        displayName: platformInfo?.displayName ?? platformKey,
        logoKey: platformInfo?.logoKey ?? 'unknown',
        confidence: 'high',
        supported: true,
        requiresLogin: false,
    }

    // ── Initialise task list ───────────────────────────────────────────────────
    const tasks: ProcessingTask[] = [
        { id: 'fetch', label: 'Reading product page', status: 'pending' },
        { id: 'images', label: 'Extracting images', status: 'pending' },
        { id: 'title', label: 'Writing your eBay title', status: 'pending' },
        { id: 'description', label: 'Generating description', status: 'pending' },
        { id: 'pricing', label: 'Calculating your margin', status: 'pending' },
        { id: 'vero', label: 'Running VeRO check', status: 'pending' },
        { id: 'category', label: 'Mapping eBay category', status: 'pending' },
    ]
    function set(id: string, status: ProcessingTaskStatus, detail?: string) {
        const t = tasks.find(t => t.id === id)
        if (t) { t.status = status; if (detail) t.detail = detail }
    }

    // ── Step 1: Scrape product ─────────────────────────────────────────────────
    set('fetch', 'running')
    let raw: RawProductData | null = null
    let dataSource = 'simulation'

    const apifyToken = await getKey('apify')
    if (apifyToken) {
        raw = await scrapeWithApify(url, platform, apifyToken)
        if (raw?.title_raw) {
            dataSource = 'apify'
            await trackUsage('apify')
        } else {
            raw = null
        }
    }

    // Simulation fallback
    if (!raw) {
        raw = buildSimulatedRaw(platform)
    }

    set('fetch', 'done', dataSource === 'apify' ? 'Product page loaded' : 'Demo data used')

    // ── Step 2: Images ─────────────────────────────────────────────────────────
    set('images', 'running')
    const imgCount = raw.images_raw.length
    set('images', 'done', imgCount > 0 ? `Found ${imgCount} image${imgCount !== 1 ? 's' : ''}` : 'No images (will need manual upload)')

    // ── Steps 3, 4, 7: AI transformation (runs in parallel concern, serial here) ─
    set('title', 'running')
    set('description', 'running')
    set('category', 'running')

    const [geminiKey, anthropicKey] = await Promise.all([
        getKey('gemini'),
        getKey('anthropic'),
    ])
    const ai = await transformWithAI(raw, platform, geminiKey, anthropicKey)

    const titleEbay = ai?.title_ebay ?? raw.title_raw.slice(0, 80)
    const cassiniScore = ai?.cassini_score ?? 60
    const descHtml = ai?.description_html ?? `<p>${raw.description_raw.slice(0, 800) || 'No description available.'}</p>`
    const categoryLabel = ai?.category_label ?? raw.category_raw ?? 'General'
    const itemSpecifics = ai?.item_specifics ?? { Condition: 'New' }
    const markupPct = ai?.markup_pct ?? 40
    const hasAi = !!ai

    set('title', 'done', hasAi ? `Cassini score: ${cassiniScore}` : 'Raw title used')
    set('description', 'done', hasAi ? 'eBay-safe HTML generated' : 'Description copied')
    set('category', 'done', categoryLabel ? 'Category mapped' : 'Skipped')

    // ── Step 5: Pricing ────────────────────────────────────────────────────────
    set('pricing', 'running')
    const priceSuggested = ai?.price_suggested ?? null
    const pricing = calcMargin(raw.price_raw, raw.currency_raw, markupPct)
    const finalSellPrice = priceSuggested ?? pricing.price_suggested

    const marginLabel = pricing.margin_gbp != null
        ? `£${pricing.margin_gbp.toFixed(2)} est. margin`
        : 'Pricing calculated'
    set('pricing', 'done', marginLabel)

    // ── Step 6: VeRO ──────────────────────────────────────────────────────────
    set('vero', 'running')
    const brandForVero = raw.brand_raw ?? (itemSpecifics['Brand'] !== 'Unbranded' ? itemSpecifics['Brand'] : null) ?? null
    const vero = await checkVeRO(brandForVero)
    set(
        'vero',
        vero.status === 'flagged' ? 'failed' : 'done',
        vero.status === 'clear'
            ? 'No VeRO issues found'
            : `⚠ ${vero.vero_brand} — verify before listing`
    )

    // ── Assemble images ────────────────────────────────────────────────────────
    const images: ImportedImage[] = raw.images_raw.map((src, i) => ({
        id: crypto.randomUUID(),
        source_url: src,
        supabase_url: null,
        width: null,
        height: null,
        is_main: i === 0,
        upload_status: 'pending',
    }))

    // ── Build final listing ────────────────────────────────────────────────────
    const listing: ImportedListingData = {
        title_raw: raw.title_raw,
        title_ebay: titleEbay,
        cassini_score: cassiniScore,
        images,

        price_supplier: raw.price_raw,
        price_suggested: finalSellPrice,
        price_currency: raw.currency_raw === 'GBP' ? 'GBP' : 'USD',
        markup_pct: markupPct,
        margin_gbp: pricing.margin_gbp,
        margin_pct: pricing.margin_pct,

        description_html: descHtml,
        brand: raw.brand_raw,
        ean: raw.ean_raw,
        condition: raw.condition_raw ?? 'New',
        category_label: categoryLabel,
        category_ebay_id: null,
        item_specifics: { ...raw.item_specifics_raw, ...itemSpecifics },
        seller_type: 'dropship',
        source_platform: platform,

        vero_status: vero.status,
        vero_reason: vero.reason,
        vero_brand: vero.vero_brand,

        source_url: url,
        platform,
        imported_at: new Date().toISOString(),
    }

    // ── Mark all remaining pending tasks done ──────────────────────────────────
    for (const t of tasks) {
        if (t.status === 'pending' || t.status === 'running') {
            t.status = 'done'
        }
    }

    const result: UrlImportResult = {
        success: true,
        platform: platformDetection,
        raw,
        listing,
        tasks,
    }

    return NextResponse.json(result)
}
