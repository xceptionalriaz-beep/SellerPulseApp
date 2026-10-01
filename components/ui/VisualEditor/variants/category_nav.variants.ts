// components/ui/VisualEditor/variants/category_nav.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Category Navigation — 10 High-Converting eBay Layout Variants (Polished)
// Free:    cat-classic-dark, cat-minimalist-divider
// Pro:     cat-pill-badge, cat-subtle-underline, cat-two-tier-grid,
//          cat-icon-hybrid, cat-modern-glass, cat-wholesale-jump,
//          cat-high-contrast-flash, cat-elite-luxury
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
    id: string
    label: string
    description: string
    toHtml: (props: any, id: string) => string
}

// ─── Shared Helpers ──────────────────────────────────────────────────────────
function pad(p: any, defaultT = 12, defaultR = 20, defaultB = 12, defaultL = 20): string {
    const top = p.paddingTop ?? defaultT
    const right = p.paddingRight ?? defaultR
    const bottom = p.paddingBottom ?? defaultB
    const left = p.paddingLeft ?? defaultL
    return `padding:${top}px ${right}px ${bottom}px ${left}px;`
}

function bg(p: any, defaultBg = '#1e1535'): string {
    return p.bgColor ?? defaultBg
}

function linkCol(p: any, defaultCol = '#ffffff'): string {
    return p.linkColor ?? p.textColor ?? defaultCol
}

function activeCol(p: any, defaultCol = '#b8fa33'): string {
    return p.activeColor ?? defaultCol
}

function font(p: any, defaultFamily = 'Arial, sans-serif'): string {
    return p.fontFamily ? `${p.fontFamily}, Arial, sans-serif` : defaultFamily
}

interface CategoryItem {
    label: string
    url: string
    icon?: string
}

function getCategories(p: any): CategoryItem[] {
    // Support both p.categories and p.links for seamless backwards compatibility
    const rawList = (Array.isArray(p.categories) && p.categories.length > 0)
        ? p.categories
        : (Array.isArray(p.links) && p.links.length > 0)
            ? p.links
            : null

    if (rawList) {
        return rawList.map((c: any) =>
            typeof c === 'string'
                ? { label: c, url: '#' }
                : { label: c.label ?? 'Category', url: c.url ?? '#', icon: c.icon }
        )
    }
    return [
        { label: 'Electronics', url: '#', icon: '&#128241;' },
        { label: 'Clothing', url: '#', icon: '&#128085;' },
        { label: 'Home & Garden', url: '#', icon: '&#127969;' },
        { label: 'Collectibles', url: '#', icon: '&#127942;' },
        { label: 'Auto Parts', url: '#', icon: '&#128663;' },
    ]
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 1 — cat-classic-dark  [FREE DEFAULT]
// Flexbox & Wrapping Control: Calibrated padding and flex-wrap spacing to
// prevent category links from awkwardly breaking or colliding into each other.
// ─────────────────────────────────────────────────────────────────────────────
function classicDark(p: any, id: string): string {
    const f = font(p)
    const cats = getCategories(p)
    const lColor = linkCol(p, 'rgba(255,255,255,0.92)')
    const fs = p.fontSize ?? 13

    const linksHtml = cats
        .map(
            (c, idx) => `
      <td style="padding:4px 14px;white-space:nowrap;text-align:center;vertical-align:middle;">
        <a href="${c.url}" style="color:${idx === 0 ? activeCol(p) : lColor};text-decoration:none;font-size:${fs}px;font-weight:700;letter-spacing:0.35px;display:inline-block;line-height:1.4;">
          ${c.label}
        </a>
      </td>`
        )
        .join('')

    return `<!--[riazify:category_nav:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#1e1535')};${pad(p, 12, 16, 12, 16)}border-radius:8px;box-sizing:border-box;">
      <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;">
        <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border-collapse:collapse;">
          <tr>
            ${linksHtml}
          </tr>
        </table>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:category_nav:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 2 — cat-minimalist-divider  [FREE]
// Clean inline links separated by vertical pipe delimiters with controlled
// flex-wrap spacing to prevent awkward edge wrapping.
// ─────────────────────────────────────────────────────────────────────────────
function minimalistDivider(p: any, id: string): string {
    const f = font(p)
    const cats = getCategories(p)
    const lColor = linkCol(p, '#334155')
    const fs = p.fontSize ?? 12.5
    const sepColor = p.borderColor ?? '#cbd5e1'

    const linksHtml = cats
        .map(
            (c, idx) => `
      <span style="display:inline-flex;align-items:center;white-space:nowrap;padding:4px 0;">
        <a href="${c.url}" style="color:${lColor};text-decoration:none;font-size:${fs}px;font-weight:600;letter-spacing:0.25px;line-height:1.4;">
          ${c.label}
        </a>
        ${idx < cats.length - 1 ? `<span style="color:${sepColor};font-size:12px;user-select:none;margin:0 14px;opacity:0.6;">|</span>` : ''}
      </span>`
        )
        .join('\n')

    return `<!--[riazify:category_nav:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#ffffff')};${pad(p, 12, 16, 12, 16)}border-top:1px solid ${sepColor};border-bottom:1px solid ${sepColor};text-align:center;box-sizing:border-box;">
      <div style="display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:4px 0;width:100%;box-sizing:border-box;">
        ${linksHtml}
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:category_nav:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 3 — cat-pill-badge  [PRO]
// Normalized vertical alignment (items-center) & fixed height so pill capsules
// sit perfectly centered inside the navigation bar without baseline drift.
// ─────────────────────────────────────────────────────────────────────────────
function pillBadge(p: any, id: string): string {
    const f = font(p)
    const cats = getCategories(p)
    const lColor = linkCol(p, '#ffffff')
    const fs = p.fontSize ?? 12

    const pillsHtml = cats
        .map(
            (c, idx) => `
      <a href="${c.url}" style="display:inline-flex;align-items:center;justify-content:center;height:32px;box-sizing:border-box;background-color:${idx === 0 ? activeCol(p) : 'rgba(255,255,255,0.12)'};color:${idx === 0 ? '#1e1535' : lColor};text-decoration:none;font-size:${fs}px;font-weight:700;padding:0 16px;border-radius:100px;letter-spacing:0.3px;white-space:nowrap;line-height:1;vertical-align:middle;text-align:center;">
        ${c.label}
      </a>`
        )
        .join('\n')

    return `<!--[riazify:category_nav:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#1e1535')};${pad(p, 12, 16, 12, 16)}border-radius:10px;text-align:center;box-sizing:border-box;">
      <div style="display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:8px 10px;width:100%;box-sizing:border-box;">
        ${pillsHtml}
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:category_nav:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 4 — cat-subtle-underline  [PRO]
// Underline & Border Offsets: 10px bottom padding creates a calibrated offset
// cleanly below text descenders (g, y, p, q) without crowding letters.
// ─────────────────────────────────────────────────────────────────────────────
function subtleUnderline(p: any, id: string): string {
    const f = font(p)
    const cats = getCategories(p)
    const lColor = linkCol(p, '#1e293b')
    const accent = activeCol(p, '#7530fb')
    const fs = p.fontSize ?? 13

    const linksHtml = cats
        .map(
            (c, idx) => `
      <a href="${c.url}" style="color:${idx === 0 ? accent : lColor};text-decoration:none;font-size:${fs}px;font-weight:700;padding:6px 14px 10px 14px;border-bottom:2.5px solid ${idx === 0 ? accent : 'transparent'};letter-spacing:0.3px;white-space:nowrap;line-height:1.4;display:inline-flex;align-items:center;box-sizing:border-box;">
        ${c.label}
      </a>`
        )
        .join('\n')

    return `<!--[riazify:category_nav:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#ffffff')};${pad(p, 8, 16, 8, 16)}border-bottom:1px solid #e2e8f0;text-align:center;box-sizing:border-box;">
      <div style="display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:4px 8px;width:100%;box-sizing:border-box;">
        ${linksHtml}
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:category_nav:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 5 — cat-two-tier-grid  [PRO]
// Two-Tier Spacing: Distinct vertical row spacing (`row-gap: 12px` / `gap-y-3`)
// to prevent top and bottom category rows from colliding or cramping.
// ─────────────────────────────────────────────────────────────────────────────
function twoTierGrid(p: any, id: string): string {
    const f = font(p)
    const cats = getCategories(p)
    const extended = [
        ...cats,
        { label: 'New Deals', url: '#' },
        { label: 'Best Sellers', url: '#' },
        { label: 'Clearance', url: '#' },
    ]
    const lColor = linkCol(p, '#ffffff')
    const fs = p.fontSize ?? 11.5

    const pillsHtml = extended
        .map(
            (c, idx) => `
      <a href="${c.url}" style="background-color:rgba(255,255,255,0.08);color:${idx === 0 ? activeCol(p) : lColor};border:1px solid rgba(255,255,255,0.14);text-decoration:none;font-size:${fs}px;font-weight:600;padding:7px 14px;border-radius:6px;white-space:nowrap;line-height:1.2;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;">
        ${c.label}
      </a>`
        )
        .join('\n')

    return `<!--[riazify:category_nav:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#1e1535')};${pad(p, 16, 16, 16, 16)}border-radius:10px;text-align:center;box-sizing:border-box;">
      <div style="display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:12px 10px;row-gap:12px;column-gap:10px;max-width:660px;margin:0 auto;box-sizing:border-box;">
        ${pillsHtml}
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:category_nav:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 6 — cat-icon-hybrid  [PRO]
// Normalized vertical alignment (items-center): Icons and text labels are
// wrapped in inline-flex containers to guarantee matching baseline alignment.
// ─────────────────────────────────────────────────────────────────────────────
function iconHybrid(p: any, id: string): string {
    const f = font(p)
    const cats = getCategories(p)
    const lColor = linkCol(p, '#1e1535')
    const fs = p.fontSize ?? 12

    const defaultIcons: Record<string, string> = {
        'Electronics': '&#128241;',
        'Clothing': '&#128085;',
        'Home & Garden': '&#127969;',
        'Collectibles': '&#127942;',
        'Auto Parts': '&#128663;',
    }

    const itemsHtml = cats
        .map(c => {
            const icon = c.icon ?? defaultIcons[c.label] ?? '&#9733;'
            return `
      <a href="${c.url}" style="display:inline-flex;align-items:center;justify-content:center;height:36px;background-color:#ffffff;border:1px solid #e2e8f0;color:${lColor};text-decoration:none;font-size:${fs}px;font-weight:700;padding:0 14px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.04);gap:8px;white-space:nowrap;line-height:1;box-sizing:border-box;vertical-align:middle;">
        <span style="font-size:15px;line-height:1;display:inline-flex;align-items:center;justify-content:center;">${icon}</span>
        <span style="line-height:1;display:inline-flex;align-items:center;">${c.label}</span>
      </a>`
        })
        .join('\n')

    return `<!--[riazify:category_nav:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#f8fafc')};${pad(p, 12, 16, 12, 16)}border:1px solid #e2e8f0;border-radius:10px;text-align:center;box-sizing:border-box;">
      <div style="display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:8px 10px;width:100%;box-sizing:border-box;">
        ${itemsHtml}
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:category_nav:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 7 — cat-modern-glass  [PRO]
// Translucent frosted glass container with soft inner border, SaaS aesthetic,
// and balanced pill capsule links.
// ─────────────────────────────────────────────────────────────────────────────
function modernGlass(p: any, id: string): string {
    const f = font(p)
    const cats = getCategories(p)
    const lColor = linkCol(p, '#ffffff')
    const fs = p.fontSize ?? 12.5

    const linksHtml = cats
        .map(
            (c, idx) => `
      <a href="${c.url}" style="display:inline-flex;align-items:center;justify-content:center;height:32px;color:${idx === 0 ? activeCol(p) : lColor};text-decoration:none;font-size:${fs}px;font-weight:700;letter-spacing:0.3px;padding:0 14px;border-radius:6px;background-color:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);white-space:nowrap;line-height:1;box-sizing:border-box;">
        ${c.label}
      </a>`
        )
        .join('\n')

    return `<!--[riazify:category_nav:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#1e1535')};${pad(p, 12, 16, 12, 16)}border:1px solid rgba(255,255,255,0.16);border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.12);text-align:center;box-sizing:border-box;">
      <div style="display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:8px 10px;width:100%;box-sizing:border-box;">
        ${linksHtml}
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:category_nav:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 8 — cat-wholesale-jump  [PRO]
// Flexbox & Wrapping Control: Robust table container with horizontal scroll
// fallback to prevent awkward broken cells on compact viewports.
// ─────────────────────────────────────────────────────────────────────────────
function wholesaleJump(p: any, id: string): string {
    const f = font(p)
    const cats = getCategories(p)
    const fs = p.fontSize ?? 11

    const cellsHtml = cats
        .map(
            (c, idx) => `
      <td style="padding:10px 14px;text-align:center;vertical-align:middle;border-right:${idx < cats.length - 1 ? '1px solid #cbd5e1' : 'none'};background-color:${idx === 0 ? '#f1f5f9' : '#ffffff'};white-space:nowrap;box-sizing:border-box;">
        <a href="${c.url}" style="color:#0f172a;text-decoration:none;font-size:${fs}px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;display:block;line-height:1.2;">
          ${c.label}
        </a>
      </td>`
        )
        .join('')

    return `<!--[riazify:category_nav:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#ffffff')};border:1px solid #cbd5e1;border-radius:6px;overflow:hidden;padding:0;box-sizing:border-box;">
      <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;min-width:500px;">
          <tr>
            ${cellsHtml}
          </tr>
        </table>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:category_nav:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 9 — cat-high-contrast-flash  [PRO]
// Single-Line Rendering & Font Scaling: Font scaling (11.5px/12px) and bullet
// separator padding calibrated to guarantee seamless single-line rendering.
// ─────────────────────────────────────────────────────────────────────────────
function highContrastFlash(p: any, id: string): string {
    const f = font(p)
    const cats = getCategories(p)
    const barBg = p.bgColor ?? '#dc2626'
    const fs = p.fontSize ?? 11.5

    const linksHtml = cats
        .map(
            (c, idx) => `
      <td style="padding:4px 10px;white-space:nowrap;text-align:center;vertical-align:middle;">
        <a href="${c.url}" style="color:#ffffff;text-decoration:none;font-size:${fs}px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;display:inline-block;line-height:1.2;">
          ${c.label}${idx < cats.length - 1 ? ' <span style="opacity:0.6;margin-left:8px;font-size:10px;">&bull;</span>' : ''}
        </a>
      </td>`
        )
        .join('')

    return `<!--[riazify:category_nav:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${barBg};${pad(p, 10, 16, 10, 16)}border-radius:8px;box-shadow:0 3px 10px rgba(220,38,38,0.25);box-sizing:border-box;">
      <div style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;">
        <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border-collapse:collapse;">
          <tr>
            ${linksHtml}
          </tr>
        </table>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:category_nav:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT 10 — cat-elite-luxury  [PRO]
// Fixed Top Padding & Subheading Clearance: Curated collections badge has
// generous breathing room from top and bottom border rules.
// ─────────────────────────────────────────────────────────────────────────────
function eliteLuxury(p: any, id: string): string {
    const f = p.fontFamily ? `${p.fontFamily}, Georgia, serif` : 'Georgia, serif'
    const gold = p.accentColor ?? '#d97706'
    const cats = getCategories(p)
    const fs = p.fontSize ?? 12

    const linksHtml = cats
        .map(
            (c, idx) => `
      <span style="display:inline-flex;align-items:center;white-space:nowrap;padding:4px 0;">
        <a href="${c.url}" style="color:#111827;text-decoration:none;font-size:${fs}px;font-weight:600;letter-spacing:1.6px;text-transform:uppercase;line-height:1.3;">
          ${c.label}
        </a>
        ${idx < cats.length - 1 ? `<span style="color:${gold};font-size:10px;user-select:none;margin:0 12px;opacity:0.8;">&bull;</span>` : ''}
      </span>`
        )
        .join('\n')

    return `<!--[riazify:category_nav:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;">
  <tr>
    <td style="background-color:${bg(p, '#ffffff')};${pad(p, 22, 24, 20, 24)}border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;text-align:center;box-sizing:border-box;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:100%;box-sizing:border-box;">
        <div style="font-size:10px;font-weight:700;color:${gold};text-transform:uppercase;letter-spacing:2.5px;line-height:1;padding-top:4px;padding-bottom:2px;margin-bottom:2px;">
          &#10022; Curated Collections &#10022;
        </div>
        <div style="display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:4px 0;width:100%;box-sizing:border-box;">
          ${linksHtml}
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:category_nav:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export const categoryNavVariants: BlockVariant[] = [
    {
        id: 'cat-classic-dark',
        label: 'Classic Dark Bar',
        description: 'Clean full-width dark container with centered, evenly spaced text links',
        toHtml(props, id) { return classicDark(props, id) },
    },
    {
        id: 'cat-minimalist-divider',
        label: 'Minimalist Divider',
        description: 'Clean inline links separated by elegant vertical pipe delimiters',
        toHtml(props, id) { return minimalistDivider(props, id) },
    },
    {
        id: 'cat-pill-badge',
        label: 'Pill Badge Menu',
        description: 'Interactive rounded capsule pill buttons for each category item',
        toHtml(props, id) { return pillBadge(props, id) },
    },
    {
        id: 'cat-subtle-underline',
        label: 'Subtle Underline',
        description: 'Transparent bar with sleek accent bottom border and underline indicators',
        toHtml(props, id) { return subtleUnderline(props, id) },
    },
    {
        id: 'cat-two-tier-grid',
        label: 'Two-Tier Grid',
        description: 'Double-row compact layout for large inventory and multi-category browsing',
        toHtml(props, id) { return twoTierGrid(props, id) },
    },
    {
        id: 'cat-icon-hybrid',
        label: 'Icon & Text Hybrid',
        description: 'Category cards pairing vibrant icons with clean bold text labels',
        toHtml(props, id) { return iconHybrid(props, id) },
    },
    {
        id: 'cat-modern-glass',
        label: 'Modern Glassmorphism',
        description: 'Frosted glass container with translucent borders and SaaS-grade styling',
        toHtml(props, id) { return modernGlass(props, id) },
    },
    {
        id: 'cat-wholesale-jump',
        label: 'Wholesale Quick-Jump',
        description: 'Dense corporate B2B table for rapid commercial category scanning',
        toHtml(props, id) { return wholesaleJump(props, id) },
    },
    {
        id: 'cat-high-contrast-flash',
        label: 'High-Contrast Flash',
        description: 'Bold vibrant promotional bar commanding attention below the store header',
        toHtml(props, id) { return highContrastFlash(props, id) },
    },
    {
        id: 'cat-elite-luxury',
        label: 'Elite Luxury Nav',
        description: 'Centered serif typography with gold emblem and fine framing lines',
        toHtml(props, id) { return eliteLuxury(props, id) },
    },
]

export function getCategoryNavVariant(id: string): BlockVariant {
    return categoryNavVariants.find(v => v.id === id) ?? categoryNavVariants[0]
}
