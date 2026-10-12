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
import { getCurrencySymbol, getMarketplaceLabel, getFlagCode } from '@/lib/ebay-marketplace'
import { useSegments }    from '../hooks/useSegments'
import { useColumnConfig } from '../hooks/useColumnConfig'
import { SegmentSidebar } from './segments/SegmentSidebar'
import { ColumnPanel }    from './columns/ColumnPanel'
import { ColumnFilterPopover } from './filters/ColumnFilterPopover'
import { FilterPanel }    from './filters/FilterPanel'
import { applySegment }   from '../lib/segment-filter'
import { applyColumnFilters } from '../lib/apply-column-filters'
import type { ActiveFilter } from '../data/filter-definitions'
import { FILTER_FIELD_DEFS } from '../data/filter-definitions'
import {
    Search, Upload, ChevronDown, ChevronUp, LayoutList, LayoutGrid,
    CheckCircle2, AlertTriangle, Pencil, Clock,
    Download, Trash2, ChevronLeft, ChevronRight,
    X, Package, TrendingUp, Circle, Zap, Copy, Check,
    Columns, SlidersHorizontal, Filter, Star, Palette, ExternalLink,
    CopyPlus, StopCircle, RefreshCw, BarChart2, Eye, Edit3,
} from 'lucide-react'
import UrlImport from '@/app/dashboard/listing-generator/components/ai-import/url-to-listing/UrlImport'
import UrlImportProcessing from '@/app/dashboard/listing-generator/components/ai-import/url-to-listing/UrlImportProcessing'
import UrlImportPreview from '@/app/dashboard/listing-generator/components/ai-import/url-to-listing/UrlImportPreview'
import UrlImportVeroWarning from '@/app/dashboard/listing-generator/components/ai-import/url-to-listing/UrlImportVeroWarning'
import UrlImportFailed from '@/app/dashboard/listing-generator/components/ai-import/url-to-listing/UrlImportFailed'
import ImageImport from '@/app/dashboard/listing-generator/components/ai-import/image-to-listing/ImageImport'
import ImageImportProcessing from '@/app/dashboard/listing-generator/components/ai-import/image-to-listing/ImageImportProcessing'
import ImageImportPreview from '@/app/dashboard/listing-generator/components/ai-import/image-to-listing/ImageImportPreview'
import ImageImportFailed from '@/app/dashboard/listing-generator/components/ai-import/image-to-listing/ImageImportFailed'
import BarcodeImport from '@/app/dashboard/listing-generator/components/ai-import/barcode-import/BarcodeImport'
import TitleImport from '@/app/dashboard/listing-generator/components/ai-import/title-to-listing/TitleImport'
import MyTemplatesGallery from './MyTemplatesGallery'
import { AIButton, PrimaryButton } from '@/components/ui/Buttons'
import type { PlatformDetection, UrlImportResult, ImportedListingData } from '@/app/dashboard/listing-generator/types/url-import.types'
import type { ImageImportData } from '@/app/dashboard/listing-generator/components/ai-import/image-to-listing/ImageImport'
import type { ImageImportResult } from '@/app/dashboard/listing-generator/components/ai-import/image-to-listing/ImageImportProcessing'

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
type VeroStatus = 'clear' | 'warning' | 'flagged' | 'unchecked'
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
    template_id: string | null
    visual_templates: { name: string } | null
    ebay_impressions: number | null
    ebay_views: number | null
    ebay_click_through_rate: number | null
    ebay_analytics_synced_at: string | null
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
    if (status === 'warning') return (
        <div className="flex items-center gap-1.5">
            <AlertTriangle size={14} style={{ color: C.warning }} />
            <span className="text-[12px] font-semibold" style={{ color: C.warning, fontFamily: 'DM Sans, sans-serif' }}>Warning</span>
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

// ── Source Badge ──────────────────────────────────────────────
const SOURCE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    cj_dropshipping:  { label: 'CJ Drop',    color: '#0ea5e9', bg: '#e0f2fe' },
    aliexpress:       { label: 'AliExpress',  color: '#f97316', bg: '#ffedd5' },
    amazon_uk:        { label: 'Amazon UK',   color: '#d97706', bg: '#fef3c7' },
    argos:            { label: 'Argos',       color: '#0d9488', bg: '#ccfbf1' },
    barcode_import:   { label: 'Barcode AI',  color: '#8b5cf6', bg: '#ede9fe' },
    title_import:     { label: 'Title AI',    color: '#14b8a6', bg: '#ccfbf1' },
    url_import:       { label: 'URL AI',      color: '#3b82f6', bg: '#dbeafe' },
    image_import:     { label: 'Photo AI',    color: '#ec4899', bg: '#fce7f3' },
}

function SourceBadge({ platform }: { platform: string | null }) {
    if (!platform) {
        return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ backgroundColor: '#f3f4f6', color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }}>
                Own
            </span>
        )
    }
    const cfg = SOURCE_CONFIG[platform] ?? {
        label: platform.charAt(0).toUpperCase() + platform.slice(1).replace(/_/g, ' '),
        color: '#6b7280',
        bg:    '#f3f4f6',
    }
    return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
            style={{ backgroundColor: cfg.bg, color: cfg.color, fontFamily: 'DM Sans, sans-serif' }}>
            {cfg.label}
        </span>
    )
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
    const [showTemplates, setShowTemplates] = useState(false)
    const [aiDropdownOpen, setAiDropdownOpen] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(50)
    const [jumpPage, setJumpPage] = useState('')
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [showUrlImport, setShowUrlImport] = useState(false)
    const [showProcessing, setShowProcessing] = useState(false)
    const [showVeroWarning, setShowVeroWarning] = useState(false)
    const [showFailed, setShowFailed] = useState(false)
    const [failedErrorCode, setFailedErrorCode] = useState<string | undefined>(undefined)
    const [showPreview, setShowPreview] = useState(false)
    const [importUrl, setImportUrl] = useState<string>('')
    const [importPlatform, setImportPlatform] = useState<PlatformDetection | null>(null)
    const [importResult, setImportResult] = useState<UrlImportResult | null>(null)
    // Image import states
    const [showImageImport, setShowImageImport] = useState(false)
    const [showImageProcessing, setShowImageProcessing] = useState(false)
    const [showImagePreview, setShowImagePreview] = useState(false)
    const [showImageFailed, setShowImageFailed] = useState(false)
    const [imageImportData, setImageImportData] = useState<ImageImportData | null>(null)
    const [imageProcessingResult, setImageProcessingResult] = useState<ImageImportResult | null>(null)
    const [imageVeroResult, setImageVeroResult] = useState<ImageImportResult | null>(null)
    const [showImageVeroWarning, setShowImageVeroWarning] = useState(false)
    const [imageFailedCode, setImageFailedCode] = useState<string | undefined>(undefined)
    // Barcode import modal
    const [showBarcodeImport, setShowBarcodeImport] = useState(false)
    // Title import modal
    const [showTitleImport, setShowTitleImport] = useState(false)
    // Delete confirmation: id of listing pending deletion
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    // ── New feature state ───────────────────────────────────────
    const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
    const [endingId, setEndingId] = useState<string | null>(null)
    const [relistingId, setRelistingId] = useState<string | null>(null)
    const [analyticsLoading, setAnalyticsLoading] = useState(false)
    const [analyticsError, setAnalyticsError] = useState<string | null>(null)
    // Bulk edit modal
    const [showBulkEdit, setShowBulkEdit] = useState(false)
    const [bulkEditPrice, setBulkEditPrice] = useState('')
    const [bulkEditQty, setBulkEditQty] = useState('')
    const [bulkEditLoading, setBulkEditLoading] = useState(false)

    // ── eBay marketplace / store ────────────────────────────────
    const [ebayMarketplace, setEbayMarketplace] = useState<string>('EBAY_US')
    const [ebayUsername,    setEbayUsername]    = useState<string>('')

    useEffect(() => {
        async function loadProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return
                const { data } = await (supabase.from('profiles') as any)
                    .select('ebay_marketplace, ebay_username')
                    .eq('id', user.id)
                    .single()
                if (data?.ebay_marketplace) setEbayMarketplace(data.ebay_marketplace)
                if (data?.ebay_username)    setEbayUsername(data.ebay_username)
            } catch {}
        }
        loadProfile()
    }, [])

    // Derived: currency symbol for this user's marketplace
    const currencySymbol = getCurrencySymbol(ebayMarketplace)

    // ── Segments ────────────────────────────────────────────────
    const {
        segments,
        customSegments,
        activeSegmentId,
        setActiveSegmentId,
        loading: segLoading,
        createSegment,
        updateSegment,
        deleteSegment,
    } = useSegments()

    // ── Column config (per-segment, localStorage-backed) ────────
    const {
        visibleColumns,
        allColumns,
        visibleIds,
        isDefault: columnIsDefault,
        toggleColumn,
        moveColumn,
        resetToDefaults: resetColumns,
    } = useColumnConfig(activeSegmentId)

    const [showColumnPanel, setShowColumnPanel] = useState(false)

    // ── Column filters ──────────────────────────────────────────
    const [columnFilters,   setColumnFilters]   = useState<ActiveFilter[]>([])
    const [showFilterPanel, setShowFilterPanel] = useState(false)
    const [openColFilter,   setOpenColFilter]   = useState<string | null>(null) // colId

    // ── Sort state ──────────────────────────────────────────────
    const [sortCol, setSortCol] = useState<string | null>(null)
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

    // ── Bulk action state ───────────────────────────────────────
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
    const [bulkLoading,       setBulkLoading]       = useState(false)

    function upsertFilter(partial: Omit<ActiveFilter, 'id'>) {
        setColumnFilters(prev => {
            const existing = prev.find(f => f.colId === partial.colId)
            if (existing) {
                return prev.map(f => f.colId === partial.colId ? { ...partial, id: f.id } : f)
            }
            return [...prev, { ...partial, id: `${partial.colId}_${Date.now()}` }]
        })
        setPage(1)
    }

    function clearFilter(colId: string) {
        setColumnFilters(prev => prev.filter(f => f.colId !== colId))
    }

    function clearAllFilters() {
        setColumnFilters([])
    }

    // ── Column sort toggle ──────────────────────────────────────
    // none → asc → desc → none
    function toggleSort(colId: string) {
        if (sortCol !== colId) {
            setSortCol(colId)
            setSortDir('asc')
        } else if (sortDir === 'asc') {
            setSortDir('desc')
        } else {
            setSortCol(null)
            setSortDir('asc')
        }
        setPage(1)
    }

    // ── Bulk: change status ─────────────────────────────────────
    async function bulkChangeStatus(newStatus: ListingStatus) {
        setBulkLoading(true)
        try {
            const ids = Array.from(selectedIds)
            const { error } = await (supabase.from('listing_drafts') as any)
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .in('id', ids)
            if (error) throw error
            setListings(prev => prev.map(l =>
                selectedIds.has(l.id) ? { ...l, status: newStatus } : l
            ))
            clearSelection()
        } catch (e) {
            console.error('[LgDashboard] Bulk status error:', e)
        }
        setBulkLoading(false)
    }

    // ── Bulk: delete ────────────────────────────────────────────
    async function bulkDelete() {
        setBulkLoading(true)
        try {
            const ids = Array.from(selectedIds)
            const { error } = await (supabase.from('listing_drafts') as any)
                .delete()
                .in('id', ids)
            if (error) throw error
            setListings(prev => prev.filter(l => !selectedIds.has(l.id)))
            clearSelection()
            setBulkDeleteConfirm(false)
        } catch (e) {
            console.error('[LgDashboard] Bulk delete error:', e)
        }
        setBulkLoading(false)
    }

    // ── Bulk: export CSV ────────────────────────────────────────
    function exportSelectedCsv() {
        const selected = listings.filter(l => selectedIds.has(l.id))
        const headers = ['SKU', 'Title', 'Condition', 'Category', `Price (${currencySymbol})`, 'Margin %', 'Health', 'VeRO', 'Stock', 'Status', 'Created']
        const rows = selected.map(l => [
            l.sku ?? '',
            `"${(l.title || l.product_name || '').replace(/"/g, '""')}"`,
            l.condition ?? '',
            `"${(l.category ?? '').replace(/"/g, '""')}"`,
            l.sell_price?.toFixed(2) ?? '',
            l.margin ?? '',
            l.health_score,
            l.vero_status,
            l.quantity,
            l.status,
            new Date(l.created_at).toLocaleDateString('en-GB'),
        ].join(','))
        const csv = [headers.join(','), ...rows].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url  = URL.createObjectURL(blob)
        const a    = document.createElement('a')
        a.href     = url
        a.download = `listings-export-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    // Listen for top bar button events
    useEffect(() => {
        function onNewListing(e: Event) {
            const mode = (e as CustomEvent).detail?.mode
            // Close every import modal/overlay before opening the new one
            setShowUrlImport(false)
            setShowProcessing(false)
            setShowVeroWarning(false)
            setShowFailed(false)
            setShowPreview(false)
            setImportResult(null)
            setImportPlatform(null)
            setImportUrl('')
            setShowImageImport(false)
            setShowImageProcessing(false)
            setShowImagePreview(false)
            setShowImageFailed(false)
            setImageImportData(null)
            setImageProcessingResult(null)
            setImageVeroResult(null)
            setShowImageVeroWarning(false)
            setImageFailedCode(undefined)
            setShowBarcodeImport(false)
            setShowTitleImport(false)

            if (mode === 'ai_url') {
                setShowUrlImport(true)
            } else if (mode === 'ai_image') {
                setShowImageImport(true)
            } else if (mode === 'ai_barcode') {
                setShowBarcodeImport(true)
            } else if (mode === 'ai_title') {
                setShowTitleImport(true)
            } else {
                onNewListingProp()
            }
        }
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
          source_platform, ebay_listing_id, item_specifics,
          template_id, visual_templates ( name ),
          ebay_impressions, ebay_views, ebay_click_through_rate, ebay_analytics_synced_at
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
    // 1. Apply the active segment (built-in or custom filter rules)
    const activeSegment = segments.find(s => s.id === activeSegmentId)
    const segmentFiltered = activeSegment
        ? applySegment(listings, activeSegment.filters, activeSegment.logic)
        : listings

    const filtered = segmentFiltered.filter(l => {
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

    // 3. Apply column-level filters
    const colFiltered = applyColumnFilters(filtered, columnFilters)

    // 4. Sort
    const sorted = sortCol ? [...colFiltered].sort((a, b) => {
        const def = FILTER_FIELD_DEFS[sortCol]
        if (!def) return 0
        const av = a[def.field as keyof Listing]
        const bv = b[def.field as keyof Listing]
        if (av == null && bv == null) return 0
        if (av == null) return 1
        if (bv == null) return -1
        let cmp = 0
        if (def.type === 'number') cmp = Number(av) - Number(bv)
        else if (def.type === 'date') cmp = new Date(String(av)).getTime() - new Date(String(bv)).getTime()
        else cmp = String(av).toLowerCase().localeCompare(String(bv).toLowerCase())
        return sortDir === 'asc' ? cmp : -cmp
    }) : colFiltered

    const PER_PAGE = rowsPerPage
    const totalPages = Math.ceil(sorted.length / PER_PAGE)
    const paginated = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE)

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

    // ── Delete listing ──────────────────────────────────────────
    async function confirmDelete(id: string) {
        setDeleteLoading(true)
        try {
            const { error } = await (supabase.from('listing_drafts') as any)
                .delete()
                .eq('id', id)
            if (error) throw error
            setListings(prev => prev.filter(l => l.id !== id))
            setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n })
        } catch (e) {
            console.error('[LgDashboard] Delete error:', e)
        }
        setDeleteLoading(false)
        setDeletingId(null)
    }

    function copyToClipboard(text: string, key: string) {
        navigator.clipboard.writeText(text)
        setCopiedId(key)
        setTimeout(() => setCopiedId(null), 1500)
    }

    // ── Duplicate listing ───────────────────────────────────────
    async function duplicateListing(id: string) {
        setDuplicatingId(id)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            // Fetch the original
            const { data: orig } = await (supabase.from('listing_drafts') as any)
                .select('*')
                .eq('id', id)
                .eq('user_id', user.id)
                .single()
            if (!orig) return
            // Build copy without id/timestamps/ebay ids/analytics
            const { id: _id, created_at: _c, updated_at: _u,
                ebay_listing_id: _eli, ebay_impressions: _ei,
                ebay_views: _ev, ebay_click_through_rate: _ectr,
                ebay_analytics_synced_at: _eas,
                visual_templates: _vt,
                ...rest } = orig
            const copy = {
                ...rest,
                title: `Copy of ${orig.title || orig.product_name || 'Untitled'}`,
                status: 'draft',
                ebay_listing_id: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
            const { data: newDraft, error } = await (supabase.from('listing_drafts') as any)
                .insert(copy)
                .select('id')
                .single()
            if (error) throw error
            // Reload the list
            await loadListings()
        } catch (e) {
            console.error('[LgDashboard] Duplicate error:', e)
        }
        setDuplicatingId(null)
    }

    // ── End eBay listing ────────────────────────────────────────
    async function endListing(id: string) {
        setEndingId(id)
        try {
            const res = await fetch('/api/ebay/end-listing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ draftId: id }),
            })
            const json = await res.json()
            if (!json.ok) throw new Error(json.error)
            setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'ended' } : l))
        } catch (e: any) {
            console.error('[LgDashboard] End listing error:', e)
            alert(`Failed to end listing: ${e.message}`)
        }
        setEndingId(null)
    }

    // ── Relist eBay listing ─────────────────────────────────────
    async function relistListing(id: string) {
        setRelistingId(id)
        try {
            const res = await fetch('/api/ebay/relist-listing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ draftId: id }),
            })
            const json = await res.json()
            if (!json.ok) throw new Error(json.error)
            setListings(prev => prev.map(l =>
                l.id === id ? { ...l, status: 'published', ebay_listing_id: json.itemId } : l
            ))
        } catch (e: any) {
            console.error('[LgDashboard] Relist error:', e)
            alert(`Failed to relist: ${e.message}`)
        }
        setRelistingId(null)
    }

    // ── Sync analytics for all published listings ───────────────
    async function syncAnalytics(draftIds?: string[]) {
        setAnalyticsLoading(true)
        setAnalyticsError(null)
        try {
            const body = draftIds ? { draftIds } : { syncAll: true }
            const res = await fetch('/api/ebay/listing-analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const json = await res.json()
            if (!json.ok) {
                if (json.code === 'scope_missing') {
                    setAnalyticsError('Analytics scope not granted — reconnect eBay in Settings to enable stats.')
                } else {
                    setAnalyticsError(json.error ?? 'Failed to sync analytics')
                }
            } else {
                await loadListings()
            }
        } catch (e: any) {
            setAnalyticsError(e.message ?? 'Failed to sync analytics')
        }
        setAnalyticsLoading(false)
    }

    // ── Bulk edit price / qty ───────────────────────────────────
    async function bulkEditSave() {
        if (!bulkEditPrice && !bulkEditQty) return
        setBulkEditLoading(true)
        try {
            const ids = Array.from(selectedIds)
            const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
            if (bulkEditPrice !== '') patch.sell_price = parseFloat(bulkEditPrice)
            if (bulkEditQty !== '') patch.quantity = parseInt(bulkEditQty)
            const { error } = await (supabase.from('listing_drafts') as any)
                .update(patch)
                .in('id', ids)
            if (error) throw error
            setListings(prev => prev.map(l => {
                if (!selectedIds.has(l.id)) return l
                return {
                    ...l,
                    ...(bulkEditPrice !== '' ? { sell_price: parseFloat(bulkEditPrice) } : {}),
                    ...(bulkEditQty !== '' ? { quantity: parseInt(bulkEditQty) } : {}),
                }
            }))
            setShowBulkEdit(false)
            setBulkEditPrice('')
            setBulkEditQty('')
            clearSelection()
        } catch (e) {
            console.error('[LgDashboard] Bulk edit error:', e)
        }
        setBulkEditLoading(false)
    }

    // ── Tab counts ──────────────────────────────────────────────
    const tabCounts = {
        all: listings.length,
        published: metrics.active,
        draft: metrics.drafts,
        ended: metrics.ended,
        scheduled: metrics.scheduled,
    }

    return (
        <div className="flex h-full" style={{ backgroundColor: C.bg }}>

            {/* SEGMENT SIDEBAR — full height, left edge */}
            <SegmentSidebar
                segments={segments}
                customSegments={customSegments}
                activeSegmentId={activeSegmentId}
                listings={listings}
                loading={segLoading}
                onSelect={id => { setActiveSegmentId(id); setPage(1); clearSelection() }}
                onCreateSegment={async (payload) => { await createSegment(payload) }}
                onUpdateSegment={async (id, payload) => { await updateSegment(id, payload) }}
                onDeleteSegment={async (id) => { await deleteSegment(id) }}
            />

            {/* MAIN COLUMN — metric cards + toolbar + table */}
            <div className="flex-1 flex flex-col h-full min-w-0">

            {/* ACTION BAR — above KPI cards */}
            <div className="flex items-center gap-3 px-6 pt-4 pb-0 shrink-0 flex-wrap">
                {/* Bulk Upload */}
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('lg:bulkUpload'))}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all hover:opacity-80"
                    style={{ backgroundColor: C.primaryLight, color: C.primary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                    <Upload size={14} />
                    Bulk Upload
                </button>

                {/* AI Listing dropdown */}
                <div className="relative">
                    <AIButton chevron onClick={() => setAiDropdownOpen(o => !o)}>
                        AI Listing
                    </AIButton>

                    {aiDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setAiDropdownOpen(false)} />
                            <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[260px] rounded-2xl overflow-hidden"
                                style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, boxShadow: '0 8px 32px rgba(117,48,251,0.15)' }}>
                                <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.primaryLight }}>
                                    <p className="text-[12px] font-bold" style={{ color: C.primary, fontFamily: 'Syne, sans-serif' }}>AI Listing</p>
                                    <p className="text-[11px]" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>Let AI build your listing automatically</p>
                                </div>
                                {[
                                    { icon: '🔗', label: 'URL to Listing',   mode: 'ai_url',     desc: 'Paste any supplier or product URL' },
                                    { icon: '📷', label: 'Image to Listing', mode: 'ai_image',   desc: 'Upload a photo, AI reads the product' },
                                    { icon: '#',  label: 'Barcode to Listing',mode: 'ai_barcode', desc: 'Type or scan EAN / UPC barcode' },
                                    { icon: 'T',  label: 'Title to Listing', mode: 'ai_title',   desc: 'Type a product name to search' },
                                ].map(opt => (
                                    <button key={opt.mode}
                                        onClick={() => { setAiDropdownOpen(false); window.dispatchEvent(new CustomEvent('lg:newListing', { detail: { mode: opt.mode } })) }}
                                        className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f8f7ff]"
                                        style={{ borderBottom: `1px solid ${C.primaryLight}` }}>
                                        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5"
                                            style={{ backgroundColor: C.primaryLight, color: C.primary }}>{opt.icon}</span>
                                        <div>
                                            <p className="text-[13px] font-semibold" style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>{opt.label}</p>
                                            <p className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>{opt.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* List New Item */}
                <PrimaryButton onClick={() => window.dispatchEvent(new CustomEvent('lg:newListing', { detail: { mode: 'manual' } }))}>
                    List New Item
                </PrimaryButton>

                <div className="flex-1" />

                {/* eBay Store Badge — shows when connected */}
                {ebayUsername && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>
                        {/* Country flag emoji */}
                        <span style={{ fontSize: 18, lineHeight: 1 }}>
                            {String.fromCodePoint(
                                ...getFlagCode(ebayMarketplace).toUpperCase().split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
                            )}
                        </span>
                        <div className="flex flex-col" style={{ lineHeight: 1.2 }}>
                            <span className="text-[12px] font-bold" style={{ color: C.dark, fontFamily: 'DM Sans, sans-serif' }}>
                                {ebayUsername}
                            </span>
                            <span className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                {getMarketplaceLabel(ebayMarketplace)}
                            </span>
                        </div>
                        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: '#dcfce7', color: '#16a34a', fontFamily: 'DM Sans, sans-serif' }}>
                            {currencySymbol}
                        </span>
                    </div>
                )}

                {/* Sync Analytics button */}
                <button
                    onClick={() => syncAnalytics()}
                    disabled={analyticsLoading}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all hover:opacity-80 disabled:opacity-60"
                    style={{ backgroundColor: C.surface, color: C.secondary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}
                    title="Sync views, impressions and CTR from eBay Analytics">
                    {analyticsLoading
                        ? <span className="w-3.5 h-3.5 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                        : <BarChart2 size={14} />}
                    Sync Stats
                </button>

                {/* My Templates shortcut */}
                <button
                    onClick={() => setShowTemplates(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all hover:opacity-80"
                    style={{ backgroundColor: C.surface, color: C.primary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                    <Palette size={14} />
                    My Templates
                </button>
            </div>
            {/* Analytics error toast */}
            {analyticsError && (
                <div className="mx-6 mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold shrink-0"
                    style={{ backgroundColor: C.dangerBg, color: C.danger, border: `1px solid #fca5a5` }}>
                    <AlertTriangle size={13} />
                    <span style={{ flex: 1, fontFamily: 'DM Sans, sans-serif' }}>{analyticsError}</span>
                    <button onClick={() => setAnalyticsError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.danger }}>
                        <X size={12} />
                    </button>
                </div>
            )}

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
            <div className="flex-1 flex flex-col min-h-0 px-6 pt-4 pb-0">

                {/* TOOLBAR CARD — fixed, never scrolls */}
                <div className="rounded-t-2xl overflow-hidden shrink-0"
                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderBottom: 'none', boxShadow: '0 2px 12px rgba(117,48,251,0.06)' }}>

                    {/* ONE ROW — Tabs + Search + Filters + View Toggle */}
                    <div className="flex items-center px-0"
                        style={{ backgroundColor: '#f3eeff', borderBottom: `2px solid #7530fb` }}>

                        {/* Status Tabs */}
                        {(Object.entries(tabCounts) as [TabFilter, number][]).map(([tab, count], index) => {
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
                                        borderRadius: index === 0 ? '16px 8px 0 0' : '8px 8px 0 0',
                                        marginBottom: '-2px',
                                        marginLeft: index === 0 ? '0px' : '4px',
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


                        {/* Search / Filter / View */}
                        {(<>
                        <div className="flex-1" />

                        {/* Search */}
                        <div className="relative">
                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search title, SKU, EAN, eBay ID..."
                                className="pl-8 pr-7 py-1.5 text-[12px] rounded-xl search-input"
                                style={{
                                    width: 240,
                                    backgroundColor: C.surface,
                                    color: C.body,
                                    fontFamily: 'DM Sans, sans-serif',
                                }}
                            />
                            {search && (
                                <button onClick={() => { setSearch(''); setDebouncedSearch('') }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <X size={11} style={{ color: C.muted }} />
                                </button>
                            )}
                        </div>

                        {/* Filter button */}
                        <button
                            onClick={() => setShowFilterPanel(v => !v)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
                            style={{
                                backgroundColor: showFilterPanel || columnFilters.length > 0 ? C.primary : C.surface,
                                border: `1px solid ${showFilterPanel || columnFilters.length > 0 ? C.primary : C.border}`,
                                color: showFilterPanel || columnFilters.length > 0 ? '#fff' : C.body,
                                fontFamily: 'DM Sans, sans-serif',
                            }}
                            title="Filter listings"
                        >
                            <Filter size={13} />
                            Filter
                            {columnFilters.length > 0 && (
                                <span style={{
                                    minWidth: 16, height: 16, borderRadius: 8, padding: '0 4px',
                                    background: showFilterPanel ? 'rgba(255,255,255,0.3)' : '#fff',
                                    color: showFilterPanel ? '#fff' : C.primary,
                                    fontSize: 10, fontWeight: 800,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>{columnFilters.length}</span>
                            )}
                        </button>

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

                        {/* Columns button */}
                        <button
                            onClick={() => setShowColumnPanel(v => !v)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
                            style={{
                                backgroundColor: showColumnPanel ? C.primary : C.surface,
                                border: `1px solid ${showColumnPanel ? C.primary : C.border}`,
                                color: showColumnPanel ? '#fff' : C.body,
                                fontFamily: 'DM Sans, sans-serif',
                            }}
                            title="Manage columns"
                        >
                            <Columns size={13} />
                            Columns
                            {!columnIsDefault && (
                                <span style={{
                                    width: 6, height: 6, borderRadius: '50%',
                                    background: showColumnPanel ? '#fff' : C.primary,
                                    flexShrink: 0,
                                }} />
                            )}
                        </button>
                        </>)}
                    </div>
                </div>{/* end toolbar card */}

                {/* TABLE CARD — one table, sticky thead, scrolling tbody */}
                <div className="flex-1 flex flex-col min-h-0 rounded-b-2xl overflow-hidden"
                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderTop: 'none', boxShadow: '0 2px 12px rgba(117,48,251,0.06)' }}>

                    {viewMode === 'grid' ? (
                        /* ── GRID / CARD VIEW ────────────────────────── */
                        <div className="flex-1 overflow-auto min-h-0 p-4">
                            {paginated.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                        style={{ backgroundColor: C.primaryLight }}>
                                        <Package size={22} style={{ color: C.primary }} />
                                    </div>
                                    <p className="text-[14px] font-semibold" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>No listings found</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                                    {paginated.map(listing => {
                                        const isSelected = selectedIds.has(listing.id)
                                        return (
                                            <div key={listing.id}
                                                onClick={() => toggleSelect(listing.id)}
                                                style={{
                                                    backgroundColor: C.surface,
                                                    border: `2px solid ${isSelected ? C.primary : C.border}`,
                                                    borderRadius: 16,
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    transition: 'box-shadow 0.15s, border-color 0.15s',
                                                    boxShadow: isSelected ? `0 0 0 3px ${C.primary}22` : '0 2px 8px rgba(117,48,251,0.06)',
                                                }}
                                                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = C.primary + '66' }}
                                                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = C.border }}
                                            >
                                                {/* Image */}
                                                <div style={{ position: 'relative', height: 160, backgroundColor: C.bg, overflow: 'hidden' }}>
                                                    {listing.main_photo_url ? (
                                                        <img src={listing.main_photo_url} alt={listing.title || ''}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Package size={32} style={{ color: C.muted }} />
                                                        </div>
                                                    )}
                                                    {/* Checkbox overlay top-left */}
                                                    <div style={{ position: 'absolute', top: 8, left: 8 }}
                                                        onClick={e => e.stopPropagation()}>
                                                        <input type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleSelect(listing.id)}
                                                            style={{ accentColor: C.primary, width: 16, height: 16, cursor: 'pointer' }}
                                                        />
                                                    </div>
                                                    {/* Status top-right */}
                                                    <div style={{ position: 'absolute', top: 8, right: 8 }}>
                                                        <StatusPill status={listing.status} />
                                                    </div>
                                                </div>

                                                {/* Body */}
                                                <div style={{ padding: '12px 14px 10px' }}>
                                                    {/* Title + SKU */}
                                                    <p style={{ fontSize: 13, fontWeight: 600, color: C.body, fontFamily: 'DM Sans, sans-serif', marginBottom: 2, lineHeight: 1.4 }}
                                                        className="line-clamp-2">
                                                        {listing.title || listing.product_name || 'Untitled'}
                                                    </p>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                                                        {listing.sku && (
                                                            <span style={{ fontSize: 10, color: C.muted, fontFamily: 'DM Sans, sans-serif',
                                                                backgroundColor: C.bg, border: `1px solid ${C.border}`,
                                                                borderRadius: 4, padding: '1px 6px', display: 'inline-block' }}>
                                                                {listing.sku}
                                                            </span>
                                                        )}
                                                        {listing.visual_templates?.name && (
                                                            <span style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: 3,
                                                                fontSize: 10, fontWeight: 600,
                                                                padding: '1px 6px', borderRadius: 4,
                                                                backgroundColor: C.primaryLight, color: C.primary,
                                                                fontFamily: 'DM Sans, sans-serif',
                                                                maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                            }} title={`Template: ${listing.visual_templates.name}`}>
                                                                <Palette size={8} />
                                                                {listing.visual_templates.name}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Price row */}
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                                        <span style={{ fontSize: 18, fontWeight: 700, color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                                            {listing.sell_price != null ? `${currencySymbol}${listing.sell_price.toFixed(2)}` : '—'}
                                                        </span>
                                                        {listing.margin != null && (
                                                            <span style={{
                                                                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12,
                                                                backgroundColor: listing.margin >= 25 ? C.successBg : listing.margin >= 15 ? C.warningBg : C.dangerBg,
                                                                color: listing.margin >= 25 ? C.success : listing.margin >= 15 ? C.warning : C.danger,
                                                                fontFamily: 'DM Sans, sans-serif',
                                                            }}>
                                                                {listing.margin}%
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Health + Source */}
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <HealthBadge score={listing.health_score} />
                                                            <StockCell quantity={listing.quantity} outOfStock={listing.out_of_stock_option} sellerType={listing.seller_type} />
                                                        </div>
                                                        <SourceBadge platform={listing.source_platform} />
                                                    </div>

                                                    {/* Actions row */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 8, borderTop: `1px solid ${C.border}` }}
                                                        onClick={e => e.stopPropagation()}>
                                                        <button onClick={() => onEditDraft(listing.id)}
                                                            style={{ flex: 1, height: 30, borderRadius: 8, border: 'none',
                                                                backgroundColor: C.primaryLight, color: C.primary, cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            title="Edit">
                                                            <Pencil size={13} />
                                                        </button>
                                                        <button
                                                            style={{ flex: 1, height: 30, borderRadius: 8, border: 'none',
                                                                backgroundColor: C.bg, color: C.secondary, cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            title="View History">
                                                            <Clock size={13} />
                                                        </button>
                                                        <button
                                                            style={{ flex: 1, height: 30, borderRadius: 8, border: 'none',
                                                                backgroundColor: C.bg, color: C.secondary, cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            title="Export CSV">
                                                            <Download size={13} />
                                                        </button>
                                                        <button onClick={() => setDeletingId(listing.id)}
                                                            style={{ flex: 1, height: 30, borderRadius: 8, border: 'none',
                                                                backgroundColor: C.dangerBg, color: C.danger, cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            title="Delete">
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                    <div className="flex-1 overflow-auto min-h-0">
                        <table className="w-full" style={{ tableLayout: 'fixed' }}>
                            {/* STICKY HEADER */}
                            <thead className="sticky top-0 z-10">
                                <tr style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
                                    {/* Fixed: checkbox */}
                                    <th style={{ width: 40 }} className="px-4 py-1.5">
                                        <input type="checkbox"
                                            checked={paginated.length > 0 && selectedIds.size === paginated.length}
                                            onChange={toggleSelectAll}
                                            className="rounded"
                                            style={{ accentColor: C.primary }}
                                        />
                                    </th>
                                    {/* Fixed: photo */}
                                    <th style={{ width: 40, color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }} className="px-0 py-2 text-left text-[12px] font-bold uppercase tracking-widest"></th>

                                    {/* Dynamic columns */}
                                    {visibleColumns.map(col => {
                                        const hasFilter  = columnFilters.some(f => f.colId === col.id)
                                        const hasDef     = !!FILTER_FIELD_DEFS[col.id]
                                        const isActiveSort = sortCol === col.id
                                        return (
                                            <th
                                                key={col.id}
                                                style={{ width: col.width, color: '#6b7280', fontFamily: 'DM Sans, sans-serif', position: 'relative' }}
                                                className="px-3 py-2 text-left text-[12px] font-bold uppercase tracking-widest"
                                            >
                                                <div
                                                    style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', userSelect: 'none' }}
                                                    onClick={() => toggleSort(col.id)}
                                                    title={`Sort by ${col.label}`}
                                                >
                                                    <span style={{ color: isActiveSort ? C.primary : '#6b7280' }}>{col.label}</span>
                                                    {/* Sort chevron */}
                                                    <span style={{ color: isActiveSort ? C.primary : C.borderInput, flexShrink: 0, display: 'flex' }}>
                                                        {isActiveSort && sortDir === 'asc'
                                                            ? <ChevronUp size={12} />
                                                            : <ChevronDown size={12} />}
                                                    </span>
                                                    {/* Filter icon */}
                                                    {hasDef && (
                                                        <button
                                                            type="button"
                                                            onClick={e => { e.stopPropagation(); setOpenColFilter(openColFilter === col.id ? null : col.id) }}
                                                            title={`Filter by ${col.label}`}
                                                            style={{
                                                                width:        16,
                                                                height:       16,
                                                                borderRadius: 4,
                                                                border:       'none',
                                                                background:   hasFilter ? C.primary : 'transparent',
                                                                color:        hasFilter ? '#fff'    : C.muted,
                                                                cursor:       'pointer',
                                                                display:      'flex',
                                                                alignItems:   'center',
                                                                justifyContent: 'center',
                                                                flexShrink:   0,
                                                            }}
                                                        >
                                                            <Filter size={9} />
                                                        </button>
                                                    )}
                                                </div>
                                                {openColFilter === col.id && (
                                                    <ColumnFilterPopover
                                                        colId={col.id}
                                                        activeFilter={columnFilters.find(f => f.colId === col.id) ?? null}
                                                        onApply={upsertFilter}
                                                        onClear={() => clearFilter(col.id)}
                                                        onClose={() => setOpenColFilter(null)}
                                                    />
                                                )}
                                            </th>
                                        )
                                    })}

                                    {/* Fixed: actions */}
                                    <th style={{ width: 180, color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }} className="px-3 py-2 text-left text-[12px] font-bold uppercase tracking-widest"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={2 + visibleColumns.length + 1} className="py-16 text-center">
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
                                                        : columnFilters.length > 0
                                                            ? 'No listings match the active filters'
                                                            : 'No listings in this status'}
                                                </p>
                                                {(debouncedSearch || columnFilters.length > 0) && (
                                                    <div className="flex gap-2">
                                                        {debouncedSearch && (
                                                            <button
                                                                onClick={() => { setSearch(''); setDebouncedSearch('') }}
                                                                className="px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all hover:opacity-80"
                                                                style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                                                Clear Search
                                                            </button>
                                                        )}
                                                        {columnFilters.length > 0 && (
                                                            <button
                                                                onClick={clearAllFilters}
                                                                className="px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all hover:opacity-80"
                                                                style={{ backgroundColor: C.dangerBg, color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>
                                                                Clear Filters
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginated.map((listing) => {
                                    const isSelected = selectedIds.has(listing.id)

                                    // ── Dynamic cell renderer ─────────────
                                    function renderBodyCell(colId: string) {
                                        switch (colId) {
                                            case 'product':
                                                return (
                                                    <td key="product" className="px-3 py-1.5 max-w-[240px]">
                                                        <p className="text-[12px] font-semibold truncate max-w-[220px]"
                                                            style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                                            {listing.title || listing.product_name || 'Untitled'}
                                                        </p>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                                                            {listing.sku && (
                                                                <span className="text-[10px] px-1.5 py-0.5 rounded inline-block"
                                                                    style={{ backgroundColor: C.bg, color: C.muted, fontFamily: 'DM Sans, sans-serif', border: `1px solid ${C.border}` }}>
                                                                    {listing.sku}
                                                                </span>
                                                            )}
                                                            {listing.visual_templates?.name && (
                                                                <span style={{
                                                                    display: 'inline-flex', alignItems: 'center', gap: 3,
                                                                    fontSize: 10, fontWeight: 600,
                                                                    padding: '1px 6px', borderRadius: 4,
                                                                    backgroundColor: C.primaryLight, color: C.primary,
                                                                    fontFamily: 'DM Sans, sans-serif',
                                                                    maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                                }} title={`Template: ${listing.visual_templates.name}`}>
                                                                    <Palette size={8} />
                                                                    {listing.visual_templates.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                )
                                            case 'condition':
                                                return (
                                                    <td key="condition" className="px-3 py-1.5">
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
                                                )
                                            case 'category':
                                                return (
                                                    <td key="category" className="px-3 py-3 max-w-[120px]">
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
                                                )
                                            case 'source':
                                                return (
                                                    <td key="source" className="px-3 py-1.5">
                                                        <SourceBadge platform={listing.source_platform} />
                                                    </td>
                                                )
                                            case 'seller_type':
                                                return (
                                                    <td key="seller_type" className="px-3 py-1.5">
                                                        <SellerTypePill type={listing.seller_type} />
                                                    </td>
                                                )
                                            case 'price':
                                                return (
                                                    <td key="price" className="px-3 py-1.5">
                                                        <span className="text-[14px] font-bold" style={{ color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }}>
                                                            {listing.sell_price != null ? `${currencySymbol}${listing.sell_price.toFixed(2)}` : '—'}
                                                        </span>
                                                    </td>
                                                )
                                            case 'margin':
                                                return (
                                                    <td key="margin" className="px-3 py-1.5">
                                                        {listing.margin !== null ? (
                                                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                                                style={{
                                                                    backgroundColor: listing.margin >= 25 ? C.successBg : listing.margin >= 15 ? C.warningBg : C.dangerBg,
                                                                    color: listing.margin >= 25 ? C.success : listing.margin >= 15 ? C.warning : C.danger,
                                                                    fontFamily: 'DM Sans, sans-serif',
                                                                }}>
                                                                {listing.margin}%
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: C.muted, fontSize: 12 }}>—</span>
                                                        )}
                                                    </td>
                                                )
                                            case 'net_profit':
                                                return (
                                                    <td key="net_profit" className="px-3 py-1.5">
                                                        {listing.net_profit !== null ? (
                                                            <span className="text-[13px] font-semibold"
                                                                style={{ color: listing.net_profit >= 0 ? C.success : C.danger, fontFamily: 'DM Sans, sans-serif' }}>
                                                                {currencySymbol}{listing.net_profit.toFixed(2)}
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: C.muted, fontSize: 12 }}>—</span>
                                                        )}
                                                    </td>
                                                )
                                            case 'health':
                                                return (
                                                    <td key="health" className="px-3 py-1.5">
                                                        <HealthBadge score={listing.health_score} />
                                                    </td>
                                                )
                                            case 'vero':
                                                return (
                                                    <td key="vero" className="px-3 py-1.5">
                                                        <VeroBadge status={listing.vero_status} />
                                                    </td>
                                                )
                                            case 'stock':
                                                return (
                                                    <td key="stock" className="px-3 py-1.5">
                                                        <StockCell
                                                            quantity={listing.quantity}
                                                            outOfStock={listing.out_of_stock_option}
                                                            sellerType={listing.seller_type}
                                                        />
                                                    </td>
                                                )
                                            case 'status':
                                                return (
                                                    <td key="status" className="px-3 py-1.5">
                                                        <div className="flex flex-col gap-1">
                                                            <StatusPill status={listing.status} />
                                                            {listing.ebay_listing_id && (
                                                                <a
                                                                    href={`https://www.ebay.com/itm/${listing.ebay_listing_id}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    onClick={e => e.stopPropagation()}
                                                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold transition-all hover:opacity-80"
                                                                    style={{
                                                                        backgroundColor: '#dcfce7',
                                                                        color: '#16a34a',
                                                                        border: '1px solid #86efac',
                                                                        textDecoration: 'none',
                                                                        width: 'fit-content',
                                                                        fontFamily: 'DM Sans, sans-serif',
                                                                    }}
                                                                    title={`View on eBay: ${listing.ebay_listing_id}`}
                                                                >
                                                                    <ExternalLink size={8} />
                                                                    eBay Live
                                                                </a>
                                                            )}
                                                            {/* Analytics mini stats */}
                                                            {listing.ebay_analytics_synced_at && (
                                                                <div className="flex items-center gap-2">
                                                                    {listing.ebay_impressions != null && (
                                                                        <span style={{ fontSize: 9, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}
                                                                            title="Impressions">
                                                                            👁 {listing.ebay_impressions >= 1000
                                                                                ? `${(listing.ebay_impressions / 1000).toFixed(1)}k`
                                                                                : listing.ebay_impressions}
                                                                        </span>
                                                                    )}
                                                                    {listing.ebay_views != null && (
                                                                        <span style={{ fontSize: 9, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}
                                                                            title="Views">
                                                                            <Eye size={8} style={{ display: 'inline', verticalAlign: 'middle' }} /> {listing.ebay_views}
                                                                        </span>
                                                                    )}
                                                                    {listing.ebay_click_through_rate != null && (
                                                                        <span style={{ fontSize: 9, color: C.success, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}
                                                                            title="Click-through rate">
                                                                            {(listing.ebay_click_through_rate * 100).toFixed(1)}% CTR
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                )
                                            case 'date':
                                                return (
                                                    <td key="date" className="px-3 py-1.5">
                                                        <span className="text-[11px]"
                                                            style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                                            {new Date(listing.created_at).toLocaleDateString('en-GB', {
                                                                day: '2-digit', month: 'short', year: '2-digit'
                                                            })}
                                                        </span>
                                                    </td>
                                                )
                                            case 'updated':
                                                return (
                                                    <td key="updated" className="px-3 py-1.5">
                                                        <span className="text-[11px]"
                                                            style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                                            {new Date(listing.updated_at).toLocaleDateString('en-GB', {
                                                                day: '2-digit', month: 'short', year: '2-digit'
                                                            })}
                                                        </span>
                                                    </td>
                                                )
                                            case 'ids':
                                                return (
                                                    <td key="ids" className="px-3 py-1.5">
                                                        <div className="flex flex-col gap-1">
                                                            {/* EAN / UPC — auto detected */}
                                                            {(() => {
                                                                const gtinValue = listing.item_specifics?.['EAN'] || listing.item_specifics?.['UPC'] || listing.item_specifics?.['GTIN']
                                                                if (gtinValue) {
                                                                    const { label, color, bg } = detectGtinType(gtinValue)
                                                                    return (
                                                                        <div className="flex items-center gap-1 group/ean">
                                                                            <span className="text-[9px] font-bold px-1 py-0.5 rounded"
                                                                                style={{ backgroundColor: bg, color, fontFamily: 'DM Sans, sans-serif' }}>
                                                                                {label}
                                                                            </span>
                                                                            <span className="text-[11px]"
                                                                                style={{ color: C.body, fontFamily: 'monospace' }}>
                                                                                {gtinValue}
                                                                            </span>
                                                                            <button
                                                                                onClick={e => { e.stopPropagation(); copyToClipboard(gtinValue, `ean-${listing.id}`) }}
                                                                                className="opacity-0 group-hover/ean:opacity-100 transition-opacity p-0.5 rounded"
                                                                                style={{ color: copiedId === `ean-${listing.id}` ? C.success : C.muted }}
                                                                                title="Copy">
                                                                                {copiedId === `ean-${listing.id}` ? <Check size={10} /> : <Copy size={10} />}
                                                                            </button>
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
                                                                <div className="flex items-center gap-1 group/ebay">
                                                                    <span className="text-[9px] font-bold px-1 py-0.5 rounded"
                                                                        style={{ backgroundColor: '#dcfce7', color: '#16a34a', fontFamily: 'DM Sans, sans-serif' }}>
                                                                        eBay
                                                                    </span>
                                                                    <a
                                                                        href={`https://www.ebay.com/itm/${listing.ebay_listing_id}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        onClick={e => e.stopPropagation()}
                                                                        className="text-[11px] hover:underline"
                                                                        style={{ color: '#16a34a', fontFamily: 'monospace', textDecoration: 'none' }}
                                                                        title="View on eBay"
                                                                    >
                                                                        {listing.ebay_listing_id}
                                                                    </a>
                                                                    <button
                                                                        onClick={e => { e.stopPropagation(); copyToClipboard(listing.ebay_listing_id!, `ebay-${listing.id}`) }}
                                                                        className="opacity-0 group-hover/ebay:opacity-100 transition-opacity p-0.5 rounded"
                                                                        style={{ color: copiedId === `ebay-${listing.id}` ? C.success : C.muted }}
                                                                        title="Copy eBay Item ID">
                                                                        {copiedId === `ebay-${listing.id}` ? <Check size={10} /> : <Copy size={10} />}
                                                                    </button>
                                                                    <a
                                                                        href={`https://www.ebay.com/itm/${listing.ebay_listing_id}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        onClick={e => e.stopPropagation()}
                                                                        className="opacity-0 group-hover/ebay:opacity-100 transition-opacity p-0.5 rounded"
                                                                        style={{ color: '#16a34a' }}
                                                                        title="Open on eBay">
                                                                        <ExternalLink size={10} />
                                                                    </a>
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
                                                )
                                            default:
                                                return <td key={colId} />
                                        }
                                    }

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

                                            {/* Fixed: Checkbox */}
                                            <td className="px-4 py-1.5" onClick={e => e.stopPropagation()}>
                                                <input type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(listing.id)}
                                                    style={{ accentColor: C.primary }}
                                                    className="rounded"
                                                />
                                            </td>

                                            {/* Fixed: Product Image */}
                                            <td className="p-0" style={{ width: 40, minWidth: 40, maxWidth: 40, height: 40, maxHeight: 40, overflow: 'hidden' }}>
                                                <div style={{ width: 40, height: 40, backgroundColor: C.bg, overflow: 'hidden', flexShrink: 0 }}>
                                                    {listing.main_photo_url ? (
                                                        <img
                                                            src={listing.main_photo_url}
                                                            alt={listing.title || ''}
                                                            style={{ width: 40, height: 40, objectFit: 'cover', display: 'block' }}
                                                        />
                                                    ) : (
                                                        <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Package size={14} style={{ color: C.muted }} />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Dynamic columns */}
                                            {visibleColumns.map(col => renderBodyCell(col.id))}

                                            {/* Fixed: Actions */}
                                            <td className="px-3 py-1.5" onClick={e => e.stopPropagation()}>
                                                {deletingId === listing.id ? (
                                                    /* ── Inline delete confirm ── */
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <span className="text-[11px] font-semibold" style={{ color: C.danger }}>
                                                            Delete?
                                                        </span>
                                                        <button
                                                            onClick={() => setDeletingId(null)}
                                                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-opacity hover:opacity-80"
                                                            style={{ backgroundColor: C.bg, color: C.muted, border: `1px solid ${C.border}` }}
                                                        >
                                                            No
                                                        </button>
                                                        <button
                                                            onClick={() => confirmDelete(listing.id)}
                                                            disabled={deleteLoading}
                                                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center gap-1"
                                                            style={{ backgroundColor: C.danger }}
                                                        >
                                                            {deleteLoading
                                                                ? <span className="w-3 h-3 rounded-full border border-white/40 border-t-white animate-spin" />
                                                                : <Trash2 size={11} />}
                                                            Yes
                                                        </button>
                                                    </div>
                                                ) : (
                                                    /* ── Normal action buttons ── */
                                                    <div className="flex items-center justify-end gap-1">
                                                        {/* Edit */}
                                                        <button onClick={() => onEditDraft(listing.id)}
                                                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                                                            style={{ backgroundColor: C.primaryLight }}
                                                            title="Edit in Wizard">
                                                            <Pencil size={13} style={{ color: C.primary }} />
                                                        </button>
                                                        {/* Duplicate */}
                                                        <button
                                                            onClick={() => duplicateListing(listing.id)}
                                                            disabled={duplicatingId === listing.id}
                                                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-50"
                                                            style={{ backgroundColor: C.bg }}
                                                            title="Duplicate listing">
                                                            {duplicatingId === listing.id
                                                                ? <span className="w-3 h-3 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
                                                                : <CopyPlus size={13} style={{ color: C.secondary }} />}
                                                        </button>
                                                        {/* End live listing */}
                                                        {listing.status === 'published' && listing.ebay_listing_id && (
                                                            <button
                                                                onClick={() => endListing(listing.id)}
                                                                disabled={endingId === listing.id}
                                                                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-50"
                                                                style={{ backgroundColor: C.warningBg }}
                                                                title="End this eBay listing">
                                                                {endingId === listing.id
                                                                    ? <span className="w-3 h-3 rounded-full border-2 border-amber-300 border-t-amber-600 animate-spin" />
                                                                    : <StopCircle size={13} style={{ color: C.warning }} />}
                                                            </button>
                                                        )}
                                                        {/* Relist ended listing */}
                                                        {listing.status === 'ended' && listing.ebay_listing_id && (
                                                            <button
                                                                onClick={() => relistListing(listing.id)}
                                                                disabled={relistingId === listing.id}
                                                                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-50"
                                                                style={{ backgroundColor: C.successBg }}
                                                                title="Relist on eBay">
                                                                {relistingId === listing.id
                                                                    ? <span className="w-3 h-3 rounded-full border-2 border-green-300 border-t-green-600 animate-spin" />
                                                                    : <RefreshCw size={13} style={{ color: C.success }} />}
                                                            </button>
                                                        )}
                                                        {/* Delete */}
                                                        <button
                                                            onClick={() => setDeletingId(listing.id)}
                                                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
                                                            style={{ backgroundColor: C.dangerBg }}
                                                            title="Delete Listing">
                                                            <Trash2 size={13} style={{ color: C.danger }} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    )}{/* end table/grid conditional */}

                    {/* PAGINATION — fixed at bottom, doubles as bulk action bar */}
                    {sorted.length > 0 && (
                        <div className="flex items-center justify-between px-5 py-3 shrink-0 gap-3"
                            style={{ borderTop: `1px solid ${C.border}`, backgroundColor: C.surface }}>

                            {/* Left — bulk actions when selected, otherwise count */}
                            <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
                                {selectedIds.size > 0 ? (
                                    /* ── Bulk mode ── */
                                    <>
                                        {/* Selected count badge */}
                                        <span style={{
                                            backgroundColor: C.primary, color: '#fff',
                                            fontSize: 11, fontWeight: 800,
                                            padding: '2px 9px', borderRadius: 20,
                                            fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap', flexShrink: 0,
                                        }}>
                                            {selectedIds.size} selected
                                        </span>
                                        {/* Deselect */}
                                        <button onClick={clearSelection} style={{
                                            background: 'transparent', border: 'none',
                                            color: C.muted, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: 3,
                                            fontSize: 11, fontFamily: 'DM Sans, sans-serif', flexShrink: 0,
                                        }}>
                                            <X size={11} /> Deselect
                                        </button>

                                        <div style={{ width: 1, height: 16, backgroundColor: C.border, flexShrink: 0 }} />

                                        {bulkDeleteConfirm ? (
                                            /* ── Confirm delete ── */
                                            <>
                                                <span style={{ color: C.danger, fontSize: 11, fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
                                                    Delete {selectedIds.size} listing{selectedIds.size !== 1 ? 's' : ''}?
                                                </span>
                                                <button onClick={() => setBulkDeleteConfirm(false)} style={{
                                                    padding: '3px 10px', borderRadius: 6,
                                                    border: `1px solid ${C.border}`, background: C.bg,
                                                    color: C.secondary, fontSize: 11, fontWeight: 600,
                                                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', flexShrink: 0,
                                                }}>
                                                    Cancel
                                                </button>
                                                <button onClick={bulkDelete} disabled={bulkLoading} style={{
                                                    padding: '3px 10px', borderRadius: 6,
                                                    border: 'none', background: C.danger,
                                                    color: '#fff', fontSize: 11, fontWeight: 700,
                                                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                                    display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                                                    opacity: bulkLoading ? 0.7 : 1,
                                                }}>
                                                    {bulkLoading
                                                        ? <span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', display: 'inline-block' }} className="animate-spin" />
                                                        : <Trash2 size={11} />}
                                                    Yes, delete
                                                </button>
                                            </>
                                        ) : (
                                            /* ── Normal bulk actions ── */
                                            <>
                                                {/* Bulk edit price/qty */}
                                                <button onClick={() => { setBulkEditPrice(''); setBulkEditQty(''); setShowBulkEdit(true) }} style={{
                                                    padding: '3px 10px', borderRadius: 6,
                                                    border: `1px solid ${C.primary}`, background: C.primaryLight,
                                                    color: C.primary, fontSize: 11, fontWeight: 600,
                                                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                                    display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                                                }}>
                                                    <Edit3 size={11} /> Edit
                                                </button>
                                                <button onClick={() => bulkChangeStatus('published')} disabled={bulkLoading} style={{
                                                    padding: '3px 10px', borderRadius: 6,
                                                    border: `1px solid ${C.success}`, background: 'transparent',
                                                    color: C.success, fontSize: 11, fontWeight: 600,
                                                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', flexShrink: 0,
                                                }}>
                                                    ✓ Publish
                                                </button>
                                                <button onClick={() => bulkChangeStatus('ended')} disabled={bulkLoading} style={{
                                                    padding: '3px 10px', borderRadius: 6,
                                                    border: `1px solid ${C.border}`, background: 'transparent',
                                                    color: C.secondary, fontSize: 11, fontWeight: 600,
                                                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', flexShrink: 0,
                                                }}>
                                                    ○ End
                                                </button>
                                                <button onClick={exportSelectedCsv} style={{
                                                    padding: '3px 10px', borderRadius: 6,
                                                    border: `1px solid ${C.primary}`, background: 'transparent',
                                                    color: C.primary, fontSize: 11, fontWeight: 600,
                                                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                                    display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                                                }}>
                                                    <Download size={11} /> CSV
                                                </button>
                                                <button onClick={() => setBulkDeleteConfirm(true)} style={{
                                                    padding: '3px 10px', borderRadius: 6,
                                                    border: `1px solid ${C.danger}`, background: 'transparent',
                                                    color: C.danger, fontSize: 11, fontWeight: 600,
                                                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                                    display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                                                }}>
                                                    <Trash2 size={11} /> Delete
                                                </button>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    /* ── Normal count ── */
                                    <p className="text-[12px] whitespace-nowrap" style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}>
                                        <span style={{ color: C.dark, fontWeight: 600 }}>
                                            {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, sorted.length)}
                                        </span>
                                        {' '}of{' '}
                                        <span style={{ color: C.dark, fontWeight: 600 }}>{sorted.length.toLocaleString()}</span>
                                        {' '}listings
                                    </p>
                                )}
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

                            {/* Right — rows per page + optional jump to page */}
                            <div className="flex items-center gap-3">
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

                        </div>
                    )}

                </div>{/* end table card */}

            </div>{/* end toolbar+table */}
            </div>{/* end main column */}

            {/* ── BULK EDIT MODAL ──────────────────────────────────── */}
            {showBulkEdit && (
                <>
                    <div onClick={() => setShowBulkEdit(false)} style={{
                        position: 'fixed', inset: 0, zIndex: 50,
                        background: 'rgba(30,21,53,0.4)', backdropFilter: 'blur(2px)',
                    }} />
                    <div style={{
                        position: 'fixed', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 51,
                        width: 380,
                        background: C.surface,
                        borderRadius: 20,
                        boxShadow: '0 20px 60px rgba(117,48,251,0.2)',
                        border: `1px solid ${C.border}`,
                        overflow: 'hidden',
                    }}>
                        {/* Header */}
                        <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${C.border}`, backgroundColor: C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 700, color: C.dark, fontFamily: 'Syne, sans-serif', margin: 0 }}>
                                    Bulk Edit
                                </p>
                                <p style={{ fontSize: 11, color: C.muted, fontFamily: 'DM Sans, sans-serif', margin: '2px 0 0' }}>
                                    Update {selectedIds.size} listing{selectedIds.size !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <button onClick={() => setShowBulkEdit(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                                <X size={16} />
                            </button>
                        </div>
                        {/* Body */}
                        <div style={{ padding: '20px' }}>
                            <p style={{ fontSize: 11, color: C.secondary, fontFamily: 'DM Sans, sans-serif', marginBottom: 16 }}>
                                Leave a field blank to keep existing values unchanged.
                            </p>
                            {/* Price */}
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.dark, fontFamily: 'DM Sans, sans-serif', marginBottom: 5 }}>
                                    New Price ({currencySymbol})
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="e.g. 14.99"
                                    value={bulkEditPrice}
                                    onChange={e => setBulkEditPrice(e.target.value)}
                                    style={{
                                        width: '100%', padding: '8px 12px',
                                        border: `1px solid ${C.borderInput}`, borderRadius: 10,
                                        fontSize: 13, fontFamily: 'DM Sans, sans-serif',
                                        color: C.body, backgroundColor: C.bg, outline: 'none',
                                        boxSizing: 'border-box',
                                    }}
                                    onFocus={e => e.target.style.borderColor = C.primary}
                                    onBlur={e => e.target.style.borderColor = C.borderInput}
                                />
                            </div>
                            {/* Qty */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.dark, fontFamily: 'DM Sans, sans-serif', marginBottom: 5 }}>
                                    New Quantity
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    placeholder="e.g. 10"
                                    value={bulkEditQty}
                                    onChange={e => setBulkEditQty(e.target.value)}
                                    style={{
                                        width: '100%', padding: '8px 12px',
                                        border: `1px solid ${C.borderInput}`, borderRadius: 10,
                                        fontSize: 13, fontFamily: 'DM Sans, sans-serif',
                                        color: C.body, backgroundColor: C.bg, outline: 'none',
                                        boxSizing: 'border-box',
                                    }}
                                    onFocus={e => e.target.style.borderColor = C.primary}
                                    onBlur={e => e.target.style.borderColor = C.borderInput}
                                />
                            </div>
                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={() => setShowBulkEdit(false)} style={{
                                    flex: 1, padding: '10px', borderRadius: 10,
                                    border: `1px solid ${C.border}`, background: C.bg,
                                    color: C.secondary, fontSize: 13, fontWeight: 600,
                                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                }}>
                                    Cancel
                                </button>
                                <button
                                    onClick={bulkEditSave}
                                    disabled={bulkEditLoading || (!bulkEditPrice && !bulkEditQty)}
                                    style={{
                                        flex: 1, padding: '10px', borderRadius: 10,
                                        border: 'none', background: C.primary,
                                        color: '#fff', fontSize: 13, fontWeight: 700,
                                        cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                        opacity: bulkEditLoading || (!bulkEditPrice && !bulkEditQty) ? 0.6 : 1,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    }}>
                                    {bulkEditLoading
                                        ? <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff' }} className="animate-spin" />
                                        : <Check size={14} />}
                                    Apply to {selectedIds.size}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── MY TEMPLATES DRAWER — slides in from the right ───── */}
            {showTemplates && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setShowTemplates(false)}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 40,
                            background: 'rgba(30,21,53,0.35)',
                            backdropFilter: 'blur(2px)',
                            animation: 'fadeIn 0.2s ease',
                        }}
                    />
                    {/* Drawer panel */}
                    <div style={{
                        position: 'fixed', top: 0, right: 0, bottom: 0,
                        width: 'min(600px, 92vw)', zIndex: 50,
                        background: C.surface,
                        boxShadow: '-8px 0 40px rgba(117,48,251,0.18)',
                        display: 'flex', flexDirection: 'column',
                        animation: 'slideInRight 0.25s cubic-bezier(0.32,0.72,0,1)',
                    }}>
                        <MyTemplatesGallery onClose={() => setShowTemplates(false)} />
                    </div>
                    <style>{`
                        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
                        @keyframes slideInRight { from { transform:translateX(100%) } to { transform:translateX(0) } }
                    `}</style>
                </>
            )}

            {/* ── Screen 1: URL paste modal ────────────────────────── */}
            {showUrlImport && (
                <UrlImport
                    onClose={() => setShowUrlImport(false)}
                    onImport={(url, platform) => {
                        setShowUrlImport(false)
                        setImportUrl(url)
                        setImportPlatform(platform)
                        setShowProcessing(true)
                    }}
                />
            )}

            {/* ── Screen 2: Processing overlay ─────────────────────── */}
            {showProcessing && importPlatform && (
                <UrlImportProcessing
                    url={importUrl}
                    platform={importPlatform}
                    onComplete={(result: UrlImportResult) => {
                        setShowProcessing(false)
                        setImportResult(result)
                        // Gate on VeRO: show warning screen first if risk detected
                        const veroStatus = result.listing?.vero_status
                        if (veroStatus === 'warning' || veroStatus === 'flagged') {
                            setShowVeroWarning(true)
                        } else {
                            setShowPreview(true)
                        }
                    }}
                    onFailed={(errorCode, _message) => {
                        setShowProcessing(false)
                        setFailedErrorCode(errorCode ?? undefined)
                        setShowFailed(true)
                    }}
                    onCancel={() => {
                        setShowProcessing(false)
                        setShowUrlImport(true)
                    }}
                />
            )}

            {/* ── Screen 2b: VeRO Warning (shown before preview if risk found) ── */}
            {showVeroWarning && importResult?.listing && (
                <UrlImportVeroWarning
                    brand={importResult.listing.vero_brand ?? importResult.listing.brand ?? 'Unknown Brand'}
                    riskLevel={importResult.listing.vero_status === 'flagged' ? 'flagged' : 'warning'}
                    reason={importResult.listing.vero_reason ?? 'This brand may be registered with eBay\'s VeRO programme.'}
                    onBack={() => {
                        setShowVeroWarning(false)
                        setImportResult(null)
                        setImportPlatform(null)
                        setImportUrl('')
                    }}
                    onContinue={() => {
                        setShowVeroWarning(false)
                        setShowPreview(true)
                    }}
                />
            )}

            {/* ── Screen 2c: Failed import fallback ────────────────── */}
            {showFailed && (
                <UrlImportFailed
                    errorCode={failedErrorCode}
                    url={importUrl || undefined}
                    platform={importPlatform}
                    onTryAgain={() => {
                        setShowFailed(false)
                        setFailedErrorCode(undefined)
                        setImportUrl('')
                        setImportPlatform(null)
                        setShowUrlImport(true)
                    }}
                    onTitleMode={() => {
                        setShowFailed(false)
                        setFailedErrorCode(undefined)
                        setImportUrl('')
                        setImportPlatform(null)
                        onNewListingProp()
                    }}
                    onBarcodeMode={() => {
                        setShowFailed(false)
                        setFailedErrorCode(undefined)
                        setImportUrl('')
                        setImportPlatform(null)
                        setShowBarcodeImport(true)
                    }}
                    onCancel={() => {
                        setShowFailed(false)
                        setFailedErrorCode(undefined)
                        setImportUrl('')
                        setImportPlatform(null)
                    }}
                />
            )}

            {/* ── Screen 3: Preview overlay ─────────────────────────── */}
            {showPreview && importResult && (
                <UrlImportPreview
                    result={importResult}
                    onConfirm={(_listing: ImportedListingData) => {
                        setShowPreview(false)
                        // Open the saved draft in the wizard if we have its ID,
                        // otherwise fall back to a new blank listing
                        if (importResult.draft_id) {
                            onEditDraft(importResult.draft_id)
                        } else {
                            onNewListingProp()
                        }
                    }}
                    onBack={() => {
                        setShowPreview(false)
                        setShowProcessing(true)
                    }}
                    onCancel={() => {
                        setShowPreview(false)
                        setImportResult(null)
                        setImportPlatform(null)
                        setImportUrl('')
                    }}
                />
            )}

            {/* ── Image Import Screen 1: Upload modal ───────────────── */}
            {showImageImport && (
                <ImageImport
                    onClose={() => setShowImageImport(false)}
                    onImport={(data: ImageImportData) => {
                        setShowImageImport(false)
                        setImageImportData(data)
                        setShowImageProcessing(true)
                    }}
                    onSwitchToUrl={() => {
                        setShowImageImport(false)
                        setShowUrlImport(true)
                    }}
                    onSwitchToBarcode={() => {
                        setShowImageImport(false)
                        setShowBarcodeImport(true)
                    }}
                />
            )}

            {/* ── Image Import Screen 2: Processing overlay ─────────── */}
            {showImageProcessing && imageImportData && (
                <ImageImportProcessing
                    data={imageImportData}
                    onComplete={(result: ImageImportResult) => {
                        setShowImageProcessing(false)
                        // Always show preview first so user can review AI output
                        setImageProcessingResult(result)
                        setShowImagePreview(true)
                    }}
                    onFailed={(errorCode, _message) => {
                        setShowImageProcessing(false)
                        setImageFailedCode(errorCode)
                        setShowImageFailed(true)
                    }}
                    onCancel={() => {
                        setShowImageProcessing(false)
                        setImageImportData(null)
                        setShowImageImport(true)
                    }}
                />
            )}

            {/* ── Image Import Screen 3: Preview ────────────────────── */}
            {showImagePreview && imageProcessingResult?.listing && (
                <ImageImportPreview
                    result={imageProcessingResult}
                    photoCount={imageImportData?.images.length}
                    onConfirm={(result: ImageImportResult) => {
                        setShowImagePreview(false)
                        // Gate on VeRO — show warning screen before opening wizard
                        const veroStatus = result.listing?.vero_status
                        if (veroStatus === 'warning' || veroStatus === 'flagged') {
                            setImageVeroResult(result)
                            setShowImageVeroWarning(true)
                        } else {
                            if (result.draft_id) {
                                onEditDraft(result.draft_id)
                            } else {
                                onNewListingProp()
                            }
                            loadListings()
                            setImageProcessingResult(null)
                            setImageImportData(null)
                        }
                    }}
                    onBack={() => {
                        // Go back to upload screen
                        setShowImagePreview(false)
                        setImageProcessingResult(null)
                        setShowImageImport(true)
                    }}
                    onCancel={() => {
                        setShowImagePreview(false)
                        setImageProcessingResult(null)
                        setImageImportData(null)
                    }}
                />
            )}

            {/* ── Image Import Screen 3b: VeRO Warning ──────────────── */}
            {showImageVeroWarning && imageVeroResult?.listing && (
                <UrlImportVeroWarning
                    brand={imageVeroResult.listing.vero_brand ?? imageVeroResult.listing.brand ?? 'Unknown Brand'}
                    riskLevel={imageVeroResult.listing.vero_status === 'flagged' ? 'flagged' : 'warning'}
                    reason={imageVeroResult.listing.vero_reason ?? 'This brand may be registered with eBay\'s VeRO programme.'}
                    onBack={() => {
                        // Return to preview so user can change the listing
                        setShowImageVeroWarning(false)
                        if (imageProcessingResult) {
                            setShowImagePreview(true)
                        } else {
                            setImageVeroResult(null)
                            setImageImportData(null)
                        }
                    }}
                    onContinue={() => {
                        setShowImageVeroWarning(false)
                        if (imageVeroResult.draft_id) {
                            onEditDraft(imageVeroResult.draft_id)
                        } else {
                            onNewListingProp()
                        }
                        loadListings()
                        setImageVeroResult(null)
                        setImageProcessingResult(null)
                        setImageImportData(null)
                    }}
                />
            )}

            {/* ── Barcode Import Modal ───────────────────────────────── */}
            {showBarcodeImport && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(26,21,35,0.55)', backdropFilter: 'blur(4px)' }}
                    onClick={e => { if (e.target === e.currentTarget) { setShowBarcodeImport(false); loadListings() } }}
                >
                    <div
                        className="relative w-full rounded-2xl overflow-y-auto"
                        style={{
                            maxWidth: 680,
                            maxHeight: '92vh',
                            backgroundColor: '#f8f7ff',
                            boxShadow: '0 24px 80px rgba(117,48,251,0.22)',
                        }}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setShowBarcodeImport(false)}
                            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
                            style={{ backgroundColor: '#ede9fe' }}
                            title="Close"
                        >
                            <X size={15} style={{ color: '#7530fb' }} />
                        </button>
                        <BarcodeImport onBack={() => { setShowBarcodeImport(false); loadListings() }} />
                    </div>
                </div>
            )}

            {/* ── Title Import Modal ────────────────────────────────── */}
            {showTitleImport && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(26,21,35,0.55)', backdropFilter: 'blur(4px)' }}
                    onClick={e => { if (e.target === e.currentTarget) { setShowTitleImport(false); loadListings() } }}
                >
                    <div
                        className="relative w-full rounded-2xl overflow-y-auto"
                        style={{
                            maxWidth: 680,
                            maxHeight: '92vh',
                            backgroundColor: '#f8f7ff',
                            boxShadow: '0 24px 80px rgba(117,48,251,0.22)',
                        }}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setShowTitleImport(false)}
                            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
                            style={{ backgroundColor: '#ede9fe' }}
                            title="Close"
                        >
                            <X size={15} style={{ color: '#7530fb' }} />
                        </button>
                        <TitleImport onBack={() => { setShowTitleImport(false); loadListings() }} />
                    </div>
                </div>
            )}

            {/* ── Column Manager Panel ──────────────────────────────── */}
            <ColumnPanel
                open={showColumnPanel}
                onClose={() => setShowColumnPanel(false)}
                allColumns={allColumns}
                visibleIds={visibleIds}
                isDefault={columnIsDefault}
                onToggle={toggleColumn}
                onMove={moveColumn}
                onReset={resetColumns}
            />

            {/* ── Filter Panel ───────────────────────────────────────── */}
            <FilterPanel
                open={showFilterPanel}
                onClose={() => setShowFilterPanel(false)}
                activeFilters={columnFilters}
                onApply={upsertFilter}
                onClear={clearFilter}
                onClearAll={clearAllFilters}
            />

            {/* ── Image Import Screen 4: Failed ─────────────────────── */}
            {showImageFailed && (
                <ImageImportFailed
                    errorCode={imageFailedCode}
                    photoCount={imageImportData?.images.length}
                    onTryAgain={() => {
                        setShowImageFailed(false)
                        setImageFailedCode(undefined)
                        setShowImageImport(true)
                    }}
                    onTitleMode={() => {
                        setShowImageFailed(false)
                        setImageFailedCode(undefined)
                        setImageImportData(null)
                        window.dispatchEvent(new CustomEvent('lg:newListing', { detail: { mode: 'ai_title' } }))
                    }}
                    onBarcodeMode={() => {
                        setShowImageFailed(false)
                        setImageFailedCode(undefined)
                        setImageImportData(null)
                        setShowBarcodeImport(true)
                    }}
                    onCancel={() => {
                        setShowImageFailed(false)
                        setImageFailedCode(undefined)
                        setImageImportData(null)
                    }}
                />
            )}


        </div>
    )
}
