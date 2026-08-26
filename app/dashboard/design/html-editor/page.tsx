'use client'
// app/dashboard/design/html-editor/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — HTML Template Editor Studio
// Full-page code editor with live preview
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ChevronLeft, Code2, LayoutTemplate, Save, X,
    Search, RefreshCw, Monitor, Tablet, Smartphone,
    Plus, Image, Link2, ChevronDown, Maximize2,
    CheckCircle2, Layers,
} from 'lucide-react'
import { PrimaryButton, SecondaryButton, GhostButton } from '@/components/ui/Buttons'

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
    success: '#16a34a',
    successBg: '#dcfce7',
    // Editor dark
    editorBg: '#0f0e1a',
    editorGutter: '#1a1828',
    editorBorder: '#2d2a42',
}

// ── Placeholder options ────────────────────────────────────────────────────
const PLACEHOLDERS = [
    { label: 'Product Title', value: '{{PRODUCT_TITLE}}' },
    { label: 'Item Price', value: '{{ITEM_PRICE}}' },
    { label: 'Main Image URL', value: '{{MAIN_IMAGE_URL}}' },
    { label: 'Item Description', value: '{{ITEM_DESCRIPTION}}' },
    { label: 'Item Condition', value: '{{ITEM_CONDITION}}' },
    { label: 'Seller Name', value: '{{SELLER_NAME}}' },
    { label: 'Item SKU', value: '{{ITEM_SKU}}' },
    { label: 'Item Category', value: '{{ITEM_CATEGORY}}' },
]

// ── Default starter HTML ───────────────────────────────────────────────────
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

// ── Device preview widths ──────────────────────────────────────────────────
const DEVICES = [
    { id: 'desktop', icon: Monitor, width: '100%' },
    { id: 'tablet', icon: Tablet, width: '768px' },
    { id: 'mobile', icon: Smartphone, width: '390px' },
] as const
type DeviceId = typeof DEVICES[number]['id']

// ── Main component ─────────────────────────────────────────────────────────
function HtmlEditorInner() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const templateName = searchParams.get('name') || 'Untitled Template'

    // Editor state
    const [html, setHtml] = useState(DEFAULT_HTML)
    const [name, setName] = useState(templateName)
    const [activeMode, setActiveMode] = useState<'code' | 'visual'>('code')
    const [device, setDevice] = useState<DeviceId>('desktop')
    const [previewHtml, setPreviewHtml] = useState(DEFAULT_HTML)
    const [ebayId, setEbayId] = useState('')
    const [saved, setSaved] = useState(false)
    const [saving, setSaving] = useState(false)

    // Find & replace
    const [findVal, setFindVal] = useState('')
    const [replaceVal, setReplaceVal] = useState('')

    // Placeholder dropdown
    const [phOpen, setPhOpen] = useState(false)

    // Line count for gutter
    const lineCount = html.split('\n').length

    // Textarea ref for cursor-aware placeholder insert
    const editorRef = useRef<HTMLTextAreaElement>(null)

    // Refresh preview
    const refreshPreview = useCallback(() => {
        setPreviewHtml(html)
    }, [html])

    // Insert placeholder at cursor
    function insertPlaceholder(value: string) {
        const el = editorRef.current
        if (!el) return
        const start = el.selectionStart
        const end = el.selectionEnd
        const next = html.slice(0, start) + value + html.slice(end)
        setHtml(next)
        setPhOpen(false)
        setTimeout(() => {
            el.focus()
            el.setSelectionRange(start + value.length, start + value.length)
        }, 0)
    }

    // Apply find & replace
    function applyReplace() {
        if (!findVal) return
        setHtml(prev => prev.replaceAll(findVal, replaceVal))
    }

    // Format code (basic indent normalise)
    function formatCode() {
        // Simple passthrough — real formatter would use prettier
        setHtml(h => h.trim())
    }

    // Save draft
    async function saveDraft() {
        setSaving(true)
        await new Promise(r => setTimeout(r, 600))
        setSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    // Save & close
    async function saveAndClose() {
        await saveDraft()
        router.push('/dashboard/design?tab=templates')
    }

    const previewWidth = DEVICES.find(d => d.id === device)?.width ?? '100%'

    return (
        <div className="flex flex-col" style={{ height: '100vh', backgroundColor: C.bg, overflow: 'hidden' }}>

            {/* ── Top bar ── */}
            <div
                className="flex items-center justify-between px-4 shrink-0"
                style={{
                    height: 52,
                    backgroundColor: C.surface,
                    borderBottom: `1px solid ${C.border}`,
                    gap: 12,
                }}
            >
                {/* Left: back + title */}
                <div className="flex items-center gap-3 min-w-0">
                    <Link
                        href="/dashboard/design?tab=templates"
                        className="flex items-center gap-1.5 text-[12px] font-semibold shrink-0 hover:opacity-70 transition-all"
                        style={{ color: C.primary, textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}
                    >
                        <ChevronLeft size={14} />
                        Template Library
                    </Link>

                    <div style={{ width: 1, height: 20, backgroundColor: C.border }} />

                    <h1
                        className="text-[15px] font-bold truncate"
                        style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}
                    >
                        HTML Template Editor Studio
                    </h1>
                </div>

                {/* Centre: mode tabs */}
                <div
                    className="flex items-center shrink-0 rounded-xl p-0.5"
                    style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                >
                    <button
                        onClick={() => setActiveMode('code')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                        style={{
                            backgroundColor: activeMode === 'code' ? C.primary : 'transparent',
                            color: activeMode === 'code' ? '#fff' : C.secondary,
                            border: 'none', cursor: 'pointer',
                            fontFamily: 'DM Sans, sans-serif',
                        }}
                    >
                        <Code2 size={13} />
                        HTML Code Editor
                    </button>
                    <button
                        onClick={() => setActiveMode('visual')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                        style={{
                            backgroundColor: activeMode === 'visual' ? C.primary : 'transparent',
                            color: activeMode === 'visual' ? '#fff' : C.secondary,
                            border: 'none', cursor: 'pointer',
                            fontFamily: 'DM Sans, sans-serif',
                        }}
                    >
                        <Layers size={13} />
                        Visual Drag-&-Drop Editor
                    </button>
                </div>

                {/* Right: Save actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <GhostButton onClick={saveDraft} icon={<Save size={13} />}>
                        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Draft'}
                    </GhostButton>
                    <PrimaryButton onClick={saveAndClose} icon={<X size={13} />}>
                        Save & Close
                    </PrimaryButton>
                </div>
            </div>

            {/* ── Second bar: name + toolbar ── */}
            <div
                className="flex items-center gap-3 px-4 shrink-0"
                style={{
                    height: 48,
                    backgroundColor: C.surface,
                    borderBottom: `1px solid ${C.border}`,
                }}
            >
                {/* Template name */}
                <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="text-[13px] px-3 py-1.5 rounded-lg outline-none transition-all"
                    style={{
                        border: `1px solid ${C.borderInput}`,
                        backgroundColor: C.bg,
                        color: C.body,
                        fontFamily: 'DM Sans, sans-serif',
                        width: 220,
                        minWidth: 0,
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = C.primary}
                    onBlur={e => e.currentTarget.style.borderColor = C.borderInput}
                />

                <div style={{ flex: 1 }} />

                {/* Insert Dynamic Placeholder */}
                <div className="relative">
                    <button
                        onClick={() => setPhOpen(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:opacity-80"
                        style={{
                            backgroundColor: C.primaryLight,
                            color: C.primary,
                            border: `1px solid ${C.border}`,
                            cursor: 'pointer',
                            fontFamily: 'DM Sans, sans-serif',
                        }}
                    >
                        <Plus size={13} />
                        Insert Dynamic Placeholder
                        <ChevronDown size={12} />
                    </button>
                    {phOpen && (
                        <div
                            className="absolute top-full mt-1 right-0 rounded-xl shadow-lg z-30"
                            style={{
                                backgroundColor: C.surface,
                                border: `1px solid ${C.border}`,
                                minWidth: 210,
                            }}
                        >
                            {PLACEHOLDERS.map(ph => (
                                <button
                                    key={ph.value}
                                    onClick={() => insertPlaceholder(ph.value)}
                                    className="w-full text-left px-4 py-2.5 text-[12px] transition-all hover:opacity-80 first:rounded-t-xl last:rounded-b-xl"
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: C.body,
                                        fontFamily: 'DM Sans, sans-serif',
                                        borderBottom: `1px solid ${C.border}`,
                                    }}
                                >
                                    <span style={{ color: C.primary, fontWeight: 700, marginRight: 6 }}>
                                        {ph.value}
                                    </span>
                                    <span style={{ color: C.muted }}>— {ph.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Image Assets */}
                <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:opacity-80"
                    style={{
                        backgroundColor: C.surface,
                        color: C.secondary,
                        border: `1px solid ${C.border}`,
                        cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif',
                    }}
                >
                    <Image size={13} />
                    Image Assets
                </button>

                {/* Import URL */}
                <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:opacity-80"
                    style={{
                        backgroundColor: C.surface,
                        color: C.secondary,
                        border: `1px solid ${C.border}`,
                        cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif',
                    }}
                >
                    <Link2 size={13} />
                    Import URL
                </button>
            </div>

            {/* ── Third bar: find & replace ── */}
            <div
                className="flex items-center gap-2 px-4 shrink-0"
                style={{
                    height: 44,
                    backgroundColor: C.surface,
                    borderBottom: `1px solid ${C.border}`,
                }}
            >
                <Search size={13} style={{ color: C.muted, flexShrink: 0 }} />
                <input
                    value={findVal}
                    onChange={e => setFindVal(e.target.value)}
                    placeholder="Search code..."
                    className="text-[12px] px-3 py-1.5 rounded-lg outline-none flex-1"
                    style={{
                        border: `1px solid ${C.borderInput}`,
                        backgroundColor: C.bg,
                        color: C.body,
                        fontFamily: 'DM Sans, sans-serif',
                        maxWidth: 280,
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = C.primary}
                    onBlur={e => e.currentTarget.style.borderColor = C.borderInput}
                />

                <input
                    value={replaceVal}
                    onChange={e => setReplaceVal(e.target.value)}
                    placeholder="Replace with..."
                    className="text-[12px] px-3 py-1.5 rounded-lg outline-none flex-1"
                    style={{
                        border: `1px solid ${C.borderInput}`,
                        backgroundColor: C.bg,
                        color: C.body,
                        fontFamily: 'DM Sans, sans-serif',
                        maxWidth: 280,
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = C.primary}
                    onBlur={e => e.currentTarget.style.borderColor = C.borderInput}
                />

                <SecondaryButton onClick={applyReplace}>
                    Apply
                </SecondaryButton>

                <div style={{ flex: 1 }} />

                {/* Format Code */}
                <button
                    onClick={formatCode}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                    style={{
                        backgroundColor: 'transparent',
                        color: C.primary,
                        border: `1px solid ${C.border}`,
                        cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif',
                    }}
                >
                    Format Code
                </button>
            </div>

            {/* ── Main split: editor + preview ── */}
            <div className="flex flex-1 min-h-0">

                {/* Left: Code editor */}
                <div
                    className="flex flex-col shrink-0"
                    style={{
                        width: '50%',
                        borderRight: `1px solid ${C.editorBorder}`,
                        backgroundColor: C.editorBg,
                    }}
                >
                    {/* Editor header */}
                    <div
                        className="flex items-center justify-between px-4 py-2 shrink-0"
                        style={{
                            backgroundColor: C.editorGutter,
                            borderBottom: `1px solid ${C.editorBorder}`,
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded"
                                style={{ backgroundColor: '#7530fb', color: '#fff', fontFamily: 'DM Sans, sans-serif' }}
                            >
                                HTML
                            </span>
                            <span
                                className="text-[11px]"
                                style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans, sans-serif' }}
                            >
                                HTML &amp; CSS Source Code
                            </span>
                        </div>
                        <button
                            onClick={formatCode}
                            className="text-[11px] font-semibold flex items-center gap-1 hover:opacity-70 transition-all"
                            style={{ color: C.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                        >
                            Format Code
                        </button>
                    </div>

                    {/* Editor with line numbers */}
                    <div className="flex flex-1 min-h-0 overflow-hidden">
                        {/* Gutter */}
                        <div
                            className="shrink-0 overflow-hidden select-none"
                            style={{
                                width: 44,
                                backgroundColor: C.editorGutter,
                                borderRight: `1px solid ${C.editorBorder}`,
                                paddingTop: 12,
                            }}
                        >
                            {Array.from({ length: lineCount }, (_, i) => (
                                <div
                                    key={i}
                                    className="text-right pr-3"
                                    style={{
                                        fontSize: 11,
                                        lineHeight: '21px',
                                        color: 'rgba(255,255,255,0.2)',
                                        fontFamily: 'monospace',
                                    }}
                                >
                                    {i + 1}
                                </div>
                            ))}
                        </div>

                        {/* Textarea */}
                        <textarea
                            ref={editorRef}
                            value={html}
                            onChange={e => setHtml(e.target.value)}
                            spellCheck={false}
                            className="flex-1 outline-none resize-none"
                            style={{
                                backgroundColor: C.editorBg,
                                color: '#e2e8f0',
                                fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                                fontSize: 12,
                                lineHeight: '21px',
                                padding: '12px 16px',
                                border: 'none',
                                tabSize: 2,
                            }}
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

                {/* Right: Preview */}
                <div
                    className="flex flex-col flex-1 min-w-0"
                    style={{ backgroundColor: '#e8e8e8' }}
                >
                    {/* Preview toolbar */}
                    <div
                        className="flex items-center justify-between px-4 py-2 shrink-0"
                        style={{
                            backgroundColor: C.surface,
                            borderBottom: `1px solid ${C.border}`,
                            height: 44,
                        }}
                    >
                        {/* Device toggles */}
                        <div className="flex items-center gap-1">
                            {DEVICES.map(d => (
                                <button
                                    key={d.id}
                                    onClick={() => setDevice(d.id)}
                                    title={d.id}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:opacity-80"
                                    style={{
                                        backgroundColor: device === d.id ? C.primaryLight : 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <d.icon
                                        size={14}
                                        style={{ color: device === d.id ? C.primary : C.muted }}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* eBay item ID test */}
                        <div className="flex items-center gap-2">
                            <input
                                value={ebayId}
                                onChange={e => setEbayId(e.target.value)}
                                placeholder="Enter eBay Item ID or SKU to test..."
                                className="text-[11px] px-3 py-1.5 rounded-lg outline-none"
                                style={{
                                    border: `1px solid ${C.borderInput}`,
                                    backgroundColor: C.bg,
                                    color: C.body,
                                    fontFamily: 'DM Sans, sans-serif',
                                    width: 240,
                                }}
                                onFocus={e => e.currentTarget.style.borderColor = C.primary}
                                onBlur={e => e.currentTarget.style.borderColor = C.borderInput}
                            />
                            <button
                                onClick={refreshPreview}
                                className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80"
                                style={{
                                    backgroundColor: 'transparent',
                                    color: C.primary,
                                    border: `1px solid ${C.border}`,
                                    cursor: 'pointer',
                                    fontFamily: 'DM Sans, sans-serif',
                                }}
                            >
                                <RefreshCw size={11} />
                                Refresh Preview
                            </button>
                            <button
                                className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:opacity-80"
                                style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, cursor: 'pointer' }}
                                title="Fullscreen preview"
                            >
                                <Maximize2 size={12} style={{ color: C.muted }} />
                            </button>
                        </div>
                    </div>

                    {/* Preview frame wrapper */}
                    <div className="flex-1 overflow-auto flex items-start justify-center p-6">
                        <div
                            style={{
                                width: previewWidth,
                                maxWidth: '100%',
                                backgroundColor: '#ffffff',
                                borderRadius: 8,
                                overflow: 'hidden',
                                boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                                transition: 'width 0.25s ease',
                            }}
                        >
                            {/* Fake browser chrome */}
                            <div
                                className="flex items-center gap-1.5 px-3 py-2"
                                style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}
                            >
                                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ff5f57' }} />
                                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#28c840' }} />
                                <div
                                    className="flex-1 mx-3 px-3 py-1 rounded text-center"
                                    style={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #ddd',
                                        fontSize: 10,
                                        color: '#888',
                                        fontFamily: 'DM Sans, sans-serif',
                                    }}
                                >
                                    preview.riazify.com/template
                                </div>
                            </div>

                            {/* iframe preview */}
                            <iframe
                                srcDoc={previewHtml}
                                style={{
                                    width: '100%',
                                    minHeight: 480,
                                    border: 'none',
                                    display: 'block',
                                }}
                                sandbox="allow-same-origin"
                                title="Template Preview"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Bottom status bar ── */}
            <div
                className="flex items-center gap-2 px-4 shrink-0"
                style={{
                    height: 32,
                    backgroundColor: C.dark,
                    borderTop: `1px solid rgba(255,255,255,0.06)`,
                }}
            >
                <CheckCircle2 size={12} style={{ color: C.accent }} />
                <span
                    className="text-[11px] font-semibold"
                    style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'DM Sans, sans-serif' }}
                >
                    Active Content Free
                </span>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>•</span>
                <span
                    className="text-[11px]"
                    style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans, sans-serif' }}
                >
                    100% eBay Policy Compliant Code
                </span>
                <div style={{ flex: 1 }} />
                <span
                    className="text-[11px]"
                    style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'DM Sans, sans-serif' }}
                >
                    {html.length.toLocaleString()} characters · {lineCount} lines
                </span>
            </div>

            {/* Click outside to close placeholder dropdown */}
            {phOpen && (
                <div
                    className="fixed inset-0 z-20"
                    onClick={() => setPhOpen(false)}
                />
            )}
        </div>
    )
}

export default function HtmlEditorPage() {
    return (
        <Suspense fallback={null}>
            <HtmlEditorInner />
        </Suspense>
    )
}
