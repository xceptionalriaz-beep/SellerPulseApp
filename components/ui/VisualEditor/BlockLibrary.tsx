'use client'
// components/ui/VisualEditor/BlockLibrary.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Editor / Block Library (Left Panel)
//
// Displays all available block types grouped by category.
// Each block card is draggable (HTML5 native) AND clickable to add.
//
// Props:
//   onAddBlock(type)   — called when user clicks or drops a block onto canvas
//   draggedType        — currently dragged block type (set by this component,
//                        read by Canvas to accept the drop)
//   onDragStart(type)  — tells parent which block is being dragged
//   onDragEnd()        — tells parent drag is done
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react'
import {
    BLOCK_CATEGORIES,
    BLOCK_DEFINITIONS,
    BlockType,
    BlockCategory,
    BlockDefinition,
} from './blocks'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    primaryBorder: '#ddd6fe',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    accent: '#b8fa33',
    inputBorder: '#e5e0f5',
}

// Category accent colours — subtle left-border per group
const CATEGORY_COLORS: Record<BlockCategory, string> = {
    'Layout': '#7530fb',
    'Content': '#0ea5e9',
    'Product': '#16a34a',
    'Media': '#d97706',
    'eBay Specific': '#b8fa33',
}

// Category label colors for the section header text
const CATEGORY_LABEL_COLORS: Record<BlockCategory, string> = {
    'Layout': '#7530fb',
    'Content': '#0ea5e9',
    'Product': '#16a34a',
    'Media': '#d97706',
    'eBay Specific': '#1e1535',
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface BlockLibraryProps {
    onAddBlock: (type: BlockType) => void
    onDragStart: (type: BlockType) => void
    onDragEnd: () => void
    draggedType: BlockType | null
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function BlockLibrary({
    onAddBlock,
    onDragStart,
    onDragEnd,
    draggedType,
}: BlockLibraryProps) {
    const [search, setSearch] = useState('')
    const [hoveredType, setHoveredType] = useState<BlockType | null>(null)
    const [collapsed, setCollapsed] = useState<Set<BlockCategory>>(new Set())

    // ── Search filter ─────────────────────────────────────────────────────────
    const query = search.trim().toLowerCase()
    const filteredDefs: BlockDefinition[] = query
        ? BLOCK_DEFINITIONS.filter(d =>
            d.label.toLowerCase().includes(query) ||
            d.description.toLowerCase().includes(query) ||
            d.category.toLowerCase().includes(query)
        )
        : BLOCK_DEFINITIONS

    // ── Drag handlers ─────────────────────────────────────────────────────────
    const handleDragStart = useCallback(
        (e: React.DragEvent, type: BlockType) => {
            e.dataTransfer.setData('text/plain', type)
            e.dataTransfer.effectAllowed = 'copy'
            onDragStart(type)
        },
        [onDragStart]
    )

    const handleDragEnd = useCallback(() => {
        onDragEnd()
    }, [onDragEnd])

    // ── Toggle category collapse ──────────────────────────────────────────────
    const toggleCategory = (cat: BlockCategory) => {
        setCollapsed(prev => {
            const next = new Set(prev)
            if (next.has(cat)) next.delete(cat)
            else next.add(cat)
            return next
        })
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{
            width: 240,
            minWidth: 240,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: C.bg,
            borderRight: `1px solid ${C.border}`,
            overflow: 'hidden',
            flexShrink: 0,
        }}>

            {/* ── Header ── */}
            <div style={{
                padding: '14px 16px 10px',
                borderBottom: `1px solid ${C.border}`,
                backgroundColor: C.surface,
                flexShrink: 0,
            }}>
                <p style={{
                    margin: '0 0 10px',
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700,
                    fontSize: 13,
                    color: C.dark,
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                }}>
                    Content &amp; Blocks
                </p>

                {/* Search */}
                <div style={{ position: 'relative' }}>
                    <span style={{
                        position: 'absolute',
                        left: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: 13,
                        color: C.muted,
                        pointerEvents: 'none',
                        lineHeight: 1,
                    }}>
                        ⌕
                    </span>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search blocks..."
                        style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '7px 10px 7px 28px',
                            border: `1px solid ${C.inputBorder}`,
                            borderRadius: 8,
                            backgroundColor: C.bg,
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 12,
                            color: C.body,
                            outline: 'none',
                        }}
                        onFocus={e => {
                            e.currentTarget.style.borderColor = C.primary
                            e.currentTarget.style.boxShadow = `0 0 0 3px ${C.primary}22`
                        }}
                        onBlur={e => {
                            e.currentTarget.style.borderColor = C.inputBorder
                            e.currentTarget.style.boxShadow = 'none'
                        }}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            style={{
                                position: 'absolute',
                                right: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: C.muted,
                                fontSize: 14,
                                lineHeight: 1,
                                padding: 0,
                            }}
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* ── Block list ── */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                paddingBottom: 16,
            }}>

                {/* Search results — flat list */}
                {query ? (
                    <div style={{ padding: '8px 12px 0' }}>
                        {filteredDefs.length === 0 ? (
                            <div style={{
                                padding: '24px 0',
                                textAlign: 'center',
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: 12,
                                color: C.muted,
                            }}>
                                No blocks match "{search}"
                            </div>
                        ) : (
                            <>
                                <p style={{
                                    margin: '8px 0 6px',
                                    fontFamily: 'DM Sans, sans-serif',
                                    fontSize: 11,
                                    color: C.muted,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    fontWeight: 600,
                                }}>
                                    {filteredDefs.length} result{filteredDefs.length !== 1 ? 's' : ''}
                                </p>
                                {filteredDefs.map(def => (
                                    <BlockCard
                                        key={def.type}
                                        def={def}
                                        hovered={hoveredType === def.type}
                                        dragging={draggedType === def.type}
                                        accentColor={CATEGORY_COLORS[def.category]}
                                        onHover={setHoveredType}
                                        onAdd={onAddBlock}
                                        onDragStart={handleDragStart}
                                        onDragEnd={handleDragEnd}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                ) : (
                    /* Grouped by category */
                    BLOCK_CATEGORIES.map(cat => {
                        const defs = BLOCK_DEFINITIONS.filter(d => d.category === cat)
                        const isCollapsed = collapsed.has(cat)
                        return (
                            <CategorySection
                                key={cat}
                                category={cat}
                                definitions={defs}
                                isCollapsed={isCollapsed}
                                accentColor={CATEGORY_COLORS[cat]}
                                labelColor={CATEGORY_LABEL_COLORS[cat]}
                                hoveredType={hoveredType}
                                draggedType={draggedType}
                                onToggle={() => toggleCategory(cat)}
                                onHover={setHoveredType}
                                onAdd={onAddBlock}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            />
                        )
                    })
                )}
            </div>

            {/* ── Footer hint ── */}
            <div style={{
                padding: '10px 14px',
                borderTop: `1px solid ${C.border}`,
                backgroundColor: C.surface,
                flexShrink: 0,
            }}>
                <p style={{
                    margin: 0,
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 11,
                    color: C.muted,
                    textAlign: 'center',
                    lineHeight: 1.5,
                }}>
                    Drag or click to add · Reorder on canvas
                </p>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY SECTION
// ─────────────────────────────────────────────────────────────────────────────
interface CategorySectionProps {
    category: BlockCategory
    definitions: BlockDefinition[]
    isCollapsed: boolean
    accentColor: string
    labelColor: string
    hoveredType: BlockType | null
    draggedType: BlockType | null
    onToggle: () => void
    onHover: (type: BlockType | null) => void
    onAdd: (type: BlockType) => void
    onDragStart: (e: React.DragEvent, type: BlockType) => void
    onDragEnd: () => void
}

function CategorySection({
    category,
    definitions,
    isCollapsed,
    accentColor,
    labelColor,
    hoveredType,
    draggedType,
    onToggle,
    onHover,
    onAdd,
    onDragStart,
    onDragEnd,
}: CategorySectionProps) {
    const [headerHovered, setHeaderHovered] = useState(false)

    return (
        <div>
            {/* Category header — clickable to collapse */}
            <button
                onClick={onToggle}
                onMouseEnter={() => setHeaderHovered(true)}
                onMouseLeave={() => setHeaderHovered(false)}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px 6px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    {/* Accent dot */}
                    <span style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: accentColor,
                        display: 'inline-block',
                        flexShrink: 0,
                    }} />
                    <span style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: 11,
                        fontWeight: 700,
                        color: headerHovered ? labelColor : C.secondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                        transition: 'color 0.15s',
                    }}>
                        {category}
                    </span>
                    <span style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: 10,
                        color: C.muted,
                        marginLeft: 2,
                    }}>
                        {definitions.length}
                    </span>
                </div>

                {/* Collapse chevron */}
                <span style={{
                    fontSize: 10,
                    color: C.muted,
                    transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    display: 'inline-block',
                }}>
                    ▾
                </span>
            </button>

            {/* Block cards */}
            {!isCollapsed && (
                <div style={{ padding: '0 12px 4px' }}>
                    {definitions.map(def => (
                        <BlockCard
                            key={def.type}
                            def={def}
                            hovered={hoveredType === def.type}
                            dragging={draggedType === def.type}
                            accentColor={accentColor}
                            onHover={onHover}
                            onAdd={onAdd}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK CARD
// Individual draggable + clickable block item
// ─────────────────────────────────────────────────────────────────────────────
interface BlockCardProps {
    def: BlockDefinition
    hovered: boolean
    dragging: boolean
    accentColor: string
    onHover: (type: BlockType | null) => void
    onAdd: (type: BlockType) => void
    onDragStart: (e: React.DragEvent, type: BlockType) => void
    onDragEnd: () => void
}

function BlockCard({
    def,
    hovered,
    dragging,
    accentColor,
    onHover,
    onAdd,
    onDragStart,
    onDragEnd,
}: BlockCardProps) {
    return (
        <div
            draggable
            onDragStart={e => onDragStart(e, def.type)}
            onDragEnd={onDragEnd}
            onMouseEnter={() => onHover(def.type)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onAdd(def.type)}
            title={`${def.label} — ${def.description}`}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 10px',
                marginBottom: 3,
                borderRadius: 8,
                cursor: 'grab',
                border: `1px solid ${hovered ? accentColor + '44' : 'transparent'}`,
                backgroundColor: hovered ? C.primaryLight : 'transparent',
                transition: 'background-color 0.12s, border-color 0.12s',
                opacity: dragging ? 0.45 : 1,
                userSelect: 'none',
                WebkitUserSelect: 'none',
                // Subtle left accent on hover
                borderLeft: hovered
                    ? `3px solid ${accentColor}`
                    : '3px solid transparent',
            }}
        >
            {/* Icon box */}
            <div style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                backgroundColor: hovered ? accentColor + '22' : C.bg,
                border: `1px solid ${hovered ? accentColor + '44' : C.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                flexShrink: 0,
                transition: 'background-color 0.12s, border-color 0.12s',
                lineHeight: 1,
            }}>
                {def.icon}
            </div>

            {/* Label + description */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                    margin: 0,
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 12,
                    fontWeight: 600,
                    color: hovered ? C.primary : C.body,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    transition: 'color 0.12s',
                    lineHeight: 1.3,
                }}>
                    {def.label}
                </p>
                <p style={{
                    margin: '1px 0 0',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 10,
                    color: C.muted,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.3,
                }}>
                    {def.description}
                </p>
            </div>

            {/* Drag handle indicator */}
            <div style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                opacity: hovered ? 0.6 : 0,
                transition: 'opacity 0.15s',
            }}>
                {[0, 1, 2].map(i => (
                    <div key={i} style={{
                        display: 'flex',
                        gap: 2,
                    }}>
                        <div style={{ width: 2, height: 2, borderRadius: '50%', backgroundColor: C.secondary }} />
                        <div style={{ width: 2, height: 2, borderRadius: '50%', backgroundColor: C.secondary }} />
                    </div>
                ))}
            </div>
        </div>
    )
}
