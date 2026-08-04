'use client'
// components/profit/SharedLinksPanel.tsx
// Shows all shared links in the History drawer Shared Links tab
// Import in page.tsx:
//   import { SharedLinksPanel } from '@/components/profit/SharedLinksPanel'

import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Copy, Check, ExternalLink, Trash2, Link2 } from 'lucide-react'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SYM: Record<string, string> = {
    US: '$', UK: '£', CA: 'C$', AU: 'A$', DE: '€', FR: '€', IT: '€',
    ES: '€', AT: '€', IE: '€', BE: '€', NL: '€', PL: 'zł', CH: 'CHF',
}
const FLAG: Record<string, string> = {
    US: 'us', UK: 'gb', CA: 'ca', AU: 'au', DE: 'de',
    FR: 'fr', IT: 'it', ES: 'es', AT: 'at', IE: 'ie',
    BE: 'be', NL: 'nl', PL: 'pl', CH: 'ch',
}

interface SharedLink {
    id: string
    country: string
    result: any
    created_at: string
    expires_at: string
    views: number
}

interface Props {
    C: Record<string, string>
}

export function SharedLinksPanel({ C }: Props) {
    const [links, setLinks] = useState<SharedLink[]>([])
    const [loading, setLoading] = useState(true)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)

    const [monthlyCount, setMonthlyCount] = useState(0)

    useEffect(() => {
        fetchLinks()
        fetchMonthlyCount()
    }, [])

    async function fetchMonthlyCount() {
        try {
            const startOfMonth = new Date()
            startOfMonth.setDate(1)
            startOfMonth.setHours(0, 0, 0, 0)
            const { count } = await supabase
                .from('shared_reports')
                .select('id', { count: 'exact', head: true })
                .gte('created_at', startOfMonth.toISOString())
            setMonthlyCount(count ?? 0)
        } catch {
            setMonthlyCount(0)
        }
    }

    async function fetchLinks() {
        setLoading(true)
        try {
            const { data } = await supabase
                .from('shared_reports')
                .select('id, country, result, created_at, expires_at, views')
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })
            setLinks(data ?? [])
        } catch {
            setLinks([])
        } finally {
            setLoading(false)
        }
    }

    async function copyLink(id: string) {
        const url = `${window.location.origin}/share/${id}`
        await navigator.clipboard.writeText(url)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    function openLink(id: string) {
        window.open(`${window.location.origin}/share/${id}`, '_blank')
    }

    async function deleteLink(id: string) {
        setDeleting(id)
        await supabase.from('shared_reports').delete().eq('id', id)
        setLinks(prev => prev.filter(l => l.id !== id))
        setDeleting(null)
    }

    function daysLeft(expires_at: string) {
        const diff = new Date(expires_at).getTime() - Date.now()
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' · ' +
            new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    }
    function formatExpiry(created_at: string) {
        const expiry = new Date(new Date(created_at).getTime() + 7 * 24 * 60 * 60 * 1000)
        return expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' · ' +
            expiry.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    }

    // ── Render ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: 12 }}>
                Loading shared links...
            </div>
        )
    }

    if (links.length === 0) {
        return (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Link2 size={20} color={C.muted} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>No shared links yet</p>
                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Click Export → Share via link to generate a shareable URL for your profit report</p>
            </div>
        )
    }

    return (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

            {/* Counter */}
            <div style={{ padding: '10px 20px', background: C.bg, borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: C.muted }}>{links.length} active link{links.length !== 1 ? 's' : ''}</span>
                <span style={{ fontSize: 11, color: C.muted }}>{monthlyCount} of 100 this month</span>
            </div>

            {/* Links list */}
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.map(link => {
                    const sym = SYM[link.country] ?? '$'
                    const profit = link.result?.netProfit ?? 0
                    const margin = link.result?.profitMargin ?? 0
                    const days = daysLeft(link.expires_at)
                    const isCopied = copiedId === link.id
                    const isDeleting = deleting === link.id

                    return (
                        <div key={link.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>

                            {/* Top row — country + profit */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className={`fi fi-${FLAG[link.country] ?? 'us'}`} style={{ width: 20, height: 20, borderRadius: '50%', display: 'inline-block', backgroundSize: 'cover', flexShrink: 0 }} />
                                    <div>
                                        <p style={{ fontSize: 12, fontWeight: 800, color: profit >= 0 ? '#16a34a' : '#b91c1c', margin: 0 }}>
                                            {profit >= 0 ? '+' : ''}{sym}{Math.abs(profit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                        <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>{margin.toFixed(1)}% margin</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: 10, fontWeight: 700, color: days <= 1 ? '#b91c1c' : days <= 3 ? '#d97706' : C.muted, margin: 0 }}>
                                        {days === 0 ? 'Expires today' : `${days}d left`}
                                    </p>
                                    <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>{link.views} view{link.views !== 1 ? 's' : ''}</p>
                                </div>
                            </div>

                            {/* Link URL */}
                            <div style={{ background: C.bg, borderRadius: 6, padding: '6px 10px', fontSize: 10, color: C.muted, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                {window.location.origin}/share/{link.id}
                            </div>

                            {/* Meta row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 10, color: C.muted }}>Shared {formatDate(link.created_at)} · Expires {formatExpiry(link.created_at)}</span>
                            </div>

                            {/* Action buttons */}
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                    onClick={() => copyLink(link.id)}
                                    style={{ flex: 1, height: 32, borderRadius: 6, border: `1px solid ${isCopied ? '#8fff00' : C.border}`, background: isCopied ? '#f0fdf4' : C.surface, cursor: 'pointer', fontSize: 11, fontWeight: 700, color: isCopied ? '#4a7c00' : C.text, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                                >
                                    {isCopied ? <><Check size={12} color="#4a7c00" /> Copied!</> : <><Copy size={12} color={C.muted} /> Copy link</>}
                                </button>
                                <button
                                    onClick={() => openLink(link.id)}
                                    style={{ width: 32, height: 32, borderRadius: 6, border: `1px solid ${C.border}`, background: C.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    title="Open in new tab"
                                >
                                    <ExternalLink size={13} color={C.muted} />
                                </button>
                                <button
                                    onClick={() => deleteLink(link.id)}
                                    disabled={isDeleting}
                                    style={{ width: 32, height: 32, borderRadius: 6, border: `1px solid ${C.border}`, background: C.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isDeleting ? 0.5 : 1 }}
                                    title="Delete link"
                                >
                                    <Trash2 size={13} color="#b91c1c" />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
