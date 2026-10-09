// components/ui/VisualEditor/variants/why_buy_from_us.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Why Buy From Us — 10 High-Converting, Professional eBay Retail Variants
// Built specifically for eBay merchants to differentiate against competitors,
// eliminate drop-shipping fears, and highlight tangible fulfillment advantages:
// - Physical warehouse stock (Same-day dispatch cutoffs)
// - Hassle-free return policy with pre-paid labels
// - Direct manufacturer warranty & 100% authentic inventory
// - Responsive human customer care & Top Rated Seller track record
//
// 100% eBay-compliant inline CSS and HTML table architecture.
// Zero AI-slop, zero blurry glassmorphism, zero fake neon glows.
//
// 1.  why-classic-centered       — Current Style: Centered title with 3-column benefit cards
// 2.  why-boxed-cards-grid       — 3 Individual bordered retail cards with icon containers
// 3.  why-horizontal-feature-rows— Stacked full-width rows with left squircle icon & detailed copy
// 4.  why-split-hero-pledge      — 35/65 Architectural split: Left branded promise pledge + Right stacked pillars
// 5.  why-numbered-editorial-ledger— Scandinavian luxury ledger with 01-03 numerals & hairline dividers
// 6.  why-numbered-steps-timeline— 4-Step buyer peace-of-mind fulfillment roadmap (Pick, Pack, Track, Deliver)
// 7.  why-compact-banner-strip   — Dense horizontal reassurance strip with vertical separators
// 8.  why-official-guarantee-shield— Emerald/Navy double-hairline guarantee certificate card
// 9.  why-dark-merchant-flagship — Midnight obsidian high-contrast trust bar for tech, motors & tools
// 10. why-two-column-checklist   — 2×2 Grid with verified badge pills and dual-column bullet reassurance
// ─────────────────────────────────────────────────────────────────────────────

import { getIconSvg as getLibraryIconSvg, ICON_LIBRARY, ICON_CATEGORIES } from '../IconLibrary'

export interface BlockVariant {
  id: string
  label: string
  description: string
  thumbnail?: string
  toHtml: (props: any, id: string) => string
}

export interface WhyBuyReason {
  icon: string
  title: string
  desc: string
}

const DEFAULT_REASONS: WhyBuyReason[] = [
  { icon: 'shield-check', title: '100% Authentic Stock', desc: 'All items are brand new, genuine, and sourced directly from certified manufacturers.' },
  { icon: 'truck', title: 'Same-Day Fast Dispatch', desc: 'Orders placed before 2:00 PM EST ship the very same business day with full tracking.' },
  { icon: 'rotate-ccw', title: '30-Day Hassle-Free Returns', desc: 'Not completely satisfied? Return your item within 30 days for a prompt, full refund.' },
]

// ── Smart Vector SVG Icon Resolver ──────────────────────────────────────────

function resolveIconSvg(icon: string, color = '#7530fb', size = 22): string {
  if (!icon) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`
  }

  const raw = String(icon).trim()

  // 1. Raw SVG payload
  if (raw.startsWith('<svg') || raw.includes('xmlns="http://www.w3.org/2000/svg"')) {
    let svg = raw
    if (svg.includes('width=')) {
      svg = svg.replace(/width="[^"]*"/, `width="${size}"`)
    } else {
      svg = svg.replace('<svg', `<svg width="${size}"`)
    }
    if (svg.includes('height=')) {
      svg = svg.replace(/height="[^"]*"/, `height="${size}"`)
    } else {
      svg = svg.replace('<svg', `<svg height="${size}"`)
    }
    if (!svg.includes('style=')) {
      svg = svg.replace('<svg', `<svg style="display:inline-block;vertical-align:middle;"`)
    }
    svg = svg.replace(/stroke="currentColor"/g, `stroke="${color}"`)
      .replace(/fill="currentColor"/g, `fill="${color}"`)
    return svg
  }

  const norm = raw.toLowerCase().replace(/_/g, '-').trim()

  // 2. Exact match in IconLibrary.ts
  try {
    for (const cat of ICON_CATEGORIES) {
      const match = ICON_LIBRARY[cat]?.find(e => e.id === norm || norm.includes(e.id))
      if (match) {
        return match.svg(color, size)
      }
    }
  } catch (_e) {
    // continue
  }

  // 3. Common Retail & Trust Dictionary
  if (norm.includes('shield') || norm.includes('auth') || norm.includes('check') || norm.includes('genuine') || norm.includes('✅') || norm.includes('✔')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>`
  }

  if (norm.includes('truck') || norm.includes('ship') || norm.includes('dispatch') || norm.includes('delivery') || norm.includes('courier') || norm.includes('🚚')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
      <path d="M15 18H9"/>
      <path d="M19 18h2a1 1 0 0 0 1-1v-5l-3-4h-5v10"/>
      <circle cx="7" cy="18" r="2"/>
      <circle cx="17" cy="18" r="2"/>
    </svg>`
  }

  if (norm.includes('box') || norm.includes('package') || norm.includes('parcel') || norm.includes('📦')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
      <path d="m7.5 4.27 9 5.15"/>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
      <path d="m3.3 7 8.7 5 8.7-5"/>
      <path d="M12 22V12"/>
    </svg>`
  }

  if (norm.includes('rotate') || norm.includes('return') || norm.includes('refund') || norm.includes('undo') || norm.includes('refresh') || norm.includes('🔄') || norm.includes('↩')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
    </svg>`
  }

  if (norm.includes('star') || norm.includes('rated') || norm.includes('award') || norm.includes('top') || norm.includes('medal') || norm.includes('⭐')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="${color}" fill-opacity="0.15"/>
    </svg>`
  }

  if (norm.includes('headphones') || norm.includes('support') || norm.includes('chat') || norm.includes('service') || norm.includes('help')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
    </svg>`
  }

  if (norm.includes('lock') || norm.includes('secure') || norm.includes('safe') || norm.includes('protect')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>`
  }

  // Fallback Clean Checkmark
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`
}

function pad(p: any): string {
  return `padding:${p.paddingTop ?? 24}px ${p.paddingRight ?? 24}px ${p.paddingBottom ?? 24}px ${p.paddingLeft ?? 24}px;`
}

function resolveReasons(p: any): WhyBuyReason[] {
  // Support p.points (original why_buy_from_us schema), p.reasons, p.features, p.badges, and p.items
  const rawList = Array.isArray(p.points) && p.points.length > 0
    ? p.points
    : Array.isArray(p.reasons) && p.reasons.length > 0
      ? p.reasons
      : Array.isArray(p.features) && p.features.length > 0
        ? p.features
        : Array.isArray(p.badges) && p.badges.length > 0
          ? p.badges
          : Array.isArray(p.items) && p.items.length > 0
            ? p.items
            : DEFAULT_REASONS

  return rawList.map((item: any, idx: number) => ({
    icon: item.icon ?? item.svg ?? (idx === 0 ? 'shield-check' : idx === 1 ? 'truck' : 'rotate-ccw'),
    title: item.title ?? item.label ?? item.heading ?? `Benefit ${idx + 1}`,
    desc: item.desc ?? item.text ?? item.description ?? item.subText ?? '',
  }))
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLASSIC CENTERED (CURRENT STYLE — 100% IDENTICAL STRUCTURE)
// ─────────────────────────────────────────────────────────────────────────────
function variantClassicCentered(p: any, id: string): string {
  const reasons = resolveReasons(p)
  const title = p.title ?? 'Why Shop With Us?'
  const titleColor = p.titleColor ?? '#1e1535'
  const descColor = p.descColor ?? '#6b7280'
  const iconColor = p.iconColor ?? '#7530fb'
  const colWidth = Math.floor(100 / (reasons.length || 3))

  const cols = reasons.map((r, i) => `
    <td width="${colWidth}%" style="text-align:center;padding:12px 10px;vertical-align:top;">
      <div data-feature-index="${i}" data-badge-index="${i}" data-icon-index="${i}" data-reason-index="${i}" data-point-index="${i}" data-item-index="${i}" data-index="${i}" data-field="icon" data-editable="icon" style="margin-bottom:10px;cursor:pointer;">
        ${resolveIconSvg(r.icon, iconColor, 28)}
      </div>
      <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${titleColor};line-height:1.3;">${r.title}</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:${descColor};line-height:1.5;">${r.desc}</p>
    </td>`).join('')

  return `<!--[riazify:why_buy_from_us:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;background-color:${p.bgColor ?? '#ffffff'};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}">
      <p style="margin:0 0 20px;font-family:Arial,sans-serif;font-size:18px;font-weight:700;color:${titleColor};text-align:center;letter-spacing:-0.2px;">${title}</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>${cols}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. BOXED CARDS GRID (3 Separate Physical Bordered Cards)
// ─────────────────────────────────────────────────────────────────────────────
function variantBoxedCardsGrid(p: any, id: string): string {
  const reasons = resolveReasons(p)
  const title = p.title ?? 'Why Shop With Us?'
  const titleColor = p.titleColor ?? '#1e1535'
  const descColor = p.descColor ?? '#64748b'
  const iconColor = p.iconColor ?? '#7530fb'
  const cardBg = p.cardBg ?? '#ffffff'
  const cardBorder = p.cardBorder ?? '#e2e8f0'
  const colWidth = Math.floor(100 / (reasons.length || 3))

  const cards = reasons.map((r, i) => `
    <td width="${colWidth}%" style="vertical-align:top;padding:0 6px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${cardBg};border:1.5px solid ${cardBorder};border-radius:10px;border-collapse:collapse;">
        <tr>
          <td style="padding:18px 14px;text-align:center;">
            <div data-feature-index="${i}" data-badge-index="${i}" data-icon-index="${i}" data-reason-index="${i}" data-point-index="${i}" data-item-index="${i}" data-index="${i}" data-field="icon" data-editable="icon" style="display:inline-block;width:44px;height:44px;line-height:44px;background-color:#f5f3ff;border-radius:10px;margin-bottom:12px;cursor:pointer;">
              ${resolveIconSvg(r.icon, iconColor, 22)}
            </div>
            <p style="margin:0 0 6px;font-size:13px;font-weight:800;color:${titleColor};line-height:1.3;">${r.title}</p>
            <p style="margin:0;font-size:11px;color:${descColor};line-height:1.45;">${r.desc}</p>
          </td>
        </tr>
      </table>
    </td>`).join('')

  return `<!--[riazify:why_buy_from_us:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;background-color:${p.bgColor ?? '#f8fafc'};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}">
      <div style="text-align:center;margin-bottom:20px;">
        <span style="display:inline-block;padding:3px 10px;background-color:#ede9fe;color:${iconColor};font-size:10px;font-weight:800;border-radius:12px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Buyer Reassurance</span>
        <h3 style="margin:0;font-size:18px;font-weight:800;color:${titleColor};">${title}</h3>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>${cards}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. HORIZONTAL FEATURE ROWS (Stacked Full-Width Detail Rows)
// ─────────────────────────────────────────────────────────────────────────────
function variantHorizontalFeatureRows(p: any, id: string): string {
  const reasons = resolveReasons(p)
  const title = p.title ?? 'Why Choose Our Store?'
  const titleColor = p.titleColor ?? '#1e1535'
  const descColor = p.descColor ?? '#475569'
  const iconColor = p.iconColor ?? '#7530fb'
  const borderColor = p.borderColor ?? '#e2e8f0'

  const rows = reasons.map((r, i) => `
    <tr>
      <td style="padding:14px 16px;border-bottom:${i < reasons.length - 1 ? `1px solid ${borderColor}` : 'none'};vertical-align:middle;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
          <tr>
            <td width="46" style="width:46px;vertical-align:top;padding-right:14px;">
              <div data-feature-index="${i}" data-badge-index="${i}" data-icon-index="${i}" data-reason-index="${i}" data-point-index="${i}" data-item-index="${i}" data-index="${i}" data-field="icon" data-editable="icon" style="width:42px;height:42px;line-height:42px;text-align:center;background-color:#f5f3ff;border-radius:10px;cursor:pointer;">
                ${resolveIconSvg(r.icon, iconColor, 20)}
              </div>
            </td>
            <td style="vertical-align:middle;">
              <p style="margin:0 0 3px;font-size:13px;font-weight:800;color:${titleColor};">${r.title}</p>
              <p style="margin:0;font-size:11px;color:${descColor};line-height:1.4;">${r.desc}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('')

  return `<!--[riazify:why_buy_from_us:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;background-color:${p.bgColor ?? '#ffffff'};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}">
      <div style="margin-bottom:16px;">
        <h3 style="margin:0 0 4px;font-size:17px;font-weight:800;color:${titleColor};">${title}</h3>
        <p style="margin:0;font-size:11px;color:#64748b;">Our commitment to every customer on eBay</p>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1.5px solid ${borderColor};border-radius:10px;border-collapse:collapse;">
        ${rows}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SPLIT HERO PLEDGE (35% Branded Pledge Column + 65% Stacked Benefits)
// ─────────────────────────────────────────────────────────────────────────────
function variantSplitHeroPledge(p: any, id: string): string {
  const reasons = resolveReasons(p)
  const title = p.title ?? 'Why Shop With Us?'
  const titleColor = p.titleColor ?? '#1e1535'
  const descColor = p.descColor ?? '#475569'
  const accent = p.iconColor ?? '#7530fb'

  const items = reasons.map((r, i) => `
    <tr>
      <td style="padding:${i === 0 ? '0' : '12px'} 0 0 0;vertical-align:top;">
        <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
          <tr>
            <td width="30" style="width:30px;vertical-align:top;padding-top:2px;">
              <div data-feature-index="${i}" data-badge-index="${i}" data-icon-index="${i}" data-reason-index="${i}" data-point-index="${i}" data-item-index="${i}" data-index="${i}" data-field="icon" data-editable="icon" style="cursor:pointer;">
                ${resolveIconSvg(r.icon, accent, 18)}
              </div>
            </td>
            <td style="vertical-align:top;">
              <p style="margin:0 0 2px;font-size:12px;font-weight:800;color:${titleColor};">${r.title}</p>
              <p style="margin:0;font-size:11px;color:${descColor};line-height:1.4;">${r.desc}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('')

  return `<!--[riazify:why_buy_from_us:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;background-color:${p.bgColor ?? '#ffffff'};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1.5px solid #ede9fe;border-radius:10px;background-color:#ffffff;border-collapse:collapse;">
        <tr>
          <!-- Left 35% Branded Pledge -->
          <td width="35%" style="background-color:${accent};padding:24px 20px;vertical-align:middle;text-align:center;border-radius:8px 0 0 8px;">
            <div style="width:48px;height:48px;line-height:48px;background-color:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 12px;text-align:center;">
              ${resolveIconSvg('shield-check', '#ffffff', 26)}
            </div>
            <h4 style="margin:0 0 6px;font-size:16px;font-weight:900;color:#ffffff;letter-spacing:-0.2px;">${title}</h4>
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.85);line-height:1.4;">Authentic Retailer &amp; Verified Top Seller</p>
          </td>
          <!-- Right 65% Benefit List -->
          <td width="65%" style="padding:20px 24px;vertical-align:middle;background-color:#ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              ${items}
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. NUMBERED EDITORIAL LEDGER (Scandinavian Minimalist 01-03 Numerals)
// ─────────────────────────────────────────────────────────────────────────────
function variantNumberedEditorialLedger(p: any, id: string): string {
  const reasons = resolveReasons(p)
  const title = p.title ?? 'Why Buy From Us'
  const titleColor = p.titleColor ?? '#0f172a'
  const descColor = p.descColor ?? '#64748b'
  const accent = p.iconColor ?? '#7530fb'
  const colWidth = Math.floor(100 / (reasons.length || 3))

  const cols = reasons.map((r, i) => `
    <td width="${colWidth}%" style="vertical-align:top;padding:0 12px;border-left:${i > 0 ? '1px solid #e2e8f0' : 'none'};">
      <div style="margin-bottom:8px;">
        <span style="font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:900;color:${accent};letter-spacing:1px;">0${i + 1}</span>
      </div>
      <p style="margin:0 0 4px;font-size:13px;font-weight:800;color:${titleColor};">${r.title}</p>
      <p style="margin:0;font-size:11px;color:${descColor};line-height:1.45;">${r.desc}</p>
    </td>`).join('')

  return `<!--[riazify:why_buy_from_us:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;background-color:${p.bgColor ?? '#ffffff'};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}">
      <div style="border-bottom:2px solid #0f172a;padding-bottom:10px;margin-bottom:20px;display:table;width:100%;">
        <span style="font-size:14px;font-weight:900;color:#0f172a;text-transform:uppercase;letter-spacing:1px;">${title}</span>
        <span style="float:right;font-size:11px;color:#64748b;font-weight:700;">VERIFIED SERVICE</span>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>${cols}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. NUMBERED STEPS TIMELINE (Pick, Pack, Track, Deliver Reassurance)
// ─────────────────────────────────────────────────────────────────────────────
function variantNumberedStepsTimeline(p: any, id: string): string {
  const reasons = resolveReasons(p)
  const title = p.title ?? 'Your Seamless Order Experience'
  const titleColor = p.titleColor ?? '#1e1535'
  const descColor = p.descColor ?? '#64748b'
  const accent = p.iconColor ?? '#16a34a'
  const colWidth = Math.floor(100 / (reasons.length || 3))

  const steps = reasons.map((r, i) => `
    <td width="${colWidth}%" style="text-align:center;vertical-align:top;padding:0 8px;position:relative;">
      <div data-feature-index="${i}" data-badge-index="${i}" data-icon-index="${i}" data-reason-index="${i}" data-point-index="${i}" data-item-index="${i}" data-index="${i}" data-field="icon" data-editable="icon" style="width:36px;height:36px;line-height:36px;border-radius:50%;background-color:#dcfce7;border:2px solid ${accent};color:${accent};font-size:13px;font-weight:900;margin:0 auto 10px;text-align:center;cursor:pointer;">
        ${resolveIconSvg(r.icon, accent, 18)}
      </div>
      <p style="margin:0 0 4px;font-size:12px;font-weight:800;color:${titleColor};">${r.title}</p>
      <p style="margin:0;font-size:10px;color:${descColor};line-height:1.4;">${r.desc}</p>
    </td>`).join('')

  return `<!--[riazify:why_buy_from_us:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;background-color:${p.bgColor ?? '#ffffff'};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}">
      <p style="margin:0 0 4px;font-size:11px;font-weight:800;color:${accent};text-transform:uppercase;letter-spacing:0.5px;text-align:center;">Fulfillment Guarantee</p>
      <h3 style="margin:0 0 20px;font-size:17px;font-weight:800;color:${titleColor};text-align:center;">${title}</h3>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>${steps}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. COMPACT BANNER STRIP (Dense Single Inline Row)
// ─────────────────────────────────────────────────────────────────────────────
function variantCompactBannerStrip(p: any, id: string): string {
  const reasons = resolveReasons(p)
  const titleColor = p.titleColor ?? '#1e1535'
  const accent = p.iconColor ?? '#7530fb'

  const pills = reasons.map((r, i) => `
    ${i > 0 ? `<td class="cbs-divider-${id}" style="padding:0 12px;color:#cbd5e1;font-size:16px;vertical-align:middle;">|</td>` : ''}
    <td class="cbs-item-${id}" style="white-space:nowrap;vertical-align:middle;padding:6px 8px;text-align:center;">
      <span data-feature-index="${i}" data-badge-index="${i}" data-icon-index="${i}" data-reason-index="${i}" data-point-index="${i}" data-item-index="${i}" data-index="${i}" data-field="icon" data-editable="icon" style="vertical-align:middle;margin-right:6px;display:inline-block;cursor:pointer;">
        ${resolveIconSvg(r.icon, accent, 18)}
      </span>
      <span style="font-size:12px;font-weight:800;color:${titleColor};vertical-align:middle;">${r.title}</span>
    </td>`).join('')

  return `<!--[riazify:why_buy_from_us:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .cbs-table-${id} { width: 100% !important; min-width: 100% !important; }
    .cbs-pad-${id} { padding: 14px 10px !important; text-align: center !important; }
    .cbs-row-${id} { display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; gap: 8px !important; width: 100% !important; }
    .cbs-divider-${id} { display: none !important; }
    .cbs-item-${id} { display: block !important; width: 100% !important; text-align: center !important; padding: 4px 0 !important; }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="cbs-table-${id}"
  style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;background-color:${p.bgColor ?? '#f8f7ff'};border-top:1.5px solid #ede9fe;border-bottom:1.5px solid #ede9fe;font-family:Arial,Helvetica,sans-serif;box-sizing:border-box;">
  <tr>
    <td class="cbs-pad-${id}" style="padding:14px 20px;text-align:center;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin:0 auto;">
        <tr class="cbs-row-${id}">${pills}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. OFFICIAL GUARANTEE SHIELD (Emerald Buyer Protection Certificate)
// ─────────────────────────────────────────────────────────────────────────────
function variantOfficialGuaranteeShield(p: any, id: string): string {
  const reasons = resolveReasons(p)
  const title = p.title ?? 'Official Buyer Guarantee'
  const titleColor = p.titleColor ?? '#14532d'
  const descColor = p.descColor ?? '#15803d'
  const accent = p.iconColor ?? '#16a34a'
  const colWidth = Math.floor(100 / (reasons.length || 3))

  const cells = reasons.map((r, i) => `
    <td width="${colWidth}%" style="vertical-align:top;padding:12px 10px;text-align:center;">
      <div data-feature-index="${i}" data-badge-index="${i}" data-icon-index="${i}" data-reason-index="${i}" data-point-index="${i}" data-item-index="${i}" data-index="${i}" data-field="icon" data-editable="icon" style="width:40px;height:40px;line-height:40px;background-color:#ffffff;border:1.5px solid #bbf7d0;border-radius:50%;margin:0 auto 10px;cursor:pointer;">
        ${resolveIconSvg(r.icon, accent, 20)}
      </div>
      <p style="margin:0 0 4px;font-size:13px;font-weight:800;color:${titleColor};">${r.title}</p>
      <p style="margin:0;font-size:11px;color:${descColor};line-height:1.4;">${r.desc}</p>
    </td>`).join('')

  return `<!--[riazify:why_buy_from_us:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;background-color:#f0fdf4;border:2px solid #bbf7d0;border-radius:10px;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}">
      <div style="text-align:center;margin-bottom:16px;">
        <span style="font-size:10px;font-weight:900;letter-spacing:1px;color:${accent};text-transform:uppercase;">Verified Authentic</span>
        <h3 style="margin:4px 0 0;font-size:18px;font-weight:900;color:${titleColor};">${title}</h3>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. DARK MERCHANT FLAGSHIP (Midnight Obsidian for Tech, Motors & Tools)
// ─────────────────────────────────────────────────────────────────────────────
function variantDarkMerchantFlagship(p: any, id: string): string {
  const reasons = resolveReasons(p)
  const title = p.title ?? 'Why Buy From Us'
  const accent = p.accentColor ?? p.iconColor ?? '#b8fa33'
  const colWidth = Math.floor(100 / (reasons.length || 3))

  const cells = reasons.map((r, i) => `
    <td width="${colWidth}%" style="vertical-align:top;padding:16px 12px;border-right:${i < reasons.length - 1 ? '1px solid #27272a' : 'none'};text-align:center;">
      <div data-feature-index="${i}" data-badge-index="${i}" data-icon-index="${i}" data-reason-index="${i}" data-point-index="${i}" data-item-index="${i}" data-index="${i}" data-field="icon" data-editable="icon" style="margin-bottom:10px;cursor:pointer;">
        ${resolveIconSvg(r.icon, accent, 24)}
      </div>
      <p style="margin:0 0 6px;font-size:13px;font-weight:800;color:#ffffff;letter-spacing:0.3px;">${r.title}</p>
      <p style="margin:0;font-size:11px;color:#a1a1aa;line-height:1.45;">${r.desc}</p>
    </td>`).join('')

  return `<!--[riazify:why_buy_from_us:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;background-color:#18181b;border:1px solid #27272a;border-radius:10px;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="padding:24px 20px;">
      <div style="border-bottom:1px solid #27272a;padding-bottom:12px;margin-bottom:18px;text-align:center;">
        <h3 style="margin:0 0 4px;font-size:17px;font-weight:900;color:#ffffff;text-transform:uppercase;letter-spacing:0.5px;">${title}</h3>
        <p style="margin:0;font-size:11px;color:#71717a;">Direct Factory Warehouse &bull; Same-Day Dispatch</p>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. TWO-COLUMN CHECKLIST (Clean 2×2 Structured Grid)
// ─────────────────────────────────────────────────────────────────────────────
function variantTwoColumnChecklist(p: any, id: string): string {
  const reasons = resolveReasons(p)
  const title = p.title ?? 'Why Shop With Us?'
  const titleColor = p.titleColor ?? '#1e1535'
  const descColor = p.descColor ?? '#475569'
  const accent = p.iconColor ?? '#16a34a'

  // Pair reasons into rows of 2
  const pairs: WhyBuyReason[][] = []
  for (let i = 0; i < reasons.length; i += 2) {
    pairs.push(reasons.slice(i, i + 2))
  }

  const rowHtml = pairs.map((pair, rowIdx) => `
    <tr>${pair.map((r, colIdx) => `
      <td width="50%" style="vertical-align:top;padding:8px 8px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1.5px solid #e2e8f0;border-radius:10px;border-collapse:collapse;">
          <tr>
            <td style="padding:16px 12px;text-align:center;vertical-align:top;">
              <!-- 1. Icon Container (Centered at the Top in the Middle) -->
              <div data-feature-index="${rowIdx * 2 + colIdx}" data-badge-index="${rowIdx * 2 + colIdx}" data-icon-index="${rowIdx * 2 + colIdx}" data-reason-index="${rowIdx * 2 + colIdx}" data-point-index="${rowIdx * 2 + colIdx}" data-item-index="${rowIdx * 2 + colIdx}" data-index="${rowIdx * 2 + colIdx}" data-field="icon" data-editable="icon" style="display:inline-block;width:38px;height:38px;line-height:38px;text-align:center;background-color:#f0fdf4;border-radius:8px;margin:0 auto 10px auto;cursor:pointer;">
                ${resolveIconSvg(r.icon, accent, 20)}
              </div>
              <!-- 2. Title Text (Centered directly below the icon) -->
              <p style="margin:0 0 4px;font-size:13px;font-weight:800;color:${titleColor};line-height:1.3;text-align:center;">
                ${r.title}
              </p>
              <!-- 3. Description Text (Centered below the title) -->
              <p style="margin:0;font-size:11px;color:${descColor};line-height:1.4;text-align:center;">
                ${r.desc}
              </p>
            </td>
          </tr>
        </table>
      </td>`).join('')}
    </tr>`).join('')

  return `<!--[riazify:why_buy_from_us:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;background-color:${p.bgColor ?? '#ffffff'};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}">
      <div style="text-align:center;margin-bottom:18px;">
        <h3 style="margin:0;font-size:18px;font-weight:800;color:${titleColor};">${title}</h3>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        ${rowHtml}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG THUMBNAILS (For Visual Editor Sidebar)
// ─────────────────────────────────────────────────────────────────────────────

export const WHY_BUY_FROM_US_THUMBNAILS: Record<string, string> = {
  'why-classic-centered': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="28" y1="8" x2="52" y2="8" stroke="#1e1535" stroke-width="2"/>
    <circle cx="16" cy="18" r="3" fill="#7530fb"/>
    <line x1="10" y1="26" x2="22" y2="26" stroke="#1e1535" stroke-width="1.5"/>
    <line x1="12" y1="31" x2="20" y2="31" stroke="#94a3b8" stroke-width="1"/>
    <circle cx="40" cy="18" r="3" fill="#7530fb"/>
    <line x1="34" y1="26" x2="46" y2="26" stroke="#1e1535" stroke-width="1.5"/>
    <line x1="36" y1="31" x2="44" y2="31" stroke="#94a3b8" stroke-width="1"/>
    <circle cx="64" cy="18" r="3" fill="#7530fb"/>
    <line x1="58" y1="26" x2="70" y2="26" stroke="#1e1535" stroke-width="1.5"/>
    <line x1="60" y1="31" x2="68" y2="31" stroke="#94a3b8" stroke-width="1"/>
  </svg>`,

  'why-boxed-cards-grid': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="5" y="10" width="21" height="28" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="29" y="10" width="22" height="28" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="54" y="10" width="21" height="28" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <circle cx="15.5" cy="18" r="3" fill="#7530fb"/>
    <circle cx="40" cy="18" r="3" fill="#7530fb"/>
    <circle cx="64.5" cy="18" r="3" fill="#7530fb"/>
  </svg>`,

  'why-horizontal-feature-rows': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="8" width="68" height="9" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <circle cx="11" cy="12.5" r="2" fill="#7530fb"/>
    <line x1="17" y1="12.5" x2="68" y2="12.5" stroke="#1e1535" stroke-width="1.2"/>
    <rect x="6" y="20" width="68" height="9" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <circle cx="11" cy="24.5" r="2" fill="#7530fb"/>
    <line x1="17" y1="24.5" x2="68" y2="24.5" stroke="#1e1535" stroke-width="1.2"/>
    <rect x="6" y="32" width="68" height="9" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <circle cx="11" cy="36.5" r="2" fill="#7530fb"/>
    <line x1="17" y1="36.5" x2="68" y2="36.5" stroke="#1e1535" stroke-width="1.2"/>
  </svg>`,

  'why-split-hero-pledge': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="4" y="6" width="26" height="36" rx="3" fill="#7530fb"/>
    <circle cx="17" cy="20" r="5" fill="#ffffff"/>
    <line x1="36" y1="12" x2="74" y2="12" stroke="#1e1535" stroke-width="1.5"/>
    <line x1="36" y1="16" x2="68" y2="16" stroke="#94a3b8" stroke-width="1"/>
    <line x1="36" y1="24" x2="74" y2="24" stroke="#1e1535" stroke-width="1.5"/>
    <line x1="36" y1="28" x2="68" y2="28" stroke="#94a3b8" stroke-width="1"/>
    <line x1="36" y1="36" x2="74" y2="36" stroke="#1e1535" stroke-width="1.5"/>
  </svg>`,

  'why-numbered-editorial-ledger': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="6" y1="10" x2="74" y2="10" stroke="#0f172a" stroke-width="1.5"/>
    <line x1="30" y1="16" x2="30" y2="40" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="54" y1="16" x2="54" y2="40" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="10" y1="18" x2="18" y2="18" stroke="#7530fb" stroke-width="2"/>
    <line x1="34" y1="18" x2="42" y2="18" stroke="#7530fb" stroke-width="2"/>
    <line x1="58" y1="18" x2="66" y2="18" stroke="#7530fb" stroke-width="2"/>
  </svg>`,

  'why-numbered-steps-timeline': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="16" y1="20" x2="64" y2="20" stroke="#bbf7d0" stroke-width="2"/>
    <circle cx="16" cy="20" r="4.5" fill="#16a34a"/>
    <circle cx="40" cy="20" r="4.5" fill="#16a34a"/>
    <circle cx="64" cy="20" r="4.5" fill="#16a34a"/>
    <line x1="11" y1="29" x2="21" y2="29" stroke="#1e1535" stroke-width="1.2"/>
    <line x1="35" y1="29" x2="45" y2="29" stroke="#1e1535" stroke-width="1.2"/>
    <line x1="59" y1="29" x2="69" y2="29" stroke="#1e1535" stroke-width="1.2"/>
  </svg>`,

  'why-compact-banner-strip': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#f8f7ff" stroke="#ede9fe" stroke-width="1"/>
    <circle cx="12" cy="24" r="3" fill="#7530fb"/>
    <line x1="17" y1="24" x2="26" y2="24" stroke="#1e1535" stroke-width="1.8"/>
    <line x1="30" y1="18" x2="30" y2="30" stroke="#cbd5e1" stroke-width="0.8"/>
    <circle cx="36" cy="24" r="3" fill="#7530fb"/>
    <line x1="41" y1="24" x2="50" y2="24" stroke="#1e1535" stroke-width="1.8"/>
    <line x1="54" y1="18" x2="54" y2="30" stroke="#cbd5e1" stroke-width="0.8"/>
    <circle cx="60" cy="24" r="3" fill="#7530fb"/>
    <line x1="65" y1="24" x2="74" y2="24" stroke="#1e1535" stroke-width="1.8"/>
  </svg>`,

  'why-official-guarantee-shield': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1.2"/>
    <circle cx="16" cy="22" r="5" fill="#ffffff" stroke="#16a34a" stroke-width="1"/>
    <circle cx="40" cy="22" r="5" fill="#ffffff" stroke="#16a34a" stroke-width="1"/>
    <circle cx="64" cy="22" r="5" fill="#ffffff" stroke="#16a34a" stroke-width="1"/>
  </svg>`,

  'why-dark-merchant-flagship': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#18181b"/>
    <circle cx="16" cy="20" r="3" fill="#b8fa33"/>
    <line x1="30" y1="14" x2="30" y2="34" stroke="#27272a" stroke-width="0.8"/>
    <circle cx="40" cy="20" r="3" fill="#b8fa33"/>
    <line x1="54" y1="14" x2="54" y2="34" stroke="#27272a" stroke-width="0.8"/>
    <circle cx="64" cy="20" r="3" fill="#b8fa33"/>
  </svg>`,

  'why-two-column-checklist': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="8" width="32" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="42" y="8" width="32" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="6" y="26" width="32" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="42" y="26" width="32" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
  </svg>`,
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT REGISTRY (10 STYLES)
// ─────────────────────────────────────────────────────────────────────────────

export const whyBuyFromUsVariants: BlockVariant[] = [
  {
    id: 'why-classic-centered',
    label: 'Classic Centered',
    description: 'Centered heading with 3 benefit columns (Current Style)',
    thumbnail: WHY_BUY_FROM_US_THUMBNAILS['why-classic-centered'],
    toHtml: variantClassicCentered,
  },
  {
    id: 'why-boxed-cards-grid',
    label: 'Boxed Retail Cards',
    description: '3 individual bordered cards with centered icon squircle',
    thumbnail: WHY_BUY_FROM_US_THUMBNAILS['why-boxed-cards-grid'],
    toHtml: variantBoxedCardsGrid,
  },
  {
    id: 'why-horizontal-feature-rows',
    label: 'Horizontal Rows',
    description: 'Stacked full-width rows with left icon squircle and detail',
    thumbnail: WHY_BUY_FROM_US_THUMBNAILS['why-horizontal-feature-rows'],
    toHtml: variantHorizontalFeatureRows,
  },
  {
    id: 'why-split-hero-pledge',
    label: 'Split Hero Pledge',
    description: '35/65 Split: Left branded pledge + Right stacked pillars',
    thumbnail: WHY_BUY_FROM_US_THUMBNAILS['why-split-hero-pledge'],
    toHtml: variantSplitHeroPledge,
  },
  {
    id: 'why-numbered-editorial-ledger',
    label: 'Editorial Ledger',
    description: 'Scandinavian minimalist layout with 01-03 numerals & dividers',
    thumbnail: WHY_BUY_FROM_US_THUMBNAILS['why-numbered-editorial-ledger'],
    toHtml: variantNumberedEditorialLedger,
  },
  {
    id: 'why-numbered-steps-timeline',
    label: 'Steps Timeline',
    description: 'Pick, pack, track & deliver reassurance timeline',
    thumbnail: WHY_BUY_FROM_US_THUMBNAILS['why-numbered-steps-timeline'],
    toHtml: variantNumberedStepsTimeline,
  },
  {
    id: 'why-compact-banner-strip',
    label: 'Compact Strip',
    description: 'Dense horizontal inline reassurance strip with dividers',
    thumbnail: WHY_BUY_FROM_US_THUMBNAILS['why-compact-banner-strip'],
    toHtml: variantCompactBannerStrip,
  },
  {
    id: 'why-official-guarantee-shield',
    label: 'Guarantee Shield',
    description: 'Official emerald buyer protection certificate card',
    thumbnail: WHY_BUY_FROM_US_THUMBNAILS['why-official-guarantee-shield'],
    toHtml: variantOfficialGuaranteeShield,
  },
  {
    id: 'why-dark-merchant-flagship',
    label: 'Dark Obsidian',
    description: 'Midnight high-contrast trust bar for motors & tech',
    thumbnail: WHY_BUY_FROM_US_THUMBNAILS['why-dark-merchant-flagship'],
    toHtml: variantDarkMerchantFlagship,
  },
  {
    id: 'why-two-column-checklist',
    label: '2×2 Checklist Grid',
    description: 'Dual-column structured grid with green check icons',
    thumbnail: WHY_BUY_FROM_US_THUMBNAILS['why-two-column-checklist'],
    toHtml: variantTwoColumnChecklist,
  },
]

export function getWhyBuyFromUsVariant(variantId: string): BlockVariant {
  return whyBuyFromUsVariants.find(v => v.id === variantId) ?? whyBuyFromUsVariants[0]
}
