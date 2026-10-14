'use client'
// components/ui/ImageEditor/tools/RotateTool.tsx

import React, { useState } from 'react'
import {
    RotateCcw, RotateCw, FlipHorizontal2, FlipVertical2,
} from 'lucide-react'
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
    dark:         '#1e1535',
}

// ── AngleButton — 0 / 90 / 180 / 270 presets ──────────────────
function AngleButton({ angle, active, onClick }: {
    angle: number; active: boolean; onClick: () => void
}) {
    const [hov, setHov] = useState(false)
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                flex: 1, padding: '8px 4px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 4,
                border: `1.5px solid ${active ? C.primaryBorder : C.borderMid}`,
                borderRadius: 9,
                background: active ? C.primaryLight : hov ? C.hover : C.surface,
                cursor: 'pointer', transition: 'all 0.13s',
            }}
        >
            {/* Mini rotation indicator */}
            <div style={{
                width: 22, height: 22, borderRadius: '50%',
                border: `2px solid ${active ? C.primary : C.muted}`,
                position: 'relative', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'border-color 0.13s',
            }}>
                <div style={{
                    width: 2, height: 9,
                    background: active ? C.primary : C.muted,
                    borderRadius: 1,
                    transformOrigin: 'bottom center',
                    transform: `rotate(${angle}deg) translateY(-1px)`,
                    transition: 'background 0.13s',
                }} />
            </div>
            <span style={{
                fontSize: 11, fontWeight: 700,
                color: active ? C.primary : C.sub,
            }}>{angle}°</span>
        </button>
    )
}

// ── FlipButton ─────────────────────────────────────────────────
function FlipButton({ label, icon, active, onClick }: {
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
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 5,
                border: `1.5px solid ${active ? C.primaryBorder : C.borderMid}`,
                borderRadius: 9,
                background: active ? C.primaryLight : hov ? C.hover : C.surface,
                cursor: 'pointer', transition: 'all 0.13s',
                color: active ? C.primary : C.sub,
            }}
        >
            {icon}
            <span style={{ fontSize: 11, fontWeight: 700 }}>{label}</span>
        </button>
    )
}

// ── BigRotateBtn ───────────────────────────────────────────────
function BigRotateBtn({ label, icon, onClick }: {
    label: string; icon: React.ReactNode; onClick: () => void
}) {
    const [hov, setHov] = useState(false)
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                flex: 1, padding: '14px 8px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 6,
                border: `1.5px solid ${hov ? C.primaryBorder : C.borderMid}`,
                borderRadius: 10,
                background: hov ? C.primaryLight : C.surface,
                cursor: 'pointer', transition: 'all 0.13s',
                color: hov ? C.primary : C.sub,
            }}
        >
            {icon}
            <span style={{ fontSize: 11, fontWeight: 700 }}>{label}</span>
        </button>
    )
}

// ── RotationDial — visual indicator ───────────────────────────
function RotationDial({ totalDeg }: { totalDeg: number }) {
    const norm = ((totalDeg % 360) + 360) % 360
    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 8,
        }}>
            <div style={{
                width: 72, height: 72, borderRadius: '50%',
                border: `3px solid ${C.border}`,
                background: `conic-gradient(${C.primaryLight} 0deg, ${C.primaryLight} ${norm}deg, ${C.sectionBg} ${norm}deg)`,
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.06)',
            }}>
                {/* Tick at 12 o'clock */}
                <div style={{
                    position: 'absolute', top: 4, left: '50%',
                    width: 2, height: 8,
                    background: C.primaryBorder, borderRadius: 1,
                    transform: 'translateX(-50%)',
                }} />
                {/* Needle */}
                <div style={{
                    position: 'absolute',
                    width: 2, height: 26,
                    background: C.primary, borderRadius: 1,
                    bottom: '50%',
                    left: 'calc(50% - 1px)',
                    transformOrigin: 'bottom center',
                    transform: `rotate(${norm}deg)`,
                    transition: 'transform 0.2s ease',
                }} />
                {/* Center dot */}
                <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: C.primary, zIndex: 1,
                }} />
            </div>
            <span style={{
                fontSize: 13, fontWeight: 800, color: C.primary,
                fontVariantNumeric: 'tabular-nums',
            }}>
                {totalDeg > 0 ? '+' : ''}{totalDeg.toFixed(1)}°
            </span>
        </div>
    )
}

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

// ── RotateTool ─────────────────────────────────────────────────
export default function RotateTool({ state, onChange }: ToolPanelProps) {
    const [hovReset, setHovReset] = useState(false)

    const rotation  = state.rotation  ?? 0
    const straighten = state.straighten ?? 0
    const flipH     = state.flipH     ?? false
    const flipV     = state.flipV     ?? false
    const totalDeg  = rotation + straighten

    const isDirty = rotation !== 0 || straighten !== 0 || flipH || flipV

    function rotateLeft()  { onChange({ rotation: ((rotation - 90 + 360) % 360) as 0|90|180|270 }) }
    function rotateRight() { onChange({ rotation: ((rotation + 90) % 360) as 0|90|180|270 }) }

    const pct = ((straighten - (-45)) / 90) * 100

    return (
        <div style={{ padding: '16px 14px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.label }}>Rotate &amp; Flip</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                        Rotate, flip and fine-tune angle
                    </div>
                </div>
                {isDirty && (
                    <button
                        onClick={() => onChange({ rotation: 0, straighten: 0, flipH: false, flipV: false })}
                        onMouseEnter={() => setHovReset(true)}
                        onMouseLeave={() => setHovReset(false)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                            background: hovReset ? C.dangerLight : C.sectionBg,
                            border: `1px solid ${hovReset ? C.dangerBorder : C.border}`,
                            color: hovReset ? C.danger : C.sub,
                            fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
                        }}
                    >
                        Reset all
                    </button>
                )}
            </div>

            {/* Dial + rotate buttons */}
            <Section title="ROTATE">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                    <RotationDial totalDeg={totalDeg} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <BigRotateBtn
                            label="Rotate Left"
                            icon={<RotateCcw size={20} strokeWidth={2} />}
                            onClick={rotateLeft}
                        />
                        <BigRotateBtn
                            label="Rotate Right"
                            icon={<RotateCw size={20} strokeWidth={2} />}
                            onClick={rotateRight}
                        />
                    </div>
                </div>

                {/* Quick angle presets */}
                <div style={{ display: 'flex', gap: 6 }}>
                    {([0, 90, 180, 270] as const).map(a => (
                        <AngleButton
                            key={a}
                            angle={a}
                            active={rotation === a && straighten === 0}
                            onClick={() => onChange({ rotation: a, straighten: 0 })}
                        />
                    ))}
                </div>
            </Section>

            {/* Flip */}
            <Section title="FLIP">
                <div style={{ display: 'flex', gap: 8 }}>
                    <FlipButton
                        label="Flip H"
                        icon={<FlipHorizontal2 size={20} strokeWidth={2} />}
                        active={flipH}
                        onClick={() => onChange({ flipH: !flipH })}
                    />
                    <FlipButton
                        label="Flip V"
                        icon={<FlipVertical2 size={20} strokeWidth={2} />}
                        active={flipV}
                        onClick={() => onChange({ flipV: !flipV })}
                    />
                </div>
            </Section>

            {/* Straighten */}
            <Section title="STRAIGHTEN">
                <style>{`
                    .st-slider{-webkit-appearance:none;appearance:none;width:100%;height:3px;
                      border-radius:999px;outline:none;cursor:pointer;border:none;display:block;}
                    .st-slider::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;
                      border-radius:50%;background:#7530fb;border:2px solid #fff;
                      box-shadow:0 1px 3px rgba(117,48,251,0.4);cursor:pointer;transition:transform 0.1s;}
                    .st-slider::-webkit-slider-thumb:hover{transform:scale(1.2);}
                    .st-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
                      background:#7530fb;border:2px solid #fff;
                      box-shadow:0 1px 3px rgba(117,48,251,0.4);cursor:pointer;}
                `}</style>

                {/* Value badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: C.muted }}>Fine-tune rotation angle</span>
                    <span style={{
                        fontSize: 12, fontWeight: 700,
                        color: straighten !== 0 ? C.primary : C.muted,
                        background: straighten !== 0 ? C.primaryLight : 'transparent',
                        padding: straighten !== 0 ? '1px 8px' : '1px 0',
                        borderRadius: 5, minWidth: 40, textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums', transition: 'all 0.15s',
                    }}>
                        {straighten > 0 ? `+${straighten.toFixed(1)}` : straighten.toFixed(1)}°
                    </span>
                </div>

                <input
                    type="range"
                    className="st-slider"
                    min={-45} max={45} step={0.5}
                    value={straighten}
                    onChange={e => onChange({ straighten: parseFloat(e.target.value) })}
                    style={{
                        background: `linear-gradient(to right,
                            ${C.borderMid} 0%,
                            ${C.borderMid} ${pct / 2}%,
                            ${C.primary} ${pct / 2}%,
                            ${C.primary} ${50}%,
                            ${C.borderMid} ${50}%,
                            ${C.borderMid} 100%)`,
                    }}
                />

                {/* Tick labels */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: C.muted }}>−45°</span>
                    <span style={{ fontSize: 10, color: C.muted }}>0°</span>
                    <span style={{ fontSize: 10, color: C.muted }}>+45°</span>
                </div>

                {straighten !== 0 && (
                    <button
                        onClick={() => onChange({ straighten: 0 })}
                        style={{
                            marginTop: 10, width: '100%', padding: '6px',
                            border: `1px solid ${C.border}`, borderRadius: 7,
                            background: C.sectionBg, color: C.sub,
                            fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        Reset straighten
                    </button>
                )}
            </Section>

        </div>
    )
}
