'use client'
// components/ui/ImageEditor/tools/TextTool.tsx

import React, { useState, useEffect, useRef } from 'react'
import {
    Plus, Trash2, Bold, Italic,
    AlignLeft, AlignCenter, AlignRight, Type,
} from 'lucide-react'
import type { ToolPanelProps, TextOverlay } from '../types'

// ── Tokens ─────────────────────────────────────────────────────
const C = {
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    primaryBorder: '#c4a8fd',
    border: '#ede9fe',
    borderMid: '#e5e7eb',
    label: '#111827',
    sub: '#6b7280',
    muted: '#9ca3af',
    surface: '#ffffff',
    sectionBg: '#fafafa',
    hover: '#f3f4f6',
    danger: '#ef4444',
    dangerLight: '#fef2f2',
    dangerBorder: '#fca5a5',
}

// ── Font options ───────────────────────────────────────────────
const FONTS = [
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Impact', value: 'Impact, sans-serif' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Trebuchet', value: "'Trebuchet MS', sans-serif" },
    { label: 'Palatino', value: "'Palatino Linotype', serif" },
    { label: 'Courier', value: "'Courier New', monospace" },
    { label: 'Comic Sans', value: "'Comic Sans MS', cursive" },
]

// ── Colour palette ─────────────────────────────────────────────
const PALETTE = [
    '#ffffff', '#000000', '#374151', '#ef4444',
    '#f97316', '#eab308', '#22c55e', '#3b82f6',
    '#7530fb', '#ec4899', '#14b8a6', '#fbbf24',
]

function uid() {
    return Math.random().toString(36).slice(2, 10)
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

// ── ToggleBtn ──────────────────────────────────────────────────
function ToggleBtn({ active, onClick, children }: {
    active: boolean; onClick: () => void; children: React.ReactNode
}) {
    const [hov, setHov] = useState(false)
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1.5px solid ${active ? C.primaryBorder : C.borderMid}`,
                borderRadius: 7,
                background: active ? C.primaryLight : hov ? C.hover : C.surface,
                color: active ? C.primary : C.sub,
                cursor: 'pointer', transition: 'all 0.12s',
            }}
        >
            {children}
        </button>
    )
}

// ── FontCard ───────────────────────────────────────────────────
function FontCard({ font, active, onClick }: {
    font: typeof FONTS[0]; active: boolean; onClick: () => void
}) {
    const [hov, setHov] = useState(false)
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                padding: '6px 8px',
                border: `1.5px solid ${active ? C.primaryBorder : C.borderMid}`,
                borderRadius: 8,
                background: active ? C.primaryLight : hov ? C.hover : C.surface,
                cursor: 'pointer', transition: 'all 0.12s',
                display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left',
            }}
        >
            <span style={{
                fontSize: 15, fontFamily: font.value, lineHeight: 1,
                color: active ? C.primary : C.label,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>Aa</span>
            <span style={{
                fontSize: 9, color: active ? C.primary : C.muted, fontWeight: 600,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{font.label}</span>
        </button>
    )
}

// ── ColorSwatch ────────────────────────────────────────────────
function ColorSwatch({ color, active, onClick }: {
    color: string; active: boolean; onClick: () => void
}) {
    const [hov, setHov] = useState(false)
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                width: 22, height: 22, borderRadius: 5,
                background: color,
                border: active
                    ? `2.5px solid ${C.primary}`
                    : hov ? `2px solid ${C.sub}`
                        : color === '#ffffff' ? `1.5px solid ${C.borderMid}` : '2px solid transparent',
                cursor: 'pointer', transition: 'border 0.1s',
                boxShadow: active ? `0 0 0 2px ${C.primaryLight}` : 'none',
                outline: 'none', padding: 0,
            }}
        />
    )
}

// ── OverlayRow ─────────────────────────────────────────────────
function OverlayRow({ overlay, selected, onSelect, onDelete }: {
    overlay: TextOverlay; selected: boolean
    onSelect: () => void; onDelete: () => void
}) {
    const [hov, setHov] = useState(false)
    const [hovDel, setHovDel] = useState(false)

    return (
        <div
            onClick={onSelect}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                border: `1.5px solid ${selected ? C.primaryBorder : hov ? C.borderMid : 'transparent'}`,
                background: selected ? C.primaryLight : hov ? C.hover : 'transparent',
                marginBottom: 4, transition: 'all 0.12s',
            }}
        >
            {/* Color dot */}
            <div style={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                background: overlay.color,
                border: overlay.color === '#ffffff' ? `1px solid ${C.borderMid}` : 'none',
            }} />
            {/* Text preview */}
            <span style={{
                flex: 1, fontSize: 12,
                fontFamily: overlay.fontFamily,
                fontWeight: overlay.bold ? 700 : 400,
                fontStyle: overlay.italic ? 'italic' : 'normal',
                color: selected ? C.primary : C.label,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
                {overlay.text || <span style={{ color: C.muted, fontStyle: 'italic' }}>Empty text</span>}
            </span>
            {/* Delete */}
            <button
                onClick={e => { e.stopPropagation(); onDelete() }}
                onMouseEnter={() => setHovDel(true)}
                onMouseLeave={() => setHovDel(false)}
                style={{
                    width: 22, height: 22,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: 'none', borderRadius: 5, cursor: 'pointer',
                    background: hovDel ? C.dangerLight : 'transparent',
                    color: hovDel ? C.danger : C.muted,
                    flexShrink: 0, transition: 'all 0.12s',
                }}
            >
                <Trash2 size={12} />
            </button>
        </div>
    )
}

// ── TextTool ───────────────────────────────────────────────────
export default function TextTool({ state, onChange }: ToolPanelProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [hovAdd, setHovAdd] = useState(false)

    const overlays = state.textOverlays

    // Listen for canvas click → select
    useEffect(() => {
        const handler = (e: Event) => {
            const id = (e as CustomEvent<{ id: string }>).detail?.id
            if (id) setSelectedId(id)
        }
        window.addEventListener('text:select', handler)
        return () => window.removeEventListener('text:select', handler)
    }, [])

    // Auto-select newly added overlays
    const prevLen = useRef(overlays.length)
    useEffect(() => {
        if (overlays.length > prevLen.current && overlays.length > 0) {
            setSelectedId(overlays[overlays.length - 1].id)
        }
        prevLen.current = overlays.length
    }, [overlays.length])

    // Ensure selectedId is valid
    const selected = overlays.find(o => o.id === selectedId) ?? null

    function addOverlay() {
        const newOverlay: TextOverlay = {
            id: uid(),
            text: 'Your text here',
            x: 0.5,
            y: 0.5,
            fontSize: 36,
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            bold: false,
            italic: false,
            align: 'center',
        }
        onChange({ textOverlays: [...overlays, newOverlay] })
    }

    function deleteOverlay(id: string) {
        const next = overlays.filter(o => o.id !== id)
        onChange({ textOverlays: next })
        if (selectedId === id) setSelectedId(next.length ? next[next.length - 1].id : null)
    }

    function patchOverlay(id: string, patch: Partial<TextOverlay>) {
        onChange({
            textOverlays: overlays.map(o => o.id === id ? { ...o, ...patch } : o),
        })
    }

    const sizePct = selected ? ((selected.fontSize - 8) / 112) * 100 : 0

    return (
        <div style={{ padding: '16px 14px' }}>
            <style>{`
                .txt-slider{-webkit-appearance:none;appearance:none;width:100%;height:3px;
                  border-radius:999px;outline:none;cursor:pointer;border:none;display:block;}
                .txt-slider::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;
                  border-radius:50%;background:#7530fb;border:2px solid #fff;
                  box-shadow:0 1px 3px rgba(117,48,251,0.4);cursor:pointer;transition:transform 0.1s;}
                .txt-slider::-webkit-slider-thumb:hover{transform:scale(1.2);}
                .txt-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
                  background:#7530fb;border:2px solid #fff;
                  box-shadow:0 1px 3px rgba(117,48,251,0.4);cursor:pointer;}
            `}</style>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.label }}>Text Overlays</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                        Add and style text on your image
                    </div>
                </div>
                <button
                    onClick={addOverlay}
                    onMouseEnter={() => setHovAdd(true)}
                    onMouseLeave={() => setHovAdd(false)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                        background: hovAdd ? '#6020e0' : C.primary,
                        border: 'none', color: '#fff',
                        fontSize: 11, fontWeight: 700, transition: 'background 0.15s',
                    }}
                >
                    <Plus size={13} strokeWidth={2.5} />
                    Add Text
                </button>
            </div>

            {/* Overlay list */}
            {overlays.length === 0 ? (
                <div style={{
                    padding: '24px 16px', textAlign: 'center',
                    border: `1.5px dashed ${C.borderMid}`, borderRadius: 10,
                    marginBottom: 12,
                }}>
                    <Type size={28} color={C.muted} style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>No text overlays yet</div>
                    <div style={{ fontSize: 11, color: C.muted }}>
                        Click <strong style={{ color: C.primary }}>Add Text</strong> or click on the image
                    </div>
                </div>
            ) : (
                <Section title={`LAYERS (${overlays.length})`}>
                    {overlays.map(o => (
                        <OverlayRow
                            key={o.id}
                            overlay={o}
                            selected={o.id === selectedId}
                            onSelect={() => {
                                setSelectedId(o.id)
                                window.dispatchEvent(new CustomEvent('text:focus', { detail: { id: o.id } }))
                            }}
                            onDelete={() => deleteOverlay(o.id)}
                        />
                    ))}
                </Section>
            )}

            {/* Editor — only when an overlay is selected */}
            {selected && (
                <>
                    {/* Text content */}
                    <Section title="TEXT CONTENT">
                        <textarea
                            value={selected.text}
                            onChange={e => patchOverlay(selected.id, { text: e.target.value })}
                            rows={3}
                            placeholder="Type your text…"
                            style={{
                                width: '100%', resize: 'vertical',
                                padding: '8px 10px', borderRadius: 8,
                                border: `1.5px solid ${C.borderMid}`,
                                fontSize: 13, fontFamily: selected.fontFamily,
                                fontWeight: selected.bold ? 700 : 400,
                                fontStyle: selected.italic ? 'italic' : 'normal',
                                color: C.label, background: C.surface,
                                outline: 'none', boxSizing: 'border-box',
                                lineHeight: 1.5,
                            }}
                        />
                    </Section>

                    {/* Font */}
                    <Section title="FONT">
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5,
                        }}>
                            {FONTS.map(f => (
                                <FontCard
                                    key={f.value}
                                    font={f}
                                    active={selected.fontFamily === f.value}
                                    onClick={() => patchOverlay(selected.id, { fontFamily: f.value })}
                                />
                            ))}
                        </div>
                    </Section>

                    {/* Size + style */}
                    <Section title="SIZE & STYLE">
                        {/* Size slider */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontSize: 11, color: C.muted }}>Font size</span>
                            <span style={{
                                fontSize: 12, fontWeight: 700, color: C.primary,
                                background: C.primaryLight, padding: '1px 8px', borderRadius: 5,
                                fontVariantNumeric: 'tabular-nums',
                            }}>{selected.fontSize}px</span>
                        </div>
                        <input
                            type="range"
                            className="txt-slider"
                            min={8} max={120} step={1}
                            value={selected.fontSize}
                            onChange={e => patchOverlay(selected.id, { fontSize: parseInt(e.target.value) })}
                            style={{
                                background: `linear-gradient(to right, ${C.primary} 0%, ${C.primary} ${sizePct}%, ${C.borderMid} ${sizePct}%, ${C.borderMid} 100%)`,
                                marginBottom: 4,
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                            <span style={{ fontSize: 10, color: C.muted }}>8px</span>
                            <span style={{ fontSize: 10, color: C.muted }}>120px</span>
                        </div>

                        {/* Bold / Italic / Align row */}
                        <div style={{ display: 'flex', gap: 6 }}>
                            <ToggleBtn active={selected.bold} onClick={() => patchOverlay(selected.id, { bold: !selected.bold })}>
                                <Bold size={14} strokeWidth={2.5} />
                            </ToggleBtn>
                            <ToggleBtn active={selected.italic} onClick={() => patchOverlay(selected.id, { italic: !selected.italic })}>
                                <Italic size={14} strokeWidth={2} />
                            </ToggleBtn>
                            <div style={{ width: 1, background: C.borderMid, margin: '0 2px' }} />
                            <ToggleBtn active={selected.align === 'left'} onClick={() => patchOverlay(selected.id, { align: 'left' })}>
                                <AlignLeft size={14} />
                            </ToggleBtn>
                            <ToggleBtn active={selected.align === 'center'} onClick={() => patchOverlay(selected.id, { align: 'center' })}>
                                <AlignCenter size={14} />
                            </ToggleBtn>
                            <ToggleBtn active={selected.align === 'right'} onClick={() => patchOverlay(selected.id, { align: 'right' })}>
                                <AlignRight size={14} />
                            </ToggleBtn>
                        </div>
                    </Section>

                    {/* Color */}
                    <Section title="COLOR">
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
                            {PALETTE.map(col => (
                                <ColorSwatch
                                    key={col}
                                    color={col}
                                    active={selected.color === col}
                                    onClick={() => patchOverlay(selected.id, { color: col })}
                                />
                            ))}
                        </div>

                        {/* Custom color row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                position: 'relative', width: 28, height: 28, borderRadius: 6,
                                border: `1.5px solid ${C.borderMid}`, overflow: 'hidden', flexShrink: 0,
                            }}>
                                <div style={{ position: 'absolute', inset: 0, background: selected.color, pointerEvents: 'none' }} />
                                <input
                                    type="color"
                                    value={selected.color}
                                    onChange={e => patchOverlay(selected.id, { color: e.target.value })}
                                    style={{ position: 'absolute', inset: 0, width: '200%', height: '200%', opacity: 0, cursor: 'pointer' }}
                                />
                            </div>
                            <input
                                type="text"
                                value={selected.color}
                                maxLength={7}
                                onChange={e => {
                                    if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value))
                                        patchOverlay(selected.id, { color: e.target.value })
                                }}
                                style={{
                                    flex: 1, padding: '4px 8px',
                                    border: `1px solid ${C.borderMid}`, borderRadius: 6,
                                    fontSize: 12, fontFamily: 'monospace',
                                    color: C.label, background: C.surface, outline: 'none',
                                }}
                            />
                            {/* Preview */}
                            <div style={{
                                padding: '3px 10px', borderRadius: 6, flexShrink: 0,
                                background: '#333',
                                fontFamily: selected.fontFamily,
                                fontWeight: selected.bold ? 700 : 400,
                                fontStyle: selected.italic ? 'italic' : 'normal',
                                fontSize: 13, color: selected.color,
                                whiteSpace: 'nowrap',
                            }}>Aa</div>
                        </div>
                    </Section>
                </>
            )}

            {/* Tip */}
            {overlays.length === 0 && (
                <div style={{
                    padding: '10px 12px', borderRadius: 8,
                    background: C.primaryLight, border: `1px solid ${C.primaryBorder}`,
                    fontSize: 11, color: C.sub, lineHeight: 1.5,
                }}>
                    <strong style={{ color: C.primary }}>Tip:</strong> Click the image to place text.
                    Drag overlays to reposition them anywhere on the image.
                </div>
            )}
        </div>
    )
}
