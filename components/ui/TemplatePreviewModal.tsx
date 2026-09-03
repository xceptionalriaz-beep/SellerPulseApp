'use client'
// components/ui/TemplatePreviewModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Template Preview Modal
//
// Full preview modal with live iframe rendering, device toggles,
// template info panel, placeholder detection, prev/next navigation
//
// Usage:
//   import TemplatePreviewModal from '@/components/ui/TemplatePreviewModal'
//   <TemplatePreviewModal
//     template={previewTemplate}
//     templates={allTemplates}
//     onClose={() => setPreviewTemplate(null)}
//     onEdit={(t) => router.push(`/dashboard/design/visual-editor?id=${t.id}`)}
//     onCopy={(t) => copyHtml(t)}
//     copiedId={copiedId}
//   />
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from 'react'
import {
    X, Copy, Check, Monitor, Tablet, Smartphone,
    Pencil, ChevronLeft, ChevronRight, Code2,
    Tag, FileText, Hash, Zap,
} from 'lucide-react'

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    accent: '#b8fa33',
    success: '#16a34a',
    successBg: '#dcfce7',
}

// ── Types ──────────────────────────────────────────────────────────────────
export interface PreviewTemplate {
    id: string
    name: string
    category: string | null
    description: string | null
    description_html: string | null
    is_system: boolean | null
    is_shared: boolean | null
    use_count: number | null
    created_at: string | null
}

interface Props {
    template: PreviewTemplate | null
    templates?: PreviewTemplate[]
    onClose: () => void
    onEdit?: (t: PreviewTemplate) => void
    onCopy?: (t: PreviewTemplate) => void
    copiedId?: string | null
}

// ── Devices ────────────────────────────────────────────────────────────────
const DEVICES = [
    { id: 'desktop', icon: Monitor, label: 'Desktop', width: '100%' },
    { id: 'tablet', icon: Tablet, label: 'Tablet', width: '768px' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile', width: '390px' },
] as const
type DeviceId = typeof DEVICES[number]['id']

// ── Category colours ───────────────────────────────────────────────────────
const CAT_COLOURS: Record<string, { bg: string; text: string }> = {
    electronics: { bg: '#dbeafe', text: '#1d4ed8' },
    fashion: { bg: '#fce7f3', text: '#9d174d' },
    home: { bg: '#d1fae5', text: '#065f46' },
    auto: { bg: '#ffedd5', text: '#9a3412' },
    pets: { bg: '#ede9fe', text: '#5b21b6' },
    sports: { bg: '#dcfce7', text: '#166534' },
    collectibles: { bg: '#fef9c3', text: '#713f12' },
    books: { bg: '#fee2e2', text: '#991b1b' },
    general: { bg: '#f3f4f6', text: '#374151' },
}

function CategoryBadge({ category }: { category: string | null }) {
    const cat = category?.toLowerCase() ?? 'general'
    const colours = CAT_COLOURS[cat] ?? CAT_COLOURS.general
    return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
            style={{ backgroundColor: colours.bg, color: colours.text, fontFamily: 'DM Sans, sans-serif' }}>
            {category ?? 'General'}
        </span>
    )
}

// ── Wrap partial HTML in a full document ───────────────────────────────────
function wrapHtml(html: string): string {
    const trimmed = html.trim()
    if (trimmed.toLowerCase().startsWith('<!doctype') || trimmed.toLowerCase().startsWith('<html')) {
        return html
    }
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.7; color: #1f1d2e; background: #fff; padding: 24px; }
    h1 { font-size: 22px; font-weight: 700; color: #1e1535; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 3px solid #7530fb; }
    h2 { font-size: 16px; font-weight: 700; color: #1e1535; margin: 20px 0 8px; padding-left: 12px; border-left: 3px solid #7530fb; }
    h3 { font-size: 14px; font-weight: 700; color: #1e1535; margin: 14px 0 6px; }
    p  { font-size: 13px; color: #6b7280; margin: 0 0 10px; line-height: 1.7; }
    ul, ol { padding-left: 20px; margin: 0 0 10px; }
    li { font-size: 13px; color: #6b7280; margin-bottom: 5px; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
    td, th { padding: 9px 14px; border: 1px solid #ede9fe; font-size: 13px; text-align: left; }
    th { background-color: #7530fb; color: #fff; font-weight: 700; }
    tr:nth-child(even) { background-color: #f8f7ff; }
    img { max-width: 100%; height: auto; display: block; border-radius: 8px; margin-bottom: 10px; }
    a { color: #7530fb; text-decoration: none; }
    strong, b { font-weight: 700; color: #1e1535; }
  </style>
</head>
<body>${html}</body>
</html>`
}

// ── Extract placeholders from HTML ─────────────────────────────────────────
function extractPlaceholders(html: string): string[] {
    const matches = html.match(/\{\{[\w]+\}\}/g) ?? []
    return [...new Set(matches)]
}

// ── Main component ─────────────────────────────────────────────────────────
export default function TemplatePreviewModal({
    template,
    templates = [],
    onClose,
    onEdit,
    onCopy,
    copiedId,
}: Props) {
    const [device, setDevice] = useState<DeviceId>('desktop')
    const [current, setCurrent] = useState<PreviewTemplate | null>(template)

    // Sync with parent template prop
    useEffect(() => { setCurrent(template) }, [template])

    // Keyboard navigation
    useEffect(() => {
        if (!template) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowLeft') goPrev()
            if (e.key === 'ArrowRight') goNext()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [template, current])

    const idx = templates.findIndex(t => t.id === current?.id)
    const hasPrev = idx > 0
    const hasNext = idx < templates.length - 1

    function goPrev() { if (hasPrev) setCurrent(templates[idx - 1]) }
    function goNext() { if (hasNext) setCurrent(templates[idx + 1]) }

    const html = current?.description_html ?? ''
    const doc = wrapHtml(html)
    const placeholders = useMemo(() => extractPlaceholders(html), [html])
    const charCount = html.length
    const lineCount = html.split('\n').length
    const isCopied = copiedId === current?.id
    const previewWidth = DEVICES.find(d => d.id === device)?.width ?? '100%'

    if (!template || !current) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
        >
            <div
                className="w-full flex flex-col rounded-2xl overflow-hidden shadow-2xl"
                style={{
                    maxWidth: 1280,
                    maxHeight: '92vh',
                    backgroundColor: C.surface,
                    animation: 'modalIn 0.2s ease',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div
                    className="flex items-center justify-between px-5 py-3 shrink-0"
                    style={{ borderBottom: `1px solid ${C.border}` }}
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: C.primaryLight }}>
                            <FileText size={15} style={{ color: C.primary }} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[15px] font-bold truncate"
                                style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                {current.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <CategoryBadge category={current.category} />
                                {current.is_system && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                        System
                                    </span>
                                )}
                                {/* Prev/Next */}
                                {templates.length > 1 && (
                                    <div className="flex items-center gap-0.5 ml-2">
                                        <button onClick={goPrev} disabled={!hasPrev}
                                            className="w-5 h-5 flex items-center justify-center rounded hover:opacity-70 disabled:opacity-30 transition-all"
                                            style={{ backgroundColor: C.bg, border: 'none', cursor: hasPrev ? 'pointer' : 'not-allowed' }}>
                                            <ChevronLeft size={12} style={{ color: C.primary }} />
                                        </button>
                                        <span className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                            {idx + 1}/{templates.length}
                                        </span>
                                        <button onClick={goNext} disabled={!hasNext}
                                            className="w-5 h-5 flex items-center justify-center rounded hover:opacity-70 disabled:opacity-30 transition-all"
                                            style={{ backgroundColor: C.bg, border: 'none', cursor: hasNext ? 'pointer' : 'not-allowed' }}>
                                            <ChevronRight size={12} style={{ color: C.primary }} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Header actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-70 transition-all"
                            style={{ backgroundColor: C.bg, border: 'none', cursor: 'pointer' }}>
                            <X size={14} style={{ color: C.muted }} />
                        </button>
                    </div>
                </div>

                {/* ── Body: preview + info ── */}
                <div className="flex flex-1 min-h-0">

                    {/* Left: Live preview */}
                    <div className="flex flex-col flex-1 min-w-0" style={{ backgroundColor: '#e8e8e8' }}>

                        {/* Device toggles */}
                        <div className="flex items-center gap-2 px-4 py-2 shrink-0"
                            style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
                            {DEVICES.map(d => (
                                <button key={d.id} onClick={() => setDevice(d.id)}
                                    title={d.label}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80"
                                    style={{
                                        backgroundColor: device === d.id ? C.primaryLight : 'transparent',
                                        color: device === d.id ? C.primary : C.muted,
                                        border: `1px solid ${device === d.id ? C.primary : 'transparent'}`,
                                        cursor: 'pointer',
                                        fontFamily: 'DM Sans, sans-serif',
                                    }}>
                                    <d.icon size={13} /> {d.label}
                                </button>
                            ))}
                            <div style={{ flex: 1 }} />
                            <span className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                Live Preview
                            </span>
                        </div>

                        {/* iframe */}
                        <div className="flex-1 overflow-auto flex items-start justify-center p-4">
                            <div style={{
                                width: previewWidth,
                                maxWidth: '100%',
                                backgroundColor: '#fff',
                                borderRadius: 8,
                                overflow: 'hidden',
                                boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                                transition: 'width 0.25s ease',
                            }}>
                                {/* Fake browser chrome */}
                                <div className="flex items-center gap-1.5 px-3 py-2"
                                    style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ff5f57' }} />
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#28c840' }} />
                                    <div className="flex-1 mx-3 px-3 py-0.5 rounded text-center"
                                        style={{ backgroundColor: '#fff', border: '1px solid #ddd', fontSize: 10, color: '#888', fontFamily: 'DM Sans, sans-serif' }}>
                                        preview.riazify.com/template
                                    </div>
                                </div>
                                <iframe
                                    key={`${current.id}-${device}`}
                                    srcDoc={doc}
                                    sandbox="allow-same-origin"
                                    style={{ width: '100%', minHeight: 540, border: 'none', display: 'block' }}
                                    title="Template Preview"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Info panel */}
                    <div className="flex flex-col shrink-0 overflow-y-auto"
                        style={{ width: 260, borderLeft: `1px solid ${C.border}`, backgroundColor: C.bg }}>

                        {/* Stats */}
                        <div className="p-4 flex flex-col gap-3" style={{ borderBottom: `1px solid ${C.border}` }}>
                            <p className="text-[11px] font-bold uppercase tracking-wide"
                                style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                Template Info
                            </p>
                            {[
                                { icon: Hash, label: 'Characters', value: charCount.toLocaleString() },
                                { icon: FileText, label: 'Tags', value: (html.match(/<[^>]+>/g) ?? []).length.toLocaleString() },
                                { icon: Zap, label: 'Used', value: `${current.use_count ?? 0} times` },
                                { icon: Tag, label: 'Category', value: current.category ?? 'General' },
                                { icon: Code2, label: 'Type', value: current.is_system ? 'System Template' : 'Custom Template' },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Icon size={12} style={{ color: C.muted }} />
                                        <span className="text-[11px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                            {label}
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-semibold capitalize"
                                        style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Placeholders */}
                        <div className="p-4 flex flex-col gap-2" style={{ borderBottom: `1px solid ${C.border}` }}>
                            <p className="text-[11px] font-bold uppercase tracking-wide"
                                style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                Placeholders ({placeholders.length})
                            </p>
                            {placeholders.length === 0 ? (
                                <p className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                    No dynamic placeholders found
                                </p>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    {placeholders.map(ph => (
                                        <div key={ph}
                                            className="px-2 py-1 rounded-lg text-[10px] font-bold"
                                            style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                            {ph}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="p-4 flex flex-col gap-2">
                            {onEdit && (
                                <button onClick={() => { onClose(); onEdit(current) }}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:opacity-90"
                                    style={{ backgroundColor: C.primary, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                    <Pencil size={14} /> Edit in Visual Builder
                                </button>
                            )}
                            {onCopy && (
                                <button onClick={() => onCopy(current)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:opacity-80"
                                    style={{
                                        backgroundColor: isCopied ? C.successBg : C.surface,
                                        color: isCopied ? C.success : C.primary,
                                        border: `1px solid ${isCopied ? C.success : C.border}`,
                                        cursor: 'pointer',
                                        fontFamily: 'DM Sans, sans-serif',
                                    }}>
                                    {isCopied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy HTML</>}
                                </button>
                            )}
                            <button
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:opacity-90"
                                style={{ backgroundColor: C.accent, color: C.dark, border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                <Zap size={14} /> Use in Listing
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-between px-5 py-3 shrink-0"
                    style={{ borderTop: `1px solid ${C.border}` }}>
                    {/* Prev/Next */}
                    <div className="flex items-center gap-2">
                        <button onClick={goPrev} disabled={!hasPrev}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:opacity-80 disabled:opacity-30"
                            style={{ backgroundColor: C.bg, color: C.secondary, border: `1px solid ${C.border}`, cursor: hasPrev ? 'pointer' : 'not-allowed', fontFamily: 'DM Sans, sans-serif' }}>
                            <ChevronLeft size={13} /> Previous
                        </button>
                        <button onClick={goNext} disabled={!hasNext}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:opacity-80 disabled:opacity-30"
                            style={{ backgroundColor: C.bg, color: C.secondary, border: `1px solid ${C.border}`, cursor: hasNext ? 'pointer' : 'not-allowed', fontFamily: 'DM Sans, sans-serif' }}>
                            Next <ChevronRight size={13} />
                        </button>
                    </div>
                    <button onClick={onClose}
                        className="px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:opacity-80"
                        style={{ backgroundColor: C.bg, color: C.secondary, border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                        Close
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.96) translateY(8px); }
                    to   { opacity: 1; transform: scale(1)    translateY(0);   }
                }
            `}</style>
        </div>
    )
}
