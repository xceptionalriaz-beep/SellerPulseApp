// app/dashboard/listing-generator/types/url-import.types.ts
// ─────────────────────────────────────────────────────────────
// Riazify — Listing Studio
// TypeScript types for the URL → Listing import flow.
// Covers: platform detection, extracted product data,
//         AI-transformed listing data, VeRO pre-check results,
//         and step state management across the 5-screen modal.
// ─────────────────────────────────────────────────────────────

// ── Supported Platforms ───────────────────────────────────────

export type ImportPlatform =
    // UK retail (Phase 1)
    | 'amazon_uk'
    | 'aliexpress'
    | 'argos'
    | 'wayfair_uk'
    | 'bq'
    | 'ebay'
    // Global / Phase 2
    | 'amazon_us'
    | 'walmart'
    | 'banggood'
    | 'aliexpress_wholesale'
    | 'alibaba'
    | 'cj_dropshipping'
    | 'costco'
    | 'temu'
    | 'dhgate'
    | 'manomano'
    // Fallback
    | 'unknown'

// ── Modal Step ───────────────────────────────────────────────

export type UrlImportStep =
    | 'input'       // Screen 1: URL paste field
    | 'processing'  // Screen 2: live progress while scraping + AI
    | 'preview'     // Screen 3: review extracted data before creating
    | 'vero_warn'   // VeRO risk screen (shown before preview if risk found)
    | 'failed'      // Fallback screen when scraping fails

// ── Processing Progress ───────────────────────────────────────

export type ProcessingTaskStatus = 'pending' | 'running' | 'done' | 'failed' | 'skipped'

export interface ProcessingTask {
    id: string
    label: string
    status: ProcessingTaskStatus
    detail?: string  // e.g. "Found 8 images" or "Sony — VeRO risk detected"
}

// ── Platform Detection Result ─────────────────────────────────

export interface PlatformDetection {
    platform: ImportPlatform
    displayName: string      // e.g. "Amazon.co.uk"
    logoKey: string          // key for the logo map in UrlImport.tsx
    confidence: 'high' | 'low'
    supported: boolean
    requiresLogin: boolean   // e.g. Costco product pages need login
}

// ── Raw Scraped Product Data ──────────────────────────────────
// What comes back from the scraper before AI processes it

export interface RawProductData {
    title_raw: string
    description_raw: string
    price_raw: number | null
    currency_raw: string              // 'GBP' | 'USD' | etc.
    images_raw: string[]              // original URLs on source site
    brand_raw: string | null
    ean_raw: string | null
    asin_raw: string | null           // Amazon-specific
    category_raw: string | null       // supplier's own category label
    condition_raw: string | null
    item_specifics_raw: Record<string, string>
    stock_status: 'in_stock' | 'out_of_stock' | 'unknown'
}

// ── AI-Transformed Listing Data ───────────────────────────────
// What the AI produces, ready to pre-fill the wizard

export interface ImportedListingData {
    // Titles
    title_raw: string         // original supplier title (kept for reference)
    title_ebay: string        // AI-rewritten for eBay Cassini (max 80 chars)
    cassini_score: number     // 0–100 score for the eBay title

    // Images — downloaded and uploaded to Supabase, not direct supplier URLs
    images: ImportedImage[]

    // Pricing
    price_supplier: number | null   // detected from page
    price_suggested: number | null  // supplier price × markup
    price_currency: 'GBP' | 'USD'  // normalised
    markup_pct: number              // e.g. 30 = 30%
    margin_gbp: number | null       // profit in GBP after eBay fees
    margin_pct: number | null       // margin as a percentage

    // Product details
    description_html: string        // eBay-safe HTML description
    brand: string | null
    ean: string | null
    condition: string               // defaults to 'New'
    category_label: string | null   // human-readable eBay category
    category_ebay_id: number | null // numeric eBay category ID
    item_specifics: Record<string, string>
    seller_type: 'dropship' | 'retail_arb' | 'own_stock'
    source_platform: string

    // VeRO
    vero_status: 'clear' | 'warning' | 'flagged'
    vero_reason: string | null      // e.g. "Sony is a VeRO rights owner"
    vero_brand: string | null       // which brand triggered it

    // Meta
    source_url: string
    platform: ImportPlatform
    imported_at: string             // ISO timestamp
}

// ── Imported Image ────────────────────────────────────────────

export interface ImportedImage {
    id: string                      // uuid generated client-side
    source_url: string              // original URL on supplier site
    supabase_url: string | null     // uploaded to Supabase storage (null until uploaded)
    width: number | null
    height: number | null
    is_main: boolean                // first image = main photo
    upload_status: 'pending' | 'uploading' | 'done' | 'failed'
}

// ── Import Result ─────────────────────────────────────────────
// What the /api/listing/url-import route returns

export interface UrlImportResult {
    success: boolean
    platform: PlatformDetection
    raw: RawProductData | null
    listing: ImportedListingData | null
    tasks: ProcessingTask[]         // for the progress screen
    draft_id?: string | null        // saved listing_drafts row ID
    error_code?: UrlImportErrorCode
    error_message?: string
}

// ── Error Codes ───────────────────────────────────────────────

export type UrlImportErrorCode =
    | 'invalid_url'           // Not a valid URL
    | 'unsupported_platform'  // Platform not in supported list
    | 'login_required'        // Page needs authentication
    | 'product_not_found'     // URL is not a product page
    | 'scrape_blocked'        // Anti-bot blocked the request
    | 'scrape_timeout'        // Request timed out
    | 'ai_failed'             // AI transformation failed
    | 'rate_limited'          // User hit their plan limit
    | 'unknown_error'

// ── Platform Meta (for UI display) ───────────────────────────

export interface PlatformMeta {
    key: ImportPlatform
    displayName: string
    domain: string
    color: string    // brand color for badge
    phase: 1 | 2    // 1 = launched, 2 = coming soon
}

export const SUPPORTED_PLATFORMS: PlatformMeta[] = [
    { key: 'amazon_uk', displayName: 'Amazon', domain: 'amazon.co.uk', color: '#FF9900', phase: 1 },
    { key: 'aliexpress', displayName: 'AliExpress', domain: 'aliexpress.com', color: '#E62E04', phase: 1 },
    { key: 'argos', displayName: 'Argos', domain: 'argos.co.uk', color: '#CC0000', phase: 1 },
    { key: 'wayfair_uk', displayName: 'Wayfair', domain: 'wayfair.co.uk', color: '#7B2FBE', phase: 1 },
    { key: 'bq', displayName: 'B&Q', domain: 'diy.com', color: '#FF6600', phase: 1 },
    { key: 'ebay', displayName: 'eBay', domain: 'ebay.co.uk', color: '#E53238', phase: 1 },
    { key: 'banggood', displayName: 'Banggood', domain: 'banggood.com', color: '#E8321A', phase: 2 },
    { key: 'alibaba', displayName: 'Alibaba', domain: 'alibaba.com', color: '#FF6A00', phase: 2 },
    { key: 'temu', displayName: 'Temu', domain: 'temu.com', color: '#FF4D00', phase: 2 },
    { key: 'dhgate', displayName: 'DHgate', domain: 'dhgate.com', color: '#C41E3A', phase: 2 },
    { key: 'walmart', displayName: 'Walmart', domain: 'walmart.com', color: '#0071CE', phase: 2 },
    { key: 'costco', displayName: 'Costco', domain: 'costco.co.uk', color: '#005DAA', phase: 2 },
]

// ── URL Validator ─────────────────────────────────────────────
// Pure function — no API call. Runs client-side on paste.

export function detectPlatformFromUrl(url: string): PlatformDetection | null {
    try {
        const u = new URL(url)
        const host = u.hostname.replace(/^www\./, '').toLowerCase()

        // ── Exact domain map ──────────────────────────────────────────────────────
        const map: Record<string, Pick<PlatformDetection, 'platform' | 'displayName' | 'logoKey' | 'supported' | 'requiresLogin'>> = {
            // Amazon — all regional TLDs map to uk or us
            'amazon.co.uk': { platform: 'amazon_uk', displayName: 'Amazon UK', logoKey: 'amazon', supported: true, requiresLogin: false },
            'amazon.com': { platform: 'amazon_us', displayName: 'Amazon', logoKey: 'amazon', supported: true, requiresLogin: false },
            'amazon.ca': { platform: 'amazon_us', displayName: 'Amazon CA', logoKey: 'amazon', supported: true, requiresLogin: false },
            'amazon.com.au': { platform: 'amazon_us', displayName: 'Amazon AU', logoKey: 'amazon', supported: true, requiresLogin: false },
            'amazon.de': { platform: 'amazon_us', displayName: 'Amazon DE', logoKey: 'amazon', supported: true, requiresLogin: false },
            'amazon.fr': { platform: 'amazon_us', displayName: 'Amazon FR', logoKey: 'amazon', supported: true, requiresLogin: false },
            'amazon.it': { platform: 'amazon_us', displayName: 'Amazon IT', logoKey: 'amazon', supported: true, requiresLogin: false },
            'amazon.es': { platform: 'amazon_us', displayName: 'Amazon ES', logoKey: 'amazon', supported: true, requiresLogin: false },
            'amazon.co.jp': { platform: 'amazon_us', displayName: 'Amazon JP', logoKey: 'amazon', supported: true, requiresLogin: false },
            // AliExpress — all regional TLDs treated the same
            'aliexpress.com': { platform: 'aliexpress', displayName: 'AliExpress', logoKey: 'aliexpress', supported: true, requiresLogin: false },
            'aliexpress.us': { platform: 'aliexpress', displayName: 'AliExpress', logoKey: 'aliexpress', supported: true, requiresLogin: false },
            'aliexpress.co.uk': { platform: 'aliexpress', displayName: 'AliExpress', logoKey: 'aliexpress', supported: true, requiresLogin: false },
            'aliexpress.ru': { platform: 'aliexpress', displayName: 'AliExpress', logoKey: 'aliexpress', supported: true, requiresLogin: false },
            'aliexpress.fr': { platform: 'aliexpress', displayName: 'AliExpress', logoKey: 'aliexpress', supported: true, requiresLogin: false },
            'aliexpress.de': { platform: 'aliexpress', displayName: 'AliExpress', logoKey: 'aliexpress', supported: true, requiresLogin: false },
            'aliexpress.es': { platform: 'aliexpress', displayName: 'AliExpress', logoKey: 'aliexpress', supported: true, requiresLogin: false },
            'aliexpress.it': { platform: 'aliexpress', displayName: 'AliExpress', logoKey: 'aliexpress', supported: true, requiresLogin: false },
            'aliexpress.pl': { platform: 'aliexpress', displayName: 'AliExpress', logoKey: 'aliexpress', supported: true, requiresLogin: false },
            'aliexpress.nl': { platform: 'aliexpress', displayName: 'AliExpress', logoKey: 'aliexpress', supported: true, requiresLogin: false },
            'aliexpress.pt': { platform: 'aliexpress', displayName: 'AliExpress', logoKey: 'aliexpress', supported: true, requiresLogin: false },
            'aliexpress.com.br': { platform: 'aliexpress', displayName: 'AliExpress', logoKey: 'aliexpress', supported: true, requiresLogin: false },
            // Other platforms
            'argos.co.uk': { platform: 'argos', displayName: 'Argos', logoKey: 'argos', supported: true, requiresLogin: false },
            'wayfair.co.uk': { platform: 'wayfair_uk', displayName: 'Wayfair', logoKey: 'wayfair', supported: true, requiresLogin: false },
            'wayfair.com': { platform: 'wayfair_uk', displayName: 'Wayfair', logoKey: 'wayfair', supported: true, requiresLogin: false },
            'diy.com': { platform: 'bq', displayName: 'B&Q', logoKey: 'bq', supported: true, requiresLogin: false },
            'ebay.co.uk': { platform: 'ebay', displayName: 'eBay', logoKey: 'ebay', supported: true, requiresLogin: false },
            'ebay.com': { platform: 'ebay', displayName: 'eBay', logoKey: 'ebay', supported: true, requiresLogin: false },
            'ebay.de': { platform: 'ebay', displayName: 'eBay DE', logoKey: 'ebay', supported: true, requiresLogin: false },
            'ebay.fr': { platform: 'ebay', displayName: 'eBay FR', logoKey: 'ebay', supported: true, requiresLogin: false },
            'ebay.com.au': { platform: 'ebay', displayName: 'eBay AU', logoKey: 'ebay', supported: true, requiresLogin: false },
            'banggood.com': { platform: 'banggood', displayName: 'Banggood', logoKey: 'banggood', supported: true, requiresLogin: false },
            'alibaba.com': { platform: 'alibaba', displayName: 'Alibaba', logoKey: 'alibaba', supported: true, requiresLogin: false },
            'temu.com': { platform: 'temu', displayName: 'Temu', logoKey: 'temu', supported: true, requiresLogin: false },
            'dhgate.com': { platform: 'dhgate', displayName: 'DHgate', logoKey: 'dhgate', supported: true, requiresLogin: false },
            'walmart.com': { platform: 'walmart_us' as ImportPlatform, displayName: 'Walmart', logoKey: 'walmart', supported: true, requiresLogin: false },
            'costco.co.uk': { platform: 'costco', displayName: 'Costco', logoKey: 'costco', supported: true, requiresLogin: false },
            'costco.com': { platform: 'costco', displayName: 'Costco', logoKey: 'costco', supported: true, requiresLogin: false },
        }

        const match = map[host]
        if (match) {
            return { ...match, confidence: 'high' }
        }

        // ── Fuzzy fallback: catch any AliExpress/Amazon TLD not listed above ─────
        // e.g. aliexpress.com.au, aliexpress.se, amazon.in, amazon.sg
        if (/^aliexpress\.[a-z.]{2,6}$/.test(host)) {
            return {
                platform: 'aliexpress', displayName: 'AliExpress', logoKey: 'aliexpress',
                confidence: 'high', supported: true, requiresLogin: false,
            }
        }
        if (/^amazon\.[a-z.]{2,6}$/.test(host)) {
            return {
                platform: 'amazon_us', displayName: 'Amazon', logoKey: 'amazon',
                confidence: 'high', supported: true, requiresLogin: false,
            }
        }
        if (/^ebay\.[a-z.]{2,6}$/.test(host)) {
            return {
                platform: 'ebay', displayName: 'eBay', logoKey: 'ebay',
                confidence: 'high', supported: true, requiresLogin: false,
            }
        }

        // Unknown but valid URL
        return {
            platform: 'unknown',
            displayName: host,
            logoKey: 'unknown',
            confidence: 'low',
            supported: false,
            requiresLogin: false,
        }
    } catch {
        return null // Not a valid URL at all
    }
}

// ── Default processing tasks ──────────────────────────────────
// Used to initialise Screen 2 (UrlImportProcessing)

export function getDefaultTasks(): ProcessingTask[] {
    return [
        { id: 'fetch', label: 'Reading product page', status: 'pending' },
        { id: 'images', label: 'Extracting images', status: 'pending' },
        { id: 'title', label: 'Writing your eBay title', status: 'pending' },
        { id: 'description', label: 'Generating description', status: 'pending' },
        { id: 'pricing', label: 'Calculating your margin', status: 'pending' },
        { id: 'vero', label: 'Running VeRO check', status: 'pending' },
        { id: 'category', label: 'Mapping eBay category', status: 'pending' },
    ]
}
