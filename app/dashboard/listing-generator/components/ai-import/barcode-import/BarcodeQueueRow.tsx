'use client'

// app/dashboard/listing-generator/components/ai-import/barcode-import/BarcodeQueueRow.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Riazify — Single row in the barcode scan queue
// States: pending | loading | found | vero_risk | not_found | error
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import {
    Loader2, CheckCircle2, XCircle, AlertTriangle, Clock,
    Eye, Trash2, ShieldAlert,
} from 'lucide-react'
import {
    BarcodeQueueItem,
    barcodTypeLabel,
} from '../../../types/barcode-import.types'

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
interface BarcodeQueueRowProps {
    item: BarcodeQueueItem
    onView: (item: BarcodeQueueItem) => void    // open preview panel
    onRemove: (id: string) => void                // remove from queue
    onToggleSelect: (id: string) => void             // toggle bulk-select checkbox
}

// ── Status config ─────────────────────────────────────────────────────────────
type StatusConfig = {
    icon: React.ReactNode
    badge: string
    badgeBg: string
    badgeFg: string
}

function statusConfig(item: BarcodeQueueItem): StatusConfig {
    switch (item.status) {
        case 'loading':
            return {
                icon: <Loader2 size={15} className="animate-spin" style={{ color: C.primary }} />,
                badge: 'Looking up…',
                badgeBg: C.primaryLight,
                badgeFg: C.primary,
            }
        case 'found':
            return {
                icon: <CheckCircle2 size={15} style={{ color: C.success }} />,
                badge: 'Found',
                badgeBg: C.successLight,
                badgeFg: C.success,
            }
        case 'vero_risk':
            return {
                icon: <ShieldAlert size={15} style={{ color: C.warning }} />,
                badge: 'VeRO Risk',
                badgeBg: C.warningLight,
                badgeFg: C.warning,
            }
        case 'not_found':
            return {
                icon: <XCircle size={15} style={{ color: C.muted }} />,
                badge: 'Not found',
                badgeBg: '#f3f4f6',
                badgeFg: C.muted,
            }
        case 'error':
            return {
                icon: <AlertTriangle size={15} style={{ color: C.error }} />,
                badge: 'Error',
                badgeBg: C.errorLight,
                badgeFg: C.error,
            }
        default: // pending
            return {
                icon: <Clock size={15} style={{ color: C.muted }} />,
                badge: 'Queued',
                badgeBg: '#f3f4f6',
                badgeFg: C.muted,
            }
    }
}

// ── Cassini score pill ────────────────────────────────────────────────────────
function CassiniPill({ score }: { score: number }) {
    const color = score >= 80 ? C.success : score >= 60 ? C.warning : C.error
    const bg = score >= 80 ? C.successLight : score >= 60 ? C.warningLight : C.errorLight
    return (
        <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: bg, color, fontFamily: 'DM Mono, monospace' }}
            title="Cassini quality score"
        >
            {score}
        </span>
    )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BarcodeQueueRow({
    item,
    onView,
    onRemove,
    onToggleSelect,
}: BarcodeQueueRowProps) {
    const rowRef = useRef<HTMLDivElement>(null)
    const cfg = statusConfig(item)
    const product = item.result?.product

    // Highlight newly-added rows
    useEffect(() => {
        const el = rowRef.current
        if (!el) return
        el.animate(
            [{ backgroundColor: '#f3eeff' }, { backgroundColor: 'transparent' }],
            { duration: 800, easing: 'ease-out' }
        )
    }, [])

    const canSelect = item.status === 'found' || item.status === 'vero_risk'
    const canView = canSelect
    const isSelected = item.selected && canSelect

    return (
        <div
            ref={rowRef}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
            style={{
                border: `1px solid ${isSelected ? C.primary : C.border}`,
                backgroundColor: isSelected ? C.primaryLight : C.surface,
            }}
        >
            {/* Select checkbox */}
            <button
                disabled={!canSelect}
                onClick={() => canSelect && onToggleSelect(item.id)}
                className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center transition-colors"
                style={{
                    border: `1.5px solid ${isSelected ? C.primary : canSelect ? '#d1d5db' : '#e5e7eb'}`,
                    backgroundColor: isSelected ? C.primary : 'transparent',
                    cursor: canSelect ? 'pointer' : 'default',
                }}
                title={canSelect ? 'Select for bulk create' : undefined}
            >
                {isSelected && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.5 6L8 1" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </button>

            {/* Thumbnail or placeholder */}
            <div
                className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
            >
                {product?.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-contain"
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                ) : (
                    <span style={{ fontSize: 18 }}>📦</span>
                )}
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Product title or barcode */}
                    <p
                        className="text-xs font-semibold truncate"
                        style={{ color: C.text, fontFamily: 'DM Sans, sans-serif', maxWidth: 200 }}
                    >
                        {product?.title || item.barcode}
                    </p>

                    {/* Status badge */}
                    <span
                        className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeFg, fontFamily: 'DM Sans, sans-serif' }}
                    >
                        {cfg.icon}
                        {cfg.badge}
                    </span>

                    {/* VeRO sub-badge */}
                    {item.status === 'vero_risk' && product?.vero_brand && (
                        <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: C.warningLight, color: C.warning, fontFamily: 'DM Sans, sans-serif' }}
                        >
                            {product.vero_brand}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {/* Barcode + type */}
                    <span
                        className="text-[10px]"
                        style={{ color: C.muted, fontFamily: 'DM Mono, monospace' }}
                    >
                        {barcodTypeLabel(item.barcodeType)} · {item.barcode}
                    </span>

                    {/* Brand */}
                    {product?.brand && (
                        <span
                            className="text-[10px]"
                            style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}
                        >
                            {product.brand}
                        </span>
                    )}

                    {/* Price */}
                    {product?.price_suggested && (
                        <span
                            className="text-[10px] font-bold"
                            style={{ color: C.accentDark, fontFamily: 'DM Mono, monospace' }}
                        >
                            £{product.price_suggested.toFixed(2)}
                        </span>
                    )}

                    {/* Cassini score */}
                    {product?.cassini_score !== undefined && (
                        <CassiniPill score={product.cassini_score} />
                    )}

                    {/* Source */}
                    {item.result?.source && (
                        <span
                            className="text-[10px]"
                            style={{ color: '#9ca3af', fontFamily: 'DM Sans, sans-serif' }}
                        >
                            via {item.result.source.replace(/_/g, ' ')}
                        </span>
                    )}

                    {/* Error code */}
                    {item.errorCode && item.errorCode !== 'not_found' && (
                        <span
                            className="text-[10px]"
                            style={{ color: C.error, fontFamily: 'DM Sans, sans-serif' }}
                        >
                            {item.errorCode.replace(/_/g, ' ')}
                        </span>
                    )}
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
                {canView && (
                    <button
                        onClick={() => onView(item)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                        style={{ backgroundColor: C.primaryLight }}
                        title="Preview listing"
                    >
                        <Eye size={13} style={{ color: C.primary }} />
                    </button>
                )}
                <button
                    onClick={() => onRemove(item.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                    style={{ backgroundColor: '#fef2f2' }}
                    title="Remove from queue"
                >
                    <Trash2 size={13} style={{ color: C.error }} />
                </button>
            </div>
        </div>
    )
}
