'use client'
// components/UpgradeBanner.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Plan limit banner
//
// Renders a full-width strip above a tool when the user is at
// or near their plan cap. Three states:
//   hidden     — limit === 0 (unlimited) or dismissed
//   near-limit — used ≥ 80 % of limit   (amber, informational)
//   at-limit   — used ≥ limit            (dark, urgent)
//
// Props:
//   tool       — display name of the tool  e.g. "Listing Generator"
//   limitType  — plural noun for the unit  e.g. "listings"
//   used       — how many the user has consumed
//   limit      — their plan cap  (0 = unlimited → never shown)
//   onUpgrade  — called when "Upgrade Plan" is clicked
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import { Sparkles, X, ArrowRight, Lock } from 'lucide-react'

// ── Props ─────────────────────────────────────────────────────
interface UpgradeBannerProps {
    tool:       string
    limitType:  string
    used:       number
    limit:      number
    onUpgrade?: () => void
}

// ─────────────────────────────────────────────────────────────
export function UpgradeBanner({
    tool, limitType, used, limit, onUpgrade,
}: UpgradeBannerProps) {
    const [dismissed, setDismissed] = useState(false)

    if (limit === 0 || dismissed) return null

    const pct       = limit > 0 ? used / limit : 0
    const atLimit   = used >= limit
    const nearLimit = pct >= 0.8 && !atLimit

    if (!atLimit && !nearLimit) return null

    const remaining = Math.max(0, limit - used)

    // ─────────────────────────────────────────────────────────
    return atLimit
        ? <AtLimitStrip
            tool={tool}
            limitType={limitType}
            used={used}
            limit={limit}
            onUpgrade={onUpgrade}
            onDismiss={() => setDismissed(true)}
          />
        : <NearLimitStrip
            limitType={limitType}
            used={used}
            limit={limit}
            remaining={remaining}
            onUpgrade={onUpgrade}
            onDismiss={() => setDismissed(true)}
          />
}

// ── Shared layout shell ───────────────────────────────────────
function BannerShell({
    style,
    children,
}: {
    style: React.CSSProperties
    children: React.ReactNode
}) {
    return (
        <div style={{
            display:     'flex',
            alignItems:  'center',
            gap:         10,
            padding:     '0 18px',
            height:      50,
            position:    'relative',
            overflow:    'hidden',
            flexShrink:  0,
            userSelect:  'none',
            ...style,
        }}>
            {children}
        </div>
    )
}

// ── Icon badge ────────────────────────────────────────────────
function IconBadge({
    icon, bg, border,
}: {
    icon: React.ReactNode
    bg: string
    border: string
}) {
    return (
        <div style={{
            width:           28,
            height:          28,
            borderRadius:    8,
            background:      bg,
            border:          `1px solid ${border}`,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            flexShrink:      0,
        }}>
            {icon}
        </div>
    )
}

// ── Usage pill ────────────────────────────────────────────────
function UsagePill({
    used, limit, usedColor, limitColor, bg, border,
}: {
    used: number; limit: number
    usedColor: string; limitColor: string
    bg: string; border: string
}) {
    return (
        <div style={{
            display:        'flex',
            alignItems:     'baseline',
            gap:            2,
            padding:        '3px 9px',
            borderRadius:   20,
            background:     bg,
            border:         `1px solid ${border}`,
            flexShrink:     0,
        }}>
            <span style={{
                fontSize:   12,
                fontWeight: 800,
                color:      usedColor,
                fontFamily: 'Syne, sans-serif',
                lineHeight: 1,
            }}>
                {used}
            </span>
            <span style={{
                fontSize:   11,
                color:      limitColor,
                fontFamily: 'DM Sans, sans-serif',
                lineHeight: 1,
            }}>
                /{limit}
            </span>
        </div>
    )
}

// ── CTA button ────────────────────────────────────────────────
function UpgradeButton({
    bg, color, shadow, onUpgrade,
}: {
    bg: string; color: string; shadow: string
    onUpgrade?: () => void
}) {
    return (
        <button
            onClick={onUpgrade}
            style={{
                display:        'flex',
                alignItems:     'center',
                gap:            5,
                padding:        '6px 13px',
                borderRadius:   9,
                border:         'none',
                background:     bg,
                color,
                fontSize:       12,
                fontWeight:     700,
                fontFamily:     'Syne, sans-serif',
                cursor:         'pointer',
                flexShrink:     0,
                whiteSpace:     'nowrap',
                boxShadow:      shadow,
                transition:     'opacity 0.15s, transform 0.1s',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.02)'
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.opacity = '1'
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
            }}
        >
            Upgrade Plan
            <ArrowRight size={11} strokeWidth={2.5} />
        </button>
    )
}

// ── Dismiss button ────────────────────────────────────────────
function DismissButton({
    bg, color, onDismiss,
}: {
    bg: string; color: string; onDismiss: () => void
}) {
    return (
        <button
            onClick={onDismiss}
            title="Dismiss"
            style={{
                width:           26,
                height:          26,
                borderRadius:    7,
                border:          'none',
                background:      bg,
                color,
                cursor:          'pointer',
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                flexShrink:      0,
                marginLeft:      2,
                transition:      'opacity 0.15s',
                opacity:         0.7,
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.7')}
        >
            <X size={12} strokeWidth={2.5} />
        </button>
    )
}

// ── AT LIMIT — dark branded strip ─────────────────────────────
function AtLimitStrip({
    tool, limitType, used, limit, onUpgrade, onDismiss,
}: {
    tool: string; limitType: string
    used: number; limit: number
    onUpgrade?: () => void
    onDismiss: () => void
}) {
    return (
        <BannerShell style={{
            background: 'linear-gradient(90deg, #1e1535 0%, #2d1763 100%)',
        }}>
            {/* Decorative background shimmer — large faded icon */}
            <div style={{
                position:      'absolute',
                right:         60,
                top:           '50%',
                transform:     'translateY(-50%) rotate(12deg)',
                opacity:       0.05,
                pointerEvents: 'none',
            }}>
                <Sparkles size={90} color="#b8fa33" />
            </div>
            <div style={{
                position:      'absolute',
                right:         -20,
                top:           '50%',
                transform:     'translateY(-50%) rotate(-8deg)',
                opacity:       0.04,
                pointerEvents: 'none',
            }}>
                <Lock size={100} color="#b8fa33" />
            </div>

            {/* Icon badge */}
            <IconBadge
                icon={<Lock size={12} color="#b8fa33" strokeWidth={2.5} />}
                bg="rgba(184,250,51,0.12)"
                border="rgba(184,250,51,0.25)"
            />

            {/* Text block */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    display:    'flex',
                    alignItems: 'baseline',
                    gap:        8,
                }}>
                    <span style={{
                        fontSize:   13,
                        fontWeight: 700,
                        color:      '#ffffff',
                        fontFamily: 'Syne, sans-serif',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.2,
                    }}>
                        {tool} limit reached
                    </span>
                    <span style={{
                        fontSize:     12,
                        color:        'rgba(255,255,255,0.42)',
                        fontFamily:   'DM Sans, sans-serif',
                        whiteSpace:   'nowrap',
                        overflow:     'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight:   1.2,
                    }}>
                        You've used all {limit} {limitType} on your plan
                    </span>
                </div>
            </div>

            {/* Usage pill */}
            <UsagePill
                used={used}
                limit={limit}
                usedColor="#ef4444"
                limitColor="rgba(255,255,255,0.28)"
                bg="rgba(255,255,255,0.07)"
                border="rgba(255,255,255,0.1)"
            />

            {/* CTA */}
            <UpgradeButton
                bg="#b8fa33"
                color="#1e1535"
                shadow="0 4px 14px rgba(184,250,51,0.3)"
                onUpgrade={onUpgrade}
            />

            {/* Dismiss */}
            <DismissButton
                bg="rgba(255,255,255,0.08)"
                color="rgba(255,255,255,0.6)"
                onDismiss={onDismiss}
            />
        </BannerShell>
    )
}

// ── NEAR LIMIT — warm amber strip ─────────────────────────────
function NearLimitStrip({
    limitType, used, limit, remaining, onUpgrade, onDismiss,
}: {
    limitType: string
    used: number; limit: number; remaining: number
    onUpgrade?: () => void
    onDismiss: () => void
}) {
    return (
        <BannerShell style={{
            background:   'linear-gradient(90deg, #fef8e7 0%, #fffdf8 60%, #ffffff 100%)',
            borderBottom: '1px solid #fde68a',
        }}>
            {/* Icon badge */}
            <IconBadge
                icon={<Sparkles size={12} color="#d97706" strokeWidth={2.5} />}
                bg="#fef3c7"
                border="#fde68a"
            />

            {/* Text block */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    display:    'flex',
                    alignItems: 'baseline',
                    gap:        8,
                }}>
                    <span style={{
                        fontSize:   13,
                        fontWeight: 700,
                        color:      '#92400e',
                        fontFamily: 'Syne, sans-serif',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.2,
                    }}>
                        Running low on {limitType}
                    </span>
                    <span style={{
                        fontSize:     12,
                        color:        '#b45309',
                        fontFamily:   'DM Sans, sans-serif',
                        whiteSpace:   'nowrap',
                        overflow:     'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight:   1.2,
                    }}>
                        {remaining} of {limit} remaining — upgrade before you run out
                    </span>
                </div>
            </div>

            {/* Usage pill */}
            <UsagePill
                used={used}
                limit={limit}
                usedColor="#d97706"
                limitColor="rgba(146,64,14,0.4)"
                bg="#fef3c7"
                border="#fde68a"
            />

            {/* CTA */}
            <UpgradeButton
                bg="#7530fb"
                color="#ffffff"
                shadow="0 4px 14px rgba(117,48,251,0.22)"
                onUpgrade={onUpgrade}
            />

            {/* Dismiss */}
            <DismissButton
                bg="rgba(0,0,0,0.05)"
                color="#9ca3af"
                onDismiss={onDismiss}
            />
        </BannerShell>
    )
}
