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

// 1 — PayPal: blue wordmark, no overlap, wider canvas
const SVG_PAYPAL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 34" width="96" height="34" aria-label="PayPal">
  <text x="4" y="24" font-family="Arial,Helvetica,sans-serif" font-size="20" font-weight="900" fill="#009cde">Pay</text>
  <text x="46" y="24" font-family="Arial,Helvetica,sans-serif" font-size="20" font-weight="900" fill="#003087">Pal</text>
</svg>`

// 2 — Visa: classic blue rectangle with white VISA text
const SVG_VISA = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 34" width="90" height="34" aria-label="Visa">
  <rect x="4" y="4" width="82" height="26" rx="4" ry="4" fill="#1a1f71"/>
  <text x="45" y="23" font-family="Arial,Helvetica,sans-serif" font-size="17" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">VISA</text>
</svg>`

// 3 — Mastercard: circles pulled closer for deeper overlap
const SVG_MASTERCARD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 42" width="90" height="42" aria-label="Mastercard">
  <circle cx="37" cy="14" r="12" fill="#eb001b"/>
  <circle cx="53" cy="14" r="12" fill="#f79e1b" opacity="0.9"/>
  <text x="45" y="35" font-family="Arial,Helvetica,sans-serif" font-size="9" font-weight="700" fill="#231f20" text-anchor="middle" letter-spacing="0.3">mastercard</text>
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
// Wrapped in interactive data-slot so clicking any logo selects the slot
// and opens the Image tab in the editor for instant logo replacement
// ─────────────────────────────────────────────────────────────────────────────
function renderLogo(p: any, index: number, imgWidth = 80): string {
  const urlProp = LOGO_URL_PROPS[index]
  const token = LOGO_TOKENS[index]
  const altName = LOGO_NAMES[index]

  // Check all possible prop names that VisualEditor might set
  const customUrl =
    p[urlProp] ||
    p[`logo_${index + 1}`] ||
    p[`logo${index + 1}`] ||
    p[`logo_${index + 1}Url`] ||
    p[`logo${index + 1}Url`] ||
    p[`image_${index + 1}`] ||
    p[`image${index + 1}`] ||
    p[`img_${index + 1}`] ||
    p[`img${index + 1}`]

  let content = INLINE_SVGS[index]

  if (customUrl && String(customUrl).trim() !== '') {
    const raw = String(customUrl).trim()
    const imgSrc = (raw.startsWith('http') || raw.startsWith('data:') || raw.startsWith('/') || raw.startsWith('blob:'))
      ? raw
      : token

    content = `<img src="${imgSrc}" alt="${altName}" width="${imgWidth}" height="40" style="display:block;max-width:${imgWidth}px;height:40px;object-fit:contain;border:0;pointer-events:none;">`
  }

  // Interactive slot wrapper with data-attributes
  return `<div class="logo-slot-wrap" data-slot="logo_${index + 1}" data-slot-name="logo_${index + 1}" data-slot-type="image" data-type="image" data-slot-index="${index}" data-prop="${urlProp}" data-field="${urlProp}" data-key="${urlProp}" data-tab="image" data-open-tab="image" data-label="${altName} Logo" style="display:inline-block;cursor:pointer;max-width:100%;vertical-align:middle;position:relative;" title="Click to replace ${altName} logo">${content}</div>`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 1 — flat-row
// Clean flat centred row — thin 1px separators between logos
// ─────────────────────────────────────────────────────────────────────────────
function flatRow(p: any, id: string): string {
  const cells = LOGO_NAMES.map((_n, i) => {
    const sep = i < LOGO_NAMES.length - 1
      ? `<td style="width:1px;background-color:#e5e7eb;"></td>` : ''
    return `<td class="flr-cell-${id}" width="20%" style="width:20%;padding:12px 14px;text-align:center;vertical-align:middle;box-sizing:border-box;">
            <div style="display:inline-block;max-width:100%;vertical-align:middle;">
              ${renderLogo(p, i, 80)}
            </div>
        </td>${sep}`
  }).join('')

  return `<!--[riazify:logo_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .flr-cell-${id} {
      padding: 8px 2px !important;
    }
    .flr-cell-${id} svg {
      width: 100% !important;
      max-width: 52px !important;
      height: auto !important;
      max-height: 22px !important;
    }
    .flr-cell-${id} img {
      max-width: 48px !important;
      height: 22px !important;
      object-fit: contain !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;background-color:${bg(p)};">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;
        color:${captionColor(p)};letter-spacing:2px;text-transform:uppercase;">${captionText(p)}</p>
      <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0"
        style="width:100% !important;table-layout:fixed;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;background-color:#ffffff;">
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
      <td class="pl-cell-${id}" width="20%" style="width:20%;padding:0 4px;text-align:center;vertical-align:middle;box-sizing:border-box;">
        <div class="pl-pill-${id}" style="display:block;background-color:#ffffff;border:1.5px solid #e5e7eb;border-radius:24px;padding:10px 4px;width:100%;box-sizing:border-box;">
          <div style="display:inline-block;max-width:100%;vertical-align:middle;">
            ${renderLogo(p, i, 72)}
          </div>
          <div class="pl-label-${id}" style="font-family:Arial,Helvetica,sans-serif;font-size:9.5px;font-weight:700;color:${ac};text-transform:uppercase;letter-spacing:0.3px;margin-top:6px;white-space:nowrap;">
            ${name}
          </div>
        </div>
      </td>`).join('')

  return `<!--[riazify:logo_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .pl-cell-${id} {
      padding: 0 1px !important;
    }
    .pl-pill-${id} {
      padding: 6px 1px 5px !important;
      border-radius: 12px !important;
    }
    .pl-cell-${id} svg {
      width: 100% !important;
      max-width: 48px !important;
      height: auto !important;
      max-height: 20px !important;
    }
    .pl-cell-${id} img {
      max-width: 44px !important;
      height: 20px !important;
      object-fit: contain !important;
    }
    .pl-label-${id} {
      font-size: 7px !important;
      letter-spacing: -0.2px !important;
      margin-top: 3px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;background-color:${bg(p)};">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;
        color:${captionColor(p)};letter-spacing:2px;text-transform:uppercase;">${captionText(p)}</p>
      <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0" style="width:100% !important;table-layout:fixed;">
        <tr>${pills}</tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:logo_bar:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 3 — divider-strip
// Premium partitioned strip with top-anchored badge tab & vertical trust dividers
// ─────────────────────────────────────────────────────────────────────────────
function dividerStrip(p: any, id: string): string {
  const ac = accent(p)

  // Subtitle verification tags inside each divider compartment
  const SUB_TAGS = [
    'BUYER PROTECTION',
    '3-D SECURE',
    'ID CHECK',
    'MONEY BACK',
    '256-BIT ENCRYPTED'
  ]

  const cells = LOGO_NAMES.map((_n, i) => {
    const sep = i < LOGO_NAMES.length - 1
      ? `<td class="dst-sep-${id}" style="width:1px;background:linear-gradient(to bottom, transparent 8%, #cbd5e1 25%, #cbd5e1 75%, transparent 92%);"></td>` : ''

    return `<td class="dst-cell-${id}" width="20%" style="width:20%;padding:14px 8px 12px;text-align:center;vertical-align:middle;box-sizing:border-box;">
              <div style="display:inline-block;max-width:100%;vertical-align:middle;">
                ${renderLogo(p, i, 76)}
              </div>
              <div class="dst-sub-${id}" style="font-family:Arial,Helvetica,sans-serif;font-size:8px;font-weight:800;color:#64748b;letter-spacing:0.5px;text-transform:uppercase;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                <span style="color:#16a34a;margin-right:2px;font-size:8.5px;">✓</span>${SUB_TAGS[i]}
              </div>
          </td>${sep}`
  }).join('')

  return `<!--[riazify:logo_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .dst-tab-${id} {
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
      text-align: center !important;
      border-radius: 6px 6px 0 0 !important;
      padding: 6px 8px !important;
      font-size: 8.5px !important;
      letter-spacing: 1px !important;
    }
    .dst-table-${id} {
      border-radius: 0 0 6px 6px !important;
      border-top: none !important;
    }
    .dst-cell-${id} {
      padding: 7px 1px 6px !important;
    }
    .dst-cell-${id} svg {
      width: 100% !important;
      max-width: 44px !important;
      height: auto !important;
      max-height: 18px !important;
    }
    .dst-cell-${id} img {
      max-width: 40px !important;
      height: 18px !important;
      object-fit: contain !important;
    }
    .dst-sub-${id} {
      font-size: 5.5px !important;
      letter-spacing: -0.3px !important;
      margin-top: 2px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;background-color:${bg(p)};">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;">
        <!-- Top Tab Badge: Left tab on Desktop, 100% Full Width Bar on Mobile -->
        <tr>
          <td style="padding:0;">
            <div class="dst-tab-${id}" style="display:inline-block;background-color:${ac};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:9.5px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:5px 14px 4px;border-radius:6px 6px 0 0;box-shadow:0 -1px 3px rgba(0,0,0,0.06);">
              <span style="margin-right:4px;">🔒</span>${captionText(p)}
            </div>
          </td>
        </tr>
        <!-- Main Divider Strip Container -->
        <tr>
          <td>
            <table class="dst-table-${id}" width="100%" cellpadding="0" cellspacing="0" border="0"
              style="width:100% !important;table-layout:fixed;background-color:#ffffff;border:1.5px solid #e2e8f0;border-top:3px solid ${ac};border-radius:0 8px 8px 8px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.04);">
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
// Structured credential card grid with top security badges & status graphics
// ─────────────────────────────────────────────────────────────────────────────
function lbCardGrid(p: any, id: string): string {
  const ac = accent(p)

  // Distinct micro-graphics, top accent colors and verification tags for each card
  const CARD_GRAPHICS = [
    {
      topAccent: '#0079C1',
      badge: 'PROTECTION',
      icon: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0079C1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:2px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    },
    {
      topAccent: '#1A1F71',
      badge: '3-D SECURE',
      icon: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1A1F71" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:2px;"><polyline points="20 6 9 17 4 12"/></svg>`,
    },
    {
      topAccent: '#EB001B',
      badge: 'ID CHECK',
      icon: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#EB001B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:2px;"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
    },
    {
      topAccent: '#0064D2',
      badge: 'GUARANTEE',
      icon: `<svg width="10" height="10" viewBox="0 0 24 24" fill="#f5af02" stroke="#f5af02" stroke-width="1" style="vertical-align:middle;margin-right:2px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    },
    {
      topAccent: '#16a34a',
      badge: '256-BIT SSL',
      icon: `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:2px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    },
  ]

  const cards = LOGO_NAMES.map((name, i) => {
    const graphic = CARD_GRAPHICS[i] || CARD_GRAPHICS[0]
    return `
      <td class="lbc-cell-${id}" width="20%" style="width:20%;padding:0 4px;text-align:center;vertical-align:top;box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="width:100%;background-color:#ffffff;border:1.5px solid #e5e7eb;border-top:3px solid ${graphic.topAccent};border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
          <!-- Top Graphic Security Badge -->
          <tr>
            <td class="lbc-badge-td-${id}" style="padding:5px 2px;text-align:center;background-color:#f8fafc;border-bottom:1px solid #f1f5f9;">
              <span class="lbc-badge-icon-${id}" style="display:inline-block;vertical-align:middle;">${graphic.icon}</span>
              <span class="lbc-badge-txt-${id}" style="font-family:Arial,Helvetica,sans-serif;font-size:8px;font-weight:800;color:#64748b;letter-spacing:0.4px;vertical-align:middle;white-space:nowrap;">${graphic.badge}</span>
            </td>
          </tr>
          <!-- Center Logo -->
          <tr>
            <td class="lbc-logo-td-${id}" style="padding:12px 4px 8px;text-align:center;background-color:#ffffff;">
              <div style="display:inline-block;max-width:100%;vertical-align:middle;">
                ${renderLogo(p, i, 72)}
              </div>
            </td>
          </tr>
          <!-- Bottom Brand Name + Verified Status Pill -->
          <tr>
            <td class="lbc-label-td-${id}" style="padding:4px 2px 8px;text-align:center;background-color:#fafafa;border-top:1px dashed #e5e7eb;">
              <div class="lbc-label-${id}" style="font-family:Arial,Helvetica,sans-serif;font-size:9.5px;font-weight:700;color:${ac};text-transform:uppercase;letter-spacing:0.3px;white-space:nowrap;overflow:visible;">${name}</div>
              <div class="lbc-status-${id}" style="margin-top:2px;display:inline-block;vertical-align:middle;">
                <span style="display:inline-block;width:4px;height:4px;border-radius:50%;background-color:#16a34a;vertical-align:middle;margin-right:2px;"></span>
                <span style="font-family:Arial,Helvetica,sans-serif;font-size:7.5px;font-weight:700;color:#16a34a;letter-spacing:0.2px;vertical-align:middle;">VERIFIED</span>
              </div>
            </td>
          </tr>
        </table>
      </td>`
  }).join('')

  return `<!--[riazify:logo_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .lbc-cell-${id} {
      padding: 0 1.5px !important;
    }
    .lbc-badge-td-${id} {
      padding: 3px 1px !important;
    }
    .lbc-badge-txt-${id} {
      font-size: 6px !important;
      letter-spacing: -0.2px !important;
    }
    .lbc-badge-icon-${id} svg {
      width: 8px !important;
      height: 8px !important;
      margin-right: 1px !important;
    }
    .lbc-logo-td-${id} {
      padding: 6px 1px 3px !important;
    }
    .lbc-cell-${id} svg {
      width: 100% !important;
      max-width: 44px !important;
      height: auto !important;
      max-height: 18px !important;
    }
    .lbc-cell-${id} img {
      max-width: 40px !important;
      height: 18px !important;
      object-fit: contain !important;
    }
    .lbc-label-td-${id} {
      padding: 3px 1px 5px !important;
    }
    .lbc-label-${id} {
      font-size: 7px !important;
      letter-spacing: -0.2px !important;
      overflow: visible !important;
      text-overflow: clip !important;
    }
    .lbc-status-${id} {
      display: none !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;background-color:${bg(p)};">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;
        color:${captionColor(p)};letter-spacing:2px;text-transform:uppercase;">${captionText(p)}</p>
      <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0" style="width:100% !important;table-layout:fixed;">
        <tr>${cards}</tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:logo_bar:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 5 — icon-label-column
// Two-column: bold heading left, logo grid right — stacks responsively on mobile
// ─────────────────────────────────────────────────────────────────────────────
function iconLabelColumn(p: any, id: string): string {
  const ac = accent(p)
  const row1 = [0, 1, 2].map(i => `
      <td class="ilc-logo-td-${id}" style="padding:6px 12px;text-align:center;vertical-align:middle;">
        ${renderLogo(p, i, 76)}
      </td>`).join('')
  const row2 = [3, 4].map(i => `
      <td class="ilc-logo-td-${id}" style="padding:6px 14px;text-align:center;vertical-align:middle;">
        ${renderLogo(p, i, 76)}
      </td>`).join('')

  return `<!--[riazify:logo_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .ilc-container-${id} {
      width: 100% !important;
      min-width: 100% !important;
    }
    .ilc-left-${id} {
      display: block !important;
      width: 100% !important;
      padding: 0 0 14px 0 !important;
      border-right: none !important;
      border-bottom: 2px solid ${ac} !important;
      text-align: center !important;
      box-sizing: border-box !important;
    }
    .ilc-right-${id} {
      display: block !important;
      width: 100% !important;
      padding: 16px 0 4px 0 !important;
      text-align: center !important;
      box-sizing: border-box !important;
    }
    .ilc-title-${id} {
      font-size: 16px !important;
      line-height: 1.3 !important;
      margin-bottom: 4px !important;
    }
    .ilc-title-br-${id} {
      display: none !important;
    }
    .ilc-sub-${id} {
      font-size: 11px !important;
      line-height: 1.4 !important;
    }
    .ilc-logos-table-${id} {
      width: 100% !important;
      max-width: 340px !important;
      margin: 0 auto !important;
    }
    .ilc-logo-td-${id} {
      padding: 8px 10px !important;
    }
    .ilc-logo-td-${id} svg {
      width: 100% !important;
      max-width: 86px !important;
      height: auto !important;
      max-height: 34px !important;
    }
    .ilc-logo-td-${id} img {
      max-width: 82px !important;
      height: 34px !important;
      object-fit: contain !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="ilc-container-${id}"
  style="width:100% !important;min-width:100% !important;background-color:${bg(p)};">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
        <tr>
          <!-- Left Column (Stacks on Top on Mobile) -->
          <td class="ilc-left-${id}" width="38%" style="vertical-align:middle;padding-right:20px;border-right:2px solid ${ac};">
            <p class="ilc-title-${id}" style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;
              color:#1e1535;line-height:1.2;">Trusted By<span class="ilc-title-br-${id}"><br></span> Leading Brands</p>
            <p class="ilc-sub-${id}" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;
              color:${captionColor(p)};line-height:1.5;">Stocking only genuine, authorised products</p>
          </td>
          <!-- Right Column (Stacks Below on Mobile with Centered Big Logos) -->
          <td class="ilc-right-${id}" width="62%" style="vertical-align:middle;padding-left:20px;">
            <table class="ilc-logos-table-${id}" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
              <tr>${row1}</tr>
              <tr>
                <td colspan="3" align="center" style="padding:0;text-align:center;">
                  <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                    <tr>${row2}</tr>
                  </table>
                </td>
              </tr>
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
// Sleek midnight band with frosted credential cards & illuminated logo plates
// ─────────────────────────────────────────────────────────────────────────────
function darkBand(p: any, id: string): string {
  const TAGS = ['PROTECTED', '3-D SECURE', 'ID CHECK', 'GUARANTEE', '256-BIT SSL']

  const cells = LOGO_NAMES.map((name, i) => `
      <td class="dkb-cell-${id}" width="20%" style="width:20%;padding:0 5px;text-align:center;vertical-align:top;box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="width:100%;background-color:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.25);">
          <!-- Logo Inset Plate for 100% High-Contrast Clarity -->
          <tr>
            <td class="dkb-logo-td-${id}" style="padding:10px 6px 8px;text-align:center;">
              <div class="dkb-plate-${id}" style="display:inline-block;background-color:#ffffff;border-radius:6px;padding:6px 8px;box-shadow:0 1px 4px rgba(0,0,0,0.35);vertical-align:middle;box-sizing:border-box;">
                <div style="display:inline-block;max-width:100%;vertical-align:middle;">
                  ${renderLogo(p, i, 68)}
                </div>
              </div>
            </td>
          </tr>
          <!-- Brand Label + Neon Security Tag -->
          <tr>
            <td class="dkb-label-td-${id}" style="padding:0 4px 10px;text-align:center;">
              <div class="dkb-label-${id}" style="font-family:Arial,Helvetica,sans-serif;font-size:9.5px;font-weight:700;color:#f8fafc;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</div>
              <div class="dkb-tag-${id}" style="margin-top:3px;display:inline-block;vertical-align:middle;">
                <span style="display:inline-block;width:4px;height:4px;border-radius:50%;background-color:#10b981;vertical-align:middle;margin-right:2px;box-shadow:0 0 4px #10b981;"></span>
                <span style="font-family:Arial,Helvetica,sans-serif;font-size:7.5px;font-weight:700;color:#34d399;letter-spacing:0.3px;vertical-align:middle;">${TAGS[i]}</span>
              </div>
            </td>
          </tr>
        </table>
      </td>`).join('')

  return `<!--[riazify:logo_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .dkb-cell-${id} {
      padding: 0 2px !important;
    }
    .dkb-logo-td-${id} {
      padding: 6px 2px 4px !important;
    }
    .dkb-plate-${id} {
      padding: 4px 3px !important;
      border-radius: 4px !important;
    }
    .dkb-cell-${id} svg {
      width: 100% !important;
      max-width: 44px !important;
      height: auto !important;
      max-height: 18px !important;
    }
    .dkb-cell-${id} img {
      max-width: 40px !important;
      height: 18px !important;
      object-fit: contain !important;
    }
    .dkb-label-td-${id} {
      padding: 0 2px 6px !important;
    }
    .dkb-label-${id} {
      font-size: 7.5px !important;
      letter-spacing: 0 !important;
    }
    .dkb-tag-${id} {
      display: none !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;background-color:#0b0f19;">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <!-- Cyber Cyan Header Badge -->
      <div style="margin-bottom:14px;text-align:center;">
        <span style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:9.5px;font-weight:800;letter-spacing:2px;color:#38bdf8;text-transform:uppercase;background-color:rgba(56,189,248,0.1);padding:4px 14px;border-radius:20px;border:1px solid rgba(56,189,248,0.25);">
          ✦ ${captionText(p)} ✦
        </span>
      </div>
      <!-- Cards Grid Row -->
      <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0" style="width:100% !important;table-layout:fixed;">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:logo_bar:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 7 — gradient-showcase
// Executive midnight gradient with high-end white retail credential cards
// ─────────────────────────────────────────────────────────────────────────────
function gradientShowcase(p: any, id: string): string {
  const cards = LOGO_NAMES.map((name, i) => `
      <td class="gsc-cell-${id}" width="20%" style="width:20%;padding:0 5px;text-align:center;vertical-align:top;box-sizing:border-box;">
        <div class="gsc-card-${id}" style="background-color:#ffffff;border-radius:8px;padding:12px 6px 10px;box-shadow:0 4px 14px rgba(0,0,0,0.22);border:1px solid rgba(255,255,255,0.25);text-align:center;box-sizing:border-box;">
          <div style="display:inline-block;max-width:100%;vertical-align:middle;min-height:34px;line-height:34px;">
            ${renderLogo(p, i, 72)}
          </div>
          <div class="gsc-name-${id}" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,sans-serif;font-size:9.5px;font-weight:700;color:#334155;text-transform:uppercase;letter-spacing:0.5px;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${name}
          </div>
        </div>
      </td>`).join('')

  return `<!--[riazify:logo_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .gsc-cell-${id} {
      padding: 0 2px !important;
    }
    .gsc-card-${id} {
      padding: 8px 2px 6px !important;
      border-radius: 6px !important;
    }
    .gsc-cell-${id} svg {
      width: 100% !important;
      max-width: 44px !important;
      height: auto !important;
      max-height: 20px !important;
    }
    .gsc-cell-${id} img {
      max-width: 40px !important;
      height: 18px !important;
      object-fit: contain !important;
    }
    .gsc-name-${id} {
      font-size: 7.5px !important;
      letter-spacing: 0 !important;
      margin-top: 3px !important;
    }
    .gsc-title-${id} {
      font-size: 10px !important;
      letter-spacing: 1.5px !important;
      margin-bottom: 12px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;background:linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <p class="gsc-title-${id}" style="margin:0 0 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;
        color:#cbd5e1;letter-spacing:2.5px;text-transform:uppercase;">
        <span style="display:inline-block;border-bottom:1px solid rgba(203,213,225,0.3);padding-bottom:3px;">${captionText(p)}</span>
      </p>
      <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0" style="width:100% !important;table-layout:fixed;">
        <tr>${cards}</tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:logo_bar:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 8 — trust-ticker
// Narrow ticker bar: VERIFIED badge left on desktop, stacked banner on mobile
// ─────────────────────────────────────────────────────────────────────────────
function trustTicker(p: any, id: string): string {
  const ac = accent(p)
  const logoRow = LOGO_NAMES.map((_n, i) => {
    const dot = i < LOGO_NAMES.length - 1
      ? `<td class="ttk-dot-${id}" style="padding:0 6px;font-family:Arial,sans-serif;font-size:12px;color:#cbd5e1;vertical-align:middle;text-align:center;">•</td>` : ''
    return `<td class="ttk-cell-${id}" style="padding:0 8px;text-align:center;vertical-align:middle;">
            <div style="display:inline-block;max-width:100%;vertical-align:middle;">
              ${renderLogo(p, i, 68)}
            </div>
        </td>${dot}`
  }).join('')

  return `<!--[riazify:logo_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .ttk-container-${id} {
      width: 100% !important;
      min-width: 100% !important;
    }
    .ttk-badge-${id} {
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
      text-align: center !important;
      padding: 6px 12px !important;
      border-radius: 6px 6px 0 0 !important;
    }
    .ttk-badge-${id} span {
      font-size: 9.5px !important;
      letter-spacing: 1px !important;
    }
    .ttk-logos-td-${id} {
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
      padding: 8px 4px 9px 4px !important;
      text-align: center !important;
    }
    .ttk-logos-table-${id} {
      width: 100% !important;
      table-layout: fixed !important;
    }
    .ttk-cell-${id} {
      padding: 0 2px !important;
    }
    .ttk-cell-${id} svg {
      width: 100% !important;
      max-width: 48px !important;
      height: auto !important;
      max-height: 20px !important;
    }
    .ttk-cell-${id} img {
      max-width: 44px !important;
      height: 20px !important;
      object-fit: contain !important;
    }
    .ttk-dot-${id} {
      padding: 0 1px !important;
      font-size: 9px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="ttk-container-${id}"
  style="width:100% !important;min-width:100% !important;background-color:${bg(p)};">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="width:100% !important;background-color:#ffffff;border:1.5px solid #e5e7eb;border-radius:6px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
        <tr>
          <!-- Badge: Left pill on desktop, full-width top bar on mobile -->
          <td class="ttk-badge-${id}" width="1%" style="padding:10px 18px;background-color:${ac};white-space:nowrap;vertical-align:middle;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;
              color:#ffffff;letter-spacing:1px;white-space:nowrap;">&#10003; VERIFIED</span>
          </td>
          <!-- Logos Row: Stretches full-width below the badge on mobile -->
          <td class="ttk-logos-td-${id}" style="padding:0 12px;vertical-align:middle;">
            <table class="ttk-logos-table-${id}" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;width:100%;">
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
// Gradient-border wrapper + white inner with coloured top accent bar
// ─────────────────────────────────────────────────────────────────────────────
function spotlightCards(p: any, id: string): string {
  const ac = accent(p)
  const cards = LOGO_NAMES.map((name, i) => `
      <td class="spc-cell-${id}" width="20%" style="width:20%;padding:0 5px;text-align:center;vertical-align:top;box-sizing:border-box;">
        <div class="spc-wrap-${id}" style="background:linear-gradient(135deg,${ac} 0%,#1e1535 100%);
          border-radius:10px;padding:2px;display:inline-block;width:100%;box-sizing:border-box;box-shadow:0 2px 6px rgba(0,0,0,0.05);">
          <div style="background-color:#ffffff;border-radius:8px;overflow:hidden;">
            <div style="background:linear-gradient(90deg,${ac} 0%,#9b6bff 100%);height:3px;"></div>
            <div class="spc-inner-${id}" style="padding:12px 6px 10px;text-align:center;">
              <div style="display:inline-block;max-width:100%;vertical-align:middle;">
                ${renderLogo(p, i, 70)}
              </div>
              <div class="spc-label-${id}" style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;
                color:${ac};text-transform:uppercase;letter-spacing:0.5px;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</div>
            </div>
          </div>
        </div>
      </td>`).join('')

  return `<!--[riazify:logo_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .spc-cell-${id} {
      padding: 0 2px !important;
    }
    .spc-wrap-${id} {
      border-radius: 7px !important;
      padding: 1.5px !important;
    }
    .spc-inner-${id} {
      padding: 6px 2px 5px !important;
    }
    .spc-cell-${id} svg {
      width: 100% !important;
      max-width: 44px !important;
      height: auto !important;
      max-height: 18px !important;
    }
    .spc-cell-${id} img {
      max-width: 40px !important;
      height: 18px !important;
      object-fit: contain !important;
    }
    .spc-label-${id} {
      font-size: 7.5px !important;
      letter-spacing: 0 !important;
      margin-top: 3px !important;
    }
    .spc-title-${id} {
      font-size: 10px !important;
      letter-spacing: 1.5px !important;
      margin-bottom: 12px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;background-color:${bg(p)};">
  <tr>
    <td style="${pad(p)}text-align:center;">
      <p class="spc-title-${id}" style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;
        color:${ac};letter-spacing:2px;text-transform:uppercase;">${captionText(p)}</p>
      <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0" style="width:100% !important;table-layout:fixed;">
        <tr>${cards}</tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:logo_bar:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 10 — glass-mosaic
// Frosted glass panel on deep gradient with high-contrast logo plates
// ─────────────────────────────────────────────────────────────────────────────
function glassMosaic(p: any, id: string): string {
  const ac = accent(p)
  const cards = LOGO_NAMES.map((name, i) => `
      <td class="glm-cell-${id}" width="20%" style="width:20%;padding:0 5px;text-align:center;vertical-align:top;box-sizing:border-box;">
        <div class="glm-card-${id}" style="background:linear-gradient(135deg,rgba(255,255,255,0.18) 0%,rgba(255,255,255,0.06) 100%);
          border:1px solid rgba(255,255,255,0.22);border-radius:10px;padding:12px 6px 10px;box-sizing:border-box;box-shadow:0 4px 12px rgba(0,0,0,0.25);">
          <!-- White Inset Plate for 100% Logo Clarity -->
          <div class="glm-plate-${id}" style="background-color:#ffffff;border-radius:6px;padding:6px 6px 5px;display:inline-block;box-shadow:0 1px 4px rgba(0,0,0,0.25);vertical-align:middle;box-sizing:border-box;">
            <div style="display:inline-block;max-width:100%;vertical-align:middle;">
              ${renderLogo(p, i, 74)}
            </div>
          </div>
          <div class="glm-label-${id}" style="font-family:Arial,Helvetica,sans-serif;font-size:9.5px;font-weight:700;
            color:#ffffff;text-transform:uppercase;letter-spacing:0.6px;margin-top:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${name}
          </div>
        </div>
      </td>`).join('')

  return `<!--[riazify:logo_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .glm-cell-${id} {
      padding: 0 2px !important;
    }
    .glm-card-${id} {
      padding: 7px 2px 6px !important;
      border-radius: 7px !important;
    }
    .glm-plate-${id} {
      padding: 4px 3px 3px !important;
      border-radius: 4px !important;
    }
    .glm-cell-${id} svg {
      width: 100% !important;
      max-width: 44px !important;
      height: auto !important;
      max-height: 18px !important;
    }
    .glm-cell-${id} img {
      max-width: 40px !important;
      height: 18px !important;
      object-fit: contain !important;
    }
    .glm-label-${id} {
      font-size: 7px !important;
      letter-spacing: 0 !important;
      margin-top: 4px !important;
    }
    .glm-header-${id} {
      font-size: 13px !important;
      letter-spacing: 2px !important;
      margin-bottom: 2px !important;
    }
    .glm-sub-${id} {
      font-size: 10px !important;
      margin-bottom: 12px !important;
    }
    .glm-footer-${id} {
      font-size: 8.5px !important;
      letter-spacing: 0.2px !important;
      margin-top: 12px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;">
  <tr>
    <td style="background:linear-gradient(135deg,${ac} 0%,#1e1535 100%);padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100% !important;">
        <tr>
          <td style="${pad(p)}background-color:rgba(255,255,255,0.06);text-align:center;">
            <p class="glm-header-${id}" style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;
              color:#ffffff;letter-spacing:3px;text-transform:uppercase;">${captionText(p)}</p>
            <p class="glm-sub-${id}" style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:12px;
              color:rgba(255,255,255,0.65);line-height:1.4;">
              Proudly stocking authentic products from world-class brands
            </p>
            <table width="100%" align="center" cellpadding="0" cellspacing="0" border="0" style="width:100% !important;table-layout:fixed;">
              <tr>${cards}</tr>
            </table>
            <p class="glm-footer-${id}" style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:10.5px;
              color:rgba(255,255,255,0.55);letter-spacing:0.8px;">
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
