// components/ui/VisualEditor/variants/policy_tabs.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Policy Tabs — 6 layout variants (100% eBay Safe — All Content Visible Live)
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

const FALLBACK_TABS = [
  { label: 'Shipping', content: 'Free UK delivery via Royal Mail 48 (2–3 business days). Same-day dispatch on orders placed before 3pm Mon–Fri.' },
  { label: 'Returns', content: '30-day hassle-free returns. Items must be unused and in original packaging. Free return postage on faulty items.' },
  { label: 'Payment', content: 'We accept all major payment methods including PayPal, Visa, Mastercard, Apple Pay and Google Pay via eBay checkout.' },
  { label: 'Warranty', content: 'All items covered by a minimum 12-month manufacturer warranty. Contact us directly before opening a case.' },
]

const TAB_ICONS: Record<string, string> = {
  'Shipping': '🚚',
  'Returns': '↩',
  'Payment': '💳',
  'Warranty': '🛡️',
  'Policy': '📋',
  'Contact': '✉',
}

export const policyTabsVariants: BlockVariant[] = [

  // ── 1. Tabbed ─────────────────────────────────────────────────────────────
  {
    id: 'tabbed',
    label: 'Tabbed',
    description: 'Tab-badged policy panels — all sections visible live',
    toHtml(p: any, id: string): string {
      const tabs = p.tabs?.length ? p.tabs : FALLBACK_TABS
      const accent = p.activeBg ?? '#7530fb'
      const borderColor = p.borderColor ?? '#e5e7eb'
      const contentBg = p.contentBg ?? '#ffffff'
      const fontSize = p.fontSize ?? 13

      const sections = tabs.map((t: any) => `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
        <tr>
          <td style="padding:0;">
            <div style="display:inline-block;padding:8px 18px;background-color:${accent};color:#ffffff;font-family:Arial,sans-serif;font-size:12px;font-weight:700;border-radius:6px 6px 0 0;letter-spacing:0.3px;">
              ${t.label}
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 18px;background-color:${contentBg};border:1px solid ${borderColor};border-radius:0 6px 6px 6px;box-sizing:border-box;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:${fontSize}px;color:#4b5563;line-height:1.7;">${t.content}</p>
          </td>
        </tr>
      </table>`).join('')

      return `<!--[riazify:policy_tabs:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;background-color:${p.bgColor ?? '#f9fafb'};">
  <tr><td style="${pad(p)}">
    ${sections}
  </td></tr>
</table>
<!--[/riazify:policy_tabs:${id}]-->`
    },
  },

  // ── 2. Stacked ────────────────────────────────────────────────────────────
  {
    id: 'stacked',
    label: 'Stacked',
    description: 'Clean stacked cards with left accent border',
    toHtml(p: any, id: string): string {
      const tabs = p.tabs?.length ? p.tabs : FALLBACK_TABS
      const accentColor = p.activeBg ?? '#7530fb'
      const borderColor = p.borderColor ?? '#e5e7eb'
      const contentBg = p.contentBg ?? '#ffffff'
      const fontSize = p.fontSize ?? 13

      const sections = tabs.map((t: any) => `
      <tr>
        <td style="padding:0 0 14px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:4px solid ${accentColor};border-top:1px solid ${borderColor};border-right:1px solid ${borderColor};border-bottom:1px solid ${borderColor};border-radius:0 6px 6px 0;background-color:${contentBg};">
            <tr>
              <td style="padding:14px 18px;">
                <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${accentColor};">${t.label}</p>
                <p style="margin:0;font-family:Arial,sans-serif;font-size:${fontSize}px;color:#4b5563;line-height:1.7;">${t.content}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`).join('')

      return `<!--[riazify:policy_tabs:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;background-color:${p.bgColor ?? '#f9fafb'};">
  <tr><td style="${pad(p)}">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${sections}
    </table>
  </td></tr>
</table>
<!--[/riazify:policy_tabs:${id}]-->`
    },
  },

  // ── 3. Accordion (Framed Box Panels) ───────────────────────────────────────
  {
    id: 'accordion',
    label: 'Accordion',
    description: 'Framed policy panels with header banners — no clicks required',
    toHtml(p: any, id: string): string {
      const tabs = p.tabs?.length ? p.tabs : FALLBACK_TABS
      const accent = p.activeBg ?? '#7530fb'
      const borderColor = p.borderColor ?? '#e5e7eb'
      const contentBg = p.contentBg ?? '#ffffff'
      const fontSize = p.fontSize ?? 13

      const sections = tabs.map((t: any) => `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;border:1px solid ${borderColor};border-radius:6px;overflow:hidden;background-color:${contentBg};">
        <tr>
          <td style="padding:10px 16px;background-color:${accent};color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.3px;">
            ${t.label}
          </td>
        </tr>
        <tr>
          <td style="padding:14px 18px;background-color:${contentBg};font-family:Arial,sans-serif;font-size:${fontSize}px;color:#4b5563;line-height:1.7;">
            ${t.content}
          </td>
        </tr>
      </table>`).join('')

      return `<!--[riazify:policy_tabs:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;background-color:${p.bgColor ?? '#f9fafb'};">
  <tr><td style="${pad(p)}">
    ${sections}
  </td></tr>
</table>
<!--[/riazify:policy_tabs:${id}]-->`
    },
  },

  // ── 4. Side Nav (Row Split Matrix) ────────────────────────────────────────
  {
    id: 'side-nav',
    label: 'Side Nav',
    description: 'Two-column policy matrix — label on left, answer on right',
    toHtml(p: any, id: string): string {
      const tabs = p.tabs?.length ? p.tabs : FALLBACK_TABS
      const accentColor = p.activeBg ?? '#7530fb'
      const borderColor = p.borderColor ?? '#e5e7eb'
      const contentBg = p.contentBg ?? '#ffffff'
      const fontSize = p.fontSize ?? 13

      const rows = tabs.map((t: any, i: number) => `
      <tr style="${i > 0 ? `border-top:1px solid ${borderColor};` : ''}">
        <td width="28%" style="vertical-align:top;padding:14px 16px;background-color:#f8fafc;border-right:1px solid ${borderColor};${i > 0 ? `border-top:1px solid ${borderColor};` : ''}">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${accentColor};">${t.label}</p>
        </td>
        <td width="72%" style="vertical-align:top;padding:14px 18px;background-color:${contentBg};${i > 0 ? `border-top:1px solid ${borderColor};` : ''}">
          <p style="margin:0;font-family:Arial,sans-serif;font-size:${fontSize}px;color:#4b5563;line-height:1.7;">${t.content}</p>
        </td>
      </tr>`).join('')

      return `<!--[riazify:policy_tabs:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;background-color:${p.bgColor ?? '#f9fafb'};">
  <tr><td style="${pad(p)}">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${borderColor};border-radius:8px;overflow:hidden;">
      ${rows}
    </table>
  </td></tr>
</table>
<!--[/riazify:policy_tabs:${id}]-->`
    },
  },

  // ── 5. Pills Nav ──────────────────────────────────────────────────────────
  {
    id: 'pills-nav',
    label: 'Pills Nav',
    description: 'Pill-tagged cards showing every policy live',
    toHtml(p: any, id: string): string {
      const tabs = p.tabs?.length ? p.tabs : FALLBACK_TABS
      const accentColor = p.activeBg ?? '#7530fb'
      const borderColor = p.borderColor ?? '#e5e7eb'
      const contentBg = p.contentBg ?? '#ffffff'
      const fontSize = p.fontSize ?? 13

      const cards = tabs.map((t: any) => `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;background-color:${contentBg};border:1px solid ${borderColor};border-radius:8px;">
        <tr>
          <td style="padding:14px 18px;">
            <div style="margin-bottom:8px;">
              <span style="display:inline-block;padding:4px 14px;background-color:${accentColor};color:#ffffff;font-family:Arial,sans-serif;font-size:11px;font-weight:700;border-radius:20px;letter-spacing:0.5px;text-transform:uppercase;">${t.label}</span>
            </div>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:${fontSize}px;color:#4b5563;line-height:1.7;">${t.content}</p>
          </td>
        </tr>
      </table>`).join('')

      return `<!--[riazify:policy_tabs:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;background-color:${p.bgColor ?? '#f9fafb'};">
  <tr><td style="${pad(p)}">
    ${cards}
  </td></tr>
</table>
<!--[/riazify:policy_tabs:${id}]-->`
    },
  },

  // ── 6. Icon Tabs ──────────────────────────────────────────────────────────
  {
    id: 'icon-tabs',
    label: 'Icon Tabs',
    description: 'Icon guarantee feature cards — all policies visible with icons',
    toHtml(p: any, id: string): string {
      const tabs = p.tabs?.length ? p.tabs : FALLBACK_TABS
      const accentColor = p.activeBg ?? '#7530fb'
      const borderColor = p.borderColor ?? '#e5e7eb'
      const contentBg = p.contentBg ?? '#ffffff'
      const fontSize = p.fontSize ?? 13

      const items = tabs.map((t: any) => `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;background-color:${contentBg};border:1px solid ${borderColor};border-radius:8px;">
        <tr>
          <td width="56" style="vertical-align:middle;text-align:center;padding:14px 10px 14px 16px;">
            <div style="width:40px;height:40px;line-height:40px;border-radius:8px;background-color:${p.inactiveBg ?? '#f3f4f6'};text-align:center;font-size:20px;display:inline-block;">
              ${TAB_ICONS[t.label] ?? '📋'}
            </div>
          </td>
          <td style="vertical-align:middle;padding:14px 16px 14px 8px;">
            <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${accentColor};">${t.label}</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:${fontSize}px;color:#4b5563;line-height:1.65;">${t.content}</p>
          </td>
        </tr>
      </table>`).join('')

      return `<!--[riazify:policy_tabs:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;background-color:${p.bgColor ?? '#f9fafb'};">
  <tr><td style="${pad(p)}">
    ${items}
  </td></tr>
</table>
<!--[/riazify:policy_tabs:${id}]-->`
    },
  },

]

export function getPolicyTabsVariant(variantId: string): BlockVariant {
  return policyTabsVariants.find(v => v.id === variantId) ?? policyTabsVariants[0]
}
