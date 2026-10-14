'use client'
// components/ui/ImageEditor/ImageEditorModal.tsx
// ─────────────────────────────────────────────────────────────
// Full-screen image editor modal.
//
// Layout:
//   ┌──────────────────────────────────────────────────────┐
//   │  Header:  undo · redo │ [title] │ Cancel   Save      │
//   ├───────┬──────────────────────────────┬───────────────┤
//   │ Tool  │                              │               │
//   │ Icon  │     Canvas (gray bg)         │  Tool Panel   │
//   │ Strip │     image lives here         │  (per-tool    │
//   │ LEFT  │                              │   options)    │
//   │       │   [zoom controls below]      │   RIGHT       │
//   └───────┴──────────────────────────────┴───────────────┘
//
// Tools are added one-by-one in components/ui/ImageEditor/tools/.
// ─────────────────────────────────────────────────────────────

import { useState, useCallback, useMemo } from 'react'
import {
    X, Undo2, Redo2, ZoomIn, ZoomOut,
    SlidersHorizontal, Sliders, Crop, Maximize2,
    RotateCw, Pencil, Type, Square, Smile,
} from 'lucide-react'
import { ToolId, ImageEditorState, DEFAULT_STATE } from './types'

// ── Tool panel imports — add here as you build each one ────────────────
import AdjustTool  from './tools/AdjustTool'
import FilterTool  from './tools/FilterTool'
// import CropTool    from './tools/CropTool'
// import ResizeTool  from './tools/ResizeTool'
// import RotateTool  from './tools/RotateTool'
// import DrawTool    from './tools/DrawTool'
// import TextTool    from './tools/TextTool'
// import FrameTool   from './tools/FrameTool'

// ── Design tokens ──────────────────────────────────────────────────────
const C = {
    bg:           '#f0f0f0',   // canvas background
    surface:      '#ffffff',
    border:       '#e5e7eb',
    borderLight:  '#f3f4f6',
    toolBg:       '#fafafa',   // left tool strip background
    toolActive:   '#7530fb',   // Riazify primary
    toolActiveT:  '#ffffff',
    toolHov:      '#f3eeff',
    toolHovT:     '#7530fb',
    toolDefault:  '#6b7280',
    panelHdr:     '#f9fafb',
    dark:         '#111827',
    body:         '#374151',
    muted:        '#9ca3af',
    primary:      '#7530fb',
    primaryLight: '#f3eeff',
    primaryHov:   '#6020e0',
    danger:       '#ef4444',
    success:      '#16a34a',
}

// ── Tool definitions ───────────────────────────────────────────────────
interface ToolDef {
    id:    ToolId
    label: string
    icon:  React.ReactNode
}

const TOOLS: ToolDef[] = [
    { id: 'adjust', label: 'Adjust',  icon: <SlidersHorizontal size={19} /> },
    { id: 'filter', label: 'Filter',  icon: <Sliders size={19} /> },
    { id: 'crop',   label: 'Crop',    icon: <Crop size={19} /> },
    { id: 'resize', label: 'Resize',  icon: <Maximize2 size={19} /> },
    { id: 'rotate', label: 'Rotate',  icon: <RotateCw size={19} /> },
    { id: 'draw',   label: 'Draw',    icon: <Pencil size={19} /> },
    { id: 'text',   label: 'Text',    icon: <Type size={19} /> },
    { id: 'frame',  label: 'Frame',   icon: <Square size={19} /> },
]

// ── Props ──────────────────────────────────────────────────────────────
export interface ImageEditorModalProps {
    imageUrl:   string
    imageName?: string
    onSave:  (editedUrl: string, state: ImageEditorState) => void
    onClose: () => void
}

// ── History stack entry ────────────────────────────────────────────────
type HistoryEntry = ImageEditorState

// ── Main component ─────────────────────────────────────────────────────
export default function ImageEditorModal({
    imageUrl,
    imageName,
    onSave,
    onClose,
}: ImageEditorModalProps) {
    const [activeTool, setActiveTool] = useState<ToolId>('adjust')
    const [zoom, setZoom]             = useState(100)
    const [hovTool, setHovTool]       = useState<ToolId | null>(null)

    // ── Edit state + history ───────────────────────────────────────────
    const [history, setHistory]   = useState<HistoryEntry[]>([DEFAULT_STATE])
    const [histIdx, setHistIdx]   = useState(0)
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

    // ── CSS filter string from state ───────────────────────────────────
    const cssFilter = useMemo(() => {
        const {
            brightness, contrast, saturation, sharpness,
            activeFilter, filterIntensity,
            hue, blur, gamma, vibrance,
        } = editorState

        // safe defaults for new fields
        const _intensity  = filterIntensity ?? 100
        const _hue        = hue        ?? 0
        const _blur       = blur       ?? 0
        const _gamma      = gamma      ?? 1
        const _vibrance   = vibrance   ?? 0

        // Preset CSS map (mirrors FilterTool.tsx PRESETS)
        const PRESET_CSS: Record<string, string> = {
            none:        '',
            grayscale:   'grayscale(100%)',
            sepia:       'sepia(90%)',
            vintage:     'sepia(50%) contrast(110%) brightness(88%) saturate(75%)',
            polaroid:    'contrast(115%) brightness(108%) saturate(75%) sepia(15%)',
            chrome:      'contrast(125%) saturate(160%) brightness(95%)',
            fade:        'contrast(88%) brightness(112%) saturate(70%)',
            kodachrome:  'contrast(120%) saturate(115%) hue-rotate(12deg) brightness(88%)',
            technicolor: 'saturate(155%) hue-rotate(-28deg) contrast(118%)',
            brownie:     'sepia(55%) saturate(45%) contrast(108%) brightness(92%)',
            noir:        'grayscale(100%) contrast(135%) brightness(75%)',
            vivid:       'saturate(185%) contrast(112%) brightness(102%)',
            matte:       'contrast(82%) brightness(115%) saturate(65%)',
            blueprint:   'sepia(100%) hue-rotate(185deg) saturate(210%)',
            cool:        'hue-rotate(195deg) saturate(125%) brightness(106%)',
            warm:        'hue-rotate(-22deg) saturate(135%) brightness(106%)',
            emboss:      'grayscale(100%) contrast(210%) brightness(108%)',
            invert:      'invert(100%)',
        }

        const parts: string[] = []

        // 1. Preset (scaled by intensity)
        const presetCss = PRESET_CSS[activeFilter] || ''
        if (presetCss && _intensity > 0) {
            // apply intensity as opacity approximation via separate wrapper;
            // for the filter string itself, just push the preset directly
            parts.push(presetCss)
        }

        // 2. Adjust tool — brightness / contrast / saturation
        if (brightness !== 0) parts.push(`brightness(${(1 + brightness / 100).toFixed(3)})`)
        if (contrast   !== 0) parts.push(`contrast(${(1 + contrast   / 100).toFixed(3)})`)
        if (saturation !== 0) parts.push(`saturate(${Math.max(0, 1 + saturation / 100).toFixed(3)})`)

        // 3. Sharpness → approximate with contrast bump
        if (sharpness && sharpness > 0) parts.push(`contrast(${(1 + sharpness * 0.004).toFixed(3)})`)

        // 4. Gamma → approximate with brightness curve
        if (_gamma !== 1) parts.push(`brightness(${(_gamma * 0.7 + 0.3).toFixed(3)})`)

        // 5. Vibrance → saturate approximation
        if (_vibrance !== 0) parts.push(`saturate(${Math.max(0, 1 + _vibrance / 80).toFixed(3)})`)

        // 6. Hue shift
        if (_hue !== 0) parts.push(`hue-rotate(${_hue}deg)`)

        // 7. Blur
        if (_blur > 0) parts.push(`blur(${_blur}px)`)

        return parts.length ? parts.join(' ') : 'none'
    }, [editorState])

    const cssTransform = useMemo(() => {
        const { rotation, flipH, flipV } = editorState
        const parts: string[] = []
        if (rotation) parts.push(`rotate(${rotation}deg)`)
        if (flipH)    parts.push('scaleX(-1)')
        if (flipV)    parts.push('scaleY(-1)')
        return parts.length ? parts.join(' ') : 'none'
    }, [editorState])

    // ── Render tool panel (slot — replace placeholders as tools are built) ─
    function renderToolPanel() {
        const common = { state: editorState, onChange: pushState, imageUrl }
        switch (activeTool) {
            // Uncomment as each tool is built:
            case 'adjust': return <AdjustTool {...common} />
            case 'filter': return <FilterTool {...common} />
            // case 'crop':   return <CropTool   {...common} />
            // case 'resize': return <ResizeTool {...common} />
            // case 'rotate': return <RotateTool {...common} />
            // case 'draw':   return <DrawTool   {...common} />
            // case 'text':   return <TextTool   {...common} />
            // case 'frame':  return <FrameTool  {...common} />
            default:
                return <PlaceholderPanel tool={TOOLS.find(t => t.id === activeTool)!} />
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', flexDirection: 'column',
            backgroundColor: C.surface,
            fontFamily: 'DM Sans, sans-serif',
        }}>

            {/* ── Header ──────────────────────────────────────────────── */}
            <div style={{
                height: 52, flexShrink: 0,
                display: 'flex', alignItems: 'center',
                padding: '0 16px', gap: 12,
                borderBottom: `1px solid ${C.border}`,
                backgroundColor: C.surface,
            }}>
                {/* Left: undo / redo */}
                <div style={{ display: 'flex', gap: 2 }}>
                    <HdrButton onClick={undo} disabled={!canUndo} title="Undo">
                        <Undo2 size={15} />
                    </HdrButton>
                    <HdrButton onClick={redo} disabled={!canRedo} title="Redo">
                        <Redo2 size={15} />
                    </HdrButton>
                </div>

                {/* Centre: image name */}
                <div style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.dark }}>
                        {imageName || 'Edit Image'}
                    </span>
                </div>

                {/* Right: cancel / save */}
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '6px 16px', borderRadius: 8,
                            border: `1px solid ${C.border}`,
                            background: C.surface, color: C.body,
                            fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(imageUrl, editorState)}
                        style={{
                            padding: '6px 20px', borderRadius: 8,
                            border: 'none', background: C.primary, color: '#fff',
                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>

            {/* ── Body ────────────────────────────────────────────────── */}
            <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>

                {/* LEFT — tool icon strip */}
                <div style={{
                    width: 68, flexShrink: 0,
                    backgroundColor: C.toolBg,
                    borderRight: `1px solid ${C.border}`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center',
                    padding: '10px 0', gap: 2,
                    overflowY: 'auto',
                }}>
                    {TOOLS.map(tool => {
                        const isActive = activeTool === tool.id
                        const isHov    = hovTool === tool.id && !isActive
                        return (
                            <button
                                key={tool.id}
                                onClick={() => setActiveTool(tool.id)}
                                onMouseEnter={() => setHovTool(tool.id)}
                                onMouseLeave={() => setHovTool(null)}
                                title={tool.label}
                                style={{
                                    width: 54, padding: '9px 0',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    gap: 4, border: 'none', cursor: 'pointer',
                                    borderRadius: 10,
                                    backgroundColor: isActive
                                        ? C.toolActive
                                        : isHov ? C.toolHov : 'transparent',
                                    color: isActive
                                        ? C.toolActiveT
                                        : isHov ? C.toolHovT : C.toolDefault,
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                {tool.icon}
                                <span style={{
                                    fontSize: 9.5, fontWeight: 600, letterSpacing: 0.2,
                                    lineHeight: 1,
                                }}>
                                    {tool.label}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* CENTRE — canvas */}
                <div style={{
                    flex: 1, position: 'relative',
                    backgroundColor: C.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                }}>
                    {/* Image */}
                    <div style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.18s ease',
                        boxShadow: '0 4px 32px rgba(0,0,0,0.16)',
                        borderRadius: 2,
                        lineHeight: 0,
                    }}>
                        <img
                            src={imageUrl}
                            alt={imageName || 'Editing'}
                            draggable={false}
                            style={{
                                display: 'block',
                                maxWidth: '70vw',
                                maxHeight: '70vh',
                                filter: cssFilter,
                                transform: cssTransform,
                                transition: 'filter 0.2s ease, transform 0.2s ease',
                                userSelect: 'none',
                            }}
                        />
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
                        <span
                            onClick={() => setZoom(100)}
                            title="Reset zoom"
                            style={{ fontSize: 12, fontWeight: 600, color: C.dark, minWidth: 38, textAlign: 'center', cursor: 'pointer' }}
                        >
                            {zoom}%
                        </span>
                        <ZoomPillButton onClick={() => setZoom(z => Math.min(400, z + 10))} disabled={zoom >= 400}>
                            <ZoomIn size={13} />
                        </ZoomPillButton>
                    </div>
                </div>

                {/* RIGHT — tool panel */}
                <div style={{
                    width: 288, flexShrink: 0,
                    backgroundColor: C.surface,
                    borderLeft: `1px solid ${C.border}`,
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                }}>
                    {/* Panel header */}
                    <div style={{
                        padding: '13px 16px 11px',
                        borderBottom: `1px solid ${C.border}`,
                        backgroundColor: C.panelHdr,
                        display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: 7,
                            backgroundColor: C.primaryLight,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: C.primary, flexShrink: 0,
                        }}>
                            {TOOLS.find(t => t.id === activeTool)?.icon}
                        </div>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: 0 }}>
                                {TOOLS.find(t => t.id === activeTool)?.label}
                            </p>
                        </div>
                    </div>

                    {/* Panel body — each tool renders here */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {renderToolPanel()}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Placeholder panel (shown until a real tool is built) ───────────────
function PlaceholderPanel({ tool }: { tool: ToolDef }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '48px 24px', gap: 14, textAlign: 'center',
        }}>
            <div style={{
                width: 52, height: 52, borderRadius: 14,
                backgroundColor: '#f3eeff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#7530fb',
            }}>
                {tool.icon}
            </div>
            <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1e1535', margin: '0 0 6px', fontFamily: 'DM Sans, sans-serif' }}>
                    {tool.label} Tool
                </p>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6 }}>
                    This tool is coming soon.
                    <br />
                    Building one tool at a time.
                </p>
            </div>
        </div>
    )
}

// ── Tiny reusable buttons ──────────────────────────────────────────────
function HdrButton({
    children, onClick, disabled, title,
}: { children: React.ReactNode; onClick: () => void; disabled?: boolean; title?: string }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            style={{
                width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', background: 'none', borderRadius: 6,
                cursor: disabled ? 'not-allowed' : 'pointer',
                color: disabled ? '#d1d5db' : '#6b7280',
            }}
        >
            {children}
        </button>
    )
}

function ZoomPillButton({
    children, onClick, disabled,
}: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', background: 'none', borderRadius: 4,
                cursor: disabled ? 'not-allowed' : 'pointer',
                color: disabled ? '#d1d5db' : '#374151',
            }}
        >
            {children}
        </button>
    )
}
