'use client'
// components/ui/Buttons.tsx
// ─────────────────────────────────────────────────────────────────────────────
// SellerPulse Shared Button Library
// All buttons in one place — import and use anywhere, no inline styling needed.
//
// Usage:
//   import { PrimaryButton, AIButton, SecondaryButton, IconButton, InjectButton, PillButton, GhostButton, DangerButton } from '@/components/ui/Buttons'
//
//   <PrimaryButton onClick={fn} icon={<Plus size={14}/>}>Add Keyword</PrimaryButton>
//   <AIButton onClick={fn} loading={aiLoading}>AI Optimize</AIButton>
//   <SecondaryButton onClick={fn} icon={<Scissors size={13}/>}>Clean</SecondaryButton>
//   <IconButton onClick={fn} icon={<Copy size={13}/>} tooltip="Copy title" />
//   <InjectButton onClick={fn} injected={false} />
//   <PillButton active={true} onClick={fn}>Duplicate Safe</PillButton>
//   <GhostButton onClick={fn} icon={<Copy size={13}/>}>Copy Title</GhostButton>
//   <DangerButton onClick={fn}>Delete</DangerButton>
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react'
import { RotateCcw, Plus, Check, Sparkles } from 'lucide-react'
import Tooltip from '@/components/ui/Tooltip'

// ── Design tokens — matches SellerPulse design system ─────────
const T = {
    lime: '#7530fb',
    dark: '#1e1535',
    teal: '#7530fb',
    tealSoft: '#f3eeff',
    tealBdr: '#ddd6fe',
    muted: '#9ca3af',
    border: '#ede9fe',
    surface: '#ffffff',
    red: '#b91c1c',
    redSoft: '#fef2f2',
    redBdr: '#fecaca',
    blue: '#7530fb',
    accent: '#b8fa33',
    // AI purple gradient
    aiGrad: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
    aiShadow: '0 2px 12px rgba(139, 92, 246, 0.35)',
}

// ── Shared press animation ─────────────────────────────────────
function usePressAnimation() {
    const [pressed, setPressed] = useState(false)
    const onMouseDown = useCallback(() => setPressed(true), [])
    const onMouseUp = useCallback(() => setPressed(false), [])
    const onMouseLeave = useCallback(() => setPressed(false), [])
    return { pressed, onMouseDown, onMouseUp, onMouseLeave }
}

// ── Spinner ────────────────────────────────────────────────────
function Spinner({ color = '#ffffff', size = 13 }: { color?: string; size?: number }) {
    return (
        <RotateCcw size={size} style={{
            color,
            animation: 'spin 0.7s linear infinite',
        }} />
    )
}

// Inject global keyframe once
if (typeof document !== 'undefined') {
    if (!document.getElementById('sp-btn-styles')) {
        const style = document.createElement('style')
        style.id = 'sp-btn-styles'
        style.textContent = `
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
      @keyframes pro-pulse { 0%,100% { transform: scale(1); opacity:0.85; } 50% { transform: scale(1.35); opacity:1; } }
    `
        document.head.appendChild(style)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PrimaryButton
// Main CTA — lime green background, dark text. Use for the most important
// action on a card (Add, Save, Confirm, Keep).
// ─────────────────────────────────────────────────────────────────────────────
interface BaseProps {
    onClick?: () => void
    disabled?: boolean
    loading?: boolean
    children?: React.ReactNode
    icon?: React.ReactNode
    className?: string
    type?: 'button' | 'submit'
    tooltip?: string
}

export function PrimaryButton({ onClick, disabled, loading, children, icon, className = '', tooltip }: BaseProps) {
    const { pressed, ...pressProps } = usePressAnimation()
    const isDisabled = disabled || loading

    const btn = (
        <button
            onClick={onClick}
            disabled={isDisabled}
            {...pressProps}
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
                border: 'none',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                backgroundColor: isDisabled ? T.border : T.lime,
                color: isDisabled ? T.muted : T.dark,
                transform: pressed ? 'scale(0.95)' : 'scale(1)',
                opacity: isDisabled ? 0.6 : 1,
                transition: 'transform 0.12s ease, opacity 0.15s ease, background-color 0.15s ease',
                outline: 'none',
                whiteSpace: 'nowrap',
            }}
        >
            {loading ? <Spinner color={T.dark} /> : icon}
            {children}
        </button>
    )

    return tooltip ? <Tooltip text={tooltip} position="top">{btn}</Tooltip> : btn
}

// ─────────────────────────────────────────────────────────────────────────────
// AIButton
// Purple gradient — exclusively for AI-powered actions.
// Has a live shimmer animation to feel like active AI.
// ─────────────────────────────────────────────────────────────────────────────
export function AIButton({ onClick, disabled, loading, children, className = '', tooltip, chevron = false }: BaseProps & { chevron?: boolean }) {
    const { pressed, ...pressProps } = usePressAnimation()
    const isDisabled = disabled || loading

    // Inject shimmer keyframe once
    if (typeof document !== 'undefined' && !document.getElementById('sp-ai-styles')) {
        const style = document.createElement('style')
        style.id = 'sp-ai-styles'
        style.textContent = `
      @keyframes ai-shimmer {
        0%   { transform: translateX(-100%) skewX(-15deg); }
        100% { transform: translateX(300%) skewX(-15deg); }
      }
      @keyframes ai-sparkle {
        0%   { opacity: 1;   transform: scale(1)    rotate(0deg);   }
        25%  { opacity: 0.7; transform: scale(1.2)  rotate(90deg);  }
        50%  { opacity: 1;   transform: scale(1)    rotate(180deg); }
        75%  { opacity: 0.7; transform: scale(1.2)  rotate(270deg); }
        100% { opacity: 1;   transform: scale(1)    rotate(360deg); }
      }
      @keyframes ai-glow {
        0%, 100% { box-shadow: 0 2px 12px rgba(139,92,246,0.35); }
        50%       { box-shadow: 0 2px 20px rgba(139,92,246,0.65), 0 0 30px rgba(99,102,241,0.3); }
      }
    `
        document.head.appendChild(style)
    }

    const btn = (
        <button
            onClick={onClick}
            disabled={isDisabled}
            {...pressProps}
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
                border: 'none',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                background: isDisabled ? T.border : T.aiGrad,
                color: isDisabled ? T.muted : '#ffffff',
                animation: isDisabled ? 'none' : 'ai-glow 2.5s ease-in-out infinite',
                transform: pressed ? 'scale(0.95)' : 'scale(1)',
                opacity: isDisabled ? 0.6 : 1,
                transition: 'transform 0.12s ease, opacity 0.15s ease',
                outline: 'none',
                whiteSpace: 'nowrap',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Icon */}
            {loading
                ? <Spinner color="#ffffff" />
                : (
                    <span style={{
                        fontSize: 13,
                        animation: isDisabled ? 'none' : 'ai-sparkle 2s linear infinite',
                        display: 'inline-block',
                    }}>✦</span>
                )
            }
            {children}
            {chevron && !loading && (
                <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 2 }}>▾</span>
            )}
        </button>
    )

    return tooltip ? <Tooltip text={tooltip} position="top">{btn}</Tooltip> : btn
}

// ─────────────────────────────────────────────────────────────────────────────
// SecondaryButton
// Soft teal — for secondary actions like Clean, Spin, Try Again.
// ─────────────────────────────────────────────────────────────────────────────
export function SecondaryButton({ onClick, disabled, loading, children, icon, className = '', tooltip }: BaseProps) {
    const { pressed, ...pressProps } = usePressAnimation()
    const isDisabled = disabled || loading

    const btn = (
        <button
            onClick={onClick}
            disabled={isDisabled}
            {...pressProps}
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
                border: `1px solid ${isDisabled ? T.border : T.tealBdr}`,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                backgroundColor: isDisabled ? T.border : T.tealSoft,
                color: isDisabled ? T.muted : T.teal,
                transform: pressed ? 'scale(0.95)' : 'scale(1)',
                opacity: isDisabled ? 0.6 : 1,
                transition: 'transform 0.12s ease, opacity 0.15s ease',
                outline: 'none',
                whiteSpace: 'nowrap',
            }}
        >
            {loading ? <Spinner color={T.teal} /> : icon}
            {children}
        </button>
    )

    return tooltip ? <Tooltip text={tooltip} position="top">{btn}</Tooltip> : btn
}

// ─────────────────────────────────────────────────────────────────────────────
// GhostButton
// White background, dark border — for neutral actions like Copy Title, Revert.
// ─────────────────────────────────────────────────────────────────────────────
export function GhostButton({ onClick, disabled, loading, children, icon, className = '', tooltip }: BaseProps) {
    const { pressed, ...pressProps } = usePressAnimation()
    const isDisabled = disabled || loading

    const btn = (
        <button
            onClick={onClick}
            disabled={isDisabled}
            {...pressProps}
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif',
                border: `1px solid ${T.border}`,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                backgroundColor: T.surface,
                color: isDisabled ? T.muted : T.dark,
                transform: pressed ? 'scale(0.95)' : 'scale(1)',
                opacity: isDisabled ? 0.6 : 1,
                transition: 'transform 0.12s ease, opacity 0.15s ease',
                outline: 'none',
                whiteSpace: 'nowrap',
            }}
        >
            {loading ? <Spinner color={T.muted} /> : icon}
            {children}
        </button>
    )

    return tooltip ? <Tooltip text={tooltip} position="top">{btn}</Tooltip> : btn
}

// ─────────────────────────────────────────────────────────────────────────────
// DangerButton
// Red — for destructive actions like Delete, Remove, Clear All.
// ─────────────────────────────────────────────────────────────────────────────
export function DangerButton({ onClick, disabled, loading, children, icon, className = '', tooltip }: BaseProps) {
    const { pressed, ...pressProps } = usePressAnimation()
    const isDisabled = disabled || loading

    const btn = (
        <button
            onClick={onClick}
            disabled={isDisabled}
            {...pressProps}
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                border: `1px solid ${T.redBdr}`,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                backgroundColor: T.redSoft,
                color: isDisabled ? T.muted : T.red,
                transform: pressed ? 'scale(0.95)' : 'scale(1)',
                opacity: isDisabled ? 0.6 : 1,
                transition: 'transform 0.12s ease, opacity 0.15s ease',
                outline: 'none',
                whiteSpace: 'nowrap',
            }}
        >
            {loading ? <Spinner color={T.red} /> : icon}
            {children}
        </button>
    )

    return tooltip ? <Tooltip text={tooltip} position="top">{btn}</Tooltip> : btn
}

// ─────────────────────────────────────────────────────────────────────────────
// IconButton
// Icon only, no text. Square/circle. Used for Copy icon in title box,
// settings icon, etc. Tooltip is strongly recommended.
// ─────────────────────────────────────────────────────────────────────────────
interface IconButtonProps {
    onClick?: () => void
    icon: React.ReactNode
    tooltip?: string
    active?: boolean
    disabled?: boolean
    size?: number
    variant?: 'default' | 'ghost' | 'success'
    className?: string
}

export function IconButton({ onClick, icon, tooltip, active, disabled, size = 30, variant = 'default', className = '' }: IconButtonProps) {
    const { pressed, ...pressProps } = usePressAnimation()
    const [activated, setActivated] = useState(false)

    const handleClick = useCallback(() => {
        if (disabled) return
        onClick?.()
        setActivated(true)
        setTimeout(() => setActivated(false), 1500)
    }, [onClick, disabled])

    const bg = activated
        ? '#f4ffe6'
        : active
            ? '#f0fdfa'
            : variant === 'ghost' ? 'transparent' : T.surface

    const border = activated
        ? `1px solid ${T.lime}`
        : active
            ? `1px solid ${T.tealBdr}`
            : variant === 'ghost' ? 'none' : `1px solid ${T.border}`

    const btn = (
        <button
            onClick={handleClick}
            disabled={disabled}
            {...pressProps}
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: size,
                height: size,
                borderRadius: 8,
                border,
                cursor: disabled ? 'not-allowed' : 'pointer',
                backgroundColor: bg,
                color: activated ? T.lime : active ? T.teal : T.muted,
                transform: pressed ? 'scale(0.90)' : 'scale(1)',
                opacity: disabled ? 0.5 : 1,
                transition: 'transform 0.12s ease, background-color 0.2s ease, border-color 0.2s ease',
                outline: 'none',
                flexShrink: 0,
            }}
        >
            {icon}
        </button>
    )

    return tooltip ? <Tooltip text={tooltip} position="top">{btn}</Tooltip> : btn
}

// ─────────────────────────────────────────────────────────────────────────────
// InjectButton
// The + Inject button used in keyword tables.
// Shows a checkmark when already injected (keyword is in the title).
// ─────────────────────────────────────────────────────────────────────────────
interface InjectButtonProps {
    onClick?: () => void
    injected?: boolean
    disabled?: boolean
}

export function InjectButton({ onClick, injected, disabled }: InjectButtonProps) {
    const { pressed, ...pressProps } = usePressAnimation()

    return (
        <button
            onClick={injected || disabled ? undefined : onClick}
            disabled={disabled}
            {...pressProps}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 10px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
                border: 'none',
                cursor: injected || disabled ? 'default' : 'pointer',
                backgroundColor: injected ? '#dcfce7' : '#f3eeff',
                color: injected ? '#16a34a' : '#7530fb',
                transform: pressed && !injected ? 'scale(0.93)' : 'scale(1)',
                opacity: disabled ? 0.5 : 1,
                transition: 'transform 0.12s ease, background-color 0.2s ease',
                outline: 'none',
                whiteSpace: 'nowrap',
            }}
        >
            {injected ? <Check size={12} /> : <Plus size={12} />}
            {injected ? 'Added' : 'Inject'}
        </button>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// PillButton
// Rounded pill for mode selectors like Spin Mode pills.
// Active = teal filled. Inactive = soft teal background.
// ─────────────────────────────────────────────────────────────────────────────
interface PillButtonProps {
    onClick?: () => void
    active?: boolean
    children?: React.ReactNode
    disabled?: boolean
    className?: string
}

export function PillButton({ onClick, active, children, disabled, className = '' }: PillButtonProps) {
    const { pressed, ...pressProps } = usePressAnimation()

    return (
        <button
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            {...pressProps}
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                border: `1px solid ${active ? '#0d9488' : 'transparent'}`,
                cursor: disabled ? 'not-allowed' : 'pointer',
                backgroundColor: active ? '#0d9488' : '#f0fdfa',
                color: active ? '#ffffff' : '#0d9488',
                transform: pressed ? 'scale(0.95)' : 'scale(1)',
                opacity: disabled ? 0.5 : 1,
                transition: 'transform 0.12s ease, background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                outline: 'none',
                whiteSpace: 'nowrap',
            }}
        >
            {children}
        </button>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// AddButton
// Small lime "+ ADD" button used in Quick Wins section of TbProHud.
// ─────────────────────────────────────────────────────────────────────────────
export function AddButton({ onClick, disabled }: { onClick?: () => void; disabled?: boolean }) {
    const { pressed, ...pressProps } = usePressAnimation()

    return (
        <button
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            {...pressProps}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
                border: 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                backgroundColor: '#7530fb',
                color: '#ffffff',
                transform: pressed ? 'scale(0.93)' : 'scale(1)',
                opacity: disabled ? 0.5 : 1,
                transition: 'transform 0.12s ease',
                outline: 'none',
            }}
        >
            <Plus size={11} /> ADD
        </button>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// ToggleButton
// Sliding switch — lime when ON, grey when OFF. Use in settings panels.
//
// Usage:
//   <ToggleButton value={autoCapitalize} onChanged={setAutoCapitalize} />
// ─────────────────────────────────────────────────────────────────────────────
interface ToggleButtonProps {
    value: boolean
    onChanged: (v: boolean) => void
    disabled?: boolean
}

export function ToggleButton({ value, onChanged, disabled }: ToggleButtonProps) {
    return (
        <div
            onClick={() => !disabled && onChanged(!value)}
            style={{
                position: 'relative',
                width: 44,
                height: 24,
                borderRadius: 999,
                backgroundColor: value ? T.lime : '#e5e0f5',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'background-color 0.2s ease',
                flexShrink: 0,
            }}
        >
            <div style={{
                position: 'absolute',
                top: 2,
                left: value ? 22 : 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.20)',
                transition: 'left 0.2s ease, background-color 0.2s ease',
            }} />
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// RemoveBgProButton
// Gold gradient — for the paid HD background removal feature.
// ✨ icon animates like sparkles to feel premium and live.
// ─────────────────────────────────────────────────────────────────────────────


export function RemoveBgProButton({ onClick, disabled, loading, className = '', size = 'md' }: {
    onClick?: () => void
    disabled?: boolean
    loading?: boolean
    className?: string
    size?: 'sm' | 'md'
}) {
    const { pressed, ...pressProps } = usePressAnimation()
    const isDisabled = disabled || loading

    // Inject keyframes once
    if (typeof document !== 'undefined' && !document.getElementById('sp-pro-bg-styles')) {
        const style = document.createElement('style')
        style.id = 'sp-pro-bg-styles'
        style.textContent = `
            @keyframes pro-pulse {
                0%,100% { transform: scale(0.75); opacity: 0.5; }
                50%     { transform: scale(1.3);  opacity: 1;   }
            }
            @keyframes pro-glow {
                0%, 100% { box-shadow: 0 2px 10px rgba(245,158,11,0.4); }
                50%       { box-shadow: 0 2px 20px rgba(245,158,11,0.7), 0 0 28px rgba(217,119,6,0.35); }
            }
            @keyframes pro-shimmer {
                0%   { transform: translateX(-100%) skewX(-15deg); }
                100% { transform: translateX(300%) skewX(-15deg); }
            }
        `
        document.head.appendChild(style)
    }

    const isSmall = size === 'sm'

    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            {...pressProps}
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: isSmall ? 4 : 6,
                padding: isSmall ? '4px 10px' : '7px 16px',
                borderRadius: 999,
                fontSize: isSmall ? 11 : 12,
                fontWeight: 700,
                fontFamily: 'DM Sans, sans-serif',
                border: 'none',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                background: isDisabled
                    ? '#e5e7eb'
                    : 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
                color: isDisabled ? '#9ca3af' : '#ffffff',
                animation: isDisabled ? 'none' : 'pro-glow 2.5s ease-in-out infinite',
                transform: pressed ? 'scale(0.95)' : 'scale(1)',
                opacity: isDisabled ? 0.6 : 1,
                transition: 'transform 0.12s ease, opacity 0.15s ease',
                outline: 'none',
                whiteSpace: 'nowrap',
                position: 'relative',
                overflow: 'hidden',
                letterSpacing: '0.01em',
            }}>

            {/* Shimmer sweep */}
            {!isDisabled && (
                <span style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '40%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                    animation: 'pro-shimmer 2.5s ease-in-out infinite',
                    pointerEvents: 'none',
                }} />
            )}

            {/* ✨ Live sparkle icon */}
            {loading
                ? <Spinner color="#ffffff" size={isSmall ? 11 : 13} />
                : (
                    <span style={{
                        fontSize: isSmall ? 13 : 15,
                        animation: isDisabled ? 'none' : 'pro-pulse 1.4s ease-in-out infinite',
                        display: 'inline-block',
                        color: '#ffffff',
                    }}>✦</span>
                )
            }

            {loading ? 'Removing...' : 'Remove BG PRO'}
        </button>
    )
}
