// components/ui/VisualEditor/IconLibrary.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Editor / Icon Library
//
// Single source of truth for all icons used in Key Features Grid variants.
// Replaces the local getIconSvg() in key_features.variants.ts.
//
// Exports:
//   ICON_LIBRARY          — icons grouped by category, each with id + label + svg
//   ICON_CATEGORIES       — ordered list of category keys
//   getAllIcons()          — flat array of all icon entries
//   getIconSvg(id, color, size) — renders one icon SVG string
// ─────────────────────────────────────────────────────────────────────────────

export type IconCategory = 'trust' | 'product' | 'tech' | 'lifestyle'

export interface IconEntry {
    id: string
    label: string
    svg: (color: string, size: number) => string
}

// ─── SVG path helpers ─────────────────────────────────────────────────────────

function wrap(color: string, size: number, inner: string, extra = ''): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"${extra}>${inner}</svg>`
}

// ─── Icon Library ─────────────────────────────────────────────────────────────

export const ICON_LIBRARY: Record<IconCategory, IconEntry[]> = {

    // ── Trust / Quality ───────────────────────────────────────────────────────
    trust: [
        {
            id: 'shield',
            label: 'Shield',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`)
        },
        {
            id: 'check',
            label: 'Checkmark',
            svg: (c, s) => wrap(c, s, `<polyline points="20 6 9 17 4 12"/>`, ` stroke-width="2.5"`)
        },
        {
            id: 'star',
            label: 'Star',
            svg: (c, s) => wrap(c, s, `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`)
        },
        {
            id: 'verified',
            label: 'Verified Badge',
            svg: (c, s) => wrap(c, s, `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/><polyline points="9 12 11 14 15 10" stroke-width="2.5"/>`)
        },
        {
            id: 'award',
            label: 'Award',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>`)
        },
        {
            id: 'badge',
            label: 'Badge',
            svg: (c, s) => wrap(c, s, `<path d="M12 2L8 6H2l2 6-2 6h6l4 4 4-4h6l-2-6 2-6h-6l-4-4z"/><polyline points="9 12 11 14 15 10" stroke-width="2.5"/>`)
        },
    ],

    // ── Product ───────────────────────────────────────────────────────────────
    product: [
        {
            id: 'box',
            label: 'Box / Package',
            svg: (c, s) => wrap(c, s, `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>`)
        },
        {
            id: 'tag',
            label: 'Price Tag',
            svg: (c, s) => wrap(c, s, `<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>`)
        },
        {
            id: 'package',
            label: 'Package',
            svg: (c, s) => wrap(c, s, `<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>`)
        },
        {
            id: 'truck',
            label: 'Fast Delivery',
            svg: (c, s) => wrap(c, s, `<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>`)
        },
        {
            id: 'returns',
            label: 'Easy Returns',
            svg: (c, s) => wrap(c, s, `<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.47"/>`)
        },
        {
            id: 'warranty',
            label: 'Warranty',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10" stroke-width="2.5"/>`)
        },
    ],

    // ── Tech / Performance ────────────────────────────────────────────────────
    tech: [
        {
            id: 'zap',
            label: 'Speed / Power',
            svg: (c, s) => wrap(c, s, `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`)
        },
        {
            id: 'cpu',
            label: 'CPU / Chip',
            svg: (c, s) => wrap(c, s, `<rect x="9" y="9" width="6" height="6"/><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="9" y1="2" x2="9" y2="5"/><line x1="15" y1="2" x2="15" y2="5"/><line x1="9" y1="19" x2="9" y2="22"/><line x1="15" y1="19" x2="15" y2="22"/><line x1="2" y1="9" x2="5" y2="9"/><line x1="2" y1="15" x2="5" y2="15"/><line x1="19" y1="9" x2="22" y2="9"/><line x1="19" y1="15" x2="22" y2="15"/>`)
        },
        {
            id: 'tool',
            label: 'Tool / Wrench',
            svg: (c, s) => wrap(c, s, `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`)
        },
        {
            id: 'wrench',
            label: 'Wrench',
            svg: (c, s) => wrap(c, s, `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`)
        },
        {
            id: 'settings',
            label: 'Settings / Gear',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>`)
        },
        {
            id: 'wifi',
            label: 'Wireless / WiFi',
            svg: (c, s) => wrap(c, s, `<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>`)
        },
    ],

    // ── Lifestyle / Nature ────────────────────────────────────────────────────
    lifestyle: [
        {
            id: 'flame',
            label: 'Flame / Thermal',
            svg: (c, s) => wrap(c, s, `<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>`)
        },
        {
            id: 'droplet',
            label: 'Droplet / Water',
            svg: (c, s) => wrap(c, s, `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>`)
        },
        {
            id: 'leaf',
            label: 'Leaf / Eco',
            svg: (c, s) => wrap(c, s, `<path d="M17 8C8 10 5.9 16.17 3.82 22c3.28-1.5 7.68-3.5 9.18-7 0 0 3 1.5 5-3 0 0-1.5 2.5-5 2.5 0 0 3-1 4-3.5 0 0-2.5 2-5.5 1.5 0 0 3-2 4.5-4.5z"/>`)
        },
        {
            id: 'heart',
            label: 'Heart / Care',
            svg: (c, s) => wrap(c, s, `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`)
        },
        {
            id: 'sun',
            label: 'Sun / Energy',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`)
        },
        {
            id: 'moon',
            label: 'Moon / Night',
            svg: (c, s) => wrap(c, s, `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`)
        },
    ],
}

// ─── Category order ───────────────────────────────────────────────────────────

export const ICON_CATEGORIES: IconCategory[] = ['trust', 'product', 'tech', 'lifestyle']

export const CATEGORY_LABELS: Record<IconCategory, string> = {
    trust: 'Trust & Quality',
    product: 'Product & Shipping',
    tech: 'Tech & Performance',
    lifestyle: 'Lifestyle & Nature',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Flat list of all icons across every category */
export function getAllIcons(): IconEntry[] {
    return ICON_CATEGORIES.flatMap(cat => ICON_LIBRARY[cat])
}

/**
 * Renders one icon as an inline SVG string.
 * Drop-in replacement for the local getIconSvg() in key_features.variants.ts.
 * Falls back to the star icon for unknown IDs.
 */
export function getIconSvg(id: string, color = '#2563eb', size = 20): string {
    const normalized = (id ?? '').toLowerCase()
    for (const cat of ICON_CATEGORIES) {
        const match = ICON_LIBRARY[cat].find(e => e.id === normalized)
        if (match) return match.svg(color, size)
    }
    // Fallback: star
    return ICON_LIBRARY.trust.find(e => e.id === 'star')!.svg(color, size)
}
