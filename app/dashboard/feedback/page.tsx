'use client'
// app/dashboard/feedback/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Seller Feedback Tracker
// Split-pane inbox layout: compact list on the left, detail + reply on the right.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
    RefreshCw, MessageSquare, ThumbsUp, ThumbsDown, Minus,
    Loader2, Star, Flag, CornerDownRight, X, ExternalLink,
    Search, CheckCircle2, AlertCircle, Package, User,
    Send, ChevronRight,
} from 'lucide-react'

// ── Design tokens ─────────────────────────────────────────────
const C = {
    bg:          '#f8f7ff',
    surface:     '#ffffff',
    border:      '#ede9fe',
    borderInput: '#e5e0f5',
    primary:     '#7530fb',
    primaryHover:'#6020e0',
    primaryLight:'#f3eeff',
    accent:      '#b8fa33',
    dark:        '#1e1535',
    body:        '#1f1d2e',
    secondary:   '#6b7280',
    muted:       '#9ca3af',
    success:     '#16a34a',
    successBg:   '#dcfce7',
    warning:     '#d97706',
    warningBg:   '#fef3c7',
    danger:      '#ef4444',
    dangerBg:    '#fee2e2',
}

interface FeedbackItem {
    id: string
    feedback_id: string
    item_id: string | null
    item_title: string | null
    transaction_id: string | null
    comment_type: 'Positive' | 'Negative' | 'Neutral'
    commenting_user: string | null
    comment_text: string | null
    role: string | null
    feedback_time: string | null
    feedback_response: string | null
    responded_at: string | null
    disputed: boolean
    dispute_reason: string | null
    disputed_at: string | null
    synced_at: string
}

type TabFilter = 'all' | 'Positive' | 'Negative' | 'Neutral' | 'disputed'

// ── Helpers ───────────────────────────────────────────────────
function formatDate(iso: string | null) {
    if (!iso) return '—'
    const d = new Date(iso)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function formatDateFull(iso: string | null) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

const SENTIMENT = {
    Positive: { color: C.success,  bg: C.successBg,  icon: ThumbsUp,   border: '#86efac' },
    Negative: { color: C.danger,   bg: C.dangerBg,   icon: ThumbsDown, border: '#fca5a5' },
    Neutral:  { color: C.warning,  bg: C.warningBg,  icon: Minus,      border: '#fcd34d' },
}

// ── Left list row ─────────────────────────────────────────────
function ListRow({ item, selected, onClick }: {
    item: FeedbackItem
    selected: boolean
    onClick: () => void
}) {
    const s = SENTIMENT[item.comment_type] ?? SENTIMENT.Neutral
    const Icon = s.icon

    return (
        <button
            onClick={onClick}
            className="w-full text-left flex items-stretch transition-all"
            style={{
                backgroundColor: selected ? C.primaryLight : 'transparent',
                borderBottom: `1px solid ${C.border}`,
                outline: 'none',
            }}
        >
            {/* Sentiment stripe */}
            <div style={{ width: 3, backgroundColor: s.color, flexShrink: 0 }} />

            <div className="flex-1 flex flex-col gap-0.5 px-3 py-3 min-w-0">
                {/* Top row: buyer + date */}
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-bold truncate"
                        style={{ color: selected ? C.primary : C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                        {item.commenting_user ?? 'Unknown buyer'}
                    </span>
                    <span className="text-[10px] shrink-0"
                        style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                        {formatDate(item.feedback_time)}
                    </span>
                </div>

                {/* Comment preview */}
                <p className="text-[11px] leading-snug truncate"
                    style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                    {item.comment_text ?? '—'}
                </p>

                {/* Badges */}
                <div className="flex items-center gap-1 mt-0.5">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                        style={{ backgroundColor: s.bg, color: s.color }}>
                        <Icon size={8} />
                        {item.comment_type}
                    </span>
                    {item.feedback_response && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                            style={{ backgroundColor: C.primaryLight, color: C.primary }}>
                            <CornerDownRight size={7} /> Replied
                        </span>
                    )}
                    {item.disputed && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                            style={{ backgroundColor: C.warningBg, color: C.warning }}>
                            <Flag size={7} /> Disputed
                        </span>
                    )}
                </div>
            </div>

            {/* Selected arrow */}
            {selected && (
                <div className="flex items-center pr-1">
                    <ChevronRight size={12} style={{ color: C.primary }} />
                </div>
            )}
        </button>
    )
}

// ── Right detail panel ────────────────────────────────────────
function DetailPanel({ item, onPatch }: {
    item: FeedbackItem
    onPatch: (feedbackId: string, updates: Partial<FeedbackItem>) => void
}) {
    const s = SENTIMENT[item.comment_type] ?? SENTIMENT.Neutral
    const SentIcon = s.icon

    // Reply state
    const [replyText, setReplyText] = useState(item.feedback_response ?? '')
    const [replySaving, setReplySaving] = useState(false)
    const [replyErr, setReplyErr] = useState<string | null>(null)
    const [replySuccess, setReplySuccess] = useState(false)
    const [editingReply, setEditingReply] = useState(!item.feedback_response)
    const replyRemaining = 80 - replyText.length

    // Dispute state
    const [disputeSaving, setDisputeSaving] = useState(false)
    const [disputeReason, setDisputeReason] = useState(item.dispute_reason ?? '')
    const [showDisputeForm, setShowDisputeForm] = useState(false)
    const [disputeErr, setDisputeErr] = useState<string | null>(null)

    // Reset when item changes
    useEffect(() => {
        setReplyText(item.feedback_response ?? '')
        setEditingReply(!item.feedback_response)
        setReplyErr(null)
        setReplySuccess(false)
        setDisputeReason(item.dispute_reason ?? '')
        setShowDisputeForm(false)
        setDisputeErr(null)
    }, [item.feedback_id])

    async function sendReply() {
        if (!replyText.trim()) return
        setReplySaving(true)
        setReplyErr(null)
        try {
            const res = await fetch('/api/feedback/reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedbackId: item.feedback_id, text: replyText.trim() }),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error ?? 'Failed')
            onPatch(item.feedback_id, { feedback_response: replyText.trim(), responded_at: new Date().toISOString() })
            setEditingReply(false)
            setReplySuccess(true)
            setTimeout(() => setReplySuccess(false), 3000)
        } catch (e: any) {
            setReplyErr(e.message)
        }
        setReplySaving(false)
    }

    async function toggleDispute() {
        setDisputeSaving(true)
        setDisputeErr(null)
        try {
            const removing = item.disputed
            const res = await fetch('/api/feedback/dispute', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    feedbackId: item.feedback_id,
                    disputed: !removing,
                    reason: removing ? undefined : disputeReason.trim() || undefined,
                }),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error ?? 'Failed')
            onPatch(item.feedback_id, {
                disputed: !removing,
                dispute_reason: !removing ? (disputeReason.trim() || null) : null,
                disputed_at: !removing ? new Date().toISOString() : null,
            })
            setShowDisputeForm(false)
        } catch (e: any) {
            setDisputeErr(e.message)
        }
        setDisputeSaving(false)
    }

    return (
        <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: C.surface }}>

            {/* ── Detail header ─────────────────────────────── */}
            <div className="shrink-0 px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                {/* Sentiment + date */}
                <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                        style={{ backgroundColor: s.bg, color: s.color }}>
                        <SentIcon size={11} />
                        {item.comment_type}
                    </span>
                    {item.disputed && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                            style={{ backgroundColor: C.warningBg, color: C.warning }}>
                            <Flag size={10} /> Disputed
                        </span>
                    )}
                    {item.feedback_response && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                            style={{ backgroundColor: C.primaryLight, color: C.primary }}>
                            <CornerDownRight size={10} /> Replied
                        </span>
                    )}
                    <span className="ml-auto text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                        {formatDateFull(item.feedback_time)}
                    </span>
                </div>

                {/* Buyer */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                        style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'Syne, sans-serif' }}>
                        {(item.commenting_user ?? 'U')[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="text-[14px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                            {item.commenting_user ?? 'Unknown buyer'}
                        </p>
                        {item.item_title && (
                            <div className="flex items-center gap-1">
                                <Package size={10} style={{ color: C.muted }} />
                                <p className="text-[11px] truncate max-w-xs" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                    {item.item_title}
                                </p>
                                {item.item_id && (
                                    <a href={`https://www.ebay.com/itm/${item.item_id}`}
                                        target="_blank" rel="noopener noreferrer"
                                        style={{ color: C.primary }}>
                                        <ExternalLink size={9} />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Scrollable body ───────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

                {/* Feedback comment */}
                <div className="rounded-2xl p-4 relative"
                    style={{
                        backgroundColor: C.bg,
                        border: `1px solid ${s.border}`,
                        borderLeft: `3px solid ${s.color}`,
                    }}>
                    <p className="text-[13px] leading-relaxed" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                        "{item.comment_text ?? '—'}"
                    </p>
                </div>

                {/* ── Reply section ────────────────────────── */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <CornerDownRight size={13} style={{ color: C.primary }} />
                            <p className="text-[12px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                Your Reply
                            </p>
                        </div>
                        {item.feedback_response && !editingReply && (
                            <button onClick={() => setEditingReply(true)}
                                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
                                style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                Edit Reply
                            </button>
                        )}
                    </div>

                    {/* Existing reply (read mode) */}
                    {item.feedback_response && !editingReply && (
                        <div className="rounded-xl px-4 py-3 flex items-start gap-2"
                            style={{ backgroundColor: C.primaryLight, border: `1px solid ${C.border}` }}>
                            <CornerDownRight size={12} style={{ color: C.primary, marginTop: 2, flexShrink: 0 }} />
                            <p className="text-[12px] leading-relaxed" style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                {item.feedback_response}
                            </p>
                        </div>
                    )}

                    {/* Reply textarea (edit / new) */}
                    {editingReply && (
                        <div className="flex flex-col gap-2">
                            <div className="relative">
                                <textarea
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value.slice(0, 80))}
                                    rows={3}
                                    placeholder="Write your reply to eBay (max 80 characters)…"
                                    className="w-full resize-none text-[13px] outline-none"
                                    style={{
                                        border: `1px solid ${C.borderInput}`,
                                        borderRadius: 12, padding: '10px 12px',
                                        backgroundColor: C.surface, color: C.body,
                                        fontFamily: 'DM Sans, sans-serif',
                                        lineHeight: 1.5,
                                    }}
                                    onFocus={e => e.target.style.borderColor = C.primary}
                                    onBlur={e => e.target.style.borderColor = C.borderInput}
                                />
                                <span className="absolute bottom-2 right-3 text-[10px]"
                                    style={{ color: replyRemaining < 10 ? C.danger : C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                    {replyRemaining}
                                </span>
                            </div>
                            {replyErr && (
                                <p className="text-[11px] flex items-center gap-1"
                                    style={{ color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>
                                    <AlertCircle size={10} /> {replyErr}
                                </p>
                            )}
                            {replySuccess && (
                                <p className="text-[11px] flex items-center gap-1"
                                    style={{ color: C.success, fontFamily: 'DM Sans, sans-serif' }}>
                                    <CheckCircle2 size={10} /> Reply sent to eBay!
                                </p>
                            )}
                            <div className="flex gap-2">
                                <button onClick={sendReply} disabled={replySaving || !replyText.trim()}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-all hover:opacity-90 disabled:opacity-50"
                                    style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'Syne, sans-serif' }}>
                                    {replySaving ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                    {replySaving ? 'Sending…' : item.feedback_response ? 'Update Reply' : 'Send Reply'}
                                </button>
                                {item.feedback_response && (
                                    <button onClick={() => { setEditingReply(false); setReplyText(item.feedback_response ?? '') }}
                                        className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all hover:opacity-80"
                                        style={{ backgroundColor: C.bg, color: C.secondary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Dispute section ──────────────────────── */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Flag size={13} style={{ color: item.disputed ? C.warning : C.muted }} />
                            <p className="text-[12px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                Dispute Flag
                            </p>
                        </div>
                        {item.disputed ? (
                            <button onClick={toggleDispute} disabled={disputeSaving}
                                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all hover:opacity-80 flex items-center gap-1 disabled:opacity-50"
                                style={{ backgroundColor: C.warningBg, color: C.warning, fontFamily: 'DM Sans, sans-serif', border: `1px solid #fcd34d` }}>
                                {disputeSaving ? <Loader2 size={10} className="animate-spin" /> : <X size={10} />}
                                Remove Flag
                            </button>
                        ) : (
                            <button onClick={() => setShowDisputeForm(v => !v)}
                                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all hover:opacity-80 flex items-center gap-1"
                                style={{ backgroundColor: C.bg, color: C.secondary, fontFamily: 'DM Sans, sans-serif', border: `1px solid ${C.border}` }}>
                                <Flag size={10} /> Flag as Disputed
                            </button>
                        )}
                    </div>

                    {item.disputed && item.dispute_reason && (
                        <div className="rounded-xl px-4 py-3 flex items-start gap-2"
                            style={{ backgroundColor: C.warningBg, border: `1px solid #fcd34d` }}>
                            <Flag size={11} style={{ color: C.warning, marginTop: 2, flexShrink: 0 }} />
                            <p className="text-[12px]" style={{ color: C.warning, fontFamily: 'DM Sans, sans-serif' }}>
                                {item.dispute_reason}
                            </p>
                        </div>
                    )}

                    {showDisputeForm && !item.disputed && (
                        <div className="flex flex-col gap-2 p-3 rounded-xl"
                            style={{ backgroundColor: C.dangerBg, border: `1px solid #fca5a5` }}>
                            <p className="text-[11px]" style={{ color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>
                                This marks the feedback as disputed in your records. To formally contest it on eBay,{' '}
                                <a href="https://feedback.ebay.com/ws/eBayISAPI.dll?ViewFeedback&requested=me"
                                    target="_blank" rel="noopener noreferrer"
                                    className="font-semibold underline" style={{ color: C.primary }}>
                                    visit your eBay feedback profile.
                                </a>
                            </p>
                            <textarea
                                value={disputeReason}
                                onChange={e => setDisputeReason(e.target.value)}
                                rows={2}
                                placeholder="Optional: reason for dispute…"
                                className="w-full resize-none text-[12px] outline-none"
                                style={{
                                    border: `1px solid ${C.borderInput}`,
                                    borderRadius: 10, padding: '8px 10px',
                                    backgroundColor: C.surface, color: C.body,
                                    fontFamily: 'DM Sans, sans-serif',
                                }}
                            />
                            {disputeErr && (
                                <p className="text-[11px]" style={{ color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>
                                    ⚠ {disputeErr}
                                </p>
                            )}
                            <div className="flex gap-2">
                                <button onClick={toggleDispute} disabled={disputeSaving}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-all hover:opacity-90 disabled:opacity-50"
                                    style={{ backgroundColor: C.danger, color: '#fff', fontFamily: 'Syne, sans-serif' }}>
                                    {disputeSaving ? <Loader2 size={12} className="animate-spin" /> : <Flag size={12} />}
                                    {disputeSaving ? 'Saving…' : 'Confirm Dispute'}
                                </button>
                                <button onClick={() => setShowDisputeForm(false)}
                                    className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all hover:opacity-80"
                                    style={{ backgroundColor: C.bg, color: C.secondary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Transaction info */}
                {item.transaction_id && (
                    <div className="flex items-center gap-2 pt-2"
                        style={{ borderTop: `1px solid ${C.border}` }}>
                        <p className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                            Transaction ID: {item.transaction_id}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

// ── Empty right panel ─────────────────────────────────────────
function EmptyDetail() {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-4"
            style={{ backgroundColor: C.surface }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: C.primaryLight }}>
                <MessageSquare size={28} style={{ color: C.primary }} />
            </div>
            <div className="text-center">
                <p className="text-[15px] font-bold mb-1" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                    Select a feedback
                </p>
                <p className="text-[12px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                    Click any row on the left to view details & reply
                </p>
            </div>
        </div>
    )
}

// ── Main page ─────────────────────────────────────────────────
export default function FeedbackPage() {
    const [items, setItems] = useState<FeedbackItem[]>([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [syncResult, setSyncResult] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<TabFilter>('all')
    const [search, setSearch] = useState('')
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/feedback/sync')
            const json = await res.json()
            if (json.items) setItems(json.items)
        } catch { /* ignore */ }
        setLoading(false)
    }, [])

    useEffect(() => { load() }, [load])

    async function syncNow() {
        setSyncing(true)
        setSyncResult(null)
        try {
            const res = await fetch('/api/feedback/sync', { method: 'POST' })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error ?? 'Sync failed')
            setSyncResult(`✅ Synced ${json.synced} item${json.synced !== 1 ? 's' : ''}`)
            await load()
        } catch (e: any) {
            setSyncResult(`❌ ${e.message}`)
        }
        setSyncing(false)
        setTimeout(() => setSyncResult(null), 5000)
    }

    function patchItem(feedbackId: string, updates: Partial<FeedbackItem>) {
        setItems(prev => prev.map(i => i.feedback_id === feedbackId ? { ...i, ...updates } : i))
    }

    // Stats
    const positive = items.filter(i => i.comment_type === 'Positive').length
    const negative = items.filter(i => i.comment_type === 'Negative').length
    const neutral  = items.filter(i => i.comment_type === 'Neutral').length
    const disputed = items.filter(i => i.disputed).length
    const score    = items.length > 0 ? Math.round((positive / items.length) * 100) : null

    // Filter
    const filtered = items.filter(item => {
        const matchTab =
            activeTab === 'all'      ? true :
            activeTab === 'disputed' ? item.disputed :
            item.comment_type === activeTab
        const q = search.toLowerCase().trim()
        if (!q) return matchTab
        return matchTab && (
            (item.commenting_user ?? '').toLowerCase().includes(q) ||
            (item.comment_text ?? '').toLowerCase().includes(q) ||
            (item.item_title ?? '').toLowerCase().includes(q)
        )
    })

    const selectedItem = items.find(i => i.feedback_id === selectedId) ?? null

    // Auto-select first row when list loads
    useEffect(() => {
        if (!selectedId && filtered.length > 0) {
            setSelectedId(filtered[0].feedback_id)
        }
    }, [filtered.length])

    const TABS: { key: TabFilter; label: string; count: number }[] = [
        { key: 'all',      label: 'All',      count: items.length },
        { key: 'Positive', label: 'Positive', count: positive },
        { key: 'Negative', label: 'Negative', count: negative },
        { key: 'Neutral',  label: 'Neutral',  count: neutral },
        { key: 'disputed', label: 'Disputed', count: disputed },
    ]

    return (
        <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: C.bg }}>

            {/* ── Top header ───────────────────────────────────── */}
            <div className="shrink-0 flex items-center gap-3 px-6 py-3 flex-wrap"
                style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>

                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MessageSquare size={16} style={{ color: C.primary, flexShrink: 0 }} />
                    <p className="text-[15px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                        Seller Feedback
                    </p>
                    {score !== null && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{
                                backgroundColor: score >= 95 ? C.successBg : score >= 80 ? C.warningBg : C.dangerBg,
                                color: score >= 95 ? C.success : score >= 80 ? C.warning : C.danger,
                            }}>
                            <Star size={9} fill="currentColor" /> {score}% positive
                        </span>
                    )}
                </div>

                {/* KPI chips */}
                <div className="hidden md:flex items-center gap-2">
                    {[
                        { label: 'Positive', count: positive, color: C.success,  bg: C.successBg,  Icon: ThumbsUp },
                        { label: 'Negative', count: negative, color: C.danger,   bg: C.dangerBg,   Icon: ThumbsDown },
                        { label: 'Neutral',  count: neutral,  color: C.warning,  bg: C.warningBg,  Icon: Minus },
                        { label: 'Disputed', count: disputed, color: C.warning,  bg: C.warningBg,  Icon: Flag },
                    ].map(({ label, count, color, bg, Icon }) => (
                        <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                            style={{ backgroundColor: bg, border: `1px solid ${color}22` }}>
                            <Icon size={11} style={{ color }} />
                            <span className="text-[12px] font-bold" style={{ color, fontFamily: 'DM Sans, sans-serif' }}>
                                {count} {label}
                            </span>
                        </div>
                    ))}
                </div>

                <button onClick={syncNow} disabled={syncing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all hover:opacity-85 disabled:opacity-60 shrink-0"
                    style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
                    {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                    Sync from eBay
                </button>
            </div>

            {/* Sync result */}
            {syncResult && (
                <div className="shrink-0 mx-6 mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold"
                    style={{
                        backgroundColor: syncResult.startsWith('✅') ? C.successBg : C.dangerBg,
                        color: syncResult.startsWith('✅') ? C.success : C.danger,
                        border: `1px solid ${syncResult.startsWith('✅') ? '#86efac' : '#fca5a5'}`,
                    }}>
                    <span className="flex-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{syncResult}</span>
                    <button onClick={() => setSyncResult(null)}><X size={12} /></button>
                </div>
            )}

            {/* ── Main split pane ─────────────────────────────── */}
            <div className="flex flex-1 min-h-0 overflow-hidden" style={{ gap: 0 }}>

                {/* ── LEFT: inbox list ───────────────────────── */}
                <div className="flex flex-col shrink-0 overflow-hidden"
                    style={{ width: 320, borderRight: `1px solid ${C.border}`, backgroundColor: C.surface }}>

                    {/* Tabs + search */}
                    <div className="shrink-0 flex flex-col gap-2 px-3 pt-3 pb-2"
                        style={{ borderBottom: `1px solid ${C.border}` }}>
                        {/* Tab pills */}
                        <div className="flex items-center gap-1 flex-wrap">
                            {TABS.map(({ key, label, count }) => (
                                <button key={key} onClick={() => { setActiveTab(key); setSelectedId(null) }}
                                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                                    style={{
                                        backgroundColor: activeTab === key ? C.primary : C.bg,
                                        color: activeTab === key ? '#fff' : C.secondary,
                                        fontFamily: 'DM Sans, sans-serif',
                                    }}>
                                    {label} {count}
                                </button>
                            ))}
                        </div>
                        {/* Search */}
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl"
                            style={{ backgroundColor: C.bg, border: `1px solid ${C.borderInput}` }}>
                            <Search size={11} style={{ color: C.muted, flexShrink: 0 }} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search…"
                                className="flex-1 text-[11px] outline-none bg-transparent"
                                style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}
                            />
                            {search && <button onClick={() => setSearch('')}><X size={10} style={{ color: C.muted }} /></button>}
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 size={20} className="animate-spin" style={{ color: C.primary }} />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-12 px-4 text-center">
                                <MessageSquare size={22} style={{ color: C.muted }} />
                                <p className="text-[12px] font-semibold" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                    {items.length === 0 ? 'No feedback yet' : 'No results'}
                                </p>
                                {items.length === 0 && (
                                    <p className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                        Click "Sync from eBay" to pull your latest feedback
                                    </p>
                                )}
                            </div>
                        ) : (
                            filtered.map(item => (
                                <ListRow
                                    key={item.id}
                                    item={item}
                                    selected={item.feedback_id === selectedId}
                                    onClick={() => setSelectedId(item.feedback_id)}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* ── RIGHT: detail panel ────────────────────── */}
                <div className="flex-1 min-w-0 overflow-hidden">
                    {selectedItem
                        ? <DetailPanel key={selectedItem.feedback_id} item={selectedItem} onPatch={patchItem} />
                        : <EmptyDetail />
                    }
                </div>
            </div>
        </div>
    )
}
