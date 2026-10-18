'use client'
// components/ui/VisualEditor/ProBadge.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable Pro gating components for the Visual Editor.
//
// Exports:
//   <ProBadge />          — gold crown "Pro" chip (Canva-style)
//   <ProLockOverlay />    — semi-transparent overlay for locked tiles
//   <ProFeatureGuard />   — wraps any element; intercepts click for free users
//   useProGate()          — hook: isPro + requirePro()
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'
import { Lock } from 'lucide-react'

// ── Crown SVG (inline — no icon library needed) ───────────────────────────────
function CrownIcon({ size = 10, color = '#ffffff' }: { size?: number; color?: string }) {
    return (
        <svg
            width={size}
            height={size * 0.85}
            viewBox="0 0 16 14"
            fill="none"
            style={{ display: 'block', flexShrink: 0 }}
        >
            {/* Crown shape: flat base + 3 points */}
            <path
                d="M1 13h14M2 13L0.5 5.5L5 9L8 1L11 9L15.5 5.5L14 13H2Z"
                fill={color}
                stroke={color}
                strokeWidth="0.5"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            {/* Three crown jewels */}
            <circle cx="8" cy="1.5" r="1.2" fill={color} opacity="0.9" />
            <circle cx="0.5" cy="5.5" r="1" fill={color} opacity="0.9" />
            <circle cx="15.5" cy="5.5" r="1" fill={color} opacity="0.9" />
        </svg>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// 1.  ProBadge — gold crown chip, three sizes
//     Looks like Canva / Notion / professional tool badges
// ─────────────────────────────────────────────────────────────────────────────
export type ProBadgeSize = 'xs' | 'sm' | 'md'

interface ProBadgeProps {
    size?: ProBadgeSize
    style?: React.CSSProperties
}

export function ProBadge({ size = 'sm', style }: ProBadgeProps) {
    const cfg = {
        xs: { fontSize: 8, px: 5, py: 2, radius: 4, iconSize: 8, gap: 3 },
        sm: { fontSize: 9, px: 6, py: 2, radius: 5, iconSize: 9, gap: 3 },
        md: { fontSize: 11, px: 8, py: 3, radius: 6, iconSize: 11, gap: 4 },
    }[size]

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: cfg.gap,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                fontSize: cfg.fontSize,
                fontWeight: 700,
                letterSpacing: '0.04em',
                padding: `${cfg.py}px ${cfg.px}px`,
                borderRadius: cfg.radius,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                userSelect: 'none',
                flexShrink: 0,
                boxShadow: '0 1px 3px rgba(217,119,6,0.35)',
                ...style,
            }}
        >
            <CrownIcon size={cfg.iconSize} color="#ffffff" />
            Pro
        </span>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// 2.  ProLockOverlay — frost overlay for locked tiles
//     Position the parent as `position: relative` and drop this inside.
// ─────────────────────────────────────────────────────────────────────────────
interface ProLockOverlayProps {
    onUpgrade?: () => void
    dim?: boolean
}

export function ProLockOverlay({ onUpgrade, dim = true }: ProLockOverlayProps) {
    return (
        <div
            onClick={(e) => { e.stopPropagation(); onUpgrade?.() }}
            title="Upgrade to Pro to unlock"
            style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                background: dim ? 'rgba(255,255,255,0.55)' : 'transparent',
                backdropFilter: dim ? 'blur(2px)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                {/* Gold crown circle */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        borderRadius: 999,
                        width: 26,
                        height: 26,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(217,119,6,0.4)',
                    }}
                >
                    <CrownIcon size={13} color="#ffffff" />
                </div>
                <ProBadge size="xs" />
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3.  ProFeatureGuard — wraps any clickable element
// ─────────────────────────────────────────────────────────────────────────────
interface ProFeatureGuardProps {
    isPro: boolean
    onUpgradeClick?: () => void
    children: React.ReactNode
    badgePosition?: 'top-right' | 'top-left' | 'inline-end'
    style?: React.CSSProperties
    className?: string
}

export function ProFeatureGuard({
    isPro,
    onUpgradeClick,
    children,
    badgePosition = 'top-right',
    style,
    className,
}: ProFeatureGuardProps) {
    if (isPro) return <>{children}</>

    const badgeStyle: React.CSSProperties =
        badgePosition === 'top-right'
            ? { position: 'absolute', top: -6, right: -6 }
            : badgePosition === 'top-left'
                ? { position: 'absolute', top: -6, left: -6 }
                : { marginLeft: 4 }

    const isAbsolute = badgePosition !== 'inline-end'

    return (
        <div
            className={className}
            style={{
                position: 'relative',
                display: isAbsolute ? 'inline-block' : 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
                ...style,
            }}
            onClick={(e) => { e.stopPropagation(); onUpgradeClick?.() }}
            title="Upgrade to Pro to unlock this feature"
        >
            <div style={{ pointerEvents: 'none', opacity: 0.5 }}>
                {children}
            </div>
            {isAbsolute ? (
                <ProBadge size="xs" style={badgeStyle} />
            ) : (
                <span style={badgeStyle}>
                    <ProBadge size="xs" />
                </span>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// 4.  useProGate — hook: isPro + requirePro()
// ─────────────────────────────────────────────────────────────────────────────
export function useProGate(
    designStudioPlan: 'free' | 'pro',
    openUpgradeModal: () => void,
) {
    const isPro = designStudioPlan === 'pro'

    function requirePro(): boolean {
        if (isPro) return true
        openUpgradeModal()
        return false
    }

    return { isPro, requirePro }
}
