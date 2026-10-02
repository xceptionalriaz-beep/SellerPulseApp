// components/ui/VisualEditor/variants/section_label.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Section Label — 10 Radically Distinct, High-Converting Retail Layout Styles
// Built specifically for eBay listing templates to establish clear visual
// hierarchy, guide mobile buyers scanning for key information, and project
// merchant authority.
//
// ZERO AI-slop, zero blurry glassmorphism, zero fake neon glows.
// Authentic, battle-tested e-commerce and retail design architectures.
//
// 1. sl-classic-pill-capsule         — Current classic pill capsule with soft accent bg (KEPT 100% IDENTICAL)
// 2. sl-industrial-technical-stencil — Rugged gunmetal stencil with amber indicator & rule for tools & auto
// 3. sl-luxury-atelier-roman         — Editorial serif with flanking gold hairlines & diamond crest
// 4. sl-official-security-stamp      — Boxed verified seal with security borders for trust & certifications
// 5. sl-bold-solid-block-tag         — High-impact solid color banner block for sports, streetwear & electronics
// 6. sl-editorial-hairline-rule      — Minimalist numbered index rule (01 // SECTION) for clean lifestyle stores
// 7. sl-cyber-terminal-badge         — Tech command prompt bracket [ SYS // SPECS ] for PC hardware & gaming
// 8. sl-modern-dualtone-chip         — Segmented two-piece pill with distinct icon block & title rail
// 9. sl-warehouse-dispatch-ticket    — Perforated courier parcel tag with micro barcode for logistics & shipping
// 10. sl-compact-minimal-bullet      — Ultra-clean modern dot bullet with tracked uppercase for mobile scanning
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
    id: string
    label: string
    description: string
    thumbnail?: string
    toHtml: (props: any, id: string) => string
}

// ── Shared Helpers & Dynamic Resolvers ─────────────────────────────────────

function pad(p: any, defaultT = 16, defaultR = 24, defaultB = 16, defaultL = 24): string {
    const top = p.paddingTop ?? defaultT
    const right = p.paddingRight ?? defaultR
    const bottom = p.paddingBottom ?? defaultB
    const left = p.paddingLeft ?? defaultL
    return `padding:${top}px ${right}px ${bottom}px ${left}px;`
}

function resolveText(p: any, fallback = '{{SECTION_LABEL}}'): string {
    return p.text ?? p.label ?? p.labelText ?? p.heading ?? fallback
}

function resolveAccent(p: any, fallback = '#7530fb'): string {
    return p.accentColor ?? p.color ?? p.labelColor ?? fallback
}

function resolveTextCol(p: any, fallback = '#1e1535'): string {
    return p.textColor ?? p.color ?? fallback
}

function resolveBg(p: any, fallback = '#ffffff'): string {
    return p.bgColor ?? fallback
}

function resolveAlign(p: any, fallback = 'left'): string {
    return p.align ?? p.textAlign ?? fallback
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLASSIC PILL CAPSULE (CURRENT STYLE — 100% IDENTICAL)
// ─────────────────────────────────────────────────────────────────────────────
function classicPillCapsule(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const textCol = resolveTextCol(p, '#1e1535')
    const accentCol = resolveAccent(p, '#7530fb')
    const text = resolveText(p, '{{SECTION_LABEL}}')
    const fontSize = p.fontSize ?? 11
    const align = resolveAlign(p, 'left')

    return `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td align="${align}" style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}">
      <span style="display:inline-block;padding:4px 14px;background-color:#f3eeff;color:${accentCol};font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;border-radius:20px;border:1px solid #ede9fe;">
        ${text}
      </span>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. INDUSTRIAL TECHNICAL STENCIL
// Rugged gunmetal stencil with amber indicator pip & flanking technical rule
// ─────────────────────────────────────────────────────────────────────────────
function industrialTechnicalStencil(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const text = resolveText(p, 'SPECIFICATIONS & FITMENT')
    const fontSize = p.fontSize ?? 11
    const align = resolveAlign(p, 'left')

    return `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td align="${align}" style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}">
      <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;vertical-align:middle;">
        <tr>
          <td style="background-color:#0f172a;padding:5px 12px;border:1px solid #1e293b;border-left:3px solid #f59e0b;border-radius:2px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:6px;height:6px;background-color:#f59e0b;border-radius:50%;padding:0;"></td>
                <td style="padding-left:8px;font-family:'Courier New',Courier,monospace;font-size:${fontSize}px;font-weight:700;color:#f8fafc;letter-spacing:2px;text-transform:uppercase;line-height:1;">
                  ${text}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. LUXURY ATELIER ROMAN
// Editorial serif with flanking gold hairlines & diamond crest
// ─────────────────────────────────────────────────────────────────────────────
function luxuryAtelierRoman(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const text = resolveText(p, 'AUTHENTICITY & HERITAGE')
    const fontSize = p.fontSize ?? 11

    return `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="border-bottom:1px solid #d4af37;height:1px;width:35%;opacity:0.6;"></td>
          <td align="center" style="padding:0 14px;white-space:nowrap;">
            <span style="font-family:Georgia,serif;font-size:10px;color:#d4af37;margin-right:6px;">✦</span>
            <span style="font-family:Georgia,'Times New Roman',serif;font-size:${fontSize}px;font-weight:700;color:#1c1917;letter-spacing:3px;text-transform:uppercase;">
              ${text}
            </span>
            <span style="font-family:Georgia,serif;font-size:10px;color:#d4af37;margin-left:6px;">✦</span>
          </td>
          <td style="border-bottom:1px solid #d4af37;height:1px;width:35%;opacity:0.6;"></td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. OFFICIAL SECURITY STAMP
// Boxed verified seal with security borders for trust & certifications
// ─────────────────────────────────────────────────────────────────────────────
function officialSecurityStamp(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const text = resolveText(p, 'OFFICIAL CERTIFICATION')
    const fontSize = p.fontSize ?? 10
    const align = resolveAlign(p, 'left')

    return `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td align="${align}" style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}">
      <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;border:1.5px solid #0f172a;background-color:#ffffff;border-radius:2px;">
        <tr>
          <td style="background-color:#0f172a;padding:4px 8px;color:#10b981;font-family:Arial,sans-serif;font-size:11px;font-weight:700;line-height:1;">
            ✓
          </td>
          <td style="padding:4px 12px;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:800;color:#0f172a;letter-spacing:1.5px;text-transform:uppercase;line-height:1;">
            ${text}
          </td>
          <td style="background-color:#f1f5f9;border-left:1px solid #0f172a;padding:4px 8px;font-family:'Courier New',monospace;font-size:9px;font-weight:700;color:#64748b;line-height:1;">
            SEC-A1
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. BOLD SOLID BLOCK TAG
// High-impact solid color banner block for sports, streetwear & electronics
// ─────────────────────────────────────────────────────────────────────────────
function boldSolidBlockTag(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const accentCol = resolveAccent(p, '#7530fb')
    const text = resolveText(p, 'KEY HIGHLIGHTS')
    const fontSize = p.fontSize ?? 11
    const align = resolveAlign(p, 'left')

    return `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td align="${align}" style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}">
      <div style="display:inline-block;padding:5px 14px;background-color:${accentCol};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;border-radius:3px;box-shadow:2px 2px 0px #0f172a;">
        ${text}
      </div>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. EDITORIAL HAIRLINE RULE
// Minimalist numbered index rule (01 // SECTION) for clean lifestyle stores
// ─────────────────────────────────────────────────────────────────────────────
function editorialHairlineRule(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const text = resolveText(p, 'PRODUCT DETAILS & SPECS')
    const fontSize = p.fontSize ?? 11

    return `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="width:18px;font-family:'Courier New',monospace;font-size:11px;font-weight:700;color:#7530fb;vertical-align:middle;">
            01
          </td>
          <td style="width:12px;font-family:Arial,sans-serif;font-size:11px;color:#cbd5e1;text-align:center;vertical-align:middle;">
            /
          </td>
          <td style="padding:0 10px;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:700;color:#0f172a;letter-spacing:2px;text-transform:uppercase;white-space:nowrap;vertical-align:middle;">
            ${text}
          </td>
          <td style="border-bottom:1.5px solid #e2e8f0;width:100%;vertical-align:middle;"></td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. CYBER TERMINAL BADGE
// Tech command prompt bracket [ SYS // SPECS ] for PC hardware & gaming
// ─────────────────────────────────────────────────────────────────────────────
function cyberTerminalBadge(p: any, id: string): string {
    const bgCol = resolveBg(p, '#090d16')
    const text = resolveText(p, 'SYS // HARDWARE_SPECS')
    const fontSize = p.fontSize ?? 11
    const align = resolveAlign(p, 'left')

    return `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td align="${align}" style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}">
      <div style="display:inline-block;padding:4px 12px;background-color:#0f172a;border:1px solid #1e293b;border-radius:3px;">
        <span style="font-family:'Courier New',Courier,monospace;font-size:${fontSize}px;font-weight:700;color:#06b6d4;letter-spacing:1.5px;">
          [&nbsp;<span style="color:#10b981;">▶</span>&nbsp;${text}&nbsp;]
        </span>
      </div>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. MODERN DUALTONE CHIP
// Segmented two-piece pill with distinct icon block & title rail
// ─────────────────────────────────────────────────────────────────────────────
function modernDualtoneChip(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const accentCol = resolveAccent(p, '#7530fb')
    const text = resolveText(p, 'VERIFIED FITMENT')
    const fontSize = p.fontSize ?? 11
    const align = resolveAlign(p, 'left')

    return `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td align="${align}" style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}">
      <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;background-color:#ffffff;">
        <tr>
          <td style="background-color:${accentCol};padding:4px 10px;color:#ffffff;font-family:Arial,sans-serif;font-size:12px;font-weight:800;text-align:center;line-height:1;">
            ★
          </td>
          <td style="background-color:#f8fafc;padding:4px 12px;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:700;color:#1e1535;letter-spacing:1px;text-transform:uppercase;line-height:1;">
            ${text}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. WAREHOUSE DISPATCH TICKET
// Perforated courier parcel tag with micro barcode for logistics & shipping
// ─────────────────────────────────────────────────────────────────────────────
function warehouseDispatchTicket(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const text = resolveText(p, 'DISPATCH & DELIVERY TIMELINE')
    const fontSize = p.fontSize ?? 10
    const align = resolveAlign(p, 'left')

    return `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td align="${align}" style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}">
      <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;background-color:#fefce8;border:1px dashed #b45309;border-radius:3px;">
        <tr>
          <td style="padding:4px 8px;background-color:#fef3c7;border-right:1px dashed #b45309;font-family:'Courier New',monospace;font-size:9px;font-weight:700;color:#92400e;line-height:1;">
            PK-904
          </td>
          <td style="padding:4px 12px;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:800;color:#78350f;letter-spacing:1.5px;text-transform:uppercase;line-height:1;">
            📦 ${text}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. COMPACT MINIMAL BULLET
// Ultra-clean modern dot bullet with tracked uppercase for mobile scanning
// ─────────────────────────────────────────────────────────────────────────────
function compactMinimalBullet(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const accentCol = resolveAccent(p, '#7530fb')
    const text = resolveText(p, 'ITEM SPECIFICS')
    const fontSize = p.fontSize ?? 11
    const align = resolveAlign(p, 'left')

    return `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td align="${align}" style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}">
      <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;vertical-align:middle;">
        <tr>
          <td style="width:8px;height:8px;background-color:${accentCol};border-radius:50%;padding:0;"></td>
          <td style="padding-left:8px;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:800;color:#0f172a;letter-spacing:2px;text-transform:uppercase;line-height:1;">
            ${text}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// Accurate SVG Thumbnails (80x48 pixel-perfect representations of each layout)
// ─────────────────────────────────────────────────────────────────────────────

export const SECTION_LABEL_THUMBNAILS: Record<string, string> = {
    // 1. Classic Pill Capsule
    'sl-classic-pill-capsule': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="10" y="18" width="60" height="12" rx="6" fill="#f3eeff" stroke="#ede9fe" stroke-width="0.8"/>
    <line x1="20" y1="24" x2="60" y2="24" stroke="#7530fb" stroke-width="2"/>
  </svg>`,

    // 2. Industrial Technical Stencil
    'sl-industrial-technical-stencil': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="8" y="17" width="64" height="14" rx="2" fill="#0f172a"/>
    <rect x="8" y="17" width="3" height="14" fill="#f59e0b"/>
    <circle cx="16" cy="24" r="1.5" fill="#f59e0b"/>
    <line x1="22" y1="24" x2="64" y2="24" stroke="#f8fafc" stroke-width="1.8"/>
  </svg>`,

    // 3. Luxury Atelier Roman
    'sl-luxury-atelier-roman': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e7e5e4" stroke-width="1"/>
    <line x1="8" y1="24" x2="26" y2="24" stroke="#d4af37" stroke-width="0.8"/>
    <circle cx="31" cy="24" r="1" fill="#d4af37"/>
    <line x1="36" y1="24" x2="44" y2="24" stroke="#1c1917" stroke-width="2"/>
    <circle cx="49" cy="24" r="1" fill="#d4af37"/>
    <line x1="54" y1="24" x2="72" y2="24" stroke="#d4af37" stroke-width="0.8"/>
  </svg>`,

    // 4. Official Security Stamp
    'sl-official-security-stamp': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="8" y="17" width="64" height="14" rx="2" fill="#ffffff" stroke="#0f172a" stroke-width="1"/>
    <rect x="8" y="17" width="12" height="14" fill="#0f172a"/>
    <circle cx="14" cy="24" r="1.5" fill="#10b981"/>
    <line x1="24" y1="24" x2="52" y2="24" stroke="#0f172a" stroke-width="1.8"/>
    <rect x="58" y="17" width="14" height="14" fill="#f1f5f9"/>
    <line x1="61" y1="24" x2="69" y2="24" stroke="#64748b" stroke-width="1"/>
  </svg>`,

    // 5. Bold Solid Block Tag
    'sl-bold-solid-block-tag': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="12" y="18" width="56" height="14" rx="2" fill="#0f172a"/>
    <rect x="10" y="16" width="56" height="14" rx="2" fill="#7530fb"/>
    <line x1="18" y1="23" x2="58" y2="23" stroke="#ffffff" stroke-width="2"/>
  </svg>`,

    // 6. Editorial Hairline Rule
    'sl-editorial-hairline-rule': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="8" y="22" width="6" height="4" rx="1" fill="#7530fb"/>
    <line x1="18" y1="24" x2="48" y2="24" stroke="#0f172a" stroke-width="1.8"/>
    <line x1="52" y1="24" x2="72" y2="24" stroke="#cbd5e1" stroke-width="1"/>
  </svg>`,

    // 7. Cyber Terminal Badge
    'sl-cyber-terminal-badge': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#090d16" stroke="#1e293b" stroke-width="1"/>
    <rect x="8" y="17" width="64" height="14" rx="2" fill="#0f172a" stroke="#1e293b" stroke-width="0.8"/>
    <line x1="13" y1="24" x2="16" y2="24" stroke="#10b981" stroke-width="1.5"/>
    <line x1="20" y1="24" x2="60" y2="24" stroke="#06b6d4" stroke-width="1.8"/>
  </svg>`,

    // 8. Modern Dualtone Chip
    'sl-modern-dualtone-chip': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="10" y="17" width="60" height="14" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="10" y="17" width="14" height="14" fill="#7530fb"/>
    <circle cx="17" cy="24" r="2" fill="#ffffff"/>
    <line x1="30" y1="24" x2="62" y2="24" stroke="#1e1535" stroke-width="1.8"/>
  </svg>`,

    // 9. Warehouse Dispatch Ticket
    'sl-warehouse-dispatch-ticket': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="8" y="17" width="64" height="14" rx="2" fill="#fefce8" stroke="#b45309" stroke-width="1" stroke-dasharray="2 1.5"/>
    <rect x="8" y="17" width="16" height="14" fill="#fef3c7"/>
    <line x1="12" y1="24" x2="20" y2="24" stroke="#92400e" stroke-width="1.2"/>
    <line x1="28" y1="24" x2="66" y2="24" stroke="#78350f" stroke-width="1.8"/>
  </svg>`,

    // 10. Compact Minimal Bullet
    'sl-compact-minimal-bullet': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <circle cx="16" cy="24" r="3" fill="#7530fb"/>
    <line x1="24" y1="24" x2="66" y2="24" stroke="#0f172a" stroke-width="2"/>
  </svg>`,
}

export function getSectionLabelThumbnailSvg(id: string): string {
    const key = Object.keys(SECTION_LABEL_THUMBNAILS).find(k => {
        const clean = id.toLowerCase().replace(/_/g, '-')
        const vClean = k.toLowerCase().replace(/_/g, '-')
        return k === id || vClean === clean || k.endsWith(clean) || id.endsWith(k)
    })
    return key ? SECTION_LABEL_THUMBNAILS[key] : SECTION_LABEL_THUMBNAILS['sl-classic-pill-capsule']
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const sectionLabelVariants: BlockVariant[] = [
    {
        id: 'sl-classic-pill-capsule',
        label: 'Classic Pill Capsule',
        description: 'Current rounded pill capsule badge with soft accent background',
        thumbnail: SECTION_LABEL_THUMBNAILS['sl-classic-pill-capsule'],
        toHtml(props, id) { return classicPillCapsule(props, id) },
    },
    {
        id: 'sl-industrial-technical-stencil',
        label: 'Industrial Technical Stencil',
        description: 'Gunmetal badge with amber indicator pip for auto parts, machinery & tools',
        thumbnail: SECTION_LABEL_THUMBNAILS['sl-industrial-technical-stencil'],
        toHtml(props, id) { return industrialTechnicalStencil(props, id) },
    },
    {
        id: 'sl-luxury-atelier-roman',
        label: 'Luxury Atelier Roman',
        description: 'Editorial serif with flanking gold hairlines & diamond crest for prestige goods',
        thumbnail: SECTION_LABEL_THUMBNAILS['sl-luxury-atelier-roman'],
        toHtml(props, id) { return luxuryAtelierRoman(props, id) },
    },
    {
        id: 'sl-official-security-stamp',
        label: 'Official Security Stamp',
        description: 'Framed security seal with emerald verified badge for authenticity & certifications',
        thumbnail: SECTION_LABEL_THUMBNAILS['sl-official-security-stamp'],
        toHtml(props, id) { return officialSecurityStamp(props, id) },
    },
    {
        id: 'sl-bold-solid-block-tag',
        label: 'Bold Solid Block Tag',
        description: 'High-contrast solid color banner block for sports, streetwear & electronics',
        thumbnail: SECTION_LABEL_THUMBNAILS['sl-bold-solid-block-tag'],
        toHtml(props, id) { return boldSolidBlockTag(props, id) },
    },
    {
        id: 'sl-editorial-hairline-rule',
        label: 'Editorial Hairline Rule',
        description: 'Minimalist numbered index rule (01 // SECTION) for clean lifestyle stores',
        thumbnail: SECTION_LABEL_THUMBNAILS['sl-editorial-hairline-rule'],
        toHtml(props, id) { return editorialHairlineRule(props, id) },
    },
    {
        id: 'sl-cyber-terminal-badge',
        label: 'Cyber Terminal Badge',
        description: 'Tech command prompt bracket [ SYS // SPECS ] for PC hardware & gaming',
        thumbnail: SECTION_LABEL_THUMBNAILS['sl-cyber-terminal-badge'],
        toHtml(props, id) { return cyberTerminalBadge(props, id) },
    },
    {
        id: 'sl-modern-dualtone-chip',
        label: 'Modern Dualtone Chip',
        description: 'Segmented two-piece pill with distinct icon block & title rail',
        thumbnail: SECTION_LABEL_THUMBNAILS['sl-modern-dualtone-chip'],
        toHtml(props, id) { return modernDualtoneChip(props, id) },
    },
    {
        id: 'sl-warehouse-dispatch-ticket',
        label: 'Warehouse Dispatch Ticket',
        description: 'Perforated courier parcel tag with micro barcode for logistics & shipping',
        thumbnail: SECTION_LABEL_THUMBNAILS['sl-warehouse-dispatch-ticket'],
        toHtml(props, id) { return warehouseDispatchTicket(props, id) },
    },
    {
        id: 'sl-compact-minimal-bullet',
        label: 'Compact Minimal Bullet',
        description: 'Ultra-clean modern dot bullet with tracked uppercase for mobile scanning',
        thumbnail: SECTION_LABEL_THUMBNAILS['sl-compact-minimal-bullet'],
        toHtml(props, id) { return compactMinimalBullet(props, id) },
    },
]

export function getSectionLabelVariant(id?: string): BlockVariant {
    if (!id) return sectionLabelVariants[0]

    const clean = id.toLowerCase().replace(/_/g, '-')
    const found = sectionLabelVariants.find(v => {
        const vClean = v.id.toLowerCase().replace(/_/g, '-')
        return v.id === id || vClean === clean || v.id.endsWith(clean) || clean.includes(vClean)
    })

    return found ?? sectionLabelVariants[0]
}
