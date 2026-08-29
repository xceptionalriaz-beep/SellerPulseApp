'use client'
// components/ui/VisualEditor/Canvas.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Editor / Canvas (Centre Panel)
//
// The drop zone where blocks are placed, reordered, selected and managed.
//
// Responsibilities:
//   • Accepts drops from BlockLibrary (HTML5 native DnD)
//   • Renders each block as a visual card showing a smart preview
//   • Drag-to-reorder existing blocks (up/down within the canvas)
//   • Click to select a block (highlights it, tells parent which is selected)
//   • Per-block actions: move up ↑, move down ↓, duplicate ⧉, delete ×
//   • Empty state with call-to-action when no blocks exist
//   • Device width preview (desktop 700px / tablet 480px / mobile 375px)
//
// Props:
//   blocks          — current ordered block array
//   selectedId      — currently selected block id (or null)
//   draggedType     — block type being dragged from library (or null)
//   deviceWidth     — 'desktop' | 'tablet' | 'mobile'
//   onSelect        — called with block id when user clicks a block
//   onDrop          — called with BlockType when library block dropped on canvas
//   onReorder       — called with (fromIndex, toIndex) to reorder
//   onDelete        — called with block id to remove
//   onDuplicate     — called with block id to duplicate
//   onMoveUp        — called with block id to move up
//   onMoveDown      — called with block id to move down
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useCallback } from 'react'
import {
    Layout, Columns2, Columns3, Square,
    Heading, Pilcrow, List, Minus,
    Tag, BadgeDollarSign, Image, FileText, Table2,
    Camera, Megaphone, LayoutGrid,
    ShieldCheck, Truck, RotateCcw, User, Bell,
    Check, ArrowRight, Star, Package,
    ChevronUp, ChevronDown, Copy, Clipboard,
    Lock, Unlock, Eye, EyeOff, Trash2, CopySlash,
    type LucideIcon,
} from 'lucide-react'
import {
    Block,
    BlockType,
    BlockDefinition,
    getDefinition,
    BLOCK_DEFINITIONS,
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
    danger: '#ef4444',
    dangerLight: '#fee2e2',
    success: '#16a34a',
    successLight: '#dcfce7',
}

// Device canvas widths
const DEVICE_WIDTHS = {
    desktop: 700,
    tablet: 480,
    mobile: 375,
}


// ── Lucide icon lookup ────────────────────────────────────────────────────────
const BLOCK_ICONS: Record<string, LucideIcon> = {
    'layout': Layout,
    'columns-2': Columns2,
    'columns-3': Columns3,
    'square': Square,
    'heading': Heading,
    'pilcrow': Pilcrow,
    'list': List,
    'minus': Minus,
    'tag': Tag,
    'badge-dollar-sign': BadgeDollarSign,
    'image': Image,
    'file-text': FileText,
    'table': Table2,
    'camera': Camera,
    'megaphone': Megaphone,
    'layout-grid': LayoutGrid,
    'shield-check': ShieldCheck,
    'truck': Truck,
    'rotate-ccw': RotateCcw,
    'user': User,
    'bell': Bell,
}

// ── Bullet icons ──────────────────────────────────────────────────────────────
const BULLET_ICONS: Record<string, LucideIcon> = {
    check: Check,
    arrow: ArrowRight,
    star: Star,
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface CanvasProps {
    blocks: Block[]
    selectedId: string | null
    draggedType: BlockType | null
    zoom?: number
    canvasSearch?: string
    lockedIds?: Set<string>
    hiddenIds?: Set<string>
    deviceWidth: 'desktop' | 'tablet' | 'mobile'
    onSelect: (id: string) => void
    onDrop: (type: BlockType) => void
    onReorder: (fromIndex: number, toIndex: number) => void
    onDelete: (id: string) => void
    onDuplicate: (id: string) => void
    onMoveUp: (id: string) => void
    onMoveDown: (id: string) => void
    onCopyStyle: (id: string) => void
    onPasteStyle: (id: string) => void
    hasCopiedStyle: boolean
    onToggleLock?: (id: string) => void
    onToggleHide?: (id: string) => void
    onAddBlock?: (type: BlockType) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Canvas({
    blocks,
    selectedId,
    draggedType,
    zoom = 100,
    canvasSearch = '',
    lockedIds = new Set(),
    hiddenIds = new Set(),
    deviceWidth,
    onSelect,
    onDrop,
    onReorder,
    onDelete,
    onDuplicate,
    onMoveUp,
    onMoveDown,
    onCopyStyle,
    onPasteStyle,
    hasCopiedStyle,
    onToggleLock,
    onToggleHide,
    onAddBlock,
}: CanvasProps) {
    // Drop zone state — is library block being dragged over the canvas?
    const [isDropTarget, setIsDropTarget] = useState(false)
    // Which canvas block is being reordered?
    const [reorderFrom, setReorderFrom] = useState<number | null>(null)
    const [reorderOver, setReorderOver] = useState<number | null>(null)
    const canvasWidth = DEVICE_WIDTHS[deviceWidth]

    // ── Library block drop handlers (from BlockLibrary) ───────────────────────
    const handleDragOver = useCallback((e: React.DragEvent) => {
        // Only respond if it's a library drag (type string set)
        if (draggedType) {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
            setIsDropTarget(true)
        }
    }, [draggedType])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        // Only reset if leaving the canvas itself (not a child)
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDropTarget(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDropTarget(false)
        const type = e.dataTransfer.getData('text/plain') as BlockType
        if (type) onDrop(type)
    }, [onDrop])

    // ── Canvas block reorder handlers ─────────────────────────────────────────
    const handleReorderDragStart = useCallback((index: number) => {
        setReorderFrom(index)
    }, [])

    const handleReorderDragOver = useCallback((e: React.DragEvent, index: number) => {
        // Only handle canvas reorder drags, not library drops
        if (reorderFrom === null) return
        e.preventDefault()
        e.stopPropagation()
        setReorderOver(index)
    }, [reorderFrom])

    const handleReorderDrop = useCallback((e: React.DragEvent, toIndex: number) => {
        e.preventDefault()
        e.stopPropagation()
        if (reorderFrom !== null && reorderFrom !== toIndex) {
            onReorder(reorderFrom, toIndex)
        }
        setReorderFrom(null)
        setReorderOver(null)
    }, [reorderFrom, onReorder])

    const handleReorderDragEnd = useCallback(() => {
        setReorderFrom(null)
        setReorderOver(null)
    }, [])

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div
            style={{
                flex: 1,
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                backgroundColor: '#e8e6f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '24px 24px 40px',
                position: 'relative',
                transformOrigin: 'top center',
                transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* ── Drop overlay — shown when dragging from library ── */}
            {draggedType && isDropTarget && blocks.length > 0 && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    pointerEvents: 'none',
                    border: `3px dashed ${C.primary}`,
                    borderRadius: 4,
                    backgroundColor: `${C.primary}08`,
                    zIndex: 10,
                }} />
            )}

            {/* ── Canvas frame ── */}
            <div style={{
                width: '100%',
                maxWidth: canvasWidth,
                transition: 'max-width 0.3s ease',
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}>

                {/* ── Empty state ── */}
                {blocks.length === 0 && (
                    <EmptyState
                        isDropTarget={isDropTarget}
                        draggedType={draggedType}
                        onAddBlock={onAddBlock}
                    />
                )}

                {/* ── Block cards ── */}
                {blocks.map((block, index) => {
                    const def = getDefinition(block.type)
                    if (!def) return null
                    const isSelected = block.id === selectedId
                    const isReorderOver = reorderOver === index
                    const isBeingDragged = reorderFrom === index

                    return (
                        <div key={block.id}>
                            {/* Reorder drop indicator — line above this block */}
                            {isReorderOver && reorderFrom !== null && reorderFrom > index && (
                                <DropIndicator />
                            )}

                            <BlockCard
                                block={block}
                                def={def}
                                index={index}
                                total={blocks.length}
                                isSelected={isSelected}
                                isLocked={lockedIds.has(block.id)}
                                isHidden={hiddenIds.has(block.id)}
                                searchMatch={!canvasSearch || (getDefinition(block.type)?.label?.toLowerCase().includes(canvasSearch.toLowerCase()) ?? true)}
                                isBeingDragged={isBeingDragged}
                                onSelect={() => onSelect(block.id)}
                                onDelete={() => onDelete(block.id)}
                                onDuplicate={() => onDuplicate(block.id)}
                                onMoveUp={() => onMoveUp(block.id)}
                                onMoveDown={() => onMoveDown(block.id)}
                                onCopyStyle={() => onCopyStyle(block.id)}
                                onPasteStyle={() => onPasteStyle(block.id)}
                                hasCopiedStyle={hasCopiedStyle}
                                onToggleLock={() => onToggleLock?.(block.id)}
                                onToggleHide={() => onToggleHide?.(block.id)}
                                onReorderDragStart={() => handleReorderDragStart(index)}
                                onReorderDragOver={(e) => handleReorderDragOver(e, index)}
                                onReorderDrop={(e) => handleReorderDrop(e, index)}
                                onReorderDragEnd={handleReorderDragEnd}
                            />

                            {/* Reorder drop indicator — line below this block */}
                            {isReorderOver && reorderFrom !== null && reorderFrom < index && (
                                <DropIndicator />
                            )}
                        </div>
                    )
                })}

                {/* ── Add block hint (when blocks exist) ── */}
                {blocks.length > 0 && (
                    <div style={{
                        marginTop: 12,
                        padding: '10px 0',
                        textAlign: 'center',
                    }}>
                        <p style={{
                            margin: 0,
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 11,
                            color: C.muted,
                        }}>
                            {draggedType
                                ? `Drop to add ${getDefinition(draggedType)?.label ?? 'block'} here`
                                : '← Drag blocks from the library to add more'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────
function EmptyState({
    isDropTarget,
    draggedType,
    onAddBlock,
}: {
    isDropTarget: boolean
    draggedType: BlockType | null
    onAddBlock?: (type: BlockType) => void
}) {
    const def = draggedType ? getDefinition(draggedType) : null

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400,
            border: `2px dashed ${isDropTarget ? C.primary : C.border}`,
            borderRadius: 16,
            backgroundColor: isDropTarget ? C.primaryLight : C.surface,
            transition: 'all 0.2s ease',
            padding: 40,
        }}>
            {isDropTarget && def ? (
                <>
                    <div style={{
                        width: 64, height: 64, borderRadius: 16,
                        backgroundColor: C.primary,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 28, marginBottom: 16,
                        boxShadow: `0 8px 24px ${C.primary}44`,
                    }}>
                        {def.icon}
                    </div>
                    <p style={{ margin: '0 0 4px', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: C.primary }}>
                        Drop to add {def.label}
                    </p>
                    <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.secondary }}>
                        {def.description}
                    </p>
                </>
            ) : (
                <>
                    {/* Visual hint — mini block stack */}
                    <div style={{ position: 'relative', width: 120, height: 80, marginBottom: 24 }}>
                        {[
                            { top: 0, left: 10, opacity: 0.2, height: 18 },
                            { top: 24, left: 0, opacity: 0.35, height: 22 },
                            { top: 52, left: 6, opacity: 0.15, height: 14 },
                        ].map((s, i) => (
                            <div key={i} style={{
                                position: 'absolute', width: 100, borderRadius: 6,
                                backgroundColor: C.primary, ...s,
                            }} />
                        ))}
                    </div>

                    <p style={{ margin: '0 0 8px', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: C.dark, textAlign: 'center' }}>
                        Drag blocks here to start building
                    </p>
                    <p style={{ margin: '0 0 20px', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.secondary, textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>
                        Select blocks from the library on the left, or click any block to add it instantly.
                    </p>

                    {/* Quick-start suggestions — clickable */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, justifyContent: 'center' }}>
                        {(['product_title', 'product_image', 'price_block', 'trust_badges'] as BlockType[]).map(type => {
                            const d = getDefinition(type)
                            if (!d) return null
                            return (
                                <div
                                    key={type}
                                    onClick={() => onAddBlock?.(type)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 5,
                                        padding: '5px 10px', borderRadius: 20,
                                        border: `1px solid ${C.border}`,
                                        backgroundColor: C.surface,
                                        fontFamily: 'DM Sans, sans-serif', fontSize: 11,
                                        color: C.secondary,
                                        cursor: onAddBlock ? 'pointer' : 'default',
                                    }}
                                >
                                    <span style={{ fontSize: 12 }}>{d.icon}</span>
                                    {d.label}
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}


// ─────────────────────────────────────────────────────────────────────────────
// DROP INDICATOR
// Blue line shown between blocks during reorder drag
// ─────────────────────────────────────────────────────────────────────────────
function DropIndicator() {
    return (
        <div style={{
            height: 3,
            backgroundColor: C.primary,
            borderRadius: 3,
            margin: '2px 0',
            boxShadow: `0 0 8px ${C.primary}88`,
            animation: 'pulse 0.8s ease-in-out infinite',
        }} />
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK CARD
// Visual representation of one block on the canvas
// ─────────────────────────────────────────────────────────────────────────────
interface BlockCardProps {
    block: Block
    def: BlockDefinition
    index: number
    total: number
    isSelected: boolean
    isBeingDragged: boolean
    onSelect: () => void
    onDelete: () => void
    onDuplicate: () => void
    onMoveUp: () => void
    onMoveDown: () => void
    onCopyStyle: () => void
    onPasteStyle: () => void
    hasCopiedStyle: boolean
    onToggleLock: () => void
    onToggleHide: () => void
    isLocked: boolean
    isHidden: boolean
    searchMatch: boolean
    onReorderDragStart: () => void
    onReorderDragOver: (e: React.DragEvent) => void
    onReorderDrop: (e: React.DragEvent) => void
    onReorderDragEnd: () => void
}

function BlockCard({
    block,
    def,
    index,
    total,
    isSelected,
    isBeingDragged,
    onSelect,
    onDelete,
    onDuplicate,
    onMoveUp,
    onMoveDown,
    onCopyStyle,
    onPasteStyle,
    hasCopiedStyle,
    onToggleLock,
    onToggleHide,
    isLocked,
    isHidden,
    searchMatch,
    onReorderDragStart,
    onReorderDragOver,
    onReorderDrop,
    onReorderDragEnd,
}: BlockCardProps) {
    const [hovered, setHovered] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState(false)

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (deleteConfirm) {
            onDelete()
            setDeleteConfirm(false)
        } else {
            setDeleteConfirm(true)
            // Auto-reset after 2.5s
            setTimeout(() => setDeleteConfirm(false), 2500)
        }
    }

    return (
        <div
            draggable
            onDragStart={e => {
                // Canvas reorder — don't set dataTransfer type to prevent
                // canvas drop handler from treating this as a library drag
                e.stopPropagation()
                onReorderDragStart()
            }}
            onDragOver={onReorderDragOver}
            onDrop={onReorderDrop}
            onDragEnd={onReorderDragEnd}
            onClick={isLocked ? undefined : onSelect}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => {
                setHovered(false)
                setDeleteConfirm(false)
            }}
            style={{
                position: 'relative',
                marginBottom: 8,
                borderRadius: 10,
                opacity: isBeingDragged ? 0.4 : isHidden ? 0.35 : 1,
                filter: !searchMatch ? 'opacity(0.25) grayscale(0.5)' : undefined,
                outline: isLocked
                    ? `2px solid #d97706`
                    : `2px solid ${isSelected
                        ? C.primary
                        : hovered
                            ? C.primaryBorder
                            : 'transparent'
                    }`,
                backgroundColor: C.surface,
                cursor: isLocked ? 'not-allowed' : 'pointer',
                transition: 'border-color 0.15s, box-shadow 0.15s, opacity 0.15s',
                // Universal shadow from block props — falls back to selection/hover shadow
                boxShadow: (block.props as any).showShadow
                    ? `${(block.props as any).shadowX ?? 0}px ${(block.props as any).shadowY ?? 4}px ${(block.props as any).shadowBlur ?? 12}px ${(block.props as any).shadowSpread ?? 0}px ${(block.props as any).shadowColor ?? 'rgba(0,0,0,0.10)'}`
                    : isSelected
                        ? `0 0 0 3px ${C.primary}22, 0 2px 8px ${C.primary}18`
                        : hovered
                            ? `0 2px 12px ${C.primary}12`
                            : '0 1px 4px rgba(0,0,0,0.06)',
                overflow: 'visible',
            }}
        >
            {/* ── Selected label badge ── */}
            {isSelected && (
                <div style={{
                    position: 'absolute',
                    top: -11,
                    left: 12,
                    backgroundColor: C.primary,
                    color: '#fff',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 20,
                    letterSpacing: '0.04em',
                    zIndex: 2,
                    pointerEvents: 'none',
                }}>
                    {(() => { const I = BLOCK_ICONS[def.icon]; return I ? <I size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} /> : null })()} {def.label}
                </div>
            )}

            {/* ── Drag handle (top centre) ── */}
            {(hovered || isSelected) && (
                <div style={{
                    position: 'absolute',
                    top: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    padding: '2px 8px',
                    cursor: 'grab',
                    zIndex: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}>
                    {[0, 1].map(col => (
                        <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {[0, 1, 2].map(row => (
                                <div key={row} style={{
                                    width: 3,
                                    height: 3,
                                    borderRadius: '50%',
                                    backgroundColor: C.muted,
                                }} />
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {/* ── Block preview content ── */}
            <div style={{ padding: '14px 16px 12px', pointerEvents: 'none' }}>
                <BlockPreview block={block} def={def} />
            </div>

            {/* ── Action toolbar — horizontal, top of block ── */}
            {(hovered || isSelected) && (
                <div
                    style={{
                        position: 'absolute',
                        top: 6,
                        right: 8,
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 2,
                        zIndex: 10,
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        padding: '3px 4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        backdropFilter: 'blur(4px)',
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Move Up */}
                    {index > 0 && (
                        <ActionButton onClick={onMoveUp} title="Move up (Alt+↑)" color={C.secondary}>
                            <ChevronUp size={13} />
                        </ActionButton>
                    )}
                    {/* Move Down */}
                    {index < total - 1 && (
                        <ActionButton onClick={onMoveDown} title="Move down (Alt+↓)" color={C.secondary}>
                            <ChevronDown size={13} />
                        </ActionButton>
                    )}

                    <Divider />

                    {/* Duplicate */}
                    <ActionButton onClick={onDuplicate} title="Duplicate (Cmd+D)" color={C.primary}>
                        <Copy size={13} />
                    </ActionButton>
                    {/* Copy Style */}
                    <ActionButton onClick={onCopyStyle} title="Copy style" color={C.secondary}>
                        <CopySlash size={13} />
                    </ActionButton>
                    {/* Paste Style */}
                    {hasCopiedStyle && (
                        <ActionButton onClick={onPasteStyle} title="Paste style" color={C.primary}>
                            <Clipboard size={13} />
                        </ActionButton>
                    )}

                    <Divider />

                    {/* Lock */}
                    <ActionButton
                        onClick={onToggleLock}
                        title={isLocked ? 'Unlock (Cmd+L)' : 'Lock (Cmd+L)'}
                        color={isLocked ? '#d97706' : C.secondary}
                        bg={isLocked ? '#fef3c7' : undefined}
                    >
                        {isLocked ? <Lock size={13} /> : <Unlock size={13} />}
                    </ActionButton>
                    {/* Hide */}
                    <ActionButton
                        onClick={onToggleHide}
                        title={isHidden ? 'Show (Cmd+H)' : 'Hide (Cmd+H)'}
                        color={isHidden ? C.muted : C.secondary}
                    >
                        {isHidden ? <EyeOff size={13} /> : <Eye size={13} />}
                    </ActionButton>

                    <Divider />

                    {/* Delete */}
                    <ActionButton
                        onClick={handleDelete}
                        title={deleteConfirm ? 'Click again to confirm' : 'Delete block'}
                        color={deleteConfirm ? C.danger : C.secondary}
                        bg={deleteConfirm ? C.dangerLight : undefined}
                    >
                        <Trash2 size={13} />
                    </ActionButton>
                </div>
            )}

            {/* ── Bottom type label (always visible) ── */}
            <div style={{
                borderTop: `1px solid ${C.border}`,
                padding: '5px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <span style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 10,
                    color: C.muted,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                }}>
                    <span>{def.icon}</span>
                    <span>{def.label}</span>
                    <span style={{
                        backgroundColor: C.bg,
                        border: `1px solid ${C.border}`,
                        borderRadius: 4,
                        padding: '1px 5px',
                        fontSize: 9,
                        color: C.muted,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    }}>
                        {def.category}
                    </span>
                </span>
                <span style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 9,
                    color: C.border,
                }}>
                    #{index + 1}
                </span>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTION BUTTON
// Toolbar separator
function Divider() {
    return <div style={{ width: 1, height: 18, backgroundColor: C.border, margin: '0 2px', alignSelf: 'center' }} />
}

// Small icon button used in the block card toolbar
// ─────────────────────────────────────────────────────────────────────────────
function ActionButton({
    children,
    onClick,
    title,
    color,
    bg,
}: {
    children: React.ReactNode
    onClick: (e: React.MouseEvent) => void
    title: string
    color: string
    bg?: string
}) {
    const [hovered, setHovered] = useState(false)
    return (
        <button
            onClick={onClick}
            title={title}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                backgroundColor: bg ?? (hovered ? C.primaryLight : C.surface),
                color: hovered ? color : C.secondary,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transition: 'background-color 0.12s, color 0.12s',
                lineHeight: 1,
                fontFamily: 'DM Sans, sans-serif',
            }}
        >
            {children}
        </button>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK PREVIEW
// Renders a visual summary of each block type using its current props.
// NOT the full toHtml() output — a lightweight React representation so
// the canvas stays fast and doesn't need iframe sandboxing.
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// BLOCK PREVIEW — Live iframe renderer
// Renders the exact same HTML that goes to eBay, inside a sandboxed iframe.
// What you see on canvas = what eBay renders. No more wireframe sketches.
// ─────────────────────────────────────────────────────────────────────────────
function BlockPreview({ block, def }: { block: Block; def: BlockDefinition }) {
    const props = block.props as any
    const iframeRef = React.useRef<HTMLIFrameElement>(null)

    // Build the full HTML for this single block
    const html = React.useMemo(() => {
        try {
            const blockDef = getDefinition(block.type)
            if (!blockDef) return ''
            const blockHtml = blockDef.toHtml(props, block.id)
            return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    background: transparent;
    overflow: hidden;
  }
  table { border-collapse: collapse; width: 100%; }
  img { border: 0; display: block; max-width: 100%; }
  a { text-decoration: none; }
</style>
</head>
<body>${blockHtml}</body>
</html>`
        } catch {
            return ''
        }
    }, [block.type, block.id, props])

    // Auto-resize iframe to fit content height
    const [height, setHeight] = React.useState(80)

    const onLoad = React.useCallback(() => {
        const iframe = iframeRef.current
        if (!iframe) return
        try {
            const doc = iframe.contentDocument
            if (!doc) return
            const body = doc.body
            if (!body) return
            const h = body.scrollHeight || body.offsetHeight
            setHeight(Math.max(40, Math.min(h + 4, 600)))
        } catch { /* cross-origin guard */ }
    }, [])

    if (!html) {
        // Fallback for blocks with no toHtml
        return (
            <div style={{
                height: 48,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: C.bg, borderRadius: 6,
                fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.muted,
            }}>
                {def.label}
            </div>
        )
    }

    return (
        <div style={{ width: '100%', overflow: 'hidden', borderRadius: 4 }}>
            <iframe
                ref={iframeRef}
                srcDoc={html}
                onLoad={onLoad}
                sandbox="allow-same-origin"
                scrolling="no"
                style={{
                    width: '100%',
                    height: height,
                    border: 'none',
                    display: 'block',
                    pointerEvents: 'none', // clicks go to canvas, not iframe
                    backgroundColor: 'transparent',
                }}
                title={`Preview: ${def.label}`}
            />
        </div>
    )
}
