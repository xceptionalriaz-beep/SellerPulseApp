'use client'
// components/ui/VisualEditor/BlockToolbar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Editor · Floating Block Toolbar
//
// Appears above a selected block on the canvas when the user clicks on its text.
// Provides formatting, typography, list, alignment, and style tools.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react'
import {
    List, ListOrdered,
    AlignLeft, AlignCenter, AlignRight,
    Palette, Grid, Minus,
    Link, Quote, Eraser,
    ExternalLink, AlertCircle, CheckCircle2,
    RefreshCw, Trash2,
} from 'lucide-react'

const C = {
    bg: '#1e1535',
    surface: '#2d1f4e',
    border: '#4a3a7a',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    dark: '#1e1535',
    body: '#f0eef6',
    secondary: '#b8b0d0',
    muted: '#7a7098',
    accent: '#b8fa33',
    danger: '#ef4444',
}

const FONT_OPTIONS = [
    { label: 'Standard', value: 'Arial, Helvetica, sans-serif' },
    { label: 'Modern', value: 'Inter, sans-serif' },
    { label: 'Classic', value: 'Georgia, serif' },
    { label: 'Monospace', value: 'Courier New, monospace' },
]

const miniBtn: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 0,
    border: 'none',
    backgroundColor: 'transparent',
    color: '#1f1d2e',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    transition: 'background-color 0.15s',
}

const sepStyle: React.CSSProperties = {
    width: 1,
    height: 24,
    backgroundColor: '#ede9fe',
    margin: '0 4px',
}

interface BlockToolbarProps {
    blockProps: any
    onChange: (props: any) => void
    onClose?: () => void
    persistent?: boolean
    slotEdit?: { blockId: string; propKey: string } | null
    onClearSlot?: (blockId: string, propKey: string) => void
    onReplaceSlot?: () => void
}

export default function BlockToolbar({
    blockProps = null,
    onChange,
    onClose,
    persistent = false,
    slotEdit = null,
    onClearSlot,
    onReplaceSlot,
}: BlockToolbarProps) {
    const toolbarRef = useRef<HTMLDivElement>(null)
    const [showLinkModal, setShowLinkModal] = useState(false)
    const [linkInput, setLinkInput] = useState('')
    const [linkError, setLinkError] = useState<string | null>(null)
    const safeProps = blockProps ?? {}

    // ── ALL HOOKS MUST COME BEFORE ANY EARLY RETURN ──────────────────────────

    // Close on outside click — disabled in persistent mode
    useEffect(() => {
        if (persistent || !onClose) return
        function handleClickOutside(e: MouseEvent) {
            if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
                onClose!()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [onClose, persistent])

    // Escape key to close — disabled in persistent mode
    useEffect(() => {
        if (persistent || !onClose) return
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose!()
        }
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [onClose, persistent])

    // ─────────────────────────────────────────────────────────────────────────

    if (blockProps === null && slotEdit) {
        const slotLabel = slotEdit.propKey
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, s => s.toUpperCase())
            .trim()
        return (
            <div style={{
                height: 40, display: 'flex', alignItems: 'center',
                padding: '0 12px', backgroundColor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                fontFamily: 'DM Sans, sans-serif', fontSize: 12,
                gap: 8,
            }}>
                <span style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '2px 8px', borderRadius: 4,
                    backgroundColor: '#f3eeff', color: '#7530fb',
                    fontWeight: 700, fontSize: 11,
                }}>
                    <Grid size={11} />
                    {slotLabel}
                </span>
                <div style={{ width: 1, height: 20, backgroundColor: '#e2e8f0' }} />
                <button
                    onClick={onReplaceSlot}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '4px 10px', border: '1px solid #e2e8f0',
                        borderRadius: 6, backgroundColor: '#fff',
                        color: '#1e1535', fontSize: 11, fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                    }}
                >
                    <RefreshCw size={11} /> Replace
                </button>
                <button
                    onClick={() => onClearSlot?.(slotEdit.blockId, slotEdit.propKey)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '4px 10px', border: '1px solid #fecaca',
                        borderRadius: 6, backgroundColor: '#fff8f8',
                        color: '#ef4444', fontSize: 11, fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                    }}
                >
                    <Trash2 size={11} /> Clear Slot
                </button>
                <div style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: 11 }}>
                    Click Replace to swap content
                </div>
            </div>
        )
    }
    if (blockProps === null) {
        return (
            <div style={{
                height: 40, display: 'flex', alignItems: 'center',
                padding: '0 16px', backgroundColor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                fontFamily: 'DM Sans, sans-serif', fontSize: 12,
                color: '#94a3b8', gap: 6,
            }}>
                <Grid size={13} />
                Layout block — click a content slot to see actions
            </div>
        )
    }

    const handleAlign = (align: string) => {
        onChange({ ...blockProps, align })
    }

    const handleToggleBold = () => {
        const current = blockProps.fontWeight ?? '400'
        const next = current === 'bold' || current === '700' || current === '800' || current === '900'
            ? '400' : '700'
        onChange({ ...blockProps, fontWeight: next })
    }

    const handleToggleItalic = () => {
        const current = blockProps.fontStyle ?? 'normal'
        onChange({ ...blockProps, fontStyle: current === 'italic' ? 'normal' : 'italic' })
    }

    const handleToggleUnderline = () => {
        const current = blockProps.textDecoration ?? 'none'
        onChange({ ...blockProps, textDecoration: current === 'underline' ? 'none' : 'underline' })
    }

    const handleToggleStrikethrough = () => {
        const current = blockProps.textDecoration ?? 'none'
        onChange({ ...blockProps, textDecoration: current === 'line-through' ? 'none' : 'line-through' })
    }

    const handleToggleBlockquote = () => {
        const current = blockProps.isBlockquote ?? false
        onChange({ ...blockProps, isBlockquote: !current })
    }

    const handleClearFormatting = () => {
        onChange({
            ...blockProps,
            fontWeight: '400',
            fontStyle: 'normal',
            textDecoration: 'none',
            isBlockquote: false,
            color: '#1e1535',
            fontFamily: 'Arial, Helvetica, sans-serif'
        })
    }

    const handleHeading = (level: string) => {
        onChange({ ...blockProps, level })
    }

    const handleList = (type: string) => {
        onChange({ ...blockProps, listStyle: type })
    }

    const handleTextColor = (color: string) => {
        onChange({ ...blockProps, color })
    }

    const handleBgColor = (color: string) => {
        onChange({ ...blockProps, bgColor: color })
    }

    const handleFontFamily = (fontFamily: string) => {
        onChange({ ...blockProps, fontFamily })
    }

    return (
        <div
            ref={toolbarRef}
            data-toolbar
            style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                padding: '4px 8px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 0,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                whiteSpace: 'nowrap',
                fontFamily: 'DM Sans, sans-serif',
            }}
        >
            {/* Font Family */}
            <select
                value={safeProps.fontFamily || 'Arial, Helvetica, sans-serif'}
                onChange={(e) => handleFontFamily(e.target.value)}
                style={{
                    backgroundColor: '#ffffff',
                    color: '#1f1d2e',
                    border: '1px solid #cbd5e1',
                    borderRadius: 0,
                    padding: '4px 8px',
                    fontSize: 12,
                    cursor: 'pointer',
                    marginRight: 4,
                }}
            >
                {FONT_OPTIONS.map(font => (
                    <option key={font.value} value={font.value}>{font.label}</option>
                ))}
            </select>
            <div style={sepStyle} />

            {/* Formatting */}
            <button onClick={handleToggleBold} title="Bold (B)" style={{
                ...miniBtn,
                fontWeight: 'bold',
                backgroundColor: safeProps.fontWeight === '700' || safeProps.fontWeight === '800' || safeProps.fontWeight === '900' ? C.primary : 'transparent',
                color: safeProps.fontWeight === '700' || safeProps.fontWeight === '800' || safeProps.fontWeight === '900' ? '#ffffff' : '#1f1d2e',
            }}>B</button>
            <button onClick={handleToggleItalic} title="Italic (I)" style={{
                ...miniBtn,
                fontStyle: 'italic',
                backgroundColor: safeProps.fontStyle === 'italic' ? C.primary : 'transparent',
                color: safeProps.fontStyle === 'italic' ? '#ffffff' : '#1f1d2e',
            }}>I</button>
            <button onClick={handleToggleUnderline} title="Underline (U)" style={{
                ...miniBtn,
                textDecoration: 'underline',
                backgroundColor: safeProps.textDecoration === 'underline' ? C.primary : 'transparent',
                color: safeProps.textDecoration === 'underline' ? '#ffffff' : '#1f1d2e',
            }}>U</button>
            <button onClick={handleToggleStrikethrough} title="Strikethrough" style={{
                ...miniBtn,
                textDecoration: 'line-through',
                backgroundColor: safeProps.textDecoration === 'line-through' ? C.primary : 'transparent',
                color: safeProps.textDecoration === 'line-through' ? '#ffffff' : '#1f1d2e',
            }}>S</button>
            <button onClick={handleToggleBlockquote} title="Blockquote" style={{
                ...miniBtn,
                backgroundColor: safeProps.isBlockquote ? C.primary : 'transparent',
                color: safeProps.isBlockquote ? '#ffffff' : '#1f1d2e',
            }}>
                <Quote size={14} />
            </button>
            <button onClick={() => {
                setLinkInput(safeProps.linkUrl ?? '')
                setLinkError(null)
                setShowLinkModal(true)
            }} title="Insert eBay Link" style={{
                ...miniBtn,
                backgroundColor: safeProps.linkUrl ? C.primary : 'transparent',
                color: safeProps.linkUrl ? '#ffffff' : '#1f1d2e',
            }}>
                <Link size={14} />
            </button>
            <button onClick={handleClearFormatting} title="Clear Formatting" style={miniBtn}>
                <Eraser size={14} />
            </button>

            <div style={sepStyle} />

            {/* Headings */}
            <button onClick={() => handleHeading('h2')} title="Heading 2 (H2)" style={{
                ...miniBtn,
                fontSize: 11,
                fontWeight: 'bold',
                backgroundColor: safeProps.level === 'h2' ? C.primary : 'transparent',
                color: safeProps.level === 'h2' ? '#ffffff' : '#1f1d2e',
            }}>H2</button>
            <button onClick={() => handleHeading('h3')} title="Heading 3 (H3)" style={{
                ...miniBtn,
                fontSize: 10,
                fontWeight: 'bold',
                backgroundColor: safeProps.level === 'h3' ? C.primary : 'transparent',
                color: safeProps.level === 'h3' ? '#ffffff' : '#1f1d2e',
            }}>H3</button>
            <button onClick={() => handleHeading('p')} title="Paragraph (T)" style={{
                ...miniBtn,
                fontSize: 11,
                fontWeight: 'normal',
                backgroundColor: safeProps.level === 'p' ? C.primary : 'transparent',
                color: safeProps.level === 'p' ? '#ffffff' : '#1f1d2e',
            }}>T</button>

            <div style={sepStyle} />

            {/* Lists */}
            <button onClick={() => handleList('bullet')} title="Bullet List" style={{
                ...miniBtn,
                backgroundColor: safeProps.listStyle === 'bullet' ? C.primary : 'transparent',
                color: safeProps.listStyle === 'bullet' ? '#ffffff' : '#1f1d2e',
            }}><List size={14} /></button>
            <button onClick={() => handleList('numbered')} title="Numbered List" style={{
                ...miniBtn,
                backgroundColor: safeProps.listStyle === 'numbered' ? C.primary : 'transparent',
                color: safeProps.listStyle === 'numbered' ? '#ffffff' : '#1f1d2e',
            }}><ListOrdered size={14} /></button>

            <div style={sepStyle} />

            {/* Alignment */}
            <button onClick={() => handleAlign('left')} title="Align Left" style={{
                ...miniBtn,
                backgroundColor: safeProps.align === 'left' ? C.primary : 'transparent',
                color: safeProps.align === 'left' ? '#ffffff' : '#1f1d2e',
            }}><AlignLeft size={14} /></button>
            <button onClick={() => handleAlign('center')} title="Align Center" style={{
                ...miniBtn,
                backgroundColor: safeProps.align === 'center' ? C.primary : 'transparent',
                color: safeProps.align === 'center' ? '#ffffff' : '#1f1d2e',
            }}><AlignCenter size={14} /></button>
            <button onClick={() => handleAlign('right')} title="Align Right" style={{
                ...miniBtn,
                backgroundColor: safeProps.align === 'right' ? C.primary : 'transparent',
                color: safeProps.align === 'right' ? '#ffffff' : '#1f1d2e',
            }}><AlignRight size={14} /></button>

            <div style={sepStyle} />

            {/* Style */}
            <button onClick={() => handleTextColor('#7530fb')} title="Text Color" style={miniBtn}>
                <Palette size={14} />
            </button>
            <button onClick={() => handleBgColor('#7530fb')} title="Background Color" style={miniBtn}>
                <Palette size={14} />
            </button>

            <div style={sepStyle} />

            {/* Structure */}
            <button title="Table" style={miniBtn}><Grid size={14} /></button>
            <button title="Divider" style={miniBtn}><Minus size={14} /></button>

            {/* eBay Link Modal Popup */}
            {showLinkModal && (
                <div style={{
                    position: 'absolute',
                    top: 45,
                    left: 0,
                    zIndex: 1000,
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    padding: 14,
                    width: 320,
                    fontFamily: 'DM Sans, sans-serif',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1f1d2e', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Link size={14} style={{ color: C.primary }} /> eBay Safe Link Tool
                        </span>
                        <button onClick={() => setShowLinkModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#64748b' }}>×</button>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                        <input
                            type="text"
                            value={linkInput}
                            onChange={(e) => {
                                const val = e.target.value
                                setLinkInput(val)
                                if (!val.trim()) {
                                    setLinkError(null)
                                    return
                                }
                                const lower = val.toLowerCase().trim()
                                if (lower.startsWith('#') || lower.startsWith('/')) {
                                    setLinkError(null)
                                    return
                                }
                                try {
                                    const parsed = new URL(lower.startsWith('http') ? lower : `https://${lower}`)
                                    const host = parsed.hostname
                                    if (!host.includes('ebay.')) {
                                        setLinkError('⚠️ eBay Compliance Error: Only eBay store/item links are permitted.')
                                    } else {
                                        setLinkError(null)
                                    }
                                } catch {
                                    setLinkError('Invalid URL format')
                                }
                            }}
                            placeholder="https://www.ebay.com/str/yourstore"
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                padding: '6px 10px',
                                border: `1px solid ${linkError ? '#ef4444' : '#cbd5e1'}`,
                                borderRadius: 6,
                                fontSize: 12,
                                outline: 'none',
                                color: '#1f1d2e',
                            }}
                        />
                        {linkError && (
                            <div style={{ fontSize: 10, color: '#ef4444', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <AlertCircle size={11} /> {linkError}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' as const }}>
                        <button
                            onClick={() => {
                                setLinkInput('https://www.ebay.com/str/')
                                setLinkError(null)
                            }}
                            style={{ fontSize: 10, padding: '3px 6px', background: '#f3eeff', color: C.primary, border: `1px solid #ddd6fe`, borderRadius: 4, cursor: 'pointer' }}
                        >
                            + My eBay Store
                        </button>
                        <button
                            onClick={() => {
                                setLinkInput('https://www.ebay.com/sch/')
                                setLinkError(null)
                            }}
                            style={{ fontSize: 10, padding: '3px 6px', background: '#f3eeff', color: C.primary, border: `1px solid #ddd6fe`, borderRadius: 4, cursor: 'pointer' }}
                        >
                            + Other Items
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        {safeProps.linkUrl && (
                            <button
                                onClick={() => {
                                    const nextProps = { ...safeProps }
                                    delete nextProps.linkUrl
                                    onChange(nextProps)
                                    setShowLinkModal(false)
                                }}
                                style={{
                                    padding: '5px 10px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', marginRight: 'auto'
                                }}
                            >
                                Remove Link
                            </button>
                        )}
                        <button
                            onClick={() => setShowLinkModal(false)}
                            style={{ padding: '5px 10px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (linkError || !linkInput.trim()) return
                                onChange({ ...safeProps, linkUrl: linkInput.trim() })
                                setShowLinkModal(false)
                            }}
                            disabled={!!linkError || !linkInput.trim()}
                            style={{
                                padding: '5px 12px',
                                background: linkError || !linkInput.trim() ? '#cbd5e1' : C.primary,
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: linkError || !linkInput.trim() ? 'default' : 'pointer',
                            }}
                        >
                            Apply Link
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
