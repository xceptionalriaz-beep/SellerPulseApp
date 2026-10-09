// components/ui/VisualEditor/variants/bullet_list.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Bullet List Retail Architectures (10 High-Converting Layout Styles)
//
// Grounded in Top-Rated eBay Power-Seller Storefronts (Anker, Spigen, Dyson, Currys):
// • Style 1 is 100% IDENTICAL to current baseline (updated to full width)
// • 9 new radically distinct commercial retail bullet architectures
// • 100% full-width edge-to-edge across desktop (1000px) and mobile (375px)
// • Crisp vector SVG icons (zero emojis, zero glassy AI slop)
// • Pure eBay-compliant inline CSS and HTML table architecture (VeRO safe)
//
// 10 Distinct Layout Styles:
//   1.  bl-classic-check            (Current Baseline — 100% SAME TO SAME full-width check list)
//   2.  bl-two-column-cards         (2-Column Benefit Cards — 50/50 Desktop, Stacks Cleanly on Mobile)
//   3.  bl-bold-prefix-highlight    (Key-Benefit Bold Accent Prefix — Highlights Feature Before Dash)
//   4.  bl-enclosed-capsule-pills   (Enclosed Rounded Capsule Pills with Inset Checkmark Badges)
//   5.  bl-boutique-hairline-ledger (Scandinavian Luxury Hairline Rules with Gold Diamond Bullets)
//   6.  bl-dark-obsidian-matrix     (Midnight High-Contrast Tech Matrix for Electronics & Hardware)
//   7.  bl-verified-shield-strip    (Verified Green Shield Badges with Clear Feature/Benefit Split)
//   8.  bl-numbered-milestones      (Sequential 01, 02, 03 Milestone Pips for Setup or Top Features)
//   9.  bl-accent-pillar-rail       (Left Solid Brand Accent Rail with Clean Indented Check Rows)
//   10. bl-zebra-spec-rows          (Alternating Zebra Rows for High-Legibility Technical Specifications)
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockVariant } from './section_label.variants'

export interface BulletListProps {
    items?: string[]
    color?: string
    fontSize?: number
    fontWeight?: string
    lineHeight?: number
    letterSpacing?: number
    bulletColor?: string
    bulletStyle?: 'check' | 'disc' | 'arrow' | 'star'
    bgColor?: string
    accentColor?: string
    paddingTop?: number
    paddingBottom?: number
    paddingLeft?: number
    paddingRight?: number
    variant?: string
}

// ── Shared Vector SVG Glyphs (Crisp, Scalable, Zero Emojis) ──────────────────

function getCheckSvg(color = '#16a34a', size = 14): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><polyline points="20 6 9 17 4 12"/></svg>`
}

function getShieldCheckSvg(color = '#16a34a', size = 14): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`
}

function getDiamondSvg(color = '#d97706', size = 10): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="1" style="display:inline-block;vertical-align:middle;"><polygon points="12 2 22 12 12 22 2 12 12 2"/></svg>`
}

// ── Property Resolvers ────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
    'Feature one — describe your product benefit',
    'Feature two — another key selling point',
    'Feature three — quality guarantee',
]

function getItems(p: any): string[] {
    if (Array.isArray(p.items) && p.items.length > 0) return p.items
    return DEFAULT_ITEMS
}

function parseBulletItem(item: string): { title: string; desc: string; hasSplit: boolean } {
    const raw = String(item || '').trim()
    const parts = raw.split(/\s*[-–—:]\s*/)
    if (parts.length >= 2 && parts[0].length < 45) {
        return { title: parts[0], desc: parts.slice(1).join(' — '), hasSplit: true }
    }
    return { title: raw, desc: '', hasSplit: false }
}

function pad(p: any, defaultTop = 16, defaultRight = 24, defaultBottom = 16, defaultLeft = 24): string {
    const pt = p.paddingTop ?? defaultTop
    const pr = p.paddingRight ?? defaultRight
    const pb = p.paddingBottom ?? defaultBottom
    const pl = p.paddingLeft ?? defaultLeft
    return `padding:${pt}px ${pr}px ${pb}px ${pl}px;`
}

function resolveBg(p: any, defaultColor = '#ffffff'): string {
    if (p.bgColor && p.bgColor !== '#7530fb') return p.bgColor
    return defaultColor
}

function resolveText(p: any, defaultColor = '#1f1d2e'): string {
    if (p.color && p.color !== '#ffffff') return p.color
    return defaultColor
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLASSIC CHECK LIST (CURRENT BASELINE — 100% SAME TO SAME, FULL WIDTH)
// Standard full-width checkmark list with clean glyph alignment
// ─────────────────────────────────────────────────────────────────────────────
function variantClassicCheck(p: any, id: string): string {
    const items = getItems(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#1f1d2e')
    const bulletColor = p.bulletColor || '#7530fb'
    const fontSize = p.fontSize ?? 14
    const fontWeight = p.fontWeight || '400'
    const lineHeight = p.lineHeight ?? 1.6
    const lsEm = ((p.letterSpacing ?? 0) / (p.fontSize ?? 14)).toFixed(4)

    const bulletMap: Record<string, string> = {
        disc: '•',
        check: '&#10003;',
        arrow: '&#8594;',
        star: '&#9733;',
    }
    const bullet = bulletMap[p.bulletStyle] || '&#10003;'

    const rows = items.map((item, idx) => `
        <tr>
          <td width="22" valign="top" style="width:22px;padding-right:8px;padding-bottom:${idx === items.length - 1 ? '0' : '9px'};font-family:Arial,sans-serif;font-size:${fontSize}px;color:${bulletColor};font-weight:700;line-height:${lineHeight};">
            ${bullet}
          </td>
          <td valign="top" style="padding-bottom:${idx === items.length - 1 ? '0' : '9px'};font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:${fontWeight};color:${color};line-height:${lineHeight};letter-spacing:${lsEm}em;word-break:break-word;">
            ${item}
          </td>
        </tr>
    `).join('')

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
            ${rows}
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TWO-COLUMN BENEFIT CARDS (50/50 Desktop, Stacks Cleanly on Mobile)
// 2-column balanced grid of soft cards that cuts vertical height in half
// ─────────────────────────────────────────────────────────────────────────────
function variantTwoColumnCards(p: any, id: string): string {
    const items = getItems(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#0f172a')
    const accent = p.accentColor || p.bulletColor || '#16a34a'
    const fontSize = p.fontSize ?? 13.5
    const checkSvg = getCheckSvg(accent, 14)

    const cardsHtml = items.map(item => {
        const parsed = parseBulletItem(item)
        return `
        <td width="50%" valign="top" class="bl-card-col-${id}" style="padding:4px;box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px 12px;height:100%;box-sizing:border-box;">
            <tr>
              <td width="22" valign="top" style="width:22px;padding-right:8px;padding-top:1px;">
                <div style="width:18px;height:18px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:50%;text-align:center;line-height:16px;">
                  ${checkSvg}
                </div>
              </td>
              <td valign="top">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:700;color:${color};line-height:1.3;word-break:break-word;">
                  ${parsed.title}
                </div>
                ${parsed.hasSplit ? `
                <div style="font-family:Arial,sans-serif;font-size:11.5px;color:#64748b;line-height:1.4;margin-top:3px;word-break:break-word;">
                  ${parsed.desc}
                </div>` : ''}
              </td>
            </tr>
          </table>
        </td>`
    })

    const pairedRows: string[] = []
    for (let i = 0; i < cardsHtml.length; i += 2) {
        pairedRows.push(`
        <tr class="bl-card-row-${id}">
          ${cardsHtml[i]}
          ${cardsHtml[i + 1] || '<td width="50%" class="bl-card-col-' + id + '" style="padding:4px;"></td>'}
        </tr>`)
    }

    return `
    <style>
      @media only screen and (max-width: 680px) {
        .bl-card-row-${id} { display: block !important; width: 100% !important; }
        .bl-card-col-${id} { display: block !important; width: 100% !important; padding: 4px 0 !important; }
      }
    </style>
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:-4px 0;width:100%;">
            ${pairedRows.join('')}
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. KEY-BENEFIT BOLD PREFIX (Feature Highlight Prefix Before Dash)
// Automatically bolds and colors the feature title, keeping benefit copy clear
// ─────────────────────────────────────────────────────────────────────────────
function variantBoldPrefixHighlight(p: any, id: string): string {
    const items = getItems(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#334155')
    const accent = p.accentColor || p.bulletColor || '#7530fb'
    const fontSize = p.fontSize ?? 14
    const checkSvg = getCheckSvg(accent, 14)

    const rows = items.map((item, idx) => {
        const parsed = parseBulletItem(item)
        return `
        <tr>
          <td width="24" valign="top" style="width:24px;padding-right:8px;padding-bottom:${idx === items.length - 1 ? '0' : '10px'};padding-top:2px;">
            <div style="width:18px;height:18px;background:#f3eeff;border-radius:4px;text-align:center;line-height:16px;">
              ${checkSvg}
            </div>
          </td>
          <td valign="top" style="padding-bottom:${idx === items.length - 1 ? '0' : '10px'};font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;line-height:1.6;color:${color};word-break:break-word;">
            ${parsed.hasSplit ? `
            <strong style="color:#0f172a;font-weight:800;letter-spacing:-0.1px;">${parsed.title}</strong>
            <span style="color:#94a3b8;margin:0 4px;">—</span>
            <span>${parsed.desc}</span>` : `
            <strong style="color:#0f172a;font-weight:700;">${parsed.title}</strong>`}
          </td>
        </tr>`
    }).join('')

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
            ${rows}
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ENCLOSED CAPSULE PILLS (Floating Benefit Capsules)
// Discrete enclosed pill containers with soft background and check badges
// ─────────────────────────────────────────────────────────────────────────────
function variantEnclosedCapsulePills(p: any, id: string): string {
    const items = getItems(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#0f172a')
    const accent = p.accentColor || p.bulletColor || '#16a34a'
    const fontSize = p.fontSize ?? 13
    const checkSvg = getCheckSvg(accent, 13)

    const pills = items.map((item, idx) => `
        <tr>
          <td style="padding-bottom:${idx === items.length - 1 ? '0' : '6px'};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:8px 12px;box-sizing:border-box;">
              <tr>
                <td width="22" valign="middle" style="width:22px;padding-right:8px;">
                  <div style="width:16px;height:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:50%;text-align:center;line-height:14px;">
                    ${checkSvg}
                  </div>
                </td>
                <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:600;color:${color};line-height:1.35;word-break:break-word;">
                  ${item}
                </td>
              </tr>
            </table>
          </td>
        </tr>
    `).join('')

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p, 12, 16, 12, 16)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
            ${pills}
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. BOUTIQUE HAIRLINE LEDGER (Minimalist Rules with Gold Diamonds)
// Delicate horizontal dividing rules for jewelry, watches, fashion & art
// ─────────────────────────────────────────────────────────────────────────────
function variantBoutiqueHairlineLedger(p: any, id: string): string {
    const items = getItems(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#1c1917')
    const accent = p.accentColor || '#b45309'
    const fontSize = p.fontSize ?? 13.5
    const diamondSvg = getDiamondSvg(accent, 10)

    const rows = items.map((item, idx) => `
        <tr>
          <td style="border-bottom:1px solid #e7e5e4;padding:10px 0;box-sizing:border-box;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
              <tr>
                <td width="20" valign="middle" style="width:20px;padding-right:8px;">
                  ${diamondSvg}
                </td>
                <td valign="middle" style="font-family:Georgia,serif,Arial;font-size:${fontSize}px;font-weight:500;color:${color};line-height:1.5;letter-spacing:0.2px;word-break:break-word;">
                  ${item}
                </td>
              </tr>
            </table>
          </td>
        </tr>
    `).join('')

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #e7e5e4;table-layout:fixed;width:100%;">
            ${rows}
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. DARK OBSIDIAN MATRIX (Midnight High-Contrast Tech Matrix)
// Deep obsidian slate container with bright cyan checkmarks for tech & tools
// ─────────────────────────────────────────────────────────────────────────────
function variantDarkObsidianMatrix(p: any, id: string): string {
    const items = getItems(p)
    const bg = '#0f172a'
    const color = '#f8fafc'
    const accent = p.accentColor || '#38bdf8'
    const fontSize = p.fontSize ?? 13.5
    const checkSvg = getCheckSvg(accent, 13)

    const rows = items.map((item, idx) => `
        <tr>
          <td style="padding:8px 12px;background:#1e293b;border:1px solid #334155;border-radius:4px;box-sizing:border-box;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
              <tr>
                <td width="22" valign="middle" style="width:22px;padding-right:8px;">
                  <div style="width:16px;height:16px;background:rgba(56,189,248,0.15);border:1px solid ${accent};border-radius:3px;text-align:center;line-height:14px;">
                    ${checkSvg}
                  </div>
                </td>
                <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:600;color:${color};line-height:1.4;word-break:break-word;">
                  ${item}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${idx === items.length - 1 ? '' : '<tr><td height="5"></td></tr>'}
    `).join('')

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 12, 16, 12, 16)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg};border:1px solid #1e293b;border-radius:6px;padding:10px;box-sizing:border-box;">
            ${rows}
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. VERIFIED SHIELD STRIP (Green Circular Shield Verification Points)
// Circular green vector shields with clear feature and benefit separation
// ─────────────────────────────────────────────────────────────────────────────
function variantVerifiedShieldStrip(p: any, id: string): string {
    const items = getItems(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#0f172a')
    const accent = '#16a34a'
    const fontSize = p.fontSize ?? 13.5
    const shieldSvg = getShieldCheckSvg(accent, 14)

    const rows = items.map((item, idx) => {
        const parsed = parseBulletItem(item)
        return `
        <tr>
          <td width="28" valign="top" style="width:28px;padding-right:10px;padding-bottom:${idx === items.length - 1 ? '0' : '10px'};padding-top:1px;">
            <div style="width:20px;height:20px;background:#f0fdf4;border:1.5px solid #86efac;border-radius:50%;text-align:center;line-height:18px;">
              ${shieldSvg}
            </div>
          </td>
          <td valign="top" style="padding-bottom:${idx === items.length - 1 ? '0' : '10px'};font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;line-height:1.5;color:${color};word-break:break-word;">
            <strong style="color:#0f172a;font-weight:800;">${parsed.title}</strong>
            ${parsed.hasSplit ? `<div style="font-size:11.5px;color:#64748b;margin-top:2px;line-height:1.4;">${parsed.desc}</div>` : ''}
          </td>
        </tr>`
    }).join('')

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
            ${rows}
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. NUMBERED MILESTONES (01, 02, 03 Sequential List)
// Step-by-step instructions, installation guide, or top selling reasons
// ─────────────────────────────────────────────────────────────────────────────
function variantNumberedMilestones(p: any, id: string): string {
    const items = getItems(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#0f172a')
    const accent = p.accentColor || p.bulletColor || '#7530fb'
    const fontSize = p.fontSize ?? 13.5

    const rows = items.map((item, idx) => {
        const stepNum = idx < 9 ? `0${idx + 1}` : `${idx + 1}`
        return `
        <tr>
          <td width="30" valign="top" style="width:30px;padding-right:10px;padding-bottom:${idx === items.length - 1 ? '0' : '10px'};">
            <div style="width:22px;height:22px;background:${accent};border-radius:50%;text-align:center;line-height:22px;font-family:Arial,sans-serif;font-size:10px;font-weight:900;color:#ffffff;">
              ${stepNum}
            </div>
          </td>
          <td valign="middle" style="padding-bottom:${idx === items.length - 1 ? '0' : '10px'};font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:600;color:${color};line-height:1.5;word-break:break-word;">
            ${item}
          </td>
        </tr>`
    }).join('')

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
            ${rows}
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. ACCENT PILLAR RAIL (Left Brand Accent Stripe with Clean Rows)
// A vertical brand accent bar running down the left with clean indented check points
// ─────────────────────────────────────────────────────────────────────────────
function variantAccentPillarRail(p: any, id: string): string {
    const items = getItems(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#1e293b')
    const accent = p.accentColor || p.bulletColor || '#7530fb'
    const fontSize = p.fontSize ?? 13.5
    const checkSvg = getCheckSvg(accent, 14)

    const rows = items.map((item, idx) => `
        <tr>
          <td width="20" valign="top" style="width:20px;padding-right:6px;padding-bottom:${idx === items.length - 1 ? '0' : '8px'};">
            ${checkSvg}
          </td>
          <td valign="top" style="padding-bottom:${idx === items.length - 1 ? '0' : '8px'};font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:500;color:${color};line-height:1.5;word-break:break-word;">
            ${item}
          </td>
        </tr>
    `).join('')

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
            <tr>
              <td width="4" style="width:4px;background-color:${accent};border-radius:2px;font-size:1px;">&nbsp;</td>
              <td style="padding-left:14px;box-sizing:border-box;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
                  ${rows}
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. ZEBRA SPEC ROWS (Alternating White & Slate Rows)
// High-legibility technical specification rows for dense feature lists
// ─────────────────────────────────────────────────────────────────────────────
function variantZebraSpecRows(p: any, id: string): string {
    const items = getItems(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#0f172a')
    const accent = p.accentColor || p.bulletColor || '#2563eb'
    const fontSize = p.fontSize ?? 13
    const checkSvg = getCheckSvg(accent, 13)

    const rows = items.map((item, idx) => `
        <tr style="background:${idx % 2 === 0 ? '#f8fafc' : '#ffffff'};">
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;box-sizing:border-box;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
              <tr>
                <td width="20" valign="middle" style="width:20px;padding-right:6px;">
                  ${checkSvg}
                </td>
                <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:600;color:${color};line-height:1.4;word-break:break-word;">
                  ${item}
                </td>
              </tr>
            </table>
          </td>
        </tr>
    `).join('')

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 10, 16, 10, 16)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg};border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;table-layout:fixed;width:100%;">
            ${rows}
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant Registry Array
// ─────────────────────────────────────────────────────────────────────────────

export const bulletListVariants: BlockVariant[] = [
    {
        id: 'bl-classic-check',
        label: 'Classic Check',
        description: 'Current Baseline: Full-width checkmark list with clean glyph alignment (100% same to same)',
        toHtml: variantClassicCheck,
    },
    {
        id: 'bl-two-column-cards',
        label: 'Benefit Cards',
        description: '2-column balanced grid of soft cards that cuts vertical height in half on desktop',
        toHtml: variantTwoColumnCards,
    },
    {
        id: 'bl-bold-prefix-highlight',
        label: 'Bold Key-Prefix',
        description: 'Bolds and highlights the feature title before the dash, separating feature from benefit',
        toHtml: variantBoldPrefixHighlight,
    },
    {
        id: 'bl-enclosed-capsule-pills',
        label: 'Capsule Pills',
        description: 'Enclosed rounded capsule pills with inset checkmark badges for high scannability',
        toHtml: variantEnclosedCapsulePills,
    },
    {
        id: 'bl-boutique-hairline-ledger',
        label: 'Boutique Ledger',
        description: 'Minimalist horizontal hairline rules with antique gold diamond bullets for luxury items',
        toHtml: variantBoutiqueHairlineLedger,
    },
    {
        id: 'bl-dark-obsidian-matrix',
        label: 'Dark Obsidian',
        description: 'Deep obsidian container with electric cyan checkmarks for tech, tools & auto parts',
        toHtml: variantDarkObsidianMatrix,
    },
    {
        id: 'bl-verified-shield-strip',
        label: 'Verified Shields',
        description: 'Circular green vector shields with clear feature title and explanatory description',
        toHtml: variantVerifiedShieldStrip,
    },
    {
        id: 'bl-numbered-milestones',
        label: 'Numbered Steps',
        description: 'Numbered 01, 02, 03 circular pips for step-by-step guides or top selling reasons',
        toHtml: variantNumberedMilestones,
    },
    {
        id: 'bl-accent-pillar-rail',
        label: 'Accent Pillar',
        description: 'Left vertical brand accent rail with clean indented checkmark rows',
        toHtml: variantAccentPillarRail,
    },
    {
        id: 'bl-zebra-spec-rows',
        label: 'Zebra Spec Rows',
        description: 'Alternating white and slate rows with dividing lines for dense technical lists',
        toHtml: variantZebraSpecRows,
    },
]

export const bulletListBlockVariants = bulletListVariants

export function getBulletListVariant(variantId: string): BlockVariant {
    const found = bulletListVariants.find(v => v.id === variantId)
    return found ?? bulletListVariants[0]
}

// ─────────────────────────────────────────────────────────────────────────────
// 10 Vector SVG Thumbnails
// ─────────────────────────────────────────────────────────────────────────────

export const BULLET_LIST_THUMBNAILS: Record<string, string> = {
    'bl-classic-check': `<svg viewBox="0 0 100 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <rect width="100" height="44" rx="4" fill="#ffffff"/>
  <path d="M12 14l2 2 4-4" stroke="#7530fb" stroke-width="1.5" stroke-linecap="round"/>
  <rect x="22" y="12" width="66" height="4" rx="2" fill="#1e1535"/>
  <path d="M12 24l2 2 4-4" stroke="#7530fb" stroke-width="1.5" stroke-linecap="round"/>
  <rect x="22" y="22" width="66" height="4" rx="2" fill="#1e1535"/>
  <path d="M12 34l2 2 4-4" stroke="#7530fb" stroke-width="1.5" stroke-linecap="round"/>
  <rect x="22" y="32" width="50" height="4" rx="2" fill="#1e1535"/>
</svg>`,

    'bl-two-column-cards': `<svg viewBox="0 0 100 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <rect width="100" height="44" rx="4" fill="#ffffff"/>
  <!-- Col 1 -->
  <rect x="8" y="10" width="38" height="11" rx="3" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
  <circle cx="14" cy="15.5" r="2.5" fill="#16a34a"/>
  <rect x="19" y="14" width="23" height="3" rx="1.5" fill="#0f172a"/>
  <rect x="8" y="25" width="38" height="11" rx="3" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
  <circle cx="14" cy="30.5" r="2.5" fill="#16a34a"/>
  <rect x="19" y="29" width="23" height="3" rx="1.5" fill="#0f172a"/>
  <!-- Col 2 -->
  <rect x="54" y="10" width="38" height="11" rx="3" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
  <circle cx="60" cy="15.5" r="2.5" fill="#16a34a"/>
  <rect x="65" y="14" width="23" height="3" rx="1.5" fill="#0f172a"/>
  <rect x="54" y="25" width="38" height="11" rx="3" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
  <circle cx="60" cy="30.5" r="2.5" fill="#16a34a"/>
  <rect x="65" y="29" width="23" height="3" rx="1.5" fill="#0f172a"/>
</svg>`,

    'bl-bold-prefix-highlight': `<svg viewBox="0 0 100 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <rect width="100" height="44" rx="4" fill="#ffffff"/>
  <rect x="10" y="11" width="6" height="6" rx="1.5" fill="#f3eeff"/>
  <rect x="20" y="12" width="24" height="4" rx="1.5" fill="#0f172a"/>
  <rect x="47" y="13" width="42" height="2.5" rx="1" fill="#64748b"/>
  <rect x="10" y="21" width="6" height="6" rx="1.5" fill="#f3eeff"/>
  <rect x="20" y="22" width="24" height="4" rx="1.5" fill="#0f172a"/>
  <rect x="47" y="23" width="42" height="2.5" rx="1" fill="#64748b"/>
  <rect x="10" y="31" width="6" height="6" rx="1.5" fill="#f3eeff"/>
  <rect x="20" y="32" width="20" height="4" rx="1.5" fill="#0f172a"/>
  <rect x="43" y="33" width="36" height="2.5" rx="1" fill="#64748b"/>
</svg>`,

    'bl-enclosed-capsule-pills': `<svg viewBox="0 0 100 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <rect width="100" height="44" rx="4" fill="#ffffff"/>
  <rect x="8" y="8" width="84" height="7.5" rx="3.5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
  <circle cx="14" cy="11.75" r="2" fill="#16a34a"/>
  <rect x="19" y="10.25" width="65" height="3" rx="1.5" fill="#0f172a"/>
  <rect x="8" y="18.25" width="84" height="7.5" rx="3.5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
  <circle cx="14" cy="22" r="2" fill="#16a34a"/>
  <rect x="19" y="20.5" width="65" height="3" rx="1.5" fill="#0f172a"/>
  <rect x="8" y="28.5" width="84" height="7.5" rx="3.5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
  <circle cx="14" cy="32.25" r="2" fill="#16a34a"/>
  <rect x="19" y="30.75" width="50" height="3" rx="1.5" fill="#0f172a"/>
</svg>`,

    'bl-boutique-hairline-ledger': `<svg viewBox="0 0 100 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <rect width="100" height="44" rx="4" fill="#ffffff"/>
  <line x1="10" y1="9" x2="90" y2="9" stroke="#e7e5e4" stroke-width="1"/>
  <polygon points="14,14 16.5,17 14,20 11.5,17" fill="#b45309"/>
  <rect x="22" y="15" width="64" height="4" rx="1.5" fill="#1c1917"/>
  <line x1="10" y1="24" x2="90" y2="24" stroke="#e7e5e4" stroke-width="1"/>
  <polygon points="14,29 16.5,32 14,35 11.5,32" fill="#b45309"/>
  <rect x="22" y="30" width="54" height="4" rx="1.5" fill="#1c1917"/>
  <line x1="10" y1="39" x2="90" y2="39" stroke="#e7e5e4" stroke-width="1"/>
</svg>`,

    'bl-dark-obsidian-matrix': `<svg viewBox="0 0 100 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <rect width="100" height="44" rx="4" fill="#0f172a"/>
  <rect x="8" y="8" width="84" height="7.5" rx="2" fill="#1e293b" stroke="#334155" stroke-width="0.8"/>
  <rect x="12" y="10" width="3.5" height="3.5" fill="#38bdf8"/>
  <rect x="19" y="10.25" width="65" height="3" rx="1.5" fill="#ffffff"/>
  <rect x="8" y="18.25" width="84" height="7.5" rx="2" fill="#1e293b" stroke="#334155" stroke-width="0.8"/>
  <rect x="12" y="20.25" width="3.5" height="3.5" fill="#38bdf8"/>
  <rect x="19" y="20.5" width="65" height="3" rx="1.5" fill="#ffffff"/>
  <rect x="8" y="28.5" width="84" height="7.5" rx="2" fill="#1e293b" stroke="#334155" stroke-width="0.8"/>
  <rect x="12" y="30.5" width="3.5" height="3.5" fill="#38bdf8"/>
  <rect x="19" y="30.75" width="50" height="3" rx="1.5" fill="#ffffff"/>
</svg>`,

    'bl-verified-shield-strip': `<svg viewBox="0 0 100 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <rect width="100" height="44" rx="4" fill="#ffffff"/>
  <circle cx="14" cy="14" r="3.5" fill="#f0fdf4" stroke="#16a34a" stroke-width="1"/>
  <rect x="22" y="11" width="30" height="3.5" rx="1.5" fill="#0f172a"/>
  <rect x="22" y="16" width="55" height="2" rx="1" fill="#64748b"/>
  <circle cx="14" cy="28" r="3.5" fill="#f0fdf4" stroke="#16a34a" stroke-width="1"/>
  <rect x="22" y="25" width="30" height="3.5" rx="1.5" fill="#0f172a"/>
  <rect x="22" y="30" width="55" height="2" rx="1" fill="#64748b"/>
</svg>`,

    'bl-numbered-milestones': `<svg viewBox="0 0 100 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <rect width="100" height="44" rx="4" fill="#ffffff"/>
  <circle cx="15" cy="14" r="4.5" fill="#7530fb"/>
  <rect x="14" y="11" width="2" height="6" fill="#ffffff"/>
  <rect x="24" y="12" width="64" height="4" rx="1.5" fill="#0f172a"/>
  <circle cx="15" cy="28" r="4.5" fill="#7530fb"/>
  <rect x="13.5" y="25" width="3" height="6" fill="#ffffff"/>
  <rect x="24" y="26" width="58" height="4" rx="1.5" fill="#0f172a"/>
</svg>`,

    'bl-accent-pillar-rail': `<svg viewBox="0 0 100 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <rect width="100" height="44" rx="4" fill="#ffffff"/>
  <rect x="8" y="10" width="3" height="24" rx="1.5" fill="#7530fb"/>
  <path d="M16 15l2 2 4-4" stroke="#7530fb" stroke-width="1.5" stroke-linecap="round"/>
  <rect x="26" y="13" width="60" height="3.5" rx="1.5" fill="#1e293b"/>
  <path d="M16 24l2 2 4-4" stroke="#7530fb" stroke-width="1.5" stroke-linecap="round"/>
  <rect x="26" y="22" width="60" height="3.5" rx="1.5" fill="#1e293b"/>
  <path d="M16 33l2 2 4-4" stroke="#7530fb" stroke-width="1.5" stroke-linecap="round"/>
  <rect x="26" y="31" width="46" height="3.5" rx="1.5" fill="#1e293b"/>
</svg>`,

    'bl-zebra-spec-rows': `<svg viewBox="0 0 100 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <rect width="100" height="44" rx="4" fill="#ffffff"/>
  <rect x="8" y="8" width="84" height="8" fill="#f8fafc"/>
  <path d="M12 12l1.5 1.5 3-3" stroke="#2563eb" stroke-width="1.2" stroke-linecap="round"/>
  <rect x="20" y="10.5" width="64" height="3" rx="1.5" fill="#0f172a"/>
  <rect x="8" y="18" width="84" height="8" fill="#ffffff"/>
  <path d="M12 22l1.5 1.5 3-3" stroke="#2563eb" stroke-width="1.2" stroke-linecap="round"/>
  <rect x="20" y="20.5" width="64" height="3" rx="1.5" fill="#0f172a"/>
  <rect x="8" y="28" width="84" height="8" fill="#f8fafc"/>
  <path d="M12 32l1.5 1.5 3-3" stroke="#2563eb" stroke-width="1.2" stroke-linecap="round"/>
  <rect x="20" y="30.5" width="50" height="3" rx="1.5" fill="#0f172a"/>
</svg>`,
}
