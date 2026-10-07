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

// ─── Shared helpers & Token Sanitization ─────────────────────────────────────
function pad(p: any): string {
  const top = p.paddingTop ?? 16
  const right = p.paddingRight ?? 22
  const bottom = p.paddingBottom ?? 16
  const left = p.paddingLeft ?? 22
  return `padding:${top}px ${right}px ${bottom}px ${left}px;`
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

/**
 * Token Sanitizer:
 * In the visual design canvas, raw unparsed tokens or messy formulas
 * (e.g. {{ITEM_PRICE}}, {{ORIGINAL_PRICE}}, {{ITEM_PRICE - ORIGINAL_PRICE...}})
 * create extreme visual clutter. We cleanly resolve them to professional,
 * realistic defaults while preserving any real user-configured values.
 */
function itemPrice(p: any): string {
  const val = p.itemPrice ?? p.price
  if (
    !val ||
    typeof val !== 'string' ||
    val.trim() === '' ||
    val.includes('{{ITEM_PRICE') ||
    val.includes('{{PRICE')
  ) {
    return p.preserveTokens ? '{{ITEM_PRICE}}' : '$19.99'
  }
  return val.trim()
}

function origPrice(p: any): string {
  const val = p.originalPrice ?? p.wasPrice ?? p.msrp
  if (
    !val ||
    typeof val !== 'string' ||
    val.trim() === '' ||
    val.includes('{{ORIGINAL_PRICE') ||
    val.includes('{{MSRP')
  ) {
    return p.preserveTokens ? '{{ORIGINAL_PRICE}}' : '$29.99'
  }
  return val.trim()
}

function discPercent(p: any): string {
  const val = p.discountPercent ?? p.savingsPercent
  if (
    val == null ||
    (typeof val !== 'string' && typeof val !== 'number') ||
    String(val).trim() === '' ||
    String(val).includes('{{DISCOUNT_PERCENT') ||
    String(val).includes('ORIGINAL_PRICE')
  ) {
    return p.preserveTokens ? '{{DISCOUNT_PERCENT}}' : '33'
  }
  const str = String(val).trim()
  return str.endsWith('%') ? str.slice(0, -1) : str
}

function discAmount(p: any): string {
  const val = p.discountAmount ?? p.savingsAmount
  if (
    !val ||
    typeof val !== 'string' ||
    val.trim() === '' ||
    val.includes('{{DISCOUNT_AMOUNT') ||
    val.includes('ORIGINAL_PRICE')
  ) {
    return p.preserveTokens ? '{{DISCOUNT_AMOUNT}}' : '$10.00'
  }
  return val.trim()
}

function font(p: any): string {
  return p.fontFamily ? `${p.fontFamily}, Arial, sans-serif` : 'Arial, sans-serif'
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 1 — classic-strike  [FREE DEFAULT]
// Clean, traditional eBay layout: Strikethrough Was price on left, large bold
// current price in center, and high-visibility savings badge on right.
// Uses responsive flex gap alignment to guarantee zero badge clipping or wrapping.
// ─────────────────────────────────────────────────────────────────────────────
function classicStrike(p: any, id: string): string {
  const f = font(p)
  const bgCol = p.bgColor || '#ffffff'
  const textCol = p.textColor || '#0f172a'
  const badgeCol = p.badgeColor || '#dc2626'

  return `<!--[riazify:price_tag:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .pt-cs-td-${id} {
      padding: 12px 10px !important;
    }
    .pt-cs-row-${id} {
      flex-direction: row !important;
      flex-wrap: nowrap !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 10px !important;
    }
    .pt-cs-orig-lbl-${id} {
      font-size: 8px !important;
      letter-spacing: 0.5px !important;
    }
    .pt-cs-orig-val-${id} {
      font-size: 13px !important;
    }
    .pt-cs-price-${id} {
      font-size: 26px !important;
    }
    .pt-cs-badge-${id} {
      font-size: 11px !important;
      padding: 5px 8px !important;
      letter-spacing: 0.5px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;margin:0 auto;font-family:${f};border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td class="pt-cs-td-${id}" style="background-color:${bgCol};${pad(p)}border-radius:10px;border:1px solid #e2e8f0;box-sizing:border-box;text-align:center;">
      <div class="pt-cs-row-${id}" style="display:flex;flex-direction:row;justify-content:center;align-items:center;flex-wrap:nowrap;gap:16px;width:100%;box-sizing:border-box;">

        <!-- 1. Left: Original Price with Strikethrough -->
        <div style="flex:0 0 auto;text-align:right;box-sizing:border-box;white-space:nowrap;">
          <div class="pt-cs-orig-lbl-${id}" style="font-size:9.5px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;line-height:1.2;margin-bottom:2px;">
            ORIGINAL PRICE
          </div>
          <div class="pt-cs-orig-val-${id}" style="font-size:15px;font-weight:600;color:#64748b;text-decoration:line-through;line-height:1.2;">
            Was ${origPrice(p)}
          </div>
        </div>

        <!-- 2. Center: Prominent Sale Price -->
        <div style="flex:0 0 auto;text-align:center;box-sizing:border-box;white-space:nowrap;">
          <div class="pt-cs-price-${id}" style="font-size:32px;font-weight:900;color:${textCol};line-height:1;letter-spacing:-0.5px;">
            ${itemPrice(p)}
          </div>
        </div>

        <!-- 3. Right: Red Discount Badge -->
        <div style="flex:0 0 auto;text-align:left;box-sizing:border-box;white-space:nowrap;">
          <div class="pt-cs-badge-${id}" style="background-color:${badgeCol};color:#ffffff;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;padding:6px 12px;border-radius:6px;display:inline-block;line-height:1;box-shadow:0 2px 6px rgba(220,38,38,0.25);">
            SAVE ${discPercent(p)}%
          </div>
        </div>

      </div>
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
  style="width:100%;width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#f8fafc')};padding:12px 18px;border-radius:8px;border:1px solid #e2e8f0;box-sizing:border-box;">
      <div style="display:flex;align-items:center;flex-wrap:wrap;gap:12px 14px;width:100%;box-sizing:border-box;">
        <span style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;line-height:1.2;">Price:</span>
        <span style="font-size:26px;font-weight:900;color:${priceCol(p)};line-height:1.15;letter-spacing:-0.4px;">${itemPrice(p)}</span>
        <span style="font-size:14px;font-weight:500;color:${strikeCol(p)};text-decoration:line-through;line-height:1.2;">${origPrice(p)}</span>
        <span style="display:inline-block;box-sizing:border-box;background-color:${badgeBg(p, '#16a34a')};color:${badgeTxt(p)};font-size:11px;font-weight:800;padding:4px 10px;border-radius:100px;white-space:nowrap;letter-spacing:0.5px;line-height:1.2;flex-shrink:0;">
          -${discPercent(p)}%
        </span>
      </div>
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
  const sidePad = p.paddingRight ?? 22
  const botPad = p.paddingBottom ?? 16
  return `<!--[riazify:price_tag:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p)};border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,0.04);box-sizing:border-box;">
      <div style="padding:${topPad}px ${sidePad}px ${botPad}px;text-align:center;box-sizing:border-box;">
        <div style="font-size:11px;font-weight:700;color:${strikeCol(p)};text-transform:uppercase;letter-spacing:1.5px;margin:0 0 6px 0;line-height:1.2;">
          Retail MSRP: <span style="text-decoration:line-through;">${origPrice(p)}</span>
        </div>
        <div style="font-size:36px;font-weight:900;color:${priceCol(p)};line-height:1.15;margin:0 0 6px 0;letter-spacing:-0.8px;">
          ${itemPrice(p)}
        </div>
        <div style="font-size:11.5px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;line-height:1.3;margin:0;">
          Special Buy It Now Price
        </div>
      </div>
      <div style="background-color:${accent};padding:11px 16px;text-align:center;box-sizing:border-box;">
        <span style="font-size:12px;font-weight:800;color:${accentTxt};letter-spacing:0.8px;text-transform:uppercase;display:block;line-height:1.3;max-width:100%;word-break:break-word;">
          &#128293; You Save ${discAmount(p)} (${discPercent(p)}% Off Retail)
        </span>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:price_tag:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 4 — discount-badge-pill  [PRO]
// Large current price on left with oversized floating curved pill badge.
// Flex layout ensures the pill badge never wraps awkwardly or spills over.
// ─────────────────────────────────────────────────────────────────────────────
function discountBadgePill(p: any, id: string): string {
  const f = font(p)
  // Ensure the signature neon green badge and dark text from the thumbnail
  const pillCol = (p.badgeColor && p.badgeColor !== '#dc2626' && p.badgeColor !== '#ef4444') ? p.badgeColor : '#8fff00'
  const pillTxt = (p.badgeTextColor && p.badgeTextColor !== '#ffffff') ? p.badgeTextColor : '#0a0d08'

  return `<!--[riazify:price_tag:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .pt-dbp-wrap-${id} {
      flex-direction: row !important;
      flex-wrap: nowrap !important;
      gap: 10px !important;
    }
    .pt-dbp-left-${id} {
      flex: 1 1 auto !important;
      min-width: 0 !important;
      text-align: left !important;
    }
    .pt-dbp-sub-${id} {
      font-size: 9px !important;
      margin-bottom: 2px !important;
    }
    .pt-dbp-price-${id} {
      font-size: 24px !important;
      margin-bottom: 3px !important;
      line-height: 1.1 !important;
    }
    .pt-dbp-was-${id} {
      font-size: 13px !important;
      margin-left: 5px !important;
    }
    .pt-dbp-stock-${id} {
      font-size: 10px !important;
      line-height: 1.2 !important;
    }
    .pt-dbp-right-${id} {
      flex-shrink: 0 !important;
    }
    .pt-dbp-pill-${id} {
      font-size: 10.5px !important;
      padding: 7px 12px !important;
      letter-spacing: 0.5px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;margin:0 auto;font-family:${f};border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bg(p, '#f8fafc')};${pad(p)}border:1px solid #e2e8f0;border-radius:12px;box-sizing:border-box;">
      <div class="pt-dbp-wrap-${id}" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:nowrap;gap:16px;width:100%;box-sizing:border-box;">
        <!-- Left: Pricing Info -->
        <div class="pt-dbp-left-${id}" style="flex:1 1 auto;min-width:0;text-align:left;box-sizing:border-box;">
          <div class="pt-dbp-sub-${id}" style="font-size:10.5px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;line-height:1.2;">
            Special Listing Price
          </div>
          <div class="pt-dbp-price-${id}" style="font-size:34px;font-weight:900;color:${priceCol(p)};line-height:1.15;margin:0 0 6px 0;letter-spacing:-0.5px;white-space:nowrap;">
            ${itemPrice(p)}
            <span class="pt-dbp-was-${id}" style="font-size:15px;font-weight:500;color:${strikeCol(p)};text-decoration:line-through;margin-left:8px;vertical-align:middle;display:inline-block;">${origPrice(p)}</span>
          </div>
          <div class="pt-dbp-stock-${id}" style="font-size:11px;color:#16a34a;font-weight:700;line-height:1.3;margin:0;">
            &#10003; In Stock &amp; Ready for Fast Dispatch
          </div>
        </div>

        <!-- Right: Neon Green Pill Badge (Matching thumbnail) -->
        <div class="pt-dbp-right-${id}" style="flex-shrink:0;text-align:right;box-sizing:border-box;">
          <div class="pt-dbp-pill-${id}" style="display:inline-block;box-sizing:border-box;background-color:${pillCol};color:${pillTxt};font-size:12.5px;font-weight:900;letter-spacing:0.8px;text-transform:uppercase;padding:10px 20px;border-radius:100px;text-align:center;box-shadow:0 3px 8px rgba(0,0,0,0.08);white-space:nowrap;line-height:1.2;max-width:100%;">
            SAVE ${discPercent(p)}%
          </div>
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:price_tag:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 5 — dual-tone-split  [PRO]
// Split block: Clean pricing on left, solid contrast accent block on right.
// Responsive flex wrap ensures graceful column stacking on mobile.
// ─────────────────────────────────────────────────────────────────────────────
function dualToneSplit(p: any, id: string): string {
  const f = font(p)
  const rightBg = p.accentColor ?? '#1e1535'
  // Default to electric neon green matching the thumbnail style
  const rightAccent = (p.badgeColor && p.badgeColor !== '#dc2626' && p.badgeColor !== '#ef4444') ? p.badgeColor : '#8fff00'

  return `<!--[riazify:price_tag:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .pt-dts-wrap-${id} {
      flex-wrap: nowrap !important;
      flex-direction: row !important;
    }
    .pt-dts-left-${id} {
      flex: 1 1 auto !important;
      width: auto !important;
      min-width: 0 !important;
      padding: 12px 14px !important;
      text-align: left !important;
    }
    .pt-dts-lbl-${id} {
      font-size: 9px !important;
      margin-bottom: 2px !important;
    }
    .pt-dts-price-${id} {
      font-size: 24px !important;
      margin: 0 0 3px 0 !important;
      line-height: 1.1 !important;
    }
    .pt-dts-msrp-${id} {
      font-size: 10.5px !important;
      line-height: 1.3 !important;
    }
    .pt-dts-right-${id} {
      flex: 0 0 102px !important;
      width: 102px !important;
      min-width: 95px !important;
      padding: 12px 6px !important;
    }
    .pt-dts-savetoday-${id} {
      font-size: 8px !important;
      letter-spacing: 0.8px !important;
    }
    .pt-dts-pct-${id} {
      font-size: 22px !important;
      margin: 2px 0 !important;
      line-height: 1 !important;
    }
    .pt-dts-disc-${id} {
      font-size: 7.5px !important;
      letter-spacing: 0.5px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;margin:0 auto;font-family:${f};border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bg(p)};border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;padding:0;box-sizing:border-box;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
      <div class="pt-dts-wrap-${id}" style="display:flex;flex-wrap:nowrap;width:100%;align-items:stretch;box-sizing:border-box;">
        <!-- Left: Price details -->
        <div class="pt-dts-left-${id}" style="flex:1 1 auto;min-width:0;padding:18px 22px;text-align:left;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;">
          <div class="pt-dts-lbl-${id}" style="font-size:10.5px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;line-height:1.2;">
            Buy It Now Price
          </div>
          <div class="pt-dts-price-${id}" style="font-size:34px;font-weight:900;color:${priceCol(p)};line-height:1.15;margin:0 0 6px 0;letter-spacing:-0.5px;white-space:nowrap;">
            ${itemPrice(p)}
          </div>
          <div class="pt-dts-msrp-${id}" style="font-size:12px;color:${strikeCol(p)};font-weight:500;line-height:1.4;margin:0;white-space:normal;">
            MSRP: <span style="text-decoration:line-through;">${origPrice(p)}</span> &nbsp;&#8226;&nbsp; Free Returns
          </div>
        </div>

        <!-- Right: High-contrast Accent Zone (Pinned on right side with neon green) -->
        <div class="pt-dts-right-${id}" style="flex:0 0 150px;min-width:120px;background-color:${rightBg};padding:18px 14px;text-align:center;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:3px;">
          <div class="pt-dts-savetoday-${id}" style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:1.5px;line-height:1.2;margin:0;white-space:nowrap;">
            Save Today
          </div>
          <div class="pt-dts-pct-${id}" style="font-size:28px;font-weight:900;color:${rightAccent};line-height:1.1;margin:2px 0;white-space:nowrap;">
            ${discPercent(p)}%
          </div>
          <div class="pt-dts-disc-${id}" style="font-size:9.5px;font-weight:800;color:#ffffff;text-transform:uppercase;letter-spacing:1px;line-height:1.2;margin:0;white-space:nowrap;">
            Instant Discount
          </div>
        </div>
      </div>
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
<style>
  @media only screen and (max-width: 680px) {
    .pt-ub-row-${id} { flex-direction: column !important; justify-content: center !important; align-items: center !important; text-align: center !important; gap: 8px !important; padding: 14px 16px !important; }
    .pt-ub-left-${id} { flex: 0 0 auto !important; text-align: center !important; width: 100% !important; min-width: 0 !important; }
    .pt-ub-right-${id} { flex: 0 0 auto !important; text-align: center !important; width: 100% !important; }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;margin:0 auto;font-family:${f};border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="border:1px solid #fecaca;border-radius:10px;overflow:hidden;background-color:${bg(p)};padding:0;box-sizing:border-box;">
      <!-- Top Alert Bar -->
      <div style="background-color:${urgencyBg};padding:9px 16px;text-align:center;box-sizing:border-box;">
        <span style="font-size:11px;font-weight:800;color:#ffffff;text-transform:uppercase;letter-spacing:1.2px;line-height:1.3;display:block;">
          &#9889; Limited Time Promotional Price &nbsp;&#8226;&nbsp; While Stock Lasts
        </span>
      </div>

      <!-- Main Price Row (Centered on Mobile) -->
      <div class="pt-ub-row-${id}" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;padding:18px 22px;box-sizing:border-box;width:100%;">
        <div class="pt-ub-left-${id}" style="flex:1 1 180px;min-width:160px;text-align:left;box-sizing:border-box;">
          <span style="font-size:10.5px;font-weight:800;color:#dc2626;text-transform:uppercase;letter-spacing:0.8px;display:block;margin:0 0 3px 0;line-height:1.2;">
            Flash Deal Active
          </span>
          <div style="font-size:34px;font-weight:900;color:${priceCol(p)};line-height:1.15;letter-spacing:-0.5px;margin:0;">
            ${itemPrice(p)}
            <span style="font-size:15px;color:${strikeCol(p)};font-weight:500;text-decoration:line-through;margin-left:8px;vertical-align:middle;display:inline-block;">
              ${origPrice(p)}
            </span>
          </div>
        </div>

        <div class="pt-ub-right-${id}" style="flex-shrink:0;text-align:right;box-sizing:border-box;">
          <div style="display:inline-block;box-sizing:border-box;background-color:#fee2e2;border:1px solid #fca5a5;padding:8px 16px;border-radius:6px;text-align:center;white-space:nowrap;max-width:100%;">
            <span style="font-size:11.5px;font-weight:800;color:#b91c1c;text-transform:uppercase;display:block;line-height:1.2;letter-spacing:0.5px;">
              Save ${discAmount(p)} (${discPercent(p)}%)
            </span>
          </div>
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:price_tag:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 7 — wholesale-b2b  [PREMIUM]
// 4-column structured matrix: MSRP, Our Price, Total Savings & Unit Economics.
// Overflow wrapper prevents matrix collapsing on narrow mobile viewports.
// ─────────────────────────────────────────────────────────────────────────────
function wholesaleB2b(p: any, id: string): string {
  const f = font(p)
  return `<!--[riazify:price_tag:${id}]-->
<style>
  .pt-wb-col-${id} {
    display: inline-block !important;
    vertical-align: top !important;
    box-sizing: border-box !important;
    float: left !important;
    width: 25% !important;
  }
  .pt-wb-col1-${id},
  .pt-wb-col2-${id},
  .pt-wb-col3-${id} {
    border-right: 1px solid #e2e8f0 !important;
  }
  @media only screen and (max-width: 680px) {
    .pt-wb-col-${id} {
      width: 50% !important;
    }
    /* Mobile 2x2 grid borders */
    .pt-wb-col1-${id},
    .pt-wb-col2-${id} {
      border-bottom: 1px solid #e2e8f0 !important;
    }
    .pt-wb-col2-${id},
    .pt-wb-col4-${id} {
      border-right: none !important;
    }
    .pt-wb-col1-${id},
    .pt-wb-col3-${id} {
      border-right: 1px solid #e2e8f0 !important;
    }
    .pt-wb-head-${id} {
      padding: 9px 4px !important;
      font-size: 9.5px !important;
    }
    .pt-wb-val-${id} {
      padding: 13px 6px !important;
    }
    .pt-wb-price-${id} {
      font-size: 22px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;margin:0 auto;font-family:${f};border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bg(p)};border:1px solid #cbd5e1;border-radius:8px;overflow:hidden;padding:0;box-sizing:border-box;">
      <div style="width:100%;box-sizing:border-box;">
        <!-- Col 1: Standard MSRP -->
        <div class="pt-wb-col-${id} pt-wb-col1-${id}">
          <div class="pt-wb-head-${id}" style="background-color:#f1f5f9;padding:10px 8px;text-align:center;border-bottom:1px solid #e2e8f0;box-sizing:border-box;">
            <span style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;display:block;line-height:1.2;">Standard MSRP</span>
          </div>
          <div class="pt-wb-val-${id}" style="padding:14px 8px;text-align:center;box-sizing:border-box;">
            <span style="font-size:15px;font-weight:600;color:${strikeCol(p)};text-decoration:line-through;display:block;line-height:1.2;">${origPrice(p)}</span>
          </div>
        </div>

        <!-- Col 2: eBay Direct Price -->
        <div class="pt-wb-col-${id} pt-wb-col2-${id}">
          <div class="pt-wb-head-${id}" style="background-color:#e2e8f0;padding:10px 8px;text-align:center;border-bottom:1px solid #e2e8f0;box-sizing:border-box;">
            <span style="font-size:10px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:0.8px;display:block;line-height:1.2;">eBay Direct Price</span>
          </div>
          <div class="pt-wb-val-${id}" style="padding:14px 8px;text-align:center;background-color:#fafafa;box-sizing:border-box;">
            <span class="pt-wb-price-${id}" style="font-size:26px;font-weight:900;color:${priceCol(p)};line-height:1.15;display:block;letter-spacing:-0.4px;">${itemPrice(p)}</span>
          </div>
        </div>

        <!-- Col 3: Your Margin -->
        <div class="pt-wb-col-${id} pt-wb-col3-${id}">
          <div class="pt-wb-head-${id}" style="background-color:#f1f5f9;padding:10px 8px;text-align:center;border-bottom:1px solid #e2e8f0;box-sizing:border-box;">
            <span style="font-size:10px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.8px;display:block;line-height:1.2;">Your Margin</span>
          </div>
          <div class="pt-wb-val-${id}" style="padding:14px 8px;text-align:center;box-sizing:border-box;">
            <span style="font-size:13px;font-weight:800;color:#16a34a;display:block;line-height:1.2;">Save ${discPercent(p)}%</span>
            <span style="display:block;font-size:9.5px;color:#64748b;margin-top:2px;line-height:1.2;">(${discAmount(p)}/unit)</span>
          </div>
        </div>

        <!-- Col 4: Quantity Tier -->
        <div class="pt-wb-col-${id} pt-wb-col4-${id}">
          <div class="pt-wb-head-${id}" style="background-color:#f1f5f9;padding:10px 8px;text-align:center;border-bottom:1px solid #e2e8f0;box-sizing:border-box;">
            <span style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;display:block;line-height:1.2;">Quantity Tier</span>
          </div>
          <div class="pt-wb-val-${id}" style="padding:14px 8px;text-align:center;box-sizing:border-box;">
            <span style="display:inline-block;box-sizing:border-box;background-color:#e0f2fe;color:#0369a1;font-size:9.5px;font-weight:800;padding:4px 8px;border-radius:4px;text-transform:uppercase;white-space:nowrap;line-height:1.2;max-width:100%;">
              Multi-Buy
            </span>
          </div>
        </div>

        <div style="clear:both;"></div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:price_tag:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 8 — modern-glassmorphism  [PREMIUM]
// Contemporary SaaS-styled card with subtle double-border, soft shadow simulation
// and high-end typography hierarchy. Flex container prevents badge overflow.
// ─────────────────────────────────────────────────────────────────────────────
function modernGlassmorphism(p: any, id: string): string {
  const f = font(p)
  const prCol = priceCol(p, '#1e1b4b')
  const stCol = strikeCol(p)
  const acCol = p.accentColor ?? '#4338ca'
  const disc = discPercent(p)

  return `<!--[riazify:price_tag:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .pt-mg-td-${id} {
      padding: 14px 12px !important;
    }
    .pt-mg-wrap-${id} {
      flex-wrap: nowrap !important;
      gap: 10px !important;
    }
    .pt-mg-left-${id} {
      min-width: 0 !important;
      flex: 1 1 auto !important;
    }
    .pt-mg-price-${id} {
      font-size: 25px !important;
      margin-bottom: 4px !important;
    }
    .pt-mg-was-${id} {
      font-size: 13px !important;
      margin-left: 6px !important;
    }
    .pt-mg-verify-${id} {
      font-size: 9.5px !important;
      padding: 3px 8px !important;
    }
    .pt-mg-sub-${id} {
      font-size: 10px !important;
      line-height: 1.3 !important;
    }
    .pt-mg-badge-${id} {
      padding: 8px 10px !important;
      border-radius: 8px !important;
      max-width: 115px !important;
    }
    .pt-mg-badgetxt-${id} {
      font-size: 10.5px !important;
      letter-spacing: 0.5px !important;
    }
    .pt-mg-badgesub-${id} {
      font-size: 8px !important;
      letter-spacing: 0.4px !important;
      margin-top: 2px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;margin:0 auto;font-family:${f};border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td class="pt-mg-td-${id}" style="background-color:${bg(p, '#ffffff')};${pad(p)}border:1px solid #e0e7ff;border-radius:12px;box-shadow:0 4px 14px rgba(79,70,229,0.06);box-sizing:border-box;">
      <div class="pt-mg-wrap-${id}" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:nowrap;gap:16px;width:100%;box-sizing:border-box;">
        <!-- Left: Pricing details & reassuring badges -->
        <div class="pt-mg-left-${id}" style="flex:1 1 auto;min-width:0;text-align:left;box-sizing:border-box;">
          <!-- Top Verified Badge -->
          <div style="margin:0 0 6px 0;">
            <span class="pt-mg-verify-${id}" style="display:inline-block;box-sizing:border-box;background-color:#eef2ff;color:${acCol};font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:1px;padding:4px 12px;border-radius:100px;border:1px solid #c7d2fe;line-height:1.2;">
              &#10003; Verified Best Deal
            </span>
          </div>

          <!-- Price & Strikethrough Row -->
          <div class="pt-mg-price-${id}" style="font-size:34px;font-weight:900;color:${prCol};line-height:1.15;margin:0 0 6px 0;letter-spacing:-0.5px;white-space:nowrap;">
            ${itemPrice(p)}
            <span class="pt-mg-was-${id}" style="font-size:15px;font-weight:500;color:${stCol};text-decoration:line-through;margin-left:8px;vertical-align:middle;display:inline-block;">
              ${origPrice(p)}
            </span>
          </div>

          <!-- Bottom Reassurance Line -->
          <div class="pt-mg-sub-${id}" style="font-size:11.5px;color:#6366f1;font-weight:600;line-height:1.4;letter-spacing:0.2px;margin:0;">
            Guaranteed Authentic &bull; 100% Buyer Protection
          </div>
        </div>

        <!-- Right: Floating discount badge pinned on right -->
        <div style="flex-shrink:0;text-align:right;box-sizing:border-box;">
          <div class="pt-mg-badge-${id}" style="display:inline-block;box-sizing:border-box;background-color:${acCol};color:#ffffff;padding:10px 18px;border-radius:10px;text-align:center;box-shadow:0 3px 10px rgba(67,56,202,0.22);max-width:180px;">
            <span class="pt-mg-badgetxt-${id}" style="font-size:12px;font-weight:800;letter-spacing:0.8px;display:block;line-height:1.2;text-transform:uppercase;white-space:nowrap;">
              ${disc}% DISCOUNT
            </span>
            <span class="pt-mg-badgesub-${id}" style="font-size:9px;color:#c7d2fe;text-transform:uppercase;letter-spacing:0.8px;display:block;margin-top:3px;opacity:0.95;line-height:1.2;white-space:nowrap;">
              Applied at Checkout
            </span>
          </div>
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:price_tag:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 9 — high-contrast-flash  [PREMIUM]
// Dark-themed background with neon green/lime pricing and angled ribbon style.
// Contained layout prevents neon boxes from colliding with parent borders.
// ─────────────────────────────────────────────────────────────────────────────
function highContrastFlash(p: any, id: string): string {
  const f = font(p)
  // Ensure the signature dark slate background and electric neon accent from the thumbnail
  const darkBg = (p.bgColor && p.bgColor !== '#ffffff') ? p.bgColor : '#0f172a'
  const neonCol = (p.badgeColor && p.badgeColor !== '#dc2626') ? p.badgeColor : '#8fff00'

  return `<!--[riazify:price_tag:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .pt-hcf-td-${id} {
      padding: 14px 12px !important;
      border-radius: 0px !important;
    }
    .pt-hcf-wrap-${id} {
      flex-wrap: nowrap !important;
      gap: 10px !important;
    }
    .pt-hcf-left-${id} {
      min-width: 0 !important;
      flex: 1 1 auto !important;
    }
    .pt-hcf-badge-${id} {
      font-size: 9px !important;
      padding: 3px 8px !important;
      border-radius: 0px !important;
    }
    .pt-hcf-price-${id} {
      font-size: 25px !important;
      margin-bottom: 3px !important;
    }
    .pt-hcf-was-${id} {
      font-size: 13px !important;
      margin-left: 6px !important;
    }
    .pt-hcf-sub-${id} {
      font-size: 10px !important;
      line-height: 1.3 !important;
    }
    .pt-hcf-stamp-${id} {
      padding: 8px 10px !important;
      min-width: 82px !important;
      border-radius: 0px !important;
    }
    .pt-hcf-stamp-pct-${id} {
      font-size: 18px !important;
    }
    .pt-hcf-stamp-lbl-${id} {
      font-size: 8.5px !important;
      margin-top: 2px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;margin:0 auto;font-family:${f};border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td class="pt-hcf-td-${id}" style="background-color:${darkBg};${pad(p)}border-radius:0px;border-left:5px solid ${neonCol};box-shadow:0 8px 24px rgba(0,0,0,0.22);box-sizing:border-box;">
      <div class="pt-hcf-wrap-${id}" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:nowrap;gap:16px;width:100%;box-sizing:border-box;">
        <!-- Left: Flash Deal info -->
        <div class="pt-hcf-left-${id}" style="flex:1 1 auto;min-width:0;text-align:left;box-sizing:border-box;">
          <div style="margin:0 0 6px 0;">
            <span class="pt-hcf-badge-${id}" style="background-color:${neonCol};color:#0a0d08;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:1.5px;padding:4px 10px;border-radius:0px;display:inline-block;line-height:1.2;box-sizing:border-box;white-space:nowrap;">
              &#9889; FLASH CLEARANCE
            </span>
          </div>
          <div class="pt-hcf-price-${id}" style="font-size:34px;font-weight:900;color:#ffffff;line-height:1.15;margin:0 0 5px 0;letter-spacing:-0.5px;white-space:nowrap;">
            ${itemPrice(p)}
            <span class="pt-hcf-was-${id}" style="font-size:15px;font-weight:500;color:rgba(255,255,255,0.45);text-decoration:line-through;margin-left:8px;vertical-align:middle;display:inline-block;">
              ${origPrice(p)}
            </span>
          </div>
          <div class="pt-hcf-sub-${id}" style="font-size:11.5px;color:${neonCol};font-weight:700;letter-spacing:0.5px;line-height:1.4;margin:0;">
            Save ${discAmount(p)} &bull; Limited Quantities at this price
          </div>
        </div>

        <!-- Right: Neon Dashed Stamp (Pinned on Right) -->
        <div style="flex-shrink:0;text-align:right;box-sizing:border-box;">
          <div class="pt-hcf-stamp-${id}" style="display:inline-block;box-sizing:border-box;border:2px dashed ${neonCol};padding:10px 16px;border-radius:0px;text-align:center;white-space:nowrap;">
            <div class="pt-hcf-stamp-pct-${id}" style="font-size:22px;font-weight:900;color:${neonCol};line-height:1.1;">
              -${discPercent(p)}%
            </div>
            <div class="pt-hcf-stamp-lbl-${id}" style="font-size:9.5px;font-weight:800;color:#ffffff;text-transform:uppercase;letter-spacing:1px;margin-top:3px;line-height:1.2;">
              Instant Off
            </div>
          </div>
        </div>
      </div>
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
  style="width:100%;width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#ffffff')};${pad(p)}border:1px solid #d1d5db;border-top:3px solid ${gold};border-radius:6px;text-align:center;box-sizing:border-box;">
      <div style="font-size:10.5px;font-weight:700;color:${gold};text-transform:uppercase;letter-spacing:2.5px;margin:0 0 8px 0;line-height:1.2;">
        &#9733; Exclusive Offering &#9733;
      </div>
      <div style="font-size:34px;font-weight:700;color:${priceCol(p, '#111827')};line-height:1.15;margin:0 0 8px 0;letter-spacing:0.5px;">
        ${itemPrice(p)}
      </div>
      <div style="font-size:12px;color:#6b7280;margin:0 0 12px 0;line-height:1.4;">
        Original Retail: <span style="text-decoration:line-through;color:${strikeCol(p)};">${origPrice(p)}</span>
        &nbsp;&bull;&nbsp;
        <span style="color:${gold};font-weight:600;">Privilege Savings ${discPercent(p)}%</span>
      </div>
      <div style="display:inline-block;box-sizing:border-box;border-top:1px solid #e5e7eb;padding-top:10px;font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.8px;font-family:Arial,sans-serif;line-height:1.4;max-width:92%;">
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
