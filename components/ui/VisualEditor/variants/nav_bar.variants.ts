// components/ui/VisualEditor/variants/nav_bar.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Nav Bar — 6 layout variants (Responsive Mobile & Full Size)
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

function renderDesktopLinks(links: any[], sep: string, textColor: string, fontSize: number, fontWeight: string, letterSpacing: number, id: string): string {
  return links.map((l: any, i: number) => `
    <span class="nb-item-${id}" style="display:inline-block;white-space:nowrap;margin:4px 0;line-height:1.4;">
      ${i > 0 && sep ? `<span class="nb-sep-${id}" style="padding:0 8px;color:${textColor};opacity:0.35;font-size:${fontSize}px;user-select:none;">${sep}</span>` : ''}
      <a href="${l.url ?? '#'}" class="nb-link-${id}" style="font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:${fontWeight};color:${textColor};text-decoration:none;letter-spacing:${(letterSpacing ?? 3) * 0.01}em;pointer-events:none;display:inline-block;">${l.label}</a>
    </span>`).join('')
}

export const navBarVariants: BlockVariant[] = [

  // ── 1. Dark ───────────────────────────────────────────────────────────────
  {
    id: 'dark',
    label: 'Dark',
    description: 'Dark background with light links — classic nav',
    toHtml(p: any, id: string): string {
      const links = p.links?.length ? p.links : FALLBACK_LINKS
      const text = p.textColor ?? '#94a3b8'
      const fSize = p.fontSize ?? 12
      const fWeight = p.fontWeight ?? '600'
      const lSpace = p.letterSpacing ?? 1
      const sep = p.separator ?? '|'

      return `<!--[riazify:nav_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .nb-td-${id} {
      padding: 10px 12px !important;
    }
    .nb-wrap-${id} {
      display: flex !important;
      flex-wrap: wrap !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 6px 12px !important;
      text-align: center !important;
    }
    .nb-item-${id} {
      margin: 2px 0 !important;
    }
    .nb-sep-${id} {
      display: none !important;
    }
    .nb-link-${id} {
      font-size: 11px !important;
      padding: 2px 4px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;width:100%;margin:0 auto;background-color:${p.bgColor ?? '#1e293b'};border-radius:${p.borderRadius ?? 0}px;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td class="nb-td-${id}" style="${pad(p)}text-align:${p.align ?? 'center'};box-sizing:border-box;">
      <div class="nb-wrap-${id}" style="text-align:${p.align ?? 'center'};box-sizing:border-box;">
        ${renderDesktopLinks(links, sep, text, fSize, fWeight, lSpace, id)}
      </div>
    </td>
  </tr>
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
      // Match thumbnail: ensure white background and dark text (ignores inherited dark background)
      const bg = (p.bgColor && p.bgColor !== '#1e293b' && p.bgColor !== '#1e1535') ? p.bgColor : '#ffffff'
      const text = (p.textColor && p.textColor !== '#ffffff') ? p.textColor : '#374151'
      const fSize = p.fontSize ?? 12
      const fWeight = p.fontWeight ?? '600'
      const lSpace = p.letterSpacing ?? 1
      const sep = p.separator ?? '·'

      return `<!--[riazify:nav_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .nb-td-${id} {
      padding: 10px 12px !important;
    }
    .nb-wrap-${id} {
      display: flex !important;
      flex-wrap: wrap !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 6px 12px !important;
      text-align: center !important;
    }
    .nb-item-${id} {
      margin: 2px 0 !important;
    }
    .nb-sep-${id} {
      display: none !important;
    }
    .nb-link-${id} {
      font-size: 11px !important;
      padding: 2px 4px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;margin:0 auto;background-color:${bg};border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;border-radius:${p.borderRadius ?? 0}px;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td class="nb-td-${id}" style="${pad(p)}text-align:${p.align ?? 'center'};box-sizing:border-box;">
      <div class="nb-wrap-${id}" style="text-align:${p.align ?? 'center'};box-sizing:border-box;">
        ${renderDesktopLinks(links, sep, text, fSize, fWeight, lSpace, id)}
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:nav_bar:${id}]-->`
    },
  },

  // ── 3. Underline Style ────────────────────────────────────────────────────
  {
    id: 'underline',
    label: 'Underline Style',
    description: 'White background, coloured underline accent on links',
    toHtml(p: any, id: string): string {
      const links = p.links?.length ? p.links : FALLBACK_LINKS
      // Match thumbnail: white background and dark text (ignore inherited dark mode)
      const bg = (p.bgColor && p.bgColor !== '#1e293b' && p.bgColor !== '#1e1535') ? p.bgColor : '#ffffff'
      const textColor = (p.textColor && p.textColor !== '#ffffff') ? p.textColor : '#374151'
      const accentColor = p.hoverColor ?? '#7530fb'
      const fSize = p.fontSize ?? 12
      const fWeight = p.fontWeight ?? '600'

      const linkItems = links.map((l: any, i: number) => `
        <div class="nb-und-item-${id}" style="display:inline-block;white-space:nowrap;border-bottom:2px solid ${i === 0 ? accentColor : 'transparent'};padding:0 8px 8px;margin:0 4px;box-sizing:border-box;">
          <a href="${l.url ?? '#'}" class="nb-link-${id}" style="font-family:Arial,Helvetica,sans-serif;font-size:${fSize}px;font-weight:${fWeight};color:${i === 0 ? accentColor : textColor};text-decoration:none;display:inline-block;">${l.label}</a>
        </div>`).join('')

      return `<!--[riazify:nav_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .nb-td-${id} {
      padding: 10px 10px 4px !important;
    }
    .nb-wrap-${id} {
      display: flex !important;
      flex-wrap: wrap !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 6px !important;
    }
    .nb-und-item-${id} {
      padding: 0 4px 6px !important;
      margin: 0 !important;
    }
    .nb-link-${id} {
      font-size: 11px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;margin:0 auto;background-color:${bg};border-bottom:1px solid #e5e7eb;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td class="nb-td-${id}" style="${pad(p)}text-align:${p.align ?? 'center'};box-sizing:border-box;">
      <div class="nb-wrap-${id}" style="text-align:${p.align ?? 'center'};box-sizing:border-box;">
        ${linkItems}
      </div>
    </td>
  </tr>
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
      // Match thumbnail: fresh light background, purple active pill, and clean dark text
      const bg = (p.bgColor && p.bgColor !== '#1e293b' && p.bgColor !== '#1e1535') ? p.bgColor : '#f9fafb'
      const textColor = (p.textColor && p.textColor !== '#ffffff') ? p.textColor : '#374151'
      const accentBg = (p.hoverColor && !['#8fff00', '#84cc16', '#a3e635', '#22c55e'].includes(p.hoverColor.toLowerCase())) ? p.hoverColor : '#7530fb'
      const fSize = p.fontSize ?? 11
      const fWeight = p.fontWeight ?? '600'

      const pillItems = links.map((l: any, i: number) => `
        <span class="nb-pill-item-${id}" style="display:inline-block;padding:2px;margin:3px 2px;box-sizing:border-box;">
          <a href="${l.url ?? '#'}" class="nb-pill-btn-${id}" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:${fSize}px;font-weight:${fWeight};color:${i === 0 ? '#ffffff' : textColor};text-decoration:none;background-color:${i === 0 ? accentBg : '#ffffff'};border:1px solid ${i === 0 ? accentBg : '#e2e8f0'};border-radius:20px;padding:5px 14px;white-space:nowrap;box-sizing:border-box;">${l.label}</a>
        </span>`).join('')

      return `<!--[riazify:nav_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .nb-td-${id} {
      padding: 10px 8px !important;
    }
    .nb-wrap-${id} {
      display: flex !important;
      flex-wrap: wrap !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 4px !important;
    }
    .nb-pill-item-${id} {
      margin: 2px !important;
      padding: 0 !important;
    }
    .nb-pill-btn-${id} {
      font-size: 10.5px !important;
      padding: 4px 10px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;margin:0 auto;background-color:${bg};border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td class="nb-td-${id}" style="${pad(p)}text-align:${p.align ?? 'center'};box-sizing:border-box;">
      <div class="nb-wrap-${id}" style="text-align:${p.align ?? 'center'};box-sizing:border-box;">
        ${pillItems}
      </div>
    </td>
  </tr>
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
      const text = p.textColor ?? '#94a3b8'
      const fSize = p.fontSize ?? 11
      const fWeight = p.fontWeight ?? '600'
      const lSpace = p.letterSpacing ?? 1
      const sep = p.separator ?? '·'

      return `<!--[riazify:nav_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .nb-brand-td-${id} {
      padding: 12px 14px 2px !important;
    }
    .nb-links-td-${id} {
      padding: 6px 10px 12px !important;
    }
    .nb-wrap-${id} {
      display: flex !important;
      flex-wrap: wrap !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 5px 10px !important;
    }
    .nb-item-${id} {
      margin: 2px 0 !important;
    }
    .nb-sep-${id} {
      display: none !important;
    }
    .nb-link-${id} {
      font-size: 10.5px !important;
      padding: 2px 4px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;width:100%;margin:0 auto;background-color:${p.bgColor ?? '#1e293b'};border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td class="nb-brand-td-${id}" style="padding:14px 24px 4px;text-align:center;box-sizing:border-box;">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:900;color:#ffffff;letter-spacing:0.04em;">{{SELLER_NAME}}</p>
    </td>
  </tr>
  <tr>
    <td class="nb-links-td-${id}" style="padding:6px 24px 12px;text-align:center;box-sizing:border-box;">
      <div class="nb-wrap-${id}" style="text-align:center;box-sizing:border-box;">
        ${renderDesktopLinks(links, sep, text, fSize, fWeight, lSpace, id)}
      </div>
    </td>
  </tr>
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
      const text = p.textColor ?? '#94a3b8'
      const fSize = p.fontSize ?? 11
      const fWeight = p.fontWeight ?? '600'
      const lSpace = p.letterSpacing ?? 1
      const sep = p.separator ?? '|'

      return `<!--[riazify:nav_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .nb-row-${id} {
      display: flex !important;
      flex-direction: column !important;
      text-align: center !important;
      align-items: center !important;
      padding: 10px 12px !important;
    }
    .nb-col-brand-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 0 6px 0 !important;
    }
    .nb-col-links-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 !important;
    }
    .nb-wrap-${id} {
      display: flex !important;
      flex-wrap: wrap !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 5px 10px !important;
      text-align: center !important;
    }
    .nb-item-${id} {
      margin: 2px 0 !important;
    }
    .nb-sep-${id} {
      display: none !important;
    }
    .nb-link-${id} {
      font-size: 10.5px !important;
      padding: 2px 4px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;width:100%;margin:0 auto;background-color:${p.bgColor ?? '#1e293b'};border-collapse:collapse;box-sizing:border-box;">
  <tr class="nb-row-${id}">
    <td class="nb-col-brand-${id}" style="padding:10px 20px;vertical-align:middle;box-sizing:border-box;">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:900;color:#ffffff;">{{SELLER_NAME}}</p>
    </td>
    <td class="nb-col-links-${id}" style="padding:10px 20px;text-align:right;vertical-align:middle;box-sizing:border-box;">
      <div class="nb-wrap-${id}" style="text-align:right;box-sizing:border-box;">
        ${renderDesktopLinks(links, sep, text, fSize, fWeight, lSpace, id)}
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:nav_bar:${id}]-->`
    },
  },

  // ── 7. PowerSeller Tabs ───────────────────────────────────────────────────
  {
    id: 'tabs',
    label: 'PowerSeller Tabs',
    description: 'eBay flagship store tabbed layout with active top-accent line',
    toHtml(p: any, id: string): string {
      const links = p.links?.length ? p.links : FALLBACK_LINKS
      const bg = p.bgColor ?? '#f8fafc'
      const text = p.textColor ?? '#334155'
      const accent = p.hoverColor ?? '#7530fb'
      const fSize = p.fontSize ?? 12
      const fWeight = p.fontWeight ?? '600'

      const tabItems = links.map((l: any, i: number) => {
        const isActive = i === 0
        const tabBg = isActive ? '#ffffff' : 'transparent'
        const tabBorderTop = isActive ? `3px solid ${accent}` : '3px solid transparent'
        const tabText = isActive ? accent : text
        return `
          <div class="nb-tab-${id}" style="display:inline-block;margin:0 2px -1px 2px;vertical-align:bottom;box-sizing:border-box;">
            <a href="${l.url ?? '#'}" class="nb-link-${id}" style="display:inline-block;padding:9px 18px 8px 18px;font-family:Arial,Helvetica,sans-serif;font-size:${fSize}px;font-weight:${fWeight};color:${tabText};text-decoration:none;background-color:${tabBg};border-top:${tabBorderTop};border-left:1px solid ${isActive ? '#e2e8f0' : 'transparent'};border-right:1px solid ${isActive ? '#e2e8f0' : 'transparent'};border-top-left-radius:4px;border-top-right-radius:4px;white-space:nowrap;pointer-events:none;box-sizing:border-box;">
              ${l.label}
            </a>
          </div>`
      }).join('')

      return `<!--[riazify:nav_bar:${id}]-->
<style>
  @media only screen and (max-width: 600px) {
    .nb-wrap-${id} {
      display: flex !important;
      flex-wrap: wrap !important;
      justify-content: center !important;
      gap: 4px !important;
    }
    .nb-tab-${id} {
      margin: 0 !important;
    }
    .nb-link-${id} {
      font-size: 11px !important;
      padding: 6px 10px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;margin:0 auto;background-color:${bg};border-bottom:1px solid #cbd5e1;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td class="nb-td-${id}" style="${pad(p)}padding-bottom:0px !important;text-align:${p.align ?? 'center'};box-sizing:border-box;">
      <div class="nb-wrap-${id}" style="text-align:${p.align ?? 'center'};box-sizing:border-box;">
        ${tabItems}
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:nav_bar:${id}]-->`
    },
  },

  // ── 8. Segmented Card Tiles ───────────────────────────────────────────────
  {
    id: 'boxed_tiles',
    label: 'Segmented Tiles',
    description: 'Modern tactile card tiles with individual borders for mobile tapping',
    toHtml(p: any, id: string): string {
      const links = p.links?.length ? p.links : FALLBACK_LINKS
      // Match thumbnail: ignore dark mode background (#1e1535 / #1e293b / #0f172a) and use fresh light background
      const bg = (p.bgColor && p.bgColor !== '#1e293b' && p.bgColor !== '#1e1535' && p.bgColor !== '#0f172a') ? p.bgColor : '#f8fafc'
      const text = (p.textColor && p.textColor !== '#ffffff' && p.textColor !== '#94a3b8') ? p.textColor : '#1e293b'
      const accent = p.hoverColor ?? '#7530fb'
      const fSize = p.fontSize ?? 12
      const fWeight = p.fontWeight ?? '600'

      const tileItems = links.map((l: any, i: number) => {
        const isFirst = i === 0
        const itemBg = '#ffffff'
        const borderCol = isFirst ? accent : '#e2e8f0'
        const linkColor = isFirst ? accent : text
        return `
          <div class="nb-tile-${id}" style="display:inline-block;margin:4px 4px;vertical-align:middle;box-sizing:border-box;">
            <a href="${l.url ?? '#'}" class="nb-link-${id}" style="display:inline-block;padding:7px 16px;font-family:Arial,Helvetica,sans-serif;font-size:${fSize}px;font-weight:${fWeight};color:${linkColor};text-decoration:none;background-color:${itemBg};border:1px solid ${borderCol};border-radius:6px;box-shadow:0 1px 2px rgba(0,0,0,0.03);white-space:nowrap;pointer-events:none;box-sizing:border-box;">
              ${isFirst ? `<span style="display:inline-block;width:6px;height:6px;background-color:${accent};border-radius:50%;margin-right:6px;vertical-align:middle;"></span>` : ''}${l.label}
            </a>
          </div>`
      }).join('')

      return `<!--[riazify:nav_bar:${id}]-->
<style>
  @media only screen and (max-width: 600px) {
    .nb-wrap-${id} {
      display: flex !important;
      flex-wrap: wrap !important;
      justify-content: center !important;
      gap: 4px !important;
    }
    .nb-tile-${id} {
      margin: 2px !important;
    }
    .nb-link-${id} {
      font-size: 11px !important;
      padding: 6px 10px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;margin:0 auto;background-color:${bg};border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td class="nb-td-${id}" style="${pad(p)}text-align:${p.align ?? 'center'};box-sizing:border-box;">
      <div class="nb-wrap-${id}" style="text-align:${p.align ?? 'center'};box-sizing:border-box;">
        ${tileItems}
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:nav_bar:${id}]-->`
    },
  },

  // ── 9. Dual-Tone Brand Ribbon ─────────────────────────────────────────────
  {
    id: 'brand_ribbon',
    label: 'Brand Ribbon',
    description: 'High-contrast retailer bar with vivid top accent stripe and uppercase links',
    toHtml(p: any, id: string): string {
      const links = p.links?.length ? p.links : FALLBACK_LINKS
      const bg = p.bgColor ?? '#0f172a'
      const text = p.textColor ?? '#f8fafc'
      const accent = p.hoverColor ?? '#7530fb'
      const fSize = p.fontSize ?? 11
      const fWeight = p.fontWeight ?? '700'
      const lSpace = p.letterSpacing ?? 2

      const linkItems = links.map((l: any, i: number) => `
        <div class="nb-ribbon-item-${id}" style="display:inline-block;margin:0;vertical-align:middle;box-sizing:border-box;">
          <a href="${l.url ?? '#'}" class="nb-link-${id}" style="display:inline-block;padding:8px 16px;font-family:Arial,Helvetica,sans-serif;font-size:${fSize}px;font-weight:${fWeight};color:${i === 0 ? '#ffffff' : text};text-decoration:none;text-transform:uppercase;letter-spacing:${lSpace * 0.05}em;white-space:nowrap;pointer-events:none;box-sizing:border-box;${i === 0 ? `background-color:rgba(255,255,255,0.08);border-radius:4px;` : ''}">
            ${l.label}
          </a>
        </div>`).join('')

      return `<!--[riazify:nav_bar:${id}]-->
<style>
  @media only screen and (max-width: 600px) {
    .nb-wrap-${id} {
      display: flex !important;
      flex-wrap: wrap !important;
      justify-content: center !important;
      gap: 2px !important;
    }
    .nb-link-${id} {
      font-size: 10px !important;
      padding: 6px 8px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;margin:0 auto;background-color:${bg};border-top:3px solid ${accent};border-bottom:1px solid #1e293b;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td class="nb-td-${id}" style="${pad(p)}text-align:${p.align ?? 'center'};box-sizing:border-box;">
      <div class="nb-wrap-${id}" style="text-align:${p.align ?? 'center'};box-sizing:border-box;">
        ${linkItems}
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:nav_bar:${id}]-->`
    },
  },

  // ── 10. Boutique Dot Divider ──────────────────────────────────────────────
  {
    id: 'minimal_bullet',
    label: 'Boutique Bullet',
    description: 'Clean luxury double-hairline border with geometric bullet dot separators',
    toHtml(p: any, id: string): string {
      const links = p.links?.length ? p.links : FALLBACK_LINKS
      const bg = p.bgColor ?? '#ffffff'
      const text = p.textColor ?? '#27272a'
      const accent = p.hoverColor ?? '#7530fb'
      const fSize = p.fontSize ?? 12
      const fWeight = p.fontWeight ?? '500'
      const lSpace = p.letterSpacing ?? 2

      const linkItems = links.map((l: any, i: number) => `
        ${i > 0 ? `<span class="nb-bullet-${id}" style="display:inline-block;margin:0 12px;color:${accent};font-size:10px;vertical-align:middle;opacity:0.6;">•</span>` : ''}
        <span class="nb-boutique-item-${id}" style="display:inline-block;vertical-align:middle;box-sizing:border-box;">
          <a href="${l.url ?? '#'}" class="nb-link-${id}" style="font-family:Arial,Helvetica,sans-serif;font-size:${fSize}px;font-weight:${fWeight};color:${text};text-decoration:none;letter-spacing:${lSpace * 0.04}em;text-transform:uppercase;white-space:nowrap;pointer-events:none;">
            ${l.label}
          </a>
        </span>`).join('')

      return `<!--[riazify:nav_bar:${id}]-->
<style>
  @media only screen and (max-width: 600px) {
    .nb-wrap-${id} {
      display: flex !important;
      flex-wrap: wrap !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 6px !important;
    }
    .nb-bullet-${id} {
      margin: 0 4px !important;
      font-size: 8px !important;
    }
    .nb-link-${id} {
      font-size: 11px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;margin:0 auto;background-color:${bg};border-top:1px solid #e4e4e7;border-bottom:1px solid #e4e4e7;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td class="nb-td-${id}" style="${pad(p)}text-align:${p.align ?? 'center'};box-sizing:border-box;">
      <div class="nb-wrap-${id}" style="text-align:${p.align ?? 'center'};box-sizing:border-box;">
        ${linkItems}
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:nav_bar:${id}]-->`
    },
  },
]

export function getNavBarVariant(variantId?: string): BlockVariant {
  return navBarVariants.find(v => v.id === variantId) ?? navBarVariants[0]
}
