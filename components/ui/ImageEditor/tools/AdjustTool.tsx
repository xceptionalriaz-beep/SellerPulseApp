'use client'
// components/ui/ImageEditor/tools/AdjustTool.tsx

import React from 'react'
import { Sun, Contrast, Droplets, ScanSearch, PaintBucket } from 'lucide-react'
import type { ToolPanelProps } from '../types'

// ── Tokens ────────────────────────────────────────────────────
const C = {
    primary:      '#7530fb',
    primaryLight: '#f3eeff',
    border:       '#ede9fe',
    borderMid:    '#e5e7eb',
    label:        '#111827',
    sub:          '#6b7280',
    muted:        '#9ca3af',
    surface:      '#ffffff',
    sectionBg:    '#fafafa',
    danger:       '#ef4444',
    dangerLight:  '#fef2f2',
    dangerBorder: '#fca5a5',
}

// ── Slider row ────────────────────────────────────────────────
interface SliderRowProps {
    label:    string
    hint:     string
    value:    number
    min:      number
    max:      number
    step?:    number
    onChange: (v: number) => void
    onReset:  () => void
    default?: number
}

function SliderRow({
    label, hint, value, min, max, step = 1,
    onChange, onReset, default: def = 0,
}: SliderRowProps) {
    const [hov, setHov] = React.useState(false)
    const isDirty = value !== def
    const pct     = ((value - min) / (max - min)) * 100

    return (
        <div style={{ marginBottom: 18 }}>
            {/* Label + value */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.label }}>{label}</span>
                    <span style={{ fontSize: 11, color: C.muted, marginLeft: 6 }}>{hint}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                        fontSize:     12,
                        fontWeight:   700,
                        color:        isDirty ? C.primary : C.muted,
                        background:   isDirty ? C.primaryLight : 'transparent',
                        padding:      isDirty ? '1px 8px' : '1px 0',
                        borderRadius: 5,
                        minWidth:     34,
                        textAlign:    'right',
                        transition:   'all 0.15s',
                        fontVariantNumeric: 'tabular-nums',
                    }}>
                        {value > 0 ? `+${value}` : value}
                    </span>

                    {isDirty && (
                        <button
                            onClick={onReset}
                            onMouseEnter={() => setHov(true)}
                            onMouseLeave={() => setHov(false)}
                            title="Reset"
                            style={{
                                display:      'flex',
                                alignItems:   'center',
                                justifyContent: 'center',
                                width:        20,
                                height:       20,
                                background:   hov ? C.dangerLight : 'transparent',
                                border:       `1px solid ${hov ? C.dangerBorder : C.border}`,
                                borderRadius: 4,
                                cursor:       'pointer',
                                color:        hov ? C.danger : C.muted,
                                fontSize:     13,
                                lineHeight:   1,
                                transition:   'all 0.12s',
                                padding:      0,
                            }}
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* Slider */}
            <style>{`
                .rz-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 3px;
                  border-radius: 999px; outline: none; cursor: pointer; border: none; display: block; }
                .rz-slider::-webkit-slider-thumb {
                  -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%;
                  background: #7530fb; border: 2px solid #fff;
                  box-shadow: 0 1px 3px rgba(117,48,251,0.4); cursor: pointer;
                  transition: transform 0.1s, box-shadow 0.1s; }
                .rz-slider::-webkit-slider-thumb:hover { transform: scale(1.2);
                  box-shadow: 0 2px 6px rgba(117,48,251,0.5); }
                .rz-slider::-moz-range-thumb {
                  width: 14px; height: 14px; border-radius: 50%;
                  background: #7530fb; border: 2px solid #fff;
                  box-shadow: 0 1px 3px rgba(117,48,251,0.4); cursor: pointer; }
            `}</style>
            <input
                type="range"
                className="rz-slider"
                min={min} max={max} step={step} value={value}
                onChange={e => onChange(Number(e.target.value))}
                style={{
                    background: `linear-gradient(to right, ${C.primary} ${pct}%, ${C.borderMid} ${pct}%)`,
                }}
            />

            {/* Min / mid / max */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                <span style={{ fontSize: 10, color: C.muted }}>{min}</span>
                {min < 0 && <span style={{ fontSize: 10, color: C.muted }}>0</span>}
                <span style={{ fontSize: 10, color: C.muted }}>{max}</span>
            </div>
        </div>
    )
}

// ── Section wrapper ───────────────────────────────────────────
function Section({ icon, title, children }: {
    icon: React.ReactNode
    title: string
    children: React.ReactNode
}) {
    return (
        <div style={{
            background:   C.surface,
            border:       `1px solid ${C.border}`,
            borderRadius: 10,
            marginBottom: 10,
            overflow:     'hidden',
        }}>
            {/* Section header */}
            <div style={{
                display:     'flex',
                alignItems:  'center',
                gap:         7,
                padding:     '10px 14px',
                background:  C.sectionBg,
                borderBottom:`1px solid ${C.border}`,
            }}>
                <span style={{ color: C.primary, display: 'flex', alignItems: 'center' }}>
                    {icon}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.label, letterSpacing: '0.03em' }}>
                    {title}
                </span>
            </div>

            {/* Section body */}
            <div style={{ padding: '14px 14px 4px' }}>
                {children}
            </div>
        </div>
    )
}

// ── AdjustTool ────────────────────────────────────────────────
export default function AdjustTool({ state, onChange }: ToolPanelProps) {
    const [hovReset, setHovReset] = React.useState(false)

    const allDirty =
        state.brightness !== 0 ||
        state.contrast   !== 0 ||
        state.saturation !== 0 ||
        state.sharpness  !== 0

    return (
        <div>
            {/* Panel header */}
            <div style={{
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'center',
                marginBottom:   14,
            }}>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.label }}>Adjustments</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                        Fine-tune exposure, color &amp; clarity
                    </div>
                </div>

                {allDirty && (
                    <button
                        onClick={() => onChange({ brightness: 0, contrast: 0, saturation: 0, sharpness: 0 })}
                        onMouseEnter={() => setHovReset(true)}
                        onMouseLeave={() => setHovReset(false)}
                        style={{
                            background:   hovReset ? C.dangerLight : C.sectionBg,
                            border:       `1px solid ${hovReset ? C.dangerBorder : C.border}`,
                            borderRadius: 6,
                            padding:      '4px 10px',
                            fontSize:     11,
                            fontWeight:   600,
                            color:        hovReset ? C.danger : C.sub,
                            cursor:       'pointer',
                            transition:   'all 0.15s',
                        }}
                    >
                        Reset all
                    </button>
                )}
            </div>

            {/* Light */}
            <Section icon={<Sun size={13} strokeWidth={2.2} />} title="Light">
                <SliderRow
                    label="Brightness" hint="exposure"
                    value={state.brightness} min={-100} max={100}
                    onChange={v => onChange({ brightness: v })}
                    onReset={() => onChange({ brightness: 0 })}
                />
                <SliderRow
                    label="Contrast" hint="range"
                    value={state.contrast} min={-100} max={100}
                    onChange={v => onChange({ contrast: v })}
                    onReset={() => onChange({ contrast: 0 })}
                />
            </Section>

            {/* Color */}
            <Section icon={<Droplets size={13} strokeWidth={2.2} />} title="Color">
                <SliderRow
                    label="Saturation" hint="vibrance"
                    value={state.saturation} min={-100} max={100}
                    onChange={v => onChange({ saturation: v })}
                    onReset={() => onChange({ saturation: 0 })}
                />
            </Section>

            {/* Detail */}
            <Section icon={<ScanSearch size={13} strokeWidth={2.2} />} title="Detail">
                <SliderRow
                    label="Sharpness" hint="clarity"
                    value={state.sharpness} min={0} max={100}
                    onChange={v => onChange({ sharpness: v })}
                    onReset={() => onChange({ sharpness: 0 })}
                />
            </Section>

            {/* Background Color (for PNG transparency) */}
            <Section icon={<PaintBucket size={13} strokeWidth={2.2} />} title="Background">
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
                    Sets the canvas fill colour behind transparent PNG images
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Colour swatches */}
                    {['#ffffff', '#000000', '#f3eeff', '#fff7ed', '#f0fdf4', '#eff6ff', '#fdf2f8'].map(col => (
                        <button
                            key={col}
                            title={col}
                            onClick={() => onChange({ background: { ...state.background, bgColor: col } })}
                            style={{
                                width: 24, height: 24, borderRadius: '50%',
                                background: col,
                                border: `2px solid ${(state.background?.bgColor ?? '#ffffff') === col ? C.primary : C.borderMid}`,
                                cursor: 'pointer',
                                padding: 0,
                                flexShrink: 0,
                                boxShadow: col === '#ffffff' ? 'inset 0 0 0 1px #e5e7eb' : undefined,
                            }}
                        />
                    ))}
                    {/* Transparent option */}
                    <button
                        title="Transparent (PNG only)"
                        onClick={() => onChange({ background: { ...state.background, bgColor: 'transparent' } })}
                        style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: 'repeating-conic-gradient(#d1d5db 0% 25%, #ffffff 0% 50%) 0 0 / 8px 8px',
                            border: `2px solid ${(state.background?.bgColor ?? '#ffffff') === 'transparent' ? C.primary : C.borderMid}`,
                            cursor: 'pointer',
                            padding: 0,
                            flexShrink: 0,
                        }}
                    />
                    {/* Custom colour picker */}
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <input
                            type="color"
                            value={(state.background?.bgColor ?? '#ffffff') === 'transparent' ? '#ffffff' : (state.background?.bgColor ?? '#ffffff')}
                            onChange={e => onChange({ background: { ...state.background, bgColor: e.target.value } })}
                            style={{ width: 24, height: 24, padding: 0, border: 'none', cursor: 'pointer', borderRadius: '50%' }}
                            title="Custom colour"
                        />
                        <span style={{ fontSize: 11, color: C.sub }}>Custom</span>
                    </label>
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: C.sub }}>
                    Current: <span style={{ fontWeight: 600, color: C.label }}>{state.background?.bgColor ?? '#ffffff'}</span>
                    {(state.background?.bgColor ?? '#ffffff') !== '#ffffff' && (
                        <button
                            onClick={() => onChange({ background: { ...state.background, bgColor: '#ffffff' } })}
                            style={{ marginLeft: 8, fontSize: 10, color: C.primary, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                            Reset to white
                        </button>
                    )}
                </div>
            </Section>
        </div>
    )
}
