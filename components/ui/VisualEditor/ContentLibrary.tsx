'use client'
// components/ui/VisualEditor/ContentLibrary.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Editor / Content Library
//
// Shows all content, product, media, conversion, trust & typography blocks
// with search and collapsible category groups.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import {
    BLOCK_CATEGORIES,
    BLOCK_DEFINITIONS,
    BlockType,
    BlockCategory,
} from './blocks'
import { VisualCard } from './BlockLibrary'

const C = {
    bg: '#f8f7ff', surface: '#ffffff', border: '#ede9fe',
    primary: '#7530fb', primaryLight: '#f3eeff',
    dark: '#1e1535', body: '#1f1d2e', secondary: '#6b7280',
    muted: '#9ca3af', inputBorder: '#e5e0f5',
}

const CATEGORY_COLORS: Record<BlockCategory, string> = {
    'Layout': '#7530fb',
    'Content': '#0ea5e9',
    'Product': '#16a34a',
    'Media': '#d97706',
    'eBay Specific': '#16a34a',
    'Conversion': '#ef4444',
    'Header & Footer': '#1e1535',
    'Typography': '#6b7280',
}

// All categories EXCEPT Layout belong in the Content Library
const CONTENT_CATEGORIES = BLOCK_CATEGORIES.filter(cat => cat !== 'Layout')

interface ContentLibraryProps {
    onAddBlock: (type: BlockType) => void
    onDragStart: (type: BlockType) => void
    onDragEnd: () => void
    draggedType: BlockType | null
}

export default function ContentLibrary({ onAddBlock, onDragStart, onDragEnd, draggedType }: ContentLibraryProps) {
    const [search, setSearch] = useState('')
    const [hoveredType, setHovered] = useState<BlockType | null>(null)
    const [collapsed, setCollapsed] = useState<Set<BlockCategory>>(new Set())

    const query = search.trim().toLowerCase()
    const contentDefs = BLOCK_DEFINITIONS.filter(d => d.category !== 'Layout')

    const filteredDefs = query
        ? contentDefs.filter(d => d.label.toLowerCase().includes(query) || d.category.toLowerCase().includes(query))
        : contentDefs

    const handleDragStart = useCallback((e: React.DragEvent, type: BlockType) => {
        e.dataTransfer.setData('text/plain', type)
        e.dataTransfer.effectAllowed = 'copy'
        onDragStart(type)
    }, [onDragStart])

    const toggleCategory = (cat: BlockCategory) => {
        setCollapsed(prev => {
            const next = new Set(prev)
            next.has(cat) ? next.delete(cat) : next.add(cat)
            return next
        })
    }

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: C.bg, overflow: 'hidden' }}>

            {/* Search Content */}
            <div style={{ padding: '10px 12px 8px', borderBottom: `1px solid ${C.border}`, backgroundColor: C.surface, flexShrink: 0 }}>
                <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: C.muted, pointerEvents: 'none' }}>⌕</span>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search content..."
                        style={{
                            width: '100%', boxSizing: 'border-box' as const,
                            padding: '7px 10px 7px 28px',
                            border: `1px solid ${C.inputBorder}`,
                            borderRadius: 8, backgroundColor: C.bg,
                            fontFamily: 'DM Sans, sans-serif', fontSize: 12,
                            color: C.body, outline: 'none',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.primary}22` }}
                        onBlur={e => { e.currentTarget.style.borderColor = C.inputBorder; e.currentTarget.style.boxShadow = 'none' }}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 14, padding: 0 }}
                        >×</button>
                    )}
                </div>
            </div>

            {/* Content Categories Grid */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 16 }}>
                {query ? (
                    <div style={{ padding: '8px 10px 0' }}>
                        {filteredDefs.length === 0 ? (
                            <div style={{ padding: '32px 0', textAlign: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.muted }}>
                                No content matches "{search}"
                            </div>
                        ) : (
                            <>
                                <p style={{ margin: '8px 0', fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.muted, textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 600 }}>
                                    {filteredDefs.length} result{filteredDefs.length !== 1 ? 's' : ''}
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                    {filteredDefs.map(def => (
                                        <VisualCard
                                            key={def.type}
                                            def={def}
                                            hovered={hoveredType === def.type}
                                            dragging={draggedType === def.type}
                                            accentColor={CATEGORY_COLORS[def.category] || C.primary}
                                            onHover={setHovered}
                                            onAdd={onAddBlock}
                                            onDragStart={handleDragStart}
                                            onDragEnd={onDragEnd}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    CONTENT_CATEGORIES.map(cat => {
                        const defs = BLOCK_DEFINITIONS.filter(d => d.category === cat)
                        if (defs.length === 0) return null
                        const isCollapsed = collapsed.has(cat)

                        return (
                            <div key={cat}>
                                <button
                                    onClick={() => toggleCategory(cat)}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center',
                                        justifyContent: 'space-between', padding: '10px 14px 6px',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                        <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: CATEGORY_COLORS[cat] || C.primary, display: 'inline-block' }} />
                                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: C.secondary, textTransform: 'uppercase' as const, letterSpacing: '0.07em' }}>
                                            {cat}
                                        </span>
                                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted }}>
                                            {defs.length}
                                        </span>
                                    </div>
                                    <ChevronDown size={13} style={{ color: C.muted, transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                </button>
                                {!isCollapsed && (
                                    <div style={{ padding: '0 10px 4px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                        {defs.map(def => (
                                            <VisualCard
                                                key={def.type}
                                                def={def}
                                                hovered={hoveredType === def.type}
                                                dragging={draggedType === def.type}
                                                accentColor={CATEGORY_COLORS[def.category] || C.primary}
                                                onHover={setHovered}
                                                onAdd={onAddBlock}
                                                onDragStart={handleDragStart}
                                                onDragEnd={onDragEnd}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {/* Footer */}
            <div style={{ padding: '8px 14px', borderTop: `1px solid ${C.border}`, backgroundColor: C.surface, flexShrink: 0 }}>
                <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.muted, textAlign: 'center' }}>
                    Click or drag to add content
                </p>
            </div>
        </div>
    )
}
