// app/dashboard/listing-generator/lib/segment-filter.ts
// ─────────────────────────────────────────────────────────────
// Riazify — Listing Segments: filter evaluation engine
// Pure functions only — no React, no Supabase, no side-effects.
//
// Core export: matchesSegment(listing, filters, logic)
// Returns true if the listing passes all (AND) or any (OR) filters.
// ─────────────────────────────────────────────────────────────

import type { SegmentFilter, FilterField, FilterLogic } from '../types/segments.types'

// ── Minimal listing shape this engine needs ───────────────────
// Mirrors the Listing interface in LgDashboard — only the fields
// that FilterField can target. Kept loose so it works if extra
// fields are added to Listing later.
export interface FilterableListing {
    status: string | null
    vero_status: string | null
    health_score: number
    margin: number | null
    sell_price: number | null
    net_profit: number | null
    sku: string | null
    source_platform: string | null
    category: string | null
    condition: string | null
    created_at: string
}

// ── Extract the raw value for a given field ───────────────────
function getValue(listing: FilterableListing, field: FilterField): string | number | null {
    switch (field) {
        case 'status': return listing.status
        case 'vero_status': return listing.vero_status
        case 'health_score': return listing.health_score
        case 'margin': return listing.margin
        case 'sell_price': return listing.sell_price
        case 'net_profit': return listing.net_profit
        case 'sku': return listing.sku
        case 'source_platform': return listing.source_platform
        case 'category': return listing.category
        case 'condition': return listing.condition
        case 'created_at': return listing.created_at
        default: return null
    }
}

// ── "Empty" check — null, empty string, or zero ───────────────
function isEmpty(val: string | number | null): boolean {
    if (val === null || val === undefined) return true
    if (typeof val === 'string' && val.trim() === '') return true
    return false
}

// ── Compare dates (ISO strings) ───────────────────────────────
function compareDates(a: string, b: string): number {
    return new Date(a).getTime() - new Date(b).getTime()
}

// ── Evaluate a single filter against one listing ──────────────
function matchesFilter(listing: FilterableListing, filter: SegmentFilter): boolean {
    const raw = getValue(listing, filter.field)

    switch (filter.op) {

        case 'is_empty':
            return isEmpty(raw)

        case 'is_not_empty':
            return !isEmpty(raw)

        case 'eq':
            if (raw === null) return false
            return String(raw).toLowerCase() === String(filter.value ?? '').toLowerCase()

        case 'not_eq':
            if (raw === null) return true   // null ≠ anything
            return String(raw).toLowerCase() !== String(filter.value ?? '').toLowerCase()

        case 'contains':
            if (isEmpty(raw)) return false
            return String(raw).toLowerCase().includes(String(filter.value ?? '').toLowerCase())

        case 'gt':
            if (raw === null) return false
            if (filter.field === 'created_at')
                return compareDates(String(raw), String(filter.value ?? '')) > 0
            return Number(raw) > Number(filter.value ?? 0)

        case 'gte':
            if (raw === null) return false
            if (filter.field === 'created_at')
                return compareDates(String(raw), String(filter.value ?? '')) >= 0
            return Number(raw) >= Number(filter.value ?? 0)

        case 'lt':
            if (raw === null) return false
            if (filter.field === 'created_at')
                return compareDates(String(raw), String(filter.value ?? '')) < 0
            return Number(raw) < Number(filter.value ?? 0)

        case 'lte':
            if (raw === null) return false
            if (filter.field === 'created_at')
                return compareDates(String(raw), String(filter.value ?? '')) <= 0
            return Number(raw) <= Number(filter.value ?? 0)

        case 'between': {
            if (raw === null) return false
            if (filter.field === 'created_at') {
                const t = compareDates(String(raw), String(filter.value ?? ''))
                const t2 = compareDates(String(raw), String(filter.value2 ?? ''))
                return t >= 0 && t2 <= 0
            }
            const n = Number(raw)
            const lo = Number(filter.value ?? 0)
            const hi = Number(filter.value2 ?? 0)
            return n >= lo && n <= hi
        }

        default:
            return true   // unknown op — don't block
    }
}

// ── Main export: does a listing match a segment? ──────────────
/**
 * Returns true if `listing` satisfies the given `filters`
 * combined with `logic` (AND = all must pass, OR = at least one).
 *
 * An empty filters array always returns true (matches everything).
 */
export function matchesSegment(
    listing: FilterableListing,
    filters: SegmentFilter[],
    logic: FilterLogic = 'AND',
): boolean {
    if (filters.length === 0) return true

    if (logic === 'AND') {
        return filters.every(f => matchesFilter(listing, f))
    }
    return filters.some(f => matchesFilter(listing, f))
}

// ── Utility: count listings matching a segment ────────────────
/**
 * Returns how many listings in `all` match the given filters.
 * Used by the sidebar to show count badges next to each segment.
 */
export function countMatches(
    all: FilterableListing[],
    filters: SegmentFilter[],
    logic: FilterLogic = 'AND',
): number {
    if (filters.length === 0) return all.length
    return all.filter(l => matchesSegment(l, filters, logic)).length
}

// ── Utility: filter an array of listings ─────────────────────
/**
 * Returns only the listings that match the given filters.
 * Convenience wrapper used in LgDashboard to produce the
 * filtered list for the active segment.
 */
export function applySegment<T extends FilterableListing>(
    all: T[],
    filters: SegmentFilter[],
    logic: FilterLogic = 'AND',
): T[] {
    if (filters.length === 0) return all
    return all.filter(l => matchesSegment(l, filters, logic))
}
