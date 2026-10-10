// app/dashboard/listing-generator/types/barcode-import.types.ts
// ─────────────────────────────────────────────────────────────
// Riazify — Barcode to Listing: shared TypeScript types
// Used by: API route, BarcodeImport, BarcodeQueueRow,
//          BarcodeImportPreview, BarcodeImportFailed
// ─────────────────────────────────────────────────────────────

// ── User-selected identifier mode (what the user tells us they're scanning) ──
// Drives lookup routing and validation rules.
export type IdentifierMode =
    | 'UPC'   // 12-digit US barcode → UPCitemdb
    | 'EAN'   // 13-digit EU/global barcode → UPCitemdb / Open Food Facts
    | 'GTIN'  // Global Trade Item Number (superset of UPC/EAN)
    | 'ISBN'  // Books (978/979 prefix) → Google Books
    | 'MPN'   // Manufacturer Part Number (alphanumeric) → AI lookup
    | 'EPID'  // eBay Product ID (numeric, platform-specific)

export const IDENTIFIER_MODE_OPTIONS: { value: IdentifierMode; label: string; hint: string }[] = [
    { value: 'UPC', label: 'UPC', hint: '12-digit US barcodes' },
    { value: 'EAN', label: 'EAN', hint: '13-digit global barcodes' },
    { value: 'GTIN', label: 'GTIN', hint: 'Universal trade identifiers' },
    { value: 'ISBN', label: 'ISBN', hint: 'Books & publications' },
    { value: 'MPN', label: 'MPN', hint: 'Manufacturer part numbers' },
    { value: 'EPID', label: 'EPID', hint: 'eBay product identifiers' },
]

// ── Barcode format types ───────────────────────────────────────
export type BarcodeType =
    | 'EAN13'    // 13 digits — most UK/EU retail products
    | 'UPC_A'    // 12 digits — US products
    | 'ISBN13'   // 13 digits starting 978/979 — books
    | 'ISBN10'   // 10 chars (may end in X) — older books
    | 'EAN8'     // 8 digits — small packaging
    | 'UPC_E'    // 8 digits compressed — some US products
    | 'TITLE'    // plain-text product title (title-import mode)
    | 'unknown'

// ── Queue item lifecycle ───────────────────────────────────────
export type QueueItemStatus =
    | 'pending'    // just added, not yet sent to API
    | 'loading'    // API call in flight
    | 'found'      // product identified successfully
    | 'not_found'  // no match in any database
    | 'vero_risk'  // found but brand is VeRO flagged/warning
    | 'error'      // network / config error

// ── Error codes returned by the API ───────────────────────────
export type BarcodeImportErrorCode =
    | 'not_found'        // barcode not in any lookup database
    | 'invalid_barcode'  // fails length / checksum validation
    | 'rate_limited'     // UPCitemdb free tier quota hit
    | 'network_error'    // fetch failed
    | 'config_error'     // AI key missing from vault

// ── Data sources ──────────────────────────────────────────────
export type BarcodeDataSource =
    | 'google_books'      // ISBN lookups (free, unlimited)
    | 'open_food_facts'   // food/grocery EANs (free, unlimited)
    | 'upcitemdb'         // general EAN/UPC (100/day free tier; paid key unlocks more)
    | 'barcodelookup'     // barcodelookup.com — optional paid alternative
    | 'go_upc'            // go-upc.com — optional paid alternative, strong EU/UK
    | 'ai_simulation'     // Gemini/Anthropic fallback

// ── Full product result from a successful lookup ───────────────
export interface BarcodeProductData {
    // Core identity
    title: string               // raw product title from source
    title_ebay: string          // AI-optimised eBay title
    brand?: string
    description_html: string    // AI-generated eBay description
    description_is_fallback?: boolean  // true when AI description was unavailable

    // Media
    images: string[]            // product image URLs

    // eBay categorisation
    category_label?: string
    condition: string           // 'New' | 'Used – Good' etc.

    // Identifiers
    ean?: string
    isbn?: string

    // Book-specific (only when barcodeType is ISBN13/ISBN10)
    author?: string
    publisher?: string
    page_count?: number

    // Item specifics for eBay
    item_specifics: Record<string, string>

    // ── Price intelligence ─────────────────────────────────────
    price_suggested?: number        // AI or market-derived suggested price
    price_avg_sold?: number         // average eBay sold price (v2: eBay API)
    price_range_low?: number        // lowest recent sold price
    price_range_high?: number       // highest recent sold price
    sold_last_30_days?: number      // demand signal
    active_listings_count?: number  // competition signal

    // ── VeRO ──────────────────────────────────────────────────
    vero_status: 'clear' | 'warning' | 'flagged'
    vero_reason: string | null
    vero_brand: string | null

    // ── Cassini quality score ──────────────────────────────────
    cassini_score: number           // 0–100
}

// ── Full result shape returned by the API ─────────────────────
export interface BarcodeImportResult {
    barcode: string
    barcodeType: BarcodeType
    source: BarcodeDataSource
    product: BarcodeProductData
    draft_id?: string               // Supabase draft ID if auto-saved
}

// ── A single item in the scan queue ───────────────────────────
export interface BarcodeQueueItem {
    id: string                      // nanoid — stable key for React list
    barcode: string                 // raw barcode string as entered/scanned
    barcodeType: BarcodeType        // detected type (set before API call)
    status: QueueItemStatus
    result?: BarcodeImportResult    // populated when status = 'found' | 'vero_risk'
    errorCode?: BarcodeImportErrorCode // populated when status = 'not_found' | 'error'
    selected: boolean               // for bulk-create checkbox
    scannedAt: number               // Date.now() — for display order
}

// ── API request body ───────────────────────────────────────────
export interface BarcodeImportRequest {
    barcode: string
    identifierMode?: IdentifierMode   // hint from user — overrides auto-detection
}

// ── API response body ──────────────────────────────────────────
export interface BarcodeImportResponse {
    success: boolean
    result?: BarcodeImportResult
    errorCode?: BarcodeImportErrorCode
    message?: string
}

// ── Barcode validation helpers (used client + server side) ─────

/**
 * Detects the type of a barcode string based on length and prefix.
 * Strips non-digit characters first (except trailing X for ISBN-10).
 */
export function detectBarcodeType(raw: string): BarcodeType {
    const clean = raw.trim()

    // ISBN-10 may end in X
    const digits = clean.replace(/[^0-9]/g, '')
    const isIsbn10 = /^\d{9}[\dX]$/i.test(clean.replace(/[-\s]/g, ''))

    if (isIsbn10) return 'ISBN10'

    switch (digits.length) {
        case 13:
            if (digits.startsWith('978') || digits.startsWith('979')) return 'ISBN13'
            return 'EAN13'
        case 12:
            return 'UPC_A'
        case 8:
            return 'EAN8'  // could be UPC-E — treat same for lookup purposes
        default:
            return 'unknown'
    }
}

/**
 * Validates the EAN-13 / UPC-A check digit.
 * Returns true for ISBN (different algorithm, validated by Google Books).
 * Returns true for unknown types (don't block on unrecognised formats).
 */
export function validateCheckDigit(barcode: string, type: BarcodeType): boolean {
    if (type === 'ISBN10' || type === 'ISBN13' || type === 'unknown') return true

    const digits = barcode.replace(/\D/g, '')

    if (type === 'EAN8') {
        // EAN-8 check digit
        if (digits.length !== 8) return false
        let sum = 0
        for (let i = 0; i < 7; i++) {
            sum += parseInt(digits[i]) * (i % 2 === 0 ? 3 : 1)
        }
        const check = (10 - (sum % 10)) % 10
        return check === parseInt(digits[7])
    }

    // EAN-13 and UPC-A use the same check digit algorithm
    if (digits.length !== 13 && digits.length !== 12) return false
    const padded = digits.length === 12 ? '0' + digits : digits
    let sum = 0
    for (let i = 0; i < 12; i++) {
        sum += parseInt(padded[i]) * (i % 2 === 0 ? 1 : 3)
    }
    const check = (10 - (sum % 10)) % 10
    return check === parseInt(padded[12])
}

/**
 * Returns a human-readable label for a barcode type.
 */
export function barcodTypeLabel(type: BarcodeType): string {
    switch (type) {
        case 'EAN13': return 'EAN-13'
        case 'UPC_A': return 'UPC-A'
        case 'ISBN13': return 'ISBN-13'
        case 'ISBN10': return 'ISBN-10'
        case 'EAN8': return 'EAN-8'
        case 'UPC_E': return 'UPC-E'
        case 'TITLE': return 'Title'
        default: return 'Barcode'
    }
}
