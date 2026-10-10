// app/dashboard/listing-generator/lib/apply-column-filters.ts
// ─────────────────────────────────────────────────────────────
// Pure function: applies the column-level ActiveFilters to a
// listings array. All filters AND together.
// ─────────────────────────────────────────────────────────────

import type { ActiveFilter } from '../data/filter-definitions'
import { FILTER_FIELD_DEFS } from '../data/filter-definitions'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyColumnFilters(listings: any[], filters: ActiveFilter[]): any[] {
    if (!filters.length) return listings

    return listings.filter(listing => {
        return filters.every(f => matchFilter(listing, f))
    })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function matchFilter(listing: any, filter: ActiveFilter): boolean {
    const fieldDef = FILTER_FIELD_DEFS[filter.colId]
    if (!fieldDef) return true

    // Special case: ids column checks both ebay_listing_id and item_specifics EAN
    let raw: unknown
    if (filter.colId === 'ids') {
        const ean = listing.item_specifics?.['EAN'] || listing.item_specifics?.['UPC'] || listing.item_specifics?.['GTIN'] || ''
        raw = listing.ebay_listing_id || ean || null
    } else {
        raw = listing[fieldDef.field]
    }

    const op  = filter.operator
    const val = filter.value

    // ── no-input operators ────────────────────────────────────
    if (op === 'has_value') return raw !== null && raw !== undefined && raw !== ''
    if (op === 'is_empty')  return raw === null || raw === undefined || raw === ''

    // ── text operators ────────────────────────────────────────
    if (fieldDef.type === 'text') {
        const str   = String(raw ?? '').toLowerCase()
        const query = String(val ?? '').toLowerCase()
        if (op === 'contains')     return str.includes(query)
        if (op === 'not_contains') return !str.includes(query)
        if (op === 'equals')       return str === query
        if (op === 'not_equals')   return str !== query
        if (op === 'starts_with')  return str.startsWith(query)
    }

    // ── enum operators ────────────────────────────────────────
    if (fieldDef.type === 'enum') {
        const str = String(raw ?? '').toLowerCase()
        if (op === 'is')         return str === String(val ?? '').toLowerCase()
        if (op === 'is_not')     return str !== String(val ?? '').toLowerCase()
        if (op === 'one_of') {
            const arr = Array.isArray(val) ? val : [val]
            return arr.map(v => String(v).toLowerCase()).includes(str)
        }
        if (op === 'not_one_of') {
            const arr = Array.isArray(val) ? val : [val]
            return !arr.map(v => String(v).toLowerCase()).includes(str)
        }
    }

    // ── number operators ──────────────────────────────────────
    if (fieldDef.type === 'number') {
        const n = Number(raw)
        const v = Number(val)
        if (isNaN(n)) return false
        if (op === 'eq')      return n === v
        if (op === 'neq')     return n !== v
        if (op === 'gt')      return n > v
        if (op === 'gte')     return n >= v
        if (op === 'lt')      return n < v
        if (op === 'lte')     return n <= v
        if (op === 'between') return n >= v && n <= Number(filter.value2)
    }

    // ── date operators ────────────────────────────────────────
    if (fieldDef.type === 'date') {
        const date = new Date(String(raw ?? '')).getTime()
        if (isNaN(date)) return false
        const d1 = new Date(String(val ?? '')).getTime()
        if (op === 'before')  return date < d1
        if (op === 'after')   return date > d1
        if (op === 'between') {
            const d2 = new Date(String(filter.value2 ?? '')).getTime()
            return date >= d1 && date <= d2
        }
    }

    return true
}
