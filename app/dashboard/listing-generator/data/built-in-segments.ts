// app/dashboard/listing-generator/data/built-in-segments.ts
// ─────────────────────────────────────────────────────────────
// Riazify — Built-in Listing Segments
// These are hardcoded — users cannot edit or delete them.
// Pure data file: no React, no Supabase, no side-effects.
// ─────────────────────────────────────────────────────────────

import type { BuiltInSegment } from '../types/segments.types'

export const BUILT_IN_SEGMENTS: BuiltInSegment[] = [

    // ── Overview ──────────────────────────────────────────────

    {
        id: 'all',
        name: 'All Listings',
        icon: 'LayoutList',
        color: '#7530fb',
        filters: [],           // no filter = show everything
        logic: 'AND',
        isBuiltIn: true,
    },

    // ── By status ─────────────────────────────────────────────

    {
        id: 'active',
        name: 'Active',
        icon: 'Zap',
        color: '#22c55e',
        filters: [{ field: 'status', op: 'eq', value: 'published' }],
        logic: 'AND',
        isBuiltIn: true,
    },
    {
        id: 'drafts',
        name: 'Drafts',
        icon: 'FileText',
        color: '#7530fb',
        filters: [{ field: 'status', op: 'eq', value: 'draft' }],
        logic: 'AND',
        isBuiltIn: true,
    },
    {
        id: 'scheduled',
        name: 'Scheduled',
        icon: 'Clock',
        color: '#3b82f6',
        filters: [{ field: 'status', op: 'eq', value: 'scheduled' }],
        logic: 'AND',
        isBuiltIn: true,
    },
    {
        id: 'ended',
        name: 'Ended',
        icon: 'CircleOff',
        color: '#6b7280',
        filters: [{ field: 'status', op: 'eq', value: 'ended' }],
        logic: 'AND',
        isBuiltIn: true,
    },

    // ── VeRO ──────────────────────────────────────────────────

    {
        id: 'vero_flagged',
        name: 'VeRO Flagged',
        icon: 'ShieldX',
        color: '#ef4444',
        filters: [{ field: 'vero_status', op: 'eq', value: 'flagged' }],
        logic: 'AND',
        isBuiltIn: true,
    },
    {
        id: 'vero_warning',
        name: 'VeRO Warning',
        icon: 'ShieldAlert',
        color: '#f59e0b',
        filters: [{ field: 'vero_status', op: 'eq', value: 'warning' }],
        logic: 'AND',
        isBuiltIn: true,
    },

    // ── Health ────────────────────────────────────────────────

    {
        id: 'low_health',
        name: 'Low Health',
        icon: 'HeartCrack',
        color: '#ef4444',
        filters: [{ field: 'health_score', op: 'lt', value: 40 }],
        logic: 'AND',
        isBuiltIn: true,
    },

    // ── Profitability ─────────────────────────────────────────

    {
        id: 'high_margin',
        name: 'High Margin',
        icon: 'TrendingUp',
        color: '#22c55e',
        filters: [{ field: 'margin', op: 'gte', value: 30 }],
        logic: 'AND',
        isBuiltIn: true,
    },
    {
        id: 'no_price',
        name: 'No Price Set',
        icon: 'CircleDollarSign',
        color: '#f59e0b',
        filters: [{ field: 'sell_price', op: 'is_empty' }],
        logic: 'AND',
        isBuiltIn: true,
    },

    // ── Data quality ──────────────────────────────────────────

    {
        id: 'missing_sku',
        name: 'Missing SKU',
        icon: 'Hash',
        color: '#f97316',
        filters: [{ field: 'sku', op: 'is_empty' }],
        logic: 'AND',
        isBuiltIn: true,
    },

    // ── By source ─────────────────────────────────────────────

    {
        id: 'from_barcode',
        name: 'Barcode AI',
        icon: 'ScanBarcode',
        color: '#8b5cf6',
        filters: [{ field: 'source_platform', op: 'eq', value: 'barcode_import' }],
        logic: 'AND',
        isBuiltIn: true,
    },
    {
        id: 'from_title',
        name: 'Title AI',
        icon: 'Type',
        color: '#14b8a6',
        filters: [{ field: 'source_platform', op: 'eq', value: 'title_import' }],
        logic: 'AND',
        isBuiltIn: true,
    },
    {
        id: 'from_url',
        name: 'URL AI',
        icon: 'Link',
        color: '#3b82f6',
        filters: [{ field: 'source_platform', op: 'eq', value: 'url_import' }],
        logic: 'AND',
        isBuiltIn: true,
    },
    {
        id: 'from_photo',
        name: 'Photo AI',
        icon: 'Camera',
        color: '#ec4899',
        filters: [{ field: 'source_platform', op: 'eq', value: 'image_import' }],
        logic: 'AND',
        isBuiltIn: true,
    },
]

// ── Quick lookup by id ────────────────────────────────────────
export const BUILT_IN_SEGMENT_MAP = Object.fromEntries(
    BUILT_IN_SEGMENTS.map(s => [s.id, s])
) as Record<string, BuiltInSegment>

// ── Groups for sidebar rendering ──────────────────────────────
export const SEGMENT_GROUPS: { label: string; ids: string[] }[] = [
    {
        label: 'Overview',
        ids: ['all'],
    },
    {
        label: 'Status',
        ids: ['active', 'drafts', 'scheduled', 'ended'],
    },
    {
        label: 'VeRO',
        ids: ['vero_flagged', 'vero_warning'],
    },
    {
        label: 'Quality',
        ids: ['low_health', 'high_margin', 'no_price', 'missing_sku'],
    },
    {
        label: 'Source',
        ids: ['from_barcode', 'from_title', 'from_url', 'from_photo'],
    },
]
