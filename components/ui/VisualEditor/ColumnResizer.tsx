'use client'
// components/ui/VisualEditor/ColumnResizer.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Zero-Flicker Live Drag-to-Resize (Excel / Google Sheets engine).
//
// Features:
//   • Column Resizer: Divider lines glide smoothly left & right in real-time.
//   • Row Height Resizer: Bottom drop line tracks mouse cursor downwards live.
//   • Direct DOM Styling: Zero lag, zero re-parsing, zero flickering.
//   • Clean commit on release: Saves final state cleanly on mouseup.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Block } from './blocks'

interface ColumnResizerProps {
    block: Block
    onUpdateProps: (patch: Record<string, any>) => void
    containerRef?: React.RefObject<HTMLDivElement | null>
}

export default function ColumnResizer({ block, onUpdateProps, containerRef }: ColumnResizerProps) {
    const props = block.props as any
    const isTwo = block.type === 'two_column'
    const isThree = block.type === 'three_column'
    const isFour = block.type === 'four_column'

    const localRef = useRef<HTMLDivElement | null>(null)
    const getHostElement = () => containerRef?.current || localRef.current?.parentElement || localRef.current

    // Hover states
    const [hoveredDivider, setHoveredDivider] = useState<number | null>(null)
    const [hoveredRow, setHoveredRow] = useState(false)

    // Current widths from props
    const widths = React.useMemo(() => {
        if (isTwo) {
            const left = Number(props.leftWidth ?? 50)
            return [left, 100 - left]
        }
        if (isThree) {
            const w1 = Number(props.customWidths ? (props.col1Width ?? 33) : 33)
            const w2 = Number(props.customWidths ? (props.col2Width ?? 34) : 34)
            const w3 = Number(props.customWidths ? (props.col3Width ?? 33) : 33)
            return [w1, w2, w3]
        }
        if (isFour) {
            const w1 = Number(props.customWidths ? (props.col1Width ?? 25) : 25)
            const w2 = Number(props.customWidths ? (props.col2Width ?? 25) : 25)
            const w3 = Number(props.customWidths ? (props.col3Width ?? 25) : 25)
            const w4 = Number(props.customWidths ? (props.col4Width ?? 25) : 25)
            return [w1, w2, w3, w4]
        }
        return []
    }, [isTwo, isThree, isFour, props.leftWidth, props.customWidths, props.col1Width, props.col2Width, props.col3Width, props.col4Width])

    // Current height
    const currentHeight = isTwo
        ? (props.leftMinHeight ?? 0)
        : (props.col1MinHeight ?? props.minHeight ?? 0)

    // Live display widths & heights during drag (smooth 0ms local preview)
    const [liveWidths, setLiveWidths] = useState<number[] | null>(null)
    const [liveHeight, setLiveHeight] = useState<number | null>(null)

    const liveWidthsRef = useRef(liveWidths)
    liveWidthsRef.current = liveWidths
    const liveHeightRef = useRef(liveHeight)
    liveHeightRef.current = liveHeight

    const displayWidths = liveWidths ?? widths

    // Drag state
    const [dragging, setDragging] = useState<{
        type: 'col' | 'row'
        dividerIndex?: number
        startX?: number
        startY?: number
        initialWidths?: number[]
        initialHeight?: number
    } | null>(null)

    const dragRef = useRef(dragging)
    dragRef.current = dragging

    const rafRef = useRef<number | null>(null)

    // Calculate divider positions as cumulative percentages
    const dividerPositions = React.useMemo(() => {
        let cumulative = 0
        const positions: number[] = []
        for (let i = 0; i < displayWidths.length - 1; i++) {
            cumulative += displayWidths[i]
            positions.push(cumulative)
        }
        return positions
    }, [displayWidths])

    // ── Stop drag and commit ONCE to React state (Zero re-render flicker) ──
    const stopDrag = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }

        const finalWidths = liveWidthsRef.current
        const finalHeight = liveHeightRef.current

        setDragging(null)
        setLiveWidths(null)
        setLiveHeight(null)
        setHoveredDivider(null)
        setHoveredRow(false)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''

        // Commit once on mouse release
        if (finalWidths) {
            if (isTwo) {
                onUpdateProps({ leftWidth: finalWidths[0] })
            } else if (isThree) {
                onUpdateProps({
                    customWidths: true,
                    col1Width: finalWidths[0],
                    col2Width: finalWidths[1],
                    col3Width: finalWidths[2],
                })
            } else if (isFour) {
                onUpdateProps({
                    customWidths: true,
                    col1Width: finalWidths[0],
                    col2Width: finalWidths[1],
                    col3Width: finalWidths[2],
                    col4Width: finalWidths[3],
                })
            }
        } else if (finalHeight != null) {
            if (isTwo) {
                onUpdateProps({ leftMinHeight: finalHeight, rightMinHeight: finalHeight })
            } else if (isThree) {
                onUpdateProps({ col1MinHeight: finalHeight, col2MinHeight: finalHeight, col3MinHeight: finalHeight, minHeight: finalHeight })
            } else if (isFour) {
                onUpdateProps({ col1MinHeight: finalHeight, col2MinHeight: finalHeight, col3MinHeight: finalHeight, col4MinHeight: finalHeight, minHeight: finalHeight })
            }
        }
    }, [isTwo, isThree, isFour, onUpdateProps])

    // ── Start Column Drag ──
    const handleColMouseDown = (dividerIndex: number, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragging({
            type: 'col',
            dividerIndex,
            startX: e.clientX,
            initialWidths: [...widths],
        })
    }

    // ── Start Row Drag ──
    const handleRowMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const host = getHostElement()
        const currentRectHeight = host ? host.getBoundingClientRect().height : (currentHeight || 120)
        const initialH = currentHeight > 0 ? currentHeight : Math.round(currentRectHeight)
        setDragging({
            type: 'row',
            startY: e.clientY,
            initialHeight: initialH,
        })
        setLiveHeight(initialH)
    }

    // ── Handle Real-Time Live Mouse Move with Direct DOM Updates (Zero Flash) ──
    const handleGlobalMouseMove = useCallback((e: MouseEvent | React.MouseEvent) => {
        if (!dragging) return

        if (e.buttons === 0) {
            stopDrag()
            return
        }

        if (rafRef.current) return

        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null
            const current = dragRef.current
            if (!current) return

            const host = getHostElement()
            if (!host) return

            if (current.type === 'col' && current.dividerIndex != null && current.initialWidths) {
                const rect = host.getBoundingClientRect()
                if (rect.width <= 0) return

                const deltaX = e.clientX - (current.startX ?? e.clientX)
                const deltaPercent = Math.round((deltaX / rect.width) * 100)

                const i = current.dividerIndex
                const minColWidth = 10

                const leftOriginal = current.initialWidths[i]
                const rightOriginal = current.initialWidths[i + 1]
                const combined = leftOriginal + rightOriginal

                let proposedLeft = leftOriginal + deltaPercent
                proposedLeft = Math.max(minColWidth, Math.min(combined - minColWidth, proposedLeft))
                const proposedRight = combined - proposedLeft

                const newWidths = [...current.initialWidths]
                newWidths[i] = proposedLeft
                newWidths[i + 1] = proposedRight

                // 1. Update local state so divider lines glide at 120fps
                setLiveWidths(newWidths)

                // 2. Direct DOM update inside the iframe in 0.1ms without triggering full page re-render!
                const iframe = host.querySelector('iframe') as HTMLIFrameElement | null
                const doc = iframe?.contentDocument || iframe?.contentWindow?.document
                if (doc) {
                    const rows = doc.querySelectorAll('tr')
                    rows.forEach(row => {
                        const tds = Array.from(row.querySelectorAll(':scope > td[width]'))
                            .filter(td => !td.getAttribute('width')?.includes('px'))
                        if (tds.length === newWidths.length) {
                            tds.forEach((td, idx) => {
                                ; (td as HTMLElement).style.width = `${newWidths[idx]}%`
                                td.setAttribute('width', `${newWidths[idx]}%`)
                            })
                        }
                    })
                }
            } else if (current.type === 'row' && current.startY != null && current.initialHeight != null) {
                const deltaY = e.clientY - current.startY
                const newH = Math.max(40, Math.round(current.initialHeight + deltaY))

                // 1. Update local height state so the line tracks the mouse live downwards
                setLiveHeight(newH)

                // 2. Direct DOM height updates on iframe and containers live!
                const iframe = host.querySelector('iframe') as HTMLIFrameElement | null
                if (iframe) {
                    iframe.style.height = `${newH}px`
                    let parent = iframe.parentElement
                    while (parent && parent !== host) {
                        if (parent.style.height) {
                            parent.style.height = `${newH}px`
                        }
                        parent = parent.parentElement
                    }
                }
                const doc = iframe?.contentDocument || iframe?.contentWindow?.document
                if (doc) {
                    const tds = doc.querySelectorAll('td[valign], td[width]')
                    tds.forEach(td => {
                        ; (td as HTMLElement).style.height = `${newH}px`
                    })
                }
            }
        })
    }, [dragging, stopDrag])

    // Global event listeners
    useEffect(() => {
        if (!dragging) return

        const onWinMove = (e: MouseEvent) => handleGlobalMouseMove(e)
        const onWinUp = () => stopDrag()

        document.body.style.cursor = dragging.type === 'col' ? 'col-resize' : 'row-resize'
        document.body.style.userSelect = 'none'

        window.addEventListener('mousemove', onWinMove, { passive: true })
        window.addEventListener('mouseup', onWinUp)
        window.addEventListener('blur', onWinUp)

        return () => {
            window.removeEventListener('mousemove', onWinMove)
            window.removeEventListener('mouseup', onWinUp)
            window.removeEventListener('blur', onWinUp)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
            }
        }
    }, [dragging, handleGlobalMouseMove, stopDrag])

    return (
        <>
            {/* ── Fullscreen Overlay during drag: Captures all mouse events smoothly ── */}
            {dragging && (
                <div
                    onMouseMove={e => handleGlobalMouseMove(e)}
                    onMouseUp={stopDrag}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999999,
                        cursor: dragging.type === 'col' ? 'col-resize' : 'row-resize',
                        userSelect: 'none',
                        backgroundColor: 'transparent',
                    }}
                />
            )}

            <div
                ref={localRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                    zIndex: 30,
                }}
            >
                {/* ── Vertical Column Dividers (Clean Purple Line, Zero Shadow Blur) ── */}
                {dividerPositions.map((posPercent, idx) => {
                    const isHovered = hoveredDivider === idx
                    const isDragActive = dragging?.type === 'col' && dragging.dividerIndex === idx
                    const isHighlighted = isHovered || isDragActive

                    return (
                        <div
                            key={`col-divider-${idx}`}
                            onMouseEnter={() => !dragging && setHoveredDivider(idx)}
                            onMouseLeave={() => !dragging && setHoveredDivider(null)}
                            onMouseDown={e => handleColMouseDown(idx, e)}
                            title="Drag to resize column"
                            style={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                left: `${posPercent}%`,
                                width: 14,
                                transform: 'translateX(-50%)',
                                cursor: 'col-resize',
                                pointerEvents: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 32,
                            }}
                        >
                            {/* Crisp Purple Line */}
                            <div
                                style={{
                                    width: isHighlighted ? 2.5 : 1,
                                    height: '100%',
                                    backgroundColor: isHighlighted ? '#7530fb' : 'rgba(117, 48, 251, 0.20)',
                                    transition: isDragActive ? 'none' : 'background-color 0.12s',
                                }}
                            />
                        </div>
                    )
                })}

                {/* ── Bottom Edge Resizer (Follows mouse downwards live) ── */}
                <div
                    onMouseEnter={() => !dragging && setHoveredRow(true)}
                    onMouseLeave={() => !dragging && setHoveredRow(false)}
                    onMouseDown={handleRowMouseDown}
                    title="Drag to resize row height"
                    style={{
                        position: 'absolute',
                        top: dragging?.type === 'row' && liveHeight ? `${liveHeight}px` : undefined,
                        bottom: dragging?.type === 'row' ? undefined : -5,
                        left: 0,
                        right: 0,
                        height: 14,
                        transform: dragging?.type === 'row' ? 'translateY(-50%)' : undefined,
                        cursor: 'row-resize',
                        pointerEvents: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 35,
                    }}
                >
                    <div
                        style={{
                            height: (hoveredRow || dragging?.type === 'row') ? 2.5 : 1,
                            width: '100%',
                            backgroundColor: (hoveredRow || dragging?.type === 'row') ? '#7530fb' : 'rgba(117, 48, 251, 0.20)',
                            transition: dragging?.type === 'row' ? 'none' : 'background-color 0.12s',
                        }}
                    />
                </div>
            </div>
        </>
    )
}
