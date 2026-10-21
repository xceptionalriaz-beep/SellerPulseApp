'use client'
// components/ui/VisualEditor/ColumnControls.tsx
// ─────────────────────────────────────────────────────────────────────────────
// In-Canvas Column Quick Controls (Height, Distance, Padding, Themes, Featured, Row)
// Appears floating directly above column blocks on the canvas when selected.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'
import { Block, BlockType } from './blocks'
import {
    Maximize2, Minimize2, MoveHorizontal, AlignVerticalJustifyCenter,
    AlignVerticalJustifyStart, AlignVerticalJustifyEnd, Layers, ArrowLeftRight,
    Square, Star, Split, Moon, Plus, Minus
} from 'lucide-react'

interface ColumnControlsProps {
    block: Block
    onUpdateProps: (patch: Record<string, any>) => void
    isFirst?: boolean
}

export default function ColumnControls({ block, onUpdateProps, isFirst = false }: ColumnControlsProps) {
    const props = block.props as any
    const isTwo = block.type === 'two_column'
    const isThree = block.type === 'three_column'
    const isFour = block.type === 'four_column'

    // Current values
    const currentGap = props.gap ?? 12
    const currentAlign = props.colAlign ?? 'top'
    const currentMinHeight = isTwo ? (props.leftMinHeight ?? 0) : (props.col1MinHeight ?? props.minHeight ?? 0)
    const currentPadding = isTwo ? (props.lPadTop ?? 0) : (props.colPadding ?? 0)
    const showDivider = Boolean(props.showDivider)
    const isFeatured = Boolean(props.isFeaturedCol)
    const currentRowCount = props.rowCount ?? (Array.isArray(props.rows) ? props.rows.length : 1)

    // ── 1. Height (Long / Short) ──
    const setHeight = (h: number) => {
        if (isTwo) {
            onUpdateProps({ leftMinHeight: h, rightMinHeight: h })
        } else if (isThree) {
            onUpdateProps({ col1MinHeight: h, col2MinHeight: h, col3MinHeight: h, minHeight: h })
        } else if (isFour) {
            onUpdateProps({ col1MinHeight: h, col2MinHeight: h, col3MinHeight: h, col4MinHeight: h, minHeight: h })
        }
    }

    // ── 2. Distance (Column Gap) ──
    const setGap = (g: number) => {
        onUpdateProps({ gap: g })
    }

    // ── 3. Inner Padding (Breathing Room) ──
    const setPadding = (p: number) => {
        if (isTwo) {
            onUpdateProps({
                lPadTop: p, lPadRight: p, lPadBottom: p, lPadLeft: p,
                rPadTop: p, rPadRight: p, rPadBottom: p, rPadLeft: p,
                leftPadding: p, rightPadding: p
            })
        } else if (isThree) {
            onUpdateProps({ colPadding: p, col1Padding: p, col2Padding: p, col3Padding: p })
        } else if (isFour) {
            onUpdateProps({ colPadding: p, col1Padding: p, col2Padding: p, col3Padding: p, col4Padding: p })
        }
    }

    // ── 4. Themes: Cards / Editorial Dividers / Dark Obsidian ──
    const applyTheme = (theme: 'cards' | 'editorial' | 'dark') => {
        if (theme === 'cards') {
            onUpdateProps({
                leftBg: '#ffffff', rightBg: '#ffffff',
                col1Bg: '#ffffff', col2Bg: '#ffffff', col3Bg: '#ffffff', col4Bg: '#ffffff',
                leftBorderWidth: 1, rightBorderWidth: 1,
                col1BorderWidth: 1, col2BorderWidth: 1, col3BorderWidth: 1, col4BorderWidth: 1,
                leftBorderColor: '#e2e8f0', rightBorderColor: '#e2e8f0',
                col1BorderColor: '#e2e8f0', col2BorderColor: '#e2e8f0', col3BorderColor: '#e2e8f0', col4BorderColor: '#e2e8f0',
                leftRadius: 8, rightRadius: 8, colRadius: 8,
                col1Radius: 8, col2Radius: 8, col3Radius: 8, col4Radius: 8,
                gap: 16,
                showDivider: false,
                colPadding: 16,
                lPadTop: 16, lPadRight: 16, lPadBottom: 16, lPadLeft: 16,
                rPadTop: 16, rPadRight: 16, rPadBottom: 16, rPadLeft: 16,
            })
        } else if (theme === 'editorial') {
            onUpdateProps({
                leftBg: 'transparent', rightBg: 'transparent',
                col1Bg: 'transparent', col2Bg: 'transparent', col3Bg: 'transparent', col4Bg: 'transparent',
                leftBorderWidth: 0, rightBorderWidth: 0,
                col1BorderWidth: 0, col2BorderWidth: 0, col3BorderWidth: 0, col4BorderWidth: 0,
                leftRadius: 0, rightRadius: 0, colRadius: 0,
                gap: 0,
                showDivider: true,
                dividerColor: '#e2e8f0',
                dividerWidth: 1,
                colPadding: 14,
                lPadTop: 14, lPadRight: 14, lPadBottom: 14, lPadLeft: 14,
                rPadTop: 14, rPadRight: 14, rPadBottom: 14, rPadLeft: 14,
            })
        } else if (theme === 'dark') {
            onUpdateProps({
                bgColor: '#090d16',
                leftBg: '#0f172a', rightBg: '#0f172a',
                col1Bg: '#0f172a', col2Bg: '#0f172a', col3Bg: '#0f172a', col4Bg: '#0f172a',
                leftBorderWidth: 1, rightBorderWidth: 1,
                col1BorderWidth: 1, col2BorderWidth: 1, col3BorderWidth: 1, col4BorderWidth: 1,
                leftBorderColor: '#334155', rightBorderColor: '#334155',
                col1BorderColor: '#334155', col2BorderColor: '#334155', col3BorderColor: '#334155', col4BorderColor: '#334155',
                leftRadius: 8, rightRadius: 8, colRadius: 8,
                col1Radius: 8, col2Radius: 8, col3Radius: 8, col4Radius: 8,
                gap: 16,
                showDivider: false,
                colPadding: 16,
                lPadTop: 16, lPadRight: 16, lPadBottom: 16, lPadLeft: 16,
                rPadTop: 16, rPadRight: 16, rPadBottom: 16, rPadLeft: 16,
            })
        }
    }

    // ── 5. Toggle Vertical Dividers ──
    const toggleDividers = () => {
        onUpdateProps({
            showDivider: !showDivider,
            dividerColor: '#e2e8f0',
            dividerWidth: 1,
            gap: !showDivider ? 0 : 12,
        })
    }

    // ── 6. Highlight Center / Featured Column ──
    const toggleFeatured = () => {
        if (isFeatured) {
            // Turn off featured highlight
            onUpdateProps({
                isFeaturedCol: false,
                leftBorderColor: '#e2e8f0', leftBorderWidth: 1, leftBg: '#ffffff',
                col2BorderColor: '#e2e8f0', col2BorderWidth: 1, col2Bg: '#ffffff',
            })
        } else {
            // Highlight center column with accent border + tint
            if (isTwo) {
                onUpdateProps({
                    isFeaturedCol: true,
                    leftBorderColor: '#7530fb',
                    leftBorderWidth: 2,
                    leftBg: '#f8f5ff',
                })
            } else {
                onUpdateProps({
                    isFeaturedCol: true,
                    col2BorderColor: '#7530fb',
                    col2BorderWidth: 2,
                    col2Bg: '#f8f5ff',
                })
            }
        }
    }

    // ── 7. Column Swap Left / Right ──
    const swapColumns = () => {
        if (isTwo) {
            onUpdateProps({
                leftContent: props.rightContent,
                rightContent: props.leftContent,
                leftBg: props.rightBg,
                rightBg: props.leftBg,
            })
        } else if (isThree) {
            onUpdateProps({
                col1Content: props.col3Content,
                col2Content: props.col1Content,
                col3Content: props.col2Content,
                col1Bg: props.col3Bg,
                col2Bg: props.col1Bg,
                col3Bg: props.col2Bg,
            })
        }
    }

    // ── 8. Add Another Row of Columns ──
    const addRow = () => {
        const nextCount = currentRowCount + 1
        const emptySlot = (slot: string) => `<div data-canvas-dropzone="${slot}" style="width:100%;min-height:80px;background:#f8f8f8;border:1px dashed #ddd;border-radius:4px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span class="add-btn" style="font-family:Arial,sans-serif;font-size:13px;color:#6b7280;">+ Add Content</span></div>`

        const newPatch: Record<string, any> = { rowCount: nextCount, rows: undefined }
        if (isThree) {
            const start = (nextCount - 1) * 3 + 1
            newPatch[`col${start}Content`] = emptySlot(`col${start}Content`)
            newPatch[`col${start + 1}Content`] = emptySlot(`col${start + 1}Content`)
            newPatch[`col${start + 2}Content`] = emptySlot(`col${start + 2}Content`)
        } else if (isTwo) {
            const start = (nextCount - 1) * 2 + 1
            newPatch[`col${start}Content`] = emptySlot(`col${start}Content`)
            newPatch[`col${start + 1}Content`] = emptySlot(`col${start + 1}Content`)
        } else if (isFour) {
            const start = (nextCount - 1) * 4 + 1
            for (let i = 0; i < 4; i++) {
                newPatch[`col${start + i}Content`] = emptySlot(`col${start + i}Content`)
            }
        }
        onUpdateProps(newPatch)
    }

    // ── 9. Remove Last Row of Columns ──
    const removeRow = () => {
        if (currentRowCount <= 1) return
        const nextCount = currentRowCount - 1
        const newPatch: Record<string, any> = { rowCount: nextCount }

        if (isThree) {
            const start = (currentRowCount - 1) * 3 + 1
            newPatch[`col${start}Content`] = undefined
            newPatch[`col${start + 1}Content`] = undefined
            newPatch[`col${start + 2}Content`] = undefined
        } else if (isTwo) {
            const start = (currentRowCount - 1) * 2 + 1
            newPatch[`col${start}Content`] = undefined
            newPatch[`col${start + 1}Content`] = undefined
        } else if (isFour) {
            const start = (currentRowCount - 1) * 4 + 1
            for (let i = 0; i < 4; i++) {
                newPatch[`col${start + i}Content`] = undefined
            }
        }
        onUpdateProps(newPatch)
    }

    return (
        <div
            onClick={e => e.stopPropagation()}
            style={{
                position: 'absolute',
                ...(isFirst ? { bottom: -46, top: 'auto' } : { top: -46 }),
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 35,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                backgroundColor: '#1e1535',
                color: '#ffffff',
                borderRadius: 10,
                padding: '4px 8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 11,
                whiteSpace: 'nowrap',
                userSelect: 'none',
            }}
        >
            {/* ── Height ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ color: '#9ca3af', fontSize: 9, fontWeight: 700 }}>H:</span>
                {[
                    { label: 'Auto', val: 0 },
                    { label: '140', val: 140 },
                    { label: '220', val: 220 },
                    { label: '320', val: 320 },
                ].map(h => (
                    <button
                        key={h.label}
                        type="button"
                        onClick={() => setHeight(h.val)}
                        style={{
                            border: 'none',
                            borderRadius: 4,
                            padding: '2px 5px',
                            fontSize: 10,
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: currentMinHeight === h.val ? '#7530fb' : 'rgba(255,255,255,0.10)',
                            color: '#ffffff',
                        }}
                    >
                        {h.label}
                    </button>
                ))}
            </div>

            <div style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.18)' }} />

            {/* ── Gap ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ color: '#9ca3af', fontSize: 9, fontWeight: 700 }}>GAP:</span>
                {[0, 8, 16, 24].map(g => (
                    <button
                        key={g}
                        type="button"
                        onClick={() => setGap(g)}
                        style={{
                            border: 'none',
                            borderRadius: 4,
                            padding: '2px 5px',
                            fontSize: 10,
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: currentGap === g ? '#7530fb' : 'rgba(255,255,255,0.10)',
                            color: '#ffffff',
                        }}
                    >
                        {g}
                    </button>
                ))}
            </div>

            <div style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.18)' }} />

            {/* ── Padding ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ color: '#9ca3af', fontSize: 9, fontWeight: 700 }}>PAD:</span>
                {[0, 8, 16].map(p => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => setPadding(p)}
                        style={{
                            border: 'none',
                            borderRadius: 4,
                            padding: '2px 5px',
                            fontSize: 10,
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: currentPadding === p ? '#7530fb' : 'rgba(255,255,255,0.10)',
                            color: '#ffffff',
                        }}
                    >
                        {p}
                    </button>
                ))}
            </div>

            <div style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.18)' }} />

            {/* ── Align ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {[
                    { id: 'top', Icon: AlignVerticalJustifyStart, title: 'Top' },
                    { id: 'middle', Icon: AlignVerticalJustifyCenter, title: 'Center' },
                    { id: 'bottom', Icon: AlignVerticalJustifyEnd, title: 'Bottom' },
                ].map(a => (
                    <button
                        key={a.id}
                        type="button"
                        title={a.title}
                        onClick={() => onUpdateProps({ colAlign: a.id })}
                        style={{
                            border: 'none',
                            borderRadius: 4,
                            width: 20,
                            height: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            backgroundColor: currentAlign === a.id ? '#7530fb' : 'rgba(255,255,255,0.10)',
                            color: '#ffffff',
                        }}
                    >
                        <a.Icon size={11} />
                    </button>
                ))}
            </div>

            <div style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.18)' }} />

            {/* ── Dividers ── */}
            <button
                type="button"
                onClick={toggleDividers}
                title="Toggle vertical dividers between columns"
                style={{
                    border: 'none',
                    borderRadius: 4,
                    padding: '2px 7px',
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: showDivider ? '#7530fb' : 'rgba(255,255,255,0.10)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                }}
            >
                <Split size={10} />
                Dividers
            </button>

            {/* ── Featured Column ── */}
            <button
                type="button"
                onClick={toggleFeatured}
                title="Highlight center column as featured recommendation"
                style={{
                    border: 'none',
                    borderRadius: 4,
                    padding: '2px 7px',
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: isFeatured ? '#f59e0b' : 'rgba(255,255,255,0.10)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                }}
            >
                <Star size={10} fill={isFeatured ? '#ffffff' : 'none'} />
                Featured
            </button>

            {/* ── Themes ── */}
            <button
                type="button"
                onClick={() => applyTheme('cards')}
                title="Format as clean white cards with border"
                style={{
                    border: 'none',
                    borderRadius: 4,
                    padding: '2px 6px',
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: '#7530fb',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                }}
            >
                <Square size={9} />
                Cards
            </button>

            <button
                type="button"
                onClick={() => applyTheme('dark')}
                title="Format as dark tech obsidian cards"
                style={{
                    border: 'none',
                    borderRadius: 4,
                    padding: '2px 6px',
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: 'rgba(255,255,255,0.10)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                }}
            >
                <Moon size={9} />
                Dark
            </button>

            {/* ── Add Row ── */}
            <button
                type="button"
                onClick={addRow}
                title="Add another row of columns below"
                style={{
                    border: 'none',
                    borderRadius: 4,
                    padding: '2px 6px',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                }}
            >
                <Plus size={10} />
                Row
            </button>

            {/* ── Remove Row (shows whenever you have 2 or more rows) ── */}
            {currentRowCount > 1 && (
                <button
                    type="button"
                    onClick={removeRow}
                    title="Remove last row of columns"
                    style={{
                        border: 'none',
                        borderRadius: 4,
                        padding: '2px 6px',
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: 'pointer',
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                    }}
                >
                    <Minus size={10} />
                    Row
                </button>
            )}

            {/* ── Swap (2-col / 3-col) ── */}
            {!isFour && (
                <button
                    type="button"
                    onClick={swapColumns}
                    title="Swap column order"
                    style={{
                        border: 'none',
                        borderRadius: 4,
                        padding: '2px 6px',
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: 'rgba(255,255,255,0.10)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                    }}
                >
                    <ArrowLeftRight size={10} />
                </button>
            )}
        </div>
    )
}
