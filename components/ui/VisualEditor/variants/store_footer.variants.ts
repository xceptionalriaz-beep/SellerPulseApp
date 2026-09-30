// components/ui/VisualEditor/variants/store_footer.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Store Footer — 10 High-Converting eBay Layout Variants (Production Grade)
// Free:    classic-dark-band, minimalist-inline
// Pro:     two-column-brand-split, trust-secure-payment-bar, multi-row-navigation-hub,
//          executive-dark-accent, modern-glassmorphism, wholesale-compliance,
//          spotlight-policy, elite-luxury
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
  id: string
  label: string
  description: string
  toHtml: (props: any, id: string) => string
}

// ─── Shared Helpers & Token Sanitizers ───────────────────────────────────────
function pad(p: any, defaultT = 22, defaultR = 24, defaultB = 20, defaultL = 24): string {
  const top = p.paddingTop ?? defaultT
  const right = p.paddingRight ?? defaultR
  const bottom = p.paddingBottom ?? defaultB
  const left = p.paddingLeft ?? defaultL
  return `padding:${top}px ${right}px ${bottom}px ${left}px;`
}

function bg(p: any, defaultBg = '#1e1535'): string {
  return p.bgColor ?? defaultBg
}

function textCol(p: any, defaultCol = '#ffffff'): string {
  return p.textColor ?? defaultCol
}

function linkCol(p: any, defaultCol = '#ffffff'): string {
  return p.linkColor ?? p.textColor ?? defaultCol
}

function mutedCol(p: any, defaultCol = 'rgba(255,255,255,0.65)'): string {
  return p.mutedColor ?? defaultCol
}

function accentCol(p: any, defaultCol = '#b8fa33'): string {
  return p.accentColor ?? defaultCol
}

function font(p: any, defaultFamily = 'Arial, sans-serif'): string {
  return p.fontFamily ? `${p.fontFamily}, Arial, sans-serif` : defaultFamily
}

function storeName(p: any): string {
  const val = p.sellerName ?? p.storeName ?? p.brandName
  if (!val || typeof val !== 'string' || val.trim() === '' || val.includes('{{SELLER_NAME')) {
    return p.preserveTokens ? '{{SELLER_NAME}}' : 'Trusted Seller'
  }
  return val.trim()
}

function copyrightText(p: any): string {
  const val = p.copyright ?? p.copyrightText
  if (!val || typeof val !== 'string' || val.trim() === '' || val.includes('{{SELLER_NAME')) {
    return `&copy; ${new Date().getFullYear()} ${storeName(p)} &bull; All rights reserved.`
  }
  return val.trim()
}

interface FooterLink {
  label: string
  url: string
}

function getLinks(p: any): FooterLink[] {
  if (Array.isArray(p.links) && p.links.length > 0) {
    return p.links
  }
  return [
    { label: p.link1Text ?? 'All Listings', url: p.link1Url ?? '#' },
    { label: p.link2Text ?? 'About Us', url: p.link2Url ?? '#' },
    { label: p.link3Text ?? 'Feedback', url: p.link3Url ?? '#' },
    { label: p.link4Text ?? 'Returns Policy', url: p.link4Url ?? '#' },
    { label: p.link5Text ?? 'Contact Us', url: p.link5Url ?? '#' },
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 1 — classic-dark-band  [FREE DEFAULT]
// Solid dark background spanning full width. Vertically centered links & copyright.
// ─────────────────────────────────────────────────────────────────────────────
function classicDarkBand(p: any, id: string): string {
  const f = font(p)
  const links = getLinks(p)
  const lColor = linkCol(p, '#ffffff')
  const mColor = mutedCol(p, 'rgba(255,255,255,0.65)')

  const linkHtml = links
    .map(
      (l, idx) => `
      <a href="${l.url}" style="color:${lColor};text-decoration:none;font-size:12.5px;font-weight:600;letter-spacing:0.3px;white-space:nowrap;line-height:1.4;display:inline-block;">
        ${l.label}
      </a>${idx < links.length - 1 ? `<span style="color:${mColor};font-size:11px;user-select:none;opacity:0.4;">&bull;</span>` : ''}`
    )
    .join('\n')

  return `<!--[riazify:store_footer:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#1e1535')};${pad(p, 24, 24, 22, 24)}border-radius:10px;text-align:center;box-sizing:border-box;">
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;width:100%;box-sizing:border-box;">
        <!-- Navigation Links -->
        <div style="display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:12px 14px;box-sizing:border-box;width:100%;">
          ${linkHtml}
        </div>

        <!-- Copyright Line -->
        <div style="font-size:11.5px;color:${mColor};letter-spacing:0.3px;line-height:1.4;margin:0;box-sizing:border-box;">
          ${copyrightText(p)}
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:store_footer:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 2 — minimalist-inline  [FREE]
// Borderless, clean layout that blends into background with thin top divider line.
// ─────────────────────────────────────────────────────────────────────────────
function minimalistInline(p: any, id: string): string {
  const f = font(p)
  const links = getLinks(p)
  const lColor = linkCol(p, '#475569')
  const mColor = mutedCol(p, '#94a3b8')
  const divider = p.borderColor ?? '#e2e8f0'

  const linkHtml = links
    .map(
      (l, idx) => `
      <a href="${l.url}" style="color:${lColor};text-decoration:none;font-size:12px;font-weight:600;letter-spacing:0.2px;white-space:nowrap;line-height:1.4;display:inline-block;">
        ${l.label}
      </a>${idx < links.length - 1 ? `<span style="color:${divider};font-size:11px;user-select:none;">&bull;</span>` : ''}`
    )
    .join('\n')

  return `<!--[riazify:store_footer:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#ffffff')};${pad(p, 16, 20, 16, 20)}border-top:1px solid ${divider};box-sizing:border-box;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;width:100%;box-sizing:border-box;">
        <!-- Left: Copyright -->
        <div style="font-size:11.5px;color:${mColor};letter-spacing:0.2px;line-height:1.4;box-sizing:border-box;">
          ${copyrightText(p)}
        </div>

        <!-- Right: Inline Links -->
        <div style="display:flex;align-items:center;flex-wrap:wrap;gap:10px 12px;box-sizing:border-box;">
          ${linkHtml}
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:store_footer:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 3 — two-column-brand-split  [PRO]
// Left: Store brand name, badge, and copyright. Right: Stacked quick links.
// ─────────────────────────────────────────────────────────────────────────────
function twoColumnBrandSplit(p: any, id: string): string {
  const f = font(p)
  const links = getLinks(p)
  const lColor = linkCol(p, '#ffffff')
  const mColor = mutedCol(p, 'rgba(255,255,255,0.65)')
  const accent = accentCol(p, '#b8fa33')
  const sName = storeName(p)

  const linkHtml = links
    .map(
      l => `
      <a href="${l.url}" style="color:${lColor};text-decoration:none;font-size:12px;font-weight:600;letter-spacing:0.3px;white-space:nowrap;line-height:1.3;display:inline-block;padding:3px 8px;border-radius:4px;background-color:rgba(255,255,255,0.06);">
        ${l.label} &rarr;
      </a>`
    )
    .join('\n')

  return `<!--[riazify:store_footer:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#1e1535')};${pad(p, 24, 26, 22, 26)}border-radius:12px;box-sizing:border-box;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;width:100%;box-sizing:border-box;">
        <!-- Left: Brand, Badge & Legal -->
        <div style="flex:1 1 240px;min-width:200px;text-align:left;box-sizing:border-box;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="font-size:17px;font-weight:900;color:#ffffff;letter-spacing:-0.2px;line-height:1.2;">
              ${sName}
            </span>
            <span style="background-color:${accent};color:#1e1535;font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;padding:2px 8px;border-radius:100px;line-height:1.2;white-space:nowrap;">
              Verified Store
            </span>
          </div>
          <div style="font-size:11px;color:${mColor};line-height:1.4;margin:0;">
            ${copyrightText(p)}
          </div>
        </div>

        <!-- Right: Category & Quick Links -->
        <div style="flex:1 1 280px;min-width:240px;box-sizing:border-box;">
          <div style="display:flex;justify-content:flex-end;align-items:center;flex-wrap:wrap;gap:6px 8px;box-sizing:border-box;">
            ${linkHtml}
          </div>
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:store_footer:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 4 — trust-secure-payment-bar  [PRO]
// Multi-tier layout with navigation links above a secure payment & safety strip.
// ─────────────────────────────────────────────────────────────────────────────
function trustSecurePaymentBar(p: any, id: string): string {
  const f = font(p)
  const links = getLinks(p)
  const lColor = linkCol(p, '#1e293b')
  const mColor = mutedCol(p, '#64748b')

  const linkHtml = links
    .map(
      (l, idx) => `
      <a href="${l.url}" style="color:${lColor};text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.3px;white-space:nowrap;line-height:1.4;display:inline-block;">
        ${l.label}
      </a>${idx < links.length - 1 ? `<span style="color:#cbd5e1;font-size:11px;user-select:none;">&bull;</span>` : ''}`
    )
    .join('\n')

  return `<!--[riazify:store_footer:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#f8fafc')};border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;padding:0;box-sizing:border-box;box-shadow:0 2px 8px rgba(0,0,0,0.03);">
      <!-- Top Tier: Navigation Links -->
      <div style="padding:16px 20px;text-align:center;box-sizing:border-box;">
        <div style="display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:10px 14px;box-sizing:border-box;width:100%;">
          ${linkHtml}
        </div>
      </div>

      <!-- Divider -->
      <div style="height:1px;background-color:#e2e8f0;width:100%;"></div>

      <!-- Bottom Tier: Secure Badges & Buyer Confidence Strip -->
      <div style="background-color:#ffffff;padding:12px 20px;box-sizing:border-box;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;width:100%;box-sizing:border-box;">
          <!-- Left: Guarantee Tokens -->
          <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px 12px;box-sizing:border-box;">
            <span style="font-size:11px;font-weight:700;color:#16a34a;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;">
              &#10004; eBay Money Back Guarantee
            </span>
            <span style="color:#cbd5e1;font-size:10px;">&bull;</span>
            <span style="font-size:11px;font-weight:700;color:#0369a1;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;">
              &#128274; 256-Bit SSL Encrypted
            </span>
            <span style="color:#cbd5e1;font-size:10px;">&bull;</span>
            <span style="font-size:11px;font-weight:700;color:#d97706;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;">
              &#9889; Tracked Dispatch
            </span>
          </div>

          <!-- Right: Copyright -->
          <div style="font-size:11px;color:${mColor};line-height:1.3;box-sizing:border-box;white-space:nowrap;">
            ${copyrightText(p)}
          </div>
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:store_footer:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 5 — multi-row-navigation-hub  [PRO]
// Robust 3-tier hub: Row 1 category pills, Row 2 policy links, Row 3 copyright.
// ─────────────────────────────────────────────────────────────────────────────
function multiRowNavigationHub(p: any, id: string): string {
  const f = font(p)
  const mColor = mutedCol(p, 'rgba(255,255,255,0.65)')
  const accent = accentCol(p, '#b8fa33')

  const categories = [
    { label: 'Featured Deals', url: '#' },
    { label: 'New Arrivals', url: '#' },
    { label: 'Best Sellers', url: '#' },
    { label: 'Clearance Outlet', url: '#' },
    { label: 'All Inventory', url: '#' },
  ]

  const policies = [
    { label: 'Shipping Information', url: '#' },
    { label: '30-Day Easy Returns', url: '#' },
    { label: 'Customer Feedback', url: '#' },
    { label: 'Contact Support', url: '#' },
  ]

  const catPills = categories
    .map(
      c => `
      <a href="${c.url}" style="background-color:rgba(255,255,255,0.1);color:#ffffff;text-decoration:none;font-size:11.5px;font-weight:700;padding:5px 12px;border-radius:100px;letter-spacing:0.3px;white-space:nowrap;line-height:1.2;display:inline-block;">
        ${c.label}
      </a>`
    )
    .join('\n')

  const policyLinks = policies
    .map(
      (po, idx) => `
      <a href="${po.url}" style="color:${accent};text-decoration:none;font-size:12px;font-weight:600;letter-spacing:0.2px;white-space:nowrap;line-height:1.3;display:inline-block;">
        ${po.label}
      </a>${idx < policies.length - 1 ? `<span style="color:rgba(255,255,255,0.25);font-size:11px;user-select:none;">&bull;</span>` : ''}`
    )
    .join('\n')

  return `<!--[riazify:store_footer:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#1e1535')};${pad(p, 22, 24, 20, 24)}border-radius:12px;text-align:center;box-sizing:border-box;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:14px;width:100%;box-sizing:border-box;">
        <!-- Row 1: Category Pill Tags -->
        <div style="display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:8px;box-sizing:border-box;width:100%;">
          ${catPills}
        </div>

        <!-- Row 2: Policy & Support Links -->
        <div style="display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:10px 14px;box-sizing:border-box;width:100%;padding-top:4px;">
          ${policyLinks}
        </div>

        <!-- Divider Line -->
        <div style="height:1px;background-color:rgba(255,255,255,0.12);width:85%;max-width:500px;"></div>

        <!-- Row 3: Standard Copyright & Seller Disclaimer -->
        <div style="font-size:11px;color:${mColor};letter-spacing:0.3px;line-height:1.4;margin:0;">
          ${copyrightText(p)} &bull; Official eBay Authorized Merchant
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:store_footer:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 6 — executive-dark-accent  [PRO]
// High-contrast dark theme with styled "Follow Store" button centerpiece.
// ─────────────────────────────────────────────────────────────────────────────
function executiveDarkAccent(p: any, id: string): string {
  const f = font(p)
  const links = getLinks(p)
  const lColor = linkCol(p, '#ffffff')
  const mColor = mutedCol(p, 'rgba(255,255,255,0.6)')
  const btnBg = accentCol(p, '#b8fa33')
  const btnTxt = p.buttonTextColor ?? '#1e1535'

  const linkHtml = links
    .map(
      (l, idx) => `
      <a href="${l.url}" style="color:${lColor};text-decoration:none;font-size:12px;font-weight:600;letter-spacing:0.3px;white-space:nowrap;line-height:1.3;display:inline-block;">
        ${l.label}
      </a>${idx < links.length - 1 ? `<span style="color:rgba(255,255,255,0.25);font-size:11px;user-select:none;">&bull;</span>` : ''}`
    )
    .join('\n')

  return `<!--[riazify:store_footer:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#0f172a')};${pad(p, 26, 24, 22, 24)}border-radius:12px;border:1px solid #1e293b;text-align:center;box-sizing:border-box;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:16px;width:100%;box-sizing:border-box;">
        <!-- Centerpiece: Prominent Follow Store Button -->
        <div style="box-sizing:border-box;">
          <a href="#" style="background-color:${btnBg};color:${btnTxt};text-decoration:none;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:1px;padding:10px 24px;border-radius:8px;box-shadow:0 3px 10px rgba(0,0,0,0.3);display:inline-flex;align-items:center;gap:8px;line-height:1.2;box-sizing:border-box;">
            &#9733; Add to Favorite Sellers
          </a>
        </div>

        <!-- Secondary Navigation Links -->
        <div style="display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:12px 16px;box-sizing:border-box;width:100%;">
          ${linkHtml}
        </div>

        <!-- Copyright Line -->
        <div style="font-size:11px;color:${mColor};letter-spacing:0.3px;line-height:1.4;margin:0;">
          ${copyrightText(p)}
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:store_footer:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 7 — modern-glassmorphism  [PRO]
// Card-style footer with soft borders, glowing indicators, and clean hierarchy.
// ─────────────────────────────────────────────────────────────────────────────
function modernGlassmorphism(p: any, id: string): string {
  const f = font(p)
  const links = getLinks(p)
  const lColor = linkCol(p, '#ffffff')
  const mColor = mutedCol(p, 'rgba(255,255,255,0.7)')
  const sName = storeName(p)

  const linkHtml = links
    .map(
      l => `
      <a href="${l.url}" style="color:${lColor};text-decoration:none;font-size:12px;font-weight:600;letter-spacing:0.3px;padding:6px 12px;border-radius:6px;background-color:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);white-space:nowrap;line-height:1.2;display:inline-block;">
        ${l.label}
      </a>`
    )
    .join('\n')

  return `<!--[riazify:store_footer:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#1e1535')};${pad(p, 24, 26, 22, 26)}border:1px solid rgba(255,255,255,0.15);border-radius:14px;box-shadow:0 4px 18px rgba(0,0,0,0.15);box-sizing:border-box;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:18px;width:100%;box-sizing:border-box;">
        <!-- Left: Brand Title & Glowing Status -->
        <div style="flex:1 1 220px;min-width:180px;text-align:left;box-sizing:border-box;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="display:inline-block;width:7px;height:7px;background-color:#4ade80;border-radius:100px;box-shadow:0 0 6px #4ade80;"></span>
            <span style="font-size:16px;font-weight:900;color:#ffffff;letter-spacing:-0.2px;line-height:1.2;">
              ${sName}
            </span>
          </div>
          <div style="font-size:11px;color:${mColor};line-height:1.4;margin:0;">
            ${copyrightText(p)}
          </div>
        </div>

        <!-- Right: Glassmorphic Link Cards -->
        <div style="flex:1 1 300px;min-width:260px;box-sizing:border-box;">
          <div style="display:flex;justify-content:flex-end;align-items:center;flex-wrap:wrap;gap:6px 8px;box-sizing:border-box;">
            ${linkHtml}
          </div>
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:store_footer:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 8 — wholesale-compliance  [PRO]
// Structured, formal layout for volume B2B sellers with MAP statement & terms.
// ─────────────────────────────────────────────────────────────────────────────
function wholesaleCompliance(p: any, id: string): string {
  const f = font(p)
  const links = getLinks(p)
  const sName = storeName(p)

  const linkHtml = links
    .map(
      (l, idx) => `
      <a href="${l.url}" style="color:#0f172a;text-decoration:none;font-size:11.5px;font-weight:700;letter-spacing:0.3px;white-space:nowrap;line-height:1.3;display:inline-block;">
        ${l.label}
      </a>${idx < links.length - 1 ? `<span style="color:#94a3b8;font-size:10px;user-select:none;">&bull;</span>` : ''}`
    )
    .join('\n')

  return `<!--[riazify:store_footer:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#ffffff')};border:1px solid #cbd5e1;border-radius:8px;overflow:hidden;padding:0;box-sizing:border-box;">
      <!-- Top Compliance Banner -->
      <div style="background-color:#f1f5f9;padding:12px 18px;border-bottom:1px solid #e2e8f0;box-sizing:border-box;">
        <div style="font-size:11px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;line-height:1.2;">
          Commercial Terms &amp; Compliance Statement
        </div>
        <div style="font-size:10.5px;color:#64748b;line-height:1.4;margin:0;">
          All items guaranteed authentic, factory-sealed, and sourced through authorized supply channels. Strict MAP policies maintained. For commercial volume pricing, VAT invoicing, or bulk inquiries, please contact our merchant desk.
        </div>
      </div>

      <!-- Bottom Navigation & Entity Row -->
      <div style="padding:14px 18px;background-color:#fafafa;box-sizing:border-box;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;width:100%;box-sizing:border-box;">
          <!-- Left: Formal Links -->
          <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px 12px;box-sizing:border-box;">
            ${linkHtml}
          </div>

          <!-- Right: Legal Entity -->
          <div style="font-size:10.5px;color:#64748b;letter-spacing:0.2px;line-height:1.3;box-sizing:border-box;white-space:nowrap;">
            &copy; ${new Date().getFullYear()} ${sName} Registered Commercial Merchant
          </div>
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:store_footer:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 9 — spotlight-policy  [PRO]
// 3 micro-columns highlighting key guarantees, followed by divider and links.
// ─────────────────────────────────────────────────────────────────────────────
function spotlightPolicy(p: any, id: string): string {
  const f = font(p)
  const links = getLinks(p)
  const lColor = linkCol(p, '#1e1535')
  const mColor = mutedCol(p, '#64748b')

  const linkHtml = links
    .map(
      (l, idx) => `
      <a href="${l.url}" style="color:${lColor};text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.3px;white-space:nowrap;line-height:1.3;display:inline-block;">
        ${l.label}
      </a>${idx < links.length - 1 ? `<span style="color:#cbd5e1;font-size:11px;user-select:none;">&bull;</span>` : ''}`
    )
    .join('\n')

  return `<!--[riazify:store_footer:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#ffffff')};border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;padding:0;box-sizing:border-box;box-shadow:0 2px 10px rgba(0,0,0,0.03);">
      <!-- 3-Column Policy Guarantees Grid -->
      <div style="padding:18px 20px 14px 20px;box-sizing:border-box;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:14px;width:100%;box-sizing:border-box;">
          <!-- Feature 1 -->
          <div style="flex:1 1 180px;min-width:160px;text-align:center;box-sizing:border-box;">
            <div style="font-size:20px;line-height:1;margin-bottom:6px;">&#128230;</div>
            <div style="font-size:12px;font-weight:800;color:#1e1535;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;line-height:1.2;">
              Fast &amp; Free Shipping
            </div>
            <div style="font-size:11px;color:#64748b;line-height:1.3;margin:0;">
              Tracked dispatch within 24h
            </div>
          </div>

          <!-- Feature 2 -->
          <div style="flex:1 1 180px;min-width:160px;text-align:center;box-sizing:border-box;">
            <div style="font-size:20px;line-height:1;margin-bottom:6px;">&#128257;</div>
            <div style="font-size:12px;font-weight:800;color:#1e1535;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;line-height:1.2;">
              30-Day Easy Returns
            </div>
            <div style="font-size:11px;color:#64748b;line-height:1.3;margin:0;">
              Hassle-free money back guarantee
            </div>
          </div>

          <!-- Feature 3 -->
          <div style="flex:1 1 180px;min-width:160px;text-align:center;box-sizing:border-box;">
            <div style="font-size:20px;line-height:1;margin-bottom:6px;">&#128737;</div>
            <div style="font-size:12px;font-weight:800;color:#1e1535;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;line-height:1.2;">
              100% Authentic &amp; Tested
            </div>
            <div style="font-size:11px;color:#64748b;line-height:1.3;margin:0;">
              eBay Buyer Protection covered
            </div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div style="height:1px;background-color:#e2e8f0;width:100%;"></div>

      <!-- Bottom Links & Legal -->
      <div style="background-color:#f8fafc;padding:12px 20px;box-sizing:border-box;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;width:100%;box-sizing:border-box;">
          <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px 12px;box-sizing:border-box;">
            ${linkHtml}
          </div>
          <div style="font-size:11px;color:${mColor};line-height:1.3;box-sizing:border-box;">
            ${copyrightText(p)}
          </div>
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:store_footer:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 10 — elite-luxury  [PRO]
// Minimalist, high-end centered design with serif typography & gold framing lines.
// ─────────────────────────────────────────────────────────────────────────────
function eliteLuxury(p: any, id: string): string {
  const f = p.fontFamily ? `${p.fontFamily}, Georgia, serif` : 'Georgia, serif'
  const gold = p.accentColor ?? '#d97706'
  const links = getLinks(p)
  const sName = storeName(p)

  const linkHtml = links
    .map(
      (l, idx) => `
      <a href="${l.url}" style="color:#111827;text-decoration:none;font-size:11.5px;font-weight:600;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;line-height:1.3;display:inline-block;">
        ${l.label}
      </a>${idx < links.length - 1 ? `<span style="color:${gold};font-size:11px;user-select:none;">&bull;</span>` : ''}`
    )
    .join('\n')

  return `<!--[riazify:store_footer:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#ffffff')};${pad(p, 28, 24, 26, 24)}border:1px solid #e5e7eb;border-top:3px solid ${gold};border-radius:6px;text-align:center;box-sizing:border-box;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:14px;width:100%;box-sizing:border-box;">
        <!-- Top Emblem -->
        <div style="font-size:10px;font-weight:700;color:${gold};text-transform:uppercase;letter-spacing:2.5px;line-height:1;">
          &#10022; ${sName} &bull; Official Boutique &#10022;
        </div>

        <!-- Thin Framing Line Above -->
        <div style="height:1px;background-color:#e5e7eb;width:60%;max-width:320px;"></div>

        <!-- Center Links -->
        <div style="display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:10px 16px;box-sizing:border-box;width:100%;">
          ${linkHtml}
        </div>

        <!-- Thin Framing Line Below -->
        <div style="height:1px;background-color:#e5e7eb;width:60%;max-width:320px;"></div>

        <!-- Copyright Line -->
        <div style="font-size:10.5px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;line-height:1.4;margin:0;font-family:Arial,sans-serif;">
          ${copyrightText(p)}
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:store_footer:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export const storeFooterVariants: BlockVariant[] = [
  {
    id: 'classic-dark-band',
    label: 'Classic Dark Band',
    description: 'Clean solid dark full-width container with centered navigation links and copyright',
    toHtml(props, id) { return classicDarkBand(props, id) },
  },
  {
    id: 'footer-minimalist-inline',
    label: 'Minimalist Inline',
    description: 'Ultra-clean single-row layout with subtle top border divider and compact links',
    toHtml(props, id) { return minimalistInline(props, id) },
  },
  {
    id: 'two-column-brand-split',
    label: 'Two-Column Brand Split',
    description: 'Left brand identity and badge with right-side category and quick links',
    toHtml(props, id) { return twoColumnBrandSplit(props, id) },
  },
  {
    id: 'trust-secure-payment-bar',
    label: 'Trust & Secure Bar',
    description: 'Multi-tier footer with store links above an eBay guarantee and safety strip',
    toHtml(props, id) { return trustSecurePaymentBar(props, id) },
  },
  {
    id: 'multi-row-navigation-hub',
    label: 'Multi-Row Hub',
    description: '3-tier hub featuring category pills, policy links, and seller verification',
    toHtml(props, id) { return multiRowNavigationHub(props, id) },
  },
  {
    id: 'executive-dark-accent',
    label: 'Executive Dark Accent',
    description: 'High-contrast dark theme with an eye-catching Follow Store CTA button',
    toHtml(props, id) { return executiveDarkAccent(props, id) },
  },
  {
    id: 'footer-modern-glass',
    label: 'Modern Glassmorphism',
    description: 'Frosted card aesthetic with brand status dot and translucent pill links',
    toHtml(props, id) { return modernGlassmorphism(props, id) },
  },
  {
    id: 'wholesale-compliance',
    label: 'Wholesale & Compliance',
    description: 'Corporate commercial footer with MAP compliance terms and merchant details',
    toHtml(props, id) { return wholesaleCompliance(props, id) },
  },
  {
    id: 'spotlight-policy',
    label: 'Spotlight Policy',
    description: '3-column buyer guarantee icons (Shipping, Returns, Authenticity) with link row',
    toHtml(props, id) { return spotlightPolicy(props, id) },
  },
  {
    id: 'footer-elite-luxury',
    label: 'Elite Luxury',
    description: 'Understated serif typography framed by gold accent lines and generous padding',
    toHtml(props, id) { return eliteLuxury(props, id) },
  },
]

export function getStoreFooterVariant(id: string): BlockVariant {
  return storeFooterVariants.find(v => v.id === id) ?? storeFooterVariants[0]
}
