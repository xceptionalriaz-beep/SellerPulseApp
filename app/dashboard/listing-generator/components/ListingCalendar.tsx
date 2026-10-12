'use client'
// app/dashboard/listing-generator/components/ListingCalendar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Listing Studio — Listing Calendar
// Shows scheduled listing_drafts in a week / month grid.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react'
import {
    ChevronLeft, ChevronRight, Calendar, Clock,
    RefreshCw, ExternalLink, Tag, Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

// ── Design tokens ─────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    borderInput: '#e5e0f5',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    accent: '#b8fa33',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    success: '#16a34a',
    successBg: '#dcfce7',
    warning: '#d97706',
    warningBg: '#fef3c7',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
}

interface ScheduledDraft {
    id: string
    title: string | null
    product_name: string | null
    publish_at: string          // ISO string
    status: string
    sell_price: number | null
    main_photo_url: string | null
}

type ViewMode = 'month' | 'week'

// ── Helpers ───────────────────────────────────────────────────
function startOfWeek(d: Date): Date {
    const copy = new Date(d)
    const day = copy.getDay()          // 0 = Sun
    copy.setDate(copy.getDate() - day)
    copy.setHours(0, 0, 0, 0)
    return copy
}

function startOfMonth(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), 1)
}

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function formatMonthYear(d: Date) {
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

// ── Draft pill ────────────────────────────────────────────────
function DraftPill({ draft, onClick }: { draft: ScheduledDraft; onClick: () => void }) {
    const label = draft.title || draft.product_name || 'Untitled'
    return (
        <button
            onClick={onClick}
            className="w-full text-left truncate px-1.5 py-0.5 rounded-md text-[10px] font-semibold transition-all hover:opacity-80"
            style={{
                backgroundColor: C.primaryLight,
                color: C.primary,
                border: `1px solid ${C.border}`,
                fontFamily: 'DM Sans, sans-serif',
            }}
            title={`${label} — ${formatTime(draft.publish_at)}`}>
            {formatTime(draft.publish_at)} · {label}
        </button>
    )
}

// ── Detail popover ─────────────────────────────────────────────
function DraftDetail({ draft, onClose, onEdit }: {
    draft: ScheduledDraft
    onClose: () => void
    onEdit: (id: string) => void
}) {
    const label = draft.title || draft.product_name || 'Untitled'
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
            onClick={onClose}>
            <div
                className="w-full max-w-sm rounded-2xl overflow-hidden shadow-xl"
                style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
                onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center gap-2 px-4 py-3"
                    style={{ backgroundColor: C.primaryLight, borderBottom: `1px solid ${C.border}` }}>
                    <Calendar size={14} style={{ color: C.primary }} />
                    <p className="text-[13px] font-bold flex-1 truncate"
                        style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>{label}</p>
                    <button onClick={onClose}
                        className="text-[12px] px-2 py-0.5 rounded-lg hover:opacity-70 transition-all"
                        style={{ color: C.muted }}>✕</button>
                </div>
                {/* Body */}
                <div className="p-4 flex flex-col gap-3">
                    {draft.main_photo_url && (
                        <img src={draft.main_photo_url} alt={label}
                            className="w-full rounded-xl object-cover"
                            style={{ height: 120, border: `1px solid ${C.border}` }} />
                    )}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                            <Clock size={12} style={{ color: C.primary }} />
                            <p className="text-[12px]" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                {new Date(draft.publish_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                        </div>
                        {draft.sell_price != null && (
                            <div className="flex items-center gap-2">
                                <Tag size={12} style={{ color: C.success }} />
                                <p className="text-[12px] font-bold" style={{ color: C.success, fontFamily: 'DM Sans, sans-serif' }}>
                                    ${draft.sell_price.toFixed(2)}
                                </p>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                style={{
                                    backgroundColor: draft.status === 'scheduled' ? C.primaryLight : C.successBg,
                                    color: draft.status === 'scheduled' ? C.primary : C.success,
                                }}>
                                {draft.status}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => onEdit(draft.id)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-[12px] transition-all hover:opacity-90"
                        style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'Syne, sans-serif' }}>
                        <ExternalLink size={12} /> Open in Studio
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Main component ─────────────────────────────────────────────
interface Props {
    onEditDraft?: (draftId: string) => void
}

export default function ListingCalendar({ onEditDraft }: Props) {
    const supabase = createClient()
    const [view, setView] = useState<ViewMode>('month')
    const [anchor, setAnchor] = useState(new Date())   // the "current" reference date
    const [drafts, setDrafts] = useState<ScheduledDraft[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<ScheduledDraft | null>(null)

    // ── Load scheduled drafts ──────────────────────────────────
    const load = useCallback(async () => {
        setLoading(true)
        const { data, error } = await (supabase.from('listing_drafts') as any)
            .select('id, title, product_name, publish_at, status, sell_price, main_photo_url')
            .not('publish_at', 'is', null)
            .order('publish_at', { ascending: true })
        if (!error && data) setDrafts(data as ScheduledDraft[])
        setLoading(false)
    }, [])

    useEffect(() => { load() }, [load])

    // ── Build the grid cells ───────────────────────────────────
    function draftsOnDay(day: Date) {
        return drafts.filter(d => isSameDay(new Date(d.publish_at), day))
    }

    // ── MONTH view helpers ─────────────────────────────────────
    function monthDays(): Date[] {
        const first = startOfMonth(anchor)
        const startPad = first.getDay()                    // 0–6
        const daysInMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate()
        const cells: Date[] = []
        // Leading padding from prev month
        for (let i = startPad - 1; i >= 0; i--) {
            const d = new Date(first)
            d.setDate(d.getDate() - (i + 1))
            cells.push(d)
        }
        for (let i = 1; i <= daysInMonth; i++) {
            cells.push(new Date(anchor.getFullYear(), anchor.getMonth(), i))
        }
        // Trailing padding to fill last row
        while (cells.length % 7 !== 0) {
            const d = new Date(cells[cells.length - 1])
            d.setDate(d.getDate() + 1)
            cells.push(d)
        }
        return cells
    }

    // ── WEEK view helpers ──────────────────────────────────────
    function weekDays(): Date[] {
        const sw = startOfWeek(anchor)
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(sw)
            d.setDate(sw.getDate() + i)
            return d
        })
    }

    function navigate(delta: number) {
        setAnchor(prev => {
            const d = new Date(prev)
            if (view === 'month') d.setMonth(d.getMonth() + delta)
            else d.setDate(d.getDate() + delta * 7)
            return d
        })
    }

    const today = new Date()
    const cells = view === 'month' ? monthDays() : weekDays()
    const currentAnchorMonth = anchor.getMonth()

    // ── Render header label ────────────────────────────────────
    function headerLabel() {
        if (view === 'month') return formatMonthYear(anchor)
        const week = weekDays()
        const s = week[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        const e = week[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        return `${s} – ${e}`
    }

    const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <div className="flex flex-col gap-4 pb-8" style={{ minHeight: 500 }}>

            {/* ── Toolbar ─────────────────────────────────────── */}
            <div className="flex items-center gap-2 flex-wrap">
                {/* View toggle */}
                <div className="flex rounded-xl overflow-hidden"
                    style={{ border: `1px solid ${C.border}` }}>
                    {(['month', 'week'] as ViewMode[]).map(v => (
                        <button key={v} onClick={() => setView(v)}
                            className="px-3 py-1.5 text-[12px] font-semibold transition-all capitalize"
                            style={{
                                backgroundColor: view === v ? C.primary : C.surface,
                                color: view === v ? '#fff' : C.secondary,
                                fontFamily: 'DM Sans, sans-serif',
                            }}>
                            {v}
                        </button>
                    ))}
                </div>

                {/* Nav */}
                <button onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
                    <ChevronLeft size={14} style={{ color: C.body }} />
                </button>
                <p className="flex-1 text-[13px] font-bold text-center"
                    style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                    {headerLabel()}
                </p>
                <button onClick={() => navigate(1)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
                    <ChevronRight size={14} style={{ color: C.body }} />
                </button>

                {/* Today + refresh */}
                <button onClick={() => setAnchor(new Date())}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all hover:opacity-80"
                    style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                    Today
                </button>
                <button onClick={load}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-70"
                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
                    {loading
                        ? <Loader2 size={13} className="animate-spin" style={{ color: C.primary }} />
                        : <RefreshCw size={13} style={{ color: C.muted }} />}
                </button>
            </div>

            {/* ── Summary strip ───────────────────────────────── */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl"
                style={{ backgroundColor: C.primaryLight, border: `1px solid ${C.border}` }}>
                <Calendar size={13} style={{ color: C.primary }} />
                <p className="text-[12px] font-semibold" style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                    {drafts.length} listing{drafts.length !== 1 ? 's' : ''} scheduled
                </p>
                {drafts.length > 0 && (
                    <p className="text-[11px] ml-auto" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                        Next: {new Date(drafts[0].publish_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                )}
            </div>

            {/* ── Day-of-week headers ──────────────────────────── */}
            <div className="grid grid-cols-7 gap-px"
                style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                {DAY_LABELS.map(d => (
                    <div key={d} className="py-1.5 text-center"
                        style={{ backgroundColor: C.dark }}>
                        <span className="text-[10px] font-bold"
                            style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em' }}>
                            {d}
                        </span>
                    </div>
                ))}

                {/* ── Grid cells ──────────────────────────────── */}
                {cells.map((day, idx) => {
                    const isCurrentMonth = view === 'week' || day.getMonth() === currentAnchorMonth
                    const isToday = isSameDay(day, today)
                    const dayDrafts = draftsOnDay(day)
                    const cellHeight = view === 'month' ? 90 : 140

                    return (
                        <div key={idx}
                            className="flex flex-col gap-0.5 p-1 overflow-hidden"
                            style={{
                                backgroundColor: isToday ? '#f3eeff' : isCurrentMonth ? C.surface : '#fafaf9',
                                minHeight: cellHeight,
                                borderTop: idx >= 7 ? `1px solid ${C.border}` : 'none',
                                borderLeft: idx % 7 !== 0 ? `1px solid ${C.border}` : 'none',
                            }}>
                            <span className="text-[11px] font-bold self-end"
                                style={{
                                    fontFamily: 'DM Sans, sans-serif',
                                    width: 22, height: 22,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '50%',
                                    backgroundColor: isToday ? C.primary : 'transparent',
                                    color: isToday ? '#fff' : isCurrentMonth ? C.body : C.muted,
                                }}>
                                {day.getDate()}
                            </span>
                            <div className="flex flex-col gap-0.5 overflow-hidden">
                                {(view === 'month' ? dayDrafts.slice(0, 2) : dayDrafts).map(draft => (
                                    <DraftPill key={draft.id} draft={draft} onClick={() => setSelected(draft)} />
                                ))}
                                {view === 'month' && dayDrafts.length > 2 && (
                                    <span className="text-[9px] font-semibold px-1"
                                        style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                        +{dayDrafts.length - 2} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* ── Empty state ─────────────────────────────────── */}
            {!loading && drafts.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-12">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: C.primaryLight }}>
                        <Calendar size={24} style={{ color: C.primary }} />
                    </div>
                    <p className="text-[14px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>No listings scheduled</p>
                    <p className="text-[12px] text-center max-w-xs" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                        Open a draft in Studio → Step 4 → toggle Schedule to pick a go-live date.
                    </p>
                </div>
            )}

            {/* ── Detail overlay ──────────────────────────────── */}
            {selected && (
                <DraftDetail
                    draft={selected}
                    onClose={() => setSelected(null)}
                    onEdit={id => { setSelected(null); onEditDraft?.(id) }}
                />
            )}
        </div>
    )
}
