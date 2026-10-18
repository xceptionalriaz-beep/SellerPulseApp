'use client'
// components/ui/VisualEditor/ProExportGate.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Canva-style popup that fires when a free user tries to use a gated action
// (Code Editor or Export HTML) while the template contains Pro-only styles.
//
// Props:
//   blocks        — the Pro-gated blocks to display (filtered by caller)
//   onUpgrade     — called when the user clicks "Upgrade to Pro"
//   onDismiss     — called when the popup is closed (× or "Maybe later")
//
// Behaviour:
//   • Shows up to 2 block rows with a VariantThumbnail + label + mini badge
//   • "＋ N more →" link expands all rows inline (no separate panel)
//   • Gold-gradient header and CTA button use the same crown icon as ProBadge
//   • Closes on outside click (caller passes onDismiss; parent owns the ref)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { VariantThumbnail } from './variantThumbnails'

// ── Design tokens (matching page.tsx / ProBadge) ──────────────────────────────
const C = {
    bg:       '#f8f7ff',
    surface:  '#ffffff',
    border:   '#ede9fe',
    primary:  '#7530fb',
    body:     '#1f1d2e',
    secondary:'#6b7280',
    muted:    '#9ca3af',
}

// ── Crown SVG (same shape as ProBadge) ────────────────────────────────────────
function CrownSvg({ size = 14 }: { size?: number }) {
    return (
        <svg width={size} height={size * 0.85} viewBox="0 0 16 14" fill="none" style={{ flexShrink: 0 }}>
            <path
                d="M1 13h14M2 13L0.5 5.5L5 9L8 1L11 9L15.5 5.5L14 13H2Z"
                fill="#fff" stroke="#fff" strokeWidth="0.5"
                strokeLinejoin="round" strokeLinecap="round"
            />
            <circle cx="8"    cy="1.5" r="1.2" fill="#fff" opacity="0.9" />
            <circle cx="0.5"  cy="5.5" r="1"   fill="#fff" opacity="0.9" />
            <circle cx="15.5" cy="5.5" r="1"   fill="#fff" opacity="0.9" />
        </svg>
    )
}

// ── Public types ──────────────────────────────────────────────────────────────
export interface ProGateBlock {
    blockId:      string
    blockType:    string
    variantId:    string
    variantLabel: string
}

export interface ProExportGateProps {
    blocks:     ProGateBlock[]
    onUpgrade:  () => void
    onDismiss:  () => void
    /** Forwarded ref so the parent can close on outside-click */
    containerRef?: React.RefObject<HTMLDivElement>
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ProExportGate({ blocks, onUpgrade, onDismiss, containerRef }: ProExportGateProps) {
    const [showAll, setShowAll] = useState(false)
    const visible = showAll ? blocks : blocks.slice(0, 2)
    const hidden  = blocks.length - 2

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed', top: 56, right: 16,
                width: 272,
                backgroundColor: C.surface,
                border:       `1px solid ${C.border}`,
                borderRadius: 14,
                boxShadow:    '0 12px 40px rgba(0,0,0,0.15)',
                zIndex:       3000,
                overflow:     'hidden',
                fontFamily:   'DM Sans, sans-serif',
            }}
        >
            {/* ── Gold crown header ── */}
            <div style={{
                background:  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                padding:     '10px 14px',
                display:     'flex', alignItems: 'center', gap: 8,
            }}>
                <CrownSvg size={16} />
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#fff', lineHeight: 1.3 }}>
                    Template uses Pro styles
                </p>
                <button
                    onClick={onDismiss}
                    aria-label="Close"
                    style={{
                        marginLeft: 'auto', background: 'none', border: 'none',
                        cursor: 'pointer', color: 'rgba(255,255,255,0.8)',
                        display: 'flex', alignItems: 'center', padding: 0, flexShrink: 0,
                    }}
                >
                    <X size={14} />
                </button>
            </div>

            {/* ── Body ── */}
            <div style={{ padding: '12px 14px 14px' }}>
                <p style={{ margin: '0 0 10px', fontSize: 11, color: C.secondary, lineHeight: 1.5 }}>
                    Upgrade to export or open in Code Editor without&nbsp;restrictions.
                </p>

                {/* Pro block rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
                    {visible.map(b => (
                        <div key={b.blockId} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '5px 7px', backgroundColor: C.bg,
                            borderRadius: 8, border: `1px solid ${C.border}`,
                        }}>
                            {/* Variant thumbnail */}
                            <div style={{
                                width: 60, height: 30, flexShrink: 0,
                                borderRadius: 4, overflow: 'hidden',
                                border: `1px solid ${C.border}`, backgroundColor: C.surface,
                            }}>
                                <VariantThumbnail variantId={b.variantId} isSelected={false} />
                            </div>

                            {/* Label + block type */}
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <p style={{
                                    margin: 0, fontSize: 11, fontWeight: 600, color: C.body,
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}>
                                    {b.variantLabel}
                                </p>
                                <p style={{ margin: 0, fontSize: 9.5, color: C.muted }}>
                                    {b.blockType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </p>
                            </div>

                            {/* Mini Pro badge */}
                            <span style={{
                                flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 2,
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: '#fff', fontSize: 8, fontWeight: 700,
                                padding: '2px 5px', borderRadius: 4, lineHeight: 1,
                                letterSpacing: '0.04em',
                            }}>
                                <svg width={7} height={6} viewBox="0 0 16 14" fill="none">
                                    <path d="M1 13h14M2 13L0.5 5.5L5 9L8 1L11 9L15.5 5.5L14 13H2Z"
                                        fill="#fff" stroke="#fff" strokeWidth="0.5"
                                        strokeLinejoin="round" strokeLinecap="round" />
                                </svg>
                                Pro
                            </span>
                        </div>
                    ))}

                    {/* "＋ N more" link */}
                    {!showAll && hidden > 0 && (
                        <button
                            onClick={() => setShowAll(true)}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: 11, fontWeight: 600, color: C.primary,
                                padding: '3px 2px', textAlign: 'left',
                                display: 'flex', alignItems: 'center', gap: 4,
                                fontFamily: 'DM Sans, sans-serif',
                            }}
                        >
                            + {hidden} more&nbsp;→
                        </button>
                    )}
                </div>

                {/* ── Upgrade CTA — gold crown button ── */}
                <button
                    onClick={onUpgrade}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 7,
                        padding: '10px 0',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        border: 'none', borderRadius: 8, cursor: 'pointer',
                        color: '#fff', fontFamily: 'DM Sans, sans-serif',
                        fontSize: 13, fontWeight: 700, letterSpacing: '0.02em',
                        boxShadow: '0 2px 10px rgba(217,119,6,0.4)',
                        transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'  }}
                >
                    <CrownSvg size={13} />
                    Try Pro for Free — 14 Days
                </button>

                {/* ── Maybe later ── */}
                <button
                    onClick={onDismiss}
                    style={{
                        width: '100%', marginTop: 7,
                        background: 'none', border: 'none',
                        fontSize: 11, color: C.muted, cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif', padding: '3px 0',
                        transition: 'color 0.12s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = C.secondary }}
                    onMouseLeave={e => { e.currentTarget.style.color = C.muted    }}
                >
                    Maybe later
                </button>
            </div>
        </div>
    )
}
