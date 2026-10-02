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

export default function IconsPanel({ selectedFeatureIndex, onIconSelect }: IconsPanelProps) {
    const [query, setQuery] = useState('')
    const [activeIcon, setActiveIcon] = useState<string | null>(null)
    const [activeCategory, setActiveCategory] = useState<IconCategory | 'all'>('all')

    const iconColor = C.primary
    const noBlock = selectedFeatureIndex === null

    const visibleIcons = useMemo(() => {
        const pool = activeCategory === 'all'
            ? ICON_CATEGORIES.flatMap(cat => ICON_LIBRARY[cat])
            : ICON_LIBRARY[activeCategory]
        if (!query.trim()) return pool
        const q = query.toLowerCase()
        return pool.filter(e => e.id.includes(q) || e.label.toLowerCase().includes(q))
    }, [query, activeCategory])

    function handleSelect(id: string) {
        setActiveIcon(id)
        onIconSelect(id)
    }

    const pills: Array<{ id: IconCategory | 'all'; label: string }> = [
        { id: 'all', label: 'All' },
        ...ICON_CATEGORIES.map(cat => ({ id: cat, label: CATEGORY_LABELS[cat] })),
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.bg }}>

            {/* ── Header: search + category pills ── */}
            <div style={{ padding: '14px 14px 0', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                <p style={{ margin: '0 0 10px', fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.secondary }}>
                    Icon Library
                </p>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: 10 }}>
                    <input
                        type="text"
                        placeholder="Search icons…"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '7px 10px 7px 30px', borderRadius: 7, border: `1.5px solid ${C.border}`, background: C.surface, fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 12, color: C.text, outline: 'none' }}
                    />
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.secondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </div>

                {/* Category pills — horizontal scroll */}
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, scrollbarWidth: 'none' }}>
                    {pills.map(pill => {
                        const isActive = activeCategory === pill.id
                        return (
                            <button
                                key={pill.id}
                                onClick={() => setActiveCategory(pill.id)}
                                style={{
                                    flexShrink: 0,
                                    padding: '4px 12px',
                                    borderRadius: 20,
                                    border: `1.5px solid ${isActive ? C.primary : C.border}`,
                                    background: isActive ? C.primary : C.surface,
                                    color: isActive ? '#ffffff' : C.secondary,
                                    fontFamily: 'DM Sans, Arial, sans-serif',
                                    fontSize: 11,
                                    fontWeight: isActive ? 700 : 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.12s',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {pill.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* ── Status banner ── */}
            <div style={{ padding: '8px 14px 0', flexShrink: 0 }}>
                {noBlock ? (
                    <div style={{ padding: '7px 10px', borderRadius: 7, background: '#fff7ed', border: '1px solid #fed7aa' }}>
                        <p style={{ margin: 0, fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 11, color: '#92400e', lineHeight: 1.4 }}>
                            ⚡ Select a feature card in the Properties Panel first, then click an icon to assign it.
                        </p>
                    </div>
                ) : (
                    <div style={{ padding: '7px 10px', borderRadius: 7, background: C.primaryLight, border: `1px solid ${C.border}` }}>
                        <p style={{ margin: 0, fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 11, color: C.primary, lineHeight: 1.4 }}>
                            ✓ Clicking an icon will update Feature {selectedFeatureIndex! + 1}
                        </p>
                    </div>
                )}
            </div>

            {/* ── Icon grid ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px 20px' }}>
                {visibleIcons.length === 0 ? (
                    <p style={{ fontFamily: 'DM Sans, Arial, sans-serif', fontSize: 12, color: C.muted, textAlign: 'center', marginTop: 24 }}>
                        No icons match &ldquo;{query}&rdquo;
                    </p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                        {visibleIcons.map(entry => (
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
            </div>
        </div>
    )
}
