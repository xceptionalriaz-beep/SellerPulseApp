// components/ui/VisualEditor/variants/price_tag.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Price Tag — 10 High-Converting eBay Layout Variants (Production Polished)
// Free:    classic-strike, minimalist-inline
// Pro:     stacked-deal-card, discount-badge-pill, dual-tone-split, urgency-banner
// Premium: wholesale-b2b, modern-glassmorphism, high-contrast-flash, elite-luxury
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
    id: string
    label: string
    description: string
    toHtml: (props: any, id: string) => string
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function pad(p: any): string {
    return `padding:${p.paddingTop ?? 16}px ${p.paddingRight ?? 24}px ${p.paddingBottom ?? 16}px ${p.paddingLeft ?? 24}px;`
}
function bg(p: any, defaultBg = '#ffffff'): string {
    return p.bgColor ?? defaultBg
}
function priceCol(p: any, defaultCol = '#1e1535'): string {
    return p.priceColor ?? p.textColor ?? defaultCol
}
function strikeCol(p: any): string {
    return p.strikeColor ?? p.originalColor ?? '#94a3b8'
}
function badgeBg(p: any, defaultBg = '#dc2626'): string {
    return p.badgeBg ?? p.badgeColor ?? defaultBg
}
function badgeTxt(p: any, defaultTxt = '#ffffff'): string {
    return p.badgeText ?? p.badgeTextColor ?? defaultTxt
}
function itemPrice(p: any): string {
    return p.itemPrice ?? '{{ITEM_PRICE}}'
}
function origPrice(p: any): string {
    return p.originalPrice ?? '{{ORIGINAL_PRICE}}'
}
function discPercent(p: any): string {
    const val = String(p.discountPercent ?? '{{DISCOUNT_PERCENT}}').trim()
    return val.endsWith('%') ? val.slice(0, -1) : val
}
function discAmount(p: any): string {
    return p.discountAmount ?? '{{DISCOUNT_AMOUNT}}'
}
function font(p: any): string {
    return p.fontFamily ? `${p.fontFamily}, Arial, sans-serif` : 'Arial, sans-serif'
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 1 — classic-strike  [FREE DEFAULT]
// Clean, traditional eBay layout: Strikethrough Was price on left, large bold
// current price in center, and high-visibility savings badge on right.
// ─────────────────────────────────────────────────────────────────────────────
function classicStrike(p: any, id: string): string {
    const f = font(p)
    const bColor = p.borderColor ?? '#e2e8f0'
    return `<!--[riazify:price_tag:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};">
  <tr>
    <td style="background-color:${bg(p)};${pad(p)}border:1px solid ${bColor};border-radius:8px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:middle;text-align:left;" width="32%">
            <span style="font-size:11px;font-weight:700;color:${strikeCol(p)};text-transform:uppercase;letter-spacing:0.8px;display:block;margin-bottom:2px;">Original Price</span>
            <span style="font-size:17px;font-weight:600;color:${strikeCol(p)};text-decoration:line-through;line-height:1;white-space:nowrap;">Was ${origPrice(p)}</span>
          </td>
          <td style="vertical-align:middle;text-align:center;padding:0 8px;" width="36%">
            <span style="font-size:32px;font-weight:900;color:${priceCol(p)};line-height:1;letter-spacing:-0.5px;white-space:nowrap;">${itemPrice(p)}</span>
          </td>
          <td style="vertical-align:middle;text-align:right;" width="32%">
            <span style="display:inline-block;background-color:${badgeBg(p)};color:${badgeTxt(p)};font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;padding:6px 14px;border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,0.1);white-space:nowrap;">
              SAVE ${discPercent(p)}%
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:price_tag:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 2 — minimalist-inline  [FREE]
// Compact single-line horizontal strip. Perfect under title or for tight spaces.
// ─────────────────────────────────────────────────────────────────────────────
function minimalistInline(p: any, id: string): string {
    const f = font(p)
    return `<!--[riazify:price_tag:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};">
  <tr>
    <td style="background-color:${bg(p, '#f8fafc')};padding:10px 16px;border-radius:6px;border:1px solid #e2e8f0;">
      <table cellpadding="0" cellspacing="0" border="0" align="left">
        <tr>
          <td style="vertical-align:middle;padding-right:8px;">
            <span style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Price:</span>
          </td>
          <td style="vertical-align:middle;padding-right:12px;">
            <span style="font-size:22px;font-weight:800;color:${priceCol(p)};line-height:1;">${itemPrice(p)}</span>
          </td>
          <td style="vertical-align:middle;padding-right:12px;">
            <span style="font-size:13px;font-weight:500;color:${strikeCol(p)};text-decoration:line-through;">${origPrice(p)}</span>
          </td>
          <td style="vertical-align:middle;">
            <span style="display:inline-block;background-color:${badgeBg(p, '#16a34a')};color:${badgeTxt(p)};font-size:11px;font-weight:700;padding:2px 8px;border-radius:100px;white-space:nowrap;">
              -${discPercent(p)}%
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:price_tag:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 3 — stacked-deal-card  [PRO]
// Vertical card stack: Top MSRP label, huge centered price, bottom accent bar.
// ─────────────────────────────────────────────────────────────────────────────
function stackedDealCard(p: any, id: string): string {
    const f = font(p)
    const accent = badgeBg(p, '#1e1535')
    const accentTxt = badgeTxt(p, '#b8fa33')
    const topPad = p.paddingTop ?? 20
    const sidePad = p.paddingRight ?? 24
    const botPad = p.paddingBottom ?? 16
    return `<!--[riazify:price_tag:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};">
  <tr>
    <td style="background-color:${bg(p)};border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.04);">
      <div style="padding:${topPad}px ${sidePad}px ${botPad}px;text-align:center;">
        <div style="font-size:11px;font-weight:700;color:${strikeCol(p)};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">
          Retail MSRP: <span style="text-decoration:line-through;">${origPrice(p)}</span>
        </div>
        <div style="font-size:38px;font-weight:900;color:${priceCol(p)};line-height:1;margin-bottom:4px;letter-spacing:-1px;">
          ${itemPrice(p)}
        </div>
        <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
          Special Buy It Now Price
        </div>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${accent};">
        <tr>
          <td style="padding:10px 16px;text-align:center;">
            <span style="font-size:12px;font-weight:800;color:${accentTxt};letter-spacing:1px;text-transform:uppercase;">
              &#128293; You Save ${discAmount(p)} (${discPercent(p)}% Off Retail)
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:price_tag:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 4 — discount-badge-pill  [PRO]
// Large current price on left with oversized floating curved pill badge.
// ─────────────────────────────────────────────────────────────────────────────
function discountBadgePill(p: any, id: string): string {
    const f = font(p)
    const pillCol = badgeBg(p, '#8fff00')
    const pillTxt = badgeTxt(p, '#0a0d08')
    return `<!--[riazify:price_tag:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};">
  <tr>
    <td style="background-color:${bg(p, '#f8fafc')};${pad(p)}border:1px solid #e2e8f0;border-radius:12px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:middle;text-align:left;">
            <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">
              Special Listing Price
            </div>
            <div style="font-size:34px;font-weight:900;color:${priceCol(p)};line-height:1;margin-bottom:6px;">
              ${itemPrice(p)}
              <span style="font-size:15px;font-weight:500;color:${strikeCol(p)};text-decoration:line-through;margin-left:8px;">${origPrice(p)}</span>
            </div>
            <div style="font-size:11px;color:#16a34a;font-weight:700;">
              &#10003; In Stock &amp; Ready for Fast Dispatch
            </div>
          </td>
          <td style="vertical-align:middle;text-align:right;" width="40%">
            <table cellpadding="0" cellspacing="0" border="0" align="right">
              <tr>
                <td style="background-color:${pillCol};color:${pillTxt};font-size:13px;font-weight:800;letter-spacing:0.8px;text-transform:uppercase;padding:10px 20px;border-radius:100px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.08);white-space:nowrap;">
                  SAVE ${discPercent(p)}%
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:price_tag:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 5 — dual-tone-split  [PRO]
// Split block: 65% clean pricing on left, 35% solid brand accent on right.
// Explicit corner radii prevent sharp corners bleeding in older WebKit views.
// ─────────────────────────────────────────────────────────────────────────────
function dualToneSplit(p: any, id: string): string {
    const f = font(p)
    const rightBg = p.accentColor ?? '#1e1535'
    const rightAccent = p.badgeColor ?? '#b8fa33'
    return `<!--[riazify:price_tag:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};">
  <tr>
    <td style="background-color:${bg(p)};border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="65%" style="padding:18px 24px;vertical-align:middle;text-align:left;border-radius:9px 0 0 9px;">
            <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">
              Buy It Now Price
            </div>
            <div style="font-size:32px;font-weight:800;color:${priceCol(p)};line-height:1;margin-bottom:4px;">
              ${itemPrice(p)}
            </div>
            <div style="font-size:12px;color:${strikeCol(p)};font-weight:500;">
              MSRP: <span style="text-decoration:line-through;">${origPrice(p)}</span> &nbsp;&#8226;&nbsp; Free Returns
            </div>
          </td>
          <td width="35%" style="background-color:${rightBg};padding:18px 16px;vertical-align:middle;text-align:center;border-radius:0 9px 9px 0;">
            <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:2px;">
              Save Today
            </div>
            <div style="font-size:28px;font-weight:900;color:${rightAccent};line-height:1;margin-bottom:2px;">
              ${discPercent(p)}%
            </div>
            <div style="font-size:9px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:1px;">
              Instant Discount
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:price_tag:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 6 — urgency-banner  [PRO]
// Top alert banner (⚡ Limited Time Price) above a high-converting price card.
// Padding is placed directly on <td> for bulletproof cross-client consistency.
// ─────────────────────────────────────────────────────────────────────────────
function urgencyBanner(p: any, id: string): string {
    const f = font(p)
    const urgencyBg = p.bannerBg ?? '#dc2626'
    return `<!--[riazify:price_tag:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};">
  <tr>
    <td style="border:1px solid #fecaca;border-radius:8px;overflow:hidden;background-color:${bg(p)};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${urgencyBg};">
        <tr>
          <td style="padding:8px 16px;text-align:center;">
            <span style="font-size:11px;font-weight:800;color:#ffffff;text-transform:uppercase;letter-spacing:1.5px;">
              &#9889; Limited Time Promotional Price &nbsp;&#8226;&nbsp; While Stock Lasts
            </span>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:16px 20px;vertical-align:middle;text-align:left;">
            <span style="font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.8px;display:block;margin-bottom:2px;">
              Flash Deal Active
            </span>
            <span style="font-size:32px;font-weight:900;color:${priceCol(p)};line-height:1;">
              ${itemPrice(p)}
            </span>
            <span style="font-size:14px;color:${strikeCol(p)};text-decoration:line-through;margin-left:8px;">
              ${origPrice(p)}
            </span>
          </td>
          <td style="padding:16px 20px;vertical-align:middle;text-align:right;">
            <div style="display:inline-block;background-color:#fee2e2;border:1px solid #fca5a5;padding:6px 14px;border-radius:6px;text-align:center;white-space:nowrap;">
              <span style="font-size:11px;font-weight:800;color:#b91c1c;text-transform:uppercase;display:block;">
                Save ${discAmount(p)} (${discPercent(p)}%)
              </span>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:price_tag:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 7 — wholesale-b2b  [PREMIUM]
// 4-column structured matrix: MSRP, Our Price, Total Savings & Unit Economics.
// ─────────────────────────────────────────────────────────────────────────────
function wholesaleB2b(p: any, id: string): string {
    const f = font(p)
    return `<!--[riazify:price_tag:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};">
  <tr>
    <td style="background-color:${bg(p)};border:1px solid #cbd5e1;border-radius:6px;overflow:hidden;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr style="background-color:#f1f5f9;">
          <td width="25%" style="padding:10px 12px;text-align:center;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;">
            <span style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Standard MSRP</span>
          </td>
          <td width="28%" style="padding:10px 12px;text-align:center;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;background-color:#e2e8f0;">
            <span style="font-size:10px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:1px;">eBay Direct Price</span>
          </td>
          <td width="24%" style="padding:10px 12px;text-align:center;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;">
            <span style="font-size:10px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">Your Margin</span>
          </td>
          <td width="23%" style="padding:10px 12px;text-align:center;border-bottom:1px solid #e2e8f0;">
            <span style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Quantity Tier</span>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 12px;text-align:center;border-right:1px solid #e2e8f0;vertical-align:middle;">
            <span style="font-size:16px;font-weight:600;color:${strikeCol(p)};text-decoration:line-through;">${origPrice(p)}</span>
          </td>
          <td style="padding:16px 12px;text-align:center;border-right:1px solid #e2e8f0;vertical-align:middle;background-color:#fafafa;">
            <span style="font-size:26px;font-weight:800;color:${priceCol(p)};line-height:1;">${itemPrice(p)}</span>
          </td>
          <td style="padding:16px 12px;text-align:center;border-right:1px solid #e2e8f0;vertical-align:middle;">
            <span style="font-size:14px;font-weight:800;color:#16a34a;display:block;">Save ${discPercent(p)}%</span>
            <span style="display:block;font-size:10px;color:#64748b;margin-top:2px;">(${discAmount(p)}/unit)</span>
          </td>
          <td style="padding:16px 12px;text-align:center;vertical-align:middle;">
            <span style="display:inline-block;background-color:#e0f2fe;color:#0369a1;font-size:10px;font-weight:700;padding:4px 8px;border-radius:4px;text-transform:uppercase;white-space:nowrap;">
              Multi-Buy Eligible
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:price_tag:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 8 — modern-glassmorphism  [PREMIUM]
// Contemporary SaaS-styled card with subtle double-border, soft shadow simulation
// and high-end typography hierarchy.
// ─────────────────────────────────────────────────────────────────────────────
function modernGlassmorphism(p: any, id: string): string {
    const f = font(p)
    return `<!--[riazify:price_tag:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};">
  <tr>
    <td style="background-color:${bg(p, '#ffffff')};${pad(p)}border:1px solid #e0e7ff;border-radius:12px;box-shadow:0 4px 14px rgba(79,70,229,0.06);">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:middle;text-align:left;">
            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:6px;">
              <tr>
                <td style="background-color:#eef2ff;padding:3px 10px;border-radius:100px;border:1px solid #c7d2fe;">
                  <span style="font-size:10px;font-weight:700;color:#4338ca;text-transform:uppercase;letter-spacing:1px;">Verified Best Deal</span>
                </td>
              </tr>
            </table>
            <div style="font-size:34px;font-weight:900;color:${priceCol(p, '#1e1b4b')};line-height:1;margin-bottom:4px;letter-spacing:-0.5px;">
              ${itemPrice(p)}
              <span style="font-size:14px;font-weight:500;color:${strikeCol(p)};text-decoration:line-through;margin-left:8px;">${origPrice(p)}</span>
            </div>
            <div style="font-size:11px;color:#6366f1;font-weight:600;">
              Guaranteed Authentic &bull; 100% Buyer Protection
            </div>
          </td>
          <td style="vertical-align:middle;text-align:right;" width="35%">
            <div style="display:inline-block;background-color:#4338ca;color:#ffffff;padding:8px 16px;border-radius:8px;text-align:center;white-space:nowrap;">
              <span style="font-size:12px;font-weight:800;letter-spacing:0.8px;display:block;">${discPercent(p)}% DISCOUNT</span>
              <span style="font-size:9px;color:#c7d2fe;text-transform:uppercase;display:block;margin-top:2px;">Applied at Checkout</span>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:price_tag:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 9 — high-contrast-flash  [PREMIUM]
// Dark-themed background with neon green/lime pricing and angled ribbon style.
// ─────────────────────────────────────────────────────────────────────────────
function highContrastFlash(p: any, id: string): string {
    const f = font(p)
    const darkBg = p.bgColor ?? '#0f172a'
    const neonCol = p.badgeColor ?? '#8fff00'
    return `<!--[riazify:price_tag:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};">
  <tr>
    <td style="background-color:${darkBg};${pad(p)}border-radius:10px;border-left:5px solid ${neonCol};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:middle;text-align:left;">
            <div style="margin-bottom:6px;">
              <span style="background-color:${neonCol};color:#0a0d08;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:1.5px;padding:3px 9px;border-radius:3px;display:inline-block;">
                &#9889; FLASH CLEARANCE
              </span>
            </div>
            <div style="font-size:36px;font-weight:900;color:#ffffff;line-height:1;margin-bottom:4px;letter-spacing:-0.5px;">
              ${itemPrice(p)}
              <span style="font-size:15px;font-weight:500;color:rgba(255,255,255,0.4);text-decoration:line-through;margin-left:8px;">${origPrice(p)}</span>
            </div>
            <div style="font-size:11px;color:${neonCol};font-weight:700;letter-spacing:0.5px;">
              Save ${discAmount(p)} &bull; Limited Quantities at this price
            </div>
          </td>
          <td style="vertical-align:middle;text-align:right;" width="30%">
            <div style="display:inline-block;border:2px dashed ${neonCol};padding:8px 14px;border-radius:8px;text-align:center;white-space:nowrap;">
              <div style="font-size:22px;font-weight:900;color:${neonCol};line-height:1;">
                -${discPercent(p)}%
              </div>
              <div style="font-size:9px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">
                Instant Off
              </div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:price_tag:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 10 — elite-luxury  [PREMIUM]
// Minimalist, high-end border with elegant centered typography and gold accents.
// Best for luxury goods, watches, jewelry, and high-ticket electronics.
// ─────────────────────────────────────────────────────────────────────────────
function eliteLuxury(p: any, id: string): string {
    const f = p.fontFamily ? `${p.fontFamily}, Georgia, serif` : 'Georgia, serif'
    const gold = p.accentColor ?? '#d97706'
    return `<!--[riazify:price_tag:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};">
  <tr>
    <td style="background-color:${bg(p, '#ffffff')};${pad(p)}border:1px solid #d1d5db;border-top:3px solid ${gold};border-radius:4px;text-align:center;">
      <div style="font-size:10px;font-weight:700;color:${gold};text-transform:uppercase;letter-spacing:2.5px;margin-bottom:8px;">
        &#9733; Exclusive Offering &#9733;
      </div>
      <div style="font-size:34px;font-weight:400;color:${priceCol(p, '#111827')};line-height:1;margin-bottom:6px;letter-spacing:0.5px;">
        ${itemPrice(p)}
      </div>
      <div style="font-size:12px;color:#6b7280;margin-bottom:12px;">
        Original Retail: <span style="text-decoration:line-through;color:${strikeCol(p)};">${origPrice(p)}</span>
        &nbsp;&bull;&nbsp;
        <span style="color:${gold};font-weight:600;">Privilege Savings ${discPercent(p)}%</span>
      </div>
      <div style="display:inline-block;border-top:1px solid #e5e7eb;padding-top:8px;font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">
        Complimentary Expedited Shipping &amp; White Glove Handling Included
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:price_tag:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export const priceTagVariants: BlockVariant[] = [
    {
        id: 'classic-strike',
        label: 'Classic Strike',
        description: 'Traditional layout with strikethrough original price, bold current price, and red savings badge',
        toHtml(props, id) { return classicStrike(props, id) },
    },
    {
        id: 'minimalist-inline',
        label: 'Minimalist Inline',
        description: 'Compact single-line horizontal strip for titles and tight vertical spaces',
        toHtml(props, id) { return minimalistInline(props, id) },
    },
    {
        id: 'stacked-deal-card',
        label: 'Stacked Deal Card',
        description: 'Vertical card with top retail MSRP, huge centered price, and bottom full-width savings bar',
        toHtml(props, id) { return stackedDealCard(props, id) },
    },
    {
        id: 'discount-badge-pill',
        label: 'Discount Badge Pill',
        description: 'Prominent current price paired with an eye-catching floating discount pill badge',
        toHtml(props, id) { return discountBadgePill(props, id) },
    },
    {
        id: 'dual-tone-split',
        label: 'Dual-Tone Split',
        description: 'Modern 2-column split box: clean pricing on left, solid contrast accent block on right',
        toHtml(props, id) { return dualToneSplit(props, id) },
    },
    {
        id: 'urgency-banner',
        label: 'Urgency Banner',
        description: 'Urgent promotional banner header with countdown/stock notice above price',
        toHtml(props, id) { return urgencyBanner(props, id) },
    },
    {
        id: 'wholesale-b2b',
        label: 'Wholesale / B2B',
        description: 'Grid matrix comparing MSRP, Our Price, Total Savings, and Unit Economics',
        toHtml(props, id) { return wholesaleB2b(props, id) },
    },
    {
        id: 'modern-glassmorphism',
        label: 'Modern Glassmorphism',
        description: 'SaaS-grade pricing card with refined borders, delicate typography, and clean hierarchy',
        toHtml(props, id) { return modernGlassmorphism(props, id) },
    },
    {
        id: 'high-contrast-flash',
        label: 'High-Contrast Flash',
        description: 'Deep dark background with electric neon accents and flash sale banner',
        toHtml(props, id) { return highContrastFlash(props, id) },
    },
    {
        id: 'elite-luxury',
        label: 'Elite Luxury',
        description: 'Understated premium elegance with fine borders, gold accents, and luxury typography',
        toHtml(props, id) { return eliteLuxury(props, id) },
    },
]

export function getPriceTagVariant(id: string): BlockVariant {
    return priceTagVariants.find(v => v.id === id) ?? priceTagVariants[0]
}
