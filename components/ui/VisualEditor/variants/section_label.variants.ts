// components/ui/VisualEditor/variants/section_label.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Section Label — 10 Radically Distinct, Professional Retail Layout Variants
// Engineered for eBay listing templates to establish clear visual hierarchy,
// guide mobile buyers through key listing sections, and build merchant authority.
//
// Focus: Clean typography, subtle borders, and varying background intensities.
// ZERO AI-slop, zero blurry glassmorphism, zero fake neon glows.
//
// 1.  sl-classic-pill-capsule         — Current rounded pill capsule with soft accent bg (KEPT 100% SAME)
// 2.  sl-minimalist-hairline-accent   — Soft slate wash with 3px solid accent left bar & clean sans tracking
// 3.  sl-editorial-serif-crest        — Luxury boutique serif with flanking gold hairlines & diamond crest
// 4.  sl-industrial-spec-badge        — Solid dark gunmetal badge with monospace type & amber technical pip
// 5.  sl-segmented-dualtone-chip      — Two-piece segmented pill with high-contrast icon block & neutral title rail
// 6.  sl-numbered-index-rule          — Clean catalog index rule (01 // SECTION) with subtle full-width divider
// 7.  sl-official-verification-seal   — Framed security seal with emerald check for trust, warranty & compliance
// 8.  sl-bold-contrast-banner         — High-impact solid color block with offset shadow for sports & electronics
// 9.  sl-tailor-stitched-parchment    — Warm parchment wash with fine dashed tailor stitch border for vintage & apparel
// 10. sl-compact-dot-bullet           — Ultra-clean mobile-first dot bullet with tracked uppercase & zero clutter
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

function resolveText(p: any, fallback = 'SECTION OVERVIEW'): string {
  const raw = p.text ?? p.label ?? p.labelText ?? p.heading
  if (raw && raw !== '{{SECTION_LABEL}}' && String(raw).trim() !== '') {
    return raw
  }
  return fallback
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
  const accentCol = resolveAccent(p, '#7530fb')
  const text = resolveText(p, 'SECTION OVERVIEW')
  const fontSize = p.fontSize ?? 11
  const align = resolveAlign(p, 'left')

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;">
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
// 2. MINIMALIST HAIRLINE ACCENT
// Clean neutral slate wash with 3px solid accent left bar and 1px subtle frame
// ─────────────────────────────────────────────────────────────────────────────
function minimalistHairlineAccent(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const accentCol = resolveAccent(p, '#7530fb')
  const textCol = resolveTextCol(p, '#0f172a')
  const text = resolveText(p, 'PRODUCT SPECIFICATIONS')
  const fontSize = p.fontSize ?? 11
  const align = resolveAlign(p, 'left')

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;">
  <tr>
    <td align="${align}" style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}">
      <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;vertical-align:middle;">
        <tr>
          <td style="background-color:#f8fafc;padding:5px 14px;border:1px solid #e2e8f0;border-left:3px solid ${accentCol};border-radius:3px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:6px;height:6px;background-color:${accentCol};border-radius:50%;padding:0;"></td>
                <td style="padding-left:8px;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:700;color:${textCol};letter-spacing:1.8px;text-transform:uppercase;line-height:1;">
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
// 3. EDITORIAL SERIF CREST
// Pure luxury typography with flanking gold hairlines & centered diamond crests
// ─────────────────────────────────────────────────────────────────────────────
function editorialSerifCrest(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const accentCol = resolveAccent(p, '#b45309')
  const text = resolveText(p, 'AUTHENTICITY & HERITAGE')
  const fontSize = p.fontSize ?? 11

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="border-bottom:1px solid #e7e5e4;height:1px;width:32%;"></td>
          <td align="center" style="padding:0 14px;white-space:nowrap;">
            <span style="font-family:Georgia,serif;font-size:10px;color:${accentCol};margin-right:6px;">✦</span>
            <span style="font-family:Georgia,'Times New Roman',serif;font-size:${fontSize}px;font-weight:700;color:#1c1917;letter-spacing:3px;text-transform:uppercase;">
              ${text}
            </span>
            <span style="font-family:Georgia,serif;font-size:10px;color:${accentCol};margin-left:6px;">✦</span>
          </td>
          <td style="border-bottom:1px solid #e7e5e4;height:1px;width:32%;"></td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. INDUSTRIAL SPEC BADGE
// Deep technical gunmetal badge with monospace font & amber warning pip
// ─────────────────────────────────────────────────────────────────────────────
function industrialSpecBadge(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const text = resolveText(p, 'SPECIFICATIONS & FITMENT')
  const fontSize = p.fontSize ?? 11
  const align = resolveAlign(p, 'left')

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;">
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
// 5. SEGMENTED DUALTONE CHIP
// Two-piece segmented container with solid accent icon square & neutral title rail
// ─────────────────────────────────────────────────────────────────────────────
function segmentedDualtoneChip(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const accentCol = resolveAccent(p, '#7530fb')
  const text = resolveText(p, 'VERIFIED FITMENT')
  const fontSize = p.fontSize ?? 11
  const align = resolveAlign(p, 'left')

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;">
  <tr>
    <td align="${align}" style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}">
      <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;border:1px solid #e2e8f0;border-radius:4px;overflow:hidden;background-color:#ffffff;">
        <tr>
          <td style="background-color:${accentCol};padding:4px 10px;color:#ffffff;font-family:Arial,sans-serif;font-size:11px;font-weight:800;text-align:center;line-height:1;">
            ★
          </td>
          <td style="background-color:#f8fafc;padding:4px 12px;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:700;color:#1e1535;letter-spacing:1.2px;text-transform:uppercase;line-height:1;">
            ${text}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. NUMBERED INDEX RULE
// Minimalist numbered index rule (01 // SECTION) with full-width subtle divider
// ─────────────────────────────────────────────────────────────────────────────
function numberedIndexRule(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const accentCol = resolveAccent(p, '#7530fb')
  const text = resolveText(p, 'PRODUCT DETAILS & SPECS')
  const fontSize = p.fontSize ?? 11

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="width:20px;font-family:'Courier New',monospace;font-size:12px;font-weight:700;color:${accentCol};vertical-align:middle;">
            01
          </td>
          <td style="width:12px;font-family:Arial,sans-serif;font-size:11px;color:#cbd5e1;text-align:center;vertical-align:middle;">
            /
          </td>
          <td style="padding:0 12px;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:700;color:#0f172a;letter-spacing:2px;text-transform:uppercase;white-space:nowrap;vertical-align:middle;">
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
// 7. OFFICIAL VERIFICATION SEAL
// Framed boxed security seal with emerald verified badge for trust & certifications
// ─────────────────────────────────────────────────────────────────────────────
function officialVerificationSeal(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const text = resolveText(p, 'OFFICIAL CERTIFICATION')
  const fontSize = p.fontSize ?? 10
  const align = resolveAlign(p, 'left')

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;">
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
// 8. BOLD CONTRAST BANNER
// High-impact solid color banner block for sports, streetwear & electronics
// ─────────────────────────────────────────────────────────────────────────────
function boldContrastBanner(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const accentCol = resolveAccent(p, '#7530fb')
  const text = resolveText(p, 'KEY HIGHLIGHTS')
  const fontSize = p.fontSize ?? 11
  const align = resolveAlign(p, 'left')

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;">
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
// 9. TAILOR STITCHED PARCHMENT
// Warm linen wash with fine dashed tailor stitch border for vintage, fashion & home
// ─────────────────────────────────────────────────────────────────────────────
function tailorStitchedParchment(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const text = resolveText(p, 'GARMENT & MATERIAL DETAILS')
  const fontSize = p.fontSize ?? 10
  const align = resolveAlign(p, 'left')

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;">
  <tr>
    <td align="${align}" style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}">
      <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;background-color:#fffdfa;border:1px dashed #d6d3d1;border-radius:3px;">
        <tr>
          <td style="padding:4px 8px;background-color:#f5f5f4;border-right:1px dashed #d6d3d1;font-family:'Courier New',monospace;font-size:9px;font-weight:700;color:#78716c;line-height:1;">
            LOT-08
          </td>
          <td style="padding:4px 12px;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:700;color:#1c1917;letter-spacing:1.8px;text-transform:uppercase;line-height:1;">
            ${text}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. COMPACT DOT BULLET
// Ultra-clean mobile-first dot bullet with tracked uppercase for quick scanning
// ─────────────────────────────────────────────────────────────────────────────
function compactDotBullet(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const accentCol = resolveAccent(p, '#7530fb')
  const textCol = resolveTextCol(p, '#0f172a')
  const text = resolveText(p, 'ITEM SPECIFICS')
  const fontSize = p.fontSize ?? 11
  const align = resolveAlign(p, 'left')

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;">
  <tr>
    <td align="${align}" style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}">
      <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;vertical-align:middle;">
        <tr>
          <td style="width:8px;height:8px;background-color:${accentCol};border-radius:50%;padding:0;"></td>
          <td style="padding-left:8px;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:800;color:${textCol};letter-spacing:2px;text-transform:uppercase;line-height:1;">
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

  // 2. Minimalist Hairline Accent
  'sl-minimalist-hairline-accent': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="8" y="17" width="64" height="14" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="8" y="17" width="3" height="14" fill="#7530fb"/>
    <circle cx="15" cy="24" r="1.5" fill="#7530fb"/>
    <line x1="20" y1="24" x2="64" y2="24" stroke="#0f172a" stroke-width="1.8"/>
  </svg>`,

  // 3. Editorial Serif Crest
  'sl-editorial-serif-crest': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e7e5e4" stroke-width="1"/>
    <line x1="8" y1="24" x2="26" y2="24" stroke="#d4af37" stroke-width="0.8"/>
    <circle cx="31" cy="24" r="1" fill="#d4af37"/>
    <line x1="36" y1="24" x2="44" y2="24" stroke="#1c1917" stroke-width="2"/>
    <circle cx="49" cy="24" r="1" fill="#d4af37"/>
    <line x1="54" y1="24" x2="72" y2="24" stroke="#d4af37" stroke-width="0.8"/>
  </svg>`,

  // 4. Industrial Spec Badge
  'sl-industrial-spec-badge': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="8" y="17" width="64" height="14" rx="2" fill="#0f172a"/>
    <rect x="8" y="17" width="3" height="14" fill="#f59e0b"/>
    <circle cx="16" cy="24" r="1.5" fill="#f59e0b"/>
    <line x1="22" y1="24" x2="64" y2="24" stroke="#f8fafc" stroke-width="1.8"/>
  </svg>`,

  // 5. Segmented Dualtone Chip
  'sl-segmented-dualtone-chip': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="10" y="17" width="60" height="14" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="10" y="17" width="14" height="14" fill="#7530fb"/>
    <circle cx="17" cy="24" r="2" fill="#ffffff"/>
    <line x1="30" y1="24" x2="62" y2="24" stroke="#1e1535" stroke-width="1.8"/>
  </svg>`,

  // 6. Numbered Index Rule
  'sl-numbered-index-rule': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="8" y="22" width="6" height="4" rx="1" fill="#7530fb"/>
    <line x1="18" y1="24" x2="48" y2="24" stroke="#0f172a" stroke-width="1.8"/>
    <line x1="52" y1="24" x2="72" y2="24" stroke="#cbd5e1" stroke-width="1"/>
  </svg>`,

  // 7. Official Verification Seal
  'sl-official-verification-seal': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="8" y="17" width="64" height="14" rx="2" fill="#ffffff" stroke="#0f172a" stroke-width="1"/>
    <rect x="8" y="17" width="12" height="14" fill="#0f172a"/>
    <circle cx="14" cy="24" r="1.5" fill="#10b981"/>
    <line x1="24" y1="24" x2="52" y2="24" stroke="#0f172a" stroke-width="1.8"/>
    <rect x="58" y="17" width="14" height="14" fill="#f1f5f9"/>
    <line x1="61" y1="24" x2="69" y2="24" stroke="#64748b" stroke-width="1"/>
  </svg>`,

  // 8. Bold Contrast Banner
  'sl-bold-contrast-banner': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="12" y="18" width="56" height="14" rx="2" fill="#0f172a"/>
    <rect x="10" y="16" width="56" height="14" rx="2" fill="#7530fb"/>
    <line x1="18" y1="23" x2="58" y2="23" stroke="#ffffff" stroke-width="2"/>
  </svg>`,

  // 9. Tailor Stitched Parchment
  'sl-tailor-stitched-parchment': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#d6d3d1" stroke-width="1"/>
    <rect x="8" y="17" width="64" height="14" rx="2" fill="#fffdfa" stroke="#d6d3d1" stroke-width="1" stroke-dasharray="2 1.5"/>
    <rect x="8" y="17" width="16" height="14" fill="#f5f5f4"/>
    <line x1="12" y1="24" x2="20" y2="24" stroke="#78716c" stroke-width="1.2"/>
    <line x1="28" y1="24" x2="66" y2="24" stroke="#1c1917" stroke-width="1.8"/>
  </svg>`,

  // 10. Compact Dot Bullet
  'sl-compact-dot-bullet': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
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
    id: 'sl-minimalist-hairline-accent',
    label: 'Minimalist Hairline Accent',
    description: 'Soft slate wash with solid accent left bar and precision border',
    thumbnail: SECTION_LABEL_THUMBNAILS['sl-minimalist-hairline-accent'],
    toHtml(props, id) { return minimalistHairlineAccent(props, id) },
  },
  {
    id: 'sl-editorial-serif-crest',
    label: 'Editorial Serif Crest',
    description: 'Luxury boutique serif with flanking gold hairlines & diamond crest',
    thumbnail: SECTION_LABEL_THUMBNAILS['sl-editorial-serif-crest'],
    toHtml(props, id) { return editorialSerifCrest(props, id) },
  },
  {
    id: 'sl-industrial-spec-badge',
    label: 'Industrial Spec Badge',
    description: 'Solid dark gunmetal badge with monospace type & amber technical pip',
    thumbnail: SECTION_LABEL_THUMBNAILS['sl-industrial-spec-badge'],
    toHtml(props, id) { return industrialSpecBadge(props, id) },
  },
  {
    id: 'sl-segmented-dualtone-chip',
    label: 'Segmented Dualtone Chip',
    description: 'Two-piece segmented pill with icon block & neutral title rail',
    thumbnail: SECTION_LABEL_THUMBNAILS['sl-segmented-dualtone-chip'],
    toHtml(props, id) { return segmentedDualtoneChip(props, id) },
  },
  {
    id: 'sl-numbered-index-rule',
    label: 'Numbered Index Rule',
    description: 'Catalog index rule (01 // SECTION) with subtle full-width divider',
    thumbnail: SECTION_LABEL_THUMBNAILS['sl-numbered-index-rule'],
    toHtml(props, id) { return numberedIndexRule(props, id) },
  },
  {
    id: 'sl-official-verification-seal',
    label: 'Official Verification Seal',
    description: 'Framed security seal with emerald verified check for trust & certifications',
    thumbnail: SECTION_LABEL_THUMBNAILS['sl-official-verification-seal'],
    toHtml(props, id) { return officialVerificationSeal(props, id) },
  },
  {
    id: 'sl-bold-contrast-banner',
    label: 'Bold Contrast Banner',
    description: 'High-impact solid color block with offset shadow for sports & electronics',
    thumbnail: SECTION_LABEL_THUMBNAILS['sl-bold-contrast-banner'],
    toHtml(props, id) { return boldContrastBanner(props, id) },
  },
  {
    id: 'sl-tailor-stitched-parchment',
    label: 'Tailor Stitched Parchment',
    description: 'Warm parchment wash with fine dashed tailor stitch border for vintage & apparel',
    thumbnail: SECTION_LABEL_THUMBNAILS['sl-tailor-stitched-parchment'],
    toHtml(props, id) { return tailorStitchedParchment(props, id) },
  },
  {
    id: 'sl-compact-dot-bullet',
    label: 'Compact Dot Bullet',
    description: 'Ultra-clean mobile-first dot bullet with tracked uppercase & zero clutter',
    thumbnail: SECTION_LABEL_THUMBNAILS['sl-compact-dot-bullet'],
    toHtml(props, id) { return compactDotBullet(props, id) },
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
