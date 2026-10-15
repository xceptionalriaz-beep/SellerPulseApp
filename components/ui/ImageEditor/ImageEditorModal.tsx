'use client'
// components/ui/ImageEditor/ImageEditorModal.tsx

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
    Undo2, Redo2, ZoomIn, ZoomOut,
    SlidersHorizontal, Sliders, Crop, Maximize2,
    RotateCw, Pencil, Type, Square, Image as ImageIcon, Download, Tag,
} from 'lucide-react'
import { ToolId, ImageEditorState, DEFAULT_STATE, CropRect, DrawSettings, TextOverlay, StickerItem, WatermarkSettings } from './types'
import { SHAPE_DIMS, stickerToDataUrl } from './stickerHelpers'
import { exportToDataUrl } from './exportHelpers'

// ── Tool panel imports ─────────────────────────────────────────
import AdjustTool from './tools/AdjustTool'
import FilterTool from './tools/FilterTool'
import CropTool from './tools/CropTool'
import ResizeTool from './tools/ResizeTool'
import RotateTool from './tools/RotateTool'
import DrawTool from './tools/DrawTool'
import TextTool from './tools/TextTool'
import FrameTool from './tools/FrameTool'
import WatermarkTool from './tools/WatermarkTool'
import StickerTool from './tools/StickerTool'
import ExportTool from './tools/ExportTool'

// ── Design tokens ──────────────────────────────────────────────
const C = {
    bg: '#f0f0f0',
    surface: '#ffffff',
    border: '#e5e7eb',
    toolBg: '#fafafa',
    toolActive: '#7530fb',
    toolActiveT: '#ffffff',
    toolHov: '#f3eeff',
    toolHovT: '#7530fb',
    toolDefault: '#6b7280',
    panelHdr: '#f9fafb',
    dark: '#111827',
    body: '#374151',
    muted: '#9ca3af',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    primaryHov: '#6020e0',
}

// ── Aspect ratio values ────────────────────────────────────────
const ASPECT_RATIOS: Record<string, number | null> = {
    'free': null, 'original': null,
    '1:1': 1,
    '4:3': 4 / 3, '3:4': 3 / 4,
    '3:2': 3 / 2, '2:3': 2 / 3,
    '16:9': 16 / 9, '9:16': 9 / 16,
    '5:4': 5 / 4, '4:5': 4 / 5,
    '21:9': 21 / 9,
    'golden': 1.6180339887,
}

// ── Handle type ────────────────────────────────────────────────
type HandleType = 'move' | 'tl' | 't' | 'tr' | 'r' | 'br' | 'b' | 'bl' | 'l'

interface DragState {
    handle: HandleType
    ox: number; oy: number
    crop0: { x: number; y: number; w: number; h: number }
}

// ── Tool defs ──────────────────────────────────────────────────
interface ToolDef { id: ToolId; label: string; icon: React.ReactNode }
const TOOLS: ToolDef[] = [
    { id: 'adjust', label: 'Adjust', icon: <SlidersHorizontal size={19} /> },
    { id: 'filter', label: 'Filter', icon: <Sliders size={19} /> },
    { id: 'crop', label: 'Crop', icon: <Crop size={19} /> },
    { id: 'resize', label: 'Resize', icon: <Maximize2 size={19} /> },
    { id: 'rotate', label: 'Rotate', icon: <RotateCw size={19} /> },
    { id: 'draw', label: 'Draw', icon: <Pencil size={19} /> },
    { id: 'text', label: 'Text', icon: <Type size={19} /> },
    { id: 'frame', label: 'Frame', icon: <Square size={19} /> },
    { id: 'watermark', label: 'Watermark', icon: <ImageIcon size={19} /> },
    { id: 'sticker', label: 'Stickers', icon: <Tag size={19} /> },
    { id: 'export', label: 'Export', icon: <Download size={19} /> },
]

// ── Props ──────────────────────────────────────────────────────
export interface ImageEditorModalProps {
    imageUrl: string
    imageName?: string
    initialState?: ImageEditorState
    onSave: (editedUrl: string, state: ImageEditorState) => void
    onClose: () => void
}

type HistoryEntry = ImageEditorState

// ── Main component ─────────────────────────────────────────────
export default function ImageEditorModal({
    imageUrl, imageName, initialState, onSave, onClose,
}: ImageEditorModalProps) {
    const [activeTool, setActiveTool] = useState<ToolId>('adjust')
    const [zoom, setZoom] = useState(100)
    const [hovTool, setHovTool] = useState<ToolId | null>(null)
    const [saving, setSaving] = useState(false)

    // Image element ref (callback ref so CropOverlay gets notified)
    const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null)
    const imgCallbackRef = useCallback((el: HTMLImageElement | null) => setImgEl(el), [])

    // ── History ────────────────────────────────────────────────
    const [history, setHistory] = useState<HistoryEntry[]>([initialState ?? DEFAULT_STATE])
    const [histIdx, setHistIdx] = useState(0)
    const editorState = history[histIdx]

    const pushState = useCallback((patch: Partial<ImageEditorState>) => {
        const next: HistoryEntry = { ...history[histIdx], ...patch }
        const trimmed = history.slice(0, histIdx + 1)
        setHistory([...trimmed, next])
        setHistIdx(trimmed.length)
    }, [history, histIdx])

    const undo = () => { if (histIdx > 0) setHistIdx(i => i - 1) }
    const redo = () => { if (histIdx < history.length - 1) setHistIdx(i => i + 1) }
    const canUndo = histIdx > 0
    const canRedo = histIdx < history.length - 1

    // ── CSS filter ─────────────────────────────────────────────
    const cssFilter = useMemo(() => {
        const {
            brightness, contrast, saturation, sharpness,
            activeFilter, filterIntensity, hue, blur, gamma, vibrance,
        } = editorState

        const _intensity = filterIntensity ?? 100
        const _hue = hue ?? 0
        const _blur = blur ?? 0
        const _gamma = gamma ?? 1
        const _vibrance = vibrance ?? 0

        const PRESET_CSS: Record<string, string> = {
            none: '',
            grayscale: 'grayscale(100%)',
            sepia: 'sepia(90%)',
            vintage: 'sepia(50%) contrast(110%) brightness(88%) saturate(75%)',
            polaroid: 'contrast(115%) brightness(108%) saturate(75%) sepia(15%)',
            chrome: 'contrast(125%) saturate(160%) brightness(95%)',
            fade: 'contrast(88%) brightness(112%) saturate(70%)',
            kodachrome: 'contrast(120%) saturate(115%) hue-rotate(12deg) brightness(88%)',
            technicolor: 'saturate(155%) hue-rotate(-28deg) contrast(118%)',
            brownie: 'sepia(55%) saturate(45%) contrast(108%) brightness(92%)',
            noir: 'grayscale(100%) contrast(135%) brightness(75%)',
            vivid: 'saturate(185%) contrast(112%) brightness(102%)',
            matte: 'contrast(82%) brightness(115%) saturate(65%)',
            blueprint: 'sepia(100%) hue-rotate(185deg) saturate(210%)',
            cool: 'hue-rotate(195deg) saturate(125%) brightness(106%)',
            warm: 'hue-rotate(-22deg) saturate(135%) brightness(106%)',
            emboss: 'grayscale(100%) contrast(210%) brightness(108%)',
            invert: 'invert(100%)',
        }

        const parts: string[] = []
        const presetCss = PRESET_CSS[activeFilter] || ''
        if (presetCss && _intensity > 0) parts.push(presetCss)

        if (brightness !== 0) parts.push(`brightness(${(1 + brightness / 100).toFixed(3)})`)
        if (contrast !== 0) parts.push(`contrast(${(1 + contrast / 100).toFixed(3)})`)
        if (saturation !== 0) parts.push(`saturate(${Math.max(0, 1 + saturation / 100).toFixed(3)})`)
        if (sharpness && sharpness > 0) parts.push(`contrast(${(1 + sharpness * 0.004).toFixed(3)})`)
        if (_gamma !== 1) parts.push(`brightness(${(_gamma * 0.7 + 0.3).toFixed(3)})`)
        if (_vibrance !== 0) parts.push(`saturate(${Math.max(0, 1 + _vibrance / 80).toFixed(3)})`)
        if (_hue !== 0) parts.push(`hue-rotate(${_hue}deg)`)
        if (_blur > 0) parts.push(`blur(${_blur}px)`)

        return parts.length ? parts.join(' ') : 'none'
    }, [editorState])

    const cssTransform = useMemo(() => {
        const { rotation, flipH, flipV } = editorState
        const straighten = editorState.straighten ?? 0
        const parts: string[] = []
        const totalRot = rotation + straighten
        if (totalRot) parts.push(`rotate(${totalRot}deg)`)
        if (flipH) parts.push('scaleX(-1)')
        if (flipV) parts.push('scaleY(-1)')
        return parts.length ? parts.join(' ') : 'none'
    }, [editorState])

    const cssCornerRadius = editorState.cornerRadius ?? 0

    // ── CSS resize — applied directly to <img> ─────────────────
    const cssResize = useMemo(() => {
        const rw = editorState.resizeWidth
        const rh = editorState.resizeHeight
        if (!rw || !rh) return null
        const ratio = rw / rh
        return {
            // Fit within 70vw × 70vh while keeping the target ratio
            width: `min(${rw}px, 70vw, calc(${ratio.toFixed(6)} * 70vh))`,
            aspectRatio: `${rw} / ${rh}`,
            objectFit: 'fill' as const,
        }
    }, [editorState.resizeWidth, editorState.resizeHeight])

    // ── CSS frame ──────────────────────────────────────────────
    const cssFrame = useMemo(() => {
        const { style, color, width: w, borderRadius: br } = editorState.frame
        const baseRadius = cssCornerRadius > 0 ? cssCornerRadius : 2
        const baseInner = { borderRadius: baseRadius }
        if (style === 'none') {
            return {
                outer: {} as React.CSSProperties,
                inner: baseInner,
            }
        }
        switch (style) {
            case 'solid':
                return {
                    outer: {
                        border: `${w}px solid ${color}`,
                        borderRadius: baseRadius + w,
                    } as React.CSSProperties,
                    inner: baseInner,
                }
            case 'rounded':
                return {
                    outer: {
                        border: `${w}px solid ${color}`,
                        borderRadius: br + w,
                    } as React.CSSProperties,
                    inner: { borderRadius: br },
                }
            case 'shadow':
                return {
                    outer: {
                        border: `${w}px solid ${color}`,
                        borderRadius: baseRadius + w,
                        boxShadow: `${Math.round(w * 0.6)}px ${Math.round(w * 0.6)}px 0 #374151, ${Math.round(w * 0.8)}px ${Math.round(w * 0.8)}px ${w * 2}px rgba(0,0,0,0.35)`,
                    } as React.CSSProperties,
                    inner: baseInner,
                }
            case 'polaroid':
                return {
                    outer: {
                        background: color || '#ffffff',
                        padding: `${w}px ${w}px ${Math.round(w * 3.2)}px ${w}px`,
                        borderRadius: 2,
                    } as React.CSSProperties,
                    inner: { borderRadius: 0 },
                }
            case 'film':
                return {
                    outer: {
                        background: '#111111',
                        padding: `${Math.round(w * 1.4)}px ${Math.round(w * 0.5)}px`,
                        borderRadius: 3,
                    } as React.CSSProperties,
                    inner: { borderRadius: 0 },
                }
            default:
                return {
                    outer: {} as React.CSSProperties,
                    inner: baseInner,
                }
        }
    }, [editorState.frame, cssCornerRadius])

    // ── Render tool panel ──────────────────────────────────────
    function renderToolPanel() {
        const common = { state: editorState, onChange: pushState, imageUrl }
        switch (activeTool) {
            case 'adjust': return <AdjustTool {...common} />
            case 'filter': return <FilterTool {...common} />
            case 'crop': return <CropTool   {...common} />
            case 'resize': return <ResizeTool {...common} />
            case 'rotate': return <RotateTool {...common} />
            case 'draw': return <DrawTool   {...common} />
            case 'text': return <TextTool   {...common} />
            case 'frame': return <FrameTool       {...common} />
            case 'watermark': return <WatermarkTool   {...common} />
            case 'sticker': return <StickerTool     {...common} />
            case 'export': return <ExportTool      {...common} />
            default:
                return <PlaceholderPanel tool={TOOLS.find(t => t.id === activeTool)!} />
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', flexDirection: 'column',
            backgroundColor: C.surface, fontFamily: 'DM Sans, sans-serif',
        }}>
            {/* Header */}
            <div style={{
                height: 52, flexShrink: 0, display: 'flex', alignItems: 'center',
                padding: '0 16px', gap: 12, borderBottom: `1px solid ${C.border}`,
                backgroundColor: C.surface,
            }}>
                <div style={{ display: 'flex', gap: 2 }}>
                    <HdrButton onClick={undo} disabled={!canUndo} title="Undo"><Undo2 size={15} /></HdrButton>
                    <HdrButton onClick={redo} disabled={!canRedo} title="Redo"><Redo2 size={15} /></HdrButton>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.dark }}>{imageName || 'Edit Image'}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={onClose} style={{
                        padding: '6px 16px', borderRadius: 8, border: `1px solid ${C.border}`,
                        background: C.surface, color: C.body, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}>Cancel</button>
                    <button
                        disabled={saving}
                        onClick={async () => {
                            setSaving(true)
                            try {
                                const xs = editorState.exportSettings
                                const fmt = xs?.format ?? 'jpeg'
                                const q = xs?.quality ?? 0.92
                                const tw: number | null =
                                    xs?.preset === 'original' ? null
                                        : xs?.preset === 'custom' ? (xs.customWidth ?? 1600)
                                            : xs?.preset === 'ebay-minimum' ? 500
                                                : 1600
                                const dataUrl = await exportToDataUrl(imageUrl, editorState, tw, fmt, q)
                                onSave(dataUrl, editorState)
                            } catch (err) {
                                console.error('[ImageEditor] Save export failed — check CORS on image URL:', err)
                                alert('Export failed. Please try again or check the browser console for details.')
                                setSaving(false)
                            }
                        }}
                        style={{
                            padding: '6px 20px', borderRadius: 8, border: 'none',
                            background: saving ? '#9ca3af' : C.primary,
                            color: '#fff', fontSize: 13, fontWeight: 700,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.8 : 1,
                            transition: 'background 0.15s',
                        }}
                    >{saving ? 'Saving…' : 'Save'}</button>
                </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>

                {/* Left tool strip */}
                <div style={{
                    width: 68, flexShrink: 0, backgroundColor: C.toolBg,
                    borderRight: `1px solid ${C.border}`, display: 'flex',
                    flexDirection: 'column', alignItems: 'center',
                    padding: '10px 0', gap: 2, overflowY: 'auto',
                }}>
                    {TOOLS.map(tool => {
                        const isActive = activeTool === tool.id
                        const isHov = hovTool === tool.id && !isActive
                        return (
                            <button key={tool.id}
                                onClick={() => setActiveTool(tool.id)}
                                onMouseEnter={() => setHovTool(tool.id)}
                                onMouseLeave={() => setHovTool(null)}
                                title={tool.label}
                                style={{
                                    width: 54, padding: '9px 0',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    gap: 4, border: 'none', cursor: 'pointer', borderRadius: 10,
                                    backgroundColor: isActive ? C.toolActive : isHov ? C.toolHov : 'transparent',
                                    color: isActive ? C.toolActiveT : isHov ? C.toolHovT : C.toolDefault,
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                {tool.icon}
                                <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: 0.2, lineHeight: 1 }}>
                                    {tool.label}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* Canvas */}
                <div style={{
                    flex: 1, position: 'relative', backgroundColor: C.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                }}>
                    {/* Outer wrapper — zoom transform + frame visual (border/padding/shadow) */}
                    <div style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.18s ease',
                        lineHeight: 0,
                        ...cssFrame.outer,
                    }}>
                        {/* Inner wrapper — position:relative so overlays can be absolute inside */}
                        <div style={{
                            lineHeight: 0,
                            position: 'relative',
                            borderRadius: cssFrame.inner.borderRadius,
                            overflow: 'hidden',
                            // Show background colour so preview matches export
                            background: editorState.background?.bgColor ?? '#ffffff',
                        }}>
                            <img
                                ref={imgCallbackRef}
                                src={imageUrl}
                                alt={imageName || 'Editing'}
                                draggable={false}
                                style={{
                                    display: 'block',
                                    // Apply resize dimensions if set, otherwise natural max constraints
                                    ...(cssResize ?? { maxWidth: '70vw', maxHeight: '70vh' }),
                                    filter: cssFilter,
                                    transform: cssTransform,
                                    transition: 'filter 0.2s ease, transform 0.2s ease, width 0.2s ease, aspect-ratio 0.2s ease',
                                    userSelect: 'none',
                                }}
                            />

                            {/* Crop overlay — rendered when crop tool active */}
                            {activeTool === 'crop' && imgEl && (
                                <CropOverlay
                                    imgEl={imgEl}
                                    crop={editorState.crop}
                                    aspectLock={editorState.aspectLock ?? 'free'}
                                    cropGrid={editorState.cropGrid ?? 'none'}
                                    onChange={crop => pushState({ crop })}
                                />
                            )}

                            {/* Text overlays — always mounted so positions persist */}
                            {imgEl && (
                                <TextOverlayLayer
                                    imgEl={imgEl}
                                    overlays={editorState.textOverlays}
                                    active={activeTool === 'text'}
                                    onChange={textOverlays => pushState({ textOverlays })}
                                />
                            )}

                            {/* Draw canvas — always mounted so strokes persist between tool switches */}
                            {imgEl && (
                                <DrawCanvas
                                    imgEl={imgEl}
                                    drawSettings={editorState.drawSettings}
                                    active={activeTool === 'draw'}
                                />
                            )}

                            {/* Watermark live preview */}
                            {imgEl && editorState.watermark?.enabled && editorState.watermark?.dataUrl && (
                                <WatermarkLayer
                                    imgEl={imgEl}
                                    watermark={editorState.watermark}
                                />
                            )}

                            {/* Sticker overlays — draggable when sticker tool active */}
                            {imgEl && (editorState.stickers ?? []).length > 0 && (
                                <StickerLayer
                                    imgEl={imgEl}
                                    stickers={editorState.stickers ?? []}
                                    active={activeTool === 'sticker'}
                                    onChange={stickers => pushState({ stickers })}
                                />
                            )}
                        </div>
                    </div>

                    {/* Zoom pill */}
                    <div style={{
                        position: 'absolute', bottom: 16, left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex', alignItems: 'center', gap: 6,
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        borderRadius: 20, padding: '5px 12px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                        border: `1px solid ${C.border}`,
                    }}>
                        <ZoomPillButton onClick={() => setZoom(z => Math.max(20, z - 10))} disabled={zoom <= 20}>
                            <ZoomOut size={13} />
                        </ZoomPillButton>
                        <span onClick={() => setZoom(100)} title="Reset zoom"
                            style={{ fontSize: 12, fontWeight: 600, color: C.dark, minWidth: 38, textAlign: 'center', cursor: 'pointer' }}>
                            {zoom}%
                        </span>
                        <ZoomPillButton onClick={() => setZoom(z => Math.min(400, z + 10))} disabled={zoom >= 400}>
                            <ZoomIn size={13} />
                        </ZoomPillButton>
                    </div>
                </div>

                {/* Right panel */}
                <div style={{
                    width: 288, flexShrink: 0, backgroundColor: C.surface,
                    borderLeft: `1px solid ${C.border}`, display: 'flex',
                    flexDirection: 'column', overflow: 'hidden',
                }}>
                    <div style={{
                        padding: '13px 16px 11px', borderBottom: `1px solid ${C.border}`,
                        backgroundColor: C.panelHdr, display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: 7,
                            backgroundColor: C.primaryLight,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: C.primary, flexShrink: 0,
                        }}>
                            {TOOLS.find(t => t.id === activeTool)?.icon}
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: 0 }}>
                            {TOOLS.find(t => t.id === activeTool)?.label}
                        </p>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {renderToolPanel()}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── CropOverlay ────────────────────────────────────────────────
function CropOverlay({ imgEl, crop, aspectLock, cropGrid, onChange }: {
    imgEl: HTMLImageElement
    crop: CropRect | null
    aspectLock: string
    cropGrid: 'none' | 'thirds' | 'golden'
    onChange: (c: CropRect) => void
}) {
    const overlayRef = useRef<HTMLDivElement>(null)
    const sizeRef = useRef({ w: 0, h: 0, natR: 1 })
    const dragRef = useRef<DragState | null>(null)
    const [tick, setTick] = useState(0)

    // Keep latest values in refs so window handlers never go stale
    const onChangeRef = useRef(onChange); onChangeRef.current = onChange
    const aspectLockRef = useRef(aspectLock); aspectLockRef.current = aspectLock
    const cropRef = useRef(crop); cropRef.current = crop

    // Measure the displayed image dimensions
    useEffect(() => {
        const sync = () => {
            sizeRef.current = {
                w: imgEl.offsetWidth,
                h: imgEl.offsetHeight,
                natR: imgEl.naturalWidth ? imgEl.naturalWidth / imgEl.naturalHeight : 1,
            }
            setTick(t => t + 1)
        }
        if (imgEl.complete && imgEl.naturalWidth) sync()
        else imgEl.addEventListener('load', sync)
        const ro = new ResizeObserver(sync)
        ro.observe(imgEl)
        return () => { imgEl.removeEventListener('load', sync); ro.disconnect() }
    }, [imgEl])

    // When aspect lock changes (not 'free'), re-fit current crop to new ratio
    useEffect(() => {
        const AL = aspectLockRef.current
        const { w: IW, h: IH, natR } = sizeRef.current
        if (!IW || !IH) return
        if (AL === 'free') return

        const AR = AL === 'original' ? natR : (ASPECT_RATIOS[AL] ?? null)
        if (!AR) return

        const c = cropRef.current ?? { x: 0, y: 0, width: 1, height: 1 }
        let cw = c.width * IW
        let ch = cw / AR
        if (ch > IH) { ch = IH; cw = ch * AR }
        if (cw > IW) { cw = IW; ch = cw / AR }
        const cx = c.x * IW + (c.width * IW) / 2
        const cy = c.y * IH + (c.height * IH) / 2
        const nx = Math.max(0, Math.min(IW - cw, cx - cw / 2))
        const ny = Math.max(0, Math.min(IH - ch, cy - ch / 2))
        onChangeRef.current({ x: nx / IW, y: ny / IH, width: cw / IW, height: ch / IH })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aspectLock])

    // Stable mouse move handler (reads everything from refs)
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragRef.current || !overlayRef.current) return
        const { w: IW, h: IH, natR } = sizeRef.current
        if (!IW) return

        const rect = overlayRef.current.getBoundingClientRect()
        const mx = Math.max(0, Math.min(IW, e.clientX - rect.left))
        const my = Math.max(0, Math.min(IH, e.clientY - rect.top))
        const dx = mx - dragRef.current.ox
        const dy = my - dragRef.current.oy
        const { handle, crop0 } = dragRef.current
        const MIN = 20

        let { x, y, w, h } = crop0

        if (handle === 'move') {
            x = Math.max(0, Math.min(IW - w, crop0.x + dx))
            y = Math.max(0, Math.min(IH - h, crop0.y + dy))
        } else {
            // Adjust left edge
            if (handle === 'tl' || handle === 'l' || handle === 'bl') {
                const nx = Math.max(0, Math.min(crop0.x + crop0.w - MIN, crop0.x + dx))
                w = crop0.x + crop0.w - nx; x = nx
            }
            // Adjust right edge
            if (handle === 'tr' || handle === 'r' || handle === 'br') {
                w = Math.max(MIN, Math.min(IW - crop0.x, crop0.w + dx))
            }
            // Adjust top edge
            if (handle === 'tl' || handle === 't' || handle === 'tr') {
                const ny = Math.max(0, Math.min(crop0.y + crop0.h - MIN, crop0.y + dy))
                h = crop0.y + crop0.h - ny; y = ny
            }
            // Adjust bottom edge
            if (handle === 'bl' || handle === 'b' || handle === 'br') {
                h = Math.max(MIN, Math.min(IH - crop0.y, crop0.h + dy))
            }

            // Enforce aspect ratio
            const AL = aspectLockRef.current
            const AR = AL === 'original' ? natR : (ASPECT_RATIOS[AL] ?? null)
            if (AR) {
                if (['tl', 'tr', 'bl', 'br'].includes(handle)) {
                    h = w / AR
                    if (handle.includes('t')) y = crop0.y + crop0.h - h
                } else if (handle === 'l' || handle === 'r') {
                    h = w / AR
                    y = crop0.y + (crop0.h - h) / 2
                } else {
                    w = h * AR
                    x = crop0.x + (crop0.w - w) / 2
                }
                // Clamp after AR
                if (y < 0) { y = 0; h = crop0.y + crop0.h; w = h * AR }
                if (x < 0) { x = 0; w = crop0.x + crop0.w; h = w / AR }
                if (y + h > IH) { h = IH - y; w = h * AR; if (handle.includes('t')) y = IH - h }
                if (x + w > IW) { w = IW - x; h = w / AR; if (handle.includes('l')) x = IW - w }
            }
        }

        // Final bounds
        x = Math.max(0, Math.min(IW - MIN, x))
        y = Math.max(0, Math.min(IH - MIN, y))
        w = Math.max(MIN, Math.min(IW - x, w))
        h = Math.max(MIN, Math.min(IH - y, h))

        onChangeRef.current({ x: x / IW, y: y / IH, width: w / IW, height: h / IH })
    }, [])

    const handleMouseUp = useCallback(() => {
        dragRef.current = null
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
    }, [handleMouseMove])

    function startDrag(e: React.MouseEvent, handle: HandleType) {
        e.preventDefault(); e.stopPropagation()
        const { w: IW, h: IH } = sizeRef.current
        const rect = overlayRef.current!.getBoundingClientRect()
        const c = cropRef.current ?? { x: 0, y: 0, width: 1, height: 1 }
        dragRef.current = {
            handle,
            ox: e.clientX - rect.left,
            oy: e.clientY - rect.top,
            crop0: { x: c.x * IW, y: c.y * IH, w: c.width * IW, h: c.height * IH },
        }
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
    }

    // Cleanup on unmount
    useEffect(() => () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
    }, [handleMouseMove, handleMouseUp])

    // ── Render ─────────────────────────────────────────────────
    const { w: IW, h: IH } = sizeRef.current
    if (!IW || !IH) return null

    const c = crop ?? { x: 0, y: 0, width: 1, height: 1 }
    const px = { x: c.x * IW, y: c.y * IH, w: c.width * IW, h: c.height * IH }

    // Grid lines
    const gridLines: React.ReactNode[] = []
    if (cropGrid !== 'none') {
        const [p1, p2] = cropGrid === 'thirds' ? [1 / 3, 2 / 3] : [0.382, 0.618]
        for (const [i, p] of [[0, p1], [1, p2]] as [number, number][]) {
            gridLines.push(
                <div key={`v${i}`} style={{
                    position: 'absolute',
                    left: px.x + px.w * p - 0.5, top: px.y,
                    width: 1, height: px.h,
                    background: 'rgba(255,255,255,0.7)',
                    pointerEvents: 'none',
                }} />,
                <div key={`h${i}`} style={{
                    position: 'absolute',
                    top: px.y + px.h * p - 0.5, left: px.x,
                    height: 1, width: px.w,
                    background: 'rgba(255,255,255,0.7)',
                    pointerEvents: 'none',
                }} />,
            )
        }
    }

    // 8 resize handles
    const handles: { id: HandleType; top: number; left: number; cursor: string }[] = [
        { id: 'tl', top: px.y - 5, left: px.x - 5, cursor: 'nw-resize' },
        { id: 't', top: px.y - 5, left: px.x + px.w / 2 - 5, cursor: 'n-resize' },
        { id: 'tr', top: px.y - 5, left: px.x + px.w - 5, cursor: 'ne-resize' },
        { id: 'r', top: px.y + px.h / 2 - 5, left: px.x + px.w - 5, cursor: 'e-resize' },
        { id: 'br', top: px.y + px.h - 5, left: px.x + px.w - 5, cursor: 'se-resize' },
        { id: 'b', top: px.y + px.h - 5, left: px.x + px.w / 2 - 5, cursor: 's-resize' },
        { id: 'bl', top: px.y + px.h - 5, left: px.x - 5, cursor: 'sw-resize' },
        { id: 'l', top: px.y + px.h / 2 - 5, left: px.x - 5, cursor: 'w-resize' },
    ]

    return (
        <div ref={overlayRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            {/* Dark vignette outside crop */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: px.y, background: 'rgba(0,0,0,0.5)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: px.y + px.h, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: px.y, left: 0, width: px.x, height: px.h, background: 'rgba(0,0,0,0.5)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: px.y, left: px.x + px.w, right: 0, height: px.h, background: 'rgba(0,0,0,0.5)', pointerEvents: 'none' }} />

            {/* Crop border (also drag to move) */}
            <div
                onMouseDown={e => startDrag(e, 'move')}
                style={{
                    position: 'absolute',
                    left: px.x, top: px.y, width: px.w, height: px.h,
                    border: '2px solid rgba(255,255,255,0.95)',
                    cursor: 'move', boxSizing: 'border-box',
                }}
            />

            {/* Grid lines */}
            {gridLines}

            {/* Corner + edge handles */}
            {handles.map(h => (
                <div
                    key={h.id}
                    onMouseDown={e => startDrag(e, h.id)}
                    style={{
                        position: 'absolute',
                        top: h.top, left: h.left,
                        width: 10, height: 10,
                        background: '#ffffff',
                        border: '2px solid #4a90d9',
                        borderRadius: 2,
                        cursor: h.cursor,
                        zIndex: 10,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
                    }}
                />
            ))}
        </div>
    )
}

// ── Placeholder panel ──────────────────────────────────────────
interface ToolDef2 { id: ToolId; label: string; icon: React.ReactNode }
function PlaceholderPanel({ tool }: { tool: ToolDef2 }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '48px 24px', gap: 14, textAlign: 'center',
        }}>
            <div style={{
                width: 52, height: 52, borderRadius: 14, backgroundColor: '#f3eeff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7530fb',
            }}>{tool.icon}</div>
            <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1e1535', margin: '0 0 6px', fontFamily: 'DM Sans, sans-serif' }}>
                    {tool.label} Tool
                </p>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6 }}>
                    Coming soon.<br />Building one tool at a time.
                </p>
            </div>
        </div>
    )
}

// ── Tiny buttons ───────────────────────────────────────────────
function HdrButton({ children, onClick, disabled, title }: {
    children: React.ReactNode; onClick: () => void; disabled?: boolean; title?: string
}) {
    return (
        <button onClick={onClick} disabled={disabled} title={title} style={{
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', background: 'none', borderRadius: 6,
            cursor: disabled ? 'not-allowed' : 'pointer',
            color: disabled ? '#d1d5db' : '#6b7280',
        }}>{children}</button>
    )
}

function ZoomPillButton({ children, onClick, disabled }: {
    children: React.ReactNode; onClick: () => void; disabled?: boolean
}) {
    return (
        <button onClick={onClick} disabled={disabled} style={{
            width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', background: 'none', borderRadius: 4,
            cursor: disabled ? 'not-allowed' : 'pointer',
            color: disabled ? '#d1d5db' : '#374151',
        }}>{children}</button>
    )
}

// ── DrawCanvas ─────────────────────────────────────────────────
// Sits absolutely over the image; captures pointer events only when active.
// Persists strokes when the user switches to another tool and back.

function DrawCanvas({ imgEl, drawSettings, active }: {
    imgEl: HTMLImageElement
    drawSettings: DrawSettings
    active: boolean
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const paintingRef = useRef(false)
    const [size, setSize] = useState({ w: 0, h: 0 })

    // Track display size of the image element
    useEffect(() => {
        const sync = () => setSize({ w: imgEl.offsetWidth, h: imgEl.offsetHeight })
        if (imgEl.complete && imgEl.naturalWidth) sync()
        else imgEl.addEventListener('load', sync)
        const ro = new ResizeObserver(sync)
        ro.observe(imgEl)
        return () => { imgEl.removeEventListener('load', sync); ro.disconnect() }
    }, [imgEl])

    // Resize canvas buffer when display size changes (preserves content via temp copy)
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || !size.w || !size.h) return
        if (canvas.width === size.w && canvas.height === size.h) return
        // Copy existing content
        const tmp = document.createElement('canvas')
        tmp.width = canvas.width; tmp.height = canvas.height
        tmp.getContext('2d')?.drawImage(canvas, 0, 0)
        canvas.width = size.w
        canvas.height = size.h
        canvas.getContext('2d')?.drawImage(tmp, 0, 0)
    }, [size])

    // Listen for clear event dispatched from DrawTool panel
    useEffect(() => {
        const handler = () => {
            const canvas = canvasRef.current
            if (!canvas) return
            canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
        }
        window.addEventListener('draw:clear', handler)
        return () => window.removeEventListener('draw:clear', handler)
    }, [])

    // ── Drawing helpers ──────────────────────────────────────────
    const dsRef = useRef(drawSettings)
    useEffect(() => { dsRef.current = drawSettings }, [drawSettings])

    function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
        const r = canvasRef.current!.getBoundingClientRect()
        return { x: e.clientX - r.left, y: e.clientY - r.top }
    }

    function startCtx(ctx: CanvasRenderingContext2D) {
        const ds = dsRef.current
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.lineWidth = ds.lineWidth
        if (ds.mode === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out'
            ctx.globalAlpha = 1
            ctx.strokeStyle = 'rgba(0,0,0,1)'
        } else {
            ctx.globalCompositeOperation = 'source-over'
            ctx.globalAlpha = ds.opacity
            ctx.strokeStyle = ds.color
        }
    }

    function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
        if (!active) return
        e.currentTarget.setPointerCapture(e.pointerId)
        paintingRef.current = true
        const ctx = canvasRef.current?.getContext('2d')
        if (!ctx) return
        startCtx(ctx)
        const { x, y } = getPos(e)
        ctx.beginPath()
        ctx.moveTo(x, y)
        // Draw a dot on single click
        ctx.lineTo(x + 0.01, y + 0.01)
        ctx.stroke()
    }

    function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
        if (!active || !paintingRef.current) return
        const ctx = canvasRef.current?.getContext('2d')
        if (!ctx) return
        startCtx(ctx)
        const { x, y } = getPos(e)
        ctx.lineTo(x, y)
        ctx.stroke()
    }

    function onPointerUp() {
        paintingRef.current = false
        const ctx = canvasRef.current?.getContext('2d')
        if (ctx) ctx.beginPath()
    }

    if (!size.w || !size.h) return null

    return (
        <canvas
            ref={canvasRef}
            width={size.w}
            height={size.h}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            style={{
                position: 'absolute',
                top: 0, left: 0,
                width: size.w,
                height: size.h,
                cursor: active
                    ? drawSettings.mode === 'eraser' ? 'cell' : 'crosshair'
                    : 'default',
                pointerEvents: active ? 'auto' : 'none',
                touchAction: 'none',
                zIndex: 10,
            }}
        />
    )
}

// ── TextOverlayLayer ───────────────────────────────────────────
// Renders draggable text overlays as positioned divs over the image.
// Active (text tool): pointer events on, click canvas bg to add, drag to move.
// Inactive: pointer events off — overlays still visible but non-interactive.
function TextOverlayLayer({ imgEl, overlays, active, onChange }: {
    imgEl: HTMLImageElement
    overlays: TextOverlay[]
    active: boolean
    onChange: (overlays: TextOverlay[]) => void
}) {
    const [size, setSize] = useState({ w: 0, h: 0 })
    const [focusId, setFocusId] = useState<string | null>(null)
    const dragRef = useRef<{ id: string; ox: number; oy: number } | null>(null)
    const overlaysRef = useRef(overlays)
    const onChangeRef = useRef(onChange)
    useEffect(() => { overlaysRef.current = overlays }, [overlays])
    useEffect(() => { onChangeRef.current = onChange }, [onChange])

    // Sync display size
    useEffect(() => {
        const sync = () => setSize({ w: imgEl.offsetWidth, h: imgEl.offsetHeight })
        if (imgEl.complete && imgEl.naturalWidth) sync()
        else imgEl.addEventListener('load', sync)
        const ro = new ResizeObserver(sync)
        ro.observe(imgEl)
        return () => { imgEl.removeEventListener('load', sync); ro.disconnect() }
    }, [imgEl])

    // Listen for panel → focus event
    useEffect(() => {
        const h = (e: Event) => setFocusId((e as CustomEvent<{ id: string }>).detail?.id ?? null)
        window.addEventListener('text:focus', h)
        return () => window.removeEventListener('text:focus', h)
    }, [])

    // Click on layer background → add new overlay at click position
    function onBgClick(e: React.MouseEvent<HTMLDivElement>) {
        if (!active) return
        if ((e.target as HTMLElement) !== e.currentTarget) return
        const r = e.currentTarget.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width
        const y = (e.clientY - r.top) / r.height
        const uid = Math.random().toString(36).slice(2, 10)
        const next: TextOverlay = {
            id: uid, text: 'Your text here',
            x, y, fontSize: 36,
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff', bold: false, italic: false, align: 'center',
        }
        onChangeRef.current([...overlaysRef.current, next])
        setFocusId(uid)
        window.dispatchEvent(new CustomEvent('text:select', { detail: { id: uid } }))
    }

    // Drag handlers
    function onOverlayPointerDown(e: React.PointerEvent<HTMLDivElement>, id: string) {
        if (!active) return
        e.stopPropagation()
        e.currentTarget.setPointerCapture(e.pointerId)
        setFocusId(id)
        window.dispatchEvent(new CustomEvent('text:select', { detail: { id } }))
        const ov = overlaysRef.current.find(o => o.id === id)!
        const r = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect()
        dragRef.current = {
            id,
            ox: e.clientX / r.width - ov.x,
            oy: e.clientY / r.height - ov.y,
        }
    }

    function onOverlayPointerMove(e: React.PointerEvent<HTMLDivElement>) {
        if (!dragRef.current) return
        const { id, ox, oy } = dragRef.current
        const r = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect()
        const nx = Math.max(0, Math.min(1, e.clientX / r.width - ox))
        const ny = Math.max(0, Math.min(1, e.clientY / r.height - oy))
        onChangeRef.current(overlaysRef.current.map(o =>
            o.id === id ? { ...o, x: nx, y: ny } : o
        ))
    }

    function onOverlayPointerUp() { dragRef.current = null }

    if (!size.w || !size.h) return null

    return (
        <div
            onClick={onBgClick}
            style={{
                position: 'absolute', top: 0, left: 0,
                width: size.w, height: size.h,
                pointerEvents: active ? 'auto' : 'none',
                cursor: active ? 'crosshair' : 'default',
                zIndex: 9,
            }}
        >
            {overlays.map(ov => {
                const isFocused = ov.id === focusId && active
                return (
                    <div
                        key={ov.id}
                        onPointerDown={e => onOverlayPointerDown(e, ov.id)}
                        onPointerMove={onOverlayPointerMove}
                        onPointerUp={onOverlayPointerUp}
                        style={{
                            position: 'absolute',
                            left: `${ov.x * 100}%`,
                            top: `${ov.y * 100}%`,
                            transform: 'translate(-50%, -50%)',
                            cursor: active ? 'move' : 'default',
                            userSelect: 'none',
                            touchAction: 'none',
                            padding: isFocused ? '4px 6px' : '4px 6px',
                            borderRadius: 4,
                            border: isFocused
                                ? '1.5px dashed rgba(117,48,251,0.8)'
                                : '1.5px dashed transparent',
                            boxShadow: isFocused
                                ? '0 0 0 1px rgba(117,48,251,0.2)'
                                : 'none',
                            whiteSpace: 'pre-wrap',
                            textAlign: ov.align,
                            fontFamily: ov.fontFamily,
                            fontSize: ov.fontSize,
                            fontWeight: ov.bold ? 700 : 400,
                            fontStyle: ov.italic ? 'italic' : 'normal',
                            color: ov.color,
                            lineHeight: 1.2,
                            textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                            maxWidth: size.w * 0.9,
                        }}
                    >
                        {ov.text || ''}
                    </div>
                )
            })}
        </div>
    )
}

// ── WatermarkLayer ─────────────────────────────────────────────
// Live preview of the watermark/logo overlay on the image.
function WatermarkLayer({ imgEl, watermark }: {
    imgEl: HTMLImageElement
    watermark: WatermarkSettings
}) {
    const [size, setSize] = useState({ w: 0, h: 0 })

    useEffect(() => {
        const sync = () => setSize({ w: imgEl.offsetWidth, h: imgEl.offsetHeight })
        if (imgEl.complete && imgEl.naturalWidth) sync()
        else imgEl.addEventListener('load', sync)
        const ro = new ResizeObserver(sync)
        ro.observe(imgEl)
        return () => { imgEl.removeEventListener('load', sync); ro.disconnect() }
    }, [imgEl])

    if (!size.w || !size.h || !watermark.dataUrl) return null

    const { position, opacity, size: sizePct, margin } = watermark
    const logoW = size.w * sizePct / 100

    // Compute position styles
    const pos: React.CSSProperties = { position: 'absolute' }
    if (position === 'tl') { pos.top = margin; pos.left = margin }
    else if (position === 'tc') { pos.top = margin; pos.left = '50%'; pos.transform = 'translateX(-50%)' }
    else if (position === 'tr') { pos.top = margin; pos.right = margin }
    else if (position === 'ml') { pos.top = '50%'; pos.left = margin; pos.transform = 'translateY(-50%)' }
    else if (position === 'mc') { pos.top = '50%'; pos.left = '50%'; pos.transform = 'translate(-50%,-50%)' }
    else if (position === 'mr') { pos.top = '50%'; pos.right = margin; pos.transform = 'translateY(-50%)' }
    else if (position === 'bl') { pos.bottom = margin; pos.left = margin }
    else if (position === 'bc') { pos.bottom = margin; pos.left = '50%'; pos.transform = 'translateX(-50%)' }
    else /* br */ { pos.bottom = margin; pos.right = margin }

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0,
            width: size.w, height: size.h,
            pointerEvents: 'none',
            zIndex: 10,
        }}>
            <img
                src={watermark.dataUrl}
                alt="watermark"
                draggable={false}
                style={{
                    ...pos,
                    width: logoW,
                    height: 'auto',
                    opacity,
                    display: 'block',
                    userSelect: 'none',
                }}
            />
        </div>
    )
}

// ── StickerLayer ───────────────────────────────────────────────
// Renders sticker overlays with selection handles and action toolbar.
// Active (sticker tool): selectable, draggable, resizable.
// Inactive: visible but non-interactive.

type StickerDragState =
    | { kind: 'move'; id: string; ox: number; oy: number }
    | { kind: 'resize'; id: string; startScale: number; startDist: number; cx: number; cy: number }

// 8 handle descriptors
const HANDLES = [
    { id: 'tl', x: 0, y: 0, cursor: 'nwse-resize' },
    { id: 't', x: 0.5, y: 0, cursor: 'ns-resize' },
    { id: 'tr', x: 1, y: 0, cursor: 'nesw-resize' },
    { id: 'r', x: 1, y: 0.5, cursor: 'ew-resize' },
    { id: 'br', x: 1, y: 1, cursor: 'nwse-resize' },
    { id: 'b', x: 0.5, y: 1, cursor: 'ns-resize' },
    { id: 'bl', x: 0, y: 1, cursor: 'nesw-resize' },
    { id: 'l', x: 0, y: 0.5, cursor: 'ew-resize' },
]

function StickerLayer({ imgEl, stickers, active, onChange }: {
    imgEl: HTMLImageElement
    stickers: StickerItem[]
    active: boolean
    onChange: (stickers: StickerItem[]) => void
}) {
    const [size, setSize] = useState({ w: 0, h: 0 })
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const dragRef = useRef<StickerDragState | null>(null)
    const stickersRef = useRef(stickers)
    const onChangeRef = useRef(onChange)
    const containerRef = useRef<HTMLDivElement>(null)
    useEffect(() => { stickersRef.current = stickers }, [stickers])
    useEffect(() => { onChangeRef.current = onChange }, [onChange])

    useEffect(() => {
        const sync = () => setSize({ w: imgEl.offsetWidth, h: imgEl.offsetHeight })
        if (imgEl.complete && imgEl.naturalWidth) sync()
        else imgEl.addEventListener('load', sync)
        const ro = new ResizeObserver(sync)
        ro.observe(imgEl)
        return () => { imgEl.removeEventListener('load', sync); ro.disconnect() }
    }, [imgEl])

    // Deselect when clicking outside any sticker
    function onContainerPointerDown(e: React.PointerEvent<HTMLDivElement>) {
        if (e.target === containerRef.current) setSelectedId(null)
    }

    // Sticker body: select + start move
    function onBodyPointerDown(e: React.PointerEvent<HTMLDivElement>, id: string) {
        if (!active) return
        e.stopPropagation()
        e.currentTarget.setPointerCapture(e.pointerId)
        setSelectedId(id)
        const ov = stickersRef.current.find(s => s.id === id)!
        const r = containerRef.current!.getBoundingClientRect()
        dragRef.current = {
            kind: 'move',
            id,
            ox: e.clientX / r.width - ov.x,
            oy: e.clientY / r.height - ov.y,
        }
    }

    // Handle: start resize
    function onHandlePointerDown(e: React.PointerEvent<HTMLDivElement>, id: string) {
        if (!active) return
        e.stopPropagation()
        e.currentTarget.setPointerCapture(e.pointerId)
        const ov = stickersRef.current.find(s => s.id === id)!
        const r = containerRef.current!.getBoundingClientRect()
        const cx = r.left + ov.x * r.width
        const cy = r.top + ov.y * r.height
        const dx = e.clientX - cx
        const dy = e.clientY - cy
        dragRef.current = {
            kind: 'resize',
            id,
            startScale: ov.scale,
            startDist: Math.max(10, Math.sqrt(dx * dx + dy * dy)),
            cx, cy,
        }
    }

    function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
        const d = dragRef.current
        if (!d) return
        const r = containerRef.current!.getBoundingClientRect()
        if (d.kind === 'move') {
            const nx = Math.max(0, Math.min(1, e.clientX / r.width - d.ox))
            const ny = Math.max(0, Math.min(1, e.clientY / r.height - d.oy))
            onChangeRef.current(stickersRef.current.map(s =>
                s.id === d.id ? { ...s, x: nx, y: ny } : s
            ))
        } else {
            const dx = e.clientX - d.cx
            const dy = e.clientY - d.cy
            const dist = Math.max(10, Math.sqrt(dx * dx + dy * dy))
            const ns = Math.max(0.3, Math.min(4, d.startScale * dist / d.startDist))
            onChangeRef.current(stickersRef.current.map(s =>
                s.id === d.id ? { ...s, scale: Math.round(ns * 10) / 10 } : s
            ))
        }
    }

    function onPointerUp() { dragRef.current = null }

    function deleteSticker(id: string) {
        const next = stickersRef.current.filter(s => s.id !== id)
        onChangeRef.current(next)
        setSelectedId(null)
    }

    function duplicateSticker(id: string) {
        const src = stickersRef.current.find(s => s.id === id)
        if (!src) return
        const clone: StickerItem = {
            ...src,
            id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            x: Math.min(0.9, src.x + 0.05),
            y: Math.min(0.9, src.y + 0.05),
        }
        onChangeRef.current([...stickersRef.current, clone])
        setSelectedId(clone.id)
    }

    if (!size.w || !size.h) return null

    return (
        <div
            ref={containerRef}
            onPointerDown={onContainerPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={{
                position: 'absolute', top: 0, left: 0,
                width: size.w, height: size.h,
                pointerEvents: active ? 'auto' : 'none',
                zIndex: 11,
            }}
        >
            {stickers.map(s => {
                const isEmoji = s.type === 'emoji'
                const dims = SHAPE_DIMS[s.shape]
                const baseW = size.w * 0.15
                const displayW = baseW * s.scale
                const displayH = isEmoji ? displayW : displayW * (dims.h / dims.w)
                const isSelected = active && selectedId === s.id
                const HANDLE_SZ = 10

                return (
                    <div
                        key={s.id}
                        onPointerDown={e => onBodyPointerDown(e, s.id)}
                        style={{
                            position: 'absolute',
                            left: `${s.x * 100}%`,
                            top: `${s.y * 100}%`,
                            transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
                            cursor: active ? 'move' : 'default',
                            userSelect: 'none',
                            touchAction: 'none',
                            width: displayW,
                            height: displayH,
                        }}
                    >
                        {/* Sticker image or emoji */}
                        {isEmoji ? (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: displayW * 0.72,
                                lineHeight: 1,
                                userSelect: 'none',
                            }}>
                                {s.emoji}
                            </div>
                        ) : (
                            <img
                                src={stickerToDataUrl(s)}
                                alt={s.label}
                                draggable={false}
                                style={{ width: '100%', height: '100%', display: 'block' }}
                            />
                        )}

                        {/* Selection border */}
                        {isSelected && (
                            <div style={{
                                position: 'absolute',
                                inset: -1,
                                border: '1.5px solid #3b82f6',
                                borderRadius: 3,
                                pointerEvents: 'none',
                            }} />
                        )}

                        {/* Resize handles */}
                        {isSelected && HANDLES.map(h => (
                            <div
                                key={h.id}
                                onPointerDown={e => onHandlePointerDown(e, s.id)}
                                style={{
                                    position: 'absolute',
                                    left: `${h.x * 100}%`,
                                    top: `${h.y * 100}%`,
                                    transform: 'translate(-50%, -50%)',
                                    width: HANDLE_SZ,
                                    height: HANDLE_SZ,
                                    background: '#ffffff',
                                    border: '2px solid #3b82f6',
                                    borderRadius: 2,
                                    cursor: h.cursor,
                                    zIndex: 1,
                                }}
                            />
                        ))}

                        {/* Toolbar — counter-rotated so it stays horizontal */}
                        {isSelected && (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: '50%',
                                    bottom: '100%',
                                    marginBottom: 10,
                                    transform: `translateX(-50%) rotate(-${s.rotation}deg)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    background: '#1e1535',
                                    borderRadius: 8,
                                    padding: '4px 6px',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                                    pointerEvents: 'auto',
                                    whiteSpace: 'nowrap',
                                    zIndex: 20,
                                }}
                            >
                                {/* Duplicate */}
                                <button
                                    onPointerDown={e => e.stopPropagation()}
                                    onClick={e => { e.stopPropagation(); duplicateSticker(s.id) }}
                                    title="Duplicate"
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#e2e8f0',
                                        cursor: 'pointer',
                                        padding: '3px 7px',
                                        borderRadius: 5,
                                        fontSize: 14,
                                        lineHeight: 1,
                                    }}
                                >⧉</button>

                                <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)' }} />

                                {/* Scale display */}
                                <span style={{ fontSize: 10, color: '#94a3b8', padding: '0 4px', fontWeight: 600 }}>
                                    ×{s.scale.toFixed(1)}
                                </span>

                                <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)' }} />

                                {/* Delete */}
                                <button
                                    onPointerDown={e => e.stopPropagation()}
                                    onClick={e => { e.stopPropagation(); deleteSticker(s.id) }}
                                    title="Delete"
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#f87171',
                                        cursor: 'pointer',
                                        padding: '3px 7px',
                                        borderRadius: 5,
                                        fontSize: 14,
                                        fontWeight: 700,
                                        lineHeight: 1,
                                    }}
                                >✕</button>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
