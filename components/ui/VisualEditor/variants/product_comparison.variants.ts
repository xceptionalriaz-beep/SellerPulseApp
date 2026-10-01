// components/ui/VisualEditor/variants/product_comparison.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Product Comparison — 10 Radically Distinct, High-Converting Retail Layouts
// Built specifically for high-converting eBay & e-commerce listings.
// Zero generic AI-slop, zero cheesy glassmorphism, zero fake neon glows.
// 100% authentic, tangible, battle-tested retail architectures that buyers trust.
//
// 1. comp-classic-header-table       — Current classic 3-column table (KEPT 100% IDENTICAL)
// 2. comp-spotlight-winner-column    — Elevated "Our Product" flagship column with winner badge
// 3. comp-versus-head-to-head-cards  — Dual-card "VS" battle cards (Authentic vs Cheap Clones)
// 4. comp-horizontal-metric-bars     — Visual percentage / performance scorebars for tools & tech
// 5. comp-technical-spec-matrix      — Pro engineering multi-point benchmark matrix
// 6. comp-good-better-best-tiers     — 3-Tier lineup comparison (Standard vs Pro vs Ultra)
// 7. comp-minimalist-hairline-editorial— Scandinavian luxury editorial hairline comparison
// 8. comp-dark-terminal-matrix       — Obsidian & cyan cyber telemetry HUD for gaming & PC tech
// 9. comp-cross-reference-checklist  — Bold green shield check vs red cross contrast ledger
// 10. comp-compact-mobile-split-pills— High-density mobile comparison pill strip for 0-scroll phones
// ─────────────────────────────────────────────────────────────────────────────

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

export interface ComparisonRow {
    feature: string
    ourValue: string
    competitorValue: string
    highlight?: boolean
}

const DEFAULT_ROWS: ComparisonRow[] = [
    { feature: 'Quality', ourValue: '★★★★★', competitorValue: '★★★', highlight: true },
    { feature: 'Warranty', ourValue: '2 Years', competitorValue: '6 Months', highlight: true },
    { feature: 'UK Stock', ourValue: '✓ Yes', competitorValue: 'X No', highlight: true },
    { feature: 'Returns', ourValue: '30 Days', competitorValue: '14 Days', highlight: true },
]

function getComparisonRows(p: any): ComparisonRow[] {
    // If array of 3-element arrays: [['Feature', 'Our Product', 'Competitor'], ['Quality', '★★★★★', '★★★'], ...]
    if (Array.isArray(p.rows) && p.rows.length > 0) {
        const list: ComparisonRow[] = []
        p.rows.forEach((r: any, idx: number) => {
            if (Array.isArray(r)) {
                // Skip header row if it matches "Feature"
                if (idx === 0 && (r[0]?.toLowerCase().includes('feature') || r[1]?.toLowerCase().includes('our'))) {
                    return
                }
                list.push({
                    feature: r[0] ?? `Feature ${idx}`,
                    ourValue: r[1] ?? '✓ Included',
                    competitorValue: r[2] ?? '✕ Not Included',
                    highlight: true,
                })
            } else if (typeof r === 'object' && r !== null) {
                list.push({
                    feature: r.feature ?? r.key ?? r.title ?? `Feature ${idx + 1}`,
                    ourValue: r.ourValue ?? r.ours ?? r.ourProduct ?? r.value ?? '✓ Included',
                    competitorValue: r.competitorValue ?? r.theirs ?? r.competitor ?? '✕ None',
                    highlight: r.highlight !== false,
                })
            }
        })
        if (list.length > 0) return list
    }

    // If text lines with pipe delimiter: "Quality | ★★★★★ | ★★★"
    if (typeof p.content === 'string' && p.content.includes('|')) {
        const lines = p.content.split('\n').filter((l: string) => l.includes('|'))
        const list: ComparisonRow[] = []
        lines.forEach((line: string, idx: number) => {
            const parts = line.split('|').map((s: string) => s.trim())
            if (idx === 0 && parts[0]?.toLowerCase().includes('feature')) return
            if (parts.length >= 2) {
                list.push({
                    feature: parts[0],
                    ourValue: parts[1],
                    competitorValue: parts[2] ?? '✕',
                    highlight: true,
                })
            }
        })
        if (list.length > 0) return list
    }

    return DEFAULT_ROWS
}

function resolveBg(p: any, fallback = '#ffffff'): string {
    return p.bgColor ?? p.backgroundColor ?? fallback
}

function resolveText(p: any, fallback = '#1e1535'): string {
    return p.textColor ?? fallback
}

function resolveAccent(p: any, fallback = '#7530fb'): string {
    return p.accentColor ?? p.ourColor ?? fallback
}

function resolveHeaderBg(p: any, fallback = '#7530fb'): string {
    return p.headerBg ?? p.headerBackground ?? fallback
}

function resolveHeaderText(p: any, fallback = '#ffffff'): string {
    return p.headerText ?? p.headerTextColor ?? fallback
}

function resolveAltRowBg(p: any, fallback = '#f8f7ff'): string {
    return p.altRowBg ?? p.rowAltBg ?? fallback
}

function resolveBorder(p: any, fallback = '#ede9fe'): string {
    return p.borderColor ?? p.borderColour ?? fallback
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLASSIC HEADER TABLE (CURRENT STYLE — 100% KEPT IDENTICAL)
// Purple header with 3 columns, clean alternating rows matching user's canvas
// ─────────────────────────────────────────────────────────────────────────────
function classicHeaderTable(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#ffffff')
    const headerBg = resolveHeaderBg(p, '#7530fb')
    const headerText = resolveHeaderText(p, '#ffffff')
    const altBg = resolveAltRowBg(p, '#f8f7ff')
    const borderCol = resolveBorder(p, '#ede9fe')
    const accent = resolveAccent(p, '#7530fb')
    const rows = getComparisonRows(p)

    const rowsHtml = rows.map((r, i) => {
        const isAlt = i % 2 === 1
        const rowBg = isAlt ? altBg : '#ffffff'

        return `
      <tr style="background-color:${rowBg};">
        <td style="padding:11px 16px;font-family:${f};font-size:13px;font-weight:600;color:#1e1535;border:1px solid ${borderCol};width:34%;">
          ${r.feature}
        </td>
        <td align="center" style="padding:11px 16px;font-family:${f};font-size:13px;font-weight:800;color:${accent};border:1px solid ${borderCol};width:33%;">
          ${r.ourValue}
        </td>
        <td align="center" style="padding:11px 16px;font-family:${f};font-size:13px;color:#9ca3af;border:1px solid ${borderCol};width:33%;">
          ${r.competitorValue}
        </td>
      </tr>`
    }).join('')

    return `<!--[riazify:product_comparison:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 24, 16, 24)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="border:1px solid ${borderCol};border-radius:6px;border-collapse:collapse;overflow:hidden;background-color:#ffffff;">
        <tr style="background-color:${headerBg};">
          <th align="left" style="padding:12px 16px;font-family:${f};font-size:13px;font-weight:800;color:${headerText};border:1px solid ${headerBg};width:34%;">
            Feature
          </th>
          <th align="center" style="padding:12px 16px;font-family:${f};font-size:13px;font-weight:900;color:${headerText};border:1px solid ${headerBg};width:33%;">
            Our Product
          </th>
          <th align="center" style="padding:12px 16px;font-family:${f};font-size:13px;font-weight:700;color:${headerText};border:1px solid ${headerBg};width:33%;">
            Competitor
          </th>
        </tr>
        ${rowsHtml}
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:product_comparison:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SPOTLIGHT WINNER COLUMN
// "Our Product" column is physically elevated with winner ribbon & contrast border
// ─────────────────────────────────────────────────────────────────────────────
function spotlightWinnerColumn(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#ffffff')
    const royalBlue = resolveAccent(p, '#2563eb')
    const emerald = '#16a34a'
    const rows = getComparisonRows(p)

    const rowsHtml = rows.map((r, i) => {
        const isAlt = i % 2 === 1
        const baseBg = isAlt ? '#f8fafc' : '#ffffff'

        return `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:12px 16px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#0f172a;background-color:${baseBg};">
          ${r.feature}
        </td>
        <td align="center" style="padding:12px 16px;font-family:Arial,sans-serif;font-size:14px;font-weight:900;color:${emerald};background-color:#f0fdf4;border-left:2px solid ${emerald};border-right:2px solid ${emerald};">
          ${r.ourValue}
        </td>
        <td align="center" style="padding:12px 16px;font-family:Arial,sans-serif;font-size:13px;font-weight:500;color:#94a3b8;background-color:${baseBg};">
          ${r.competitorValue}
        </td>
      </tr>`
    }).join('')

    return `<!--[riazify:product_comparison:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="border:1.5px solid #cbd5e1;border-radius:10px;border-collapse:separate;overflow:hidden;background-color:#ffffff;box-shadow:0 4px 14px rgba(0,0,0,0.04);">
        <!-- Column Header Titles -->
        <tr>
          <th width="36%" align="left" style="padding:16px;background-color:#0f172a;color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;">
            CRITICAL CRITERIA
          </th>
          <th width="34%" align="center" style="padding:16px 12px;background-color:${emerald};color:#ffffff;font-family:Arial,sans-serif;border-left:2px solid ${emerald};border-right:2px solid ${emerald};">
            <div style="display:inline-block;padding:3px 8px;background-color:#ffffff;border-radius:12px;font-size:10px;font-weight:900;color:${emerald};letter-spacing:0.8px;text-transform:uppercase;margin-bottom:4px;">
              ★ OFFICIAL SELLER
            </div>
            <div style="font-size:16px;font-weight:900;letter-spacing:0.3px;">
              OUR PRODUCT
            </div>
          </th>
          <th width="30%" align="center" style="padding:16px;background-color:#1e293b;color:#94a3b8;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;">
            OTHER SELLERS
          </th>
        </tr>
        ${rowsHtml}
        <!-- Bottom Reassurance Strip -->
        <tr style="background-color:#eff6ff;">
          <td colspan="3" style="padding:12px 18px;border-top:1.5px solid #bfdbfe;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#1e40af;text-align:center;">
            🛡️ Invest with confidence: Tested before packaging &bull; Zero compromises &bull; Direct warranty support
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:product_comparison:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DUAL-CARD "VS" BOXING MATCH CARDS
// Side-by-side cards with central "VS" medallion badge (Authentic vs Cheap Clones)
// ─────────────────────────────────────────────────────────────────────────────
function versusHeadToHeadCards(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#ffffff')
    const emerald = '#16a34a'
    const rows = getComparisonRows(p)

    const ourPointsHtml = rows.map(r => `
    <div style="padding:7px 10px;background-color:#ffffff;border:1px solid #bbf7d0;border-radius:6px;margin-bottom:6px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="20" style="color:${emerald};font-size:14px;font-weight:900;">✓</td>
          <td style="font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:#0f172a;">${r.feature}:</td>
          <td align="right" style="font-family:Arial,sans-serif;font-size:12px;font-weight:900;color:${emerald};">${r.ourValue}</td>
        </tr>
      </table>
    </div>`).join('')

    const compPointsHtml = rows.map(r => `
    <div style="padding:7px 10px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:6px;margin-bottom:6px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="20" style="color:#ef4444;font-size:14px;font-weight:900;">✕</td>
          <td style="font-family:Arial,sans-serif;font-size:12px;font-weight:600;color:#64748b;">${r.feature}:</td>
          <td align="right" style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#94a3b8;">${r.competitorValue}</td>
        </tr>
      </table>
    </div>`).join('')

    return `<!--[riazify:product_comparison:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Left Card: Our Premium Item -->
          <td width="48%" valign="top" style="padding:16px;background-color:#f0fdf4;border:2px solid #86efac;border-radius:10px;box-sizing:border-box;">
            <div style="display:inline-block;padding:3px 8px;background-color:#16a34a;border-radius:12px;font-family:Arial,sans-serif;font-size:10px;font-weight:900;color:#ffffff;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:6px;">
              ✓ PREMIUM GRADE
            </div>
            <div style="font-family:Arial,sans-serif;font-size:16px;font-weight:900;color:#0f172a;margin-bottom:12px;">
              Our Authentic Product
            </div>
            ${ourPointsHtml}
          </td>

          <!-- Center VS Separator -->
          <td width="4%" align="center" valign="middle">
            <div style="width:28px;height:28px;background-color:#0f172a;border-radius:50%;text-align:center;line-height:28px;color:#ffffff;font-family:Arial,sans-serif;font-size:11px;font-weight:900;margin:0 auto;">
              VS
            </div>
          </td>

          <!-- Right Card: Generic Competitors -->
          <td width="48%" valign="top" style="padding:16px;background-color:#f8fafc;border:1.5px solid #cbd5e1;border-radius:10px;box-sizing:border-box;">
            <div style="display:inline-block;padding:3px 8px;background-color:#94a3b8;border-radius:12px;font-family:Arial,sans-serif;font-size:10px;font-weight:800;color:#ffffff;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:6px;">
              ✕ CHEAP CLONES
            </div>
            <div style="font-family:Arial,sans-serif;font-size:16px;font-weight:800;color:#64748b;margin-bottom:12px;">
              Generic Knockoffs
            </div>
            ${compPointsHtml}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:product_comparison:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. VISUAL HORIZONTAL METRIC SCOREBARS
// Visual performance scorebars (e.g. Build, Longevity, Tolerance) for tools & tech
// ─────────────────────────────────────────────────────────────────────────────
function horizontalMetricBars(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#ffffff')
    const accent = resolveAccent(p, '#2563eb')
    const rows = getComparisonRows(p)

    const barsHtml = rows.map((r, i) => {
        // Generate high vs low percentages for visual bars
        const ourPct = 95 - (i * 3)
        const compPct = 40 + (i * 5)

        return `
      <div style="margin-bottom:12px;padding:12px 14px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:6px;">
          <tr>
            <td style="font-family:Arial,sans-serif;font-size:13px;font-weight:800;color:#0f172a;">
              ${r.feature}
            </td>
            <td align="right" style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;">
              <span style="color:${accent};font-weight:900;">Our Spec: ${r.ourValue}</span>
              <span style="color:#94a3b8;margin-left:12px;">Other: ${r.competitorValue}</span>
            </td>
          </tr>
        </table>
        <!-- Our Progress Bar -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:4px;">
          <tr>
            <td width="90" style="font-family:Arial,sans-serif;font-size:10px;font-weight:800;color:${accent};">OURS:</td>
            <td>
              <div style="width:100%;height:8px;background-color:#e2e8f0;border-radius:4px;overflow:hidden;">
                <div style="width:${ourPct}%;height:8px;background-color:${accent};border-radius:4px;"></div>
              </div>
            </td>
          </tr>
        </table>
        <!-- Competitor Progress Bar -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="90" style="font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#94a3b8;">OTHERS:</td>
            <td>
              <div style="width:100%;height:8px;background-color:#e2e8f0;border-radius:4px;overflow:hidden;">
                <div style="width:${compPct}%;height:8px;background-color:#cbd5e1;border-radius:4px;"></div>
              </div>
            </td>
          </tr>
        </table>
      </div>`
    }).join('')

    return `<!--[riazify:product_comparison:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <div style="margin-bottom:12px;">
        <span style="display:inline-block;padding:3px 9px;background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;font-family:Arial,sans-serif;font-size:10px;font-weight:800;color:${accent};letter-spacing:0.8px;text-transform:uppercase;">
          BENCHMARK PERFORMANCE
        </span>
        <div style="font-family:Arial,sans-serif;font-size:17px;font-weight:900;color:#0f172a;margin-top:4px;">
          Direct Engineering Comparison
        </div>
      </div>
      ${barsHtml}
    </td>
  </tr>
</table>
<!--[/riazify:product_comparison:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PRO TECHNICAL AUDIT MATRIX
// Clean engineering matrix with status chips and laboratory certification badge
// ─────────────────────────────────────────────────────────────────────────────
function technicalSpecMatrix(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#ffffff')
    const darkNavy = '#0f172a'
    const rows = getComparisonRows(p)

    const rowsHtml = rows.map((r, i) => {
        const isAlt = i % 2 === 1
        const rowBg = isAlt ? '#f8fafc' : '#ffffff'

        return `
      <tr style="background-color:${rowBg};border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;font-weight:800;color:#0f172a;">
          ${r.feature}
        </td>
        <td align="center" style="padding:10px 14px;">
          <span style="display:inline-block;padding:3px 10px;background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:4px;font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:#059669;">
            ✓ ${r.ourValue}
          </span>
        </td>
        <td align="center" style="padding:10px 14px;">
          <span style="display:inline-block;padding:3px 10px;background-color:#f1f5f9;border:1px solid #cbd5e1;border-radius:4px;font-family:Arial,sans-serif;font-size:11px;font-weight:600;color:#64748b;">
            ${r.competitorValue}
          </span>
        </td>
      </tr>`
    }).join('')

    return `<!--[riazify:product_comparison:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="border:1.5px solid #cbd5e1;border-radius:8px;border-collapse:separate;overflow:hidden;background-color:#ffffff;box-shadow:0 3px 10px rgba(0,0,0,0.03);">
        <tr style="background-color:${darkNavy};">
          <th align="left" style="padding:14px;font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:#ffffff;text-transform:uppercase;letter-spacing:0.5px;">BENCHMARK SPECIFICATION</th>
          <th align="center" style="padding:14px;font-family:Arial,sans-serif;font-size:12px;font-weight:900;color:#38bdf8;text-transform:uppercase;letter-spacing:0.5px;">OUR CERTIFIED BUILD</th>
          <th align="center" style="padding:14px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">STANDARD MARKET SPEC</th>
        </tr>
        ${rowsHtml}
        <tr style="background-color:#f8fafc;">
          <td colspan="3" style="padding:10px 16px;border-top:1px solid #e2e8f0;font-family:Arial,sans-serif;font-size:11px;color:#64748b;text-align:right;">
            Certified laboratory testing &bull; Tolerances verified &plusmn;0.05%
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:product_comparison:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. 3-TIER GOOD / BETTER / BEST PRODUCT LINEUP
// Multi-tier product comparison for variation listings (Standard vs Pro vs Ultra)
// ─────────────────────────────────────────────────────────────────────────────
function goodBetterBestTiers(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#ffffff')
    const rows = getComparisonRows(p)

    const rowsHtml = rows.map((r, i) => {
        const isAlt = i % 2 === 1
        const baseBg = isAlt ? '#f8fafc' : '#ffffff'

        return `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 12px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#0f172a;background-color:${baseBg};">
          ${r.feature}
        </td>
        <td align="center" style="padding:10px 12px;font-family:Arial,sans-serif;font-size:12px;color:#64748b;background-color:${baseBg};">
          ${r.competitorValue}
        </td>
        <td align="center" style="padding:10px 12px;font-family:Arial,sans-serif;font-size:13px;font-weight:900;color:#1e40af;background-color:#eff6ff;border-left:1px solid #bfdbfe;border-right:1px solid #bfdbfe;">
          ${r.ourValue}
        </td>
        <td align="center" style="padding:10px 12px;font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:#16a34a;background-color:${baseBg};">
          ✓ Enhanced
        </td>
      </tr>`
    }).join('')

    return `<!--[riazify:product_comparison:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="border:1.5px solid #cbd5e1;border-radius:8px;border-collapse:separate;overflow:hidden;background-color:#ffffff;">
        <tr style="background-color:#0f172a;">
          <th width="28%" align="left" style="padding:12px;color:#ffffff;font-family:Arial,sans-serif;font-size:11px;font-weight:800;">FEATURES</th>
          <th width="24%" align="center" style="padding:12px;color:#94a3b8;font-family:Arial,sans-serif;font-size:11px;font-weight:700;">BASIC TIER</th>
          <th width="24%" align="center" style="padding:12px;background-color:#2563eb;color:#ffffff;font-family:Arial,sans-serif;font-size:11px;font-weight:900;">★ OUR PRO (BEST)</th>
          <th width="24%" align="center" style="padding:12px;color:#a7f3d0;font-family:Arial,sans-serif;font-size:11px;font-weight:800;">ULTRA LINEUP</th>
        </tr>
        ${rowsHtml}
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:product_comparison:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. SCANDINAVIAN MINIMALIST HAIRLINE EDITORIAL
// Wide letter-spaced uppercase typography with delicate 1px hairlines for designer goods
// ─────────────────────────────────────────────────────────────────────────────
function minimalistHairlineEditorial(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#ffffff')
    const rows = getComparisonRows(p)

    const rowsHtml = rows.map(r => `
    <tr style="border-bottom:1px solid #e4e4e7;">
      <td style="padding:12px 6px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#18181b;letter-spacing:0.5px;">
        ${r.feature}
      </td>
      <td align="center" style="padding:12px 6px;font-family:Arial,sans-serif;font-size:13px;font-weight:800;color:#18181b;">
        ● ${r.ourValue}
      </td>
      <td align="center" style="padding:12px 6px;font-family:Arial,sans-serif;font-size:12px;color:#a1a1aa;">
        ○ ${r.competitorValue}
      </td>
    </tr>`).join('')

    return `<!--[riazify:product_comparison:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 20, 24, 20, 24)}box-sizing:border-box;">
      <div style="font-family:Arial,sans-serif;font-size:10px;font-weight:800;letter-spacing:2px;color:#71717a;text-transform:uppercase;margin-bottom:4px;">
        Curated Selection
      </div>
      <div style="font-family:Arial,sans-serif;font-size:18px;font-weight:900;color:#18181b;letter-spacing:0.5px;padding-bottom:12px;border-bottom:2px solid #18181b;margin-bottom:6px;">
        Specification Comparison
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr style="border-bottom:1.5px solid #18181b;">
          <th align="left" style="padding:8px 6px;font-family:Arial,sans-serif;font-size:10px;font-weight:800;letter-spacing:1.5px;color:#71717a;text-transform:uppercase;">ATTRIBUTE</th>
          <th align="center" style="padding:8px 6px;font-family:Arial,sans-serif;font-size:10px;font-weight:900;letter-spacing:1.5px;color:#18181b;text-transform:uppercase;">THE ATELIER</th>
          <th align="center" style="padding:8px 6px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:1.5px;color:#a1a1aa;text-transform:uppercase;">STANDARD</th>
        </tr>
        ${rowsHtml}
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:product_comparison:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. OBSIDIAN & CYAN CYBER TELEMETRY HUD
// Stealth high-tech matrix for gaming, PC components, audio, tactical gear
// ─────────────────────────────────────────────────────────────────────────────
function darkTerminalMatrix(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#090d16')
    const cyan = '#06b6d4'
    const emerald = '#10b981'
    const rows = getComparisonRows(p)

    const rowsHtml = rows.map((r, i) => {
        const isAlt = i % 2 === 1
        const rowBg = isAlt ? '#0d1322' : '#090d16'

        return `
      <tr style="background-color:${rowBg};border-bottom:1px solid #1e293b;">
        <td style="padding:10px 14px;font-family:'Courier New',Courier,monospace;font-size:12px;font-weight:700;color:#f8fafc;">
          ${r.feature}
        </td>
        <td align="center" style="padding:10px 14px;font-family:'Courier New',Courier,monospace;font-size:13px;font-weight:900;color:${cyan};">
          [+ ${r.ourValue} +]
        </td>
        <td align="center" style="padding:10px 14px;font-family:'Courier New',Courier,monospace;font-size:12px;color:#64748b;">
          [- ${r.competitorValue} -]
        </td>
      </tr>`
    }).join('')

    return `<!--[riazify:product_comparison:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};border:1.5px solid #1e293b;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,0.4);">
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;border-bottom:1px solid #1e293b;padding-bottom:8px;">
        <tr>
          <td>
            <div style="font-family:'Courier New',Courier,monospace;font-size:10px;font-weight:800;color:${cyan};letter-spacing:1px;">
              // TELEMETRY BENCHMARK COMPARISON
            </div>
            <div style="font-family:'Courier New',Courier,monospace;font-size:15px;font-weight:900;color:#f8fafc;margin-top:2px;">
              Direct Hardware Differential
            </div>
          </td>
          <td align="right">
            <span style="font-family:'Courier New',Courier,monospace;font-size:10px;font-weight:700;color:${emerald};letter-spacing:1px;">
              [SYSTEM VERIFIED]
            </span>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #1e293b;border-collapse:collapse;">
        <tr style="background-color:#0f172a;border-bottom:1.5px solid #334155;">
          <th align="left" style="padding:8px 14px;font-family:'Courier New',Courier,monospace;font-size:10px;color:#94a3b8;letter-spacing:1px;">TELEMETRY POINT</th>
          <th align="center" style="padding:8px 14px;font-family:'Courier New',Courier,monospace;font-size:10px;color:${cyan};letter-spacing:1px;">OUR HARDWARE</th>
          <th align="center" style="padding:8px 14px;font-family:'Courier New',Courier,monospace;font-size:10px;color:#64748b;letter-spacing:1px;">BASE MARKET</th>
        </tr>
        ${rowsHtml}
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:product_comparison:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. BOLD GREEN SHIELD CHECK VS RED CROSS MATRIX
// High-converting visual icons with unmistakable green vs red distinction
// ─────────────────────────────────────────────────────────────────────────────
function crossReferenceChecklist(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#ffffff')
    const rows = getComparisonRows(p)

    const rowsHtml = rows.map((r, i) => {
        const isAlt = i % 2 === 1
        const rowBg = isAlt ? '#f8fafc' : '#ffffff'

        return `
      <tr style="background-color:${rowBg};border-bottom:1px solid #e2e8f0;">
        <td style="padding:12px 16px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#0f172a;">
          ${r.feature}
        </td>
        <td align="center" style="padding:12px 16px;background-color:#f0fdf4;">
          <table cellpadding="0" cellspacing="0" border="0" align="center">
            <tr>
              <td style="width:20px;height:20px;background-color:#16a34a;border-radius:50%;text-align:center;line-height:20px;color:#ffffff;font-size:11px;font-weight:900;">
                ✓
              </td>
              <td style="padding-left:8px;font-family:Arial,sans-serif;font-size:13px;font-weight:900;color:#166534;">
                ${r.ourValue}
              </td>
            </tr>
          </table>
        </td>
        <td align="center" style="padding:12px 16px;background-color:#fef2f2;">
          <table cellpadding="0" cellspacing="0" border="0" align="center">
            <tr>
              <td style="width:20px;height:20px;background-color:#ef4444;border-radius:50%;text-align:center;line-height:20px;color:#ffffff;font-size:11px;font-weight:900;">
                ✕
              </td>
              <td style="padding-left:8px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#991b1b;">
                ${r.competitorValue}
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    }).join('')

    return `<!--[riazify:product_comparison:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="border:1.5px solid #cbd5e1;border-radius:8px;border-collapse:separate;overflow:hidden;background-color:#ffffff;">
        <tr style="background-color:#0f172a;">
          <th width="40%" align="left" style="padding:14px 16px;color:#ffffff;font-family:Arial,sans-serif;font-size:12px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;">
            FEATURE CHECKLIST
          </th>
          <th width="30%" align="center" style="padding:14px 16px;background-color:#16a34a;color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:900;text-transform:uppercase;">
            ✓ OUR PRODUCT
          </th>
          <th width="30%" align="center" style="padding:14px 16px;background-color:#dc2626;color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:900;text-transform:uppercase;">
            ✕ COMPETITORS
          </th>
        </tr>
        ${rowsHtml}
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:product_comparison:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. HIGH-DENSITY MOBILE SPLIT PILL STRIP
// Engineered specifically for 0-scroll rapid phone shopping on eBay app
// ─────────────────────────────────────────────────────────────────────────────
function compactMobileSplitPills(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#ffffff')
    const rows = getComparisonRows(p)

    const pillsHtml = rows.map(r => `
    <div style="margin-bottom:8px;padding:8px 12px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="35%" style="font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:#0f172a;">
            ${r.feature}
          </td>
          <td width="35%" align="center">
            <span style="display:inline-block;padding:3px 8px;background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;font-family:Arial,sans-serif;font-size:11px;font-weight:900;color:#059669;">
              ✓ ${r.ourValue}
            </span>
          </td>
          <td width="30%" align="right">
            <span style="display:inline-block;padding:3px 8px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;font-family:Arial,sans-serif;font-size:11px;color:#94a3b8;">
              ${r.competitorValue}
            </span>
          </td>
        </tr>
      </table>
    </div>`).join('')

    return `<!--[riazify:product_comparison:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 12, 16, 12, 16)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
        <tr>
          <td align="left">
            <span style="display:inline-block;padding:3px 8px;background-color:#2563eb;border-radius:3px;font-family:Arial,sans-serif;font-size:10px;font-weight:900;color:#ffffff;letter-spacing:0.5px;text-transform:uppercase;">
              HEAD-TO-HEAD
            </span>
            <span style="margin-left:8px;font-family:Arial,sans-serif;font-size:14px;font-weight:900;color:#0f172a;">
              Quick Value Comparison
            </span>
          </td>
          <td align="right">
            <span style="font-family:Arial,sans-serif;font-size:10px;color:#64748b;font-weight:700;">
              TAP TO EXPAND
            </span>
          </td>
        </tr>
      </table>
      ${pillsHtml}
    </td>
  </tr>
</table>
<!--[/riazify:product_comparison:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Thumbnail Representations for Visual Editor Carousel & Panels
// (Exact match for viewBox="0 0 80 48" style={{ width: '100%', height: 36 }})
// ─────────────────────────────────────────────────────────────────────────────

export const PRODUCT_COMPARISON_THUMBNAILS: Record<string, string> = {
    // 1. Classic Header Table
    'comp-classic-header-table': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#ede9fe" stroke-width="1"/>
    <rect width="80" height="11" rx="4" fill="#7530fb"/>
    <rect x="5" y="4" width="20" height="3.5" rx="0.5" fill="#ffffff"/>
    <rect x="30" y="4" width="22" height="3.5" rx="0.5" fill="#ffffff"/>
    <rect x="56" y="4" width="18" height="3.5" rx="0.5" fill="#ffffff"/>
    <line x1="28" y1="11" x2="28" y2="48" stroke="#ede9fe" stroke-width="0.8"/>
    <line x1="54" y1="11" x2="54" y2="48" stroke="#ede9fe" stroke-width="0.8"/>
    <line x1="0" y1="20" x2="80" y2="20" stroke="#ede9fe" stroke-width="0.8"/>
    <line x1="0" y1="29" x2="80" y2="29" stroke="#ede9fe" stroke-width="0.8"/>
    <line x1="0" y1="38" x2="80" y2="38" stroke="#ede9fe" stroke-width="0.8"/>
    <line x1="6" y1="15.5" x2="20" y2="15.5" stroke="#1e1535" stroke-width="1.2"/>
    <line x1="33" y1="15.5" x2="49" y2="15.5" stroke="#7530fb" stroke-width="1.5"/>
    <line x1="59" y1="15.5" x2="71" y2="15.5" stroke="#9ca3af" stroke-width="1.2"/>
    <line x1="6" y1="24.5" x2="22" y2="24.5" stroke="#1e1535" stroke-width="1.2"/>
    <line x1="33" y1="24.5" x2="47" y2="24.5" stroke="#7530fb" stroke-width="1.5"/>
    <line x1="59" y1="24.5" x2="69" y2="24.5" stroke="#9ca3af" stroke-width="1.2"/>
  </svg>`,

    // 2. Spotlight Winner Column
    'comp-spotlight-winner-column': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect width="80" height="10" fill="#0f172a"/>
    {/* Center Elevated Winner Column */}
    <rect x="28" y="0" width="26" height="48" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.2"/>
    <rect x="28" y="0" width="26" height="11" fill="#16a34a"/>
    <rect x="31" y="2" width="20" height="3" rx="1" fill="#ffffff"/>
    <rect x="32" y="6" width="18" height="3" rx="0.5" fill="#ffffff"/>
    {/* Left Column Header */}
    <rect x="4" y="3.5" width="20" height="3" fill="#ffffff"/>
    {/* Right Column Header */}
    <rect x="57" y="3.5" width="18" height="3" fill="#94a3b8"/>
    {/* Rows */}
    <line x1="0" y1="20" x2="80" y2="20" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="0" y1="30" x2="80" y2="30" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="0" y1="40" x2="80" y2="40" stroke="#e2e8f0" stroke-width="0.8"/>
    <circle cx="41" cy="15.5" r="1.5" fill="#16a34a"/>
    <circle cx="41" cy="25" r="1.5" fill="#16a34a"/>
    <circle cx="41" cy="35" r="1.5" fill="#16a34a"/>
  </svg>`,

    // 3. Versus Head-to-Head Cards
    'comp-versus-head-to-head-cards': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    {/* Left Green Card */}
    <rect x="4" y="5" width="33" height="38" rx="3" fill="#f0fdf4" stroke="#86efac" stroke-width="1"/>
    <rect x="7" y="8" width="16" height="3" rx="1" fill="#16a34a"/>
    <line x1="7" y1="16" x2="33" y2="16" stroke="#16a34a" stroke-width="1.2"/>
    <line x1="7" y1="23" x2="33" y2="23" stroke="#16a34a" stroke-width="1.2"/>
    <line x1="7" y1="30" x2="33" y2="30" stroke="#16a34a" stroke-width="1.2"/>
    <line x1="7" y1="37" x2="30" y2="37" stroke="#16a34a" stroke-width="1.2"/>
    {/* Center VS Circle */}
    <circle cx="40" cy="24" r="5" fill="#0f172a"/>
    <text x="40" y="26.5" font-size="4.5" font-weight="bold" fill="#ffffff" text-anchor="middle">VS</text>
    {/* Right Gray Card */}
    <rect x="43" y="5" width="33" height="38" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="46" y="8" width="16" height="3" rx="1" fill="#94a3b8"/>
    <line x1="46" y1="16" x2="72" y2="16" stroke="#94a3b8" stroke-width="1.2"/>
    <line x1="46" y1="23" x2="72" y2="23" stroke="#94a3b8" stroke-width="1.2"/>
    <line x1="46" y1="30" x2="72" y2="30" stroke="#94a3b8" stroke-width="1.2"/>
  </svg>`,

    // 4. Horizontal Metric Bars
    'comp-horizontal-metric-bars': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="5" y="4" width="22" height="3" rx="1" fill="#2563eb"/>
    {/* Row 1 */}
    <line x1="5" y1="12" x2="26" y2="12" stroke="#0f172a" stroke-width="1.2"/>
    <rect x="5" y="15" width="70" height="3.5" rx="1.5" fill="#e2e8f0"/>
    <rect x="5" y="15" width="58" height="3.5" rx="1.5" fill="#2563eb"/>
    {/* Row 2 */}
    <line x1="5" y1="24" x2="24" y2="24" stroke="#0f172a" stroke-width="1.2"/>
    <rect x="5" y="27" width="70" height="3.5" rx="1.5" fill="#e2e8f0"/>
    <rect x="5" y="27" width="62" height="3.5" rx="1.5" fill="#2563eb"/>
    {/* Row 3 */}
    <line x1="5" y1="36" x2="28" y2="36" stroke="#0f172a" stroke-width="1.2"/>
    <rect x="5" y="39" width="70" height="3.5" rx="1.5" fill="#e2e8f0"/>
    <rect x="5" y="39" width="52" height="3.5" rx="1.5" fill="#2563eb"/>
  </svg>`,

    // 5. Technical Spec Matrix
    'comp-technical-spec-matrix': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect width="80" height="9" fill="#0f172a"/>
    <line x1="4" y1="4.5" x2="24" y2="4.5" stroke="#ffffff" stroke-width="1.2"/>
    <line x1="32" y1="4.5" x2="52" y2="4.5" stroke="#38bdf8" stroke-width="1.5"/>
    <line x1="60" y1="4.5" x2="76" y2="4.5" stroke="#94a3b8" stroke-width="1.2"/>
    <line x1="0" y1="18" x2="80" y2="18" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="0" y1="27" x2="80" y2="27" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="0" y1="36" x2="80" y2="36" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="33" y="12" width="16" height="4.5" rx="1" fill="#ecfdf5"/>
    <rect x="33" y="21" width="16" height="4.5" rx="1" fill="#ecfdf5"/>
    <rect x="33" y="30" width="16" height="4.5" rx="1" fill="#ecfdf5"/>
  </svg>`,

    // 6. 3-Tier Good / Better / Best Lineup
    'comp-good-better-best-tiers': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect width="80" height="9" fill="#0f172a"/>
    {/* Middle Blue Column */}
    <rect x="29" y="0" width="22" height="48" fill="#eff6ff" stroke="#bfdbfe" stroke-width="0.8"/>
    <rect x="29" y="0" width="22" height="9" fill="#2563eb"/>
    <line x1="32" y1="4.5" x2="48" y2="4.5" stroke="#ffffff" stroke-width="1.5"/>
    <line x1="0" y1="19" x2="80" y2="19" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="0" y1="29" x2="80" y2="29" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="0" y1="39" x2="80" y2="39" stroke="#e2e8f0" stroke-width="0.8"/>
    <circle cx="40" cy="14" r="1.5" fill="#2563eb"/>
    <circle cx="40" cy="24" r="1.5" fill="#2563eb"/>
    <circle cx="40" cy="34" r="1.5" fill="#2563eb"/>
  </svg>`,

    // 7. Minimalist Hairline Editorial
    'comp-minimalist-hairline-editorial': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e4e4e7" stroke-width="1"/>
    <line x1="6" y1="8" x2="28" y2="8" stroke="#18181b" stroke-width="1.5"/>
    <line x1="6" y1="14" x2="74" y2="14" stroke="#18181b" stroke-width="1"/>
    <line x1="6" y1="22" x2="74" y2="22" stroke="#e4e4e7" stroke-width="0.8"/>
    <line x1="6" y1="30" x2="74" y2="30" stroke="#e4e4e7" stroke-width="0.8"/>
    <line x1="6" y1="38" x2="74" y2="38" stroke="#e4e4e7" stroke-width="0.8"/>
    <circle cx="45" cy="18" r="1.5" fill="#18181b"/>
    <circle cx="45" cy="26" r="1.5" fill="#18181b"/>
    <circle cx="45" cy="34" r="1.5" fill="#18181b"/>
    <circle cx="65" cy="18" r="1.5" stroke="#a1a1aa" fill="none"/>
    <circle cx="65" cy="26" r="1.5" stroke="#a1a1aa" fill="none"/>
    <circle cx="65" cy="34" r="1.5" stroke="#a1a1aa" fill="none"/>
  </svg>`,

    // 8. Obsidian & Cyan Cyber Matrix
    'comp-dark-terminal-matrix': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#090d16" stroke="#1e293b" stroke-width="1"/>
    <rect width="80" height="8" fill="#0f172a"/>
    <line x1="4" y1="4" x2="28" y2="4" stroke="#06b6d4" stroke-width="1.2"/>
    <line x1="62" y1="4" x2="76" y2="4" stroke="#10b981" stroke-width="1"/>
    <line x1="0" y1="18" x2="80" y2="18" stroke="#1e293b" stroke-width="0.8"/>
    <line x1="0" y1="28" x2="80" y2="28" stroke="#1e293b" stroke-width="0.8"/>
    <line x1="0" y1="38" x2="80" y2="38" stroke="#1e293b" stroke-width="0.8"/>
    <rect x="30" y="11" width="18" height="4.5" fill="#0c1322" stroke="#06b6d4" stroke-width="0.7"/>
    <rect x="30" y="21" width="18" height="4.5" fill="#0c1322" stroke="#06b6d4" stroke-width="0.7"/>
    <rect x="30" y="31" width="18" height="4.5" fill="#0c1322" stroke="#06b6d4" stroke-width="0.7"/>
  </svg>`,

    // 9. Bold Green Check vs Red Cross Matrix
    'comp-cross-reference-checklist': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect width="80" height="9" fill="#0f172a"/>
    <rect x="33" y="0" width="22" height="9" fill="#16a34a"/>
    <rect x="58" y="0" width="22" height="9" fill="#dc2626"/>
    <line x1="0" y1="19" x2="80" y2="19" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="0" y1="29" x2="80" y2="29" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="0" y1="39" x2="80" y2="39" stroke="#e2e8f0" stroke-width="0.8"/>
    <circle cx="44" cy="14" r="2.5" fill="#16a34a"/>
    <circle cx="44" cy="24" r="2.5" fill="#16a34a"/>
    <circle cx="44" cy="34" r="2.5" fill="#16a34a"/>
    <circle cx="69" cy="14" r="2.5" fill="#ef4444"/>
    <circle cx="69" cy="24" r="2.5" fill="#ef4444"/>
    <circle cx="69" cy="34" r="2.5" fill="#ef4444"/>
  </svg>`,

    // 10. High-Density Mobile Split Pills
    'comp-compact-mobile-split-pills': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="4" y="3" width="20" height="4" rx="1" fill="#2563eb"/>
    {/* 3 Mobile Pill Rows */}
    <rect x="4" y="10" width="72" height="9" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="8" y1="14.5" x2="22" y2="14.5" stroke="#0f172a" stroke-width="1.2"/>
    <rect x="34" y="11.5" width="18" height="6" rx="3" fill="#ecfdf5"/>
    <rect x="56" y="11.5" width="16" height="6" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.6"/>

    <rect x="4" y="22" width="72" height="9" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="8" y1="26.5" x2="24" y2="26.5" stroke="#0f172a" stroke-width="1.2"/>
    <rect x="34" y="23.5" width="18" height="6" rx="3" fill="#ecfdf5"/>
    <rect x="56" y="23.5" width="16" height="6" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.6"/>

    <rect x="4" y="34" width="72" height="9" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="8" y1="38.5" x2="20" y2="38.5" stroke="#0f172a" stroke-width="1.2"/>
    <rect x="34" y="35.5" width="18" height="6" rx="3" fill="#ecfdf5"/>
    <rect x="56" y="35.5" width="16" height="6" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.6"/>
  </svg>`,
}

export function getProductComparisonThumbnailSvg(id: string): string {
    const clean = id
        .toLowerCase()
        .trim()
        .replace(/^comp[-_]/, '')
        .replace(/_/g, '-')

    const key = Object.keys(PRODUCT_COMPARISON_THUMBNAILS).find(k => {
        const kClean = k.toLowerCase().replace(/^comp[-_]/, '').replace(/_/g, '-')
        return k === id || kClean === clean || k.endsWith(clean) || clean.includes(kClean)
    })

    return key ? PRODUCT_COMPARISON_THUMBNAILS[key] : PRODUCT_COMPARISON_THUMBNAILS['comp-classic-header-table']
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported Variant Registry (All 10 Radically Distinct Architectures)
// ─────────────────────────────────────────────────────────────────────────────

export const productComparisonVariants: BlockVariant[] = [
    {
        id: 'comp-classic-header-table',
        label: 'Classic Header Table',
        description: 'Current classic 3-column comparison table with purple header (KEPT 100% IDENTICAL)',
        thumbnail: PRODUCT_COMPARISON_THUMBNAILS['comp-classic-header-table'],
        toHtml(props, id) { return classicHeaderTable(props, id) },
    },
    {
        id: 'comp-spotlight-winner-column',
        label: 'Spotlight Winner Column',
        description: 'Elevated green flagship column with official badge and prominent checkmarks',
        thumbnail: PRODUCT_COMPARISON_THUMBNAILS['comp-spotlight-winner-column'],
        toHtml(props, id) { return spotlightWinnerColumn(props, id) },
    },
    {
        id: 'comp-versus-head-to-head-cards',
        label: 'Head-to-Head VS Cards',
        description: 'Dual-card boxing match layout (Our Authentic vs Cheap Clones) with central VS badge',
        thumbnail: PRODUCT_COMPARISON_THUMBNAILS['comp-versus-head-to-head-cards'],
        toHtml(props, id) { return versusHeadToHeadCards(props, id) },
    },
    {
        id: 'comp-horizontal-metric-bars',
        label: 'Performance Metric Bars',
        description: 'Visual progress scorebars for durability, speed, battery & tolerance comparisons',
        thumbnail: PRODUCT_COMPARISON_THUMBNAILS['comp-horizontal-metric-bars'],
        toHtml(props, id) { return horizontalMetricBars(props, id) },
    },
    {
        id: 'comp-technical-spec-matrix',
        label: 'Pro Technical Benchmark',
        description: 'Engineering matrix with status chips and laboratory certification tolerance badge',
        thumbnail: PRODUCT_COMPARISON_THUMBNAILS['comp-technical-spec-matrix'],
        toHtml(props, id) { return technicalSpecMatrix(props, id) },
    },
    {
        id: 'comp-good-better-best-tiers',
        label: '3-Tier Lineup Comparison',
        description: 'Good / Better / Best 3-tier comparison matrix for multi-variation listings',
        thumbnail: PRODUCT_COMPARISON_THUMBNAILS['comp-good-better-best-tiers'],
        toHtml(props, id) { return goodBetterBestTiers(props, id) },
    },
    {
        id: 'comp-minimalist-hairline-editorial',
        label: 'Minimalist Hairline Split',
        description: 'Delicate 1px hairlines and uppercase tracking for designer apparel & luxury goods',
        thumbnail: PRODUCT_COMPARISON_THUMBNAILS['comp-minimalist-hairline-editorial'],
        toHtml(props, id) { return minimalistHairlineEditorial(props, id) },
    },
    {
        id: 'comp-dark-terminal-matrix',
        label: 'Obsidian Cyan Cyber HUD',
        description: 'Stealth dark telemetry differential matrix for gaming peripherals & PC hardware',
        thumbnail: PRODUCT_COMPARISON_THUMBNAILS['comp-dark-terminal-matrix'],
        toHtml(props, id) { return darkTerminalMatrix(props, id) },
    },
    {
        id: 'comp-cross-reference-checklist',
        label: 'Shield Check vs Red Cross',
        description: 'High-contrast green checkmark vs red cross comparison for fast buyer comprehension',
        thumbnail: PRODUCT_COMPARISON_THUMBNAILS['comp-cross-reference-checklist'],
        toHtml(props, id) { return crossReferenceChecklist(props, id) },
    },
    {
        id: 'comp-compact-mobile-split-pills',
        label: 'Mobile Compact Split Pills',
        description: 'High-density horizontal comparison pills taking minimal vertical screen height on phones',
        thumbnail: PRODUCT_COMPARISON_THUMBNAILS['comp-compact-mobile-split-pills'],
        toHtml(props, id) { return compactMobileSplitPills(props, id) },
    },
]

// Backwards-compatible aliases
export const comparisonVariants = productComparisonVariants

/**
 * Robust Variant Resolver:
 * Supports variant IDs with or without the 'comp-' prefix
 * and matches shorthand IDs seamlessly.
 */
export function getProductComparisonVariant(id: string): BlockVariant {
    if (!id) return productComparisonVariants[0]
    const clean = id
        .toLowerCase()
        .trim()
        .replace(/^comp[-_]/, '')
        .replace(/_/g, '-')

    const found = productComparisonVariants.find(v => {
        const vClean = v.id.toLowerCase().replace(/^comp[-_]/, '').replace(/_/g, '-')
        return v.id === id || vClean === clean || v.id.endsWith(clean) || clean.includes(vClean)
    })

    return found ?? productComparisonVariants[0]
}
