'use client'
// app/dashboard/listing-generator/components/ai-import/UrlImportVeroWarning.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — VeRO Risk Warning Screen
// Shown between Screen 2 (processing) and Screen 3 (preview)
// whenever a VeRO risk brand is detected on the imported product.
//
// Props:
//   brand       — flagged brand name e.g. "Sony"
//   riskLevel   — 'warning' (amber) | 'flagged' (red)
//   reason      — short reason string from VeRO DB
//   onBack      — user clicks Go Back → return to dashboard / cancel import
//   onContinue  — user accepts risk → proceed to Screen 3 preview
// ─────────────────────────────────────────────────────────────

import { AlertTriangle, ShieldAlert, ShieldX, ArrowLeft, ChevronRight, X } from 'lucide-react'

// ── Design tokens ─────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    warning: '#d97706',
    warningBg: '#fef3c7',
    warningBorder: '#fde68a',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
    dangerBorder: '#fecaca',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
}

// ── Props ─────────────────────────────────────────────────────
interface Props {
    brand: string
    riskLevel: 'warning' | 'flagged'
    reason: string
    onBack: () => void
    onContinue: () => void
}

// ── Bullet point row ──────────────────────────────────────────
function BulletRow({ text, color }: { text: string; color: string }) {
    return (
        <div className="flex items-start gap-3">
            <div
                className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                style={{ backgroundColor: color }}
            />
            <p
                className="text-[14px] leading-relaxed"
                style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}
            >
                {text}
            </p>
        </div>
    )
}

// ── Main Component ────────────────────────────────────────────
export default function UrlImportVeroWarning({
    brand,
    riskLevel,
    reason,
    onBack,
    onContinue,
}: Props) {
    const isFlagged = riskLevel === 'flagged'
    const accentColor = isFlagged ? C.danger : C.warning
    const accentBg = isFlagged ? C.dangerBg : C.warningBg
    const accentBorder = isFlagged ? C.dangerBorder : C.warningBorder
    const Icon = isFlagged ? ShieldX : ShieldAlert

    const bullets = isFlagged
        ? [
            `${brand} is a registered VeRO rights owner and actively monitors eBay for unauthorised listings.`,
            'Listings can be removed within hours of going live — sometimes within minutes.',
            'Repeated VeRO removals can lead to selling limits or permanent account suspension.',
            'Only list this brand if you are an authorised reseller with documented proof.',
        ]
        : [
            `${brand} participates in eBay's Verified Rights Owner (VeRO) programme.`,
            'If you are not an authorised reseller, your listing may be reported and removed.',
            'Keep proof of purchase or authorisation — eBay may ask for it if a complaint is filed.',
        ]

    return (
        <>
            <style>{`
        @keyframes veroSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .vero-slide-in { animation: veroSlideIn 0.3s cubic-bezier(0.4,0,0.2,1) forwards; }
      `}</style>

            {/* ── Backdrop ──────────────────────────────────────── */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center px-4"
                style={{ backgroundColor: 'rgba(30,21,53,0.72)', backdropFilter: 'blur(8px)' }}
            >
                {/* ── Panel ─────────────────────────────────────── */}
                <div
                    className="vero-slide-in relative w-full max-w-[560px] rounded-3xl overflow-hidden"
                    style={{
                        backgroundColor: C.surface,
                        boxShadow: `0 32px 80px rgba(117,48,251,0.18), 0 8px 24px rgba(0,0,0,0.12)`,
                    }}
                >

                    {/* Coloured top stripe */}
                    <div className="h-1.5 w-full" style={{ backgroundColor: accentColor }} />

                    {/* ── Header ──────────────────────────────────── */}
                    <div
                        className="flex items-start justify-between gap-4 px-8 pt-7 pb-6"
                        style={{ borderBottom: `1px solid ${accentBorder}`, backgroundColor: accentBg }}
                    >
                        <div className="flex items-center gap-4">
                            {/* Icon */}
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: accentColor + '22', border: `1px solid ${accentColor}44` }}
                            >
                                <Icon size={24} style={{ color: accentColor }} />
                            </div>

                            <div>
                                <p
                                    className="text-[18px] font-bold leading-tight"
                                    style={{ color: isFlagged ? '#7f1d1d' : '#78350f', fontFamily: 'Syne, sans-serif' }}
                                >
                                    {isFlagged ? 'VeRO Flagged — High Risk' : 'VeRO Risk Detected'}
                                </p>
                                <p
                                    className="text-[13px] mt-0.5"
                                    style={{ color: isFlagged ? C.danger : C.warning, fontFamily: 'DM Sans, sans-serif' }}
                                >
                                    {isFlagged
                                        ? 'This brand is a verified VeRO rights owner'
                                        : 'This brand may be registered with VeRO'}
                                </p>
                            </div>
                        </div>

                        {/* Close */}
                        <button
                            onClick={onBack}
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors mt-0.5"
                            style={{ color: C.secondary }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#00000010')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                            aria-label="Close"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* ── Brand pill + reason ───────────────────────── */}
                    <div className="px-8 pt-6 pb-4">
                        <div className="flex items-center gap-3 mb-4">
                            <span
                                className="text-[12px] font-bold px-3 py-1 rounded-full uppercase tracking-wide"
                                style={{
                                    backgroundColor: accentBg,
                                    color: accentColor,
                                    border: `1px solid ${accentBorder}`,
                                    fontFamily: 'DM Sans, sans-serif',
                                }}
                            >
                                Brand
                            </span>
                            <span
                                className="text-[18px] font-bold"
                                style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}
                            >
                                {brand}
                            </span>
                        </div>

                        {/* Risk reason sentence */}
                        <div
                            className="flex items-start gap-3 px-4 py-3.5 rounded-2xl mb-6"
                            style={{
                                backgroundColor: accentBg,
                                border: `1px solid ${accentBorder}`,
                            }}
                        >
                            <AlertTriangle
                                size={16}
                                className="mt-0.5 shrink-0"
                                style={{ color: accentColor }}
                            />
                            <p
                                className="text-[14px] leading-relaxed"
                                style={{ color: isFlagged ? '#7f1d1d' : '#78350f', fontFamily: 'DM Sans, sans-serif' }}
                            >
                                {reason}
                            </p>
                        </div>

                        {/* What this means */}
                        <p
                            className="text-[12px] font-bold uppercase tracking-widest mb-3"
                            style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}
                        >
                            What this means
                        </p>

                        <div className="flex flex-col gap-3 mb-2">
                            {bullets.map((text, i) => (
                                <BulletRow key={i} text={text} color={accentColor} />
                            ))}
                        </div>
                    </div>

                    {/* ── Footer — action buttons ────────────────────── */}
                    <div
                        className="flex items-center justify-between gap-3 px-8 py-5"
                        style={{ borderTop: `1px solid ${C.border}` }}
                    >
                        {/* Go Back */}
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all hover:opacity-80"
                            style={{
                                backgroundColor: C.bg,
                                color: C.secondary,
                                border: `1px solid ${C.border}`,
                                fontFamily: 'DM Sans, sans-serif',
                            }}
                        >
                            <ArrowLeft size={15} />
                            Go Back
                        </button>

                        {/* Continue anyway */}
                        <button
                            onClick={onContinue}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all hover:opacity-90 active:scale-[0.98]"
                            style={{
                                backgroundColor: accentColor,
                                color: '#ffffff',
                                fontFamily: 'DM Sans, sans-serif',
                                boxShadow: `0 4px 14px ${accentColor}44`,
                            }}
                        >
                            I understand, continue anyway
                            <ChevronRight size={15} />
                        </button>
                    </div>

                </div>
            </div>
        </>
    )
}
