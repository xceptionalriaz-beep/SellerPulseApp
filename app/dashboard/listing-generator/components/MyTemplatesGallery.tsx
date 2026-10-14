'use client'
// app/dashboard/listing-generator/components/MyTemplatesGallery.tsx
// ─────────────────────────────────────────────────────────────────
// "My Templates" gallery inside Listing Studio.
// Shows the seller's Design Studio visual templates (from visual_templates).
//   ✓ Thumbnail preview (scaled iframe from blocks_json)
//   ✓ Name, category, last edited
//   ✓ Open in Design Studio to edit
//   ✓ Empty state with CTA to Design Studio
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import {
    Palette, ExternalLink, RefreshCw, Plus,
    Clock, Search, X, LayoutTemplate,
} from 'lucide-react'
import { assembleDocument } from '@/components/ui/VisualEditor/blocks'
import type { Block, CanvasSettings } from '@/components/ui/VisualEditor/blocks'

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

interface VisualTemplate {
    id: string
    name: string
    category: string | null
    blocks_json: Block[]
    canvas_settings_json: CanvasSettings
    updated_at: string
}

interface Props {
    onClose?: () => void
}

// ── Mini thumbnail via a scaled iframe ───────────────────────────────────────
function TemplateThumbnail({ t, height = 130 }: { t: VisualTemplate; height?: number }) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        if (!iframeRef.current) return
        try {
            const html = assembleDocument(t.blocks_json ?? [], t.canvas_settings_json)
            const doc = iframeRef.current.contentDocument
            if (!doc) return
            doc.open()
            doc.write(html)
            doc.close()
            setReady(true)
        } catch {
            // fall through to placeholder
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t.id])

    const SCALE = height / 780   // treat iframe as 780px tall doc

    return (
        <div style={{ width: '100%', height, position: 'relative', overflow: 'hidden', backgroundColor: '#f3eeff' }}>
            {/* Scaled iframe */}
            <iframe
                ref={iframeRef}
                title={t.name}
                sandbox="allow-same-origin"
                scrolling="no"
                style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: `${100 / SCALE}%`,
                    height: `${100 / SCALE}%`,
                    transform: `scale(${SCALE})`,
                    transformOrigin: 'top left',
                    border: 'none',
                    pointerEvents: 'none',
                    opacity: ready ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                }}
            />
            {/* Placeholder shown while iframe loads */}
            {!ready && (
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(135deg, #f3eeff, #e9d8fd)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                    <RefreshCw size={20} color={C.primary} style={{ opacity: 0.4, zIndex: 1 }} className="animate-spin" />
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function MyTemplatesGallery({ onClose }: Props) {
    const [templates, setTemplates] = useState<VisualTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [hoverId, setHoverId] = useState<string | null>(null)

    useEffect(() => { load() }, [])

    async function load() {
        setLoading(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setLoading(false); return }

            const { data } = await (supabase as any)
                .from('visual_templates')
                .select('id, name, category, blocks_json, canvas_settings_json, updated_at')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false })

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
                            No templates match &ldquo;{search}&rdquo;
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
                                        <TemplateThumbnail t={t} height={130} />

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

                                        {/* Last edited */}
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
