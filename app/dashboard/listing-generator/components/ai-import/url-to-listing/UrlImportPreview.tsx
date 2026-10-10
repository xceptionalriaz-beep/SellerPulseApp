'use client'
// app/dashboard/listing-generator/components/ai-import/UrlImportPreview.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Listing Studio
// Screen 3 of the URL → Listing import flow.
// Full-screen 2-column preview:
//   Left  → product image gallery
//   Right → all extracted listing data, key fields editable
// User reviews, adjusts title/price, then hits "Create Listing"
// ─────────────────────────────────────────────────────────────

import { useState, type ReactNode } from 'react'
import {
    X, ChevronLeft, ChevronRight, ArrowLeft,
    CheckCircle2, AlertTriangle, ShieldCheck,
    Tag, DollarSign, Package, Zap, ExternalLink,
    Sparkles, ChevronDown, ChevronUp, Edit3,
} from 'lucide-react'
import {
    ImportedListingData,
    ImportedImage,
    UrlImportResult,
} from '@/app/dashboard/listing-generator/types/url-import.types'

// ── Design tokens — matches LgDashboard exactly ───────────────
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

// ── Platform color map ────────────────────────────────────────
const PLATFORM_COLORS: Record<string, string> = {
    amazon: '#FF9900',
    aliexpress: '#E62E04',
    argos: '#CC0000',
    wayfair: '#7B2FBE',
    bq: '#FF6600',
    ebay: '#E53238',
    banggood: '#E8321A',
    alibaba: '#FF6A00',
    temu: '#FF4D00',
    dhgate: '#C41E3A',
    walmart: '#0071CE',
    costco: '#005DAA',
}

// ── Cassini Score Ring ────────────────────────────────────────
function CassiniScore({ score }: { score: number }) {
    const color = score >= 80 ? C.success : score >= 60 ? C.warning : C.danger
    const bg = score >= 80 ? C.successBg : score >= 60 ? C.warningBg : C.dangerBg
    const label = score >= 80 ? 'Great' : score >= 60 ? 'OK' : 'Weak'

    return (
        <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl shrink-0"
            style={{ backgroundColor: bg }}
        >
            <span className="text-[20px] font-bold" style={{ color, fontFamily: 'Syne, sans-serif' }}>
                {score}
            </span>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color, fontFamily: 'DM Sans, sans-serif' }}>
                    Cassini
                </p>
                <p className="text-[10px]" style={{ color, fontFamily: 'DM Sans, sans-serif' }}>
                    {label}
                </p>
            </div>
        </div>
    )
}

// ── VeRO Badge ────────────────────────────────────────────────
function VeroBadge({ status, reason }: { status: string; reason: string | null }) {
    if (status === 'clear') return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: C.successBg }}>
            <ShieldCheck size={15} style={{ color: C.success }} />
            <span className="text-[13px] font-semibold" style={{ color: C.success, fontFamily: 'DM Sans, sans-serif' }}>
                VeRO Clear — safe to list
            </span>
        </div>
    )
    if (status === 'warning') return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: C.warningBg }}>
            <AlertTriangle size={15} style={{ color: C.warning }} />
            <span className="text-[13px] font-semibold" style={{ color: C.warning, fontFamily: 'DM Sans, sans-serif' }}>
                VeRO Warning — {reason ?? 'review before listing'}
            </span>
        </div>
    )
    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: C.dangerBg }}>
            <AlertTriangle size={15} style={{ color: C.danger }} />
            <span className="text-[13px] font-semibold" style={{ color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>
                VeRO Flagged — {reason ?? 'do not list'}
            </span>
        </div>
    )
}

// ── Image Gallery (left column) ───────────────────────────────
function ImageGallery({ images, title }: { images: ImportedImage[]; title: string }) {
    const [active, setActive] = useState(0)

    if (!images.length) {
        return (
            <div
                className="w-full aspect-square rounded-2xl flex flex-col items-center justify-center gap-3"
                style={{ backgroundColor: C.bg, border: `2px dashed ${C.border}` }}
            >
                <Package size={40} style={{ color: C.muted }} />
                <p className="text-[13px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                    Images will load when API is live
                </p>
            </div>
        )
    }

    const img = images[active]

    return (
        <div className="flex flex-col gap-3">
            {/* Main image */}
            <div
                className="relative w-full aspect-square rounded-2xl overflow-hidden"
                style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
            >
                {img?.supabase_url || img?.source_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={img.supabase_url ?? img.source_url}
                        alt={title}
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package size={48} style={{ color: C.muted }} />
                    </div>
                )}

                {/* Prev / Next */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => setActive(i => Math.max(0, i - 1))}
                            disabled={active === 0}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-20"
                            style={{ backgroundColor: C.surface, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                        >
                            <ChevronLeft size={16} style={{ color: C.body }} />
                        </button>
                        <button
                            onClick={() => setActive(i => Math.min(images.length - 1, i + 1))}
                            disabled={active === images.length - 1}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-20"
                            style={{ backgroundColor: C.surface, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                        >
                            <ChevronRight size={16} style={{ color: C.body }} />
                        </button>
                    </>
                )}

                {/* Image counter */}
                {images.length > 1 && (
                    <div
                        className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{ backgroundColor: 'rgba(30,21,53,0.6)', color: '#fff', fontFamily: 'DM Sans, sans-serif' }}
                    >
                        {active + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                    {images.slice(0, 6).map((img, i) => (
                        <button
                            key={img.id}
                            onClick={() => setActive(i)}
                            className="w-14 h-14 rounded-xl overflow-hidden shrink-0 transition-all"
                            style={{
                                border: active === i ? `2px solid ${C.primary}` : `2px solid ${C.border}`,
                                backgroundColor: C.bg,
                            }}
                        >
                            {img.supabase_url || img.source_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={img.supabase_url ?? img.source_url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Package size={20} style={{ color: C.muted }} />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// ── Section label ─────────────────────────────────────────────
function Label({ children }: { children: ReactNode }) {
    return (
        <p
            className="text-[11px] font-bold uppercase tracking-wider mb-1.5"
            style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}
        >
            {children}
        </p>
    )
}

// ── Divider ───────────────────────────────────────────────────
function Divider() {
    return <div className="h-px w-full my-4" style={{ backgroundColor: C.border }} />
}

// ── Props ─────────────────────────────────────────────────────
interface Props {
    result: UrlImportResult
    onConfirm: (listing: ImportedListingData) => void
    onBack: () => void
    onCancel: () => void
}

// ── Main Component ────────────────────────────────────────────
export default function UrlImportPreview({ result, onConfirm, onBack, onCancel }: Props) {
    const listing = result.listing!

    // Editable fields — user can tweak before creating
    const [title, setTitle] = useState(listing.title_ebay)
    const [price, setPrice] = useState<string>(
        listing.price_suggested != null ? String(listing.price_suggested) : ''
    )
    const [showDescription, setShowDescription] = useState(false)
    const [showSpecifics, setShowSpecifics] = useState(false)

    const platformColor = PLATFORM_COLORS[result.platform.logoKey] ?? C.primary

    // Recalculate margin live as price changes
    const supplierPrice = listing.price_supplier ?? 0
    const currentPrice = parseFloat(price) || 0
    const ebayFeeEst = currentPrice * 0.1275 + 0.3 // ~12.75% + £0.30 flat
    const marginLive = currentPrice - supplierPrice - ebayFeeEst
    const marginPct = currentPrice > 0 ? Math.round((marginLive / currentPrice) * 100) : 0

    const titleLen = title.length
    const titleOver = titleLen > 80
    const titleColor = titleOver ? C.danger : titleLen >= 65 ? C.success : C.warning

    function handleConfirm() {
        onConfirm({
            ...listing,
            title_ebay: title,
            price_suggested: currentPrice || listing.price_suggested,
            margin_gbp: parseFloat(marginLive.toFixed(2)),
            margin_pct: marginPct,
        })
    }

    return (
        <>
            <style>{`
        @keyframes lgPreviewIn {
          from { opacity: 0; transform: scale(0.97) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        .lg-preview-in { animation: lgPreviewIn 0.3s cubic-bezier(0.4,0,0.2,1) forwards; }
        .lg-scroll::-webkit-scrollbar { width: 4px; }
        .lg-scroll::-webkit-scrollbar-track { background: transparent; }
        .lg-scroll::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      `}</style>

            {/* ── Backdrop ──────────────────────────────────────── */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ backgroundColor: 'rgba(30,21,53,0.72)', backdropFilter: 'blur(8px)' }}
            >
                {/* ── Panel ─────────────────────────────────────── */}
                <div
                    className="lg-preview-in relative w-full flex flex-col rounded-3xl overflow-hidden"
                    style={{
                        maxWidth: '1020px',
                        maxHeight: '92vh',
                        backgroundColor: C.surface,
                        boxShadow: '0 32px 80px rgba(117,48,251,0.2), 0 8px 24px rgba(0,0,0,0.14)',
                    }}
                >

                    {/* ── Top bar ───────────────────────────────────── */}
                    <div
                        className="flex items-center justify-between px-7 py-4 shrink-0"
                        style={{ borderBottom: `1px solid ${C.border}` }}
                    >
                        <div className="flex items-center gap-3">
                            {/* Back */}
                            <button
                                onClick={onBack}
                                className="flex items-center gap-1.5 text-[13px] font-semibold transition-opacity hover:opacity-70"
                                style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}
                            >
                                <ArrowLeft size={15} />
                                Back
                            </button>

                            <div className="w-px h-5" style={{ backgroundColor: C.border }} />

                            {/* Platform badge */}
                            <span
                                className="px-2.5 py-1 rounded-lg text-[12px] font-bold"
                                style={{
                                    backgroundColor: platformColor + '18',
                                    color: platformColor,
                                    fontFamily: 'DM Sans, sans-serif',
                                }}
                            >
                                {result.platform.displayName}
                            </span>

                            <div>
                                <p
                                    className="text-[15px] font-bold"
                                    style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}
                                >
                                    Review your import
                                </p>
                                <p
                                    className="text-[12px]"
                                    style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}
                                >
                                    Check the details then create your listing
                                </p>
                            </div>
                        </div>

                        {/* Source link + close */}
                        <div className="flex items-center gap-3">
                            <a
                                href={listing.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-[12px] transition-opacity hover:opacity-70"
                                style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}
                            >
                                <ExternalLink size={13} />
                                Source
                            </a>

                            <button
                                onClick={onCancel}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
                                aria-label="Close"
                            >
                                <X size={16} style={{ color: C.secondary }} />
                            </button>
                        </div>
                    </div>

                    {/* ── 2-column body ─────────────────────────────── */}
                    <div className="flex flex-1 min-h-0">

                        {/* ── LEFT: Image gallery ──────────────────────── */}
                        <div
                            className="w-[340px] shrink-0 p-6 overflow-y-auto lg-scroll"
                            style={{ borderRight: `1px solid ${C.border}` }}
                        >
                            <ImageGallery images={listing.images} title={listing.title_raw} />

                            {/* Source title (for reference) */}
                            <div className="mt-4">
                                <Label>Original title</Label>
                                <p
                                    className="text-[12px] leading-relaxed"
                                    style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}
                                >
                                    {listing.title_raw}
                                </p>
                            </div>
                        </div>

                        {/* ── RIGHT: Listing data ──────────────────────── */}
                        <div className="flex-1 min-w-0 p-6 overflow-y-auto lg-scroll">

                            {/* VeRO status — shown first if not clear */}
                            {listing.vero_status !== 'clear' && (
                                <div className="mb-4">
                                    <VeroBadge status={listing.vero_status} reason={listing.vero_reason} />
                                </div>
                            )}

                            {/* ── eBay Title ──────────────────────────────── */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <Label>eBay title</Label>
                                    <div className="flex items-center gap-2">
                                        <CassiniScore score={listing.cassini_score} />
                                    </div>
                                </div>

                                <textarea
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    rows={2}
                                    maxLength={85}
                                    placeholder="eBay listing title…"
                                    className="w-full px-4 py-3 rounded-xl text-[14px] font-medium resize-none outline-none transition-all"
                                    style={{
                                        border: `1.5px solid ${titleOver ? C.danger : C.borderInput}`,
                                        color: C.body,
                                        backgroundColor: C.bg,
                                        fontFamily: 'DM Sans, sans-serif',
                                        lineHeight: '1.5',
                                    }}
                                    onFocus={e => (e.target.style.borderColor = titleOver ? C.danger : C.primary)}
                                    onBlur={e => (e.target.style.borderColor = titleOver ? C.danger : C.borderInput)}
                                />

                                {/* Character counter */}
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                        AI-optimised for Cassini SEO
                                    </p>
                                    <span
                                        className="text-[12px] font-semibold"
                                        style={{ color: titleColor, fontFamily: 'DM Mono, monospace' }}
                                    >
                                        {titleLen} / 80
                                    </span>
                                </div>
                            </div>

                            <Divider />

                            {/* ── Pricing ─────────────────────────────────── */}
                            <div>
                                <Label>Pricing & Margin</Label>
                                <div className="grid grid-cols-3 gap-3">

                                    {/* Supplier cost */}
                                    <div
                                        className="p-3 rounded-xl"
                                        style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                                    >
                                        <p className="text-[11px] font-semibold mb-1" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                            Supplier cost
                                        </p>
                                        <p className="text-[18px] font-bold" style={{ color: C.body, fontFamily: 'Syne, sans-serif' }}>
                                            {listing.price_supplier != null
                                                ? `£${listing.price_supplier.toFixed(2)}`
                                                : '—'}
                                        </p>
                                    </div>

                                    {/* Your eBay price — editable */}
                                    <div
                                        className="p-3 rounded-xl"
                                        style={{ border: `1.5px solid ${C.primary}`, backgroundColor: C.primaryLight }}
                                    >
                                        <p className="text-[11px] font-semibold mb-1" style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                            Your eBay price
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[16px] font-bold" style={{ color: C.primary, fontFamily: 'Syne, sans-serif' }}>£</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={price}
                                                onChange={e => setPrice(e.target.value)}
                                                className="w-full bg-transparent text-[18px] font-bold outline-none"
                                                style={{ color: C.primary, fontFamily: 'Syne, sans-serif' }}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <p className="text-[10px] mt-0.5" style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif', opacity: 0.7 }}>
                                            Tap to edit
                                        </p>
                                    </div>

                                    {/* Margin */}
                                    <div
                                        className="p-3 rounded-xl"
                                        style={{
                                            backgroundColor: marginLive > 0 ? C.successBg : C.dangerBg,
                                            border: `1px solid ${marginLive > 0 ? '#bbf7d0' : '#fecaca'}`,
                                        }}
                                    >
                                        <p className="text-[11px] font-semibold mb-1" style={{ color: marginLive > 0 ? C.success : C.danger, fontFamily: 'DM Sans, sans-serif' }}>
                                            Est. profit
                                        </p>
                                        <p className="text-[18px] font-bold" style={{ color: marginLive > 0 ? C.success : C.danger, fontFamily: 'Syne, sans-serif' }}>
                                            {marginLive > 0 ? `+£${marginLive.toFixed(2)}` : `−£${Math.abs(marginLive).toFixed(2)}`}
                                        </p>
                                        <p className="text-[10px]" style={{ color: marginLive > 0 ? C.success : C.danger, fontFamily: 'DM Sans, sans-serif', opacity: 0.8 }}>
                                            {marginPct}% after eBay fees
                                        </p>
                                    </div>

                                </div>

                                <p className="text-[11px] mt-2" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                    eBay fee estimate: ~12.75% + £0.30 final value fee
                                </p>
                            </div>

                            <Divider />

                            {/* ── Product details ──────────────────────────── */}
                            <div>
                                <Label>Product details</Label>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-3">

                                    {[
                                        { label: 'Condition', value: listing.condition },
                                        { label: 'Category', value: listing.category_label },
                                        { label: 'Brand', value: listing.brand ?? 'Not specified' },
                                        { label: 'EAN / Barcode', value: listing.ean ?? 'Not found' },
                                        { label: 'Seller type', value: listing.seller_type?.replace('_', ' ') },
                                        { label: 'Source', value: result.platform.displayName },
                                    ].map(({ label, value }) => (
                                        <div key={label}>
                                            <p className="text-[11px] font-semibold" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                                {label}
                                            </p>
                                            <p className="text-[13px] font-medium mt-0.5" style={{ color: value ? C.body : C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                                {value || '—'}
                                            </p>
                                        </div>
                                    ))}

                                </div>
                            </div>

                            {/* ── VeRO clear (inline) ──────────────────────── */}
                            {listing.vero_status === 'clear' && (
                                <>
                                    <Divider />
                                    <VeroBadge status={listing.vero_status} reason={null} />
                                </>
                            )}

                            <Divider />

                            {/* ── Description (collapsible) ────────────────── */}
                            <div>
                                <button
                                    onClick={() => setShowDescription(v => !v)}
                                    className="flex items-center justify-between w-full"
                                >
                                    <Label>eBay description</Label>
                                    {showDescription
                                        ? <ChevronUp size={15} style={{ color: C.muted }} />
                                        : <ChevronDown size={15} style={{ color: C.muted }} />}
                                </button>

                                {showDescription && (
                                    <div
                                        className="mt-2 p-4 rounded-xl text-[13px] leading-relaxed overflow-auto max-h-40 lg-scroll"
                                        style={{
                                            backgroundColor: C.bg,
                                            border: `1px solid ${C.border}`,
                                            color: C.body,
                                            fontFamily: 'DM Sans, sans-serif',
                                        }}
                                        dangerouslySetInnerHTML={{ __html: listing.description_html }}
                                    />
                                )}
                            </div>

                            {/* ── Item specifics (collapsible) ─────────────── */}
                            {Object.keys(listing.item_specifics ?? {}).length > 0 && (
                                <>
                                    <Divider />
                                    <div>
                                        <button
                                            onClick={() => setShowSpecifics(v => !v)}
                                            className="flex items-center justify-between w-full"
                                        >
                                            <Label>
                                                Item specifics ({Object.keys(listing.item_specifics).length})
                                            </Label>
                                            {showSpecifics
                                                ? <ChevronUp size={15} style={{ color: C.muted }} />
                                                : <ChevronDown size={15} style={{ color: C.muted }} />}
                                        </button>

                                        {showSpecifics && (
                                            <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2">
                                                {Object.entries(listing.item_specifics).map(([k, v]) => (
                                                    <div key={k}>
                                                        <p className="text-[11px] font-semibold" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                                            {k}
                                                        </p>
                                                        <p className="text-[13px]" style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                                                            {v}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                        </div>
                    </div>

                    {/* ── Bottom action bar ─────────────────────────── */}
                    <div
                        className="flex items-center justify-between gap-4 px-7 py-4 shrink-0"
                        style={{ borderTop: `1px solid ${C.border}`, backgroundColor: C.surface }}
                    >
                        {/* Left side info */}
                        <div className="flex items-center gap-3">
                            <div
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                                style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                            >
                                <Zap size={13} style={{ color: C.primary }} />
                                <span className="text-[12px] font-semibold" style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                    AI-ready
                                </span>
                            </div>

                            <p className="text-[12px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                Will pre-fill all 4 wizard steps
                            </p>
                        </div>

                        {/* Right side actions */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onCancel}
                                className="px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-opacity hover:opacity-70"
                                style={{
                                    backgroundColor: C.bg,
                                    color: C.secondary,
                                    border: `1px solid ${C.border}`,
                                    fontFamily: 'DM Sans, sans-serif',
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleConfirm}
                                disabled={titleOver || !title.trim()}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-bold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: C.accent,
                                    color: C.accentText,
                                    fontFamily: 'Syne, sans-serif',
                                    boxShadow: '0 4px 14px rgba(184,250,51,0.4)',
                                }}
                            >
                                <Sparkles size={16} />
                                Create Listing
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}
