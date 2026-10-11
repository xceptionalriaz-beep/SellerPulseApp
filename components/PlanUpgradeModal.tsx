'use client'
// components/PlanUpgradeModal.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Plan Upgrade Modal
//
// Design: Pro card is inverted (dark #1e1535 bg, lime accent).
// Starter + Business are light surface cards.
// Monthly / Annual billing toggle at top (annual = 20% off).
// Key listing quota shown as a large number, not buried in a list.
//
// Props:
//   currentTier  — "free" | "starter" | "pro" | "business"
//   onClose      — close without upgrading
//   onSelect     — called with chosen tier; wire to Stripe later
// ─────────────────────────────────────────────────────────────

import { useEffect, useCallback, useState } from 'react'
import { X, ArrowRight, Check, Zap, Sparkles, Crown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ── Props ─────────────────────────────────────────────────────
interface PlanUpgradeModalProps {
    currentTier?: string
    onClose:      () => void
    onSelect?:    (tier: string) => void
}

// ── Plan data ─────────────────────────────────────────────────
interface Plan {
    slug:          string
    name:          string
    priceMonthly:  number
    priceAnnual:   number   // per month, billed annually
    quota:         string   // the big number headline
    quotaLabel:    string
    tagline:       string
    icon:          LucideIcon
    features:      string[]
    cta:           string
    // visual variant
    dark?:         boolean  // inverted card
}

const PLANS: Plan[] = [
    {
        slug:         'starter',
        name:         'Starter',
        priceMonthly: 19,
        priceAnnual:  15,
        quota:        '50',
        quotaLabel:   'listings / mo',
        tagline:      'For sellers scaling to 50+ items',
        icon:         Zap,
        features: [
            'AI Cassini title optimiser',
            '20 bulk CSV uploads / mo',
            'VeRO risk checker',
            'Profit margin calculator',
            'Email support',
        ],
        cta: 'Start with Starter',
    },
    {
        slug:         'pro',
        name:         'Pro',
        priceMonthly: 49,
        priceAnnual:  39,
        quota:        '∞',
        quotaLabel:   'listings / mo',
        tagline:      'For high-volume eBay sellers',
        icon:         Sparkles,
        features: [
            'Unlimited AI listing generation',
            '200 bulk uploads / mo',
            'EAN / barcode auto-fill',
            'Dropship supplier import',
            'Template library (50+)',
            'Priority support',
        ],
        cta: 'Go Pro',
        dark: true,
    },
    {
        slug:         'business',
        name:         'Business',
        priceMonthly: 129,
        priceAnnual:  103,
        quota:        '∞',
        quotaLabel:   'everything',
        tagline:      'For agencies & power sellers',
        icon:         Crown,
        features: [
            'Everything in Pro',
            'Unlimited bulk uploads',
            'REST API access',
            'Multi-seller accounts',
            'Custom category mapping',
            'Dedicated account manager',
        ],
        cta: 'Go Business',
    },
]

// ── Helpers ───────────────────────────────────────────────────
const fmtPrice = (n: number) => `£${n}`

// ── PlanCard ──────────────────────────────────────────────────
function PlanCard({
    plan,
    annual,
    isCurrent,
    isRecommended,
    onSelect,
}: {
    plan:          Plan
    annual:        boolean
    isCurrent:     boolean
    isRecommended: boolean
    onSelect:      () => void
}) {
    const Icon  = plan.icon
    const price = annual ? plan.priceAnnual : plan.priceMonthly
    const dark  = plan.dark

    // --- token sets per variant ---
    const card   = dark ? '#1e1535'              : '#ffffff'
    const border = dark ? 'transparent'          : (isRecommended ? '#ede9fe' : '#f0eefe')
    const fg     = dark ? '#ffffff'              : '#1e1535'
    const fgSub  = dark ? 'rgba(255,255,255,0.5)': '#9ca3af'
    const fgBody = dark ? 'rgba(255,255,255,0.78)': '#374151'
    const quoteFg= dark ? '#b8fa33'              : '#7530fb'
    const divider= dark ? 'rgba(255,255,255,0.08)': '#f3f0ff'
    const iconBg = dark ? 'rgba(184,250,51,0.12)': '#f3eeff'
    const iconFg = dark ? '#b8fa33'              : '#7530fb'
    const tickBg = dark ? 'rgba(184,250,51,0.15)': '#f3eeff'
    const tickFg = dark ? '#b8fa33'              : '#7530fb'

    const btnBg  = dark   ? '#b8fa33'
                 : isCurrent ? '#f3f4f6'
                 : '#f3eeff'
    const btnFg  = dark   ? '#1e1535'
                 : isCurrent ? '#9ca3af'
                 : '#7530fb'
    const btnShadow = (dark && !isCurrent)
        ? '0 4px 18px rgba(184,250,51,0.28)'
        : 'none'

    return (
        <div style={{
            display:       'flex',
            flexDirection: 'column',
            flex:           '1 1 0',
            minWidth:       200,
            maxWidth:       320,
            borderRadius:   18,
            border:         `1.5px solid ${border}`,
            background:     card,
            boxShadow:      dark
                ? '0 16px 48px rgba(30,21,53,0.28)'
                : '0 2px 10px rgba(30,21,53,0.05)',
            overflow:       'hidden',
            // recommended lifts slightly
            transform:      isRecommended ? 'translateY(-6px)' : 'none',
            transition:     'transform 0.2s',
        }}>

            {/* ── Header ─────────────────────────────────────── */}
            <div style={{ padding: '26px 24px 20px' }}>

                {/* Icon + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <div style={{
                        width:          32,
                        height:         32,
                        borderRadius:   9,
                        background:     iconBg,
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        flexShrink:     0,
                    }}>
                        <Icon size={14} color={iconFg} strokeWidth={2} />
                    </div>

                    <span style={{
                        fontSize:   14,
                        fontWeight: 700,
                        color:      fg,
                        fontFamily: 'Syne, sans-serif',
                        letterSpacing: '0.01em',
                    }}>
                        {plan.name}
                    </span>

                    {isCurrent && (
                        <span style={{
                            fontSize:      10,
                            fontWeight:    700,
                            color:         fgSub,
                            fontFamily:    'DM Sans, sans-serif',
                            background:    dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
                            padding:       '2px 8px',
                            borderRadius:  20,
                            letterSpacing: '0.03em',
                            marginLeft:    'auto',
                        }}>
                            Current
                        </span>
                    )}
                </div>

                {/* Quota — the big number */}
                <div style={{ marginBottom: 4 }}>
                    <span style={{
                        display:    'block',
                        fontSize:   44,
                        fontWeight: 800,
                        color:      quoteFg,
                        fontFamily: 'Syne, sans-serif',
                        lineHeight: 1,
                        letterSpacing: '-0.02em',
                    }}>
                        {plan.quota}
                    </span>
                    <span style={{
                        fontSize:   11,
                        color:      fgSub,
                        fontFamily: 'DM Sans, sans-serif',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                    }}>
                        {plan.quotaLabel}
                    </span>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: divider, margin: '18px 0' }} />

                {/* Price + tagline */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 4 }}>
                    <span style={{
                        fontSize:   24,
                        fontWeight: 800,
                        color:      fg,
                        fontFamily: 'Syne, sans-serif',
                        lineHeight: 1,
                    }}>
                        {fmtPrice(price)}
                    </span>
                    <span style={{
                        fontSize:   12,
                        color:      fgSub,
                        fontFamily: 'DM Sans, sans-serif',
                    }}>
                        / mo{annual ? ', billed annually' : ''}
                    </span>
                </div>

                <p style={{
                    fontSize:   12,
                    color:      fgSub,
                    fontFamily: 'DM Sans, sans-serif',
                    margin:     0,
                    lineHeight: 1.4,
                }}>
                    {plan.tagline}
                </p>
            </div>

            {/* ── Feature list ───────────────────────────────── */}
            <div style={{
                padding:       '4px 24px 20px',
                flex:           1,
                display:        'flex',
                flexDirection:  'column',
                gap:            9,
            }}>
                {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                        <div style={{
                            width:          16,
                            height:         16,
                            borderRadius:   5,
                            background:     tickBg,
                            display:        'flex',
                            alignItems:     'center',
                            justifyContent: 'center',
                            flexShrink:     0,
                            marginTop:      1,
                        }}>
                            <Check size={9} strokeWidth={3} color={tickFg} />
                        </div>
                        <span style={{
                            fontSize:   12,
                            color:      fgBody,
                            fontFamily: 'DM Sans, sans-serif',
                            lineHeight: 1.45,
                        }}>
                            {f}
                        </span>
                    </div>
                ))}
            </div>

            {/* ── CTA ────────────────────────────────────────── */}
            <div style={{ padding: '4px 24px 24px' }}>
                <button
                    disabled={isCurrent}
                    onClick={isCurrent ? undefined : onSelect}
                    style={{
                        width:          '100%',
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        gap:            6,
                        padding:        '11px 0',
                        borderRadius:   10,
                        border:         'none',
                        background:     btnBg,
                        color:          btnFg,
                        fontSize:       13,
                        fontWeight:     700,
                        fontFamily:     'Syne, sans-serif',
                        cursor:         isCurrent ? 'default' : 'pointer',
                        boxShadow:      btnShadow,
                        transition:     'opacity 0.15s, transform 0.1s',
                    }}
                    onMouseEnter={e => {
                        if (!isCurrent) {
                            (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'
                            ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.015)'
                        }
                    }}
                    onMouseLeave={e => {
                        if (!isCurrent) {
                            (e.currentTarget as HTMLButtonElement).style.opacity = '1'
                            ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
                        }
                    }}
                >
                    {isCurrent ? 'Your current plan' : (
                        <>
                            {plan.cta}
                            <ArrowRight size={11} strokeWidth={2.5} />
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

// ── Billing toggle ────────────────────────────────────────────
function BillingToggle({
    annual,
    onToggle,
}: {
    annual:   boolean
    onToggle: () => void
}) {
    return (
        <div style={{
            display:        'flex',
            alignItems:     'center',
            gap:            12,
            justifyContent: 'center',
            flexShrink:     0,
        }}>
            <span style={{
                fontSize:   12,
                fontWeight: annual ? 400 : 700,
                color:      annual ? '#9ca3af' : '#1e1535',
                fontFamily: 'DM Sans, sans-serif',
                transition: 'color 0.2s',
            }}>
                Monthly
            </span>

            <button
                onClick={onToggle}
                role="switch"
                aria-checked={annual}
                style={{
                    width:          46,
                    height:         26,
                    borderRadius:   13,
                    border:         'none',
                    background:     annual ? '#7530fb' : '#e5e7eb',
                    cursor:         'pointer',
                    position:       'relative',
                    padding:        0,
                    transition:     'background 0.2s',
                    flexShrink:     0,
                }}
            >
                <span style={{
                    position:       'absolute',
                    top:            3,
                    left:           annual ? 23 : 3,
                    width:          20,
                    height:         20,
                    borderRadius:   '50%',
                    background:     '#ffffff',
                    boxShadow:      '0 1px 4px rgba(0,0,0,0.18)',
                    transition:     'left 0.2s',
                }} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                    fontSize:   12,
                    fontWeight: annual ? 700 : 400,
                    color:      annual ? '#1e1535' : '#9ca3af',
                    fontFamily: 'DM Sans, sans-serif',
                    transition: 'color 0.2s',
                }}>
                    Annual
                </span>
                <span style={{
                    fontSize:      10,
                    fontWeight:    700,
                    color:         '#16a34a',
                    fontFamily:    'DM Sans, sans-serif',
                    background:    '#dcfce7',
                    padding:       '2px 7px',
                    borderRadius:  20,
                    letterSpacing: '0.02em',
                }}>
                    Save 20%
                </span>
            </div>
        </div>
    )
}

// ── Main modal ────────────────────────────────────────────────
export function PlanUpgradeModal({
    currentTier = 'free',
    onClose,
    onSelect,
}: PlanUpgradeModalProps) {
    const [annual, setAnnual] = useState(true)

    // Close on Escape
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
    }, [onClose])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        // Prevent body scroll while modal is open
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = prev
        }
    }, [handleKeyDown])

    // Recommend one tier up from current
    const order   = ['free', 'starter', 'pro', 'business']
    const currIdx = order.indexOf(currentTier)
    const recSlug = order[Math.min(currIdx + 1, order.length - 1)]

    function handleSelect(tier: string) {
        if (onSelect) onSelect(tier)
        else console.log('[PlanUpgradeModal] Upgrade intent:', tier)
        onClose()
    }

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position:       'fixed',
                    inset:          0,
                    background:     'rgba(30,21,53,0.6)',
                    backdropFilter: 'blur(5px)',
                    zIndex:         900,
                }}
            />

            {/* Dialog */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Upgrade your plan"
                style={{
                    position:  'fixed',
                    inset:     0,
                    display:   'flex',
                    alignItems:'center',
                    justifyContent: 'center',
                    zIndex:    910,
                    padding:   '16px',
                    pointerEvents: 'none',
                }}
            >
                <div style={{
                    pointerEvents:  'all',
                    width:          '100%',
                    maxWidth:       900,
                    maxHeight:      'calc(100vh - 32px)',
                    overflowY:      'auto',
                    borderRadius:   22,
                    background:     '#f8f7ff',
                    boxShadow:      '0 32px 80px rgba(30,21,53,0.32)',
                    display:        'flex',
                    flexDirection:  'column',
                    gap:            0,
                    animation:      'modalIn 0.24s cubic-bezier(0.34,1.4,0.64,1) forwards',
                }}>
                    <style>{`
                        @keyframes modalIn {
                            from { opacity: 0; transform: scale(0.93) translateY(16px); }
                            to   { opacity: 1; transform: scale(1)    translateY(0); }
                        }
                    `}</style>

                    {/* ── Modal header ─────────────────────────── */}
                    <div style={{
                        padding:        '28px 28px 0',
                        display:        'flex',
                        alignItems:     'flex-start',
                        justifyContent: 'space-between',
                        gap:            16,
                        flexShrink:     0,
                    }}>
                        <div>
                            <p style={{
                                fontSize:      11,
                                fontWeight:    700,
                                color:         '#7530fb',
                                fontFamily:    'DM Sans, sans-serif',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                margin:        '0 0 6px',
                            }}>
                                Riazify Plans
                            </p>
                            <h2 style={{
                                fontSize:   22,
                                fontWeight: 800,
                                color:      '#1e1535',
                                fontFamily: 'Syne, sans-serif',
                                margin:     0,
                                lineHeight: 1.15,
                                textWrap:   'balance',
                            }}>
                                More listings. More profit.
                            </h2>
                            <p style={{
                                fontSize:   13,
                                color:      '#6b7280',
                                fontFamily: 'DM Sans, sans-serif',
                                margin:     '6px 0 0',
                            }}>
                                Pick the plan that matches your eBay volume.
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            title="Close"
                            style={{
                                width:          34,
                                height:         34,
                                borderRadius:   9,
                                border:         'none',
                                background:     '#ede9fe',
                                color:          '#7530fb',
                                cursor:         'pointer',
                                display:        'flex',
                                alignItems:     'center',
                                justifyContent: 'center',
                                flexShrink:     0,
                                transition:     'opacity 0.15s',
                            }}
                            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.65')}
                            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
                        >
                            <X size={15} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* ── Billing toggle ───────────────────────── */}
                    <div style={{ padding: '20px 28px 6px', flexShrink: 0 }}>
                        <BillingToggle annual={annual} onToggle={() => setAnnual(a => !a)} />
                    </div>

                    {/* ── Plan cards ───────────────────────────── */}
                    <div style={{
                        display:     'flex',
                        gap:         14,
                        padding:     '22px 28px 28px',
                        flexWrap:    'wrap',
                        alignItems:  'flex-start',
                    }}>
                        {PLANS.map(plan => (
                            <PlanCard
                                key={plan.slug}
                                plan={plan}
                                annual={annual}
                                isCurrent={plan.slug === currentTier}
                                isRecommended={plan.slug === recSlug}
                                onSelect={() => handleSelect(plan.slug)}
                            />
                        ))}
                    </div>

                    {/* ── Footer ───────────────────────────────── */}
                    <p style={{
                        fontSize:   11,
                        color:      '#9ca3af',
                        fontFamily: 'DM Sans, sans-serif',
                        textAlign:  'center',
                        padding:    '0 28px 22px',
                        flexShrink: 0,
                        margin:     0,
                    }}>
                        7-day free trial on all plans &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; Prices exc. VAT
                    </p>
                </div>
            </div>
        </>
    )
}
