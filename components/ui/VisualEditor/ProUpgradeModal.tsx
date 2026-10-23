'use client'
// components/ui/VisualEditor/ProUpgradeModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Canva-style two-panel upgrade modal for Design Studio Pro.
//
// Left  — the pitch: headline, trial subline, plan card, CTA, reassurance
// Right — the proof: Free vs Pro feature comparison table
//
// Props:
//   onClose    — dismiss the modal (backdrop click, ×, or "Continue editing")
//   onUpgrade  — fires when user clicks the trial CTA (route to Stripe)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'
import { X, Check, Minus } from 'lucide-react'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    body: '#1e1535',
    secondary: '#64748b',
    muted: '#94a3b8',
    gold0: '#f59e0b',
    gold1: '#d97706',
}

// ── Crown SVG ────────────────────────────────────────────────────────────────
function CrownSvg({ size = 18, color = '#fff' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size * 0.85} viewBox="0 0 16 14" fill="none" style={{ flexShrink: 0 }}>
            <path d="M1 13h14M2 13L0.5 5.5L5 9L8 1L11 9L15.5 5.5L14 13H2Z"
                fill={color} stroke={color} strokeWidth="0.5"
                strokeLinejoin="round" strokeLinecap="round" />
            <circle cx="8" cy="1.5" r="1.2" fill={color} opacity="0.9" />
            <circle cx="0.5" cy="5.5" r="1" fill={color} opacity="0.9" />
            <circle cx="15.5" cy="5.5" r="1" fill={color} opacity="0.9" />
        </svg>
    )
}

// ── Feature comparison rows ───────────────────────────────────────────────────
interface FeatureRow {
    label: string
    free: string | boolean
    pro: string | boolean
}

const FEATURES: FeatureRow[] = [
    { label: 'Block style variants', free: 'First 2 per block', pro: 'All 10+ variants' },
    { label: 'Export HTML', free: false, pro: true },
    { label: 'Open in Code Editor', free: false, pro: true },
    { label: 'Publish Pro templates', free: false, pro: true },
    { label: 'Saved templates', free: '5 templates', pro: 'Unlimited' },
    { label: 'Support', free: 'Standard', pro: 'Priority' },
]

// ── Cell renderer ─────────────────────────────────────────────────────────────
function Cell({ value, highlight }: { value: string | boolean; highlight?: boolean }) {
    const col = highlight ? C.primary : C.secondary

    if (value === true) return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: highlight
                    ? `linear-gradient(135deg, ${C.gold0} 0%, ${C.gold1} 100%)`
                    : '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Check size={11} strokeWidth={2.5} color={highlight ? '#fff' : C.muted} />
            </div>
        </div>
    )

    if (value === false) return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Minus size={14} color={C.muted} />
        </div>
    )

    return (
        <span style={{
            fontSize: 11, fontWeight: highlight ? 700 : 400,
            color: col, textAlign: 'center', display: 'block',
        }}>
            {value}
        </span>
    )
}

// ── Public types ──────────────────────────────────────────────────────────────
export interface ProUpgradeModalProps {
    onClose: () => void
    onUpgrade: () => void
    /** Optional one-liner explaining why the gate fired, e.g. "Download HTML is a Pro feature." */
    reason?: string
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ProUpgradeModal({ onClose, onUpgrade, reason }: ProUpgradeModalProps) {
    return (
        /* Backdrop */
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                backgroundColor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(5px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 20,
            }}
        >
            {/* Modal card */}
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    display: 'flex',
                    backgroundColor: C.surface,
                    borderRadius: 20,
                    boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                    maxWidth: 780,
                    width: '100%',
                    fontFamily: 'DM Sans, sans-serif',
                    position: 'relative',
                }}
            >
                {/* ── × close ── */}
                <button
                    onClick={onClose}
                    aria-label="Close"
                    style={{
                        position: 'absolute', top: 14, right: 14, zIndex: 1,
                        width: 28, height: 28, borderRadius: '50%',
                        border: 'none', cursor: 'pointer',
                        backgroundColor: '#f1f5f9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: C.secondary,
                    }}
                >
                    <X size={14} />
                </button>

                {/* ════════════════════════════════════════
                    LEFT PANEL — the pitch
                ════════════════════════════════════════ */}
                <div style={{
                    flex: '0 0 280px',
                    padding: '36px 28px 28px',
                    display: 'flex', flexDirection: 'column',
                    borderRight: `1px solid ${C.border}`,
                }}>
                    {/* Reason banner — shown only when a specific gate triggered the modal */}
                    {reason && (
                        <div style={{
                            marginBottom: 16,
                            padding: '8px 12px',
                            borderRadius: 8,
                            backgroundColor: C.primaryLight,
                            border: `1px solid ${C.border}`,
                            fontSize: 12,
                            color: C.primary,
                            fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            <span>🔒</span> {reason}
                        </div>
                    )}

                    {/* Headline */}
                    <div style={{ marginBottom: 6 }}>
                        <p style={{ margin: 0, fontSize: 13, color: C.secondary, fontWeight: 500 }}>
                            Design Studio
                        </p>
                        <h2 style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 800, color: C.body, lineHeight: 1.2 }}>
                            Try{' '}
                            <span style={{ color: C.primary }}>Pro</span>
                            {' '}for free
                        </h2>
                    </div>

                    {/* Subline */}
                    <p style={{ margin: '10px 0 24px', fontSize: 12.5, color: C.secondary, lineHeight: 1.6 }}>
                        14-day free trial · Cancel anytime · $9/mo after
                    </p>

                    {/* Plan card */}
                    <div style={{
                        border: `2px solid ${C.primary}`,
                        borderRadius: 12,
                        padding: '14px 16px',
                        backgroundColor: C.primaryLight,
                        marginBottom: 20,
                        position: 'relative',
                    }}>
                        {/* Selected radio dot */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <div style={{
                                width: 18, height: 18, borderRadius: '50%',
                                border: `2px solid ${C.primary}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: C.surface, flexShrink: 0,
                            }}>
                                <div style={{
                                    width: 9, height: 9, borderRadius: '50%',
                                    backgroundColor: C.primary,
                                }} />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 14, color: C.body }}>
                                Design Studio Pro
                            </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: C.secondary, paddingLeft: 28 }}>
                            $0 for 14 days, then $9/month
                        </p>

                        {/* Pro badge top-right */}
                        <span style={{
                            position: 'absolute', top: 10, right: 12,
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            background: `linear-gradient(135deg, ${C.gold0} 0%, ${C.gold1} 100%)`,
                            color: '#fff', fontSize: 9, fontWeight: 700,
                            padding: '3px 7px', borderRadius: 5, letterSpacing: '0.05em',
                        }}>
                            <CrownSvg size={8} />
                            PRO
                        </span>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={onUpgrade}
                        style={{
                            width: '100%', padding: '13px 0',
                            background: `linear-gradient(135deg, ${C.gold0} 0%, ${C.gold1} 100%)`,
                            border: 'none', borderRadius: 10, cursor: 'pointer',
                            color: '#fff', fontSize: 14, fontWeight: 700,
                            fontFamily: 'DM Sans, sans-serif',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            boxShadow: '0 3px 12px rgba(217,119,6,0.4)',
                            transition: 'opacity 0.15s',
                            marginBottom: 10,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                    >
                        <CrownSvg size={14} />
                        Try Pro for Free — 14 Days
                    </button>

                    {/* Reassurance */}
                    <p style={{
                        margin: '0 0 auto', fontSize: 11, color: C.muted,
                        textAlign: 'center', lineHeight: 1.5,
                    }}>
                        We&apos;ll remind you before the trial ends.
                        <br />Cancel any time in a few clicks.
                    </p>

                    {/* Continue editing */}
                    <button
                        onClick={onClose}
                        style={{
                            marginTop: 16, width: '100%', padding: '9px 0',
                            background: 'none', border: `1px solid ${C.border}`,
                            borderRadius: 8, cursor: 'pointer',
                            color: C.muted, fontSize: 12, fontWeight: 500,
                            fontFamily: 'DM Sans, sans-serif',
                            transition: 'color 0.12s, border-color 0.12s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.color = C.secondary
                            e.currentTarget.style.borderColor = C.secondary
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.color = C.muted
                            e.currentTarget.style.borderColor = C.border
                        }}
                    >
                        Continue editing (publish disabled)
                    </button>
                </div>

                {/* ════════════════════════════════════════
                    RIGHT PANEL — the proof
                ════════════════════════════════════════ */}
                <div style={{
                    flex: 1,
                    padding: '36px 28px 28px',
                    backgroundColor: C.bg,
                    overflowY: 'auto',
                }}>
                    <p style={{ margin: '0 0 18px', fontSize: 13, fontWeight: 700, color: C.body }}>
                        What you unlock
                    </p>

                    {/* Table */}
                    <div style={{
                        borderRadius: 12, overflow: 'hidden',
                        border: `1px solid ${C.border}`,
                        backgroundColor: C.surface,
                    }}>
                        {/* Header row */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 110px 110px',
                            backgroundColor: C.surface,
                            borderBottom: `1px solid ${C.border}`,
                        }}>
                            <div style={{ padding: '10px 16px' }} />
                            <div style={{
                                padding: '10px 8px', textAlign: 'center',
                                fontSize: 11, fontWeight: 600, color: C.muted,
                                borderLeft: `1px solid ${C.border}`,
                            }}>
                                Free
                            </div>
                            <div style={{
                                padding: '10px 8px', textAlign: 'center',
                                fontSize: 11, fontWeight: 700, color: C.primary,
                                background: C.primaryLight,
                                borderLeft: `1px solid ${C.border}`,
                            }}>
                                Pro ✦
                            </div>
                        </div>

                        {/* Feature rows */}
                        {FEATURES.map((row, i) => (
                            <div
                                key={row.label}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 110px 110px',
                                    borderBottom: i < FEATURES.length - 1
                                        ? `1px solid ${C.border}` : 'none',
                                    backgroundColor: i % 2 === 0 ? C.surface : C.bg,
                                }}
                            >
                                {/* Feature label */}
                                <div style={{ padding: '11px 16px', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontSize: 12, color: C.body, fontWeight: 500 }}>
                                        {row.label}
                                    </span>
                                </div>

                                {/* Free cell */}
                                <div style={{
                                    padding: '11px 8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderLeft: `1px solid ${C.border}`,
                                }}>
                                    <Cell value={row.free} highlight={false} />
                                </div>

                                {/* Pro cell — highlighted */}
                                <div style={{
                                    padding: '11px 8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: C.primaryLight,
                                    borderLeft: `1px solid ${C.border}`,
                                }}>
                                    <Cell value={row.pro} highlight={true} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom note */}
                    <p style={{
                        margin: '14px 0 0', fontSize: 11, color: C.muted,
                        lineHeight: 1.6,
                    }}>
                        ✦ Pro styles work freely in the editor.
                        The gate applies only at export and publish.
                    </p>
                </div>
            </div>
        </div>
    )
}
