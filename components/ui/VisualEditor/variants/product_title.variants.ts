// components/ui/VisualEditor/variants/product_title.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Product Title — 10 High-Converting, Professional eBay Retail Variants
// Engineered for eBay listing templates to establish immediate product identity,
// maximize Cassini search indexation, verify item condition, and anchor buyers.
//
// Focus: Clean typography, durable table-based HTML, zero AI-slop, zero glassy filters.
//
// 1.  pt-classic-baseline      — Current clean H1 with condition text below (KEPT 100% SAME)
// 2.  pt-pill-badge-header     — Top condition pill badge above bold high-impact title
// 3.  pt-accent-bar-left       — 4px solid vertical accent bar flanking title on left
// 4.  pt-luxury-serif-centered — Centered Roman serif with flanking dots for jewelry & watches
// 5.  pt-modern-split-card     — Two-tone split row: title on left, condition badge card on right
// 6.  pt-industrial-part-spec  — Monospace MPN/OEM kicker tag for auto parts & hardware
// 7.  pt-underlined-accent-rule — Distinctive dual-tone bottom rule with colored accent stroke
// 8.  pt-dark-obsidian-badge   — Deep charcoal title card with electric badge for gaming & streetwear
// 9.  pt-verified-shield-banner — Authentic verified shield badge with official product title
// 10. pt-compact-inline-pip    — Mobile-first compact inline layout with minimal vertical footprint
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
    id: string
    label: string
    description: string
    thumbnail?: string
    toHtml: (props: any, id: string) => string
}

// ── Shared Helpers & Dynamic Resolvers ─────────────────────────────────────

function pad(p: any, defaultT = 20, defaultR = 24, defaultB = 12, defaultL = 24): string {
    const top = p.paddingTop ?? defaultT
    const right = p.paddingRight ?? defaultR
    const bottom = p.paddingBottom ?? defaultB
    const left = p.paddingLeft ?? defaultL
    return `padding:${top}px ${right}px ${bottom}px ${left}px;`
}

function resolveBg(p: any, fallback = '#ffffff'): string {
    return p.bgColor ?? fallback
}

function resolveTextCol(p: any, fallback = '#1e1535'): string {
    return p.color ?? p.textColor ?? fallback
}

function resolveAccentCol(p: any, fallback = '#7530fb'): string {
    return p.accentColor ?? fallback
}

function resolveTitle(p: any, fallback = '{{PRODUCT_TITLE}}'): string {
    return p.text ?? p.title ?? p.productTitle ?? fallback
}

function resolveCondition(p: any, fallback = '{{ITEM_CONDITION}}'): string {
    return p.conditionText ?? p.condition ?? fallback
}

function resolveFontSize(p: any, fallback = 24): number {
    return p.fontSize ?? fallback
}

function resolveFontWeight(p: any, fallback = '800'): string {
    return String(p.fontWeight ?? fallback)
}

function resolveLineHeight(p: any, fallback = 1.3): number {
    return p.lineHeight ?? fallback
}

function resolveAlign(p: any, fallback = 'left'): string {
    return p.align ?? fallback
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLASSIC BASELINE (CURRENT STYLE — KEPT 100% IDENTICAL)
// ─────────────────────────────────────────────────────────────────────────────
function classicBaseline(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const title = resolveTitle(p, '{{PRODUCT_TITLE}}')
    const titleCol = resolveTextCol(p, '#1e1535')
    const fs = resolveFontSize(p, 24)
    const fw = resolveFontWeight(p, '800')
    const lh = resolveLineHeight(p, 1.3)
    const align = resolveAlign(p, 'left')
    const lsEm = ((p.letterSpacing ?? 0) / fs).toFixed(4)
    const condition = resolveCondition(p, '{{ITEM_CONDITION}}')
    const conditionCol = p.conditionColor ?? '#6b7280'
    const conditionFs = p.conditionFontSize ?? 13

    const conditionHtml = p.showCondition !== false
        ? `<p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:${conditionFs}px;color:${conditionCol};">Condition: <strong style="color:${conditionCol};">${condition}</strong></p>`
        : ''

    return `<!--[riazify:product_title:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 20, 24, 12, 24)}box-sizing:border-box;">
      <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${fs}px;font-weight:${fw};line-height:${lh};letter-spacing:${lsEm}em;color:${titleCol};text-align:${align};">
        ${title}
      </h1>
      ${conditionHtml}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PILL BADGE HEADER (Top Condition Pill + Bold Title)
// ─────────────────────────────────────────────────────────────────────────────
function pillBadgeHeader(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const title = resolveTitle(p, '{{PRODUCT_TITLE}}')
    const titleCol = resolveTextCol(p, '#0f172a')
    const fs = resolveFontSize(p, 24)
    const fw = resolveFontWeight(p, '800')
    const lh = resolveLineHeight(p, 1.3)
    const accent = resolveAccentCol(p, '#16a34a')
    const condition = resolveCondition(p, '{{ITEM_CONDITION}}')

    return `<!--[riazify:product_title:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 18, 24, 14, 24)}box-sizing:border-box;">
      <!-- Condition Pill -->
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:8px;">
        <tr>
          <td style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:100px;padding:3px 10px;">
            <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background-color:${accent};margin-right:6px;vertical-align:middle;"></span>
            <span style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#166534;letter-spacing:0.4px;text-transform:uppercase;vertical-align:middle;">
              ${condition}
            </span>
          </td>
        </tr>
      </table>
      <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${fs}px;font-weight:${fw};line-height:${lh};color:${titleCol};letter-spacing:-0.3px;">
        ${title}
      </h1>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ACCENT BAR LEFT (Left Accent Rail Anchor)
// ─────────────────────────────────────────────────────────────────────────────
function accentBarLeft(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const title = resolveTitle(p, '{{PRODUCT_TITLE}}')
    const titleCol = resolveTextCol(p, '#1e1535')
    const fs = resolveFontSize(p, 24)
    const fw = resolveFontWeight(p, '800')
    const lh = resolveLineHeight(p, 1.3)
    const accent = resolveAccentCol(p, '#7530fb')
    const condition = resolveCondition(p, '{{ITEM_CONDITION}}')

    return `<!--[riazify:product_title:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 16, 24, 14, 24)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td width="4" style="width:4px;background-color:${accent};border-radius:2px;font-size:1px;line-height:1px;">&nbsp;</td>
          <td style="padding-left:14px;vertical-align:top;">
            <h1 style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:${fs}px;font-weight:${fw};line-height:${lh};color:${titleCol};letter-spacing:-0.2px;">
              ${title}
            </h1>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#64748b;font-weight:600;">
              Item Condition: <span style="color:#0f172a;font-weight:700;">${condition}</span> &bull; Verified Genuine
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. LUXURY SERIF CENTERED (Editorial Roman Serif with Flanking Dots)
// ─────────────────────────────────────────────────────────────────────────────
function luxurySerifCentered(p: any, id: string): string {
    const bgCol = resolveBg(p, '#fafaf9')
    const title = resolveTitle(p, '{{PRODUCT_TITLE}}')
    const titleCol = resolveTextCol(p, '#1c1917')
    const fs = resolveFontSize(p, 26)
    const lh = resolveLineHeight(p, 1.3)
    const condition = resolveCondition(p, '{{ITEM_CONDITION}}')

    return `<!--[riazify:product_title:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;font-family:Georgia,'Times New Roman',serif;">
  <tr>
    <td align="center" style="background-color:${bgCol};border-bottom:1px solid #e7e5e4;${pad(p, 24, 24, 20, 24)}text-align:center;box-sizing:border-box;">
      <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#b45309;letter-spacing:1.5px;text-transform:uppercase;">
        &mdash; PREMIER COLLECTION &mdash;
      </p>
      <h1 style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:${fs}px;font-weight:600;line-height:${lh};color:${titleCol};font-style:italic;">
        ${title}
      </h1>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#78716c;letter-spacing:0.5px;">
        &bull; Condition: <strong style="color:#1c1917;">${condition}</strong> &bull; Sourced from Authorised Distributor
      </p>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. MODERN SPLIT CARD (Title on Left, Condition Badge Card on Right)
// ─────────────────────────────────────────────────────────────────────────────
function modernSplitCard(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const title = resolveTitle(p, '{{PRODUCT_TITLE}}')
    const titleCol = resolveTextCol(p, '#0f172a')
    const fs = resolveFontSize(p, 22)
    const fw = resolveFontWeight(p, '800')
    const lh = resolveLineHeight(p, 1.3)
    const condition = resolveCondition(p, '{{ITEM_CONDITION}}')

    return `<!--[riazify:product_title:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid #e2e8f0;border-radius:8px;${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <!-- Title Left -->
          <td valign="middle" style="padding-right:16px;">
            <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${fs}px;font-weight:${fw};line-height:${lh};color:${titleCol};">
              ${title}
            </h1>
          </td>
          <!-- Condition Badge Right -->
          <td width="130" valign="middle" align="right" style="width:130px;white-space:nowrap;">
            <table cellpadding="0" cellspacing="0" border="0" align="right" style="border-collapse:collapse;background-color:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;">
              <tr>
                <td style="padding:6px 12px;text-align:center;">
                  <span style="display:block;font-size:9px;font-weight:800;color:#64748b;letter-spacing:0.8px;text-transform:uppercase;">
                    CONDITION
                  </span>
                  <span style="display:block;font-size:12px;font-weight:800;color:#0f172a;margin-top:2px;">
                    ${condition}
                  </span>
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
// 6. INDUSTRIAL PART SPEC (Monospace MPN/OEM Kicker Tag)
// ─────────────────────────────────────────────────────────────────────────────
function industrialPartSpec(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const title = resolveTitle(p, '{{PRODUCT_TITLE}}')
    const titleCol = resolveTextCol(p, '#0f172a')
    const fs = resolveFontSize(p, 23)
    const fw = resolveFontWeight(p, '800')
    const lh = resolveLineHeight(p, 1.3)
    const condition = resolveCondition(p, '{{ITEM_CONDITION}}')

    return `<!--[riazify:product_title:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};border-bottom:2px solid #0f172a;${pad(p, 16, 20, 14, 20)}box-sizing:border-box;">
      <p style="margin:0 0 6px;font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:800;color:#0284c7;letter-spacing:1px;text-transform:uppercase;">
        SPECIFICATION SHEET // MPN VERIFIED
      </p>
      <h1 style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:${fs}px;font-weight:${fw};line-height:${lh};color:${titleCol};letter-spacing:-0.2px;">
        ${title}
      </h1>
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="background-color:#0f172a;color:#ffffff;font-size:11px;font-weight:800;padding:2px 8px;border-radius:3px;text-transform:uppercase;">
            ${condition}
          </td>
          <td style="padding-left:10px;font-size:12px;color:#64748b;font-weight:600;">
            OEM Quality Guaranteed &bull; Fast Dispatch
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. UNDERLINED ACCENT RULE (Dual-Tone Accent Line Under Title)
// ─────────────────────────────────────────────────────────────────────────────
function underlinedAccentRule(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const title = resolveTitle(p, '{{PRODUCT_TITLE}}')
    const titleCol = resolveTextCol(p, '#1e1535')
    const fs = resolveFontSize(p, 24)
    const fw = resolveFontWeight(p, '800')
    const lh = resolveLineHeight(p, 1.3)
    const accent = resolveAccentCol(p, '#7530fb')
    const condition = resolveCondition(p, '{{ITEM_CONDITION}}')

    return `<!--[riazify:product_title:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 18, 24, 16, 24)}box-sizing:border-box;">
      <h1 style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:${fs}px;font-weight:${fw};line-height:${lh};color:${titleCol};">
        ${title}
      </h1>
      <!-- Dual Accent Underline -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:8px;">
        <tr>
          <td width="48" style="width:48px;height:3px;background-color:${accent};font-size:1px;line-height:1px;">&nbsp;</td>
          <td style="height:1px;background-color:#ede9fe;font-size:1px;line-height:1px;">&nbsp;</td>
        </tr>
      </table>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;">
        Item Condition: <strong style="color:#1e1535;">${condition}</strong> &bull; Authentic Seller Direct
      </p>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. DARK OBSIDIAN BADGE (Midnight High-Contrast Title Card)
// ─────────────────────────────────────────────────────────────────────────────
function darkObsidianBadge(p: any, id: string): string {
    const title = resolveTitle(p, '{{PRODUCT_TITLE}}')
    const fs = resolveFontSize(p, 23)
    const fw = resolveFontWeight(p, '800')
    const lh = resolveLineHeight(p, 1.3)
    const condition = resolveCondition(p, '{{ITEM_CONDITION}}')

    return `<!--[riazify:product_title:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:#090d16;border:1px solid #1e293b;border-radius:6px;${pad(p, 18, 20, 18, 20)}box-sizing:border-box;">
      <div style="margin-bottom:6px;">
        <span style="background-color:#b8fa33;color:#090d16;font-size:10px;font-weight:900;padding:2px 7px;border-radius:3px;letter-spacing:0.8px;text-transform:uppercase;">
          ${condition}
        </span>
      </div>
      <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${fs}px;font-weight:${fw};line-height:${lh};color:#ffffff;letter-spacing:-0.2px;">
        ${title}
      </h1>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. VERIFIED SHIELD BANNER (Trust & Authenticity Shield Header)
// ─────────────────────────────────────────────────────────────────────────────
function verifiedShieldBanner(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const title = resolveTitle(p, '{{PRODUCT_TITLE}}')
    const titleCol = resolveTextCol(p, '#0f172a')
    const fs = resolveFontSize(p, 23)
    const fw = resolveFontWeight(p, '800')
    const lh = resolveLineHeight(p, 1.3)
    const condition = resolveCondition(p, '{{ITEM_CONDITION}}')

    return `<!--[riazify:product_title:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid #e2e8f0;border-radius:8px;${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td width="30" valign="top" style="width:30px;padding-right:12px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:26px;height:26px;background-color:#eff6ff;color:#2563eb;border:1px solid #dbeafe;border-radius:6px;text-align:center;line-height:26px;font-size:14px;font-weight:900;">
                  &#128737;
                </td>
              </tr>
            </table>
          </td>
          <td valign="top">
            <span style="font-size:10px;font-weight:800;color:#2563eb;letter-spacing:0.8px;text-transform:uppercase;">
              AUTHENTIC &bull; ${condition}
            </span>
            <h1 style="margin:4px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:${fs}px;font-weight:${fw};line-height:${lh};color:${titleCol};">
              ${title}
            </h1>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. COMPACT INLINE PIP (Mobile-First Compact Title Strip)
// ─────────────────────────────────────────────────────────────────────────────
function compactInlinePip(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const title = resolveTitle(p, '{{PRODUCT_TITLE}}')
    const titleCol = resolveTextCol(p, '#1e1535')
    const fs = resolveFontSize(p, 20)
    const fw = resolveFontWeight(p, '800')
    const condition = resolveCondition(p, '{{ITEM_CONDITION}}')
    const accent = resolveAccentCol(p, '#7530fb')

    return `<!--[riazify:product_title:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};border-bottom:1px solid #e2e8f0;${pad(p, 10, 16, 10, 16)}box-sizing:border-box;">
      <h1 style="margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;font-size:${fs}px;font-weight:${fw};line-height:1.25;color:${titleCol};">
        ${title}
      </h1>
      <p style="margin:0;font-size:11px;color:#64748b;">
        <span style="color:${accent};font-weight:800;">&#9679;</span> Condition: <strong style="color:#0f172a;">${condition}</strong>
      </p>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG THUMBNAIL PREVIEWS (For Visual Editor Sidebar)
// ─────────────────────────────────────────────────────────────────────────────

export const PRODUCT_TITLE_THUMBNAILS: Record<string, string> = {
    // 1. Classic Baseline
    'pt-classic-baseline': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="8" y1="18" x2="68" y2="18" stroke="#1e1535" stroke-width="2.5"/>
    <line x1="8" y1="24" x2="48" y2="24" stroke="#1e1535" stroke-width="2.5"/>
    <line x1="8" y1="32" x2="38" y2="32" stroke="#6b7280" stroke-width="1.2"/>
  </svg>`,

    // 2. Pill Badge Header
    'pt-pill-badge-header': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="8" y="10" width="22" height="6" rx="3" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="0.8"/>
    <circle cx="12" cy="13" r="1.5" fill="#16a34a"/>
    <line x1="8" y1="23" x2="72" y2="23" stroke="#0f172a" stroke-width="2.2"/>
    <line x1="8" y1="30" x2="52" y2="30" stroke="#0f172a" stroke-width="2.2"/>
  </svg>`,

    // 3. Accent Bar Left
    'pt-accent-bar-left': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="8" y="12" width="3" height="24" rx="1" fill="#7530fb"/>
    <line x1="16" y1="18" x2="70" y2="18" stroke="#1e1535" stroke-width="2.2"/>
    <line x1="16" y1="25" x2="56" y2="25" stroke="#1e1535" stroke-width="2.2"/>
    <line x1="16" y1="32" x2="42" y2="32" stroke="#64748b" stroke-width="1.2"/>
  </svg>`,

    // 4. Luxury Serif Centered
    'pt-luxury-serif-centered': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#fafaf9" stroke="#e7e5e4" stroke-width="1"/>
    <line x1="26" y1="12" x2="54" y2="12" stroke="#b45309" stroke-width="1"/>
    <line x1="14" y1="21" x2="66" y2="21" stroke="#1c1917" stroke-width="2"/>
    <line x1="20" y1="28" x2="60" y2="28" stroke="#1c1917" stroke-width="2"/>
    <line x1="24" y1="35" x2="56" y2="35" stroke="#78716c" stroke-width="1"/>
  </svg>`,

    // 5. Modern Split Card
    'pt-modern-split-card': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="8" y1="20" x2="48" y2="20" stroke="#0f172a" stroke-width="2"/>
    <line x1="8" y1="27" x2="40" y2="27" stroke="#0f172a" stroke-width="2"/>
    <rect x="56" y="15" width="16" height="18" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
  </svg>`,

    // 6. Industrial Part Spec
    'pt-industrial-part-spec': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#0f172a" stroke-width="1"/>
    <line x1="8" y1="12" x2="36" y2="12" stroke="#0284c7" stroke-width="1.2"/>
    <line x1="8" y1="21" x2="72" y2="21" stroke="#0f172a" stroke-width="2.2"/>
    <rect x="8" y="28" width="16" height="6" rx="1.5" fill="#0f172a"/>
    <line x1="28" y1="31" x2="54" y2="31" stroke="#64748b" stroke-width="1"/>
  </svg>`,

    // 7. Underlined Accent Rule
    'pt-underlined-accent-rule': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="8" y1="17" x2="68" y2="17" stroke="#1e1535" stroke-width="2.2"/>
    <line x1="8" y1="24" x2="50" y2="24" stroke="#1e1535" stroke-width="2.2"/>
    <line x1="8" y1="29" x2="26" y2="29" stroke="#7530fb" stroke-width="2"/>
    <line x1="26" y1="29" x2="72" y2="29" stroke="#ede9fe" stroke-width="1"/>
  </svg>`,

    // 8. Dark Obsidian Badge
    'pt-dark-obsidian-badge': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#090d16"/>
    <rect x="8" y="11" width="16" height="5" rx="1.5" fill="#b8fa33"/>
    <line x1="8" y1="23" x2="72" y2="23" stroke="#ffffff" stroke-width="2.2"/>
    <line x1="8" y1="30" x2="52" y2="30" stroke="#ffffff" stroke-width="2.2"/>
  </svg>`,

    // 9. Verified Shield Banner
    'pt-verified-shield-banner': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="8" y="15" width="12" height="14" rx="2" fill="#eff6ff" stroke="#dbeafe" stroke-width="0.8"/>
    <line x1="24" y1="16" x2="48" y2="16" stroke="#2563eb" stroke-width="1"/>
    <line x1="24" y1="23" x2="72" y2="23" stroke="#0f172a" stroke-width="2"/>
    <line x1="24" y1="29" x2="58" y2="29" stroke="#0f172a" stroke-width="2"/>
  </svg>`,

    // 10. Compact Inline Pip
    'pt-compact-inline-pip': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="8" y1="18" x2="72" y2="18" stroke="#1e1535" stroke-width="2"/>
    <circle cx="10" cy="28" r="1.5" fill="#7530fb"/>
    <line x1="16" y1="28" x2="54" y2="28" stroke="#64748b" stroke-width="1.2"/>
  </svg>`,
}

export function getProductTitleThumbnailSvg(id: string): string {
    const key = Object.keys(PRODUCT_TITLE_THUMBNAILS).find(k => {
        const clean = id.toLowerCase().replace(/_/g, '-')
        const vClean = k.toLowerCase().replace(/_/g, '-')
        return k === id || vClean === clean || k.endsWith(clean) || id.endsWith(k)
    })
    return key ? PRODUCT_TITLE_THUMBNAILS[key] : PRODUCT_TITLE_THUMBNAILS['pt-classic-baseline']
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const productTitleVariants: BlockVariant[] = [
    {
        id: 'pt-classic-baseline',
        label: 'Classic Baseline',
        description: 'Current clean H1 with condition text below',
        thumbnail: PRODUCT_TITLE_THUMBNAILS['pt-classic-baseline'],
        toHtml(props, id) { return classicBaseline(props, id) },
    },
    {
        id: 'pt-pill-badge-header',
        label: 'Pill Badge Header',
        description: 'Top condition pill badge above bold high-impact title',
        thumbnail: PRODUCT_TITLE_THUMBNAILS['pt-pill-badge-header'],
        toHtml(props, id) { return pillBadgeHeader(props, id) },
    },
    {
        id: 'pt-accent-bar-left',
        label: 'Accent Bar Left',
        description: '4px solid vertical accent bar flanking title on left',
        thumbnail: PRODUCT_TITLE_THUMBNAILS['pt-accent-bar-left'],
        toHtml(props, id) { return accentBarLeft(props, id) },
    },
    {
        id: 'pt-luxury-serif-centered',
        label: 'Luxury Serif Centered',
        description: 'Centered Roman serif with flanking dots for jewelry & watches',
        thumbnail: PRODUCT_TITLE_THUMBNAILS['pt-luxury-serif-centered'],
        toHtml(props, id) { return luxurySerifCentered(props, id) },
    },
    {
        id: 'pt-modern-split-card',
        label: 'Modern Split Card',
        description: 'Two-tone split row: title on left, condition badge card on right',
        thumbnail: PRODUCT_TITLE_THUMBNAILS['pt-modern-split-card'],
        toHtml(props, id) { return modernSplitCard(props, id) },
    },
    {
        id: 'pt-industrial-part-spec',
        label: 'Industrial Part Spec',
        description: 'Monospace MPN/OEM kicker tag for auto parts & hardware',
        thumbnail: PRODUCT_TITLE_THUMBNAILS['pt-industrial-part-spec'],
        toHtml(props, id) { return industrialPartSpec(props, id) },
    },
    {
        id: 'pt-underlined-accent-rule',
        label: 'Underlined Accent Rule',
        description: 'Distinctive dual-tone bottom rule with colored accent stroke',
        thumbnail: PRODUCT_TITLE_THUMBNAILS['pt-underlined-accent-rule'],
        toHtml(props, id) { return underlinedAccentRule(props, id) },
    },
    {
        id: 'pt-dark-obsidian-badge',
        label: 'Dark Obsidian Badge',
        description: 'Deep charcoal title card with electric badge for gaming & streetwear',
        thumbnail: PRODUCT_TITLE_THUMBNAILS['pt-dark-obsidian-badge'],
        toHtml(props, id) { return darkObsidianBadge(props, id) },
    },
    {
        id: 'pt-verified-shield-banner',
        label: 'Verified Shield Banner',
        description: 'Authentic verified shield badge with official product title',
        thumbnail: PRODUCT_TITLE_THUMBNAILS['pt-verified-shield-banner'],
        toHtml(props, id) { return verifiedShieldBanner(props, id) },
    },
    {
        id: 'pt-compact-inline-pip',
        label: 'Compact Inline Pip',
        description: 'Mobile-first compact inline layout with minimal vertical footprint',
        thumbnail: PRODUCT_TITLE_THUMBNAILS['pt-compact-inline-pip'],
        toHtml(props, id) { return compactInlinePip(props, id) },
    },
]

// Backwards-compatible aliases
export const titleVariants = productTitleVariants
export const productTitleBlockVariants = productTitleVariants

export function getProductTitleVariant(id?: string): BlockVariant {
    if (!id) return productTitleVariants[0]
    return productTitleVariants.find(v => v.id === id) || productTitleVariants[0]
}
export const getTitleVariant = getProductTitleVariant
