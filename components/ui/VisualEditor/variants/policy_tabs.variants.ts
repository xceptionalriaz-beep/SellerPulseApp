// components/ui/VisualEditor/variants/policy_tabs.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Policy Tabs — 6 layout variants
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

    // ── 1. Tabbed (classic) ───────────────────────────────────────────────────
    {
        id: 'tabbed',
        label: 'Tabbed',
        description: 'Classic tab buttons at top, content below',
        toHtml(p: any, id: string): string {
            const tabs = p.tabs?.length ? p.tabs : FALLBACK_TABS
            const tabBtns = tabs.map((t: any, i: number) => `
      <td style="padding:0;">
        <div style="display:inline-block;padding:10px 20px;background-color:${i === 0 ? (p.activeBg ?? '#7530fb') : (p.inactiveBg ?? '#f3f4f6')};color:${i === 0 ? (p.activeText ?? '#ffffff') : (p.inactiveText ?? '#6b7280')};font-family:Arial,sans-serif;font-size:${p.fontSize ?? 12}px;font-weight:${i === 0 ? '700' : '500'};border-radius:${i === 0 ? '6px 6px 0 0' : '6px 6px 0 0'};cursor:pointer;">${t.label}</div>
      </td>`).join('')
            const allContent = tabs.map((t: any, i: number) => `
      <tr ${i > 0 ? 'style="display:none;"' : ''}>
        <td style="padding:16px 20px;background-color:${p.contentBg ?? '#ffffff'};border:1px solid ${p.borderColor ?? '#e5e7eb'};border-top:none;">
          <p style="margin:0;font-family:Arial,sans-serif;font-size:${p.fontSize ?? 13}px;color:#4b5563;line-height:1.7;">${t.content}</p>
        </td>
      </tr>`).join('')
            return `<!--[riazify:policy_tabs:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#f9fafb'};">
  <tr><td style="${pad(p)}">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>${tabBtns}</tr>
      ${allContent}
    </table>
  </td></tr>
</table>
<!--[/riazify:policy_tabs:${id}]-->`
        },
    },

    // ── 2. Stacked ────────────────────────────────────────────────────────────
    {
        id: 'stacked',
        label: 'Stacked',
        description: 'All sections visible, stacked with bold headings',
        toHtml(p: any, id: string): string {
            const tabs = p.tabs?.length ? p.tabs : FALLBACK_TABS
            const accentColor = p.activeBg ?? '#7530fb'
            const sections = tabs.map((t: any) => `
      <tr>
        <td style="padding:0 0 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:3px solid ${accentColor};">
            <tr>
              <td style="padding:12px 16px;background-color:${p.contentBg ?? '#ffffff'};">
                <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${accentColor};">${t.label}</p>
                <p style="margin:0;font-family:Arial,sans-serif;font-size:${p.fontSize ?? 13}px;color:#4b5563;line-height:1.7;">${t.content}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`).join('')
            return `<!--[riazify:policy_tabs:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#f9fafb'};">
  <tr><td style="padding:20px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${sections}
    </table>
  </td></tr>
</table>
<!--[/riazify:policy_tabs:${id}]-->`
        },
    },

    // ── 3. Accordion ─────────────────────────────────────────────────────────
    {
        id: 'accordion',
        label: 'Accordion',
        description: 'Collapsible sections — first one open by default',
        toHtml(p: any, id: string): string {
            const tabs = p.tabs?.length ? p.tabs : FALLBACK_TABS
            const accentColor = p.activeBg ?? '#7530fb'
            const items = tabs.map((t: any, i: number) => `
      <tr>
        <td style="padding:0 0 ${i < tabs.length - 1 ? '4' : '0'}px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${p.borderColor ?? '#e5e7eb'};border-radius:6px;overflow:hidden;">
            <tr>
              <td style="background-color:${i === 0 ? accentColor : (p.inactiveBg ?? '#f9fafb')};padding:12px 16px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td>
                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${i === 0 ? '#ffffff' : '#374151'};">${t.label}</p>
                    </td>
                    <td style="text-align:right;">
                      <span style="font-family:Arial,sans-serif;font-size:16px;color:${i === 0 ? '#ffffff' : '#9ca3af'};">${i === 0 ? '▲' : '▼'}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            ${i === 0 ? `<tr>
              <td style="padding:14px 16px;background-color:${p.contentBg ?? '#ffffff'};">
                <p style="margin:0;font-family:Arial,sans-serif;font-size:${p.fontSize ?? 13}px;color:#4b5563;line-height:1.7;">${t.content}</p>
              </td>
            </tr>` : ''}
          </table>
        </td>
      </tr>`).join('')
            return `<!--[riazify:policy_tabs:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#f9fafb'};">
  <tr><td style="padding:16px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">${items}</table>
  </td></tr>
</table>
<!--[/riazify:policy_tabs:${id}]-->`
        },
    },

    // ── 4. Side Nav ───────────────────────────────────────────────────────────
    {
        id: 'side-nav',
        label: 'Side Nav',
        description: 'Tab navigation on left, content panel on right',
        toHtml(p: any, id: string): string {
            const tabs = p.tabs?.length ? p.tabs : FALLBACK_TABS
            const accentColor = p.activeBg ?? '#7530fb'
            const navItems = tabs.map((t: any, i: number) => `
              <tr>
                <td style="padding:0 0 2px;">
                  <div style="padding:10px 14px;background-color:${i === 0 ? accentColor : 'transparent'};border-radius:4px;border-left:3px solid ${i === 0 ? accentColor : 'transparent'};">
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;font-weight:${i === 0 ? '700' : '500'};color:${i === 0 ? '#ffffff' : (p.inactiveText ?? '#6b7280')};">${t.label}</p>
                  </div>
                </td>
              </tr>`).join('')
            const firstTab = tabs[0]
            return `<!--[riazify:policy_tabs:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#f9fafb'};">
  <tr><td style="${pad(p)}">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${p.borderColor ?? '#e5e7eb'};border-radius:8px;overflow:hidden;">
      <tr>
        <!-- Left nav -->
        <td width="28%" style="vertical-align:top;background-color:#f3f4f6;padding:12px 8px;border-right:1px solid ${p.borderColor ?? '#e5e7eb'};">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">${navItems}</table>
        </td>
        <!-- Right content -->
        <td width="72%" style="vertical-align:top;padding:20px;background-color:${p.contentBg ?? '#ffffff'};">
          <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${accentColor};">${firstTab?.label ?? ''}</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:${p.fontSize ?? 13}px;color:#4b5563;line-height:1.7;">${firstTab?.content ?? ''}</p>
        </td>
      </tr>
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
        description: 'Pill-style tab buttons, content below',
        toHtml(p: any, id: string): string {
            const tabs = p.tabs?.length ? p.tabs : FALLBACK_TABS
            const accentColor = p.activeBg ?? '#7530fb'
            const pills = tabs.map((t: any, i: number) => `
        <td style="padding:0 3px;">
          <span style="display:inline-block;padding:6px 18px;background-color:${i === 0 ? accentColor : '#ffffff'};color:${i === 0 ? '#ffffff' : (p.inactiveText ?? '#6b7280')};font-family:Arial,sans-serif;font-size:12px;font-weight:${i === 0 ? '700' : '500'};border-radius:20px;border:1px solid ${i === 0 ? accentColor : '#e5e7eb'};">${t.label}</span>
        </td>`).join('')
            const firstTab = tabs[0]
            return `<!--[riazify:policy_tabs:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#f9fafb'};">
  <tr><td style="padding:16px 16px 8px;text-align:center;">
    <table cellpadding="0" cellspacing="0" border="0" align="center">
      <tr>${pills}</tr>
    </table>
  </td></tr>
  <tr><td style="padding:8px 16px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${p.contentBg ?? '#ffffff'};border-radius:8px;border:1px solid ${p.borderColor ?? '#e5e7eb'};">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${accentColor};">${firstTab?.label ?? ''}</p>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:${p.fontSize ?? 13}px;color:#4b5563;line-height:1.7;">${firstTab?.content ?? ''}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
<!--[/riazify:policy_tabs:${id}]-->`
        },
    },

    // ── 6. Icon Tabs ──────────────────────────────────────────────────────────
    {
        id: 'icon-tabs',
        label: 'Icon Tabs',
        description: 'Tab buttons with icon and label, content below',
        toHtml(p: any, id: string): string {
            const tabs = p.tabs?.length ? p.tabs : FALLBACK_TABS
            const accentColor = p.activeBg ?? '#7530fb'
            const tabBtns = tabs.map((t: any, i: number) => `
        <td width="${Math.floor(100 / tabs.length)}%" style="text-align:center;padding:0 2px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${i === 0 ? accentColor : (p.inactiveBg ?? '#f3f4f6')};border-radius:6px 6px 0 0;">
            <tr><td style="padding:10px 8px;text-align:center;">
              <div style="font-size:18px;line-height:1;margin-bottom:4px;">${TAB_ICONS[t.label] ?? '📋'}</div>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:${i === 0 ? '#ffffff' : (p.inactiveText ?? '#6b7280')};text-transform:uppercase;letter-spacing:0.04em;">${t.label}</p>
            </td></tr>
          </table>
        </td>`).join('')
            const firstTab = tabs[0]
            return `<!--[riazify:policy_tabs:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#f9fafb'};">
  <tr><td style="${pad(p)}">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>${tabBtns}</tr>
      <tr>
        <td colspan="${tabs.length}" style="padding:16px 20px;background-color:${p.contentBg ?? '#ffffff'};border:1px solid ${p.borderColor ?? '#e5e7eb'};border-top:none;border-radius:0 0 6px 6px;">
          <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${accentColor};">${firstTab?.label ?? ''}</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:${p.fontSize ?? 13}px;color:#4b5563;line-height:1.7;">${firstTab?.content ?? ''}</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
<!--[/riazify:policy_tabs:${id}]-->`
        },
    },

]

export function getPolicyTabsVariant(variantId: string): BlockVariant {
    return policyTabsVariants.find(v => v.id === variantId) ?? policyTabsVariants[0]
}
