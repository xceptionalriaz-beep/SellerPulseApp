// components/ui/VisualEditor/variants/info_box.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Notice & Important Information Boxes (5 Professional Layout Styles)
//
// 100% eBay Active Content Policy Compliant (Inline CSS & Tables, VeRO Safe)
// Fully responsive across Desktop (1000px), Tablet (768px), and Mobile (375px)
//
// 5 Distinct Layout Styles:
//   1.  info-classic-banner     (Current Baseline — 100% SAME TO SAME soft alert card)
//   2.  info-accent-pillar      (Solid Left Accent Stripe Callout with Floating Badge)
//   3.  info-floating-capsule   (Modern Rounded Floating Disc with Shield Verification)
//   4.  info-split-bullet-deck  (High-Impact Two-Tone Grid with Micro-Bullet Checklist)
//   5.  info-minimal-editorial  (Scandinavian Luxury Ledger with Hairline Borders)
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockVariant } from './section_label.variants'

export interface InfoBoxItem {
    title?: string
    heading?: string
    description?: string
    text?: string
    icon?: string
    badge?: string
}

// ── Shared Vector SVG Icons (Crisp Scalable Vectors, Zero Emojis) ─────────────

export function getInfoCircleSvg(color = '#3b82f6', size = 20): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
}

export function getShieldCheckSvg(color = '#16a34a', size = 20): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`
}

export function getBellAlertSvg(color = '#f59e0b', size = 20): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`
}

export function getCheckmarkSvg(color = '#10b981', size = 14): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:5px;"><polyline points="20 6 9 17 4 12"/></svg>`
}

// ── Property Resolvers ───────────────────────────────────────────────────────

function getTitle(p: any): string {
    return p.title || p.heading || 'Important Information'
}

function getDescription(p: any): string {
    return p.description || p.text || 'This item ships from a UK warehouse. All items are genuine. VAT invoice available on request.'
}

function pad(p: any, defaultTop = 16, defaultRight = 24, defaultBottom = 16, defaultLeft = 24): string {
    const pt = p.paddingTop ?? defaultTop
    const pr = p.paddingRight ?? defaultRight
    const pb = p.paddingBottom ?? defaultBottom
    const pl = p.paddingLeft ?? defaultLeft
    return `padding:${pt}px ${pr}px ${pb}px ${pl}px;`
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLASSIC BANNER (CURRENT BASELINE — 100% SAME TO SAME)
// Soft card with left info icon disc, navy bold heading and description
// ─────────────────────────────────────────────────────────────────────────────
function variantClassicBanner(p: any, id: string): string {
    const title = getTitle(p)
    const description = getDescription(p)
    const bg = p.bgColor || p.backgroundColor || '#ffffff'
    const textColor = p.textColor || '#1e40af'
    const border = p.showBorder === false ? 'none' : `1px solid ${p.borderColor || '#ede9fe'}`
    const iconColor = p.iconColor || '#3b82f6'
    const icon = getInfoCircleSvg(iconColor, 20)

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:${bg};border:${border};border-radius:10px;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <!-- Icon Column -->
              <td width="36" valign="top" style="width:36px;padding-right:12px;box-sizing:border-box;">
                <div style="width:28px;height:28px;border-radius:50%;background:#eff6ff;text-align:center;line-height:28px;display:inline-block;">
                  ${icon}
                </div>
              </td>
              <!-- Text Column -->
              <td valign="top" style="box-sizing:border-box;">
                <div style="font-size:14px;font-weight:700;color:${textColor};line-height:1.3;margin-bottom:4px;">
                  ${title}
                </div>
                <div style="font-size:12.5px;color:${textColor};line-height:1.48;word-break:break-word;">
                  ${description}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ACCENT PILLAR (Solid Left Accent Stripe Callout with Floating Badge)
// Bold 4px vertical accent pillar with prominent official notice micro-tag
// ─────────────────────────────────────────────────────────────────────────────
function variantAccentPillar(p: any, id: string): string {
    const title = getTitle(p)
    const description = getDescription(p)
    const bg = p.bgColor || p.backgroundColor || '#f8fafc'
    const textColor = p.textColor || '#0f172a'
    const accent = p.iconColor || p.accentColor || '#2563eb'
    const border = `1px solid ${p.borderColor || '#e2e8f0'}`
    const icon = getInfoCircleSvg(accent, 17)

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:${bg};border:${border};border-left:4px solid ${accent};border-radius:0 8px 8px 0;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 14, 18, 14, 18)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td valign="top" style="box-sizing:border-box;">
                <!-- Header Pill & Title -->
                <div style="margin-bottom:6px;">
                  <span style="display:inline-block;background:#dbeafe;color:${accent};font-size:9px;font-weight:800;letter-spacing:0.6px;text-transform:uppercase;padding:2px 7px;border-radius:10px;margin-right:8px;vertical-align:middle;">
                    OFFICIAL NOTICE
                  </span>
                  <span style="font-size:13.5px;font-weight:800;color:${textColor};vertical-align:middle;line-height:1.2;">
                    ${icon} <span style="margin-left:4px;">${title}</span>
                  </span>
                </div>
                <!-- Description Body -->
                <p style="margin:0;font-size:12px;color:#334155;line-height:1.5;word-break:break-word;">
                  ${description}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. FLOATING CAPSULE (Modern Rounded Floating Disc with Shield Verification)
// Soft pill disc background with verified delivery guarantee badge
// ─────────────────────────────────────────────────────────────────────────────
function variantFloatingCapsule(p: any, id: string): string {
    const title = getTitle(p)
    const description = getDescription(p)
    const bg = p.bgColor || p.backgroundColor || '#f0fdf4'
    const textColor = p.textColor || '#14532d'
    const border = `1px solid ${p.borderColor || '#bbf7d0'}`
    const shield = getShieldCheckSvg('#16a34a', 22)

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:${bg};border:${border};border-radius:12px;box-sizing:border-box;box-shadow:0 1px 3px rgba(0,0,0,0.03);">
      <tr>
        <td style="${pad(p, 14, 16, 14, 16)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <!-- Shield Disc -->
              <td width="42" valign="middle" style="width:42px;padding-right:12px;box-sizing:border-box;">
                <div style="width:34px;height:34px;border-radius:50%;background:#dcfce7;border:1px solid #86efac;text-align:center;line-height:34px;display:inline-block;">
                  ${shield}
                </div>
              </td>
              <!-- Text Block -->
              <td valign="middle" style="box-sizing:border-box;">
                <div style="font-size:13px;font-weight:800;color:${textColor};line-height:1.2;margin-bottom:3px;">
                  ${title} &bull; <span style="font-size:11px;color:#16a34a;font-weight:700;">Verified Dispatch</span>
                </div>
                <div style="font-size:12px;color:#166534;line-height:1.45;word-break:break-word;">
                  ${description}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SPLIT BULLET DECK (High-Impact Two-Tone Grid with Micro-Bullet Checklist)
// High conversion layout with highlighted assurance checklist
// ─────────────────────────────────────────────────────────────────────────────
function variantSplitBulletDeck(p: any, id: string): string {
    const title = getTitle(p)
    const description = getDescription(p)
    const bg = p.bgColor || p.backgroundColor || '#ffffff'
    const textColor = p.textColor || '#0f172a'
    const border = `1px solid ${p.borderColor || '#cbd5e1'}`
    const check = getCheckmarkSvg('#10b981', 13)

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:${bg};border:${border};border-radius:8px;overflow:hidden;box-sizing:border-box;">
      <!-- Top Alert Ribbon -->
      <tr style="background:#1e293b;">
        <td style="padding:8px 14px;box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" valign="middle">
                <span style="font-size:11.5px;font-weight:800;color:#f8fafc;letter-spacing:0.4px;">
                  &#9873; ${title.toUpperCase()}
                </span>
              </td>
              <td align="right" valign="middle" style="white-space:nowrap;padding-left:8px;">
                <span style="font-size:9.5px;font-weight:700;color:#38bdf8;background:#0f172a;padding:2px 6px;border-radius:4px;letter-spacing:0.4px;">
                  BUYER ASSURANCE
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- Body with Micro-Bullet Points -->
      <tr>
        <td style="${pad(p, 12, 14, 12, 14)}box-sizing:border-box;">
          <p style="margin:0 0 10px;font-size:12px;color:#334155;line-height:1.5;word-break:break-word;">
            ${description}
          </p>
          <!-- Quick Assurance Checklist Row -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px dashed #e2e8f0;padding-top:8px;">
            <tr>
              <td width="33.33%" valign="middle" style="font-size:10px;font-weight:700;color:${textColor};white-space:nowrap;padding-right:4px;">
                ${check}Genuine UK Stock
              </td>
              <td width="33.33%" valign="middle" style="font-size:10px;font-weight:700;color:${textColor};white-space:nowrap;padding-right:4px;">
                ${check}Tracked Post
              </td>
              <td width="33.33%" valign="middle" style="font-size:10px;font-weight:700;color:${textColor};white-space:nowrap;">
                ${check}VAT Receipt
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. MINIMAL EDITORIAL (Scandinavian Luxury Ledger with Hairline Borders)
// Clean high-end 1px hairline rules with uppercase tracked typography
// ─────────────────────────────────────────────────────────────────────────────
function variantMinimalEditorial(p: any, id: string): string {
    const title = getTitle(p)
    const description = getDescription(p)
    const bg = p.bgColor || p.backgroundColor || '#ffffff'
    const textColor = p.textColor || '#0f172a'

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:${bg};border-top:2px solid #0f172a;border-bottom:2px solid #0f172a;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 14, 16, 14, 16)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <!-- Category Header on Left -->
              <td width="130" valign="top" style="width:130px;padding-right:14px;box-sizing:border-box;">
                <div style="font-size:9px;font-weight:900;color:#64748b;letter-spacing:1px;text-transform:uppercase;margin-bottom:3px;white-space:nowrap;">
                  STORE POLICY
                </div>
                <div style="font-size:12px;font-weight:800;color:${textColor};line-height:1.2;">
                  ${title}
                </div>
              </td>
              <!-- Content Description on Right -->
              <td valign="top" style="border-left:1px solid #e2e8f0;padding-left:14px;box-sizing:border-box;">
                <p style="margin:0 0 6px;font-size:12px;color:#334155;line-height:1.5;word-break:break-word;">
                  ${description}
                </p>
                <div style="font-size:10px;font-weight:700;color:#059669;letter-spacing:0.3px;">
                  &bull; 100% Guaranteed Authentic &bull; Secure Packaging
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. DARK OBSIDIAN ALERT (Midnight High-Contrast Tech & Hardware Notice)
// Deep obsidian card with electric cyan badge, crisp white typography & zero glare
// ─────────────────────────────────────────────────────────────────────────────
function variantDarkObsidianAlert(p: any, id: string): string {
    const title = getTitle(p)
    const description = getDescription(p)
    const bg = p.bgColor === '#ffffff' ? '#0f172a' : (p.bgColor || '#0f172a')
    const accent = p.iconColor || p.accentColor || '#38bdf8'
    const icon = getInfoCircleSvg(accent, 18)

    return `
<table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:${bg};border:none;border-radius:10px;box-sizing:border-box;">      <tr>
        <td style="${pad(p, 13, 16, 13, 16)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <!-- Icon Disc Column -->
              <td width="36" valign="top" style="width:36px;padding-right:10px;box-sizing:border-box;">
                <div style="width:28px;height:28px;border-radius:50%;background:#1e293b;border:1px solid #334155;text-align:center;line-height:28px;display:inline-block;">
                  ${icon}
                </div>
              </td>
              <!-- Content Column -->
              <td valign="top" style="box-sizing:border-box;">
                <div style="margin-bottom:4px;">
                  <span style="display:inline-block;background:#082f49;color:#38bdf8;border:1px solid #0369a1;font-size:8px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;padding:2px 5px;border-radius:3px;margin-right:6px;vertical-align:middle;white-space:nowrap;">
                    IMPORTANT NOTICE
                  </span>
                  <span style="font-size:13px;font-weight:800;color:#ffffff;line-height:1.2;vertical-align:middle;">
                    ${title}
                  </span>
                </div>
                <p style="margin:0;font-size:11.5px;color:#94a3b8;line-height:1.48;word-break:break-word;">
                  ${description}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant Registry Array
// ─────────────────────────────────────────────────────────────────────────────

export const infoBoxVariants: BlockVariant[] = [
    {
        id: 'info-classic-banner',
        label: 'Classic Banner',
        description: 'Current Baseline: Soft alert card with left info disc & navy text (100% same to same)',
        toHtml: variantClassicBanner,
    },
    {
        id: 'info-accent-pillar',
        label: 'Accent Pillar',
        description: 'Bold 4px vertical accent stripe callout with floating official notice badge',
        toHtml: variantAccentPillar,
    },
    {
        id: 'info-floating-capsule',
        label: 'Floating Capsule',
        description: 'Modern rounded green capsule with verified dispatch shield indicator',
        toHtml: variantFloatingCapsule,
    },
    {
        id: 'info-split-bullet-deck',
        label: 'Split Bullet Deck',
        description: 'High-impact dark alert ribbon with 3-column micro assurance checklist',
        toHtml: variantSplitBulletDeck,
    },
    {
        id: 'info-minimal-editorial',
        label: 'Minimal Editorial',
        description: 'Scandinavian luxury notice with top/bottom hairline borders and split column',
        toHtml: variantMinimalEditorial,
    },
    {
        id: 'info-dark-obsidian-alert',
        label: 'Dark Obsidian',
        description: 'Midnight high-contrast tech notice with electric cyan indicator badge',
        toHtml: variantDarkObsidianAlert,
    },
]

// Aliases for compatibility
export const infoboxVariants = infoBoxVariants

export function getInfoBoxVariant(variantId: string): BlockVariant {
    const found = infoBoxVariants.find(v => v.id === variantId)
    return found ?? infoBoxVariants[0]
}

// ─────────────────────────────────────────────────────────────────────────────
// Inspector Thumbnail Previews (SVG String Map)
// ─────────────────────────────────────────────────────────────────────────────

export const INFOBOX_THUMBNAILS: Record<string, string> = {
    'info-classic-banner': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect x="2" y="6" width="76" height="36" rx="4" fill="#ffffff" stroke="#ede9fe" stroke-width="1.2"/>
    <circle cx="12" cy="24" r="5" fill="#eff6ff"/>
    <circle cx="12" cy="21" r="1" fill="#3b82f6"/>
    <rect x="11.2" y="23" width="1.6" height="4" rx="0.8" fill="#3b82f6"/>
    <rect x="22" y="18" width="34" height="3.5" rx="1.5" fill="#1e40af"/>
    <rect x="22" y="25" width="50" height="2.5" rx="1" fill="#93c5fd"/>
    <rect x="22" y="30" width="38" height="2.5" rx="1" fill="#93c5fd"/>
  </svg>`,

    'info-accent-pillar': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect x="2" y="6" width="76" height="36" rx="3" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="2" y1="6" x2="2" y2="42" stroke="#2563eb" stroke-width="3"/>
    <rect x="10" y="14" width="22" height="4" rx="2" fill="#dbeafe"/>
    <rect x="35" y="14" width="32" height="4" rx="1.5" fill="#0f172a"/>
    <rect x="10" y="23" width="62" height="3" rx="1.5" fill="#64748b"/>
    <rect x="10" y="29" width="45" height="3" rx="1.5" fill="#64748b"/>
  </svg>`,

    'info-floating-capsule': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect x="2" y="6" width="76" height="36" rx="6" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1.2"/>
    <circle cx="14" cy="24" r="6" fill="#dcfce7" stroke="#86efac" stroke-width="0.8"/>
    <path d="M11 24l2 2 4-4" stroke="#16a34a" stroke-width="1.2" stroke-linecap="round"/>
    <rect x="25" y="18" width="35" height="3.5" rx="1.5" fill="#14532d"/>
    <rect x="25" y="25" width="48" height="2.5" rx="1" fill="#4ade80"/>
  </svg>`,

    'info-split-bullet-deck': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect x="2" y="6" width="76" height="36" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="2" y="6" width="76" height="10" fill="#1e293b"/>
    <rect x="8" y="10" width="30" height="2.5" rx="1" fill="#f8fafc"/>
    <rect x="6" y="21" width="68" height="2.5" rx="1" fill="#475569"/>
    <circle cx="10" cy="32" r="1.5" fill="#10b981"/>
    <rect x="13" y="31" width="12" height="2" rx="1" fill="#0f172a"/>
    <circle cx="34" cy="32" r="1.5" fill="#10b981"/>
    <rect x="37" y="31" width="12" height="2" rx="1" fill="#0f172a"/>
    <circle cx="58" cy="32" r="1.5" fill="#10b981"/>
    <rect x="61" y="31" width="12" height="2" rx="1" fill="#0f172a"/>
  </svg>`,

    'info-minimal-editorial': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect x="2" y="6" width="76" height="36" fill="#ffffff"/>
    <line x1="2" y1="6" x2="78" y2="6" stroke="#0f172a" stroke-width="2"/>
    <line x1="2" y1="42" x2="78" y2="42" stroke="#0f172a" stroke-width="2"/>
    <rect x="6" y="14" width="18" height="3" rx="1" fill="#64748b"/>
    <rect x="6" y="20" width="15" height="3" rx="1" fill="#0f172a"/>
    <line x1="28" y1="12" x2="28" y2="36" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="33" y="16" width="40" height="2.5" rx="1" fill="#334155"/>
    <rect x="33" y="22" width="30" height="2.5" rx="1" fill="#334155"/>
    <rect x="33" y="28" width="35" height="2" rx="1" fill="#059669"/>
  </svg>`,
}
