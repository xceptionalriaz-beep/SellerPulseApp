'use client'
// components/ui/PriceDropRuleModal.tsx
// ─────────────────────────────────────────────────────────────
// Per-listing price drop rule editor.
// Opens as a modal over any page; manages its own load/save.
//
// Props:
//   listingId    – UUID of the listing_draft
//   listingTitle – display name
//   currentPrice – current sell_price (for preview math)
//   onClose      – dismiss callback
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { X, TrendingDown, ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

// ── Colour tokens ─────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    primary: '#7530fb',
    primaryHover: '#6020e0',
    primaryLight: '#f3eeff',
    accent: '#b8fa33',
    dark: '#1e1535',
    body: '#2d1f5e',
    muted: '#7c6fa0',
    success: '#16a34a',
    successBg: '#dcfce7',
    warning: '#d97706',
    warningBg: '#fef3c7',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
}

interface Props {
    listingId: string
    listingTitle: string
    currentPrice: number | null
    onClose: () => void
    onSaved?: () => void
}

interface Rule {
    id?: string
    days_unsold: number
    drop_percent: number
    min_price: number | null
    max_drops: number
    enabled: boolean
    last_triggered_at?: string | null
    trigger_count?: number
}

const DAYS_PRESETS = [7, 14, 21, 30, 60]
const PERCENT_PRESETS = [5, 10, 15, 20]
const DROPS_PRESETS = [1, 2, 3, 5]

export default function PriceDropRuleModal({ listingId, listingTitle, currentPrice, onClose, onSaved }: Props) {
    const supabase = createClient()

    const [rule, setRule] = useState<Rule>({
        days_unsold: 14,
        drop_percent: 10,
        min_price: null,
        max_drops: 3,
        enabled: true,
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [running, setRunning] = useState(false)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
    const [showLog, setShowLog] = useState(false)
    const [log, setLog] = useState<any[]>([])

    // ── Load existing rule ──────────────────────────────────────
    useEffect(() => {
        async function load() {
            setLoading(true)
            try {
                const { data: { session } } = await supabase.auth.getSession()
                const res = await fetch(`/api/inventory/price-drop-rules?listing_id=${listingId}`, {
                    headers: { Authorization: `Bearer ${session?.access_token}` },
                })
                const json = await res.json()
                if (json.rule) {
                    setRule({
                        id: json.rule.id,
                        days_unsold: json.rule.days_unsold,
                        drop_percent: json.rule.drop_percent,
                        min_price: json.rule.min_price,
                        max_drops: json.rule.max_drops,
                        enabled: json.rule.enabled,
                        last_triggered_at: json.rule.last_triggered_at,
                        trigger_count: json.rule.trigger_count ?? 0,
                    })
                }
                // Load recent log for this listing
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: logRows } = await (supabase as any)
                        .from('price_drop_log')
                        .select('old_price, new_price, drop_percent, success, error_message, created_at')
                        .eq('user_id', user.id)
                        .eq('listing_id', listingId)
                        .order('created_at', { ascending: false })
                        .limit(10)
                    setLog(logRows ?? [])
                }
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [listingId]) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Save rule ──────────────────────────────────────────────
    async function save() {
        setSaving(true)
        setToast(null)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const res = await fetch('/api/inventory/price-drop-rules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({ listing_id: listingId, ...rule }),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Save failed')
            setRule(r => ({ ...r, id: json.rule?.id }))
            setToast({ type: 'success', msg: 'Rule saved' })
            onSaved?.()
            setTimeout(() => setToast(null), 2500)
        } catch (err: any) {
            setToast({ type: 'error', msg: err.message })
        } finally {
            setSaving(false)
        }
    }

    // ── Run now ─────────────────────────────────────────────────
    async function runNow() {
        setRunning(true)
        setToast(null)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const res = await fetch('/api/inventory/apply-price-drops', {
                method: 'POST',
                headers: { Authorization: `Bearer ${session?.access_token}` },
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Run failed')
            const detail = json.details?.find((d: any) => d.id === listingId)
            if (detail?.success) {
                setToast({ type: 'success', msg: `Price dropped from £${detail.oldPrice?.toFixed(2)} → £${detail.newPrice?.toFixed(2)}` })
                setRule(r => ({ ...r, trigger_count: (r.trigger_count ?? 0) + 1, last_triggered_at: new Date().toISOString() }))
                setLog(prev => [{
                    old_price: detail.oldPrice, new_price: detail.newPrice,
                    drop_percent: rule.drop_percent, success: true, created_at: new Date().toISOString(),
                }, ...prev])
            } else if (detail) {
                setToast({ type: 'error', msg: detail.reason ?? detail.error ?? 'Not eligible yet' })
            } else {
                setToast({ type: 'error', msg: 'Listing not eligible (check days threshold)' })
            }
        } catch (err: any) {
            setToast({ type: 'error', msg: err.message })
        } finally {
            setRunning(false)
        }
    }

    // ── Price preview ───────────────────────────────────────────
    const previewPrice = currentPrice
        ? Math.max(
            currentPrice * (1 - rule.drop_percent / 100),
            rule.min_price ?? 0
        ).toFixed(2)
        : null

    const saving_or_loading = loading || saving

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                backgroundColor: 'rgba(30,21,53,0.55)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 16,
            }}
            onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
            <div
                style={{
                    backgroundColor: C.surface,
                    borderRadius: 20,
                    border: `1px solid ${C.border}`,
                    width: '100%', maxWidth: 480,
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '0 24px 60px rgba(30,21,53,0.22)',
                }}
            >
                {/* ── Header ───────────────────────────────────────── */}
                <div style={{
                    padding: '20px 24px 16px',
                    borderBottom: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        backgroundColor: C.primaryLight,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <TrendingDown size={16} style={{ color: C.primary }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: C.dark, fontFamily: 'Syne, sans-serif', margin: 0 }}>
                            Price Drop Rule
                        </p>
                        <p style={{
                            fontSize: 12, color: C.muted, fontFamily: 'DM Sans, sans-serif',
                            margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                            {listingTitle}
                        </p>
                    </div>
                    {/* enabled toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <span style={{ fontSize: 12, color: rule.enabled ? C.primary : C.muted, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                            {rule.enabled ? 'Active' : 'Paused'}
                        </span>
                        <div
                            onClick={() => setRule(r => ({ ...r, enabled: !r.enabled }))}
                            style={{
                                width: 36, height: 20, borderRadius: 999, cursor: 'pointer',
                                backgroundColor: rule.enabled ? C.primary : '#d1d5db',
                                position: 'relative', transition: 'background 0.2s',
                            }}
                        >
                            <div style={{
                                position: 'absolute', top: 2,
                                left: rule.enabled ? 18 : 2,
                                width: 16, height: 16, borderRadius: '50%',
                                backgroundColor: '#fff', transition: 'left 0.2s ease',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            }} />
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: C.muted, padding: 2, display: 'flex', alignItems: 'center',
                    }}>
                        <X size={16} />
                    </button>
                </div>

                {/* ── Body ─────────────────────────────────────────── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                            <Loader2 size={20} style={{ color: C.primary, animation: 'spin 1s linear infinite' }} />
                            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                        </div>
                    ) : (
                        <>
                            {/* ── Days unsold ──────────────────────────────── */}
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.body, fontFamily: 'DM Sans, sans-serif', marginBottom: 8 }}>
                                    Drop price after
                                </label>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                                    {DAYS_PRESETS.map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setRule(r => ({ ...r, days_unsold: d }))}
                                            style={{
                                                padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                                fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', border: '1.5px solid',
                                                backgroundColor: rule.days_unsold === d ? C.primary : C.surface,
                                                color: rule.days_unsold === d ? '#fff' : C.muted,
                                                borderColor: rule.days_unsold === d ? C.primary : C.border,
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            {d}d
                                        </button>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input
                                        type="number" min={1} max={365}
                                        value={rule.days_unsold}
                                        onChange={e => setRule(r => ({ ...r, days_unsold: Number(e.target.value) || 1 }))}
                                        style={{
                                            width: 72, padding: '7px 10px', borderRadius: 8, fontSize: 13,
                                            border: `1.5px solid ${C.border}`, outline: 'none', color: C.dark,
                                            fontFamily: 'DM Sans, sans-serif',
                                        }}
                                    />
                                    <span style={{ fontSize: 12, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                        days without a sale
                                    </span>
                                </div>
                            </div>

                            {/* ── Drop percent ─────────────────────────────── */}
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.body, fontFamily: 'DM Sans, sans-serif', marginBottom: 8 }}>
                                    Drop price by
                                </label>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                                    {PERCENT_PRESETS.map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setRule(r => ({ ...r, drop_percent: p }))}
                                            style={{
                                                padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                                fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', border: '1.5px solid',
                                                backgroundColor: rule.drop_percent === p ? C.primary : C.surface,
                                                color: rule.drop_percent === p ? '#fff' : C.muted,
                                                borderColor: rule.drop_percent === p ? C.primary : C.border,
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            {p}%
                                        </button>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input
                                        type="number" min={1} max={90} step={0.5}
                                        value={rule.drop_percent}
                                        onChange={e => setRule(r => ({ ...r, drop_percent: Number(e.target.value) || 1 }))}
                                        style={{
                                            width: 72, padding: '7px 10px', borderRadius: 8, fontSize: 13,
                                            border: `1.5px solid ${C.border}`, outline: 'none', color: C.dark,
                                            fontFamily: 'DM Sans, sans-serif',
                                        }}
                                    />
                                    <span style={{ fontSize: 12, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>% each time</span>
                                </div>
                            </div>

                            {/* ── Price preview ─────────────────────────────── */}
                            {currentPrice && previewPrice && (
                                <div style={{
                                    padding: '12px 16px', borderRadius: 12,
                                    backgroundColor: C.primaryLight, border: `1px solid ${C.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                }}>
                                    <span style={{ fontSize: 12, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Next drop preview</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 13, color: C.muted, fontFamily: 'DM Mono, monospace', textDecoration: 'line-through' }}>
                                            £{currentPrice.toFixed(2)}
                                        </span>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: C.primary, fontFamily: 'DM Mono, monospace' }}>
                                            £{previewPrice}
                                        </span>
                                        <span style={{
                                            fontSize: 11, fontWeight: 700, color: '#fff',
                                            backgroundColor: C.primary, padding: '2px 7px', borderRadius: 6,
                                            fontFamily: 'DM Sans, sans-serif',
                                        }}>
                                            -{rule.drop_percent}%
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* ── Min price floor ───────────────────────────── */}
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.body, fontFamily: 'DM Sans, sans-serif', marginBottom: 6 }}>
                                    Minimum price floor <span style={{ fontWeight: 400, color: C.muted }}>(optional)</span>
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 13, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>£</span>
                                    <input
                                        type="number" min={0} step={0.01} placeholder="e.g. 4.99"
                                        value={rule.min_price ?? ''}
                                        onChange={e => setRule(r => ({
                                            ...r, min_price: e.target.value === '' ? null : Number(e.target.value),
                                        }))}
                                        style={{
                                            width: 100, padding: '7px 10px', borderRadius: 8, fontSize: 13,
                                            border: `1.5px solid ${C.border}`, outline: 'none', color: C.dark,
                                            fontFamily: 'DM Sans, sans-serif',
                                        }}
                                    />
                                    <span style={{ fontSize: 12, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                        Never drop below this price
                                    </span>
                                </div>
                            </div>

                            {/* ── Max drops ─────────────────────────────────── */}
                            <div>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.body, fontFamily: 'DM Sans, sans-serif', marginBottom: 8 }}>
                                    Stop after
                                </label>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                                    {DROPS_PRESETS.map(n => (
                                        <button
                                            key={n}
                                            onClick={() => setRule(r => ({ ...r, max_drops: n }))}
                                            style={{
                                                padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                                fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', border: '1.5px solid',
                                                backgroundColor: rule.max_drops === n ? C.primary : C.surface,
                                                color: rule.max_drops === n ? '#fff' : C.muted,
                                                borderColor: rule.max_drops === n ? C.primary : C.border,
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            {n}×
                                        </button>
                                    ))}
                                </div>
                                <p style={{ fontSize: 11, color: C.muted, fontFamily: 'DM Sans, sans-serif', margin: 0 }}>
                                    {(rule.trigger_count ?? 0) > 0
                                        ? `${rule.trigger_count}/${rule.max_drops} drops used`
                                        : 'No drops applied yet'}
                                </p>
                            </div>

                            {/* ── Recent log ────────────────────────────────── */}
                            {log.length > 0 && (
                                <div>
                                    <button
                                        onClick={() => setShowLog(s => !s)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            fontSize: 12, fontWeight: 700, color: C.muted,
                                            fontFamily: 'DM Sans, sans-serif', padding: 0,
                                        }}
                                    >
                                        {showLog ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                        History ({log.length})
                                    </button>
                                    {showLog && (
                                        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            {log.map((entry, i) => (
                                                <div key={i} style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '7px 10px', borderRadius: 8,
                                                    backgroundColor: entry.success ? C.successBg : C.dangerBg,
                                                    border: `1px solid ${entry.success ? '#bbf7d0' : '#fecaca'}`,
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        {entry.success
                                                            ? <CheckCircle2 size={12} style={{ color: C.success, flexShrink: 0 }} />
                                                            : <AlertCircle size={12} style={{ color: C.danger, flexShrink: 0 }} />}
                                                        <span style={{ fontSize: 11, color: entry.success ? C.success : C.danger, fontFamily: 'DM Sans, sans-serif' }}>
                                                            {entry.success
                                                                ? `£${Number(entry.old_price).toFixed(2)} → £${Number(entry.new_price).toFixed(2)}`
                                                                : (entry.error_message ?? 'Failed')}
                                                        </span>
                                                    </div>
                                                    <span style={{ fontSize: 10, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                                        {new Date(entry.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── Toast ────────────────────────────────────────── */}
                {toast && (
                    <div style={{
                        margin: '0 24px 4px',
                        padding: '10px 14px',
                        borderRadius: 10,
                        backgroundColor: toast.type === 'success' ? C.successBg : C.dangerBg,
                        border: `1px solid ${toast.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                        display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                        {toast.type === 'success'
                            ? <CheckCircle2 size={14} style={{ color: C.success, flexShrink: 0 }} />
                            : <AlertCircle size={14} style={{ color: C.danger, flexShrink: 0 }} />}
                        <span style={{ fontSize: 12, color: toast.type === 'success' ? C.success : C.danger, fontFamily: 'DM Sans, sans-serif' }}>
                            {toast.msg}
                        </span>
                    </div>
                )}

                {/* ── Footer ───────────────────────────────────────── */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: `1px solid ${C.border}`,
                    display: 'flex', gap: 8,
                }}>
                    <button
                        onClick={runNow}
                        disabled={running || saving_or_loading}
                        style={{
                            flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 600,
                            fontFamily: 'DM Sans, sans-serif', cursor: (running || saving_or_loading) ? 'not-allowed' : 'pointer',
                            backgroundColor: C.bg, color: C.primary, border: `1.5px solid ${C.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            opacity: (running || saving_or_loading) ? 0.6 : 1,
                        }}
                    >
                        {running
                            ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Running…</>
                            : <><TrendingDown size={13} /> Run Now</>}
                    </button>
                    <button
                        onClick={save}
                        disabled={saving_or_loading}
                        style={{
                            flex: 2, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 700,
                            fontFamily: 'DM Sans, sans-serif', cursor: saving_or_loading ? 'not-allowed' : 'pointer',
                            backgroundColor: C.primary, color: '#fff', border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            opacity: saving_or_loading ? 0.6 : 1,
                        }}
                    >
                        {saving
                            ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                            : 'Save Rule'}
                    </button>
                </div>
            </div>
        </div>
    )
}
