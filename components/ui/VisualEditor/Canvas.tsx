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
    Block,
    BlockType,
    BlockDefinition,
    getDefinition,
    BLOCK_DEFINITIONS,
    HeadingProps,
    ParagraphProps,
    ProductTitleProps,
    PriceBlockProps,
    ProductImageProps,
    ProductDescriptionProps,
    SpecsTableProps,
    BulletListProps,
    DividerProps,
    BannerProps,
    CtaBannerProps,
    TrustBadgesProps,
    ShippingInfoProps,
    ReturnsPolicyProps,
    SellerInfoProps,
    ImageProps,
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

// ── Props ─────────────────────────────────────────────────────────────────────
interface CanvasProps {
    blocks: Block[]
    selectedId: string | null
    draggedType: BlockType | null
    deviceWidth: 'desktop' | 'tablet' | 'mobile'
    onSelect: (id: string) => void
    onDrop: (type: BlockType) => void
    onReorder: (fromIndex: number, toIndex: number) => void
    onDelete: (id: string) => void
    onDuplicate: (id: string) => void
    onMoveUp: (id: string) => void
    onMoveDown: (id: string) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Canvas({
    blocks,
    selectedId,
    draggedType,
    deviceWidth,
    onSelect,
    onDrop,
    onReorder,
    onDelete,
    onDuplicate,
    onMoveUp,
    onMoveDown,
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
                                isBeingDragged={isBeingDragged}
                                onSelect={() => onSelect(block.id)}
                                onDelete={() => onDelete(block.id)}
                                onDuplicate={() => onDuplicate(block.id)}
                                onMoveUp={() => onMoveUp(block.id)}
                                onMoveDown={() => onMoveDown(block.id)}
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
}: {
    isDropTarget: boolean
    draggedType: BlockType | null
}) {
    const def = draggedType ? getDefinition(draggedType) : null

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
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
                /* Actively dragging a block over empty canvas */
                <>
                    <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        backgroundColor: C.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28,
                        marginBottom: 16,
                        boxShadow: `0 8px 24px ${C.primary}44`,
                    }}>
                        {def.icon}
                    </div>
                    <p style={{
                        margin: '0 0 4px',
                        fontFamily: 'Syne, sans-serif',
                        fontWeight: 700,
                        fontSize: 18,
                        color: C.primary,
                    }}>
                        Drop to add {def.label}
                    </p>
                    <p style={{
                        margin: 0,
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: 13,
                        color: C.secondary,
                    }}>
                        {def.description}
                    </p>
                </>
            ) : (
                /* Normal empty state */
                <>
                    {/* Visual hint — mini block stack */}
                    <div style={{ position: 'relative', width: 120, height: 80, marginBottom: 24 }}>
                        {[
                            { top: 0, left: 10, opacity: 0.2, height: 18 },
                            { top: 24, left: 0, opacity: 0.35, height: 22 },
                            { top: 52, left: 6, opacity: 0.15, height: 14 },
                        ].map((style, i) => (
                            <div key={i} style={{
                                position: 'absolute',
                                width: 100,
                                borderRadius: 6,
                                backgroundColor: C.primary,
                                ...style,
                            }} />
                        ))}
                    </div>

                    <p style={{
                        margin: '0 0 8px',
                        fontFamily: 'Syne, sans-serif',
                        fontWeight: 700,
                        fontSize: 18,
                        color: C.dark,
                        textAlign: 'center',
                    }}>
                        Drag blocks here to start building
                    </p>
                    <p style={{
                        margin: '0 0 20px',
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: 13,
                        color: C.secondary,
                        textAlign: 'center',
                        maxWidth: 280,
                        lineHeight: 1.6,
                    }}>
                        Select blocks from the library on the left, or click any block to add it instantly.
                    </p>

                    {/* Quick-start suggestions */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {['product_title', 'product_image', 'price_block', 'trust_badges'].map(type => {
                            const d = getDefinition(type as BlockType)
                            if (!d) return null
                            return (
                                <div
                                    key={type}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 5,
                                        padding: '5px 10px',
                                        borderRadius: 20,
                                        border: `1px solid ${C.border}`,
                                        backgroundColor: C.surface,
                                        fontFamily: 'DM Sans, sans-serif',
                                        fontSize: 11,
                                        color: C.secondary,
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
            onClick={onSelect}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => {
                setHovered(false)
                setDeleteConfirm(false)
            }}
            style={{
                position: 'relative',
                marginBottom: 8,
                borderRadius: 10,
                border: `2px solid ${isSelected
                    ? C.primary
                    : hovered
                        ? C.primaryBorder
                        : 'transparent'
                    }`,
                backgroundColor: C.surface,
                cursor: 'pointer',
                opacity: isBeingDragged ? 0.4 : 1,
                transition: 'border-color 0.15s, box-shadow 0.15s, opacity 0.15s',
                boxShadow: isSelected
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
                    {def.icon} {def.label}
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

            {/* ── Action toolbar (shown on hover/select) ── */}
            {(hovered || isSelected) && (
                <div
                    style={{
                        position: 'absolute',
                        right: -1,
                        top: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                        zIndex: 4,
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Move Up */}
                    {index > 0 && (
                        <ActionButton
                            onClick={onMoveUp}
                            title="Move up"
                            color={C.secondary}
                        >
                            ↑
                        </ActionButton>
                    )}
                    {/* Move Down */}
                    {index < total - 1 && (
                        <ActionButton
                            onClick={onMoveDown}
                            title="Move down"
                            color={C.secondary}
                        >
                            ↓
                        </ActionButton>
                    )}
                    {/* Duplicate */}
                    <ActionButton
                        onClick={onDuplicate}
                        title="Duplicate block"
                        color={C.primary}
                    >
                        ⧉
                    </ActionButton>
                    {/* Delete */}
                    <ActionButton
                        onClick={handleDelete}
                        title={deleteConfirm ? 'Click again to confirm delete' : 'Delete block'}
                        color={deleteConfirm ? C.danger : C.secondary}
                        bg={deleteConfirm ? C.dangerLight : undefined}
                    >
                        {deleteConfirm ? '!' : '×'}
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
function BlockPreview({ block, def }: { block: Block; def: BlockDefinition }) {
    const props = block.props as any

    switch (block.type) {

        // ── Layout blocks — show wireframe ─────────────────────────────────
        case 'full_width_section':
            return (
                <WireframePreview
                    icon={def.icon}
                    label="Full Width Section"
                    color="#7530fb"
                    children={
                        <div style={{
                            height: 28,
                            backgroundColor: props.bgColor ?? '#f8f7ff',
                            borderRadius: 4,
                            border: `1px solid #ede9fe`,
                        }} />
                    }
                />
            )

        case 'two_column':
            return (
                <WireframePreview icon={def.icon} label="Two Column" color="#7530fb">
                    <div style={{ display: 'flex', gap: 6 }}>
                        <div style={{ flex: props.leftWidth ?? 50, height: 28, backgroundColor: '#f8f7ff', borderRadius: 4, border: '1px solid #ede9fe' }} />
                        <div style={{ flex: 100 - (props.leftWidth ?? 50), height: 28, backgroundColor: '#f8f7ff', borderRadius: 4, border: '1px solid #ede9fe' }} />
                    </div>
                </WireframePreview>
            )

        case 'three_column':
            return (
                <WireframePreview icon={def.icon} label="Three Column" color="#7530fb">
                    <div style={{ display: 'flex', gap: 6 }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} style={{ flex: 1, height: 28, backgroundColor: '#f8f7ff', borderRadius: 4, border: '1px solid #ede9fe' }} />
                        ))}
                    </div>
                </WireframePreview>
            )

        case 'container':
            return (
                <WireframePreview icon={def.icon} label="Container" color="#7530fb">
                    <div style={{
                        height: 32,
                        backgroundColor: '#f8f7ff',
                        borderRadius: props.borderRadius ?? 8,
                        border: `${props.borderWidth ?? 1}px solid ${props.borderColor ?? '#ede9fe'}`,
                        maxWidth: '80%',
                        margin: '0 auto',
                    }} />
                </WireframePreview>
            )

        // ── Content blocks ──────────────────────────────────────────────────
        case 'heading': {
            const p = props as HeadingProps
            return (
                <div>
                    {p.borderBottom && (
                        <div style={{
                            width: 3,
                            height: '100%',
                            backgroundColor: p.accentColor,
                            position: 'absolute',
                            left: 16,
                            top: 14,
                            bottom: 12,
                            borderRadius: 2,
                        }} />
                    )}
                    <p style={{
                        margin: 0,
                        fontFamily: 'Arial, sans-serif',
                        fontSize: Math.min(p.fontSize ?? 22, 20),
                        fontWeight: p.fontWeight ?? '700',
                        color: p.color ?? '#1e1535',
                        textAlign: p.align ?? 'left',
                        paddingLeft: p.borderBottom ? 10 : 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.3,
                    }}>
                        {p.text || 'Heading text'}
                    </p>
                    <p style={{
                        margin: '2px 0 0',
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: 10,
                        color: C.muted,
                        paddingLeft: p.borderBottom ? 10 : 0,
                    }}>
                        {p.level?.toUpperCase()} · {p.align}
                    </p>
                </div>
            )
        }

        case 'paragraph': {
            const p = props as ParagraphProps
            return (
                <div>
                    <p style={{
                        margin: 0,
                        fontFamily: 'Arial, sans-serif',
                        fontSize: 13,
                        color: p.color ?? '#6b7280',
                        textAlign: p.align ?? 'left',
                        lineHeight: 1.5,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                    }}>
                        {p.text || 'Paragraph text...'}
                    </p>
                </div>
            )
        }

        case 'bullet_list': {
            const p = props as BulletListProps
            const bulletMap: Record<string, string> = { disc: '•', check: '✓', arrow: '→', star: '★' }
            const bullet = bulletMap[p.style ?? 'disc']
            return (
                <div>
                    {(p.items ?? []).slice(0, 3).map((item: string, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 3, alignItems: 'flex-start' }}>
                            <span style={{ color: p.bulletColor ?? C.primary, fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{bullet}</span>
                            <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: p.color ?? C.body, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item}</span>
                        </div>
                    ))}
                    {(p.items ?? []).length > 3 && (
                        <p style={{ margin: '2px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted }}>
                            +{(p.items ?? []).length - 3} more items
                        </p>
                    )}
                </div>
            )
        }

        case 'divider': {
            const p = props as DividerProps
            return (
                <div style={{ padding: '4px 0' }}>
                    <div style={{
                        height: p.thickness ?? 1,
                        width: `${p.widthPercent ?? 100}%`,
                        margin: '0 auto',
                        background: p.style === 'gradient'
                            ? 'linear-gradient(to right, #7530fb, #b8fa33)'
                            : p.color ?? '#ede9fe',
                        borderRadius: 2,
                        borderTop: p.style !== 'gradient' ? `${p.thickness}px ${p.style} ${p.color}` : 'none',
                    }} />
                    <p style={{ margin: '4px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted, textAlign: 'center' }}>
                        {p.style} · {p.widthPercent}% width
                    </p>
                </div>
            )
        }

        // ── Product blocks ──────────────────────────────────────────────────
        case 'product_title': {
            const p = props as ProductTitleProps
            return (
                <div>
                    <p style={{
                        margin: 0,
                        fontFamily: 'Arial, sans-serif',
                        fontSize: Math.min(p.fontSize ?? 24, 18),
                        fontWeight: p.fontWeight ?? '800',
                        color: p.color ?? '#1e1535',
                        textAlign: p.align ?? 'left',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.3,
                    }}>
                        {p.text ?? '{{PRODUCT_TITLE}}'}
                    </p>
                    {p.showCondition && (
                        <p style={{ margin: '3px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.secondary }}>
                            Condition: <span style={{ color: C.primary, fontWeight: 600 }}>{p.conditionText ?? '{{ITEM_CONDITION}}'}</span>
                        </p>
                    )}
                </div>
            )
        }

        case 'price_block': {
            const p = props as PriceBlockProps
            return (
                <div style={{
                    backgroundColor: p.bgColor ?? '#f8f7ff',
                    borderRadius: p.borderRadius ?? 10,
                    padding: '8px 12px',
                    display: 'inline-block',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                            fontFamily: 'Arial, sans-serif',
                            fontSize: Math.min(p.priceFontSize ?? 32, 26),
                            fontWeight: 900,
                            color: p.priceColor ?? C.primary,
                            lineHeight: 1,
                        }}>
                            {p.priceText ?? '{{ITEM_PRICE}}'}
                        </span>
                        {p.showBadge && (
                            <span style={{
                                backgroundColor: p.badgeBg ?? C.accent,
                                color: p.badgeColor ?? C.dark,
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: 4,
                            }}>
                                {p.badgeText ?? 'SALE'}
                            </span>
                        )}
                    </div>
                    {p.showOriginal && (
                        <p style={{ margin: '2px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.muted, textDecoration: 'line-through' }}>
                            {p.originalText ?? '{{ORIGINAL_PRICE}}'}
                        </p>
                    )}
                </div>
            )
        }

        case 'product_image': {
            const p = props as ProductImageProps
            const isPlaceholder = !p.src || p.src.includes('{{')
            return (
                <div style={{ textAlign: p.align ?? 'center' }}>
                    <div style={{
                        display: 'inline-block',
                        width: Math.min(p.maxWidth ?? 500, 200),
                        height: 90,
                        backgroundColor: C.bg,
                        borderRadius: p.borderRadius ?? 8,
                        border: `1px dashed ${C.border}`,
                        display: 'flex' as any,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column' as any,
                        gap: 4,
                    }}>
                        <span style={{ fontSize: 22, opacity: 0.5 }}>🖼</span>
                        <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted }}>
                            {isPlaceholder ? '{{MAIN_IMAGE_URL}}' : 'Product Image'}
                        </p>
                    </div>
                </div>
            )
        }

        case 'product_description': {
            const p = props as ProductDescriptionProps
            return (
                <div>
                    {p.showTitle && (
                        <p style={{
                            margin: '0 0 6px',
                            fontFamily: 'Arial, sans-serif',
                            fontSize: 13,
                            fontWeight: 700,
                            color: p.titleColor ?? C.dark,
                            borderLeft: `3px solid ${C.primary}`,
                            paddingLeft: 8,
                        }}>
                            {p.titleText ?? 'Product Description'}
                        </p>
                    )}
                    <p style={{
                        margin: 0,
                        fontFamily: 'Arial, sans-serif',
                        fontSize: 12,
                        color: p.color ?? C.secondary,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.5,
                    }}>
                        {p.text ?? '{{ITEM_DESCRIPTION}}'}
                    </p>
                </div>
            )
        }

        case 'specs_table': {
            const p = props as SpecsTableProps
            return (
                <div>
                    {p.showTitle && (
                        <p style={{ margin: '0 0 6px', fontFamily: 'Arial, sans-serif', fontSize: 12, fontWeight: 700, color: C.dark, borderLeft: `3px solid ${C.primary}`, paddingLeft: 8 }}>
                            {p.titleText ?? 'Item Specifics'}
                        </p>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        {(p.rows ?? []).slice(0, 4).map((row: { key: string; value: string }, i: number) => (
                            <React.Fragment key={i}>
                                <div style={{ backgroundColor: i % 2 === 0 ? '#f8f7ff' : '#fff', padding: '3px 8px', fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, color: C.dark, border: `1px solid ${C.border}` }}>{row.key}</div>
                                <div style={{ backgroundColor: i % 2 === 0 ? '#f8f7ff' : '#fff', padding: '3px 8px', fontFamily: 'Arial, sans-serif', fontSize: 10, color: C.secondary, border: `1px solid ${C.border}` }}>{row.value}</div>
                            </React.Fragment>
                        ))}
                    </div>
                    {(p.rows ?? []).length > 4 && (
                        <p style={{ margin: '4px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted }}>+{(p.rows ?? []).length - 4} more rows</p>
                    )}
                </div>
            )
        }

        // ── Media blocks ────────────────────────────────────────────────────
        case 'image': {
            const p = props as ImageProps
            return (
                <div style={{ textAlign: p.align ?? 'center' }}>
                    <div style={{
                        display: 'inline-block',
                        width: p.widthUnit === '%' ? '100%' : Math.min(p.width ?? 100, 240),
                        maxWidth: '100%',
                        height: 70,
                        backgroundColor: C.bg,
                        borderRadius: p.borderRadius ?? 0,
                        border: `1px dashed ${C.border}`,
                        display: 'flex' as any,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <span style={{ fontSize: 20, opacity: 0.4 }}>📷</span>
                    </div>
                    {p.src && !p.src.includes('placeholder') && (
                        <p style={{ margin: '4px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.src.length > 40 ? p.src.slice(0, 40) + '…' : p.src}
                        </p>
                    )}
                </div>
            )
        }

        case 'banner': {
            const p = props as BannerProps
            return (
                <div style={{
                    borderRadius: 8,
                    padding: '14px 16px',
                    background: p.bgGradient
                        ? `linear-gradient(135deg, ${p.gradientFrom ?? '#7530fb'}, ${p.gradientTo ?? '#1e1535'})`
                        : p.bgColor ?? '#1e1535',
                    textAlign: p.align ?? 'center',
                }}>
                    <p style={{ margin: '0 0 3px', fontFamily: 'Arial, sans-serif', fontSize: 14, fontWeight: 800, color: p.headingColor ?? '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.headingText ?? 'Banner Heading'}
                    </p>
                    <p style={{ margin: 0, fontFamily: 'Arial, sans-serif', fontSize: 11, color: p.subColor ?? 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.subText ?? 'Subtitle text'}
                    </p>
                </div>
            )
        }

        case 'gallery_row': {
            return (
                <WireframePreview icon={def.icon} label="Gallery Row" color="#d97706">
                    <div style={{ display: 'flex', gap: 4 }}>
                        <div style={{ flex: 2, height: 50, backgroundColor: '#fef3c7', borderRadius: 4, border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🖼</div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ flex: 1, backgroundColor: '#fef3c7', borderRadius: 3, border: '1px solid #fde68a' }} />
                            <div style={{ flex: 1, backgroundColor: '#fef3c7', borderRadius: 3, border: '1px solid #fde68a' }} />
                        </div>
                    </div>
                </WireframePreview>
            )
        }

        // ── eBay Specific blocks ────────────────────────────────────────────
        case 'trust_badges': {
            const p = props as TrustBadgesProps
            return (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(p.badges ?? []).map((badge: { icon: string; text: string }, i: number) => (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 8px',
                            backgroundColor: p.badgeBg ?? '#fff',
                            border: `1px solid ${p.borderColor ?? C.border}`,
                            borderRadius: p.borderRadius ?? 8,
                        }}>
                            <span style={{ fontSize: 13 }}>{badge.icon}</span>
                            <span style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, color: p.textColor ?? C.dark }}>{badge.text}</span>
                        </div>
                    ))}
                </div>
            )
        }

        case 'shipping_info': {
            const p = props as ShippingInfoProps
            return (
                <div style={{
                    backgroundColor: p.bgColor ?? '#dcfce7',
                    borderRadius: p.borderRadius ?? 8,
                    padding: '8px 12px',
                }}>
                    <p style={{ margin: 0, fontFamily: 'Arial, sans-serif', fontSize: 12, fontWeight: 700, color: p.textColor ?? '#166534', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        🚚 <strong>{p.shippingText ?? '{{SHIPPING_TIME}}'}</strong> · {p.dispatchText ?? 'Same Day Dispatch'}
                    </p>
                </div>
            )
        }

        case 'returns_policy': {
            const p = props as ReturnsPolicyProps
            return (
                <div style={{
                    backgroundColor: p.bgColor ?? '#e0f2fe',
                    borderRadius: p.borderRadius ?? 8,
                    padding: '8px 12px',
                }}>
                    <p style={{ margin: 0, fontFamily: 'Arial, sans-serif', fontSize: 12, fontWeight: 600, color: p.textColor ?? '#075985', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        ↩ {p.showPeriod ? `${p.periodText ?? '30-Day Free Returns'} · ` : ''}{p.policyText ?? '{{RETURN_POLICY}}'}
                    </p>
                </div>
            )
        }

        case 'seller_info': {
            const p = props as SellerInfoProps
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: p.bgColor ?? '#f8f7ff', padding: '8px 12px', borderRadius: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                        👤
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <p style={{ margin: 0, fontFamily: 'Arial, sans-serif', fontSize: 13, fontWeight: 700, color: p.textColor ?? C.dark }}>{p.sellerName ?? '{{SELLER_NAME}}'}</p>
                            {p.showBadge && (
                                <span style={{ backgroundColor: C.accent, color: C.dark, fontFamily: 'DM Sans, sans-serif', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4 }}>{p.badgeText ?? 'Top Rated'}</span>
                            )}
                        </div>
                        <p style={{ margin: '1px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.secondary }}>{p.tagline ?? 'Trusted Seller'} · <span style={{ color: C.primary }}>{p.feedbackText ?? '99.8% Positive'}</span></p>
                    </div>
                </div>
            )
        }

        case 'cta_banner': {
            const p = props as CtaBannerProps
            return (
                <div style={{
                    borderRadius: 8,
                    padding: '14px 16px',
                    background: p.bgGradient
                        ? `linear-gradient(135deg, ${p.gradientFrom ?? '#7530fb'}, ${p.gradientTo ?? '#1e1535'})`
                        : p.bgColor ?? '#1e1535',
                    textAlign: p.align ?? 'center',
                }}>
                    <p style={{ margin: '0 0 3px', fontFamily: 'Arial, sans-serif', fontSize: 13, fontWeight: 800, color: p.textColor ?? C.accent, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.headingText ?? 'Buy with Confidence'}
                    </p>
                    <p style={{ margin: 0, fontFamily: 'Arial, sans-serif', fontSize: 11, color: p.subTextColor ?? 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.subText ?? 'Secure payment · Fast dispatch'}
                    </p>
                </div>
            )
        }

        default:
            return (
                <WireframePreview icon={def.icon} label={def.label} color={C.primary} />
            )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// WIREFRAME PREVIEW
// Generic placeholder for blocks that don't need custom rendering
// ─────────────────────────────────────────────────────────────────────────────
function WireframePreview({
    icon,
    label,
    color,
    children,
}: {
    icon: string
    label: string
    color: string
    children?: React.ReactNode
}) {
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 14 }}>{icon}</span>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600, color }}>
                    {label}
                </span>
            </div>
            {children ?? (
                <div style={{
                    height: 32,
                    backgroundColor: '#f8f7ff',
                    borderRadius: 6,
                    border: '1px solid #ede9fe',
                }} />
            )}
        </div>
    )
}
