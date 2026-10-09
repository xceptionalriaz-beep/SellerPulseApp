// components/ui/VisualEditor/variants/heading.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Section Heading Retails Architectures (10 Distinct Layout Styles)
//
// Grounded in Top-Rated eBay Power-Seller Storefronts:
// • Style 1 is 100% IDENTICAL to your current baseline style (same HTML, same structure)
// • 9 new radically distinct commercial retail heading architectures
// • 100% full-width edge-to-edge across desktop (1000px) and mobile (375px)
// • Crisp vector SVG icons (zero emojis, zero glassy AI slop)
// • Pure eBay-compliant inline CSS and HTML table architecture (VeRO safe)
//
// 10 Distinct Layout Styles:
//   1.  hd-classic-accent-bar       (Current Baseline — 100% SAME TO SAME left accent bar)
//   2.  hd-underline-ribbon         (Left-Aligned Title with 3px Bottom Accent Stripe)
//   3.  hd-centered-hairlines       (Symmetric Boutique Header with Flanking 1px Rules)
//   4.  hd-editorial-pill-tag       (Editorial Micro-Tag Above Bold Section Headline)
//   5.  hd-icon-badge-prefix        (Square Vector Icon Badge + Title + Subtitle)
//   6.  hd-swiss-double-rule        (Minimalist Swiss Architectural Top & Bottom Hairlines)
//   7.  hd-dark-slate-ribbon        (Midnight High-Contrast Flagship Band for Tech/Motors)
//   8.  hd-step-counter-header      (Numbered Milestone Badge: "01", "02" Section Break)
//   9.  hd-outlined-card-frame      (Enclosed 1px Frame with Left Accent Stripe)
//   10. hd-split-verified-badge     (Headline on Left with Official Trust Chip on Right)
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockVariant } from './section_label.variants'
import { getIconSvg } from '../IconLibrary'

export interface HeadingProps {
    text?: string
    level?: 'h1' | 'h2' | 'h3' | 'h4'
    color?: string
    fontSize?: number
    align?: 'left' | 'center' | 'right'
    fontWeight?: string
    lineHeight?: number
    letterSpacing?: number
    borderBottom?: boolean
    accentColor?: string
    bgColor?: string
    paddingTop?: number
    paddingBottom?: number
    paddingLeft?: number
    paddingRight?: number
    variant?: string
    subtitle?: string
    badgeText?: string
}

// ── Shared Vector SVG Icons (Sharp, Zero Emojis) ──────────────────────────────

function getLayersIconSvg(color = '#7530fb', size = 16): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`
}

function getCheckShieldSvg(color = '#16a34a', size = 14): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:3px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`
}

function getDiamondSvg(color = '#d97706', size = 10): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="1" style="display:inline-block;vertical-align:middle;"><polygon points="12 2 22 12 12 22 2 12 12 2"/></svg>`
}

// ── Property Resolvers ────────────────────────────────────────────────────────

function getText(p: any): string {
    return p.text || 'Section Heading'
}

function getTag(p: any): string {
    return p.level || 'h2'
}

function pad(p: any, defaultTop = 16, defaultRight = 24, defaultBottom = 16, defaultLeft = 24): string {
    const pt = p.paddingTop ?? defaultTop
    const pr = p.paddingRight ?? defaultRight
    const pb = p.paddingBottom ?? defaultBottom
    const pl = p.paddingLeft ?? defaultLeft
    return `padding:${pt}px ${pr}px ${pb}px ${pl}px;`
}

function resolveBg(p: any, defaultColor = '#ffffff'): string {
    if (p.bgColor && p.bgColor !== '#7530fb') return p.bgColor
    return defaultColor
}

function resolveText(p: any, defaultColor = '#1e1535'): string {
    if (p.color && p.color !== '#ffffff') return p.color
    return defaultColor
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLASSIC ACCENT BAR (CURRENT BASELINE — 100% SAME TO SAME)
// Clean left accent pillar bar with full-width table container
// ─────────────────────────────────────────────────────────────────────────────
function variantClassicAccentBar(p: any, id: string): string {
    const text = getText(p)
    const tag = getTag(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#1e1535')
    const accent = p.accentColor || '#7530fb'
    const fontSize = p.fontSize ?? 22
    const fontWeight = p.fontWeight || '700'
    const align = p.align || 'left'
    const border = p.borderBottom !== false
        ? `border-left:4px solid ${accent};padding-left:12px;`
        : ''
    const lsEm = ((p.letterSpacing ?? 0) / (p.fontSize ?? 22)).toFixed(4)

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p)}box-sizing:border-box;">
          <${tag} style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:${fontWeight};line-height:1.2;letter-spacing:${lsEm}em;color:${color};text-align:${align};${border}">
            ${text}
          </${tag}>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. UNDERLINE RIBBON (Commercial Retail Bottom Accent Stripe)
// Title with a crisp 3px accent bar underline
// ─────────────────────────────────────────────────────────────────────────────
function variantUnderlineRibbon(p: any, id: string): string {
    const text = getText(p)
    const tag = getTag(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#0f172a')
    const accent = p.accentColor || '#7530fb'
    const fontSize = p.fontSize ?? 22
    const fontWeight = p.fontWeight || '800'
    const align = p.align || 'left'

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
            <tr>
              <td align="${align}">
                <${tag} style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:${fontWeight};color:${color};line-height:1.2;letter-spacing:-0.3px;">
                  ${text}
                </${tag}>
                <div style="width:50px;height:3.5px;background-color:${accent};border-radius:2px;${align === 'center' ? 'margin:0 auto;' : align === 'right' ? 'margin-left:auto;' : ''}"></div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CENTERED HAIRLINES (Boutique Symmetry with Flanking Rules)
// Centered title flanked by thin 1px rules for jewelry, watches & fashion
// ─────────────────────────────────────────────────────────────────────────────
function variantCenteredHairlines(p: any, id: string): string {
    const text = getText(p)
    const tag = getTag(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#1c1917')
    const accent = p.accentColor || '#d97706'
    const fontSize = p.fontSize ?? 20
    const diamond = getDiamondSvg(accent, 10)

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td valign="middle" style="border-bottom:1px solid #e2e8f0;font-size:1px;line-height:1px;">&nbsp;</td>
              <td valign="middle" align="center" style="white-space:nowrap;padding:0 14px;box-sizing:border-box;">
                <span style="margin-right:6px;vertical-align:middle;">${diamond}</span>
                <${tag} style="display:inline-block;margin:0;font-family:Georgia,serif;font-size:${fontSize}px;font-weight:700;color:${color};letter-spacing:1px;text-transform:uppercase;vertical-align:middle;line-height:1.2;">
                  ${text}
                </${tag}>
                <span style="margin-left:6px;vertical-align:middle;">${diamond}</span>
              </td>
              <td valign="middle" style="border-bottom:1px solid #e2e8f0;font-size:1px;line-height:1px;">&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. EDITORIAL PILL TAG (Category Label Pill + Bold Headline)
// Micro-capsule badge on top followed by an authoritative title
// ─────────────────────────────────────────────────────────────────────────────
function variantEditorialPillTag(p: any, id: string): string {
    const text = getText(p)
    const tag = getTag(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#0f172a')
    const accent = p.accentColor || '#7530fb'
    const fontSize = p.fontSize ?? 22
    const badgeText = p.badgeText || 'SECTION OVERVIEW'

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p)}box-sizing:border-box;">
          <div style="margin-bottom:5px;">
            <span style="display:inline-block;padding:2.5px 8px;background:#f3eeff;border:1px solid #ddd6fe;border-radius:4px;font-family:Arial,sans-serif;font-size:9px;font-weight:800;color:${accent};letter-spacing:0.8px;text-transform:uppercase;">
              ${badgeText}
            </span>
          </div>
          <${tag} style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:900;color:${color};line-height:1.2;letter-spacing:-0.4px;">
            ${text}
          </${tag}>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. ICON BADGE PREFIX (Vector Icon Badge + Title + Subtitle)
// Square vector icon frame with title and explanatory subtext
// ─────────────────────────────────────────────────────────────────────────────
function variantIconBadgePrefix(p: any, id: string): string {
    const text = getText(p)
    const tag = getTag(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#0f172a')
    const accent = p.accentColor || '#7530fb'
    const fontSize = p.fontSize ?? 21
    const subtitle = p.subtitle || 'Verified product specifications & technical details'

    // Dynamically resolves icon from IconLibrary or fallback
    const iconId = p.icon || p.iconName || 'layers'
    let iconSvg = ''
    try {
        iconSvg = getIconSvg(iconId, accent, 18)
    } catch {
        iconSvg = getLayersIconSvg(accent, 18)
    }
    if (!iconSvg) {
        iconSvg = getLayersIconSvg(accent, 18)
    }

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
            <tr>
              <!-- Interactive Clickable Icon Badge (Clean single Slot Selection UI) -->
              <td width="46" valign="middle" align="center" style="width:46px;padding-right:10px;box-sizing:border-box;">
                <div data-slot="icon" title="Click to change icon" style="width:36px;height:36px;background:#f3eeff;border:1px solid #ddd6fe;border-radius:8px;text-align:center;line-height:36px;box-sizing:border-box;cursor:pointer;display:inline-block;vertical-align:middle;">
                  ${iconSvg}
                </div>
              </td>
              <!-- Title & Subtitle -->
              <td valign="middle" align="left" style="box-sizing:border-box;">
                <${tag} style="margin:0 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:800;color:${color};line-height:1.2;letter-spacing:-0.3px;word-break:break-word;">
                  ${text}
                </${tag}>
                <p style="margin:0;font-family:Arial,sans-serif;font-size:11.5px;color:#64748b;line-height:1.35;word-break:break-word;">
                  ${subtitle}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. SWISS DOUBLE RULE (Minimalist Editorial Top & Bottom Borders)
// Hairline double border rules for clean Scandinavian high-end retail
// ─────────────────────────────────────────────────────────────────────────────
function variantSwissDoubleRule(p: any, id: string): string {
    const text = getText(p)
    const tag = getTag(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#1e1535')
    const fontSize = p.fontSize ?? 20

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1.5px solid #0f172a;border-bottom:1px solid #e2e8f0;">
            <tr>
              <td style="padding:10px 0;">
                <${tag} style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:900;color:${color};letter-spacing:1px;text-transform:uppercase;line-height:1.2;">
                  ${text}
                </${tag}>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. DARK SLATE RIBBON (Midnight High-Contrast Tech/Motors Banner)
// Deep obsidian slate background with crisp electric cyan accent dot
// ─────────────────────────────────────────────────────────────────────────────
function variantDarkSlateRibbon(p: any, id: string): string {
    const text = getText(p)
    const tag = getTag(p)
    const bg = '#0f172a'
    const color = '#ffffff'
    const accent = p.accentColor || '#38bdf8'
    const fontSize = p.fontSize ?? 19

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 12, 16, 12, 16)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg};border-left:4px solid ${accent};border-radius:6px;">
            <tr>
              <td style="padding:10px 16px;">
                <${tag} style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:900;color:${color};letter-spacing:0.4px;text-transform:uppercase;line-height:1.2;">
                  <span style="color:${accent};margin-right:6px;">●</span>${text}
                </${tag}>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. STEP COUNTER HEADER (Numbered Milestone Counter)
// Circular counter badge "01", "02" for step-by-step guides or sections
// ─────────────────────────────────────────────────────────────────────────────
function variantStepCounterHeader(p: any, id: string): string {
    const text = getText(p)
    const tag = getTag(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#0f172a')
    const accent = p.accentColor || '#7530fb'
    const fontSize = p.fontSize ?? 21
    const stepNumber = p.badgeText || '01'

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
            <tr>
              <!-- Number Pill Left -->
              <td width="38" valign="middle" align="center" style="width:38px;padding-right:10px;box-sizing:border-box;">
                <div style="width:32px;height:32px;background:${accent};border-radius:50%;text-align:center;line-height:32px;font-family:Arial,sans-serif;font-size:12px;font-weight:900;color:#ffffff;box-sizing:border-box;">
                  ${stepNumber}
                </div>
              </td>
              <!-- Heading -->
              <td valign="middle" align="left" style="box-sizing:border-box;">
                <${tag} style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:800;color:${color};line-height:1.2;letter-spacing:-0.3px;">
                  ${text}
                </${tag}>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. OUTLINED CARD FRAME (Enclosed Container with Left Accent)
// 1px crisp card frame with left accent stripe
// ─────────────────────────────────────────────────────────────────────────────
function variantOutlinedCardFrame(p: any, id: string): string {
    const text = getText(p)
    const tag = getTag(p)
    const bg = resolveBg(p, '#f8fafc')
    const color = resolveText(p, '#0f172a')
    const accent = p.accentColor || '#7530fb'
    const fontSize = p.fontSize ?? 20

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 10, 16, 10, 16)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg};border:1px solid #e2e8f0;border-left:4px solid ${accent};border-radius:6px;">
            <tr>
              <td style="padding:10px 14px;">
                <${tag} style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:800;color:${color};line-height:1.2;letter-spacing:-0.2px;">
                  ${text}
                </${tag}>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. SPLIT VERIFIED BADGE (Headline Left, Trust Chip Right)
// Title on left, official verified trust chip on right (stacks on mobile)
// ─────────────────────────────────────────────────────────────────────────────
function variantSplitVerifiedBadge(p: any, id: string): string {
    const text = getText(p)
    const tag = getTag(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#0f172a')
    const fontSize = p.fontSize ?? 21
    const shieldSvg = getCheckShieldSvg('#16a34a', 13)

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;table-layout:fixed;font-family:Arial,sans-serif;background-color:${bg};border-bottom:1.5px solid #e2e8f0;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 12, 14, 12, 14)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
            <tr>
              <!-- Headline Left -->
              <td valign="middle" style="box-sizing:border-box;">
                <${tag} style="margin:0;font-size:${fontSize}px;font-weight:900;color:${color};letter-spacing:-0.3px;line-height:1.2;word-break:break-word;">
                  ${text}
                </${tag}>
              </td>
              <!-- Trust Pill Right -->
              <td width="115" align="right" valign="middle" style="width:115px;white-space:nowrap;padding-left:10px;box-sizing:border-box;">
                <span style="display:inline-block;padding:3px 8px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;font-size:9.5px;font-weight:800;color:#166534;white-space:nowrap;">
                  ${shieldSvg} Verified Info
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant Registry Array
// ─────────────────────────────────────────────────────────────────────────────

export const headingVariants: BlockVariant[] = [
    {
        id: 'hd-classic-accent-bar',
        label: 'Accent Bar',
        description: 'Current Baseline: Solid vertical left accent bar with clean typography (100% same to same)',
        toHtml: variantClassicAccentBar,
    },
    {
        id: 'hd-underline-ribbon',
        label: 'Underline Ribbon',
        description: 'Commercial retail header with a crisp 3px accent underline bar',
        toHtml: variantUnderlineRibbon,
    },
    {
        id: 'hd-centered-hairlines',
        label: 'Centered Hairlines',
        description: 'Symmetric boutique header with flanking 1px rules for jewelry, watches & fashion',
        toHtml: variantCenteredHairlines,
    },
    {
        id: 'hd-editorial-pill-tag',
        label: 'Editorial Pill',
        description: 'Micro-capsule badge tag above bold section headline for structured catalogs',
        toHtml: variantEditorialPillTag,
    },
    {
        id: 'hd-icon-badge-prefix',
        label: 'Icon Badge',
        description: 'Square vector icon frame with headline and explanatory subtext',
        toHtml: variantIconBadgePrefix,
    },
    {
        id: 'hd-swiss-double-rule',
        label: 'Swiss Double Rule',
        description: 'Minimalist Swiss top and bottom hairlines for clean high-end retail',
        toHtml: variantSwissDoubleRule,
    },
    {
        id: 'hd-dark-slate-ribbon',
        label: 'Dark Slate Band',
        description: 'Midnight high-contrast band with cyan dot for tech, gaming, tools & motors',
        toHtml: variantDarkSlateRibbon,
    },
    {
        id: 'hd-step-counter-header',
        label: 'Step Counter',
        description: 'Numbered milestone counter badge (01, 02) for step-by-step guides',
        toHtml: variantStepCounterHeader,
    },
    {
        id: 'hd-outlined-card-frame',
        label: 'Outlined Frame',
        description: 'Enclosed 1px card container with left accent stripe',
        toHtml: variantOutlinedCardFrame,
    },
    {
        id: 'hd-split-verified-badge',
        label: 'Verified Badge',
        description: 'Headline on left with official verified trust chip on right',
        toHtml: variantSplitVerifiedBadge,
    },
]

export const headingBlockVariants = headingVariants

export function getHeadingVariant(variantId: string): BlockVariant {
    const found = headingVariants.find(v => v.id === variantId)
    return found ?? headingVariants[0]
}
