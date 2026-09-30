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
    const bColor = p.borderColor ?? '#e2e8f0'
    return `<!--[riazify:price_tag:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p)};${pad(p)}border:1px solid ${bColor};border-radius:10px;box-sizing:border-box;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;width:100%;box-sizing:border-box;">
        <!-- Left: Original Retail / Strikethrough -->
        <div style="flex:1 1 140px;min-width:120px;text-align:left;box-sizing:border-box;">
          <span style="font-size:10.5px;font-weight:700;color:${strikeCol(p)};text-transform:uppercase;letter-spacing:1px;display:block;margin:0 0 3px 0;line-height:1.2;">Original Price</span>
          <span style="font-size:16px;font-weight:600;color:${strikeCol(p)};text-decoration:line-through;line-height:1.2;white-space:nowrap;">Was ${origPrice(p)}</span>
        </div>

        <!-- Center: Current Active Price -->
        <div style="flex-shrink:0;text-align:center;padding:0 6px;box-sizing:border-box;">
          <span style="font-size:34px;font-weight:900;color:${priceCol(p)};line-height:1.15;letter-spacing:-0.5px;white-space:nowrap;display:inline-block;">${itemPrice(p)}</span>
        </div>

        <!-- Right: Contained Savings Badge -->
        <div style="flex:1 1 140px;min-width:120px;text-align:right;box-sizing:border-box;">
          <span style="display:inline-block;box-sizing:border-box;background-color:${badgeBg(p)};color:${badgeTxt(p)};font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;padding:8px 16px;border-radius:6px;box-shadow:0 2px 6px rgba(0,0,0,0.12);white-space:nowrap;line-height:1.2;max-width:100%;">
            SAVE ${discPercent(p)}%
          </span>
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
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
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
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
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
    const pillCol = badgeBg(p, '#8fff00')
    const pillTxt = badgeTxt(p, '#0a0d08')
    return `<!--[riazify:price_tag:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#f8fafc')};${pad(p)}border:1px solid #e2e8f0;border-radius:12px;box-sizing:border-box;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;width:100%;box-sizing:border-box;">
        <!-- Left: Pricing Info -->
        <div style="flex:1 1 200px;min-width:180px;text-align:left;box-sizing:border-box;">
          <div style="font-size:10.5px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;line-height:1.2;">
            Special Listing Price
          </div>
          <div style="font-size:34px;font-weight:900;color:${priceCol(p)};line-height:1.15;margin:0 0 6px 0;letter-spacing:-0.5px;">
            ${itemPrice(p)}
            <span style="font-size:15px;font-weight:500;color:${strikeCol(p)};text-decoration:line-through;margin-left:8px;vertical-align:middle;display:inline-block;">${origPrice(p)}</span>
          </div>
          <div style="font-size:11px;color:#16a34a;font-weight:700;line-height:1.3;margin:0;">
            &#10003; In Stock &amp; Ready for Fast Dispatch
          </div>
        </div>

        <!-- Right: Prominent Contained Pill Badge -->
        <div style="flex-shrink:0;text-align:right;box-sizing:border-box;">
          <div style="display:inline-block;box-sizing:border-box;background-color:${pillCol};color:${pillTxt};font-size:12.5px;font-weight:800;letter-spacing:0.8px;text-transform:uppercase;padding:10px 20px;border-radius:100px;text-align:center;box-shadow:0 3px 8px rgba(0,0,0,0.08);white-space:nowrap;line-height:1.2;max-width:100%;">
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
    const rightAccent = p.badgeColor ?? '#b8fa33'
    return `<!--[riazify:price_tag:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p)};border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;padding:0;box-sizing:border-box;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
      <div style="display:flex;flex-wrap:wrap;width:100%;align-items:stretch;box-sizing:border-box;">
        <!-- Left: Price details -->
        <div style="flex:1 1 260px;min-width:200px;padding:20px 24px;text-align:left;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;">
          <div style="font-size:10.5px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;line-height:1.2;">
            Buy It Now Price
          </div>
          <div style="font-size:34px;font-weight:900;color:${priceCol(p)};line-height:1.15;margin:0 0 6px 0;letter-spacing:-0.5px;">
            ${itemPrice(p)}
          </div>
          <div style="font-size:12px;color:${strikeCol(p)};font-weight:500;line-height:1.4;margin:0;">
            MSRP: <span style="text-decoration:line-through;">${origPrice(p)}</span> &nbsp;&#8226;&nbsp; Free Returns
          </div>
        </div>

        <!-- Right: High-contrast Accent Zone -->
        <div style="flex:0 1 170px;min-width:140px;background-color:${rightBg};padding:20px 16px;text-align:center;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:4px;">
          <div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:1.5px;line-height:1.2;margin:0;">
            Save Today
          </div>
          <div style="font-size:28px;font-weight:900;color:${rightAccent};line-height:1.1;margin:2px 0;">
            ${discPercent(p)}%
          </div>
          <div style="font-size:9.5px;font-weight:800;color:#ffffff;text-transform:uppercase;letter-spacing:1px;line-height:1.2;margin:0;">
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
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="border:1px solid #fecaca;border-radius:10px;overflow:hidden;background-color:${bg(p)};padding:0;box-sizing:border-box;">
      <!-- Top Alert Bar -->
      <div style="background-color:${urgencyBg};padding:9px 16px;text-align:center;box-sizing:border-box;">
        <span style="font-size:11px;font-weight:800;color:#ffffff;text-transform:uppercase;letter-spacing:1.2px;line-height:1.3;display:block;">
          &#9889; Limited Time Promotional Price &nbsp;&#8226;&nbsp; While Stock Lasts
        </span>
      </div>

      <!-- Main Price Row -->
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;padding:18px 22px;box-sizing:border-box;width:100%;">
        <div style="flex:1 1 180px;min-width:160px;text-align:left;box-sizing:border-box;">
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

        <div style="flex-shrink:0;text-align:right;box-sizing:border-box;">
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
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p)};border:1px solid #cbd5e1;border-radius:8px;overflow:hidden;padding:0;box-sizing:border-box;">
      <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;min-width:440px;table-layout:fixed;">
          <tr style="background-color:#f1f5f9;">
            <th width="24%" style="padding:10px 8px;text-align:center;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;font-weight:700;box-sizing:border-box;">
              <span style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;display:block;line-height:1.2;">Standard MSRP</span>
            </th>
            <th width="28%" style="padding:10px 8px;text-align:center;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;background-color:#e2e8f0;font-weight:800;box-sizing:border-box;">
              <span style="font-size:10px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:0.8px;display:block;line-height:1.2;">eBay Direct Price</span>
            </th>
            <th width="25%" style="padding:10px 8px;text-align:center;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;font-weight:700;box-sizing:border-box;">
              <span style="font-size:10px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.8px;display:block;line-height:1.2;">Your Margin</span>
            </th>
            <th width="23%" style="padding:10px 8px;text-align:center;border-bottom:1px solid #e2e8f0;font-weight:700;box-sizing:border-box;">
              <span style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;display:block;line-height:1.2;">Quantity Tier</span>
            </th>
          </tr>
          <tr>
            <td style="padding:14px 8px;text-align:center;border-right:1px solid #e2e8f0;vertical-align:middle;box-sizing:border-box;">
              <span style="font-size:15px;font-weight:600;color:${strikeCol(p)};text-decoration:line-through;display:block;line-height:1.2;">${origPrice(p)}</span>
            </td>
            <td style="padding:14px 8px;text-align:center;border-right:1px solid #e2e8f0;vertical-align:middle;background-color:#fafafa;box-sizing:border-box;">
              <span style="font-size:26px;font-weight:900;color:${priceCol(p)};line-height:1.15;display:block;letter-spacing:-0.4px;">${itemPrice(p)}</span>
            </td>
            <td style="padding:14px 8px;text-align:center;border-right:1px solid #e2e8f0;vertical-align:middle;box-sizing:border-box;">
              <span style="font-size:13px;font-weight:800;color:#16a34a;display:block;line-height:1.2;">Save ${discPercent(p)}%</span>
              <span style="display:block;font-size:9.5px;color:#64748b;margin-top:2px;line-height:1.2;">(${discAmount(p)}/unit)</span>
            </td>
            <td style="padding:14px 8px;text-align:center;vertical-align:middle;box-sizing:border-box;">
              <span style="display:inline-block;box-sizing:border-box;background-color:#e0f2fe;color:#0369a1;font-size:9.5px;font-weight:800;padding:4px 8px;border-radius:4px;text-transform:uppercase;white-space:nowrap;line-height:1.2;max-width:100%;">
                Multi-Buy
              </span>
            </td>
          </tr>
        </table>
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
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#ffffff')};${pad(p)}border:1px solid #e0e7ff;border-radius:12px;box-shadow:0 4px 14px rgba(79,70,229,0.06);box-sizing:border-box;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;width:100%;box-sizing:border-box;">
        <!-- Left: Pricing details & reassuring badges -->
        <div style="flex:1 1 220px;min-width:200px;text-align:left;box-sizing:border-box;">
          <!-- Top Verified Badge -->
          <div style="margin:0 0 8px 0;">
            <span style="display:inline-block;box-sizing:border-box;background-color:#eef2ff;color:${acCol};font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:1px;padding:4px 12px;border-radius:100px;border:1px solid #c7d2fe;line-height:1.2;">
              &#10003; Verified Best Deal
            </span>
          </div>

          <!-- Price & Strikethrough Row -->
          <div style="font-size:34px;font-weight:900;color:${prCol};line-height:1.15;margin:0 0 6px 0;letter-spacing:-0.5px;">
            ${itemPrice(p)}
            <span style="font-size:15px;font-weight:500;color:${stCol};text-decoration:line-through;margin-left:8px;vertical-align:middle;display:inline-block;">
              ${origPrice(p)}
            </span>
          </div>

          <!-- Bottom Reassurance Line -->
          <div style="font-size:11.5px;color:#6366f1;font-weight:600;line-height:1.4;letter-spacing:0.2px;margin:0;">
            Guaranteed Authentic &bull; 100% Buyer Protection
          </div>
        </div>

        <!-- Right: Floating discount badge neatly contained -->
        <div style="flex-shrink:0;text-align:right;box-sizing:border-box;">
          <div style="display:inline-block;box-sizing:border-box;background-color:${acCol};color:#ffffff;padding:10px 18px;border-radius:10px;text-align:center;box-shadow:0 3px 10px rgba(67,56,202,0.22);max-width:200px;">
            <span style="font-size:12px;font-weight:800;letter-spacing:0.8px;display:block;line-height:1.2;text-transform:uppercase;word-break:break-word;">
              ${disc}% DISCOUNT
            </span>
            <span style="font-size:9px;color:#c7d2fe;text-transform:uppercase;letter-spacing:0.8px;display:block;margin-top:3px;opacity:0.95;line-height:1.2;">
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
    const darkBg = p.bgColor ?? '#0f172a'
    const neonCol = p.badgeColor ?? '#8fff00'
    return `<!--[riazify:price_tag:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${darkBg};${pad(p)}border-radius:12px;border-left:5px solid ${neonCol};box-sizing:border-box;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;width:100%;box-sizing:border-box;">
        <!-- Left: Flash Deal info -->
        <div style="flex:1 1 220px;min-width:180px;text-align:left;box-sizing:border-box;">
          <div style="margin:0 0 8px 0;">
            <span style="background-color:${neonCol};color:#0a0d08;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:1.5px;padding:4px 10px;border-radius:4px;display:inline-block;line-height:1.2;box-sizing:border-box;">
              &#9889; FLASH CLEARANCE
            </span>
          </div>
          <div style="font-size:34px;font-weight:900;color:#ffffff;line-height:1.15;margin:0 0 6px 0;letter-spacing:-0.5px;">
            ${itemPrice(p)}
            <span style="font-size:15px;font-weight:500;color:rgba(255,255,255,0.45);text-decoration:line-through;margin-left:8px;vertical-align:middle;display:inline-block;">${origPrice(p)}</span>
          </div>
          <div style="font-size:11.5px;color:${neonCol};font-weight:700;letter-spacing:0.5px;line-height:1.4;margin:0;">
            Save ${discAmount(p)} &bull; Limited Quantities at this price
          </div>
        </div>

        <!-- Right: Neon Dashed Stamp -->
        <div style="flex-shrink:0;text-align:right;box-sizing:border-box;">
          <div style="display:inline-block;box-sizing:border-box;border:2px dashed ${neonCol};padding:10px 16px;border-radius:8px;text-align:center;white-space:nowrap;max-width:100%;">
            <div style="font-size:22px;font-weight:900;color:${neonCol};line-height:1.1;">
              -${discPercent(p)}%
            </div>
            <div style="font-size:9.5px;font-weight:800;color:#ffffff;text-transform:uppercase;letter-spacing:1px;margin-top:3px;line-height:1.2;">
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
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
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
