'use client'
// components/ui/Tooltip.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable tooltip component — uses a portal so it always renders above
// everything else regardless of parent overflow/z-index.
// Usage:
//   <Tooltip text="This means the market is very saturated">
//     <span>hover me</span>
//   </Tooltip>
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
    text: string                    // the tooltip message
    children: React.ReactNode           // the element that triggers the tooltip
    position?: 'top' | 'bottom' | 'left' | 'right'  // default: 'top'
    maxWidth?: number                    // default: 220px
}

export default function Tooltip({
    text,
    children,
    position = 'top',
    maxWidth = 220,
}: TooltipProps) {
    const [visible, setVisible] = useState(false)
    const [coords, setCoords] = useState({ top: 0, left: 0 })
    const triggerRef = useRef<HTMLDivElement>(null)

    function show() {
        if (!triggerRef.current) return
        const rect = triggerRef.current.getBoundingClientRect()
        const GAP = 0
        const W = maxWidth
        const vw = window.innerWidth
        const vh = window.innerHeight

        let top = 0
        let left = 0

        if (position === 'top') {
            top = rect.top - GAP
            left = rect.left + rect.width / 2
            // Clamp left so tooltip never overflows right edge
            const halfW = W / 2
            if (left + halfW > vw - 8) left = vw - halfW - 8
            if (left - halfW < 8) left = halfW + 8
        } else if (position === 'bottom') {
            top = rect.bottom + GAP
            left = rect.left + rect.width / 2
            const halfW = W / 2
            if (left + halfW > vw - 8) left = vw - halfW - 8
            if (left - halfW < 8) left = halfW + 8
        } else if (position === 'left') {
            top = rect.top + rect.height / 2
            left = rect.left - GAP
        } else {
            top = rect.top + rect.height / 2
            left = rect.right + GAP
        }

        setCoords({ top, left })
        setVisible(true)
    }

    function hide() { setVisible(false) }

    const transformMap = {
        top: 'translate(-50%, -100%)',
        bottom: 'translate(-50%, 0%)',
        left: 'translate(-100%, -50%)',
        right: 'translate(0%, -50%)',
    }

    return (
        <>
            <div
                ref={triggerRef}
                onMouseEnter={show}
                onMouseLeave={hide}
                style={{ display: 'inline', cursor: 'default' }}
            >
                {children}
            </div>

            {visible && typeof document !== 'undefined' && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        top: coords.top,
                        left: coords.left,
                        transform: transformMap[position],
                        zIndex: 99999,
                        maxWidth,
                        backgroundColor: '#1a2410',
                        color: '#ffffff',
                        fontSize: 12,
                        fontWeight: 500,
                        fontFamily: 'Inter, sans-serif',
                        lineHeight: 1.5,
                        padding: '7px 11px',
                        borderRadius: 8,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                        pointerEvents: 'none',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                    }}
                >
                    {text}
                    {/* Arrow */}
                    <div style={{
                        position: 'absolute',
                        width: 0,
                        height: 0,
                        ...(position === 'top' && {
                            bottom: -6,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: '6px solid #1a2410',
                        }),
                        ...(position === 'bottom' && {
                            top: -6,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderBottom: '6px solid #1a2410',
                        }),
                        ...(position === 'left' && {
                            right: -6,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            borderTop: '6px solid transparent',
                            borderBottom: '6px solid transparent',
                            borderLeft: '6px solid #1a2410',
                        }),
                        ...(position === 'right' && {
                            left: -6,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            borderTop: '6px solid transparent',
                            borderBottom: '6px solid transparent',
                            borderRight: '6px solid #1a2410',
                        }),
                    }} />
                </div>,
                document.body
            )}
        </>
    )
}
