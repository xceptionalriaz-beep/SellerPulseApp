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
    // Horizontal gap between image and text — 24px on each cell side
    // gives a clean 48px gutter on desktop, collapsing cleanly to
    // vertical padding when the columns stack on narrow viewports.
    const GAP = 24
    const padY = p.paddingTop ?? 16
    const padBottom = p.paddingBottom ?? 16
    const imgCell = `<td width="${imgW}%" valign="${va}" align="center" style="vertical-align:${va};text-align:center;padding:${padY}px ${isLeft ? GAP : (p.paddingRight ?? 20)}px ${padBottom}px ${isLeft ? (p.paddingLeft ?? 20) : GAP}px;">
        <div align="center" style="display:block;width:100%;max-width:100%;margin:0 auto;text-align:center;position:relative;display:inline-block;" data-canvas-dropzone="src">
          <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}"
            data-slot="src"
            style="width:100%;height:auto;display:block;margin:0 auto;${imgStyle(p)}" />
          <div data-canvas-overlay="src" style="position:absolute;top:12px;right:12px;background:rgba(30,21,53,0.85);color:#fff;font-family:Arial,sans-serif;font-size:10px;font-weight:700;padding:5px 10px;border-radius:20px;letter-spacing:0.04em;opacity:0;transition:opacity 0.15s ease;pointer-events:none;z-index:10;box-shadow:0 2px 6px rgba(0,0,0,0.25);display:flex;align-items:center;gap:5px;white-space:nowrap;">
            <span>✎</span> Change Image
          </div>
        </div>
      </td>`
    const txtCell = `<td width="${txtW}%" valign="${va}" style="vertical-align:${va};padding:${padY}px ${isLeft ? (p.paddingRight ?? 20) : GAP}px ${padBottom}px ${isLeft ? GAP : (p.paddingLeft ?? 20)}px;overflow:hidden;">
        <h2 style="margin:0 0 14px;padding-right:6px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:#1e293b;line-height:1.35;max-width:100%;word-wrap:break-word;">${p.descriptionTitle ?? '{{PRODUCT_TITLE}}'}</h2>
        <p style="margin:0;padding-right:6px;font-family:Arial,sans-serif;font-size:${p.descriptionFontSize ?? 13}px;color:${p.descriptionColor ?? '#475569'};line-height:1.7;max-width:100%;word-wrap:break-word;">${p.descriptionText ?? '{{ITEM_DESCRIPTION}}'}</p>
      </td>`
    return [
        '<!--[riazify:product_image:' + id + ']-->',
        '<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:' + (p.bgColor ?? '#ffffff') + ';">',
        '  <tr style="vertical-align:middle;" valign="middle">',
        '    ' + (isLeft ? imgCell : txtCell),
        '    ' + (isLeft ? txtCell : imgCell),
        '  </tr>',
        '</table>',
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
            const caption = (p.caption ?? '').trim()
            const captionRow = caption
                ? `  <tr>
    <td align="center" style="padding:12px ${padRight}px ${padBottom}px ${padLeft}px;font-family:Arial,Helvetica,sans-serif;font-size:${p.captionFontSize ?? 13}px;color:${p.captionColor ?? '#475569'};line-height:1.5;">
      <p style="margin:0;font-weight:500;">${caption}</p>
    </td>
  </tr>`
                : ''
            return `<!--[riazify:product_image:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  <tr>
    <td align="center" style="padding:${padTop}px ${padRight}px 12px ${padLeft}px;text-align:center;">
      <div align="center" style="display:block;width:100%;max-width:600px;margin:0 auto;text-align:center;position:relative;display:inline-block;" data-canvas-dropzone="src">
        <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}"
          data-slot="src"
          width="600"
          style="width:100%;height:auto;display:block;margin:0 auto;margin-left:auto;margin-right:auto;object-fit:${p.objectFit ?? 'contain'};border-radius:12px;${p.showBorder ? `border:${p.borderWidth ?? 1}px solid ${p.borderColor ?? '#ede9fe'};` : ''}${p.shadow ? `box-shadow:${p.shadow};` : ''}" />
        <!-- Canvas-only hover overlay: shows only in preview, stripped by email clients -->
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
                '<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:' + (p.bgColor ?? '#f8fafc') + ';">',
                '  <tr>',
                '    <td style="padding:' + MAIN_TOP + 'px ' + padR + 'px ' + MAIN_BOTTOM + 'px ' + padL + 'px;">',
                // Center the main image with an explicit inner wrapper that
                // has a fixed max-width + auto side margins. This guarantees
                // the image and the thumb strip below share the same centered
                // width, so their left/right edges align perfectly.
                '      <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:600px;margin:0 auto;border-collapse:collapse;">',
                '        <tr><td align="center" style="text-align:center;">',
                '          <img src="' + (p.src ?? '{{MAIN_IMAGE_URL}}') + '" alt="' + (p.alt ?? '{{PRODUCT_TITLE}}') + '" data-slot="src" style="width:100%;height:auto;display:block;object-fit:' + (p.objectFit ?? 'contain') + ';border-radius:' + (p.borderRadius ?? 8) + 'px;max-height:420px;margin:0 auto;' + shadowStyle(p) + '" />',
                '        </td></tr>',
                '      </table>',
                '    </td>',
                '  </tr>',
                '  <tr>',
                '    <td style="padding:0 ' + padR + 'px ' + (p.paddingBottom ?? 12) + 'px ' + padL + 'px;">',
                // Thumb strip uses the same 600px max-width inner wrapper as
                // the main image, so the two rows are visually locked to the
                // same horizontal extent. align="center" + margin:0 auto on
                // the wrapper handles the centering in email clients that
                // ignore flex/grid.
                '      <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:600px;margin:0 auto;border-collapse:collapse;">',
                '        <tr>' + thumbsHtml + '</tr>',
                '      </table>',
                '    </td>',
                '  </tr>',
                '  <tr>',
                '    <td style="padding:0 ' + padR + 'px 8px ' + padL + 'px;text-align:center;">',
                '      <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;color:#9ca3af;">Scroll to view all images</p>',
                '    </td>',
                '  </tr>',
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
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#000000'};">
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
    {
        id: 'zoom',
        label: 'Zoom Style',
        description: 'Image with magnifier hint — ideal for jewellery & watches',
        toHtml(p: any, id: string): string {
            // Container border: user-configurable solid border, otherwise
            // the signature 2px dashed purple inspection frame
            // (border-[#7530fb]/40 → 40% opacity purple) so the variant
            // reads as a "viewing window" even without a user-supplied
            // border color.
            const border = p.showBorder
                ? `border:${p.borderWidth ?? 2}px solid ${p.borderColor ?? '#ede9fe'};`
                : 'border:2px dashed rgba(117,48,251,0.4);'
            // Outer wrapper matches the user's "rounded-xl overflow-hidden
            // relative border-2 border-dashed border-[#7530fb]/40 p-1 bg-white"
            // inspection frame. The wrapper itself is centered with auto
            // side margins, and the inner image scales smoothly on hover
            // via pure CSS transition + :hover transform: scale(1.12).
            // The hover effect is email-safe CSS that just gets ignored
            // in clients that don't render it; canvas preview shows the
            // full transition.
            return `<!--[riazify:product_image:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#fafafa'};">
  <tr>
    <td align="center" style="${pad(p)}padding-top:32px;text-align:center;">
      <div align="center" class="riazify-zoom-frame" style="display:block;margin:0 auto;text-align:center;position:relative;overflow:hidden;border-radius:12px;background-color:#ffffff;padding:4px;${border}max-width:600px;width:100%;">
        <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}" data-slot="src"
          class="riazify-zoom-img"
          width="600"
          style="max-width:100%;width:100%;height:auto;display:block;margin:0 auto;margin-left:auto;margin-right:auto;object-fit:${p.objectFit ?? 'contain'};border-radius:${p.borderRadius ?? 8}px;transition:transform 0.3s ease;transform-origin:center center;" />
        <!-- Floating dark magnifier badge. Anchored to the bottom-right of
             the relative-positioned wrapper above, with z-index:10 to keep
             it above the image and white-space:nowrap so the label never
             wraps onto two lines. -->
        <div style="position:absolute;bottom:12px;right:12px;z-index:10;background:rgba(30,21,53,0.85);color:#ffffff;font-size:11px;padding:4px 10px;border-radius:20px;display:inline-flex;align-items:center;gap:4px;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);font-family:Arial,sans-serif;line-height:1.2;white-space:nowrap;">
          <span aria-hidden="true">🔍</span><span>Hover to Zoom</span>
        </div>
      </div>
      <!-- Caption text below the image, centered, small/gray, matches the
           user's mt-3 text-xs text-gray-500 font-medium spec. Default
           caption explains the high-res / multi-angle nature; can be
           overridden via the showZoomHint flag. -->
      ${p.showZoomHint !== false ? `<p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;font-weight:500;text-align:center;line-height:1.5;">
        High-Resolution Detail View &mdash; See listing gallery above for full multi-angle inspection
      </p>` : ''}
    </td>
  </tr>
</table>
<style>
  /* Canvas-only hover zoom. Email clients strip <style>, so this is a
     pure progressive enhancement that lives only in the canvas iframe. */
  .riazify-zoom-frame:hover .riazify-zoom-img { transform: scale(1.12); }
</style>
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
                ? `border:1px solid ${p.borderColor ?? '#e5e7eb'};`
                : ''
            // text-xs font-bold tracking-wider text-gray-500 uppercase mt-2
            // → font-size:12px; font-weight:700; letter-spacing:0.08em;
            //   color:#6b7280; text-transform:uppercase; margin-top:8px;
            const labelStyle = `margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#6b7280;text-align:center;text-transform:uppercase;letter-spacing:0.08em;line-height:1.2;`
            // Each image sits inside a card with 4:3 aspect ratio enforced
            // via the height:0 + padding-bottom:75% trick on a relative
            // wrapper. object-fit:cover + object-position:center fills
            // the card cleanly so both columns render at identical
            // vertical height, regardless of the source image dimensions.
            // border border-gray-200 rounded-xl p-2 bg-white →
            // border:1px solid #e5e7eb; border-radius:12px; padding:8px;
            // background-color:#ffffff;
            const cardStyle = `display:block;width:100%;max-width:100%;position:relative;height:0;padding-bottom:75%;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background-color:#ffffff;margin:0 auto;`
            const img1Label = p.label1 ?? 'Front'
            const img2Label = p.label2 ?? 'Back'
            // Bump default top padding to 32px so the floating action
            // toolbar (move/duplicate/delete) sits well above the cards.
            return `<!--[riazify:product_image:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  <tr>
    <td align="center" style="padding:32px ${p.paddingRight ?? 20}px ${p.paddingBottom ?? 16}px ${p.paddingLeft ?? 20}px;text-align:center;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;">
        <tr>
          <!-- Left image card -->
          <td width="48%" align="center" style="vertical-align:top;text-align:center;padding-right:8px;">
            <div align="center" style="${cardStyle}" data-canvas-dropzone="src">
              <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}" data-slot="src"
                style="position:absolute;top:0;left:0;width:100%;height:100%;display:block;margin:0 auto;object-fit:cover;object-position:center;border-radius:0;${border}" />
            </div>
            <p style="${labelStyle}">${img1Label}</p>
          </td>
          <!-- Vertical divider that spans the full height of the cards
               (75% padding-bottom of the row) -->
          <td width="4%" style="vertical-align:top;text-align:center;padding:8px 4px 0;">
            <div style="width:1px;background-color:#e5e7eb;height:100%;min-height:140px;margin:0 auto;"></div>
          </td>
          <!-- Right image card -->
          <td width="48%" align="center" style="vertical-align:top;text-align:center;padding-left:8px;">
            <div align="center" style="${cardStyle}" data-canvas-dropzone="image2Url">
              <img src="${p.image2Url ?? '{{IMAGE_2_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'} detail" data-slot="image2Url"
                style="position:absolute;top:0;left:0;width:100%;height:100%;display:block;margin:0 auto;object-fit:cover;object-position:center;border-radius:0;${border}" />
            </div>
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
    <td align="center" style="padding:32px 0 0 0;line-height:0;font-size:0;position:relative;text-align:center;">
      <!--[if !mso]><!-->
      <div align="center" style="position:relative;overflow:hidden;border-radius:${p.borderRadius ?? 0}px;margin:0 auto;text-align:center;display:block;width:100%;max-width:100%;" data-canvas-dropzone="src">
        <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}" data-slot="src"
          style="width:100%;display:block;margin:0 auto;height:auto;min-height:${p.minHeight ?? 320}px;object-fit:cover;${shadowStyle(p)}" />
        <div data-canvas-overlay="src" style="position:absolute;top:12px;right:12px;background:rgba(30,21,53,0.85);color:#fff;font-family:Arial,sans-serif;font-size:10px;font-weight:700;padding:5px 10px;border-radius:20px;letter-spacing:0.04em;opacity:0;transition:opacity 0.15s ease;pointer-events:none;z-index:10;box-shadow:0 2px 6px rgba(0,0,0,0.25);display:flex;align-items:center;gap:5px;white-space:nowrap;">
          <span>✎</span> Change Image
        </div>
        <!-- Single combined overlay: gradient for readability + caption text inside. -->
        <div style="position:absolute;bottom:0;left:0;right:0;padding:24px 16px 16px 16px;background:linear-gradient(to top,${overlayColor},rgba(0,0,0,0));border-bottom-left-radius:${p.borderRadius ?? 0}px;border-bottom-right-radius:${p.borderRadius ?? 0}px;text-align:center;">
          <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:${p.nameFontSize ?? 14}px;font-weight:600;color:#ffffff;line-height:1.3;text-shadow:0 1px 2px rgba(0,0,0,0.5);">${p.alt ?? '{{PRODUCT_TITLE}}'}</p>
          ${p.lifestyleSubtext ? `<p style="margin:0;font-family:Arial,sans-serif;font-size:12px;font-weight:500;color:rgba(255,255,255,0.9);line-height:1.4;text-shadow:0 1px 2px rgba(0,0,0,0.5);">${p.lifestyleSubtext}</p>` : ''}
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
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#f5f0e8'};">
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
            <div style="margin-top:12px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:500;color:#4b5563;line-height:1.4;">${caption} &mdash; Premium Edition</div>
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
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#f8fafc'};margin:0 auto;text-align:center;">
  <tr>
    <td align="center" style="padding-top:32px;padding-right:${p.paddingRight ?? 20}px;padding-bottom:${p.paddingBottom ?? 16}px;padding-left:${p.paddingLeft ?? 20}px;margin:0 auto;text-align:center;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;text-align:center;max-width:680px;">
        <tr>
          <!-- Before card -->
          <td width="50%" align="center" style="vertical-align:top;text-align:center;padding-right:6px;">
            <div align="center" style="margin:0 auto;text-align:center;">
              <div align="center" style="display:block;width:100%;position:relative;height:0;padding-bottom:75%;border-radius:${p.borderRadius ?? 8}px;overflow:hidden;background-color:#f3f4f6;margin:0 auto;">
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
              <div align="center" style="display:block;width:100%;position:relative;height:0;padding-bottom:75%;border-radius:${p.borderRadius ?? 8}px;overflow:hidden;background-color:#f3f4f6;margin:0 auto;">
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
            return `<!--[riazify:product_image:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};margin:0 auto;text-align:center;">
  <tr>
    <td align="center" style="padding:32px ${p.paddingRight ?? 20}px ${p.paddingBottom ?? 16}px ${p.paddingLeft ?? 20}px;margin:0 auto;text-align:center;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;height:380px;">
        <tr style="height:100%;">
          <!-- Large hero left (60%) — fixed height matching full row -->
          <td width="60%" valign="top" align="center" style="vertical-align:top;text-align:center;padding-right:${gap}px;height:380px;">
            <div align="center" style="position:relative;width:100%;height:100%;border-radius:${p.borderRadius ?? 6}px;overflow:hidden;background-color:#f3f4f6;margin:0 auto;">
              <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'}" data-slot="src"
                style="position:absolute;top:0;left:0;width:100%;height:100%;display:block;margin:0 auto;object-fit:cover;object-position:center;border-radius:${p.borderRadius ?? 6}px;${shadowStyle(p)}" />
            </div>
          </td>
          <!-- Two stacked images right (40%) — exact split: (380-8)/2 -->
          <td width="40%" valign="top" align="center" style="vertical-align:top;text-align:center;padding-left:${gap}px;height:380px;">
            <div align="center" style="position:relative;width:100%;height:186px;border-radius:${p.borderRadius ?? 6}px;overflow:hidden;background-color:#f3f4f6;margin:0 auto;margin-bottom:${gap}px;">
              <img src="${p.image2Url ?? '{{IMAGE_2_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'} view 2" data-slot="image2Url"
                style="position:absolute;top:0;left:0;width:100%;height:100%;display:block;margin:0 auto;object-fit:cover;object-position:center;border-radius:${p.borderRadius ?? 6}px;${shadowStyle(p)}" />
            </div>
            <div align="center" style="position:relative;width:100%;height:186px;border-radius:${p.borderRadius ?? 6}px;overflow:hidden;background-color:#f3f4f6;margin:0 auto;">
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
            return `<!--[riazify:product_image:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};margin:0 auto;text-align:center;">
  <tr>
    <td align="center" style="padding:32px ${p.paddingRight ?? 20}px ${p.paddingBottom ?? 16}px ${p.paddingLeft ?? 20}px;margin:0 auto;text-align:center;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;height:380px;">
        <tr style="height:100%;">
          <!-- Two stacked images left (40%) — exact split: (380-8)/2 -->
          <td width="40%" valign="top" align="center" style="vertical-align:top;text-align:center;padding-right:${gap}px;height:380px;">
            <div align="center" style="position:relative;width:100%;height:186px;border-radius:${p.borderRadius ?? 6}px;overflow:hidden;background-color:#f3f4f6;margin:0 auto;margin-bottom:${gap}px;">
              <img src="${p.src ?? '{{MAIN_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'} view 1" data-slot="src"
                style="position:absolute;top:0;left:0;width:100%;height:100%;display:block;margin:0 auto;object-fit:cover;object-position:center;border-radius:${p.borderRadius ?? 6}px;${shadowStyle(p)}" />
            </div>
            <div align="center" style="position:relative;width:100%;height:186px;border-radius:${p.borderRadius ?? 6}px;overflow:hidden;background-color:#f3f4f6;margin:0 auto;">
              <img src="${p.image2Url ?? '{{SECONDARY_IMAGE_URL}}'}" alt="${p.alt ?? '{{PRODUCT_TITLE}}'} view 2" data-slot="image2Url"
                style="position:absolute;top:0;left:0;width:100%;height:100%;display:block;margin:0 auto;object-fit:cover;object-position:center;border-radius:${p.borderRadius ?? 6}px;${shadowStyle(p)}" />
            </div>
          </td>
          <!-- Large hero right (60%) — fixed height matching full row -->
          <td width="60%" valign="top" align="center" style="vertical-align:top;text-align:center;padding-left:${gap}px;height:380px;">
            <div align="center" style="position:relative;width:100%;height:100%;border-radius:${p.borderRadius ?? 6}px;overflow:hidden;background-color:#f3f4f6;margin:0 auto;">
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
