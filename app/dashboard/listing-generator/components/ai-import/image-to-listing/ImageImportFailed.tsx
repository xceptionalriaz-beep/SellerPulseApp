'use client'
// app/dashboard/listing-generator/components/ai-import/image-to-listing/ImageImportFailed.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Image Import Failed Screen
// Shown when AI couldn't analyse the uploaded photos.
// Never dead-ends the user — always offers the next best option.
//
// Props:
//   errorCode     — machine code from the API (optional)
//   photoCount    — how many photos were tried (optional)
//   onTryAgain    — "Try different photos" → back to upload screen
//   onTitleMode   — "Title to Listing" → manual title entry flow
//   onBarcodeMode — "Barcode to Listing" → EAN / barcode entry flow
//   onCancel      — X / close → back to dashboard
// ─────────────────────────────────────────────────────────────

import type { ElementType } from 'react'
import { X, Camera, Type, Barcode, RefreshCw, AlertCircle } from 'lucide-react'

// ── Design tokens ──────────────────────────────────────────────
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
}

// ── Props ──────────────────────────────────────────────────────
interface Props {
    errorCode?: string
    photoCount?: number
    onTryAgain: () => void
    onTitleMode: () => void
    onBarcodeMode: () => void
    onCancel: () => void
}

// ── Copy by error code ─────────────────────────────────────────
function getErrorCopy(code?: string): { headline: string; bullets: string[] } {
    switch (code) {
        case 'no_images':
            return {
                headline: 'No photos were uploaded',
                bullets: [
                    'At least one photo is required to analyse the product',
                    'Try uploading clear, well-lit photos of the item',
                    'Or use "Title to Listing" to write the listing manually',
                ],
            }
        case 'low_quality':
        case 'unrecognised':
            return {
                headline: 'We couldn\'t identify the product',
                bullets: [
                    'The photos may be too blurry or dark for AI to analyse',
                    'Try taking clearer, well-lit photos from different angles',
                    'Including a label or barcode photo helps identify the item',
                ],
            }
        case 'timeout':
            return {
                headline: 'The analysis took too long',
                bullets: [
                    'Our AI ran out of time analysing your photos',
                    'This can happen with complex images or high server load',
                    'Try again in a moment, or use fewer photos (2–4 works best)',
                ],
            }
        case 'api_key_missing':
        case 'config_error':
            return {
                headline: 'AI vision is not configured yet',
                bullets: [
                    'The Gemini Vision API key isn\'t set up in your account',
                    'Contact your account admin to add the API key',
                    'You can still create listings with Title to Listing',
                ],
            }
        default:
            return {
                headline: 'Something went wrong analysing the photos',
                bullets: [
                    'Our AI couldn\'t process the uploaded images',
                    'Photos may be in an unsupported format (try JPG or PNG)',
                    'Try again with different, clearer photos of the product',
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
    icon: ElementType
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

// ── Main Component ─────────────────────────────────────────────
export default function ImageImportFailed({
    errorCode,
    photoCount,
    onTryAgain,
    onTitleMode,
    onBarcodeMode,
    onCancel,
}: Props) {
    const copy = getErrorCopy(errorCode)

    return (
        <>
            <style>{`
        @keyframes imgFailSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .img-fail-slide-in { animation: imgFailSlideIn 0.3s cubic-bezier(0.4,0,0.2,1) forwards; }
      `}</style>

            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center px-4"
                style={{ backgroundColor: 'rgba(30,21,53,0.72)', backdropFilter: 'blur(8px)' }}
            >
                {/* Panel */}
                <div
                    className="img-fail-slide-in relative w-full max-w-[520px] rounded-3xl overflow-hidden"
                    style={{
                        backgroundColor: C.surface,
                        boxShadow: '0 32px 80px rgba(117,48,251,0.18), 0 8px 24px rgba(0,0,0,0.12)',
                    }}
                >
                    {/* Red top stripe */}
                    <div className="h-1.5 w-full" style={{ backgroundColor: C.danger }} />

                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 px-7 pt-6 pb-5">
                        <div className="flex items-center gap-4">
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
                                {photoCount != null && photoCount > 0 && (
                                    <span
                                        className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                                        style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}
                                    >
                                        <Camera size={10} />
                                        {photoCount} photo{photoCount !== 1 ? 's' : ''} tried
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

                    {/* Why it failed */}
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

                    {/* Divider */}
                    <div className="mx-7 mb-5" style={{ height: 1, backgroundColor: C.border }} />

                    {/* Alternative options */}
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

                    {/* Footer */}
                    <div
                        className="flex items-center justify-between px-7 py-4"
                        style={{ borderTop: `1px solid ${C.border}` }}
                    >
                        <p
                            className="text-[12px]"
                            style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}
                        >
                            or upload different photos
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
                            Try different photos
                        </button>
                    </div>

                </div>
            </div>
        </>
    )
}
