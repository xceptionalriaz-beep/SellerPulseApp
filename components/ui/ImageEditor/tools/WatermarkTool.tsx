'use client'
// components/ui/ImageEditor/tools/WatermarkTool.tsx

import React, { useRef, useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import type { ToolPanelProps, WatermarkPosition } from '../types'

// ── Tokens ─────────────────────────────────────────────────────
const C = {
    primary:      '#7530fb',
    primaryLight: '#f3eeff',
    primaryBorder:'#c4a8fd',
    primaryHov:   '#6020e0',
    border:       '#ede9fe',
    borderMid:    '#e5e7eb',
    label:        '#111827',
    sub:          '#6b7280',
    muted:        '#9ca3af',
    surface:      '#ffffff',
    sectionBg:    '#fafafa',
    hover:        '#f3f4f6',
}

// 9-position grid order
const POSITION_GRID: WatermarkPosition[] = [
    'tl', 'tc', 'tr',
    'ml', 'mc', 'mr',
    'bl', 'bc', 'br',
]

// Dot coordinates for each position (inside a 28×20 thumbnail)
const DOT_STYLE: Record<WatermarkPosition, React.CSSProperties> = {
    tl: { top: 3, left: 3 },
    tc: { top: 3, left: '50%', transform: 'translateX(-50%)' },
    tr: { top: 3, right: 3 },
    ml: { top: '50%', left: 3, transform: 'translateY(-50%)' },
    mc: { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' },
    mr: { top: '50%', right: 3, transform: 'translateY(-50%)' },
    bl: { bottom: 3, left: 3 },
    bc: { bottom: 3, left: '50%', transform: 'translateX(-50%)' },
    br: { bottom: 3, right: 3 },
}

// ── PositionCell ───────────────────────────────────────────────
function PositionCell({ pos, active, onClick }: {
    pos: WatermarkPosition; active: boolean; onClick: () => void
}) {
    const [hov, setHov] = useState(false)
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            title={pos.toUpperCase()}
            style={{
                position: 'relative',
                width: '100%', aspectRatio: '1.4 / 1',
                border: `1.5px solid ${active ? C.primary : hov ? C.sub : C.borderMid}`,
                borderRadius: 6,
                background: active ? C.primaryLight : hov ? C.hover : C.sectionBg,
                cursor: 'pointer', padding: 0, outline: 'none',
                transition: 'all 0.12s',
            }}
        >
            <div style={{
                position: 'absolute',
                width: 6, height: 6, borderRadius: '50%',
                background: active ? C.primary : C.muted,
                transition: 'background 0.1s',
                ...DOT_STYLE[pos],
            }} />
        </button>
    )
}

// ── Section ────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 10, overflow: 'hidden', marginBottom: 10,
        }}>
            <div style={{
                padding: '9px 14px', background: C.sectionBg,
                borderBottom: `1px solid ${C.border}`,
                fontSize: 11, fontWeight: 700, color: C.label, letterSpacing: '0.03em',
            }}>
                {title}
            </div>
            <div style={{ padding: '12px 14px' }}>{children}</div>
        </div>
    )
}

// ── Slider ─────────────────────────────────────────────────────
function Slider({ label, value, min, max, step, display, onChange }: {
    label: string; value: number; min: number; max: number; step: number
    display: string; onChange: (v: number) => void
}) {
    const pct = ((value - min) / (max - min)) * 100
    return (
        <>
            <style>{`
                .wm-slider{-webkit-appearance:none;appearance:none;width:100%;height:3px;
                  border-radius:999px;outline:none;cursor:pointer;border:none;display:block;}
                .wm-slider::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;
                  border-radius:50%;background:#7530fb;border:2px solid #fff;
                  box-shadow:0 1px 3px rgba(117,48,251,0.4);cursor:pointer;}
                .wm-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
                  background:#7530fb;border:2px solid #fff;cursor:pointer;}
            `}</style>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <span style={{ fontSize: 11, color: C.muted }}>{label}</span>
                <span style={{
                    fontSize: 12, fontWeight: 700, color: C.primary,
                    background: C.primaryLight, padding: '1px 8px', borderRadius: 5,
                    fontVariantNumeric: 'tabular-nums',
                }}>{display}</span>
            </div>
            <input
                type="range" className="wm-slider"
                min={min} max={max} step={step} value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                style={{
                    background: `linear-gradient(to right, ${C.primary} 0%, ${C.primary} ${pct}%, ${C.borderMid} ${pct}%, ${C.borderMid} 100%)`,
                }}
            />
        </>
    )
}

// ── WatermarkTool ──────────────────────────────────────────────
export default function WatermarkTool({ state, onChange }: ToolPanelProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [hovUpload, setHovUpload] = useState(false)

    const wm = state.watermark ?? {
        enabled: false, dataUrl: null, position: 'br' as WatermarkPosition,
        opacity: 0.75, size: 18, margin: 16,
    }
    const { enabled, dataUrl, position, opacity, size, margin } = wm

    function patch(partial: Partial<typeof wm>) {
        onChange({ watermark: { ...wm, ...partial } })
    }

    function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = ev => {
            const url = ev.target?.result as string
            patch({ dataUrl: url, enabled: true })
        }
        reader.readAsDataURL(file)
        e.target.value = ''  // reset so same file can be re-selected
    }

    function removeLogo() {
        patch({ dataUrl: null, enabled: false })
    }

    return (
        <div style={{ padding: '16px 14px' }}>
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />

            {/* Header */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.label }}>Watermark / Logo</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 1.5 }}>
                    Overlay your store logo to protect product images.
                </div>
            </div>

            {/* Upload / Preview */}
            {!dataUrl ? (
                <button
                    onClick={() => inputRef.current?.click()}
                    onMouseEnter={() => setHovUpload(true)}
                    onMouseLeave={() => setHovUpload(false)}
                    style={{
                        width: '100%', padding: '28px 16px', marginBottom: 14,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                        border: `2px dashed ${hovUpload ? C.primary : C.primaryBorder}`,
                        borderRadius: 12, cursor: 'pointer',
                        background: hovUpload ? C.primaryLight : C.surface,
                        color: hovUpload ? C.primary : C.sub,
                        transition: 'all 0.15s',
                    }}
                >
                    <Upload size={22} strokeWidth={1.8} />
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>Upload Logo</div>
                        <div style={{ fontSize: 11, marginTop: 2, color: C.muted }}>PNG with transparency recommended</div>
                    </div>
                </button>
            ) : (
                <>
                    {/* Logo preview row */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
                        padding: '10px 12px', borderRadius: 10,
                        background: C.sectionBg, border: `1px solid ${C.border}`,
                    }}>
                        {/* Checkerboard preview */}
                        <div style={{
                            width: 52, height: 52, borderRadius: 8, flexShrink: 0,
                            background: `repeating-conic-gradient(#e5e7eb 0% 25%, #f9fafb 0% 50%) 0 0 / 10px 10px`,
                            position: 'relative', overflow: 'hidden',
                            border: `1px solid ${C.borderMid}`,
                        }}>
                            <img src={dataUrl} alt="Logo" style={{
                                position: 'absolute', inset: 0, width: '100%', height: '100%',
                                objectFit: 'contain', padding: 4, boxSizing: 'border-box',
                            }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: C.label }}>Logo uploaded</div>
                            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Visible on canvas when enabled</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <button onClick={() => inputRef.current?.click()} style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '4px 9px', borderRadius: 6, cursor: 'pointer',
                                border: `1px solid ${C.border}`, background: C.surface,
                                color: C.sub, fontSize: 10, fontWeight: 600,
                            }}>
                                <ImageIcon size={10} />
                                Change
                            </button>
                            <button onClick={removeLogo} style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '4px 9px', borderRadius: 6, cursor: 'pointer',
                                border: `1px solid #fca5a5`, background: '#fef2f2',
                                color: '#ef4444', fontSize: 10, fontWeight: 600,
                            }}>
                                <X size={10} />
                                Remove
                            </button>
                        </div>
                    </div>

                    {/* Enable toggle */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', borderRadius: 8, marginBottom: 12,
                        background: enabled ? C.primaryLight : C.sectionBg,
                        border: `1px solid ${enabled ? C.primaryBorder : C.borderMid}`,
                    }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: enabled ? C.primary : C.sub }}>
                            {enabled ? 'Watermark ON' : 'Watermark OFF'}
                        </span>
                        <button
                            onClick={() => patch({ enabled: !enabled })}
                            style={{
                                width: 40, height: 22, borderRadius: 11, border: 'none',
                                background: enabled ? C.primary : C.borderMid,
                                position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                                flexShrink: 0,
                            }}
                        >
                            <div style={{
                                position: 'absolute', top: 3,
                                left: enabled ? 21 : 3,
                                width: 16, height: 16, borderRadius: '50%',
                                background: '#fff',
                                transition: 'left 0.2s',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            }} />
                        </button>
                    </div>

                    {/* Position grid */}
                    <Section title="POSITION">
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6,
                        }}>
                            {POSITION_GRID.map(pos => (
                                <PositionCell
                                    key={pos} pos={pos}
                                    active={position === pos}
                                    onClick={() => patch({ position: pos })}
                                />
                            ))}
                        </div>
                        <div style={{ fontSize: 10, color: C.muted, textAlign: 'center', marginTop: 7 }}>
                            Click a cell to set logo position
                        </div>
                    </Section>

                    {/* Opacity */}
                    <Section title="OPACITY">
                        <Slider
                            label="Transparency"
                            value={opacity} min={0.1} max={1} step={0.05}
                            display={`${Math.round(opacity * 100)}%`}
                            onChange={v => patch({ opacity: v })}
                        />
                    </Section>

                    {/* Size */}
                    <Section title="SIZE">
                        <Slider
                            label="Width (% of image)"
                            value={size} min={5} max={50} step={1}
                            display={`${size}%`}
                            onChange={v => patch({ size: v })}
                        />
                    </Section>

                    {/* Margin */}
                    <Section title="EDGE MARGIN">
                        <Slider
                            label="Distance from edge"
                            value={margin} min={4} max={60} step={2}
                            display={`${margin}px`}
                            onChange={v => patch({ margin: v })}
                        />
                    </Section>
                </>
            )}

            {/* Tip */}
            <div style={{
                padding: '10px 12px', borderRadius: 8, marginTop: 4,
                background: C.primaryLight, border: `1px solid ${C.primaryBorder}`,
                fontSize: 11, color: C.sub, lineHeight: 1.5,
            }}>
                <strong style={{ color: C.primary }}>Tip:</strong> Use a PNG logo with a
                transparent background. The watermark is baked in when you <strong>Download</strong> via Export.
            </div>
        </div>
    )
}
