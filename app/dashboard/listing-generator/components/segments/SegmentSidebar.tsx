'use client'
// app/dashboard/listing-generator/components/segments/SegmentSidebar.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Listing Segments: left sidebar
//
// • Groups: Overview, Status, VeRO, Quality, Source, My Segments
// • Collapse / expand — slides fully off-screen to the left;
//   a small arrow tab stays visible so the user can bring it back
// • "+ New Segment" opens SegmentBuilder in create mode
// • Edit icon on custom segments opens SegmentBuilder in edit mode
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import { Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

import { SegmentItem } from './SegmentItem'
import { SegmentBuilder } from './SegmentBuilder'
import { countMatches } from '../../lib/segment-filter'
import type { FilterableListing } from '../../lib/segment-filter'

import { SEGMENT_GROUPS } from '../../data/built-in-segments'
import { BUILT_IN_SEGMENT_MAP } from '../../data/built-in-segments'
import type { Segment, CustomSegment, SegmentUpsert } from '../../types/segments.types'

// ── Design tokens ─────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    dark: '#1e1535',
    muted: '#9ca3af',
}

const SIDEBAR_W = 220   // px when expanded

// ── Props ─────────────────────────────────────────────────────
interface SegmentSidebarProps {
    segments: Segment[]
    customSegments: CustomSegment[]
    activeSegmentId: string
    listings: FilterableListing[]
    loading: boolean
    onSelect: (id: string) => void
    onCreateSegment: (payload: SegmentUpsert) => Promise<void>
    onUpdateSegment: (id: string, payload: Partial<SegmentUpsert>) => Promise<void>
    onDeleteSegment: (id: string) => Promise<void>
}

// ─────────────────────────────────────────────────────────────
export function SegmentSidebar({
    segments,
    customSegments,
    activeSegmentId,
    listings,
    loading,
    onSelect,
    onCreateSegment,
    onUpdateSegment,
    onDeleteSegment,
}: SegmentSidebarProps) {

    const [collapsed, setCollapsed] = useState(false)
    const [builderOpen, setBuilderOpen] = useState(false)
    const [editingSegment, setEditingSegment] = useState<CustomSegment | null>(null)

    // ── Count for each segment ────────────────────────────────
    function getCount(seg: Segment): number {
        return countMatches(listings, seg.filters, seg.logic)
    }

    // ── Save from builder ─────────────────────────────────────
    async function handleSave(payload: SegmentUpsert) {
        if (editingSegment) {
            await onUpdateSegment(editingSegment.id, payload)
        } else {
            await onCreateSegment(payload)
        }
        setBuilderOpen(false)
        setEditingSegment(null)
    }

    function openCreate() {
        setEditingSegment(null)
        setBuilderOpen(true)
    }

    function openEdit(seg: CustomSegment) {
        setEditingSegment(seg)
        setBuilderOpen(true)
    }

    // ── Built-in group segment lookup ─────────────────────────
    function builtInById(id: string): Segment | undefined {
        return BUILT_IN_SEGMENT_MAP[id]
    }

    // ─────────────────────────────────────────────────────────
    return (
        <>
            {/* ── Sidebar + collapse tab wrapper ──────────── */}
            <div style={{ position: 'relative', flexShrink: 0 }}>

                {/* ── Sidebar panel ───────────────────────── */}
                <div
                    style={{
                        width: collapsed ? 0 : SIDEBAR_W,
                        minWidth: collapsed ? 0 : SIDEBAR_W,
                        overflowX: 'hidden',
                        overflowY: collapsed ? 'hidden' : 'auto',
                        transition: 'width 0.22s ease, min-width 0.22s ease',
                        background: C.surface,
                        borderRight: collapsed ? 'none' : `1px solid ${C.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                    }}
                >
                    {/* Inner — only rendered when open to avoid layout bleed */}
                    <div style={{ width: SIDEBAR_W, display: 'flex', flexDirection: 'column', height: '100%' }}>

                        {/* ── Sidebar header ───────────────── */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 12px 10px',
                            flexShrink: 0,
                        }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: '0.06em' }}>
                                SEGMENTS
                            </span>

                            {/* Collapse button (inside header) */}
                            <button
                                onClick={() => setCollapsed(true)}
                                title="Collapse sidebar"
                                style={{
                                    width: 24, height: 24, borderRadius: 6,
                                    border: `1px solid ${C.border}`,
                                    background: C.bg, color: C.muted,
                                    cursor: 'pointer', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <ChevronLeft size={13} />
                            </button>
                        </div>

                        {/* ── Segment groups ───────────────── */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>

                            {loading ? (
                                <div style={{ padding: '24px 0', display: 'flex', justifyContent: 'center' }}>
                                    <Loader2 size={16} style={{ color: C.muted, animation: 'spin 1s linear infinite' }} />
                                </div>
                            ) : (
                                <>
                                    {/* Built-in groups */}
                                    {SEGMENT_GROUPS.map(group => {
                                        const groupSegs = group.ids
                                            .map(id => builtInById(id))
                                            .filter(Boolean) as Segment[]
                                        if (groupSegs.length === 0) return null
                                        return (
                                            <div key={group.label} style={{ marginBottom: 14 }}>
                                                <div style={{
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    color: C.muted,
                                                    letterSpacing: '0.07em',
                                                    padding: '2px 2px 4px',
                                                }}>
                                                    {group.label.toUpperCase()}
                                                </div>
                                                {groupSegs.map(seg => (
                                                    <SegmentItem
                                                        key={seg.id}
                                                        segment={seg}
                                                        isActive={activeSegmentId === seg.id}
                                                        count={getCount(seg)}
                                                        onSelect={() => onSelect(seg.id)}
                                                    />
                                                ))}
                                            </div>
                                        )
                                    })}

                                    {/* My Segments (custom) */}
                                    <div style={{ marginBottom: 14 }}>
                                        <div style={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: C.muted,
                                            letterSpacing: '0.07em',
                                            padding: '2px 2px 4px',
                                        }}>
                                            MY SEGMENTS
                                        </div>

                                        {customSegments.length === 0 ? (
                                            <div style={{
                                                fontSize: 12, color: C.muted,
                                                padding: '6px 4px',
                                                fontStyle: 'italic',
                                            }}>
                                                No custom segments yet.
                                            </div>
                                        ) : (
                                            customSegments.map(seg => (
                                                <SegmentItem
                                                    key={seg.id}
                                                    segment={seg}
                                                    isActive={activeSegmentId === seg.id}
                                                    count={getCount(seg)}
                                                    onSelect={() => onSelect(seg.id)}
                                                    onEdit={() => openEdit(seg)}
                                                    onDelete={() => onDeleteSegment(seg.id)}
                                                />
                                            ))
                                        )}

                                        {/* New segment button */}
                                        <button
                                            type="button"
                                            onClick={openCreate}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 5,
                                                width: '100%',
                                                padding: '5px 8px',
                                                marginTop: 4,
                                                borderRadius: 7,
                                                border: `1.5px dashed ${C.primary}55`,
                                                background: 'transparent',
                                                color: C.primary,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                            }}
                                        >
                                            <Plus size={12} />
                                            New Segment
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Expand tab (visible only when collapsed) ── */}
                {collapsed && (
                    <button
                        onClick={() => setCollapsed(false)}
                        title="Expand sidebar"
                        style={{
                            position: 'absolute',
                            top: 12,
                            left: 0,
                            width: 22,
                            height: 48,
                            borderRadius: '0 8px 8px 0',
                            border: `1px solid ${C.border}`,
                            borderLeft: 'none',
                            background: C.surface,
                            color: C.muted,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '2px 0 8px rgba(117,48,251,0.08)',
                            zIndex: 10,
                        }}
                    >
                        <ChevronRight size={13} />
                    </button>
                )}
            </div>

            {/* ── Segment builder modal ────────────────────── */}
            {builderOpen && (
                <SegmentBuilder
                    initialSegment={editingSegment ?? undefined}
                    listings={listings}
                    onSave={handleSave}
                    onClose={() => { setBuilderOpen(false); setEditingSegment(null) }}
                />
            )}
        </>
    )
}
