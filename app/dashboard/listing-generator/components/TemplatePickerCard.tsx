'use client'
// app/dashboard/listing-generator/components/TemplatePickerCard.tsx
// ─────────────────────────────────────────────────────────────────
// Lets a seller pick one of their Design Studio visual templates
// and attach it to the current listing draft.
// Shows a mini gallery of cards (thumbnail + name + category).
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Palette, Check, X, ExternalLink, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

const C = {
    bg:           '#f8f7ff',
    surface:      '#ffffff',
    border:       '#ede9fe',
    borderInput:  '#e5e0f5',
    primary:      '#7530fb',
    primaryLight: '#f3eeff',
    dark:         '#1e1535',
    body:         '#1f1d2e',
    secondary:    '#6b7280',
    muted:        '#9ca3af',
    success:      '#16a34a',
    successBg:    '#dcfce7',
}

interface VisualTemplate {
    id:                   string
    name:                 string
    category:             string
    thumbnail_url:        string | null
    use_count:            number
    updated_at:           string
    blocks_json:          any
    canvas_settings_json: any
}

interface Props {
    templateId: string | null
    onChange:   (id: string | null) => void
}

export default function TemplatePickerCard({ templateId, onChange }: Props) {
    const supabase = createClient()

    const [templates, setTemplates]   = useState<VisualTemplate[]>([])
    const [loading, setLoading]       = useState(true)
    const [expanded, setExpanded]     = useState(false)
    const [selected, setSelected]     = useState<VisualTemplate | null>(null)
    const [hoverId, setHoverId]       = useState<string | null>(null)

    useEffect(() => { loadTemplates() }, [])

    // When templateId prop changes (e.g. loading existing draft), sync selection
    useEffect(() => {
        if (!templateId) { setSelected(null); return }
        setSelected(prev => prev?.id === templateId ? prev : templates.find(t => t.id === templateId) ?? null)
    }, [templateId, templates])

    async function loadTemplates() {
        setLoading(true)
        const { data } = await (supabase.from('visual_templates') as any)
            .select('id, name, category, thumbnail_url, use_count, updated_at, blocks_json, canvas_settings_json')
            .order('updated_at', { ascending: false })
        setTemplates((data as VisualTemplate[]) ?? [])
        setLoading(false)
    }

    function pick(t: VisualTemplate) {
        setSelected(t)
        onChange(t.id)
        setExpanded(false)
    }

    function clear() {
        setSelected(null)
        onChange(null)
    }

    // ── Thumbnail: render first block preview or grey placeholder ──
    function Thumb({ t, size = 56 }: { t: VisualTemplate; size?: number }) {
        if (t.thumbnail_url) {
            return (
                <img
                    src={t.thumbnail_url}
                    alt={t.name}
                    style={{ width: size, height: size, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                />
            )
        }
        // Generate a mini canvas preview from blocks_json colour
        const blocks: any[] = t.blocks_json?.blocks ?? t.blocks_json ?? []
        const bg = t.canvas_settings_json?.backgroundColor ?? '#f3eeff'
        return (
            <div style={{
                width: size, height: size, borderRadius: 8, flexShrink: 0,
                background: bg, border: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', position: 'relative',
            }}>
                {blocks.slice(0, 3).map((b: any, i: number) => (
                    <div key={i} style={{
                        position: 'absolute',
                        top:    `${15 + i * 22}%`,
                        left:   '10%', right: '10%',
                        height: '14%',
                        background: b.style?.backgroundColor ?? b.style?.color ?? C.primary,
                        opacity: 0.35 - i * 0.08,
                        borderRadius: 3,
                    }} />
                ))}
                <Palette size={size * 0.28} color={C.primary} style={{ opacity: 0.5, zIndex: 1 }} />
            </div>
        )
    }

    // ── Empty state ───────────────────────────────────────────────
    if (!loading && templates.length === 0) {
        return (
            <div style={{
                border: `1px dashed ${C.border}`, borderRadius: 12,
                padding: '20px 24px', background: C.bg,
                display: 'flex', alignItems: 'center', gap: 16,
            }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: C.primaryLight, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Palette size={18} color={C.primary} />
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.body, margin: 0 }}>
                        No Design Studio templates yet
                    </p>
                    <p style={{ fontSize: 12, color: C.secondary, margin: '3px 0 0' }}>
                        Build a template in Design Studio and it will appear here.
                    </p>
                </div>
                <a
                    href="/dashboard/design"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 12, fontWeight: 600, color: C.primary,
                        textDecoration: 'none', flexShrink: 0,
                        padding: '7px 14px', borderRadius: 8,
                        background: C.primaryLight,
                    }}
                >
                    Open Design Studio
                    <ExternalLink size={12} />
                </a>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* ── Selected template chip / trigger ── */}
            <button
                onClick={() => setExpanded(e => !e)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    background: selected ? C.primaryLight : C.surface,
                    border: `1px solid ${selected ? C.primary : C.borderInput}`,
                    borderRadius: expanded ? '12px 12px 0 0' : 12,
                    padding: '10px 14px', cursor: 'pointer',
                    transition: 'all 0.15s ease',
                }}
            >
                {loading ? (
                    <RefreshCw size={14} color={C.muted} className="animate-spin" />
                ) : selected ? (
                    <Thumb t={selected} size={36} />
                ) : (
                    <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: C.primaryLight, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Palette size={16} color={C.primary} />
                    </div>
                )}

                <div style={{ flex: 1, textAlign: 'left' }}>
                    {selected ? (
                        <>
                            <p style={{ fontSize: 13, fontWeight: 600, color: C.body, margin: 0 }}>
                                {selected.name}
                            </p>
                            <p style={{ fontSize: 11, color: C.secondary, margin: '1px 0 0' }}>
                                {selected.category} · Used {selected.use_count} {selected.use_count === 1 ? 'time' : 'times'}
                            </p>
                        </>
                    ) : (
                        <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
                            {loading ? 'Loading templates…' : 'Pick a Design Studio template (optional)'}
                        </p>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {selected && (
                        <span
                            onClick={e => { e.stopPropagation(); clear() }}
                            style={{
                                width: 22, height: 22, borderRadius: '50%',
                                background: '#fee2e2', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <X size={11} color="#ef4444" />
                        </span>
                    )}
                    {expanded
                        ? <ChevronUp size={16} color={C.muted} />
                        : <ChevronDown size={16} color={C.muted} />
                    }
                </div>
            </button>

            {/* ── Dropdown gallery ── */}
            {expanded && (
                <div style={{
                    border: `1px solid ${C.primary}`,
                    borderTop: 'none',
                    borderRadius: '0 0 12px 12px',
                    background: C.surface,
                    padding: '12px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: 10,
                    maxHeight: 320,
                    overflowY: 'auto',
                }}>
                    {templates.map(t => {
                        const isActive  = templateId === t.id
                        const isHovered = hoverId === t.id
                        return (
                            <div
                                key={t.id}
                                onClick={() => pick(t)}
                                onMouseEnter={() => setHoverId(t.id)}
                                onMouseLeave={() => setHoverId(null)}
                                style={{
                                    border: `1.5px solid ${isActive ? C.primary : isHovered ? C.primary + '80' : C.border}`,
                                    borderRadius: 10,
                                    padding: '10px',
                                    cursor: 'pointer',
                                    background: isActive ? C.primaryLight : isHovered ? C.bg : C.surface,
                                    transition: 'all 0.12s ease',
                                    display: 'flex', flexDirection: 'column', gap: 8,
                                    position: 'relative',
                                }}
                            >
                                {/* Active checkmark */}
                                {isActive && (
                                    <div style={{
                                        position: 'absolute', top: 6, right: 6,
                                        width: 18, height: 18, borderRadius: '50%',
                                        background: C.primary,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Check size={10} color="#fff" strokeWidth={3} />
                                    </div>
                                )}

                                <Thumb t={t} size={40} />

                                <div>
                                    <p style={{
                                        fontSize: 12, fontWeight: 600, color: C.body,
                                        margin: 0, whiteSpace: 'nowrap',
                                        overflow: 'hidden', textOverflow: 'ellipsis',
                                    }}>
                                        {t.name}
                                    </p>
                                    <p style={{ fontSize: 10, color: C.muted, margin: '2px 0 0' }}>
                                        {t.category}
                                    </p>
                                </div>

                                {/* Open in Design Studio */}
                                <a
                                    href={`/dashboard/design/visual-editor?id=${t.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        fontSize: 10, color: C.primary,
                                        textDecoration: 'none', marginTop: 'auto',
                                    }}
                                >
                                    Edit in Design Studio
                                    <ExternalLink size={9} />
                                </a>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
