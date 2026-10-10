'use client'

// app/dashboard/listing-generator/components/ai-import/title-to-listing/TitleQueueRow.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Riazify — Single row in the Title-to-Listing queue
// States: pending | loading | found | vero_risk | not_found | error
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import {
    Loader2, CheckCircle2, XCircle, AlertTriangle, Clock,
    Eye, Trash2, ShieldAlert, Package,
} from 'lucide-react'
import { TitleQueueItem } from './TitleImport'

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
interface TitleQueueRowProps {
    item: TitleQueueItem
    onView: (item: TitleQueueItem) => void
    onRemove: (id: string) => void
    onToggleSelect: (id: string) => void
}

// ── Status config ─────────────────────────────────────────────────────────────
type StatusConfig = {
    icon: React.ReactNode
    badge: string
    badgeBg: string
    badgeFg: string
}

function getStatusConfig(item: TitleQueueItem): StatusConfig {
    switch (item.status) {
        case 'loading':
            return {
                icon: <Loader2 size={15} className="animate-spin" style={{ color: C.primary }} />,
                badge: 'Searching…',
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

// ── Condition colour map ───────────────────────────────────────────────────────
function conditionColor(condition: string): { bg: string; fg: string } {
    if (condition === 'New') return { bg: '#dbeafe', fg: '#1d4ed8' }
    if (condition === 'Used – Good') return { bg: C.successLight, fg: '#16a34a' }
    if (condition === 'Used – Acceptable') return { bg: C.warningLight, fg: '#b45309' }
    if (condition === 'For Parts') return { bg: C.errorLight, fg: C.error }
    return { bg: '#f3f4f6', fg: C.muted }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function TitleQueueRow({ item, onView, onRemove, onToggleSelect }: TitleQueueRowProps) {
    const { icon, badge, badgeBg, badgeFg } = getStatusConfig(item)
    const cc = conditionColor(item.condition)

    const isSelectable = item.status === 'found' || item.status === 'vero_risk'
    const isViewable = isSelectable || item.status === 'not_found' || item.status === 'error'
    const isActive = item.status === 'loading' || item.status === 'pending'

    // Smooth row entrance
    const rowRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const el = rowRef.current
        if (!el) return
        el.style.opacity = '0'
        el.style.transform = 'translateY(-6px)'
        const raf = requestAnimationFrame(() => {
            el.style.transition = 'opacity 220ms ease, transform 220ms ease'
            el.style.opacity = '1'
            el.style.transform = 'translateY(0)'
        })
        return () => cancelAnimationFrame(raf)
    }, [])

    // Product thumbnail (from result if available)
    const thumb = item.result?.product.images?.[0]

    return (
        <div
            ref={rowRef}
            className="flex items-center gap-3 px-3 py-2.5"
            style={{
                backgroundColor: item.selected ? C.primaryLight : 'transparent',
                borderLeft: item.selected ? `3px solid ${C.primary}` : '3px solid transparent',
                transition: 'background-color 150ms ease, border-color 150ms ease',
            }}
        >
            {/* Checkbox */}
            <button
                onClick={() => isSelectable && onToggleSelect(item.id)}
                disabled={!isSelectable}
                aria-label={item.selected ? 'Deselect' : 'Select'}
                className="flex-shrink-0 disabled:opacity-30"
            >
                {item.selected ? (
                    <div
                        className="w-4 h-4 rounded flex items-center justify-center"
                        style={{ backgroundColor: C.primary }}
                    >
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                ) : (
                    <div
                        className="w-4 h-4 rounded border-2"
                        style={{ borderColor: isSelectable ? C.border : '#d1d5db' }}
                    />
                )}
            </button>

            {/* Thumbnail or placeholder */}
            {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={thumb}
                    alt=""
                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                    style={{ border: `1px solid ${C.border}` }}
                />
            ) : (
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                >
                    <Package size={18} style={{ color: C.muted }} />
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 min-w-0">
                {/* Product title (from result) or search term */}
                <p
                    className="text-sm font-semibold truncate leading-snug"
                    style={{ color: C.text, fontFamily: 'DM Sans, sans-serif' }}
                >
                    {item.result?.product.title_ebay || item.searchTitle}
                </p>

                {/* Row 2: condition + status badge + original search if different */}
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {/* Condition chip */}
                    <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: cc.bg, color: cc.fg }}
                    >
                        {item.condition}
                    </span>

                    {/* Status badge */}
                    <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: badgeBg, color: badgeFg }}
                    >
                        {badge}
                    </span>

                    {/* Original search (when result title differs) */}
                    {item.result && item.result.product.title !== item.searchTitle && (
                        <span
                            className="text-[10px] truncate"
                            style={{ color: C.muted }}
                        >
                            via &ldquo;{item.searchTitle}&rdquo;
                        </span>
                    )}

                    {/* Price when found */}
                    {item.result?.product.price_suggested && (
                        <span
                            className="text-[10px] font-bold ml-auto flex-shrink-0"
                            style={{ color: C.primary, fontFamily: 'DM Mono, monospace' }}
                        >
                            £{item.result.product.price_suggested.toFixed(2)}
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
                {isViewable && (
                    <button
                        onClick={() => onView(item)}
                        title="View details"
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        style={{ color: isActive ? C.muted : C.primary }}
                    >
                        <Eye size={14} />
                    </button>
                )}
                <button
                    onClick={() => onRemove(item.id)}
                    title="Remove"
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    style={{ color: C.muted }}
                >
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    )
}
