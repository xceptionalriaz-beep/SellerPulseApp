'use client'
// components/ui/VisualEditor.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Drag-&-Drop Editor (Phase 4 rewire)
//
// Layout: [IconRail 44px] [SidebarPanel 260px] [Canvas flex-1] [PropertiesPanel 280px]
//
// New state vs old:
//   + activeTab       — which sidebar tab is open
//   + panelOpen       — sidebar panel visible
//   + canvasSettings  — global canvas settings (max-width, font, bg etc.)
//   + livePreview     — toggle between card view and iframe preview
//   + auditErrors     — count passed to IconRail badge
//
// New handlers:
//   handleInsertTemplate — appends blocks from TemplatesTab
//   handleInsertImage    — updates selected block's image src prop
//   handleInsertToken    — appends placeholder to selected block's text field
//   handleUpdateSettings — updates canvasSettings + rebuilds HTML
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
    Undo2, Redo2, Trash2, Eye, EyeOff,
    AlertTriangle, CheckCircle2, X,
    type LucideIcon,
} from 'lucide-react'

import {
    Block,
    BlockType,
    createBlock,
    assembleDocument,
    getDefinition,
    CanvasSettings,
    DEFAULT_CANVAS_SETTINGS,
} from './VisualEditor/blocks'

import { parseHtml, ParseResult } from './VisualEditor/htmlParser'
import { RailTabId } from './VisualEditor/IconRail'
import IconRail from './VisualEditor/IconRail'
import SidebarPanel from './VisualEditor/SidebarPanel'
import Canvas from './VisualEditor/Canvas'
import PropertiesPanel from './VisualEditor/PropertiesPanel'
import LivePreview from './VisualEditor/LivePreview'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    accent: '#b8fa33',
    danger: '#ef4444',
    dangerLight: '#fee2e2',
    warning: '#d97706',
    warningLight: '#fef3c7',
    success: '#16a34a',
    successLight: '#dcfce7',
}

// ── PlaceholderGroup ──────────────────────────────────────────────────────────
interface PlaceholderItem {
    label: string
    value: string
    example?: string
}
interface PlaceholderGroup {
    group: string
    items: PlaceholderItem[]
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface VisualEditorProps {
    value: string
    onChange: (html: string) => void
    placeholders: PlaceholderGroup[]
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function VisualEditor({
    value,
    onChange,
    placeholders,
}: VisualEditorProps) {
    // ── Core block state ──────────────────────────────────────────────────────
    const [blocks, setBlocks] = useState<Block[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [copiedStyle, setCopiedStyle] = useState<Record<string, unknown> | null>(null)
    const [draggedType, setDraggedType] = useState<BlockType | null>(null)
    const [undoStack, setUndoStack] = useState<Block[][]>([])
    const [redoStack, setRedoStack] = useState<Block[][]>([])

    // ── Parse state ───────────────────────────────────────────────────────────
    const [parseResult, setParseResult] = useState<ParseResult | null>(null)
    const [showWarning, setShowWarning] = useState(false)

    // ── Sidebar state ─────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<RailTabId | null>('blocks')
    const [panelOpen, setPanelOpen] = useState(true)

    // ── Canvas + preview state ────────────────────────────────────────────────
    const [deviceWidth, setDeviceWidth] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
    const [livePreview, setLivePreview] = useState(false)
    const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>(DEFAULT_CANVAS_SETTINGS)

    // ── Anti-feedback-loop refs ───────────────────────────────────────────────
    const isInternalChange = useRef(false)
    const hasInitialised = useRef(false)

    // ── Current assembled HTML ────────────────────────────────────────────────
    const [currentHtml, setCurrentHtml] = useState(value)

    // ── Audit error count — for IconRail badge ────────────────────────────────
    const auditErrors = useMemo(() => {
        if (!currentHtml) return 0
        let count = 0
        if (/<script\b/i.test(currentHtml)) count++
        if (/<iframe\b/i.test(currentHtml)) count++
        if (/<form\b/i.test(currentHtml)) count++
        if (/\bon\w+\s*=/i.test(currentHtml)) count++
        if (/href\s*=\s*["']javascript:/i.test(currentHtml)) count++
        if (/src\s*=\s*["']http:\/\//i.test(currentHtml)) count++
        return count
    }, [currentHtml])

    // ── Initialise from value on first mount ──────────────────────────────────
    useEffect(() => {
        if (hasInitialised.current) return
        hasInitialised.current = true
        const result = parseHtml(value)
        setParseResult(result)
        setBlocks(result.blocks)
        setCurrentHtml(value)
        if (result.warnings.length > 0 || result.strategy === 'heuristic') {
            setShowWarning(true)
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Rebuild HTML whenever blocks or settings change ───────────────────────
    const rebuildAndEmit = useCallback((nextBlocks: Block[], settings?: CanvasSettings) => {
        isInternalChange.current = true
        const html = assembleDocument(nextBlocks, settings ?? canvasSettings)
        setCurrentHtml(html)
        onChange(html)
        requestAnimationFrame(() => { isInternalChange.current = false })
    }, [onChange, canvasSettings])

    // ── Undo/redo helpers ─────────────────────────────────────────────────────
    const pushUndo = useCallback((prev: Block[]) => {
        setUndoStack(s => [...s.slice(-30), prev])
        setRedoStack([])
    }, [])

    const commitBlocks = useCallback((next: Block[], prev: Block[]) => {
        pushUndo(prev)
        setBlocks(next)
        rebuildAndEmit(next)
    }, [pushUndo, rebuildAndEmit])

    // ── Block mutations ───────────────────────────────────────────────────────
    const handleAddBlock = useCallback((type: BlockType) => {
        // Pass canvasSettings so new blocks inherit global tokens
        const newBlock = createBlock(type, canvasSettings)
        setBlocks(prev => {
            const next = [...prev, newBlock]
            pushUndo(prev)
            rebuildAndEmit(next)
            return next
        })
        setSelectedId(newBlock.id)
    }, [pushUndo, rebuildAndEmit, canvasSettings])

    // ── Copy / Paste block style ─────────────────────────────────────────────
    const handleCopyStyle = useCallback((id: string) => {
        setBlocks(prev => {
            const block = prev.find(b => b.id === id)
            if (!block) return prev
            // Copy only universal style props — not content props
            const p = block.props as any
            setCopiedStyle({
                bgColor: p.bgColor, bgGradient: p.bgGradient,
                bgGradientFrom: p.bgGradientFrom, bgGradientTo: p.bgGradientTo,
                bgGradientDir: p.bgGradientDir,
                showBorder: p.showBorder, borderColor: p.borderColor,
                borderWidth: p.borderWidth, borderStyle: p.borderStyle,
                borderRadius: p.borderRadius,
                showShadow: p.showShadow, shadowColor: p.shadowColor,
                shadowX: p.shadowX, shadowY: p.shadowY,
                shadowBlur: p.shadowBlur, shadowSpread: p.shadowSpread,
                fontFamily: p.fontFamily,
                paddingTop: p.paddingTop, paddingBottom: p.paddingBottom,
                paddingLeft: p.paddingLeft, paddingRight: p.paddingRight,
            })
            return prev
        })
    }, [])

    const handlePasteStyle = useCallback((id: string) => {
        if (!copiedStyle) return
        setBlocks(prev => {
            const next = prev.map(b => {
                if (b.id !== id) return b
                return { ...b, props: { ...(b.props as any), ...copiedStyle } } as Block
            })
            rebuildAndEmit(next)
            return next
        })
    }, [copiedStyle, rebuildAndEmit])

    const handleDrop = useCallback((type: BlockType) => {
        handleAddBlock(type)
        setDraggedType(null)
    }, [handleAddBlock])

    const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
        setBlocks(prev => {
            const next = [...prev]
            const [moved] = next.splice(fromIndex, 1)
            next.splice(toIndex, 0, moved)
            pushUndo(prev)
            rebuildAndEmit(next)
            return next
        })
    }, [pushUndo, rebuildAndEmit])

    const handleDelete = useCallback((id: string) => {
        setBlocks(prev => {
            const next = prev.filter(b => b.id !== id)
            pushUndo(prev)
            rebuildAndEmit(next)
            return next
        })
        setSelectedId(s => s === id ? null : s)
    }, [pushUndo, rebuildAndEmit])

    const handleDuplicate = useCallback((id: string) => {
        setBlocks(prev => {
            const idx = prev.findIndex(b => b.id === id)
            if (idx === -1) return prev
            const original = prev[idx]
            const dupe: Block = {
                ...createBlock(original.type),
                props: JSON.parse(JSON.stringify(original.props)),
            }
            const next = [...prev.slice(0, idx + 1), dupe, ...prev.slice(idx + 1)]
            pushUndo(prev)
            rebuildAndEmit(next)
            setSelectedId(dupe.id)
            return next
        })
    }, [pushUndo, rebuildAndEmit])

    const handleMoveUp = useCallback((id: string) => {
        setBlocks(prev => {
            const idx = prev.findIndex(b => b.id === id)
            if (idx <= 0) return prev
            handleReorder(idx, idx - 1)
            return prev
        })
    }, [handleReorder])

    const handleMoveDown = useCallback((id: string) => {
        setBlocks(prev => {
            const idx = prev.findIndex(b => b.id === id)
            if (idx === -1 || idx >= prev.length - 1) return prev
            handleReorder(idx, idx + 1)
            return prev
        })
    }, [handleReorder])

    const handleBlockChange = useCallback((updated: Block) => {
        setBlocks(prev => {
            const next = prev.map(b => b.id === updated.id ? updated : b)
            rebuildAndEmit(next)
            return next
        })
    }, [rebuildAndEmit])

    // ── Undo / Redo ───────────────────────────────────────────────────────────
    const handleUndo = useCallback(() => {
        setUndoStack(prev => {
            if (prev.length === 0) return prev
            const last = prev[prev.length - 1]
            const rest = prev.slice(0, -1)
            setRedoStack(r => [...r, blocks])
            setBlocks(last)
            rebuildAndEmit(last)
            return rest
        })
    }, [blocks, rebuildAndEmit])

    const handleRedo = useCallback(() => {
        setRedoStack(prev => {
            if (prev.length === 0) return prev
            const last = prev[prev.length - 1]
            const rest = prev.slice(0, -1)
            setUndoStack(u => [...u, blocks])
            setBlocks(last)
            rebuildAndEmit(last)
            return rest
        })
    }, [blocks, rebuildAndEmit])

    // ── NEW: Template insert — appends blocks ─────────────────────────────────
    const handleInsertTemplate = useCallback((newBlocks: Block[]) => {
        setBlocks(prev => {
            const next = [...prev, ...newBlocks]
            pushUndo(prev)
            rebuildAndEmit(next)
            return next
        })
    }, [pushUndo, rebuildAndEmit])

    // ── NEW: Image insert — updates selected block's src/imageUrl prop ─────────
    const handleInsertImage = useCallback((url: string, alt: string) => {
        // ── Capture selectedId OUTSIDE setBlocks to avoid stale closure ──────
        const currentSelectedId = selectedId

        setBlocks(prev => {
            // ── If a block is selected, try to patch its image prop ───────────
            if (currentSelectedId) {
                const target = prev.find(b => b.id === currentSelectedId)
                if (target) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const p = target.props as any
                    const hasImageProp =
                        'src' in p ||
                        'imageUrl' in p ||
                        'logoUrl' in p ||
                        'bgImage' in p

                    if (hasImageProp) {
                        const next: Block[] = prev.map(b => {
                            if (b.id !== currentSelectedId) return b
                            if ('src' in p) return { ...b, props: { ...p, src: url, alt } } as Block
                            if ('imageUrl' in p) return { ...b, props: { ...p, imageUrl: url, alt } } as Block
                            if ('logoUrl' in p) return { ...b, props: { ...p, logoUrl: url } } as Block
                            if ('bgImage' in p) return { ...b, props: { ...p, bgImage: url } } as Block
                            return b
                        })
                        rebuildAndEmit(next)
                        return next
                    }
                }
            }

            // ── No compatible block selected — add as new image block ─────────
            const newBlock: Block = createBlock('image', canvasSettings)
                ; (newBlock.props as any).src = url
                ; (newBlock.props as any).alt = alt
            const next = [...prev, newBlock]
            rebuildAndEmit(next)
            return next
        })
    }, [selectedId, rebuildAndEmit])

    // ── NEW: Token insert — appends placeholder to selected block's text ───────
    const handleInsertToken = useCallback((token: string) => {
        if (!selectedId) return
        setBlocks(prev => {
            const next: Block[] = prev.map(b => {
                if (b.id !== selectedId) return b
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const p = b.props as any
                const textKey = ['text', 'headingText', 'subText', 'content',
                    'description', 'label', 'storeName', 'tagline']
                    .find(k => k in p)
                if (textKey) {
                    return {
                        ...b,
                        props: { ...p, [textKey]: `${p[textKey] ?? ''} ${token}`.trim() },
                    } as Block
                }
                return b
            })
            rebuildAndEmit(next)
            return next
        })
    }, [selectedId, rebuildAndEmit])

    // ── NEW: Canvas settings update ───────────────────────────────────────────
    const handleUpdateSettings = useCallback((settings: CanvasSettings) => {
        setCanvasSettings(settings)
        // Rebuild with new settings immediately
        setBlocks(prev => {
            const html = assembleDocument(prev, settings)
            setCurrentHtml(html)
            onChange(html)
            return prev
        })
    }, [onChange])

    // ── Keyboard shortcuts ────────────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const meta = e.metaKey || e.ctrlKey
            if (meta && e.key === 'z' && !e.shiftKey) {
                e.preventDefault(); handleUndo(); return
            }
            if ((meta && e.key === 'z' && e.shiftKey) || (meta && e.key === 'y')) {
                e.preventDefault(); handleRedo(); return
            }
            if ((e.key === 'Backspace' || e.key === 'Delete') && selectedId) {
                const tag = (e.target as HTMLElement).tagName.toLowerCase()
                if (!['input', 'textarea', 'select'].includes(tag)) {
                    e.preventDefault(); handleDelete(selectedId)
                }
            }
            if (e.key === 'Escape') setSelectedId(null)
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [handleUndo, handleRedo, handleDelete, selectedId])

    const selectedBlock = blocks.find(b => b.id === selectedId) ?? null

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            height: '100%',
            overflow: 'hidden',
            backgroundColor: C.bg,
        }}>
            {/* ── Top toolbar ── */}
            <EditorToolbar
                blockCount={blocks.length}
                selectedBlock={selectedBlock}
                canUndo={undoStack.length > 0}
                canRedo={redoStack.length > 0}
                livePreview={livePreview}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onToggleLivePreview={() => setLivePreview(p => !p)}
                onClearAll={() => {
                    if (blocks.length === 0) return
                    if (window.confirm('Clear all blocks? This cannot be undone.')) {
                        commitBlocks([], blocks)
                        setSelectedId(null)
                    }
                }}
            />

            {/* ── Parse warning banner ── */}
            {showWarning && parseResult && parseResult.warnings.length > 0 && (
                <WarningBanner
                    strategy={parseResult.strategy}
                    warnings={parseResult.warnings}
                    onDismiss={() => setShowWarning(false)}
                />
            )}

            {/* ── Four-panel editor ── */}
            <div style={{
                display: 'flex',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
            }}>
                {/* FAR LEFT — Icon Rail */}
                <IconRail
                    activeTab={activeTab}
                    onTabChange={(tab) => {
                        setActiveTab(tab)
                        if (!panelOpen) setPanelOpen(true)
                    }}
                    auditErrors={auditErrors}
                    panelOpen={panelOpen}
                    onTogglePanel={() => setPanelOpen(p => !p)}
                />

                {/* LEFT — Sidebar Panel (all 6 tabs) */}
                <SidebarPanel
                    activeTab={activeTab}
                    isOpen={panelOpen}
                    // BlockLibrary
                    onAddBlock={handleAddBlock}
                    onDragStart={setDraggedType}
                    onDragEnd={() => setDraggedType(null)}
                    draggedType={draggedType}
                    // TemplatesTab
                    onInsertTemplate={handleInsertTemplate}
                    // BodySettings
                    canvasSettings={canvasSettings}
                    onUpdateSettings={handleUpdateSettings}
                    // ImagesTab
                    onInsertImage={handleInsertImage}
                    selectedId={selectedId}
                    blocks={blocks}
                    // AuditTab
                    html={currentHtml}
                    blockCount={blocks.length}
                    // TokensTab
                    placeholders={placeholders}
                    onInsertToken={handleInsertToken}
                />

                {/* CENTRE — Canvas or Live Preview */}
                {livePreview ? (
                    <LivePreview
                        html={currentHtml}
                        deviceWidth={deviceWidth}
                        onDeviceChange={setDeviceWidth}
                    />
                ) : (
                    <Canvas
                        blocks={blocks}
                        selectedId={selectedId}
                        draggedType={draggedType}
                        deviceWidth={deviceWidth}
                        onSelect={setSelectedId}
                        onDrop={handleDrop}
                        onReorder={handleReorder}
                        onDelete={handleDelete}
                        onDuplicate={handleDuplicate}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                        onCopyStyle={handleCopyStyle}
                        onPasteStyle={handlePasteStyle}
                        hasCopiedStyle={copiedStyle !== null}
                    />
                )}

                {/* RIGHT — Properties Panel */}
                <PropertiesPanel
                    block={selectedBlock}
                    placeholders={placeholders}
                    onChange={handleBlockChange}
                    onDeselect={() => setSelectedId(null)}
                />
            </div>

            {/* ── Bottom status bar ── */}
            <StatusBar
                blockCount={blocks.length}
                selectedBlock={selectedBlock}
                parseStrategy={parseResult?.strategy ?? null}
                auditErrors={auditErrors}
                livePreview={livePreview}
            />
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// EDITOR TOOLBAR
// ─────────────────────────────────────────────────────────────────────────────
interface EditorToolbarProps {
    blockCount: number
    selectedBlock: Block | null
    canUndo: boolean
    canRedo: boolean
    livePreview: boolean
    onUndo: () => void
    onRedo: () => void
    onToggleLivePreview: () => void
    onClearAll: () => void
}

function EditorToolbar({
    blockCount, selectedBlock, canUndo, canRedo,
    livePreview, onUndo, onRedo, onToggleLivePreview, onClearAll,
}: EditorToolbarProps) {
    return (
        <div style={{
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            borderBottom: `1px solid ${C.border}`,
            backgroundColor: C.surface,
            flexShrink: 0,
            gap: 12,
        }}>
            {/* Left — undo/redo + block count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ToolbarButton onClick={onUndo} disabled={!canUndo} title="Undo (Cmd+Z)">
                    <Undo2 size={14} />
                </ToolbarButton>
                <ToolbarButton onClick={onRedo} disabled={!canRedo} title="Redo (Cmd+Shift+Z)">
                    <Redo2 size={14} />
                </ToolbarButton>

                <div style={{ width: 1, height: 20, backgroundColor: C.border }} />

                <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '3px 10px',
                    backgroundColor: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: 20,
                }}>
                    <span style={{ fontFamily: 'Syne, DM Sans, sans-serif', fontSize: 11, color: C.secondary }}>
                        {blockCount} block{blockCount !== 1 ? 's' : ''}
                    </span>
                    {selectedBlock && (
                        <>
                            <span style={{ color: C.border }}>·</span>
                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.primary, fontWeight: 600 }}>
                                {getDefinition(selectedBlock.type)?.label} selected
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Centre — Live Preview toggle */}
            <button
                onClick={onToggleLivePreview}
                style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 14px',
                    border: `1px solid ${livePreview ? C.primary : C.border}`,
                    borderRadius: 8,
                    backgroundColor: livePreview ? C.primaryLight : 'transparent',
                    color: livePreview ? C.primary : C.secondary,
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 12, fontWeight: livePreview ? 700 : 400,
                    cursor: 'pointer', transition: 'all 0.15s',
                }}
            >
                {livePreview ? <EyeOff size={13} /> : <Eye size={13} />}
                {livePreview ? 'Card View' : 'Live Preview'}
            </button>

            {/* Right — clear all */}
            <button
                onClick={onClearAll}
                disabled={blockCount === 0}
                style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '4px 12px',
                    border: `1px solid ${blockCount === 0 ? C.border : '#fecaca'}`,
                    borderRadius: 7,
                    backgroundColor: 'transparent',
                    color: blockCount === 0 ? C.muted : C.danger,
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 11,
                    cursor: blockCount === 0 ? 'default' : 'pointer',
                    opacity: blockCount === 0 ? 0.5 : 1,
                    transition: 'all 0.15s',
                }}
            >
                <Trash2 size={12} />
                Clear all
            </button>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// WARNING BANNER
// ─────────────────────────────────────────────────────────────────────────────
function WarningBanner({
    strategy, warnings, onDismiss,
}: {
    strategy: ParseResult['strategy']
    warnings: string[]
    onDismiss: () => void
}) {
    const isHeuristic = strategy === 'heuristic'
    const bg = isHeuristic ? C.warningLight : C.dangerLight
    const color = isHeuristic ? C.warning : C.danger
    const Icon = isHeuristic ? AlertTriangle : X
    const title = isHeuristic
        ? 'Converted from existing HTML — some properties may need adjusting'
        : 'Custom code detected — some sections cannot be edited visually'

    return (
        <div style={{
            backgroundColor: bg, padding: '8px 16px',
            display: 'flex', alignItems: 'flex-start', gap: 10, flexShrink: 0,
        }}>
            <Icon size={14} style={{ color, marginTop: 1, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 2px', fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color }}>
                    {title}
                </p>
                {warnings.slice(0, 2).map((w, i) => (
                    <p key={i} style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 11, color, opacity: 0.85, lineHeight: 1.5 }}>
                        {w}
                    </p>
                ))}
            </div>
            <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color, fontSize: 16, padding: 0, flexShrink: 0, opacity: 0.6 }}>
                ×
            </button>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BAR
// ─────────────────────────────────────────────────────────────────────────────
function StatusBar({
    blockCount, selectedBlock, parseStrategy, auditErrors, livePreview,
}: {
    blockCount: number
    selectedBlock: Block | null
    parseStrategy: ParseResult['strategy'] | null
    auditErrors: number
    livePreview: boolean
}) {
    return (
        <div style={{
            height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px',
            backgroundColor: C.dark,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <StatusPill color={C.accent} label="Visual Editor" />
                {auditErrors === 0
                    ? <StatusPill color={C.success} label="eBay Compliant" />
                    : <StatusPill color={C.danger} label={`${auditErrors} compliance error${auditErrors > 1 ? 's' : ''}`} />
                }
                {livePreview && <StatusPill color="#0ea5e9" label="Live Preview" />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {selectedBlock && (
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
                        {getDefinition(selectedBlock.type)?.label} · {selectedBlock.id}
                    </span>
                )}
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                    {blockCount} block{blockCount !== 1 ? 's' : ''}
                    {parseStrategy === 'heuristic' ? ' · Heuristic parse' : ''}
                    {parseStrategy === 'block-comments' ? ' · Exact restore' : ''}
                </span>
            </div>
        </div>
    )
}

function StatusPill({ color, label }: { color: string; label: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <CheckCircle2 size={10} style={{ color, flexShrink: 0 }} />
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                {label}
            </span>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// TOOLBAR BUTTON
// ─────────────────────────────────────────────────────────────────────────────
function ToolbarButton({
    children, onClick, disabled, title,
}: {
    children: React.ReactNode
    onClick: () => void
    disabled?: boolean
    title?: string
}) {
    const [hovered, setHovered] = useState(false)
    return (
        <button
            onClick={onClick} disabled={disabled} title={title}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: 30, height: 30, borderRadius: 7,
                border: `1px solid ${C.border}`,
                backgroundColor: hovered && !disabled ? C.primaryLight : 'transparent',
                color: disabled ? C.muted : hovered ? C.primary : C.secondary,
                cursor: disabled ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0, transition: 'all 0.12s',
                opacity: disabled ? 0.4 : 1,
            }}
        >
            {children}
        </button>
    )
}
