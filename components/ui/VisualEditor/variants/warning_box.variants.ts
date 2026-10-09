// components/ui/VisualEditor/variants/warning_box.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Warning Box (10 Professional Layout Styles)
//
// Solves eBay Buyer Skepticism, Compatibility Issues & Return Dispute Rate:
// • Full-size 100% responsive width across desktop & mobile eBay listing containers
// • High-definition crisp vector SVG icons (ZERO emojis — 100% VeRO & eBay compliant)
// • Zero blurry glassmorphism / AI-slop — grounded in proven, high-converting eCommerce typography
// • Pure eBay-compliant inline CSS and HTML table architecture
//
// 10 Distinct Layout Styles:
//   1.  wb-amber-classic-card       (Classic Baseline: Warm amber card with rounded SVG alert badge)
//   2.  wb-critical-red-alert       (Critical Red Alert: High-priority crimson border & 4px accent pillar)
//   3.  wb-hazard-stripe-industrial (Industrial Workshop: Caution bar header with heavy-duty shield alert)
//   4.  wb-midnight-obsidian-amber  (Midnight Obsidian: High-contrast dark slate card with golden amber glow)
//   5.  wb-split-header-pill        (Split Header Banner: Solid amber header band + clean contrast card body)
//   6.  wb-pill-badge-minimal       (Minimalist Pill Capsule: Clean neutral card with floating pill badge)
//   7.  wb-compatibility-checklist  (Compatibility Shield: Technical fitment notice with dual check rows)
//   8.  wb-security-tamper-notice   (Security Seal Notice: Padlock warranty badge & tamper-evident disclaimer)
//   9.  wb-floating-callout-ribbon  (Corner Callout Banner: Refined gold badge tag with triangle caution icon)
//   10. wb-compact-inline-ticker    (Compact Mobile Ticker: Mobile-first slim capsule strip for zero-scroll)
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockVariant } from './section_label.variants'

export interface WarningBoxProps {
    variant?: string
    layoutStyle?: string
    heading?: string
    title?: string
    text?: string
    description?: string
    content?: string
    body?: string
    subtext?: string
    badgeText?: string
    bgColor?: string
    textColor?: string
    headingColor?: string
    borderColor?: string
    accentColor?: string
    iconColor?: string
    fontSize?: number
    paddingTop?: number
    paddingBottom?: number
    paddingLeft?: number
    paddingRight?: number
}

// ── Shared Vector SVG Icons (Crisp, High-Resolution, ZERO Emojis) ─────────────

// Standard Warning Triangle Icon (SVG)
function renderAlertTriangleSvg(color: string = '#f59e0b', size: number = 22): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>`
}

// Critical Octagon Alert / Stop Icon (SVG)
function renderOctagonAlertSvg(color: string = '#ef4444', size: number = 22): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>`
}

// Shield Alert Icon (SVG)
function renderShieldAlertSvg(color: string = '#f59e0b', size: number = 22): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>`
}

// Padlock Security Icon (SVG)
function renderLockAlertSvg(color: string = '#d97706', size: number = 22): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    <line x1="12" y1="15" x2="12" y2="18"></line>
  </svg>`
}

// Information Circle / Check Icon (SVG)
function renderCheckSmallSvg(color: string = '#16a34a', size: number = 16): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>`
}

// ── Smart Property Resolvers ──────────────────────────────────────────────────

function resolveHeading(p: any, fallback: string = 'Please Read Before Buying'): string {
    const h = p.heading ?? p.title
    if (typeof h === 'string' && h.trim().length > 0) return h.trim()
    return fallback
}

function resolveText(p: any, fallback: string = 'Please check compatibility before purchasing. Returns only accepted if unused and in original packaging.'): string {
    const t = p.text ?? p.description ?? p.content ?? p.body
    if (typeof t === 'string' && t.trim().length > 0) return t.trim()
    return fallback
}

function resolveBg(p: any, fallback: string): string {
    if (p.bgColor && p.bgColor !== '#ffffff' && p.bgColor !== '#DEFAULT#') return p.bgColor
    return fallback
}

function resolveBorder(p: any, fallback: string): string {
    if (p.borderColor) return p.borderColor
    return fallback
}

function resolveTextColor(p: any, fallback: string): string {
    if (p.textColor) return p.textColor
    return fallback
}

function resolveHeadingColor(p: any, fallback: string): string {
    if (p.headingColor) return p.headingColor
    return fallback
}

function resolveAccent(p: any, fallback: string): string {
    if (p.accentColor || p.iconColor) return p.accentColor ?? p.iconColor
    return fallback
}

function pad(p: any, top: number = 16, right: number = 20, bottom: number = 16, left: number = 20): string {
    const pt = p.paddingTop ?? top
    const pr = p.paddingRight ?? right
    const pb = p.paddingBottom ?? bottom
    const pl = p.paddingLeft ?? left
    return `padding:${pt}px ${pr}px ${pb}px ${pl}px;`
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. AMBER CLASSIC CARD (Baseline Evolution — Crisp SVG Icon + Soft Glow Card)
// Solves: Replaces jagged emoji with clean vector badge while retaining classic tone.
// ─────────────────────────────────────────────────────────────────────────────
function amberClassicCard(p: any, _id: string): string {
    const bgCol = resolveBg(p, '#fffbeb')
    const borderCol = resolveBorder(p, '#fcd34d')
    const headingCol = resolveHeadingColor(p, '#92400e')
    const textCol = resolveTextColor(p, '#78350f')
    const accentCol = resolveAccent(p, '#f59e0b')
    const heading = resolveHeading(p, 'Please Read Before Buying')
    const text = resolveText(p, 'Please check compatibility before purchasing. Returns only accepted if unused and in original packaging.')
    const iconSvg = renderAlertTriangleSvg(accentCol, 24)

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;margin:0 auto;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid ${borderCol};border-radius:10px;${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="44" valign="top" style="width:44px;padding-right:14px;">
            <div style="width:40px;height:40px;background-color:#fef3c7;border:1px solid #fde68a;border-radius:8px;text-align:center;line-height:40px;">
              ${iconSvg}
            </div>
          </td>
          <td valign="top">
            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${headingCol};line-height:1.4;">
              ${heading}
            </p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${textCol};line-height:1.6;">
              ${text}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CRITICAL RED ALERT (High-Priority Notice with 4px Solid Accent Pillar)
// Solves: Vital warnings (strict return requirements, non-refundable parts, voltage warnings).
// ─────────────────────────────────────────────────────────────────────────────
function criticalRedAlert(p: any, _id: string): string {
    const bgCol = resolveBg(p, '#fef2f2')
    const borderCol = resolveBorder(p, '#fca5a5')
    const headingCol = resolveHeadingColor(p, '#991b1b')
    const textCol = resolveTextColor(p, '#7f1d1d')
    const accentCol = resolveAccent(p, '#ef4444')
    const heading = resolveHeading(p, 'Important Notice — Read Before Purchase')
    const text = resolveText(p, 'Please check compatibility before purchasing. Returns only accepted if unused and in original packaging.')
    const iconSvg = renderOctagonAlertSvg(accentCol, 24)

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;margin:0 auto;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid ${borderCol};border-left:5px solid ${accentCol};border-radius:8px;${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="42" valign="top" style="width:42px;padding-right:12px;">
            <div style="width:38px;height:38px;background-color:#fee2e2;border:1px solid #fecaca;border-radius:50%;text-align:center;line-height:38px;">
              ${iconSvg}
            </div>
          </td>
          <td valign="top">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:4px;">
              <tr>
                <td>
                  <span style="display:inline-block;background-color:${accentCol};color:#ffffff;font-family:Arial,sans-serif;font-size:10px;font-weight:800;letter-spacing:1px;padding:2px 7px;border-radius:4px;text-transform:uppercase;margin-bottom:6px;">
                    CRITICAL ALERT
                  </span>
                  <p style="margin:2px 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${headingCol};line-height:1.4;">
                    ${heading}
                  </p>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${textCol};line-height:1.6;">
              ${text}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. HAZARD STRIPE INDUSTRIAL (Workshop Caution Banner with Shield Alert)
// Solves: Automotive parts, power tools, electronics requiring technical fitment.
// ─────────────────────────────────────────────────────────────────────────────
function hazardStripeIndustrial(p: any, _id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const borderCol = resolveBorder(p, '#e5e7eb')
    const headingCol = resolveHeadingColor(p, '#1f2937')
    const textCol = resolveTextColor(p, '#4b5563')
    const accentCol = resolveAccent(p, '#f59e0b')
    const heading = resolveHeading(p, 'Pre-Purchase Fitment & Specification Check')
    const text = resolveText(p, 'Please check compatibility before purchasing. Returns only accepted if unused and in original packaging.')
    const iconSvg = renderShieldAlertSvg('#ffffff', 20)

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;margin:0 auto;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bgCol};border:2px solid ${borderCol};border-radius:8px;overflow:hidden;box-sizing:border-box;">
      <!-- Industrial Header Band -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#1e293b;">
        <tr>
          <td style="padding:10px 18px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="30" valign="middle" style="width:30px;">
                  <div style="width:26px;height:26px;background-color:${accentCol};border-radius:4px;text-align:center;line-height:26px;">
                    ${iconSvg}
                  </div>
                </td>
                <td valign="middle" style="padding-left:10px;">
                  <span style="font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:${accentCol};letter-spacing:1px;text-transform:uppercase;">
                    CAUTION &bull; WORKSHOP SPECIFICATION NOTICE
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <!-- Content Body -->
      <div style="${pad(p, 16, 20, 16, 20)}">
        <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${headingCol};line-height:1.4;">
          ${heading}
        </p>
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${textCol};line-height:1.6;">
          ${text}
        </p>
      </div>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. MIDNIGHT OBSIDIAN AMBER (Dark Mode Luxury High-Contrast Slate Flagship)
// Solves: High-tech gadget listings, gaming components, premium hardware.
// ─────────────────────────────────────────────────────────────────────────────
function midnightObsidianAmber(p: any, _id: string): string {
    const bgCol = resolveBg(p, '#0f172a')
    const borderCol = resolveBorder(p, '#334155')
    const headingCol = resolveHeadingColor(p, '#f8fafc')
    const textCol = resolveTextColor(p, '#cbd5e1')
    const accentCol = resolveAccent(p, '#f59e0b')
    const heading = resolveHeading(p, 'Please Read Before Buying')
    const text = resolveText(p, 'Please check compatibility before purchasing. Returns only accepted if unused and in original packaging.')
    const iconSvg = renderAlertTriangleSvg(accentCol, 22)

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;margin:0 auto;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid ${borderCol};border-radius:10px;${pad(p, 18, 22, 18, 22)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="44" valign="top" style="width:44px;padding-right:14px;">
            <div style="width:40px;height:40px;background-color:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);border-radius:8px;text-align:center;line-height:40px;">
              ${iconSvg}
            </div>
          </td>
          <td valign="top">
            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${headingCol};line-height:1.4;">
              ${heading}
            </p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${textCol};line-height:1.65;">
              ${text}
            </p>
            <p style="margin:10px 0 0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:${accentCol};letter-spacing:0.5px;">
              &bull; OFFICIAL BUYER GUIDANCE NOTE
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. SPLIT HEADER PILL (Two-Tone Solid Amber Header Band + Clean Body)
// Solves: Draws fast eye attention for skimmers who skip standard text blocks.
// ─────────────────────────────────────────────────────────────────────────────
function splitHeaderPill(p: any, _id: string): string {
    const bgCol = resolveBg(p, '#fffbeb')
    const borderCol = resolveBorder(p, '#fcd34d')
    const headingCol = resolveHeadingColor(p, '#92400e')
    const textCol = resolveTextColor(p, '#78350f')
    const accentCol = resolveAccent(p, '#d97706')
    const heading = resolveHeading(p, 'Please Read Before Buying')
    const text = resolveText(p, 'Please check compatibility before purchasing. Returns only accepted if unused and in original packaging.')
    const iconSvg = renderAlertTriangleSvg('#ffffff', 18)

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;margin:0 auto;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bgCol};border:2px solid ${borderCol};border-radius:10px;overflow:hidden;box-sizing:border-box;">
      <!-- Amber Header Bar -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${accentCol};">
        <tr>
          <td style="padding:10px 18px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="26" valign="middle" style="width:26px;">
                  ${iconSvg}
                </td>
                <td valign="middle" style="padding-left:8px;">
                  <span style="font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:#ffffff;letter-spacing:0.8px;text-transform:uppercase;">
                    IMPORTANT LISTING NOTICE
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <!-- Content Body -->
      <div style="${pad(p, 16, 20, 16, 20)}">
        <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${headingCol};line-height:1.4;">
          ${heading}
        </p>
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${textCol};line-height:1.6;">
          ${text}
        </p>
      </div>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. PILL BADGE MINIMAL (Nordic Minimalist Card with Floating Pill Badge)
// Solves: Sleek, high-end stores where loud warning colors look unprofessional.
// ─────────────────────────────────────────────────────────────────────────────
function pillBadgeMinimal(p: any, _id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const borderCol = resolveBorder(p, '#e2e8f0')
    const headingCol = resolveHeadingColor(p, '#0f172a')
    const textCol = resolveTextColor(p, '#475569')
    const accentCol = resolveAccent(p, '#b45309')
    const heading = resolveHeading(p, 'Please Read Before Buying')
    const text = resolveText(p, 'Please check compatibility before purchasing. Returns only accepted if unused and in original packaging.')
    const iconSvg = renderAlertTriangleSvg(accentCol, 14)

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;margin:0 auto;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid ${borderCol};border-radius:12px;${pad(p, 18, 22, 18, 22)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
        <tr>
          <td>
            <span style="display:inline-block;background-color:#fef3c7;border:1px solid #fde68a;color:${accentCol};font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:0.5px;">
              ${iconSvg} <span style="margin-left:4px;">ATTENTION REQUIRED</span>
            </span>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${headingCol};line-height:1.4;">
        ${heading}
      </p>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${textCol};line-height:1.65;">
        ${text}
      </p>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. COMPATIBILITY CHECKLIST (Technical Fitment Shield with Dual Checklist Rows)
// Solves: Drastically reduces wrong-order returns for cables, RAM, car parts, phone cases.
// ─────────────────────────────────────────────────────────────────────────────
function compatibilityChecklist(p: any, _id: string): string {
    const bgCol = resolveBg(p, '#fffbeb')
    const borderCol = resolveBorder(p, '#fcd34d')
    const headingCol = resolveHeadingColor(p, '#92400e')
    const textCol = resolveTextColor(p, '#78350f')
    const accentCol = resolveAccent(p, '#f59e0b')
    const heading = resolveHeading(p, 'Compatibility Verification Required')
    const text = resolveText(p, 'Please check compatibility before purchasing. Returns only accepted if unused and in original packaging.')
    const shieldSvg = renderShieldAlertSvg(accentCol, 24)
    const checkSvg = renderCheckSmallSvg('#16a34a', 15)

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;margin:0 auto;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bgCol};border:2px solid ${borderCol};border-radius:10px;${pad(p, 18, 22, 18, 22)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
        <tr>
          <td width="42" valign="middle" style="width:42px;">
            <div style="width:38px;height:38px;background-color:#ffffff;border:1px solid ${borderCol};border-radius:50%;text-align:center;line-height:38px;">
              ${shieldSvg}
            </div>
          </td>
          <td valign="middle" style="padding-left:12px;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${headingCol};">
              ${heading}
            </p>
            <p style="margin:2px 0 0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:${accentCol};letter-spacing:0.5px;text-transform:uppercase;">
              FITMENT &bull; MODEL NUMBER &bull; DIMENSIONS
            </p>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${textCol};line-height:1.6;">
        ${text}
      </p>
      <!-- Dual Checklist Row -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1px solid #fde68a;border-radius:6px;padding:8px 12px;">
        <tr>
          <td width="50%" valign="top" style="padding:4px 6px;">
            <span style="display:inline-block;vertical-align:middle;margin-right:6px;">${checkSvg}</span>
            <span style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#1e293b;">Confirm part/model number</span>
          </td>
          <td width="50%" valign="top" style="padding:4px 6px;">
            <span style="display:inline-block;vertical-align:middle;margin-right:6px;">${checkSvg}</span>
            <span style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#1e293b;">Check connector & voltage</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. SECURITY TAMPER NOTICE (Padlock Warranty & Return Protection Disclaimer)
// Solves: Fraud prevention & transparent returns policy communication.
// ─────────────────────────────────────────────────────────────────────────────
function securityTamperNotice(p: any, _id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const borderCol = resolveBorder(p, '#cbd5e1')
    const headingCol = resolveHeadingColor(p, '#1e293b')
    const textCol = resolveTextColor(p, '#475569')
    const accentCol = resolveAccent(p, '#d97706')
    const heading = resolveHeading(p, 'Security Seal & Return Eligibility')
    const text = resolveText(p, 'Please check compatibility before purchasing. Returns only accepted if unused and in original packaging.')
    const lockSvg = renderLockAlertSvg(accentCol, 22)

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;margin:0 auto;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bgCol};border:2px solid ${borderCol};border-radius:10px;${pad(p, 18, 22, 18, 22)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="48" valign="top" style="width:48px;padding-right:14px;">
            <div style="width:44px;height:44px;background-color:#fffbeb;border:2px solid #fde68a;border-radius:8px;text-align:center;line-height:44px;">
              ${lockSvg}
            </div>
          </td>
          <td valign="top">
            <span style="display:inline-block;background-color:#f1f5f9;color:#475569;font-family:Arial,sans-serif;font-size:10px;font-weight:800;letter-spacing:1px;padding:2px 8px;border-radius:4px;text-transform:uppercase;margin-bottom:6px;">
              SECURITY &bull; SERIAL RECORDED
            </span>
            <p style="margin:2px 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${headingCol};line-height:1.4;">
              ${heading}
            </p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${textCol};line-height:1.6;">
              ${text}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. FLOATING CALLOUT RIBBON (Refined Retail Announcement Card with Corner Tag)
// Solves: High-converting, friendly yet firm merchant instructions.
// ─────────────────────────────────────────────────────────────────────────────
function floatingCalloutRibbon(p: any, _id: string): string {
    const bgCol = resolveBg(p, '#fefce8')
    const borderCol = resolveBorder(p, '#fef08a')
    const headingCol = resolveHeadingColor(p, '#854d0e')
    const textCol = resolveTextColor(p, '#713f12')
    const accentCol = resolveAccent(p, '#ca8a04')
    const heading = resolveHeading(p, 'Please Read Before Buying')
    const text = resolveText(p, 'Please check compatibility before purchasing. Returns only accepted if unused and in original packaging.')
    const alertSvg = renderAlertTriangleSvg(accentCol, 20)

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;margin:0 auto;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid ${borderCol};border-radius:12px;${pad(p, 18, 22, 18, 22)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
        <tr>
          <td align="left">
            <span style="display:inline-block;background-color:${accentCol};color:#ffffff;font-family:Arial,sans-serif;font-size:10px;font-weight:800;letter-spacing:1px;padding:3px 9px;border-radius:4px;text-transform:uppercase;">
              PLEASE NOTE
            </span>
          </td>
          <td align="right">
            ${alertSvg}
          </td>
        </tr>
      </table>
      <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${headingCol};line-height:1.4;">
        ${heading}
      </p>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${textCol};line-height:1.65;">
        ${text}
      </p>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. COMPACT INLINE TICKER (Mobile-First Capsule Strip for Zero-Scroll Buyers)
// Solves: Fits cleanly above item specifics or gallery without taking space.
// ─────────────────────────────────────────────────────────────────────────────
function compactInlineTicker(p: any, _id: string): string {
    const bgCol = resolveBg(p, '#fffbeb')
    const borderCol = resolveBorder(p, '#fcd34d')
    const headingCol = resolveHeadingColor(p, '#92400e')
    const textCol = resolveTextColor(p, '#78350f')
    const accentCol = resolveAccent(p, '#f59e0b')
    const heading = resolveHeading(p, 'Notice')
    const text = resolveText(p, 'Please check compatibility before purchasing. Returns only accepted if unused and in original packaging.')
    const alertSvg = renderAlertTriangleSvg(accentCol, 18)

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;margin:0 auto;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid ${borderCol};border-radius:24px;${pad(p, 10, 18, 10, 18)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="30" valign="middle" style="width:30px;padding-right:8px;">
            ${alertSvg}
          </td>
          <td valign="middle">
            <span style="font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:${headingCol};margin-right:6px;">
              ${heading}:
            </span>
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${textCol};line-height:1.4;">
              ${text}
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// THUMBNAILS (Crisp Vector SVG Previews for VisualEditor PropertiesPanel)
// ─────────────────────────────────────────────────────────────────────────────
export const warningBoxThumbnails: Record<string, string> = {
    'wb-amber-classic-card': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#fffbeb" stroke="#fcd34d" stroke-width="1"/>
    <rect x="6" y="8" width="12" height="12" rx="2" fill="#fef3c7" stroke="#fde68a" stroke-width="0.8"/>
    <path d="M12 11 L10 16 H14 Z" fill="#f59e0b"/>
    <circle cx="12" cy="17" r="0.6" fill="#f59e0b"/>
    <rect x="22" y="10" width="46" height="4" rx="1.5" fill="#92400e"/>
    <rect x="22" y="18" width="52" height="2.5" rx="1" fill="#78350f" opacity="0.8"/>
    <rect x="22" y="24" width="42" height="2.5" rx="1" fill="#78350f" opacity="0.6"/>
  </svg>`,

    'wb-critical-red-alert': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#fef2f2" stroke="#fca5a5" stroke-width="1"/>
    <rect x="0" y="0" width="3" height="48" fill="#ef4444"/>
    <circle cx="12" cy="14" r="6" fill="#fee2e2" stroke="#fecaca" stroke-width="0.8"/>
    <rect x="11.5" y="11" width="1" height="4" fill="#ef4444"/>
    <circle cx="12" cy="16.5" r="0.6" fill="#ef4444"/>
    <rect x="22" y="8" width="22" height="3" rx="1" fill="#ef4444"/>
    <rect x="22" y="14" width="46" height="3.5" rx="1" fill="#991b1b"/>
    <rect x="22" y="22" width="50" height="2.5" rx="1" fill="#7f1d1d" opacity="0.75"/>
    <rect x="22" y="28" width="38" height="2.5" rx="1" fill="#7f1d1d" opacity="0.55"/>
  </svg>`,

    'wb-hazard-stripe-industrial': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e5e7eb" stroke-width="1"/>
    <rect width="80" height="12" fill="#1e293b"/>
    <rect x="6" y="2" width="8" height="8" rx="1.5" fill="#f59e0b"/>
    <rect x="18" y="4" width="48" height="3.5" rx="1" fill="#f59e0b"/>
    <rect x="8" y="18" width="56" height="3.5" rx="1" fill="#1f2937"/>
    <rect x="8" y="25" width="64" height="2.5" rx="1" fill="#64748b"/>
    <rect x="8" y="31" width="52" height="2.5" rx="1" fill="#94a3b8"/>
  </svg>`,

    'wb-midnight-obsidian-amber': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#0f172a" stroke="#334155" stroke-width="1"/>
    <rect x="6" y="8" width="12" height="12" rx="2" fill="rgba(245,158,11,0.18)" stroke="rgba(245,158,11,0.4)" stroke-width="0.8"/>
    <path d="M12 11 L10 16 H14 Z" fill="#f59e0b"/>
    <circle cx="12" cy="17" r="0.6" fill="#f59e0b"/>
    <rect x="22" y="10" width="46" height="4" rx="1.5" fill="#f8fafc"/>
    <rect x="22" y="18" width="52" height="2.5" rx="1" fill="#cbd5e1"/>
    <rect x="22" y="24" width="40" height="2.5" rx="1" fill="#cbd5e1" opacity="0.7"/>
    <rect x="22" y="32" width="32" height="2" rx="1" fill="#f59e0b" opacity="0.9"/>
  </svg>`,

    'wb-split-header-pill': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#fffbeb" stroke="#fcd34d" stroke-width="1"/>
    <rect width="80" height="12" fill="#d97706"/>
    <circle cx="10" cy="6" r="2.5" fill="#ffffff" opacity="0.9"/>
    <rect x="16" y="4.5" width="48" height="3" rx="1" fill="#ffffff"/>
    <rect x="8" y="18" width="50" height="4" rx="1.5" fill="#92400e"/>
    <rect x="8" y="26" width="64" height="2.5" rx="1" fill="#78350f" opacity="0.8"/>
    <rect x="8" y="32" width="48" height="2.5" rx="1" fill="#78350f" opacity="0.6"/>
  </svg>`,

    'wb-pill-badge-minimal': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="5" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="6" width="30" height="7" rx="3.5" fill="#fef3c7" stroke="#fde68a" stroke-width="0.8"/>
    <circle cx="10" cy="9.5" r="1.5" fill="#b45309"/>
    <rect x="14" y="8" width="18" height="3" rx="1" fill="#b45309"/>
    <rect x="6" y="18" width="52" height="4" rx="1.5" fill="#0f172a"/>
    <rect x="6" y="26" width="66" height="2.5" rx="1" fill="#475569"/>
    <rect x="6" y="32" width="54" height="2.5" rx="1" fill="#475569" opacity="0.7"/>
  </svg>`,

    'wb-compatibility-checklist': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#fffbeb" stroke="#fcd34d" stroke-width="1"/>
    <circle cx="12" cy="12" r="6" fill="#ffffff" stroke="#fcd34d" stroke-width="0.8"/>
    <path d="M12 8 L15 11 V14 C15 16 12 17 12 17 C12 17 9 16 9 14 V11 Z" fill="#f59e0b"/>
    <rect x="22" y="9" width="48" height="4" rx="1.5" fill="#92400e"/>
    <rect x="22" y="16" width="36" height="2" rx="1" fill="#f59e0b"/>
    <!-- dual mini check rows -->
    <rect x="6" y="26" width="68" height="15" rx="3" fill="#ffffff" stroke="#fde68a" stroke-width="0.8"/>
    <circle cx="12" cy="33.5" r="2.5" fill="#16a34a"/>
    <rect x="17" y="32" width="20" height="2.5" rx="1" fill="#1e293b"/>
    <circle cx="44" cy="33.5" r="2.5" fill="#16a34a"/>
    <rect x="49" y="32" width="20" height="2.5" rx="1" fill="#1e293b"/>
  </svg>`,

    'wb-security-tamper-notice': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="6" y="8" width="13" height="13" rx="2" fill="#fffbeb" stroke="#fde68a" stroke-width="0.8"/>
    <!-- Padlock SVG -->
    <rect x="9" y="14" width="7" height="5" rx="1" fill="#d97706"/>
    <path d="M10.5 14 V12 A2 2 0 0 1 14.5 12 V14" stroke="#d97706" stroke-width="1" fill="none"/>
    <rect x="23" y="8" width="32" height="3.5" rx="1" fill="#f1f5f9"/>
    <rect x="23" y="14" width="48" height="3.5" rx="1" fill="#1e293b"/>
    <rect x="23" y="21" width="51" height="2.5" rx="1" fill="#475569"/>
    <rect x="23" y="27" width="42" height="2.5" rx="1" fill="#475569" opacity="0.7"/>
  </svg>`,

    'wb-floating-callout-ribbon': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#fefce8" stroke="#fef08a" stroke-width="1"/>
    <rect x="6" y="6" width="26" height="5" rx="1.5" fill="#ca8a04"/>
    <path d="M70 6 L67 11 H73 Z" fill="#ca8a04"/>
    <rect x="6" y="16" width="54" height="4" rx="1.5" fill="#854d0e"/>
    <rect x="6" y="24" width="66" height="2.5" rx="1" fill="#713f12" opacity="0.8"/>
    <rect x="6" y="30" width="50" height="2.5" rx="1" fill="#713f12" opacity="0.6"/>
  </svg>`,

    'wb-compact-inline-ticker': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect x="2" y="12" width="76" height="24" rx="12" fill="#fffbeb" stroke="#fcd34d" stroke-width="1"/>
    <path d="M12 20 L9 26 H15 Z" fill="#f59e0b"/>
    <circle cx="12" cy="27" r="0.6" fill="#f59e0b"/>
    <rect x="20" y="22" width="16" height="3.5" rx="1" fill="#92400e"/>
    <rect x="39" y="22" width="34" height="3" rx="1" fill="#78350f" opacity="0.8"/>
  </svg>`,
}

// ── Block Variant Registry ──────────────────────────────────────────────────

export const warningBoxVariants: BlockVariant[] = [
    {
        id: 'wb-amber-classic-card',
        label: 'Amber Classic Card',
        description: 'Classic baseline: Warm amber card with crisp rounded SVG alert badge and clear typography',
        thumbnail: warningBoxThumbnails['wb-amber-classic-card'],
        toHtml: amberClassicCard,
    },
    {
        id: 'wb-critical-red-alert',
        label: 'Critical Red Alert',
        description: 'High-priority crimson card with 4px red accent pillar and stop alert icon',
        thumbnail: warningBoxThumbnails['wb-critical-red-alert'],
        toHtml: criticalRedAlert,
    },
    {
        id: 'wb-hazard-stripe-industrial',
        label: 'Hazard Industrial Banner',
        description: 'Workshop fitment notice with dark caution band and protective shield alert',
        thumbnail: warningBoxThumbnails['wb-hazard-stripe-industrial'],
        toHtml: hazardStripeIndustrial,
    },
    {
        id: 'wb-midnight-obsidian-amber',
        label: 'Midnight Obsidian Amber',
        description: 'High-contrast dark slate card with golden amber glow for electronics & gaming',
        thumbnail: warningBoxThumbnails['wb-midnight-obsidian-amber'],
        toHtml: midnightObsidianAmber,
    },
    {
        id: 'wb-split-header-pill',
        label: 'Split Header Banner',
        description: 'Solid amber header band with white alert icon above crisp card body',
        thumbnail: warningBoxThumbnails['wb-split-header-pill'],
        toHtml: splitHeaderPill,
    },
    {
        id: 'wb-pill-badge-minimal',
        label: 'Pill Badge Minimal',
        description: 'Nordic minimalist white card with rounded attention capsule badge',
        thumbnail: warningBoxThumbnails['wb-pill-badge-minimal'],
        toHtml: pillBadgeMinimal,
    },
    {
        id: 'wb-compatibility-checklist',
        label: 'Compatibility Checklist',
        description: 'Technical fitment shield with dual verification check rows to prevent returns',
        thumbnail: warningBoxThumbnails['wb-compatibility-checklist'],
        toHtml: compatibilityChecklist,
    },
    {
        id: 'wb-security-tamper-notice',
        label: 'Security Tamper Notice',
        description: 'Padlock warranty emblem with serial recording and return condition terms',
        thumbnail: warningBoxThumbnails['wb-security-tamper-notice'],
        toHtml: securityTamperNotice,
    },
    {
        id: 'wb-floating-callout-ribbon',
        label: 'Floating Callout Ribbon',
        description: 'Refined retail banner with please-note badge tag and caution triangle',
        thumbnail: warningBoxThumbnails['wb-floating-callout-ribbon'],
        toHtml: floatingCalloutRibbon,
    },
    {
        id: 'wb-compact-inline-ticker',
        label: 'Compact Inline Ticker',
        description: 'Mobile-first slim horizontal capsule strip for tight listing layouts',
        thumbnail: warningBoxThumbnails['wb-compact-inline-ticker'],
        toHtml: compactInlineTicker,
    },
]

export function getWarningBoxVariant(id: string): BlockVariant {
    const found = warningBoxVariants.find(v => v.id === id)
    return found ?? warningBoxVariants[0]
}

// Aliases for compatibility
export const warningVariants = warningBoxVariants
export const getWarningVariant = getWarningBoxVariant
