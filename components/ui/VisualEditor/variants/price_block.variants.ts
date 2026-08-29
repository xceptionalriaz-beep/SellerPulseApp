// components/ui/VisualEditor/variants/price_block.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Price Block — 10 layout variants
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

function wrap(id: string, inner: string, p: any): string {
    return `<!--[riazify:price_block:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#f8f7ff'};border-radius:${p.borderRadius ?? 10}px;">
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
            return wrap(id, `
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.priceFontSize ?? 32}px;font-weight:${p.priceFontWeight ?? '900'};color:${p.priceColor ?? '#7530fb'};line-height:1.2;text-align:${p.priceAlign ?? 'left'};">
        ${p.priceText ?? '{{ITEM_PRICE}}'}
      </p>`, p)
        },
    },

    // ── 2. Price + Original + Badge ───────────────────────────────────────────
    {
        id: 'sale',
        label: 'Sale Price',
        description: 'Sale price with original crossed out and savings badge',
        toHtml(p: any, id: string): string {
            return wrap(id, `
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:middle;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.priceFontSize ?? 36}px;font-weight:${p.priceFontWeight ?? '900'};color:${p.priceColor ?? '#dc2626'};line-height:1;display:inline;">
              ${p.priceText ?? '{{ITEM_PRICE}}'}
            </p>
            <span style="font-family:Arial,sans-serif;font-size:${p.originalFontSize ?? 18}px;color:${p.originalColor ?? '#9ca3af'};text-decoration:line-through;margin-left:12px;vertical-align:middle;">
              ${p.originalText ?? '{{ORIGINAL_PRICE}}'}
            </span>
          </td>
          <td style="text-align:right;vertical-align:middle;">
            <span style="display:inline-block;background-color:${p.badgeBg ?? '#b8fa33'};color:${p.badgeColor ?? '#1e1535'};font-family:Arial,sans-serif;font-size:${p.badgeFontSize ?? 12}px;font-weight:700;padding:5px 12px;border-radius:${p.badgeBorderRadius ?? 4}px;">
              ${p.savingsText ?? 'Save {{DISCOUNT_AMOUNT}}'}
            </span>
          </td>
        </tr>
      </table>`, p)
        },
    },

    // ── 3. Price + Urgency Combined ───────────────────────────────────────────
    {
        id: 'urgency',
        label: 'Price + Urgency',
        description: 'Price with low-stock urgency bar below',
        toHtml(p: any, id: string): string {
            return `<!--[riazify:price_block:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor ?? '#f8f7ff'};${pad(p)}border-radius:${p.borderRadius ?? 10}px ${p.borderRadius ?? 10}px 0 0;">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.priceFontSize ?? 32}px;font-weight:${p.priceFontWeight ?? '900'};color:${p.priceColor ?? '#7530fb'};line-height:1.2;text-align:${p.priceAlign ?? 'left'};">
        ${p.priceText ?? '{{ITEM_PRICE}}'}
        ${p.showBadge ? `<span style="display:inline-block;background-color:${p.badgeBg ?? '#b8fa33'};color:${p.badgeColor ?? '#1e1535'};font-family:Arial,sans-serif;font-size:${p.badgeFontSize ?? 11}px;font-weight:700;padding:3px 8px;border-radius:${p.badgeBorderRadius ?? 4}px;margin-left:10px;vertical-align:middle;">${p.badgeText ?? 'SALE'}</span>` : ''}
      </p>
    </td>
  </tr>
  <tr>
    <td style="background-color:${p.urgencyBg ?? '#fef2f2'};padding:10px 20px;border-radius:0 0 ${p.borderRadius ?? 10}px ${p.borderRadius ?? 10}px;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:${p.urgencyColor ?? '#991b1b'};">
        🔴 ${p.urgencyText ?? 'Only {{QUANTITY}} left in stock'}
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
        description: 'Small price left, condition and SKU right — for multi-variant listings',
        toHtml(p: any, id: string): string {
            return wrap(id, `
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:middle;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:${Math.min(p.priceFontSize ?? 24, 28)}px;font-weight:${p.priceFontWeight ?? '900'};color:${p.priceColor ?? '#7530fb'};">
              ${p.priceText ?? '{{ITEM_PRICE}}'}
            </span>
            ${p.showOriginal ? `<span style="font-family:Arial,sans-serif;font-size:13px;color:${p.originalColor ?? '#9ca3af'};text-decoration:line-through;margin-left:8px;">${p.originalText ?? '{{ORIGINAL_PRICE}}'}</span>` : ''}
          </td>
          <td style="text-align:right;vertical-align:middle;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#6b7280;">Condition: <strong>{{ITEM_CONDITION}}</strong></p>
            <p style="margin:2px 0 0;font-family:Arial,sans-serif;font-size:10px;color:#9ca3af;">SKU: {{ITEM_SKU}}</p>
          </td>
        </tr>
      </table>`, p)
        },
    },

    // ── 5. Price Range ────────────────────────────────────────────────────────
    {
        id: 'range',
        label: 'Price Range',
        description: 'From/to price range for multi-variant listings',
        toHtml(p: any, id: string): string {
            return wrap(id, `
      <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;text-align:${p.priceAlign ?? 'left'};">
        Starting from
      </p>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.priceFontSize ?? 32}px;font-weight:${p.priceFontWeight ?? '900'};color:${p.priceColor ?? '#7530fb'};line-height:1.2;text-align:${p.priceAlign ?? 'left'};">
        ${p.priceText ?? '{{ITEM_PRICE}}'}
        <span style="font-family:Arial,sans-serif;font-size:${(p.priceFontSize ?? 32) * 0.55}px;font-weight:400;color:#6b7280;margin:0 10px;">—</span>
        ${p.priceRangeMax ?? '{{PRICE_MAX}}'}
      </p>
      <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#9ca3af;text-align:${p.priceAlign ?? 'left'};">
        Price varies by variant — select options below
      </p>`, p)
        },
    },

    // ── 6. Auction Style ──────────────────────────────────────────────────────
    {
        id: 'auction',
        label: 'Auction Style',
        description: 'Current bid, number of bids and time left',
        toHtml(p: any, id: string): string {
            return `<!--[riazify:price_block:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#f8f7ff'};border-radius:${p.borderRadius ?? 10}px;">
  <tr>
    <td style="${pad(p)}">
      <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.06em;">Current bid</p>
      <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:${p.priceFontSize ?? 36}px;font-weight:${p.priceFontWeight ?? '900'};color:${p.priceColor ?? '#7530fb'};line-height:1;">
        ${p.priceText ?? '{{ITEM_PRICE}}'}
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #e5e7eb;padding-top:10px;">
        <tr>
          <td style="padding-top:10px;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#374151;">
              <strong>${p.bidCount ?? '{{BID_COUNT}}'}</strong> bids &nbsp;·&nbsp;
              <strong style="color:${p.reserveMet ? '#16a34a' : '#dc2626'};">${p.reserveMet ? 'Reserve met' : 'Reserve not met'}</strong>
            </p>
          </td>
          <td style="text-align:right;padding-top:10px;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#374151;">
              Time left: <strong style="color:#dc2626;">${p.timeLeft ?? '{{TIME_LEFT}}'}</strong>
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
            return `<!--[riazify:price_block:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#f8f7ff'};border-radius:${p.borderRadius ?? 10}px;">
  <tr><td style="${pad(p)}">
    <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#1e1535;">Multi-Buy Savings</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
      <tr style="background-color:${accentBg};">
        <td style="padding:8px 14px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#ffffff;border-radius:6px 0 0 0;">Quantity</td>
        <td style="padding:8px 14px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#ffffff;">Price each</td>
        <td style="padding:8px 14px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#ffffff;border-radius:0 6px 0 0;">You save</td>
      </tr>
      <tr style="background-color:#ffffff;">
        <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#374151;border-bottom:1px solid #f3f4f6;">1</td>
        <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;">${p.priceText ?? '{{ITEM_PRICE}}'}</td>
        <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:12px;color:#9ca3af;border-bottom:1px solid #f3f4f6;">—</td>
      </tr>
      <tr style="background-color:#f8f7ff;">
        <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#374151;border-bottom:1px solid #f3f4f6;">${p.bundleTier1Qty ?? 2}+</td>
        <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${accentBg};border-bottom:1px solid #f3f4f6;">${p.bundleTier1Price ?? '{{BUNDLE_PRICE_2}}'}</td>
        <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:12px;color:#16a34a;font-weight:700;border-bottom:1px solid #f3f4f6;">Save more</td>
      </tr>
      <tr style="background-color:#ffffff;">
        <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#374151;border-bottom:1px solid #f3f4f6;">${p.bundleTier2Qty ?? 3}+</td>
        <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${accentBg};border-bottom:1px solid #f3f4f6;">${p.bundleTier2Price ?? '{{BUNDLE_PRICE_3}}'}</td>
        <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:12px;color:#16a34a;font-weight:700;border-bottom:1px solid #f3f4f6;">Save even more</td>
      </tr>
      <tr style="background-color:#f8f7ff;">
        <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#374151;">${p.bundleTier3Qty ?? 5}+</td>
        <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${accentBg};">${p.bundleTier3Price ?? '{{BUNDLE_PRICE_5}}'}</td>
        <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:12px;color:#16a34a;font-weight:700;">Best value</td>
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
            return `<!--[riazify:price_block:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#f8f7ff'};border-radius:${p.borderRadius ?? 10}px;">
  <tr><td style="${pad(p)}">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="vertical-align:middle;">
          <p style="margin:0 0 2px;font-family:Arial,sans-serif;font-size:11px;color:#6b7280;">From</p>
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.priceFontSize ?? 32}px;font-weight:${p.priceFontWeight ?? '900'};color:${p.priceColor ?? '#7530fb'};line-height:1;">
            ${p.monthlyPrice ?? '{{MONTHLY_PRICE}}'}
            <span style="font-family:Arial,sans-serif;font-size:14px;font-weight:400;color:#6b7280;">/month</span>
          </p>
          <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;">
            Or <strong>${p.priceText ?? '{{ITEM_PRICE}}'}</strong> full price
          </p>
        </td>
        <td style="text-align:right;vertical-align:middle;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background-color:${p.priceColor ?? '#7530fb'};border-radius:6px;padding:6px 14px;text-align:center;">
                <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#ffffff;">0% Finance</p>
                <p style="margin:2px 0 0;font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.8);">Available</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin:10px 0 0;font-family:Arial,sans-serif;font-size:10px;color:#9ca3af;">
      ${p.financeText ?? '0% interest available — Subject to status'}
    </p>
  </td></tr>
</table>
<!--[/riazify:price_block:${id}]-->`
        },
    },

    // ── 9. Trade / Wholesale ──────────────────────────────────────────────────
    {
        id: 'trade',
        label: 'Trade / Wholesale',
        description: 'Trade price with RRP and bulk pricing CTA',
        toHtml(p: any, id: string): string {
            return `<!--[riazify:price_block:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#1e293b'};border-radius:${p.borderRadius ?? 10}px;">
  <tr><td style="${pad(p)}">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="vertical-align:middle;">
          <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;">Trade Price</p>
          <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:${p.priceFontSize ?? 32}px;font-weight:${p.priceFontWeight ?? '900'};color:#ffffff;line-height:1;">
            ${p.tradePrice ?? '{{TRADE_PRICE}}'}
          </p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#64748b;">
            RRP: <span style="text-decoration:line-through;">${p.rrpText ?? '{{RRP_PRICE}}'}</span>
          </p>
        </td>
        <td style="text-align:right;vertical-align:middle;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="border:1px solid #334155;border-radius:6px;padding:8px 16px;text-align:center;">
                <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#94a3b8;">${p.tradeCta ?? 'Contact us for bulk pricing'}</p>
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
            return `<!--[riazify:price_block:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#f8f7ff'};border-radius:${p.borderRadius ?? 10}px;">
  <tr><td style="${pad(p)}">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="vertical-align:middle;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.priceFontSize ?? 32}px;font-weight:${p.priceFontWeight ?? '900'};color:${p.priceColor ?? '#7530fb'};line-height:1.2;">
            ${p.priceText ?? '{{ITEM_PRICE}}'}
          </p>
          ${p.showOriginal ? `<p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:13px;color:${p.originalColor ?? '#9ca3af'};"><span style="text-decoration:line-through;">${p.originalText ?? '{{ORIGINAL_PRICE}}'}</span></p>` : ''}
        </td>
        <td style="text-align:right;vertical-align:middle;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background-color:${p.deliveryColor ?? '#16a34a'};border-radius:6px;padding:8px 14px;text-align:center;">
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
