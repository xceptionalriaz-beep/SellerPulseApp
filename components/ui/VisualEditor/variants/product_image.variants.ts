// components/ui/VisualEditor/variants/product_image.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Product Image — 5 layout variants
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
    id: string
    label: string
    description: string
    toHtml: (props: any, id: string) => string
}

function pad(p: any): string {
    return `padding:${p.paddingTop ?? 12}px ${p.paddingRight ?? 24}px ${p.paddingBottom ?? 12}px ${p.paddingLeft ?? 24}px;`
}

function imgStyle(p: any): string {
    const border = p.showBorder ? `border:${p.borderWidth ?? 1}px solid ${p.borderColor ?? '#ede9fe'};` : ''
    return `width:100%;height:auto;display:block;object-fit:${p.objectFit ?? 'contain'};border-radius:${p.borderRadius ?? 8}px;${border}`
}

export const productImageVariants: BlockVariant[] = [

    // ── Variant 1: Single Centered ────────────────────────────────────────────
    {
        id: 'single',
        label: 'Single Centered',
        description: 'One image centred with optional max width',
        toHtml(p: any, id: string): string {
            return `<!--[riazify:product_image:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  <tr>
    <td style="${pad(p)}text-align:${p.align ?? 'center'};">
      <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}"
        width="${p.maxWidth ?? 500}"
        style="max-width:${p.maxWidth ?? 500}px;${p.align === 'center' ? 'margin:0 auto;' : p.align === 'right' ? 'margin-left:auto;' : ''}${imgStyle(p)}" />
    </td>
  </tr>
</table>
<!--[/riazify:product_image:${id}]-->`
        },
    },

    // ── Variant 2: Left + Description Right ───────────────────────────────────
    {
        id: 'split',
        label: 'Image + Description',
        description: 'Image one side, product description the other',
        toHtml(p: any, id: string): string {
            const imgW = p.imageWidthPercent ?? 45
            const txtW = 100 - imgW
            const va = p.verticalAlign ?? 'middle'
            const isLeft = (p.imagePosition ?? 'left') === 'left'
            const imgCell = `<td width="${imgW}%" style="vertical-align:${va};padding:${p.paddingTop ?? 16}px ${isLeft ? '12px' : (p.paddingRight ?? 20)}px ${p.paddingBottom ?? 16}px ${isLeft ? (p.paddingLeft ?? 20) : '12px'}px;">
        <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}"
          style="width:100%;height:auto;display:block;${imgStyle(p)}" />
      </td>`
            const txtCell = `<td width="${txtW}%" style="vertical-align:${va};padding:${p.paddingTop ?? 16}px ${isLeft ? (p.paddingRight ?? 20) : '12px'}px ${p.paddingBottom ?? 16}px ${isLeft ? '12px' : (p.paddingLeft ?? 20)}px;">
        <h2 style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:#1e293b;line-height:1.3;">${p.descriptionTitle ?? '{{PRODUCT_TITLE}}'}</h2>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:${p.descriptionFontSize ?? 13}px;color:${p.descriptionColor ?? '#475569'};line-height:1.7;">${p.descriptionText ?? '{{ITEM_DESCRIPTION}}'}</p>
      </td>`
            return `<!--[riazify:product_image:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  <tr>
    ${isLeft ? imgCell : txtCell}
    ${isLeft ? txtCell : imgCell}
  </tr>
</table>
<!--[/riazify:product_image:${id}]-->`
        },
    },

    // ── Variant 3: Gallery Strip ──────────────────────────────────────────────
    {
        id: 'gallery',
        label: 'Gallery Strip',
        description: 'Large main image with thumbnail row below',
        toHtml(p: any, id: string): string {
            const count = Math.min(Math.max(p.imageCount ?? 4, 2), 5)
            const thumbUrls = [
                p.src ?? '{{MAIN_IMAGE_URL}}',
                p.image2Url ?? '{{IMAGE_2_URL}}',
                p.image3Url ?? '{{IMAGE_3_URL}}',
                p.image4Url ?? '{{IMAGE_4_URL}}',
                p.image5Url ?? '{{IMAGE_5_URL}}',
            ].slice(0, count)
            const thumbW = Math.floor(100 / count)
            const thumbBorder = p.showThumbBorder
                ? `border:1px solid ${p.borderColor ?? '#ede9fe'};`
                : ''
            const thumbsHtml = thumbUrls.map((url: string, i: number) => `
        <td width="${thumbW}%" style="padding:4px;">
          <img src="${url}" alt="${p.alt ?? 'Product'} view ${i + 1}"
            style="width:100%;height:${p.thumbHeight ?? 80}px;display:block;object-fit:cover;border-radius:${p.thumbBorderRadius ?? 6}px;${thumbBorder}" />
        </td>`).join('')

            return `<!--[riazify:product_image:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#f8fafc'};">
  <tr>
    <td style="padding:${p.paddingTop ?? 12}px ${p.paddingLeft ?? 20}px 8px;">
      <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}"
        style="width:100%;height:auto;display:block;object-fit:${p.objectFit ?? 'contain'};border-radius:${p.borderRadius ?? 8}px;max-height:420px;" />
    </td>
  </tr>
  <tr>
    <td style="padding:0 ${p.paddingLeft ?? 20}px ${p.paddingBottom ?? 12}px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>${thumbsHtml}</tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:0 ${p.paddingLeft ?? 20}px 8px;text-align:center;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;color:#9ca3af;">Scroll to view all images</p>
    </td>
  </tr>
</table>
<!--[/riazify:product_image:${id}]-->`
        },
    },

    // ── Variant 4: Full Width ─────────────────────────────────────────────────
    {
        id: 'fullwidth',
        label: 'Full Width',
        description: 'Edge-to-edge image — great for large items',
        toHtml(p: any, id: string): string {
            const overlay = p.overlayColor && p.overlayColor !== 'rgba(0,0,0,0)'
                ? `<!--[if !mso]><!-->
  <div style="position:relative;">
    <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}"
      style="width:100%;display:block;min-height:${p.minHeight ?? 300}px;object-fit:cover;" />
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:${p.overlayColor};">
      ${p.overlayText ? `<p style="position:absolute;bottom:20px;left:20px;margin:0;font-family:Arial,sans-serif;font-size:16px;font-weight:700;color:#ffffff;">${p.overlayText}</p>` : ''}
    </div>
  </div>
  <!--<![endif]-->
  <!--[if mso]><img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt}" style="width:100%;display:block;" /><![endif]-->`
                : `<img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}"
      style="width:100%;display:block;min-height:${p.minHeight ?? 300}px;object-fit:cover;" />`
            return `<!--[riazify:product_image:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#000000'};">
  <tr>
    <td style="padding:0;line-height:0;font-size:0;">
      ${overlay}
    </td>
  </tr>
</table>
<!--[/riazify:product_image:${id}]-->`
        },
    },

    // ── Variant 5: Zoom Style ─────────────────────────────────────────────────
    {
        id: 'zoom',
        label: 'Zoom Style',
        description: 'Image with magnifier hint — ideal for jewellery & watches',
        toHtml(p: any, id: string): string {
            const border = p.showBorder
                ? `border:${p.borderWidth ?? 2}px solid ${p.borderColor ?? '#ede9fe'};`
                : 'border:2px dashed #e2e8f0;'
            return `<!--[riazify:product_image:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#fafafa'};">
  <tr>
    <td style="${pad(p)}text-align:${p.align ?? 'center'};">
      <table cellpadding="0" cellspacing="0" border="0" align="${p.align ?? 'center'}" style="margin:0 auto;position:relative;">
        <tr>
          <td style="position:relative;line-height:0;">
            <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}"
              width="${p.maxWidth ?? 500}"
              style="max-width:${p.maxWidth ?? 500}px;width:100%;height:auto;display:block;object-fit:${p.objectFit ?? 'contain'};border-radius:${p.borderRadius ?? 8}px;${border}" />
            <!-- Magnifier badge -->
            <table cellpadding="0" cellspacing="0" border="0" style="position:absolute;bottom:12px;right:12px;">
              <tr>
                <td style="background:rgba(255,255,255,0.9);border-radius:20px;padding:5px 10px;border:1px solid #e2e8f0;">
                  <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;color:#475569;white-space:nowrap;">🔍 High resolution</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      ${p.showZoomHint !== false ? `<p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#9ca3af;text-align:${p.align ?? 'center'};">
        Multiple high-resolution images available — see listing gallery above
      </p>` : ''}
    </td>
  </tr>
</table>
<!--[/riazify:product_image:${id}]-->`
        },
    },

    // ── Variant 6: Comparison / Front & Back ─────────────────────────────────
    {
        id: 'comparison',
        label: 'Front & Back',
        description: 'Two images side by side — front view and back/detail view',
        toHtml(p: any, id: string): string {
            const border = p.showThumbBorder
                ? `border:1px solid ${p.borderColor ?? '#e2e8f0'};`
                : ''
            const labelStyle = `margin:6px 0 0;font-family:Arial,sans-serif;font-size:11px;font-weight:600;color:#6b7280;text-align:center;text-transform:uppercase;letter-spacing:0.08em;`
            const img1Label = p.label1 ?? 'Front'
            const img2Label = p.label2 ?? 'Back'
            return `<!--[riazify:product_image:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  <tr>
    <td style="${'padding:' + (p.paddingTop ?? 16) + 'px ' + (p.paddingRight ?? 20) + 'px ' + (p.paddingBottom ?? 16) + 'px ' + (p.paddingLeft ?? 20) + 'px;'}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Left image -->
          <td width="48%" style="vertical-align:top;text-align:center;padding-right:8px;">
            <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}"
              style="width:100%;height:auto;display:block;object-fit:${p.objectFit ?? 'contain'};border-radius:${p.borderRadius ?? 8}px;${border}" />
            <p style="${labelStyle}">${img1Label}</p>
          </td>
          <!-- Divider -->
          <td width="4%" style="vertical-align:middle;text-align:center;padding:0 4px;">
            <div style="width:1px;background-color:#e2e8f0;height:140px;margin:0 auto;"></div>
          </td>
          <!-- Right image -->
          <td width="48%" style="vertical-align:top;text-align:center;padding-left:8px;">
            <img src="${p.image2Url ?? '{{IMAGE_2_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'} detail"
              style="width:100%;height:auto;display:block;object-fit:${p.objectFit ?? 'contain'};border-radius:${p.borderRadius ?? 8}px;${border}" />
            <p style="${labelStyle}">${img2Label}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:product_image:${id}]-->`
        },
    },

    // ── Variant 7: Lifestyle Shot ─────────────────────────────────────────────
    {
        id: 'lifestyle',
        label: 'Lifestyle Shot',
        description: 'Full image with gradient overlay and product name at bottom',
        toHtml(p: any, id: string): string {
            const overlayColor = p.overlayColor ?? 'rgba(0,0,0,0.45)'
            return `<!--[riazify:product_image:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#000'};border-radius:${p.borderRadius ?? 0}px;overflow:hidden;">
  <tr>
    <td style="padding:0;line-height:0;font-size:0;position:relative;">
      <!--[if !mso]><!-->
      <div style="position:relative;overflow:hidden;border-radius:${p.borderRadius ?? 0}px;">
        <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}"
          style="width:100%;display:block;height:auto;min-height:${p.minHeight ?? 320}px;object-fit:cover;" />
        <div style="position:absolute;bottom:0;left:0;right:0;height:50%;background:linear-gradient(to top,${overlayColor},transparent);"></div>
        <div style="position:absolute;bottom:0;left:0;right:0;padding:20px 24px;">
          <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:${p.nameFontSize ?? 20}px;font-weight:700;color:#ffffff;line-height:1.2;">${p.alt ?? '{{PRODUCT_TITLE}}'}</p>
          ${p.lifestyleSubtext ? `<p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.8);">${p.lifestyleSubtext}</p>` : ''}
        </div>
      </div>
      <!--<![endif]-->
      <!--[if mso]><img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" style="width:100%;display:block;" /><![endif]-->
    </td>
  </tr>
</table>
<!--[/riazify:product_image:${id}]-->`
        },
    },

    // ── Variant 8: Polaroid Frame ─────────────────────────────────────────────
    {
        id: 'polaroid',
        label: 'Polaroid Frame',
        description: 'White border frame with caption — great for collectibles and vintage',
        toHtml(p: any, id: string): string {
            const caption = p.polaroidCaption ?? p.alt ?? '{{PRODUCT_TITLE}}'
            return `<!--[riazify:product_image:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#f5f0e8'};${p.paddingTop ?? 20}px ${p.paddingRight ?? 20}px ${p.paddingBottom ?? 20}px ${p.paddingLeft ?? 20}px;">
  <tr>
    <td style="padding:${p.paddingTop ?? 24}px ${p.paddingRight ?? 24}px ${p.paddingBottom ?? 24}px ${p.paddingLeft ?? 24}px;text-align:center;">
      <table cellpadding="0" cellspacing="0" border="0" align="center" style="background-color:#ffffff;padding:12px 12px 32px 12px;box-shadow:0 4px 20px rgba(0,0,0,0.15);display:inline-table;max-width:${p.maxWidth ?? 440}px;width:100%;">
        <tr>
          <td style="padding:0;line-height:0;">
            <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}"
              style="width:100%;height:auto;display:block;object-fit:${p.objectFit ?? 'cover'};" />
          </td>
        </tr>
        <tr>
          <td style="padding:14px 8px 4px;text-align:center;">
            <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#4a3728;font-style:italic;">${caption}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:product_image:${id}]-->`
        },
    },

    // ── Variant 9: Before / After ─────────────────────────────────────────────
    {
        id: 'before-after',
        label: 'Before / After',
        description: 'Side-by-side before and after comparison with divider',
        toHtml(p: any, id: string): string {
            const beforeLabel = p.beforeLabel ?? 'Before'
            const afterLabel = p.afterLabel ?? 'After'
            const labelBg = p.accentColor ?? '#1d4ed8'
            return `<!--[riazify:product_image:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#f8fafc'};">
  <tr>
    <td style="padding:${p.paddingTop ?? 16}px ${p.paddingRight ?? 20}px ${p.paddingBottom ?? 16}px ${p.paddingLeft ?? 20}px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Before -->
          <td width="49%" style="vertical-align:top;position:relative;">
            <div style="position:relative;">
              <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${beforeLabel}"
                style="width:100%;height:auto;display:block;object-fit:cover;border-radius:${p.borderRadius ?? 6}px 0 0 ${p.borderRadius ?? 6}px;" />
              <table cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;width:100%;">
                <tr><td style="text-align:center;background-color:${labelBg};border-radius:4px;padding:4px 0;">
                  <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:0.08em;">${beforeLabel}</p>
                </td></tr>
              </table>
            </div>
          </td>
          <!-- Divider -->
          <td width="2%" style="vertical-align:middle;text-align:center;padding:0 2px;">
            <div style="width:2px;background-color:${labelBg};min-height:120px;margin:0 auto;border-radius:1px;"></div>
          </td>
          <!-- After -->
          <td width="49%" style="vertical-align:top;">
            <div style="position:relative;">
              <img src="${p.image2Url ?? '{{IMAGE_2_URL}}'}" alt="${afterLabel}"
                style="width:100%;height:auto;display:block;object-fit:cover;border-radius:0 ${p.borderRadius ?? 6}px ${p.borderRadius ?? 6}px 0;" />
              <table cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;width:100%;">
                <tr><td style="text-align:center;background-color:${labelBg};border-radius:4px;padding:4px 0;">
                  <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:0.08em;">${afterLabel}</p>
                </td></tr>
              </table>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:product_image:${id}]-->`
        },
    },

    // ── Variant 10: Magazine Grid ─────────────────────────────────────────────
    {
        id: 'magazine',
        label: 'Magazine Grid',
        description: 'One large image left, two stacked images right — editorial layout',
        toHtml(p: any, id: string): string {
            const gap = 6
            return `<!--[riazify:product_image:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  <tr>
    <td style="padding:${p.paddingTop ?? 16}px ${p.paddingRight ?? 20}px ${p.paddingBottom ?? 16}px ${p.paddingLeft ?? 20}px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Large image left (60%) -->
          <td width="60%" style="vertical-align:top;padding-right:${gap}px;">
            <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}"
              style="width:100%;height:auto;display:block;object-fit:cover;border-radius:${p.borderRadius ?? 6}px;" />
          </td>
          <!-- Two stacked images right (40%) -->
          <td width="40%" style="vertical-align:top;padding-left:${gap}px;">
            <img src="${p.image2Url ?? '{{IMAGE_2_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'} view 2"
              style="width:100%;height:auto;display:block;object-fit:cover;border-radius:${p.borderRadius ?? 6}px;margin-bottom:${gap}px;" />
            <img src="${p.image3Url ?? '{{IMAGE_3_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'} view 3"
              style="width:100%;height:auto;display:block;object-fit:cover;border-radius:${p.borderRadius ?? 6}px;" />
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:product_image:${id}]-->`
        },
    },

]

export function getProductImageVariant(variantId: string): BlockVariant {
    return productImageVariants.find(v => v.id === variantId) ?? productImageVariants[0]
}
