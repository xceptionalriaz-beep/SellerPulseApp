'use client'
// app/dashboard/feedback/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Seller Feedback Tracker
// Syncs eBay feedback via GetFeedback API, shows rows in a filterable table.
// Actions: Reply (RespondToFeedback) + Dispute flag (local).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react'
import {
    RefreshCw, MessageSquare, ThumbsUp, ThumbsDown, Minus,
    AlertTriangle, CheckCircle2, XCircle, Loader2,
    Star, Flag, CornerDownRight, X, ExternalLink,
    Search, ChevronDown,
} from 'lucide-react'

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
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function TypeBadge({ type }: { type: string }) {
    const cfg: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
        Positive: { bg: C.successBg, color: C.success, icon: <ThumbsUp size={10} /> },
        Negative: { bg: C.dangerBg,  color: C.danger,  icon: <ThumbsDown size={10} /> },
        Neutral:  { bg: C.warningBg, color: C.warning, icon: <Minus size={10} /> },
    }
    const { bg, color, icon } = cfg[type] ?? cfg.Neutral
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ backgroundColor: bg, color, fontFamily: 'DM Sans, sans-serif' }}>
            {icon} {type}
        </span>
    )
}

// ── Reply modal ───────────────────────────────────────────────
function ReplyModal({ item, onClose, onDone }: {
    item: FeedbackItem
    onClose: () => void
    onDone: (feedbackId: string, text: string) => void
}) {
    const [text, setText] = useState(item.feedback_response ?? '')
    const [saving, setSaving] = useState(false)
    const [err, setErr] = useState<string | null>(null)
    const remaining = 80 - text.length

    async function submit() {
        if (!text.trim()) return
        setSaving(true)
        setErr(null)
        try {
            const res = await fetch('/api/feedback/reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedbackId: item.feedback_id, text: text.trim() }),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error ?? 'Failed')
            onDone(item.feedback_id, text.trim())
            onClose()
        } catch (e: any) {
            setErr(e.message)
        }
        setSaving(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
            onClick={onClose}>
            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl"
                style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
                onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center gap-2 px-4 py-3"
                    style={{ backgroundColor: C.primaryLight, borderBottom: `1px solid ${C.border}` }}>
                    <CornerDownRight size={14} style={{ color: C.primary }} />
                    <p className="text-[13px] font-bold flex-1"
                        style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>Reply to Feedback</p>
                    <button onClick={onClose} style={{ color: C.muted }}>
                        <X size={14} />
                    </button>
                </div>
                {/* Original comment */}
                <div className="px-4 pt-3 pb-1">
                    <p className="text-[11px] font-semibold mb-1" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                        From: {item.commenting_user ?? 'Unknown'}
                    </p>
                    <div className="p-2.5 rounded-xl text-[12px]"
                        style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                        "{item.comment_text}"
                    </div>
                </div>
                {/* Reply input */}
                <div className="px-4 py-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                            Your reply
                        </label>
                        <span className="text-[10px]"
                            style={{ color: remaining < 10 ? C.danger : C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                            {remaining} chars left
                        </span>
                    </div>
                    <textarea
                        value={text}
                        onChange={e => setText(e.target.value.slice(0, 80))}
                        rows={3}
                        placeholder="Write your reply (max 80 characters)…"
                        className="w-full resize-none text-[13px] outline-none"
                        style={{
                            border: `1px solid ${C.borderInput}`,
                            borderRadius: 10, padding: '8px 10px',
                            backgroundColor: C.surface, color: C.body,
                            fontFamily: 'DM Sans, sans-serif',
                        }}
                        onFocus={e => e.target.style.borderColor = C.primary}
                        onBlur={e => e.target.style.borderColor = C.borderInput}
                    />
                    {err && (
                        <p className="text-[11px]" style={{ color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>⚠ {err}</p>
                    )}
                    <div className="flex gap-2">
                        <button onClick={submit} disabled={saving || !text.trim()}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-[12px] transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'Syne, sans-serif' }}>
                            {saving ? <Loader2 size={12} className="animate-spin" /> : <CornerDownRight size={12} />}
                            {saving ? 'Sending…' : 'Send Reply'}
                        </button>
                        <button onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl font-semibold text-[12px] transition-all hover:opacity-80"
                            style={{ backgroundColor: C.bg, color: C.secondary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Dispute modal ─────────────────────────────────────────────
function DisputeModal({ item, onClose, onDone }: {
    item: FeedbackItem
    onClose: () => void
    onDone: (feedbackId: string, disputed: boolean, reason: string) => void
}) {
    const [reason, setReason] = useState(item.dispute_reason ?? '')
    const [saving, setSaving] = useState(false)
    const [err, setErr] = useState<string | null>(null)
    const removing = item.disputed

    async function submit() {
        setSaving(true)
        setErr(null)
        try {
            const res = await fetch('/api/feedback/dispute', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    feedbackId: item.feedback_id,
                    disputed: !removing,
                    reason: removing ? undefined : reason.trim() || undefined,
                }),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error ?? 'Failed')
            onDone(item.feedback_id, !removing, reason.trim())
            onClose()
        } catch (e: any) {
            setErr(e.message)
        }
        setSaving(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
            onClick={onClose}>
            <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl"
                style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2 px-4 py-3"
                    style={{ backgroundColor: removing ? C.warningBg : C.dangerBg, borderBottom: `1px solid ${C.border}` }}>
                    <Flag size={14} style={{ color: removing ? C.warning : C.danger }} />
                    <p className="text-[13px] font-bold flex-1"
                        style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                        {removing ? 'Remove Dispute Flag' : 'Flag as Disputed'}
                    </p>
                    <button onClick={onClose} style={{ color: C.muted }}><X size={14} /></button>
                </div>
                <div className="px-4 py-4 flex flex-col gap-3">
                    <p className="text-[12px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                        {removing
                            ? 'This will remove the dispute flag from this feedback entry.'
                            : 'This marks the feedback as disputed in your records. To formally contest it on eBay, visit your eBay feedback profile.'}
                    </p>
                    {!removing && (
                        <textarea
                            value={reason}
                            onChange={e => setReason(e.target.value)}
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
                    )}
                    {err && <p className="text-[11px]" style={{ color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>⚠ {err}</p>}
                    {!removing && (
                        <a href="https://feedback.ebay.com/ws/eBayISAPI.dll?ViewFeedback&requested=me"
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[11px] font-semibold"
                            style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                            <ExternalLink size={10} /> Open eBay Feedback Profile
                        </a>
                    )}
                    <div className="flex gap-2">
                        <button onClick={submit} disabled={saving}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-[12px] transition-all hover:opacity-90 disabled:opacity-50"
                            style={{
                                backgroundColor: removing ? C.warning : C.danger,
                                color: '#fff', fontFamily: 'Syne, sans-serif'
                            }}>
                            {saving ? <Loader2 size={12} className="animate-spin" /> : <Flag size={12} />}
                            {saving ? 'Saving…' : removing ? 'Remove Flag' : 'Flag as Disputed'}
                        </button>
                        <button onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl font-semibold text-[12px] transition-all hover:opacity-80"
                            style={{ backgroundColor: C.bg, color: C.secondary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Feedback row ──────────────────────────────────────────────
function FeedbackRow({ item, onReply, onDispute }: {
    item: FeedbackItem
    onReply: (item: FeedbackItem) => void
    onDispute: (item: FeedbackItem) => void
}) {
    return (
        <div className="flex flex-col gap-2 p-4 rounded-2xl"
            style={{
                backgroundColor: C.surface,
                border: `1px solid ${item.disputed ? '#fcd34d' : item.comment_type === 'Negative' ? '#fca5a5' : C.border}`,
                borderLeft: `3px solid ${item.comment_type === 'Positive' ? C.success : item.comment_type === 'Negative' ? C.danger : C.warning}`,
            }}>
            {/* Row top */}
            <div className="flex items-start gap-3 flex-wrap">
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <TypeBadge type={item.comment_type} />
                        {item.disputed && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                style={{ backgroundColor: C.warningBg, color: C.warning }}>
                                <Flag size={9} /> Disputed
                            </span>
                        )}
                        {item.feedback_response && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                style={{ backgroundColor: C.primaryLight, color: C.primary }}>
                                <CornerDownRight size={9} /> Replied
                            </span>
                        )}
                        <span className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                            {formatDate(item.feedback_time)}
                        </span>
                    </div>
                    <p className="text-[12px] font-semibold" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                        {item.commenting_user ?? 'Unknown buyer'}
                    </p>
                    <p className="text-[12px] leading-relaxed" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                        "{item.comment_text ?? '—'}"
                    </p>
                    {item.item_title && (
                        <p className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                            Item: {item.item_title}
                            {item.item_id && (
                                <a href={`https://www.ebay.com/itm/${item.item_id}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="ml-1 inline-flex items-center gap-0.5"
                                    style={{ color: C.primary }}>
                                    <ExternalLink size={9} />
                                </a>
                            )}
                        </p>
                    )}
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => onReply(item)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all hover:opacity-80"
                        style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}
                        title={item.feedback_response ? 'Edit reply' : 'Reply'}>
                        <CornerDownRight size={11} />
                        {item.feedback_response ? 'Edit' : 'Reply'}
                    </button>
                    <button onClick={() => onDispute(item)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all hover:opacity-80"
                        style={{
                            backgroundColor: item.disputed ? C.warningBg : C.bg,
                            color: item.disputed ? C.warning : C.muted,
                            border: `1px solid ${item.disputed ? '#fcd34d' : C.border}`,
                            fontFamily: 'DM Sans, sans-serif',
                        }}
                        title={item.disputed ? 'Remove dispute flag' : 'Flag as disputed'}>
                        <Flag size={11} />
                        {item.disputed ? 'Flagged' : 'Dispute'}
                    </button>
                </div>
            </div>
            {/* Reply preview */}
            {item.feedback_response && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-xl"
                    style={{ backgroundColor: C.primaryLight, border: `1px solid ${C.border}` }}>
                    <CornerDownRight size={11} style={{ color: C.primary, marginTop: 2, flexShrink: 0 }} />
                    <p className="text-[11px]" style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                        {item.feedback_response}
                    </p>
                </div>
            )}
            {/* Dispute reason */}
            {item.disputed && item.dispute_reason && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-xl"
                    style={{ backgroundColor: C.warningBg, border: `1px solid #fcd34d` }}>
                    <Flag size={11} style={{ color: C.warning, marginTop: 2, flexShrink: 0 }} />
                    <p className="text-[11px]" style={{ color: C.warning, fontFamily: 'DM Sans, sans-serif' }}>
                        {item.dispute_reason}
                    </p>
                </div>
            )}
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
    const [replyTarget, setReplyTarget] = useState<FeedbackItem | null>(null)
    const [disputeTarget, setDisputeTarget] = useState<FeedbackItem | null>(null)

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
            setSyncResult(`✅ Synced ${json.synced} feedback item${json.synced !== 1 ? 's' : ''}`)
            await load()
        } catch (e: any) {
            setSyncResult(`❌ ${e.message}`)
        }
        setSyncing(false)
        setTimeout(() => setSyncResult(null), 6000)
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
            activeTab === 'all' ? true :
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

    // Update item in state
    function patchItem(feedbackId: string, updates: Partial<FeedbackItem>) {
        setItems(prev => prev.map(i => i.feedback_id === feedbackId ? { ...i, ...updates } : i))
    }

    const TABS: { key: TabFilter; label: string; count: number }[] = [
        { key: 'all',      label: 'All',      count: items.length },
        { key: 'Positive', label: 'Positive', count: positive },
        { key: 'Negative', label: 'Negative', count: negative },
        { key: 'Neutral',  label: 'Neutral',  count: neutral },
        { key: 'disputed', label: 'Disputed', count: disputed },
    ]

    return (
        <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: C.bg }}>

            {/* ── Header ────────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-6 py-4 shrink-0 flex-wrap"
                style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.surface }}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MessageSquare size={18} style={{ color: C.primary, flexShrink: 0 }} />
                    <p className="text-[16px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                        Seller Feedback
                    </p>
                    {score !== null && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
                            style={{ backgroundColor: score >= 95 ? C.successBg : score >= 80 ? C.warningBg : C.dangerBg, color: score >= 95 ? C.success : score >= 80 ? C.warning : C.danger }}>
                            <Star size={10} /> {score}% positive
                        </span>
                    )}
                </div>
                <button onClick={syncNow} disabled={syncing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all hover:opacity-80 disabled:opacity-60"
                    style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
                    {syncing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                    Sync from eBay
                </button>
            </div>

            {/* Sync result toast */}
            {syncResult && (
                <div className="mx-6 mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold shrink-0"
                    style={{
                        backgroundColor: syncResult.startsWith('✅') ? C.successBg : C.dangerBg,
                        color: syncResult.startsWith('✅') ? C.success : C.danger,
                        border: `1px solid ${syncResult.startsWith('✅') ? '#86efac' : '#fca5a5'}`,
                    }}>
                    <span style={{ flex: 1, fontFamily: 'DM Sans, sans-serif' }}>{syncResult}</span>
                    <button onClick={() => setSyncResult(null)}><X size={12} /></button>
                </div>
            )}

            {/* ── KPI cards ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 pt-4 shrink-0">
                {[
                    { label: 'Positive', count: positive, color: C.success,  bg: C.successBg,  icon: <ThumbsUp size={14} /> },
                    { label: 'Negative', count: negative, color: C.danger,   bg: C.dangerBg,   icon: <ThumbsDown size={14} /> },
                    { label: 'Neutral',  count: neutral,  color: C.warning,  bg: C.warningBg,  icon: <Minus size={14} /> },
                    { label: 'Disputed', count: disputed, color: C.warning,  bg: C.warningBg,  icon: <Flag size={14} /> },
                ].map(({ label, count, color, bg, icon }) => (
                    <div key={label} className="rounded-2xl p-4 flex items-center gap-3"
                        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${color}` }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: bg, color }}>
                            {icon}
                        </div>
                        <div>
                            <p className="text-[22px] font-bold leading-none" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>{count}</p>
                            <p className="text-[11px] font-semibold" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Tabs + search ───────────────────────────────────── */}
            <div className="flex items-center gap-3 px-6 pt-4 pb-2 shrink-0 flex-wrap">
                {/* Tabs */}
                <div className="flex items-center gap-1 flex-wrap">
                    {TABS.map(({ key, label, count }) => (
                        <button key={key} onClick={() => setActiveTab(key)}
                            className="px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
                            style={{
                                backgroundColor: activeTab === key ? C.primary : C.surface,
                                color: activeTab === key ? '#fff' : C.secondary,
                                border: `1px solid ${activeTab === key ? C.primary : C.border}`,
                                fontFamily: 'DM Sans, sans-serif',
                            }}>
                            {label} <span className="ml-1 opacity-70">{count}</span>
                        </button>
                    ))}
                </div>
                {/* Search */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl flex-1 min-w-40"
                    style={{ backgroundColor: C.surface, border: `1px solid ${C.borderInput}` }}>
                    <Search size={13} style={{ color: C.muted, flexShrink: 0 }} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search buyer, comment, item…"
                        className="flex-1 text-[12px] outline-none bg-transparent"
                        style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}
                    />
                    {search && <button onClick={() => setSearch('')}><X size={11} style={{ color: C.muted }} /></button>}
                </div>
            </div>

            {/* ── Feedback list ────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-6 pb-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={24} className="animate-spin" style={{ color: C.primary }} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: C.primaryLight }}>
                            <MessageSquare size={24} style={{ color: C.primary }} />
                        </div>
                        <p className="text-[14px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                            {items.length === 0 ? 'No feedback yet' : 'No results'}
                        </p>
                        <p className="text-[12px] text-center max-w-xs" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                            {items.length === 0
                                ? 'Click "Sync from eBay" to pull your latest feedback.'
                                : 'Try a different filter or search term.'}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 pt-2">
                        {filtered.map(item => (
                            <FeedbackRow
                                key={item.id}
                                item={item}
                                onReply={setReplyTarget}
                                onDispute={setDisputeTarget}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Modals ───────────────────────────────────────────── */}
            {replyTarget && (
                <ReplyModal
                    item={replyTarget}
                    onClose={() => setReplyTarget(null)}
                    onDone={(feedbackId, text) => patchItem(feedbackId, {
                        feedback_response: text,
                        responded_at: new Date().toISOString(),
                    })}
                />
            )}
            {disputeTarget && (
                <DisputeModal
                    item={disputeTarget}
                    onClose={() => setDisputeTarget(null)}
                    onDone={(feedbackId, disputed, reason) => patchItem(feedbackId, {
                        disputed,
                        dispute_reason: disputed ? reason || null : null,
                        disputed_at: disputed ? new Date().toISOString() : null,
                    })}
                />
            )}
        </div>
    )
}
