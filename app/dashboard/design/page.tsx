'use client'
// app/dashboard/design/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Design Studio · Listing Template Gallery
//
//   ✓ Browse pre-made system templates (is_system = true)
//   ✓ My Templates (user_id = auth.uid())
//   ✓ Category filter pills
//   ✓ Search bar
//   ✓ Sort: Popular / Newest
//   ✓ Live HTML preview thumbnails (scaled like DescriptionLibrary)
//   ✓ AI Template Generator modal
//   ✓ Custom HTML Builder modal
//   ✓ Save template to listing_templates
//   ✓ Delete own templates
//   ✓ Copy template HTML to clipboard
//   ✓ Full-screen preview modal
//   ✓ Fully mobile responsive
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { createClient as createRawClient } from '@supabase/supabase-js'
import {
    Plus, Search, X, Copy, Trash2,
    Eye, Check, Loader2, Code2, Zap,
    Save, RefreshCw, LayoutTemplate, Layers, Pencil,
} from 'lucide-react'
import { sanitiseHtml } from '@/components/ui/EditorToolbar'
import { AIButton, PrimaryButton, SecondaryButton, GhostButton, IconButton } from '@/components/ui/Buttons'
import ProDropdown from '@/components/ui/ProDropdown'
import type { DropdownOption } from '@/components/ui/ProDropdown'
import TemplatePreviewModal from '@/components/ui/TemplatePreviewModal'
import BlockLibraryTab from './BlockLibraryTab'
import StudioSettings from './StudioSettings'
import AiTemplateGenerator from '@/components/ui/AiTemplateGenerator'

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    borderInput: '#e5e0f5',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    primaryHover: '#6020e0',
    accent: '#b8fa33',
    accentText: '#1e1535',
    dark: '#1e1535',
    darkHover: '#2d1f4e',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    success: '#16a34a',
    successBg: '#dcfce7',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
    warning: '#d97706',
    warningBg: '#fef3c7',
}

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

// ── Category definitions ───────────────────────────────────────────────────
const CATEGORIES = [
    { id: 'all', label: 'All Templates' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'fashion', label: 'Fashion & Beauty' },
    { id: 'home', label: 'Home & Garden' },
    { id: 'auto', label: 'Auto Parts' },
    { id: 'pets', label: 'Pet Supplies' },
    { id: 'sports', label: 'Sports & Outdoors' },
    { id: 'toys', label: 'Toys & Games' },
    { id: 'general', label: 'General' },
]

// ── Sort options for ProDropdown ───────────────────────────────────────────
const SORT_OPTIONS: DropdownOption[] = [
    { val: 'popular', label: 'Popular', enabled: true },
    { val: 'newest', label: 'Newest', enabled: true },
]

// ── Built-in system templates (shown when DB has none) ─────────────────────
// ── Tiny HTML thumbnail preview ────────────────────────────────────────────
function TemplateThumbnail({ html }: { html: string }) {
    const doc = html.trim().toLowerCase().startsWith('<!doctype') || html.trim().toLowerCase().startsWith('<html')
        ? html
        : `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.7; color: #1f1d2e; background: #fff; padding: 20px; }
  h1 { font-size: 22px; font-weight: 700; color: #1e1535; margin: 0 0 8px; padding-bottom: 8px; border-bottom: 3px solid #7530fb; }
  h2 { font-size: 16px; font-weight: 700; color: #1e1535; margin: 16px 0 6px; padding-left: 10px; border-left: 3px solid #7530fb; }
  h3 { font-size: 14px; font-weight: 700; color: #1e1535; margin: 12px 0 4px; }
  p  { font-size: 13px; color: #6b7280; margin: 0 0 8px; line-height: 1.6; }
  ul, ol { padding-left: 18px; margin: 0 0 8px; }
  li { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  td, th { padding: 8px 12px; border: 1px solid #ede9fe; font-size: 13px; text-align: left; }
  th { background: #7530fb; color: #fff; font-weight: 700; }
  tr:nth-child(even) { background: #f8f7ff; }
  img { max-width: 100%; height: auto; display: block; border-radius: 6px; margin-bottom: 8px; }
  .placeholder { display: inline-block; background: #f3eeff; color: #7530fb; padding: 1px 6px; border-radius: 4px; font-size: 11px; font-family: monospace; }
</style>
</head>
<body>${html}</body>
</html>`

    return (
        <div style={{ width: '100%', height: 420, overflow: 'hidden', backgroundColor: '#ffffff', position: 'relative' }}>
            <iframe
                srcDoc={doc}
                sandbox="allow-same-origin"
                scrolling="no"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '700px',
                    height: '840px',
                    border: 'none',
                    pointerEvents: 'none',
                    transform: 'scale(0.5)',
                    transformOrigin: 'top left',
                    backgroundColor: '#ffffff',
                }}
                title="Template Preview"
            />
        </div>
    )
}

// ── Category badge colours ─────────────────────────────────────────────────
function CategoryBadge({ category }: { category: string | null }) {
    const map: Record<string, { bg: string; text: string }> = {
        electronics: { bg: '#dbeafe', text: '#1d4ed8' },
        fashion: { bg: '#fce7f3', text: '#be185d' },
        home: { bg: '#dcfce7', text: '#15803d' },
        auto: { bg: '#fef3c7', text: '#b45309' },
        pet: { bg: '#f3e8ff', text: '#7e22ce' },
        sports: { bg: '#e0f2fe', text: '#0369a1' },
        toys: { bg: '#fef9c3', text: '#a16207' },
        general: { bg: '#f1f5f9', text: '#475569' },
    }
    const cat = (category || 'general').toLowerCase()
    const style = map[cat] || map.general
    return (
        <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px',
            borderRadius: 20, backgroundColor: style.bg, color: style.text,
            fontFamily: 'DM Sans, sans-serif', textTransform: 'capitalize',
        }}>
            {cat}
        </span>
    )
}

// ── Main Page ──────────────────────────────────────────────────────────────
// Untyped client — listing_templates is not yet in the Database type
const rawDb = createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DesignStudioPage() {
    return (
        <Suspense fallback={null}>
            <DesignStudioInner />
        </Suspense>
    )
}

function DesignStudioInner() {
    const supabase = createClient()
    const searchParams = useSearchParams()
    const router = useRouter()
    const activeTab = (searchParams.get('tab') || 'templates') as 'templates' | 'library' | 'my-templates' | 'settings'

    // ── State ──────────────────────────────────────────────────────────────
    const [templates, setTemplates] = useState<ListingTemplate[]>([])
    const [myTemplates, setMyTemplates] = useState<ListingTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState('all')
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState<'popular' | 'newest'>('popular')
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Preview modal
    const [previewTemplate, setPreviewTemplate] = useState<ListingTemplate | null>(null)

    // AI Generator modal
    const [showAiModal, setShowAiModal] = useState(false)
    const [aiHtml, setAiHtml] = useState('')
    const [aiTemplateName, setAiTemplateName] = useState('')
    const [aiCategory, setAiCategory] = useState('general')

    // Custom HTML Builder modal
    const [showBuilderModal, setShowBuilderModal] = useState(false)
    const [builderHtml, setBuilderHtml] = useState('')
    const [builderName, setBuilderName] = useState('')
    const [builderCategory, setBuilderCategory] = useState('general')
    const [builderSaving, setBuilderSaving] = useState(false)
    const [builderSaved, setBuilderSaved] = useState(false)
    const [builderPreview, setBuilderPreview] = useState(false)


    // ── Load templates ─────────────────────────────────────────────────────
    const loadTemplates = useCallback(async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            // System templates
            const { data: sys } = await rawDb
                .from('listing_templates')
                .select('id, user_id, name, description, category, description_html, is_system, is_shared, thumbnail_url, use_count, created_at, updated_at')
                .eq('is_system', true)
                .order('use_count', { ascending: false })

            // User's own templates
            let own: ListingTemplate[] = []
            if (user) {
                const { data: ownData } = await rawDb
                    .from('listing_templates')
                    .select('id, user_id, name, description, category, description_html, is_system, is_shared, thumbnail_url, use_count, created_at, updated_at')
                    .eq('user_id', user.id)
                    .eq('is_system', false)
                    .order('created_at', { ascending: false })
                own = (ownData as ListingTemplate[]) || []
            }

            const sysTemplates = (sys as ListingTemplate[]) || []
            setTemplates(sysTemplates)
            setMyTemplates(own)
        } catch (err) {
            console.error('[design] load error:', err)
            setTemplates([])
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => { loadTemplates() }, [loadTemplates])

    // ── Filter + search ────────────────────────────────────────────────────
    // allVisible is tab-aware — template gallery = admin only, my templates = user only
    const allVisible = activeTab === 'my-templates' ? myTemplates : templates

    const filtered = allVisible.filter(t => {
        const matchCat = activeCategory === 'all' || t.category?.toLowerCase() === activeCategory
        const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
            (t.description || '').toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
    })
    // System templates only — sorted
    const sortedTemplates = templates.filter(t => {
        const matchCat = activeCategory === 'all' || t.category?.toLowerCase() === activeCategory
        const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
    }).sort((a, b) => {
        if (sort === 'popular') return (b.use_count || 0) - (a.use_count || 0)
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    })

    const sorted = [...filtered].sort((a, b) => {
        if (sort === 'popular') return (b.use_count || 0) - (a.use_count || 0)
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    })

    // ── Copy HTML ──────────────────────────────────────────────────────────
    async function copyHtml(t: ListingTemplate) {
        if (!t.description_html) return
        await navigator.clipboard.writeText(t.description_html)
        setCopiedId(t.id)
        setTimeout(() => setCopiedId(null), 2000)
        // bump use_count if it's a real DB template
        if (t.id) {
            await rawDb.from('listing_templates')
                .update({ use_count: (t.use_count || 0) + 1 })
                .eq('id', t.id)
        }
    }

    // ── Duplicate template ─────────────────────────────────────────────────
    async function duplicateTemplate(t: ListingTemplate) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const newName = `${t.name} (Copy)`
        await rawDb.from('listing_templates').insert({
            user_id: user.id,
            name: newName,
            category: t.category,
            description: t.description,
            description_html: t.description_html,
            is_system: false,
            is_shared: false,
            use_count: 0,
            created_at: new Date().toISOString(),
        })
        loadTemplates()
    }

    // ── Delete own template ────────────────────────────────────────────────
    async function deleteTemplate(id: string) {
        // Guard: only delete own templates, never system ones
        const isSystem = [...templates].some(t => t.id === id)
        if (isSystem) return
        setDeletingId(id)
        await rawDb.from('listing_templates').delete().eq('id', id)
        setMyTemplates((prev: ListingTemplate[]) => prev.filter((t: ListingTemplate) => t.id !== id))
        setDeletingId(null)
    }

    // ── AI Generate ────────────────────────────────────────────────────────


    // ── Save custom HTML template ──────────────────────────────────────────
    async function saveBuilderTemplate() {
        if (!builderHtml || !builderName) return
        setBuilderSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')
            const { data, error } = await rawDb.from('listing_templates').insert({
                user_id: user.id,
                name: builderName,
                description: 'Custom HTML template',
                category: builderCategory,
                description_html: sanitiseHtml(builderHtml),
                is_system: false,
                is_shared: false,
                use_count: 0,
            }).select().single()
            if (error) throw error
            setMyTemplates((prev: ListingTemplate[]) => [data as ListingTemplate, ...prev])
            setBuilderSaved(true)
            setTimeout(() => { setShowBuilderModal(false); setBuilderSaved(false); setBuilderHtml(''); setBuilderName('') }, 1200)
        } catch (err) {
            console.error('[design] save builder template:', err)
        } finally {
            setBuilderSaving(false)
        }
    }

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col min-h-full" style={{ backgroundColor: C.bg }}>

            {/* Templates Gallery */}

            {/* Header — only on templates/my-templates tabs */}
            {(activeTab === 'templates' || activeTab === 'my-templates') && (
                <div className="px-4 md:px-8 pt-6 pb-4" style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>

                    {/* Title row */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <h1 className="text-[22px] md:text-[26px] font-bold mb-1" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                {activeTab === 'my-templates' ? 'My Templates' : 'Listing Template Gallery'}
                            </h1>
                            <p className="text-[13px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                {activeTab === 'my-templates' ? 'Your saved custom templates — edit, copy or delete anytime.' : <span>Select a <span style={{ color: C.primary, fontWeight: 600 }}>high-converting</span>, mobile-responsive eBay template or start from scratch.</span>}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => router.push('/dashboard/design/html-editor?name=New+Template')}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold transition-all hover:opacity-90"
                                style={{ backgroundColor: C.primary, color: '#ffffff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                <Plus size={14} /> New Template
                            </button>
                        </div>
                    </div>

                    {/* Quick-action cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">

                        {/* Custom HTML Builder card */}
                        <div className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all hover:shadow-md"
                            style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface }}
                            onClick={() => router.push('/dashboard/design/html-editor?name=New+Template')}>
                            <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                                style={{ backgroundColor: C.primaryLight }}>
                                <Code2 size={16} style={{ color: C.primary }} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[14px] font-bold mb-0.5" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>Custom HTML Builder</p>
                                <p className="text-[12px] leading-relaxed" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                    Create, paste, or edit custom HTML/CSS code directly with live active content checks.
                                </p>
                                <button className="mt-2 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                                    style={{ border: `1px solid ${C.primary}`, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                    + Create Blank
                                </button>
                            </div>
                        </div>

                        {/* AI Template Converter card */}
                        <div className="flex items-start gap-3 p-4 rounded-xl"
                            style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface }}>
                            <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                                style={{ backgroundColor: '#f3e8ff' }}>
                                <Zap size={16} style={{ color: '#7e22ce' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[14px] font-bold mb-0.5" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>AI Template Generator</p>
                                <p className="text-[12px] leading-relaxed mb-2" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                    Describe what you need. AI generates a full HTML template instantly.
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        placeholder="e.g. Professional template for vintage electronics..."
                                        className="flex-1 text-[12px] px-3 py-1.5 rounded-lg outline-none transition-all"
                                        style={{
                                            border: `1px solid ${C.borderInput}`, backgroundColor: C.surface,
                                            color: C.body, fontFamily: 'DM Sans, sans-serif',
                                        }}
                                        onFocus={e => e.currentTarget.style.borderColor = C.primary}
                                        onBlur={e => e.currentTarget.style.borderColor = C.borderInput}
                                        onKeyDown={e => { if (e.key === 'Enter') setShowAiModal(true) }}
                                    />
                                    <AIButton onClick={() => setShowAiModal(true)}>
                                        Generate
                                    </AIButton>
                                </div>
                            </div>
                        </div>

                        {/* Visual Drag-&-Drop Builder card */}
                        <div className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all hover:shadow-md"
                            style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface }}
                            onClick={() => router.push('/dashboard/design/visual-editor?name=New+Visual+Template')}>
                            <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                                style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                                <Layers size={16} style={{ color: '#16a34a' }} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <p className="text-[14px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                        Visual Drag-&amp;-Drop Builder
                                    </p>
                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: C.accent, color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                                        NEW
                                    </span>
                                </div>
                                <p className="text-[12px] leading-relaxed" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                    Build eBay listings visually — no code needed. Drag blocks, customise styles and publish.
                                </p>
                                <button className="mt-2 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                                    style={{ backgroundColor: C.dark, color: C.accent, fontFamily: 'DM Sans, sans-serif', border: 'none' }}>
                                    + Open Builder
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )} {/* end header */}

            {/* Filters bar — only on templates/my-templates tabs */}
            {(activeTab === 'templates' || activeTab === 'my-templates') && (
                <div className="px-4 md:px-8 py-3 flex flex-col sm:flex-row sm:items-center gap-3"
                    style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>

                    {/* Category pills — scrollable on mobile */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 flex-1" style={{ scrollbarWidth: 'none' }}>
                        {CATEGORIES.map(cat => {
                            const count = cat.id === 'all'
                                ? allVisible.length
                                : allVisible.filter(t => t.category?.toLowerCase() === cat.id).length
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold shrink-0 transition-all"
                                    style={{
                                        backgroundColor: activeCategory === cat.id ? C.primary : C.bg,
                                        color: activeCategory === cat.id ? '#fff' : C.secondary,
                                        border: `1px solid ${activeCategory === cat.id ? C.primary : C.border}`,
                                        fontFamily: 'DM Sans, sans-serif',
                                    }}>
                                    {cat.label}
                                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                                        style={{
                                            backgroundColor: activeCategory === cat.id ? 'rgba(255,255,255,0.25)' : C.border,
                                            color: activeCategory === cat.id ? '#fff' : C.muted,
                                        }}>
                                        {count}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Search + Sort */}
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
                            style={{ border: `1px solid ${C.borderInput}`, backgroundColor: C.surface }}>
                            <Search size={13} style={{ color: C.muted }} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search templates..."
                                className="text-[12px] outline-none bg-transparent w-36"
                                style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}
                            />
                        </div>

                        {/* Sort dropdown */}
                        <ProDropdown
                            prefix="Sort:"
                            currentValue={sort}
                            options={SORT_OPTIONS}
                            onChanged={(v) => setSort(v as 'popular' | 'newest')}
                            width={140}
                        />
                    </div>
                </div>
            )} {/* end filters bar */}

            {/* Block Library Tab or Settings Tab or Template Grid */}
            {activeTab === 'library' ? (
                <div className="flex-1 min-h-0 overflow-hidden">
                    <BlockLibraryTab />
                </div>
            ) : activeTab === 'settings' ? (
                <div className="flex-1 min-h-0 overflow-hidden">
                    <StudioSettings />
                </div>
            ) : (
                <div className="flex-1 p-4 md:p-8">

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <Loader2 size={24} style={{ color: C.primary, animation: 'spin 1s linear infinite' }} />
                            <p className="text-[13px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Loading templates...</p>
                            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : sorted.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: C.primaryLight }}>
                                <LayoutTemplate size={24} style={{ color: C.primary }} />
                            </div>
                            <p className="text-[15px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>No templates found</p>
                            <p className="text-[13px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                {search ? `No results for "${search}"` : 'Try a different category or create your own'}
                            </p>
                            <AIButton onClick={() => setShowAiModal(true)}>Generate with AI</AIButton>
                        </div>
                    ) : (
                        <>
                            {/* My Templates section */}
                            {activeTab === 'my-templates' && myTemplates.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                                        style={{ backgroundColor: C.primaryLight }}>
                                        <LayoutTemplate size={28} style={{ color: C.primary }} />
                                    </div>
                                    <h3 className="text-[18px] font-bold mb-2"
                                        style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                        No templates yet
                                    </h3>
                                    <p className="text-[13px] mb-6 max-w-sm"
                                        style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6 }}>
                                        Create your first custom template to get started. Build from scratch or import from an eBay listing.
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => router.push('/dashboard/design/html-editor?name=New+Template')}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:opacity-90"
                                            style={{ backgroundColor: C.primary, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                            <Plus size={14} /> Create Blank
                                        </button>
                                        <button
                                            onClick={() => setShowAiModal(true)}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:opacity-80"
                                            style={{ backgroundColor: C.surface, color: C.primary, border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                            <Zap size={14} /> Generate with AI
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* My Templates — no search results */}
                            {activeTab === 'my-templates' && myTemplates.length > 0 && myTemplates.filter(t => {
                                const matchCat = activeCategory === 'all' || t.category?.toLowerCase() === activeCategory
                                const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase())
                                return matchCat && matchSearch
                            }).length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <Search size={24} style={{ color: C.border, marginBottom: 12 }} />
                                        <p className="text-[14px] font-semibold mb-1" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                            No templates match your search
                                        </p>
                                        <p className="text-[12px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                            Try a different keyword or category
                                        </p>
                                    </div>
                                )}

                            {/* My Templates — has results */}
                            {myTemplates.filter(t => {
                                const matchCat = activeCategory === 'all' || t.category?.toLowerCase() === activeCategory
                                const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase())
                                return matchCat && matchSearch
                            }).length > 0 && (
                                    <div className="mb-8">
                                        <h2 className="text-[14px] font-bold mb-3 flex items-center gap-2"
                                            style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                            <span style={{ color: C.primary }}>My Templates</span>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                                style={{ backgroundColor: C.primaryLight, color: C.primary }}>
                                                {myTemplates.length}
                                            </span>
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                                            {myTemplates.filter(t => {
                                                const matchCat = activeCategory === 'all' || t.category?.toLowerCase() === activeCategory
                                                const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase())
                                                return matchCat && matchSearch
                                            }).map(t => (
                                                <TemplateCard
                                                    key={t.id}
                                                    template={t}
                                                    isOwn
                                                    copiedId={copiedId}
                                                    deletingId={deletingId}
                                                    onPreview={() => setPreviewTemplate(t)}
                                                    onCopy={() => copyHtml(t)}
                                                    onDelete={() => deleteTemplate(t.id)}
                                                    onEdit={() => router.push(`/dashboard/design/html-editor?name=${encodeURIComponent(t.name)}&id=${t.id}`)}
                                                    onDuplicate={() => duplicateTemplate(t)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                            {/* All / System templates */}
                            {activeTab !== 'my-templates' && (
                                <div>
                                    {/* No templates published yet */}
                                    {templates.length === 0 && !loading && (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
                                                style={{ background: 'linear-gradient(135deg, #7530fb20, #7530fb10)' }}>
                                                <LayoutTemplate size={36} style={{ color: C.primary }} />
                                            </div>
                                            <h3 className="text-[20px] font-bold mb-2"
                                                style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                                No templates yet
                                            </h3>
                                            <p className="text-[13px] mb-2 max-w-sm"
                                                style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.7 }}>
                                                System templates will appear here once published by the admin. In the meantime, create your own custom template.
                                            </p>
                                            <div className="flex items-center gap-3 mt-4">
                                                <button
                                                    onClick={() => router.push('/dashboard/design/html-editor?name=New+Template')}
                                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:opacity-90"
                                                    style={{ backgroundColor: C.primary, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                                    <Plus size={14} /> Create Blank
                                                </button>
                                                <button
                                                    onClick={() => setShowAiModal(true)}
                                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:opacity-80"
                                                    style={{ backgroundColor: C.surface, color: C.primary, border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                                    <Zap size={14} /> Generate with AI
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Has templates but search returns nothing */}
                                    {templates.length > 0 && sortedTemplates.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <Search size={24} style={{ color: C.border, marginBottom: 12 }} />
                                            <p className="text-[14px] font-semibold mb-1"
                                                style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                                No templates match &quot;{search || activeCategory}&quot;
                                            </p>
                                            <p className="text-[12px]"
                                                style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                                Try a different keyword or category
                                            </p>
                                        </div>
                                    )}

                                    {/* Template grid */}
                                    {templates.length > 0 && sortedTemplates.length > 0 && (
                                        <>
                                            <h2 className="text-[14px] font-bold mb-3 flex items-center gap-2"
                                                style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                                <span>
                                                    {activeCategory === 'all' ? 'All Templates' : CATEGORIES.find(c => c.id === activeCategory)?.label}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                                    style={{ backgroundColor: C.bg, color: C.muted }}>
                                                    {sortedTemplates.length}
                                                </span>
                                            </h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                                                {sortedTemplates.map(t => (
                                                    <TemplateCard
                                                        key={t.id}
                                                        template={t}
                                                        isOwn={false}
                                                        copiedId={copiedId}
                                                        deletingId={deletingId}
                                                        onPreview={() => setPreviewTemplate(t)}
                                                        onCopy={() => copyHtml(t)}
                                                        onDelete={() => deleteTemplate(t.id)}
                                                        onEdit={() => router.push(`/dashboard/design/visual-editor?name=${encodeURIComponent(t.name)}&id=${t.id}`)}
                                                        onDuplicate={() => duplicateTemplate(t)}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )} {/* end activeTab !== my-templates */}

                        </>
                    )}
                </div>
            )} {/* end library/templates conditional */}

            {/* Template Preview Modal */}
            <TemplatePreviewModal
                template={previewTemplate}
                templates={[...myTemplates, ...templates]}
                onClose={() => setPreviewTemplate(null)}
                onEdit={t => router.push(`/dashboard/design/visual-editor?name=${encodeURIComponent(t.name)}&id=${t.id}`)}
                onCopy={t => copyHtml(t as ListingTemplate)}
                copiedId={copiedId}
            />

            {/* AI Generator Modal */}
            <AiTemplateGenerator
                open={showAiModal}
                onClose={() => setShowAiModal(false)}
                onImport={(html, name, cat) => {
                    setAiHtml(html)
                    setAiTemplateName(name)
                    setAiCategory(cat)
                    // Store in sessionStorage so html-editor can pick it up
                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem('ai_template_html', html)
                        sessionStorage.setItem('ai_template_name', name)
                        sessionStorage.setItem('ai_template_category', cat)
                    }
                    router.push(`/dashboard/design/html-editor?name=${encodeURIComponent(name)}&from=ai`)
                }}
            />

            {/* Custom HTML Builder Modal */}
            {showBuilderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
                    onClick={() => { if (!builderSaving) setShowBuilderModal(false) }}>
                    <div className="w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                        style={{ backgroundColor: C.surface }}
                        onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 shrink-0"
                            style={{ borderBottom: `1px solid ${C.border}` }}>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: C.primaryLight }}>
                                    <Code2 size={15} style={{ color: C.primary }} />
                                </div>
                                <p className="text-[15px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>Custom HTML Builder</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <SecondaryButton
                                    onClick={() => setBuilderPreview(v => !v)}
                                    icon={<Eye size={12} />}>
                                    {builderPreview ? 'Edit' : 'Preview'}
                                </SecondaryButton>
                                <IconButton
                                    onClick={() => { if (!builderSaving) setShowBuilderModal(false) }}
                                    icon={<X size={14} />}
                                    tooltip="Close"
                                    variant="ghost"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto flex flex-col">
                            {/* Name + category */}
                            <div className="flex gap-3 p-4 shrink-0" style={{ borderBottom: `1px solid ${C.border}` }}>
                                <input
                                    value={builderName}
                                    onChange={e => setBuilderName(e.target.value)}
                                    placeholder="Template name (required)..."
                                    className="flex-1 text-[13px] px-3 py-2 rounded-lg outline-none"
                                    style={{ border: `1px solid ${C.borderInput}`, backgroundColor: C.bg, color: C.body, fontFamily: 'DM Sans, sans-serif' }}
                                />
                                <select
                                    value={builderCategory}
                                    onChange={e => setBuilderCategory(e.target.value)}
                                    className="text-[13px] px-3 py-2 rounded-lg outline-none"
                                    style={{ border: `1px solid ${C.borderInput}`, backgroundColor: C.bg, color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                                        <option key={c.id} value={c.id}>{c.id}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Editor / Preview */}
                            <div className="flex-1 p-4">
                                {builderPreview ? (
                                    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#f0f0f0', padding: 16, minHeight: 300 }}>
                                        {builderHtml ? (
                                            <div className="max-w-[560px] mx-auto rounded-xl overflow-hidden"
                                                style={{ fontFamily: 'Arial, sans-serif', fontSize: 13 }}
                                                dangerouslySetInnerHTML={{ __html: sanitiseHtml(builderHtml) }} />
                                        ) : (
                                            <div className="flex items-center justify-center h-48">
                                                <p className="text-[13px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Paste HTML to preview</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <textarea
                                        value={builderHtml}
                                        onChange={e => setBuilderHtml(e.target.value)}
                                        placeholder={`Paste or write your eBay-safe HTML here...\n\nTips:\n• Use table-based layout\n• Inline CSS only\n• Use placeholders: [PRODUCT_NAME], [PRICE], [DESCRIPTION]`}
                                        className="w-full text-[12px] p-3 rounded-xl outline-none resize-none font-mono"
                                        style={{
                                            border: `1px solid ${C.borderInput}`, backgroundColor: C.bg,
                                            color: C.body, minHeight: 320,
                                            lineHeight: 1.6,
                                        }}
                                        rows={18}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 flex items-center justify-between shrink-0"
                            style={{ borderTop: `1px solid ${C.border}` }}>
                            <p className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                {builderHtml.length.toLocaleString()} characters
                            </p>
                            <div className="flex items-center gap-2">
                                <GhostButton onClick={() => setShowBuilderModal(false)}>
                                    Cancel
                                </GhostButton>
                                {builderSaved
                                    ? <SecondaryButton icon={<Check size={13} />}>Saved!</SecondaryButton>
                                    : <PrimaryButton
                                        onClick={saveBuilderTemplate}
                                        disabled={!builderHtml || !builderName || builderSaved}
                                        loading={builderSaving}
                                        icon={<Save size={13} />}>
                                        Save Template
                                    </PrimaryButton>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                ::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    )
}

// ── Template Card component ────────────────────────────────────────────────
interface CardProps {
    template: ListingTemplate
    isOwn: boolean
    copiedId: string | null
    deletingId: string | null
    onPreview: () => void
    onCopy: () => void
    onDelete: () => void
    onEdit: () => void
    onDuplicate: () => void
}

function TemplateCard({ template, isOwn, copiedId, deletingId, onPreview, onCopy, onDelete, onEdit, onDuplicate }: CardProps) {
    const [hovered, setHovered] = useState(false)
    const copied = copiedId === template.id
    const deleting = deletingId === template.id

    const badge = (() => {
        if (!template.is_system) return null
        if ((template.use_count || 0) > 10) return { label: 'POPULAR', bg: '#b8fa33', text: '#1e1535' }
        // Only show NEW for templates created within 30 days
        const createdAt = template.created_at ? new Date(template.created_at).getTime() : 0
        const isNew = createdAt > 0 && (Date.now() - createdAt) < 30 * 24 * 60 * 60 * 1000
        if (isNew) return { label: 'NEW', bg: '#16a34a', text: '#fff' }
        return null
    })()

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="rounded-2xl overflow-hidden flex flex-col"
            style={{
                border: `2px solid ${hovered ? C.primary : C.border}`,
                backgroundColor: C.surface,
                boxShadow: hovered ? '0 8px 32px rgba(117,48,251,0.18)' : '0 1px 4px rgba(117,48,251,0.05)',
                transition: 'all 0.2s ease',
            }}
        >
            {/* Thumbnail */}
            <div className="relative" style={{ cursor: 'pointer' }} onClick={onPreview}>
                {template.description_html
                    ? <TemplateThumbnail html={template.description_html} />
                    : <div className="w-full flex items-center justify-center" style={{ height: 420, backgroundColor: C.bg }}>
                        <LayoutTemplate size={28} style={{ color: C.border }} />
                    </div>
                }

                {/* Badges */}
                {badge && (
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide"
                        style={{ backgroundColor: badge.bg, color: badge.text, fontFamily: 'DM Sans, sans-serif', zIndex: 2 }}>
                        {badge.label}
                    </div>
                )}
                {isOwn && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold"
                        style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif', zIndex: 2 }}>
                        Mine
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                    style={{
                        backgroundColor: 'rgba(14,12,28,0.72)',
                        opacity: hovered ? 1 : 0,
                        backdropFilter: hovered ? 'blur(2px)' : 'none',
                        transition: 'opacity 0.2s ease',
                        zIndex: 3,
                    }}>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={e => { e.stopPropagation(); onPreview() }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all hover:opacity-80"
                            style={{ backgroundColor: '#fff', color: C.dark, border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                            <Eye size={13} /> Preview
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); onEdit() }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all hover:opacity-90"
                            style={{ backgroundColor: C.primary, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                            <Pencil size={13} /> Edit
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-3 py-2.5 flex items-center justify-between gap-2"
                style={{ borderTop: `1px solid ${C.border}` }}>
                <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold truncate" style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                        {template.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <CategoryBadge category={template.category} />
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <IconButton onClick={onCopy}
                        icon={copied ? <Check size={12} /> : <Copy size={12} />}
                        tooltip={copied ? 'Copied!' : 'Copy HTML'}
                        active={copied} variant={copied ? 'success' : 'default'} size={28} />
                    <IconButton onClick={onEdit}
                        icon={<Pencil size={12} />}
                        tooltip="Edit template" size={28} />
                    {isOwn && (
                        <IconButton onClick={onDelete}
                            icon={deleting ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={12} />}
                            tooltip="Delete" size={28} />
                    )}
                </div>
            </div>
        </div>
    )
}
