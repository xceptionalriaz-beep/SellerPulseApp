// components/ui/VisualEditor/defaults.ts
// ─────────────────────────────────────────────────────────────────────────────
// Shared defaults and helpers used by both blocks.ts and content.ts.
// This file must NOT import from blocks.ts or content.ts — it is the base
// layer that breaks the circular dependency.
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_COMMON = {
    // Background
    bgColor: '#ffffff',
    bgGradient: false,
    bgGradientFrom: '#7530fb',
    bgGradientTo: '#1e1535',
    bgGradientDir: 135,

    // Spacing
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 24,
    paddingRight: 24,

    // Border
    showBorder: false,
    borderColor: '#ede9fe',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 0,

    // Shadow
    showShadow: false,
    shadowColor: 'rgba(0,0,0,0.10)',
    shadowX: 0,
    shadowY: 4,
    shadowBlur: 12,
    shadowSpread: 0,

    // Typography
    fontFamily: 'Arial, Helvetica, sans-serif',
}

export function wrapBlock(type: string, id: string, innerHtml: string, props?: any): string {
    const linkUrl = props?.linkUrl
    const wrapped = linkUrl
        ? `<a href="${linkUrl}" style="display:block;text-decoration:none;color:inherit;">${innerHtml}</a>`
        : innerHtml
    return `<!-- BLOCK:${type}:${id} -->\n${wrapped}\n<!-- /BLOCK:${type}:${id} -->`
}
