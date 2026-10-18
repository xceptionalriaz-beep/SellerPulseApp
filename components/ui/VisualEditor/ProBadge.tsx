'use client'
// components/ui/VisualEditor/ProBadge.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable Pro gating components for the Visual Editor.
//
// Exports:
//   <ProBadge />          — small inline "PRO" chip (for block library cards,
//                           style preset tiles, toolbar buttons)
//   <ProLockOverlay />    — semi-transparent overlay for locked block cards
//   <ProFeatureGuard />   — wraps any button/element; intercepts click and
//                           fires onUpgradeClick instead when user is free
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'
import { Lock, Sparkles } from 'lucide-react'

// ── Design tokens (matches VisualEditor palette) ──────────────────────────────
const PRO_COLOR   = '#7530fb'   // primary violet
const PRO_ACCENT  = '#b8fa33'   // lime accent
const PRO_DARK    = '#1e1535'   // near-black

// ─────────────────────────────────────────────────────────────────────────────
// 1.  ProBadge — tiny chip, three sizes
// ─────────────────────────────────────────────────────────────────────────────
export type ProBadgeSize = 'xs' | 'sm' | 'md'

interface ProBadgeProps {
  size?: ProBadgeSize
  style?: React.CSSProperties
}

export function ProBadge({ size = 'sm', style }: ProBadgeProps) {
  const cfg = {
    xs: { fontSize: 8,  px: 4,  py: 1,  radius: 3,  iconSize: 7  },
    sm: { fontSize: 9,  px: 5,  py: 2,  radius: 4,  iconSize: 8  },
    md: { fontSize: 11, px: 7,  py: 3,  radius: 5,  iconSize: 10 },
  }[size]

  return (
    <span
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:            3,
        background:     PRO_COLOR,
        color:          PRO_ACCENT,
        fontSize:       cfg.fontSize,
        fontWeight:     700,
        letterSpacing:  '0.06em',
        padding:        `${cfg.py}px ${cfg.px}px`,
        borderRadius:   cfg.radius,
        lineHeight:     1,
        whiteSpace:     'nowrap',
        userSelect:     'none',
        flexShrink:     0,
        ...style,
      }}
    >
      <Sparkles size={cfg.iconSize} strokeWidth={2.5} />
      PRO
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 2.  ProLockOverlay — covers a block card / style tile
//     Position the parent as `position: relative` and drop this inside.
// ─────────────────────────────────────────────────────────────────────────────
interface ProLockOverlayProps {
  /** Called when the user clicks the locked area */
  onUpgrade?: () => void
  /** Show a dimmed overlay (default true). Pass false for a border-only hint. */
  dim?: boolean
}

export function ProLockOverlay({ onUpgrade, dim = true }: ProLockOverlayProps) {
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onUpgrade?.() }}
      title="Upgrade to Pro to unlock"
      style={{
        position:       'absolute',
        inset:          0,
        borderRadius:   'inherit',
        background:     dim ? 'rgba(30,21,53,0.45)' : 'transparent',
        backdropFilter: dim ? 'blur(1px)' : 'none',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        cursor:         'pointer',
        zIndex:         10,
      }}
    >
      <div
        style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          gap:            4,
        }}
      >
        <div
          style={{
            background:   PRO_COLOR,
            borderRadius: 999,
            width:        24,
            height:       24,
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
          }}
        >
          <Lock size={12} color={PRO_ACCENT} strokeWidth={2.5} />
        </div>
        <ProBadge size="xs" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3.  ProFeatureGuard — wraps any clickable element
//     If isPro is false, clicks fire onUpgradeClick instead of the child's
//     own onClick. Adds a PRO badge in the top-right corner.
// ─────────────────────────────────────────────────────────────────────────────
interface ProFeatureGuardProps {
  isPro:           boolean
  onUpgradeClick?: () => void
  children:        React.ReactNode
  /** Where to render the badge relative to the wrapper */
  badgePosition?:  'top-right' | 'top-left' | 'inline-end'
  style?:          React.CSSProperties
  className?:      string
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
      : { marginLeft: 4 }          // inline-end: sits beside the label

  const isAbsolute = badgePosition !== 'inline-end'

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display:  isAbsolute ? 'inline-block' : 'inline-flex',
        alignItems: 'center',
        cursor:   'pointer',
        ...style,
      }}
      onClick={(e) => { e.stopPropagation(); onUpgradeClick?.() }}
      title="Upgrade to Pro to unlock this feature"
    >
      {/* Render children but intercept all pointer events */}
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
// 4.  useProGate — tiny hook: returns helpers for checking plan + firing modal
// ─────────────────────────────────────────────────────────────────────────────
export function useProGate(
  designStudioPlan: 'free' | 'pro',
  openUpgradeModal: () => void,
) {
  const isPro = designStudioPlan === 'pro'

  /** Call before any pro action. Returns true if allowed, false + opens modal if not. */
  function requirePro(): boolean {
    if (isPro) return true
    openUpgradeModal()
    return false
  }

  return { isPro, requirePro }
}
