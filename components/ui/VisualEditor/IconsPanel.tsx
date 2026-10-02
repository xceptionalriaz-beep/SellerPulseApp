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

import React, { useState, useMemo } from 'react'
import {
    ICON_LIBRARY,
    ICON_CATEGORIES,
    CATEGORY_LABELS,
    getIconSvg,
    type IconCategory,
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
}

function IconCard({ id, label, svg, onClick, isActive }: IconCardProps) {
    const [hovered, setHovered] = useState(false)

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            title={`${label} (${id})`}
            style={{
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
}

export default function IconsPanel({ selectedFeatureIndex, onIconSelect }: IconsPanelProps) {
    const [query, setQuery] = useState('')
    const [activeIcon, setActiveIcon] = useState<string | null>(null)
    const [activeCategory, setActiveCategory] = useState<IconCategory | 'all' | null>(null)

    const iconColor = C.primary
    const noBlock = selectedFeatureIndex === null

    const visibleIcons = useMemo(() => {
        if (activeCategory === null) return []
        const pool = activeCategory === 'all'
            ? ICON_CATEGORIES.flatMap(cat => ICON_LIBRARY[cat])
            : ICON_LIBRARY[activeCategory]
        if (!query.trim()) return pool
        const q = query.toLowerCase()
        return pool.filter(e => e.id.includes(q) || e.label.toLowerCase().includes(q))
    }, [query, activeCategory])

    // When searching, auto-expand all
    const effectiveCategory = query.trim() ? 'all' : activeCategory

    const searchResults = useMemo(() => {
        if (!query.trim()) return null
        const q = query.toLowerCase()
        return ICON_CATEGORIES.flatMap(cat => ICON_LIBRARY[cat])
            .filter(e => e.id.includes(q) || e.label.toLowerCase().includes(q))
    }, [query])

    function handleSelect(id: string) {
        setActiveIcon(id)
        onIconSelect(id)
    }

    const showGrid = query.trim() || activeCategory !== null

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.bg }}>

            {/* ── Header ── */}
            <div style={{ padding: '14px 14px 10px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                <p style={{ margin: '0 0 10px', fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.secondary }}>
                    Icon Library
                </p>
                {/* Search */}
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search icons…"
                        value={query}
                        onChange={e => { setQuery(e.target.value); if (e.target.value.trim()) setActiveCategory('all') }}
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
                                            {/* Label + count */}
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 2 }}>
                                                    {CATEGORY_LABELS[cat]}
                                                </div>
                                                <div style={{ fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 10, color: C.muted }}>
                                                    {count} icons
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
                                {CATEGORY_LABELS[activeCategory as IconCategory]} · {ICON_LIBRARY[activeCategory as IconCategory].length} icons
                            </p>
                        )}
                        {query.trim() && (
                            <p style={{ margin: '0 0 10px', fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.secondary }}>
                                Search results · {searchResults?.length ?? 0} icons
                            </p>
                        )}
                        {(searchResults?.length === 0 && query.trim()) ? (
                            <p style={{ fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 12, color: C.muted, textAlign: 'center', marginTop: 24 }}>
                                No icons match &ldquo;{query}&rdquo;
                            </p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                                {(query.trim() ? searchResults! : ICON_LIBRARY[activeCategory as IconCategory]).map(entry => (
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
