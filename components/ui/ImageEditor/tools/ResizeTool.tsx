'use client'
// components/ui/ImageEditor/tools/ResizeTool.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Lock, Unlock, RotateCcw } from 'lucide-react'
import type { ToolPanelProps } from '../types'

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
    accent: '#b8fa33',
    dark: '#1e1535',
}

// ── Common e-commerce presets ──────────────────────────────────
const PRESETS = [
    { label: 'Amazon Main', w: 2000, h: 2000, hint: '1:1' },
    { label: 'Amazon Thumb', w: 500, h: 500, hint: '1:1' },
    { label: 'eBay Listing', w: 1600, h: 1600, hint: '1:1' },
    { label: 'Shopify 1:1', w: 2048, h: 2048, hint: '1:1' },
    { label: 'Shopify 4:3', w: 2048, h: 1536, hint: '4:3' },
    { label: 'Etsy Listing', w: 2000, h: 1500, hint: '4:3' },
    { label: 'Facebook Post', w: 1200, h: 630, hint: '~2:1' },
    { label: 'Instagram Sq', w: 1080, h: 1080, hint: '1:1' },
    { label: 'Instagram 4:5', w: 1080, h: 1350, hint: '4:5' },
    { label: 'Pinterest', w: 1000, h: 1500, hint: '2:3' },
    { label: 'Twitter Post', w: 1600, h: 900, hint: '16:9' },
    { label: 'Walmart', w: 2000, h: 2000, hint: '1:1' },
]

// ── Percent presets ────────────────────────────────────────────
const PCT_PRESETS = [25, 50, 75, 100]

// ── PresetCard (own component to avoid hooks-in-map) ──────────
function PresetCard({
    preset,
    isActive,
    naturalW,
    naturalH,
    onClick,
}: {
    preset: (typeof PRESETS)[0]
    isActive: boolean
    naturalW: number
    naturalH: number
    onClick: () => void
}) {
    const [hov, setHov] = useState(false)

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${isActive ? C.primaryBorder : C.borderMid}`,
                borderRadius: 8,
                background: isActive ? C.primaryLight : hov ? C.hover : C.surface,
                cursor: 'pointer',
                transition: 'all 0.12s',
                textAlign: 'left',
            }}
        >
            <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? C.primary : C.label }}>
                    {preset.label}
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
                    {preset.w} × {preset.h} px
                </div>
            </div>
            <span style={{
                fontSize: 10, fontWeight: 700, color: isActive ? C.primary : C.muted,
                background: isActive ? '#e4d4ff' : C.sectionBg,
                border: `1px solid ${isActive ? C.primaryBorder : C.border}`,
                borderRadius: 4, padding: '2px 6px',
            }}>
                {preset.hint}
            </span>
        </button>
    )
}

// ── PctButton ──────────────────────────────────────────────────
function PctButton({ pct, isActive, onClick }: {
    pct: number; isActive: boolean; onClick: () => void
}) {
    const [hov, setHov] = useState(false)
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                flex: 1, padding: '6px 0', fontSize: 12, fontWeight: 700,
                border: `1px solid ${isActive ? C.primaryBorder : C.borderMid}`,
                borderRadius: 7,
                background: isActive ? C.primaryLight : hov ? C.hover : C.surface,
                color: isActive ? C.primary : C.sub,
                cursor: 'pointer', transition: 'all 0.12s',
            }}
        >
            {pct}%
        </button>
    )
}

// ── ResizeTool ─────────────────────────────────────────────────
export default function ResizeTool({ state, onChange, imageUrl }: ToolPanelProps) {
    const [naturalW, setNaturalW] = useState(0)
    const [naturalH, setNaturalH] = useState(0)
    const [inputW, setInputW] = useState('')
    const [inputH, setInputH] = useState('')
    const [locked, setLocked] = useState(state.resizeLockAR ?? true)
    const [activePreset, setActivePreset] = useState<string | null>(null)
    const [hovReset, setHovReset] = useState(false)
    const initDone = useRef(false)

    // Load natural image dimensions
    useEffect(() => {
        const img = new Image()
        img.onload = () => {
            setNaturalW(img.naturalWidth)
            setNaturalH(img.naturalHeight)

            if (!initDone.current) {
                initDone.current = true
                // Pre-fill from saved state or natural dims
                const savedW = state.resizeWidth ?? img.naturalWidth
                const savedH = state.resizeHeight ?? img.naturalHeight
                setInputW(String(savedW))
                setInputH(String(savedH))
            }
        }
        img.src = imageUrl
    }, [imageUrl]) // eslint-disable-line react-hooks/exhaustive-deps

    // Sync lock AR with state
    useEffect(() => { setLocked(state.resizeLockAR ?? true) }, [state.resizeLockAR])

    const currentW = parseInt(inputW) || naturalW
    const currentH = parseInt(inputH) || naturalH
    const ar = naturalW && naturalH ? naturalW / naturalH : 1

    function commitW(raw: string) {
        const w = Math.max(1, Math.min(9999, parseInt(raw) || 1))
        const h = locked && naturalH ? Math.round(w / ar) : currentH
        setInputW(String(w))
        setInputH(String(h))
        setActivePreset(null)
        onChange({ resizeWidth: w, resizeHeight: h, resizeLockAR: locked })
    }

    function commitH(raw: string) {
        const h = Math.max(1, Math.min(9999, parseInt(raw) || 1))
        const w = locked && naturalW ? Math.round(h * ar) : currentW
        setInputH(String(h))
        setInputW(String(w))
        setActivePreset(null)
        onChange({ resizeWidth: w, resizeHeight: h, resizeLockAR: locked })
    }

    function toggleLock() {
        const next = !locked
        setLocked(next)
        onChange({ resizeLockAR: next })
    }

    function applyPreset(preset: (typeof PRESETS)[0]) {
        setInputW(String(preset.w))
        setInputH(String(preset.h))
        setActivePreset(preset.label)
        onChange({ resizeWidth: preset.w, resizeHeight: preset.h, resizeLockAR: locked })
    }

    function applyPercent(pct: number) {
        if (!naturalW || !naturalH) return
        const w = Math.round(naturalW * pct / 100)
        const h = Math.round(naturalH * pct / 100)
        setInputW(String(w))
        setInputH(String(h))
        setActivePreset(null)
        onChange({ resizeWidth: w, resizeHeight: h, resizeLockAR: locked })
    }

    function reset() {
        if (!naturalW || !naturalH) return
        setInputW(String(naturalW))
        setInputH(String(naturalH))
        setActivePreset(null)
        onChange({ resizeWidth: null, resizeHeight: null, resizeLockAR: locked })
    }

    const isDirty = (state.resizeWidth !== null && state.resizeWidth !== naturalW)
        || (state.resizeHeight !== null && state.resizeHeight !== naturalH)

    // Megapixel info
    const mp = naturalW && naturalH
        ? ((currentW * currentH) / 1_000_000).toFixed(1)
        : null

    return (
        <div style={{ padding: '16px 14px' }}>

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.label }}>Resize</div>
                    {naturalW > 0 && (
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                            Original: {naturalW} × {naturalH} px
                        </div>
                    )}
                </div>
                {isDirty && (
                    <button
                        onClick={reset}
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
                        <RotateCcw size={11} />
                        Reset
                    </button>
                )}
            </div>

            {/* Dimensions block */}
            <div style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 10, overflow: 'hidden', marginBottom: 12,
            }}>
                {/* Header */}
                <div style={{
                    padding: '9px 14px', background: C.sectionBg,
                    borderBottom: `1px solid ${C.border}`,
                    fontSize: 11, fontWeight: 700, color: C.label, letterSpacing: '0.03em',
                }}>
                    DIMENSIONS
                </div>
                <div style={{ padding: '14px 14px' }}>
                    {/* Width */}
                    <div style={{ marginBottom: 6 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: C.sub, display: 'block', marginBottom: 5 }}>
                            Width
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input
                                type="number"
                                min={1} max={9999}
                                value={inputW}
                                onChange={e => setInputW(e.target.value)}
                                onBlur={e => commitW(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && commitW(inputW)}
                                style={{
                                    flex: 1, padding: '8px 10px',
                                    border: `1.5px solid ${C.borderMid}`,
                                    borderRadius: 8, fontSize: 14, fontWeight: 600,
                                    color: C.label, background: C.surface,
                                    outline: 'none', fontVariantNumeric: 'tabular-nums',
                                    fontFamily: 'DM Sans, sans-serif',
                                    transition: 'border-color 0.15s',
                                }}
                                onFocus={e => (e.target.style.borderColor = C.primary)}
                            // onBlur handled above but also reset border
                            />
                            <span style={{ fontSize: 12, color: C.muted, flexShrink: 0 }}>px</span>
                        </div>
                    </div>

                    {/* Lock toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0' }}>
                        <button
                            onClick={toggleLock}
                            title={locked ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '5px 12px', borderRadius: 8,
                                border: `1.5px solid ${locked ? C.primaryBorder : C.borderMid}`,
                                background: locked ? C.primaryLight : C.sectionBg,
                                color: locked ? C.primary : C.muted,
                                cursor: 'pointer', fontSize: 11, fontWeight: 600,
                                transition: 'all 0.15s',
                            }}
                        >
                            {locked
                                ? <Lock size={12} strokeWidth={2.5} />
                                : <Unlock size={12} strokeWidth={2.5} />
                            }
                            {locked ? 'Aspect ratio locked' : 'Lock aspect ratio'}
                        </button>
                    </div>

                    {/* Height */}
                    <div style={{ marginTop: 6 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: C.sub, display: 'block', marginBottom: 5 }}>
                            Height
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input
                                type="number"
                                min={1} max={9999}
                                value={inputH}
                                onChange={e => setInputH(e.target.value)}
                                onBlur={e => commitH(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && commitH(inputH)}
                                style={{
                                    flex: 1, padding: '8px 10px',
                                    border: `1.5px solid ${C.borderMid}`,
                                    borderRadius: 8, fontSize: 14, fontWeight: 600,
                                    color: C.label, background: C.surface,
                                    outline: 'none', fontVariantNumeric: 'tabular-nums',
                                    fontFamily: 'DM Sans, sans-serif',
                                    transition: 'border-color 0.15s',
                                }}
                                onFocus={e => (e.target.style.borderColor = C.primary)}
                            />
                            <span style={{ fontSize: 12, color: C.muted, flexShrink: 0 }}>px</span>
                        </div>
                    </div>

                    {/* Info row */}
                    {mp && (
                        <div style={{
                            marginTop: 12, padding: '7px 10px',
                            background: C.primaryLight, borderRadius: 7,
                            border: `1px solid ${C.border}`,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <span style={{ fontSize: 11, color: C.primary, fontWeight: 600 }}>
                                {currentW} × {currentH} px
                            </span>
                            <span style={{ fontSize: 11, color: C.muted }}>
                                {mp} MP
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Scale by % */}
            <div style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 10, overflow: 'hidden', marginBottom: 12,
            }}>
                <div style={{
                    padding: '9px 14px', background: C.sectionBg,
                    borderBottom: `1px solid ${C.border}`,
                    fontSize: 11, fontWeight: 700, color: C.label, letterSpacing: '0.03em',
                }}>
                    SCALE
                </div>
                <div style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {PCT_PRESETS.map(pct => {
                            const isActive = naturalW > 0
                                && currentW === Math.round(naturalW * pct / 100)
                                && currentH === Math.round(naturalH * pct / 100)
                            return (
                                <PctButton
                                    key={pct}
                                    pct={pct}
                                    isActive={isActive}
                                    onClick={() => applyPercent(pct)}
                                />
                            )
                        })}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11, color: C.muted, textAlign: 'center' }}>
                        Scale relative to original size
                    </div>
                </div>
            </div>

            {/* Presets */}
            <div style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 10, overflow: 'hidden',
            }}>
                <div style={{
                    padding: '9px 14px', background: C.sectionBg,
                    borderBottom: `1px solid ${C.border}`,
                    fontSize: 11, fontWeight: 700, color: C.label, letterSpacing: '0.03em',
                }}>
                    E-COMMERCE PRESETS
                </div>
                <div style={{ padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {PRESETS.map(preset => (
                        <PresetCard
                            key={preset.label}
                            preset={preset}
                            isActive={activePreset === preset.label}
                            naturalW={naturalW}
                            naturalH={naturalH}
                            onClick={() => applyPreset(preset)}
                        />
                    ))}
                </div>
            </div>

        </div>
    )
}
