// components/ui/VisualEditor/variants/product_description.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Product Description — 6 layout variants
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
function titleHtml(p: any, style: string): string {
  if (p.showTitle === false) return ''
  const ls = p.titleLetterSpacing ? `letter-spacing:${p.titleLetterSpacing}px;` : ''
  const ta = `text-align:${p.titleAlign ?? 'left'};`
  const fw = `font-weight:${p.titleFontWeight ?? '700'};`
  return `<p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:${p.titleFontSize ?? 16}px;${fw}color:${p.titleColor ?? '#1e1535'};${ta}${ls}${style}">${p.titleText ?? 'Product Description'}</p>`
}

// Body text — shared across all variants
function bodyHtml(p: any, extraStyle = ''): string {
  const ls = p.letterSpacing ? `letter-spacing:${p.letterSpacing}px;` : ''
  const ta = `text-align:${p.textAlign ?? 'left'};`
  return `<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize ?? 14}px;font-weight:${p.fontWeight ?? '400'};line-height:${p.lineHeight ?? 1.8};color:${p.color ?? '#6b7280'};${ta}${ls}${extraStyle}">${p.text ?? '{{ITEM_DESCRIPTION}}'}</p>`
}

// Accent colour — pulled from seller's brand (falls back to Riazify purple)
function accent(p: any): string {
  return p.accentColor ?? p.primaryColor ?? '#7530fb'
}

// ─────────────────────────────────────────────────────────────────────────────
export const productDescriptionVariants: BlockVariant[] = [

  // ── 1. Plain (Clean Editorial) ────────────────────────────────────────────
  // WHO: Premium / high-ticket sellers — cameras, audio, watches
  // WHY: White space = luxury signal. Thin rule under title reads like a
  //      magazine article, not a market stall. Buyer trust goes up.
  {
    id: 'plain',
    label: 'Plain',
    description: 'Clean editorial layout — white space and typography carry the authority',
    toHtml(p: any, id: string): string {
      const titleSection = p.showTitle !== false
        ? titleHtml(p, 'padding-bottom:10px;border-bottom:1px solid #e5e7eb;')
        : ''
      return `<!--[riazify:product_description:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  <tr>
    <td style="${pad(p)}">
      ${titleSection}
      ${bodyHtml(p)}
    </td>
  </tr>
</table>
<!--[/riazify:product_description:${id}]-->`
    },
  },

  // ── 2. Accent Bar (Brand Authority) ───────────────────────────────────────
  // WHO: Sellers who've set brand colours in Global Styles
  // WHY: The 4px vertical stripe anchors the block to their brand instantly.
  //      Buyers subconsciously associate the color with every other brand
  //      element on the listing — creates visual coherence = trust.
  {
    id: 'accent-bar',
    label: 'Accent Bar',
    description: 'Vertical brand-colour stripe — instantly ties description to your store identity',
    toHtml(p: any, id: string): string {
      const ac = accent(p)
      const titleSection = p.showTitle !== false
        ? titleHtml(p, `margin-bottom:12px;color:${ac};`)
        : ''
      return `<!--[riazify:product_description:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  <tr>
    <!-- Accent stripe -->
    <td width="4" style="background-color:${ac};padding:0;font-size:0;line-height:0;">&nbsp;</td>
    <!-- Content -->
    <td style="padding-top:${p.paddingTop ?? 20}px;padding-bottom:${p.paddingBottom ?? 20}px;padding-left:20px;padding-right:${p.paddingRight ?? 24}px;">
      ${titleSection}
      ${bodyHtml(p)}
    </td>
  </tr>
</table>
<!--[/riazify:product_description:${id}]-->`
    },
  },

  // ── 3. Feature Box (Scannable) ────────────────────────────────────────────
  // WHO: Any seller with mobile buyers (majority of eBay traffic now)
  // WHY: 79% of mobile users scan before reading. Three key-point pills
  //      at the top let buyers extract value in 2 seconds. If they like
  //      what they see, they read the full text below. Reduces bounce.
  //      Pills use feature1/feature2/feature3 props that the seller
  //      fills in the Properties panel — zero extra work.
  {
    id: 'feature-box',
    label: 'Feature Box',
    description: '3 scannable key-point pills above the description — built for mobile buyers',
    toHtml(p: any, id: string): string {
      const ac = accent(p)
      const acLight = p.accentColorLight ?? `${ac}14`   // ~8% opacity tint
      const f1 = p.feature1 ?? '✓ Premium Quality'
      const f2 = p.feature2 ?? '✓ Fast Dispatch'
      const f3 = p.feature3 ?? '✓ 30-Day Returns'
      const pill = (text: string) =>
        `<td style="padding:0 4px;">
          <table cellpadding="0" cellspacing="0" border="0" style="background-color:${acLight};border:1px solid ${ac}22;border-radius:20px;">
            <tr><td style="padding:7px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:${ac};white-space:nowrap;">${text}</td></tr>
          </table>
        </td>`
      const titleSection = p.showTitle !== false
        ? titleHtml(p, '')
        : ''
      return `<!--[riazify:product_description:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  <!-- Feature pills row -->
  <tr>
    <td style="padding:${p.paddingTop ?? 20}px ${p.paddingRight ?? 24}px 16px ${p.paddingLeft ?? 24}px;">
      <table cellpadding="0" cellspacing="0" border="0">
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
    <td style="padding:0 ${p.paddingRight ?? 24}px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:1px;background-color:#e5e7eb;font-size:0;line-height:0;"></td></tr></table></td>
  </tr>
  <!-- Title + Body -->
  <tr>
    <td style="padding:16px ${p.paddingRight ?? 24}px ${p.paddingBottom ?? 20}px ${p.paddingLeft ?? 24}px;">
      ${titleSection}
      ${bodyHtml(p)}
    </td>
  </tr>
</table>
<!--[/riazify:product_description:${id}]-->`
    },
  },

  // ── 4. Split Story (Two-Column Narrative) ─────────────────────────────────
  // WHO: Clothing, handmade, vintage, collectibles — story-driven sellers
  // WHY: These sellers need to tell the emotional "why buy" story AND give
  //      the practical facts. Mixing them in one paragraph kills both.
  //      Left column = the story/feeling. Right column = the facts/detail.
  //      Buyers choose which they want — neither is buried.
  {
    id: 'split-story',
    label: 'Split Story',
    description: 'Story left, detail right — for handmade, vintage and collectible sellers',
    toHtml(p: any, id: string): string {
      const ac = accent(p)
      // Split the text roughly in half at a sentence boundary
      const fullText = p.text ?? '{{ITEM_DESCRIPTION}}'
      const midPoint = Math.floor(fullText.length / 2)
      const splitAt = fullText.indexOf('. ', midPoint)
      const leftText = splitAt > 0 ? fullText.slice(0, splitAt + 1) : fullText
      const rightText = splitAt > 0 ? fullText.slice(splitAt + 1).trim() : ''
      const titleSection = p.showTitle !== false
        ? `<td colspan="3" style="padding:${p.paddingTop ?? 20}px ${p.paddingRight ?? 24}px 14px ${p.paddingLeft ?? 24}px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.titleFontSize ?? 16}px;font-weight:700;color:${p.titleColor ?? '#1e1535'};padding-bottom:10px;border-bottom:2px solid ${ac};">${p.titleText ?? 'Product Description'}</p>
                  </td>`
        : ''
      return `<!--[riazify:product_description:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  ${p.showTitle !== false ? `<tr>${titleSection}</tr>` : ''}
  <tr>
    <!-- Left: story / emotional copy -->
    <td width="48%" style="padding:${p.showTitle !== false ? '0' : (p.paddingTop ?? 20) + 'px'} 0 ${p.paddingBottom ?? 20}px ${p.paddingLeft ?? 24}px;vertical-align:top;">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize ?? 14}px;font-weight:${p.fontWeight ?? '400'};line-height:${p.lineHeight ?? 1.8};color:${p.color ?? '#6b7280'};font-style:${p.splitItalic !== false ? 'italic' : 'normal'};text-align:${p.textAlign ?? 'left'};">${leftText}</p>
    </td>
    <!-- Vertical rule -->
    <td width="4" style="padding:0 12px;vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0" style="width:1px;height:100%;"><tr><td style="background-color:#e5e7eb;width:1px;">&nbsp;</td></tr></table>
    </td>
    <!-- Right: factual detail -->
    <td style="padding:${p.showTitle !== false ? '0' : (p.paddingTop ?? 20) + 'px'} ${p.paddingRight ?? 24}px ${p.paddingBottom ?? 20}px 0;vertical-align:top;">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize ?? 14}px;font-weight:${p.fontWeight ?? '400'};line-height:${p.lineHeight ?? 1.8};color:${p.color ?? '#6b7280'};">${rightText || fullText}</p>
    </td>
  </tr>
</table>
<!--[/riazify:product_description:${id}]-->`
    },
  },

  // ── 5. Card Elevated (Trust & Perceived Value) ────────────────────────────
  // WHO: Mid-market sellers — tools, electronics, sports, home goods
  // WHY: A card with shadow + rounded corners signals "serious seller."
  //      The lifted card creates a visual container that says "this item
  //      is worth looking at closely." Studies show card layouts increase
  //      dwell time. The grey outer background adds depth without colour.
  {
    id: 'card-elevated',
    label: 'Card',
    description: 'Elevated card with shadow — signals a professional, trustworthy seller',
    toHtml(p: any, id: string): string {
      const ac = accent(p)
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
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#f3f4f6'};">
  <tr>
    <td style="padding:${p.paddingTop ?? 20}px ${p.paddingRight ?? 24}px ${p.paddingBottom ?? 20}px ${p.paddingLeft ?? 24}px;">
      <!-- Card -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:12px;border:1px solid #e5e7eb;">
        ${titleSection}
        <tr>
          <td style="padding:${p.showTitle !== false ? '14px' : '18px'} 20px 18px 20px;">
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

  // ── 6. Dark Luxury (Exclusivity Signal) ───────────────────────────────────
  // WHO: Luxury / high-end sellers — jewellery, watches, premium tech, art
  // WHY: Light backgrounds say "warehouse." Dark backgrounds say "boutique."
  //      When a buyer sees this, the psychological frame shifts from
  //      "marketplace item" to "exclusive product." The accent top border
  //      in brand color adds one touch of signature identity.
  //      All text colours are carefully chosen for readability on dark bg
  //      while still passing eBay's accessibility requirements.
  {
    id: 'dark-luxury',
    label: 'Dark Luxury',
    description: 'Dark background with light text — the exclusivity signal for premium listings',
    toHtml(p: any, id: string): string {
      const ac = accent(p)
      const darkBg = p.darkBg ?? '#1e1535'
      const titleSection = p.showTitle !== false
        ? titleHtml(p, `color:#ffffff;letter-spacing:${p.titleLetterSpacing ? p.titleLetterSpacing + 'px' : '0.03em'};text-transform:uppercase;`)
        : ''
      return `<!--[riazify:product_description:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${darkBg};border-radius:${p.borderRadius ?? 0}px;overflow:hidden;">
  <!-- Accent top border -->
  <tr>
    <td style="height:3px;background-color:${ac};font-size:0;line-height:0;padding:0;">&nbsp;</td>
  </tr>
  <!-- Content -->
  <tr>
    <td style="${pad(p)}">
      ${titleSection}
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize ?? 14}px;font-weight:${p.fontWeight ?? '400'};line-height:${p.lineHeight ?? 1.8};color:rgba(255,255,255,0.75);">${p.text ?? '{{ITEM_DESCRIPTION}}'}</p>
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
