'use client'
// components/ui/VisualEditor/IconsPanel.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Editor / Icons Panel (Left sidebar tab)
//
// Displays all available icons grouped by category.
// Clicking an icon while a Key Features block is selected updates
// the currently focused feature's icon prop.
//
// Props:
//   selectedFeatureIndex   — which feature card is focused (0-based), or null
//   onIconSelect(id)       — fires with the icon ID when user clicks
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
    ICON_LIBRARY,
    ICON_CATEGORIES,
    CATEGORY_LABELS,
    getIconSvg,
    customIconToEntry,
    type CustomIconRecord,
    type IconCategory,
    type IconEntry,
} from './IconLibrary'

// ─── Design tokens (match PropertiesPanel C object) ───────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    text: '#1e1535',
    secondary: '#64748b',
    muted: '#94a3b8',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface IconsPanelProps {
    /** Index of the feature card that will receive the icon (0-based), or null = no block focused */
    selectedFeatureIndex: number | null
    /** Called with the icon id string when user clicks an icon */
    onIconSelect: (iconId: string) => void
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface IconCardProps {
    id: string
    label: string
    svg: string
    onClick: () => void
    isActive?: boolean
    isCustom?: boolean
    onDelete?: () => void
}

function IconCard({ id, label, svg, onClick, isActive, isCustom, onDelete }: IconCardProps) {
    const [hovered, setHovered] = useState(false)

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={onClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                title={`${label} (${id})`}
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    padding: '10px 6px 8px',
                    borderRadius: 8,
                    border: `1.5px solid ${isActive ? C.primary : hovered ? C.primary : C.border}`,
                    background: isActive ? C.primaryLight : hovered ? C.primaryLight : C.surface,
                    cursor: 'pointer',
                    transition: 'border-color 0.12s, background 0.12s',
                    minWidth: 0,
                }}
            >
                <span
                    dangerouslySetInnerHTML={{ __html: svg }}
                    style={{ lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                />
                <span style={{
                    fontFamily: 'DM Sans, Arial, sans-serif',
                    fontSize: 9,
                    fontWeight: 500,
                    color: isActive ? C.primary : C.secondary,
                    textAlign: 'center',
                    lineHeight: 1.2,
                    wordBreak: 'break-word',
                    maxWidth: 54,
                }}>
                    {label}
                </span>
            </button>

            {/* Delete button for custom uploaded icons */}
            {isCustom && onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onDelete()
                    }}
                    title="Remove uploaded icon"
                    style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 10,
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                >
                    ×
                </button>
            )}
        </div>
    )
}

function UploadIconCard({ onClick }: { onClick: () => void }) {
    const [hovered, setHovered] = useState(false)

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            title="Upload custom SVG icon (.svg only)"
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                padding: '10px 6px 8px',
                borderRadius: 8,
                border: `1.5px dashed ${hovered ? C.primary : '#c4b5fd'}`,
                background: hovered ? C.primaryLight : '#faf5ff',
                cursor: 'pointer',
                transition: 'border-color 0.12s, background 0.12s',
                minWidth: 0,
            }}
        >
            <div style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: C.primaryLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: C.primary
            }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            </div>
            <span style={{
                fontFamily: 'DM Sans, Arial, sans-serif',
                fontSize: 9,
                fontWeight: 600,
                color: C.primary,
                textAlign: 'center',
                lineHeight: 1.2,
            }}>
                Upload
            </span>
        </button>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const CATEGORY_PREVIEW_ICONS: Record<IconCategory, [string, string, string, string]> = {
    trust: ['shield', 'check', 'star', 'verified'],
    product: ['box', 'tag', 'package', 'truck'],
    tech: ['zap', 'cpu', 'tool', 'wrench'],
    lifestyle: ['flame', 'droplet', 'leaf', 'heart'],
    pricing: ['price-coins', 'price-percent', 'price-gift', 'price-receipt'],
    customer: ['cs-phone', 'cs-chat', 'cs-smile', 'cs-rating'],
    business: ['biz-store', 'biz-globe', 'biz-verified-seller', 'biz-award'],
    tools: ['hw-wrench', 'hw-hammer', 'hw-settings', 'hw-sliders'],
    safety: ['saf-shield-check', 'saf-alert-triangle', 'saf-shield-check', 'saf-alert-triangle'],
    returns: ['ret-rotate-ccw', 'ret-badge-check', 'ret-rotate-ccw', 'ret-badge-check'],
    packaging: ['pkg-package', 'pkg-gift', 'pkg-package', 'pkg-gift'],
    compatibility: ['compat-plug', 'compat-link', 'compat-plug', 'compat-link'],
    condition: ['cond-sparkles', 'cond-refresh', 'cond-sparkles', 'cond-refresh'],
    eco: ['eco-leaf', 'eco-recycle', 'eco-leaf', 'eco-recycle'],
    payment: ['pay-credit-card', 'pay-lock', 'pay-credit-card', 'pay-lock'],
    location: ['loc-map-pin', 'loc-flag', 'loc-map-pin', 'loc-flag'],
}

export default function IconsPanel({ selectedFeatureIndex, onIconSelect }: IconsPanelProps) {
    const [query, setQuery] = useState('')
    const [activeIcon, setActiveIcon] = useState<string | null>(null)
    const [activeCategory, setActiveCategory] = useState<IconCategory | 'all' | 'custom' | null>(null)
    const [customIcons, setCustomIcons] = useState<IconEntry[]>([])
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const loadCustomIcons = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data, error } = await supabase
            .from('user_custom_icons' as any)
            .select('id, label, svg_content')
            .order('created_at', { ascending: false })
        if (error) { console.error('[IconsPanel] load:', error); return }
        const rows = (data ?? []) as { id: string; label: string; svg_content: string }[]
        setCustomIcons(rows.map(row => customIconToEntry({
            id: row.id,
            label: row.label,
            svgContent: row.svg_content,
        })))
    }, [supabase])

    useEffect(() => { loadCustomIcons() }, [loadCustomIcons])

    const iconColor = C.primary
    const noBlock = selectedFeatureIndex === null

    function handleUploadClick() {
        if (!uploading) fileInputRef.current?.click()
    }

    function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
        if (!isSvg) {
            alert('Please select an SVG file (.svg). Raster images (PNG, JPG) are not allowed.')
            e.target.value = ''
            return
        }
        const cleanLabel = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').slice(0, 16)
        const reader = new FileReader()
        reader.onload = async (event) => {
            const text = (event.target?.result as string) || ''
            const innerMatch = text.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i)
            const svgContent = innerMatch ? innerMatch[1] : text
            setUploading(true)
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) { alert('Please sign in to upload icons.'); return }
                const { data, error } = await supabase
                    .from('user_custom_icons' as any)
                    .insert([{ user_id: user.id, label: cleanLabel, svg_content: svgContent }] as never[])
                    .select('id')
                    .single()
                if (error) throw error
                await loadCustomIcons()
                handleSelect((data as { id: string }).id)
            } catch (err) {
                console.error('[IconsPanel] upload:', err)
                alert('Failed to save icon. Please try again.')
            } finally {
                setUploading(false)
            }
        }
        reader.readAsText(file)
        e.target.value = ''
    }

    async function handleDeleteCustom(id: string) {
        const { error } = await supabase
            .from('user_custom_icons' as any)
            .delete()
            .eq('id', id)
        if (error) { console.error('[IconsPanel] delete:', error); return }
        setCustomIcons(prev => prev.filter(ic => ic.id !== id))
        if (activeIcon === id) setActiveIcon(null)
    }

    const visibleIcons = useMemo<IconEntry[]>(() => {
        if (activeCategory === null) return []

        let pool: IconEntry[] = []
        if (activeCategory === 'custom') {
            pool = customIcons
        } else if (activeCategory === 'all') {
            pool = [...customIcons, ...ICON_CATEGORIES.flatMap(cat => ICON_LIBRARY[cat])]
        } else {
            pool = ICON_LIBRARY[activeCategory as IconCategory] || []
        }

        if (!query.trim()) return pool
        const q = query.toLowerCase()
        return pool.filter(e => e.id.toLowerCase().includes(q) || e.label.toLowerCase().includes(q))
    }, [query, activeCategory, customIcons])

    // When searching, auto-expand all
    const effectiveCategory = query.trim() ? 'all' : activeCategory

    const searchResults = useMemo<IconEntry[] | null>(() => {
        if (!query.trim()) return null
        const q = query.toLowerCase()
        const allPool: IconEntry[] = [...customIcons, ...ICON_CATEGORIES.flatMap(cat => ICON_LIBRARY[cat])]
        return allPool.filter(e => e.id.toLowerCase().includes(q) || e.label.toLowerCase().includes(q))
    }, [query, customIcons])

    function handleSelect(id: string) {
        setActiveIcon(id)
        onIconSelect(id)
    }

    const showGrid = query.trim() || activeCategory !== null

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.bg }}>

            {/* ── Hidden File Picker (Strict SVG Only) ── */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                style={{ display: 'none' }}
                onChange={handleFileSelected}
            />

            {/* ── Header ── */}
            <div style={{ padding: '14px 14px 10px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <p style={{ margin: 0, fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.secondary }}>
                        Icon Library
                    </p>
                    <button
                        onClick={handleUploadClick}
                        title="Upload custom SVG icon (.svg only)"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 8px',
                            background: C.primaryLight,
                            color: C.primary,
                            border: `1px solid ${C.border}`,
                            borderRadius: 6,
                            fontFamily: 'DM Sans, Arial, sans-serif',
                            fontSize: 10,
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Upload
                    </button>
                </div>

                {/* Search */}
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search icons…"
                        value={query}
                        onChange={e => { setQuery(e.target.value); if (e.target.value.trim()) { setActiveCategory('all') } else { setActiveCategory(null) } }}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '7px 10px 7px 30px', borderRadius: 7, border: `1.5px solid ${C.border}`, background: C.surface, fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 12, color: C.text, outline: 'none' }}
                    />
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.secondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </div>
            </div>

            {/* ── Scrollable body ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 20px' }}>

                {/* ── Category picker (shown when no search + no category selected, OR always as nav) ── */}
                {!query.trim() && (
                    <div style={{ marginBottom: activeCategory ? 14 : 0 }}>

                        {/* Back button when inside a category */}
                        {activeCategory && activeCategory !== 'all' && (
                            <button
                                onClick={() => setActiveCategory(null)}
                                style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 11, fontWeight: 600, color: C.primary }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                                All Categories
                            </button>
                        )}

                        {/* 2×2 category card grid — only show when no category selected */}
                        {activeCategory === null && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                {ICON_CATEGORIES.map(cat => {
                                    const previewIds = CATEGORY_PREVIEW_ICONS[cat]
                                    const previewIcons = previewIds.map(id => {
                                        for (const c of ICON_CATEGORIES) {
                                            const found = ICON_LIBRARY[c].find(e => e.id === id)
                                            if (found) return found
                                        }
                                        return null
                                    }).filter(Boolean)
                                    const count = ICON_LIBRARY[cat].length
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                padding: '14px 10px 12px',
                                                borderRadius: 10,
                                                border: `1.5px solid ${C.border}`,
                                                background: C.surface,
                                                cursor: 'pointer',
                                                transition: 'border-color 0.12s, box-shadow 0.12s',
                                                gap: 8,
                                            }}
                                            onMouseEnter={e => {
                                                ; (e.currentTarget as HTMLButtonElement).style.borderColor = C.primary
                                                    ; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 0 3px ${C.primaryLight}`
                                            }}
                                            onMouseLeave={e => {
                                                ; (e.currentTarget as HTMLButtonElement).style.borderColor = C.border
                                                    ; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
                                            }}
                                        >
                                            {/* 2×2 icon mosaic */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: '8px', borderRadius: 8, background: C.primaryLight }}>
                                                {previewIcons.map((entry, i) => (
                                                    <span
                                                        key={i}
                                                        dangerouslySetInnerHTML={{ __html: entry!.svg(C.primary, 16) }}
                                                        style={{ lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    />
                                                ))}
                                            </div>
                                            {/* Label */}
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 11, fontWeight: 700, color: C.text }}>
                                                    {CATEGORY_LABELS[cat]}
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Icon grid (shown after category selected OR searching) ── */}
                {(activeCategory !== null || query.trim()) && (
                    <>
                        {/* Category label row when inside a category */}
                        {activeCategory && activeCategory !== 'all' && !query.trim() && (
                            <p style={{ margin: '0 0 10px', fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.secondary }}>
                                {CATEGORY_LABELS[activeCategory as IconCategory]}
                            </p>
                        )}
                        {query.trim() && (
                            <p style={{ margin: '0 0 10px', fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.secondary }}>
                                Search results
                            </p>
                        )}
                        {(searchResults?.length === 0 && query.trim()) ? (
                            <p style={{ fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 12, color: C.muted, textAlign: 'center', marginTop: 24 }}>
                                No icons match &ldquo;{query}&rdquo;
                            </p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                                {/* Always accessible + Upload card in the grid */}
                                <UploadIconCard onClick={handleUploadClick} />

                                {/* Render custom uploaded icons first if any */}
                                {customIcons.map(entry => (
                                    <IconCard
                                        key={entry.id}
                                        id={entry.id}
                                        label={entry.label}
                                        svg={entry.svg(iconColor, 22)}
                                        isActive={activeIcon === entry.id}
                                        isCustom={true}
                                        onDelete={() => handleDeleteCustom(entry.id)}
                                        onClick={() => { if (!noBlock) handleSelect(entry.id) }}
                                    />
                                ))}

                                {/* Built-in icons */}
                                {(query.trim() ? searchResults! : (activeCategory && activeCategory !== 'all' && activeCategory !== 'custom' ? ICON_LIBRARY[activeCategory as IconCategory] : [])).map(entry => (
                                    <IconCard
                                        key={entry.id}
                                        id={entry.id}
                                        label={entry.label}
                                        svg={entry.svg(iconColor, 22)}
                                        isActive={activeIcon === entry.id}
                                        onClick={() => { if (!noBlock) handleSelect(entry.id) }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
