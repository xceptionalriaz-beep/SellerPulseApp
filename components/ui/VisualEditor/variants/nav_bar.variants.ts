// components/ui/VisualEditor/variants/nav_bar.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Nav Bar — 6 layout variants
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
    id: string
    label: string
    description: string
    toHtml: (props: any, id: string) => string
}

function pad(p: any): string {
    return `padding:${p.paddingTop ?? 10}px ${p.paddingRight ?? 24}px ${p.paddingBottom ?? 10}px ${p.paddingLeft ?? 24}px;`
}

const FALLBACK_LINKS = [
    { label: 'All Items', url: '{{STORE_URL}}' },
    { label: 'Electronics', url: '#' },
    { label: 'Accessories', url: '#' },
    { label: 'Bundles', url: '#' },
    { label: 'Contact Us', url: '#' },
]

function renderLinks(links: any[], sep: string, textColor: string, fontSize: number, fontWeight: string, letterSpacing: number): string {
    return links.map((l: any, i: number) => `
          ${i > 0 && sep ? `<td style="padding:0 6px;color:${textColor};opacity:0.3;font-size:${fontSize}px;">${sep}</td>` : ''}
          <td style="white-space:nowrap;">
            <a href="${l.url ?? '#'}" style="font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:${fontWeight};color:${textColor};text-decoration:none;letter-spacing:${(letterSpacing ?? 3) * 0.01}em;">${l.label}</a>
          </td>`).join('')
}

export const navBarVariants: BlockVariant[] = [

    // ── 1. Dark ───────────────────────────────────────────────────────────────
    {
        id: 'dark',
        label: 'Dark',
        description: 'Dark background with light links — classic nav',
        toHtml(p: any, id: string): string {
            const links = p.links?.length ? p.links : FALLBACK_LINKS
            return `<!--[riazify:nav_bar:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#1e293b'};border-radius:${p.borderRadius ?? 0}px;">
  <tr><td style="${pad(p)}text-align:${p.align ?? 'center'};">
    <table cellpadding="0" cellspacing="0" border="0" align="${p.align ?? 'center'}">
      <tr>${renderLinks(links, p.separator ?? '|', p.textColor ?? '#94a3b8', p.fontSize ?? 12, p.fontWeight ?? '600', p.letterSpacing ?? 1)}</tr>
    </table>
  </td></tr>
</table>
<!--[/riazify:nav_bar:${id}]-->`
        },
    },

    // ── 2. Light ──────────────────────────────────────────────────────────────
    {
        id: 'light',
        label: 'Light',
        description: 'White background with dark links',
        toHtml(p: any, id: string): string {
            const links = p.links?.length ? p.links : FALLBACK_LINKS
            return `<!--[riazify:nav_bar:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:#ffffff;border-top:1px solid #f3f4f6;border-bottom:1px solid #f3f4f6;border-radius:${p.borderRadius ?? 0}px;">
  <tr><td style="${pad(p)}text-align:${p.align ?? 'center'};">
    <table cellpadding="0" cellspacing="0" border="0" align="${p.align ?? 'center'}">
      <tr>${renderLinks(links, p.separator ?? '·', '#374151', p.fontSize ?? 12, p.fontWeight ?? '600', p.letterSpacing ?? 1)}</tr>
    </table>
  </td></tr>
</table>
<!--[/riazify:nav_bar:${id}]-->`
        },
    },

    // ── 3. Underline Style ────────────────────────────────────────────────────
    {
        id: 'underline',
        label: 'Underline Style',
        description: 'Transparent background, coloured underline accent on links',
        toHtml(p: any, id: string): string {
            const links = p.links?.length ? p.links : FALLBACK_LINKS
            const accentColor = p.hoverColor ?? '#7530fb'
            const linkCells = links.map((l: any, i: number) => `
          ${i > 0 ? `<td style="width:16px;"></td>` : ''}
          <td style="white-space:nowrap;border-bottom:2px solid ${i === 0 ? accentColor : 'transparent'};padding-bottom:8px;">
            <a href="${l.url ?? '#'}" style="font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize ?? 12}px;font-weight:${p.fontWeight ?? '600'};color:${i === 0 ? accentColor : (p.textColor ?? '#374151')};text-decoration:none;">${l.label}</a>
          </td>`).join('')
            return `<!--[riazify:nav_bar:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};border-bottom:1px solid #e5e7eb;">
  <tr><td style="${pad(p)}text-align:${p.align ?? 'center'};">
    <table cellpadding="0" cellspacing="0" border="0" align="${p.align ?? 'center'}">
      <tr>${linkCells}</tr>
    </table>
  </td></tr>
</table>
<!--[/riazify:nav_bar:${id}]-->`
        },
    },

    // ── 4. Pills Style ────────────────────────────────────────────────────────
    {
        id: 'pills',
        label: 'Pills Style',
        description: 'Each link is a rounded pill button',
        toHtml(p: any, id: string): string {
            const links = p.links?.length ? p.links : FALLBACK_LINKS
            const accentBg = p.hoverColor ?? '#7530fb'
            const pillCells = links.map((l: any, i: number) => `
          <td style="padding:0 3px;">
            <a href="${l.url ?? '#'}" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize ?? 11}px;font-weight:${p.fontWeight ?? '600'};color:${i === 0 ? '#ffffff' : (p.textColor ?? '#374151')};text-decoration:none;background-color:${i === 0 ? accentBg : 'transparent'};border:1px solid ${i === 0 ? accentBg : '#e5e7eb'};border-radius:20px;padding:5px 14px;white-space:nowrap;">${l.label}</a>
          </td>`).join('')
            return `<!--[riazify:nav_bar:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#f9fafb'};">
  <tr><td style="${pad(p)}text-align:${p.align ?? 'center'};">
    <table cellpadding="0" cellspacing="0" border="0" align="${p.align ?? 'center'}">
      <tr>${pillCells}</tr>
    </table>
  </td></tr>
</table>
<!--[/riazify:nav_bar:${id}]-->`
        },
    },

    // ── 5. Centered Brand ─────────────────────────────────────────────────────
    {
        id: 'centered',
        label: 'Centered',
        description: 'Store name centred above, all links centred below',
        toHtml(p: any, id: string): string {
            const links = p.links?.length ? p.links : FALLBACK_LINKS
            return `<!--[riazify:nav_bar:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#1e293b'};">
  <tr><td style="padding:14px 24px 4px;text-align:center;">
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:900;color:#ffffff;letter-spacing:0.04em;">{{SELLER_NAME}}</p>
  </td></tr>
  <tr><td style="padding:6px 24px 12px;text-align:center;">
    <table cellpadding="0" cellspacing="0" border="0" align="center">
      <tr>${renderLinks(links, p.separator ?? '·', p.textColor ?? '#94a3b8', p.fontSize ?? 11, p.fontWeight ?? '600', p.letterSpacing ?? 1)}</tr>
    </table>
  </td></tr>
</table>
<!--[/riazify:nav_bar:${id}]-->`
        },
    },

    // ── 6. Left Aligned ───────────────────────────────────────────────────────
    {
        id: 'left-aligned',
        label: 'Left Aligned',
        description: 'Store name left, navigation links right',
        toHtml(p: any, id: string): string {
            const links = p.links?.length ? p.links : FALLBACK_LINKS
            return `<!--[riazify:nav_bar:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#1e293b'};">
  <tr>
    <td style="padding:10px 20px;vertical-align:middle;">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:900;color:#ffffff;">{{SELLER_NAME}}</p>
    </td>
    <td style="padding:10px 20px;text-align:right;vertical-align:middle;">
      <table cellpadding="0" cellspacing="0" border="0" align="right">
        <tr>${renderLinks(links, p.separator ?? '|', p.textColor ?? '#94a3b8', p.fontSize ?? 11, p.fontWeight ?? '600', p.letterSpacing ?? 1)}</tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:nav_bar:${id}]-->`
        },
    },

]

export function getNavBarVariant(variantId: string): BlockVariant {
    return navBarVariants.find(v => v.id === variantId) ?? navBarVariants[0]
}
