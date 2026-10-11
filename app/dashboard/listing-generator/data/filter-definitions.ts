// app/dashboard/listing-generator/data/filter-definitions.ts
// ─────────────────────────────────────────────────────────────
// Riazify — Column Filter Definitions
//
// Maps each column ID to:
//   • The listing field(s) it reads
//   • The field type (text | number | enum | date)
//   • The operators available for that type
//   • For enum fields: the selectable option values
// ─────────────────────────────────────────────────────────────

export type FilterFieldType = 'text' | 'number' | 'enum' | 'date'

export interface FilterOperator {
    value: string
    label: string
    needsInput: boolean   // false = "has value" / "is empty" — no value input
    needsTwo: boolean   // true = "between" — needs value + value2
}

export interface FilterFieldDef {
    colId: string
    label: string
    type: FilterFieldType
    field: string     // listing property name (for apply logic)
    options?: { value: string; label: string }[]
}

// ── Operator sets per type ────────────────────────────────────
export const OPERATORS: Record<FilterFieldType, FilterOperator[]> = {
    text: [
        { value: 'contains', label: 'contains', needsInput: true, needsTwo: false },
        { value: 'not_contains', label: 'does not contain', needsInput: true, needsTwo: false },
        { value: 'equals', label: 'equals', needsInput: true, needsTwo: false },
        { value: 'not_equals', label: 'not equals to', needsInput: true, needsTwo: false },
        { value: 'starts_with', label: 'starts with', needsInput: true, needsTwo: false },
        { value: 'has_value', label: 'has value', needsInput: false, needsTwo: false },
        { value: 'is_empty', label: 'is empty', needsInput: false, needsTwo: false },
    ],
    number: [
        { value: 'eq', label: 'equals', needsInput: true, needsTwo: false },
        { value: 'neq', label: 'not equals', needsInput: true, needsTwo: false },
        { value: 'gt', label: 'greater than', needsInput: true, needsTwo: false },
        { value: 'gte', label: 'at least', needsInput: true, needsTwo: false },
        { value: 'lt', label: 'less than', needsInput: true, needsTwo: false },
        { value: 'lte', label: 'at most', needsInput: true, needsTwo: false },
        { value: 'between', label: 'between', needsInput: true, needsTwo: true },
        { value: 'has_value', label: 'has value', needsInput: false, needsTwo: false },
        { value: 'is_empty', label: 'is empty', needsInput: false, needsTwo: false },
    ],
    enum: [
        { value: 'one_of', label: 'one of', needsInput: true, needsTwo: false },
        { value: 'not_one_of', label: 'not one of', needsInput: true, needsTwo: false },
        { value: 'is', label: 'is', needsInput: true, needsTwo: false },
        { value: 'is_not', label: 'is not', needsInput: true, needsTwo: false },
        { value: 'has_value', label: 'has value', needsInput: false, needsTwo: false },
        { value: 'is_empty', label: 'is empty', needsInput: false, needsTwo: false },
    ],
    date: [
        { value: 'before', label: 'before', needsInput: true, needsTwo: false },
        { value: 'after', label: 'after', needsInput: true, needsTwo: false },
        { value: 'between', label: 'between', needsInput: true, needsTwo: true },
        { value: 'has_value', label: 'has value', needsInput: false, needsTwo: false },
        { value: 'is_empty', label: 'is empty', needsInput: false, needsTwo: false },
    ],
}

// ── Per-column filter field definitions ───────────────────────
export const FILTER_FIELD_DEFS: Record<string, FilterFieldDef> = {
    product: {
        colId: 'product', label: 'Product / Title', type: 'text', field: 'title',
    },
    condition: {
        colId: 'condition', label: 'Condition', type: 'enum', field: 'condition',
        options: [
            { value: 'New', label: 'New' },
            { value: 'Used', label: 'Used' },
            { value: 'Refurbished', label: 'Refurbished' },
            { value: 'For parts', label: 'For parts' },
        ],
    },
    category: {
        colId: 'category', label: 'Category', type: 'text', field: 'category',
    },
    source: {
        colId: 'source', label: 'Source', type: 'enum', field: 'source_platform',
        options: [
            { value: 'cj', label: 'CJ Dropshipping' },
            { value: 'aliexpress', label: 'AliExpress' },
            { value: 'manual', label: 'Manual' },
            { value: 'ai', label: 'AI Import' },
            { value: 'barcode', label: 'Barcode Import' },
            { value: 'url', label: 'URL Import' },
        ],
    },
    seller_type: {
        colId: 'seller_type', label: 'Seller Type', type: 'enum', field: 'seller_type',
        options: [
            { value: 'own_stock', label: 'Own Stock' },
            { value: 'wholesale', label: 'Wholesale' },
            { value: 'retail_arb', label: 'Retail Arbitrage' },
            { value: 'dropship', label: 'Dropship' },
            { value: 'pod', label: 'Print on Demand' },
            { value: 'reseller', label: 'Reseller' },
        ],
    },
    price: {
        colId: 'price', label: 'Price (£)', type: 'number', field: 'sell_price',
    },
    margin: {
        colId: 'margin', label: 'Margin %', type: 'number', field: 'margin',
    },
    net_profit: {
        colId: 'net_profit', label: 'Net Profit (£)', type: 'number', field: 'net_profit',
    },
    health: {
        colId: 'health', label: 'Health Score', type: 'number', field: 'health_score',
    },
    vero: {
        colId: 'vero', label: 'VeRO Status', type: 'enum', field: 'vero_status',
        options: [
            { value: 'clear', label: 'Clear' },
            { value: 'warning', label: 'Warning' },
            { value: 'flagged', label: 'Flagged' },
            { value: 'unchecked', label: 'Unchecked' },
        ],
    },
    stock: {
        colId: 'stock', label: 'Stock Qty', type: 'number', field: 'quantity',
    },
    status: {
        colId: 'status', label: 'Status', type: 'enum', field: 'status',
        options: [
            { value: 'published', label: 'Live' },
            { value: 'draft', label: 'Draft' },
            { value: 'ended', label: 'Ended' },
            { value: 'scheduled', label: 'Scheduled' },
        ],
    },
    date: {
        colId: 'date', label: 'Created Date', type: 'date', field: 'created_at',
    },
    updated: {
        colId: 'updated', label: 'Last Updated', type: 'date', field: 'updated_at',
    },
    ids: {
        colId: 'ids', label: 'EAN / eBay ID', type: 'text', field: 'ebay_listing_id',
    },
}

// ── Active filter shape ───────────────────────────────────────
export interface ActiveFilter {
    id: string           // unique: colId + '_' + timestamp
    colId: string
    operator: string
    value: string | string[] | number | null
    value2?: number | string | null  // "between" upper bound
}

// ── Default operator per type ─────────────────────────────────
export function defaultOperator(type: FilterFieldType): string {
    if (type === 'text') return 'contains'
    if (type === 'number') return 'gte'
    if (type === 'enum') return 'one_of'
    return 'after'
}
