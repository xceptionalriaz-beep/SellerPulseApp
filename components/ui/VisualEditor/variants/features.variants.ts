// components/ui/VisualEditor/variants/features.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Features / Value-Proposition Bar (10 Professional Layout Styles)
//
// Solves eBay Buyer Hesitation with Instant Micro-Assurances & Trust Triggers:
// • Full-size 100% responsive width across all eBay listing containers
// • High-definition crisp vector SVG icons (replacing inconsistent emojis)
// • Zero glassy AI-slop — grounded in proven, high-converting eCommerce typography
//
// 10 Distinct Layout Styles:
//   1.  simple-centered        (Current Baseline — 100% Identical Soft Centered)
//   2.  feat-divided-columns   (Editorial Divider Rail with Vertical Hairlines)
//   3.  feat-badge-cards       (Discrete Floating Cards with Soft Border)
//   4.  feat-horizontal-media  (Horizontal Icon + Stacked Title & Subtext Row)
//   5.  feat-circular-plinths  (Centered Circular 44px Icon Pod Medallions)
//   6.  feat-accent-top-bars   (Commercial Ledger with Top Accent Rule)
//   7.  feat-dark-executive    (Midnight Obsidian Contrast Bar with Neon/Gold Icons)
//   8.  feat-stitched-coupon   (Stitched Guarantee Deck with Stamped Edge)
//   9.  feat-minimal-hairline  (Minimalist Swiss Hairline with Flanking Rules)
//   10. feat-numbered-steps    (Ranked Pillar Badges with Numbered Index Chips)
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockVariant } from './section_label.variants'

// ── Shared Vector Icon Helper (Crisp SVG Icons, Zero Fuzzy Emojis) ───────────
function getFeatureSvg(icon: string, color: string, size = 24): string {
    if (typeof icon === 'string' && icon.trim().startsWith('<svg')) {
        return icon
    }
    const clean = (icon || '').toLowerCase().trim()

    // 1. Star / Quality / Premium
    if (clean.includes('star') || clean.includes('⭐') || clean.includes('quality') || clean.includes('top')) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
    }

    // 2. Truck / Shipping / Delivery / Express
    if (clean.includes('truck') || clean.includes('🚚') || clean.includes('ship') || clean.includes('delivery') || clean.includes('dispatch') || clean.includes('fast')) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`
    }

    // 3. Return / Rotate / Refund / 30-Day
    if (clean.includes('return') || clean.includes('↩') || clean.includes('rotate') || clean.includes('refund') || clean.includes('exchange')) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`
    }

    // 4. Shield / Security / Warranty / Protection
    if (clean.includes('shield') || clean.includes('🛡') || clean.includes('warranty') || clean.includes('protect') || clean.includes('guarantee')) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`
    }

    // 5. Clock / Time / Hours / 24h
    if (clean.includes('clock') || clean.includes('⏰') || clean.includes('time') || clean.includes('hour')) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
    }

    // 6. Check / Verified / Authentic / Genuine
    if (clean.includes('check') || clean.includes('✓') || clean.includes('✔') || clean.includes('authentic') || clean.includes('genuine')) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><polyline points="20 6 9 17 4 12"/></svg>`
    }

    // 7. Box / Package / Order
    if (clean.includes('box') || clean.includes('📦') || clean.includes('package')) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`
    }

    // 8. Thumbs Up / Customer Satisfaction
    if (clean.includes('thumb') || clean.includes('👍') || clean.includes('support') || clean.includes('help')) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>`
    }

    // Default fallback
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><polyline points="16 9 10 15 7 12"/></svg>`
}

function getFeaturesList(p: any): Array<{ icon: string; label: string; subText?: string }> {
    if (Array.isArray(p.features) && p.features.length > 0) {
        return p.features
    }
    return [
        { icon: 'star', label: 'Top Quality', subText: 'Premium Materials' },
        { icon: 'truck', label: 'Fast Shipping', subText: 'Tracked Delivery' },
        { icon: 'return', label: 'Easy Returns', subText: '30-Day Policy' },
    ]
}

function pad(p: any): string {
    const top = p.paddingTop ?? 16
    const bottom = p.paddingBottom ?? 16
    const left = p.paddingLeft ?? 24
    const right = p.paddingRight ?? 24
    return `padding:${top}px ${right}px ${bottom}px ${left}px;`
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SIMPLE CENTERED (CURRENT BASELINE — 100% IDENTICAL)
// ─────────────────────────────────────────────────────────────────────────────
function variantSimpleCentered(p: any, id: string): string {
    const items = getFeaturesList(p)
    const iconColor = p.iconColor || '#7530fb'
    const textColor = p.textColor || '#1e1535'
    const subColor = p.subTextColor || '#6b7280'
    const bgColor = p.bgColor || '#ffffff'
    const colWidth = Math.floor(100 / Math.max(items.length, 1))

    const cells = items.map((f: any) => {
        const sub = f.subText ? `<div style="font-family:Arial,sans-serif;font-size:12px;color:${subColor};margin-top:3px;">${f.subText}</div>` : ''
        const iconHtml = getFeatureSvg(f.icon, iconColor, 26)
        return `
      <td width="${colWidth}%" align="center" style="text-align:center;padding:8px 12px;vertical-align:top;">
        <div style="margin-bottom:8px;line-height:1;">${iconHtml}</div>
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${textColor};line-height:1.3;">${f.label}</div>
        ${sub}
      </td>`
    }).join('')

    return `<!--[riazify:features:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${bgColor};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DIVIDED COLUMNS (Editorial Divider Rail with Vertical Hairlines)
// ─────────────────────────────────────────────────────────────────────────────
function variantDividedColumns(p: any, id: string): string {
    const items = getFeaturesList(p)
    const iconColor = p.iconColor || '#7530fb'
    const textColor = p.textColor || '#0f172a'
    const subColor = p.subTextColor || '#64748b'
    const bgColor = p.bgColor || '#ffffff'
    const borderColor = p.borderColor || '#e2e8f0'
    const colWidth = Math.floor(100 / Math.max(items.length, 1))

    const cells = items.map((f: any, idx: number) => {
        const divider = idx > 0 ? `border-left:1px solid ${borderColor};` : ''
        const sub = f.subText ? `<div style="font-family:Arial,sans-serif;font-size:11px;font-weight:500;color:${subColor};margin-top:3px;letter-spacing:0.2px;">${f.subText}</div>` : ''
        const iconHtml = getFeatureSvg(f.icon, iconColor, 22)
        return `
      <td width="${colWidth}%" align="center" style="text-align:center;padding:12px 14px;vertical-align:middle;${divider}">
        <div style="margin-bottom:6px;line-height:1;">${iconHtml}</div>
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:800;color:${textColor};letter-spacing:0.3px;text-transform:uppercase;">${f.label}</div>
        ${sub}
      </td>`
    }).join('')

    return `<!--[riazify:features:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${bgColor};border:1px solid ${borderColor};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="padding:4px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. BADGE CARDS (Discrete Floating Cards with Soft Border)
// ─────────────────────────────────────────────────────────────────────────────
function variantBadgeCards(p: any, id: string): string {
    const items = getFeaturesList(p)
    const iconColor = p.iconColor || '#7530fb'
    const textColor = p.textColor || '#1e1535'
    const subColor = p.subTextColor || '#64748b'
    const bgColor = p.bgColor || '#ffffff'
    const cardBg = p.cardBg || '#f8fafc'
    const cardBorder = p.borderColor || '#e2e8f0'
    const colWidth = Math.floor(100 / Math.max(items.length, 1))

    const cells = items.map((f: any) => {
        const sub = f.subText ? `<div style="font-family:Arial,sans-serif;font-size:11px;color:${subColor};margin-top:4px;">${f.subText}</div>` : ''
        const iconHtml = getFeatureSvg(f.icon, iconColor, 24)
        return `
      <td width="${colWidth}%" valign="top" style="padding:6px 8px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${cardBg};border:1px solid ${cardBorder};border-radius:8px;">
          <tr>
            <td align="center" style="padding:16px 12px;text-align:center;">
              <div style="margin-bottom:8px;line-height:1;">${iconHtml}</div>
              <div style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${textColor};line-height:1.3;">${f.label}</div>
              ${sub}
            </td>
          </tr>
        </table>
      </td>`
    }).join('')

    return `<!--[riazify:features:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${bgColor};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. HORIZONTAL MEDIA (Horizontal Icon + Stacked Title & Subtext Row)
// ─────────────────────────────────────────────────────────────────────────────
function variantHorizontalMedia(p: any, id: string): string {
    const items = getFeaturesList(p)
    const iconColor = p.iconColor || '#7530fb'
    const textColor = p.textColor || '#0f172a'
    const subColor = p.subTextColor || '#64748b'
    const bgColor = p.bgColor || '#ffffff'
    const colWidth = Math.floor(100 / Math.max(items.length, 1))

    const cells = items.map((f: any) => {
        const sub = f.subText ? `<div style="font-family:Arial,sans-serif;font-size:11px;color:${subColor};margin-top:2px;line-height:1.3;">${f.subText}</div>` : ''
        const iconHtml = getFeatureSvg(f.icon, iconColor, 22)
        return `
      <td width="${colWidth}%" valign="middle" style="padding:10px 14px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="32" valign="middle" style="width:32px;text-align:left;line-height:1;padding-right:10px;">
              ${iconHtml}
            </td>
            <td valign="middle" align="left" style="text-align:left;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:800;color:${textColor};line-height:1.2;">${f.label}</div>
              ${sub}
            </td>
          </tr>
        </table>
      </td>`
    }).join('')

    return `<!--[riazify:features:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${bgColor};border-top:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. CIRCULAR PLINTHS (Centered Circular 44px Icon Pod Medallions)
// ─────────────────────────────────────────────────────────────────────────────
function variantCircularPlinths(p: any, id: string): string {
    const items = getFeaturesList(p)
    const iconColor = p.iconColor || '#7530fb'
    const textColor = p.textColor || '#1e1535'
    const subColor = p.subTextColor || '#64748b'
    const bgColor = p.bgColor || '#ffffff'
    const iconBg = p.iconBg || '#f3eeff'
    const colWidth = Math.floor(100 / Math.max(items.length, 1))

    const cells = items.map((f: any) => {
        const sub = f.subText ? `<div style="font-family:Arial,sans-serif;font-size:11px;color:${subColor};margin-top:3px;">${f.subText}</div>` : ''
        const iconHtml = getFeatureSvg(f.icon, iconColor, 20)
        return `
      <td width="${colWidth}%" align="center" style="text-align:center;padding:8px 10px;vertical-align:top;">
        <div style="width:44px;height:44px;background-color:${iconBg};border-radius:50%;line-height:44px;text-align:center;margin:0 auto 10px;border:1px solid #ede9fe;">
          <table width="44" height="44" cellpadding="0" cellspacing="0" border="0" align="center">
            <tr><td align="center" valign="middle" style="text-align:center;vertical-align:middle;line-height:1;">${iconHtml}</td></tr>
          </table>
        </div>
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${textColor};line-height:1.3;">${f.label}</div>
        ${sub}
      </td>`
    }).join('')

    return `<!--[riazify:features:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${bgColor};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. ACCENT TOP BARS (Commercial Ledger with Top Accent Rule)
// ─────────────────────────────────────────────────────────────────────────────
function variantAccentTopBars(p: any, id: string): string {
    const items = getFeaturesList(p)
    const iconColor = p.iconColor || '#7530fb'
    const textColor = p.textColor || '#0f172a'
    const subColor = p.subTextColor || '#64748b'
    const bgColor = p.bgColor || '#ffffff'
    const accentColor = p.accentColor || iconColor
    const colWidth = Math.floor(100 / Math.max(items.length, 1))

    const cells = items.map((f: any) => {
        const sub = f.subText ? `<div style="font-family:Arial,sans-serif;font-size:11px;color:${subColor};margin-top:3px;">${f.subText}</div>` : ''
        const iconHtml = getFeatureSvg(f.icon, iconColor, 22)
        return `
      <td width="${colWidth}%" valign="top" style="padding:4px 6px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1px solid #e2e8f0;border-top:3px solid ${accentColor};">
          <tr>
            <td align="center" style="padding:14px 10px;text-align:center;">
              <div style="margin-bottom:6px;line-height:1;">${iconHtml}</div>
              <div style="font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:${textColor};text-transform:uppercase;letter-spacing:0.5px;">${f.label}</div>
              ${sub}
            </td>
          </tr>
        </table>
      </td>`
    }).join('')

    return `<!--[riazify:features:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${bgColor};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. DARK EXECUTIVE (Midnight Obsidian Contrast Bar with Neon/Gold Icons)
// ─────────────────────────────────────────────────────────────────────────────
function variantDarkExecutive(p: any, id: string): string {
    const items = getFeaturesList(p)
    const iconColor = p.iconColor || '#b8fa33'
    const textColor = '#ffffff'
    const subColor = '#94a3b8'
    const darkBg = '#0f172a'
    const colWidth = Math.floor(100 / Math.max(items.length, 1))

    const cells = items.map((f: any, idx: number) => {
        const divider = idx > 0 ? 'border-left:1px solid #1e293b;' : ''
        const sub = f.subText ? `<div style="font-family:Arial,sans-serif;font-size:11px;color:${subColor};margin-top:3px;">${f.subText}</div>` : ''
        const iconHtml = getFeatureSvg(f.icon, iconColor, 22)
        return `
      <td width="${colWidth}%" align="center" style="text-align:center;padding:14px 12px;vertical-align:middle;${divider}">
        <div style="margin-bottom:6px;line-height:1;">${iconHtml}</div>
        <div style="font-family:Arial,sans-serif;font-size:13px;font-weight:800;color:${textColor};letter-spacing:0.5px;">${f.label}</div>
        ${sub}
      </td>`
    }).join('')

    return `<!--[riazify:features:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${darkBg};border:1px solid #1e293b;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="padding:6px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. STITCHED COUPON (Stitched Guarantee Deck with Stamped Edge)
// ─────────────────────────────────────────────────────────────────────────────
function variantStitchedCoupon(p: any, id: string): string {
    const items = getFeaturesList(p)
    const iconColor = p.iconColor || '#7530fb'
    const textColor = p.textColor || '#1e1535'
    const subColor = p.subTextColor || '#64748b'
    const bgColor = p.bgColor || '#ffffff'
    const colWidth = Math.floor(100 / Math.max(items.length, 1))

    const cells = items.map((f: any) => {
        const sub = f.subText ? `<div style="font-family:Arial,sans-serif;font-size:11px;color:${subColor};margin-top:3px;">${f.subText}</div>` : ''
        const iconHtml = getFeatureSvg(f.icon, iconColor, 24)
        return `
      <td width="${colWidth}%" valign="top" style="padding:6px 8px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fffdfa;border:1.5px dashed #cbd5e1;border-radius:6px;">
          <tr>
            <td align="center" style="padding:14px 10px;text-align:center;">
              <div style="margin-bottom:6px;line-height:1;">${iconHtml}</div>
              <div style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${textColor};line-height:1.3;">${f.label}</div>
              ${sub}
            </td>
          </tr>
        </table>
      </td>`
    }).join('')

    return `<!--[riazify:features:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${bgColor};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. MINIMAL HAIRLINE (Minimalist Swiss Hairline with Flanking Rules)
// ─────────────────────────────────────────────────────────────────────────────
function variantMinimalHairline(p: any, id: string): string {
    const items = getFeaturesList(p)
    const iconColor = p.iconColor || '#0f172a'
    const textColor = p.textColor || '#0f172a'
    const subColor = p.subTextColor || '#64748b'
    const bgColor = p.bgColor || '#ffffff'
    const colWidth = Math.floor(100 / Math.max(items.length, 1))

    const cells = items.map((f: any) => {
        const sub = f.subText ? `<div style="font-family:Arial,sans-serif;font-size:11px;color:${subColor};margin-top:2px;">${f.subText}</div>` : ''
        const iconHtml = getFeatureSvg(f.icon, iconColor, 18)
        return `
      <td width="${colWidth}%" align="center" style="text-align:center;padding:12px 10px;vertical-align:middle;">
        <div style="margin-bottom:4px;line-height:1;">${iconHtml}</div>
        <div style="font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:${textColor};letter-spacing:0.5px;text-transform:uppercase;">${f.label}</div>
        ${sub}
      </td>`
    }).join('')

    return `<!--[riazify:features:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${bgColor};border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="padding:4px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. NUMBERED STEPS (Ranked Pillar Badges with Numbered Index Chips)
// ─────────────────────────────────────────────────────────────────────────────
function variantNumberedSteps(p: any, id: string): string {
    const items = getFeaturesList(p)
    const iconColor = p.iconColor || '#7530fb'
    const textColor = p.textColor || '#0f172a'
    const subColor = p.subTextColor || '#64748b'
    const bgColor = p.bgColor || '#ffffff'
    const colWidth = Math.floor(100 / Math.max(items.length, 1))

    const cells = items.map((f: any, idx: number) => {
        const num = String(idx + 1).padStart(2, '0')
        const sub = f.subText ? `<div style="font-family:Arial,sans-serif;font-size:11px;color:${subColor};margin-top:3px;line-height:1.3;">${f.subText}</div>` : ''
        const iconHtml = getFeatureSvg(f.icon, iconColor, 18)
        return `
      <td width="${colWidth}%" valign="top" style="padding:6px 8px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:6px;">
          <tr>
            <td style="padding:12px 14px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" valign="middle" style="text-align:left;">
                    <span style="display:inline-block;padding:2px 6px;background-color:#f1f5f9;border-radius:4px;font-family:monospace;font-size:10px;font-weight:800;color:#64748b;">${num}</span>
                  </td>
                  <td align="right" valign="middle" style="text-align:right;line-height:1;">
                    ${iconHtml}
                  </td>
                </tr>
              </table>
              <div style="font-family:Arial,sans-serif;font-size:13px;font-weight:800;color:${textColor};margin-top:8px;line-height:1.2;">${f.label}</div>
              ${sub}
            </td>
          </tr>
        </table>
      </td>`
    }).join('')

    return `<!--[riazify:features:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:${bgColor};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT REGISTRY (10 Layout Styles)
// ─────────────────────────────────────────────────────────────────────────────
export const featureVariants: BlockVariant[] = [
    {
        id: 'feat-simple-centered',
        label: 'Simple Centered',
        description: 'Current baseline clean vertical stack with centered icons & bold labels',
        toHtml: variantSimpleCentered,
    },
    {
        id: 'feat-divided-columns',
        label: 'Divided Columns',
        description: 'Editorial retail rail with crisp vertical hairline separation rules',
        toHtml: variantDividedColumns,
    },
    {
        id: 'feat-badge-cards',
        label: 'Badge Cards',
        description: 'Discrete floating full-size cards with rounded corners & subtle borders',
        toHtml: variantBadgeCards,
    },
    {
        id: 'feat-horizontal-media',
        label: 'Horizontal Row',
        description: 'Inline media layout with icon on left and stacked label & subtext on right',
        toHtml: variantHorizontalMedia,
    },
    {
        id: 'feat-circular-plinths',
        label: 'Circular Pods',
        description: 'Circular 44px medallion plinths with soft tint framing each feature',
        toHtml: variantCircularPlinths,
    },
    {
        id: 'feat-accent-top-bars',
        label: 'Top Accent',
        description: 'Commercial specification cards with colored 3px solid top accent rules',
        toHtml: variantAccentTopBars,
    },
    {
        id: 'feat-dark-executive',
        label: 'Dark Executive',
        description: 'High-contrast midnight obsidian bar with electric/gold vector icons',
        toHtml: variantDarkExecutive,
    },
    {
        id: 'feat-stitched-coupon',
        label: 'Stitched Deck',
        description: 'Dashed stitched voucher deck conveying official warranty & customer pledges',
        toHtml: variantStitchedCoupon,
    },
    {
        id: 'feat-minimal-hairline',
        label: 'Minimal Hairline',
        description: 'Minimalist Swiss typography with clean top & bottom hairline borders',
        toHtml: variantMinimalHairline,
    },
    {
        id: 'feat-numbered-steps',
        label: 'Numbered Pillars',
        description: 'Service pillar cards with numbered index badges (01, 02, 03) and vector icons',
        toHtml: variantNumberedSteps,
    },
]

export const featuresVariants = featureVariants

export function getFeatureVariant(variantId: string): BlockVariant {
    const found = featureVariants.find(v => v.id === variantId || (variantId === 'simple-centered' && v.id === 'feat-simple-centered'))
    return found ?? featureVariants[0]
}

export function getFeaturesVariant(variantId: string): BlockVariant {
    return getFeatureVariant(variantId)
}
