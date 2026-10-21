'use client'
// components/ui/HtmlEditorPanel.tsx
// The HTML Template Editor Studio rendered as a full-screen fixed overlay.
// Used by the Visual Editor when the user clicks "Code Editor" — no navigation,
// no router, no iframe. Just the same UI rendered directly in the React tree.

import { useState, useRef } from 'react'
import {
    ChevronLeft, X,
    Monitor, Tablet, Smartphone,
    Maximize2, CheckCircle2,
} from 'lucide-react'

// ── Design tokens (same as html-editor/page.tsx) ──────────────────────────
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

// ── Placeholder groups ─────────────────────────────────────────────────────
interface Placeholder { label: string; value: string; example: string }
interface PlaceholderGroup { group: string; items: Placeholder[] }

const PLACEHOLDER_GROUPS: PlaceholderGroup[] = [
    {
        group: 'Product Info',
        items: [
<<<<<<< HEAD
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
=======
            { label: 'Product Title',   value: '{{PRODUCT_TITLE}}',   example: 'Premium Dog Clippers Pro' },
            { label: 'Item Description',value: '{{ITEM_DESCRIPTION}}',example: 'High-quality grooming kit...' },
            { label: 'Item Condition',  value: '{{ITEM_CONDITION}}',  example: 'Brand New' },
            { label: 'Brand',           value: '{{BRAND}}',           example: 'Wahl' },
            { label: 'Model',           value: '{{MODEL}}',           example: 'KM10' },
            { label: 'MPN',             value: '{{MPN}}',             example: '9788-100' },
            { label: 'EAN / Barcode',   value: '{{EAN}}',             example: '0043917978819' },
            { label: 'Item Category',   value: '{{ITEM_CATEGORY}}',   example: 'Pet Supplies' },
            { label: 'Item SKU',        value: '{{ITEM_SKU}}',        example: 'SKU-12345' },
            { label: 'Warranty',        value: '{{WARRANTY}}',        example: '2 Year Manufacturer Warranty' },
            { label: 'Weight',          value: '{{WEIGHT}}',          example: '1.2 kg' },
            { label: 'Dimensions',      value: '{{DIMENSIONS}}',      example: '30 x 15 x 10 cm' },
>>>>>>> 225fa352826856d159739ea69c36569fb76a9cb3
        ],
    },
    {
        group: 'Pricing',
        items: [
<<<<<<< HEAD
            { label: 'Item Price', value: '{{ITEM_PRICE}}', example: '£29.99' },
            { label: 'Original Price', value: '{{ORIGINAL_PRICE}}', example: '£49.99' },
            { label: 'Discount %', value: '{{DISCOUNT_PERCENT}}', example: '40%' },
=======
            { label: 'Item Price',     value: '{{ITEM_PRICE}}',      example: '£29.99' },
            { label: 'Original Price', value: '{{ORIGINAL_PRICE}}',  example: '£49.99' },
            { label: 'Discount %',     value: '{{DISCOUNT_PERCENT}}',example: '40%' },
>>>>>>> 225fa352826856d159739ea69c36569fb76a9cb3
        ],
    },
    {
        group: 'Media',
        items: [
            { label: 'Main Image URL', value: '{{MAIN_IMAGE_URL}}', example: 'https://i.ebayimg.com/...' },
<<<<<<< HEAD
            { label: 'Image 2 URL', value: '{{IMAGE_2_URL}}', example: 'https://i.ebayimg.com/...' },
            { label: 'Image 3 URL', value: '{{IMAGE_3_URL}}', example: 'https://i.ebayimg.com/...' },
=======
            { label: 'Image 2 URL',    value: '{{IMAGE_2_URL}}',    example: 'https://i.ebayimg.com/...' },
            { label: 'Image 3 URL',    value: '{{IMAGE_3_URL}}',    example: 'https://i.ebayimg.com/...' },
>>>>>>> 225fa352826856d159739ea69c36569fb76a9cb3
        ],
    },
    {
        group: 'Shipping & Returns',
        items: [
<<<<<<< HEAD
            { label: 'Shipping Time', value: '{{SHIPPING_TIME}}', example: 'Same Day Dispatch' },
            { label: 'Return Policy', value: '{{RETURN_POLICY}}', example: '30-Day Free Returns' },
            { label: 'Seller Name', value: '{{SELLER_NAME}}', example: 'UKTopDeals' },
=======
            { label: 'Shipping Time',  value: '{{SHIPPING_TIME}}',  example: 'Same Day Dispatch' },
            { label: 'Return Policy',  value: '{{RETURN_POLICY}}',  example: '30-Day Free Returns' },
            { label: 'Seller Name',    value: '{{SELLER_NAME}}',    example: 'UKTopDeals' },
>>>>>>> 225fa352826856d159739ea69c36569fb76a9cb3
        ],
    },
]

// ── Devices ────────────────────────────────────────────────────────────────
const DEVICES = [
<<<<<<< HEAD
    { id: 'desktop', icon: Monitor, label: 'Desktop' },
    { id: 'tablet', icon: Tablet, label: 'Tablet' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile' },
=======
    { id: 'desktop', icon: Monitor,    label: 'Desktop' },
    { id: 'tablet',  icon: Tablet,     label: 'Tablet'  },
    { id: 'mobile',  icon: Smartphone, label: 'Mobile'  },
>>>>>>> 225fa352826856d159739ea69c36569fb76a9cb3
] as const
type DeviceId = typeof DEVICES[number]['id']

const LINE_H = 21 // px — must match textarea lineHeight

// ── Props ──────────────────────────────────────────────────────────────────
interface HtmlEditorPanelProps {
    initialHtml: string
    initialName: string
    /** Called when the user clicks "Apply & Return". Updates Visual Editor and closes. */
    onApply: (html: string, name: string) => void
    /** Called when the user clicks "← Visual Editor" (discard changes). */
    onDiscard: () => void
}

export default function HtmlEditorPanel({
    initialHtml,
    initialName,
    onApply,
    onDiscard,
}: HtmlEditorPanelProps) {
<<<<<<< HEAD
    const [html, setHtml] = useState(initialHtml)
    const [name, setName] = useState(initialName)
    const [device, setDevice] = useState<DeviceId>('desktop')
    const [ebayId, setEbayId] = useState('')
    const [fullscreen, setFullscreen] = useState(false)
    const [testLoading, setTestLoading] = useState(false)
    const [previewHtml, setPreviewHtml] = useState('')

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const gutterRef = useRef<HTMLDivElement>(null)

    const lines = html.split('\n')
=======
    const [html, setHtml]   = useState(initialHtml)
    const [name, setName]   = useState(initialName)
    const [device, setDevice] = useState<DeviceId>('desktop')
    const [ebayId, setEbayId] = useState('')
    const [fullscreen, setFullscreen]   = useState(false)
    const [testLoading, setTestLoading] = useState(false)
    const [previewHtml, setPreviewHtml] = useState('')

    const textareaRef  = useRef<HTMLTextAreaElement>(null)
    const gutterRef    = useRef<HTMLDivElement>(null)

    const lines     = html.split('\n')
>>>>>>> 225fa352826856d159739ea69c36569fb76a9cb3
    const lineCount = lines.length

    // ── eBay test preview ─────────────────────────────────────────────────
    async function testPreview() {
        if (!ebayId.trim()) return
        setTestLoading(true)
        try {
<<<<<<< HEAD
            const res = await fetch(`/api/ebay/import-listing?item=${encodeURIComponent(ebayId.trim())}`)
            const data = await res.json()
            if (!res.ok || !data.item) { alert(data.error || 'Could not fetch listing'); return }
            const item = data.item
            const currency = item.currency === 'GBP' ? '£' : item.currency === 'EUR' ? '€' : '$'
            setPreviewHtml(html
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
                .replace(/\{\{EAN\}\}/g, item.ean ?? ''))
        } catch { alert('Network error fetching listing') }
        finally { setTestLoading(false) }
=======
            const res  = await fetch(`/api/ebay/import-listing?item=${encodeURIComponent(ebayId.trim())}`)
            const data = await res.json()
            if (!res.ok || !data.item) { alert(data.error || 'Could not fetch listing'); return }
            const item     = data.item
            const currency = item.currency === 'GBP' ? '£' : item.currency === 'EUR' ? '€' : '$'
            setPreviewHtml(html
                .replace(/\{\{PRODUCT_TITLE\}\}/g,    item.title       ?? '')
                .replace(/\{\{ITEM_PRICE\}\}/g,        `${currency}${parseFloat(item.price).toFixed(2)}`)
                .replace(/\{\{MAIN_IMAGE_URL\}\}/g,    item.imageUrl    ?? '')
                .replace(/\{\{ITEM_DESCRIPTION\}\}/g,  item.title       ?? '')
                .replace(/\{\{ITEM_CONDITION\}\}/g,    item.condition   ?? '')
                .replace(/\{\{SELLER_NAME\}\}/g,       item.seller      ?? '')
                .replace(/\{\{ITEM_CATEGORY\}\}/g,     item.categoryName ?? '')
                .replace(/\{\{ITEM_SKU\}\}/g,          item.itemId      ?? '')
                .replace(/\{\{BRAND\}\}/g,             item.brand       ?? '')
                .replace(/\{\{MPN\}\}/g,               item.mpn         ?? '')
                .replace(/\{\{EAN\}\}/g,               item.ean         ?? ''))
        } catch { alert('Network error fetching listing') }
        finally  { setTestLoading(false) }
>>>>>>> 225fa352826856d159739ea69c36569fb76a9cb3
    }

    const iframeWidth =
        device === 'desktop' ? '100%' :
<<<<<<< HEAD
            device === 'tablet' ? '768px' : '390px'
=======
        device === 'tablet'  ? '768px' : '390px'
>>>>>>> 225fa352826856d159739ea69c36569fb76a9cb3

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, left: '25%',
            zIndex: 9999,
            display: 'flex', flexDirection: 'column',
            backgroundColor: C.editorBg,
            overflow: 'hidden',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
        }}>

            {/* ── Slim top bar — back + apply only ─────────────────────── */}
            <div className="flex items-center justify-between px-3 shrink-0"
                style={{ height: 40, backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
                <button
                    onClick={onDiscard}
                    className="flex items-center gap-1 text-[12px] font-semibold hover:opacity-70 transition-all"
                    style={{ color: C.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    <ChevronLeft size={14} /> Visual Editor
                </button>
                <button onClick={() => onApply(html, name)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-bold transition-all hover:opacity-90"
                    style={{ backgroundColor: C.primary, color: '#ffffff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    <CheckCircle2 size={13} /> Apply &amp; Return
                </button>
            </div>

            {/* ── Main split ────────────────────────────────────────────── */}
            <div className="flex flex-1 min-h-0">

                {/* LEFT: Code editor */}
                <div className="flex flex-col shrink-0"
                    style={{ width: '50%', borderRight: `1px solid ${C.editorBorder}`, backgroundColor: C.editorBg }}>

                    <div className="flex items-center justify-between px-4 py-2 shrink-0"
                        style={{ backgroundColor: C.editorGutter, borderBottom: `1px solid ${C.editorBorder}` }}>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>HTML</span>
                            <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'DM Sans, sans-serif' }}>
                                HTML &amp; CSS Source Code
                            </span>
                        </div>
                        <button onClick={() => setHtml(h => h.trim())}
                            className="text-[11px] font-semibold hover:opacity-70 transition-all"
                            style={{ color: C.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                            Format Code
                        </button>
                    </div>

                    <div className="flex flex-1 min-h-0 overflow-hidden">
                        {/* Line numbers */}
                        <div ref={gutterRef} className="shrink-0 select-none"
                            style={{ width: 48, backgroundColor: C.editorGutter, borderRight: `1px solid ${C.editorBorder}`, overflowY: 'hidden', paddingTop: 12, paddingBottom: 12 }}>
                            {lines.map((_, i) => (
                                <div key={i} style={{ height: LINE_H, lineHeight: `${LINE_H}px`, textAlign: 'right', paddingRight: 10, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'Consolas, monospace' }}>
                                    {i + 1}
                                </div>
                            ))}
                        </div>

                        {/* Editor */}
                        <div className="flex-1 relative overflow-hidden" style={{ backgroundColor: C.editorBg }}>
                            <textarea
                                ref={textareaRef}
                                value={html}
                                onChange={e => setHtml(e.target.value)}
                                spellCheck={false}
                                style={{ position: 'relative', top: 0, left: 0, flex: 1, width: '100%', height: '100%', margin: 0, padding: '12px 16px', fontFamily: "'Fira Code','Cascadia Code',Consolas,monospace", fontSize: 12, lineHeight: `${LINE_H}px`, backgroundColor: C.editorBg, color: '#e2e8f0', caretColor: '#fff', border: 'none', outline: 'none', resize: 'none', tabSize: 2, whiteSpace: 'pre', overflowY: 'auto', overflowX: 'auto', boxSizing: 'border-box', zIndex: 2 }}
                                onScroll={e => {
                                    if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop
                                }}
                                onKeyDown={e => {
                                    if (e.key === 'Tab') {
                                        e.preventDefault()
                                        const el = e.currentTarget
                                        const start = el.selectionStart; const end = el.selectionEnd
                                        const next = html.slice(0, start) + '  ' + html.slice(end)
                                        setHtml(next)
                                        setTimeout(() => el.setSelectionRange(start + 2, start + 2), 0)
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT: Live preview */}
                <div className="flex flex-col flex-1 min-w-0" style={{ backgroundColor: '#e8e8e8' }}>
                    <div className="flex items-center justify-between px-4 shrink-0"
                        style={{ height: 44, backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
                        <div className="flex items-center gap-1">
                            {DEVICES.map(d => (
                                <button key={d.id} onClick={() => setDevice(d.id)} title={d.label}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:opacity-80"
                                    style={{ backgroundColor: device === d.id ? C.primaryLight : 'transparent', border: 'none', cursor: 'pointer' }}>
                                    <d.icon size={15} style={{ color: device === d.id ? C.primary : C.muted }} />
                                </button>
                            ))}
                        </div>
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

                    <div className="flex-1 min-h-0 overflow-auto">
                        <div style={{ width: iframeWidth, maxWidth: '100%', height: '100%', backgroundColor: '#fff', margin: device === 'desktop' ? 0 : '0 auto', transition: 'width 0.25s ease' }}>
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
                <span className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'DM Sans, sans-serif' }}>Active Content Free</span>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>•</span>
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans, sans-serif' }}>100% eBay Policy Compliant Code</span>
                <div style={{ flex: 1 }} />
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'DM Sans, sans-serif' }}>
                    {html.length.toLocaleString()} characters · {lineCount} lines
                </span>
            </div>

            {/* Fullscreen preview */}
            {fullscreen && (
                <div className="fixed inset-0 z-[10001] flex flex-col" style={{ backgroundColor: '#fff' }}>
                    <div className="flex items-center justify-between px-4 py-2 shrink-0"
                        style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
                        <span className="text-[13px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>Fullscreen Preview</span>
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

        </div>
    )
}
