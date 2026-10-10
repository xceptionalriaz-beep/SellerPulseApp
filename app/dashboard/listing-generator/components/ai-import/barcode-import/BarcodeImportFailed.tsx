'use client'

// app/dashboard/listing-generator/components/ai-import/barcode-import/BarcodeImportFailed.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Riazify — Not-found / error panel for a barcode queue item
// Gives the seller actionable next steps when a product can't be identified
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import {
    X, RefreshCcw, Trash2, Search, ImagePlus, Link2,
    AlertCircle, HelpCircle, WifiOff, Clock, Settings2,
} from 'lucide-react'
import { BarcodeQueueItem, BarcodeImportErrorCode, barcodTypeLabel } from '../../../types/barcode-import.types'

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
interface BarcodeImportFailedProps {
    item: BarcodeQueueItem
    onClose: () => void
    onRemove: (id: string) => void
    onRetry: (id: string) => Promise<void>
}

// ── Error config ──────────────────────────────────────────────────────────────
type ErrorInfo = {
    icon: React.ReactNode
    heading: string
    body: string
    canRetry: boolean
}

function errorInfo(code: BarcodeImportErrorCode | undefined): ErrorInfo {
    switch (code) {
        case 'not_found':
            return {
                icon: <Search size={22} style={{ color: C.muted }} />,
                heading: 'Product not found',
                body: 'This barcode isn\'t in any of our lookup databases — it may be a regional product, private label, or very new item. You can still create a listing manually.',
                canRetry: false,
            }
        case 'invalid_barcode':
            return {
                icon: <AlertCircle size={22} style={{ color: C.warning }} />,
                heading: 'Invalid barcode',
                body: 'The barcode failed its check-digit validation. It may have been misread or mis-typed. Try scanning again or check the packaging.',
                canRetry: true,
            }
        case 'rate_limited':
            return {
                icon: <Clock size={22} style={{ color: C.warning }} />,
                heading: 'Lookup quota reached',
                body: 'The free barcode database has hit today\'s lookup limit. Retrying will use AI simulation to estimate the product details instead.',
                canRetry: true,
            }
        case 'network_error':
            return {
                icon: <WifiOff size={22} style={{ color: C.error }} />,
                heading: 'Network error',
                body: 'The lookup request couldn\'t reach the server. Check your connection and try again.',
                canRetry: true,
            }
        case 'config_error':
            return {
                icon: <Settings2 size={22} style={{ color: C.error }} />,
                heading: 'AI key not configured',
                body: 'The AI provider key is missing from the vault. Ask your account admin to add the Gemini or Anthropic key in Settings → API Keys.',
                canRetry: false,
            }
        default:
            return {
                icon: <HelpCircle size={22} style={{ color: C.muted }} />,
                heading: 'Lookup failed',
                body: 'Something went wrong with the product lookup. Try again or create the listing manually.',
                canRetry: true,
            }
    }
}

// ── Alternative action cards ──────────────────────────────────────────────────
interface AltAction {
    icon: React.ReactNode
    title: string
    desc: string
    href?: string
    cta: string
}

function altActions(): AltAction[] {
    return [
        {
            icon: <ImagePlus size={15} style={{ color: C.primary }} />,
            title: 'Use Image Import',
            desc: 'Take a photo of the product — AI identifies it from the image.',
            cta: 'Switch to Image Import',
        },
        {
            icon: <Link2 size={15} style={{ color: C.primary }} />,
            title: 'Import from URL',
            desc: 'Find the product on any website and paste the URL.',
            cta: 'Switch to URL Import',
        },
        {
            icon: <Search size={15} style={{ color: C.primary }} />,
            title: 'Search manually',
            desc: 'Look up the product on eBay, Amazon or Google and start from there.',
            href: 'https://www.ebay.co.uk/sch/',
            cta: 'Open eBay search',
        },
    ]
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BarcodeImportFailed({ item, onClose, onRemove, onRetry }: BarcodeImportFailedProps) {
    const panelRef = useRef<HTMLDivElement>(null)
    const info = errorInfo(item.errorCode)

    // Close on Escape
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

    const handleRetry = async () => {
        await onRetry(item.id)
    }

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
                {/* ── Header ────────────────────────────────────────────────── */}
                <div
                    className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
                    style={{ borderColor: C.border }}
                >
                    <div>
                        <p className="text-xs font-semibold" style={{ color: C.muted }}>
                            {barcodTypeLabel(item.barcodeType)} · {item.barcode}
                        </p>
                        <p className="text-[10px]" style={{ color: '#9ca3af' }}>
                            Lookup failed
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

                {/* ── Body ──────────────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">

                    {/* Error card */}
                    <div
                        className="rounded-2xl px-4 py-5 flex flex-col items-center text-center gap-3"
                        style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
                    >
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
                        >
                            {info.icon}
                        </div>
                        <div>
                            <p
                                className="text-sm font-bold"
                                style={{ color: C.text, fontFamily: 'Syne, sans-serif' }}
                            >
                                {info.heading}
                            </p>
                            <p
                                className="text-xs mt-1.5 leading-relaxed"
                                style={{ color: C.muted, maxWidth: 300, fontFamily: 'DM Sans, sans-serif' }}
                            >
                                {info.body}
                            </p>
                        </div>

                        {/* Barcode pill */}
                        <span
                            className="text-[11px] px-3 py-1 rounded-full"
                            style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, color: C.muted, fontFamily: 'DM Mono, monospace' }}
                        >
                            {item.barcode}
                        </span>
                    </div>

                    {/* What to do instead */}
                    <div>
                        <p
                            className="text-xs font-bold mb-3"
                            style={{ color: C.text, fontFamily: 'Syne, sans-serif' }}
                        >
                            What to do instead
                        </p>
                        <div className="space-y-2">
                            {altActions().map(alt => (
                                <div
                                    key={alt.title}
                                    className="flex items-start gap-3 px-3 py-3 rounded-xl"
                                    style={{ border: `1px solid ${C.border}`, backgroundColor: C.surface }}
                                >
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: C.primaryLight }}
                                    >
                                        {alt.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold" style={{ color: C.text, fontFamily: 'DM Sans, sans-serif' }}>
                                            {alt.title}
                                        </p>
                                        <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: C.muted }}>
                                            {alt.desc}
                                        </p>
                                        {alt.href && (
                                            <a
                                                href={alt.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block mt-1.5 text-[11px] font-semibold underline"
                                                style={{ color: C.primary }}
                                            >
                                                {alt.cta} →
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tip */}
                    <div
                        className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                        style={{ backgroundColor: C.primaryLight, border: `1px solid ${C.border}` }}
                    >
                        <HelpCircle size={12} style={{ color: C.primary, flexShrink: 0, marginTop: 2 }} />
                        <p className="text-[11px] leading-relaxed" style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                            <strong>Tip:</strong> For products that consistently fail lookup, try switching to the Image Import tool — it uses AI vision to identify items from a photo.
                        </p>
                    </div>
                </div>

                {/* ── Footer ────────────────────────────────────────────────── */}
                <div
                    className="flex gap-2 px-4 py-3 border-t flex-shrink-0"
                    style={{ borderColor: C.border }}
                >
                    <button
                        onClick={() => onRemove(item.id)}
                        className="flex items-center justify-center gap-1.5 w-10 h-10 rounded-xl transition-opacity hover:opacity-80 flex-shrink-0"
                        style={{ backgroundColor: C.errorLight }}
                        title="Remove from queue"
                    >
                        <Trash2 size={14} style={{ color: C.error }} />
                    </button>

                    {info.canRetry && (
                        <button
                            onClick={handleRetry}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                            style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}
                        >
                            <RefreshCcw size={14} />
                            Retry lookup
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-80"
                        style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'DM Sans, sans-serif' }}
                    >
                        Back to queue
                    </button>
                </div>
            </div>
        </>
    )
}
