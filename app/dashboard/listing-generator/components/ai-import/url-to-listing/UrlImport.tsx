'use client'
// app/dashboard/listing-generator/components/ai-import/UrlImport.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — Listing Studio
// Screen 1 of the URL → Listing import modal.
//
// Responsibilities:
//   ✓ Modal overlay with backdrop blur
//   ✓ URL paste field with instant platform detection
//   ✓ Platform badge appears as soon as URL is typed (no click needed)
//   ✓ Supported platform chips (Phase 1 shown, Phase 2 as "coming soon")
//   ✓ Validates URL before allowing import
//   ✓ Unsupported platform fallback message with alternative tools
//   ✓ Keyboard: Cmd+V to paste, Enter to import
//   ✓ Calls onImport(url) — parent handles the API call + step transition
//
// NOT responsible for: API calls, scraping, AI, progress tracking.
// Those live in UrlImportProcessing.tsx (Screen 2).
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Link2, AlertCircle, ArrowRight, ChevronRight } from 'lucide-react'
import {
    detectPlatformFromUrl,
    SUPPORTED_PLATFORMS,
    type PlatformDetection,
    type PlatformMeta,
} from '@/app/dashboard/listing-generator/types/url-import.types'

// ── Design tokens (matches LgDashboard / Step files) ──────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    borderInput: '#e5e0f5',
    borderFocus: '#7530fb',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    primaryHover: '#6420e8',
    accent: '#b8fa33',
    accentText: '#1e1535',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    success: '#16a34a',
    successBg: '#dcfce7',
    warning: '#d97706',
    warningBg: '#fef9c3',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
    overlay: 'rgba(30, 21, 53, 0.55)',
}

// ── Platform logo map ─────────────────────────────────────────
// Using first-letter initials styled with brand colour as fallback.
// Replace with <img> tags once you add SVG logos to /public/logos/.
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
    unknown: '#9ca3af',
}

// ── Props ─────────────────────────────────────────────────────
interface Props {
    onClose: () => void
    onImport: (url: string, platform: PlatformDetection) => void
    onSwitchToTitle?: () => void  // "Try Title to Listing instead"
    onSwitchToBarcode?: () => void  // "Try Barcode to Listing instead"
    onSwitchToImage?: () => void  // "Try Image to Listing instead"
}

// ── Platform Logo Badge ───────────────────────────────────────
function PlatformLogo({ logoKey, size = 22 }: { logoKey: string; size?: number }) {
    const color = PLATFORM_COLORS[logoKey] ?? PLATFORM_COLORS.unknown
    const letter = logoKey === 'bq' ? 'B&Q'
        : logoKey === 'unknown' ? '?'
            : logoKey.charAt(0).toUpperCase()

    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: 5,
                backgroundColor: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: size * 0.42,
                fontWeight: 800,
                color: '#fff',
                fontFamily: 'Syne, sans-serif',
                flexShrink: 0,
                letterSpacing: '-0.03em',
            }}
        >
            {letter}
        </div>
    )
}

// ── Phase 1 supported platform chips ─────────────────────────
const PHASE1 = SUPPORTED_PLATFORMS.filter((p: PlatformMeta) => p.phase === 1)
const PHASE2 = SUPPORTED_PLATFORMS.filter((p: PlatformMeta) => p.phase === 2)

// ── Main Component ────────────────────────────────────────────
export default function UrlImport({
    onClose,
    onImport,
    onSwitchToTitle,
    onSwitchToBarcode,
    onSwitchToImage,
}: Props) {
    const [url, setUrl] = useState('')
    const [detected, setDetected] = useState<PlatformDetection | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [focused, setFocused] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Auto-focus the URL input when modal opens
    useEffect(() => {
        const t = setTimeout(() => inputRef.current?.focus(), 80)
        return () => clearTimeout(t)
    }, [])

    // Close on Escape key
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    // Detect platform every time the URL changes
    const handleUrlChange = useCallback((raw: string) => {
        const trimmed = raw.trim()
        setUrl(raw)
        setError(null)

        if (!trimmed) {
            setDetected(null)
            return
        }

        // Try to detect even without a full valid URL (they might be mid-paste)
        const result = detectPlatformFromUrl(
            trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
        )
        setDetected(result)
    }, [])

    // Validate and fire import
    const handleImport = useCallback(() => {
        const trimmed = url.trim()

        if (!trimmed) {
            setError('Please paste a product URL first.')
            return
        }

        // Ensure it looks like a URL
        try {
            new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
        } catch {
            setError('That doesn\'t look like a valid URL. Try pasting the full link from your browser.')
            return
        }

        const platform = detectPlatformFromUrl(
            trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
        )

        if (!platform) {
            setError('We couldn\'t recognise that URL. Please paste the full product page URL.')
            return
        }

        if (platform.requiresLogin) {
            setError(`${platform.displayName} product pages require you to be logged in. We can\'t read those yet.`)
            return
        }

        // Unknown platform is still allowed — we'll try the AI fallback
        onImport(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`, platform)
    }, [url, onImport])

    // Enter key triggers import
    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') handleImport()
    }

    const canImport = url.trim().length > 0
    const isUnsupported = detected && !detected.supported && detected.platform !== 'unknown'

    return (
        // ── Backdrop ──────────────────────────────────────────
        <div
            onClick={e => { if (e.target === e.currentTarget) onClose() }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: C.overlay,
                backdropFilter: 'blur(4px)',
                padding: '16px',
            }}
        >
            {/* ── Modal card ───────────────────────────────── */}
            <div
                style={{
                    width: '100%',
                    maxWidth: 520,
                    backgroundColor: C.surface,
                    borderRadius: 20,
                    boxShadow: '0 24px 64px rgba(30,21,53,0.22), 0 4px 16px rgba(30,21,53,0.10)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'lgImportSlideUp 0.22s cubic-bezier(0.16,1,0.3,1)',
                }}
            >
                {/* ── Header ───────────────────────────────── */}
                <div
                    style={{
                        padding: '20px 24px 16px',
                        borderBottom: `1px solid ${C.border}`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                    }}
                >
                    {/* Icon */}
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: C.primaryLight,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <Link2 size={18} style={{ color: C.primary }} />
                    </div>

                    {/* Title + subtitle */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: 17,
                                fontWeight: 800,
                                color: C.dark,
                                fontFamily: 'Syne, sans-serif',
                                letterSpacing: '-0.02em',
                                lineHeight: 1.2,
                            }}
                        >
                            Import from URL
                        </h2>
                        <p
                            style={{
                                margin: '3px 0 0',
                                fontSize: 13,
                                color: C.secondary,
                                fontFamily: 'DM Sans, sans-serif',
                            }}
                        >
                            Paste any supplier or product page link
                        </p>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: C.muted,
                            flexShrink: 0,
                            transition: 'background 0.15s, color 0.15s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = C.bg
                            e.currentTarget.style.color = C.body
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = C.muted
                        }}
                        title="Close (Esc)"
                    >
                        <X size={17} />
                    </button>
                </div>

                {/* ── Body ─────────────────────────────────── */}
                <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* ── URL Input + detected platform badge ── */}
                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 12,
                                fontWeight: 600,
                                color: C.secondary,
                                fontFamily: 'DM Sans, sans-serif',
                                marginBottom: 7,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                            }}
                        >
                            Product URL
                        </label>

                        {/* Input wrapper — shows platform badge inside */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                border: `1.5px solid ${focused ? C.borderFocus : error ? C.danger : C.borderInput}`,
                                borderRadius: 12,
                                backgroundColor: C.surface,
                                overflow: 'hidden',
                                transition: 'border-color 0.15s',
                                boxShadow: focused ? `0 0 0 3px ${C.primaryLight}` : 'none',
                            }}
                        >
                            {/* Platform logo badge — appears when platform detected */}
                            <div
                                style={{
                                    paddingLeft: 12,
                                    paddingRight: detected ? 8 : 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexShrink: 0,
                                    transition: 'all 0.15s',
                                }}
                            >
                                {detected ? (
                                    <PlatformLogo logoKey={detected.logoKey} size={22} />
                                ) : (
                                    <Link2 size={16} style={{ color: C.muted }} />
                                )}
                            </div>

                            <input
                                ref={inputRef}
                                type="url"
                                value={url}
                                onChange={e => handleUrlChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setFocused(true)}
                                onBlur={() => setFocused(false)}
                                placeholder="https://www.amazon.co.uk/dp/..."
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck={false}
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: 13.5,
                                    color: C.body,
                                    fontFamily: 'DM Mono, monospace',
                                    backgroundColor: 'transparent',
                                    padding: '11px 12px 11px 0',
                                    minWidth: 0,
                                }}
                            />

                            {/* Detected platform label */}
                            {detected && detected.platform !== 'unknown' && (
                                <div
                                    style={{
                                        paddingRight: 12,
                                        fontSize: 11,
                                        fontWeight: 600,
                                        color: detected.supported ? C.success : C.warning,
                                        fontFamily: 'DM Sans, sans-serif',
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                    }}
                                >
                                    {detected.supported ? `✓ ${detected.displayName}` : `⚠ ${detected.displayName}`}
                                </div>
                            )}

                            {/* Clear button — visible when URL typed */}
                            {url && (
                                <button
                                    onClick={() => { setUrl(''); setDetected(null); setError(null); inputRef.current?.focus() }}
                                    style={{
                                        padding: '0 10px 0 4px',
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        cursor: 'pointer',
                                        color: C.muted,
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexShrink: 0,
                                    }}
                                    title="Clear"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Error message */}
                        {error && (
                            <div
                                style={{
                                    marginTop: 7,
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 6,
                                    fontSize: 12,
                                    color: C.danger,
                                    fontFamily: 'DM Sans, sans-serif',
                                }}
                            >
                                <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                                {error}
                            </div>
                        )}

                        {/* Unsupported platform notice — different from error */}
                        {isUnsupported && !error && (
                            <div
                                style={{
                                    marginTop: 7,
                                    padding: '8px 10px',
                                    borderRadius: 8,
                                    backgroundColor: C.warningBg,
                                    fontSize: 12,
                                    color: C.warning,
                                    fontFamily: 'DM Sans, sans-serif',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                <AlertCircle size={13} style={{ flexShrink: 0 }} />
                                <span>
                                    <strong>{detected?.displayName}</strong> is not supported yet.
                                    We'll try our AI fallback — results may vary.
                                </span>
                            </div>
                        )}
                    </div>

                    {/* ── Import button ─────────────────────── */}
                    <button
                        onClick={handleImport}
                        disabled={!canImport}
                        style={{
                            width: '100%',
                            height: 46,
                            borderRadius: 12,
                            border: 'none',
                            backgroundColor: canImport ? C.primary : C.borderInput,
                            color: canImport ? '#fff' : C.muted,
                            fontSize: 14,
                            fontWeight: 700,
                            fontFamily: 'Syne, sans-serif',
                            cursor: canImport ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            transition: 'background 0.15s, transform 0.1s',
                            letterSpacing: '-0.01em',
                        }}
                        onMouseEnter={e => {
                            if (canImport) e.currentTarget.style.backgroundColor = C.primaryHover
                        }}
                        onMouseLeave={e => {
                            if (canImport) e.currentTarget.style.backgroundColor = C.primary
                        }}
                        onMouseDown={e => {
                            if (canImport) e.currentTarget.style.transform = 'scale(0.98)'
                        }}
                        onMouseUp={e => {
                            e.currentTarget.style.transform = 'scale(1)'
                        }}
                    >
                        Import Product
                        <ArrowRight size={16} />
                    </button>

                    {/* ── Supported platforms ───────────────── */}
                    <div>
                        <p
                            style={{
                                margin: '0 0 8px',
                                fontSize: 11,
                                fontWeight: 600,
                                color: C.muted,
                                fontFamily: 'DM Sans, sans-serif',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                            }}
                        >
                            Supported now
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {PHASE1.map((p: PlatformMeta) => (
                                <PlatformChip key={p.key} platform={p} active={detected?.platform === p.key} />
                            ))}
                        </div>

                        {/* Phase 2 coming soon */}
                        <p
                            style={{
                                margin: '12px 0 6px',
                                fontSize: 11,
                                fontWeight: 600,
                                color: C.muted,
                                fontFamily: 'DM Sans, sans-serif',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                            }}
                        >
                            Coming soon
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {PHASE2.map((p: PlatformMeta) => (
                                <PlatformChip key={p.key} platform={p} comingSoon />
                            ))}
                        </div>
                    </div>

                    {/* ── Divider ───────────────────────────── */}
                    <div style={{ height: 1, backgroundColor: C.border }} />

                    {/* ── Alternative tools ─────────────────── */}
                    <div>
                        <p
                            style={{
                                margin: '0 0 8px',
                                fontSize: 11,
                                fontWeight: 600,
                                color: C.muted,
                                fontFamily: 'DM Sans, sans-serif',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                            }}
                        >
                            Or try another method
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {onSwitchToTitle && (
                                <AltMethodButton
                                    emoji="T"
                                    label="Title to Listing"
                                    description="Type a product name to search"
                                    onClick={onSwitchToTitle}
                                />
                            )}
                            {onSwitchToBarcode && (
                                <AltMethodButton
                                    emoji="#"
                                    label="Barcode to Listing"
                                    description="Type or scan an EAN / UPC barcode"
                                    onClick={onSwitchToBarcode}
                                />
                            )}
                            {onSwitchToImage && (
                                <AltMethodButton
                                    emoji="📷"
                                    label="Image to Listing"
                                    description="Upload a photo, AI reads the product"
                                    onClick={onSwitchToImage}
                                />
                            )}
                        </div>
                    </div>

                    {/* ── Footer note ───────────────────────── */}
                    <p
                        style={{
                            margin: 0,
                            fontSize: 11,
                            color: C.muted,
                            fontFamily: 'DM Sans, sans-serif',
                            textAlign: 'center',
                            lineHeight: 1.5,
                        }}
                    >
                        Import uses AI to rewrite titles for eBay Cassini SEO and runs a VeRO pre-check automatically.
                    </p>
                </div>
            </div>

            {/* ── Slide-up animation keyframes ─────────────── */}
            <style>{`
                @keyframes lgImportSlideUp {
                    from { opacity: 0; transform: translateY(18px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)    scale(1);    }
                }
            `}</style>
        </div>
    )
}

// ── Platform Chip ─────────────────────────────────────────────
function PlatformChip({
    platform,
    active = false,
    comingSoon = false,
}: {
    platform: PlatformMeta
    active?: boolean
    comingSoon?: boolean
}) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 9px 4px 5px',
                borderRadius: 7,
                border: `1.5px solid ${active ? C.primary : comingSoon ? C.border : C.borderInput}`,
                backgroundColor: active ? C.primaryLight : comingSoon ? C.bg : C.surface,
                opacity: comingSoon ? 0.6 : 1,
                fontSize: 11.5,
                fontWeight: 600,
                color: active ? C.primary : comingSoon ? C.muted : C.body,
                fontFamily: 'DM Sans, sans-serif',
                cursor: 'default',
                transition: 'border-color 0.15s, background 0.15s',
                whiteSpace: 'nowrap',
            }}
        >
            <div
                style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    backgroundColor: comingSoon ? C.muted : platform.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 8,
                    fontWeight: 800,
                    color: '#fff',
                    fontFamily: 'Syne, sans-serif',
                    flexShrink: 0,
                }}
            >
                {platform.key === 'bq' ? 'B' : platform.displayName.charAt(0)}
            </div>
            {platform.displayName}
        </div>
    )
}

// ── Alternative method button ─────────────────────────────────
function AltMethodButton({
    emoji,
    label,
    description,
    onClick,
}: {
    emoji: string
    label: string
    description: string
    onClick: () => void
}) {
    const [hovered, setHovered] = useState(false)

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 10,
                border: `1.5px solid ${hovered ? C.borderFocus : C.border}`,
                backgroundColor: hovered ? C.primaryLight : C.bg,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s, background 0.15s',
            }}
        >
            <div
                style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    backgroundColor: hovered ? C.primaryLight : C.border,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.primary,
                    fontFamily: 'Syne, sans-serif',
                    flexShrink: 0,
                    transition: 'background 0.15s',
                }}
            >
                {emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.dark,
                        fontFamily: 'DM Sans, sans-serif',
                        lineHeight: 1.2,
                    }}
                >
                    {label}
                </div>
                <div
                    style={{
                        fontSize: 11.5,
                        color: C.secondary,
                        fontFamily: 'DM Sans, sans-serif',
                        marginTop: 1,
                    }}
                >
                    {description}
                </div>
            </div>
            <ChevronRight size={14} style={{ color: C.muted, flexShrink: 0 }} />
        </button>
    )
}
