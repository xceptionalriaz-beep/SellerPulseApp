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

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { createClient as createRawClient } from '@supabase/supabase-js'
import {
    Plus, Search, X, Copy, Trash2,
    Eye, Check, Loader2, Code2, Zap,
    LayoutTemplate, Layers, Pencil, ChevronDown,
    LayoutGrid, Smartphone, Monitor, Shirt, Gem, Heart,
    Home, Sofa, Car, Wrench, Dumbbell, Gamepad2,
    Archive, BookOpen, PawPrint, Briefcase, Tag,
} from 'lucide-react'
import { hydrateTemplateContent } from '@/lib/template-utils'
import { assembleDocument } from '@/components/ui/VisualEditor/blocks'
import { ProBadge } from '@/components/ui/VisualEditor/ProBadge'
import { sanitiseHtml } from '@/components/ui/EditorToolbar'
import { AIButton, IconButton } from '@/components/ui/Buttons'
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
    tags: string[] | null
    sort_order: number | null
    is_featured: boolean | null
    is_new_badge: boolean | null
    is_pro: boolean | null
}

// ── Category definitions ─────────────────────────────────────────────────────
// IDs match the listing-generator's CATEGORY_MAP keys so Phase 3 matching is
// direct. Filter logic also supports old Design-Studio slugs for backwards compat.
import type { LucideIcon } from 'lucide-react'
const CATEGORIES: { id: string; label: string; Icon: LucideIcon }[] = [
    { id: 'all', label: 'All Templates', Icon: LayoutGrid },
    { id: 'consumer_electronics', label: 'Consumer Electronics', Icon: Smartphone },
    { id: 'computers', label: 'Computers & Tablets', Icon: Monitor },
    { id: 'clothing', label: 'Clothing & Accessories', Icon: Shirt },
    { id: 'jewelry', label: 'Jewellery & Watches', Icon: Gem },
    { id: 'health_beauty', label: 'Health & Beauty', Icon: Heart },
    { id: 'home_garden', label: 'Home & Garden', Icon: Home },
    { id: 'furniture', label: 'Furniture', Icon: Sofa },
    { id: 'toys_hobbies', label: 'Toys & Hobbies', Icon: Gamepad2 },
    { id: 'sporting_goods', label: 'Sporting Goods', Icon: Dumbbell },
    { id: 'collectibles', label: 'Collectibles & Art', Icon: Archive },
    { id: 'books_movies', label: 'Books & Media', Icon: BookOpen },
    { id: 'pet_supplies', label: 'Pet Supplies', Icon: PawPrint },
    { id: 'motors_parts', label: 'Motors & Parts', Icon: Car },
    { id: 'business', label: 'Business & Industrial', Icon: Briefcase },
    { id: 'general', label: 'General / Other', Icon: Tag },
]

// Maps new listing-category IDs → old Design-Studio slugs (backwards compat)
const LEGACY_SLUGS: Record<string, string[]> = {
    consumer_electronics: ['electronics'],
    computers: ['electronics', 'computers'],
    clothing: ['fashion', 'clothing'],
    jewelry: ['fashion', 'jewelry', 'jewellery'],
    health_beauty: ['fashion', 'health_beauty', 'health'],
    home_garden: ['home', 'home_garden'],
    furniture: ['home', 'furniture'],
    toys_hobbies: ['toys', 'toys_hobbies'],
    sporting_goods: ['sports', 'sporting_goods'],
    pet_supplies: ['pets', 'pet_supplies'],
    motors_parts: ['auto', 'motors_parts'],
    books_movies: ['general', 'books_movies'],
    collectibles: ['general', 'collectibles'],
    business: ['general', 'business'],
    general: ['general'],
}

function matchesCategoryFilter(templateCat: string | null, filterId: string): boolean {
    if (!templateCat) return false
    const tc = templateCat.toLowerCase()
    if (tc === filterId) return true
    return LEGACY_SLUGS[filterId]?.includes(tc) ?? false
}

// ── Sort options for ProDropdown ───────────────────────────────────────────
const SORT_OPTIONS: DropdownOption[] = [
    { val: 'popular', label: 'Popular', enabled: true },
    { val: 'newest', label: 'Newest', enabled: true },
]

// ── Built-in system templates (shown when DB has none) ─────────────────────
// ── Tiny HTML thumbnail preview ────────────────────────────────────────────
function TemplateThumbnail({ html, hovered }: { html: string; hovered?: boolean }) {
    const hydrated = hydrateTemplateContent(html)
    const doc = hydrated.trim().toLowerCase().startsWith('<!doctype') || hydrated.trim().toLowerCase().startsWith('<html')
        ? hydrated
        : `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
    line-height: 1.4;
    color: #1f1d2e;
    background: #fff;
    overflow: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100%;
  }
  html {
    overflow: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100%;
  }
  .wrapper { padding: 5px; width: 100%; box-sizing: border-box; }
  h1 { font-size: 16px; font-weight: 700; color: #1e1535; margin: 0 0 6px; padding-bottom: 4px; border-bottom: 2px solid #7530fb; }
  h2 { font-size: 13px; font-weight: 700; color: #1e1535; margin: 10px 0 4px; padding-left: 6px; border-left: 2px solid #7530fb; }
  h3 { font-size: 11px; font-weight: 700; color: #1e1535; margin: 8px 0 2px; }
  p  { font-size: 10px; color: #6b7280; margin: 0 0 4px; line-height: 1.4; }
  ul, ol { padding-left: 14px; margin: 0 0 4px; }
  li { font-size: 10px; color: #6b7280; margin-bottom: 2px; }
  table { width: 100% !important; border-collapse: collapse; margin-bottom: 8px; table-layout: fixed; }
  td, th { padding: 4px 6px; border: 1px solid #ede9fe; font-size: 10px; text-align: left; word-wrap: break-word; }
  th { background: #7530fb; color: #fff; font-weight: 700; }
  tr:nth-child(even) { background: #f8f7ff; }
  img { max-width: 100% !important; height: auto !important; display: block; border-radius: 4px; margin-bottom: 4px; }
  .placeholder { display: inline-block; background: #f3eeff; color: #7530fb; padding: 1px 6px; border-radius: 4px; font-size: 11px; font-family: monospace; }
</style>
</head>
<body><div class="wrapper">${hydrated}</div></body>
</html>`

    return (
        <div style={{ width: '100%', height: 650, overflow: 'hidden', backgroundColor: '#ffffff', position: 'relative' }}>
            <iframe
                srcDoc={doc}
                sandbox="allow-same-origin"
                style={{
                    position: 'absolute',
                    top: hovered ? '-420px' : '0',
                    left: 0,
                    width: '222%',
                    height: '500%',
                    border: 'none',
                    pointerEvents: 'none',
                    backgroundColor: '#ffffff',
                    transform: 'scale(0.45)',
                    transformOrigin: 'top left',
                    overflow: 'hidden',
                    transition: hovered ? 'top 4s ease-in-out' : 'top 0.6s ease',
                }}
                title="Template Preview"
            />
        </div>
    )
}

// ── Category badge colours ─────────────────────────────────────────────────
function CategoryBadge({ category }: { category: string | null }) {
    const map: Record<string, { bg: string; text: string }> = {
        // ── New category IDs ───────────────────────────────────────────
        consumer_electronics: { bg: '#dbeafe', text: '#1d4ed8' },
        computers: { bg: '#dbeafe', text: '#1d4ed8' },
        clothing: { bg: '#fce7f3', text: '#be185d' },
        jewelry: { bg: '#fce7f3', text: '#be185d' },
        health_beauty: { bg: '#fce7f3', text: '#be185d' },
        home_garden: { bg: '#dcfce7', text: '#15803d' },
        furniture: { bg: '#dcfce7', text: '#15803d' },
        motors_parts: { bg: '#fef3c7', text: '#b45309' },
        pet_supplies: { bg: '#f3e8ff', text: '#7e22ce' },
        sporting_goods: { bg: '#e0f2fe', text: '#0369a1' },
        toys_hobbies: { bg: '#fef9c3', text: '#a16207' },
        collectibles: { bg: '#f1f5f9', text: '#475569' },
        books_movies: { bg: '#f1f5f9', text: '#475569' },
        business: { bg: '#f1f5f9', text: '#475569' },
        general: { bg: '#f1f5f9', text: '#475569' },
        // ── Legacy slugs (backwards compat) ───────────────────────────
        electronics: { bg: '#dbeafe', text: '#1d4ed8' },
        fashion: { bg: '#fce7f3', text: '#be185d' },
        home: { bg: '#dcfce7', text: '#15803d' },
        auto: { bg: '#fef3c7', text: '#b45309' },
        pet: { bg: '#f3e8ff', text: '#7e22ce' },
        sports: { bg: '#e0f2fe', text: '#0369a1' },
        toys: { bg: '#fef9c3', text: '#a16207' },
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
    const [catDropdownOpen, setCatDropdownOpen] = useState(false)
    const [catSearch, setCatSearch] = useState('')
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState<'popular' | 'newest'>('popular')
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Preview modal
    const [previewTemplate, setPreviewTemplate] = useState<ListingTemplate | null>(null)

    // AI Generator modal
    const [showAiModal, setShowAiModal] = useState(false)

    // ── Load templates ─────────────────────────────────────────────────────
    const loadTemplates = useCallback(async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            // System templates
            const { data: sys } = await rawDb
                .from('listing_templates')
                .select('id, user_id, name, description, category, description_html, is_system, is_shared, thumbnail_url, use_count, created_at, updated_at, tags, sort_order, is_featured, is_new_badge, is_pro')
                .eq('is_system', true)
                .order('sort_order', { ascending: true })

            // User's own templates — from visual_templates (where Visual Builder saves)
            // Must use the typed supabase client (not rawDb) — visual_templates RLS needs auth.uid()
            let own: ListingTemplate[] = []
            if (user) {
                const { data: ownData } = await (supabase as any)
                    .from('visual_templates')
                    .select('id, user_id, name, category, updated_at, blocks_json, canvas_settings_json')
                    .order('updated_at', { ascending: false })
                // Map visual_templates shape → ListingTemplate shape
                // assembleDocument converts blocks_json → full HTML so preview modal shows real content
                own = ((ownData as any[]) || []).map((vt: any) => {
                    const blocks = Array.isArray(vt.blocks_json) ? vt.blocks_json : []
                    const settings = vt.canvas_settings_json ?? undefined
                    const html = blocks.length > 0 ? assembleDocument(blocks, settings) : null
                    return {
                        id: vt.id,
                        user_id: vt.user_id,
                        name: vt.name,
                        description: 'Visual Builder template',   // signals getEditorRoute to use visual-editor
                        category: vt.category || 'general',
                        description_html: html,                   // real rendered HTML for preview
                        is_system: false,
                        is_shared: false,
                        thumbnail_url: null,
                        use_count: 0,
                        created_at: vt.updated_at,
                        updated_at: vt.updated_at,
                        tags: null,
                        sort_order: null,
                        is_featured: null,
                        is_new_badge: null,
                        is_pro: null,
                    }
                })
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
        const matchCat = activeCategory === 'all' || matchesCategoryFilter(t.category, activeCategory)
        const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
            (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
            (t.tags || []).some(tag => tag.toLowerCase().includes(search.toLowerCase()))
        return matchCat && matchSearch
    })
    // System templates only — sorted: sort_order primary, then popular/newest secondary
    const sortedTemplates = templates.filter(t => {
        const matchCat = activeCategory === 'all' || matchesCategoryFilter(t.category, activeCategory)
        const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
            (t.tags || []).some(tag => tag.toLowerCase().includes(search.toLowerCase()))
        return matchCat && matchSearch
    }).sort((a, b) => {
        const oa = a.sort_order ?? 9999
        const ob = b.sort_order ?? 9999
        if (oa !== ob) return oa - ob
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
    // Function removed – duplicate feature not currently exposed in UI.


    // ── Delete own template ────────────────────────────────────────────────
    async function deleteTemplate(id: string) {
        // Guard: only delete own templates, never system ones
        const isSystem = [...templates].some(t => t.id === id)
        if (isSystem) return
        setDeletingId(id)
        // Own templates live in visual_templates (saved by the Visual Builder)
        await (supabase as any).from('visual_templates').delete().eq('id', id)
        setMyTemplates((prev: ListingTemplate[]) => prev.filter((t: ListingTemplate) => t.id !== id))
        setDeletingId(null)
    }

    // ── Editor route helper ────────────────────────────────────────────────
    // Templates saved by the Visual Builder carry "Visual Builder" in their
    // description. Route everything else to the HTML editor.
    function getEditorRoute(t: ListingTemplate) {
        // System templates are Visual Builder templates; own templates signal via description
        const isVisual = t.is_system || (t.description || '').toLowerCase().includes('visual builder')
        return `/dashboard/design/${isVisual ? 'visual-editor' : 'html-editor'}?name=${encodeURIComponent(t.name)}&id=${t.id}`
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

                    {/* Category dropdown picker */}
                    <div className="relative shrink-0" style={{ minWidth: 200 }}>
                        {/* Trigger button */}
                        <button
                            onClick={() => { setCatDropdownOpen(o => !o); setCatSearch('') }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all w-full"
                            style={{
                                border: `1px solid ${catDropdownOpen ? C.primary : C.borderInput}`,
                                backgroundColor: activeCategory !== 'all' ? C.primaryLight : C.surface,
                                color: activeCategory !== 'all' ? C.primary : C.secondary,
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: 12,
                                fontWeight: 600,
                            }}
                        >
                            {(() => {
                                const found = CATEGORIES.find(c => c.id === activeCategory)
                                const ActiveIcon = found?.Icon ?? LayoutGrid
                                return <ActiveIcon size={13} style={{ flexShrink: 0, color: activeCategory !== 'all' ? C.primary : C.secondary }} />
                            })()}
                            <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {CATEGORIES.find(c => c.id === activeCategory)?.label ?? 'All Templates'}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                                style={{
                                    backgroundColor: activeCategory !== 'all' ? C.primary + '25' : C.border,
                                    color: activeCategory !== 'all' ? C.primary : C.muted,
                                }}>
                                {activeCategory === 'all'
                                    ? allVisible.length
                                    : allVisible.filter(t => matchesCategoryFilter(t.category, activeCategory)).length}
                            </span>
                            <ChevronDown size={13} style={{ flexShrink: 0, transition: 'transform 0.15s', transform: catDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                        </button>

                        {/* Dropdown panel */}
                        {catDropdownOpen && (
                            <>
                                {/* Backdrop */}
                                <div
                                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                                    onClick={() => setCatDropdownOpen(false)}
                                />
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 50,
                                    width: 240,
                                    backgroundColor: C.surface,
                                    border: `1px solid ${C.border}`,
                                    borderRadius: 12,
                                    boxShadow: '0 8px 24px rgba(117,48,251,0.12)',
                                    overflow: 'hidden',
                                }}>
                                    {/* Search input */}
                                    <div style={{ padding: '10px 10px 6px', borderBottom: `1px solid ${C.border}` }}>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 7,
                                            border: `1px solid ${C.borderInput}`,
                                            borderRadius: 8, padding: '6px 10px',
                                            backgroundColor: C.bg,
                                        }}>
                                            <Search size={12} color={C.muted} />
                                            <input
                                                autoFocus
                                                value={catSearch}
                                                onChange={e => setCatSearch(e.target.value)}
                                                placeholder="Search categories…"
                                                style={{
                                                    flex: 1, fontSize: 12, border: 'none', outline: 'none',
                                                    background: 'transparent', color: C.body,
                                                    fontFamily: 'DM Sans, sans-serif',
                                                }}
                                            />
                                            {catSearch && (
                                                <button onClick={() => setCatSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
                                                    <X size={11} color={C.muted} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Category list (scrollable) */}
                                    <div style={{ maxHeight: 280, overflowY: 'auto', padding: '6px 6px' }}>
                                        {CATEGORIES.filter(cat =>
                                            !catSearch || cat.label.toLowerCase().includes(catSearch.toLowerCase())
                                        ).map(cat => {
                                            const count = cat.id === 'all'
                                                ? allVisible.length
                                                : allVisible.filter(t => matchesCategoryFilter(t.category, cat.id)).length
                                            const isActive = activeCategory === cat.id
                                            const CatIcon = cat.Icon
                                            return (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => { setActiveCategory(cat.id); setCatDropdownOpen(false) }}
                                                    style={{
                                                        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                                                        padding: '7px 10px', borderRadius: 8, border: 'none',
                                                        backgroundColor: isActive ? C.primaryLight : 'transparent',
                                                        cursor: 'pointer',
                                                        transition: 'background 0.1s',
                                                    }}
                                                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = C.bg }}
                                                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                                                >
                                                    <CatIcon size={14} style={{ flexShrink: 0, color: isActive ? C.primary : C.secondary }} />
                                                    <span style={{
                                                        flex: 1, textAlign: 'left', fontSize: 12,
                                                        fontWeight: isActive ? 700 : 500,
                                                        color: isActive ? C.primary : C.body,
                                                        fontFamily: 'DM Sans, sans-serif',
                                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                    }}>
                                                        {cat.label}
                                                    </span>
                                                    <span style={{
                                                        fontSize: 10, fontWeight: 700,
                                                        color: isActive ? C.primary : C.muted,
                                                        fontFamily: 'DM Sans, sans-serif',
                                                        flexShrink: 0,
                                                    }}>
                                                        {count}
                                                    </span>
                                                    {isActive && <Check size={11} color={C.primary} strokeWidth={3} style={{ flexShrink: 0 }} />}
                                                </button>
                                            )
                                        })}
                                        {CATEGORIES.filter(cat =>
                                            !catSearch || cat.label.toLowerCase().includes(catSearch.toLowerCase())
                                        ).length === 0 && (
                                                <p style={{ textAlign: 'center', fontSize: 12, color: C.muted, padding: '12px 0', fontFamily: 'DM Sans, sans-serif' }}>
                                                    No categories found
                                                </p>
                                            )}
                                    </div>
                                </div>
                            </>
                        )}
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
                    ) : sortedTemplates.length === 0 ? (
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

                            {/* My Templates — has results (only shown on my-templates tab) */}
                            {activeTab === 'my-templates' && myTemplates.filter(t => {
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
                                                    onEdit={() => router.push(getEditorRoute(t))}
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
                                                        onEdit={() => router.push(getEditorRoute(t))}
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
                onEdit={t => router.push(getEditorRoute(t as ListingTemplate))}
                onCopy={t => copyHtml(t as ListingTemplate)}
                copiedId={copiedId}
            />

            {/* AI Generator Modal */}
            <AiTemplateGenerator
                open={showAiModal}
                onClose={() => setShowAiModal(false)}
                onImport={(html, name, cat) => {
                    // Store in sessionStorage so html-editor can pick it up
                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem('ai_template_html', html)
                        sessionStorage.setItem('ai_template_name', name)
                        sessionStorage.setItem('ai_template_category', cat)
                    }
                    router.push(`/dashboard/design/html-editor?name=${encodeURIComponent(name)}&from=ai`)
                }}
            />

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
}

function TemplateCard({ template, isOwn, copiedId, deletingId, onPreview, onCopy, onDelete, onEdit }: CardProps) {
    const [hovered, setHovered] = useState(false)
    const copied = copiedId === template.id
    const deleting = deletingId === template.id
    const isFeaturedCard = !!template.is_featured

    const badge = (() => {
        if (!template.is_system) return null
        // PRO badge has highest priority
        if (template.is_pro) return { label: 'PRO', bg: '#7530fb', text: '#fff' }
        // Admin-controlled badges take priority over auto-computed ones
        if (template.is_featured) return { label: 'FEATURED', bg: '#fef3c7', text: '#92400e' }
        if (template.is_new_badge) return { label: 'NEW', bg: '#16a34a', text: '#fff' }
        // Auto-computed badges
        if ((template.use_count || 0) > 10) return { label: 'POPULAR', bg: '#b8fa33', text: '#1e1535' }
        // Only show auto-NEW for templates created within 30 days
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
                border: `2px solid ${hovered ? C.primary : isFeaturedCard ? '#f59e0b' : C.border}`,
                backgroundColor: C.surface,
                boxShadow: hovered
                    ? '0 8px 32px rgba(117,48,251,0.18)'
                    : isFeaturedCard
                        ? '0 2px 12px rgba(245,158,11,0.15)'
                        : '0 1px 4px rgba(117,48,251,0.05)',
                transition: 'all 0.2s ease',
            }}
        >
            {/* Thumbnail */}
            <div className="relative" style={{ cursor: 'pointer', height: 650, overflow: 'hidden' }} onClick={onPreview}>
                {template.description_html
                    ? <TemplateThumbnail html={template.description_html} hovered={hovered} />
                    : <div className="w-full flex items-center justify-center" style={{ height: 650, backgroundColor: C.bg }}>
                        <LayoutTemplate size={28} style={{ color: C.border }} />
                    </div>
                }

                {/* Badges */}
                {badge && (
                    <div className="absolute top-2.5" style={{ zIndex: 2, ...(template.is_pro ? { right: '10px' } : { left: '10px' }) }}>
                        {template.is_pro
                            ? <ProBadge size="xs" />
                            : (
                                <div className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide"
                                    style={{ backgroundColor: badge.bg, color: badge.text, fontFamily: 'DM Sans, sans-serif' }}>
                                    {badge.label}
                                </div>
                            )
                        }
                    </div>
                )}
                {isOwn && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold"
                        style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif', zIndex: 2 }}>
                        Mine
                    </div>
                )}

                {/* Hover actions — no dark overlay, just a soft bottom gradient + buttons */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-4"
                    style={{
                        background: 'linear-gradient(to bottom, transparent 0%, rgba(248,247,255,0.92) 60%, rgba(248,247,255,1) 100%)',
                        opacity: hovered ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                        zIndex: 3,
                        paddingTop: 32,
                    }}>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={e => { e.stopPropagation(); onPreview() }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold"
                            style={{ backgroundColor: '#fff', color: C.dark, border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
                            <Eye size={13} /> Preview
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); onEdit() }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold"
                            style={{ backgroundColor: C.primary, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 2px 8px rgba(117,48,251,0.3)' }}>
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
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <CategoryBadge category={template.category} />
                        {template.tags && template.tags.length > 0 && template.tags.slice(0, 3).map(tag => (
                            <span key={tag} style={{
                                fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 20,
                                backgroundColor: C.primaryLight, color: C.primary,
                                fontFamily: 'DM Sans, sans-serif',
                            }}>
                                {tag}
                            </span>
                        ))}
                        {template.tags && template.tags.length > 3 && (
                            <span style={{ fontSize: 9, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                +{template.tags.length - 3}
                            </span>
                        )}
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
