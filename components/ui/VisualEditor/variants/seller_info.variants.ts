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

function mobileStyle(): string {
    return `<style>
@media only screen and (max-width:600px){
  .si-col{display:block!important;width:100%!important;text-align:center!important;}
  .si-avatar{margin:0 auto 12px!important;}
  .si-right{padding-left:0!important;padding-top:12px!important;}
  .si-grid-cell{display:block!important;width:100%!important;padding-bottom:12px!important;}
  .si-card{display:block!important;width:100%!important;margin-bottom:10px!important;}
  .si-hide{display:none!important;}
  .si-center-mobile{text-align:center!important;}
}
</style>`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 1 — authority-split
// Two-column: avatar/logo left + store identity + metrics right
// ─────────────────────────────────────────────────────────────────────────────
function authoritySplit(p: SellerInfoProps, id: string): string {
    const accent = ac(p)
    const text = txt(p)
    const background = bg(p)
    return `${mobileStyle()}
<!--[riazify:seller_info:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;background-color:${background};border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="si-col si-avatar" valign="top" style="width:90px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:72px;height:72px;background-color:${accent};border-radius:50%;text-align:center;vertical-align:middle;">
                  <span style="font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:700;color:#ffffff;line-height:72px;">
                    ${(p.sellerName ?? '{{SELLER_NAME}}').charAt(0).toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="text-align:center;padding-top:6px;">
                  <span style="display:inline-block;background-color:#b8fa33;color:#1e1535;font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px;">TOP RATED</span>
                </td>
              </tr>
            </table>
          </td>
          <td class="si-col si-right" valign="middle" style="padding-left:16px;">
            <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:${text};">
              ${p.sellerName ?? '{{SELLER_NAME}}'}${badge(p)}
            </p>
            <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7280;">
              ${p.tagline ?? 'Trusted eBay Seller Since 2010'}
            </p>
            <table cellpadding="0" cellspacing="0" border="0">
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
// Single-row sleek horizontal ribbon, left accent border
// ─────────────────────────────────────────────────────────────────────────────
function inlineRibbon(p: SellerInfoProps, id: string): string {
    const accent = ac(p)
    const text = txt(p)
    const background = bg(p)
    return `${mobileStyle()}
<!--[riazify:seller_info:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;background-color:${background};border-left:4px solid ${accent};">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="middle" style="width:24px;padding-right:10px;">
            <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 1L2 4.5V10C2 14.5 5.5 18.7 10 20C14.5 18.7 18 14.5 18 10V4.5L10 1Z" fill="${accent}" opacity="0.15" stroke="${accent}" stroke-width="1.5" stroke-linejoin="round"/>
              <path d="M7 11L9 13L13 9" stroke="${accent}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </td>
          <td valign="middle" style="padding-right:10px;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${text};">${p.sellerName ?? '{{SELLER_NAME}}'}</span>
          </td>
          <td valign="middle" style="padding-right:10px;color:#d1d5db;font-size:16px;">&bull;</td>
          <td valign="middle" style="padding-right:10px;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7280;">${p.tagline ?? 'Trusted Seller Since 2010'}</span>
          </td>
          <td valign="middle" style="padding-right:10px;color:#d1d5db;font-size:16px;">&bull;</td>
          <td valign="middle" style="padding-right:10px;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:${accent};">${p.feedbackText ?? '99.8% Positive Feedback'}</span>
          </td>
          <td valign="middle">${badge(p)}</td>
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
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;background-color:${background};border:1px solid #e5e7eb;border-radius:8px;">
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
// Dark premium profile — charcoal bg, neon accent border, white type
// ─────────────────────────────────────────────────────────────────────────────
function darkExecutive(p: SellerInfoProps, id: string): string {
    const accent = ac(p)
    return `${mobileStyle()}
<!--[riazify:seller_info:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;background-color:#1e1535;border:1px solid ${accent};border-radius:8px;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="si-col si-avatar" valign="middle" style="width:64px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:56px;height:56px;background-color:${accent};border-radius:50%;text-align:center;vertical-align:middle;">
                  <span style="font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:#ffffff;line-height:56px;">
                    ${(p.sellerName ?? '{{SELLER_NAME}}').charAt(0).toUpperCase()}
                  </span>
                </td>
              </tr>
            </table>
          </td>
          <td class="si-col si-right" valign="middle" style="padding-left:16px;">
            <p style="margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:700;color:#ffffff;">
              ${p.sellerName ?? '{{SELLER_NAME}}'}
            </p>
            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#a0a0b8;">
              ${p.tagline ?? 'Trusted eBay Seller Since 2010'}
            </p>
            <table cellpadding="0" cellspacing="0" border="0">
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
          <td class="si-col si-center-mobile" valign="middle" style="text-align:right;padding-left:12px;">
            <a href="https://www.ebay.com/str/{{SELLER_NAME}}" style="display:inline-block;background-color:transparent;border:1px solid ${accent};color:${accent};font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;padding:7px 16px;border-radius:4px;text-decoration:none;">Visit Store &#8594;</a>
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
// Left: store identity. Right: bullet guarantee list
// ─────────────────────────────────────────────────────────────────────────────
function storefrontSplit(p: SellerInfoProps, id: string): string {
    const accent = ac(p)
    const text = txt(p)
    const background = bg(p)
    return `${mobileStyle()}
<!--[riazify:seller_info:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;background-color:${background};border:1px solid #e5e7eb;border-radius:8px;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="si-col" valign="middle" style="width:50%;padding-right:20px;border-right:1px solid #e5e7eb;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-bottom:8px;">
                  <div style="width:48px;height:48px;background-color:${accent};border-radius:10px;text-align:center;line-height:48px;">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:#ffffff;">${(p.sellerName ?? '{{SELLER_NAME}}').charAt(0).toUpperCase()}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <p style="margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:${text};">${p.sellerName ?? '{{SELLER_NAME}}'}</p>
                  <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#6b7280;">${p.tagline ?? 'Trusted eBay Seller Since 2010'}</p>
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:${accent};">&#9733; ${p.feedbackText ?? '99.8% Positive Feedback'}</p>
                </td>
              </tr>
            </table>
          </td>
          <td class="si-col si-right" valign="middle" style="width:50%;padding-left:20px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr><td style="padding-bottom:8px;"><span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Why Buy From Us?</span></td></tr>
              <tr><td style="padding-bottom:6px;"><span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${text};"><span style="color:#10b981;font-weight:700;">&#10003;</span>&nbsp; 100% Authentic Products</span></td></tr>
              <tr><td style="padding-bottom:6px;"><span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${text};"><span style="color:#10b981;font-weight:700;">&#10003;</span>&nbsp; Fast &amp; Secure Fulfilment</span></td></tr>
              <tr><td style="padding-bottom:6px;"><span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${text};"><span style="color:#10b981;font-weight:700;">&#10003;</span>&nbsp; Hassle-Free Returns</span></td></tr>
              <tr><td><span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${text};"><span style="color:#10b981;font-weight:700;">&#10003;</span>&nbsp; 24/7 Customer Support</span></td></tr>
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
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;background:linear-gradient(135deg,${accent}22 0%,${accent}08 100%);border-radius:12px;border:1px solid ${accent}33;">
  <tr>
    <td style="padding:28px 24px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="si-col si-avatar" valign="top" style="width:80px;text-align:center;">
            <table cellpadding="0" cellspacing="0" border="0" align="center">
              <tr>
                <td style="width:64px;height:64px;background:linear-gradient(135deg,${accent},#1e1535);border-radius:50%;text-align:center;vertical-align:middle;border:3px solid #ffffff;">
                  <span style="font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:700;color:#ffffff;line-height:58px;">
                    ${(p.sellerName ?? '{{SELLER_NAME}}').charAt(0).toUpperCase()}
                  </span>
                </td>
              </tr>
            </table>
          </td>
          <td class="si-col si-right" valign="middle" style="padding-left:16px;">
            <p style="margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:700;color:${text};">
              ${p.sellerName ?? '{{SELLER_NAME}}'}
            </p>
            <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#6b7280;">
              ${p.tagline ?? 'Trusted eBay Seller Since 2010'}
            </p>
            <span style="display:inline-block;background-color:#ffffff;border:1px solid ${accent}44;color:${accent};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;">
              &#9733; ${p.feedbackText ?? '99.8% Positive Feedback'}
            </span>
            ${p.showBadge ? `&nbsp;<span style="display:inline-block;background-color:#b8fa33;color:#1e1535;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;padding:4px 10px;border-radius:20px;">${p.badgeText ?? 'Top Rated Seller'}</span>` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:seller_info:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 7 — vertical-profile
// Centered vertical stack — avatar → name → divider → pill → CTA link
// ─────────────────────────────────────────────────────────────────────────────
function verticalProfile(p: SellerInfoProps, id: string): string {
    const accent = ac(p)
    const text = txt(p)
    const background = bg(p)
    return `${mobileStyle()}
<!--[riazify:seller_info:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;background-color:${background};border:1px solid #e5e7eb;border-radius:8px;">
  <tr>
    <td style="${pad(p)};text-align:center;">
      <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 12px;">
        <tr>
          <td style="width:72px;height:72px;background-color:${accent};border-radius:50%;text-align:center;vertical-align:middle;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:700;color:#ffffff;line-height:72px;">
              ${(p.sellerName ?? '{{SELLER_NAME}}').charAt(0).toUpperCase()}
            </span>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:${text};">${p.sellerName ?? '{{SELLER_NAME}}'}</p>
      <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#6b7280;">${p.tagline ?? 'Trusted eBay Seller Since 2010'}</p>
      <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 12px;">
        <tr><td style="width:40px;height:2px;background-color:${accent};border-radius:2px;"></td></tr>
      </table>
      <div style="margin-bottom:14px;">
        <span style="display:inline-block;background-color:${accent};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;padding:5px 16px;border-radius:20px;">
          &#9733; ${p.feedbackText ?? '99.8% Positive Feedback'}
        </span>
        ${p.showBadge ? `<br><span style="display:inline-block;margin-top:6px;background-color:#b8fa33;color:#1e1535;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;">${p.badgeText ?? 'Top Rated Seller'}</span>` : ''}
      </div>
      <a href="https://www.ebay.com/str/{{SELLER_NAME}}" style="display:inline-block;border:1px solid ${accent};color:${accent};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;padding:6px 18px;border-radius:4px;text-decoration:none;">View My eBay Store</a>
    </td>
  </tr>
</table>
<!--[/riazify:seller_info:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 8 — trust-ribbon-duo
// Row 1: accent identity bar | Row 2: 4 trust chip pills
// ─────────────────────────────────────────────────────────────────────────────
function trustRibbonDuo(p: SellerInfoProps, id: string): string {
    const accent = ac(p)
    const text = txt(p)
    const background = bg(p)
    return `${mobileStyle()}
<!--[riazify:seller_info:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
  <tr>
    <td style="background-color:${accent};padding:10px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="middle">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;">${p.sellerName ?? '{{SELLER_NAME}}'}</span>
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:rgba(255,255,255,0.75);margin-left:8px;">${p.tagline ?? 'Trusted eBay Seller Since 2010'}</span>
          </td>
          <td valign="middle" style="text-align:right;">
            ${p.showBadge ? `<span style="display:inline-block;background-color:#b8fa33;color:#1e1535;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;padding:3px 9px;border-radius:4px;">${p.badgeText ?? 'Top Rated Seller'}</span>` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="background-color:${background};padding:10px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="si-card" valign="middle" style="padding-right:6px;">
            <span style="display:inline-block;background-color:#f3f4f6;color:${text};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;padding:5px 12px;border-radius:20px;">&#9733; ${p.feedbackText ?? '99.8% Positive'}</span>
          </td>
          <td class="si-card" valign="middle" style="padding-right:6px;">
            <span style="display:inline-block;background-color:#f3f4f6;color:${text};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;padding:5px 12px;border-radius:20px;">&#9889; Fast Dispatch</span>
          </td>
          <td class="si-card" valign="middle" style="padding-right:6px;">
            <span style="display:inline-block;background-color:#f3f4f6;color:${text};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;padding:5px 12px;border-radius:20px;">&#128172; 24/7 Support</span>
          </td>
          <td class="si-card" valign="middle">
            <span style="display:inline-block;background-color:#f3f4f6;color:${text};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;padding:5px 12px;border-radius:20px;">&#128260; Easy Returns</span>
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
    return `${mobileStyle()}
<!--[riazify:seller_info:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;background:linear-gradient(135deg,${accent} 0%,#1e1535 100%);border-radius:8px;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="si-col" valign="middle" style="width:65%;">
            <p style="margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:#ffffff;">
              ${p.sellerName ?? '{{SELLER_NAME}}'}
              ${p.showBadge ? `<span style="display:inline-block;background-color:#b8fa33;color:#1e1535;font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:700;padding:2px 7px;border-radius:3px;margin-left:8px;vertical-align:middle;">${p.badgeText ?? 'TOP RATED'}</span>` : ''}
            </p>
            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:rgba(255,255,255,0.7);">
              ${p.tagline ?? 'Trusted eBay Seller Since 2010'}
            </p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#b8fa33;">
              &#9733; ${p.feedbackText ?? '99.8% Positive Feedback'}
            </p>
          </td>
          <td class="si-col si-center-mobile" valign="middle" style="width:35%;text-align:right;">
            <a href="https://www.ebay.com/str/{{SELLER_NAME}}"
              style="display:inline-block;background-color:#ffffff;color:${accent};font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;padding:10px 22px;border-radius:6px;text-decoration:none;">
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
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;background-color:${background};">
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
