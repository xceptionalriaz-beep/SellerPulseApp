// components/ui/VisualEditor/variants/rectangle.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Rectangle / Shape Container (20 Professional Layout Styles)
//
// Dual-Purpose Architecture:
// 1. Pure Visual Design Shape (NO TEXT): When content is empty, renders as
//    a stunning geometric brand band, racing stripe, or color-blocked bar.
// 2. High-Converting Callout Container (WITH TEXT): When content is provided,
//    renders the text inside the structured design.
//
// Specifications:
// • FULL SIZE: 100% full width (no max-width:700px constraint) to span the
//   entire width of the listing template.
// • ZERO CURVE: Sharp crisp corners (border-radius: 0) on all styles EXCEPT
//   ONLY in "Triple Stripe" (rect-triple-accent-stripe) which keeps its curves.
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
// 1. SOLID FILL (Full Size, Sharp Corners)
// ─────────────────────────────────────────────────────────────────────────────
function variantSolidFill(p: any, id: string): string {
  const fill = p.fillColor ?? p.bgColor ?? '#f3eeff'
  const borderCol = p.borderColor ?? '#ede9fe'
  const borderW = p.borderWidth ?? 1
  const height = p.height ?? 60
  const align = p.align ?? 'center'
  const content = hasContent(p) ? p.content : '&nbsp;'

  return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${fill};height:${height}px;min-height:${height}px;border:${borderW}px solid ${borderCol};border-radius:0;text-align:${align};vertical-align:middle;${pad(p)}">
      ${content}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TWO-TONE SPLIT BAND (Full Size, Sharp Corners)
// ─────────────────────────────────────────────────────────────────────────────
function variantTwoToneSplit(p: any, id: string): string {
  const baseFill = p.fillColor && p.fillColor !== '#f3eeff' ? p.fillColor : '#0f172a'
  const accent = p.accentColor ?? '#7530fb'
  const height = p.height ?? 48
  const align = p.align ?? 'left'

  if (hasContent(p)) {
    return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${baseFill};border-radius:0;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="min-height:${height}px;vertical-align:middle;text-align:${align};color:#ffffff;padding:12px 18px;">
      ${p.content}
    </td>
    <td width="24" style="width:24px;background-color:${accent};font-size:1px;line-height:1px;">&nbsp;</td>
  </tr>
</table>`
  }

  return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${baseFill};border-radius:0;overflow:hidden;">
  <tr>
    <td style="height:${height}px;font-size:1px;line-height:1px;">&nbsp;</td>
    <td width="80" style="width:80px;background-color:${accent};height:${height}px;font-size:1px;line-height:1px;">&nbsp;</td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. TRIPLE ACCENT STRIPE (Full Size, KEEPS CURVE BORDER RADIUS)
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
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${fill};border:1px solid ${borderCol};border-radius:${radius}px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
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
// 4. ACCENT LEFT RAIL (Full Size, Sharp Corners)
// ─────────────────────────────────────────────────────────────────────────────
function variantAccentLeftRail(p: any, id: string): string {
  const fill = p.fillColor && p.fillColor !== '#f3eeff' ? p.fillColor : '#ffffff'
  const accent = p.accentColor ?? '#7530fb'
  const borderCol = p.borderColor ?? '#ede9fe'
  const height = p.height ?? 50
  const align = p.align ?? 'left'

  return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${fill};border:1px solid ${borderCol};border-left:5px solid ${accent};border-radius:0;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="min-height:${height}px;text-align:${align};vertical-align:middle;${pad(p)}">
      ${hasContent(p) ? p.content : '&nbsp;'}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. GRADIENT HORIZON (Full Size, Sharp Corners)
// ─────────────────────────────────────────────────────────────────────────────
function variantGradientHorizon(p: any, id: string): string {
  const from = p.accentColor ?? '#7530fb'
  const to = p.fillColor && p.fillColor !== '#f3eeff' ? p.fillColor : '#0f172a'
  const height = p.height ?? 44
  const align = p.align ?? 'center'

  return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background:linear-gradient(90deg, ${from}, ${to});border-radius:0;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="height:${height}px;min-height:${height}px;text-align:${align};vertical-align:middle;color:#ffffff;padding:8px 18px;">
      ${hasContent(p) ? p.content : '&nbsp;'}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. ETCHED LUXURY HAIRLINE (Full Size, Sharp Corners)
// ─────────────────────────────────────────────────────────────────────────────
function variantEtchedLuxuryHairline(p: any, id: string): string {
  const fill = p.fillColor && p.fillColor !== '#f3eeff' ? p.fillColor : '#ffffff'
  const borderCol = p.borderColor ?? '#ede9fe'
  const height = p.height ?? 40
  const align = p.align ?? 'center'

  return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${fill};border-top:1px solid ${borderCol};border-bottom:1px solid ${borderCol};border-radius:0;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="height:${height}px;min-height:${height}px;text-align:${align};vertical-align:middle;padding:10px 18px;">
      ${hasContent(p) ? p.content : '&nbsp;'}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. INDUSTRIAL HAZARD (Full Size, Sharp Corners)
// ─────────────────────────────────────────────────────────────────────────────
function variantIndustrialHazard(p: any, id: string): string {
  const fill = '#18181b'
  const accent = p.accentColor ?? '#f59e0b'
  const height = p.height ?? 46

  return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${fill};border:1px solid #27272a;border-radius:0;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
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
// 8. DASHED COUPON FRAME (Full Size, Sharp Corners)
// ─────────────────────────────────────────────────────────────────────────────
function variantDashedCouponFrame(p: any, id: string): string {
  const fill = p.fillColor && p.fillColor !== '#f3eeff' ? p.fillColor : '#fffdfa'
  const borderCol = p.borderColor && p.borderColor !== '#ede9fe' ? p.borderColor : '#d6d3d1'
  const height = p.height ?? 50
  const align = p.align ?? 'center'

  return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${fill};border:1.5px dashed ${borderCol};border-radius:0;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="height:${height}px;min-height:${height}px;text-align:${align};vertical-align:middle;${pad(p)}">
      ${hasContent(p) ? p.content : '&nbsp;'}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. PILL CAPSULE BADGE (Floating Centered 50px Rounded Capsule Pill)
// ─────────────────────────────────────────────────────────────────────────────
function variantPillCapsuleBadge(p: any, id: string): string {
  const fill = p.fillColor && p.fillColor !== '#f3eeff' ? p.fillColor : '#f8f7ff'
  const borderCol = p.borderColor && p.borderColor !== '#ede9fe' ? p.borderColor : '#c4b5fd'
  const textColor = '#5b21b6'

  return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td align="center" style="padding:16px 20px;text-align:center;">
      <div style="display:inline-block;background-color:${fill};border:1.5px solid ${borderCol};border-radius:50px;padding:9px 36px;box-shadow:0 3px 10px rgba(109,40,217,0.08);min-width:160px;box-sizing:border-box;">
        <span style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${textColor};line-height:1.4;display:inline-block;">
          ${hasContent(p) ? p.content : '<span style="display:inline-block;min-width:120px;height:12px;">&nbsp;</span>'}
        </span>
      </div>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. WARNING AMBER NOTICE (Full Size, Sharp Corners)
// ─────────────────────────────────────────────────────────────────────────────
function variantWarningAmberNotice(p: any, id: string): string {
  const fill = '#fffbeb'
  const borderCol = '#fcd34d'
  const accent = '#f59e0b'
  const height = p.height ?? 50

  return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${fill};border:1.5px solid ${borderCol};border-left:5px solid ${accent};border-radius:0;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="height:${height}px;min-height:${height}px;vertical-align:middle;${pad(p)}">
      ${hasContent(p) ? p.content : '&nbsp;'}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. ELEVATED SHADOW PLINTH (Full Size, Sharp Corners)
// ─────────────────────────────────────────────────────────────────────────────
function variantElevatedShadowPlinth(p: any, id: string): string {
  const fill = p.fillColor && p.fillColor !== '#f3eeff' ? p.fillColor : '#ffffff'
  const borderCol = p.borderColor && p.borderColor !== '#ede9fe' ? p.borderColor : '#e2e8f0'
  const height = p.height ?? 60
  const align = p.align ?? 'center'

  return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${fill};border:1px solid ${borderCol};border-radius:0;box-shadow:0 4px 18px -2px rgba(0,0,0,0.07);font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="height:${height}px;min-height:${height}px;text-align:${align};vertical-align:middle;${pad(p)}">
      ${hasContent(p) ? p.content : '&nbsp;'}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. CHAMFER TACTICAL CUT (Full Size, Tactical Notches with Flush Left Border Bar)
// ─────────────────────────────────────────────────────────────────────────────
function variantChamferTacticalCut(p: any, id: string): string {
  const fill = p.fillColor && p.fillColor !== '#f3eeff' ? p.fillColor : '#1e293b'
  const accent = p.accentColor ?? '#38bdf8'
  const height = p.height ?? 50
  const align = p.align ?? 'left'
  const barHeight = Math.max(10, height - 16)

  return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${fill};border:none;border-radius:0;clip-path:polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px);height:${height}px;min-height:${height}px;padding:0;vertical-align:top;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;height:100%;border-collapse:collapse;">
        <tr>
          <!-- Left border column flush at x = 0 -->
          <td width="4" style="width:4px;vertical-align:top;padding:0;font-size:1px;line-height:1px;">
            <div style="height:16px;width:4px;font-size:1px;line-height:1px;">&nbsp;</div>
            <div style="height:calc(100% - 16px);min-height:${barHeight}px;width:4px;background-color:${accent};"></div>
          </td>
          <!-- Content Area -->
          <td style="vertical-align:middle;text-align:${align};color:#ffffff;padding:12px 20px 12px 16px;">
            ${hasContent(p) ? p.content : '&nbsp;'}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. PERFORATED TICKET STUB (Full Size, Sharp Corners)
// ─────────────────────────────────────────────────────────────────────────────
function variantPerforatedTicketStub(p: any, id: string): string {
  const fill = p.fillColor && p.fillColor !== '#f3eeff' ? p.fillColor : '#fefce8'
  const borderCol = '#fef08a'
  const height = p.height ?? 54

  return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${fill};border:1.5px solid ${borderCol};border-radius:0;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td width="24" style="width:24px;background-color:#ffffff;border-right:1.5px dashed #ca8a04;font-size:1px;line-height:1px;">&nbsp;</td>
    <td style="height:${height}px;min-height:${height}px;vertical-align:middle;padding:12px 20px;color:#854d0e;">
      ${hasContent(p) ? p.content : '&nbsp;'}
    </td>
    <td width="24" style="width:24px;background-color:#ffffff;border-left:1.5px dashed #ca8a04;font-size:1px;line-height:1px;">&nbsp;</td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. CYBER NEON OUTLINE (Full Size, Sharp Corners)
// ─────────────────────────────────────────────────────────────────────────────
function variantCyberNeonOutline(p: any, id: string): string {
  const fill = '#090d16'
  const neon = p.accentColor ?? '#b8fa33'
  const height = p.height ?? 48
  const align = p.align ?? 'center'

  return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${fill};border:1.5px solid ${neon};border-radius:0;box-shadow:0 0 10px rgba(184,250,51,0.15);font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="height:${height}px;min-height:${height}px;text-align:${align};vertical-align:middle;color:#ffffff;${pad(p)}">
      ${hasContent(p) ? p.content : '&nbsp;'}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. REGAL NOTARY CERTIFICATE (Full Size, Sharp Corners)
// ─────────────────────────────────────────────────────────────────────────────
function variantRegalNotaryCertificate(p: any, id: string): string {
  const fill = p.fillColor && p.fillColor !== '#f3eeff' ? p.fillColor : '#fffdfa'
  const borderCol = p.borderColor && p.borderColor !== '#ede9fe' ? p.borderColor : '#d6d3d1'
  const height = p.height ?? 54
  const align = p.align ?? 'center'

  return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${fill};border:2px solid ${borderCol};border-radius:0;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="padding:4px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${borderCol};border-radius:0;border-collapse:collapse;">
        <tr>
          <td style="height:${height}px;min-height:${height}px;text-align:${align};vertical-align:middle;color:#1c1917;padding:10px 18px;">
            ${hasContent(p) ? p.content : '&diams;&nbsp;&nbsp;&diams;&nbsp;&nbsp;&diams;'}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. CHECKERED RACING FLAG (Full Size, Sharp Corners)
// ─────────────────────────────────────────────────────────────────────────────
function variantCheckeredRacingFlag(p: any, id: string): string {
  const fill = '#18181b'
  const height = p.height ?? 48

  return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${fill};border:1px solid #27272a;border-radius:0;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td width="20" style="width:20px;background-color:#ffffff;background-image:linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%);background-size:8px 8px;background-position:0 0, 0 4px, 4px -4px, -4px 0px;font-size:1px;line-height:1px;">&nbsp;</td>
    <td style="height:${height}px;min-height:${height}px;vertical-align:middle;padding:10px 18px;color:#ffffff;">
      ${hasContent(p) ? p.content : '&nbsp;'}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. BRACKET ARCHITECT (Full Size, Sharp Corners)
// ─────────────────────────────────────────────────────────────────────────────
function variantBracketArchitect(p: any, id: string): string {
  const fill = p.fillColor && p.fillColor !== '#f3eeff' ? p.fillColor : '#f8fafc'
  const borderCol = p.borderColor && p.borderColor !== '#ede9fe' ? p.borderColor : '#94a3b8'
  const height = p.height ?? 48
  const align = p.align ?? 'center'

  return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${fill};border-left:4px solid ${borderCol};border-right:4px solid ${borderCol};border-radius:0;font-family:Courier,monospace,sans-serif;">
  <tr>
    <td style="height:${height}px;min-height:${height}px;text-align:${align};vertical-align:middle;color:#0f172a;padding:10px 20px;">
      ${hasContent(p) ? p.content : '[ &bull; &bull; &bull; ]'}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. STACKED PAPER MEMO (Full Size, Sharp Corners)
// ─────────────────────────────────────────────────────────────────────────────
function variantStackedPaperMemo(p: any, id: string): string {
  const fill = p.fillColor && p.fillColor !== '#f3eeff' ? p.fillColor : '#ffffff'
  const height = p.height ?? 50
  const align = p.align ?? 'left'

  return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${fill};border:1.5px solid #1e293b;border-radius:0;box-shadow:4px 4px 0px #1e293b;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="height:${height}px;min-height:${height}px;text-align:${align};vertical-align:middle;${pad(p)}">
      ${hasContent(p) ? p.content : '&nbsp;'}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 19. DOT MATRIX RECEIPT (Full Size, Sharp Corners)
// ─────────────────────────────────────────────────────────────────────────────
function variantDotMatrixReceipt(p: any, id: string): string {
  const fill = p.fillColor && p.fillColor !== '#f3eeff' ? p.fillColor : '#ffffff'
  const borderCol = p.borderColor && p.borderColor !== '#ede9fe' ? p.borderColor : '#94a3b8'
  const height = p.height ?? 46
  const align = p.align ?? 'center'

  return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${fill};border:2px dotted ${borderCol};border-radius:0;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="height:${height}px;min-height:${height}px;text-align:${align};vertical-align:middle;${pad(p)}">
      ${hasContent(p) ? p.content : '&nbsp;'}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 20. CAUTION DIAGONAL HAZARD (Full Size, Sharp Corners)
// ─────────────────────────────────────────────────────────────────────────────
function variantCautionDiagonalHazard(p: any, id: string): string {
  const fill = '#18181b'
  const height = p.height ?? 48

  return `<!--[riazify:rectangle:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${fill};border:1.5px solid #3f3f46;border-radius:0;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="height:6px;background:repeating-linear-gradient(45deg, #f59e0b, #f59e0b 10px, #18181b 10px, #18181b 20px);font-size:1px;line-height:1px;">&nbsp;</td>
  </tr>
  <tr>
    <td style="height:${height}px;min-height:${height}px;text-align:left;vertical-align:middle;padding:12px 20px;color:#ffffff;">
      ${hasContent(p) ? p.content : '&nbsp;'}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT DEFINITIONS & REGISTRY (20 Layout Styles)
// ─────────────────────────────────────────────────────────────────────────────
export const rectangleVariants: BlockVariant[] = [
  {
    id: 'rect-solid-fill',
    label: 'Solid Card',
    description: 'Full-width solid color block with sharp corners',
    toHtml: variantSolidFill,
  },
  {
    id: 'rect-two-tone-split',
    label: 'Two-Tone Split',
    description: 'Full-width color-blocked divider band with base color and contrast accent block',
    toHtml: variantTwoToneSplit,
  },
  {
    id: 'rect-triple-accent-stripe',
    label: 'Triple Stripe',
    description: 'Heritage 3-stripe automotive/sports accent band on left edge with rounded curve corners',
    toHtml: variantTripleAccentStripe,
  },
  {
    id: 'rect-accent-left-rail',
    label: 'Left Rail',
    description: 'Full-width executive single vertical color accent rail with crisp corners',
    toHtml: variantAccentLeftRail,
  },
  {
    id: 'rect-gradient-horizon',
    label: 'Gradient Bar',
    description: 'Full-width smooth horizontal chroma gradient strip transitioning between brand tones',
    toHtml: variantGradientHorizon,
  },
  {
    id: 'rect-etched-luxury-hairline',
    label: 'Luxury Hairline',
    description: 'Full-width delicate top/bottom hairline borders for jewellery & premium apparel',
    toHtml: variantEtchedLuxuryHairline,
  },
  {
    id: 'rect-industrial-hazard',
    label: 'Hazard Ledger',
    description: 'Full-width rugged dark card with amber safety stripe for motors & machinery',
    toHtml: variantIndustrialHazard,
  },
  {
    id: 'rect-dashed-coupon-frame',
    label: 'Coupon Frame',
    description: 'Full-width stitched dashed voucher border for promotions & discounts',
    toHtml: variantDashedCouponFrame,
  },
  {
    id: 'rect-pill-capsule-badge',
    label: 'Capsule Badge',
    description: 'Floating rounded 50px capsule pill badge with subtle shadow',
    toHtml: variantPillCapsuleBadge,
  },
  {
    id: 'rect-warning-amber-notice',
    label: 'Amber Alert',
    description: 'Full-width high-visibility caution card for fitment warnings & buyer notes',
    toHtml: variantWarningAmberNotice,
  },
  {
    id: 'rect-elevated-shadow-plinth',
    label: 'Shadow Plinth',
    description: 'Full-width modern 3D floating white card with subtle diffuse drop shadow',
    toHtml: variantElevatedShadowPlinth,
  },
  {
    id: 'rect-chamfer-tactical-cut',
    label: 'Tactical Chamfer',
    description: 'Full-width angled 45-degree corner notches for PC gaming & motorsports',
    toHtml: variantChamferTacticalCut,
  },
  {
    id: 'rect-perforated-ticket-stub',
    label: 'Ticket Stub',
    description: 'Full-width scalloped punch-out perforated voucher pass with dashed division',
    toHtml: variantPerforatedTicketStub,
  },
  {
    id: 'rect-cyber-neon-outline',
    label: 'Cyber Outline',
    description: 'Full-width high-contrast midnight card framed by sharp neon cyber border',
    toHtml: variantCyberNeonOutline,
  },
  {
    id: 'rect-regal-notary-certificate',
    label: 'Notary Seal',
    description: 'Full-width archival heritage certificate with double border & diamond crest',
    toHtml: variantRegalNotaryCertificate,
  },
  {
    id: 'rect-checkered-racing-flag',
    label: 'Racing Flag',
    description: 'Full-width motorsport dark carbon block with mono checkered flag accent',
    toHtml: variantCheckeredRacingFlag,
  },
  {
    id: 'rect-bracket-architect',
    label: 'CAD Bracket',
    description: 'Full-width precision engineering open card with architectural brackets',
    toHtml: variantBracketArchitect,
  },
  {
    id: 'rect-stacked-paper-memo',
    label: 'Paper Memo',
    description: 'Full-width tactile physical offset shadow invoice & warehouse dispatch slip',
    toHtml: variantStackedPaperMemo,
  },
  {
    id: 'rect-dot-matrix-receipt',
    label: 'Dot Matrix',
    description: 'Full-width minimalist dotted perimeter inventory frame for transaction notes',
    toHtml: variantDotMatrixReceipt,
  },
  {
    id: 'rect-caution-diagonal-hazard',
    label: 'Diagonal Hazard',
    description: 'Full-width heavy-duty safety barricade with diagonal caution stripes',
    toHtml: variantCautionDiagonalHazard,
  },
]

export function getRectangleVariant(variantId: string): BlockVariant {
  const found = rectangleVariants.find(v => v.id === variantId)
  return found ?? rectangleVariants[0]
}
