'use client'
// app/dashboard/listing-generator/components/MyTemplatesGallery.tsx
// ─────────────────────────────────────────────────────────────────
// "My Templates" gallery inside Listing Studio.
// Shows the seller's Design Studio visual templates (from visual_templates).
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
    Palette, ExternalLink, RefreshCw, Plus,
    Clock, Search, X, LayoutTemplate,
} from 'lucide-react'

const C = {
    bg:           '#f8f7ff',
    surface:      '#ffffff',
    border:       '#ede9fe',
    borderInput:  '#e5e0f5',
    primary:      '#7530fb',
    primaryHov:   '#6020e0',
    primaryLight: '#f3eeff',
    dark:         '#1e1535',
    body:         '#1f1d2e',
    secondary:    '#6b7280',
    muted:        '#9ca3af',
}

interface VisualTemplate {
    id:          string
    name:        string
    category:    string | null
    updated_at:  string
    blocks_json: unknown
}

interface Props {
    onClose?: () => void
}

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const d = Math.floor(diff / 86400000)
    if (d === 0) return 'Today'
    if (d === 1) return 'Yesterday'
    if (d < 7)  return `${d}d ago`
    if (d < 30) return `${Math.floor(d / 7)}w ago`
    return `${Math.floor(d / 30)}mo ago`
}

function Thumb({ name, size = 130 }: { name: string; size?: number }) {
    // Generate a consistent color from the template name
    const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
    return (
        <div style={{
            width: '100%', height: size,
            background: `linear-gradient(135deg, hsl(${hue},60%,94%), hsl(${hue},50%,87%))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
        }}>
            {[0,1,2,3].map(i => (
                <div key={i} style={{
                    position: 'absolute',
                    top:    `${12 + i * 20}%`,
                    left:   '10%', right: '10%',
                    height: '10%',
                    background: `hsl(${hue},60%,55%)`,
                    opacity: 0.18 - i * 0.03,
                    borderRadius: 4,
                }} />
            ))}
            <LayoutTemplate size={28} color={`hsl(${hue},60%,50%)`} style={{ opacity: 0.5, zIndex: 1 }} />
        </div>
    )
}

export default function MyTemplatesGallery({ onClose }: Props) {
    const [templates, setTemplates] = useState<VisualTemplate[]>([])
    const [loading, setLoading]     = useState(true)
    const [search, setSearch]       = useState('')
    const [hoverId, setHoverId]     = useState<string | null>(null)

    useEffect(() => { load() }, [])

    async function load() {
        setLoading(true)
        try {
            // Must use the authenticated client — visual_templates RLS requires auth.uid()
            const supabase = createClient()
            const { data, error } = await (supabase as any)
                .from('visual_templates')
                .select('id, name, category, updated_at, blocks_json')
                .order('updated_at', { ascending: false })

            if (error) {
                console.error('[MyTemplatesGallery] query error:', error)
            }
            setTemplates((data as VisualTemplate[]) ?? [])
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

    if (loading) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                <RefreshCw size={20} color={C.primary} className="animate-spin" />
            </div>
        )
    }

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
                        Build beautiful eBay listing templates in Design Studio. They&apos;ll appear here so you can attach them to any listing.
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

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 20px',
                borderBottom: `1px solid ${C.border}`,
                background: C.surface,
                flexShrink: 0,
            }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: C.primaryLight, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <LayoutTemplate size={15} color={C.primary} />
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
                            width: 180, outline: 'none',
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
                            No templates match &ldquo;{search}&rdquo;
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
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
                                        cursor: 'pointer',
                                    }}
                                >
                                    {/* Thumbnail */}
                                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                                        <Thumb name={t.name} size={120} />
                                        {isHov && (
                                            <div style={{
                                                position: 'absolute', inset: 0,
                                                background: 'rgba(30,21,53,0.5)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                                    <div style={{ padding: '10px 12px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                        <p style={{
                                            fontSize: 13, fontWeight: 700, color: C.body, margin: 0,
                                            fontFamily: 'DM Sans, sans-serif',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                        }}>
                                            {t.name}
                                        </p>

                                        <span style={{
                                            display: 'inline-block', alignSelf: 'flex-start',
                                            fontSize: 10, fontWeight: 600,
                                            padding: '2px 8px', borderRadius: 20,
                                            background: C.primaryLight, color: C.primary,
                                            fontFamily: 'DM Sans, sans-serif',
                                        }}>
                                            {t.category || 'General'}
                                        </span>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                            <Clock size={11} color={C.muted} />
                                            <span style={{ fontSize: 11, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                                {timeAgo(t.updated_at)}
                                            </span>
                                        </div>
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
