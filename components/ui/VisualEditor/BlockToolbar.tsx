'use client'
// components/ui/VisualEditor/BlockToolbar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Editor · Floating Block Toolbar
//
// Appears above a selected block on the canvas when the user clicks on its text.
// Provides formatting, typography, list, alignment, and style tools.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from 'react'
import {
    List, ListOrdered,
    AlignLeft, AlignCenter, AlignRight,
    Grid, Minus,
    Link, Quote, Eraser,
    AlertCircle,
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
    blockType?: string
    blockProps: any
    onChange: (props: any) => void
    onClose?: () => void
    persistent?: boolean
    slotEdit?: { blockId: string; propKey: string; currentHtml: string } | null
    onClearSlot?: (blockId: string, propKey: string) => void
    onReplaceSlot?: () => void
    onFormatSlot?: (blockId: string, propKey: string, format: string, value: string) => void
}

export default function BlockToolbar({
    blockType,
    blockProps = null,
    onChange,
    onClose,
    persistent = false,
    slotEdit = null,
    onClearSlot,
    onReplaceSlot,
    onFormatSlot,
}: BlockToolbarProps) {
    const toolbarRef = useRef<HTMLDivElement>(null)
    const [showLinkModal, setShowLinkModal] = useState(false)
    const [linkInput, setLinkInput] = useState('')
    const [linkError, setLinkError] = useState<string | null>(null)
    const [replaceActive, setReplaceActive] = useState(false)
    const [showRedirectTooltip, setShowRedirectTooltip] = useState(false)
    const safeProps = blockProps ?? {}

    // Detect existing link in slot HTML
    const slotLinkMatch = slotEdit?.currentHtml?.match(/href=\"([^\"]+)\"/)
    const slotHasLink = !!slotLinkMatch
    const slotCurrentLink = slotLinkMatch?.[1] ?? ''

    // For button block — url prop is the link
    const isButtonBlock = safeProps.url !== undefined && safeProps.label !== undefined
    // For nav bar — links array is the link source
    const isNavBlock = Array.isArray((safeProps as any).links)
    // Either block owns its own URLs — redirect user to Attributes tab instead of modal
    const isOwnUrlBlock = isButtonBlock || isNavBlock
    const currentLinkUrl = isButtonBlock
        ? (safeProps.url ?? '')
        : slotEdit
            ? slotCurrentLink
            : (safeProps.linkUrl ?? '')
    const hasLink = isButtonBlock ? !!safeProps.url : slotEdit ? slotHasLink : !!safeProps.linkUrl

    // When a slot is active, derive formatting state from its HTML
    // Uses DOM parser so nested tags (e.g. <strong><em>…</em></strong>) are read correctly
    const slotDerivedProps = useMemo(() => {
        if (!slotEdit?.currentHtml) return {}
        const html = slotEdit.currentHtml
        let bold = false, italic = false, underline = false
        let fontSize = '16px', color: string | undefined, align = 'left'
        try {
            const tmp = document.createElement('div')
            tmp.innerHTML = html
            const allEls = Array.from(tmp.querySelectorAll('*')) as HTMLElement[]
            bold = !!tmp.querySelector('strong, b') ||
                allEls.some(el => /^(bold|[789]\d\d)$/i.test(el.style?.fontWeight ?? ''))
            italic = !!tmp.querySelector('em, i') ||
                allEls.some(el => /italic/i.test(el.style?.fontStyle ?? ''))
            underline = !!tmp.querySelector('u') ||
                allEls.some(el => /underline/i.test(el.style?.textDecoration ?? ''))
            const spanSize = tmp.querySelector('[style*="font-size"]') as HTMLElement | null
            if (spanSize?.style.fontSize) fontSize = spanSize.style.fontSize
            const spanColor = tmp.querySelector('[style*="color"]') as HTMLElement | null
            if (spanColor?.style.color) color = spanColor.style.color
            const divAlign = tmp.querySelector('[style*="text-align"]') as HTMLElement | null
            if (divAlign?.style.textAlign) align = divAlign.style.textAlign
        } catch {
            // SSR fallback — plain regex
            bold = /<(strong|b)[\s>]/i.test(html) || /font-weight:\s*(bold|[789]\d\d)/i.test(html)
            italic = /<(em|i)[\s>]/i.test(html) || /font-style:\s*italic/i.test(html)
            underline = /<u[\s>]/i.test(html) || /text-decoration:\s*underline/i.test(html)
            const fsm = html.match(/font-size:\s*([^;'"]+)/i)
            if (fsm) fontSize = fsm[1].trim()
            const cm = html.match(/(?<![a-z-])color:\s*([^;'"]+)/i)
            if (cm) color = cm[1].trim()
            const am = html.match(/text-align:\s*([^;'"]+)/i)
            if (am) align = am[1].trim()
        }
        // Extract link from slot HTML
        let linkUrl: string | undefined
        try {
            const tmp2 = document.createElement('div')
            tmp2.innerHTML = html
            const anchor = tmp2.querySelector('a[href]') as HTMLAnchorElement | null
            if (anchor) linkUrl = anchor.getAttribute('href') ?? undefined
        } catch {
            const lm = html.match(/href="([^"]+)"/)
            if (lm) linkUrl = lm[1]
        }

        return {
            fontWeight: bold ? 'bold' : '400',
            fontStyle: italic ? 'italic' : 'normal',
            textDecoration: underline ? 'underline' : 'none',
            fontSize,
            align,
            color,
            linkUrl,
        }
    }, [slotEdit?.currentHtml])

    const activeProps = slotEdit ? { ...safeProps, ...slotDerivedProps } : safeProps

    // Reset replace mode when slot changes
    useEffect(() => { setReplaceActive(false) }, [slotEdit?.propKey])

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

    if (blockProps === null && !slotEdit) {
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

    const handleFormatSlotProp = (format: string, value: string) => {
        if (slotEdit) {
            onFormatSlot?.(slotEdit.blockId, slotEdit.propKey, format, value)
        }
    }

    const handleAlign = (align: string) => {
        if (slotEdit) { handleFormatSlotProp('align', align); return }
        onChange({ ...blockProps, align })
    }

    const handleToggleBold = () => {
        if (slotEdit) {
            const current = slotDerivedProps.fontWeight ?? '400'
            handleFormatSlotProp('fontWeight', current === 'bold' ? '400' : 'bold')
            return
        }
        const current = blockProps.fontWeight ?? '400'
        const next = current === 'bold' || current === '700' || current === '800' || current === '900'
            ? '400' : '700'
        onChange({ ...blockProps, fontWeight: next })
    }

    const handleToggleItalic = () => {
        if (slotEdit) {
            const current = slotDerivedProps.fontStyle ?? 'normal'
            handleFormatSlotProp('fontStyle', current === 'italic' ? 'normal' : 'italic')
            return
        }
        const current = blockProps.fontStyle ?? 'normal'
        onChange({ ...blockProps, fontStyle: current === 'italic' ? 'normal' : 'italic' })
    }

    const handleToggleUnderline = () => {
        if (slotEdit) {
            const current = slotDerivedProps.textDecoration ?? 'none'
            handleFormatSlotProp('textDecoration', current === 'underline' ? 'none' : 'underline')
            return
        }
        const current = blockProps.textDecoration ?? 'none'
        onChange({ ...blockProps, textDecoration: current === 'underline' ? 'none' : 'underline' })
    }

    const handleToggleStrikethrough = () => {
        if (slotEdit) {
            const current = slotDerivedProps.textDecoration ?? 'none'
            handleFormatSlotProp('textDecoration', current === 'line-through' ? 'none' : 'line-through')
            return
        }
        const current = blockProps.textDecoration ?? 'none'
        onChange({ ...blockProps, textDecoration: current === 'line-through' ? 'none' : 'line-through' })
    }

    const handleToggleBlockquote = () => {
        if (slotEdit) return
        const current = blockProps.isBlockquote ?? false
        onChange({ ...blockProps, isBlockquote: !current })
    }

    const handleClearFormatting = () => {
        if (slotEdit) {
            // Strip all inline HTML tags from slot content, keep plain text
            const stripped = slotEdit.currentHtml
                .replace(/<\/?(strong|b|em|i|u|s|span|div)[^>]*>/gi, '')
                .replace(/\s+/g, ' ').trim()
            onFormatSlot?.(slotEdit.blockId, slotEdit.propKey, '__html__', stripped)
            return
        }
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
        if (slotEdit) return
        onChange({ ...blockProps, level })
    }

    const handleList = (type: string) => {
        if (slotEdit) return
        onChange({ ...blockProps, listStyle: type })
    }

    const handleTextColor = (color: string) => {
        if (slotEdit) { handleFormatSlotProp('color', color); return }
        onChange({ ...blockProps, color })
    }

    const handleBgColor = (color: string) => {
        if (slotEdit) return
        onChange({ ...blockProps, bgColor: color })
    }

    const handleFontFamily = (fontFamily: string) => {
        if (slotEdit) { handleFormatSlotProp('fontFamily', fontFamily); return }
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
            {slotEdit && (
                <>
                    <span style={{
                        fontSize: 11, fontWeight: 600, color: '#1e1535',
                        padding: '2px 8px', backgroundColor: '#f1f5f9',
                        borderRadius: 4, fontFamily: 'DM Sans, sans-serif',
                        whiteSpace: 'nowrap',
                    }}>
                        {slotEdit.propKey.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()}
                    </span>
                    {slotHasLink && (
                        <span style={{
                            fontSize: 10, fontWeight: 600,
                            color: '#7530fb',
                            padding: '2px 7px',
                            backgroundColor: '#f3eeff',
                            border: '1px solid #ddd6fe',
                            borderRadius: 10,
                            fontFamily: 'DM Sans, sans-serif',
                            whiteSpace: 'nowrap',
                            display: 'flex', alignItems: 'center', gap: 3,
                        }}>
                            🔗 Linked
                        </span>
                    )}
                    <button
                        onClick={() => { setReplaceActive(true); onReplaceSlot?.() }}
                        title="Replace slot content"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 28, height: 28,
                            border: replaceActive ? '1px solid #7530fb' : '1px solid #e2e8f0',
                            borderRadius: 6,
                            backgroundColor: replaceActive ? '#f3eeff' : '#fff',
                            color: replaceActive ? '#7530fb' : '#1e1535',
                            cursor: 'pointer', flexShrink: 0,
                        }}
                    >
                        <RefreshCw size={13} />
                    </button>
                    <button
                        onClick={() => onClearSlot?.(slotEdit.blockId, slotEdit.propKey)}
                        title="Clear slot"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 28, height: 28, border: '1px solid #fecaca',
                            borderRadius: 6, backgroundColor: '#fff8f8',
                            color: '#ef4444', cursor: 'pointer', flexShrink: 0,
                        }}
                    >
                        <Trash2 size={13} />
                    </button>
                    <div style={{ width: 1, height: 20, backgroundColor: '#e2e8f0', flexShrink: 0 }} />
                </>
            )}
            {/* Font Family */}
            <select
                value={activeProps.fontFamily || 'Arial, Helvetica, sans-serif'}
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
                backgroundColor: activeProps.fontWeight === 'bold' || activeProps.fontWeight === '700' || activeProps.fontWeight === '800' || activeProps.fontWeight === '900' ? C.primary : 'transparent',
                color: activeProps.fontWeight === 'bold' || activeProps.fontWeight === '700' || activeProps.fontWeight === '800' || activeProps.fontWeight === '900' ? '#ffffff' : '#1f1d2e',
            }}>B</button>
            <button onClick={handleToggleItalic} title="Italic (I)" style={{
                ...miniBtn,
                fontStyle: 'italic',
                backgroundColor: activeProps.fontStyle === 'italic' ? C.primary : 'transparent',
                color: activeProps.fontStyle === 'italic' ? '#ffffff' : '#1f1d2e',
            }}>I</button>
            <button onClick={handleToggleUnderline} title="Underline (U)" style={{
                ...miniBtn,
                textDecoration: 'underline',
                backgroundColor: activeProps.textDecoration === 'underline' ? C.primary : 'transparent',
                color: activeProps.textDecoration === 'underline' ? '#ffffff' : '#1f1d2e',
            }}>U</button>
            <button onClick={handleToggleStrikethrough} title="Strikethrough" style={{
                ...miniBtn,
                textDecoration: 'line-through',
                backgroundColor: activeProps.textDecoration === 'line-through' ? C.primary : 'transparent',
                color: activeProps.textDecoration === 'line-through' ? '#ffffff' : '#1f1d2e',
            }}>S</button>
            <button onClick={handleToggleBlockquote} title="Blockquote" style={{
                ...miniBtn,
                backgroundColor: safeProps.isBlockquote ? C.primary : 'transparent',
                color: safeProps.isBlockquote ? '#ffffff' : '#1f1d2e',
            }}>
                <Quote size={14} />
            </button>
            <div style={{ position: 'relative', display: 'inline-flex' }}>
                <button onClick={() => {
                    if (isOwnUrlBlock) {
                        setShowRedirectTooltip(true)
                        setTimeout(() => setShowRedirectTooltip(false), 2800)
                    } else {
                        setLinkInput(currentLinkUrl)
                        setLinkError(null)
                        setShowLinkModal(true)
                    }
                }} title={isOwnUrlBlock ? 'Edit URL in Attributes tab' : 'Insert eBay Link'} style={{
                    ...miniBtn,
                    backgroundColor: hasLink ? C.primary : 'transparent',
                    color: hasLink ? '#ffffff' : '#1f1d2e',
                }}>
                    <Link size={14} />
                </button>
                {showRedirectTooltip && (
                    <div style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 8px)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#1f1d2e',
                        color: '#ffffff',
                        fontSize: 12,
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        padding: '6px 12px',
                        borderRadius: 20,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                        zIndex: 9999,
                        pointerEvents: 'none',
                        animation: 'fadeInUp 0.18s ease',
                    }}>
                        {isNavBlock
                            ? '🔗 Edit link URLs in the Attributes tab →'
                            : '🔗 Edit the button URL in the Attributes tab →'}
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0, height: 0,
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: '6px solid #1f1d2e',
                        }} />
                    </div>
                )}
            </div>
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

            <div style={sepStyle} />

            {/* Align */}
            <button onClick={() => handleAlign('left')} title="Align Left" style={{
                ...miniBtn,
                backgroundColor: (activeProps.align ?? 'left') === 'left' ? C.primary : 'transparent',
                color: (activeProps.align ?? 'left') === 'left' ? '#ffffff' : '#1f1d2e',
            }}><AlignLeft size={14} /></button>
            <button onClick={() => handleAlign('center')} title="Align Centre" style={{
                ...miniBtn,
                backgroundColor: activeProps.align === 'center' ? C.primary : 'transparent',
                color: activeProps.align === 'center' ? '#ffffff' : '#1f1d2e',
            }}><AlignCenter size={14} /></button>
            <button onClick={() => handleAlign('right')} title="Align Right" style={{
                ...miniBtn,
                backgroundColor: activeProps.align === 'right' ? C.primary : 'transparent',
                color: activeProps.align === 'right' ? '#ffffff' : '#1f1d2e',
            }}><AlignRight size={14} /></button>

            <div style={sepStyle} />

            {/* Font size */}
            <select
                value={activeProps.fontSize ?? '14px'}
                onChange={e => {
                    if (slotEdit) { handleFormatSlotProp('fontSize', e.target.value); return }
                    onChange({ ...blockProps, fontSize: parseInt(e.target.value) })
                }}
                title="Font size"
                style={{
                    backgroundColor: '#ffffff', color: '#1f1d2e',
                    border: '1px solid #cbd5e1', borderRadius: 4,
                    padding: '3px 4px', fontSize: 11, cursor: 'pointer', width: 52,
                }}
            >
                {['10px', '11px', '12px', '13px', '14px', '15px', '16px', '18px', '20px', '22px', '24px', '28px', '32px', '36px', '48px'].map(s => (
                    <option key={s} value={s}>{s.replace('px', '')}</option>
                ))}
            </select>

            <div style={sepStyle} />

            {/* Text colour */}
            <label title="Text colour" style={{ display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer', padding: '0 4px' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1f1d2e', fontFamily: 'DM Sans, sans-serif' }}>A</span>
                <div style={{ position: 'relative' }}>
                    <input
                        type="color"
                        value={activeProps.color ?? '#1e1535'}
                        onChange={e => handleTextColor(e.target.value)}
                        style={{ width: 18, height: 18, padding: 0, border: 'none', cursor: 'pointer', borderRadius: 3 }}
                        title="Text colour"
                    />
                    <div style={{
                        position: 'absolute', bottom: -2, left: 0, right: 0, height: 3,
                        backgroundColor: activeProps.color ?? '#1e1535', borderRadius: 2,
                    }} />
                </div>
            </label>

            {/* eBay Link Modal Popup */}
            {showLinkModal && (() => {
                // Context label — what gets linked
                const blockContextMap: Record<string, string> = {
                    // Media
                    image: '🖼️ Image — whole image becomes clickable',
                    single_image: '🖼️ Image — whole image becomes clickable',
                    banner: '🖼️ Banner — whole banner becomes clickable',
                    // eBay specific
                    cta_banner: '📣 CTA Banner — whole banner becomes clickable',
                    hero_header: '🏪 Hero Header — whole header becomes clickable',
                    free_shipping_banner: '🚚 Free Shipping Banner — whole banner becomes clickable',
                    bundle_deal: '🎁 Bundle Deal — whole block becomes clickable',
                    limited_time_offer: '⏱️ Limited Time Offer — whole block becomes clickable',
                    dispatch_timer: '⏰ Dispatch Timer — whole block becomes clickable',
                    urgency_bar: '🔥 Urgency Bar — whole bar becomes clickable',
                    // Conversion
                    button_block: '🔘 Button — edit URL in Attributes tab',
                    nav_bar: '🧭 Nav Bar — edit URLs in Attributes tab',
                    // Content
                    heading: '📝 Heading — selected text gets linked',
                    paragraph: '📝 Paragraph — selected text gets linked',
                    product_title: '📝 Product Title — selected text gets linked',
                    product_description: '📝 Description — selected text gets linked',
                    quote_block: '💬 Quote — selected text gets linked',
                    // Layout
                    full_width_section: '📐 Section — whole section becomes clickable',
                    hero_product: '📦 Hero Product — whole block becomes clickable',
                }
                const contextLabel = slotEdit
                    ? `✏️ Text slot — "${slotEdit.propKey.replace(/([A-Z])/g, ' $1').toLowerCase()}"`
                    : blockContextMap[blockType ?? ''] ?? '📦 Block — whole block becomes clickable'

                // Validation helper — called on every keystroke
                const validateUrl = (val: string) => {
                    if (!val.trim()) { setLinkError(null); return }
                    const lower = val.toLowerCase().trim()
                    if (lower.startsWith('#') || lower.startsWith('/')) { setLinkError(null); return }
                    try {
                        const parsed = new URL(lower.startsWith('http') ? lower : `https://${lower}`)
                        if (!parsed.hostname.includes('ebay.')) {
                            setLinkError('Only eBay links are allowed on listings.')
                        } else {
                            setLinkError(null)
                        }
                    } catch {
                        setLinkError('Invalid URL format')
                    }
                }

                const isValid = !linkError && !!linkInput.trim()

                return (
                    <div style={{
                        position: 'absolute',
                        top: 45,
                        left: 0,
                        zIndex: 1000,
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 12,
                        boxShadow: '0 16px 40px rgba(0,0,0,0.14)',
                        width: 340,
                        fontFamily: 'DM Sans, sans-serif',
                        overflow: 'hidden',
                    }}>

                        {/* ── Header ── */}
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px 10px',
                            borderBottom: '1px solid #f1f5f9',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <div style={{
                                    width: 26, height: 26, borderRadius: 7,
                                    backgroundColor: C.primary,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Link size={13} color="#fff" />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1f1d2e' }}>
                                        eBay Link Tool
                                    </p>
                                    <p style={{ margin: 0, fontSize: 10, color: '#94a3b8' }}>
                                        Only eBay URLs allowed
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowLinkModal(false)}
                                style={{
                                    background: '#f8fafc', border: '1px solid #e2e8f0',
                                    borderRadius: 6, width: 24, height: 24,
                                    cursor: 'pointer', fontSize: 14, color: '#64748b',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >×</button>
                        </div>

                        <div style={{ padding: '12px 14px' }}>

                            {/* ── Applying to ── */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '6px 10px', borderRadius: 7,
                                backgroundColor: '#f8f7ff',
                                border: '1px solid #ede9fe',
                                marginBottom: 12,
                            }}>
                                <span style={{ fontSize: 11, color: '#7530fb', fontWeight: 600 }}>
                                    Applying to:
                                </span>
                                <span style={{ fontSize: 11, color: '#4c3d7a' }}>
                                    {contextLabel}
                                </span>
                            </div>

                            {/* ── Quick picks ── */}
                            <p style={{
                                margin: '0 0 7px',
                                fontSize: 10, fontWeight: 700,
                                color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em',
                            }}>
                                Quick pick
                            </p>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' as const }}>
                                {[
                                    { label: '🏪 My Store', url: 'https://www.ebay.com/str/{{SELLER_NAME}}' },
                                    { label: '🔍 My Items', url: 'https://www.ebay.com/sch/{{SELLER_NAME}}' },
                                    { label: '📦 This Item', url: 'https://www.ebay.com/itm/{{ITEM_ID}}' },
                                    { label: '⚓ In-page', url: '#section' },
                                ].map(q => (
                                    <button
                                        key={q.label}
                                        onClick={() => { setLinkInput(q.url); setLinkError(null) }}
                                        style={{
                                            fontSize: 10, padding: '4px 8px',
                                            background: linkInput === q.url ? C.primary : '#f3eeff',
                                            color: linkInput === q.url ? '#fff' : C.primary,
                                            border: `1px solid ${linkInput === q.url ? C.primary : '#ddd6fe'}`,
                                            borderRadius: 20, cursor: 'pointer',
                                            fontWeight: 600, transition: 'all 0.12s',
                                        }}
                                    >
                                        {q.label}
                                    </button>
                                ))}
                            </div>

                            {/* ── URL input ── */}
                            <p style={{
                                margin: '0 0 5px',
                                fontSize: 10, fontWeight: 700,
                                color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em',
                            }}>
                                Or enter URL
                            </p>
                            <div style={{ position: 'relative', marginBottom: 8 }}>
                                <input
                                    autoFocus
                                    type="text"
                                    value={linkInput}
                                    onChange={e => {
                                        setLinkInput(e.target.value)
                                        validateUrl(e.target.value)
                                    }}
                                    placeholder="https://www.ebay.com/str/yourstore"
                                    style={{
                                        width: '100%',
                                        boxSizing: 'border-box' as const,
                                        padding: '8px 36px 8px 10px',
                                        border: `1.5px solid ${linkError ? '#ef4444' : isValid && linkInput ? '#16a34a' : '#e2e8f0'}`,
                                        borderRadius: 8,
                                        fontSize: 12, outline: 'none', color: '#1f1d2e',
                                        transition: 'border-color 0.15s',
                                    }}
                                />
                                {/* Status icon */}
                                <div style={{
                                    position: 'absolute', right: 10, top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: 13,
                                }}>
                                    {linkError ? '🔴' : isValid && linkInput ? '🟢' : ''}
                                </div>
                            </div>

                            {/* Error / success message */}
                            {linkError && (
                                <div style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 5,
                                    padding: '6px 8px', borderRadius: 6,
                                    backgroundColor: '#fef2f2', border: '1px solid #fecaca',
                                    marginBottom: 8,
                                }}>
                                    <AlertCircle size={11} color="#ef4444" style={{ marginTop: 1, flexShrink: 0 }} />
                                    <span style={{ fontSize: 10, color: '#ef4444', lineHeight: 1.4 }}>
                                        {linkError}
                                    </span>
                                </div>
                            )}
                            {isValid && linkInput && !linkError && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    padding: '5px 8px', borderRadius: 6,
                                    backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
                                    marginBottom: 8,
                                }}>
                                    <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 600 }}>
                                        ✓ eBay link — safe to use
                                    </span>
                                </div>
                            )}

                            {/* ── eBay compliance note ── */}
                            <div style={{
                                padding: '6px 8px', borderRadius: 6,
                                backgroundColor: '#fffbeb', border: '1px solid #fde68a',
                                marginBottom: 12,
                            }}>
                                <p style={{ margin: 0, fontSize: 10, color: '#92400e', lineHeight: 1.5 }}>
                                    ⚠️ eBay only allows links to <strong>ebay.com</strong> pages.
                                    External links are automatically removed by eBay.
                                    Use <code style={{ fontSize: 9 }}>{'{{SELLER_NAME}}'}</code> and{' '}
                                    <code style={{ fontSize: 9 }}>{'{{ITEM_ID}}'}</code> as placeholders.
                                </p>
                            </div>

                            {/* ── Actions ── */}
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                {hasLink && (
                                    <button
                                        onClick={() => {
                                            if (slotEdit) {
                                                onFormatSlot?.(slotEdit.blockId, slotEdit.propKey, 'removeLink', '')
                                            } else if (isButtonBlock) {
                                                onChange({ ...safeProps, url: '' })
                                            } else {
                                                const nextProps = { ...safeProps }
                                                delete nextProps.linkUrl
                                                onChange(nextProps)
                                            }
                                            setShowLinkModal(false)
                                        }}
                                        style={{
                                            padding: '7px 10px',
                                            background: '#fff',
                                            color: '#ef4444',
                                            border: '1.5px solid #fca5a5',
                                            borderRadius: 8, fontSize: 11,
                                            fontWeight: 600, cursor: 'pointer',
                                            marginRight: 'auto',
                                        }}
                                    >
                                        🗑 Remove
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowLinkModal(false)}
                                    style={{
                                        padding: '7px 12px',
                                        background: '#f8fafc', color: '#64748b',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 8, fontSize: 11,
                                        fontWeight: 600, cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (!isValid) return
                                        const url = linkInput.trim()
                                        if (slotEdit) {
                                            onFormatSlot?.(slotEdit.blockId, slotEdit.propKey, 'link', url)
                                        } else if (isButtonBlock) {
                                            onChange({ ...safeProps, url })
                                        } else {
                                            onChange({ ...safeProps, linkUrl: url })
                                        }
                                        setShowLinkModal(false)
                                    }}
                                    disabled={!isValid}
                                    style={{
                                        padding: '7px 16px',
                                        background: isValid ? C.primary : '#cbd5e1',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 8, fontSize: 11,
                                        fontWeight: 700,
                                        cursor: isValid ? 'pointer' : 'default',
                                        transition: 'background 0.15s',
                                    }}
                                >
                                    Apply Link →
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })()}
            <style>{`
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateX(-50%) translateY(6px); }
                to   { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `}</style>
        </div>
    )
}
