// components/ui/VisualEditor/variants/trust_badges.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Trust Badges — 10 High-Converting, Professional eBay Retail Variants
// Engineered for eBay listing templates to eliminate buyer hesitation,
// provide instant reassurance (authenticity, dispatch, returns, seller rank),
// and guarantee 100% compliant, JS-free table rendering across all devices.
//
// Key Feature: Replaces platform-dependent system emojis (✅, 🚚, ↩️, ⭐)
// with razor-sharp, inline vector SVG icons that dynamically inherit the seller's
// brand colors (iconColor, accentColor).
//
// 1.  row          — Row of 4 cards (CURRENT STYLE — KEPT SAME STRUCTURE, SVG ICONS)
// 2.  grid         — 2×2 Grid of horizontal cards with icon squircle
// 3.  strip        — Slim inline horizontal strip with vertical separators
// 4.  icon-only    — Circular icon badges with minimalist uppercase captions
// 5.  text-only    — Clean rounded text pill badges
// 6.  credibility  — Top Rated Seller credibility bar with stars & feedback
// 7.  accent-ribbon— Continuous trust ribbon with high-contrast accent pillars
// 8.  shield-crest — Official warranty & buyer protection crest card
// 9.  hairline-card— Scandinavian minimalist hairline cards with subtle micro-borders
// 10. dark-obsidian— Midnight obsidian high-contrast trust bar for tech & automotive
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
  id: string
  label: string
  description: string
  thumbnail?: string
  toHtml: (props: any, id: string) => string
}

export interface TrustBadgeItem {
  icon: string
  text: string
  subText?: string
}

// ── Smart Vector SVG Icon Renderer (No Emojis, No External Images) ───────────

function getVectorIconSvg(icon: string, color = '#7530fb', size = 18): string {
  const norm = (icon || '').toLowerCase().trim()

  // 1. Authentic / Shield Check / Genuine
  if (norm.includes('shield') || norm.includes('auth') || norm.includes('✅') || norm.includes('check') || norm.includes('genuine')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="m9 12 2 2 4-4" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  }

  // 2. Fast Shipping / Truck / Dispatch
  if (norm.includes('truck') || norm.includes('ship') || norm.includes('🚚') || norm.includes('dispatch') || norm.includes('delivery')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15 18H9" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19 18h2a1 1 0 0 0 1-1v-5l-3-4h-5v10" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="7" cy="18" r="2" stroke="${color}" stroke-width="2"/>
      <circle cx="17" cy="18" r="2" stroke="${color}" stroke-width="2"/>
    </svg>`
  }

  // 3. Returns / Rotate-CCW / 30-Day
  if (norm.includes('rotate') || norm.includes('return') || norm.includes('↩') || norm.includes('refund') || norm.includes('30')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M3 3v5h5" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  }

  // 4. Top Rated Seller / Star / Award
  if (norm.includes('star') || norm.includes('⭐') || norm.includes('rated') || norm.includes('award') || norm.includes('top')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="${color}" fill-opacity="0.15"/>
    </svg>`
  }

  // 5. Clock / Fast
  if (norm.includes('clock') || norm.includes('time') || norm.includes('hour') || norm.includes('timer')) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">
      <circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="2"/>
      <polyline points="12 6 12 12 16 14" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  }

  // Fallback Clean Checkmark
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">
    <polyline points="20 6 9 17 4 12" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
}

function pad(p: any): string {
  return `padding:${p.paddingTop ?? 16}px ${p.paddingRight ?? 20}px ${p.paddingBottom ?? 16}px ${p.paddingLeft ?? 20}px;`
}

const FALLBACK_BADGES: TrustBadgeItem[] = [
  { icon: 'shield-check', text: 'Authentic Product', subText: '100% Genuine Verified' },
  { icon: 'truck', text: 'Fast Dispatch', subText: 'Orders Ship Within 24h' },
  { icon: 'rotate-ccw', text: '30-Day Returns', subText: 'Money Back Guarantee' },
  { icon: 'star', text: 'Top Rated Seller', subText: '5-Star Customer Rating' },
]

function resolveBadges(p: any): TrustBadgeItem[] {
  if (Array.isArray(p.badges) && p.badges.length > 0) {
    return p.badges
  }
  return FALLBACK_BADGES
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ROW OF 4 (CURRENT STYLE — SAME STRUCTURE, PROFESSIONAL VECTOR ICONS)
// ─────────────────────────────────────────────────────────────────────────────
function variantRowOf4(p: any, id: string): string {
  const badges = resolveBadges(p).slice(0, 4)
  const iconColor = p.iconColor ?? '#7530fb'
  const iconBg = p.iconBg ?? '#f5f3ff'
  const textColor = p.textColor ?? '#1e1535'
  const subTextColor = p.subTextColor ?? '#6b7280'

  const cols = badges.map((b: any, i: number) => `
    <td width="${Math.floor(100 / badges.length)}%" style="text-align:center;vertical-align:top;padding:0 4px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:12px;border-collapse:collapse;">
        <tr>
          <td style="padding:14px 8px;text-align:center;">
            <div data-feature-index="${i}" style="display:inline-block;width:38px;height:38px;line-height:38px;text-align:center;background-color:${iconBg};border-radius:10px;cursor:pointer;">
              ${getVectorIconSvg(b.icon, iconColor, 20)}
            </div>
            <p style="margin:8px 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:${textColor};line-height:1.3;">
              ${b.text}
            </p>
            ${b.subText ? `<p style="margin:0;font-family:Arial,sans-serif;font-size:10px;color:${subTextColor};line-height:1.3;">${b.subText}</p>` : ''}
          </td>
        </tr>
      </table>
    </td>`).join('')

  return `<!--[riazify:trust_badges:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;background-color:${p.bgColor ?? '#ffffff'};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>${cols}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. 2×2 GRID (2 Column Responsive Cards)
// ─────────────────────────────────────────────────────────────────────────────
function variantGrid2x2(p: any, id: string): string {
  const badges = resolveBadges(p).slice(0, 4)
  const iconColor = p.iconColor ?? '#7530fb'
  const iconBg = p.iconBg ?? '#f5f3ff'
  const textColor = p.textColor ?? '#1e1535'
  const subTextColor = p.subTextColor ?? '#6b7280'
  const rows = [badges.slice(0, 2), badges.slice(2, 4)]

  const rowHtml = rows.map((row: any[], rowIdx: number) => `
    <tr>${row.map((b: any, colIdx: number) => `
      <td width="50%" style="vertical-align:top;padding:5px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:10px;border:1px solid #e5e7eb;border-collapse:collapse;">
          <tr>
            <td style="padding:12px 14px;vertical-align:middle;">
              <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td width="38" style="width:38px;padding-right:12px;vertical-align:middle;">
                    <div data-feature-index="${rowIdx * 2 + colIdx}" style="width:38px;height:38px;line-height:38px;text-align:center;background-color:${iconBg};border-radius:8px;cursor:pointer;">
                      ${getVectorIconSvg(b.icon, iconColor, 19)}
                    </div>
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${textColor};">
                      ${b.text}
                    </p>
                    ${b.subText ? `<p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:${subTextColor};">${b.subText}</p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>`).join('')}
    </tr>`).join('')

  return `<!--[riazify:trust_badges:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;background-color:${p.bgColor ?? '#ffffff'};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        ${rowHtml}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. HORIZONTAL STRIP (Slim Inline Row with Dividers)
// ─────────────────────────────────────────────────────────────────────────────
function variantHorizontalStrip(p: any, id: string): string {
  const badges = resolveBadges(p).slice(0, 4)
  const iconColor = p.iconColor ?? '#7530fb'
  const textColor = p.textColor ?? '#1e1535'
  const borderColor = p.borderColor ?? '#ede9fe'

  const items = badges.map((b: any, i: number) => `
    ${i > 0 ? `<td style="padding:0 10px;color:${borderColor};font-size:16px;">|</td>` : ''}
    <td style="white-space:nowrap;vertical-align:middle;padding:0 4px;">
      <span data-feature-index="${i}" style="vertical-align:middle;margin-right:6px;display:inline-block;cursor:pointer;">
        ${getVectorIconSvg(b.icon, iconColor, 16)}
      </span>
      <span style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:${textColor};vertical-align:middle;">
        ${b.text}
      </span>
    </td>`).join('')

  return `<!--[riazify:trust_badges:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;background-color:${p.bgColor ?? '#f8f7ff'};border-top:1px solid ${borderColor};border-bottom:1px solid ${borderColor};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <table cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin:0 auto;">
        <tr>${items}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ICON ONLY (Circular Floating Badges with Uppercase Subtext)
// ─────────────────────────────────────────────────────────────────────────────
function variantIconOnly(p: any, id: string): string {
  const badges = resolveBadges(p).slice(0, 4)
  const iconColor = p.iconColor ?? '#7530fb'
  const badgeBg = p.badgeBg ?? '#f0f7ff'
  const borderColor = p.borderColor ?? '#ede9fe'
  const subTextColor = p.subTextColor ?? '#64748b'

  const cols = badges.map((b: any, i: number) => `
    <td width="${Math.floor(100 / badges.length)}%" style="text-align:center;padding:0 6px;">
      <div data-feature-index="${i}" style="display:inline-block;width:44px;height:44px;border-radius:50%;background-color:${badgeBg};border:1px solid ${borderColor};text-align:center;line-height:44px;cursor:pointer;">
        ${getVectorIconSvg(b.icon, iconColor, 20)}
      </div>
      <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:${subTextColor};text-transform:uppercase;letter-spacing:0.04em;">
        ${b.text}
      </p>
    </td>`).join('')

  return `<!--[riazify:trust_badges:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;background-color:${p.bgColor ?? '#ffffff'};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>${cols}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. TEXT ONLY (Clean Rounded Pill Badges)
// ─────────────────────────────────────────────────────────────────────────────
function variantTextOnly(p: any, id: string): string {
  const badges = resolveBadges(p)
  const badgeBg = p.badgeBg ?? '#f8fafc'
  const borderColor = p.borderColor ?? '#e2e8f0'
  const textColor = p.textColor ?? '#0f172a'

  const pills = badges.map((b: any) => `
    <td style="padding:0 4px;">
      <span style="display:inline-block;background-color:${badgeBg};border:1px solid ${borderColor};border-radius:20px;padding:6px 14px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:${textColor};white-space:nowrap;">
        &bull; ${b.text}
      </span>
    </td>`).join('')

  return `<!--[riazify:trust_badges:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;background-color:${p.bgColor ?? '#ffffff'};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <table cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin:0 auto;">
        <tr>${pills}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. CREDIBILITY ROW (Top Rated Seller & Feedback Stats)
// ─────────────────────────────────────────────────────────────────────────────
function variantCredibility(p: any, id: string): string {
  const accentColor = p.iconColor ?? '#f59e0b'
  const textColor = p.textColor ?? '#1e1535'

  return `<!--[riazify:trust_badges:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;background-color:${p.bgColor ?? '#fffdf5'};border-top:2px solid ${accentColor};border-bottom:2px solid ${accentColor};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="vertical-align:middle;text-align:center;padding-right:12px;border-right:1px solid #fde68a;">
            <p style="margin:0;font-size:16px;letter-spacing:2px;color:${accentColor};">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
            <p style="margin:3px 0 0;font-family:Arial,sans-serif;font-size:10px;color:#92400e;font-weight:700;text-transform:uppercase;">5-Star Rated</p>
          </td>
          <td style="vertical-align:middle;text-align:center;padding:0 12px;border-right:1px solid #fde68a;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:900;color:${textColor};">{{FEEDBACK_SCORE}}</p>
            <p style="margin:3px 0 0;font-family:Arial,sans-serif;font-size:10px;color:#6b7280;">Positive Reviews</p>
          </td>
          <td style="vertical-align:middle;text-align:center;padding:0 12px;border-right:1px solid #fde68a;">
            <table cellpadding="0" cellspacing="0" border="0" align="center">
              <tr>
                <td style="background-color:${accentColor};border-radius:4px;padding:4px 10px;">
                  <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:#1e1535;">&#9733; Top Rated Seller</p>
                </td>
              </tr>
            </table>
          </td>
          <td style="vertical-align:middle;text-align:center;padding-left:12px;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:16px;font-weight:800;color:${textColor};">{{FEEDBACK_PERCENT}}%</p>
            <p style="margin:3px 0 0;font-family:Arial,sans-serif;font-size:10px;color:#6b7280;">Positive Feedback</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. ACCENT RIBBON (Continuous Full-Width Reassurance Bar)
// ─────────────────────────────────────────────────────────────────────────────
function variantAccentRibbon(p: any, id: string): string {
  const badges = resolveBadges(p).slice(0, 4)
  const accent = p.accentColor ?? '#7530fb'

  const cells = badges.map(b => `
    <td style="padding:10px 12px;text-align:center;border-right:1px solid rgba(255,255,255,0.15);">
      <span style="display:inline-block;vertical-align:middle;margin-right:6px;">
        ${getVectorIconSvg(b.icon, '#ffffff', 16)}
      </span>
      <span style="font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:#ffffff;letter-spacing:0.5px;text-transform:uppercase;vertical-align:middle;">
        ${b.text}
      </span>
    </td>`).join('')

  return `<!--[riazify:trust_badges:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;background-color:${accent};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. SHIELD CREST (Official Buyer Guarantee Header)
// ─────────────────────────────────────────────────────────────────────────────
function variantShieldCrest(p: any, id: string): string {
  const badges = resolveBadges(p).slice(0, 4)
  const iconColor = p.iconColor ?? '#16a34a'

  const items = badges.map(b => `
    <td width="25%" style="padding:8px;vertical-align:top;text-align:center;">
      <div style="margin-bottom:6px;">
        ${getVectorIconSvg(b.icon, iconColor, 22)}
      </div>
      <p style="margin:0 0 2px;font-size:11px;font-weight:800;color:#14532d;text-transform:uppercase;">
        ${b.text}
      </p>
      ${b.subText ? `<p style="margin:0;font-size:10px;color:#15803d;">${b.subText}</p>` : ''}
    </td>`).join('')

  return `<!--[riazify:trust_badges:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;background-color:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:8px;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>${items}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. HAIRLINE CARDS (Minimalist Scandinavian Clean Cards)
// ─────────────────────────────────────────────────────────────────────────────
function variantHairlineCards(p: any, id: string): string {
  const badges = resolveBadges(p).slice(0, 4)
  const iconColor = p.iconColor ?? '#0f172a'

  const cards = badges.map(b => `
    <td width="25%" style="padding:0 4px;vertical-align:top;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1.5px solid #e2e8f0;border-radius:6px;background-color:#ffffff;border-collapse:collapse;">
        <tr>
          <td style="padding:12px 6px;text-align:center;">
            <div style="margin-bottom:6px;">
              ${getVectorIconSvg(b.icon, iconColor, 18)}
            </div>
            <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:#0f172a;line-height:1.3;">
              ${b.text}
            </p>
            ${b.subText ? `<p style="margin:0;font-size:9px;color:#64748b;">${b.subText}</p>` : ''}
          </td>
        </tr>
      </table>
    </td>`).join('')

  return `<!--[riazify:trust_badges:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;background-color:${p.bgColor ?? '#ffffff'};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>${cards}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. DARK OBSIDIAN (Midnight High-Contrast Trust Bar)
// ─────────────────────────────────────────────────────────────────────────────
function variantDarkObsidian(p: any, id: string): string {
  const badges = resolveBadges(p).slice(0, 4)
  const accent = p.accentColor ?? '#b8fa33'

  const cells = badges.map(b => `
    <td width="25%" style="padding:12px 6px;text-align:center;border-right:1px solid #27272a;">
      <div style="margin-bottom:6px;">
        ${getVectorIconSvg(b.icon, accent, 20)}
      </div>
      <p style="margin:0 0 2px;font-size:11px;font-weight:800;color:#ffffff;letter-spacing:0.4px;text-transform:uppercase;">
        ${b.text}
      </p>
      ${b.subText ? `<p style="margin:0;font-size:9px;color:#a1a1aa;">${b.subText}</p>` : ''}
    </td>`).join('')

  return `<!--[riazify:trust_badges:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;background-color:#18181b;border:1px solid #27272a;border-radius:8px;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG THUMBNAIL PREVIEWS (For Visual Editor Sidebar)
// ─────────────────────────────────────────────────────────────────────────────

export const TRUST_BADGES_THUMBNAILS: Record<string, string> = {
  'row': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="5" y="10" width="15" height="28" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="23" y="10" width="15" height="28" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="41" y="10" width="15" height="28" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="59" y="10" width="15" height="28" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <circle cx="12.5" cy="18" r="3" fill="#7530fb"/>
    <circle cx="30.5" cy="18" r="3" fill="#7530fb"/>
    <circle cx="48.5" cy="18" r="3" fill="#7530fb"/>
    <circle cx="66.5" cy="18" r="3" fill="#7530fb"/>
  </svg>`,

  'grid': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="8" width="32" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="42" y="8" width="32" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="6" y="26" width="32" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="42" y="26" width="32" height="14" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="9" y="11" width="6" height="8" rx="1" fill="#7530fb"/>
    <rect x="45" y="11" width="6" height="8" rx="1" fill="#7530fb"/>
    <rect x="9" y="29" width="6" height="8" rx="1" fill="#7530fb"/>
    <rect x="45" y="29" width="6" height="8" rx="1" fill="#7530fb"/>
  </svg>`,

  'strip': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#f8f7ff" stroke="#ede9fe" stroke-width="1"/>
    <circle cx="12" cy="24" r="3" fill="#7530fb"/>
    <line x1="17" y1="24" x2="26" y2="24" stroke="#1e1535" stroke-width="1.8"/>
    <line x1="29" y1="18" x2="29" y2="30" stroke="#cbd5e1" stroke-width="0.8"/>
    <circle cx="35" cy="24" r="3" fill="#7530fb"/>
    <line x1="40" y1="24" x2="49" y2="24" stroke="#1e1535" stroke-width="1.8"/>
    <line x1="52" y1="18" x2="52" y2="30" stroke="#cbd5e1" stroke-width="0.8"/>
    <circle cx="58" cy="24" r="3" fill="#7530fb"/>
    <line x1="63" y1="24" x2="72" y2="24" stroke="#1e1535" stroke-width="1.8"/>
  </svg>`,

  'icon-only': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <circle cx="14" cy="22" r="7" fill="#f0f7ff" stroke="#ede9fe" stroke-width="0.8"/>
    <circle cx="31" cy="22" r="7" fill="#f0f7ff" stroke="#ede9fe" stroke-width="0.8"/>
    <circle cx="48" cy="22" r="7" fill="#f0f7ff" stroke="#ede9fe" stroke-width="0.8"/>
    <circle cx="65" cy="22" r="7" fill="#f0f7ff" stroke="#ede9fe" stroke-width="0.8"/>
    <circle cx="14" cy="22" r="3" fill="#7530fb"/>
    <circle cx="31" cy="22" r="3" fill="#7530fb"/>
    <circle cx="48" cy="22" r="3" fill="#7530fb"/>
    <circle cx="65" cy="22" r="3" fill="#7530fb"/>
  </svg>`,

  'text-only': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="19" width="19" height="10" rx="5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="28" y="19" width="22" height="10" rx="5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="53" y="19" width="20" height="10" rx="5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
  </svg>`,

  'credibility': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#fffdf5" stroke="#fde68a" stroke-width="1"/>
    <line x1="6" y1="12" x2="74" y2="12" stroke="#f59e0b" stroke-width="1.2"/>
    <line x1="6" y1="36" x2="74" y2="36" stroke="#f59e0b" stroke-width="1.2"/>
    <circle cx="16" cy="24" r="3" fill="#f59e0b"/>
    <line x1="28" y1="18" x2="28" y2="30" stroke="#fde68a" stroke-width="0.8"/>
    <rect x="33" y="20" width="14" height="8" rx="2" fill="#f59e0b"/>
    <line x1="52" y1="18" x2="52" y2="30" stroke="#fde68a" stroke-width="0.8"/>
    <circle cx="64" cy="24" r="3" fill="#1e1535"/>
  </svg>`,

  'accent-ribbon': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#7530fb"/>
    <circle cx="14" cy="24" r="3" fill="#ffffff"/>
    <line x1="26" y1="16" x2="26" y2="32" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/>
    <circle cx="34" cy="24" r="3" fill="#ffffff"/>
    <line x1="46" y1="16" x2="46" y2="32" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/>
    <circle cx="54" cy="24" r="3" fill="#ffffff"/>
    <line x1="66" y1="16" x2="66" y2="32" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/>
    <circle cx="72" cy="24" r="3" fill="#ffffff"/>
  </svg>`,

  'shield-crest': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1.2"/>
    <path d="M14 16s4-2 4-5-4-1-4-1-4 0-4 1 0 5 4 5z" fill="#16a34a"/>
    <path d="M34 16s4-2 4-5-4-1-4-1-4 0-4 1 0 5 4 5z" fill="#16a34a"/>
    <path d="M54 16s4-2 4-5-4-1-4-1-4 0-4 1 0 5 4 5z" fill="#16a34a"/>
    <path d="M68 16s4-2 4-5-4-1-4-1-4 0-4 1 0 5 4 5z" fill="#16a34a"/>
  </svg>`,

  'hairline-card': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="5" y="12" width="15" height="24" rx="2" fill="#ffffff" stroke="#0f172a" stroke-width="0.8"/>
    <rect x="23" y="12" width="15" height="24" rx="2" fill="#ffffff" stroke="#0f172a" stroke-width="0.8"/>
    <rect x="41" y="12" width="15" height="24" rx="2" fill="#ffffff" stroke="#0f172a" stroke-width="0.8"/>
    <rect x="59" y="12" width="15" height="24" rx="2" fill="#ffffff" stroke="#0f172a" stroke-width="0.8"/>
  </svg>`,

  'dark-obsidian': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#18181b"/>
    <circle cx="14" cy="20" r="3" fill="#b8fa33"/>
    <line x1="26" y1="14" x2="26" y2="34" stroke="#27272a" stroke-width="0.8"/>
    <circle cx="34" cy="20" r="3" fill="#b8fa33"/>
    <line x1="46" y1="14" x2="46" y2="34" stroke="#27272a" stroke-width="0.8"/>
    <circle cx="54" cy="20" r="3" fill="#b8fa33"/>
    <line x1="66" y1="14" x2="66" y2="34" stroke="#27272a" stroke-width="0.8"/>
    <circle cx="72" cy="20" r="3" fill="#b8fa33"/>
  </svg>`,
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT REGISTRY (10 STYLES)
// ─────────────────────────────────────────────────────────────────────────────

export const trustBadgesVariants: BlockVariant[] = [
  {
    id: 'row',
    label: 'Row of 4',
    description: 'White cards with vector icons above text (Current Style)',
    thumbnail: TRUST_BADGES_THUMBNAILS['row'],
    toHtml: variantRowOf4,
  },
  {
    id: 'grid',
    label: '2×2 Grid',
    description: 'Crisp white cards with vector icon squares — 2 column grid',
    thumbnail: TRUST_BADGES_THUMBNAILS['grid'],
    toHtml: variantGrid2x2,
  },
  {
    id: 'strip',
    label: 'Horizontal Strip',
    description: 'Slim single row — icon left, text right inline with dividers',
    thumbnail: TRUST_BADGES_THUMBNAILS['strip'],
    toHtml: variantHorizontalStrip,
  },
  {
    id: 'icon-only',
    label: 'Icon Only',
    description: 'Circular vector badges with clean uppercase text',
    thumbnail: TRUST_BADGES_THUMBNAILS['icon-only'],
    toHtml: variantIconOnly,
  },
  {
    id: 'text-only',
    label: 'Text Only',
    description: 'Clean rounded text pill badges in a row',
    thumbnail: TRUST_BADGES_THUMBNAILS['text-only'],
    toHtml: variantTextOnly,
  },
  {
    id: 'credibility',
    label: 'Credibility Row',
    description: 'Star rating + feedback score + Top Rated Seller badge',
    thumbnail: TRUST_BADGES_THUMBNAILS['credibility'],
    toHtml: variantCredibility,
  },
  {
    id: 'accent-ribbon',
    label: 'Accent Ribbon',
    description: 'Continuous full-width reassurance bar with white vector icons',
    thumbnail: TRUST_BADGES_THUMBNAILS['accent-ribbon'],
    toHtml: variantAccentRibbon,
  },
  {
    id: 'shield-crest',
    label: 'Shield Crest',
    description: 'Official buyer guarantee card with emerald protection crests',
    thumbnail: TRUST_BADGES_THUMBNAILS['shield-crest'],
    toHtml: variantShieldCrest,
  },
  {
    id: 'hairline-card',
    label: 'Hairline Cards',
    description: 'Scandinavian minimalist hairline cards with subtle micro-borders',
    thumbnail: TRUST_BADGES_THUMBNAILS['hairline-card'],
    toHtml: variantHairlineCards,
  },
  {
    id: 'dark-obsidian',
    label: 'Dark Obsidian',
    description: 'Midnight obsidian high-contrast trust bar for tech & automotive',
    thumbnail: TRUST_BADGES_THUMBNAILS['dark-obsidian'],
    toHtml: variantDarkObsidian,
  },
]

export function getTrustBadgesVariant(variantId: string): BlockVariant {
  return trustBadgesVariants.find(v => v.id === variantId) ?? trustBadgesVariants[0]
}
