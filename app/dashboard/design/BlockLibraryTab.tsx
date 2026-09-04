'use client'
// app/dashboard/design/BlockLibraryTab.tsx

import { useState, useMemo } from 'react'
import { Search, Copy, Check, Eye, EyeOff, X } from 'lucide-react'
import { BLOCK_DEFINITIONS, BLOCK_CATEGORIES, getByCategory, createBlock } from '@/components/ui/VisualEditor/blocks'
import type { BlockCategory, BlockType } from '@/components/ui/VisualEditor/blocks'

const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    borderInput: '#e3dff1',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    success: '#16a34a',
    successBg: '#dcfce7',
}

const CATEGORY_COLORS: Record<string, string> = {
    'Layout': '#7530fb',
    'Content': '#0ea5e9',
    'Product': '#16a34a',
    'Media': '#d97706',
    'eBay Specific': '#dc2626',
    'Conversion': '#0891b2',
    'Header & Footer': '#7c3aed',
    'Typography': '#db2777',
}

// Short labels for tabs
const CAT_SHORT: Record<string, string> = {
    Layout: 'Layout',
    Content: 'Content',
    Product: 'Product',
    Media: 'Media',
    'eBay Specific': 'eBay',
    Conversion: 'Conversion',
    'Header & Footer': 'Header',
    Typography: 'Typography',
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
    const [activeCategory, setActiveCategory] = useState<BlockCategory>(BLOCK_CATEGORIES[0])
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [previewBlock, setPreviewBlock] = useState<string | null>(null)

    // Pre-compute ALL block HTML once at mount
    const blockHtmlMap = useMemo(() => {
        const map: Record<string, string> = {}
        for (const def of BLOCK_DEFINITIONS) {
            try { map[def.type] = wrapForPreview(safeToHtml(def)) } catch { map[def.type] = '' }
        }
        return map
    }, [])

    // Blocks to show — if searching show all matches, else show active category
    const visibleBlocks = useMemo(() => {
        if (search.trim()) {
            const q = search.toLowerCase()
            return BLOCK_DEFINITIONS.filter(b =>
                b.label.toLowerCase().includes(q) ||
                b.description?.toLowerCase().includes(q) ||
                b.category.toLowerCase().includes(q)
            )
        }
        return getByCategory(activeCategory)
    }, [search, activeCategory])

    const previewDef = previewBlock ? BLOCK_DEFINITIONS.find(b => b.type === previewBlock) : null
    const previewHtml = previewBlock ? (blockHtmlMap[previewBlock] ?? '') : ''
    const colour = previewDef ? (CATEGORY_COLORS[previewDef.category] ?? C.primary) : C.primary

    async function copyBlock(type: string) {
        try {
            const def = BLOCK_DEFINITIONS.find(b => b.type === type)
            if (!def) return
            const html = safeToHtml(def)
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(html)
            } else {
                const ta = document.createElement('textarea')
                ta.value = html
                ta.style.cssText = 'position:fixed;opacity:0;'
                document.body.appendChild(ta)
                ta.focus(); ta.select()
                document.execCommand('copy')
                document.body.removeChild(ta)
            }
            setCopiedId(type)
            setTimeout(() => setCopiedId(null), 2000)
        } catch (e) {
            console.error('Copy failed', e)
        }
    }

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>

            {/* Header */}
            <div className="px-6 pt-5 pb-3 shrink-0"
                style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-[20px] font-bold mb-0.5"
                            style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                            Block Library
                        </h1>
                        <p className="text-[12px]"
                            style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                            {BLOCK_DEFINITIONS.length} blocks — click to preview, copy HTML into your template
                        </p>
                    </div>
                    {/* Search */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl shrink-0"
                        style={{ border: `1px solid ${C.borderInput}`, backgroundColor: C.bg, width: 220 }}>
                        <Search size={13} style={{ color: C.muted, flexShrink: 0 }} />
                        <input
                            value={search}
                            onChange={e => { setSearch(e.target.value); }}
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

                {/* Category tabs */}
                {!search && (
                    <div className="flex items-center gap-1 overflow-x-auto pb-0.5"
                        style={{ scrollbarWidth: 'none' }}>
                        {BLOCK_CATEGORIES.map((cat: BlockCategory) => {
                            const active = activeCategory === cat
                            const colour = CATEGORY_COLORS[cat] ?? C.primary
                            const count = getByCategory(cat).length
                            return (
                                <button key={cat} onClick={() => { setActiveCategory(cat); setPreviewBlock(null) }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg shrink-0 transition-all hover:opacity-90"
                                    style={{
                                        backgroundColor: active ? colour : 'transparent',
                                        border: `1.5px solid ${active ? colour : C.border}`,
                                        cursor: 'pointer',
                                    }}>
                                    <span className="text-[12px] font-semibold"
                                        style={{ color: active ? '#fff' : C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                        {CAT_SHORT[cat] ?? cat}
                                    </span>
                                    <span className="text-[10px] font-bold px-1 rounded-full"
                                        style={{
                                            backgroundColor: active ? 'rgba(255,255,255,0.25)' : C.bg,
                                            color: active ? '#fff' : C.muted,
                                            fontFamily: 'DM Sans, sans-serif',
                                        }}>
                                        {count}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* Search result count */}
                {search && (
                    <p className="text-[12px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                        {visibleBlocks.length} result{visibleBlocks.length !== 1 ? 's' : ''} for &quot;{search}&quot;
                    </p>
                )}
            </div>

            {/* Grid + Preview panel */}
            <div className="flex flex-1 min-h-0">

                {/* Block grid */}
                <div className="flex-1 overflow-y-auto px-6 py-5">

                    {visibleBlocks.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Search size={24} style={{ color: C.border, marginBottom: 12 }} />
                            <p className="text-[14px] font-semibold"
                                style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                No blocks found for &quot;{search}&quot;
                            </p>
                            <p className="text-[12px] mt-1"
                                style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                Try a different keyword
                            </p>
                        </div>
                    )}

                    {visibleBlocks.length > 0 && (
                        <>
                            {search && (
                                <p className="text-[11px] font-bold uppercase tracking-wider mb-3"
                                    style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                    Search Results
                                </p>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                {visibleBlocks.map(def => {
                                    const isCopied = copiedId === def.type
                                    const isPreviewing = previewBlock === def.type
                                    const catColour = CATEGORY_COLORS[def.category] ?? C.primary
                                    const previewDoc = blockHtmlMap[def.type] ?? ''

                                    return (
                                        <div key={def.type}
                                            className="rounded-xl overflow-hidden flex flex-col transition-all"
                                            style={{
                                                border: `2px solid ${isPreviewing ? catColour : C.border}`,
                                                backgroundColor: C.surface,
                                                boxShadow: isPreviewing
                                                    ? `0 4px 16px ${catColour}30`
                                                    : '0 1px 3px rgba(117,48,251,0.04)',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => setPreviewBlock(isPreviewing ? null : def.type)}>

                                            {/* Thumbnail */}
                                            <div style={{ height: 160, overflow: 'hidden', backgroundColor: '#f8f7ff', position: 'relative' }}>
                                                <iframe
                                                    srcDoc={previewDoc}
                                                    sandbox="allow-same-origin"
                                                    scrolling="no"
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0, left: 0,
                                                        width: '700px',
                                                        height: '320px',
                                                        border: 'none',
                                                        pointerEvents: 'none',
                                                        transform: 'scale(0.43)',
                                                        transformOrigin: 'top left',
                                                        backgroundColor: '#fff',
                                                    }}
                                                    title={def.label}
                                                />
                                                {isPreviewing && (
                                                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold"
                                                        style={{ backgroundColor: catColour, color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
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
                        </>
                    )}
                </div>

                {/* Preview panel — fixed overlay */}
                {previewBlock && previewDef && (
                    <div className="flex flex-col shrink-0"
                        style={{
                            position: 'fixed',
                            right: 0, top: 0, bottom: 0,
                            width: 340,
                            borderLeft: `1px solid ${C.border}`,
                            backgroundColor: C.surface,
                            zIndex: 40,
                            boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
                            animation: 'slideIn 0.2s ease',
                        }}>

                        {/* Panel header */}
                        <div className="flex items-center justify-between px-4 py-3 shrink-0"
                            style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.bg }}>
                            <div>
                                <p className="text-[13px] font-bold"
                                    style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                    {previewDef.label}
                                </p>
                                <p className="text-[11px]"
                                    style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                    {previewDef.description ?? `${previewDef.category} block`}
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: `${colour}20`, color: colour, fontFamily: 'DM Sans, sans-serif' }}>
                                    {previewDef.category}
                                </span>
                                <button onClick={() => setPreviewBlock(null)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:opacity-70 transition-all"
                                    style={{ backgroundColor: C.border, border: 'none', cursor: 'pointer' }}>
                                    <X size={13} style={{ color: C.secondary }} />
                                </button>
                            </div>
                        </div>

                        {/* Preview iframe */}
                        <div className="flex-1 overflow-hidden" style={{ backgroundColor: '#e8e8e8' }}>
                            <iframe
                                key={previewBlock}
                                srcDoc={previewHtml}
                                sandbox="allow-same-origin"
                                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                                title={previewDef.label}
                            />
                        </div>

                        {/* Copy button */}
                        <div className="p-4 shrink-0" style={{ borderTop: `1px solid ${C.border}` }}>
                            <button
                                onClick={() => copyBlock(previewBlock)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:opacity-90"
                                style={{
                                    backgroundColor: copiedId === previewBlock ? C.success : colour,
                                    color: '#fff', border: 'none', cursor: 'pointer',
                                    fontFamily: 'DM Sans, sans-serif',
                                }}>
                                {copiedId === previewBlock
                                    ? <><Check size={14} /> Copied to clipboard!</>
                                    : <><Copy size={14} /> Copy HTML</>
                                }
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                ::-webkit-scrollbar { width: 4px; height: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #ede9fe; border-radius: 2px; }
            `}</style>
        </div>
    )
}
