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
import { createClient } from '@/lib/supabase'
import {
    Undo2, Redo2, Trash2, Eye, EyeOff,
    AlertTriangle, CheckCircle2, X,
    Monitor, Tablet, Smartphone, Download, Globe,
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
import { auditHtml } from './VisualEditor/audit'
import { categoryFromTemplateId, type CategoryId } from './VisualEditor/sampleData'
import IconRail from './VisualEditor/IconRail'
import SidebarPanel from './VisualEditor/SidebarPanel'
import Canvas from './VisualEditor/Canvas'
import PropertiesPanel from './VisualEditor/PropertiesPanel'
import LivePreview from './VisualEditor/LivePreview'
import { EditorToolbar as RichEditorToolbar } from './EditorToolbar'
import BlockToolbar from './VisualEditor/BlockToolbar'

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

// ── Block search ──────────────────────────────────────────────────────────────
// All text-bearing prop keys across every block type. Ordered by priority —
// the first match in this list wins when multiple text fields contain the query.
const TEXT_PROP_KEYS = [
    // Generic
    'text', 'content', 'label',
    // Product blocks
    'title', 'titleText', 'description',
    // Hero / Banner / CTA
    'headingText', 'subText', 'buttonText',
    // Shipping / Returns / Policy
    'shippingText', 'dispatchText', 'locationText', 'policyText', 'periodText',
    // Seller / Nav / Urgency
    'sellerName', 'tagline', 'feedbackText', 'message',
    // Misc
    'storeName', 'alt', 'linkUrl',
]

/**
 * blockMatchesQuery(block, query) → boolean
 * Matches when the query is empty, or when the query appears in:
 *   - the block's type label (e.g. "Heading", "Product Image")
 *   - any of TEXT_PROP_KEYS string props on the block
 * Pure function, safe to call inside useMemo.
 */
function blockMatchesQuery(block: Block, query: string): boolean {
    const q = query.trim().toLowerCase()
    if (!q) return true
    // 1) Match the block type label (e.g. searching "head" finds Heading blocks)
    const label = getDefinition(block.type)?.label?.toLowerCase() ?? ''
    if (label.includes(q)) return true
    // 2) Match any text-bearing prop on the block
    // Cast via unknown first — BlockProps is a union of many interfaces and
    // doesn't overlap cleanly with Record<string, unknown>.
    const p = block.props as unknown as Record<string, unknown>
    for (const key of TEXT_PROP_KEYS) {
        const v = p[key]
        if (typeof v === 'string' && v.toLowerCase().includes(q)) return true
    }
    return false
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
    templateCategory?: string   // DB category for saving — passed from parent page
    /** Called once with a stable trigger fn so parent can fire Export HTML from outside */
    onExportReady?: (fn: () => void) => void
    /** Called when user clicks Publish in the bottom toolbar */
    onPublish?: () => void
    /** True while publish is in progress — shows spinner on the Publish button */
    publishStatus?: 'idle' | 'publishing' | 'published'
    /** Slot rendered at the far right of the second toolbar row (Row 2) */
    toolbarSlot?: React.ReactNode
    /** Called when user clicks the back button in the toolbar */
    onBack?: () => void
    /**
     * Initial canvas category. When a saved template is loaded, the parent
     * (e.g. app/dashboard/design/visual-editor/page.tsx) already knows the
     * template's DB category (e.g. 'electronics'), so it can seed the
     * VisualEditor's activeCategory directly. This avoids the case where
     * loading a saved template by its Supabase uuid falls through to the
     * default 'pet' sample data.
     */
    initialCategory?: CategoryId
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function VisualEditor({
    value,
    onChange,
    placeholders,
    initialCategory,
    templateCategory = 'general',
    onExportReady,
    onPublish,
    publishStatus = 'idle',
    toolbarSlot,
    onBack,
}: VisualEditorProps) {
    // ── Core block state ──────────────────────────────────────────────────────
    const [blocks, setBlocks] = useState<Block[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [showShortcuts, setShowShortcuts] = useState(false)
    const [copiedStyle, setCopiedStyle] = useState<Record<string, unknown> | null>(null)
    const [tokenFeedback, setTokenFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
    const [draggedType, setDraggedType] = useState<BlockType | null>(null)
    const [undoStack, setUndoStack] = useState<Block[][]>([])
    const [redoStack, setRedoStack] = useState<Block[][]>([])

    // ── Parse state ───────────────────────────────────────────────────────────
    const [parseResult, setParseResult] = useState<ParseResult | null>(null)
    const [showWarning, setShowWarning] = useState(false)

    // ── Smart Clear All State ────────────────────────────────────────────────────
    const [showClearConfirm, setShowClearConfirm] = useState(false)

    // ── Sidebar state ─────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<RailTabId | null>('blocks')
    const [panelOpen, setPanelOpen] = useState(true)
    type DropSlot = 'leftImage' | 'leftContent' | 'rightContent' | 'content' | 'col1Content' | 'col2Content' | 'col3Content' | 'col4Content'
    const [activeDropSlot, setActiveDropSlot] = useState<{ blockId: string; slot: DropSlot } | null>(null)

    // ── Auto-switch to Images tab when an image block is selected ─────────────
    // Set is module-level (not per-render) — no need to recreate on every render
    const IMAGE_BLOCK_TYPES = useMemo(() => new Set<BlockType>([
        'product_image', 'gallery_row', 'single_image',
        'banner', 'hero_header', 'before_after', 'logo_bar', 'image',
        'sidebar_layout', // image + content slot block
    ]), [])

    // Compute the selected block's TYPE so the effect re-fires when the type
    // changes (e.g. user undoes to a different block, or a future "change
    // block type" feature swaps the type in place).
    const selectedBlockType = useMemo(() => {
        if (!selectedId) return null
        return blocks.find(b => b.id === selectedId)?.type ?? null
    }, [blocks, selectedId])

    useEffect(() => {
        if (!selectedId) {
            return
        }
        if (selectedBlockType === null) {
            return
        }
        // Only auto-switch for pure image blocks — sidebar_layout must wait for exact slot click
        if (IMAGE_BLOCK_TYPES.has(selectedBlockType) && selectedBlockType !== 'sidebar_layout') {
            setActiveTab('images')
            setPanelOpen(true)
        }
    }, [selectedId, selectedBlockType, IMAGE_BLOCK_TYPES])

    // ── Canvas + preview state ────────────────────────────────────────────────
    const [deviceWidth, setDeviceWidth] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
    const [livePreview, setLivePreview] = useState(false)
    const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>(DEFAULT_CANVAS_SETTINGS)

    const [canvasZoom, setCanvasZoom] = useState(100)          // % zoom level
    const [selectedSubSlot, setSelectedSubSlot] = useState<string | null>(null)
    const [activeSlotEdit, setActiveSlotEdit] = useState<{ blockId: string; propKey: string; currentHtml: string; slotBlock?: Block } | null>(null)
    const [activeSelection, setActiveSelection] = useState<{
        blockId: string
        propKey: string | null
        selectedText: string
        selectedHtml: string
    } | null>(null)
    const slotBlockMapRef = useRef<Record<string, Block>>({})
    const [inlineToolbar, setInlineToolbar] = useState<{
        visible: boolean;
        x: number;
        y: number;
        blockId: string;
        propKey: string;
        text: string;
    } | null>(null);
    const [focusMode, setFocusMode] = useState(false)        // hides sidebar + panel
    const [templateName, setTemplateName] = useState('')
    /**
     * Active template category — drives the category-matched sample data that
     * the canvas previews (product photos, brand, spec values, cross-sell).
     * Updated whenever a template is inserted or loaded. Initial value is
     * `initialCategory` if provided (e.g. when loading a saved template whose
     * DB category we already know), otherwise 'pet'.
     */
    const [activeCategory, setActiveCategory] = useState<CategoryId>(initialCategory ?? 'pet')

    // ── Sync activeCategory when the parent updates initialCategory ─────────
    // The parent (visual-editor page) loads the saved template from Supabase
    // asynchronously and may pass a new initialCategory after first mount.
    // Mirror the prop into state so the canvas preview updates as soon as
    // the load completes. Skipped if the prop is undefined (parent didn't
    // provide one — leave state alone).
    useEffect(() => {
        if (initialCategory && initialCategory !== activeCategory) {
            setActiveCategory(initialCategory)
        }
        // We intentionally only depend on initialCategory. activeCategory is
        // captured in the closure to avoid a feedback loop, but the check
        // inside prevents the loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialCategory])

    // Track which saved-template row we're editing. null = unsaved / new.
    // Set by handleLoadTemplate, consumed by handleSave (UPDATE vs INSERT).
    const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null)
    const [isDirty, setIsDirty] = useState(false)            // unsaved changes
    const [lockedIds, setLockedIds] = useState<Set<string>>(new Set()) // locked blocks
    const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set()) // hidden blocks
    const [canvasSearch, setCanvasSearch] = useState('')          // search blocks on canvas

    // Auto‑select the image sub‑slot when a split‑image banner is selected
    useEffect(() => {
        if (!selectedId) return
        const block = blocks.find(b => b.id === selectedId)
        if (!block) return
        if (block.type === 'banner' && (block.props as any).variant === 'split-image-text') {
            setSelectedSubSlot('imageUrl')
        }
    }, [selectedId, blocks])

    // ── Anti-feedback-loop refs ───────────────────────────────────────────────
    const isInternalChange = useRef(false)
    const hasInitialised = useRef(false)
    const canvasContainerRef = useRef<HTMLDivElement | null>(null) // for scroll-to-match

    // ── Current assembled HTML ────────────────────────────────────────────────
    const [currentHtml, setCurrentHtml] = useState(value)

    // ── Audit error count — for IconRail badge ────────────────────────────────
    // Single source of truth lives in ./VisualEditor/audit.ts
    const auditErrors = useMemo(() => auditHtml(currentHtml).count, [currentHtml])

    // ── Initialise from value, AND re-init when the value prop actually changes ─
    // Previously this effect had `[]` deps which meant:
    //   - Same instance + new value prop → stale blocks (data loss)
    //   - Same instance + same value prop → parse runs every render (regression)
    // Now we compare the incoming value to the last seen one, so we only re-parse
    // when the parent actually gives us new HTML.
    const lastSeenValue = useRef<string>('')
    useEffect(() => {
        // Skip the very first render — we already parsed in the ref guard above
        if (!hasInitialised.current) {
            hasInitialised.current = true
            lastSeenValue.current = value
            const result = parseHtml(value)
            setParseResult(result)
            setBlocks(result.blocks)
            setCurrentHtml(value)
            setCurrentTemplateId(null)
            setIsDirty(false)
            setSelectedId(null)
            // No selectedSlot management — direct asset focus removes slot cards
            setUndoStack([])
            setRedoStack([])
            setLockedIds(new Set())
            setHiddenIds(new Set())
            if (result.warnings.length > 0 || result.strategy === 'heuristic') {
                setShowWarning(true)
            }
            return
        }
        // Subsequent re-initialisations only when the value really changed
        if (value === lastSeenValue.current) return
        // Skip if this change was triggered by our own onChange emission
        if (isInternalChange.current) {
            lastSeenValue.current = value
            return
        }
        lastSeenValue.current = value
        const result = parseHtml(value)
        setParseResult(result)
        setBlocks(result.blocks)
        setCurrentHtml(value)
        setCurrentTemplateId(null)
        setIsDirty(false)
        setSelectedId(null)
        setUndoStack([])
        setRedoStack([])
        setLockedIds(new Set())
        setHiddenIds(new Set())
        if (result.warnings.length > 0 || result.strategy === 'heuristic') {
            setShowWarning(true)
        }
    }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Rebuild HTML whenever blocks or settings change ───────────────────────
    const rebuildAndEmit = useCallback((nextBlocks: Block[], settings?: CanvasSettings) => {
        isInternalChange.current = true
        const html = assembleDocument(nextBlocks, settings ?? canvasSettings)
        setCurrentHtml(html)
        onChange(stripInternalAttributes(html))
        setIsDirty(true)
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
    // All mutations route through commitBlocks — single source of truth for the
    // (pushUndo + setBlocks + rebuildAndEmit) trio. If we ever need to add
    // analytics, debouncing, or telemetry to every mutation, it's one place.
    //
    // Pattern: each handler computes `next` from the current `blocks` (closure),
    // then calls commitBlocks(next, blocks) which does all three side effects
    // atomically and triggers a single re-render.
    const handleAddBlock = useCallback((type: BlockType) => {
        // Pass canvasSettings so new blocks inherit global tokens
        const newBlock = createBlock(type, canvasSettings)
        commitBlocks([...blocks, newBlock], blocks)
        setSelectedId(newBlock.id)
    }, [commitBlocks, canvasSettings, blocks])

    const handleSelectBlock = useCallback((id: string) => {
        setSelectedId(id);
        setActiveDropSlot(null);
        setActiveSlotEdit(null);
    }, []);

    // ── Lock / Hide block ────────────────────────────────────────────────────
    const handleToggleLock = useCallback((id: string) => {
        setLockedIds(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }, [])

    const handleToggleHide = useCallback((id: string) => {
        setHiddenIds(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }, [])

    // ── Copy / Paste block style ─────────────────────────────────────────────
    const handleCopyStyle = useCallback((id: string) => {
        const block = blocks.find(b => b.id === id)
        if (!block) return
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
    }, [blocks])

    const handlePasteStyle = useCallback((id: string) => {
        if (!copiedStyle) return
        const next = blocks.map(b => {
            if (b.id !== id) return b
            return { ...b, props: { ...(b.props as any), ...copiedStyle } } as Block
        })
        commitBlocks(next, blocks)
    }, [copiedStyle, commitBlocks, blocks])

    const handleAddBlockBelow = useCallback((afterBlockId: string, type: BlockType) => {
        const idx = blocks.findIndex(b => b.id === afterBlockId)
        const newBlock = createBlock(type, canvasSettings)
        const newBlocks = [...blocks]
        newBlocks.splice(idx + 1, 0, newBlock)
        commitBlocks(newBlocks, blocks)
        setSelectedId(newBlock.id)
        setActiveDropSlot(null)
    }, [blocks, canvasSettings, commitBlocks])

    const handleInsertOrAssignBlock = useCallback((type: BlockType) => {
        if (activeDropSlot) {
            const { slot, blockId } = activeDropSlot;
            const idx = blocks.findIndex(b =>
                b.id === blockId &&
                ['two_column', 'full_width_section', 'three_column', 'four_column', 'container', 'sidebar_layout'].includes(b.type) &&
                b.props &&
                typeof (b.props as any)[slot] === 'string'
            );
            if (idx >= 0) {
                const target = blocks[idx];
                const newBlock = createBlock(type, canvasSettings);
                const def = getDefinition(type);
                const rawHtml = def ? def.toHtml(newBlock.props, newBlock.id) : '';
                // Wrap in dropzone div so clicking filled content fires RIAZIFY_EDIT_SLOT_CONTENT
                const newHtml = `<div data-canvas-dropzone="${slot}" data-slot-block-type="${type}" data-slot-block-props='${JSON.stringify(newBlock.props)}'>${rawHtml}</div>`;
                const updatedProps = { ...(target.props as any), [slot]: newHtml };
                const updatedBlock = { ...target, props: updatedProps } as any;
                const newBlocks = [...blocks];
                newBlocks[idx] = updatedBlock;
                commitBlocks(newBlocks, blocks);
                setActiveDropSlot(null);
                setSelectedId(target.id);
                return;
            }
        }
        handleAddBlock(type);
    }, [handleAddBlock, activeDropSlot, blocks, canvasSettings, commitBlocks]);

    const handleDrop = useCallback((type: BlockType) => {
        handleInsertOrAssignBlock(type);
        setDraggedType(null);
    }, [handleInsertOrAssignBlock]);

    const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
        // Bounds check — silently no-op on out-of-range indices (#19)
        if (fromIndex < 0 || fromIndex >= blocks.length) return
        if (toIndex < 0 || toIndex > blocks.length) return
        if (fromIndex === toIndex) return
        const next = [...blocks]
        const [moved] = next.splice(fromIndex, 1)
        next.splice(toIndex, 0, moved)
        commitBlocks(next, blocks)
    }, [commitBlocks, blocks])

    const handleFormatSlot = (blockId: string, propKey: string, format: string, value: string, selection?: { selectedHtml: string; selectedText: string } | null) => {
        const idx = blocks.findIndex(b => b.id === blockId)
        if (idx < 0) return
        const block = blocks[idx]
        const currentHtml = (block.props as any)[propKey] ?? ''

        let newHtml = currentHtml

        // Direct HTML replacement from PropertiesPanel onChange
        if (format === '__html__') {
            newHtml = value
        } else if (format === 'fontWeight') {
            if (value === 'bold') {
                if (!/font-weight:\s*bold/i.test(newHtml)) {
                    newHtml = `<strong>${newHtml}</strong>`
                }
            } else {
                newHtml = newHtml.replace(/<\/?strong>/gi, '').replace(/<\/?b>/gi, '')
            }
        } else if (format === 'fontStyle') {
            if (value === 'italic') {
                if (!/<em>|<i>/i.test(newHtml)) {
                    newHtml = `<em>${newHtml}</em>`
                }
            } else {
                newHtml = newHtml.replace(/<\/?em>/gi, '').replace(/<\/?i>/gi, '')
            }
        } else if (format === 'textDecoration') {
            if (value === 'underline') {
                if (!/<u>/i.test(newHtml)) {
                    newHtml = `<u>${newHtml}</u>`
                }
            } else {
                newHtml = newHtml.replace(/<\/?u>/gi, '')
            }
        } else if (format === 'fontSize') {
            newHtml = newHtml.replace(/font-size:\s*[^;'"]+/gi, '')
            newHtml = newHtml.replace(/<span([^>]*)style="([^"]*)"([^>]*)>/gi, (m: string, a: string, s: string, c: string) =>
                `<span${a}style="${s}font-size:${value};"${c}>`)
            if (!/<span/i.test(newHtml)) {
                newHtml = `<span style="font-size:${value};">${newHtml}</span>`
            }
        } else if (format === 'align') {
            newHtml = newHtml.replace(/text-align:\s*[^;'"]+/gi, '')
            newHtml = `<div style="text-align:${value};">${newHtml}</div>`
        } else if (format === 'color') {
            newHtml = newHtml.replace(/(?<![a-z-])color:\\s*[^;'\"]+/gi, '')
            if (!/<span/i.test(newHtml)) {
                newHtml = `<span style="color:${value};">${newHtml}</span>`
            } else {
                newHtml = newHtml.replace(/<span([^>]*)style="([^"]*)"([^>]*)>/gi, (m: string, a: string, s: string, c: string) =>
                    `<span${a}style="${s}color:${value};"${c}>`)
            }
        } else if (format === 'link') {
            if (selection?.selectedHtml && currentHtml.includes(selection.selectedHtml)) {
                // Selection-scoped: only wrap the selected portion
                const linked = `<a href="${value}" style="color:inherit;text-decoration:underline;">${selection.selectedHtml}</a>`
                newHtml = currentHtml.replace(selection.selectedHtml, linked)
            } else {
                // No selection — wrap the whole slot (existing behaviour)
                const outerAMatch = newHtml.match(/^<a\s[^>]*>([\s\S]*)<\/a>$/i)
                if (outerAMatch) newHtml = outerAMatch[1]
                if (value) {
                    newHtml = `<a href="${value}" style="color:inherit;text-decoration:underline;">${newHtml}</a>`
                }
            }
        } else if (format === 'highlight') {
            if (value === 'none') {
                // Remove all highlight spans
                newHtml = newHtml.replace(/<span([^>]*)style="([^"]*background-color:[^"]*)"([^>]*)>([\s\S]*?)<\/span>/gi,
                    (m: string, a: string, s: string, c: string, inner: string) => {
                        const cleaned = s.replace(/background-color:\s*[^;]+;?/gi, '').trim()
                        return cleaned ? `<span${a}style="${cleaned}"${c}>${inner}</span>` : inner
                    })
            } else if (selection?.selectedHtml && currentHtml.includes(selection.selectedHtml)) {
                // Wrap only selected text
                const highlighted = `<span style="background-color:${value};border-radius:2px;padding:0 2px;">${selection.selectedHtml}</span>`
                newHtml = currentHtml.replace(selection.selectedHtml, highlighted)
            } else {
                // No selection — wrap whole slot
                newHtml = `<span style="background-color:${value};border-radius:2px;padding:0 2px;">${newHtml}</span>`
            }
        } else if (format === 'removeLink') {
            if (selection?.selectedHtml) {
                // Remove link only around the selected portion
                newHtml = currentHtml.replace(
                    /<a\s[^>]*>([\s\S]*?)<\/a>/gi,
                    (match: string, inner: string) => inner
                )
            } else {
                // No selection — strip outermost <a> wrapper (existing behaviour)
                const outerAMatch = newHtml.match(/^<a\s[^>]*>([\s\S]*)<\/a>$/i)
                if (outerAMatch) newHtml = outerAMatch[1]
            }
        }

        const updatedBlock = {
            ...block,
            props: { ...(block.props as any), [propKey]: newHtml }
        }
        const newBlocks = [...blocks]
        newBlocks[idx] = updatedBlock
        commitBlocks(newBlocks, blocks)

        // Update activeSlotEdit so toolbar reflects new state
        setActiveSlotEdit(prev => prev ? { ...prev, currentHtml: newHtml } : null)
        // Clear selection after a short delay so state has time to be used
        setTimeout(() => setActiveSelection(null), 100)
        // Bug #3 fix: explicitly push updated slot HTML into iframe so canvas re-renders in real time
        setTimeout(() => {
            const iframe = document.querySelector('iframe') as HTMLIFrameElement
            if (iframe?.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'RIAZIFY_UPDATE_SLOT_HTML',
                    blockId,
                    propKey,
                    html: newHtml,
                }, '*')
                // Re-send highlight so purple outline stays
                iframe.contentWindow.postMessage({ type: 'RIAZIFY_UPDATE_ACTIVE_SLOT', propKey }, '*')
            }
        }, 50)
    }

    const handleClearSlot = (blockId: string, propKey: string) => {
        const EMPTY_SLOT = (slot: string) =>
            `<div data-canvas-dropzone="${slot}"><span class="add-btn" style="display:flex;justify-content:center;align-items:center;height:100%;background:#f8f8f8;color:#555;border:1px dashed #ddd;padding:8px;cursor:pointer;">+ Add Content</span></div>`
        const idx = blocks.findIndex(b => b.id === blockId)
        if (idx < 0) return
        const target = blocks[idx]
        const updatedProps = { ...(target.props as any), [propKey]: EMPTY_SLOT(propKey) }
        const newBlocks = [...blocks]
        newBlocks[idx] = { ...target, props: updatedProps } as any
        commitBlocks(newBlocks, blocks)
        // Bug #4 fix: clear stale slotBlockMapRef entry so empty slot shows no stale props
        delete slotBlockMapRef.current[`${blockId}__${propKey}`]
        setActiveSlotEdit(null)
        setSelectedSubSlot(null)
    }

    const handleDelete = useCallback((id: string) => {
        const next = blocks.filter(b => b.id !== id)
        // Skip the commit if the id wasn't in the list (no-op) — saves an undo step
        if (next.length === blocks.length) return
        commitBlocks(next, blocks)
        setSelectedId(s => s === id ? null : s)
        // Clean up auxiliary Sets so deleted block ids don't leak (#40)
        setLockedIds(prev => {
            if (!prev.has(id)) return prev
            const updated = new Set(prev)
            updated.delete(id)
            return updated
        })
        setHiddenIds(prev => {
            if (!prev.has(id)) return prev
            const updated = new Set(prev)
            updated.delete(id)
            return updated
        })
    }, [commitBlocks, blocks])

    const handleDuplicate = useCallback((id: string) => {
        const idx = blocks.findIndex(b => b.id === id)
        if (idx === -1) return
        const original = blocks[idx]
        const dupe: Block = {
            ...createBlock(original.type),
            props: JSON.parse(JSON.stringify(original.props)),
        }
        const next = [...blocks.slice(0, idx + 1), dupe, ...blocks.slice(idx + 1)]
        commitBlocks(next, blocks)
        setSelectedId(dupe.id)
    }, [commitBlocks, blocks])

    const handleMoveUp = useCallback((id: string) => {
        const idx = blocks.findIndex(b => b.id === id)
        if (idx <= 0) return
        handleReorder(idx, idx - 1)
    }, [blocks, handleReorder])

    const handleMoveDown = useCallback((id: string) => {
        const idx = blocks.findIndex(b => b.id === id)
        if (idx === -1 || idx >= blocks.length - 1) return
        handleReorder(idx, idx + 1)
    }, [blocks, handleReorder])

    const handleBlockChange = useCallback((updated: Block) => {
        const next = blocks.map(b => b.id === updated.id ? updated : b)
        // No-op fast path — block id not in list (shouldn't happen, but defensive)
        if (next === blocks) return
        commitBlocks(next, blocks)
    }, [commitBlocks, blocks])

    // ── Undo / Redo ───────────────────────────────────────────────────────────
    // ── Save / Load state ─────────────────────────────────────────────────────
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

    const handleSave = useCallback(async () => {
        if (blocks.length === 0) return
        setSaveStatus('saving')
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('You must be logged in to save templates')

            const trimmedName = (templateName || 'My Template').trim()
            const payload = {
                name: trimmedName,
                blocks_json: blocks,
                canvas_settings_json: canvasSettings,
                category: templateCategory,
                updated_at: new Date().toISOString(),
            }

            // The visual_templates table is not in the generated Database type,
            // so we cast `from()` to `any` once here. Cleaner than per-call casts.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const tbl: any = supabase.from('visual_templates')

            if (currentTemplateId) {
                // ── UPDATE existing row ──
                const { error } = await tbl
                    .update(payload)
                    .eq('id', currentTemplateId)
                    .eq('user_id', user.id) // defence in depth — ensure user owns the row
                if (error) throw error
            } else {
                // ── INSERT new row ──
                const { data, error } = await tbl
                    .insert({ ...payload, user_id: user.id })
                    .select('id')
                    .single()
                if (error) throw error
                // Remember the new id so subsequent saves UPDATE in place
                if (data?.id) setCurrentTemplateId(data.id)
            }
            setIsDirty(false)
            setSaveStatus('saved')
            setTimeout(() => setSaveStatus('idle'), 2500)
        } catch (e: any) {
            console.error('[VisualEditor] save error:', e)
            setSaveStatus('error')
            // Surface the error message to the user (Fix #6)
            setTokenFeedback({ type: 'error', msg: e?.message ?? 'Save failed — try again' })
            setTimeout(() => { setSaveStatus('idle'); setTokenFeedback(null) }, 4000)
        }
    }, [blocks, canvasSettings, templateName, currentTemplateId])

    const handleLoadTemplate = useCallback((
        name: string,
        loadedBlocks: Block[],
        loadedSettings: CanvasSettings,
        templateId?: string,
    ) => {
        if (blocks.length > 0 && isDirty) {
            if (!window.confirm('Load this template? Your current unsaved changes will be lost.')) return
        }
        // Set canvas settings first so the rebuild uses them
        setCanvasSettings(loadedSettings)
        // Route through commitBlocks so undo/redo/redraw/HTML all stay in sync
        commitBlocks(loadedBlocks, blocks)
        setTemplateName(name)
        setCurrentTemplateId(templateId ?? null)
        setSelectedId(null)
        setIsDirty(false)
        // Update the active category so the canvas previews category-matched
        // sample data for the loaded template.
        setActiveCategory(categoryFromTemplateId(templateId ?? null))
        // Reset per-block state — old block ids no longer exist in the new template
        setLockedIds(new Set())
        setHiddenIds(new Set())
    }, [blocks, isDirty, commitBlocks])

    const stripInternalAttributes = (html: string): string => {
        return html
            .replace(/\s*data-canvas-dropzone="[^"]*"/g, '')
            .replace(/\s*data-slot-block-type="[^"]*"/g, '')
            .replace(/\s*data-slot-block-props='[^']*'/g, '')
            .replace(/\s*data-block-id="[^"]*"/g, '')
            .replace(/\s*data-toolbar[^=\s>]*/g, '')
    }

    const handleExport = useCallback(() => {
        if (blocks.length === 0) return
        const html = stripInternalAttributes(assembleDocument(blocks, canvasSettings))
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        const safeName = (templateName || 'my-template').replace(/[^a-z0-9_-]/gi, '-').toLowerCase()
        a.href = url
        a.download = `${safeName}.html`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }, [blocks, canvasSettings, templateName])

    // Expose export fn to parent (page.tsx calls it from the dropdown)
    const onExportReadyRef = useRef(onExportReady)
    useEffect(() => { onExportReadyRef.current = onExportReady }, [onExportReady])
    useEffect(() => {
        onExportReadyRef.current?.(handleExport)
    }, [handleExport])

    const handleUndo = useCallback(() => {
        if (undoStack.length === 0) return
        const last = undoStack[undoStack.length - 1]
        const rest = undoStack.slice(0, -1)
        setUndoStack(rest)
        setRedoStack(r => [...r, blocks])
        // Direct setBlocks + rebuildAndEmit here is intentional — undo/redo
        // manage their own stack state, so they don't go through commitBlocks.
        setBlocks(last)
        rebuildAndEmit(last)
    }, [undoStack, blocks, rebuildAndEmit])

    const handleRedo = useCallback(() => {
        if (redoStack.length === 0) return
        const last = redoStack[redoStack.length - 1]
        const rest = redoStack.slice(0, -1)
        setRedoStack(rest)
        setUndoStack(u => [...u, blocks])
        setBlocks(last)
        rebuildAndEmit(last)
    }, [redoStack, blocks, rebuildAndEmit])

    // ── NEW: Template insert — appends blocks ─────────────────────────────────
    const handleInsertTemplate = useCallback((newBlocks: Block[], templateId?: string) => {
        if (newBlocks.length === 0) return
        // Update the active category so subsequent renders (and the canvas
        // previews) use category-matched sample data.
        if (templateId) {
            setActiveCategory(categoryFromTemplateId(templateId))
        }
        commitBlocks([...blocks, ...newBlocks], blocks)
    }, [commitBlocks, blocks])

    // ── Image insert — slot-aware, updates exact prop/index ─────────────────
    const handleInsertImage = useCallback((url: string, alt: string, propKey?: string, propIndex?: number) => {
        const currentSelectedId = selectedId
        // If an active drop slot is set (e.g. within sidebar_layout), prioritize its slot
        const effectivePropKey = propKey ?? activeDropSlot?.slot;
        const targetBlockId = currentSelectedId || activeDropSlot?.blockId;

        if (targetBlockId) {
            const target = blocks.find(b => b.id === targetBlockId)
            if (target) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const p = target.props as any
                if (effectivePropKey) {
                    const next: Block[] = blocks.map(b => {
                        if (b.id !== targetBlockId) return b
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const bp = b.props as any
                        if (effectivePropKey === 'images' && propIndex !== undefined) {
                            const images = [...(bp.images ?? [])]
                            images[propIndex] = { ...images[propIndex], src: url, alt }
                            return { ...b, props: { ...bp, images } } as Block
                        }
                        // If it's a layout slot (like leftImage), wrap in an img tag and sync into rows for sidebar_layout
                        if (['leftImage', 'leftContent', 'rightContent', 'content', 'col1Content', 'col2Content', 'col3Content', 'col4Content'].includes(effectivePropKey)) {
                            const isImageSlot = (effectivePropKey === 'leftImage');
                            if (isImageSlot && target?.type === 'sidebar_layout') {
                                const imgHtml = `<img src="${url}" alt="${alt || ''}" style="width:100%;height:auto;display:block;border-radius:8px;object-fit:cover;" />`;
                                return { ...b, props: { ...bp, [effectivePropKey]: imgHtml } } as Block
                            }
                            if (isImageSlot) {
                                const imgHtml = `<img src="${url}" alt="${alt || ''}" style="width:100%;height:auto;display:block;border-radius:8px;object-fit:cover;" />`;
                                return { ...b, props: { ...bp, [effectivePropKey]: imgHtml } } as Block
                            }
                            // Content/text slot: insert text/HTML directly (no img wrapper)
                            return { ...b, props: { ...bp, [effectivePropKey]: url } } as Block
                        }
                        return { ...b, props: { ...bp, [effectivePropKey]: url } } as Block
                    })
                    commitBlocks(next, blocks)
                    setActiveDropSlot(null); // Clear drop slot after insertion
                    setSelectedSubSlot(null); // Clear selected sub slot
                    return
                }
                const hasImageProp = 'src' in p || 'imageUrl' in p || 'logoUrl' in p || 'bgImage' in p
                if (hasImageProp) {
                    const next: Block[] = blocks.map(b => {
                        if (b.id !== targetBlockId) return b
                        if ('src' in p) return { ...b, props: { ...p, src: url, alt } } as Block
                        if ('imageUrl' in p) return { ...b, props: { ...p, imageUrl: url, alt } } as Block
                        if ('logoUrl' in p) return { ...b, props: { ...p, logoUrl: url } } as Block
                        if ('bgImage' in p) return { ...b, props: { ...p, bgImage: url } } as Block
                        return b
                    })
                    commitBlocks(next, blocks)
                    return
                }
            }
        }
        // No target — create a new image block
        const newBlock: Block = createBlock('image', canvasSettings)
            ; (newBlock.props as any).src = url
            ; (newBlock.props as any).alt = alt
        commitBlocks([...blocks, newBlock], blocks)
    }, [selectedId, commitBlocks, blocks, canvasSettings, activeDropSlot])

    // ── Token insert — appends placeholder to selected block's text ───────────
    // Uses module-level TEXT_PROP_KEYS (defined at top of file)
    const handleInsertToken = useCallback((token: string) => {
        // Fix #3: show feedback if no block selected
        if (!selectedId) {
            setTokenFeedback({ type: 'error', msg: 'Select a block first, then click Insert' })
            setTimeout(() => setTokenFeedback(null), 3000)
            return
        }
        const currentSelectedId = selectedId
        const next: Block[] = blocks.map(b => {
            if (b.id !== currentSelectedId) return b
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const p = b.props as any
            // Fix #2: find first matching text key across all block types
            const textKey = TEXT_PROP_KEYS.find(k => k in p && typeof p[k] === 'string')
            if (textKey) {
                const current = p[textKey] ?? ''
                // Fix #4: smart append — add space only if needed
                const separator = current && !current.endsWith(' ') ? ' ' : ''
                return {
                    ...b,
                    props: { ...p, [textKey]: `${current}${separator}${token}` },
                } as Block
            }
            return b
        })
        // No-op if no text field found on the selected block
        const before = blocks.find(b => b.id === currentSelectedId)
        const after = next.find(b => b.id === currentSelectedId)
        if (!before || !after || before.props === after.props) {
            setTokenFeedback({ type: 'error', msg: 'No text field on selected block' })
            setTimeout(() => setTokenFeedback(null), 3000)
            return
        }
        commitBlocks(next, blocks)
        // Fix #3+9: show success feedback
        setTokenFeedback({ type: 'success', msg: `${token} inserted` })
        setTimeout(() => setTokenFeedback(null), 2000)
    }, [selectedId, commitBlocks, blocks])

    // ── NEW: Canvas settings update ───────────────────────────────────────────
    const handleUpdateSettings = useCallback((settings: CanvasSettings) => {
        setCanvasSettings(settings)
        // Rebuild HTML with new settings; blocks themselves are unchanged
        const html = assembleDocument(blocks, settings)
        isInternalChange.current = true
        setCurrentHtml(html)
        onChange(stripInternalAttributes(html))
        setIsDirty(true)
        requestAnimationFrame(() => { isInternalChange.current = false })
    }, [blocks, onChange])

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
            // Alt+↑/↓ — move selected block
            if (e.altKey && selectedId) {
                if (e.key === 'ArrowUp') { e.preventDefault(); handleMoveUp(selectedId) }
                if (e.key === 'ArrowDown') { e.preventDefault(); handleMoveDown(selectedId) }
            }
            // Cmd+D — duplicate selected
            if (meta && e.key === 'd' && selectedId) {
                e.preventDefault(); handleDuplicate(selectedId)
            }
            // Cmd+L — lock/unlock selected
            if (meta && e.key === 'l' && selectedId) {
                e.preventDefault()
                setLockedIds(prev => {
                    const next = new Set(prev)
                    next.has(selectedId) ? next.delete(selectedId) : next.add(selectedId)
                    return next
                })
            }
            // Cmd+H — hide/show selected
            if (meta && e.key === 'h' && selectedId) {
                e.preventDefault()
                setHiddenIds(prev => {
                    const next = new Set(prev)
                    next.has(selectedId) ? next.delete(selectedId) : next.add(selectedId)
                    return next
                })
            }
            // Cmd+F — focus mode
            if (meta && e.key === 'f') {
                e.preventDefault(); setFocusMode(p => !p)
            }
            // ? — open shortcuts modal
            if (e.key === '?' && !meta && !['input', 'textarea', 'select'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
                e.preventDefault(); setShowShortcuts(p => !p)
            }
            // Ctrl+S — save
            if (meta && e.key === 's') {
                e.preventDefault(); handleSave()
            }
            // Panel shortcuts — only when not typing in an input
            const tag = (e.target as HTMLElement).tagName.toLowerCase()
            if (!meta && !e.altKey && !['input', 'textarea', 'select'].includes(tag)) {
                switch (e.key.toLowerCase()) {
                    case 'b': e.preventDefault(); setActiveTab('blocks'); setPanelOpen(true); break
                    case 'c': e.preventDefault(); setActiveTab('content'); setPanelOpen(true); break
                    case 't': e.preventDefault(); setActiveTab('templates'); setPanelOpen(true); break
                    case 'o': e.preventDefault(); setActiveTab('body'); setPanelOpen(true); break
                    case 'i': e.preventDefault(); setActiveTab('images'); setPanelOpen(true); break
                    case 'a': e.preventDefault(); setActiveTab('audit'); setPanelOpen(true); break
                    case 'k': e.preventDefault(); setActiveTab('tokens'); setPanelOpen(true); break
                    case 's': e.preventDefault(); setActiveTab('saved'); setPanelOpen(true); break
                }
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [handleUndo, handleRedo, handleDelete, selectedId])

    const selectedBlock = blocks.find(b => b.id === selectedId) ?? null
    const LAYOUT_BLOCK_TYPES = new Set(['two_column', 'three_column', 'four_column', 'full_width_section', 'container', 'sidebar_layout', 'spacer', 'border_box'])
    const isLayoutBlock = selectedBlock ? LAYOUT_BLOCK_TYPES.has(selectedBlock.type) : false

    // ── Content Drop Handler ───────────────────────────────────────────────
    // Wire up the "+ Add Content" button clicks via message listener
    useEffect(() => {
        const handler = (event: MessageEvent) => {
            if (event.data?.type === 'RIAZIFY_SELECT_SLOT') {
                const { propKey, blockId } = event.data;
                const VALID_SLOTS: DropSlot[] = ['leftImage', 'leftContent', 'rightContent', 'content', 'col1Content', 'col2Content', 'col3Content', 'col4Content'];
                if (VALID_SLOTS.includes(propKey)) {
                    setActiveDropSlot({ blockId, slot: propKey });
                    if (blockId) {
                        setSelectedId(blockId);
                        // Also set selectedSubSlot so ImagesTab knows which slot to use
                        setSelectedSubSlot(propKey);
                        const targetBlock = blocks.find(b => b.id === blockId);
                        // Image slot → Images tab; content slot → Content tab; full block → no auto switch
                        if (propKey.toLowerCase().includes('image') || propKey.toLowerCase().includes('leftimage')) {
                            setActiveTab('images');
                        } else if (propKey.toLowerCase().includes('content') || propKey.toLowerCase().includes('rightcontent')) {
                            setActiveTab('content');
                        } else {
                            setActiveTab('content');
                        }
                    } else {
                        setActiveTab('content');
                    }
                    setPanelOpen(true);
                }
            } else if (event.data?.type === 'RIAZIFY_EDIT_SLOT_CONTENT') {
                const { blockId, propKey, currentHtml } = event.data;
                if (blockId && propKey) {
                    setSelectedId(blockId);
                    setSelectedSubSlot(propKey);
                    // Try ref map first, then parse from stored HTML attributes
                    let slotBlock = slotBlockMapRef.current[`${blockId}__${propKey}`]
                    if (!slotBlock) {
                        const targetBlock = blocks.find(b => b.id === blockId)
                        const slotHtml = (targetBlock?.props as any)?.[propKey] ?? ''
                        const typeMatch = slotHtml.match(/data-slot-block-type="([^"]+)"/)
                        const propsMatch = slotHtml.match(/data-slot-block-props='([^']+)'/)
                        if (typeMatch) {
                            const parsedProps = propsMatch ? JSON.parse(propsMatch[1]) : {}
                            slotBlock = { id: `slot-${blockId}-${propKey}`, type: typeMatch[1] as BlockType, props: parsedProps }
                            slotBlockMapRef.current[`${blockId}__${propKey}`] = slotBlock
                        }
                    }
                    setActiveSlotEdit({ blockId, propKey, currentHtml: currentHtml || '', slotBlock });
                    // Send highlight message back to iframe so slot gets purple outline
                    const iframe = document.querySelector(`iframe[data-block-id="${blockId}"]`) as HTMLIFrameElement;
                    iframe?.contentWindow?.postMessage({ type: 'RIAZIFY_UPDATE_ACTIVE_SLOT', propKey }, '*');
                    const targetBlock = blocks.find(b => b.id === blockId);
                    if (targetBlock && (IMAGE_BLOCK_TYPES.has(targetBlock.type) || propKey.toLowerCase().includes('image'))) {
                        setActiveTab('images');
                    } else {
                        setActiveTab('content');
                    }
                    setPanelOpen(true);
                }
            } else if (event.data?.type === 'RIAZIFY_SELECTION_CHANGE') {
                if (event.data.hasSelection) {
                    setActiveSelection({
                        blockId: event.data.blockId,
                        propKey: event.data.propKey ?? null,
                        selectedText: event.data.selectedText ?? '',
                        selectedHtml: event.data.selectedHtml ?? '',
                    })
                } else {
                    // Delay clearing so toolbar button clicks can still read the selection
                    setTimeout(() => setActiveSelection(null), 300)
                }
            } else if (event.data?.type === 'RIAZIFY_COMMIT_HTML_EDIT') {
                const { blockId, html } = event.data;
                if (blockId && typeof html === 'string') {
                    setSelectedId(blockId);
                    const idx = blocks.findIndex(b => b.id === blockId);
                    if (idx >= 0) {
                        const target = blocks[idx];
                        const p = target.props as any;
                        // Find which prop holds the text and update with HTML
                        let targetKey = 'text';
                        for (const k of TEXT_PROP_KEYS) {
                            if (p[k] !== undefined && typeof p[k] === 'string') {
                                targetKey = k;
                                break;
                            }
                        }
                        // For items array (bullet_list, numbered_list) find which item changed
                        if (Array.isArray(p.items)) {
                            // We can't know which item — store as-is for now
                            // Future: pass itemIndex from iframe
                        } else {
                            const updatedProps = { ...p, [targetKey]: html };
                            const updatedBlock = { ...target, props: updatedProps };
                            const newBlocks = [...blocks];
                            newBlocks[idx] = updatedBlock;
                            commitBlocks(newBlocks, blocks);
                        }
                    }
                }
            } else if (event.data?.type === 'RIAZIFY_COMMIT_TEXT_EDIT') {
                const { blockId, text } = event.data;
                if (blockId && typeof text === 'string') {
                    // Ensure block is selected and Content panel is open
                    setSelectedId(blockId);
                    setActiveTab('content');
                    setPanelOpen(true);

                    const idx = blocks.findIndex(b => b.id === blockId);
                    if (idx >= 0) {
                        const target = blocks[idx];
                        const p = target.props as any;
                        // Find the first matching text-bearing key that exists on this block
                        let targetKey = 'text';
                        for (const k of TEXT_PROP_KEYS) {
                            if (p[k] !== undefined && typeof p[k] === 'string') {
                                targetKey = k;
                                break;
                            }
                        }
                        const updatedProps = { ...p, [targetKey]: text };
                        const updatedBlock = { ...target, props: updatedProps };
                        const newBlocks = [...blocks];
                        newBlocks[idx] = updatedBlock;
                        commitBlocks(newBlocks, blocks);
                    }
                }
            } else if (event.data?.type === 'RIAZIFY_DROP_BLOCK') {
                const { propKey, blockType, blockId } = event.data;
                const VALID_SLOTS: DropSlot[] = ['leftImage', 'leftContent', 'rightContent', 'content', 'col1Content', 'col2Content', 'col3Content', 'col4Content'];
                if (VALID_SLOTS.includes(propKey) && blockType) {
                    const targetBlockId = blockId || activeDropSlot?.blockId;
                    const idx = blocks.findIndex(b =>
                        b.id === targetBlockId &&
                        b.props &&
                        typeof (b.props as any)[propKey] === 'string'
                    );
                    if (idx >= 0) {
                        const target = blocks[idx];
                        const newBlock = createBlock(blockType as BlockType, canvasSettings);
                        const def = getDefinition(blockType as BlockType);
                        const rawHtml = def ? def.toHtml(newBlock.props, newBlock.id) : '';
                        const newHtml = `<div data-canvas-dropzone="${propKey}" data-slot-block-type="${blockType}" data-slot-block-props='${JSON.stringify(newBlock.props)}'>${rawHtml}</div>`;
                        const updatedProps = { ...(target.props as any), [propKey]: newHtml };
                        const updatedBlock = { ...target, props: updatedProps } as any;
                        const newBlocks = [...blocks];
                        newBlocks[idx] = updatedBlock;
                        commitBlocks(newBlocks, blocks);
                        setActiveDropSlot(null);
                        setSelectedId(target.id);
                        setDraggedType(null);
                        slotBlockMapRef.current[`${target.id}__${propKey}`] = newBlock;
                    }
                }
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, [blocks, canvasSettings, commitBlocks]);

    // ── Active Slot Visual Feedback ─────────────────────────────────
    // Notify iframe(s) to highlight the active dropzone when a slot is selected,
    // and clear all other iframes' highlights.
    const highlightedSlotRef = useRef<{ blockId: string; slot: string } | null>(null)
    useEffect(() => {
        const slotState = activeDropSlot

        // Always broadcast a clear or update to ALL iframes so only the correct block/slot stays highlighted
        document.querySelectorAll('iframe[data-block-id]').forEach(el => {
            try {
                const iframe = el as HTMLIFrameElement
                const bId = iframe.getAttribute('data-block-id')
                const targetSlot = (slotState && bId === slotState.blockId) ? slotState.slot : null
                iframe.contentWindow?.postMessage({
                    type: 'RIAZIFY_UPDATE_ACTIVE_SLOT',
                    propKey: targetSlot
                }, '*')
            } catch { }
        })

        if (!slotState) {
            highlightedSlotRef.current = null
            return
        }

        highlightedSlotRef.current = slotState

        const sendHighlight = () => {
            const iframe = document.querySelector(`iframe[data-block-id="${slotState.blockId}"]`) as HTMLIFrameElement
            if (!iframe) return false
            try {
                iframe.contentWindow?.postMessage({ type: 'RIAZIFY_UPDATE_ACTIVE_SLOT', propKey: slotState.slot }, '*')
                return true
            } catch {
                return false
            }
        }

        if (!sendHighlight()) {
            const retry = () => {
                if (!sendHighlight()) setTimeout(retry, 200)
            }
            setTimeout(retry, 200)
        }
    }, [activeDropSlot, blocks])

    // ── Search: compute matching block ids + ordered match list ───────────────
    // Single source of truth — both the canvas dimming and the match counter
    // use this memo so the two can never disagree.
    const matchedIds = useMemo(() => {
        if (!canvasSearch.trim()) return null // null = "no search, all visible"
        const set = new Set<string>()
        for (const b of blocks) {
            if (blockMatchesQuery(b, canvasSearch)) set.add(b.id)
        }
        return set
    }, [blocks, canvasSearch])

    // When the user changes the search, auto-scroll the canvas to the first match
    const lastScrolledQuery = useRef('')
    useEffect(() => {
        const q = canvasSearch.trim()
        if (!q) { lastScrolledQuery.current = ''; return }
        if (q === lastScrolledQuery.current) return // only scroll when query changes
        lastScrolledQuery.current = q
        const firstMatchId = blocks.find(b => blockMatchesQuery(b, q))?.id
        if (!firstMatchId) return
        // Find the block's DOM node by data attribute and scroll it into view
        requestAnimationFrame(() => {
            const node = canvasContainerRef.current?.querySelector(
                `[data-block-id="${firstMatchId}"]`
            ) as HTMLElement | null
            node?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        })
    }, [canvasSearch, blocks])

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
                undoDepth={undoStack.length}
                livePreview={livePreview}
                focusMode={focusMode}
                canvasZoom={canvasZoom}
                templateName={templateName}
                isDirty={isDirty}
                currentTemplateId={currentTemplateId}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onToggleLivePreview={() => setLivePreview(p => !p)}
                onToggleFocusMode={() => setFocusMode(p => !p)}
                onZoomChange={setCanvasZoom}
                deviceWidth={deviceWidth}
                onDeviceChange={setDeviceWidth}
                onTemplateNameChange={setTemplateName}
                onSave={handleSave}
                saveStatus={saveStatus}
                onExport={handleExport}
                onPublish={onPublish}
                publishStatus={publishStatus}
                toolbarSlot={toolbarSlot}
                onBack={onBack}
                onClearAll={() => {
                    if (blocks.length === 0) return
                    setShowClearConfirm(true)
                }}
            />

            {/* ── Smart Clear All Confirmation ──────────────────────────────────────────── */}
            {showClearConfirm && (
                <div style={{
                    position: 'fixed', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: '#fff', padding: 32, borderRadius: 12,
                    maxWidth: 480, width: '90%', textAlign: 'center',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
                    zIndex: 9999,
                }}>
                    <h3 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 700, color: '#1f2937' }}>Clear All Blocks</h3>
                    <p style={{ margin: '0 0 12px', fontSize: 14, color: '#6b7280', lineHeight: 1.5 }}>
                        This will delete all {blocks.length} block{blocks.length !== 1 ? 's' : ''}.<br />
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>This cannot be undone.</span>
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <button onClick={() => setShowClearConfirm(false)} style={{ padding: '6px 60px', border: `1px solid ${C.border}`, borderRadius: 8, backgroundColor: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}>Cancel</button>
                        <button onClick={() => { commitBlocks([], blocks); setSelectedId(null); setCurrentTemplateId(null); setIsDirty(false); setTemplateName('My Template'); setLockedIds(new Set()); setHiddenIds(new Set()); setShowClearConfirm(false); }} style={{ padding: '6px 60px', border: 'none', borderRadius: 8, backgroundColor: '#ef4444', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>Clear All</button>
                    </div>
                </div>
            )}

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

                {/* LEFT — Sidebar Panel — hidden in focus mode */}
                {!focusMode && <SidebarPanel
                    activeTab={activeTab}
                    isOpen={panelOpen}
                    // BlockLibrary
                    onAddBlock={handleInsertOrAssignBlock}
                    onDragStart={setDraggedType}
                    onDragEnd={() => setDraggedType(null)}
                    draggedType={draggedType}
                    // TemplatesTab
                    onInsertTemplate={handleInsertTemplate}
                    // BodySettings
                    canvasSettings={canvasSettings}
                    onUpdateSettings={handleUpdateSettings}
                    // ImagesTab — direct asset focus (no slot cards)
                    onInsertImage={handleInsertImage}
                    selectedId={selectedId}
                    selectedSubSlot={selectedSubSlot}
                    blocks={blocks}
                    // AuditTab
                    html={currentHtml}
                    blockCount={blocks.length}
                    // TokensTab
                    placeholders={placeholders}
                    onInsertToken={handleInsertToken}
                    tokenFeedback={tokenFeedback}
                    selectedBlockLabel={selectedBlock ? (getDefinition(selectedBlock.type)?.label ?? null) : null}
                    onLoadTemplate={handleLoadTemplate}
                />}

                {/* CENTRE — Canvas or Live Preview */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                    {/* ── BlockToolbar — only when not in live preview ── */}
                    {!livePreview && (
                        <div style={{ display: 'flex', alignItems: 'stretch' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <BlockToolbar
                                    blockType={isLayoutBlock ? undefined : (selectedBlock?.type ?? undefined)}
                                    blockProps={isLayoutBlock ? (activeSlotEdit ? {} : null) : (selectedBlock?.props ?? null)}
                                    activeSelection={activeSelection}
                                    onChange={(newProps) => {
                                        if (selectedId && !isLayoutBlock) handleBlockChange({ ...selectedBlock!, props: newProps });
                                    }}
                                    slotEdit={activeSlotEdit}
                                    onClearSlot={(blockId, propKey) => handleClearSlot(blockId, propKey)}
                                    onFormatSlot={(blockId, propKey, format, value, selection) => handleFormatSlot(blockId, propKey, format, value, selection)}
                                    onReplaceSlot={() => {
                                        if (activeSlotEdit) {
                                            setActiveDropSlot({ blockId: activeSlotEdit.blockId, slot: activeSlotEdit.propKey as any })
                                        }
                                        // Bug #5 fix: clear stale slot edit so old props don't linger
                                        setActiveSlotEdit(null)
                                        setActiveTab('content')
                                        setPanelOpen(true)
                                    }}
                                    persistent
                                />
                            </div>
                            {/* Eye icon — sits at right end of BlockToolbar row */}
                            <button
                                onClick={() => setLivePreview(p => !p)}
                                title="Live Preview"
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: 40, flexShrink: 0,
                                    border: 'none',
                                    borderLeft: '1px solid #e2e8f0',
                                    backgroundColor: '#ffffff',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                            </button>
                        </div>
                    )}
                    {/* Eye icon row — always visible when in live preview */}
                    {livePreview && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', flexShrink: 0 }}>
                            <button
                                onClick={() => setLivePreview(p => !p)}
                                title="Exit Live Preview"
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: 40, height: 40, flexShrink: 0,
                                    border: 'none',
                                    borderLeft: '1px solid #e2e8f0',
                                    backgroundColor: '#f3eeff',
                                    color: '#7530fb',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                            </button>
                        </div>
                    )}
                    {/* ── Canvas or Live Preview ── */}
                    {livePreview ? (
                        <LivePreview
                            html={currentHtml}
                            deviceWidth={deviceWidth}
                            onDeviceChange={setDeviceWidth}
                        />
                    ) : (
                        <div
                            ref={canvasContainerRef}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}
                        >
                            <Canvas
                                blocks={blocks}
                                zoom={canvasZoom}
                                matchedIds={matchedIds}
                                lockedIds={lockedIds}
                                hiddenIds={hiddenIds}
                                selectedId={selectedId}
                                draggedType={draggedType}
                                deviceWidth={deviceWidth}
                                activeCategory={activeCategory}
                                onSelect={handleSelectBlock}
                                onDrop={handleDrop}
                                onReorder={handleReorder}
                                onDelete={handleDelete}
                                onDuplicate={handleDuplicate}
                                onMoveUp={handleMoveUp}
                                onMoveDown={handleMoveDown}
                                onCopyStyle={handleCopyStyle}
                                onPasteStyle={handlePasteStyle}
                                hasCopiedStyle={copiedStyle !== null}
                                onToggleLock={handleToggleLock}
                                onToggleHide={handleToggleHide}
                                onAddBlock={handleInsertOrAssignBlock}
                                onAddBlockBelow={handleAddBlockBelow}
                                hasActiveSlot={activeDropSlot !== null}
                                onLoadTemplate={handleInsertTemplate}
                                onDeselect={() => {
                                    setSelectedId(null)
                                    setActiveSlotEdit(null)
                                }}
                            />
                        </div>
                    )}\
                </div>

                {/* RIGHT — Properties Panel */}
                {!focusMode && (
                    activeSlotEdit?.slotBlock ? (
                        <PropertiesPanel
                            block={activeSlotEdit.slotBlock}
                            placeholders={placeholders}
                            onChange={(updatedSlotBlock) => {
                                // Apply prop changes back to slot HTML and keep
                                // activeSlotEdit.slotBlock in sync so the panel
                                // re-renders with the latest props (#3)
                                const def = getDefinition(activeSlotEdit.slotBlock!.type)
                                if (!def) return
                                const newHtml = def.toHtml(updatedSlotBlock.props, activeSlotEdit.slotBlock!.id)
                                handleFormatSlot(activeSlotEdit.blockId, activeSlotEdit.propKey, '__html__', newHtml)
                                slotBlockMapRef.current[`${activeSlotEdit.blockId}__${activeSlotEdit.propKey}`] = updatedSlotBlock
                                // ← FIX #3: update slotBlock in activeSlotEdit so
                                // PropertiesPanel receives fresh props on next render
                                setActiveSlotEdit(prev =>
                                    prev ? { ...prev, slotBlock: updatedSlotBlock, currentHtml: newHtml } : null
                                )
                            }}
                            onDeselect={() => setActiveSlotEdit(null)}
                        />
                    ) : activeSlotEdit ? (
                        <div style={{
                            width: 280, borderLeft: '1px solid #e2e8f0',
                            backgroundColor: '#fff', padding: '20px 16px',
                            fontFamily: 'DM Sans, sans-serif',
                            display: 'flex', flexDirection: 'column', gap: 12,
                        }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' }}>
                                Slot Content
                            </div>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '10px 12px', backgroundColor: '#f3eeff',
                                borderRadius: 8, border: '1px solid #c4b5fd',
                            }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#7530fb', flexShrink: 0 }} />
                                <span style={{ fontSize: 12, fontWeight: 600, color: '#1e1535' }}>
                                    {activeSlotEdit.propKey
                                        .replace(/([A-Z])/g, ' $1')
                                        .replace(/^./, s => s.toUpperCase())
                                        .trim()}
                                </span>
                            </div>
                            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                                Use the toolbar above to format this slot's content — bold, italic, alignment, colour and more.
                            </p>
                            <button
                                onClick={() => setActiveSlotEdit(null)}
                                style={{
                                    marginTop: 4, padding: '8px 12px', borderRadius: 6,
                                    border: '1px solid #e2e8f0', backgroundColor: '#f8fafc',
                                    fontSize: 12, fontWeight: 600, color: '#64748b',
                                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                }}
                            >
                                ← Back to Layout
                            </button>
                        </div>
                    ) : (
                        <PropertiesPanel
                            block={selectedBlock}
                            placeholders={placeholders}
                            onChange={handleBlockChange}
                            onDeselect={() => setSelectedId(null)}
                        />
                    )
                )}
            </div>

            {/* ── Bottom status bar ── */}
            <StatusBar
                blockCount={blocks.length}
                selectedBlock={selectedBlock}
                parseStrategy={parseResult?.strategy ?? null}
                auditErrors={auditErrors}
                livePreview={livePreview}
                lockedIds={lockedIds}
                hiddenIds={hiddenIds}
                canvasZoom={canvasZoom}
                templateName={templateName}
                onShowShortcuts={() => setShowShortcuts(true)}
            />

            {/* ── Keyboard shortcuts modal ── */}
            {showShortcuts && (
                <div
                    onClick={() => setShowShortcuts(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 99999,
                        backgroundColor: 'rgba(0,0,0,0.45)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: 14,
                            padding: '24px 28px',
                            width: 480,
                            maxWidth: '92vw',
                            boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
                            fontFamily: 'DM Sans, sans-serif',
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <div>
                                <p style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: C.dark }}>
                                    Keyboard Shortcuts
                                </p>
                                <p style={{ margin: '2px 0 0', fontSize: 11, color: C.muted }}>
                                    Ctrl on Windows · ⌘ on Mac
                                </p>
                            </div>
                            <button
                                onClick={() => setShowShortcuts(false)}
                                style={{
                                    width: 28, height: 28, borderRadius: 7,
                                    border: `1px solid ${C.border}`,
                                    backgroundColor: C.bg,
                                    cursor: 'pointer', fontSize: 14,
                                    color: C.muted, display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                }}
                            >×</button>
                        </div>

                        {/* Two-column grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px' }}>
                            {[
                                // ── Editing ──
                                { keys: ['Ctrl', 'Z'], label: 'Undo', group: true },
                                { keys: ['Ctrl', 'Shift', 'Z'], label: 'Redo' },
                                { keys: ['Ctrl', 'S'], label: 'Save template' },
                                { keys: ['Ctrl', 'D'], label: 'Duplicate block' },
                                { keys: ['Del'], label: 'Delete block' },
                                { keys: ['Esc'], label: 'Deselect block' },
                                // ── Block movement ──
                                { keys: ['Alt', '↑'], label: 'Move block up' },
                                { keys: ['Alt', '↓'], label: 'Move block down' },
                                // ── Block state ──
                                { keys: ['Ctrl', 'L'], label: 'Lock / unlock block' },
                                { keys: ['Ctrl', 'H'], label: 'Hide / show block' },
                                // ── View ──
                                { keys: ['Ctrl', 'F'], label: 'Focus mode' },
                                { keys: ['?'], label: 'This shortcut list' },
                                // ── Panels ──
                                { keys: ['B'], label: 'Blocks panel' },
                                { keys: ['C'], label: 'Content panel' },
                                { keys: ['T'], label: 'Templates panel' },
                                { keys: ['O'], label: 'Body settings' },
                                { keys: ['I'], label: 'Images panel' },
                                { keys: ['A'], label: 'Audit panel' },
                                { keys: ['K'], label: 'Tokens panel' },
                                { keys: ['S'], label: 'Saved panel' },
                            ].map(({ keys, label }) => (
                                <div key={label} style={{
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '6px 0',
                                    borderBottom: `1px solid ${C.border}`,
                                }}>
                                    <span style={{ fontSize: 12, color: C.body }}>{label}</span>
                                    <div style={{ display: 'flex', gap: 3, flexShrink: 0, marginLeft: 8 }}>
                                        {keys.map((k, i) => (
                                            <kbd key={i} style={{
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                minWidth: 22, height: 20,
                                                padding: '0 5px',
                                                backgroundColor: C.bg,
                                                border: `1px solid ${C.border}`,
                                                borderBottomWidth: 2,
                                                borderRadius: 4,
                                                fontSize: 10, fontWeight: 600,
                                                color: C.dark,
                                                fontFamily: 'DM Sans, sans-serif',
                                            }}>
                                                {k}
                                            </kbd>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer hint */}
                        <p style={{ margin: '14px 0 0', fontSize: 10, color: C.muted, textAlign: 'center' }}>
                            Press <kbd style={{ padding: '1px 4px', borderRadius: 3, border: `1px solid ${C.border}`, fontSize: 10, backgroundColor: C.bg }}>?</kbd> or click the ? button anytime to reopen this
                        </p>
                    </div>
                </div>
            )}

            {/* ── Inline Toolbar Overlay ── */}
            {inlineToolbar?.visible && (
                <div style={{
                    position: 'fixed',
                    top: inlineToolbar.y,
                    left: inlineToolbar.x,
                    zIndex: 99999,
                    background: '#fff',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                    padding: 4
                }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '2px 6px' }}>
                        <button onClick={() => setInlineToolbar(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: C.muted }}>×</button>
                    </div>
                    <RichEditorToolbar
                        activeFormats={(() => {
                            const block = blocks.find(b => b.id === inlineToolbar.blockId);
                            if (!block) return new Set();
                            const p = block.props as any;
                            const text = p[inlineToolbar.propKey] || inlineToolbar.text || '';
                            const formats = new Set<string>();
                            if (/<strong>|<b>/i.test(text)) formats.add('bold');
                            if (/<em>|<i>/i.test(text)) formats.add('italic');
                            if (/<u>/i.test(text)) formats.add('underline');
                            if (/<h2>/i.test(text)) formats.add('h2');
                            if (/<h3>/i.test(text)) formats.add('h3');
                            if (/<p>/i.test(text)) formats.add('p');
                            if (/<ul>|<li>/i.test(text)) formats.add('ul');
                            if (/<ol>|<li>/i.test(text)) formats.add('ol');
                            return formats;
                        })()}
                        onExec={(cmd, val) => {
                            const block = blocks.find(b => b.id === inlineToolbar.blockId);
                            if (!block) return;
                            const p = block.props as any;
                            let currentText = p[inlineToolbar.propKey] || inlineToolbar.text;

                            if (cmd === 'bold') {
                                const strong = /<strong>|<b>/i.test(currentText);
                                currentText = strong
                                    ? currentText.replace(/<\/?strong>|<\/?b>/gi, '')
                                    : `<strong>${currentText}</strong>`;
                            } else if (cmd === 'italic') {
                                const em = /<em>|<i>/i.test(currentText);
                                currentText = em
                                    ? currentText.replace(/<\/?em>|<\/?i>/gi, '')
                                    : `<em>${currentText}</em>`;
                            } else if (cmd === 'underline') {
                                const u = /<u>/i.test(currentText);
                                currentText = u
                                    ? currentText.replace(/<\/?u>/gi, '')
                                    : `<u>${currentText}</u>`;
                            } else if (cmd === 'formatBlock') {
                                const tag = (val || '<p>').replace(/<\/?/g, '');
                                const openTag = `<${tag}>`;
                                const closeTag = `</${tag}>`;
                                const hasOpen = currentText.startsWith(openTag);
                                const hasClose = currentText.endsWith(closeTag);
                                if (hasOpen && hasClose) {
                                    currentText = currentText.slice(openTag.length, -closeTag.length);
                                } else {
                                    currentText = openTag + currentText + closeTag;
                                }
                            }

                            const updatedBlock = {
                                ...block,
                                props: { ...p, [inlineToolbar.propKey]: currentText }
                            };
                            handleBlockChange(updatedBlock);
                        }}
                        descPreview="edit"
                        onPreview={() => { }}
                    />
                </div>
            )}
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
    undoDepth: number
    livePreview: boolean
    focusMode: boolean
    canvasZoom: number
    deviceWidth: 'desktop' | 'tablet' | 'mobile'
    onDeviceChange: (d: 'desktop' | 'tablet' | 'mobile') => void
    templateName: string
    isDirty: boolean
    currentTemplateId: string | null
    onUndo: () => void
    onRedo: () => void
    onToggleLivePreview: () => void
    onToggleFocusMode: () => void
    onZoomChange: (z: number) => void
    onTemplateNameChange: (name: string) => void
    onSave: () => void
    saveStatus: 'idle' | 'saving' | 'saved' | 'error'
    onExport: () => void
    onClearAll: () => void
    onPublish?: () => void
    publishStatus?: 'idle' | 'publishing' | 'published'
    toolbarSlot?: React.ReactNode
    onBack?: () => void
}

function EditorToolbar({
    blockCount, selectedBlock, canUndo, canRedo, undoDepth,
    livePreview, focusMode, canvasZoom, templateName,
    isDirty, currentTemplateId, deviceWidth, onDeviceChange,
    onUndo, onRedo, onToggleLivePreview, onToggleFocusMode,
    onZoomChange, onTemplateNameChange, onSave, saveStatus, onExport, onClearAll,
    onPublish, publishStatus = 'idle', toolbarSlot, onBack,
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
            {/* Left — back + title + template name + undo/redo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                {/* Back button */}
                {onBack && (
                    <>
                        <button
                            onClick={onBack}
                            title="Back to Design Studio"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '4px 10px',
                                border: `1px solid ${C.border}`, borderRadius: 7,
                                backgroundColor: 'transparent', cursor: 'pointer',
                                fontFamily: 'DM Sans, sans-serif', fontSize: 11,
                                color: C.secondary, whiteSpace: 'nowrap', flexShrink: 0,
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.bg; e.currentTarget.style.color = C.dark }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.secondary }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                        </button>
                        <div style={{ width: 1, height: 20, backgroundColor: C.border }} />
                        <span style={{
                            fontFamily: 'Syne, sans-serif', fontWeight: 800,
                            fontSize: 15, color: C.primary,
                            flexShrink: 0, whiteSpace: 'nowrap',
                            letterSpacing: '-0.2px',
                        }}>
                            Template Studio
                        </span>
                        <div style={{ width: 1, height: 20, backgroundColor: C.border }} />
                    </>
                )}

                {/* Template name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                            value={templateName}
                            onChange={e => onTemplateNameChange(e.target.value)}
                            maxLength={50}
                            style={{
                                fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700,
                                color: C.dark, background: 'transparent', border: 'none',
                                outline: 'none', width: 200,
                                borderBottom: `1px solid transparent`,
                                padding: '2px 4px', borderRadius: 4,
                                cursor: 'text',
                                transition: 'border-color 0.15s',
                            }}
                            onFocus={e => e.currentTarget.style.borderBottomColor = C.border}
                            onBlur={e => e.currentTarget.style.borderBottomColor = 'transparent'}
                            placeholder=""
                        />
                        {/* Animated placeholder — only shows when input is empty */}
                        {!templateName && (
                            <span
                                style={{
                                    position: 'absolute',
                                    left: 4,
                                    fontFamily: 'Syne, sans-serif',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: C.muted,
                                    pointerEvents: 'none',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    width: 160,
                                    animation: 'typingPlaceholder 2.4s steps(14, end) infinite',
                                }}
                            >
                                Name your design…
                            </span>
                        )}
                        <style>{`
                            @keyframes typingPlaceholder {
                                0%   { width: 0ch; opacity: 1; }
                                60%  { width: 14ch; opacity: 1; }
                                80%  { width: 14ch; opacity: 1; }
                                90%  { width: 14ch; opacity: 0; }
                                100% { width: 0ch; opacity: 0; }
                            }
                        `}</style>
                    </div>
                    {/* Dirty indicator — appears whenever there are unsaved changes */}
                    {isDirty && (
                        <span
                            title="Unsaved changes"
                            style={{
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: 14, fontWeight: 700,
                                color: C.warning, lineHeight: 1,
                            }}>•</span>
                    )}
                </div>

                <div style={{ width: 1, height: 20, backgroundColor: C.border }} />

                <ToolbarButton onClick={onUndo} disabled={!canUndo} title={`Undo (Cmd+Z) · ${undoDepth} step${undoDepth !== 1 ? 's' : ''} available`}>
                    <Undo2 size={14} />
                </ToolbarButton>
                {canUndo && (
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: C.muted, marginLeft: -4 }}>
                        {undoDepth}
                    </span>
                )}
                <ToolbarButton onClick={onRedo} disabled={!canRedo} title="Redo (Cmd+Shift+Z)">
                    <Redo2 size={14} />
                </ToolbarButton>

                <div style={{ width: 1, height: 20, backgroundColor: C.border }} />

                {/* Block count pill */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '3px 10px',
                    backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: 20,
                }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.secondary }}>
                        {blockCount} block{blockCount !== 1 ? 's' : ''}
                    </span>
                    {selectedBlock && (
                        <>
                            <span style={{ color: C.border }}>·</span>
                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.primary, fontWeight: 600 }}>
                                {getDefinition(selectedBlock.type)?.label}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Right — zoom + focus + clear */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {/* Device width toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '2px', backgroundColor: '#f1f5f9', borderRadius: 6 }}>
                    {([
                        { id: 'desktop', Icon: Monitor, label: 'Desktop (700px)' },
                        { id: 'tablet', Icon: Tablet, label: 'Tablet (480px)' },
                        { id: 'mobile', Icon: Smartphone, label: 'Mobile (375px)' },
                    ] as const).map(({ id, Icon, label }) => (
                        <button
                            key={id}
                            title={label}
                            onClick={() => onDeviceChange(id)}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 26, height: 26, border: 'none', borderRadius: 4,
                                backgroundColor: deviceWidth === id ? '#ffffff' : 'transparent',
                                color: deviceWidth === id ? '#7530fb' : '#94a3b8',
                                cursor: 'pointer',
                                boxShadow: deviceWidth === id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.15s',
                            }}
                        >
                            <Icon size={13} />
                        </button>
                    ))}
                </div>

                <div style={{ width: 1, height: 20, backgroundColor: C.border }} />

                {/* Zoom */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ToolbarButton onClick={() => onZoomChange(Math.max(50, canvasZoom - 10))} title="Zoom out" disabled={canvasZoom <= 50}>
                        <span style={{ fontSize: 14, lineHeight: 1 }}>−</span>
                    </ToolbarButton>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: C.secondary, minWidth: 36, textAlign: 'center' }}>
                        {canvasZoom}%
                    </span>
                    <ToolbarButton onClick={() => onZoomChange(Math.min(150, canvasZoom + 10))} title="Zoom in" disabled={canvasZoom >= 150}>
                        <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
                    </ToolbarButton>
                    {canvasZoom !== 100 && (
                        <ToolbarButton onClick={() => onZoomChange(100)} title="Reset zoom">
                            <span style={{ fontSize: 10 }}>100%</span>
                        </ToolbarButton>
                    )}
                </div>

                <div style={{ width: 1, height: 20, backgroundColor: C.border }} />

                {/* Focus mode */}
                <ToolbarButton onClick={onToggleFocusMode} title={focusMode ? 'Exit focus mode (Cmd+F)' : 'Focus mode — hide panels (Cmd+F)'}>
                    <span style={{ fontSize: 13, color: focusMode ? C.primary : C.secondary }}>{focusMode ? '⊡' : '⊞'}</span>
                </ToolbarButton>

                <div style={{ width: 1, height: 20, backgroundColor: C.border }} />

                {/* Clear all */}
                <button
                    onClick={onClearAll}
                    disabled={blockCount === 0}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '4px 12px',
                        border: `1px solid ${blockCount === 0 ? C.border : '#fecaca'}`,
                        borderRadius: 7, backgroundColor: 'transparent',
                        color: blockCount === 0 ? C.muted : C.danger,
                        fontFamily: 'DM Sans, sans-serif', fontSize: 11,
                        cursor: blockCount === 0 ? 'default' : 'pointer',
                        opacity: blockCount === 0 ? 0.5 : 1, transition: 'all 0.15s',
                    }}
                >
                    <Trash2 size={12} />
                    Clear all
                </button>

                <div style={{ width: 1, height: 20, backgroundColor: C.border }} />

                {/* Save button — moved to right side, between Clear all and Publish */}
                <button
                    onClick={onSave}
                    disabled={blockCount === 0 || saveStatus === 'saving' || (saveStatus === 'idle' && !isDirty && currentTemplateId !== null)}
                    title={currentTemplateId
                        ? 'Save changes to this template'
                        : 'Save as a new template'}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '5px 14px',
                        border: `1px solid ${saveStatus === 'saved' ? '#86efac' :
                            saveStatus === 'error' ? '#fecaca' :
                                (isDirty || !currentTemplateId) && blockCount > 0 ? C.primary : C.border
                            }`,
                        borderRadius: 8,
                        backgroundColor:
                            saveStatus === 'saved' ? '#dcfce7' :
                                saveStatus === 'error' ? '#fee2e2' :
                                    (isDirty || !currentTemplateId) && blockCount > 0 ? C.primary : 'transparent',
                        color:
                            saveStatus === 'saved' ? '#16a34a' :
                                saveStatus === 'error' ? '#ef4444' :
                                    (isDirty || !currentTemplateId) && blockCount > 0 ? '#ffffff' : C.muted,
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: 12, fontWeight: saveStatus !== 'idle' ? 700 : 600,
                        cursor: blockCount === 0 || saveStatus === 'saving' ? 'default' : 'pointer',
                        opacity: blockCount === 0 ? 0.5 : 1,
                        transition: 'all 0.2s',
                        flexShrink: 0,
                    }}
                >
                    <CheckCircle2 size={13} />
                    {saveStatus === 'saving' ? 'Saving…' :
                        saveStatus === 'saved' ? 'Saved ✓' :
                            saveStatus === 'error' ? 'Error — retry' :
                                currentTemplateId ? 'Save changes' : 'Save'}
                </button>

                {/* Slot — parent injects the Publish ▾ dropdown here */}
                {toolbarSlot && (
                    <>
                        <div style={{ width: 1, height: 20, backgroundColor: C.border }} />
                        {toolbarSlot}
                    </>
                )}
            </div>
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
    blockCount, selectedBlock, parseStrategy, auditErrors,
    livePreview, lockedIds, hiddenIds, canvasZoom, templateName,
    onShowShortcuts,
}: {
    blockCount: number
    selectedBlock: Block | null
    parseStrategy: ParseResult['strategy'] | null
    auditErrors: number
    livePreview: boolean
    lockedIds: Set<string>
    hiddenIds: Set<string>
    canvasZoom: number
    templateName: string
    onShowShortcuts?: () => void
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
                        {getDefinition(selectedBlock.type)?.label}
                        {lockedIds?.has(selectedBlock.id) ? ' · 🔒' : ''}
                        {hiddenIds?.has(selectedBlock.id) ? ' · Hidden' : ''}
                    </span>
                )}
                {canvasZoom !== 100 && (
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                        {canvasZoom}%
                    </span>
                )}
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                    {blockCount} block{blockCount !== 1 ? 's' : ''}
                    {lockedIds?.size ? ` · ${lockedIds.size} locked` : ''}
                    {hiddenIds?.size ? ` · ${hiddenIds.size} hidden` : ''}
                </span>
                <button
                    onClick={onShowShortcuts}
                    title="Keyboard shortcuts (?)"
                    style={{
                        width: 18, height: 18, borderRadius: '50%',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: 10, fontWeight: 700,
                        cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'DM Sans, sans-serif',
                        padding: 0, lineHeight: 1,
                        transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.18)'
                            ; (e.currentTarget as HTMLButtonElement).style.color = '#fff'
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.08)'
                            ; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)'
                    }}
                >
                    ?
                </button>
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
