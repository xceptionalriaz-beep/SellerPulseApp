'use client'
// components/ui/ImageEditor/tools/CropTool.tsx

import React from 'react'
import {
    RotateCcw, RotateCw, FlipHorizontal2, FlipVertical2,
    Grid3x3, Crop, CornerDownRight,
} from 'lucide-react'
import type { ToolPanelProps } from '../types'

// ── Tokens ────────────────────────────────────────────────────
const C = {
    primary: '#7530fb',
    primaryLight: '#f3eeff',
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
    btnBg: '#f9fafb',
    btnHov: '#f3eeff',
    btnBorder: '#e5e7eb',
}

// ── Aspect ratio definitions ──────────────────────────────────
const RATIOS = [
    { id: 'free', label: 'Free', w: 28, h: 22 },
    { id: 'original', label: 'Original', w: 28, h: 22 },
    { id: '1:1', label: '1 : 1', w: 22, h: 22 },
    { id: '4:3', label: '4 : 3', w: 28, h: 21 },
    { id: '3:2', label: '3 : 2', w: 27, h: 18 },
    { id: '16:9', label: '16 : 9', w: 32, h: 18 },
    { id: '5:4', label: '5 : 4', w: 25, h: 20 },
    { id: '4:5', label: '4 : 5', w: 20, h: 25 },
    { id: '3:4', label: '3 : 4', w: 18, h: 24 },
    { id: '2:3', label: '2 : 3', w: 16, h: 24 },
    { id: '9:16', label: '9 : 16', w: 16, h: 28 },
    { id: '21:9', label: '21 : 9', w: 36, h: 14 },
    { id: 'golden', label: 'Golden', w: 30, h: 18 },
] as const

type RatioId = typeof RATIOS[number]['id']

// ── Section wrapper ───────────────────────────────────────────
function Section({ icon, title, children, badge }: {
    icon: React.ReactNode; title: string
    children: React.ReactNode; badge?: string
}) {
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
                <span style={{ fontSize: 11, fontWeight: 700, color: C.label, letterSpacing: '0.03em', flex: 1 }}>{title}</span>
                {badge && (
                    <span style={{
                        fontSize: 10, color: C.muted,
                        background: C.sectionBg, border: `1px solid ${C.border}`,
                        borderRadius: 4, padding: '1px 6px',
                    }}>{badge}</span>
                )}
            </div>
            <div style={{ padding: '12px 14px' }}>{children}</div>
        </div>
    )
}

// ── Ratio card — own component so hooks are valid ─────────────
function RatioCard({ r, active, onClick }: {
    r: typeof RATIOS[number]; active: boolean; onClick: () => void
}) {
    const [hov, setHov] = React.useState(false)
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 5, padding: '8px 4px',
                background: active ? C.primaryLight : hov ? C.btnHov : C.btnBg,
                border: `1.5px solid ${active ? C.primary : hov ? C.border : C.btnBorder}`,
                borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
            }}
        >
            <div style={{
                width: r.w * 0.55, height: r.h * 0.55,
                border: `1.5px solid ${active ? C.primary : C.sub}`,
                borderRadius: 2,
                background: active ? `${C.primary}18` : 'transparent',
                transition: 'all 0.15s', flexShrink: 0,
            }} />
            <span style={{
                fontSize: 9, fontWeight: active ? 700 : 500,
                color: active ? C.primary : C.sub, whiteSpace: 'nowrap',
            }}>{r.label}</span>
        </button>
    )
}

// ── Grid option ───────────────────────────────────────────────
function GridOption({ label, active, onClick }: {
    label: string; active: boolean; onClick: () => void
}) {
    const [hov, setHov] = React.useState(false)
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                flex: 1, padding: '8px 4px',
                background: active ? C.primaryLight : hov ? C.btnHov : C.btnBg,
                border: `1.5px solid ${active ? C.primary : hov ? C.border : C.btnBorder}`,
                borderRadius: 8, cursor: 'pointer',
                fontSize: 11, fontWeight: active ? 700 : 500,
                color: active ? C.primary : C.sub,
                transition: 'all 0.15s',
            }}
        >{label}</button>
    )
}

// ── Icon button ───────────────────────────────────────────────
function IconBtn({ icon, label, onClick, active }: {
    icon: React.ReactNode; label: string; onClick: () => void; active?: boolean
}) {
    const [hov, setHov] = React.useState(false)
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            title={label}
            style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 5, padding: '10px 6px',
                background: active ? C.primaryLight : hov ? C.btnHov : C.btnBg,
                border: `1px solid ${active ? C.border : hov ? C.border : C.btnBorder}`,
                borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                color: active ? C.primary : hov ? C.primary : C.sub,
            }}
        >
            {icon}
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.01em' }}>{label}</span>
        </button>
    )
}

// ── Slider row ────────────────────────────────────────────────
function SliderRow({ label, hint, value, min, max, step = 1, def = 0, onChange, onReset, format }: {
    label: string; hint?: string; value: number; min: number; max: number
    step?: number; def?: number; onChange: (v: number) => void
    onReset: () => void; format?: (v: number) => string
}) {
    const [hovReset, setHovReset] = React.useState(false)
    const isDirty = value !== def
    const pct = ((value - min) / (max - min)) * 100
    const display = format ? format(value) : (value > 0 && min < 0 ? `+${value}` : String(value))

    return (
        <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.label }}>{label}</span>
                    {hint && <span style={{ fontSize: 11, color: C.muted, marginLeft: 5 }}>{hint}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                        fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                        color: isDirty ? C.primary : C.muted,
                        background: isDirty ? C.primaryLight : 'transparent',
                        padding: isDirty ? '1px 8px' : '1px 0',
                        borderRadius: 5, minWidth: 36, textAlign: 'right', transition: 'all 0.15s',
                    }}>{display}</span>
                    {isDirty && (
                        <button onClick={onReset}
                            onMouseEnter={() => setHovReset(true)}
                            onMouseLeave={() => setHovReset(false)}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 20, height: 20,
                                background: hovReset ? C.dangerLight : 'transparent',
                                border: `1px solid ${hovReset ? C.dangerBorder : C.border}`,
                                borderRadius: 4, cursor: 'pointer',
                                color: hovReset ? C.danger : C.muted,
                                fontSize: 13, padding: 0, transition: 'all 0.12s',
                            }}>×</button>
                    )}
                </div>
            </div>
            <style>{`
                .rz-slider{-webkit-appearance:none;appearance:none;width:100%;height:3px;
                  border-radius:999px;outline:none;cursor:pointer;border:none;display:block}
                .rz-slider::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;
                  border-radius:50%;background:#7530fb;border:2px solid #fff;
                  box-shadow:0 1px 3px rgba(117,48,251,.4);cursor:pointer;transition:transform .1s}
                .rz-slider::-webkit-slider-thumb:hover{transform:scale(1.2)}
                .rz-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
                  background:#7530fb;border:2px solid #fff;cursor:pointer}
            `}</style>
            <input type="range" className="rz-slider"
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

// ── CropTool ──────────────────────────────────────────────────
export default function CropTool({ state, onChange }: ToolPanelProps) {
    const [hovReset, setHovReset] = React.useState(false)

    const straighten = state.straighten ?? 0
    const cornerRadius = state.cornerRadius ?? 0
    const cropGrid = state.cropGrid ?? 'none'
    const aspectLock = (state.aspectLock ?? 'free') as RatioId

    const hasChanges =
        aspectLock !== 'free' ||
        state.flipH || state.flipV ||
        state.rotation !== 0 ||
        straighten !== 0 ||
        cornerRadius !== 0

    function resetAll() {
        onChange({
            crop: null, aspectLock: 'free',
            rotation: 0, flipH: false, flipV: false,
            straighten: 0, cornerRadius: 0, cropGrid: 'none',
        })
    }

    return (
        <div style={{ padding: '14px 12px' }}>

            {/* ── Panel header ────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.label }}>Crop &amp; Transform</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                        Ratio · rotate · flip · straighten
                    </div>
                </div>
                {hasChanges && (
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

            {/* ── Aspect Ratio ────────────────────────────── */}
            <Section
                icon={<Crop size={13} strokeWidth={2.2} />}
                title="Aspect Ratio"
                badge={`${RATIOS.length} presets`}
            >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                    {RATIOS.map(r => (
                        <RatioCard
                            key={r.id}
                            r={r}
                            active={aspectLock === r.id}
                            onClick={() => onChange({ aspectLock: r.id })}
                        />
                    ))}
                </div>
            </Section>

            {/* ── Grid Overlay ────────────────────────────── */}
            <Section icon={<Grid3x3 size={13} strokeWidth={2.2} />} title="Grid Overlay">
                <div style={{ display: 'flex', gap: 6 }}>
                    {(['none', 'thirds', 'golden'] as const).map(g => (
                        <GridOption
                            key={g}
                            label={g === 'none' ? 'None' : g === 'thirds' ? 'Thirds' : 'Golden'}
                            active={cropGrid === g}
                            onClick={() => onChange({ cropGrid: g })}
                        />
                    ))}
                </div>
            </Section>

            {/* ── Rotate & Flip ───────────────────────────── */}
            <Section icon={<RotateCw size={13} strokeWidth={2.2} />} title="Rotate &amp; Flip">

                {/* Rotate 90° */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    <IconBtn
                        icon={<RotateCcw size={15} strokeWidth={2} />}
                        label="Rotate Left"
                        onClick={() => onChange({ rotation: ((state.rotation - 90) + 360) % 360 })}
                    />
                    <IconBtn
                        icon={<RotateCw size={15} strokeWidth={2} />}
                        label="Rotate Right"
                        onClick={() => onChange({ rotation: (state.rotation + 90) % 360 })}
                    />
                </div>

                {/* Flip */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                    <IconBtn
                        icon={<FlipHorizontal2 size={15} strokeWidth={2} />}
                        label="Flip H"
                        onClick={() => onChange({ flipH: !state.flipH })}
                        active={state.flipH}
                    />
                    <IconBtn
                        icon={<FlipVertical2 size={15} strokeWidth={2} />}
                        label="Flip V"
                        onClick={() => onChange({ flipV: !state.flipV })}
                        active={state.flipV}
                    />
                </div>

                {/* Current rotation badge */}
                {state.rotation !== 0 && (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '6px 10px', marginBottom: 10,
                        background: C.primaryLight, borderRadius: 7,
                        border: `1px solid ${C.border}`,
                    }}>
                        <span style={{ fontSize: 11, color: C.sub }}>Current rotation</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.primary }}>
                            {state.rotation}°
                        </span>
                    </div>
                )}

                {/* Straighten fine-tune */}
                <SliderRow
                    label="Straighten" hint="fine-tune"
                    value={straighten} min={-45} max={45} step={0.5}
                    onChange={v => onChange({ straighten: v })}
                    onReset={() => onChange({ straighten: 0 })}
                    format={v => `${v > 0 ? '+' : ''}${v}°`}
                />
            </Section>

            {/* ── Corner Radius ───────────────────────────── */}
            <Section icon={<CornerDownRight size={13} strokeWidth={2.2} />} title="Corners">
                <SliderRow
                    label="Radius" hint="rounded corners"
                    value={cornerRadius} min={0} max={50}
                    onChange={v => onChange({ cornerRadius: v })}
                    onReset={() => onChange({ cornerRadius: 0 })}
                    format={v => `${v}px`}
                />

                {/* Live preview */}
                {cornerRadius > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                        <div style={{
                            width: 80, height: 48,
                            background: `linear-gradient(135deg, ${C.primaryLight}, ${C.border})`,
                            border: `1.5px solid ${C.primary}`,
                            borderRadius: cornerRadius,
                            transition: 'border-radius 0.15s',
                        }} />
                    </div>
                )}
            </Section>

        </div>
    )
}
