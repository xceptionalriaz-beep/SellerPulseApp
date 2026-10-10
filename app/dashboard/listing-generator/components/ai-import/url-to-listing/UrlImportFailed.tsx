'use client'
// app/dashboard/listing-generator/components/ai-import/UrlImportFailed.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Failed Import Fallback Screen
// Shown when the URL import could not read the product page.
// Never dead-ends the user — always offers the next best option.
//
// Props:
//   errorCode    — machine code from the API (optional, for contextual copy)
//   url          — the URL that failed (shown truncated)
//   platform     — the platform we tried (optional)
//   onTryAgain   — "Try a different URL" → back to Screen 1
//   onTitleMode  — "Title to Listing" → manual title entry flow
//   onBarcodeMode— "Barcode to Listing" → EAN / barcode entry flow
//   onCancel     — X / close → back to dashboard
// ─────────────────────────────────────────────────────────────

import { X, Link2, Type, Barcode, RefreshCw, AlertCircle } from 'lucide-react'
import type { UrlImportErrorCode, PlatformDetection } from '@/app/dashboard/listing-generator/types/url-import.types'

// ── Design tokens ─────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
    dangerBorder: '#fecaca',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    accent: '#b8fa33',
    accentText: '#1e1535',
    success: '#16a34a',
    successBg: '#dcfce7',
}

// ── Props ─────────────────────────────────────────────────────
interface Props {
    errorCode?: UrlImportErrorCode | string
    url?: string
    platform?: PlatformDetection | null
    onTryAgain: () => void
    onTitleMode: () => void
    onBarcodeMode: () => void
    onCancel: () => void
}

// ── Copy by error code ─────────────────────────────────────────
function getErrorCopy(code?: string): { headline: string; bullets: string[] } {
    switch (code) {
        case 'login_required':
            return {
                headline: 'That page requires you to be logged in',
                bullets: [
                    'The site detected an automated request and asked for a login',
                    'Try copying the URL from a page that doesn\'t need an account',
                    'Or use "Title to Listing" and type the product name manually',
                ],
            }
        case 'platform_not_supported':
            return {
                headline: 'We don\'t support that site yet',
                bullets: [
                    'This platform isn\'t in our import list yet',
                    'We\'re adding new sources regularly — check back soon',
                    'Use "Title to Listing" to build the listing manually in seconds',
                ],
            }
        case 'rate_limited':
            return {
                headline: 'That site is temporarily blocking us',
                bullets: [
                    'The site rate-limited our request — this is temporary',
                    'Try again in a few minutes, or use a different URL from the same product',
                    'Or use "Title to Listing" to build the listing right now',
                ],
            }
        case 'invalid_url':
            return {
                headline: 'That doesn\'t look like a product page URL',
                bullets: [
                    'Make sure you\'re pasting the full URL from your browser bar',
                    'The URL should point to a single product, not a search results page',
                    'Try copying the URL directly from the product page',
                ],
            }
        default:
            return {
                headline: 'We couldn\'t read that page',
                bullets: [
                    'The page may require a login to view',
                    'The site may have blocked our request',
                    'The URL may not be pointing to a single product page',
                ],
            }
    }
}

// ── Alternative option card ────────────────────────────────────
function AltOption({
    icon: Icon,
    label,
    description,
    onClick,
    accent,
}: {
    icon: React.ElementType
    label: string
    description: string
    onClick: () => void
    accent?: boolean
}) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all hover:opacity-90 active:scale-[0.99]"
            style={{
                backgroundColor: accent ? C.primary : C.bg,
                border: `1px solid ${accent ? C.primary : C.border}`,
            }}
        >
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: accent ? 'rgba(255,255,255,0.15)' : C.primaryLight }}
            >
                <Icon size={18} style={{ color: accent ? '#ffffff' : C.primary }} />
            </div>
            <div className="flex-1 min-w-0">
                <p
                    className="text-[14px] font-bold leading-tight"
                    style={{ color: accent ? '#ffffff' : C.dark, fontFamily: 'Syne, sans-serif' }}
                >
                    {label}
                </p>
                <p
                    className="text-[12px] mt-0.5"
                    style={{ color: accent ? 'rgba(255,255,255,0.72)' : C.secondary, fontFamily: 'DM Sans, sans-serif' }}
                >
                    {description}
                </p>
            </div>
            <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: accent ? 'rgba(255,255,255,0.18)' : C.border }}
            >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M3 2l3 3-3 3" stroke={accent ? '#ffffff' : C.secondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </button>
    )
}

// ── Main Component ────────────────────────────────────────────
export default function UrlImportFailed({
    errorCode,
    url,
    platform,
    onTryAgain,
    onTitleMode,
    onBarcodeMode,
    onCancel,
}: Props) {
    const copy = getErrorCopy(errorCode)
    const displayUrl = url
        ? (url.length > 54 ? url.slice(0, 54) + '…' : url)
        : null

    return (
        <>
            <style>{`
        @keyframes failSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .fail-slide-in { animation: failSlideIn 0.3s cubic-bezier(0.4,0,0.2,1) forwards; }
      `}</style>

            {/* ── Backdrop ──────────────────────────────────────── */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center px-4"
                style={{ backgroundColor: 'rgba(30,21,53,0.72)', backdropFilter: 'blur(8px)' }}
            >
                {/* ── Panel ─────────────────────────────────────── */}
                <div
                    className="fail-slide-in relative w-full max-w-[520px] rounded-3xl overflow-hidden"
                    style={{
                        backgroundColor: C.surface,
                        boxShadow: '0 32px 80px rgba(117,48,251,0.18), 0 8px 24px rgba(0,0,0,0.12)',
                    }}
                >

                    {/* Red top stripe */}
                    <div className="h-1.5 w-full" style={{ backgroundColor: C.danger }} />

                    {/* ── Header ──────────────────────────────────── */}
                    <div className="flex items-start justify-between gap-4 px-7 pt-6 pb-5">
                        <div className="flex items-center gap-4">
                            {/* Icon */}
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: C.dangerBg }}
                            >
                                <AlertCircle size={24} style={{ color: C.danger }} />
                            </div>
                            <div>
                                <p
                                    className="text-[18px] font-bold leading-snug"
                                    style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}
                                >
                                    {copy.headline}
                                </p>
                                {platform && (
                                    <span
                                        className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                                        style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        {platform.displayName}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Close */}
                        <button
                            onClick={onCancel}
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors mt-0.5"
                            style={{ color: C.secondary }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                            aria-label="Close"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* ── Failed URL pill ──────────────────────────── */}
                    {displayUrl && (
                        <div className="px-7 pb-4">
                            <div
                                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                                style={{ backgroundColor: C.dangerBg, border: `1px solid ${C.dangerBorder}` }}
                            >
                                <Link2 size={13} style={{ color: C.danger, flexShrink: 0 }} />
                                <span
                                    className="text-[12px] truncate"
                                    style={{ color: C.danger, fontFamily: 'DM Mono, monospace' }}
                                >
                                    {displayUrl}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* ── Why it failed ────────────────────────────── */}
                    <div className="px-7 pb-5">
                        <p
                            className="text-[11px] font-bold uppercase tracking-widest mb-3"
                            style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}
                        >
                            This can happen when
                        </p>
                        <div className="flex flex-col gap-2.5">
                            {copy.bullets.map((text, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div
                                        className="w-1.5 h-1.5 rounded-full mt-[7px] shrink-0"
                                        style={{ backgroundColor: C.danger }}
                                    />
                                    <p
                                        className="text-[13px] leading-relaxed"
                                        style={{ color: C.secondary, fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        {text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Divider ──────────────────────────────────── */}
                    <div
                        className="mx-7 mb-5"
                        style={{ height: 1, backgroundColor: C.border }}
                    />

                    {/* ── Alternative options ──────────────────────── */}
                    <div className="px-7 pb-4">
                        <p
                            className="text-[11px] font-bold uppercase tracking-widest mb-3"
                            style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}
                        >
                            Try instead
                        </p>
                        <div className="flex flex-col gap-2.5">
                            <AltOption
                                icon={Type}
                                label="Title to Listing"
                                description="Type the product name — AI writes the eBay title & description"
                                onClick={onTitleMode}
                                accent
                            />
                            <AltOption
                                icon={Barcode}
                                label="Barcode to Listing"
                                description="Scan or type an EAN / UPC — we look up the product data"
                                onClick={onBarcodeMode}
                            />
                        </div>
                    </div>

                    {/* ── Footer ───────────────────────────────────── */}
                    <div
                        className="flex items-center justify-between px-7 py-4"
                        style={{ borderTop: `1px solid ${C.border}` }}
                    >
                        <p
                            className="text-[12px]"
                            style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}
                        >
                            or paste a different URL
                        </p>
                        <button
                            onClick={onTryAgain}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all hover:opacity-80"
                            style={{
                                backgroundColor: C.bg,
                                color: C.secondary,
                                border: `1px solid ${C.border}`,
                                fontFamily: 'DM Sans, sans-serif',
                            }}
                        >
                            <RefreshCw size={13} />
                            Try a different URL
                        </button>
                    </div>

                </div>
            </div>
        </>
    )
}
