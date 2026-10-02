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
            label: 'UV Safe',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="4"/><path d="M12 4h.01M20 12h.01M12 20h.01M4 12h.01M17.65 6.35h.01M17.65 17.65h.01M6.35 17.65h.01M6.35 6.35h.01"/>`)
        },
        {
            id: 'ltd-co',
            label: 'UK Ltd / LLC',
            svg: (c, s) => wrap(c, s, `<line x1="2" y1="20" x2="22" y2="20"/><line x1="6" y1="11" x2="6" y2="16"/><line x1="10" y1="11" x2="10" y2="16"/><line x1="14" y1="11" x2="14" y2="16"/><line x1="18" y1="11" x2="18" y2="16"/><polygon points="12 2 20 7 4 7"/><line x1="1" y1="20" x2="23" y2="20"/>`)
        },

        // ── 60 New Trust & Quality Icons ─────────────────────────────────────
        {
            id: 'check-check',
            label: 'Double QC Passed',
            svg: (c, s) => wrap(c, s, `<path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/>`)
        },
        {
            id: 'clipboard-check',
            label: 'Inspected Checklist',
            svg: (c, s) => wrap(c, s, `<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>`)
        },
        {
            id: 'heart-handshake',
            label: 'Customer Care Pledge',
            svg: (c, s) => wrap(c, s, `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/><path d="m18 15-2-2"/><path d="m15 18-2-2"/>`)
        },
        {
            id: 'shield-plus',
            label: 'Extended Warranty',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M9 12h6"/><path d="M12 9v6"/>`)
        },
        {
            id: 'stars',
            label: '5-Star Excellence',
            svg: (c, s) => wrap(c, s, `<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="m5 21 1.4-3"/><path d="M3.6 17 6.4 19"/>`)
        },
        {
            id: 'badge-check',
            label: 'Authorized Dealer',
            svg: (c, s) => wrap(c, s, `<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>`)
        },
        {
            id: 'stamp',
            label: 'Official Notary Seal',
            svg: (c, s) => wrap(c, s, `<path d="M5 22h14"/><path d="M19.27 13.73A2.5 2.5 0 0 0 17.5 13h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1.5c0-.66-.26-1.3-.73-1.77Z"/><path d="M14 13V8.5C14 7.12 12.88 6 11.5 6S9 7.12 9 8.5V13"/>`)
        },
        {
            id: 'file-signature',
            label: 'Certificate Signed',
            svg: (c, s) => wrap(c, s, `<path d="M20 19.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.5L20 7.5V11"/><polyline points="14 2 14 8 20 8"/><path d="M18.42 15.61a2.1 2.1 0 1 1 2.97 2.97L15.5 24.5 12 25l.5-3.5 5.92-5.89Z"/>`)
        },
        {
            id: 'gem',
            label: 'Precious & Authentic',
            svg: (c, s) => wrap(c, s, `<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l4 12 4-12-3-6"/>`)
        },
        {
            id: 'microscope',
            label: 'Lab Tested Quality',
            svg: (c, s) => wrap(c, s, `<path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>`)
        },
        {
            id: 'test-tube',
            label: 'Material Chemical Tested',
            svg: (c, s) => wrap(c, s, `<path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5h0c-1.4 0-2.5-1.1-2.5-2.5V2"/><path d="M8.5 2h7"/><path d="M14.5 16h-5"/>`)
        },
        {
            id: 'stethoscope',
            label: 'Medical Grade Tested',
            svg: (c, s) => wrap(c, s, `<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>`)
        },
        {
            id: 'ribbon',
            label: '1st Place Quality',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>`)
        },
        {
            id: 'shield-star',
            label: 'Elite Star Seller',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polygon points="12 8 13.5 11 17 11.5 14.5 14 15 17.5 12 16 9 17.5 9.5 14 7 11.5 10.5 11 12 8"/>`)
        },
        {
            id: 'copyright',
            label: 'Genuine Original IP',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M15 9.354a4 4 0 1 0 0 5.292"/>`)
        },
        {
            id: 'eye',
            label: '100% Transparent Spec',
            svg: (c, s) => wrap(c, s, `<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`)
        },
        {
            id: 'scan-face',
            label: 'Authenticity ID Checked',
            svg: (c, s) => wrap(c, s, `<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>`)
        },
        {
            id: 'hard-hat',
            label: 'Safety Standards Met',
            svg: (c, s) => wrap(c, s, `<path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a6 6 0 0 1 6-6h0"/><path d="M14 6h0a6 6 0 0 1 6 6v3"/>`)
        },
        {
            id: 'zap-off',
            label: 'Shock Proof / Safe',
            svg: (c, s) => wrap(c, s, `<polyline points="12.41 6.75 13 2 10.57 4.92"/><polyline points="18.57 12.91 21 10 15.66 10"/><polyline points="8 8 3 14 12 14 11 22 16 16"/><line x1="1" y1="1" x2="23" y2="23"/>`)
        },
        {
            id: 'flame-kindling',
            label: 'Fire Retardant Tested',
            svg: (c, s) => wrap(c, s, `<path d="M12 2c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 17 10c0 2.5-2 4.5-5 4.5s-5-2-5-4.5c0-1.5.5-2.5 1.5-3.5C9.5 5.5 11 5 12 2Z"/><path d="m4 19 16-2"/><path d="m4 17 16 2"/>`)
        },
        {
            id: 'leaf-check',
            label: 'RoHS / Eco Compliant',
            svg: (c, s) => wrap(c, s, `<path d="M11 20A7 7 0 0 1 4 13C4 8 9 3 17 2c0 8-5 13-10 13"/><path d="m14 14 2 2 4-4"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/>`)
        },
        {
            id: 'recycle-check',
            label: 'Non-Toxic Recyclable',
            svg: (c, s) => wrap(c, s, `<path d="M7 19H4.8a1.8 1.8 0 0 1-1.6-.9 1.8 1.8 0 0 1 0-1.8L7.2 9.5"/><path d="M11 19h8.2a1.8 1.8 0 0 0 1.6-.9 1.8 1.8 0 0 0 0-1.8l-1.2-2.1"/><path d="m14 16 3 3-3 3"/><path d="m18 10-3-3 3-3"/>`)
        },
        {
            id: 'sparkles-check',
            label: 'Sanitized Clean Item',
            svg: (c, s) => wrap(c, s, `<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="m9 12 2 2 4-4"/>`)
        },
        {
            id: 'building-2',
            label: 'Direct Manufacturer',
            svg: (c, s) => wrap(c, s, `<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>`)
        },
        {
            id: 'store',
            label: 'Authorized Storefront',
            svg: (c, s) => wrap(c, s, `<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><circle cx="12" cy="12" r="2"/>`)
        },
        {
            id: 'users',
            label: '50k+ Happy Buyers',
            svg: (c, s) => wrap(c, s, `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`)
        },
        {
            id: 'user-shield',
            label: 'Merchant Security',
            svg: (c, s) => wrap(c, s, `<path d="M14 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8" cy="7" r="4"/><path d="M18 11s3-1.5 3-4V4l-3-1-3 1v3c0 2.5 3 4 3 4z"/>`)
        },
        {
            id: 'globe-check',
            label: 'ISO Global Standard',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`)
        },
        {
            id: 'badge-dollar',
            label: 'Price Match Guarantee',
            svg: (c, s) => wrap(c, s, `<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="M12 8v8"/><path d="M10 10h4a1 1 0 0 1 0 2h-4a1 1 0 0 0 0 2h4"/>`)
        },
        {
            id: 'clock-check',
            label: '24hr Resolution Guarantee',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/><path d="m16 16 2 2 4-4"/>`)
        },
        {
            id: 'thumbs-up-double',
            label: '100% Positive Feedback',
            svg: (c, s) => wrap(c, s, `<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3"/><path d="M19 14h3a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-3"/>`)
        },
        {
            id: 'smile-plus',
            label: 'Delight Guaranteed',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>`)
        },
        {
            id: 'shield-minus',
            label: 'Zero Defect Policy',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><line x1="9" y1="12" x2="15" y2="12"/>`)
        },
        {
            id: 'badge-alert',
            label: 'Authenticity Warning Protected',
            svg: (c, s) => wrap(c, s, `<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`)
        },
        {
            id: 'key-round',
            label: 'Genuine License Key',
            svg: (c, s) => wrap(c, s, `<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>`)
        },
        {
            id: 'history',
            label: 'Established Heritage',
            svg: (c, s) => wrap(c, s, `<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><polyline points="12 7 12 12 15 15"/>`)
        },
        {
            id: 'file-lock',
            label: 'Encrypted VAT Invoice',
            svg: (c, s) => wrap(c, s, `<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><rect width="6" height="5" x="9" y="13" rx="1"/><path d="M10 13V11a2 2 0 0 1 4 0v2"/>`)
        },
        {
            id: 'server-shield',
            label: 'Data Privacy Guard',
            svg: (c, s) => wrap(c, s, `<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M12 12s3-1.5 3-4V5l-3-1-3 1v3c0 2.5 3 4 3 4z"/>`)
        },
        {
            id: 'check-circle',
            label: '100% Tested Working',
            svg: (c, s) => wrap(c, s, `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`)
        },
        {
            id: 'search-check',
            label: 'Counterfeit Inspection',
            svg: (c, s) => wrap(c, s, `<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><path d="m8 11 2 2 4-4"/>`)
        },
        {
            id: 'shield-half',
            label: 'Limited Manufacturer Warranty',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 22V2"/>`)
        },
        {
            id: 'shield-ellipsis',
            label: 'Full Protection Policy',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/>`)
        },
        {
            id: 'lock-keyhole',
            label: 'Tamper Resistant Seal',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="16" r="1"/><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M7 10V7a5 5 0 0 1 10 0v3"/>`)
        },
        {
            id: 'award-ribbon',
            label: 'Customer Choice Winner',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="9" r="6"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/>`)
        },
        {
            id: 'message-circle-heart',
            label: '5-Star Buyer Endorsed',
            svg: (c, s) => wrap(c, s, `<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M12 8c.5-1 1.5-1.5 2.5-1.5 1.5 0 2.5 1 2.5 2.5 0 2-2.5 3.5-5 5.5-2.5-2-5-3.5-5-5.5 0-1.5 1-2.5 2.5-2.5 1 0 2 .5 2.5 1.5"/>`)
        },
        {
            id: 'badge-help',
            label: 'Free Lifetime Support',
            svg: (c, s) => wrap(c, s, `<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>`)
        },
        {
            id: 'shield-question',
            label: 'Buyer Protection FAQ',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>`)
        },
        {
            id: 'check-square',
            label: 'Box Contents Inspected',
            svg: (c, s) => wrap(c, s, `<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>`)
        },
        {
            id: 'user-star',
            label: 'Rated Power Seller',
            svg: (c, s) => wrap(c, s, `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polygon points="19 8 20 10.5 22.5 10.8 20.5 12.5 21 15 19 13.8 17 15 17.5 12.5 15.5 10.8 18 10.5 19 8"/>`)
        },
        {
            id: 'star-half',
            label: 'Top 1% Rated Category',
            svg: (c, s) => wrap(c, s, `<path d="M12 17.8 5.8 21 7 14.1 2 9.3l7-1L12 2"/><path d="M12 2v15.8"/>`)
        },
        {
            id: 'tag-check',
            label: 'Authentic Retail Tag',
            svg: (c, s) => wrap(c, s, `<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><path d="m9 11 2 2 4-4"/>`)
        },
        {
            id: 'box-check',
            label: 'Unopened Factory Sealed',
            svg: (c, s) => wrap(c, s, `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m9 12 2 2 4-4"/>`)
        },
        {
            id: 'truck-check',
            label: 'Guaranteed Arrival Safe',
            svg: (c, s) => wrap(c, s, `<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/><path d="m6 9 2 2 4-4"/>`)
        },
        {
            id: 'package-check',
            label: 'Checked & Repacked',
            svg: (c, s) => wrap(c, s, `<path d="m16 16 2 2 4-4"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/>`)
        },
        {
            id: 'badge-award',
            label: 'Certificate of Provenance',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="8" r="5"/><path d="m9.5 13-2 8 4.5-2.5L16.5 21l-2-8"/>`)
        },
        {
            id: 'shield-x',
            label: 'Defect Free Guarantee',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><line x1="9.5" y1="9.5" x2="14.5" y2="14.5"/><line x1="14.5" y1="9.5" x2="9.5" y2="14.5"/>`)
        },
        {
            id: 'award-star',
            label: 'Top Quality Choice',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="8" r="6"/><polygon points="12 5 13 7 15 7.5 13.5 9 14 11 12 10 10 11 10.5 9 9 7.5 11 7 12 5"/><path d="m15.5 13 1.5 8-5-2.5L7 21l1.5-8"/>`)
        },
        {
            id: 'shield-check-gold',
            label: '100% Lifetime Protection',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="8 11 11 14 17 8" stroke-width="2.5"/>`)
        },
        {
            id: 'check-decagram',
            label: 'Accredited Merchant Seal',
            svg: (c, s) => wrap(c, s, `<polygon points="12 2 15 5 19 5 20 9 23 12 20 15 19 19 15 19 12 22 9 19 5 19 4 15 1 12 4 9 5 5 9 5 12 2"/><polyline points="8 12 11 15 16 10"/>`)
        },
        {
            id: 'badge-verified-solid',
            label: 'Official Seller Seal',
            svg: (c, s) => wrap(c, s, `<path d="M12 2l2.4 2.5 3.4-.4 1.4 3.1 3.2 1.3-.3 3.5 2.1 2.8-2.1 2.8.3 3.5-3.2 1.3-1.4 3.1-3.4-.4L12 22l-2.4-2.5-3.4.4-1.4-3.1-3.2-1.3.3-3.5L-.2 9.2l2.1-2.8-.3-3.5 3.2-1.3 1.4-3.1 3.4.4L12 2z"/><polyline points="8 12 11 15 16 10"/>`)
        },
        // ── 50 Advanced eBay Trust & Quality Icons ────────────────────────────
        {
            id: 'infinity',
            label: 'Lifetime Warranty Guarantee',
            svg: (c, s) => wrap(c, s, `<path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"/>`)
        },
        {
            id: 'shield-dollar',
            label: 'No Restocking Fee Refund',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v8"/><path d="M10 10h4a1 1 0 0 1 0 2h-4a1 1 0 0 0 0 2h4"/>`)
        },
        {
            id: 'car-check',
            label: 'eBay Motors Fitment Guaranteed',
            svg: (c, s) => wrap(c, s, `<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="m9 9 2 2 4-4"/>`)
        },
        {
            id: 'vault',
            label: 'Vault Authenticated Storage',
            svg: (c, s) => wrap(c, s, `<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M12 8V6"/><path d="M12 18v-2"/><path d="M8 12H6"/><path d="M18 12h-2"/>`)
        },
        {
            id: 'battery-check',
            label: '85%+ Battery Health Tested',
            svg: (c, s) => wrap(c, s, `<rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="11" x2="23" y2="13"/><path d="m7 12 2 2 4-4"/>`)
        },
        {
            id: 'cpu-check',
            label: 'Logic Board 100% Tested',
            svg: (c, s) => wrap(c, s, `<rect x="4" y="4" width="16" height="16" rx="2"/><path d="m9 12 2 2 4-4"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"/>`)
        },
        {
            id: 'screen-check',
            label: 'Zero Dead Pixels Certified',
            svg: (c, s) => wrap(c, s, `<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/><path d="m8 10 2 2 4-4"/>`)
        },
        {
            id: 'refresh-cw',
            label: 'Factory Certified Refurbished',
            svg: (c, s) => wrap(c, s, `<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>`)
        },
        {
            id: 'grade-a-plus',
            label: 'Grade A+ Pristine Cosmetic',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M8 15h3m-1.5-6v6M14 12h4M16 10v4"/>`)
        },
        {
            id: 'shoe-check',
            label: 'Sneaker Con Authenticated',
            svg: (c, s) => wrap(c, s, `<path d="M2 17h20v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/><path d="M2 17c0-3 1.5-6 4-7l5-2 4 4 5 1a2 2 0 0 1 2 2v2"/><path d="m9 11 2 2 4-4"/>`)
        },
        {
            id: 'watch-check',
            label: 'Timegrapher Precision Tested',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="7"/><path d="M12 9v3l2 2"/><path d="m8 1 1 3h6l1-3"/><path d="m8 23 1-3h6l1 3"/><path d="m17 9 2 2 3-3"/>`)
        },
        {
            id: 'bag-check',
            label: 'Luxury Leather Verified',
            svg: (c, s) => wrap(c, s, `<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="m9 13 2 2 4-4"/>`)
        },
        {
            id: 'coins-stack',
            label: 'Bullion .999 Purity Assay',
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
            label: 'Neodymium N52 Magnet Grade',
            svg: (c, s) => wrap(c, s, `<path d="m6 15-4-4 6.7-6.7a5.5 5.5 0 0 1 7.8 0l1.2 1.2a5.5 5.5 0 0 1 0 7.8L11 20l-4-4"/><path d="m9 9 4 4"/><path d="m4 13 4 4"/><path d="m14 14 2 2 3-3"/>`)
        },
        {
            id: 'shield-heart',
            label: 'BPA-Free / Food Contact Safe',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 14.5c-1-1-2-.5-2 0s1.5 2 2 2.5c.5-.5 2-1.5 2-2.5s-1-1-2 0z"/>`)
        },
        {
            id: 'baby-check',
            label: 'CPC / Child Safety Certified',
            svg: (c, s) => wrap(c, s, `<path d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/><path d="m17 17 2 2 3-3"/>`)
        },
        {
            id: 'sparkles-shield',
            label: 'Hypoallergenic & Nickel-Free',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><polygon points="12 7 13 10 16 10 13.5 12 14.5 15 12 13 9.5 15 10.5 12 8 10 11 10 12 7"/>`)
        },
        {
            id: 'sun-dim',
            label: 'Non-Fading UV Stabilized',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="4"/><path d="M12 4h.01M20 12h.01M12 20h.01M4 12h.01M17.65 6.35h.01M17.65 17.65h.01M6.35 17.65h.01M6.35 6.35h.01"/>`)
        },
        {
            id: 'leaf-heart',
            label: 'Cruelty-Free & Sustainable',
            svg: (c, s) => wrap(c, s, `<path d="M11 20A7 7 0 0 1 4 13C4 8 9 3 17 2c0 8-5 13-10 13"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/><path d="M14 11.5c-1-1-2-.5-2 0s1.5 2 2 2.5c.5-.5 2-1.5 2-2.5s-1-1-2 0z"/>`)
        },
        {
            id: 'building-bank',
            label: 'UK Registered Ltd / US LLC',
            svg: (c, s) => wrap(c, s, `<line x1="2" y1="20" x2="22" y2="20"/><line x1="6" y1="11" x2="6" y2="16"/><line x1="10" y1="11" x2="10" y2="16"/><line x1="14" y1="11" x2="14" y2="16"/><line x1="18" y1="11" x2="18" y2="16"/><polygon points="12 2 20 7 4 7"/><line x1="1" y1="20" x2="23" y2="20"/>`)
        },
        {
            id: 'scale-balanced',
            label: 'Distance Selling Act Compliant',
            svg: (c, s) => wrap(c, s, `<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h18"/>`)
        },
        {
            id: 'message-check',
            label: '< 1hr Fast Response Time',
            svg: (c, s) => wrap(c, s, `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="m9 10 2 2 4-4"/>`)
        },
        {
            id: 'phone-call-check',
            label: 'Dedicated Phone Line',
            svg: (c, s) => wrap(c, s, `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/><path d="m14 5 2 2 4-4"/>`)
        },
        {
            id: 'user-heart',
            label: 'Family Run Business Trust',
            svg: (c, s) => wrap(c, s, `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 11a4 4 0 1 0-4-4"/>`)
        },
        {
            id: 'quote-check',
            label: 'Customer Review Authenticated',
            svg: (c, s) => wrap(c, s, `<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="m13 14 2 2 4-4"/>`)
        },
        {
            id: 'sparkle-seal',
            label: 'Mint Uncirculated Certified',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="m12 6 1.5 4.5L18 12l-4.5 1.5L12 18l-1.5-4.5L6 12l4.5-1.5Z"/>`)
        },
        {
            id: 'keyhole',
            label: 'Anti-Theft Register Checked',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="10" r="3"/><path d="M12 13v4"/><circle cx="12" cy="12" r="10"/>`)
        },
        {
            id: 'badge-minus',
            label: 'Zero Hidden Fees',
            svg: (c, s) => wrap(c, s, `<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><line x1="9" y1="12" x2="15" y2="12"/>`)
        },
        {
            id: 'file-text-check',
            label: 'Detailed Spec Sheet Verified',
            svg: (c, s) => wrap(c, s, `<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9 14 2 2 4-4"/><line x1="8" y1="18" x2="16" y2="18"/>`)
        },
        {
            id: 'shield-round',
            label: 'All-Weather Sealed Protection',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="12" r="3"/>`)
        },
        {
            id: 'box-open-check',
            label: 'Complete In-Box Accessories',
            svg: (c, s) => wrap(c, s, `<path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/><path d="m8 10 2 2 4-4"/>`)
        },
        {
            id: 'shield-lock-gold',
            label: 'Escrow Protected Payment',
            svg: (c, s) => wrap(c, s, `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><rect width="6" height="5" x="9" y="10" rx="1"/><path d="M10 10V8.5a2 2 0 0 1 4 0V10"/>`)
        },
        {
            id: 'diamond-star',
            label: 'Pristine Flawless Quality',
            svg: (c, s) => wrap(c, s, `<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/>`)
        },
        {
            id: 'badge-check-gold',
            label: 'Top Rated eBay Plus Seller',
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
            id: 'globe',
            label: 'Global Transit',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`)
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
            id: 'percent',
            label: 'Volume Discount',
            svg: (c, s) => wrap(c, s, `<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>`)
        },
        {
            id: 'coins',
            label: 'Cashback & Rewards',
            svg: (c, s) => wrap(c, s, `<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>`)
        },
        {
            id: 'banknote',
            label: 'Money Back Guarantee',
            svg: (c, s) => wrap(c, s, `<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>`)
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
            id: 'key',
            label: 'OEM Fitment Key',
            svg: (c, s) => wrap(c, s, `<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>`)
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
            id: 'sliders',
            label: 'Calibrated Precision',
            svg: (c, s) => wrap(c, s, `<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>`)
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
        {
            id: 'scissors',
            label: 'Trim-to-Fit',
            svg: (c, s) => wrap(c, s, `<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>`)
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
            id: 'gem',
            label: 'Gemstone',
            svg: (c, s) => wrap(c, s, `<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l4 12 4-12-3-6"/>`)
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
            id: 'phone',
            label: 'Phone Call',
            svg: (c, s) => wrap(c, s, `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>`)
        },
        {
            id: 'mail',
            label: 'Email',
            svg: (c, s) => wrap(c, s, `<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>`)
        },
        {
            id: 'message-square',
            label: 'Messages',
            svg: (c, s) => wrap(c, s, `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`)
        },
        {
            id: 'help-circle',
            label: 'Help Guide',
            svg: (c, s) => wrap(c, s, `<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>`)
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
