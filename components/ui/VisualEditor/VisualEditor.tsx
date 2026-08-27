'use client'
// components/ui/VisualEditor.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Drag-&-Drop Editor
//
// Entry point. Imported by app/dashboard/design/html-editor/page.tsx.
// Rendered when activeMode === 'visual'.
//
// Owns:
//   blocks[]       — ordered array of Block instances on the canvas
//   selectedId     — which block is currently selected (or null)
//   draggedType    — block type being dragged from library (or null)
//   parseWarnings  — warnings from HTML→blocks parse on mode entry
//   parseStrategy  — 'block-comments' | 'heuristic' | 'empty'
//
// Syncs with parent (html-editor/page.tsx) via:
//   value          — reads html state on mount to reconstruct blocks
//   onChange       — fires with new full HTML string on every block change
//
// Props:
//   value          — current html string from page.tsx state
//   onChange       — setHtml from page.tsx
//   placeholders   — PLACEHOLDER_GROUPS from page.tsx
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useRef } from 'react'

import {
    Block,
    BlockType,
    createBlock,
    assembleDocument,
    getDefinition,
} from './VisualEditor/blocks'

import { parseHtml, describeResult, ParseResult } from './VisualEditor/htmlParser'
import BlockLibrary from './VisualEditor/BlockLibrary'
import Canvas from './VisualEditor/Canvas'
import PropertiesPanel from './VisualEditor/PropertiesPanel'

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

// ── PlaceholderGroup — mirrors interface in page.tsx ─────────────────────────
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
    // ── Core state ────────────────────────────────────────────────────────────
    const [blocks, setBlocks] = useState<Block[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [draggedType, setDraggedType] = useState<BlockType | null>(null)
    const [parseResult, setParseResult] = useState<ParseResult | null>(null)
    const [showWarning, setShowWarning] = useState(false)
    const [deviceWidth, setDeviceWidth] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
    const [undoStack, setUndoStack] = useState<Block[][]>([])
    const [redoStack, setRedoStack] = useState<Block[][]>([])

    // Prevent feedback loop: when we call onChange(html), page.tsx sets html,
    // which would re-trigger our useEffect. Use a ref to skip that cycle.
    const isInternalChange = useRef(false)
    const hasInitialised = useRef(false)

    // ── Initialise from value on first mount ──────────────────────────────────
    useEffect(() => {
        if (hasInitialised.current) return
        hasInitialised.current = true

        const result = parseHtml(value)
        setParseResult(result)
        setBlocks(result.blocks)

        if (result.warnings.length > 0 || result.strategy === 'heuristic') {
            setShowWarning(true)
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Rebuild HTML whenever blocks change ───────────────────────────────────
    const rebuildAndEmit = useCallback((nextBlocks: Block[]) => {
        isInternalChange.current = true
        const html = assembleDocument(nextBlocks)
        onChange(html)
        // Reset the flag after the state update cycle
        requestAnimationFrame(() => { isInternalChange.current = false })
    }, [onChange])

    // ── Block mutation helpers — all push to undo stack ───────────────────────
    const pushUndo = useCallback((prev: Block[]) => {
        setUndoStack(s => [...s.slice(-30), prev]) // keep last 30 states
        setRedoStack([])
    }, [])

    const commitBlocks = useCallback((next: Block[], prev: Block[]) => {
        pushUndo(prev)
        setBlocks(next)
        rebuildAndEmit(next)
    }, [pushUndo, rebuildAndEmit])

    // ── Add block (from library drop or click) ────────────────────────────────
    const handleAddBlock = useCallback((type: BlockType) => {
        const newBlock = createBlock(type)
        setBlocks(prev => {
            const next = [...prev, newBlock]
            pushUndo(prev)
            rebuildAndEmit(next)
            return next
        })
        setSelectedId(newBlock.id)
    }, [pushUndo, rebuildAndEmit])

    // ── Drop from library onto canvas ─────────────────────────────────────────
    const handleDrop = useCallback((type: BlockType) => {
        handleAddBlock(type)
        setDraggedType(null)
    }, [handleAddBlock])

    // ── Reorder blocks (drag within canvas) ───────────────────────────────────
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

    // ── Delete block ──────────────────────────────────────────────────────────
    const handleDelete = useCallback((id: string) => {
        setBlocks(prev => {
            const next = prev.filter(b => b.id !== id)
            pushUndo(prev)
            rebuildAndEmit(next)
            return next
        })
        setSelectedId(s => s === id ? null : s)
    }, [pushUndo, rebuildAndEmit])

    // ── Duplicate block ───────────────────────────────────────────────────────
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

    // ── Move up / down ────────────────────────────────────────────────────────
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

    // ── Update block props (from PropertiesPanel) ─────────────────────────────
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

    // ── Keyboard shortcuts ────────────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const meta = e.metaKey || e.ctrlKey

            // Undo: Cmd/Ctrl + Z
            if (meta && e.key === 'z' && !e.shiftKey) {
                e.preventDefault()
                handleUndo()
                return
            }
            // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
            if ((meta && e.key === 'z' && e.shiftKey) || (meta && e.key === 'y')) {
                e.preventDefault()
                handleRedo()
                return
            }
            // Delete selected block: Backspace / Delete (when not in an input)
            if ((e.key === 'Backspace' || e.key === 'Delete') && selectedId) {
                const tag = (e.target as HTMLElement).tagName.toLowerCase()
                if (!['input', 'textarea', 'select'].includes(tag)) {
                    e.preventDefault()
                    handleDelete(selectedId)
                }
            }
            // Deselect: Escape
            if (e.key === 'Escape') {
                setSelectedId(null)
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [handleUndo, handleRedo, handleDelete, selectedId])

    // ── Selected block ────────────────────────────────────────────────────────
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
            {/* ── Top toolbar bar ── */}
            <EditorToolbar
                blockCount={blocks.length}
                selectedBlock={selectedBlock}
                deviceWidth={deviceWidth}
                onDeviceChange={setDeviceWidth}
                canUndo={undoStack.length > 0}
                canRedo={redoStack.length > 0}
                onUndo={handleUndo}
                onRedo={handleRedo}
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

            {/* ── Three-panel editor ── */}
            <div style={{
                display: 'flex',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
            }}>
                {/* LEFT — Block Library */}
                <BlockLibrary
                    onAddBlock={handleAddBlock}
                    onDragStart={setDraggedType}
                    onDragEnd={() => setDraggedType(null)}
                    draggedType={draggedType}
                />

                {/* CENTRE — Canvas */}
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
                />

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
            />
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// EDITOR TOOLBAR
// Visual-mode-specific top bar: undo/redo, device toggles, block count, clear
// ─────────────────────────────────────────────────────────────────────────────
interface EditorToolbarProps {
    blockCount: number
    selectedBlock: Block | null
    deviceWidth: 'desktop' | 'tablet' | 'mobile'
    onDeviceChange: (d: 'desktop' | 'tablet' | 'mobile') => void
    canUndo: boolean
    canRedo: boolean
    onUndo: () => void
    onRedo: () => void
    onClearAll: () => void
}

function EditorToolbar({
    blockCount,
    selectedBlock,
    deviceWidth,
    onDeviceChange,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    onClearAll,
}: EditorToolbarProps) {
    const devices: Array<{ id: 'desktop' | 'tablet' | 'mobile'; icon: string; label: string; width: string }> = [
        { id: 'desktop', icon: '🖥', label: 'Desktop', width: '700px' },
        { id: 'tablet', icon: '📱', label: 'Tablet', width: '480px' },
        { id: 'mobile', icon: '📲', label: 'Mobile', width: '375px' },
    ]

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
                {/* Undo */}
                <ToolbarButton
                    onClick={onUndo}
                    disabled={!canUndo}
                    title="Undo (Cmd+Z)"
                >
                    ↩
                </ToolbarButton>
                {/* Redo */}
                <ToolbarButton
                    onClick={onRedo}
                    disabled={!canRedo}
                    title="Redo (Cmd+Shift+Z)"
                >
                    ↪
                </ToolbarButton>

                <div style={{ width: 1, height: 20, backgroundColor: C.border }} />

                {/* Block count pill */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
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

            {/* Centre — device width toggles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {devices.map(d => (
                    <button
                        key={d.id}
                        onClick={() => onDeviceChange(d.id)}
                        title={`${d.label} preview (${d.width})`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 10px',
                            border: `1px solid ${deviceWidth === d.id ? C.primary : C.border}`,
                            borderRadius: 7,
                            backgroundColor: deviceWidth === d.id ? C.primaryLight : 'transparent',
                            color: deviceWidth === d.id ? C.primary : C.secondary,
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: 11,
                            fontWeight: deviceWidth === d.id ? 700 : 400,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}
                    >
                        <span style={{ fontSize: 13 }}>{d.icon}</span>
                        <span>{d.label}</span>
                        <span style={{ fontSize: 9, opacity: 0.6 }}>{d.width}</span>
                    </button>
                ))}
            </div>

            {/* Right — clear all */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                    onClick={onClearAll}
                    disabled={blockCount === 0}
                    title="Clear all blocks"
                    style={{
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
                    Clear all
                </button>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// WARNING BANNER
// Shown when parseHtml() used heuristics or found issues
// ─────────────────────────────────────────────────────────────────────────────
function WarningBanner({
    strategy,
    warnings,
    onDismiss,
}: {
    strategy: ParseResult['strategy']
    warnings: string[]
    onDismiss: () => void
}) {
    const isHeuristic = strategy === 'heuristic'
    const bg = isHeuristic ? C.warningLight : C.dangerLight
    const border = isHeuristic ? '#fde68a50' : '#fecaca50'
    const color = isHeuristic ? C.warning : C.danger
    const icon = isHeuristic ? '⚠' : '✕'
    const title = isHeuristic
        ? 'Converted from existing HTML — some properties may need adjusting'
        : 'Custom code detected — some sections cannot be edited visually'

    return (
        <div style={{
            backgroundColor: bg,
            border: `1px solid ${border}`,
            borderRadius: 0,
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            flexShrink: 0,
        }}>
            <span style={{ fontSize: 14, color, marginTop: 1, flexShrink: 0 }}>{icon}</span>
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
            <button
                onClick={onDismiss}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color,
                    fontSize: 16,
                    padding: 0,
                    flexShrink: 0,
                    opacity: 0.6,
                    lineHeight: 1,
                }}
            >
                ×
            </button>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BAR
// Bottom bar — matches the style of the code editor's bottom bar
// ─────────────────────────────────────────────────────────────────────────────
function StatusBar({
    blockCount,
    selectedBlock,
    parseStrategy,
}: {
    blockCount: number
    selectedBlock: Block | null
    parseStrategy: ParseResult['strategy'] | null
}) {
    return (
        <div style={{
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            backgroundColor: C.dark,
            borderTop: `1px solid rgba(255,255,255,0.06)`,
            flexShrink: 0,
        }}>
            {/* Left */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <StatusPill color={C.accent} label="Visual Editor" />
                <StatusPill color={C.success} label="Active Content Free" />
                <StatusPill color={C.success} label="100% eBay Policy Compliant" />
            </div>

            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {selectedBlock && (
                    <span style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.5)',
                    }}>
                        {getDefinition(selectedBlock.type)?.label}
                        {' · '}id: {selectedBlock.id}
                    </span>
                )}
                <span style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.4)',
                }}>
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
            <span style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                backgroundColor: color,
                display: 'inline-block',
                flexShrink: 0,
            }} />
            <span style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 10,
                color: 'rgba(255,255,255,0.6)',
                fontWeight: 500,
            }}>
                {label}
            </span>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// TOOLBAR BUTTON
// Small icon button used in the editor toolbar
// ─────────────────────────────────────────────────────────────────────────────
function ToolbarButton({
    children,
    onClick,
    disabled,
    title,
}: {
    children: React.ReactNode
    onClick: () => void
    disabled?: boolean
    title?: string
}) {
    const [hovered, setHovered] = useState(false)
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                border: `1px solid ${C.border}`,
                backgroundColor: hovered && !disabled ? C.primaryLight : 'transparent',
                color: disabled ? C.muted : hovered ? C.primary : C.secondary,
                fontSize: 15,
                cursor: disabled ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transition: 'all 0.12s',
                opacity: disabled ? 0.4 : 1,
                fontFamily: 'DM Sans, sans-serif',
            }}
        >
            {children}
        </button>
    )
}
