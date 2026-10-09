// components/ui/VisualEditor/variants/specs_table.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Specs Table — 6 layout variants (Two Column Mobile Fix, Curve-free, Full Size)
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
  id: string
  label: string
  description: string
  toHtml: (props: any, id: string) => string
}

function pad(p: any): string {
  return `padding:${p.paddingTop ?? 0}px ${p.paddingRight ?? 0}px ${p.paddingBottom ?? 0}px ${p.paddingLeft ?? 0}px;`
}

const FALLBACK_ROWS = [
  { key: 'Brand', value: 'Generic' },
  { key: 'Model', value: 'Standard' },
  { key: 'Condition', value: 'Brand New' },
  { key: 'MPN', value: 'GEN-MPN-001' },
  { key: 'EAN', value: '5000000000000' },
  { key: 'Material', value: 'Premium Alloy' },
  { key: 'Suitable For', value: 'Universal' },
  { key: 'Warranty', value: '1 Year Manufacturer' },
]

function cleanRowValue(val: any, fallback: string): string {
  if (!val || String(val).startsWith('{{')) return fallback
  return String(val)
}

export const specsTableVariants: BlockVariant[] = [

  // ── 1. Full Table ─────────────────────────────────────────────────────────
  {
    id: 'full',
    label: 'Full Table',
    description: 'Crisp 2-column key/value table with header and alternating rows',
    toHtml(p: any, id: string): string {
      const rawRows = p.rows?.length ? p.rows : FALLBACK_ROWS
      const rowsHtml = rawRows.map((r: any, i: number) => {
        const fb = FALLBACK_ROWS[i % FALLBACK_ROWS.length]?.value ?? 'Standard'
        const val = cleanRowValue(r.value, fb)
        return `
      <tr style="background-color:${i % 2 === 0 ? (p.rowBg ?? '#ffffff') : (p.altRowBg ?? '#f9fafb')};">
        <td class="st-full-key-${id}" style="width:38%;padding:11px 16px;font-family:Arial,sans-serif;font-size:${p.fontSize ?? 13}px;font-weight:600;color:#374151;border-bottom:1px solid ${p.borderColor ?? '#f3f4f6'};">${r.key}</td>
        <td class="st-full-val-${id}" style="padding:11px 16px;font-family:Arial,sans-serif;font-size:${p.fontSize ?? 13}px;font-weight:500;color:#1f2937;border-bottom:1px solid ${p.borderColor ?? '#f3f4f6'};">${val}</td>
      </tr>`
      }).join('')

      const headerBg = p.headerBg ?? '#1e1535'
      const headerText = p.headerText ?? '#ffffff'

      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .st-full-key-${id} { width: 40% !important; padding: 8px 10px !important; font-size: 11px !important; }
  .st-full-val-${id} { padding: 8px 10px !important; font-size: 11px !important; }
  .st-full-head-${id} { padding: 10px 12px !important; }
}
</style>`

      const titleHtml = p.showTitle !== false
        ? `<tr><td colspan="2" class="st-full-head-${id}" style="background-color:${headerBg};padding:12px 16px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:${headerText};text-transform:uppercase;letter-spacing:0.05em;">${p.titleText ?? 'Item Specifics'}</p>
                  </td></tr>` : ''

      return `<!--[riazify:specs_table:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:#ffffff;border:1px solid ${p.borderColor ?? '#e5e7eb'};table-layout:fixed;">
  ${titleHtml}${rowsHtml}
</table>
<!--[/riazify:specs_table:${id}]-->`
    },
  },

  // ── 2. Two Column (Fixed: Stays Two Columns Side-by-Side on Mobile) ───────
  {
    id: 'two-column',
    label: 'Two Column',
    description: 'Specs split into two side-by-side columns (optimized for mobile 375px)',
    toHtml(p: any, id: string): string {
      const rawRows = p.rows?.length ? p.rows : FALLBACK_ROWS
      const mid = Math.ceil(rawRows.length / 2)
      const left = rawRows.slice(0, mid)
      const right = rawRows.slice(mid)

      const makeSubTable = (items: any[]) => items.map((r: any, i: number) => {
        const fb = FALLBACK_ROWS[i % FALLBACK_ROWS.length]?.value ?? 'Standard'
        const val = cleanRowValue(r.value, fb)
        return `<tr>
          <td class="st-tc-k-${id}" style="width:40%;padding:9px 12px;font-family:Arial,sans-serif;font-size:12px;font-weight:600;color:#374151;border-bottom:1px solid ${p.borderColor ?? '#f3f4f6'};background-color:${p.altRowBg ?? '#f8fafc'};word-break:break-word;">${r.key}</td>
          <td class="st-tc-v-${id}" style="padding:9px 12px;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;border-bottom:1px solid ${p.borderColor ?? '#f3f4f6'};word-break:break-word;">${val}</td>
        </tr>`
      }).join('')

      // Mobile style: Keeps both columns side-by-side (50% each) with tight padding so nothing gets cut off
      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .st-tc-k-${id} { padding: 7px 6px !important; font-size: 11px !important; width: 42% !important; }
  .st-tc-v-${id} { padding: 7px 6px !important; font-size: 11px !important; }
  .st-tc-head-${id} { padding: 10px 12px !important; }
}
</style>`

      const headerBg = p.headerBg ?? '#1e1535'
      const headerText = p.headerText ?? '#ffffff'

      const titleHtml = p.showTitle !== false
        ? `<tr><td colspan="2" class="st-tc-head-${id}" style="background-color:${headerBg};padding:10px 16px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${headerText};">${p.titleText ?? 'Item Specifics'}</p>
                  </td></tr>` : ''

      return `<!--[riazify:specs_table:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${p.bgColor ?? '#ffffff'};border:1px solid ${p.borderColor ?? '#e5e7eb'};table-layout:fixed;">
  ${titleHtml}
  <tr>
    <!-- Left Column (50%) -->
    <td width="50%" style="width:50% !important;vertical-align:top;border-right:1px solid ${p.borderColor ?? '#e5e7eb'};padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;">
        ${makeSubTable(left)}
      </table>
    </td>
    <!-- Right Column (50%) -->
    <td width="50%" style="width:50% !important;vertical-align:top;padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;">
        ${makeSubTable(right)}
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:specs_table:${id}]-->`
    },
  },

  // ── 3. Compact ────────────────────────────────────────────────────────────
  {
    id: 'compact',
    label: 'Compact',
    description: 'Tighter rows, smaller font — more data visible',
    toHtml(p: any, id: string): string {
      const rawRows = p.rows?.length ? p.rows : FALLBACK_ROWS
      const rowsHtml = rawRows.map((r: any, i: number) => {
        const fb = FALLBACK_ROWS[i % FALLBACK_ROWS.length]?.value ?? 'Standard'
        const val = cleanRowValue(r.value, fb)
        return `
      <tr style="background-color:${i % 2 === 0 ? '#ffffff' : '#f9fafb'};">
        <td class="st-cp-key-${id}" style="width:42%;padding:6px 12px;font-family:Arial,sans-serif;font-size:11px;font-weight:600;color:#4b5563;border-bottom:1px solid #f3f4f6;word-break:break-word;">${r.key}</td>
        <td class="st-cp-val-${id}" style="padding:6px 12px;font-family:Arial,sans-serif;font-size:11px;color:#6b7280;border-bottom:1px solid #f3f4f6;word-break:break-word;">${val}</td>
      </tr>`
      }).join('')

      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .st-cp-key-${id} { width: 42% !important; padding: 6px 8px !important; font-size: 11px !important; }
  .st-cp-val-${id} { padding: 6px 8px !important; font-size: 11px !important; }
}
</style>`

      return `<!--[riazify:specs_table:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:#ffffff;border:1px solid #e5e7eb;table-layout:fixed;">
  ${p.showTitle !== false ? `<tr><td colspan="2" style="padding:8px 12px;background-color:${p.headerBg ?? '#374151'};"><p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:${p.headerText ?? '#ffffff'};text-transform:uppercase;letter-spacing:0.06em;">${p.titleText ?? 'Item Specifics'}</p></td></tr>` : ''}
  ${rowsHtml}
</table>
<!--[/riazify:specs_table:${id}]-->`
    },
  },

  // ── 4. Zebra Striped ──────────────────────────────────────────────────────
  {
    id: 'zebra',
    label: 'Zebra Striped',
    description: 'Alternating row colours, clean accent styling',
    toHtml(p: any, id: string): string {
      const rawRows = p.rows?.length ? p.rows : FALLBACK_ROWS
      const accentColor = p.headerBg ?? '#7530fb'
      const rowsHtml = rawRows.map((r: any, i: number) => {
        const fb = FALLBACK_ROWS[i % FALLBACK_ROWS.length]?.value ?? 'Standard'
        const val = cleanRowValue(r.value, fb)
        return `
      <tr style="background-color:${i % 2 === 0 ? '#ffffff' : '#f5f3ff'};">
        <td class="st-zb-key-${id}" style="width:40%;padding:11px 20px;font-family:Arial,sans-serif;font-size:${p.fontSize ?? 13}px;font-weight:700;color:${accentColor};word-break:break-word;">${r.key}</td>
        <td class="st-zb-val-${id}" style="padding:11px 20px;font-family:Arial,sans-serif;font-size:${p.fontSize ?? 13}px;color:#4b5563;word-break:break-word;">${val}</td>
      </tr>`
      }).join('')

      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .st-zb-key-${id} { width: 40% !important; padding: 8px 10px !important; font-size: 11px !important; }
  .st-zb-val-${id} { padding: 8px 10px !important; font-size: 11px !important; }
  .st-zb-head-${id} { padding: 10px 12px !important; font-size: 13px !important; }
}
</style>`

      return `<!--[riazify:specs_table:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:#ffffff;border:1px solid #e5e7eb;table-layout:fixed;">
  ${p.showTitle !== false ? `<tr><td colspan="2" class="st-zb-head-${id}" style="padding:12px 20px;border-bottom:3px solid ${accentColor};"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${accentColor};">${p.titleText ?? 'Item Specifics'}</p></td></tr>` : ''}
  ${rowsHtml}
</table>
<!--[/riazify:specs_table:${id}]-->`
    },
  },

  // ── 5. Card Style (Curve-Free, 2 Columns Side-by-Side) ────────────────────
  {
    id: 'card',
    label: 'Card Style',
    description: 'Each spec as its own styled card',
    toHtml(p: any, id: string): string {
      const rawRows = p.rows?.length ? p.rows : FALLBACK_ROWS
      const mid = Math.ceil(rawRows.length / 2)
      const left = rawRows.slice(0, mid)
      const right = rawRows.slice(mid)

      const makeCards = (items: any[]) => items.map((r: any, i: number) => {
        const fb = FALLBACK_ROWS[i % FALLBACK_ROWS.length]?.value ?? 'Standard'
        const val = cleanRowValue(r.value, fb)
        return `
            <tr><td style="padding:3px 0;">
              <!-- Card border-radius removed -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f7ff;border:1px solid #ede9fe;table-layout:fixed;">
                <tr>
                  <td class="st-card-pad-${id}" style="padding:8px 10px;">
                    <p style="margin:0 0 2px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#7530fb;text-transform:uppercase;letter-spacing:0.04em;word-break:break-word;">${r.key}</p>
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#374151;font-weight:600;word-break:break-word;">${val}</p>
                  </td>
                </tr>
              </table>
            </td></tr>`
      }).join('')

      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .st-card-col-left-${id} { padding: 4px 4px 6px 8px !important; }
  .st-card-col-right-${id} { padding: 4px 8px 6px 4px !important; }
  .st-card-pad-${id} { padding: 6px 8px !important; }
  .st-card-title-${id} { padding: 12px 10px 4px !important; }
}
</style>`

      return `<!--[riazify:specs_table:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;background-color:${p.bgColor ?? '#ffffff'};table-layout:fixed;">
  ${p.showTitle !== false ? `<tr><td colspan="2" class="st-card-title-${id}" style="padding:16px 16px 8px;"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#1e1535;">${p.titleText ?? 'Item Specifics'}</p></td></tr>` : ''}
  <tr>
    <td class="st-card-col-left-${id}" width="50%" style="width:50% !important;padding:8px 8px 8px 16px;vertical-align:top;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;">${makeCards(left)}</table>
    </td>
    <td class="st-card-col-right-${id}" width="50%" style="width:50% !important;padding:8px 16px 8px 8px;vertical-align:top;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;">${makeCards(right)}</table>
    </td>
  </tr>
</table>
<!--[/riazify:specs_table:${id}]-->`
    },
  },

  // ── 6. Highlighted Header ─────────────────────────────────────────────────
  {
    id: 'highlighted',
    label: 'Highlighted Header',
    description: 'Bold coloured header row, clean rows below',
    toHtml(p: any, id: string): string {
      const rawRows = p.rows?.length ? p.rows : FALLBACK_ROWS
      const accentColor = p.headerBg ?? '#1e1535'
      const rowsHtml = rawRows.map((r: any, i: number) => {
        const fb = FALLBACK_ROWS[i % FALLBACK_ROWS.length]?.value ?? 'Standard'
        const val = cleanRowValue(r.value, fb)
        return `
      <tr>
        <td class="st-hl-key-${id}" style="width:40%;padding:10px 16px;font-family:Arial,sans-serif;font-size:${p.fontSize ?? 13}px;font-weight:600;color:#374151;background-color:#f9fafb;border-bottom:1px solid ${p.borderColor ?? '#e5e7eb'};border-right:1px solid ${p.borderColor ?? '#e5e7eb'};word-break:break-word;">${r.key}</td>
        <td class="st-hl-val-${id}" style="padding:10px 16px;font-family:Arial,sans-serif;font-size:${p.fontSize ?? 13}px;color:#6b7280;border-bottom:1px solid ${p.borderColor ?? '#e5e7eb'};word-break:break-word;">${val}</td>
      </tr>`
      }).join('')

      const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .st-hl-key-${id} { width: 40% !important; padding: 8px 10px !important; font-size: 11px !important; }
  .st-hl-val-${id} { padding: 8px 10px !important; font-size: 11px !important; }
  .st-hl-count-${id} { display: none !important; }
  .st-hl-head-${id} { padding: 10px 12px !important; }
}
</style>`

      return `<!--[riazify:specs_table:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;max-width:100% !important;margin:0 auto;border:1px solid ${p.borderColor ?? '#e5e7eb'};table-layout:fixed;">
  ${p.showTitle !== false ? `<tr>
    <td colspan="2" style="background-color:${accentColor};padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;">
        <tr>
          <td class="st-hl-head-${id}" style="padding:12px 16px;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${p.headerText ?? '#ffffff'};">${p.titleText ?? 'Item Specifics'}</p>
          </td>
          <td class="st-hl-count-${id}" style="padding:12px 16px;text-align:right;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.6);">${rawRows.length} specifications</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>` : ''}
  ${rowsHtml}
</table>
<!--[/riazify:specs_table:${id}]-->`
    },
  },

]

export function getSpecsTableVariant(variantId: string): BlockVariant {
  return specsTableVariants.find(v => v.id === variantId) ?? specsTableVariants[0]
}
