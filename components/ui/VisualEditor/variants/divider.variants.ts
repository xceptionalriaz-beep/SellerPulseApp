// components/ui/VisualEditor/variants/divider.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// DIVIDER BLOCK VARIANTS (20 Professional Compact Styles)
// Pure Zero-Stretch Layout • Zero White Space Gap • Mobile 375px Responsive
// ─────────────────────────────────────────────────────────────────────────────
import type { BlockVariant } from './hero_header.variants'
import { getIconSvg } from '../IconLibrary'

export interface DividerStyleDefinition {
    id: string
    name: string
    label?: string
    description: string
    previewSvg: string
}

// ─────────────────────────────────────────────────────────────────────────────
// 20 STYLES REGISTRY WITH THUMBNAIL ICONS
// ─────────────────────────────────────────────────────────────────────────────
export const DIVIDER_STYLES: DividerStyleDefinition[] = [
    {
        id: 'minimal_diamond',
        name: 'Minimal Diamond',
        description: 'Editorial hairline with centered luxury diamond gem',
        previewSvg: `<svg width="48" height="24" viewBox="0 0 48 24" fill="none"><line x1="2" y1="12" x2="19" y2="12" stroke="#7530fb" stroke-width="1.5" stroke-linecap="round"/><path d="M24 7.5L28.5 12L24 16.5L19.5 12Z" fill="#7530fb"/><line x1="29" y1="12" x2="46" y2="12" stroke="#7530fb" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    },
    {
        id: 'badge_pill',
        name: 'Badge Pill Header',
        description: 'Continuous rule with centered micro-label pill badge',
        previewSvg: `<svg width="48" height="24" viewBox="0 0 48 24" fill="none"><line x1="2" y1="12" x2="13" y2="12" stroke="#94a3b8" stroke-width="1.5"/><rect x="14" y="6" width="20" height="12" rx="6" fill="#7530fb"/><line x1="18" y1="12" x2="30" y2="12" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><line x1="35" y1="12" x2="46" y2="12" stroke="#94a3b8" stroke-width="1.5"/></svg>`,
    },
    {
        id: 'gradient_taper',
        name: 'Gradient Taper',
        description: 'Modern tech soft glow fading out to zero opacity at edges',
        previewSvg: `<svg width="48" height="24" viewBox="0 0 48 24" fill="none"><rect x="2" y="10.5" width="44" height="3" rx="1.5" fill="#7530fb"/></svg>`,
    },
    {
        id: 'executive_pinstripe',
        name: 'Executive Pinstripe',
        description: 'Double parallel rules (1.5px primary + 0.5px hairline)',
        previewSvg: `<svg width="48" height="24" viewBox="0 0 48 24" fill="none"><line x1="2" y1="9.5" x2="46" y2="9.5" stroke="#7530fb" stroke-width="2" stroke-linecap="round"/><line x1="2" y1="14.5" x2="46" y2="14.5" stroke="#cbd5e1" stroke-width="1" stroke-linecap="round"/></svg>`,
    },
    {
        id: 'trust_crest',
        name: 'Trust Crest',
        description: 'Seller credibility medallion with flanked hairline wings',
        previewSvg: `<svg width="48" height="24" viewBox="0 0 48 24" fill="none"><line x1="2" y1="12" x2="17" y2="12" stroke="#94a3b8" stroke-width="1.5"/><circle cx="24" cy="12" r="6" fill="#7530fb"/><path d="M24 8.5L25.3 11.2L28.2 11.5L26 13.4L26.6 16.3L24 14.8L21.4 16.3L22 13.4L19.8 11.5L22.7 11.2L24 8.5Z" fill="#ffffff"/><line x1="31" y1="12" x2="46" y2="12" stroke="#94a3b8" stroke-width="1.5"/></svg>`,
    },
    {
        id: 'artisan_dots',
        name: 'Artisan Dots',
        description: 'Three centered geometric rhythm dots with subtle wings',
        previewSvg: `<svg width="48" height="24" viewBox="0 0 48 24" fill="none"><line x1="2" y1="12" x2="16" y2="12" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round"/><circle cx="20" cy="12" r="1.75" fill="#7530fb"/><circle cx="24" cy="12" r="2.25" fill="#7530fb"/><circle cx="28" cy="12" r="1.75" fill="#7530fb"/><line x1="32" y1="12" x2="46" y2="12" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    },
    {
        id: 'shadow_groove',
        name: 'Shadow Groove',
        description: 'Recessed 3D beveled channel with dual light/dark hairline',
        previewSvg: `<svg width="48" height="24" viewBox="0 0 48 24" fill="none"><line x1="2" y1="11" x2="46" y2="11" stroke="#94a3b8" stroke-width="1.5"/><line x1="2" y1="13" x2="46" y2="13" stroke="#f1f5f9" stroke-width="1.5"/></svg>`,
    },
    {
        id: 'sport_slash',
        name: 'Sport Slash',
        description: 'Angular speed slashes with dual-tone brand accents',
        previewSvg: `<svg width="48" height="24" viewBox="0 0 48 24" fill="none"><line x1="2" y1="12" x2="16" y2="12" stroke="#94a3b8" stroke-width="1.5"/><line x1="19" y1="16" x2="22" y2="8" stroke="#7530fb" stroke-width="2" stroke-linecap="round"/><line x1="23" y1="16" x2="26" y2="8" stroke="#7530fb" stroke-width="2" stroke-linecap="round"/><line x1="27" y1="16" x2="30" y2="8" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/><line x1="33" y1="12" x2="46" y2="12" stroke="#94a3b8" stroke-width="1.5"/></svg>`,
    },
    {
        id: 'tailored_stitch',
        name: 'Tailored Stitch',
        description: 'Apparel and leather goods luxury dashed stitching line',
        previewSvg: `<svg width="48" height="24" viewBox="0 0 48 24" fill="none"><line x1="2" y1="12" x2="46" y2="12" stroke="#7530fb" stroke-width="2" stroke-dasharray="4 3" stroke-linecap="round"/></svg>`,
    },
    {
        id: 'clean_hairline',
        name: 'Clean Hairline',
        description: 'Ultra-thin minimal razor rule with smooth edge clearance',
        previewSvg: `<svg width="48" height="24" viewBox="0 0 48 24" fill="none"><line x1="2" y1="12" x2="46" y2="12" stroke="#64748b" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    },
    {
        id: 'tech_hexagon',
        name: 'Tech Hexagon',
        description: 'Dual interlocking micro-hexagons with tapered wings',
        previewSvg: `<svg width="48" height="24" viewBox="0 0 48 24" fill="none"><line x1="2" y1="12" x2="16" y2="12" stroke="#94a3b8" stroke-width="1.5"/><polygon points="21,8 25,8 27,12 25,16 21,16 19,12" stroke="#7530fb" stroke-width="1.2" fill="none"/><polygon points="27,8 31,8 33,12 31,16 27,16 25,12" stroke="#7530fb" stroke-width="1.2" fill="none"/><line x1="36" y1="12" x2="46" y2="12" stroke="#94a3b8" stroke-width="1.5"/></svg>`,
    },
    {
        id: 'heritage_laurel',
        name: 'Heritage Laurel',
        description: 'Classical botanical wreath emblem with gold hairline rules',
        previewSvg: `<svg width="48" height="24" viewBox="0 0 48 24" fill="none"><line x1="2" y1="12" x2="16" y2="12" stroke="#d4af37" stroke-width="1.5"/><circle cx="24" cy="12" r="6" stroke="#d4af37" stroke-width="1" fill="none"/><circle cx="24" cy="12" r="2" fill="#d4af37"/><line x1="32" y1="12" x2="46" y2="12" stroke="#d4af37" stroke-width="1.5"/></svg>`,
    },
    {
        id: 'barcode_hash',
        name: 'Barcode Hash',
        description: 'Streetwear bracketed retail barcode hash motif',
        previewSvg: `<svg width="48" height="24" viewBox="0 0 48 24" fill="none"><line x1="2" y1="12" x2="14" y2="12" stroke="#94a3b8" stroke-width="1.5"/><path d="M17 8h-2v8h2m14-8h2v8h-2" stroke="#7530fb" stroke-width="1.2" fill="none"/><line x1="20" y1="9" x2="20" y2="15" stroke="#1e1535" stroke-width="1.5"/><line x1="23" y1="9" x2="23" y2="15" stroke="#1e1535" stroke-width="1"/><line x1="26" y1="9" x2="26" y2="15" stroke="#1e1535" stroke-width="2"/><line x1="29" y1="9" x2="29" y2="15" stroke="#1e1535" stroke-width="1"/><line x1="34" y1="12" x2="46" y2="12" stroke="#94a3b8" stroke-width="1.5"/></svg>`,
    },
    {
        id: 'electric_spark',
        name: 'Electric Spark',
        description: 'High-voltage lightning pulse with neon brand accent',
        previewSvg: `<svg width="48" height="24" viewBox="0 0 48 24" fill="none"><line x1="2" y1="12" x2="18" y2="12" stroke="#94a3b8" stroke-width="1.5"/><path d="M25 6l-3 6h4l-3 6 6-7h-4l2-5z" fill="#f59e0b"/><line x1="30" y1="12" x2="46" y2="12" stroke="#94a3b8" stroke-width="1.5"/></svg>`,
    },
    {
        id: 'cross_stitch',
        name: 'Cross-Stitch Tailor',
        description: 'Three delicate artisan embroidered X-marks flanked by rules',
        previewSvg: `<svg width="48" height="24" viewBox="0 0 48 24" fill="none"><line x1="2" y1="12" x2="16" y2="12" stroke="#cbd5e1" stroke-width="1.5"/><path d="M19 10l4 4m0-4l-4 4m6-4l4 4m0-4l-4 4m6-4l4 4m0-4l-4 4" stroke="#7530fb" stroke-width="1.2" stroke-linecap="round"/><line x1="32" y1="12" x2="46" y2="12" stroke="#cbd5e1" stroke-width="1.5"/></svg>`,
    },
    {
        id: 'chevron_flow',
        name: 'Dual Chevron',
        description: 'Directional double arrowheads guiding attention down',
        previewSvg: `<svg width="48" height="24" viewBox="0 0 48 24" fill="none"><line x1="2" y1="12" x2="18" y2="12" stroke="#94a3b8" stroke-width="1.5"/><path d="M22 8l4 4-4 4m5-8l4 4-4 4" stroke="#7530fb" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="32" y1="12" x2="46" y2="12" stroke="#94a3b8" stroke-width="1.5"/></svg>`,
    },
    {
        id: 'ticket_perforated',
        name: 'Ticket Perforated',
        description: 'Voucher tear strip with outer semicircular punch notches',
        previewSvg: `<svg width="48" height="24" viewBox="0 0 48 24" fill="none"><path d="M4 8a4 4 0 0 1 0 8" stroke="#94a3b8" stroke-width="1.5" fill="none"/><line x1="8" y1="12" x2="40" y2="12" stroke="#7530fb" stroke-width="1.5" stroke-dasharray="3 2"/><path d="M44 8a4 4 0 0 0 0 8" stroke="#94a3b8" stroke-width="1.5" fill="none"/></svg>`,
    },
    {
        id: 'tricolor_ribbon',
        name: 'Tri-Color Ribbon',
        description: 'Centered 3-tone micro flag ribbon between sleek hairlines',
        previewSvg: `<svg width="48" height="24" viewBox="0 0 48 24" fill="none"><line x1="2" y1="12" x2="15" y2="12" stroke="#94a3b8" stroke-width="1.5"/><rect x="18" y="9" width="4" height="6" fill="#7530fb"/><rect x="22" y="9" width="4" height="6" fill="#b8fa33"/><rect x="26" y="9" width="4" height="6" fill="#1e1535"/><line x1="33" y1="12" x2="46" y2="12" stroke="#94a3b8" stroke-width="1.5"/></svg>`,
    },
    {
        id: 'soundwave_pulse',
        name: 'Soundwave Pulse',
        description: 'Rhythmic audio sound frequency waveform pulse',
        previewSvg: `<svg width="48" height="24" viewBox="0 0 48 24" fill="none"><line x1="2" y1="12" x2="14" y2="12" stroke="#94a3b8" stroke-width="1.5"/><line x1="17" y1="10" x2="17" y2="14" stroke="#7530fb" stroke-width="1.5" stroke-linecap="round"/><line x1="20" y1="7" x2="20" y2="17" stroke="#7530fb" stroke-width="1.5" stroke-linecap="round"/><line x1="24" y1="5" x2="24" y2="19" stroke="#7530fb" stroke-width="2" stroke-linecap="round"/><line x1="28" y1="7" x2="28" y2="17" stroke="#7530fb" stroke-width="1.5" stroke-linecap="round"/><line x1="31" y1="10" x2="31" y2="14" stroke="#7530fb" stroke-width="1.5" stroke-linecap="round"/><line x1="34" y1="12" x2="46" y2="12" stroke="#94a3b8" stroke-width="1.5"/></svg>`,
    },
    {
        id: 'shield_honor',
        name: 'Shield of Honor',
        description: 'Centered buyer guarantee trust shield with checkmark',
        previewSvg: `<svg width="48" height="24" viewBox="0 0 48 24" fill="none"><line x1="2" y1="12" x2="16" y2="12" stroke="#94a3b8" stroke-width="1.5"/><path d="M24 6l6 3v4c0 4-3 7-6 8-3-1-6-4-6-8V9l6-3z" fill="#16a34a"/><path d="M22 12l1.5 1.5 3-3" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/><line x1="32" y1="12" x2="46" y2="12" stroke="#94a3b8" stroke-width="1.5"/></svg>`,
    },
]

// ─────────────────────────────────────────────────────────────────────────────
// COLOR & SPACING RESOLVERS
// ─────────────────────────────────────────────────────────────────────────────
function resolveDividerColor(p: any): string {
    return p.color || p.dividerColor || p.borderColor || '#7530fb'
}

function resolveDividerWidth(p: any): string {
    const w = p.widthPercent ?? p.width ?? 100
    return typeof w === 'number' ? `${w}%` : w
}

function resolveSpacing(p: any) {
    const top = p.marginTop ?? p.paddingTop ?? 16
    const bottom = p.marginBottom ?? p.paddingBottom ?? 16
    return { top, bottom }
}

// ─────────────────────────────────────────────────────────────────────────────
// ALL 20 COMPACT RENDERING FUNCTIONS (Powered by getIconSvg from IconLibrary)
// ─────────────────────────────────────────────────────────────────────────────
export function variantMinimalDiamond(block: any): string {
    const p = block?.props || block || {}
    const color = resolveDividerColor(p)
    const width = resolveDividerWidth(p)
    const { top, bottom } = resolveSpacing(p)
    const customIcon = p.icon || p.iconName
    const iconContent = customIcon
        ? getIconSvg(customIcon, color, 14)
        : `<span style="display:inline-block;transform:rotate(45deg);width:8px;height:8px;background-color:${color};border-radius:1px;"></span>`

    return `
    <div style="padding:${top}px 12px ${bottom}px 12px;margin:0 auto;text-align:center;background:${p.bgColor || 'transparent'};line-height:0;">
      <div style="width:${width};max-width:850px;margin:0 auto;display:flex;align-items:center;justify-content:center;height:16px;">
        <div style="flex:1;height:1px;background-color:${color}44;"></div>
        <div data-feature-index="0" style="padding:0 12px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;line-height:1;" title="Click to replace icon">
          ${iconContent}
        </div>
        <div style="flex:1;height:1px;background-color:${color}44;"></div>
      </div>
    </div>`
}

export function variantBadgePill(block: any): string {
    const p = block?.props || block || {}
    const color = resolveDividerColor(p)
    const width = resolveDividerWidth(p)
    const label = (p.label || p.badgeText || p.text || 'DETAILS').toUpperCase()
    const { top, bottom } = resolveSpacing(p)
    return `
    <div style="padding:${top}px 12px ${bottom}px 12px;margin:0 auto;text-align:center;background:${p.bgColor || 'transparent'};line-height:0;">
      <div style="width:${width};max-width:850px;margin:0 auto;display:flex;align-items:center;justify-content:center;height:24px;">
        <div style="flex:1;height:1px;background-color:#e2e8f0;"></div>
        <div style="padding:0 12px;">
          <div style="display:inline-block;padding:4px 14px;border-radius:9999px;background-color:${color}15;border:1px solid ${color}33;color:${color};font-family:Arial,sans-serif;font-size:10px;font-weight:800;letter-spacing:1px;line-height:14px;text-transform:uppercase;">${label}</div>
        </div>
        <div style="flex:1;height:1px;background-color:#e2e8f0;"></div>
      </div>
    </div>`
}

export function variantGradientTaper(block: any): string {
    const p = block?.props || block || {}
    const color = resolveDividerColor(p)
    const width = resolveDividerWidth(p)
    const thickness = p.thickness || 2
    const { top, bottom } = resolveSpacing(p)
    return `
    <div style="padding:${top}px 12px ${bottom}px 12px;margin:0 auto;text-align:center;background:${p.bgColor || 'transparent'};line-height:0;">
      <div style="width:${width};max-width:850px;height:${thickness}px;margin:0 auto;background:linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%);border-radius:999px;">&nbsp;</div>
    </div>`
}

export function variantExecutivePinstripe(block: any): string {
    const p = block?.props || block || {}
    const color = resolveDividerColor(p)
    const width = resolveDividerWidth(p)
    const { top, bottom } = resolveSpacing(p)
    return `
    <div style="padding:${top}px 12px ${bottom}px 12px;margin:0 auto;text-align:center;background:${p.bgColor || 'transparent'};line-height:0;">
      <div style="width:${width};max-width:850px;margin:0 auto;">
        <div style="height:2px;background-color:${color};border-radius:1px;"></div>
        <div style="height:3px;"></div>
        <div style="height:1px;background-color:${color}44;border-radius:1px;"></div>
      </div>
    </div>`
}

export function variantTrustCrest(block: any): string {
    const p = block?.props || block || {}
    const color = resolveDividerColor(p)
    const width = resolveDividerWidth(p)
    const { top, bottom } = resolveSpacing(p)
    const rawIcon = p.icon || p.iconName || 'star'
    return `
    <div style="padding:${top}px 12px ${bottom}px 12px;margin:0 auto;text-align:center;background:${p.bgColor || 'transparent'};line-height:0;">
      <div style="width:${width};max-width:850px;margin:0 auto;display:flex;align-items:center;justify-content:center;height:26px;">
        <div style="flex:1;height:1px;background-color:#cbd5e1;"></div>
        <div style="padding:0 10px;">
          <div data-feature-index="0" style="width:26px;height:26px;border-radius:50%;background-color:${color};color:#ffffff;line-height:26px;text-align:center;font-size:13px;font-weight:bold;display:flex;align-items:center;justify-content:center;cursor:pointer;" title="Click to replace icon">
            ${getIconSvg(rawIcon, '#ffffff', 14)}
          </div>
        </div>
        <div style="flex:1;height:1px;background-color:#cbd5e1;"></div>
      </div>
    </div>`
}

export function variantArtisanDots(block: any): string {
    const p = block?.props || block || {}
    const color = resolveDividerColor(p)
    const width = resolveDividerWidth(p)
    const { top, bottom } = resolveSpacing(p)
    return `
    <div style="padding:${top}px 12px ${bottom}px 12px;margin:0 auto;text-align:center;background:${p.bgColor || 'transparent'};line-height:0;">
      <div style="width:${width};max-width:850px;margin:0 auto;display:flex;align-items:center;justify-content:center;height:14px;">
        <div style="flex:1;height:1px;background-color:#cbd5e1;"></div>
        <div style="padding:0 12px;display:flex;align-items:center;justify-content:center;gap:6px;">
          <span style="display:inline-block;width:4px;height:4px;border-radius:50%;background-color:${color}88;"></span>
          <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background-color:${color};"></span>
          <span style="display:inline-block;width:4px;height:4px;border-radius:50%;background-color:${color}88;"></span>
        </div>
        <div style="flex:1;height:1px;background-color:#cbd5e1;"></div>
      </div>
    </div>`
}

export function variantShadowGroove(block: any): string {
    const p = block?.props || block || {}
    const width = resolveDividerWidth(p)
    const { top, bottom } = resolveSpacing(p)
    return `
    <div style="padding:${top}px 12px ${bottom}px 12px;margin:0 auto;text-align:center;background:${p.bgColor || 'transparent'};line-height:0;">
      <div style="width:${width};max-width:850px;margin:0 auto;">
        <div style="height:1px;background-color:#cbd5e1;"></div>
        <div style="height:1px;background-color:#ffffff;"></div>
      </div>
    </div>`
}

export function variantSportSlash(block: any): string {
    const p = block?.props || block || {}
    const color = resolveDividerColor(p)
    const width = resolveDividerWidth(p)
    const { top, bottom } = resolveSpacing(p)
    return `
    <div style="padding:${top}px 12px ${bottom}px 12px;margin:0 auto;text-align:center;background:${p.bgColor || 'transparent'};line-height:0;">
      <div style="width:${width};max-width:850px;margin:0 auto;display:flex;align-items:center;justify-content:center;height:16px;">
        <div style="flex:1;height:1px;background-color:#e2e8f0;"></div>
        <div style="padding:0 10px;font-family:monospace;font-size:14px;font-weight:900;letter-spacing:-1px;line-height:14px;">
          <span style="color:${color};font-style:italic;">/</span>
          <span style="color:${color};font-style:italic;">/</span>
          <span style="color:#94a3b8;font-style:italic;">/</span>
        </div>
        <div style="flex:1;height:1px;background-color:#e2e8f0;"></div>
      </div>
    </div>`
}

export function variantTailoredStitch(block: any): string {
    const p = block?.props || block || {}
    const color = resolveDividerColor(p)
    const width = resolveDividerWidth(p)
    const thickness = p.thickness || 2
    const { top, bottom } = resolveSpacing(p)
    return `
    <div style="padding:${top}px 12px ${bottom}px 12px;margin:0 auto;text-align:center;background:${p.bgColor || 'transparent'};line-height:0;">
      <div style="width:${width};max-width:850px;margin:0 auto;border-top:${thickness}px dashed ${color};opacity:0.85;"></div>
    </div>`
}

export function variantCleanHairline(block: any): string {
    const p = block?.props || block || {}
    const color = p.color || p.dividerColor || '#64748b'
    const width = resolveDividerWidth(p)
    const thickness = p.thickness || 1
    const { top, bottom } = resolveSpacing(p)
    return `
    <div style="padding:${top}px 12px ${bottom}px 12px;margin:0 auto;text-align:center;background:${p.bgColor || 'transparent'};line-height:0;">
      <div style="width:${width};max-width:850px;margin:0 auto;border-top:${thickness}px solid ${color};"></div>
    </div>`
}

// 11 - 20 (NEW COMPACT STYLES)
export function variantTechHexagon(block: any): string {
    const p = block?.props || block || {}
    const color = resolveDividerColor(p)
    const width = resolveDividerWidth(p)
    const { top, bottom } = resolveSpacing(p)
    const customIcon = p.icon || p.iconName
    const iconContent = customIcon
        ? getIconSvg(customIcon, color, 14)
        : '<span style="font-size:14px;line-height:1;">⬡⬡</span>'

    return `
    <div style="padding:${top}px 12px ${bottom}px 12px;margin:0 auto;text-align:center;background:${p.bgColor || 'transparent'};line-height:0;">
      <div style="width:${width};max-width:850px;margin:0 auto;display:flex;align-items:center;justify-content:center;height:16px;">
        <div style="flex:1;height:1px;background-color:${color}44;"></div>
        <div data-feature-index="0" style="padding:0 10px;color:${color};font-weight:bold;line-height:1;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;" title="Click to replace icon">
          ${iconContent}
        </div>
        <div style="flex:1;height:1px;background-color:${color}44;"></div>
      </div>
    </div>`
}

export function variantHeritageLaurel(block: any): string {
    const p = block?.props || block || {}
    const color = p.color || '#d4af37'
    const width = resolveDividerWidth(p)
    const { top, bottom } = resolveSpacing(p)
    const customIcon = p.icon || p.iconName || 'award'
    return `
    <div style="padding:${top}px 12px ${bottom}px 12px;margin:0 auto;text-align:center;background:${p.bgColor || 'transparent'};line-height:0;">
      <div style="width:${width};max-width:850px;margin:0 auto;display:flex;align-items:center;justify-content:center;height:24px;">
        <div style="flex:1;height:1px;background-color:${color}66;"></div>
        <div style="padding:0 8px;">
          <div data-feature-index="0" style="width:24px;height:24px;border-radius:50%;border:1px solid ${color};color:${color};display:flex;align-items:center;justify-content:center;cursor:pointer;" title="Click to replace icon">
            ${getIconSvg(customIcon, color, 12)}
          </div>
        </div>
        <div style="flex:1;height:1px;background-color:${color}66;"></div>
      </div>
    </div>`
}

export function variantBarcodeHash(block: any): string {
    const p = block?.props || block || {}
    const color = resolveDividerColor(p)
    const width = resolveDividerWidth(p)
    const { top, bottom } = resolveSpacing(p)
    return `
    <div style="padding:${top}px 12px ${bottom}px 12px;margin:0 auto;text-align:center;background:${p.bgColor || 'transparent'};line-height:0;">
      <div style="width:${width};max-width:850px;margin:0 auto;display:flex;align-items:center;justify-content:center;height:16px;">
        <div style="flex:1;height:1px;background-color:#cbd5e1;"></div>
        <div style="padding:0 12px;font-family:monospace;font-size:12px;letter-spacing:1px;font-weight:900;color:${color};line-height:1;">[ ||||| ]</div>
        <div style="flex:1;height:1px;background-color:#cbd5e1;"></div>
      </div>
    </div>`
}

export function variantElectricSpark(block: any): string {
    const p = block?.props || block || {}
    const color = p.color || '#f59e0b'
    const width = resolveDividerWidth(p)
    const { top, bottom } = resolveSpacing(p)
    const customIcon = p.icon || p.iconName || 'zap'
    return `
    <div style="padding:${top}px 12px ${bottom}px 12px;margin:0 auto;text-align:center;background:${p.bgColor || 'transparent'};line-height:0;">
      <div style="width:${width};max-width:850px;margin:0 auto;display:flex;align-items:center;justify-content:center;height:18px;">
        <div style="flex:1;height:1.5px;background-color:${color}55;"></div>
        <div data-feature-index="0" style="padding:0 8px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;line-height:1;" title="Click to replace icon">
          ${getIconSvg(customIcon, color, 15)}
        </div>
        <div style="flex:1;height:1.5px;background-color:${color}55;"></div>
      </div>
    </div>`
}

export function variantCrossStitch(block: any): string {
    const p = block?.props || block || {}
    const color = resolveDividerColor(p)
    const width = resolveDividerWidth(p)
    const { top, bottom } = resolveSpacing(p)
    return `
    <div style="padding:${top}px 12px ${bottom}px 12px;margin:0 auto;text-align:center;background:${p.bgColor || 'transparent'};line-height:0;">
      <div style="width:${width};max-width:850px;margin:0 auto;display:flex;align-items:center;justify-content:center;height:16px;">
        <div style="flex:1;height:1px;background-color:#cbd5e1;"></div>
        <div style="padding:0 10px;font-family:sans-serif;font-size:11px;font-weight:800;color:${color};letter-spacing:4px;line-height:1;">✕✕✕</div>
        <div style="flex:1;height:1px;background-color:#cbd5e1;"></div>
      </div>
    </div>`
}

export function variantChevronFlow(block: any): string {
    const p = block?.props || block || {}
    const color = resolveDividerColor(p)
    const width = resolveDividerWidth(p)
    const { top, bottom } = resolveSpacing(p)
    return `
    <div style="padding:${top}px 12px ${bottom}px 12px;margin:0 auto;text-align:center;background:${p.bgColor || 'transparent'};line-height:0;">
      <div style="width:${width};max-width:850px;margin:0 auto;display:flex;align-items:center;justify-content:center;height:16px;">
        <div style="flex:1;height:1px;background-color:#cbd5e1;"></div>
        <div style="padding:0 8px;font-size:14px;font-weight:900;color:${color};letter-spacing:-1px;line-height:1;">❯❯</div>
        <div style="flex:1;height:1px;background-color:#cbd5e1;"></div>
      </div>
    </div>`
}

export function variantTicketPerforated(block: any): string {
    const p = block?.props || block || {}
    const color = resolveDividerColor(p)
    const width = resolveDividerWidth(p)
    const { top, bottom } = resolveSpacing(p)
    return `
    <div style="padding:${top}px 12px ${bottom}px 12px;margin:0 auto;text-align:center;background:${p.bgColor || 'transparent'};line-height:0;">
      <div style="width:${width};max-width:850px;margin:0 auto;display:flex;align-items:center;justify-content:center;height:12px;">
        <div style="width:12px;height:12px;border-radius:50%;border:1px solid #cbd5e1;background:#ffffff;"></div>
        <div style="flex:1;height:1px;border-top:1.5px dashed ${color};margin:0 8px;"></div>
        <div style="width:12px;height:12px;border-radius:50%;border:1px solid #cbd5e1;background:#ffffff;"></div>
      </div>
    </div>`
}

export function variantTriColorRibbon(block: any): string {
    const p = block?.props || block || {}
    const color = resolveDividerColor(p)
    const width = resolveDividerWidth(p)
    const { top, bottom } = resolveSpacing(p)
    return `
    <div style="padding:${top}px 12px ${bottom}px 12px;margin:0 auto;text-align:center;background:${p.bgColor || 'transparent'};line-height:0;">
      <div style="width:${width};max-width:850px;margin:0 auto;display:flex;align-items:center;justify-content:center;height:14px;">
        <div style="flex:1;height:1px;background-color:#cbd5e1;"></div>
        <div style="padding:0 12px;display:inline-flex;gap:1px;">
          <span style="display:inline-block;width:10px;height:6px;background:${color};border-radius:1px 0 0 1px;"></span>
          <span style="display:inline-block;width:10px;height:6px;background:#f59e0b;"></span>
          <span style="display:inline-block;width:10px;height:6px;background:#0f172a;border-radius:0 1px 1px 0;"></span>
        </div>
        <div style="flex:1;height:1px;background-color:#cbd5e1;"></div>
      </div>
    </div>`
}

export function variantSoundwavePulse(block: any): string {
    const p = block?.props || block || {}
    const color = resolveDividerColor(p)
    const width = resolveDividerWidth(p)
    const { top, bottom } = resolveSpacing(p)
    return `
    <div style="padding:${top}px 12px ${bottom}px 12px;margin:0 auto;text-align:center;background:${p.bgColor || 'transparent'};line-height:0;">
      <div style="width:${width};max-width:850px;margin:0 auto;display:flex;align-items:center;justify-content:center;height:20px;">
        <div style="flex:1;height:1px;background-color:#cbd5e1;"></div>
        <div style="padding:0 10px;display:flex;align-items:center;gap:3px;">
          <span style="display:inline-block;width:2px;height:8px;background:${color};border-radius:1px;"></span>
          <span style="display:inline-block;width:2px;height:14px;background:${color};border-radius:1px;"></span>
          <span style="display:inline-block;width:2.5px;height:20px;background:${color};border-radius:1px;"></span>
          <span style="display:inline-block;width:2px;height:14px;background:${color};border-radius:1px;"></span>
          <span style="display:inline-block;width:2px;height:8px;background:${color};border-radius:1px;"></span>
        </div>
        <div style="flex:1;height:1px;background-color:#cbd5e1;"></div>
      </div>
    </div>`
}

export function variantShieldHonor(block: any): string {
    const p = block?.props || block || {}
    const width = resolveDividerWidth(p)
    const { top, bottom } = resolveSpacing(p)
    const customIcon = p.icon || p.iconName || 'check'
    return `
    <div style="padding:${top}px 12px ${bottom}px 12px;margin:0 auto;text-align:center;background:${p.bgColor || 'transparent'};line-height:0;">
      <div style="width:${width};max-width:850px;margin:0 auto;display:flex;align-items:center;justify-content:center;height:22px;">
        <div style="flex:1;height:1px;background-color:#cbd5e1;"></div>
        <div style="padding:0 8px;">
          <div data-feature-index="0" style="width:22px;height:22px;border-radius:4px;background:#16a34a;color:#ffffff;display:flex;align-items:center;justify-content:center;cursor:pointer;" title="Click to replace icon">
            ${getIconSvg(customIcon, '#ffffff', 13)}
          </div>
        </div>
        <div style="flex:1;height:1px;background-color:#cbd5e1;"></div>
      </div>
    </div>`
}

// ─────────────────────────────────────────────────────────────────────────────
// MASTER DISPATCHER (All 20 Styles)
// ─────────────────────────────────────────────────────────────────────────────
export function renderDividerHtml(block: any): string {
    const styleId = block?.styles?.layoutStyle || block?.props?.layoutStyle || block?.props?.variant || 'minimal_diamond'

    switch (styleId) {
        case 'badge_pill':
        case 'div-badge-pill':
            return variantBadgePill(block)
        case 'gradient_taper':
        case 'div-gradient-taper':
            return variantGradientTaper(block)
        case 'executive_pinstripe':
        case 'div-executive-pinstripe':
            return variantExecutivePinstripe(block)
        case 'trust_crest':
        case 'div-trust-crest':
            return variantTrustCrest(block)
        case 'artisan_dots':
        case 'div-artisan-dots':
            return variantArtisanDots(block)
        case 'shadow_groove':
        case 'div-shadow-groove':
            return variantShadowGroove(block)
        case 'sport_slash':
        case 'div-sport-slash':
            return variantSportSlash(block)
        case 'tailored_stitch':
        case 'div-tailored-stitch':
            return variantTailoredStitch(block)
        case 'clean_hairline':
        case 'div-clean-hairline':
            return variantCleanHairline(block)
        // 11 - 20
        case 'tech_hexagon':
        case 'div-tech-hexagon':
            return variantTechHexagon(block)
        case 'heritage_laurel':
        case 'div-heritage-laurel':
            return variantHeritageLaurel(block)
        case 'barcode_hash':
        case 'div-barcode-hash':
            return variantBarcodeHash(block)
        case 'electric_spark':
        case 'div-electric-spark':
            return variantElectricSpark(block)
        case 'cross_stitch':
        case 'div-cross-stitch':
            return variantCrossStitch(block)
        case 'chevron_flow':
        case 'div-chevron-flow':
            return variantChevronFlow(block)
        case 'ticket_perforated':
        case 'div-ticket-perforated':
            return variantTicketPerforated(block)
        case 'tricolor_ribbon':
        case 'div-tricolor-ribbon':
            return variantTriColorRibbon(block)
        case 'soundwave_pulse':
        case 'div-soundwave-pulse':
            return variantSoundwavePulse(block)
        case 'shield_honor':
        case 'div-shield-honor':
            return variantShieldHonor(block)
        case 'minimal_diamond':
        case 'div-minimal-diamond':
        default:
            return variantMinimalDiamond(block)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS FOR index.ts AND blocks.ts
// ─────────────────────────────────────────────────────────────────────────────
export const DIVIDER_THUMBNAILS: Record<string, string> = {
    'minimal_diamond': DIVIDER_STYLES[0].previewSvg,
    'badge_pill': DIVIDER_STYLES[1].previewSvg,
    'gradient_taper': DIVIDER_STYLES[2].previewSvg,
    'executive_pinstripe': DIVIDER_STYLES[3].previewSvg,
    'trust_crest': DIVIDER_STYLES[4].previewSvg,
    'artisan_dots': DIVIDER_STYLES[5].previewSvg,
    'shadow_groove': DIVIDER_STYLES[6].previewSvg,
    'sport_slash': DIVIDER_STYLES[7].previewSvg,
    'tailored_stitch': DIVIDER_STYLES[8].previewSvg,
    'clean_hairline': DIVIDER_STYLES[9].previewSvg,
    'tech_hexagon': DIVIDER_STYLES[10].previewSvg,
    'heritage_laurel': DIVIDER_STYLES[11].previewSvg,
    'barcode_hash': DIVIDER_STYLES[12].previewSvg,
    'electric_spark': DIVIDER_STYLES[13].previewSvg,
    'cross_stitch': DIVIDER_STYLES[14].previewSvg,
    'chevron_flow': DIVIDER_STYLES[15].previewSvg,
    'ticket_perforated': DIVIDER_STYLES[16].previewSvg,
    'tricolor_ribbon': DIVIDER_STYLES[17].previewSvg,
    'soundwave_pulse': DIVIDER_STYLES[18].previewSvg,
    'shield_honor': DIVIDER_STYLES[19].previewSvg,
    // Aliases
    'div-minimal-diamond': DIVIDER_STYLES[0].previewSvg,
    'div-badge-pill': DIVIDER_STYLES[1].previewSvg,
    'div-gradient-taper': DIVIDER_STYLES[2].previewSvg,
    'div-executive-pinstripe': DIVIDER_STYLES[3].previewSvg,
    'div-trust-crest': DIVIDER_STYLES[4].previewSvg,
    'div-artisan-dots': DIVIDER_STYLES[5].previewSvg,
    'div-shadow-groove': DIVIDER_STYLES[6].previewSvg,
    'div-sport-slash': DIVIDER_STYLES[7].previewSvg,
    'div-tailored-stitch': DIVIDER_STYLES[8].previewSvg,
    'div-clean-hairline': DIVIDER_STYLES[9].previewSvg,
    'div-tech-hexagon': DIVIDER_STYLES[10].previewSvg,
    'div-heritage-laurel': DIVIDER_STYLES[11].previewSvg,
    'div-barcode-hash': DIVIDER_STYLES[12].previewSvg,
    'div-electric-spark': DIVIDER_STYLES[13].previewSvg,
    'div-cross-stitch': DIVIDER_STYLES[14].previewSvg,
    'div-chevron-flow': DIVIDER_STYLES[15].previewSvg,
    'div-ticket-perforated': DIVIDER_STYLES[16].previewSvg,
    'div-tricolor-ribbon': DIVIDER_STYLES[17].previewSvg,
    'div-soundwave-pulse': DIVIDER_STYLES[18].previewSvg,
    'div-shield-honor': DIVIDER_STYLES[19].previewSvg,
}

// Uses "label" to match BlockVariant interface
export const dividerVariants: BlockVariant[] = [
    {
        id: 'minimal_diamond',
        label: 'Minimal Diamond',
        description: 'Editorial hairline with centered luxury diamond gem',
        toHtml: (p: any) => variantMinimalDiamond({ props: p }),
    },
    {
        id: 'badge_pill',
        label: 'Badge Pill Header',
        description: 'Continuous rule with centered micro-label pill badge',
        toHtml: (p: any) => variantBadgePill({ props: p }),
    },
    {
        id: 'gradient_taper',
        label: 'Gradient Taper',
        description: 'Modern tech soft glow fading out to zero opacity at edges',
        toHtml: (p: any) => variantGradientTaper({ props: p }),
    },
    {
        id: 'executive_pinstripe',
        label: 'Executive Pinstripe',
        description: 'Double parallel rules (1.5px primary + 0.5px hairline)',
        toHtml: (p: any) => variantExecutivePinstripe({ props: p }),
    },
    {
        id: 'trust_crest',
        label: 'Trust Crest',
        description: 'Seller credibility medallion with flanked hairline wings',
        toHtml: (p: any) => variantTrustCrest({ props: p }),
    },
    {
        id: 'artisan_dots',
        label: 'Artisan Dots',
        description: 'Three centered geometric rhythm dots with subtle wings',
        toHtml: (p: any) => variantArtisanDots({ props: p }),
    },
    {
        id: 'shadow_groove',
        label: 'Shadow Groove',
        description: 'Recessed 3D beveled channel with dual light/dark hairline',
        toHtml: (p: any) => variantShadowGroove({ props: p }),
    },
    {
        id: 'sport_slash',
        label: 'Sport Slash',
        description: 'Angular speed slashes with dual-tone brand accents',
        toHtml: (p: any) => variantSportSlash({ props: p }),
    },
    {
        id: 'tailored_stitch',
        label: 'Tailored Stitch',
        description: 'Apparel and leather goods luxury dashed stitching line',
        toHtml: (p: any) => variantTailoredStitch({ props: p }),
    },
    {
        id: 'clean_hairline',
        label: 'Clean Hairline',
        description: 'Ultra-thin minimal razor rule with smooth edge clearance',
        toHtml: (p: any) => variantCleanHairline({ props: p }),
    },
    {
        id: 'tech_hexagon',
        label: 'Tech Hexagon',
        description: 'Dual interlocking micro-hexagons with tapered wings',
        toHtml: (p: any) => variantTechHexagon({ props: p }),
    },
    {
        id: 'heritage_laurel',
        label: 'Heritage Laurel',
        description: 'Classical botanical wreath emblem with gold hairline rules',
        toHtml: (p: any) => variantHeritageLaurel({ props: p }),
    },
    {
        id: 'barcode_hash',
        label: 'Barcode Hash',
        description: 'Streetwear bracketed retail barcode hash motif',
        toHtml: (p: any) => variantBarcodeHash({ props: p }),
    },
    {
        id: 'electric_spark',
        label: 'Electric Spark',
        description: 'High-voltage lightning pulse with neon brand accent',
        toHtml: (p: any) => variantElectricSpark({ props: p }),
    },
    {
        id: 'cross_stitch',
        label: 'Cross-Stitch Tailor',
        description: 'Three delicate artisan embroidered X-marks flanked by rules',
        toHtml: (p: any) => variantCrossStitch({ props: p }),
    },
    {
        id: 'chevron_flow',
        label: 'Dual Chevron',
        description: 'Directional double arrowheads guiding attention down',
        toHtml: (p: any) => variantChevronFlow({ props: p }),
    },
    {
        id: 'ticket_perforated',
        label: 'Ticket Perforated',
        description: 'Voucher tear strip with outer semicircular punch notches',
        toHtml: (p: any) => variantTicketPerforated({ props: p }),
    },
    {
        id: 'tricolor_ribbon',
        label: 'Tri-Color Ribbon',
        description: 'Centered 3-tone micro flag ribbon between sleek hairlines',
        toHtml: (p: any) => variantTriColorRibbon({ props: p }),
    },
    {
        id: 'soundwave_pulse',
        label: 'Soundwave Pulse',
        description: 'Rhythmic audio sound frequency waveform pulse',
        toHtml: (p: any) => variantSoundwavePulse({ props: p }),
    },
    {
        id: 'shield_honor',
        label: 'Shield of Honor',
        description: 'Centered buyer guarantee trust shield with checkmark',
        toHtml: (p: any) => variantShieldHonor({ props: p }),
    },
]

export const dividerBlockVariants = dividerVariants

export function getDividerVariant(variantId?: string): BlockVariant {
    const cleanId = (variantId || '').replace(/^div-/, '')
    const found = dividerVariants.find(v => v.id === variantId || v.id === cleanId)
    return found ?? dividerVariants[0]
}
