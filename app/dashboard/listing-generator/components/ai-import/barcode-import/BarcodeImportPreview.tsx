'use client'

// app/dashboard/listing-generator/components/ai-import/barcode-import/BarcodeImportPreview.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Riazify — Barcode item preview slide-over panel
// Shows full product details, Cassini score, VeRO status, price intel
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import {
    X, ChevronLeft, ChevronRight, ShieldCheck, ShieldAlert, ShieldX,
    ExternalLink, BarChart2, Tag, BookOpen, Package,
} from 'lucide-react'
import { BarcodeQueueItem, barcodTypeLabel } from '../../../types/barcode-import.types'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    accent: '#b8fa33',
    accentDark: '#8abf1f',
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    text: '#1a1523',
    muted: '#6b7280',
    error: '#ef4444',
    errorLight: '#fef2f2',
    warning: '#f59e0b',
    warningLight: '#fffbeb',
    success: '#22c55e',
    successLight: '#f0fdf4',
} as const

// ── Props ─────────────────────────────────────────────────────────────────────
interface BarcodeImportPreviewProps {
    item: BarcodeQueueItem
    onClose: () => void
    onRemove: (id: string) => void
}

// ── VeRO config ───────────────────────────────────────────────────────────────
function VeROBadge({ status, reason, brand }: { status: string; reason: string | null; brand: string | null }) {
    if (status === 'flagged') {
        return (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ backgroundColor: C.errorLight, border: `1px solid ${C.error}` }}>
                <ShieldX size={14} style={{ color: C.error, flexShrink: 0, marginTop: 2 }} />
                <div>
                    <p className="text-xs font-bold" style={{ color: C.error, fontFamily: 'Syne, sans-serif' }}>
                        VeRO Flagged — {brand || 'Brand'}
                    </p>
                    {reason && <p className="text-[11px] mt-0.5" style={{ color: C.error }}>{reason}</p>}
                </div>
            </div>
        )
    }
    if (status === 'warning') {
        return (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ backgroundColor: C.warningLight, border: `1px solid ${C.warning}` }}>
                <ShieldAlert size={14} style={{ color: C.warning, flexShrink: 0, marginTop: 2 }} />
                <div>
                    <p className="text-xs font-bold" style={{ color: C.warning, fontFamily: 'Syne, sans-serif' }}>
                        VeRO Warning — {brand || 'Brand'}
                    </p>
                    {reason && <p className="text-[11px] mt-0.5" style={{ color: C.warning }}>{reason}</p>}
                </div>
            </div>
        )
    }
    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: C.successLight, border: `1px solid ${C.success}` }}>
            <ShieldCheck size={14} style={{ color: C.success }} />
            <p className="text-xs font-semibold" style={{ color: C.success }}>VeRO Clear — safe to list</p>
        </div>
    )
}

// ── Cassini score meter ───────────────────────────────────────────────────────
function CassiniMeter({ score }: { score: number }) {
    const color = score >= 80 ? C.success : score >= 60 ? C.warning : C.error
    const label = score >= 80 ? 'Great' : score >= 60 ? 'OK' : 'Weak'
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                    Cassini Quality
                </span>
                <span className="text-[11px] font-bold" style={{ color, fontFamily: 'DM Mono, monospace' }}>
                    {score}/100 — {label}
                </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.border }}>
                <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${score}%`, backgroundColor: color }}
                />
            </div>
        </div>
    )
}

// ── Price row ─────────────────────────────────────────────────────────────────
function PriceRow({ label, value }: { label: string; value?: number }) {
    if (value === undefined) return null
    return (
        <div className="flex items-center justify-between py-1">
            <span className="text-[11px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>{label}</span>
            <span className="text-[12px] font-bold" style={{ color: C.accentDark, fontFamily: 'DM Mono, monospace' }}>
                £{value.toFixed(2)}
            </span>
        </div>
    )
}

// ── Image gallery (mini) ──────────────────────────────────────────────────────
function ImageStrip({ images }: { images: string[] }) {
    const [idx, setIdx] = useState(0)
    if (!images.length) return null

    return (
        <div className="space-y-2">
            {/* Main image */}
            <div
                className="w-full h-40 rounded-xl overflow-hidden flex items-center justify-center relative"
                style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={images[idx]}
                    alt="Product"
                    className="max-h-full max-w-full object-contain"
                    onError={e => { (e.currentTarget as HTMLImageElement).src = '' }}
                />
                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => setIdx(i => Math.max(0, i - 1))}
                            disabled={idx === 0}
                            className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center disabled:opacity-30"
                            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                        >
                            <ChevronLeft size={13} color="#fff" />
                        </button>
                        <button
                            onClick={() => setIdx(i => Math.min(images.length - 1, i + 1))}
                            disabled={idx === images.length - 1}
                            className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center disabled:opacity-30"
                            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                        >
                            <ChevronRight size={13} color="#fff" />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {images.slice(0, 8).map((src, i) => (
                        <button
                            key={i}
                            onClick={() => setIdx(i)}
                            className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden"
                            style={{
                                border: `2px solid ${i === idx ? C.primary : C.border}`,
                                backgroundColor: C.bg,
                            }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt={`img ${i + 1}`} className="w-full h-full object-contain" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BarcodeImportPreview({ item, onClose, onRemove }: BarcodeImportPreviewProps) {
    const panelRef = useRef<HTMLDivElement>(null)
    const product = item.result?.product
    const isVeRO = item.status === 'vero_risk'

    // Trap focus + close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    // Slide-in animation
    useEffect(() => {
        panelRef.current?.animate(
            [{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }],
            { duration: 250, easing: 'ease-out', fill: 'both' }
        )
    }, [])

    if (!product) return null

    const hasBookData = item.barcodeType === 'ISBN13' || item.barcodeType === 'ISBN10'

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                style={{ backgroundColor: 'rgba(26,21,35,0.4)' }}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                ref={panelRef}
                className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col overflow-hidden"
                style={{ backgroundColor: C.surface, boxShadow: '-4px 0 40px rgba(117,48,251,0.12)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Panel header ─────────────────────────────────────────── */}
                <div
                    className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
                    style={{ borderColor: C.border }}
                >
                    <div>
                        <p className="text-xs font-semibold" style={{ color: C.muted }}>
                            {barcodTypeLabel(item.barcodeType)} · {item.barcode}
                        </p>
                        <p className="text-[10px]" style={{ color: '#9ca3af' }}>
                            via {item.result?.source?.replace(/_/g, ' ')}
                            {item.result?.draft_id && ' · draft saved'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: C.bg }}
                    >
                        <X size={15} style={{ color: C.text }} />
                    </button>
                </div>

                {/* ── Scrollable body ─────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

                    {/* VeRO status */}
                    <VeROBadge
                        status={product.vero_status}
                        reason={product.vero_reason}
                        brand={product.vero_brand}
                    />

                    {/* Images */}
                    <ImageStrip images={product.images} />

                    {/* Title */}
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: C.muted }}>
                            eBay Title
                        </p>
                        <p className="text-sm font-bold leading-snug" style={{ color: C.text, fontFamily: 'Syne, sans-serif' }}>
                            {product.title_ebay || product.title}
                        </p>
                        {product.title_ebay && product.title !== product.title_ebay && (
                            <p className="text-[11px] mt-1" style={{ color: C.muted }}>
                                Original: {product.title}
                            </p>
                        )}
                    </div>

                    {/* Brand + condition */}
                    <div className="flex gap-3 flex-wrap">
                        {product.brand && (
                            <div className="flex items-center gap-1">
                                <Tag size={11} style={{ color: C.muted }} />
                                <span className="text-xs" style={{ color: C.text }}>{product.brand}</span>
                            </div>
                        )}
                        <div
                            className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ backgroundColor: C.primaryLight, color: C.primary }}
                        >
                            {product.condition}
                        </div>
                        {product.category_label && (
                            <span className="text-xs" style={{ color: C.muted }}>{product.category_label}</span>
                        )}
                    </div>

                    {/* Book metadata */}
                    {hasBookData && (product.author || product.publisher) && (
                        <div
                            className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                            style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                        >
                            <BookOpen size={13} style={{ color: C.primary, flexShrink: 0, marginTop: 1 }} />
                            <div className="text-[11px] space-y-0.5" style={{ color: C.text }}>
                                {product.author && <p><strong>Author:</strong> {product.author}</p>}
                                {product.publisher && <p><strong>Publisher:</strong> {product.publisher}</p>}
                                {product.page_count && <p><strong>Pages:</strong> {product.page_count}</p>}
                            </div>
                        </div>
                    )}

                    {/* Cassini score */}
                    <CassiniMeter score={product.cassini_score} />

                    {/* Price intel */}
                    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                        <div
                            className="flex items-center gap-2 px-3 py-2 border-b"
                            style={{ borderColor: C.border, backgroundColor: C.bg }}
                        >
                            <BarChart2 size={13} style={{ color: C.primary }} />
                            <span className="text-[11px] font-bold" style={{ color: C.text, fontFamily: 'Syne, sans-serif' }}>
                                Price Intelligence
                            </span>
                        </div>
                        <div className="px-3 divide-y divide-[#ede9fe]">
                            <PriceRow label="Suggested list price" value={product.price_suggested} />
                            <PriceRow label="Avg eBay sold price" value={product.price_avg_sold} />
                            <PriceRow label="Sold price range low" value={product.price_range_low} />
                            <PriceRow label="Sold price range high" value={product.price_range_high} />
                            {product.sold_last_30_days !== undefined && (
                                <div className="flex items-center justify-between py-1">
                                    <span className="text-[11px]" style={{ color: C.muted }}>Sold last 30 days</span>
                                    <span className="text-[12px] font-bold" style={{ color: C.text, fontFamily: 'DM Mono, monospace' }}>
                                        {product.sold_last_30_days}
                                    </span>
                                </div>
                            )}
                            {product.active_listings_count !== undefined && (
                                <div className="flex items-center justify-between py-1">
                                    <span className="text-[11px]" style={{ color: C.muted }}>Active listings (competition)</span>
                                    <span className="text-[12px] font-bold" style={{ color: C.text, fontFamily: 'DM Mono, monospace' }}>
                                        {product.active_listings_count}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Item specifics */}
                    {Object.keys(product.item_specifics).length > 0 && (
                        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                            <div
                                className="flex items-center gap-2 px-3 py-2 border-b"
                                style={{ borderColor: C.border, backgroundColor: C.bg }}
                            >
                                <Package size={13} style={{ color: C.primary }} />
                                <span className="text-[11px] font-bold" style={{ color: C.text, fontFamily: 'Syne, sans-serif' }}>
                                    Item Specifics
                                </span>
                            </div>
                            <div className="px-3 divide-y divide-[#ede9fe]">
                                {Object.entries(product.item_specifics).map(([k, v]) => (
                                    <div key={k} className="flex items-start justify-between gap-3 py-1.5">
                                        <span className="text-[11px]" style={{ color: C.muted, flexShrink: 0 }}>{k}</span>
                                        <span className="text-[11px] font-medium text-right" style={{ color: C.text }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description preview */}
                    {product.description_html && (
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: C.muted }}>
                                eBay Description Preview
                            </p>
                            <div
                                className="text-xs p-3 rounded-xl leading-relaxed"
                                style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text, fontFamily: 'DM Sans, sans-serif' }}
                                dangerouslySetInnerHTML={{ __html: product.description_html }}
                            />
                        </div>
                    )}

                    {/* EAN/ISBN identifiers */}
                    <div className="flex gap-2 flex-wrap">
                        {product.ean && (
                            <span className="text-[10px] px-2 py-1 rounded-lg" style={{ backgroundColor: C.bg, color: C.muted, fontFamily: 'DM Mono, monospace' }}>
                                EAN: {product.ean}
                            </span>
                        )}
                        {product.isbn && (
                            <span className="text-[10px] px-2 py-1 rounded-lg" style={{ backgroundColor: C.bg, color: C.muted, fontFamily: 'DM Mono, monospace' }}>
                                ISBN: {product.isbn}
                            </span>
                        )}
                    </div>

                    {/* VeRO warning CTA */}
                    {isVeRO && (
                        <a
                            href="https://www.ebay.co.uk/vero"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-semibold underline"
                            style={{ color: C.warning }}
                        >
                            <ExternalLink size={11} />
                            Review eBay VeRO programme
                        </a>
                    )}
                </div>

                {/* ── Footer actions ────────────────────────────────────────── */}
                <div
                    className="flex gap-2 px-4 py-3 border-t flex-shrink-0"
                    style={{ borderColor: C.border }}
                >
                    <button
                        onClick={() => { onRemove(item.id) }}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                        style={{ backgroundColor: C.errorLight, color: C.error, fontFamily: 'DM Sans, sans-serif' }}
                    >
                        Remove
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-80"
                        style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'DM Sans, sans-serif' }}
                    >
                        {item.result?.draft_id ? 'Draft saved ✓' : 'Back to queue'}
                    </button>
                </div>
            </div>
        </>
    )
}
