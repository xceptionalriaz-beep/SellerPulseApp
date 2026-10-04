// components/ui/VisualEditor/variants/rectangle.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Rectangle / Shape Container (10 Professional Layout Styles)
//
// Dual-Purpose Architecture:
// 1. Pure Visual Design Shape (NO TEXT): When content is empty, renders as
//    a stunning geometric brand band, racing stripe, or color-blocked bar.
// 2. High-Converting Callout Container (WITH TEXT): When content is provided,
//    renders the text inside the structured design.
//
// 10 Distinct Layout Styles:
//   1.  rect-solid-fill              (Current Baseline — 100% Identical)
//   2.  rect-two-tone-split          (Two-Tone Color-Blocked Divider Band)
//   3.  rect-triple-accent-stripe    (Sports & Automotive 3-Stripe Heritage Bar)
//   4.  rect-accent-left-rail        (Executive Card with Thick Vertical Rail)
//   5.  rect-gradient-horizon        (Horizontal Linear Chroma Gradient Bar)
//   6.  rect-etched-luxury-hairline  (Minimalist Swiss Luxury Hairline Inset)
//   7.  rect-industrial-hazard       (Workshop & Motors Dark Caution Ledger)
//   8.  rect-dashed-coupon-frame     (Stitched Dashed Promotional Voucher Frame)
//   9.  rect-pill-capsule-badge      (Floating 50px Rounded Capsule Pill)
//   10. rect-warning-amber-notice    (High-Visibility Amber Caution Alert Card)
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockVariant } from './hero_header.variants'

function pad(p: any): string {
    const top = p.paddingTop ?? 14
    const bottom = p.paddingBottom ?? 14
    const left = p.paddingLeft ?? 20
    const right = p.paddingRight ?? 20
    return `padding:${top}px ${right}px ${bottom}px ${left}px;`
}

function hasContent(p: any): boolean {
    return typeof p.content === 'string' && p.content.trim().length > 0
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SOLID FILL (CURRENT BASELINE — 100% IDENTICAL)
// ─────────────────────────────────────────────────────────────────────────────
function variantSolidFill(p: any, id: string): string {
    const fill = p.fillColor ?? p.bgColor ?? '#f3eeff'
    const borderCol = p.borderColor ?? '#ede9fe'
    const borderW = p.borderWidth ?? 1
    const radius = p.borderRadius ?? 8
    const height = p.height ?? 60
    const align = p.align ?? 'center'
    const content = hasContent(p) ? p.content : '&nbsp;'

    return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${fill};height:${height}px;min-height:${height}px;border:${borderW}px solid ${borderCol};border-radius:${radius}px;text-align:${align};vertical-align:middle;${pad(p)}">
      ${content}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TWO-TONE SPLIT BAND (Color-Blocked Modern Split Bar)
// ─────────────────────────────────────────────────────────────────────────────
function variantTwoToneSplit(p: any, id: string): string {
    const baseFill = p.fillColor && p.fillColor !== '#f3eeff' ? p.fillColor : '#0f172a'
    const accent = p.accentColor ?? '#7530fb'
    const radius = p.borderRadius ?? 8
    const height = p.height ?? 48
    const align = p.align ?? 'left'

    if (hasContent(p)) {
        return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;background-color:${baseFill};border-radius:${radius}px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="min-height:${height}px;vertical-align:middle;text-align:${align};color:#ffffff;padding:12px 18px;">
      ${p.content}
    </td>
    <td width="24" style="width:24px;background-color:${accent};font-size:1px;line-height:1px;">&nbsp;</td>
  </tr>
</table>`
    }

    // Pure Visual Design (No text)
    return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;background-color:${baseFill};border-radius:${radius}px;overflow:hidden;">
  <tr>
    <td style="height:${height}px;font-size:1px;line-height:1px;">&nbsp;</td>
    <td width="80" style="width:80px;background-color:${accent};height:${height}px;font-size:1px;line-height:1px;">&nbsp;</td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. TRIPLE ACCENT STRIPE (Sports & Automotive 3-Stripe Heritage Bar)
// ─────────────────────────────────────────────────────────────────────────────
function variantTripleAccentStripe(p: any, id: string): string {
    const fill = p.fillColor && p.fillColor !== '#f3eeff' ? p.fillColor : '#ffffff'
    const borderCol = p.borderColor ?? '#ede9fe'
    const radius = p.borderRadius ?? 8
    const height = p.height ?? 50
    const c1 = p.accentColor ?? '#7530fb'
    const c2 = '#38bdf8'
    const c3 = '#b8fa33'

    return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;background-color:${fill};border:1px solid ${borderCol};border-radius:${radius}px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td width="6" style="width:6px;background-color:${c1};height:${height}px;font-size:1px;line-height:1px;">&nbsp;</td>
    <td width="6" style="width:6px;background-color:${c2};height:${height}px;font-size:1px;line-height:1px;">&nbsp;</td>
    <td width="6" style="width:6px;background-color:${c3};height:${height}px;font-size:1px;line-height:1px;">&nbsp;</td>
    <td style="min-height:${height}px;vertical-align:middle;padding:12px 18px;color:#1e1535;">
      ${hasContent(p) ? p.content : '&nbsp;'}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ACCENT LEFT RAIL (Executive Single Accent Rail)
// ─────────────────────────────────────────────────────────────────────────────
function variantAccentLeftRail(p: any, id: string): string {
    const fill = p.fillColor && p.fillColor !== '#f3eeff' ? p.fillColor : '#ffffff'
    const accent = p.accentColor ?? '#7530fb'
    const borderCol = p.borderColor ?? '#ede9fe'
    const radius = p.borderRadius ?? 8
    const height = p.height ?? 50
    const align = p.align ?? 'left'

    return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;background-color:${fill};border:1px solid ${borderCol};border-left:5px solid ${accent};border-radius:${radius}px;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="min-height:${height}px;text-align:${align};vertical-align:middle;${pad(p)}">
      ${hasContent(p) ? p.content : '&nbsp;'}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. GRADIENT HORIZON (Horizontal Linear Chroma Gradient Bar)
// ─────────────────────────────────────────────────────────────────────────────
function variantGradientHorizon(p: any, id: string): string {
    const from = p.accentColor ?? '#7530fb'
    const to = p.fillColor && p.fillColor !== '#f3eeff' ? p.fillColor : '#0f172a'
    const radius = p.borderRadius ?? 8
    const height = p.height ?? 44
    const align = p.align ?? 'center'

    return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;background:linear-gradient(90deg, ${from}, ${to});border-radius:${radius}px;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="height:${height}px;min-height:${height}px;text-align:${align};vertical-align:middle;color:#ffffff;padding:8px 18px;">
      ${hasContent(p) ? p.content : '&nbsp;'}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. ETCHED LUXURY HAIRLINE (Minimalist Swiss Luxury Hairline Inset)
// ─────────────────────────────────────────────────────────────────────────────
function variantEtchedLuxuryHairline(p: any, id: string): string {
    const fill = p.fillColor && p.fillColor !== '#f3eeff' ? p.fillColor : '#ffffff'
    const borderCol = p.borderColor && p.borderColor !== '#ede9fe' ? p.borderColor : '#e2e8f0'
    const height = p.height ?? 40
    const align = p.align ?? 'center'

    return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;background-color:${fill};border-top:1px solid ${borderCol};border-bottom:1px solid ${borderCol};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="height:${height}px;min-height:${height}px;text-align:${align};vertical-align:middle;padding:10px 18px;">
      ${hasContent(p) ? p.content : '&nbsp;'}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. INDUSTRIAL HAZARD (Workshop & Motors Dark Caution Ledger)
// ─────────────────────────────────────────────────────────────────────────────
function variantIndustrialHazard(p: any, id: string): string {
    const fill = '#18181b'
    const accent = p.accentColor ?? '#f59e0b'
    const radius = p.borderRadius ?? 6
    const height = p.height ?? 46

    return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;background-color:${fill};border:1px solid #27272a;border-radius:${radius}px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="height:4px;background-color:${accent};font-size:1px;line-height:1px;">&nbsp;</td>
  </tr>
  <tr>
    <td style="height:${height}px;min-height:${height}px;text-align:left;vertical-align:middle;padding:10px 18px;color:#ffffff;">
      ${hasContent(p) ? p.content : '&nbsp;'}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. DASHED COUPON FRAME (Stitched Dashed Promotional Voucher Frame)
// ─────────────────────────────────────────────────────────────────────────────
function variantDashedCouponFrame(p: any, id: string): string {
    const fill = p.fillColor && p.fillColor !== '#f3eeff' ? p.fillColor : '#fffdfa'
    const borderCol = p.borderColor && p.borderColor !== '#ede9fe' ? p.borderColor : '#d6d3d1'
    const radius = p.borderRadius ?? 8
    const height = p.height ?? 50
    const align = p.align ?? 'center'

    return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;background-color:${fill};border:1.5px dashed ${borderCol};border-radius:${radius}px;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="height:${height}px;min-height:${height}px;text-align:${align};vertical-align:middle;${pad(p)}">
      ${hasContent(p) ? p.content : '&nbsp;'}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. PILL CAPSULE BADGE (Floating 50px Rounded Capsule Pill)
// ─────────────────────────────────────────────────────────────────────────────
function variantPillCapsuleBadge(p: any, id: string): string {
    const fill = p.fillColor ?? '#f8f7ff'
    const borderCol = p.borderColor ?? '#ede9fe'
    const height = p.height ?? 40

    return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td align="center" style="padding:10px 14px;text-align:center;">
      <div style="display:inline-block;background-color:${fill};border:1.5px solid ${borderCol};border-radius:50px;min-height:${height}px;padding:8px 24px;box-shadow:0 2px 6px rgba(0,0,0,0.04);max-width:100%;box-sizing:border-box;">
        <span style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;line-height:1.3;display:inline-block;">
          ${hasContent(p) ? p.content : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}
        </span>
      </div>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. WARNING AMBER NOTICE (High-Visibility Amber Caution Alert Card)
// ─────────────────────────────────────────────────────────────────────────────
function variantWarningAmberNotice(p: any, id: string): string {
    const fill = '#fffbeb'
    const borderCol = '#fcd34d'
    const accent = '#f59e0b'
    const radius = p.borderRadius ?? 8
    const height = p.height ?? 50

    return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;background-color:${fill};border:1.5px solid ${borderCol};border-left:5px solid ${accent};border-radius:${radius}px;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="height:${height}px;min-height:${height}px;vertical-align:middle;${pad(p)}">
      ${hasContent(p) ? p.content : '&nbsp;'}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT DEFINITIONS & REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export const rectangleVariants: BlockVariant[] = [
    {
        id: 'rect-solid-fill',
        label: 'Solid Card',
        description: 'Clean solid color block with rounded border — works with or without text',
        toHtml: variantSolidFill,
    },
    {
        id: 'rect-two-tone-split',
        label: 'Two-Tone Split',
        description: 'Color-blocked divider band with base color and contrast accent block',
        toHtml: variantTwoToneSplit,
    },
    {
        id: 'rect-triple-accent-stripe',
        label: 'Triple Stripe',
        description: 'Heritage 3-stripe automotive/sports accent band on left edge',
        toHtml: variantTripleAccentStripe,
    },
    {
        id: 'rect-accent-left-rail',
        label: 'Left Rail',
        description: 'Executive single vertical color accent rail with clean framed body',
        toHtml: variantAccentLeftRail,
    },
    {
        id: 'rect-gradient-horizon',
        label: 'Gradient Bar',
        description: 'Smooth horizontal chroma gradient strip transitioning between brand tones',
        toHtml: variantGradientHorizon,
    },
    {
        id: 'rect-etched-luxury-hairline',
        label: 'Luxury Hairline',
        description: 'Delicate top/bottom hairline borders for jewellery & premium apparel',
        toHtml: variantEtchedLuxuryHairline,
    },
    {
        id: 'rect-industrial-hazard',
        label: 'Hazard Ledger',
        description: 'Rugged dark card with amber safety stripe for motors & machinery',
        toHtml: variantIndustrialHazard,
    },
    {
        id: 'rect-dashed-coupon-frame',
        label: 'Coupon Frame',
        description: 'Stitched dashed voucher border for promotions & discounts',
        toHtml: variantDashedCouponFrame,
    },
    {
        id: 'rect-pill-capsule-badge',
        label: 'Capsule Badge',
        description: 'Floating rounded capsule pill taking minimal vertical height',
        toHtml: variantPillCapsuleBadge,
    },
    {
        id: 'rect-warning-amber-notice',
        label: 'Amber Alert',
        description: 'High-visibility caution card for fitment warnings & buyer notes',
        toHtml: variantWarningAmberNotice,
    },
]

export function getRectangleVariant(variantId: string): BlockVariant {
    const found = rectangleVariants.find(v => v.id === variantId)
    return found ?? rectangleVariants[0]
}
