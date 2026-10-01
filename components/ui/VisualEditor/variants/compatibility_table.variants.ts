// components/ui/VisualEditor/variants/compatibility_table.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Compatibility Table — 10 Radically Distinct, High-Converting Retail Layouts
// Built specifically for high-converting eBay & e-commerce listings.
// Zero generic AI-slop, zero cheesy glassmorphism, zero fake neon glows.
// 100% authentic, tangible, battle-tested retail architectures that buyers trust.
//
// 1. compat-classic-zebra-table       — Current classic zebra checkmark table (KEPT 100% IDENTICAL)
// 2. compat-automotive-parts-fitment  — eBay Motors 4-column OEM fitment matrix with VIN check guarantee
// 3. compat-device-multi-gen-chips   — Consumer electronics multi-generation bento device grid
// 4. compat-split-guarantee-sidebar   — 35/65 split: seller fitment assurance pledge + verified model ledger
// 5. compat-stepped-compatibility-checklist — Stepped technical clearance & series tier cards (Tech/PC/Audio)
// 6. compat-industrial-schematic-ledger— CAD blueprint dark slate ledger with OEM cross-reference & part #s
// 7. compat-minimal-hairline-directory— Scandinavian minimalist hairline directory with wide tracking
// 8. compat-console-gaming-platform-ribbon — Multi-platform gaming & audio compatibility matrix (PC/PS/Xbox/Switch)
// 9. compat-oem-cross-reference-ledger— Appliance & replacement parts cross-reference interchangeable numbers
// 10. compat-compact-horizontal-pill-strip— High-density mobile thumb-scan pill capsule strip for rapid browsing
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
    id: string
    label: string
    description: string
    thumbnail?: string
    toHtml: (props: any, id: string) => string
}

// ─── Shared Helpers & Dynamic Resolvers ─────────────────────────────────────

function pad(p: any, defaultT = 16, defaultR = 24, defaultB = 16, defaultL = 24): string {
    const top = p.paddingTop ?? defaultT
    const right = p.paddingRight ?? defaultR
    const bottom = p.paddingBottom ?? defaultB
    const left = p.paddingLeft ?? defaultL
    return `padding:${top}px ${right}px ${bottom}px ${left}px;`
}

function font(p: any, defaultFamily = 'Arial, Helvetica, sans-serif'): string {
    return p.fontFamily ? `${p.fontFamily}, Arial, sans-serif` : defaultFamily
}

export interface CompatibilityItem {
    model: string
    years?: string
    make?: string
    submodel?: string
    notes?: string
    status?: boolean | string
    partNumber?: string
    platform?: string
}

const DEFAULT_COMPATIBILITY_ITEMS: CompatibilityItem[] = [
    { model: 'Model A', years: '2019–2023', make: 'Universal', submodel: 'Standard & Sport', notes: 'Direct Replacement', status: true, partNumber: 'OEM-49102-A', platform: 'Universal' },
    { model: 'Model B', years: '2020–2024', make: 'Universal', submodel: 'All Trims', notes: 'Plug & Play Fitment', status: true, partNumber: 'OEM-49103-B', platform: 'Direct Fit' },
    { model: 'Model C Pro', years: 'All Years', make: 'Universal', submodel: 'Pro / Performance', notes: 'Full Hardware Included', status: true, partNumber: 'OEM-51000-C', platform: 'Pro Series' },
    { model: 'Model D Mini', years: '2021+', make: 'Universal', submodel: 'Compact / Facelift', notes: 'Verified Factory Spec', status: true, partNumber: 'OEM-52210-D', platform: 'Gen 2' },
]

function getCompatItems(p: any): CompatibilityItem[] {
    // Check for various possible property formats
    const raw = p.items ?? p.models ?? p.compatibilityList ?? p.list ?? p.rows
    if (Array.isArray(raw) && raw.length > 0) {
        return raw.map((item: any) => {
            if (typeof item === 'string') {
                return { model: item, years: '', notes: '100% Compatible', status: true }
            }
            return {
                model: item.model ?? item.name ?? item.title ?? 'Supported Model',
                years: item.years ?? item.year ?? '',
                make: item.make ?? item.brand ?? '',
                submodel: item.submodel ?? item.trim ?? '',
                notes: item.notes ?? item.note ?? item.description ?? 'Direct Fit',
                status: item.status !== false,
                partNumber: item.partNumber ?? item.mpn ?? item.oem ?? '',
                platform: item.platform ?? item.category ?? '',
            }
        })
    }

    // If provided as a string with newlines
    if (typeof p.content === 'string' && p.content.trim()) {
        const lines = p.content.split('\n').map((l: string) => l.trim()).filter(Boolean)
        if (lines.length > 0) {
            return lines.map((l: string) => ({ model: l, years: '', notes: 'Compatible', status: true }))
        }
    }

    return DEFAULT_COMPATIBILITY_ITEMS
}

function tableHeading(p: any, fallback = 'Compatible With:'): string {
    return p.titleText ?? p.heading ?? p.title ?? fallback
}

function resolveBg(p: any, fallback = '#ffffff'): string {
    return p.bgColor ?? p.backgroundColor ?? fallback
}

function resolveText(p: any, fallback = '#1e1535'): string {
    return p.textColor ?? fallback
}

function resolveAccent(p: any, fallback = '#16a34a'): string {
    return p.accentColor ?? fallback
}

function resolveHeaderBg(p: any, fallback = '#1e1535'): string {
    return p.headerBg ?? p.headerBackground ?? fallback
}

function resolveHeaderText(p: any, fallback = '#ffffff'): string {
    return p.headerText ?? p.headerTextColor ?? fallback
}

function resolveAltRowBg(p: any, fallback = '#f8f7ff'): string {
    return p.altRowBg ?? p.altRowBackground ?? fallback
}

function resolveBorder(p: any, fallback = '#ede9fe'): string {
    return p.borderColor ?? p.borderColour ?? fallback
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLASSIC ZEBRA CHECKMARK TABLE (CURRENT STYLE — 100% KEPT IDENTICAL)
// Header with checkmark icon and alternating zebra rows with green checks
// ─────────────────────────────────────────────────────────────────────────────
function classicZebraTable(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#ffffff')
    const borderCol = resolveBorder(p, '#ede9fe')
    const altBg = resolveAltRowBg(p, '#f0fdf4') // Light green tint as seen in canvas
    const heading = tableHeading(p, 'Compatible With:')
    const items = getCompatItems(p)

    const rowsHtml = items.map((item, i) => {
        const isAlt = i % 2 === 0
        const rowBg = isAlt ? altBg : '#ffffff'
        const fullText = item.years ? `${item.model} ${item.years}` : item.model

        return `
      <tr style="background-color:${rowBg};border-bottom:1px solid ${borderCol};">
        <td width="48" align="center" valign="middle" style="padding:10px 14px;color:#16a34a;font-size:16px;font-weight:700;">
          &#10003;
        </td>
        <td valign="middle" style="padding:10px 14px;font-family:${f};font-size:14px;color:#1e1535;font-weight:600;">
          ${fullText}
        </td>
      </tr>`
    }).join('')

    return `<!--[riazify:compatibility_table:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 24, 16, 24)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="border:1px solid ${borderCol};border-radius:6px;border-collapse:separate;overflow:hidden;background-color:#ffffff;">
        <!-- Header -->
        <tr style="background-color:#ffffff;border-bottom:1.5px solid ${borderCol};">
          <td colspan="2" style="padding:12px 16px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td valign="middle" style="padding-right:8px;">
                  <div style="width:20px;height:20px;background-color:#16a34a;border-radius:4px;text-align:center;line-height:20px;color:#ffffff;font-size:13px;font-weight:900;">
                    &#10003;
                  </div>
                </td>
                <td valign="middle" style="font-family:Arial,sans-serif;font-size:15px;font-weight:800;color:#1e1535;">
                  ${heading}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Rows -->
        ${rowsHtml}
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:compatibility_table:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. EBAY MOTORS OEM FITMENT MATRIX
// 4-Column automotive parts table with VIN guarantee callout banner
// ─────────────────────────────────────────────────────────────────────────────
function automotivePartsFitment(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#ffffff')
    const darkNavy = '#0f172a'
    const royalBlue = '#1d4ed8'
    const heading = tableHeading(p, 'VEHICLE COMPATIBILITY & FITMENT GUIDE')
    const items = getCompatItems(p)

    const rowsHtml = items.map((item, i) => {
        const isAlt = i % 2 === 1
        const rowBg = isAlt ? '#f8fafc' : '#ffffff'
        const yrs = item.years || '2018–2024'
        const sub = item.submodel || 'All Trims'

        return `
      <tr style="background-color:${rowBg};border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#0f172a;">
          ${item.model}
        </td>
        <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:12px;color:#475569;font-weight:600;">
          ${yrs}
        </td>
        <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:12px;color:#475569;">
          ${sub}
        </td>
        <td align="right" style="padding:10px 14px;">
          <span style="display:inline-block;padding:3px 8px;background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;font-family:Arial,sans-serif;font-size:10px;font-weight:800;color:#059669;letter-spacing:0.5px;text-transform:uppercase;">
            ✓ DIRECT OEM FIT
          </span>
        </td>
      </tr>`
    }).join('')

    return `<!--[riazify:compatibility_table:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="border:1.5px solid #cbd5e1;border-radius:8px;border-collapse:separate;overflow:hidden;background-color:#ffffff;box-shadow:0 3px 10px rgba(15,23,42,0.04);">
        <!-- Top Institutional Header -->
        <tr style="background-color:${darkNavy};">
          <td colspan="4" style="padding:14px 18px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="left">
                  <div style="display:inline-block;padding:3px 8px;background-color:${royalBlue};border-radius:3px;font-family:Arial,sans-serif;font-size:10px;font-weight:800;color:#ffffff;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">
                    100% GUARANTEED FITMENT
                  </div>
                  <div style="font-family:Arial,sans-serif;font-size:15px;font-weight:900;color:#ffffff;letter-spacing:0.3px;">
                    ${heading}
                  </div>
                </td>
                <td align="right" style="font-family:Arial,sans-serif;font-size:11px;color:#94a3b8;font-weight:600;">
                  VIN VERIFIED &bull; ISO/TS CERTIFIED
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Column Headers -->
        <tr style="background-color:#f1f5f9;border-bottom:1.5px solid #cbd5e1;">
          <th align="left" style="padding:9px 14px;font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:#334155;text-transform:uppercase;letter-spacing:0.5px;">MAKE &amp; MODEL</th>
          <th align="left" style="padding:9px 14px;font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:#334155;text-transform:uppercase;letter-spacing:0.5px;">YEARS</th>
          <th align="left" style="padding:9px 14px;font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:#334155;text-transform:uppercase;letter-spacing:0.5px;">TRIM / ENGINE</th>
          <th align="right" style="padding:9px 14px;font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:#334155;text-transform:uppercase;letter-spacing:0.5px;">FITMENT STATUS</th>
        </tr>
        <!-- Body Rows -->
        ${rowsHtml}
        <!-- Bottom VIN Callout -->
        <tr style="background-color:#eff6ff;">
          <td colspan="4" style="padding:11px 16px;border-top:1.5px solid #bfdbfe;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-family:Arial,sans-serif;font-size:12px;color:#1e40af;font-weight:700;">
                  🚗 <strong>Unsure about your exact fitment?</strong> Message us your VIN or Registration number — our automotive specialists confirm within 10 minutes!
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:compatibility_table:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CONSUMER ELECTRONICS MULTI-GENERATION BENTO DEVICE GRID
// Visual 2-column micro-card bento grid for phone cases, chargers, audio & tech
// ─────────────────────────────────────────────────────────────────────────────
function deviceMultiGenChips(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#ffffff')
    const heading = tableHeading(p, 'Supported Devices & Generations')
    const items = getCompatItems(p)

    const cardsHtml = items.map((item) => {
        const yrs = item.years ? `(${item.years})` : ''
        const sub = item.notes || 'Full Support'

        return `
      <td width="50%" valign="top" style="padding:6px;box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="background-color:#f8fafc;border:1.5px solid #e2e8f0;border-radius:8px;padding:12px 14px;box-sizing:border-box;">
          <tr>
            <td valign="top" width="28">
              <div style="width:24px;height:24px;background-color:#0284c7;border-radius:6px;text-align:center;line-height:24px;color:#ffffff;font-size:12px;font-weight:900;">
                &#10003;
              </div>
            </td>
            <td valign="top" style="padding-left:10px;">
              <div style="font-family:Arial,sans-serif;font-size:14px;font-weight:800;color:#0f172a;line-height:1.3;">
                ${item.model}
              </div>
              <div style="font-family:Arial,sans-serif;font-size:11px;color:#64748b;margin-top:3px;font-weight:600;">
                ${yrs} &bull; ${sub}
              </div>
              <div style="margin-top:6px;">
                <span style="display:inline-block;padding:2px 7px;background-color:#dbeafe;border-radius:12px;font-family:Arial,sans-serif;font-size:10px;font-weight:800;color:#1d4ed8;letter-spacing:0.3px;">
                  TESTED &amp; VERIFIED
                </span>
              </div>
            </td>
          </tr>
        </table>
      </td>`
    })

    // Group into 2-per-row
    let gridRows = ''
    for (let i = 0; i < cardsHtml.length; i += 2) {
        gridRows += `<tr>${cardsHtml[i]}${cardsHtml[i + 1] ?? '<td width="50%"></td>'}</tr>`
    }

    return `<!--[riazify:compatibility_table:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <!-- Header -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
        <tr>
          <td align="left">
            <span style="display:inline-block;padding:4px 10px;background-color:#f0f9ff;border:1px solid #bae6fd;border-radius:20px;font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:#0284c7;letter-spacing:0.5px;text-transform:uppercase;">
              DEVICE COMPATIBILITY
            </span>
            <div style="font-family:Arial,sans-serif;font-size:17px;font-weight:900;color:#0f172a;margin-top:4px;">
              ${heading}
            </div>
          </td>
          <td align="right" valign="bottom">
            <span style="font-family:Arial,sans-serif;font-size:11px;color:#64748b;font-weight:700;">
              PRECISE 1:1 FIT GUARANTEED
            </span>
          </td>
        </tr>
      </table>

      <!-- 2-Column Bento Cards -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${gridRows}
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:compatibility_table:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. 35/65 SPLIT: SELLER FITMENT ASSURANCE PLEDGE + VERIFIED MODEL LEDGER
// Converts skeptical buyers by answering doubts and offering proactive assistance
// ─────────────────────────────────────────────────────────────────────────────
function splitGuaranteeSidebar(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#ffffff')
    const darkNavy = '#0f172a'
    const emerald = '#16a34a'
    const heading = tableHeading(p, 'Confirmed Fitment Models')
    const items = getCompatItems(p)

    const listItemsHtml = items.map((item, i) => {
        const isLast = i === items.length - 1
        const yrs = item.years ? ` &bull; ${item.years}` : ''

        return `
      <div style="padding:10px 12px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:6px;margin-bottom:${isLast ? '0' : '8px'};">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td valign="middle" width="24" style="color:${emerald};font-size:15px;font-weight:900;">
              &#10003;
            </td>
            <td valign="middle" style="font-family:Arial,sans-serif;font-size:13px;font-weight:800;color:#0f172a;">
              ${item.model}
            </td>
            <td align="right" valign="middle" style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#64748b;">
              ${item.notes || '100% Tested'}${yrs}
            </td>
          </tr>
        </table>
      </div>`
    }).join('')

    return `<!--[riazify:compatibility_table:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="border:1.5px solid #cbd5e1;border-radius:10px;border-collapse:separate;overflow:hidden;background-color:#f8fafc;">
        <tr>
          <!-- Left 35% Assurance Pledge -->
          <td width="35%" valign="top" style="background-color:${darkNavy};padding:22px 18px;color:#ffffff;box-sizing:border-box;">
            <div style="display:inline-block;padding:3px 8px;background-color:#16a34a;border-radius:3px;font-family:Arial,sans-serif;font-size:10px;font-weight:900;color:#ffffff;letter-spacing:0.8px;text-transform:uppercase;">
              FIT GUARANTEE
            </div>
            <div style="font-family:Arial,sans-serif;font-size:18px;font-weight:900;color:#ffffff;margin-top:8px;line-height:1.2;">
              Guaranteed Exact Fitment
            </div>
            <div style="font-family:${f};font-size:12px;color:#cbd5e1;margin-top:10px;line-height:1.6;">
              Every unit listed has undergone physical measurement and direct mounting verification.
            </div>
            <div style="margin-top:16px;padding-top:14px;border-top:1px solid #334155;font-family:Arial,sans-serif;font-size:11px;color:#94a3b8;line-height:1.5;">
              💬 <strong>Don't see your model?</strong><br>
              Contact our product team via eBay messaging. We reply with fitment verification within hours.
            </div>
          </td>
          <!-- Right 65% Model Ledger -->
          <td width="65%" valign="top" style="padding:18px 20px;box-sizing:border-box;">
            <div style="font-family:Arial,sans-serif;font-size:14px;font-weight:900;color:#0f172a;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;">
              ${heading}
            </div>
            ${listItemsHtml}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:compatibility_table:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. STEPPED TECHNICAL CLEARANCE & SERIES TIER CARDS
// Engineered for technical accessories, computer hardware, RAM, power adapters
// ─────────────────────────────────────────────────────────────────────────────
function steppedChecklistCards(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#ffffff')
    const heading = tableHeading(p, 'Technical Compatibility & Hardware Support')
    const items = getCompatItems(p)

    const stepsHtml = items.map((item, i) => {
        const num = (i + 1).toString().padStart(2, '0')
        const yrs = item.years ? `Year Range: ${item.years} &bull; ` : ''

        return `
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:#ffffff;border:1px solid #e2e8f0;border-left:4px solid #7c3aed;border-radius:0 6px 6px 0;margin-bottom:10px;box-shadow:0 1px 4px rgba(0,0,0,0.02);">
        <tr>
          <td width="44" align="center" valign="middle" style="background-color:#faf5ff;border-right:1px solid #f3e8ff;font-family:Arial,sans-serif;font-size:14px;font-weight:900;color:#7c3aed;">
            ${num}
          </td>
          <td style="padding:12px 16px;">
            <div style="font-family:Arial,sans-serif;font-size:14px;font-weight:800;color:#1e1b4b;">
              ${item.model}
            </div>
            <div style="font-family:Arial,sans-serif;font-size:11px;color:#6b7280;margin-top:2px;">
              ${yrs}${item.notes || 'Full pin & voltage compatibility'}
            </div>
          </td>
          <td align="right" valign="middle" style="padding-right:16px;">
            <span style="display:inline-block;padding:3px 9px;background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;font-family:Arial,sans-serif;font-size:10px;font-weight:800;color:#059669;">
              ✓ VERIFIED
            </span>
          </td>
        </tr>
      </table>`
    }).join('')

    return `<!--[riazify:compatibility_table:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <div style="margin-bottom:14px;">
        <span style="display:inline-block;padding:3px 9px;background-color:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;font-family:Arial,sans-serif;font-size:10px;font-weight:800;color:#7c3aed;letter-spacing:0.5px;text-transform:uppercase;">
          SYSTEM SPECIFICATIONS
        </span>
        <div style="font-family:Arial,sans-serif;font-size:17px;font-weight:900;color:#1e1b4b;margin-top:4px;">
          ${heading}
        </div>
      </div>
      ${stepsHtml}
    </td>
  </tr>
</table>
<!--[/riazify:compatibility_table:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. CAD BLUEPRINT TECHNICAL LEDGER
// Dark slate schematic aesthetic with OEM part numbers for tools & machinery
// ─────────────────────────────────────────────────────────────────────────────
function industrialSchematicLedger(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#090d16')
    const cyan = '#06b6d4'
    const amber = '#f59e0b'
    const heading = tableHeading(p, 'TECHNICAL FITMENT SPECIFICATION & OEM MATRIX')
    const items = getCompatItems(p)

    const rowsHtml = items.map((item, i) => {
        const isAlt = i % 2 === 1
        const rowBg = isAlt ? '#0d1322' : '#090d16'
        const partNum = item.partNumber || `OEM-SPEC-${8410 + i}`

        return `
      <tr style="background-color:${rowBg};border-bottom:1px solid #1e293b;">
        <td style="padding:10px 14px;font-family:'Courier New',Courier,monospace;font-size:12px;font-weight:700;color:#f8fafc;">
          ${item.model}
        </td>
        <td style="padding:10px 14px;font-family:'Courier New',Courier,monospace;font-size:11px;color:${cyan};">
          ${partNum}
        </td>
        <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:11px;color:#94a3b8;">
          ${item.years || 'All Revisions'} &bull; ${item.notes || 'Direct Mount'}
        </td>
        <td align="right" style="padding:10px 14px;">
          <span style="font-family:'Courier New',Courier,monospace;font-size:10px;font-weight:700;color:#10b981;letter-spacing:1px;">
            [PASSED]
          </span>
        </td>
      </tr>`
    }).join('')

    return `<!--[riazify:compatibility_table:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};border:1.5px solid #1e293b;border-radius:6px;box-shadow:0 4px 15px rgba(0,0,0,0.4);">
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <!-- Technical Title Bar -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;border-bottom:1px solid #1e293b;padding-bottom:10px;">
        <tr>
          <td>
            <div style="font-family:'Courier New',Courier,monospace;font-size:10px;font-weight:700;color:${amber};letter-spacing:1.5px;">
              // SCHEMATIC FITMENT DIRECTORY &bull; REV 4.2
            </div>
            <div style="font-family:'Courier New',Courier,monospace;font-size:14px;font-weight:900;color:#f8fafc;letter-spacing:0.5px;margin-top:2px;">
              ${heading}
            </div>
          </td>
          <td align="right" valign="top">
            <span style="display:inline-block;padding:2px 8px;background-color:#1e293b;border:1px solid #334155;border-radius:3px;font-family:'Courier New',Courier,monospace;font-size:10px;color:#94a3b8;">
              TOLERANCE: &plusmn;0.02mm
            </span>
          </td>
        </tr>
      </table>

      <!-- CAD Data Table -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #1e293b;border-collapse:collapse;">
        <tr style="background-color:#0f172a;border-bottom:1.5px solid #334155;">
          <th align="left" style="padding:8px 14px;font-family:'Courier New',Courier,monospace;font-size:10px;color:#94a3b8;letter-spacing:1px;">EQUIPMENT / MODEL</th>
          <th align="left" style="padding:8px 14px;font-family:'Courier New',Courier,monospace;font-size:10px;color:#94a3b8;letter-spacing:1px;">CROSS REF #</th>
          <th align="left" style="padding:8px 14px;font-family:'Courier New',Courier,monospace;font-size:10px;color:#94a3b8;letter-spacing:1px;">APPLICATION NOTES</th>
          <th align="right" style="padding:8px 14px;font-family:'Courier New',Courier,monospace;font-size:10px;color:#94a3b8;letter-spacing:1px;">DIAGNOSTIC</th>
        </tr>
        ${rowsHtml}
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:compatibility_table:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. SCANDINAVIAN MINIMALIST HAIRLINE DIRECTORY
// Architectural elegance for designer decor, high-end audio, camera accessories
// ─────────────────────────────────────────────────────────────────────────────
function minimalHairlineDirectory(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#ffffff')
    const heading = tableHeading(p, 'Compatibility Index')
    const items = getCompatItems(p)

    const rowsHtml = items.map((item) => {
        const yrs = item.years ? `(${item.years})` : ''

        return `
      <tr style="border-bottom:1px solid #e4e4e7;">
        <td style="padding:12px 8px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#18181b;">
          ${item.model}
        </td>
        <td style="padding:12px 8px;font-family:Arial,sans-serif;font-size:12px;color:#71717a;">
          ${yrs} ${item.notes || 'Full Compatibility'}
        </td>
        <td align="right" style="padding:12px 8px;">
          <span style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:1px;font-weight:700;color:#18181b;text-transform:uppercase;">
            &bull; Verified
          </span>
        </td>
      </tr>`
    }).join('')

    return `<!--[riazify:compatibility_table:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 20, 24, 20, 24)}box-sizing:border-box;">
      <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;color:#71717a;text-transform:uppercase;margin-bottom:4px;">
        Curated Fitment
      </div>
      <div style="font-family:Arial,sans-serif;font-size:18px;font-weight:800;color:#18181b;letter-spacing:0.5px;padding-bottom:12px;border-bottom:2px solid #18181b;margin-bottom:4px;">
        ${heading}
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        ${rowsHtml}
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:compatibility_table:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. MULTI-PLATFORM GAMING & AUDIO MATRIX
// Gaming headsets, controllers, capture cards, racing wheels, cables
// ─────────────────────────────────────────────────────────────────────────────
function gamingPlatformRibbon(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#ffffff')
    const darkNavy = '#0a0e17'
    const purple = '#8b5cf6'
    const heading = tableHeading(p, 'MULTI-PLATFORM COMPATIBILITY MATRIX')
    const items = getCompatItems(p)

    const badges = [
        { name: 'PC / WINDOWS', col: '#0284c7' },
        { name: 'PLAYSTATION 5 / 4', col: '#2563eb' },
        { name: 'XBOX SERIES X / S', col: '#16a34a' },
        { name: 'NINTENDO SWITCH', col: '#dc2626' },
    ]

    const badgesHtml = badges.map(b => `
    <td align="center" style="padding:4px 6px;">
      <div style="padding:6px 10px;background-color:#1e293b;border:1px solid #334155;border-radius:4px;font-family:Arial,sans-serif;font-size:10px;font-weight:800;color:#f8fafc;letter-spacing:0.5px;">
        <span style="color:${b.col};margin-right:4px;">●</span>${b.name}
      </div>
    </td>`).join('')

    const rowsHtml = items.map((item, i) => {
        const isAlt = i % 2 === 1
        const rowBg = isAlt ? '#0f172a' : '#0a0e17'

        return `
      <tr style="background-color:${rowBg};border-bottom:1px solid #1e293b;">
        <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;font-weight:800;color:#ffffff;">
          ${item.model}
        </td>
        <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:12px;color:#94a3b8;">
          ${item.notes || 'Plug & Play (Zero Drivers Required)'}
        </td>
        <td align="right" style="padding:10px 14px;">
          <span style="display:inline-block;padding:2px 8px;background-color:#312e81;border:1px solid #4338ca;border-radius:10px;font-family:Arial,sans-serif;font-size:10px;font-weight:800;color:#a5b4fc;">
            ✓ 100% READY
          </span>
        </td>
      </tr>`
    }).join('')

    return `<!--[riazify:compatibility_table:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="border:1.5px solid #1e293b;border-radius:8px;border-collapse:separate;overflow:hidden;background-color:${darkNavy};box-shadow:0 4px 16px rgba(0,0,0,0.3);">
        <!-- Title Bar -->
        <tr>
          <td style="padding:14px 16px;border-bottom:1px solid #1e293b;">
            <div style="font-family:Arial,sans-serif;font-size:10px;font-weight:900;color:${purple};letter-spacing:1px;text-transform:uppercase;">
              CROSS-PLATFORM CERTIFIED
            </div>
            <div style="font-family:Arial,sans-serif;font-size:16px;font-weight:900;color:#ffffff;letter-spacing:0.3px;margin-top:2px;">
              ${heading}
            </div>
          </td>
        </tr>
        <!-- Platform Badges Row -->
        <tr style="background-color:#0f172a;border-bottom:1.5px solid #1e293b;">
          <td style="padding:8px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                ${badgesHtml}
              </tr>
            </table>
          </td>
        </tr>
        <!-- Rows -->
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${rowsHtml}
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:compatibility_table:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. APPLIANCE & REPLACEMENT PARTS OEM CROSS-REFERENCE LEDGER
// For vacuum cleaners, lawn mowers, printer ink, appliance motors & filters
// ─────────────────────────────────────────────────────────────────────────────
function oemCrossReferenceLedger(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#ffffff')
    const borderCol = '#cbd5e1'
    const heading = tableHeading(p, 'Interchangeable Part Numbers & Model Cross-Reference')
    const items = getCompatItems(p)

    const rowsHtml = items.map((item, i) => {
        const isAlt = i % 2 === 1
        const rowBg = isAlt ? '#f8fafc' : '#ffffff'
        const partNum = item.partNumber || `WP-${9100 + i * 15}`

        return `
      <tr style="background-color:${rowBg};border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;font-weight:800;color:#0f172a;">
          ${item.model}
        </td>
        <td style="padding:10px 14px;font-family:'Courier New',Courier,monospace;font-size:12px;font-weight:700;color:#b91c1c;">
          ${partNum}
        </td>
        <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:12px;color:#475569;">
          ${item.notes || 'Exact OEM Equivalent Spec'}
        </td>
        <td align="right" style="padding:10px 14px;">
          <span style="display:inline-block;padding:3px 8px;background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:4px;font-family:Arial,sans-serif;font-size:10px;font-weight:800;color:#1d4ed8;">
            DIRECT REPLACEMENT
          </span>
        </td>
      </tr>`
    }).join('')

    return `<!--[riazify:compatibility_table:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="border:1.5px solid ${borderCol};border-radius:8px;border-collapse:separate;overflow:hidden;background-color:#ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
        <!-- Header -->
        <tr style="background-color:#f8fafc;border-bottom:1.5px solid ${borderCol};">
          <td colspan="4" style="padding:14px 16px;">
            <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:#b91c1c;letter-spacing:0.8px;text-transform:uppercase;">
              OEM INTERCHANGE DIRECTORY
            </div>
            <div style="font-family:Arial,sans-serif;font-size:15px;font-weight:900;color:#0f172a;margin-top:2px;">
              ${heading}
            </div>
          </td>
        </tr>
        <!-- Table Column Headers -->
        <tr style="background-color:#f1f5f9;border-bottom:1.5px solid ${borderCol};">
          <th align="left" style="padding:9px 14px;font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:#475569;text-transform:uppercase;">APPLIANCE / MODEL</th>
          <th align="left" style="padding:9px 14px;font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:#475569;text-transform:uppercase;">REPLACES PART #</th>
          <th align="left" style="padding:9px 14px;font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:#475569;text-transform:uppercase;">SPECIFICATION</th>
          <th align="right" style="padding:9px 14px;font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:#475569;text-transform:uppercase;">INTERCHANGE</th>
        </tr>
        ${rowsHtml}
        <!-- Bottom Verification Bar -->
        <tr style="background-color:#fffbeb;">
          <td colspan="4" style="padding:10px 16px;border-top:1px solid #fef3c7;font-family:Arial,sans-serif;font-size:11px;color:#92400e;font-weight:700;">
            🔍 Tip: Press Ctrl + F (or Cmd + F on Mac) to quickly search your exact model or part number on this page.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:compatibility_table:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. HIGH-DENSITY MOBILE THUMB-SCAN PILL STRIP
// Ultra-compact capsule badge layout taking minimal vertical screen height
// ─────────────────────────────────────────────────────────────────────────────
function compactHorizontalPillStrip(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#ffffff')
    const heading = tableHeading(p, 'Compatible With')
    const items = getCompatItems(p)

    const pillsHtml = items.map((item) => {
        const yrs = item.years ? ` <span style="color:#64748b;font-weight:600;">(${item.years})</span>` : ''

        return `
      <span style="display:inline-block;margin:3px 4px;padding:6px 12px;background-color:#ffffff;border:1.5px solid #cbd5e1;border-radius:20px;font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:#0f172a;box-shadow:0 1px 3px rgba(0,0,0,0.03);">
        <span style="color:#16a34a;margin-right:4px;">✓</span>${item.model}${yrs}
      </span>`
    }).join('')

    return `<!--[riazify:compatibility_table:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 12, 16, 12, 16)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:#f8fafc;border:1.5px solid #e2e8f0;border-radius:8px;padding:12px 14px;box-sizing:border-box;">
        <tr>
          <td>
            <!-- Header Tag -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
              <tr>
                <td align="left">
                  <span style="display:inline-block;padding:3px 8px;background-color:#16a34a;border-radius:3px;font-family:Arial,sans-serif;font-size:10px;font-weight:900;color:#ffffff;letter-spacing:0.5px;text-transform:uppercase;">
                    ✓ CONFIRMED FITMENT
                  </span>
                  <span style="margin-left:8px;font-family:Arial,sans-serif;font-size:14px;font-weight:900;color:#0f172a;">
                    ${heading}
                  </span>
                </td>
                <td align="right">
                  <span style="font-family:Arial,sans-serif;font-size:10px;color:#64748b;font-weight:700;">
                    0-MODIFICATION DIRECT FIT
                  </span>
                </td>
              </tr>
            </table>
            <!-- Pills Cluster -->
            <div style="line-height:1.8;">
              ${pillsHtml}
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:compatibility_table:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Thumbnail Representations for Visual Editor Carousel & Panels
// (Exact match for viewBox="0 0 80 48" style={{ width: '100%', height: 36 }})
// ─────────────────────────────────────────────────────────────────────────────

export const COMPATIBILITY_TABLE_THUMBNAILS: Record<string, string> = {
    // 1. Classic Zebra Checkmark Table
    'compat-classic-zebra-table': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#ede9fe" stroke-width="1"/>
    {/* Header */}
    <rect x="5" y="4" width="7" height="7" rx="1.5" fill="#16a34a"/>
    <rect x="15" y="5.5" width="30" height="4" fill="#1e1535"/>
    <line x1="0" y1="13" x2="80" y2="13" stroke="#ede9fe" stroke-width="0.8"/>
    {/* Alternating Rows */}
    <rect x="0" y="13" width="80" height="8" fill="#f0fdf4"/>
    <line x1="5" y1="17" x2="8" y2="17" stroke="#16a34a" stroke-width="1.2"/>
    <line x1="15" y1="17" x2="52" y2="17" stroke="#1e1535" stroke-width="1.2"/>
    <line x1="0" y1="21" x2="80" y2="21" stroke="#ede9fe" stroke-width="0.8"/>
    <line x1="5" y1="25" x2="8" y2="25" stroke="#16a34a" stroke-width="1.2"/>
    <line x1="15" y1="25" x2="48" y2="25" stroke="#1e1535" stroke-width="1.2"/>
    <line x1="0" y1="29" x2="80" y2="29" stroke="#ede9fe" stroke-width="0.8"/>
    <rect x="0" y="29" width="80" height="8" fill="#f0fdf4"/>
    <line x1="5" y1="33" x2="8" y2="33" stroke="#16a34a" stroke-width="1.2"/>
    <line x1="15" y1="33" x2="55" y2="33" stroke="#1e1535" stroke-width="1.2"/>
    <line x1="0" y1="37" x2="80" y2="37" stroke="#ede9fe" stroke-width="0.8"/>
    <line x1="5" y1="41" x2="8" y2="41" stroke="#16a34a" stroke-width="1.2"/>
    <line x1="15" y1="41" x2="45" y2="41" stroke="#1e1535" stroke-width="1.2"/>
  </svg>`,

    // 2. Automotive Parts Fitment
    'compat-automotive-parts-fitment': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect width="80" height="10" fill="#0f172a"/>
    <rect x="4" y="3.5" width="22" height="3" fill="#1d4ed8"/>
    <rect x="30" y="3.5" width="34" height="3" fill="#ffffff"/>
    <rect y="10" width="80" height="6" fill="#f1f5f9"/>
    <line x1="4" y1="13" x2="16" y2="13" stroke="#475569" stroke-width="1"/>
    <line x1="24" y1="13" x2="36" y2="13" stroke="#475569" stroke-width="1"/>
    <line x1="44" y1="13" x2="56" y2="13" stroke="#475569" stroke-width="1"/>
    <line x1="64" y1="13" x2="76" y2="13" stroke="#475569" stroke-width="1"/>
    {/* Rows */}
    <line x1="4" y1="21" x2="20" y2="21" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="24" y1="21" x2="34" y2="21" stroke="#64748b" stroke-width="1.2"/>
    <rect x="62" y="18" width="14" height="5" rx="1" fill="#ecfdf5"/>
    <line x1="0" y1="25" x2="80" y2="25" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="4" y1="30" x2="22" y2="30" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="24" y1="30" x2="36" y2="30" stroke="#64748b" stroke-width="1.2"/>
    <rect x="62" y="27" width="14" height="5" rx="1" fill="#ecfdf5"/>
    {/* Bottom VIN Bar */}
    <rect y="37" width="80" height="11" fill="#eff6ff"/>
    <line x1="4" y1="42.5" x2="70" y2="42.5" stroke="#1e40af" stroke-width="1.2"/>
  </svg>`,

    // 3. Consumer Tech Multi-Gen Chips
    'compat-device-multi-gen-chips': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="4" y="3" width="24" height="4" rx="2" fill="#0284c7"/>
    <rect x="32" y="3" width="30" height="4" fill="#0f172a"/>
    {/* 4 Micro Cards */}
    <rect x="4" y="10" width="34" height="16" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="7" y="13" width="5" height="5" rx="1" fill="#0284c7"/>
    <line x1="15" y1="14" x2="32" y2="14" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="15" y1="18" x2="28" y2="18" stroke="#64748b" stroke-width="0.8"/>
    <rect x="42" y="10" width="34" height="16" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="45" y="13" width="5" height="5" rx="1" fill="#0284c7"/>
    <line x1="53" y1="14" x2="70" y2="14" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="53" y1="18" x2="66" y2="18" stroke="#64748b" stroke-width="0.8"/>
    <rect x="4" y="28" width="34" height="16" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="7" y="31" width="5" height="5" rx="1" fill="#0284c7"/>
    <line x1="15" y1="32" x2="32" y2="32" stroke="#0f172a" stroke-width="1.2"/>
    <rect x="42" y="28" width="34" height="16" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="45" y="31" width="5" height="5" rx="1" fill="#0284c7"/>
    <line x1="53" y1="32" x2="70" y2="32" stroke="#0f172a" stroke-width="1.2"/>
  </svg>`,

    // 4. Split Guarantee Sidebar
    'compat-split-guarantee-sidebar': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    {/* Left Navy Column */}
    <rect width="28" height="48" fill="#0f172a"/>
    <rect x="3" y="6" width="16" height="3" rx="0.5" fill="#16a34a"/>
    <rect x="3" y="12" width="22" height="4" fill="#ffffff"/>
    <line x1="3" y1="20" x2="23" y2="20" stroke="#94a3b8" stroke-width="0.8"/>
    <line x1="3" y1="24" x2="20" y2="24" stroke="#94a3b8" stroke-width="0.8"/>
    <line x1="3" y1="34" x2="24" y2="34" stroke="#334155" stroke-width="0.8"/>
    {/* Right Ledger */}
    <rect x="33" y="6" width="32" height="3" fill="#0f172a"/>
    <rect x="32" y="13" width="44" height="9" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.7"/>
    <line x1="36" y1="17.5" x2="68" y2="17.5" stroke="#0f172a" stroke-width="1.2"/>
    <rect x="32" y="24" width="44" height="9" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.7"/>
    <line x1="36" y1="28.5" x2="65" y2="28.5" stroke="#0f172a" stroke-width="1.2"/>
    <rect x="32" y="35" width="44" height="9" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.7"/>
    <line x1="36" y1="39.5" x2="60" y2="39.5" stroke="#0f172a" stroke-width="1.2"/>
  </svg>`,

    // 5. Stepped Technical Clearance & Series Cards
    'compat-stepped-compatibility-checklist': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="4" y="3" width="20" height="3.5" rx="1" fill="#7c3aed"/>
    <rect x="28" y="3" width="30" height="3.5" fill="#1e1b4b"/>
    {/* Stepped Cards */}
    <rect x="4" y="9" width="72" height="10" rx="1" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="4" y="9" width="3" height="10" fill="#7c3aed"/>
    <line x1="12" y1="14" x2="42" y2="14" stroke="#1e1b4b" stroke-width="1.2"/>
    <rect x="60" y="11" width="13" height="6" rx="2" fill="#ecfdf5"/>
    <rect x="4" y="21" width="72" height="10" rx="1" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="4" y="21" width="3" height="10" fill="#7c3aed"/>
    <line x1="12" y1="26" x2="45" y2="26" stroke="#1e1b4b" stroke-width="1.2"/>
    <rect x="60" y="23" width="13" height="6" rx="2" fill="#ecfdf5"/>
    <rect x="4" y="33" width="72" height="10" rx="1" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="4" y="33" width="3" height="10" fill="#7c3aed"/>
    <line x1="12" y1="38" x2="38" y2="38" stroke="#1e1b4b" stroke-width="1.2"/>
    <rect x="60" y="35" width="13" height="6" rx="2" fill="#ecfdf5"/>
  </svg>`,

    // 6. CAD Blueprint Technical Ledger
    'compat-industrial-schematic-ledger': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#090d16" stroke="#1e293b" stroke-width="1"/>
    <line x1="4" y1="4" x2="26" y2="4" stroke="#f59e0b" stroke-width="1.2"/>
    <line x1="4" y1="8" x2="48" y2="8" stroke="#f8fafc" stroke-width="1.5"/>
    <line x1="0" y1="13" x2="80" y2="13" stroke="#1e293b" stroke-width="0.8"/>
    {/* Table rows */}
    <rect y="13" width="80" height="5" fill="#0f172a"/>
    <line x1="4" y1="15.5" x2="20" y2="15.5" stroke="#94a3b8" stroke-width="0.8"/>
    <line x1="30" y1="15.5" x2="50" y2="15.5" stroke="#94a3b8" stroke-width="0.8"/>
    <line x1="0" y1="18" x2="80" y2="18" stroke="#1e293b" stroke-width="0.8"/>
    <line x1="4" y1="24" x2="24" y2="24" stroke="#f8fafc" stroke-width="1.2"/>
    <line x1="30" y1="24" x2="52" y2="24" stroke="#06b6d4" stroke-width="1"/>
    <line x1="68" y1="24" x2="76" y2="24" stroke="#10b981" stroke-width="1.2"/>
    <line x1="0" y1="29" x2="80" y2="29" stroke="#1e293b" stroke-width="0.8"/>
    <line x1="4" y1="35" x2="22" y2="35" stroke="#f8fafc" stroke-width="1.2"/>
    <line x1="30" y1="35" x2="50" y2="35" stroke="#06b6d4" stroke-width="1"/>
    <line x1="68" y1="35" x2="76" y2="35" stroke="#10b981" stroke-width="1.2"/>
    <line x1="0" y1="40" x2="80" y2="40" stroke="#1e293b" stroke-width="0.8"/>
    <line x1="4" y1="44" x2="26" y2="44" stroke="#f8fafc" stroke-width="1.2"/>
  </svg>`,

    // 7. Minimal Hairline Directory
    'compat-minimal-hairline-directory': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e4e4e7" stroke-width="1"/>
    <line x1="6" y1="6" x2="24" y2="6" stroke="#71717a" stroke-width="1"/>
    <line x1="6" y1="12" x2="42" y2="12" stroke="#18181b" stroke-width="1.5"/>
    <line x1="6" y1="16" x2="74" y2="16" stroke="#18181b" stroke-width="1"/>
    {/* Rows */}
    <line x1="6" y1="23" x2="30" y2="23" stroke="#18181b" stroke-width="1.2"/>
    <line x1="38" y1="23" x2="60" y2="23" stroke="#71717a" stroke-width="1"/>
    <circle cx="72" cy="23" r="1.5" fill="#18181b"/>
    <line x1="6" y1="28" x2="74" y2="28" stroke="#e4e4e7" stroke-width="0.8"/>
    <line x1="6" y1="35" x2="28" y2="35" stroke="#18181b" stroke-width="1.2"/>
    <line x1="38" y1="35" x2="56" y2="35" stroke="#71717a" stroke-width="1"/>
    <circle cx="72" cy="35" r="1.5" fill="#18181b"/>
    <line x1="6" y1="40" x2="74" y2="40" stroke="#e4e4e7" stroke-width="0.8"/>
  </svg>`,

    // 8. Gaming Platform Ribbon
    'compat-console-gaming-platform-ribbon': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#0a0e17" stroke="#1e293b" stroke-width="1"/>
    <line x1="4" y1="5" x2="24" y2="5" stroke="#8b5cf6" stroke-width="1.2"/>
    <line x1="4" y1="9" x2="48" y2="9" stroke="#ffffff" stroke-width="1.5"/>
    {/* Badges Bar */}
    <rect y="13" width="80" height="9" fill="#0f172a"/>
    <rect x="4" y="15" width="16" height="5" rx="1" fill="#1e293b"/>
    <circle cx="6" cy="17.5" r="1" fill="#0284c7"/>
    <rect x="23" y="15" width="16" height="5" rx="1" fill="#1e293b"/>
    <circle cx="25" cy="17.5" r="1" fill="#2563eb"/>
    <rect x="42" y="15" width="16" height="5" rx="1" fill="#1e293b"/>
    <circle cx="44" cy="17.5" r="1" fill="#16a34a"/>
    <rect x="61" y="15" width="16" height="5" rx="1" fill="#1e293b"/>
    <circle cx="63" cy="17.5" r="1" fill="#dc2626"/>
    {/* Rows */}
    <line x1="4" y1="28" x2="30" y2="28" stroke="#ffffff" stroke-width="1.2"/>
    <line x1="36" y1="28" x2="60" y2="28" stroke="#94a3b8" stroke-width="1"/>
    <line x1="0" y1="34" x2="80" y2="34" stroke="#1e293b" stroke-width="0.8"/>
    <line x1="4" y1="41" x2="28" y2="41" stroke="#ffffff" stroke-width="1.2"/>
    <line x1="36" y1="41" x2="58" y2="41" stroke="#94a3b8" stroke-width="1"/>
  </svg>`,

    // 9. OEM Cross Reference Ledger
    'compat-oem-cross-reference-ledger': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect width="80" height="9" fill="#f8fafc"/>
    <line x1="4" y1="4" x2="20" y2="4" stroke="#b91c1c" stroke-width="1"/>
    <line x1="4" y1="7" x2="44" y2="7" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="0" y1="9" x2="80" y2="9" stroke="#cbd5e1" stroke-width="0.8"/>
    {/* Table Headers */}
    <rect y="9" width="80" height="6" fill="#f1f5f9"/>
    <line x1="4" y1="12" x2="18" y2="12" stroke="#475569" stroke-width="0.8"/>
    <line x1="26" y1="12" x2="42" y2="12" stroke="#475569" stroke-width="0.8"/>
    {/* Rows */}
    <line x1="4" y1="21" x2="22" y2="21" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="26" y1="21" x2="46" y2="21" stroke="#b91c1c" stroke-width="1.2"/>
    <rect x="58" y="18" width="18" height="5" rx="1" fill="#eff6ff"/>
    <line x1="0" y1="26" x2="80" y2="26" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="4" y1="32" x2="20" y2="32" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="26" y1="32" x2="44" y2="32" stroke="#b91c1c" stroke-width="1.2"/>
    <rect x="58" y="29" width="18" height="5" rx="1" fill="#eff6ff"/>
    {/* Bottom Tip */}
    <rect y="38" width="80" height="10" fill="#fffbeb"/>
    <line x1="4" y1="43" x2="68" y2="43" stroke="#92400e" stroke-width="1"/>
  </svg>`,

    // 10. Mobile Compact Horizontal Pill Strip
    'compat-compact-horizontal-pill-strip': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    {/* Header Strip */}
    <rect x="4" y="4" width="22" height="4.5" rx="1.5" fill="#16a34a"/>
    <rect x="30" y="4" width="28" height="4.5" rx="1" fill="#0f172a"/>
    {/* Pill Badges */}
    <rect x="4" y="13" width="34" height="9" rx="4.5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <line x1="8" y1="17.5" x2="11" y2="17.5" stroke="#16a34a" stroke-width="1.2"/>
    <line x1="14" y1="17.5" x2="32" y2="17.5" stroke="#0f172a" stroke-width="1.2"/>
    <rect x="42" y="13" width="34" height="9" rx="4.5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <line x1="46" y1="17.5" x2="49" y2="17.5" stroke="#16a34a" stroke-width="1.2"/>
    <line x1="52" y1="17.5" x2="70" y2="17.5" stroke="#0f172a" stroke-width="1.2"/>
    <rect x="4" y="26" width="36" height="9" rx="4.5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <line x1="8" y1="30.5" x2="11" y2="30.5" stroke="#16a34a" stroke-width="1.2"/>
    <line x1="14" y1="30.5" x2="34" y2="30.5" stroke="#0f172a" stroke-width="1.2"/>
    <rect x="44" y="26" width="32" height="9" rx="4.5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <line x1="48" y1="30.5" x2="51" y2="30.5" stroke="#16a34a" stroke-width="1.2"/>
    <line x1="54" y1="30.5" x2="70" y2="30.5" stroke="#0f172a" stroke-width="1.2"/>
    <rect x="4" y="38" width="40" height="6" rx="2" fill="#eff6ff"/>
    <line x1="8" y1="41" x2="38" y2="41" stroke="#2563eb" stroke-width="1"/>
  </svg>`,
}

export function getCompatibilityTableThumbnailSvg(id: string): string {
    const clean = id
        .toLowerCase()
        .trim()
        .replace(/^compat[-_]/, '')
        .replace(/_/g, '-')

    const key = Object.keys(COMPATIBILITY_TABLE_THUMBNAILS).find(k => {
        const kClean = k.toLowerCase().replace(/^compat[-_]/, '').replace(/_/g, '-')
        return k === id || kClean === clean || k.endsWith(clean) || clean.includes(kClean)
    })

    return key ? COMPATIBILITY_TABLE_THUMBNAILS[key] : COMPATIBILITY_TABLE_THUMBNAILS['compat-classic-zebra-table']
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported Variant Registry (All 10 Radically Distinct Architectures)
// ─────────────────────────────────────────────────────────────────────────────

export const compatibilityTableVariants: BlockVariant[] = [
    {
        id: 'compat-classic-zebra-table',
        label: 'Classic Zebra Table',
        description: 'Current classic zebra checkmark table with alternating rows (KEPT 100% IDENTICAL)',
        thumbnail: COMPATIBILITY_TABLE_THUMBNAILS['compat-classic-zebra-table'],
        toHtml(props, id) { return classicZebraTable(props, id) },
    },
    {
        id: 'compat-automotive-parts-fitment',
        label: 'Automotive OEM Fitment Matrix',
        description: 'eBay Motors 4-column fitment table with VIN verification pledge and status badges',
        thumbnail: COMPATIBILITY_TABLE_THUMBNAILS['compat-automotive-parts-fitment'],
        toHtml(props, id) { return automotivePartsFitment(props, id) },
    },
    {
        id: 'compat-device-multi-gen-chips',
        label: 'Device Multi-Gen Bento Grid',
        description: '2-column device cards for smartphone cases, smartwatches, earbuds & tech accessories',
        thumbnail: COMPATIBILITY_TABLE_THUMBNAILS['compat-device-multi-gen-chips'],
        toHtml(props, id) { return deviceMultiGenChips(props, id) },
    },
    {
        id: 'compat-split-guarantee-sidebar',
        label: 'Split Fitment Guarantee Sidebar',
        description: '35/65 split: seller fitment pledge with direct VIN/model check offer + verified ledger',
        thumbnail: COMPATIBILITY_TABLE_THUMBNAILS['compat-split-guarantee-sidebar'],
        toHtml(props, id) { return splitGuaranteeSidebar(props, id) },
    },
    {
        id: 'compat-stepped-compatibility-checklist',
        label: 'Technical Clearance Cards',
        description: 'Stepped sequence cards for PC hardware, RAM, power adapters, camera lenses & audio',
        thumbnail: COMPATIBILITY_TABLE_THUMBNAILS['compat-stepped-compatibility-checklist'],
        toHtml(props, id) { return steppedChecklistCards(props, id) },
    },
    {
        id: 'compat-industrial-schematic-ledger',
        label: 'CAD Blueprint Schematic Ledger',
        description: 'Dark slate technical directory with OEM cross-reference codes for machinery & tools',
        thumbnail: COMPATIBILITY_TABLE_THUMBNAILS['compat-industrial-schematic-ledger'],
        toHtml(props, id) { return industrialSchematicLedger(props, id) },
    },
    {
        id: 'compat-minimal-hairline-directory',
        label: 'Minimalist Hairline Directory',
        description: 'Architectural whitespace & thin hairlines for designer accessories & luxury audio',
        thumbnail: COMPATIBILITY_TABLE_THUMBNAILS['compat-minimal-hairline-directory'],
        toHtml(props, id) { return minimalHairlineDirectory(props, id) },
    },
    {
        id: 'compat-console-gaming-platform-ribbon',
        label: 'Gaming Multi-Platform Matrix',
        description: 'Prominent platform badge ribbon (PC, PS5, Xbox, Switch) with supported features',
        thumbnail: COMPATIBILITY_TABLE_THUMBNAILS['compat-console-gaming-platform-ribbon'],
        toHtml(props, id) { return gamingPlatformRibbon(props, id) },
    },
    {
        id: 'compat-oem-cross-reference-ledger',
        label: 'Appliance Part Cross-Reference',
        description: 'Interchangeable OEM part number directory for appliance repair, motors & filters',
        thumbnail: COMPATIBILITY_TABLE_THUMBNAILS['compat-oem-cross-reference-ledger'],
        toHtml(props, id) { return oemCrossReferenceLedger(props, id) },
    },
    {
        id: 'compat-compact-horizontal-pill-strip',
        label: 'Mobile Compact Pill Strip',
        description: 'High-density horizontal capsule pills taking minimum vertical space for phone shoppers',
        thumbnail: COMPATIBILITY_TABLE_THUMBNAILS['compat-compact-horizontal-pill-strip'],
        toHtml(props, id) { return compactHorizontalPillStrip(props, id) },
    },
]

// Backwards-compatible aliases
export const compatibilityVariants = compatibilityTableVariants

/**
 * Robust Variant Resolver:
 * Supports variant IDs with or without the 'compat-' prefix
 * and matches shorthand IDs seamlessly.
 */
export function getCompatibilityTableVariant(id: string): BlockVariant {
    if (!id) return compatibilityTableVariants[0]
    const clean = id
        .toLowerCase()
        .trim()
        .replace(/^compat[-_]/, '')
        .replace(/_/g, '-')

    const found = compatibilityTableVariants.find(v => {
        const vClean = v.id.toLowerCase().replace(/^compat[-_]/, '').replace(/_/g, '-')
        return v.id === id || vClean === clean || v.id.endsWith(clean) || clean.includes(vClean)
    })

    return found ?? compatibilityTableVariants[0]
}
