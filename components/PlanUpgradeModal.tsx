'use client'
// components/PlanUpgradeModal.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Plan Upgrade Modal
//
// Triggered by the "Upgrade Plan" button in UpgradeBanner.
// Shows three plan tiers side by side; highlights the recommended
// upgrade tier based on the user's current plan.
//
// Props:
//   currentTier  — user's current plan slug  ("free" | "starter" | "pro")
//   onClose      — close without upgrading
//   onSelect     — called with chosen tier slug; wire to Stripe/billing
// ─────────────────────────────────────────────────────────────

import { useEffect, useCallback } from 'react'
import { X, Check, Sparkles, Zap, Crown, type LucideIcon } from 'lucide-react'

// ── Props ─────────────────────────────────────────────────────
interface PlanUpgradeModalProps {
    currentTier?: string
    onClose: () => void
    onSelect?: (tier: string) => void
}

// ── Plan definitions ──────────────────────────────────────────
interface PlanTier {
    slug:        string
    name:        string
    price:       string
    period:      string
    tagline:     string
    icon:        LucideIcon
    iconColor:   string
    iconBg:      string
    accentColor: string
    badgeLabel?: string
    features:    string[]
    cta:         string
}

const PLANS: PlanTier[] = [
    {
        slug:        'starter',
        name:        'Starter',
        price:       '£19',
        period:      '/mo',
        tagline:     'For sellers just getting started',
        icon:        Zap,
        iconColor:   '#7530fb',
        iconBg:      '#f3eeff',
        accentColor: '#7530fb',
        features: [
            '50 AI listing generations / mo',
            '20 bulk listings / mo',
            'AI title optimisation',
            'VeRO protection checks',
            'Profit margin calculator',
            'Email support',
        ],
        cta: 'Start with Starter',
    },
    {
        slug:        'pro',
        name:        'Pro',
        price:       '£49',
        period:      '/mo',
        tagline:     'For high-volume eBay sellers',
        icon:        Sparkles,
        iconColor:   '#1e1535',
        iconBg:      '#b8fa33',
        accentColor: '#1e1535',
        badgeLabel:  'Most Popular',
        features: [
            'Unlimited AI listing generations',
            '200 bulk listings / mo',
            'Barcode / EAN auto-lookup',
            'Dropship supplier import',
            'Template library',
            'Priority support',
        ],
        cta: 'Go Pro',
    },
    {
        slug:        'business',
        name:        'Business',
        price:       '£129',
        period:      '/mo',
        tagline:     'For agencies & power sellers',
        icon:        Crown,
        iconColor:   '#d97706',
        iconBg:      '#fef3c7',
        accentColor: '#d97706',
        features: [
            'Everything in Pro',
            'Unlimited bulk listings',
            'API access',
            'Multi-account management',
            'Custom integrations',
            'Dedicated account manager',
        ],
        cta: 'Go Business',
    },
]

// ── Backdrop ─────────────────────────────────────────────────
function Backdrop({ onClick }: { onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(30,21,53,0.55)',
                backdropFilter: 'blur(4px)',
                zIndex: 900,
            }}
        />
    )
}

// ── Plan card ─────────────────────────────────────────────────
function PlanCard({
    plan,
    isCurrent,
    isRecommended,
    onSelect,
}: {
    plan: PlanTier
    isCurrent: boolean
    isRecommended: boolean
    onSelect: () => void
}) {
    const Icon = plan.icon

    return (
        <div style={{
            flex:          '1 1 0',
            minWidth:      220,
            display:       'flex',
            flexDirection: 'column',
            borderRadius:  16,
            overflow:      'hidden',
            border:        isRecommended
                ? `2px solid ${plan.accentColor}`
                : '1.5px solid #ede9fe',
            background:    '#ffffff',
            boxShadow:     isRecommended
                ? `0 8px 32px rgba(30,21,53,0.12)`
                : '0 2px 8px rgba(30,21,53,0.04)',
            position:      'relative',
            transform:     isRecommended ? 'scale(1.025)' : 'scale(1)',
            transition:    'transform 0.2s',
        }}>

            {/* Popular badge */}
            {plan.badgeLabel && (
                <div style={{
                    position:   'absolute',
                    top:        -1,
                    left:       '50%',
                    transform:  'translateX(-50%)',
                    background: plan.accentColor,
                    color:      '#ffffff',
                    fontSize:   10,
                    fontWeight: 800,
                    fontFamily: 'Syne, sans-serif',
                    padding:    '3px 12px',
                    borderRadius: '0 0 8px 8px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                }}>
                    {plan.badgeLabel}
                </div>
            )}

            {/* Card header */}
            <div style={{
                padding:       '28px 24px 20px',
                borderBottom:  '1px solid #f3f0ff',
            }}>
                {/* Icon + name row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{
                        width:          36,
                        height:         36,
                        borderRadius:   10,
                        background:     plan.iconBg,
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        flexShrink:     0,
                    }}>
                        <Icon size={16} color={plan.iconColor} strokeWidth={2} />
                    </div>
                    <span style={{
                        fontSize:   15,
                        fontWeight: 800,
                        color:      '#1e1535',
                        fontFamily: 'Syne, sans-serif',
                    }}>
                        {plan.name}
                    </span>
                    {isCurrent && (
                        <span style={{
                            fontSize:   10,
                            fontWeight: 700,
                            color:      '#6b7280',
                            fontFamily: 'DM Sans, sans-serif',
                            background: '#f3f4f6',
                            padding:    '2px 7px',
                            borderRadius: 20,
                        }}>
                            Current
                        </span>
                    )}
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 4 }}>
                    <span style={{
                        fontSize:   30,
                        fontWeight: 800,
                        color:      '#1e1535',
                        fontFamily: 'Syne, sans-serif',
                        lineHeight: 1,
                    }}>
                        {plan.price}
                    </span>
                    <span style={{
                        fontSize:   13,
                        color:      '#9ca3af',
                        fontFamily: 'DM Sans, sans-serif',
                    }}>
                        {plan.period}
                    </span>
                </div>

                {/* Tagline */}
                <p style={{
                    fontSize:   12,
                    color:      '#6b7280',
                    fontFamily: 'DM Sans, sans-serif',
                    lineHeight: 1.4,
                    margin:     0,
                }}>
                    {plan.tagline}
                </p>
            </div>

            {/* Feature list */}
            <div style={{
                padding:       '18px 24px',
                flex:           1,
                display:        'flex',
                flexDirection:  'column',
                gap:            10,
            }}>
                {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{
                            width:          18,
                            height:         18,
                            borderRadius:   '50%',
                            background:     isRecommended ? plan.accentColor : '#f3eeff',
                            display:        'flex',
                            alignItems:     'center',
                            justifyContent: 'center',
                            flexShrink:     0,
                            marginTop:      1,
                        }}>
                            <Check
                                size={10}
                                strokeWidth={3}
                                color={isRecommended ? (plan.accentColor === '#1e1535' ? '#b8fa33' : '#ffffff') : '#7530fb'}
                            />
                        </div>
                        <span style={{
                            fontSize:   12,
                            color:      '#374151',
                            fontFamily: 'DM Sans, sans-serif',
                            lineHeight: 1.45,
                        }}>
                            {f}
                        </span>
                    </div>
                ))}
            </div>

            {/* CTA button */}
            <div style={{ padding: '0 24px 24px' }}>
                <button
                    disabled={isCurrent}
                    onClick={isCurrent ? undefined : onSelect}
                    style={{
                        width:          '100%',
                        padding:        '10px 0',
                        borderRadius:   10,
                        border:         'none',
                        background:     isCurrent
                            ? '#f3f4f6'
                            : isRecommended
                                ? plan.accentColor
                                : '#f3eeff',
                        color:          isCurrent
                            ? '#9ca3af'
                            : isRecommended
                                ? (plan.accentColor === '#1e1535' ? '#b8fa33' : '#ffffff')
                                : '#7530fb',
                        fontSize:       13,
                        fontWeight:     700,
                        fontFamily:     'Syne, sans-serif',
                        cursor:         isCurrent ? 'default' : 'pointer',
                        boxShadow:      (!isCurrent && isRecommended)
                            ? `0 4px 14px rgba(30,21,53,0.2)`
                            : 'none',
                        transition:     'opacity 0.15s, transform 0.1s',
                    }}
                    onMouseEnter={e => {
                        if (!isCurrent) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'
                    }}
                    onMouseLeave={e => {
                        if (!isCurrent) (e.currentTarget as HTMLButtonElement).style.opacity = '1'
                    }}
                >
                    {isCurrent ? 'Your current plan' : plan.cta}
                </button>
            </div>
        </div>
    )
}

// ── Modal shell ───────────────────────────────────────────────
export function PlanUpgradeModal({
    currentTier = 'free',
    onClose,
    onSelect,
}: PlanUpgradeModalProps) {

    // Close on Escape
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
    }, [onClose])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])

    // Determine recommended tier — one step up from current
    const tierOrder = ['free', 'starter', 'pro', 'business']
    const currentIdx = tierOrder.indexOf(currentTier)
    const recommendedSlug = tierOrder[Math.min(currentIdx + 1, tierOrder.length - 1)]

    function handleSelect(tier: string) {
        if (onSelect) {
            onSelect(tier)
        } else {
            // Placeholder: log intent — wire to Stripe / billing router later
            console.log('[PlanUpgradeModal] Upgrade intent:', tier)
        }
        onClose()
    }

    return (
        <>
            <Backdrop onClick={onClose} />

            <div style={{
                position:      'fixed',
                inset:         0,
                display:       'flex',
                alignItems:    'center',
                justifyContent:'center',
                zIndex:         910,
                padding:        '16px',
                pointerEvents:  'none',
            }}>
                <div style={{
                    pointerEvents:  'all',
                    width:          '100%',
                    maxWidth:       900,
                    maxHeight:      'calc(100vh - 32px)',
                    overflowY:      'auto',
                    borderRadius:   20,
                    background:     '#f8f7ff',
                    boxShadow:      '0 24px 64px rgba(30,21,53,0.28)',
                    display:        'flex',
                    flexDirection:  'column',
                    animation:      'modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1) forwards',
                }}>
                    <style>{`
                        @keyframes modalIn {
                            from { opacity: 0; transform: scale(0.94) translateY(12px); }
                            to   { opacity: 1; transform: scale(1)    translateY(0); }
                        }
                    `}</style>

                    {/* Header */}
                    <div style={{
                        display:        'flex',
                        alignItems:     'flex-start',
                        justifyContent: 'space-between',
                        padding:        '28px 28px 0',
                        flexShrink:     0,
                    }}>
                        <div>
                            <h2 style={{
                                fontSize:   22,
                                fontWeight: 800,
                                color:      '#1e1535',
                                fontFamily: 'Syne, sans-serif',
                                margin:     0,
                                lineHeight: 1.2,
                            }}>
                                Upgrade your plan
                            </h2>
                            <p style={{
                                fontSize:   13,
                                color:      '#6b7280',
                                fontFamily: 'DM Sans, sans-serif',
                                margin:     '6px 0 0',
                            }}>
                                Unlock more listings, bulk tools, and advanced features.
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
                                marginLeft:     16,
                                transition:     'opacity 0.15s',
                            }}
                            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.7')}
                            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
                        >
                            <X size={15} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Plan cards */}
                    <div style={{
                        display:       'flex',
                        gap:           14,
                        padding:       '24px 28px 28px',
                        flexWrap:      'wrap',
                        alignItems:    'stretch',
                    }}>
                        {PLANS.map(plan => (
                            <PlanCard
                                key={plan.slug}
                                plan={plan}
                                isCurrent={plan.slug === currentTier}
                                isRecommended={plan.slug === recommendedSlug}
                                onSelect={() => handleSelect(plan.slug)}
                            />
                        ))}
                    </div>

                    {/* Footer note */}
                    <div style={{
                        padding:     '0 28px 22px',
                        flexShrink:  0,
                    }}>
                        <p style={{
                            fontSize:   11,
                            color:      '#9ca3af',
                            fontFamily: 'DM Sans, sans-serif',
                            textAlign:  'center',
                            margin:     0,
                        }}>
                            All plans include a 7-day free trial &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; Prices exc. VAT
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
