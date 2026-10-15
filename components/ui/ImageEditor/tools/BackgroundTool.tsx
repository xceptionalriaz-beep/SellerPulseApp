'use client'
// components/ui/ImageEditor/tools/BackgroundTool.tsx

import React, { useState } from 'react'
import { Scissors, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react'
import type { ToolPanelProps } from '../types'

// ── Tokens ─────────────────────────────────────────────────────
const C = {
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    primaryBorder: '#c4a8fd',
    primaryHov: '#6020e0',
    border: '#ede9fe',
    borderMid: '#e5e7eb',
    label: '#111827',
    sub: '#6b7280',
    muted: '#9ca3af',
    surface: '#ffffff',
    sectionBg: '#fafafa',
    hover: '#f3f4f6',
    success: '#16a34a',
    successLight: '#f0fdf4',
    successBorder: '#86efac',
    danger: '#ef4444',
    dangerLight: '#fef2f2',
    dangerBorder: '#fca5a5',
    accent: '#b8fa33',
}

// ── Preset background swatches ─────────────────────────────────
const BG_PRESETS = [
    { label: 'White', hex: '#ffffff' },
    { label: 'Off-white', hex: '#f9fafb' },
    { label: 'Light Gray', hex: '#e5e7eb' },
    { label: 'Soft Blue', hex: '#dbeafe' },
    { label: 'Soft Green', hex: '#dcfce7' },
    { label: 'Soft Yellow', hex: '#fef9c3' },
    { label: 'Blush', hex: '#fce7f3' },
    { label: 'Black', hex: '#000000' },
]

// ── Section wrapper ────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 10, overflow: 'hidden', marginBottom: 12,
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

// ── ColorChip — separate component for hover state ────────────
function ColorChip({ hex, active, onClick }: {
    hex: string; active: boolean; onClick: () => void
}) {
    const [hov, setHov] = useState(false)
    const isTransparent = hex === 'transparent'

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            title={hex}
            style={{
                width: '100%', aspectRatio: '1 / 1',
                borderRadius: 8, cursor: 'pointer', padding: 0,
                border: active
                    ? `2.5px solid ${C.primary}`
                    : hov
                        ? `2px solid ${C.sub}`
                        : hex === '#ffffff' || hex === '#f9fafb'
                            ? `1.5px solid ${C.borderMid}`
                            : '2px solid transparent',
                background: isTransparent
                    ? `repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 10px 10px`
                    : hex,
                boxShadow: active ? `0 0 0 2px ${C.primaryLight}` : 'none',
                outline: 'none', transition: 'border 0.1s, box-shadow 0.1s',
                position: 'relative', overflow: 'hidden',
            }}
        >
            {active && (
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{
                        width: 14, height: 14, borderRadius: '50%',
                        background: hex === '#000000' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.45)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M1.5 4l1.5 1.5L6.5 2.5" stroke={hex === '#000000' ? '#000' : '#fff'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            )}
        </button>
    )
}

// ── BackgroundTool ─────────────────────────────────────────────
export default function BackgroundTool({ state, onChange, imageUrl }: ToolPanelProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hovRemove, setHovRemove] = useState(false)
    const [hovRestore, setHovRestore] = useState(false)

    const bg = state.background ?? { processedUrl: null, color: '#ffffff' }
    const { processedUrl, color } = bg

    function patch(partial: Partial<typeof bg>) {
        onChange({ background: { ...bg, ...partial } })
    }

    async function handleRemoveBg() {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/remove-bg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // pipeline: false → returns transparent PNG (no eBay post-processing)
                // so we can apply any background color via CSS
                body: JSON.stringify({ imageUrl, pipeline: false }),
            })
            if (!res.ok) throw new Error(`Server error ${res.status}`)
            const blob = await res.blob()
            const dataUrl = await blobToDataUrl(blob)
            patch({ processedUrl: dataUrl, color: '#ffffff' })
        } catch (err) {
            console.error('[BackgroundTool] remove-bg failed:', err)
            setError('Background removal failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    function handleRestore() {
        patch({ processedUrl: null, color: '#ffffff' })
        setError(null)
    }

    return (
        <div style={{ padding: '16px 14px' }}>

            {/* Header */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.label }}>
                    Background Removal
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 1.5 }}>
                    AI-powered removal using BiRefNet. Replace with any solid color.
                </div>
            </div>

            {!processedUrl ? (
                /* ── Not yet removed ────────────────────────────────── */
                <>
                    {/* eBay tip */}
                    <div style={{
                        padding: '10px 12px', borderRadius: 8, marginBottom: 14,
                        background: C.primaryLight, border: `1px solid ${C.primaryBorder}`,
                        fontSize: 11, color: C.sub, lineHeight: 1.5,
                    }}>
                        <strong style={{ color: C.primary }}>eBay tip:</strong> White background
                        (#ffffff) is the preferred standard for product listings.
                    </div>

                    {/* Remove button */}
                    <button
                        onClick={handleRemoveBg}
                        disabled={loading}
                        onMouseEnter={() => setHovRemove(true)}
                        onMouseLeave={() => setHovRemove(false)}
                        style={{
                            width: '100%', padding: '12px 16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
                            background: loading
                                ? C.muted
                                : hovRemove ? C.primaryHov : C.primary,
                            color: '#ffffff',
                            fontSize: 13, fontWeight: 700,
                            transition: 'background 0.15s',
                            opacity: loading ? 0.8 : 1,
                        }}
                    >
                        {loading ? (
                            <>
                                <SpinnerIcon />
                                Removing background…
                            </>
                        ) : (
                            <>
                                <Scissors size={16} strokeWidth={2.2} />
                                Remove Background
                            </>
                        )}
                    </button>

                    {/* Loading note */}
                    {loading && (
                        <div style={{
                            marginTop: 10, padding: '8px 12px', borderRadius: 8,
                            background: C.sectionBg, border: `1px solid ${C.borderMid}`,
                            fontSize: 11, color: C.sub, textAlign: 'center', lineHeight: 1.5,
                        }}>
                            This may take 10–30 seconds on first run (AI warm-up)…
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div style={{
                            marginTop: 10, padding: '10px 12px', borderRadius: 8,
                            background: C.dangerLight, border: `1px solid ${C.dangerBorder}`,
                            display: 'flex', alignItems: 'flex-start', gap: 8,
                            fontSize: 11, color: C.danger, lineHeight: 1.5,
                        }}>
                            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                            {error}
                        </div>
                    )}
                </>
            ) : (
                /* ── Background removed — show color picker ─────────── */
                <>
                    {/* Success badge */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 12px', borderRadius: 8, marginBottom: 14,
                        background: C.successLight, border: `1px solid ${C.successBorder}`,
                        fontSize: 12, fontWeight: 600, color: C.success,
                    }}>
                        <CheckCircle2 size={16} />
                        Background removed!
                    </div>

                    {/* Color picker */}
                    <Section title="BACKGROUND COLOR">
                        {/* Grid of presets */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: 8, marginBottom: 12,
                        }}>
                            {BG_PRESETS.map(p => (
                                <ColorChip
                                    key={p.hex}
                                    hex={p.hex}
                                    active={color === p.hex}
                                    onClick={() => patch({ color: p.hex })}
                                />
                            ))}
                        </div>

                        {/* Color labels row */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: 8, marginBottom: 14,
                        }}>
                            {BG_PRESETS.map(p => (
                                <div key={p.hex + '-label'} style={{
                                    fontSize: 9, color: C.muted,
                                    textAlign: 'center', lineHeight: 1.2,
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                    {p.label}
                                </div>
                            ))}
                        </div>

                        {/* Custom color row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                position: 'relative', width: 34, height: 34, borderRadius: 8,
                                border: `1.5px solid ${C.borderMid}`, overflow: 'hidden',
                                flexShrink: 0, cursor: 'pointer',
                                background: color === 'transparent'
                                    ? `repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 8px 8px`
                                    : color,
                            }}>
                                <input
                                    type="color"
                                    value={color === 'transparent' ? '#ffffff' : color}
                                    onChange={e => patch({ color: e.target.value })}
                                    style={{
                                        position: 'absolute', inset: 0,
                                        width: '200%', height: '200%',
                                        opacity: 0, cursor: 'pointer',
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>Custom hex</div>
                                <input
                                    type="text"
                                    value={color === 'transparent' ? 'transparent' : color}
                                    maxLength={7}
                                    onChange={e => {
                                        const v = e.target.value
                                        if (v === 'transparent') { patch({ color: 'transparent' }); return }
                                        if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) patch({ color: v })
                                    }}
                                    onBlur={e => {
                                        const v = e.target.value
                                        if (v !== 'transparent' && !/^#[0-9A-Fa-f]{6}$/.test(v)) {
                                            patch({ color: '#ffffff' })
                                        }
                                    }}
                                    style={{
                                        width: '100%', padding: '5px 8px',
                                        border: `1px solid ${C.borderMid}`, borderRadius: 6,
                                        fontSize: 12, fontFamily: 'monospace',
                                        color: C.label, background: C.surface,
                                        outline: 'none', boxSizing: 'border-box' as const,
                                    }}
                                />
                            </div>
                        </div>
                    </Section>

                    {/* Restore button */}
                    <button
                        onClick={handleRestore}
                        onMouseEnter={() => setHovRestore(true)}
                        onMouseLeave={() => setHovRestore(false)}
                        style={{
                            width: '100%', padding: '9px 16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                            border: `1px solid ${hovRestore ? C.borderMid : C.borderMid}`,
                            borderRadius: 9, cursor: 'pointer',
                            background: hovRestore ? C.hover : C.surface,
                            color: C.sub,
                            fontSize: 12, fontWeight: 600,
                            transition: 'background 0.15s',
                        }}
                    >
                        <RotateCcw size={13} />
                        Restore Original Background
                    </button>

                    {/* Tip */}
                    <div style={{
                        marginTop: 12, padding: '10px 12px', borderRadius: 8,
                        background: C.primaryLight, border: `1px solid ${C.primaryBorder}`,
                        fontSize: 11, color: C.sub, lineHeight: 1.5,
                    }}>
                        <strong style={{ color: C.primary }}>Tip:</strong> The background color
                        you pick here is baked in when you Save. White is eBay's standard.
                    </div>
                </>
            )}
        </div>
    )
}

// ── Helpers ────────────────────────────────────────────────────
function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
    })
}

function SpinnerIcon() {
    return (
        <svg
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: 'bg-spin 0.8s linear infinite' }}
        >
            <style>{`@keyframes bg-spin { to { transform: rotate(360deg) } }`}</style>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
