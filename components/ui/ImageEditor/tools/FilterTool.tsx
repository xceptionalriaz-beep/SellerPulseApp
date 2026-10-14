'use client'
// components/ui/ImageEditor/tools/FilterTool.tsx

import React from 'react'
import { Layers, Sun, Droplets, Zap, Check } from 'lucide-react'
import type { ToolPanelProps, FilterPreset } from '../types'

// ── Tokens ────────────────────────────────────────────────────
const C = {
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    primaryDark: '#6020e0',
    border: '#ede9fe',
    borderMid: '#e5e7eb',
    label: '#111827',
    sub: '#6b7280',
    muted: '#9ca3af',
    surface: '#ffffff',
    sectionBg: '#fafafa',
    danger: '#ef4444',
    dangerLight: '#fef2f2',
    dangerBorder: '#fca5a5',
}

// ── Filter preset definitions ─────────────────────────────────
interface PresetDef {
    id: FilterPreset
    label: string
    css: string
}

const PRESETS: PresetDef[] = [
    { id: 'none', label: 'None', css: '' },
    { id: 'grayscale', label: 'Grayscale', css: 'grayscale(100%)' },
    { id: 'sepia', label: 'Sepia', css: 'sepia(90%)' },
    { id: 'vintage', label: 'Vintage', css: 'sepia(50%) contrast(110%) brightness(88%) saturate(75%)' },
    { id: 'polaroid', label: 'Polaroid', css: 'contrast(115%) brightness(108%) saturate(75%) sepia(15%)' },
    { id: 'chrome', label: 'Chrome', css: 'contrast(125%) saturate(160%) brightness(95%)' },
    { id: 'fade', label: 'Fade', css: 'contrast(88%) brightness(112%) saturate(70%)' },
    { id: 'kodachrome', label: 'Kodachrome', css: 'contrast(120%) saturate(115%) hue-rotate(12deg) brightness(88%)' },
    { id: 'technicolor', label: 'Technicolor', css: 'saturate(155%) hue-rotate(-28deg) contrast(118%)' },
    { id: 'brownie', label: 'Brownie', css: 'sepia(55%) saturate(45%) contrast(108%) brightness(92%)' },
    { id: 'noir', label: 'Noir', css: 'grayscale(100%) contrast(135%) brightness(75%)' },
    { id: 'vivid', label: 'Vivid', css: 'saturate(185%) contrast(112%) brightness(102%)' },
    { id: 'matte', label: 'Matte', css: 'contrast(82%) brightness(115%) saturate(65%)' },
    { id: 'blueprint', label: 'Blueprint', css: 'sepia(100%) hue-rotate(185deg) saturate(210%)' },
    { id: 'cool', label: 'Cool', css: 'hue-rotate(195deg) saturate(125%) brightness(106%)' },
    { id: 'warm', label: 'Warm', css: 'hue-rotate(-22deg) saturate(135%) brightness(106%)' },
    { id: 'emboss', label: 'Emboss', css: 'grayscale(100%) contrast(210%) brightness(108%)' },
    { id: 'invert', label: 'Invert', css: 'invert(100%)' },
]

// ── Shared slider row ─────────────────────────────────────────
interface SliderRowProps {
    label: string
    hint?: string
    value: number
    min: number
    max: number
    step?: number
    def?: number
    onChange: (v: number) => void
    onReset: () => void
    format?: (v: number) => string
}

function SliderRow({
    label, hint, value, min, max, step = 1, def = 0,
    onChange, onReset, format,
}: SliderRowProps) {
    const [hovReset, setHovReset] = React.useState(false)
    const isDirty = value !== def
    const pct = ((value - min) / (max - min)) * 100
    const display = format ? format(value) : (value > 0 && min < 0 ? `+${value}` : String(value))

    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.label }}>{label}</span>
                    {hint && <span style={{ fontSize: 11, color: C.muted, marginLeft: 6 }}>{hint}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: isDirty ? C.primary : C.muted,
                        background: isDirty ? C.primaryLight : 'transparent',
                        padding: isDirty ? '1px 8px' : '1px 0',
                        borderRadius: 5,
                        minWidth: 36,
                        textAlign: 'right',
                        transition: 'all 0.15s',
                        fontVariantNumeric: 'tabular-nums',
                    }}>
                        {display}
                    </span>
                    {isDirty && (
                        <button
                            onClick={onReset}
                            onMouseEnter={() => setHovReset(true)}
                            onMouseLeave={() => setHovReset(false)}
                            title="Reset"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 20, height: 20,
                                background: hovReset ? C.dangerLight : 'transparent',
                                border: `1px solid ${hovReset ? C.dangerBorder : C.border}`,
                                borderRadius: 4,
                                cursor: 'pointer',
                                color: hovReset ? C.danger : C.muted,
                                fontSize: 13, lineHeight: 1,
                                transition: 'all 0.12s', padding: 0,
                            }}
                        >×</button>
                    )}
                </div>
            </div>

            <style>{`
                .rz-slider{-webkit-appearance:none;appearance:none;width:100%;height:3px;
                  border-radius:999px;outline:none;cursor:pointer;border:none;display:block}
                .rz-slider::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;
                  border-radius:50%;background:#7530fb;border:2px solid #fff;
                  box-shadow:0 1px 3px rgba(117,48,251,.4);cursor:pointer;transition:transform .1s,box-shadow .1s}
                .rz-slider::-webkit-slider-thumb:hover{transform:scale(1.2);box-shadow:0 2px 6px rgba(117,48,251,.5)}
                .rz-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
                  background:#7530fb;border:2px solid #fff;box-shadow:0 1px 3px rgba(117,48,251,.4);cursor:pointer}
            `}</style>
            <input
                type="range" className="rz-slider"
                min={min} max={max} step={step} value={value}
                onChange={e => onChange(Number(e.target.value))}
                style={{ background: `linear-gradient(to right,${C.primary} ${pct}%,${C.borderMid} ${pct}%)` }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                <span style={{ fontSize: 10, color: C.muted }}>{format ? format(min) : min}</span>
                {min < 0 && <span style={{ fontSize: 10, color: C.muted }}>0</span>}
                <span style={{ fontSize: 10, color: C.muted }}>{format ? format(max) : max}</span>
            </div>
        </div>
    )
}

// ── Section ───────────────────────────────────────────────────
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 10, marginBottom: 10, overflow: 'hidden',
        }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 14px', background: C.sectionBg,
                borderBottom: `1px solid ${C.border}`,
            }}>
                <span style={{ color: C.primary, display: 'flex', alignItems: 'center' }}>{icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.label, letterSpacing: '0.03em' }}>{title}</span>
            </div>
            <div style={{ padding: '14px 14px 4px' }}>{children}</div>
        </div>
    )
}

// ── FilterTool ────────────────────────────────────────────────
export default function FilterTool({ state, onChange, imageUrl }: ToolPanelProps) {
    const [hovReset, setHovReset] = React.useState(false)

    // ── safe reads (new fields may be undefined on older saved states) ──
    const gamma = state.gamma ?? 1
    const vibrance = state.vibrance ?? 0
    const hue = state.hue ?? 0
    const blur = state.blur ?? 0
    const pixelate = state.pixelate ?? 0
    const noise = state.noise ?? 0
    const intensity = state.filterIntensity ?? 100

    const hasFilter = state.activeFilter !== 'none'
    const hasAdjust =
        gamma !== 1 ||
        vibrance !== 0 ||
        hue !== 0 ||
        blur !== 0 ||
        pixelate !== 0 ||
        noise !== 0

    const allDirty = hasFilter || hasAdjust

    function resetAll() {
        onChange({
            activeFilter: 'none', filterIntensity: 100,
            gamma: 1, vibrance: 0, hue: 0,
            blur: 0, pixelate: 0, noise: 0,
        })
    }

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
            }}>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.label }}>Filters</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                        Presets, light, color &amp; effects
                    </div>
                </div>
                {allDirty && (
                    <button
                        onClick={resetAll}
                        onMouseEnter={() => setHovReset(true)}
                        onMouseLeave={() => setHovReset(false)}
                        style={{
                            background: hovReset ? C.dangerLight : C.sectionBg,
                            border: `1px solid ${hovReset ? C.dangerBorder : C.border}`,
                            borderRadius: 6, padding: '4px 10px',
                            fontSize: 11, fontWeight: 600,
                            color: hovReset ? C.danger : C.sub,
                            cursor: 'pointer', transition: 'all 0.15s',
                        }}
                    >Reset all</button>
                )}
            </div>

            {/* ── Presets ─────────────────────────────────── */}
            <div style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 10, marginBottom: 10, overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '10px 14px', background: C.sectionBg,
                    borderBottom: `1px solid ${C.border}`,
                }}>
                    <span style={{ color: C.primary, display: 'flex', alignItems: 'center' }}>
                        <Layers size={13} strokeWidth={2.2} />
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.label, letterSpacing: '0.03em' }}>
                        Presets
                    </span>
                    <span style={{
                        marginLeft: 'auto', fontSize: 10, color: C.muted,
                        background: C.sectionBg, border: `1px solid ${C.border}`,
                        borderRadius: 4, padding: '1px 6px',
                    }}>
                        {PRESETS.length} filters
                    </span>
                </div>

                {/* Grid */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 8, padding: 12,
                }}>
                    {PRESETS.map(preset => {
                        const active = state.activeFilter === preset.id
                        return (
                            <button
                                key={preset.id}
                                onClick={() => onChange({
                                    activeFilter: preset.id,
                                    filterIntensity: state.filterIntensity === 0 ? 100 : state.filterIntensity,
                                })}
                                style={{
                                    background: 'none',
                                    border: `2px solid ${active ? C.primary : C.borderMid}`,
                                    borderRadius: 8,
                                    padding: 4,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 4,
                                    transition: 'border-color 0.15s',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Thumbnail */}
                                <div style={{
                                    width: '100%',
                                    aspectRatio: '1',
                                    borderRadius: 5,
                                    overflow: 'hidden',
                                    background: '#e5e7eb',
                                    position: 'relative',
                                }}>
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={preset.label}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                filter: preset.css || 'none',
                                                display: 'block',
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%', height: '100%',
                                            background: `linear-gradient(135deg,#e5e7eb,#d1d5db)`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <span style={{ fontSize: 16 }}>🖼</span>
                                        </div>
                                    )}

                                    {/* Active checkmark */}
                                    {active && (
                                        <div style={{
                                            position: 'absolute', top: 3, right: 3,
                                            width: 16, height: 16,
                                            background: C.primary,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <Check size={10} color="#fff" strokeWidth={3} />
                                        </div>
                                    )}
                                </div>

                                {/* Label */}
                                <span style={{
                                    fontSize: 9,
                                    fontWeight: active ? 700 : 500,
                                    color: active ? C.primary : C.sub,
                                    letterSpacing: '0.01em',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '100%',
                                }}>
                                    {preset.label}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* Intensity slider — only when a filter is active */}
                {hasFilter && (
                    <div style={{
                        padding: '0 14px 14px',
                        borderTop: `1px solid ${C.border}`,
                        paddingTop: 12,
                    }}>
                        <SliderRow
                            label="Intensity" hint="blend strength"
                            value={intensity} min={0} max={100} def={100}
                            onChange={v => onChange({ filterIntensity: v })}
                            onReset={() => onChange({ filterIntensity: 100 })}
                            format={v => `${v}%`}
                        />
                    </div>
                )}
            </div>

            {/* ── Light ───────────────────────────────────── */}
            <Section icon={<Sun size={13} strokeWidth={2.2} />} title="Light">
                <SliderRow
                    label="Gamma" hint="midtone"
                    value={gamma} min={0.1} max={3} step={0.05} def={1}
                    onChange={v => onChange({ gamma: v })}
                    onReset={() => onChange({ gamma: 1 })}
                    format={v => (v ?? 1).toFixed(2)}
                />
            </Section>

            {/* ── Color ───────────────────────────────────── */}
            <Section icon={<Droplets size={13} strokeWidth={2.2} />} title="Color">
                <SliderRow
                    label="Vibrance" hint="smart saturation"
                    value={vibrance} min={-100} max={100}
                    onChange={v => onChange({ vibrance: v })}
                    onReset={() => onChange({ vibrance: 0 })}
                />
                <SliderRow
                    label="Hue" hint="color shift"
                    value={hue} min={-180} max={180}
                    onChange={v => onChange({ hue: v })}
                    onReset={() => onChange({ hue: 0 })}
                    format={v => `${(v ?? 0) > 0 ? '+' : ''}${v ?? 0}°`}
                />
            </Section>

            {/* ── Effects ─────────────────────────────────── */}
            <Section icon={<Zap size={13} strokeWidth={2.2} />} title="Effects">
                <SliderRow
                    label="Blur" hint="gaussian"
                    value={blur} min={0} max={20}
                    onChange={v => onChange({ blur: v })}
                    onReset={() => onChange({ blur: 0 })}
                    format={v => `${v ?? 0}px`}
                />
                <SliderRow
                    label="Pixelate" hint="mosaic"
                    value={pixelate} min={0} max={50}
                    onChange={v => onChange({ pixelate: v })}
                    onReset={() => onChange({ pixelate: 0 })}
                />
                <SliderRow
                    label="Noise" hint="film grain"
                    value={noise} min={0} max={100}
                    onChange={v => onChange({ noise: v })}
                    onReset={() => onChange({ noise: 0 })}
                    format={v => `${v ?? 0}%`}
                />
            </Section>
        </div>
    )
}
