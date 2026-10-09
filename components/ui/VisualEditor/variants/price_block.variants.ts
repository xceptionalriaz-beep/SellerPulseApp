// components/ui/VisualEditor/variants/price_block.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Price Block — 10 layout variants (Thumbnail Matched, 100% Curve-Free)
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
  id: string
  label: string
  description: string
  toHtml: (props: any, id: string) => string
}

function pad(p: any): string {
  return `padding:${p.paddingTop ?? 16}px ${p.paddingRight ?? 20}px ${p.paddingBottom ?? 16}px ${p.paddingLeft ?? 20}px;`
}

function wrap(id: string, inner: string, p: any, mobileStyle: string = ''): string {
  return `<!--[riazify:price_block:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${p.bgColor ?? '#f8f7ff'};">
  <tr><td style="${pad(p)}">${inner}</td></tr>
</table>
<!--[/riazify:price_block:${id}]-->`
}

export const priceBlockVariants: BlockVariant[] = [

  // ── 1. Simple Price ───────────────────────────────────────────────────────
  {
    id: 'simple',
    label: 'Simple Price',
    description: 'Clean price only — minimal, no distractions',
    toHtml(p: any, id: string): string {
      const price = p.priceText && p.priceText !== '{{ITEM_PRICE}}' ? p.priceText : '$19.99'
      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pb-simple-${id} { font-size:${Math.min(p.priceFontSize ?? 32, 28)}px !important; text-align:center !important; }
}
</style>`
      return wrap(id, `
      <p class="pb-simple-${id}" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.priceFontSize ?? 32}px;font-weight:${p.priceFontWeight ?? '900'};color:${p.priceColor ?? '#7530fb'};line-height:1.2;text-align:${p.priceAlign ?? 'left'};">
        ${price}
      </p>`, p, mobileStyle)
    },
  },

  // ── 2. Sale Price (Fixed: Matches Thumbnail Red Price + Green Badge) ──────
  {
    id: 'sale',
    label: 'Sale Price',
    description: 'Sale price with original crossed out and savings badge',
    toHtml(p: any, id: string): string {
      const price = p.priceText && p.priceText !== '{{ITEM_PRICE}}' ? p.priceText : '$19.99'
      const orig = p.originalText && p.originalText !== '{{ORIGINAL_PRICE}}' ? p.originalText : '$29.99'
      const savings = (p.savingsText && p.savingsText !== 'Save {{DISCOUNT_AMOUNT}}') ? p.savingsText : 'Save 33%'

      // Thumbnail uses Red for sale price and Lime Green for savings badge
      const saleRed = (p.saleColor) ? p.saleColor : (p.priceColor && p.priceColor !== '#7530fb' ? p.priceColor : '#dc2626')
      const badgeBg = p.badgeBg ?? '#b8fa33'
      const badgeColor = p.badgeColor ?? '#1e1535'

      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pb-sale-row-${id} { display:block !important; width:100% !important; text-align:center !important; }
  .pb-sale-left-${id} { display:block !important; width:100% !important; text-align:center !important; margin-bottom:10px !important; }
  .pb-sale-right-${id} { display:block !important; width:100% !important; text-align:center !important; }
  .pb-sale-price-${id} { font-size:${Math.min(p.priceFontSize ?? 36, 30)}px !important; }
}
</style>`
      return wrap(id, `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
        <tr class="pb-sale-row-${id}">
          <td class="pb-sale-left-${id}" style="vertical-align:middle;text-align:left;">
            <span class="pb-sale-price-${id}" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.priceFontSize ?? 36}px;font-weight:${p.priceFontWeight ?? '900'};color:${saleRed};line-height:1;display:inline-block;vertical-align:middle;">
              ${price}
            </span>
            <span style="font-family:Arial,sans-serif;font-size:${p.originalFontSize ?? 18}px;color:${p.originalColor ?? '#9ca3af'};text-decoration:line-through;margin-left:12px;vertical-align:middle;display:inline-block;">
              ${orig}
            </span>
          </td>
          <td class="pb-sale-right-${id}" align="right" style="text-align:right;vertical-align:middle;">
            <span style="display:inline-block;background-color:${badgeBg};color:${badgeColor};font-family:Arial,sans-serif;font-size:${p.badgeFontSize ?? 12}px;font-weight:800;padding:6px 14px;letter-spacing:0.02em;">
              ${savings}
            </span>
          </td>
        </tr>
      </table>`, p, mobileStyle)
    },
  },

  // ── 3. Price + Urgency Combined ───────────────────────────────────────────
  {
    id: 'urgency',
    label: 'Price + Urgency',
    description: 'Price with low-stock urgency bar below',
    toHtml(p: any, id: string): string {
      const price = p.priceText && p.priceText !== '{{ITEM_PRICE}}' ? p.priceText : '$19.99'
      const urgency = p.urgencyText && p.urgencyText !== 'Only {{QUANTITY}} left in stock' ? p.urgencyText : 'Only 3 left in stock'

      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pb-urg-top-${id} { text-align:center !important; }
  .pb-urg-bot-${id} { text-align:center !important; }
}
</style>`
      return `<!--[riazify:price_block:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;">
  <tr>
    <td class="pb-urg-top-${id}" style="background-color:${p.bgColor ?? '#f8f7ff'};${pad(p)}">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.priceFontSize ?? 32}px;font-weight:${p.priceFontWeight ?? '900'};color:${p.priceColor ?? '#7530fb'};line-height:1.2;text-align:${p.priceAlign ?? 'left'};">
        ${price}
        ${p.showBadge ? `<span style="display:inline-block;background-color:${p.badgeBg ?? '#b8fa33'};color:${p.badgeColor ?? '#1e1535'};font-family:Arial,sans-serif;font-size:${p.badgeFontSize ?? 11}px;font-weight:700;padding:3px 8px;margin-left:10px;vertical-align:middle;">${p.badgeText ?? 'SALE'}</span>` : ''}
      </p>
    </td>
  </tr>
  <tr>
    <td class="pb-urg-bot-${id}" style="background-color:${p.urgencyBg ?? '#fef2f2'};padding:10px 20px;text-align:left;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:${p.urgencyColor ?? '#991b1b'};">
        🔴 ${urgency}
      </p>
    </td>
  </tr>
</table>
<!--[/riazify:price_block:${id}]-->`
    },
  },

  // ── 4. Compact Inline ─────────────────────────────────────────────────────
  {
    id: 'compact',
    label: 'Compact Inline',
    description: 'Small price left, condition and SKU right — centered on mobile',
    toHtml(p: any, id: string): string {
      const price = p.priceText && p.priceText !== '{{ITEM_PRICE}}' ? p.priceText : '$19.99'
      const orig = p.originalText && p.originalText !== '{{ORIGINAL_PRICE}}' ? p.originalText : '$29.99'
      const condition = p.conditionText || (p.itemCondition && p.itemCondition !== '{{ITEM_CONDITION}}' ? p.itemCondition : 'Brand New')
      const sku = p.skuText || (p.itemSku && p.itemSku !== '{{ITEM_SKU}}' ? p.itemSku : 'PROD-8821')

      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pb-ci-row-${id} { display:block !important; width:100% !important; text-align:center !important; }
  .pb-ci-left-${id} { display:block !important; width:100% !important; text-align:center !important; margin:0 0 8px 0 !important; }
  .pb-ci-right-${id} { display:block !important; width:100% !important; text-align:center !important; margin:0 auto !important; }
  .pb-ci-cond-${id} { text-align:center !important; margin:0 auto !important; }
  .pb-ci-sku-${id} { text-align:center !important; margin:3px auto 0 !important; }
}
</style>`
      return wrap(id, `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
        <tr class="pb-ci-row-${id}">
          <td class="pb-ci-left-${id}" style="vertical-align:middle;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:${Math.min(p.priceFontSize ?? 24, 28)}px;font-weight:${p.priceFontWeight ?? '900'};color:${p.priceColor ?? '#7530fb'};">
              ${price}
            </span>
            ${p.showOriginal ? `<span style="font-family:Arial,sans-serif;font-size:13px;color:${p.originalColor ?? '#9ca3af'};text-decoration:line-through;margin-left:8px;">${orig}</span>` : ''}
          </td>
          <td class="pb-ci-right-${id}" style="text-align:right;vertical-align:middle;">
            <p class="pb-ci-cond-${id}" style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#6b7280;">Condition: <strong>${condition}</strong></p>
            <p class="pb-ci-sku-${id}" style="margin:2px 0 0;font-family:Arial,sans-serif;font-size:10px;color:#9ca3af;">SKU: ${sku}</p>
          </td>
        </tr>
      </table>`, p, mobileStyle)
    },
  },

  // ── 5. Price Range ────────────────────────────────────────────────────────
  {
    id: 'range',
    label: 'Price Range',
    description: 'From/to price range for multi-variant listings',
    toHtml(p: any, id: string): string {
      const minPrice = p.priceText && p.priceText !== '{{ITEM_PRICE}}' ? p.priceText : '$19.99'
      const maxPrice = p.priceRangeMax && p.priceRangeMax !== '{{PRICE_MAX}}' ? p.priceRangeMax : '$39.99'

      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pb-range-title-${id} { text-align:center !important; }
  .pb-range-price-${id} { text-align:center !important; font-size:${Math.min(p.priceFontSize ?? 32, 26)}px !important; }
  .pb-range-sub-${id}   { text-align:center !important; }
}
</style>`
      return wrap(id, `
      <p class="pb-range-title-${id}" style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;text-align:${p.priceAlign ?? 'left'};">
        Starting from
      </p>
      <p class="pb-range-price-${id}" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.priceFontSize ?? 32}px;font-weight:${p.priceFontWeight ?? '900'};color:${p.priceColor ?? '#7530fb'};line-height:1.2;text-align:${p.priceAlign ?? 'left'};">
        ${minPrice}
        <span style="font-family:Arial,sans-serif;font-size:${(p.priceFontSize ?? 32) * 0.55}px;font-weight:400;color:#6b7280;margin:0 10px;">—</span>
        ${maxPrice}
      </p>
      <p class="pb-range-sub-${id}" style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#9ca3af;text-align:${p.priceAlign ?? 'left'};">
        Price varies by variant — select options below
      </p>`, p, mobileStyle)
    },
  },

  // ── 6. Auction Style ──────────────────────────────────────────────────────
  {
    id: 'auction',
    label: 'Auction Style',
    description: 'Current bid, number of bids and time left',
    toHtml(p: any, id: string): string {
      const price = p.priceText && p.priceText !== '{{ITEM_PRICE}}' ? p.priceText : '$19.99'
      const bids = p.bidCount && p.bidCount !== '{{BID_COUNT}}' ? p.bidCount : '14'
      const timeLeft = p.timeLeft && p.timeLeft !== '{{TIME_LEFT}}' ? p.timeLeft : '2d 04h'

      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pb-auc-header-${id} { text-align:center !important; }
  .pb-auc-subrow-${id} { display:block !important; width:100% !important; text-align:center !important; }
  .pb-auc-subleft-${id} { display:block !important; width:100% !important; text-align:center !important; padding:6px 0 !important; }
  .pb-auc-subright-${id} { display:block !important; width:100% !important; text-align:center !important; padding:4px 0 !important; }
}
</style>`
      return `<!--[riazify:price_block:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${p.bgColor ?? '#f8f7ff'};">
  <tr>
    <td style="${pad(p)}">
      <div class="pb-auc-header-${id}">
        <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;">Current bid</p>
        <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:${p.priceFontSize ?? 36}px;font-weight:${p.priceFontWeight ?? '900'};color:${p.priceColor ?? '#7530fb'};line-height:1;">
          ${price}
        </p>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #e5e7eb;padding-top:10px;">
        <tr class="pb-auc-subrow-${id}">
          <td class="pb-auc-subleft-${id}" style="padding-top:10px;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#374151;">
              <strong>${bids}</strong> bids &nbsp;·&nbsp;
              <strong style="color:${p.reserveMet ? '#16a34a' : '#dc2626'};">${p.reserveMet ? 'Reserve met' : 'Reserve not met'}</strong>
            </p>
          </td>
          <td class="pb-auc-subright-${id}" style="text-align:right;padding-top:10px;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#374151;">
              Time left: <strong style="color:#dc2626;">${timeLeft}</strong>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:price_block:${id}]-->`
    },
  },

  // ── 7. Bundle Price ───────────────────────────────────────────────────────
  {
    id: 'bundle',
    label: 'Bundle Price',
    description: 'Tiered multi-buy pricing table',
    toHtml(p: any, id: string): string {
      const accentBg = p.priceColor ?? '#7530fb'
      const price = p.priceText && p.priceText !== '{{ITEM_PRICE}}' ? p.priceText : '$19.99'
      const tier1Price = p.bundleTier1Price && p.bundleTier1Price !== '{{BUNDLE_PRICE_2}}' ? p.bundleTier1Price : '$17.99'
      const tier2Price = p.bundleTier2Price && p.bundleTier2Price !== '{{BUNDLE_PRICE_3}}' ? p.bundleTier2Price : '$15.99'
      const tier3Price = p.bundleTier3Price && p.bundleTier3Price !== '{{BUNDLE_PRICE_5}}' ? p.bundleTier3Price : '$13.99'

      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pb-bnd-head-${id} { text-align:center !important; }
  .pb-bnd-cell-${id} { padding:8px 8px !important; font-size:11px !important; }
}
</style>`
      return `<!--[riazify:price_block:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${p.bgColor ?? '#f8f7ff'};">
  <tr><td style="${pad(p)}">
    <p class="pb-bnd-head-${id}" style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#1e1535;">Multi-Buy Savings</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
      <tr style="background-color:${accentBg};">
        <td class="pb-bnd-cell-${id}" style="padding:8px 14px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#ffffff;">Quantity</td>
        <td class="pb-bnd-cell-${id}" style="padding:8px 14px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#ffffff;">Price each</td>
        <td class="pb-bnd-cell-${id}" style="padding:8px 14px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#ffffff;">You save</td>
      </tr>
      <tr style="background-color:#ffffff;">
        <td class="pb-bnd-cell-${id}" style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#374151;border-bottom:1px solid #f3f4f6;">1</td>
        <td class="pb-bnd-cell-${id}" style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;">${price}</td>
        <td class="pb-bnd-cell-${id}" style="padding:10px 14px;font-family:Arial,sans-serif;font-size:12px;color:#9ca3af;border-bottom:1px solid #f3f4f6;">—</td>
      </tr>
      <tr style="background-color:#f8f7ff;">
        <td class="pb-bnd-cell-${id}" style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#374151;border-bottom:1px solid #f3f4f6;">${p.bundleTier1Qty ?? 2}+</td>
        <td class="pb-bnd-cell-${id}" style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${accentBg};border-bottom:1px solid #f3f4f6;">${tier1Price}</td>
        <td class="pb-bnd-cell-${id}" style="padding:10px 14px;font-family:Arial,sans-serif;font-size:12px;color:#16a34a;font-weight:700;border-bottom:1px solid #f3f4f6;">Save more</td>
      </tr>
      <tr style="background-color:#ffffff;">
        <td class="pb-bnd-cell-${id}" style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#374151;border-bottom:1px solid #f3f4f6;">${p.bundleTier2Qty ?? 3}+</td>
        <td class="pb-bnd-cell-${id}" style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${accentBg};border-bottom:1px solid #f3f4f6;">${tier2Price}</td>
        <td class="pb-bnd-cell-${id}" style="padding:10px 14px;font-family:Arial,sans-serif;font-size:12px;color:#16a34a;font-weight:700;border-bottom:1px solid #f3f4f6;">Save even more</td>
      </tr>
      <tr style="background-color:#f8f7ff;">
        <td class="pb-bnd-cell-${id}" style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#374151;">${p.bundleTier3Qty ?? 5}+</td>
        <td class="pb-bnd-cell-${id}" style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${accentBg};">${tier3Price}</td>
        <td class="pb-bnd-cell-${id}" style="padding:10px 14px;font-family:Arial,sans-serif;font-size:12px;color:#16a34a;font-weight:700;">Best value</td>
      </tr>
    </table>
  </td></tr>
</table>
<!--[/riazify:price_block:${id}]-->`
    },
  },

  // ── 8. Finance / Monthly ──────────────────────────────────────────────────
  {
    id: 'finance',
    label: 'Finance / Monthly',
    description: 'Monthly payment amount with full price and finance note',
    toHtml(p: any, id: string): string {
      const price = p.priceText && p.priceText !== '{{ITEM_PRICE}}' ? p.priceText : '$19.99'
      const monthly = p.monthlyPrice && p.monthlyPrice !== '{{MONTHLY_PRICE}}' ? p.monthlyPrice : '$4.99'

      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pb-fin-row-${id} { display:block !important; width:100% !important; text-align:center !important; }
  .pb-fin-left-${id} { display:block !important; width:100% !important; text-align:center !important; margin-bottom:12px !important; }
  .pb-fin-right-${id} { display:block !important; width:100% !important; text-align:center !important; }
  .pb-fin-badge-${id} { margin:0 auto !important; }
  .pb-fin-disc-${id} { text-align:center !important; }
}
</style>`
      return `<!--[riazify:price_block:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${p.bgColor ?? '#f8f7ff'};">
  <tr><td style="${pad(p)}">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
      <tr class="pb-fin-row-${id}">
        <td class="pb-fin-left-${id}" style="vertical-align:middle;">
          <p style="margin:0 0 2px;font-family:Arial,sans-serif;font-size:11px;color:#6b7280;">From</p>
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.priceFontSize ?? 32}px;font-weight:${p.priceFontWeight ?? '900'};color:${p.priceColor ?? '#7530fb'};line-height:1;">
            ${monthly}
            <span style="font-family:Arial,sans-serif;font-size:14px;font-weight:400;color:#6b7280;">/month</span>
          </p>
          <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;">
            Or <strong>${price}</strong> full price
          </p>
        </td>
        <td class="pb-fin-right-${id}" style="text-align:right;vertical-align:middle;">
          <table class="pb-fin-badge-${id}" cellpadding="0" cellspacing="0" border="0" align="right" style="display:inline-table;">
            <tr>
              <td style="background-color:${p.priceColor ?? '#7530fb'};padding:6px 14px;text-align:center;">
                <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#ffffff;">0% Finance</p>
                <p style="margin:2px 0 0;font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.8);">Available</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p class="pb-fin-disc-${id}" style="margin:10px 0 0;font-family:Arial,sans-serif;font-size:10px;color:#9ca3af;">
      ${p.financeText ?? '0% interest available — Subject to status'}
    </p>
  </td></tr>
</table>
<!--[/riazify:price_block:${id}]-->`
    },
  },

  // ── 9. Trade / Wholesale (Fixed: Dark Background Matching Thumbnail) ───────
  {
    id: 'trade',
    label: 'Trade / Wholesale',
    description: 'Trade price with RRP and bulk pricing CTA',
    toHtml(p: any, id: string): string {
      const trade = p.tradePrice && p.tradePrice !== '{{TRADE_PRICE}}' ? p.tradePrice : '$12.50'
      const rrp = p.rrpText && p.rrpText !== '{{RRP_PRICE}}' ? p.rrpText : '$24.99'

      // Enforce dark background color to match thumbnail (even if block bgColor is #f8f7ff)
      const tradeBg = p.tradeBg || (p.bgColor && p.bgColor !== '#f8f7ff' ? p.bgColor : '#1e293b')

      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pb-tr-row-${id} { display:block !important; width:100% !important; text-align:center !important; }
  .pb-tr-left-${id} { display:block !important; width:100% !important; text-align:center !important; margin-bottom:12px !important; }
  .pb-tr-right-${id} { display:block !important; width:100% !important; text-align:center !important; }
  .pb-tr-btn-${id} { margin:0 auto !important; }
}
</style>`
      return `<!--[riazify:price_block:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${tradeBg};">
  <tr><td style="${pad(p)}">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
      <tr class="pb-tr-row-${id}">
        <td class="pb-tr-left-${id}" style="vertical-align:middle;text-align:left;">
          <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">Trade Price</p>
          <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:${p.priceFontSize ?? 32}px;font-weight:${p.priceFontWeight ?? '900'};color:#ffffff;line-height:1;">
            ${trade}
          </p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#94a3b8;">
            RRP: <span style="text-decoration:line-through;color:#64748b;">${rrp}</span>
          </p>
        </td>
        <td class="pb-tr-right-${id}" style="text-align:right;vertical-align:middle;">
          <table class="pb-tr-btn-${id}" cellpadding="0" cellspacing="0" border="0" align="right" style="display:inline-table;">
            <tr>
              <td style="border:1px solid #475569;background-color:rgba(255,255,255,0.06);padding:8px 16px;text-align:center;">
                <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:600;color:#f1f5f9;">${p.tradeCta ?? 'Contact us for bulk pricing'}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
<!--[/riazify:price_block:${id}]-->`
    },
  },

  // ── 10. Free Shipping Highlight ───────────────────────────────────────────
  {
    id: 'free-shipping',
    label: 'Free Shipping',
    description: 'Price with prominent free delivery badge and estimated date',
    toHtml(p: any, id: string): string {
      const price = p.priceText && p.priceText !== '{{ITEM_PRICE}}' ? p.priceText : '$19.99'
      const orig = p.originalText && p.originalText !== '{{ORIGINAL_PRICE}}' ? p.originalText : '$29.99'

      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pb-fs-row-${id} { display:block !important; width:100% !important; text-align:center !important; }
  .pb-fs-left-${id} { display:block !important; width:100% !important; text-align:center !important; margin-bottom:10px !important; }
  .pb-fs-right-${id} { display:block !important; width:100% !important; text-align:center !important; }
  .pb-fs-badge-${id} { margin:0 auto !important; }
}
</style>`
      return `<!--[riazify:price_block:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${p.bgColor ?? '#f8f7ff'};">
  <tr><td style="${pad(p)}">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
      <tr class="pb-fs-row-${id}">
        <td class="pb-fs-left-${id}" style="vertical-align:middle;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.priceFontSize ?? 32}px;font-weight:${p.priceFontWeight ?? '900'};color:${p.priceColor ?? '#7530fb'};line-height:1.2;">
            ${price}
          </p>
          ${p.showOriginal ? `<p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:13px;color:${p.originalColor ?? '#9ca3af'};"><span style="text-decoration:line-through;">${orig}</span></p>` : ''}
        </td>
        <td class="pb-fs-right-${id}" style="text-align:right;vertical-align:middle;">
          <table class="pb-fs-badge-${id}" cellpadding="0" cellspacing="0" border="0" align="right" style="display:inline-table;">
            <tr>
              <td style="background-color:${p.deliveryColor ?? '#16a34a'};padding:8px 14px;text-align:center;">
                <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#ffffff;">✓ ${p.deliveryText ?? 'FREE UK Delivery'}</p>
                ${p.deliveryDate ? `<p style="margin:3px 0 0;font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.85);">Est. ${p.deliveryDate}</p>` : ''}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
<!--[/riazify:price_block:${id}]-->`
    },
  },

]

export function getPriceVariant(variantId: string): BlockVariant {
  return priceBlockVariants.find(v => v.id === variantId) ?? priceBlockVariants[0]
}
