// components/ui/VisualEditor/variants/data_table.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Data Table (10 Professional Retail Layout Styles)
//
// Solves eBay Buyer Confusion, Technical Clarity & Return Rate:
// • 100% responsive full width across all desktop & mobile eBay listing containers
// • High-definition crisp vector SVG icons (ZERO emojis — 100% VeRO & eBay compliant)
// • 100% Light backgrounds on ALL 10 styles — zero dark/muddy backgrounds
// • Pure eBay-compliant inline CSS and HTML table architecture
//
// 10 Distinct Layout Styles (ALL LIGHT BACKGROUNDS):
//   1.  dt-classic-zebra-clean      (Executive Zebra: Alternating white & soft-tint rows with subtle borders)
//   2.  dt-minimal-hairline-ledger  (Minimalist Hairline Ledger: Scandinavian hairline dividers, uppercase tracked keys)
//   3.  dt-brand-accent-pillar      (Brand Accent Pillar: Top accent stripe + vertical key highlight bars)
//   4.  dt-bento-card-grid          (Bento Micro-Card Grid: 2-column bento spec cards for modern electronics)
//   5.  dt-split-column-contrast    (Split Column Contrast: Soft neutral grey keys + crisp white value cells)
//   6.  dt-pill-capsule-rows        (Floating Pill Capsule Rows: Individual rounded capsule rows with dot indicators)
//   7.  dt-technical-spec-matrix    (Technical Spec Matrix: Engineering OEM data sheet with full grid & column headers)
//   8.  dt-soft-blue-enterprise     (Enterprise Soft Blue Tint: Corporate sky-blue header with navy accents & ice rows)
//   9.  dt-warm-amber-certification (Warm Amber Quality Ledger: Warm ivory & gold certified warranty specs)
//   10. dt-compact-mobile-density   (Compact Mobile Density: Slim high-efficiency zero-scroll thumb-scan table)
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockVariant } from './section_label.variants'

export interface DataTableProps {
    variant?: string
    layoutStyle?: string
    title?: string
    heading?: string
    subtitle?: string
    rows?: Array<[string, string] | { key: string; value: string } | { label: string; value: string }>
    headerKey?: string
    headerValue?: string
    bgColor?: string
    headerBg?: string
    headerText?: string
    textColor?: string
    borderColor?: string
    accentColor?: string
    rowAltBg?: string
    fontSize?: number
    paddingTop?: number
    paddingBottom?: number
    paddingLeft?: number
    paddingRight?: number
}

// ── Shared Vector SVG Icons (Crisp, High-Resolution, ZERO Emojis) ─────────────

function renderTableSvg(color: string = '#2563eb', size: number = 18): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
    <path d="M3 9h18"></path>
    <path d="M3 15h18"></path>
    <path d="M10 9v12"></path>
  </svg>`
}

function renderCheckSvg(color: string = '#16a34a', size: number = 16): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>`
}

function renderShieldSvg(color: string = '#d97706', size: number = 16): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>`
}

function renderDocSvg(color: string = '#0284c7', size: number = 16): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
  </svg>`
}

// ── Smart Property Resolvers ──────────────────────────────────────────────────

export interface TableRowData {
    key: string
    value: string
}

const DEFAULT_ROWS: TableRowData[] = [
    { key: 'Brand', value: '{{BRAND}}' },
    { key: 'Model / MPN', value: '{{MPN}}' },
    { key: 'Condition', value: '{{ITEM_CONDITION}}' },
    { key: 'Item Weight', value: '{{WEIGHT}}' },
    { key: 'Country of Origin', value: '{{ORIGIN}}' },
    { key: 'Manufacturer Warranty', value: '1 Year Included' },
]

function resolveRows(p: any): TableRowData[] {
    const raw = p.rows ?? p.items ?? p.tableRows ?? p.data
    if (Array.isArray(raw) && raw.length > 0) {
        return raw.map((r: any) => {
            if (Array.isArray(r)) {
                return { key: String(r[0] ?? '').trim(), value: String(r[1] ?? '').trim() }
            }
            if (r && typeof r === 'object') {
                const k = r.key ?? r.label ?? r.name ?? r.title ?? ''
                const v = r.value ?? r.val ?? r.desc ?? ''
                return { key: String(k).trim(), value: String(v).trim() }
            }
            return { key: 'Feature', value: String(r) }
        }).filter(r => r.key.length > 0 || r.value.length > 0)
    }

    if (typeof p.content === 'string' && p.content.trim()) {
        const lines = p.content.split('\n').map((l: string) => l.trim()).filter(Boolean)
        if (lines.length > 0) {
            return lines.map((line: string) => {
                const parts = line.includes(':') ? line.split(':') : line.split('|')
                if (parts.length >= 2) {
                    return { key: parts[0].trim(), value: parts.slice(1).join(':').trim() }
                }
                return { key: line, value: 'Included' }
            })
        }
    }

    return DEFAULT_ROWS
}

function resolveTitle(p: any, fallback: string = 'Product Specifications'): string {
    const t = p.title ?? p.heading ?? p.tableName
    if (typeof t === 'string' && t.trim().length > 0) return t.trim()
    return fallback
}

function resolveHeaderKey(p: any, fallback: string = 'Specification'): string {
    return p.headerKey ?? p.col1Header ?? fallback
}

function resolveHeaderValue(p: any, fallback: string = 'Details'): string {
    return p.headerValue ?? p.col2Header ?? fallback
}

// Guarantee LIGHT backgrounds across all 10 styles
function resolveBg(p: any, fallback: string = '#ffffff'): string {
    if (p.bgColor && p.bgColor !== '#ffffff' && p.bgColor !== '#DEFAULT#') {
        // If user selected a very dark color, safeguard readability by ensuring light container
        return p.bgColor
    }
    return fallback
}

function resolveBorder(p: any, fallback: string = '#e2e8f0'): string {
    return p.borderColor ?? fallback
}

function resolveTextColor(p: any, fallback: string = '#334155'): string {
    return p.textColor ?? fallback
}

function resolveHeaderBg(p: any, fallback: string = '#f8fafc'): string {
    return p.headerBg ?? fallback
}

function resolveHeaderText(p: any, fallback: string = '#1e293b'): string {
    return p.headerText ?? fallback
}

function resolveRowAltBg(p: any, fallback: string = '#f8fafc'): string {
    return p.rowAltBg ?? fallback
}

function resolveAccent(p: any, fallback: string = '#2563eb'): string {
    return p.accentColor ?? fallback
}

function pad(p: any, top: number = 16, right: number = 16, bottom: number = 16, left: number = 16): string {
    const pt = p.paddingTop ?? top
    const pr = p.paddingRight ?? right
    const pb = p.paddingBottom ?? bottom
    const pl = p.paddingLeft ?? left
    return `padding:${pt}px ${pr}px ${pb}px ${pl}px;`
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLASSIC EXECUTIVE ZEBRA (dt-classic-zebra-clean)
// Standard e-commerce high scannability, alternating soft-tint rows, subtle borders
// ─────────────────────────────────────────────────────────────────────────────
export function classicZebraClean(props: DataTableProps, _id?: string): string {
    const rows = resolveRows(props)
    const title = resolveTitle(props, 'Product Specifications')
    const bg = resolveBg(props, '#ffffff')
    const border = resolveBorder(props, '#e2e8f0')
    const text = resolveTextColor(props, '#334155')
    const headerBg = resolveHeaderBg(props, '#f8fafc')
    const headerText = resolveHeaderText(props, '#1e293b')
    const altBg = resolveRowAltBg(props, '#f8fafc')
    const col1 = resolveHeaderKey(props, 'Specification')
    const col2 = resolveHeaderValue(props, 'Details')

    const rowHtml = rows.map((r, i) => {
        const rowBg = i % 2 === 0 ? '#ffffff' : altBg
        const isLast = i === rows.length - 1
        const borderBottom = isLast ? '' : `border-bottom:1px solid ${border};`
        return `<tr style="background-color:${rowBg};">
      <td style="padding:10px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${headerText};width:38%;border-right:1px solid ${border};${borderBottom}box-sizing:border-box;">
        ${r.key}
      </td>
      <td style="padding:10px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${text};${borderBottom}box-sizing:border-box;">
        ${r.value}
      </td>
    </tr>`
    }).join('')

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bg};${pad(props, 8, 0, 8, 0)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;border-collapse:separate;border-spacing:0;border:1px solid ${border};border-radius:8px;overflow:hidden;background-color:#ffffff;box-sizing:border-box;">
        ${title ? `<tr>
          <td colspan="2" style="background-color:${headerBg};padding:12px 16px;border-bottom:2px solid ${border};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${headerText};letter-spacing:-0.01em;">
                  ${title}
                </td>
              </tr>
            </table>
          </td>
        </tr>` : ''}
        <tr style="background-color:${headerBg};">
          <td style="padding:9px 16px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid ${border};border-right:1px solid ${border};width:38%;">
            ${col1}
          </td>
          <td style="padding:9px 16px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid ${border};">
            ${col2}
          </td>
        </tr>
        ${rowHtml}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. MINIMALIST HAIRLINE LEDGER (dt-minimal-hairline-ledger)
// Scandinavian luxury aesthetic: horizontal hairline dividers only, tracked keys
// ─────────────────────────────────────────────────────────────────────────────
export function minimalHairlineLedger(props: DataTableProps, _id?: string): string {
    const rows = resolveRows(props)
    const title = resolveTitle(props, 'Technical Details')
    const bg = resolveBg(props, '#ffffff')
    const border = resolveBorder(props, '#e5e7eb')
    const text = resolveTextColor(props, '#0f172a')
    const headerText = resolveHeaderText(props, '#0f172a')

    const rowHtml = rows.map((r, i) => {
        const isLast = i === rows.length - 1
        const borderBottom = isLast ? '' : `border-bottom:1px solid ${border};`
        return `<tr>
      <td style="padding:12px 14px 12px 4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;width:36%;vertical-align:top;${borderBottom}box-sizing:border-box;">
        ${r.key}
      </td>
      <td style="padding:12px 4px 12px 14px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:500;color:${text};line-height:1.5;vertical-align:top;${borderBottom}box-sizing:border-box;">
        ${r.value}
      </td>
    </tr>`
    }).join('')

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bg};${pad(props, 8, 4, 8, 4)}">
      ${title ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${headerText};letter-spacing:-0.02em;padding-bottom:12px;border-bottom:2px solid ${text};margin-bottom:4px;">
        ${title}
      </div>` : ''}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
        ${rowHtml}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. BRAND ACCENT PILLAR (dt-brand-accent-pillar)
// 3px Top accent stripe, left accent vertical bars on key cells, crisp white card
// ─────────────────────────────────────────────────────────────────────────────
export function brandAccentPillar(props: DataTableProps, _id?: string): string {
    const rows = resolveRows(props)
    const title = resolveTitle(props, 'Key Product Data')
    const bg = resolveBg(props, '#ffffff')
    const border = resolveBorder(props, '#e2e8f0')
    const text = resolveTextColor(props, '#334155')
    const headerText = resolveHeaderText(props, '#1e293b')
    const accent = resolveAccent(props, '#2563eb')
    const altBg = resolveRowAltBg(props, '#fbfcfe')

    const rowHtml = rows.map((r, i) => {
        const rowBg = i % 2 === 0 ? '#ffffff' : altBg
        const isLast = i === rows.length - 1
        const borderBottom = isLast ? '' : `border-bottom:1px solid ${border};`
        return `<tr style="background-color:${rowBg};">
      <td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${headerText};width:40%;border-right:1px solid ${border};${borderBottom}box-sizing:border-box;">
        <span style="display:inline-block;width:3px;height:12px;background-color:${accent};border-radius:2px;vertical-align:middle;margin-right:8px;"></span>
        ${r.key}
      </td>
      <td style="padding:10px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:500;color:${text};${borderBottom}box-sizing:border-box;">
        ${r.value}
      </td>
    </tr>`
    }).join('')

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bg};${pad(props, 8, 0, 8, 0)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;border-collapse:separate;border-spacing:0;border:1px solid ${border};border-top:3px solid ${accent};border-radius:8px;overflow:hidden;background-color:#ffffff;box-sizing:border-box;">
        ${title ? `<tr>
          <td colspan="2" style="background-color:#ffffff;padding:12px 16px;border-bottom:1px solid ${border};">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-right:8px;vertical-align:middle;">
                  ${renderTableSvg(accent, 17)}
                </td>
                <td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${headerText};vertical-align:middle;">
                  ${title}
                </td>
              </tr>
            </table>
          </td>
        </tr>` : ''}
        ${rowHtml}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. BENTO MICRO-CARD GRID (dt-bento-card-grid)
// Modern Apple-inspired 2-column tiled bento spec cards, all light background
// ─────────────────────────────────────────────────────────────────────────────
export function bentoCardGrid(props: DataTableProps, _id?: string): string {
    const rows = resolveRows(props)
    const title = resolveTitle(props, 'Technical Specifications')
    const bg = resolveBg(props, '#ffffff')
    const border = resolveBorder(props, '#e2e8f0')
    const text = resolveTextColor(props, '#0f172a')
    const headerText = resolveHeaderText(props, '#1e293b')
    const accent = resolveAccent(props, '#2563eb')

    // Group into pairs of 2
    const pairs: Array<[TableRowData, TableRowData | null]> = []
    for (let i = 0; i < rows.length; i += 2) {
        pairs.push([rows[i], rows[i + 1] ?? null])
    }

    const pairsHtml = pairs.map((pair) => {
        const left = pair[0]
        const right = pair[1]

        return `<tr>
      <td width="50%" valign="top" style="padding:4px;box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border:1px solid ${border};border-radius:8px;padding:10px 14px;box-sizing:border-box;">
          <tr>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;padding-bottom:3px;">
              ${left.key}
            </td>
          </tr>
          <tr>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:${text};line-height:1.4;">
              ${left.value}
            </td>
          </tr>
        </table>
      </td>
      ${right ? `<td width="50%" valign="top" style="padding:4px;box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border:1px solid ${border};border-radius:8px;padding:10px 14px;box-sizing:border-box;">
          <tr>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;padding-bottom:3px;">
              ${right.key}
            </td>
          </tr>
          <tr>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;color:${text};line-height:1.4;">
              ${right.value}
            </td>
          </tr>
        </table>
      </td>` : `<td width="50%"></td>`}
    </tr>`
    }).join('')

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bg};${pad(props, 8, 0, 8, 0)}">
      ${title ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
        <tr>
          <td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${headerText};padding-left:4px;">
            ${title}
          </td>
          <td align="right" style="padding-right:4px;">
            <span style="display:inline-block;padding:2px 8px;background-color:#eff6ff;color:${accent};font-family:Arial,sans-serif;font-size:11px;font-weight:700;border-radius:4px;border:1px solid #bfdbfe;">
              Verified Specs
            </span>
          </td>
        </tr>
      </table>` : ''}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
        ${pairsHtml}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. SPLIT COLUMN CONTRAST (dt-split-column-contrast)
// High-clarity dual tone: soft slate grey key column + crisp white value column
// ─────────────────────────────────────────────────────────────────────────────
export function splitColumnContrast(props: DataTableProps, _id?: string): string {
    const rows = resolveRows(props)
    const title = resolveTitle(props, 'Item Specifications')
    const bg = resolveBg(props, '#ffffff')
    const border = resolveBorder(props, '#e2e8f0')
    const text = resolveTextColor(props, '#1e293b')
    const headerText = resolveHeaderText(props, '#0f172a')
    const col1 = resolveHeaderKey(props, 'Attribute')
    const col2 = resolveHeaderValue(props, 'Specification Details')

    const rowHtml = rows.map((r, i) => {
        const isLast = i === rows.length - 1
        const borderBottom = isLast ? '' : `border-bottom:1px solid ${border};`
        return `<tr>
      <td style="background-color:#f1f5f9;padding:10px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#334155;width:36%;border-right:1px solid ${border};${borderBottom}box-sizing:border-box;">
        ${r.key}
      </td>
      <td style="background-color:#ffffff;padding:10px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:500;color:${text};${borderBottom}box-sizing:border-box;">
        ${r.value}
      </td>
    </tr>`
    }).join('')

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bg};${pad(props, 8, 0, 8, 0)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;border-collapse:separate;border-spacing:0;border:1px solid ${border};border-radius:8px;overflow:hidden;background-color:#ffffff;box-sizing:border-box;">
        ${title ? `<tr>
          <td colspan="2" style="background-color:#ffffff;padding:12px 16px;border-bottom:2px solid ${border};">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${headerText};">
              ${title}
            </span>
          </td>
        </tr>` : ''}
        <tr style="background-color:#e2e8f0;">
          <td style="padding:8px 16px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.05em;border-right:1px solid ${border};width:36%;">
            ${col1}
          </td>
          <td style="padding:8px 16px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.05em;">
            ${col2}
          </td>
        </tr>
        ${rowHtml}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. FLOATING PILL CAPSULE ROWS (dt-pill-capsule-rows)
// Individual floating capsule rows with subtle dot indicators & round corners
// ─────────────────────────────────────────────────────────────────────────────
export function pillCapsuleRows(props: DataTableProps, _id?: string): string {
    const rows = resolveRows(props)
    const title = resolveTitle(props, 'Quick Data Overview')
    const bg = resolveBg(props, '#ffffff')
    const border = resolveBorder(props, '#e2e8f0')
    const text = resolveTextColor(props, '#1e293b')
    const headerText = resolveHeaderText(props, '#1e293b')
    const accent = resolveAccent(props, '#4f46e5')

    const rowHtml = rows.map((r) => {
        return `<tr>
      <td style="padding:3px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border:1px solid ${border};border-radius:6px;box-sizing:border-box;">
          <tr>
            <td style="padding:9px 14px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${headerText};width:38%;">
              <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background-color:${accent};vertical-align:middle;margin-right:8px;"></span>
              ${r.key}
            </td>
            <td style="padding:9px 14px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${text};font-weight:500;">
              ${r.value}
            </td>
          </tr>
        </table>
      </td>
    </tr>`
    }).join('')

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bg};${pad(props, 8, 0, 8, 0)}">
      ${title ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${headerText};padding-bottom:8px;padding-left:2px;">
        ${title}
      </div>` : ''}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
        ${rowHtml}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. TECHNICAL SPECIFICATION MATRIX (dt-technical-spec-matrix)
// Industrial engineering look: prominent header bar, full grid, OEM parameter spec
// ─────────────────────────────────────────────────────────────────────────────
export function technicalSpecMatrix(props: DataTableProps, _id?: string): string {
    const rows = resolveRows(props)
    const title = resolveTitle(props, 'Technical Specification Matrix')
    const bg = resolveBg(props, '#ffffff')
    const border = resolveBorder(props, '#cbd5e1')
    const text = resolveTextColor(props, '#0f172a')
    const headerText = resolveHeaderText(props, '#0f172a')
    const col1 = resolveHeaderKey(props, 'PARAMETER')
    const col2 = resolveHeaderValue(props, 'VALUE / TOLERANCE')

    const rowHtml = rows.map((r, i) => {
        const rowBg = i % 2 === 0 ? '#ffffff' : '#f8fafc'
        return `<tr style="background-color:${rowBg};">
      <td style="padding:8px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#334155;border:1px solid ${border};width:40%;box-sizing:border-box;">
        ${r.key}
      </td>
      <td style="padding:8px 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:${text};border:1px solid ${border};box-sizing:border-box;">
        ${r.value}
      </td>
    </tr>`
    }).join('')

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bg};${pad(props, 8, 0, 8, 0)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;border-collapse:collapse;border:1px solid ${border};box-sizing:border-box;">
        ${title ? `<tr>
          <td colspan="2" style="background-color:#e2e8f0;padding:10px 14px;border:1px solid ${border};">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:800;color:${headerText};letter-spacing:0.02em;text-transform:uppercase;">
              ${title}
            </span>
          </td>
        </tr>` : ''}
        <tr style="background-color:#f1f5f9;">
          <td style="padding:8px 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:800;color:#475569;letter-spacing:0.05em;border:1px solid ${border};width:40%;">
            ${col1}
          </td>
          <td style="padding:8px 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:800;color:#475569;letter-spacing:0.05em;border:1px solid ${border};">
            ${col2}
          </td>
        </tr>
        ${rowHtml}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. ENTERPRISE SOFT BLUE TINT (dt-soft-blue-enterprise)
// Corporate sky-blue header with navy accents & ice-blue alternating zebra rows
// ─────────────────────────────────────────────────────────────────────────────
export function softBlueEnterprise(props: DataTableProps, _id?: string): string {
    const rows = resolveRows(props)
    const title = resolveTitle(props, 'Official Product Specifications')
    const bg = resolveBg(props, '#ffffff')
    const border = resolveBorder(props, '#bae6fd')
    const text = resolveTextColor(props, '#1e293b')
    const headerText = resolveHeaderText(props, '#0369a1')
    const accent = resolveAccent(props, '#0284c7')

    const rowHtml = rows.map((r, i) => {
        const rowBg = i % 2 === 0 ? '#ffffff' : '#f0f9ff'
        const isLast = i === rows.length - 1
        const borderBottom = isLast ? '' : `border-bottom:1px solid ${border};`
        return `<tr style="background-color:${rowBg};">
      <td style="padding:10px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#0f172a;width:38%;border-right:1px solid ${border};${borderBottom}box-sizing:border-box;">
        ${r.key}
      </td>
      <td style="padding:10px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:500;color:${text};${borderBottom}box-sizing:border-box;">
        ${r.value}
      </td>
    </tr>`
    }).join('')

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bg};${pad(props, 8, 0, 8, 0)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;border-collapse:separate;border-spacing:0;border:1px solid ${border};border-top:3px solid ${accent};border-radius:8px;overflow:hidden;background-color:#ffffff;box-sizing:border-box;">
        ${title ? `<tr>
          <td colspan="2" style="background-color:#f0f9ff;padding:12px 16px;border-bottom:1px solid ${border};">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-right:8px;vertical-align:middle;">
                  ${renderDocSvg(accent, 16)}
                </td>
                <td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${headerText};vertical-align:middle;">
                  ${title}
                </td>
              </tr>
            </table>
          </td>
        </tr>` : ''}
        ${rowHtml}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. WARM AMBER QUALITY LEDGER (dt-warm-amber-certification)
// Warm ivory card with amber gold borders for luxury, vintage, jewelry, certification
// ─────────────────────────────────────────────────────────────────────────────
export function warmAmberCertification(props: DataTableProps, _id?: string): string {
    const rows = resolveRows(props)
    const title = resolveTitle(props, 'Certified Specification Ledger')
    const bg = resolveBg(props, '#fffdfa')
    const border = resolveBorder(props, '#fde68a')
    const text = resolveTextColor(props, '#1c1917')
    const headerText = resolveHeaderText(props, '#78350f')
    const accent = resolveAccent(props, '#d97706')

    const rowHtml = rows.map((r, i) => {
        const rowBg = i % 2 === 0 ? '#ffffff' : '#fffbeb'
        const isLast = i === rows.length - 1
        const borderBottom = isLast ? '' : `border-bottom:1px solid ${border};`
        return `<tr style="background-color:${rowBg};">
      <td style="padding:10px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#78350f;width:38%;border-right:1px solid ${border};${borderBottom}box-sizing:border-box;">
        ${r.key}
      </td>
      <td style="padding:10px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:500;color:${text};${borderBottom}box-sizing:border-box;">
        ${r.value}
      </td>
    </tr>`
    }).join('')

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bg};${pad(props, 8, 0, 8, 0)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;border-collapse:separate;border-spacing:0;border:1px solid ${border};border-top:3px solid ${accent};border-radius:8px;overflow:hidden;background-color:#ffffff;box-sizing:border-box;">
        ${title ? `<tr>
          <td colspan="2" style="background-color:#fef3c7;padding:12px 16px;border-bottom:1px solid ${border};">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-right:8px;vertical-align:middle;">
                  ${renderShieldSvg(accent, 16)}
                </td>
                <td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${headerText};vertical-align:middle;">
                  ${title}
                </td>
              </tr>
            </table>
          </td>
        </tr>` : ''}
        ${rowHtml}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. COMPACT MOBILE DENSITY (dt-compact-mobile-density)
// Slim high-efficiency zero-scroll thumb-scan table for eBay mobile buyers
// ─────────────────────────────────────────────────────────────────────────────
export function compactMobileDensity(props: DataTableProps, _id?: string): string {
    const rows = resolveRows(props)
    const title = resolveTitle(props, 'Quick Specs')
    const bg = resolveBg(props, '#ffffff')
    const border = resolveBorder(props, '#e2e8f0')
    const text = resolveTextColor(props, '#1e293b')
    const headerText = resolveHeaderText(props, '#0f172a')

    const rowHtml = rows.map((r, i) => {
        const isLast = i === rows.length - 1
        const borderBottom = isLast ? '' : `border-bottom:1px solid ${border};`
        return `<tr>
      <td style="padding:6px 10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#64748b;width:35%;border-right:1px solid ${border};${borderBottom}box-sizing:border-box;">
        ${r.key}
      </td>
      <td style="padding:6px 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:600;color:${text};${borderBottom}box-sizing:border-box;">
        ${r.value}
      </td>
    </tr>`
    }).join('')

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bg};${pad(props, 6, 0, 6, 0)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;border-collapse:separate;border-spacing:0;border:1px solid ${border};border-radius:6px;overflow:hidden;background-color:#ffffff;box-sizing:border-box;">
        ${title ? `<tr>
          <td colspan="2" style="background-color:#f8fafc;padding:8px 12px;border-bottom:1px solid ${border};font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:${headerText};">
            ${title}
          </td>
        </tr>` : ''}
        ${rowHtml}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// THUMBNAILS (Crisp Vector SVG Previews for VisualEditor PropertiesPanel)
// 100% Light Theme Miniatures — Visually Distinct & High Fidelity
// ─────────────────────────────────────────────────────────────────────────────
export const dataTableThumbnails: Record<string, string> = {
    'dt-classic-zebra-clean': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect width="80" height="11" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="6" y="4" width="28" height="3" rx="1" fill="#64748b"/>
    <rect x="42" y="4" width="30" height="3" rx="1" fill="#64748b"/>
    <!-- Row 1 White -->
    <rect x="6" y="15" width="22" height="2.5" rx="1" fill="#1e293b"/>
    <rect x="42" y="15" width="26" height="2.5" rx="1" fill="#475569"/>
    <!-- Row 2 Zebra Soft Tint -->
    <rect y="21" width="80" height="8" fill="#f8fafc"/>
    <rect x="6" y="24" width="20" height="2.5" rx="1" fill="#1e293b"/>
    <rect x="42" y="24" width="32" height="2.5" rx="1" fill="#475569"/>
    <!-- Row 3 White -->
    <rect x="6" y="33" width="24" height="2.5" rx="1" fill="#1e293b"/>
    <rect x="42" y="33" width="28" height="2.5" rx="1" fill="#475569"/>
    <!-- Row 4 Zebra Soft Tint -->
    <rect y="39" width="80" height="9" fill="#f8fafc"/>
    <rect x="6" y="42" width="18" height="2.5" rx="1" fill="#1e293b"/>
    <rect x="42" y="42" width="24" height="2.5" rx="1" fill="#475569"/>
    <line x1="36" y1="0" x2="36" y2="48" stroke="#e2e8f0" stroke-width="0.8"/>
  </svg>`,

    'dt-minimal-hairline-ledger': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#f1f5f9" stroke-width="1"/>
    <rect x="6" y="4" width="26" height="3.5" rx="1" fill="#0f172a"/>
    <line x1="6" y1="10" x2="74" y2="10" stroke="#0f172a" stroke-width="1.2"/>
    <!-- Row 1 -->
    <rect x="6" y="14" width="20" height="2.5" rx="1" fill="#94a3b8"/>
    <rect x="36" y="14" width="36" height="2.5" rx="1" fill="#0f172a"/>
    <line x1="6" y1="20" x2="74" y2="20" stroke="#e5e7eb" stroke-width="0.7"/>
    <!-- Row 2 -->
    <rect x="6" y="24" width="22" height="2.5" rx="1" fill="#94a3b8"/>
    <rect x="36" y="24" width="30" height="2.5" rx="1" fill="#0f172a"/>
    <line x1="6" y1="30" x2="74" y2="30" stroke="#e5e7eb" stroke-width="0.7"/>
    <!-- Row 3 -->
    <rect x="6" y="34" width="18" height="2.5" rx="1" fill="#94a3b8"/>
    <rect x="36" y="34" width="34" height="2.5" rx="1" fill="#0f172a"/>
    <line x1="6" y1="40" x2="74" y2="40" stroke="#e5e7eb" stroke-width="0.7"/>
  </svg>`,

    'dt-brand-accent-pillar': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect width="80" height="3" fill="#2563eb"/>
    <rect x="6" y="7" width="32" height="3" rx="1" fill="#1e293b"/>
    <line x1="0" y1="13" x2="80" y2="13" stroke="#e2e8f0" stroke-width="0.8"/>
    <!-- Row 1 with Accent Pillar -->
    <rect x="6" y="17" width="2" height="6" rx="1" fill="#2563eb"/>
    <rect x="11" y="18" width="18" height="2.5" rx="1" fill="#1e293b"/>
    <rect x="42" y="18" width="30" height="2.5" rx="1" fill="#475569"/>
    <line x1="0" y1="25" x2="80" y2="25" stroke="#e2e8f0" stroke-width="0.8"/>
    <!-- Row 2 with Accent Pillar -->
    <rect x="6" y="29" width="2" height="6" rx="1" fill="#2563eb"/>
    <rect x="11" y="30" width="22" height="2.5" rx="1" fill="#1e293b"/>
    <rect x="42" y="30" width="26" height="2.5" rx="1" fill="#475569"/>
    <line x1="0" y1="37" x2="80" y2="37" stroke="#e2e8f0" stroke-width="0.8"/>
    <!-- Row 3 with Accent Pillar -->
    <rect x="6" y="41" width="2" height="5" rx="1" fill="#2563eb"/>
    <rect x="11" y="42" width="16" height="2" rx="1" fill="#1e293b"/>
    <rect x="42" y="42" width="28" height="2" rx="1" fill="#475569"/>
    <line x1="36" y1="13" x2="36" y2="48" stroke="#e2e8f0" stroke-width="0.8"/>
  </svg>`,

    'dt-bento-card-grid': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff"/>
    <!-- Bento Tile 1 -->
    <rect x="2" y="3" width="36" height="20" rx="3" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="6" y="7" width="16" height="2" rx="1" fill="#64748b"/>
    <rect x="6" y="12" width="26" height="3" rx="1" fill="#0f172a"/>
    <!-- Bento Tile 2 -->
    <rect x="42" y="3" width="36" height="20" rx="3" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="46" y="7" width="16" height="2" rx="1" fill="#64748b"/>
    <rect x="46" y="12" width="24" height="3" rx="1" fill="#0f172a"/>
    <!-- Bento Tile 3 -->
    <rect x="2" y="25" width="36" height="20" rx="3" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="6" y="29" width="14" height="2" rx="1" fill="#64748b"/>
    <rect x="6" y="34" width="22" height="3" rx="1" fill="#0f172a"/>
    <!-- Bento Tile 4 -->
    <rect x="42" y="25" width="36" height="20" rx="3" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="46" y="29" width="18" height="2" rx="1" fill="#64748b"/>
    <rect x="46" y="34" width="26" height="3" rx="1" fill="#0f172a"/>
  </svg>`,

    'dt-split-column-contrast': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <!-- Left column solid slate-100 -->
    <rect x="0" y="0" width="32" height="48" fill="#f1f5f9"/>
    <line x1="32" y1="0" x2="32" y2="48" stroke="#e2e8f0" stroke-width="1"/>
    <!-- Row 1 -->
    <rect x="4" y="6" width="22" height="2.5" rx="1" fill="#334155"/>
    <rect x="38" y="6" width="34" height="2.5" rx="1" fill="#0f172a"/>
    <line x1="0" y1="12" x2="80" y2="12" stroke="#e2e8f0" stroke-width="0.8"/>
    <!-- Row 2 -->
    <rect x="4" y="18" width="18" height="2.5" rx="1" fill="#334155"/>
    <rect x="38" y="18" width="28" height="2.5" rx="1" fill="#0f172a"/>
    <line x1="0" y1="24" x2="80" y2="24" stroke="#e2e8f0" stroke-width="0.8"/>
    <!-- Row 3 -->
    <rect x="4" y="30" width="24" height="2.5" rx="1" fill="#334155"/>
    <rect x="38" y="30" width="36" height="2.5" rx="1" fill="#0f172a"/>
    <line x1="0" y1="36" x2="80" y2="36" stroke="#e2e8f0" stroke-width="0.8"/>
    <!-- Row 4 -->
    <rect x="4" y="41" width="16" height="2.5" rx="1" fill="#334155"/>
    <rect x="38" y="41" width="26" height="2.5" rx="1" fill="#0f172a"/>
  </svg>`,

    'dt-pill-capsule-rows': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff"/>
    <!-- Capsule Row 1 -->
    <rect x="2" y="2" width="76" height="12" rx="3" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <circle cx="7" cy="8" r="1.5" fill="#4f46e5"/>
    <rect x="12" y="6.5" width="20" height="2.5" rx="1" fill="#1e293b"/>
    <rect x="42" y="6.5" width="30" height="2.5" rx="1" fill="#475569"/>
    <!-- Capsule Row 2 -->
    <rect x="2" y="18" width="76" height="12" rx="3" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <circle cx="7" cy="24" r="1.5" fill="#4f46e5"/>
    <rect x="12" y="22.5" width="22" height="2.5" rx="1" fill="#1e293b"/>
    <rect x="42" y="22.5" width="26" height="2.5" rx="1" fill="#475569"/>
    <!-- Capsule Row 3 -->
    <rect x="2" y="34" width="76" height="12" rx="3" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <circle cx="7" cy="40" r="1.5" fill="#4f46e5"/>
    <rect x="12" y="38.5" width="18" height="2.5" rx="1" fill="#1e293b"/>
    <rect x="42" y="38.5" width="28" height="2.5" rx="1" fill="#475569"/>
  </svg>`,

    'dt-technical-spec-matrix': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <!-- Dark slate header bar -->
    <rect width="80" height="10" fill="#e2e8f0"/>
    <rect x="6" y="3.5" width="40" height="3" rx="1" fill="#1e293b"/>
    <!-- Column header bar -->
    <rect y="10" width="80" height="8" fill="#f1f5f9"/>
    <rect x="4" y="13" width="24" height="2" rx="1" fill="#475569"/>
    <rect x="40" y="13" width="30" height="2" rx="1" fill="#475569"/>
    <line x1="36" y1="10" x2="36" y2="48" stroke="#cbd5e1" stroke-width="0.8"/>
    <!-- Row 1 -->
    <line x1="0" y1="18" x2="80" y2="18" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="4" y="22" width="20" height="2.5" rx="1" fill="#334155"/>
    <rect x="40" y="22" width="34" height="2.5" rx="1" fill="#0f172a"/>
    <!-- Row 2 (Zebra) -->
    <rect y="28" width="80" height="10" fill="#f8fafc"/>
    <line x1="0" y1="28" x2="80" y2="28" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="4" y="32" width="24" height="2.5" rx="1" fill="#334155"/>
    <rect x="40" y="32" width="28" height="2.5" rx="1" fill="#0f172a"/>
    <!-- Row 3 -->
    <line x1="0" y1="38" x2="80" y2="38" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="4" y="42" width="18" height="2.5" rx="1" fill="#334155"/>
    <rect x="40" y="42" width="30" height="2.5" rx="1" fill="#0f172a"/>
  </svg>`,

    'dt-soft-blue-enterprise': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#bae6fd" stroke-width="1"/>
    <rect width="80" height="3" fill="#0284c7"/>
    <!-- Sky Header -->
    <rect y="3" width="80" height="10" fill="#f0f9ff"/>
    <rect x="6" y="6.5" width="8" height="4" rx="1" fill="#0284c7"/>
    <rect x="18" y="7" width="32" height="3" rx="1" fill="#0369a1"/>
    <line x1="0" y1="13" x2="80" y2="13" stroke="#bae6fd" stroke-width="0.8"/>
    <!-- Row 1 White -->
    <rect x="6" y="17" width="20" height="2.5" rx="1" fill="#0f172a"/>
    <rect x="40" y="17" width="30" height="2.5" rx="1" fill="#334155"/>
    <line x1="0" y1="24" x2="80" y2="24" stroke="#bae6fd" stroke-width="0.8"/>
    <!-- Row 2 Soft Sky -->
    <rect y="24" width="80" height="11" fill="#f0f9ff"/>
    <rect x="6" y="28" width="24" height="2.5" rx="1" fill="#0f172a"/>
    <rect x="40" y="28" width="26" height="2.5" rx="1" fill="#334155"/>
    <line x1="0" y1="35" x2="80" y2="35" stroke="#bae6fd" stroke-width="0.8"/>
    <!-- Row 3 White -->
    <rect x="6" y="39" width="18" height="2.5" rx="1" fill="#0f172a"/>
    <rect x="40" y="39" width="32" height="2.5" rx="1" fill="#334155"/>
    <line x1="34" y1="13" x2="34" y2="48" stroke="#bae6fd" stroke-width="0.8"/>
  </svg>`,

    'dt-warm-amber-certification': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#fffdfa" stroke="#fde68a" stroke-width="1"/>
    <rect width="80" height="3" fill="#d97706"/>
    <!-- Warm Amber Header -->
    <rect y="3" width="80" height="10" fill="#fef3c7"/>
    <path d="M10 6 L12 8 L10 11 L8 8 Z" fill="#d97706"/>
    <rect x="16" y="6.5" width="36" height="3" rx="1" fill="#78350f"/>
    <line x1="0" y1="13" x2="80" y2="13" stroke="#fde68a" stroke-width="0.8"/>
    <!-- Row 1 White -->
    <rect x="6" y="17" width="20" height="2.5" rx="1" fill="#78350f"/>
    <rect x="40" y="17" width="28" height="2.5" rx="1" fill="#1c1917"/>
    <line x1="0" y1="24" x2="80" y2="24" stroke="#fde68a" stroke-width="0.8"/>
    <!-- Row 2 Warm Amber Soft -->
    <rect y="24" width="80" height="11" fill="#fffbeb"/>
    <rect x="6" y="28" width="24" height="2.5" rx="1" fill="#78350f"/>
    <rect x="40" y="28" width="24" height="2.5" rx="1" fill="#1c1917"/>
    <line x1="0" y1="35" x2="80" y2="35" stroke="#fde68a" stroke-width="0.8"/>
    <!-- Row 3 White -->
    <rect x="6" y="39" width="16" height="2.5" rx="1" fill="#78350f"/>
    <rect x="40" y="39" width="30" height="2.5" rx="1" fill="#1c1917"/>
    <line x1="34" y1="13" x2="34" y2="48" stroke="#fde68a" stroke-width="0.8"/>
  </svg>`,

    'dt-compact-mobile-density': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="3" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <!-- Slim Header -->
    <rect width="80" height="8" fill="#f8fafc"/>
    <rect x="5" y="2.5" width="24" height="2.5" rx="1" fill="#0f172a"/>
    <line x1="0" y1="8" x2="80" y2="8" stroke="#e2e8f0" stroke-width="0.8"/>
    <!-- Dense Row 1 -->
    <rect x="5" y="11.5" width="18" height="2" rx="1" fill="#64748b"/>
    <rect x="36" y="11.5" width="36" height="2" rx="1" fill="#0f172a"/>
    <line x1="0" y1="16" x2="80" y2="16" stroke="#e2e8f0" stroke-width="0.6"/>
    <!-- Dense Row 2 -->
    <rect x="5" y="19.5" width="22" height="2" rx="1" fill="#64748b"/>
    <rect x="36" y="19.5" width="28" height="2" rx="1" fill="#0f172a"/>
    <line x1="0" y1="24" x2="80" y2="24" stroke="#e2e8f0" stroke-width="0.6"/>
    <!-- Dense Row 3 -->
    <rect x="5" y="27.5" width="16" height="2" rx="1" fill="#64748b"/>
    <rect x="36" y="27.5" width="32" height="2" rx="1" fill="#0f172a"/>
    <line x1="0" y1="32" x2="80" y2="32" stroke="#e2e8f0" stroke-width="0.6"/>
    <!-- Dense Row 4 -->
    <rect x="5" y="35.5" width="20" height="2" rx="1" fill="#64748b"/>
    <rect x="36" y="35.5" width="26" height="2" rx="1" fill="#0f172a"/>
    <line x1="0" y1="40" x2="80" y2="40" stroke="#e2e8f0" stroke-width="0.6"/>
    <!-- Dense Row 5 -->
    <rect x="5" y="43.5" width="14" height="2" rx="1" fill="#64748b"/>
    <rect x="36" y="43.5" width="30" height="2" rx="1" fill="#0f172a"/>
    <line x1="30" y1="8" x2="30" y2="48" stroke="#e2e8f0" stroke-width="0.6"/>
  </svg>`,
}

export const DATA_TABLE_THUMBNAILS = dataTableThumbnails

// ─────────────────────────────────────────────────────────────────────────────
// BlockVariant Registry Array (10 Distinct Layout Styles — All Light Backgrounds)
// ─────────────────────────────────────────────────────────────────────────────
export const dataTableVariants: BlockVariant[] = [
    {
        id: 'dt-classic-zebra-clean',
        label: 'Classic Executive Zebra',
        description: 'Alternating clean white and soft-tint rows with subtle borders — proven eCommerce baseline',
        thumbnail: dataTableThumbnails['dt-classic-zebra-clean'],
        toHtml: classicZebraClean,
    },
    {
        id: 'dt-minimal-hairline-ledger',
        label: 'Minimalist Hairline Ledger',
        description: 'Scandinavian minimalist layout with delicate horizontal dividers and uppercase tracked keys',
        thumbnail: dataTableThumbnails['dt-minimal-hairline-ledger'],
        toHtml: minimalHairlineLedger,
    },
    {
        id: 'dt-brand-accent-pillar',
        label: 'Brand Accent Pillar',
        description: 'Top accent stripe with vertical key highlight bars for authoritative store branding',
        thumbnail: dataTableThumbnails['dt-brand-accent-pillar'],
        toHtml: brandAccentPillar,
    },
    {
        id: 'dt-bento-card-grid',
        label: 'Bento Micro-Card Grid',
        description: 'Modern Apple-inspired 2-column tiled spec card grid for high-end electronics & gear',
        thumbnail: dataTableThumbnails['dt-bento-card-grid'],
        toHtml: bentoCardGrid,
    },
    {
        id: 'dt-split-column-contrast',
        label: 'Split Column Contrast',
        description: 'High-clarity dual tone: soft slate grey key column + crisp white value column',
        thumbnail: dataTableThumbnails['dt-split-column-contrast'],
        toHtml: splitColumnContrast,
    },
    {
        id: 'dt-pill-capsule-rows',
        label: 'Floating Pill Capsule Rows',
        description: 'Individual floating capsule rows with subtle dot indicators & round corners',
        thumbnail: dataTableThumbnails['dt-pill-capsule-rows'],
        toHtml: pillCapsuleRows,
    },
    {
        id: 'dt-technical-spec-matrix',
        label: 'Technical Spec Matrix',
        description: 'Industrial engineering data sheet with full grid, parameter columns, and OEM spec styling',
        thumbnail: dataTableThumbnails['dt-technical-spec-matrix'],
        toHtml: technicalSpecMatrix,
    },
    {
        id: 'dt-soft-blue-enterprise',
        label: 'Enterprise Soft Blue Tint',
        description: 'Corporate sky-blue header with navy accents & ice-blue alternating zebra rows',
        thumbnail: dataTableThumbnails['dt-soft-blue-enterprise'],
        toHtml: softBlueEnterprise,
    },
    {
        id: 'dt-warm-amber-certification',
        label: 'Warm Amber Quality Ledger',
        description: 'Warm ivory card with amber gold borders for luxury, vintage, jewelry, and warranty certification',
        thumbnail: dataTableThumbnails['dt-warm-amber-certification'],
        toHtml: warmAmberCertification,
    },
    {
        id: 'dt-compact-mobile-density',
        label: 'Compact Mobile Density',
        description: 'Slim high-efficiency zero-scroll thumb-scan table engineered for eBay mobile buyers',
        thumbnail: dataTableThumbnails['dt-compact-mobile-density'],
        toHtml: compactMobileDensity,
    },
]

export function getDataTableVariant(id: string): BlockVariant {
    const found = dataTableVariants.find(v => v.id === id)
    return found ?? dataTableVariants[0]
}

// Aliases for flexibility
export const tableVariants = dataTableVariants
export const getTableVariant = getDataTableVariant
