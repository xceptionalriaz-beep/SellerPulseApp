'use client'
// app/dashboard/listing-generator/components/LgDashboard.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Listing Studio
// Full listings management dashboard:
//   ✓ 4 KPI metric cards (Active, Drafts, VeRO Alerts, Health Score)
//   ✓ Search + filter toolbar
//   ✓ Status tabs (All / Active / Drafts / Ended / Scheduled)
//   ✓ Bulk action bar when rows selected
//   ✓ Full data table with all listing details
//   ✓ Pagination
//   ✓ Mobile card view
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import {
    Search, Upload, ChevronDown, LayoutList, LayoutGrid,
    CheckCircle2, AlertTriangle, Pencil, ShieldCheck,
    Download, Trash2, ChevronLeft, ChevronRight,
    X, Package, TrendingUp, Circle, Zap,
} from 'lucide-react'

// ── Design tokens ─────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    borderInput: '#e5e0f5',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    accent: '#b8fa33',
    accentText: '#1e1535',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    success: '#16a34a',
    successBg: '#dcfce7',
    warning: '#d97706',
    warningBg: '#fef3c7',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
    info: '#0ea5e9',
    infoBg: '#e0f2fe',
}

// ── Types ─────────────────────────────────────────────────────
type ListingStatus = 'published' | 'draft' | 'ended' | 'scheduled'
type VeroStatus = 'clear' | 'flagged' | 'unchecked'
type SellerType = 'own_stock' | 'wholesale' | 'retail_arb' | 'dropship' | 'pod' | 'reseller'
type TabFilter = 'all' | 'published' | 'draft' | 'ended' | 'scheduled'

interface Listing {
    id: string
    sku: string | null
    title: string | null
    product_name: string | null
    category: string | null
    seller_type: SellerType
    condition: string | null
    sell_price: number | null
    margin: number | null
    net_profit: number | null
    health_score: number
    vero_status: VeroStatus
    quantity: number
    out_of_stock_option: boolean
    status: ListingStatus
    main_photo_url: string | null
    photo_count: number
    created_at: string
    updated_at: string
    source_platform: string | null
    ebay_listing_id: string | null
    item_specifics: Record<string, string> | null
}

interface Metrics {
    total: number
    active: number
    drafts: number
    ended: number
    scheduled: number
    vero_flagged: number
    avg_health: number
}

// ── Props ─────────────────────────────────────────────────────
interface Props {
    onNewListing: () => void
    onEditDraft: (id: string) => void
    onBulkUpload: () => void
}

// ── Health Score Badge ────────────────────────────────────────
function HealthBadge({ score }: { score: number }) {
    const bg = score >= 90 ? C.accent
        : score >= 70 ? C.primaryLight
            : score >= 50 ? C.warningBg
                : C.dangerBg
    const text = score >= 90 ? C.accentText
        : score >= 70 ? C.primary
            : score >= 50 ? C.warning
                : C.danger

    return (
        <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[12px]"
            style={{ backgroundColor: bg, color: text, fontFamily: 'Syne, sans-serif' }}
        >
            {score}
        </div>
    )
}

// ── VeRO Status Cell ──────────────────────────────────────────
function VeroBadge({ status }: { status: VeroStatus }) {
    if (status === 'clear') return (
        <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} style={{ color: C.success }} />
            <span className="text-[12px] font-semibold" style={{ color: C.success, fontFamily: 'DM Sans, sans-serif' }}>Clear</span>
        </div>
    )
    if (status === 'flagged') return (
        <div className="flex items-center gap-1.5">
            <AlertTriangle size={14} style={{ color: C.danger }} />
            <span className="text-[12px] font-semibold" style={{ color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>Flagged</span>
        </div>
    )
    return (
        <div className="flex items-center gap-1.5">
            <Circle size={14} style={{ color: C.muted }} />
            <span className="text-[12px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Unchecked</span>
        </div>
    )
}

// ── Status Pill ───────────────────────────────────────────────
function StatusPill({ status }: { status: ListingStatus }) {
    const config = {
        published: { bg: C.successBg, text: C.success, label: 'Live', dot: C.success },
        draft: { bg: C.primaryLight, text: C.primary, label: 'Draft', dot: C.primary },
        ended: { bg: '#f8f7ff', text: C.muted, label: 'Ended', dot: C.muted },
        scheduled: { bg: C.infoBg, text: C.info, label: 'Scheduled', dot: C.info },
    }[status]

    return (
        <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{ backgroundColor: config.bg, color: config.text, fontFamily: 'DM Sans, sans-serif' }}
        >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.dot }} />
            {config.label}
        </span>
    )
}

// ── Seller Type Pill ──────────────────────────────────────────
function SellerTypePill({ type }: { type: SellerType }) {
    const config = {
        own_stock: { bg: '#f8f7ff', text: C.secondary, label: 'Own Stock' },
        wholesale: { bg: C.infoBg, text: C.info, label: 'Wholesale' },
        retail_arb: { bg: C.successBg, text: C.success, label: 'Retail Arb' },
        dropship: { bg: C.primaryLight, text: C.primary, label: 'Dropship' },
        pod: { bg: C.primaryLight, text: C.primary, label: 'Print on Demand' },
        reseller: { bg: C.warningBg, text: C.warning, label: 'Reseller' },
    }[type]

    return (
        <span
            className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
            style={{ backgroundColor: config.bg, color: config.text, fontFamily: 'DM Sans, sans-serif' }}
        >
            {config.label}
        </span>
    )
}

// ── Stock Cell ────────────────────────────────────────────────
function StockCell({ quantity, outOfStock, sellerType }: {
    quantity: number
    outOfStock: boolean
    sellerType: SellerType
}) {
    if (sellerType === 'dropship') {
        return <span className="text-[12px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>Supplier</span>
    }
    if (quantity === 0 && !outOfStock) {
        return (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                style={{ backgroundColor: C.dangerBg, color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>
                Out of stock
            </span>
        )
    }
    if (quantity <= 3 && quantity > 0) {
        return (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                style={{ backgroundColor: C.warningBg, color: C.warning, fontFamily: 'DM Sans, sans-serif' }}>
                {quantity} left
            </span>
        )
    }
    return <span className="text-[12px]" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>{quantity} in stock</span>
}

// ── GTIN Auto-Detector ───────────────────────────────────────
// Detects whether a number is EAN, UPC or EAN-8 based on digit count
function detectGtinType(value: string): { label: string; color: string; bg: string } {
    const digits = value.replace(/\D/g, '')
    if (digits.length === 12) return { label: 'UPC', color: '#0ea5e9', bg: '#e0f2fe' }
    if (digits.length === 13) return { label: 'EAN', color: '#0ea5e9', bg: '#e0f2fe' }
    if (digits.length === 8) return { label: 'EAN-8', color: '#0ea5e9', bg: '#e0f2fe' }
    return { label: 'GTIN', color: '#6b7280', bg: '#f8f7ff' }
}

// ── Main Dashboard Component ──────────────────────────────────
export default function LgDashboard({ onNewListing: onNewListingProp, onEditDraft, onBulkUpload: onBulkUploadProp }: Props) {
    const supabase = createClient()

    // ── State ───────────────────────────────────────────────────
    const [listings, setListings] = useState<Listing[]>([])
    const [metrics, setMetrics] = useState<Metrics>({
        total: 0, active: 0, drafts: 0, ended: 0,
        scheduled: 0, vero_flagged: 0, avg_health: 0,
    })
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [recentSearches, setRecentSearches] = useState<string[]>([])
    const [showSearchDropdown, setShowSearchDropdown] = useState(false)
    const [activeTab, setActiveTab] = useState<TabFilter>('all')
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(50)
    const [jumpPage, setJumpPage] = useState('')
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

    // Listen for top bar button events
    useEffect(() => {
        function onNewListing() { onNewListingProp() }
        function onBulkUpload() { onBulkUploadProp() }
        window.addEventListener('lg:newListing', onNewListing)
        window.addEventListener('lg:bulkUpload', onBulkUpload)
        return () => {
            window.removeEventListener('lg:newListing', onNewListing)
            window.removeEventListener('lg:bulkUpload', onBulkUpload)
        }
    }, [onNewListingProp, onBulkUploadProp])

    // ── Debounce search 300ms ────────────────────────────────────
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(1)
            // Save to recent searches
            if (search.trim().length > 1) {
                setRecentSearches(prev => {
                    const updated = [search, ...prev.filter(s => s !== search)].slice(0, 5)
                    return updated
                })
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [search])

    // ── Smart search scope auto-detection ────────────────────────
    function detectSearchScope(query: string): 'ean' | 'ebay_id' | 'sku' | 'all' {
        const digits = query.replace(/\D/g, '')
        if (digits.length === 12 || digits.length === 13) return 'ean'
        if (digits.length >= 10 && /^\d+$/.test(query)) return 'ebay_id'
        if (query.toUpperCase().startsWith('SP-') || query.toUpperCase().startsWith('SKU')) return 'sku'
        return 'all'
    }

    // ── Load listings ───────────────────────────────────────────
    const loadListings = useCallback(async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await (supabase.from('listing_drafts') as any)
                .select(`
          id, sku, title, product_name, category, seller_type,
          condition, sell_price, margin, net_profit, health_score,
          vero_status, quantity, out_of_stock_option, status,
          main_photo_url, photo_count, created_at, updated_at,
          source_platform, ebay_listing_id, item_specifics
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (data) {
                const rows = data as Listing[]
                setListings(rows)

                // Calculate metrics
                const active = rows.filter(r => r.status === 'published').length
                const drafts = rows.filter(r => r.status === 'draft').length
                const ended = rows.filter(r => r.status === 'ended').length
                const scheduled = rows.filter(r => r.status === 'scheduled').length
                const flagged = rows.filter(r => r.vero_status === 'flagged').length
                const avgHealth = rows.length
                    ? Math.round(rows.reduce((sum, r) => sum + r.health_score, 0) / rows.length)
                    : 0
                setMetrics({
                    total: rows.length, active, drafts, ended,
                    scheduled, vero_flagged: flagged, avg_health: avgHealth,
                })
            }
        } catch (e) {
            console.error('[LgDashboard] Load error:', e)
        }
        setLoading(false)
    }, [])

    useEffect(() => { loadListings() }, [loadListings])

    // ── Filter listings ─────────────────────────────────────────
    const filtered = listings.filter(l => {
        const matchTab = activeTab === 'all' || l.status === activeTab

        if (!debouncedSearch) return matchTab

        const q = debouncedSearch.toLowerCase().trim()
        const detectedScope = detectSearchScope(debouncedSearch)

        let matchSearch = false

        if (detectedScope === 'ean') {
            const ean = l.item_specifics?.['EAN'] || l.item_specifics?.['UPC'] || l.item_specifics?.['GTIN'] || ''
            matchSearch = ean.includes(debouncedSearch.replace(/\D/g, ''))
        } else if (detectedScope === 'ebay_id') {
            matchSearch = l.ebay_listing_id?.includes(q) || false
        } else if (detectedScope === 'sku') {
            matchSearch = l.sku?.toLowerCase().includes(q) || false
        } else {
            // Default — search everything
            matchSearch = (
                l.title?.toLowerCase().includes(q) ||
                l.product_name?.toLowerCase().includes(q) ||
                l.sku?.toLowerCase().includes(q) ||
                l.category?.toLowerCase().includes(q) ||
                l.condition?.toLowerCase().includes(q) ||
                l.source_platform?.toLowerCase().includes(q) ||
                l.ebay_listing_id?.includes(q) ||
                Object.values(l.item_specifics || {}).some(v => String(v).toLowerCase().includes(q))
            ) || false
        }

        return matchTab && matchSearch
    })

    const PER_PAGE = rowsPerPage
    const totalPages = Math.ceil(filtered.length / PER_PAGE)
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

    // ── Selection ───────────────────────────────────────────────
    function toggleSelect(id: string) {
        setSelectedIds(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    function toggleSelectAll() {
        if (selectedIds.size === paginated.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(paginated.map(l => l.id)))
        }
    }

    function clearSelection() { setSelectedIds(new Set()) }

    // ── Tab counts ──────────────────────────────────────────────
    const tabCounts = {
        all: listings.length,
        published: metrics.active,
        draft: metrics.drafts,
        ended: metrics.ended,
        scheduled: metrics.scheduled,
    }

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: C.bg }}>

            {/* METRIC CARDS - fixed */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-6 pt-4 shrink-0">

                {/* Active Listings */}
                <div className="rounded-2xl p-5 relative overflow-hidden"
                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.success}`, boxShadow: '0 2px 12px rgba(117,48,251,0.06)' }}>
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: C.success }} />
                            <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>Active Listings</span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                            style={{ backgroundColor: C.successBg, color: C.success, fontFamily: 'DM Sans, sans-serif' }}>
                            <TrendingUp size={10} />
                            {metrics.total} total
                        </span>
                    </div>
                    <p className="text-[36px] font-bold leading-none" style={{ color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }}>{metrics.active}</p>
                </div>

                {/* Drafts Ready */}
                <div className="rounded-2xl p-5"
                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.primary}`, boxShadow: '0 2px 12px rgba(117,48,251,0.06)' }}>
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: C.primary }} />
                            <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>Drafts Ready</span>
                        </div>
                        {metrics.drafts > 0 ? (
                            <button onClick={() => setActiveTab('draft')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors hover:opacity-80"
                                style={{ backgroundColor: C.primaryLight, color: C.primary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                                View Drafts
                            </button>
                        ) : (
                            <span className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>No drafts</span>
                        )}
                    </div>
                    <p className="text-[36px] font-bold leading-none" style={{ color: C.primary, fontFamily: 'Syne, sans-serif' }}>{metrics.drafts}</p>
                </div>

                {/* VeRO Alerts */}
                <div className="rounded-2xl p-5"
                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${metrics.vero_flagged > 0 ? C.danger : C.success}`, boxShadow: '0 2px 12px rgba(117,48,251,0.06)' }}>
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${metrics.vero_flagged > 0 ? 'animate-pulse' : ''}`}
                                style={{ backgroundColor: metrics.vero_flagged > 0 ? C.danger : C.success }} />
                            <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>VeRO Alerts</span>
                        </div>
                        {metrics.vero_flagged > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                                style={{ backgroundColor: C.dangerBg, color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>
                                <AlertTriangle size={10} />
                                Flagged
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                                style={{ backgroundColor: C.successBg, color: C.success, fontFamily: 'DM Sans, sans-serif' }}>
                                <CheckCircle2 size={10} />
                                All Clear
                            </span>
                        )}
                    </div>
                    <p className="text-[36px] font-bold leading-none"
                        style={{ color: metrics.vero_flagged > 0 ? C.danger : C.success, fontFamily: 'Syne, sans-serif' }}>
                        {metrics.vero_flagged}
                    </p>
                </div>

                {/* Avg Health Score */}
                <div className="rounded-2xl p-5"
                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.accent}`, boxShadow: '0 2px 12px rgba(117,48,251,0.06)' }}>
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: C.accent }} />
                            <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>Avg Health Score</span>
                        </div>
                        <span className="text-[11px] font-semibold" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>/100</span>
                    </div>
                    <p className="text-[36px] font-bold leading-none mb-2" style={{ color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }}>{metrics.avg_health}</p>
                    <div className="h-1.5 rounded-full" style={{ backgroundColor: C.border }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${metrics.avg_health}%`, backgroundColor: C.accent }} />
                    </div>
                </div>

            </div>

            {/* TOOLBAR + TABLE — flex col, only tbody scrolls */}
            <div className="flex-1 flex flex-col min-h-0 px-6 pb-6 pt-4">

                {/* TOOLBAR CARD — fixed, never scrolls */}
                <div className="rounded-t-2xl overflow-hidden shrink-0"
                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderBottom: 'none', boxShadow: '0 2px 12px rgba(117,48,251,0.06)' }}>

                    {/* ONE ROW — Tabs + Search + Filters + View Toggle */}
                    <div className="flex items-center px-4"
                        style={{ backgroundColor: '#f3eeff', borderBottom: `2px solid #7530fb` }}>

                        {/* Status Tabs */}
                        {(Object.entries(tabCounts) as [TabFilter, number][]).map(([tab, count]) => {
                            const labels: Record<TabFilter, string> = {
                                all: 'All', published: 'Active', draft: 'Drafts', ended: 'Ended', scheduled: 'Scheduled'
                            }
                            const isActive = activeTab === tab
                            return (
                                <button key={tab}
                                    onClick={() => { setActiveTab(tab); setPage(1); clearSelection() }}
                                    className="flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold transition-all whitespace-nowrap"
                                    style={{
                                        color: isActive ? C.primary : C.secondary,
                                        fontFamily: 'DM Sans, sans-serif',
                                        backgroundColor: isActive ? '#ffffff' : 'transparent',
                                        border: isActive ? `2px solid #7530fb` : '2px solid transparent',
                                        borderBottom: isActive ? `2px solid #ffffff` : '2px solid transparent',
                                        borderRadius: '8px 8px 0 0',
                                        marginBottom: '-2px',
                                    }}>
                                    {labels[tab]}
                                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                                        style={{
                                            backgroundColor: isActive ? C.primary : '#ede9fe',
                                            color: isActive ? '#fff' : C.muted,
                                        }}>
                                        {count}
                                    </span>
                                </button>
                            )
                        })}

                        <div className="flex-1" />

                        {/* View toggle */}
                        <div className="flex items-center gap-1">
                            <button onClick={() => setViewMode('table')}
                                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                                style={{ backgroundColor: viewMode === 'table' ? C.primary : C.bg, color: viewMode === 'table' ? '#fff' : C.muted }}>
                                <LayoutList size={14} />
                            </button>
                            <button onClick={() => setViewMode('grid')}
                                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                                style={{ backgroundColor: viewMode === 'grid' ? C.primary : C.bg, color: viewMode === 'grid' ? '#fff' : C.muted }}>
                                <LayoutGrid size={14} />
                            </button>
                        </div>
                    </div>
                </div>{/* end toolbar card */}

                {/* TABLE CARD — one table, sticky thead, scrolling tbody */}
                <div className="flex-1 flex flex-col min-h-0 rounded-b-2xl overflow-hidden"
                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderTop: 'none', boxShadow: '0 2px 12px rgba(117,48,251,0.06)' }}>

                    <div className="flex-1 overflow-auto min-h-0">
                        <table className="w-full" style={{ tableLayout: 'fixed' }}>
                            {/* STICKY HEADER */}
                            <thead className="sticky top-0 z-10">
                                <tr style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
                                    <th style={{ width: 40 }} className="px-4 py-1.5">
                                        <input type="checkbox"
                                            checked={paginated.length > 0 && selectedIds.size === paginated.length}
                                            onChange={toggleSelectAll}
                                            className="rounded"
                                            style={{ accentColor: C.primary }}
                                        />
                                    </th>
                                    <th style={{ width: 40, color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }} className="px-0 py-2 text-left text-[12px] font-bold uppercase tracking-widest"></th>
                                    <th style={{ width: 220, color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }} className="px-3 py-2 text-left text-[12px] font-bold uppercase tracking-widest">Product</th>
                                    <th style={{ width: 110, color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }} className="px-3 py-2 text-left text-[12px] font-bold uppercase tracking-widest">Condition</th>
                                    <th style={{ width: 110, color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }} className="px-3 py-2 text-left text-[12px] font-bold uppercase tracking-widest">Category</th>
                                    <th style={{ width: 100, color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }} className="px-3 py-2 text-left text-[12px] font-bold uppercase tracking-widest">Source</th>
                                    <th style={{ width: 90, color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }} className="px-3 py-2 text-left text-[12px] font-bold uppercase tracking-widest">Price</th>
                                    <th style={{ width: 80, color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }} className="px-3 py-2 text-left text-[12px] font-bold uppercase tracking-widest">Margin</th>
                                    <th style={{ width: 70, color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }} className="px-3 py-2 text-left text-[12px] font-bold uppercase tracking-widest">Health</th>
                                    <th style={{ width: 80, color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }} className="px-3 py-2 text-left text-[12px] font-bold uppercase tracking-widest">VeRO</th>
                                    <th style={{ width: 90, color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }} className="px-3 py-2 text-left text-[12px] font-bold uppercase tracking-widest">Stock</th>
                                    <th style={{ width: 90, color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }} className="px-3 py-2 text-left text-[12px] font-bold uppercase tracking-widest">Status</th>
                                    <th style={{ width: 80, color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }} className="px-3 py-2 text-left text-[12px] font-bold uppercase tracking-widest">Date</th>
                                    <th style={{ width: 160, color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }} className="px-3 py-2 text-left text-[12px] font-bold uppercase tracking-widest">IDs</th>
                                    <th style={{ width: 140, color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }} className="px-3 py-2 text-left text-[12px] font-bold uppercase tracking-widest"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={14} className="py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                                    style={{ backgroundColor: C.primaryLight }}>
                                                    <Package size={22} style={{ color: C.primary }} />
                                                </div>
                                                <p className="text-[14px] font-semibold" style={{ color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }}>
                                                    No listings found
                                                </p>
                                                <p className="text-[13px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                                    {debouncedSearch
                                                        ? `No results for "${debouncedSearch}" — try a different search or scope`
                                                        : 'No listings in this status'}
                                                </p>
                                                {debouncedSearch && (
                                                    <button
                                                        onClick={() => { setSearch(''); setDebouncedSearch('') }}
                                                        className="px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all hover:opacity-80"
                                                        style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                                        Clear Search
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginated.map((listing) => {
                                    const isSelected = selectedIds.has(listing.id)
                                    return (
                                        <tr key={listing.id}
                                            className="cursor-pointer transition-colors"
                                            style={{
                                                backgroundColor: C.surface,
                                                borderBottom: `1px solid ${C.border}`,
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f3eeff')}
                                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = C.surface)}
                                            onClick={() => toggleSelect(listing.id)}>

                                            {/* Checkbox */}
                                            <td className="px-4 py-1.5" onClick={e => e.stopPropagation()}>
                                                <input type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(listing.id)}
                                                    style={{ accentColor: C.primary }}
                                                    className="rounded"
                                                />
                                            </td>

                                            {/* Product Image — full height, no padding */}
                                            <td className="p-0" style={{ width: 40 }}>
                                                <div className="w-full h-full min-h-[36px]"
                                                    style={{ backgroundColor: C.bg }}>
                                                    {listing.main_photo_url ? (
                                                        <img src={listing.main_photo_url} alt={listing.title || ''} className="w-full h-full object-cover" style={{ minHeight: 36 }} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center" style={{ minHeight: 36 }}>
                                                            <Package size={14} style={{ color: C.muted }} />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Product Info */}
                                            <td className="px-3 py-1.5 max-w-[240px]">
                                                <p className="text-[12px] font-semibold truncate max-w-[220px]"
                                                    style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                                    {listing.title || listing.product_name || 'Untitled'}
                                                </p>
                                                {listing.sku && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded mt-0.5 inline-block"
                                                        style={{ backgroundColor: C.bg, color: C.muted, fontFamily: 'DM Sans, sans-serif', border: `1px solid ${C.border}` }}>
                                                        {listing.sku}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Condition */}
                                            <td className="px-3 py-1.5">
                                                {listing.condition ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
                                                        style={{
                                                            backgroundColor: listing.condition === 'New' || listing.condition === 'New with tags' ? C.successBg : listing.condition?.includes('Like New') ? C.infoBg : C.warningBg,
                                                            color: listing.condition === 'New' || listing.condition === 'New with tags' ? C.success : listing.condition?.includes('Like New') ? C.info : C.warning,
                                                            fontFamily: 'DM Sans, sans-serif',
                                                        }}>
                                                        {listing.condition}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: C.muted, fontSize: 12 }}>—</span>
                                                )}
                                            </td>

                                            {/* Category */}
                                            <td className="px-3 py-3 max-w-[120px]">
                                                {listing.category ? (
                                                    <span className="text-[11px] truncate block max-w-[120px]"
                                                        style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}
                                                        title={listing.category}>
                                                        {listing.category.split('>').pop()?.trim() || listing.category}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: C.muted, fontSize: 12 }}>—</span>
                                                )}
                                            </td>

                                            {/* Source Platform */}
                                            <td className="px-3 py-1.5">
                                                {listing.source_platform ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
                                                        style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                                        {listing.source_platform === 'cj_dropshipping' ? 'CJ Drop' :
                                                            listing.source_platform === 'aliexpress' ? 'AliExpress' :
                                                                listing.source_platform === 'amazon_uk' ? 'Amazon UK' :
                                                                    listing.source_platform.charAt(0).toUpperCase() + listing.source_platform.slice(1)}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                                        style={{ backgroundColor: '#f8f7ff', color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                                        Own
                                                    </span>
                                                )}
                                            </td>

                                            {/* Price */}
                                            <td className="px-3 py-1.5">
                                                <span className="text-[14px] font-bold" style={{ color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }}>
                                                    £{listing.sell_price?.toFixed(2) ?? '—'}
                                                </span>
                                            </td>

                                            {/* Margin */}
                                            <td className="px-3 py-1.5">
                                                {listing.margin !== null && (
                                                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                                        style={{
                                                            backgroundColor: listing.margin >= 25 ? C.successBg : listing.margin >= 15 ? C.warningBg : C.dangerBg,
                                                            color: listing.margin >= 25 ? C.success : listing.margin >= 15 ? C.warning : C.danger,
                                                            fontFamily: 'DM Sans, sans-serif',
                                                        }}>
                                                        {listing.margin}%
                                                    </span>
                                                )}
                                            </td>

                                            {/* Health Score */}
                                            <td className="px-3 py-1.5">
                                                <HealthBadge score={listing.health_score} />
                                            </td>

                                            {/* VeRO */}
                                            <td className="px-3 py-1.5">
                                                <VeroBadge status={listing.vero_status} />
                                            </td>

                                            {/* Stock */}
                                            <td className="px-3 py-1.5">
                                                <StockCell
                                                    quantity={listing.quantity}
                                                    outOfStock={listing.out_of_stock_option}
                                                    sellerType={listing.seller_type}
                                                />
                                            </td>

                                            {/* Status */}
                                            <td className="px-3 py-1.5">
                                                <StatusPill status={listing.status} />
                                            </td>

                                            {/* Date */}
                                            <td className="px-3 py-1.5">
                                                <span className="text-[11px]"
                                                    style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                                    {new Date(listing.created_at).toLocaleDateString('en-GB', {
                                                        day: '2-digit', month: 'short', year: '2-digit'
                                                    })}
                                                </span>
                                            </td>

                                            {/* IDs — EAN/UPC auto-detect + eBay Item ID */}
                                            <td className="px-3 py-1.5">
                                                <div className="flex flex-col gap-1">
                                                    {/* EAN / UPC — auto detected */}
                                                    {(() => {
                                                        const gtinValue = listing.item_specifics?.['EAN'] || listing.item_specifics?.['UPC'] || listing.item_specifics?.['GTIN']
                                                        if (gtinValue) {
                                                            const { label, color, bg } = detectGtinType(gtinValue)
                                                            return (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-[9px] font-bold px-1 py-0.5 rounded"
                                                                        style={{ backgroundColor: bg, color, fontFamily: 'DM Sans, sans-serif' }}>
                                                                        {label}
                                                                    </span>
                                                                    <span className="text-[11px]"
                                                                        style={{ color: C.body, fontFamily: 'monospace' }}>
                                                                        {gtinValue}
                                                                    </span>
                                                                </div>
                                                            )
                                                        }
                                                        return (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[9px] font-bold px-1 py-0.5 rounded"
                                                                    style={{ backgroundColor: C.bg, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                                                    EAN
                                                                </span>
                                                                <span className="text-[11px]" style={{ color: C.muted }}>—</span>
                                                            </div>
                                                        )
                                                    })()}
                                                    {/* eBay Item ID */}
                                                    {listing.ebay_listing_id ? (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[9px] font-bold px-1 py-0.5 rounded"
                                                                style={{ backgroundColor: C.warningBg, color: C.warning, fontFamily: 'DM Sans, sans-serif' }}>
                                                                eBay
                                                            </span>
                                                            <span className="text-[11px]"
                                                                style={{ color: C.body, fontFamily: 'monospace' }}>
                                                                {listing.ebay_listing_id}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[9px] font-bold px-1 py-0.5 rounded"
                                                                style={{ backgroundColor: C.bg, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                                                eBay
                                                            </span>
                                                            <span className="text-[11px]" style={{ color: C.muted }}>—</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-3 py-1.5" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => onEditDraft(listing.id)}
                                                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                                                        style={{ backgroundColor: C.primaryLight }}
                                                        title="Edit in Wizard">
                                                        <Pencil size={13} style={{ color: C.primary }} />
                                                    </button>
                                                    <button className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                                                        style={{ backgroundColor: C.warningBg }}
                                                        title="Re-check VeRO">
                                                        <ShieldCheck size={13} style={{ color: C.warning }} />
                                                    </button>
                                                    <button className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                                                        style={{ backgroundColor: C.bg }}
                                                        title="Export CSV">
                                                        <Download size={13} style={{ color: C.secondary }} />
                                                    </button>
                                                    <button className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                                                        style={{ backgroundColor: C.dangerBg }}
                                                        title="Delete Listing">
                                                        <Trash2 size={13} style={{ color: C.danger }} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION — fixed at bottom */}
                    {filtered.length > 0 && (
                        <div className="flex items-center justify-between px-5 py-3 shrink-0 gap-3"
                            style={{ borderTop: `1px solid ${C.border}`, backgroundColor: C.surface }}>

                            {/* Left — count + rows per page */}
                            <div className="flex items-center gap-3">
                                <p className="text-[12px] whitespace-nowrap" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                    <span style={{ color: C.dark, fontWeight: 600 }}>
                                        {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, filtered.length)}
                                    </span>
                                    {' '}of{' '}
                                    <span style={{ color: C.dark, fontWeight: 600 }}>{filtered.length.toLocaleString()}</span>
                                    {' '}listings
                                </p>
                                {/* Rows per page selector */}
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Show</span>
                                    <div className="flex items-center gap-1">
                                        {[25, 50, 100].map(n => (
                                            <button key={n}
                                                onClick={() => { setRowsPerPage(n); setPage(1) }}
                                                className="w-8 h-6 rounded-lg text-[11px] font-semibold transition-all"
                                                style={{
                                                    backgroundColor: rowsPerPage === n ? C.primary : C.bg,
                                                    color: rowsPerPage === n ? '#fff' : C.secondary,
                                                    fontFamily: 'DM Sans, sans-serif',
                                                }}>
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Center — page buttons */}
                            {totalPages > 1 && (
                                <div className="flex items-center gap-1">
                                    {/* First page */}
                                    <button onClick={() => setPage(1)} disabled={page === 1}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] transition-all disabled:opacity-30"
                                        style={{ backgroundColor: C.bg, color: C.secondary }}
                                        title="First page">
                                        «
                                    </button>
                                    {/* Prev */}
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                                        style={{ backgroundColor: C.bg, color: C.secondary }}>
                                        <ChevronLeft size={13} />
                                    </button>

                                    {/* Smart page numbers */}
                                    {(() => {
                                        const pages: (number | '...')[] = []
                                        if (totalPages <= 7) {
                                            for (let i = 1; i <= totalPages; i++) pages.push(i)
                                        } else {
                                            pages.push(1)
                                            if (page > 3) pages.push('...')
                                            for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
                                            if (page < totalPages - 2) pages.push('...')
                                            pages.push(totalPages)
                                        }
                                        return pages.map((p, i) => p === '...' ? (
                                            <span key={`dots-${i}`} className="w-7 text-center text-[11px]"
                                                style={{ color: C.muted }}>…</span>
                                        ) : (
                                            <button key={p} onClick={() => setPage(p as number)}
                                                className="w-7 h-7 rounded-lg text-[12px] font-semibold transition-all"
                                                style={{
                                                    backgroundColor: page === p ? C.primary : C.bg,
                                                    color: page === p ? '#fff' : C.secondary,
                                                    fontFamily: 'DM Sans, sans-serif',
                                                }}>
                                                {p}
                                            </button>
                                        ))
                                    })()}

                                    {/* Next */}
                                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                                        style={{ backgroundColor: C.bg, color: C.secondary }}>
                                        <ChevronRight size={13} />
                                    </button>
                                    {/* Last page */}
                                    <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] transition-all disabled:opacity-30"
                                        style={{ backgroundColor: C.bg, color: C.secondary }}
                                        title="Last page">
                                        »
                                    </button>
                                </div>
                            )}

                            {/* Right — Jump to page */}
                            {totalPages > 5 && (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Go to</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={totalPages}
                                        value={jumpPage}
                                        onChange={e => setJumpPage(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                const p = parseInt(jumpPage)
                                                if (p >= 1 && p <= totalPages) { setPage(p); setJumpPage('') }
                                            }
                                        }}
                                        placeholder="pg"
                                        className="w-12 h-7 text-center text-[12px] rounded-lg outline-none"
                                        style={{ border: `1px solid ${C.borderInput}`, fontFamily: 'DM Sans, sans-serif', color: C.body, backgroundColor: C.bg }}
                                        onFocus={e => e.target.style.borderColor = C.primary}
                                        onBlur={e => e.target.style.borderColor = C.borderInput}
                                    />
                                    <span className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>of {totalPages}</span>
                                </div>
                            )}

                        </div>
                    )}

                </div>

            </div>
        </div>
    )
}
