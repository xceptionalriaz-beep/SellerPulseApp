// components/ui/VisualEditor/variants/hero_product.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Hero Product — 6 layout variants  (all mobile-responsive via @media)
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
@media (max-width:600px) {
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
@media (max-width:600px) {
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
@media (max-width:600px) {
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
@media (max-width:600px) {
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
@media (max-width:600px) {
  /* Hide desktop 3-col table */
  .hp-gs-desktop-${id} { display:none !important; }
  /* Show mobile single-col version */
  .hp-gs-mobile-${id}  { display:block !important; }
}
@media (min-width:601px) {
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
@media (max-width:600px) {
  .hp-ct-img-${id}   { max-width:100% !important; }
  .hp-ct-title-${id} { font-size:18px !important; }
  .hp-ct-price-${id} { font-size:26px !important; }
}
</style>`
      const origHtml = p.showOriginal
        ? `<span style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#9ca3af;text-decoration:line-through;margin-left:8px;font-weight:500;vertical-align:middle;">${p.rightOriginal}</span>`
        : ''
      return wrapOuter(id, '#ffffff', p,
        `<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="text-align:center;padding-bottom:20px;">
      <table cellpadding="0" cellspacing="0" border="0" align="center"
        style="margin:0 auto;background-color:${p.leftBg ?? '#f9fafb'};border:1px solid #e5e7eb;border-radius:12px;max-width:400px;width:100%;">
        <tr>
          <td style="padding:12px;">
            <img src="${p.leftImage}" alt="${p.rightTitle}" border="0" width="100%"
              class="hp-ct-img-${id}"
              style="width:100%;height:auto;display:block;border-radius:8px;aspect-ratio:1/1;object-fit:cover;max-width:376px;" />
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="text-align:center;">
      <div style="margin-bottom:8px;">${badge(p)}</div>
      <h1 class="hp-ct-title-${id}" style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:800;color:#1e1535;line-height:1.3;text-align:center;">${p.rightTitle}</h1>
      <div style="margin:0 0 6px;text-align:center;">
        <span class="hp-ct-price-${id}" style="font-family:Arial,Helvetica,sans-serif;font-size:32px;font-weight:900;color:${ac};letter-spacing:-0.01em;line-height:1;vertical-align:middle;">${p.rightPrice}</span>${origHtml}
      </div>
      <div style="text-align:center;">${scarcity(p)}</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="margin-top:14px;border-top:1px solid #f3f4f6;padding-top:10px;text-align:left;max-width:500px;margin-left:auto;margin-right:auto;">
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

// ── Registry ──────────────────────────────────────────────────────────────────

export const heroProductVariants: BlockVariant[] = [
  defaultVariant(),
  imageRightVariant(),
  stackedVariant(),
  darkHeroVariant(),
  withGalleryVariant(),
  centeredHeroVariant(),
]

export function getHeroProductVariant(variantId: string): BlockVariant {
  return heroProductVariants.find(v => v.id === variantId) ?? heroProductVariants[0]
}
