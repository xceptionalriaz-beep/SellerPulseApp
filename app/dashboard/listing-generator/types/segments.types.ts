// app/dashboard/listing-generator/types/segments.types.ts
// ─────────────────────────────────────────────────────────────
// Riazify — Listing Segments: shared TypeScript types
// Used by: built-in-segments.ts, segment-filter.ts,
//          useSegments.ts, SegmentSidebar, SegmentBuilder, FilterRow
// ─────────────────────────────────────────────────────────────

// ── Fields a filter can target ────────────────────────────────
export type FilterField =
    | 'status'           // 'draft' | 'published' | 'ended' | 'scheduled'
    | 'vero_status'      // 'clear' | 'warning' | 'flagged'
    | 'health_score'     // number 0–100
    | 'margin'           // number (percentage)
    | 'sell_price'       // number | null
    | 'net_profit'       // number | null
    | 'sku'              // string | null
    | 'source_platform'  // 'barcode_import' | 'title_import' | 'url_import' | etc.
    | 'category'         // string | null
    | 'condition'        // 'New' | 'Used' | etc.
    | 'created_at'       // ISO date string

// ── Operators per field type ──────────────────────────────────
export type FilterOperator =
    | 'eq'           // equals
    | 'not_eq'       // not equals
    | 'gt'           // greater than          (numbers, dates)
    | 'gte'          // greater than or equal (numbers, dates)
    | 'lt'           // less than             (numbers, dates)
    | 'lte'          // less than or equal    (numbers, dates)
    | 'between'      // between two values    (numbers, dates)
    | 'contains'     // string contains
    | 'is_empty'     // null / empty string / 0
    | 'is_not_empty' // not null and not empty

// ── A single filter condition ─────────────────────────────────
export interface SegmentFilter {
    field: FilterField
    op: FilterOperator
    // value is optional — not needed for is_empty / is_not_empty
    value?: string | number | boolean
    // second value used only when op = 'between'
    value2?: string | number
}

// ── How multiple filters combine ──────────────────────────────
export type FilterLogic = 'AND' | 'OR'

// ── A built-in segment (hardcoded, cannot be deleted) ─────────
export interface BuiltInSegment {
    id: string          // stable identifier e.g. 'active', 'vero_flagged'
    name: string          // display label
    icon: string          // lucide icon name
    color: string          // hex — used for the left dot
    filters: SegmentFilter[] // empty array = no filter (show all)
    logic: FilterLogic     // how filters combine (usually 'AND')
    isBuiltIn: true
}

// ── A custom segment (user-created, stored in Supabase) ───────
export interface CustomSegment {
    id: string          // uuid from Supabase
    user_id: string
    name: string
    icon: string          // emoji or lucide icon name
    color: string          // hex
    filters: SegmentFilter[]
    logic: FilterLogic
    sort_order: number
    created_at: string
    isBuiltIn: false
}

// ── Union — what the sidebar and hooks work with ──────────────
export type Segment = BuiltInSegment | CustomSegment

// ── What the Supabase row looks like (raw from DB) ───────────
export interface SegmentRow {
    id: string
    user_id: string
    name: string
    icon: string
    color: string
    filters: SegmentFilter[]   // stored as jsonb
    logic: FilterLogic
    sort_order: number
    created_at: string
}

// ── Payload for creating / updating a custom segment ─────────
export interface SegmentUpsert {
    name: string
    icon: string
    color: string
    filters: SegmentFilter[]
    logic: FilterLogic
    sort_order?: number
}

// ── Human-readable labels for each filter field ───────────────
export const FILTER_FIELD_LABELS: Record<FilterField, string> = {
    status: 'Status',
    vero_status: 'VeRO Status',
    health_score: 'Health Score',
    margin: 'Margin %',
    sell_price: 'Price',
    net_profit: 'Net Profit',
    sku: 'SKU',
    source_platform: 'Source',
    category: 'Category',
    condition: 'Condition',
    created_at: 'Created Date',
}

// ── Which operators apply to each field ──────────────────────
export const FIELD_OPERATORS: Record<FilterField, FilterOperator[]> = {
    status: ['eq', 'not_eq'],
    vero_status: ['eq', 'not_eq'],
    health_score: ['gt', 'gte', 'lt', 'lte', 'between', 'eq'],
    margin: ['gt', 'gte', 'lt', 'lte', 'between', 'eq'],
    sell_price: ['gt', 'gte', 'lt', 'lte', 'between', 'is_empty', 'is_not_empty'],
    net_profit: ['gt', 'gte', 'lt', 'lte', 'between', 'is_empty'],
    sku: ['is_empty', 'is_not_empty', 'contains', 'eq'],
    source_platform: ['eq', 'not_eq'],
    category: ['eq', 'not_eq', 'contains', 'is_empty'],
    condition: ['eq', 'not_eq'],
    created_at: ['gt', 'gte', 'lt', 'lte', 'between'],
}

// ── Human-readable operator labels ───────────────────────────
export const OPERATOR_LABELS: Record<FilterOperator, string> = {
    eq: 'is',
    not_eq: 'is not',
    gt: 'greater than',
    gte: 'at least',
    lt: 'less than',
    lte: 'at most',
    between: 'between',
    contains: 'contains',
    is_empty: 'is empty',
    is_not_empty: 'is not empty',
}

// ── Enum options for fields that have a fixed value set ───────
export const FIELD_OPTIONS: Partial<Record<FilterField, { value: string; label: string }[]>> = {
    status: [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Active' },
        { value: 'ended', label: 'Ended' },
        { value: 'scheduled', label: 'Scheduled' },
    ],
    vero_status: [
        { value: 'clear', label: 'Clear' },
        { value: 'warning', label: 'Warning' },
        { value: 'flagged', label: 'Flagged' },
    ],
    source_platform: [
        { value: 'barcode_import', label: 'Barcode AI' },
        { value: 'title_import', label: 'Title AI' },
        { value: 'url_import', label: 'URL AI' },
        { value: 'image_import', label: 'Photo AI' },
        { value: 'manual', label: 'Manual' },
    ],
    condition: [
        { value: 'New', label: 'New' },
        { value: 'Used', label: 'Used' },
        { value: 'Used – Like New', label: 'Used – Like New' },
        { value: 'Used – Good', label: 'Used – Good' },
        { value: 'Used – Acceptable', label: 'Used – Acceptable' },
        { value: 'For parts', label: 'For parts' },
    ],
}

// ── Colour palette for segment dots / icons ───────────────────
export const SEGMENT_COLORS = [
    '#7530fb', // purple  (primary)
    '#22c55e', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#3b82f6', // blue
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
    '#8b5cf6', // violet
    '#6b7280', // grey
] as const
