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
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#1e1535')};${pad(p, 24, 24, 22, 24)}text-align:center;box-sizing:border-box;">
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
      </a>${idx < links.length - 1 ? `<span style="color:${divider};font-size:11px;user-select:none;opacity:0.6;">&bull;</span>` : ''}`
    )
    .join('\n')

  return `<!--[riazify:store_footer:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .sf-mi-table-${id} {
      width: 100% !important;
      min-width: 100% !important;
    }
    .sf-mi-pad-${id} {
      padding: 16px 14px !important;
      text-align: center !important;
    }
    .sf-mi-wrap-${id} {
      display: flex !important;
      flex-direction: column-reverse !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 12px !important;
      width: 100% !important;
      text-align: center !important;
    }
    .sf-mi-links-${id} {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      flex-wrap: wrap !important;
      gap: 8px 12px !important;
      width: 100% !important;
      text-align: center !important;
    }
    .sf-mi-copy-${id} {
      width: 100% !important;
      text-align: center !important;
      margin: 0 !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="sf-mi-table-${id}"
  style="width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td class="sf-mi-pad-${id}" style="background-color:${bg(p, '#ffffff')};${pad(p, 16, 20, 16, 20)}border-top:1px solid ${divider};box-sizing:border-box;">
      <div class="sf-mi-wrap-${id}" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;width:100%;box-sizing:border-box;">

        <!-- Left on Desktop / Shows DOWN on Mobile: Copyright -->
        <div class="sf-mi-copy-${id}" style="font-size:11.5px;color:${mColor};letter-spacing:0.2px;line-height:1.4;box-sizing:border-box;">
          ${copyrightText(p)}
        </div>

        <!-- Right on Desktop / Shows TOP on Mobile: Navigation Links -->
        <div class="sf-mi-links-${id}" style="display:flex;align-items:center;flex-wrap:wrap;gap:10px 12px;box-sizing:border-box;">
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
      <a href="${l.url}" style="color:${lColor};text-decoration:none;font-size:12px;font-weight:600;letter-spacing:0.3px;white-space:nowrap;line-height:1.3;display:inline-block;padding:4px 10px;border-radius:4px;background-color:rgba(255,255,255,0.06);">
        ${l.label} &rarr;
      </a>`
    )
    .join('\n')

  return `<!--[riazify:store_footer:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .sf-tc-table-${id} {
      width: 100% !important;
      min-width: 100% !important;
    }
    .sf-tc-pad-${id} {
      padding: 20px 14px !important;
      text-align: center !important;
    }
    .sf-tc-row-${id} {
      display: block !important;
      width: 100% !important;
    }
    .sf-tc-left-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 0 14px 0 !important;
    }
    .sf-tc-brand-${id} {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      margin: 0 auto !important;
    }
    .sf-tc-desk-copy-${id} {
      display: none !important;
    }
    .sf-tc-right-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 !important;
    }
    .sf-tc-links-${id} {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      flex-wrap: wrap !important;
      gap: 6px 8px !important;
      width: 100% !important;
    }
    .sf-tc-mob-copy-row-${id} {
      display: table-row !important;
      width: 100% !important;
    }
    .sf-tc-mob-copy-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding-top: 14px !important;
      border-top: 1px solid rgba(255,255,255,0.08) !important;
      margin-top: 14px !important;
      box-sizing: border-box !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="sf-tc-table-${id}"
  style="width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td class="sf-tc-pad-${id}" style="background-color:${bg(p, '#1e1535')};${pad(p, 24, 26, 22, 26)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
        <tr class="sf-tc-row-${id}">

          <!-- Left Column (Desktop): Brand Title & Verified Badge -->
          <td class="sf-tc-left-${id}" valign="middle" align="left">
            <div class="sf-tc-brand-${id}" style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <span style="font-size:17px;font-weight:900;color:#ffffff;letter-spacing:-0.2px;line-height:1.2;">
                ${sName}
              </span>
              <span style="background-color:${accent};color:#1e1535;font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;padding:2px 8px;border-radius:100px;line-height:1.2;white-space:nowrap;">
                Verified Store
              </span>
            </div>
            <!-- Desktop-Only Copyright -->
            <div class="sf-tc-desk-copy-${id}" style="font-size:11px;color:${mColor};line-height:1.4;margin:0;">
              ${copyrightText(p)}
            </div>
          </td>

          <!-- Right Column (Desktop): Quick Links -->
          <td class="sf-tc-right-${id}" valign="middle" align="right">
            <div class="sf-tc-links-${id}" style="display:flex;justify-content:flex-end;align-items:center;flex-wrap:wrap;gap:6px 8px;">
              ${linkHtml}
            </div>
          </td>

        </tr>

        <!-- Mobile-Only Copyright Row (Shows Down at the Very Bottom) -->
        <tr class="sf-tc-mob-copy-row-${id}" style="display:none;">
          <td class="sf-tc-mob-copy-${id}" align="center" style="font-size:11px;color:${mColor};line-height:1.4;padding-top:14px;text-align:center;">
            ${copyrightText(p)}
          </td>
        </tr>
      </table>
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
  const lColor = linkCol(p, '#ffffff')
  const mColor = mutedCol(p, '#64748b')

  const linkHtml = links
    .map(
      (l, idx) => `
      <a href="${l.url}" style="color:${lColor};text-decoration:none;font-size:12px;font-weight:600;letter-spacing:0.3px;white-space:nowrap;line-height:1.4;display:inline-block;">
        ${l.label}
      </a>${idx < links.length - 1 ? `<span style="color:rgba(255,255,255,0.3);font-size:11px;user-select:none;">&bull;</span>` : ''}`
    )
    .join('\n')

  return `<!--[riazify:store_footer:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .sf-tsp-table-${id} {
      width: 100% !important;
      min-width: 100% !important;
    }
    .sf-tsp-top-${id} {
      padding: 14px 12px !important;
    }
    .sf-tsp-links-${id} {
      gap: 8px 12px !important;
    }
    .sf-tsp-bottom-${id} {
      padding: 14px 12px !important;
      text-align: center !important;
    }
    .sf-tsp-bottom-wrap-${id} {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      gap: 10px !important;
      width: 100% !important;
    }
    .sf-tsp-tokens-${id} {
      display: flex !important;
      flex-wrap: wrap !important;
      justify-content: center !important;
      align-items: center !important;
      text-align: center !important;
      gap: 6px 10px !important;
      width: 100% !important;
    }
    .sf-tsp-copy-${id} {
      width: 100% !important;
      text-align: center !important;
      margin: 0 !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="sf-tsp-table-${id}"
  style="width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bg(p, '#1e1535')};border:1px solid #e2e8f0;padding:0;box-sizing:border-box;">

      <!-- Top Tier: Navigation Links -->
      <div class="sf-tsp-top-${id}" style="padding:16px 20px;text-align:center;box-sizing:border-box;">
        <div class="sf-tsp-links-${id}" style="display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:10px 14px;box-sizing:border-box;width:100%;">
          ${linkHtml}
        </div>
      </div>

      <!-- Divider -->
      <div style="height:1px;background-color:rgba(255,255,255,0.1);width:100%;"></div>

      <!-- Bottom Tier: Secure Badges & Buyer Confidence Strip -->
      <div class="sf-tsp-bottom-${id}" style="background-color:#ffffff;padding:12px 20px;box-sizing:border-box;">
        <div class="sf-tsp-bottom-wrap-${id}" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;width:100%;box-sizing:border-box;">

          <!-- Guarantee Tokens (Clean Vector Icons) -->
          <div class="sf-tsp-tokens-${id}" style="display:flex;align-items:center;flex-wrap:wrap;gap:8px 12px;box-sizing:border-box;">

            <!-- Token 1: eBay Money Back Guarantee -->
            <span style="font-size:11px;font-weight:700;color:#16a34a;display:inline-flex;align-items:center;white-space:nowrap;">
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:-2px;margin-right:4px;">
                <path d="M10 2L3 5v5c0 4.5 3.1 8.7 7 9.8 3.9-1.1 7-5.3 7-9.8V5l-7-3z" fill="#16a34a" fill-opacity="0.18" stroke="#16a34a" stroke-width="1.6" stroke-linejoin="round"/>
                <path d="M7 10l2 2 4-4" stroke="#16a34a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              eBay Money Back Guarantee
            </span>

            <span style="color:#cbd5e1;font-size:10px;">&bull;</span>

            <!-- Token 2: 256-Bit SSL Encrypted -->
            <span style="font-size:11px;font-weight:700;color:#0369a1;display:inline-flex;align-items:center;white-space:nowrap;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0369a1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:4px;">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="#0369a1" fill-opacity="0.15"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              256-Bit SSL Encrypted
            </span>

            <span style="color:#cbd5e1;font-size:10px;">&bull;</span>

            <!-- Token 3: Tracked Dispatch -->
            <span style="font-size:11px;font-weight:700;color:#d97706;display:inline-flex;align-items:center;white-space:nowrap;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:4px;">
                <path d="M5 18H3c-.6 0-1-.4-1-1V5c0-.6.4-1 1-1h11c.6 0 1 .4 1 1v4"/>
                <path d="M14 9h4.5l3.5 4.5V17c0 .6-.4 1-1 1h-2"/>
                <circle cx="7" cy="18" r="2"/>
                <circle cx="17" cy="18" r="2"/>
              </svg>
              Tracked Dispatch
            </span>

          </div>

          <!-- Copyright Line -->
          <div class="sf-tsp-copy-${id}" style="font-size:11px;color:${mColor};line-height:1.3;box-sizing:border-box;white-space:nowrap;">
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
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#1e1535')};${pad(p, 22, 24, 20, 24)}text-align:center;box-sizing:border-box;">
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
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#0f172a')};${pad(p, 26, 24, 22, 24)}border:1px solid #1e293b;text-align:center;box-sizing:border-box;">
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
<style>
  @media only screen and (max-width: 680px) {
    .sf-mg-table-${id} {
      width: 100% !important;
      min-width: 100% !important;
    }
    .sf-mg-pad-${id} {
      padding: 20px 14px !important;
      text-align: center !important;
    }
    .sf-mg-row-${id} {
      display: block !important;
      width: 100% !important;
    }
    .sf-mg-left-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 0 14px 0 !important;
    }
    .sf-mg-brand-${id} {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      margin: 0 auto !important;
    }
    .sf-mg-desk-copy-${id} {
      display: none !important;
    }
    .sf-mg-right-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 !important;
    }
    .sf-mg-links-${id} {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      flex-wrap: wrap !important;
      gap: 6px 8px !important;
      width: 100% !important;
    }
    .sf-mg-mob-copy-row-${id} {
      display: table-row !important;
      width: 100% !important;
    }
    .sf-mg-mob-copy-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding-top: 14px !important;
      border-top: 1px solid rgba(255,255,255,0.08) !important;
      margin-top: 14px !important;
      box-sizing: border-box !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="sf-mg-table-${id}"
  style="width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td class="sf-mg-pad-${id}" style="background-color:${bg(p, '#1e1535')};${pad(p, 24, 26, 22, 26)}border:1px solid rgba(255,255,255,0.15);border-radius:0;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
        <tr class="sf-mg-row-${id}">

          <!-- Left Column (Desktop): Brand Title & Glowing Dot -->
          <td class="sf-mg-left-${id}" valign="middle" align="left">
            <div class="sf-mg-brand-${id}" style="display:flex;align-items:center;gap:7px;margin-bottom:6px;">
              <span style="display:inline-block;width:7px;height:7px;background-color:#4ade80;border-radius:50%;box-shadow:0 0 6px #4ade80;vertical-align:middle;"></span>
              <span style="font-size:16px;font-weight:900;color:#ffffff;letter-spacing:-0.2px;line-height:1.2;">
                ${sName}
              </span>
            </div>
            <!-- Desktop-Only Copyright -->
            <div class="sf-mg-desk-copy-${id}" style="font-size:11px;color:${mColor};line-height:1.4;margin:0;">
              ${copyrightText(p)}
            </div>
          </td>

          <!-- Right Column (Desktop): Frosted Glassmorphic Link Cards -->
          <td class="sf-mg-right-${id}" valign="middle" align="right">
            <div class="sf-mg-links-${id}" style="display:flex;justify-content:flex-end;align-items:center;flex-wrap:wrap;gap:6px 8px;">
              ${linkHtml}
            </div>
          </td>

        </tr>

        <!-- Mobile-Only Copyright Row (Shows Down at the Bottom) -->
        <tr class="sf-mg-mob-copy-row-${id}" style="display:none;">
          <td class="sf-mg-mob-copy-${id}" align="center" style="font-size:11px;color:${mColor};line-height:1.4;padding-top:14px;text-align:center;">
            ${copyrightText(p)}
          </td>
        </tr>
      </table>
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
<style>
  @media only screen and (max-width: 680px) {
    .sf-wc-table-${id} {
      width: 100% !important;
      min-width: 100% !important;
    }
    .sf-wc-top-${id} {
      padding: 14px 14px !important;
      text-align: center !important;
    }
    .sf-wc-top-title-${id} {
      text-align: center !important;
    }
    .sf-wc-top-desc-${id} {
      text-align: center !important;
      font-size: 11px !important;
      line-height: 1.45 !important;
    }
    .sf-wc-bottom-${id} {
      padding: 14px 12px !important;
      text-align: center !important;
    }
    .sf-wc-bottom-wrap-${id} {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      gap: 10px !important;
      width: 100% !important;
    }
    .sf-wc-links-${id} {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      flex-wrap: wrap !important;
      gap: 8px 12px !important;
      width: 100% !important;
      text-align: center !important;
    }
    .sf-wc-copy-${id} {
      width: 100% !important;
      text-align: center !important;
      margin: 0 !important;
      padding-top: 4px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="sf-wc-table-${id}"
  style="width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bg(p, '#ffffff')};border:1px solid #cbd5e1;border-radius:0;overflow:hidden;padding:0;box-sizing:border-box;">

      <!-- Top Compliance Banner -->
      <div class="sf-wc-top-${id}" style="background-color:#f1f5f9;padding:12px 18px;border-bottom:1px solid #e2e8f0;box-sizing:border-box;">
        <div class="sf-wc-top-title-${id}" style="font-size:11px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;line-height:1.2;">
          Commercial Terms &amp; Compliance Statement
        </div>
        <div class="sf-wc-top-desc-${id}" style="font-size:10.5px;color:#64748b;line-height:1.4;margin:0;">
          All items guaranteed authentic, factory-sealed, and sourced through authorized supply channels. Strict MAP policies maintained. For commercial volume pricing, VAT invoicing, or bulk inquiries, please contact our merchant desk.
        </div>
      </div>

      <!-- Bottom Navigation & Entity Row -->
      <div class="sf-wc-bottom-${id}" style="padding:14px 18px;background-color:#fafafa;box-sizing:border-box;">
        <div class="sf-wc-bottom-wrap-${id}" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;width:100%;box-sizing:border-box;">

          <!-- Links (Centered on Mobile) -->
          <div class="sf-wc-links-${id}" style="display:flex;align-items:center;flex-wrap:wrap;gap:8px 12px;box-sizing:border-box;">
            ${linkHtml}
          </div>

          <!-- Legal Entity (Shows Down at the Bottom) -->
          <div class="sf-wc-copy-${id}" style="font-size:10.5px;color:#64748b;letter-spacing:0.2px;line-height:1.3;box-sizing:border-box;white-space:nowrap;">
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
// Clean white 3-column guarantee footer with vector icons & compact mobile spacing.
// ─────────────────────────────────────────────────────────────────────────────
function spotlightPolicy(p: any, id: string): string {
  const f = font(p)
  const links = getLinks(p)
  const lColor = '#1e293b'
  const mColor = '#64748b'

  const linkHtml = links
    .map(
      (l, idx) => `
      <a href="${l.url}" style="color:${lColor};text-decoration:none;font-size:12px;font-weight:600;letter-spacing:0.2px;white-space:nowrap;line-height:1.3;display:inline-block;">
        ${l.label}
      </a>${idx < links.length - 1 ? `<span style="color:#cbd5e1;font-size:11px;user-select:none;">&bull;</span>` : ''}`
    )
    .join('\n')

  return `<!--[riazify:store_footer:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .sf-sp-table-${id} {
      width: 100% !important;
      min-width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
    }
    .sf-sp-grid-${id} {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: flex-start !important;
      gap: 12px !important;
      padding: 14px 12px !important;
      height: auto !important;
      min-height: 0 !important;
    }
    .sf-sp-col-${id} {
      flex: 0 0 auto !important;
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
      height: auto !important;
      min-height: 0 !important;
      padding: 2px 0 !important;
      margin: 0 !important;
      text-align: center !important;
    }
    .sf-sp-bottom-${id} {
      padding: 12px 10px !important;
      text-align: center !important;
    }
    .sf-sp-bottom-wrap-${id} {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      gap: 8px !important;
      width: 100% !important;
    }
    .sf-sp-links-${id} {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      flex-wrap: wrap !important;
      gap: 8px 12px !important;
      width: 100% !important;
      text-align: center !important;
    }
    .sf-sp-copy-${id} {
      width: 100% !important;
      text-align: center !important;
      margin: 0 !important;
      font-size: 11px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="sf-sp-table-${id}"
  style="width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:0;padding:0;box-sizing:border-box;">

      <!-- 3-Column Policy Guarantees Grid (Compact on Mobile) -->
      <div class="sf-sp-grid-${id}" style="padding:18px 20px 14px 20px;box-sizing:border-box;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:14px;width:100%;">

        <!-- Feature 1: Fast & Free Shipping -->
        <div class="sf-sp-col-${id}" style="flex:1 1 180px;min-width:160px;text-align:center;box-sizing:border-box;">
          <div style="margin-bottom:4px;line-height:1;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;">
              <path d="M5 18H3c-.6 0-1-.4-1-1V5c0-.6.4-1 1-1h11c.6 0 1 .4 1 1v4"/>
              <path d="M14 9h4.5l3.5 4.5V17c0 .6-.4 1-1 1h-2"/>
              <circle cx="7" cy="18" r="2"/>
              <circle cx="17" cy="18" r="2"/>
            </svg>
          </div>
          <div style="font-size:12px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;line-height:1.2;">
            Fast &amp; Free Shipping
          </div>
          <div style="font-size:11px;color:#64748b;line-height:1.3;margin:0;">
            Tracked dispatch within 24h
          </div>
        </div>

        <!-- Feature 2: 30-Day Easy Returns -->
        <div class="sf-sp-col-${id}" style="flex:1 1 180px;min-width:160px;text-align:center;box-sizing:border-box;">
          <div style="margin-bottom:4px;line-height:1;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
          </div>
          <div style="font-size:12px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;line-height:1.2;">
            30-Day Easy Returns
          </div>
          <div style="font-size:11px;color:#64748b;line-height:1.3;margin:0;">
            Hassle-free money back guarantee
          </div>
        </div>

        <!-- Feature 3: 100% Authentic & Tested -->
        <div class="sf-sp-col-${id}" style="flex:1 1 180px;min-width:160px;text-align:center;box-sizing:border-box;">
          <div style="margin-bottom:4px;line-height:1;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
          <div style="font-size:12px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;line-height:1.2;">
            100% Authentic &amp; Tested
          </div>
          <div style="font-size:11px;color:#64748b;line-height:1.3;margin:0;">
            eBay Buyer Protection covered
          </div>
        </div>

      </div>

      <!-- Divider -->
      <div style="height:1px;background-color:#e2e8f0;width:100%;"></div>

      <!-- Bottom Links & Legal -->
      <div class="sf-sp-bottom-${id}" style="background-color:#f8fafc;padding:12px 20px;box-sizing:border-box;">
        <div class="sf-sp-bottom-wrap-${id}" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;width:100%;box-sizing:border-box;">

          <!-- Links (Centered on Mobile) -->
          <div class="sf-sp-links-${id}" style="display:flex;align-items:center;flex-wrap:wrap;gap:8px 12px;box-sizing:border-box;">
            ${linkHtml}
          </div>

          <!-- Copyright (Shows Down at the Bottom) -->
          <div class="sf-sp-copy-${id}" style="font-size:11px;color:${mColor};line-height:1.3;box-sizing:border-box;white-space:nowrap;">
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
<style>
  @media only screen and (max-width: 768px) {
    .sf-el-table-${id} {
      width: 100% !important;
      min-width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
    }
    .sf-el-pad-${id} {
      padding: 20px 14px 18px 14px !important;
    }
    .sf-el-links-${id} {
      gap: 8px 12px !important;
      width: 100% !important;
    }
    .sf-el-line-${id} {
      width: 80% !important;
      max-width: 260px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="sf-el-table-${id}"
  style="width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td class="sf-el-pad-${id}" style="background-color:#ffffff;padding:26px 20px 22px 20px;border:1px solid #e5e7eb;border-top:3px solid ${gold};border-radius:0;text-align:center;box-sizing:border-box;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:100%;box-sizing:border-box;">

        <!-- Top Emblem -->
        <div style="font-size:10.5px;font-weight:700;color:${gold};text-transform:uppercase;letter-spacing:2.5px;line-height:1;">
          &#10022; ${sName} &bull; OFFICIAL BOUTIQUE &#10022;
        </div>

        <!-- Framing Line Above -->
        <div class="sf-el-line-${id}" style="height:1px;background-color:#e5e7eb;width:50%;max-width:280px;"></div>

        <!-- Center Links -->
        <div class="sf-el-links-${id}" style="display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:10px 16px;box-sizing:border-box;width:100%;">
          ${linkHtml}
        </div>

        <!-- Framing Line Below -->
        <div class="sf-el-line-${id}" style="height:1px;background-color:#e5e7eb;width:50%;max-width:280px;"></div>

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
