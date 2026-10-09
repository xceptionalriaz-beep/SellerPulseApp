'use client'
import React, { useState, useRef, useEffect, ReactNode, JSX } from 'react'
import { createPortal } from 'react-dom'
import { AIButton } from '@/components/ui/Buttons'
import {
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
    Heading2, Heading3, Type, List, ListOrdered, Palette,
    Image, Table, Minus, FileText, Smartphone, Monitor, BookOpen,
} from 'lucide-react'

export const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    success: '#16a34a',
    accent: '#b8fa33',
}

export function sanitiseHtml(html: string): string {
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<link[^>]*>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/javascript:[^"']*/gi, '')
}

export const DESCRIPTION_TEMPLATES = [
    { label: 'Electronics', icon: '💻', html: `<h2>Product Title</h2><p><strong>Brand New</strong> | UK Seller | Fast Dispatch</p><h3>Key Features</h3><ul><li>Feature one</li><li>Feature two</li><li>Feature three</li></ul><h3>Specifications</h3><p>Brand: Your Brand<br>Model: XYZ-100<br>Warranty: 12 months</p><h3>Shipping & Returns</h3><p>Same-day dispatch on orders before 2pm. 30-day returns accepted.</p>` },
    { label: 'Clothing', icon: '👗', html: `<h2>Item Name | Brand | Size</h2><p>Condition: <strong>Brand New with Tags</strong></p><h3>Details</h3><ul><li>Material: 100% Cotton</li><li>Colour: As pictured</li><li>Size: Please refer to measurements below</li></ul><h3>Measurements</h3><p>Chest: cm | Length: cm | Waist: cm</p><h3>Postage</h3><p>Dispatched within 1 business day. Combined postage available.</p>` },
    { label: 'Used Item', icon: '🔄', html: `<h2>Product Name — Used / Pre-Owned</h2><p><strong>Condition:</strong> Used — Good condition. Please see photos for exact condition.</p><h3>What's Included</h3><ul><li>Main unit only</li><li>No original box</li></ul><h3>Faults / Notes</h3><p>No known faults. Tested and fully working.</p><h3>Returns</h3><p>30-day returns accepted. Item must be returned in same condition.</p>` },
    { label: 'General', icon: '📦', html: `<h2>Item Title Here</h2><p>Brief description of your item. Explain what it is and why it's great.</p><h3>Features</h3><ul><li>Key feature 1</li><li>Key feature 2</li><li>Key feature 3</li></ul><h3>Postage & Payment</h3><p>Fast dispatch. Combined postage available. PayPal and all major cards accepted.</p><h3>Returns</h3><p>30-day return policy. Please message us with any questions before purchasing.</p>` },
]

// ── ToolbarBtn ─────────────────────────────────────────────────
export function ToolbarBtn({ onClick, active, title, children }: {
    onClick: () => void; active?: boolean; title?: string; children: ReactNode
}): JSX.Element {
    return (
        <button onMouseDown={e => { e.preventDefault(); onClick() }} title={title}
            className="flex items-center justify-center w-7 h-7 rounded-md transition-all shrink-0"
            style={{ backgroundColor: active ? C.primary : 'transparent', color: active ? '#fff' : C.secondary }}>
            {children}
        </button>
    )
}

export function ToolbarSep(): JSX.Element {
    return <div className="w-px h-5 mx-0.5 shrink-0" style={{ backgroundColor: C.border }} />
}

// ── Portal dropdown wrapper ─────────────────────────────────────
// Renders children directly into document.body so NO ancestor
// overflow/transform/filter can clip or shift the dropdown
function DropdownPortal({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])
    if (!mounted) return null
    return createPortal(children, document.body)
}

// ── useDropdown hook ────────────────────────────────────────────
function useDropdown(dropdownWidth = 260) {
    const [open, setOpen] = useState(false)
    const btnRef = useRef<HTMLButtonElement>(null)
    const [rect, setRect] = useState<DOMRect | null>(null)

    function toggle() {
        if (btnRef.current) {
            const btn = btnRef.current.getBoundingClientRect()
            const toolbar = btnRef.current.closest('[data-toolbar]') as HTMLElement | null
            const toolbarBottom = toolbar ? toolbar.getBoundingClientRect().bottom : btn.bottom
            // Store button center x and toolbar bottom y
            setRect({
                ...btn,
                bottom: toolbarBottom,
                // Store button center in left field for centering calculation
                left: btn.left + btn.width / 2,
            } as DOMRect)
        }
        setOpen(s => !s)
    }

    function close() { setOpen(false) }

    // Center dropdown under button icon, flush against toolbar border
    const pos = rect ? {
        top: rect.bottom,
        // rect.left now holds button center x — subtract half dropdown width to center it
        left: Math.min(
            Math.max(8, rect.left - dropdownWidth / 2),
            window.innerWidth - dropdownWidth - 8
        ),
    } : { top: 0, left: 0 }

    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
        const onScroll = () => close()
        window.addEventListener('keydown', onKey)
        window.addEventListener('scroll', onScroll, true)
        return () => {
            window.removeEventListener('keydown', onKey)
            window.removeEventListener('scroll', onScroll, true)
        }
    }, [open])

    return { open, setOpen, close, toggle, btnRef, pos }
}

// ── Shared dropdown panel styles ───────────────────────────────
const panelStyle = (top: number, left: number, width: number): React.CSSProperties => ({
    position: 'fixed',
    top,
    left,
    width,
    zIndex: 99999,
    backgroundColor: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    boxShadow: '0 8px 32px rgba(30,21,53,0.18)',
})

// ── FontSizeMenu ───────────────────────────────────────────────
export function FontSizeMenu({ onExec }: { onExec: (cmd: string, val?: string) => void }): JSX.Element {
    const { open, close, toggle, btnRef, pos } = useDropdown(160)
    const [custom, setCustom] = useState('')
    const sizes = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '40px']

    return (
        <div className="relative shrink-0">
            <button ref={btnRef} onMouseDown={e => { e.preventDefault(); toggle() }} title="Font Size"
                className="flex items-center justify-center px-1.5 h-7 rounded-md text-[11px] font-semibold shrink-0"
                style={{ backgroundColor: 'transparent', color: C.secondary }}>
                Aa
            </button>
            {open && (
                <DropdownPortal>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 99998 }} onMouseDown={close} />
                    <div style={panelStyle(pos.top, pos.left, 160)}>
                        <div className="p-2">
                            <p className="text-[10px] font-semibold mb-2 px-1" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>FONT SIZE</p>
                            <div className="grid grid-cols-2 gap-1 mb-2">
                                {sizes.map(s => (
                                    <button key={s} onMouseDown={e => { e.preventDefault(); onExec('fontSize', s); close() }}
                                        className="text-[11px] py-1 rounded-lg hover:opacity-80 text-left px-2"
                                        style={{ backgroundColor: C.bg, color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-1 pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
                                <input value={custom} onChange={e => setCustom(e.target.value)}
                                    placeholder="Custom px"
                                    className="flex-1 text-[11px] px-2 py-1 rounded-lg outline-none"
                                    style={{ border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }} />
                                <button onMouseDown={e => { e.preventDefault(); if (custom) { onExec('fontSize', custom.includes('px') ? custom : custom + 'px'); close() } }}
                                    className="px-2 py-1 rounded-lg text-[10px] font-semibold"
                                    style={{ backgroundColor: C.primary, color: '#fff' }}>
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </DropdownPortal>
            )}
        </div>
    )
}

// ── ColorMenu ──────────────────────────────────────────────────
export function ColorMenu({ onExec }: { onExec: (cmd: string, val?: string) => void }): JSX.Element {
    const { open, close, toggle, btnRef, pos } = useDropdown(244)

    const textColors = [
        '#000000', '#111827', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6', '#ffffff',
        '#7530fb', '#6366f1', '#3b82f6', '#0ea5e9', '#1e40af', '#4f46e5', '#7c3aed', '#a855f7',
        '#06b6d4', '#10b981', '#22c55e', '#84cc16', '#065f46', '#047857', '#166534', '#15803d',
        '#eab308', '#f97316', '#ef4444', '#ec4899', '#dc2626', '#9f1239', '#b8fa33', '#1e1535',
    ]
    const highlights = [
        '#fef9c3', '#fde68a', '#dcfce7', '#bbf7d0', '#dbeafe', '#bfdbfe', '#fce7f3', '#fbcfe8',
        '#f3eeff', '#ede9fe', '#fff7ed', '#ffedd5', '#fee2e2', '#fecaca', '#e0f2fe', '#bae6fd',
    ]

    return (
        <div className="relative shrink-0">
            <button ref={btnRef} onMouseDown={e => { e.preventDefault(); toggle() }} title="Text Colour"
                className="flex items-center justify-center w-7 h-7 rounded-md transition-all"
                style={{ backgroundColor: 'transparent', color: C.secondary }}>
                <Palette size={13} />
            </button>
            {open && (
                <DropdownPortal>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 99998 }} onMouseDown={close} />
                    <div style={panelStyle(pos.top, pos.left, 244)}>
                        <div className="p-3">
                            <p className="text-[10px] font-semibold mb-2" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>TEXT COLOUR</p>
                            <div className="grid grid-cols-8 gap-1.5 mb-3">
                                {textColors.map(color => (
                                    <button key={color}
                                        onMouseDown={e => { e.preventDefault(); onExec('foreColor', color); close() }}
                                        className="w-6 h-6 rounded-md hover:scale-110 transition-all"
                                        style={{ backgroundColor: color, border: (color === '#ffffff' || color === '#f3f4f6') ? `1px solid ${C.border}` : 'none' }}
                                        title={color} />
                                ))}
                            </div>
                            <p className="text-[10px] font-semibold mb-2" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>HIGHLIGHT</p>
                            <div className="grid grid-cols-8 gap-1.5 mb-3">
                                {highlights.map(color => (
                                    <button key={color}
                                        onMouseDown={e => { e.preventDefault(); onExec('backColor', color); close() }}
                                        className="w-6 h-6 rounded-md hover:scale-110 transition-all"
                                        style={{ backgroundColor: color, border: `1px solid ${C.border}` }}
                                        title={color} />
                                ))}
                            </div>
                            <div className="flex items-center gap-3 pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
                                <div className="flex items-center gap-1.5 flex-1">
                                    <p className="text-[10px] font-semibold" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>TEXT</p>
                                    <input type="color" defaultValue="#7530fb"
                                        className="w-7 h-7 rounded-lg cursor-pointer p-0.5"
                                        style={{ border: `1px solid ${C.border}` }}
                                        onChange={e => onExec('foreColor', e.target.value)} />
                                </div>
                                <div className="flex items-center gap-1.5 flex-1">
                                    <p className="text-[10px] font-semibold" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>HIGHLIGHT</p>
                                    <input type="color" defaultValue="#fef9c3"
                                        className="w-7 h-7 rounded-lg cursor-pointer p-0.5"
                                        style={{ border: `1px solid ${C.border}` }}
                                        onChange={e => onExec('backColor', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </DropdownPortal>
            )}
        </div>
    )
}

// ── InsertImageMenu ────────────────────────────────────────────
export function InsertImageMenu({ onExec, uploadedPhotos = [], supabaseUpload }: {
    onExec: (cmd: string, val?: string) => void
    uploadedPhotos?: string[]
    supabaseUpload?: (file: File) => Promise<string | null>
}): JSX.Element {
    const { open, close, toggle, btnRef, pos } = useDropdown(300)
    const [tab, setTab] = useState<'photos' | 'url' | 'upload'>('photos')
    const [url, setUrl] = useState('')
    const [urlError, setUrlError] = useState('')
    const [urlPreview, setUrlPreview] = useState('')
    const [width, setWidth] = useState(700)
    const [align, setAlign] = useState<'left' | 'center' | 'right'>('left')
    const [alt, setAlt] = useState('')
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const marginMap: Record<string, string> = { left: '8px 0', center: '8px auto', right: '8px 0 8px auto' }

    function buildImgHtml(src: string) {
        return `<img src="${src}" alt="${alt || 'Product image'}" style="width:${width}px;max-width:100%;height:auto;display:block;margin:${marginMap[align]};" /><p></p>`
    }

    function onUrlChange(val: string) {
        setUrl(val); setUrlError('')
        if (val.startsWith('http://')) { setUrlError('eBay requires HTTPS'); setUrlPreview(''); return }
        if (val.startsWith('https://') && val.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i)) setUrlPreview(val)
        else setUrlPreview('')
    }

    function insertFromUrl() {
        const t = url.trim()
        if (!t) { setUrlError('Enter an image URL'); return }
        if (t.startsWith('http://')) { setUrlError('Use HTTPS not HTTP'); return }
        if (!t.startsWith('https://')) { setUrlError('URL must start with https://'); return }
        onExec('insertHTML', buildImgHtml(t))
        setUrl(''); setUrlPreview(''); close()
    }

    async function handleFileUpload(files: FileList | null) {
        const file = files?.[0]; if (!file) return
        if (!file.type.startsWith('image/')) { setUploadError('Select an image file'); return }
        if (file.size > 12 * 1024 * 1024) { setUploadError('Image must be under 12MB'); return }
        if (!supabaseUpload) { setUploadError('Paste a URL instead'); return }
        setUploading(true); setUploadError('')
        const publicUrl = await supabaseUpload(file)
        setUploading(false)
        if (!publicUrl) { setUploadError('Upload failed'); return }
        onExec('insertHTML', buildImgHtml(publicUrl)); close()
    }

    const activeTab = uploadedPhotos.length === 0 && tab === 'photos' ? 'url' : tab
    const tabs = [...(uploadedPhotos.length > 0 ? [{ id: 'photos', label: 'Photos' }] : []), { id: 'url', label: 'URL' }, { id: 'upload', label: 'Upload' }] as const

    return (
        <div className="relative shrink-0">
            <button ref={btnRef} onMouseDown={e => { e.preventDefault(); toggle() }} title="Insert Image"
                className="flex items-center justify-center w-7 h-7 rounded-md transition-all"
                style={{ backgroundColor: 'transparent', color: C.secondary }}>
                <Image size={13} />
            </button>
            {open && (
                <DropdownPortal>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 99998 }} onMouseDown={close} />
                    <div style={panelStyle(pos.top, pos.left, 300)}>
                        {/* Tabs */}
                        <div className="flex" style={{ borderBottom: `1px solid ${C.border}` }}>
                            {tabs.map(t => (
                                <button key={t.id} onMouseDown={e => { e.preventDefault(); setTab(t.id as typeof tab) }}
                                    className="flex-1 py-2 text-[11px] font-semibold transition-all"
                                    style={{
                                        backgroundColor: activeTab === t.id ? C.surface : C.bg,
                                        color: activeTab === t.id ? C.primary : C.muted,
                                        borderBottom: activeTab === t.id ? `2px solid ${C.primary}` : '2px solid transparent',
                                        fontFamily: 'DM Sans, sans-serif',
                                    }}>
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Photos tab */}
                        {activeTab === 'photos' && uploadedPhotos.length > 0 && (
                            <div className="p-3">
                                <p className="text-[10px] mb-2" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Click a photo to insert</p>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {uploadedPhotos.map((photoUrl, i) => (
                                        <button key={i} onMouseDown={e => { e.preventDefault(); onExec('insertHTML', buildImgHtml(photoUrl)); close() }}
                                            className="relative rounded-lg overflow-hidden hover:opacity-80 transition-all"
                                            style={{ aspectRatio: '1', border: `2px solid ${C.border}` }}>
                                            {i === 0 && <span className="absolute top-0.5 left-0.5 text-[8px] font-bold px-1 rounded z-10" style={{ backgroundColor: C.primary, color: '#fff' }}>MAIN</span>}
                                            <img src={photoUrl} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* URL tab */}
                        {activeTab === 'url' && (
                            <div className="p-3 flex flex-col gap-2">
                                <input value={url} onChange={e => onUrlChange(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full text-[11px] px-2 py-1.5 rounded-lg outline-none"
                                    style={{ border: `1px solid ${urlError ? '#ef4444' : C.border}`, fontFamily: 'DM Sans, sans-serif' }} />
                                {urlError && <p className="text-[10px]" style={{ color: '#ef4444' }}>{urlError}</p>}
                                {urlPreview && <img src={urlPreview} alt="Preview" className="w-full rounded-lg object-cover" style={{ maxHeight: 80, border: `1px solid ${C.border}` }} />}
                            </div>
                        )}

                        {/* Upload tab */}
                        {activeTab === 'upload' && (
                            <div className="p-3">
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e.target.files)} />
                                <button onMouseDown={e => { e.preventDefault(); fileInputRef.current?.click() }}
                                    className="w-full py-3 rounded-xl text-[12px] font-semibold text-center border-2 border-dashed hover:opacity-80"
                                    style={{ borderColor: C.primary, color: C.primary, backgroundColor: C.primaryLight, fontFamily: 'DM Sans, sans-serif' }}>
                                    {uploading ? 'Uploading...' : 'Click to choose image'}
                                </button>
                                {uploadError && <p className="text-[10px] mt-1" style={{ color: '#ef4444' }}>{uploadError}</p>}
                            </div>
                        )}

                        {/* Shared controls */}
                        <div className="px-3 pb-3 flex flex-col gap-2" style={{ borderTop: `1px solid ${C.border}` }}>
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-[10px] font-semibold" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Width: {width}px</span>
                                <div className="flex gap-0.5">
                                    {([
                                        { id: 'left', icon: <AlignLeft size={11} /> },
                                        { id: 'center', icon: <AlignCenter size={11} /> },
                                        { id: 'right', icon: <AlignRight size={11} /> },
                                    ] as const).map(a => (
                                        <button key={a.id} onMouseDown={e => { e.preventDefault(); setAlign(a.id) }}
                                            className="w-6 h-6 rounded flex items-center justify-center"
                                            style={{ backgroundColor: align === a.id ? C.primary : C.bg, color: align === a.id ? '#fff' : C.muted }}>
                                            {a.icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <input type="range" min={100} max={700} value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full" />
                            <input value={alt} onChange={e => setAlt(e.target.value)} placeholder="Alt text (optional)"
                                className="w-full text-[11px] px-2 py-1.5 rounded-lg outline-none"
                                style={{ border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }} />
                            {activeTab === 'url' && (
                                <button onMouseDown={e => { e.preventDefault(); insertFromUrl() }}
                                    className="w-full py-1.5 rounded-lg text-[12px] font-semibold"
                                    style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
                                    Insert Image
                                </button>
                            )}
                        </div>
                    </div>
                </DropdownPortal>
            )}
        </div>
    )
}

// ── InsertTableMenu ────────────────────────────────────────────
export function InsertTableMenu({ onExec }: { onExec: (cmd: string, val?: string) => void }): JSX.Element {
    const { open, close, toggle, btnRef, pos } = useDropdown(240)
    const [rows, setRows] = useState(3)
    const [cols, setCols] = useState(2)
    const [headerBg, setHeaderBg] = useState('#f8f7ff')
    const [headerText, setHeaderText] = useState('#1e1535')

    const presets = [
        { label: 'Clean', headerBg: '#f8f7ff', headerText: '#1e1535' },
        { label: 'Purple', headerBg: '#7530fb', headerText: '#ffffff' },
        { label: 'Dark', headerBg: '#1e1535', headerText: '#ffffff' },
        { label: 'Lime', headerBg: '#b8fa33', headerText: '#1e1535' },
    ]

    function insertTable() {
        const headerRow = `<tr>${Array(cols).fill(0).map((_, i) => `<td style="padding:10px 14px;font-size:13px;font-weight:700;background:${headerBg};color:${headerText};border:1px solid #e5e7eb;font-family:Arial,sans-serif;">Header ${i + 1}</td>`).join('')}</tr>`
        const bodyRows = Array(rows - 1).fill(0).map((_, r) => `<tr>${Array(cols).fill(0).map((_, c) => `<td style="padding:9px 14px;font-size:13px;color:#374151;border:1px solid #e5e7eb;background:${r % 2 === 0 ? '#ffffff' : '#f9fafb'};font-family:Arial,sans-serif;">Cell ${r + 1}-${c + 1}</td>`).join('')}</tr>`).join('\n')
        onExec('insertHTML', `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:16px;">\n${headerRow}\n${bodyRows}\n</table><p></p>`)
        close()
    }

    return (
        <div className="relative shrink-0">
            <button ref={btnRef} onMouseDown={e => { e.preventDefault(); toggle() }} title="Insert Table"
                className="flex items-center justify-center w-7 h-7 rounded-md transition-all"
                style={{ backgroundColor: 'transparent', color: C.secondary }}>
                <Table size={13} />
            </button>
            {open && (
                <DropdownPortal>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 99998 }} onMouseDown={close} />
                    <div style={panelStyle(pos.top, pos.left, 240)}>
                        <div className="p-3">
                            <p className="text-[10px] font-semibold mb-2" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>INSERT TABLE</p>
                            <div className="flex gap-2 mb-3">
                                {(['rows', 'cols'] as const).map(field => (
                                    <div key={field} className="flex-1">
                                        <p className="text-[10px] mb-1" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>{field === 'rows' ? 'Rows' : 'Cols'}</p>
                                        <div className="flex items-center gap-1">
                                            <button onMouseDown={e => { e.preventDefault(); field === 'rows' ? setRows(r => Math.max(2, r - 1)) : setCols(c => Math.max(1, c - 1)) }}
                                                className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold"
                                                style={{ backgroundColor: C.bg, color: C.primary }}>−</button>
                                            <span className="text-[12px] font-bold w-5 text-center" style={{ color: C.body }}>{field === 'rows' ? rows : cols}</span>
                                            <button onMouseDown={e => { e.preventDefault(); field === 'rows' ? setRows(r => Math.min(10, r + 1)) : setCols(c => Math.min(6, c + 1)) }}
                                                className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold"
                                                style={{ backgroundColor: C.bg, color: C.primary }}>+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] font-semibold mb-1.5" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>STYLE</p>
                            <div className="grid grid-cols-4 gap-1 mb-3">
                                {presets.map(p => (
                                    <button key={p.label} onMouseDown={e => { e.preventDefault(); setHeaderBg(p.headerBg); setHeaderText(p.headerText) }}
                                        className="py-1 rounded-lg text-[10px] font-semibold"
                                        style={{ backgroundColor: p.headerBg, color: p.headerText, border: headerBg === p.headerBg ? `2px solid ${C.primary}` : `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                            <button onMouseDown={e => { e.preventDefault(); insertTable() }}
                                className="w-full py-1.5 rounded-lg text-[12px] font-semibold"
                                style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
                                Insert {rows}×{cols} Table
                            </button>
                        </div>
                    </div>
                </DropdownPortal>
            )}
        </div>
    )
}

// ── InsertDividerMenu ──────────────────────────────────────────
export function InsertDividerMenu({ onExec }: { onExec: (cmd: string, val?: string) => void }): JSX.Element {
    const { open, close, toggle, btnRef, pos } = useDropdown(220)
    const [color, setColor] = useState('#d1d5db')
    const [thickness, setThickness] = useState(2)
    const [width, setWidth] = useState(100)

    function insert(style: string) { onExec('insertHTML', `<hr style="${style}" /><p></p>`); close() }

    const styles = [
        { label: 'Simple', style: () => `border:none;border-top:${thickness}px solid ${color};width:${width}%;margin:16px auto;` },
        { label: 'Dashed', style: () => `border:none;border-top:${thickness}px dashed ${color};width:${width}%;margin:16px auto;` },
        { label: 'Dotted', style: () => `border:none;border-top:${thickness}px dotted ${color};width:${width}%;margin:16px auto;` },
        { label: 'Double', style: () => `border:none;border-top:${thickness * 2}px double ${color};width:${width}%;margin:16px auto;` },
        { label: 'Gradient', style: () => `border:none;height:${thickness}px;background:linear-gradient(to right,#7530fb,#b8fa33);width:${width}%;margin:16px auto;` },
        { label: 'Shadow', style: () => `border:none;border-top:${thickness}px solid ${color};box-shadow:0 2px 4px rgba(0,0,0,0.1);width:${width}%;margin:16px auto;` },
    ]

    return (
        <div className="relative shrink-0">
            <button ref={btnRef} onMouseDown={e => { e.preventDefault(); toggle() }} title="Insert Divider"
                className="flex items-center justify-center w-7 h-7 rounded-md transition-all"
                style={{ backgroundColor: 'transparent', color: C.secondary }}>
                <Minus size={13} />
            </button>
            {open && (
                <DropdownPortal>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 99998 }} onMouseDown={close} />
                    <div style={panelStyle(pos.top, pos.left, 220)}>
                        <div className="p-3">
                            <p className="text-[10px] font-semibold mb-2" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>INSERT DIVIDER</p>
                            <div className="grid grid-cols-2 gap-1.5 mb-3">
                                {styles.map(d => (
                                    <button key={d.label} onMouseDown={e => { e.preventDefault(); insert(d.style()) }}
                                        className="py-2 px-2 rounded-lg text-[10px] font-semibold text-left hover:opacity-80"
                                        style={{ backgroundColor: C.bg, color: C.body, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-col gap-2 pt-2 mb-2" style={{ borderTop: `1px solid ${C.border}` }}>
                                {[
                                    { label: 'Thickness', min: 1, max: 8, val: thickness, set: setThickness, suffix: 'px' },
                                    { label: 'Width', min: 20, max: 100, val: width, set: setWidth, suffix: '%' },
                                ].map(r => (
                                    <div key={r.label} className="flex items-center gap-2">
                                        <span className="text-[10px] w-16 shrink-0" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>{r.label}</span>
                                        <input type="range" min={r.min} max={r.max} value={r.val} onChange={e => r.set(Number(e.target.value))} className="flex-1" />
                                        <span className="text-[10px] w-6 text-right" style={{ color: C.body }}>{r.val}{r.suffix}</span>
                                    </div>
                                ))}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] w-16 shrink-0" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Colour</span>
                                    <input type="color" value={color} onChange={e => setColor(e.target.value)}
                                        className="w-8 h-7 rounded-lg cursor-pointer p-0.5" style={{ border: `1px solid ${C.border}` }} />
                                </div>
                            </div>
                            <div className="p-2 rounded-lg mb-2" style={{ backgroundColor: C.bg }}>
                                <div style={{ width: `${width}%`, height: thickness, backgroundColor: color, margin: '0 auto' }} />
                            </div>
                            <button onMouseDown={e => { e.preventDefault(); insert(styles[0].style()) }}
                                className="w-full py-1.5 rounded-lg text-[12px] font-semibold"
                                style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
                                Insert Custom
                            </button>
                        </div>
                    </div>
                </DropdownPortal>
            )}
        </div>
    )
}

// ── Toolbar row ────────────────────────────────────────────────
export interface ToolbarProps {
    activeFormats: Set<string>
    onExec: (cmd: string, val?: string) => void
    descPreview: 'edit' | 'mobile' | 'desktop'
    onPreview: (mode: 'edit' | 'mobile' | 'desktop') => void
    uploadedPhotos?: string[]
    supabaseUpload?: (file: File) => Promise<string | null>
    onLibrary?: () => void
    onAiWrite?: () => void
    aiLoading?: boolean
}

export function EditorToolbar({ activeFormats, onExec, descPreview, onPreview, uploadedPhotos = [], supabaseUpload, onLibrary, onAiWrite, aiLoading }: ToolbarProps): JSX.Element {
    return (
        <div data-toolbar className="flex items-center gap-0.5 px-2 py-1.5 overflow-x-auto"
            style={{ borderBottom: `2px solid #7530fb`, backgroundColor: '#f3eeff', scrollbarWidth: 'none' }}>

            <ToolbarBtn onClick={() => onExec('bold')} active={activeFormats.has('bold')} title="Bold"><Bold size={13} /></ToolbarBtn>
            <ToolbarBtn onClick={() => onExec('italic')} active={activeFormats.has('italic')} title="Italic"><Italic size={13} /></ToolbarBtn>
            <ToolbarBtn onClick={() => onExec('underline')} active={activeFormats.has('underline')} title="Underline"><Underline size={13} /></ToolbarBtn>
            <ToolbarSep />
            <ToolbarBtn onClick={() => onExec('formatBlock', '<h2>')} active={activeFormats.has('h2')} title="Heading 2"><Heading2 size={13} /></ToolbarBtn>
            <ToolbarBtn onClick={() => onExec('formatBlock', '<h3>')} active={activeFormats.has('h3')} title="Heading 3"><Heading3 size={13} /></ToolbarBtn>
            <ToolbarBtn onClick={() => onExec('formatBlock', '<p>')} active={activeFormats.has('p')} title="Paragraph"><Type size={13} /></ToolbarBtn>
            <ToolbarSep />
            <ToolbarBtn onClick={() => onExec('insertUnorderedList')} active={activeFormats.has('ul')} title="Bullet List"><List size={13} /></ToolbarBtn>
            <ToolbarBtn onClick={() => onExec('insertOrderedList')} active={activeFormats.has('ol')} title="Numbered List"><ListOrdered size={13} /></ToolbarBtn>
            <ToolbarSep />
            <ToolbarBtn onClick={() => onExec('justifyLeft')} active={activeFormats.has('left')} title="Align Left"><AlignLeft size={13} /></ToolbarBtn>
            <ToolbarBtn onClick={() => onExec('justifyCenter')} active={activeFormats.has('center')} title="Align Center"><AlignCenter size={13} /></ToolbarBtn>
            <ToolbarBtn onClick={() => onExec('justifyRight')} active={activeFormats.has('right')} title="Align Right"><AlignRight size={13} /></ToolbarBtn>
            <ToolbarSep />
            <FontSizeMenu onExec={onExec} />
            <ColorMenu onExec={onExec} />
            <ToolbarSep />
            <InsertImageMenu onExec={onExec} uploadedPhotos={uploadedPhotos} supabaseUpload={supabaseUpload} />
            <InsertTableMenu onExec={onExec} />
            <InsertDividerMenu onExec={onExec} />
            <div className="flex-1" />

            {/* Right side actions */}
            <div className="flex items-center gap-1 shrink-0">

                {/* AI Write Description button — uses our standard AIButton design */}
                {onAiWrite && (
                    <AIButton
                        onClick={onAiWrite}
                        disabled={aiLoading}
                        loading={aiLoading}>
                        AI Write Description
                    </AIButton>
                )}

                {/* Design Library — BookOpen icon */}
                {onLibrary && (
                    <button onClick={onLibrary} title="Design Library"
                        className="flex items-center justify-center w-7 h-7 rounded-md transition-all hover:opacity-80 shrink-0"
                        style={{ backgroundColor: C.primary, color: '#fff' }}>
                        <BookOpen size={13} />
                    </button>
                )}

                <ToolbarSep />

                {/* Edit / Mobile / Desktop — icons only, no text */}
                <div className="flex items-center rounded-lg overflow-hidden shrink-0" style={{ border: `1px solid ${C.border}` }}>
                    {([
                        { id: 'edit', icon: <FileText size={12} />, title: 'Edit' },
                        { id: 'mobile', icon: <Smartphone size={12} />, title: 'Mobile Preview' },
                        { id: 'desktop', icon: <Monitor size={12} />, title: 'Desktop Preview' },
                    ] as const).map(v => (
                        <button key={v.id} onClick={() => onPreview(v.id)} title={v.title}
                            className="flex items-center justify-center w-7 h-7 transition-all"
                            style={{ backgroundColor: descPreview === v.id ? C.primary : 'transparent', color: descPreview === v.id ? '#fff' : C.muted }}>
                            {v.icon}
                        </button>
                    ))}
                </div>

            </div>
        </div>
    )
}
