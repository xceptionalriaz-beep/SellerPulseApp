// components/ui/VisualEditor/variants/category_nav.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Category Navigation — 10 High-Converting, Distinct eBay Layout Architectures
// 100% eBay Compliant: Pure inline-styled table layouts, zero emojis,
// clean inline SVG icons, responsive fallback across desktop and mobile.
//
// 1. cat-classic-dark        — Storefront Bar (Store Logo/Badge + Categories + "Visit Store →" CTA)
// 2. cat-minimalist-divider  — Minimalist E-Commerce Strip (Tracked uppercase, micro-dots, active bar)
// 3. cat-pill-badge          — Modern App Pill Carousel (Touch-friendly capsule badges with active pill)
// 4. cat-subtle-underline    — Retail Folder Tabs + High-Impact "Deals / Clearance" Red Badge
// 5. cat-two-tier-grid       — Two-Tier Header (Top Announcement Ribbon + Bottom Department Bar)
// 6. cat-icon-hybrid         — Visual Department Cards (Grid of interactive category cards with SVG icons)
// 7. cat-modern-glass        — Modern Dark Tech / Gaming Bar (Translucent styling with accent glow)
// 8. cat-wholesale-jump      — B2B Wholesale / Corporate Catalog (Structured data table with department codes)
// 9. cat-high-contrast-flash — Industrial / Auto Parts Fitment Bar (Rugged dark slate, amber tags, fitment guarantee)
// 10. cat-elite-luxury       — Boutique Luxury Editorial (Serif typography, double gold hairlines, diamond crest)
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
  id: string
  label: string
  description: string
  toHtml: (props: any, id: string) => string
}

// ─── Shared Helpers ──────────────────────────────────────────────────────────
function pad(p: any, defaultT = 12, defaultR = 20, defaultB = 12, defaultL = 20): string {
  const top = p.paddingTop ?? defaultT
  const right = p.paddingRight ?? defaultR
  const bottom = p.paddingBottom ?? defaultB
  const left = p.paddingLeft ?? defaultL
  return `padding:${top}px ${right}px ${bottom}px ${left}px;`
}

function bg(p: any, defaultBg = '#1e1535'): string {
  if (p.bgGradient) {
    const dir = p.bgGradientDir ?? 135
    const from = p.bgGradientFrom ?? '#7530fb'
    const to = p.bgGradientTo ?? '#1e1535'
    return `linear-gradient(${dir}deg, ${from}, ${to})`
  }
  // If the variant specifies a light background (e.g. #f8fafc or #ffffff)
  // but p.bgColor is still the default dark purple from cat-classic-dark (#1e1535),
  // automatically adopt the variant's intended light background.
  if (p.bgColor === '#1e1535' && defaultBg !== '#1e1535') {
    return defaultBg
  }
  return p.bgColor ?? defaultBg
}

function linkCol(p: any, defaultCol = '#ffffff'): string {
  if ((p.linkColor === '#ffffff' || !p.linkColor) && defaultCol !== '#ffffff') {
    return defaultCol
  }
  return p.linkColor ?? p.textColor ?? defaultCol
}

function activeCol(p: any, defaultCol = '#b8fa33'): string {
  if ((p.activeColor === '#b8fa33' || !p.activeColor) && defaultCol !== '#b8fa33') {
    return defaultCol
  }
  return p.activeColor ?? defaultCol
}

function font(p: any, defaultFamily = 'Arial, sans-serif'): string {
  return p.fontFamily ? `${p.fontFamily}, Arial, sans-serif` : defaultFamily
}

interface CategoryItem {
  label: string
  url: string
  icon?: string
}

function getCategories(p: any): CategoryItem[] {
  const rawList = (Array.isArray(p.categories) && p.categories.length > 0)
    ? p.categories
    : (Array.isArray(p.links) && p.links.length > 0)
      ? p.links
      : null

  if (rawList) {
    return rawList.map((c: any) =>
      typeof c === 'string'
        ? { label: c, url: '#' }
        : { label: c.label ?? 'Category', url: c.url ?? '#', icon: c.icon }
    )
  }
  return [
    { label: 'All Items', url: '#' },
    { label: 'Featured Deals', url: '#' },
    { label: 'New Arrivals', url: '#' },
    { label: 'Best Sellers', url: '#' },
    { label: 'Clearance', url: '#' },
  ]
}

// ─── Clean Inline SVGs (No Emojis) ───────────────────────────────────────────
const SVG_ICONS = {
  store: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;margin-right:6px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
  arrowRight: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;margin-left:4px;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
  tag: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;margin-right:5px;"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`,
  bolt: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="vertical-align:middle;display:inline-block;margin-right:4px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
  star: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;margin-right:4px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  shield: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;margin-right:5px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>`,
  chevronDown: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;margin-left:4px;opacity:0.7;"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
  wrench: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;margin-right:5px;"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
  package: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24a1.78 1.78 0 0 0-2.5 1.55v12.42a1.78 1.78 0 0 0 2.5 1.55L16.5 14.6a1.78 1.78 0 0 0 0-3.1z"></path></svg>`,
  layers: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 1: cat-classic-dark — E-Commerce Storefront Bar
// Left Store Emblem + Center Categories + Right High-Contrast "Visit Store →" Button
// ─────────────────────────────────────────────────────────────────────────────
function classicDark(p: any, id: string): string {
  const f = font(p)
  const cats = getCategories(p)
  const lColor = linkCol(p, 'rgba(255,255,255,0.92)')
  const act = activeCol(p, '#b8fa33')
  const fs = p.fontSize ?? 13

  const linksHtml = cats
    .map((c, idx) => `
      <td style="padding:0 12px;white-space:nowrap;vertical-align:middle;text-align:center;">
        <a href="${c.url}" style="color:${idx === 0 ? act : lColor};text-decoration:none;font-size:${fs}px;font-weight:${idx === 0 ? '800' : '600'};letter-spacing:0.3px;display:inline-block;padding:6px 0;${idx === 0 ? `border-bottom:2px solid ${act};` : ''}">
          ${c.label}
        </a>
      </td>`
    )
    .join('')

  return `<!--[riazify:category_nav:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:${f};">
  <tr>
    <td width="100%" style="width:100%;background-color:${bg(p, '#1e1535')};${pad(p, 10, 16, 10, 16)}border-radius:0;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <!-- Left: Store Badge -->
          <td align="left" style="white-space:nowrap;vertical-align:middle;padding-right:16px;">
            <span style="display:inline-block;color:#ffffff;font-size:12px;font-weight:800;letter-spacing:0.8px;text-transform:uppercase;">
              ${SVG_ICONS.store}DEPARTMENTS
            </span>
          </td>
          <!-- Center: Categories in scrollable wrapper for mobile -->
          <td align="center" style="vertical-align:middle;width:100%;">
            <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;">
              <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border-collapse:collapse;">
                <tr>
                  ${linksHtml}
                </tr>
              </table>
            </div>
          </td>
          <!-- Right: Visit Store CTA Button -->
          <td align="right" style="white-space:nowrap;vertical-align:middle;padding-left:16px;">
            <a href="#" style="display:inline-block;background-color:${act};color:#1e1535;font-size:11.5px;font-weight:800;text-decoration:none;padding:7px 14px;border-radius:6px;text-transform:uppercase;letter-spacing:0.5px;line-height:1;box-shadow:0 2px 6px rgba(0,0,0,0.2);">
              Store${SVG_ICONS.arrowRight}
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:category_nav:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 2: cat-minimalist-divider — Minimalist Clean E-Commerce Strip
// Ultra-clean light background, tracked uppercase typography, and subtle micro-dots
// ─────────────────────────────────────────────────────────────────────────────
function minimalistDivider(p: any, id: string): string {
  const f = font(p)
  const cats = getCategories(p)
  const lColor = linkCol(p, '#334155')
  const act = activeCol(p, '#7530fb')
  const fs = p.fontSize ?? 12
  const sepColor = p.borderColor ?? '#e2e8f0'

  const linksHtml = cats
    .map((c, idx) => `
      <td style="padding:0 10px;white-space:nowrap;vertical-align:middle;text-align:center;">
        <a href="${c.url}" style="color:${idx === 0 ? act : lColor};text-decoration:none;font-size:${fs}px;font-weight:${idx === 0 ? '800' : '600'};letter-spacing:1px;text-transform:uppercase;display:inline-block;padding:8px 4px;${idx === 0 ? `border-bottom:2px solid ${act};` : ''}">
          ${c.label}
        </a>
      </td>
      ${idx < cats.length - 1 ? `<td style="color:#94a3b8;font-size:11px;padding:0 2px;user-select:none;opacity:0.6;vertical-align:middle;">&bull;</td>` : ''}`
    )
    .join('')

  return `<!--[riazify:category_nav:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:${f};">
  <tr>
    <td width="100%" style="width:100%;background-color:${bg(p, '#ffffff')};${pad(p, 8, 16, 8, 16)}border-top:1px solid ${sepColor};border-bottom:1px solid ${sepColor};box-sizing:border-box;text-align:center;">
      <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;">
        <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border-collapse:collapse;">
          <tr>
            ${linksHtml}
          </tr>
        </table>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:category_nav:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 3: cat-pill-badge — Modern App Pill Carousel
// Smooth rounded capsule buttons with soft borders and active highlight pill
// ─────────────────────────────────────────────────────────────────────────────
function pillBadge(p: any, id: string): string {
  const f = font(p)
  const cats = getCategories(p)
  const lColor = linkCol(p, '#ffffff')
  const act = activeCol(p, '#b8fa33')
  const fs = p.fontSize ?? 12

  const pillsHtml = cats
    .map((c, idx) => `
      <td style="padding:4px 6px;white-space:nowrap;vertical-align:middle;">
        <a href="${c.url}" style="display:inline-block;box-sizing:border-box;background-color:${idx === 0 ? act : 'rgba(255,255,255,0.08)'};color:${idx === 0 ? '#1e1535' : lColor};border:${idx === 0 ? `1px solid ${act}` : '1px solid rgba(255,255,255,0.18)'};text-decoration:none;font-size:${fs}px;font-weight:${idx === 0 ? '800' : '600'};padding:7px 18px;border-radius:100px;letter-spacing:0.3px;white-space:nowrap;line-height:1;text-align:center;">
          ${idx === 0 ? SVG_ICONS.star : ''}${c.label}
        </a>
      </td>`
    )
    .join('')

  return `<!--[riazify:category_nav:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:${f};">
  <tr>
    <td width="100%" style="width:100%;background-color:${bg(p, '#1e1535')};${pad(p, 12, 16, 12, 16)}border-radius:0;text-align:center;box-sizing:border-box;">
      <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;">
        <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border-collapse:collapse;">
          <tr>
            ${pillsHtml}
          </tr>
        </table>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:category_nav:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 4: cat-subtle-underline — Retail Department Tabs + Hot Deal Badge
// Folder-tab layout with an attention-grabbing red "Deals / Clearance" badge
// ─────────────────────────────────────────────────────────────────────────────
function subtleUnderline(p: any, id: string): string {
  const f = font(p)
  const cats = getCategories(p)
  const lColor = linkCol(p, '#334155')
  const act = activeCol(p, '#7530fb')
  const fs = p.fontSize ?? 12.5

  const tabsHtml = cats
    .map((c, idx) => {
      const isLast = idx === cats.length - 1
      const isFirst = idx === 0
      if (isLast) {
        // Hot Deal Highlight Tab
        return `
        <td style="padding:0 4px;white-space:nowrap;vertical-align:bottom;">
          <a href="${c.url}" style="display:inline-block;background-color:#ef4444;color:#ffffff;text-decoration:none;font-size:${fs}px;font-weight:800;padding:8px 14px;border-radius:6px 6px 0 0;letter-spacing:0.4px;line-height:1;box-shadow:0 -2px 6px rgba(239,68,68,0.25);">
            ${SVG_ICONS.bolt}${c.label}
          </a>
        </td>`
      }
      return `
      <td style="padding:0 4px;white-space:nowrap;vertical-align:bottom;">
        <a href="${c.url}" style="display:inline-block;color:${isFirst ? act : lColor};background-color:${isFirst ? '#ffffff' : '#f1f5f9'};border-top:2px solid ${isFirst ? act : 'transparent'};border-left:1px solid ${isFirst ? '#e2e8f0' : 'transparent'};border-right:1px solid ${isFirst ? '#e2e8f0' : 'transparent'};text-decoration:none;font-size:${fs}px;font-weight:${isFirst ? '800' : '600'};padding:8px 16px;border-radius:6px 6px 0 0;letter-spacing:0.2px;line-height:1;">
          ${c.label}
        </a>
      </td>`
    })
    .join('')

  return `<!--[riazify:category_nav:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:${f};">
  <tr>
    <td width="100%" style="width:100%;background-color:${bg(p, '#f8fafc')};${pad(p, 12, 16, 0, 16)}border-bottom:2px solid #e2e8f0;box-sizing:border-box;text-align:center;">
      <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;">
        <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border-collapse:collapse;">
          <tr>
            ${tabsHtml}
          </tr>
        </table>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:category_nav:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 5: cat-two-tier-grid — Two-Tier Department Header
// Top: Store Trust Announcement strip. Bottom: Category department links with chevrons
// ─────────────────────────────────────────────────────────────────────────────
function twoTierGrid(p: any, id: string): string {
  const f = font(p)
  const cats = getCategories(p)
  const lColor = linkCol(p, '#ffffff')
  const act = activeCol(p, '#b8fa33')
  const fs = p.fontSize ?? 12

  const catsHtml = cats
    .map(c => `
      <td style="padding:0 12px;white-space:nowrap;vertical-align:middle;text-align:center;">
        <a href="${c.url}" style="color:${lColor};text-decoration:none;font-size:${fs}px;font-weight:700;letter-spacing:0.3px;display:inline-block;padding:8px 0;line-height:1.2;">
          ${c.label}${SVG_ICONS.chevronDown}
        </a>
      </td>`
    )
    .join('')

  return `<!--[riazify:category_nav:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:${f};">
  <!-- Tier 1: Announcement Ribbon -->
  <tr>
    <td width="100%" style="width:100%;background-color:#140e26;padding:7px 16px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.08);box-sizing:border-box;">
      <span style="color:#d1d5db;font-size:11px;font-weight:600;letter-spacing:0.5px;">
        ${SVG_ICONS.shield}<strong style="color:#ffffff;">OFFICIAL STORE</strong> &bull; Free Fast Shipping &amp; 30-Day Free Returns on All Orders
      </span>
    </td>
  </tr>
  <!-- Tier 2: Department Navigation -->
  <tr>
    <td width="100%" style="width:100%;background-color:${bg(p, '#1e1535')};${pad(p, 6, 16, 6, 16)}box-sizing:border-box;text-align:center;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <!-- All Categories Master Button -->
          <td align="left" style="white-space:nowrap;vertical-align:middle;padding-right:12px;">
            <a href="#" style="display:inline-block;background-color:${act};color:#1e1535;font-size:11px;font-weight:800;text-decoration:none;padding:6px 12px;border-radius:4px;text-transform:uppercase;letter-spacing:0.5px;line-height:1;">
              ALL DEPARTMENTS
            </a>
          </td>
          <!-- Scrollable Category Links -->
          <td align="center" style="vertical-align:middle;width:100%;">
            <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;">
              <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border-collapse:collapse;">
                <tr>
                  ${catsHtml}
                </tr>
              </table>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:category_nav:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 6: cat-icon-hybrid — Visual Department Cards Grid
// Grid of interactive category cards with clean SVG icons, card borders, and labels
// ─────────────────────────────────────────────────────────────────────────────
function iconHybrid(p: any, id: string): string {
  const f = font(p)
  const cats = getCategories(p)
  const lColor = linkCol(p, '#1e1535')
  const act = activeCol(p, '#7530fb')
  const fs = p.fontSize ?? 12

  const cardsHtml = cats
    .map((c, idx) => `
      <td style="padding:6px;vertical-align:top;text-align:center;">
        <a href="${c.url}" style="display:block;background-color:#ffffff;border:1px solid #e2e8f0;border-top:3px solid ${idx === 0 ? act : '#cbd5e1'};padding:10px 14px;border-radius:6px;text-decoration:none;box-shadow:0 1px 4px rgba(0,0,0,0.03);min-width:100px;box-sizing:border-box;">
          <div style="color:${idx === 0 ? act : '#64748b'};margin-bottom:6px;">
            ${SVG_ICONS.package}
          </div>
          <div style="color:${lColor};font-size:${fs}px;font-weight:700;letter-spacing:0.2px;line-height:1.2;white-space:nowrap;">
            ${c.label}
          </div>
        </a>
      </td>`
    )
    .join('')

  return `<!--[riazify:category_nav:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:${f};">
  <tr>
    <td width="100%" style="width:100%;background:${bg(p, '#f8fafc')};${pad(p, 14, 16, 14, 16)}border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;box-sizing:border-box;text-align:center;">
      <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;">
        <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border-collapse:collapse;">
          <tr>
            ${cardsHtml}
          </tr>
        </table>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:category_nav:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 7: cat-modern-glass — Modern Dark Tech / Gaming Floating Bar
// High-tech dark aesthetic with translucent borders and electric accent highlights
// ─────────────────────────────────────────────────────────────────────────────
function modernGlass(p: any, id: string): string {
  const f = font(p)
  const cats = getCategories(p)
  const lColor = linkCol(p, 'rgba(255,255,255,0.85)')
  const act = activeCol(p, '#38bdf8')
  const fs = p.fontSize ?? 12.5

  const linksHtml = cats
    .map((c, idx) => `
      <td style="padding:0 6px;white-space:nowrap;vertical-align:middle;">
        <a href="${c.url}" style="display:inline-block;padding:7px 14px;border-radius:6px;background-color:${idx === 0 ? 'rgba(56,189,248,0.14)' : 'rgba(255,255,255,0.05)'};border:${idx === 0 ? `1px solid ${act}` : '1px solid rgba(255,255,255,0.1)'};color:${idx === 0 ? act : lColor};text-decoration:none;font-size:${fs}px;font-weight:700;letter-spacing:0.4px;line-height:1;box-sizing:border-box;">
          ${idx === 0 ? SVG_ICONS.bolt : ''}${c.label}
        </a>
      </td>`
    )
    .join('')

  return `<!--[riazify:category_nav:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:${f};">
  <tr>
    <td width="100%" style="width:100%;background-color:${bg(p, '#0f172a')};${pad(p, 12, 16, 12, 16)}border-top:1px solid rgba(255,255,255,0.15);border-bottom:1px solid rgba(255,255,255,0.15);box-shadow:0 4px 16px rgba(0,0,0,0.3);text-align:center;box-sizing:border-box;">
      <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;">
        <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border-collapse:collapse;">
          <tr>
            ${linksHtml}
          </tr>
        </table>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:category_nav:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 8: cat-wholesale-jump — B2B Wholesale / Corporate Catalog Grid
// Crisp business matrix with vertical dividing borders and department SKU codes
// ─────────────────────────────────────────────────────────────────────────────
function wholesaleJump(p: any, id: string): string {
  const f = font(p)
  const cats = getCategories(p)
  const lColor = linkCol(p, '#0f172a')
  const act = activeCol(p, '#2563eb')
  const fs = p.fontSize ?? 11
  const bColor = p.borderColor ?? '#cbd5e1'

  const cellsHtml = cats
    .map((c, idx) => `
      <td style="padding:10px 14px;text-align:center;vertical-align:middle;border-right:${idx < cats.length - 1 ? `1px solid ${bColor}` : 'none'};background-color:${idx === 0 ? '#f8fafc' : '#ffffff'};white-space:nowrap;box-sizing:border-box;">
        <a href="${c.url}" style="color:${idx === 0 ? act : lColor};text-decoration:none;font-size:${fs}px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;display:block;line-height:1.2;">
          <span style="color:#64748b;font-size:9.5px;font-weight:600;display:block;margin-bottom:2px;">SEC-0${idx + 1}</span>
          ${c.label}
        </a>
      </td>`
    )
    .join('')

  return `<!--[riazify:category_nav:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:${f};">
  <tr>
    <td width="100%" style="width:100%;background:${bg(p, '#ffffff')};border:1px solid ${bColor};border-radius:0;overflow:hidden;padding:0;box-sizing:border-box;">
      <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;min-width:550px;">
          <tr>
            ${cellsHtml}
          </tr>
        </table>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:category_nav:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 9: cat-high-contrast-flash — Industrial / Auto Parts Fitment Bar
// Rugged dark slate background, high-contrast amber tags, and fitment guarantee badge
// ─────────────────────────────────────────────────────────────────────────────
function highContrastFlash(p: any, id: string): string {
  const f = font(p)
  const cats = getCategories(p)
  const lColor = linkCol(p, '#ffffff')
  const act = activeCol(p, '#f59e0b')
  const fs = p.fontSize ?? 12

  const linksHtml = cats
    .map((c, idx) => `
      <td style="padding:0 5px;white-space:nowrap;vertical-align:middle;">
        <a href="${c.url}" style="display:inline-block;padding:7px 13px;background-color:${idx === 0 ? act : '#334155'};color:${idx === 0 ? '#0f172a' : lColor};border-left:3px solid ${idx === 0 ? '#b45309' : act};text-decoration:none;font-size:${fs}px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;line-height:1;box-sizing:border-box;">
          ${c.label}
        </a>
      </td>`
    )
    .join('')

  return `<!--[riazify:category_nav:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:${f};">
  <tr>
    <td width="100%" style="width:100%;background:${bg(p, '#1e293b')};${pad(p, 10, 16, 10, 16)}border-top:3px solid ${act};box-shadow:0 3px 8px rgba(0,0,0,0.25);box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <!-- Fitment Assurance Tag -->
          <td align="left" style="white-space:nowrap;vertical-align:middle;padding-right:14px;">
            <span style="color:${act};font-size:11.5px;font-weight:800;letter-spacing:0.8px;text-transform:uppercase;">
              ${SVG_ICONS.wrench}FITMENT VERIFIED
            </span>
          </td>
          <!-- Categories Scroll -->
          <td align="center" style="vertical-align:middle;width:100%;">
            <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;">
              <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border-collapse:collapse;">
                <tr>
                  ${linksHtml}
                </tr>
              </table>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:category_nav:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 10: cat-elite-luxury — Boutique Luxury Editorial
// Centered serif layout, double hairline gold dividers, and diamond emblem
// ─────────────────────────────────────────────────────────────────────────────
function eliteLuxury(p: any, id: string): string {
  const f = p.fontFamily ? `${p.fontFamily}, Georgia, serif` : 'Georgia, serif'
  const gold = (p as any).accentColor ?? activeCol(p, '#d97706')
  const lColor = linkCol(p, '#111827')
  const cats = getCategories(p)
  const fs = p.fontSize ?? 12

  const linksHtml = cats
    .map((c, idx) => `
      <td style="padding:0 12px;white-space:nowrap;vertical-align:middle;text-align:center;">
        <a href="${c.url}" style="color:${idx === 0 ? gold : lColor};text-decoration:none;font-size:${fs}px;font-weight:600;letter-spacing:1.8px;text-transform:uppercase;line-height:1.3;display:inline-block;padding:4px 0;${idx === 0 ? `border-bottom:1px solid ${gold};color:${gold};` : ''}">
          ${c.label}
        </a>
      </td>
      ${idx < cats.length - 1 ? `<td style="color:${gold};font-size:9px;padding:0 4px;user-select:none;opacity:0.8;vertical-align:middle;">&bull;</td>` : ''}`
    )
    .join('')

  return `<!--[riazify:category_nav:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:${f};">
  <tr>
    <td width="100%" style="width:100%;background:${bg(p, '#ffffff')};${pad(p, 16, 20, 16, 20)}border-top:2px double ${gold};border-bottom:2px double ${gold};text-align:center;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border-collapse:collapse;">
        <tr>
          <td align="center" style="padding-bottom:10px;">
            <span style="font-size:10px;font-weight:700;color:${gold};text-transform:uppercase;letter-spacing:3px;display:inline-block;">
              &#10022; CURATED COLLECTIONS &#10022;
            </span>
          </td>
        </tr>
        <tr>
          <td align="center">
            <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;">
              <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border-collapse:collapse;">
                <tr>
                  ${linksHtml}
                </tr>
              </table>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:category_nav:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT REGISTRY EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export const categoryNavVariants: BlockVariant[] = [
  {
    id: 'cat-classic-dark',
    label: 'Storefront Bar',
    description: 'Header bar with Store emblem, category tabs, and high-impact "Visit Store" button',
    toHtml(props, id) { return classicDark(props, id) },
  },
  {
    id: 'cat-minimalist-divider',
    label: 'Minimalist Clean Strip',
    description: 'Tracked uppercase labels with delicate micro-dot separators and active accent line',
    toHtml(props, id) { return minimalistDivider(props, id) },
  },
  {
    id: 'cat-pill-badge',
    label: 'App Pill Carousel',
    description: 'Smooth touch-friendly capsule pills with active contrast highlight for mobile shoppers',
    toHtml(props, id) { return pillBadge(props, id) },
  },
  {
    id: 'cat-subtle-underline',
    label: 'Retail Tabs + Hot Deal',
    description: 'Folder-tab navigation with an attention-grabbing red "Deals / Clearance" badge',
    toHtml(props, id) { return subtleUnderline(props, id) },
  },
  {
    id: 'cat-two-tier-grid',
    label: 'Two-Tier Department Header',
    description: 'Tier 1 announcement strip + Tier 2 category links with dropdown chevrons',
    toHtml(props, id) { return twoTierGrid(props, id) },
  },
  {
    id: 'cat-icon-hybrid',
    label: 'Visual Department Cards',
    description: 'Grid of clean interactive category cards with SVG icons, borders, and labels',
    toHtml(props, id) { return iconHybrid(props, id) },
  },
  {
    id: 'cat-modern-glass',
    label: 'Modern Dark Tech Bar',
    description: 'High-tech dark aesthetic with translucent glass styling and neon accent glow',
    toHtml(props, id) { return modernGlass(props, id) },
  },
  {
    id: 'cat-wholesale-jump',
    label: 'B2B Wholesale Catalog',
    description: 'Structured corporate table grid with vertical dividers and department SKU codes',
    toHtml(props, id) { return wholesaleJump(props, id) },
  },
  {
    id: 'cat-high-contrast-flash',
    label: 'Industrial & Auto Fitment',
    description: 'Rugged dark slate bar with bold amber tags and fitment guarantee badge',
    toHtml(props, id) { return highContrastFlash(props, id) },
  },
  {
    id: 'cat-elite-luxury',
    label: 'Boutique Luxury Editorial',
    description: 'Classic serif typography, double gold hairlines, and centered diamond emblem',
    toHtml(props, id) { return eliteLuxury(props, id) },
  },
]

export function getCategoryNavVariant(id: string): BlockVariant {
  return categoryNavVariants.find(v => v.id === id) ?? categoryNavVariants[0]
}
