// app/dashboard/listing-generator/data/column-definitions.ts
// ─────────────────────────────────────────────────────────────
// Riazify — Column Manager: column definitions + per-segment defaults
//
// Every column the table can show is declared here.
// SEGMENT_COLUMN_DEFAULTS maps segment IDs → ordered list of column IDs
// that appear by default when that segment is active.
// ─────────────────────────────────────────────────────────────

export type ColumnGroup = 'product' | 'pricing' | 'performance' | 'status' | 'identifiers'

export interface ColumnDef {
    id: string
    label: string
    width: number          // px — used as table-layout: fixed column width
    group: ColumnGroup
}

// ── All available columns ─────────────────────────────────────
// Order here is the "canonical" order used when resetting to defaults
export const COLUMN_DEFS: ColumnDef[] = [
    // Product Info
    { id: 'product', label: 'Product', width: 220, group: 'product' },
    { id: 'condition', label: 'Condition', width: 110, group: 'product' },
    { id: 'category', label: 'Category', width: 110, group: 'product' },
    { id: 'source', label: 'Source', width: 100, group: 'product' },
    { id: 'seller_type', label: 'Seller Type', width: 100, group: 'product' },

    // Pricing
    { id: 'price', label: 'Price', width: 90, group: 'pricing' },
    { id: 'margin', label: 'Margin %', width: 80, group: 'pricing' },
    { id: 'net_profit', label: 'Net Profit', width: 90, group: 'pricing' },

    // Performance
    { id: 'health', label: 'Health Score', width: 70, group: 'performance' },
    { id: 'vero', label: 'VeRO Status', width: 80, group: 'performance' },
    { id: 'stock', label: 'Stock', width: 90, group: 'performance' },

    // Status & Dates
    { id: 'status', label: 'Status', width: 90, group: 'status' },
    { id: 'date', label: 'Created Date', width: 80, group: 'status' },
    { id: 'updated', label: 'Last Updated', width: 80, group: 'status' },

    // Identifiers
    { id: 'ids', label: 'EAN / eBay ID', width: 160, group: 'identifiers' },
]

// ── Quick lookup by id ────────────────────────────────────────
export const COLUMN_BY_ID: Record<string, ColumnDef> =
    Object.fromEntries(COLUMN_DEFS.map(c => [c.id, c]))

// ── Group labels ──────────────────────────────────────────────
export const GROUP_LABELS: Record<ColumnGroup, string> = {
    product: 'Product Info',
    pricing: 'Pricing',
    performance: 'Performance',
    status: 'Status & Dates',
    identifiers: 'Identifiers',
}

// ── Per-segment default column sets ───────────────────────────
// Keys match the segment IDs in built-in-segments.ts + the magic 'all' default.
// Custom user-created segments fall back to the 'all' preset.
// Order within each array = left-to-right column order in the table.
export const SEGMENT_COLUMN_DEFAULTS: Record<string, string[]> = {

    // ── Built-in — general ────────────────────────────────────
    all: [
        'product', 'condition', 'category', 'source',
        'price', 'margin', 'health', 'vero', 'stock', 'status', 'date', 'ids',
    ],

    // ── Status segments ───────────────────────────────────────
    published: [
        'product', 'category', 'source',
        'price', 'margin', 'net_profit', 'health', 'vero', 'stock', 'date', 'ids',
    ],
    draft: [
        'product', 'condition', 'category', 'source',
        'price', 'margin', 'health', 'vero', 'date',
    ],
    ended: [
        'product', 'category', 'price', 'margin',
        'health', 'vero', 'date', 'updated',
    ],
    scheduled: [
        'product', 'condition', 'status', 'price', 'date',
    ],

    // ── VeRO segments ─────────────────────────────────────────
    vero_flagged: [
        'product', 'category', 'source', 'vero', 'health', 'date',
    ],
    vero_warning: [
        'product', 'category', 'source', 'vero', 'health', 'date',
    ],
    vero_unchecked: [
        'product', 'category', 'source', 'vero', 'health', 'date',
    ],

    // ── Health segments ───────────────────────────────────────
    health_great: [
        'product', 'category', 'price', 'margin', 'health', 'vero', 'stock', 'date',
    ],
    health_good: [
        'product', 'category', 'price', 'margin', 'health', 'vero', 'stock', 'date',
    ],
    health_needs_work: [
        'product', 'category', 'price', 'health', 'vero', 'date',
    ],
    health_poor: [
        'product', 'category', 'price', 'health', 'vero', 'date',
    ],

    // ── Margin segments ───────────────────────────────────────
    high_margin: [
        'product', 'category', 'price', 'margin', 'net_profit', 'health', 'vero', 'stock', 'date',
    ],
    low_margin: [
        'product', 'category', 'price', 'margin', 'net_profit', 'health', 'date',
    ],
    no_margin_data: [
        'product', 'category', 'source', 'price', 'health', 'date',
    ],

    // ── Source segments ───────────────────────────────────────
    source_cj: [
        'product', 'source', 'price', 'margin', 'net_profit', 'health', 'vero', 'stock', 'date',
    ],
    source_ali: [
        'product', 'source', 'price', 'margin', 'net_profit', 'health', 'vero', 'stock', 'date',
    ],
    ai_imported: [
        'product', 'source', 'condition', 'price', 'margin', 'health', 'vero', 'date',
    ],

    // ── Quality segments ──────────────────────────────────────
    no_photos: [
        'product', 'category', 'health', 'vero', 'date',
    ],
    no_sku: [
        'product', 'category', 'condition', 'price', 'health', 'date',
    ],
    no_price: [
        'product', 'category', 'condition', 'seller_type', 'health', 'vero', 'date',
    ],
}

// ── Helper: get default columns for a segment ─────────────────
// Falls back to 'all' for any unknown / custom segment ID
export function getDefaultColumnsForSegment(segmentId: string): string[] {
    return SEGMENT_COLUMN_DEFAULTS[segmentId] ?? SEGMENT_COLUMN_DEFAULTS['all']
}
