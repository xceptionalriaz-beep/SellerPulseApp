// components/ui/VisualEditor/variants/hero_product.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Hero Product — 10 layout variants  (all mobile-responsive via @media)
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockVariant } from './hero_header.variants'
import type { HeroProductProps } from '../blocks'

// ── Shared helpers ────────────────────────────────────────────────────────────

function pad(p: HeroProductProps): string {
  return `padding-top:${p.paddingTop ?? 24}px;padding-bottom:${p.paddingBottom ?? 24}px;padding-left:${p.paddingLeft ?? 20}px;padding-right:${p.paddingRight ?? 20}px;`
}

function accent(p: HeroProductProps): string {
  return p.accentColor ?? '#7530fb'
}

function badge(p: HeroProductProps, bgColor = '#f0fdf4', textColor = '#166534'): string {
  return `<span style="display:inline-block;background-color:${bgColor};color:${textColor};font-family:Arial,sans-serif;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:8px;">${p.rightBadgeText}</span>`
}

function bullets(p: HeroProductProps, textColor = '#1f2937'): string {
  const a = accent(p)
  return p.rightBullets.map(b =>
    `<tr>
          <td width="18" valign="top" style="padding:3px 8px 3px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${a};font-weight:700;line-height:1.5;">&#10003;</td>
          <td valign="top" style="padding:3px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${textColor};line-height:1.5;">${b}</td>
        </tr>`
  ).join('')
}

function priceRow(p: HeroProductProps, priceColor = '', originalColor = '#9ca3af'): string {
  const ac = priceColor || accent(p)
  const originalHtml = p.showOriginal
    ? `<span style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${originalColor};text-decoration:line-through;margin-left:8px;font-weight:500;vertical-align:middle;">${p.rightOriginal}</span>`
    : ''
  const showStockBadge = p.showStockBadge !== false && !!p.stockBadgeText
  const stockBadgeHtml = showStockBadge
    ? `<span style="display:inline-block;background-color:#f0fdf4;color:#166534;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;margin-left:10px;letter-spacing:0.02em;vertical-align:middle;white-space:nowrap;">${p.stockBadgeText}</span>`
    : ''
  const showGuaranteeTag = p.showGuaranteeTag !== false && !!p.guaranteeTagText
  const guaranteeBg = p.guaranteeTagBg ?? '#f0fdf4'
  const guaranteeColor = p.guaranteeTagColor ?? '#166534'
  const guaranteeTagHtml = showGuaranteeTag
    ? `<div style="margin:4px 0 0;"><span style="display:inline-block;background-color:${guaranteeBg};color:${guaranteeColor};font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:4px 10px;border-radius:4px;letter-spacing:0.02em;">${p.guaranteeTagText}</span></div>`
    : ''
  return `<div style="margin:0 0 6px;">
      <span style="font-family:Arial,Helvetica,sans-serif;font-size:30px;font-weight:900;color:${ac};letter-spacing:-0.01em;line-height:1;vertical-align:middle;">${p.rightPrice}</span>${originalHtml}${stockBadgeHtml}
    </div>${guaranteeTagHtml}`
}

function scarcity(p: HeroProductProps): string {
  return p.showScarcity
    ? `<span style="display:inline-block;background-color:${p.scarcityBg ?? '#fef2f2'};color:${p.scarcityColor ?? '#991b1b'};font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;margin-top:8px;letter-spacing:0.02em;">Only ${p.rightQuantity} Left in Stock</span>`
    : ''
}

function thumbRowHtml(p: HeroProductProps): string {
  const cells = [p.thumb1, p.thumb2, p.thumb3, p.thumb4].map(t =>
    `<td width="25%" style="padding:0 3px;">
           <img src="${t}" alt="" border="0" width="100%"
             style="width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;display:block;border-radius:6px;border:1px solid #e5e7eb;background-color:#f3f4f6;" />
         </td>`
  ).join('')
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table>`
}

function mainImgCard(p: HeroProductProps, showThumbs = true): string {
  const thumbsHtml = showThumbs
    ? `<tr><td style="padding:4px 8px 8px;">${thumbRowHtml(p)}</td></tr>`
    : ''
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${p.leftBg ?? '#f9fafb'};border:1px solid #e5e7eb;border-radius:12px;">
      <tr>
        <td style="padding:8px;">
          <img src="${p.leftImage}" alt="${p.rightTitle}" border="0" width="100%"
            style="width:100%;height:auto;display:block;border-radius:8px;aspect-ratio:1/1;object-fit:cover;" />
        </td>
      </tr>
      ${thumbsHtml}
    </table>`
}

function detailsRight(p: HeroProductProps, titleColor = '#1e1535', textColor = '#1f2937'): string {
  return `${badge(p)}
    <h1 style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:800;color:${titleColor};line-height:1.3;">${p.rightTitle}</h1>
    ${priceRow(p, '', textColor === '#1f2937' ? '#9ca3af' : '#a5b4fc')}
    ${scarcity(p)}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;border-top:1px solid #f3f4f6;padding-top:10px;">
      ${bullets(p, textColor)}
    </table>`
}

// wrapOuter — accepts optional mobile <style> block scoped to this block id
function wrapOuter(id: string, bg: string, p: HeroProductProps, inner: string, mobileStyle = ''): string {
  return `<!--[hero_product:${id}]--><div class="vb-block" data-block-id="${id}" data-block-type="hero_product">
${mobileStyle}
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${bg};${pad(p)}">
      ${inner}
    </td>
  </tr>
</table>
</div><!--[/hero_product:${id}]-->`
}

// ── Variant: hp-default (Classic Split) ───────────────────────────────────────
// Desktop: image+thumbs left 48% | details right 52%
// Mobile:  image+thumbs full width → details full width below
function defaultVariant(): BlockVariant {
  return {
    id: 'hp-default',
    label: 'Classic Split',
    description: 'Image + thumbnails left, product details right',
    toHtml(props: any, id: string): string {
      const p = props as HeroProductProps
      const mobileStyle = `<style>
@media (max-width:460px) {
  .hp-col-${id} { display:block !important; width:100% !important; padding-left:0 !important; padding-right:0 !important; box-sizing:border-box; }
  .hp-img-col-${id} { padding-bottom:12px !important; }
}
</style>`
      return wrapOuter(id, '#ffffff', p,
        `<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td class="hp-col-${id} hp-img-col-${id}" width="48%" valign="top" style="padding-right:12px;">
      ${mainImgCard(p, true)}
    </td>
    <td class="hp-col-${id}" width="52%" valign="top" style="padding-left:12px;">
      ${detailsRight(p)}
    </td>
  </tr>
</table>`,
        mobileStyle
      )
    },
  }
}

// ── Variant: hp-image-right (Image Right) ─────────────────────────────────────
// Desktop: details left 52% | image+thumbs right 48%
// Mobile:  image+thumbs full width first → details full width below
//          (we flip order on mobile so image always comes first)
function imageRightVariant(): BlockVariant {
  return {
    id: 'hp-image-right',
    label: 'Image Right',
    description: 'Product details left, image + thumbnails right',
    toHtml(props: any, id: string): string {
      const p = props as HeroProductProps
      const mobileStyle = `<style>
@media (max-width:460px) {
  .hp-ir-wrap-${id} { display:flex !important; flex-direction:column !important; }
  .hp-ir-img-${id}  { display:block !important; width:100% !important; padding:0 0 12px 0 !important; order:1 !important; }
  .hp-ir-txt-${id}  { display:block !important; width:100% !important; padding:0 !important; order:2 !important; }
}
</style>`
      // We use a wrapper div for flex reorder on mobile
      return wrapOuter(id, '#ffffff', p,
        `<div class="hp-ir-wrap-${id}" style="display:table;width:100%;table-layout:fixed;">
  <div class="hp-ir-txt-${id}" style="display:table-cell;width:52%;vertical-align:top;padding-right:12px;">
    ${detailsRight(p)}
  </div>
  <div class="hp-ir-img-${id}" style="display:table-cell;width:48%;vertical-align:top;padding-left:12px;">
    ${mainImgCard(p, true)}
  </div>
</div>`,
        mobileStyle
      )
    },
  }
}

// ── Variant: hp-stacked (Stacked) ─────────────────────────────────────────────
// Already single-column — just cap image height on mobile so it doesn't overwhelm
function stackedVariant(): BlockVariant {
  return {
    id: 'hp-stacked',
    label: 'Stacked',
    description: 'Full-width image top, all details centered below',
    toHtml(props: any, id: string): string {
      const p = props as HeroProductProps
      const mobileStyle = `<style>
@media (max-width:460px) {
  .hp-stk-img-${id} { max-height:260px !important; }
  .hp-stk-title-${id} { font-size:18px !important; }
  .hp-stk-price-${id} { font-size:26px !important; }
}
</style>`
      return wrapOuter(id, '#ffffff', p,
        `<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding-bottom:16px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${p.leftBg ?? '#f9fafb'};border:1px solid #e5e7eb;border-radius:12px;">
        <tr>
          <td style="padding:8px;">
            <img src="${p.leftImage}" alt="${p.rightTitle}" border="0" width="100%"
              class="hp-stk-img-${id}"
              style="width:100%;max-height:340px;height:auto;display:block;border-radius:8px;object-fit:cover;" />
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="text-align:center;">
      <div style="margin-bottom:8px;">${badge(p)}</div>
      <h1 class="hp-stk-title-${id}" style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:800;color:#1e1535;line-height:1.3;">${p.rightTitle}</h1>
      <div style="margin:0 0 6px;text-align:center;">
        <span class="hp-stk-price-${id}" style="font-family:Arial,Helvetica,sans-serif;font-size:30px;font-weight:900;color:${accent(p)};letter-spacing:-0.01em;line-height:1;vertical-align:middle;">${p.rightPrice}</span>
        ${p.showOriginal ? `<span style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#9ca3af;text-decoration:line-through;margin-left:8px;font-weight:500;vertical-align:middle;">${p.rightOriginal}</span>` : ''}
      </div>
      ${p.showScarcity ? `<div style="margin-top:8px;">${scarcity(p)}</div>` : ''}
      ${p.showStockBadge !== false && p.stockBadgeText ? `<div style="margin-top:8px;"><span style="display:inline-block;background-color:#f0fdf4;color:#166534;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;letter-spacing:0.02em;">${p.stockBadgeText}</span></div>` : ''}
      ${p.showGuaranteeTag !== false && p.guaranteeTagText ? `<div style="margin-top:6px;"><span style="display:inline-block;background-color:${p.guaranteeTagBg ?? '#f0fdf4'};color:${p.guaranteeTagColor ?? '#166534'};font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:4px 10px;border-radius:4px;">${p.guaranteeTagText}</span></div>` : ''}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;border-top:1px solid #f3f4f6;padding-top:10px;text-align:left;">
        ${bullets(p)}
      </table>
    </td>
  </tr>
</table>`,
        mobileStyle
      )
    },
  }
}

// ── Variant: hp-dark-hero (Dark Hero) ─────────────────────────────────────────
// Desktop: dark image+thumbs left 48% | dark details right 52%
// Mobile:  image+thumbs full width → details full width below (dark bg throughout)
function darkHeroVariant(): BlockVariant {
  return {
    id: 'hp-dark-hero',
    label: 'Dark Hero',
    description: 'Dark background with white text and purple accents',
    toHtml(props: any, id: string): string {
      const p = props as HeroProductProps
      const ac = accent(p)
      const mobileStyle = `<style>
@media (max-width:460px) {
  .hp-dk-col-${id} { display:block !important; width:100% !important; padding-left:0 !important; padding-right:0 !important; }
  .hp-dk-img-${id} { padding-bottom:16px !important; }
}
</style>`
      const badgeHtml = `<span style="display:inline-block;background-color:${ac};color:#ffffff;font-family:Arial,sans-serif;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:8px;">${p.rightBadgeText}</span>`
      const origHtml = p.showOriginal
        ? `<span style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#9ca3af;text-decoration:line-through;margin-left:8px;font-weight:500;vertical-align:middle;">${p.rightOriginal}</span>`
        : ''
      const scarcityDarkHtml = p.showScarcity
        ? `<span style="display:inline-block;background-color:#3b0764;color:#e9d5ff;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;margin-top:8px;letter-spacing:0.02em;">Only ${p.rightQuantity} Left in Stock</span>`
        : ''
      const bulletsHtml = p.rightBullets.map(b =>
        `<tr>
                  <td width="18" valign="top" style="padding:3px 8px 3px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${ac};font-weight:700;line-height:1.5;">&#10003;</td>
                  <td valign="top" style="padding:3px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#e5e7eb;line-height:1.5;">${b}</td>
                </tr>`
      ).join('')
      const darkImgCard = `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#2d1f5e;border:1px solid #4c3a8a;border-radius:12px;">
              <tr>
                <td style="padding:8px;">
                  <img src="${p.leftImage}" alt="${p.rightTitle}" border="0" width="100%"
                    style="width:100%;height:auto;display:block;border-radius:8px;aspect-ratio:1/1;object-fit:cover;" />
                </td>
              </tr>
              <tr>
                <td style="padding:4px 8px 8px;">${thumbRowHtml(p)}</td>
              </tr>
            </table>`
      return wrapOuter(id, '#1e1535', p,
        `<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td class="hp-dk-col-${id} hp-dk-img-${id}" width="48%" valign="top" style="padding-right:12px;">
      ${darkImgCard}
    </td>
    <td class="hp-dk-col-${id}" width="52%" valign="top" style="padding-left:12px;">
      ${badgeHtml}
      <h1 style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:800;color:#ffffff;line-height:1.3;">${p.rightTitle}</h1>
      <div style="margin:0 0 6px;">
        <span style="font-family:Arial,Helvetica,sans-serif;font-size:30px;font-weight:900;color:${ac};letter-spacing:-0.01em;line-height:1;vertical-align:middle;">${p.rightPrice}</span>${origHtml}
      </div>
      ${scarcityDarkHtml}
      ${p.showStockBadge !== false && p.stockBadgeText ? `<div style="margin-top:8px;"><span style="display:inline-block;background-color:#1e3a2f;color:#6ee7b7;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;letter-spacing:0.02em;">${p.stockBadgeText}</span></div>` : ''}
      ${p.showGuaranteeTag !== false && p.guaranteeTagText ? `<div style="margin-top:6px;"><span style="display:inline-block;background-color:${p.guaranteeTagBg ?? '#1e3a2f'};color:${p.guaranteeTagColor ?? '#6ee7b7'};font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:4px 10px;border-radius:4px;">${p.guaranteeTagText}</span></div>` : ''}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;border-top:1px solid #3b2f6e;padding-top:10px;">
        ${bulletsHtml}
      </table>
    </td>
  </tr>
</table>`,
        mobileStyle
      )
    },
  }
}

// ── Variant: hp-with-gallery (Gallery Strip) ──────────────────────────────────
// Desktop: vertical thumbs 10% | main image 50% | details 40%
// Mobile:  main image full width → 4 thumbs as horizontal row → details below
function withGalleryVariant(): BlockVariant {
  return {
    id: 'hp-with-gallery',
    label: 'Gallery Strip',
    description: 'Vertical thumbnail strip left, large image center, details right',
    toHtml(props: any, id: string): string {
      const p = props as HeroProductProps
      const ac = accent(p)
      const mobileStyle = `<style>
@media (max-width:460px) {
  /* Hide desktop 3-col table */
  .hp-gs-desktop-${id} { display:none !important; }
  /* Show mobile single-col version */
  .hp-gs-mobile-${id}  { display:block !important; }
}
@media (min-width:461px) {
  .hp-gs-mobile-${id}  { display:none !important; }
}
</style>`

      // Desktop: vertical thumb strip | main image | details
      const thumbCells = [p.thumb1, p.thumb2, p.thumb3, p.thumb4].map((t, i) =>
        `<tr>
                  <td style="padding:0 0 6px 0;">
                    <img src="${t}" alt="" border="0" width="100%"
                      style="width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;display:block;border-radius:6px;border:2px solid ${i === 0 ? ac : '#e5e7eb'};background-color:#f3f4f6;" />
                  </td>
                </tr>`
      ).join('')

      const desktopHtml = `<table class="hp-gs-desktop-${id}" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td width="10%" valign="top" style="padding-right:8px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">${thumbCells}</table>
    </td>
    <td width="50%" valign="top" style="padding-right:16px;">
      <img src="${p.leftImage}" alt="${p.rightTitle}" border="0" width="100%"
        style="width:100%;height:auto;display:block;border-radius:10px;aspect-ratio:1/1;object-fit:cover;background-color:${p.leftBg ?? '#f9fafb'};" />
    </td>
    <td width="40%" valign="top" style="padding-left:8px;border-left:2px solid #f3f4f6;">
      ${detailsRight(p)}
    </td>
  </tr>
</table>`

      // Mobile: main image → horizontal thumb row → details
      const mobileThumbCells = [p.thumb1, p.thumb2, p.thumb3, p.thumb4].map((t, i) =>
        `<td width="25%" style="padding:0 3px;">
                   <img src="${t}" alt="" border="0" width="100%"
                     style="width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;display:block;border-radius:6px;border:2px solid ${i === 0 ? ac : '#e5e7eb'};background-color:#f3f4f6;" />
                 </td>`
      ).join('')

      const mobileHtml = `<div class="hp-gs-mobile-${id}" style="display:none;">
  <img src="${p.leftImage}" alt="${p.rightTitle}" border="0" width="100%"
    style="width:100%;height:auto;display:block;border-radius:10px;aspect-ratio:1/1;object-fit:cover;background-color:${p.leftBg ?? '#f9fafb'};" />
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 16px;">
    <tr>${mobileThumbCells}</tr>
  </table>
  ${detailsRight(p)}
</div>`

      return wrapOuter(id, '#ffffff', p,
        `${desktopHtml}${mobileHtml}`,
        mobileStyle
      )
    },
  }
}

// ── Variant: centered-hero (Centered) ─────────────────────────────────────────
// Already single-column centered — just tighten font sizes on mobile
function centeredHeroVariant(): BlockVariant {
  return {
    id: 'hp-centered-hero',
    label: 'Centered',
    description: 'Centered image top, all details centered below',
    toHtml(props: any, id: string): string {
      const p = props as HeroProductProps
      const ac = accent(p)
      const mobileStyle = `<style>
@media (max-width:460px) {
  .hp-ct-img-${id}   { max-width:100% !important; }
  .hp-ct-title-${id} { font-size:20px !important; }
  .hp-ct-price-${id} { font-size:28px !important; }
  .hp-ct-trust-${id} { display:block !important; width:100% !important; text-align:center !important; padding:4px 0 !important; }
}
</style>`
      const origHtml = p.showOriginal
        ? `<span style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#9ca3af;text-decoration:line-through;margin-left:10px;font-weight:500;vertical-align:middle;">${p.rightOriginal}</span>`
        : ''

      const savingsHtml = (() => {
        if (!p.showOriginal || !p.rightOriginal || !p.rightPrice) return ''
        const orig = parseFloat(String(p.rightOriginal).replace(/[^0-9.]/g, ''))
        const curr = parseFloat(String(p.rightPrice).replace(/[^0-9.]/g, ''))
        if (!orig || !curr || orig <= curr) return ''
        const saved = (orig - curr).toFixed(2)
        const sym = String(p.rightOriginal).replace(/[\d.,]/g, '').trim() || '$'
        return `<div style="margin:6px auto 0;display:inline-block;background-color:#fef9c3;color:#854d0e;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:4px 14px;border-radius:20px;letter-spacing:0.03em;">YOU SAVE ${sym}${saved} TODAY</div>`
      })()

      const showStockBadge = p.showStockBadge !== false && !!p.stockBadgeText
      const stockHtml = showStockBadge
        ? `<span style="display:inline-block;background-color:#f0fdf4;color:#166534;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;margin-left:10px;letter-spacing:0.02em;vertical-align:middle;">${p.stockBadgeText}</span>`
        : ''

      return wrapOuter(id, '#f8f7ff', p,
        `<table width="100%" cellpadding="0" cellspacing="0" border="0">

  <!-- ── TOP BADGE STRIP ── -->
  <tr>
    <td style="text-align:center;padding-bottom:16px;">
      <span style="display:inline-block;background:linear-gradient(90deg,${ac},${ac}cc);color:#ffffff;font-family:Arial,sans-serif;font-size:10px;font-weight:800;padding:4px 18px;border-radius:20px;letter-spacing:0.08em;text-transform:uppercase;box-shadow:0 2px 8px ${ac}44;">${p.rightBadgeText}</span>
    </td>
  </tr>

  <!-- ── HERO IMAGE with shadow frame ── -->
  <tr>
    <td style="text-align:center;padding-bottom:20px;">
      <table cellpadding="0" cellspacing="0" border="0" align="center"
        style="margin:0 auto;background-color:#ffffff;border-radius:16px;max-width:420px;width:100%;box-shadow:0 8px 32px rgba(117,48,251,0.13),0 2px 8px rgba(0,0,0,0.07);">
        <tr>
          <td style="padding:14px;">
            <img src="${p.leftImage}" alt="${p.rightTitle}" border="0" width="100%"
              class="hp-ct-img-${id}"
              style="width:100%;height:auto;display:block;border-radius:10px;aspect-ratio:1/1;object-fit:cover;max-width:392px;" />
          </td>
        </tr>
        <!-- Thumbnail strip inside frame -->
        <tr>
          <td style="padding:0 14px 14px;">
            ${thumbRowHtml(p)}
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ── TITLE ── -->
  <tr>
    <td style="text-align:center;padding-bottom:10px;">
      <h1 class="hp-ct-title-${id}"
        style="margin:0 auto 6px;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:900;color:#1e1535;line-height:1.25;text-align:center;max-width:560px;letter-spacing:-0.01em;">${p.rightTitle}</h1>
      <div style="width:48px;height:3px;background:linear-gradient(90deg,${ac},${ac}88);border-radius:2px;margin:0 auto;"></div>
    </td>
  </tr>

  <!-- ── PRICE ROW ── -->
  <tr>
    <td style="text-align:center;padding-bottom:4px;">
      <div style="margin:0 0 4px;">
        <span class="hp-ct-price-${id}"
          style="font-family:Arial,Helvetica,sans-serif;font-size:36px;font-weight:900;color:${ac};letter-spacing:-0.02em;line-height:1;vertical-align:middle;">${p.rightPrice}</span>${origHtml}${stockHtml}
      </div>
      ${savingsHtml}
    </td>
  </tr>

  <!-- ── SCARCITY ── -->
  ${p.showScarcity ? `<tr><td style="text-align:center;padding:8px 0 4px;">${scarcity(p)}</td></tr>` : ''}

  <!-- ── DIVIDER ── -->
  <tr>
    <td style="padding:14px 0 10px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="border-top:1px solid #ede9fe;font-size:0;">&nbsp;</td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ── FEATURE BULLETS — two columns on desktop ── -->
  <tr>
    <td style="padding-bottom:16px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;margin:0 auto;">
        ${(() => {
          const bs = p.rightBullets
          const rows = []
          for (let i = 0; i < bs.length; i += 2) {
            const left = `<td width="50%" valign="top" style="padding:4px 8px 4px 0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="22" valign="top" style="font-family:Arial,sans-serif;font-size:13px;color:${ac};font-weight:800;padding-right:6px;line-height:1.6;">✓</td>
                  <td valign="top" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1f2937;line-height:1.6;font-weight:500;">${bs[i]}</td>
                </tr>
              </table>
            </td>`
            const right = bs[i + 1]
              ? `<td width="50%" valign="top" style="padding:4px 0 4px 8px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="22" valign="top" style="font-family:Arial,sans-serif;font-size:13px;color:${ac};font-weight:800;padding-right:6px;line-height:1.6;">✓</td>
                  <td valign="top" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1f2937;line-height:1.6;font-weight:500;">${bs[i + 1]}</td>
                </tr>
              </table>
            </td>`
              : '<td width="50%"></td>'
            rows.push(`<tr>${left}${right}</tr>`)
          }
          return rows.join('')
        })()}
      </table>
    </td>
  </tr>

  <!-- ── TRUST STRIP ── -->
  <tr>
    <td style="padding:12px 0 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:#f3eeff;border-radius:10px;max-width:560px;margin:0 auto;">
        <tr>
          <td class="hp-ct-trust-${id}" width="33%" style="padding:10px 8px;text-align:center;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#5b21b6;border-right:1px solid #ddd6fe;">
            🚚 Free UK Shipping
          </td>
          <td class="hp-ct-trust-${id}" width="34%" style="padding:10px 8px;text-align:center;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#5b21b6;border-right:1px solid #ddd6fe;">
            🔁 30-Day Returns
          </td>
          <td class="hp-ct-trust-${id}" width="33%" style="padding:10px 8px;text-align:center;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#5b21b6;">
            ✅ 100% Authentic
          </td>
        </tr>
      </table>
    </td>
  </tr>

</table>`,
        mobileStyle
      )
    },
  }
}
// ── Variant: hp-minimal-clean (Minimal Clean) ─────────────────────────────────
// Desktop: left col = main image top + 2×2 thumb grid below (fills full height)
//          right col = cream panel, serif title, em-dash bullets, muted price
// Mobile:  main image → 2×2 grid → cream panel stacked
function minimalCleanVariant(): BlockVariant {
  return {
    id: 'hp-minimal-clean',
    label: 'Minimal Clean',
    description: 'Main image + 2×2 thumb grid left, cream editorial panel right',
    toHtml(props: any, id: string): string {
      const p = props as HeroProductProps
      const ac = accent(p)
      const mobileStyle = `<style>
@media (max-width:460px) {
  .hp-mc-wrap-${id}   { display:block !important; }
  .hp-mc-left-${id}   { display:block !important; width:100% !important; padding-right:0 !important; padding-bottom:0 !important; }
  .hp-mc-panel-${id}  { display:block !important; width:100% !important; padding-left:0 !important; border-left:none !important; margin-top:0 !important; }
  .hp-mc-grid-${id}   { display:block !important; }
}
</style>`
      // Em-dash bullets — quiet, editorial, no checkmarks
      const dashBullets = p.rightBullets.map(b =>
        `<tr>
          <td width="14" valign="top" style="padding:4px 8px 4px 0;font-family:Georgia,serif;font-size:14px;color:#9ca3af;line-height:1.6;">—</td>
          <td valign="top" style="padding:4px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#4b5563;line-height:1.65;font-weight:400;">${b}</td>
        </tr>`
      ).join('')
      const origHtml = p.showOriginal
        ? `<span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#9ca3af;text-decoration:line-through;margin-left:12px;font-weight:400;letter-spacing:0.01em;vertical-align:middle;">${p.rightOriginal}</span>`
        : ''
      const scarcityHtml = p.showScarcity
        ? `<p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;color:#9ca3af;letter-spacing:0.1em;text-transform:uppercase;">Only ${p.rightQuantity} remaining</p>`
        : ''
      const guaranteeHtml = p.showGuaranteeTag !== false && p.guaranteeTagText
        ? `<div style="margin-top:16px;padding-top:14px;border-top:1px solid #e9e6df;"><span style="display:inline-block;background-color:${p.guaranteeTagBg ?? '#f0fdf4'};color:${p.guaranteeTagColor ?? '#166534'};font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:4px 12px;border-radius:4px;">${p.guaranteeTagText}</span></div>`
        : ''
      // 2×2 thumb grid — top-left, top-right, bottom-left, bottom-right
      const thumbs = [p.thumb1, p.thumb2, p.thumb3, p.thumb4]
      const gridHtml = `<table class="hp-mc-grid-${id}" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:5px;">
  <tr>
    <td width="50%" style="padding:0 2px 4px 0;">
      <img src="${thumbs[0]}" alt="" border="0" width="100%"
        style="width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;display:block;border-radius:5px;background-color:#ede9e3;" />
    </td>
    <td width="50%" style="padding:0 0 4px 2px;">
      <img src="${thumbs[1]}" alt="" border="0" width="100%"
        style="width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;display:block;border-radius:5px;background-color:#ede9e3;" />
    </td>
  </tr>
  <tr>
    <td width="50%" style="padding:0 2px 0 0;">
      <img src="${thumbs[2]}" alt="" border="0" width="100%"
        style="width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;display:block;border-radius:5px;background-color:#ede9e3;" />
    </td>
    <td width="50%" style="padding:0 0 0 2px;">
      <img src="${thumbs[3]}" alt="" border="0" width="100%"
        style="width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;display:block;border-radius:5px;background-color:#ede9e3;" />
    </td>
  </tr>
</table>`
      return wrapOuter(id, '#f5f4f0', p,
        `<table width="100%" cellpadding="0" cellspacing="0" border="0" class="hp-mc-wrap-${id}">
  <tr>
    <!-- LEFT: main image + 2×2 grid below -->
    <td class="hp-mc-left-${id}" width="47%" valign="top" style="padding-right:6px;">
      <img src="${p.leftImage}" alt="${p.rightTitle}" border="0" width="100%"
        style="width:100%;height:auto;display:block;border-radius:8px;aspect-ratio:1/1;object-fit:cover;background-color:#ede9e3;" />
      ${gridHtml}
    </td>
    <!-- RIGHT: cream editorial panel -->
    <td class="hp-mc-panel-${id}" width="53%" valign="middle"
        style="background-color:#faf9f6;border-radius:10px;padding:28px 24px;vertical-align:middle;">
      <!-- Category label — tiny tracked caps, no pill -->
      <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:700;color:#9ca3af;letter-spacing:0.18em;text-transform:uppercase;">${p.rightBadgeText}</p>
      <!-- Serif title -->
      <h1 style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#1c1917;line-height:1.25;letter-spacing:-0.01em;">${p.rightTitle}</h1>
      <!-- Thin accent rule under title -->
      <div style="width:32px;height:2px;background-color:${ac};margin:0 0 16px;border-radius:1px;"></div>
      <!-- Price — dark charcoal, understated (not accent colour) -->
      <div style="margin:0 0 4px;">
        <span style="font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:800;color:#1c1917;letter-spacing:-0.02em;vertical-align:middle;">${p.rightPrice}</span>${origHtml}
      </div>
      ${scarcityHtml}
      <!-- Em-dash bullets -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;padding-top:14px;border-top:1px solid #e9e6df;">
        ${dashBullets}
      </table>
      ${guaranteeHtml}
    </td>
  </tr>
</table>`,
        mobileStyle
      )
    },
  }
}

// ── Variant: hp-flash-sale (Urgency / Flash Sale) ─────────────────────────────
// Top urgency banner → image left with SAVE badge overlay → giant price right
// Mobile: stack, urgency banner stays, price stays giant
function flashSaleVariant(): BlockVariant {
  return {
    id: 'hp-flash-sale',
    label: 'Flash Sale',
    description: 'Urgency banner + SAVE overlay on image, giant price with progress bar',
    toHtml(props: any, id: string): string {
      const p = props as HeroProductProps
      const ac = accent(p)
      const mobileStyle = `<style>
@media (max-width:460px) {
  .hp-fs-col-${id} { display:block !important; width:100% !important; padding-left:0 !important; padding-right:0 !important; }
  .hp-fs-img-col-${id} { padding-bottom:16px !important; }
  .hp-fs-price-${id} { font-size:38px !important; }
}
</style>`
      // Calculate save % if original exists
      const savePercent = (() => {
        if (!p.showOriginal || !p.rightOriginal || !p.rightPrice) return null
        const orig = parseFloat(String(p.rightOriginal).replace(/[^0-9.]/g, ''))
        const curr = parseFloat(String(p.rightPrice).replace(/[^0-9.]/g, ''))
        if (!orig || !curr || orig <= curr) return null
        return Math.round(((orig - curr) / orig) * 100)
      })()
      // saveBadgeHtml removed — position:absolute not email-safe; badge rendered inline below image
      const origHtml = p.showOriginal
        ? `<div style="margin:4px 0 0;"><span style="font-family:Arial,Helvetica,sans-serif;font-size:18px;color:#9ca3af;text-decoration:line-through;font-weight:500;">${p.rightOriginal}</span>${savePercent ? `<span style="display:inline-block;background-color:#fef2f2;color:#dc2626;font-family:Arial,sans-serif;font-size:12px;font-weight:800;padding:2px 8px;border-radius:4px;margin-left:8px;vertical-align:middle;">-${savePercent}% OFF</span>` : ''}</div>`
        : ''
      // Progress bar (uses rightQuantity as % remaining, capped 5–40)
      const qty = parseInt(String(p.rightQuantity ?? '10'), 10) || 10
      const pct = Math.max(5, Math.min(40, qty))
      const progressHtml = p.showScarcity
        ? `<div style="margin-top:14px;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#dc2626;">⚠ Only ${p.rightQuantity} left — selling fast!</p>
            <div style="width:100%;height:10px;background-color:#fee2e2;border-radius:5px;overflow:hidden;">
              <div style="width:${pct}%;height:100%;background-color:#dc2626;border-radius:5px;"></div>
            </div>
          </div>`
        : ''
      const stockHtml = p.showStockBadge !== false && p.stockBadgeText
        ? `<span style="display:inline-block;background-color:#f0fdf4;color:#166534;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;margin-left:8px;vertical-align:middle;white-space:nowrap;">${p.stockBadgeText}</span>`
        : ''
      const guaranteeHtml = p.showGuaranteeTag !== false && p.guaranteeTagText
        ? `<div style="margin-top:8px;"><span style="display:inline-block;background-color:${p.guaranteeTagBg ?? '#f0fdf4'};color:${p.guaranteeTagColor ?? '#166534'};font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:4px 10px;border-radius:4px;">${p.guaranteeTagText}</span></div>`
        : ''
      return wrapOuter(id, '#fff7ed', p,
        `<!-- Urgency banner -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
  <tr>
    <td style="background-color:#dc2626;border-radius:8px;padding:8px 16px;text-align:center;">
      <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:900;color:#ffffff;letter-spacing:0.06em;">⚡ LIMITED TIME DEAL — TODAY ONLY ⚡</span>
    </td>
  </tr>
</table>
<!-- Main row -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td class="hp-fs-col-${id} hp-fs-img-col-${id}" width="46%" valign="top" style="padding-right:16px;">
      <!-- Image with SAVE badge overlay using a table hack -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${p.leftBg ?? '#f9fafb'};border:2px solid #fca5a5;border-radius:12px;">
        <tr>
          <td style="padding:8px;">
            <img src="${p.leftImage}" alt="${p.rightTitle}" border="0" width="100%"
              style="width:100%;height:auto;display:block;border-radius:8px;aspect-ratio:1/1;object-fit:cover;" />
          </td>
        </tr>
        ${savePercent ? `<tr><td style="padding:0 8px 6px;text-align:right;"><span style="display:inline-block;background-color:#dc2626;color:#ffffff;font-family:Arial,sans-serif;font-size:12px;font-weight:900;padding:4px 10px;border-radius:6px;letter-spacing:0.02em;">SAVE ${savePercent}%</span></td></tr>` : ''}
        <tr><td style="padding:0 8px 8px;">${thumbRowHtml(p)}</td></tr>
      </table>
    </td>
    <td class="hp-fs-col-${id}" width="54%" valign="top" style="padding-left:16px;">
      <span style="display:inline-block;background-color:#fef2f2;color:#dc2626;font-family:Arial,sans-serif;font-size:10px;font-weight:800;padding:3px 10px;border-radius:20px;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:8px;">${p.rightBadgeText}</span>
      <h1 style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:800;color:#111827;line-height:1.3;">${p.rightTitle}</h1>
      <div style="margin:0 0 4px;">
        <span class="hp-fs-price-${id}" style="font-family:Arial,Helvetica,sans-serif;font-size:44px;font-weight:900;color:#dc2626;letter-spacing:-0.02em;line-height:1;vertical-align:middle;">${p.rightPrice}</span>${stockHtml}
      </div>
      ${origHtml}
      ${progressHtml}
      ${guaranteeHtml}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;border-top:1px solid #fee2e2;padding-top:10px;">
        ${bullets(p, '#374151')}
      </table>
    </td>
  </tr>
</table>`,
        mobileStyle
      )
    },
  }
}

// ── Variant: hp-dark-premium (Dark Premium) ───────────────────────────────────
// Near-black bg, image RIGHT with purple glow halo, title+price LEFT in white
// Bullets as glowing accent pills — for electronics/gaming/tech
// Mobile: stack (image first), dark bg carries through
function darkPremiumVariant(): BlockVariant {
  return {
    id: 'hp-dark-premium',
    label: 'Dark Premium',
    description: 'Near-black bg, image right with glow halo, bullets as accent pills',
    toHtml(props: any, id: string): string {
      const p = props as HeroProductProps
      const ac = accent(p)
      // Mobile: use block stacking on the table wrapper — flex on display:table is unreliable
      const mobileStyle = `<style>
@media (max-width:460px) {
  .hp-dp-wrap-${id} { display:block !important; width:100% !important; }
  .hp-dp-img-${id}  { display:block !important; width:100% !important; padding:0 0 20px 0 !important; }
  .hp-dp-txt-${id}  { display:block !important; width:100% !important; padding:0 !important; }
}
</style>`
      const pillBullets = p.rightBullets.map(b =>
        `<tr>
          <td style="padding:3px 0;">
            <span style="display:inline-block;background-color:${ac}22;color:${ac};font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;padding:5px 14px;border-radius:20px;border:1px solid ${ac}55;letter-spacing:0.02em;">&#10003; ${b}</span>
          </td>
        </tr>`
      ).join('')
      const origHtml = p.showOriginal
        ? `<span style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b7280;text-decoration:line-through;margin-left:10px;font-weight:400;vertical-align:middle;">${p.rightOriginal}</span>`
        : ''
      const scarcityHtml = p.showScarcity
        ? `<div style="margin-top:10px;"><span style="display:inline-block;background-color:#3b0764;color:#e9d5ff;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;letter-spacing:0.02em;">Only ${p.rightQuantity} Left in Stock</span></div>`
        : ''
      const stockHtmlDp = p.showStockBadge !== false && p.stockBadgeText
        ? `<div style="margin-top:8px;"><span style="display:inline-block;background-color:#1e3a2f;color:#6ee7b7;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;letter-spacing:0.02em;">${p.stockBadgeText}</span></div>`
        : ''
      const guaranteeHtmlDp = p.showGuaranteeTag !== false && p.guaranteeTagText
        ? `<div style="margin-top:6px;"><span style="display:inline-block;background-color:${p.guaranteeTagBg ?? '#1e3a2f'};color:${p.guaranteeTagColor ?? '#6ee7b7'};font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:4px 10px;border-radius:4px;">${p.guaranteeTagText}</span></div>`
        : ''
      return wrapOuter(id, '#0f0f13', p,
        `<table class="hp-dp-wrap-${id}" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;">
  <tr>
    <!-- LEFT: text col — image comes first on mobile via block reorder -->
    <td class="hp-dp-img-${id}" width="48%" valign="middle" style="padding-right:20px;vertical-align:middle;">
      <!-- Glow halo: box-shadow for modern clients, solid accent border as email fallback -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:#1a1025;border-radius:16px;border:2px solid ${ac};box-shadow:0 0 40px ${ac}66,0 0 80px ${ac}33;">
        <tr>
          <td style="padding:10px;">
            <img src="${p.leftImage}" alt="${p.rightTitle}" border="0" width="100%"
              style="width:100%;height:auto;display:block;border-radius:10px;aspect-ratio:1/1;object-fit:cover;" />
          </td>
        </tr>
        <tr>
          <td style="padding:0 8px 8px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>${[p.thumb1, p.thumb2, p.thumb3, p.thumb4].map(t =>
          `<td width="25%" style="padding:0 3px;"><img src="${t}" alt="" border="0" width="100%" style="width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;display:block;border-radius:6px;border:1px solid ${ac}44;background-color:#1a1025;" /></td>`
        ).join('')}</tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
    <!-- RIGHT: details col -->
    <td class="hp-dp-txt-${id}" width="52%" valign="middle" style="padding-left:20px;vertical-align:middle;">
      <span style="display:inline-block;background-color:${ac};color:#ffffff;font-family:Arial,sans-serif;font-size:10px;font-weight:800;padding:3px 12px;border-radius:20px;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px;">${p.rightBadgeText}</span>
      <h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:900;color:#ffffff;line-height:1.2;letter-spacing:-0.01em;">${p.rightTitle}</h1>
      <div style="margin:0 0 6px;">
        <span style="font-family:Arial,Helvetica,sans-serif;font-size:32px;font-weight:900;color:${ac};letter-spacing:-0.02em;line-height:1;vertical-align:middle;">${p.rightPrice}</span>${origHtml}
      </div>
      ${scarcityHtml}
      ${stockHtmlDp}
      ${guaranteeHtmlDp}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;">
        ${pillBullets}
      </table>
    </td>
  </tr>
</table>`,
        mobileStyle
      )
    },
  }
}

// ── Variant: hp-wide-showcase (Wide Showcase) ─────────────────────────────────
// Cinematic image spans full width top → 3-col content row below:
//   price left | title+bullets centre | stock+trust right
// Mobile: stacked — image → price → title → bullets
function wideShowcaseVariant(): BlockVariant {
  return {
    id: 'hp-wide-showcase',
    label: 'Wide Showcase',
    description: 'Full-width cinematic image, 3-column details row below — landing page feel',
    toHtml(props: any, id: string): string {
      const p = props as HeroProductProps
      const ac = accent(p)
      const mobileStyle = `<style>
@media (max-width:460px) {
  .hp-ws-col-${id} { display:block !important; width:100% !important; border-left:none !important; border-right:none !important; border-top:none !important; border-bottom:none !important; padding-left:0 !important; padding-right:0 !important; margin-bottom:12px !important; }
}
</style>`
      const origHtml = p.showOriginal
        ? `<div style="margin-top:4px;"><span style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#9ca3af;text-decoration:line-through;font-weight:400;">${p.rightOriginal}</span></div>`
        : ''
      const scarcityHtml = p.showScarcity
        ? `<div style="margin-top:10px;"><span style="display:inline-block;background-color:${p.scarcityBg ?? '#fef2f2'};color:${p.scarcityColor ?? '#991b1b'};font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;letter-spacing:0.02em;">Only ${p.rightQuantity} Left</span></div>`
        : ''
      const stockHtml = p.showStockBadge !== false && p.stockBadgeText
        ? `<div style="margin-bottom:8px;"><span style="display:inline-block;background-color:#f0fdf4;color:#166534;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:5px 12px;border-radius:20px;letter-spacing:0.02em;">${p.stockBadgeText}</span></div>`
        : ''
      const guaranteeHtml = p.showGuaranteeTag !== false && p.guaranteeTagText
        ? `<div style="margin-top:6px;"><span style="display:inline-block;background-color:${p.guaranteeTagBg ?? '#f0fdf4'};color:${p.guaranteeTagColor ?? '#166534'};font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:5px 12px;border-radius:4px;">${p.guaranteeTagText}</span></div>`
        : ''
      return wrapOuter(id, '#ffffff', p,
        `<!-- Badge strip -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
  <tr>
    <td style="text-align:center;">
      <span style="display:inline-block;background-color:${ac};color:#ffffff;font-family:Arial,sans-serif;font-size:10px;font-weight:800;padding:3px 14px;border-radius:20px;letter-spacing:0.06em;text-transform:uppercase;">${p.rightBadgeText}</span>
    </td>
  </tr>
</table>
<!-- Cinematic image -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
  <tr>
    <td style="border-radius:12px;overflow:hidden;background-color:${p.leftBg ?? '#f9fafb'};line-height:0;">
      <img src="${p.leftImage}" alt="${p.rightTitle}" border="0" width="100%"
        style="width:100%;height:auto;display:block;border-radius:12px;max-height:320px;object-fit:cover;aspect-ratio:16/7;" />
    </td>
  </tr>
</table>
<!-- Thumbnail row -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
  <tr>${[p.thumb1, p.thumb2, p.thumb3, p.thumb4].map(t =>
          `<td width="25%" style="padding:0 3px;"><img src="${t}" alt="" border="0" width="100%" style="width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;display:block;border-radius:6px;border:1px solid #e5e7eb;background-color:#f3f4f6;" /></td>`
        ).join('')}</tr>
</table>
<!-- 3-col content row -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <!-- LEFT: Price -->
    <td class="hp-ws-col-${id}" width="28%" valign="top" style="padding-right:16px;border-right:1px solid #f3f4f6;">
      <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#6b7280;letter-spacing:0.08em;text-transform:uppercase;">Price</p>
      <span style="font-family:Arial,Helvetica,sans-serif;font-size:34px;font-weight:900;color:${ac};letter-spacing:-0.02em;line-height:1;">${p.rightPrice}</span>
      ${origHtml}
      ${scarcityHtml}
    </td>
    <!-- CENTRE: Title + Bullets -->
    <td class="hp-ws-col-${id}" width="44%" valign="top" style="padding:0 16px;border-right:1px solid #f3f4f6;">
      <h1 style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:800;color:#111827;line-height:1.3;">${p.rightTitle}</h1>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${bullets(p, '#374151')}
      </table>
    </td>
    <!-- RIGHT: Stock + Trust -->
    <td class="hp-ws-col-${id}" width="28%" valign="top" style="padding-left:16px;">
      ${stockHtml}
      ${guaranteeHtml}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
        <tr><td style="padding:5px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#374151;font-weight:600;">🚚 Free Shipping</td></tr>
        <tr><td style="padding:5px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#374151;font-weight:600;">🔁 30-Day Returns</td></tr>
        <tr><td style="padding:5px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#374151;font-weight:600;">✅ Secure Checkout</td></tr>
      </table>
    </td>
  </tr>
</table>`,
        mobileStyle
      )
    },
  }
}

// ── Registry ──────────────────────────────────────────────────────────────────

export const heroProductVariants: BlockVariant[] = [
  defaultVariant(),
  imageRightVariant(),
  stackedVariant(),
  darkHeroVariant(),
  withGalleryVariant(),
  centeredHeroVariant(),
  minimalCleanVariant(),
  flashSaleVariant(),
  darkPremiumVariant(),
  wideShowcaseVariant(),
]

export function getHeroProductVariant(variantId: string): BlockVariant {
  return heroProductVariants.find(v => v.id === variantId) ?? heroProductVariants[0]
}
