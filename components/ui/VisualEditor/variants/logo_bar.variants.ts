// components/ui/VisualEditor/variants/logo_bar.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Logo Bar — 10 layout variants (Basic → Premium)
// Option C: Inline SVG defaults (PayPal, Visa, Mastercard, eBay, SSL)
//           + {{LOGO_N_URL}} token slots for seller-supplied images
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

// ─────────────────────────────────────────────────────────────────────────────
// INLINE SVG LOGOS — 5 trust/payment logos, no external URLs, email-safe
// Each returns a self-contained SVG string at ~64×32 viewBox
// ─────────────────────────────────────────────────────────────────────────────

// 1 — PayPal: blue "Pay" + dark-blue "Pal" wordmark style
const SVG_PAYPAL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 34" width="90" height="34" aria-label="PayPal">
  <text x="4" y="22" font-family="Arial,Helvetica,sans-serif" font-size="22" font-weight="900" fill="#009cde">Pay</text>
  <text x="36" y="22" font-family="Arial,Helvetica,sans-serif" font-size="22" font-weight="900" fill="#003087">Pal</text>
</svg>`

// 2 — Visa: classic blue rectangle with white VISA text
const SVG_VISA = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 34" width="90" height="34" aria-label="Visa">
  <rect x="4" y="4" width="82" height="26" rx="4" ry="4" fill="#1a1f71"/>
  <text x="45" y="23" font-family="Arial,Helvetica,sans-serif" font-size="17" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">VISA</text>
</svg>`

// 3 — Mastercard: two overlapping circles (red + yellow) with Mastercard text
const SVG_MASTERCARD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 34" width="90" height="34" aria-label="Mastercard">
  <circle cx="32" cy="17" r="13" fill="#eb001b" opacity="0.92"/>
  <circle cx="50" cy="17" r="13" fill="#f79e1b" opacity="0.92"/>
  <ellipse cx="41" cy="17" rx="5" ry="13" fill="#ff5f00" opacity="0.85"/>
</svg>`

// 4 — eBay Guaranteed: blue-outlined badge with star and "eBay" text
const SVG_EBAY = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 34" width="90" height="34" aria-label="eBay Guaranteed">
  <rect x="3" y="3" width="84" height="28" rx="5" ry="5" fill="none" stroke="#0064d2" stroke-width="2"/>
  <text x="11" y="15" font-family="Arial,Helvetica,sans-serif" font-size="9" font-weight="700" fill="#e53238">e</text>
  <text x="17" y="15" font-family="Arial,Helvetica,sans-serif" font-size="9" font-weight="700" fill="#0064d2">B</text>
  <text x="23" y="15" font-family="Arial,Helvetica,sans-serif" font-size="9" font-weight="700" fill="#f5af02">a</text>
  <text x="29" y="15" font-family="Arial,Helvetica,sans-serif" font-size="9" font-weight="700" fill="#86b817">y</text>
  <text x="8" y="27" font-family="Arial,Helvetica,sans-serif" font-size="8" font-weight="600" fill="#0064d2">Guaranteed</text>
  <text x="68" y="20" font-family="Arial,Helvetica,sans-serif" font-size="14" fill="#f5af02" text-anchor="middle">&#9733;</text>
</svg>`

// 5 — SSL Shield: padlock/shield with "SSL" text and tick — security badge
const SVG_SSL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 34" width="90" height="34" aria-label="SSL Secure">
  <path d="M10 6 L22 3 L34 6 L34 20 Q34 30 22 33 Q10 30 10 20 Z" fill="#16a34a"/>
  <rect x="17" y="13" width="10" height="9" rx="1" fill="white" opacity="0.9"/>
  <circle cx="22" cy="12" r="4" fill="none" stroke="white" stroke-width="2" opacity="0.9"/>
  <text x="42" y="16" font-family="Arial,Helvetica,sans-serif" font-size="11" font-weight="900" fill="#16a34a">SSL</text>
  <text x="42" y="28" font-family="Arial,Helvetica,sans-serif" font-size="9" fill="#6b7280">Secured</text>
</svg>`

// Ordered array for easy iteration
const INLINE_SVGS = [SVG_PAYPAL, SVG_VISA, SVG_MASTERCARD, SVG_EBAY, SVG_SSL]

// Fallback names used below logos in name-bearing variants
const LOGO_NAMES = ['PayPal', 'Visa', 'Mastercard', 'eBay', 'SSL Secure']

// Token keys matching blocks.ts defaultProps
const LOGO_URL_PROPS = ['logo1Url', 'logo2Url', 'logo3Url', 'logo4Url', 'logo5Url']
const LOGO_TOKENS = ['{{LOGO_1_URL}}', '{{LOGO_2_URL}}', '{{LOGO_3_URL}}', '{{LOGO_4_URL}}', '{{LOGO_5_URL}}']

// ─────────────────────────────────────────────────────────────────────────────
// renderLogo(p, index)
// If seller supplied a URL → <img> tag with {{LOGO_N_URL}} token
// Otherwise → inline SVG default
// size: width in px for the img tag when using a custom URL
// ─────────────────────────────────────────────────────────────────────────────
function renderLogo(p: any, index: number, imgWidth = 80): string {
    const urlProp = LOGO_URL_PROPS[index]
    const token = LOGO_TOKENS[index]
    const altName = LOGO_NAMES[index]

    if (p[urlProp] && String(p[urlProp]).trim() !== '') {
        // Seller-supplied image: output <img> with their token
        return `<img src="${token}" alt="${altName}" width="${imgWidth}" height="40" style="display:block;max-width:${imgWidth}px;height:40px;object-fit:contain;border:0;">`
    }
    // Default: inline SVG (email-safe, no external request)
    return INLINE_SVGS[index]
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 1 — flat-row
// Clean flat centred row — thin 1px separators between logos
// ─────────────────────────────────────────────────────────────────────────────
function flatRow(p: any, id: string): string {
    const cells = LOGO_NAMES.map((_n, i) => {
        const sep = i < LOGO_NAMES.length - 1
            ? `<td style="width:1px;background-color:#e5e7eb;"></td>` : ''
        return `<td style="padding:12px 20px;text-align:center;vertical-align:middle;">
            ${renderLogo(p, i, 80)}
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
// Each logo in a rounded pill capsule with name text below
// ─────────────────────────────────────────────────────────────────────────────
function pillLabels(p: any, id: string): string {
    const ac = accent(p)
    const pills = LOGO_NAMES.map((name, i) => `
      <td style="padding:0 6px;text-align:center;vertical-align:middle;">
        <div style="display:inline-block;background-color:#ffffff;border:1.5px solid #e5e7eb;
          border-radius:24px;padding:10px 18px;min-width:90px;">
          ${renderLogo(p, i, 72)}
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;
            color:${ac};text-transform:uppercase;letter-spacing:0.5px;margin-top:6px;">${name}</div>
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
    const cells = LOGO_NAMES.map((_n, i) => {
        const sep = i < LOGO_NAMES.length - 1
            ? `<td style="width:1px;background-color:#e5e7eb;opacity:0.4;"></td>` : ''
        return `<td style="padding:12px 22px;text-align:center;vertical-align:middle;">
            ${renderLogo(p, i, 78)}
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
// VARIANT 4 — lb-card-grid  (renamed from card-grid to avoid PropertiesPanel collision)
// Each logo in its own bordered card with logo + name — structured grid
// ─────────────────────────────────────────────────────────────────────────────
function lbCardGrid(p: any, id: string): string {
    const ac = accent(p)
    const cards = LOGO_NAMES.map((name, i) => `
      <td style="width:20%;padding:0 5px;text-align:center;vertical-align:top;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:14px 8px 8px;text-align:center;">
              ${renderLogo(p, i, 72)}
            </td>
          </tr>
          <tr>
            <td style="padding:0 8px 12px;text-align:center;border-top:1px solid #f3f4f6;">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;
                color:${ac};text-transform:uppercase;letter-spacing:0.5px;padding-top:6px;">${name}</div>
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
    const row1 = [0, 1, 2].map(i => `
      <td style="padding:4px 10px;text-align:center;">
        ${renderLogo(p, i, 64)}
      </td>`).join('')
    const row2 = [3, 4].map(i => `
      <td style="padding:4px 10px;text-align:center;">
        ${renderLogo(p, i, 64)}
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
// Dark background strip, logos with muted name text below
// ─────────────────────────────────────────────────────────────────────────────
function darkBand(p: any, id: string): string {
    const cells = LOGO_NAMES.map((name, i) => `
      <td style="padding:16px 18px;text-align:center;vertical-align:middle;">
        ${renderLogo(p, i, 76)}
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;
          color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:0.8px;margin-top:6px;">${name}</div>
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
    const cards = LOGO_NAMES.map((_n, i) => `
      <td style="padding:0 6px;text-align:center;vertical-align:middle;">
        <div style="display:inline-block;background-color:rgba(255,255,255,0.12);
          border:1px solid rgba(255,255,255,0.22);border-radius:10px;
          padding:14px 16px;min-width:80px;">
          ${renderLogo(p, i, 72)}
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
    const logoRow = LOGO_NAMES.map((_n, i) => {
        const dot = i < LOGO_NAMES.length - 1
            ? `<td style="padding:0 4px;font-family:Arial,sans-serif;font-size:12px;color:#d1d5db;">•</td>` : ''
        return `<td style="padding:0 8px;text-align:center;vertical-align:middle;">
            ${renderLogo(p, i, 68)}
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
    const cards = LOGO_NAMES.map((name, i) => `
      <td style="width:20%;padding:0 5px;text-align:center;vertical-align:top;">
        <div style="background:linear-gradient(135deg,${ac} 0%,#1e1535 100%);
          border-radius:10px;padding:2px;display:inline-block;width:100%;box-sizing:border-box;">
          <div style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
            <div style="background:linear-gradient(90deg,${ac} 0%,#9b6bff 100%);height:3px;"></div>
            <div style="padding:12px 8px 10px;text-align:center;">
              ${renderLogo(p, i, 70)}
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;
                color:${ac};text-transform:uppercase;letter-spacing:0.5px;margin-top:6px;">${name}</div>
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
    const circles = LOGO_NAMES.map((_n, i) => `
      <td style="padding:0 10px;text-align:center;vertical-align:middle;">
        <div style="background:linear-gradient(135deg,${ac} 0%,#9b6bff 100%);
          border-radius:50%;padding:2px;display:inline-block;width:66px;height:66px;box-sizing:border-box;">
          <div style="background-color:rgba(255,255,255,0.12);border-radius:50%;
            width:62px;height:62px;display:table;text-align:center;">
            <div style="display:table-cell;vertical-align:middle;">
              ${renderLogo(p, i, 48)}
            </div>
          </div>
        </div>
      </td>`).join('')

    return `<!--[riazify:logo_bar:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;">
  <tr>
    <td style="background:linear-gradient(135deg,${ac} 0%,#1e1535 100%);padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="${pad(p)}background-color:rgba(255,255,255,0.06);text-align:center;">
            <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;
              color:#ffffff;letter-spacing:4px;text-transform:uppercase;">${captionText(p)}</p>
            <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;
              color:rgba(255,255,255,0.45);line-height:1.5;">
              Proudly stocking authentic products from world-class brands
            </p>
            <table align="center" cellpadding="0" cellspacing="0" border="0">
              <tr>${circles}</tr>
            </table>
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
        id: 'lb-card-grid',
        label: 'Card Grid',
        description: 'Individual bordered cards per logo with icon and name',
        toHtml(props, id) { return lbCardGrid(props, id) },
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
