'use client'
// app/dashboard/listing-generator/components/columns/ColumnPanel.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Column Manager Panel
//
// Right-side slide-in drawer that lets the user:
//   • Check / uncheck columns to show or hide them
//   • Drag visible columns to reorder them (HTML5 drag, no deps)
//   • Reset to segment defaults
//
// Props:
//   open            — whether the panel is visible
//   onClose         — callback to hide it
//   allColumns      — full COLUMN_DEFS list
//   visibleIds      — currently visible column ids (ordered)
//   isDefault       — true when config matches segment defaults
//   onToggle(id)    — show/hide a column
//   onMove(from,to) — reorder within visible list
//   onReset()       — reset to segment defaults
// ─────────────────────────────────────────────────────────────

import { useRef } from 'react'
import { X, GripVertical, RotateCcw, Eye, EyeOff } from 'lucide-react'
import type { ColumnDef, ColumnGroup } from '../../data/column-definitions'
import { GROUP_LABELS } from '../../data/column-definitions'

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
    secondary: '#6b7280',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
    success: '#16a34a',
    successBg: '#dcfce7',
}

interface ColumnPanelProps {
    open: boolean
    onClose: () => void
    allColumns: ColumnDef[]
    visibleIds: string[]
    isDefault: boolean
    onToggle: (id: string) => void
    onMove: (fromIdx: number, toIdx: number) => void
    onReset: () => void
}

// ── Group badge colours ────────────────────────────────────────
const GROUP_COLORS: Record<ColumnGroup, { bg: string; text: string }> = {
    product: { bg: C.primaryLight, text: C.primary },
    pricing: { bg: C.successBg, text: C.success },
    performance: { bg: '#fef3c7', text: '#d97706' },
    status: { bg: '#e0f2fe', text: '#0ea5e9' },
    identifiers: { bg: '#f3f4f6', text: '#6b7280' },
}

// ─────────────────────────────────────────────────────────────
export function ColumnPanel({
    open,
    onClose,
    allColumns,
    visibleIds,
    isDefault,
    onToggle,
    onMove,
    onReset,
}: ColumnPanelProps) {

    // ── Drag state via refs (no re-render during drag) ────────
    const dragIdx = useRef<number | null>(null)
    const dragOverIdx = useRef<number | null>(null)

    function handleDragStart(idx: number) {
        dragIdx.current = idx
    }

    function handleDragOver(e: React.DragEvent, idx: number) {
        e.preventDefault()
        dragOverIdx.current = idx
    }

    function handleDrop() {
        if (dragIdx.current === null || dragOverIdx.current === null) return
        if (dragIdx.current !== dragOverIdx.current) {
            onMove(dragIdx.current, dragOverIdx.current)
        }
        dragIdx.current = null
        dragOverIdx.current = null
    }

    // ── Separate visible + hidden columns ─────────────────────
    const visibleCols = visibleIds
        .map(id => allColumns.find(c => c.id === id))
        .filter(Boolean) as ColumnDef[]

    const hiddenCols = allColumns.filter(c => !visibleIds.includes(c.id))

    // ── Group hidden columns by their group ───────────────────
    const hiddenByGroup = hiddenCols.reduce<Record<ColumnGroup, ColumnDef[]>>(
        (acc, col) => {
            acc[col.group] = acc[col.group] ?? []
            acc[col.group].push(col)
            return acc
        },
        {} as Record<ColumnGroup, ColumnDef[]>,
    )

    const orderedGroups = (Object.keys(GROUP_LABELS) as ColumnGroup[]).filter(
        g => hiddenByGroup[g]?.length > 0,
    )

    // ─────────────────────────────────────────────────────────
    if (!open) return null

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 40,
                    background: 'rgba(30,21,53,0.15)',
                }}
            />

            {/* Panel */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: 300,
                    zIndex: 41,
                    background: C.surface,
                    borderLeft: `1px solid ${C.border}`,
                    boxShadow: '-8px 0 32px rgba(117,48,251,0.10)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 16px 12px',
                    borderBottom: `1px solid ${C.border}`,
                    flexShrink: 0,
                }}>
                    <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: C.dark, margin: 0 }}>
                            Columns
                        </p>
                        <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 0', fontFamily: 'DM Sans, sans-serif' }}>
                            {visibleIds.length} of {allColumns.length} visible
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {!isDefault && (
                            <button
                                type="button"
                                onClick={onReset}
                                title="Reset to defaults"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    height: 28,
                                    padding: '0 10px',
                                    borderRadius: 7,
                                    border: `1.5px solid ${C.border}`,
                                    background: C.bg,
                                    color: C.secondary,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                <RotateCcw size={11} />
                                Reset
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: 7,
                                border: 'none',
                                background: C.bg,
                                color: C.muted,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* Scrollable body */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '12px 12px 20px',
                }}>

                    {/* ── VISIBLE columns (draggable) ───────────── */}
                    <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6, padding: '0 4px' }}>
                        Visible · drag to reorder
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {visibleCols.map((col, idx) => {
                            const gc = GROUP_COLORS[col.group]
                            return (
                                <div
                                    key={col.id}
                                    draggable
                                    onDragStart={() => handleDragStart(idx)}
                                    onDragOver={e => handleDragOver(e, idx)}
                                    onDrop={handleDrop}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '7px 8px',
                                        borderRadius: 8,
                                        border: `1.5px solid ${C.border}`,
                                        background: C.surface,
                                        cursor: 'grab',
                                        userSelect: 'none',
                                    }}
                                >
                                    {/* Drag handle */}
                                    <GripVertical size={13} style={{ color: C.muted, flexShrink: 0 }} />

                                    {/* Group badge */}
                                    <span style={{
                                        fontSize: 9,
                                        fontWeight: 700,
                                        padding: '1px 5px',
                                        borderRadius: 4,
                                        background: gc.bg,
                                        color: gc.text,
                                        flexShrink: 0,
                                        letterSpacing: '0.04em',
                                        textTransform: 'uppercase',
                                    }}>
                                        {col.group === 'product' ? 'Prod' :
                                            col.group === 'pricing' ? '£' :
                                                col.group === 'performance' ? 'Perf' :
                                                    col.group === 'status' ? 'Stat' :
                                                        'ID'}
                                    </span>

                                    {/* Label */}
                                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                                        {col.label}
                                    </span>

                                    {/* Hide button */}
                                    <button
                                        type="button"
                                        onClick={() => onToggle(col.id)}
                                        title="Hide column"
                                        style={{
                                            flexShrink: 0,
                                            width: 22,
                                            height: 22,
                                            borderRadius: 5,
                                            border: 'none',
                                            background: 'transparent',
                                            color: C.muted,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLElement).style.background = C.dangerBg
                                                ; (e.currentTarget as HTMLElement).style.color = C.danger
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLElement).style.background = 'transparent'
                                                ; (e.currentTarget as HTMLElement).style.color = C.muted
                                        }}
                                    >
                                        <EyeOff size={11} />
                                    </button>
                                </div>
                            )
                        })}
                    </div>

                    {/* ── HIDDEN columns (grouped) ──────────────── */}
                    {hiddenCols.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6, padding: '0 4px' }}>
                                Hidden · click to show
                            </p>

                            {orderedGroups.map(group => (
                                <div key={group} style={{ marginBottom: 10 }}>
                                    {/* Group header */}
                                    <p style={{ fontSize: 10, fontWeight: 600, color: C.muted, margin: '0 0 4px 4px', fontFamily: 'DM Sans, sans-serif' }}>
                                        {GROUP_LABELS[group]}
                                    </p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {hiddenByGroup[group].map(col => {
                                            const gc = GROUP_COLORS[col.group]
                                            return (
                                                <div
                                                    key={col.id}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 8,
                                                        padding: '7px 8px',
                                                        borderRadius: 8,
                                                        border: `1.5px dashed ${C.border}`,
                                                        background: C.bg,
                                                        opacity: 0.8,
                                                    }}
                                                >
                                                    {/* Group badge */}
                                                    <span style={{
                                                        fontSize: 9,
                                                        fontWeight: 700,
                                                        padding: '1px 5px',
                                                        borderRadius: 4,
                                                        background: gc.bg,
                                                        color: gc.text,
                                                        flexShrink: 0,
                                                        letterSpacing: '0.04em',
                                                        textTransform: 'uppercase',
                                                    }}>
                                                        {col.group === 'product' ? 'Prod' :
                                                            col.group === 'pricing' ? '£' :
                                                                col.group === 'performance' ? 'Perf' :
                                                                    col.group === 'status' ? 'Stat' :
                                                                        'ID'}
                                                    </span>

                                                    {/* Label */}
                                                    <span style={{ flex: 1, fontSize: 13, fontWeight: 400, color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                                        {col.label}
                                                    </span>

                                                    {/* Show button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => onToggle(col.id)}
                                                        title="Show column"
                                                        style={{
                                                            flexShrink: 0,
                                                            width: 22,
                                                            height: 22,
                                                            borderRadius: 5,
                                                            border: 'none',
                                                            background: 'transparent',
                                                            color: C.muted,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                        onMouseEnter={e => {
                                                            (e.currentTarget as HTMLElement).style.background = C.primaryLight
                                                                ; (e.currentTarget as HTMLElement).style.color = C.primary
                                                        }}
                                                        onMouseLeave={e => {
                                                            (e.currentTarget as HTMLElement).style.background = 'transparent'
                                                                ; (e.currentTarget as HTMLElement).style.color = C.muted
                                                        }}
                                                    >
                                                        <Eye size={11} />
                                                    </button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>

                {/* Footer hint */}
                <div style={{
                    padding: '10px 16px',
                    borderTop: `1px solid ${C.border}`,
                    flexShrink: 0,
                }}>
                    <p style={{ fontSize: 11, color: C.muted, margin: 0, textAlign: 'center', fontFamily: 'DM Sans, sans-serif' }}>
                        Columns auto-save · per segment
                    </p>
                </div>
            </div>
        </>
    )
}
