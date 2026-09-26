// components/ui/VisualEditor/variants/logo_bar.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Logo Bar — 10 layout variants (Basic → Premium)
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
    id: string
    label: string
    description: string
    toHtml: (props: any, id: string) => string
}

function pad(p: any): string {
    return `padding:${p.paddingTop ?? 16}px ${p.paddingRight ?? 24}px ${p.paddingBottom ?? 16}px ${p.paddingLeft ?? 24}px;`
}

function bg(p: any): string {
    return p.bgColor ?? '#f8f7ff'
}

function accent(p: any): string {
    return p.accentColor ?? '#7530fb'
}

function captionText(p: any): string {
    return p.caption ?? 'Trusted Brands &amp; Certifications'
}

function captionColor(p: any): string {
    return p.captionColor ?? '#9ca3af'
}

// Default 5 logo placeholders — sellers replace with <img> tags
const LOGO_EMOJIS = ['&#127968;', '&#9989;', '&#127881;', '&#127942;', '&#128081;']
const LOGO_NAMES = ['Brand One', 'Brand Two', 'Brand Three', 'Brand Four', 'Brand Five']

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 1 — flat-row
// Clean flat centred row — cleaned-up default. Thin 1px separators between logos.
// ─────────────────────────────────────────────────────────────────────────────
function flatRow(p: any, id: string): string {
    const cells = LOGO_EMOJIS.map((logo, i) => {
        const sep = i < LOGO_EMOJIS.length - 1
            ? `<td style="width:1px;background-color:#e5e7eb;"></td>` : ''
        return `<td style="padding:8px 20px;text-align:center;vertical-align:middle;">
            <div style="font-size:28px;line-height:1;">${logo}</div>
        </td>${sep}`
    }).join('')

    return `<!--[riazify:logo_bar:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;background-color:${bg(p)};">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;
        color:${captionColor(p)};letter-spacing:2px;text-transform:uppercase;">${captionText(p)}</p>
      <table align="center" cellpadding="0" cellspacing="0" border="0"
        style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;background-color:#ffffff;">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:logo_bar:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 2 — pill-labels
// Each logo in its own rounded pill/capsule with name text below
// ─────────────────────────────────────────────────────────────────────────────
function pillLabels(p: any, id: string): string {
    const ac = accent(p)
    const pills = LOGO_EMOJIS.map((logo, i) => `
      <td style="padding:0 6px;text-align:center;vertical-align:middle;">
        <div style="display:inline-block;background-color:#ffffff;border:1.5px solid #e5e7eb;
          border-radius:24px;padding:10px 18px;min-width:90px;">
          <div style="font-size:24px;line-height:1;margin-bottom:6px;">${logo}</div>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;
            color:${ac};text-transform:uppercase;letter-spacing:0.5px;">${LOGO_NAMES[i]}</div>
        </div>
      </td>`).join('')

    return `<!--[riazify:logo_bar:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;background-color:${bg(p)};">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;
        color:${captionColor(p)};letter-spacing:2px;text-transform:uppercase;">${captionText(p)}</p>
      <table align="center" cellpadding="0" cellspacing="0" border="0">
        <tr>${pills}</tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:logo_bar:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 3 — divider-strip
// Full-width coloured strip, logos with 1px vertical dividers, left-aligned label
// ─────────────────────────────────────────────────────────────────────────────
function dividerStrip(p: any, id: string): string {
    const ac = accent(p)
    const cells = LOGO_EMOJIS.map((logo, i) => {
        const sep = i < LOGO_EMOJIS.length - 1
            ? `<td style="width:1px;background-color:${ac};opacity:0.2;"></td>` : ''
        return `<td style="padding:12px 22px;text-align:center;vertical-align:middle;">
            <div style="font-size:26px;line-height:1;">${logo}</div>
        </td>${sep}`
    }).join('')

    return `<!--[riazify:logo_bar:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;">
  <tr>
    <td style="${pad(p)}background-color:${bg(p)};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-bottom:10px;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;
              color:${ac};letter-spacing:2px;text-transform:uppercase;">${captionText(p)}</span>
          </td>
        </tr>
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
              style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:4px;overflow:hidden;">
              <tr>${cells}</tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:logo_bar:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 4 — card-grid
// Each logo in its own bordered card with icon + name — structured grid
// ─────────────────────────────────────────────────────────────────────────────
function cardGrid(p: any, id: string): string {
    const ac = accent(p)
    const cards = LOGO_EMOJIS.map((logo, i) => `
      <td style="width:20%;padding:0 5px;text-align:center;vertical-align:top;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:14px 8px 6px;text-align:center;">
              <div style="font-size:26px;line-height:1;">${logo}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 8px 12px;text-align:center;border-top:1px solid #f3f4f6;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;
                color:${ac};text-transform:uppercase;letter-spacing:0.5px;padding-top:6px;">${LOGO_NAMES[i]}</div>
            </td>
          </tr>
        </table>
      </td>`).join('')

    return `<!--[riazify:logo_bar:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;background-color:${bg(p)};">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;
        color:${captionColor(p)};letter-spacing:2px;text-transform:uppercase;">${captionText(p)}</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>${cards}</tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:logo_bar:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 5 — icon-label-column
// Two-column: bold heading left, logo grid right — credibility section style
// ─────────────────────────────────────────────────────────────────────────────
function iconLabelColumn(p: any, id: string): string {
    const ac = accent(p)
    const row1 = LOGO_EMOJIS.slice(0, 3).map(logo => `
      <td style="padding:4px 10px;text-align:center;">
        <div style="font-size:24px;line-height:1;">${logo}</div>
      </td>`).join('')
    const row2 = LOGO_EMOJIS.slice(3, 5).map(logo => `
      <td style="padding:4px 10px;text-align:center;">
        <div style="font-size:24px;line-height:1;">${logo}</div>
      </td>`).join('')

    return `<!--[riazify:logo_bar:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;background-color:${bg(p)};">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="38%" style="vertical-align:middle;padding-right:20px;border-right:2px solid ${ac};">
            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;
              color:#1e1535;line-height:1.2;">Trusted By<br>Leading Brands</p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;
              color:${captionColor(p)};line-height:1.5;">Stocking only genuine, authorised products</p>
          </td>
          <td width="62%" style="vertical-align:middle;padding-left:20px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>${row1}</tr>
              <tr>${row2}</tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:logo_bar:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 6 — dark-band
// Dark background strip, logos in white cells with muted name text below
// ─────────────────────────────────────────────────────────────────────────────
function darkBand(p: any, id: string): string {
    const cells = LOGO_EMOJIS.map((logo, i) => `
      <td style="padding:16px 18px;text-align:center;vertical-align:middle;">
        <div style="font-size:26px;line-height:1;margin-bottom:6px;">${logo}</div>
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;
          color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.8px;">${LOGO_NAMES[i]}</div>
      </td>`).join('')

    return `<!--[riazify:logo_bar:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;">
  <tr>
    <td style="${pad(p)}background-color:#1e1535;text-align:center;">
      <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;
        color:rgba(255,255,255,0.35);letter-spacing:3px;text-transform:uppercase;">${captionText(p)}</p>
      <table align="center" cellpadding="0" cellspacing="0" border="0">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:logo_bar:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 7 — gradient-showcase
// Purple-to-indigo brand gradient, frosted translucent logo cards, lime title
// ─────────────────────────────────────────────────────────────────────────────
function gradientShowcase(p: any, id: string): string {
    const ac = accent(p)
    const cards = LOGO_EMOJIS.map(logo => `
      <td style="padding:0 6px;text-align:center;vertical-align:middle;">
        <div style="display:inline-block;background-color:rgba(255,255,255,0.12);
          border:1px solid rgba(255,255,255,0.22);border-radius:10px;
          padding:14px 16px;min-width:80px;">
          <div style="font-size:28px;line-height:1;">${logo}</div>
        </div>
      </td>`).join('')

    return `<!--[riazify:logo_bar:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;">
  <tr>
    <td style="${pad(p)}background:linear-gradient(135deg,${ac} 0%,#1e1535 100%);text-align:center;">
      <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;
        color:#b8fa33;letter-spacing:3px;text-transform:uppercase;">${captionText(p)}</p>
      <table align="center" cellpadding="0" cellspacing="0" border="0">
        <tr>${cards}</tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:logo_bar:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 8 — trust-ticker
// Narrow ticker bar: purple VERIFIED badge left, logos with dot separators right
// ─────────────────────────────────────────────────────────────────────────────
function trustTicker(p: any, id: string): string {
    const ac = accent(p)
    const logoRow = LOGO_EMOJIS.map((logo, i) => {
        const dot = i < LOGO_EMOJIS.length - 1
            ? `<td style="padding:0 4px;font-family:Arial,sans-serif;font-size:12px;color:#d1d5db;">•</td>` : ''
        return `<td style="padding:0 8px;text-align:center;vertical-align:middle;">
            <span style="font-size:22px;line-height:1;">${logo}</span>
        </td>${dot}`
    }).join('')

    return `<!--[riazify:logo_bar:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;background-color:${bg(p)};">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
        <tr>
          <td width="1%" style="padding:10px 16px;background-color:${ac};white-space:nowrap;vertical-align:middle;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;
              color:#ffffff;letter-spacing:1px;white-space:nowrap;">&#10003; VERIFIED</span>
          </td>
          <td style="padding:0 12px;vertical-align:middle;">
            <table cellpadding="0" cellspacing="0" border="0" align="center">
              <tr>${logoRow}</tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:logo_bar:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 9 — spotlight-cards
// Each card has gradient-border wrapper + white inner, coloured top accent bar
// ─────────────────────────────────────────────────────────────────────────────
function spotlightCards(p: any, id: string): string {
    const ac = accent(p)
    const cards = LOGO_EMOJIS.map((logo, i) => `
      <td style="width:20%;padding:0 5px;text-align:center;vertical-align:top;">
        <div style="background:linear-gradient(135deg,${ac} 0%,#1e1535 100%);
          border-radius:10px;padding:2px;display:inline-block;width:100%;box-sizing:border-box;">
          <div style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
            <div style="background:linear-gradient(90deg,${ac} 0%,#9b6bff 100%);height:3px;"></div>
            <div style="padding:14px 8px 10px;text-align:center;">
              <div style="font-size:26px;line-height:1;margin-bottom:6px;">${logo}</div>
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;
                color:${ac};text-transform:uppercase;letter-spacing:0.5px;">${LOGO_NAMES[i]}</div>
            </div>
          </div>
        </div>
      </td>`).join('')

    return `<!--[riazify:logo_bar:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;background-color:${bg(p)};">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;
        color:${ac};letter-spacing:2px;text-transform:uppercase;">${captionText(p)}</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>${cards}</tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:logo_bar:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 10 — glass-mosaic
// Full frosted glass panel on deep gradient. Circular logo containers,
// gradient ring borders, large centred heading. Ultra premium statement.
// ─────────────────────────────────────────────────────────────────────────────
function glassMosaic(p: any, id: string): string {
    const ac = accent(p)
    // 5 logos in one centred row
    const circles = LOGO_EMOJIS.map(logo => `
      <td style="padding:0 10px;text-align:center;vertical-align:middle;">
        <div style="background:linear-gradient(135deg,${ac} 0%,#9b6bff 100%);
          border-radius:50%;padding:2px;display:inline-block;width:66px;height:66px;box-sizing:border-box;">
          <div style="background-color:rgba(255,255,255,0.12);border-radius:50%;
            width:62px;height:62px;display:table;text-align:center;">
            <div style="display:table-cell;vertical-align:middle;font-size:26px;line-height:1;">${logo}</div>
          </div>
        </div>
      </td>`).join('')

    return `<!--[riazify:logo_bar:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;">
  <tr>
    <td style="background:linear-gradient(135deg,${ac} 0%,#1e1535 100%);padding:0;">
      <!-- Frosted glass inner panel -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="${pad(p)}background-color:rgba(255,255,255,0.06);text-align:center;">
            <!-- Heading -->
            <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;
              color:#ffffff;letter-spacing:4px;text-transform:uppercase;">${captionText(p)}</p>
            <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;
              color:rgba(255,255,255,0.45);line-height:1.5;">
              Proudly stocking authentic products from world-class brands
            </p>
            <!-- Circle logos -->
            <table align="center" cellpadding="0" cellspacing="0" border="0">
              <tr>${circles}</tr>
            </table>
            <!-- Footer trust line -->
            <p style="margin:18px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;
              color:rgba(255,255,255,0.35);letter-spacing:1px;">
              &#10003; Authorised Retailer &nbsp;&#8226;&nbsp; &#10003; 100% Genuine &nbsp;&#8226;&nbsp; &#10003; Manufacturer Warranty
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:logo_bar:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export const logoBarVariants: BlockVariant[] = [
    {
        id: 'flat-row',
        label: 'Flat Row',
        description: 'Clean centred row with thin dividers between logos',
        toHtml(props, id) { return flatRow(props, id) },
    },
    {
        id: 'pill-labels',
        label: 'Pill Labels',
        description: 'Each logo in a rounded pill capsule with brand name',
        toHtml(props, id) { return pillLabels(props, id) },
    },
    {
        id: 'divider-strip',
        label: 'Divider Strip',
        description: 'Coloured background strip with vertical logo dividers',
        toHtml(props, id) { return dividerStrip(props, id) },
    },
    {
        id: 'card-grid',
        label: 'Card Grid',
        description: 'Individual bordered cards per logo with icon and name',
        toHtml(props, id) { return cardGrid(props, id) },
    },
    {
        id: 'icon-label-column',
        label: 'Icon Label Column',
        description: 'Two-column: bold heading left, logo grid right',
        toHtml(props, id) { return iconLabelColumn(props, id) },
    },
    {
        id: 'dark-band',
        label: 'Dark Band',
        description: 'Dark background with logos and muted name text',
        toHtml(props, id) { return darkBand(props, id) },
    },
    {
        id: 'gradient-showcase',
        label: 'Gradient Showcase',
        description: 'Brand gradient with frosted translucent logo cards',
        toHtml(props, id) { return gradientShowcase(props, id) },
    },
    {
        id: 'trust-ticker',
        label: 'Trust Ticker',
        description: 'Compact ticker bar with VERIFIED badge and dot-separated logos',
        toHtml(props, id) { return trustTicker(props, id) },
    },
    {
        id: 'spotlight-cards',
        label: 'Spotlight Cards',
        description: 'Gradient-border cards with coloured top accent bar',
        toHtml(props, id) { return spotlightCards(props, id) },
    },
    {
        id: 'glass-mosaic',
        label: 'Glass Mosaic',
        description: 'Frosted glass panel with circular logo rings — ultra premium',
        toHtml(props, id) { return glassMosaic(props, id) },
    },
]

export function getLogoBarVariant(id: string): BlockVariant {
    return logoBarVariants.find(v => v.id === id) ?? logoBarVariants[0]
}
