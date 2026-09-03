'use client'
// app/dashboard/design/BlockLibraryTab.tsx

import { useState, useMemo } from 'react'
import { Search, Copy, Check, ChevronDown, ChevronUp, Eye, X, EyeOff } from 'lucide-react'
import { BLOCK_DEFINITIONS, BLOCK_CATEGORIES, getByCategory, createBlock } from '@/components/ui/VisualEditor/blocks'
import type { BlockCategory, BlockType } from '@/components/ui/VisualEditor/blocks'

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
}

const CAT_COLOURS: Record<string, string> = {
    Layout: '#7530fb',
    Content: '#2563eb',
    Product: '#16a34a',
    Media: '#d97706',
    'eBay Specific': '#dc2626',
    Conversion: '#0891b2',
    'Header & Footer': '#7c3aed',
    Typography: '#db2777',
}

function wrapForPreview(html: string): string {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#1f1d2e;background:#fff;overflow:hidden;}
img{max-width:100%;height:auto;}
table{border-collapse:collapse;}
</style></head><body>${html}</body></html>`
}

function safeToHtml(def: typeof BLOCK_DEFINITIONS[0]): string {
    try {
        const block = createBlock(def.type as BlockType)
        return def.toHtml(block.props, block.id)
    } catch {
        return `<div style="padding:12px;color:#9ca3af;font-size:12px;font-family:Arial">${def.label}</div>`
    }
}

export default function BlockLibraryTab() {
    const [search, setSearch] = useState('')
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [previewBlock, setPreviewBlock] = useState<string | null>(null)
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

    const filtered = useMemo(() => {
        if (!search) return BLOCK_DEFINITIONS
        const q = search.toLowerCase()
        return BLOCK_DEFINITIONS.filter(b =>
            b.label.toLowerCase().includes(q) ||
            b.description?.toLowerCase().includes(q) ||
            b.category.toLowerCase().includes(q)
        )
    }, [search])

    async function copyBlock(type: string) {
        try {
            const def = BLOCK_DEFINITIONS.find(b => b.type === type)
            if (!def) return
            const html = safeToHtml(def)
            await navigator.clipboard.writeText(html)
            setCopiedId(type)
            setTimeout(() => setCopiedId(null), 2000)
        } catch (e) {
            console.error('Copy failed', e)
        }
    }

    function toggleCategory(cat: string) {
        setCollapsed(prev => {
            const next = new Set(prev)
            next.has(cat) ? next.delete(cat) : next.add(cat)
            return next
        })
    }

    const previewDef = previewBlock ? BLOCK_DEFINITIONS.find(b => b.type === previewBlock) : null
    const previewHtml = previewDef ? wrapForPreview(safeToHtml(previewDef)) : ''

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>

            {/* Header */}
            <div className="px-6 pt-5 pb-4 shrink-0"
                style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="text-[20px] font-bold mb-0.5"
                            style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                            Block Library
                        </h1>
                        <p className="text-[12px]"
                            style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                            {BLOCK_DEFINITIONS.length} reusable HTML blocks — browse, preview and copy into your templates
                        </p>
                    </div>
                    {/* Search right corner */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl shrink-0"
                        style={{ border: `1px solid ${C.borderInput}`, backgroundColor: C.bg, width: 240 }}>
                        <Search size={13} style={{ color: C.muted, flexShrink: 0 }} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search blocks..."
                            className="flex-1 text-[12px] outline-none bg-transparent"
                            style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}
                        />
                        {search && (
                            <button onClick={() => setSearch('')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                <X size={12} style={{ color: C.muted }} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 min-h-0">

                {/* Block grid */}
                <div className="flex-1 overflow-y-auto px-6 py-5">

                    {search && filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Search size={24} style={{ color: C.border, marginBottom: 12 }} />
                            <p className="text-[14px] font-semibold"
                                style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                No blocks found for &quot;{search}&quot;
                            </p>
                        </div>
                    )}

                    {BLOCK_CATEGORIES.map(cat => {
                        const blocks = search
                            ? filtered.filter(b => b.category === cat)
                            : getByCategory(cat)
                        if (blocks.length === 0) return null
                        const isCollapsed = collapsed.has(cat)
                        const colour = CAT_COLOURS[cat] ?? C.primary

                        return (
                            <div key={cat} className="mb-8">
                                {/* Category header */}
                                <button
                                    onClick={() => toggleCategory(cat)}
                                    className="flex items-center gap-2 mb-4 w-full text-left hover:opacity-80 transition-all"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    <div className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: colour }} />
                                    <span className="text-[12px] font-bold uppercase tracking-wider"
                                        style={{ color: colour, fontFamily: 'DM Sans, sans-serif' }}>
                                        {cat}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                                        style={{ backgroundColor: C.bg, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                        {blocks.length}
                                    </span>
                                    <div style={{ flex: 1 }} />
                                    {isCollapsed
                                        ? <ChevronDown size={13} style={{ color: C.muted }} />
                                        : <ChevronUp size={13} style={{ color: C.muted }} />
                                    }
                                </button>

                                {!isCollapsed && (
                                    <div className="grid gap-3"
                                        style={{
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                        }}>
                                        {blocks.map(def => {
                                            const isCopied = copiedId === def.type
                                            const isPreviewing = previewBlock === def.type
                                            const previewDoc = wrapForPreview(safeToHtml(def))

                                            return (
                                                <div
                                                    key={def.type}
                                                    className="rounded-xl overflow-hidden flex flex-col transition-all"
                                                    style={{
                                                        border: `2px solid ${isPreviewing ? colour : C.border}`,
                                                        backgroundColor: C.surface,
                                                        boxShadow: isPreviewing
                                                            ? `0 4px 16px ${colour}30`
                                                            : '0 1px 3px rgba(117,48,251,0.04)',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => setPreviewBlock(isPreviewing ? null : def.type)}
                                                >
                                                    {/* Thumbnail */}
                                                    <div style={{
                                                        height: 110,
                                                        overflow: 'hidden',
                                                        backgroundColor: '#f8f7ff',
                                                        position: 'relative',
                                                    }}>
                                                        <iframe
                                                            srcDoc={previewDoc}
                                                            sandbox="allow-same-origin"
                                                            scrolling="no"
                                                            style={{
                                                                width: '400%',
                                                                height: '400%',
                                                                border: 'none',
                                                                pointerEvents: 'none',
                                                                transform: 'scale(0.25)',
                                                                transformOrigin: 'top left',
                                                                backgroundColor: '#fff',
                                                            }}
                                                            title={def.label}
                                                        />
                                                        {/* Overlay label if previewing */}
                                                        {isPreviewing && (
                                                            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold"
                                                                style={{ backgroundColor: colour, color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
                                                                PREVIEW
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Footer */}
                                                    <div className="px-2.5 py-2 flex items-center justify-between gap-1"
                                                        style={{ borderTop: `1px solid ${C.border}` }}>
                                                        <p className="text-[11px] font-semibold truncate"
                                                            style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                                                            {def.label}
                                                        </p>
                                                        <div className="flex items-center gap-0.5 shrink-0">
                                                            <button
                                                                onClick={e => { e.stopPropagation(); setPreviewBlock(isPreviewing ? null : def.type) }}
                                                                title={isPreviewing ? 'Close preview' : 'Preview'}
                                                                className="w-6 h-6 flex items-center justify-center rounded-lg transition-all hover:opacity-80"
                                                                style={{ backgroundColor: isPreviewing ? C.primaryLight : C.bg, border: 'none', cursor: 'pointer' }}>
                                                                {isPreviewing
                                                                    ? <EyeOff size={11} style={{ color: C.primary }} />
                                                                    : <Eye size={11} style={{ color: C.muted }} />
                                                                }
                                                            </button>
                                                            <button
                                                                onClick={e => { e.stopPropagation(); copyBlock(def.type) }}
                                                                title={isCopied ? 'Copied!' : 'Copy HTML'}
                                                                className="w-6 h-6 flex items-center justify-center rounded-lg transition-all hover:opacity-80"
                                                                style={{ backgroundColor: isCopied ? C.successBg : C.bg, border: 'none', cursor: 'pointer' }}>
                                                                {isCopied
                                                                    ? <Check size={11} style={{ color: C.success }} />
                                                                    : <Copy size={11} style={{ color: C.muted }} />
                                                                }
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Right: preview panel */}
                {previewBlock && previewDef && (
                    <div className="flex flex-col shrink-0"
                        style={{
                            width: 360,
                            borderLeft: `1px solid ${C.border}`,
                            backgroundColor: C.surface,
                            animation: 'slideIn 0.2s ease',
                        }}>

                        {/* Preview header */}
                        <div className="flex items-start justify-between px-4 py-3 shrink-0"
                            style={{ borderBottom: `1px solid ${C.border}` }}>
                            <div className="min-w-0 pr-2">
                                <p className="text-[13px] font-bold"
                                    style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                    {previewDef.label}
                                </p>
                                <p className="text-[11px] mt-0.5"
                                    style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                    {previewDef.description ?? `${previewDef.category} block`}
                                </p>
                                <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                                    style={{
                                        backgroundColor: `${CAT_COLOURS[previewDef.category] ?? C.primary}20`,
                                        color: CAT_COLOURS[previewDef.category] ?? C.primary,
                                        fontFamily: 'DM Sans, sans-serif',
                                    }}>
                                    {previewDef.category}
                                </span>
                            </div>
                            <button onClick={() => setPreviewBlock(null)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70 transition-all shrink-0"
                                style={{ backgroundColor: C.bg, border: 'none', cursor: 'pointer' }}>
                                <X size={13} style={{ color: C.muted }} />
                            </button>
                        </div>

                        {/* Preview iframe — full width, scrollable */}
                        <div className="flex-1 overflow-auto" style={{ backgroundColor: '#e8e8e8', padding: 12 }}>
                            <div style={{
                                backgroundColor: '#fff',
                                borderRadius: 8,
                                overflow: 'hidden',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                            }}>
                                <iframe
                                    key={previewBlock}
                                    srcDoc={previewHtml}
                                    sandbox="allow-same-origin"
                                    style={{ width: '100%', minHeight: 200, border: 'none', display: 'block' }}
                                    title={previewDef.label}
                                />
                            </div>
                        </div>

                        {/* Copy button */}
                        <div className="px-4 py-3 shrink-0"
                            style={{ borderTop: `1px solid ${C.border}` }}>
                            <button
                                onClick={() => copyBlock(previewBlock)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:opacity-90"
                                style={{
                                    backgroundColor: copiedId === previewBlock ? C.successBg : C.primary,
                                    color: copiedId === previewBlock ? C.success : '#fff',
                                    border: 'none', cursor: 'pointer',
                                    fontFamily: 'DM Sans, sans-serif',
                                }}>
                                {copiedId === previewBlock
                                    ? <><Check size={14} /> Copied to clipboard!</>
                                    : <><Copy size={14} /> Copy HTML</>
                                }
                            </button>
                            <p className="text-[10px] text-center mt-2"
                                style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                Paste into the HTML editor to use this block
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    )
}
