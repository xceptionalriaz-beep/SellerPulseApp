'use client'
// components/ui/ImageEditor/tools/FrameTool.tsx

import React, { useState } from 'react'
import type { ToolPanelProps, FrameStyle } from '../types'

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

// ── Frame style definitions ─────────────────────────────────────
const FRAME_STYLES: {
    id:      FrameStyle
    label:   string
    preview: React.ReactNode
}[] = [
    {
        id: 'none',
        label: 'None',
        preview: (
            <div style={{
                width: 40, height: 30,
                background: 'linear-gradient(135deg, #e5e7eb 25%, #f3f4f6 25%, #f3f4f6 50%, #e5e7eb 50%, #e5e7eb 75%, #f3f4f6 75%)',
                backgroundSize: '8px 8px',
                borderRadius: 3,
            }} />
        ),
    },
    {
        id: 'solid',
        label: 'Solid',
        preview: (
            <div style={{
                width: 40, height: 30,
                border: '4px solid #374151',
                background: '#d1d5db',
                borderRadius: 0,
                boxSizing: 'border-box',
            }} />
        ),
    },
    {
        id: 'rounded',
        label: 'Rounded',
        preview: (
            <div style={{
                width: 40, height: 30,
                border: '4px solid #374151',
                background: '#d1d5db',
                borderRadius: 8,
                boxSizing: 'border-box',
            }} />
        ),
    },
    {
        id: 'shadow',
        label: 'Shadow',
        preview: (
            <div style={{
                width: 34, height: 26,
                background: '#d1d5db',
                borderRadius: 3,
                boxShadow: '3px 3px 0 #374151, 5px 5px 8px rgba(0,0,0,0.35)',
                margin: '2px 0 0 2px',
            }} />
        ),
    },
    {
        id: 'polaroid',
        label: 'Polaroid',
        preview: (
            <div style={{
                width: 34, height: 38, background: '#fff',
                padding: '3px 3px 9px 3px', boxSizing: 'border-box',
                boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                borderRadius: 1,
            }}>
                <div style={{ width: '100%', height: '100%', background: '#d1d5db' }} />
            </div>
        ),
    },
    {
        id: 'film',
        label: 'Film Strip',
        preview: (
            <div style={{
                width: 40, height: 30, background: '#111',
                display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', padding: '2px 0',
                overflow: 'hidden', borderRadius: 2,
            }}>
                {/* sprocket row */}
                {[0, 1].map(row => (
                    <div key={row} style={{
                        display: 'flex', gap: 3, paddingLeft: 2,
                        height: 4, alignItems: 'center',
                    }}>
                        {[0,1,2,3,4,5].map(i => (
                            <div key={i} style={{ width: 4, height: 3, background: '#444', borderRadius: 1 }} />
                        ))}
                    </div>
                ))}
                {/* centre image area */}
                <div style={{ flex: 1, background: '#d1d5db', margin: '0 1px' }} />
            </div>
        ),
    },
]

// ── Colour palette ──────────────────────────────────────────────
const PALETTE = [
    '#ffffff', '#f3f4f6', '#d1d5db', '#9ca3af',
    '#374151', '#111827', '#000000', '#fef3c7',
    '#fde68a', '#f59e0b', '#b45309', '#78350f',
    '#fee2e2', '#fca5a5', '#ef4444', '#991b1b',
    '#d1fae5', '#6ee7b7', '#10b981', '#065f46',
    '#dbeafe', '#93c5fd', '#3b82f6', '#1e40af',
    '#ede9fe', '#c4b5fd', '#7530fb', '#4c1d95',
]

// ── Section wrapper ─────────────────────────────────────────────
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

// ── StyleCard ───────────────────────────────────────────────────
function StyleCard({ def, active, onClick }: {
    def:     typeof FRAME_STYLES[0]
    active:  boolean
    onClick: () => void
}) {
    const [hov, setHov] = useState(false)
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 6, padding: '10px 6px',
                border: `1.5px solid ${active ? C.primaryBorder : C.borderMid}`,
                borderRadius: 10,
                background: active ? C.primaryLight : hov ? C.hover : C.surface,
                cursor: 'pointer', transition: 'all 0.13s',
            }}
        >
            <div style={{
                width: 44, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {def.preview}
            </div>
            <span style={{
                fontSize: 10, fontWeight: 700,
                color: active ? C.primary : C.sub,
                whiteSpace: 'nowrap',
            }}>{def.label}</span>
        </button>
    )
}

// ── ColorSwatch ─────────────────────────────────────────────────
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
                width: 22, height: 22, borderRadius: 5, padding: 0,
                background: color,
                border: active
                    ? `2.5px solid ${C.primary}`
                    : hov
                        ? `2px solid ${C.sub}`
                        : color === '#ffffff' || color === '#f3f4f6'
                            ? `1.5px solid ${C.borderMid}`
                            : '2px solid transparent',
                cursor: 'pointer', transition: 'border 0.1s',
                boxShadow: active ? `0 0 0 2px ${C.primaryLight}` : 'none',
                outline: 'none',
            }}
        />
    )
}

// ── FrameTool ───────────────────────────────────────────────────
export default function FrameTool({ state, onChange }: ToolPanelProps) {
    const [hovReset, setHovReset] = useState(false)

    const frame = state.frame
    const { style, color, width, borderRadius } = frame
    const isDirty = style !== 'none'

    function patch(partial: Partial<typeof frame>) {
        onChange({ frame: { ...frame, ...partial } })
    }

    const widthPct  = (width / 60)  * 100
    const radiusPct = (borderRadius / 40) * 100

    const showColor  = style !== 'none' && style !== 'film'
    const showRadius = style === 'rounded'

    return (
        <div style={{ padding: '16px 14px' }}>
            <style>{`
                .frm-slider{-webkit-appearance:none;appearance:none;width:100%;height:3px;
                  border-radius:999px;outline:none;cursor:pointer;border:none;display:block;}
                .frm-slider::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;
                  border-radius:50%;background:#7530fb;border:2px solid #fff;
                  box-shadow:0 1px 3px rgba(117,48,251,0.4);cursor:pointer;transition:transform 0.1s;}
                .frm-slider::-webkit-slider-thumb:hover{transform:scale(1.2);}
                .frm-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
                  background:#7530fb;border:2px solid #fff;
                  box-shadow:0 1px 3px rgba(117,48,251,0.4);cursor:pointer;}
            `}</style>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.label }}>Frame & Border</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                        Add a border or decorative frame
                    </div>
                </div>
                {isDirty && (
                    <button
                        onClick={() => patch({ style: 'none', width: 20, borderRadius: 12, color: '#ffffff' })}
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
                        Reset
                    </button>
                )}
            </div>

            {/* Style picker */}
            <Section title="FRAME STYLE">
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6,
                }}>
                    {FRAME_STYLES.map(def => (
                        <StyleCard
                            key={def.id}
                            def={def}
                            active={style === def.id}
                            onClick={() => patch({ style: def.id })}
                        />
                    ))}
                </div>
            </Section>

            {/* Width — shown for all non-none styles */}
            {style !== 'none' && (
                <Section title="THICKNESS">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: C.muted }}>
                            {style === 'polaroid' ? 'Padding' : style === 'film' ? 'Strip height' : 'Border width'}
                        </span>
                        <span style={{
                            fontSize: 12, fontWeight: 700, color: C.primary,
                            background: C.primaryLight, padding: '1px 8px', borderRadius: 5,
                            fontVariantNumeric: 'tabular-nums',
                        }}>{width}px</span>
                    </div>
                    <input
                        type="range"
                        className="frm-slider"
                        min={0} max={60} step={1}
                        value={width}
                        onChange={e => patch({ width: parseInt(e.target.value) })}
                        style={{
                            background: `linear-gradient(to right, ${C.primary} 0%, ${C.primary} ${widthPct}%, ${C.borderMid} ${widthPct}%, ${C.borderMid} 100%)`,
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: C.muted }}>0px</span>
                        <span style={{ fontSize: 10, color: C.muted }}>60px</span>
                    </div>

                    {/* Quick size pills */}
                    <div style={{ display: 'flex', gap: 5, marginTop: 10 }}>
                        {[4, 8, 16, 24, 40].map(sz => (
                            <WidthPill key={sz} size={sz} active={width === sz} onClick={() => patch({ width: sz })} />
                        ))}
                    </div>
                </Section>
            )}

            {/* Corner radius — rounded only */}
            {showRadius && (
                <Section title="CORNER RADIUS">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: C.muted }}>Roundness</span>
                        <span style={{
                            fontSize: 12, fontWeight: 700, color: C.primary,
                            background: C.primaryLight, padding: '1px 8px', borderRadius: 5,
                            fontVariantNumeric: 'tabular-nums',
                        }}>{borderRadius}px</span>
                    </div>
                    <input
                        type="range"
                        className="frm-slider"
                        min={0} max={40} step={1}
                        value={borderRadius}
                        onChange={e => patch({ borderRadius: parseInt(e.target.value) })}
                        style={{
                            background: `linear-gradient(to right, ${C.primary} 0%, ${C.primary} ${radiusPct}%, ${C.borderMid} ${radiusPct}%, ${C.borderMid} 100%)`,
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: C.muted }}>Square</span>
                        <span style={{ fontSize: 10, color: C.muted }}>Very round</span>
                    </div>
                </Section>
            )}

            {/* Color — shown for solid / rounded / shadow / polaroid */}
            {showColor && (
                <Section title="FRAME COLOR">
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: 5, marginBottom: 10,
                    }}>
                        {PALETTE.map(col => (
                            <ColorSwatch
                                key={col}
                                color={col}
                                active={color === col}
                                onClick={() => patch({ color: col })}
                            />
                        ))}
                    </div>

                    {/* Custom row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            position: 'relative', width: 28, height: 28, borderRadius: 6,
                            border: `1.5px solid ${C.borderMid}`, overflow: 'hidden', flexShrink: 0,
                        }}>
                            <div style={{ position: 'absolute', inset: 0, background: color, pointerEvents: 'none' }} />
                            <input
                                type="color"
                                value={color}
                                onChange={e => patch({ color: e.target.value })}
                                style={{ position: 'absolute', inset: 0, width: '200%', height: '200%', opacity: 0, cursor: 'pointer' }}
                            />
                        </div>
                        <input
                            type="text"
                            value={color}
                            maxLength={7}
                            onChange={e => {
                                if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) patch({ color: e.target.value })
                            }}
                            style={{
                                flex: 1, padding: '4px 8px',
                                border: `1px solid ${C.borderMid}`, borderRadius: 6,
                                fontSize: 12, fontFamily: 'monospace',
                                color: C.label, background: C.surface, outline: 'none',
                            }}
                        />
                        {/* Preview swatch */}
                        <div style={{
                            width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                            background: color,
                            border: `1.5px solid ${C.borderMid}`,
                        }} />
                    </div>
                </Section>
            )}

            {/* Live preview hint */}
            {style !== 'none' && (
                <div style={{
                    padding: '10px 12px', borderRadius: 8,
                    background: C.primaryLight, border: `1px solid ${C.primaryBorder}`,
                    fontSize: 11, color: C.sub, lineHeight: 1.5,
                }}>
                    <strong style={{ color: C.primary }}>
                        {style === 'polaroid' && '📷 Polaroid'}
                        {style === 'film'     && '🎞️ Film Strip'}
                        {style === 'solid'    && '▪ Solid Border'}
                        {style === 'rounded'  && '▢ Rounded Border'}
                        {style === 'shadow'   && '◻ Drop Shadow'}
                    </strong>
                    {' '}frame applied — adjust thickness
                    {showColor ? ' and colour' : ''} above.
                </div>
            )}
        </div>
    )
}

// ── WidthPill — separate for hover (no hooks in map) ──────────
function WidthPill({ size, active, onClick }: { size: number; active: boolean; onClick: () => void }) {
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
            {size}px
        </button>
    )
}
