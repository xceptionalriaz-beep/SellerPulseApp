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
  // Optional canvas-only depth treatment. Email clients strip box-shadow
  // so the email falls back to the border + radius alone; the canvas
  // preview shows the full treatment.
  const shadow = p.shadow ? `box-shadow:${p.shadow};` : ''
  // `display:block` + `margin:0 auto` is the universal "centered image"
  // pattern. Without these, browsers leave a tiny inline-baseline gap on
  // the right of the image and the visual center drifts slightly left,
  // which presents as a "wider gap on the right" inside the canvas.
  return `width:100%;height:auto;display:block;margin:0 auto;margin-left:auto;margin-right:auto;object-fit:${p.objectFit ?? 'contain'};border-radius:${p.borderRadius ?? 8}px;${border}${shadow}`
}

// Helper for variants that build their own inline <img> style rather than
// going through imgStyle() (gallery strip, fullwidth, lifestyle, etc.). Just
// returns the box-shadow declaration or an empty string.
function shadowStyle(p: any): string {
  return p.shadow ? `box-shadow:${p.shadow};` : ''
}

// Shared renderer for the two split variants ("Image + Description" and
// "Description + Image"). Both variants funnel through here so spacing,
// padding, vertical-align, and overflow behaviour stay in lockstep — the
// only difference is the column order, controlled by the isLeft flag.
function renderSplitImage(p: any, id: string, isLeft: boolean): string {
  const imgW = p.imageWidthPercent ?? 45
  const txtW = 100 - imgW
  const va = p.verticalAlign ?? 'middle'
  const GAP = 24
  const padY = p.paddingTop ?? 16
  const padBottom = p.paddingBottom ?? 16

  const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pi-split-wrap-${id} { display:flex !important; flex-direction:column !important; width:100% !important; }
  .pi-split-img-${id}  { display:block !important; width:100% !important; padding:16px 16px 12px 16px !important; order:1 !important; box-sizing:border-box !important; }
  .pi-split-txt-${id}  { display:block !important; width:100% !important; padding:12px 16px 20px 16px !important; order:2 !important; box-sizing:border-box !important; }
}
</style>`

  const imgCell = `<div class="pi-split-img-${id}" style="display:table-cell;width:${imgW}%;vertical-align:${va};text-align:center;padding:${padY}px ${isLeft ? GAP : (p.paddingRight ?? 20)}px ${padBottom}px ${isLeft ? (p.paddingLeft ?? 20) : GAP}px;">
        <div align="center" style="display:block;width:100%;max-width:100%;margin:0 auto;text-align:center;position:relative;" data-canvas-dropzone="src">
          <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}"
            data-slot="src"
            style="width:100%;height:auto;display:block;margin:0 auto;${imgStyle(p)}" />
          <div data-canvas-overlay="src" style="position:absolute;top:12px;right:12px;background:rgba(30,21,53,0.85);color:#fff;font-family:Arial,sans-serif;font-size:10px;font-weight:700;padding:5px 10px;border-radius:20px;letter-spacing:0.04em;opacity:0;transition:opacity 0.15s ease;pointer-events:none;z-index:10;box-shadow:0 2px 6px rgba(0,0,0,0.25);display:flex;align-items:center;gap:5px;white-space:nowrap;">
            <span>✎</span> Change Image
          </div>
        </div>
      </div>`

  const txtCell = `<div class="pi-split-txt-${id}" style="display:table-cell;width:${txtW}%;vertical-align:${va};padding:${padY}px ${isLeft ? (p.paddingRight ?? 20) : GAP}px ${padBottom}px ${isLeft ? GAP : (p.paddingLeft ?? 20)}px;overflow:hidden;">
        <h2 style="margin:0 0 14px;padding-right:6px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:#1e293b;line-height:1.35;max-width:100%;word-wrap:break-word;">${p.descriptionTitle ?? '{{PRODUCT_TITLE}}'}</h2>
        <p style="margin:0;padding-right:6px;font-family:Arial,sans-serif;font-size:${p.descriptionFontSize ?? 13}px;color:${p.descriptionColor ?? '#475569'};line-height:1.7;max-width:100%;word-wrap:break-word;">${p.descriptionText ?? '{{ITEM_DESCRIPTION}}'}</p>
      </div>`

  return [
    '<!--[riazify:product_image:' + id + ']-->',
    mobileStyle,
    '<div class="pi-split-wrap-' + id + '" style="display:table;width:100% !important;min-width:100% !important;max-width:100% !important;margin:0;background-color:' + (p.bgColor ?? '#ffffff') + ';table-layout:fixed;">',
    isLeft ? (imgCell + txtCell) : (txtCell + imgCell),
    '</div>',
    '<!--[/riazify:product_image:' + id + ']-->',
  ].join('\n')
}
export const productImageVariants: BlockVariant[] = [

  // ── Variant 1: Single Centered ────────────────────────────────────────────
  // Canvas preview renders the eBay HTML inside a sandboxed iframe, with the
  // floating action toolbar (move up/down, duplicate, delete) absolutely
  // positioned over the top-right of the block card. The top padding is
  // bumped to 32px so the toolbar has clear breathing room and never
  // overlaps the image corners. The image stays horizontally centered via
  // `margin:0 auto` on the <img>; a centered optional caption row sits
  // directly below the image when `caption` is set.
  {
    id: 'single',
    label: 'Single Centered',
    description: 'One image centred with optional caption below',
    toHtml(p: any, id: string): string {
      const padTop = 32
      const padLeft = p.paddingLeft ?? 24
      const padRight = p.paddingRight ?? 24
      const padBottom = p.paddingBottom ?? 12
      const maxW = p.maxWidth ?? 600
      const align = p.align ?? 'center'
      const tdAlign = align === 'left' ? 'left' : align === 'right' ? 'right' : 'center'
      const marginStyle = align === 'left' ? 'margin:0 auto 0 0;' : align === 'right' ? 'margin:0 0 0 auto;' : 'margin:0 auto;'
      // Shadow preset → inline box-shadow string
      const shadowPresets: Record<string, string> = {
        soft: '0 2px 8px rgba(0,0,0,0.10)',
        medium: '0 4px 16px rgba(0,0,0,0.18)',
        hard: '0 6px 24px rgba(0,0,0,0.30)',
        card: '0 1px 4px rgba(0,0,0,0.10),0 4px 20px rgba(0,0,0,0.08)',
      }
      const shadowVal = p.shadowPreset && p.shadowPreset !== 'none'
        ? shadowPresets[p.shadowPreset] ?? ''
        : (p.shadow ?? '')
      const caption = (p.caption ?? '').trim()
      const captionRow = caption
        ? `  <tr>\n    <td align="${tdAlign}" style="padding:12px ${padRight}px ${padBottom}px ${padLeft}px;font-family:Arial,Helvetica,sans-serif;font-size:${p.captionFontSize ?? 13}px;color:${p.captionColor ?? '#475569'};line-height:1.5;">\n      <p style="margin:0;font-weight:500;">${caption}</p>\n    </td>\n  </tr>`
        : ''
      return `<!--[riazify:product_image:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0;background-color:${p.bgColor ?? '#ffffff'};">
  <tr>
    <td align="${tdAlign}" style="padding:${padTop}px ${padRight}px 12px ${padLeft}px;text-align:${tdAlign};">
      <div align="${tdAlign}" style="display:block;width:100%;max-width:${maxW}px;${marginStyle}text-align:center;position:relative;display:inline-block;" data-canvas-dropzone="src">
        <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}"
          data-slot="src"
          width="${maxW}"
          style="width:100%;height:auto;display:block;margin:0 auto;object-fit:${p.objectFit ?? 'contain'};border-radius:${p.borderRadius ?? 12}px;${p.showBorder ? `border:${p.borderWidth ?? 1}px solid ${p.borderColor ?? '#ede9fe'};` : ''}${shadowVal ? `box-shadow:${shadowVal};` : ''}" />
        <div data-canvas-overlay="src" style="position:absolute;top:12px;right:12px;background:rgba(30,21,53,0.85);color:#fff;font-family:Arial,sans-serif;font-size:10px;font-weight:700;padding:5px 10px;border-radius:20px;letter-spacing:0.04em;opacity:0;transition:opacity 0.15s ease;pointer-events:none;z-index:10;box-shadow:0 2px 6px rgba(0,0,0,0.25);display:flex;align-items:center;gap:5px;white-space:nowrap;">
          <span>✎</span> Change Image
        </div>
      </div>
    </td>
  </tr>
${captionRow}
</table>
<!--[/riazify:product_image:${id}]-->`
    },
  },

  // ── Variant 2: Left + Description Right ────────────────────────────────────────
  // Two-column layout: image on one side, title + description on the other.
  // The wrapper uses a fixed table with two cells; horizontal gap is created
  // by padding on each cell so the visual gap is consistent regardless of
  // which side the image sits on. The image cell is constrained to
  // `imageWidthPercent` (default 45%) and uses object-fit via imgStyle()
  // so the photo never stretches or squishes next to long descriptions. The
  // text cell uses max-width to keep titles on a single line, with generous
  // margin-bottom between title and description plus relaxed line-heights
  // for clean reading.
  {
    id: 'split',
    label: 'Image + Description',
    description: 'Image left, product description right',
    toHtml(p: any, id: string): string {
      return renderSplitImage(p, id, (p.imagePosition ?? 'left') === 'left')
    },
  },

  // ── Variant 2b: Description + Image (mirrored split) ─────────────────
  // Same polished two-column layout as the split variant but the image sits
  // on the right and the text column on the left. Reuses the same renderer
  // so spacing, padding, vertical-align, and overflow behaviour stay in sync
  // — the only difference is the column order (isLeft = false). The right
  // sidebar exposes the same controls (image position, image width, vertical
  // align, border radius, description colour/size) because the gate covers
  // both split ids.
  {
    id: 'split-right',
    label: 'Description + Image',
    description: 'Description left, image right',
    toHtml(p: any, id: string): string {
      return renderSplitImage(p, id, false)
    },
  },

  // ── Variant 3: Gallery Strip ──────────────────────────────────────────────
  // Canvas preview renders the eBay HTML inside a sandboxed iframe with the
  // floating action toolbar absolutely positioned over the top-right of the
  // block card. The main image row gets an extra 32px of top padding so the
  // toolbar sits cleanly above the photo without overlapping the corners.
  // The thumbnail strip is a separate row below the main image with identical
  // horizontal padding, so both share the same effective max-width and the
  // edges line up perfectly. A 16px gap (mt-4 equivalent) separates the
  // main image from the thumbnails.
  //
  // Each thumbnail cell is a perfect square enforced via
  // `height:0;padding-bottom:100%` on a relative-positioned wrapper. The
  // image is absolutely positioned to fill that square, giving uniform
  // aspect-square thumbnails that `object-fit: cover` cleanly without
  // clipping product details in a non-uniform way. The first thumbnail is
  // rendered as "active" with a 2px purple ring (#7530fb) and full opacity;
  // the rest are inactive with a 1px gray border and 0.78 opacity.
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
      const padL = p.paddingLeft ?? 20
      const padR = p.paddingRight ?? 20
      // Gap between main image and thumbnail strip — equivalent to
      // Tailwind's mt-4 (16px). The 32px top padding on the main row
      // is the toolbar clearance.
      const MAIN_TOP = 32
      const MAIN_BOTTOM = 16
      const radius = p.thumbBorderRadius ?? 8
      // All 4 (or N) thumb cards share identical geometry: 4:3 aspect
      // (padding-bottom: 75%), transparent background, 1px gray border
      // with rounded corners. The active card adds a 2px purple ring
      // (outline) outside the gray border. Inactive cards stay at 0.78
      // opacity for a subtle "available but not selected" look. Using
      // object-fit:cover + object-position:center keeps the product
      // visually centered inside the card without letterbox bars.
      const baseBorder = `border:1px solid #e5e7eb;`
      const thumbPropKeys = ['src', 'image2Url', 'image3Url', 'image4Url', 'image5Url']
      const thumbsHtml = thumbUrls.map((url: string, i: number) => {
        const isActive = i === 0
        const ring = isActive
          ? `outline:2px solid #7530fb;outline-offset:2px;opacity:1;`
          : `outline:0;outline-offset:0;opacity:0.78;`
        const slotKey = thumbPropKeys[i] ?? `image${i + 1}Url`
        return `
        <td width="${thumbW}%" align="center" style="padding:4px;text-align:center;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
            <tr>
              <td align="center" style="position:relative;width:100%;height:0;padding-bottom:75%;border-radius:${radius}px;overflow:hidden;background-color:transparent;text-align:center;${baseBorder}${ring}">
                <div style="position:absolute;top:0;left:0;right:0;bottom:0;" data-canvas-dropzone="${slotKey}">
                  <img src="${url}" alt="${p.alt ?? 'Product'} view ${i + 1}"
                    data-slot="${slotKey}"
                    style="position:absolute;top:0;left:0;width:100%;height:100%;display:block;object-fit:cover;object-position:center;" />
                  <div data-canvas-overlay="${slotKey}" style="position:absolute;top:8px;right:8px;background:rgba(30,21,53,0.85);color:#fff;font-family:Arial,sans-serif;font-size:9px;font-weight:700;padding:4px 8px;border-radius:16px;letter-spacing:0.03em;opacity:0;transition:opacity 0.15s ease;pointer-events:none;z-index:10;box-shadow:0 2px 5px rgba(0,0,0,0.25);display:flex;align-items:center;gap:4px;white-space:nowrap;">
                    <span>✎</span> Change
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </td>`
      }).join('')

      return [
        '<!--[riazify:product_image:' + id + ']-->',
        '<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0;background-color:' + (p.bgColor ?? '#f8fafc') + ';">',
        '  <tr>',
        '    <td style="padding:' + MAIN_TOP + 'px ' + padR + 'px ' + MAIN_BOTTOM + 'px ' + padL + 'px;">',
        '      <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:720px;margin:0 auto;border-collapse:collapse;">',
        '        <tr><td align="center" style="text-align:center;">',
        '          <img src=\"' + (p.src ?? '{{MAIN_IMAGE_URL}}') + '\" alt=\"' + (p.alt ?? '{{PRODUCT_TITLE}}') + '\" data-slot=\"src\" style=\"width:100%;height:auto;display:block;object-fit:' + (p.objectFit ?? 'contain') + ';border-radius:' + (p.borderRadius ?? 8) + 'px;' + (p.mainImageMaxHeight ? 'max-height:' + p.mainImageMaxHeight + 'px;' : 'max-height:480px;') + 'margin:0 auto;' + shadowStyle(p) + '\" />', '        </td></tr>',
        '      </table>',
        '    </td>',
        '  </tr>',
        '  <tr>',
        '    <td style="padding:0 ' + padR + 'px ' + (p.paddingBottom ?? 12) + 'px ' + padL + 'px;">',
        '      <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:720px;margin:0 auto;border-collapse:collapse;">',
        '        <tr>' + thumbsHtml + '</tr>',
        '      </table>',
        '    </td>',
        '  </tr>',
        ...(p.showScrollHint !== false ? [
          '  <tr>',
          '    <td style="padding:0 ' + padR + 'px 8px ' + padL + 'px;text-align:center;">',
          '      <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;color:#9ca3af;">Scroll to view all images</p>',
          '    </td>',
          '  </tr>',
        ] : []),
        '</table>',
        '<!--[/riazify:product_image:' + id + ']-->',
      ].join('\n')
    },
  },

  // ── Variant 4: Full Width ─────────────────────────────────────────────────
  {
    id: 'fullwidth',
    label: 'Full Width',
    description: 'Edge-to-edge image — great for large items',
    toHtml(p: any, id: string): string {
      const fullDrop = `
        <div align="center" style="position:relative;display:inline-block;width:100%;max-width:100%;margin:0 auto;text-align:center;" data-canvas-dropzone="src">
          <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}" data-slot="src"
            style="width:100%;display:block;margin:0 auto;min-height:${p.minHeight ?? 300}px;object-fit:cover;${shadowStyle(p)};padding:0;border:none;" />
          <div data-canvas-overlay="src" style="position:absolute;top:12px;right:12px;background:rgba(30,21,53,0.85);color:#fff;font-family:Arial,sans-serif;font-size:10px;font-weight:700;padding:5px 10px;border-radius:20px;letter-spacing:0.04em;opacity:0;transition:opacity 0.15s ease;pointer-events:none;z-index:10;box-shadow:0 2px 6px rgba(0,0,0,0.25);display:flex;align-items:center;gap:5px;white-space:nowrap;">
            <span>✎</span> Change Image
          </div>
        </div>`
      const overlay = p.overlayColor && p.overlayColor !== 'rgba(0,0,0,0)'
        ? `<!--[if !mso]><!-->
  <div align="center" style="position:relative;margin:0 auto;text-align:center;display:inline-block;width:100%;max-width:100%;" data-canvas-dropzone="src">
    <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}" data-slot="src"
      style="width:100%;display:block;margin:0 auto;min-height:${p.minHeight ?? 300}px;object-fit:cover;padding:0;border:none;${shadowStyle(p)}" />
    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:${p.overlayColor};">
      ${p.overlayText ? `<p style="position:absolute;bottom:20px;left:20px;margin:0;font-family:Arial,sans-serif;font-size:16px;font-weight:700;color:#ffffff;">${p.overlayText}</p>` : ''}
    </div>
    <div data-canvas-overlay="src" style="position:absolute;top:12px;right:12px;background:rgba(30,21,53,0.85);color:#fff;font-family:Arial,sans-serif;font-size:10px;font-weight:700;padding:5px 10px;border-radius:20px;letter-spacing:0.04em;opacity:0;transition:opacity 0.15s ease;pointer-events:none;z-index:10;box-shadow:0 2px 6px rgba(0,0,0,0.25);display:flex;align-items:center;gap:5px;white-space:nowrap;">
      <span>✎</span> Change Image
    </div>
  </div>
  <!--<![endif]-->
  <!--[if mso]><img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt}" style="width:100%;display:block;margin:0 auto;" /><![endif]-->`
        : fullDrop
      return `<!--[riazify:product_image:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0;background-color:${p.bgColor ?? '#000000'};">
  <tr>
    <td align="center" style="padding:0;line-height:0;font-size:0;text-align:center;width:100%;">
      <div style="width:100%;max-width:100%;display:block;margin:0 auto;">${overlay}</div>
    </td>
  </tr>
</table>
<!--[/riazify:product_image:${id}]-->`
    },
  },

  // ── Variant 5: Zoom Style ─────────────────────────────────────────────────
  // Silky-Smooth GPU Pan & Zoom (Pure CSS Vector Translation)
  {
    id: 'zoom',
    label: 'Zoom Style',
    description: 'Liquid-smooth optical pan & zoom — glides seamlessly across left, center, right and corners',
    toHtml(p: any, id: string): string {
      const border = p.showBorder
        ? `border:${p.borderWidth ?? 2}px solid ${p.borderColor ?? '#ede9fe'};`
        : 'border:2px dashed rgba(117,48,251,0.4);'

      return `<!--[riazify:product_image:${id}]-->
<style>
  /* Base Zoom Frame */
  .pi-zm-frame-${id} {
    position: relative;
    overflow: hidden;
    cursor: zoom-in;
    touch-action: pan-y;
  }

  /* Hardware-Accelerated Image Gliding */
  .pi-zm-img-${id} {
    transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    transform-origin: 50% 50% !important;
    transform: scale(1) translate(0, 0);
    will-change: transform;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    pointer-events: none;
  }

  /* 9 Seamless Hover Zones */
  .pi-zm-zone-${id} {
    position: absolute;
    width: 33.333%;
    height: 33.333%;
    z-index: 5;
    cursor: zoom-in;
  }

  /* Top Row */
  .pi-zm-tl-${id} { top:0; left:0; }
  .pi-zm-tc-${id} { top:0; left:33.333%; }
  .pi-zm-tr-${id} { top:0; left:66.666%; }

  /* Middle Row */
  .pi-zm-ml-${id} { top:33.333%; left:0; }
  .pi-zm-mc-${id} { top:33.333%; left:33.333%; }
  .pi-zm-mr-${id} { top:33.333%; left:66.666%; }

  /* Bottom Row */
  .pi-zm-bl-${id} { top:66.666%; left:0; }
  .pi-zm-bc-${id} { top:66.666%; left:33.333%; }
  .pi-zm-br-${id} { top:66.666%; left:66.666%; }

  /* Buttery Smooth Vector Transitions (Zero Origin Jumps) */
  .pi-zm-tl-${id}:hover ~ .pi-zm-img-${id} { transform: scale(1.68) translate(15%, 12%); }
  .pi-zm-tc-${id}:hover ~ .pi-zm-img-${id} { transform: scale(1.68) translate(0%, 14%); }
  .pi-zm-tr-${id}:hover ~ .pi-zm-img-${id} { transform: scale(1.68) translate(-15%, 12%); }

  .pi-zm-ml-${id}:hover ~ .pi-zm-img-${id} { transform: scale(1.68) translate(17%, 0%); }
  .pi-zm-mc-${id}:hover ~ .pi-zm-img-${id} { transform: scale(1.68) translate(0%, 0%); }
  .pi-zm-mr-${id}:hover ~ .pi-zm-img-${id} { transform: scale(1.68) translate(-17%, 0%); }

  .pi-zm-bl-${id}:hover ~ .pi-zm-img-${id} { transform: scale(1.68) translate(15%, -12%); }
  .pi-zm-bc-${id}:hover ~ .pi-zm-img-${id} { transform: scale(1.68) translate(0%, -14%); }
  .pi-zm-br-${id}:hover ~ .pi-zm-img-${id} { transform: scale(1.68) translate(-15%, -12%); }

  /* Interactive Badge Glow & State Feedback */
  .pi-zm-frame-${id}:hover .pi-zm-badge-${id} {
    background: #7530fb !important;
    box-shadow: 0 4px 16px rgba(117, 48, 251, 0.45) !important;
    transform: translateY(-2px);
  }
  .pi-zm-badge-${id} {
    transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0;background-color:${p.bgColor ?? '#fafafa'};">
  <tr>
    <td align="center" style="${pad(p)}padding-top:32px;text-align:center;">
      <div align="center" class="pi-zm-frame-${id}" style="display:block;margin:0 auto;text-align:center;position:relative;overflow:hidden;border-radius:12px;background-color:#ffffff;padding:4px;${border}max-width:640px;width:100%;" data-canvas-dropzone="src">

        <!-- 9 Seamless Directional Hover Zones -->
        <div class="pi-zm-zone-${id} pi-zm-tl-${id}" data-slot="src"></div>
        <div class="pi-zm-zone-${id} pi-zm-tc-${id}" data-slot="src"></div>
        <div class="pi-zm-zone-${id} pi-zm-tr-${id}" data-slot="src"></div>

        <div class="pi-zm-zone-${id} pi-zm-ml-${id}" data-slot="src"></div>
        <div class="pi-zm-zone-${id} pi-zm-mc-${id}" data-slot="src"></div>
        <div class="pi-zm-zone-${id} pi-zm-mr-${id}" data-slot="src"></div>

        <div class="pi-zm-zone-${id} pi-zm-bl-${id}" data-slot="src"></div>
        <div class="pi-zm-zone-${id} pi-zm-bc-${id}" data-slot="src"></div>
        <div class="pi-zm-zone-${id} pi-zm-br-${id}" data-slot="src"></div>

        <!-- The Image (Hardware Gliding with Zero Snapping) -->
        <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}" data-slot="src"
          class="pi-zm-img-${id}"
          width="640"
          style="max-width:100%;width:100%;height:auto;display:block;margin:0 auto;object-fit:${p.objectFit ?? 'contain'};border-radius:${p.borderRadius ?? 8}px;" />

        <!-- Minimalist Circular Zoom Lens Icon (No Text, No Emoji) -->
        <div class="pi-zm-badge-${id}" style="position:absolute;bottom:14px;right:14px;z-index:10;width:34px;height:34px;background:rgba(30,21,53,0.85);border-radius:50%;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.25);box-shadow:0 3px 10px rgba(0,0,0,0.25);pointer-events:none;transition:all 0.3s ease;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:auto;">
            <circle cx="11" cy="11" r="7"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </div>

        <!-- Floating Edit Overlay for Canvas -->
        <div data-canvas-overlay="src" style="position:absolute;top:12px;right:12px;background:rgba(30,21,53,0.85);color:#fff;font-family:Arial,sans-serif;font-size:10px;font-weight:700;padding:5px 10px;border-radius:20px;letter-spacing:0.04em;opacity:0;transition:opacity 0.15s ease;pointer-events:none;z-index:10;box-shadow:0 2px 6px rgba(0,0,0,0.25);display:flex;align-items:center;gap:5px;white-space:nowrap;">
          <span>✎</span> Change Image
        </div>
      </div>

      <!-- Caption text below the image -->
      ${p.showZoomHint !== false ? `<p style="margin:14px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;font-weight:500;text-align:center;line-height:1.5;">
        Interactive Detail Inspection &mdash; Move your mouse across the image to explore every angle
      </p>` : ''}
    </td>
  </tr>
</table>
<!--[/riazify:product_image:${id}]-->`
    },
  },

  // ── Variant 6: Comparison / Front & Back ─────────────────────────────────
  // Desktop: Side by side (48% / 48%)
  // Mobile: Stacks into large, full-width, big 260px cards (100% width)
  {
    id: 'comparison',
    label: 'Front & Back',
    description: 'Two images side by side on desktop, stacked full-width on mobile',
    toHtml(p: any, id: string): string {
      const border = p.showThumbBorder
        ? `border:1px solid ${p.borderColor ?? '#e5e7eb'};`
        : ''
      const labelStyle = `margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#6b7280;text-align:center;text-transform:uppercase;letter-spacing:0.08em;line-height:1.2;`
      const img1Label = p.label1 ?? 'Front'
      const img2Label = p.label2 ?? 'Back'

      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pi-fb-table-${id} { width:100% !important; display:block !important; }
  .pi-fb-tbody-${id} { width:100% !important; display:block !important; }
  .pi-fb-row-${id}   { width:100% !important; display:block !important; }
  .pi-fb-cell-${id}  { width:100% !important; display:block !important; padding:0 0 24px 0 !important; box-sizing:border-box !important; }
  .pi-fb-cell-last-${id} { padding-bottom:0 !important; }
  .pi-fb-box-${id}   { width:100% !important; height:260px !important; padding-bottom:0 !important; }
  .pi-fb-divider-${id} { display:none !important; width:0 !important; height:0 !important; }
}
</style>`

      return `<!--[riazify:product_image:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0;background-color:${p.bgColor ?? '#ffffff'};">
  <tr>
    <td align="center" style="padding:32px 16px;text-align:center;">
      <table class="pi-fb-table-${id}" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tbody class="pi-fb-tbody-${id}">
          <tr class="pi-fb-row-${id}">

            <!-- Front image card (Full size on mobile) -->
            <td class="pi-fb-cell-${id}" width="48%" align="center" style="vertical-align:top;text-align:center;padding-right:8px;">
              <div align="center" class="pi-fb-box-${id}" style="display:block;width:100%;position:relative;height:0;padding-bottom:75%;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background-color:#ffffff;margin:0 auto;" data-canvas-dropzone="src">
                <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}" data-slot="src"
                  style="position:absolute;top:0;left:0;width:100%;height:100%;display:block;margin:0 auto;object-fit:contain;object-position:center;border-radius:0;${border}" />
              </div>
              <p style="${labelStyle}">${img1Label}</p>
            </td>

            <!-- Vertical divider (Hides on mobile) -->
            <td class="pi-fb-divider-${id}" width="4%" style="vertical-align:top;text-align:center;padding:8px 4px 0;">
              <div style="width:1px;background-color:#e5e7eb;height:100%;min-height:180px;margin:0 auto;"></div>
            </td>

            <!-- Back image card (Full size on mobile) -->
            <td class="pi-fb-cell-${id} pi-fb-cell-last-${id}" width="48%" align="center" style="vertical-align:top;text-align:center;padding-left:8px;">
              <div align="center" class="pi-fb-box-${id}" style="display:block;width:100%;position:relative;height:0;padding-bottom:75%;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background-color:#ffffff;margin:0 auto;" data-canvas-dropzone="image2Url">
                <img src="${p.image2Url ?? '{{IMAGE_2_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'} detail" data-slot="image2Url"
                  style="position:absolute;top:0;left:0;width:100%;height:100%;display:block;margin:0 auto;object-fit:contain;object-position:center;border-radius:0;${border}" />
              </div>
              <p style="${labelStyle}">${img2Label}</p>
            </td>

          </tr>
        </tbody>
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
    description: 'Cinematic in-context photo with everyday use-case benefit pills',
    toHtml(p: any, id: string): string {
      const title = p.lifestyleName || p.alt || '{{PRODUCT_TITLE}}'
      const sub = p.lifestyleSubtext || 'Engineered for seamless comfort in every daily setting'
      const useCase1 = p.useCase1 || '🏠 Home & Relaxation'
      const useCase2 = p.useCase2 || '💼 Work & Commute'
      const useCase3 = p.useCase3 || '✈️ Travel & Adventure'

      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pi-ls-title-${id} { font-size:16px !important; line-height:1.3 !important; }
  .pi-ls-sub-${id}   { font-size:11px !important; display:none !important; }
  .pi-ls-cases-${id} { flex-wrap:wrap !important; gap:6px !important; justify-content:center !important; }
  .pi-ls-pill-${id}  { font-size:10px !important; padding:4px 10px !important; }
}
</style>`

      return `<!--[riazify:product_image:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0;background-color:${p.bgColor ?? '#000000'};border-radius:0;overflow:hidden;">
  <tr>
    <td align="center" style="padding:0;line-height:0;font-size:0;position:relative;text-align:center;border-radius:0;">
      <div align="center" style="position:relative;overflow:hidden;border-radius:0;margin:0 auto;text-align:center;display:block;width:100%;max-width:100%;" data-canvas-dropzone="src">

        <!-- Lifestyle Image (Zero Carve) -->
        <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}" data-slot="src"
          style="width:100%;display:block;margin:0 auto;height:auto;min-height:${p.minHeight ?? 340}px;max-height:520px;object-fit:cover;border-radius:0;${shadowStyle(p)}" />

        <!-- Top Left "In Action" Tag -->
        <div style="position:absolute;top:16px;left:16px;z-index:2;background:rgba(15,23,42,0.65);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.25);color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:800;padding:5px 12px;border-radius:20px;letter-spacing:0.08em;text-transform:uppercase;line-height:1.2;">
          <span style="color:#22c55e;margin-right:4px;">●</span> LIFESTYLE & IN USE
        </div>

        <!-- Floating Edit Overlay for Canvas -->
        <div data-canvas-overlay="src" style="position:absolute;top:12px;right:12px;background:rgba(30,21,53,0.85);color:#fff;font-family:Arial,sans-serif;font-size:10px;font-weight:700;padding:5px 10px;border-radius:20px;letter-spacing:0.04em;opacity:0;transition:opacity 0.15s ease;pointer-events:none;z-index:10;box-shadow:0 2px 6px rgba(0,0,0,0.25);display:flex;align-items:center;gap:5px;white-space:nowrap;">
          <span>✎</span> Change Image
        </div>

        <!-- Text & 3 Glass Pills directly on image (No white background card, very low opacity gentle gradient) -->
        <div style="position:absolute;bottom:0;left:0;right:0;padding:28px 20px 20px 20px;background:linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%);text-align:center;z-index:3;">
          <!-- Product Title directly on image -->
          <h2 class="pi-ls-title-${id}" style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:${p.nameFontSize ?? 20}px;font-weight:800;color:#ffffff;line-height:1.3;text-shadow:0 1px 3px rgba(0,0,0,0.5);letter-spacing:-0.01em;">
            ${title}
          </h2>
          <!-- Subtext directly on image -->
          <p class="pi-ls-sub-${id}" style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:500;color:rgba(255,255,255,0.9);line-height:1.4;text-shadow:0 1px 2px rgba(0,0,0,0.4);">
            ${sub}
          </p>

          <!-- The Exact 3 Glass Use-Case Pills -->
          <div class="pi-ls-cases-${id}" style="display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:nowrap;">
            <div class="pi-ls-pill-${id}" style="background:rgba(255,255,255,0.18);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.3);color:#ffffff;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:6px 14px;border-radius:20px;letter-spacing:0.02em;box-shadow:0 2px 6px rgba(0,0,0,0.25);white-space:nowrap;line-height:1.2;">
              ${useCase1}
            </div>
            <div class="pi-ls-pill-${id}" style="background:rgba(255,255,255,0.18);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.3);color:#ffffff;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:6px 14px;border-radius:20px;letter-spacing:0.02em;box-shadow:0 2px 6px rgba(0,0,0,0.25);white-space:nowrap;line-height:1.2;">
              ${useCase2}
            </div>
            <div class="pi-ls-pill-${id}" style="background:rgba(255,255,255,0.18);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.3);color:#ffffff;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:6px 14px;border-radius:20px;letter-spacing:0.02em;box-shadow:0 2px 6px rgba(0,0,0,0.25);white-space:nowrap;line-height:1.2;">
              ${useCase3}
            </div>
          </div>

        </div>

      </div>
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
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0;background-color:${p.bgColor ?? '#f5f0e8'};">
  <tr>
    <td align="center" style="padding:32px ${p.paddingRight ?? 20}px ${p.paddingBottom ?? 20}px ${p.paddingLeft ?? 20}px;text-align:center;">
      <table cellpadding="0" cellspacing="0" border="0" align="center" style="display:block;width:100%;max-width:380px;margin:0 auto;border-collapse:collapse;background-color:#ffffff;border-radius:12px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.1);padding:16px 16px 24px 16px;">
        <tr>
          <td align="center" style="padding:0;line-height:0;text-align:center;position:relative;">
            <div align="center" style="display:block;width:100%;max-width:100%;margin:0 auto;text-align:center;position:relative;display:inline-block;" data-canvas-dropzone="src">
              <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}" data-slot="src"
                style="width:100%;height:auto;display:block;margin:0 auto;border-radius:6px;object-fit:${p.objectFit ?? 'cover'};${shadowStyle(p)}" />
              <div data-canvas-overlay="src" style="position:absolute;top:12px;right:12px;background:rgba(30,21,53,0.85);color:#fff;font-family:Arial,sans-serif;font-size:10px;font-weight:700;padding:5px 10px;border-radius:20px;letter-spacing:0.04em;opacity:0;transition:opacity 0.15s ease;pointer-events:none;z-index:10;box-shadow:0 2px 6px rgba(0,0,0,0.25);display:flex;align-items:center;gap:5px;white-space:nowrap;">
                <span>✎</span> Change Image
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 4px 0;text-align:center;">
            <div style="margin-top:12px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:${p.captionFontSize ?? 13}px;font-weight:500;color:${p.captionColor ?? '#4b5563'};line-height:1.4;">${caption}${p.polaroidSuffix !== undefined ? (p.polaroidSuffix ? ` &mdash; ${p.polaroidSuffix}` : '') : ' &mdash; Premium Edition'}</div>
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
    description: 'Side-by-side before and after comparison with equal-height cards, clean badge headers, centered wrapper, and pt-8 toolbar clearance',
    toHtml(p: any, id: string): string {
      const beforeLabel = p.beforeLabel ?? 'BEFORE'
      const afterLabel = p.afterLabel ?? 'AFTER'
      const labelBg = p.accentColor ?? '#7530fb'
      return `<!--[riazify:product_image:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0;background-color:${p.bgColor ?? '#f8fafc'};text-align:center;">
  <tr>
    <td align="center" style="padding-top:32px;padding-right:${p.paddingRight ?? 20}px;padding-bottom:${p.paddingBottom ?? 16}px;padding-left:${p.paddingLeft ?? 20}px;margin:0 auto;text-align:center;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;text-align:center;max-width:680px;">
        <tr>
          <!-- Before card -->
          <td width="50%" align="center" style="vertical-align:top;text-align:center;padding-right:6px;">
            <div align="center" style="margin:0 auto;text-align:center;">
              <div align="center" data-canvas-dropzone="src" style="display:block;width:100%;position:relative;height:0;padding-bottom:75%;border-radius:${p.borderRadius ?? 8}px;overflow:hidden;background-color:#f3f4f6;margin:0 auto;">
                <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${beforeLabel}" data-slot="src"
                  style="position:absolute;top:0;left:0;width:100%;height:100%;display:block;margin:0 auto;object-fit:cover;object-position:center;border-radius:${p.borderRadius ?? 8}px;${shadowStyle(p)}" />
              </div>
              <table cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;width:100%;">
                <tr><td align="center" style="background-color:${labelBg};border-radius:6px;padding:6px 14px;">
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:0.1em;line-height:1.3;">${beforeLabel}</p>
                </td></tr>
              </table>
            </div>
          </td>
          <!-- After card -->
          <td width="50%" align="center" style="vertical-align:top;text-align:center;padding-left:6px;">
            <div align="center" style="margin:0 auto;text-align:center;">
              <div align="center" data-canvas-dropzone="image2Url" style="display:block;width:100%;position:relative;height:0;padding-bottom:75%;border-radius:${p.borderRadius ?? 8}px;overflow:hidden;background-color:#f3f4f6;margin:0 auto;">
                <img src="${p.image2Url ?? '{{IMAGE_2_URL}}'}" alt="${afterLabel}" data-slot="image2Url"
                  style="position:absolute;top:0;left:0;width:100%;height:100%;display:block;margin:0 auto;object-fit:cover;object-position:center;border-radius:${p.borderRadius ?? 8}px;${shadowStyle(p)}" />
              </div>
              <table cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;width:100%;">
                <tr><td align="center" style="background-color:${labelBg};border-radius:6px;padding:6px 14px;">
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:0.1em;line-height:1.3;">${afterLabel}</p>
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
      const gap = 8
      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pi-mg-table-${id} { height:auto !important; }
  .pi-mg-row-${id}   { display:block !important; height:auto !important; }
  .pi-mg-main-${id}  { display:block !important; width:100% !important; height:260px !important; padding:0 0 ${gap}px 0 !important; }
  .pi-mg-side-${id}  { display:block !important; width:100% !important; height:auto !important; padding:0 !important; }
  .pi-mg-thumb-${id} { height:160px !important; }
}
</style>`
      return `<!--[riazify:product_image:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0;background-color:${p.bgColor ?? '#ffffff'};text-align:center;">
  <tr>
    <td align="center" style="padding:32px ${p.paddingRight ?? 20}px ${p.paddingBottom ?? 16}px ${p.paddingLeft ?? 20}px;margin:0 auto;text-align:center;">
      <table class="pi-mg-table-${id}" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;height:380px;">
        <tr class="pi-mg-row-${id}" style="height:100%;">
          <!-- Large hero left (60%) -->
          <td class="pi-mg-main-${id}" width="60%" valign="top" align="center" style="vertical-align:top;text-align:center;padding-right:${gap}px;height:380px;">
            <div align="center" data-canvas-dropzone="src" style="position:relative;width:100%;height:100%;border-radius:${p.borderRadius ?? 6}px;overflow:hidden;background-color:#f3f4f6;margin:0 auto;">
              <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}" data-slot="src"
                style="position:absolute;top:0;left:0;width:100%;height:100%;display:block;margin:0 auto;object-fit:cover;object-position:center;border-radius:${p.borderRadius ?? 6}px;${shadowStyle(p)}" />
            </div>
          </td>
          <!-- Two stacked images right (40%) -->
          <td class="pi-mg-side-${id}" width="40%" valign="top" align="center" style="vertical-align:top;text-align:center;padding-left:${gap}px;height:380px;">
            <div class="pi-mg-thumb-${id}" align="center" data-canvas-dropzone="image2Url" style="position:relative;width:100%;height:186px;border-radius:${p.borderRadius ?? 6}px;overflow:hidden;background-color:#f3f4f6;margin:0 auto;margin-bottom:${gap}px;">
              <img src="${p.image2Url ?? '{{IMAGE_2_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'} view 2" data-slot="image2Url"
                style="position:absolute;top:0;left:0;width:100%;height:100%;display:block;margin:0 auto;object-fit:cover;object-position:center;border-radius:${p.borderRadius ?? 6}px;${shadowStyle(p)}" />
            </div>
            <div class="pi-mg-thumb-${id}" align="center" data-canvas-dropzone="image3Url" style="position:relative;width:100%;height:186px;border-radius:${p.borderRadius ?? 6}px;overflow:hidden;background-color:#f3f4f6;margin:0 auto;">
              <img src="${p.image3Url ?? '{{IMAGE_3_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'} view 3" data-slot="image3Url"
                style="position:absolute;top:0;left:0;width:100%;height:100%;display:block;margin:0 auto;object-fit:cover;object-position:center;border-radius:${p.borderRadius ?? 6}px;${shadowStyle(p)}" />
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

  // ── Variant 11: Inverted Magazine Grid ─────────────────────
  // Mirrors the standard Magazine Grid but with the layout flipped:
  // the hero image occupies the RIGHT column (60%) and the two stacked
  // thumbnails sit in the LEFT column (40%). Uses the same fixed-height
  // table structure (380px) with identical gap math to prevent any
  // vertical misalignment or bottom overflow.
  {
    id: 'inverted-magazine-grid',
    label: 'Inverted Magazine Grid',
    description: 'Two stacked images left, one grand hero image right — inverted editorial layout',
    toHtml(p: any, id: string): string {
      const gap = 8
      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pi-img-table-${id} { height:auto !important; }
  .pi-img-row-${id}   { display:flex !important; flex-direction:column !important; height:auto !important; }
  .pi-img-main-${id}  { display:block !important; width:100% !important; height:260px !important; padding:0 0 ${gap}px 0 !important; order:1 !important; }
  .pi-img-side-${id}  { display:block !important; width:100% !important; height:auto !important; padding:0 !important; order:2 !important; }
  .pi-img-thumb-${id} { height:160px !important; }
}
</style>`
      return `<!--[riazify:product_image:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0;background-color:${p.bgColor ?? '#ffffff'};text-align:center;">
  <tr>
    <td align="center" style="padding:32px ${p.paddingRight ?? 20}px ${p.paddingBottom ?? 16}px ${p.paddingLeft ?? 20}px;margin:0 auto;text-align:center;">
      <table class="pi-img-table-${id}" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;height:380px;">
        <tr class="pi-img-row-${id}" style="height:100%;">
          <!-- Two stacked images left (40%) -->
          <td class="pi-img-side-${id}" width="40%" valign="top" align="center" style="vertical-align:top;text-align:center;padding-right:${gap}px;height:380px;">
            <div class="pi-img-thumb-${id}" align="center" data-canvas-dropzone="src" style="position:relative;width:100%;height:186px;border-radius:${p.borderRadius ?? 6}px;overflow:hidden;background-color:#f3f4f6;margin:0 auto;margin-bottom:${gap}px;">
              <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'} view 1" data-slot="src"
                style="position:absolute;top:0;left:0;width:100%;height:100%;display:block;margin:0 auto;object-fit:cover;object-position:center;border-radius:${p.borderRadius ?? 6}px;${shadowStyle(p)}" />
            </div>
            <div class="pi-img-thumb-${id}" align="center" data-canvas-dropzone="image2Url" style="position:relative;width:100%;height:186px;border-radius:${p.borderRadius ?? 6}px;overflow:hidden;background-color:#f3f4f6;margin:0 auto;">
              <img src="${p.image2Url ?? '{{SECONDARY_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'} view 2" data-slot="image2Url"
                style="position:absolute;top:0;left:0;width:100%;height:100%;display:block;margin:0 auto;object-fit:cover;object-position:center;border-radius:${p.borderRadius ?? 6}px;${shadowStyle(p)}" />
            </div>
          </td>
          <!-- Large hero right (60%) -->
          <td class="pi-img-main-${id}" width="60%" valign="top" align="center" style="vertical-align:top;text-align:center;padding-left:${gap}px;height:380px;">
            <div align="center" data-canvas-dropzone="image3Url" style="position:relative;width:100%;height:100%;border-radius:${p.borderRadius ?? 6}px;overflow:hidden;background-color:#f3f4f6;margin:0 auto;">
              <img src="${p.image3Url ?? '{{IMAGE_3_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}" data-slot="image3Url"
                style="position:absolute;top:0;left:0;width:100%;height:100%;display:block;margin:0 auto;object-fit:cover;object-position:center;border-radius:${p.borderRadius ?? 6}px;${shadowStyle(p)}" />
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

]

export function getProductImageVariant(variantId: string): BlockVariant {
  return productImageVariants.find(v => v.id === variantId) ?? productImageVariants[0]
}
