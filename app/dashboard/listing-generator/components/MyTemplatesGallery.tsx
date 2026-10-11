'use client'
// app/dashboard/listing-generator/components/MyTemplatesGallery.tsx
// ─────────────────────────────────────────────────────────────────
// "My Templates" gallery inside Listing Studio.
// Shows the seller's Design Studio visual templates with:
//   ✓ Thumbnail preview
//   ✓ Name, category, use_count, last edited
//   ✓ Open in Design Studio to edit
//   ✓ "Used by X listings" badge
//   ✓ Empty state with CTA to Design Studio
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { createClient as createRawClient } from '@supabase/supabase-js'
import {
    Palette, ExternalLink, RefreshCw, Plus,
    Clock, Layers, Search, X,
} from 'lucide-react'

// Raw client — listing_templates is not in the typed schema yet
const rawDb = createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    borderInput: '#e5e0f5',
    primary: '#7530fb',
    primaryHov: '#6020e0',
    primaryLight: '#f3eeff',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    success: '#16a34a',
    successBg: '#dcfce7',
    accent: '#b8fa33',
}

interface ListingTemplate {
    id: string
    name: string
    category: string
    description: string | null
    thumbnail_url: string | null
    use_count: number
    updated_at: string
    description_html: string | null
}

interface Props {
    onClose?: () => void
}

export default function MyTemplatesGallery({ onClose }: Props) {
    const [templates, setTemplates] = useState<ListingTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [hoverId, setHoverId] = useState<string | null>(null)

    useEffect(() => { load() }, [])

    async function load() {
        setLoading(true)
        try {
            // Get current user first
            const { data: { user } } = await rawDb.auth.getUser()
            if (!user) { setLoading(false); return }

            const { data } = await rawDb
                .from('listing_templates')
                .select('id, name, category, description, thumbnail_url, use_count, updated_at, description_html')
                .eq('user_id', user.id)
                .eq('is_system', false)
                .order('updated_at', { ascending: false })
            setTemplates((data as ListingTemplate[]) ?? [])
        } catch (err) {
            console.error('[MyTemplatesGallery] load error:', err)
        } finally {
            setLoading(false)
        }
    }

    const filtered = templates.filter(t =>
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.category ?? '').toLowerCase().includes(search.toLowerCase())
    )

    // ── Thumbnail ─────────────────────────────────────────────
    function Thumb({ t, size = 120 }: { t: ListingTemplate; size?: number }) {
        if (t.thumbnail_url) {
            return (
                <img
                    src={t.thumbnail_url}
                    alt={t.name}
                    style={{ width: '100%', height: size, objectFit: 'cover' }}
                />
            )
        }
        // Fallback: show a styled preview placeholder
        return (
            <div style={{
                width: '100%', height: size,
                background: `linear-gradient(135deg, #f3eeff, #e9d8fd)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
            }}>
                {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{
                        position: 'absolute',
                        top: `${12 + i * 20}%`,
                        left: '10%', right: '10%',
                        height: '10%',
                        background: C.primary,
                        opacity: 0.18 - i * 0.03,
                        borderRadius: 4,
                    }} />
                ))}
                <Palette size={32} color={C.primary} style={{ opacity: 0.4, zIndex: 1 }} />
            </div>
        )
    }

    function timeAgo(iso: string) {
        const diff = Date.now() - new Date(iso).getTime()
        const d = Math.floor(diff / 86400000)
        if (d === 0) return 'Today'
        if (d === 1) return 'Yesterday'
        if (d < 7) return `${d}d ago`
        if (d < 30) return `${Math.floor(d / 7)}w ago`
        return `${Math.floor(d / 30)}mo ago`
    }

    // ── Loading ───────────────────────────────────────────────
    if (loading) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                <RefreshCw size={20} color={C.primary} className="animate-spin" />
            </div>
        )
    }

    // ── Empty state ───────────────────────────────────────────
    if (templates.length === 0) {
        return (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 20 }}>
                <div style={{
                    width: 72, height: 72, borderRadius: 20,
                    background: C.primaryLight,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Palette size={32} color={C.primary} />
                </div>
                <div style={{ textAlign: 'center', maxWidth: 360 }}>
                    <p style={{ fontSize: 17, fontWeight: 700, color: C.dark, fontFamily: 'DM Sans, sans-serif', margin: '0 0 8px' }}>
                        No Design Studio templates yet
                    </p>
                    <p style={{ fontSize: 13, color: C.secondary, fontFamily: 'DM Sans, sans-serif', margin: 0, lineHeight: 1.6 }}>
                        Build beautiful eBay listing templates in Design Studio. They'll appear here so you can attach them to any listing.
                    </p>
                </div>
                <a
                    href="/dashboard/design"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '11px 22px', borderRadius: 12,
                        background: C.primary, color: '#fff',
                        fontSize: 13, fontWeight: 700,
                        textDecoration: 'none',
                        fontFamily: 'DM Sans, sans-serif',
                        boxShadow: '0 4px 16px rgba(117,48,251,0.3)',
                    }}
                >
                    <Plus size={15} />
                    Open Design Studio
                    <ExternalLink size={13} />
                </a>
            </div>
        )
    }

    // ── Main gallery ──────────────────────────────────────────
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

            {/* Header bar */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 20px',
                borderBottom: `1px solid ${C.border}`,
                background: C.surface,
                flexShrink: 0,
            }}>
                {/* Icon */}
                <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: C.primaryLight, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Palette size={15} color={C.primary} />
                </div>

                <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.dark, margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                        My Templates
                    </p>
                    <p style={{ fontSize: 11, color: C.muted, margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
                        {templates.length} template{templates.length !== 1 ? 's' : ''} from Design Studio
                    </p>
                </div>

                <div style={{ flex: 1 }} />

                {/* Search */}
                <div style={{ position: 'relative' }}>
                    <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search templates…"
                        style={{
                            paddingLeft: 28, paddingRight: search ? 28 : 12,
                            paddingTop: 7, paddingBottom: 7,
                            fontSize: 12, borderRadius: 10,
                            border: `1px solid ${C.borderInput}`,
                            background: C.bg, color: C.body,
                            fontFamily: 'DM Sans, sans-serif',
                            width: 200, outline: 'none',
                        }}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} style={{
                            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                            display: 'flex', alignItems: 'center',
                        }}>
                            <X size={11} color={C.muted} />
                        </button>
                    )}
                </div>

                {/* Open Design Studio */}
                <a
                    href="/dashboard/design"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '7px 14px', borderRadius: 10,
                        background: C.primary, color: '#fff',
                        fontSize: 12, fontWeight: 600,
                        textDecoration: 'none',
                        fontFamily: 'DM Sans, sans-serif',
                        flexShrink: 0,
                    }}
                >
                    <Plus size={13} />
                    New Template
                    <ExternalLink size={11} />
                </a>
            </div>

            {/* Grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', paddingTop: 60 }}>
                        <p style={{ fontSize: 14, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                            No templates match "{search}"
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: 16,
                    }}>
                        {filtered.map(t => {
                            const isHov = hoverId === t.id
                            return (
                                <div
                                    key={t.id}
                                    onMouseEnter={() => setHoverId(t.id)}
                                    onMouseLeave={() => setHoverId(null)}
                                    style={{
                                        borderRadius: 16,
                                        border: `1px solid ${isHov ? C.primary : C.border}`,
                                        background: C.surface,
                                        overflow: 'hidden',
                                        boxShadow: isHov
                                            ? '0 8px 24px rgba(117,48,251,0.14)'
                                            : '0 1px 4px rgba(117,48,251,0.05)',
                                        transform: isHov ? 'translateY(-2px)' : 'none',
                                        transition: 'all 0.15s ease',
                                        display: 'flex', flexDirection: 'column',
                                    }}
                                >
                                    {/* Thumbnail */}
                                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                                        <Thumb t={t} size={130} />

                                        {/* Hover overlay with Edit button */}
                                        {isHov && (
                                            <div style={{
                                                position: 'absolute', inset: 0,
                                                background: 'rgba(30,21,53,0.45)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                gap: 8,
                                            }}>
                                                <a
                                                    href={`/dashboard/design/visual-editor?id=${t.id}&name=${encodeURIComponent(t.name)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 5,
                                                        padding: '7px 14px', borderRadius: 8,
                                                        background: C.primary, color: '#fff',
                                                        fontSize: 12, fontWeight: 600,
                                                        textDecoration: 'none',
                                                        fontFamily: 'DM Sans, sans-serif',
                                                    }}
                                                >
                                                    Edit
                                                    <ExternalLink size={11} />
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {/* Name */}
                                        <p style={{
                                            fontSize: 13, fontWeight: 700, color: C.body, margin: 0,
                                            fontFamily: 'DM Sans, sans-serif',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                        }}>
                                            {t.name}
                                        </p>

                                        {/* Category chip */}
                                        <span style={{
                                            display: 'inline-block', alignSelf: 'flex-start',
                                            fontSize: 10, fontWeight: 600,
                                            padding: '2px 8px', borderRadius: 20,
                                            background: C.primaryLight, color: C.primary,
                                            fontFamily: 'DM Sans, sans-serif',
                                        }}>
                                            {t.category || 'General'}
                                        </span>

                                        {/* Stats row */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                                            {/* Use count */}
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                                <Layers size={11} color={C.muted} />
                                                {t.use_count} listing{t.use_count !== 1 ? 's' : ''}
                                            </span>

                                            {/* Last edited */}
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                                <Clock size={11} color={C.muted} />
                                                {timeAgo(t.updated_at)}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        {t.description && (
                                            <p style={{
                                                fontSize: 11, color: C.secondary, margin: 0,
                                                fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5,
                                                display: '-webkit-box', WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                            }}>
                                                {t.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
