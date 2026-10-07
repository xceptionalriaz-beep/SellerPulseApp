// components/ui/VisualEditor/variants/key_features.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Key Features Grid — 10 Radically Distinct, High-Converting Retail Layouts
// Built specifically for high-converting eBay & e-commerce listings.
// Zero generic AI-slop, zero cheesy glassmorphism, zero fake neon glows.
// 100% authentic, tangible, battle-tested retail architectures that buyers trust.
//
// 1. feat-classic-cards-grid          — Current classic 2x2 / 4-card bordered grid (KEPT 100% IDENTICAL)
// 2. feat-tech-bento-flagship         — Modern asymmetrical Bento grid: 1 wide flagship hero card + 3 compact spec tiles
// 3. feat-industrial-spec-bars        — Heavy-duty horizontal spec strips with monospace parameters (Machinery/Auto/Tools)
// 4. feat-minimalist-hairline-editorial— Scandinavian luxury hairline divider layout with uppercase tracking & 01-04 numerals
// 5. feat-staggered-timeline-flow     — 4-step progressive benefit roadmap with vertical spine & index nodes
// 6. feat-split-hero-benefit-rail     — 35/65 Split rail: Left dark branded pledge column + Right stacked micro-feature cards
// 7. feat-cyber-dark-telemetry        — Stealth obsidian & cyan telemetry HUD for PC gaming, audio & electronic hardware
// 8. feat-circular-badge-quadrant     — 4-column round emblem badge showcase with centered copy (Beauty/Fitness/Lifestyle)
// 9. feat-accordion-style-ledger      — Clean stacked technical ledger with prominent status pills & category metadata
// 10. feat-compact-mobile-capsule-strip— Ultra-dense horizontal capsule pill strip optimized for 0-scroll mobile shoppers
// ─────────────────────────────────────────────────────────────────────────────

import { getIconSvg } from '../IconLibrary'

export interface BlockVariant {
  id: string
  label: string
  description: string
  thumbnail?: string
  toHtml: (props: any, id: string) => string
}

// ─── Shared Helpers & Dynamic Resolvers ─────────────────────────────────────

function pad(p: any, defaultT = 16, defaultR = 24, defaultB = 16, defaultL = 24): string {
  const top = p.paddingTop ?? defaultT
  const right = p.paddingRight ?? defaultR
  const bottom = p.paddingBottom ?? defaultB
  const left = p.paddingLeft ?? defaultL
  return `padding:${top}px ${right}px ${bottom}px ${left}px;`
}

function font(p: any, defaultFamily = 'Arial, Helvetica, sans-serif'): string {
  return p.fontFamily ? `${p.fontFamily}, Arial, sans-serif` : defaultFamily
}

export interface KeyFeatureItem {
  title: string
  description: string
  icon?: string
  badge?: string
  metric?: string
  highlight?: boolean
}

const DEFAULT_FEATURES: KeyFeatureItem[] = [
  {
    title: 'Aircraft-Grade Aluminum Housing',
    description: 'Precision CNC-machined from 6061-T6 alloy for maximum structural integrity and ultra-lightweight durability.',
    icon: 'shield',
    badge: 'MIL-SPEC',
    metric: '6061-T6 Alloy',
    highlight: true,
  },
  {
    title: 'Plug & Play Direct Fitment',
    description: 'Designed as a direct OEM bolt-on replacement. Installs in under 15 minutes with standard hand tools and zero wire splicing.',
    icon: 'check',
    badge: '100% BOLT-ON',
    metric: '15 Min Install',
  },
  {
    title: 'Advanced Thermal Heat Dissipation',
    description: 'Engineered finned heatsink channels airflow efficiently, reducing operating temperatures by up to 45% under continuous load.',
    icon: 'flame',
    badge: '-45°C COOLER',
    metric: '45% Thermal Cut',
  },
  {
    title: 'Weatherproof & Dust Sealed',
    description: 'IP67 waterproof rating with automotive-grade silicone gasket seals to withstand torrential rain, mud, and dust storms.',
    icon: 'droplet',
    badge: 'IP67 RATED',
    metric: 'Submersible 1M',
  },
]

function getFeatures(p: any): KeyFeatureItem[] {
  // If array provided in items, features, highlights, or keyFeatures
  const raw = p.features ?? p.items ?? p.highlights ?? p.keyFeatures ?? p.list

  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((item: any, idx: number) => {
      if (typeof item === 'string') {
        const parts = item.split(/[-–—:|]/)
        if (parts.length >= 2) {
          return {
            title: parts[0].trim(),
            description: parts.slice(1).join(' - ').trim(),
            badge: `0${idx + 1}`,
            metric: `SPEC ${idx + 1}`,
          }
        }
        return {
          title: item.trim(),
          description: 'Premium engineered specification designed for reliability and extended service life.',
          badge: `0${idx + 1}`,
          metric: `FEAT ${idx + 1}`,
        }
      }

      return {
        title: item.title ?? item.name ?? item.heading ?? `Feature 0${idx + 1}`,
        description: item.description ?? item.desc ?? item.detail ?? item.text ?? 'Built to strict manufacturer tolerances for seamless operation.',
        icon: item.icon ?? (idx === 0 ? 'shield' : idx === 1 ? 'check' : idx === 2 ? 'flame' : 'droplet'),
        badge: item.badge ?? item.tag ?? `0${idx + 1}`,
        metric: item.metric ?? item.spec ?? '',
        highlight: item.highlight ?? (idx === 0),
      }
    })
  }

  // Multiline string fallback
  if (typeof raw === 'string' && raw.trim().length > 0) {
    const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    if (lines.length > 0) {
      return lines.map((line, idx) => {
        const parts = line.split(/[-–—:|]/)
        if (parts.length >= 2) {
          return {
            title: parts[0].trim(),
            description: parts.slice(1).join(' - ').trim(),
            badge: `0${idx + 1}`,
            metric: `SPEC ${idx + 1}`,
          }
        }
        return {
          title: line.replace(/^[•\-\*✓\d\.]+\s*/, ''),
          description: 'Tested and certified for dependable performance in demanding operational environments.',
          badge: `0${idx + 1}`,
          metric: `FEAT ${idx + 1}`,
        }
      })
    }
  }

  return DEFAULT_FEATURES
}

function resolveBg(p: any, fallback = '#ffffff'): string {
  return p.bgColor ?? p.backgroundColor ?? fallback
}

function resolveText(p: any, fallback = '#0f172a'): string {
  return p.textColor ?? fallback
}

function resolveAccent(p: any, fallback = '#2563eb'): string {
  return p.accentColor ?? p.primaryColor ?? fallback
}

function resolveBorder(p: any, fallback = '#e2e8f0'): string {
  return p.borderColor ?? p.borderColour ?? fallback
}

function resolveHeading(p: any, fallback = 'Key Product Features'): string {
  return p.heading ?? p.title ?? p.sectionTitle ?? fallback
}

function resolveSubtitle(p: any, fallback = 'Engineered for uncompromising performance, durability, and seamless installation'): string {
  return p.subtitle ?? p.subheading ?? p.description ?? fallback
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLASSIC CARDS GRID (Current Style — Centered Vertical Stack on Mobile)
// Clean 2x2 / 4-card bordered grid with crisp icons, bold headers, and descriptive text
// ─────────────────────────────────────────────────────────────────────────────
function classicCardsGrid(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#0f172a')
  const borderCol = resolveBorder(p, '#e2e8f0')
  const accent = resolveAccent(p, '#2563eb')
  const descCol = p.descriptionColor ?? '#64748b'
  const cardBg = p.cardBg ?? '#f8fafc'
  const iconBg = p.iconBg ?? '#eff6ff'
  const iconBorderColor = p.iconBorderColor ?? '#bfdbfe'
  const eyebrow = p.eyebrowText ?? 'OFFICIAL SPECIFICATIONS'
  const heading = resolveHeading(p, 'Key Product Features')
  const subtitle = resolveSubtitle(p, 'Engineered for uncompromising performance, durability, and seamless installation')
  const items = getFeatures(p)

  const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .feat-classic-row-${id} { display:block !important; width:100% !important; }
  .feat-classic-col-${id} { display:block !important; width:100% !important; padding:4px 0 !important; }
  .feat-card-table-${id} { text-align:center !important; }
  .feat-card-inner-tr-${id} { display:block !important; width:100% !important; text-align:center !important; }
  .feat-icon-td-${id} { display:block !important; width:100% !important; padding:0 0 10px 0 !important; text-align:center !important; }
  .feat-icon-box-${id} { margin:0 auto !important; display:inline-block !important; }
  .feat-text-td-${id} { display:block !important; width:100% !important; text-align:center !important; padding:0 !important; }
}
</style>`

  // Render cards in pairs for 2-column email/eBay table stability
  const rows: string[] = []
  for (let i = 0; i < items.length; i += 2) {
    const left = items[i]
    const right = items[i + 1]

    rows.push(`
      <tr class="feat-classic-row-${id}">
        <td class="feat-classic-col-${id}" width="50%" valign="top" style="padding:6px;box-sizing:border-box;">
          <table class="feat-card-table-${id}" width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:${cardBg};border:1px solid ${borderCol};border-radius:0;padding:16px;height:100%;box-sizing:border-box;">
            <tr class="feat-card-inner-tr-${id}">
              <td class="feat-icon-td-${id}" valign="top" width="40" style="padding-right:12px;">
                <div data-feature-index="${i}" class="feat-icon-box-${id}" style="width:36px;height:36px;border-radius:0;background:${iconBg};border:1px solid ${iconBorderColor};text-align:center;line-height:36px;cursor:pointer;">
                  ${getIconSvg(left.icon || 'shield', accent, 18)}
                </div>
              </td>
              <td class="feat-text-td-${id}" valign="top">
                <div style="font-family:${f};font-size:14px;font-weight:700;color:${textCol};margin-bottom:6px;line-height:1.3;">
                  ${left.title}
                </div>
                <div style="font-family:${f};font-size:12px;color:${descCol};line-height:1.5;">
                  ${left.description}
                </div>
              </td>
            </tr>
          </table>
        </td>
        ${right ? `
        <td class="feat-classic-col-${id}" width="50%" valign="top" style="padding:6px;box-sizing:border-box;">
          <table class="feat-card-table-${id}" width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:${cardBg};border:1px solid ${borderCol};border-radius:0;padding:16px;height:100%;box-sizing:border-box;">
            <tr class="feat-card-inner-tr-${id}">
              <td class="feat-icon-td-${id}" valign="top" width="40" style="padding-right:12px;">
                <div data-feature-index="${i + 1}" class="feat-icon-box-${id}" style="width:36px;height:36px;border-radius:0;background:${iconBg};border:1px solid ${iconBorderColor};text-align:center;line-height:36px;cursor:pointer;">
                  ${getIconSvg(right.icon || 'check', accent, 18)}
                </div>
              </td>
              <td class="feat-text-td-${id}" valign="top">
                <div style="font-family:${f};font-size:14px;font-weight:700;color:${textCol};margin-bottom:6px;line-height:1.3;">
                  ${right.title}
                </div>
                <div style="font-family:${f};font-size:12px;color:${descCol};line-height:1.5;">
                  ${right.description}
                </div>
              </td>
            </tr>
          </table>
        </td>` : `<td width="50%" style="padding:6px;"></td>`}
      </tr>
    `)
  }

  return `<!--[riazify:key_features:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;max-width:100% !important;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 24, 20, 24)}box-sizing:border-box;">
      <!-- Header Section -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
        <tr>
          <td>
            <div style="display:inline-block;padding:3px 10px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:0;font-family:${f};font-size:10px;font-weight:800;letter-spacing:1px;color:${accent};text-transform:uppercase;margin-bottom:6px;">
              ${eyebrow}
            </div>
            <div style="font-family:${f};font-size:20px;font-weight:800;color:${textCol};letter-spacing:-0.3px;margin-bottom:4px;">
              ${heading}
            </div>
            <div style="font-family:${f};font-size:12px;color:${descCol};line-height:1.4;">
              ${subtitle}
            </div>
          </td>
        </tr>
      </table>

      <!-- 2x2 Grid -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 -6px;">
        ${rows.join('')}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TECH BENTO FLAGSHIP (Asymmetrical Modern Bento Grid)
// 1 large flagship hero card (full width or 60%) + 3 compact technical spec tiles
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// 2. TECH BENTO FLAGSHIP (Asymmetrical Modern Bento Grid — Responsive Mobile)
// 1 large flagship hero card (full width or 60%) + 3 compact technical spec tiles
// ─────────────────────────────────────────────────────────────────────────────
function techBentoFlagship(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#0f172a')
  const borderCol = resolveBorder(p, '#cbd5e1')
  const accent = resolveAccent(p, '#0284c7')
  const descCol = p.descriptionColor ?? '#64748b'
  const eyebrow = p.eyebrowText ?? 'BENTO ARCHITECTURE • CORE ATTRIBUTES'
  const heading = resolveHeading(p, 'Engineered Advantages')
  const items = getFeatures(p)
  const hero = items[0]
  const rest = items.slice(1, 4)

  const mobileStyle = `<style>
@media only screen and (max-width:680px) {
  .bento-hero-row-${id} { display:block !important; width:100% !important; }
  .bento-hero-left-${id} { display:block !important; width:100% !important; text-align:center !important; }
  .bento-hero-left-${id} .bento-badge,
  .bento-hero-left-${id} .bento-desc { margin-left:auto !important; margin-right:auto !important; text-align:center !important; }
  .bento-hero-right-${id} { display:block !important; width:100% !important; text-align:center !important; margin-top:14px !important; }
  .bento-hero-right-${id} > div { margin:0 auto !important; display:inline-block !important; }
  .bento-tile-${id} { display:block !important; width:100% !important; padding:4px 0 !important; }
}
</style>`

  const restTilesHtml = rest.map((item, idx) => `
    <td width="33.33%" valign="top" class="bento-tile-${id}" style="padding:5px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:#f8fafc;border:1px solid ${borderCol};border-radius:0;padding:14px;box-sizing:border-box;">
        <tr>
          <td>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="font-family:${f};font-size:9px;font-weight:900;color:#64748b;letter-spacing:1px;background:#e2e8f0;padding:2px 7px;border-radius:0;text-transform:uppercase;">
                ${item.badge || `SPEC 0${idx + 2}`}
              </span>
              ${item.metric ? `<span style="font-family:${f};font-size:10px;font-weight:800;color:${accent};">${item.metric}</span>` : ''}
            </div>
            <div style="font-family:${f};font-size:13px;font-weight:800;color:${textCol};margin-bottom:4px;line-height:1.3;">
              ${item.title}
            </div>
            <div style="font-family:${f};font-size:11px;color:${descCol};line-height:1.4;">
              ${item.description}
            </div>
          </td>
        </tr>
      </table>
    </td>
  `).join('')

  return `<!--[riazify:key_features:${id}]-->
${mobileStyle}
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;max-width:100% !important;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 24, 20, 24)}box-sizing:border-box;">
      <!-- Bento Header -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
        <tr>
          <td>
            <div style="font-family:${f};font-size:11px;font-weight:800;letter-spacing:1.5px;color:${accent};text-transform:uppercase;">
              ${eyebrow}
            </div>
            <div style="font-family:${f};font-size:22px;font-weight:900;color:${textCol};letter-spacing:-0.5px;">
              ${heading}
            </div>
          </td>
        </tr>
      </table>

      <!-- Flagship Hero Card (Full Width Bento Tier 1) -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);border-radius:0;border:1px solid #334155;margin-bottom:10px;box-sizing:border-box;">
        <tr>
          <td style="padding:20px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr class="bento-hero-row-${id}">
                <td valign="top" class="bento-hero-left-${id}">
                  <div class="bento-badge" style="display:inline-block;padding:3px 8px;background:rgba(2,132,199,0.25);border:1px solid ${accent};border-radius:0;font-family:${f};font-size:10px;font-weight:800;color:#38bdf8;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">
                    ★ PRIMARY FLAGSHIP ADVANTAGE
                  </div>
                  <div style="font-family:${f};font-size:18px;font-weight:800;color:#ffffff;line-height:1.3;margin-bottom:6px;">
                    ${hero.title}
                  </div>
                  <div class="bento-desc" style="font-family:${f};font-size:13px;color:#94a3b8;line-height:1.5;max-width:520px;">
                    ${hero.description}
                  </div>
                </td>
                <td width="110" align="right" valign="middle" class="bento-hero-right-${id}">
                  <div style="background:#1e293b;border:1px solid #475569;border-radius:0;padding:10px 14px;text-align:center;">
                    <div style="font-family:${f};font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:1px;">METRIC</div>
                    <div style="font-family:${f};font-size:14px;font-weight:900;color:#38bdf8;">${hero.metric || 'GRADE A+'}</div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Bottom Tier: 3 Bento Sub-Tiles -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 -5px;">
        <tr>
          ${restTilesHtml}
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. INDUSTRIAL SPEC BARS (Machinery, Tools & eBay Motors)
// Heavy-duty horizontal spec strips with monospace parameters & bold category tags
// ─────────────────────────────────────────────────────────────────────────────
function industrialSpecBars(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#0f172a')
  const borderCol = resolveBorder(p, '#0f172a')
  const accent = resolveAccent(p, '#d97706') // Amber/industrial caution accent
  const descCol = p.descriptionColor ?? '#475569'
  const cardBg = p.cardBg ?? '#f8fafc'
  const eyebrow = p.eyebrowText ?? 'INDUSTRIAL RATED • BENCHMARK TOLERANCES'
  const heading = resolveHeading(p, 'Heavy-Duty Engineering Specifications')
  const items = getFeatures(p)

  const rowsHtml = items.map((item, idx) => `
    <tr>
      <td style="padding:10px 14px;background:${idx % 2 === 0 ? cardBg : '#ffffff'};border:1px solid #cbd5e1;border-bottom:2px solid #94a3b8;box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="36" valign="middle" align="center">
              <span style="display:inline-block;width:24px;height:24px;background:#0f172a;color:#ffffff;font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:900;line-height:24px;text-align:center;border-radius:0;">
                0${idx + 1}
              </span>
            </td>
            <td valign="middle" style="padding-left:12px;">
              <div style="font-family:${f};font-size:14px;font-weight:800;color:${textCol};line-height:1.2;">
                ${item.title}
              </div>
              <div style="font-family:${f};font-size:12px;color:${descCol};margin-top:2px;line-height:1.4;">
                ${item.description}
              </div>
            </td>
            <td width="140" align="right" valign="middle">
              <span style="display:inline-block;padding:4px 8px;background:#fef3c7;border:1px solid #fde68a;border-radius:0;font-family:'Courier New',Courier,monospace;font-size:10px;font-weight:800;color:#92400e;text-transform:uppercase;">
                [ ${item.metric || 'FACTORY VERIFIED'} ]
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td height="5"></td></tr>
  `).join('')

  return `<!--[riazify:key_features:${id}]-->
<table border-radius:width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;max-width:100% !important;0;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 24, 20, 24)}box-sizing:border-box;">
      <!-- Industrial Hazard Stripe Header -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:#0f172a;border-left:5px solid ${accent};border-radius:0;margin-bottom:12px;box-sizing:border-box;">
        <tr>
          <td style="padding:14px 18px;">
            <div style="font-family:'Courier New',Courier,monospace;font-size:10px;font-weight:800;letter-spacing:2px;color:#fbbf24;text-transform:uppercase;">
              ${eyebrow}
            </div>
            <div style="font-family:${f};font-size:18px;font-weight:900;color:#ffffff;letter-spacing:-0.2px;margin-top:2px;">
              ${heading}
            </div>
          </td>
        </tr>
      </table>

      <!-- Stacked Industrial Bars -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${rowsHtml}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. MINIMALIST HAIRLINE EDITORIAL (Scandinavian Luxury & Fashion / Jewelry)
// Ultra-delicate 1px borders, generous whitespace, uppercase tracking & 01-04 numerals
// ─────────────────────────────────────────────────────────────────────────────
function minimalistHairlineEditorial(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#1e293b')
  const borderCol = resolveBorder(p, '#e2e8f0')
  const accent = resolveAccent(p, '#475569')
  const descCol = p.descriptionColor ?? '#64748b'
  const eyebrow = p.eyebrowText ?? 'CURATED EXCELLENCE'
  const heading = resolveHeading(p, 'Distinctive Features')
  const items = getFeatures(p)

  const itemsHtml = items.map((item, idx) => `
    <td width="50%" valign="top" style="padding:16px 18px;border-bottom:1px solid ${borderCol};${idx % 2 === 0 ? `border-right:1px solid ${borderCol};` : ''}box-sizing:border-box;">
      <div style="font-family:${f};font-size:10px;font-weight:700;letter-spacing:2.5px;color:#94a3b8;margin-bottom:8px;text-transform:uppercase;">
        PART 0${idx + 1}
      </div>
      <div style="font-family:${f};font-size:14px;font-weight:700;color:${textCol};letter-spacing:-0.2px;margin-bottom:6px;line-height:1.3;">
        ${item.title}
      </div>
      <div style="font-family:${f};font-size:12px;color:${descCol};line-height:1.6;font-weight:400;">
        ${item.description}
      </div>
    </td>
  `)

  // Group into pairs of 2
  const pairedRows: string[] = []
  for (let i = 0; i < itemsHtml.length; i += 2) {
    pairedRows.push(`
      <tr>
        ${itemsHtml[i]}
        ${itemsHtml[i + 1] || '<td width="50%" style="border-bottom:1px solid #e2e8f0;"></td>'}
      </tr>
    `)
  }

  return `<!--[riazify:key_features:${id}]-->
<table border-radius:width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;max-width:100% !important;0;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 20, 24, 24, 24)}box-sizing:border-box;">
      <!-- Editorial Title -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;border-bottom:2px solid #0f172a;padding-bottom:12px;">
        <tr>
          <td>
            <div style="font-family:${f};font-size:9px;font-weight:800;letter-spacing:3px;color:#64748b;text-transform:uppercase;margin-bottom:4px;">
              ${eyebrow}
            </div>
            <div style="font-family:${f};font-size:22px;font-weight:800;color:#0f172a;letter-spacing:0.5px;text-transform:uppercase;">
              ${heading}
            </div>
          </td>
          <td align="right" valign="bottom">
            <span style="font-family:${f};font-size:10px;font-weight:600;letter-spacing:1px;color:#94a3b8;text-transform:uppercase;">
              INDEX 01—0${items.length}
            </span>
          </td>
        </tr>
      </table>

      <!-- 2-Column Hairline Grid -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${borderCol};">
        ${pairedRows.join('')}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. STAGGERED TIMELINE FLOW (Roadmap / Installation / Benefit Chain)
// 4-step progressive workflow with vertical spine & index nodes
// ─────────────────────────────────────────────────────────────────────────────
function staggeredTimelineFlow(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#0f172a')
  const borderCol = resolveBorder(p, '#e2e8f0')
  const accent = resolveAccent(p, '#4f46e5')
  const descCol = p.descriptionColor ?? '#64748b'
  const cardBg = p.cardBg ?? '#f8fafc'
  const eyebrow = p.eyebrowText ?? 'TIMELINE ARCHITECTURE'
  const heading = resolveHeading(p, 'Step-by-Step Advantage & Workflow')
  const items = getFeatures(p)

  const stepsHtml = items.map((item, idx) => {
    const isLast = idx === items.length - 1
    return `
      <tr>
        <!-- Timeline Marker Column -->
        <td width="44" valign="top" align="center" style="padding-right:12px;">
          <div style="width:30px;height:30px;border-radius:0;background:${idx === 0 ? accent : '#f1f5f9'};border:2px solid ${idx === 0 ? accent : '#cbd5e1'};color:${idx === 0 ? '#ffffff' : '#475569'};font-family:${f};font-size:12px;font-weight:900;line-height:26px;text-align:center;">
            ${idx + 1}
          </div>
          ${!isLast ? `<div style="width:2px;height:42px;background:#cbd5e1;margin:4px auto 0 auto;"></div>` : ''}
        </td>
        <!-- Step Content Card -->
        <td valign="top" style="padding-bottom:${isLast ? '0' : '16px'};">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:${cardBg};border:1px solid ${borderCol};border-left:3px solid ${idx === 0 ? accent : '#94a3b8'};border-radius:0;padding:12px 16px;">
            <tr>
              <td>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
                  <span style="font-family:${f};font-size:13px;font-weight:800;color:${textCol};">
                    ${item.title}
                  </span>
                  ${item.badge ? `<span style="font-family:${f};font-size:9px;font-weight:800;color:${accent};background:#eef2ff;padding:2px 6px;border-radius:0;text-transform:uppercase;">${item.badge}</span>` : ''}
                </div>
                <div style="font-family:${f};font-size:12px;color:${descCol};line-height:1.45;">
                  ${item.description}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `
  }).join('')

  return `<!--[riazify:key_features:${id}]-->
<table border-radius:width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;max-width:100% !important;0;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 24, 20, 24)}box-sizing:border-box;">
      <!-- Timeline Header -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
        <tr>
          <td>
            <div style="font-family:${f};font-size:10px;font-weight:800;letter-spacing:1px;color:${accent};text-transform:uppercase;">
              ${eyebrow}
            </div>
            <div style="font-family:${f};font-size:20px;font-weight:900;color:${textCol};">
              ${heading}
            </div>
          </td>
        </tr>
      </table>

      <!-- Vertical Timeline -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${stepsHtml}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. SPLIT HERO BENEFIT RAIL (35/65 Asymmetric Split)
// Left dark branded pledge column + Right stacked micro-feature benefit cards
// ─────────────────────────────────────────────────────────────────────────────
function splitHeroBenefitRail(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#0f172a')
  const borderCol = resolveBorder(p, '#e2e8f0')
  const accent = resolveAccent(p, '#059669') // Emerald green trust
  const descCol = p.descriptionColor ?? '#64748b'
  const eyebrow = p.eyebrowText ?? 'SELLER PLEDGE'
  const pledgeText = p.pledgeText ?? 'Every unit undergoes strict quality benchmarking before packaging to ensure zero defects and exact fitment.'
  const guaranteeTitle = p.guaranteeTitle ?? '100% MONEY-BACK BACKED'
  const guaranteeSubtitle = p.guaranteeSubtitle ?? 'Direct eBay Buyer Protection'
  const heading = resolveHeading(p, 'Performance Guaranteed')
  const items = getFeatures(p)

  const rightCardsHtml = items.map((item, idx) => `
    <tr>
      <td style="padding-bottom:8px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="background:#ffffff;border:1px solid ${borderCol};border-radius:0;padding:10px 14px;box-sizing:border-box;">
          <tr>
            <td width="28" valign="top">
              <div data-feature-index="${idx}" style="display:inline-block;width:22px;height:22px;border-radius:0;background:#ecfdf5;border:1px solid #a7f3d0;text-align:center;line-height:20px;cursor:pointer;vertical-align:middle;box-sizing:border-box;">
                ${getIconSvg(item.icon || 'check', '#059669', 13)}
              </div>
            </td>
            <td valign="top" style="padding-left:8px;">
              <div style="font-family:${f};font-size:13px;font-weight:700;color:${textCol};">
                ${item.title}
              </div>
              <div style="font-family:${f};font-size:11px;color:${descCol};line-height:1.4;margin-top:2px;">
                ${item.description}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('')

  return `<!--[riazify:key_features:${id}]-->
<table border-radius:width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;max-width:100% !important;0;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 24, 20, 24)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:#f8fafc;border:1px solid ${borderCol};border-radius:0;overflow:hidden;">
        <tr>
          <!-- Left 35% Branded Spine Column -->
          <td width="35%" valign="top" style="background:#0f172a;padding:24px 20px;box-sizing:border-box;">
            <div style="display:inline-block;padding:3px 8px;background:rgba(5,150,105,0.25);border:1px solid ${accent};border-radius:0;font-family:${f};font-size:9px;font-weight:800;color:#34d399;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">
              ${eyebrow}
            </div>
            <div style="font-family:${f};font-size:18px;font-weight:800;color:#ffffff;line-height:1.3;margin-bottom:8px;">
              ${heading}
            </div>
            <div style="font-family:${f};font-size:12px;color:#94a3b8;line-height:1.5;margin-bottom:16px;">
              ${pledgeText}
            </div>
            <div style="background:#1e293b;border:1px solid #334155;border-radius:0;padding:10px;text-align:center;">
              <div style="font-family:${f};font-size:10px;font-weight:800;color:#34d399;text-transform:uppercase;">
                ${guaranteeTitle}
              </div>
              <div style="font-family:${f};font-size:10px;color:#94a3b8;margin-top:2px;">
                ${guaranteeSubtitle}
              </div>
            </div>
          </td>

          <!-- Right 65% Stacked Cards -->
          <td width="65%" valign="top" style="padding:16px;box-sizing:border-box;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${rightCardsHtml}
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. CYBER DARK TELEMETRY (Gaming Peripherals, PC Hardware & High-Tech)
// Stealth obsidian & cyan telemetry HUD with hardware framing & monospaced stats
// ─────────────────────────────────────────────────────────────────────────────
function cyberDarkTelemetry(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#090d16')
  const borderCol = resolveBorder(p, '#1e293b')
  const accent = resolveAccent(p, '#06b6d4') // Cyan HUD
  const descCol = p.descriptionColor ?? '#94a3b8'
  const cardBg = p.cardBg ?? '#0f172a'
  const heading = resolveHeading(p, 'Hardware Architecture & Telemetry')
  const eyebrow = p.eyebrowText ?? 'SYSTEM BENCHMARK // HARDWARE AUDIT'
  const items = getFeatures(p)

  const tilesHtml = items.map((item, idx) => `
    <td width="50%" valign="top" style="padding:6px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:${cardBg};border:1px solid ${borderCol};border-top:2px solid ${idx === 0 ? accent : '#334155'};border-radius:0;padding:14px;box-sizing:border-box;">
        <tr>
          <td>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <span style="font-family:'Courier New',Courier,monospace;font-size:9px;font-weight:800;color:${accent};letter-spacing:1px;">
                [NODE // 0${idx + 1}]
              </span>
              <span style="font-family:'Courier New',Courier,monospace;font-size:9px;color:#64748b;">
                ${item.metric || 'SYNC_OK'}
              </span>
            </div>
            <div style="font-family:${f};font-size:13px;font-weight:800;color:#f8fafc;margin-bottom:4px;line-height:1.3;">
              ${item.title}
            </div>
            <div style="font-family:${f};font-size:11px;color:${descCol};line-height:1.45;">
              ${item.description}
            </div>
          </td>
        </tr>
      </table>
    </td>
  `)

  const pairedRows: string[] = []
  for (let i = 0; i < tilesHtml.length; i += 2) {
    pairedRows.push(`
      <tr>
        ${tilesHtml[i]}
        ${tilesHtml[i + 1] || '<td width="50%" style="padding:6px;"></td>'}
      </tr>
    `)
  }

  return `<!--[riazify:key_features:${id}]-->
<table border-radius:width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;max-width:100% !important;0;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 24, 20, 24)}box-sizing:border-box;">
      <!-- Cyber HUD Header -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;border-bottom:1px solid ${borderCol};padding-bottom:10px;">
        <tr>
          <td>
            <div style="font-family:'Courier New',Courier,monospace;font-size:10px;font-weight:800;color:${accent};letter-spacing:2px;text-transform:uppercase;">
              ${eyebrow}
            </div>
            <div style="font-family:${f};font-size:19px;font-weight:900;color:#ffffff;letter-spacing:-0.3px;margin-top:2px;">
              ${heading}
            </div>
          </td>
          <td align="right" valign="middle">
            <span style="display:inline-block;padding:3px 8px;background:rgba(6,182,212,0.15);border:1px solid ${accent};border-radius:0;font-family:'Courier New',Courier,monospace;font-size:10px;font-weight:800;color:${accent};">
              STATUS: PASS 100%
            </span>
          </td>
        </tr>
      </table>

      <!-- 2x2 Dark HUD Matrix -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 -6px;">
        ${pairedRows.join('')}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. CIRCULAR BADGE QUADRANT (Health, Beauty, Fitness & Sporting Goods)
// 4-column round emblem badge showcase with centered copy & vibrant iconography
// ─────────────────────────────────────────────────────────────────────────────
function circularBadgeQuadrant(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#0f172a')
  const borderCol = resolveBorder(p, '#e2e8f0')
  const accent = resolveAccent(p, '#7c3aed') // Vibrant violet
  const descCol = p.descriptionColor ?? '#64748b'
  const iconBg = p.iconBg ?? '#f5f3ff'
  const iconBorderColor = p.iconBorderColor ?? '#ddd6fe'
  const eyebrow = p.eyebrowText ?? 'CERTIFIED HIGHLIGHTS'
  const heading = resolveHeading(p, 'Key Highlights & Benefits')
  const items = getFeatures(p).slice(0, 4)

  const columnsHtml = items.map((item, idx) => `
    <td width="25%" valign="top" align="center" style="padding:8px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding-bottom:10px;">
            <div data-feature-index="${idx}" style="width:48px;height:48px;border-radius:0;background:${iconBg};border:2px solid ${iconBorderColor};text-align:center;line-height:48px;cursor:pointer;">
              ${getIconSvg(item.icon || 'shield', accent, 22)}
            </div>
          </td>
        </tr>
        <tr>
          <td align="center">
            <div style="font-family:${f};font-size:13px;font-weight:800;color:${textCol};margin-bottom:4px;line-height:1.2;">
              ${item.title}
            </div>
            <div style="font-family:${f};font-size:11px;color:${descCol};line-height:1.4;">
              ${item.description}
            </div>
          </td>
        </tr>
      </table>
    </td>
  `).join('')

  return `<!--[riazify:key_features:${id}]-->
<table border-radius:width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;max-width:100% !important;0;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 24, 20, 24)}box-sizing:border-box;">
      <!-- Centered Section Header -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
        <tr>
          <td align="center">
            <div style="font-family:${f};font-size:10px;font-weight:800;letter-spacing:1.5px;color:${accent};text-transform:uppercase;margin-bottom:4px;">
              ${eyebrow}
            </div>
            <div style="font-family:${f};font-size:20px;font-weight:900;color:${textCol};">
              ${heading}
            </div>
          </td>
        </tr>
      </table>

      <!-- 4-Column Circular Emblem Row -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:#faf5ff;border:1px solid #ede9fe;border-radius:0;padding:12px 6px;">
        <tr>
          ${columnsHtml}
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. ACCORDION STYLE LEDGER (Structured Technical Category Ledger)
// Clean stacked expandable-look ledger bars with prominent status pills & metadata
// ─────────────────────────────────────────────────────────────────────────────
function accordionStyleLedger(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#0f172a')
  const borderCol = resolveBorder(p, '#e2e8f0')
  const accent = resolveAccent(p, '#ea580c') // Burnt orange
  const descCol = p.descriptionColor ?? '#475569'
  const cardBg = p.cardBg ?? '#f8fafc'
  const eyebrow = p.eyebrowText ?? 'STRUCTURED SPECIFICATIONS'
  const heading = resolveHeading(p, 'Comprehensive Technical Ledger')
  const items = getFeatures(p)

  const barsHtml = items.map((item, idx) => `
    <tr>
      <td style="padding-bottom:6px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="background:#ffffff;border:1px solid ${borderCol};border-radius:0;overflow:hidden;box-sizing:border-box;">
          <tr style="background:${cardBg};border-bottom:1px solid ${borderCol};">
            <td style="padding:10px 14px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="30" valign="middle">
                    <span style="font-family:${f};font-size:12px;font-weight:900;color:${accent};">
                      #0${idx + 1}
                    </span>
                  </td>
                  <td valign="middle">
                    <span style="font-family:${f};font-size:13px;font-weight:800;color:${textCol};">
                      ${item.title}
                    </span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display:inline-block;padding:2px 8px;background:#fff7ed;border:1px solid #ffedd5;border-radius:0;font-family:${f};font-size:10px;font-weight:700;color:${accent};text-transform:uppercase;">
                      ${item.badge || 'VERIFIED'}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 14px 12px 14px;background:#ffffff;">
              <div style="font-family:${f};font-size:12px;color:${descCol};line-height:1.5;">
                ${item.description}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('')

  return `<!--[riazify:key_features:${id}]-->
<table border-radius:width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;max-width:100% !important;0;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 24, 20, 24)}box-sizing:border-box;">
      <!-- Ledger Header -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
        <tr>
          <td>
            <div style="font-family:${f};font-size:10px;font-weight:800;letter-spacing:1px;color:${accent};text-transform:uppercase;">
              ${eyebrow}
            </div>
            <div style="font-family:${f};font-size:20px;font-weight:900;color:${textCol};">
              ${heading}
            </div>
          </td>
        </tr>
      </table>

      <!-- Stacked Ledger Bars -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${barsHtml}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. COMPACT MOBILE CAPSULE STRIP (High-Density Mobile Thumb-Browsing)
// Ultra-dense horizontal capsule pill strip optimized for 0-scroll mobile shoppers
// ─────────────────────────────────────────────────────────────────────────────
function compactMobileCapsuleStrip(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#0f172a')
  const borderCol = resolveBorder(p, '#cbd5e1')
  const accent = resolveAccent(p, '#2563eb')
  const descCol = p.descriptionColor ?? '#64748b'
  const cardBg = p.cardBg ?? '#f1f5f9'
  const eyebrow = p.eyebrowText ?? 'RAPID OVERVIEW • 0-SCROLL READY'
  const heading = resolveHeading(p, 'Quick-Scan Feature Index')
  const items = getFeatures(p)

  const chipsHtml = items.map((item, idx) => `
    <td width="50%" valign="top" style="padding:4px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:${cardBg};border:1px solid ${borderCol};border-radius:0;padding:6px 12px;box-sizing:border-box;">
        <tr>
          <td width="20" valign="middle">
            <div data-feature-index="${idx}" style="display:inline-block;cursor:pointer;line-height:1;vertical-align:middle;">
              ${getIconSvg(item.icon || 'check', accent, 13)}
            </div>
          </td>
          <td valign="middle">
            <div style="font-family:${f};font-size:11px;font-weight:800;color:${textCol};line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${item.title}
            </div>
            <div style="font-family:${f};font-size:9.5px;color:${descCol};line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${item.metric || item.badge || 'OEM Standard'}
            </div>
          </td>
        </tr>
      </table>
    </td>
  `)

  const pairedChips: string[] = []
  for (let i = 0; i < chipsHtml.length; i += 2) {
    pairedChips.push(`
      <tr>
        ${chipsHtml[i]}
        ${chipsHtml[i + 1] || '<td width="50%" style="padding:4px;"></td>'}
      </tr>
    `)
  }

  return `<!--[riazify:key_features:${id}]-->
<table border-radius:width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;max-width:100% !important;0;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 12, 18, 14, 18)}box-sizing:border-box;">
      <!-- Mobile Micro Header -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
        <tr>
          <td>
            <div style="font-family:${f};font-size:10px;font-weight:800;color:${accent};letter-spacing:1px;text-transform:uppercase;">
              ${eyebrow}
            </div>
            <div style="font-family:${f};font-size:16px;font-weight:900;color:${textCol};">
              ${heading}
            </div>
          </td>
        </tr>
      </table>

      <!-- 2-Column Capsule Pills -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 -4px;">
        ${pairedChips.join('')}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// Accurate SVG Thumbnails (80x48 pixel-perfect representations of each layout)
// ─────────────────────────────────────────────────────────────────────────────

export const KEY_FEATURES_THUMBNAILS: Record<string, string> = {
  // 1. Classic 2x2 Grid (4 clean boxes)
  'feat-classic-cards-grid': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="8" y1="8" x2="36" y2="8" stroke="#2563eb" stroke-width="1.8"/>
    <!-- 2x2 grid -->
    <rect x="8" y="14" width="30" height="13" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <circle cx="13" cy="20.5" r="3" fill="#eff6ff" stroke="#3b82f6" stroke-width="0.8"/>
    <line x1="18" y1="18.5" x2="34" y2="18.5" stroke="#0f172a" stroke-width="1"/>
    <line x1="18" y1="22.5" x2="30" y2="22.5" stroke="#94a3b8" stroke-width="0.8"/>

    <rect x="42" y="14" width="30" height="13" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <circle cx="47" cy="20.5" r="3" fill="#eff6ff" stroke="#3b82f6" stroke-width="0.8"/>
    <line x1="52" y1="18.5" x2="68" y2="18.5" stroke="#0f172a" stroke-width="1"/>
    <line x1="52" y1="22.5" x2="64" y2="22.5" stroke="#94a3b8" stroke-width="0.8"/>

    <rect x="8" y="30" width="30" height="13" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <circle cx="13" cy="36.5" r="3" fill="#eff6ff" stroke="#3b82f6" stroke-width="0.8"/>
    <line x1="18" y1="34.5" x2="34" y2="34.5" stroke="#0f172a" stroke-width="1"/>
    <line x1="18" y1="38.5" x2="30" y2="38.5" stroke="#94a3b8" stroke-width="0.8"/>

    <rect x="42" y="30" width="30" height="13" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <circle cx="47" cy="36.5" r="3" fill="#eff6ff" stroke="#3b82f6" stroke-width="0.8"/>
    <line x1="52" y1="34.5" x2="68" y2="34.5" stroke="#0f172a" stroke-width="1"/>
    <line x1="52" y1="38.5" x2="64" y2="38.5" stroke="#94a3b8" stroke-width="0.8"/>
  </svg>`,

  // 2. Tech Bento Flagship (1 large dark hero + 3 small tiles)
  'feat-tech-bento-flagship': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <!-- Top Hero Bento Card -->
    <rect x="6" y="6" width="68" height="20" rx="3" fill="#0f172a"/>
    <line x1="11" y1="12" x2="38" y2="12" stroke="#38bdf8" stroke-width="1.5"/>
    <line x1="11" y1="17" x2="52" y2="17" stroke="#94a3b8" stroke-width="1"/>
    <rect x="58" y="10" width="12" height="10" rx="2" fill="#1e293b" stroke="#38bdf8" stroke-width="0.6"/>
    <!-- 3 Bottom Bento Tiles -->
    <rect x="6" y="29" width="21" height="13" rx="2" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.8"/>
    <line x1="9" y1="34" x2="23" y2="34" stroke="#0f172a" stroke-width="1"/>
    <rect x="29" y="29" width="22" height="13" rx="2" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.8"/>
    <line x1="32" y1="34" x2="47" y2="34" stroke="#0f172a" stroke-width="1"/>
    <rect x="53" y="29" width="21" height="13" rx="2" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.8"/>
    <line x1="56" y1="34" x2="70" y2="34" stroke="#0f172a" stroke-width="1"/>
  </svg>`,

  // 3. Industrial Spec Bars (Dark caution header + 3 stacked bars)
  'feat-industrial-spec-bars': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <!-- Industrial Header -->
    <rect x="5" y="5" width="70" height="10" rx="1.5" fill="#0f172a"/>
    <rect x="5" y="5" width="3" height="10" fill="#d97706"/>
    <line x1="12" y1="10" x2="40" y2="10" stroke="#fcd34d" stroke-width="1.2"/>
    <!-- Stacked Bars -->
    <rect x="5" y="18" width="70" height="7" rx="1" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.6"/>
    <rect x="7" y="20" width="4" height="3" fill="#0f172a"/>
    <line x1="14" y1="21.5" x2="42" y2="21.5" stroke="#0f172a" stroke-width="1"/>
    <rect x="55" y="19" width="17" height="5" rx="1" fill="#fef3c7"/>

    <rect x="5" y="28" width="70" height="7" rx="1" fill="#ffffff" stroke="#94a3b8" stroke-width="0.6"/>
    <rect x="7" y="30" width="4" height="3" fill="#0f172a"/>
    <line x1="14" y1="31.5" x2="40" y2="31.5" stroke="#0f172a" stroke-width="1"/>
    <rect x="55" y="29" width="17" height="5" rx="1" fill="#fef3c7"/>

    <rect x="5" y="37" width="70" height="7" rx="1" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.6"/>
    <rect x="7" y="39" width="4" height="3" fill="#0f172a"/>
    <line x1="14" y1="40.5" x2="44" y2="40.5" stroke="#0f172a" stroke-width="1"/>
    <rect x="55" y="38" width="17" height="5" rx="1" fill="#fef3c7"/>
  </svg>`,

  // 4. Minimalist Hairline Editorial (1px grid, generous tracking)
  'feat-minimalist-hairline-editorial': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <!-- Editorial rule header -->
    <line x1="8" y1="8" x2="72" y2="8" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="8" y1="12" x2="35" y2="12" stroke="#64748b" stroke-width="0.8"/>
    <!-- Hairline dividers -->
    <line x1="8" y1="28" x2="72" y2="28" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="40" y1="16" x2="40" y2="42" stroke="#e2e8f0" stroke-width="0.8"/>
    <!-- 01, 02 text markers -->
    <line x1="10" y1="19" x2="16" y2="19" stroke="#94a3b8" stroke-width="0.8"/>
    <line x1="10" y1="22.5" x2="32" y2="22.5" stroke="#0f172a" stroke-width="1"/>
    <line x1="43" y1="19" x2="49" y2="19" stroke="#94a3b8" stroke-width="0.8"/>
    <line x1="43" y1="22.5" x2="65" y2="22.5" stroke="#0f172a" stroke-width="1"/>
    <!-- 03, 04 text markers -->
    <line x1="10" y1="32" x2="16" y2="32" stroke="#94a3b8" stroke-width="0.8"/>
    <line x1="10" y1="35.5" x2="32" y2="35.5" stroke="#0f172a" stroke-width="1"/>
    <line x1="43" y1="32" x2="49" y2="32" stroke="#94a3b8" stroke-width="0.8"/>
    <line x1="43" y1="35.5" x2="65" y2="35.5" stroke="#0f172a" stroke-width="1"/>
  </svg>`,

  // 5. Staggered Timeline Flow (Vertical line + 3 nodes)
  'feat-staggered-timeline-flow': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <!-- Vertical Spine -->
    <line x1="14" y1="10" x2="14" y2="38" stroke="#cbd5e1" stroke-width="1.2"/>
    <!-- Node 1 -->
    <circle cx="14" cy="12" r="3.5" fill="#4f46e5"/>
    <rect x="22" y="8" width="50" height="8" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.6"/>
    <line x1="26" y1="12" x2="55" y2="12" stroke="#0f172a" stroke-width="1"/>
    <!-- Node 2 -->
    <circle cx="14" cy="24" r="3" fill="#ffffff" stroke="#4f46e5" stroke-width="1.2"/>
    <rect x="22" y="20" width="50" height="8" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.6"/>
    <line x1="26" y1="24" x2="52" y2="24" stroke="#0f172a" stroke-width="1"/>
    <!-- Node 3 -->
    <circle cx="14" cy="36" r="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="22" y="32" width="50" height="8" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.6"/>
    <line x1="26" y1="36" x2="48" y2="36" stroke="#0f172a" stroke-width="1"/>
  </svg>`,

  // 6. Split Hero Benefit Rail (Left dark pillar 35% + Right cards)
  'feat-split-hero-benefit-rail': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="5" y="5" width="70" height="38" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <!-- Left dark pillar -->
    <path d="M5 8a3 3 0 0 1 3-3h18v38H8a3 3 0 0 1-3-3V8z" fill="#0f172a"/>
    <rect x="9" y="10" width="12" height="3" rx="1" fill="#059669"/>
    <line x1="9" y1="17" x2="21" y2="17" stroke="#ffffff" stroke-width="1.2"/>
    <line x1="9" y1="21" x2="19" y2="21" stroke="#94a3b8" stroke-width="0.8"/>
    <!-- Right stacked cards -->
    <rect x="30" y="8" width="42" height="9" rx="1.5" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.6"/>
    <circle cx="34" cy="12.5" r="2" fill="#ecfdf5"/>
    <line x1="38" y1="12.5" x2="66" y2="12.5" stroke="#0f172a" stroke-width="1"/>

    <rect x="30" y="19" width="42" height="9" rx="1.5" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.6"/>
    <circle cx="34" cy="23.5" r="2" fill="#ecfdf5"/>
    <line x1="38" y1="23.5" x2="62" y2="23.5" stroke="#0f172a" stroke-width="1"/>

    <rect x="30" y="30" width="42" height="9" rx="1.5" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.6"/>
    <circle cx="34" cy="34.5" r="2" fill="#ecfdf5"/>
    <line x1="38" y1="34.5" x2="65" y2="34.5" stroke="#0f172a" stroke-width="1"/>
  </svg>`,

  // 7. Cyber Dark Telemetry (Obsidian + cyan matrix)
  'feat-cyber-dark-telemetry': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#090d16" stroke="#1e293b" stroke-width="1"/>
    <!-- Top cyan bar -->
    <line x1="8" y1="8" x2="42" y2="8" stroke="#06b6d4" stroke-width="1.5"/>
    <rect x="62" y="6" width="10" height="4" rx="1" fill="#0e7490"/>
    <!-- 2x2 matrix -->
    <rect x="8" y="15" width="30" height="12" rx="1.5" fill="#0f172a" stroke="#1e293b" stroke-width="0.8"/>
    <line x1="8" y1="15" x2="22" y2="15" stroke="#06b6d4" stroke-width="1.2"/>
    <line x1="12" y1="20" x2="32" y2="20" stroke="#f8fafc" stroke-width="1"/>

    <rect x="42" y="15" width="30" height="12" rx="1.5" fill="#0f172a" stroke="#1e293b" stroke-width="0.8"/>
    <line x1="46" y1="20" x2="66" y2="20" stroke="#f8fafc" stroke-width="1"/>

    <rect x="8" y="30" width="30" height="12" rx="1.5" fill="#0f172a" stroke="#1e293b" stroke-width="0.8"/>
    <line x1="12" y1="35" x2="32" y2="35" stroke="#f8fafc" stroke-width="1"/>

    <rect x="42" y="30" width="30" height="12" rx="1.5" fill="#0f172a" stroke="#1e293b" stroke-width="0.8"/>
    <line x1="46" y1="35" x2="66" y2="35" stroke="#f8fafc" stroke-width="1"/>
  </svg>`,

  // 8. Circular Badge Quadrant (4 round emblems)
  'feat-circular-badge-quadrant': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="8" width="68" height="32" rx="3" fill="#faf5ff" stroke="#ede9fe" stroke-width="0.8"/>
    <!-- 4 circles -->
    <circle cx="15" cy="20" r="5" fill="#f5f3ff" stroke="#7c3aed" stroke-width="1"/>
    <line x1="11" y1="29" x2="19" y2="29" stroke="#0f172a" stroke-width="1"/>
    <line x1="11" y1="33" x2="19" y2="33" stroke="#94a3b8" stroke-width="0.8"/>

    <circle cx="32" cy="20" r="5" fill="#f5f3ff" stroke="#7c3aed" stroke-width="1"/>
    <line x1="28" y1="29" x2="36" y2="29" stroke="#0f172a" stroke-width="1"/>
    <line x1="28" y1="33" x2="36" y2="33" stroke="#94a3b8" stroke-width="0.8"/>

    <circle cx="49" cy="20" r="5" fill="#f5f3ff" stroke="#7c3aed" stroke-width="1"/>
    <line x1="45" y1="29" x2="53" y2="29" stroke="#0f172a" stroke-width="1"/>
    <line x1="45" y1="33" x2="53" y2="33" stroke="#94a3b8" stroke-width="0.8"/>

    <circle cx="66" cy="20" r="5" fill="#f5f3ff" stroke="#7c3aed" stroke-width="1"/>
    <line x1="62" y1="29" x2="70" y2="29" stroke="#0f172a" stroke-width="1"/>
    <line x1="62" y1="33" x2="70" y2="33" stroke="#94a3b8" stroke-width="0.8"/>
  </svg>`,

  // 9. Accordion Style Ledger (Stacked bars with category badges)
  'feat-accordion-style-ledger': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="8" y1="8" x2="35" y2="8" stroke="#ea580c" stroke-width="1.8"/>
    <!-- Stacked Ledgers -->
    <rect x="7" y="13" width="66" height="9" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.6"/>
    <line x1="11" y1="17.5" x2="15" y2="17.5" stroke="#ea580c" stroke-width="1.2"/>
    <line x1="18" y1="17.5" x2="48" y2="17.5" stroke="#0f172a" stroke-width="1"/>
    <rect x="56" y="15" width="14" height="5" rx="1" fill="#fff7ed"/>

    <rect x="7" y="24" width="66" height="9" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.6"/>
    <line x1="11" y1="28.5" x2="15" y2="28.5" stroke="#ea580c" stroke-width="1.2"/>
    <line x1="18" y1="28.5" x2="45" y2="28.5" stroke="#0f172a" stroke-width="1"/>
    <rect x="56" y="26" width="14" height="5" rx="1" fill="#fff7ed"/>

    <rect x="7" y="35" width="66" height="9" rx="1.5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.6"/>
    <line x1="11" y1="39.5" x2="15" y2="39.5" stroke="#ea580c" stroke-width="1.2"/>
    <line x1="18" y1="39.5" x2="50" y2="39.5" stroke="#0f172a" stroke-width="1"/>
    <rect x="56" y="37" width="14" height="5" rx="1" fill="#fff7ed"/>
  </svg>`,

  // 10. Compact Mobile Capsule Strip (2-column pill capsules)
  'feat-compact-mobile-capsule-strip': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <!-- Mobile Capsule Header -->
    <line x1="8" y1="8" x2="38" y2="8" stroke="#2563eb" stroke-width="1.5"/>
    <!-- 2-Column Capsule Pills -->
    <rect x="6" y="14" width="32" height="8" rx="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.6"/>
    <circle cx="10" cy="18" r="1.5" fill="#2563eb"/>
    <line x1="14" y1="18" x2="32" y2="18" stroke="#0f172a" stroke-width="1"/>

    <rect x="42" y="14" width="32" height="8" rx="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.6"/>
    <circle cx="46" cy="18" r="1.5" fill="#2563eb"/>
    <line x1="50" y1="18" x2="68" y2="18" stroke="#0f172a" stroke-width="1"/>

    <rect x="6" y="24" width="32" height="8" rx="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.6"/>
    <circle cx="10" cy="28" r="1.5" fill="#2563eb"/>
    <line x1="14" y1="28" x2="30" y2="28" stroke="#0f172a" stroke-width="1"/>

    <rect x="42" y="24" width="32" height="8" rx="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.6"/>
    <circle cx="46" cy="28" r="1.5" fill="#2563eb"/>
    <line x1="50" y1="28" x2="66" y2="28" stroke="#0f172a" stroke-width="1"/>

    <rect x="6" y="34" width="32" height="8" rx="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.6"/>
    <circle cx="10" cy="38" r="1.5" fill="#2563eb"/>
    <line x1="14" y1="38" x2="31" y2="38" stroke="#0f172a" stroke-width="1"/>

    <rect x="42" y="34" width="32" height="8" rx="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.6"/>
    <circle cx="46" cy="38" r="1.5" fill="#2563eb"/>
    <line x1="50" y1="38" x2="67" y2="38" stroke="#0f172a" stroke-width="1"/>
  </svg>`,
}

export function getKeyFeaturesThumbnailSvg(id: string): string {
  const clean = id
    .toLowerCase()
    .trim()
    .replace(/^feat[-_]/, '')
    .replace(/_/g, '-')

  const key = Object.keys(KEY_FEATURES_THUMBNAILS).find(k => {
    const kClean = k.toLowerCase().replace(/^feat[-_]/, '').replace(/_/g, '-')
    return k === id || kClean === clean || k.endsWith(clean) || clean.includes(kClean)
  })

  return key ? KEY_FEATURES_THUMBNAILS[key] : KEY_FEATURES_THUMBNAILS['feat-classic-cards-grid']
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported Variant Registry (All 10 Radically Distinct Architectures)
// ─────────────────────────────────────────────────────────────────────────────

export const keyFeaturesVariants: BlockVariant[] = [
  {
    id: 'feat-classic-cards-grid',
    label: 'Classic 2x2 Feature Grid',
    description: 'Current classic 4-card bordered grid with crisp icons & descriptive text (KEPT 100% IDENTICAL)',
    thumbnail: KEY_FEATURES_THUMBNAILS['feat-classic-cards-grid'],
    toHtml(props, id) { return classicCardsGrid(props, id) },
  },
  {
    id: 'feat-tech-bento-flagship',
    label: 'Bento Flagship Architecture',
    description: 'Asymmetrical modern bento grid: 1 wide flagship hero card + 3 compact spec tiles',
    thumbnail: KEY_FEATURES_THUMBNAILS['feat-tech-bento-flagship'],
    toHtml(props, id) { return techBentoFlagship(props, id) },
  },
  {
    id: 'feat-industrial-spec-bars',
    label: 'Industrial Heavy-Duty Bars',
    description: 'Rugged horizontal spec strips with monospace parameters for tools, parts & machinery',
    thumbnail: KEY_FEATURES_THUMBNAILS['feat-industrial-spec-bars'],
    toHtml(props, id) { return industrialSpecBars(props, id) },
  },
  {
    id: 'feat-minimalist-hairline-editorial',
    label: 'Minimalist Hairline Editorial',
    description: 'Delicate 1px border dividers, generous whitespace & 01-04 numerals for luxury & apparel',
    thumbnail: KEY_FEATURES_THUMBNAILS['feat-minimalist-hairline-editorial'],
    toHtml(props, id) { return minimalistHairlineEditorial(props, id) },
  },
  {
    id: 'feat-staggered-timeline-flow',
    label: 'Step-by-Step Workflow Spine',
    description: '4-step progressive benefit roadmap with connecting vertical spine & circular nodes',
    thumbnail: KEY_FEATURES_THUMBNAILS['feat-staggered-timeline-flow'],
    toHtml(props, id) { return staggeredTimelineFlow(props, id) },
  },
  {
    id: 'feat-split-hero-benefit-rail',
    label: '35/65 Split Guarantee Rail',
    description: 'Left dark branded pledge column + right stacked micro-feature benefit cards',
    thumbnail: KEY_FEATURES_THUMBNAILS['feat-split-hero-benefit-rail'],
    toHtml(props, id) { return splitHeroBenefitRail(props, id) },
  },
  {
    id: 'feat-cyber-dark-telemetry',
    label: 'Obsidian Cyan Cyber HUD',
    description: 'Stealth dark telemetry differential matrix for gaming peripherals & PC hardware',
    thumbnail: KEY_FEATURES_THUMBNAILS['feat-cyber-dark-telemetry'],
    toHtml(props, id) { return cyberDarkTelemetry(props, id) },
  },
  {
    id: 'feat-circular-badge-quadrant',
    label: 'Circular Emblem Quadrant',
    description: '4-column round emblem badge showcase with centered copy for fitness & lifestyle',
    thumbnail: KEY_FEATURES_THUMBNAILS['feat-circular-badge-quadrant'],
    toHtml(props, id) { return circularBadgeQuadrant(props, id) },
  },
  {
    id: 'feat-accordion-style-ledger',
    label: 'Stacked Technical Ledger',
    description: 'Clean stacked expandable-look ledger bars with prominent status pills & metadata',
    thumbnail: KEY_FEATURES_THUMBNAILS['feat-accordion-style-ledger'],
    toHtml(props, id) { return accordionStyleLedger(props, id) },
  },
  {
    id: 'feat-compact-mobile-capsule-strip',
    label: 'Mobile Capsule Pill Strip',
    description: 'Ultra-dense horizontal capsule pill strip taking minimal vertical screen height on phones',
    thumbnail: KEY_FEATURES_THUMBNAILS['feat-compact-mobile-capsule-strip'],
    toHtml(props, id) { return compactMobileCapsuleStrip(props, id) },
  },
]

// Backwards-compatible aliases
export const featuresGridVariants = keyFeaturesVariants
export const keyFeaturesGridVariants = keyFeaturesVariants
export const featuresVariants = keyFeaturesVariants

/**
 * Robust Variant Resolver:
 * Supports variant IDs with or without the 'feat-' prefix
 * and matches shorthand IDs seamlessly.
 */
export function getKeyFeaturesVariant(id: string): BlockVariant {
  if (!id) return keyFeaturesVariants[0]
  const clean = id
    .toLowerCase()
    .trim()
    .replace(/^feat[-_]/, '')
    .replace(/_/g, '-')

  const found = keyFeaturesVariants.find(v => {
    const vClean = v.id.toLowerCase().replace(/^feat[-_]/, '').replace(/_/g, '-')
    return v.id === id || vClean === clean || v.id.endsWith(clean) || clean.includes(vClean)
  })

  return found ?? keyFeaturesVariants[0]
}

export const getFeaturesGridVariant = getKeyFeaturesVariant
export const getKeyFeaturesGridVariant = getKeyFeaturesVariant
