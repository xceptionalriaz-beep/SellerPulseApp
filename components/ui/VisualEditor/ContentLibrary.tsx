'use client'
// components/ui/VisualEditor/ContentLibrary.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Editor / Content Library
//
// Shows only blocks in the 'Content' category.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react'
import {
    BLOCK_DEFINITIONS,
    BlockType,
} from './blocks'
import { VisualCard } from './BlockLibrary'

const C = {
    bg: '#f8f7ff', surface: '#ffffff', border: '#ede9fe',
    primary: '#7530fb', primaryLight: '#f3eeff',
    dark: '#1e1535', body: '#1f1d2e', secondary: '#6b7280',
    muted: '#9ca3af', inputBorder: '#e5e0f5',
}

interface ContentLibraryProps {
    onAddBlock: (type: BlockType) => void
    onDragStart: (type: BlockType) => void
    onDragEnd: () => void
    draggedType: BlockType | null
}

export default function ContentLibrary({ onAddBlock, onDragStart, onDragEnd, draggedType }: ContentLibraryProps) {
    const [hoveredType, setHovered] = useState<BlockType | null>(null)

    const contentDefs = BLOCK_DEFINITIONS.filter(d => d.category === 'Content')

    const handleDragStart = useCallback((e: React.DragEvent, type: BlockType) => {
        e.dataTransfer.setData('text/plain', type)
        e.dataTransfer.effectAllowed = 'copy'
        onDragStart(type)
    }, [onDragStart])

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: C.bg, overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {contentDefs.map(def => (
                        <VisualCard
                            key={def.type}
                            def={def}
                            hovered={hoveredType === def.type}
                            dragging={draggedType === def.type}
                            accentColor={C.primary}
                            onHover={setHovered}
                            onAdd={onAddBlock}
                            onDragStart={handleDragStart}
                            onDragEnd={onDragEnd}
                        />
                    ))}
                </div>
            </div>
            <div style={{ padding: '8px 14px', borderTop: `1px solid ${C.border}`, backgroundColor: C.surface, flexShrink: 0 }}>
                <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.muted, textAlign: 'center' }}>Click to add content</p>
            </div>
        </div>
    )
}
