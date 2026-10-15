'use client'
// components/ui/ImageEditor/tools/DrawTool.tsx

import React, { useState } from 'react'
import { Pen, Eraser, Trash2 } from 'lucide-react'
import type { ToolPanelProps } from '../types'

// ── Tokens ─────────────────────────────────────────────────────
const C = {
    primary:      '#7530fb',
    primaryLight: '#f3eeff',
    primaryBorder:'#c4a8fd',
    border:       '#ede9fe',
    borderMid:    '#e5e7eb',
    label:        '#111827',
    sub:          '#6b7280',
    muted:        '#9ca3af',
    surface:      '#ffffff',
    sectionBg:    '#fafafa',
    hover:        '#f3f4f6',
    danger:       '#ef4444',
    dangerLight:  '#fef2f2',
    dangerBorder: '#fca5a5',
}

// ── Preset color palette ───────────────────────────────────────
const PALETTE = [
    // Row 1 – neutrals
    '#000000', '#374151', '#6b7280', '#d1d5db', '#ffffff',
    // Row 2 – warm
    '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e',
    // Row 3 – cool
    '#14b8a6', '#3b82f6', '#6366f1', '#7530fb', '#ec4899',
    // Row 4 – earthy
    '#92400e', '#78350f', '#b45309', '#d97706', '#fbbf24',
]

// ── Section wrapper ────────────────────────────────────────────
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
            <div style={{ padding: '12px 14px' }}>
                {children}
            </div>
        </div>
    )
}

// ── ModeTab ────────────────────────────────────────────────────
function ModeTab({ label, icon, active, onClick }: {
    label: string; icon: React.ReactNode; active: boolean; onClick: () => void
}) {
    const [hov, setHov] = useState(false)
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                flex: 1, padding: '10px 8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                border: `1.5px solid ${active ? C.primaryBorder : C.borderMid}`,
                borderRadius: 9,
                background: active ? C.primaryLight : hov ? C.hover : C.surface,
                cursor: 'pointer', transition: 'all 0.13s',
                color: active ? C.primary : C.sub,
                fontSize: 12, fontWeight: 700,
            }}
        >
            {icon}
            {label}
        </button>
    )
}

// ── ColorSwatch ───────────────────────────────────────────────
function ColorSwatch({ color, active, onClick }: {
    color: string; active: boolean; onClick: () => void
}) {
    const [hov, setHov] = useState(false)
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            title={color}
            style={{
                width: 26, height: 26, borderRadius: 6,
                background: color,
                border: active
                    ? `2.5px solid ${C.primary}`
                    : hov
                        ? `2px solid ${C.sub}`
                        : color === '#ffffff' ? `1.5px solid ${C.borderMid}` : '2px solid transparent',
                cursor: 'pointer', transition: 'border 0.1s',
                boxShadow: active ? `0 0 0 2px ${C.primaryLight}` : 'none',
                outline: 'none', padding: 0,
            }}
        />
    )
}

// ── DrawTool ───────────────────────────────────────────────────
export default function DrawTool({ state, onChange }: ToolPanelProps) {
    const [hovClear, setHovClear] = useState(false)

    const ds = state.drawSettings
    const mode      = ds.mode
    const color     = ds.color
    const lineWidth = ds.lineWidth
    const opacity   = ds.opacity

    function patch(partial: Partial<typeof ds>) {
        onChange({ drawSettings: { ...ds, ...partial } })
    }

    // Slider fill pct helpers
    const widthPct   = ((lineWidth - 1) / 39) * 100
    const opacityPct = opacity * 100

    return (
        <div style={{ padding: '16px 14px' }}>
            <style>{`
                .draw-slider{-webkit-appearance:none;appearance:none;width:100%;height:3px;
                  border-radius:999px;outline:none;cursor:pointer;border:none;display:block;}
                .draw-slider::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;
                  border-radius:50%;background:#7530fb;border:2px solid #fff;
                  box-shadow:0 1px 3px rgba(117,48,251,0.4);cursor:pointer;transition:transform 0.1s;}
                .draw-slider::-webkit-slider-thumb:hover{transform:scale(1.2);}
                .draw-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
                  background:#7530fb;border:2px solid #fff;
                  box-shadow:0 1px 3px rgba(117,48,251,0.4);cursor:pointer;}
            `}</style>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.label }}>Draw on Image</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                        Paint, annotate or erase
                    </div>
                </div>
                {/* Clear canvas button — triggers custom event */}
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('draw:clear'))}
                    onMouseEnter={() => setHovClear(true)}
                    onMouseLeave={() => setHovClear(false)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                        background: hovClear ? C.dangerLight : C.sectionBg,
                        border: `1px solid ${hovClear ? C.dangerBorder : C.border}`,
                        color: hovClear ? C.danger : C.sub,
                        fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
                    }}
                >
                    <Trash2 size={11} />
                    Clear
                </button>
            </div>

            {/* Mode */}
            <Section title="MODE">
                <div style={{ display: 'flex', gap: 8 }}>
                    <ModeTab
                        label="Pen"
                        icon={<Pen size={15} strokeWidth={2} />}
                        active={mode === 'pen'}
                        onClick={() => patch({ mode: 'pen' })}
                    />
                    <ModeTab
                        label="Eraser"
                        icon={<Eraser size={15} strokeWidth={2} />}
                        active={mode === 'eraser'}
                        onClick={() => patch({ mode: 'eraser' })}
                    />
                </div>
            </Section>

            {/* Color */}
            {mode === 'pen' && (
                <Section title="COLOR">
                    {/* Palette grid */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: 6, marginBottom: 12,
                    }}>
                        {PALETTE.map(c => (
                            <ColorSwatch
                                key={c}
                                color={c}
                                active={color === c}
                                onClick={() => patch({ color: c })}
                            />
                        ))}
                    </div>

                    {/* Custom color row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            position: 'relative', width: 32, height: 32, borderRadius: 7,
                            border: `1.5px solid ${C.borderMid}`, overflow: 'hidden',
                            flexShrink: 0, cursor: 'pointer',
                        }}>
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: color, pointerEvents: 'none',
                            }} />
                            <input
                                type="color"
                                value={color}
                                onChange={e => patch({ color: e.target.value })}
                                style={{
                                    position: 'absolute', inset: 0,
                                    width: '200%', height: '200%',
                                    opacity: 0, cursor: 'pointer',
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>Hex</div>
                            <input
                                type="text"
                                value={color}
                                maxLength={7}
                                onChange={e => {
                                    const v = e.target.value
                                    if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) patch({ color: v })
                                }}
                                onBlur={e => {
                                    if (!/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) patch({ color: '#000000' })
                                }}
                                style={{
                                    width: '100%', padding: '4px 8px',
                                    border: `1px solid ${C.borderMid}`, borderRadius: 6,
                                    fontSize: 12, fontFamily: 'monospace',
                                    color: C.label, background: C.surface,
                                    outline: 'none', boxSizing: 'border-box',
                                }}
                            />
                        </div>
                        {/* Current color preview swatch */}
                        <div style={{
                            width: 32, height: 32, borderRadius: 7, flexShrink: 0,
                            background: `repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 8px 8px`,
                            position: 'relative', overflow: 'hidden',
                            border: `1.5px solid ${C.borderMid}`,
                        }}>
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: color,
                                opacity,
                            }} />
                        </div>
                    </div>
                </Section>
            )}

            {/* Brush size */}
            <Section title="BRUSH SIZE">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    {/* Live preview circle */}
                    <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        border: `1.5px dashed ${C.borderMid}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, background: C.sectionBg,
                    }}>
                        <div style={{
                            borderRadius: '50%',
                            background: mode === 'eraser' ? C.border : color,
                            opacity: mode === 'eraser' ? 0.5 : opacity,
                            width:  Math.min(lineWidth, 44),
                            height: Math.min(lineWidth, 44),
                            transition: 'all 0.1s',
                        }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            marginBottom: 8,
                        }}>
                            <span style={{ fontSize: 11, color: C.muted }}>Size</span>
                            <span style={{
                                fontSize: 12, fontWeight: 700, color: C.primary,
                                background: C.primaryLight, padding: '1px 8px', borderRadius: 5,
                                fontVariantNumeric: 'tabular-nums',
                            }}>{lineWidth}px</span>
                        </div>
                        <input
                            type="range"
                            className="draw-slider"
                            min={1} max={40} step={1}
                            value={lineWidth}
                            onChange={e => patch({ lineWidth: parseInt(e.target.value) })}
                            style={{
                                background: `linear-gradient(to right, ${C.primary} 0%, ${C.primary} ${widthPct}%, ${C.borderMid} ${widthPct}%, ${C.borderMid} 100%)`,
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                            <span style={{ fontSize: 10, color: C.muted }}>1px</span>
                            <span style={{ fontSize: 10, color: C.muted }}>40px</span>
                        </div>
                    </div>
                </div>

                {/* Quick size pills */}
                <div style={{ display: 'flex', gap: 5 }}>
                    {[2, 4, 8, 14, 22, 32].map(sz => (
                        <SizePill key={sz} size={sz} active={lineWidth === sz} onClick={() => patch({ lineWidth: sz })} />
                    ))}
                </div>
            </Section>

            {/* Opacity */}
            {mode === 'pen' && (
                <Section title="OPACITY">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: C.muted }}>Transparency</span>
                        <span style={{
                            fontSize: 12, fontWeight: 700, color: C.primary,
                            background: C.primaryLight, padding: '1px 8px', borderRadius: 5,
                            fontVariantNumeric: 'tabular-nums',
                        }}>{Math.round(opacity * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        className="draw-slider"
                        min={0} max={1} step={0.01}
                        value={opacity}
                        onChange={e => patch({ opacity: parseFloat(e.target.value) })}
                        style={{
                            background: `linear-gradient(to right, ${C.primary} 0%, ${C.primary} ${opacityPct}%, ${C.borderMid} ${opacityPct}%, ${C.borderMid} 100%)`,
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: C.muted }}>0%</span>
                        <span style={{ fontSize: 10, color: C.muted }}>100%</span>
                    </div>
                </Section>
            )}

            {/* Tip */}
            <div style={{
                padding: '10px 12px', borderRadius: 8,
                background: C.primaryLight, border: `1px solid ${C.primaryBorder}`,
                fontSize: 11, color: C.sub, lineHeight: 1.5,
            }}>
                <strong style={{ color: C.primary }}>Tip:</strong> Click and drag on the image to draw.
                Switch to <strong>Eraser</strong> to remove strokes. Use <strong>Clear</strong> to wipe all drawing.
            </div>
        </div>
    )
}

// ── SizePill — separate component for hover state (no hooks in map) ──
function SizePill({ size, active, onClick }: { size: number; active: boolean; onClick: () => void }) {
    const [hov, setHov] = useState(false)
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                flex: 1, padding: '5px 2px',
                border: `1.5px solid ${active ? '#c4a8fd' : '#e5e7eb'}`,
                borderRadius: 7,
                background: active ? '#f3eeff' : hov ? '#f3f4f6' : '#ffffff',
                color: active ? '#7530fb' : '#6b7280',
                fontSize: 10, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.12s',
            }}
        >
            {size}
        </button>
    )
}
