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
import { SLOT_SELECTION_CSS } from './slotSelection'
import React, { useState, useRef, useCallback } from 'react'
import { getFreeVariantIds } from './PropertiesPanel'
import ImageEditorModal from '@/components/ui/ImageEditor/ImageEditorModal'
import type { ImageEditorState } from '@/components/ui/ImageEditor/types'
import {
    Layout, Columns2, Columns3, Square,
    Heading, Pilcrow, List, Minus,
    Tag, BadgeDollarSign, Image, FileText, Table2,
    Camera, Megaphone, LayoutGrid, Layers,
    ShieldCheck, Truck, RotateCcw, User, Bell,
    Check, ArrowRight, Star, Package,
    ChevronUp, ChevronDown, Copy, Clipboard,
    Lock, Unlock, Eye, EyeOff, Trash2, CopySlash,
    PlusCircle,
    type LucideIcon,
} from 'lucide-react'
import {
    Block,
    BlockType,
    BlockDefinition,
    BlockProps,
    getDefinition,
    generateId,
    BLOCK_DEFINITIONS,
} from './blocks'
import { renderForCanvas, extractTokens, type CategoryId, renderBannerForCanvas } from './sampleData'
import { getGoogleFontLinkHtml } from './fonts'
import ColumnControls from './ColumnControls'
import ColumnResizer from './ColumnResizer'
import { AIFloatingButton } from './AIQuickFillPopover'

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

// Device preview widths — used in BlockPreview iframe sizing only
const DEVICE_PREVIEW_WIDTHS = {
    desktop: 1000,
    tablet: 768,
    mobile: 375,
} as const


// ── Lucide icon lookup ────────────────────────────────────────────────────────
const BLOCK_ICONS: Record<string, LucideIcon> = {
    'layout': Layout,
    'columns-2': Columns2,
    'layers': Layers,
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
    /** Set of block ids that match the current search. null = no search active. */
    matchedIds?: Set<string> | null
    /** @deprecated use matchedIds — kept for backwards-compat callers */
    canvasSearch?: string
    lockedIds?: Set<string>
    hiddenIds?: Set<string>
    deviceWidth: 'desktop' | 'tablet' | 'mobile'
    /**
     * Active template category — controls which set of sample data
     * (product photos, brand name, spec values, cross-sell items) the
     * canvas preview swaps in for {{TOKENS}}.
     */
    activeCategory?: CategoryId
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
    onAddBlockBelow?: (blockId: string, type: BlockType) => void
    onUpdateBlock?: (block: Block) => void
    onClearSlot?: (blockId: string, propKey: string) => void
    selectedSubSlot?: string | null
    hasActiveSlot?: boolean
    onDeselect?: () => void
    onLoadTemplate?: (blocks: Block[], templateId: string) => void
    /** Design Studio plan — used to show Pro watermark on blocks using Pro styles */
    designStudioPlan?: 'free' | 'pro'
    /** All blocks for AI fill context */
    aiAllBlocks?: Block[]
    /** Callback to batch-update block props (AI fill) */
    onUpdateBlocks?: (updates: Array<{ id: string; props: BlockProps }>) => void
    /** Template category for AI fill */
    templateCategory?: string
    /** Credit balance for AI fill display */
    creditBalance?: number | null
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Canvas({
    blocks,
    selectedId,
    draggedType,
    zoom = 100,
    matchedIds = null,
    canvasSearch = '',
    lockedIds = new Set(),
    hiddenIds = new Set(),
    deviceWidth,
    activeCategory,
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
    onAddBlockBelow,
    onUpdateBlock,
    onClearSlot,
    selectedSubSlot = null,
    hasActiveSlot = false,
    onDeselect,
    onLoadTemplate,
    designStudioPlan = 'free',
    aiAllBlocks,
    onUpdateBlocks,
    templateCategory,
    creditBalance = null,
}: CanvasProps) {
    // Drop zone state — is library block being dragged over the canvas?
    const [isDropTarget, setIsDropTarget] = useState(false)
    // Which canvas block is being reordered?
    const [reorderFrom, setReorderFrom] = useState<number | null>(null)
    const [reorderOver, setReorderOver] = useState<number | null>(null)
    // canvasWidth removed — canvas frame now fills full width (device framing handled per-block)

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

    // ── Image editor modal state ──
    const [imgEditorSrc, setImgEditorSrc] = React.useState<string | null>(null)
    const [imgEditorPropKey, setImgEditorPropKey] = React.useState<string | null>(null)
    const [imgEditorBlockId, setImgEditorBlockId] = React.useState<string | null>(null)
    const [imgEditorInitialState, setImgEditorInitialState] = React.useState<import('../ImageEditor/types').ImageEditorState | undefined>(undefined)

    // ── Listen for block selection clicks from inside iframes ──
    React.useEffect(() => {
        const handleIframeClick = (e: MessageEvent) => {
            if (e.data?.type === 'RIAZIFY_SELECT_BLOCK' && e.data.blockId) {
                if (!lockedIds.has(e.data.blockId)) {
                    onSelect(e.data.blockId)
                }
            }
            // Open image editor modal when user clicks edit icon on a canvas image
            if (e.data?.type === 'RIAZIFY_EDIT_IMAGE' && e.data.imageUrl) {
                const propKey = e.data.propKey || null
                const blockId = e.data.blockId || null
                setImgEditorPropKey(propKey)
                setImgEditorBlockId(blockId)
                if (blockId && propKey) {
                    const block = blocks.find(b => b.id === blockId)
                    const storedState = block ? (block.props as any)[`${propKey}__editorState`] : undefined
                    const originalUrl = block ? (block.props as any)[`${propKey}__originalUrl`] : undefined
                    // Non-destructive editing: use the original clean URL (before any baking)
                    // so re-edits always apply on top of the pristine source image.
                    // Fall back to the current imageUrl if no original is stored yet.
                    setImgEditorSrc(originalUrl ?? e.data.imageUrl)
                    setImgEditorInitialState(storedState ?? undefined)
                } else {
                    setImgEditorSrc(e.data.imageUrl)
                    setImgEditorInitialState(undefined)
                }
            }
        }
        window.addEventListener('message', handleIframeClick)
        return () => window.removeEventListener('message', handleIframeClick)
    }, [onSelect, lockedIds, blocks])

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div
            style={{
                flex: 1,
                height: '100%',
                overflowY: 'auto',
                overflowX: 'auto',
                backgroundColor: '#e8e6f0',
                position: 'relative',
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={(e) => {
                const target = e.target as HTMLElement
                // Deselect when clicking canvas background or whitespace (outside block cards and buttons)
                if (!target.closest('[data-block-id]') && !target.closest('button')) {
                    onDeselect?.()
                    // Clear active slot outline in all block iframes
                    document.querySelectorAll('iframe').forEach(iframe => {
                        try {
                            iframe.contentWindow?.postMessage({ type: 'RIAZIFY_UPDATE_ACTIVE_SLOT', propKey: null }, '*')
                        } catch (err) { }
                    })
                }
            }}
        >
            {/* ── Zoom wrapper — scale() must be on an inner div, NOT the scroll root.
                 Applying scale() to the overflow:auto parent clips content and breaks scroll. ── */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px 20px 40px',
                transformOrigin: 'top center',
                transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
                minHeight: '100%',
                width: '100%',
            }}>
                {/* ── Device mode indicator badge removed ── */}

                {/* ── Drop overlay — handled by EmptyState when canvas is empty ── */}

                {/* ── Canvas frame ── */}
                <div style={{
                    width: '100%',
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
                            onLoadTemplate={onLoadTemplate}
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
                                    onAddBlock={onAddBlock}
                                    onClearSlot={onClearSlot}
                                    selectedSubSlot={isSelected ? selectedSubSlot : null}
                                    onUpdateProps={(patch) => {
                                        if (onUpdateBlock) {
                                            onUpdateBlock({
                                                ...block,
                                                props: { ...block.props, ...patch } as any,
                                            })
                                        }
                                    }}
                                    isLocked={lockedIds.has(block.id)}
                                    isHidden={hiddenIds.has(block.id)}
                                    searchMatch={
                                        matchedIds
                                            ? matchedIds.has(block.id)
                                            : (!canvasSearch || (getDefinition(block.type)?.label?.toLowerCase().includes(canvasSearch.toLowerCase()) ?? true))
                                    }
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
                                    onAddBelow={(type) => onAddBlockBelow?.(block.id, type)}
                                    hasActiveSlot={hasActiveSlot}
                                    activeCategory={activeCategory}
                                    deviceWidth={deviceWidth}
                                    designStudioPlan={designStudioPlan}
                                    aiAllBlocks={aiAllBlocks}
                                    onUpdateBlocks={onUpdateBlocks}
                                    templateCategory={templateCategory}
                                    creditBalance={creditBalance}
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
            </div>{/* ── /zoom wrapper ── */}

            {/* ── Image Editor Modal ── */}
            {imgEditorSrc && (
                <ImageEditorModal
                    imageUrl={imgEditorSrc}
                    imageName={imgEditorPropKey || 'image'}
                    initialState={imgEditorInitialState}
                    onSave={(editedUrl: string, _state: ImageEditorState) => {
                        // Post the edited image URL + editor state back to VisualEditor.
                        // originalUrl = the clean source image (imgEditorSrc) the editor opened
                        // with — this is stored so future re-edits always apply to the pristine
                        // original rather than to the already-baked JPEG (non-destructive).
                        if (imgEditorBlockId && imgEditorPropKey) {
                            window.postMessage({
                                type: 'RIAZIFY_IMAGE_EDITED',
                                blockId: imgEditorBlockId,
                                propKey: imgEditorPropKey,
                                fileUrl: editedUrl,
                                originalUrl: imgEditorSrc,
                                editorState: _state,
                            }, '*')
                        }
                        setImgEditorSrc(null)
                        setImgEditorPropKey(null)
                        setImgEditorBlockId(null)
                        setImgEditorInitialState(undefined)
                    }}
                    onClose={() => {
                        setImgEditorSrc(null)
                        setImgEditorPropKey(null)
                        setImgEditorBlockId(null)
                        setImgEditorInitialState(undefined)
                    }}
                />
            )}
        </div >
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE — Onboarding for new users
// ─────────────────────────────────────────────────────────────────────────────
function EmptyState({
    isDropTarget,
    draggedType,
}: {
    isDropTarget: boolean
    draggedType: BlockType | null
    onAddBlock?: (type: BlockType) => void
    onLoadTemplate?: (blocks: Block[], templateId: string) => void
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
            border: isDropTarget ? `2px dashed ${C.primary}` : 'none',
            borderRadius: isDropTarget ? 16 : 0,
            backgroundColor: isDropTarget ? C.primaryLight : 'transparent',
            transition: 'all 0.2s ease',
            padding: 40,
        }}>
            {isDropTarget && def ? (
                <>
                    <style>{`
                        @keyframes bounceDown {
                            0%, 100% { transform: translateY(0px); }
                            50%       { transform: translateY(10px); }
                        }
                    `}</style>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        backgroundColor: C.primary,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, marginBottom: 16,
                        boxShadow: `0 8px 24px ${C.primary}44`,
                        animation: 'bounceDown 0.8s ease-in-out infinite',
                        color: '#fff',
                    }}>
                        ↓
                    </div>
                    <p style={{ margin: '0 0 4px', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: C.primary }}>
                        Drop to add {def.label}
                    </p>
                    <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.secondary }}>
                        {def.description}
                    </p>
                </>
            ) : (
                <>
                    <style>{`
                        @keyframes floatUp {
                            0%   { transform: translateY(0px);  opacity: 0.18; }
                            50%  { transform: translateY(-8px); opacity: 0.45; }
                            100% { transform: translateY(0px);  opacity: 0.18; }
                        }
                        @keyframes floatMid {
                            0%   { transform: translateY(0px);  opacity: 0.55; }
                            50%  { transform: translateY(-6px); opacity: 0.85; }
                            100% { transform: translateY(0px);  opacity: 0.55; }
                        }
                        @keyframes floatDown {
                            0%   { transform: translateY(0px);  opacity: 0.12; }
                            50%  { transform: translateY(-5px); opacity: 0.28; }
                            100% { transform: translateY(0px);  opacity: 0.12; }
                        }
                        @keyframes pulseGlow {
                            0%   { box-shadow: 0 0 0px 0px rgba(117,48,251,0); }
                            50%  { box-shadow: 0 0 24px 6px rgba(117,48,251,0.18); }
                            100% { box-shadow: 0 0 0px 0px rgba(117,48,251,0); }
                        }
                    `}</style>

                    {/* Animated block stack graphic */}
                    <div style={{ position: 'relative', width: 220, height: 160, marginBottom: 32 }}>

                        {/* Back block — widest, slowest */}
                        <div style={{
                            position: 'absolute', top: 0, left: 20, right: 20, height: 38,
                            borderRadius: 10, backgroundColor: C.primary, opacity: 0.18,
                            animation: 'floatDown 3.8s ease-in-out infinite',
                        }} />

                        {/* Middle block — accent stripe */}
                        <div style={{
                            position: 'absolute', top: 50, left: 0, right: 0, height: 46,
                            borderRadius: 10, backgroundColor: C.primary, opacity: 0.55,
                            animation: 'floatMid 3s ease-in-out infinite',
                            animationDelay: '0.3s',
                        }}>
                            {/* Inner stripe */}
                            <div style={{
                                position: 'absolute', top: 12, left: 14, right: 50,
                                height: 8, borderRadius: 4,
                                backgroundColor: 'rgba(255,255,255,0.35)',
                            }} />
                            <div style={{
                                position: 'absolute', top: 26, left: 14, right: 80,
                                height: 6, borderRadius: 3,
                                backgroundColor: 'rgba(255,255,255,0.2)',
                            }} />
                        </div>

                        {/* Front block — narrowest, fastest, glowing */}
                        <div style={{
                            position: 'absolute', top: 112, left: 14, right: 14, height: 32,
                            borderRadius: 10, backgroundColor: C.primary, opacity: 0.18,
                            animation: 'floatUp 2.6s ease-in-out infinite, pulseGlow 2.6s ease-in-out infinite',
                            animationDelay: '0.6s',
                        }} />

                        {/* Floating dot — top right */}
                        <div style={{
                            position: 'absolute', top: 8, right: 10,
                            width: 10, height: 10, borderRadius: '50%',
                            backgroundColor: C.primary, opacity: 0.4,
                            animation: 'floatMid 2.2s ease-in-out infinite',
                            animationDelay: '0.8s',
                        }} />

                        {/* Floating dot — bottom left */}
                        <div style={{
                            position: 'absolute', bottom: 4, left: 8,
                            width: 7, height: 7, borderRadius: '50%',
                            backgroundColor: C.primary, opacity: 0.25,
                            animation: 'floatUp 2.9s ease-in-out infinite',
                            animationDelay: '1.1s',
                        }} />
                    </div>

                    <p style={{
                        margin: '0 0 10px',
                        fontFamily: 'Syne, sans-serif', fontWeight: 700,
                        fontSize: 20, color: C.dark, textAlign: 'center',
                    }}>
                        Drag blocks here to start building
                    </p>
                    <p style={{
                        margin: '0 0 24px',
                        fontFamily: 'DM Sans, sans-serif', fontSize: 13,
                        color: C.secondary, textAlign: 'center',
                        maxWidth: 300, lineHeight: 1.7,
                    }}>
                        Select blocks from the library on the left, or load a starter template from the Templates tab.
                    </p>
                    {/* Quick-start tips */}
                    <div style={{
                        display: 'flex', gap: 10, flexWrap: 'wrap' as const,
                        justifyContent: 'center', maxWidth: 340,
                    }}>
                        {[
                            { icon: '📦', text: 'Product Block' },
                            { icon: '📝', text: 'Text Block' },
                            { icon: '🖼️', text: 'Image Block' },
                        ].map(tip => (
                            <div key={tip.text} style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '6px 12px', borderRadius: 20,
                                backgroundColor: C.primaryLight,
                                border: `1px solid ${C.border}`,
                                fontFamily: 'DM Sans, sans-serif', fontSize: 11,
                                color: C.primary, fontWeight: 600,
                            }}>
                                <span>{tip.icon}</span>
                                <span>{tip.text}</span>
                            </div>
                        ))}
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
        <>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.4; }
                }
            `}</style>
            <div style={{
                height: 3,
                backgroundColor: C.primary,
                borderRadius: 3,
                margin: '2px 0',
                boxShadow: `0 0 8px ${C.primary}88`,
                animation: 'pulse 0.8s ease-in-out infinite',
            }} />
        </>
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
    onUpdateProps?: (patch: Record<string, any>) => void
    onAddBlock?: (type: BlockType) => void
    onClearSlot?: (blockId: string, propKey: string) => void
    selectedSubSlot?: string | null
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
    onAddBelow: (type: BlockType) => void
    hasActiveSlot?: boolean
    activeCategory?: CategoryId
    deviceWidth?: 'desktop' | 'tablet' | 'mobile'
    designStudioPlan?: 'free' | 'pro'
    aiAllBlocks?: Block[]
    onUpdateBlocks?: (updates: Array<{ id: string; props: BlockProps }>) => void
    templateCategory?: string
    creditBalance?: number | null
}

function BlockCard({
    block,
    def,
    index,
    total,
    isSelected,
    isBeingDragged,
    onUpdateProps,
    onAddBlock,
    onClearSlot,
    selectedSubSlot,
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
    onAddBelow,
    hasActiveSlot,
    activeCategory,
    deviceWidth = 'desktop',
    designStudioPlan = 'free',
    aiAllBlocks,
    onUpdateBlocks,
    templateCategory,
    creditBalance = null,
}: BlockCardProps) {
    const [hovered, setHovered] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState(false)
    const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // ── Extract the {{TOKENS}} used in this block so we can surface them as a
    //    hover badge — keeps the dynamic identifiers visible while the canvas
    //    preview itself shows sample data.
    const tokens = React.useMemo(() => {
        try {
            const blockDef = getDefinition(block.type)
            if (!blockDef) return []
            return extractTokens(blockDef.toHtml(block.props as any, block.id))
        } catch {
            return []
        }
    }, [block.type, block.id, block.props])

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (deleteConfirm) {
            if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
            onDelete()
            setDeleteConfirm(false)
        } else {
            setDeleteConfirm(true)
            // Auto-reset after 2.5s — cleared on unmount to prevent memory leak
            if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
            deleteTimerRef.current = setTimeout(() => setDeleteConfirm(false), 2500)
        }
    }

    return (
        <div
            data-block-id={block.id}
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
                zIndex: isSelected ? 20 : hovered ? 10 : 1,
                marginBottom: 8,
                borderRadius: 0,
                opacity: isBeingDragged ? 0.4 : isHidden ? 0.35 : 1,
                filter: !searchMatch ? 'opacity(0.25) grayscale(0.5)' : undefined,
                outline: isLocked
                    ? `2px solid #d97706`
                    : isSelected
                        ? `2px solid ${C.primary}`
                        : hovered
                            ? `2px dashed ${C.primaryBorder}`
                            : '2px solid transparent',
                outlineOffset: 0,
                backgroundColor: 'transparent',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                transition: 'outline 0.15s, opacity 0.15s, box-shadow 0.15s',
                boxShadow: isSelected
                    ? '0 0 0 3px rgba(117, 48, 251, 0.20)'
                    : (block.props as any).showShadow
                        ? `${(block.props as any).shadowX ?? 0}px ${(block.props as any).shadowY ?? 4}px ${(block.props as any).shadowBlur ?? 12}px ${(block.props as any).shadowSpread ?? 0}px ${(block.props as any).shadowColor ?? 'rgba(0,0,0,0.10)'}`
                        : 'none',
                overflow: 'visible',
            }}
        >

            {/* ── Floating In-Canvas Column Controls for Two / Three / Four Column ── */}
            {isSelected && onUpdateProps && ['two_column', 'three_column', 'four_column'].includes(block.type) && (
                <>
                    <ColumnControls
                        block={block}
                        onUpdateProps={onUpdateProps}
                        isFirst={index === 0}
                    />
                    <ColumnResizer
                        block={block}
                        onUpdateProps={onUpdateProps}
                    />
                </>
            )}



            {/* ── Selected label badge — sleek designer tab attached to top-left ── */}
            {isSelected && (
                <div style={{
                    position: 'absolute',
                    top: -17,
                    left: 0,
                    background: 'var(--primary, #6366f1)',
                    color: '#fff',
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '3px 3px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3.5,
                    zIndex: 25,
                    pointerEvents: 'none',
                    letterSpacing: '0.02em',
                    boxShadow: '0 -2px 4px rgba(0,0,0,0.06)',
                    lineHeight: '14px',
                }}>
                    {(() => { const I = BLOCK_ICONS[def.icon]; return I ? <I size={9.5} strokeWidth={2.2} /> : null })()}
                    <span>{def.label}</span>
                </div>
            )}

            {/* ── Drag handle — centred above block, below the selected badge ── */}
            {(hovered || isSelected) && (
                <div style={{
                    position: 'absolute',
                    top: -18,
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
            {/* Desktop: full-width inner wrapper so 700px iframe fills the stage */}
            {/* Tablet/Mobile: centred constrained wrapper with device framing    */}
            <div style={{
                padding: deviceWidth === 'desktop' ? '0' : '16px 0',
                display: 'flex',
                justifyContent: 'center',
                pointerEvents: 'auto',
                overflow: 'hidden',
            }}>
                <div
                    ref={el => {
                        if (!el) return
                        // Scale proportionally so content stretches 100% from left to right with 0px gap
                        const recalcScale = () => {
                            if (deviceWidth === 'desktop') {
                                const w = el.getBoundingClientRect().width
                                const scale = w > 0 ? (w / 1000) : 1
                                el.style.setProperty('--canvas-scale', String(scale))
                            } else {
                                el.style.setProperty('--canvas-scale', '1')
                            }
                        }
                        recalcScale()
                        const ro = new ResizeObserver(recalcScale)
                        ro.observe(el)
                            ; (el as any).__ro?.disconnect()
                            ; (el as any).__ro = ro
                    }}
                    style={{
                        width: deviceWidth === 'desktop' ? '100%' : deviceWidth === 'tablet' ? '768px' : '375px',
                        overflow: 'hidden',
                        borderRadius: deviceWidth === 'desktop' ? 0 : 8,
                        boxShadow: deviceWidth === 'desktop' ? 'none' : '0 4px 24px rgba(0,0,0,0.18)',
                        border: deviceWidth === 'desktop' ? 'none' : '1px solid rgba(0,0,0,0.10)',
                    }}
                >
                    <BlockPreview block={block} def={def} activeCategory={activeCategory} deviceWidth={deviceWidth} />
                </div>
            </div>

            {/* ── Pro style watermark — editor-only, never exported ── */}
            {(() => {
                if (designStudioPlan === 'pro') return null
                const freeIds = getFreeVariantIds(block.type)
                if (!freeIds) return null          // block has <10 variants → all free
                const variantId = (block.props as any).variant ?? (block.props as any).layoutStyle
                if (!variantId) return null
                if (freeIds.has(variantId)) return null
                return (
                    <div
                        title="Pro style — upgrade to publish"
                        style={{
                            position: 'absolute',
                            bottom: 6,
                            left: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: '#fff',
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            padding: '2px 7px 2px 5px',
                            borderRadius: 10,
                            lineHeight: 1,
                            boxShadow: '0 1px 4px rgba(217,119,6,0.45)',
                            pointerEvents: 'none',
                            zIndex: 5,
                            userSelect: 'none',
                        }}
                    >
                        <svg width={8} height={7} viewBox="0 0 16 14" fill="none" style={{ display: 'block', flexShrink: 0 }}>
                            <path d="M1 13h14M2 13L0.5 5.5L5 9L8 1L11 9L15.5 5.5L14 13H2Z" fill="#fff" stroke="#fff" strokeWidth="0.5" strokeLinejoin="round" strokeLinecap="round" />
                        </svg>
                        Pro
                    </div>
                )
            })()}

            {/* ── AI Floating Wand Button — bottom-right when selected, only with 2+ blocks ── */}
            {isSelected && aiAllBlocks && aiAllBlocks.length > 1 && onUpdateBlocks && (
                <AIFloatingButton
                    block={block}
                    allBlocks={aiAllBlocks}
                    templateCategory={templateCategory}
                    creditBalance={creditBalance}
                    onUpdateBlocks={onUpdateBlocks}
                />
            )}

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

                    <Divider />

                    {!hasActiveSlot && (
                        <>
                            <ActionButton
                                onClick={() => onAddBelow('spacer')}
                                title="Add spacer below"
                                color={C.success}
                                bg={C.successLight}
                            >
                                <PlusCircle size={13} />
                            </ActionButton>
                            <ActionButton
                                onClick={() => onAddBelow('divider')}
                                title="Add divider below"
                                color={C.success}
                                bg={C.successLight}
                            >
                                <Minus size={13} />
                            </ActionButton>
                        </>
                    )}
                </div>
            )}

            {/* ── Tokens-used hover badge (bottom-left) ── */}
            {/* Shows which {{TOKENS}} are used in this block so the user can
                still see what's dynamic, even though the canvas renders with
                sample data. Visible on hover or when selected. */}
            {(hovered || isSelected) && tokens.length > 0 && (
                <div style={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    backgroundColor: C.primary,
                    color: '#fff',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '4px 9px',
                    borderRadius: 20,
                    letterSpacing: '0.02em',
                    zIndex: 2,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    maxWidth: 320,
                    boxShadow: '0 2px 6px rgba(117, 48, 251, 0.25)',
                }}>
                    <span style={{
                        fontFamily: 'monospace',
                        fontSize: 9,
                        opacity: 0.7,
                        fontWeight: 700,
                    }}>
                        {'{{}}'}
                    </span>
                    <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                        {tokens.slice(0, 3).join(' · ')}
                        {tokens.length > 3 && ` +${tokens.length - 3} more`}
                    </span>
                </div>
            )}

            {/* ── Bottom type label removed: only pure template renders ── */}
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
function BlockPreview({ block, def, activeCategory, deviceWidth = 'desktop' }: { block: Block; def: BlockDefinition; activeCategory?: CategoryId; deviceWidth?: 'desktop' | 'tablet' | 'mobile' }) {
    const props = block.props as any
    const iframeRef = React.useRef<HTMLIFrameElement>(null)
    const previewWidth = deviceWidth === 'mobile' ? 375 : deviceWidth === 'tablet' ? 768 : 1000

    // Build the full HTML for this single block
    const html = React.useMemo(() => {
        try {
            const blockDef = getDefinition(block.type)
            if (!blockDef) return ''
            // 1) Render the eBay HTML as usual — still contains {{TOKENS}}
            let blockHtml = blockDef.toHtml(props, block.id)

            // 2) Canvas-only swap: replace {{TOKENS}} with sample data, swap
            //    placeholder images for real product photos, and turn icon-name
            //    strings (e.g. 'shield-check') into inline SVGs.
            //    The block's props are NOT mutated — saved HTML stays tokenized.
            //    Sample data is category-matched so the preview reflects the
            //    active template's theme (pet / electronics / fashion / etc.).
            if (block.type === 'banner') {
                // Use the special helper to honor imageUrl, imagePosition, borderRadius
                blockHtml = renderBannerForCanvas(block, activeCategory)
            } else {
                blockHtml = renderForCanvas(blockHtml, block.type, activeCategory)
            }

            // 3) If any <img src> still references a {{TOKEN}} (defensive — should
            //    be handled by renderForCanvas already), fall back to a small
            //    transparent 1×1 so we never show the browser's broken-image icon.
            if (/src="[^"]*\{\{[^}]*\}\}[^"]*"/i.test(blockHtml)) {
                blockHtml = blockHtml.replace(
                    /src="[^"]*\{\{[^}]*\}\}[^"]*"/gi,
                    'src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%221%22%20height%3D%221%22%2F%3E"'
                )
            }

            // Build font override CSS + Google Font <link> tag so the selected font
            // is actually available inside the iframe (iframes are separate documents —
            // fonts injected into the parent page via loadFont() are lost on remount).
            const fontOverrideCss = props.fontFamily
                ? `  /* Font override — user-selected font from toolbar */\n  * { font-family: ${props.fontFamily} !important; }\n`
                : ''
            const fontLinkTag = props.fontFamily ? getGoogleFontLinkHtml(props.fontFamily) : ''

            // ── Text color override ─────────────────────────────────────────────────────
            // Only applied when props.color is explicitly set.
            // Blocks that hardcode their own colours (quote_block, warning_box, info_box,
            // data_table, testimonials) do NOT set props.color in their defaultProps —
            // so this override only fires when the user deliberately picks a colour from
            // the toolbar, making it a safe global override for all block types.
            const colorOverrideCss = props.color
                ? `  /* Text color override — user-selected color from toolbar */\n  p, li, td, th, h1, h2, h3, h4, blockquote, span { color: ${props.color} !important; }\n`
                : ''

            // ── Font size override ──────────────────────────────────────────────────────
            // Same principle: only applied when the prop is explicitly set.
            // For blocks that read p.fontSize in toHtml, the inline style and this CSS
            // override carry the same value — harmless. For hardcoded blocks, this only
            // fires after a toolbar interaction.
            const fontSizeRaw = (props as any).fontSize
            const fontSizeOverrideCss = (fontSizeRaw !== undefined && fontSizeRaw !== null)
                ? `  /* Font size override — user-selected size from toolbar */\n  p, li, td, th, h1, h2, h3, h4 { font-size: ${typeof fontSizeRaw === 'number' ? fontSizeRaw + 'px' : fontSizeRaw} !important; }\n`
                : ''

            // ── Font weight override ────────────────────────────────────────────────────
            const fontWeightRaw = (props as any).fontWeight
            const fontWeightOverrideCss = (fontWeightRaw && fontWeightRaw !== '400' && fontWeightRaw !== 'normal')
                ? `  /* Font weight override — user-selected weight from toolbar */\n  p, li, td, th, h1, h2, h3, h4 { font-weight: ${fontWeightRaw} !important; }\n`
                : ''

            return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
${fontLinkTag}
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    background: transparent;
    overflow: hidden;
    width: ${previewWidth}px;
  }
${fontOverrideCss}${colorOverrideCss}${fontSizeOverrideCss}${fontWeightOverrideCss}
  table { border-collapse: collapse; }
  img { border: 0; display: block; max-width: 100%; cursor: pointer; }
  a { text-decoration: none; }
  a[href] { text-decoration: underline; color: #7530fb; }
  /* ── Mobile-responsive column stacking ───────────────────────────────────
     Two / Three / Four Column blocks use table-based layouts for email
     compatibility. On mobile (≤500px) we stack their <td> cells vertically
     so content is readable instead of squeezed into tiny columns.       */
  @media screen and (max-width: 500px) {
    table.mobile-stack,
    table.mobile-stack tr,
    table.mobile-stack tbody { display: block !important; width: 100% !important; }
    table.mobile-stack td {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      padding-bottom: 12px !important;
      box-sizing: border-box !important;
    }
    table.mobile-stack td:last-child { padding-bottom: 0 !important; }
  }
  ${SLOT_SELECTION_CSS}
  /* Selected icon wrapper highlight */
  [data-feature-index].riazify-icon-selected {
    outline: 3px solid #7530fb !important;
    outline-offset: 3px !important;
    border-radius: 10px !important;
    box-shadow: 0 0 0 4px rgba(117,48,251,0.25) !important;
    transition: outline 0.15s ease !important;
  }
</style>
<style id="canvas-hover-styles">
  div[data-canvas-overlay] { opacity: 0; transition: opacity 0.15s ease; pointer-events: none; }
  div[data-canvas-dropzone]:hover div[data-canvas-overlay],
  div[data-canvas-dropzone] div[data-canvas-overlay]:hover { opacity: 1 !important; pointer-events: auto !important; }

  /* Image edit button overlay */
  .riazify-img-wrap { position: relative; display: inline-block; }
  .riazify-img-edit-btn {
    position: absolute; top: 8px; right: 8px;
    background: rgba(117,48,251,0.92); color: #fff;
    border: none; border-radius: 8px;
    padding: 5px 11px; font-size: 12px; font-weight: 600;
    font-family: Arial, sans-serif;
    cursor: pointer; display: flex; align-items: center; gap: 5px;
    opacity: 0; transition: opacity 0.15s ease;
    pointer-events: auto; z-index: 100;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
  }
  .riazify-img-wrap:hover .riazify-img-edit-btn { opacity: 1; }
</style>
<script>
(function() {
  // Block ID is baked into the script at render time so the iframe
  // never depends on window.frameElement to identify itself to the parent.
  // This is critical: window.frameElement may be null or inaccessible
  // in some browser contexts, causing the blockId to be empty and the
  // drop/edit messages to fail silently.
  var BLOCK_ID = "${block.id}";
  var BLOCK_TYPE = "${block.type}";
  document.addEventListener('DOMContentLoaded', function() {

    // ── Select block in canvas when clicked anywhere inside the iframe ──
    document.addEventListener('click', function() {
      if (window.parent) {
        window.parent.postMessage({ type: 'RIAZIFY_SELECT_BLOCK', blockId: BLOCK_ID }, '*');
      }
    }, true);

    // Anchor click handler inside the canvas editor.
    // - href="#" or empty → block navigation silently (nothing happens).
    // - Real URL → open in a new tab so the seller can verify the link is correct.
    // Capture phase fires before any other handler so the iframe never navigates itself.
    document.addEventListener('click', function(e) {
      var t = e.target;
      var link = (t && t.closest) ? t.closest('a') : (t && t.tagName === 'A' ? t : null);
      if (!link) return;
      e.preventDefault();
      e.stopPropagation();
      var href = link.getAttribute('href') || '';
      if (href && href !== '#' && href !== 'javascript:void(0)') {
        window.parent.postMessage({ type: 'RIAZIFY_OPEN_URL', url: href }, '*');
      }
    }, true);

// ── CANVA TRUE AUTO-FIT TEXT ENGINE (Auto Grows & Shrinks As You Type) ──
    var editableSelectors = 'h1, h2, h3, h4, h5, h6, p, span, td, li, blockquote';
    var activeEditable = null;
    var originalText = '';
    var originalStyles = {};

    function commitEdit(el) {
      if (!el || !el._riazifyEditing) return;
      el._riazifyEditing = false;
      el.contentEditable = 'false';

      // Clean up Canva bounding box styles
      el.style.display = originalStyles.display || '';
      el.style.width = originalStyles.width || '';
      el.style.maxWidth = originalStyles.maxWidth || '';
      el.style.outline = originalStyles.outline || '';
      el.style.boxShadow = originalStyles.boxShadow || '';
      el.style.borderRadius = originalStyles.borderRadius || '';
      el.style.cursor = originalStyles.cursor || '';
      el.style.padding = originalStyles.padding || '';

      var newHtml = el.innerHTML || '';
      var newText = el.innerText || el.textContent || '';
      // Identify which slot/prop was edited via the closest dropzone ancestor
      var zone = el.closest('[data-canvas-dropzone]');
      var propKey = zone ? zone.getAttribute('data-canvas-dropzone') : null;

      if (/<[a-z][\s\S]*>/i.test(newHtml)) {
        window.parent.postMessage({
          type: 'RIAZIFY_COMMIT_HTML_EDIT',
          blockId: BLOCK_ID,
          html: newHtml,
          text: newText,
          propKey: propKey
        }, '*');
      } else if (newText !== originalText) {
        window.parent.postMessage({
          type: 'RIAZIFY_COMMIT_TEXT_EDIT',
          blockId: BLOCK_ID,
          text: newText,
          propKey: propKey
        }, '*');
      }
      activeEditable = null;
      originalStyles = {};
    }

    function cancelEdit(el) {
      if (!el || !el._riazifyEditing) return;
      el._riazifyEditing = false;
      el.contentEditable = 'false';
      el.style.display = originalStyles.display || '';
      el.style.width = originalStyles.width || '';
      el.style.maxWidth = originalStyles.maxWidth || '';
      el.style.outline = originalStyles.outline || '';
      el.style.boxShadow = originalStyles.boxShadow || '';
      el.style.borderRadius = originalStyles.borderRadius || '';
      el.style.cursor = originalStyles.cursor || '';
      el.style.padding = originalStyles.padding || '';
      el.innerText = originalText;
      activeEditable = null;
      originalStyles = {};
    }

    document.addEventListener('dblclick', function(e) {
      var target = e.target;
      if (!target) return;
      // Never enter text-edit mode for overlay elements
      if (target.closest('[data-canvas-overlay]')) return;
      // Block text editing inside image dropzones (those containing img[data-slot]),
      // but ALLOW text editing inside text/content layout dropzones (two_column, three_column etc.)
      var dropzoneAncestor = target.closest('[data-canvas-dropzone]');
      if (dropzoneAncestor && dropzoneAncestor.querySelector('img[data-slot]')) return;

      // Prefer inner text elements over outer container
      var el = target.closest('h1, h2, h3, h4, h5, h6, p, span, li, blockquote');

      // If clicked inside a table cell (like Bullet List or Numbered List)
      if (!el && target.closest('td')) {
        var td = target.closest('td');
        el = td.querySelector('p, span, h1, h2, h3, h4, div') || td;
      }
      if (!el) el = target.closest(editableSelectors);
      if (!el) return;

      e.preventDefault();
      e.stopPropagation();

      if (activeEditable && activeEditable !== el) commitEdit(activeEditable);
      activeEditable = el;
      originalText = el.innerText || el.textContent || '';

      // Backup styles
      originalStyles = {
        display: el.style.display,
        width: el.style.width,
        maxWidth: el.style.maxWidth,
        outline: el.style.outline,
        boxShadow: el.style.boxShadow,
        borderRadius: el.style.borderRadius,
        cursor: el.style.cursor,
        padding: el.style.padding,
      };

      el._riazifyEditing = true;
      el.contentEditable = 'true';

      // 💡 CANVA AUTO-FIT MODE:
      // display: inline-block + width: fit-content causes the box to:
      // 1. Hug the text tightly with ZERO empty space on the right
      // 2. Automatically GROW as you type more words
      // 3. Automatically SHRINK as you backspace/delete words
      el.style.setProperty('display', 'inline-block', 'important');
      el.style.setProperty('width', 'fit-content', 'important');
      el.style.setProperty('max-width', '100%', 'important');
      el.style.setProperty('outline', '2px solid #7530fb', 'important');
      el.style.setProperty('box-shadow', '0 0 0 3px rgba(117, 48, 251, 0.18)', 'important');
      el.style.setProperty('border-radius', '4px', 'important');
      el.style.setProperty('padding', '2px 6px', 'important');
      el.style.setProperty('cursor', 'text', 'important');

      el.focus();
    });

    document.addEventListener('keydown', function(e) {
      if (!activeEditable) return;
      if (e.key === 'Escape') { e.preventDefault(); cancelEdit(activeEditable); }
      // Commit on Enter for single-line elements (not p or blockquote)
      if (e.key === 'Enter' && activeEditable.tagName !== 'P' && activeEditable.tagName !== 'BLOCKQUOTE') {
        e.preventDefault();
        commitEdit(activeEditable);
      }
    });

    document.addEventListener('click', function(e) {
      if (!activeEditable) return;
      if (!activeEditable.contains(e.target)) commitEdit(activeEditable);
    });

    // Commit when user clicks OUTSIDE the iframe (focus leaves the frame)
    window.addEventListener('blur', function() {
      if (activeEditable) commitEdit(activeEditable);
    });

    // ── Selection capture — Phase A ──────────────────────────────────
    // Fire RIAZIFY_SELECTION_CHANGE whenever the user lifts the mouse
    // after selecting text inside the iframe. The parent uses this to
    // know which exact word(s) were highlighted so it can apply
    // inline formatting (link / highlight) only to that range.
    document.addEventListener('mouseup', function() {
      var sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        window.parent.postMessage({ type: 'RIAZIFY_SELECTION_CHANGE', hasSelection: false, blockId: BLOCK_ID }, '*');
        return;
      }
      var range = sel.getRangeAt(0);
      var selectedText = sel.toString();
      if (!selectedText || selectedText.trim() === '') {
        window.parent.postMessage({ type: 'RIAZIFY_SELECTION_CHANGE', hasSelection: false, blockId: BLOCK_ID }, '*');
        return;
      }
      // Find the nearest data-canvas-dropzone ancestor to identify the slot
      var container = range.commonAncestorContainer;
      var el = container.nodeType === 3 ? container.parentElement : container;
      var zone = el ? el.closest('[data-canvas-dropzone]') : null;
      var propKey = zone ? zone.getAttribute('data-canvas-dropzone') : null;
      // Serialise the selected range as HTML
      var fragment = range.cloneContents();
      var div = document.createElement('div');
      div.appendChild(fragment);
      var selectedHtml = div.innerHTML;
      window.parent.postMessage({
        type: 'RIAZIFY_SELECTION_CHANGE',
        hasSelection: true,
        blockId: BLOCK_ID,
        propKey: propKey,
        selectedText: selectedText,
        selectedHtml: selectedHtml,
      }, '*');
    });

    // NOTE: do NOT clear selection on mousedown — the toolbar button click
    // triggers mousedown in the iframe before the React handler fires,
    // which would wipe activeSelection before highlight/link can use it.
    // Selection is cleared naturally after the next mouseup with no range.

    // Store the last selection range so we can restore it after focus loss
    var savedRange = null;
    var savedEditable = null;

    document.addEventListener('mouseup', function() {
      var sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        savedRange = sel.getRangeAt(0).cloneRange();
        savedEditable = activeEditable;
      }
    });

    // Listen for format commands from parent toolbar
    window.addEventListener('message', function(e) {
      if (!e.data) return;
      if (e.data.type === 'RIAZIFY_APPLY_FORMAT') {
        var cmd = e.data.command;
        var val = e.data.value || null;
        // Use savedEditable if activeEditable was already committed
        var target = (activeEditable && activeEditable._riazifyEditing) ? activeEditable : savedEditable;
        if (!target) return;
        // Restore focus and selection range
        target.contentEditable = 'true';
        target._riazifyEditing = true;
        target.focus();
        if (savedRange) {
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(savedRange);
        }
        document.execCommand(cmd, false, val);
        // After createLink, add inline styles so link is visible in canvas and eBay-safe
        if (cmd === 'createLink') {
          var anchors = target.querySelectorAll('a[href]');
          anchors.forEach(function(a) {
            if (!a.style.textDecoration) {
              a.style.textDecoration = 'underline';
              a.style.color = 'inherit';
              a.style.fontWeight = '600';
            }
          });
        }
        var newHtml = target.innerHTML || '';
        var newText = target.innerText || target.textContent || '';
        // Identify which slot/prop was edited via the closest dropzone ancestor
        var formatZone = target.closest('[data-canvas-dropzone]');
        var formatPropKey = formatZone ? formatZone.getAttribute('data-canvas-dropzone') : null;
        // Commit the result
        window.parent.postMessage({
          type: 'RIAZIFY_COMMIT_HTML_EDIT',
          blockId: BLOCK_ID,
          html: newHtml,
          text: newText,
          propKey: formatPropKey
        }, '*');
        // Clean up
        target.contentEditable = 'false';
        target._riazifyEditing = false;
        target.style.outline = '';
        savedRange = null;
        savedEditable = null;
        activeEditable = null;
      }
    });

    // ── Universal Image & Thumbnail Click Listener ──
    document.addEventListener('click', function(e) {
      var target = e.target;
      if (!target) return;

      // 1. If element has explicit data-slot
      var slotEl = target.closest('[data-slot]');
      if (slotEl) {
        var slot = slotEl.getAttribute('data-slot');
        if (slot && window.parent) {
          e.preventDefault();
          e.stopPropagation();
          window.parent.postMessage({ type: 'RIAZIFY_SELECT_SLOT', propKey: slot, blockId: BLOCK_ID }, '*');
          // If icon slot clicked, also trigger opening the Icon Library
          if (slot === 'icon') {
            window.parent.postMessage({ type: 'RIAZIFY_ICON_CLICK', featureIndex: 0, blockId: BLOCK_ID }, '*');
          }
          return;
        }
      }

// 2. If thumbnail label clicked in hero_product
      var thumbLabel = target.closest('label[for*="_"]');
      if (thumbLabel) {
        var forAttr = thumbLabel.getAttribute('for') || '';
        var match = forAttr.match(/_([0-9])$/);
        if (match) {
          var num = parseInt(match[1], 10);
          var propKey = num === 0 ? 'leftImage' : ('thumb' + num);
          if (window.parent) {
            window.parent.postMessage({ type: 'RIAZIFY_SELECT_SLOT', propKey: propKey, blockId: BLOCK_ID }, '*');
          }
          return;
        }
      }

      // 3. ONLY trigger if clicking an actual <img> or a dedicated image placeholder box
      var clickedImg = target.tagName === 'IMG' ? target : target.closest('img');
      var clickedPlaceholder = target.closest('div[data-slot], [class*="img-placeholder"], [class*="hp-placeholder"], [class*="-st-"], [class*="stacked"]');

      // Also catch clicking directly on "Click to add image" text or SVG in Stacked style
      if (!clickedPlaceholder && (target.textContent || '').indexOf('Click to add image') >= 0) {
        clickedPlaceholder = target.closest('div');
      }

      // If clicking inside a thumbnail cell
      var thumbTd = target.closest('td[width="25%"], td[width="50%"], td[width="10%"], td[width="12%"]');
      if (thumbTd && (clickedImg || clickedPlaceholder || target.closest('label') || target.tagName === 'DIV')) {
        var parentTable = thumbTd.closest('table');
        if (parentTable) {
          var allCells = Array.from(parentTable.querySelectorAll('td[width]'));
          var idx = allCells.indexOf(thumbTd);
          var thumbKey = 'thumb' + (idx >= 0 ? idx + 1 : 1);
          if (window.parent) {
            window.parent.postMessage({ type: 'RIAZIFY_SELECT_SLOT', propKey: thumbKey, blockId: BLOCK_ID }, '*');
          }
          return;
        }
      }

      // If clicking directly on the main big image or main placeholder (including Stacked)
      if (clickedImg || clickedPlaceholder) {
        var isMainImg = (clickedImg && clickedImg.closest('[class*="-main-"], [class*="-m0-"], [class*="hp-ir-img-"], [class*="-st-"], [class*="stacked"]')) || clickedPlaceholder;
        if (isMainImg && window.parent) {
          window.parent.postMessage({ type: 'RIAZIFY_SELECT_SLOT', propKey: 'leftImage', blockId: BLOCK_ID }, '*');
          return;
        }
      }

      // 💡 Check if clicked element is ANY slot, dropzone, placeholder, button, or media
      var isSlotOrInteractive = target.closest(
        '[data-slot], [data-canvas-dropzone], [data-canvas-overlay], [data-feature-index], [class*="placeholder"], [class*="-st-"], [class*="stacked"], [style*="dashed"], img, label, a, button'
      ) || (target.textContent || '').indexOf('Click to add image') >= 0;

      // Only unselect when clicking genuine blank space
      if (!isSlotOrInteractive) {
        // Clear both slot and icon selection highlights
        document.querySelectorAll('.riazify-active-slot').forEach(function(el) {
          el.classList.remove('riazify-active-slot');
        });
        document.querySelectorAll('[data-feature-index].riazify-icon-selected').forEach(function(el) {
          el.classList.remove('riazify-icon-selected');
        });
        if (window.parent) {
          window.parent.postMessage({ type: 'RIAZIFY_SELECT_SLOT', propKey: null, blockId: BLOCK_ID }, '*');
        }
      }
    });
    // Icon click — detect clicks on feature icon wrappers [data-feature-index]
    document.addEventListener('click', function(e) {
      var target = e.target;
      if (!target) return;
      // Walk up from click target (handles clicks on svg/path/circle inside the div)
      var wrapper = target.closest('[data-feature-index]');
      if (!wrapper) return;
      e.preventDefault();
      e.stopPropagation();
      // Clear any previously selected icon highlight
      document.querySelectorAll('[data-feature-index].riazify-icon-selected').forEach(function(el) {
        el.classList.remove('riazify-icon-selected');
      });
      // Highlight this icon wrapper
      wrapper.classList.add('riazify-icon-selected');
      var featureIndex = parseInt(wrapper.getAttribute('data-feature-index'), 10);
      if (!isNaN(featureIndex) && window.parent) {
        window.parent.postMessage({ type: 'RIAZIFY_ICON_CLICK', featureIndex: featureIndex, blockId: BLOCK_ID }, '*');
      }
    });
    // Dropzone click also triggers selection (for full-width / gallery thumbnails)
    document.querySelectorAll('div[data-canvas-dropzone]').forEach(function(zone) {
      zone.addEventListener('click', function(e) {
        if (e.target && e.target.closest && e.target.closest('[data-canvas-overlay]')) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        var slot = zone.getAttribute('data-canvas-dropzone');
        // Use the pre-embedded BLOCK_ID constant instead of reading
        // from window.frameElement which may not be available in all cases
        var blockId = BLOCK_ID;
        // Image slots (div[data-canvas-dropzone] wrapping an img[data-slot]) must
        // always fire RIAZIFY_SELECT_SLOT — never the rich-text slot editor —
        // because image blocks have no rich-text content to edit.
        // Text slots without content (.add-btn present) also fire SELECT_SLOT.
        // Only non-image slots that already have content fire EDIT_SLOT_CONTENT.
        // hasImageSlot: zone has a real image (data-slot img) → always open asset picker (SELECT_SLOT).
        // Never open the rich-text EDIT_SLOT_CONTENT for image dropzones.
        var hasImageSlot = zone.querySelector('img[data-slot]') !== null;
        if (slot && window.parent) {
          if (hasImageSlot) {
            window.parent.postMessage({ type: 'RIAZIFY_SELECT_SLOT', propKey: slot, blockId: blockId }, '*');
          } else {
            var slotHtml = zone.innerHTML || '';
            window.parent.postMessage({ type: 'RIAZIFY_EDIT_SLOT_CONTENT', propKey: slot, blockId: blockId, currentHtml: slotHtml }, '*');
          }
        }
      });
    });
    // Dropzone drag/drop handling — supports file drops and URL drops
    document.querySelectorAll('div[data-canvas-dropzone]').forEach(function(zone) {
      var slot = zone.getAttribute('data-canvas-dropzone');

      zone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        zone.setAttribute('data-canvas-dropzone-active', 'true');
        e.dataTransfer.dropEffect = 'copy';
      });
      zone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        zone.setAttribute('data-canvas-dropzone-active', 'false');
      });
      zone.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        zone.setAttribute('data-canvas-dropzone-active', 'false');
        var slot = zone.getAttribute('data-canvas-dropzone');
        // Check if dropped item is a block type string from our library
        var blockType = e.dataTransfer.getData('text/plain');
        if (blockType && window.parent && slot) {
          // Use the pre-embedded BLOCK_ID constant instead of
          // reading from window.frameElement which may not be available
          // in all browsers/contexts, causing the message to fail
          window.parent.postMessage({ type: 'RIAZIFY_DROP_BLOCK', propKey: slot, blockType: blockType, blockId: BLOCK_ID }, '*');
          return;
        }
        // Prefer file drop
        var files = e.dataTransfer.files;
        if (files && files.length > 0) {
          var file = files[0];
          if (window.parent && slot) {
            window.parent.postMessage({ type: 'RIAZIFY_DROP_ASSET', propKey: slot, fileName: file.name, fileType: file.type, fileUrl: URL.createObjectURL(file) }, '*');
          }
        } else {
          // Try URL from dataTransfer
          var url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
          if (url && window.parent && slot) {
            window.parent.postMessage({ type: 'RIAZIFY_DROP_ASSET', propKey: slot, fileUrl: url }, '*');
          }
        }
      });
    });
    // Highlight the active sub-slot image frame (visual indicator)
    // Receives propKey updates via message from parent VisualEditor
    window.addEventListener('message', function(msgEvent) {
      // Bug #3 fix: handle real-time slot HTML update from PropertiesPanel
      if (msgEvent.data && msgEvent.data.type === 'RIAZIFY_UPDATE_SLOT_HTML') {
        var prop = msgEvent.data.propKey;
        var newHtml = msgEvent.data.html;
        document.querySelectorAll('div[data-canvas-dropzone]').forEach(function(zone) {
          if (zone.getAttribute('data-canvas-dropzone') === prop) {
            zone.innerHTML = newHtml;
          }
        });
      }
      if (msgEvent.data && msgEvent.data.type === 'RIAZIFY_UPDATE_ACTIVE_SLOT') {
        var prop = msgEvent.data.propKey;
        // Clear all previous highlights
        document.querySelectorAll('.riazify-active-slot').forEach(function(el) {
          el.classList.remove('riazify-active-slot');
        });
        document.querySelectorAll('.riazify-slot-del-btn').forEach(function(btn) {
          btn.remove();
        });
        if (!prop) return;

        // 1. Highlight standard dropzones & data-slot containers
        document.querySelectorAll('div[data-canvas-dropzone="' + prop + '"], div[data-slot="' + prop + '"], [data-slot="' + prop + '"]').forEach(function(el) {
          el.classList.add('riazify-active-slot');

          // Place the delete icon perfectly in the top-left corner of this exact column
          var isPlaceholder = el.querySelector('.add-btn') !== null || (el.textContent || '').trim() === '+ Add Content';
          if (!isPlaceholder && !el.querySelector('.riazify-slot-del-btn')) {
            if (window.getComputedStyle(el).position === 'static') {
              el.style.position = 'relative';
            }
            var delBtn = document.createElement('button');
            delBtn.className = 'riazify-slot-del-btn';
            delBtn.type = 'button';
            delBtn.title = 'Clear column content';
            delBtn.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>';
            delBtn.style.cssText = 'position:absolute;top:4px;left:4px;z-index:9999;width:14px;height:14px;border:none;background:transparent;color:#ef4444;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;outline:none;opacity:0.75;transition:opacity 0.15s,transform 0.12s;line-height:1;';
            delBtn.onmouseenter = function() { delBtn.style.opacity = '1'; delBtn.style.transform = 'scale(1.2)'; };
            delBtn.onmouseleave = function() { delBtn.style.opacity = '0.75'; delBtn.style.transform = 'scale(1)'; };
            delBtn.onclick = function(e) {
              e.preventDefault();
              e.stopPropagation();
              window.parent.postMessage({ type: 'RIAZIFY_CLEAR_SLOT', blockId: BLOCK_ID, propKey: prop }, '*');
            };
            el.appendChild(delBtn);
          }
        });

        // 2. Highlight hero_product thumbnail slots (thumb1 to thumb6) on both blank placeholders and images
        if (prop.startsWith('thumb')) {
          var num = parseInt(prop.replace('thumb', ''), 10);

          // Target the specific thumbnail cell (1st, 2nd, 3rd, 4th cell)
          var allThumbCells = document.querySelectorAll('td[width="25%"], td[width="50%"], td[width="10%"], td[width="12%"]');
          if (allThumbCells.length >= num) {
            var targetCell = allThumbCells[num - 1];
            // Highlight the placeholder div inside this thumbnail cell
            var innerBox = targetCell.querySelector('div, label');
            if (innerBox) {
              innerBox.classList.add('riazify-active-slot');
            }
          }

          // Also highlight by label ID or variant thumbnail class
          document.querySelectorAll('label[for$="_' + num + '"] div, label[for$="_' + num + '"], [class*="-t' + num + '-"] div').forEach(function(el) {
            el.classList.add('riazify-active-slot');
          });
        } else if (prop === 'leftImage' || prop === 'src' || prop === 'imageUrl') {
          // Highlight main image slot across all styles (blank placeholder or image)
          document.querySelectorAll('[class*="-m0-"], [class*="hp-main-"], [class*="-st-"], [class*="stacked"], .hp-sf-col-img, label[for$="_0"], div[data-slot="leftImage"]').forEach(function(el) {
            el.classList.add('riazify-active-slot');
          });
          // Also highlight main placeholder directly
          document.querySelectorAll('div[style*="dashed"]').forEach(function(d) {
            if (!d.closest('td[width="25%"], td[width="50%"], td[width="10%"], td[width="12%"]')) {
              d.classList.add('riazify-active-slot');
            }
          });
        }
      }
    });
    // Overlay click triggers asset picker/modal
    document.querySelectorAll('div[data-canvas-overlay]').forEach(function(overlay) {
      overlay.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var slot = overlay.getAttribute('data-canvas-overlay');
        if (slot && window.parent) {
          window.parent.postMessage({ type: 'RIAZIFY_OPEN_ASSET_PICKER', propKey: slot, blockId: BLOCK_ID }, '*');
        }
      });
    });

    // ── Image edit button overlay ──
    // For every real <img> with a loaded src (not a placeholder token), wrap it
    // in a .riazify-img-wrap and inject an "Edit" button.
    function attachImageEditButtons() {
      document.querySelectorAll('img').forEach(function(img) {
        // Skip already-wrapped, tiny tracker pixels, and token placeholders
        if (img.closest('.riazify-img-wrap')) return;
        var src = img.getAttribute('src') || '';
        if (!src || src.startsWith('data:image/svg+xml') || src.indexOf('{{') !== -1) return;
        // Skip tiny images (likely spacers)
        if ((img.naturalWidth && img.naturalWidth < 20) || (img.naturalHeight && img.naturalHeight < 20)) return;

        // Figure out which propKey this image belongs to
        var propKey = null;
        var dropzone = img.closest('[data-canvas-dropzone]');
        if (dropzone) propKey = dropzone.getAttribute('data-canvas-dropzone');
        if (!propKey) {
          var slotEl = img.closest('[data-slot]');
          if (slotEl) propKey = slotEl.getAttribute('data-slot');
        }

        // Wrap the img in a relative-position span
        var wrapper = document.createElement('span');
        wrapper.className = 'riazify-img-wrap';
        wrapper.style.cssText = 'position:relative;display:inline-block;line-height:0;';
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);

        // Build the edit button
        var btn = document.createElement('button');
        btn.className = 'riazify-img-edit-btn';
        btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit Image';
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          if (window.parent) {
            window.parent.postMessage({
              type: 'RIAZIFY_EDIT_IMAGE',
              imageUrl: img.src,
              propKey: propKey,
              blockId: BLOCK_ID
            }, '*');
          }
        });
        wrapper.appendChild(btn);
      });
    }

    // Run once after DOM ready, then again after images load
    attachImageEditButtons();
    window.addEventListener('load', attachImageEditButtons);
    // Also run after a short delay for dynamically updated images
    setTimeout(attachImageEditButtons, 600);

  });
})();
</script>
</head>
<body>${blockHtml}</body>
</html>`
        } catch {
            return ''
        }
    }, [block.type, block.id, JSON.stringify(block.props), activeCategory, previewWidth])

    // Auto-resize iframe to exact true content height
    const [height, setHeight] = React.useState(60)
    // Track ResizeObserver to disconnect before each rewrite (prevents memory leak)
    const roRef = React.useRef<ResizeObserver | null>(null)

    // Measure the exact tight content boundary (zero artificial padding)
    const measureHeight = React.useCallback(() => {
        const iframe = iframeRef.current
        if (!iframe) return
        try {
            const doc = iframe.contentDocument || iframe.contentWindow?.document
            if (!doc || !doc.body) return

            // 1. Measure the exact bounding rectangle of the root template element (e.g. <table> or <div>)
            const firstChild = doc.body.firstElementChild as HTMLElement | null
            let contentH = 0

            if (firstChild) {
                const rect = firstChild.getBoundingClientRect()
                contentH = Math.ceil(rect.height || firstChild.offsetHeight)
            }

            // 2. Fallback if no child found
            if (!contentH || contentH < 10) {
                contentH = Math.ceil(doc.body.scrollHeight)
            }

            if (contentH > 0) {
                setHeight(contentH)
            }
        } catch (e) { /* cross-origin guard */ }
    }, [])

    // Force live real-time update in canvas whenever any property changes
    React.useEffect(() => {
        const iframe = iframeRef.current
        if (!iframe) return
        try {
            const doc = iframe.contentDocument || iframe.contentWindow?.document
            if (doc && doc.body) {
                // Smooth in-place DOM update: Eliminates the blank white flashlight flicker
                const parser = new DOMParser()
                const newDoc = parser.parseFromString(html, 'text/html')
                if (newDoc && newDoc.body) {
                    doc.body.innerHTML = newDoc.body.innerHTML
                } else {
                    iframe.srcdoc = html
                }

                measureHeight()
                setTimeout(measureHeight, 50)
                setTimeout(measureHeight, 180)

                // Re-measure accurately when images finish loading
                Array.from(doc.images || []).forEach(img => {
                    if (!img.complete) {
                        img.addEventListener('load', measureHeight)
                    }
                })

                // Observe the actual template root element for content changes
                if (roRef.current) {
                    roRef.current.disconnect()
                    roRef.current = null
                }
                if (doc.body && (window as any).ResizeObserver) {
                    const target = doc.body.firstElementChild || doc.body
                    const ro = new ResizeObserver(measureHeight)
                    ro.observe(target)
                    roRef.current = ro
                }
            } else {
                iframe.srcdoc = html
            }
        } catch (e) {
            iframe.srcdoc = html
        }
    }, [html, measureHeight])

    // Stable key: Keeps the iframe alive and never destroys it while resizing!
    const htmlKey = `${block.id}-${block.type}`

    const onLoad = React.useCallback(() => {
        measureHeight()
        setTimeout(measureHeight, 100)
    }, [measureHeight])

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
        <div style={{
            width: '100%',
            // Scale container height proportionally so transformed iframes are NEVER cut off
            height: `calc(${height}px * var(--canvas-scale, 1))`,
            overflow: 'hidden',
        }}>
            <div style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                transformOrigin: 'top left',
            }}>
                <iframe
                    key={htmlKey}
                    ref={iframeRef}
                    srcDoc={html}
                    onLoad={onLoad}
                    sandbox="allow-same-origin allow-scripts"
                    scrolling="no"
                    data-block-id={block.id}
                    style={{
                        width: `${previewWidth}px`,
                        height: `${height}px`,
                        border: 'none',
                        display: 'block',
                        pointerEvents: 'auto',
                        backgroundColor: 'transparent',
                        transformOrigin: 'top left',
                        transform: 'scale(var(--canvas-scale, 1))',
                    }}
                    title={`Preview: ${def.label}`}
                />
            </div>
        </div>
    )
}
