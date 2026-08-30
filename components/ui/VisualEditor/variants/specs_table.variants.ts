// components/ui/VisualEditor/variants/specs_table.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Specs Table — 6 layout variants
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
    { key: 'Brand', value: '{{BRAND}}' },
    { key: 'Model', value: '{{MODEL}}' },
    { key: 'Condition', value: '{{ITEM_CONDITION}}' },
    { key: 'Colour', value: '{{COLOUR}}' },
    { key: 'SKU', value: '{{ITEM_SKU}}' },
    { key: 'Warranty', value: '12 Months' },
]

export const specsTableVariants: BlockVariant[] = [

    // ── 1. Full Table ─────────────────────────────────────────────────────────
    {
        id: 'full',
        label: 'Full Table',
        description: 'Standard two-column key/value table with header',
        toHtml(p: any, id: string): string {
            const rows = p.rows?.length ? p.rows : FALLBACK_ROWS
            const rowsHtml = rows.map((r: any, i: number) => `
      <tr style="background-color:${i % 2 === 0 ? (p.rowBg ?? '#ffffff') : (p.altRowBg ?? '#f8fafc')};">
        <td style="width:40%;padding:10px 16px;font-family:Arial,sans-serif;font-size:${p.fontSize ?? 13}px;font-weight:600;color:#374151;border-bottom:1px solid ${p.borderColor ?? '#e5e7eb'};">${r.key}</td>
        <td style="padding:10px 16px;font-family:Arial,sans-serif;font-size:${p.fontSize ?? 13}px;color:#6b7280;border-bottom:1px solid ${p.borderColor ?? '#e5e7eb'};">${r.value}</td>
      </tr>`).join('')
            const titleHtml = p.showTitle !== false
                ? `<tr><td colspan="2" style="background-color:${p.headerBg ?? '#1e1535'};padding:10px 16px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${p.headerText ?? '#ffffff'};">${p.titleText ?? 'Item Specifics'}</p>
                  </td></tr>` : ''
            return `<!--[riazify:specs_table:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};border:1px solid ${p.borderColor ?? '#e5e7eb'};">
  ${titleHtml}${rowsHtml}
</table>
<!--[/riazify:specs_table:${id}]-->`
        },
    },

    // ── 2. Two Column ─────────────────────────────────────────────────────────
    {
        id: 'two-column',
        label: 'Two Column',
        description: 'Specs split into two side-by-side columns',
        toHtml(p: any, id: string): string {
            const rows = p.rows?.length ? p.rows : FALLBACK_ROWS
            const mid = Math.ceil(rows.length / 2)
            const left = rows.slice(0, mid)
            const right = rows.slice(mid)
            const maxRows = Math.max(left.length, right.length)
            const rowsHtml = Array.from({ length: maxRows }, (_, i) => {
                const l = left[i]
                const r = right[i]
                return `<tr>
        <td style="width:25%;padding:8px 12px;font-family:Arial,sans-serif;font-size:12px;font-weight:600;color:#374151;border-bottom:1px solid ${p.borderColor ?? '#f3f4f6'};background-color:${p.altRowBg ?? '#f8fafc'};">${l?.key ?? ''}</td>
        <td style="width:25%;padding:8px 12px;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;border-bottom:1px solid ${p.borderColor ?? '#f3f4f6'};border-right:2px solid ${p.borderColor ?? '#e5e7eb'};">${l?.value ?? ''}</td>
        <td style="width:25%;padding:8px 12px;font-family:Arial,sans-serif;font-size:12px;font-weight:600;color:#374151;border-bottom:1px solid ${p.borderColor ?? '#f3f4f6'};background-color:${p.altRowBg ?? '#f8fafc'};">${r?.key ?? ''}</td>
        <td style="width:25%;padding:8px 12px;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;border-bottom:1px solid ${p.borderColor ?? '#f3f4f6'};">${r?.value ?? ''}</td>
      </tr>`
            }).join('')
            const titleHtml = p.showTitle !== false
                ? `<tr><td colspan="4" style="background-color:${p.headerBg ?? '#1e1535'};padding:10px 16px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${p.headerText ?? '#ffffff'};">${p.titleText ?? 'Item Specifics'}</p>
                  </td></tr>` : ''
            return `<!--[riazify:specs_table:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};border:1px solid ${p.borderColor ?? '#e5e7eb'};">
  ${titleHtml}${rowsHtml}
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
            const rows = p.rows?.length ? p.rows : FALLBACK_ROWS
            const rowsHtml = rows.map((r: any, i: number) => `
      <tr style="background-color:${i % 2 === 0 ? '#ffffff' : '#f9fafb'};">
        <td style="width:42%;padding:6px 12px;font-family:Arial,sans-serif;font-size:11px;font-weight:600;color:#4b5563;border-bottom:1px solid #f3f4f6;">${r.key}</td>
        <td style="padding:6px 12px;font-family:Arial,sans-serif;font-size:11px;color:#6b7280;border-bottom:1px solid #f3f4f6;">${r.value}</td>
      </tr>`).join('')
            return `<!--[riazify:specs_table:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:#ffffff;">
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
        description: 'Alternating row colours, no vertical borders',
        toHtml(p: any, id: string): string {
            const rows = p.rows?.length ? p.rows : FALLBACK_ROWS
            const accentColor = p.headerBg ?? '#7530fb'
            const rowsHtml = rows.map((r: any, i: number) => `
      <tr style="background-color:${i % 2 === 0 ? '#ffffff' : '#f5f3ff'};">
        <td style="width:40%;padding:11px 20px;font-family:Arial,sans-serif;font-size:${p.fontSize ?? 13}px;font-weight:700;color:${accentColor};">${r.key}</td>
        <td style="padding:11px 20px;font-family:Arial,sans-serif;font-size:${p.fontSize ?? 13}px;color:#4b5563;">${r.value}</td>
      </tr>`).join('')
            return `<!--[riazify:specs_table:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:#ffffff;">
  ${p.showTitle !== false ? `<tr><td colspan="2" style="padding:12px 20px;border-bottom:3px solid ${accentColor};"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${accentColor};">${p.titleText ?? 'Item Specifics'}</p></td></tr>` : ''}
  ${rowsHtml}
</table>
<!--[/riazify:specs_table:${id}]-->`
        },
    },

    // ── 5. Card Style ─────────────────────────────────────────────────────────
    {
        id: 'card',
        label: 'Card Style',
        description: 'Each spec as its own styled card',
        toHtml(p: any, id: string): string {
            const rows = p.rows?.length ? p.rows : FALLBACK_ROWS
            const mid = Math.ceil(rows.length / 2)
            const left = rows.slice(0, mid)
            const right = rows.slice(mid)
            const makeCards = (items: any[]) => items.map((r: any) => `
            <tr><td style="padding:4px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f7ff;border-radius:8px;border:1px solid #ede9fe;">
                <tr>
                  <td style="padding:8px 12px;">
                    <p style="margin:0 0 2px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#7530fb;text-transform:uppercase;letter-spacing:0.06em;">${r.key}</p>
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#374151;font-weight:600;">${r.value}</p>
                  </td>
                </tr>
              </table>
            </td></tr>`).join('')
            return `<!--[riazify:specs_table:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  ${p.showTitle !== false ? `<tr><td colspan="2" style="padding:16px 16px 8px;"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#1e1535;">${p.titleText ?? 'Item Specifics'}</p></td></tr>` : ''}
  <tr>
    <td width="50%" style="padding:8px 8px 8px 16px;vertical-align:top;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">${makeCards(left)}</table>
    </td>
    <td width="50%" style="padding:8px 16px 8px 8px;vertical-align:top;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">${makeCards(right)}</table>
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
            const rows = p.rows?.length ? p.rows : FALLBACK_ROWS
            const accentColor = p.headerBg ?? '#1e1535'
            const rowsHtml = rows.map((r: any, i: number) => `
      <tr>
        <td style="width:40%;padding:10px 16px;font-family:Arial,sans-serif;font-size:${p.fontSize ?? 13}px;font-weight:600;color:#374151;background-color:#f9fafb;border-bottom:1px solid ${p.borderColor ?? '#e5e7eb'};border-right:1px solid ${p.borderColor ?? '#e5e7eb'};">${r.key}</td>
        <td style="padding:10px 16px;font-family:Arial,sans-serif;font-size:${p.fontSize ?? 13}px;color:#6b7280;border-bottom:1px solid ${p.borderColor ?? '#e5e7eb'};">${r.value}</td>
      </tr>`).join('')
            return `<!--[riazify:specs_table:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;border:1px solid ${p.borderColor ?? '#e5e7eb'};">
  ${p.showTitle !== false ? `<tr>
    <td colspan="2" style="background-color:${accentColor};padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:12px 16px;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${p.headerText ?? '#ffffff'};">${p.titleText ?? 'Item Specifics'}</p>
          </td>
          <td style="padding:12px 16px;text-align:right;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.6);">${rows.length} specifications</p>
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
