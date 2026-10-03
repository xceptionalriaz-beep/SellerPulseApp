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

export type IconCategory = 'trust' | 'product' | 'tech' | 'lifestyle' | 'pricing' | 'customer' | 'business' | 'tools' | 'safety' | 'returns' | 'packaging' | 'compatibility' | 'condition' | 'eco' | 'payment' | 'location'

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
        // ── Core Quality & Verification ──
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
            label: 'Verified',
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
        {
            id: 'shield-check',
            label: 'Protected Warranty',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>`)
        },
        {
            id: 'thumb-up',
            label: 'Recommended Seller',
            svg: (c, s) => wrap(c, s, `<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3"/>`)
        },
        {
            id: 'lock',
            label: 'Encrypted Security',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`)
        },
        {
            id: 'lock-open',
            label: 'Unlocked / Universal',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>`)
        },
        {
            id: 'handshake',
            label: 'Buyer Protection',
            svg: (c, s) => wrap(c, s, `<path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.6-4.6a2 2 0 0 0 0-2.8l-3.4-3.4a2 2 0 0 0-2.8 0L9 12"/><path d="m3 7 3-3a2 2 0 0 1 2.8 0l3.4 3.4a2 2 0 0 1 0 2.8L9 13"/><path d="m6 10 7.5 7.5"/><path d="M18 14v4a2 2 0 0 1-2 2h-4"/>`)
        },
        {
            id: 'medal',
            label: 'Top Seller Medal',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="14" r="6"/><path d="m7.2 4.8 3.8 4.2"/><path d="m16.8 4.8-3.8 4.2"/><path d="M12 2v3"/><path d="m9 2 1.5 3"/><path d="m15 2-1.5 3"/>`)
        },
        {
            id: 'trophy',
            label: 'Award Winner',
            svg: (c, s) => wrap(c, s, `<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>`)
        },
        {
            id: 'scale',
            label: 'Compliance',
            svg: (c, s) => wrap(c, s, `<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>`)
        },
        {
            id: 'crown',
            label: 'VIP Luxury',
            svg: (c, s) => wrap(c, s, `<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>`)
        },
        {
            id: 'shield-alert',
            label: 'Protected',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`)
        },
        {
            id: 'file-check',
            label: 'Authentic',
            svg: (c, s) => wrap(c, s, `<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/>`)
        },
        {
            id: 'sparkle',
            label: 'Sparkle',
            svg: (c, s) => wrap(c, s, `<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>`)
        },
        {
            id: 'bookmark-check',
            label: 'Exact Fit',
            svg: (c, s) => wrap(c, s, `<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/><path d="m9 10 2 2 4-4"/>`)
        },
        {
            id: 'fingerprint',
            label: 'Serial No.',
            svg: (c, s) => wrap(c, s, `<path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>`)
        },
        // ── New Short-Labeled Trust & Quality Icons ──────────────────────────
        {
            id: 'qc-pass',
            label: 'QC Pass',
            svg: (c, s) => wrap(c, s, `<path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/>`)
        },
        {
            id: 'inspected',
            label: 'Checklist',
            svg: (c, s) => wrap(c, s, `<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>`)
        },
        {
            id: 'lifetime',
            label: 'Lifetime',
            svg: (c, s) => wrap(c, s, `<path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"/>`)
        },
        {
            id: 'pledge',
            label: 'Care Pledge',
            svg: (c, s) => wrap(c, s, `<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/><path d="m18 15-2-2"/><path d="m15 18-2-2"/>`)
        },
        {
            id: 'extended',
            label: 'Warranty +',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M9 12h6"/><path d="M12 9v6"/>`)
        },
        {
            id: 'five-stars',
            label: '5 Stars',
            svg: (c, s) => wrap(c, s, `<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>`)
        },
        {
            id: 'authorized',
            label: 'Authorized',
            svg: (c, s) => wrap(c, s, `<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>`)
        },
        {
            id: 'official-seal',
            label: 'Seal',
            svg: (c, s) => wrap(c, s, `<path d="M5 22h14"/><path d="M19.3 13.7A2.5 2.5 0 0 0 17.5 13h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1.5c0-.7-.3-1.3-.7-1.8Z"/><path d="M14 13V8.5C14 7.1 12.9 6 11.5 6S9 7.1 9 8.5V13"/>`)
        },
        {
            id: 'signed',
            label: 'Signed COA',
            svg: (c, s) => wrap(c, s, `<path d="M20 19.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.5L20 7.5V11"/><polyline points="14 2 14 8 20 8"/><path d="M18.4 15.6a2.1 2.1 0 1 1 3 3L15.5 24.5 12 25l.5-3.5 5.9-5.9Z"/>`)
        },
        {
            id: 'genuine-gem',
            label: 'Authentic Gem',
            svg: (c, s) => wrap(c, s, `<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l4 12 4-12-3-6"/>`)
        },
        {
            id: 'lab-tested',
            label: 'Lab Tested',
            svg: (c, s) => wrap(c, s, `<path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>`)
        },
        {
            id: 'pure-chem',
            label: 'Purity Check',
            svg: (c, s) => wrap(c, s, `<path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5h0c-1.4 0-2.5-1.1-2.5-2.5V2"/><path d="M8.5 2h7"/><path d="M14.5 16h-5"/>`)
        },
        {
            id: 'medical-grade',
            label: 'Med Tested',
            svg: (c, s) => wrap(c, s, `<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>`)
        },
        {
            id: 'champion',
            label: 'Top Choice',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 22l-5-3-5 3 1.5-9"/>`)
        },
        {
            id: 'oem-fit',
            label: 'OEM Fit',
            svg: (c, s) => wrap(c, s, `<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="m9 9 2 2 4-4"/>`)
        },
        {
            id: 'vault-safe',
            label: 'Vault Safe',
            svg: (c, s) => wrap(c, s, `<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M12 8V6"/><path d="M12 18v-2"/><path d="M8 12H6"/><path d="M18 12h-2"/>`)
        },
        {
            id: 'refurb-cert',
            label: 'Refurbished',
            svg: (c, s) => wrap(c, s, `<path d="M3 12a9 9 0 0 1 9-9 9.8 9.8 0 0 1 6.7 2.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.8 9.8 0 0 1-6.7-2.7L3 16"/><path d="M8 16H3v5"/>`)
        },
        {
            id: 'grade-a',
            label: 'Grade A+',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M8 15h3m-1.5-6v6M14 12h4M16 10v4"/>`)
        },
        {
            id: 'sneaker-pass',
            label: 'Shoe Pass',
            svg: (c, s) => wrap(c, s, `<path d="M2 17h20v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/><path d="M2 17c0-3 1.5-6 4-7l5-2 4 4 5 1a2 2 0 0 1 2 2v2"/><path d="m9 11 2 2 4-4"/>`)
        },
        {
            id: 'swiss-movement',
            label: 'Watch Tested',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="7"/><path d="M12 9v3l2 2"/><path d="m8 1 1 3h6l1-3"/><path d="m8 23 1-3h6l1 3"/><path d="m17 9 2 2 3-3"/>`)
        },
        {
            id: 'bullion-pure',
            label: '.999 Pure',
            svg: (c, s) => wrap(c, s, `<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>`)
        },
        {
            id: 'cert-scan',
            label: 'Cert Check',
            svg: (c, s) => wrap(c, s, `<path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/><path d="M2 12h20" stroke-width="2.5"/>`)
        },
        {
            id: 'battery-ok',
            label: 'Battery 85%+',
            svg: (c, s) => wrap(c, s, `<rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="11" x2="23" y2="13"/><path d="m7 12 2 2 4-4"/>`)
        },
        {
            id: 'board-ok',
            label: 'Logic OK',
            svg: (c, s) => wrap(c, s, `<rect x="4" y="4" width="16" height="16" rx="2"/><path d="m9 12 2 2 4-4"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"/>`)
        },
        {
            id: 'screen-ok',
            label: 'Screen OK',
            svg: (c, s) => wrap(c, s, `<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/><path d="m8 10 2 2 4-4"/>`)
        },
        {
            id: 'safety-hat',
            label: 'OSHA Safe',
            svg: (c, s) => wrap(c, s, `<path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a6 6 0 0 1 6-6h0"/><path d="M14 6h0a6 6 0 0 1 6 6v3"/>`)
        },
        {
            id: 'anti-shock',
            label: 'Anti Shock',
            svg: (c, s) => wrap(c, s, `<polyline points="12.4 6.8 13 2 10.6 5"/><polyline points="18.6 13 21 10 15.7 10"/><polyline points="8 8 3 14 12 14 11 22 16 16"/><line x1="1" y1="1" x2="23" y2="23"/>`)
        },
        {
            id: 'flame-proof',
            label: 'Fire Safe',
            svg: (c, s) => wrap(c, s, `<path d="M12 2c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 17 10c0 2.5-2 4.5-5 4.5s-5-2-5-4.5c0-1.5.5-2.5 1.5-3.5C9.5 5.5 11 5 12 2Z"/><path d="m4 19 16-2"/><path d="m4 17 16 2"/>`)
        },
        {
            id: 'eco-cert',
            label: 'RoHS Eco',
            svg: (c, s) => wrap(c, s, `<path d="M11 20A7 7 0 0 1 4 13C4 8 9 3 17 2c0 8-5 13-10 13"/><path d="m14 14 2 2 4-4"/><path d="M2 21c0-3 1.8-5.4 5.1-6"/>`)
        },
        {
            id: 'recycled',
            label: 'Lead Free',
            svg: (c, s) => wrap(c, s, `<path d="M7 19H4.8a1.8 1.8 0 0 1-1.6-.9 1.8 1.8 0 0 1 0-1.8L7.2 9.5"/><path d="M11 19h8.2a1.8 1.8 0 0 0 1.6-.9 1.8 1.8 0 0 0 0-1.8l-1.2-2.1"/><path d="m14 16 3 3-3 3"/><path d="m18 10-3-3 3-3"/>`)
        },
        {
            id: 'sterile',
            label: 'Sanitized',
            svg: (c, s) => wrap(c, s, `<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="m9 12 2 2 4-4"/>`)
        },
        {
            id: 'factory-direct',
            label: 'Factory OEM',
            svg: (c, s) => wrap(c, s, `<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>`)
        },
        {
            id: 'brick-store',
            label: 'Real Shop',
            svg: (c, s) => wrap(c, s, `<path d="m2 7 4.4-4.4A2 2 0 0 1 7.8 2h8.4a2 2 0 0 1 1.4.6L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><circle cx="12" cy="12" r="2"/>`)
        },
        {
            id: 'buyer-count',
            label: '50k+ Happy',
            svg: (c, s) => wrap(c, s, `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>`)
        },
        {
            id: 'dealer-guard',
            label: 'Dealer Safe',
            svg: (c, s) => wrap(c, s, `<path d="M14 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8" cy="7" r="4"/><path d="M18 11s3-1.5 3-4V4l-3-1-3 1v3c0 2.5 3 4 3 4z"/>`)
        },
        {
            id: 'iso-global',
            label: 'ISO Std',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`)
        },
        {
            id: 'price-match',
            label: 'Best Price',
            svg: (c, s) => wrap(c, s, `<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="M12 8v8"/><path d="M10 10h4a1 1 0 0 1 0 2h-4a1 1 0 0 0 0 2h4"/>`)
        },
        {
            id: 'response-fast',
            label: '< 1hr Reply',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/><path d="m16 16 2 2 4-4"/>`)
        },
        {
            id: 'positive-100',
            label: '100% Pos.',
            svg: (c, s) => wrap(c, s, `<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3"/><path d="M19 14h3a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-3"/>`)
        },
        {
            id: 'happy-face',
            label: 'Delight',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>`)
        },
        {
            id: 'zero-defect',
            label: 'Zero Defect',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><line x1="9" y1="12" x2="15" y2="12"/>`)
        },
        {
            id: 'anti-theft',
            label: 'Anti Theft',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="10" r="3"/><path d="M12 13v4"/><circle cx="12" cy="12" r="10"/>`)
        },
        {
            id: 'zero-fees',
            label: 'No Hidden Fees',
            svg: (c, s) => wrap(c, s, `<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><line x1="9" y1="12" x2="15" y2="12"/>`)
        },
        {
            id: 'water-submersible',
            label: 'IP68 Water',
            svg: (c, s) => wrap(c, s, `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="m9 13 2 2 4-4"/>`)
        },
        {
            id: 'drop-proof',
            label: 'Drop Proof',
            svg: (c, s) => wrap(c, s, `<path d="M7 10H6a4 4 0 0 1-4-4 1 1 0 0 1 1-1h18a1 1 0 0 1 1 1 4 4 0 0 1-4 4h-1"/><path d="M9 10v5a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3v-5"/><path d="M5 21h14"/>`)
        },
        {
            id: 'bpa-free',
            label: 'BPA Free',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 14.5c-1-1-2-.5-2 0s1.5 2 2 2.5c.5-.5 2-1.5 2-2.5s-1-1-2 0z"/>`)
        },
        {
            id: 'child-safe',
            label: 'Child Safe',
            svg: (c, s) => wrap(c, s, `<path d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/><path d="m17 17 2 2 3-3"/>`)
        },
        {
            id: 'hypoallergenic',
            label: 'Nickel Free',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><polygon points="12 7 13 10 16 10 13.5 12 14.5 15 12 13 9.5 15 10.5 12 8 10 11 10 12 7"/>`)
        },
        {
            id: 'non-fade',
            label: 'Sun',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="4"/><path d="M12 4h.01M20 12h.01M12 20h.01M4 12h.01M17.65 6.35h.01M17.65 17.65h.01M6.35 17.65h.01M6.35 6.35h.01"/>`)
        },
        {
            id: 'ltd-co',
            label: 'Building',
            svg: (c, s) => wrap(c, s, `<line x1="2" y1="20" x2="22" y2="20"/><line x1="6" y1="11" x2="6" y2="16"/><line x1="10" y1="11" x2="10" y2="16"/><line x1="14" y1="11" x2="14" y2="16"/><line x1="18" y1="11" x2="18" y2="16"/><polygon points="12 2 20 7 4 7"/><line x1="1" y1="20" x2="23" y2="20"/>`)
        },

        // ── 60 New Trust & Quality Icons ─────────────────────────────────────
        {
            id: 'check-check',
            label: 'Check',
            svg: (c, s) => wrap(c, s, `<path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/>`)
        },
        {
            id: 'clipboard-check',
            label: 'Checklist',
            svg: (c, s) => wrap(c, s, `<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>`)
        },
        {
            id: 'heart-handshake',
            label: 'Heart ',
            svg: (c, s) => wrap(c, s, `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/><path d="m18 15-2-2"/><path d="m15 18-2-2"/>`)
        },
        {
            id: 'shield-plus',
            label: 'Extended Warranty',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M9 12h6"/><path d="M12 9v6"/>`)
        },
        {
            id: 'stars',
            label: 'Stars',
            svg: (c, s) => wrap(c, s, `<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="m5 21 1.4-3"/><path d="M3.6 17 6.4 19"/>`)
        },
        {
            id: 'badge-check',
            label: 'Badge Check',
            svg: (c, s) => wrap(c, s, `<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>`)
        },
        {
            id: 'stamp',
            label: 'Stamp',
            svg: (c, s) => wrap(c, s, `<path d="M5 22h14"/><path d="M19.27 13.73A2.5 2.5 0 0 0 17.5 13h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1.5c0-.66-.26-1.3-.73-1.77Z"/><path d="M14 13V8.5C14 7.12 12.88 6 11.5 6S9 7.12 9 8.5V13"/>`)
        },
        {
            id: 'file-signature',
            label: 'File Signature',
            svg: (c, s) => wrap(c, s, `<path d="M20 19.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.5L20 7.5V11"/><polyline points="14 2 14 8 20 8"/><path d="M18.42 15.61a2.1 2.1 0 1 1 2.97 2.97L15.5 24.5 12 25l.5-3.5 5.92-5.89Z"/>`)
        },
        {
            id: 'gem',
            label: 'Gem / Diamond',
            svg: (c, s) => wrap(c, s, `<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l4 12 4-12-3-6"/>`)
        },
        {
            id: 'microscope',
            label: 'Microscope',
            svg: (c, s) => wrap(c, s, `<path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>`)
        },
        {
            id: 'test-tube',
            label: 'Test Tube',
            svg: (c, s) => wrap(c, s, `<path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5h0c-1.4 0-2.5-1.1-2.5-2.5V2"/><path d="M8.5 2h7"/><path d="M14.5 16h-5"/>`)
        },
        {
            id: 'stethoscope',
            label: 'Stethoscope',
            svg: (c, s) => wrap(c, s, `<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>`)
        },
        {
            id: 'ribbon',
            label: 'Trophy',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>`)
        },
        {
            id: 'shield-star',
            label: 'Shield Star',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polygon points="12 8 13.5 11 17 11.5 14.5 14 15 17.5 12 16 9 17.5 9.5 14 7 11.5 10.5 11 12 8"/>`)
        },
        {
            id: 'copyright',
            label: 'Fingerprint',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M15 9.354a4 4 0 1 0 0 5.292"/>`)
        },
        {
            id: 'eye',
            label: 'Eye',
            svg: (c, s) => wrap(c, s, `<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`)
        },
        {
            id: 'scan-face',
            label: 'Scan Face',
            svg: (c, s) => wrap(c, s, `<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>`)
        },
        {
            id: 'hard-hat',
            label: 'Shield Alert',
            svg: (c, s) => wrap(c, s, `<path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a6 6 0 0 1 6-6h0"/><path d="M14 6h0a6 6 0 0 1 6 6v3"/>`)
        },
        {
            id: 'zap-off',
            label: 'Zap Off',
            svg: (c, s) => wrap(c, s, `<polyline points="12.41 6.75 13 2 10.57 4.92"/><polyline points="18.57 12.91 21 10 15.66 10"/><polyline points="8 8 3 14 12 14 11 22 16 16"/><line x1="1" y1="1" x2="23" y2="23"/>`)
        },
        {
            id: 'flame-kindling',
            label: 'Flame Kindling',
            svg: (c, s) => wrap(c, s, `<path d="M12 2c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 17 10c0 2.5-2 4.5-5 4.5s-5-2-5-4.5c0-1.5.5-2.5 1.5-3.5C9.5 5.5 11 5 12 2Z"/><path d="m4 19 16-2"/><path d="m4 17 16 2"/>`)
        },
        {
            id: 'leaf-check',
            label: 'Leaf Check',
            svg: (c, s) => wrap(c, s, `<path d="M11 20A7 7 0 0 1 4 13C4 8 9 3 17 2c0 8-5 13-10 13"/><path d="m14 14 2 2 4-4"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/>`)
        },
        {
            id: 'recycle-check',
            label: 'Recycle Check',
            svg: (c, s) => wrap(c, s, `<path d="M7 19H4.8a1.8 1.8 0 0 1-1.6-.9 1.8 1.8 0 0 1 0-1.8L7.2 9.5"/><path d="M11 19h8.2a1.8 1.8 0 0 0 1.6-.9 1.8 1.8 0 0 0 0-1.8l-1.2-2.1"/><path d="m14 16 3 3-3 3"/><path d="m18 10-3-3 3-3"/>`)
        },
        {
            id: 'sparkles-check',
            label: 'Sparkles Check',
            svg: (c, s) => wrap(c, s, `<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="m9 12 2 2 4-4"/>`)
        },
        {
            id: 'building-2',
            label: 'Building',
            svg: (c, s) => wrap(c, s, `<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>`)
        },
        {
            id: 'store',
            label: 'Store',
            svg: (c, s) => wrap(c, s, `<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><circle cx="12" cy="12" r="2"/>`)
        },
        {
            id: 'user-shield',
            label: 'User Shield',
            svg: (c, s) => wrap(c, s, `<path d="M14 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8" cy="7" r="4"/><path d="M18 11s3-1.5 3-4V4l-3-1-3 1v3c0 2.5 3 4 3 4z"/>`)
        },
        {
            id: 'globe-check',
            label: 'Globe Check',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`)
        },
        {
            id: 'badge-dollar',
            label: 'Badge Dollar',
            svg: (c, s) => wrap(c, s, `<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="M12 8v8"/><path d="M10 10h4a1 1 0 0 1 0 2h-4a1 1 0 0 0 0 2h4"/>`)
        },
        {
            id: 'clock-check',
            label: 'Clock Check',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/><path d="m16 16 2 2 4-4"/>`)
        },
        {
            id: 'thumbs-up-double',
            label: 'Thumbs Up Duble',
            svg: (c, s) => wrap(c, s, `<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3"/><path d="M19 14h3a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-3"/>`)
        },
        {
            id: 'smile-plus',
            label: 'Smile Plus',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>`)
        },
        {
            id: 'shield-minus',
            label: 'Shield Minus',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><line x1="9" y1="12" x2="15" y2="12"/>`)
        },
        {
            id: 'badge-alert',
            label: 'Badge Alert',
            svg: (c, s) => wrap(c, s, `<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`)
        },
        {
            id: 'key-round',
            label: 'Key Round',
            svg: (c, s) => wrap(c, s, `<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>`)
        },
        {
            id: 'history',
            label: 'History',
            svg: (c, s) => wrap(c, s, `<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><polyline points="12 7 12 12 15 15"/>`)
        },
        {
            id: 'file-lock',
            label: 'File Lock',
            svg: (c, s) => wrap(c, s, `<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><rect width="6" height="5" x="9" y="13" rx="1"/><path d="M10 13V11a2 2 0 0 1 4 0v2"/>`)
        },
        {
            id: 'server-shield',
            label: 'Server Shield',
            svg: (c, s) => wrap(c, s, `<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M12 12s3-1.5 3-4V5l-3-1-3 1v3c0 2.5 3 4 3 4z"/>`)
        },
        {
            id: 'check-circle',
            label: 'Check Circle',
            svg: (c, s) => wrap(c, s, `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`)
        },
        {
            id: 'search-check',
            label: 'Search Check',
            svg: (c, s) => wrap(c, s, `<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><path d="m8 11 2 2 4-4"/>`)
        },
        {
            id: 'shield-half',
            label: 'Shield Half',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 22V2"/>`)
        },
        {
            id: 'shield-ellipsis',
            label: 'Shield Ellipsis',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/>`)
        },
        {
            id: 'lock-keyhole',
            label: 'Lock Keyhole',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="16" r="1"/><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/>`)
        },
        {
            id: 'award-ribbon',
            label: 'Award Ribbon',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="9" r="6"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/>`)
        },
        {
            id: 'message-circle-heart',
            label: 'Star',
            svg: (c, s) => wrap(c, s, `<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M12 8c.5-1 1.5-1.5 2.5-1.5 1.5 0 2.5 1 2.5 2.5 0 2-2.5 3.5-5 5.5-2.5-2-5-3.5-5-5.5 0-1.5 1-2.5 2.5-2.5 1 0 2 .5 2.5 1.5"/>`)
        },
        {
            id: 'badge-help',
            label: 'Badge Help',
            svg: (c, s) => wrap(c, s, `<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>`)
        },
        {
            id: 'shield-question',
            label: 'Shield Question',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>`)
        },
        {
            id: 'check-square',
            label: 'Check Square',
            svg: (c, s) => wrap(c, s, `<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>`)
        },
        {
            id: 'user-star',
            label: 'User Star',
            svg: (c, s) => wrap(c, s, `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polygon points="19 8 20 10.5 22.5 10.8 20.5 12.5 21 15 19 13.8 17 15 17.5 12.5 15.5 10.8 18 10.5 19 8"/>`)
        },
        {
            id: 'star-half',
            label: 'Star Half',
            svg: (c, s) => wrap(c, s, `<path d="M12 17.8 5.8 21 7 14.1 2 9.3l7-1L12 2"/><path d="M12 2v15.8"/>`)
        },
        {
            id: 'tag-check',
            label: 'Tag Check',
            svg: (c, s) => wrap(c, s, `<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><path d="m9 11 2 2 4-4"/>`)
        },
        {
            id: 'box-check',
            label: 'Box Check',
            svg: (c, s) => wrap(c, s, `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m9 12 2 2 4-4"/>`)
        },
        {
            id: 'truck-check',
            label: 'Truck Check',
            svg: (c, s) => wrap(c, s, `<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/><path d="m6 9 2 2 4-4"/>`)
        },
        {
            id: 'package-check',
            label: 'Package Check',
            svg: (c, s) => wrap(c, s, `<path d="m16 16 2 2 4-4"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/>`)
        },
        {
            id: 'badge-award',
            label: 'Badge Award',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="8" r="5"/><path d="m9.5 13-2 8 4.5-2.5L16.5 21l-2-8"/>`)
        },
        {
            id: 'shield-x',
            label: 'Shield X',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><line x1="9.5" y1="9.5" x2="14.5" y2="14.5"/><line x1="14.5" y1="9.5" x2="9.5" y2="14.5"/>`)
        },
        {
            id: 'award-star',
            label: 'Award Star',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="8" r="6"/><polygon points="12 5 13 7 15 7.5 13.5 9 14 11 12 10 10 11 10.5 9 9 7.5 11 7 12 5"/><path d="m15.5 13 1.5 8-5-2.5L7 21l1.5-8"/>`)
        },
        {
            id: 'shield-check-gold',
            label: 'Infinity',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="8 11 11 14 17 8" stroke-width="2.5"/>`)
        },
        {
            id: 'check-decagram',
            label: 'Badge Check',
            svg: (c, s) => wrap(c, s, `<polygon points="12 2 15 5 19 5 20 9 23 12 20 15 19 19 15 19 12 22 9 19 5 19 4 15 1 12 4 9 5 5 9 5 12 2"/><polyline points="8 12 11 15 16 10"/>`)
        },
        {
            id: 'badge-verified-solid',
            label: 'Stamp',
            svg: (c, s) => wrap(c, s, `<path d="M12 2l2.4 2.5 3.4-.4 1.4 3.1 3.2 1.3-.3 3.5 2.1 2.8-2.1 2.8.3 3.5-3.2 1.3-1.4 3.1-3.4-.4L12 22l-2.4-2.5-3.4.4-1.4-3.1-3.2-1.3.3-3.5L-.2 9.2l2.1-2.8-.3-3.5 3.2-1.3 1.4-3.1 3.4.4L12 2z"/><polyline points="8 12 11 15 16 10"/>`)
        },
        // ── 50 Advanced eBay Trust & Quality Icons ────────────────────────────
        {
            id: 'infinity',
            label: 'Shield Plus',
            svg: (c, s) => wrap(c, s, `<path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"/>`)
        },
        {
            id: 'shield-dollar',
            label: 'Rotate Ccw / Refresh',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v8"/><path d="M10 10h4a1 1 0 0 1 0 2h-4a1 1 0 0 0 0 2h4"/>`)
        },
        {
            id: 'car-check',
            label: 'Wrench / Car',
            svg: (c, s) => wrap(c, s, `<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="m9 9 2 2 4-4"/>`)
        },
        {
            id: 'vault',
            label: 'Vault / Safe',
            svg: (c, s) => wrap(c, s, `<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M12 8V6"/><path d="M12 18v-2"/><path d="M8 12H6"/><path d="M18 12h-2"/>`)
        },
        {
            id: 'battery-check',
            label: 'Battery Charging',
            svg: (c, s) => wrap(c, s, `<rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="11" x2="23" y2="13"/><path d="m7 12 2 2 4-4"/>`)
        },
        {
            id: 'cpu-check',
            label: 'Cpu / Chip',
            svg: (c, s) => wrap(c, s, `<rect x="4" y="4" width="16" height="16" rx="2"/><path d="m9 12 2 2 4-4"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"/>`)
        },
        {
            id: 'screen-check',
            label: 'Monitor Check',
            svg: (c, s) => wrap(c, s, `<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/><path d="m8 10 2 2 4-4"/>`)
        },
        {
            id: 'refresh-cw',
            label: 'Refresh Cw',
            svg: (c, s) => wrap(c, s, `<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>`)
        },
        {
            id: 'grade-a-plus',
            label: 'Sparkle',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M8 15h3m-1.5-6v6M14 12h4M16 10v4"/>`)
        },
        {
            id: 'shoe-check',
            label: 'Footprints',
            svg: (c, s) => wrap(c, s, `<path d="M2 17h20v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/><path d="M2 17c0-3 1.5-6 4-7l5-2 4 4 5 1a2 2 0 0 1 2 2v2"/><path d="m9 11 2 2 4-4"/>`)
        },
        {
            id: 'watch-check',
            label: 'Watch / Timer',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="7"/><path d="M12 9v3l2 2"/><path d="m8 1 1 3h6l1-3"/><path d="m8 23 1-3h6l1 3"/><path d="m17 9 2 2 3-3"/>`)
        },
        {
            id: 'bag-check',
            label: 'Layers',
            svg: (c, s) => wrap(c, s, `<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="m9 13 2 2 4-4"/>`)
        },
        {
            id: 'coins-stack',
            label: 'Scale / Coins',
            svg: (c, s) => wrap(c, s, `<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>`)
        },
        {
            id: 'receipt-text',
            label: 'Original Proof of Purchase',
            svg: (c, s) => wrap(c, s, `<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/>`)
        },
        {
            id: 'scan-barcode',
            label: 'Database Cert Number Checked',
            svg: (c, s) => wrap(c, s, `<path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/><path d="M2 12h20" stroke-width="2.5"/>`)
        },
        {
            id: 'archive',
            label: 'Acid-Free Archival Slab',
            svg: (c, s) => wrap(c, s, `<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>`)
        },
        {
            id: 'wrench-check',
            label: 'ASE Certified Mechanic Tested',
            svg: (c, s) => wrap(c, s, `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/><path d="m2 2 3 3 4-4"/>`)
        },
        {
            id: 'plug-check',
            label: 'Direct Plug-and-Play (No Splice)',
            svg: (c, s) => wrap(c, s, `<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 2v6"/><path d="M18 8v5a6 6 0 0 1-12 0V8Z"/><path d="m8 13 2 2 4-4"/>`)
        },
        {
            id: 'gauge-check',
            label: 'Pressure & Leak Tested',
            svg: (c, s) => wrap(c, s, `<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/><path d="m8 15 2 2 3-3"/>`)
        },
        {
            id: 'disc-check',
            label: 'Brake Safety Certified',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m9 12 2 2 3-3"/>`)
        },
        {
            id: 'truck-shield',
            label: '100% Insured Delivery',
            svg: (c, s) => wrap(c, s, `<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/><path d="M8 8s2-1 2-2V4l-2-1-2 1v2c0 1 2 2 2 2z"/>`)
        },
        {
            id: 'box-heart',
            label: 'Fragile Bubble-Wrap Pack',
            svg: (c, s) => wrap(c, s, `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M12 14.5c-1.5-1.5-3-1-3 0s2 2.5 3 3.5c1-1 3-2.5 3-3.5s-1.5-1.5-3 0z"/>`)
        },
        {
            id: 'plane-shield',
            label: 'Customs Pre-Cleared GSP',
            svg: (c, s) => wrap(c, s, `<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/><path d="M12 21s3-1.5 3-4v-2l-3-1-3 1v2c0 2.5 3 4 3 4z"/>`)
        },
        {
            id: 'shield-lock',
            label: 'Discreet Private Packaging',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><rect width="6" height="5" x="9" y="11" rx="1"/><path d="M10 11V9.5a2 2 0 0 1 4 0V11"/>`)
        },
        {
            id: 'package-search',
            label: 'Signature Tracked Delivery',
            svg: (c, s) => wrap(c, s, `<path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><circle cx="16.5" cy="16.5" r="4.5"/><path d="m20 20 2 2"/>`)
        },
        {
            id: 'droplet-check',
            label: 'IP68 Submersible Waterproof',
            svg: (c, s) => wrap(c, s, `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="m9 13 2 2 4-4"/>`)
        },
        {
            id: 'shield-zap',
            label: 'Short-Circuit Safe (CE/UL)',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><polygon points="13 8 9 13 12 13 11 17 15 12 12 12 13 8"/>`)
        },
        {
            id: 'flame-shield',
            label: 'Heat & Flame Resistor',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 8c.5 1 1.5 1.5 2 2.5a3 3 0 0 1-2 4.5 3 3 0 0 1-2-4.5c.5-1 1.5-1.5 2-2.5z"/>`)
        },
        {
            id: 'anvil',
            label: 'Military Drop Tested (MIL-STD)',
            svg: (c, s) => wrap(c, s, `<path d="M7 10H6a4 4 0 0 1-4-4 1 1 0 0 1 1-1h18a1 1 0 0 1 1 1 4 4 0 0 1-4 4h-1"/><path d="M9 10v5a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3v-5"/><path d="M5 21h14"/>`)
        },
        {
            id: 'magnet-check',
            label: 'Magnet Check',
            svg: (c, s) => wrap(c, s, `<path d="m6 15-4-4 6.7-6.7a5.5 5.5 0 0 1 7.8 0l1.2 1.2a5.5 5.5 0 0 1 0 7.8L11 20l-4-4"/><path d="m9 9 4 4"/><path d="m4 13 4 4"/><path d="m14 14 2 2 3-3"/>`)
        },
        {
            id: 'shield-heart',
            label: 'Shield Heart',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 14.5c-1-1-2-.5-2 0s1.5 2 2 2.5c.5-.5 2-1.5 2-2.5s-1-1-2 0z"/>`)
        },
        {
            id: 'baby-check',
            label: 'Baby',
            svg: (c, s) => wrap(c, s, `<path d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/><path d="m17 17 2 2 3-3"/>`)
        },
        {
            id: 'sparkles-shield',
            label: 'Sparkles Shield',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><polygon points="12 7 13 10 16 10 13.5 12 14.5 15 12 13 9.5 15 10.5 12 8 10 11 10 12 7"/>`)
        },
        {
            id: 'sun-dim',
            label: 'Sun',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="4"/><path d="M12 4h.01M20 12h.01M12 20h.01M4 12h.01M17.65 6.35h.01M17.65 17.65h.01M6.35 17.65h.01M6.35 6.35h.01"/>`)
        },
        {
            id: 'leaf-heart',
            label: 'Leaf Heart',
            svg: (c, s) => wrap(c, s, `<path d="M11 20A7 7 0 0 1 4 13C4 8 9 3 17 2c0 8-5 13-10 13"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/><path d="M14 11.5c-1-1-2-.5-2 0s1.5 2 2 2.5c.5-.5 2-1.5 2-2.5s-1-1-2 0z"/>`)
        },
        {
            id: 'building-bank',
            label: 'Building Bank',
            svg: (c, s) => wrap(c, s, `<line x1="2" y1="20" x2="22" y2="20"/><line x1="6" y1="11" x2="6" y2="16"/><line x1="10" y1="11" x2="10" y2="16"/><line x1="14" y1="11" x2="14" y2="16"/><line x1="18" y1="11" x2="18" y2="16"/><polygon points="12 2 20 7 4 7"/><line x1="1" y1="20" x2="23" y2="20"/>`)
        },
        {
            id: 'scale-balanced',
            label: 'Scale Balanced',
            svg: (c, s) => wrap(c, s, `<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h18"/>`)
        },
        {
            id: 'message-check',
            label: '< Message Check',
            svg: (c, s) => wrap(c, s, `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="m9 10 2 2 4-4"/>`)
        },
        {
            id: 'phone-call-check',
            label: 'Phone Line',
            svg: (c, s) => wrap(c, s, `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/><path d="m14 5 2 2 4-4"/>`)
        },
        {
            id: 'user-heart',
            label: 'User Heart',
            svg: (c, s) => wrap(c, s, `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 11a4 4 0 1 0-4-4"/>`)
        },
        {
            id: 'quote-check',
            label: 'Wuote Check',
            svg: (c, s) => wrap(c, s, `<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="m13 14 2 2 4-4"/>`)
        },
        {
            id: 'sparkle-seal',
            label: 'Sparkle Seal',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="m12 6 1.5 4.5L18 12l-4.5 1.5L12 18l-1.5-4.5L6 12l4.5-1.5Z"/>`)
        },
        {
            id: 'keyhole',
            label: 'Keyhold',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="10" r="3"/><path d="M12 13v4"/><circle cx="12" cy="12" r="10"/>`)
        },
        {
            id: 'badge-minus',
            label: 'Badge Minus',
            svg: (c, s) => wrap(c, s, `<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><line x1="9" y1="12" x2="15" y2="12"/>`)
        },
        {
            id: 'file-text-check',
            label: 'File Check',
            svg: (c, s) => wrap(c, s, `<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9 14 2 2 4-4"/><line x1="8" y1="18" x2="16" y2="18"/>`)
        },
        {
            id: 'shield-round',
            label: 'Shield Round',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="12" r="3"/>`)
        },
        {
            id: 'box-open-check',
            label: 'Layers',
            svg: (c, s) => wrap(c, s, `<path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/><path d="m8 10 2 2 4-4"/>`)
        },
        {
            id: 'shield-lock-gold',
            label: 'Credit Card',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><rect width="6" height="5" x="9" y="10" rx="1"/><path d="M10 10V8.5a2 2 0 0 1 4 0V10"/>`)
        },
        {
            id: 'diamond-star',
            label: 'Diamond',
            svg: (c, s) => wrap(c, s, `<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/>`)
        },
        {
            id: 'badge-check-gold',
            label: 'Badge Check Gold',
            svg: (c, s) => wrap(c, s, `<polygon points="12 2 15 5 19 5 20 9 23 12 20 15 19 19 15 19 12 22 9 19 5 19 4 15 1 12 4 9 5 5 9 5 12 2"/><polyline points="8 12 11 15 16 10" stroke-width="2.5"/>`)
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
        {
            id: 'clock',
            label: 'Same Day Dispatch',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`)
        },
        {
            id: 'plane',
            label: 'Air Express Shipping',
            svg: (c, s) => wrap(c, s, `<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>`)
        },
        {
            id: 'warehouse',
            label: 'Warehouse Stock',
            svg: (c, s) => wrap(c, s, `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`)
        },
        {
            id: 'map-pin',
            label: 'Local Seller Location',
            svg: (c, s) => wrap(c, s, `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>`)
        },
        {
            id: 'navigation',
            label: 'Tracked Courier',
            svg: (c, s) => wrap(c, s, `<polygon points="3 11 22 2 13 21 11 13 3 11"/>`)
        },
        {
            id: 'timer',
            label: 'Urgent Cutoff Timer',
            svg: (c, s) => wrap(c, s, `<line x1="10" y1="2" x2="14" y2="2"/><line x1="12" y1="14" x2="15" y2="11"/><circle cx="12" cy="14" r="8"/>`)
        },
        {
            id: 'calendar',
            label: 'Est. Delivery Date',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`)
        },
        {
            id: 'rotate-cw',
            label: 'Speed Dispatch',
            svg: (c, s) => wrap(c, s, `<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>`)
        },
        {
            id: 'barcode',
            label: 'Scanned Tracking ID',
            svg: (c, s) => wrap(c, s, `<path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/>`)
        },
        {
            id: 'qr-code',
            label: 'Quick Scan Track',
            svg: (c, s) => wrap(c, s, `<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>`)
        },
        {
            id: 'anchor',
            label: 'Sea Freight Cargo',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/>`)
        },
        {
            id: 'compass',
            label: 'Domestic & Global',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>`)
        },
        {
            id: 'send',
            label: 'Direct Ship',
            svg: (c, s) => wrap(c, s, `<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>`)
        },
        {
            id: 'container',
            label: 'Bulk Container',
            svg: (c, s) => wrap(c, s, `<path d="M2 7h20v14H2z"/><path d="M2 12h20"/><path d="M7 7v14"/><path d="M17 7v14"/>`)
        },
        {
            id: 'credit-card',
            label: 'Credit / Debit Cards',
            svg: (c, s) => wrap(c, s, `<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>`)
        },
        {
            id: 'receipt',
            label: 'VAT Invoice Included',
            svg: (c, s) => wrap(c, s, `<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>`)
        },
        {
            id: 'wallet',
            label: 'Instant Checkout',
            svg: (c, s) => wrap(c, s, `<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>`)
        },
        {
            id: 'coins',
            label: 'Cashback & Rewards',
            svg: (c, s) => wrap(c, s, `<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>`)
        },
        {
            id: 'gift',
            label: 'Free Bonus Gift',
            svg: (c, s) => wrap(c, s, `<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>`)
        },
        {
            id: 'shopping-bag',
            label: 'Retail Packaging',
            svg: (c, s) => wrap(c, s, `<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>`)
        },
        {
            id: 'shopping-cart',
            label: 'Multi-Item Basket',
            svg: (c, s) => wrap(c, s, `<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>`)
        },
        {
            id: 'badge-percent',
            label: 'Flash Sale Deal',
            svg: (c, s) => wrap(c, s, `<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="15" x2="15.01" y2="15"/>`)
        },
        {
            id: 'calculator',
            label: 'Finance / Spread Cost',
            svg: (c, s) => wrap(c, s, `<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>`)
        },
        {
            id: 'piggy-bank',
            label: 'Maximum Savings',
            svg: (c, s) => wrap(c, s, `<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><circle cx="16" cy="11" r="1"/>`)
        },
        // ── 25 Additional Product & Shipping Icons ──
        {
            id: 'courier-van',
            label: 'Courier Van',
            svg: (c, s) => wrap(c, s, `<path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L18 8h-4v9h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>`)
        },
        {
            id: 'pallet-cargo',
            label: 'Pallet Freight',
            svg: (c, s) => wrap(c, s, `<path d="M4 18h16"/><path d="M4 14h16"/><path d="M2 21h20"/><rect x="6" y="4" width="12" height="10" rx="1"/><line x1="8" y1="18" x2="8" y2="21"/><line x1="16" y1="18" x2="16" y2="21"/><line x1="12" y1="18" x2="12" y2="21"/>`)
        },
        {
            id: 'forklift',
            label: 'Warehouse Hub',
            svg: (c, s) => wrap(c, s, `<path d="M12 12H5a2 2 0 0 0-2 2v5"/><circle cx="5" cy="19" r="2"/><circle cx="13" cy="19" r="2"/><path d="M8 19h3"/><path d="M14 6v13"/><path d="M14 17h7"/><path d="M14 13h5"/><path d="M7 6h5v6"/>`)
        },
        {
            id: 'cargo-ship',
            label: 'Ocean Vessel',
            svg: (c, s) => wrap(c, s, `<path d="M2 17c.5.5 1.5 1 2.5 1s2-.5 3-.5 2 .5 3 .5 2-.5 3-.5 2 .5 3 .5 2-.5 3-.5 2 .5 2.5 1"/><path d="M4 17l1.5-6h13L20 17"/><path d="M9 11V6h6v5"/><path d="M12 6V3"/>`)
        },
        {
            id: 'train-freight',
            label: 'Rail Cargo',
            svg: (c, s) => wrap(c, s, `<rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/><path d="m8 19-3 3"/><path d="m16 19 3 3"/>`)
        },
        {
            id: 'padded-envelope',
            label: 'Padded Mailer',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m3 7 9 6 9-6"/><line x1="3" y1="18" x2="21" y2="18"/>`)
        },
        {
            id: 'mailbox-drop',
            label: 'Postbox',
            svg: (c, s) => wrap(c, s, `<path d="M6 19v-9a6 6 0 0 1 12 0v9"/><path d="M6 19h12"/><path d="M6 12h12"/><line x1="12" y1="19" x2="12" y2="23"/>`)
        },
        {
            id: 'doorstep-drop',
            label: 'Doorstep Drop',
            svg: (c, s) => wrap(c, s, `<path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"/><path d="M2 20h20"/><circle cx="14" cy="12" r="1"/><rect x="9" y="14" width="6" height="6" rx="1"/>`)
        },
        {
            id: 'parcel-locker',
            label: 'Locker Drop',
            svg: (c, s) => wrap(c, s, `<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="16" x2="20" y2="16"/><circle cx="8" cy="5.5" r=".5" fill="currentColor"/><circle cx="8" cy="12.5" r=".5" fill="currentColor"/><circle cx="8" cy="19.5" r=".5" fill="currentColor"/>`)
        },
        {
            id: 'postal-stamp',
            label: 'Postal Stamp',
            svg: (c, s) => wrap(c, s, `<path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><circle cx="12" cy="12" r="4"/><path d="m14 10-4 4"/>`)
        },
        {
            id: 'shipping-label',
            label: 'Thermal Label',
            svg: (c, s) => wrap(c, s, `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/>`)
        },
        {
            id: 'packing-slip',
            label: 'Packing Slip',
            svg: (c, s) => wrap(c, s, `<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/><path d="m14 16 2 2 4-4"/>`)
        },
        {
            id: 'signature-req',
            label: 'Signature Req',
            svg: (c, s) => wrap(c, s, `<path d="m18 2 4 4-14 14H4v-4z"/><path d="M14.5 5.5l4 4"/><path d="M3 21h18"/>`)
        },
        {
            id: 'fragile-glass',
            label: 'Fragile Glass',
            svg: (c, s) => wrap(c, s, `<path d="M8 2h8l2 7a6 6 0 0 1-6 6v5h4v2H8v-2h4v-5a6 6 0 0 1-6-6z"/><line x1="12" y1="5" x2="10" y2="8"/>`)
        },
        {
            id: 'this-side-up',
            label: 'This Side Up',
            svg: (c, s) => wrap(c, s, `<path d="M7 11V4"/><path d="m4 7 3-3 3 3"/><path d="M17 11V4"/><path d="m14 7 3-3 3 3"/><line x1="3" y1="18" x2="21" y2="18"/>`)
        },
        {
            id: 'keep-dry',
            label: 'Keep Dry',
            svg: (c, s) => wrap(c, s, `<path d="M12 2a8 8 0 0 0-8 8h16a8 8 0 0 0-8-8z"/><path d="M12 10v9a3 3 0 0 0 6 0"/><circle cx="6" cy="4" r=".5" fill="currentColor"/><circle cx="18" cy="4" r=".5" fill="currentColor"/>`)
        },
        {
            id: 'cold-chain',
            label: 'Cold Chain',
            svg: (c, s) => wrap(c, s, `<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/><path d="M18 10h4M2 10h4M12 2v2M12 20v2"/>`)
        },
        {
            id: 'weight-spec',
            label: 'Weight Spec',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="5" r="3"/><path d="M6 9h12l2 11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><circle cx="12" cy="15" r="1" fill="currentColor"/>`)
        },
        {
            id: 'letterbox-size',
            label: 'Letterbox Size',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="7" width="20" height="10" rx="2"/><line x1="6" y1="12" x2="18" y2="12"/><path d="m10 9 2 3-2 3"/>`)
        },
        {
            id: 'gps-live-track',
            label: 'Live GPS',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>`)
        },
        {
            id: 'timer-1pm',
            label: 'Next Day 1PM',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 14.5 9.5"/><path d="M7 3 4 5M17 3l3 2"/>`)
        },
        {
            id: 'customs-pass',
            label: 'Customs Pass',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/><polyline points="9 12 11 14 15 10"/>`)
        },
        {
            id: 'tamper-tape',
            label: 'Tamper Tape',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="8" width="18" height="8" rx="1"/><line x1="3" y1="12" x2="21" y2="12" stroke-dasharray="2 2"/><rect x="10" y="5" width="4" height="4" rx="1"/>`)
        },
        {
            id: 'combined-ship',
            label: 'Combined Post',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="4" width="10" height="8" rx="1"/><rect x="12" y="12" width="10" height="8" rx="1"/><path d="m8 16 8-8"/>`)
        },
        {
            id: 'transit-insured',
            label: 'Insured Post',
            svg: (c, s) => wrap(c, s, `<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/><path d="m6 9 2 2 3-3"/>`)
        },
        // ── 20 Advanced Shipping & Delivery Icons ──
        {
            id: 'click-collect',
            label: 'Click & Collect',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="10" r="2.5"/><path d="m10 16 2-2 2 2"/><path d="M12 14v4"/>`)
        },
        {
            id: 'weekend-ship',
            label: 'Weekend Post',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/>`)
        },
        {
            id: 'discreet-box',
            label: 'Discreet Box',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M2 12s3-5 10-5 10 5 10 5-3 5-10 5-10-5-10-5Z"/><line x1="2" y1="2" x2="22" y2="22"/>`)
        },
        {
            id: 'two-man-lift',
            label: '2-Man Lift',
            svg: (c, s) => wrap(c, s, `<circle cx="6" cy="6" r="2"/><path d="M3 13v-2a2 2 0 0 1 2-2h2"/><circle cx="18" cy="6" r="2"/><path d="M19 13v-2a2 2 0 0 0-2-2h-2"/><rect x="8" y="11" width="8" height="10" rx="1"/>`)
        },
        {
            id: 'tube-mailer',
            label: 'Postal Tube',
            svg: (c, s) => wrap(c, s, `<ellipse cx="6" cy="12" rx="3" ry="8"/><path d="M6 4h12c1.66 0 3 3.58 3 8s-1.34 8-3 8H6"/>`)
        },
        {
            id: 'free-postage',
            label: 'Free Shipping',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/><circle cx="12" cy="12" r="6"/>`)
        },
        {
            id: 'delivery-sms',
            label: 'Delivery SMS',
            svg: (c, s) => wrap(c, s, `<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/><path d="m9 9 2 2 4-4"/>`)
        },
        {
            id: 'drop-photo',
            label: 'Photo Proof',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><circle cx="17.5" cy="8.5" r=".5" fill="currentColor"/><path d="m9 15 2 2 4-4"/>`)
        },
        {
            id: 'fast-dispatch',
            label: 'Instant Ship',
            svg: (c, s) => wrap(c, s, `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/><line x1="18" y1="4" x2="22" y2="4"/><line x1="19" y1="8" x2="23" y2="8"/>`)
        },
        {
            id: 'store-pickup',
            label: 'Trade Counter',
            svg: (c, s) => wrap(c, s, `<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 10h6"/><path d="M9 14h6"/><path d="M9 18h6"/>`)
        },
        {
            id: 'prepaid-label',
            label: 'Return Label',
            svg: (c, s) => wrap(c, s, `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="8 14 12 10 16 14"/><line x1="12" y1="10" x2="12" y2="18"/>`)
        },
        {
            id: 'night-express',
            label: 'Overnight',
            svg: (c, s) => wrap(c, s, `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M16 18h5"/><path d="m19 15 3 3-3 3"/>`)
        },
        {
            id: 'oversized-cargo',
            label: 'Bulky Freight',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="5" width="18" height="14" rx="2"/><line x1="8" y1="5" x2="8" y2="19"/><line x1="16" y1="5" x2="16" y2="19"/><line x1="3" y1="12" x2="21" y2="12"/>`)
        },
        {
            id: 'poly-mailer',
            label: 'Waterproof Bag',
            svg: (c, s) => wrap(c, s, `<path d="M4 6h16v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z"/><path d="M4 6l8 4 8-4"/><circle cx="12" cy="15" r="1.5"/>`)
        },
        {
            id: 'bubble-cushion',
            label: 'Foam Padded',
            svg: (c, s) => wrap(c, s, `<circle cx="8" cy="8" r="2.5"/><circle cx="16" cy="8" r="2.5"/><circle cx="12" cy="14" r="2.5"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>`)
        },
        {
            id: 'address-checked',
            label: 'Verified Post',
            svg: (c, s) => wrap(c, s, `<path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><path d="m9 10 2 2 4-4"/>`)
        },
        {
            id: 'tracking-link',
            label: 'Live Tracking',
            svg: (c, s) => wrap(c, s, `<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>`)
        },
        {
            id: 'duty-prepaid',
            label: 'Duty Paid',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 15h4a1.5 1.5 0 0 0 0-3H8v6"/><polyline points="15 13 17 15 21 11"/>`)
        },
        {
            id: 'kraft-eco',
            label: 'Kraft Box',
            svg: (c, s) => wrap(c, s, `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M12 12v10"/><path d="M9 13.5 4 11"/><path d="M15 13.5l5-2.5"/>`)
        },
        {
            id: 'gsp-hub',
            label: 'eBay GSP Hub',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="m15 9-3-3-3 3"/><path d="M12 6v12"/>`)
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
            id: 'settings',
            label: 'Settings / Gear',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>`)
        },
        {
            id: 'wifi',
            label: 'Wireless / WiFi',
            svg: (c, s) => wrap(c, s, `<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>`)
        },
        {
            id: 'screwdriver',
            label: 'Precision Screwdriver',
            svg: (c, s) => wrap(c, s, `<path d="m18 15-6-6"/><path d="m21.5 5.5-3-3-4 4 3 3 4-4z"/><path d="M14.5 12.5 3 24l-1-1 11.5-11.5"/>`)
        },
        {
            id: 'hammer',
            label: 'Heavy Duty Durability',
            svg: (c, s) => wrap(c, s, `<path d="m15 12-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 3.26-6 6"/><path d="m18.5 8.5 2.5-2.5"/>`)
        },
        {
            id: 'car',
            label: 'Auto / Vehicle Fit',
            svg: (c, s) => wrap(c, s, `<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>`)
        },
        {
            id: 'fuel',
            label: 'Fuel Economy / Gas',
            svg: (c, s) => wrap(c, s, `<line x1="3" y1="22" x2="15" y2="22"/><rect x="4" y="9" width="10" height="13" rx="1"/><path d="M14 9V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4"/><path d="M14 13h2a2 2 0 0 1 2 2v3a1 1 0 0 0 1 1h1"/>`)
        },
        {
            id: 'construction',
            label: 'Industrial Grade',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="6" width="20" height="8" rx="1"/><path d="M17 14v7"/><path d="M7 14v7"/><path d="M17 3v3"/><path d="M7 3v3"/><path d="M10 14 2.3 6.3"/><path d="m14 6 7.7 7.7"/><path d="m8 6 8 8"/>`)
        },
        {
            id: 'drill',
            label: 'Power Tool Motor',
            svg: (c, s) => wrap(c, s, `<path d="M14 9V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2Z"/><path d="M18 7h4"/><path d="M14 11l4 8h-4l-3-6"/>`)
        },
        {
            id: 'disc',
            label: 'Brake Disc / Rotor',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>`)
        },
        {
            id: 'magnet',
            label: 'Magnetic Clamp',
            svg: (c, s) => wrap(c, s, `<path d="m6 15-4-4 6.7-6.7a5.5 5.5 0 0 1 7.8 0l1.2 1.2a5.5 5.5 0 0 1 0 7.8L11 20l-4-4"/><path d="m9 9 4 4"/><path d="m4 13 4 4"/>`)
        },
        {
            id: 'anchor-hardware',
            label: 'Heavy Anchor Bolt',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/>`)
        },
        {
            id: 'box-select',
            label: 'Exact Dimensions',
            svg: (c, s) => wrap(c, s, `<path d="M5 3a2 2 0 0 0-2 2"/><path d="M19 3a2 2 0 0 1 2 2"/><path d="M21 19a2 2 0 0 1-2 2"/><path d="M5 21a2 2 0 0 1-2-2"/><path d="M9 3h1"/><path d="M9 21h1"/><path d="M14 3h1"/><path d="M14 21h1"/><path d="M3 9v1"/><path d="M21 9v1"/><path d="M3 14v1"/><path d="M21 14v1"/>`)
        },
        {
            id: 'layers',
            label: 'Multi-Layer Protection',
            svg: (c, s) => wrap(c, s, `<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>`)
        },
        // ── 25 Additional Tech & Performance Icons ──
        {
            id: 'bluetooth-tech',
            label: 'Bluetooth',
            svg: (c, s) => wrap(c, s, `<path d="m7 7 10 10-5 5V2l5 5L7 17"/>`)
        },
        {
            id: 'usb-c-cable',
            label: 'USB-C Fast',
            svg: (c, s) => wrap(c, s, `<rect x="4" y="6" width="16" height="12" rx="6"/><circle cx="9" cy="12" r="1.5" fill="currentColor"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/>`)
        },
        {
            id: 'battery-max',
            label: 'Battery Life',
            svg: (c, s) => wrap(c, s, `<rect width="16" height="10" x="2" y="7" rx="2"/><line x1="22" x2="22" y1="11" y2="13"/><line x1="6" x2="6" y1="10" y2="14"/><line x1="10" x2="10" y1="10" y2="14"/><line x1="14" x2="14" y1="10" y2="14"/>`)
        },
        {
            id: 'nvme-ssd',
            label: 'Fast SSD',
            svg: (c, s) => wrap(c, s, `<rect width="18" height="14" x="3" y="5" rx="2"/><line x1="7" y1="15" x2="7.01" y2="15"/><line x1="10" y1="15" x2="10.01" y2="15"/><line x1="3" y1="11" x2="21" y2="11"/>`)
        },
        {
            id: 'ram-memory',
            label: 'DDR Memory',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="8" width="20" height="8" rx="1"/><line x1="6" y1="16" x2="6" y2="19"/><line x1="10" y1="16" x2="10" y2="19"/><line x1="14" y1="16" x2="14" y2="19"/><line x1="18" y1="16" x2="18" y2="19"/><circle cx="7" cy="12" r="1"/><circle cx="17" cy="12" r="1"/>`)
        },
        {
            id: 'display-4k',
            label: '4K Ultra HD',
            svg: (c, s) => wrap(c, s, `<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>`)
        },
        {
            id: 'cooling-fan',
            label: 'Cooling Fan',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="3"/><path d="M12 9C10.5 5 13 2 15 3.5s0 4.5-3 5.5Z"/><path d="M15 12c4 1.5 7-1 5.5-3s-4.5 0-5.5 3Z"/><path d="M12 15c1.5 4-1 7-3 5.5s0-4.5 3-5.5Z"/><path d="M9 12c-4-1.5-7 1-5.5 3s4.5 0 5.5-3Z"/>`)
        },
        {
            id: 'noise-cancelling',
            label: 'Noise Cancel',
            svg: (c, s) => wrap(c, s, `<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>`)
        },
        {
            id: 'camera-sensor',
            label: 'HD Lens',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="2" x2="12" y2="6"/>`)
        },
        {
            id: 'studio-mic',
            label: 'Studio Audio',
            svg: (c, s) => wrap(c, s, `<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>`)
        },
        {
            id: 'surge-guard',
            label: 'Surge Guard',
            svg: (c, s) => wrap(c, s, `<path d="M12 2v6"/><path d="m4.93 10.93 4.24-4.24"/><path d="M2 18h6"/><path d="M20 18h2"/><path d="m19.07 10.93-4.24-4.24"/><circle cx="12" cy="18" r="4"/><path d="m10 18 2 2 2-2"/>`)
        },
        {
            id: 'rgb-led',
            label: 'RGB Light',
            svg: (c, s) => wrap(c, s, `<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>`)
        },
        {
            id: 'touch-response',
            label: 'Touchscreen',
            svg: (c, s) => wrap(c, s, `<path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v7"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M6 14v1a7 7 0 0 0 14 0v-3a2 2 0 0 0-2-2h-4"/>`)
        },
        {
            id: 'solar-charge',
            label: 'Solar Power',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="6" width="18" height="12" rx="1"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="9" y1="6" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="18"/><line x1="12" y1="2" x2="12" y2="4"/>`)
        },
        {
            id: 'obd-diagnostic',
            label: 'OBD2 Scanner',
            svg: (c, s) => wrap(c, s, `<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8"/><path d="M8 13h5"/><polyline points="15 17 17 15 19 17"/>`)
        },
        {
            id: 'laser-level',
            label: 'Laser Line',
            svg: (c, s) => wrap(c, s, `<line x1="3" y1="12" x2="21" y2="12" stroke-dasharray="2 2"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="5" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="19"/>`)
        },
        {
            id: 'rpm-speedometer',
            label: 'High RPM',
            svg: (c, s) => wrap(c, s, `<path d="m12 14 3-3"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/><line x1="12" y1="6" x2="12" y2="8"/><line x1="6" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="18" y2="12"/>`)
        },
        {
            id: 'coil-suspension',
            label: 'Suspension',
            svg: (c, s) => wrap(c, s, `<path d="M7 3h10"/><path d="M12 3v4"/><path d="m7 7 10 3-10 3 10 3-10 3 10 3"/><path d="M12 22v-3"/><path d="M7 22h10"/>`)
        },
        {
            id: 'turbo-boost',
            label: 'Turbo Boost',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="8"/><path d="M12 12a4 4 0 1 0 4 4"/><path d="M16 8h5v5"/><path d="M12 4v4"/>`)
        },
        {
            id: 'mech-keyboard',
            label: 'Mech Switch',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01"/><path d="M12 10h.01"/><path d="M17 10h.01"/><path d="M7 14h10"/>`)
        },
        {
            id: 'ergo-grip',
            label: 'Ergo Grip',
            svg: (c, s) => wrap(c, s, `<path d="M7 11V7a5 5 0 0 1 10 0v4"/><line x1="12" y1="11" x2="12" y2="17"/><path d="M8 21h8"/><path d="M12 17v4"/>`)
        },
        {
            id: 'metal-alloy',
            label: 'Alloy Frame',
            svg: (c, s) => wrap(c, s, `<polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="12"/><line x1="2" y1="8.5" x2="12" y2="12"/><line x1="22" y1="8.5" x2="12" y2="12"/>`)
        },
        {
            id: 'radio-antenna',
            label: 'Long Range',
            svg: (c, s) => wrap(c, s, `<path d="M2 12a10 10 0 0 1 20 0"/><path d="M6 12a6 6 0 0 1 12 0"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="14" x2="12" y2="22"/>`)
        },
        {
            id: 'low-latency',
            label: 'Zero Lag',
            svg: (c, s) => wrap(c, s, `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/><path d="m15 9 3-3"/><path d="m17 14 4-4"/>`)
        },
        {
            id: 'water-ipx7',
            label: 'IPX7 Water',
            svg: (c, s) => wrap(c, s, `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="M9 13a3 3 0 0 0 6 0"/>`)
        },
        // ── 20 Advanced Hardware, PC & Auto Performance Icons ──
        {
            id: 'gpu-card',
            label: 'GPU Card',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2.5"/><circle cx="16" cy="12" r="2.5"/><line x1="6" y1="19" x2="18" y2="19"/>`)
        },
        {
            id: 'liquid-cool',
            label: 'Liquid Cool',
            svg: (c, s) => wrap(c, s, `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="M12 12c-1.5 1-1.5 3 0 4s1.5-3 0-4Z"/>`)
        },
        {
            id: 'overclock-chip',
            label: 'Overclock',
            svg: (c, s) => wrap(c, s, `<rect x="4" y="4" width="16" height="16" rx="2"/><polygon points="13 7 9 12 12 12 11 17 15 12 12 12 13 7"/>`)
        },
        {
            id: 'hdmi-port',
            label: 'HDMI 2.1',
            svg: (c, s) => wrap(c, s, `<path d="M4 7h16v6l-2 4H6l-2-4V7z"/><line x1="8" y1="11" x2="16" y2="11"/>`)
        },
        {
            id: 'smart-app',
            label: 'Smart App',
            svg: (c, s) => wrap(c, s, `<rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="18" r="1"/><path d="M9 7h6M9 11h6"/>`)
        },
        {
            id: 'psu-power',
            label: 'PSU Unit',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="12" r="3"/><line x1="15" y1="8" x2="18" y2="8"/><line x1="15" y1="12" x2="18" y2="12"/><line x1="15" y1="16" x2="18" y2="16"/>`)
        },
        {
            id: 'brushless-motor',
            label: 'Brushless',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="21"/><line x1="3" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="21" y2="12"/>`)
        },
        {
            id: 'torque-spec',
            label: 'Torque Spec',
            svg: (c, s) => wrap(c, s, `<path d="M21 7.5V4h-3.5L14 7.5 16.5 10l4.5-2.5z"/><path d="m14 7.5-9 9a2.12 2.12 0 0 0 3 3l9-9"/><circle cx="6.5" cy="18" r="1.5"/>`)
        },
        {
            id: 'pneumatic-air',
            label: 'Pneumatic',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="9" r="6"/><path d="m12 9 3-3"/><path d="M12 15v6"/><path d="M8 21h8"/>`)
        },
        {
            id: 'high-lumen',
            label: 'High Lumen',
            svg: (c, s) => wrap(c, s, `<path d="M18 6 6 18"/><path d="m2 12 5-5 7 7-5 5-7-7z"/><line x1="18" y1="2" x2="22" y2="6"/><line x1="15" y1="9" x2="19" y2="13"/>`)
        },
        {
            id: 'subwoofer-bass',
            label: 'Bass Boost',
            svg: (c, s) => wrap(c, s, `<rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="14" r="5"/><circle cx="12" cy="14" r="1"/><circle cx="12" cy="6" r="1.5"/>`)
        },
        {
            id: 'thermal-paste',
            label: 'Heatsink',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="16" width="18" height="5" rx="1"/><path d="M6 16V8M10 16V8M14 16V8M18 16V8"/><path d="M4 8h16"/>`)
        },
        {
            id: 'voltmeter-test',
            label: 'Multimeter',
            svg: (c, s) => wrap(c, s, `<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="14" r="3"/><line x1="12" y1="14" x2="14" y2="12"/><line x1="8" y1="7" x2="16" y2="7"/>`)
        },
        {
            id: 'soldering-tool',
            label: 'Soldering',
            svg: (c, s) => wrap(c, s, `<path d="m14 4 6 6"/><path d="m17 7-9 9-4 1 1-4 9-9z"/><path d="m2 22 3-3"/>`)
        },
        {
            id: 'heat-shrink',
            label: 'Heat Tool',
            svg: (c, s) => wrap(c, s, `<path d="M14 6H8a2 2 0 0 0-2 2v4h8l4-4V6z"/><path d="M10 12v7a2 2 0 0 0 2 2h2"/><line x1="4" y1="10" x2="2" y2="10"/>`)
        },
        {
            id: 'exhaust-flow',
            label: 'Exhaust Flow',
            svg: (c, s) => wrap(c, s, `<path d="M3 12h11a3 3 0 0 0 3-3V7a3 3 0 0 1 3-3h1"/><path d="M3 16h11a3 3 0 0 1 3 3v1"/><line x1="2" y1="8" x2="6" y2="8"/>`)
        },
        {
            id: 'gear-shift',
            label: 'Gear Shift',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="6" r="3"/><path d="M12 9v11"/><path d="M8 12h8"/><path d="M8 12v3"/><path d="M16 12v-3"/>`)
        },
        {
            id: 'tpms-sensor',
            label: 'Tire TPMS',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="8" stroke-dasharray="3 3"/><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>`)
        },
        {
            id: 'amplifier-sound',
            label: 'Hi-Fi Amp',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="8" cy="12" r="2.5"/><line x1="14" y1="10" x2="18" y2="10"/><line x1="14" y1="14" x2="16" y2="14"/>`)
        },
        {
            id: 'ir-remote',
            label: 'IR Remote',
            svg: (c, s) => wrap(c, s, `<rect x="6" y="2" width="12" height="20" rx="3"/><circle cx="12" cy="5" r="1"/><circle cx="10" cy="10" r=".7" fill="currentColor"/><circle cx="14" cy="10" r=".7" fill="currentColor"/><circle cx="12" cy="15" r="2"/>`)
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
        {
            id: 'feather',
            label: 'Ultralight Weight',
            svg: (c, s) => wrap(c, s, `<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/>`)
        },
        {
            id: 'sparkles',
            label: 'Pristine Condition',
            svg: (c, s) => wrap(c, s, `<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>`)
        },
        {
            id: 'diamond',
            label: 'Scratch Safe',
            svg: (c, s) => wrap(c, s, `<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l4 12 4-12-3-6"/><path d="M2 9h20"/>`)
        },
        {
            id: 'shirt',
            label: 'Apparel',
            svg: (c, s) => wrap(c, s, `<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>`)
        },
        {
            id: 'watch',
            label: 'Watch',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 13.5 13.5"/><path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"/>`)
        },
        {
            id: 'glasses',
            label: 'Eyewear',
            svg: (c, s) => wrap(c, s, `<circle cx="6" cy="15" r="4"/><circle cx="18" cy="15" r="4"/><path d="M14 15a2 2 0 0 0-4 0"/><path d="M2.5 13 5 7c.7-1.3 1.4-2 3-2"/><path d="M21.5 13 19 7c-.7-1.3-1.5-2-3-2"/>`)
        },
        {
            id: 'palette',
            label: 'Color',
            svg: (c, s) => wrap(c, s, `<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>`)
        },
        {
            id: 'ruler',
            label: 'Scale',
            svg: (c, s) => wrap(c, s, `<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>`)
        },
        {
            id: 'umbrella',
            label: 'Rainproofc',
            svg: (c, s) => wrap(c, s, `<path d="M22 12a10.06 10.06 0 0 0-20 0Z"/><path d="M12 12v8a2 2 0 0 0 4 0"/><path d="M12 2v1"/>`)
        },
        {
            id: 'wind',
            label: 'Material',
            svg: (c, s) => wrap(c, s, `<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>`)
        },
        {
            id: 'sparkle-gold',
            label: 'Plated',
            svg: (c, s) => wrap(c, s, `<polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9 12 2"/>`)
        },
        {
            id: 'info',
            label: 'Info',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>`)
        },
        {
            id: 'check-circle-2',
            label: 'Checked',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>`)
        },
        // ── 25 Additional Lifestyle & Nature Icons ──
        {
            id: 'mountain',
            label: 'Mountain',
            svg: (c, s) => wrap(c, s, `<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>`)
        },
        {
            id: 'tent',
            label: 'Camping Tent',
            svg: (c, s) => wrap(c, s, `<path d="M19 20 10 4 1 20h18z"/><path d="m14 20-4-7-4 7"/><path d="M10 4v16"/>`)
        },
        {
            id: 'trees',
            label: 'Forest Trees',
            svg: (c, s) => wrap(c, s, `<path d="m8 14-4-4h3L4 6h3L5 2h6l-2 4h3l-3 4h3l-4 4"/><line x1="8" y1="14" x2="8" y2="20"/><path d="m16 16-3-3h2l-2-3h2l-2-3h4l-1 3h2l-2 3h2l-3 3"/><line x1="16" y1="16" x2="16" y2="20"/>`)
        },
        {
            id: 'flower',
            label: 'Flower',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="3"/><path d="M12 2a4 4 0 0 0-4 4 4 4 0 0 0 8 0 4 4 0 0 0-4-4zm0 12a4 4 0 0 0-4 4 4 4 0 0 0 8 0 4 4 0 0 0-4-4zm10-4a4 4 0 0 0-4-4 4 4 0 0 0 0 8 4 4 0 0 0 4-4zM6 10a4 4 0 0 0-4-4 4 4 0 0 0 0 8 4 4 0 0 0 4-4z"/>`)
        },
        {
            id: 'snowflake',
            label: 'Snowflake',
            svg: (c, s) => wrap(c, s, `<line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/>`)
        },
        {
            id: 'cloud-sun',
            label: 'Daylight',
            svg: (c, s) => wrap(c, s, `<path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.95 9A6 6 0 0 0 6 13a4 4 0 0 0 1 7.75H17a5 5 0 0 0 4.95-4.5A6 6 0 0 0 15.95 9Z"/>`)
        },
        {
            id: 'coffee',
            label: 'Coffee Mug',
            svg: (c, s) => wrap(c, s, `<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>`)
        },
        {
            id: 'dumbbell',
            label: 'Dumbbell',
            svg: (c, s) => wrap(c, s, `<path d="m6.5 6.5 11 11"/><path d="m21 21-1-1a2 2 0 0 0-2.8 0L16 21"/><path d="m3 3 1 1a2 2 0 0 0 2.8 0L8 3"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m15 15 3 3"/><path d="m6 6 3 3"/>`)
        },
        {
            id: 'bicycle',
            label: 'Bicycle',
            svg: (c, s) => wrap(c, s, `<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L9 11l4-5h3"/><path d="M12 17.5V14l-3-3 4-4"/>`)
        },
        {
            id: 'hiking-boot',
            label: 'Hiking Boot',
            svg: (c, s) => wrap(c, s, `<path d="M4 17h16v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3z"/><path d="M4 17V5l5 2v4l5 1 4 2v3"/><line x1="7" y1="10" x2="9" y2="10"/><line x1="8" y1="13" x2="11" y2="13"/>`)
        },
        {
            id: 'music-note',
            label: 'Music',
            svg: (c, s) => wrap(c, s, `<circle cx="8" cy="18" r="3"/><circle cx="19" cy="15" r="3"/><path d="M11 18V6l10-2v11"/><path d="M11 10l10-2"/>`)
        },
        {
            id: 'camera',
            label: 'Camera',
            svg: (c, s) => wrap(c, s, `<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>`)
        },
        {
            id: 'paw-pet',
            label: 'Pet Paw',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="16" r="3"/><circle cx="7" cy="10" r="1.5"/><circle cx="17" cy="10" r="1.5"/><circle cx="10" cy="6" r="1.5"/><circle cx="14" cy="6" r="1.5"/>`)
        },
        {
            id: 'fish-marine',
            label: 'Fish Angler',
            svg: (c, s) => wrap(c, s, `<path d="M2 16s9-14 20-4c-11 10-20-4-20-4z"/><path d="M18 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0z"/><path d="M2 16l4-4-4-4"/>`)
        },
        {
            id: 'backpack',
            label: 'Backpack',
            svg: (c, s) => wrap(c, s, `<path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10z"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M8 12h8"/><path d="M9 16h6"/>`)
        },
        {
            id: 'artisan-craft',
            label: 'Handcrafted',
            svg: (c, s) => wrap(c, s, `<path d="m15 4 5 5-9 9H6v-5l9-9z"/><line x1="18.5" y1="2.5" x2="21.5" y2="5.5"/><circle cx="5" cy="19" r="1" fill="currentColor"/>`)
        },
        {
            id: 'sewing-needle',
            label: 'Tailor Stitch',
            svg: (c, s) => wrap(c, s, `<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>`)
        },
        {
            id: 'apple-organic',
            label: 'Organic',
            svg: (c, s) => wrap(c, s, `<path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/>`)
        },
        {
            id: 'wine-glass',
            label: 'Gourmet Wine',
            svg: (c, s) => wrap(c, s, `<path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5c0-4-.5-7-5-7s-5 3-5 7a5 5 0 0 0 5 5Z"/>`)
        },
        {
            id: 'ring-jewelry',
            label: 'Jewelry',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="15" r="6"/><polygon points="12 3 15 6 12 9 9 6 12 3"/>`)
        },
        {
            id: 'hat-cap',
            label: 'Headwear',
            svg: (c, s) => wrap(c, s, `<path d="M2 17h20"/><path d="M4 17a8 8 0 0 1 16 0"/><path d="M12 9V5"/>`)
        },
        {
            id: 'bed-comfort',
            label: 'Bedding',
            svg: (c, s) => wrap(c, s, `<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><circle cx="7" cy="12" r="2"/>`)
        },
        {
            id: 'bath-spa',
            label: 'Spa Bath',
            svg: (c, s) => wrap(c, s, `<path d="M9 6h6"/><path d="M12 3v3"/><path d="M4 11h16a1 1 0 0 1 1 1v2a7 7 0 0 1-7 7H10a7 7 0 0 1-7-7v-2a1 1 0 0 1 1-1z"/><path d="m6 19-2 2"/><path d="m18 19 2 2"/>`)
        },
        {
            id: 'sofa-lounge',
            label: 'Home Decor',
            svg: (c, s) => wrap(c, s, `<path d="M4 11V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><rect x="2" y="11" width="20" height="7" rx="2"/><path d="M4 18v2"/><path d="M20 18v2"/>`)
        },
        {
            id: 'compass-rose',
            label: 'Orienteering',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><polygon points="12 4 14 10 20 12 14 14 12 20 10 14 4 12 10 10 12 4"/>`)
        },
        // ── 20 Additional Lifestyle, Garden, Pet & Home Icons ──
        {
            id: 'plant-sprout',
            label: 'Plant Sprout',
            svg: (c, s) => wrap(c, s, `<path d="M7 20h10"/><path d="M10 20c0-4 2-7 5-7h1a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4h-1c-4 0-7 3-7 7v9"/><path d="M4 11c0 3 2 5 5 5"/>`)
        },
        {
            id: 'campfire',
            label: 'Campfire',
            svg: (c, s) => wrap(c, s, `<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/><path d="m4 21 16-4"/><path d="m20 21-16-4"/>`)
        },
        {
            id: 'binoculars',
            label: 'Binoculars',
            svg: (c, s) => wrap(c, s, `<path d="M10 10h4"/><path d="M19 7V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/><path d="M9 7V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3"/><circle cx="7" cy="15" r="4"/><circle cx="17" cy="15" r="4"/>`)
        },
        {
            id: 'water-bottle',
            label: 'Hydration',
            svg: (c, s) => wrap(c, s, `<path d="M9 2h6v3H9z"/><path d="M7 8h10v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8z"/><path d="M7 8l2-3h6l2 3"/>`)
        },
        {
            id: 'suitcase-travel',
            label: 'Suitcase',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="15"/><line x1="14" y1="11" x2="14" y2="15"/>`)
        },
        {
            id: 'sunglasses-uv',
            label: 'Sunglasses',
            svg: (c, s) => wrap(c, s, `<path d="M2 10h20"/><circle cx="6" cy="15" r="3.5"/><circle cx="18" cy="15" r="3.5"/><path d="M9.5 15a2.5 2.5 0 0 1 5 0"/>`)
        },
        {
            id: 'stopwatch-run',
            label: 'Stopwatch',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="14" r="8"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="10" x2="12" y2="14"/><line x1="10" y1="2" x2="14" y2="2"/>`)
        },
        {
            id: 'pet-bone',
            label: 'Pet Care',
            svg: (c, s) => wrap(c, s, `<path d="M17 10c.7-.7 1.6-1 2.5-1a2.5 2.5 0 1 1 0 5c-.9 0-1.8-.3-2.5-1l-10 1c-.7.7-1 1.6-1 2.5a2.5 2.5 0 1 1-5 0c0-.9.3-1.8 1-2.5l1-10c-.7-.7-1-1.6-1-2.5a2.5 2.5 0 1 1 5 0c0 .9-.3 1.8-1 2.5z"/>`)
        },
        {
            id: 'bird-fauna',
            label: 'Fauna Bird',
            svg: (c, s) => wrap(c, s, `<path d="M16 7h.01"/><path d="M3.4 18c3.1 0 6.6-1.5 8.6-4.5 1.5-2.2 3.5-3.5 6-3.5 1 0 2 .2 3 .7.5-2-1.5-4.7-4-4.7-2.5 0-4.5 2-4.5 4.5 0 .3 0 .7.1 1-2 0-4.1 1-5.6 2.5L3.4 18z"/>`)
        },
        {
            id: 'perfume-bottle',
            label: 'Fragrance',
            svg: (c, s) => wrap(c, s, `<rect x="5" y="8" width="14" height="14" rx="3"/><path d="M10 4h4v4h-4z"/><circle cx="12" cy="15" r="2.5"/>`)
        },
        {
            id: 'candle-aroma',
            label: 'Candle',
            svg: (c, s) => wrap(c, s, `<rect x="6" y="10" width="12" height="12" rx="2"/><path d="M12 4c1 1.5 1.5 2.5 1.5 3.5a1.5 1.5 0 1 1-3 0C10.5 6.5 11 5.5 12 4Z"/>`)
        },
        {
            id: 'tea-cup',
            label: 'Herbal Tea',
            svg: (c, s) => wrap(c, s, `<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v7a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/>`)
        },
        {
            id: 'chef-hat',
            label: 'Cooking Chef',
            svg: (c, s) => wrap(c, s, `<path d="M6 18h12v3H6z"/><path d="M6 18a4 4 0 0 1-2-7.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 3.5A4 4 0 0 1 18 18"/>`)
        },
        {
            id: 'cutlery-fork',
            label: 'Cutlery',
            svg: (c, s) => wrap(c, s, `<path d="M18 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v8"/><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/>`)
        },
        {
            id: 'guitar-music',
            label: 'Guitar',
            svg: (c, s) => wrap(c, s, `<path d="m19 5 2 2-3 3-2-2z"/><path d="m16 8-6 6"/><circle cx="7" cy="17" r="4"/><circle cx="7" cy="17" r="1.5"/>`)
        },
        {
            id: 'paintbrush-art',
            label: 'Paintbrush',
            svg: (c, s) => wrap(c, s, `<path d="m14 12 6-6-3-3-6 6"/><path d="M12.5 13.5 7 19c-1.5 1.5-3.5 1-4-1s.5-2.5 2-4l5.5-5.5"/>`)
        },
        {
            id: 'book-reading',
            label: 'Open Book',
            svg: (c, s) => wrap(c, s, `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>`)
        },
        {
            id: 'lotus-yoga',
            label: 'Yoga Lotus',
            svg: (c, s) => wrap(c, s, `<path d="M12 3c-2 4-2 9 0 13 2-4 2-9 0-13Z"/><path d="M7 8c1 4 3 7 5 8-4-1-6-4-5-8Z"/><path d="M17 8c-1 4-3 7-5 8 4-1 6-4 5-8Z"/><path d="M3 15c3 1 6 1 9 1-4 1-7 0-9-1Z"/><path d="M21 15c-3 1-6 1-9 1 4 1 7 0 9-1Z"/>`)
        },
        {
            id: 'apple-fruit',
            label: 'Fresh Fruit',
            svg: (c, s) => wrap(c, s, `<path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/>`)
        },
        {
            id: 'sparkle-star',
            label: 'Star Glow',
            svg: (c, s) => wrap(c, s, `<polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9 12 2"/>`)
        },
    ],

    // ── Pricing & Value ───────────────────────────────────────────────────────
    pricing: [
        {
            id: 'price-coins',
            label: 'Coins',
            svg: (c, s) => wrap(c, s, `<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><line x1="16.71" y1="13.88" x2="13.63" y2="17.02"/>`)
        },
        {
            id: 'price-wallet',
            label: 'Wallet',
            svg: (c, s) => wrap(c, s, `<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>`)
        },
        {
            id: 'price-percent',
            label: 'Discount',
            svg: (c, s) => wrap(c, s, `<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>`)
        },
        {
            id: 'price-tag',
            label: 'Price Tag',
            svg: (c, s) => wrap(c, s, `<path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l7.29-7.29a1 1 0 0 0 0-1.41z"/><path d="M7 7h.01"/>`)
        },
        {
            id: 'price-receipt',
            label: 'Receipt',
            svg: (c, s) => wrap(c, s, `<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><path d="M16 8H8"/><path d="M16 12H8"/><path d="M16 16H8"/>`)
        },
        {
            id: 'price-gift',
            label: 'Free Gift',
            svg: (c, s) => wrap(c, s, `<polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>`)
        },
        {
            id: 'price-banknote',
            label: 'Cash / Banknote',
            svg: (c, s) => wrap(c, s, `<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>`)
        },
        {
            id: 'price-creditcard',
            label: 'Credit Card',
            svg: (c, s) => wrap(c, s, `<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>`)
        },
        {
            id: 'price-piggybank',
            label: 'Savings',
            svg: (c, s) => wrap(c, s, `<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2z"/><path d="M2 9v1a2 2 0 0 0 2 2h1"/><path d="M16 11h.01"/>`)
        },
        {
            id: 'price-calculator',
            label: 'Calculator',
            svg: (c, s) => wrap(c, s, `<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="8" y2="14"/><line x1="16" y1="18" x2="8" y2="18"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/>`)
        },
        {
            id: 'price-shoppingbag',
            label: 'Shopping Bag',
            svg: (c, s) => wrap(c, s, `<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>`)
        },
        {
            id: 'price-sale',
            label: 'Sale',
            svg: (c, s) => wrap(c, s, `<path d="m7 7 10 10-5 5V12H7V7Z"/><path d="M10.7 3H7a2 2 0 0 0-2 2v3.7a2 2 0 0 0 .6 1.4l7.3 7.3a2 2 0 0 0 2.8 0l3.7-3.7a2 2 0 0 0 0-2.8z"/>`)
        },
        // ── 20 Additional Pricing, Discount & Deal Icons ──
        {
            id: 'price-best-offer',
            label: 'Best Offer',
            svg: (c, s) => wrap(c, s, `<path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.6-4.6a2 2 0 0 0 0-2.8l-3.4-3.4a2 2 0 0 0-2.8 0L9 12"/><path d="m3 7 3-3a2 2 0 0 1 2.8 0l3.4 3.4a2 2 0 0 1 0 2.8L9 13"/><circle cx="17" cy="17" r="4"/><path d="M17 15v4M15 17h4"/>`)
        },
        {
            id: 'price-auction-gavel',
            label: 'Auction Bid',
            svg: (c, s) => wrap(c, s, `<path d="m14 13-7.5 7.5a2.12 2.12 0 1 1-3-3L11 10"/><path d="m16 16 6-6-3-3-6 6z"/><path d="m8 8 3-3"/><path d="m2 22 4-1"/>`)
        },
        {
            id: 'price-multi-buy',
            label: 'Multi-Buy',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="7" width="12" height="14" rx="2"/><path d="M8 7V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-3"/><path d="M6 14h4M8 12v4"/>`)
        },
        {
            id: 'price-wholesale',
            label: 'Wholesale',
            svg: (c, s) => wrap(c, s, `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><line x1="3.27" y1="6.96" x2="12" y2="12"/><line x1="12" y1="22" x2="12" y2="12"/><line x1="20.73" y1="6.96" x2="12" y2="12"/>`)
        },
        {
            id: 'price-clearance',
            label: 'Clearance',
            svg: (c, s) => wrap(c, s, `<polygon points="12 2 15 8.5 22 9.3 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.3 9 8.5 12 2"/><line x1="9" y1="13" x2="15" y2="13"/>`)
        },
        {
            id: 'price-markdown',
            label: 'Price Drop',
            svg: (c, s) => wrap(c, s, `<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>`)
        },
        {
            id: 'price-voucher',
            label: 'Voucher',
            svg: (c, s) => wrap(c, s, `<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><line x1="12" y1="6" x2="12" y2="18" stroke-dasharray="2 2"/>`)
        },
        {
            id: 'price-spread-cost',
            label: 'Spread Cost',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="9" y1="14" x2="9" y2="17"/><line x1="15" y1="14" x2="15" y2="17"/>`)
        },
        {
            id: 'price-trade-in',
            label: 'Trade-In',
            svg: (c, s) => wrap(c, s, `<path d="M8 3 4 7l4 4"/><path d="M4 7h12a4 4 0 0 1 4 4v1"/><path d="m16 21 4-4-4-4"/><path d="M20 17H8a4 4 0 0 1-4-4v-1"/>`)
        },
        {
            id: 'price-lowest-price',
            label: 'Lowest Price',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/>`)
        },
        {
            id: 'price-zero-vat',
            label: 'Zero VAT',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="12" r="2.5"/><line x1="14" y1="9" x2="19" y2="9"/><line x1="14" y1="12" x2="18" y2="12"/><line x1="14" y1="15" x2="19" y2="15"/>`)
        },
        {
            id: 'price-loyalty-points',
            label: 'Reward Points',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><polygon points="12 6 13.5 9.5 17 10 14.5 12.5 15 16 12 14 9 16 9.5 12.5 7 10 10.5 9.5 12 6"/>`)
        },
        {
            id: 'price-flash-deal',
            label: 'Flash Deal',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/><polygon points="19 2 15 7 18 7 16 12 21 6 18 6 19 2"/>`)
        },
        {
            id: 'price-direct-factory',
            label: 'Direct Price',
            svg: (c, s) => wrap(c, s, `<path d="M2 20h20"/><path d="M5 20V8l5 4V8l5 4V4h4v16"/><circle cx="9" cy="16" r="1" fill="currentColor"/><circle cx="14" cy="16" r="1" fill="currentColor"/>`)
        },
        {
            id: 'price-equal-match',
            label: 'Price Match',
            svg: (c, s) => wrap(c, s, `<line x1="6" y1="9" x2="18" y2="9"/><line x1="6" y1="15" x2="18" y2="15"/><circle cx="12" cy="12" r="10"/>`)
        },
        {
            id: 'price-refurb-value',
            label: 'Refurb Value',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="9"/><path d="m14 9-4 6"/><path d="M9 9h.01M15 15h.01"/><path d="M12 3a9 9 0 0 1 9 9"/>`)
        },
        {
            id: 'price-bundle-save',
            label: 'Bundle Save',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="8" width="10" height="12" rx="1"/><rect x="11" y="4" width="10" height="12" rx="1"/><path d="M7 14h2M15 10h2"/>`)
        },
        {
            id: 'price-cash-pickup',
            label: 'Cash Pickup',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="6" width="16" height="10" rx="1"/><circle cx="10" cy="11" r="2"/><path d="M18 10h4v7a2 2 0 0 1-2 2H8v-3"/>`)
        },
        {
            id: 'price-two-for-one',
            label: '2-For-1 Deal',
            svg: (c, s) => wrap(c, s, `<path d="M9 3H4a1 1 0 0 0-1 1v5l7 7 5-5-6-7Z"/><path d="M20 10l-7-7"/><path d="M17 17l4-4"/>`)
        },
        {
            id: 'price-vip-club',
            label: 'VIP Savings',
            svg: (c, s) => wrap(c, s, `<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/><circle cx="12" cy="19" r="2"/>`)
        },
        // ── 20 Additional Deals, Auctions & Value Icons ──
        {
            id: 'price-buy-it-now',
            label: 'Buy It Now',
            svg: (c, s) => wrap(c, s, `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/><line x1="16" y1="16" x2="22" y2="16"/><line x1="19" y1="13" x2="19" y2="19"/>`)
        },
        {
            id: 'price-no-reserve',
            label: 'No Reserve',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 14.14 14.14"/><line x1="12" y1="6" x2="12" y2="8"/>`)
        },
        {
            id: 'price-tier-volume',
            label: 'Tier Volume',
            svg: (c, s) => wrap(c, s, `<path d="M4 20h16"/><path d="M4 16h4v4H4z"/><path d="M10 12h4v8h-4z"/><path d="M16 7h4v13h-4z"/>`)
        },
        {
            id: 'price-zero-apr',
            label: '0% APR',
            svg: (c, s) => wrap(c, s, `<circle cx="7" cy="12" r="4"/><path d="m13 17 6-10"/><circle cx="14" cy="8" r="1" fill="currentColor"/><circle cx="18" cy="16" r="1" fill="currentColor"/>`)
        },
        {
            id: 'price-slash-tag',
            label: 'Price Slash',
            svg: (c, s) => wrap(c, s, `<path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l7.29-7.29a1 1 0 0 0 0-1.41z"/><circle cx="7" cy="7" r="1" fill="currentColor"/><line x1="2" y1="22" x2="22" y2="2"/>`)
        },
        {
            id: 'price-offer-chat',
            label: 'Make Offer',
            svg: (c, s) => wrap(c, s, `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="12" y1="7" x2="12" y2="13"/>`)
        },
        {
            id: 'price-lock-tag',
            label: 'Price Lock',
            svg: (c, s) => wrap(c, s, `<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1"/>`)
        },
        {
            id: 'price-overstock',
            label: 'Overstock',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="10" width="18" height="11" rx="2"/><path d="M7 10V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v5"/><line x1="12" y1="14" x2="12" y2="17"/>`)
        },
        {
            id: 'price-open-box',
            label: 'Open Box Deal',
            svg: (c, s) => wrap(c, s, `<polyline points="16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/>`)
        },
        {
            id: 'price-b2b-trade',
            label: 'Trade Price',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M12 11h.01"/>`)
        },
        {
            id: 'price-holiday-sale',
            label: 'Holiday Sale',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polygon points="12 13 13.5 16 16.5 16.5 14 18.5 14.5 21 12 19.5 9.5 21 10 18.5 7.5 16.5 10.5 16 12 13"/>`)
        },
        {
            id: 'price-rebate-instant',
            label: 'Rebate',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><polyline points="12 8 8 12 12 16"/>`)
        },
        {
            id: 'price-bonus-item',
            label: 'Bonus Item',
            svg: (c, s) => wrap(c, s, `<polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/><circle cx="18" cy="18" r="3"/><line x1="18" y1="16.5" x2="18" y2="19.5"/><line x1="16.5" y1="18" x2="19.5" y2="18"/>`)
        },
        {
            id: 'price-bargain-tag',
            label: 'Bargain Tag',
            svg: (c, s) => wrap(c, s, `<path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l7.29-7.29a1 1 0 0 0 0-1.41z"/><circle cx="7" cy="7" r="1.5"/><line x1="13" y1="11" x2="17" y2="15"/>`)
        },
        {
            id: 'price-special-rate',
            label: 'Special Rate',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/><line x1="10" y1="8" x2="14" y2="8"/>`)
        },
        {
            id: 'price-stack-cash',
            label: 'Cash Stack',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/><path d="M2 10V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2"/>`)
        },
        {
            id: 'price-free-postage-value',
            label: 'Free P&P Value',
            svg: (c, s) => wrap(c, s, `<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/><path d="M7 8v4M5 10h4"/>`)
        },
        {
            id: 'price-dual-tags',
            label: 'Bundle Deal',
            svg: (c, s) => wrap(c, s, `<path d="M12 2H2v10l9 9 9-9-8-8z"/><path d="M16 6l5 5-5 5"/><circle cx="6" cy="6" r="1" fill="currentColor"/>`)
        },
        {
            id: 'price-repeat-sub',
            label: 'Auto-Refill',
            svg: (c, s) => wrap(c, s, `<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/><circle cx="12" cy="12" r="2"/>`)
        },
        {
            id: 'price-piggy-break',
            label: 'Mega Savings',
            svg: (c, s) => wrap(c, s, `<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2z"/><path d="m11 9 2 2-2 2 2 2"/><circle cx="16" cy="11" r="1"/>`)
        },
    ],

    // ── Customer Service ──────────────────────────────────────────────────────
    customer: [
        {
            id: 'cs-phone',
            label: 'Support Line',
            svg: (c, s) => wrap(c, s, `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 12 19.79 19.79 0 0 1 1.04 3.38 2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>`)
        },
        {
            id: 'cs-mail',
            label: 'Email Support',
            svg: (c, s) => wrap(c, s, `<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>`)
        },
        {
            id: 'cs-chat',
            label: 'Live Chat',
            svg: (c, s) => wrap(c, s, `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`)
        },
        {
            id: 'cs-help',
            label: 'Help Centre',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>`)
        },
        {
            id: 'cs-handshake',
            label: 'Handshake',
            svg: (c, s) => wrap(c, s, `<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-1"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>`)
        },
        {
            id: 'cs-response',
            label: 'Fast Response',
            svg: (c, s) => wrap(c, s, `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M13 8H7"/><path d="M17 12H7"/>`)
        },
        {
            id: 'cs-smile',
            label: 'Happy Customer',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>`)
        },
        {
            id: 'cs-userheart',
            label: 'Valued Customer',
            svg: (c, s) => wrap(c, s, `<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`)
        },
        {
            id: 'cs-24hrs',
            label: '24/7 Support',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`)
        },
        {
            id: 'cs-reply',
            label: 'Quick Reply',
            svg: (c, s) => wrap(c, s, `<polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>`)
        },
        {
            id: 'cs-rating',
            label: 'Top Rated',
            svg: (c, s) => wrap(c, s, `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`)
        },
        {
            id: 'cs-feedback',
            label: 'Reviews',
            svg: (c, s) => wrap(c, s, `<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>`)
        },
        // ── 20 Additional Customer Care & Support Icons ──
        {
            id: 'cs-live-agent',
            label: 'Live Agent',
            svg: (c, s) => wrap(c, s, `<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/><path d="M19 16v3a2 2 0 0 1-2 2h-5"/>`)
        },
        {
            id: 'cs-ticket',
            label: 'Ticket Help',
            svg: (c, s) => wrap(c, s, `<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="m9 12 2 2 4-4"/>`)
        },
        {
            id: 'cs-faq-guide',
            label: 'FAQ Guide',
            svg: (c, s) => wrap(c, s, `<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M9 10a2 2 0 0 1 3.87-.72c0 1.13-1.87 1.72-1.87 2.72"/><line x1="11" y1="16" x2="11.01" y2="16"/>`)
        },
        {
            id: 'cs-dispute-solve',
            label: 'Quick Solved',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/><path d="M12 2v4M12 18v4"/>`)
        },
        {
            id: 'cs-no-hassle',
            label: 'No Hassle',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="1" fill="currentColor"/><circle cx="15" cy="11" r="1" fill="currentColor"/><path d="M9 14s1 1.5 3 1.5 3-1.5 3-1.5"/>`)
        },
        {
            id: 'cs-team-desk',
            label: 'Support Team',
            svg: (c, s) => wrap(c, s, `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`)
        },
        {
            id: 'cs-multi-lingual',
            label: 'Multi Lingual',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`)
        },
        {
            id: 'cs-direct-msg',
            label: 'Direct Chat',
            svg: (c, s) => wrap(c, s, `<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><circle cx="8" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="16" cy="12" r="1" fill="currentColor"/>`)
        },
        {
            id: 'cs-after-sales',
            label: 'After-Sales',
            svg: (c, s) => wrap(c, s, `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/><circle cx="18" cy="18" r="3"/><polyline points="17 18 18 19 20 17"/>`)
        },
        {
            id: 'cs-advice-lamp',
            label: 'Free Advice',
            svg: (c, s) => wrap(c, s, `<path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/>`)
        },
        {
            id: 'cs-setup-guide',
            label: 'Setup Help',
            svg: (c, s) => wrap(c, s, `<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><path d="m9 16 2 2 4-4"/>`)
        },
        {
            id: 'cs-video-help',
            label: 'Video Demo',
            svg: (c, s) => wrap(c, s, `<rect width="14" height="12" x="2" y="6" rx="2"/><polygon points="22 8 16 12 22 16 22 8"/>`)
        },
        {
            id: 'cs-order-status',
            label: 'Order Check',
            svg: (c, s) => wrap(c, s, `<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><circle cx="12" cy="14" r="3"/><line x1="12" y1="12" x2="12" y2="14"/>`)
        },
        {
            id: 'cs-five-star-care',
            label: '5-Star Care',
            svg: (c, s) => wrap(c, s, `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/><circle cx="12" cy="12" r="2" fill="currentColor"/>`)
        },
        {
            id: 'cs-replace-fast',
            label: 'Fast Replace',
            svg: (c, s) => wrap(c, s, `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m10 12 2 2 4-4"/>`)
        },
        {
            id: 'cs-hassle-free-returns',
            label: 'Easy Swap',
            svg: (c, s) => wrap(c, s, `<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="m14 15 2 2 4-4"/>`)
        },
        {
            id: 'cs-vip-agent',
            label: 'VIP Manager',
            svg: (c, s) => wrap(c, s, `<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/><circle cx="12" cy="10" r="1.5" fill="currentColor"/><path d="M6 21h12"/>`)
        },
        {
            id: 'cs-manager-lead',
            label: 'Manager Care',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="m16 11 2 2 4-4"/>`)
        },
        {
            id: 'cs-callback-req',
            label: 'Callback',
            svg: (c, s) => wrap(c, s, `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/><polyline points="14 5 18 5 18 9"/><line x1="18" y1="5" x2="12" y2="11"/>`)
        },
        {
            id: 'cs-follow-up',
            label: 'Follow Up',
            svg: (c, s) => wrap(c, s, `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="m14 11 2 2 4-4"/>`)
        },
    ],

    // ── Seller & Business ─────────────────────────────────────────────────────
    business: [
        {
            id: 'biz-store',
            label: 'Store',
            svg: (c, s) => wrap(c, s, `<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a3 3 0 0 0-3-3a3 3 0 0 0-3 3v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>`)
        },
        {
            id: 'biz-building',
            label: 'Company',
            svg: (c, s) => wrap(c, s, `<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>`)
        },
        {
            id: 'biz-users',
            label: 'Team',
            svg: (c, s) => wrap(c, s, `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`)
        },
        {
            id: 'biz-globe',
            label: 'Global',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`)
        },
        {
            id: 'biz-factory',
            label: 'Factory Direct',
            svg: (c, s) => wrap(c, s, `<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>`)
        },
        {
            id: 'biz-buyers',
            label: 'Buyer Count',
            svg: (c, s) => wrap(c, s, `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M20 8v6"/><path d="M23 11h-6"/>`)
        },
        {
            id: 'biz-verified-seller',
            label: 'Verified Seller',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>`)
        },
        {
            id: 'biz-iso',
            label: 'ISO Certified',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>`)
        },
        {
            id: 'biz-toprated',
            label: 'Top Seller',
            svg: (c, s) => wrap(c, s, `<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7z"/>`)
        },
        {
            id: 'biz-award',
            label: 'Award Winner',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>`)
        },
        {
            id: 'biz-pricematch',
            label: 'Price Match',
            svg: (c, s) => wrap(c, s, `<path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a2.12 2.12 0 0 0-.05 3.69l12.22 6.93a2 2 0 0 0 1.94 0L21 12.51a2.12 2.12 0 0 0-.09-3.67Z"/><path d="m3.09 14.85 12.22 6.93a2 2 0 0 0 1.94 0L21 19.51a2.12 2.12 0 0 0-.09-3.67l-12.22-6.93"/>`)
        },
        {
            id: 'biz-positive',
            label: '100% Positive',
            svg: (c, s) => wrap(c, s, `<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>`)
        },
        // ── 20 Additional Seller, Corporate & Trust Badges ──
        {
            id: 'biz-registered-ltd',
            label: 'Registered LLC',
            svg: (c, s) => wrap(c, s, `<line x1="2" y1="20" x2="22" y2="20"/><line x1="6" y1="11" x2="6" y2="16"/><line x1="10" y1="11" x2="10" y2="16"/><line x1="14" y1="11" x2="14" y2="16"/><line x1="18" y1="11" x2="18" y2="16"/><polygon points="12 2 20 7 4 7"/><line x1="1" y1="20" x2="23" y2="20"/>`)
        },
        {
            id: 'biz-vat-invoice',
            label: 'VAT Invoice',
            svg: (c, s) => wrap(c, s, `<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><path d="m9 11 2 2 4-4"/><line x1="8" y1="17" x2="16" y2="17"/>`)
        },
        {
            id: 'biz-established-yr',
            label: 'Est. Heritage',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="12" cy="15" r="2"/>`)
        },
        {
            id: 'biz-auth-distributor',
            label: 'Auth Dealer',
            svg: (c, s) => wrap(c, s, `<path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z"/><circle cx="12" cy="12" r="3"/>`)
        },
        {
            id: 'biz-family-run',
            label: 'Family Run',
            svg: (c, s) => wrap(c, s, `<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/><circle cx="12" cy="9" r="1.5" fill="currentColor"/>`)
        },
        {
            id: 'biz-trade-member',
            label: 'Trade Guild',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="8 12 11 15 16 10"/>`)
        },
        {
            id: 'biz-bulk-wholesale',
            label: 'Bulk Supply',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="4" width="9" height="7" rx="1"/><rect x="13" y="4" width="9" height="7" rx="1"/><rect x="7" y="13" width="10" height="7" rx="1"/>`)
        },
        {
            id: 'biz-real-showroom',
            label: 'Showroom',
            svg: (c, s) => wrap(c, s, `<path d="m2 7 4.4-4.4A2 2 0 0 1 7.8 2h8.4a2 2 0 0 1 1.4.6L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><line x1="9" y1="14" x2="15" y2="14"/><line x1="12" y1="11" x2="12" y2="17"/>`)
        },
        {
            id: 'biz-direct-import',
            label: 'Direct Import',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 8V2m-3 3 3-3 3 3"/><line x1="8" y1="13" x2="16" y2="13"/>`)
        },
        {
            id: 'biz-oem-custom',
            label: 'Custom OEM',
            svg: (c, s) => wrap(c, s, `<rect x="6" y="9" width="12" height="11" rx="2"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v5"/>`)
        },
        {
            id: 'biz-trade-pickup',
            label: 'Trade Counter',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><line x1="2" y1="10" x2="22" y2="10"/>`)
        },
        {
            id: 'biz-b2b-invoice',
            label: 'B2B Invoice',
            svg: (c, s) => wrap(c, s, `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/>`)
        },
        {
            id: 'biz-carbon-neutral',
            label: 'Eco Business',
            svg: (c, s) => wrap(c, s, `<path d="M11 20A7 7 0 0 1 4 13C4 8 9 3 17 2c0 8-5 13-10 13"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/><circle cx="15" cy="11" r="2"/>`)
        },
        {
            id: 'biz-power-seller',
            label: 'Power Seller',
            svg: (c, s) => wrap(c, s, `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/><polygon points="12 2 15 8.5 22 9.3 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.3 9 8.5 12 2"/>`)
        },
        {
            id: 'biz-top-plus',
            label: 'Top Rated Plus',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/><path d="M12 2a10 10 0 0 1 10 10"/>`)
        },
        {
            id: 'biz-feedback-count',
            label: '50k+ Reviews',
            svg: (c, s) => wrap(c, s, `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/>`)
        },
        {
            id: 'biz-gdpr-safe',
            label: 'GDPR Safe',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/>`)
        },
        {
            id: 'biz-fast-quote',
            label: 'Fast Quote',
            svg: (c, s) => wrap(c, s, `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="10 13 14 13 12 17"/>`)
        },
        {
            id: 'biz-escrow-safe',
            label: 'Escrow Safe',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><rect x="9" y="11" width="6" height="5" rx="1"/><path d="M10 11V9.5a2 2 0 0 1 4 0V11"/>`)
        },
        {
            id: 'biz-partner-lic',
            label: 'Licensed',
            svg: (c, s) => wrap(c, s, `<circle cx="7.5" cy="15.5" r="4.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>`)
        },
    ],

    // ── Tools & Hardware ──────────────────────────────────────────────────────
    tools: [
        {
            id: 'hw-wrench',
            label: 'Wrench',
            svg: (c, s) => wrap(c, s, `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`)
        },
        {
            id: 'hw-hammer',
            label: 'Hammer',
            svg: (c, s) => wrap(c, s, `<path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"/><path d="m18 15 4-4"/><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/>`)
        },
        {
            id: 'hw-drill',
            label: 'Drill',
            svg: (c, s) => wrap(c, s, `<path d="M14 9c0 .55-.45 1-1 1H9l-3 3-3-3V9c0-.55.45-1 1-1h10c.55 0 1 .45 1 1z"/><path d="M14 9h2.5"/><path d="M20 7v4"/><path d="M20 9h2"/>`)
        },
        {
            id: 'hw-screwdriver',
            label: 'Screwdriver',
            svg: (c, s) => wrap(c, s, `<path d="m3 2 3.6 10"/><path d="M6.6 12 10 3"/><path d="m6.6 12-1 4.5L22 22l-3.5-3.5-1.1-4.5-6.4-5z"/>`)
        },
        {
            id: 'hw-settings',
            label: 'Settings',
            svg: (c, s) => wrap(c, s, `<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>`)
        },
        {
            id: 'hw-key',
            label: 'Key',
            svg: (c, s) => wrap(c, s, `<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>`)
        },
        {
            id: 'hw-disc',
            label: 'Disc / Blade',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>`)
        },
        {
            id: 'hw-magnet',
            label: 'Magnet',
            svg: (c, s) => wrap(c, s, `<path d="M6 15A6 6 0 0 0 18 15V5h-3v10a3 3 0 0 1-6 0V5H6z"/><line x1="2" y1="5" x2="6" y2="5"/><line x1="18" y1="5" x2="22" y2="5"/>`)
        },
        {
            id: 'hw-sliders',
            label: 'Adjustable',
            svg: (c, s) => wrap(c, s, `<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>`)
        },
        {
            id: 'hw-scissors',
            label: 'Cut / Precision',
            svg: (c, s) => wrap(c, s, `<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>`)
        },
        {
            id: 'hw-bolt',
            label: 'Bolt / Fastener',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`)
        },
        {
            id: 'hw-construction',
            label: 'Construction',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/>`)
        },
        // ── 36 Additional Workshop, Mechanics & Hardware Icons ──
        {
            id: 'hw-pliers',
            label: 'Pliers',
            svg: (c, s) => wrap(c, s, `<path d="M19 5 9 15"/><path d="m15 9-6 6"/><path d="M3 21l3-3"/><path d="m9 3 2 2-4 4-2-2 4-4Z"/><path d="m15 9 4-4 2 2-4 4-2-2Z"/><path d="m7 17-4 4"/>`)
        },
        {
            id: 'hw-handsaw',
            label: 'Hand Saw',
            svg: (c, s) => wrap(c, s, `<path d="M3 13l9-9 9 9-2 2-3-1-3 1-3-1-3 1-4-2Z"/><circle cx="6" cy="16" r="2"/><path d="M4 14v4a2 2 0 0 0 2 2h2"/>`)
        },
        {
            id: 'hw-tape-measure',
            label: 'Tape Measure',
            svg: (c, s) => wrap(c, s, `<path d="M4 8h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z"/><circle cx="9" cy="14" r="3"/><path d="M16 8V5a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/>`)
        },
        {
            id: 'hw-spirit-level',
            label: 'Spirit Level',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="8" width="20" height="8" rx="2"/><circle cx="12" cy="12" r="2"/><line x1="9" y1="8" x2="9" y2="16"/><line x1="15" y1="8" x2="15" y2="16"/>`)
        },
        {
            id: 'hw-caliper',
            label: 'Caliper',
            svg: (c, s) => wrap(c, s, `<path d="M4 3v18"/><path d="M4 5h7l2 3H4"/><path d="M4 19h7l2-3H4"/><line x1="8" y1="5" x2="8" y2="8"/><line x1="8" y1="16" x2="8" y2="19"/>`)
        },
        {
            id: 'hw-axe-hatchet',
            label: 'Axe Hatchet',
            svg: (c, s) => wrap(c, s, `<path d="m14 12 7-7-3-3-7 7"/><path d="M4 22l10-10"/><path d="M17 2c2 3 4 5 4 8s-2 5-4 5"/>`)
        },
        {
            id: 'hw-chisel',
            label: 'Wood Chisel',
            svg: (c, s) => wrap(c, s, `<path d="m19 5-3-3-9 9 3 3 9-9Z"/><path d="m7 14-4 4v3h3l4-4"/>`)
        },
        {
            id: 'hw-paint-roller',
            label: 'Paint Roller',
            svg: (c, s) => wrap(c, s, `<rect x="4" y="2" width="16" height="6" rx="2"/><path d="M20 5h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-8v6a2 2 0 0 0 2 2h0a2 2 0 0 1 2 2v2"/>`)
        },
        {
            id: 'hw-paintbrush',
            label: 'Paint Brush',
            svg: (c, s) => wrap(c, s, `<path d="m14 12 6-6-3-3-6 6"/><path d="M12.5 13.5 7 19c-1.5 1.5-3.5 1-4-1s.5-2.5 2-4l5.5-5.5"/><line x1="5" y1="17" x2="9" y2="13"/>`)
        },
        {
            id: 'hw-trowel',
            label: 'Brick Trowel',
            svg: (c, s) => wrap(c, s, `<polygon points="12 2 22 12 12 16 6 10 12 2"/><path d="M6 10l-4 4v4h4l4-4"/>`)
        },
        {
            id: 'hw-shovel-spade',
            label: 'Spade Shovel',
            svg: (c, s) => wrap(c, s, `<path d="M12 2v10"/><path d="M10 2h4"/><path d="M6 14a6 6 0 0 0 12 0v-2H6v2Z"/>`)
        },
        {
            id: 'hw-anvil-forge',
            label: 'Iron Anvil',
            svg: (c, s) => wrap(c, s, `<path d="M7 10H6a4 4 0 0 1-4-4 1 1 0 0 1 1-1h18a1 1 0 0 1 1 1 4 4 0 0 1-4 4h-1"/><path d="M9 10v5a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3v-5"/><path d="M5 21h14"/>`)
        },
        {
            id: 'hw-bench-vise',
            label: 'Bench Vise',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="6" width="6" height="12" rx="1"/><rect x="15" y="6" width="6" height="12" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><path d="M12 18v4M9 22h6"/>`)
        },
        {
            id: 'hw-welding-torch',
            label: 'Arc Welder',
            svg: (c, s) => wrap(c, s, `<path d="m14 5 5 5"/><path d="m11 8-7 7v4h4l7-7"/><path d="m17 2 5 5"/><line x1="2" y1="22" x2="5" y2="19"/>`)
        },
        {
            id: 'hw-pipe-fittings',
            label: 'Pipe Fitting',
            svg: (c, s) => wrap(c, s, `<path d="M3 5h6v4H7v8h8v-2h4v6h-6v-2H5a2 2 0 0 1-2-2V5z"/>`)
        },
        {
            id: 'hw-water-valve',
            label: 'Water Valve',
            svg: (c, s) => wrap(c, s, `<polygon points="2 6 12 12 2 18 2 6"/><polygon points="22 6 12 12 22 18 22 6"/><circle cx="12" cy="5" r="2"/><line x1="12" y1="7" x2="12" y2="12"/>`)
        },
        {
            id: 'hw-brass-faucet',
            label: 'Brass Tap',
            svg: (c, s) => wrap(c, s, `<path d="M4 12h8a4 4 0 0 1 4 4v4"/><line x1="2" y1="12" x2="4" y2="12"/><path d="M10 6h4"/><line x1="12" y1="6" x2="12" y2="12"/><circle cx="16" cy="20" r="1"/>`)
        },
        {
            id: 'hw-nut-bolt',
            label: 'Hex Fastener',
            svg: (c, s) => wrap(c, s, `<path d="M12 2l7 4v6l-7 4-7-4V6l7-4z"/><circle cx="12" cy="9" r="2.5"/><line x1="12" y1="16" x2="12" y2="22"/>`)
        },
        {
            id: 'hw-wood-screw',
            label: 'Wood Screw',
            svg: (c, s) => wrap(c, s, `<line x1="12" y1="2" x2="12" y2="22"/><line x1="8" y1="2" x2="16" y2="2"/><line x1="10" y1="6" x2="14" y2="8"/><line x1="10" y1="10" x2="14" y2="12"/><line x1="10" y1="14" x2="14" y2="16"/><line x1="10" y1="18" x2="14" y2="20"/>`)
        },
        {
            id: 'hw-framing-nail',
            label: 'Steel Nails',
            svg: (c, s) => wrap(c, s, `<line x1="12" y1="3" x2="12" y2="21"/><line x1="8" y1="3" x2="16" y2="3"/><line x1="6" y1="8" x2="18" y2="8"/>`)
        },
        {
            id: 'hw-hoist-pulley',
            label: 'Hoist Pulley',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="10" r="6"/><circle cx="12" cy="10" r="2"/><line x1="12" y1="2" x2="12" y2="4"/><path d="M6 10v10M18 10v6"/>`)
        },
        {
            id: 'hw-ladder-step',
            label: 'Step Ladder',
            svg: (c, s) => wrap(c, s, `<line x1="6" y1="2" x2="6" y2="22"/><line x1="18" y1="2" x2="18" y2="22"/><line x1="6" y1="6" x2="18" y2="6"/><line x1="6" y1="11" x2="18" y2="11"/><line x1="6" y1="16" x2="18" y2="16"/>`)
        },
        {
            id: 'hw-wheelbarrow',
            label: 'Wheelbarrow',
            svg: (c, s) => wrap(c, s, `<circle cx="19" cy="17" r="2"/><path d="M3 7h11l5 7H7L4 7z"/><path d="M7 14l-2 5M13 14l2 5M3 7l-2 1"/>`)
        },
        {
            id: 'hw-ratchet-socket',
            label: 'Socket Wrench',
            svg: (c, s) => wrap(c, s, `<circle cx="7" cy="7" r="4"/><path d="m10 10 11 11"/><circle cx="7" cy="7" r="1.5"/><rect x="18" y="18" width="4" height="4" rx="1"/>`)
        },
        {
            id: 'hw-allen-hex',
            label: 'Allen Key',
            svg: (c, s) => wrap(c, s, `<path d="M5 4h6a2 2 0 0 1 2 2v14"/>`)
        },
        {
            id: 'hw-wire-stripper',
            label: 'Wire Stripper',
            svg: (c, s) => wrap(c, s, `<path d="m4 12 7-7 4 4-7 7z"/><path d="m11 19 2 2 7-7-2-2z"/><circle cx="12" cy="12" r="1"/>`)
        },
        {
            id: 'hw-circular-saw',
            label: 'Circular Saw',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 4l2 3-2 3M20 12l-3 2-3-2M12 20l-2-3 2-3M4 12l3-2 3 2"/>`)
        },
        {
            id: 'hw-angle-grinder',
            label: 'Angle Grinder',
            svg: (c, s) => wrap(c, s, `<path d="M4 12h8v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5z"/><circle cx="16" cy="12" r="5"/><line x1="12" y1="12" x2="21" y2="12"/>`)
        },
        {
            id: 'hw-sander-finish',
            label: 'Sander',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="12" width="18" height="5" rx="1"/><path d="M6 12V8a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4"/><line x1="3" y1="19" x2="21" y2="19"/>`)
        },
        {
            id: 'hw-plunge-router',
            label: 'Wood Router',
            svg: (c, s) => wrap(c, s, `<rect x="6" y="4" width="12" height="10" rx="2"/><line x1="3" y1="18" x2="21" y2="18"/><line x1="7" y1="14" x2="7" y2="18"/><line x1="17" y1="14" x2="17" y2="18"/><line x1="12" y1="14" x2="12" y2="20"/>`)
        },
        {
            id: 'hw-metal-toolbox',
            label: 'Tool Box',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="8" width="20" height="13" rx="2"/><path d="M8 8V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3"/><line x1="2" y1="13" x2="22" y2="13"/><circle cx="12" cy="13" r="1.5"/>`)
        },
        {
            id: 'hw-pegboard-rack',
            label: 'Pegboard',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1"/><circle cx="12" cy="8" r="1"/><circle cx="16" cy="8" r="1"/><circle cx="8" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="16" cy="12" r="1"/><circle cx="8" cy="16" r="1"/><circle cx="12" cy="16" r="1"/><circle cx="16" cy="16" r="1"/>`)
        },
        {
            id: 'hw-safety-goggles',
            label: 'Eye Goggles',
            svg: (c, s) => wrap(c, s, `<circle cx="7" cy="12" r="4"/><circle cx="17" cy="12" r="4"/><line x1="11" y1="12" x2="13" y2="12"/><path d="M3 12h-1M21 12h1"/>`)
        },
        {
            id: 'hw-ear-protection',
            label: 'Ear Muffs',
            svg: (c, s) => wrap(c, s, `<path d="M3 14v4a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H3z"/><path d="M17 14v4a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2z"/><path d="M5 12a7 7 0 0 1 14 0"/>`)
        },
        {
            id: 'hw-work-gloves',
            label: 'Work Gloves',
            svg: (c, s) => wrap(c, s, `<path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v7"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M6 14v4a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-7"/>`)
        },
        {
            id: 'hw-chainsaw-bar',
            label: 'Chainsaw',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="10" width="8" height="8" rx="2"/><path d="M10 12h11a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H10"/><path d="M6 10V6h4v4"/>`)
        },
        // ── 22 Additional Specialty Tools & Hardware Icons ──
        {
            id: 'hw-utility-knife',
            label: 'Box Cutter',
            svg: (c, s) => wrap(c, s, `<path d="m14 5 5 5"/><path d="m5 14 9-9 5 5-9 9H5v-5z"/><line x1="2" y1="22" x2="5" y2="19"/>`)
        },
        {
            id: 'hw-caulking-gun',
            label: 'Caulk Gun',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="8" width="12" height="6" rx="1"/><path d="M15 11h6l3-1-3-1h-6"/><path d="M6 14v5a1 1 0 0 0 1 1h1"/><path d="M3 11H1"/>`)
        },
        {
            id: 'hw-pipe-wrench',
            label: 'Pipe Wrench',
            svg: (c, s) => wrap(c, s, `<path d="m15 5 4 4"/><path d="M8 12l7-7 4 4-7 7"/><path d="m5 15-3 3 4 4 3-3"/><path d="M11 9H8v3"/>`)
        },
        {
            id: 'hw-hacksaw-metal',
            label: 'Hacksaw',
            svg: (c, s) => wrap(c, s, `<path d="M3 18V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12"/><line x1="3" y1="18" x2="19" y2="18" stroke-dasharray="2 2"/><path d="M19 18h3v3h-3z"/>`)
        },
        {
            id: 'hw-c-clamp',
            label: 'C-Clamp',
            svg: (c, s) => wrap(c, s, `<path d="M8 4h8a2 2 0 0 1 2 2v1H8v10h10v1a2 2 0 0 1-2 2H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z"/><line x1="15" y1="17" x2="15" y2="22"/>`)
        },
        {
            id: 'hw-pry-bar',
            label: 'Pry Bar',
            svg: (c, s) => wrap(c, s, `<path d="M4 20 20 4"/><path d="M3 21l3-1-2-2z"/><path d="M21 3l-1 3-2-2z"/>`)
        },
        {
            id: 'hw-stud-finder',
            label: 'Stud Finder',
            svg: (c, s) => wrap(c, s, `<rect x="6" y="3" width="12" height="18" rx="2"/><circle cx="12" cy="9" r="2"/><line x1="9" y1="15" x2="15" y2="15"/>`)
        },
        {
            id: 'hw-plunger-drain',
            label: 'Plunger',
            svg: (c, s) => wrap(c, s, `<path d="M12 2v12"/><path d="M7 19a5 5 0 0 0 10 0v-2H7v2Z"/><line x1="10" y1="2" x2="14" y2="2"/>`)
        },
        {
            id: 'hw-jigsaw-blade',
            label: 'Jigsaw',
            svg: (c, s) => wrap(c, s, `<rect x="4" y="6" width="14" height="9" rx="2"/><path d="M7 6V3h8v3"/><line x1="11" y1="15" x2="11" y2="21"/><line x1="2" y1="15" x2="20" y2="15"/>`)
        },
        {
            id: 'hw-grease-gun',
            label: 'Grease Gun',
            svg: (c, s) => wrap(c, s, `<rect x="6" y="8" width="14" height="6" rx="1"/><path d="M6 11H2"/><path d="M12 14v6a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2v-6"/><line x1="20" y1="11" x2="23" y2="11"/>`)
        },
        {
            id: 'hw-sledge-hammer',
            label: 'Sledgehammer',
            svg: (c, s) => wrap(c, s, `<rect x="13" y="3" width="8" height="6" rx="1"/><path d="m14 7-10 14"/>`)
        },
        {
            id: 'hw-vise-grips',
            label: 'Vise Grips',
            svg: (c, s) => wrap(c, s, `<path d="m7 17 9-9"/><path d="m11 5 4 4-2 2-4-4z"/><circle cx="17" cy="7" r="1.5"/><path d="M4 20l4-2-2-4z"/>`)
        },
        {
            id: 'hw-torx-bit',
            label: 'Torx Bit',
            svg: (c, s) => wrap(c, s, `<polygon points="12 2 14.5 7.5 20 8.5 16 12.5 17 18 12 15 7 18 8 12.5 4 8.5 9.5 7.5 12 2"/>`)
        },
        {
            id: 'hw-wire-brush',
            label: 'Wire Brush',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="10" width="12" height="4" rx="1"/><path d="M15 12h7"/><line x1="5" y1="14" x2="5" y2="19"/><line x1="8" y1="14" x2="8" y2="19"/><line x1="11" y1="14" x2="11" y2="19"/>`)
        },
        {
            id: 'hw-putty-scraper',
            label: 'Scraper',
            svg: (c, s) => wrap(c, s, `<path d="M4 14l4-10h8l4 10H4z"/><rect x="10" y="14" width="4" height="8" rx="1"/>`)
        },
        {
            id: 'hw-chalk-line',
            label: 'Chalk Reel',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M19 12l3-3v6z"/>`)
        },
        {
            id: 'hw-dust-respirator',
            label: 'Dust Mask',
            svg: (c, s) => wrap(c, s, `<path d="M4 12c0 5 3.5 8 8 8s8-3 8-8l-8-5-8 5z"/><circle cx="12" cy="14" r="2.5"/><line x1="2" y1="10" x2="4" y2="12"/><line x1="22" y1="10" x2="20" y2="12"/>`)
        },
        {
            id: 'hw-drill-bit-set',
            label: 'Drill Bits',
            svg: (c, s) => wrap(c, s, `<rect x="4" y="16" width="16" height="5" rx="1"/><line x1="7" y1="16" x2="7" y2="4"/><line x1="12" y1="16" x2="12" y2="2"/><line x1="17" y1="16" x2="17" y2="6"/>`)
        },
        {
            id: 'hw-tap-and-die',
            label: 'Tap & Die',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="2"/><line x1="2" y1="12" x2="7" y2="12"/><line x1="17" y1="12" x2="22" y2="12"/>`)
        },
        {
            id: 'hw-hole-saw',
            label: 'Hole Saw',
            svg: (c, s) => wrap(c, s, `<rect x="6" y="8" width="12" height="10" rx="1"/><line x1="12" y1="2" x2="12" y2="8"/><path d="M6 18l2 2 2-2 2 2 2-2 2 2 2-2"/>`)
        },
        {
            id: 'hw-clamp-pipe',
            label: 'Pipe Clamp',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="6"/><line x1="3" y1="6" x2="3" y2="18"/><line x1="21" y1="6" x2="21" y2="18"/>`)
        },
        {
            id: 'hw-safety-cone',
            label: 'Site Cone',
            svg: (c, s) => wrap(c, s, `<path d="m10 3 4 0 5 15H5L10 3z"/><line x1="2" y1="21" x2="22" y2="21"/><line x1="7.5" y1="12" x2="16.5" y2="12"/>`)
        },
        // ── 15 Heavy Power, Masonry & Rigging Tools ──
        {
            id: 'hw-nail-gun',
            label: 'Nail Gun',
            svg: (c, s) => wrap(c, s, `<rect x="5" y="5" width="10" height="7" rx="1"/><path d="M15 8h6l2 1v3h-8"/><path d="M8 12v7a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2v-7"/><rect x="10" y="12" width="4" height="8" rx="1"/>`)
        },
        {
            id: 'hw-impact-driver',
            label: 'Impact Driver',
            svg: (c, s) => wrap(c, s, `<path d="M14 8V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2Z"/><path d="M18 7h4"/><path d="M9 11v6a2 2 0 0 0 2 2h2v-8"/><circle cx="16" cy="7" r="1"/>`)
        },
        {
            id: 'hw-mitre-saw',
            label: 'Mitre Saw',
            svg: (c, s) => wrap(c, s, `<path d="M12 2a8 8 0 0 1 8 8v4H4v-4a8 8 0 0 1 8-8Z"/><line x1="2" y1="18" x2="22" y2="18"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="6" y1="18" x2="4" y2="21"/><line x1="18" y1="18" x2="20" y2="21"/>`)
        },
        {
            id: 'hw-rotary-dremel',
            label: 'Rotary Tool',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="10" width="14" height="5" rx="1"/><path d="M17 11.5h4l2 1-2 1h-4"/><line x1="1" y1="12.5" x2="3" y2="12.5"/>`)
        },
        {
            id: 'hw-tile-cutter',
            label: 'Tile Cutter',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="16" width="20" height="5" rx="1"/><line x1="4" y1="8" x2="20" y2="8"/><circle cx="12" cy="8" r="2.5"/><line x1="12" y1="10.5" x2="12" y2="16"/>`)
        },
        {
            id: 'hw-plaster-float',
            label: 'Plaster Float',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="15" width="20" height="4" rx="1"/><path d="M6 15V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v7"/>`)
        },
        {
            id: 'hw-glass-cutter',
            label: 'Glass Cutter',
            svg: (c, s) => wrap(c, s, `<path d="m14 4 6 6"/><path d="m16 2-12 12v4h4l12-12-4-4z"/><circle cx="4" cy="20" r="1.5"/>`)
        },
        {
            id: 'hw-carabiner-snap',
            label: 'Carabiner',
            svg: (c, s) => wrap(c, s, `<path d="M7 4h7a5 5 0 0 1 5 5v6a5 5 0 0 1-5 5H7a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z"/><line x1="19" y1="9" x2="19" y2="15" stroke-dasharray="2 2"/>`)
        },
        {
            id: 'hw-padlock-heavy',
            label: 'Heavy Lock',
            svg: (c, s) => wrap(c, s, `<rect x="4" y="10" width="16" height="12" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/><circle cx="12" cy="15" r="1.5"/><line x1="12" y1="16.5" x2="12" y2="18.5"/>`)
        },
        {
            id: 'hw-tie-down-strap',
            label: 'Tie Strap',
            svg: (c, s) => wrap(c, s, `<circle cx="7" cy="12" r="4"/><rect x="11" y="9" width="10" height="6" rx="1"/><path d="M7 8V4l-3 3 3 3"/>`)
        },
        {
            id: 'hw-drill-press',
            label: 'Drill Press',
            svg: (c, s) => wrap(c, s, `<line x1="18" y1="2" x2="18" y2="22"/><rect x="8" y="4" width="10" height="6" rx="1"/><line x1="13" y1="10" x2="13" y2="14"/><rect x="8" y="14" width="10" height="3" rx="1"/><line x1="4" y1="22" x2="20" y2="22"/>`)
        },
        {
            id: 'hw-bench-grinder',
            label: 'Bench Grinder',
            svg: (c, s) => wrap(c, s, `<rect x="7" y="9" width="10" height="6" rx="1"/><circle cx="4" cy="12" r="3.5"/><circle cx="20" cy="12" r="3.5"/><line x1="10" y1="15" x2="10" y2="20"/><line x1="14" y1="15" x2="14" y2="20"/><line x1="8" y1="20" x2="16" y2="20"/>`)
        },
        {
            id: 'hw-heat-stripper',
            label: 'Heat Gun',
            svg: (c, s) => wrap(c, s, `<path d="M15 6H7a2 2 0 0 0-2 2v4h8l5-5V6z"/><path d="M9 12v7a2 2 0 0 0 2 2h2"/><line x1="3" y1="10" x2="1" y2="10"/>`)
        },
        {
            id: 'hw-cement-mixer',
            label: 'Mixer Drum',
            svg: (c, s) => wrap(c, s, `<ellipse cx="12" cy="12" rx="7" ry="5" transform="rotate(-30 12 12)"/><path d="M5 19l4-3M19 19l-4-3"/><line x1="3" y1="21" x2="21" y2="21"/>`)
        },
        {
            id: 'hw-desolder-pump',
            label: 'Solder Pump',
            svg: (c, s) => wrap(c, s, `<rect x="7" y="6" width="10" height="12" rx="2"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><circle cx="12" cy="12" r="1.5"/>`)
        },
        // ── Exactly 3 Final Hardware Icons ──
        {
            id: 'hw-car-jack',
            label: 'Car Jack',
            svg: (c, s) => wrap(c, s, `<rect x="7" y="10" width="10" height="10" rx="1"/><rect x="9" y="4" width="6" height="6" rx="1"/><line x1="4" y1="20" x2="20" y2="20"/><path d="M17 14l4-2"/>`)
        },
        {
            id: 'hw-work-light',
            label: 'Work Light',
            svg: (c, s) => wrap(c, s, `<rect x="5" y="4" width="14" height="12" rx="2"/><line x1="12" y1="16" x2="12" y2="20"/><line x1="8" y1="20" x2="16" y2="20"/><circle cx="12" cy="10" r="3"/>`)
        },
        {
            id: 'hw-pipe-cutter',
            label: 'Pipe Cutter',
            svg: (c, s) => wrap(c, s, `<path d="M7 4h10v6a5 5 0 0 1-10 0V4z"/><circle cx="12" cy="16" r="3"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="9" y1="22" x2="15" y2="22"/>`)
        },
    ],

    safety: [
        {
            id: 'saf-shield-check',
            label: 'Safety Certified',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>`)
        },
        {
            id: 'saf-alert-triangle',
            label: 'Safety Warning',
            svg: (c, s) => wrap(c, s, `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`)
        },
        // ── 24 Global Compliance, Testing & Safety Standards ──
        {
            id: 'saf-ce-mark',
            label: 'CE Mark',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M10 8.5a5 5 0 1 0 0 7"/><path d="M18 8.5a5 5 0 1 0 0 7"/><line x1="13" y1="12" x2="17" y2="12"/>`)
        },
        {
            id: 'saf-ukca-mark',
            label: 'UKCA Pass',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M7 9v6a3 3 0 0 0 6 0V9"/><path d="M17 9v6"/>`)
        },
        {
            id: 'saf-fcc-cert',
            label: 'FCC Pass',
            svg: (c, s) => wrap(c, s, `<path d="M2 12a10 10 0 0 1 20 0"/><path d="M5 12a7 7 0 0 1 14 0"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="14" x2="12" y2="21"/>`)
        },
        {
            id: 'saf-rohs-leaf',
            label: 'RoHS Safe',
            svg: (c, s) => wrap(c, s, `<path d="M11 20A7 7 0 0 1 4 13C4 8 9 3 17 2c0 8-5 13-10 13"/><polyline points="9 11 11 13 15 9"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/>`)
        },
        {
            id: 'saf-ul-listed',
            label: 'UL Listed',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M8 8v5a4 4 0 0 0 8 0V8"/>`)
        },
        {
            id: 'saf-fda-approved',
            label: 'FDA Grade',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="8 12 11 15 16 9"/>`)
        },
        {
            id: 'saf-bpa-free',
            label: 'BPA Free',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="12" r="3"/><line x1="10" y1="12" x2="14" y2="12"/>`)
        },
        {
            id: 'saf-child-safety',
            label: 'Child Safe',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="8" r="4"/><path d="M6 21v-2a6 6 0 0 1 12 0v2"/><circle cx="10" cy="7" r=".5" fill="currentColor"/><circle cx="14" cy="7" r=".5" fill="currentColor"/><path d="M11 10s.5.5 1 .5.5-.5 1-.5"/>`)
        },
        {
            id: 'saf-fire-retardant',
            label: 'Fire Safe',
            svg: (c, s) => wrap(c, s, `<path d="M12 2c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 17 10c0 2.5-2 4.5-5 4.5s-5-2-5-4.5c0-1.5.5-2.5 1.5-3.5C9.5 5.5 11 5 12 2Z"/><line x1="4" y1="20" x2="20" y2="4"/>`)
        },
        {
            id: 'saf-high-voltage',
            label: 'Volt Safe',
            svg: (c, s) => wrap(c, s, `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/><circle cx="12" cy="12" r="10"/>`)
        },
        {
            id: 'saf-first-aid',
            label: 'First Aid',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="5" width="18" height="14" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>`)
        },
        {
            id: 'saf-eye-protect',
            label: 'Eye Protect',
            svg: (c, s) => wrap(c, s, `<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="1" fill="currentColor"/>`)
        },
        {
            id: 'saf-air-filter',
            label: 'Clean Air',
            svg: (c, s) => wrap(c, s, `<path d="M4 12c0 5 3.5 8 8 8s8-3 8-8l-8-5-8 5z"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="10" y1="17" x2="14" y2="17"/>`)
        },
        {
            id: 'saf-non-toxic',
            label: 'Non-Toxic',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/><line x1="2" y1="2" x2="22" y2="22"/>`)
        },
        {
            id: 'saf-non-slip',
            label: 'Anti-Slip',
            svg: (c, s) => wrap(c, s, `<path d="M4 17h16v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3z"/><line x1="4" y1="21" x2="6" y2="23"/><line x1="10" y1="21" x2="12" y2="23"/><line x1="16" y1="21" x2="18" y2="23"/>`)
        },
        {
            id: 'saf-ear-protect',
            label: 'Hearing Safe',
            svg: (c, s) => wrap(c, s, `<path d="M3 14v4a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H3z"/><path d="M17 14v4a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2z"/><path d="M5 12a7 7 0 0 1 14 0"/>`)
        },
        {
            id: 'saf-safety-lock',
            label: 'Safety Lock',
            svg: (c, s) => wrap(c, s, `<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1"/>`)
        },
        {
            id: 'saf-food-contact',
            label: 'Food Safe',
            svg: (c, s) => wrap(c, s, `<path d="M8 2v10a4 4 0 0 0 8 0V2"/><path d="M12 12v9"/><path d="M9 21h6"/>`)
        },
        {
            id: 'saf-latex-free',
            label: 'Latex Free',
            svg: (c, s) => wrap(c, s, `<path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v7"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M6 14v4a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-7"/><line x1="2" y1="2" x2="22" y2="22"/>`)
        },
        {
            id: 'saf-tamper-evident',
            label: 'Tamper Seal',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m9 12 2 2 4-4"/>`)
        },
        {
            id: 'saf-water-seal',
            label: 'Water Seal',
            svg: (c, s) => wrap(c, s, `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="m9 13 2 2 4-4"/>`)
        },
        {
            id: 'saf-auto-shutoff',
            label: 'Auto Cutoff',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 15 15"/><path d="m15 3 6 6"/>`)
        },
        {
            id: 'saf-eco-recycle',
            label: 'Eco Plastic',
            svg: (c, s) => wrap(c, s, `<path d="M7 19H4.8a1.8 1.8 0 0 1-1.6-.9 1.8 1.8 0 0 1 0-1.8L7.2 9.5"/><path d="M11 19h8.2a1.8 1.8 0 0 0 1.6-.9 1.8 1.8 0 0 0 0-1.8l-1.2-2.1"/><path d="m14 16 3 3-3 3"/><path d="m18 10-3-3 3-3"/>`)
        },
        {
            id: 'saf-osha-standard',
            label: 'OSHA Pass',
            svg: (c, s) => wrap(c, s, `<path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a6 6 0 0 1 6-6h0"/><path d="M14 6h0a6 6 0 0 1 6 6v3"/>`)
        },
        // ── 15 Advanced International Compliance & Lab Test Badges ──
        {
            id: 'saf-tuv-cert',
            label: 'TÜV Tested',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><polygon points="12 2 15 8.5 22 9.3 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.3 9 8.5 12 2"/>`)
        },
        {
            id: 'saf-sgs-lab',
            label: 'SGS Lab Pass',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/><line x1="12" y1="14" x2="12" y2="18"/>`)
        },
        {
            id: 'saf-lead-free',
            label: 'Lead Free',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M9 9h4a2 2 0 0 1 0 4H9v3"/><line x1="3" y1="3" x2="21" y2="21"/>`)
        },
        {
            id: 'saf-esd-antistatic',
            label: 'ESD Safe',
            svg: (c, s) => wrap(c, s, `<path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v7"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M6 14v4a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-7"/><polygon points="13 7 9 12 12 12 11 17 15 12 12 12 13 7"/>`)
        },
        {
            id: 'saf-atex-flame',
            label: 'ATEX Safe',
            svg: (c, s) => wrap(c, s, `<polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><path d="m8 8 8 8"/><path d="m16 8-8 8"/>`)
        },
        {
            id: 'saf-uv400-sun',
            label: 'UV400 Safe',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>`)
        },
        {
            id: 'saf-mil-drop',
            label: 'Drop Tested',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="12 8 12 14 15 14"/><path d="m9 17 3 3 3-3"/>`)
        },
        {
            id: 'saf-choking-alert',
            label: 'Choking Alert',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>`)
        },
        {
            id: 'saf-laser-safety',
            label: 'Laser Safe',
            svg: (c, s) => wrap(c, s, `<polygon points="12 2 2 20 22 20 12 2"/><circle cx="12" cy="14" r="2"/><line x1="12" y1="8" x2="12" y2="10"/>`)
        },
        {
            id: 'saf-thermal-fuse',
            label: 'Thermal Guard',
            svg: (c, s) => wrap(c, s, `<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/><line x1="18" y1="8" x2="22" y2="8"/><line x1="18" y1="12" x2="22" y2="12"/>`)
        },
        {
            id: 'saf-chemical-proof',
            label: 'Acid Safe',
            svg: (c, s) => wrap(c, s, `<path d="M10 2v7.31L4.1 19.34A2 2 0 0 0 5.8 22h12.4a2 2 0 0 0 1.7-2.66L14 9.31V2"/><line x1="8.5" y1="2" x2="15.5" y2="2"/><circle cx="12" cy="16" r="1" fill="currentColor"/>`)
        },
        {
            id: 'saf-emf-shield',
            label: 'EMF Shield',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M8 12a4 4 0 0 1 8 0"/><path d="M6 10a6 6 0 0 1 12 0"/>`)
        },
        {
            id: 'saf-fuse-overload',
            label: 'Fuse Guard',
            svg: (c, s) => wrap(c, s, `<rect x="5" y="8" width="14" height="8" rx="2"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><path d="M9 12h2l2-2 2 4h2"/>`)
        },
        {
            id: 'saf-mercury-free',
            label: 'Hg Free',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M8 9h8v3a4 4 0 0 1-8 0V9z"/><line x1="2" y1="2" x2="22" y2="22"/>`)
        },
        {
            id: 'saf-iso-13485',
            label: 'Medical ISO',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/><circle cx="12" cy="12" r="6"/>`)
        },
        // ── Exactly 3 Final Compliance & Safety Badges ──
        {
            id: 'saf-dust-proof',
            label: 'Dustproof',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="9" cy="12" r=".7" fill="currentColor"/><circle cx="12" cy="9.5" r=".7" fill="currentColor"/><circle cx="15" cy="12" r=".7" fill="currentColor"/><circle cx="12" cy="14.5" r=".7" fill="currentColor"/>`)
        },
        {
            id: 'saf-crash-tested',
            label: 'Crash Tested',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/><circle cx="12" cy="12" r="4"/>`)
        },
        {
            id: 'saf-toxin-free',
            label: 'Toxin Free',
            svg: (c, s) => wrap(c, s, `<path d="M11 20A7 7 0 0 1 4 13C4 8 9 3 17 2c0 8-5 13-10 13"/><path d="m14 14 2 2 4-4"/><line x1="2" y1="2" x2="22" y2="22"/>`)
        },
    ],

    returns: [
        {
            id: 'ret-rotate-ccw',
            label: '30-Day Returns',
            svg: (c, s) => wrap(c, s, `<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>`)
        },
        {
            id: 'ret-badge-check',
            label: 'Money Back',
            svg: (c, s) => wrap(c, s, `<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76z"/><path d="m9 12 2 2 4-4"/>`)
        },
        // ── 58 Comprehensive Return Policies & Warranty Coverage Icons ──
        {
            id: 'ret-60-day',
            label: '60-Day Return',
            svg: (c, s) => wrap(c, s, `<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><circle cx="12" cy="12" r="3"/>`)
        },
        {
            id: 'ret-90-day',
            label: '90-Day Return',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 12"/><path d="M3 12a9 9 0 0 1 9-9"/>`)
        },
        {
            id: 'ret-14-day',
            label: '14-Day Cooling',
            svg: (c, s) => wrap(c, s, `<path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.9 1 6.7 2.7L21 8"/><path d="M21 3v5h-5"/>`)
        },
        {
            id: 'ret-lifetime-wty',
            label: 'Lifetime Wty',
            svg: (c, s) => wrap(c, s, `<path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"/><polyline points="9 11 11 13 15 9"/>`)
        },
        {
            id: 'ret-1yr-wty',
            label: '1-Year Wty',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="16"/>`)
        },
        {
            id: 'ret-2yr-wty',
            label: '2-Year Wty',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M10 9a2 2 0 1 1 4 0c0 1.5-2 2.5-4 4.5h4"/>`)
        },
        {
            id: 'ret-3yr-wty',
            label: '3-Year Wty',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M10 8h4l-2 3a2 2 0 1 1-2 2"/>`)
        },
        {
            id: 'ret-5yr-wty',
            label: '5-Year Wty',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M14 8h-4v3.5a2.5 2.5 0 1 1 0 5H10"/>`)
        },
        {
            id: 'ret-10yr-wty',
            label: '10-Year Wty',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="14" cy="12" r="2.5"/><line x1="9" y1="9.5" x2="9" y2="14.5"/>`)
        },
        {
            id: 'ret-no-quibble',
            label: 'No Quibble',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="m8 12 2.5 2.5L16 9"/><circle cx="12" cy="12" r="6"/>`)
        },
        {
            id: 'ret-free-return',
            label: 'Free Returns',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="5" width="20" height="14" rx="2"/><path d="m9 10 3-3 3 3"/><path d="M12 7v10"/>`)
        },
        {
            id: 'ret-prepaid-label',
            label: 'Prepaid Label',
            svg: (c, s) => wrap(c, s, `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 14 12 11 15 14"/><line x1="12" y1="11" x2="12" y2="17"/>`)
        },
        {
            id: 'ret-full-refund',
            label: 'Full Refund',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/><polyline points="6 12 3 15 6 18"/>`)
        },
        {
            id: 'ret-exchange-swap',
            label: 'Direct Swap',
            svg: (c, s) => wrap(c, s, `<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>`)
        },
        {
            id: 'ret-store-credit',
            label: 'Store Credit',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><circle cx="16" cy="15" r="1.5"/>`)
        },
        {
            id: 'ret-satisfaction',
            label: 'Satisfaction',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/>`)
        },
        {
            id: 'ret-try-at-home',
            label: 'Try At Home',
            svg: (c, s) => wrap(c, s, `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="m9 13 2 2 4-4"/>`)
        },
        {
            id: 'ret-hassle-free',
            label: 'Hassle Free',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="8 12 11 15 16 10"/>`)
        },
        {
            id: 'ret-instant-refund',
            label: 'Fast Refund',
            svg: (c, s) => wrap(c, s, `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/><path d="m15 15 3-3-3-3"/>`)
        },
        {
            id: 'ret-drop-off-pt',
            label: 'Drop-off Post',
            svg: (c, s) => wrap(c, s, `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><path d="m9 10 2 2 4-4"/>`)
        },
        {
            id: 'ret-courier-pickup',
            label: 'Home Pickup',
            svg: (c, s) => wrap(c, s, `<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/><path d="m9 8 2 2 4-4"/>`)
        },
        {
            id: 'ret-free-repair',
            label: 'Free Repair',
            svg: (c, s) => wrap(c, s, `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/><polyline points="2 2 5 5 8 2"/>`)
        },
        {
            id: 'ret-parts-labor',
            label: 'Parts & Labor',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/><path d="m9 12 2 2 4-4"/>`)
        },
        {
            id: 'ret-hardware-wty',
            label: 'Hardware Wty',
            svg: (c, s) => wrap(c, s, `<rect x="4" y="4" width="16" height="16" rx="2"/><path d="m9 12 2 2 4-4"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3"/>`)
        },
        {
            id: 'ret-battery-wty',
            label: 'Battery Cover',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="7" width="16" height="10" rx="2"/><line x1="22" y1="11" x2="22" y2="13"/><polyline points="7 12 9 14 13 10"/>`)
        },
        {
            id: 'ret-motor-wty',
            label: 'Motor Cover',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><polyline points="9 11 11 13 15 9"/>`)
        },
        {
            id: 'ret-screen-wty',
            label: 'Screen Cover',
            svg: (c, s) => wrap(c, s, `<rect width="20" height="14" x="2" y="3" rx="2"/><polyline points="8 10 11 13 16 8"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>`)
        },
        {
            id: 'ret-water-dmg',
            label: 'Water Cover',
            svg: (c, s) => wrap(c, s, `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`)
        },
        {
            id: 'ret-drop-cover',
            label: 'Drop Cover',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 11 3 3 3-3"/><line x1="12" y1="7" x2="12" y2="14"/>`)
        },
        {
            id: 'ret-theft-cover',
            label: 'Theft Cover',
            svg: (c, s) => wrap(c, s, `<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1.5"/><path d="M12 22s8-4 8-10"/>`)
        },
        {
            id: 'ret-wear-tear',
            label: 'Wear & Tear',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>`)
        },
        {
            id: 'ret-extended-plan',
            label: 'Warranty Plus',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>`)
        },
        {
            id: 'ret-oem-warranty',
            label: 'OEM Warranty',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m8 12 2.5 2.5L16 9"/><line x1="3" y1="8" x2="21" y2="8"/>`)
        },
        {
            id: 'ret-dealer-wty',
            label: 'Dealer Wty',
            svg: (c, s) => wrap(c, s, `<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><polyline points="9 13 11 15 15 11"/>`)
        },
        {
            id: 'ret-refurb-wty',
            label: 'Refurb Wty',
            svg: (c, s) => wrap(c, s, `<path d="M3 12a9 9 0 0 1 9-9 9.8 9.8 0 0 1 6.7 2.7L21 8"/><path d="M21 3v5h-5"/><path d="m10 12 2 2 4-4"/>`)
        },
        {
            id: 'ret-cert-cover',
            label: 'Cert Cover',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 22l-5-3-5 3 1.5-9"/><polyline points="9 8 11 10 15 6"/>`)
        },
        {
            id: 'ret-global-wty',
            label: 'Global Wty',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><polyline points="9 12 11 14 15 10"/>`)
        },
        {
            id: 'ret-transferable',
            label: 'Transferable',
            svg: (c, s) => wrap(c, s, `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>`)
        },
        {
            id: 'ret-zero-deduct',
            label: '$0 Deductible',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>`)
        },
        {
            id: 'ret-24h-replace',
            label: '24h Replace',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 15 15"/><path d="m14 18 2 2 4-4"/>`)
        },
        {
            id: 'ret-new-for-old',
            label: 'New For Old',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="6" width="9" height="12" rx="1"/><rect x="13" y="6" width="9" height="12" rx="1"/><path d="m9 12 4 0"/><polyline points="11 10 13 12 11 14"/>`)
        },
        {
            id: 'ret-seal-intact',
            label: 'Seal Intact',
            svg: (c, s) => wrap(c, s, `<rect x="4" y="6" width="16" height="14" rx="2"/><circle cx="12" cy="13" r="3"/><polyline points="10.5 13 11.5 14 13.5 12"/>`)
        },
        {
            id: 'ret-receipt-valid',
            label: 'Receipt Valid',
            svg: (c, s) => wrap(c, s, `<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><polyline points="8 12 11 15 16 9"/>`)
        },
        {
            id: 'ret-easy-eclaim',
            label: 'Online Claim',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="13" y2="12"/><path d="m15 14 2 2 4-4"/>`)
        },
        {
            id: 'ret-claim-approved',
            label: 'Fast Approval',
            svg: (c, s) => wrap(c, s, `<polygon points="12 2 15 8.5 22 9.3 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.3 9 8.5 12 2"/><polyline points="9 11 11 13 15 9"/>`)
        },
        {
            id: 'ret-peace-mind',
            label: 'Peace Of Mind',
            svg: (c, s) => wrap(c, s, `<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/><polyline points="9 11 11 13 15 9"/>`)
        },
        {
            id: 'ret-escrow-hold',
            label: 'Escrow Hold',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16.5" r="1.5"/>`)
        },
        {
            id: 'ret-buyer-shield',
            label: 'Buyer Shield',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/><path d="m10 11 1.5 1.5 3-3"/>`)
        },
        {
            id: 'ret-defect-free',
            label: 'Defect Free',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="m8 12 2.5 2.5L16 9"/>`)
        },
        {
            id: 'ret-fit-guarantee',
            label: 'Fit Guarantee',
            svg: (c, s) => wrap(c, s, `<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z"/><polyline points="8 12 11 15 16 9"/>`)
        },
        {
            id: 'ret-tested-working',
            label: '100% Tested',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/><line x1="12" y1="2" x2="12" y2="4"/>`)
        },
        {
            id: 'ret-freshness-gtd',
            label: 'Fresh Gtd',
            svg: (c, s) => wrap(c, s, `<path d="M11 20A7 7 0 0 1 4 13C4 8 9 3 17 2c0 8-5 13-10 13"/><polyline points="9 11 11 13 15 9"/>`)
        },
        {
            id: 'ret-safe-arrival',
            label: 'Safe Arrival',
            svg: (c, s) => wrap(c, s, `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="9 12 11 14 15 10"/>`)
        },
        {
            id: 'ret-price-protect',
            label: 'Price Protect',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="8" y1="12" x2="16" y2="12"/>`)
        },
        {
            id: 'ret-genuine-gtd',
            label: 'Genuine Gtd',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="m8 12 2.5 2.5L16 9"/><circle cx="12" cy="12" r="7"/>`)
        },
        {
            id: 'ret-vip-shield',
            label: 'VIP Cover',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polygon points="12 6 13.5 9 17 9.5 14.5 12 15 15.5 12 14 9 15.5 9.5 12 7 9.5 10.5 9 12 6"/>`)
        },
        {
            id: 'ret-unlimited-wty',
            label: 'Unlimited Wty',
            svg: (c, s) => wrap(c, s, `<path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"/><circle cx="6" cy="12" r="1" fill="currentColor"/><circle cx="18" cy="12" r="1" fill="currentColor"/>`)
        },
        {
            id: 'ret-express-swap',
            label: 'Express Swap',
            svg: (c, s) => wrap(c, s, `<path d="M4 12h16"/><polyline points="16 8 20 12 16 16"/><polyline points="8 16 4 12 8 8"/>`)
        },
    ],

    packaging: [
        {
            id: 'pkg-package',
            label: 'Secure Pack',
            svg: (c, s) => wrap(c, s, `<path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/>`)
        },
        {
            id: 'pkg-gift',
            label: 'Gift Wrap',
            svg: (c, s) => wrap(c, s, `<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>`)
        },
        // ── 28 Professional Protective & Retail Packaging Badges ──
        {
            id: 'pkg-retail-box',
            label: 'Retail Box',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m8 15 2 2 4-4"/>`)
        },
        {
            id: 'pkg-brown-box',
            label: 'Discreet Box',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="6" width="18" height="14" rx="2"/><line x1="3" y1="13" x2="21" y2="13"/><circle cx="12" cy="9.5" r="1.5"/>`)
        },
        {
            id: 'pkg-double-boxed',
            label: 'Double Boxed',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="2" width="20" height="20" rx="2"/><rect x="6" y="6" width="12" height="12" rx="1"/>`)
        },
        {
            id: 'pkg-corrugated-board',
            label: 'Heavy Board',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="5" width="20" height="14" rx="2"/><path d="m4 12 2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2"/>`)
        },
        {
            id: 'pkg-bubble-wrap',
            label: 'Bubble Wrap',
            svg: (c, s) => wrap(c, s, `<circle cx="6" cy="6" r="2.5"/><circle cx="14" cy="6" r="2.5"/><circle cx="10" cy="12" r="2.5"/><circle cx="18" cy="12" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="14" cy="18" r="2.5"/>`)
        },
        {
            id: 'pkg-foam-fill',
            label: 'Foam Peanuts',
            svg: (c, s) => wrap(c, s, `<path d="M6 8c-2 0-3 2-3 4s1 4 3 4 3-2 3-4-1-4-3-4Z"/><path d="M18 8c-2 0-3 2-3 4s1 4 3 4 3-2 3-4-1-4-3-4Z"/><path d="M12 12c-2 0-3 2-3 4s1 4 3 4 3-2 3-4-1-4-3-4Z"/>`)
        },
        {
            id: 'pkg-air-pillow',
            label: 'Air Pillow',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="6" width="18" height="12" rx="4"/><line x1="3" y1="12" x2="21" y2="12" stroke-dasharray="2 2"/>`)
        },
        {
            id: 'pkg-molded-foam',
            label: 'Molded Foam',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="4" width="18" height="16" rx="2"/><rect x="7" y="8" width="10" height="8" rx="2"/><circle cx="12" cy="12" r="2"/>`)
        },
        {
            id: 'pkg-esd-bag',
            label: 'ESD Anti-Static',
            svg: (c, s) => wrap(c, s, `<rect x="4" y="4" width="16" height="17" rx="2"/><polygon points="13 7 9 12 12 12 11 17 15 12 12 12 13 7"/><line x1="4" y1="7" x2="20" y2="7"/>`)
        },
        {
            id: 'pkg-silica-gel',
            label: 'Silica Gel',
            svg: (c, s) => wrap(c, s, `<rect x="5" y="4" width="14" height="16" rx="2"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/><circle cx="12" cy="13" r="1" fill="currentColor"/><circle cx="9" cy="16" r="1" fill="currentColor"/><circle cx="15" cy="16" r="1" fill="currentColor"/>`)
        },
        {
            id: 'pkg-vacuum-seal',
            label: 'Vacuum Seal',
            svg: (c, s) => wrap(c, s, `<rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 12 4-4 4 4"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="4" y1="6" x2="20" y2="6"/>`)
        },
        {
            id: 'pkg-heat-shrink',
            label: 'Shrink Wrap',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m7 7 2 2M17 7l-2 2M7 17l2-2M17 17l-2-2"/>`)
        },
        {
            id: 'pkg-corner-guards',
            label: 'Corner Guards',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9V3h6M15 3h6v6M21 15v6h-6M9 21H3v-6"/>`)
        },
        {
            id: 'pkg-tamper-tape',
            label: 'Tamper Tape',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="8" width="20" height="8" rx="1"/><line x1="2" y1="12" x2="22" y2="12" stroke-dasharray="3 2"/><circle cx="12" cy="12" r="1.5"/>`)
        },
        {
            id: 'pkg-reinforced-tape',
            label: 'Strapped Tape',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="10" y1="4" x2="10" y2="20"/>`)
        },
        {
            id: 'pkg-waterproof-poly',
            label: 'Poly Mailer',
            svg: (c, s) => wrap(c, s, `<path d="M4 6h16v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z"/><path d="M4 6l8 5 8-5"/><path d="M12 14c-1.5 1-2 2-2 3s1 2 2 2 2-1 2-2-0.5-2-2-3Z"/>`)
        },
        {
            id: 'pkg-padded-bag',
            label: 'Padded Mailer',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m3 7 9 6 9-6"/><circle cx="12" cy="16" r="1.5"/>`)
        },
        {
            id: 'pkg-rigid-stayflat',
            label: 'Do Not Bend',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="12" y2="16"/>`)
        },
        {
            id: 'pkg-postal-tube',
            label: 'Postal Tube',
            svg: (c, s) => wrap(c, s, `<ellipse cx="6" cy="12" rx="3" ry="8"/><path d="M6 4h12c1.66 0 3 3.58 3 8s-1.34 8-3 8H6"/><circle cx="18" cy="12" r="1" fill="currentColor"/>`)
        },
        {
            id: 'pkg-stretch-wrap',
            label: 'Stretch Wrap',
            svg: (c, s) => wrap(c, s, `<rect x="4" y="6" width="16" height="12" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="2" y1="14" x2="22" y2="14"/>`)
        },
        {
            id: 'pkg-pallet-bands',
            label: 'Heavy Straps',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="3" width="18" height="15" rx="1"/><line x1="8" y1="3" x2="8" y2="18"/><line x1="16" y1="3" x2="16" y2="18"/><line x1="1" y1="21" x2="23" y2="21"/>`)
        },
        {
            id: 'pkg-wood-crate',
            label: 'Wood Crate',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="3" x2="21" y2="21"/><line x1="21" y1="3" x2="3" y2="21"/>`)
        },
        {
            id: 'pkg-velvet-pouch',
            label: 'Velvet Pouch',
            svg: (c, s) => wrap(c, s, `<path d="M6 8h12l2 11a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3L6 8z"/><path d="M8 8V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3"/><line x1="6" y1="10" x2="18" y2="10"/>`)
        },
        {
            id: 'pkg-clamshell-blister',
            label: 'Clamshell',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="3" width="20" height="18" rx="4"/><rect x="6" y="7" width="12" height="10" rx="2"/><circle cx="12" cy="5" r="1"/>`)
        },
        {
            id: 'pkg-shredded-paper',
            label: 'Eco Shred Fill',
            svg: (c, s) => wrap(c, s, `<path d="M4 6h16v12H4z"/><path d="M6 10c2 2 4-2 6 0s4-2 6 0"/><path d="M6 14c2 2 4-2 6 0s4-2 6 0"/>`)
        },
        {
            id: 'pkg-biodegradable',
            label: 'Bio Packaging',
            svg: (c, s) => wrap(c, s, `<path d="M11 20A7 7 0 0 1 4 13C4 8 9 3 17 2c0 8-5 13-10 13"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/><circle cx="15" cy="11" r="2"/>`)
        },
        {
            id: 'pkg-tear-strip',
            label: 'Easy Open',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="12" x2="18" y2="12" stroke-dasharray="2 2"/><polyline points="15 9 18 12 15 15"/>`)
        },
        {
            id: 'pkg-fragile-stencil',
            label: 'Fragile Box',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 8h6l1 4a3 3 0 0 1-6 0l1-4z"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="16" x2="14" y2="16"/>`)
        },
    ],

    compatibility: [
        {
            id: 'compat-plug',
            label: 'Universal Fit',
            svg: (c, s) => wrap(c, s, `<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2z"/>`)
        },
        {
            id: 'compat-link',
            label: 'Works With',
            svg: (c, s) => wrap(c, s, `<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>`)
        },
        // ── 30 Platform, OS, Hardware & Vehicle Fitment Badges ──
        {
            id: 'compat-windows',
            label: 'Windows OS',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>`)
        },
        {
            id: 'compat-apple-mac',
            label: 'Apple Mac',
            svg: (c, s) => wrap(c, s, `<path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/>`)
        },
        {
            id: 'compat-android',
            label: 'Android OS',
            svg: (c, s) => wrap(c, s, `<path d="M6 10h12v7a6 6 0 0 1-12 0v-7z"/><path d="m8 6-2-3M16 6l2-3"/><circle cx="9.5" cy="12" r=".7" fill="currentColor"/><circle cx="14.5" cy="12" r=".7" fill="currentColor"/>`)
        },
        {
            id: 'compat-linux',
            label: 'Linux OS',
            svg: (c, s) => wrap(c, s, `<ellipse cx="12" cy="13" rx="6" ry="8"/><circle cx="12" cy="6" r="3"/><circle cx="10" cy="5" r=".5" fill="currentColor"/><circle cx="14" cy="5" r=".5" fill="currentColor"/><path d="m11 7 1 1 1-1"/><path d="M6 19l2 2M18 19l-2 2"/>`)
        },
        {
            id: 'compat-ios-phone',
            label: 'iOS Mobile',
            svg: (c, s) => wrap(c, s, `<rect x="5" y="2" width="14" height="20" rx="3"/><circle cx="12" cy="18" r="1"/><line x1="10" y1="5" x2="14" y2="5"/>`)
        },
        {
            id: 'compat-bt-pair',
            label: 'Bluetooth',
            svg: (c, s) => wrap(c, s, `<path d="m7 7 10 10-5 5V2l5 5L7 17"/>`)
        },
        {
            id: 'compat-wifi-dual',
            label: 'Dual WiFi',
            svg: (c, s) => wrap(c, s, `<path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/><path d="M2 9.5a15 15 0 0 1 20 0"/>`)
        },
        {
            id: 'compat-usb-type-c',
            label: 'USB-C Port',
            svg: (c, s) => wrap(c, s, `<rect x="4" y="6" width="16" height="12" rx="6"/><circle cx="9" cy="12" r="1.5" fill="currentColor"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/>`)
        },
        {
            id: 'compat-lightning',
            label: 'Lightning',
            svg: (c, s) => wrap(c, s, `<rect x="7" y="4" width="10" height="16" rx="2"/><line x1="10" y1="8" x2="10" y2="12"/><line x1="14" y1="8" x2="14" y2="12"/>`)
        },
        {
            id: 'compat-hdmi-display',
            label: 'HDMI Port',
            svg: (c, s) => wrap(c, s, `<path d="M4 7h16v6l-2 4H6l-2-4V7z"/><line x1="7" y1="11" x2="17" y2="11"/>`)
        },
        {
            id: 'compat-aux-audio',
            label: '3.5mm Aux',
            svg: (c, s) => wrap(c, s, `<path d="M12 2v10"/><circle cx="12" cy="16" r="4"/><line x1="10" y1="5" x2="14" y2="5"/><line x1="10" y1="8" x2="14" y2="8"/>`)
        },
        {
            id: 'compat-vesa-mount',
            label: 'VESA Mount',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/><circle cx="17" cy="7" r="1.5" fill="currentColor"/><circle cx="7" cy="17" r="1.5" fill="currentColor"/><circle cx="17" cy="17" r="1.5" fill="currentColor"/>`)
        },
        {
            id: 'compat-vehicle-fit',
            label: 'Vehicle Fit',
            svg: (c, s) => wrap(c, s, `<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="m9 9 2 2 4-4"/>`)
        },
        {
            id: 'compat-oem-match',
            label: 'OEM Match',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="7"/>`)
        },
        {
            id: 'compat-playstation',
            label: 'PlayStation',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="7" width="18" height="10" rx="3"/><circle cx="16" cy="12" r="1.5"/><polygon points="8 9 9 11 7 11 8 9"/><line x1="8" y1="13" x2="8" y2="15"/>`)
        },
        {
            id: 'compat-xbox-console',
            label: 'Xbox Console',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M6 7c3 3 5 8 6 13 1-5 3-10 6-13"/><path d="M18 7c-3 3-5 8-6 13-1-5-3-10-6-13"/>`)
        },
        {
            id: 'compat-switch-game',
            label: 'Switch Play',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="5" width="7" height="14" rx="2"/><rect x="14" y="5" width="7" height="14" rx="2"/><circle cx="6.5" cy="9" r="1"/><circle cx="17.5" cy="14" r="1"/>`)
        },
        {
            id: 'compat-smart-home',
            label: 'Smart Home',
            svg: (c, s) => wrap(c, s, `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3"/>`)
        },
        {
            id: 'compat-matter-iot',
            label: 'Matter IoT',
            svg: (c, s) => wrap(c, s, `<polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><circle cx="12" cy="12" r="2.5"/>`)
        },
        {
            id: 'compat-dual-voltage',
            label: '110V-240V',
            svg: (c, s) => wrap(c, s, `<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 12h3M14 12h3"/><polyline points="10 9 12 12 10 15"/>`)
        },
        {
            id: 'compat-12v-vehicle',
            label: '12V Auto',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/><path d="M12 8v8"/>`)
        },
        {
            id: 'compat-pcie-nvme',
            label: 'PCIe NVMe',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="8" width="20" height="8" rx="1"/><line x1="6" y1="16" x2="6" y2="19"/><line x1="10" y1="16" x2="10" y2="19"/><line x1="14" y1="16" x2="14" y2="19"/>`)
        },
        {
            id: 'compat-cpu-socket',
            label: 'CPU Socket',
            svg: (c, s) => wrap(c, s, `<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="8" y="8" width="8" height="8" rx="1"/><circle cx="12" cy="12" r="1"/>`)
        },
        {
            id: 'compat-ram-module',
            label: 'RAM DDR',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="7" width="20" height="10" rx="1"/><line x1="6" y1="17" x2="6" y2="20"/><line x1="10" y1="17" x2="10" y2="20"/><line x1="14" y1="17" x2="14" y2="20"/><line x1="18" y1="17" x2="18" y2="20"/><circle cx="7" cy="11" r="1"/><circle cx="17" cy="11" r="1"/>`)
        },
        {
            id: 'compat-lens-mount',
            label: 'Lens Mount',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="3" x2="12" y2="5"/>`)
        },
        {
            id: 'compat-watch-band',
            label: 'Quick Release',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="6"/><path d="M9 3h6v3H9zM9 18h6v3H9z"/>`)
        },
        {
            id: 'compat-bulb-base',
            label: 'Bulb Base',
            svg: (c, s) => wrap(c, s, `<path d="M9 18h6"/><path d="M10 22h4"/><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>`)
        },
        {
            id: 'compat-plug-and-play',
            label: 'Plug & Play',
            svg: (c, s) => wrap(c, s, `<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 2v6"/><path d="M18 8v5a6 6 0 0 1-12 0V8Z"/><polygon points="12 11 10 13 14 13 12 15"/>`)
        },
        {
            id: 'compat-backwards-fit',
            label: 'Backward Fit',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="m14 8-4 4 4 4"/><line x1="10" y1="12" x2="18" y2="12"/>`)
        },
        {
            id: 'compat-cross-platform',
            label: 'Multi Device',
            svg: (c, s) => wrap(c, s, `<rect x="2" y="4" width="14" height="10" rx="1"/><rect x="12" y="10" width="10" height="10" rx="1"/><line x1="6" y1="17" x2="10" y2="17"/>`)
        },
    ],

    condition: [
        {
            id: 'cond-sparkles',
            label: 'Brand New',
            svg: (c, s) => wrap(c, s, `<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>`)
        },
        {
            id: 'cond-refresh',
            label: 'Refurbished',
            svg: (c, s) => wrap(c, s, `<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>`)
        },
    ],

    eco: [
        {
            id: 'eco-leaf',
            label: 'Eco-Friendly',
            svg: (c, s) => wrap(c, s, `<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>`)
        },
        {
            id: 'eco-recycle',
            label: 'Recyclable',
            svg: (c, s) => wrap(c, s, `<path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5 3.1 10.598"/><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/><path d="m13.378 9.633 4.096 1.098 1.097-4.096"/>`)
        },
    ],

    payment: [
        {
            id: 'pay-credit-card',
            label: 'Secure Payment',
            svg: (c, s) => wrap(c, s, `<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>`)
        },
        {
            id: 'pay-lock',
            label: 'Checkout Protection',
            svg: (c, s) => wrap(c, s, `<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`)
        },
    ],

    location: [
        {
            id: 'loc-map-pin',
            label: 'Local Pickup',
            svg: (c, s) => wrap(c, s, `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>`)
        },
        {
            id: 'loc-flag',
            label: 'Made in USA',
            svg: (c, s) => wrap(c, s, `<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>`)
        },
    ],
}

// ─── Category order ───────────────────────────────────────────────────────────

export const ICON_CATEGORIES: IconCategory[] = ['trust', 'product', 'tech', 'lifestyle', 'pricing', 'customer', 'business', 'tools', 'safety', 'returns', 'packaging', 'compatibility', 'condition', 'eco', 'payment', 'location']

export const CATEGORY_LABELS: Record<IconCategory, string> = {
    trust: 'Trust & Quality',
    product: 'Product & Shipping',
    tech: 'Tech & Performance',
    lifestyle: 'Lifestyle & Nature',
    pricing: 'Pricing & Value',
    customer: 'Customer Service',
    business: 'Seller & Business',
    tools: 'Tools & Hardware',
    safety: 'Safety & Compliance',
    returns: 'Returns & Warranty',
    packaging: 'Packaging',
    compatibility: 'Compatibility',
    condition: 'Item Condition',
    eco: 'Eco & Sustainability',
    payment: 'Payment & Checkout',
    location: 'Location & Origin',
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
