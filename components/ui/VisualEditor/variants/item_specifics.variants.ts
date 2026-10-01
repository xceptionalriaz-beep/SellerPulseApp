// components/ui/VisualEditor/variants/item_specifics.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Item Specifics — 10 Radically Distinct, High-Converting Retail Layouts
// Built specifically for high-converting eBay & e-commerce listings.
// Zero generic AI-slop, zero cheesy glassmorphism, zero fake neon glows.
// 100% authentic, tangible, battle-tested retail architectures that buyers trust.
//
// 1. is-dual-column-zebra-card      — Executive 2-column alternating zebra table (KEPT EXACTLY AS-IS)
// 2. is-two-column-card-grid        — Modern 2-column bento micro-card spec grid for tech & audio
// 3. is-industrial-blueprint-matrix — CAD / Schematic Blueprint matrix with corner crosshairs & technical blocks
// 4. is-boutique-hairline-editorial — Asymmetrical Scandinavian fashion magazine editorial split ledger
// 5. is-stamped-manifest-ledger     — Authentic courier waybill manifest ticket with barcode & inspected stamp
// 6. is-pill-tag-cluster            — Ergonomic dual-tone capsule pill badge cluster for lightning mobile scan
// 7. is-dark-terminal-console       — Modular Cyber Diagnostics Telemetry HUD with hex addresses & telemetry cards
// 8. is-split-key-highlight-card    — Top flagship attributes in hero highlight cards with secondary spec grid below
// 9. is-compact-three-column-strip  — High-density 3-column micro-grid spreadsheet for large multi-attribute catalogs
// 10. is-luxury-gold-accent-band    — Official Atelier Certificate of Provenance Dossier with double gold plaque frame
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
    id: string
    label: string
    description: string
    thumbnail?: string
    toHtml: (props: any, id: string) => string
}

// ─── Shared Helpers & Dynamic Resolvers ─────────────────────────────────────
function pad(p: any, defaultT = 16, defaultR = 20, defaultB = 16, defaultL = 20): string {
    const top = p.paddingTop ?? defaultT
    const right = p.paddingRight ?? defaultR
    const bottom = p.paddingBottom ?? defaultB
    const left = p.paddingLeft ?? defaultL
    return `padding:${top}px ${right}px ${bottom}px ${left}px;`
}

function font(p: any, defaultFamily = 'Arial, Helvetica, sans-serif'): string {
    return p.fontFamily ? `${p.fontFamily}, Arial, sans-serif` : defaultFamily
}

function titleText(p: any, fallback = 'Item Specifics'): string {
    return p.titleText ?? p.heading ?? p.title ?? fallback
}

interface SpecRow {
    key: string
    value: string
}

const DEFAULT_ROWS: SpecRow[] = [
    { key: 'Condition', value: '{{ITEM_CONDITION}}' },
    { key: 'Brand', value: '{{BRAND}}' },
    { key: 'Model', value: '{{MODEL}}' },
    { key: 'MPN / Part #', value: '{{MPN}}' },
    { key: 'EAN / UPC', value: '{{EAN}}' },
    { key: 'Colour', value: '{{COLOUR}}' },
    { key: 'Size / Dimensions', value: '{{SIZE}}' },
    { key: 'Material', value: '{{MATERIAL}}' },
]

function getRows(p: any): SpecRow[] {
    if (Array.isArray(p.rows) && p.rows.length > 0) {
        return p.rows
    }
    return DEFAULT_ROWS
}

const KNOWN_DEFAULT_BGS = [
    '#ffffff', // White
    '#f8fafc', // Slate 50
    '#f8f7ff', // Purple 50
    '#dc2626', // Red
    '#1e1535', // Dark Purple
    '#0f172a', // Slate 900
    '#18181b', // Zinc 900
    '#09090b', // Zinc 950
    '#090d16', // Dark Navy
    '#064e3b', // Emerald
    '#fffdfa', // Cream Ivory
    '#f0fdf4', // Mint Green
]

function resolveBg(p: any, signatureBg: string): string {
    if (!p.bgColor) return signatureBg
    const val = p.bgColor.toLowerCase().trim()
    if (KNOWN_DEFAULT_BGS.includes(val)) {
        return signatureBg
    }
    return p.bgColor
}

function resolveText(p: any, signatureText: string): string {
    if (!p.keyColor && !p.textColor) return signatureText
    const val = (p.keyColor ?? p.textColor).toLowerCase().trim()
    if (
        val === '#1e1535' ||
        val === '#ffffff' ||
        val === '#0f172a' ||
        val === '#18181b' ||
        val === '#1c1917' ||
        val === '#f4f4f5' ||
        val === '#fafafa'
    ) {
        return signatureText
    }
    return p.keyColor ?? p.textColor
}

function resolveAccent(p: any, signatureAccent: string): string {
    const custom = p.headerBg ?? p.accentColor
    if (!custom) return signatureAccent
    const val = custom.toLowerCase().trim()
    const KNOWN_ACCENTS = [
        '#7530fb', '#b8fa33', '#f59e0b', '#b91c1c', '#d4af37',
        '#0284c7', '#f97316', '#2563eb', '#71717a', '#06b6d4',
        '#fbbf24', '#10b981', '#16a34a'
    ]
    if (KNOWN_ACCENTS.includes(val)) {
        return signatureAccent
    }
    return custom
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. EXECUTIVE DUAL-COLUMN ZEBRA CARD (KEPT 100% IDENTICAL AS REQUESTED)
// Clean alternating zebra table with rounded frame and subtle header badge
// ─────────────────────────────────────────────────────────────────────────────
function dualColumnZebraCard(p: any, id: string): string {
    const f = font(p)
    const rows = getRows(p)
    const bgCol = resolveBg(p, '#ffffff')
    const keyCol = resolveText(p, '#0f172a')
    const valCol = '#475569'
    const accent = resolveAccent(p, '#2563eb')
    const title = titleText(p, 'ITEM SPECIFICS & TECHNICAL DATA')

    const rowsHtml = rows.map((r, i) => {
        const rowBg = i % 2 === 0 ? '#f8fafc' : '#ffffff'
        return `<tr>
      <td width="35%" style="padding:10px 16px;background-color:${rowBg};border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;font-size:12.5px;font-weight:700;color:${keyCol};box-sizing:border-box;">
        ${r.key}
      </td>
      <td width="65%" style="padding:10px 16px;background-color:${rowBg};border-bottom:1px solid #e2e8f0;font-size:12.5px;color:${valCol};font-weight:500;box-sizing:border-box;">
        ${r.value}
      </td>
    </tr>`
    }).join('')

    return `<!--[riazify:item_specifics:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #e2e8f0;border-radius:8px;overflow:hidden;background-color:${bgCol};">
  <!-- Header Bar -->
  <tr>
    <td style="background-color:#0f172a;padding:12px 18px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="text-align:left;vertical-align:middle;">
            <span style="display:inline-block;background-color:${accent};color:#ffffff;font-size:9.5px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:2px 7px;border-radius:3px;">
              VERIFIED SPECS
            </span>
            <span style="color:#ffffff;font-size:14px;font-weight:800;letter-spacing:0.3px;margin-left:8px;vertical-align:middle;">
              ${title}
            </span>
          </td>
          <td style="text-align:right;color:#94a3b8;font-size:11px;font-weight:600;">
            ${rows.length} Attributes Defined
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Rows -->
  ${rowsHtml}
</table>
<!--[/riazify:item_specifics:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TWO-COLUMN BENTO MICRO-CARD GRID
// Modern SaaS / Apple-style 2-column bento micro-cards for tech, audio & gadgets
// ─────────────────────────────────────────────────────────────────────────────
function twoColumnCardGrid(p: any, id: string): string {
    const f = font(p)
    const rows = getRows(p)
    const bgCol = resolveBg(p, '#ffffff')
    const keyCol = resolveText(p, '#0f172a')
    const accent = resolveAccent(p, '#2563eb')
    const title = titleText(p, 'Key Technical Specifications')

    // Split rows into pairs of 2
    const pairs: SpecRow[][] = []
    for (let i = 0; i < rows.length; i += 2) {
        pairs.push(rows.slice(i, i + 2))
    }

    const gridHtml = pairs.map(pair => {
        const col1 = pair[0]
        const col2 = pair[1]

        const cell1 = `<td width="50%" valign="top" style="padding:4px;box-sizing:border-box;">
      <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px 12px;box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <div style="color:#64748b;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">${col1.key}</div>
              <div style="color:${keyCol};font-size:13px;font-weight:800;margin-top:2px;">${col1.value}</div>
            </td>
            <td width="20" align="right" valign="top">
              <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background-color:${accent};opacity:0.6;"></span>
            </td>
          </tr>
        </table>
      </div>
    </td>`

        const cell2 = col2 ? `<td width="50%" valign="top" style="padding:4px;box-sizing:border-box;">
      <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px 12px;box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <div style="color:#64748b;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">${col2.key}</div>
              <div style="color:${keyCol};font-size:13px;font-weight:800;margin-top:2px;">${col2.value}</div>
            </td>
            <td width="20" align="right" valign="top">
              <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background-color:${accent};opacity:0.6;"></span>
            </td>
          </tr>
        </table>
      </div>
    </td>` : `<td width="50%"></td>`

        return `<tr>${cell1}${cell2}</tr>`
    }).join('')

    return `<!--[riazify:item_specifics:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #e2e8f0;border-radius:8px;padding:6px;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 14, 16, 14, 16)}box-sizing:border-box;">
      <!-- Title -->
      <div style="margin-bottom:12px;display:flex;align-items:center;">
        <span style="color:${accent};font-size:10px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">SPECIFICATION GRID &bull;</span>
        <span style="color:${keyCol};font-size:15px;font-weight:900;margin-left:6px;">${title}</span>
      </div>
      <!-- Bento Cards -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${gridHtml}
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:item_specifics:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. INDUSTRIAL BLUEPRINT / SCHEMATIC SPECIFICATION MATRIX
// Deep technical blueprint with drawing headers, coordinate ticks & modular parameter blocks
// ─────────────────────────────────────────────────────────────────────────────
function industrialBlueprintMatrix(p: any, id: string): string {
    const f = font(p, 'Courier New, monospace')
    const rows = getRows(p)
    const bgCol = resolveBg(p, '#0c1a2e')
    const textCol = resolveText(p, '#e0f2fe')
    const cyan = resolveAccent(p, '#38bdf8')
    const title = titleText(p, 'TECHNICAL BLUEPRINT // OEM SPECIFICATION MATRIX')

    // Split into pairs of 2 modular blueprint parameter cells
    const pairs: SpecRow[][] = []
    for (let i = 0; i < rows.length; i += 2) {
        pairs.push(rows.slice(i, i + 2))
    }

    const cellsHtml = pairs.map((pair, rowIdx) => {
        const col1 = pair[0]
        const col2 = pair[1]
        const num1 = String(rowIdx * 2 + 1).padStart(2, '0')
        const num2 = String(rowIdx * 2 + 2).padStart(2, '0')

        const box1 = `<td width="50%" valign="top" style="padding:5px;box-sizing:border-box;">
      <div style="background-color:#081322;border:1px solid #1e3a5f;border-left:3px solid ${cyan};padding:8px 12px;box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="color:#64748b;font-size:9px;font-family:monospace;letter-spacing:1px;">SEC.${num1} // PARAM</td>
            <td align="right" style="color:${cyan};font-size:9px;font-family:monospace;font-weight:700;">[+VERIFIED]</td>
          </tr>
          <tr>
            <td colspan="2" style="padding-top:4px;">
              <div style="color:#94a3b8;font-size:10px;font-weight:700;text-transform:uppercase;font-family:monospace;">${col1.key}</div>
              <div style="color:${textCol};font-size:13px;font-weight:800;font-family:Arial,sans-serif;margin-top:2px;">${col1.value}</div>
            </td>
          </tr>
        </table>
      </div>
    </td>`

        const box2 = col2 ? `<td width="50%" valign="top" style="padding:5px;box-sizing:border-box;">
      <div style="background-color:#081322;border:1px solid #1e3a5f;border-left:3px solid ${cyan};padding:8px 12px;box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="color:#64748b;font-size:9px;font-family:monospace;letter-spacing:1px;">SEC.${num2} // PARAM</td>
            <td align="right" style="color:${cyan};font-size:9px;font-family:monospace;font-weight:700;">[+VERIFIED]</td>
          </tr>
          <tr>
            <td colspan="2" style="padding-top:4px;">
              <div style="color:#94a3b8;font-size:10px;font-weight:700;text-transform:uppercase;font-family:monospace;">${col2.key}</div>
              <div style="color:${textCol};font-size:13px;font-weight:800;font-family:Arial,sans-serif;margin-top:2px;">${col2.value}</div>
            </td>
          </tr>
        </table>
      </div>
    </td>` : `<td width="50%"></td>`

        return `<tr>${box1}${box2}</tr>`
    }).join('')

    return `<!--[riazify:item_specifics:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:2px solid #1e3a5f;border-radius:8px;overflow:hidden;background-color:${bgCol};">
  <!-- CAD Blueprint Title Block Header -->
  <tr>
    <td style="background-color:#07111e;border-bottom:2px solid #1e3a5f;padding:12px 18px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="text-align:left;vertical-align:middle;">
            <div style="color:${cyan};font-size:9.5px;font-weight:800;letter-spacing:2px;font-family:monospace;">
              ✦ CAD DRAWING REF: #SPEC-9942 // REV 4.2
            </div>
            <div style="color:#ffffff;font-size:14px;font-weight:800;letter-spacing:0.5px;margin-top:3px;font-family:Arial,sans-serif;">
              ${title}
            </div>
          </td>
          <td style="text-align:right;vertical-align:middle;color:#38bdf8;font-size:10px;font-family:monospace;">
            <span style="display:inline-block;border:1px solid #1e3a5f;padding:3px 8px;border-radius:3px;background-color:#081322;">
              SCALE: 1:1 OEM
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Blueprint Parameters Grid -->
  <tr>
    <td style="padding:10px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${cellsHtml}
      </table>
    </td>
  </tr>
  <!-- Blueprint Footer Bar -->
  <tr>
    <td style="background-color:#07111e;border-top:1px solid #1e3a5f;padding:7px 16px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="color:#64748b;font-size:9.5px;font-family:monospace;">
            DIMENSIONS &bull; TOLERANCE: ISO-STANDARD VERIFIED
          </td>
          <td align="right" style="color:${cyan};font-size:9.5px;font-family:monospace;font-weight:700;">
            [ SYSTEM INTEGRITY: 100% PASS ]
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:item_specifics:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. BOUTIQUE SCANDINAVIAN MINIMALIST EDITORIAL (ASYMMETRICAL MAGAZINE SPLIT)
// Left-side editorial headline feature block with right-side staggered hairline ledger
// ─────────────────────────────────────────────────────────────────────────────
function boutiqueHairlineEditorial(p: any, id: string): string {
    const f = font(p, 'Georgia, serif')
    const rows = getRows(p)
    const bgCol = resolveBg(p, '#ffffff')
    const keyCol = resolveText(p, '#18181b')
    const accent = resolveAccent(p, '#71717a')
    const title = titleText(p, 'Specification Archive')

    const itemsHtml = rows.map((r, i) => {
        const isLast = i === rows.length - 1
        return `<tr>
      <td style="padding:8px 0;border-bottom:${isLast ? 'none' : '1px solid #f4f4f5'};vertical-align:top;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="40%" style="font-family:Arial,sans-serif;font-size:10.5px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${accent};">
              ${r.key}
            </td>
            <td width="60%" style="font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:${keyCol};text-align:right;">
              ${r.value}
            </td>
          </tr>
        </table>
      </td>
    </tr>`
    }).join('')

    return `<!--[riazify:item_specifics:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;border-collapse:collapse;margin:0 auto;border:1px solid #e4e4e7;border-radius:8px;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 20, 24, 20, 24)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Left Column: Editorial Feature Spine -->
          <td width="36%" valign="top" style="padding-right:20px;border-right:1px solid #e4e4e7;box-sizing:border-box;">
            <div style="font-family:Arial,sans-serif;color:${accent};font-size:9px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;">
              VOL. SPEC &bull; ISSUE 01
            </div>
            <div style="font-family:${f};color:${keyCol};font-size:22px;font-weight:400;letter-spacing:-0.3px;line-height:1.2;margin-top:10px;">
              ${title}
            </div>
            <div style="width:28px;height:1.5px;background-color:${keyCol};margin:14px 0;"></div>
            <div style="font-family:Arial,sans-serif;color:#71717a;font-size:11px;line-height:1.5;">
              Curated technical dossier and manufacturing attributes for authentic collector reference.
            </div>
            <div style="margin-top:20px;display:inline-block;border:1px solid #e4e4e7;padding:4px 8px;border-radius:4px;font-family:Arial,sans-serif;font-size:9.5px;font-weight:700;color:#18181b;">
              ✓ VERIFIED DATA
            </div>
          </td>
          <!-- Right Column: Staggered Hairline Ledger -->
          <td width="64%" valign="top" style="padding-left:20px;box-sizing:border-box;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${itemsHtml}
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:item_specifics:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. VINTAGE COURIER MANIFEST & PACKING WAYBILL TICKET
// Authentic freight docket ticket with perforated cut line, barcode & inspector stamp
// ─────────────────────────────────────────────────────────────────────────────
function stampedManifestLedger(p: any, id: string): string {
    const f = font(p, 'Courier New, monospace')
    const rows = getRows(p)
    const bgCol = resolveBg(p, '#fffefb')
    const textCol = resolveText(p, '#1c1917')
    const stampRed = resolveAccent(p, '#b91c1c')
    const title = titleText(p, 'OFFICIAL COURIER WAYBILL & ITEM MANIFEST')

    const rowsHtml = rows.map((r, i) => {
        const num = String(i + 1).padStart(2, '0')
        const borderB = i === rows.length - 1 ? '' : 'border-bottom:1px dashed #d6d3d1;'
        return `<tr>
      <td width="10%" style="padding:8px 6px;font-family:monospace;font-size:11px;font-weight:700;color:#78716c;${borderB}">
        #${num}
      </td>
      <td width="35%" style="padding:8px 6px;font-family:monospace;font-size:11px;font-weight:700;color:#57534e;text-transform:uppercase;${borderB}">
        ${r.key}
      </td>
      <td width="55%" style="padding:8px 6px;font-family:Arial,sans-serif;font-size:12.5px;font-weight:800;color:${textCol};${borderB}">
        ${r.value}
      </td>
    </tr>`
    }).join('')

    return `<!--[riazify:item_specifics:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:2px solid #d6d3d1;border-radius:6px;background-color:${bgCol};box-shadow:0 1px 3px rgba(0,0,0,0.05);">
  <!-- Top Perforation Header -->
  <tr>
    <td style="background-color:#f5f5f4;border-bottom:1px dashed #a8a29e;padding:8px 16px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="color:#78716c;font-size:9.5px;letter-spacing:1px;font-family:monospace;">
            ✂ CUT ALONG PERFORATION &bull; DOCKET #WAYBILL-88392-EB
          </td>
          <td align="right" style="color:#44403c;font-size:9.5px;font-weight:700;font-family:monospace;">
            DISPATCH LOT // VERIFIED
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Manifest Title & Inspector Stamp Section -->
  <tr>
    <td style="padding:14px 18px 8px 18px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="top" style="padding-right:12px;">
            <div style="color:#78716c;font-size:9px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">
              CUSTOMS &amp; WAREHOUSE INVENTORY RECORD
            </div>
            <div style="color:${textCol};font-size:15px;font-weight:900;letter-spacing:0.3px;margin-top:2px;font-family:Arial,sans-serif;">
              ${title}
            </div>
            <div style="font-family:monospace;font-size:10px;color:#a8a29e;margin-top:4px;">
              ||| | ||||| || |||||| | |||| | |||||||| |||
            </div>
          </td>
          <td width="140" align="right" valign="top">
            <!-- Simulated Red Rubber Stamp -->
            <div style="display:inline-block;border:2px solid ${stampRed};padding:4px 8px;border-radius:4px;transform:rotate(-2deg);text-align:center;">
              <div style="color:${stampRed};font-size:8.5px;font-weight:900;letter-spacing:1px;font-family:monospace;">★ INSPECTED ★</div>
              <div style="color:${stampRed};font-size:10.5px;font-weight:900;font-family:Arial,sans-serif;">100% VERIFIED</div>
              <div style="color:${stampRed};font-size:7.5px;font-weight:700;font-family:monospace;">EBAY COURIER LOT</div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Itemized Rows -->
  <tr>
    <td style="padding:6px 16px 14px 16px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #d6d3d1;">
        ${rowsHtml}
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:item_specifics:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. MODERN BADGE / ERGONOMIC CAPSULE PILL CLUSTER
// Grouped dual-tone rounded pill chips engineered for rapid mobile thumb-scanning
// ─────────────────────────────────────────────────────────────────────────────
function pillTagCluster(p: any, id: string): string {
    const f = font(p)
    const rows = getRows(p)
    const bgCol = resolveBg(p, '#ffffff')
    const textCol = resolveText(p, '#0f172a')
    const accent = resolveAccent(p, '#7530fb')
    const title = titleText(p, 'Item Specifications Summary')

    const pillsHtml = rows.map(r => {
        return `<div style="display:inline-block;background-color:#ffffff;border:1.5px solid #e2e8f0;border-radius:999px;margin:4px 3px;vertical-align:top;box-shadow:0 1px 2px rgba(0,0,0,0.03);overflow:hidden;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background-color:#f1f5f9;padding:6px 10px;font-size:10px;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:0.5px;border-right:1px solid #e2e8f0;">
            ${r.key}
          </td>
          <td style="background-color:#ffffff;padding:6px 12px;font-size:12px;font-weight:800;color:${textCol};">
            ${r.value}
          </td>
        </tr>
      </table>
    </div>`
    }).join('')

    return `<!--[riazify:item_specifics:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #ede9fe;border-radius:10px;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
        <tr>
          <td>
            <span style="display:inline-block;background-color:#f3eeff;color:${accent};font-size:9.5px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:3px 8px;border-radius:4px;">
              CAPSULE MATRIX
            </span>
            <span style="color:${textCol};font-size:15px;font-weight:900;margin-left:8px;vertical-align:middle;">
              ${title}
            </span>
          </td>
          <td align="right" style="color:#64748b;font-size:11px;font-weight:600;">
            ${rows.length} verified tags
          </td>
        </tr>
      </table>
      <div>
        ${pillsHtml}
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:item_specifics:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. MODULAR CYBER TELEMETRY HUD & HARDWARE CONSOLE
// Radically distinct terminal HUD cards with hex addresses, status LEDs & telemetry meters
// ─────────────────────────────────────────────────────────────────────────────
function darkTerminalConsole(p: any, id: string): string {
    const f = font(p, 'Consolas, Monaco, Courier New, monospace')
    const rows = getRows(p)
    const bgCol = resolveBg(p, '#070b12')
    const textCol = resolveText(p, '#f8fafc')
    const cyan = resolveAccent(p, '#06b6d4')
    const emerald = '#10b981'
    const title = titleText(p, 'SYS.HARDWARE // TELEMETRY DIAGNOSTIC')

    // Split into pairs of 2 modular telemetry blocks
    const pairs: SpecRow[][] = []
    for (let i = 0; i < rows.length; i += 2) {
        pairs.push(rows.slice(i, i + 2))
    }

    const hudBlocksHtml = pairs.map((pair, rowIdx) => {
        const col1 = pair[0]
        const col2 = pair[1]
        const hex1 = `0x${(rowIdx * 2 + 10).toString(16).toUpperCase()}`
        const hex2 = `0x${(rowIdx * 2 + 11).toString(16).toUpperCase()}`

        const block1 = `<td width="50%" valign="top" style="padding:4px;box-sizing:border-box;">
      <div style="background-color:#0c1322;border:1px solid #1e293b;border-top:2px solid ${cyan};border-radius:4px;padding:8px 12px;box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="color:${cyan};font-size:9.5px;font-family:monospace;font-weight:700;">[${hex1}] ${col1.key}</td>
            <td align="right" style="color:${emerald};font-size:9px;font-family:monospace;">PASS</td>
          </tr>
          <tr>
            <td colspan="2" style="padding-top:4px;">
              <div style="color:${textCol};font-size:13.5px;font-weight:800;font-family:Arial,sans-serif;letter-spacing:0.3px;">${col1.value}</div>
              <div style="color:#334155;font-size:8px;font-family:monospace;margin-top:3px;">BUS_SIGNAL: 100% OK</div>
            </td>
          </tr>
        </table>
      </div>
    </td>`

        const block2 = col2 ? `<td width="50%" valign="top" style="padding:4px;box-sizing:border-box;">
      <div style="background-color:#0c1322;border:1px solid #1e293b;border-top:2px solid ${cyan};border-radius:4px;padding:8px 12px;box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="color:${cyan};font-size:9.5px;font-family:monospace;font-weight:700;">[${hex2}] ${col2.key}</td>
            <td align="right" style="color:${emerald};font-size:9px;font-family:monospace;">PASS</td>
          </tr>
          <tr>
            <td colspan="2" style="padding-top:4px;">
              <div style="color:${textCol};font-size:13.5px;font-weight:800;font-family:Arial,sans-serif;letter-spacing:0.3px;">${col2.value}</div>
              <div style="color:#334155;font-size:8px;font-family:monospace;margin-top:3px;">BUS_SIGNAL: 100% OK</div>
            </td>
          </tr>
        </table>
      </div>
    </td>` : `<td width="50%"></td>`

        return `<tr>${block1}${block2}</tr>`
    }).join('')

    return `<!--[riazify:item_specifics:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #1e293b;border-radius:8px;overflow:hidden;background-color:${bgCol};">
  <!-- Terminal Prompt Bar -->
  <tr>
    <td style="background-color:#0f172a;border-bottom:1px solid #1e293b;padding:8px 14px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="text-align:left;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:#ef4444;margin-right:4px;"></span>
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:#f59e0b;margin-right:4px;"></span>
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:#10b981;margin-right:8px;"></span>
            <span style="color:#64748b;font-size:10px;font-family:monospace;">root@diag-host:~# lshw -query=specs</span>
          </td>
          <td style="text-align:right;color:${emerald};font-size:10px;font-family:monospace;">
            ● ACTIVE &bull; [PORT: 443]
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Title Sub-Header -->
  <tr>
    <td style="background-color:#090d16;padding:10px 14px;border-bottom:1px solid #1e293b;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="color:${cyan};font-size:13px;font-weight:900;font-family:monospace;">
            &gt; ${title}
          </td>
          <td align="right" style="color:#94a3b8;font-size:10px;font-family:monospace;">
            STATUS: 100% OPERATIONAL
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Modular Telemetry HUD Grid -->
  <tr>
    <td style="padding:10px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${hudBlocksHtml}
      </table>
    </td>
  </tr>
  <!-- Terminal Status Footer -->
  <tr>
    <td style="background-color:#090d16;border-top:1px solid #1e293b;padding:6px 14px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="color:#475569;font-size:9.5px;font-family:monospace;">
            [CHECKSUM: PASS] [PARITY: OK] [CHIPSET: DETECTED]
          </td>
          <td align="right" style="color:${cyan};font-size:9.5px;font-family:monospace;">
            [EOF // ALL PARAMS READ]
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:item_specifics:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. SPLIT HERO SPEC HIGHLIGHT CARD
// Top 2 primary attributes in prominent boxes with secondary specs below
// ─────────────────────────────────────────────────────────────────────────────
function splitKeyHighlightCard(p: any, id: string): string {
    const f = font(p)
    const rows = getRows(p)
    const bgCol = resolveBg(p, '#ffffff')
    const textCol = resolveText(p, '#0f172a')
    const accent = resolveAccent(p, '#2563eb')
    const title = titleText(p, 'Primary Specifications & Details')

    const top1 = rows[0] ?? { key: 'Brand', value: '{{BRAND}}' }
    const top2 = rows[1] ?? { key: 'Model', value: '{{MODEL}}' }
    const rest = rows.slice(2)

    const restHtml = rest.map((r, i) => {
        const isEven = i % 2 === 0
        return `<tr style="background-color:${isEven ? '#f8fafc' : '#ffffff'};">
      <td width="35%" style="padding:9px 14px;border-bottom:1px solid #e2e8f0;font-size:12px;font-weight:700;color:#64748b;box-sizing:border-box;">${r.key}</td>
      <td width="65%" style="padding:9px 14px;border-bottom:1px solid #e2e8f0;font-size:12.5px;font-weight:800;color:${textCol};box-sizing:border-box;">${r.value}</td>
    </tr>`
    }).join('')

    return `<!--[riazify:item_specifics:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #e2e8f0;border-radius:8px;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 14, 16, 14, 16)}box-sizing:border-box;">
      <div style="color:${textCol};font-size:15px;font-weight:900;margin-bottom:10px;">${title}</div>
      <!-- Top 2 Hero Boxes -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
        <tr>
          <td width="50%" style="padding-right:5px;">
            <div style="background-color:#eff6ff;border:1.5px solid ${accent};border-radius:6px;padding:10px 12px;">
              <div style="color:${accent};font-size:10px;font-weight:900;text-transform:uppercase;">${top1.key}</div>
              <div style="color:#0f172a;font-size:15px;font-weight:900;margin-top:2px;">${top1.value}</div>
            </div>
          </td>
          <td width="50%" style="padding-left:5px;">
            <div style="background-color:#f0fdf4;border:1.5px solid #16a34a;border-radius:6px;padding:10px 12px;">
              <div style="color:#16a34a;font-size:10px;font-weight:900;text-transform:uppercase;">${top2.key}</div>
              <div style="color:#0f172a;font-size:15px;font-weight:900;margin-top:2px;">${top2.value}</div>
            </div>
          </td>
        </tr>
      </table>
      <!-- Remaining Specs Table -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">
        ${restHtml}
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:item_specifics:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. HIGH-DENSITY 3-COLUMN QUICK-SCAN MATRIX
// 3 equal-width columns allowing 12+ specifics to fit in half the vertical space
// ─────────────────────────────────────────────────────────────────────────────
function compactThreeColumnStrip(p: any, id: string): string {
    const f = font(p)
    const rows = getRows(p)
    const bgCol = resolveBg(p, '#ffffff')
    const textCol = resolveText(p, '#0f172a')
    const accent = resolveAccent(p, '#0284c7')
    const title = titleText(p, 'Complete Item Specifications Matrix')

    // Split into triplets of 3
    const triplets: SpecRow[][] = []
    for (let i = 0; i < rows.length; i += 3) {
        triplets.push(rows.slice(i, i + 3))
    }

    const rowsHtml = triplets.map((trip, idx) => {
        const bg = idx % 2 === 0 ? '#f8fafc' : '#ffffff'
        const cells = trip.map(col => `
      <td width="33.3%" valign="top" style="padding:8px 10px;border-bottom:1px solid #e2e8f0;border-right:1px solid #e2e8f0;box-sizing:border-box;">
        <div style="color:#64748b;font-size:9.5px;font-weight:700;text-transform:uppercase;">${col.key}</div>
        <div style="color:${textCol};font-size:12px;font-weight:800;margin-top:1px;">${col.value}</div>
      </td>
    `).join('')
        return `<tr style="background-color:${bg};">${cells}</tr>`
    }).join('')

    return `<!--[riazify:item_specifics:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #e2e8f0;border-radius:8px;overflow:hidden;background-color:${bgCol};">
  <tr>
    <td style="background-color:#f1f5f9;border-bottom:1px solid #e2e8f0;padding:10px 16px;box-sizing:border-box;">
      <span style="color:${accent};font-size:10px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">
        SPEC MATRIX &bull;
      </span>
      <span style="color:${textCol};font-size:14px;font-weight:800;margin-left:6px;">
        ${title}
      </span>
    </td>
  </tr>
  ${rowsHtml}
</table>
<!--[/riazify:item_specifics:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. ATELIER CERTIFICATE OF PROVENANCE & AUTHENTICITY DOSSIER
// Double 18k gold hairline plaque frame with Roman numeral ledger & wax lot seal
// ─────────────────────────────────────────────────────────────────────────────
function luxuryGoldAccentBand(p: any, id: string): string {
    const f = font(p, 'Georgia, Garamond, serif')
    const rows = getRows(p)
    const bgCol = resolveBg(p, '#09090b')
    const textCol = resolveText(p, '#fafafa')
    const gold = resolveAccent(p, '#d4af37')
    const title = titleText(p, 'CERTIFICATE OF PROVENANCE & TECHNICAL SPECIFICATIONS')

    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

    // Split into pairs of 2 luxury gold-inset spec cards
    const pairs: SpecRow[][] = []
    for (let i = 0; i < rows.length; i += 2) {
        pairs.push(rows.slice(i, i + 2))
    }

    const cardsHtml = pairs.map((pair, rowIdx) => {
        const col1 = pair[0]
        const col2 = pair[1]
        const rom1 = romanNumerals[rowIdx * 2] ?? `0${rowIdx * 2 + 1}`
        const rom2 = romanNumerals[rowIdx * 2 + 1] ?? `0${rowIdx * 2 + 2}`

        const card1 = `<td width="50%" valign="top" style="padding:5px;box-sizing:border-box;">
      <div style="background-color:#121214;border:1px solid #27272a;border-left:2px solid ${gold};padding:10px 14px;box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="color:${gold};font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:700;">
              ${rom1}. ${col1.key}
            </td>
            <td align="right" style="color:${gold};font-size:10px;">✦</td>
          </tr>
          <tr>
            <td colspan="2" style="padding-top:4px;">
              <div style="color:${textCol};font-size:13.5px;font-weight:600;font-family:Georgia,serif;letter-spacing:0.3px;">
                ${col1.value}
              </div>
            </td>
          </tr>
        </table>
      </div>
    </td>`

        const card2 = col2 ? `<td width="50%" valign="top" style="padding:5px;box-sizing:border-box;">
      <div style="background-color:#121214;border:1px solid #27272a;border-left:2px solid ${gold};padding:10px 14px;box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="color:${gold};font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;font-family:Arial,sans-serif;font-weight:700;">
              ${rom2}. ${col2.key}
            </td>
            <td align="right" style="color:${gold};font-size:10px;">✦</td>
          </tr>
          <tr>
            <td colspan="2" style="padding-top:4px;">
              <div style="color:${textCol};font-size:13.5px;font-weight:600;font-family:Georgia,serif;letter-spacing:0.3px;">
                ${col2.value}
              </div>
            </td>
          </tr>
        </table>
      </div>
    </td>` : `<td width="50%"></td>`

        return `<tr>${card1}${card2}</tr>`
    }).join('')

    return `<!--[riazify:item_specifics:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:2px solid ${gold};border-radius:8px;background-color:${bgCol};box-shadow:0 4px 20px rgba(0,0,0,0.4);">
  <tr>
    <td style="padding:4px;box-sizing:border-box;">
      <!-- Inner Plaque Hairline Border -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid rgba(212,175,55,0.4);border-radius:4px;">
        <!-- Plaque Crest Header -->
        <tr>
          <td style="background-color:#141416;border-bottom:1px solid ${gold};padding:16px 20px;text-align:center;box-sizing:border-box;">
            <div style="color:${gold};font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">
              ✦ ATELIER PROVENANCE &amp; HERITAGE ARCHIVE ✦
            </div>
            <div style="color:#ffffff;font-size:16px;font-weight:400;letter-spacing:0.5px;margin-top:4px;">
              ${title}
            </div>
            <div style="margin-top:6px;color:#a1a1aa;font-size:10.5px;font-family:Arial,sans-serif;letter-spacing:1px;">
              AUTHENTIC RECORD &bull; OFFICIAL LOT DOSSIER
            </div>
          </td>
        </tr>
        <!-- Luxury Dossier Spec Cards -->
        <tr>
          <td style="padding:12px;box-sizing:border-box;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${cardsHtml}
            </table>
          </td>
        </tr>
        <!-- Plaque Seal Footer -->
        <tr>
          <td style="background-color:#141416;border-top:1px solid #27272a;padding:10px 18px;box-sizing:border-box;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="color:${gold};font-size:9.5px;font-family:Arial,sans-serif;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;">
                  [ CERTIFIED GENUINE &amp; VERIFIED ]
                </td>
                <td align="right" style="color:#a1a1aa;font-size:10px;font-family:Georgia,serif;font-style:italic;">
                  Curated Archive Lot Ref: #LOT-SPEC-GOLD
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:item_specifics:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Thumbnail Representations for Visual Editor Carousel & Panels
// ─────────────────────────────────────────────────────────────────────────────
export const ITEM_SPECIFICS_THUMBNAILS: Record<string, string> = {
    'is-dual-column-zebra-card': `<svg viewBox="0 0 120 75" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <rect x="2" y="2" width="116" height="71" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
  <path d="M2 6C2 3.79086 3.79086 2 6 2H114C116.209 2 118 3.79086 118 6V18H2V6Z" fill="#0f172a"/>
  <rect x="6" y="6" width="22" height="6" rx="2" fill="#2563eb"/>
  <rect x="32" y="7" width="46" height="4" rx="1.5" fill="#ffffff"/>
  <rect x="94" y="8" width="18" height="3" rx="1" fill="#94a3b8"/>
  <rect x="2" y="18" width="116" height="13" fill="#f8fafc"/>
  <line x1="2" y1="31" x2="118" y2="31" stroke="#e2e8f0" stroke-width="0.8"/>
  <line x1="42" y1="18" x2="42" y2="31" stroke="#e2e8f0" stroke-width="0.8"/>
  <rect x="6" y="22" width="24" height="4" rx="1" fill="#0f172a"/>
  <rect x="48" y="22" width="50" height="4" rx="1" fill="#64748b"/>
  <rect x="2" y="31" width="116" height="13" fill="#ffffff"/>
  <line x1="2" y1="44" x2="118" y2="44" stroke="#e2e8f0" stroke-width="0.8"/>
  <line x1="42" y1="31" x2="42" y2="44" stroke="#e2e8f0" stroke-width="0.8"/>
  <rect x="6" y="35" width="28" height="4" rx="1" fill="#0f172a"/>
  <rect x="48" y="35" width="42" height="4" rx="1" fill="#64748b"/>
  <rect x="2" y="44" width="116" height="13" fill="#f8fafc"/>
  <line x1="2" y1="57" x2="118" y2="57" stroke="#e2e8f0" stroke-width="0.8"/>
  <line x1="42" y1="44" x2="42" y2="57" stroke="#e2e8f0" stroke-width="0.8"/>
  <rect x="6" y="48" width="20" height="4" rx="1" fill="#0f172a"/>
  <rect x="48" y="48" width="48" height="4" rx="1" fill="#64748b"/>
  <rect x="2" y="57" width="116" height="15" rx="0 0 4 4" fill="#ffffff"/>
  <line x1="42" y1="57" x2="42" y2="72" stroke="#e2e8f0" stroke-width="0.8"/>
  <rect x="6" y="62" width="22" height="4" rx="1" fill="#0f172a"/>
  <rect x="48" y="62" width="36" height="4" rx="1" fill="#64748b"/>
</svg>`,

    'is-two-column-card-grid': `<svg viewBox="0 0 120 75" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <rect x="2" y="2" width="116" height="71" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2"/>
  <circle cx="8" cy="10" r="2.5" fill="#2563eb"/>
  <rect x="14" y="8" width="28" height="4" rx="1" fill="#2563eb"/>
  <rect x="46" y="8" width="45" height="4" rx="1" fill="#0f172a"/>
  <rect x="6" y="18" width="51" height="23" rx="3" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
  <rect x="10" y="22" width="18" height="3" rx="1" fill="#94a3b8"/>
  <rect x="10" y="28" width="32" height="5" rx="1.5" fill="#0f172a"/>
  <circle cx="51" cy="23" r="1.5" fill="#2563eb" fill-opacity="0.6"/>
  <rect x="63" y="18" width="51" height="23" rx="3" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
  <rect x="67" y="22" width="16" height="3" rx="1" fill="#94a3b8"/>
  <rect x="67" y="28" width="34" height="5" rx="1.5" fill="#0f172a"/>
  <circle cx="108" cy="23" r="1.5" fill="#2563eb" fill-opacity="0.6"/>
  <rect x="6" y="45" width="51" height="23" rx="3" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
  <rect x="10" y="49" width="16" height="3" rx="1" fill="#94a3b8"/>
  <rect x="10" y="55" width="28" height="5" rx="1.5" fill="#0f172a"/>
  <rect x="63" y="45" width="51" height="23" rx="3" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
  <rect x="67" y="49" width="20" height="3" rx="1" fill="#94a3b8"/>
  <rect x="67" y="55" width="30" height="5" rx="1.5" fill="#0f172a"/>
</svg>`,

    'is-industrial-blueprint-matrix': `<svg viewBox="0 0 120 75" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <rect x="2" y="2" width="116" height="71" rx="4" fill="#0c1a2e" stroke="#1e3a5f" stroke-width="1.5"/>
  <path d="M2 5C2 3.34315 3.34315 2 5 2H115C116.657 2 118 3.34315 118 5V16H2V5Z" fill="#07111e"/>
  <line x1="2" y1="16" x2="118" y2="16" stroke="#1e3a5f" stroke-width="1"/>
  <rect x="6" y="5" width="38" height="3" rx="1" fill="#38bdf8"/>
  <rect x="6" y="10" width="56" height="3.5" rx="1" fill="#ffffff"/>
  <rect x="96" y="6" width="18" height="5" rx="1" fill="#081322" stroke="#1e3a5f" stroke-width="0.6"/>
  <rect x="6" y="20" width="51" height="21" fill="#081322" stroke="#1e3a5f" stroke-width="0.8"/>
  <rect x="6" y="20" width="2" height="21" fill="#38bdf8"/>
  <rect x="11" y="23" width="16" height="2.5" fill="#64748b"/>
  <rect x="42" y="23" width="11" height="2" fill="#38bdf8"/>
  <rect x="11" y="29" width="36" height="4" fill="#e0f2fe"/>
  <rect x="63" y="20" width="51" height="21" fill="#081322" stroke="#1e3a5f" stroke-width="0.8"/>
  <rect x="63" y="20" width="2" height="21" fill="#38bdf8"/>
  <rect x="68" y="23" width="16" height="2.5" fill="#64748b"/>
  <rect x="99" y="23" width="11" height="2" fill="#38bdf8"/>
  <rect x="68" y="29" width="34" height="4" fill="#e0f2fe"/>
  <rect x="6" y="44" width="51" height="20" fill="#081322" stroke="#1e3a5f" stroke-width="0.8"/>
  <rect x="6" y="44" width="2" height="20" fill="#38bdf8"/>
  <rect x="11" y="47" width="16" height="2.5" fill="#64748b"/>
  <rect x="11" y="53" width="32" height="4" fill="#e0f2fe"/>
  <rect x="63" y="44" width="51" height="20" fill="#081322" stroke="#1e3a5f" stroke-width="0.8"/>
  <rect x="63" y="44" width="2" height="20" fill="#38bdf8"/>
  <rect x="68" y="47" width="16" height="2.5" fill="#64748b"/>
  <rect x="68" y="53" width="30" height="4" fill="#e0f2fe"/>
  <line x1="2" y1="67" x2="118" y2="67" stroke="#1e3a5f" stroke-width="0.8"/>
  <rect x="6" y="69.5" width="40" height="2" fill="#64748b"/>
  <rect x="90" y="69.5" width="24" height="2" fill="#38bdf8"/>
</svg>`,

    'is-boutique-hairline-editorial': `<svg viewBox="0 0 120 75" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <rect x="2" y="2" width="116" height="71" rx="4" fill="#ffffff" stroke="#e4e4e7" stroke-width="1.2"/>
  <rect x="6" y="8" width="22" height="2.5" rx="0.5" fill="#71717a"/>
  <rect x="6" y="14" width="30" height="6" rx="1" fill="#18181b"/>
  <rect x="6" y="22" width="24" height="5" rx="1" fill="#18181b"/>
  <line x1="6" y1="31" x2="18" y2="31" stroke="#18181b" stroke-width="1.2"/>
  <rect x="6" y="36" width="30" height="3" fill="#a1a1aa"/>
  <rect x="6" y="41" width="26" height="3" fill="#d4d4d8"/>
  <rect x="6" y="54" width="28" height="8" rx="2" fill="#ffffff" stroke="#e4e4e7" stroke-width="0.8"/>
  <rect x="10" y="57" width="20" height="2.5" fill="#18181b"/>
  <line x1="42" y1="6" x2="42" y2="68" stroke="#e4e4e7" stroke-width="1"/>
  <rect x="48" y="10" width="18" height="3" fill="#71717a"/>
  <rect x="90" y="10" width="22" height="3.5" fill="#18181b"/>
  <line x1="48" y1="18" x2="114" y2="18" stroke="#f4f4f5" stroke-width="0.8"/>
  <rect x="48" y="24" width="14" height="3" fill="#71717a"/>
  <rect x="84" y="24" width="28" height="3.5" fill="#18181b"/>
  <line x1="48" y1="32" x2="114" y2="32" stroke="#f4f4f5" stroke-width="0.8"/>
  <rect x="48" y="38" width="22" height="3" fill="#71717a"/>
  <rect x="88" y="38" width="24" height="3.5" fill="#18181b"/>
  <line x1="48" y1="46" x2="114" y2="46" stroke="#f4f4f5" stroke-width="0.8"/>
  <rect x="48" y="52" width="16" height="3" fill="#71717a"/>
  <rect x="86" y="52" width="26" height="3.5" fill="#18181b"/>
  <line x1="48" y1="60" x2="114" y2="60" stroke="#f4f4f5" stroke-width="0.8"/>
</svg>`,

    'is-stamped-manifest-ledger': `<svg viewBox="0 0 120 75" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <rect x="2" y="2" width="116" height="71" rx="4" fill="#fffefb" stroke="#d6d3d1" stroke-width="1.5"/>
  <rect x="2" y="2" width="116" height="11" fill="#f5f5f4"/>
  <line x1="2" y1="13" x2="118" y2="13" stroke="#a8a29e" stroke-dasharray="2,2" stroke-width="0.8"/>
  <text x="6" y="9" font-size="5" fill="#78716c" font-family="monospace">✂ WAYBILL-DOCKET #88392</text>
  <rect x="6" y="17" width="26" height="2.5" fill="#78716c"/>
  <rect x="6" y="22" width="55" height="4.5" fill="#1c1917"/>
  <g fill="#a8a29e">
    <rect x="6" y="29" width="1.5" height="6"/>
    <rect x="9" y="29" width="2.5" height="6"/>
    <rect x="13" y="29" width="1" height="6"/>
    <rect x="15" y="29" width="3" height="6"/>
    <rect x="20" y="29" width="1" height="6"/>
    <rect x="23" y="29" width="2" height="6"/>
    <rect x="27" y="29" width="1" height="6"/>
    <rect x="30" y="29" width="3" height="6"/>
  </g>
  <g transform="rotate(-6 100 24)">
    <rect x="82" y="16" width="30" height="15" rx="2" fill="none" stroke="#b91c1c" stroke-width="1.2"/>
    <rect x="86" y="19" width="22" height="2" fill="#b91c1c"/>
    <rect x="84" y="23" width="26" height="3" fill="#b91c1c"/>
    <rect x="88" y="28" width="18" height="1.5" fill="#b91c1c"/>
  </g>
  <line x1="6" y1="38" x2="114" y2="38" stroke="#d6d3d1" stroke-width="0.8"/>
  <text x="6" y="46" font-size="4.5" fill="#78716c" font-family="monospace">#01</text>
  <rect x="18" y="42" width="24" height="3.5" fill="#57534e"/>
  <rect x="58" y="42" width="48" height="3.5" fill="#1c1917"/>
  <line x1="6" y1="49" x2="114" y2="49" stroke="#e7e5e4" stroke-dasharray="1.5,1.5" stroke-width="0.6"/>
  <text x="6" y="57" font-size="4.5" fill="#78716c" font-family="monospace">#02</text>
  <rect x="18" y="53" width="20" height="3.5" fill="#57534e"/>
  <rect x="58" y="53" width="40" height="3.5" fill="#1c1917"/>
  <line x1="6" y1="60" x2="114" y2="60" stroke="#e7e5e4" stroke-dasharray="1.5,1.5" stroke-width="0.6"/>
  <text x="6" y="68" font-size="4.5" fill="#78716c" font-family="monospace">#03</text>
  <rect x="18" y="64" width="26" height="3.5" fill="#57534e"/>
  <rect x="58" y="64" width="35" height="3.5" fill="#1c1917"/>
</svg>`,

    'is-pill-tag-cluster': `<svg viewBox="0 0 120 75" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <rect x="2" y="2" width="116" height="71" rx="4" fill="#ffffff" stroke="#ede9fe" stroke-width="1.2"/>
  <rect x="6" y="7" width="28" height="6" rx="2" fill="#f3eeff"/>
  <rect x="10" y="9" width="20" height="2.5" fill="#7530fb"/>
  <rect x="38" y="8" width="48" height="4.5" rx="1" fill="#0f172a"/>
  <rect x="6" y="18" width="50" height="14" rx="7" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8"/>
  <path d="M6 25C6 21.134 9.13401 18 13 18H26V32H13C9.13401 32 6 28.866 6 25Z" fill="#f1f5f9"/>
  <rect x="10" y="23.5" width="12" height="3" fill="#475569"/>
  <rect x="30" y="23.5" width="20" height="3" fill="#0f172a"/>
  <rect x="60" y="18" width="54" height="14" rx="7" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8"/>
  <path d="M60 25C60 21.134 63.134 18 67 18H80V32H67C63.134 32 60 28.866 60 25Z" fill="#f1f5f9"/>
  <rect x="64" y="23.5" width="12" height="3" fill="#475569"/>
  <rect x="84" y="23.5" width="24" height="3" fill="#0f172a"/>
  <rect x="6" y="36" width="56" height="14" rx="7" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8"/>
  <path d="M6 43C6 39.134 9.13401 36 13 36H28V50H13C9.13401 50 6 46.866 6 43Z" fill="#f1f5f9"/>
  <rect x="10" y="41.5" width="14" height="3" fill="#475569"/>
  <rect x="32" y="41.5" width="24" height="3" fill="#0f172a"/>
  <rect x="66" y="36" width="48" height="14" rx="7" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8"/>
  <path d="M66 43C66 39.134 69.134 36 73 36H84V50H73C69.134 50 66 46.866 66 43Z" fill="#f1f5f9"/>
  <rect x="70" y="41.5" width="10" height="3" fill="#475569"/>
  <rect x="88" y="41.5" width="20" height="3" fill="#0f172a"/>
  <rect x="6" y="54" width="48" height="14" rx="7" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8"/>
  <path d="M6 61C6 57.134 9.13401 54 13 54H24V68H13C9.13401 68 6 64.866 6 61Z" fill="#f1f5f9"/>
  <rect x="10" y="59.5" width="10" height="3" fill="#475569"/>
  <rect x="28" y="59.5" width="20" height="3" fill="#0f172a"/>
  <rect x="58" y="54" width="56" height="14" rx="7" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8"/>
  <path d="M58 61C58 57.134 61.134 54 65 54H78V68H65C61.134 68 58 64.866 58 61Z" fill="#f1f5f9"/>
  <rect x="62" y="59.5" width="12" height="3" fill="#475569"/>
  <rect x="82" y="59.5" width="26" height="3" fill="#0f172a"/>
</svg>`,

    'is-dark-terminal-console': `<svg viewBox="0 0 120 75" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <rect x="2" y="2" width="116" height="71" rx="4" fill="#070b12" stroke="#1e293b" stroke-width="1.2"/>
  <path d="M2 5C2 3.34315 3.34315 2 5 2H115C116.657 2 118 3.34315 118 5V14H2V5Z" fill="#0f172a"/>
  <line x1="2" y1="14" x2="118" y2="14" stroke="#1e293b" stroke-width="0.8"/>
  <circle cx="7" cy="8" r="2" fill="#ef4444"/>
  <circle cx="13" cy="8" r="2" fill="#f59e0b"/>
  <circle cx="19" cy="8" r="2" fill="#10b981"/>
  <rect x="26" y="6.5" width="38" height="3" rx="0.5" fill="#64748b"/>
  <circle cx="106" cy="8" r="1.5" fill="#10b981"/>
  <rect x="110" y="6.5" width="4" height="3" rx="0.5" fill="#10b981"/>
  <rect x="6" y="18" width="55" height="3.5" rx="0.5" fill="#06b6d4"/>
  <rect x="6" y="25" width="51" height="20" rx="2" fill="#0c1322" stroke="#1e293b" stroke-width="0.8"/>
  <rect x="6" y="25" width="51" height="2" fill="#06b6d4"/>
  <rect x="10" y="29" width="18" height="2.5" fill="#06b6d4"/>
  <rect x="42" y="29" width="11" height="2" fill="#10b981"/>
  <rect x="10" y="34.5" width="36" height="4.5" fill="#f8fafc"/>
  <rect x="10" y="41" width="22" height="1.5" fill="#334155"/>
  <rect x="63" y="25" width="51" height="20" rx="2" fill="#0c1322" stroke="#1e293b" stroke-width="0.8"/>
  <rect x="63" y="25" width="51" height="2" fill="#06b6d4"/>
  <rect x="67" y="29" width="18" height="2.5" fill="#06b6d4"/>
  <rect x="99" y="29" width="11" height="2" fill="#10b981"/>
  <rect x="67" y="34.5" width="34" height="4.5" fill="#f8fafc"/>
  <rect x="67" y="41" width="22" height="1.5" fill="#334155"/>
  <rect x="6" y="48" width="51" height="18" rx="2" fill="#0c1322" stroke="#1e293b" stroke-width="0.8"/>
  <rect x="6" y="48" width="51" height="2" fill="#06b6d4"/>
  <rect x="10" y="52" width="16" height="2.5" fill="#06b6d4"/>
  <rect x="10" y="57.5" width="30" height="4" fill="#f8fafc"/>
  <rect x="63" y="48" width="51" height="18" rx="2" fill="#0c1322" stroke="#1e293b" stroke-width="0.8"/>
  <rect x="63" y="48" width="51" height="2" fill="#06b6d4"/>
  <rect x="67" y="52" width="16" height="2.5" fill="#06b6d4"/>
  <rect x="67" y="57.5" width="28" height="4" fill="#f8fafc"/>
  <line x1="2" y1="68" x2="118" y2="68" stroke="#1e293b" stroke-width="0.8"/>
  <rect x="6" y="70" width="35" height="2" fill="#475569"/>
  <rect x="95" y="70" width="19" height="2" fill="#06b6d4"/>
</svg>`,

    'is-split-key-highlight-card': `<svg viewBox="0 0 120 75" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <rect x="2" y="2" width="116" height="71" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2"/>
  <rect x="6" y="7" width="52" height="4.5" rx="1" fill="#0f172a"/>
  <rect x="6" y="16" width="51" height="25" rx="3" fill="#eff6ff" stroke="#3b82f6" stroke-width="1"/>
  <rect x="10" y="20" width="18" height="3" rx="0.5" fill="#2563eb"/>
  <rect x="10" y="26" width="36" height="7" rx="1" fill="#0f172a"/>
  <rect x="63" y="16" width="51" height="25" rx="3" fill="#f0fdf4" stroke="#16a34a" stroke-width="1"/>
  <rect x="67" y="20" width="18" height="3" rx="0.5" fill="#16a34a"/>
  <rect x="67" y="26" width="38" height="7" rx="1" fill="#0f172a"/>
  <rect x="6" y="45" width="108" height="23" rx="2" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8"/>
  <rect x="7" y="46" width="106" height="10" fill="#f8fafc"/>
  <line x1="6" y1="56" x2="114" y2="56" stroke="#e2e8f0" stroke-width="0.6"/>
  <rect x="10" y="49.5" width="22" height="3" fill="#64748b"/>
  <rect x="48" y="49.5" width="46" height="3.5" fill="#0f172a"/>
  <rect x="10" y="60.5" width="24" height="3" fill="#64748b"/>
  <rect x="48" y="60.5" width="40" height="3.5" fill="#0f172a"/>
</svg>`,

    'is-compact-three-column-strip': `<svg viewBox="0 0 120 75" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <rect x="2" y="2" width="116" height="71" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2"/>
  <path d="M2 5C2 3.34315 3.34315 2 5 2H115C116.657 2 118 3.34315 118 5V16H2V5Z" fill="#f1f5f9"/>
  <line x1="2" y1="16" x2="118" y2="16" stroke="#e2e8f0" stroke-width="0.8"/>
  <rect x="6" y="6" width="22" height="4" rx="1" fill="#0284c7"/>
  <rect x="32" y="6" width="48" height="4" rx="1" fill="#0f172a"/>
  <rect x="2" y="16" width="116" height="26" fill="#f8fafc"/>
  <line x1="2" y1="42" x2="118" y2="42" stroke="#e2e8f0" stroke-width="0.8"/>
  <rect x="6" y="21" width="16" height="3" fill="#64748b"/>
  <rect x="6" y="28" width="24" height="5" fill="#0f172a"/>
  <line x1="40" y1="16" x2="40" y2="42" stroke="#e2e8f0" stroke-width="0.8"/>
  <rect x="44" y="21" width="18" height="3" fill="#64748b"/>
  <rect x="44" y="28" width="26" height="5" fill="#0f172a"/>
  <line x1="78" y1="16" x2="78" y2="42" stroke="#e2e8f0" stroke-width="0.8"/>
  <rect x="82" y="21" width="14" height="3" fill="#64748b"/>
  <rect x="82" y="28" width="28" height="5" fill="#0f172a"/>
  <rect x="2" y="42" width="116" height="31" rx="0 0 4 4" fill="#ffffff"/>
  <rect x="6" y="48" width="14" height="3" fill="#64748b"/>
  <rect x="6" y="55" width="22" height="5" fill="#0f172a"/>
  <line x1="40" y1="42" x2="40" y2="72" stroke="#e2e8f0" stroke-width="0.8"/>
  <rect x="44" y="48" width="16" height="3" fill="#64748b"/>
  <rect x="44" y="55" width="24" height="5" fill="#0f172a"/>
  <line x1="78" y1="42" x2="78" y2="72" stroke="#e2e8f0" stroke-width="0.8"/>
  <rect x="82" y="48" width="18" height="3" fill="#64748b"/>
  <rect x="82" y="55" width="25" height="5" fill="#0f172a"/>
</svg>`,

    'is-luxury-gold-accent-band': `<svg viewBox="0 0 120 75" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <rect x="2" y="2" width="116" height="71" rx="4" fill="#09090b" stroke="#d4af37" stroke-width="1.5"/>
  <rect x="4.5" y="4.5" width="111" height="66" rx="2" fill="none" stroke="#d4af37" stroke-width="0.6" stroke-opacity="0.4"/>
  <rect x="5" y="5" width="110" height="17" fill="#141416"/>
  <line x1="5" y1="22" x2="115" y2="22" stroke="#d4af37" stroke-width="0.8"/>
  <circle cx="60" cy="10" r="1.5" fill="#d4af37"/>
  <rect x="36" y="9" width="48" height="2" fill="#d4af37"/>
  <rect x="25" y="14" width="70" height="4" rx="0.5" fill="#ffffff"/>
  <rect x="8" y="26" width="49" height="19" fill="#121214" stroke="#27272a" stroke-width="0.8"/>
  <rect x="8" y="26" width="2" height="19" fill="#d4af37"/>
  <text x="12" y="32" font-size="4" fill="#d4af37" font-family="serif">I.</text>
  <rect x="18" y="29" width="18" height="2.5" fill="#d4af37"/>
  <circle cx="51" cy="30" r="1" fill="#d4af37"/>
  <rect x="12" y="36" width="36" height="4.5" fill="#fafafa"/>
  <rect x="63" y="26" width="49" height="19" fill="#121214" stroke="#27272a" stroke-width="0.8"/>
  <rect x="63" y="26" width="2" height="19" fill="#d4af37"/>
  <text x="67" y="32" font-size="4" fill="#d4af37" font-family="serif">II.</text>
  <rect x="74" y="29" width="18" height="2.5" fill="#d4af37"/>
  <circle cx="106" cy="30" r="1" fill="#d4af37"/>
  <rect x="67" y="36" width="34" height="4.5" fill="#fafafa"/>
  <rect x="8" y="47" width="49" height="14" fill="#121214" stroke="#27272a" stroke-width="0.8"/>
  <rect x="8" y="47" width="2" height="14" fill="#d4af37"/>
  <text x="12" y="53" font-size="4" fill="#d4af37" font-family="serif">III.</text>
  <rect x="20" y="50" width="16" height="2.5" fill="#d4af37"/>
  <rect x="12" y="55" width="32" height="4" fill="#fafafa"/>
  <rect x="63" y="47" width="49" height="14" fill="#121214" stroke="#27272a" stroke-width="0.8"/>
  <rect x="63" y="47" width="2" height="14" fill="#d4af37"/>
  <text x="67" y="53" font-size="4" fill="#d4af37" font-family="serif">IV.</text>
  <rect x="76" y="50" width="16" height="2.5" fill="#d4af37"/>
  <rect x="67" y="55" width="30" height="4" fill="#fafafa"/>
  <line x1="5" y1="63" x2="115" y2="63" stroke="#27272a" stroke-width="0.8"/>
  <rect x="8" y="65.5" width="38" height="2.5" fill="#d4af37"/>
  <rect x="80" y="65.5" width="32" height="2" fill="#a1a1aa"/>
</svg>`,
}

export function getItemSpecificsThumbnailSvg(id: string): string {
    const clean = id
        .toLowerCase()
        .trim()
        .replace(/^is[-_]/, '')
        .replace(/^item[-_]/, '')
        .replace(/^specifics[-_]/, '')
        .replace(/_/g, '-')

    const key = Object.keys(ITEM_SPECIFICS_THUMBNAILS).find(k => {
        const kClean = k
            .toLowerCase()
            .replace(/^is[-_]/, '')
            .replace(/^item[-_]/, '')
            .replace(/^specifics[-_]/, '')
            .replace(/_/g, '-')
        return k === id || kClean === clean || k.endsWith(clean) || clean.includes(kClean)
    })

    return key ? ITEM_SPECIFICS_THUMBNAILS[key] : ITEM_SPECIFICS_THUMBNAILS['is-dual-column-zebra-card']
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported Variant Registry (All 10 Radically Distinct Architectures)
// ─────────────────────────────────────────────────────────────────────────────
export const itemSpecificsVariants: BlockVariant[] = [
    {
        id: 'is-dual-column-zebra-card',
        label: 'Executive Zebra Card',
        description: 'Corporate 2-column alternating zebra table with rounded frame and dark header',
        thumbnail: ITEM_SPECIFICS_THUMBNAILS['is-dual-column-zebra-card'],
        toHtml(props, id) { return dualColumnZebraCard(props, id) },
    },
    {
        id: 'is-two-column-card-grid',
        label: '2-Column Bento Grid',
        description: 'Modern 2-column bento micro-card spec grid for tech, gadgets and audio',
        thumbnail: ITEM_SPECIFICS_THUMBNAILS['is-two-column-card-grid'],
        toHtml(props, id) { return twoColumnCardGrid(props, id) },
    },
    {
        id: 'is-industrial-blueprint-matrix',
        label: 'Industrial Blueprint',
        description: 'CAD / Schematic blueprint matrix with coordinate ticks & modular parameter blocks',
        thumbnail: ITEM_SPECIFICS_THUMBNAILS['is-industrial-blueprint-matrix'],
        toHtml(props, id) { return industrialBlueprintMatrix(props, id) },
    },
    {
        id: 'is-boutique-hairline-editorial',
        label: 'Scandinavian Hairline',
        description: 'Asymmetrical Scandinavian fashion magazine editorial split with vertical feature spine',
        thumbnail: ITEM_SPECIFICS_THUMBNAILS['is-boutique-hairline-editorial'],
        toHtml(props, id) { return boutiqueHairlineEditorial(props, id) },
    },
    {
        id: 'is-stamped-manifest-ledger',
        label: 'Vintage Stamped Manifest',
        description: 'Authentic courier waybill manifest ticket with perforated cut line & inspector stamp',
        thumbnail: ITEM_SPECIFICS_THUMBNAILS['is-stamped-manifest-ledger'],
        toHtml(props, id) { return stampedManifestLedger(props, id) },
    },
    {
        id: 'is-pill-tag-cluster',
        label: 'Pill Tag Cluster',
        description: 'Ergonomic dual-tone capsule pill badge cluster for lightning-fast mobile scan',
        thumbnail: ITEM_SPECIFICS_THUMBNAILS['is-pill-tag-cluster'],
        toHtml(props, id) { return pillTagCluster(props, id) },
    },
    {
        id: 'is-dark-terminal-console',
        label: 'Dark Cyber Console',
        description: 'Modular Cyber Diagnostics Telemetry HUD with hex addresses & telemetry cards',
        thumbnail: ITEM_SPECIFICS_THUMBNAILS['is-dark-terminal-console'],
        toHtml(props, id) { return darkTerminalConsole(props, id) },
    },
    {
        id: 'is-split-key-highlight-card',
        label: 'Hero Spec Highlight Split',
        description: 'Top primary specs in prominent hero boxes with secondary details below',
        thumbnail: ITEM_SPECIFICS_THUMBNAILS['is-split-key-highlight-card'],
        toHtml(props, id) { return splitKeyHighlightCard(props, id) },
    },
    {
        id: 'is-compact-three-column-strip',
        label: '3-Column Compact Strip',
        description: 'High-density 3-column quick-scan matrix for large catalogs and multi-attributes',
        thumbnail: ITEM_SPECIFICS_THUMBNAILS['is-compact-three-column-strip'],
        toHtml(props, id) { return compactThreeColumnStrip(props, id) },
    },
    {
        id: 'is-luxury-gold-accent-band',
        label: 'Luxury Gold Provenance',
        description: 'Official Atelier Certificate of Provenance Dossier with double gold plaque frame',
        thumbnail: ITEM_SPECIFICS_THUMBNAILS['is-luxury-gold-accent-band'],
        toHtml(props, id) { return luxuryGoldAccentBand(props, id) },
    },
]

// Backwards-compatible aliases
export const specificsVariants = itemSpecificsVariants

/**
 * Robust Variant Resolver:
 * Supports variant IDs with or without the 'is-', 'item-', or 'specs-' prefix
 * and matches shorthand IDs seamlessly.
 */
export function getItemSpecificsVariant(id: string): BlockVariant {
    if (!id) return itemSpecificsVariants[0]
    const clean = id
        .toLowerCase()
        .trim()
        .replace(/^is[-_]/, '')
        .replace(/^item[-_]/, '')
        .replace(/^specifics[-_]/, '')
        .replace(/_/g, '-')

    const match = itemSpecificsVariants.find(v => {
        const vClean = v.id
            .toLowerCase()
            .replace(/^is[-_]/, '')
            .replace(/^item[-_]/, '')
            .replace(/^specifics[-_]/, '')
            .replace(/_/g, '-')

        return (
            v.id === id ||
            vClean === clean ||
            v.id.endsWith(clean) ||
            clean.includes(vClean) ||
            vClean.includes(clean)
        )
    })

    return match ?? itemSpecificsVariants[0]
}

export const getSpecificsVariant = getItemSpecificsVariant
