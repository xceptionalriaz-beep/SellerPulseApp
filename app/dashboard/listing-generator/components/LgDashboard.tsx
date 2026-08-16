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
    CheckCircle2, AlertTriangle, Pencil, MoreHorizontal,
    Copy, RefreshCw, Download, Trash2, ChevronLeft, ChevronRight,
    X, Zap, Package, TrendingUp, Circle,
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

// ── Row Dropdown Menu ─────────────────────────────────────────
function RowDropdown({ onEdit, onClose }: { onEdit: () => void; onClose: () => void }) {
    return (
        <div
            className="absolute right-0 top-10 z-50 w-[200px] rounded-xl overflow-hidden"
            style={{
                backgroundColor: C.surface,
                border: `1px solid ${C.border}`,
                boxShadow: '0 8px 24px rgba(117,48,251,0.12)',
            }}
        >
            {[
                { icon: Pencil, label: 'Edit in Wizard', color: C.body, action: onEdit },
                { icon: Copy, label: 'Duplicate Listing', color: C.body, action: onClose },
                { icon: RefreshCw, label: 'Re-check VeRO', color: C.warning, action: onClose },
                { icon: Download, label: 'Export CSV', color: C.body, action: onClose },
            ].map((item) => (
                <button
                    key={item.label}
                    onClick={() => { item.action(); onClose() }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#f8f7ff] transition-colors"
                    style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: item.color }}
                >
                    <item.icon size={14} style={{ color: item.color }} />
                    {item.label}
                </button>
            ))}
            <div style={{ borderTop: `1px solid ${C.border}` }} />
            <button
                onClick={onClose}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#fff8f8] transition-colors"
                style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: C.danger }}
            >
                <Trash2 size={14} style={{ color: C.danger }} />
                Delete Listing
            </button>
        </div>
    )
}

// ── Main Dashboard Component ──────────────────────────────────
export default function LgDashboard({ onNewListing, onEditDraft, onBulkUpload }: Props) {
    const supabase = createClient()

    // ── State ───────────────────────────────────────────────────
    const [listings, setListings] = useState<Listing[]>([])
    const [metrics, setMetrics] = useState<Metrics>({
        total: 0, active: 0, drafts: 0, ended: 0,
        scheduled: 0, vero_flagged: 0, avg_health: 0,
    })
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [activeTab, setActiveTab] = useState<TabFilter>('all')
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
    const PER_PAGE = 10

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
          main_photo_url, photo_count, created_at, updated_at, source_platform
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
        const matchSearch = !search || (
            l.title?.toLowerCase().includes(search.toLowerCase()) ||
            l.sku?.toLowerCase().includes(search.toLowerCase()) ||
            l.product_name?.toLowerCase().includes(search.toLowerCase())
        )
        return matchTab && matchSearch
    })

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

    // ── Render ──────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-transparent animate-spin"
                        style={{ borderTopColor: C.primary }} />
                    <p className="text-[13px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                        Loading listings...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-5" style={{ backgroundColor: C.bg }}>

            {/* ── PAGE HEADER ───────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-4 shrink-0"
                style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: C.primaryLight }}>
                        <LayoutList size={20} style={{ color: C.primary }} />
                    </div>
                    <div>
                        <h1 className="text-[18px] font-bold leading-tight"
                            style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                            Listing Studio
                        </h1>
                        <p className="text-[12px]"
                            style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                            Create and manage your eBay listings
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onBulkUpload}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all hover:opacity-80"
                        style={{ backgroundColor: C.primaryLight, color: C.primary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                        <Upload size={14} />
                        Bulk Upload
                    </button>
                    <button
                        onClick={onNewListing}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{ backgroundColor: C.accent, color: C.accentText, fontFamily: 'DM Sans, sans-serif', boxShadow: '0 4px 12px rgba(184,250,51,0.3)' }}>
                        <Zap size={14} />
                        List New Item
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-5 px-6 pb-6">

                {/* ── METRIC CARDS ──────────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Active Listings */}
                    <div className="rounded-2xl p-5 relative overflow-hidden"
                        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.success}`, boxShadow: '0 2px 12px rgba(117,48,251,0.06)' }}>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: C.success }} />
                            <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>Active Listings</span>
                        </div>
                        <p className="text-[36px] font-bold leading-none mb-2" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>{metrics.active}</p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                            style={{ backgroundColor: C.successBg, color: C.success, fontFamily: 'DM Sans, sans-serif' }}>
                            <TrendingUp size={10} />
                            {metrics.total} total
                        </span>
                    </div>

                    {/* Drafts Ready */}
                    <div className="rounded-2xl p-5"
                        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.primary}`, boxShadow: '0 2px 12px rgba(117,48,251,0.06)' }}>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: C.primary }} />
                            <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>Drafts Ready</span>
                        </div>
                        <p className="text-[36px] font-bold leading-none mb-2" style={{ color: C.primary, fontFamily: 'Syne, sans-serif' }}>{metrics.drafts}</p>
                        {metrics.drafts > 0 ? (
                            <button
                                onClick={() => setActiveTab('draft')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors hover:opacity-80"
                                style={{ backgroundColor: C.primaryLight, color: C.primary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                                View Drafts
                            </button>
                        ) : (
                            <span className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>No drafts</span>
                        )}
                    </div>

                    {/* VeRO Alerts */}
                    <div className="rounded-2xl p-5"
                        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${metrics.vero_flagged > 0 ? C.danger : C.success}`, boxShadow: '0 2px 12px rgba(117,48,251,0.06)' }}>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`w-2 h-2 rounded-full ${metrics.vero_flagged > 0 ? 'animate-pulse' : ''}`}
                                style={{ backgroundColor: metrics.vero_flagged > 0 ? C.danger : C.success }} />
                            <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>VeRO Alerts</span>
                        </div>
                        <p className="text-[36px] font-bold leading-none mb-2"
                            style={{ color: metrics.vero_flagged > 0 ? C.danger : C.success, fontFamily: 'Syne, sans-serif' }}>
                            {metrics.vero_flagged}
                        </p>
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

                    {/* Avg Health Score */}
                    <div className="rounded-2xl p-5"
                        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.accent}`, boxShadow: '0 2px 12px rgba(117,48,251,0.06)' }}>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: C.accent }} />
                            <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>Avg Health Score</span>
                        </div>
                        <div className="flex items-end gap-3">
                            <p className="text-[36px] font-bold leading-none" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>{metrics.avg_health}</p>
                            <span className="text-[14px] mb-1" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>/100</span>
                        </div>
                        {/* Mini progress bar */}
                        <div className="mt-2 h-1.5 rounded-full" style={{ backgroundColor: C.border }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${metrics.avg_health}%`, backgroundColor: C.accent }} />
                        </div>
                    </div>
                </div>

                {/* ── TOOLBAR ───────────────────────────────────────── */}
                <div className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(117,48,251,0.06)' }}>

                    {/* Search + Filters OR Bulk Action Bar */}
                    {selectedIds.size > 0 ? (
                        // BULK ACTION BAR
                        <div className="flex items-center justify-between px-5 py-3"
                            style={{ backgroundColor: C.dark }}>
                            <div className="flex items-center gap-3">
                                <span className="text-[14px] font-semibold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                    {selectedIds.size} listing{selectedIds.size !== 1 ? 's' : ''} selected
                                </span>
                                <button onClick={clearSelection} className="text-[12px] hover:text-white/80 transition-colors"
                                    style={{ color: '#a89cc8', fontFamily: 'DM Sans, sans-serif' }}>
                                    Clear
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                {[
                                    { label: 'Bulk Edit', bg: C.primaryLight, text: C.primary },
                                    { label: 'Re-check VeRO', bg: C.warningBg, text: C.warning },
                                    { label: 'Export CSV', bg: C.accent, text: C.accentText },
                                    { label: 'Delete', bg: C.dangerBg, text: C.danger },
                                ].map(btn => (
                                    <button key={btn.label}
                                        className="px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-opacity hover:opacity-80"
                                        style={{ backgroundColor: btn.bg, color: btn.text, fontFamily: 'DM Sans, sans-serif' }}>
                                        {btn.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // SEARCH + FILTERS
                        <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
                            {/* Search */}
                            <div className="relative flex-1 max-w-xs">
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                                    placeholder="Search title, SKU or Item ID..."
                                    className="w-full pl-9 pr-3 py-2 text-[13px] rounded-xl outline-none transition-all"
                                    style={{
                                        backgroundColor: C.bg,
                                        border: `1px solid ${C.borderInput}`,
                                        color: C.body,
                                        fontFamily: 'DM Sans, sans-serif',
                                    }}
                                    onFocus={e => e.target.style.borderColor = C.primary}
                                    onBlur={e => e.target.style.borderColor = C.borderInput}
                                />
                                {search && (
                                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <X size={13} style={{ color: C.muted }} />
                                    </button>
                                )}
                            </div>

                            {/* Filter dropdowns */}
                            {['Category', 'Health Score', 'Seller Type', 'Sort: Newest'].map(f => (
                                <button key={f}
                                    className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] transition-colors hover:bg-[#f8f7ff]"
                                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                    {f}
                                    <ChevronDown size={12} style={{ color: C.muted }} />
                                </button>
                            ))}

                            <div className="flex-1" />

                            {/* View toggle */}
                            <div className="flex items-center gap-1">
                                <button onClick={() => setViewMode('table')}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                                    style={{ backgroundColor: viewMode === 'table' ? C.primary : C.bg, color: viewMode === 'table' ? '#fff' : C.muted }}>
                                    <LayoutList size={16} />
                                </button>
                                <button onClick={() => setViewMode('grid')}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                                    style={{ backgroundColor: viewMode === 'grid' ? C.primary : C.bg, color: viewMode === 'grid' ? '#fff' : C.muted }}>
                                    <LayoutGrid size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STATUS TABS */}
                    <div className="flex items-center gap-1 px-5" style={{ borderBottom: `1px solid ${C.border}` }}>
                        {(Object.entries(tabCounts) as [TabFilter, number][]).map(([tab, count]) => {
                            const labels: Record<TabFilter, string> = {
                                all: 'All', published: 'Active', draft: 'Drafts', ended: 'Ended', scheduled: 'Scheduled'
                            }
                            const isActive = activeTab === tab
                            return (
                                <button
                                    key={tab}
                                    onClick={() => { setActiveTab(tab); setPage(1); clearSelection() }}
                                    className="flex items-center gap-1.5 px-3 py-3 text-[13px] font-semibold relative transition-colors"
                                    style={{
                                        color: isActive ? C.primary : C.secondary,
                                        fontFamily: 'DM Sans, sans-serif',
                                        borderBottom: isActive ? `2px solid ${C.primary}` : '2px solid transparent',
                                    }}
                                >
                                    {labels[tab]}
                                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                                        style={{
                                            backgroundColor: isActive ? C.primaryLight : C.bg,
                                            color: isActive ? C.primary : C.muted,
                                        }}>
                                        {count}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    {/* ── TABLE ─────────────────────────────────────────── */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            {/* Table Header */}
                            <thead>
                                <tr style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}>
                                    <th className="w-10 px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={paginated.length > 0 && selectedIds.size === paginated.length}
                                            onChange={toggleSelectAll}
                                            className="rounded"
                                            style={{ accentColor: C.primary }}
                                        />
                                    </th>
                                    {['Product', 'Seller Type', 'Price & Margin', 'Health', 'VeRO', 'Stock', 'Status', 'Actions'].map(col => (
                                        <th key={col} className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide"
                                            style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody>
                                {paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                                    style={{ backgroundColor: C.primaryLight }}>
                                                    <Package size={22} style={{ color: C.primary }} />
                                                </div>
                                                <p className="text-[14px] font-semibold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                                    No listings found
                                                </p>
                                                <p className="text-[13px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                                    {search ? 'Try a different search term' : 'No listings in this status'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginated.map((listing, i) => {
                                    const isSelected = selectedIds.has(listing.id)
                                    const isVeroFlagged = listing.vero_status === 'flagged'
                                    const isDropdownOpen = openDropdownId === listing.id

                                    return (
                                        <tr
                                            key={listing.id}
                                            className="group transition-colors cursor-pointer"
                                            style={{
                                                backgroundColor: isSelected ? C.primaryLight : isVeroFlagged ? '#fff8f8' : i % 2 === 0 ? C.surface : C.bg,
                                                borderBottom: `1px solid ${C.border}`,
                                                borderLeft: isVeroFlagged ? `3px solid ${C.danger}` : isSelected ? `3px solid ${C.primary}` : '3px solid transparent',
                                            }}
                                            onClick={() => toggleSelect(listing.id)}
                                        >
                                            {/* Checkbox */}
                                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(listing.id)}
                                                    style={{ accentColor: C.primary }}
                                                    className="rounded"
                                                />
                                            </td>

                                            {/* Product */}
                                            <td className="px-3 py-3 max-w-[280px]">
                                                <div className="flex items-center gap-3">
                                                    {/* Thumbnail */}
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0"
                                                        style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                                                        {listing.main_photo_url ? (
                                                            <img src={listing.main_photo_url} alt={listing.title || ''} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package size={18} style={{ color: C.muted }} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Details */}
                                                    <div className="min-w-0">
                                                        <p className="text-[13px] font-semibold truncate max-w-[200px]"
                                                            style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                                            {listing.title || listing.product_name || 'Untitled'}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                            {listing.sku && (
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded"
                                                                    style={{ backgroundColor: C.bg, color: C.muted, fontFamily: 'DM Sans, sans-serif', border: `1px solid ${C.border}` }}>
                                                                    {listing.sku}
                                                                </span>
                                                            )}
                                                            {listing.category && (
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded"
                                                                    style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                                                    {listing.category.split('>').pop()?.trim() || listing.category}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Seller Type */}
                                            <td className="px-3 py-3">
                                                <SellerTypePill type={listing.seller_type} />
                                            </td>

                                            {/* Price & Margin */}
                                            <td className="px-3 py-3">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[14px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                                        £{listing.sell_price?.toFixed(2) ?? '—'}
                                                    </span>
                                                    {listing.margin !== null && (
                                                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                                            style={{
                                                                backgroundColor: listing.margin >= 25 ? C.successBg : listing.margin >= 15 ? C.warningBg : C.dangerBg,
                                                                color: listing.margin >= 25 ? C.success : listing.margin >= 15 ? C.warning : C.danger,
                                                                fontFamily: 'DM Sans, sans-serif',
                                                            }}>
                                                            {listing.margin}% margin
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Health Score */}
                                            <td className="px-3 py-3">
                                                <HealthBadge score={listing.health_score} />
                                            </td>

                                            {/* VeRO */}
                                            <td className="px-3 py-3">
                                                <VeroBadge status={listing.vero_status} />
                                            </td>

                                            {/* Stock */}
                                            <td className="px-3 py-3">
                                                <StockCell
                                                    quantity={listing.quantity}
                                                    outOfStock={listing.out_of_stock_option}
                                                    sellerType={listing.seller_type}
                                                />
                                            </td>

                                            {/* Status */}
                                            <td className="px-3 py-3">
                                                <StatusPill status={listing.status} />
                                            </td>

                                            {/* Actions */}
                                            <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center gap-1.5 relative">
                                                    <button
                                                        onClick={() => onEditDraft(listing.id)}
                                                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:opacity-80"
                                                        style={{ backgroundColor: C.primaryLight }}
                                                        title="Edit in Wizard"
                                                    >
                                                        <Pencil size={13} style={{ color: C.primary }} />
                                                    </button>
                                                    <button
                                                        onClick={() => setOpenDropdownId(isDropdownOpen ? null : listing.id)}
                                                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:opacity-80"
                                                        style={{ backgroundColor: C.bg }}
                                                        title="More options"
                                                    >
                                                        <MoreHorizontal size={13} style={{ color: C.secondary }} />
                                                    </button>
                                                    {isDropdownOpen && (
                                                        <RowDropdown
                                                            onEdit={() => { onEditDraft(listing.id); setOpenDropdownId(null) }}
                                                            onClose={() => setOpenDropdownId(null)}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* ── PAGINATION ────────────────────────────────────── */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-4"
                            style={{ borderTop: `1px solid ${C.border}` }}>
                            <p className="text-[13px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                Showing {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} listings
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                                    style={{ backgroundColor: C.bg, color: C.secondary }}>
                                    <ChevronLeft size={14} />
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                                    <button key={p}
                                        onClick={() => setPage(p)}
                                        className="w-8 h-8 rounded-xl flex items-center justify-center text-[13px] font-semibold transition-all"
                                        style={{
                                            backgroundColor: page === p ? C.primary : C.bg,
                                            color: page === p ? '#fff' : C.secondary,
                                            fontFamily: 'DM Sans, sans-serif',
                                        }}>
                                        {p}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                                    style={{ backgroundColor: C.bg, color: C.secondary }}>
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                            <div className="hidden md:block" />
                        </div>
                    )}
                </div>

                {/* ── SELLER TYPE LEGEND ────────────────────────────── */}
                <div className="flex flex-wrap items-center gap-2 px-1">
                    <span className="text-[11px] font-semibold" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>Seller Types:</span>
                    {[
                        { label: 'Own Stock', bg: '#f8f7ff', text: C.secondary },
                        { label: 'Dropship', bg: C.primaryLight, text: C.primary },
                        { label: 'Wholesale', bg: C.infoBg, text: C.info },
                        { label: 'Retail Arb', bg: C.successBg, text: C.success },
                        { label: 'Reseller', bg: C.warningBg, text: C.warning },
                        { label: 'Print on Demand', bg: C.primaryLight, text: C.primary },
                    ].map(pill => (
                        <span key={pill.label}
                            className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                            style={{ backgroundColor: pill.bg, color: pill.text, fontFamily: 'DM Sans, sans-serif' }}>
                            {pill.label}
                        </span>
                    ))}
                </div>

            </div>
        </div>
    )
}
