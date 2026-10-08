import React from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
export type ThumbFn = (col: string, light: string) => JSX.Element

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    secondary: '#6b7280',
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES TAB
// Visual styling — colours, spacing, typography, borders
// ─────────────────────────────────────────────────────────────────────────────
// VARIANT PICKER — visual style cards shown at top of Styles tab
export const VARIANT_THUMBNAILS: Record<string, ThumbFn> = {
    // ── Hero Header ───────────────────────────────────────────────────────────
    'gradient': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <defs><linearGradient id="vg1" x1="0" y1="0" x2="80" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor={col} stopOpacity="0.8" /><stop offset="1" stopColor={col} stopOpacity="0.3" />
            </linearGradient></defs>
            <rect width="80" height="36" rx="3" fill="url(#vg1)" />
            <rect x="20" y="11" width="40" height="5" rx="2" fill="white" opacity="0.9" />
            <rect x="24" y="20" width="32" height="3" rx="1.5" fill="white" opacity="0.6" />
        </svg>
    ),
    'minimal': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={col} opacity="0.85" />
            <rect x="6" y="14" width="30" height="4" rx="2" fill="white" opacity="0.9" />
            <rect x="50" y="15" width="24" height="3" rx="1.5" fill="white" opacity="0.5" />
        </svg>
    ),
    'image-bg': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect width="80" height="36" rx="3" fill={col} opacity="0.55" />
            <circle cx="20" cy="14" r="5" fill="white" opacity="0.25" />
            <path d="M6 28 Q20 20 34 24 Q50 18 74 26" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3" />
            <rect x="20" y="11" width="40" height="5" rx="2" fill="white" opacity="0.9" />
            <rect x="24" y="20" width="32" height="3" rx="1.5" fill="white" opacity="0.6" />
        </svg>
    ),
    'typographic': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="10" y="9" width="60" height="7" rx="2" fill={col} opacity="0.85" />
            <rect x="34" y="19" width="12" height="2" rx="1" fill={col} />
            <rect x="16" y="24" width="48" height="3" rx="1.5" fill="#e5e7eb" />
        </svg>
    ),
    // ── Banner: Minimal Bordered ──────────────────────────────────────────────
    'minimal-bordered': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect x="2" y="2" width="76" height="32" rx="4" fill="white" stroke={col} strokeWidth="1.5" />
            <rect x="12" y="10" width="56" height="6" rx="2" fill={col} opacity="0.85" />
            <rect x="20" y="20" width="40" height="3" rx="1.5" fill="#9ca3af" opacity="0.6" />
        </svg>
    ),
    // ── Banner: Floating Card ─────────────────────────────────────────────────
    'floating-card': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect x="6" y="4" width="68" height="28" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="14" y="10" width="52" height="6" rx="2" fill={col} opacity="0.85" />
            <rect x="22" y="20" width="36" height="3" rx="1.5" fill="#9ca3af" opacity="0.6" />
        </svg>
    ),
    // ── Banner: Diagonal Accent ───────────────────────────────────────────────
    'diagonal-accent-hero': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" />
            <path d="M0 36 L80 0 L80 36 Z" fill={col} opacity="0.3" />
            <rect x="8" y="10" width="40" height="6" rx="2" fill={col} opacity="0.9" />
            <rect x="8" y="20" width="30" height="3" rx="1.5" fill="#6b7280" opacity="0.7" />
        </svg>
    ),
    // ── Banner: Animated Gradient Wave ────────────────────────────────────────
    'gradient-wave': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={col} opacity="0.3" />
            <rect width="80" height="36" rx="3" fill="url(#wave-gradient)" />
            <defs>
                <linearGradient id="wave-gradient" x1="0" y1="0" x2="80" y2="0">
                    <stop offset="0%" stopColor={col} />
                    <stop offset="50%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor={col} />
                </linearGradient>
            </defs>
        </svg>
    ),
    // ── Variant: Trust Ribbon ──────────────────────────────────────────
    'trust-ribbon': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="4" fill="white" stroke={col} strokeWidth="1" />
            <rect x="5" y="10" width="20" height="16" rx="2" fill={col} opacity="0.3" />
            <rect x="30" y="10" width="20" height="16" rx="2" fill={col} opacity="0.3" />
            <rect x="55" y="10" width="20" height="16" rx="2" fill={col} opacity="0.3" />
        </svg>
    ),
    // ── Variant: Flash Deal ──────────────────────────────────────────
    'flash-deal': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="4" fill="#1e1535" />
            <rect x="20" y="5" width="40" height="6" rx="3" fill={col} />
            <rect x="10" y="16" width="60" height="8" rx="2" fill="white" />
        </svg>
    ),
    // ── Variant: Dark Luxury ──────────────────────────────────────────
    'dark-luxury': (_, __) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="4" fill="#0f172a" stroke="#c9a84c" strokeWidth="2" />
            <rect x="10" y="10" width="60" height="16" rx="2" fill="none" stroke="#c9a84c" strokeWidth="1" />
        </svg>
    ),
    // ── Product Description variants ──────────────────────────────────────────
    // ── Product Variants ──────────────────────────────────────────────────────
    'swatches-sizes': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="12" cy="14" r="5" fill="#ef4444" />
            <circle cx="24" cy="14" r="5" fill="#3b82f6" />
            <circle cx="36" cy="14" r="5" fill="#22c55e" />
            <circle cx="48" cy="14" r="5" fill="#f59e0b" />
            <rect x="8" y="24" width="12" height="7" rx="2" fill="none" stroke="#ede9fe" strokeWidth="1" />
            <rect x="23" y="24" width="12" height="7" rx="2" fill="none" stroke="#ede9fe" strokeWidth="1" />
            <rect x="38" y="24" width="12" height="7" rx="2" fill="none" stroke="#ede9fe" strokeWidth="1" />
            <rect x="53" y="24" width="12" height="7" rx="2" fill="none" stroke="#ede9fe" strokeWidth="1" />
        </svg>
    ),
    'inline-compact': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="10" cy="18" r="4" fill="#ef4444" />
            <circle cx="20" cy="18" r="4" fill="#3b82f6" />
            <circle cx="30" cy="18" r="4" fill="#22c55e" />
            <rect x="37" y="12" width="1" height="12" fill="#e5e7eb" />
            <rect x="42" y="13" width="10" height="10" rx="2" fill="none" stroke={col} strokeWidth="1" />
            <rect x="55" y="13" width="10" height="10" rx="2" fill="none" stroke={col} strokeWidth="1" />
            <rect x="68" y="13" width="10" height="10" rx="2" fill="none" stroke={col} strokeWidth="1" />
        </svg>
    ),
    'labelled-swatches': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="14" cy="14" r="6" fill="#ef4444" />
            <rect x="9" y="22" width="10" height="2" rx="1" fill="#d1d5db" />
            <circle cx="34" cy="14" r="6" fill="#3b82f6" />
            <rect x="29" y="22" width="10" height="2" rx="1" fill="#d1d5db" />
            <circle cx="54" cy="14" r="6" fill="#22c55e" />
            <rect x="49" y="22" width="10" height="2" rx="1" fill="#d1d5db" />
            <circle cx="72" cy="14" r="6" fill="#f59e0b" />
            <rect x="67" y="22" width="10" height="2" rx="1" fill="#d1d5db" />
        </svg>
    ),
    'pill-only': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="4" y="6" width="16" height="9" rx="4" fill="none" stroke={col} strokeWidth="1" />
            <rect x="23" y="6" width="16" height="9" rx="4" fill="none" stroke={col} strokeWidth="1" />
            <rect x="42" y="6" width="16" height="9" rx="4" fill="none" stroke={col} strokeWidth="1" />
            <rect x="4" y="21" width="14" height="9" rx="4" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="21" y="21" width="10" height="9" rx="4" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="34" y="21" width="12" height="9" rx="4" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="49" y="21" width="10" height="9" rx="4" fill="none" stroke="#e5e7eb" strokeWidth="1" />
        </svg>
    ),
    'card-grid': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="10" cy="10" r="4" fill="#ef4444" />
            <circle cx="20" cy="10" r="4" fill="#3b82f6" />
            <circle cx="30" cy="10" r="4" fill="#22c55e" />
            <rect x="4" y="19" width="16" height="12" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
            <rect x="23" y="19" width="16" height="12" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
            <rect x="42" y="19" width="16" height="12" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
            <rect x="61" y="19" width="16" height="12" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
        </svg>
    ),
    'accent-selected': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="12" cy="13" r="5" fill="#ef4444" stroke={col} strokeWidth="2" />
            <circle cx="24" cy="13" r="5" fill="#3b82f6" />
            <circle cx="36" cy="13" r="5" fill="#22c55e" />
            <circle cx="48" cy="13" r="5" fill="#f59e0b" />
            <rect x="4" y="23" width="12" height="8" rx="2" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="19" y="23" width="12" height="8" rx="2" fill={col} opacity="0.15" stroke={col} strokeWidth="1.5" />
            <rect x="34" y="23" width="12" height="8" rx="2" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="49" y="23" width="12" height="8" rx="2" fill="none" stroke="#e5e7eb" strokeWidth="1" />
        </svg>
    ),
    'dark-selector': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#1e1535" />
            <circle cx="12" cy="13" r="5" fill="#ef4444" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <circle cx="24" cy="13" r="5" fill="#3b82f6" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <circle cx="36" cy="13" r="5" fill="#22c55e" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <rect x="4" y="23" width="12" height="8" rx="2" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            <rect x="19" y="23" width="12" height="8" rx="2" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            <rect x="34" y="23" width="12" height="8" rx="2" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            <rect x="0" y="33" width="50" height="2" rx="1" fill={col} opacity="0.6" />
        </svg>
    ),
    'side-by-side': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="12" cy="20" r="5" fill="#ef4444" />
            <circle cx="22" cy="20" r="5" fill="#3b82f6" />
            <circle cx="32" cy="20" r="5" fill="#22c55e" />
            <rect x="39" y="8" width="1" height="20" fill="#e5e7eb" />
            <rect x="44" y="14" width="10" height="9" rx="2" fill="none" stroke={col} strokeWidth="1" />
            <rect x="57" y="14" width="10" height="9" rx="2" fill="none" stroke={col} strokeWidth="1" />
            <rect x="69" y="14" width="9" height="9" rx="2" fill="none" stroke={col} strokeWidth="1" />
        </svg>
    ),
    'availability-grid': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="4" y="6" width="14" height="12" rx="3" fill="white" stroke={col} strokeWidth="1.5" />
            <circle cx="11" cy="9" r="2" fill="#22c55e" />
            <rect x="21" y="6" width="14" height="12" rx="3" fill="white" stroke={col} strokeWidth="1.5" />
            <circle cx="28" cy="9" r="2" fill="#22c55e" />
            <rect x="38" y="6" width="14" height="12" rx="3" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="45" cy="9" r="2" fill="#ef4444" />
            <rect x="55" y="6" width="14" height="12" rx="3" fill="white" stroke={col} strokeWidth="1.5" />
            <circle cx="62" cy="9" r="2" fill="#22c55e" />
            <rect x="4" y="26" width="30" height="3" rx="1.5" fill="#d1d5db" />
        </svg>
    ),
    'spec-badges': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="4" y="10" width="32" height="12" rx="6" fillOpacity="0.12" fill={col} stroke={col} strokeWidth="1" strokeOpacity="0.4" />
            <rect x="40" y="10" width="36" height="12" rx="6" fillOpacity="0.12" fill={col} stroke={col} strokeWidth="1" strokeOpacity="0.4" />
            <rect x="4" y="26" width="28" height="5" rx="2.5" fillOpacity="0.12" fill={col} stroke={col} strokeWidth="1" strokeOpacity="0.3" />
            <rect x="36" y="26" width="32" height="5" rx="2.5" fillOpacity="0.12" fill={col} stroke={col} strokeWidth="1" strokeOpacity="0.3" />
        </svg>
    ),
    // ── What's In The Box variants ────────────────────────────────────────────
    'simple-list': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="8" y="8" width="36" height="3" rx="1.5" fill={col} opacity="0.85" />
            <rect x="8" y="15" width="6" height="5" rx="1" fill="#16a34a" opacity="0.8" />
            <rect x="18" y="16.5" width="44" height="2" rx="1" fill="#6b7280" opacity="0.6" />
            <rect x="8" y="22" width="6" height="5" rx="1" fill="#16a34a" opacity="0.8" />
            <rect x="18" y="23.5" width="38" height="2" rx="1" fill="#6b7280" opacity="0.6" />
            <rect x="8" y="29" width="6" height="5" rx="1" fill="#16a34a" opacity="0.8" />
            <rect x="18" y="30.5" width="42" height="2" rx="1" fill="#6b7280" opacity="0.6" />
        </svg>
    ),
    'tick-cards': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="6" y="7" width="68" height="7" rx="3" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="0.75" />
            <circle cx="13" cy="10.5" r="3" fill="#16a34a" opacity="0.8" />
            <rect x="20" y="9" width="40" height="2.5" rx="1.25" fill="#374151" opacity="0.6" />
            <rect x="6" y="16" width="68" height="7" rx="3" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="0.75" />
            <circle cx="13" cy="19.5" r="3" fill="#16a34a" opacity="0.8" />
            <rect x="20" y="18" width="34" height="2.5" rx="1.25" fill="#374151" opacity="0.6" />
            <rect x="6" y="25" width="68" height="7" rx="3" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="0.75" />
            <circle cx="13" cy="28.5" r="3" fill="#16a34a" opacity="0.8" />
            <rect x="20" y="27" width="38" height="2.5" rx="1.25" fill="#374151" opacity="0.6" />
        </svg>
    ),
    'witb-two-column': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="8" y="6" width="30" height="3" rx="1.5" fill={col} opacity="0.85" />
            <rect x="8" y="13" width="5" height="4" rx="1" fill="#16a34a" opacity="0.8" /><rect x="16" y="14" width="20" height="2" rx="1" fill="#6b7280" opacity="0.5" />
            <rect x="8" y="20" width="5" height="4" rx="1" fill="#16a34a" opacity="0.8" /><rect x="16" y="21" width="16" height="2" rx="1" fill="#6b7280" opacity="0.5" />
            <rect x="8" y="27" width="5" height="4" rx="1" fill="#16a34a" opacity="0.8" /><rect x="16" y="28" width="18" height="2" rx="1" fill="#6b7280" opacity="0.5" />
            <rect x="42" y="13" width="5" height="4" rx="1" fill="#16a34a" opacity="0.8" /><rect x="50" y="14" width="20" height="2" rx="1" fill="#6b7280" opacity="0.5" />
            <rect x="42" y="20" width="5" height="4" rx="1" fill="#16a34a" opacity="0.8" /><rect x="50" y="21" width="16" height="2" rx="1" fill="#6b7280" opacity="0.5" />
        </svg>
    ),
    'numbered': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="8" y="6" width="32" height="3" rx="1.5" fill={col} opacity="0.85" />
            <circle cx="13" cy="15" r="4" fill={col} opacity="0.85" />
            <rect x="21" y="13.5" width="42" height="2.5" rx="1.25" fill="#6b7280" opacity="0.6" />
            <circle cx="13" cy="23" r="4" fill={col} opacity="0.6" />
            <rect x="21" y="21.5" width="36" height="2.5" rx="1.25" fill="#6b7280" opacity="0.5" />
            <circle cx="13" cy="31" r="4" fill={col} opacity="0.4" />
            <rect x="21" y="29.5" width="38" height="2.5" rx="1.25" fill="#6b7280" opacity="0.4" />
        </svg>
    ),
    'dark-panel': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#1e1535" />
            <rect x="8" y="6" width="36" height="3" rx="1.5" fill="#b8fa33" opacity="0.9" />
            <rect x="8" y="13" width="6" height="5" rx="1" fill="#b8fa33" opacity="0.7" />
            <rect x="18" y="14.5" width="42" height="2" rx="1" fill="white" opacity="0.5" />
            <rect x="8" y="21" width="6" height="5" rx="1" fill="#b8fa33" opacity="0.7" />
            <rect x="18" y="22.5" width="36" height="2" rx="1" fill="white" opacity="0.4" />
            <rect x="8" y="29" width="6" height="5" rx="1" fill="#b8fa33" opacity="0.7" />
            <rect x="18" y="30.5" width="40" height="2" rx="1" fill="white" opacity="0.4" />
        </svg>
    ),
    'icon-row': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="8" y="5" width="40" height="3" rx="1.5" fill={col} opacity="0.85" />
            <rect x="6" y="11" width="14" height="8" rx="2" fill={col} opacity="0.15" />
            <rect x="8" y="13" width="10" height="4" rx="1" fill={col} opacity="0.5" />
            <rect x="6" y="22" width="14" height="3" rx="1.5" fill="#9ca3af" opacity="0.5" />
            <rect x="23" y="11" width="14" height="8" rx="2" fill={col} opacity="0.15" />
            <rect x="25" y="13" width="10" height="4" rx="1" fill={col} opacity="0.5" />
            <rect x="23" y="22" width="14" height="3" rx="1.5" fill="#9ca3af" opacity="0.5" />
            <rect x="40" y="11" width="14" height="8" rx="2" fill={col} opacity="0.15" />
            <rect x="42" y="13" width="10" height="4" rx="1" fill={col} opacity="0.5" />
            <rect x="40" y="22" width="14" height="3" rx="1.5" fill="#9ca3af" opacity="0.5" />
            <rect x="57" y="11" width="14" height="8" rx="2" fill={col} opacity="0.15" />
            <rect x="59" y="13" width="10" height="4" rx="1" fill={col} opacity="0.5" />
            <rect x="57" y="22" width="14" height="3" rx="1.5" fill="#9ca3af" opacity="0.5" />
        </svg>
    ),
    'table-qty': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="6" y="6" width="68" height="6" rx="2" fill={col} opacity="0.85" />
            <rect x="6" y="12" width="68" height="6" fill="#f9fafb" />
            <rect x="9" y="14" width="36" height="2" rx="1" fill="#374151" opacity="0.6" />
            <rect x="57" y="14" width="14" height="2" rx="1" fill={col} opacity="0.7" />
            <rect x="6" y="18" width="68" height="6" fill="white" />
            <rect x="9" y="20" width="28" height="2" rx="1" fill="#374151" opacity="0.5" />
            <rect x="57" y="20" width="14" height="2" rx="1" fill={col} opacity="0.6" />
            <rect x="6" y="24" width="68" height="6" fill="#f9fafb" />
            <rect x="9" y="26" width="32" height="2" rx="1" fill="#374151" opacity="0.5" />
            <rect x="57" y="26" width="14" height="2" rx="1" fill={col} opacity="0.5" />
        </svg>
    ),
    'badge-count': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="8" y="6" width="32" height="3" rx="1.5" fill={col} opacity="0.85" />
            <rect x="8" y="13" width="34" height="2.5" rx="1.25" fill="#374151" opacity="0.6" />
            <rect x="57" y="11" width="15" height="6" rx="3" fill={col} opacity="0.85" />
            <rect x="8" y="20" width="28" height="2.5" rx="1.25" fill="#374151" opacity="0.5" />
            <rect x="57" y="18" width="15" height="6" rx="3" fill={col} opacity="0.7" />
            <rect x="8" y="27" width="32" height="2.5" rx="1.25" fill="#374151" opacity="0.4" />
            <rect x="57" y="25" width="15" height="6" rx="3" fill={col} opacity="0.5" />
        </svg>
    ),
    'split-image-list': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="4" y="4" width="33" height="28" rx="3" fill="#f3eeff" stroke="#ddd6fe" strokeWidth="1" />
            <circle cx="20" cy="13" r="5" fill="#c4b5fd" opacity="0.6" />
            <path d="M4 26 Q14 20 37 24" stroke="#c4b5fd" strokeWidth="1.5" fill="none" />
            <rect x="8" y="7" width="24" height="2" rx="1" fill={col} opacity="0.3" />
            <rect x="42" y="6" width="30" height="3" rx="1.5" fill={col} opacity="0.85" />
            <rect x="42" y="13" width="5" height="4" rx="1" fill="#16a34a" opacity="0.8" /><rect x="50" y="14.5" width="24" height="2" rx="1" fill="#6b7280" opacity="0.6" />
            <rect x="42" y="20" width="5" height="4" rx="1" fill="#16a34a" opacity="0.8" /><rect x="50" y="21.5" width="20" height="2" rx="1" fill="#6b7280" opacity="0.5" />
            <rect x="42" y="27" width="5" height="4" rx="1" fill="#16a34a" opacity="0.8" /><rect x="50" y="28.5" width="22" height="2" rx="1" fill="#6b7280" opacity="0.4" />
        </svg>
    ),
    'split-list-image': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="4" y="6" width="30" height="3" rx="1.5" fill={col} opacity="0.85" />
            <rect x="4" y="13" width="5" height="4" rx="1" fill="#16a34a" opacity="0.8" /><rect x="12" y="14.5" width="24" height="2" rx="1" fill="#6b7280" opacity="0.6" />
            <rect x="4" y="20" width="5" height="4" rx="1" fill="#16a34a" opacity="0.8" /><rect x="12" y="21.5" width="20" height="2" rx="1" fill="#6b7280" opacity="0.5" />
            <rect x="4" y="27" width="5" height="4" rx="1" fill="#16a34a" opacity="0.8" /><rect x="12" y="28.5" width="22" height="2" rx="1" fill="#6b7280" opacity="0.4" />
            <rect x="43" y="4" width="33" height="28" rx="3" fill="#f3eeff" stroke="#ddd6fe" strokeWidth="1" />
            <circle cx="59" cy="13" r="5" fill="#c4b5fd" opacity="0.6" />
            <path d="M43 26 Q53 20 76 24" stroke="#c4b5fd" strokeWidth="1.5" fill="none" />
            <rect x="48" y="7" width="24" height="2" rx="1" fill={col} opacity="0.3" />
        </svg>
    ),
    'plain': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="8" y="8" width="40" height="4" rx="2" fill={col} opacity="0.9" />
            <rect x="8" y="15" width="64" height="2" rx="1" fill="#e5e7eb" />
            <rect x="8" y="20" width="64" height="2" rx="1" fill="#d1d5db" />
            <rect x="8" y="25" width="48" height="2" rx="1" fill="#d1d5db" />
        </svg>
    ),
    'accent-bar': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="0" y="0" width="4" height="36" rx="2" fill={col} />
            <rect x="10" y="8" width="36" height="4" rx="2" fill={col} opacity="0.9" />
            <rect x="10" y="17" width="58" height="2" rx="1" fill="#d1d5db" />
            <rect x="10" y="22" width="58" height="2" rx="1" fill="#d1d5db" />
            <rect x="10" y="27" width="40" height="2" rx="1" fill="#d1d5db" />
        </svg>
    ),
    'feature-box': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="4" y="5" width="20" height="7" rx="3" fill={col} opacity="0.15" stroke={col} strokeWidth="0.5" />
            <rect x="28" y="5" width="20" height="7" rx="3" fill={col} opacity="0.15" stroke={col} strokeWidth="0.5" />
            <rect x="52" y="5" width="20" height="7" rx="3" fill={col} opacity="0.15" stroke={col} strokeWidth="0.5" />
            <rect x="4" y="16" width="38" height="3" rx="1.5" fill={col} opacity="0.8" />
            <rect x="4" y="22" width="72" height="2" rx="1" fill="#d1d5db" />
            <rect x="4" y="27" width="60" height="2" rx="1" fill="#d1d5db" />
        </svg>
    ),
    'split-story': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="4" y="8" width="34" height="2" rx="1" fill="#d1d5db" />
            <rect x="4" y="13" width="30" height="2" rx="1" fill="#d1d5db" />
            <rect x="4" y="18" width="32" height="2" rx="1" fill="#d1d5db" />
            <rect x="4" y="23" width="28" height="2" rx="1" fill="#d1d5db" />
            <rect x="40" y="8" width="1" height="22" fill="#e5e7eb" />
            <rect x="44" y="8" width="30" height="2" rx="1" fill="#d1d5db" />
            <rect x="44" y="13" width="28" height="2" rx="1" fill="#d1d5db" />
            <rect x="44" y="18" width="30" height="2" rx="1" fill="#d1d5db" />
            <rect x="44" y="23" width="22" height="2" rx="1" fill="#d1d5db" />
            <rect x="4" y="4" width="72" height="2" rx="1" fill={col} opacity="0.8" />
        </svg>
    ),
    'card-elevated': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f3f4f6" />
            <rect x="4" y="4" width="72" height="28" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="10" y="9" width="36" height="4" rx="2" fill={col} opacity="0.85" />
            <rect x="10" y="15" width="2" height="12" rx="1" fill={col} />
            <rect x="10" y="17" width="56" height="2" rx="1" fill="#d1d5db" />
            <rect x="10" y="22" width="50" height="2" rx="1" fill="#d1d5db" />
            <rect x="10" y="27" width="40" height="2" rx="1" fill="#d1d5db" />
        </svg>
    ),
    // ── Banner: Split Image & Text ─────────────────────────────────────────────
    'split-image-text': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="32" height="36" rx="3" fill={col} opacity="0.3" />
            <rect x="36" y="8" width="38" height="6" rx="2" fill={col} opacity="0.9" />
            <rect x="36" y="18" width="30" height="3" rx="1.5" fill={col} opacity="0.6" />
        </svg>
    ),
    // ── Banner: Left + Badge ────────────────────────────────────────────────────
    'left-badge': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="52" height="36" rx="3" fill={col} opacity="0.7" />
            <rect x="52" width="28" height="36" fill={col} opacity="0.3" />
            <rect x="6" y="10" width="30" height="4" rx="2" fill="white" opacity="0.9" />
            <rect x="6" y="18" width="24" height="3" rx="1.5" fill="white" opacity="0.6" />
            <rect x="6" y="24" width="18" height="3" rx="1.5" fill="#b8fa33" opacity="0.8" />
        </svg>
    ),
    // ── Features: Simple Centered ──────────────────────────────────────────────
    'simple-centered': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={col} opacity="0.3" />
            <rect x="14" y="14" width="52" height="8" rx="2" fill="white" opacity="0.9" />
            <rect x="14" y="24" width="36" height="4" rx="1.5" fill="white" opacity="0.6" />
            <rect x="14" y="30" width="24" height="2" rx="1" fill="white" opacity="0.4" />
        </svg>
    ),
    // ── Features: Left + Badge ──────────────────────────────────────────────────
    'features-left-badge': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="60" height="36" rx="3" fill={col} opacity="0.5" />
            <rect x="60" width="20" height="36" fill={col} opacity="0.3" />
            <rect x="8" y="12" width="40" height="4" rx="2" fill="white" opacity="0.9" />
            <rect x="8" y="20" width="32" height="3" rx="1.5" fill="white" opacity="0.6" />
            <rect x="8" y="26" width="24" height="2.5" rx="1.25" fill="#b8fa33" opacity="0.7" />
        </svg>
    ),
    'split': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="52" height="36" rx="3" fill={col} opacity="0.7" />
            <rect x="52" width="28" height="36" fill={col} opacity="0.3" />
            <rect x="6" y="10" width="30" height="4" rx="2" fill="white" opacity="0.9" />
            <rect x="6" y="18" width="24" height="3" rx="1.5" fill="white" opacity="0.6" />
            <rect x="56" y="10" width="18" height="3" rx="1.5" fill="white" opacity="0.6" />
            <rect x="56" y="16" width="14" height="2.5" rx="1.25" fill="white" opacity="0.4" />
            <rect x="56" y="22" width="16" height="2.5" rx="1.25" fill="white" opacity="0.4" />
        </svg>
    ),
    // ── Product Image — split-right (text left, image right) ──────────────────
    // Mirrors the split thumbnail: text column on the left, image on the right.
    'split-right': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="28" height="36" fill={col} opacity="0.3" />
            <rect x="28" width="52" height="36" rx="3" fill={col} opacity="0.7" />
            <rect x="6" y="10" width="18" height="3" rx="1.5" fill="white" opacity="0.6" />
            <rect x="6" y="16" width="14" height="2.5" rx="1.25" fill="white" opacity="0.4" />
            <rect x="6" y="22" width="16" height="2.5" rx="1.25" fill="white" opacity="0.4" />
            <rect x="44" y="10" width="30" height="4" rx="2" fill="white" opacity="0.9" />
            <rect x="50" y="18" width="24" height="3" rx="1.5" fill="white" opacity="0.6" />
        </svg>
    ),
    // ── Product Image ─────────────────────────────────────────────────────────
    'single': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="20" y="3" width="40" height="30" rx="4" fill={col} opacity="0.18" stroke={col} strokeWidth="0.8" strokeDasharray="2.5 1.5" />
            <circle cx="34" cy="13" r="4" fill={col} opacity="0.35" />
            <path d="M20 28 L30 20 L38 25 L46 18 L60 28Z" fill={col} opacity="0.25" />
            <text x="40" y="36" textAnchor="middle" fontFamily="Arial" fontSize="5" fill={col} opacity="0.5">Single</text>
        </svg>
    ),
    'gallery': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            {/* Large main image left */}
            <rect x="2" y="2" width="44" height="32" rx="3" fill={col} opacity="0.18" stroke={col} strokeWidth="0.7" strokeDasharray="2 1.5" />
            <circle cx="16" cy="12" r="5" fill={col} opacity="0.3" />
            <path d="M2 28 L12 20 L22 24 L32 18 L46 28Z" fill={col} opacity="0.2" />
            {/* 4 thumbs right stacked 2x2 */}
            <rect x="48" y="2" width="14" height="14" rx="2" fill={col} opacity="0.28" stroke={col} strokeWidth="0.5" />
            <rect x="64" y="2" width="14" height="14" rx="2" fill={col} opacity="0.18" stroke={col} strokeWidth="0.5" />
            <rect x="48" y="18" width="14" height="16" rx="2" fill={col} opacity="0.18" stroke={col} strokeWidth="0.5" />
            <rect x="64" y="18" width="14" height="16" rx="2" fill={col} opacity="0.28" stroke={col} strokeWidth="0.5" />
        </svg>
    ),
    'fullwidth': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={col} opacity="0.12" stroke={col} strokeWidth="0.8" strokeDasharray="2.5 1.5" />
            <circle cx="28" cy="14" r="6" fill={col} opacity="0.3" />
            <path d="M0 28 L14 18 L28 24 L44 16 L60 22 L80 14 L80 36 L0 36Z" fill={col} opacity="0.2" />
        </svg>
    ),
    'full-width-hero': (col, _) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 48 }}>
            <rect width="80" height="48" rx="8" fill={col} opacity="0.3" />
            <rect x="5" y="10" width="70" height="28" rx="4" fill="white" opacity="0.2" />
        </svg>
    ),
    'zoom': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="8" y="3" width="64" height="30" rx="4" fill={col} opacity="0.15" stroke={col} strokeWidth="0.8" strokeDasharray="2.5 1.5" />
            <circle cx="30" cy="13" r="5" fill={col} opacity="0.3" />
            <path d="M8 28 L22 19 L32 24 L44 17 L72 28Z" fill={col} opacity="0.2" />
            {/* Zoom magnifier icon */}
            <circle cx="62" cy="11" r="5" stroke={col} strokeWidth="1.2" fill="none" opacity="0.6" />
            <line x1="66" y1="15" x2="70" y2="19" stroke={col} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        </svg>
    ),
    // ── Product Image: Comparison / Front & Back ──────────────────────────────
    'comparison': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="2" y="2" width="36" height="32" rx="3" fill={col} opacity="0.18" stroke={col} strokeWidth="0.7" strokeDasharray="2 1.5" />
            <circle cx="14" cy="12" r="5" fill={col} opacity="0.3" />
            <path d="M2 28 L12 20 L22 25 L38 18 L38 32 L2 32Z" fill={col} opacity="0.2" />
            <rect x="39" y="2" width="1.5" height="32" fill={col} opacity="0.3" />
            <rect x="42" y="2" width="36" height="32" rx="3" fill={col} opacity="0.12" stroke={col} strokeWidth="0.7" strokeDasharray="2 1.5" />
            <circle cx="54" cy="12" r="5" fill={col} opacity="0.22" />
            <path d="M42 28 L52 21 L62 26 L78 19 L78 32 L42 32Z" fill={col} opacity="0.15" />
        </svg>
    ),
    // ── Hero Header: Credibility Banner ──────────────────────────────────────
    'credibility': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={col} opacity="0.85" />
            <rect x="0" y="0" width="30" height="36" fill="rgba(0,0,0,0.15)" />
            <rect x="4" y="9" width="22" height="4" rx="2" fill="#f59e0b" opacity="0.9" />
            <rect x="4" y="17" width="18" height="2.5" rx="1.25" fill="white" opacity="0.7" />
            <rect x="4" y="23" width="14" height="5" rx="2.5" fill="#f59e0b" opacity="0.8" />
            <rect x="36" y="10" width="36" height="5" rx="2" fill="white" opacity="0.9" />
            <rect x="36" y="19" width="28" height="2.5" rx="1.25" fill="white" opacity="0.5" />
            <rect x="36" y="25" width="22" height="2" rx="1" fill="white" opacity="0.4" />
        </svg>
    ),
    // ── Product Image: Lifestyle Shot ─────────────────────────────────────────
    'lifestyle': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={col} opacity="0.12" stroke={col} strokeWidth="0.8" strokeDasharray="2.5 1.5" />
            <circle cx="28" cy="13" r="7" fill={col} opacity="0.28" />
            <path d="M0 26 L16 17 L28 22 L44 14 L60 20 L80 12 L80 36 L0 36Z" fill={col} opacity="0.22" />
            <rect x="0" y="26" width="80" height="10" rx="0" fill={col} opacity="0.3" />
            <rect x="6" y="28" width="32" height="3" rx="1.5" fill="white" opacity="0.7" />
        </svg>
    ),
    // ── Product Image: Polaroid ───────────────────────────────────────────────
    'polaroid': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect x="10" y="1" width="60" height="34" rx="2" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="13" y="4" width="54" height="22" rx="2" fill={col} opacity="0.18" stroke={col} strokeWidth="0.6" strokeDasharray="2 1.5" />
            <circle cx="26" cy="13" r="5" fill={col} opacity="0.3" />
            <path d="M13 22 L24 15 L34 19 L46 13 L67 22Z" fill={col} opacity="0.2" />
            <rect x="22" y="29" width="36" height="3" rx="1.5" fill="#9ca3af" opacity="0.7" />
        </svg>
    ),
    // ── Product Image: Before/After ───────────────────────────────────────────
    'before-after': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="2" y="2" width="35" height="28" rx="3" fill={col} opacity="0.18" stroke={col} strokeWidth="0.7" strokeDasharray="2 1.5" />
            <circle cx="13" cy="11" r="5" fill={col} opacity="0.28" />
            <path d="M2 24 L12 17 L22 21 L37 15 L37 28 L2 28Z" fill={col} opacity="0.18" />
            <rect x="3" y="31" width="20" height="3" rx="1.5" fill={col} opacity="0.4" />
            <rect x="38" y="2" width="1.5" height="28" fill={col} opacity="0.4" />
            <rect x="41" y="2" width="37" height="28" rx="3" fill={col} opacity="0.28" stroke={col} strokeWidth="0.7" strokeDasharray="2 1.5" />
            <circle cx="52" cy="11" r="5" fill={col} opacity="0.38" />
            <path d="M41 24 L52 16 L62 21 L78 14 L78 28 L41 28Z" fill={col} opacity="0.25" />
            <rect x="47" y="31" width="20" height="3" rx="1.5" fill={col} opacity="0.55" />
        </svg>
    ),
    // ── Product Image: Magazine Grid ──────────────────────────────────────────
    'magazine': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            {/* Large left hero */}
            <rect x="2" y="2" width="46" height="32" rx="3" fill={col} opacity="0.18" stroke={col} strokeWidth="0.7" strokeDasharray="2 1.5" />
            <circle cx="16" cy="13" r="6" fill={col} opacity="0.3" />
            <path d="M2 28 L14 20 L26 25 L38 17 L48 26 L48 32 L2 32Z" fill={col} opacity="0.2" />
            {/* Two stacked right thumbs */}
            <rect x="51" y="2" width="27" height="14" rx="3" fill={col} opacity="0.28" stroke={col} strokeWidth="0.6" strokeDasharray="2 1.5" />
            <circle cx="60" cy="8" r="3" fill={col} opacity="0.35" />
            <rect x="51" y="18" width="27" height="16" rx="3" fill={col} opacity="0.18" stroke={col} strokeWidth="0.6" strokeDasharray="2 1.5" />
            <circle cx="60" cy="25" r="3" fill={col} opacity="0.25" />
        </svg>
    ),
    // ── Product Image: Inverted Magazine Grid ─────────────────────────────────
    'inverted-magazine-grid': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            {/* Two stacked left thumbs */}
            <rect x="2" y="2" width="27" height="14" rx="3" fill={col} opacity="0.28" stroke={col} strokeWidth="0.6" strokeDasharray="2 1.5" />
            <circle cx="11" cy="8" r="3" fill={col} opacity="0.35" />
            <rect x="2" y="18" width="27" height="16" rx="3" fill={col} opacity="0.18" stroke={col} strokeWidth="0.6" strokeDasharray="2 1.5" />
            <circle cx="11" cy="25" r="3" fill={col} opacity="0.25" />
            {/* Large right hero */}
            <rect x="32" y="2" width="46" height="32" rx="3" fill={col} opacity="0.18" stroke={col} strokeWidth="0.7" strokeDasharray="2 1.5" />
            <circle cx="54" cy="13" r="6" fill={col} opacity="0.3" />
            <path d="M32 28 L44 20 L56 25 L68 17 L78 24 L78 32 L32 32Z" fill={col} opacity="0.2" />
        </svg>
    ),
    // ── Hero Header: Announcement Strip ──────────────────────────────────────
    'announcement': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={col} opacity="0.85" />
            <rect x="10" y="15" width="60" height="4" rx="2" fill="white" opacity="0.9" />
            <circle cx="36" cy="17" r="1.5" fill={col} opacity="0.6" />
            <circle cx="44" cy="17" r="1.5" fill={col} opacity="0.6" />
        </svg>
    ),
    // ── Hero Header: Dark Luxury ──────────────────────────────────────────────
    'luxury': (_, __) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#000000" />
            <rect x="32" y="7" width="16" height="1" fill="#c9a84c" />
            <rect x="14" y="13" width="52" height="6" rx="2" fill="white" opacity="0.9" />
            <rect x="32" y="22" width="16" height="1" fill="#c9a84c" />
            <rect x="20" y="26" width="40" height="2.5" rx="1.25" fill="#c9a84c" opacity="0.7" />
        </svg>
    ),
    // ── Hero Header: Category Banner ─────────────────────────────────────────
    'category': (col, light) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} stroke="#e5e7eb" strokeWidth="1" />
            <rect x="0" y="0" width="5" height="36" rx="2" fill={col} />
            <rect x="10" y="10" width="35" height="5" rx="2" fill={col} opacity="0.8" />
            <rect x="10" y="19" width="26" height="3" rx="1.5" fill="#9ca3af" />
            <rect x="54" y="12" width="20" height="10" rx="4" fill={col} opacity="0.85" />
            <rect x="56" y="15" width="16" height="4" rx="2" fill="white" opacity="0.9" />
        </svg>
    ),
    // ── Hero Header: Seasonal / Sale ─────────────────────────────────────────
    'seasonal': (col, _) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#1e1535" />
            <rect x="4" y="6" width="22" height="24" rx="5" fill="#dc2626" />
            <rect x="7" y="14" width="16" height="6" rx="2" fill="white" opacity="0.95" />
            <rect x="32" y="11" width="40" height="5" rx="2" fill="white" opacity="0.9" />
            <rect x="32" y="20" width="30" height="3" rx="1.5" fill="white" opacity="0.5" />
        </svg>
    ),

    // ── Price Block ───────────────────────────────────────────────────────────
    'simple': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="6" y="12" width="44" height="12" rx="3" fill={col} opacity="0.85" />
        </svg>
    ),
    'sale': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="6" y="11" width="34" height="10" rx="3" fill="#dc2626" opacity="0.8" />
            <rect x="44" y="13" width="18" height="1" fill="#9ca3af" opacity="0.8" />
            <rect x="56" y="9" width="18" height="10" rx="4" fill="#b8fa33" />
            <rect x="58" y="12.5" width="14" height="3" rx="1.5" fill="#1e1535" opacity="0.7" />
        </svg>
    ),
    'urgency': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="6" y="7" width="44" height="14" rx="3" fill={col} opacity="0.8" />
            <rect x="0" y="25" width="80" height="11" fill="#fef2f2" />
            <circle cx="10" cy="30.5" r="2.5" fill="#ef4444" opacity="0.8" />
            <rect x="16" y="28.5" width="44" height="4" rx="2" fill="#ef4444" opacity="0.5" />
        </svg>
    ),
    'compact': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="4" y="14" width="28" height="8" rx="2" fill={col} opacity="0.85" />
            <rect x="50" y="14" width="24" height="3" rx="1.5" fill="#6b7280" opacity="0.5" />
            <rect x="50" y="20" width="18" height="2.5" rx="1.25" fill="#9ca3af" opacity="0.4" />
        </svg>
    ),
    'range': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="6" y="14" width="66" height="10" rx="3" fill={col} opacity="0.8" />
            <rect x="6" y="28" width="44" height="3" rx="1.5" fill="#9ca3af" opacity="0.4" />
        </svg>
    ),
    'auction': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="6" y="13" width="36" height="9" rx="3" fill={col} opacity="0.85" />
            <rect x="4" y="26" width="72" height="1" fill="#e5e7eb" />
            <rect x="6" y="29" width="28" height="3" rx="1.5" fill="#9ca3af" opacity="0.5" />
            <rect x="54" y="29" width="20" height="3" rx="1.5" fill="#ef4444" opacity="0.5" />
        </svg>
    ),
    'bundle': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="4" y="4" width="72" height="7" rx="2" fill={col} opacity="0.8" />
            <rect x="4" y="13" width="72" height="6" fill="white" />
            <rect x="4" y="19" width="72" height="6" fill={light} />
            <rect x="4" y="25" width="72" height="6" fill="white" />
            <rect x="36" y="15" width="20" height="2.5" rx="1.25" fill={col} opacity="0.7" />
            <rect x="36" y="21" width="20" height="2.5" rx="1.25" fill={col} opacity="0.7" />
        </svg>
    ),
    'finance': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="6" y="14" width="38" height="10" rx="3" fill={col} opacity="0.85" />
            <rect x="56" y="9" width="18" height="18" rx="4" fill={col} opacity="0.7" />
            <rect x="58" y="14" width="14" height="4" rx="2" fill="white" opacity="0.9" />
        </svg>
    ),
    'trade': (_col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#1e293b" />
            <rect x="6" y="13" width="36" height="9" rx="3" fill="white" opacity="0.9" />
            <rect x="50" y="10" width="24" height="16" rx="4" fill="#1e3a5f" />
            <rect x="53" y="15" width="18" height="3" rx="1.5" fill="#94a3b8" opacity="0.7" />
        </svg>
    ),
    'free-shipping': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="6" y="10" width="36" height="12" rx="3" fill={col} opacity="0.85" />
            <rect x="50" y="7" width="25" height="22" rx="5" fill="#16a34a" />
            <rect x="52" y="13" width="21" height="4" rx="2" fill="white" opacity="0.95" />
            <rect x="54" y="19" width="17" height="3" rx="1.5" fill="white" opacity="0.7" />
        </svg>
    ),

    // ── Trust Badges ─────────────────────────────────────────────────────────
    'row': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="4" y="10" width="16" height="16" rx="3" fill={col} opacity="0.3" />
            <rect x="22" y="10" width="16" height="16" rx="3" fill={col} opacity="0.3" />
            <rect x="40" y="10" width="16" height="16" rx="3" fill={col} opacity="0.3" />
            <rect x="58" y="10" width="16" height="16" rx="3" fill={col} opacity="0.3" />
            <circle cx="12" cy="15" r="4" fill={col} opacity="0.6" />
            <circle cx="30" cy="15" r="4" fill={col} opacity="0.6" />
            <circle cx="48" cy="15" r="4" fill={col} opacity="0.6" />
            <circle cx="66" cy="15" r="4" fill={col} opacity="0.6" />
        </svg>
    ),
    'grid': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="3" y="3" width="35" height="14" rx="3" fill={col} opacity="0.25" />
            <rect x="42" y="3" width="35" height="14" rx="3" fill={col} opacity="0.25" />
            <rect x="3" y="19" width="35" height="14" rx="3" fill={col} opacity="0.25" />
            <rect x="42" y="19" width="35" height="14" rx="3" fill={col} opacity="0.25" />
            <circle cx="11" cy="10" r="3" fill={col} opacity="0.6" />
            <circle cx="50" cy="10" r="3" fill={col} opacity="0.6" />
            <circle cx="11" cy="26" r="3" fill={col} opacity="0.6" />
            <circle cx="50" cy="26" r="3" fill={col} opacity="0.6" />
        </svg>
    ),
    'strip': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="10" cy="18" r="3" fill={col} opacity="0.7" />
            <rect x="15" y="15.5" width="10" height="5" rx="2.5" fill={col} opacity="0.4" />
            <rect x="29" y="17" width="1" height="2" fill="#e5e7eb" />
            <circle cx="35" cy="18" r="3" fill={col} opacity="0.7" />
            <rect x="40" y="15.5" width="10" height="5" rx="2.5" fill={col} opacity="0.4" />
            <rect x="54" y="17" width="1" height="2" fill="#e5e7eb" />
            <circle cx="60" cy="18" r="3" fill={col} opacity="0.7" />
            <rect x="65" y="15.5" width="10" height="5" rx="2.5" fill={col} opacity="0.4" />
        </svg>
    ),
    'icon-only': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <circle cx="12" cy="15" r="7" fill={col} opacity="0.2" stroke={col} strokeWidth="1" />
            <circle cx="12" cy="15" r="3" fill={col} opacity="0.5" />
            <circle cx="32" cy="15" r="7" fill={col} opacity="0.2" stroke={col} strokeWidth="1" />
            <circle cx="32" cy="15" r="3" fill={col} opacity="0.5" />
            <circle cx="52" cy="15" r="7" fill={col} opacity="0.2" stroke={col} strokeWidth="1" />
            <circle cx="52" cy="15" r="3" fill={col} opacity="0.5" />
            <circle cx="70" cy="15" r="7" fill={col} opacity="0.2" stroke={col} strokeWidth="1" />
            <circle cx="70" cy="15" r="3" fill={col} opacity="0.5" />
        </svg>
    ),
    'text-only': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="3" y="12" width="16" height="12" rx="6" fill={col} opacity="0.2" stroke={col} strokeWidth="1" />
            <rect x="22" y="12" width="20" height="12" rx="6" fill={col} opacity="0.2" stroke={col} strokeWidth="1" />
            <rect x="45" y="12" width="14" height="12" rx="6" fill={col} opacity="0.2" stroke={col} strokeWidth="1" />
            <rect x="62" y="12" width="15" height="12" rx="6" fill={col} opacity="0.2" stroke={col} strokeWidth="1" />
        </svg>
    ),

    // ── Nav Bar ───────────────────────────────────────────────────────────────
    'dark': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#1e293b" />
            <rect x="8" y="15" width="10" height="3" rx="1.5" fill="white" opacity="0.6" />
            <rect x="22" y="15" width="14" height="3" rx="1.5" fill="white" opacity="0.6" />
            <rect x="40" y="15" width="10" height="3" rx="1.5" fill="white" opacity="0.6" />
            <rect x="54" y="15" width="12" height="3" rx="1.5" fill="white" opacity="0.6" />
        </svg>
    ),
    'light': (_col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="8" y="15" width="10" height="3" rx="1.5" fill="#374151" opacity="0.7" />
            <rect x="22" y="15" width="14" height="3" rx="1.5" fill="#374151" opacity="0.7" />
            <rect x="40" y="15" width="10" height="3" rx="1.5" fill="#374151" opacity="0.7" />
            <rect x="54" y="15" width="12" height="3" rx="1.5" fill="#374151" opacity="0.7" />
        </svg>
    ),
    'underline': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="8" y="14" width="10" height="3" rx="1.5" fill={col} opacity="0.9" />
            <rect x="8" y="20" width="10" height="2" rx="1" fill={col} />
            <rect x="22" y="14" width="14" height="3" rx="1.5" fill="#374151" opacity="0.5" />
            <rect x="40" y="14" width="10" height="3" rx="1.5" fill="#374151" opacity="0.5" />
            <rect x="54" y="14" width="12" height="3" rx="1.5" fill="#374151" opacity="0.5" />
        </svg>
    ),
    'pills': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="4" y="12" width="16" height="12" rx="6" fill={col} opacity="0.85" />
            <rect x="23" y="12" width="20" height="12" rx="6" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="46" y="12" width="14" height="12" rx="6" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="63" y="12" width="14" height="12" rx="6" fill="white" stroke="#e5e7eb" strokeWidth="1" />
        </svg>
    ),
    'centered': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#1e293b" />
            <rect x="26" y="7" width="28" height="5" rx="2" fill="white" opacity="0.9" />
            <rect x="8" y="22" width="10" height="3" rx="1.5" fill="white" opacity="0.5" />
            <rect x="22" y="22" width="14" height="3" rx="1.5" fill="white" opacity="0.5" />
            <rect x="40" y="22" width="10" height="3" rx="1.5" fill="white" opacity="0.5" />
            <rect x="54" y="22" width="12" height="3" rx="1.5" fill="white" opacity="0.5" />
        </svg>
    ),
    'left-aligned': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#1e293b" />
            <rect x="6" y="14" width="20" height="5" rx="2" fill="white" opacity="0.9" />
            <rect x="42" y="15" width="10" height="3" rx="1.5" fill="white" opacity="0.5" />
            <rect x="55" y="15" width="10" height="3" rx="1.5" fill="white" opacity="0.5" />
            <rect x="68" y="15" width="8" height="3" rx="1.5" fill="white" opacity="0.5" />
        </svg>
    ),
    'tabs': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f8fafc" />
            <line x1="0" y1="30" x2="80" y2="30" stroke="#cbd5e1" strokeWidth="1" />
            {/* Active Tab */}
            <rect x="4" y="12" width="20" height="18" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="4" y="12" width="20" height="2.5" fill={col} />
            <rect x="8" y="18" width="12" height="3" rx="1" fill={col} />
            {/* Tab 2 */}
            <rect x="27" y="15" width="16" height="3" rx="1.5" fill="#64748b" opacity="0.7" />
            <line x1="46" y1="14" x2="46" y2="24" stroke="#e2e8f0" strokeWidth="0.8" />
            {/* Tab 3 */}
            <rect x="50" y="15" width="14" height="3" rx="1.5" fill="#64748b" opacity="0.7" />
            <line x1="67" y1="14" x2="67" y2="24" stroke="#e2e8f0" strokeWidth="0.8" />
            {/* Tab 4 */}
            <rect x="70" y="15" width="8" height="3" rx="1.5" fill="#64748b" opacity="0.7" />
        </svg>
    ),
    'boxed_tiles': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#ffffff" />
            {/* Tile 1 with accent dot */}
            <rect x="3" y="10" width="18" height="16" rx="3" fill="#f8fafc" stroke={col} strokeWidth="1" />
            <circle cx="7" cy="18" r="1.5" fill={col} />
            <rect x="10" y="16.5" width="8" height="3" rx="1" fill="#1e293b" />
            {/* Tile 2 */}
            <rect x="23" y="10" width="17" height="16" rx="3" fill="white" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="26" y="16.5" width="11" height="3" rx="1" fill="#475569" />
            {/* Tile 3 */}
            <rect x="42" y="10" width="17" height="16" rx="3" fill="white" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="45" y="16.5" width="11" height="3" rx="1" fill="#475569" />
            {/* Tile 4 */}
            <rect x="61" y="10" width="16" height="16" rx="3" fill="white" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="64" y="16.5" width="10" height="3" rx="1" fill="#475569" />
        </svg>
    ),
    'brand_ribbon': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#0f172a" />
            {/* Top brand accent stripe */}
            <rect x="0" y="0" width="80" height="3" fill={col} />
            {/* Item 1 with subtle pill highlight */}
            <rect x="4" y="10" width="17" height="16" rx="2" fill="white" opacity="0.1" />
            <rect x="7" y="16.5" width="11" height="3" rx="1" fill="white" opacity="0.95" />
            {/* Item 2 */}
            <rect x="25" y="16.5" width="14" height="3" rx="1" fill="white" opacity="0.65" />
            {/* Item 3 */}
            <rect x="43" y="16.5" width="15" height="3" rx="1" fill="white" opacity="0.65" />
            {/* Item 4 */}
            <rect x="62" y="16.5" width="14" height="3" rx="1" fill="white" opacity="0.65" />
        </svg>
    ),
    'minimal_bullet': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" />
            {/* Double hairline borders top and bottom */}
            <line x1="0" y1="4" x2="80" y2="4" stroke="#e4e4e7" strokeWidth="0.8" />
            <line x1="0" y1="32" x2="80" y2="32" stroke="#e4e4e7" strokeWidth="0.8" />
            {/* Links separated by bullet dots */}
            <rect x="5" y="16.5" width="12" height="3" rx="1" fill="#18181b" />
            <circle cx="21" cy="18" r="1.2" fill={col} />
            <rect x="26" y="16.5" width="13" height="3" rx="1" fill="#18181b" />
            <circle cx="43" cy="18" r="1.2" fill={col} />
            <rect x="48" y="16.5" width="12" height="3" rx="1" fill="#18181b" />
            <circle cx="64" cy="18" r="1.2" fill={col} />
            <rect x="69" y="16.5" width="8" height="3" rx="1" fill="#18181b" />
        </svg>
    ),
    // ── Specs Table ───────────────────────────────────────────────────────────
    'full': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="0" y="0" width="80" height="8" rx="3" fill={col} opacity="0.8" />
            <rect x="0" y="10" width="30" height="4" rx="1" fill="#9ca3af" opacity="0.5" />
            <rect x="32" y="10" width="40" height="4" rx="1" fill="#6b7280" opacity="0.4" />
            <rect x="0" y="17" width="30" height="4" rx="1" fill="#9ca3af" opacity="0.5" />
            <rect x="32" y="17" width="35" height="4" rx="1" fill="#6b7280" opacity="0.4" />
            <rect x="0" y="24" width="30" height="4" rx="1" fill="#9ca3af" opacity="0.5" />
            <rect x="32" y="24" width="38" height="4" rx="1" fill="#6b7280" opacity="0.4" />
        </svg>
    ),
    'two-column': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="0" y="0" width="80" height="8" rx="3" fill={col} opacity="0.8" />
            <rect x="2" y="11" width="16" height="3" rx="1" fill="#9ca3af" opacity="0.5" />
            <rect x="20" y="11" width="16" height="3" rx="1" fill="#6b7280" opacity="0.4" />
            <rect x="42" y="11" width="16" height="3" rx="1" fill="#9ca3af" opacity="0.5" />
            <rect x="60" y="11" width="16" height="3" rx="1" fill="#6b7280" opacity="0.4" />
            <rect x="2" y="17" width="16" height="3" rx="1" fill="#9ca3af" opacity="0.5" />
            <rect x="20" y="17" width="14" height="3" rx="1" fill="#6b7280" opacity="0.4" />
            <rect x="42" y="17" width="16" height="3" rx="1" fill="#9ca3af" opacity="0.5" />
            <rect x="60" y="17" width="12" height="3" rx="1" fill="#6b7280" opacity="0.4" />
            <rect x="38" y="8" width="2" height="28" fill="#e5e7eb" />
        </svg>
    ), 'zebra': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" />
            <rect x="0" y="0" width="80" height="6" rx="3" fill="white" />
            <rect x="2" y="1" width="30" height="4" rx="1" fill={col} opacity="0.8" />
            <rect x="0" y="8" width="80" height="7" fill="#f5f3ff" />
            <rect x="0" y="15" width="80" height="7" fill="white" />
            <rect x="0" y="22" width="80" height="7" fill="#f5f3ff" />
            <rect x="0" y="29" width="80" height="7" fill="white" />
            <rect x="2" y="10" width="22" height="3" rx="1" fill={col} opacity="0.5" />
            <rect x="2" y="17" width="22" height="3" rx="1" fill={col} opacity="0.5" />
            <rect x="2" y="24" width="22" height="3" rx="1" fill={col} opacity="0.5" />
        </svg>
    ),
    'card': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="2" y="4" width="36" height="12" rx="3" fill="white" stroke="#ede9fe" strokeWidth="1" />
            <rect x="2" y="20" width="36" height="12" rx="3" fill="white" stroke="#ede9fe" strokeWidth="1" />
            <rect x="42" y="4" width="36" height="12" rx="3" fill="white" stroke="#ede9fe" strokeWidth="1" />
            <rect x="42" y="20" width="36" height="12" rx="3" fill="white" stroke="#ede9fe" strokeWidth="1" />
            <rect x="5" y="7" width="14" height="2.5" rx="1" fill={col} opacity="0.7" />
            <rect x="5" y="11" width="20" height="2.5" rx="1" fill="#374151" opacity="0.5" />
            <rect x="5" y="23" width="14" height="2.5" rx="1" fill={col} opacity="0.7" />
            <rect x="5" y="27" width="18" height="2.5" rx="1" fill="#374151" opacity="0.5" />
        </svg>
    ),
    'highlighted': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill={light} />
            <rect x="0" y="0" width="80" height="9" rx="3" fill={col} opacity="0.9" />
            <rect x="6" y="2.5" width="20" height="4" rx="1" fill="white" opacity="0.9" />
            <rect x="0" y="11" width="30" height="5" rx="0" fill="#f9fafb" />
            <rect x="2" y="12.5" width="18" height="2" rx="1" fill="#6b7280" opacity="0.6" />
            <rect x="32" y="12.5" width="28" height="2" rx="1" fill="#4b5563" opacity="0.5" />
            <rect x="0" y="18" width="30" height="5" rx="0" fill="#f9fafb" />
            <rect x="2" y="19.5" width="18" height="2" rx="1" fill="#6b7280" opacity="0.6" />
            <rect x="32" y="19.5" width="24" height="2" rx="1" fill="#4b5563" opacity="0.5" />
            <rect x="0" y="25" width="30" height="5" rx="0" fill="#f9fafb" />
            <rect x="2" y="26.5" width="18" height="2" rx="1" fill="#6b7280" opacity="0.6" />
            <rect x="32" y="26.5" width="30" height="2" rx="1" fill="#4b5563" opacity="0.5" />
        </svg>
    ),
    // ── Policy Tabs ───────────────────────────────────────────────────────────
    'tabbed': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            {/* Top Tab Bar */}
            <rect x="3" y="3" width="16" height="6" rx="1.5" fill={col} opacity="0.9" />
            <rect x="21" y="3" width="16" height="6" rx="1.5" fill="#f3f4f6" />
            <rect x="39" y="3" width="16" height="6" rx="1.5" fill="#f3f4f6" />
            <rect x="57" y="3" width="16" height="6" rx="1.5" fill="#f3f4f6" />
            {/* Live Policy Panel 1 */}
            <rect x="3" y="11" width="74" height="10" rx="1.5" fill={light} />
            <rect x="6" y="13.5" width="18" height="2" rx="1" fill={col} opacity="0.85" />
            <rect x="6" y="17" width="60" height="1.8" rx="0.9" fill="#64748b" opacity="0.7" />
            {/* Live Policy Panel 2 */}
            <rect x="3" y="23" width="74" height="10" rx="1.5" fill="#f8fafc" stroke="#e5e7eb" strokeWidth="0.8" />
            <rect x="6" y="25.5" width="16" height="2" rx="1" fill={col} opacity="0.6" />
            <rect x="6" y="29" width="54" height="1.8" rx="0.9" fill="#94a3b8" opacity="0.7" />
        </svg>
    ),
    'stacked': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            {/* Stacked Row 1 */}
            <rect x="3" y="3" width="74" height="9" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="5" y="4.5" width="2" height="6" rx="1" fill={col} />
            <rect x="9" y="5" width="18" height="2" rx="1" fill={col} opacity="0.9" />
            <rect x="9" y="8.5" width="56" height="1.8" rx="0.9" fill="#94a3b8" opacity="0.8" />
            {/* Stacked Row 2 */}
            <rect x="3" y="14" width="74" height="9" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="5" y="15.5" width="2" height="6" rx="1" fill={col} />
            <rect x="9" y="16" width="16" height="2" rx="1" fill={col} opacity="0.9" />
            <rect x="9" y="19.5" width="52" height="1.8" rx="0.9" fill="#94a3b8" opacity="0.8" />
            {/* Stacked Row 3 */}
            <rect x="3" y="25" width="74" height="8" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="5" y="26.5" width="2" height="5" rx="1" fill={col} />
            <rect x="9" y="27" width="15" height="2" rx="1" fill={col} opacity="0.9" />
            <rect x="9" y="30" width="48" height="1.8" rx="0.9" fill="#94a3b8" opacity="0.8" />
        </svg>
    ),
    'accordion': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            {/* Open Panel 1 (No Click Needed) */}
            <rect x="3" y="3" width="74" height="6" rx="1.5" fill={light} />
            <rect x="6" y="5" width="18" height="2" rx="1" fill={col} opacity="0.9" />
            <circle cx="73" cy="6" r="1.2" fill={col} />
            <rect x="3" y="9" width="74" height="7" fill="white" stroke="#e5e7eb" strokeWidth="0.8" />
            <rect x="6" y="11" width="62" height="1.6" rx="0.8" fill="#64748b" opacity="0.8" />
            <rect x="6" y="13.5" width="48" height="1.6" rx="0.8" fill="#94a3b8" opacity="0.8" />
            {/* Open Panel 2 (No Click Needed) */}
            <rect x="3" y="18" width="74" height="6" rx="1.5" fill={light} />
            <rect x="6" y="20" width="16" height="2" rx="1" fill={col} opacity="0.9" />
            <circle cx="73" cy="21" r="1.2" fill={col} />
            <rect x="3" y="24" width="74" height="7" fill="white" stroke="#e5e7eb" strokeWidth="0.8" />
            <rect x="6" y="26" width="60" height="1.6" rx="0.8" fill="#64748b" opacity="0.8" />
            <rect x="6" y="28.5" width="44" height="1.6" rx="0.8" fill="#94a3b8" opacity="0.8" />
        </svg>
    ),
    'simple-thumb': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="4" y="4" width="72" height="12" rx="2" fill={light} />
            <rect x="8" y="7" width="22" height="2.5" rx="1" fill={col} opacity="0.9" />
            <rect x="8" y="11" width="56" height="2" rx="1" fill="#64748b" opacity="0.7" />
            <rect x="4" y="19" width="72" height="13" rx="2" fill="#f8fafc" stroke="#e5e7eb" strokeWidth="0.8" />
            <rect x="8" y="22" width="18" height="2.5" rx="1" fill={col} opacity="0.7" />
            <rect x="8" y="26" width="50" height="2" rx="1" fill="#94a3b8" opacity="0.7" />
        </svg>
    ),
    'side-nav': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            {/* Left Nav Strip */}
            <rect x="2" y="2" width="20" height="32" rx="2" fill="#f8fafc" />
            <rect x="4" y="4" width="16" height="5" rx="1" fill={col} opacity="0.9" />
            <rect x="4" y="11" width="16" height="5" rx="1" fill="#e5e7eb" />
            <rect x="4" y="18" width="16" height="5" rx="1" fill="#e5e7eb" />
            <rect x="4" y="25" width="16" height="5" rx="1" fill="#e5e7eb" />
            {/* Right Open Panels */}
            <rect x="25" y="3" width="52" height="14" rx="1.5" fill={light} />
            <rect x="28" y="5.5" width="16" height="2" rx="1" fill={col} opacity="0.9" />
            <rect x="28" y="9" width="44" height="1.8" rx="0.9" fill="#64748b" opacity="0.8" />
            <rect x="28" y="12" width="36" height="1.8" rx="0.9" fill="#94a3b8" opacity="0.7" />
            <rect x="25" y="19" width="52" height="14" rx="1.5" fill="#f8fafc" stroke="#e5e7eb" strokeWidth="0.8" />
            <rect x="28" y="21.5" width="14" height="2" rx="1" fill={col} opacity="0.7" />
            <rect x="28" y="25" width="44" height="1.8" rx="0.9" fill="#64748b" opacity="0.8" />
            <rect x="28" y="28" width="32" height="1.8" rx="0.9" fill="#94a3b8" opacity="0.7" />
        </svg>
    ),
    'pills-nav': (col: string, light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            {/* Top Pill Badges */}
            <rect x="3" y="3" width="16" height="5" rx="2.5" fill={col} opacity="0.9" />
            <rect x="22" y="3" width="16" height="5" rx="2.5" fill="#f3f4f6" />
            <rect x="41" y="3" width="16" height="5" rx="2.5" fill="#f3f4f6" />
            <rect x="60" y="3" width="16" height="5" rx="2.5" fill="#f3f4f6" />
            {/* Live Policy Panel 1 */}
            <rect x="3" y="10" width="74" height="11" rx="2" fill={light} />
            <rect x="6" y="12.5" width="14" height="2" rx="1" fill={col} opacity="0.9" />
            <rect x="6" y="16" width="64" height="1.8" rx="0.9" fill="#64748b" opacity="0.8" />
            {/* Live Policy Panel 2 */}
            <rect x="3" y="23" width="74" height="10" rx="2" fill="#f8fafc" stroke="#e5e7eb" strokeWidth="0.8" />
            <rect x="6" y="25" width="14" height="2" rx="1" fill={col} opacity="0.7" />
            <rect x="6" y="28.5" width="58" height="1.8" rx="0.9" fill="#94a3b8" opacity="0.8" />
        </svg>
    ),
    'icon-tabs': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            {/* Card 1 - Shipping */}
            <rect x="3" y="3" width="35" height="13" rx="1.5" fill="#f8fafc" stroke="#e5e7eb" strokeWidth="0.8" />
            <rect x="5" y="5" width="3" height="3" rx="0.5" fill={col} />
            <rect x="10" y="5.5" width="14" height="2" rx="1" fill="#1e293b" />
            <rect x="5" y="10" width="28" height="1.5" rx="0.75" fill="#64748b" />
            {/* Card 2 - Returns */}
            <rect x="42" y="3" width="35" height="13" rx="1.5" fill="#f8fafc" stroke="#e5e7eb" strokeWidth="0.8" />
            <rect x="44" y="5" width="3" height="3" rx="0.5" fill={col} />
            <rect x="49" y="5.5" width="14" height="2" rx="1" fill="#1e293b" />
            <rect x="44" y="10" width="28" height="1.5" rx="0.75" fill="#64748b" />
            {/* Card 3 - Payment */}
            <rect x="3" y="19" width="35" height="13" rx="1.5" fill="#f8fafc" stroke="#e5e7eb" strokeWidth="0.8" />
            <rect x="5" y="21" width="3" height="3" rx="0.5" fill={col} />
            <rect x="10" y="21.5" width="14" height="2" rx="1" fill="#1e293b" />
            <rect x="5" y="26" width="28" height="1.5" rx="0.75" fill="#64748b" />
            {/* Card 4 - Warranty */}
            <rect x="42" y="19" width="35" height="13" rx="1.5" fill="#f8fafc" stroke="#e5e7eb" strokeWidth="0.8" />
            <rect x="44" y="21" width="3" height="3" rx="0.5" fill={col} />
            <rect x="49" y="21.5" width="14" height="2" rx="1" fill="#1e293b" />
            <rect x="44" y="26" width="28" height="1.5" rx="0.75" fill="#64748b" />
        </svg>
    ),
    // ── Button Block Variants ─────────────────────────────────────────────────
    'button-solid': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f9fafb" />
            <rect x="10" y="8" width="60" height="20" rx="4" fill={col} />
            <rect x="25" y="15" width="30" height="6" rx="3" fill="white" opacity="0.9" />
        </svg>
    ),
    'button-outline': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f9fafb" />
            <rect x="10" y="8" width="60" height="20" rx="4" fill="white" stroke={col} strokeWidth="2" />
            <rect x="25" y="15" width="30" height="6" rx="3" fill={col} opacity="0.8" />
        </svg>
    ),
    'button-rounded': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f9fafb" />
            <rect x="10" y="8" width="60" height="20" rx="10" fill={col} />
            <rect x="25" y="15" width="30" height="6" rx="3" fill="white" opacity="0.9" />
        </svg>
    ),
    'button-shadow': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f9fafb" />
            <rect x="10" y="10" width="60" height="20" rx="4" fill="rgba(0,0,0,0.15)" />
            <rect x="10" y="8" width="60" height="20" rx="4" fill={col} />
            <rect x="25" y="15" width="30" height="6" rx="3" fill="white" opacity="0.9" />
        </svg>
    ),
    'button-gradient': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f9fafb" />
            <rect x="10" y="8" width="60" height="20" rx="4" fill={col} />
            <rect x="25" y="15" width="30" height="6" rx="3" fill="white" opacity="0.9" />
        </svg>
    ),
    'button-icon-left': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f9fafb" />
            <rect x="10" y="8" width="60" height="20" rx="4" fill={col} />
            <circle cx="20" cy="18" r="4" fill="white" opacity="0.9" />
            <rect x="30" y="15" width="25" height="6" rx="3" fill="white" opacity="0.9" />
        </svg>
    ),
    'button-icon-right': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f9fafb" />
            <rect x="10" y="8" width="60" height="20" rx="4" fill={col} />
            <rect x="20" y="15" width="25" height="6" rx="3" fill="white" opacity="0.9" />
            <circle cx="60" cy="18" r="4" fill="white" opacity="0.9" />
        </svg>
    ),
    'button-full-width': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f9fafb" />
            <rect x="2" y="8" width="76" height="20" rx="4" fill={col} />
            <rect x="20" y="15" width="40" height="6" rx="3" fill="white" opacity="0.9" />
        </svg>
    ),
    'button-minimal': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f9fafb" />
            <rect x="20" y="15" width="40" height="4" rx="2" fill={col} />
            <line x1="20" y1="22" x2="60" y2="22" stroke={col} strokeWidth="1.5" />
        </svg>
    ),
    'button-pulse': (col: string, _light: string) => (
        <svg viewBox="0 0 80 36" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="36" rx="3" fill="#f9fafb" />
            <rect x="8" y="6" width="64" height="24" rx="6" fill="#dc2626" opacity="0.2" />
            <rect x="10" y="8" width="60" height="20" rx="4" fill="#dc2626" />
            <rect x="20" y="15" width="40" height="6" rx="3" fill="white" opacity="0.9" />
        </svg>
    ),
    // ── Hero Product ──────────────────────────────────────────────────────────
    'hp-default': (col, light) => (
        <svg viewBox="0 0 80 44" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="44" rx="3" fill="#f9fafb" />
            {/* Left: image slot 48% */}
            <rect x="4" y="4" width="34" height="36" rx="3" fill={light} stroke={col} strokeWidth="0.8" strokeDasharray="2.5 1.2" />
            <rect x="12" y="14" width="18" height="14" rx="2" fill={col} opacity="0.18" />
            <circle cx="21" cy="18" r="4" fill={col} opacity="0.3" />
            <path d="M13 26 l5-5 4 3 4-5 5 7H13z" fill={col} opacity="0.25" />
            {/* Thumbs strip */}
            {[0, 1, 2, 3].map(i => <rect key={i} x={4 + i * 9} y="41" width="7" height="4" rx="1" fill={col} opacity="0.2" />)}
            {/* Right: text lines 52% */}
            <rect x="42" y="6" width="20" height="3" rx="1.5" fill={col} opacity="0.3" />
            <rect x="42" y="12" width="34" height="4" rx="1.5" fill={col} opacity="0.7" />
            <rect x="42" y="18" width="22" height="4" rx="1.5" fill={col} opacity="0.9" />
            <rect x="42" y="24" width="34" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="42" y="28" width="32" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="42" y="32" width="28" height="2" rx="1" fill={col} opacity="0.2" />
        </svg>
    ),
    'hp-image-right': (col, light) => (
        <svg viewBox="0 0 80 44" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="44" rx="3" fill="#f9fafb" />
            {/* Left: text lines 52% */}
            <rect x="4" y="6" width="20" height="3" rx="1.5" fill={col} opacity="0.3" />
            <rect x="4" y="12" width="34" height="4" rx="1.5" fill={col} opacity="0.7" />
            <rect x="4" y="18" width="22" height="4" rx="1.5" fill={col} opacity="0.9" />
            <rect x="4" y="24" width="34" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="4" y="28" width="32" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="4" y="32" width="28" height="2" rx="1" fill={col} opacity="0.2" />
            {/* Right: image slot 48% */}
            <rect x="42" y="4" width="34" height="36" rx="3" fill={light} stroke={col} strokeWidth="0.8" strokeDasharray="2.5 1.2" />
            <rect x="49" y="14" width="18" height="14" rx="2" fill={col} opacity="0.18" />
            <circle cx="58" cy="18" r="4" fill={col} opacity="0.3" />
            <path d="M50 26 l5-5 4 3 4-5 4 7H50z" fill={col} opacity="0.25" />
        </svg>
    ),
    'hp-stacked': (col, light) => (
        <svg viewBox="0 0 80 44" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="44" rx="3" fill="#f9fafb" />
            {/* Top: full-width image slot */}
            <rect x="4" y="4" width="72" height="20" rx="3" fill={light} stroke={col} strokeWidth="0.8" strokeDasharray="2.5 1.2" />
            <rect x="25" y="9" width="30" height="10" rx="2" fill={col} opacity="0.18" />
            <circle cx="40" cy="12" r="3.5" fill={col} opacity="0.3" />
            <path d="M26 19 l6-5 5 3 5-5 6 7H26z" fill={col} opacity="0.25" />
            {/* Bottom: centered text */}
            <rect x="20" y="27" width="40" height="3" rx="1.5" fill={col} opacity="0.7" />
            <rect x="26" y="32" width="28" height="3" rx="1.5" fill={col} opacity="0.9" />
            <rect x="22" y="37" width="36" height="2" rx="1" fill={col} opacity="0.2" />
        </svg>
    ),
    'hp-dark-hero': (col, _light) => (
        <svg viewBox="0 0 80 44" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="44" rx="3" fill="#1e1535" />
            {/* Left: dark image slot */}
            <rect x="4" y="4" width="34" height="36" rx="3" fill="#2d1f5e" stroke="#4c3a8a" strokeWidth="0.8" />
            <circle cx="21" cy="18" r="5" fill="#7530fb" opacity="0.4" />
            <path d="M8 36 l6-7 5 4 5-6 6 9H8z" fill="#7530fb" opacity="0.3" />
            {/* Right: white text on dark */}
            <rect x="42" y="6" width="14" height="3" rx="1.5" fill={col} opacity="0.7" />
            <rect x="42" y="12" width="34" height="4" rx="1.5" fill="white" opacity="0.85" />
            <rect x="42" y="18" width="22" height="4" rx="1.5" fill={col} opacity="1" />
            <rect x="42" y="24" width="32" height="2" rx="1" fill="white" opacity="0.4" />
            <rect x="42" y="28" width="28" height="2" rx="1" fill="white" opacity="0.4" />
            <rect x="42" y="32" width="30" height="2" rx="1" fill="white" opacity="0.4" />
        </svg>
    ),
    'hp-with-gallery': (col, light) => (
        <svg viewBox="0 0 80 44" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="44" rx="3" fill="#f9fafb" />
            {/* Vertical thumb strip ~10% — 4 stacked squares, first has active border */}
            <rect x="2" y="3" width="7" height="7" rx="1" fill={col} opacity="0.9" stroke={col} strokeWidth="0.8" />
            <rect x="2" y="12" width="7" height="7" rx="1" fill={light} stroke={col} strokeWidth="0.5" opacity="0.6" />
            <rect x="2" y="21" width="7" height="7" rx="1" fill={light} stroke={col} strokeWidth="0.5" opacity="0.6" />
            <rect x="2" y="30" width="7" height="7" rx="1" fill={light} stroke={col} strokeWidth="0.5" opacity="0.6" />
            {/* Main image ~50% — large, clean, no card border */}
            <rect x="12" y="3" width="30" height="38" rx="3" fill={light} stroke={col} strokeWidth="0.7" strokeDasharray="2.5 1.2" />
            <circle cx="27" cy="17" r="5" fill={col} opacity="0.25" />
            <path d="M13 38 l6-7 5 4 6-6 6 9H13z" fill={col} opacity="0.2" />
            {/* Subtle divider */}
            <line x1="45" y1="3" x2="45" y2="41" stroke={col} strokeWidth="0.6" opacity="0.2" />
            {/* Details ~40% — badge + title + price + bullets */}
            <rect x="47" y="4" width="10" height="3" rx="1.5" fill={col} opacity="0.35" />
            <rect x="47" y="10" width="30" height="3.5" rx="1.5" fill={col} opacity="0.75" />
            <rect x="47" y="15" width="20" height="4" rx="1.5" fill={col} opacity="1" />
            <rect x="47" y="22" width="28" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="47" y="26" width="26" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="47" y="30" width="24" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="47" y="34" width="22" height="2" rx="1" fill={col} opacity="0.2" />
        </svg>
    ),
    'hp-centered-hero': (col, light) => (
        <svg viewBox="0 0 80 50" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="50" rx="3" fill="#f9fafb" />
            {/* Top: centered image */}
            <rect x="20" y="3" width="40" height="22" rx="3" fill={light} stroke={col} strokeWidth="0.8" strokeDasharray="2.5 1.2" />
            <circle cx="40" cy="13" r="5" fill={col} opacity="0.3" />
            <path d="M22 24 l6-6 5 4 6-5 5 7H22z" fill={col} opacity="0.2" />
            {/* Bottom: centered text */}
            <rect x="26" y="28" width="28" height="3" rx="1.5" fill={col} opacity="0.7" />
            <rect x="22" y="33" width="36" height="3" rx="1.5" fill={col} opacity="0.5" />
            <rect x="16" y="39" width="48" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="18" y="43" width="44" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="20" y="47" width="40" height="2" rx="1" fill={col} opacity="0.2" />
        </svg>
    ),
    // ── CTA Banner ────────────────────────────────────────────────────────────
    'ctab-trust-bar': (col, _light) => (
        <svg viewBox="0 0 80 28" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="28" rx="3" fill="#ffffff" />
            <rect x="0" y="25" width="80" height="3" fill={col} />
            <circle cx="10" cy="14" r="5" fill={col} opacity="0.9" />
            <rect x="18" y="11" width="18" height="3" rx="1.5" fill={col} opacity="0.8" />
            <rect x="40" y="10" width="12" height="5" rx="2.5" fill={col} opacity="0.15" />
            <rect x="54" y="10" width="12" height="5" rx="2.5" fill={col} opacity="0.15" />
            <rect x="68" y="10" width="9" height="5" rx="2.5" fill={col} opacity="0.15" />
        </svg>
    ),
    'ctab-split-action': (col, _light) => (
        <svg viewBox="0 0 80 32" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="32" rx="3" fill="#1e1535" />
            <rect x="4" y="9" width="32" height="4" rx="1.5" fill="white" opacity="0.85" />
            <rect x="4" y="16" width="24" height="2.5" rx="1" fill="white" opacity="0.4" />
            <line x1="44" y1="4" x2="44" y2="28" stroke="white" strokeWidth="0.6" opacity="0.3" />
            <rect x="50" y="11" width="24" height="10" rx="4" fill={col} />
            <rect x="56" y="14.5" width="12" height="3" rx="1.5" fill="white" opacity="0.9" />
        </svg>
    ),
    'ctab-flash-deal': (col, _light) => (
        <svg viewBox="0 0 80 34" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="34" rx="3" fill="#dc2626" />
            <rect width="80" height="7" rx="0" fill="#b91c1c" />
            <rect x="22" y="1.5" width="36" height="4" rx="1.5" fill="white" opacity="0.7" />
            <rect x="4" y="12" width="34" height="4" rx="1.5" fill="white" opacity="0.9" />
            <rect x="4" y="19" width="26" height="2.5" rx="1" fill="white" opacity="0.5" />
            <rect x="46" y="11" width="28" height="12" rx="4" fill="#ff6b00" opacity="0.9" />
            <rect x="50" y="15.5" width="20" height="3" rx="1.5" fill="white" opacity="0.9" />
        </svg>
    ),
    'ctab-dark-premium': (col, _light) => (
        <svg viewBox="0 0 80 34" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="34" rx="4" fill="#d4af37" />
            <rect x="1" y="1" width="78" height="32" rx="3.2" fill="#7530fb" />
            <rect x="2" y="2" width="76" height="30" rx="2.5" fill="#0a0a0f" />
            <rect x="18" y="8" width="44" height="5" rx="2" fill="white" opacity="0.85" />
            <rect x="24" y="16" width="32" height="3" rx="1.5" fill="#a0a0b0" opacity="0.7" />
            <rect x="28" y="22" width="24" height="5" rx="2.5" fill="none" stroke="#d4af37" strokeWidth="0.8" />
        </svg>
    ),
    'ctab-icon-value': (col, _light) => (
        <svg viewBox="0 0 80 34" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="34" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.6" opacity="0.4" />
            {/* 3 equal columns */}
            <line x1="27" y1="4" x2="27" y2="30" stroke={col} strokeWidth="0.6" opacity="0.3" />
            <line x1="54" y1="4" x2="54" y2="30" stroke={col} strokeWidth="0.6" opacity="0.3" />
            {/* Col 1 */}
            <circle cx="13" cy="10" r="4" fill={col} opacity="0.2" />
            <rect x="7" y="17" width="12" height="2.5" rx="1" fill={col} opacity="0.7" />
            <rect x="9" y="22" width="8" height="2" rx="1" fill={col} opacity="0.3" />
            {/* Col 2 */}
            <circle cx="40" cy="10" r="4" fill={col} opacity="0.2" />
            <rect x="34" y="17" width="12" height="2.5" rx="1" fill={col} opacity="0.7" />
            <rect x="36" y="22" width="8" height="2" rx="1" fill={col} opacity="0.3" />
            {/* Col 3 */}
            <circle cx="67" cy="10" r="4" fill={col} opacity="0.2" />
            <rect x="61" y="17" width="12" height="2.5" rx="1" fill={col} opacity="0.7" />
            <rect x="63" y="22" width="8" height="2" rx="1" fill={col} opacity="0.3" />
        </svg>
    ),
    'ctab-ribbon': (col, _light) => (
        <svg viewBox="0 0 80 22" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="22" fill="#0a0a0f" />
            <rect x="0" y="0" width="4" height="22" fill={col} />
            <rect x="8" y="8" width="30" height="3" rx="1.5" fill="white" opacity="0.85" />
            <rect x="54" y="6" width="22" height="10" rx="3" fill="none" stroke={col} strokeWidth="0.9" />
            <rect x="58" y="9.5" width="14" height="3" rx="1.5" fill={col} opacity="0.9" />
        </svg>
    ),
    'ctab-gradient-hero': (col, _light) => (
        <svg viewBox="0 0 80 38" fill="none" style={{ width: '100%', height: 32 }}>
            <defs>
                <linearGradient id="ctabGH" x1="0" y1="0" x2="80" y2="38" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={col} />
                    <stop offset="100%" stopColor="#0a0a0f" />
                </linearGradient>
            </defs>
            <rect width="80" height="38" rx="4" fill="url(#ctabGH)" />
            <rect x="16" y="8" width="48" height="5" rx="2" fill="white" opacity="0.9" />
            <rect x="22" y="16" width="36" height="3" rx="1.5" fill="white" opacity="0.5" />
            <rect x="26" y="24" width="28" height="9" rx="4" fill="white" />
            <rect x="30" y="27" width="20" height="3" rx="1.5" fill={col} opacity="0.8" />
        </svg>
    ),
    'ctab-social-proof': (col, _light) => (
        <svg viewBox="0 0 80 32" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="32" rx="3" fill="#ffffff" />
            <rect x="0" y="0" width="80" height="1" fill={col} opacity="0.15" />
            <rect x="0" y="31" width="80" height="1" fill={col} opacity="0.15" />
            {/* Stars */}
            {[0, 1, 2, 3, 4].map(i => <rect key={i} x={4 + i * 5} y="6" width="4" height="4" rx="0.8" fill="#f59e0b" opacity="0.9" />)}
            <rect x="4" y="13" width="22" height="4" rx="1.5" fill={col} opacity="0.9" />
            <rect x="4" y="20" width="18" height="2.5" rx="1" fill={col} opacity="0.3" />
            <line x1="38" y1="4" x2="38" y2="28" stroke={col} strokeWidth="0.6" opacity="0.2" />
            <rect x="42" y="8" width="30" height="3.5" rx="1.5" fill={col} opacity="0.7" />
            <rect x="42" y="15" width="22" height="2.5" rx="1" fill={col} opacity="0.3" />
            <rect x="42" y="21" width="18" height="5" rx="2" fill="none" stroke={col} strokeWidth="0.8" />
        </svg>
    ),
    'ctab-announcement': (col, _light) => (
        <svg viewBox="0 0 80 26" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="26" rx="3" fill={col} opacity="0.08" />
            <rect x="3" y="8" width="20" height="10" rx="5" fill={col} opacity="0.9" />
            <rect x="6" y="11" width="14" height="4" rx="1.5" fill="white" opacity="0.9" />
            <rect x="27" y="10" width="26" height="3.5" rx="1.5" fill={col} opacity="0.75" />
            <rect x="57" y="8" width="18" height="10" rx="5" fill="#e5e7eb" />
            <rect x="60" y="11" width="12" height="4" rx="1.5" fill="#6b7280" opacity="0.8" />
        </svg>
    ),
    'ctab-two-tone': (col, _light) => (
        <svg viewBox="0 0 80 32" fill="none" style={{ width: '100%', height: 32 }}>
            <rect width="80" height="32" rx="3" fill="white" />
            {/* Left accent half */}
            <clipPath id="ctabTTL"><rect width="40" height="32" rx="3" /></clipPath>
            <rect width="40" height="32" fill={col} clipPath="url(#ctabTTL)" />
            <rect x="4" y="9" width="24" height="4" rx="1.5" fill="white" opacity="0.9" />
            <rect x="4" y="16" width="18" height="2.5" rx="1" fill="white" opacity="0.5" />
            {/* Right white half */}
            <rect x="44" y="8" width="28" height="4" rx="1.5" fill={col} opacity="0.8" />
            <rect x="44" y="15" width="20" height="2.5" rx="1" fill="#6b7280" opacity="0.5" />
            <rect x="44" y="21" width="20" height="7" rx="3" fill={col} opacity="0.9" />
            <rect x="48" y="23.5" width="12" height="2.5" rx="1" fill="white" opacity="0.9" />
        </svg>
    ),

    // ── Minimal Clean: main image top-left, 2×2 grid bottom-left, cream panel right
    'hp-minimal-clean': (col, light) => (
        <svg viewBox="0 0 80 44" fill="none" style={{ width: '100%', height: 36 }}>
            {/* Warm cream background */}
            <rect width="80" height="44" rx="3" fill="#f5f4f0" />
            {/* Left col: main image top */}
            <rect x="3" y="3" width="32" height="22" rx="2" fill={light} stroke={col} strokeWidth="0.7" strokeDasharray="2 1" />
            <circle cx="19" cy="12" r="4" fill={col} opacity="0.25" />
            <path d="M4 24 l5-5 4 3 4-5 5 6H4z" fill={col} opacity="0.2" />
            {/* 2×2 thumb grid bottom-left */}
            <rect x="3" y="27" width="15" height="7" rx="1.5" fill={col} opacity="0.18" />
            <rect x="20" y="27" width="15" height="7" rx="1.5" fill={col} opacity="0.18" />
            <rect x="3" y="36" width="15" height="7" rx="1.5" fill={col} opacity="0.12" />
            <rect x="20" y="36" width="15" height="7" rx="1.5" fill={col} opacity="0.12" />
            {/* Right: cream panel */}
            <rect x="38" y="3" width="39" height="38" rx="3" fill="#faf9f6" />
            {/* Category label — tiny */}
            <rect x="42" y="7" width="14" height="2" rx="1" fill={col} opacity="0.3" />
            {/* Serif title lines */}
            <rect x="42" y="12" width="31" height="3.5" rx="1" fill={col} opacity="0.75" />
            <rect x="42" y="17" width="22" height="3.5" rx="1" fill={col} opacity="0.55" />
            {/* Thin accent rule */}
            <rect x="42" y="22" width="10" height="1.5" rx="1" fill={col} opacity="1" />
            {/* Price */}
            <rect x="42" y="26" width="20" height="3.5" rx="1" fill={col} opacity="0.9" />
            {/* Em-dash bullets */}
            <rect x="42" y="32" width="30" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="42" y="36" width="26" height="2" rx="1" fill={col} opacity="0.2" />
        </svg>
    ),

    // ── Minimal 6-Grid: main image + 4 thumbs left, 2 thumbs top-right above details
    'hp-minimal-6grid': (col, light) => (
        <svg viewBox="0 0 80 44" fill="none" style={{ width: '100%', height: 36 }}>
            {/* Background */}
            <rect width="80" height="44" rx="3" fill="#f5f4f0" />
            {/* Left col: main image top */}
            <rect x="3" y="3" width="32" height="22" rx="2" fill={light} stroke={col} strokeWidth="0.7" strokeDasharray="2 1" />
            <circle cx="19" cy="12" r="4" fill={col} opacity="0.25" />
            <path d="M4 24 l5-5 4 3 4-5 5 6H4z" fill={col} opacity="0.2" />
            {/* 4 thumbs in 2x2 grid bottom-left */}
            <rect x="3" y="27" width="15" height="7" rx="1.5" fill={col} opacity="0.18" />
            <rect x="20" y="27" width="15" height="7" rx="1.5" fill={col} opacity="0.18" />
            <rect x="3" y="36" width="15" height="7" rx="1.5" fill={col} opacity="0.12" />
            <rect x="20" y="36" width="15" height="7" rx="1.5" fill={col} opacity="0.12" />
            {/* Right: cream panel */}
            <rect x="38" y="3" width="39" height="38" rx="3" fill="#faf9f6" />
            {/* 2 feature thumbs at top of right panel */}
            <rect x="41" y="5" width="15" height="7" rx="1.5" fill={col} opacity="0.22" stroke={col} strokeWidth="0.5" />
            <rect x="59" y="5" width="15" height="7" rx="1.5" fill={col} opacity="0.22" stroke={col} strokeWidth="0.5" />
            {/* Category label */}
            <rect x="42" y="15" width="14" height="2" rx="1" fill={col} opacity="0.3" />
            {/* Title lines */}
            <rect x="42" y="19" width="31" height="3" rx="1" fill={col} opacity="0.75" />
            <rect x="42" y="24" width="22" height="3" rx="1" fill={col} opacity="0.55" />
            {/* Thin accent rule */}
            <rect x="42" y="29" width="10" height="1.5" rx="1" fill={col} opacity="1" />
            {/* Price */}
            <rect x="42" y="33" width="18" height="3" rx="1" fill={col} opacity="0.9" />
            {/* Bullets */}
            <rect x="42" y="38" width="28" height="1.5" rx="0.75" fill={col} opacity="0.2" />
        </svg>
    ),

    // ── Studio Flagship: full-width top header + studio image left + guarantee dossier right
    'hp-studio-flagship': (col, light) => (
        <svg viewBox="0 0 80 44" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="44" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            {/* Top Header Band across 100% width */}
            <rect x="0" y="0" width="80" height="12" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.6" />
            <rect x="4" y="3" width="12" height="2.5" fill={col} />
            <rect x="18" y="3" width="18" height="2" fill="#16a34a" opacity="0.8" />
            <rect x="4" y="7" width="46" height="3" fill="#0f172a" />
            <rect x="58" y="4" width="18" height="4.5" fill={col} />
            {/* Below Header: Image Left 50% */}
            <rect x="4" y="15" width="34" height="20" fill={light} stroke="#cbd5e1" strokeWidth="0.6" />
            <circle cx="21" cy="23" r="3.5" fill={col} opacity="0.25" />
            <path d="M5 33 l5-4 4 2 5-4 5 6H5z" fill={col} opacity="0.2" />
            {/* 4 thumbs under image */}
            {[0, 1, 2, 3].map(i => (
                <rect key={i} x={4 + i * 9} y="37" width="7" height="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.4" />
            ))}
            {/* Below Header: 3-Tier Guarantee Dossier Right 50% */}
            <rect x="42" y="15" width="34" height="7" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.6" />
            <rect x="42" y="23" width="34" height="7" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.6" />
            <rect x="42" y="31" width="34" height="7" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.6" />
            <rect x="42" y="40" width="30" height="2" fill={col} opacity="0.3" />
        </svg>
    ),

    // ── Flash Sale: red urgency banner top, image+SAVE badge left, giant price right
    'hp-flash-sale': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#fff7ed" />
            {/* Red urgency banner */}
            <rect x="3" y="3" width="74" height="7" rx="2" fill="#dc2626" />
            <rect x="18" y="5" width="44" height="2.5" rx="1" fill="white" opacity="0.85" />
            {/* Left: image with red SAVE badge corner */}
            <rect x="3" y="13" width="32" height="26" rx="2" fill="#fee2e2" stroke="#dc2626" strokeWidth="0.7" />
            <circle cx="19" cy="22" r="5" fill="#dc2626" opacity="0.2" />
            <path d="M4 37 l5-5 5 3 4-5 5 7H4z" fill="#dc2626" opacity="0.2" />
            {/* SAVE badge top-right of image */}
            <rect x="26" y="14" width="8" height="8" rx="1.5" fill="#dc2626" />
            <rect x="27" y="15.5" width="6" height="1.5" rx="0.5" fill="white" opacity="0.9" />
            <rect x="27" y="18.5" width="6" height="1.5" rx="0.5" fill="white" opacity="0.9" />
            {/* Right: badge + giant price + strikethrough + progress bar */}
            <rect x="39" y="13" width="14" height="3" rx="1.5" fill="#dc2626" opacity="0.25" />
            <rect x="39" y="19" width="36" height="5" rx="1.5" fill="#dc2626" opacity="0.9" />
            <rect x="39" y="26" width="20" height="2.5" rx="1" fill={col} opacity="0.25" style={{ textDecoration: 'line-through' }} />
            {/* Progress bar */}
            <rect x="39" y="31" width="36" height="3" rx="1.5" fill="#fee2e2" />
            <rect x="39" y="31" width="12" height="3" rx="1.5" fill="#dc2626" opacity="0.8" />
            {/* Bullets */}
            <rect x="39" y="37" width="32" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="39" y="41" width="28" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="39" y="45" width="24" height="2" rx="1" fill={col} opacity="0.2" />
        </svg>
    ),

    // ── Dark Premium: near-black bg, text left, image right with glow halo
    'hp-dark-premium': (col, _light) => (
        <svg viewBox="0 0 80 44" fill="none" style={{ width: '100%', height: 36 }}>
            {/* Near-black background */}
            <rect width="80" height="44" rx="3" fill="#0f0f13" />
            {/* Left: badge + white title + accent price + pill bullets */}
            <rect x="4" y="5" width="12" height="3" rx="1.5" fill={col} opacity="0.9" />
            <rect x="4" y="11" width="32" height="3.5" rx="1" fill="white" opacity="0.85" />
            <rect x="4" y="16" width="24" height="3.5" rx="1" fill="white" opacity="0.6" />
            <rect x="4" y="22" width="18" height="4" rx="1.5" fill={col} opacity="1" />
            {/* Pill bullets */}
            <rect x="4" y="29" width="28" height="4" rx="2" fill={col} opacity="0.2" stroke={col} strokeWidth="0.5" />
            <rect x="4" y="35" width="24" height="4" rx="2" fill={col} opacity="0.15" stroke={col} strokeWidth="0.5" />
            {/* Right: image with purple glow halo */}
            <ellipse cx="60" cy="22" rx="16" ry="16" fill={col} opacity="0.18" />
            <ellipse cx="60" cy="22" rx="11" ry="11" fill={col} opacity="0.15" />
            <rect x="48" y="9" width="24" height="26" rx="3" fill="#1a1025" stroke={col} strokeWidth="0.8" />
            <circle cx="60" cy="19" r="5" fill={col} opacity="0.3" />
            <path d="M49 34 l5-5 4 3 4-5 5 7H49z" fill={col} opacity="0.25" />
            {/* Thumb strip under image — dark */}
            <rect x="48" y="37" width="5" height="4" rx="1" fill={col} opacity="0.3" stroke={col} strokeWidth="0.4" />
            <rect x="55" y="37" width="5" height="4" rx="1" fill={col} opacity="0.2" stroke={col} strokeWidth="0.4" />
            <rect x="62" y="37" width="5" height="4" rx="1" fill={col} opacity="0.2" stroke={col} strokeWidth="0.4" />
            <rect x="69" y="37" width="5" height="4" rx="1" fill={col} opacity="0.2" stroke={col} strokeWidth="0.4" />
        </svg>
    ),

    // ── Wide Showcase: cinematic image full-width top, 3-col details row below
    'hp-wide-showcase': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" />
            {/* Badge centred at top */}
            <rect x="28" y="3" width="24" height="3.5" rx="1.75" fill={col} opacity="0.7" />
            {/* Cinematic wide image — 16:7 ratio */}
            <rect x="3" y="9" width="74" height="18" rx="2.5" fill={light} stroke={col} strokeWidth="0.7" strokeDasharray="2 1" />
            <circle cx="40" cy="17" r="5" fill={col} opacity="0.2" />
            <path d="M5 26 l8-6 6 4 7-5 7 7H5z" fill={col} opacity="0.18" />
            {/* Thumb row under wide image */}
            {[0, 1, 2, 3].map(i => (
                <rect key={i} x={3 + i * 19} y="29" width="16" height="5" rx="1" fill={col} opacity="0.15" />
            ))}
            {/* 3-col divider lines */}
            <line x1="28" y1="37" x2="28" y2="47" stroke={col} strokeWidth="0.5" opacity="0.25" />
            <line x1="54" y1="37" x2="54" y2="47" stroke={col} strokeWidth="0.5" opacity="0.25" />
            {/* Col 1: price */}
            <rect x="3" y="37" width="8" height="5" rx="1.5" fill={col} opacity="0.9" />
            <rect x="3" y="44" width="14" height="2" rx="1" fill={col} opacity="0.2" />
            {/* Col 2: title + bullets */}
            <rect x="31" y="37" width="20" height="2.5" rx="1" fill={col} opacity="0.7" />
            <rect x="31" y="41" width="18" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="31" y="45" width="16" height="2" rx="1" fill={col} opacity="0.2" />
            {/* Col 3: trust icons */}
            <rect x="57" y="37" width="18" height="2" rx="1" fill={col} opacity="0.25" />
            <rect x="57" y="41" width="16" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="57" y="45" width="14" height="2" rx="1" fill={col} opacity="0.18" />
        </svg>
    ),

    // ── single_image: classic-frame ──────────────────────────────────────────
    'classic-frame': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} stroke={col} strokeWidth="0.75" />
            <rect x="6" y="5" width="68" height="32" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.5" opacity="0.6" />
            <rect x="10" y="8" width="60" height="26" rx="2" fill={col} opacity="0.12" />
            <rect x="18" y="40" width="44" height="3" rx="1.5" fill={col} opacity="0.3" />
        </svg>
    ),
    // ── single_image: modern-elevated ────────────────────────────────────────
    'modern-elevated': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="8" y="4" width="64" height="34" rx="6" fill={col} opacity="0.15" />
            <rect x="6" y="2" width="64" height="34" rx="6" fill="#ffffff" />
            <rect x="6" y="2" width="64" height="34" rx="6" fill={col} opacity="0.1" />
            <rect x="18" y="40" width="44" height="3" rx="1.5" fill={col} opacity="0.25" />
        </svg>
    ),
    // ── single_image: polaroid-classic ───────────────────────────────────────
    'polaroid-classic': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="14" y="2" width="52" height="44" rx="3" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.75" />
            <rect x="18" y="5" width="44" height="28" rx="2" fill={col} opacity="0.15" />
            <rect x="20" y="36" width="40" height="3" rx="1.5" fill={col} opacity="0.4" />
            <rect x="28" y="41" width="24" height="2" rx="1" fill={col} opacity="0.2" />
        </svg>
    ),
    // ── single_image: edge-to-edge ───────────────────────────────────────────
    'edge-to-edge': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={col} opacity="0.15" />
            <rect width="80" height="48" rx="5" fill={col} opacity="0.1" />
            <rect x="0" y="30" width="80" height="18" rx="0" fill={col} opacity="0.5" />
            <rect x="16" y="36" width="48" height="3" rx="1.5" fill="#ffffff" opacity="0.9" />
            <rect x="24" y="41" width="32" height="2" rx="1" fill="#ffffff" opacity="0.5" />
        </svg>
    ),
    // ── single_image: neon-accent-frame ──────────────────────────────────────
    'neon-accent-frame': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill="#1e1535" />
            <defs>
                <linearGradient id="neon-border" x1="0" y1="0" x2="80" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor={col} /><stop offset="1" stopColor="#1e1535" />
                </linearGradient>
            </defs>
            <rect x="8" y="4" width="64" height="34" rx="6" stroke="url(#neon-border)" strokeWidth="1.5" fill="#0f0b1e" />
            <rect x="12" y="7" width="56" height="28" rx="4" fill={col} opacity="0.12" />
            <rect x="22" y="42" width="36" height="2.5" rx="1.25" fill={col} opacity="0.35" />
        </svg>
    ),
    // ── single_image: soft-minimalist ────────────────────────────────────────
    'soft-minimalist': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="6" y="3" width="68" height="34" rx="12" fill="#ffffff" stroke={col} strokeWidth="0.75" opacity="0.7" />
            <rect x="10" y="6" width="60" height="28" rx="10" fill={col} opacity="0.08" />
            <rect x="20" y="41" width="40" height="3" rx="1.5" fill={col} opacity="0.25" />
        </svg>
    ),
    // ── single_image: Circular Ring Spotlight (cir) ─────────────────────────
    'circular-ring-spotlight': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <ellipse cx="40" cy="41" rx="16" ry="2.5" fill={col} opacity="0.18" />
            <circle cx="40" cy="22" r="16" stroke={col} strokeWidth="1" strokeDasharray="2 1.5" opacity="0.5" />
            <circle cx="40" cy="22" r="12" fill="#ffffff" stroke={col} strokeWidth="1.2" />
            <circle cx="40" cy="22" r="8" fill={col} opacity="0.12" />
            <circle cx="40" cy="20" r="2.5" fill={col} opacity="0.6" />
        </svg>
    ),
    'cir': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <ellipse cx="40" cy="41" rx="16" ry="2.5" fill={col} opacity="0.18" />
            <circle cx="40" cy="22" r="16" stroke={col} strokeWidth="1" strokeDasharray="2 1.5" opacity="0.5" />
            <circle cx="40" cy="22" r="12" fill="#ffffff" stroke={col} strokeWidth="1.2" />
            <circle cx="40" cy="22" r="8" fill={col} opacity="0.12" />
            <circle cx="40" cy="20" r="2.5" fill={col} opacity="0.6" />
        </svg>
    ),
    // ── single_image: Archway Portal (arc) ──────────────────────────────────
    'arch-portal': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <ellipse cx="40" cy="42" rx="18" ry="2.5" fill={col} opacity="0.15" />
            <path d="M26 40V18C26 10.3 32.3 4 40 4C47.7 4 54 10.3 54 18V40H26Z" fill="#ffffff" stroke={col} strokeWidth="1.2" />
            <path d="M29 39V19C29 13 34 8 40 8C46 8 51 13 51 19V39H29Z" fill={col} opacity="0.1" />
            <circle cx="40" cy="22" r="4" fill={col} opacity="0.5" />
        </svg>
    ),
    'arc': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <ellipse cx="40" cy="42" rx="18" ry="2.5" fill={col} opacity="0.15" />
            <path d="M26 40V18C26 10.3 32.3 4 40 4C47.7 4 54 10.3 54 18V40H26Z" fill="#ffffff" stroke={col} strokeWidth="1.2" />
            <path d="M29 39V19C29 13 34 8 40 8C46 8 51 13 51 19V39H29Z" fill={col} opacity="0.1" />
            <circle cx="40" cy="22" r="4" fill={col} opacity="0.5" />
        </svg>
    ),
    // ── single_image: Viewfinder Studio (vie) ───────────────────────────────
    'viewfinder-corners': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="14" y="6" width="52" height="34" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <path d="M18 13V9H22" stroke={col} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M62 13V9H58" stroke={col} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M18 33V37H22" stroke={col} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M62 33V37H58" stroke={col} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="40" cy="23" r="5" stroke={col} strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <line x1="40" y1="20" x2="40" y2="26" stroke={col} strokeWidth="0.8" />
            <line x1="37" y1="23" x2="43" y2="23" stroke={col} strokeWidth="0.8" />
        </svg>
    ),
    'vie': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="14" y="6" width="52" height="34" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <path d="M18 13V9H22" stroke={col} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M62 13V9H58" stroke={col} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M18 33V37H22" stroke={col} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M62 33V37H58" stroke={col} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="40" cy="23" r="5" stroke={col} strokeWidth="0.8" strokeDasharray="1.5 1.5" />
            <line x1="40" y1="20" x2="40" y2="26" stroke={col} strokeWidth="0.8" />
            <line x1="37" y1="23" x2="43" y2="23" stroke={col} strokeWidth="0.8" />
        </svg>
    ),
    // ── single_image: Diagonal Geometric Cut (dia) ──────────────────────────
    'diagonal-cut': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <path d="M26 6H66C68 6 70 8 70 11V36L58 42H14C12 42 10 40 10 37V17L26 6Z" fill="#ffffff" stroke={col} strokeWidth="1.2" />
            <polygon points="10,17 26,6 26,17" fill={col} opacity="0.25" />
            <polygon points="70,36 58,42 58,36" fill={col} opacity="0.25" />
            <circle cx="40" cy="24" r="5" fill={col} opacity="0.4" />
        </svg>
    ),
    'dia': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <path d="M26 6H66C68 6 70 8 70 11V36L58 42H14C12 42 10 40 10 37V17L26 6Z" fill="#ffffff" stroke={col} strokeWidth="1.2" />
            <polygon points="10,17 26,6 26,17" fill={col} opacity="0.25" />
            <polygon points="70,36 58,42 58,36" fill={col} opacity="0.25" />
            <circle cx="40" cy="24" r="5" fill={col} opacity="0.4" />
        </svg>
    ),
    // ── single_image: Trust & Authenticity Banner (tru) ─────────────────────
    'trust-guarantee-badge': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="8" y="5" width="64" height="38" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="8" y="5" width="64" height="7" rx="2" fill="#059669" />
            <line x1="12" y1="8.5" x2="38" y2="8.5" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="40" cy="23" r="5" fill={col} opacity="0.25" />
            <rect x="18" y="36" width="44" height="3" rx="1" fill="#f1f5f9" />
        </svg>
    ),
    'tru': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="8" y="5" width="64" height="38" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="8" y="5" width="64" height="7" rx="2" fill="#059669" />
            <line x1="12" y1="8.5" x2="38" y2="8.5" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="40" cy="23" r="5" fill={col} opacity="0.25" />
            <rect x="18" y="36" width="44" height="3" rx="1" fill="#f1f5f9" />
        </svg>
    ),
    // ── single_image: Luxury Certified Seal (lux) ───────────────────────────
    'luxury-certified-seal': (_col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="8" y="4" width="64" height="40" rx="3" fill="#ffffff" stroke="#d1d5db" strokeWidth="1.2" />
            <rect x="11" y="7" width="58" height="34" rx="2" stroke="#d97706" strokeWidth="0.6" strokeDasharray="2 1" />
            <circle cx="40" cy="21" r="7" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
            <polygon points="40,16 41.5,19.5 45,19.5 42,22 43.5,25.5 40,23.5 36.5,25.5 38,22 35,19.5 38.5,19.5" fill="#d97706" />
            <line x1="22" y1="36" x2="58" y2="36" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" />
        </svg>
    ),
    'lux': (_col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="8" y="4" width="64" height="40" rx="3" fill="#ffffff" stroke="#d1d5db" strokeWidth="1.2" />
            <rect x="11" y="7" width="58" height="34" rx="2" stroke="#d97706" strokeWidth="0.6" strokeDasharray="2 1" />
            <circle cx="40" cy="21" r="7" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
            <polygon points="40,16 41.5,19.5 45,19.5 42,22 43.5,25.5 40,23.5 36.5,25.5 38,22 35,19.5 38.5,19.5" fill="#d97706" />
            <line x1="22" y1="36" x2="58" y2="36" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" />
        </svg>
    ),
    // ── single_image: Promo Flash Deal (dea) ─────────────────────────────────
    'deal-flash-ribbon': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="8" y="5" width="64" height="38" rx="5" fill="#ffffff" stroke={col} strokeWidth="1.2" />
            <rect x="8" y="5" width="64" height="8" rx="2" fill={col} />
            <path d="M14 7l-1.5 2.5h2.5l-1.5 3 3.5-3.5h-2.5l1.5-2z" fill="#ffffff" />
            <line x1="20" y1="9" x2="46" y2="9" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="40" cy="24" r="5" fill={col} opacity="0.2" />
            <rect x="24" y="35" width="32" height="4" rx="2" fill="#fee2e2" />
        </svg>
    ),
    'dea': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="8" y="5" width="64" height="38" rx="5" fill="#ffffff" stroke={col} strokeWidth="1.2" />
            <rect x="8" y="5" width="64" height="8" rx="2" fill={col} />
            <path d="M14 7l-1.5 2.5h2.5l-1.5 3 3.5-3.5h-2.5l1.5-2z" fill="#ffffff" />
            <line x1="20" y1="9" x2="46" y2="9" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="40" cy="24" r="5" fill={col} opacity="0.2" />
            <rect x="24" y="35" width="32" height="4" rx="2" fill="#fee2e2" />
        </svg>
    ),
    // ── single_image: Studio Floating Pedestal (stu) ────────────────────────
    'studio-pedestal': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <ellipse cx="40" cy="37" rx="22" ry="4" fill="#000000" opacity="0.18" />
            <ellipse cx="40" cy="35" rx="20" ry="3.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="34" y="14" width="12" height="18" rx="3" fill={col} opacity="0.75" />
            <circle cx="40" cy="18" r="2.5" fill="#ffffff" opacity="0.8" />
            <line x1="28" y1="44" x2="52" y2="44" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" />
        </svg>
    ),
    'stu': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <ellipse cx="40" cy="37" rx="22" ry="4" fill="#000000" opacity="0.18" />
            <ellipse cx="40" cy="35" rx="20" ry="3.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="34" y="14" width="12" height="18" rx="3" fill={col} opacity="0.75" />
            <circle cx="40" cy="18" r="2.5" fill="#ffffff" opacity="0.8" />
            <line x1="28" y1="44" x2="52" y2="44" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" />
        </svg>
    ),
    // ── single_image: Stadium Capsule Pod (sta) ─────────────────────────────
    'stadium-capsule-pod': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <ellipse cx="40" cy="43" rx="14" ry="2.5" fill={col} opacity="0.18" />
            <rect x="26" y="5" width="28" height="38" rx="14" fill="#ffffff" stroke={col} strokeWidth="1.2" />
            <rect x="29" y="8" width="22" height="32" rx="11" fill={col} opacity="0.1" />
            <circle cx="40" cy="22" r="4.5" fill={col} opacity="0.6" />
        </svg>
    ),
    'sta': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <ellipse cx="40" cy="43" rx="14" ry="2.5" fill={col} opacity="0.18" />
            <rect x="26" y="5" width="28" height="38" rx="14" fill="#ffffff" stroke={col} strokeWidth="1.2" />
            <rect x="29" y="8" width="22" height="32" rx="11" fill={col} opacity="0.1" />
            <circle cx="40" cy="22" r="4.5" fill={col} opacity="0.6" />
        </svg>
    ),
    // ── single_image: Geometric Prism Spotlight (geo) ───────────────────────
    'geometric-prism-spotlight': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            {/* Background Canvas */}
            <rect width="80" height="48" rx="5" fill={light} />

            {/* Main Showcase Card */}
            <rect x="6" y="4" width="68" height="40" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />

            {/* Corner Facet Shading */}
            <polygon points="56,4 74,4 74,20 60,16" fill={col} opacity="0.14" />
            <polygon points="6,28 6,44 22,44 18,32" fill={col} opacity="0.14" />

            {/* 4 Corner Geometric Brackets */}
            <path d="M10 12V8H14" stroke={col} strokeWidth="1.2" strokeLinecap="round" />
            <path d="M70 12V8H66" stroke={col} strokeWidth="1.2" strokeLinecap="round" />
            <path d="M10 36V40H14" stroke={col} strokeWidth="1.2" strokeLinecap="round" />
            <path d="M70 36V40H66" stroke={col} strokeWidth="1.2" strokeLinecap="round" />

            {/* Spotlight Glow & Product Subject */}
            <ellipse cx="40" cy="22" rx="16" ry="10" fill={col} opacity="0.08" />
            <circle cx="40" cy="22" r="6.5" fill={col} opacity="0.32" />

            {/* Ground Pedestal Shadow & Prism Line */}
            <ellipse cx="40" cy="35" rx="14" ry="1.6" fill="#000000" opacity="0.15" />
            <line x1="33" y1="38" x2="47" y2="38" stroke={col} strokeWidth="1" strokeLinecap="round" />
        </svg>
    ),
    'geo': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            {/* Background Canvas */}
            <rect width="80" height="48" rx="5" fill={light} />

            {/* Main Showcase Card */}
            <rect x="6" y="4" width="68" height="40" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />

            {/* Corner Facet Shading */}
            <polygon points="56,4 74,4 74,20 60,16" fill={col} opacity="0.14" />
            <polygon points="6,28 6,44 22,44 18,32" fill={col} opacity="0.14" />

            {/* 4 Corner Geometric Brackets */}
            <path d="M10 12V8H14" stroke={col} strokeWidth="1.2" strokeLinecap="round" />
            <path d="M70 12V8H66" stroke={col} strokeWidth="1.2" strokeLinecap="round" />
            <path d="M10 36V40H14" stroke={col} strokeWidth="1.2" strokeLinecap="round" />
            <path d="M70 36V40H66" stroke={col} strokeWidth="1.2" strokeLinecap="round" />

            {/* Spotlight Glow & Product Subject */}
            <ellipse cx="40" cy="22" rx="16" ry="10" fill={col} opacity="0.08" />
            <circle cx="40" cy="22" r="6.5" fill={col} opacity="0.32" />

            {/* Ground Pedestal Shadow & Prism Line */}
            <ellipse cx="40" cy="35" rx="14" ry="1.6" fill="#000000" opacity="0.15" />
            <line x1="33" y1="38" x2="47" y2="38" stroke={col} strokeWidth="1" strokeLinecap="round" />
        </svg>
    ),
    // ── single_image: Dynamic Diagonal Split (diagonal-split-stage / spl) ───
    'diagonal-split-stage': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="8" y="6" width="64" height="36" rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <path d="M48 6L72 6C74 6 76 8 76 10V38C76 40 74 42 72 42H32L48 6Z" fill={col} opacity="0.25" />
            <line x1="48" y1="6" x2="32" y2="42" stroke={col} strokeWidth="1.2" />
            <circle cx="34" cy="24" r="5" fill={col} opacity="0.75" />
        </svg>
    ),
    // ── single_image: Sculpted Armor Shield (scu) ───────────────────────────
    'sculpted-armor-shield': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <ellipse cx="40" cy="43" rx="16" ry="2.5" fill={col} opacity="0.15" />
            <path d="M40 6L60 10C60 25 51 38 40 42C29 38 20 25 20 10L40 6Z" fill="#ffffff" stroke={col} strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M40 10L55 13C55 24 48 35 40 38C32 35 25 24 25 13L40 10Z" fill={col} opacity="0.12" />
            <circle cx="40" cy="22" r="3.5" fill={col} opacity="0.65" />
        </svg>
    ),
    'scu': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <ellipse cx="40" cy="43" rx="16" ry="2.5" fill={col} opacity="0.15" />
            <path d="M40 6L60 10C60 25 51 38 40 42C29 38 20 25 20 10L40 6Z" fill="#ffffff" stroke={col} strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M40 10L55 13C55 24 48 35 40 38C32 35 25 24 25 13L40 10Z" fill={col} opacity="0.12" />
            <circle cx="40" cy="22" r="3.5" fill={col} opacity="0.65" />
        </svg>
    ),
    // ── logo_bar: flat-row ────────────────────────────────────────────────────
    'flat-row': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="4" y="6" width="72" height="4" rx="2" fill={col} opacity="0.2" />
            <rect x="4" y="14" width="72" height="26" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.5" opacity="0.6" />
            <rect x="20" y="14" width="1" height="26" fill={col} opacity="0.15" />
            <rect x="36" y="14" width="1" height="26" fill={col} opacity="0.15" />
            <rect x="52" y="14" width="1" height="26" fill={col} opacity="0.15" />
            <rect x="66" y="14" width="1" height="26" fill={col} opacity="0.15" />
            <rect x="8" y="20" width="10" height="10" rx="2" fill={col} opacity="0.2" />
            <rect x="24" y="20" width="10" height="10" rx="2" fill={col} opacity="0.2" />
            <rect x="40" y="20" width="10" height="10" rx="2" fill={col} opacity="0.2" />
            <rect x="56" y="20" width="10" height="10" rx="2" fill={col} opacity="0.2" />
        </svg>
    ),
    // ── logo_bar: pill-labels ─────────────────────────────────────────────────
    'pill-labels': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="4" y="6" width="72" height="3" rx="1.5" fill={col} opacity="0.2" />
            <rect x="3" y="14" width="18" height="26" rx="10" fill="#ffffff" stroke={col} strokeWidth="0.75" />
            <rect x="22" y="14" width="18" height="26" rx="10" fill="#ffffff" stroke={col} strokeWidth="0.75" />
            <rect x="41" y="14" width="18" height="26" rx="10" fill="#ffffff" stroke={col} strokeWidth="0.75" />
            <rect x="60" y="14" width="18" height="26" rx="10" fill="#ffffff" stroke={col} strokeWidth="0.75" />
            <rect x="6" y="18" width="12" height="8" rx="2" fill={col} opacity="0.15" />
            <rect x="6" y="28" width="12" height="3" rx="1.5" fill={col} opacity="0.4" />
            <rect x="25" y="18" width="12" height="8" rx="2" fill={col} opacity="0.15" />
            <rect x="25" y="28" width="12" height="3" rx="1.5" fill={col} opacity="0.4" />
            <rect x="44" y="18" width="12" height="8" rx="2" fill={col} opacity="0.15" />
            <rect x="44" y="28" width="12" height="3" rx="1.5" fill={col} opacity="0.4" />
            <rect x="63" y="18" width="12" height="8" rx="2" fill={col} opacity="0.15" />
            <rect x="63" y="28" width="12" height="3" rx="1.5" fill={col} opacity="0.4" />
        </svg>
    ),
    // ── logo_bar: divider-strip ───────────────────────────────────────────────
    'divider-strip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="4" y="6" width="30" height="4" rx="2" fill={col} opacity="0.5" />
            <rect x="4" y="14" width="72" height="24" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.5" opacity="0.7" />
            <rect x="22" y="14" width="1" height="24" fill={col} opacity="0.18" />
            <rect x="40" y="14" width="1" height="24" fill={col} opacity="0.18" />
            <rect x="58" y="14" width="1" height="24" fill={col} opacity="0.18" />
            <rect x="9" y="20" width="10" height="10" rx="2" fill={col} opacity="0.2" />
            <rect x="27" y="20" width="10" height="10" rx="2" fill={col} opacity="0.2" />
            <rect x="45" y="20" width="10" height="10" rx="2" fill={col} opacity="0.2" />
            <rect x="63" y="20" width="10" height="10" rx="2" fill={col} opacity="0.2" />
        </svg>
    ),
    // ── logo_bar: card-grid ───────────────────────────────────────────────────
    'lb-card-grid': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="4" y="4" width="72" height="3" rx="1.5" fill={col} opacity="0.2" />
            <rect x="3" y="11" width="16" height="32" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.5" />
            <rect x="22" y="11" width="16" height="32" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.5" />
            <rect x="41" y="11" width="16" height="32" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.5" />
            <rect x="60" y="11" width="16" height="32" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.5" />
            <rect x="6" y="14" width="10" height="10" rx="2" fill={col} opacity="0.18" />
            <rect x="25" y="14" width="10" height="10" rx="2" fill={col} opacity="0.18" />
            <rect x="44" y="14" width="10" height="10" rx="2" fill={col} opacity="0.18" />
            <rect x="63" y="14" width="10" height="10" rx="2" fill={col} opacity="0.18" />
            <rect x="3" y="27" width="16" height="1" fill={col} opacity="0.12" />
            <rect x="22" y="27" width="16" height="1" fill={col} opacity="0.12" />
            <rect x="41" y="27" width="16" height="1" fill={col} opacity="0.12" />
            <rect x="60" y="27" width="16" height="1" fill={col} opacity="0.12" />
            <rect x="5" y="31" width="12" height="2.5" rx="1.25" fill={col} opacity="0.4" />
            <rect x="24" y="31" width="12" height="2.5" rx="1.25" fill={col} opacity="0.4" />
            <rect x="43" y="31" width="12" height="2.5" rx="1.25" fill={col} opacity="0.4" />
            <rect x="62" y="31" width="12" height="2.5" rx="1.25" fill={col} opacity="0.4" />
        </svg>
    ),
    // ── logo_bar: icon-label-column ───────────────────────────────────────────
    'icon-label-column': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="4" y="6" width="2" height="36" rx="1" fill={col} opacity="0.7" />
            <rect x="9" y="10" width="22" height="5" rx="2.5" fill={col} opacity="0.7" />
            <rect x="9" y="19" width="18" height="3" rx="1.5" fill={col} opacity="0.35" />
            <rect x="9" y="25" width="20" height="2.5" rx="1.25" fill={col} opacity="0.25" />
            <rect x="36" y="6" width="1" height="36" fill={col} opacity="0.15" />
            <rect x="40" y="8" width="10" height="10" rx="2" fill={col} opacity="0.18" />
            <rect x="54" y="8" width="10" height="10" rx="2" fill={col} opacity="0.18" />
            <rect x="68" y="8" width="10" height="10" rx="2" fill={col} opacity="0.18" />
            <rect x="40" y="22" width="10" height="10" rx="2" fill={col} opacity="0.18" />
            <rect x="54" y="22" width="10" height="10" rx="2" fill={col} opacity="0.18" />
            <rect x="68" y="22" width="10" height="10" rx="2" fill={col} opacity="0.18" />
        </svg>
    ),
    // ── logo_bar: dark-band ───────────────────────────────────────────────────
    'dark-band': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill="#1e1535" />
            <rect x="14" y="6" width="52" height="3" rx="1.5" fill="white" opacity="0.2" />
            <rect x="3" y="13" width="16" height="28" rx="2" fill="white" opacity="0.06" />
            <rect x="22" y="13" width="16" height="28" rx="2" fill="white" opacity="0.06" />
            <rect x="41" y="13" width="16" height="28" rx="2" fill="white" opacity="0.06" />
            <rect x="60" y="13" width="16" height="28" rx="2" fill="white" opacity="0.06" />
            <rect x="6" y="17" width="10" height="10" rx="2" fill="white" opacity="0.2" />
            <rect x="25" y="17" width="10" height="10" rx="2" fill="white" opacity="0.2" />
            <rect x="44" y="17" width="10" height="10" rx="2" fill="white" opacity="0.2" />
            <rect x="63" y="17" width="10" height="10" rx="2" fill="white" opacity="0.2" />
            <rect x="5" y="30" width="12" height="2" rx="1" fill="white" opacity="0.15" />
            <rect x="24" y="30" width="12" height="2" rx="1" fill="white" opacity="0.15" />
            <rect x="43" y="30" width="12" height="2" rx="1" fill="white" opacity="0.15" />
            <rect x="62" y="30" width="12" height="2" rx="1" fill="white" opacity="0.15" />
        </svg>
    ),
    // ── logo_bar: gradient-showcase ───────────────────────────────────────────
    'gradient-showcase': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <defs>
                <linearGradient id="lgb-grad" x1="0" y1="0" x2="80" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor={col} /><stop offset="1" stopColor="#1e1535" />
                </linearGradient>
            </defs>
            <rect width="80" height="48" rx="5" fill="url(#lgb-grad)" />
            <rect x="12" y="6" width="56" height="3" rx="1.5" fill="#b8fa33" opacity="0.8" />
            <rect x="3" y="14" width="16" height="26" rx="4" fill="white" opacity="0.12" stroke="white" strokeWidth="0.5" strokeOpacity="0.25" />
            <rect x="22" y="14" width="16" height="26" rx="4" fill="white" opacity="0.12" stroke="white" strokeWidth="0.5" strokeOpacity="0.25" />
            <rect x="41" y="14" width="16" height="26" rx="4" fill="white" opacity="0.12" stroke="white" strokeWidth="0.5" strokeOpacity="0.25" />
            <rect x="60" y="14" width="16" height="26" rx="4" fill="white" opacity="0.12" stroke="white" strokeWidth="0.5" strokeOpacity="0.25" />
            <rect x="6" y="18" width="10" height="10" rx="2" fill="white" opacity="0.3" />
            <rect x="25" y="18" width="10" height="10" rx="2" fill="white" opacity="0.3" />
            <rect x="44" y="18" width="10" height="10" rx="2" fill="white" opacity="0.3" />
            <rect x="63" y="18" width="10" height="10" rx="2" fill="white" opacity="0.3" />
        </svg>
    ),
    // ── logo_bar: trust-ticker ────────────────────────────────────────────────
    'trust-ticker': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="4" y="17" width="72" height="14" rx="4" fill="#ffffff" stroke={col} strokeWidth="0.5" opacity="0.7" />
            <rect x="4" y="17" width="16" height="14" rx="4" fill={col} opacity="0.85" />
            <rect x="6" y="21" width="12" height="6" rx="2" fill="white" opacity="0.85" />
            <rect x="24" y="21" width="8" height="6" rx="2" fill={col} opacity="0.2" />
            <rect x="35" y="21" width="8" height="6" rx="2" fill={col} opacity="0.2" />
            <rect x="46" y="21" width="8" height="6" rx="2" fill={col} opacity="0.2" />
            <rect x="57" y="21" width="8" height="6" rx="2" fill={col} opacity="0.2" />
            <rect x="33" y="23" width="1" height="2" rx="0.5" fill={col} opacity="0.3" />
            <rect x="44" y="23" width="1" height="2" rx="0.5" fill={col} opacity="0.3" />
            <rect x="55" y="23" width="1" height="2" rx="0.5" fill={col} opacity="0.3" />
        </svg>
    ),
    // ── logo_bar: spotlight-cards ─────────────────────────────────────────────
    'spotlight-cards': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <defs>
                <linearGradient id="lgb-spot" x1="0" y1="0" x2="80" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor={col} /><stop offset="1" stopColor="#1e1535" />
                </linearGradient>
            </defs>
            <rect width="80" height="48" rx="5" fill={light} />
            <rect x="4" y="6" width="72" height="3" rx="1.5" fill={col} opacity="0.3" />
            <rect x="3" y="13" width="16" height="30" rx="3" fill="url(#lgb-spot)" opacity="0.9" />
            <rect x="22" y="13" width="16" height="30" rx="3" fill="url(#lgb-spot)" opacity="0.9" />
            <rect x="41" y="13" width="16" height="30" rx="3" fill="url(#lgb-spot)" opacity="0.9" />
            <rect x="60" y="13" width="16" height="30" rx="3" fill="url(#lgb-spot)" opacity="0.9" />
            <rect x="3" y="13" width="16" height="3" rx="1.5" fill={col} />
            <rect x="22" y="13" width="16" height="3" rx="1.5" fill={col} />
            <rect x="41" y="13" width="16" height="3" rx="1.5" fill={col} />
            <rect x="60" y="13" width="16" height="3" rx="1.5" fill={col} />
            <rect x="4" y="16" width="14" height="14" rx="2" fill="white" opacity="0.15" />
            <rect x="23" y="16" width="14" height="14" rx="2" fill="white" opacity="0.15" />
            <rect x="42" y="16" width="14" height="14" rx="2" fill="white" opacity="0.15" />
            <rect x="61" y="16" width="14" height="14" rx="2" fill="white" opacity="0.15" />
            <rect x="5" y="33" width="12" height="2.5" rx="1.25" fill="white" opacity="0.4" />
            <rect x="24" y="33" width="12" height="2.5" rx="1.25" fill="white" opacity="0.4" />
            <rect x="43" y="33" width="12" height="2.5" rx="1.25" fill="white" opacity="0.4" />
            <rect x="62" y="33" width="12" height="2.5" rx="1.25" fill="white" opacity="0.4" />
        </svg>
    ),
    // ── logo_bar: glass-mosaic ────────────────────────────────────────────────
    'glass-mosaic': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <defs>
                <linearGradient id="lgb-glass" x1="0" y1="0" x2="80" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor={col} /><stop offset="1" stopColor="#1e1535" />
                </linearGradient>
            </defs>
            <rect width="80" height="48" rx="5" fill="url(#lgb-glass)" />
            <rect x="0" y="0" width="80" height="48" rx="5" fill="white" opacity="0.06" />
            <rect x="14" y="5" width="52" height="4" rx="2" fill="white" opacity="0.7" />
            <rect x="20" y="11" width="40" height="2" rx="1" fill="white" opacity="0.25" />
            <circle cx="12" cy="32" r="9" fill="none" stroke={col} strokeWidth="1.5" strokeOpacity="0.8" />
            <circle cx="12" cy="32" r="7" fill="white" opacity="0.12" />
            <circle cx="30" cy="32" r="9" fill="none" stroke={col} strokeWidth="1.5" strokeOpacity="0.8" />
            <circle cx="30" cy="32" r="7" fill="white" opacity="0.12" />
            <circle cx="48" cy="32" r="9" fill="none" stroke={col} strokeWidth="1.5" strokeOpacity="0.8" />
            <circle cx="48" cy="32" r="7" fill="white" opacity="0.12" />
            <circle cx="66" cy="32" r="9" fill="none" stroke={col} strokeWidth="1.5" strokeOpacity="0.8" />
            <circle cx="66" cy="32" r="7" fill="white" opacity="0.12" />
            <rect x="5" y="22" width="12" height="6" rx="2" fill="white" opacity="0.2" />
            <rect x="23" y="22" width="12" height="6" rx="2" fill="white" opacity="0.2" />
            <rect x="41" y="22" width="12" height="6" rx="2" fill="white" opacity="0.2" />
            <rect x="59" y="22" width="12" height="6" rx="2" fill="white" opacity="0.2" />
            <rect x="10" y="44" width="60" height="2" rx="1" fill="white" opacity="0.2" />
        </svg>
    ),

    // ── seller_info: authority-split ─────────────────────────────────────────
    'authority-split': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" />
            <rect width="80" height="48" rx="3" stroke={col} strokeWidth="0.6" fill="none" />
            <circle cx="14" cy="20" r="9" fill={light} stroke={col} strokeWidth="0.8" />
            <rect x="6" y="31" width="16" height="3.5" rx="1.75" fill={col} opacity="0.7" />
            <rect x="28" y="11" width="30" height="3" rx="1" fill={col} opacity="0.85" />
            <rect x="28" y="17" width="22" height="2" rx="1" fill={col} opacity="0.25" />
            <rect x="28" y="23" width="26" height="2" rx="1" fill={col} opacity="0.4" />
            <rect x="28" y="29" width="18" height="2" rx="1" fill={col} opacity="0.2" />
        </svg>
    ),

    // ── seller_info: inline-ribbon ────────────────────────────────────────────
    'inline-ribbon': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" />
            <rect x="0" y="17" width="3" height="14" rx="1.5" fill={col} />
            <rect x="7" y="21" width="10" height="2.5" rx="1" fill={col} opacity="0.85" />
            <rect x="21" y="21" width="2" height="2.5" rx="1" fill={col} opacity="0.3" />
            <rect x="27" y="21" width="16" height="2.5" rx="1" fill={col} opacity="0.3" />
            <rect x="47" y="21" width="2" height="2.5" rx="1" fill={col} opacity="0.3" />
            <rect x="53" y="21" width="20" height="2.5" rx="1" fill={col} opacity="0.6" />
        </svg>
    ),

    // ── seller_info: metrics-grid ─────────────────────────────────────────────
    'metrics-grid': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" />
            <rect x="3" y="4" width="36" height="3" rx="1" fill={col} opacity="0.8" />
            <rect x="3" y="9" width="24" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="3" y="16" width="22" height="28" rx="2" fill={light} stroke={col} strokeWidth="0.5" />
            <rect x="3" y="16" width="22" height="3" rx="2" fill={col} opacity="0.6" />
            <rect x="29" y="16" width="22" height="28" rx="2" fill={light} stroke={col} strokeWidth="0.5" />
            <rect x="29" y="16" width="22" height="3" rx="2" fill="#b8fa33" opacity="0.8" />
            <rect x="55" y="16" width="22" height="28" rx="2" fill={light} stroke={col} strokeWidth="0.5" />
            <rect x="55" y="16" width="22" height="3" rx="2" fill="#10b981" opacity="0.7" />
        </svg>
    ),

    // ── seller_info: dark-executive ───────────────────────────────────────────
    'dark-executive': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect width="80" height="48" rx="3" stroke={col} strokeWidth="0.8" fill="none" />
            <circle cx="14" cy="24" r="8" fill={col} opacity="0.3" stroke={col} strokeWidth="0.8" />
            <rect x="27" y="17" width="24" height="3" rx="1" fill="#ffffff" opacity="0.9" />
            <rect x="27" y="23" width="18" height="2" rx="1" fill="#ffffff" opacity="0.3" />
            <rect x="27" y="28" width="22" height="3" rx="1.5" fill="none" stroke="#b8fa33" strokeWidth="0.6" />
            <rect x="58" y="20" width="18" height="8" rx="2" fill="none" stroke={col} strokeWidth="0.8" />
        </svg>
    ),

    // ── seller_info: storefront-split ─────────────────────────────────────────
    'storefront-split': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" />
            <rect width="80" height="48" rx="3" stroke={col} strokeWidth="0.5" fill="none" />
            <rect x="3" y="6" width="10" height="10" rx="2" fill={col} opacity="0.25" />
            <rect x="3" y="19" width="30" height="2.5" rx="1" fill={col} opacity="0.8" />
            <rect x="3" y="24" width="22" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="3" y="29" width="26" height="2" rx="1" fill={col} opacity="0.4" />
            <line x1="40" y1="6" x2="40" y2="42" stroke={col} strokeWidth="0.5" opacity="0.25" />
            <rect x="44" y="8" width="14" height="2" rx="1" fill={col} opacity="0.3" />
            <rect x="44" y="14" width="32" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="44" y="20" width="30" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="44" y="26" width="28" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="44" y="32" width="26" height="2" rx="1" fill={col} opacity="0.2" />
        </svg>
    ),

    // ── seller_info: glass-card ───────────────────────────────────────────────
    'glass-card': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <defs>
                <linearGradient id="gc-grad" x1="0" y1="0" x2="80" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor={col} /><stop offset="1" stopColor="#1e1535" />
                </linearGradient>
            </defs>
            {/* Gradient border wrapper */}
            <rect width="80" height="48" rx="6" fill="url(#gc-grad)" />
            {/* Frosted inner card */}
            <rect x="2" y="2" width="76" height="44" rx="5" fill="rgba(255,255,255,0.88)" />
            {/* Centered avatar circle */}
            <circle cx="40" cy="14" r="7" fill={col} opacity="0.85" stroke="#ffffff" strokeWidth="1.5" />
            {/* Store name bar */}
            <rect x="22" y="24" width="36" height="3" rx="1" fill={col} opacity="0.8" />
            {/* Tagline bar */}
            <rect x="26" y="29" width="28" height="2" rx="1" fill={col} opacity="0.2" />
            {/* Feedback pill */}
            <rect x="14" y="33" width="52" height="5" rx="2.5" fill={col} opacity="0.75" />
            {/* Trust footer strip */}
            <rect x="6" y="40" width="68" height="4" rx="2" fill={col} opacity="0.08" stroke={col} strokeWidth="0.4" />
        </svg>
    ),

    // ── seller_info: vertical-profile ─────────────────────────────────────────
    'vertical-profile': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.5" />
            <circle cx="40" cy="13" r="8" fill={light} stroke={col} strokeWidth="0.8" />
            <rect x="28" y="24" width="24" height="3" rx="1" fill={col} opacity="0.8" />
            <rect x="32" y="29" width="16" height="2" rx="1" fill={col} opacity="0.25" />
            <rect x="36" y="33" width="8" height="1.5" rx="0.75" fill={col} opacity="0.6" />
            <rect x="26" y="37" width="28" height="5" rx="2.5" fill={col} opacity="0.15" stroke={col} strokeWidth="0.5" />
        </svg>
    ),

    // ── seller_info: trust-ribbon-duo ─────────────────────────────────────────
    'trust-ribbon-duo': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" />
            <rect width="80" height="20" rx="3" fill={col} opacity="0.85" />
            <rect x="4" y="7" width="28" height="3" rx="1" fill="#ffffff" opacity="0.9" />
            <rect x="60" y="6.5" width="16" height="4" rx="2" fill="#b8fa33" opacity="0.9" />
            <rect x="4" y="26" width="16" height="5" rx="2.5" fill={light} stroke={col} strokeWidth="0.4" />
            <rect x="23" y="26" width="14" height="5" rx="2.5" fill={light} stroke={col} strokeWidth="0.4" />
            <rect x="40" y="26" width="16" height="5" rx="2.5" fill={light} stroke={col} strokeWidth="0.4" />
            <rect x="59" y="26" width="17" height="5" rx="2.5" fill={light} stroke={col} strokeWidth="0.4" />
        </svg>
    ),

    // ── seller_info: spotlight-banner ─────────────────────────────────────────
    'spotlight-banner': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <defs>
                <linearGradient id="sb-bg" x1="0" y1="0" x2="80" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor={col} />
                    <stop offset="1" stopColor="#1e1535" />
                </linearGradient>
            </defs>
            <rect width="80" height="48" rx="3" fill="url(#sb-bg)" />
            <rect x="4" y="13" width="32" height="4" rx="1" fill="#ffffff" opacity="0.9" />
            <rect x="4" y="21" width="22" height="2.5" rx="1" fill="#ffffff" opacity="0.35" />
            <rect x="4" y="27" width="20" height="2.5" rx="1" fill="#b8fa33" opacity="0.8" />
            <rect x="56" y="16" width="20" height="10" rx="3" fill="#ffffff" opacity="0.9" />
        </svg>
    ),

    // ── seller_info: compact-card-row ─────────────────────────────────────────
    'compact-card-row': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" />
            <rect x="2" y="6" width="23" height="36" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.5" />
            <rect x="2" y="39" width="23" height="3" rx="1.5" fill={col} opacity="0.7" />
            <rect x="5" y="12" width="8" height="8" rx="4" fill={light} />
            <rect x="5" y="23" width="16" height="2.5" rx="1" fill={col} opacity="0.7" />
            <rect x="5" y="28" width="12" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="29" y="6" width="23" height="36" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.5" />
            <rect x="29" y="39" width="23" height="3" rx="1.5" fill="#b8fa33" opacity="0.8" />
            <rect x="32" y="12" width="8" height="8" rx="4" fill={light} />
            <rect x="32" y="23" width="16" height="2.5" rx="1" fill={col} opacity="0.7" />
            <rect x="32" y="28" width="12" height="2" rx="1" fill={col} opacity="0.2" />
            <rect x="56" y="6" width="23" height="36" rx="3" fill="#ffffff" stroke={col} strokeWidth="0.5" />
            <rect x="56" y="39" width="23" height="3" rx="1.5" fill="#10b981" opacity="0.7" />
            <rect x="59" y="12" width="8" height="8" rx="4" fill={light} />
            <rect x="59" y="23" width="16" height="2.5" rx="1" fill={col} opacity="0.7" />
            <rect x="59" y="28" width="12" height="2" rx="1" fill={col} opacity="0.2" />
        </svg>
    ),

    // ── bundle_deal: tri-tier-columns ─────────────────────────────────────────
    'tri-tier-columns': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="5" y="11" width="20" height="26" rx="2" fill="rgba(255,255,255,0.06)" />
            <rect x="30" y="8" width="20" height="32" rx="2" fill="rgba(255,255,255,0.10)" />
            <rect x="30" y="8" width="20" height="3" rx="1" fill="#b8fa33" />
            <rect x="55" y="11" width="20" height="26" rx="2" fill="rgba(255,255,255,0.06)" />
            <rect x="32" y="16" width="16" height="3" rx="1" fill="#b8fa33" opacity="0.7" />
            <rect x="7" y="22" width="16" height="3" rx="1" fill="rgba(255,255,255,0.25)" />
            <rect x="32" y="22" width="16" height="4" rx="1" fill="rgba(255,255,255,0.5)" />
            <rect x="57" y="22" width="16" height="3" rx="1" fill="rgba(255,255,255,0.25)" />
        </svg>
    ),

    // ── bundle_deal: horizontal-ribbon ────────────────────────────────────────
    'horizontal-ribbon': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="5" y="16" width="70" height="16" rx="2" fill="rgba(255,255,255,0.07)" />
            <rect x="8" y="21" width="14" height="3" rx="1" fill="rgba(255,255,255,0.3)" />
            <rect x="30" y="21" width="12" height="3" rx="1" fill="rgba(255,255,255,0.3)" />
            <rect x="46" y="20" width="10" height="5" rx="2.5" fill="#b8fa33" />
            <rect x="62" y="21" width="11" height="3" rx="1" fill="rgba(255,255,255,0.3)" />
            <text x="25" y="27" fontFamily="Arial" fontSize="7" fill="rgba(255,255,255,0.2)">❯</text>
            <text x="58" y="27" fontFamily="Arial" fontSize="7" fill="rgba(255,255,255,0.2)">❯</text>
        </svg>
    ),

    // ── bundle_deal: stacked-rows ─────────────────────────────────────────────
    'stacked-rows': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="5" y="9" width="2" height="9" rx="1" fill="#b8fa33" opacity="0.3" />
            <rect x="5" y="21" width="4" height="9" rx="1" fill="#b8fa33" opacity="0.6" />
            <rect x="5" y="33" width="6" height="9" rx="1" fill="#b8fa33" />
            <rect x="12" y="11" width="42" height="5" rx="1.5" fill="rgba(255,255,255,0.15)" />
            <rect x="12" y="23" width="42" height="5" rx="1.5" fill="rgba(255,255,255,0.2)" />
            <rect x="12" y="35" width="42" height="5" rx="1.5" fill="rgba(255,255,255,0.28)" />
            <rect x="58" y="23" width="17" height="4" rx="2" fill="#b8fa33" />
            <rect x="58" y="35" width="17" height="4" rx="2" fill="#b8fa33" />
        </svg>
    ),

    // ── bundle_deal: floating-pill-grid ───────────────────────────────────────
    'floating-pill-grid': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="4" y="11" width="20" height="28" rx="3" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            <rect x="30" y="11" width="20" height="28" rx="3" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            <rect x="56" y="11" width="20" height="28" rx="3" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            <rect x="31" y="15" width="18" height="5" rx="2.5" fill="#b8fa33" />
            <rect x="57" y="15" width="18" height="5" rx="2.5" fill="#b8fa33" />
            <rect x="6" y="26" width="16" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
            <rect x="32" y="26" width="16" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
            <rect x="58" y="26" width="16" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
        </svg>
    ),

    // ── bundle_deal: split-hero ───────────────────────────────────────────────
    'split-hero': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <line x1="32" y1="6" x2="32" y2="42" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
            <rect x="5" y="13" width="22" height="5" rx="1.5" fill="rgba(255,255,255,0.4)" />
            <rect x="5" y="21" width="18" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
            <rect x="5" y="27" width="20" height="3" rx="1" fill="rgba(255,255,255,0.15)" />
            <rect x="36" y="9" width="39" height="8" rx="2" fill="rgba(255,255,255,0.07)" />
            <rect x="36" y="20" width="39" height="8" rx="2" fill="rgba(255,255,255,0.07)" />
            <rect x="36" y="31" width="39" height="8" rx="2" fill="rgba(255,255,255,0.07)" />
            <rect x="57" y="23" width="14" height="3" rx="1.5" fill="#b8fa33" />
            <rect x="57" y="34" width="14" height="3" rx="1.5" fill="#b8fa33" />
        </svg>
    ),

    // ── bundle_deal: minimal-monochrome ───────────────────────────────────────
    'minimal-monochrome': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.8" />
            <rect x="6" y="12" width="68" height="26" rx="2" fill="none" stroke="#e5e7eb" strokeWidth="0.8" />
            <line x1="30" y1="12" x2="30" y2="38" stroke="#e5e7eb" strokeWidth="0.8" />
            <line x1="54" y1="12" x2="54" y2="38" stroke="#e5e7eb" strokeWidth="0.8" />
            <rect x="9" y="21" width="16" height="4" rx="1.5" fill="#e5e7eb" />
            <rect x="33" y="21" width="14" height="4" rx="1.5" fill="#111827" />
            <rect x="57" y="21" width="14" height="4" rx="1.5" fill="#111827" />
            <rect x="32" y="29" width="16" height="4" rx="2" fill="#7530fb" />
            <rect x="56" y="29" width="16" height="4" rx="2" fill="#7530fb" />
        </svg>
    ),

    // ── bundle_deal: executive-highlight ─────────────────────────────────────
    'executive-highlight': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="4" y="12" width="20" height="26" rx="2" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
            <rect x="30" y="12" width="20" height="26" rx="2" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
            <rect x="56" y="8" width="20" height="30" rx="2" fill="rgba(255,255,255,0.08)" stroke="#b8fa33" strokeWidth="0.8" />
            <rect x="56" y="8" width="20" height="3" rx="1" fill="#b8fa33" />
            <rect x="58" y="16" width="16" height="4" rx="2" fill="#b8fa33" opacity="0.7" />
            <rect x="7" y="24" width="14" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
            <rect x="33" y="24" width="14" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
            <rect x="58" y="24" width="16" height="4" rx="1.5" fill="rgba(255,255,255,0.45)" />
            <rect x="58" y="32" width="14" height="3" rx="1" fill="#b8fa33" />
        </svg>
    ),

    // ── bundle_deal: dark-escalator ───────────────────────────────────────────
    'dark-escalator': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="4" y="11" width="20" height="26" rx="2" fill="rgba(255,255,255,0.04)" />
            <rect x="30" y="11" width="20" height="26" rx="2" fill="rgba(255,255,255,0.08)" />
            <rect x="56" y="11" width="20" height="26" rx="2" fill="#b8fa33" />
            <rect x="7" y="22" width="14" height="3" rx="1" fill="rgba(255,255,255,0.15)" />
            <rect x="33" y="22" width="14" height="3" rx="1" fill="rgba(255,255,255,0.3)" />
            <rect x="59" y="22" width="14" height="3" rx="1" fill="rgba(0,0,0,0.3)" />
        </svg>
    ),

    // ── bundle_deal: trophy-podium ────────────────────────────────────────────
    'trophy-podium': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="4" y="33" width="20" height="12" rx="2" fill="#6b7280" />
            <rect x="30" y="18" width="20" height="27" rx="2" fill="#f59e0b" />
            <rect x="56" y="27" width="20" height="18" rx="2" fill="#94a3b8" />
            <text x="14" y="30" fontFamily="Arial" fontSize="8" textAnchor="middle" fill="rgba(255,255,255,0.5)">🥉</text>
            <text x="40" y="15" fontFamily="Arial" fontSize="8" textAnchor="middle" fill="rgba(255,255,255,0.8)">🥇</text>
            <text x="66" y="24" fontFamily="Arial" fontSize="8" textAnchor="middle" fill="rgba(255,255,255,0.6)">🥈</text>
        </svg>
    ),

    // ── bundle_deal: countdown-strip ──────────────────────────────────────────
    'countdown-strip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="0" y="0" width="80" height="10" rx="3" fill="#dc2626" />
            <rect x="6" y="2" width="68" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
            <rect x="5" y="15" width="70" height="26" rx="2" fill="rgba(255,255,255,0.05)" />
            <rect x="9" y="23" width="18" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
            <rect x="31" y="23" width="18" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
            <rect x="53" y="23" width="18" height="3" rx="1" fill="rgba(255,255,255,0.2)" />
            <rect x="33" y="30" width="14" height="4" rx="2" fill="#b8fa33" />
            <rect x="55" y="30" width="14" height="4" rx="2" fill="#b8fa33" />
        </svg>
    ),

    // ── price_tag: classic-strike ─────────────────────────────────────────────
    'classic-strike': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="7" y="17" width="16" height="3" rx="1.5" fill="#94a3b8" />
            <line x1="6" y1="18.5" x2="24" y2="18.5" stroke="#64748b" strokeWidth="1" />
            <rect x="7" y="24" width="12" height="2" rx="1" fill="#cbd5e1" />
            <rect x="29" y="17" width="22" height="14" rx="2" fill="#1e1535" />
            <rect x="56" y="18" width="18" height="12" rx="2" fill="#dc2626" />
            <rect x="59" y="22" width="12" height="4" rx="1" fill="#ffffff" />
        </svg>
    ),

    // ── price_tag: minimalist-inline ──────────────────────────────────────────
    'minimalist-inline': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="6" y="20" width="7" height="8" rx="1" fill="#94a3b8" opacity="0.6" />
            <rect x="16" y="17" width="20" height="14" rx="2" fill="#1e1535" />
            <line x1="40" y1="24" x2="52" y2="24" stroke="#94a3b8" strokeWidth="1" />
            <rect x="40" y="22.5" width="12" height="3" rx="1" fill="#94a3b8" />
            <rect x="56" y="19" width="18" height="10" rx="5" fill="#16a34a" />
            <rect x="59" y="22.5" width="12" height="3" rx="1" fill="#ffffff" />
        </svg>
    ),

    // ── price_tag: stacked-deal-card ──────────────────────────────────────────
    'stacked-deal-card': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="25" y="8" width="30" height="3" rx="1.5" fill="#94a3b8" />
            <line x1="38" y1="9.5" x2="55" y2="9.5" stroke="#64748b" strokeWidth="0.8" />
            <rect x="23" y="14" width="34" height="13" rx="2" fill="#1e1535" />
            <rect x="0" y="34" width="80" height="14" rx="0" fill="#1e1535" />
            <rect x="18" y="39" width="44" height="4" rx="2" fill="#b8fa33" />
        </svg>
    ),

    // ── price_tag: discount-badge-pill ────────────────────────────────────────
    'discount-badge-pill': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="7" y="12" width="18" height="3" rx="1.5" fill="#94a3b8" />
            <rect x="7" y="18" width="30" height="13" rx="2" fill="#1e1535" />
            <rect x="7" y="34" width="22" height="3" rx="1" fill="#16a34a" />
            <rect x="46" y="15" width="28" height="18" rx="9" fill="#8fff00" />
            <rect x="51" y="22" width="18" height="4" rx="2" fill="#0a0d08" />
        </svg>
    ),

    // ── price_tag: dual-tone-split ────────────────────────────────────────────
    'dual-tone-split': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <path d="M50 0H77C78.6569 0 80 1.34315 80 3V45C80 46.6569 78.6569 48 77 48H50V0Z" fill="#1e1535" />
            <rect x="8" y="12" width="18" height="3" rx="1.5" fill="#94a3b8" />
            <rect x="8" y="18" width="28" height="12" rx="2" fill="#1e1535" />
            <rect x="8" y="33" width="24" height="3" rx="1" fill="#cbd5e1" />
            <rect x="56" y="14" width="18" height="3" rx="1" fill="rgba(255,255,255,0.6)" />
            <rect x="54" y="21" width="22" height="9" rx="2" fill="#b8fa33" />
            <rect x="57" y="34" width="16" height="3" rx="1" fill="#ffffff" />
        </svg>
    ),

    // ── price_tag: urgency-banner ─────────────────────────────────────────────
    'urgency-banner': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#fecaca" strokeWidth="0.8" />
            <rect x="0" y="0" width="80" height="11" rx="0" fill="#dc2626" />
            <rect x="14" y="4" width="52" height="3" rx="1.5" fill="#ffffff" />
            <rect x="7" y="18" width="14" height="3" rx="1" fill="#dc2626" />
            <rect x="7" y="24" width="28" height="12" rx="2" fill="#1e1535" />
            <rect x="50" y="22" width="24" height="14" rx="3" fill="#fee2e2" stroke="#fca5a5" strokeWidth="0.8" />
            <rect x="54" y="27" width="16" height="4" rx="1" fill="#b91c1c" />
        </svg>
    ),

    // ── price_tag: wholesale-b2b ──────────────────────────────────────────────
    'wholesale-b2b': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="0" y="0" width="80" height="12" fill="#f1f5f9" />
            <line x1="20" y1="0" x2="20" y2="48" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="44" y1="0" x2="44" y2="48" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="62" y1="0" x2="62" y2="48" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="12" x2="80" y2="12" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="4" y="24" width="12" height="3" rx="1" fill="#94a3b8" />
            <rect x="23" y="20" width="18" height="11" rx="2" fill="#0f172a" />
            <rect x="47" y="22" width="12" height="4" rx="1" fill="#16a34a" />
            <rect x="65" y="21" width="12" height="8" rx="2" fill="#e0f2fe" />
        </svg>
    ),

    // ── price_tag: modern-glassmorphism ───────────────────────────────────────
    'modern-glassmorphism': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#c7d2fe" strokeWidth="1" />
            <rect x="6" y="8" width="22" height="4" rx="2" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="0.5" />
            <rect x="6" y="16" width="32" height="13" rx="2" fill="#1e1b4b" />
            <rect x="6" y="33" width="24" height="3" rx="1.5" fill="#6366f1" />
            <rect x="48" y="16" width="26" height="16" rx="3" fill="#4338ca" />
            <rect x="52" y="22" width="18" height="4" rx="1" fill="#ffffff" />
        </svg>
    ),

    // ── price_tag: high-contrast-flash ────────────────────────────────────────
    'high-contrast-flash': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#0f172a" />
            <rect x="0" y="0" width="3.5" height="48" rx="1.5" fill="#8fff00" />
            <rect x="8" y="8" width="24" height="4" rx="1" fill="#8fff00" />
            <rect x="8" y="16" width="34" height="13" rx="2" fill="#ffffff" />
            <rect x="8" y="33" width="26" height="3" rx="1" fill="#8fff00" />
            <rect x="52" y="15" width="22" height="17" rx="3" fill="none" stroke="#8fff00" strokeWidth="0.8" strokeDasharray="2 1" />
            <rect x="56" y="21" width="14" height="5" rx="1" fill="#8fff00" />
        </svg>
    ),

    // ── price_tag: elite-luxury ───────────────────────────────────────────────
    'elite-luxury': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#d1d5db" strokeWidth="0.8" />
            <rect x="0" y="0" width="80" height="2.5" fill="#d97706" />
            <rect x="26" y="8" width="28" height="3" rx="1.5" fill="#d97706" />
            <rect x="22" y="15" width="36" height="12" rx="2" fill="#111827" />
            <rect x="18" y="31" width="44" height="2.5" rx="1" fill="#9ca3af" />
            <line x1="14" y1="38" x2="66" y2="38" stroke="#e5e7eb" strokeWidth="0.8" />
        </svg>
    ),

    // ── store_footer: classic-dark-band ───────────────────────────────────────
    'classic-dark-band': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="14" y="15" width="10" height="3" rx="1.5" fill="#ffffff" />
            <circle cx="28" cy="16.5" r="1" fill="rgba(255,255,255,0.4)" />
            <rect x="32" y="15" width="10" height="3" rx="1.5" fill="#ffffff" />
            <circle cx="46" cy="16.5" r="1" fill="rgba(255,255,255,0.4)" />
            <rect x="50" y="15" width="10" height="3" rx="1.5" fill="#ffffff" />
            <rect x="20" y="27" width="40" height="2" rx="1" fill="rgba(255,255,255,0.5)" />
        </svg>
    ),

    // ── store_footer: footer-minimalist-inline ────────────────────────────────
    'footer-minimalist-inline': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="12" x2="80" y2="12" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="22" width="22" height="3" rx="1" fill="#94a3b8" />
            <rect x="42" y="22" width="8" height="3" rx="1" fill="#475569" />
            <rect x="54" y="22" width="8" height="3" rx="1" fill="#475569" />
            <rect x="66" y="22" width="8" height="3" rx="1" fill="#475569" />
        </svg>
    ),

    // ── store_footer: two-column-brand-split ──────────────────────────────────
    'two-column-brand-split': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="8" y="14" width="16" height="5" rx="1.5" fill="#ffffff" />
            <rect x="26" y="15" width="10" height="3" rx="1.5" fill="#b8fa33" />
            <rect x="8" y="24" width="22" height="2" rx="1" fill="rgba(255,255,255,0.4)" />
            <rect x="46" y="15" width="13" height="4" rx="1.5" fill="rgba(255,255,255,0.12)" />
            <rect x="62" y="15" width="13" height="4" rx="1.5" fill="rgba(255,255,255,0.12)" />
            <rect x="54" y="23" width="14" height="4" rx="1.5" fill="rgba(255,255,255,0.12)" />
        </svg>
    ),

    // ── store_footer: trust-secure-payment-bar ────────────────────────────────
    'trust-secure-payment-bar': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="18" y="10" width="12" height="3" rx="1" fill="#1e293b" />
            <rect x="34" y="10" width="12" height="3" rx="1" fill="#1e293b" />
            <rect x="50" y="10" width="12" height="3" rx="1" fill="#1e293b" />
            <line x1="0" y1="20" x2="80" y2="20" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="0" y="20.5" width="80" height="27.5" fill="#ffffff" />
            <rect x="8" y="29" width="14" height="4" rx="1.5" fill="#dcfce7" stroke="#16a34a" strokeWidth="0.5" />
            <rect x="26" y="29" width="14" height="4" rx="1.5" fill="#e0f2fe" stroke="#0369a1" strokeWidth="0.5" />
            <rect x="48" y="29" width="24" height="2.5" rx="1" fill="#94a3b8" />
        </svg>
    ),

    // ── store_footer: multi-row-navigation-hub ────────────────────────────────
    'multi-row-navigation-hub': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="10" y="8" width="16" height="5" rx="2.5" fill="rgba(255,255,255,0.15)" />
            <rect x="30" y="8" width="18" height="5" rx="2.5" fill="rgba(255,255,255,0.15)" />
            <rect x="52" y="8" width="16" height="5" rx="2.5" fill="rgba(255,255,255,0.15)" />
            <rect x="18" y="19" width="12" height="3" rx="1" fill="#b8fa33" />
            <rect x="34" y="19" width="12" height="3" rx="1" fill="#b8fa33" />
            <rect x="50" y="19" width="12" height="3" rx="1" fill="#b8fa33" />
            <line x1="16" y1="29" x2="64" y2="29" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
            <rect x="22" y="34" width="36" height="2.5" rx="1" fill="rgba(255,255,255,0.5)" />
        </svg>
    ),

    // ── store_footer: executive-dark-accent ───────────────────────────────────
    'executive-dark-accent': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#0f172a" stroke="#1e293b" strokeWidth="0.8" />
            <rect x="20" y="8" width="40" height="12" rx="3" fill="#b8fa33" />
            <rect x="28" y="12.5" width="24" height="3" rx="1" fill="#1e1535" />
            <rect x="16" y="26" width="12" height="3" rx="1" fill="#ffffff" />
            <rect x="34" y="26" width="12" height="3" rx="1" fill="#ffffff" />
            <rect x="52" y="26" width="12" height="3" rx="1" fill="#ffffff" />
            <rect x="24" y="36" width="32" height="2" rx="1" fill="rgba(255,255,255,0.4)" />
        </svg>
    ),

    // ── store_footer: footer-modern-glass ─────────────────────────────────────
    'footer-modern-glass': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
            <circle cx="12" cy="18" r="2" fill="#4ade80" />
            <rect x="17" y="16" width="16" height="4" rx="1" fill="#ffffff" />
            <rect x="10" y="26" width="22" height="2" rx="1" fill="rgba(255,255,255,0.5)" />
            <rect x="42" y="16" width="14" height="6" rx="2" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            <rect x="60" y="16" width="14" height="6" rx="2" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        </svg>
    ),

    // ── store_footer: wholesale-compliance ────────────────────────────────────
    'wholesale-compliance': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="0" y="0" width="80" height="18" fill="#f1f5f9" />
            <rect x="8" y="5" width="32" height="3" rx="1" fill="#0f172a" />
            <rect x="8" y="10" width="64" height="2" rx="1" fill="#94a3b8" />
            <line x1="0" y1="18" x2="80" y2="18" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="8" y="27" width="12" height="3" rx="1" fill="#0f172a" />
            <rect x="24" y="27" width="12" height="3" rx="1" fill="#0f172a" />
            <rect x="46" y="27" width="26" height="2.5" rx="1" fill="#94a3b8" />
        </svg>
    ),

    // ── store_footer: spotlight-policy ────────────────────────────────────────
    'spotlight-policy': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="10" y="8" width="14" height="8" rx="2" fill="#eff6ff" />
            <rect x="33" y="8" width="14" height="8" rx="2" fill="#eff6ff" />
            <rect x="56" y="8" width="14" height="8" rx="2" fill="#eff6ff" />
            <rect x="9" y="19" width="16" height="2" rx="1" fill="#1e1535" />
            <rect x="32" y="19" width="16" height="2" rx="1" fill="#1e1535" />
            <rect x="55" y="19" width="16" height="2" rx="1" fill="#1e1535" />
            <line x1="0" y1="26" x2="80" y2="26" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="0" y="26.5" width="80" height="21.5" fill="#f8fafc" />
            <rect x="12" y="34" width="12" height="3" rx="1" fill="#1e1535" />
            <rect x="28" y="34" width="12" height="3" rx="1" fill="#1e1535" />
            <rect x="48" y="34" width="22" height="2.5" rx="1" fill="#94a3b8" />
        </svg>
    ),

    // ── store_footer: footer-elite-luxury ─────────────────────────────────────
    'footer-elite-luxury': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.8" />
            <rect x="0" y="0" width="80" height="2.5" fill="#d97706" />
            <rect x="26" y="8" width="28" height="2.5" rx="1" fill="#d97706" />
            <line x1="18" y1="16" x2="62" y2="16" stroke="#e5e7eb" strokeWidth="0.8" />
            <rect x="22" y="21" width="10" height="3" rx="1" fill="#111827" />
            <rect x="36" y="21" width="8" height="3" rx="1" fill="#111827" />
            <rect x="48" y="21" width="10" height="3" rx="1" fill="#111827" />
            <line x1="18" y1="29" x2="62" y2="29" stroke="#e5e7eb" strokeWidth="0.8" />
            <rect x="25" y="35" width="30" height="2" rx="1" fill="#9ca3af" />
        </svg>
    ),

    // ── category_nav: cat-classic-dark ────────────────────────────────────────
    'cat-classic-dark': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="6" y="21" width="12" height="6" rx="2" fill="#b8fa33" />
            <rect x="22" y="22.5" width="12" height="3" rx="1.5" fill="#ffffff" opacity="0.9" />
            <rect x="38" y="22.5" width="14" height="3" rx="1.5" fill="#ffffff" opacity="0.9" />
            <rect x="56" y="22.5" width="16" height="3" rx="1.5" fill="#ffffff" opacity="0.9" />
        </svg>
    ),

    // ── category_nav: cat-minimalist-divider ──────────────────────────────────
    'cat-minimalist-divider': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="14" x2="80" y2="14" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="34" x2="80" y2="34" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="8" y="22" width="12" height="3" rx="1.5" fill="#475569" />
            <line x1="24" y1="21" x2="24" y2="26" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="28" y="22" width="12" height="3" rx="1.5" fill="#475569" />
            <line x1="44" y1="21" x2="44" y2="26" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="48" y="22" width="12" height="3" rx="1.5" fill="#475569" />
            <line x1="64" y1="21" x2="64" y2="26" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="68" y="22" width="8" height="3" rx="1.5" fill="#475569" />
        </svg>
    ),

    // ── category_nav: cat-pill-badge ──────────────────────────────────────────
    'cat-pill-badge': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="5" y="18" width="16" height="12" rx="6" fill="#b8fa33" />
            <rect x="24" y="18" width="16" height="12" rx="6" fill="rgba(255,255,255,0.12)" />
            <rect x="43" y="18" width="16" height="12" rx="6" fill="rgba(255,255,255,0.12)" />
            <rect x="62" y="18" width="14" height="12" rx="6" fill="rgba(255,255,255,0.12)" />
        </svg>
    ),

    // ── category_nav: cat-subtle-underline ────────────────────────────────────
    'cat-subtle-underline': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="36" x2="80" y2="36" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="8" y="20" width="14" height="4" rx="1" fill="#7530fb" />
            <rect x="8" y="28" width="14" height="2" rx="1" fill="#7530fb" />
            <rect x="28" y="20" width="14" height="4" rx="1" fill="#1e293b" opacity="0.6" />
            <rect x="48" y="20" width="14" height="4" rx="1" fill="#1e293b" opacity="0.6" />
            <rect x="68" y="20" width="8" height="4" rx="1" fill="#1e293b" opacity="0.6" />
        </svg>
    ),

    // ── category_nav: cat-two-tier-grid ───────────────────────────────────────
    'cat-two-tier-grid': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" />
            <rect x="6" y="11" width="18" height="10" rx="3" fill="#b8fa33" />
            <rect x="28" y="11" width="22" height="10" rx="3" fill="rgba(255,255,255,0.1)" />
            <rect x="54" y="11" width="20" height="10" rx="3" fill="rgba(255,255,255,0.1)" />
            <rect x="10" y="26" width="20" height="10" rx="3" fill="rgba(255,255,255,0.1)" />
            <rect x="34" y="26" width="20" height="10" rx="3" fill="rgba(255,255,255,0.1)" />
            <rect x="58" y="26" width="16" height="10" rx="3" fill="rgba(255,255,255,0.1)" />
        </svg>
    ),

    // ── category_nav: cat-icon-hybrid ─────────────────────────────────────────
    'cat-icon-hybrid': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="4" y="16" width="22" height="16" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.6" />
            <circle cx="9" cy="24" r="2.5" fill="#3b82f6" />
            <rect x="14" y="22.5" width="9" height="3" rx="1" fill="#1e1535" />
            <rect x="29" y="16" width="22" height="16" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.6" />
            <circle cx="34" cy="24" r="2.5" fill="#10b981" />
            <rect x="39" y="22.5" width="9" height="3" rx="1" fill="#1e1535" />
            <rect x="54" y="16" width="22" height="16" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.6" />
            <circle cx="59" cy="24" r="2.5" fill="#f59e0b" />
            <rect x="64" y="22.5" width="9" height="3" rx="1" fill="#1e1535" />
        </svg>
    ),

    // ── category_nav: cat-modern-glass ────────────────────────────────────────
    'cat-modern-glass': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#1e1535" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
            <rect x="6" y="18" width="16" height="12" rx="3" fill="#b8fa33" />
            <rect x="26" y="18" width="15" height="12" rx="3" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            <rect x="45" y="18" width="15" height="12" rx="3" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            <rect x="64" y="18" width="11" height="12" rx="3" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        </svg>
    ),

    // ── category_nav: cat-wholesale-jump ──────────────────────────────────────
    'cat-wholesale-jump': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="20" y1="10" x2="20" y2="38" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="40" y1="10" x2="40" y2="38" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="60" y1="10" x2="60" y2="38" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="0" y="10" width="20" height="28" fill="#e2e8f0" />
            <rect x="4" y="22.5" width="12" height="3" rx="1" fill="#0f172a" />
            <rect x="24" y="22.5" width="12" height="3" rx="1" fill="#0f172a" />
            <rect x="44" y="22.5" width="12" height="3" rx="1" fill="#0f172a" />
            <rect x="64" y="22.5" width="12" height="3" rx="1" fill="#0f172a" />
        </svg>
    ),

    // ── category_nav: cat-high-contrast-flash ─────────────────────────────────
    'cat-high-contrast-flash': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#dc2626" />
            <rect x="6" y="21" width="14" height="6" rx="2" fill="#ffffff" />
            <rect x="24" y="22.5" width="12" height="3" rx="1.5" fill="#ffffff" />
            <rect x="40" y="22.5" width="14" height="3" rx="1.5" fill="#ffffff" />
            <rect x="58" y="22.5" width="16" height="3" rx="1.5" fill="#ffffff" />
        </svg>
    ),

    // ── category_nav: cat-elite-luxury ────────────────────────────────────────
    'cat-elite-luxury': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.8" />
            <line x1="0" y1="12" x2="80" y2="12" stroke="#d97706" strokeWidth="1" />
            <line x1="0" y1="36" x2="80" y2="36" stroke="#d97706" strokeWidth="1" />
            <circle cx="40" cy="18" r="1.5" fill="#d97706" />
            <rect x="12" y="24" width="12" height="3" rx="1" fill="#111827" />
            <circle cx="30" cy="25.5" r="1" fill="#d97706" />
            <rect x="35" y="24" width="10" height="3" rx="1" fill="#111827" />
            <circle cx="50" cy="25.5" r="1" fill="#d97706" />
            <rect x="55" y="24" width="12" height="3" rx="1" fill="#111827" />
        </svg>
    ),

    // ── seasonal_banner: 10 Styles ──────────────────────────────────────────
    'seasonal-festive-ribbon': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#dc2626" />
            <rect x="28" y="10" width="24" height="4" rx="2" fill="#fef08a" opacity="0.9" />
            <rect x="14" y="18" width="52" height="6" rx="2" fill="#ffffff" />
            <rect x="20" y="28" width="40" height="4" rx="1.5" fill="#ffffff" opacity="0.8" />
        </svg>
    ),

    'seasonal-neon-cyber': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#09090b" />
            <rect x="2" y="2" width="76" height="44" rx="3" stroke="#22d3ee" strokeWidth="1.5" />
            <rect x="24" y="10" width="32" height="4" rx="1" fill="#22d3ee" opacity="0.85" />
            <rect x="14" y="18" width="52" height="6" rx="1.5" fill="#ffffff" />
            <rect x="22" y="28" width="36" height="4" rx="1" fill="#22d3ee" opacity="0.75" />
        </svg>
    ),

    'seasonal-dualtone-split': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#1e1b4b" />
            <rect width="28" height="48" rx="4" fill="#ec4899" />
            <rect x="5" y="15" width="18" height="8" rx="2" fill="#ffffff" />
            <rect x="7" y="26" width="14" height="4" rx="1" fill="#ffffff" opacity="0.8" />
            <rect x="34" y="14" width="38" height="5" rx="1.5" fill="#f472b6" />
            <rect x="34" y="23" width="40" height="6" rx="1.5" fill="#ffffff" />
            <rect x="34" y="32" width="32" height="4" rx="1" fill="#ffffff" opacity="0.7" />
        </svg>
    ),

    'seasonal-countdown-urgency': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#111827" />
            <rect x="1" y="1" width="78" height="46" rx="3" stroke="#ef4444" strokeWidth="1" />
            <rect x="8" y="14" width="32" height="6" rx="1.5" fill="#ffffff" />
            <rect x="8" y="24" width="26" height="4" rx="1" fill="#9ca3af" />
            {/* 3 countdown boxes */}
            <rect x="44" y="16" width="9" height="15" rx="2" fill="#1f2937" stroke="#ef4444" strokeWidth="0.8" />
            <circle cx="55.5" cy="21" r="0.8" fill="#ef4444" />
            <circle cx="55.5" cy="26" r="0.8" fill="#ef4444" />
            <rect x="58" y="16" width="9" height="15" rx="2" fill="#1f2937" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx="69.5" cy="21" r="0.8" fill="#ef4444" />
            <circle cx="69.5" cy="26" r="0.8" fill="#ef4444" />
            <rect x="71" y="16" width="7" height="15" rx="2" fill="#1f2937" stroke="#ffffff" strokeWidth="0.8" />
        </svg>
    ),

    'seasonal-minimalist-elegance': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fafaf9" stroke="#e7e5e4" strokeWidth="1" />
            <rect x="8" y="8" width="64" height="32" rx="2" stroke="#b45309" strokeWidth="0.8" strokeOpacity="0.4" />
            <rect x="28" y="14" width="24" height="3" rx="1" fill="#b45309" />
            <rect x="18" y="21" width="44" height="5" rx="1" fill="#1c1917" />
            <rect x="24" y="29" width="32" height="3" rx="1" fill="#78716c" />
        </svg>
    ),

    'seasonal-glassmorphism-frost': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" />
            <rect x="6" y="6" width="68" height="36" rx="4" fill="#ffffff" fillOpacity="0.12" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.25" />
            <rect x="28" y="12" width="24" height="4" rx="2" fill="#93c5fd" />
            <rect x="14" y="20" width="52" height="6" rx="1.5" fill="#ffffff" />
            <rect x="20" y="29" width="40" height="4" rx="1" fill="#ffffff" fillOpacity="0.7" />
        </svg>
    ),

    'seasonal-gradient-burst': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <defs>
                <linearGradient id="gb-thumb" x1="0" y1="0" x2="80" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366f1" />
                    <stop offset="0.5" stopColor="#ec4899" />
                    <stop offset="1" stopColor="#f97316" />
                </linearGradient>
            </defs>
            <rect width="80" height="48" rx="4" fill="url(#gb-thumb)" />
            <rect x="26" y="9" width="28" height="4" rx="2" fill="#000000" fillOpacity="0.3" stroke="#ffffff" strokeWidth="0.6" />
            <rect x="12" y="18" width="56" height="7" rx="1.5" fill="#ffffff" />
            <rect x="20" y="29" width="40" height="4" rx="1" fill="#ffffff" fillOpacity="0.85" />
        </svg>
    ),

    'seasonal-wholesale-strobe': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#f59e0b" stroke="#b45309" strokeWidth="1.2" />
            <path d="M12 28L18 16L24 28Z" fill="#78350f" />
            <rect x="28" y="13" width="30" height="4" rx="1" fill="#78350f" />
            <rect x="28" y="20" width="44" height="6" rx="1.5" fill="#0f172a" />
            <rect x="28" y="29" width="38" height="4" rx="1" fill="#451a03" />
        </svg>
    ),

    'seasonal-gift-card': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="6" fill="#065f46" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.3" />
            <rect x="26" y="9" width="28" height="4" rx="2" fill="#ffffff" fillOpacity="0.2" />
            <rect x="14" y="18" width="52" height="6" rx="1.5" fill="#ffffff" />
            <rect x="20" y="28" width="40" height="4" rx="1" fill="#a7f3d0" />
        </svg>
    ),

    'seasonal-elite-luxury': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" />
            <line x1="0" y1="4" x2="80" y2="4" stroke="#d4af37" strokeWidth="1" />
            <line x1="0" y1="44" x2="80" y2="44" stroke="#d4af37" strokeWidth="1" />
            <circle cx="40" cy="12" r="1.5" fill="#d4af37" />
            <rect x="12" y="19" width="56" height="5" rx="1" fill="#f8fafc" />
            <rect x="22" y="28" width="36" height="3" rx="1" fill="#94a3b8" />
        </svg>
    ),

    // ── money_back: 10 Styles ───────────────────────────────────────────────
    'mb-trust-shield-green': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1" />
            <circle cx="40" cy="14" r="6" fill="#dcfce7" stroke="#86efac" strokeWidth="0.8" />
            <path d="M38 14L40 16L43 12" stroke="#16a34a" strokeWidth="1" strokeLinecap="round" />
            <rect x="18" y="24" width="44" height="5" rx="1.5" fill="#166534" />
            <rect x="22" y="32" width="36" height="3" rx="1" fill="#15803d" opacity="0.8" />
        </svg>
    ),

    'mb-minimalist-outline': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.2" />
            <rect x="8" y="14" width="16" height="20" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <path d="M13 24L15.5 26.5L19 21.5" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
            <rect x="30" y="14" width="22" height="3" rx="1" fill="#0284c7" />
            <rect x="30" y="21" width="42" height="5" rx="1.5" fill="#0f172a" />
            <rect x="30" y="29" width="36" height="3" rx="1" fill="#64748b" />
        </svg>
    ),

    'mb-bold-dark-trust': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="24" y="9" width="32" height="4" rx="2" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="0.8" />
            <rect x="14" y="18" width="52" height="6" rx="1.5" fill="#ffffff" />
            <rect x="20" y="28" width="40" height="4" rx="1" fill="#94a3b8" />
        </svg>
    ),

    'mb-dualtone-split': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#1e1b4b" />
            <rect width="28" height="48" rx="4" fill="#6366f1" />
            <rect x="5" y="16" width="18" height="7" rx="1.5" fill="#ffffff" />
            <rect x="7" y="26" width="14" height="3" rx="1" fill="#ffffff" opacity="0.8" />
            <rect x="34" y="14" width="28" height="3" rx="1" fill="#a5b4fc" />
            <rect x="34" y="21" width="40" height="5" rx="1.5" fill="#ffffff" />
            <rect x="34" y="30" width="34" height="3" rx="1" fill="#ffffff" opacity="0.75" />
        </svg>
    ),

    'mb-golden-elite': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fafaf9" stroke="#e7e5e4" strokeWidth="1" />
            <rect x="8" y="7" width="64" height="34" rx="2" stroke="#b45309" strokeWidth="0.8" strokeOpacity="0.4" />
            <rect x="26" y="13" width="28" height="3" rx="1" fill="#b45309" />
            <rect x="16" y="20" width="48" height="5" rx="1" fill="#1c1917" />
            <rect x="22" y="28" width="36" height="3" rx="1" fill="#78716c" />
        </svg>
    ),

    'mb-glassmorphism-trust': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" />
            <rect x="6" y="6" width="68" height="36" rx="4" fill="#ffffff" fillOpacity="0.12" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.25" />
            <rect x="26" y="11" width="28" height="4" rx="2" fill="#38bdf8" />
            <rect x="14" y="19" width="52" height="5" rx="1.5" fill="#ffffff" />
            <rect x="20" y="28" width="40" height="3" rx="1" fill="#ffffff" fillOpacity="0.7" />
        </svg>
    ),

    'mb-gradient-trust': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <defs>
                <linearGradient id="gt-thumb" x1="0" y1="0" x2="80" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0d9488" />
                    <stop offset="1" stopColor="#059669" />
                </linearGradient>
            </defs>
            <rect width="80" height="48" rx="4" fill="url(#gt-thumb)" />
            <rect x="26" y="9" width="28" height="4" rx="2" fill="#000000" fillOpacity="0.25" stroke="#ffffff" strokeWidth="0.6" />
            <rect x="12" y="18" width="56" height="6" rx="1.5" fill="#ffffff" />
            <rect x="20" y="28" width="40" height="4" rx="1" fill="#ffffff" fillOpacity="0.85" />
        </svg>
    ),

    'mb-risk-free-card': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            <circle cx="20" cy="24" r="8" fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="1" />
            <path d="M17 24L19.5 26.5L23.5 21.5" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="34" y="14" width="22" height="3" rx="1" fill="#0f172a" />
            <rect x="34" y="21" width="38" height="5" rx="1.5" fill="#0f172a" />
            <rect x="34" y="29" width="30" height="3" rx="1" fill="#64748b" />
        </svg>
    ),

    'mb-neon-secure': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#09090b" />
            <rect x="2" y="2" width="76" height="44" rx="3" stroke="#10b981" strokeWidth="1.5" />
            <rect x="22" y="9" width="36" height="4" rx="1" fill="#10b981" opacity="0.85" />
            <rect x="14" y="18" width="52" height="6" rx="1.5" fill="#ffffff" />
            <rect x="20" y="28" width="40" height="4" rx="1" fill="#10b981" opacity="0.75" />
        </svg>
    ),

    'mb-verified-banner': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="0" y1="2" x2="80" y2="2" stroke="#0284c7" strokeWidth="2.5" />
            <circle cx="16" cy="24" r="5" fill="#0284c7" />
            <path d="M14 24L15.5 25.5L18.5 22" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
            <rect x="26" y="14" width="36" height="3" rx="1" fill="#0284c7" />
            <rect x="26" y="20" width="46" height="5" rx="1.5" fill="#0f172a" />
            <rect x="26" y="28" width="40" height="3" rx="1" fill="#475569" />
        </svg>
    ),

    // ── free_shipping: 10 Styles ─────────────────────────────────────────────
    'ship-express-courier-strip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" />
            <rect x="8" y="10" width="22" height="4" rx="1.5" fill="#f59e0b" />
            <rect x="8" y="18" width="36" height="5" rx="1" fill="#ffffff" />
            <rect x="8" y="27" width="28" height="3" rx="1" fill="#94a3b8" />
            <rect x="50" y="12" width="22" height="24" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
            <rect x="53" y="17" width="16" height="3" rx="0.5" fill="#f59e0b" />
            <rect x="54" y="23" width="14" height="2.5" rx="0.5" fill="#38bdf8" />
        </svg>
    ),

    'ship-two-tone-split': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <path d="M 0 4 Q 0 0 4 0 L 26 0 L 26 48 L 4 48 Q 0 48 0 44 Z" fill="#2563eb" />
            <rect x="6" y="11" width="14" height="3" rx="0.8" fill="#bfdbfe" />
            <rect x="4" y="17" width="18" height="9" rx="1" fill="#ffffff" />
            <rect x="32" y="11" width="36" height="4" rx="1" fill="#1e3a8a" />
            <rect x="32" y="18" width="42" height="3" rx="0.5" fill="#64748b" />
            <circle cx="34" cy="26" r="1.5" fill="#16a34a" />
            <rect x="38" y="25" width="32" height="2" rx="0.5" fill="#334155" />
            <circle cx="34" cy="33" r="1.5" fill="#16a34a" />
            <rect x="38" y="32" width="28" height="2" rx="0.5" fill="#334155" />
        </svg>
    ),

    'ship-warehouse-direct-matrix': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="0" y="0" width="80" height="3" fill="#2563eb" />
            <rect x="6" y="7" width="26" height="3" rx="0.8" fill="#2563eb" />
            <rect x="52" y="6" width="22" height="4" rx="1.5" fill="#16a34a" />
            <rect x="5" y="14" width="21" height="26" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="15.5" cy="20" r="2.5" fill="#2563eb" />
            <rect x="8" y="26" width="15" height="3" rx="0.5" fill="#0f172a" />
            <rect x="29.5" y="14" width="21" height="26" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="40" cy="20" r="2.5" fill="#2563eb" />
            <rect x="32.5" y="26" width="15" height="3" rx="0.5" fill="#0f172a" />
            <rect x="54" y="14" width="21" height="26" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="64.5" cy="20" r="2.5" fill="#2563eb" />
            <rect x="57" y="26" width="15" height="3" rx="0.5" fill="#0f172a" />
        </svg>
    ),

    'ship-minimalist-editorial': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="12" x2="80" y2="12" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="0" y1="36" x2="80" y2="36" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="16" y="18" width="48" height="4" rx="1" fill="#0f172a" />
            <rect x="12" y="26" width="56" height="2.5" rx="0.5" fill="#64748b" />
        </svg>
    ),

    'ship-parcel-post-ticket': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fefce8" stroke="#b45309" strokeWidth="1.2" strokeDasharray="3 2" />
            <circle cx="16" cy="24" r="8" fill="none" stroke="#b45309" strokeWidth="1" />
            <line x1="10" y1="24" x2="22" y2="24" stroke="#b45309" strokeWidth="0.8" />
            <line x1="28" y1="10" x2="28" y2="38" stroke="#d97706" strokeWidth="0.8" strokeDasharray="2 1.5" />
            <rect x="32" y="12" width="22" height="3" rx="0.5" fill="#b45309" />
            <rect x="32" y="18" width="28" height="4" rx="1" fill="#451a03" />
            <rect x="32" y="27" width="20" height="4" rx="0.5" fill="#92400e" opacity="0.6" />
            <rect x="62" y="14" width="13" height="20" rx="2" fill="#ffffff" stroke="#d97706" strokeWidth="0.8" />
            <rect x="64" y="20" width="9" height="3" rx="0.5" fill="#b45309" />
        </svg>
    ),

    'ship-stepper-tracker-bar': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="24" y="8" width="32" height="3.5" rx="1" fill="#0f172a" />
            <line x1="14" y1="22" x2="66" y2="22" stroke="#cbd5e1" strokeWidth="1.5" />
            <circle cx="15" cy="22" r="3.5" fill="#16a34a" />
            <circle cx="32" cy="22" r="3.5" fill="#16a34a" />
            <circle cx="48" cy="22" r="3.5" fill="#2563eb" />
            <circle cx="65" cy="22" r="3.5" fill="#0f172a" />
            <rect x="8" y="30" width="14" height="2.5" rx="0.5" fill="#334155" />
            <rect x="25" y="30" width="14" height="2.5" rx="0.5" fill="#334155" />
            <rect x="41" y="30" width="14" height="2.5" rx="0.5" fill="#334155" />
            <rect x="58" y="30" width="14" height="2.5" rx="0.5" fill="#16a34a" />
        </svg>
    ),

    'ship-heavy-duty-cargo': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" stroke="#facc15" strokeWidth="1" />
            <rect x="0" y="0" width="80" height="4" fill="#facc15" />
            <rect x="8" y="14" width="42" height="6" rx="1" fill="#facc15" />
            <rect x="8" y="24" width="36" height="3" rx="0.5" fill="#d4d4d8" />
            <rect x="56" y="14" width="18" height="20" rx="2" fill="#27272a" stroke="#3f3f46" strokeWidth="0.8" />
            <rect x="59" y="20" width="12" height="3" rx="0.5" fill="#facc15" />
        </svg>
    ),

    'ship-global-transit-matrix': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0c4a6e" />
            <rect x="24" y="8" width="32" height="3.5" rx="1" fill="#38bdf8" />
            <rect x="6" y="16" width="32" height="22" rx="2" fill="#075985" stroke="#0284c7" strokeWidth="0.6" />
            <rect x="9" y="20" width="16" height="3" rx="0.5" fill="#38bdf8" />
            <rect x="9" y="26" width="24" height="3.5" rx="0.5" fill="#ffffff" />
            <rect x="42" y="16" width="32" height="22" rx="2" fill="#075985" stroke="#0284c7" strokeWidth="0.6" />
            <rect x="45" y="20" width="18" height="3" rx="0.5" fill="#38bdf8" />
            <rect x="45" y="26" width="24" height="3.5" rx="0.5" fill="#ffffff" />
        </svg>
    ),

    'ship-urgent-cutoff-bar': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#064e3b" stroke="#059669" strokeWidth="1" />
            <circle cx="8" cy="14" r="2.5" fill="#10b981" />
            <rect x="14" y="12" width="24" height="3.5" rx="0.5" fill="#34d399" />
            <rect x="7" y="19" width="38" height="5" rx="1" fill="#ffffff" />
            <rect x="7" y="28" width="30" height="3" rx="0.5" fill="#a7f3d0" />
            <rect x="49" y="11" width="25" height="25" rx="3" fill="#022c22" stroke="#047857" strokeWidth="0.8" />
            <rect x="52" y="16" width="19" height="2.5" rx="0.5" fill="#6ee7b7" />
            <rect x="52" y="22" width="19" height="6" rx="1" fill="#ffffff" />
        </svg>
    ),

    'ship-white-glove-guarantee': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fafaf9" stroke="#b45309" strokeWidth="1" />
            <rect x="5" y="5" width="70" height="38" rx="2" fill="none" stroke="#b45309" strokeWidth="0.7" />
            <circle cx="40" cy="12" r="2.5" fill="#b45309" />
            <rect x="26" y="17" width="28" height="3" rx="0.5" fill="#b45309" />
            <rect x="16" y="23" width="48" height="5" rx="1" fill="#1c1917" />
            <rect x="22" y="32" width="36" height="2.5" rx="0.5" fill="#78716c" />
        </svg>
    ),

    // ── Limited Time Offer Variants ─────────────────────────────────────
    'lto-flash-sale-ticker': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#dc2626" />
            <rect x="5" y="8" width="24" height="6" rx="2" fill="#991b1b" />
            <rect x="5" y="18" width="38" height="5" rx="1" fill="#ffffff" />
            <rect x="5" y="27" width="30" height="3" rx="1" fill="#fee2e2" />
            {/* 4 Digital Timer Boxes */}
            <rect x="47" y="15" width="6" height="12" rx="1" fill="#18181b" />
            <rect x="55" y="15" width="6" height="12" rx="1" fill="#18181b" />
            <rect x="63" y="15" width="6" height="12" rx="1" fill="#18181b" />
            <rect x="71" y="15" width="6" height="12" rx="1" fill="#18181b" />
        </svg>
    ),

    'lto-clearance-stamped-tag': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fffdfa" stroke="#d6d3d1" strokeWidth="1" />
            {/* Stamp Circle */}
            <circle cx="16" cy="24" r="10" stroke="#b91c1c" strokeWidth="1.5" strokeDasharray="2 1" />
            <rect x="31" y="12" width="22" height="4" rx="1" fill="#fee2e2" />
            <rect x="31" y="20" width="28" height="4" rx="1" fill="#1c1917" />
            <rect x="31" y="27" width="20" height="3" rx="1" fill="#78716c" />
            {/* Right Tag Border */}
            <line x1="62" y1="6" x2="62" y2="42" stroke="#d6d3d1" strokeWidth="1" strokeDasharray="2 2" />
            <rect x="65" y="18" width="11" height="8" rx="2" fill="#b91c1c" />
        </svg>
    ),

    'lto-midnight-vip-exclusive': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#09090b" stroke="#d4af37" strokeWidth="1.2" />
            {/* Gold Diamond Crest */}
            <polygon points="12,12 15,16 12,20 9,16" fill="#d4af37" />
            <rect x="18" y="13" width="25" height="4" rx="1" fill="#d4af37" />
            <rect x="9" y="22" width="44" height="4" rx="1" fill="#fafafa" />
            <rect x="9" y="29" width="34" height="3" rx="1" fill="#a1a1aa" />
            {/* Gold Badge */}
            <rect x="58" y="14" width="17" height="18" rx="2" fill="#18181b" stroke="#d4af37" strokeWidth="1" />
        </svg>
    ),

    'lto-industrial-hazard-alert': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" stroke="#f59e0b" strokeWidth="1" />
            {/* Top Hazard Caution Stripe */}
            <rect width="80" height="6" fill="#f59e0b" />
            <line x1="10" y1="0" x2="16" y2="6" stroke="#000000" strokeWidth="1.5" />
            <line x1="25" y1="0" x2="31" y2="6" stroke="#000000" strokeWidth="1.5" />
            <line x1="40" y1="0" x2="46" y2="6" stroke="#000000" strokeWidth="1.5" />
            <line x1="55" y1="0" x2="61" y2="6" stroke="#000000" strokeWidth="1.5" />
            <line x1="70" y1="0" x2="76" y2="6" stroke="#000000" strokeWidth="1.5" />
            <rect x="6" y="14" width="20" height="5" rx="1" fill="#f59e0b" />
            <rect x="6" y="23" width="46" height="4" rx="1" fill="#f4f4f5" />
            <rect x="6" y="31" width="38" height="3" rx="1" fill="#a1a1aa" />
            <rect x="58" y="16" width="16" height="18" rx="2" fill="#27272a" stroke="#3f3f46" strokeWidth="1" />
        </svg>
    ),

    'lto-circular-coupon-clip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 2" />
            {/* Scissor Marker */}
            <text x="5" y="27" fontSize="11" fill="#0284c7">✂</text>
            <rect x="18" y="12" width="18" height="4" rx="1" fill="#e0f2fe" />
            <rect x="18" y="20" width="34" height="4" rx="1" fill="#0f172a" />
            <rect x="18" y="27" width="28" height="3" rx="1" fill="#64748b" />
            {/* Barcode lines */}
            <line x1="57" y1="8" x2="57" y2="40" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="62" y1="20" x2="62" y2="34" stroke="#334155" strokeWidth="1" />
            <line x1="65" y1="20" x2="65" y2="34" stroke="#334155" strokeWidth="1.5" />
            <line x1="68" y1="20" x2="68" y2="34" stroke="#334155" strokeWidth="1" />
            <line x1="71" y1="20" x2="71" y2="34" stroke="#334155" strokeWidth="2" />
            <line x1="75" y1="20" x2="75" y2="34" stroke="#334155" strokeWidth="1" />
        </svg>
    ),

    'lto-live-scarcity-meter': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" />
            <circle cx="9" cy="14" r="2.5" fill="#f97316" />
            <rect x="15" y="11" width="26" height="5" rx="1.5" fill="#f97316" />
            <rect x="6" y="21" width="42" height="4" rx="1" fill="#ffffff" />
            <rect x="6" y="28" width="36" height="3" rx="1" fill="#94a3b8" />
            {/* Scarcity meter card */}
            <rect x="52" y="12" width="23" height="23" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <rect x="55" y="18" width="17" height="4" rx="2" fill="#334155" />
            <rect x="55" y="18" width="14" height="4" rx="2" fill="#f97316" />
        </svg>
    ),

    'lto-multibuy-volume-matrix': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect width="80" height="12" fill="#f8fafc" />
            <rect x="6" y="4" width="30" height="4" rx="1" fill="#2563eb" />
            {/* 3 Tier Columns */}
            <rect x="5" y="16" width="21" height="26" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="29" y="15" width="22" height="28" rx="2" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.2" />
            <rect x="54" y="16" width="21" height="26" rx="2" fill="#f0fdf4" stroke="#16a34a" strokeWidth="0.8" />
        </svg>
    ),

    'lto-scandinavian-editorial': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1" />
            <rect x="8" y="13" width="26" height="3" rx="0.5" fill="#71717a" />
            <rect x="8" y="20" width="40" height="4" rx="0.5" fill="#18181b" />
            <rect x="8" y="28" width="34" height="2.5" rx="0.5" fill="#a1a1aa" />
            <line x1="56" y1="12" x2="56" y2="36" stroke="#d4d4d8" strokeWidth="0.8" />
            <rect x="60" y="21" width="14" height="4" rx="0.5" fill="#18181b" />
        </svg>
    ),

    'lto-cyber-terminal-deal': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
            {/* Top Terminal Bar */}
            <rect width="80" height="8" fill="#0f172a" />
            <circle cx="6" cy="4" r="1.5" fill="#ef4444" />
            <circle cx="11" cy="4" r="1.5" fill="#f59e0b" />
            <circle cx="16" cy="4" r="1.5" fill="#10b981" />
            <rect x="6" y="14" width="28" height="4" rx="1" fill="#06b6d4" />
            <rect x="6" y="22" width="46" height="4" rx="1" fill="#f1f5f9" />
            <rect x="6" y="30" width="34" height="3" rx="1" fill="#10b981" />
            <rect x="58" y="16" width="16" height="17" rx="2" fill="#0f172a" stroke="#06b6d4" strokeWidth="1" />
        </svg>
    ),

    'lto-holiday-gift-ribbon': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#064e3b" stroke="#fbbf24" strokeWidth="1" />
            {/* Ribbon Icon */}
            <text x="6" y="28" fontSize="12">🎀</text>
            <rect x="22" y="11" width="22" height="4" rx="1" fill="#022c22" stroke="#fbbf24" strokeWidth="0.8" />
            <rect x="22" y="19" width="34" height="4" rx="1" fill="#ffffff" />
            <rect x="22" y="27" width="28" height="3" rx="1" fill="#d1fae5" />
            <rect x="58" y="15" width="16" height="18" rx="2" fill="#022c22" stroke="#fbbf24" strokeWidth="1" />
        </svg>
    ),

    // ── Satisfaction Guarantee Variants ──────────────────────────────────
    'sg-golden-crest-emblem': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#090d16" stroke="#d4af37" strokeWidth="1" />
            <circle cx="16" cy="24" r="10" stroke="#d4af37" strokeWidth="1.2" fill="#111827" />
            <text x="16" y="27" fontSize="10" textAnchor="middle" fill="#d4af37">★</text>
            <rect x="31" y="13" width="22" height="3.5" rx="1" fill="#d4af37" />
            <rect x="31" y="20" width="30" height="4.5" rx="1" fill="#ffffff" />
            <rect x="31" y="28" width="24" height="3" rx="1" fill="#94a3b8" />
            <line x1="64" y1="12" x2="64" y2="36" stroke="#1e293b" strokeWidth="1" />
            <line x1="68" y1="18" x2="76" y2="18" stroke="#d4af37" strokeWidth="1.5" />
            <line x1="68" y1="24" x2="76" y2="24" stroke="#10b981" strokeWidth="1.5" />
        </svg>
    ),

    'sg-five-star-authority-card': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            {/* Rating Box */}
            <rect x="5" y="10" width="18" height="28" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <text x="14" y="23" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#0f172a">5.0</text>
            <text x="14" y="32" fontSize="5" textAnchor="middle" fill="#f59e0b">★★★★★</text>
            <rect x="27" y="12" width="20" height="4" rx="1" fill="#fef3c7" />
            <rect x="27" y="20" width="34" height="4.5" rx="1" fill="#0f172a" />
            <rect x="27" y="28" width="26" height="3" rx="1" fill="#64748b" />
            <rect x="65" y="15" width="11" height="18" rx="2" fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="0.8" />
        </svg>
    ),

    'sg-split-contrast-promise': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            {/* Left 38% Dark Split */}
            <rect width="32" height="48" rx="4" fill="#0f172a" />
            <rect x="5" y="12" width="16" height="3" rx="1" fill="#10b981" />
            <rect x="5" y="19" width="22" height="4" rx="1" fill="#ffffff" />
            <rect x="5" y="27" width="18" height="3" rx="1" fill="#94a3b8" />
            {/* Right Checklist */}
            <circle cx="38" cy="16" r="2" fill="#10b981" />
            <line x1="43" y1="16" x2="72" y2="16" stroke="#0f172a" strokeWidth="2" />
            <circle cx="38" cy="24" r="2" fill="#10b981" />
            <line x1="43" y1="24" x2="68" y2="24" stroke="#0f172a" strokeWidth="2" />
            <circle cx="38" cy="32" r="2" fill="#10b981" />
            <line x1="43" y1="32" x2="70" y2="32" stroke="#0f172a" strokeWidth="2" />
        </svg>
    ),

    'sg-engraved-warranty-ticket': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fffdfa" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="4" y="4" width="72" height="40" rx="2" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 1.5" />
            <rect x="8" y="12" width="22" height="3" rx="0.5" fill="#64748b" />
            <rect x="8" y="19" width="38" height="4.5" rx="1" fill="#1c1917" />
            <rect x="8" y="27" width="30" height="3" rx="1" fill="#475569" />
            <rect x="56" y="13" width="15" height="22" rx="2" fill="#ffffff" stroke="#0284c7" strokeWidth="0.8" />
        </svg>
    ),

    'sg-handshake-seller-pledge': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fffdfa" stroke="#e7e5e4" strokeWidth="1" />
            <text x="7" y="28" fontSize="13">🤝</text>
            <rect x="22" y="11" width="16" height="3" rx="1" fill="#7530fb" />
            <rect x="22" y="18" width="36" height="4" rx="1" fill="#1c1917" />
            <rect x="22" y="26" width="30" height="3" rx="1" fill="#57534e" />
            <line x1="22" y1="34" x2="40" y2="34" stroke="#78716c" strokeWidth="1.5" />
            <rect x="62" y="13" width="13" height="22" rx="2" fill="#ffffff" stroke="#d6d3d1" strokeWidth="1" />
        </svg>
    ),

    'sg-three-pillar-shield-grid': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect width="80" height="11" fill="#f8fafc" />
            <rect x="6" y="4" width="28" height="3.5" rx="1" fill="#2563eb" />
            {/* 3 Pillars */}
            <rect x="5" y="15" width="21" height="27" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="29" y="14" width="22" height="29" rx="2" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.2" />
            <rect x="54" y="15" width="21" height="27" rx="2" fill="#f0fdf4" stroke="#86efac" strokeWidth="0.8" />
        </svg>
    ),

    'sg-minimalist-swiss-rule': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1" />
            <rect x="8" y="13" width="24" height="3" rx="0.5" fill="#71717a" />
            <rect x="8" y="20" width="38" height="4" rx="0.5" fill="#18181b" />
            <rect x="8" y="28" width="32" height="2.5" rx="0.5" fill="#71717a" />
            <line x1="56" y1="12" x2="56" y2="36" stroke="#d4d4d8" strokeWidth="0.8" />
            <rect x="60" y="21" width="14" height="4" rx="0.5" fill="#18181b" />
        </svg>
    ),

    'sg-industrial-field-tested': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" stroke="#f59e0b" strokeWidth="1" />
            <rect x="6" y="11" width="24" height="5" rx="1" fill="#f59e0b" />
            <rect x="6" y="20" width="46" height="4" rx="1" fill="#f4f4f5" />
            <rect x="6" y="28" width="38" height="3" rx="1" fill="#a1a1aa" />
            <rect x="58" y="13" width="16" height="22" rx="2" fill="#27272a" stroke="#3f3f46" strokeWidth="1" />
            <line x1="62" y1="20" x2="70" y2="20" stroke="#f59e0b" strokeWidth="1.5" />
        </svg>
    ),

    'sg-money-back-speed-ribbon': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#1e1b4b" />
            <rect x="6" y="9" width="20" height="4.5" rx="1.5" fill="#312e81" stroke="#4338ca" strokeWidth="0.8" />
            <rect x="6" y="18" width="44" height="5" rx="1" fill="#ffffff" />
            <rect x="6" y="27" width="36" height="3.5" rx="1" fill="#c7d2fe" />
            <rect x="56" y="14" width="18" height="20" rx="3" fill="#ffffff" />
            <rect x="59" y="20" width="12" height="3" rx="1" fill="#1e1b4b" />
            <rect x="60" y="25" width="10" height="2" rx="0.5" fill="#4338ca" />
        </svg>
    ),

    'sg-white-glove-concierge': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#161324" stroke="#fbbf24" strokeWidth="1" />
            <text x="6" y="27" fontSize="12" fill="#fbbf24">✦</text>
            <rect x="18" y="11" width="22" height="4" rx="1" fill="#231d38" stroke="#fbbf24" strokeWidth="0.8" />
            <rect x="18" y="19" width="36" height="4" rx="1" fill="#ffffff" />
            <rect x="18" y="27" width="28" height="3" rx="1" fill="#d8b4fe" />
            <rect x="58" y="14" width="16" height="20" rx="2" fill="#231d38" stroke="#fbbf24" strokeWidth="1" />
        </svg>
    ),

    // ── Condition Badge Variants ─────────────────────────────────────────
    'cond-inspected-grade-pill': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="11" width="26" height="6" rx="3" fill="#16a34a" />
            <rect x="6" y="20" width="38" height="4.5" rx="1" fill="#0f172a" />
            <rect x="6" y="28" width="30" height="3" rx="1" fill="#64748b" />
            {/* QC Stamp */}
            <circle cx="65" cy="24" r="10" stroke="#16a34a" strokeWidth="1.2" strokeDasharray="2 1" />
            <text x="65" y="26" fontSize="6" fontWeight="bold" textAnchor="middle" fill="#16a34a">QC</text>
        </svg>
    ),

    'cond-cosmetic-score-meter': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="5" y="11" width="20" height="26" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <text x="15" y="21" fontSize="6.5" fontWeight="bold" textAnchor="middle" fill="#2563eb">A+</text>
            <text x="15" y="29" fontSize="5" textAnchor="middle" fill="#f59e0b">★★★★★</text>
            <rect x="29" y="14" width="22" height="3" rx="1" fill="#2563eb" />
            <rect x="29" y="21" width="32" height="4" rx="1" fill="#0f172a" />
            <rect x="29" y="28" width="26" height="3" rx="1" fill="#64748b" />
            <rect x="65" y="14" width="10" height="20" rx="1.5" fill="#eff6ff" />
        </svg>
    ),

    'cond-factory-sealed-security': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
            <rect width="80" height="6" fill="#022c22" />
            <line x1="12" y1="3" x2="68" y2="3" stroke="#10b981" strokeWidth="1" strokeDasharray="3 1" />
            <rect x="6" y="13" width="24" height="4" rx="1" fill="#064e3b" stroke="#10b981" strokeWidth="0.6" />
            <rect x="6" y="21" width="40" height="4.5" rx="1" fill="#ffffff" />
            <rect x="6" y="29" width="34" height="3" rx="1" fill="#94a3b8" />
            <rect x="58" y="14" width="16" height="20" rx="2" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
        </svg>
    ),

    'cond-collector-archive-tag': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fffdfa" stroke="#d6d3d1" strokeWidth="1" strokeDasharray="2 1.5" />
            <rect x="6" y="12" width="14" height="24" rx="2" fill="#ffffff" stroke="#b91c1c" strokeWidth="1" />
            <text x="13" y="24" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#b91c1c">9.4</text>
            <rect x="24" y="13" width="22" height="3" rx="0.5" fill="#78716c" />
            <rect x="24" y="20" width="32" height="4" rx="1" fill="#1c1917" />
            <rect x="24" y="28" width="26" height="3" rx="1" fill="#57534e" />
            <line x1="62" y1="8" x2="62" y2="40" stroke="#d6d3d1" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
    ),

    'cond-diagnostic-matrix-table': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect width="80" height="10" fill="#f8fafc" />
            <rect x="6" y="3.5" width="24" height="3" rx="1" fill="#0284c7" />
            {/* 4 Diagnostic Chips */}
            <rect x="4" y="15" width="16" height="26" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="22" y="15" width="16" height="26" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="40" y="15" width="16" height="26" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="58" y="15" width="18" height="26" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
        </svg>
    ),

    'cond-designer-luxury-report': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#09090b" stroke="#d4af37" strokeWidth="1" />
            <rect x="8" y="11" width="28" height="3" rx="0.5" fill="#d4af37" />
            <rect x="8" y="18" width="40" height="4" rx="0.5" fill="#fafafa" />
            <rect x="8" y="26" width="34" height="3" rx="0.5" fill="#a1a1aa" />
            <rect x="58" y="13" width="16" height="22" rx="2" fill="#18181b" stroke="#d4af37" strokeWidth="0.8" />
        </svg>
    ),

    'cond-mechanic-auto-tested': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" stroke="#f59e0b" strokeWidth="1" />
            <text x="6" y="28" fontSize="12">⚙️</text>
            <rect x="22" y="10" width="22" height="4" rx="1" fill="#f59e0b" />
            <rect x="22" y="18" width="34" height="4" rx="1" fill="#f4f4f5" />
            <rect x="22" y="26" width="28" height="3" rx="1" fill="#a1a1aa" />
            <rect x="58" y="13" width="16" height="22" rx="2" fill="#27272a" stroke="#3f3f46" strokeWidth="1" />
        </svg>
    ),

    'cond-open-box-complete-strip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e9d5ff" strokeWidth="1" />
            <text x="6" y="28" fontSize="12">📦</text>
            <rect x="22" y="10" width="22" height="4" rx="1" fill="#f3e8ff" />
            <rect x="22" y="18" width="34" height="4" rx="1" fill="#0f172a" />
            <rect x="22" y="26" width="28" height="3" rx="1" fill="#6b7280" />
            <line x1="58" y1="10" x2="58" y2="38" stroke="#f3e8ff" strokeWidth="1" />
            <rect x="62" y="16" width="12" height="16" rx="2" fill="#fdf4ff" />
        </svg>
    ),

    'cond-minimal-nordic-pill': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1" />
            <rect x="8" y="12" width="26" height="3" rx="0.5" fill="#71717a" />
            <rect x="8" y="19" width="38" height="4" rx="0.5" fill="#18181b" />
            <rect x="8" y="27" width="32" height="2.5" rx="0.5" fill="#71717a" />
            <line x1="56" y1="10" x2="56" y2="38" stroke="#d4d4d8" strokeWidth="0.8" />
            <rect x="60" y="20" width="14" height="4" rx="0.5" fill="#18181b" />
        </svg>
    ),

    'cond-as-is-parts-honest': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fffbeb" stroke="#fde68a" strokeWidth="1" />
            <text x="6" y="27" fontSize="11">⚠️</text>
            <rect x="20" y="10" width="24" height="4" rx="1" fill="#fee2e2" />
            <rect x="20" y="18" width="34" height="4" rx="1" fill="#78350f" />
            <rect x="20" y="26" width="28" height="3" rx="1" fill="#92400e" />
            <line x1="58" y1="8" x2="58" y2="40" stroke="#fcd34d" strokeWidth="1" strokeDasharray="2 2" />
            <rect x="62" y="16" width="12" height="16" rx="2" fill="#fef2f2" />
        </svg>
    ),

    // ── Item Specifics Variants ──────────────────────────────────────────
    'is-dual-column-zebra-card': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect width="80" height="11" rx="4" fill="#0f172a" />
            <rect x="6" y="4" width="22" height="3.5" rx="1" fill="#2563eb" />
            {/* Zebra Rows */}
            <rect x="0" y="11" width="80" height="9" fill="#f8fafc" />
            <line x1="28" y1="11" x2="28" y2="48" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="20" x2="80" y2="20" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="0" y="29" width="80" height="9" fill="#f8fafc" />
            <line x1="0" y1="29" x2="80" y2="29" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="38" x2="80" y2="38" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="6" y1="15" x2="22" y2="15" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="34" y1="15" x2="65" y2="15" stroke="#64748b" strokeWidth="1.5" />
            <line x1="6" y1="24" x2="20" y2="24" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="34" y1="24" x2="58" y2="24" stroke="#64748b" strokeWidth="1.5" />
        </svg>
    ),

    'is-two-column-card-grid': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="5" y="4" width="28" height="3" rx="1" fill="#2563eb" />
            {/* 4 Bento Micro Cards */}
            <rect x="4" y="10" width="34" height="16" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="42" y="10" width="34" height="16" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="4" y="28" width="34" height="16" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="42" y="28" width="34" height="16" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="8" y1="14" x2="20" y2="14" stroke="#64748b" strokeWidth="1" />
            <line x1="8" y1="20" x2="30" y2="20" stroke="#0f172a" strokeWidth="2" />
            <line x1="46" y1="14" x2="58" y2="14" stroke="#64748b" strokeWidth="1" />
            <line x1="46" y1="20" x2="68" y2="20" stroke="#0f172a" strokeWidth="2" />
        </svg>
    ),

    'is-industrial-blueprint-matrix': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <rect width="80" height="9" fill="#1e293b" />
            <line x1="6" y1="4.5" x2="30" y2="4.5" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="0" y1="19" x2="80" y2="19" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="0" y1="29" x2="80" y2="29" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="0" y1="39" x2="80" y2="39" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="6" y1="14" x2="20" y2="14" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="30" y1="14" x2="68" y2="14" stroke="#f8fafc" strokeWidth="1.5" />
            <line x1="6" y1="24" x2="18" y2="24" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="30" y1="24" x2="60" y2="24" stroke="#f8fafc" strokeWidth="1.5" />
            <line x1="6" y1="34" x2="22" y2="34" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="30" y1="34" x2="65" y2="34" stroke="#f8fafc" strokeWidth="1.5" />
        </svg>
    ),

    'is-boutique-hairline-editorial': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1" />
            <line x1="8" y1="9" x2="36" y2="9" stroke="#18181b" strokeWidth="1.2" />
            <line x1="8" y1="19" x2="72" y2="19" stroke="#e4e4e7" strokeWidth="0.8" />
            <line x1="8" y1="29" x2="72" y2="29" stroke="#e4e4e7" strokeWidth="0.8" />
            <line x1="8" y1="39" x2="72" y2="39" stroke="#e4e4e7" strokeWidth="0.8" />
            <line x1="8" y1="14" x2="24" y2="14" stroke="#71717a" strokeWidth="1" />
            <line x1="34" y1="14" x2="64" y2="14" stroke="#18181b" strokeWidth="1.5" />
            <line x1="8" y1="24" x2="20" y2="24" stroke="#71717a" strokeWidth="1" />
            <line x1="34" y1="24" x2="56" y2="24" stroke="#18181b" strokeWidth="1.5" />
            <line x1="8" y1="34" x2="26" y2="34" stroke="#71717a" strokeWidth="1" />
            <line x1="34" y1="34" x2="60" y2="34" stroke="#18181b" strokeWidth="1.5" />
        </svg>
    ),

    'is-stamped-manifest-ledger': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fffdfa" stroke="#d6d3d1" strokeWidth="1.5" strokeDasharray="3 2" />
            <rect x="5" y="4" width="70" height="8" fill="#f5f5f4" />
            <rect x="8" y="6.5" width="24" height="3" rx="0.5" fill="#b91c1c" />
            <line x1="8" y1="20" x2="72" y2="20" stroke="#d6d3d1" strokeWidth="0.8" strokeDasharray="2 1" />
            <line x1="8" y1="30" x2="72" y2="30" stroke="#d6d3d1" strokeWidth="0.8" strokeDasharray="2 1" />
            <line x1="8" y1="40" x2="72" y2="40" stroke="#d6d3d1" strokeWidth="0.8" strokeDasharray="2 1" />
            <line x1="10" y1="16" x2="26" y2="16" stroke="#78716c" strokeWidth="1.2" />
            <line x1="36" y1="16" x2="68" y2="16" stroke="#1c1917" strokeWidth="1.5" />
            <line x1="10" y1="26" x2="22" y2="26" stroke="#78716c" strokeWidth="1.2" />
            <line x1="36" y1="26" x2="60" y2="26" stroke="#1c1917" strokeWidth="1.5" />
        </svg>
    ),

    'is-pill-tag-cluster': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#ede9fe" strokeWidth="1" />
            <rect x="6" y="4" width="22" height="3.5" rx="1" fill="#7530fb" />
            {/* Clustered Pill Badges */}
            <rect x="5" y="11" width="32" height="10" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="40" y="11" width="34" height="10" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="24" width="36" height="10" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="44" y="24" width="30" height="10" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="36" width="30" height="9" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="38" y="36" width="36" height="9" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
        </svg>
    ),

    'is-dark-terminal-console': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#070b12" stroke="#1e293b" strokeWidth="1" />
            {/* Terminal Window Header */}
            <rect width="80" height="7" fill="#0f172a" />
            <circle cx="5" cy="3.5" r="1.1" fill="#ef4444" />
            <circle cx="8" cy="3.5" r="1.1" fill="#f59e0b" />
            <circle cx="11" cy="3.5" r="1.1" fill="#10b981" />
            <line x1="16" y1="3.5" x2="38" y2="3.5" stroke="#64748b" strokeWidth="1" />
            <circle cx="74" cy="3.5" r="1" fill="#10b981" />
            {/* Command Subtitle */}
            <line x1="4" y1="10.5" x2="32" y2="10.5" stroke="#06b6d4" strokeWidth="1.5" />
            {/* 4 Modular HUD Telemetry Blocks */}
            <rect x="4" y="14" width="34" height="14" rx="1.5" fill="#0c1322" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="4" y1="14" x2="38" y2="14" stroke="#06b6d4" strokeWidth="1.2" />
            <line x1="7" y1="18" x2="18" y2="18" stroke="#06b6d4" strokeWidth="1" />
            <line x1="7" y1="23" x2="28" y2="23" stroke="#f8fafc" strokeWidth="1.6" />
            <circle cx="34" cy="18" r="1" fill="#10b981" />

            <rect x="42" y="14" width="34" height="14" rx="1.5" fill="#0c1322" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="42" y1="14" x2="76" y2="14" stroke="#06b6d4" strokeWidth="1.2" />
            <line x1="45" y1="18" x2="56" y2="18" stroke="#06b6d4" strokeWidth="1" />
            <line x1="45" y1="23" x2="66" y2="23" stroke="#f8fafc" strokeWidth="1.6" />
            <circle cx="72" cy="18" r="1" fill="#10b981" />

            <rect x="4" y="30" width="34" height="13" rx="1.5" fill="#0c1322" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="4" y1="30" x2="38" y2="30" stroke="#06b6d4" strokeWidth="1.2" />
            <line x1="7" y1="34" x2="16" y2="34" stroke="#06b6d4" strokeWidth="1" />
            <line x1="7" y1="38.5" x2="26" y2="38.5" stroke="#f8fafc" strokeWidth="1.6" />

            <rect x="42" y="30" width="34" height="13" rx="1.5" fill="#0c1322" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="42" y1="30" x2="76" y2="30" stroke="#06b6d4" strokeWidth="1.2" />
            <line x1="45" y1="34" x2="54" y2="34" stroke="#06b6d4" strokeWidth="1" />
            <line x1="45" y1="38.5" x2="64" y2="38.5" stroke="#f8fafc" strokeWidth="1.6" />
        </svg>
    ),

    'is-split-key-highlight-card': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            {/* 2 Top Hero Spec Cards */}
            <rect x="5" y="5" width="33" height="15" rx="2" fill="#eff6ff" stroke="#2563eb" strokeWidth="1" />
            <rect x="42" y="5" width="33" height="15" rx="2" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1" />
            <line x1="8" y1="9" x2="18" y2="9" stroke="#2563eb" strokeWidth="1" />
            <line x1="8" y1="14" x2="30" y2="14" stroke="#0f172a" strokeWidth="1.8" />
            <line x1="45" y1="9" x2="55" y2="9" stroke="#16a34a" strokeWidth="1" />
            <line x1="45" y1="14" x2="68" y2="14" stroke="#0f172a" strokeWidth="1.8" />
            {/* Table Below */}
            <rect x="5" y="24" width="70" height="19" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="5" y1="33" x2="75" y2="33" stroke="#e2e8f0" strokeWidth="0.8" />
        </svg>
    ),

    'is-compact-three-column-strip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect width="80" height="8" fill="#f1f5f9" />
            <line x1="6" y1="4" x2="26" y2="4" stroke="#0284c7" strokeWidth="1.5" />
            {/* 3 Columns */}
            <line x1="27" y1="8" x2="27" y2="48" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="54" y1="8" x2="54" y2="48" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="21" x2="80" y2="21" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="34" x2="80" y2="34" stroke="#e2e8f0" strokeWidth="0.8" />
        </svg>
    ),

    'is-luxury-gold-accent-band': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            {/* Outer Obsidian Frame with 18k Gold Border */}
            <rect width="80" height="48" rx="4" fill="#09090b" stroke="#d4af37" strokeWidth="1" />
            {/* Inner Gold Hairline Inset */}
            <rect x="2" y="2" width="76" height="44" rx="2" stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.4" />
            {/* Plaque Crest Header */}
            <rect x="2.5" y="2.5" width="75" height="9" fill="#141416" />
            <line x1="2.5" y1="11.5" x2="77.5" y2="11.5" stroke="#d4af37" strokeWidth="0.7" />
            <circle cx="40" cy="5.5" r="0.8" fill="#d4af37" />
            <line x1="26" y1="5.5" x2="36" y2="5.5" stroke="#d4af37" strokeWidth="0.7" />
            <line x1="44" y1="5.5" x2="54" y2="5.5" stroke="#d4af37" strokeWidth="0.7" />
            <line x1="22" y1="8.5" x2="58" y2="8.5" stroke="#ffffff" strokeWidth="1.2" />

            {/* 4 Luxury Dossier Cards (Roman Numerals I, II, III, IV) */}
            <rect x="5" y="14" width="33" height="14" fill="#121214" stroke="#27272a" strokeWidth="0.7" />
            <line x1="5" y1="14" x2="5" y2="28" stroke="#d4af37" strokeWidth="1.5" />
            <text x="8" y="19" fontSize="4.5" fill="#d4af37" fontFamily="serif">I.</text>
            <line x1="14" y1="18" x2="26" y2="18" stroke="#d4af37" strokeWidth="0.8" />
            <line x1="8" y1="23.5" x2="31" y2="23.5" stroke="#fafafa" strokeWidth="1.6" />

            <rect x="42" y="14" width="33" height="14" fill="#121214" stroke="#27272a" strokeWidth="0.7" />
            <line x1="42" y1="14" x2="42" y2="28" stroke="#d4af37" strokeWidth="1.5" />
            <text x="45" y="19" fontSize="4.5" fill="#d4af37" fontFamily="serif">II.</text>
            <line x1="52" y1="18" x2="64" y2="18" stroke="#d4af37" strokeWidth="0.8" />
            <line x1="45" y1="23.5" x2="68" y2="23.5" stroke="#fafafa" strokeWidth="1.6" />

            <rect x="5" y="30" width="33" height="13" fill="#121214" stroke="#27272a" strokeWidth="0.7" />
            <line x1="5" y1="30" x2="5" y2="43" stroke="#d4af37" strokeWidth="1.5" />
            <text x="8" y="35" fontSize="4.5" fill="#d4af37" fontFamily="serif">III.</text>
            <line x1="16" y1="34" x2="26" y2="34" stroke="#d4af37" strokeWidth="0.8" />
            <line x1="8" y1="39" x2="28" y2="39" stroke="#fafafa" strokeWidth="1.6" />

            <rect x="42" y="30" width="33" height="13" fill="#121214" stroke="#27272a" strokeWidth="0.7" />
            <line x1="42" y1="30" x2="42" y2="43" stroke="#d4af37" strokeWidth="1.5" />
            <text x="45" y="35" fontSize="4.5" fill="#d4af37" fontFamily="serif">IV.</text>
            <line x1="54" y1="34" x2="64" y2="34" stroke="#d4af37" strokeWidth="0.8" />
            <line x1="45" y1="39" x2="66" y2="39" stroke="#fafafa" strokeWidth="1.6" />
        </svg>
    ),

    // ── Authenticity Guarantee Variants ────────────────────────────────────
    'auth-ebay-blue-official-shield': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0053a0" stroke="#003d75" strokeWidth="1" />
            <circle cx="40" cy="11" r="5" fill="#ffffff" fillOpacity="0.2" />
            <path d="M40 7L43 10V14L40 16L37 14V10L40 7Z" fill="#38bdf8" />
            <rect x="18" y="19" width="44" height="4" rx="1" fill="#ffffff" />
            <rect x="22" y="25" width="36" height="2.5" rx="0.5" fill="#bae6fd" />
            <rect x="6" y="32" width="20" height="9" rx="4.5" fill="#ffffff" fillOpacity="0.15" />
            <rect x="30" y="32" width="20" height="9" rx="4.5" fill="#ffffff" fillOpacity="0.15" />
            <rect x="54" y="32" width="20" height="9" rx="4.5" fill="#ffffff" fillOpacity="0.15" />
        </svg>
    ),

    'auth-luxury-atelier-wax-seal': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#09090b" stroke="#d4af37" strokeWidth="1" />
            <rect x="2" y="2" width="76" height="44" rx="2" stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.4" />
            <rect x="2.5" y="2.5" width="75" height="9" fill="#141416" />
            <line x1="2.5" y1="11.5" x2="77.5" y2="11.5" stroke="#d4af37" strokeWidth="0.7" />
            <circle cx="40" cy="5.5" r="1" fill="#d4af37" />
            <rect x="24" y="8" width="32" height="2" fill="#ffffff" />
            <rect x="4" y="16" width="22" height="18" fill="#121214" stroke="#27272a" strokeWidth="0.8" />
            <line x1="4" y1="16" x2="26" y2="16" stroke="#d4af37" strokeWidth="1.2" />
            <rect x="29" y="16" width="22" height="18" fill="#121214" stroke="#27272a" strokeWidth="0.8" />
            <line x1="29" y1="16" x2="51" y2="16" stroke="#d4af37" strokeWidth="1.2" />
            <rect x="54" y="16" width="22" height="18" fill="#121214" stroke="#27272a" strokeWidth="0.8" />
            <line x1="54" y1="16" x2="76" y2="16" stroke="#d4af37" strokeWidth="1.2" />
            <line x1="2" y1="38" x2="78" y2="38" stroke="#27272a" strokeWidth="0.6" />
            <rect x="6" y="41" width="30" height="2" fill="#d4af37" />
        </svg>
    ),

    'auth-sneaker-streetwear-pass': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0a0a0c" stroke="#27272a" strokeWidth="1" />
            <rect width="80" height="8" fill="#121216" />
            <line x1="0" y1="8" x2="80" y2="8" stroke="#b8fa33" strokeWidth="1" />
            <rect x="4" y="2.5" width="24" height="3" rx="0.5" fill="#b8fa33" />
            <rect x="4" y="12" width="46" height="4" rx="0.5" fill="#ffffff" />
            <g fill="#71717a">
                <rect x="64" y="11" width="1" height="5" />
                <rect x="66" y="11" width="1.5" height="5" />
                <rect x="69" y="11" width="1" height="5" />
                <rect x="71" y="11" width="2" height="5" />
                <rect x="74" y="11" width="1" height="5" />
            </g>
            <rect x="4" y="21" width="22" height="16" fill="#141419" stroke="#27272a" strokeWidth="0.8" />
            <line x1="4" y1="21" x2="4" y2="37" stroke="#b8fa33" strokeWidth="1.5" />
            <rect x="29" y="21" width="22" height="16" fill="#141419" stroke="#27272a" strokeWidth="0.8" />
            <line x1="29" y1="21" x2="29" y2="37" stroke="#b8fa33" strokeWidth="1.5" />
            <rect x="54" y="21" width="22" height="16" fill="#141419" stroke="#27272a" strokeWidth="0.8" />
            <line x1="54" y1="21" x2="54" y2="37" stroke="#b8fa33" strokeWidth="1.5" />
        </svg>
    ),

    'auth-security-tamper-evident': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <rect width="80" height="5" fill="#0284c7" />
            <rect x="20" y="8" width="40" height="3" fill="#06b6d4" />
            <rect x="14" y="13" width="52" height="4.5" rx="0.5" fill="#f8fafc" />
            <rect x="4" y="22" width="22" height="16" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            <circle cx="15" cy="27" r="2" fill="#06b6d4" />
            <rect x="29" y="22" width="22" height="16" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            <circle cx="40" cy="27" r="2" fill="#06b6d4" />
            <rect x="54" y="22" width="22" height="16" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            <circle cx="65" cy="27" r="2" fill="#06b6d4" />
        </svg>
    ),

    'auth-psa-graded-slab-vault': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect width="80" height="9" fill="#b91c1c" />
            <rect x="4" y="3" width="30" height="3" fill="#ffffff" />
            <rect x="56" y="2.5" width="20" height="4" rx="1" fill="#ffffff" />
            <rect x="4" y="13" width="44" height="4" fill="#0f172a" />
            <g fill="#94a3b8">
                <rect x="62" y="12" width="1" height="5" />
                <rect x="64" y="12" width="1.5" height="5" />
                <rect x="67" y="12" width="1" height="5" />
                <rect x="69" y="12" width="2" height="5" />
                <rect x="72" y="12" width="1" height="5" />
            </g>
            <rect x="4" y="22" width="72" height="18" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="28" y1="22" x2="28" y2="40" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="52" y1="22" x2="52" y2="40" stroke="#e2e8f0" strokeWidth="0.8" />
        </svg>
    ),

    'auth-manufacturer-oem-seal': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <rect width="80" height="7" fill="#0f172a" />
            <rect x="4" y="2" width="24" height="3" fill="#f59e0b" />
            <rect x="4" y="11" width="50" height="4" fill="#f8fafc" />
            <rect x="4" y="17" width="60" height="2.5" fill="#94a3b8" />
            <rect x="4" y="24" width="22" height="16" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            <line x1="4" y1="24" x2="26" y2="24" stroke="#f59e0b" strokeWidth="1.2" />
            <rect x="29" y="24" width="22" height="16" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            <line x1="29" y1="24" x2="51" y2="24" stroke="#f59e0b" strokeWidth="1.2" />
            <rect x="54" y="24" width="22" height="16" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            <line x1="54" y1="24" x2="76" y2="24" stroke="#f59e0b" strokeWidth="1.2" />
        </svg>
    ),

    'auth-swiss-minimalist-dossier': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1" />
            <rect x="4" y="6" width="16" height="2" fill="#71717a" />
            <rect x="4" y="11" width="22" height="5" fill="#18181b" />
            <line x1="4" y1="19" x2="14" y2="19" stroke="#18181b" strokeWidth="1" />
            <rect x="4" y="23" width="20" height="16" fill="#f4f4f5" />
            <line x1="28" y1="4" x2="28" y2="44" stroke="#e4e4e7" strokeWidth="0.8" />
            <rect x="34" y="8" width="40" height="8" rx="1" fill="#fafafa" />
            <rect x="34" y="20" width="40" height="8" rx="1" fill="#fafafa" />
            <rect x="34" y="32" width="40" height="8" rx="1" fill="#fafafa" />
        </svg>
    ),

    'auth-triple-badge-crest-matrix': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="26" y="4" width="28" height="3" rx="1" fill="#eff6ff" />
            <rect x="18" y="9" width="44" height="4" rx="0.5" fill="#0f172a" />
            <rect x="4" y="17" width="22" height="24" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="15" cy="24" r="3" fill="#2563eb" fillOpacity="0.2" />
            <rect x="7" y="30" width="16" height="3" fill="#0f172a" />
            <rect x="29" y="17" width="22" height="24" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="40" cy="24" r="3" fill="#2563eb" fillOpacity="0.2" />
            <rect x="32" y="30" width="16" height="3" fill="#0f172a" />
            <rect x="54" y="17" width="22" height="24" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="65" cy="24" r="3" fill="#2563eb" fillOpacity="0.2" />
            <rect x="57" y="30" width="16" height="3" fill="#0f172a" />
        </svg>
    ),

    'auth-vintage-notary-parchment': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fffefb" stroke="#d6d3d1" strokeWidth="1.2" />
            <rect x="2" y="2" width="76" height="44" rx="2" stroke="#d6d3d1" strokeWidth="0.6" strokeDasharray="2 1" />
            <rect x="24" y="6" width="32" height="3" rx="0.5" fill="#b91c1c" />
            <rect x="14" y="11" width="52" height="4" fill="#1c1917" />
            <rect x="5" y="19" width="21" height="16" fill="#faf8f5" stroke="#d6d3d1" strokeWidth="0.6" strokeDasharray="1.5 1" />
            <rect x="29.5" y="19" width="21" height="16" fill="#faf8f5" stroke="#d6d3d1" strokeWidth="0.6" strokeDasharray="1.5 1" />
            <rect x="54" y="19" width="21" height="16" fill="#faf8f5" stroke="#d6d3d1" strokeWidth="0.6" strokeDasharray="1.5 1" />
            <line x1="6" y1="39" x2="74" y2="39" stroke="#d6d3d1" strokeWidth="0.6" strokeDasharray="2 1" />
            <rect x="6" y="42" width="24" height="2" fill="#78716c" />
            <rect x="52" y="42" width="22" height="2" fill="#b91c1c" />
        </svg>
    ),

    'auth-sports-memorabilia-holotag': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#070f1e" stroke="#1e3a5f" strokeWidth="1" />
            <rect width="80" height="8" fill="#0c1a2e" />
            <circle cx="6" cy="4" r="1.5" fill="#fbbf24" />
            <rect x="10" y="2.5" width="34" height="3" fill="#ffffff" />
            <rect x="4" y="12" width="52" height="4" fill="#f8fafc" />
            <rect x="4" y="18" width="60" height="2.5" fill="#94a3b8" />
            <rect x="4" y="24" width="22" height="16" fill="#0b192e" stroke="#1e3a5f" strokeWidth="0.8" />
            <line x1="4" y1="24" x2="26" y2="24" stroke="#fbbf24" strokeWidth="1.2" />
            <rect x="29" y="24" width="22" height="16" fill="#0b192e" stroke="#1e3a5f" strokeWidth="0.8" />
            <line x1="29" y1="24" x2="51" y2="24" stroke="#fbbf24" strokeWidth="1.2" />
            <rect x="54" y="24" width="22" height="16" fill="#0b192e" stroke="#1e3a5f" strokeWidth="0.8" />
            <line x1="54" y1="24" x2="76" y2="24" stroke="#fbbf24" strokeWidth="1.2" />
        </svg>
    ),

    // ── Condition Details Variants ─────────────────────────────────────────
    'cd-cosmetic-grade-split': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="5" y="4" width="28" height="3.5" rx="0.5" fill="#1e1535" />
            <rect x="36" y="4" width="20" height="3.5" rx="0.5" fill="#7530fb" />
            <rect x="5" y="12" width="22" height="30" rx="3" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="0.8" />
            <rect x="8" y="16" width="16" height="2" fill="#166534" />
            <text x="16" y="27" fontSize="8" fill="#16a34a" textAnchor="middle">★★★★★</text>
            <rect x="30" y="12" width="45" height="30" rx="3" fill="#f8f7ff" stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="34" y1="18" x2="71" y2="18" stroke="#1f1d2e" strokeWidth="1.2" />
            <line x1="34" y1="24" x2="68" y2="24" stroke="#64748b" strokeWidth="1.2" />
            <line x1="34" y1="30" x2="60" y2="30" stroke="#64748b" strokeWidth="1.2" />
        </svg>
    ),

    'cd-certified-refurb-diagnostic': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect width="80" height="9" fill="#0f172a" />
            <rect x="4" y="2.5" width="26" height="4" rx="1" fill="#2563eb" />
            <rect x="33" y="3.5" width="30" height="2" fill="#ffffff" />
            <circle cx="75" cy="4.5" r="1.5" fill="#22c55e" />
            <rect x="0" y="9" width="80" height="7" fill="#f8fafc" />
            <line x1="0" y1="16" x2="80" y2="16" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="6" cy="12.5" r="1" fill="#166534" />
            <circle cx="32" cy="12.5" r="1" fill="#166534" />
            <circle cx="58" cy="12.5" r="1" fill="#166534" />
            <rect x="4" y="20" width="22" height="2" fill="#64748b" />
            <line x1="4" y1="26" x2="76" y2="26" stroke="#0f172a" strokeWidth="1.4" />
            <line x1="4" y1="32" x2="72" y2="32" stroke="#64748b" strokeWidth="1.4" />
            <line x1="4" y1="38" x2="58" y2="38" stroke="#64748b" strokeWidth="1.4" />
        </svg>
    ),

    'cd-archival-vintage-tier': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fffdfa" stroke="#d6d3d1" strokeWidth="1" />
            <rect x="4" y="3" width="24" height="3" fill="#78716c" />
            <rect x="30" y="3" width="28" height="3" fill="#1c1917" />
            <rect x="62" y="2.5" width="14" height="4" rx="1" fill="#059669" />
            <rect x="4" y="9" width="72" height="7" fill="#f5f5f4" stroke="#d6d3d1" strokeWidth="0.6" />
            <rect x="18" y="9" width="15" height="7" fill="#059669" />
            <line x1="18" y1="9" x2="18" y2="16" stroke="#d6d3d1" strokeWidth="0.6" />
            <line x1="33" y1="9" x2="33" y2="16" stroke="#d6d3d1" strokeWidth="0.6" />
            <line x1="48" y1="9" x2="48" y2="16" stroke="#d6d3d1" strokeWidth="0.6" />
            <line x1="63" y1="9" x2="63" y2="16" stroke="#d6d3d1" strokeWidth="0.6" />
            <rect x="4" y="19" width="72" height="24" rx="2" fill="#ffffff" stroke="#d6d3d1" strokeDasharray="2 1" strokeWidth="0.8" />
            <line x1="8" y1="25" x2="68" y2="25" stroke="#1c1917" strokeWidth="1.2" />
            <line x1="8" y1="31" x2="64" y2="31" stroke="#78716c" strokeWidth="1.2" />
            <line x1="8" y1="37" x2="52" y2="37" stroke="#78716c" strokeWidth="1.2" />
        </svg>
    ),

    'cd-open-box-inventory-audit': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#ede9fe" strokeWidth="1" />
            <rect x="4" y="3" width="22" height="3.5" rx="1" fill="#9333ea" />
            <rect x="29" y="3" width="34" height="3.5" rx="0.5" fill="#0f172a" />
            <rect x="4" y="10" width="27" height="33" rx="2" fill="#faf5ff" stroke="#f3e8ff" strokeWidth="0.8" />
            <circle cx="8" cy="15" r="1.2" fill="#9333ea" />
            <line x1="12" y1="15" x2="26" y2="15" stroke="#1e1b4b" strokeWidth="1" />
            <circle cx="8" cy="22" r="1.2" fill="#9333ea" />
            <line x1="12" y1="22" x2="26" y2="22" stroke="#1e1b4b" strokeWidth="1" />
            <circle cx="8" cy="29" r="1.2" fill="#9333ea" />
            <line x1="12" y1="29" x2="26" y2="29" stroke="#1e1b4b" strokeWidth="1" />
            <circle cx="8" cy="36" r="1.2" fill="#9333ea" />
            <line x1="12" y1="36" x2="26" y2="36" stroke="#1e1b4b" strokeWidth="1" />
            <rect x="34" y="10" width="42" height="33" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="38" y1="16" x2="72" y2="16" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="38" y1="22" x2="70" y2="22" stroke="#64748b" strokeWidth="1.2" />
            <line x1="38" y1="28" x2="66" y2="28" stroke="#64748b" strokeWidth="1.2" />
            <line x1="38" y1="34" x2="56" y2="34" stroke="#64748b" strokeWidth="1.2" />
        </svg>
    ),

    'cd-honest-wear-transparency': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#fed7aa" strokeWidth="1" />
            <rect x="4" y="3" width="22" height="3" rx="1" fill="#ffedd5" />
            <rect x="28" y="3" width="30" height="3" fill="#0f172a" />
            <rect x="62" y="2.5" width="14" height="4" rx="1" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="0.6" />
            <rect x="4" y="10" width="72" height="33" rx="2" fill="#fffaf5" />
            <line x1="4" y1="10" x2="4" y2="43" stroke="#f59e0b" strokeWidth="2" />
            <rect x="8" y="14" width="28" height="2" fill="#c2410c" />
            <line x1="8" y1="20" x2="70" y2="20" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="8" y1="26" x2="68" y2="26" stroke="#475569" strokeWidth="1.2" />
            <line x1="8" y1="32" x2="58" y2="32" stroke="#475569" strokeWidth="1.2" />
            <line x1="8" y1="38" x2="44" y2="38" stroke="#166534" strokeWidth="1" />
        </svg>
    ),

    'cd-parts-repair-warning': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <rect width="80" height="8" fill="#b45309" />
            <path d="M4 6L6 2.5H2L4 6Z" fill="#ffffff" />
            <rect x="9" y="3" width="40" height="2.5" fill="#ffffff" />
            <rect x="4" y="12" width="32" height="3" fill="#f59e0b" />
            <rect x="4" y="18" width="72" height="22" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
            <line x1="4" y1="18" x2="4" y2="40" stroke="#dc2626" strokeWidth="2" />
            <rect x="8" y="21" width="26" height="2" fill="#f87171" />
            <line x1="8" y1="27" x2="70" y2="27" stroke="#f8fafc" strokeWidth="1.2" />
            <line x1="8" y1="33" x2="60" y2="33" stroke="#94a3b8" strokeWidth="1.2" />
            <line x1="4" y1="44" x2="54" y2="44" stroke="#94a3b8" strokeWidth="0.8" />
        </svg>
    ),

    'cd-jeweler-curator-provenance': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#09090b" stroke="#d4af37" strokeWidth="1" />
            <rect x="2" y="2" width="76" height="44" rx="2" stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.4" />
            <rect x="22" y="5" width="36" height="2" fill="#d4af37" />
            <rect x="18" y="9" width="44" height="3.5" fill="#ffffff" />
            <circle cx="40" cy="15" r="1" fill="#d4af37" />
            <rect x="5" y="19" width="70" height="23" rx="2" fill="#141416" stroke="#27272a" strokeWidth="0.8" />
            <line x1="9" y1="24" x2="71" y2="24" stroke="#fafafa" strokeWidth="1.2" />
            <line x1="9" y1="30" x2="66" y2="30" stroke="#a1a1aa" strokeWidth="1.2" />
            <line x1="9" y1="36" x2="48" y2="36" stroke="#d4af37" strokeWidth="0.8" />
        </svg>
    ),

    'cd-automotive-core-fitment': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" stroke="#1e3a5f" strokeWidth="1" />
            <rect width="80" height="8" fill="#1e293b" />
            <rect x="4" y="2.5" width="22" height="3" fill="#f59e0b" />
            <rect x="28" y="2.5" width="34" height="3" fill="#ffffff" />
            <circle cx="75" cy="4" r="1.2" fill="#22c55e" />
            <rect x="0" y="8" width="80" height="7" fill="#090d16" />
            <line x1="0" y1="15" x2="80" y2="15" stroke="#1e3a5f" strokeWidth="0.8" />
            <rect x="4" y="11" width="18" height="2" fill="#94a3b8" />
            <rect x="30" y="11" width="18" height="2" fill="#94a3b8" />
            <rect x="56" y="11" width="18" height="2" fill="#94a3b8" />
            <line x1="4" y1="22" x2="76" y2="22" stroke="#f8fafc" strokeWidth="1.2" />
            <line x1="4" y1="29" x2="70" y2="29" stroke="#94a3b8" strokeWidth="1.2" />
            <line x1="4" y1="36" x2="52" y2="36" stroke="#94a3b8" strokeWidth="1.2" />
        </svg>
    ),

    'cd-scandinavian-minimal-ledger': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1" />
            <rect x="5" y="5" width="24" height="2.5" fill="#71717a" />
            <rect x="32" y="5" width="28" height="2.5" fill="#18181b" />
            <line x1="5" y1="11" x2="75" y2="11" stroke="#18181b" strokeWidth="1" />
            <line x1="5" y1="18" x2="75" y2="18" stroke="#18181b" strokeWidth="1.2" />
            <line x1="5" y1="25" x2="72" y2="25" stroke="#52525b" strokeWidth="1.2" />
            <line x1="5" y1="32" x2="60" y2="32" stroke="#52525b" strokeWidth="1.2" />
            <rect x="5" y="40" width="30" height="2" fill="#71717a" />
        </svg>
    ),

    'cd-mobile-compact-badge-strip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            {/* Top Header Capsule Line */}
            <rect x="4" y="4" width="28" height="5" rx="2.5" fill="#2563eb" />
            <rect x="35" y="4" width="41" height="5" rx="2.5" fill="#f1f5f9" />
            {/* 3 Inspection Metric Chips */}
            <rect x="4" y="12" width="22" height="11" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.7" />
            <rect x="7" y="14.5" width="16" height="2" fill="#64748b" />
            <rect x="7" y="18" width="12" height="2.5" fill="#0f172a" />
            <rect x="29" y="12" width="22" height="11" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.7" />
            <rect x="32" y="14.5" width="16" height="2" fill="#64748b" />
            <rect x="32" y="18" width="12" height="2.5" fill="#16a34a" />
            <rect x="54" y="12" width="22" height="11" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.7" />
            <rect x="57" y="14.5" width="16" height="2" fill="#64748b" />
            <rect x="57" y="18" width="12" height="2.5" fill="#0f172a" />
            {/* Full-Width Notes Card with Left Blue Accent Border */}
            <rect x="4" y="26" width="72" height="18" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.7" />
            <line x1="4" y1="26" x2="4" y2="44" stroke="#2563eb" strokeWidth="2" />
            <line x1="9" y1="31" x2="68" y2="31" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="9" y1="36" x2="55" y2="36" stroke="#64748b" strokeWidth="1.2" />
            <line x1="9" y1="40.5" x2="35" y2="40.5" stroke="#94a3b8" strokeWidth="0.8" />
        </svg>
    ),

    // ── Compatibility Table Variants ────────────────────────────────────
    'compat-classic-zebra-table': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#ede9fe" strokeWidth="1" />
            <rect x="5" y="4" width="7" height="7" rx="1.5" fill="#16a34a" />
            <rect x="15" y="5.5" width="30" height="4" fill="#1e1535" />
            <line x1="0" y1="13" x2="80" y2="13" stroke="#ede9fe" strokeWidth="0.8" />
            <rect x="0" y="13" width="80" height="8" fill="#f0fdf4" />
            <line x1="5" y1="17" x2="8" y2="17" stroke="#16a34a" strokeWidth="1.2" />
            <line x1="15" y1="17" x2="52" y2="17" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="0" y1="21" x2="80" y2="21" stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="5" y1="25" x2="8" y2="25" stroke="#16a34a" strokeWidth="1.2" />
            <line x1="15" y1="25" x2="48" y2="25" stroke="#1e1535" strokeWidth="1.2" />
            <rect x="0" y="29" width="80" height="8" fill="#f0fdf4" />
            <line x1="5" y1="33" x2="8" y2="33" stroke="#16a34a" strokeWidth="1.2" />
            <line x1="15" y1="33" x2="55" y2="33" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="0" y1="37" x2="80" y2="37" stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="5" y1="41" x2="8" y2="41" stroke="#16a34a" strokeWidth="1.2" />
            <line x1="15" y1="41" x2="45" y2="41" stroke="#1e1535" strokeWidth="1.2" />
        </svg>
    ),

    'compat-automotive-parts-fitment': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect width="80" height="10" fill="#0f172a" />
            <rect x="4" y="3.5" width="22" height="3" fill="#1d4ed8" />
            <rect x="30" y="3.5" width="34" height="3" fill="#ffffff" />
            <rect y="10" width="80" height="6" fill="#f1f5f9" />
            <line x1="4" y1="13" x2="16" y2="13" stroke="#475569" strokeWidth="1" />
            <line x1="24" y1="13" x2="36" y2="13" stroke="#475569" strokeWidth="1" />
            <line x1="44" y1="13" x2="56" y2="13" stroke="#475569" strokeWidth="1" />
            <line x1="64" y1="13" x2="76" y2="13" stroke="#475569" strokeWidth="1" />
            <line x1="4" y1="21" x2="20" y2="21" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="24" y1="21" x2="34" y2="21" stroke="#64748b" strokeWidth="1.2" />
            <rect x="62" y="18" width="14" height="5" rx="1" fill="#ecfdf5" />
            <line x1="0" y1="25" x2="80" y2="25" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="4" y1="30" x2="22" y2="30" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="24" y1="30" x2="36" y2="30" stroke="#64748b" strokeWidth="1.2" />
            <rect x="62" y="27" width="14" height="5" rx="1" fill="#ecfdf5" />
            <rect y="37" width="80" height="11" fill="#eff6ff" />
            <line x1="4" y1="42.5" x2="70" y2="42.5" stroke="#1e40af" strokeWidth="1.2" />
        </svg>
    ),

    'compat-device-multi-gen-chips': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="4" y="3" width="24" height="4" rx="2" fill="#0284c7" />
            <rect x="32" y="3" width="30" height="4" fill="#0f172a" />
            <rect x="4" y="10" width="34" height="16" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="7" y="13" width="5" height="5" rx="1" fill="#0284c7" />
            <line x1="15" y1="14" x2="32" y2="14" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="15" y1="18" x2="28" y2="18" stroke="#64748b" strokeWidth="0.8" />
            <rect x="42" y="10" width="34" height="16" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="45" y="13" width="5" height="5" rx="1" fill="#0284c7" />
            <line x1="53" y1="14" x2="70" y2="14" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="53" y1="18" x2="66" y2="18" stroke="#64748b" strokeWidth="0.8" />
            <rect x="4" y="28" width="34" height="16" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="7" y="31" width="5" height="5" rx="1" fill="#0284c7" />
            <line x1="15" y1="32" x2="32" y2="32" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="42" y="28" width="34" height="16" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="45" y="31" width="5" height="5" rx="1" fill="#0284c7" />
            <line x1="53" y1="32" x2="70" y2="32" stroke="#0f172a" strokeWidth="1.2" />
        </svg>
    ),

    'compat-split-guarantee-sidebar': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect width="28" height="48" fill="#0f172a" />
            <rect x="3" y="6" width="16" height="3" rx="0.5" fill="#16a34a" />
            <rect x="3" y="12" width="22" height="4" fill="#ffffff" />
            <line x1="3" y1="20" x2="23" y2="20" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="3" y1="24" x2="20" y2="24" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="3" y1="34" x2="24" y2="34" stroke="#334155" strokeWidth="0.8" />
            <rect x="33" y="6" width="32" height="3" fill="#0f172a" />
            <rect x="32" y="13" width="44" height="9" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.7" />
            <line x1="36" y1="17.5" x2="68" y2="17.5" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="32" y="24" width="44" height="9" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.7" />
            <line x1="36" y1="28.5" x2="65" y2="28.5" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="32" y="35" width="44" height="9" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.7" />
            <line x1="36" y1="39.5" x2="60" y2="39.5" stroke="#0f172a" strokeWidth="1.2" />
        </svg>
    ),

    'compat-stepped-compatibility-checklist': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="4" y="3" width="20" height="3.5" rx="1" fill="#7c3aed" />
            <rect x="28" y="3" width="30" height="3.5" fill="#1e1b4b" />
            <rect x="4" y="9" width="72" height="10" rx="1" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="4" y="9" width="3" height="10" fill="#7c3aed" />
            <line x1="12" y1="14" x2="42" y2="14" stroke="#1e1b4b" strokeWidth="1.2" />
            <rect x="60" y="11" width="13" height="6" rx="2" fill="#ecfdf5" />
            <rect x="4" y="21" width="72" height="10" rx="1" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="4" y="21" width="3" height="10" fill="#7c3aed" />
            <line x1="12" y1="26" x2="45" y2="26" stroke="#1e1b4b" strokeWidth="1.2" />
            <rect x="60" y="23" width="13" height="6" rx="2" fill="#ecfdf5" />
            <rect x="4" y="33" width="72" height="10" rx="1" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="4" y="33" width="3" height="10" fill="#7c3aed" />
            <line x1="12" y1="38" x2="38" y2="38" stroke="#1e1b4b" strokeWidth="1.2" />
            <rect x="60" y="35" width="13" height="6" rx="2" fill="#ecfdf5" />
        </svg>
    ),

    'compat-industrial-schematic-ledger': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
            <line x1="4" y1="4" x2="26" y2="4" stroke="#f59e0b" strokeWidth="1.2" />
            <line x1="4" y1="8" x2="48" y2="8" stroke="#f8fafc" strokeWidth="1.5" />
            <line x1="0" y1="13" x2="80" y2="13" stroke="#1e293b" strokeWidth="0.8" />
            <rect y="13" width="80" height="5" fill="#0f172a" />
            <line x1="4" y1="15.5" x2="20" y2="15.5" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="30" y1="15.5" x2="50" y2="15.5" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="0" y1="18" x2="80" y2="18" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="4" y1="24" x2="24" y2="24" stroke="#f8fafc" strokeWidth="1.2" />
            <line x1="30" y1="24" x2="52" y2="24" stroke="#06b6d4" strokeWidth="1" />
            <line x1="68" y1="24" x2="76" y2="24" stroke="#10b981" strokeWidth="1.2" />
            <line x1="0" y1="29" x2="80" y2="29" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="4" y1="35" x2="22" y2="35" stroke="#f8fafc" strokeWidth="1.2" />
            <line x1="30" y1="35" x2="50" y2="35" stroke="#06b6d4" strokeWidth="1" />
            <line x1="68" y1="35" x2="76" y2="35" stroke="#10b981" strokeWidth="1.2" />
            <line x1="0" y1="40" x2="80" y2="40" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="4" y1="44" x2="26" y2="44" stroke="#f8fafc" strokeWidth="1.2" />
        </svg>
    ),

    'compat-minimal-hairline-directory': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1" />
            <line x1="6" y1="6" x2="24" y2="6" stroke="#71717a" strokeWidth="1" />
            <line x1="6" y1="12" x2="42" y2="12" stroke="#18181b" strokeWidth="1.5" />
            <line x1="6" y1="16" x2="74" y2="16" stroke="#18181b" strokeWidth="1" />
            <line x1="6" y1="23" x2="30" y2="23" stroke="#18181b" strokeWidth="1.2" />
            <line x1="38" y1="23" x2="60" y2="23" stroke="#71717a" strokeWidth="1" />
            <circle cx="72" cy="23" r="1.5" fill="#18181b" />
            <line x1="6" y1="28" x2="74" y2="28" stroke="#e4e4e7" strokeWidth="0.8" />
            <line x1="6" y1="35" x2="28" y2="35" stroke="#18181b" strokeWidth="1.2" />
            <line x1="38" y1="35" x2="56" y2="35" stroke="#71717a" strokeWidth="1" />
            <circle cx="72" cy="35" r="1.5" fill="#18181b" />
            <line x1="6" y1="40" x2="74" y2="40" stroke="#e4e4e7" strokeWidth="0.8" />
        </svg>
    ),

    'compat-console-gaming-platform-ribbon': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0a0e17" stroke="#1e293b" strokeWidth="1" />
            <line x1="4" y1="5" x2="24" y2="5" stroke="#8b5cf6" strokeWidth="1.2" />
            <line x1="4" y1="9" x2="48" y2="9" stroke="#ffffff" strokeWidth="1.5" />
            <rect y="13" width="80" height="9" fill="#0f172a" />
            <rect x="4" y="15" width="16" height="5" rx="1" fill="#1e293b" />
            <circle cx="6" cy="17.5" r="1" fill="#0284c7" />
            <rect x="23" y="15" width="16" height="5" rx="1" fill="#1e293b" />
            <circle cx="25" cy="17.5" r="1" fill="#2563eb" />
            <rect x="42" y="15" width="16" height="5" rx="1" fill="#1e293b" />
            <circle cx="44" cy="17.5" r="1" fill="#16a34a" />
            <rect x="61" y="15" width="16" height="5" rx="1" fill="#1e293b" />
            <circle cx="63" cy="17.5" r="1" fill="#dc2626" />
            <line x1="4" y1="28" x2="30" y2="28" stroke="#ffffff" strokeWidth="1.2" />
            <line x1="36" y1="28" x2="60" y2="28" stroke="#94a3b8" strokeWidth="1" />
            <line x1="0" y1="34" x2="80" y2="34" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="4" y1="41" x2="28" y2="41" stroke="#ffffff" strokeWidth="1.2" />
            <line x1="36" y1="41" x2="58" y2="41" stroke="#94a3b8" strokeWidth="1" />
        </svg>
    ),

    'compat-oem-cross-reference-ledger': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect width="80" height="9" fill="#f8fafc" />
            <line x1="4" y1="4" x2="20" y2="4" stroke="#b91c1c" strokeWidth="1" />
            <line x1="4" y1="7" x2="44" y2="7" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="0" y1="9" x2="80" y2="9" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect y="9" width="80" height="6" fill="#f1f5f9" />
            <line x1="4" y1="12" x2="18" y2="12" stroke="#475569" strokeWidth="0.8" />
            <line x1="26" y1="12" x2="42" y2="12" stroke="#475569" strokeWidth="0.8" />
            <line x1="4" y1="21" x2="22" y2="21" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="26" y1="21" x2="46" y2="21" stroke="#b91c1c" strokeWidth="1.2" />
            <rect x="58" y="18" width="18" height="5" rx="1" fill="#eff6ff" />
            <line x1="0" y1="26" x2="80" y2="26" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="4" y1="32" x2="20" y2="32" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="26" y1="32" x2="44" y2="32" stroke="#b91c1c" strokeWidth="1.2" />
            <rect x="58" y="29" width="18" height="5" rx="1" fill="#eff6ff" />
            <rect y="38" width="80" height="10" fill="#fffbeb" />
            <line x1="4" y1="43" x2="68" y2="43" stroke="#92400e" strokeWidth="1" />
        </svg>
    ),

    'compat-compact-horizontal-pill-strip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="4" y="4" width="22" height="4.5" rx="1.5" fill="#16a34a" />
            <rect x="30" y="4" width="28" height="4.5" rx="1" fill="#0f172a" />
            <rect x="4" y="13" width="34" height="9" rx="4.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="8" y1="17.5" x2="11" y2="17.5" stroke="#16a34a" strokeWidth="1.2" />
            <line x1="14" y1="17.5" x2="32" y2="17.5" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="42" y="13" width="34" height="9" rx="4.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="46" y1="17.5" x2="49" y2="17.5" stroke="#16a34a" strokeWidth="1.2" />
            <line x1="52" y1="17.5" x2="70" y2="17.5" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="4" y="26" width="36" height="9" rx="4.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="8" y1="30.5" x2="11" y2="30.5" stroke="#16a34a" strokeWidth="1.2" />
            <line x1="14" y1="30.5" x2="34" y2="30.5" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="44" y="26" width="32" height="9" rx="4.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="48" y1="30.5" x2="51" y2="30.5" stroke="#16a34a" strokeWidth="1.2" />
            <line x1="54" y1="30.5" x2="70" y2="30.5" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="4" y="38" width="40" height="6" rx="2" fill="#eff6ff" />
            <line x1="8" y1="41" x2="38" y2="41" stroke="#2563eb" strokeWidth="1" />
        </svg>
    ),

    // ── Product Comparison Variants ────────────────────────────────────
    'comp-classic-header-table': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#ede9fe" strokeWidth="1" />
            <rect width="80" height="11" rx="4" fill="#7530fb" />
            <rect x="5" y="4" width="20" height="3.5" rx="0.5" fill="#ffffff" />
            <rect x="30" y="4" width="22" height="3.5" rx="0.5" fill="#ffffff" />
            <rect x="56" y="4" width="18" height="3.5" rx="0.5" fill="#ffffff" />
            <line x1="28" y1="11" x2="28" y2="48" stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="54" y1="11" x2="54" y2="48" stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="0" y1="20" x2="80" y2="20" stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="0" y1="29" x2="80" y2="29" stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="0" y1="38" x2="80" y2="38" stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="6" y1="15.5" x2="20" y2="15.5" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="33" y1="15.5" x2="49" y2="15.5" stroke="#7530fb" strokeWidth="1.5" />
            <line x1="59" y1="15.5" x2="71" y2="15.5" stroke="#9ca3af" strokeWidth="1.2" />
            <line x1="6" y1="24.5" x2="22" y2="24.5" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="33" y1="24.5" x2="47" y2="24.5" stroke="#7530fb" strokeWidth="1.5" />
            <line x1="59" y1="24.5" x2="69" y2="24.5" stroke="#9ca3af" strokeWidth="1.2" />
        </svg>
    ),

    'comp-spotlight-winner-column': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect width="80" height="10" fill="#0f172a" />
            <rect x="28" y="0" width="26" height="48" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1.2" />
            <rect x="28" y="0" width="26" height="11" fill="#16a34a" />
            <rect x="31" y="2" width="20" height="3" rx="1" fill="#ffffff" />
            <rect x="32" y="6" width="18" height="3" rx="0.5" fill="#ffffff" />
            <rect x="4" y="3.5" width="20" height="3" fill="#ffffff" />
            <rect x="57" y="3.5" width="18" height="3" fill="#94a3b8" />
            <line x1="0" y1="20" x2="80" y2="20" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="30" x2="80" y2="30" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="40" x2="80" y2="40" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="41" cy="15.5" r="1.5" fill="#16a34a" />
            <circle cx="41" cy="25" r="1.5" fill="#16a34a" />
            <circle cx="41" cy="35" r="1.5" fill="#16a34a" />
        </svg>
    ),

    'comp-versus-head-to-head-cards': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="4" y="5" width="33" height="38" rx="3" fill="#f0fdf4" stroke="#86efac" strokeWidth="1" />
            <rect x="7" y="8" width="16" height="3" rx="1" fill="#16a34a" />
            <line x1="7" y1="16" x2="33" y2="16" stroke="#16a34a" strokeWidth="1.2" />
            <line x1="7" y1="23" x2="33" y2="23" stroke="#16a34a" strokeWidth="1.2" />
            <line x1="7" y1="30" x2="33" y2="30" stroke="#16a34a" strokeWidth="1.2" />
            <line x1="7" y1="37" x2="30" y2="37" stroke="#16a34a" strokeWidth="1.2" />
            <circle cx="40" cy="24" r="5" fill="#0f172a" />
            <text x="40" y="26.5" fontSize="4.5" fontWeight="bold" fill="#ffffff" textAnchor="middle">VS</text>
            <rect x="43" y="5" width="33" height="38" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="46" y="8" width="16" height="3" rx="1" fill="#94a3b8" />
            <line x1="46" y1="16" x2="72" y2="16" stroke="#94a3b8" strokeWidth="1.2" />
            <line x1="46" y1="23" x2="72" y2="23" stroke="#94a3b8" strokeWidth="1.2" />
            <line x1="46" y1="30" x2="72" y2="30" stroke="#94a3b8" strokeWidth="1.2" />
        </svg>
    ),

    'comp-horizontal-metric-bars': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="5" y="4" width="22" height="3" rx="1" fill="#2563eb" />
            <line x1="5" y1="12" x2="26" y2="12" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="5" y="15" width="70" height="3.5" rx="1.5" fill="#e2e8f0" />
            <rect x="5" y="15" width="58" height="3.5" rx="1.5" fill="#2563eb" />
            <line x1="5" y1="24" x2="24" y2="24" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="5" y="27" width="70" height="3.5" rx="1.5" fill="#e2e8f0" />
            <rect x="5" y="27" width="62" height="3.5" rx="1.5" fill="#2563eb" />
            <line x1="5" y1="36" x2="28" y2="36" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="5" y="39" width="70" height="3.5" rx="1.5" fill="#e2e8f0" />
            <rect x="5" y="39" width="52" height="3.5" rx="1.5" fill="#2563eb" />
        </svg>
    ),

    'comp-technical-spec-matrix': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect width="80" height="9" fill="#0f172a" />
            <line x1="4" y1="4.5" x2="24" y2="4.5" stroke="#ffffff" strokeWidth="1.2" />
            <line x1="32" y1="4.5" x2="52" y2="4.5" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="60" y1="4.5" x2="76" y2="4.5" stroke="#94a3b8" strokeWidth="1.2" />
            <line x1="0" y1="18" x2="80" y2="18" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="27" x2="80" y2="27" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="36" x2="80" y2="36" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="33" y="12" width="16" height="4.5" rx="1" fill="#ecfdf5" />
            <rect x="33" y="21" width="16" height="4.5" rx="1" fill="#ecfdf5" />
            <rect x="33" y="30" width="16" height="4.5" rx="1" fill="#ecfdf5" />
        </svg>
    ),

    'comp-good-better-best-tiers': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect width="80" height="9" fill="#0f172a" />
            <rect x="29" y="0" width="22" height="48" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="0.8" />
            <rect x="29" y="0" width="22" height="9" fill="#2563eb" />
            <line x1="32" y1="4.5" x2="48" y2="4.5" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="0" y1="19" x2="80" y2="19" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="29" x2="80" y2="29" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="39" x2="80" y2="39" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="40" cy="14" r="1.5" fill="#2563eb" />
            <circle cx="40" cy="24" r="1.5" fill="#2563eb" />
            <circle cx="40" cy="34" r="1.5" fill="#2563eb" />
        </svg>
    ),

    'comp-minimalist-hairline-editorial': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1" />
            <line x1="6" y1="8" x2="28" y2="8" stroke="#18181b" strokeWidth="1.5" />
            <line x1="6" y1="14" x2="74" y2="14" stroke="#18181b" strokeWidth="1" />
            <line x1="6" y1="22" x2="74" y2="22" stroke="#e4e4e7" strokeWidth="0.8" />
            <line x1="6" y1="30" x2="74" y2="30" stroke="#e4e4e7" strokeWidth="0.8" />
            <line x1="6" y1="38" x2="74" y2="38" stroke="#e4e4e7" strokeWidth="0.8" />
            <circle cx="45" cy="18" r="1.5" fill="#18181b" />
            <circle cx="45" cy="26" r="1.5" fill="#18181b" />
            <circle cx="45" cy="34" r="1.5" fill="#18181b" />
            <circle cx="65" cy="18" r="1.5" stroke="#a1a1aa" fill="none" />
            <circle cx="65" cy="26" r="1.5" stroke="#a1a1aa" fill="none" />
            <circle cx="65" cy="34" r="1.5" stroke="#a1a1aa" fill="none" />
        </svg>
    ),

    'comp-dark-terminal-matrix': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
            <rect width="80" height="8" fill="#0f172a" />
            <line x1="4" y1="4" x2="28" y2="4" stroke="#06b6d4" strokeWidth="1.2" />
            <line x1="62" y1="4" x2="76" y2="4" stroke="#10b981" strokeWidth="1" />
            <line x1="0" y1="18" x2="80" y2="18" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="0" y1="28" x2="80" y2="28" stroke="#1e293b" strokeWidth="0.8" />
            <line x1="0" y1="38" x2="80" y2="38" stroke="#1e293b" strokeWidth="0.8" />
            <rect x="30" y="11" width="18" height="4.5" fill="#0c1322" stroke="#06b6d4" strokeWidth="0.7" />
            <rect x="30" y="21" width="18" height="4.5" fill="#0c1322" stroke="#06b6d4" strokeWidth="0.7" />
            <rect x="30" y="31" width="18" height="4.5" fill="#0c1322" stroke="#06b6d4" strokeWidth="0.7" />
        </svg>
    ),

    'comp-cross-reference-checklist': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect width="80" height="9" fill="#0f172a" />
            <rect x="33" y="0" width="22" height="9" fill="#16a34a" />
            <rect x="58" y="0" width="22" height="9" fill="#dc2626" />
            <line x1="0" y1="19" x2="80" y2="19" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="29" x2="80" y2="29" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="0" y1="39" x2="80" y2="39" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="44" cy="14" r="2.5" fill="#16a34a" />
            <circle cx="44" cy="24" r="2.5" fill="#16a34a" />
            <circle cx="44" cy="34" r="2.5" fill="#16a34a" />
            <circle cx="69" cy="14" r="2.5" fill="#ef4444" />
            <circle cx="69" cy="24" r="2.5" fill="#ef4444" />
            <circle cx="69" cy="34" r="2.5" fill="#ef4444" />
        </svg>
    ),

    'comp-compact-mobile-split-pills': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="4" y="3" width="20" height="4" rx="1" fill="#2563eb" />
            <rect x="4" y="10" width="72" height="9" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="8" y1="14.5" x2="22" y2="14.5" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="34" y="11.5" width="18" height="6" rx="3" fill="#ecfdf5" />
            <rect x="56" y="11.5" width="16" height="6" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />
            <rect x="4" y="22" width="72" height="9" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="8" y1="26.5" x2="24" y2="26.5" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="34" y="23.5" width="18" height="6" rx="3" fill="#ecfdf5" />
            <rect x="56" y="23.5" width="16" height="6" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />
            <rect x="4" y="34" width="72" height="9" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="8" y1="38.5" x2="20" y2="38.5" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="34" y="35.5" width="18" height="6" rx="3" fill="#ecfdf5" />
            <rect x="56" y="35.5" width="16" height="6" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />
        </svg>
    ),

    // ── Key Features Grid (10 Distinct Retail Layouts) ──
    'feat-classic-cards-grid': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="5" y="10" width="21" height="28" rx="3" fill="#f8f7ff" stroke="#e9e3ff" strokeWidth="0.8" />
            <circle cx="15.5" cy="18" r="3.5" fill="#ede9fe" />
            <line x1="8" y1="26" x2="23" y2="26" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="9" y1="31" x2="22" y2="31" stroke="#6b7280" strokeWidth="0.8" />

            <rect x="29.5" y="10" width="21" height="28" rx="3" fill="#f8f7ff" stroke="#e9e3ff" strokeWidth="0.8" />
            <circle cx="40" cy="18" r="3.5" fill="#ede9fe" />
            <line x1="32.5" y1="26" x2="47.5" y2="26" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="33.5" y1="31" x2="46.5" y2="31" stroke="#6b7280" strokeWidth="0.8" />

            <rect x="54" y="10" width="21" height="28" rx="3" fill="#f8f7ff" stroke="#e9e3ff" strokeWidth="0.8" />
            <circle cx="64.5" cy="18" r="3.5" fill="#ede9fe" />
            <line x1="57" y1="26" x2="72" y2="26" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="58" y1="31" x2="71" y2="31" stroke="#6b7280" strokeWidth="0.8" />
        </svg>
    ),

    'feat-tech-bento-flagship': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="6" width="68" height="20" rx="3" fill="#0f172a" />
            <line x1="11" y1="12" x2="38" y2="12" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="11" y1="17" x2="52" y2="17" stroke="#94a3b8" strokeWidth="1" />
            <rect x="58" y="10" width="12" height="10" rx="2" fill="#1e293b" stroke="#38bdf8" strokeWidth="0.6" />
            <rect x="6" y="29" width="21" height="13" rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="29" y="29" width="22" height="13" rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="53" y="29" width="21" height="13" rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
        </svg>
    ),

    'feat-industrial-spec-bars': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="5" width="70" height="10" rx="1.5" fill="#0f172a" />
            <rect x="5" y="5" width="3" height="10" fill="#d97706" />
            <line x1="12" y1="10" x2="40" y2="10" stroke="#fcd34d" strokeWidth="1.2" />
            <rect x="5" y="18" width="70" height="7" rx="1" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
            <rect x="55" y="19" width="17" height="5" rx="1" fill="#fef3c7" />
            <rect x="5" y="28" width="70" height="7" rx="1" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.6" />
            <rect x="55" y="29" width="17" height="5" rx="1" fill="#fef3c7" />
            <rect x="5" y="37" width="70" height="7" rx="1" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.6" />
            <rect x="55" y="38" width="17" height="5" rx="1" fill="#fef3c7" />
        </svg>
    ),

    'feat-minimalist-hairline-editorial': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="8" x2="72" y2="8" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="8" y1="28" x2="72" y2="28" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="40" y1="14" x2="40" y2="42" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="10" y1="18" x2="16" y2="18" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="10" y1="22" x2="32" y2="22" stroke="#0f172a" strokeWidth="1" />
            <line x1="44" y1="18" x2="50" y2="18" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="44" y1="22" x2="66" y2="22" stroke="#0f172a" strokeWidth="1" />
            <line x1="10" y1="33" x2="16" y2="33" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="10" y1="37" x2="32" y2="37" stroke="#0f172a" strokeWidth="1" />
            <line x1="44" y1="33" x2="50" y2="33" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="44" y1="37" x2="66" y2="37" stroke="#0f172a" strokeWidth="1" />
        </svg>
    ),

    'feat-staggered-timeline-flow': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="14" y1="10" x2="14" y2="38" stroke="#cbd5e1" strokeWidth="1.2" />
            <circle cx="14" cy="12" r="3" fill="#4f46e5" />
            <rect x="22" y="8" width="50" height="8" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
            <circle cx="14" cy="24" r="3" fill="#ffffff" stroke="#4f46e5" strokeWidth="1.2" />
            <rect x="22" y="20" width="50" height="8" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
            <circle cx="14" cy="36" r="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="22" y="32" width="50" height="8" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
        </svg>
    ),

    'feat-split-hero-benefit-rail': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="5" y="5" width="70" height="38" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <path d="M5 8a3 3 0 0 1 3-3h18v38H8a3 3 0 0 1-3-3V8z" fill="#0f172a" />
            <rect x="9" y="10" width="12" height="3" rx="1" fill="#059669" />
            <line x1="9" y1="17" x2="21" y2="17" stroke="#ffffff" strokeWidth="1.2" />
            <rect x="30" y="8" width="42" height="9" rx="1.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.6" />
            <rect x="30" y="19" width="42" height="9" rx="1.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.6" />
            <rect x="30" y="30" width="42" height="9" rx="1.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.6" />
        </svg>
    ),

    'feat-cyber-dark-telemetry': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
            <line x1="8" y1="8" x2="42" y2="8" stroke="#06b6d4" strokeWidth="1.5" />
            <rect x="8" y="15" width="30" height="12" rx="1.5" fill="#0f172a" stroke="#1e293b" strokeWidth="0.8" />
            <rect x="42" y="15" width="30" height="12" rx="1.5" fill="#0f172a" stroke="#1e293b" strokeWidth="0.8" />
            <rect x="8" y="30" width="30" height="12" rx="1.5" fill="#0f172a" stroke="#1e293b" strokeWidth="0.8" />
            <rect x="42" y="30" width="30" height="12" rx="1.5" fill="#0f172a" stroke="#1e293b" strokeWidth="0.8" />
        </svg>
    ),

    'feat-circular-badge-quadrant': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="8" width="68" height="32" rx="3" fill="#faf5ff" stroke="#ede9fe" strokeWidth="0.8" />
            <circle cx="15" cy="20" r="5" fill="#f59e0b" stroke="#7c3aed" strokeWidth="1" />
            <circle cx="32" cy="20" r="5" fill="#f59e0b" stroke="#7c3aed" strokeWidth="1" />
            <circle cx="49" cy="20" r="5" fill="#f59e0b" stroke="#7c3aed" strokeWidth="1" />
            <circle cx="66" cy="20" r="5" fill="#f59e0b" stroke="#7c3aed" strokeWidth="1" />
        </svg>
    ),

    'feat-accordion-style-ledger': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="7" y="13" width="66" height="9" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
            <rect x="56" y="15" width="14" height="5" rx="1" fill="#fff7ed" />
            <rect x="7" y="24" width="66" height="9" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
            <rect x="56" y="26" width="14" height="5" rx="1" fill="#fff7ed" />
            <rect x="7" y="35" width="66" height="9" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
            <rect x="56" y="37" width="14" height="5" rx="1" fill="#fff7ed" />
        </svg>
    ),

    'feat-compact-mobile-capsule-strip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="8" y1="8" x2="38" y2="8" stroke="#2563eb" strokeWidth="1.5" />
            <rect x="6" y="14" width="32" height="8" rx="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.6" />
            <rect x="42" y="14" width="32" height="8" rx="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.6" />
            <rect x="6" y="24" width="32" height="8" rx="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.6" />
            <rect x="42" y="24" width="32" height="8" rx="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.6" />
            <rect x="6" y="34" width="32" height="8" rx="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.6" />
            <rect x="42" y="34" width="32" height="8" rx="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.6" />
        </svg>
    ),

    // VAT Notice Variants (10 Styles)
    'vat-classic-card': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="10" width="68" height="28" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="11" y="18" width="8" height="12" rx="1" fill="#cbd5e1" />
            <line x1="24" y1="19" x2="55" y2="19" stroke="#1e1535" strokeWidth="1.5" />
            <line x1="24" y1="26" x2="68" y2="26" stroke="#64748b" strokeWidth="1" />
        </svg>
    ),
    'vat-official-certificate-badge': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="8" width="70" height="7" fill="#0f172a" />
            <circle cx="15" cy="27" r="4" fill="#ecfdf5" stroke="#10b981" strokeWidth="0.8" />
            <line x1="23" y1="24" x2="48" y2="24" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="23" y1="30" x2="44" y2="30" stroke="#64748b" strokeWidth="0.8" />
            <rect x="53" y="20" width="18" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />
        </svg>
    ),
    'vat-tax-breakdown-ledger': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="6" width="70" height="36" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="6" width="70" height="8" fill="#f1f5f9" />
            <line x1="9" y1="10" x2="35" y2="10" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="9" y="19" width="18" height="18" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.6" />
            <rect x="31" y="19" width="18" height="18" rx="1.5" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="0.6" />
            <rect x="53" y="19" width="18" height="18" rx="1.5" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="0.6" />
        </svg>
    ),
    'vat-minimalist-hairline-rule': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="12" x2="72" y2="12" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="8" y1="18" x2="32" y2="18" stroke="#64748b" strokeWidth="0.8" />
            <line x1="48" y1="18" x2="72" y2="18" stroke="#0f172a" strokeWidth="1" />
            <line x1="8" y1="26" x2="42" y2="26" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="8" y1="32" x2="68" y2="32" stroke="#64748b" strokeWidth="0.8" />
            <line x1="8" y1="38" x2="72" y2="38" stroke="#e2e8f0" strokeWidth="0.8" />
        </svg>
    ),
    'vat-split-guarantee-ribbon': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="8" width="22" height="32" fill="#0f172a" />
            <line x1="8" y1="18" x2="23" y2="18" stroke="#f59e0b" strokeWidth="1.2" />
            <line x1="8" y1="24" x2="25" y2="24" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="33" y1="20" x2="56" y2="20" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="33" y1="28" x2="70" y2="28" stroke="#64748b" strokeWidth="0.8" />
        </svg>
    ),
    'vat-corporate-security-seal': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="8" width="3" height="32" fill="#1e40af" />
            <line x1="12" y1="15" x2="36" y2="15" stroke="#1e40af" strokeWidth="1.2" />
            <line x1="12" y1="21" x2="48" y2="21" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="12" y1="27" x2="68" y2="27" stroke="#64748b" strokeWidth="0.8" />
            <rect x="12" y="32" width="46" height="5" rx="1" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.6" />
        </svg>
    ),
    'vat-compact-pill-strip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="17" width="68" height="14" rx="7" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="13" cy="24" r="2.5" fill="#16a34a" />
            <line x1="19" y1="24" x2="46" y2="24" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="56" y="20.5" width="14" height="7" rx="3.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />
        </svg>
    ),
    'vat-b2b-contractor-stamp': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="2" fill="#fefce8" stroke="#b45309" strokeWidth="1" strokeDasharray="2 1.5" />
            <circle cx="18" cy="24" r="9" stroke="#b45309" strokeWidth="1.2" />
            <text x="18" y="26.5" fontSize="6" fontWeight="bold" fill="#78350f" textAnchor="middle">20%</text>
            <line x1="32" y1="19" x2="68" y2="19" stroke="#78350f" strokeWidth="1.2" />
            <line x1="32" y1="25" x2="58" y2="25" stroke="#b45309" strokeWidth="1" />
            <line x1="32" y1="31" x2="65" y2="31" stroke="#78350f" strokeWidth="0.8" />
        </svg>
    ),
    'vat-digital-download-vault': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="3" fill="#f8f7ff" stroke="#ede9fe" strokeWidth="0.8" />
            <rect x="10" y="16" width="12" height="16" rx="2" fill="#f3eeff" stroke="#ddd6fe" strokeWidth="0.8" />
            <line x1="28" y1="19" x2="52" y2="19" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="28" y1="27" x2="50" y2="27" stroke="#6b7280" strokeWidth="0.8" />
            <rect x="56" y="16" width="15" height="16" rx="2" fill="#ffffff" stroke="#ddd6fe" strokeWidth="0.6" />
        </svg>
    ),
    'vat-dual-jurisdiction-eu-uk': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="8" width="70" height="8" fill="#0f172a" />
            <line x1="9" y1="12" x2="38" y2="12" stroke="#38bdf8" strokeWidth="1" />
            <line x1="56" y1="12" x2="71" y2="12" stroke="#ffffff" strokeWidth="1" />
            <line x1="9" y1="24" x2="48" y2="24" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="9" y1="31" x2="68" y2="31" stroke="#475569" strokeWidth="0.8" />
        </svg>
    ),

    // Feedback Score Variants (10 Styles)
    'fb-classic-split-card': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="3" fill="#f8f7ff" stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="9" y1="16" x2="38" y2="16" stroke="#1e1535" strokeWidth="1.5" />
            <line x1="9" y1="22" x2="32" y2="22" stroke="#6b7280" strokeWidth="0.8" />
            <circle cx="11" cy="29" r="1.5" fill="#f59e0b" />
            <circle cx="16" cy="29" r="1.5" fill="#f59e0b" />
            <circle cx="21" cy="29" r="1.5" fill="#f59e0b" />
            <circle cx="26" cy="29" r="1.5" fill="#f59e0b" />
            <circle cx="31" cy="29" r="1.5" fill="#f59e0b" />
            <rect x="46" y="14" width="24" height="20" rx="3" fill="#7530fb" />
            <line x1="49" y1="21" x2="67" y2="21" stroke="#ffffff" strokeWidth="1" />
            <line x1="51" y1="27" x2="65" y2="27" stroke="#ffffff" strokeWidth="1.5" />
        </svg>
    ),
    'fb-ebay-top-rated-plus-seal': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="8" width="70" height="7" fill="#0f172a" />
            <circle cx="15" cy="27" r="5" fill="#fef3c7" stroke="#f59e0b" strokeWidth="0.8" />
            <line x1="24" y1="23" x2="52" y2="23" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="24" y1="28" x2="48" y2="28" stroke="#64748b" strokeWidth="0.8" />
            <circle cx="26" cy="33" r="1.2" fill="#f59e0b" />
            <circle cx="30" cy="33" r="1.2" fill="#f59e0b" />
            <circle cx="34" cy="33" r="1.2" fill="#f59e0b" />
            <rect x="56" y="20" width="16" height="14" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" />
        </svg>
    ),
    'fb-power-seller-metric-grid': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="7" width="70" height="34" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="7" width="70" height="7" fill="#f8fafc" />
            <rect x="8" y="18" width="19" height="19" rx="1.5" fill="#f8f7ff" stroke="#ddd6fe" strokeWidth="0.6" />
            <rect x="30" y="18" width="19" height="19" rx="1.5" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="0.6" />
            <rect x="52" y="18" width="19" height="19" rx="1.5" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="0.6" />
        </svg>
    ),
    'fb-minimalist-hairline-prestige': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="12" x2="72" y2="12" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="8" y1="18" x2="38" y2="18" stroke="#64748b" strokeWidth="0.8" />
            <line x1="52" y1="18" x2="72" y2="18" stroke="#0f172a" strokeWidth="1" />
            <line x1="8" y1="26" x2="48" y2="26" stroke="#0f172a" strokeWidth="1.2" />
            <circle cx="58" cy="26" r="1.5" fill="#d97706" />
            <circle cx="63" cy="26" r="1.5" fill="#d97706" />
            <circle cx="68" cy="26" r="1.5" fill="#d97706" />
            <line x1="8" y1="34" x2="68" y2="34" stroke="#64748b" strokeWidth="0.8" />
            <line x1="8" y1="39" x2="72" y2="39" stroke="#e2e8f0" strokeWidth="0.8" />
        </svg>
    ),
    'fb-satisfaction-gauge-ring': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="18" cy="24" r="8" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5" />
            <line x1="31" y1="19" x2="56" y2="19" stroke="#0f172a" strokeWidth="1.2" />
            <circle cx="33" cy="25" r="1.2" fill="#f59e0b" />
            <circle cx="37" cy="25" r="1.2" fill="#f59e0b" />
            <circle cx="41" cy="25" r="1.2" fill="#f59e0b" />
            <line x1="31" y1="31" x2="68" y2="31" stroke="#64748b" strokeWidth="0.8" />
        </svg>
    ),
    'fb-veteran-timeline-pillar': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="8" width="22" height="32" fill="#0f172a" />
            <line x1="8" y1="17" x2="23" y2="17" stroke="#f59e0b" strokeWidth="1" />
            <line x1="8" y1="23" x2="24" y2="23" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="32" y1="20" x2="56" y2="20" stroke="#0f172a" strokeWidth="1.2" />
            <circle cx="60" cy="20" r="1.2" fill="#f59e0b" />
            <circle cx="64" cy="20" r="1.2" fill="#f59e0b" />
            <line x1="32" y1="28" x2="70" y2="28" stroke="#64748b" strokeWidth="0.8" />
        </svg>
    ),
    'fb-compact-pill-strip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="17" width="68" height="14" rx="7" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="13" cy="24" r="2.5" fill="#f59e0b" />
            <line x1="19" y1="24" x2="48" y2="24" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="56" y="20.5" width="14" height="7" rx="3.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />
        </svg>
    ),
    'fb-recent-reviews-showcase': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="9" y1="18" x2="26" y2="18" stroke="#0f172a" strokeWidth="1.2" />
            <circle cx="11" cy="24" r="1.2" fill="#f59e0b" />
            <circle cx="15" cy="24" r="1.2" fill="#f59e0b" />
            <circle cx="19" cy="24" r="1.2" fill="#f59e0b" />
            <line x1="31" y1="10" x2="31" y2="38" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="36" y1="18" x2="70" y2="18" stroke="#475569" strokeWidth="0.8" />
            <line x1="36" y1="24" x2="64" y2="24" stroke="#475569" strokeWidth="0.8" />
            <line x1="36" y1="30" x2="55" y2="30" stroke="#059669" strokeWidth="0.8" />
        </svg>
    ),
    'fb-enterprise-trust-banner': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <line x1="9" y1="14" x2="38" y2="14" stroke="#38bdf8" strokeWidth="1" />
            <line x1="9" y1="22" x2="48" y2="22" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="11" cy="30" r="1.5" fill="#fbbf24" />
            <circle cx="16" cy="30" r="1.5" fill="#fbbf24" />
            <circle cx="21" cy="30" r="1.5" fill="#fbbf24" />
            <rect x="55" y="16" width="17" height="16" rx="2" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
        </svg>
    ),
    'fb-performance-scorecard-strip': (col, light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="7" width="70" height="34" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="7" width="70" height="7" fill="#f1f5f9" />
            <line x1="9" y1="11" x2="32" y2="11" stroke="#0f172a" strokeWidth="1" />
            <rect x="8" y="18" width="19" height="18" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.6" />
            <rect x="30" y="18" width="19" height="18" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.6" />
            <rect x="52" y="18" width="19" height="18" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.6" />
        </svg>
    ),

    // ── Pull Quote Thumbnails (10 Styles) ──────────────────────────────────
    'pq-classic-serif-centered': (col: string = '#7530fb', light: string = '#ede9fe') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="40" cy="12" r="2.5" fill={light || '#ede9fe'} />
            <line x1="12" y1="21" x2="68" y2="21" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="18" y1="27" x2="62" y2="27" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="28" y1="36" x2="52" y2="36" stroke={col || '#7530fb'} strokeWidth="1.5" />
        </svg>
    ),

    'pq-editorial-thick-accent-pillar': (col: string = '#7530fb', light: string = '#f8fafc') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="0" y="0" width="4" height="48" rx="1" fill={col || '#7530fb'} />
            <line x1="10" y1="12" x2="34" y2="12" stroke={col || '#7530fb'} strokeWidth="1" />
            <line x1="10" y1="19" x2="68" y2="19" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="10" y1="25" x2="60" y2="25" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="10" y1="34" x2="42" y2="34" stroke={light !== '#f8fafc' ? light : '#64748b'} strokeWidth="1" />
        </svg>
    ),

    'pq-customer-testimonial-stars': (col: string = '#7530fb', light: string = '#f1f5f9') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <circle cx="28" cy="11" r="1.5" fill="#f59e0b" />
            <circle cx="34" cy="11" r="1.5" fill="#f59e0b" />
            <circle cx="40" cy="11" r="1.5" fill="#f59e0b" />
            <circle cx="46" cy="11" r="1.5" fill="#f59e0b" />
            <circle cx="52" cy="11" r="1.5" fill="#f59e0b" />
            <line x1="12" y1="20" x2="68" y2="20" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="16" y1="26" x2="64" y2="26" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="22" y="33" width="36" height="7" rx="3.5" fill={light || '#f1f5f9'} />
            <line x1="28" y1="36.5" x2="52" y2="36.5" stroke={col || '#16a34a'} strokeWidth="1" />
        </svg>
    ),

    'pq-minimalist-hairline-bracket': (_col: string = '#7530fb', _light: string = '#94a3b8') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="9" x2="72" y2="9" stroke="#0f172a" strokeWidth="1.2" />
            <circle cx="40" cy="15" r="1.5" fill={_light || '#94a3b8'} />
            <line x1="14" y1="23" x2="66" y2="23" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="20" y1="29" x2="60" y2="29" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="8" y1="37" x2="72" y2="37" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="30" y1="42" x2="50" y2="42" stroke={_col || '#64748b'} strokeWidth="0.8" />
        </svg>
    ),

    'pq-merchant-founder-signature': (col: string = '#b45309', light: string = '#fffdfa') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill={light || '#fffdfa'} stroke="#e7e5e4" strokeWidth="1" />
            <line x1="10" y1="16" x2="16" y2="28" stroke={col || '#b45309'} strokeWidth="1.5" />
            <line x1="22" y1="16" x2="70" y2="16" stroke="#1c1917" strokeWidth="1.2" />
            <line x1="22" y1="23" x2="64" y2="23" stroke="#1c1917" strokeWidth="1.2" />
            <line x1="22" y1="32" x2="48" y2="32" stroke="#78716c" strokeWidth="1" />
        </svg>
    ),

    'pq-industrial-heavy-spec-box': (col: string = '#7530fb', light: string = '#f8fafc') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="6" width="70" height="36" rx="2" fill={light || '#f8fafc'} stroke="#0f172a" strokeWidth="1" />
            <rect x="5" y="6" width="70" height="8" fill="#0f172a" />
            <line x1="9" y1="10" x2="38" y2="10" stroke="#f59e0b" strokeWidth="1.2" />
            <line x1="9" y1="22" x2="66" y2="22" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="9" y1="28" x2="54" y2="28" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="9" y1="35" x2="40" y2="35" stroke={col || '#10b981'} strokeWidth="1" />
        </svg>
    ),

    'pq-modern-offset-speech-bubble': (col: string = '#7530fb', light: string = '#f1f5f9') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="8" width="68" height="32" rx="6" fill={light || '#f1f5f9'} stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="12" y1="17" x2="64" y2="17" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="12" y1="23" x2="52" y2="23" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="12" y1="31" x2="36" y2="31" stroke={col || '#7530fb'} strokeWidth="1.5" />
        </svg>
    ),

    'pq-dark-midnight-prestige': (col: string = '#f59e0b', light: string = '#0f172a') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill={light || '#0f172a'} stroke="#334155" strokeWidth="1" />
            <circle cx="40" cy="12" r="2.5" fill={col || '#f59e0b'} />
            <line x1="14" y1="21" x2="66" y2="21" stroke="#ffffff" strokeWidth="1.2" />
            <line x1="18" y1="27" x2="62" y2="27" stroke="#ffffff" strokeWidth="1.2" />
            <line x1="28" y1="36" x2="52" y2="36" stroke={col || '#f59e0b'} strokeWidth="1.5" />
        </svg>
    ),

    'pq-split-brand-flag': (col: string = '#7530fb', light: string = '#f8fafc') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="5" y="8" width="70" height="32" rx="3" fill={light || '#f8fafc'} stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="5" y="8" width="18" height="32" fill={col || '#7530fb'} />
            <circle cx="14" cy="24" r="3.5" fill="#ffffff" />
            <line x1="28" y1="18" x2="68" y2="18" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="28" y1="24" x2="62" y2="24" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="28" y1="31" x2="48" y2="31" stroke={col || '#7530fb'} strokeWidth="1.2" />
        </svg>
    ),

    'pq-compact-inline-callout': (col: string = '#7530fb', light: string = '#f1f5f9') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="16" width="68" height="16" rx="8" fill={light || '#f1f5f9'} stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="14" cy="24" r="2.5" fill={col || '#7530fb'} />
            <line x1="21" y1="24" x2="48" y2="24" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="53" y1="24" x2="68" y2="24" stroke={col || '#7530fb'} strokeWidth="1" />
        </svg>
    ),

    // ── Section Label Thumbnails (10 Styles) ────────────────────────────────
    'sl-classic-pill-capsule': (col: string = '#7530fb', light: string = '#f3eeff') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="10" y="18" width="60" height="12" rx="6" fill={light || '#f3eeff'} stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="20" y1="24" x2="60" y2="24" stroke={col || '#7530fb'} strokeWidth="2" />
        </svg>
    ),

    'sl-minimalist-hairline-accent': (col: string = '#7530fb', _light: string = '#f8fafc') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="17" width="64" height="14" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="8" y="17" width="3" height="14" fill={col || '#7530fb'} />
            <circle cx="15" cy="24" r="1.5" fill={col || '#7530fb'} />
            <line x1="20" y1="24" x2="64" y2="24" stroke="#0f172a" strokeWidth="1.8" />
        </svg>
    ),

    'sl-editorial-serif-crest': (col: string = '#d4af37', _light: string = '#ffffff') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e7e5e4" strokeWidth="1" />
            <line x1="8" y1="24" x2="26" y2="24" stroke={col || '#d4af37'} strokeWidth="0.8" />
            <circle cx="31" cy="24" r="1" fill={col || '#d4af37'} />
            <line x1="36" y1="24" x2="44" y2="24" stroke="#1c1917" strokeWidth="2" />
            <circle cx="49" cy="24" r="1" fill={col || '#d4af37'} />
            <line x1="54" y1="24" x2="72" y2="24" stroke={col || '#d4af37'} strokeWidth="0.8" />
        </svg>
    ),

    'sl-industrial-spec-badge': (col: string = '#f59e0b', light: string = '#0f172a') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="8" y="17" width="64" height="14" rx="2" fill={light || '#0f172a'} />
            <rect x="8" y="17" width="3" height="14" fill={col || '#f59e0b'} />
            <circle cx="16" cy="24" r="1.5" fill={col || '#f59e0b'} />
            <line x1="22" y1="24" x2="64" y2="24" stroke="#f8fafc" strokeWidth="1.8" />
        </svg>
    ),

    'sl-segmented-dualtone-chip': (col: string = '#7530fb', light: string = '#f8fafc') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="10" y="17" width="60" height="14" rx="4" fill={light || '#f8fafc'} stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="10" y="17" width="14" height="14" fill={col || '#7530fb'} />
            <circle cx="17" cy="24" r="2" fill="#ffffff" />
            <line x1="30" y1="24" x2="62" y2="24" stroke="#1e1535" strokeWidth="1.8" />
        </svg>
    ),

    'sl-numbered-index-rule': (col: string = '#7530fb', _light: string = '#ffffff') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="22" width="6" height="4" rx="1" fill={col || '#7530fb'} />
            <line x1="18" y1="24" x2="48" y2="24" stroke="#0f172a" strokeWidth="1.8" />
            <line x1="52" y1="24" x2="72" y2="24" stroke="#cbd5e1" strokeWidth="1" />
        </svg>
    ),

    'sl-official-verification-seal': (col: string = '#10b981', light: string = '#f1f5f9') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="8" y="17" width="64" height="14" rx="2" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
            <rect x="8" y="17" width="12" height="14" fill="#0f172a" />
            <circle cx="14" cy="24" r="1.5" fill={col || '#10b981'} />
            <line x1="24" y1="24" x2="52" y2="24" stroke="#0f172a" strokeWidth="1.8" />
            <rect x="58" y="17" width="14" height="14" fill={light || '#f1f5f9'} />
            <line x1="61" y1="24" x2="69" y2="24" stroke="#64748b" strokeWidth="1" />
        </svg>
    ),

    'sl-bold-contrast-banner': (col: string = '#7530fb', _light: string = '#ffffff') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="12" y="18" width="56" height="14" rx="2" fill="#0f172a" />
            <rect x="10" y="16" width="56" height="14" rx="2" fill={col || '#7530fb'} />
            <line x1="18" y1="23" x2="58" y2="23" stroke="#ffffff" strokeWidth="2" />
        </svg>
    ),

    'sl-tailor-stitched-parchment': (col: string = '#78716c', light: string = '#fffdfa') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#d6d3d1" strokeWidth="1" />
            <rect x="8" y="17" width="64" height="14" rx="2" fill={light || '#fffdfa'} stroke="#d6d3d1" strokeWidth="1" strokeDasharray="2 1.5" />
            <rect x="8" y="17" width="16" height="14" fill="#f5f5f4" />
            <line x1="12" y1="24" x2="20" y2="24" stroke={col || '#78716c'} strokeWidth="1.2" />
            <line x1="28" y1="24" x2="66" y2="24" stroke="#1c1917" strokeWidth="1.8" />
        </svg>
    ),

    'sl-compact-dot-bullet': (col: string = '#7530fb', _light: string = '#ffffff') => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="16" cy="24" r="3" fill={col || '#7530fb'} />
            <line x1="24" y1="24" x2="66" y2="24" stroke="#0f172a" strokeWidth="2" />
        </svg>
    ),

    // ── Breadcrumb Bar Thumbnails (10 Styles) ────────────────────────────────
    'bb-classic-inline': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#ede9fe" strokeWidth="1" />
            <rect x="6" y="16" width="68" height="16" rx="3" fill="#f8f7ff" stroke="#ede9fe" strokeWidth="1" />
            <line x1="12" y1="24" x2="26" y2="24" stroke="#64748b" strokeWidth="1.8" />
            <path d="M30 22l2 2-2 2" stroke={col} strokeWidth="1.5" />
            <line x1="36" y1="24" x2="50" y2="24" stroke="#64748b" strokeWidth="1.8" />
            <path d="M54 22l2 2-2 2" stroke={col} strokeWidth="1.5" />
            <line x1="60" y1="24" x2="68" y2="24" stroke="#1e1535" strokeWidth="2" />
        </svg>
    ),

    'bb-segmented-ribbon-pills': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="18" width="18" height="12" rx="3" fill={col} />
            <line x1="10" y1="24" x2="20" y2="24" stroke="#ffffff" strokeWidth="1.5" />
            <path d="M27 24h4m-2-2l2 2-2 2" stroke="#94a3b8" strokeWidth="1.2" />
            <rect x="34" y="18" width="18" height="12" rx="3" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="38" y1="24" x2="48" y2="24" stroke="#334155" strokeWidth="1.5" />
            <path d="M55 24h4m-2-2l2 2-2 2" stroke="#94a3b8" strokeWidth="1.2" />
            <line x1="62" y1="24" x2="74" y2="24" stroke="#0f172a" strokeWidth="2" />
        </svg>
    ),

    'bb-boutique-luxury-slash': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e7e5e4" strokeWidth="1" />
            <line x1="6" y1="16" x2="74" y2="16" stroke="#e7e5e4" strokeWidth="1" />
            <line x1="6" y1="32" x2="74" y2="32" stroke="#e7e5e4" strokeWidth="1" />
            <line x1="10" y1="24" x2="24" y2="24" stroke="#78716c" strokeWidth="1.5" />
            <line x1="28" y1="28" x2="32" y2="20" stroke={col} strokeWidth="1.2" />
            <line x1="36" y1="24" x2="48" y2="24" stroke="#78716c" strokeWidth="1.5" />
            <line x1="52" y1="28" x2="56" y2="20" stroke={col} strokeWidth="1.2" />
            <line x1="60" y1="24" x2="70" y2="24" stroke="#1c1917" strokeWidth="2" />
        </svg>
    ),

    'bb-industrial-technical-spec': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" />
            <rect x="6" y="16" width="3" height="16" fill="#f59e0b" />
            <line x1="13" y1="24" x2="26" y2="24" stroke="#94a3b8" strokeWidth="1.5" />
            <polygon points="30,22 34,24 30,26" fill="#f59e0b" />
            <line x1="38" y1="24" x2="50" y2="24" stroke="#94a3b8" strokeWidth="1.5" />
            <polygon points="54,22 58,24 54,26" fill="#f59e0b" />
            <line x1="62" y1="24" x2="74" y2="24" stroke="#f8fafc" strokeWidth="2" />
        </svg>
    ),

    'bb-minimalist-hairline-accent': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="16" width="3" height="16" fill={col} />
            <line x1="14" y1="24" x2="28" y2="24" stroke="#64748b" strokeWidth="1.5" />
            <line x1="32" y1="27" x2="35" y2="21" stroke="#cbd5e1" strokeWidth="1.2" />
            <line x1="39" y1="24" x2="52" y2="24" stroke="#64748b" strokeWidth="1.5" />
            <line x1="56" y1="27" x2="59" y2="21" stroke="#cbd5e1" strokeWidth="1.2" />
            <line x1="63" y1="24" x2="74" y2="24" stroke="#0f172a" strokeWidth="2" />
        </svg>
    ),

    'bb-trust-certified-channel': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#bbf7d0" strokeWidth="1" />
            <rect x="6" y="16" width="68" height="16" rx="3" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1" />
            <rect x="9" y="19" width="8" height="10" rx="1.5" fill="#10b981" />
            <line x1="21" y1="24" x2="34" y2="24" stroke="#064e3b" strokeWidth="1.5" />
            <path d="M38 22l2 2-2 2" stroke="#10b981" strokeWidth="1.5" />
            <line x1="44" y1="24" x2="56" y2="24" stroke="#047857" strokeWidth="1.5" />
            <path d="M60 22l2 2-2 2" stroke="#10b981" strokeWidth="1.5" />
            <line x1="65" y1="24" x2="71" y2="24" stroke="#064e3b" strokeWidth="2" />
        </svg>
    ),

    'bb-bold-contrast-banner': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" />
            <line x1="10" y1="24" x2="24" y2="24" stroke="#a1a1aa" strokeWidth="1.5" />
            <line x1="27" y1="28" x2="30" y2="20" stroke={col} strokeWidth="1.5" />
            <line x1="30" y1="28" x2="33" y2="20" stroke={col} strokeWidth="1.5" />
            <line x1="37" y1="24" x2="49" y2="24" stroke="#e4e4e7" strokeWidth="1.5" />
            <line x1="52" y1="28" x2="55" y2="20" stroke={col} strokeWidth="1.5" />
            <line x1="55" y1="28" x2="58" y2="20" stroke={col} strokeWidth="1.5" />
            <line x1="62" y1="24" x2="72" y2="24" stroke="#ffffff" strokeWidth="2" />
        </svg>
    ),

    'bb-catalog-index-tab': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="8" y="19" width="16" height="10" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="11" y1="24" x2="21" y2="24" stroke={col} strokeWidth="1.2" />
            <line x1="28" y1="24" x2="42" y2="24" stroke="#1e293b" strokeWidth="1.5" />
            <circle cx="46" cy="24" r="1" fill="#94a3b8" />
            <line x1="50" y1="24" x2="62" y2="24" stroke="#1e293b" strokeWidth="1.5" />
            <circle cx="66" cy="24" r="1" fill="#94a3b8" />
            <line x1="70" y1="24" x2="74" y2="24" stroke={col} strokeWidth="2" />
        </svg>
    ),

    'bb-stepper-progress-nav': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="12" cy="24" r="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="20" y1="24" x2="28" y2="24" stroke="#cbd5e1" strokeWidth="1.5" />
            <circle cx="34" cy="24" r="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="42" y1="24" x2="50" y2="24" stroke="#cbd5e1" strokeWidth="1.5" />
            <circle cx="56" cy="24" r="4" fill={col} />
            <line x1="64" y1="24" x2="74" y2="24" stroke="#0f172a" strokeWidth="2" />
        </svg>
    ),

    'bb-compact-dot-bullet': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="17" width="68" height="14" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="12" y1="24" x2="24" y2="24" stroke="#64748b" strokeWidth="1.5" />
            <circle cx="28" cy="24" r="1.5" fill={col} />
            <line x1="32" y1="24" x2="46" y2="24" stroke="#64748b" strokeWidth="1.5" />
            <circle cx="50" cy="24" r="1.5" fill={col} />
            <line x1="54" y1="24" x2="68" y2="24" stroke="#0f172a" strokeWidth="1.8" />
        </svg>
    ),

    // ── International Shipping Thumbnails (10 Styles) ─────────────────────────
    'is-classic-amber-notice': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="8" width="68" height="32" rx="4" fill="#fff7ed" stroke="#fed7aa" strokeWidth="1" />
            <circle cx="15" cy="24" r="5" fill="#ea580c" fillOpacity="0.2" stroke="#ea580c" strokeWidth="0.8" />
            <line x1="24" y1="20" x2="66" y2="20" stroke="#c2410c" strokeWidth="1.8" />
            <line x1="24" y1="26" x2="58" y2="26" stroke="#9a3412" strokeWidth="1.2" />
        </svg>
    ),

    'is-global-courier-track': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="6" y="8" width="22" height="6" rx="2" fill="#0284c7" />
            <line x1="6" y1="19" x2="48" y2="19" stroke="#0f172a" strokeWidth="1.8" />
            <line x1="6" y1="26" x2="68" y2="26" stroke="#64748b" strokeWidth="1.2" />
            <rect x="6" y="32" width="24" height="6" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="34" y="32" width="24" height="6" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
        </svg>
    ),

    'is-official-customs-declaration': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fffdfa" stroke="#d6d3d1" strokeWidth="1.5" strokeDasharray="2 1.5" />
            <rect x="6" y="8" width="68" height="8" rx="2" fill="#f5f5f4" />
            <line x1="10" y1="12" x2="38" y2="12" stroke="#44403c" strokeWidth="1.2" />
            <line x1="8" y1="22" x2="46" y2="22" stroke="#1c1917" strokeWidth="1.8" />
            <line x1="8" y1="28" x2="68" y2="28" stroke="#78716c" strokeWidth="1.2" />
            <line x1="8" y1="36" x2="52" y2="36" stroke="#a8a29e" strokeWidth="1" />
        </svg>
    ),

    'is-ebay-eis-managed-hub': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1" />
            <rect x="6" y="14" width="14" height="20" rx="3" fill="#eff6ff" stroke="#dbeafe" strokeWidth="0.8" />
            <rect x="25" y="12" width="20" height="5" rx="1.5" fill="#dbeafe" />
            <line x1="25" y1="22" x2="68" y2="22" stroke="#0f172a" strokeWidth="1.8" />
            <line x1="25" y1="29" x2="62" y2="29" stroke="#334155" strokeWidth="1.2" />
        </svg>
    ),

    'is-minimalist-hairline-slate': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="12" width="3" height="24" rx="1" fill="#0284c7" />
            <line x1="14" y1="20" x2="56" y2="20" stroke="#0f172a" strokeWidth="1.8" />
            <line x1="14" y1="27" x2="70" y2="27" stroke="#64748b" strokeWidth="1.2" />
        </svg>
    ),

    'is-duty-free-ioss-compliance': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#bbf7d0" strokeWidth="1" />
            <rect x="6" y="8" width="68" height="32" rx="4" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1" />
            <circle cx="15" cy="24" r="5" fill="#16a34a" />
            <line x1="24" y1="20" x2="68" y2="20" stroke="#166534" strokeWidth="1.8" />
            <line x1="24" y1="27" x2="60" y2="27" stroke="#15803d" strokeWidth="1.2" />
        </svg>
    ),

    'is-stepper-transit-timeline': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="12" x2="38" y2="12" stroke="#0f172a" strokeWidth="1.8" />
            <rect x="6" y="18" width="20" height="18" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="30" y="18" width="20" height="18" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="54" y="18" width="20" height="18" rx="2" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="0.8" />
        </svg>
    ),

    'is-industrial-heavy-freight': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" />
            <rect x="6" y="10" width="3" height="28" rx="1" fill="#f59e0b" />
            <line x1="14" y1="15" x2="38" y2="15" stroke="#f59e0b" strokeWidth="1.2" />
            <line x1="14" y1="22" x2="66" y2="22" stroke="#f8fafc" strokeWidth="1.8" />
            <line x1="14" y1="29" x2="56" y2="29" stroke="#94a3b8" strokeWidth="1.2" />
        </svg>
    ),

    'is-luxury-concierge-dossier': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fafaf9" stroke="#e7e5e4" strokeWidth="1" />
            <line x1="6" y1="8" x2="74" y2="8" stroke="#b45309" strokeWidth="1.5" />
            <line x1="26" y1="15" x2="54" y2="15" stroke="#b45309" strokeWidth="1" />
            <line x1="16" y1="23" x2="64" y2="23" stroke="#1c1917" strokeWidth="1.8" />
            <line x1="20" y1="30" x2="60" y2="30" stroke="#78716c" strokeWidth="1.2" />
        </svg>
    ),

    'is-compact-pill-bullet': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="16" width="68" height="16" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="14" cy="24" r="2.5" fill="#0284c7" />
            <line x1="20" y1="24" x2="40" y2="24" stroke="#0284c7" strokeWidth="1.6" />
            <circle cx="44" cy="24" r="1" fill="#94a3b8" />
            <line x1="48" y1="24" x2="68" y2="24" stroke="#475569" strokeWidth="1.2" />
        </svg>
    ),

    // ── Highlight Text Thumbnails (10 Styles) ────────────────────────────────
    'ht-classic-neon-strip': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="15" width="68" height="18" rx="2" fill="#b8fa33" />
            <path d="M16 20l-2 4h3l-1 4 4-5h-3l1-3z" fill="#1e1535" />
            <line x1="24" y1="24" x2="68" y2="24" stroke="#1e1535" strokeWidth="2" />
        </svg>
    ),

    'ht-urgent-crimson-tape': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="15" width="68" height="18" rx="2" fill="#fef2f2" stroke="#fecaca" strokeWidth="0.8" />
            <rect x="6" y="15" width="3" height="18" fill="#dc2626" />
            <rect x="12" y="20" width="14" height="8" rx="1.5" fill="#fee2e2" />
            <line x1="30" y1="24" x2="68" y2="24" stroke="#991b1b" strokeWidth="1.8" />
        </svg>
    ),

    'ht-minimalist-hairline-capsule': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="10" y="17" width="60" height="14" rx="7" fill="#ffffff" stroke={col} strokeWidth="1.2" />
            <circle cx="17" cy="24" r="2" fill={col} />
            <line x1="23" y1="24" x2="62" y2="24" stroke="#0f172a" strokeWidth="1.8" />
        </svg>
    ),

    'ht-industrial-spec-ticker': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" />
            <rect x="6" y="15" width="3" height="18" fill="#f59e0b" />
            <line x1="13" y1="24" x2="28" y2="24" stroke="#f59e0b" strokeWidth="1.2" />
            <line x1="32" y1="24" x2="70" y2="24" stroke="#f8fafc" strokeWidth="1.8" />
        </svg>
    ),

    'ht-luxury-gold-crest': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fafaf9" stroke="#e7e5e4" strokeWidth="1" />
            <line x1="6" y1="15" x2="74" y2="15" stroke="#b45309" strokeWidth="1.2" />
            <line x1="12" y1="24" x2="26" y2="24" stroke="#b45309" strokeWidth="1" />
            <line x1="30" y1="24" x2="50" y2="24" stroke="#1c1917" strokeWidth="1.8" />
            <line x1="54" y1="24" x2="68" y2="24" stroke="#b45309" strokeWidth="1" />
        </svg>
    ),

    'ht-pill-badge-duo': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="16" width="68" height="16" rx="4" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="8" y="18" width="16" height="12" rx="3" fill={col} />
            <line x1="28" y1="24" x2="68" y2="24" stroke="#0f172a" strokeWidth="1.8" />
        </svg>
    ),

    'ht-stitched-coupon-voucher': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="15" width="68" height="18" rx="3" fill="#fffdfa" stroke="#0284c7" strokeWidth="1.2" strokeDasharray="2 1.5" />
            <circle cx="14" cy="24" r="2.5" fill="#0284c7" />
            <line x1="20" y1="24" x2="68" y2="24" stroke="#0f172a" strokeWidth="1.8" />
        </svg>
    ),

    'ht-verified-trust-emerald': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#bbf7d0" strokeWidth="1" />
            <rect x="6" y="15" width="68" height="18" rx="3" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="0.8" />
            <circle cx="14" cy="24" r="3.5" fill="#16a34a" />
            <line x1="22" y1="24" x2="68" y2="24" stroke="#166534" strokeWidth="1.8" />
        </svg>
    ),

    'ht-bold-dark-impact': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" />
            <line x1="12" y1="28" x2="16" y2="20" stroke="#b8fa33" strokeWidth="1.5" />
            <line x1="15" y1="28" x2="19" y2="20" stroke="#b8fa33" strokeWidth="1.5" />
            <line x1="24" y1="24" x2="56" y2="24" stroke="#ffffff" strokeWidth="2" />
            <line x1="61" y1="28" x2="65" y2="20" stroke="#b8fa33" strokeWidth="1.5" />
            <line x1="64" y1="28" x2="68" y2="20" stroke="#b8fa33" strokeWidth="1.5" />
        </svg>
    ),

    'ht-compact-bullet-pip': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="17" width="68" height="14" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="11" y="22" width="4" height="4" fill={col} />
            <line x1="19" y1="24" x2="68" y2="24" stroke="#0f172a" strokeWidth="1.8" />
        </svg>
    ),

    // ── Product Title Thumbnails (10 Styles) ─────────────────────────────────

    'pt-classic-baseline': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="18" x2="68" y2="18" stroke="#1e1535" strokeWidth="2.5" />
            <line x1="8" y1="24" x2="48" y2="24" stroke="#1e1535" strokeWidth="2.5" />
            <line x1="8" y1="32" x2="38" y2="32" stroke="#6b7280" strokeWidth="1.2" />
        </svg>
    ),

    'pt-pill-badge-header': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="10" width="22" height="6" rx="3" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="0.8" />
            <circle cx="12" cy="13" r="1.5" fill="#16a34a" />
            <line x1="8" y1="23" x2="72" y2="23" stroke="#0f172a" strokeWidth="2.2" />
            <line x1="8" y1="30" x2="52" y2="30" stroke="#0f172a" strokeWidth="2.2" />
        </svg>
    ),

    'pt-accent-bar-left': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="12" width="3" height="24" rx="1" fill={col} />
            <line x1="16" y1="18" x2="70" y2="18" stroke="#1e1535" strokeWidth="2.2" />
            <line x1="16" y1="25" x2="56" y2="25" stroke="#1e1535" strokeWidth="2.2" />
            <line x1="16" y1="32" x2="42" y2="32" stroke="#64748b" strokeWidth="1.2" />
        </svg>
    ),

    'pt-luxury-serif-centered': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fafaf9" stroke="#e7e5e4" strokeWidth="1" />
            <line x1="26" y1="12" x2="54" y2="12" stroke="#b45309" strokeWidth="1" />
            <line x1="14" y1="21" x2="66" y2="21" stroke="#1c1917" strokeWidth="2" />
            <line x1="20" y1="28" x2="60" y2="28" stroke="#1c1917" strokeWidth="2" />
            <line x1="24" y1="35" x2="56" y2="35" stroke="#78716c" strokeWidth="1" />
        </svg>
    ),

    'pt-modern-split-card': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="20" x2="48" y2="20" stroke="#0f172a" strokeWidth="2" />
            <line x1="8" y1="27" x2="40" y2="27" stroke="#0f172a" strokeWidth="2" />
            <rect x="56" y="15" width="16" height="18" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
        </svg>
    ),

    'pt-industrial-part-spec': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
            <line x1="8" y1="12" x2="36" y2="12" stroke="#0284c7" strokeWidth="1.2" />
            <line x1="8" y1="21" x2="72" y2="21" stroke="#0f172a" strokeWidth="2.2" />
            <rect x="8" y="28" width="16" height="6" rx="1.5" fill="#0f172a" />
            <line x1="28" y1="31" x2="54" y2="31" stroke="#64748b" strokeWidth="1" />
        </svg>
    ),

    'pt-underlined-accent-rule': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="17" x2="68" y2="17" stroke="#1e1535" strokeWidth="2.2" />
            <line x1="8" y1="24" x2="50" y2="24" stroke="#1e1535" strokeWidth="2.2" />
            <line x1="8" y1="29" x2="26" y2="29" stroke={col} strokeWidth="2" />
            <line x1="26" y1="29" x2="72" y2="29" stroke="#ede9fe" strokeWidth="1" />
        </svg>
    ),

    'pt-dark-obsidian-badge': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#090d16" />
            <rect x="8" y="11" width="16" height="5" rx="1.5" fill="#b8fa33" />
            <line x1="8" y1="23" x2="72" y2="23" stroke="#ffffff" strokeWidth="2.2" />
            <line x1="8" y1="30" x2="52" y2="30" stroke="#ffffff" strokeWidth="2.2" />
        </svg>
    ),

    'pt-verified-shield-banner': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="15" width="12" height="14" rx="2" fill="#eff6ff" stroke="#dbeafe" strokeWidth="0.8" />
            <line x1="24" y1="16" x2="48" y2="16" stroke="#2563eb" strokeWidth="1" />
            <line x1="24" y1="23" x2="72" y2="23" stroke="#0f172a" strokeWidth="2" />
            <line x1="24" y1="29" x2="58" y2="29" stroke="#0f172a" strokeWidth="2" />
        </svg>
    ),

    'pt-compact-inline-pip': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="18" x2="72" y2="18" stroke="#1e1535" strokeWidth="2" />
            <circle cx="10" cy="28" r="1.5" fill={col} />
            <line x1="16" y1="28" x2="54" y2="28" stroke="#64748b" strokeWidth="1.2" />
        </svg>
    ),

    // ── FAQ Block Thumbnails (10 Styles) ─────────────────────────────────────
    'faq-classic-stacked': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="8" width="68" height="9" rx="2" fill="#f8f7ff" stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="10" y1="12.5" x2="42" y2="12.5" stroke="#1e1535" strokeWidth="1.5" />
            <line x1="10" y1="21" x2="62" y2="21" stroke="#64748b" strokeWidth="1" />
            <rect x="6" y="27" width="68" height="9" rx="2" fill="#f8f7ff" stroke="#ede9fe" strokeWidth="0.8" />
            <line x1="10" y1="31.5" x2="46" y2="31.5" stroke="#1e1535" strokeWidth="1.5" />
            <line x1="10" y1="40" x2="56" y2="40" stroke="#64748b" strokeWidth="1" />
        </svg>
    ),

    'faq-boxed-cards-grid': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="7" width="68" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="9" y="10" width="5" height="5" rx="1" fill={col} />
            <line x1="17" y1="12.5" x2="48" y2="12.5" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="9" y1="18" x2="64" y2="18" stroke="#64748b" strokeWidth="1" />
            <rect x="6" y="26" width="68" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="9" y="29" width="5" height="5" rx="1" fill={col} />
            <line x1="17" y1="31.5" x2="52" y2="31.5" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="9" y1="37" x2="60" y2="37" stroke="#64748b" strokeWidth="1" />
        </svg>
    ),

    'faq-accent-rail-left': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="9" width="2.5" height="13" rx="1" fill={col} />
            <line x1="12" y1="12" x2="54" y2="12" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="12" y1="18" x2="66" y2="18" stroke="#64748b" strokeWidth="1" />
            <rect x="6" y="26" width="2.5" height="13" rx="1" fill={col} />
            <line x1="12" y1="29" x2="48" y2="29" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="12" y1="35" x2="62" y2="35" stroke="#64748b" strokeWidth="1" />
        </svg>
    ),

    'faq-numbered-circle-steps': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="12" cy="15" r="4.5" fill="#eff6ff" stroke="#2563eb" strokeWidth="0.8" />
            <line x1="20" y1="13" x2="58" y2="13" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="20" y1="18" x2="68" y2="18" stroke="#64748b" strokeWidth="1" />
            <circle cx="12" cy="33" r="4.5" fill="#eff6ff" stroke="#2563eb" strokeWidth="0.8" />
            <line x1="20" y1="31" x2="52" y2="31" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="20" y1="36" x2="64" y2="36" stroke="#64748b" strokeWidth="1" />
        </svg>
    ),

    'faq-split-speech-bubbles': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="8" width="56" height="7" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="10" y1="11.5" x2="46" y2="11.5" stroke={col} strokeWidth="1.2" />
            <line x1="16" y1="19" x2="66" y2="19" stroke="#059669" strokeWidth="1.2" />
            <rect x="6" y="27" width="56" height="7" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="10" y1="30.5" x2="42" y2="30.5" stroke={col} strokeWidth="1.2" />
            <line x1="16" y1="38" x2="62" y2="38" stroke="#059669" strokeWidth="1.2" />
        </svg>
    ),

    'faq-minimalist-hairline-rule': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="10" x2="52" y2="10" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="8" y1="16" x2="68" y2="16" stroke="#64748b" strokeWidth="1" />
            <line x1="8" y1="23" x2="72" y2="23" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="29" x2="48" y2="29" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="8" y1="35" x2="64" y2="35" stroke="#64748b" strokeWidth="1" />
        </svg>
    ),

    'faq-industrial-technical-ledger': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" />
            <rect x="6" y="8" width="68" height="14" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
            <rect x="6" y="8" width="2" height="14" fill="#f59e0b" />
            <line x1="12" y1="12" x2="28" y2="12" stroke="#f59e0b" strokeWidth="1" />
            <line x1="12" y1="17" x2="56" y2="17" stroke="#94a3b8" strokeWidth="1" />
            <rect x="6" y="26" width="68" height="14" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
            <rect x="6" y="26" width="2" height="14" fill="#f59e0b" />
            <line x1="12" y1="30" x2="32" y2="30" stroke="#f59e0b" strokeWidth="1" />
            <line x1="12" y1="35" x2="60" y2="35" stroke="#94a3b8" strokeWidth="1" />
        </svg>
    ),

    'faq-luxury-serif-editorial': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fafaf9" stroke="#e7e5e4" strokeWidth="1" />
            <line x1="6" y1="8" x2="74" y2="8" stroke="#b45309" strokeWidth="1.2" />
            <line x1="10" y1="15" x2="48" y2="15" stroke="#1c1917" strokeWidth="1.5" />
            <line x1="14" y1="21" x2="66" y2="21" stroke="#78716c" strokeWidth="1" />
            <line x1="10" y1="28" x2="70" y2="28" stroke="#e7e5e4" strokeWidth="0.8" />
            <line x1="10" y1="34" x2="44" y2="34" stroke="#1c1917" strokeWidth="1.5" />
            <line x1="14" y1="40" x2="62" y2="40" stroke="#78716c" strokeWidth="1" />
        </svg>
    ),

    'faq-verified-trust-shield': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="8" width="68" height="14" rx="2" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="0.8" />
            <circle cx="12" cy="15" r="3" fill="#16a34a" />
            <line x1="18" y1="13" x2="48" y2="13" stroke="#166534" strokeWidth="1.5" />
            <line x1="18" y1="18" x2="64" y2="18" stroke="#334155" strokeWidth="1" />
            <rect x="6" y="26" width="68" height="14" rx="2" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="0.8" />
            <circle cx="12" cy="33" r="3" fill="#16a34a" />
            <line x1="18" y1="31" x2="44" y2="31" stroke="#166534" strokeWidth="1.5" />
            <line x1="18" y1="36" x2="60" y2="36" stroke="#334155" strokeWidth="1" />
        </svg>
    ),

    'faq-compact-mobile-accordion': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="8" width="68" height="8" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="10" y1="12" x2="46" y2="12" stroke="#0f172a" strokeWidth="1.2" />
            <path d="M68 10.5l2 1.5-2 1.5" stroke={col} strokeWidth="1" fill="none" />
            <line x1="10" y1="20" x2="62" y2="20" stroke="#64748b" strokeWidth="1" />
            <rect x="6" y="26" width="68" height="8" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="10" y1="30" x2="42" y2="30" stroke="#0f172a" strokeWidth="1.2" />
            <path d="M68 28.5l2 1.5-2 1.5" stroke={col} strokeWidth="1" fill="none" />
            <line x1="10" y1="38" x2="58" y2="38" stroke="#64748b" strokeWidth="1" />
        </svg>
    ),
    'accent-ribbon': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill={col} />
            <circle cx="14" cy="24" r="3" fill="#ffffff" />
            <line x1="26" y1="16" x2="26" y2="32" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
            <circle cx="34" cy="24" r="3" fill="#ffffff" />
            <line x1="46" y1="16" x2="46" y2="32" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
            <circle cx="54" cy="24" r="3" fill="#ffffff" />
            <line x1="66" y1="16" x2="66" y2="32" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
            <circle cx="72" cy="24" r="3" fill="#ffffff" />
        </svg>
    ),

    'shield-crest': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1.2" />
            <path d="M14 16s4-2 4-5-4-1-4-1-4 0-4 1 0 5 4 5z" fill="#16a34a" />
            <path d="M34 16s4-2 4-5-4-1-4-1-4 0-4 1 0 5 4 5z" fill="#16a34a" />
            <path d="M54 16s4-2 4-5-4-1-4-1-4 0-4 1 0 5 4 5z" fill="#16a34a" />
            <path d="M68 16s4-2 4-5-4-1-4-1-4 0-4 1 0 5 4 5z" fill="#16a34a" />
        </svg>
    ),

    'hairline-card': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="5" y="12" width="15" height="24" rx="2" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" />
            <rect x="23" y="12" width="15" height="24" rx="2" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" />
            <rect x="41" y="12" width="15" height="24" rx="2" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" />
            <rect x="59" y="12" width="15" height="24" rx="2" fill="#ffffff" stroke="#0f172a" strokeWidth="0.8" />
        </svg>
    ),

    'dark-obsidian': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" />
            <circle cx="14" cy="20" r="3" fill="#b8fa33" />
            <line x1="26" y1="14" x2="26" y2="34" stroke="#27272a" strokeWidth="0.8" />
            <circle cx="34" cy="20" r="3" fill="#b8fa33" />
            <line x1="46" y1="14" x2="46" y2="34" stroke="#27272a" strokeWidth="0.8" />
            <circle cx="54" cy="20" r="3" fill="#b8fa33" />
            <line x1="66" y1="14" x2="66" y2="34" stroke="#27272a" strokeWidth="0.8" />
            <circle cx="72" cy="20" r="3" fill="#b8fa33" />
        </svg>
    ),
    // ── Why Buy From Us (10 Variants) ──────────────────────────────────────────
    'why-classic-centered': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="28" y1="8" x2="52" y2="8" stroke="#1e1535" strokeWidth="2" />
            <circle cx="16" cy="18" r="3" fill={col} />
            <line x1="10" y1="26" x2="22" y2="26" stroke="#1e1535" strokeWidth="1.5" />
            <line x1="12" y1="31" x2="20" y2="31" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="40" cy="18" r="3" fill={col} />
            <line x1="34" y1="26" x2="46" y2="26" stroke="#1e1535" strokeWidth="1.5" />
            <line x1="36" y1="31" x2="44" y2="31" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="64" cy="18" r="3" fill={col} />
            <line x1="58" y1="26" x2="70" y2="26" stroke="#1e1535" strokeWidth="1.5" />
            <line x1="60" y1="31" x2="68" y2="31" stroke="#94a3b8" strokeWidth="1" />
        </svg>
    ),

    'why-boxed-cards-grid': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="5" y="10" width="21" height="28" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="29" y="10" width="22" height="28" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="54" y="10" width="21" height="28" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="15.5" cy="18" r="3" fill={col} />
            <circle cx="40" cy="18" r="3" fill={col} />
            <circle cx="64.5" cy="18" r="3" fill={col} />
        </svg>
    ),

    'why-horizontal-feature-rows': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="8" width="68" height="9" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="11" cy="12.5" r="2" fill={col} />
            <line x1="17" y1="12.5" x2="68" y2="12.5" stroke="#1e1535" strokeWidth="1.2" />
            <rect x="6" y="20" width="68" height="9" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="11" cy="24.5" r="2" fill={col} />
            <line x1="17" y1="24.5" x2="68" y2="24.5" stroke="#1e1535" strokeWidth="1.2" />
            <rect x="6" y="32" width="68" height="9" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="11" cy="36.5" r="2" fill={col} />
            <line x1="17" y1="36.5" x2="68" y2="36.5" stroke="#1e1535" strokeWidth="1.2" />
        </svg>
    ),

    'why-split-hero-pledge': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="4" y="6" width="26" height="36" rx="3" fill={col} />
            <circle cx="17" cy="20" r="5" fill="#ffffff" />
            <line x1="36" y1="12" x2="74" y2="12" stroke="#1e1535" strokeWidth="1.5" />
            <line x1="36" y1="16" x2="68" y2="16" stroke="#94a3b8" strokeWidth="1" />
            <line x1="36" y1="24" x2="74" y2="24" stroke="#1e1535" strokeWidth="1.5" />
            <line x1="36" y1="28" x2="68" y2="28" stroke="#94a3b8" strokeWidth="1" />
            <line x1="36" y1="36" x2="74" y2="36" stroke="#1e1535" strokeWidth="1.5" />
        </svg>
    ),

    'why-numbered-editorial-ledger': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="6" y1="10" x2="74" y2="10" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="30" y1="16" x2="30" y2="40" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="54" y1="16" x2="54" y2="40" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="10" y1="18" x2="18" y2="18" stroke={col} strokeWidth="2" />
            <line x1="34" y1="18" x2="42" y2="18" stroke={col} strokeWidth="2" />
            <line x1="58" y1="18" x2="66" y2="18" stroke={col} strokeWidth="2" />
        </svg>
    ),

    'why-numbered-steps-timeline': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="16" y1="20" x2="64" y2="20" stroke="#bbf7d0" strokeWidth="2" />
            <circle cx="16" cy="20" r="4.5" fill="#16a34a" />
            <circle cx="40" cy="20" r="4.5" fill="#16a34a" />
            <circle cx="64" cy="20" r="4.5" fill="#16a34a" />
            <line x1="11" y1="29" x2="21" y2="29" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="35" y1="29" x2="45" y2="29" stroke="#1e1535" strokeWidth="1.2" />
            <line x1="59" y1="29" x2="69" y2="29" stroke="#1e1535" strokeWidth="1.2" />
        </svg>
    ),

    'why-compact-banner-strip': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#f8f7ff" stroke="#ede9fe" strokeWidth="1" />
            <circle cx="12" cy="24" r="3" fill={col} />
            <line x1="17" y1="24" x2="26" y2="24" stroke="#1e1535" strokeWidth="1.8" />
            <line x1="30" y1="18" x2="30" y2="30" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="36" cy="24" r="3" fill={col} />
            <line x1="41" y1="24" x2="50" y2="24" stroke="#1e1535" strokeWidth="1.8" />
            <line x1="54" y1="18" x2="54" y2="30" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="60" cy="24" r="3" fill={col} />
            <line x1="65" y1="24" x2="74" y2="24" stroke="#1e1535" strokeWidth="1.8" />
        </svg>
    ),

    'why-official-guarantee-shield': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1.2" />
            <circle cx="16" cy="22" r="5" fill="#ffffff" stroke="#16a34a" strokeWidth="1" />
            <circle cx="40" cy="22" r="5" fill="#ffffff" stroke="#16a34a" strokeWidth="1" />
            <circle cx="64" cy="22" r="5" fill="#ffffff" stroke="#16a34a" strokeWidth="1" />
        </svg>
    ),

    'why-dark-merchant-flagship': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" />
            <circle cx="16" cy="20" r="3" fill="#b8fa33" />
            <line x1="30" y1="14" x2="30" y2="34" stroke="#27272a" strokeWidth="0.8" />
            <circle cx="40" cy="20" r="3" fill="#b8fa33" />
            <line x1="54" y1="14" x2="54" y2="34" stroke="#27272a" strokeWidth="0.8" />
            <circle cx="64" cy="20" r="3" fill="#b8fa33" />
        </svg>
    ),

    'why-two-column-checklist': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="8" width="32" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="42" y="8" width="32" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="6" y="26" width="32" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="42" y="26" width="32" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
        </svg>
    ),

    // ── Urgency Stock Bar (10 Styles) ──────────────────────────────────────────
    'urgency-classic-pulse': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fee2e2" />
            <circle cx="16" cy="24" r="3.5" fill="#ef4444" />
            <line x1="24" y1="24" x2="68" y2="24" stroke="#991b1b" strokeWidth="2" />
        </svg>
    ),

    'urgency-inventory-progress-track': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#fed7aa" strokeWidth="1" />
            <rect x="6" y="10" width="18" height="5" rx="1.5" fill="#ffedd5" />
            <line x1="28" y1="12.5" x2="74" y2="12.5" stroke="#0f172a" strokeWidth="1.5" />
            <rect x="6" y="22" width="68" height="5" rx="2" fill="#f1f5f9" />
            <rect x="6" y="22" width="54" height="5" rx="2" fill="#ea580c" />
            <line x1="6" y1="34" x2="48" y2="34" stroke="#64748b" strokeWidth="1" />
            <line x1="56" y1="34" x2="74" y2="34" stroke="#ea580c" strokeWidth="1.5" />
        </svg>
    ),

    'urgency-high-velocity-ticker': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#f8f7ff" stroke="#ede9fe" strokeWidth="1" />
            <circle cx="14" cy="24" r="4.5" fill="#ede9fe" />
            <path d="M14 20l-1.5 3.5h3l-1.5 4.5 4-5h-3l1.5-3z" fill={col} />
            <line x1="22" y1="21" x2="52" y2="21" stroke="#1e1535" strokeWidth="1.8" />
            <line x1="22" y1="27" x2="46" y2="27" stroke="#6b7280" strokeWidth="1" />
            <rect x="56" y="18" width="18" height="12" rx="6" fill="#ffffff" stroke="#ddd6fe" strokeWidth="0.8" />
        </svg>
    ),

    'urgency-industrial-caution-stripe': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" stroke="#27272a" strokeWidth="1" />
            <rect x="0" y="0" width="4" height="48" fill="#f59e0b" />
            <rect x="8" y="10" width="26" height="5" rx="1.5" fill="#27272a" stroke="#f59e0b" strokeWidth="0.6" />
            <line x1="8" y1="22" x2="52" y2="22" stroke="#ffffff" strokeWidth="1.8" />
            <line x1="8" y1="28" x2="44" y2="28" stroke="#a1a1aa" strokeWidth="1" />
            <rect x="58" y="16" width="16" height="16" rx="2" fill="#f59e0b" />
        </svg>
    ),

    'urgency-warehouse-clearance-dossier': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fffdfa" stroke="#d6d3d1" strokeWidth="1.2" strokeDasharray="3 2" />
            <circle cx="15" cy="24" r="5" stroke="#b91c1c" strokeWidth="1" />
            <rect x="24" y="14" width="22" height="4" rx="1" fill="#fee2e2" />
            <line x1="24" y1="23" x2="54" y2="23" stroke="#1c1917" strokeWidth="1.8" />
            <line x1="24" y1="29" x2="48" y2="29" stroke="#78716c" strokeWidth="1" />
            <rect x="58" y="19" width="16" height="10" rx="2" fill="#fee2e2" stroke="#fecaca" strokeWidth="0.8" />
        </svg>
    ),

    'urgency-minimalist-hairline-banner': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" />
            <line x1="6" y1="14" x2="74" y2="14" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="6" y1="34" x2="74" y2="34" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="16" cy="24" r="2.5" fill="#0f172a" />
            <line x1="22" y1="24" x2="52" y2="24" stroke="#0f172a" strokeWidth="1.6" />
            <line x1="56" y1="20" x2="56" y2="28" stroke="#cbd5e1" strokeWidth="0.8" />
            <line x1="60" y1="24" x2="70" y2="24" stroke={col} strokeWidth="1.8" />
        </svg>
    ),

    'urgency-split-hero-countdown-dispatch': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="40" y1="8" x2="40" y2="40" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="14" cy="24" r="3.5" fill="#fee2e2" />
            <line x1="20" y1="21" x2="35" y2="21" stroke="#dc2626" strokeWidth="1.5" />
            <line x1="20" y1="27" x2="33" y2="27" stroke="#0f172a" strokeWidth="1.2" />
            <circle cx="48" cy="24" r="3.5" fill="#dcfce7" />
            <line x1="54" y1="21" x2="70" y2="21" stroke="#16a34a" strokeWidth="1.5" />
            <line x1="54" y1="27" x2="68" y2="27" stroke="#475569" strokeWidth="1" />
        </svg>
    ),

    'urgency-bold-dark-midnight-alert': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
            <rect x="8" y="12" width="24" height="4" rx="1.5" fill="#1e293b" />
            <line x1="8" y1="23" x2="52" y2="23" stroke="#ffffff" strokeWidth="1.8" />
            <line x1="8" y1="29" x2="42" y2="29" stroke="#94a3b8" strokeWidth="1" />
            <rect x="56" y="16" width="18" height="16" rx="3" fill="#b8fa33" />
        </svg>
    ),

    'urgency-collector-vault-numbered-batch': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fefce8" stroke="#fde68a" strokeWidth="1" />
            <circle cx="14" cy="24" r="4.5" fill="#ffffff" stroke="#fde68a" strokeWidth="0.8" />
            <line x1="22" y1="18" x2="48" y2="18" stroke="#b45309" strokeWidth="1" />
            <line x1="22" y1="25" x2="56" y2="25" stroke="#1e1535" strokeWidth="1.8" />
            <rect x="58" y="18" width="16" height="12" rx="2" fill="#ffffff" stroke="#fde68a" strokeWidth="0.8" />
        </svg>
    ),

    'urgency-compact-inline-capsule': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" />
            {/* Clean Rounded Capsule with Slate Border */}
            <rect x="5" y="16" width="70" height="16" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            {/* Left Red Badge */}
            <rect x="7" y="18" width="18" height="12" rx="6" fill="#dc2626" />
            <line x1="10" y1="24" x2="22" y2="24" stroke="#ffffff" strokeWidth="1.5" />
            {/* White Center Text Line */}
            <line x1="28" y1="24" x2="52" y2="24" stroke="#ffffff" strokeWidth="1.5" />
            {/* Cyan Right Status Pill */}
            <rect x="55" y="19" width="18" height="10" rx="5" fill="#1e293b" stroke="#38bdf8" strokeWidth="0.8" />
            <line x1="59" y1="24" x2="69" y2="24" stroke="#38bdf8" strokeWidth="1.2" />
        </svg>
    ),

    // ── Rectangle / Shape Container (10 Styles) ────────────────────────────────
    'rect-solid-fill': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="10" width="64" height="28" rx="4" fill="#f3eeff" stroke="#ede9fe" strokeWidth="1" />
        </svg>
    ),

    'rect-two-tone-split': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="14" width="46" height="20" rx="3" fill="#0f172a" />
            <rect x="56" y="14" width="16" height="20" rx="3" fill={col} />
        </svg>
    ),

    'rect-triple-accent-stripe': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="10" width="64" height="28" rx="4" fill="#ffffff" stroke="#ede9fe" strokeWidth="1" />
            <rect x="8" y="10" width="3" height="28" fill={col} />
            <rect x="12" y="10" width="3" height="28" fill="#38bdf8" />
            <rect x="16" y="10" width="3" height="28" fill="#b8fa33" />
        </svg>
    ),

    'rect-accent-left-rail': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="10" width="64" height="28" rx="4" fill="#ffffff" stroke="#ede9fe" strokeWidth="1" />
            <rect x="8" y="10" width="4" height="28" rx="1" fill={col} />
        </svg>
    ),

    'rect-gradient-horizon': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <defs>
                <linearGradient id="rectGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={col} />
                    <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
            </defs>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="14" width="64" height="20" rx="4" fill="url(#rectGrad)" />
        </svg>
    ),

    'rect-etched-luxury-hairline': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="8" y1="16" x2="72" y2="16" stroke="#0f172a" strokeWidth="1" />
            <line x1="8" y1="32" x2="72" y2="32" stroke="#0f172a" strokeWidth="1" />
        </svg>
    ),

    'rect-industrial-hazard': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" stroke="#27272a" strokeWidth="1" />
            <rect x="6" y="8" width="68" height="4" fill="#f59e0b" />
        </svg>
    ),

    'rect-dashed-coupon-frame': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="10" width="64" height="28" rx="4" fill="#fffdfa" stroke="#d6d3d1" strokeWidth="1.2" strokeDasharray="3 2" />
        </svg>
    ),

    'rect-pill-capsule-badge': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="16" width="64" height="16" rx="8" fill="#f8f7ff" stroke="#ede9fe" strokeWidth="1" />
        </svg>
    ),

    'rect-warning-amber-notice': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="10" width="68" height="28" rx="4" fill="#fffbeb" stroke="#fcd34d" strokeWidth="1" />
            <rect x="6" y="10" width="4" height="28" fill="#f59e0b" />
        </svg>
    ),

    'rect-elevated-shadow-plinth': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="10" width="64" height="28" rx="5" fill="#000000" fillOpacity="0.08" />
            <rect x="8" y="9" width="64" height="28" rx="5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="16" y1="23" x2="64" y2="23" stroke="#0f172a" strokeWidth="1.5" />
        </svg>
    ),

    'rect-chamfer-tactical-cut': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <path d="M14 12 L72 12 L72 32 L66 38 L8 38 L8 18 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <line x1="8" y1="18" x2="8" y2="38" stroke="#38bdf8" strokeWidth="2" />
        </svg>
    ),

    'rect-perforated-ticket-stub': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="10" width="64" height="28" rx="4" fill="#fefce8" stroke="#fef08a" strokeWidth="1" />
            <line x1="20" y1="10" x2="20" y2="38" stroke="#ca8a04" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="60" y1="10" x2="60" y2="38" stroke="#ca8a04" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
    ),

    'rect-cyber-neon-outline': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
            <rect x="8" y="10" width="64" height="28" rx="3" fill="#090d16" stroke="#b8fa33" strokeWidth="1.5" />
            <line x1="16" y1="24" x2="64" y2="24" stroke="#ffffff" strokeWidth="1.5" />
        </svg>
    ),

    'rect-regal-notary-certificate': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fffdfa" stroke="#d6d3d1" strokeWidth="1" />
            <rect x="10" y="8" width="60" height="32" rx="2" stroke="#d6d3d1" strokeWidth="1" />
            <circle cx="40" cy="24" r="2.5" fill="#b45309" />
        </svg>
    ),

    'rect-checkered-racing-flag': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" stroke="#27272a" strokeWidth="1" />
            <rect x="8" y="10" width="8" height="28" fill="#ffffff" />
            <rect x="8" y="10" width="4" height="7" fill="#000000" />
            <rect x="12" y="17" width="4" height="7" fill="#000000" />
            <rect x="8" y="24" width="4" height="7" fill="#000000" />
            <rect x="12" y="31" width="4" height="7" fill="#000000" />
        </svg>
    ),

    'rect-bracket-architect': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <path d="M12 12 L8 12 L8 36 L12 36" stroke="#94a3b8" strokeWidth="2" fill="none" />
            <path d="M68 12 L72 12 L72 36 L68 36" stroke="#94a3b8" strokeWidth="2" fill="none" />
            <line x1="18" y1="24" x2="62" y2="24" stroke="#0f172a" strokeWidth="1.5" />
        </svg>
    ),

    'rect-stacked-paper-memo': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="11" y="13" width="60" height="26" rx="3" fill="#1e293b" />
            <rect x="8" y="10" width="60" height="26" rx="3" fill="#ffffff" stroke="#1e293b" strokeWidth="1" />
            <line x1="16" y1="23" x2="56" y2="23" stroke="#1e293b" strokeWidth="1.5" />
        </svg>
    ),

    'rect-dot-matrix-receipt': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="10" width="64" height="28" rx="3" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 3" />
            <line x1="16" y1="24" x2="64" y2="24" stroke="#64748b" strokeWidth="1.2" />
        </svg>
    ),

    'rect-caution-diagonal-hazard': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" stroke="#27272a" strokeWidth="1" />
            <rect x="6" y="8" width="68" height="6" fill="#f59e0b" />
            <line x1="12" y1="8" x2="16" y2="14" stroke="#18181b" strokeWidth="2" />
            <line x1="22" y1="8" x2="26" y2="14" stroke="#18181b" strokeWidth="2" />
            <line x1="32" y1="8" x2="36" y2="14" stroke="#18181b" strokeWidth="2" />
            <line x1="42" y1="8" x2="46" y2="14" stroke="#18181b" strokeWidth="2" />
            <line x1="52" y1="8" x2="56" y2="14" stroke="#18181b" strokeWidth="2" />
            <line x1="62" y1="8" x2="66" y2="14" stroke="#18181b" strokeWidth="2" />
        </svg>
    ),

    // ── Trust & Satisfaction Badge (10 Styles) ─────────────────────────────────
    'trust-banner-soft': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="10" width="68" height="28" rx="4" fill="#f3eeff" />
            <circle cx="20" cy="24" r="4" stroke="#7530fb" strokeWidth="1.2" fill="none" />
            <line x1="28" y1="24" x2="66" y2="24" stroke="#7530fb" strokeWidth="1.6" />
        </svg>
    ),

    'trust-seal-ribbon-badge': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="6" y="8" width="4" height="32" fill={col} />
            <circle cx="20" cy="24" r="7" fill="#f8f7ff" stroke={col} strokeWidth="1" />
            <line x1="32" y1="18" x2="48" y2="18" stroke={col} strokeWidth="1.2" />
            <line x1="32" y1="24" x2="70" y2="24" stroke="#0f172a" strokeWidth="1.6" />
            <line x1="32" y1="30" x2="62" y2="30" stroke="#64748b" strokeWidth="1" />
        </svg>
    ),

    'trust-split-counter-bar': (col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <rect x="6" y="8" width="22" height="32" fill={col} />
            <line x1="10" y1="21" x2="24" y2="21" stroke="#ffffff" strokeWidth="1.8" />
            <line x1="12" y1="27" x2="22" y2="27" stroke="#ffffff" strokeWidth="1" />
            <line x1="34" y1="21" x2="72" y2="21" stroke="#ffffff" strokeWidth="1.6" />
            <line x1="34" y1="28" x2="66" y2="28" stroke="#94a3b8" strokeWidth="1" />
        </svg>
    ),

    'trust-gold-gilded-crest': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fffdfa" stroke="#fde68a" strokeWidth="1" />
            <rect x="10" y="8" width="60" height="32" stroke="#ca8a04" strokeWidth="0.8" />
            <circle cx="40" cy="17" r="1.5" fill="#b45309" />
            <line x1="20" y1="24" x2="60" y2="24" stroke="#1c1917" strokeWidth="1.5" />
            <line x1="24" y1="30" x2="56" y2="30" stroke="#78716c" strokeWidth="1" />
        </svg>
    ),

    'trust-cyber-shield-tech': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
            <rect x="6" y="8" width="3" height="32" fill="#b8fa33" />
            <circle cx="18" cy="24" r="4.5" stroke="#b8fa33" strokeWidth="1" />
            <line x1="28" y1="22" x2="54" y2="22" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="28" y1="28" x2="48" y2="28" stroke="#94a3b8" strokeWidth="1" />
            <rect x="58" y="20" width="16" height="8" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
        </svg>
    ),

    'trust-clean-hairline-capsule': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="6" y1="14" x2="74" y2="14" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="6" y1="34" x2="74" y2="34" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="20" cy="24" r="3.5" fill="#f1f5f9" />
            <path d="M18.5 24l1 1 2-2" stroke="#0f172a" strokeWidth="1" fill="none" />
            <line x1="28" y1="24" x2="68" y2="24" stroke="#0f172a" strokeWidth="1.5" />
        </svg>
    ),

    'trust-money-back-stamp': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#fff5f5" stroke="#fca5a5" strokeWidth="1" strokeDasharray="3 2" />
            <rect x="10" y="14" width="18" height="20" rx="3" fill="#ffffff" stroke="#dc2626" strokeWidth="1.2" />
            <line x1="13" y1="22" x2="25" y2="22" stroke="#dc2626" strokeWidth="1.5" />
            <line x1="34" y1="21" x2="70" y2="21" stroke="#991b1b" strokeWidth="1.6" />
            <line x1="34" y1="28" x2="64" y2="28" stroke="#7f1d1d" strokeWidth="1" />
        </svg>
    ),

    'trust-handshake-pledge': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#faf5ff" stroke="#e9d5ff" strokeWidth="1" />
            <circle cx="28" cy="17" r="1.5" fill="#eab308" />
            <circle cx="34" cy="17" r="1.5" fill="#eab308" />
            <circle cx="40" cy="17" r="1.5" fill="#eab308" />
            <circle cx="46" cy="17" r="1.5" fill="#eab308" />
            <circle cx="52" cy="17" r="1.5" fill="#eab308" />
            <line x1="18" y1="25" x2="62" y2="25" stroke="#581c87" strokeWidth="1.6" />
            <line x1="24" y1="31" x2="56" y2="31" stroke="#7e22ce" strokeWidth="1" />
        </svg>
    ),

    'trust-industrial-motors-spec': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#18181b" stroke="#27272a" strokeWidth="1" />
            <rect x="6" y="8" width="68" height="3" fill="#f59e0b" />
            <circle cx="16" cy="26" r="4.5" stroke="#f59e0b" strokeWidth="1" />
            <line x1="26" y1="22" x2="48" y2="22" stroke="#f59e0b" strokeWidth="1.2" />
            <line x1="26" y1="28" x2="70" y2="28" stroke="#ffffff" strokeWidth="1.6" />
        </svg>
    ),

    'trust-verified-buyer-pill': (_col, _light) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="8" y="16" width="64" height="16" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="14" y="21" width="5" height="6" rx="1" stroke="#0284c7" strokeWidth="1" />
            <line x1="24" y1="24" x2="50" y2="24" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="56" cy="24" r="2" fill="#16a34a" />
        </svg>
    ),

    // ── Features Bar (10 Professional Layout Styles) ────────────────────────
    'feat-simple-centered': (col: string, light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            {/* Col 1 */}
            <circle cx="16" cy="16" r="3.5" fill={col || '#7530fb'} />
            <line x1="9" y1="26" x2="23" y2="26" stroke="#1e1535" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="11" y1="31" x2="21" y2="31" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
            {/* Col 2 */}
            <circle cx="40" cy="16" r="3.5" fill={col || '#7530fb'} />
            <line x1="33" y1="26" x2="47" y2="26" stroke="#1e1535" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="35" y1="31" x2="45" y2="31" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
            {/* Col 3 */}
            <circle cx="64" cy="16" r="3.5" fill={col || '#7530fb'} />
            <line x1="57" y1="26" x2="71" y2="26" stroke="#1e1535" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="59" y1="31" x2="69" y2="31" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
        </svg>
    ),
    'feat-divided-columns': (col: string, light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="27" y1="6" x2="27" y2="42" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="53" y1="6" x2="53" y2="42" stroke="#e2e8f0" strokeWidth="1" />
            {/* 3 items */}
            <circle cx="14" cy="18" r="3" fill={col || '#7530fb'} />
            <line x1="7" y1="28" x2="21" y2="28" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="40" cy="18" r="3" fill={col || '#7530fb'} />
            <line x1="33" y1="28" x2="47" y2="28" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="66" cy="18" r="3" fill={col || '#7530fb'} />
            <line x1="59" y1="28" x2="73" y2="28" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    'feat-badge-cards': (col: string, light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" fill="#ffffff" />
            {/* Card 1 */}
            <rect x="4" y="6" width="22" height="36" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="15" cy="16" r="3" fill={col || '#7530fb'} />
            <line x1="8" y1="26" x2="22" y2="26" stroke="#1e1535" strokeWidth="1.4" strokeLinecap="round" />
            {/* Card 2 */}
            <rect x="29" y="6" width="22" height="36" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="40" cy="16" r="3" fill={col || '#7530fb'} />
            <line x1="33" y1="26" x2="47" y2="26" stroke="#1e1535" strokeWidth="1.4" strokeLinecap="round" />
            {/* Card 3 */}
            <rect x="54" y="6" width="22" height="36" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
            <circle cx="65" cy="16" r="3" fill={col || '#7530fb'} />
            <line x1="58" y1="26" x2="72" y2="26" stroke="#1e1535" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
    ),
    'feat-horizontal-media': (col: string, light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            {/* Item 1 */}
            <circle cx="10" cy="24" r="3.5" fill={col || '#7530fb'} />
            <line x1="16" y1="21" x2="32" y2="21" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="16" y1="27" x2="28" y2="27" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
            {/* Item 2 */}
            <circle cx="48" cy="24" r="3.5" fill={col || '#7530fb'} />
            <line x1="54" y1="21" x2="70" y2="21" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="54" y1="27" x2="66" y2="27" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
        </svg>
    ),
    'feat-circular-plinths': (col: string, light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            {/* Col 1 */}
            <circle cx="16" cy="17" r="7" fill={light || '#f3eeff'} stroke="#ede9fe" strokeWidth="0.8" />
            <circle cx="16" cy="17" r="2.5" fill={col || '#7530fb'} />
            <line x1="8" y1="31" x2="24" y2="31" stroke="#1e1535" strokeWidth="1.4" strokeLinecap="round" />
            {/* Col 2 */}
            <circle cx="40" cy="17" r="7" fill={light || '#f3eeff'} stroke="#ede9fe" strokeWidth="0.8" />
            <circle cx="40" cy="17" r="2.5" fill={col || '#7530fb'} />
            <line x1="32" y1="31" x2="48" y2="31" stroke="#1e1535" strokeWidth="1.4" strokeLinecap="round" />
            {/* Col 3 */}
            <circle cx="64" cy="17" r="7" fill={light || '#f3eeff'} stroke="#ede9fe" strokeWidth="0.8" />
            <circle cx="64" cy="17" r="2.5" fill={col || '#7530fb'} />
            <line x1="56" y1="31" x2="72" y2="31" stroke="#1e1535" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
    ),
    'feat-accent-top-bars': (col: string, light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" fill="#ffffff" />
            {/* Box 1 */}
            <rect x="4" y="8" width="22" height="32" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="4" y="8" width="22" height="2" fill={col || '#7530fb'} />
            <circle cx="15" cy="19" r="2.5" fill={col || '#7530fb'} />
            <line x1="8" y1="28" x2="22" y2="28" stroke="#0f172a" strokeWidth="1.4" strokeLinecap="round" />
            {/* Box 2 */}
            <rect x="29" y="8" width="22" height="32" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="29" y="8" width="22" height="2" fill={col || '#7530fb'} />
            <circle cx="40" cy="19" r="2.5" fill={col || '#7530fb'} />
            <line x1="33" y1="28" x2="47" y2="28" stroke="#0f172a" strokeWidth="1.4" strokeLinecap="round" />
            {/* Box 3 */}
            <rect x="54" y="8" width="22" height="32" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="54" y="8" width="22" height="2" fill={col || '#7530fb'} />
            <circle cx="65" cy="19" r="2.5" fill={col || '#7530fb'} />
            <line x1="58" y1="28" x2="72" y2="28" stroke="#0f172a" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
    ),
    'feat-dark-executive': (col: string, light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" rx="2" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
            <line x1="27" y1="6" x2="27" y2="42" stroke="#1e293b" strokeWidth="1" />
            <line x1="53" y1="6" x2="53" y2="42" stroke="#1e293b" strokeWidth="1" />
            {/* 3 items */}
            <circle cx="14" cy="17" r="3" fill="#b8fa33" />
            <line x1="7" y1="27" x2="21" y2="27" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="40" cy="17" r="3" fill="#b8fa33" />
            <line x1="33" y1="27" x2="47" y2="27" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="66" cy="17" r="3" fill="#b8fa33" />
            <line x1="59" y1="27" x2="73" y2="27" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
    ),
    'feat-stitched-coupon': (col: string, light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" fill="#ffffff" />
            {/* Card 1 */}
            <rect x="4" y="6" width="22" height="36" rx="2" fill="#fffdfa" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 1.5" />
            <circle cx="15" cy="17" r="3" fill={col || '#7530fb'} />
            <line x1="8" y1="27" x2="22" y2="27" stroke="#1e1535" strokeWidth="1.4" strokeLinecap="round" />
            {/* Card 2 */}
            <rect x="29" y="6" width="22" height="36" rx="2" fill="#fffdfa" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 1.5" />
            <circle cx="40" cy="17" r="3" fill={col || '#7530fb'} />
            <line x1="33" y1="27" x2="47" y2="27" stroke="#1e1535" strokeWidth="1.4" strokeLinecap="round" />
            {/* Card 3 */}
            <rect x="54" y="6" width="22" height="36" rx="2" fill="#fffdfa" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 1.5" />
            <circle cx="65" cy="17" r="3" fill={col || '#7530fb'} />
            <line x1="58" y1="27" x2="72" y2="27" stroke="#1e1535" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
    ),
    'feat-minimal-hairline': (col: string, light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" fill="#ffffff" />
            <line x1="0" y1="6" x2="80" y2="6" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="0" y1="42" x2="80" y2="42" stroke="#e2e8f0" strokeWidth="1" />
            {/* 3 items */}
            <circle cx="14" cy="20" r="2.5" fill="#0f172a" />
            <line x1="7" y1="29" x2="21" y2="29" stroke="#0f172a" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="40" cy="20" r="2.5" fill="#0f172a" />
            <line x1="33" y1="29" x2="47" y2="29" stroke="#0f172a" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="66" cy="20" r="2.5" fill="#0f172a" />
            <line x1="59" y1="29" x2="73" y2="29" stroke="#0f172a" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
    ),
    'feat-numbered-steps': (col: string, light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect width="80" height="48" fill="#ffffff" />
            {/* Card 1 */}
            <rect x="4" y="6" width="22" height="36" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <text x="8" y="16" fill="#64748b" fontSize="6" fontFamily="monospace" fontWeight="bold">01</text>
            <circle cx="20" cy="14" r="2" fill={col || '#7530fb'} />
            <line x1="8" y1="26" x2="22" y2="26" stroke="#0f172a" strokeWidth="1.4" strokeLinecap="round" />
            {/* Card 2 */}
            <rect x="29" y="6" width="22" height="36" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <text x="33" y="16" fill="#64748b" fontSize="6" fontFamily="monospace" fontWeight="bold">02</text>
            <circle cx="45" cy="14" r="2" fill={col || '#7530fb'} />
            <line x1="33" y1="26" x2="47" y2="26" stroke="#0f172a" strokeWidth="1.4" strokeLinecap="round" />
            {/* Card 3 */}
            <rect x="54" y="6" width="22" height="36" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <text x="58" y="16" fill="#64748b" fontSize="6" fontFamily="monospace" fontWeight="bold">03</text>
            <circle cx="70" cy="14" r="2" fill={col || '#7530fb'} />
            <line x1="58" y1="26" x2="72" y2="26" stroke="#0f172a" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
    ),

    // ── Testimonials & Verified Reviews (10 Variants) ──────────────────────────
    'test-classic-grid': (col: string, light: string) => (
        <svg viewBox="0 0 80 48" fill="none" className="w-full h-9">
            <rect x="2" y="4" width="76" height="40" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.2" />
            <rect x="6" y="10" width="20" height="28" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="30" y="10" width="20" height="28" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="54" y="10" width="20" height="28" rx="2" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="10" cy="15" r="1.5" fill="#f59e0b" />
            <circle cx="34" cy="15" r="1.5" fill="#f59e0b" />
            <circle cx="58" cy="15" r="1.5" fill="#f59e0b" />
        </svg>
    ),

    'test-verified-badge-row': (col: string, light: string) => (
        <svg viewBox="0 0 80 48" fill="none" className="w-full h-9">
            <rect x="2" y="4" width="76" height="40" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
            <rect x="2" y="4" width="76" height="11" fill="#f1f5f9" />
            <circle cx="8" cy="9.5" r="2.5" fill="#16a34a" />
            <rect x="14" y="8" width="30" height="3" rx="1.5" fill="#0f172a" />
            <rect x="6" y="19" width="20" height="20" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="30" y="19" width="20" height="20" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <rect x="54" y="19" width="20" height="20" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
        </svg>
    ),

    'test-featured-spotlight-split': (col: string, light: string) => (
        <svg viewBox="0 0 80 48" fill="none" className="w-full h-9">
            <rect x="2" y="4" width="76" height="40" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.2" />
            <rect x="6" y="9" width="40" height="30" rx="3" fill={light} stroke={col} strokeWidth="1.2" />
            <rect x="50" y="9" width="24" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="50" y="26" width="24" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="12" cy="15" r="2" fill="#f59e0b" />
        </svg>
    ),

    'test-speech-bubble-cards': (col: string, light: string) => (
        <svg viewBox="0 0 80 48" fill="none" className="w-full h-9">
            <rect x="2" y="4" width="76" height="40" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.2" />
            <rect x="6" y="8" width="20" height="18" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <polygon points="12,26 16,26 12,30" fill="#cbd5e1" />
            <circle cx="16" cy="35" r="3" fill={col} />
            <rect x="30" y="8" width="20" height="18" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <polygon points="36,26 40,26 36,30" fill="#cbd5e1" />
            <circle cx="40" cy="35" r="3" fill="#0284c7" />
            <rect x="54" y="8" width="20" height="18" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <polygon points="60,26 64,26 60,30" fill="#cbd5e1" />
            <circle cx="64" cy="35" r="3" fill="#059669" />
        </svg>
    ),

    'test-minimal-swiss-ledger': (col: string, light: string) => (
        <svg viewBox="0 0 80 48" fill="none" className="w-full h-9">
            <rect x="2" y="4" width="76" height="40" fill="#ffffff" />
            <line x1="2" y1="5" x2="78" y2="5" stroke="#0f172a" strokeWidth="2" />
            <line x1="2" y1="43" x2="78" y2="43" stroke="#0f172a" strokeWidth="2" />
            <line x1="6" y1="17" x2="74" y2="17" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="6" y1="30" x2="74" y2="30" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="10" cy="11" r="1.5" fill="#f59e0b" />
            <circle cx="10" cy="23.5" r="1.5" fill="#f59e0b" />
            <circle cx="10" cy="36.5" r="1.5" fill="#f59e0b" />
        </svg>
    ),

    'test-dark-obsidian-matrix': (col: string, light: string) => (
        <svg viewBox="0 0 80 48" fill="none" className="w-full h-9">
            <rect x="2" y="4" width="76" height="40" rx="4" fill="#0b0f19" stroke="#1e293b" strokeWidth="1.2" />
            <rect x="6" y="10" width="20" height="28" rx="2" fill="#131c2e" stroke="#334155" strokeWidth="0.8" />
            <rect x="30" y="10" width="20" height="28" rx="2" fill="#131c2e" stroke="#334155" strokeWidth="0.8" />
            <rect x="54" y="10" width="20" height="28" rx="2" fill="#131c2e" stroke="#334155" strokeWidth="0.8" />
            <circle cx="10" cy="15" r="1.5" fill="#fbbf24" />
            <circle cx="34" cy="15" r="1.5" fill="#fbbf24" />
            <circle cx="58" cy="15" r="1.5" fill="#fbbf24" />
        </svg>
    ),

    'test-timeline-delivery-audit': (col: string, light: string) => (
        <svg viewBox="0 0 80 48" fill="none" className="w-full h-9">
            <rect x="2" y="4" width="76" height="40" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.2" />
            <rect x="6" y="10" width="20" height="28" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="7.5" y="12" width="17" height="5" rx="1.5" fill="#e0f2fe" />
            <rect x="30" y="10" width="20" height="28" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="31.5" y="12" width="17" height="5" rx="1.5" fill="#e0f2fe" />
            <rect x="54" y="10" width="20" height="28" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="55.5" y="12" width="17" height="5" rx="1.5" fill="#e0f2fe" />
        </svg>
    ),

    'test-quote-pillar-columns': (col: string, light: string) => (
        <svg viewBox="0 0 80 48" fill="none" className="w-full h-9">
            <rect x="2" y="4" width="76" height="40" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.2" />
            <rect x="6" y="10" width="20" height="28" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="6" y1="10" x2="6" y2="38" stroke={col} strokeWidth="2.5" />
            <rect x="30" y="10" width="20" height="28" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="30" y1="10" x2="30" y2="38" stroke={col} strokeWidth="2.5" />
            <rect x="54" y="10" width="20" height="28" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <line x1="54" y1="10" x2="54" y2="38" stroke={col} strokeWidth="2.5" />
        </svg>
    ),

    'test-certified-seal-stamps': (col: string, light: string) => (
        <svg viewBox="0 0 80 48" fill="none" className="w-full h-9">
            <rect x="2" y="4" width="76" height="40" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
            <rect x="6" y="10" width="20" height="28" rx="2" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="2 1" />
            <circle cx="16" cy="17" r="3.5" fill="#fef3c7" stroke="#b45309" strokeWidth="0.8" />
            <rect x="30" y="10" width="20" height="28" rx="2" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="2 1" />
            <circle cx="40" cy="17" r="3.5" fill="#fef3c7" stroke="#b45309" strokeWidth="0.8" />
            <rect x="54" y="10" width="20" height="28" rx="2" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="2 1" />
            <circle cx="64" cy="17" r="3.5" fill="#fef3c7" stroke="#b45309" strokeWidth="0.8" />
        </svg>
    ),

    'test-compact-horizontal-ticker': (col: string, light: string) => (
        <svg viewBox="0 0 80 48" fill="none" className="w-full h-9">
            <rect x="2" y="4" width="76" height="40" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.2" />
            <rect x="6" y="9" width="68" height="8" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="6" y="20" width="68" height="8" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <rect x="6" y="31" width="68" height="8" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
            <circle cx="11" cy="13" r="1.5" fill="#f59e0b" />
            <circle cx="11" cy="24" r="1.5" fill="#f59e0b" />
            <circle cx="11" cy="35" r="1.5" fill="#f59e0b" />
        </svg>
    ),

    // ── Info Box (6 Professional Retail Layout Styles) ────────────────────────
    'info-classic-banner': (_col: string, _light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect x="2" y="6" width="76" height="36" rx="4" fill="#ffffff" stroke="#ede9fe" strokeWidth="1.2" />
            <circle cx="13" cy="24" r="6" fill="#eff6ff" />
            <circle cx="13" cy="21.5" r="1.2" fill="#3b82f6" />
            <rect x="12" y="23.5" width="2" height="4.5" rx="1" fill="#3b82f6" />
            <rect x="24" y="16" width="34" height="4" rx="1.5" fill="#1e40af" />
            <rect x="24" y="23" width="48" height="2.5" rx="1" fill="#93c5fd" />
            <rect x="24" y="28" width="36" height="2.5" rx="1" fill="#93c5fd" />
        </svg>
    ),

    'info-accent-pillar': (col: string, _light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect x="2" y="6" width="76" height="36" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="2" y="6" width="3.5" height="36" rx="1" fill={col || '#2563eb'} />
            <rect x="10" y="12" width="20" height="4.5" rx="2" fill="#dbeafe" />
            <rect x="33" y="12.5" width="34" height="3.5" rx="1" fill="#0f172a" />
            <rect x="10" y="21" width="60" height="2.5" rx="1" fill="#64748b" />
            <rect x="10" y="26" width="46" height="2.5" rx="1" fill="#64748b" />
        </svg>
    ),

    'info-floating-capsule': (_col: string, _light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect x="2" y="6" width="76" height="36" rx="6" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1.2" />
            <circle cx="14" cy="24" r="6" fill="#dcfce7" stroke="#86efac" strokeWidth="0.8" />
            <path d="M11 24l2 2 4-4" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" />
            <rect x="25" y="16" width="36" height="4" rx="1.5" fill="#14532d" />
            <rect x="25" y="23" width="48" height="2.5" rx="1" fill="#4ade80" />
            <rect x="25" y="28" width="34" height="2.5" rx="1" fill="#4ade80" />
        </svg>
    ),

    'info-split-bullet-deck': (_col: string, _light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect x="2" y="6" width="76" height="36" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="2" y="6" width="76" height="9" rx="1" fill="#1e293b" />
            <rect x="7" y="9" width="28" height="2.5" rx="1" fill="#f8fafc" />
            <rect x="6" y="19" width="68" height="2.5" rx="1" fill="#475569" />
            <line x1="6" y1="26" x2="74" y2="26" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="2 1" />
            <circle cx="10" cy="33" r="1.5" fill="#10b981" />
            <rect x="13" y="32" width="12" height="2" rx="0.8" fill="#0f172a" />
            <circle cx="34" cy="33" r="1.5" fill="#10b981" />
            <rect x="37" y="32" width="12" height="2" rx="0.8" fill="#0f172a" />
            <circle cx="58" cy="33" r="1.5" fill="#10b981" />
            <rect x="61" y="32" width="12" height="2" rx="0.8" fill="#0f172a" />
        </svg>
    ),

    'info-minimal-editorial': (_col: string, _light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect x="2" y="6" width="76" height="36" fill="#ffffff" />
            <line x1="2" y1="6" x2="78" y2="6" stroke="#0f172a" strokeWidth="2" />
            <line x1="2" y1="42" x2="78" y2="42" stroke="#0f172a" strokeWidth="2" />
            <rect x="6" y="14" width="16" height="3" rx="1" fill="#64748b" />
            <rect x="6" y="20" width="14" height="3" rx="1" fill="#0f172a" />
            <line x1="26" y1="12" x2="26" y2="36" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="31" y="16" width="42" height="2.5" rx="1" fill="#334155" />
            <rect x="31" y="22" width="34" height="2.5" rx="1" fill="#334155" />
            <rect x="31" y="28" width="38" height="2" rx="1" fill="#059669" />
        </svg>
    ),

    'info-dark-obsidian-alert': (_col: string, _light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect x="2" y="6" width="76" height="36" rx="4" fill="#0f172a" />
            <circle cx="12" cy="24" r="5" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
            <circle cx="12" cy="21.5" r="1" fill="#38bdf8" />
            <rect x="11.2" y="23" width="1.6" height="3.5" rx="0.8" fill="#38bdf8" />
            <rect x="22" y="14" width="22" height="3.5" rx="1" fill="#082f49" stroke="#0369a1" strokeWidth="0.5" />
            <rect x="47" y="14" width="26" height="3.5" rx="1" fill="#ffffff" />
            <rect x="22" y="23" width="50" height="2.5" rx="1" fill="#64748b" />
            <rect x="22" y="29" width="38" height="2.5" rx="1" fill="#64748b" />
        </svg>
    ),

    // ── Shipping Info Bar (10 Professional Retail Layout Styles) ──────────────
    'ship-classic-card': (_col: string, _light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect x="2" y="6" width="76" height="36" rx="4" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" />
            <rect x="5" y="10" width="3" height="28" rx="1.5" fill="#16a34a" />
            <rect x="12" y="14" width="18" height="20" rx="3" fill="#f0fdf4" />
            <rect x="34" y="15" width="38" height="4" rx="1" fill="#1e1535" />
            <rect x="34" y="23" width="30" height="2.5" rx="1" fill="#64748b" />
        </svg>
    ),

    'ship-three-pillar-strip': (_col: string, _light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect x="2" y="6" width="76" height="36" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="28" y1="8" x2="28" y2="40" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="54" y1="8" x2="54" y2="40" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="15" cy="18" r="3" fill="#d97706" />
            <rect x="7" y="26" width="16" height="3" rx="1" fill="#0f172a" />
            <circle cx="41" cy="18" r="3" fill="#16a34a" />
            <rect x="33" y="26" width="16" height="3" rx="1" fill="#0f172a" />
            <circle cx="67" cy="18" r="3" fill="#2563eb" />
            <rect x="59" y="26" width="16" height="3" rx="1" fill="#0f172a" />
        </svg>
    ),

    'ship-dispatch-cutoff-bar': (_col: string, _light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect x="2" y="6" width="76" height="36" rx="4" fill="#ffffff" stroke="#fde68a" strokeWidth="1" />
            <rect x="2" y="6" width="76" height="9" fill="#fffbeb" />
            <rect x="6" y="9" width="30" height="3" rx="1" fill="#92400e" />
            <rect x="62" y="8" width="12" height="5" rx="1.5" fill="#d97706" />
            <rect x="6" y="20" width="46" height="4" rx="1" fill="#0f172a" />
            <rect x="6" y="27" width="56" height="2.5" rx="1" fill="#64748b" />
        </svg>
    ),

    'ship-carrier-post-ticket': (_col: string, _light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect x="2" y="6" width="76" height="36" rx="4" fill="#fafaf9" stroke="#d6d3d1" strokeWidth="1" strokeDasharray="3 2" />
            <rect x="6" y="11" width="16" height="26" rx="2" fill="#f0f9ff" stroke="#0369a1" strokeWidth="0.8" />
            <rect x="8" y="14" width="12" height="2" fill="#0369a1" />
            <rect x="26" y="13" width="22" height="3" rx="1" fill="#0369a1" />
            <rect x="26" y="20" width="44" height="4" rx="1" fill="#1c1917" />
            <rect x="26" y="27" width="36" height="2.5" rx="1" fill="#78716c" />
        </svg>
    ),

    'ship-stepper-timeline': (_col: string, _light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect x="2" y="6" width="76" height="36" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <line x1="18" y1="20" x2="62" y2="20" stroke="#cbd5e1" strokeWidth="1.5" />
            <circle cx="15" cy="20" r="4.5" fill="#dcfce7" stroke="#16a34a" strokeWidth="1" />
            <rect x="7" y="28" width="16" height="3" rx="1" fill="#0f172a" />
            <circle cx="40" cy="20" r="4.5" fill="#dbeafe" stroke="#2563eb" strokeWidth="1" />
            <rect x="32" y="28" width="16" height="3" rx="1" fill="#0f172a" />
            <circle cx="65" cy="20" r="4.5" fill="#f1f5f9" stroke="#64748b" strokeWidth="1" />
            <rect x="57" y="28" width="16" height="3" rx="1" fill="#0f172a" />
        </svg>
    ),

    'ship-dark-obsidian-cargo': (_col: string, _light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect x="2" y="6" width="76" height="36" rx="4" fill="#0f172a" />
            <rect x="6" y="14" width="16" height="20" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
            <rect x="26" y="12" width="22" height="4" rx="1" fill="#082f49" stroke="#0369a1" strokeWidth="0.5" />
            <rect x="26" y="19" width="46" height="4" rx="1" fill="#ffffff" />
            <rect x="26" y="26" width="38" height="2.5" rx="1" fill="#94a3b8" />
        </svg>
    ),

    'ship-minimalist-swiss': (_col: string, _light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect x="2" y="6" width="76" height="36" fill="#ffffff" />
            <line x1="2" y1="6" x2="78" y2="6" stroke="#0f172a" strokeWidth="2" />
            <line x1="2" y1="42" x2="78" y2="42" stroke="#0f172a" strokeWidth="2" />
            <rect x="6" y="15" width="18" height="3" rx="1" fill="#64748b" />
            <line x1="28" y1="12" x2="28" y2="36" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="33" y="16" width="40" height="3.5" rx="1" fill="#0f172a" />
            <rect x="33" y="23" width="30" height="2.5" rx="1" fill="#64748b" />
        </svg>
    ),

    'ship-warehouse-direct': (_col: string, _light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect x="2" y="6" width="76" height="36" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <rect x="6" y="15" width="42" height="4" rx="1" fill="#0f172a" />
            <rect x="6" y="23" width="36" height="2.5" rx="1" fill="#64748b" />
            <rect x="52" y="15" width="22" height="18" rx="2" fill="#f0fdf4" stroke="#86efac" strokeWidth="0.8" />
            <rect x="55" y="22" width="16" height="3" rx="1" fill="#166534" />
        </svg>
    ),

    'ship-compact-capsule': (_col: string, _light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect x="2" y="14" width="76" height="20" rx="10" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <circle cx="10" cy="24" r="3" fill="#16a34a" />
            <rect x="16" y="22" width="36" height="4" rx="1" fill="#0f172a" />
            <rect x="58" y="20" width="16" height="8" rx="4" fill="#dcfce7" />
        </svg>
    ),

    'ship-white-glove-security': (_col: string, _light: string) => (
        <svg viewBox="0 0 80 48" fill="none" style={{ width: '100%', height: 36 }}>
            <rect x="2" y="6" width="76" height="36" rx="4" fill="#ffffff" stroke="#bbf7d0" strokeWidth="1" />
            <circle cx="14" cy="24" r="6" fill="#f0fdf4" stroke="#86efac" strokeWidth="1" />
            <path d="M12 24l2 2 3-3" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" />
            <rect x="25" y="16" width="44" height="4" rx="1" fill="#0f172a" />
            <rect x="25" y="23" width="36" height="2.5" rx="1" fill="#64748b" />
        </svg>
    ),
}

// ─────────────────────────────────────────────────────────────────────────────
// THUMBNAIL COMPONENT RENDERER
// ─────────────────────────────────────────────────────────────────────────────
export function VariantThumbnail({
    variantId,
    isSelected,
}: {
    variantId: string
    isSelected: boolean
}) {
    const col = isSelected ? C.primary : C.secondary
    const light = isSelected ? C.primaryLight : '#f3eeff'

    // Smart multi-lookup: supports exact key, lowercase, with hyphens, with underscores, and 3-letter alias
    const cleanId = (variantId || '').trim().toLowerCase()
    const hyphenId = cleanId.replace(/_/g, '-')
    const underscoreId = cleanId.replace(/-/g, '_')
    const prefixId = cleanId.slice(0, 3)

    // Specific mapping for single image styles
    const singleImageAliases: Record<string, string> = {
        'cir': 'circular-ring-spotlight',
        'circular': 'circular-ring-spotlight',
        'circular_ring_spotlight': 'circular-ring-spotlight',
        'arc': 'arch-portal',
        'arch': 'arch-portal',
        'arch_portal': 'arch-portal',
        'vie': 'viewfinder-corners',
        'viewfinder': 'viewfinder-corners',
        'viewfinder_corners': 'viewfinder-corners',
        'dia': 'diagonal-cut',
        'diagonal': 'diagonal-cut',
        'diagonal_cut': 'diagonal-cut',
        'tru': 'trust-guarantee-badge',
        'trust': 'trust-guarantee-badge',
        'trust_guarantee_badge': 'trust-guarantee-badge',
        'lux': 'luxury-certified-seal',
        'luxury': 'luxury-certified-seal',
        'luxury_certified_seal': 'luxury-certified-seal',
        'dea': 'deal-flash-ribbon',
        'deal': 'deal-flash-ribbon',
        'deal_flash_ribbon': 'deal-flash-ribbon',
        'stu': 'studio-pedestal',
        'studio': 'studio-pedestal',
        'studio_pedestal': 'studio-pedestal',
        'sta': 'stadium-capsule-pod',
        'stadium': 'stadium-capsule-pod',
        'stadium_capsule_pod': 'stadium-capsule-pod',
        'geo': 'geometric-prism-spotlight',
        'geometric': 'geometric-prism-spotlight',
        'geometric_prism_spotlight': 'geometric-prism-spotlight',
        'diagonal_split_stage': 'diagonal-split-stage',
        'diagonal-split-stage': 'diagonal-split-stage',
        'spl': 'diagonal-split-stage',
        'scu': 'sculpted-armor-shield',
        'sculpted': 'sculpted-armor-shield',
        'sculpted_armor_shield': 'sculpted-armor-shield',
    }

    const resolvedKey =
        VARIANT_THUMBNAILS[variantId] ? variantId :
            VARIANT_THUMBNAILS[cleanId] ? cleanId :
                VARIANT_THUMBNAILS[hyphenId] ? hyphenId :
                    VARIANT_THUMBNAILS[underscoreId] ? underscoreId :
                        (singleImageAliases[cleanId] && VARIANT_THUMBNAILS[singleImageAliases[cleanId]]) ? singleImageAliases[cleanId] :
                            VARIANT_THUMBNAILS[prefixId] ? prefixId :
                                null

    const render = resolvedKey ? VARIANT_THUMBNAILS[resolvedKey] : null

    if (render) return render(col, light)

    // ── Auto-generated fallback for any future variant ──
    return (
        <div
            style={{
                height: 36,
                backgroundColor: light,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${isSelected ? col : '#e5e7eb'}`,
            }}
        >
            <span
                style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 11,
                    fontWeight: 700,
                    color: col,
                    textTransform: 'uppercase',
                }}
            >
                {variantId.slice(0, 3)}
            </span>
        </div>
    )
}
