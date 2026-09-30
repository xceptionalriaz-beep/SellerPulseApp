// components/ui/VisualEditor/variants/bundle_deal.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Bundle Deal — 10 layout variants
// Free:    tri-tier-columns, horizontal-ribbon
// Pro:     stacked-rows, floating-pill-grid, split-hero, minimal-monochrome
// Premium: executive-highlight, dark-escalator, trophy-podium, countdown-strip
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
  id: string
  label: string
  description: string
  toHtml: (props: any, id: string) => string
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function pad(p: any): string {
  return `padding:${p.paddingTop ?? 20}px ${p.paddingRight ?? 24}px ${p.paddingBottom ?? 20}px ${p.paddingLeft ?? 24}px;`
}
function bg(p: any): string { return p.bgColor ?? '#1e1535' }
function priceCol(p: any): string { return p.priceColor ?? '#ffffff' }
function badgeCol(p: any): string { return p.badgeColor ?? '#b8fa33' }
function badgeTxt(p: any): string { return p.badgeText ?? '#1e1535' }
function heading(p: any): string { return p.heading ?? '🎁 Bundle &amp; Save' }
function qty1(p: any): string { return p.qty1Label ?? 'Buy 1' }
function qty2(p: any): string { return p.qty2Label ?? 'Buy 2' }
function qty3(p: any): string { return p.qty3Label ?? 'Buy 3+' }
function save2(p: any): string { return p.save2Label ?? 'Save 10%' }
function save3(p: any): string { return p.save3Label ?? 'Save 20%' }

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 1 — tri-tier-columns  [FREE]
// Three vertical columns, middle tier gets "Most Popular" crown badge
// ─────────────────────────────────────────────────────────────────────────────
function triTierColumns(p: any, id: string): string {
  const tiers = [
    { qty: qty1(p), price: '{{ITEM_PRICE}}', save: '', label: '', highlight: false },
    { qty: qty2(p), price: '{{PRICE_2}}', save: save2(p), label: 'Most Popular', highlight: true },
    { qty: qty3(p), price: '{{PRICE_3}}', save: save3(p), label: 'Best Value', highlight: false },
  ]

  const cells = tiers.map((t, i) => {
    const border = t.highlight
      ? `border-top:3px solid ${badgeCol(p)};`
      : `border-top:3px solid transparent;`
    const cellBg = t.highlight
      ? `background-color:rgba(255,255,255,0.07);`
      : ''
    const topBadge = t.label
      ? `<div style="font-family:Arial,sans-serif;font-size:9px;font-weight:700;
                color:${t.highlight ? badgeCol(p) : 'rgba(255,255,255,0.4)'};
                text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">${t.label}</div>`
      : `<div style="margin-bottom:18px;"></div>`
    const saveBadge = t.save
      ? `<div style="margin-top:8px;display:inline-block;background-color:${badgeCol(p)};
                color:${badgeTxt(p)};font-family:Arial,sans-serif;font-size:11px;font-weight:700;
                padding:3px 10px;border-radius:100px;">${t.save}</div>`
      : `<div style="margin-top:8px;font-family:Arial,sans-serif;font-size:11px;
                color:rgba(255,255,255,0.35);">each</div>`
    return `<td width="33%" style="padding:16px 12px;text-align:center;vertical-align:top;
            ${border}${cellBg}">
            ${topBadge}
            <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;
                color:${i === 0 ? 'rgba(255,255,255,0.45)' : badgeCol(p)};
                text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">${t.qty}</div>
            <div style="font-family:Arial,sans-serif;font-size:24px;font-weight:700;
                color:${priceCol(p)};line-height:1;">${t.price}</div>
            ${saveBadge}
        </td>`
  }).join(`<td style="width:1px;background-color:rgba(255,255,255,0.08);"></td>`)

  return `<!--[riazify:bundle_deal:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${bg(p)};${pad(p)}border-radius:8px;">
      <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;
        color:${priceCol(p)};text-align:center;">${heading(p)}</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="border:1px solid rgba(255,255,255,0.08);border-radius:6px;overflow:hidden;">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:bundle_deal:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 2 — horizontal-ribbon  [FREE]
// Single compact row, chevron arrows between tiers, saves vertical space
// ─────────────────────────────────────────────────────────────────────────────
function horizontalRibbon(p: any, id: string): string {
  const tiers = [
    { qty: qty1(p), price: '{{ITEM_PRICE}}', save: '' },
    { qty: qty2(p), price: '{{PRICE_2}}', save: save2(p) },
    { qty: qty3(p), price: '{{PRICE_3}}', save: save3(p) },
  ]

  const cells = tiers.map((t, i) => {
    const savePill = t.save
      ? `<span style="margin-left:6px;background-color:${badgeCol(p)};color:${badgeTxt(p)};
                font-family:Arial,sans-serif;font-size:10px;font-weight:700;
                padding:2px 8px;border-radius:100px;">${t.save}</span>`
      : ''
    const arrow = i < tiers.length - 1
      ? `<td style="padding:0 6px;color:rgba(255,255,255,0.25);
                font-family:Arial,sans-serif;font-size:16px;vertical-align:middle;">&#10095;</td>`
      : ''
    return `<td style="padding:14px 16px;text-align:center;vertical-align:middle;white-space:nowrap;">
            <span style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;
                color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.8px;">${t.qty}</span>
            <span style="font-family:Arial,sans-serif;font-size:16px;font-weight:700;
                color:${priceCol(p)};margin:0 6px;">${t.price}</span>
            ${savePill}
        </td>${arrow}`
  }).join('')

  return `<!--[riazify:bundle_deal:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${bg(p)};${pad(p)}border-radius:6px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:rgba(255,255,255,0.05);border-radius:4px;">
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;
              color:${priceCol(p)};">${heading(p)}</span>
          </td>
        </tr>
        <tr>
          <td>
            <table cellpadding="0" cellspacing="0" border="0" align="center">
              <tr>${cells}</tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:bundle_deal:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 3 — stacked-rows  [PRO]
// Full-width rows, accent bar thickens per tier, badge floats right
// ─────────────────────────────────────────────────────────────────────────────
function stackedRows(p: any, id: string): string {
  const tiers = [
    { qty: qty1(p), price: '{{ITEM_PRICE}}', save: '', barW: 3, barOpacity: '0.25' },
    { qty: qty2(p), price: '{{PRICE_2}}', save: save2(p), barW: 5, barOpacity: '0.6' },
    { qty: qty3(p), price: '{{PRICE_3}}', save: save3(p), barW: 7, barOpacity: '1' },
  ]

  const rows = tiers.map((t, i) => {
    const saveBadge = t.save
      ? `<td style="text-align:right;vertical-align:middle;padding-left:12px;">
                <span style="background-color:${badgeCol(p)};color:${badgeTxt(p)};
                  font-family:Arial,sans-serif;font-size:11px;font-weight:700;
                  padding:4px 12px;border-radius:100px;white-space:nowrap;">${t.save}</span>
               </td>`
      : `<td style="text-align:right;vertical-align:middle;padding-left:12px;">
                <span style="font-family:Arial,sans-serif;font-size:11px;
                  color:rgba(255,255,255,0.3);">Base price</span>
               </td>`
    const rowBg = i === 2 ? `background-color:rgba(255,255,255,0.06);` : ''
    return `<tr>
          <td style="${rowBg}padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:${t.barW}px;background-color:${badgeCol(p)};
                  opacity:${t.barOpacity};"></td>
                <td style="padding:14px 16px;vertical-align:middle;">
                  <span style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;
                    color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;
                    margin-right:10px;">${t.qty}</span>
                  <span style="font-family:Arial,sans-serif;font-size:20px;font-weight:700;
                    color:${priceCol(p)};">${t.price}</span>
                </td>
                ${saveBadge}
                <td style="width:16px;"></td>
              </tr>
            </table>
          </td>
        </tr>
        ${i < tiers.length - 1 ? `<tr><td style="height:1px;background-color:rgba(255,255,255,0.07);padding:0;"></td></tr>` : ''}`
  }).join('')

  return `<!--[riazify:bundle_deal:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${bg(p)};${pad(p)}border-radius:8px;">
      <p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;
        color:${priceCol(p)};">${heading(p)}</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="border:1px solid rgba(255,255,255,0.08);border-radius:6px;overflow:hidden;">
        ${rows}
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:bundle_deal:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 4 — floating-pill-grid  [PRO]
// Cards with save pill badge overlapping top edge, SaaS-style aesthetic
// ─────────────────────────────────────────────────────────────────────────────
function floatingPillGrid(p: any, id: string): string {
  const tiers = [
    { qty: qty1(p), price: '{{ITEM_PRICE}}', save: '', sub: 'Base price' },
    { qty: qty2(p), price: '{{PRICE_2}}', save: save2(p), sub: 'Per bundle' },
    { qty: qty3(p), price: '{{PRICE_3}}', save: save3(p), sub: 'Best deal' },
  ]

  const cards = tiers.map((t) => {
    const pill = t.save
      ? `<div style="margin-bottom:10px;">
                <span style="background-color:${badgeCol(p)};color:${badgeTxt(p)};
                  font-family:Arial,sans-serif;font-size:10px;font-weight:700;
                  padding:3px 12px;border-radius:100px;display:inline-block;">${t.save}</span>
               </div>`
      : `<div style="margin-bottom:10px;height:20px;"></div>`
    return `<td style="width:33%;padding:0 6px;text-align:center;vertical-align:top;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background-color:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);
              border-radius:10px;overflow:hidden;">
            <tr>
              <td style="padding:16px 12px 14px;text-align:center;">
                ${pill}
                <div style="font-family:Arial,sans-serif;font-size:10px;font-weight:700;
                  color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:1px;
                  margin-bottom:8px;">${t.qty}</div>
                <div style="font-family:Arial,sans-serif;font-size:22px;font-weight:700;
                  color:${priceCol(p)};line-height:1;margin-bottom:6px;">${t.price}</div>
                <div style="font-family:Arial,sans-serif;font-size:10px;
                  color:rgba(255,255,255,0.3);">${t.sub}</div>
              </td>
            </tr>
          </table>
        </td>`
  }).join('')

  return `<!--[riazify:bundle_deal:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${bg(p)};${pad(p)}border-radius:8px;">
      <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;
        color:${priceCol(p)};text-align:center;">${heading(p)}</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>${cards}</tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:bundle_deal:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 5 — split-hero  [PRO]
// Left: bold heading copy. Right: stacked tier pills
// ─────────────────────────────────────────────────────────────────────────────
function splitHero(p: any, id: string): string {
  const tiers = [
    { qty: qty1(p), price: '{{ITEM_PRICE}}', save: '' },
    { qty: qty2(p), price: '{{PRICE_2}}', save: save2(p) },
    { qty: qty3(p), price: '{{PRICE_3}}', save: save3(p) },
  ]

  const pills = tiers.map(t => {
    const badge = t.save
      ? `<span style="margin-left:8px;background-color:${badgeCol(p)};color:${badgeTxt(p)};
                font-family:Arial,sans-serif;font-size:10px;font-weight:700;
                padding:2px 8px;border-radius:100px;">${t.save}</span>`
      : ''
    return `<tr>
          <td style="padding:6px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
              style="background-color:rgba(255,255,255,0.07);border-radius:6px;">
              <tr>
                <td style="padding:10px 14px;">
                  <span style="font-family:Arial,sans-serif;font-size:10px;font-weight:700;
                    color:rgba(255,255,255,0.45);text-transform:uppercase;
                    letter-spacing:0.8px;">${t.qty}</span>
                  <span style="font-family:Arial,sans-serif;font-size:16px;font-weight:700;
                    color:${priceCol(p)};margin-left:10px;">${t.price}</span>
                  ${badge}
                </td>
              </tr>
            </table>
          </td>
        </tr>`
  }).join('')

  return `<!--[riazify:bundle_deal:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${bg(p)};${pad(p)}border-radius:8px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="42%" style="vertical-align:middle;padding-right:24px;
            border-right:1px solid rgba(255,255,255,0.1);">
            <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:22px;font-weight:700;
              color:${priceCol(p)};line-height:1.2;">The More<br>You Buy,<br>The More<br>You Save</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;
              color:rgba(255,255,255,0.45);line-height:1.6;">
              Stack up and unlock bigger discounts on every order.
            </p>
          </td>
          <td width="58%" style="vertical-align:middle;padding-left:24px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${pills}
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:bundle_deal:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 6 — minimal-monochrome  [PRO]
// White background, black text, thin borders, accent only on save badges
// ─────────────────────────────────────────────────────────────────────────────
function minimalMonochrome(p: any, id: string): string {
  const ac = p.badgeColor ?? '#7530fb'
  const tiers = [
    { qty: qty1(p), price: '{{ITEM_PRICE}}', save: '' },
    { qty: qty2(p), price: '{{PRICE_2}}', save: save2(p) },
    { qty: qty3(p), price: '{{PRICE_3}}', save: save3(p) },
  ]

  const cells = tiers.map((t, i) => {
    const sep = i < tiers.length - 1
      ? `<td style="width:1px;background-color:#e5e7eb;"></td>` : ''
    const badge = t.save
      ? `<div style="margin-top:10px;display:inline-block;
                background-color:${ac};color:#ffffff;
                font-family:Arial,sans-serif;font-size:10px;font-weight:700;
                padding:3px 12px;border-radius:100px;">${t.save}</div>`
      : `<div style="margin-top:10px;font-family:Arial,sans-serif;font-size:11px;
                color:#9ca3af;">Standard price</div>`
    return `<td style="padding:20px 16px;text-align:center;vertical-align:top;">
          <div style="font-family:Arial,sans-serif;font-size:10px;font-weight:700;
            color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">${t.qty}</div>
          <div style="font-family:Arial,sans-serif;font-size:26px;font-weight:700;
            color:#111827;line-height:1;">${t.price}</div>
          ${badge}
        </td>${sep}`
  }).join('')

  return `<!--[riazify:bundle_deal:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:#ffffff;${pad(p)}border:1px solid #e5e7eb;border-radius:8px;">
      <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:14px;font-weight:700;
        color:#111827;">${heading(p)}</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:bundle_deal:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 7 — executive-highlight  [PREMIUM]
// Best-value tier popped out with solid top accent bar + BEST VALUE ribbon
// ─────────────────────────────────────────────────────────────────────────────
function executiveHighlight(p: any, id: string): string {
  const tiers = [
    { qty: qty1(p), price: '{{ITEM_PRICE}}', save: '', best: false },
    { qty: qty2(p), price: '{{PRICE_2}}', save: save2(p), best: false },
    { qty: qty3(p), price: '{{PRICE_3}}', save: save3(p), best: true },
  ]

  const cells = tiers.map((t) => {
    const topBar = t.best
      ? `<div style="height:4px;background-color:${badgeCol(p)};margin:-14px -12px 14px -12px;"></div>`
      : `<div style="height:4px;background-color:rgba(255,255,255,0.06);margin:-14px -12px 14px -12px;"></div>`
    const ribbon = t.best
      ? `<div style="margin-bottom:8px;">
                <span style="background-color:${badgeCol(p)};color:${badgeTxt(p)};
                  font-family:Arial,sans-serif;font-size:9px;font-weight:700;letter-spacing:1px;
                  text-transform:uppercase;padding:3px 10px;border-radius:100px;">&#9733; Best Value</span>
               </div>`
      : `<div style="margin-bottom:8px;height:20px;"></div>`
    const border = t.best
      ? `border:1px solid ${badgeCol(p)};` : `border:1px solid rgba(255,255,255,0.08);`
    const save = t.save
      ? `<div style="margin-top:10px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;
                color:${badgeCol(p)};">${t.save}</div>`
      : `<div style="margin-top:10px;font-family:Arial,sans-serif;font-size:11px;
                color:rgba(255,255,255,0.3);">Base price</div>`
    return `<td style="width:33%;padding:0 6px;vertical-align:top;text-align:center;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background-color:rgba(255,255,255,0.06);${border}border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:14px 12px;text-align:center;">
                ${topBar}
                ${ribbon}
                <div style="font-family:Arial,sans-serif;font-size:10px;font-weight:700;
                  color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:1px;
                  margin-bottom:8px;">${t.qty}</div>
                <div style="font-family:Arial,sans-serif;font-size:24px;font-weight:700;
                  color:${priceCol(p)};line-height:1;">${t.price}</div>
                ${save}
              </td>
            </tr>
          </table>
        </td>`
  }).join('')

  return `<!--[riazify:bundle_deal:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${bg(p)};${pad(p)}border-radius:8px;">
      <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;
        color:${priceCol(p)};text-align:center;">${heading(p)}</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:bundle_deal:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 8 — dark-escalator  [PREMIUM]
// Cards progressively brighter left-to-right — escalates toward best deal
// ─────────────────────────────────────────────────────────────────────────────
function darkEscalator(p: any, id: string): string {
  const ac = p.badgeColor ?? '#b8fa33'
  const tiers = [
    { qty: qty1(p), price: '{{ITEM_PRICE}}', save: '', cardBg: 'rgba(255,255,255,0.04)', opacity: '0.4' },
    { qty: qty2(p), price: '{{PRICE_2}}', save: save2(p), cardBg: 'rgba(255,255,255,0.08)', opacity: '0.7' },
    { qty: qty3(p), price: '{{PRICE_3}}', save: save3(p), cardBg: ac, opacity: '1' },
  ]

  const cells = tiers.map((t, i) => {
    const isLast = i === tiers.length - 1
    const textColor = isLast ? badgeTxt(p) : priceCol(p)
    const subColor = isLast ? `rgba(0,0,0,0.5)` : `rgba(255,255,255,0.4)`
    const save = t.save
      ? `<div style="margin-top:8px;font-family:Arial,sans-serif;font-size:11px;
                font-weight:700;color:${isLast ? badgeTxt(p) : ac};">${t.save}</div>`
      : `<div style="margin-top:8px;font-family:Arial,sans-serif;font-size:11px;
                color:${subColor};">Base price</div>`
    return `<td style="width:33%;padding:0 5px;text-align:center;vertical-align:top;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background-color:${t.cardBg};border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:18px 10px;text-align:center;">
                <div style="font-family:Arial,sans-serif;font-size:10px;font-weight:700;
                  color:${subColor};text-transform:uppercase;letter-spacing:1px;
                  margin-bottom:8px;">${t.qty}</div>
                <div style="font-family:Arial,sans-serif;font-size:24px;font-weight:700;
                  color:${textColor};line-height:1;">${t.price}</div>
                ${save}
              </td>
            </tr>
          </table>
        </td>`
  }).join('')

  return `<!--[riazify:bundle_deal:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${bg(p)};${pad(p)}border-radius:8px;">
      <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;
        color:${priceCol(p)};text-align:center;">${heading(p)}</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:bundle_deal:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 9 — trophy-podium  [PREMIUM]
// Podium heights: Buy3+ tallest (gold), Buy2 medium (silver), Buy1 shortest
// Pure table height trick — fully email-safe
// ─────────────────────────────────────────────────────────────────────────────
function trophyPodium(p: any, id: string): string {
  const tiers = [
    { qty: qty1(p), price: '{{ITEM_PRICE}}', save: '', height: 70, color: '#6b7280', rank: '3rd' },
    { qty: qty3(p), price: '{{PRICE_3}}', save: save3(p), height: 110, color: '#f59e0b', rank: '1st' },
    { qty: qty2(p), price: '{{PRICE_2}}', save: save2(p), height: 90, color: '#94a3b8', rank: '2nd' },
  ]

  const columns = tiers.map((t) => {
    const badge = t.save
      ? `<div style="margin-top:6px;display:inline-block;background-color:${badgeCol(p)};
                color:${badgeTxt(p)};font-family:Arial,sans-serif;font-size:10px;font-weight:700;
                padding:2px 10px;border-radius:100px;">${t.save}</div>`
      : ''
    return `<td style="width:33%;text-align:center;vertical-align:bottom;padding:0 5px;">
          <div style="font-family:Arial,sans-serif;font-size:10px;font-weight:700;
            color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.8px;
            margin-bottom:6px;">${t.qty}</div>
          <div style="font-family:Arial,sans-serif;font-size:18px;font-weight:700;
            color:${priceCol(p)};margin-bottom:4px;">${t.price}</div>
          ${badge}
          <div style="margin-top:8px;background-color:${t.color};height:${t.height}px;
            border-radius:6px 6px 0 0;display:table;width:100%;">
            <div style="display:table-cell;vertical-align:middle;text-align:center;">
              <div style="font-family:Arial,sans-serif;font-size:24px;">${t.rank === '1st' ? '&#127942;' : t.rank === '2nd' ? '&#129352;' : '&#129353;'
      }</div>
            </div>
          </div>
        </td>`
  }).join('')

  return `<!--[riazify:bundle_deal:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${bg(p)};${pad(p)}border-radius:8px;">
      <p style="margin:0 0 20px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;
        color:${priceCol(p)};text-align:center;">${heading(p)}</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>${columns}</tr>
        <tr>
          <td colspan="3" style="height:3px;background-color:rgba(255,255,255,0.1);
            border-radius:0 0 4px 4px;padding:0;"></td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:bundle_deal:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 10 — countdown-strip  [PREMIUM]
// Urgency frame: LIMITED OFFER banner, offer-ends token, then tier columns
// ─────────────────────────────────────────────────────────────────────────────
function countdownStrip(p: any, id: string): string {
  const tiers = [
    { qty: qty1(p), price: '{{ITEM_PRICE}}', save: '' },
    { qty: qty2(p), price: '{{PRICE_2}}', save: save2(p) },
    { qty: qty3(p), price: '{{PRICE_3}}', save: save3(p) },
  ]

  const cells = tiers.map((t, i) => {
    const sep = i < tiers.length - 1
      ? `<td style="width:1px;background-color:rgba(255,255,255,0.08);"></td>` : ''
    const badge = t.save
      ? `<div style="margin-top:8px;display:inline-block;background-color:${badgeCol(p)};
                color:${badgeTxt(p)};font-family:Arial,sans-serif;font-size:11px;font-weight:700;
                padding:3px 10px;border-radius:100px;">${t.save}</div>`
      : `<div style="margin-top:8px;font-family:Arial,sans-serif;font-size:11px;
                color:rgba(255,255,255,0.3);">each</div>`
    return `<td style="padding:16px 12px;text-align:center;vertical-align:top;">
          <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;
            color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:1px;
            margin-bottom:6px;">${t.qty}</div>
          <div style="font-family:Arial,sans-serif;font-size:22px;font-weight:700;
            color:${priceCol(p)};line-height:1;">${t.price}</div>
          ${badge}
        </td>${sep}`
  }).join('')

  return `<!--[riazify:bundle_deal:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:#dc2626;padding:8px 16px;border-radius:6px 6px 0 0;text-align:center;">
      <span style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;
        color:#ffffff;letter-spacing:2px;text-transform:uppercase;">
        &#9888; Limited Time Offer &nbsp;&#8226;&nbsp; Ends: ${p.offerEnds ?? '{{OFFER_ENDS}}'}
      </span>
    </td>
  </tr>
  <tr>
    <td style="background-color:${bg(p)};${pad(p)}border-radius:0 0 8px 8px;">
      <p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;
        color:${priceCol(p)};text-align:center;">${heading(p)}</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="border:1px solid rgba(255,255,255,0.08);border-radius:6px;overflow:hidden;">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:bundle_deal:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export const bundleDealVariants: BlockVariant[] = [
  {
    id: 'tri-tier-columns',
    label: 'Tri-Tier Columns',
    description: 'Three columns with Most Popular badge on middle tier',
    toHtml(props, id) { return triTierColumns(props, id) },
  },
  {
    id: 'horizontal-ribbon',
    label: 'Horizontal Ribbon',
    description: 'Single row with chevron arrows between tiers — space-saving',
    toHtml(props, id) { return horizontalRibbon(props, id) },
  },
  {
    id: 'stacked-rows',
    label: 'Stacked Rows',
    description: 'Full-width rows with growing accent bar — mobile-friendly',
    toHtml(props, id) { return stackedRows(props, id) },
  },
  {
    id: 'floating-pill-grid',
    label: 'Floating Pill Grid',
    description: 'SaaS-style cards with floating discount pill badges',
    toHtml(props, id) { return floatingPillGrid(props, id) },
  },
  {
    id: 'split-hero',
    label: 'Split Hero',
    description: 'Bold heading left, tier pills stacked right',
    toHtml(props, id) { return splitHero(props, id) },
  },
  {
    id: 'minimal-monochrome',
    label: 'Minimal Monochrome',
    description: 'White background, clean borders, accent only on badges',
    toHtml(props, id) { return minimalMonochrome(props, id) },
  },
  {
    id: 'executive-highlight',
    label: 'Executive Highlight',
    description: 'Best value tier popped with accent border and star ribbon',
    toHtml(props, id) { return executiveHighlight(props, id) },
  },
  {
    id: 'dark-escalator',
    label: 'Dark Escalator',
    description: 'Cards escalate from dark to bright — best deal glows',
    toHtml(props, id) { return darkEscalator(props, id) },
  },
  {
    id: 'trophy-podium',
    label: 'Trophy Podium',
    description: 'Podium-height columns with gold/silver/bronze medals',
    toHtml(props, id) { return trophyPodium(props, id) },
  },
  {
    id: 'countdown-strip',
    label: 'Countdown Strip',
    description: 'Red urgency banner with offer-ends token above tier columns',
    toHtml(props, id) { return countdownStrip(props, id) },
  },
]

export function getBundleDealVariant(id: string): BlockVariant {
  return bundleDealVariants.find(v => v.id === id) ?? bundleDealVariants[0]
}
