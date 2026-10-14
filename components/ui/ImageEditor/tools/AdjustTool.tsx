'use client'
// components/ui/ImageEditor/tools/AdjustTool.tsx
// ─────────────────────────────────────────────────────────────
// Adjust tool — brightness, contrast, saturation, sharpness
// ─────────────────────────────────────────────────────────────

import React from 'react'
import type { ToolPanelProps } from '../types'

// ── Design tokens ─────────────────────────────────────────────
const C = {
    primary:      '#7530fb',
    primaryLight: '#f3eeff',
    primaryHov:   '#6020e0',
    border:       '#ede9fe',
    label:        '#374151',
    muted:        '#9ca3af',
    value:        '#7530fb',
    reset:        '#6b7280',
    resetHov:     '#374151',
    track:        '#e5e7eb',
    surface:      '#ffffff',
    sectionBg:    '#fafafa',
}

// ── Types ─────────────────────────────────────────────────────
interface SliderRowProps {
    label:    string
    value:    number
    min:      number
    max:      number
    onChange: (v: number) => void
    onReset:  () => void
    default?: number
}

// ── SliderRow sub-component ───────────────────────────────────
function SliderRow({ label, value, min, max, onChange, onReset, default: def = 0 }: SliderRowProps) {
    const [hovReset, setHovReset] = React.useState(false)

    const pct = ((value - min) / (max - min)) * 100

    const trackStyle: React.CSSProperties = {
        WebkitAppearance: 'none',
        appearance: 'none',
        width: '100%',
        height: 4,
        borderRadius: 999,
        outline: 'none',
        cursor: 'pointer',
        background: `linear-gradient(to right, ${C.primary} ${pct}%, ${C.track} ${pct}%)`,
        border: 'none',
    }

    const isDirty = value !== def

    return (
        <div style={{ marginBottom: 20 }}>
            {/* Label row */}
            <div style={{
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'center',
                marginBottom:   8,
            }}>
                <span style={{
                    fontSize:   13,
                    fontWeight: 600,
                    color:      C.label,
                    letterSpacing: '0.01em',
                }}>
                    {label}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Numeric value badge */}
                    <span style={{
                        fontSize:        12,
                        fontWeight:      700,
                        color:           isDirty ? C.value : C.muted,
                        background:      isDirty ? C.primaryLight : 'transparent',
                        padding:         isDirty ? '2px 7px' : '2px 4px',
                        borderRadius:    6,
                        minWidth:        36,
                        textAlign:       'right',
                        transition:      'all 0.15s ease',
                    }}>
                        {value > 0 ? `+${value}` : value}
                    </span>

                    {/* Reset button */}
                    {isDirty && (
                        <button
                            onClick={onReset}
                            onMouseEnter={() => setHovReset(true)}
                            onMouseLeave={() => setHovReset(false)}
                            title="Reset to default"
                            style={{
                                background:  'none',
                                border:      'none',
                                cursor:      'pointer',
                                padding:     '2px 4px',
                                borderRadius: 4,
                                color:       hovReset ? C.resetHov : C.reset,
                                fontSize:    10,
                                fontWeight:  600,
                                transition:  'color 0.1s',
                            }}
                        >
                            ↺
                        </button>
                    )}
                </div>
            </div>

            {/* Slider */}
            <style>{`
                .riazify-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #7530fb;
                    cursor: pointer;
                    border: 2px solid #ffffff;
                    box-shadow: 0 1px 4px rgba(117,48,251,0.35);
                    transition: transform 0.1s ease;
                }
                .riazify-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.15);
                }
                .riazify-slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #7530fb;
                    cursor: pointer;
                    border: 2px solid #ffffff;
                    box-shadow: 0 1px 4px rgba(117,48,251,0.35);
                }
            `}</style>
            <input
                type="range"
                className="riazify-slider"
                min={min}
                max={max}
                value={value}
                onChange={e => onChange(Number(e.target.value))}
                style={trackStyle}
            />

            {/* Min/max labels */}
            <div style={{
                display:        'flex',
                justifyContent: 'space-between',
                marginTop:      4,
            }}>
                <span style={{ fontSize: 10, color: C.muted }}>{min}</span>
                <span style={{ fontSize: 10, color: C.muted }}>0</span>
                <span style={{ fontSize: 10, color: C.muted }}>{max}</span>
            </div>
        </div>
    )
}

// ── Main AdjustTool ───────────────────────────────────────────
export default function AdjustTool({ state, onChange }: ToolPanelProps) {
    const allDirty =
        state.brightness !== 0 ||
        state.contrast   !== 0 ||
        state.saturation !== 0 ||
        state.sharpness  !== 0

    const [hovResetAll, setHovResetAll] = React.useState(false)

    return (
        <div style={{ padding: '4px 0' }}>

            {/* Header */}
            <div style={{
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'center',
                marginBottom:   20,
                paddingBottom:  14,
                borderBottom:   `1px solid ${C.border}`,
            }}>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                        Adjustments
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                        Fine-tune light, color & clarity
                    </div>
                </div>

                {allDirty && (
                    <button
                        onClick={() => onChange({ brightness: 0, contrast: 0, saturation: 0, sharpness: 0 })}
                        onMouseEnter={() => setHovResetAll(true)}
                        onMouseLeave={() => setHovResetAll(false)}
                        style={{
                            background:   hovResetAll ? '#fef2f2' : C.sectionBg,
                            border:       `1px solid ${hovResetAll ? '#fca5a5' : C.border}`,
                            borderRadius: 6,
                            padding:      '4px 10px',
                            fontSize:     11,
                            fontWeight:   600,
                            color:        hovResetAll ? '#dc2626' : C.reset,
                            cursor:       'pointer',
                            transition:   'all 0.15s ease',
                        }}
                    >
                        Reset all
                    </button>
                )}
            </div>

            {/* ── Light section ──────────────────────────────── */}
            <div style={{
                background:   C.sectionBg,
                border:       `1px solid ${C.border}`,
                borderRadius: 10,
                padding:      '14px 16px',
                marginBottom: 12,
            }}>
                <div style={{
                    fontSize:     10,
                    fontWeight:   700,
                    color:        C.primary,
                    letterSpacing:'0.08em',
                    textTransform:'uppercase',
                    marginBottom: 14,
                }}>
                    ☀ Light
                </div>

                <SliderRow
                    label="Brightness"
                    value={state.brightness}
                    min={-100} max={100}
                    onChange={v => onChange({ brightness: v })}
                    onReset={() => onChange({ brightness: 0 })}
                />
                <SliderRow
                    label="Contrast"
                    value={state.contrast}
                    min={-100} max={100}
                    onChange={v => onChange({ contrast: v })}
                    onReset={() => onChange({ contrast: 0 })}
                />
            </div>

            {/* ── Color section ──────────────────────────────── */}
            <div style={{
                background:   C.sectionBg,
                border:       `1px solid ${C.border}`,
                borderRadius: 10,
                padding:      '14px 16px',
                marginBottom: 12,
            }}>
                <div style={{
                    fontSize:     10,
                    fontWeight:   700,
                    color:        C.primary,
                    letterSpacing:'0.08em',
                    textTransform:'uppercase',
                    marginBottom: 14,
                }}>
                    🎨 Color
                </div>

                <SliderRow
                    label="Saturation"
                    value={state.saturation}
                    min={-100} max={100}
                    onChange={v => onChange({ saturation: v })}
                    onReset={() => onChange({ saturation: 0 })}
                />
            </div>

            {/* ── Detail section ─────────────────────────────── */}
            <div style={{
                background:   C.sectionBg,
                border:       `1px solid ${C.border}`,
                borderRadius: 10,
                padding:      '14px 16px',
            }}>
                <div style={{
                    fontSize:     10,
                    fontWeight:   700,
                    color:        C.primary,
                    letterSpacing:'0.08em',
                    textTransform:'uppercase',
                    marginBottom: 14,
                }}>
                    🔍 Detail
                </div>

                <SliderRow
                    label="Sharpness"
                    value={state.sharpness}
                    min={0} max={100}
                    default={0}
                    onChange={v => onChange({ sharpness: v })}
                    onReset={() => onChange({ sharpness: 0 })}
                />
            </div>

        </div>
    )
}
