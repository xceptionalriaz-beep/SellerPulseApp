'use client'
// components/ui/ImageEditor/tools/StickerTool.tsx
// ─────────────────────────────────────────────────────────────
// Sticker / Badge overlay tool.
// Tab 1 & 2 : pre-built SVG promotional badges (SALE, NEW, %, …)
// Tab 3      : real emoji stickers in 8 themed categories
// ─────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react'
import type { ToolPanelProps } from '../types'
import type { StickerItem, StickerColorScheme, StickerShape } from '../types'
import {
    STICKER_PRESETS,
    COLOR_SCHEMES,
    SHAPE_DIMS,
    EMOJI_CATEGORIES,
    stickerToDataUrl,
    emojiToDataUrl,
} from '../stickerHelpers'
import type { StickerPreset } from '../stickerHelpers'

// ── Badge preset thumb ─────────────────────────────────────────
interface PresetThumbProps {
    pKey: string
    label: string
    subLabel: string
    shape: StickerShape
    defaultColor: StickerColorScheme
    onAdd: (key: string, label: string, subLabel: string, shape: StickerShape, color: StickerColorScheme) => void
}
function PresetThumb({ pKey, label, subLabel, shape, defaultColor, onAdd }: PresetThumbProps) {
    const [hovered, setHovered] = useState(false)
    const dataUrl = stickerToDataUrl({ label, subLabel, shape, colorScheme: defaultColor })
    const dims = SHAPE_DIMS[shape]

    return (
        <button
            title={subLabel ? `${label} ${subLabel}` : label}
            onClick={() => onAdd(pKey, label, subLabel, shape, defaultColor)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered ? '#ede9fe' : '#f8f7ff',
                border: hovered ? '2px solid #7530fb' : '2px solid #ede9fe',
                borderRadius: 10,
                padding: 6,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                aspectRatio: '1',
                transition: 'all 0.15s',
            }}
        >
            <img
                src={dataUrl}
                alt={label}
                draggable={false}
                style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    aspectRatio: `${dims.w}/${dims.h}`,
                    display: 'block',
                }}
            />
        </button>
    )
}

// ── Emoji sticker thumb ────────────────────────────────────────
interface EmojiThumbProps {
    emoji: string
    onAdd: (emoji: string) => void
}
function EmojiThumb({ emoji, onAdd }: EmojiThumbProps) {
    const [hovered, setHovered] = useState(false)
    return (
        <button
            title={emoji}
            onClick={() => onAdd(emoji)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered ? '#ede9fe' : '#f8f7ff',
                border: hovered ? '2px solid #7530fb' : '2px solid transparent',
                borderRadius: 10,
                padding: 4,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                aspectRatio: '1',
                fontSize: 28,
                lineHeight: 1,
                transition: 'all 0.12s',
                userSelect: 'none',
            }}
        >
            {emoji}
        </button>
    )
}

// ── Color chip ─────────────────────────────────────────────────
interface ColorChipProps {
    scheme: StickerColorScheme
    selected: boolean
    onSelect: (s: StickerColorScheme) => void
}
function ColorChip({ scheme, selected, onSelect }: ColorChipProps) {
    const [hovered, setHovered] = useState(false)
    const col = COLOR_SCHEMES[scheme]
    return (
        <button
            title={scheme}
            onClick={() => onSelect(scheme)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: col.bg,
                border: selected ? '3px solid #7530fb' : hovered ? '3px solid #b8fa33' : '3px solid transparent',
                cursor: 'pointer',
                outline: selected ? '2px solid #1e1535' : 'none',
                outlineOffset: 1,
                transition: 'all 0.12s',
                flexShrink: 0,
            }}
        />
    )
}

// ── Active sticker row ─────────────────────────────────────────
interface StickerRowProps {
    sticker: StickerItem
    onUpdate: (patch: Partial<StickerItem>) => void
    onRemove: () => void
}
function StickerRow({ sticker, onUpdate, onRemove }: StickerRowProps) {
    const [expanded, setExpanded] = useState(false)
    const [removeHov, setRemoveHov] = useState(false)
    const [hdr, setHdr] = useState(false)

    const isEmoji = sticker.type === 'emoji'

    return (
        <div style={{
            background: '#f8f7ff',
            border: '1.5px solid #ede9fe',
            borderRadius: 10,
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div
                onClick={() => setExpanded(e => !e)}
                onMouseEnter={() => setHdr(true)}
                onMouseLeave={() => setHdr(false)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    cursor: 'pointer',
                    background: hdr ? '#ede9fe' : 'transparent',
                    transition: 'background 0.12s',
                }}
            >
                {isEmoji ? (
                    <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                        {sticker.emoji}
                    </div>
                ) : (
                    <img
                        src={stickerToDataUrl(sticker)}
                        alt={sticker.label}
                        draggable={false}
                        style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }}
                    />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1e1535', lineHeight: 1.2 }}>
                        {isEmoji ? sticker.emoji : `${sticker.label}${sticker.subLabel ? ` ${sticker.subLabel}` : ''}`}
                    </div>
                    <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>
                        {isEmoji ? 'emoji' : sticker.colorScheme} · ×{sticker.scale.toFixed(1)} · {sticker.rotation}°
                    </div>
                </div>
                <span style={{ fontSize: 11, color: '#7530fb', fontWeight: 700, userSelect: 'none' }}>
                    {expanded ? '▲' : '▼'}
                </span>
                <button
                    onClick={e => { e.stopPropagation(); onRemove() }}
                    onMouseEnter={() => setRemoveHov(true)}
                    onMouseLeave={() => setRemoveHov(false)}
                    style={{
                        background: removeHov ? '#fef2f2' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: removeHov ? '#ef4444' : '#9ca3af',
                        padding: '2px 6px',
                        borderRadius: 6,
                        fontSize: 15,
                        fontWeight: 700,
                        lineHeight: 1,
                        transition: 'all 0.12s',
                    }}
                >
                    ×
                </button>
            </div>

            {/* Controls */}
            {expanded && (
                <div style={{ padding: '10px 12px 12px', borderTop: '1px solid #ede9fe' }}>
                    {/* Color — only for badge stickers */}
                    {!isEmoji && (
                        <div style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Color</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {(Object.keys(COLOR_SCHEMES) as StickerColorScheme[]).map(s => (
                                    <ColorChip
                                        key={s}
                                        scheme={s}
                                        selected={sticker.colorScheme === s}
                                        onSelect={scheme => onUpdate({ colorScheme: scheme })}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Scale */}
                    <div style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>Size</span>
                            <span style={{ fontSize: 11, color: '#7530fb', fontWeight: 700 }}>×{sticker.scale.toFixed(1)}</span>
                        </div>
                        <input
                            type="range" min={0.5} max={3} step={0.1}
                            value={sticker.scale}
                            onChange={e => onUpdate({ scale: parseFloat(e.target.value) })}
                            style={{ width: '100%', accentColor: '#7530fb' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
                            <span>×0.5</span><span>×1</span><span>×2</span><span>×3</span>
                        </div>
                    </div>

                    {/* Rotation */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>Rotation</span>
                            <span style={{ fontSize: 11, color: '#7530fb', fontWeight: 700 }}>{sticker.rotation}°</span>
                        </div>
                        <input
                            type="range" min={-45} max={45} step={1}
                            value={sticker.rotation}
                            onChange={e => onUpdate({ rotation: parseInt(e.target.value) })}
                            style={{ width: '100%', accentColor: '#7530fb' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
                            <span>-45°</span><span>0°</span><span>+45°</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Main tool panel ────────────────────────────────────────────
type MainTab = 'badge' | 'discount' | 'emoji'

export default function StickerTool({ state, onChange }: ToolPanelProps) {
    const stickers = state.stickers ?? []
    const [mainTab, setMainTab] = useState<MainTab>('badge')
    const [emojiCatIdx, setEmojiCatIdx] = useState(0)

    // Add a badge/discount sticker
    function addBadgeSticker(
        key: string,
        label: string,
        subLabel: string,
        shape: StickerShape,
        color: StickerColorScheme,
    ) {
        const item: StickerItem = {
            id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            key,
            label,
            subLabel,
            shape,
            colorScheme: color,
            x: 0.12,
            y: 0.12,
            scale: 1,
            rotation: 0,
            type: 'badge',
        }
        onChange({ stickers: [...stickers, item] })
    }

    // Add an emoji sticker
    const addEmojiSticker = useCallback((emoji: string) => {
        const item: StickerItem = {
            id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            key: `emoji-${emoji}`,
            label: emoji,
            subLabel: '',
            shape: 'circle',    // placeholder — not used for emoji
            colorScheme: 'red',       // placeholder
            x: 0.12,
            y: 0.12,
            scale: 1,
            rotation: 0,
            type: 'emoji',
            emoji,
        }
        onChange({ stickers: [...stickers, item] })
    }, [stickers, onChange])

    function updateSticker(id: string, patch: Partial<StickerItem>) {
        onChange({ stickers: stickers.map(s => s.id === id ? { ...s, ...patch } : s) })
    }

    function removeSticker(id: string) {
        onChange({ stickers: stickers.filter(s => s.id !== id) })
    }

    const filteredBadges = STICKER_PRESETS.filter((p: StickerPreset) => p.category === (mainTab === 'discount' ? 'discount' : 'badge'))
    const currentEmojiCat = EMOJI_CATEGORIES[emojiCatIdx]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Header */}
            <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e1535', marginBottom: 3 }}>
                    Sticker &amp; Badge Overlays
                </div>
                <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>
                    Click to place · drag to reposition · use on secondary images
                </div>
            </div>

            {/* Main tabs */}
            <div style={{ display: 'flex', background: '#ede9fe', borderRadius: 8, padding: 3, gap: 3 }}>
                {([
                    { id: 'badge', label: '🏷 Badges' },
                    { id: 'discount', label: '% Discounts' },
                    { id: 'emoji', label: '😊 Stickers' },
                ] as const).map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setMainTab(tab.id)}
                        style={{
                            flex: 1,
                            padding: '6px 0',
                            borderRadius: 6,
                            border: 'none',
                            background: mainTab === tab.id ? '#7530fb' : 'transparent',
                            color: mainTab === tab.id ? '#ffffff' : '#7530fb',
                            fontWeight: 700,
                            fontSize: 11,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Badge / Discount preset grid */}
            {(mainTab === 'badge' || mainTab === 'discount') && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                        {filteredBadges.map((p: StickerPreset) => (
                            <PresetThumb
                                key={p.key}
                                pKey={p.key}
                                label={p.label}
                                subLabel={p.subLabel}
                                shape={p.shape}
                                defaultColor={p.defaultColor}
                                onAdd={addBadgeSticker}
                            />
                        ))}
                    </div>
                    <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 6, textAlign: 'center' }}>
                        Tap a badge to place it on your image
                    </div>
                </div>
            )}

            {/* Emoji sticker panel */}
            {mainTab === 'emoji' && (
                <div>
                    {/* Category scroll */}
                    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                        {EMOJI_CATEGORIES.map((cat, idx) => (
                            <button
                                key={cat.id}
                                onClick={() => setEmojiCatIdx(idx)}
                                style={{
                                    flexShrink: 0,
                                    padding: '5px 10px',
                                    borderRadius: 20,
                                    border: emojiCatIdx === idx ? '2px solid #7530fb' : '2px solid #ede9fe',
                                    background: emojiCatIdx === idx ? '#7530fb' : '#f8f7ff',
                                    color: emojiCatIdx === idx ? '#ffffff' : '#374151',
                                    fontWeight: 600,
                                    fontSize: 11,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.12s',
                                }}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Emoji grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(6, 1fr)',
                        gap: 6,
                        marginTop: 10,
                    }}>
                        {currentEmojiCat.emojis.map(emoji => (
                            <EmojiThumb key={emoji} emoji={emoji} onAdd={addEmojiSticker} />
                        ))}
                    </div>
                    <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 6, textAlign: 'center' }}>
                        Tap an emoji to add it · drag to reposition
                    </div>
                </div>
            )}

            {/* Divider */}
            {stickers.length > 0 && <div style={{ height: 1, background: '#ede9fe' }} />}

            {/* Active stickers list */}
            {stickers.length > 0 && (
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8,
                    }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1e1535' }}>
                            Active ({stickers.length})
                        </div>
                        <button
                            onClick={() => onChange({ stickers: [] })}
                            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: '2px 6px' }}
                        >
                            Clear all
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {stickers.map(s => (
                            <StickerRow
                                key={s.id}
                                sticker={s}
                                onUpdate={patch => updateSticker(s.id, patch)}
                                onRemove={() => removeSticker(s.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {stickers.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '14px 8px',
                    color: '#9ca3af',
                    fontSize: 12,
                    background: '#f8f7ff',
                    borderRadius: 10,
                    border: '1.5px dashed #ede9fe',
                }}>
                    No stickers added yet.<br />
                    <span style={{ color: '#7530fb', fontWeight: 600 }}>Click any sticker above</span> to place it.
                </div>
            )}

            {/* Tip */}
            <div style={{
                fontSize: 11,
                color: '#6b7280',
                background: '#f3eeff',
                borderRadius: 8,
                padding: '8px 10px',
                lineHeight: 1.5,
            }}>
                💡 <strong>Tip:</strong> Drag stickers on the image to reposition. Best used on secondary product images, not the main hero shot.
            </div>
        </div>
    )
}
