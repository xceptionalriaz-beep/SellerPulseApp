// app/dashboard/listing-generator/components/BulkUpload/BulkUploadParser.ts
// ─────────────────────────────────────────────────────────────
// Riazify — Bulk Upload: pure parsing + validation utilities
//
// No React. No Supabase. No side-effects.
// Everything here is synchronous and fully unit-testable.
//
// Exports:
//   parseFile(file)           → Promise<ParseResult>
//   validateRow(raw)          → ParsedRow
//   generateCSVTemplate()     → string  (CSV text)
//   TEMPLATE_HEADERS          → string[]
//   COLUMN_META               → ColumnMeta[]
// ─────────────────────────────────────────────────────────────

import type { BulkRow, ParsedRow } from './BulkUploadModal'

// ─────────────────────────────────────────────────────────────
// Column metadata — single source of truth for every column
// ─────────────────────────────────────────────────────────────

export interface ColumnMeta {
    key:         string
    label:       string
    description: string
    required:    'one_of_pair' | 'optional'
    pair?:       string         // the other column in a "one of these two" pair
    type:        'string' | 'number' | 'enum' | 'url_list'
    enumValues?: string[]
    maxLength?:  number
    min?:        number
    max?:        number
    example:     string
}

export const COLUMN_META: ColumnMeta[] = [
    {
        key:         'title',
        label:       'Title',
        description: 'Product title — AI will optimise it for Cassini SEO',
        required:    'one_of_pair',
        pair:        'barcode',
        type:        'string',
        maxLength:   80,
        example:     'Vintage Canon AE-1 35mm Film Camera Body',
    },
    {
        key:         'barcode',
        label:       'Barcode (EAN / UPC)',
        description: 'EAN-13 or UPC-A — triggers automatic barcode lookup',
        required:    'one_of_pair',
        pair:        'title',
        type:        'string',
        maxLength:   14,
        example:     '5055002556371',
    },
    {
        key:         'buy_price',
        label:       'Buy Price (£)',
        description: 'Your cost — used for margin calculation',
        required:    'optional',
        type:        'number',
        min:         0,
        max:         999999,
        example:     '12.50',
    },
    {
        key:         'sell_price',
        label:       'Sell Price (£)',
        description: 'Override the AI suggested sell price',
        required:    'optional',
        type:        'number',
        min:         0,
        max:         999999,
        example:     '34.99',
    },
    {
        key:         'sku',
        label:       'SKU',
        description: 'Your internal stock-keeping unit reference',
        required:    'optional',
        type:        'string',
        maxLength:   40,
        example:     'CAM-001',
    },
    {
        key:         'condition',
        label:       'Condition',
        description: 'Item condition — must be one of the allowed values',
        required:    'optional',
        type:        'enum',
        enumValues:  ['new', 'used', 'refurbished'],
        example:     'used',
    },
    {
        key:         'quantity',
        label:       'Quantity',
        description: 'Stock count to list',
        required:    'optional',
        type:        'number',
        min:         0,
        max:         9999,
        example:     '3',
    },
    {
        key:         'category_id',
        label:       'eBay Category ID',
        description: 'eBay leaf category numeric ID — AI will suggest one if omitted',
        required:    'optional',
        type:        'string',
        maxLength:   10,
        example:     '31388',
    },
    {
        key:         'images',
        label:       'Image URLs',
        description: 'Comma-separated https:// image URLs (max 12)',
        required:    'optional',
        type:        'url_list',
        example:     'https://example.com/img1.jpg,https://example.com/img2.jpg',
    },
]

export const TEMPLATE_HEADERS = COLUMN_META.map(c => c.key)

// ─────────────────────────────────────────────────────────────
// CSV template generator
// ─────────────────────────────────────────────────────────────

export function generateCSVTemplate(): string {
    const header  = TEMPLATE_HEADERS.join(',')
    const example = COLUMN_META.map(c => {
        // Wrap in quotes if value contains a comma
        const v = c.example
        return v.includes(',') ? `"${v}"` : v
    }).join(',')
    return `${header}\n${example}\n`
}

// ─────────────────────────────────────────────────────────────
// Low-level CSV parser (RFC 4180 compliant, no dependencies)
// ─────────────────────────────────────────────────────────────

function parseCSVText(text: string): string[][] {
    const rows: string[][] = []
    const lines = text.split(/\r?\n/)

    for (const line of lines) {
        if (!line.trim()) continue
        const cols: string[] = []
        let cur  = ''
        let inQ  = false

        for (let i = 0; i < line.length; i++) {
            const ch = line[i]
            if (ch === '"') {
                // escaped quote inside quoted field: ""
                if (inQ && line[i + 1] === '"') { cur += '"'; i++ }
                else inQ = !inQ
            } else if (ch === ',' && !inQ) {
                cols.push(cur.trim())
                cur = ''
            } else {
                cur += ch
            }
        }
        cols.push(cur.trim())
        rows.push(cols)
    }
    return rows
}

// ─────────────────────────────────────────────────────────────
// Map a 2D string matrix (header row + data rows) → BulkRow[]
// ─────────────────────────────────────────────────────────────

function matrixToRows(matrix: string[][]): BulkRow[] {
    if (matrix.length < 2) return []

    // Normalise header row: lowercase, underscores, strip BOM
    const rawHeaders = matrix[0]
    const headers = rawHeaders.map(h =>
        h.replace(/^﻿/, '').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    )

    return matrix.slice(1).map((cols, i) => {
        const row: BulkRow = { _rowIndex: i + 2 }  // 1-based, +1 for header
        TEMPLATE_HEADERS.forEach(key => {
            const ci = headers.indexOf(key)
            if (ci !== -1) {
                const v = cols[ci]?.trim() ?? ''
                // Store empty strings as undefined so optional checks work cleanly
                if (v !== '') (row as unknown as Record<string, string>)[key] = v
            }
        })
        return row
    })
}

// ─────────────────────────────────────────────────────────────
// Row-level validation
// ─────────────────────────────────────────────────────────────

export function validateRow(raw: BulkRow): ParsedRow {
    const errors: string[] = []

    // ── Required: title OR barcode ────────────────────────────
    const hasTitle   = !!raw.title?.trim()
    const hasBarcode = !!raw.barcode?.trim()
    if (!hasTitle && !hasBarcode) {
        errors.push('Row needs a title or a barcode — at least one is required')
    }

    // ── Barcode format ────────────────────────────────────────
    if (raw.barcode) {
        const cleaned = raw.barcode.replace(/\s/g, '')
        if (!/^\d{8,14}$/.test(cleaned)) {
            errors.push(`Barcode "${raw.barcode}" must be 8–14 digits (EAN-8, EAN-13, UPC-A, UPC-E)`)
        }
    }

    // ── Title length ──────────────────────────────────────────
    if (raw.title && raw.title.length > 80) {
        errors.push(`Title is ${raw.title.length} characters — eBay allows max 80`)
    }

    // ── Numeric fields ────────────────────────────────────────
    for (const key of ['buy_price', 'sell_price'] as const) {
        const v = raw[key]
        if (v !== undefined) {
            const n = parseFloat(v)
            if (isNaN(n) || n < 0) {
                errors.push(`${key === 'buy_price' ? 'Buy' : 'Sell'} price "${v}" must be a positive number`)
            }
        }
    }

    if (raw.quantity !== undefined) {
        const q = parseInt(raw.quantity, 10)
        if (isNaN(q) || q < 0) {
            errors.push(`Quantity "${raw.quantity}" must be a whole number ≥ 0`)
        } else if (q > 9999) {
            errors.push(`Quantity ${q} exceeds the maximum of 9,999`)
        }
    }

    // ── Cross-field: sell < buy ───────────────────────────────
    if (raw.buy_price && raw.sell_price) {
        const bp = parseFloat(raw.buy_price)
        const sp = parseFloat(raw.sell_price)
        if (!isNaN(bp) && !isNaN(sp) && sp > 0 && sp < bp) {
            errors.push(`Sell price £${sp} is lower than buy price £${bp} — this listing would make a loss`)
        }
    }

    // ── Condition enum ────────────────────────────────────────
    if (raw.condition) {
        const allowed = ['new', 'used', 'refurbished']
        if (!allowed.includes(raw.condition.toLowerCase())) {
            errors.push(`Condition "${raw.condition}" is not valid — use: new, used, or refurbished`)
        }
    }

    // ── Image URLs ────────────────────────────────────────────
    if (raw.images) {
        const urls = raw.images.split(',').map(u => u.trim()).filter(Boolean)
        if (urls.length > 12) {
            errors.push(`${urls.length} images provided — eBay allows max 12 per listing`)
        }
        const badUrls = urls.filter(u => !/^https?:\/\/.+\..+/.test(u))
        if (badUrls.length > 0) {
            errors.push(`${badUrls.length} image URL${badUrls.length > 1 ? 's are' : ' is'} not valid http(s) URLs`)
        }
    }

    // ── Category ID ───────────────────────────────────────────
    if (raw.category_id && !/^\d+$/.test(raw.category_id)) {
        errors.push(`Category ID "${raw.category_id}" must be a number (e.g. 31388)`)
    }

    return { ...raw, _errors: errors, _valid: errors.length === 0 }
}

// ─────────────────────────────────────────────────────────────
// ParseResult — what parseFile() returns
// ─────────────────────────────────────────────────────────────

export interface ParseResult {
    ok:            boolean
    error?:        string         // top-level file error (not per-row)
    rows:          ParsedRow[]
    totalRows:     number
    validRows:     number
    invalidRows:   number
    missingColumns:string[]       // expected template columns not found in file
    extraColumns:  string[]       // columns in file not in template (info only)
}

// ─────────────────────────────────────────────────────────────
// parseFile — main entry point
// ─────────────────────────────────────────────────────────────

export async function parseFile(file: File): Promise<ParseResult> {
    // ── File type gate ────────────────────────────────────────
    const name = file.name.toLowerCase()
    if (!name.endsWith('.csv') && !name.endsWith('.txt')) {
        return {
            ok: false,
            error: 'Only CSV files are supported. Save your spreadsheet as .csv and try again.',
            rows: [], totalRows: 0, validRows: 0, invalidRows: 0,
            missingColumns: [], extraColumns: [],
        }
    }

    // ── File size gate (5 MB max) ─────────────────────────────
    if (file.size > 5 * 1024 * 1024) {
        return {
            ok: false,
            error: 'File is larger than 5 MB. Split it into smaller files and upload each separately.',
            rows: [], totalRows: 0, validRows: 0, invalidRows: 0,
            missingColumns: [], extraColumns: [],
        }
    }

    // ── Read file text ────────────────────────────────────────
    const text = await file.text()

    if (!text.trim()) {
        return {
            ok: false,
            error: 'The file is empty.',
            rows: [], totalRows: 0, validRows: 0, invalidRows: 0,
            missingColumns: [], extraColumns: [],
        }
    }

    // ── Parse CSV matrix ──────────────────────────────────────
    const matrix = parseCSVText(text)

    if (matrix.length < 1) {
        return {
            ok: false,
            error: 'Could not read any rows from this file. Make sure it is a valid CSV.',
            rows: [], totalRows: 0, validRows: 0, invalidRows: 0,
            missingColumns: [], extraColumns: [],
        }
    }

    if (matrix.length < 2) {
        return {
            ok: false,
            error: 'The file has a header row but no data rows.',
            rows: [], totalRows: 0, validRows: 0, invalidRows: 0,
            missingColumns: [], extraColumns: [],
        }
    }

    // ── Column audit ──────────────────────────────────────────
    const fileHeaders = matrix[0].map(h =>
        h.replace(/^﻿/, '').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    )

    const missingColumns = TEMPLATE_HEADERS.filter(h =>
        !fileHeaders.includes(h) &&
        // Only warn about columns that are actually needed
        ['title', 'barcode'].includes(h)
            ? false   // handled per-row in validateRow
            : false   // all columns are optional at file level
    )

    const extraColumns = fileHeaders.filter(h => !TEMPLATE_HEADERS.includes(h))

    // Warn if neither title nor barcode column exists at all
    const hasAnyIdentifier = fileHeaders.includes('title') || fileHeaders.includes('barcode')
    if (!hasAnyIdentifier) {
        return {
            ok: false,
            error: 'Your file has no "title" or "barcode" column. Add at least one — it is required to generate a listing.',
            rows: [], totalRows: 0, validRows: 0, invalidRows: 0,
            missingColumns: ['title', 'barcode'], extraColumns,
        }
    }

    // ── Map + validate every row ──────────────────────────────
    const rawRows  = matrixToRows(matrix)
    const rows     = rawRows.map(validateRow)
    const valid    = rows.filter(r => r._valid).length
    const invalid  = rows.filter(r => !r._valid).length

    return {
        ok:             true,
        rows,
        totalRows:      rows.length,
        validRows:      valid,
        invalidRows:    invalid,
        missingColumns: [],
        extraColumns,
    }
}

// ─────────────────────────────────────────────────────────────
// Helpers consumed by other BulkUpload components
// ─────────────────────────────────────────────────────────────

/** Apply the plan row cap and return the subset that will be sent to AI */
export function applyPlanLimit(rows: ParsedRow[], limit: number): {
    allowed:  ParsedRow[]
    blocked:  ParsedRow[]
} {
    const valid = rows.filter(r => r._valid)
    if (limit <= 0) return { allowed: valid, blocked: [] }
    return {
        allowed: valid.slice(0, limit),
        blocked: valid.slice(limit),
    }
}

/** Summarise a finished queue for the summary screen */
export interface QueueSummary {
    total:    number
    done:     number
    warnings: number   // generated but has VeRO warning / missing data
    failed:   number
}

export function summariseQueue(rows: Array<{ _status: string; _message: string }>): QueueSummary {
    const done     = rows.filter(r => r._status === 'done').length
    const failed   = rows.filter(r => r._status === 'error').length
    const warnings = rows.filter(r => r._status === 'done' && r._message.toLowerCase().includes('warn')).length
    return { total: rows.length, done, warnings, failed }
}
