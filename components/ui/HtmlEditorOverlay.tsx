'use client'
// components/ui/HtmlEditorOverlay.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — HTML Template Editor as a full-screen overlay
// Slides up over the dashboard — sub-sidebar stays underneath
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react'
import {
    ChevronLeft, Save, X,
    Search, Plus, Image, Link2, ChevronDown,
    Monitor, Tablet, Smartphone,
    Maximize2, CheckCircle2,
} from 'lucide-react'
import ImageAssets from '@/components/ui/ImageAssets'
import ImportUrl from '@/components/ui/ImportUrl'

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    borderInput: '#e5e0f5',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    accent: '#b8fa33',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
    success: '#16a34a',
    editorBg: '#0f0e1a',
    editorGutter: '#13111f',
    editorBorder: '#3d3858',
}

// ── Placeholder groups ────────────────────────────────────────────────────
interface Placeholder { label: string; value: string; example: string }
interface PlaceholderGroup { group: string; items: Placeholder[] }

const PLACEHOLDER_GROUPS: PlaceholderGroup[] = [
    {
        group: 'Product Info',
        items: [
            { label: 'Product Title', value: '{{PRODUCT_TITLE}}', example: 'Premium Dog Clippers Pro' },
            { label: 'Item Description', value: '{{ITEM_DESCRIPTION}}', example: 'High-quality grooming kit...' },
            { label: 'Item Condition', value: '{{ITEM_CONDITION}}', example: 'Brand New' },
            { label: 'Brand', value: '{{BRAND}}', example: 'Wahl' },
            { label: 'Model', value: '{{MODEL}}', example: 'KM10' },
            { label: 'MPN', value: '{{MPN}}', example: '9788-100' },
            { label: 'EAN / Barcode', value: '{{EAN}}', example: '0043917978819' },
            { label: 'Item Category', value: '{{ITEM_CATEGORY}}', example: 'Pet Supplies' },
            { label: 'Item SKU', value: '{{ITEM_SKU}}', example: 'SKU-12345' },
            { label: 'Warranty', value: '{{WARRANTY}}', example: '2 Year Manufacturer Warranty' },
            { label: 'Weight', value: '{{WEIGHT}}', example: '1.2 kg' },
            { label: 'Dimensions', value: '{{DIMENSIONS}}', example: '30 x 15 x 10 cm' },
        ],
    },
    {
        group: 'Pricing',
        items: [
            { label: 'Item Price', value: '{{ITEM_PRICE}}', example: '£29.99' },
            { label: 'Original Price', value: '{{ORIGINAL_PRICE}}', example: '£49.99' },
            { label: 'Discount %', value: '{{DISCOUNT_PERCENT}}', example: '40%' },
        ],
    },
    {
        group: 'Media',
        items: [
            { label: 'Main Image URL', value: '{{MAIN_IMAGE_URL}}', example: 'https://i.ebayimg.com/...' },
            { label: 'Image 2 URL', value: '{{IMAGE_2_URL}}', example: 'https://i.ebayimg.com/...' },
            { label: 'Image 3 URL', value: '{{IMAGE_3_URL}}', example: 'https://i.ebayimg.com/...' },
        ],
    },
    {
        group: 'Shipping & Returns',
        items: [
            { label: 'Shipping Time', value: '{{SHIPPING_TIME}}', example: 'Same Day Dispatch' },
            { label: 'Return Policy', value: '{{RETURN_POLICY}}', example: '30-Day Free Returns' },
            { label: 'Seller Name', value: '{{SELLER_NAME}}', example: 'UKTopDeals' },
        ],
    },
]

// ── Devices ────────────────────────────────────────────────────────────────
const DEVICES = [
    { id: 'desktop', icon: Monitor, label: 'Desktop' },
    { id: 'tablet', icon: Tablet, label: 'Tablet' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile' },
] as const
type DeviceId = typeof DEVICES[number]['id']

// ── Default HTML ───────────────────────────────────────────────────────────
const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .container { max-width: 800px; margin: auto; border: 1px solid #ccc; padding: 20px; }
    h1 { color: #333; }
    .price { font-size: 24px; font-weight: bold; color: #e53e3e; }
  </style>
</head>
<body>
  <div class="container">
    <h1>{{PRODUCT_TITLE}}</h1>
    <!-- Main Product Image -->
    <img src="{{MAIN_IMAGE_URL}}" alt="Product Image" style="max-width: 100%; height: auto;">
    <p class="price">\${{ITEM_PRICE}}</p>
    <div class="description">
      {{ITEM_DESCRIPTION}}
    </div>
  </div>
</body>
</html>`

// ── Editor line height constant ────────────────────────────────────────────
const LINE_H = 21 // px — must match textarea lineHeight

// ── Inner component ────────────────────────────────────────────────────────

// ── Props ──────────────────────────────────────────────────────────────────
interface HtmlEditorOverlayProps {
    open: boolean
    onClose: () => void
    templateName?: string
    initialHtml?: string
    onSave?: (html: string, name: string) => void
}

// ── Component ──────────────────────────────────────────────────────────────
export default function HtmlEditorOverlay({
    open,
    onClose,
    templateName = 'Untitled Template',
    initialHtml,
    onSave,
}: HtmlEditorOverlayProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        if (open) setMounted(true)
    }, [open])

    if (!mounted && !open) return null

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col"
            style={{
                transform: open ? 'translateY(0)' : 'translateY(100%)',
                transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
                backgroundColor: C.editorBg,
            }}
        >
            <HtmlEditorContent
                templateName={templateName}
                initialHtml={initialHtml}
                onClose={onClose}
                onSave={onSave}
            />
        </div>
    )
}

function HtmlEditorContent({
    templateName,
    initialHtml,
    onClose,
    onSave,
}: {
    templateName: string
    initialHtml?: string
    onClose: () => void
    onSave?: (html: string, name: string) => void
}) {
    const [html, setHtml] = useState(initialHtml || DEFAULT_HTML)
    const [name, setName] = useState(templateName)
    const [device, setDevice] = useState<DeviceId>('desktop')
    const [ebayId, setEbayId] = useState('')
    const [phOpen, setPhOpen] = useState(false)
    const [findVal, setFindVal] = useState('')
    const [replaceVal, setReplaceVal] = useState('')
    const [matchCount, setMatchCount] = useState<number | null>(null)
    const [replaceCount, setReplaceCount] = useState<number | null>(null)
    const [caseSensitive, setCaseSensitive] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [showAssets, setShowAssets] = useState(false)
    const [showImport, setShowImport] = useState(false)
    const [fullscreen, setFullscreen] = useState(false)
    const [testLoading, setTestLoading] = useState(false)
    const [previewHtml, setPreviewHtml] = useState('')

    // Insert image tag at saved cursor
    function insertImage(_url: string, htmlTag: string) {
        const el = textareaRef.current
        if (!el) return
        const pos = savedCursor.current
        const next = html.slice(0, pos) + htmlTag + html.slice(pos)
        setHtml(next)
        setTimeout(() => {
            el.focus()
            el.setSelectionRange(pos + htmlTag.length, pos + htmlTag.length)
        }, 0)
    }

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const gutterRef = useRef<HTMLDivElement>(null)
    const savedCursor = useRef<number>(0)     // saved cursor before dropdown opens
    const [phSearch, setPhSearch] = useState('')
    const [customPh, setCustomPh] = useState('')

    const lines = html.split('\n')
    const lineCount = lines.length

    // Save cursor before dropdown steals focus
    function saveCursor() {
        const el = textareaRef.current
        if (el) savedCursor.current = el.selectionStart
    }

    // Insert placeholder at saved cursor position
    function insertPlaceholder(val: string) {
        const el = textareaRef.current
        if (!el) return
        const pos = savedCursor.current
        const next = html.slice(0, pos) + val + html.slice(pos)
        setHtml(next)
        setPhOpen(false)
        setPhSearch('')
        setTimeout(() => {
            el.focus()
            el.setSelectionRange(pos + val.length, pos + val.length)
        }, 0)
    }

    // Insert custom placeholder
    function insertCustom() {
        if (!customPh.trim()) return
        const val = '{{' + customPh.trim().toUpperCase().replace(/\s+/g, '_') + '}}'
        insertPlaceholder(val)
        setCustomPh('')
    }

    // Count matches in current html
    function countMatches(find: string, text: string, cs: boolean): number {
        if (!find) return 0
        const flags = cs ? 'g' : 'gi'
        const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return (text.match(new RegExp(escaped, flags)) ?? []).length
    }

    // Update match count live as user types
    function onFindChange(val: string) {
        setFindVal(val)
        setReplaceCount(null)
        setMatchCount(val ? countMatches(val, html, caseSensitive) : null)
    }

    function applyReplace() {
        if (!findVal) return
        const escaped = findVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const flags = caseSensitive ? 'g' : 'gi'
        const regex = new RegExp(escaped, flags)
        const count = (html.match(regex) ?? []).length
        if (count === 0) {
            setReplaceCount(0)
            return
        }
        setHtml(prev => prev.replace(regex, replaceVal))
        setReplaceCount(count)
        setMatchCount(0)
        // Clear after 3 seconds
        setTimeout(() => {
            setFindVal('')
            setReplaceVal('')
            setReplaceCount(null)
            setMatchCount(null)
        }, 3000)
    }

    async function saveDraft() {
        setSaving(true)
        await new Promise(r => setTimeout(r, 400))
        setSaving(false)
        setSaved(true)
        if (onSave) onSave(html, name)
        setTimeout(() => setSaved(false), 2000)
    }

    async function saveAndClose() {
        await saveDraft()
        onClose()
    }

    // Test preview with real eBay data
    async function testPreview() {
        if (!ebayId.trim()) return
        setTestLoading(true)
        try {
            const res = await fetch(`/api/ebay/import-listing?item=${encodeURIComponent(ebayId.trim())}`)
            const data = await res.json()
            if (!res.ok || !data.item) {
                alert(data.error || 'Could not fetch listing')
                return
            }
            const item = data.item
            const currency = item.currency === 'GBP' ? '£' : item.currency === 'EUR' ? '€' : '$'
            // Replace placeholders with real values for preview
            let preview = html
                .replace(/\{\{PRODUCT_TITLE\}\}/g, item.title ?? '')
                .replace(/\{\{ITEM_PRICE\}\}/g, `${currency}${parseFloat(item.price).toFixed(2)}`)
                .replace(/\{\{MAIN_IMAGE_URL\}\}/g, item.imageUrl ?? '')
                .replace(/\{\{ITEM_DESCRIPTION\}\}/g, item.title ?? '')
                .replace(/\{\{ITEM_CONDITION\}\}/g, item.condition ?? '')
                .replace(/\{\{SELLER_NAME\}\}/g, item.seller ?? '')
                .replace(/\{\{ITEM_CATEGORY\}\}/g, item.categoryName ?? '')
                .replace(/\{\{ITEM_SKU\}\}/g, item.itemId ?? '')
                .replace(/\{\{BRAND\}\}/g, item.brand ?? '')
                .replace(/\{\{MPN\}\}/g, item.mpn ?? '')
                .replace(/\{\{EAN\}\}/g, item.ean ?? '')
            setPreviewHtml(preview)
        } catch {
            alert('Network error fetching listing')
        } finally {
            setTestLoading(false)
        }
    }

    const iframeWidth =
        device === 'desktop' ? '100%' :
            device === 'tablet' ? '768px' : '390px'

    return (
        <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden', backgroundColor: C.editorBg }}>

            {/* ── Top bar ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 shrink-0"
                style={{ height: 52, backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, gap: 12 }}>

                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-1 text-[12px] font-semibold shrink-0 hover:opacity-70 transition-all"
                        style={{ color: C.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                        <ChevronLeft size={14} /> Template Library
                    </button>
                    <div style={{ width: 1, height: 20, backgroundColor: C.border }} />
                    <h1 className="text-[15px] font-bold truncate"
                        style={{ color: C.primary, fontFamily: 'Syne, sans-serif' }}>
                        HTML Template Editor Studio
                    </h1>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button onClick={saveDraft}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:opacity-80"
                        style={{ backgroundColor: C.dark, color: '#ffffff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                        <Save size={13} />
                        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Draft'}
                    </button>
                    <button onClick={saveAndClose}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all hover:opacity-90"
                        style={{ backgroundColor: C.primary, color: '#ffffff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                        <X size={13} /> Save & Close
                    </button>
                </div>
            </div>

            {/* ── Second bar ───────────────────────────────────────────── */}
            <div className="flex items-center gap-2 px-4 shrink-0"
                style={{ height: 52, backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>

                {/* Template name */}
                <input value={name} onChange={e => setName(e.target.value)}
                    className="text-[13px] px-3 py-1.5 rounded-lg outline-none transition-all shrink-0"
                    style={{ border: `1px solid ${C.borderInput}`, backgroundColor: C.bg, color: C.body, fontFamily: 'DM Sans, sans-serif', width: 180 }}
                    onFocus={e => e.currentTarget.style.borderColor = C.primary}
                    onBlur={e => e.currentTarget.style.borderColor = C.borderInput} />

                {/* Divider */}
                <div style={{ width: 1, height: 20, backgroundColor: C.border, flexShrink: 0 }} />

                {/* Search */}
                <Search size={13} style={{ color: C.muted, flexShrink: 0 }} />
                <div className="relative shrink-0">
                    <input
                        value={findVal}
                        onChange={e => onFindChange(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyReplace()}
                        placeholder="Search code..."
                        className="text-[12px] px-3 py-1.5 rounded-lg outline-none pr-12"
                        style={{ border: `1px solid ${C.borderInput}`, backgroundColor: C.bg, color: C.body, fontFamily: 'DM Sans, sans-serif', width: 150 }}
                        onFocus={e => e.currentTarget.style.borderColor = C.primary}
                        onBlur={e => e.currentTarget.style.borderColor = C.borderInput}
                    />
                    {matchCount !== null && findVal && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: matchCount > 0 ? C.primaryLight : C.dangerBg, color: matchCount > 0 ? C.primary : C.danger, fontFamily: 'DM Sans, sans-serif' }}>
                            {matchCount}
                        </span>
                    )}
                </div>

                {/* Replace */}
                <input
                    value={replaceVal}
                    onChange={e => setReplaceVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyReplace()}
                    placeholder="Replace with..."
                    className="text-[12px] px-3 py-1.5 rounded-lg outline-none shrink-0"
                    style={{ border: `1px solid ${C.borderInput}`, backgroundColor: C.bg, color: C.body, fontFamily: 'DM Sans, sans-serif', width: 140 }}
                    onFocus={e => e.currentTarget.style.borderColor = C.primary}
                    onBlur={e => e.currentTarget.style.borderColor = C.borderInput}
                />

                {/* Case sensitive */}
                <button
                    onClick={() => { setCaseSensitive(v => !v); setMatchCount(findVal ? countMatches(findVal, html, !caseSensitive) : null) }}
                    title="Case sensitive"
                    className="px-2 py-1 rounded-lg text-[11px] font-bold transition-all hover:opacity-80 shrink-0"
                    style={{ backgroundColor: caseSensitive ? C.primaryLight : C.bg, color: caseSensitive ? C.primary : C.muted, border: `1px solid ${caseSensitive ? C.primary : C.border}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    Aa
                </button>

                {/* Apply */}
                <button onClick={applyReplace}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:opacity-80 shrink-0"
                    style={{ backgroundColor: C.primary, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    Apply
                </button>

                {/* Feedback */}
                {replaceCount !== null && (
                    <span className="text-[11px] font-semibold shrink-0"
                        style={{ color: replaceCount > 0 ? C.success : C.danger, fontFamily: 'DM Sans, sans-serif' }}>
                        {replaceCount > 0 ? `✓ ${replaceCount} replaced` : '✗ No match'}
                    </span>
                )}

                {/* Clear */}
                {(findVal || replaceVal) && (
                    <button onClick={() => { setFindVal(''); setReplaceVal(''); setMatchCount(null); setReplaceCount(null) }}
                        className="w-5 h-5 flex items-center justify-center rounded-full hover:opacity-70 transition-all shrink-0"
                        style={{ backgroundColor: C.muted, border: 'none', cursor: 'pointer' }}>
                        <X size={10} style={{ color: '#fff' }} />
                    </button>
                )}

                <div style={{ flex: 1 }} />

                {/* Placeholder dropdown */}
                <div className="relative shrink-0">
                    <button
                        onClick={() => { saveCursor(); setPhOpen(v => !v) }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:opacity-80"
                        style={{ backgroundColor: C.primaryLight, color: C.primary, border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                        <Plus size={13} /> Insert Dynamic Placeholder <ChevronDown size={12} />
                    </button>
                    {phOpen && (
                        <div className="absolute top-full mt-1 right-0 rounded-xl shadow-xl z-30 flex flex-col"
                            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, width: 320, maxHeight: 420 }}>

                            {/* Search */}
                            <div className="px-3 pt-3 pb-2 shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
                                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                                    style={{ backgroundColor: C.bg, border: `1px solid ${C.borderInput}` }}>
                                    <Search size={12} style={{ color: C.muted, flexShrink: 0 }} />
                                    <input
                                        autoFocus
                                        value={phSearch}
                                        onChange={e => setPhSearch(e.target.value)}
                                        placeholder="Search placeholders..."
                                        className="flex-1 text-[12px] outline-none bg-transparent"
                                        style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}
                                    />
                                </div>
                            </div>

                            {/* Groups + items */}
                            <div className="overflow-y-auto flex-1">
                                {PLACEHOLDER_GROUPS.map(group => {
                                    const filtered = group.items.filter(item =>
                                        !phSearch ||
                                        item.label.toLowerCase().includes(phSearch.toLowerCase()) ||
                                        item.value.toLowerCase().includes(phSearch.toLowerCase())
                                    )
                                    if (filtered.length === 0) return null
                                    return (
                                        <div key={group.group}>
                                            {/* Group header */}
                                            <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider"
                                                style={{ backgroundColor: C.bg, color: C.muted, fontFamily: 'DM Sans, sans-serif', borderBottom: `1px solid ${C.border}` }}>
                                                {group.group}
                                            </div>
                                            {filtered.map((ph, i) => (
                                                <button key={ph.value}
                                                    onMouseDown={e => { e.preventDefault(); insertPlaceholder(ph.value) }}
                                                    className="w-full text-left px-4 py-2 transition-all hover:opacity-80"
                                                    style={{
                                                        backgroundColor: 'transparent', border: 'none',
                                                        borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none',
                                                        cursor: 'pointer',
                                                    }}>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-[12px] font-bold"
                                                            style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                                            {ph.value}
                                                        </span>
                                                        <span className="text-[10px] truncate shrink-0"
                                                            style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                                            e.g. {ph.example}
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] mt-0.5" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                                        {ph.label}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )
                                })}

                                {/* No results */}
                                {phSearch && PLACEHOLDER_GROUPS.every(g =>
                                    g.items.every(item =>
                                        !item.label.toLowerCase().includes(phSearch.toLowerCase()) &&
                                        !item.value.toLowerCase().includes(phSearch.toLowerCase())
                                    )
                                ) && (
                                        <div className="px-4 py-6 text-center text-[12px]"
                                            style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                            No placeholders found for "{phSearch}"
                                        </div>
                                    )}
                            </div>

                            {/* Custom placeholder */}
                            <div className="px-3 py-2.5 shrink-0" style={{ borderTop: `1px solid ${C.border}` }}>
                                <p className="text-[10px] font-semibold mb-1.5"
                                    style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                    CUSTOM PLACEHOLDER
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        value={customPh}
                                        onChange={e => setCustomPh(e.target.value)}
                                        placeholder="e.g. WARRANTY_INFO"
                                        onKeyDown={e => e.key === 'Enter' && insertCustom()}
                                        className="flex-1 text-[11px] px-2.5 py-1.5 rounded-lg outline-none"
                                        style={{ border: `1px solid ${C.borderInput}`, backgroundColor: C.bg, color: C.body, fontFamily: 'DM Sans, sans-serif' }}
                                    />
                                    <button onMouseDown={e => { e.preventDefault(); insertCustom() }}
                                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:opacity-80"
                                        style={{ backgroundColor: C.primary, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                        Insert
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => { saveCursor(); setShowAssets(true) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold hover:opacity-80 transition-all shrink-0"
                    style={{ backgroundColor: C.surface, color: C.secondary, border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    <Image size={13} /> Image Assets
                </button>
                <button
                    onClick={() => setShowImport(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold hover:opacity-80 transition-all shrink-0"
                    style={{ backgroundColor: C.surface, color: C.secondary, border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    <Link2 size={13} /> Import URL
                </button>
            </div>

            {/* ── Main split ────────────────────────────────────────────── */}
            <div className="flex flex-1 min-h-0">

                {/* ── LEFT: Code editor ──────────────────────────────────── */}
                <div className="flex flex-col shrink-0"
                    style={{ width: '50%', borderRight: `1px solid ${C.editorBorder}`, backgroundColor: C.editorBg }}>

                    {/* Editor label bar */}
                    <div className="flex items-center justify-between px-4 py-2 shrink-0"
                        style={{ backgroundColor: C.editorGutter, borderBottom: `1px solid ${C.editorBorder}` }}>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
                                HTML
                            </span>
                            <span className="text-[11px] font-medium"
                                style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'DM Sans, sans-serif' }}>
                                HTML &amp; CSS Source Code
                            </span>
                        </div>
                        <button
                            onClick={() => setHtml(h => h.trim())}
                            className="text-[11px] font-semibold hover:opacity-70 transition-all"
                            style={{ color: C.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                            Format Code
                        </button>
                    </div>

                    {/* Editor body: gutter + textarea side by side */}
                    <div className="flex flex-1 min-h-0 overflow-hidden">

                        {/* Line numbers — scrolls in sync via JS */}
                        <div
                            ref={gutterRef}
                            className="shrink-0 select-none"
                            style={{
                                width: 48,
                                backgroundColor: C.editorGutter,
                                borderRight: `1px solid ${C.editorBorder}`,
                                overflowY: 'hidden',
                                paddingTop: 12,
                                paddingBottom: 12,
                            }}
                        >
                            {lines.map((_, i) => (
                                <div key={i}
                                    style={{
                                        height: LINE_H,
                                        lineHeight: `${LINE_H}px`,
                                        textAlign: 'right',
                                        paddingRight: 10,
                                        fontSize: 11,
                                        color: 'rgba(255,255,255,0.4)',
                                        fontFamily: 'Consolas, monospace',
                                    }}>
                                    {i + 1}
                                </div>
                            ))}
                        </div>

                        {/* Editor: highlight overlay + textarea */}
                        <div className="flex-1 relative overflow-hidden" style={{ backgroundColor: C.editorBg }}>

                            {/* Highlight pre — only shown when searching */}
                            {findVal && (
                                <pre
                                    aria-hidden
                                    id="hl-overlay"
                                    style={{
                                        position: 'absolute',
                                        top: 0, left: 0,
                                        margin: 0,
                                        padding: '12px 16px',
                                        fontFamily: "'Fira Code','Cascadia Code',Consolas,monospace",
                                        fontSize: 12,
                                        lineHeight: `${LINE_H}px`,
                                        whiteSpace: 'pre',
                                        pointerEvents: 'none',
                                        color: '#e2e8f0',
                                        width: '100%',
                                        minHeight: '100%',
                                        overflow: 'hidden',
                                        zIndex: 1,
                                        boxSizing: 'border-box',
                                    }}
                                    dangerouslySetInnerHTML={{
                                        __html: html
                                            .replace(/&/g, '&amp;')
                                            .replace(/</g, '&lt;')
                                            .replace(/>/g, '&gt;')
                                            .replace(
                                                new RegExp(
                                                    findVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                                                    caseSensitive ? 'g' : 'gi'
                                                ),
                                                m => `<mark style="background:#f59e0b;color:#1e1535;border-radius:2px">${m}</mark>`
                                            )
                                    }}
                                />
                            )}

                            {/* Textarea — transparent text when searching so highlight shows */}
                            <textarea
                                ref={textareaRef}
                                value={html}
                                onChange={e => setHtml(e.target.value)}
                                spellCheck={false}
                                style={{
                                    position: findVal ? 'absolute' : 'relative',
                                    top: 0, left: 0,
                                    flex: 1,
                                    width: '100%',
                                    height: '100%',
                                    margin: 0,
                                    padding: '12px 16px',
                                    fontFamily: "'Fira Code','Cascadia Code',Consolas,monospace",
                                    fontSize: 12,
                                    lineHeight: `${LINE_H}px`,
                                    backgroundColor: findVal ? 'transparent' : C.editorBg,
                                    color: findVal ? 'transparent' : '#e2e8f0',
                                    caretColor: '#fff',
                                    border: 'none',
                                    outline: 'none',
                                    resize: 'none',
                                    tabSize: 2,
                                    whiteSpace: 'pre',
                                    overflowY: 'auto',
                                    overflowX: 'auto',
                                    boxSizing: 'border-box',
                                    zIndex: 2,
                                }}
                                onScroll={e => {
                                    if (gutterRef.current) {
                                        gutterRef.current.scrollTop = e.currentTarget.scrollTop
                                    }
                                    const pre = document.getElementById('hl-overlay')
                                    if (pre) {
                                        pre.scrollTop = e.currentTarget.scrollTop
                                        pre.scrollLeft = e.currentTarget.scrollLeft
                                    }
                                }}
                                onBlur={e => { if (!phOpen) savedCursor.current = e.currentTarget.selectionStart }}
                                onKeyDown={e => {
                                    if (e.key === 'Tab') {
                                        e.preventDefault()
                                        const el = e.currentTarget
                                        const start = el.selectionStart
                                        const end = el.selectionEnd
                                        const next = html.slice(0, start) + '  ' + html.slice(end)
                                        setHtml(next)
                                        setTimeout(() => el.setSelectionRange(start + 2, start + 2), 0)
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Live preview ────────────────────────────────── */}
                <div className="flex flex-col flex-1 min-w-0" style={{ backgroundColor: '#e8e8e8' }}>

                    {/* Preview toolbar */}
                    <div className="flex items-center justify-between px-4 shrink-0"
                        style={{ height: 44, backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>

                        {/* Device toggles */}
                        <div className="flex items-center gap-1">
                            {DEVICES.map(d => (
                                <button key={d.id} onClick={() => setDevice(d.id)} title={d.label}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:opacity-80"
                                    style={{ backgroundColor: device === d.id ? C.primaryLight : 'transparent', border: 'none', cursor: 'pointer' }}>
                                    <d.icon size={15} style={{ color: device === d.id ? C.primary : C.muted }} />
                                </button>
                            ))}
                        </div>

                        {/* eBay ID + fullscreen */}
                        <div className="flex items-center gap-2">
                            <input value={ebayId} onChange={e => setEbayId(e.target.value)}
                                placeholder="Enter eBay Item ID or SKU to test..."
                                className="text-[11px] px-3 py-1.5 rounded-lg outline-none"
                                style={{ border: `1px solid ${C.borderInput}`, backgroundColor: C.bg, color: C.body, fontFamily: 'DM Sans, sans-serif', width: 240 }}
                                onFocus={e => e.currentTarget.style.borderColor = C.primary}
                                onBlur={e => e.currentTarget.style.borderColor = C.borderInput}
                                onKeyDown={e => e.key === 'Enter' && testPreview()} />
                            <button onClick={testPreview} disabled={testLoading || !ebayId.trim()}
                                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg hover:opacity-80 transition-all disabled:opacity-40"
                                style={{ backgroundColor: C.primaryLight, color: C.primary, border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                {testLoading ? 'Loading...' : 'Test'}
                            </button>
                            {previewHtml && (
                                <button onClick={() => setPreviewHtml('')}
                                    className="text-[10px] font-semibold px-2 py-1.5 rounded-lg hover:opacity-80 transition-all"
                                    style={{ backgroundColor: 'transparent', color: C.muted, border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                    Reset
                                </button>
                            )}
                            <button onClick={() => setFullscreen(true)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-80 transition-all"
                                style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, cursor: 'pointer' }} title="Fullscreen">
                                <Maximize2 size={12} style={{ color: C.muted }} />
                            </button>
                        </div>
                    </div>

                    {/* Live iframe — fills remaining height */}
                    <div className="flex-1 min-h-0 overflow-auto">
                        <div style={{
                            width: iframeWidth,
                            maxWidth: '100%',
                            height: '100%',
                            backgroundColor: '#fff',
                            margin: device === 'desktop' ? 0 : '0 auto',
                            transition: 'width 0.25s ease',
                        }}>
                            <iframe
                                key={device}
                                srcDoc={previewHtml || html}
                                style={{ width: '100%', height: '100%', minHeight: 'calc(100vh - 176px)', border: 'none', display: 'block' }}
                                sandbox="allow-same-origin"
                                title="Template Preview"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Bottom status bar ────────────────────────────────────── */}
            <div className="flex items-center gap-2 px-4 shrink-0"
                style={{ height: 32, backgroundColor: C.dark, borderTop: `1px solid rgba(255,255,255,0.06)` }}>
                <CheckCircle2 size={12} style={{ color: C.accent }} />
                <span className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'DM Sans, sans-serif' }}>
                    Active Content Free
                </span>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>•</span>
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans, sans-serif' }}>
                    100% eBay Policy Compliant Code
                </span>
                <div style={{ flex: 1 }} />
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'DM Sans, sans-serif' }}>
                    {html.length.toLocaleString()} characters · {lineCount} lines
                </span>
            </div>

            {phOpen && <div className="fixed inset-0 z-20" onClick={() => setPhOpen(false)} />}

            {/* Fullscreen preview */}
            {fullscreen && (
                <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#fff' }}>
                    <div className="flex items-center justify-between px-4 py-2 shrink-0"
                        style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
                        <span className="text-[13px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                            Fullscreen Preview
                        </span>
                        <div className="flex items-center gap-2">
                            {DEVICES.map(d => (
                                <button key={d.id} onClick={() => setDevice(d.id)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                                    style={{ backgroundColor: device === d.id ? C.primaryLight : 'transparent', border: 'none', cursor: 'pointer' }}>
                                    <d.icon size={14} style={{ color: device === d.id ? C.primary : C.muted }} />
                                </button>
                            ))}
                            <button onClick={() => setFullscreen(false)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold hover:opacity-80 transition-all"
                                style={{ backgroundColor: C.dark, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                <X size={13} /> Close
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto" style={{ backgroundColor: '#e8e8e8' }}>
                        <div style={{ width: iframeWidth, maxWidth: '100%', height: '100%', backgroundColor: '#fff', margin: device === 'desktop' ? 0 : '0 auto' }}>
                            <iframe srcDoc={previewHtml || html}
                                style={{ width: '100%', height: '100%', minHeight: 'calc(100vh - 52px)', border: 'none', display: 'block' }}
                                sandbox="allow-same-origin" title="Fullscreen Preview" />
                        </div>
                    </div>
                </div>
            )}

            {/* Image Assets panel */}
            <ImageAssets
                open={showAssets}
                onClose={() => setShowAssets(false)}
                onInsert={insertImage}
                mode="panel"
            />

            {/* Import URL modal */}
            <ImportUrl
                open={showImport}
                onClose={() => setShowImport(false)}
                onImport={(importedHtml, importedName) => {
                    setHtml(importedHtml)
                    setName(importedName)
                }}
            />
        </div>
    )
}
