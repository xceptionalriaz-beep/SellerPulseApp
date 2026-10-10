'use client'
// app/dashboard/listing-generator/components/segments/SegmentItem.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Segment Sidebar: single segment row
//
// Layout:  [● icon]  [Name]  [count badge]  [edit · del on hover]
// • Active row gets purple bg tint + bold name
// • Built-in segments: no edit / delete buttons
// • Custom segments: pencil + trash appear on hover
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import {
    // field icons used by built-in segments
    LayoutList, Zap, FileText, Clock, CircleOff,
    ShieldX, ShieldAlert, HeartCrack, TrendingUp,
    CircleDollarSign, Hash, ScanBarcode, Type, Link, Camera,
    // actions
    Pencil, Trash2, Tag,
} from 'lucide-react'

import type { Segment } from '../../types/segments.types'

// ── Design tokens ─────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    dark: '#1e1535',
    muted: '#9ca3af',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
}

// ── Icon map (lucide name → component) ───────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
    LayoutList, Zap, FileText, Clock, CircleOff,
    ShieldX, ShieldAlert, HeartCrack, TrendingUp,
    CircleDollarSign, Hash, ScanBarcode, Type, Link, Camera,
    Tag,
}

function SegmentIcon({ name, color, size = 14 }: { name: string; color: string; size?: number }) {
    const Icon = ICON_MAP[name] ?? Tag
    return <Icon size={size} style={{ color, flexShrink: 0 }} />
}

// ── Props ─────────────────────────────────────────────────────
interface SegmentItemProps {
    segment: Segment
    isActive: boolean
    count: number
    onSelect: () => void
    onEdit?: () => void   // only for custom segments
    onDelete?: () => void   // only for custom segments
}

// ─────────────────────────────────────────────────────────────
export function SegmentItem({
    segment,
    isActive,
    count,
    onSelect,
    onEdit,
    onDelete,
}: SegmentItemProps) {
    const [hovered, setHovered] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const isCustom = !segment.isBuiltIn

    // ── Inline delete confirm ─────────────────────────────────
    async function handleDeleteConfirm() {
        if (!onDelete) return
        setDeleteLoading(true)
        await onDelete()
        setDeleteLoading(false)
        setDeleteConfirm(false)
    }

    // ─────────────────────────────────────────────────────────
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setDeleteConfirm(false) }}
            onClick={() => { if (!deleteConfirm) onSelect() }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 8,
                cursor: deleteConfirm ? 'default' : 'pointer',
                background: isActive ? C.primaryLight : hovered ? '#f3f0ff' : 'transparent',
                transition: 'background 0.12s',
                userSelect: 'none',
                minHeight: 32,
            }}
        >
            {/* ── Colored dot + icon ───────────────────────── */}
            <div
                style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: segment.color + '1a',   // 10% opacity tint
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                <SegmentIcon name={segment.icon} color={segment.color} size={13} />
            </div>

            {/* ── Name ─────────────────────────────────────── */}
            <span
                style={{
                    flex: 1,
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? C.primary : C.dark,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    minWidth: 0,
                }}
            >
                {segment.name}
            </span>

            {/* ── Delete confirm inline ─────────────────────── */}
            {deleteConfirm ? (
                <div
                    style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
                    onClick={e => e.stopPropagation()}
                >
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.danger }}>Delete?</span>
                    <button
                        onClick={() => setDeleteConfirm(false)}
                        style={{
                            fontSize: 11, padding: '1px 6px', borderRadius: 5,
                            border: `1px solid ${C.border}`, background: C.surface,
                            color: C.muted, cursor: 'pointer',
                        }}
                    >No</button>
                    <button
                        onClick={handleDeleteConfirm}
                        disabled={deleteLoading}
                        style={{
                            fontSize: 11, padding: '1px 6px', borderRadius: 5,
                            border: 'none', background: C.danger,
                            color: '#fff', cursor: deleteLoading ? 'not-allowed' : 'pointer',
                            opacity: deleteLoading ? 0.7 : 1,
                        }}
                    >{deleteLoading ? '…' : 'Yes'}</button>
                </div>
            ) : (
                <>
                    {/* ── Count badge ──────────────────────── */}
                    <span
                        style={{
                            fontSize: 11,
                            fontWeight: 500,
                            color: isActive ? C.primary : C.muted,
                            background: isActive ? C.primaryLight : C.bg,
                            border: `1px solid ${isActive ? C.primary + '33' : C.border}`,
                            borderRadius: 20,
                            padding: '1px 7px',
                            minWidth: 24,
                            textAlign: 'center',
                            flexShrink: 0,
                            lineHeight: '18px',
                        }}
                    >
                        {count}
                    </span>

                    {/* ── Edit / Delete (custom only, on hover) */}
                    {isCustom && hovered && (
                        <div
                            style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            {onEdit && (
                                <button
                                    onClick={onEdit}
                                    title="Edit segment"
                                    style={{
                                        width: 22, height: 22, borderRadius: 5,
                                        border: 'none', background: 'transparent',
                                        color: C.muted, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLButtonElement).style.background = C.primaryLight
                                            ; (e.currentTarget as HTMLButtonElement).style.color = C.primary
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                                            ; (e.currentTarget as HTMLButtonElement).style.color = C.muted
                                    }}
                                >
                                    <Pencil size={11} />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => setDeleteConfirm(true)}
                                    title="Delete segment"
                                    style={{
                                        width: 22, height: 22, borderRadius: 5,
                                        border: 'none', background: 'transparent',
                                        color: C.muted, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLButtonElement).style.background = C.dangerBg
                                            ; (e.currentTarget as HTMLButtonElement).style.color = C.danger
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                                            ; (e.currentTarget as HTMLButtonElement).style.color = C.muted
                                    }}
                                >
                                    <Trash2 size={11} />
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
