'use client'
// components/ui/VisualEditor/SavedTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Editor / Saved Templates Tab
//
// Lists all templates the logged-in user has saved to Supabase.
// Each entry shows name + last saved date + Load + Delete buttons.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState, useCallback } from 'react'
import { Folder, Trash2, Download, RefreshCw, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Block, CanvasSettings } from './blocks'

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
}

interface SavedTabProps {
    onLoad: (name: string, blocks: Block[], settings: CanvasSettings) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function SavedTab({ onLoad }: SavedTabProps) {
    const [templates, setTemplates] = useState<SavedTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const fetchTemplates = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const supabase = createClient()
            const { data, error: err } = await supabase
                .from('visual_templates')
                .select('id, name, blocks_json, canvas_settings_json, updated_at')
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
                    {templates.length} saved template{templates.length !== 1 ? 's' : ''}
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

            {/* List */}
            <div style={{ padding: '0 10px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {templates.map(t => (
                    <div
                        key={t.id}
                        style={{
                            backgroundColor: C.surface,
                            border: `1px solid ${C.border}`,
                            borderRadius: 10,
                            padding: '10px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                        }}
                    >
                        {/* Name + time */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                                backgroundColor: C.primaryLight,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Folder size={13} style={{ color: C.primary }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                    margin: 0,
                                    fontFamily: 'DM Sans, sans-serif',
                                    fontSize: 12, fontWeight: 700,
                                    color: C.dark,
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}>
                                    {t.name}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                    <Clock size={9} style={{ color: C.muted }} />
                                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted }}>
                                        {relativeTime(t.updated_at)}
                                    </span>
                                    <span style={{ color: C.border }}>·</span>
                                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted }}>
                                        {Array.isArray(t.blocks_json) ? t.blocks_json.length : 0} blocks
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button
                                onClick={() => onLoad(t.name, t.blocks_json, t.canvas_settings_json)}
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
                                onClick={() => handleDelete(t.id)}
                                disabled={deletingId === t.id}
                                title="Delete template"
                                style={{
                                    width: 30, height: 30,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: `1px solid #fecaca`,
                                    borderRadius: 7,
                                    backgroundColor: 'transparent',
                                    color: C.danger,
                                    cursor: deletingId === t.id ? 'default' : 'pointer',
                                    opacity: deletingId === t.id ? 0.5 : 1,
                                    flexShrink: 0,
                                }}
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
