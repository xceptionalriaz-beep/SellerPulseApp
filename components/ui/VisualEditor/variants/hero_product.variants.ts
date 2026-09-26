// components/ui/VisualEditor/variants/hero_product.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Hero Product — 6 layout variants
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

function thumbRow(p: HeroProductProps): string {
  const thumbs = [p.thumb1, p.thumb2, p.thumb3, p.thumb4]
  const cells = thumbs.map(t =>
    `<td width="25%" style="padding:0 3px;">
           <img src="${t}" alt="" border="0" width="100%"
             style="width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;display:block;border-radius:6px;border:1px solid #e5e7eb;background-color:#f3f4f6;" />
         </td>`
  ).join('')
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>${cells}</tr>
    </table>`
}

function mainImgCard(p: HeroProductProps, showThumbs = true): string {
  const thumbsHtml = showThumbs
    ? `<tr><td style="padding:4px 8px 8px;">${thumbRow(p)}</td></tr>`
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

function wrapOuter(id: string, bg: string, p: HeroProductProps, inner: string): string {
  return `<!--[hero_product:${id}]--><div class="vb-block" data-block-id="${id}" data-block-type="hero_product">
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${bg};${pad(p)}">
      ${inner}
    </td>
  </tr>
</table>
</div><!--[/hero_product:${id}]-->`
}

// ── Variant: default ──────────────────────────────────────────────────────────
function defaultVariant(): BlockVariant {
  return {
    id: 'hp-default',
    label: 'Classic Split',
    description: 'Image + thumbnails left, product details right',
    toHtml(props: any, id: string): string {
      const p = props as HeroProductProps
      return wrapOuter(id, '#ffffff', p,
        `<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td width="48%" valign="top" style="padding-right:12px;">
      ${mainImgCard(p, true)}
    </td>
    <td width="52%" valign="top" style="padding-left:12px;">
      ${detailsRight(p)}
    </td>
  </tr>
</table>`
      )
    },
  }
}

// ── Variant: image-right ──────────────────────────────────────────────────────
function imageRightVariant(): BlockVariant {
  return {
    id: 'hp-image-right',
    label: 'Image Right',
    description: 'Product details left, image + thumbnails right',
    toHtml(props: any, id: string): string {
      const p = props as HeroProductProps
      return wrapOuter(id, '#ffffff', p,
        `<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td width="52%" valign="top" style="padding-right:12px;">
      ${detailsRight(p)}
    </td>
    <td width="48%" valign="top" style="padding-left:12px;">
      ${mainImgCard(p, true)}
    </td>
  </tr>
</table>`
      )
    },
  }
}

// ── Variant: stacked ─────────────────────────────────────────────────────────
function stackedVariant(): BlockVariant {
  return {
    id: 'hp-stacked',
    label: 'Stacked',
    description: 'Full-width image top, all details centered below',
    toHtml(props: any, id: string): string {
      const p = props as HeroProductProps
      return wrapOuter(id, '#ffffff', p,
        `<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="padding-bottom:16px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${p.leftBg ?? '#f9fafb'};border:1px solid #e5e7eb;border-radius:12px;">
        <tr>
          <td style="padding:8px;">
            <img src="${p.leftImage}" alt="${p.rightTitle}" border="0" width="100%"
              style="width:100%;max-height:340px;height:auto;display:block;border-radius:8px;object-fit:cover;" />
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="text-align:center;">
      <div style="margin-bottom:8px;">${badge(p)}</div>
      <h1 style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:800;color:#1e1535;line-height:1.3;">${p.rightTitle}</h1>
      <div style="margin:0 0 6px;text-align:center;">
        <span style="font-family:Arial,Helvetica,sans-serif;font-size:30px;font-weight:900;color:${accent(p)};letter-spacing:-0.01em;line-height:1;vertical-align:middle;">${p.rightPrice}</span>
        ${p.showOriginal ? `<span style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#9ca3af;text-decoration:line-through;margin-left:8px;font-weight:500;vertical-align:middle;">${p.rightOriginal}</span>` : ''}
      </div>
      ${p.showScarcity ? `<div style="margin-top:8px;">${scarcity(p)}</div>` : ''}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;border-top:1px solid #f3f4f6;padding-top:10px;text-align:left;">
        ${bullets(p)}
      </table>
    </td>
  </tr>
</table>`
      )
    },
  }
}

// ── Variant: dark-hero ────────────────────────────────────────────────────────
function darkHeroVariant(): BlockVariant {
  return {
    id: 'hp-dark-hero',
    label: 'Dark Hero',
    description: 'Dark background with white text and purple accents',
    toHtml(props: any, id: string): string {
      const p = props as HeroProductProps
      const ac = accent(p)
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
                <td style="padding:4px 8px 8px;">${thumbRow(p)}</td>
              </tr>
            </table>`
      return wrapOuter(id, '#1e1535', p,
        `<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td width="48%" valign="top" style="padding-right:12px;">
      ${darkImgCard}
    </td>
    <td width="52%" valign="top" style="padding-left:12px;">
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
</table>`
      )
    },
  }
}

// ── Variant: with-gallery (Gallery Strip) ─────────────────────────────────────
// 3-column layout: vertical thumb strip left | large main image center | details right
// Matches real eBay/Amazon product gallery pattern
function withGalleryVariant(): BlockVariant {
  return {
    id: 'hp-with-gallery',
    label: 'Gallery Strip',
    description: 'Vertical thumbnail strip left, large image center, details right',
    toHtml(props: any, id: string): string {
      const p = props as HeroProductProps
      const ac = accent(p)

      // Vertical thumb strip — thumb1 gets active (purple) border
      const thumbCells = [p.thumb1, p.thumb2, p.thumb3, p.thumb4].map((t, i) =>
        `<tr>
                  <td style="padding:0 0 6px 0;">
                    <img src="${t}" alt="" border="0" width="100%"
                      style="width:100%;height:auto;aspect-ratio:1/1;object-fit:cover;display:block;border-radius:6px;border:2px solid ${i === 0 ? ac : '#e5e7eb'};background-color:#f3f4f6;" />
                  </td>
                </tr>`
      ).join('')

      const thumbColHtml = `<table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${thumbCells}
            </table>`

      // Main image — clean, no card border, just white bg + subtle shadow
      const mainImgHtml = `<img src="${p.leftImage}" alt="${p.rightTitle}" border="0" width="100%"
              style="width:100%;height:auto;display:block;border-radius:10px;aspect-ratio:1/1;object-fit:cover;background-color:${p.leftBg ?? '#f9fafb'};" />`

      return wrapOuter(id, '#ffffff', p,
        `<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <!-- THUMB STRIP: 10% -->
    <td width="10%" valign="top" style="padding-right:8px;">
      ${thumbColHtml}
    </td>
    <!-- MAIN IMAGE: 50% -->
    <td width="50%" valign="top" style="padding-right:16px;">
      ${mainImgHtml}
    </td>
    <!-- DETAILS: 40% -->
    <td width="40%" valign="top" style="padding-left:8px;border-left:2px solid #f3f4f6;">
      ${detailsRight(p)}
    </td>
  </tr>
</table>`
      )
    },
  }
}

// ── Variant: centered-hero ────────────────────────────────────────────────────
function centeredHeroVariant(): BlockVariant {
  return {
    id: 'centered-hero',
    label: 'Centered',
    description: 'Centered image top, all details centered below',
    toHtml(props: any, id: string): string {
      const p = props as HeroProductProps
      const ac = accent(p)
      const origHtml = p.showOriginal
        ? `<span style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#9ca3af;text-decoration:line-through;margin-left:8px;font-weight:500;vertical-align:middle;">${p.rightOriginal}</span>`
        : ''
      return wrapOuter(id, '#ffffff', p,
        `<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="text-align:center;padding-bottom:20px;">
      <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;background-color:${p.leftBg ?? '#f9fafb'};border:1px solid #e5e7eb;border-radius:12px;max-width:400px;width:100%;">
        <tr>
          <td style="padding:12px;">
            <img src="${p.leftImage}" alt="${p.rightTitle}" border="0" width="100%"
              style="width:100%;height:auto;display:block;border-radius:8px;aspect-ratio:1/1;object-fit:cover;max-width:376px;" />
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="text-align:center;">
      <div style="margin-bottom:8px;">${badge(p)}</div>
      <h1 style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:800;color:#1e1535;line-height:1.3;text-align:center;">${p.rightTitle}</h1>
      <div style="margin:0 0 6px;text-align:center;">
        <span style="font-family:Arial,Helvetica,sans-serif;font-size:32px;font-weight:900;color:${ac};letter-spacing:-0.01em;line-height:1;vertical-align:middle;">${p.rightPrice}</span>${origHtml}
      </div>
      <div style="text-align:center;">${scarcity(p)}</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;border-top:1px solid #f3f4f6;padding-top:10px;text-align:left;max-width:500px;margin-left:auto;margin-right:auto;">
        ${bullets(p)}
      </table>
    </td>
  </tr>
</table>`
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
