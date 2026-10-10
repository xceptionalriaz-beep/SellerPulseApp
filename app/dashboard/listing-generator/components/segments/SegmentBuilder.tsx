'use client'
// app/dashboard/listing-generator/components/segments/SegmentBuilder.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Segment Builder modal
//
// Used for both Create and Edit.
// Props:
//   • initialSegment — pre-filled when editing, undefined when creating
//   • listings       — all listings (for live preview count)
//   • onSave(payload) — called with the finished SegmentUpsert
//   • onClose        — closes the modal without saving
// ─────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react'
import { Plus, X, Users } from 'lucide-react'

import { FilterRow } from './FilterRow'
import { countMatches } from '../../lib/segment-filter'
import type { FilterableListing } from '../../lib/segment-filter'

import type {
    Segment,
    SegmentFilter,
    SegmentUpsert,
    FilterLogic,
} from '../../types/segments.types'
import { SEGMENT_COLORS } from '../../types/segments.types'

// ── Design tokens ─────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    borderInput: '#e5e0f5',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    dark: '#1e1535',
    muted: '#9ca3af',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
    success: '#16a34a',
    successBg: '#dcfce7',
}

// ── Icon palette (lucide names only — no emoji) ───────────────
const ICON_OPTIONS = [
    'Tag', 'Star', 'Bookmark', 'Heart', 'Flame', 'Zap',
    'TrendingUp', 'TrendingDown', 'BarChart2', 'Package',
    'ShoppingCart', 'DollarSign', 'Percent', 'Award',
    'AlertCircle', 'CheckCircle2', 'Clock', 'Calendar',
    'Globe', 'Layers', 'Filter', 'Search', 'Eye',
]

// ── Lucide dynamic render ─────────────────────────────────────
// We import only what's in ICON_OPTIONS to keep the bundle tight
import {
    Tag, Star, Bookmark, Heart, Flame, Zap,
    TrendingUp, TrendingDown, BarChart2, Package,
    ShoppingCart, DollarSign, Percent, Award,
    AlertCircle, CheckCircle2, Clock, Calendar,
    Globe, Layers, Filter, Search, Eye,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ElementType> = {
    Tag, Star, Bookmark, Heart, Flame, Zap,
    TrendingUp, TrendingDown, BarChart2, Package,
    ShoppingCart, DollarSign, Percent, Award,
    AlertCircle, CheckCircle2, Clock, Calendar,
    Globe, Layers, Filter, Search, Eye,
}

function DynIcon({ name, size = 14, color }: { name: string; size?: number; color?: string }) {
    const Icon = ICON_MAP[name] ?? Tag
    return <Icon size={size} style={{ color: color ?? 'inherit' }} />
}

// ── Default empty filter ──────────────────────────────────────
function emptyFilter(): SegmentFilter {
    return { field: 'status', op: 'eq', value: 'published' }
}

// ── Props ─────────────────────────────────────────────────────
interface SegmentBuilderProps {
    initialSegment?: Segment          // undefined = create mode
    listings: FilterableListing[]
    onSave: (payload: SegmentUpsert) => Promise<void>
    onClose: () => void
}

// ─────────────────────────────────────────────────────────────
export function SegmentBuilder({
    initialSegment,
    listings,
    onSave,
    onClose,
}: SegmentBuilderProps) {

    const isEdit = !!initialSegment

    // ── Form state ────────────────────────────────────────────
    const [name, setName] = useState(initialSegment?.name ?? '')
    const [icon, setIcon] = useState(initialSegment?.icon ?? 'Tag')
    const [color, setColor] = useState(initialSegment?.color ?? C.primary)
    const [logic, setLogic] = useState<FilterLogic>(initialSegment?.logic ?? 'AND')
    const [filters, setFilters] = useState<SegmentFilter[]>(
        initialSegment?.filters.length ? initialSegment.filters : [emptyFilter()]
    )
    const [saving, setSaving] = useState(false)
    const [nameErr, setNameErr] = useState('')

    // ── Live preview count ────────────────────────────────────
    const previewCount = useMemo(
        () => countMatches(listings, filters, logic),
        [listings, filters, logic],
    )

    // ── Filter CRUD ───────────────────────────────────────────
    function addFilter() {
        setFilters(prev => [...prev, emptyFilter()])
    }

    function updateFilter(index: number, updated: SegmentFilter) {
        setFilters(prev => prev.map((f, i) => i === index ? updated : f))
    }

    function removeFilter(index: number) {
        setFilters(prev => prev.filter((_, i) => i !== index))
    }

    // ── Save ──────────────────────────────────────────────────
    async function handleSave() {
        if (!name.trim()) { setNameErr('Name is required'); return }
        setNameErr('')
        setSaving(true)
        await onSave({
            name: name.trim(),
            icon,
            color,
            filters,
            logic,
        })
        setSaving(false)
    }

    // ── Shared input style ────────────────────────────────────
    const inputSt: React.CSSProperties = {
        width: '100%',
        height: 36,
        padding: '0 12px',
        borderRadius: 8,
        border: `1.5px solid ${nameErr ? C.danger : C.borderInput}`,
        background: C.surface,
        color: C.dark,
        fontSize: 14,
        outline: 'none',
        boxSizing: 'border-box',
    }

    // ─────────────────────────────────────────────────────────
    return (
        /* ── Backdrop ──────────────────────────────────────── */
        <div
            onClick={e => { if (e.target === e.currentTarget) onClose() }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(30,21,53,0.45)',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
            }}
        >
            {/* ── Modal panel ─────────────────────────────── */}
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: 500,
                    maxWidth: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    background: C.surface,
                    borderRadius: 16,
                    boxShadow: '0 20px 60px rgba(117,48,251,0.18)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* ── Header ──────────────────────────────── */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px 20px 14px',
                    borderBottom: `1px solid ${C.border}`,
                    flexShrink: 0,
                }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>
                        {isEdit ? 'Edit Segment' : 'New Segment'}
                    </span>
                    <button
                        onClick={onClose}
                        style={{
                            width: 28, height: 28, borderRadius: 7,
                            border: 'none', background: C.bg,
                            color: C.muted, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    ><X size={14} /></button>
                </div>

                {/* ── Body ────────────────────────────────── */}
                <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>

                    {/* Name */}
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 6 }}>
                            SEGMENT NAME
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => { setName(e.target.value); setNameErr('') }}
                            placeholder="e.g. High-value drafts"
                            style={inputSt}
                            autoFocus
                        />
                        {nameErr && (
                            <p style={{ fontSize: 11, color: C.danger, marginTop: 4 }}>{nameErr}</p>
                        )}
                    </div>

                    {/* Icon + Color row */}
                    <div style={{ display: 'flex', gap: 16 }}>

                        {/* Icon picker */}
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 6 }}>
                                ICON
                            </label>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 5,
                                padding: 10,
                                borderRadius: 8,
                                border: `1.5px solid ${C.borderInput}`,
                                background: C.bg,
                                maxHeight: 110,
                                overflowY: 'auto',
                            }}>
                                {ICON_OPTIONS.map(ic => (
                                    <button
                                        key={ic}
                                        type="button"
                                        onClick={() => setIcon(ic)}
                                        title={ic}
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: 6,
                                            border: icon === ic ? `2px solid ${color}` : `1.5px solid ${C.border}`,
                                            background: icon === ic ? color + '1a' : C.surface,
                                            color: icon === ic ? color : C.muted,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <DynIcon name={ic} size={13} color={icon === ic ? color : undefined} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color picker */}
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 6 }}>
                                COLOR
                            </label>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 5,
                                padding: 10,
                                borderRadius: 8,
                                border: `1.5px solid ${C.borderInput}`,
                                background: C.bg,
                            }}>
                                {/* Two columns of swatches */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 5 }}>
                                    {SEGMENT_COLORS.map(hex => (
                                        <button
                                            key={hex}
                                            type="button"
                                            onClick={() => setColor(hex)}
                                            style={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: 6,
                                                border: color === hex
                                                    ? `3px solid ${C.dark}`
                                                    : '2px solid transparent',
                                                background: hex,
                                                cursor: 'pointer',
                                                outline: color === hex ? `2px solid ${hex}` : 'none',
                                                outlineOffset: 2,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logic toggle + preview */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>MATCH</span>
                            {(['AND', 'OR'] as FilterLogic[]).map(l => (
                                <button
                                    key={l}
                                    type="button"
                                    onClick={() => setLogic(l)}
                                    style={{
                                        height: 28,
                                        padding: '0 12px',
                                        borderRadius: 6,
                                        border: logic === l ? 'none' : `1.5px solid ${C.border}`,
                                        background: logic === l ? C.primary : C.surface,
                                        color: logic === l ? '#fff' : C.muted,
                                        fontSize: 12,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >{l}</button>
                            ))}
                            <span style={{ fontSize: 12, color: C.muted }}>filters</span>
                        </div>

                        {/* Live count */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 10px',
                            borderRadius: 20,
                            background: C.primaryLight,
                            border: `1px solid ${C.primary}33`,
                        }}>
                            <Users size={11} style={{ color: C.primary }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.primary }}>
                                {previewCount} listing{previewCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    {/* Filter rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>
                            FILTERS
                        </label>

                        {filters.length === 0 ? (
                            <div style={{
                                padding: '14px 0',
                                textAlign: 'center',
                                fontSize: 13,
                                color: C.muted,
                                borderRadius: 8,
                                border: `1.5px dashed ${C.border}`,
                            }}>
                                No filters — this segment will match all listings.
                            </div>
                        ) : (
                            filters.map((f, i) => (
                                <FilterRow
                                    key={i}
                                    filter={f}
                                    index={i}
                                    onChange={updateFilter}
                                    onRemove={removeFilter}
                                />
                            ))
                        )}

                        <button
                            type="button"
                            onClick={addFilter}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 5,
                                height: 32,
                                borderRadius: 8,
                                border: `1.5px dashed ${C.primary}55`,
                                background: C.primaryLight,
                                color: C.primary,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                width: '100%',
                            }}
                        >
                            <Plus size={13} />
                            Add filter
                        </button>
                    </div>
                </div>

                {/* ── Footer ──────────────────────────────── */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 8,
                    padding: '14px 20px',
                    borderTop: `1px solid ${C.border}`,
                    flexShrink: 0,
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        style={{
                            height: 36,
                            padding: '0 16px',
                            borderRadius: 8,
                            border: `1.5px solid ${C.border}`,
                            background: C.surface,
                            color: C.muted,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: saving ? 'not-allowed' : 'pointer',
                        }}
                    >Cancel</button>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            height: 36,
                            padding: '0 20px',
                            borderRadius: 8,
                            border: 'none',
                            background: saving ? C.muted : C.primary,
                            color: '#fff',
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Segment'}
                    </button>
                </div>
            </div>
        </div>
    )
}
