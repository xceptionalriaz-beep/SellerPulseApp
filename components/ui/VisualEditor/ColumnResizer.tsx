'use client'
// components/ui/VisualEditor/ColumnResizer.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Excel / Google Sheets-style high-performance drag-to-resize dividers.
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

    // Drag state
    const [dragging, setDragging] = useState<{
        type: 'col' | 'row'
        dividerIndex?: number
        startX?: number
        startY?: number
        initialWidths?: number[]
        initialHeight?: number
    } | null>(null)

    // RAF reference to prevent lag
    const rafRef = useRef<number | null>(null)

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

    // ── Stop drag safely ──
    const stopDrag = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }
        setDragging(null)
        setHoveredDivider(null)
        setHoveredRow(false)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
    }, [])

    // ── Handle Mouse Down for Column Divider ──
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

    // ── Handle Mouse Down for Row Bottom ──
    const handleRowMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const host = getHostElement()
        const currentRectHeight = host ? host.getBoundingClientRect().height : (currentHeight || 120)
        setDragging({
            type: 'row',
            startY: e.clientY,
            initialHeight: currentHeight > 0 ? currentHeight : Math.round(currentRectHeight),
        })
    }

    // ── Mouse Move during drag ──
    const handleGlobalMouseMove = useCallback((e: MouseEvent | React.MouseEvent) => {
        if (!dragging) return

        // Critical: If the user released the mouse button anywhere, stop immediately!
        if (e.buttons === 0) {
            stopDrag()
            return
        }

        if (rafRef.current) return // throttle to 60fps/120fps display refresh

        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null
            const host = getHostElement()
            if (!host) return

            if (dragging.type === 'col' && dragging.dividerIndex != null && dragging.initialWidths) {
                const rect = host.getBoundingClientRect()
                if (rect.width <= 0) return

                const deltaX = e.clientX - (dragging.startX ?? e.clientX)
                const deltaPercent = Math.round((deltaX / rect.width) * 100)

                const i = dragging.dividerIndex
                const newWidths = [...dragging.initialWidths]
                const minColWidth = 12

                const leftOriginal = dragging.initialWidths[i]
                const rightOriginal = dragging.initialWidths[i + 1]
                const combined = leftOriginal + rightOriginal

                let proposedLeft = leftOriginal + deltaPercent
                proposedLeft = Math.max(minColWidth, Math.min(combined - minColWidth, proposedLeft))
                const proposedRight = combined - proposedLeft

                newWidths[i] = proposedLeft
                newWidths[i + 1] = proposedRight

                if (isTwo) {
                    onUpdateProps({ leftWidth: proposedLeft })
                } else if (isThree) {
                    onUpdateProps({
                        customWidths: true,
                        col1Width: newWidths[0],
                        col2Width: newWidths[1],
                        col3Width: newWidths[2],
                    })
                } else if (isFour) {
                    onUpdateProps({
                        customWidths: true,
                        col1Width: newWidths[0],
                        col2Width: newWidths[1],
                        col3Width: newWidths[2],
                        col4Width: newWidths[3],
                    })
                }
            } else if (dragging.type === 'row' && dragging.startY != null && dragging.initialHeight != null) {
                const deltaY = e.clientY - dragging.startY
                const newH = Math.max(40, Math.round(dragging.initialHeight + deltaY))

                if (isTwo) {
                    onUpdateProps({ leftMinHeight: newH, rightMinHeight: newH })
                } else if (isThree) {
                    onUpdateProps({ col1MinHeight: newH, col2MinHeight: newH, col3MinHeight: newH, minHeight: newH })
                } else if (isFour) {
                    onUpdateProps({ col1MinHeight: newH, col2MinHeight: newH, col3MinHeight: newH, col4MinHeight: newH, minHeight: newH })
                }
            }
        })
    }, [dragging, isTwo, isThree, isFour, onUpdateProps, stopDrag])

    // Window level listeners as safety fallback
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

    // Calculate divider positions as cumulative percentages
    const dividerPositions = React.useMemo(() => {
        let cumulative = 0
        const positions: number[] = []
        for (let i = 0; i < widths.length - 1; i++) {
            cumulative += widths[i]
            positions.push(cumulative)
        }
        return positions
    }, [widths])

    return (
        <>
            {/* ── Fullscreen Overlay during drag: Prevents iframes from swallowing mouseup! ── */}
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
                {/* ── Vertical Column Dividers (Excel-Style col-resize) ── */}
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
                            title={`Drag to resize Column ${idx + 1} and Column ${idx + 2}`}
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
                            {/* Pro Line: Lights up purple only when hovering or dragging */}
                            <div
                                style={{
                                    width: isHighlighted ? 3 : 1,
                                    height: '100%',
                                    backgroundColor: isHighlighted ? '#7530fb' : 'rgba(117, 48, 251, 0.12)',
                                    transition: isDragActive ? 'none' : 'background-color 0.12s, width 0.12s',
                                    boxShadow: isHighlighted ? '0 0 10px rgba(117, 48, 251, 0.7)' : 'none',
                                }}
                            />
                        </div>
                    )
                })}

                {/* ── Bottom Edge Resizer (Excel-Style row-resize) ── */}
                <div
                    onMouseEnter={() => !dragging && setHoveredRow(true)}
                    onMouseLeave={() => !dragging && setHoveredRow(false)}
                    onMouseDown={handleRowMouseDown}
                    title="Drag to resize row height"
                    style={{
                        position: 'absolute',
                        bottom: -5,
                        left: 0,
                        right: 0,
                        height: 12,
                        cursor: 'row-resize',
                        pointerEvents: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 32,
                    }}
                >
                    {/* Pro Bottom Line */}
                    <div
                        style={{
                            height: (hoveredRow || dragging?.type === 'row') ? 3 : 1,
                            width: '100%',
                            backgroundColor: (hoveredRow || dragging?.type === 'row') ? '#7530fb' : 'rgba(117, 48, 251, 0.12)',
                            transition: dragging?.type === 'row' ? 'none' : 'background-color 0.12s, height 0.12s',
                            boxShadow: (hoveredRow || dragging?.type === 'row') ? '0 0 10px rgba(117, 48, 251, 0.7)' : 'none',
                        }}
                    />
                </div>
            </div>
        </>
    )
}
