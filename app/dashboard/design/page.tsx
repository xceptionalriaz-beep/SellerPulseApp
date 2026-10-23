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
    LayoutTemplate, Layers, Pencil, ChevronDown,
    LayoutGrid, Smartphone, Monitor, Shirt, Gem, Heart,
    Home, Sofa, Car, Wrench, Dumbbell, Gamepad2,
    Archive, BookOpen, PawPrint, Briefcase, Tag,
    Files, ArrowRight, PenLine, FileUp, Link2, ShieldCheck, Download,
} from 'lucide-react'
import { hydrateTemplateContent } from '@/lib/template-utils'
import { assembleDocument } from '@/components/ui/VisualEditor/blocks'
import { ProBadge, ProLockOverlay } from '@/components/ui/VisualEditor/ProBadge'
import { sanitiseHtml } from '@/components/ui/EditorToolbar'
import { AIButton, IconButton } from '@/components/ui/Buttons'
import ProDropdown from '@/components/ui/ProDropdown'
import type { DropdownOption } from '@/components/ui/ProDropdown'
import TemplatePreviewModal from '@/components/ui/TemplatePreviewModal'
import ListingPickerModal from '@/components/ui/VisualEditor/ListingPickerModal'
import type { LinkedListing } from '@/components/ui/VisualEditor/ListingPickerModal'
import BlockLibraryTab from './BlockLibraryTab'
import StudioSettings from './StudioSettings'
import AiTemplateGenerator from '@/components/ui/AiTemplateGenerator'
import { ProUpgradeModal } from '@/components/ui/VisualEditor/ProUpgradeModal'

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
                    top: hovered ? '-160px' : '0',
                    left: 0,
                    width: '222%',
                    height: '500%',
                    border: 'none',
                    pointerEvents: 'none',
                    backgroundColor: '#ffffff',
                    transform: 'scale(0.45)',
                    transformOrigin: 'top left',
                    overflow: 'hidden',
                    transition: hovered ? 'top 6s linear' : 'top 0.5s ease',
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
    // Prefer human label from CATEGORIES array; fall back to title-casing the slug
    const label = CATEGORIES.find(c => c.id === cat)?.label
        ?? cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    return (
        <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px',
            borderRadius: 20, backgroundColor: style.bg, color: style.text,
            fontFamily: 'DM Sans, sans-serif',
        }}>
            {label}
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
    const [sharingId, setSharingId] = useState<string | null>(null)   // template being toggled inside modal
    const [shareModalTemplate, setShareModalTemplate] = useState<ListingTemplate | null>(null)

    // ── Pro gating ──────────────────────────────────────────────────────────
    const [designStudioPlan] = useState<'free' | 'pro'>('free') // TODO: derive from user subscription
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [upgradeReason, setUpgradeReason] = useState<string | undefined>(undefined)
    const showUpgrade = (reason?: string) => { setUpgradeReason(reason); setShowUpgradeModal(true) }

    // Preview modal
    const [previewTemplate, setPreviewTemplate] = useState<ListingTemplate | null>(null)

    // AI Generator modal
    const [showAiModal, setShowAiModal] = useState(false)
    const [aiPrompt, setAiPrompt] = useState('')

    // Delete confirmation
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    // Feature 14: Pagination for system templates (load-more style)
    const PAGE_SIZE = 12
    const [page, setPage] = useState(1)

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
                    .select('id, user_id, name, description, category, thumbnail_url, use_count, is_shared, created_at, updated_at, blocks_json, canvas_settings_json')
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
                        description: vt.description || 'Visual Builder template',
                        category: vt.category || 'general',
                        description_html: html,                   // real rendered HTML for preview
                        is_system: false,
                        is_shared: vt.is_shared ?? false,
                        thumbnail_url: vt.thumbnail_url ?? null,
                        use_count: vt.use_count ?? 0,
                        created_at: vt.created_at,
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

    // Bug 6: Reset category filter + search when switching tabs
    useEffect(() => {
        setActiveCategory('all')
        setSearch('')
        setConfirmDeleteId(null)
        setPage(1)
    }, [activeTab])

    // Feature 14: Reset to page 1 whenever filters change
    useEffect(() => { setPage(1) }, [search, activeCategory, sort])

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

    // Bug 3: My Templates — filtered and sorted (mirrors system template sort logic)
    const sortedMyTemplates = myTemplates.filter(t => {
        const matchCat = activeCategory === 'all' || matchesCategoryFilter(t.category, activeCategory)
        const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
    }).sort((a, b) => {
        if (sort === 'newest') return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
        return (b.use_count || 0) - (a.use_count || 0)
    })

    // Feature 14: Paginated system templates (load-more style)
    const pagedSysTemplates = sortedTemplates.slice(0, page * PAGE_SIZE)
    const hasMoreTemplates = pagedSysTemplates.length < sortedTemplates.length

    // ── Gate 7: Riazify branded footer injected into free-user HTML ───────────
    const RIAZIFY_FOOTER = `
<!-- Powered by Riazify Design Studio — https://riazify.com -->
<div style="margin-top:24px;padding:12px 16px;border-top:2px solid #ede9fe;background:#f8f7ff;border-radius:0 0 8px 8px;text-align:center;font-family:'DM Sans',Arial,sans-serif;font-size:11px;color:#7530fb;letter-spacing:0.02em;">
  <span style="font-weight:700;">Designed with</span>
  <a href="https://riazify.com" target="_blank" rel="noopener noreferrer"
     style="color:#7530fb;font-weight:800;text-decoration:none;margin-left:4px;">Riazify Design Studio</a>
  <span style="opacity:0.5;margin:0 6px;">·</span>
  <span style="opacity:0.6;">Upgrade to Pro to remove this footer</span>
</div>`

    function injectRiazifyFooter(html: string): string {
        if (!html) return html
        // Insert before </body> if it exists, otherwise append
        if (html.includes('</body>')) {
            return html.replace('</body>', `${RIAZIFY_FOOTER}\n</body>`)
        }
        return html + RIAZIFY_FOOTER
    }

    // ── Copy HTML ──────────────────────────────────────────────────────────
    // Bug 8: For visual_templates records, refetch fresh blocks_json so the copied HTML
    // is not stale (description_html is computed once at page-load time).
    async function copyHtml(t: ListingTemplate) {
        const isVisualTemplate = !t.is_system && t.description === 'Visual Builder template'
        let html = t.description_html

        if (isVisualTemplate) {
            try {
                const { data: vt } = await (supabase as any)
                    .from('visual_templates')
                    .select('blocks_json, canvas_settings_json')
                    .eq('id', t.id)
                    .single()
                if (vt) {
                    const blocks = Array.isArray(vt.blocks_json) ? vt.blocks_json : []
                    html = blocks.length > 0 ? assembleDocument(blocks, vt.canvas_settings_json ?? undefined) : null
                }
            } catch {
                // fall back to cached html
            }
        }

        if (!html) return
        // Gate 7: append branded footer for free users
        const htmlToWrite = designStudioPlan === 'free' ? injectRiazifyFooter(html) : html
        await navigator.clipboard.writeText(htmlToWrite)
        setCopiedId(t.id)
        setTimeout(() => setCopiedId(null), 2000)

        // Bump use_count only for real listing_templates records (system/html-editor templates)
        if (!isVisualTemplate && t.id) {
            await rawDb.from('listing_templates')
                .update({ use_count: (t.use_count || 0) + 1 })
                .eq('id', t.id)
        }
    }

    // ── Download template as .html ─────────────────────────────────────────
    async function downloadTemplate(t: ListingTemplate) {
        // Gate 1 — download is Pro only
        if (designStudioPlan === 'free') {
            showUpgrade('Download HTML is a Pro feature.')
            return
        }
        const isVisualTemplate = !t.is_system && t.description === 'Visual Builder template'
        let html = t.description_html

        if (isVisualTemplate) {
            try {
                const { data: vt } = await (supabase as any)
                    .from('visual_templates')
                    .select('blocks_json, canvas_settings_json')
                    .eq('id', t.id)
                    .single()
                if (vt) {
                    const blocks = Array.isArray(vt.blocks_json) ? vt.blocks_json : []
                    html = blocks.length > 0 ? assembleDocument(blocks, vt.canvas_settings_json ?? undefined) : null
                }
            } catch {
                // fall back to cached html
            }
        }

        if (!html) return
        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${t.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`
        a.click()
        URL.revokeObjectURL(url)
    }

    // ── Share modal toggle ─────────────────────────────────────────────────
    // Called from inside ShareModal — toggles is_shared and updates local state.
    // Sharing is free and unlimited for all users — no Pro gate here.
    async function toggleTemplateShared(t: ListingTemplate) {
        const nextShared = !t.is_shared

        setSharingId(t.id)
        const isVisual = !t.is_system && t.description === 'Visual Builder template'
        try {
            // visual_templates uses RLS (auth.uid() = user_id) → must use authenticated supabase client
            // listing_templates uses rawDb (service-like untyped client) — keep as-is
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const authDb = supabase as any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const anonDb = rawDb as any

            if (isVisual && nextShared) {
                // Fetch blocks + settings to generate share_html for the public page
                const { data: vt } = await authDb
                    .from('visual_templates')
                    .select('blocks_json, canvas_settings_json')
                    .eq('id', t.id)
                    .single()
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const blocks = (vt?.blocks_json ?? []) as any[]
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const settings = (vt?.canvas_settings_json ?? undefined) as any
                const html = assembleDocument(blocks, settings)
                await authDb
                    .from('visual_templates')
                    .update({ is_shared: true, share_html: html })
                    .eq('id', t.id)
            } else if (isVisual) {
                // Turning off — just clear the flag
                await authDb
                    .from('visual_templates')
                    .update({ is_shared: false })
                    .eq('id', t.id)
            } else {
                // listing_templates — use rawDb as before
                await anonDb
                    .from('listing_templates')
                    .update({ is_shared: nextShared })
                    .eq('id', t.id)
            }

            const updated = { ...t, is_shared: nextShared }
            setMyTemplates(prev => prev.map(mt => mt.id === t.id ? updated : mt))
            setShareModalTemplate(updated)
        } catch {
            // silently ignore
        } finally {
            setSharingId(null)
        }
    }

    // ── Duplicate template ────────────────────────────────────────────────
    // System templates: saved to My Templates (visual_templates); tab switches to show them.
    // Own templates: creates a "Copy of …" variant in visual_templates.
    async function duplicateTemplate(t: ListingTemplate) {
        const isSystemTpl = !!t.is_system
        const isVisual = !t.is_system && t.description === 'Visual Builder template'
        setDuplicatingId(t.id)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Gate 4 — free users limited to 5 saved templates (same check as visual editor handleSaveDraft)
            if (designStudioPlan === 'free') {
                const { count } = await (supabase as any)
                    .from('visual_templates')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                if ((count ?? 0) >= 5) {
                    showUpgrade('Free plan allows up to 5 saved templates. Upgrade to Pro for unlimited templates.')
                    return
                }
            }

            if (isSystemTpl) {
                const { data: src } = await rawDb
                    .from('listing_templates')
                    .select('blocks_json, category')
                    .eq('id', t.id)
                    .single()
                await (supabase as any)
                    .from('visual_templates')
                    .insert({
                        user_id: user.id,
                        name: t.name,
                        category: (src as any)?.category || t.category || 'general',
                        blocks_json: (src as any)?.blocks_json ?? null,
                        source_template_id: t.id,
                        updated_at: new Date().toISOString(),
                    })
                router.push('/dashboard/design?tab=my-templates')
            } else if (isVisual) {
                const { data: src } = await (supabase as any)
                    .from('visual_templates')
                    .select('blocks_json, canvas_settings_json, category')
                    .eq('id', t.id)
                    .single()
                const { data: newVt } = await (supabase as any)
                    .from('visual_templates')
                    .insert({
                        user_id: user.id,
                        name: `Copy of ${t.name}`,
                        category: src?.category || t.category || 'general',
                        blocks_json: src?.blocks_json ?? null,
                        canvas_settings_json: src?.canvas_settings_json ?? null,
                        updated_at: new Date().toISOString(),
                    })
                    .select('id, user_id, name, category, updated_at, blocks_json, canvas_settings_json')
                    .single()
                if (newVt) {
                    const blocks = Array.isArray(newVt.blocks_json) ? newVt.blocks_json : []
                    const html = blocks.length > 0 ? assembleDocument(blocks, newVt.canvas_settings_json ?? undefined) : null
                    setMyTemplates((prev: ListingTemplate[]) => [{
                        id: newVt.id, user_id: newVt.user_id, name: newVt.name,
                        description: 'Visual Builder template',
                        category: newVt.category || 'general',
                        description_html: html,
                        is_system: false, is_shared: false, thumbnail_url: null,
                        use_count: 0, created_at: newVt.updated_at, updated_at: newVt.updated_at,
                        tags: null, sort_order: null, is_featured: null, is_new_badge: null, is_pro: null,
                    }, ...prev])
                }
            }
        } catch (err) {
            console.error('[design] duplicateTemplate error:', err)
        } finally {
            setDuplicatingId(null)
        }
    }

    // ── Use Template / Apply to Listing ───────────────────────────────────
    // Opens the listing picker modal — user selects a listing, then we write
    // the template's HTML directly to listing_drafts.description_html.
    function useTemplate(t: ListingTemplate) {
        setUseTemplateTarget(t)
    }

    // Called when the user confirms a listing in the picker modal.
    async function applyTemplateToListing(listing: LinkedListing) {
        if (!useTemplateTarget) return
        const t = useTemplateTarget
        const isVisual = !t.is_system && t.description === 'Visual Builder template'
        let html = t.description_html
        if (isVisual) {
            try {
                const { data: vt } = await (supabase as any)
                    .from('visual_templates')
                    .select('blocks_json, canvas_settings_json')
                    .eq('id', t.id)
                    .single()
                if (vt) {
                    const blocks = Array.isArray(vt.blocks_json) ? vt.blocks_json : []
                    html = blocks.length > 0 ? assembleDocument(blocks, vt.canvas_settings_json ?? undefined) : null
                }
            } catch { /* use cached */ }
        }
        if (!html) return

        // Write template HTML directly to the selected listing
        try {
            await (supabase as any)
                .from('listing_drafts')
                .update({ description_html: html })
                .eq('id', listing.id)
        } catch (err) {
            console.error('[design] applyTemplateToListing error:', err)
            return
        }

        setUseTemplateTarget(null)
        const listingName = listing.product_name || listing.title || 'listing'
        setApplySuccess(`Template applied to "${listingName}"`)
        setTimeout(() => setApplySuccess(null), 3500)
    }

    // ── Rename template ───────────────────────────────────────────────────
    async function renameTemplate(id: string, newName: string) {
        const trimmed = newName.trim()
        if (!trimmed) return
        await (supabase as any)
            .from('visual_templates')
            .update({ name: trimmed, updated_at: new Date().toISOString() })
            .eq('id', id)
        setMyTemplates((prev: ListingTemplate[]) =>
            prev.map((t: ListingTemplate) => t.id === id ? { ...t, name: trimmed } : t)
        )
    }

    // ── Delete own template ────────────────────────────────────────────────
    // Bug 4: Two-step confirmation — first click sets confirmDeleteId, second click deletes
    async function deleteTemplate(id: string) {
        // Guard: only delete own templates, never system ones
        const isSystem = [...templates].some(t => t.id === id)
        if (isSystem) return

        // First click — ask for confirmation
        if (confirmDeleteId !== id) {
            setConfirmDeleteId(id)
            return
        }

        // Second click (confirmed) — proceed with deletion
        setConfirmDeleteId(null)
        setDeletingId(id)
        // Own templates live in visual_templates (saved by the Visual Builder)
        await (supabase as any).from('visual_templates').delete().eq('id', id)
        setMyTemplates((prev: ListingTemplate[]) => prev.filter((t: ListingTemplate) => t.id !== id))
        setDeletingId(null)
    }

    // ── Editor route helper ────────────────────────────────────────────────
    // ── Edit-template handler ──────────────────────────────────────────────────
    // System templates: always create a fresh user copy in visual_templates, then
    // open that copy so the original gallery template is never modified.
    // User's own templates (visual_templates): open directly.
    // HTML editor templates: open in html-editor.
    const [copyingTemplateId, setCopyingTemplateId] = useState<string | null>(null)
    const [duplicatingId, setDuplicatingId] = useState<string | null>(null)

    // Feature 13: Listing picker modal — "Use Template" opens this, user picks a listing
    const [useTemplateTarget, setUseTemplateTarget] = useState<ListingTemplate | null>(null)
    const [applySuccess, setApplySuccess] = useState<string | null>(null)

    // HTML file import — hidden <input type="file"> triggered by the gallery card
    const fileInputRef = useRef<HTMLInputElement>(null)
    function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = ev => {
            const imported = ev.target?.result as string
            if (!imported) return
            // Derive a template name from the filename (strip extension, humanise)
            const templateName = file.name
                .replace(/\.html?$/i, '')
                .replace(/[-_]/g, ' ')
                .trim() || 'Imported Template'
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('import_html', imported)
                sessionStorage.setItem('import_filename', templateName)
            }
            router.push(`/dashboard/design/html-editor?name=${encodeURIComponent(templateName)}&from=import`)
        }
        reader.readAsText(file)
        e.target.value = '' // allow re-importing the same file
    }

    async function handleEditTemplate(t: ListingTemplate) {
        const isVisual = t.is_system || (t.description || '').toLowerCase().includes('visual builder')

        if (!isVisual) {
            // HTML editor template — open directly
            router.push(`/dashboard/design/html-editor?name=${encodeURIComponent(t.name)}&id=${t.id}`)
            return
        }

        if (!t.is_system) {
            // User's own visual_templates record — open directly via vt_id
            router.push(`/dashboard/design/visual-editor?vt_id=${t.id}`)
            return
        }

        // System template — create a fresh copy in visual_templates for this user
        setCopyingTemplateId(t.id)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Fetch full template data (blocks_json + html) from listing_templates
            const { data: src } = await rawDb
                .from('listing_templates')
                .select('description_html, blocks_json, category')
                .eq('id', t.id)
                .single()

            const { data: newVt, error } = await (supabase as any)
                .from('visual_templates')
                .insert({
                    user_id: user.id,
                    name: t.name,
                    category: src?.category || t.category || 'general',
                    blocks_json: src?.blocks_json ?? null,
                    source_template_id: t.id,
                    updated_at: new Date().toISOString(),
                })
                .select('id')
                .single()

            if (error || !newVt) {
                console.error('[design] copy template error:', error)
                return
            }

            router.push(`/dashboard/design/visual-editor?vt_id=${newVt.id}`)
        } catch (err) {
            console.error('[design] handleEditTemplate error:', err)
        } finally {
            setCopyingTemplateId(null)
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
                        <div className="flex items-center gap-2 shrink-0" style={{ position: 'relative' }}>
                            {/* Split button: main = Visual Builder, dropdown = HTML Editor */}
                            <NewTemplateButton
                                onVisual={() => router.push('/dashboard/design/visual-editor?name=New+Visual+Template')}
                                onHtml={() => router.push('/dashboard/design/html-editor?name=New+Template')}
                            />
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
                                        value={aiPrompt}
                                        onChange={e => setAiPrompt(e.target.value)}
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

                        {/* Import HTML File card */}
                        <div className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all hover:shadow-md"
                            style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface }}
                            onClick={() => fileInputRef.current?.click()}>
                            <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                                style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }}>
                                <FileUp size={16} style={{ color: '#d97706' }} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[14px] font-bold mb-0.5" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>Import HTML File</p>
                                <p className="text-[12px] leading-relaxed" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                    Upload an existing .html file and open it in the editor as a new template.
                                </p>
                                <button className="mt-2 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                                    style={{ border: `1px solid #d97706`, color: '#d97706', fontFamily: 'DM Sans, sans-serif', background: 'none' }}>
                                    + Upload File
                                </button>
                            </div>
                        </div>

                        {/* Hidden file input — triggered by the card above */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".html,.htm"
                            style={{ display: 'none' }}
                            onChange={handleFileImport}
                        />

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
                                    <div className="cat-list-scroll" style={{ maxHeight: 280, overflowY: 'auto', padding: '6px 6px' }}>
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
                    ) : (activeTab !== 'my-templates' && sortedTemplates.length === 0) ? (
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
                                            onClick={() => router.push('/dashboard/design/visual-editor')}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:opacity-90"
                                            style={{ backgroundColor: C.primary, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                            <Plus size={14} /> Visual Builder
                                        </button>
                                        <button
                                            onClick={() => setShowAiModal(true)}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:opacity-80"
                                            style={{ backgroundColor: C.surface, color: C.primary, border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                            <Zap size={14} /> Generate with AI
                                        </button>
                                    </div>
                                    <p className="text-[11px] mt-3" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                        Or{' '}
                                        <button
                                            onClick={() => router.push('/dashboard/design/html-editor?name=New+Template')}
                                            style={{ color: C.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 11, padding: 0, textDecoration: 'underline' }}>
                                            open HTML editor
                                        </button>
                                        {' '}for advanced users
                                    </p>
                                </div>
                            )}

                            {/* My Templates — no search results */}
                            {activeTab === 'my-templates' && myTemplates.length > 0 && sortedMyTemplates.length === 0 && (
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
                            {activeTab === 'my-templates' && sortedMyTemplates.length > 0 && (
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
                                        {sortedMyTemplates.map(t => (
                                            <TemplateCard
                                                key={t.id}
                                                template={t}
                                                isOwn
                                                copiedId={copiedId}
                                                deletingId={deletingId}
                                                confirmDeleteId={confirmDeleteId}
                                                copyingTemplateId={copyingTemplateId}
                                                duplicatingId={duplicatingId}
                                                sharingId={sharingId}
                                                onPreview={() => setPreviewTemplate(t)}
                                                onCopy={() => copyHtml(t)}
                                                onDelete={() => deleteTemplate(t.id)}
                                                onCancelDelete={() => setConfirmDeleteId(null)}
                                                onEdit={() => handleEditTemplate(t)}
                                                onDuplicate={() => duplicateTemplate(t)}
                                                onUse={() => useTemplate(t)}
                                                onRename={(id, name) => renameTemplate(id, name)}
                                                onShare={() => setShareModalTemplate(t)}
                                                onDownload={() => downloadTemplate(t)}
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
                                                {pagedSysTemplates.map(t => (
                                                    <TemplateCard
                                                        key={t.id}
                                                        template={t}
                                                        isOwn={false}
                                                        isProLocked={!!t.is_pro && designStudioPlan === 'free'}
                                                        copiedId={copiedId}
                                                        deletingId={deletingId}
                                                        confirmDeleteId={confirmDeleteId}
                                                        copyingTemplateId={copyingTemplateId}
                                                        duplicatingId={duplicatingId}
                                                        onPreview={() => setPreviewTemplate(t)}
                                                        onCopy={() => copyHtml(t)}
                                                        onDelete={() => deleteTemplate(t.id)}
                                                        onCancelDelete={() => setConfirmDeleteId(null)}
                                                        onEdit={() => handleEditTemplate(t)}
                                                        onDuplicate={() => duplicateTemplate(t)}
                                                        onUse={() => useTemplate(t)}
                                                        onDownload={() => downloadTemplate(t)}
                                                        onUpgrade={() => showUpgrade('This is a Pro template. Upgrade to use and edit it.')}
                                                    />
                                                ))}
                                            </div>
                                            {/* Feature 14: Load more */}
                                            {hasMoreTemplates && (
                                                <div className="flex flex-col items-center gap-2 mt-8">
                                                    <p className="text-[12px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                                        Showing {pagedSysTemplates.length} of {sortedTemplates.length} templates
                                                    </p>
                                                    <button
                                                        onClick={() => setPage(p => p + 1)}
                                                        className="flex items-center gap-2 px-6 py-2 rounded-xl text-[13px] font-semibold transition-all hover:opacity-80"
                                                        style={{ backgroundColor: C.primaryLight, color: C.primary, border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                                                        Load More ({sortedTemplates.length - pagedSysTemplates.length} remaining)
                                                    </button>
                                                </div>
                                            )}
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
                onEdit={t => handleEditTemplate(t as ListingTemplate)}
                onCopy={t => copyHtml(t as ListingTemplate)}
                copiedId={copiedId}
            />

            {/* AI Generator Modal */}
            <AiTemplateGenerator
                open={showAiModal}
                onClose={() => setShowAiModal(false)}
                initialPrompt={aiPrompt}
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

            {/* Feature 13: Listing Picker — "Use Template" opens this; onConfirm writes HTML to listing_drafts */}
            {useTemplateTarget && (
                <ListingPickerModal
                    onClose={() => setUseTemplateTarget(null)}
                    onConfirm={applyTemplateToListing}
                    title="Apply Template"
                    subtitle={`Choose a listing to apply "${useTemplateTarget.name}" to`}
                    confirmLabel="Apply Template"
                />
            )}

            {/* Feature 13: Success toast shown after template is applied */}
            {applySuccess && (
                <div style={{
                    position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 10001,
                    backgroundColor: C.success, color: '#fff',
                    padding: '11px 22px', borderRadius: 12,
                    fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
                    boxShadow: '0 6px 24px rgba(22, 163, 74, 0.35)',
                    display: 'flex', alignItems: 'center', gap: 8,
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {applySuccess}
                </div>
            )}

            {/* Share Modal */}
            {shareModalTemplate && (
                <ShareModal
                    template={shareModalTemplate}
                    sharingId={sharingId}
                    onToggle={() => toggleTemplateShared(shareModalTemplate)}
                    onClose={() => setShareModalTemplate(null)}
                />
            )}

            {/* Pro Upgrade Modal */}
            {showUpgradeModal && (
                <ProUpgradeModal
                    reason={upgradeReason}
                    onClose={() => { setShowUpgradeModal(false); setUpgradeReason(undefined) }}
                    onUpgrade={() => {
                        setShowUpgradeModal(false)
                        setUpgradeReason(undefined)
                        // TODO: router.push('/dashboard/upgrade?plan=design-studio-pro')
                    }}
                />
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                /* Hide scrollbar only on the category dropdown list, not globally */
                .cat-list-scroll::-webkit-scrollbar { display: none; }
                .cat-list-scroll { scrollbar-width: none; }
            `}</style>
        </div>
    )
}

// ── New Template split button ──────────────────────────────────────────────
function NewTemplateButton({ onVisual, onHtml }: { onVisual: () => void; onHtml: () => void }) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        if (open) document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [open])

    return (
        <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
            {/* Main action */}
            <button
                onClick={onVisual}
                className="flex items-center gap-1.5 text-[13px] font-bold transition-all hover:opacity-90"
                style={{
                    backgroundColor: C.primary, color: '#fff',
                    border: 'none', cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    padding: '8px 16px 8px 14px',
                    borderRadius: '12px 0 0 12px',
                    borderRight: '1px solid rgba(255,255,255,0.25)',
                }}>
                <Plus size={14} /> New Template
            </button>
            {/* Dropdown arrow */}
            <button
                onClick={() => setOpen(v => !v)}
                className="flex items-center justify-center transition-all hover:opacity-90"
                style={{
                    backgroundColor: C.primary, color: '#fff',
                    border: 'none', cursor: 'pointer',
                    padding: '8px 10px',
                    borderRadius: '0 12px 12px 0',
                    width: 34,
                }}>
                <ChevronDown size={14} style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>
            {/* Dropdown menu */}
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                    minWidth: 200, backgroundColor: C.surface,
                    border: `1px solid ${C.border}`, borderRadius: 12,
                    boxShadow: '0 8px 24px rgba(117,48,251,0.12)',
                    zIndex: 50, overflow: 'hidden',
                    fontFamily: 'DM Sans, sans-serif',
                }}>
                    <button
                        onClick={() => { setOpen(false); onVisual() }}
                        className="w-full flex items-center gap-3 text-left transition-colors"
                        style={{ padding: '11px 16px', border: 'none', background: 'none', cursor: 'pointer', color: C.dark }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.primaryLight)}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Layers size={14} style={{ color: C.primary }} />
                        </div>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>Visual Builder</p>
                            <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Drag-and-drop blocks</p>
                        </div>
                    </button>
                    <div style={{ height: 1, backgroundColor: C.border, margin: '0 12px' }} />
                    <button
                        onClick={() => { setOpen(false); onHtml() }}
                        className="w-full flex items-center gap-3 text-left transition-colors"
                        style={{ padding: '11px 16px', border: 'none', background: 'none', cursor: 'pointer', color: C.dark }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.primaryLight)}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Code2 size={14} style={{ color: C.primary }} />
                        </div>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>HTML Editor</p>
                            <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Write or paste HTML directly</p>
                        </div>
                    </button>
                </div>
            )}
        </div>
    )
}

// ── Template Card component ────────────────────────────────────────────────
interface CardProps {
    template: ListingTemplate
    isOwn: boolean
    isProLocked?: boolean
    copiedId: string | null
    deletingId: string | null
    confirmDeleteId?: string | null
    copyingTemplateId?: string | null
    duplicatingId?: string | null
    sharingId?: string | null
    onPreview: () => void
    onCopy: () => void
    onDelete: () => void
    onCancelDelete?: () => void
    onEdit: () => void
    onDuplicate?: () => void
    onUse?: () => void
    onRename?: (id: string, newName: string) => void
    onShare?: () => void
    onDownload?: () => void
    onUpgrade?: () => void
}

function TemplateCard({ template, isOwn, isProLocked, copiedId, deletingId, confirmDeleteId, copyingTemplateId, duplicatingId, sharingId, onPreview, onCopy, onDelete, onCancelDelete, onEdit, onDuplicate, onUse, onRename, onShare, onDownload, onUpgrade }: CardProps) {
    const [hovered, setHovered] = useState(false)
    // Feature 12: Inline rename state
    const [renaming, setRenaming] = useState(false)
    const [renameValue, setRenameValue] = useState(template.name)
    const copied = copiedId === template.id
    const deleting = deletingId === template.id
    const confirmingDelete = confirmDeleteId === template.id
    const copying = copyingTemplateId === template.id
    const duplicating = duplicatingId === template.id
    const sharing = sharingId === template.id
    const isFeaturedCard = !!template.is_featured

    function commitRename() {
        const trimmed = renameValue.trim()
        if (trimmed && trimmed !== template.name) onRename?.(template.id, trimmed)
        setRenaming(false)
    }

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

                {/* Gate 6: Pro lock overlay for premium system templates */}
                {isProLocked && (
                    <ProLockOverlay onUpgrade={() => onUpgrade?.()} />
                )}

                {/* Hover actions — soft bottom gradient + action buttons */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-4"
                    style={{
                        background: 'linear-gradient(to bottom, transparent 0%, rgba(248,247,255,0.92) 60%, rgba(248,247,255,1) 100%)',
                        opacity: hovered ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                        zIndex: 3,
                        paddingTop: 32,
                    }}>
                    <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={e => { e.stopPropagation(); onPreview() }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold"
                                style={{ backgroundColor: '#fff', color: C.dark, border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
                                <Eye size={13} /> Preview
                            </button>
                            <button
                                onClick={e => { e.stopPropagation(); if (isProLocked) { onUpgrade?.(); return } if (!copying) onEdit() }}
                                disabled={copying}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold"
                                style={{ backgroundColor: C.primary, color: '#fff', border: 'none', cursor: copying ? 'not-allowed' : 'pointer', opacity: copying ? 0.7 : 1, fontFamily: 'DM Sans, sans-serif', boxShadow: '0 2px 8px rgba(117,48,251,0.3)' }}>
                                {copying ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : isProLocked ? <ProBadge size="xs" /> : <Pencil size={13} />}
                                {copying ? 'Copying…' : isProLocked ? 'Pro Only' : 'Edit'}
                            </button>
                        </div>
                        {/* Feature 13: Use Template + Feature 11: Duplicate */}
                        <div className="flex items-center gap-2">
                            {onUse && (
                                <button
                                    onClick={e => { e.stopPropagation(); if (isProLocked) { onUpgrade?.(); return } onUse() }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold"
                                    style={{ backgroundColor: isProLocked ? '#f59e0b' : C.success, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', boxShadow: isProLocked ? '0 2px 8px rgba(245,158,11,0.3)' : '0 2px 8px rgba(22,163,74,0.3)' }}>
                                    {isProLocked ? <ProBadge size="xs" style={{ background: 'rgba(255,255,255,0.25)', boxShadow: 'none' }} /> : <ArrowRight size={13} />}
                                    {isProLocked ? 'Pro Only' : 'Use Template'}
                                </button>
                            )}
                            {onDuplicate && (
                                <button
                                    onClick={e => { e.stopPropagation(); if (isProLocked) { onUpgrade?.(); return } if (!duplicating) onDuplicate() }}
                                    disabled={duplicating}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold"
                                    style={{ backgroundColor: isProLocked ? '#fef3c7' : '#fff', color: isProLocked ? C.warning : C.secondary, border: `1px solid ${isProLocked ? '#fde68a' : C.border}`, cursor: duplicating ? 'not-allowed' : 'pointer', opacity: duplicating ? 0.7 : 1, fontFamily: 'DM Sans, sans-serif', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                    {duplicating ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : isProLocked ? <ProBadge size="xs" style={{ background: 'rgba(245,158,11,0.15)', boxShadow: 'none' }} /> : <Files size={13} />}
                                    {duplicating ? 'Saving…' : isProLocked ? 'Pro Only' : isOwn ? 'Duplicate' : 'Save Copy'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-3 py-2.5 flex items-center justify-between gap-2"
                style={{ borderTop: `1px solid ${C.border}` }}>
                <div className="min-w-0 flex-1">
                    {/* Feature 12: Inline rename — click pencil icon to edit name */}
                    {renaming ? (
                        <input
                            autoFocus
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onBlur={commitRename}
                            onKeyDown={e => {
                                if (e.key === 'Enter') { e.preventDefault(); commitRename() }
                                if (e.key === 'Escape') { setRenaming(false); setRenameValue(template.name) }
                            }}
                            className="w-full text-[12px] font-bold px-2 py-0.5 rounded-md outline-none"
                            style={{
                                border: `1px solid ${C.primary}`, color: C.dark,
                                fontFamily: 'DM Sans, sans-serif', backgroundColor: C.primaryLight,
                            }}
                        />
                    ) : (
                        <div className="flex items-center gap-1 min-w-0">
                            <p className="text-[12px] font-bold truncate" style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                                {template.name}
                            </p>
                            {/* Rename pencil — only for own templates, shown on hover */}
                            {isOwn && hovered && (
                                <button
                                    onClick={e => { e.stopPropagation(); setRenameValue(template.name); setRenaming(true) }}
                                    title="Rename"
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '1px 3px', borderRadius: 4, display: 'flex', flexShrink: 0 }}>
                                    <PenLine size={11} style={{ color: C.muted }} />
                                </button>
                            )}
                        </div>
                    )}
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
                    {/* Bug 4: Inline delete confirmation */}
                    {confirmingDelete ? (
                        <>
                            <span style={{ fontSize: 10, color: C.danger, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, whiteSpace: 'nowrap' }}>Delete?</span>
                            <button
                                onClick={onDelete}
                                title="Confirm delete"
                                style={{ width: 28, height: 28, border: `1px solid ${C.danger}`, backgroundColor: C.dangerBg, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.danger, flexShrink: 0 }}>
                                {deleting ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={12} />}
                            </button>
                            <button
                                onClick={() => onCancelDelete?.()}
                                title="Cancel"
                                style={{ width: 28, height: 28, border: `1px solid ${C.border}`, backgroundColor: C.surface, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.secondary, flexShrink: 0 }}>
                                <X size={12} />
                            </button>
                        </>
                    ) : (
                        <>
                            <IconButton onClick={onCopy}
                                icon={copied ? <Check size={12} /> : <Copy size={12} />}
                                tooltip={copied ? 'Copied!' : 'Copy HTML'}
                                active={copied} variant={copied ? 'success' : 'default'} size={28} />
                            {/* Feature 11: Duplicate icon button */}
                            {onDuplicate && (
                                <IconButton
                                    onClick={duplicating ? undefined : onDuplicate}
                                    icon={duplicating ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Files size={12} />}
                                    tooltip={duplicating ? 'Duplicating…' : isOwn ? 'Duplicate' : 'Save copy to My Templates'}
                                    size={28} />
                            )}
                            {/* Bug 5: Spinner on Edit when copying system template */}
                            <IconButton onClick={copying ? undefined : onEdit}
                                icon={copying ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Pencil size={12} />}
                                tooltip={copying ? 'Copying template…' : 'Edit template'} size={28} />
                            {isOwn && onShare && (
                                <IconButton
                                    onClick={onShare}
                                    icon={<Link2 size={12} />}
                                    tooltip={template.is_shared ? 'Sharing on — manage link' : 'Share template'}
                                    active={!!template.is_shared}
                                    size={28} />
                            )}
                            {onDownload && (
                                <IconButton
                                    onClick={onDownload}
                                    icon={<Download size={12} />}
                                    tooltip="Download .html"
                                    size={28} />
                            )}
                            {isOwn && (
                                <IconButton onClick={onDelete}
                                    icon={<Trash2 size={12} />}
                                    tooltip="Delete" size={28} />
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

// ── Share Modal component ─────────────────────────────────────────────────────
interface ShareModalProps {
    template: ListingTemplate
    sharingId: string | null
    onToggle: () => void
    onClose: () => void
}

function ShareModal({ template, sharingId, onToggle, onClose }: ShareModalProps) {
    const [copiedLink, setCopiedLink] = useState(false)
    const isShared = !!template.is_shared
    const isToggling = sharingId === template.id
    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/share/template/${template.id}`
        : `/share/template/${template.id}`

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopiedLink(true)
            setTimeout(() => setCopiedLink(false), 2000)
        } catch { /* ignore */ }
    }

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9998,
                    background: 'rgba(30,21,53,0.45)',
                    backdropFilter: 'blur(3px)',
                }}
            />

            {/* Modal panel */}
            <div style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 9999,
                width: 'min(440px, calc(100vw - 32px))',
                background: C.surface,
                borderRadius: 20,
                boxShadow: '0 20px 60px rgba(117,48,251,0.22)',
                border: `1px solid ${C.border}`,
                fontFamily: 'DM Sans, sans-serif',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '18px 20px 14px',
                    borderBottom: `1px solid ${C.border}`,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: C.primaryLight,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `1px solid ${C.border}`,
                        }}>
                            <Link2 size={15} color={C.primary} />
                        </div>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 800, color: C.dark, margin: 0, lineHeight: 1.2 }}>
                                Share Template
                            </p>
                            <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.2, marginTop: 2 }}>
                                {template.name}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: 28, height: 28, borderRadius: 7, border: `1px solid ${C.border}`,
                            background: C.bg, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: C.muted,
                        }}>
                        <X size={13} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '20px 20px 24px' }}>

                    {/* Toggle row */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 16px',
                        background: isShared ? C.primaryLight : C.bg,
                        borderRadius: 12,
                        border: `1px solid ${C.border}`,
                        marginBottom: 16,
                        transition: 'background 0.2s',
                    }}>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: 0 }}>
                                Public link
                            </p>
                            <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 0', lineHeight: 1.4 }}>
                                {isShared
                                    ? 'Anyone with the link can view this template'
                                    : 'Enable to generate a shareable link'}
                            </p>
                        </div>

                        {/* Toggle switch */}
                        <button
                            onClick={isToggling ? undefined : onToggle}
                            disabled={isToggling}
                            title={isShared ? 'Turn off sharing' : 'Turn on sharing'}
                            style={{
                                width: 44, height: 24, borderRadius: 12,
                                background: isShared ? C.primary : '#d1d5db',
                                border: 'none', cursor: isToggling ? 'not-allowed' : 'pointer',
                                position: 'relative', transition: 'background 0.2s',
                                flexShrink: 0,
                                opacity: isToggling ? 0.6 : 1,
                            }}>
                            {isToggling
                                ? <Loader2 size={12} color="#fff"
                                    style={{
                                        position: 'absolute', top: '50%', left: '50%',
                                        transform: 'translate(-50%,-50%)',
                                        animation: 'spin 1s linear infinite',
                                    }} />
                                : <span style={{
                                    position: 'absolute', top: 3,
                                    left: isShared ? 23 : 3,
                                    width: 18, height: 18, borderRadius: '50%',
                                    background: '#fff',
                                    transition: 'left 0.2s',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                                }} />
                            }
                        </button>
                    </div>

                    {/* Link box — only shown when shared */}
                    {isShared && (
                        <div style={{ marginBottom: 16 }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: C.secondary, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                Shareable link
                            </p>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                background: C.bg, borderRadius: 10,
                                border: `1px solid ${C.border}`,
                                padding: '8px 10px',
                            }}>
                                <input
                                    readOnly
                                    value={shareUrl}
                                    onClick={e => (e.target as HTMLInputElement).select()}
                                    style={{
                                        flex: 1, border: 'none', background: 'transparent',
                                        fontSize: 12, color: C.dark, fontFamily: 'DM Sans, sans-serif',
                                        outline: 'none', minWidth: 0,
                                    }}
                                />
                                {/* Copy button */}
                                <button
                                    onClick={copyLink}
                                    title="Copy link"
                                    style={{
                                        flexShrink: 0, width: 30, height: 30, borderRadius: 7,
                                        border: `1px solid ${copiedLink ? C.success : C.border}`,
                                        background: copiedLink ? '#dcfce7' : C.surface,
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.15s',
                                        color: copiedLink ? C.success : C.secondary,
                                    }}>
                                    {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                                </button>
                                {/* Open in new tab */}
                                <a
                                    href={shareUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Open link"
                                    style={{
                                        flexShrink: 0, width: 30, height: 30, borderRadius: 7,
                                        border: `1px solid ${C.border}`,
                                        background: C.surface,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: C.secondary, textDecoration: 'none',
                                    }}>
                                    <ArrowRight size={12} />
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Info row */}
                    <div style={{
                        display: 'flex', alignItems: 'flex-start', gap: 8,
                        padding: '10px 14px',
                        background: C.bg, borderRadius: 10,
                        border: `1px solid ${C.border}`,
                    }}>
                        <ShieldCheck size={14} color={C.muted} style={{ marginTop: 1, flexShrink: 0 }} />
                        <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.6 }}>
                            {isShared
                                ? 'Viewers can see your template but cannot edit it. Turn off the link at any time to revoke access.'
                                : 'Your template is private. Enable the public link to share it with clients or colleagues.'}
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
