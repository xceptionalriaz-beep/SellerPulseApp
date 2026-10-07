// components/ui/VisualEditor/variants/product_description.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Product Description — 6 layout variants (Full-width, Curve-free, Mobile Optimized)
//
// Every variant shares the same ProductDescriptionProps — sellers never
// re-type their content when switching layout.
//
// Variants solve specific eBay seller problems:
//   plain        → Premium / editorial look (high-ticket goods)
//   accent-bar   → Brand-anchored authority (pulls brand accent colour)
//   feature-box  → Scannable for mobile buyers (key points + detail)
//   split-story  → Story + facts side-by-side (vintage / handmade)
//   card-elevated → Trust & perceived value (tools / electronics)
//   dark-luxury  → Exclusivity signal (jewellery / watches / art)
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
  id: string
  label: string
  description: string
  toHtml: (props: any, id: string) => string
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function pad(p: any, defaults = { t: 20, r: 24, b: 20, l: 24 }): string {
  return `padding:${p.paddingTop ?? defaults.t}px ${p.paddingRight ?? defaults.r}px ${p.paddingBottom ?? defaults.b}px ${p.paddingLeft ?? defaults.l}px;`
}

// Title bar — each variant calls this with its own styling
function titleHtml(p: any, style: string, extraClass: string = ''): string {
  if (p.showTitle === false) return ''
  const ls = p.titleLetterSpacing ? `letter-spacing:${p.titleLetterSpacing}px;` : ''
  const ta = `text-align:${p.titleAlign ?? 'left'};`
  const fw = `font-weight:${p.titleFontWeight ?? '700'};`
  const cls = extraClass ? ` class="${extraClass}"` : ''
  return `<p${cls} style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:${p.titleFontSize ?? 16}px;${fw}color:${p.titleColor ?? '#1e1535'};${ta}${ls}${style}">${p.titleText ?? 'Product Description'}</p>`
}

// Body text — shared across all variants
function bodyHtml(p: any, extraStyle = '', extraClass = ''): string {
  const ls = p.letterSpacing ? `letter-spacing:${p.letterSpacing}px;` : ''
  const ta = `text-align:${p.textAlign ?? 'left'};`
  const descText = p.text && p.text !== '{{ITEM_DESCRIPTION}}'
    ? p.text
    : 'A high-quality product sample. Replace this text with the actual item description.'
  const cls = extraClass ? ` class="${extraClass}"` : ''
  return `<p${cls} style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize ?? 14}px;font-weight:${p.fontWeight ?? '400'};line-height:${p.lineHeight ?? 1.8};color:${p.color ?? '#6b7280'};${ta}${ls}${extraStyle}">${descText}</p>`
}

// Accent colour — pulled from seller's brand (falls back to Riazify purple)
function accent(p: any): string {
  return p.accentColor ?? p.primaryColor ?? '#7530fb'
}

// ─────────────────────────────────────────────────────────────────────────────
export const productDescriptionVariants: BlockVariant[] = [

  // ── 1. Plain (Clean Editorial) ────────────────────────────────────────────
  {
    id: 'plain',
    label: 'Plain',
    description: 'Clean editorial layout — white space and typography carry the authority',
    toHtml(p: any, id: string): string {
      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pd-plain-pad-${id} { padding: 16px 16px !important; }
  .pd-plain-title-${id} { font-size: 15px !important; }
  .pd-plain-body-${id} { font-size: 13px !important; line-height: 1.6 !important; }
}
</style>`
      const titleSection = p.showTitle !== false
        ? titleHtml(p, 'padding-bottom:10px;border-bottom:1px solid #e5e7eb;', `pd-plain-title-${id}`)
        : ''
      return `<!--[riazify:product_description:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${p.bgColor ?? '#ffffff'};">
  <tr>
    <td class="pd-plain-pad-${id}" style="${pad(p)}">
      ${titleSection}
      ${bodyHtml(p, '', `pd-plain-body-${id}`)}
    </td>
  </tr>
</table>
<!--[/riazify:product_description:${id}]-->`
    },
  },

  // ── 2. Accent Bar (Brand Authority) ───────────────────────────────────────
  {
    id: 'accent-bar',
    label: 'Accent Bar',
    description: 'Vertical brand-colour stripe — instantly ties description to your store identity',
    toHtml(p: any, id: string): string {
      const ac = accent(p)
      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pd-ab-pad-${id} { padding: 16px 16px 16px 14px !important; }
  .pd-ab-title-${id} { font-size: 15px !important; }
  .pd-ab-body-${id} { font-size: 13px !important; line-height: 1.6 !important; }
}
</style>`
      const titleSection = p.showTitle !== false
        ? titleHtml(p, `margin-bottom:12px;color:${ac};`, `pd-ab-title-${id}`)
        : ''
      return `<!--[riazify:product_description:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${p.bgColor ?? '#ffffff'};">
  <tr>
    <!-- Accent stripe -->
    <td width="4" style="background-color:${ac};padding:0;font-size:0;line-height:0;">&nbsp;</td>
    <!-- Content -->
    <td class="pd-ab-pad-${id}" style="padding-top:${p.paddingTop ?? 20}px;padding-bottom:${p.paddingBottom ?? 20}px;padding-left:20px;padding-right:${p.paddingRight ?? 24}px;">
      ${titleSection}
      ${bodyHtml(p, '', `pd-ab-body-${id}`)}
    </td>
  </tr>
</table>
<!--[/riazify:product_description:${id}]-->`
    },
  },

  // ── 3. Feature Box (Scannable, Curve-Free) ────────────────────────────────
  {
    id: 'feature-box',
    label: 'Feature Box',
    description: '3 scannable key-point pills above the description — built for mobile buyers',
    toHtml(p: any, id: string): string {
      const ac = accent(p)
      const acLight = p.accentColorLight ?? `${ac}14`
      const f1 = p.feature1 ?? '✓ Premium Quality'
      const f2 = p.feature2 ?? '✓ Fast Dispatch'
      const f3 = p.feature3 ?? '✓ 30-Day Returns'

      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pd-fb-pill-cell-${id} { display: block !important; width: 100% !important; padding: 3px 0 !important; }
  .pd-fb-pill-table-${id} { width: 100% !important; text-align: center !important; }
  .pd-fb-pad-top-${id} { padding: 14px 16px 12px 16px !important; }
  .pd-fb-pad-bot-${id} { padding: 14px 16px 16px 16px !important; }
  .pd-fb-pad-rule-${id} { padding: 0 16px !important; }
}
</style>`

      // Curve removed (sharp rectangular pill badges)
      const pill = (text: string) =>
        `<td class="pd-fb-pill-cell-${id}" style="padding:0 4px;">
          <table class="pd-fb-pill-table-${id}" cellpadding="0" cellspacing="0" border="0" style="background-color:${acLight};border:1px solid ${ac}22;">
            <tr><td align="center" style="padding:7px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:${ac};white-space:nowrap;text-align:center;">${text}</td></tr>
          </table>
        </td>`

      const titleSection = p.showTitle !== false
        ? titleHtml(p, '')
        : ''
      return `<!--[riazify:product_description:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${p.bgColor ?? '#ffffff'};">
  <!-- Feature pills row -->
  <tr>
    <td class="pd-fb-pad-top-${id}" style="padding:${p.paddingTop ?? 20}px ${p.paddingRight ?? 24}px 16px ${p.paddingLeft ?? 24}px;">
      <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
        <tr>
          ${pill(f1)}
          ${pill(f2)}
          ${pill(f3)}
        </tr>
      </table>
    </td>
  </tr>
  <!-- Thin rule -->
  <tr>
    <td class="pd-fb-pad-rule-${id}" style="padding:0 ${p.paddingRight ?? 24}px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:1px;background-color:#e5e7eb;font-size:0;line-height:0;"></td></tr></table></td>
  </tr>
  <!-- Title + Body -->
  <tr>
    <td class="pd-fb-pad-bot-${id}" style="padding:16px ${p.paddingRight ?? 24}px ${p.paddingBottom ?? 20}px ${p.paddingLeft ?? 24}px;">
      ${titleSection}
      ${bodyHtml(p)}
    </td>
  </tr>
</table>
<!--[/riazify:product_description:${id}]-->`
    },
  },

  // ── 4. Split Story (Mobile View: Columns Stack Cleanly) ────────────────────
  {
    id: 'split-story',
    label: 'Split Story',
    description: 'Story left, detail right — stacks cleanly on mobile',
    toHtml(p: any, id: string): string {
      const ac = accent(p)
      const fullText = p.text && p.text !== '{{ITEM_DESCRIPTION}}'
        ? p.text
        : 'A high-quality product sample. Replace this text with the actual item description.'
      const midPoint = Math.floor(fullText.length / 2)
      const splitAt = fullText.indexOf('. ', midPoint)
      const leftText = splitAt > 0 ? fullText.slice(0, splitAt + 1) : fullText
      const rightText = splitAt > 0 ? fullText.slice(splitAt + 1).trim() : ''

      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pd-ss-left-${id} { display: block !important; width: 100% !important; padding: 0 16px 14px 16px !important; box-sizing: border-box !important; }
  .pd-ss-divider-${id} { display: none !important; }
  .pd-ss-right-${id} { display: block !important; width: 100% !important; padding: 14px 16px 16px 16px !important; box-sizing: border-box !important; border-top: 1px dashed #e5e7eb !important; }
  .pd-ss-title-${id} { padding: 16px 16px 10px 16px !important; }
}
</style>`

      const titleSection = p.showTitle !== false
        ? `<td colspan="3" class="pd-ss-title-${id}" style="padding:${p.paddingTop ?? 20}px ${p.paddingRight ?? 24}px 14px ${p.paddingLeft ?? 24}px;">
             <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.titleFontSize ?? 16}px;font-weight:700;color:${p.titleColor ?? '#1e1535'};padding-bottom:10px;border-bottom:2px solid ${ac};">${p.titleText ?? 'Product Description'}</p>
           </td>`
        : ''
      return `<!--[riazify:product_description:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${p.bgColor ?? '#ffffff'};">
  ${p.showTitle !== false ? `<tr>${titleSection}</tr>` : ''}
  <tr>
    <!-- Left: story / emotional copy -->
    <td class="pd-ss-left-${id}" width="48%" style="padding:${p.showTitle !== false ? '0' : (p.paddingTop ?? 20) + 'px'} 0 ${p.paddingBottom ?? 20}px ${p.paddingLeft ?? 24}px;vertical-align:top;">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize ?? 14}px;font-weight:${p.fontWeight ?? '400'};line-height:${p.lineHeight ?? 1.8};color:${p.color ?? '#6b7280'};font-style:${p.splitItalic !== false ? 'italic' : 'normal'};text-align:${p.textAlign ?? 'left'};">${leftText}</p>
    </td>
    <!-- Vertical rule -->
    <td class="pd-ss-divider-${id}" width="4" style="padding:0 12px;vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0" style="width:1px;height:100%;"><tr><td style="background-color:#e5e7eb;width:1px;">&nbsp;</td></tr></table>
    </td>
    <!-- Right: factual detail -->
    <td class="pd-ss-right-${id}" style="padding:${p.showTitle !== false ? '0' : (p.paddingTop ?? 20) + 'px'} ${p.paddingRight ?? 24}px ${p.paddingBottom ?? 20}px 0;vertical-align:top;">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize ?? 14}px;font-weight:${p.fontWeight ?? '400'};line-height:${p.lineHeight ?? 1.8};color:${p.color ?? '#6b7280'};">${rightText || fullText}</p>
    </td>
  </tr>
</table>
<!--[/riazify:product_description:${id}]-->`
    },
  },

  // ── 5. Card Elevated (Trust & Perceived Value, Curve-Free) ─────────────────
  {
    id: 'card-elevated',
    label: 'Card',
    description: 'Clean elevated card container without curves',
    toHtml(p: any, id: string): string {
      const ac = accent(p)
      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pd-card-outer-${id} { padding: 12px 12px !important; }
  .pd-card-inner-pad-${id} { padding: 14px 14px !important; }
}
</style>`
      const titleSection = p.showTitle !== false
        ? `<tr>
            <td style="padding:18px 20px 0 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-bottom:2px solid ${ac};padding-bottom:10px;">
                    ${titleHtml(p, '')}
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
        : ''
      return `<!--[riazify:product_description:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${p.bgColor ?? '#f3f4f6'};">
  <tr>
    <td class="pd-card-outer-${id}" style="padding:${p.paddingTop ?? 20}px ${p.paddingRight ?? 24}px ${p.paddingBottom ?? 20}px ${p.paddingLeft ?? 24}px;">
      <!-- Card (border-radius removed) -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1px solid #e5e7eb;">
        ${titleSection}
        <tr>
          <td class="pd-card-inner-pad-${id}" style="padding:${p.showTitle !== false ? '14px' : '18px'} 20px 18px 20px;">
            ${bodyHtml(p)}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:product_description:${id}]-->`
    },
  },

  // ── 6. Dark Luxury (Dark Background Enforced, Curve-Free) ─────────────────
  {
    id: 'dark-luxury',
    label: 'Dark Luxury',
    description: 'Dark background with light text — the exclusivity signal for premium listings',
    toHtml(p: any, id: string): string {
      const ac = accent(p)
      // Enforce dark background to match thumbnail
      const darkBg = p.darkBg || (p.bgColor && p.bgColor !== '#ffffff' && p.bgColor !== '#f8f7ff' ? p.bgColor : '#1e1535')

      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .pd-dl-pad-${id} { padding: 16px 16px !important; }
  .pd-dl-title-${id} { font-size: 14px !important; }
  .pd-dl-body-${id} { font-size: 13px !important; line-height: 1.6 !important; }
}
</style>`

      const titleSection = p.showTitle !== false
        ? titleHtml(p, `color:#ffffff;letter-spacing:${p.titleLetterSpacing ? p.titleLetterSpacing + 'px' : '0.03em'};text-transform:uppercase;`, `pd-dl-title-${id}`)
        : ''
      const descText = p.text && p.text !== '{{ITEM_DESCRIPTION}}'
        ? p.text
        : 'A high-quality product sample. Replace this text with the actual item description.'

      return `<!--[riazify:product_description:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${darkBg};">
  <!-- Accent top border -->
  <tr>
    <td style="height:3px;background-color:${ac};font-size:0;line-height:0;padding:0;">&nbsp;</td>
  </tr>
  <!-- Content -->
  <tr>
    <td class="pd-dl-pad-${id}" style="${pad(p)}">
      ${titleSection}
      <p class="pd-dl-body-${id}" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize ?? 14}px;font-weight:${p.fontWeight ?? '400'};line-height:${p.lineHeight ?? 1.8};color:rgba(255,255,255,0.75);">${descText}</p>
    </td>
  </tr>
</table>
<!--[/riazify:product_description:${id}]-->`
    },
  },

]

// ── Getter ────────────────────────────────────────────────────────────────────
export function getProductDescriptionVariant(variantId: string): BlockVariant {
  return productDescriptionVariants.find(v => v.id === variantId) ?? productDescriptionVariants[0]
}
