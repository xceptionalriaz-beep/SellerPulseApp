// components/ui/VisualEditor/variants/seller_info.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Seller Info — 10 layout variants  (all email-safe, mobile-responsive via @media)
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockVariant } from './hero_header.variants'
import type { SellerInfoProps } from '../blocks'

// ── Shared helpers ────────────────────────────────────────────────────────────

function pad(p: SellerInfoProps): string {
  return `padding-top:${p.paddingTop ?? 16}px;padding-bottom:${p.paddingBottom ?? 16}px;padding-left:${p.paddingLeft ?? 24}px;padding-right:${p.paddingRight ?? 24}px;`
}

function ac(p: SellerInfoProps): string {
  return p.accentColor ?? '#7530fb'
}

function txt(p: SellerInfoProps): string {
  return p.textColor ?? '#1e1535'
}

function bg(p: SellerInfoProps): string {
  return p.bgColor ?? '#f8f7ff'
}

function badge(p: SellerInfoProps): string {
  if (!p.showBadge) return ''
  return `<span style="display:inline-block;background-color:#b8fa33;color:#1e1535;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;padding:3px 9px;border-radius:4px;margin-left:8px;vertical-align:middle;letter-spacing:0.03em;">${p.badgeText ?? 'Top Rated Seller'}</span>`
}

const SAMPLE_LOGO_URL = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&auto=format&fit=crop&q=80'

function renderSellerAvatar(
  p: any,
  size: number,
  shape: 'circle' | 'rounded' = 'circle',
  extraWrapStyle: string = ''
): string {
  const sellerDisplayName = p.sellerName && !p.sellerName.includes('{{') ? p.sellerName : 'Trusted Seller'
  const logoUrl = p.logoUrl || p.avatarUrl || SAMPLE_LOGO_URL
  const borderRadius = shape === 'circle' ? '50%' : '10px'

  return `<div data-slot="logo" data-slot-type="image" data-prop="logoUrl" data-tab="image" data-open-tab="image" data-label="Store Logo" title="Click to replace logo" style="display:inline-block;cursor:pointer;position:relative;width:${size}px;height:${size}px;border-radius:${borderRadius};vertical-align:middle;box-sizing:border-box;background-color:#ffffff;line-height:0;${extraWrapStyle}">
    <img src="${logoUrl}" alt="${sellerDisplayName}" style="width:100%;height:100%;border-radius:${borderRadius};object-fit:cover;display:block;box-sizing:border-box;margin:0;padding:0;" />
  </div>`
}

function mobileStyle(): string {
  return `<style>
@media only screen and (max-width:680px){
  .si-table{width:100%!important;min-width:100%!important;}
  .si-pad{padding:14px 10px!important;}
  .si-col{display:block!important;width:100%!important;text-align:center!important;}
  .si-avatar{margin:0 auto 10px!important;text-align:center!important;width:100%!important;}
  .si-avatar table{margin:0 auto!important;}
  .si-right{padding-left:0!important;padding-top:6px!important;text-align:center!important;}
  .si-metrics{margin:0 auto!important;width:100%!important;text-align:center!important;}
  .si-metrics tr{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;align-items:center!important;gap:4px 10px!important;}
  .si-metrics td{display:inline-block!important;padding:2px 4px!important;text-align:center!important;}
  .si-grid-cell{display:block!important;width:100%!important;padding-bottom:12px!important;}
  .si-card{display:block!important;width:100%!important;margin-bottom:10px!important;}
  .si-hide{display:none!important;}
  .si-center-mobile{text-align:center!important;}
}
</style>`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 1 — authority-split
// Two-column: avatar/logo left + store identity + metrics right (Centered on Mobile)
// ─────────────────────────────────────────────────────────────────────────────
function authoritySplit(p: SellerInfoProps, id: string): string {
  const accent = ac(p)
  const text = txt(p)
  const background = bg(p)
  const sellerDisplayName = p.sellerName && !p.sellerName.includes('{{') ? p.sellerName : 'Trusted Seller'

  return `${mobileStyle()}
<!--[riazify:seller_info:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="si-table"
  style="width:100% !important;min-width:100% !important;background-color:${background};border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
  <tr>
    <td class="si-pad" style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Avatar: Centered with its TOP RATED pill on Mobile -->
          <td class="si-col si-avatar" valign="top" style="width:90px;text-align:center;">
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
              <tr>
                <td style="width:72px;height:72px;text-align:center;vertical-align:middle;">
                  ${renderSellerAvatar(p, 72, 'circle')}
                </td>
              </tr>
              <tr>
                <td style="text-align:center;padding-top:6px;">
                  <span style="display:inline-block;background-color:#b8fa33;color:#1e1535;font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px;">TOP RATED</span>
                </td>
              </tr>
            </table>
          </td>
          <!-- Details: Centered on Mobile -->
          <td class="si-col si-right" valign="middle" style="padding-left:16px;">
            <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:${text};">
              ${sellerDisplayName}${badge(p)}
            </p>
            <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7280;">
              ${p.tagline ?? 'Trusted eBay Seller Since 2010'}
            </p>
            <!-- Metrics: Centered row with feedback and authorized partner -->
            <table class="si-metrics" cellpadding="0" cellspacing="0" border="0" align="left" style="margin:0;">
              <tr>
                <td style="padding-right:16px;">
                  <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:${accent};">&#9733; ${p.feedbackText ?? '99.8% Positive Feedback'}</span>
                </td>
                <td>
                  <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#6b7280;">Authorized Retailer Partner</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:seller_info:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 2 — inline-ribbon
// Single-row sleek horizontal ribbon (Clean responsive stack on mobile)
// ─────────────────────────────────────────────────────────────────────────────
function inlineRibbon(p: SellerInfoProps, id: string): string {
  const accent = ac(p)
  const text = txt(p)
  const background = bg(p)
  const sellerDisplayName = p.sellerName && !p.sellerName.includes('{{') ? p.sellerName : 'Trusted Seller'

  return `${mobileStyle()}
<!--[riazify:seller_info:${id}]-->
<style>
  @media only screen and (max-width:680px){
    .sir-container-${id} {
      width: 100% !important;
      min-width: 100% !important;
    }
    .sir-pad-${id} {
      padding: 12px 10px !important;
      text-align: center !important;
    }
    .sir-tr-${id} {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 5px !important;
      width: 100% !important;
    }
    .sir-cell-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 !important;
    }
    .sir-dot-${id} {
      display: none !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="sir-container-${id}"
  style="width:100% !important;min-width:100% !important;background-color:${background};border-left:4px solid ${accent};border:1px solid #e5e7eb;border-left-width:4px;border-radius:4px;">
  <tr>
    <td class="sir-pad-${id}" style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
        <tr class="sir-tr-${id}">
          <!-- Identity Line: Icon + Store Name + Top Rated Badge -->
          <td class="sir-cell-${id}" valign="middle" style="padding-right:10px;">
            <span style="display:inline-block;vertical-align:middle;margin-right:8px;">
              <svg width="18" height="20" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">
                <path d="M10 1L2 4.5V10C2 14.5 5.5 18.7 10 20C14.5 18.7 18 14.5 18 10V4.5L10 1Z" fill="${accent}" opacity="0.15" stroke="${accent}" stroke-width="1.5" stroke-linejoin="round"/>
                <path d="M7 11L9 13L13 9" stroke="${accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${text};vertical-align:middle;">${sellerDisplayName}</span>
            <span style="display:inline-block;vertical-align:middle;">${badge(p)}</span>
          </td>
          <!-- Dot Separator (Desktop only) -->
          <td class="sir-dot-${id}" valign="middle" style="padding-right:10px;color:#d1d5db;font-size:16px;">&bull;</td>
          <!-- Tagline -->
          <td class="sir-cell-${id}" valign="middle" style="padding-right:10px;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7280;">${p.tagline ?? 'Trusted eBay Seller Since 2010'}</span>
          </td>
          <!-- Dot Separator (Desktop only) -->
          <td class="sir-dot-${id}" valign="middle" style="padding-right:10px;color:#d1d5db;font-size:16px;">&bull;</td>
          <!-- Feedback Metric -->
          <td class="sir-cell-${id}" valign="middle" style="padding-right:10px;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:${accent};">&#9733; ${p.feedbackText ?? '99.8% Positive Feedback'}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:seller_info:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 3 — metrics-grid
// Header + 3-column stat grid (feedback / shipping / support)
// ─────────────────────────────────────────────────────────────────────────────
function metricsGrid(p: SellerInfoProps, id: string): string {
  const accent = ac(p)
  const text = txt(p)
  const background = bg(p)
  return `${mobileStyle()}
<!--[riazify:seller_info:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;background-color:${background};border:1px solid #e5e7eb;border-radius:8px;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
        <tr>
          <td>
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:${text};">${p.sellerName ?? '{{SELLER_NAME}}'}</span>
            <span style="display:inline-block;background-color:${accent};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;padding:2px 9px;border-radius:4px;margin-left:8px;vertical-align:middle;">VERIFIED BUSINESS SELLER</span>
          </td>
        </tr>
        <tr>
          <td style="padding-top:4px;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#6b7280;">${p.tagline ?? 'Trusted eBay Seller Since 2010'}</span>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="si-grid-cell" valign="top" style="width:33.33%;padding-right:8px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
              style="background-color:#ffffff;border:1px solid #e5e7eb;border-top:3px solid ${accent};border-radius:6px;">
              <tr>
                <td style="padding:12px;text-align:center;">
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:${accent};">&#9733;</div>
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${text};padding:4px 0;">${p.feedbackText ?? '99.8% Positive'}</div>
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#6b7280;">Feedback Score</div>
                </td>
              </tr>
            </table>
          </td>
          <td class="si-grid-cell" valign="top" style="width:33.33%;padding-right:8px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
              style="background-color:#ffffff;border:1px solid #e5e7eb;border-top:3px solid #b8fa33;border-radius:6px;">
              <tr>
                <td style="padding:12px;text-align:center;">
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:22px;color:#5a7a00;">&#9889;</div>
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${text};padding:4px 0;">Same Day Dispatch</div>
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#6b7280;">Shipping Speed</div>
                </td>
              </tr>
            </table>
          </td>
          <td class="si-grid-cell" valign="top" style="width:33.33%;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
              style="background-color:#ffffff;border:1px solid #e5e7eb;border-top:3px solid #10b981;border-radius:6px;">
              <tr>
                <td style="padding:12px;text-align:center;">
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:22px;color:#10b981;">&#128172;</div>
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${text};padding:4px 0;">24/7 Response</div>
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#6b7280;">Customer Support</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:seller_info:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 4 — dark-executive
// Dark premium profile — charcoal bg, neon accent border (Full-Width on Mobile)
// ─────────────────────────────────────────────────────────────────────────────
function darkExecutive(p: SellerInfoProps, id: string): string {
  const accent = ac(p)
  const sellerDisplayName = p.sellerName && !p.sellerName.includes('{{') ? p.sellerName : 'Trusted Seller'

  return `${mobileStyle()}
<!--[riazify:seller_info:${id}]-->
<style>
  @media only screen and (max-width:680px){
    .si-de-pad-${id} {
      padding: 16px 12px !important;
      text-align: center !important;
    }
    .si-de-btn-${id} {
      padding-left: 0 !important;
      padding-top: 12px !important;
      text-align: center !important;
    }
    .si-de-badges-${id} {
      margin: 0 auto !important;
    }
    .si-de-badges-${id} tr {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 6px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="si-table"
  style="width:100% !important;min-width:100% !important;background-color:#1e1535;border:1px solid ${accent};border-radius:8px;overflow:hidden;">
  <tr>
    <td class="si-de-pad-${id}" style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Avatar Circle: Centered on Mobile -->
          <td class="si-col si-avatar" valign="middle" style="width:64px;text-align:center;">
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
              <tr>
                <td style="width:56px;height:56px;text-align:center;vertical-align:middle;">
                  ${renderSellerAvatar(p, 56, 'circle')}
                </td>
              </tr>
            </table>
          </td>
          <!-- Details & Badges: Centered on Mobile -->
          <td class="si-col si-right" valign="middle" style="padding-left:16px;">
            <p style="margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:700;color:#ffffff;">
              ${sellerDisplayName}
            </p>
            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#a0a0b8;">
              ${p.tagline ?? 'Trusted eBay Seller Since 2010'}
            </p>
            <table class="si-de-badges-${id}" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-right:8px;">
                  <span style="display:inline-block;background-color:rgba(184,250,51,0.15);border:1px solid #b8fa33;color:#b8fa33;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;">
                    &#10003; ${p.feedbackText ?? '99.8% Positive Feedback'}
                  </span>
                </td>
                ${p.showBadge ? `<td><span style="display:inline-block;background-color:${accent};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;">${p.badgeText ?? 'Top Rated Seller'}</span></td>` : ''}
              </tr>
            </table>
          </td>
          <!-- Visit Store CTA: Right on desktop, centered bottom on mobile -->
          <td class="si-col si-de-btn-${id}" valign="middle" style="text-align:right;padding-left:12px;">
            <a href="https://www.ebay.com/str/{{SELLER_NAME}}" style="display:inline-block;background-color:transparent;border:1px solid ${accent};color:${accent};font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;padding:7px 18px;border-radius:4px;text-decoration:none;">Visit Store &#8594;</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:seller_info:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 5 — storefront-split
// Left: store identity. Right: bullet guarantee list (Full-width & responsive)
// ─────────────────────────────────────────────────────────────────────────────
function storefrontSplit(p: SellerInfoProps, id: string): string {
  const accent = ac(p)
  const text = txt(p)
  const background = bg(p)
  const sellerDisplayName = p.sellerName && !p.sellerName.includes('{{') ? p.sellerName : 'Trusted Seller'

  return `${mobileStyle()}
<!--[riazify:seller_info:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .si-sf-table-${id} {
      width: 100% !important;
      min-width: 100% !important;
    }
    .si-sf-pad-${id} {
      padding: 16px 14px !important;
    }
    .si-sf-left-${id} {
      display: block !important;
      width: 100% !important;
      border-right: none !important;
      border-bottom: 1px solid #e5e7eb !important;
      padding-right: 0 !important;
      padding-bottom: 14px !important;
      text-align: center !important;
    }
    .si-sf-left-inner-${id} {
      margin: 0 auto !important;
      text-align: center !important;
    }
    .si-sf-avatar-wrap-${id} {
      margin: 0 auto 10px auto !important;
      display: inline-block !important;
    }
    .si-sf-right-${id} {
      display: block !important;
      width: 100% !important;
      padding-left: 0 !important;
      padding-top: 14px !important;
      text-align: center !important;
    }
    .si-sf-benefits-table-${id} {
      margin: 0 auto !important;
      display: inline-table !important;
      text-align: left !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="si-table si-sf-table-${id}"
  style="width:100% !important;min-width:100% !important;background-color:${background};border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;box-sizing:border-box;">
  <tr>
    <td class="si-pad si-sf-pad-${id}" style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100% !important;">
        <tr>
          <!-- LEFT: Store Identity & Rating -->
          <td class="si-col si-sf-left-${id}" valign="middle" style="width:50%;padding-right:20px;border-right:1px solid #e5e7eb;box-sizing:border-box;">
            <table class="si-sf-left-inner-${id}" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;">
              <tr>
                <td style="padding-bottom:8px;text-align:inherit;">
                  <div class="si-sf-avatar-wrap-${id}">
                    ${renderSellerAvatar(p, 48, 'rounded')}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="text-align:inherit;">
                  <p style="margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:${text};line-height:1.2;">
                    ${sellerDisplayName}${badge(p)}
                  </p>
                  <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#6b7280;line-height:1.3;">
                    ${p.tagline ?? 'Trusted eBay Seller Since 2010'}
                  </p>
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:${accent};line-height:1.2;">
                    &#9733; ${p.feedbackText ?? '99.8% Positive Feedback'}
                  </p>
                </td>
              </tr>
            </table>
          </td>

          <!-- RIGHT: Four Trust Guarantees -->
          <td class="si-col si-sf-right-${id}" valign="middle" style="width:50%;padding-left:20px;box-sizing:border-box;">
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">
              Why Buy From Us?
            </div>
            <table class="si-sf-benefits-table-${id}" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;">
              <tr>
                <td style="padding-bottom:6px;vertical-align:middle;">
                  <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${text};display:inline-block;">
                    <span style="color:#10b981;font-weight:700;">&#10003;</span>&nbsp; 100% Authentic Products
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom:6px;vertical-align:middle;">
                  <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${text};display:inline-block;">
                    <span style="color:#10b981;font-weight:700;">&#10003;</span>&nbsp; Fast &amp; Secure Fulfilment
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom:6px;vertical-align:middle;">
                  <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${text};display:inline-block;">
                    <span style="color:#10b981;font-weight:700;">&#10003;</span>&nbsp; Hassle-Free Returns
                  </span>
                </td>
              </tr>
              <tr>
                <td style="vertical-align:middle;">
                  <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${text};display:inline-block;">
                    <span style="color:#10b981;font-weight:700;">&#10003;</span>&nbsp; 24/7 Customer Support
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:seller_info:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 6 — glass-card
// Frosted glassmorphism floating card — soft gradient bg + avatar + pill
// ─────────────────────────────────────────────────────────────────────────────
function glassCard(p: SellerInfoProps, id: string): string {
  const accent = ac(p)
  const text = txt(p)
  return `${mobileStyle()}
<!--[riazify:seller_info:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;background:linear-gradient(135deg,${accent} 0%,#1e1535 100%);border-radius:12px;padding:3px;">
  <tr>
    <td>
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:rgba(255,255,255,0.92);border-radius:10px;border:1px solid rgba(255,255,255,0.7);">
        <tr>
          <td style="text-align:center;padding:24px 24px 0;">
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
              <tr>
                <td style="text-align:center;padding:0;">
                  ${renderSellerAvatar(p, 68, 'circle', `border:3px solid #ffffff;box-shadow:0 0 0 3px ${accent}44;`)}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="text-align:center;padding:14px 24px 0;">
            <p style="margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:700;color:${text};">${p.sellerName ?? '{{SELLER_NAME}}'}</p>
            <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#6b7280;">${p.tagline ?? 'Trusted eBay Seller Since 2010'}</p>
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 10px;">
              <tr>
                <td style="background-color:${accent};border-radius:20px;padding:5px 18px;">
                  <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#ffffff;">&#9733; ${p.feedbackText ?? '99.8% Positive Feedback'}</span>
                </td>
                ${p.showBadge ? `<td style="padding-left:8px;"><span style="display:inline-block;background-color:#b8fa33;color:#1e1535;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;padding:5px 12px;border-radius:20px;">${p.badgeText ?? 'Top Rated Seller'}</span></td>` : ''}
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 16px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
              style="background-color:rgba(117,48,251,0.06);border-radius:8px;border:1px solid ${accent}22;">
              <tr>
                <td style="padding:10px 12px;text-align:center;line-height:1.7;">
                  <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${text};opacity:0.85;display:inline-block;">

                    <!-- Authorized Retailer (Shield Check Icon) -->
                    <span style="display:inline-block;white-space:nowrap;margin:0 4px;vertical-align:middle;">
                      <svg width="13" height="13" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:-2px;margin-right:4px;">
                        <path d="M10 2L3 5v5c0 4.5 3.1 8.7 7 9.8 3.9-1.1 7-5.3 7-9.8V5l-7-3z" fill="${accent}" fill-opacity="0.18" stroke="${accent}" stroke-width="1.6" stroke-linejoin="round"/>
                        <path d="M7 10l2 2 4-4" stroke="${accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Authorized Retailer
                    </span>

                    <span style="color:${accent};font-size:12px;vertical-align:middle;margin:0 3px;">&bull;</span>

                    <!-- Fast Dispatch (Clean Delivery Truck Icon - 100% matches others) -->
                    <span style="display:inline-block;white-space:nowrap;margin:0 4px;vertical-align:middle;">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:-2px;margin-right:4px;">
                        <path d="M5 18H3c-.6 0-1-.4-1-1V5c0-.6.4-1 1-1h11c.6 0 1 .4 1 1v4" stroke="${accent}" stroke-width="1.8" stroke-linecap="round"/>
                        <path d="M14 9h4.5l3.5 4.5V17c0 .6-.4 1-1 1h-2" stroke="${accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="7" cy="18" r="2" stroke="${accent}" stroke-width="1.8"/>
                        <circle cx="17" cy="18" r="2" stroke="${accent}" stroke-width="1.8"/>
                      </svg>
                      Fast Dispatch
                    </span>

                    <span style="color:${accent};font-size:12px;vertical-align:middle;margin:0 3px;">&bull;</span>

                    <!-- Easy Returns (Circular Return Icon) -->
                    <span style="display:inline-block;white-space:nowrap;margin:0 4px;vertical-align:middle;">
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:-2px;margin-right:4px;">
                        <path d="M3.5 8.5h8.5a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4H5" stroke="${accent}" stroke-width="1.6" stroke-linecap="round"/>
                        <path d="M6.5 5.5L3.5 8.5l3 3" stroke="${accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Easy Returns
                    </span>

                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:seller_info:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 7 — vertical-profile (Tall Store Card)
// Centered vertical stack with full-width CTA button
// ─────────────────────────────────────────────────────────────────────────────
function verticalProfile(p: SellerInfoProps, id: string): string {
  const accent = ac(p)
  const text = txt(p)
  const background = bg(p)
  const sellerDisplayName = p.sellerName && !p.sellerName.includes('{{') ? p.sellerName : 'Trusted Seller'
  const avatarLetter = (p.sellerName && !p.sellerName.includes('{{') ? p.sellerName.charAt(0) : 'S').toUpperCase()

  return `${mobileStyle()}
<!--[riazify:seller_info:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="si-table"
  style="width:100% !important;min-width:100% !important;background-color:${background};border:1px solid #e5e7eb;border-radius:8px;box-sizing:border-box;">
  <tr>
    <td class="si-pad" style="${pad(p)};text-align:center;">
      <!-- Avatar: fixed 72x72 table cell forces true circle -->
      <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 12px;">
        <tr>
          <td style="text-align:center;padding:0;">
            ${renderSellerAvatar(p, 72, 'circle', `border:3px solid #ffffff;box-shadow:0 0 0 3px ${accent}44;`)}
          </td>
        </tr>
      </table>
      <!-- Store name -->
      <p style="margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:${text};">${sellerDisplayName}</p>
      <!-- Tagline -->
      <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#6b7280;">${p.tagline ?? 'Trusted eBay Seller Since 2010'}</p>
      <!-- Accent divider line -->
      <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 14px;">
        <tr>
          <td width="40" height="2" style="width:40px;height:2px;background-color:${accent};border-radius:1px;font-size:0;line-height:0;">&nbsp;</td>
        </tr>
      </table>
      <!-- Feedback pill -->
      <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 8px;">
        <tr>
          <td style="background-color:${accent};border-radius:20px;padding:5px 18px;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#ffffff;">&#9733; ${p.feedbackText ?? '99.8% Positive Feedback'}</span>
          </td>
        </tr>
      </table>
      ${p.showBadge ? `
      <!-- Badge pill -->
      <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 14px;">
        <tr>
          <td style="background-color:#b8fa33;border-radius:20px;padding:3px 12px;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#1e1535;">${p.badgeText ?? 'Top Rated Seller'}</span>
          </td>
        </tr>
      </table>` : '<div style="height:14px;"></div>'}
      <!-- Store CTA Button (True Capsule Curve Pill) -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;margin:0 auto;border-collapse:separate;">
        <tr>
          <td align="center" style="width:100%;padding:0;border:none;background:transparent;">
            <a href="https://www.ebay.com/str/{{SELLER_NAME}}"
               style="display:block;width:100%;box-sizing:border-box;padding:11px 24px;border:1.5px solid ${accent};border-radius:50px;-webkit-border-radius:50px;-moz-border-radius:50px;background-color:transparent;color:${accent};font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;text-decoration:none;text-align:center;">
              View My eBay Store
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:seller_info:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 8 — trust-ribbon-duo
// Row 1: accent identity bar | Row 2: 4 trust chip pills (Vector Icons & Mobile Fix)
// ─────────────────────────────────────────────────────────────────────────────
function trustRibbonDuo(p: SellerInfoProps, id: string): string {
  const accent = ac(p)
  const text = txt(p)
  const background = bg(p)
  const sellerDisplayName = p.sellerName && !p.sellerName.includes('{{') ? p.sellerName : 'Trusted Seller'

  return `${mobileStyle()}
<!--[riazify:seller_info:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .si-trd-table-${id} {
      width: 100% !important;
      min-width: 100% !important;
    }
    .si-trd-head-row-${id} {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      gap: 6px !important;
      width: 100% !important;
    }
    .si-trd-head-left-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 !important;
    }
    .si-trd-head-right-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 !important;
    }
    .si-trd-chips-${id} tr {
      display: flex !important;
      flex-wrap: wrap !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 8px !important;
      width: 100% !important;
    }
    .si-trd-chip-${id} {
      display: inline-block !important;
      width: auto !important;
      padding: 0 !important;
      text-align: center !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="si-table si-trd-table-${id}"
  style="width:100% !important;min-width:100% !important;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;box-sizing:border-box;">

  <!-- Row 1: Brand Accent Bar -->
  <tr>
    <td style="background-color:${accent};padding:11px 20px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr class="si-trd-head-row-${id}">
          <td class="si-trd-head-left-${id}" valign="middle">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;vertical-align:middle;">${sellerDisplayName}</span>
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:rgba(255,255,255,0.8);margin-left:8px;vertical-align:middle;">${p.tagline ?? 'Trusted eBay Seller Since 2010'}</span>
          </td>
          <td class="si-trd-head-right-${id}" valign="middle" style="text-align:right;">
            ${p.showBadge ? `<span style="display:inline-block;background-color:#b8fa33;color:#1e1535;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;padding:3px 9px;border-radius:4px;vertical-align:middle;">${p.badgeText ?? 'Top Rated Seller'}</span>` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Row 2: Trust Chips (Vector SVG Icons) -->
  <tr>
    <td style="background-color:${background};padding:10px 16px;box-sizing:border-box;">
      <table class="si-trd-chips-${id}" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
        <tr>

          <!-- Chip 1: Feedback Star -->
          <td class="si-trd-chip-${id}" valign="middle" style="padding-right:6px;text-align:center;">
            <span style="display:inline-flex;align-items:center;background-color:#ffffff;border:1px solid #e5e7eb;color:${text};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;padding:5px 12px;border-radius:20px;box-shadow:0 1px 2px rgba(0,0,0,0.03);white-space:nowrap;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1" style="display:inline-block;vertical-align:middle;margin-right:5px;">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              ${p.feedbackText ?? '99.8% Positive Feedback'}
            </span>
          </td>

          <!-- Chip 2: Fast Dispatch -->
          <td class="si-trd-chip-${id}" valign="middle" style="padding-right:6px;text-align:center;">
            <span style="display:inline-flex;align-items:center;background-color:#ffffff;border:1px solid #e5e7eb;color:${text};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;padding:5px 12px;border-radius:20px;box-shadow:0 1px 2px rgba(0,0,0,0.03);white-space:nowrap;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:5px;">
                <path d="M5 18H3c-.6 0-1-.4-1-1V5c0-.6.4-1 1-1h11c.6 0 1 .4 1 1v4"/>
                <path d="M14 9h4.5l3.5 4.5V17c0 .6-.4 1-1 1h-2"/>
                <circle cx="7" cy="18" r="2"/>
                <circle cx="17" cy="18" r="2"/>
              </svg>
              Fast Dispatch
            </span>
          </td>

          <!-- Chip 3: 24/7 Support -->
          <td class="si-trd-chip-${id}" valign="middle" style="padding-right:6px;text-align:center;">
            <span style="display:inline-flex;align-items:center;background-color:#ffffff;border:1px solid #e5e7eb;color:${text};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;padding:5px 12px;border-radius:20px;box-shadow:0 1px 2px rgba(0,0,0,0.03);white-space:nowrap;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:5px;">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              24/7 Support
            </span>
          </td>

          <!-- Chip 4: Easy Returns -->
          <td class="si-trd-chip-${id}" valign="middle" style="text-align:center;">
            <span style="display:inline-flex;align-items:center;background-color:#ffffff;border:1px solid #e5e7eb;color:${text};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;padding:5px 12px;border-radius:20px;box-shadow:0 1px 2px rgba(0,0,0,0.03);white-space:nowrap;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:5px;">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
              Easy Returns
            </span>
          </td>

        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:seller_info:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 9 — spotlight-banner
// Full-width gradient hero strip — name + feedback left, CTA button right
// ─────────────────────────────────────────────────────────────────────────────
function spotlightBanner(p: SellerInfoProps, id: string): string {
  const accent = ac(p)
  const sellerDisplayName = p.sellerName && !p.sellerName.includes('{{') ? p.sellerName : 'Trusted Seller'

  return `${mobileStyle()}
<!--[riazify:seller_info:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .si-sb-table-${id} {
      width: 100% !important;
      min-width: 100% !important;
    }
    .si-sb-pad-${id} {
      padding: 18px 14px !important;
      text-align: center !important;
    }
    .si-sb-left-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 0 14px 0 !important;
    }
    .si-sb-right-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 !important;
    }
    .si-sb-btn-${id} {
      display: inline-block !important;
      width: auto !important;
      padding: 10px 24px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="si-table si-sb-table-${id}"
  style="width:100% !important;min-width:100% !important;background:linear-gradient(135deg,${accent} 0%,#1e1535 100%);border-radius:8px;box-sizing:border-box;overflow:hidden;">
  <tr>
    <td class="si-pad si-sb-pad-${id}" style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100% !important;">
        <tr>
          <!-- Left: Store Identity & Rating -->
          <td class="si-col si-sb-left-${id}" valign="middle" style="width:65%;">
            <p style="margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:#ffffff;line-height:1.2;">
              ${sellerDisplayName}
              ${p.showBadge ? `<span style="display:inline-block;background-color:#b8fa33;color:#1e1535;font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:700;padding:2px 7px;border-radius:3px;margin-left:8px;vertical-align:middle;">${p.badgeText ?? 'TOP RATED'}</span>` : ''}
            </p>
            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:rgba(255,255,255,0.75);line-height:1.3;">
              ${p.tagline ?? 'Trusted eBay Seller Since 2010'}
            </p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#b8fa33;line-height:1.2;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#b8fa33" stroke="#b8fa33" stroke-width="1" style="display:inline-block;vertical-align:-1px;margin-right:4px;">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              ${p.feedbackText ?? '99.8% Positive Feedback'}
            </p>
          </td>

          <!-- Right: View My Store CTA -->
          <td class="si-col si-sb-right-${id}" valign="middle" style="width:35%;text-align:right;">
            <a href="https://www.ebay.com/str/{{SELLER_NAME}}"
              class="si-sb-btn-${id}"
              style="display:inline-block;background-color:#ffffff;color:${accent};font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;padding:10px 22px;border-radius:6px;text-decoration:none;box-shadow:0 2px 6px rgba(0,0,0,0.15);">
              View My Store &#8594;
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:seller_info:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 10 — compact-card-row
// 3 side-by-side micro-cards — Store Name / Feedback / Dispatch
// ─────────────────────────────────────────────────────────────────────────────
function compactCardRow(p: SellerInfoProps, id: string): string {
  const accent = ac(p)
  const text = txt(p)
  const background = bg(p)
  return `${mobileStyle()}
<!--[riazify:seller_info:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;background-color:${background};">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="si-card" valign="top" style="width:33.33%;padding-right:8px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
              style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:8px;border-bottom:3px solid ${accent};">
              <tr>
                <td style="padding:14px;text-align:center;">
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;margin-bottom:6px;">&#127978;</div>
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${text};margin-bottom:3px;">${p.sellerName ?? '{{SELLER_NAME}}'}</div>
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#6b7280;">${p.tagline ?? 'Est. Since 2010'}</div>
                </td>
              </tr>
            </table>
          </td>
          <td class="si-card" valign="top" style="width:33.33%;padding-right:8px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
              style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:8px;border-bottom:3px solid #b8fa33;">
              <tr>
                <td style="padding:14px;text-align:center;">
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;margin-bottom:6px;">&#11088;</div>
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${text};margin-bottom:3px;">${p.feedbackText ?? '99.8% Positive'}</div>
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#6b7280;">${p.showBadge ? (p.badgeText ?? 'Top Rated') : 'Verified Seller'}</div>
                </td>
              </tr>
            </table>
          </td>
          <td class="si-card" valign="top" style="width:33.33%;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
              style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:8px;border-bottom:3px solid #10b981;">
              <tr>
                <td style="padding:14px;text-align:center;">
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;margin-bottom:6px;">&#128230;</div>
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${text};margin-bottom:3px;">Same-Day Dispatch</div>
                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#6b7280;">UK Based Fulfilment</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:seller_info:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT ARRAY
// ─────────────────────────────────────────────────────────────────────────────
export const sellerInfoVariants: BlockVariant[] = [
  {
    id: 'authority-split',
    label: 'Authority Split',
    description: 'Two-column card — avatar/logo left with Top Rated badge, store name and metrics right. Corporate-grade trust.',
    toHtml(props, id) { return authoritySplit(props as SellerInfoProps, id) },
  },
  {
    id: 'inline-ribbon',
    label: 'Sleek Inline Ribbon',
    description: 'Single-row horizontal ribbon with left accent border, shield icon, dot-separated store name, tagline and feedback.',
    toHtml(props, id) { return inlineRibbon(props as SellerInfoProps, id) },
  },
  {
    id: 'metrics-grid',
    label: 'Stats & Metrics Grid',
    description: 'Store header plus three stat cards — Feedback, Shipping Speed, and Customer Support — with accent top borders.',
    toHtml(props, id) { return metricsGrid(props as SellerInfoProps, id) },
  },
  {
    id: 'dark-executive',
    label: 'Dark Executive',
    description: 'Dark charcoal card with neon accent border, white type, lime-green feedback badge and Visit Store CTA.',
    toHtml(props, id) { return darkExecutive(props as SellerInfoProps, id) },
  },
  {
    id: 'storefront-split',
    label: 'Storefront Showcase',
    description: 'Left: store identity and logo. Right: four checkmark guarantees answering "Why buy from this seller?".',
    toHtml(props, id) { return storefrontSplit(props as SellerInfoProps, id) },
  },
  {
    id: 'glass-card',
    label: 'Glassmorphism Card',
    description: 'Modern frosted card over a subtle accent gradient — avatar circle, store name, and a rounded feedback pill.',
    toHtml(props, id) { return glassCard(props as SellerInfoProps, id) },
  },
  {
    id: 'vertical-profile',
    label: 'Tall Store Card',
    description: 'Fully centred vertical stack — avatar, name, accent divider, feedback pill, badge and View Store link.',
    toHtml(props, id) { return verticalProfile(props as SellerInfoProps, id) },
  },
  {
    id: 'trust-ribbon-duo',
    label: 'Double-Row Ribbon',
    description: 'Row 1: accent-colour identity bar with store name and badge. Row 2: four trust chip pills on a light background.',
    toHtml(props, id) { return trustRibbonDuo(props as SellerInfoProps, id) },
  },
  {
    id: 'spotlight-banner',
    label: 'Spotlight Banner',
    description: 'Full-width purple-to-dark gradient hero strip — store name and feedback left, white View Store CTA right.',
    toHtml(props, id) { return spotlightBanner(props as SellerInfoProps, id) },
  },
  {
    id: 'compact-card-row',
    label: 'Compact Card Row',
    description: 'Three side-by-side micro-cards: Store Name, Feedback Score, and Dispatch Info. Mobile-first, scannable.',
    toHtml(props, id) { return compactCardRow(props as SellerInfoProps, id) },
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// GETTER
// ─────────────────────────────────────────────────────────────────────────────
export function getSellerInfoVariant(id: string): BlockVariant | undefined {
  return sellerInfoVariants.find(v => v.id === id)
}
