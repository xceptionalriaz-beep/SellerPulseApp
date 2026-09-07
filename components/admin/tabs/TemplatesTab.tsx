'use client'
// components/admin/tabs/TemplatesTab.tsx

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
    Search, X, Trash2, Eye, Loader2, Code2,
    Layers, Globe, EyeOff, RefreshCw, Check,
    LayoutTemplate, Filter, ChevronDown,
    Zap, BarChart2,
} from 'lucide-react'
import AiTemplateGenerator from '@/components/ui/AiTemplateGenerator'

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
    dark: '#1a2410',
    lime: '#8FFF00',
    border: '#E2E8F0',
    bg: '#F8FAFC',
    surface: '#ffffff',
    text: '#0F172A',
    muted: '#64748B',
    hint: '#94A3B8',
    danger: '#EF4444',
    dangerBg: '#FEF2F2',
    dangerBorder: '#FFCDD2',
    success: '#16A34A',
    successBg: '#F0FDF4',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
}

// ── Categories — matches actual DB category values ─────────────────────────
const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'clothing', label: 'Clothing & Fashion' },
    { id: 'home', label: 'Home & Garden' },
    { id: 'auto', label: 'Auto Parts' },
    { id: 'pets', label: 'Pets' },
    { id: 'sports', label: 'Sports & Outdoors' },
    { id: 'toys', label: 'Toys & Games' },
    { id: 'collectibles', label: 'Collectibles' },
    { id: 'books', label: 'Books & Media' },
    { id: 'general', label: 'General' },
]

// ── Types ──────────────────────────────────────────────────────────────────
interface ListingTemplate {
    id: string
    user_id: string | null
    name: string
    description: string | null
    category: string | null
    description_html: string | null
    is_system: boolean | null
    is_shared: boolean | null
    thumbnail_url: string | null
    use_count: number | null
    created_at: string | null
    updated_at: string | null
}

// ── Thumbnail ──────────────────────────────────────────────────────────────
function TemplateThumbnail({ html }: { html: string }) {
    const doc = html.trim().toLowerCase().startsWith('<!doctype') || html.trim().toLowerCase().startsWith('<html')
        ? html
        : `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#1f1d2e;background:#fff;padding:16px;}
h1{font-size:20px;font-weight:700;color:#1e1535;margin:0 0 8px;}
h2{font-size:15px;font-weight:700;color:#1e1535;margin:12px 0 5px;}
p{font-size:12px;color:#6b7280;margin:0 0 8px;}
table{width:100%;border-collapse:collapse;margin-bottom:10px;}
td,th{padding:6px 10px;border:1px solid #ede9fe;font-size:12px;text-align:left;}
th{background:#7530fb;color:#fff;font-weight:700;}
img{max-width:100%;height:auto;display:block;}
</style></head><body>${html}</body></html>`

    return (
        <div style={{ width: 60, height: 44, overflow: 'hidden', backgroundColor: '#f8f7ff', position: 'relative', borderRadius: 6, flexShrink: 0 }}>
            <iframe
                srcDoc={doc}
                sandbox="allow-same-origin"
                scrolling="no"
                style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '600px', height: '400px',
                    border: 'none', pointerEvents: 'none',
                    transform: 'scale(0.1)', transformOrigin: 'top left',
                    backgroundColor: '#fff',
                }}
                title="preview"
            />
        </div>
    )
}

// ── Category badge ─────────────────────────────────────────────────────────
function CategoryBadge({ category }: { category: string | null }) {
    const map: Record<string, { bg: string; text: string }> = {
        electronics: { bg: '#dbeafe', text: '#1d4ed8' },
        fashion: { bg: '#fce7f3', text: '#be185d' },
        clothing: { bg: '#fce7f3', text: '#be185d' },
        home: { bg: '#dcfce7', text: '#15803d' },
        auto: { bg: '#fef3c7', text: '#b45309' },
        pets: { bg: '#f3e8ff', text: '#7e22ce' },
        sports: { bg: '#e0f2fe', text: '#0369a1' },
        toys: { bg: '#fef9c3', text: '#a16207' },
        collectibles: { bg: '#fde8d0', text: '#c2410c' },
        books: { bg: '#e0f2fe', text: '#0c4a6e' },
        general: { bg: '#f1f5f9', text: '#475569' },
    }
    const cat = (category || 'general').toLowerCase()
    const style = map[cat] || map.general
    return (
        <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px',
            borderRadius: 20, backgroundColor: style.bg, color: style.text,
            fontFamily: 'DM Sans, sans-serif', textTransform: 'capitalize',
            whiteSpace: 'nowrap',
        }}>
            {cat}
        </span>
    )
}

// ── Confirm Delete Modal ───────────────────────────────────────────────────
function ConfirmDeleteModal({
    template, onConfirm, onCancel, deleting,
}: {
    template: ListingTemplate
    onConfirm: () => void
    onCancel: () => void
    deleting: boolean
}) {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={e => e.target === e.currentTarget && !deleting && onCancel()}>
            <div className="w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden"
                style={{ backgroundColor: C.surface, borderColor: C.dangerBorder }}>
                <div className="flex items-center gap-3 px-5 py-4"
                    style={{ backgroundColor: C.dangerBg, borderBottom: `1px solid ${C.dangerBorder}` }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: C.danger }}>
                        <Trash2 size={16} style={{ color: '#fff' }} />
                    </div>
                    <div>
                        <p className="text-[14px] font-bold" style={{ color: C.text }}>Delete Template</p>
                        <p className="text-[11px]" style={{ color: C.muted }}>This action cannot be undone</p>
                    </div>
                </div>
                <div className="px-5 py-4">
                    <p className="text-[13px]" style={{ color: C.muted }}>
                        Are you sure you want to delete{' '}
                        <span className="font-bold" style={{ color: C.text }}>"{template.name}"</span>?
                        {template.is_system && (
                            <span className="block mt-1 text-[12px]" style={{ color: C.danger }}>
                                ⚠ This is a published system template — deleting it removes it for all users.
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex gap-2 px-5 pb-5">
                    <button onClick={onCancel} disabled={deleting}
                        className="flex-1 py-2.5 rounded-xl border text-[13px] font-semibold transition-all"
                        style={{ borderColor: C.border, color: C.muted, backgroundColor: C.surface }}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={deleting}
                        className="flex-1 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all"
                        style={{ backgroundColor: C.danger, color: '#fff', border: 'none' }}>
                        {deleting
                            ? <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                            : <><Trash2 size={13} /> Delete</>
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Preview Modal ──────────────────────────────────────────────────────────
function PreviewModal({ template, onClose }: { template: ListingTemplate; onClose: () => void }) {
    const html = template.description_html || ''
    const doc = html.trim().toLowerCase().startsWith('<!doctype') || html.trim().toLowerCase().startsWith('<html')
        ? html
        : `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#1f1d2e;background:#fff;padding:20px;}
h1{font-size:22px;font-weight:700;color:#1e1535;margin:0 0 8px;padding-bottom:8px;border-bottom:3px solid #7530fb;}
h2{font-size:16px;font-weight:700;color:#1e1535;margin:16px 0 6px;padding-left:10px;border-left:3px solid #7530fb;}
p{font-size:13px;color:#6b7280;margin:0 0 8px;line-height:1.6;}
table{width:100%;border-collapse:collapse;margin-bottom:12px;}
td,th{padding:8px 12px;border:1px solid #ede9fe;font-size:13px;text-align:left;}
th{background:#7530fb;color:#fff;font-weight:700;}
tr:nth-child(even){background:#f8f7ff;}
img{max-width:100%;height:auto;display:block;border-radius:6px;margin-bottom:8px;}
</style></head><body>${html}</body></html>`

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, height: '85vh' }}>
                <div className="flex items-center justify-between px-5 py-3 shrink-0"
                    style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.bg }}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: C.primaryLight }}>
                            <Eye size={14} style={{ color: C.primary }} />
                        </div>
                        <div>
                            <p className="text-[14px] font-bold" style={{ color: C.text }}>{template.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <CategoryBadge category={template.category} />
                                <span className="text-[10px]" style={{ color: C.hint }}>
                                    {template.use_count || 0} uses
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:opacity-70"
                        style={{ backgroundColor: C.border, border: 'none', cursor: 'pointer' }}>
                        <X size={14} style={{ color: C.muted }} />
                    </button>
                </div>
                <div className="flex-1 overflow-hidden" style={{ backgroundColor: '#e8e8e8' }}>
                    {html ? (
                        <iframe
                            srcDoc={doc}
                            sandbox="allow-same-origin"
                            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                            title={template.name}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                            <LayoutTemplate size={32} style={{ color: C.hint }} />
                            <p className="text-[13px]" style={{ color: C.muted }}>No HTML content</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ── Main TemplatesTab ──────────────────────────────────────────────────────
export default function TemplatesTab() {
    const router = useRouter()
    // Use authenticated client — carries user session so RLS policies work
    const supabase = createClient()

    const [templates, setTemplates] = useState<ListingTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
    const [togglingId, setTogglingId] = useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ListingTemplate | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [previewTemplate, setPreviewTemplate] = useState<ListingTemplate | null>(null)
    const [showAiModal, setShowAiModal] = useState(false)
    const [successId, setSuccessId] = useState<string | null>(null)

    // ── Load ───────────────────────────────────────────────────────────────
    const loadTemplates = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error } = await (supabase as any)
                .from('listing_templates')
                .select('id, user_id, name, description, category, description_html, is_system, is_shared, thumbnail_url, use_count, created_at, updated_at')
                .order('created_at', { ascending: false })
            if (error) throw error
            setTemplates((data as ListingTemplate[]) || [])
        } catch (err) {
            console.error('[TemplatesTab] load error:', err)
            setTemplates([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadTemplates() }, [loadTemplates])

    // ── Stats ──────────────────────────────────────────────────────────────
    const total = templates.length
    const published = templates.filter(t => t.is_system).length
    const drafts = templates.filter(t => !t.is_system).length
    const totalUses = templates.reduce((sum, t) => sum + (t.use_count || 0), 0)

    // ── Filter ─────────────────────────────────────────────────────────────
    const filtered = templates.filter(t => {
        const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase())
        const matchStatus = statusFilter === 'all' ? true
            : statusFilter === 'published' ? !!t.is_system : !t.is_system
        // Strip non-alpha chars for fuzzy match e.g. "Home & Garden" matches "home"
        const dbCat = (t.category || '').toLowerCase().replace(/[^a-z]/g, '')
        const filterCat = categoryFilter.toLowerCase().replace(/[^a-z]/g, '')
        const matchCat = categoryFilter === 'all' || dbCat.includes(filterCat)
        return matchSearch && matchStatus && matchCat
    })

    // ── Publish / Unpublish ────────────────────────────────────────────────
    async function togglePublish(t: ListingTemplate) {
        setTogglingId(t.id)
        try {
            const newValue = !t.is_system
            const { error } = await (supabase as any)
                .from('listing_templates')
                .update({ is_system: newValue, updated_at: new Date().toISOString() })
                .eq('id', t.id)
            if (error) throw error
            setTemplates(prev => prev.map(x => x.id === t.id ? { ...x, is_system: newValue } : x))
            setSuccessId(t.id)
            setTimeout(() => setSuccessId(null), 2000)
        } catch (err) {
            console.error('[TemplatesTab] toggle error:', err)
        } finally {
            setTogglingId(null)
        }
    }

    // ── Delete ─────────────────────────────────────────────────────────────
    async function confirmDelete() {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            const { error } = await (supabase as any)
                .from('listing_templates')
                .delete()
                .eq('id', deleteTarget.id)
            if (error) throw error
            setTemplates(prev => prev.filter(t => t.id !== deleteTarget.id))
            setDeleteTarget(null)
        } catch (err) {
            console.error('[TemplatesTab] delete error:', err)
        } finally {
            setDeleting(false)
        }
    }

    // ── Format date ────────────────────────────────────────────────────────
    function formatDate(iso: string | null) {
        if (!iso) return '—'
        const d = new Date(iso)
        const diff = Date.now() - d.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        if (days === 0) return 'Today'
        if (days === 1) return 'Yesterday'
        if (days < 7) return `${days}d ago`
        if (days < 30) return `${Math.floor(days / 7)}w ago`
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col min-h-full" style={{ backgroundColor: C.bg }}>

            {/* ── Stats Bar ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 md:p-6"
                style={{ borderBottom: `1px solid ${C.border}` }}>
                {[
                    { label: 'Total Templates', value: total, icon: LayoutTemplate, isFirst: true },
                    { label: 'Published', value: published, icon: Globe, isFirst: false },
                    { label: 'Drafts', value: drafts, icon: EyeOff, isFirst: false },
                    { label: 'Total Uses', value: totalUses.toLocaleString(), icon: BarChart2, isFirst: false },
                ].map((stat, i) => {
                    const Icon = stat.icon
                    return (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border"
                            style={{
                                backgroundColor: stat.isFirst ? C.dark : C.surface,
                                borderColor: stat.isFirst ? 'transparent' : C.border,
                                boxShadow: stat.isFirst
                                    ? '0 4px 12px rgba(26,36,16,0.15)'
                                    : '0 1px 3px rgba(0,0,0,0.04)',
                            }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: stat.isFirst ? 'rgba(143,255,0,0.15)' : C.bg }}>
                                <Icon size={18} style={{ color: stat.isFirst ? C.lime : C.muted }} />
                            </div>
                            <div>
                                <p className="text-[22px] font-extrabold leading-none"
                                    style={{ color: stat.isFirst ? '#fff' : C.text }}>
                                    {loading ? '—' : stat.value}
                                </p>
                                <p className="text-[11px] font-semibold mt-0.5"
                                    style={{ color: stat.isFirst ? 'rgba(143,255,0,0.7)' : C.muted }}>
                                    {stat.label}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* ── Create Buttons ───────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3 px-4 md:px-6 py-4"
                style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.surface }}>
                <p className="text-[12px] font-bold" style={{ color: C.muted }}>CREATE:</p>

                {/* Fix #6 — added ?name= param to Visual Builder */}
                <button
                    onClick={() => router.push('/dashboard/design/html-editor?name=New+Template&admin=true')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all hover:opacity-80"
                    style={{ backgroundColor: C.primaryLight, color: C.primary, border: '1px solid #e9d5ff', fontFamily: 'DM Sans, sans-serif' }}>
                    <Code2 size={13} />
                    + HTML Editor
                </button>

                <button
                    onClick={() => router.push('/dashboard/design/visual-editor?name=New+Visual+Template&admin=true')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all hover:opacity-80"
                    style={{ backgroundColor: '#f0fdf4', color: C.success, border: '1px solid #bbf7d0', fontFamily: 'DM Sans, sans-serif' }}>
                    <Layers size={13} />
                    + Visual Builder
                </button>

                <button
                    onClick={() => setShowAiModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all hover:opacity-90"
                    style={{ backgroundColor: C.dark, color: C.lime, border: '1px solid rgba(143,255,0,0.3)', fontFamily: 'DM Sans, sans-serif' }}>
                    <Zap size={13} style={{ color: C.lime }} />
                    ✦ Generate with AI
                </button>

                <button
                    onClick={loadTemplates}
                    className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all hover:opacity-80"
                    style={{ backgroundColor: C.bg, color: C.muted, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                    <RefreshCw size={12} style={{ color: C.hint }} />
                    Refresh
                </button>
            </div>

            {/* ── Filters Bar ──────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-2 px-4 md:px-6 py-3"
                style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.surface }}>

                {/* Status pills */}
                <div className="flex items-center gap-1.5">
                    {(['all', 'published', 'draft'] as const).map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className="px-3 py-1.5 rounded-full text-[11px] font-bold capitalize transition-all"
                            style={{
                                backgroundColor: statusFilter === s ? C.dark : C.bg,
                                color: statusFilter === s ? C.lime : C.muted,
                                border: `1px solid ${statusFilter === s ? 'rgba(143,255,0,0.3)' : C.border}`,
                            }}>
                            {s === 'all' ? `All (${total})` : s === 'published' ? `Published (${published})` : `Draft (${drafts})`}
                        </button>
                    ))}
                </div>

                <div className="w-px h-5" style={{ backgroundColor: C.border }} />

                {/* Category dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowCategoryDropdown(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
                        style={{
                            backgroundColor: categoryFilter !== 'all' ? C.dark : C.bg,
                            color: categoryFilter !== 'all' ? C.lime : C.muted,
                            border: `1px solid ${categoryFilter !== 'all' ? 'rgba(143,255,0,0.3)' : C.border}`,
                        }}>
                        <Filter size={11} />
                        {categoryFilter === 'all' ? 'Category' : categoryFilter}
                        <ChevronDown size={11} style={{
                            transform: showCategoryDropdown ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s',
                        }} />
                    </button>
                    {showCategoryDropdown && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowCategoryDropdown(false)} />
                            <div className="absolute top-full left-0 mt-1.5 z-50 rounded-xl border overflow-hidden"
                                style={{ backgroundColor: C.surface, borderColor: C.border, boxShadow: '0 8px 24px rgba(0,0,0,0.10)', minWidth: 140 }}>
                                {CATEGORIES.map(cat => (
                                    <button key={cat.id}
                                        onClick={() => { setCategoryFilter(cat.id); setShowCategoryDropdown(false) }}
                                        className="w-full flex items-center justify-between px-3 py-2 text-left text-[12px] font-semibold transition-all hover:bg-gray-50"
                                        style={{ color: categoryFilter === cat.id ? C.text : C.muted, fontWeight: categoryFilter === cat.id ? 700 : 500 }}>
                                        {cat.label}
                                        {categoryFilter === cat.id && <Check size={11} style={{ color: C.success }} />}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl ml-auto transition-all"
                    style={{ border: `1px solid ${C.border}`, backgroundColor: C.bg, minWidth: 200 }}>
                    <Search size={12} style={{ color: C.hint, flexShrink: 0 }} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search templates..."
                        className="flex-1 text-[12px] outline-none bg-transparent"
                        style={{ color: C.text, fontFamily: 'DM Sans, sans-serif' }}
                    />
                    {search && (
                        <button onClick={() => setSearch('')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            <X size={11} style={{ color: C.hint }} />
                        </button>
                    )}
                </div>
            </div>

            {/* ── Table ────────────────────────────────────────────────── */}
            <div className="flex-1 px-4 md:px-6 py-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <Loader2 size={24} style={{ color: C.primary, animation: 'spin 1s linear infinite' }} />
                        <p className="text-[13px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                            Loading templates...
                        </p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                            <LayoutTemplate size={24} style={{ color: C.hint }} />
                        </div>
                        <p className="text-[15px] font-bold" style={{ color: C.text }}>No templates found</p>
                        <p className="text-[13px]" style={{ color: C.muted }}>
                            {search ? `No results for "${search}"` : 'Create your first template above'}
                        </p>
                    </div>
                ) : (
                    /* Fix #2 — horizontal scroll wrapper for mobile */
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <div style={{ minWidth: 780 }}>
                            <div className="rounded-2xl border overflow-hidden"
                                style={{ backgroundColor: C.surface, borderColor: C.border }}>

                                {/* Table header */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '56px 1fr 110px 100px 70px 110px 250px',
                                    padding: '10px 16px',
                                    borderBottom: `1px solid ${C.border}`,
                                    backgroundColor: C.bg,
                                }}>
                                    {['', 'Name', 'Category', 'Status', 'Uses', 'Created', 'Actions'].map((h, i) => (
                                        <span key={i} style={{
                                            fontSize: 10, fontWeight: 800, color: C.hint,
                                            textTransform: 'uppercase', letterSpacing: '0.06em',
                                            fontFamily: 'DM Sans, sans-serif',
                                        }}>
                                            {h}
                                        </span>
                                    ))}
                                </div>

                                {/* Table rows */}
                                {filtered.map((t, idx) => {
                                    const isToggling = togglingId === t.id
                                    const isSuccess = successId === t.id
                                    const isPublished = !!t.is_system

                                    return (
                                        <div key={t.id}
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '56px 1fr 110px 100px 70px 110px 250px',
                                                padding: '12px 16px',
                                                alignItems: 'center',
                                                borderBottom: idx < filtered.length - 1 ? `1px solid ${C.border}` : 'none',
                                                backgroundColor: C.surface,
                                                transition: 'background-color 0.1s',
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
                                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = C.surface)}
                                        >
                                            {/* Thumbnail */}
                                            <div>
                                                {t.description_html
                                                    ? <TemplateThumbnail html={t.description_html} />
                                                    : <div style={{ width: 60, height: 44, borderRadius: 6, backgroundColor: C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <LayoutTemplate size={16} style={{ color: C.hint }} />
                                                    </div>
                                                }
                                            </div>

                                            {/* Name */}
                                            <div style={{ minWidth: 0, paddingRight: 12 }}>
                                                <p style={{ fontSize: 13, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' }}>
                                                    {t.name}
                                                </p>
                                                {t.description && (
                                                    <p style={{ fontSize: 11, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2, fontFamily: 'DM Sans, sans-serif' }}>
                                                        {t.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Category */}
                                            <div><CategoryBadge category={t.category} /></div>

                                            {/* Status */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: isPublished ? C.success : C.hint, flexShrink: 0 }} />
                                                <span style={{ fontSize: 11, fontWeight: 700, color: isPublished ? C.success : C.muted }}>
                                                    {isPublished ? 'Published' : 'Draft'}
                                                </span>
                                            </div>

                                            {/* Uses */}
                                            <div>
                                                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                                                    {(t.use_count || 0).toLocaleString()}
                                                </span>
                                            </div>

                                            {/* Created */}
                                            <div>
                                                <span style={{ fontSize: 11, color: C.muted }}>
                                                    {formatDate(t.created_at)}
                                                </span>
                                            </div>

                                            {/* Actions */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

                                                {/* Preview */}
                                                <button onClick={() => setPreviewTemplate(t)} title="Preview"
                                                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', backgroundColor: C.bg, color: C.muted, border: `1px solid ${C.border}`, transition: 'opacity 0.15s' }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                                    <Eye size={11} />
                                                </button>

                                                {/* Edit in HTML Editor */}
                                                <button
                                                    onClick={() => router.push(`/dashboard/design/html-editor?id=${t.id}&name=${encodeURIComponent(t.name)}&admin=true`)}
                                                    title="Edit in HTML Editor"
                                                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', backgroundColor: C.primaryLight, color: C.primary, border: '1px solid #e9d5ff', transition: 'opacity 0.15s' }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                                    <Code2 size={11} />
                                                </button>

                                                {/* Edit in Visual Builder */}
                                                <button
                                                    onClick={() => router.push(`/dashboard/design/visual-editor?id=${t.id}&name=${encodeURIComponent(t.name)}&admin=true`)}
                                                    title="Edit in Visual Builder"
                                                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', backgroundColor: '#f0fdf4', color: C.success, border: '1px solid #bbf7d0', transition: 'opacity 0.15s' }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                                    <Layers size={11} />
                                                </button>

                                                {/* Publish / Unpublish — Fix #3: inline styles for spinner */}
                                                <button
                                                    onClick={() => togglePublish(t)}
                                                    disabled={isToggling}
                                                    title={isPublished ? 'Unpublish' : 'Publish'}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                                                        padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                                                        cursor: isToggling ? 'wait' : 'pointer', minWidth: 90,
                                                        transition: 'opacity 0.15s',
                                                        backgroundColor: isSuccess ? C.successBg : isPublished ? '#fef3c7' : C.dark,
                                                        color: isSuccess ? C.success : isPublished ? '#b45309' : C.lime,
                                                        border: isSuccess ? `1px solid #bbf7d0` : isPublished ? '1px solid #fde68a' : '1px solid rgba(143,255,0,0.3)',
                                                    }}>
                                                    {isToggling ? (
                                                        /* Fix #3 — pure inline spinner, no Tailwind border-t-current */
                                                        <div style={{
                                                            width: 12, height: 12, borderRadius: '50%',
                                                            border: '2px solid rgba(255,255,255,0.2)',
                                                            borderTopColor: isPublished ? '#b45309' : C.lime,
                                                            animation: 'spin 0.8s linear infinite',
                                                        }} />
                                                    ) : isSuccess ? (
                                                        <><Check size={11} /> Done</>
                                                    ) : isPublished ? (
                                                        <><EyeOff size={11} /> Unpublish</>
                                                    ) : (
                                                        <><Globe size={11} /> Publish</>
                                                    )}
                                                </button>

                                                {/* Delete */}
                                                <button onClick={() => setDeleteTarget(t)} title="Delete"
                                                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', backgroundColor: C.dangerBg, color: C.danger, border: `1px solid ${C.dangerBorder}`, transition: 'opacity 0.15s' }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                                    <Trash2 size={11} />
                                                </button>

                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Result count */}
                {!loading && filtered.length > 0 && (
                    <p className="mt-3 text-[11px]" style={{ color: C.hint, fontFamily: 'DM Sans, sans-serif' }}>
                        Showing {filtered.length} of {total} templates
                    </p>
                )}
            </div>

            {/* ── Modals ───────────────────────────────────────────────── */}
            {deleteTarget && (
                <ConfirmDeleteModal
                    template={deleteTarget}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                    deleting={deleting}
                />
            )}

            {previewTemplate && (
                <PreviewModal
                    template={previewTemplate}
                    onClose={() => setPreviewTemplate(null)}
                />
            )}

            {/* Fix #4 & #5 — AI Generator routes to html-editor with ?admin=true
                The html-editor needs to check this param and save with
                user_id: null, is_system: false (as admin draft) */}
            <AiTemplateGenerator
                open={showAiModal}
                isAdmin={true}
                onClose={() => setShowAiModal(false)}
                onImport={(html, name, cat) => {
                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem('ai_template_html', html)
                        sessionStorage.setItem('ai_template_name', name)
                        sessionStorage.setItem('ai_template_category', cat)
                    }
                    router.push(`/dashboard/design/html-editor?name=${encodeURIComponent(name)}&from=ai&admin=true`)
                }}
            />

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                ::-webkit-scrollbar { width: 4px; height: 4px; }
                ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }
            `}</style>
        </div>
    )
}
