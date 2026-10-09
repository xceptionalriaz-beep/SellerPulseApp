'use client'
// components/ui/VisualEditor/SavedTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Editor / Saved Templates Tab
//
// Lists all templates the logged-in user has saved to Supabase.
// Each entry shows name + last saved date + Load + Delete buttons.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState, useCallback } from 'react'
import { Folder, Trash2, Download, RefreshCw, Clock, Copy } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Block, CanvasSettings, assembleDocument } from './blocks'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    danger: '#ef4444',
    dangerLight: '#fee2e2',
    success: '#16a34a',
    successLight: '#dcfce7',
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface SavedTemplate {
    id: string
    name: string
    blocks_json: Block[]
    canvas_settings_json: CanvasSettings
    updated_at: string
    category: string
}

const CATEGORY_LABELS: Record<string, string> = {
    general: 'General',
    electronics: 'Electronics',
    fashion: 'Fashion & Beauty',
    home: 'Home & Garden',
    auto: 'Auto Parts',
    pet: 'Pet Supplies',
    sports: 'Sports & Outdoors',
    toys: 'Toys & Games',
}

interface SavedTabProps {
    onLoad: (name: string, blocks: Block[], settings: CanvasSettings, id: string) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function SavedTab({ onLoad }: SavedTabProps) {
    const [templates, setTemplates] = useState<SavedTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [categoryFilter, setCategoryFilter] = useState<string>('all')

    const fetchTemplates = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const supabase = createClient()
            const { data, error: err } = await supabase
                .from('visual_templates')
                .select('id, name, blocks_json, canvas_settings_json, updated_at, category')
                .order('updated_at', { ascending: false })

            if (err) throw err
            setTemplates((data as SavedTemplate[]) ?? [])
        } catch (e: unknown) {
            setError('Could not load templates. Please try again.')
            console.error('[SavedTab] fetch error:', e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchTemplates()
    }, [fetchTemplates])

    const handleDelete = useCallback(async (id: string) => {
        if (!window.confirm('Delete this template? This cannot be undone.')) return
        setDeletingId(id)
        try {
            const supabase = createClient()
            const { error: err } = await supabase
                .from('visual_templates')
                .delete()
                .eq('id', id)
            if (err) throw err
            setTemplates(prev => prev.filter(t => t.id !== id))
        } catch (e: unknown) {
            console.error('[SavedTab] delete error:', e)
            setError('Could not delete template.')
        } finally {
            setDeletingId(null)
        }
    }, [])

    const handleDuplicate = useCallback(async (t: SavedTemplate) => {
        setDuplicatingId(t.id)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { error: err } = await (supabase.from('visual_templates') as any)
                .insert({
                    user_id: user.id,
                    name: `${t.name} (copy)`,
                    blocks_json: t.blocks_json,
                    canvas_settings_json: t.canvas_settings_json,
                    category: t.category ?? 'general',
                    updated_at: new Date().toISOString(),
                })
            if (err) throw err
            await fetchTemplates()
        } catch (e: unknown) {
            console.error('[SavedTab] duplicate error:', e)
        } finally {
            setDuplicatingId(null)
        }
    }, [fetchTemplates])

    // ── Relative time helper ──────────────────────────────────────────────────
    function relativeTime(iso: string): string {
        const diff = Date.now() - new Date(iso).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'just now'
        if (mins < 60) return `${mins}m ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ago`
        const days = Math.floor(hrs / 24)
        return `${days}d ago`
    }

    // ── Loading state ─────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                height: '100%', gap: 10, padding: 24,
            }}>
                <RefreshCw size={20} style={{ color: C.muted, animation: 'spin 1s linear infinite' }} />
                <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.muted }}>
                    Loading templates…
                </p>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    // ── Error state ───────────────────────────────────────────────────────────
    if (error) {
        return (
            <div style={{ padding: 16 }}>
                <div style={{
                    padding: '10px 14px', borderRadius: 8,
                    backgroundColor: C.dangerLight,
                    border: `1px solid #fecaca`,
                }}>
                    <p style={{ margin: '0 0 8px', fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.danger, fontWeight: 600 }}>
                        {error}
                    </p>
                    <button
                        onClick={fetchTemplates}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '4px 10px', borderRadius: 6,
                            border: `1px solid #fecaca`,
                            backgroundColor: C.surface,
                            color: C.danger, fontSize: 11,
                            fontFamily: 'DM Sans, sans-serif',
                            cursor: 'pointer',
                        }}
                    >
                        <RefreshCw size={10} /> Try again
                    </button>
                </div>
            </div>
        )
    }

    // ── Empty state ───────────────────────────────────────────────────────────
    if (templates.length === 0) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                height: '100%', gap: 12, padding: 24,
            }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    backgroundColor: C.primaryLight,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Folder size={22} style={{ color: C.primary }} />
                </div>
                <p style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: C.dark, textAlign: 'center' }}>
                    No saved templates yet
                </p>
                <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 1.5 }}>
                    Build a template then click&nbsp;
                    <strong style={{ color: C.primary }}>Save</strong> in the toolbar to save it here.
                </p>
            </div>
        )
    }

    // ── Template list ─────────────────────────────────────────────────────────
    const categories = ['all', ...Array.from(new Set(templates.map(t => t.category ?? 'general')))]
    const filtered = categoryFilter === 'all'
        ? templates
        : templates.filter(t => (t.category ?? 'general') === categoryFilter)

    return (
        <div style={{
            height: '100%', overflowY: 'auto',
            display: 'flex', flexDirection: 'column',
        }}>
            {/* Header */}
            <div style={{
                padding: '10px 14px 6px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0,
            }}>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.muted }}>
                    {filtered.length} of {templates.length} template{templates.length !== 1 ? 's' : ''}
                </span>
                <button
                    onClick={fetchTemplates}
                    title="Refresh"
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: C.muted, padding: 4, borderRadius: 4,
                        display: 'flex', alignItems: 'center',
                    }}
                >
                    <RefreshCw size={12} />
                </button>
            </div>

            {/* Category filter pills */}
            {categories.length > 2 && (
                <div style={{
                    padding: '0 10px 8px',
                    display: 'flex', gap: 4, flexWrap: 'wrap',
                    flexShrink: 0,
                }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            style={{
                                padding: '3px 8px',
                                borderRadius: 20,
                                border: `1px solid ${categoryFilter === cat ? C.primary : C.border}`,
                                backgroundColor: categoryFilter === cat ? C.primary : C.surface,
                                color: categoryFilter === cat ? '#fff' : C.muted,
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: 10, fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                        >
                            {cat === 'all' ? 'All' : (CATEGORY_LABELS[cat] ?? cat)}
                        </button>
                    ))}
                </div>
            )}

            {/* List */}
            <div style={{ padding: '0 10px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filtered.length === 0 ? (
                    <p style={{ margin: '24px auto', fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.muted, textAlign: 'center' }}>
                        No templates in this category
                    </p>
                ) : filtered.map(t => (
                    <SavedTemplateCard
                        key={t.id}
                        template={t}
                        deleting={deletingId === t.id}
                        duplicating={duplicatingId === t.id}
                        onLoad={() => onLoad(t.name, t.blocks_json, t.canvas_settings_json, t.id)}
                        onDelete={() => handleDelete(t.id)}
                        onDuplicate={() => handleDuplicate(t)}
                        relativeTime={relativeTime}
                    />
                ))}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVED TEMPLATE CARD — shows live HTML thumbnail + name + actions
// ─────────────────────────────────────────────────────────────────────────────
function SavedTemplateCard({
    template,
    deleting,
    duplicating,
    onLoad,
    onDelete,
    onDuplicate,
    relativeTime,
}: {
    template: SavedTemplate
    deleting: boolean
    duplicating: boolean
    onLoad: () => void
    onDelete: () => void
    onDuplicate: () => void
    relativeTime: (iso: string) => string
}) {
    const [hovered, setHovered] = useState(false)

    // Build the scaled HTML thumbnail once — assembleDocument gives us the
    // full email HTML from the saved blocks, same as the canvas does.
    const [thumbnailHtml] = useState(() => {
        try {
            const blocks = Array.isArray(template.blocks_json) ? template.blocks_json : []
            if (blocks.length === 0) return ''
            return assembleDocument(blocks, template.canvas_settings_json)
        } catch {
            return ''
        }
    })

    const blockCount = Array.isArray(template.blocks_json) ? template.blocks_json.length : 0

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                backgroundColor: C.surface,
                border: `1.5px solid ${hovered ? C.primary : C.border}`,
                borderRadius: 10,
                overflow: 'hidden',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                boxShadow: hovered ? `0 2px 12px ${C.primary}18` : 'none',
            }}
        >
            {/* ── Thumbnail ── */}
            <div style={{
                position: 'relative',
                height: 110,
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
            }}
                onClick={onLoad}
            >
                {thumbnailHtml ? (
                    <div
                        style={{
                            transform: 'scale(0.28)',
                            transformOrigin: 'top left',
                            width: '357%',           /* 100 / 0.28 */
                            pointerEvents: 'none',
                            fontFamily: 'Arial, sans-serif',
                            fontSize: 14,
                            lineHeight: 1.4,
                            color: '#1f1d2e',
                        }}
                        dangerouslySetInnerHTML={{ __html: thumbnailHtml }}
                    />
                ) : (
                    /* Fallback when no blocks */
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        backgroundColor: C.bg,
                    }}>
                        <Folder size={24} style={{ color: C.border }} />
                        <span style={{
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 10,
                            color: C.muted,
                        }}>
                            No preview
                        </span>
                    </div>
                )}

                {/* Hover overlay */}
                {hovered && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundColor: 'rgba(30,21,53,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <span style={{
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#fff',
                            backgroundColor: C.primary,
                            padding: '6px 16px',
                            borderRadius: 8,
                            boxShadow: `0 2px 8px ${C.primary}66`,
                        }}>
                            Load Template
                        </span>
                    </div>
                )}
            </div>

            {/* ── Footer ── */}
            <div style={{
                padding: '8px 10px',
                borderTop: `1px solid ${C.border}`,
            }}>
                {/* Name + meta */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 7 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                            margin: 0,
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 12, fontWeight: 700,
                            color: hovered ? C.primary : C.dark,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            transition: 'color 0.15s',
                        }}>
                            {template.name}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <Clock size={9} style={{ color: C.muted }} />
                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted }}>
                                {relativeTime(template.updated_at)}
                            </span>
                            <span style={{ color: C.border }}>·</span>
                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted }}>
                                {blockCount} block{blockCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Category badge */}
                {template.category && template.category !== 'general' && (
                    <div style={{ marginBottom: 6 }}>
                        <span style={{
                            display: 'inline-block',
                            padding: '2px 7px',
                            borderRadius: 10,
                            backgroundColor: C.primaryLight,
                            color: C.primary,
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 9, fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                        }}>
                            {CATEGORY_LABELS[template.category] ?? template.category}
                        </span>
                    </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 6 }}>
                    <button
                        onClick={onLoad}
                        style={{
                            flex: 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                            padding: '5px 8px',
                            border: `1px solid ${C.primary}`,
                            borderRadius: 7,
                            backgroundColor: C.primary,
                            color: '#ffffff',
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 11, fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        <Download size={11} />
                        Load
                    </button>
                    <button
                        onClick={onDuplicate}
                        disabled={duplicating}
                        title="Duplicate template"
                        style={{
                            width: 30, height: 30,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `1px solid ${C.border}`,
                            borderRadius: 7,
                            backgroundColor: 'transparent',
                            color: C.muted,
                            cursor: duplicating ? 'default' : 'pointer',
                            opacity: duplicating ? 0.5 : 1,
                            flexShrink: 0,
                        }}
                    >
                        {duplicating
                            ? <RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} />
                            : <Copy size={11} />
                        }
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={deleting}
                        title="Delete template"
                        style={{
                            width: 30, height: 30,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `1px solid #fecaca`,
                            borderRadius: 7,
                            backgroundColor: 'transparent',
                            color: C.danger,
                            cursor: deleting ? 'default' : 'pointer',
                            opacity: deleting ? 0.5 : 1,
                            flexShrink: 0,
                        }}
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
        </div>
    )
}
