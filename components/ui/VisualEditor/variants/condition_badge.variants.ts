// components/ui/VisualEditor/variants/condition_badge.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Condition Badge — 10 Radically Distinct, High-Converting Retail Layouts
// Built specifically for high-converting eBay & e-commerce listings.
// Zero generic AI-slop, zero cheesy glassmorphism, zero fake neon glows.
// 100% authentic, tangible, battle-tested retail architectures that buyers trust.
//
// 1. cond-inspected-grade-pill   — Certified inspection bar with high-contrast pill & QC seal
// 2. cond-cosmetic-score-meter   — A+ cosmetic grade score bar with 5-star condition meter
// 3. cond-factory-sealed-security— Tamper-evident factory sealed security hologram bar
// 4. cond-collector-archive-tag  — Vintage & collectible archival grading ticket with cut corners
// 5. cond-diagnostic-matrix-table— 4-point hardware health check (Screen, Battery, Housing, Ports)
// 6. cond-designer-luxury-report — High-end luxury consignment condition certificate with gold rules
// 7. cond-mechanic-auto-tested   — Industrial OEM tested & donor vehicle verified parts badge
// 8. cond-open-box-complete-strip— Customer return open-box complete with accessory audit
// 9. cond-minimal-nordic-pill    — Boutique Scandinavian minimalist hairline rule layout
// 10. cond-as-is-parts-honest    — Transparent parts/repair honest defect disclosure card
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
    id: string
    label: string
    description: string
    toHtml: (props: any, id: string) => string
}

// ─── Shared Helpers & Dynamic Resolvers ─────────────────────────────────────
function pad(p: any, defaultT = 14, defaultR = 20, defaultB = 14, defaultL = 20): string {
    const top = p.paddingTop ?? defaultT
    const right = p.paddingRight ?? defaultR
    const bottom = p.paddingBottom ?? defaultB
    const left = p.paddingLeft ?? defaultL
    return `padding:${top}px ${right}px ${bottom}px ${left}px;`
}

function font(p: any, defaultFamily = 'Arial, Helvetica, sans-serif'): string {
    return p.fontFamily ? `${p.fontFamily}, Arial, sans-serif` : defaultFamily
}

// Helper to resolve condition label & badge color based on condition prop
function resolveConditionMeta(p: any): { label: string; icon: string; defaultColor: string; defaultBg: string } {
    const cond = (p.condition ?? 'new').toLowerCase().trim()
    switch (cond) {
        case 'new':
        case 'brand_new':
            return { label: 'Brand New', icon: '★', defaultColor: '#16a34a', defaultBg: '#f0fdf4' }
        case 'refurbished':
        case 'certified_refurbished':
            return { label: 'Certified Refurbished', icon: '⟳', defaultColor: '#2563eb', defaultBg: '#eff6ff' }
        case 'open_box':
            return { label: 'Open Box (Like New)', icon: '📦', defaultColor: '#9333ea', defaultBg: '#fdf4ff' }
        case 'used':
        case 'pre_owned':
            return { label: 'Excellent Pre-Owned', icon: '↺', defaultColor: '#ea580c', defaultBg: '#fff7ed' }
        case 'for_parts':
        case 'parts':
            return { label: 'For Parts / Repair', icon: '⚙', defaultColor: '#dc2626', defaultBg: '#fef2f2' }
        default:
            return { label: p.conditionLabel ?? 'Brand New', icon: '★', defaultColor: '#16a34a', defaultBg: '#f0fdf4' }
    }
}

function conditionTitle(p: any): string {
    if (p.heading || p.title) return p.heading ?? p.title
    const meta = resolveConditionMeta(p)
    return `Condition: ${meta.label}`
}

function conditionSubtext(p: any): string {
    return p.subText ?? p.notes ?? p.conditionNotes ?? 'Pristine item. All functions and cosmetic standards thoroughly verified.'
}

const KNOWN_DEFAULT_BGS = [
    '#f0fdf4', // Mint green default
    '#ffffff', // White
    '#f8fafc', // Slate 50
    '#f8f7ff', // Purple 50
    '#dc2626', // Red
    '#1e1535', // Dark Purple
    '#0f172a', // Slate 900
    '#18181b', // Zinc 900
    '#09090b', // Zinc 950
    '#090d16', // Dark Navy
    '#064e3b', // Emerald
    '#fffdfa', // Cream Ivory
    '#fff7ed', // Orange
    '#eff6ff', // Blue
    '#fdf4ff', // Lilac
]

function resolveBg(p: any, signatureBg: string): string {
    if (!p.bgColor) return signatureBg
    const val = p.bgColor.toLowerCase().trim()
    if (KNOWN_DEFAULT_BGS.includes(val)) {
        return signatureBg
    }
    return p.bgColor
}

function resolveText(p: any, signatureText: string): string {
    if (!p.textColor) return signatureText
    const val = p.textColor.toLowerCase().trim()
    if (
        val === '#ffffff' ||
        val === '#166534' ||
        val === '#1e1535' ||
        val === '#0f172a' ||
        val === '#18181b' ||
        val === '#1c1917' ||
        val === '#f4f4f5' ||
        val === '#fafafa'
    ) {
        return signatureText
    }
    return p.textColor
}

function resolveAccent(p: any, signatureAccent: string): string {
    if (!p.accentColor) return signatureAccent
    const val = p.accentColor.toLowerCase().trim()
    const KNOWN_ACCENTS = [
        '#16a34a', '#10b981', '#7530fb', '#b8fa33', '#f59e0b', '#b91c1c',
        '#d4af37', '#0284c7', '#f97316', '#2563eb', '#71717a', '#06b6d4', '#fbbf24'
    ]
    if (KNOWN_ACCENTS.includes(val)) {
        return signatureAccent
    }
    return p.accentColor
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. INSPECTED GRADE PILL & QC SEAL
// High-contrast badge pill with circular "QC PASSED" verification stamp
// ─────────────────────────────────────────────────────────────────────────────
function inspectedGradePill(p: any, id: string): string {
    const f = font(p)
    const meta = resolveConditionMeta(p)
    const bgCol = resolveBg(p, '#ffffff')
    const textCol = resolveText(p, '#0f172a')
    const accent = resolveAccent(p, meta.defaultColor)
    const title = conditionTitle(p)
    const subtitle = conditionSubtext(p)

    return `<!--[riazify:condition_badge:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #e2e8f0;border-radius:8px;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 14, 18, 14, 18)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Left: Big Pill + Condition Details -->
          <td style="text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div style="margin-bottom:5px;">
              <span style="display:inline-block;background-color:${accent};color:#ffffff;font-size:11px;font-weight:900;letter-spacing:0.8px;text-transform:uppercase;padding:3.5px 11px;border-radius:100px;vertical-align:middle;">
                &#10003; ${meta.label}
              </span>
              <span style="display:inline-block;color:#64748b;font-size:11.5px;font-weight:700;margin-left:8px;vertical-align:middle;">
                &bull; Full Inspection Complete
              </span>
            </div>
            <div style="color:${textCol};font-size:16px;font-weight:900;line-height:1.25;margin:0 0 3px 0;">
              ${title}
            </div>
            <div style="color:#475569;font-size:12px;font-weight:400;line-height:1.4;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Right: Circular QC Passed Stamp -->
          <td width="110" style="width:110px;text-align:right;vertical-align:middle;padding-left:14px;box-sizing:border-box;">
            <div style="display:inline-block;width:64px;height:64px;border:2px dashed ${accent};border-radius:50%;text-align:center;box-sizing:border-box;padding:8px 2px;">
              <div style="color:${accent};font-size:12px;font-weight:900;line-height:1.1;">QC</div>
              <div style="color:${accent};font-size:8px;font-weight:900;letter-spacing:0.5px;margin-top:2px;">PASSED</div>
              <div style="color:#64748b;font-size:7px;font-weight:700;">100% OK</div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:condition_badge:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. A+ COSMETIC & FUNCTIONAL SCORE BAR
// Detailed grading score bar with 5-star visual condition meter
// ─────────────────────────────────────────────────────────────────────────────
function cosmeticScoreMeter(p: any, id: string): string {
    const f = font(p)
    const meta = resolveConditionMeta(p)
    const bgCol = resolveBg(p, '#ffffff')
    const textCol = resolveText(p, '#0f172a')
    const accent = resolveAccent(p, '#2563eb')
    const starCol = '#f59e0b'
    const title = conditionTitle(p)
    const subtitle = conditionSubtext(p)

    return `<!--[riazify:condition_badge:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #e2e8f0;border-radius:8px;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 14, 18, 14, 18)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Left: Dual Score Badges -->
          <td width="150" style="width:150px;text-align:center;vertical-align:middle;padding-right:16px;box-sizing:border-box;">
            <div style="background-color:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:8px 6px;">
              <div style="color:${accent};font-size:13px;font-weight:900;letter-spacing:0.5px;">GRADE A+</div>
              <div style="color:${starCol};font-size:12px;margin:2px 0;">★★★★★</div>
              <div style="color:#64748b;font-size:8px;font-weight:700;letter-spacing:0.5px;">EXCELLENT COSMETIC</div>
            </div>
          </td>

          <!-- Center: Condition Narrative -->
          <td style="text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div style="color:${accent};font-size:10px;font-weight:900;letter-spacing:1px;text-transform:uppercase;margin-bottom:3px;">
              ★ 30-POINT HARDWARE DIAGNOSTICS ★
            </div>
            <div style="color:${textCol};font-size:16px;font-weight:900;line-height:1.25;margin:0 0 3px 0;">
              ${title}
            </div>
            <div style="color:#475569;font-size:12px;font-weight:400;line-height:1.4;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Right Status Indicator -->
          <td width="130" style="width:130px;text-align:right;vertical-align:middle;padding-left:14px;border-left:1px solid #f1f5f9;box-sizing:border-box;">
            <div style="color:#16a34a;font-size:11px;font-weight:900;">&#10003; 100% Functional</div>
            <div style="color:#64748b;font-size:10px;margin-top:2px;">Clean Serial / IMEI</div>
            <div style="color:#2563eb;font-size:10px;font-weight:700;margin-top:2px;">Reset to Factory</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:condition_badge:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. TAMPER-EVIDENT FACTORY SEALED SECURITY STRIP
// Deep obsidian/slate container with emerald security hologram simulation
// ─────────────────────────────────────────────────────────────────────────────
function factorySealedSecurity(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#090d16')
    const textCol = resolveText(p, '#ffffff')
    const emerald = resolveAccent(p, '#10b981')
    const title = conditionTitle(p)
    const subtitle = conditionSubtext(p)

    return `<!--[riazify:condition_badge:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #1e293b;border-radius:8px;overflow:hidden;background-color:${bgCol};">
  <!-- Top Hologram Security Bar -->
  <tr>
    <td style="background-color:#022c22;border-bottom:1px solid #065f46;color:${emerald};font-size:9.5px;font-weight:900;letter-spacing:2px;text-align:center;padding:4px 0;text-transform:uppercase;">
      🔒 100% FACTORY SEALED /// ORIGINAL MANUFACTURER PACKAGING /// NEVER OPENED
    </td>
  </tr>
  <tr>
    <td style="${pad(p, 14, 20, 14, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Content -->
          <td style="text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div style="margin-bottom:4px;">
              <span style="display:inline-block;background-color:#064e3b;color:${emerald};font-size:10px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:2px 7px;border-radius:3px;border:1px solid ${emerald};">
                OEM FACTORY SEAL
              </span>
              <span style="color:#a7f3d0;font-size:11px;font-weight:700;margin-left:8px;">
                Zero Battery Cycles &bull; Untouched
              </span>
            </div>
            <div style="color:${textCol};font-size:16.5px;font-weight:900;letter-spacing:0.2px;line-height:1.25;margin:0 0 4px 0;">
              ${title}
            </div>
            <div style="color:#94a3b8;font-size:12px;font-weight:400;line-height:1.4;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Right Status Seal -->
          <td width="150" style="width:150px;text-align:right;vertical-align:middle;padding-left:14px;box-sizing:border-box;">
            <div style="background-color:#0f172a;border:1px solid ${emerald};border-radius:6px;padding:8px 10px;text-align:center;">
              <div style="color:${emerald};font-size:12px;font-weight:900;">MINT IN BOX</div>
              <div style="color:#ffffff;font-size:9.5px;font-weight:700;margin-top:2px;">Original Barcodes</div>
              <div style="color:#38bdf8;font-size:9px;font-weight:600;margin-top:2px;">Verified Authentic</div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:condition_badge:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. COLLECTOR ARCHIVE PRESERVATION TICKET
// Warm parchment ticket with dashed border and corner cut marks for collectibles
// ─────────────────────────────────────────────────────────────────────────────
function collectorArchiveTag(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#fffdfa')
    const textCol = resolveText(p, '#1c1917')
    const accent = resolveAccent(p, '#b91c1c')
    const title = conditionTitle(p)
    const subtitle = conditionSubtext(p)

    return `<!--[riazify:condition_badge:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:2px dashed #d6d3d1;border-radius:8px;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Archival Stamp Box -->
          <td width="80" style="width:80px;text-align:center;vertical-align:middle;padding-right:16px;box-sizing:border-box;">
            <div style="border:1.5px solid ${accent};border-radius:4px;padding:6px 2px;background-color:#ffffff;">
              <div style="color:${accent};font-size:10px;font-weight:900;letter-spacing:1px;">GRADE</div>
              <div style="color:${textCol};font-size:16px;font-weight:900;line-height:1.2;margin:2px 0;">9.4</div>
              <div style="color:#78716c;font-size:7.5px;font-weight:800;">NEAR MINT</div>
            </div>
          </td>

          <!-- Details -->
          <td style="text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div style="color:#78716c;font-size:9.5px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:3px;">
              [⌜ COLLECTOR ARCHIVAL ASSESSMENT ⌝]
            </div>
            <div style="color:${textCol};font-size:16px;font-weight:900;line-height:1.25;margin:0 0 3px 0;">
              ${title}
            </div>
            <div style="color:#57534e;font-size:12px;font-weight:400;line-height:1.45;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Preservation Notes -->
          <td width="150" style="width:150px;text-align:right;vertical-align:middle;padding-left:14px;border-left:1px dashed #d6d3d1;box-sizing:border-box;">
            <div style="color:#16a34a;font-size:10.5px;font-weight:800;">&#10003; Smoke-Free Storage</div>
            <div style="color:#78716c;font-size:10px;margin:2px 0;">&#10003; Archival Sleeved</div>
            <div style="color:#1c1917;font-size:9.5px;font-weight:700;">&#10003; High Resolution Scan</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:condition_badge:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. HARDWARE DIAGNOSTIC MATRIX (4-Point Component Health Report)
// Modern grid showing 4 status chips (Screen, Battery, Ports, Housing)
// ─────────────────────────────────────────────────────────────────────────────
function diagnosticMatrixTable(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#ffffff')
    const textCol = resolveText(p, '#0f172a')
    const accent = resolveAccent(p, '#0284c7')
    const title = conditionTitle(p)
    const subtitle = conditionSubtext(p)

    return `<!--[riazify:condition_badge:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #e2e8f0;border-radius:8px;overflow:hidden;background-color:${bgCol};">
  <!-- Header Bar -->
  <tr>
    <td style="background-color:#f8fafc;border-bottom:1px solid #e2e8f0;padding:10px 18px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="text-align:left;">
            <span style="color:${accent};font-size:10px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">
              HARDWARE INSPECTION REPORT &bull;
            </span>
            <span style="color:${textCol};font-size:14px;font-weight:900;margin-left:6px;">
              ${title}
            </span>
          </td>
          <td style="text-align:right;color:#64748b;font-size:11px;font-weight:600;">
            ${subtitle}
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- 4 Diagnostic Chips -->
  <tr>
    <td style="padding:10px 14px;background-color:${bgCol};">
      <table width="100%" cellpadding="0" cellspacing="6" border="0" style="border-collapse:separate;">
        <tr>
          <td width="25%" align="center" style="background-color:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:8px 4px;">
            <div style="color:#64748b;font-size:9px;font-weight:800;">SCREEN / GLASS</div>
            <div style="color:#16a34a;font-size:12px;font-weight:900;margin-top:2px;">&#10003; Flawless</div>
          </td>
          <td width="25%" align="center" style="background-color:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:8px 4px;">
            <div style="color:#64748b;font-size:9px;font-weight:800;">BATTERY HEALTH</div>
            <div style="color:#16a34a;font-size:12px;font-weight:900;margin-top:2px;">&#10003; 95%+ Capacity</div>
          </td>
          <td width="25%" align="center" style="background-color:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:8px 4px;">
            <div style="color:#64748b;font-size:9px;font-weight:800;">PORTS & AUDIO</div>
            <div style="color:#16a34a;font-size:12px;font-weight:900;margin-top:2px;">&#10003; 100% Tested</div>
          </td>
          <td width="25%" align="center" style="background-color:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:8px 4px;">
            <div style="color:#64748b;font-size:9px;font-weight:800;">HOUSING / BODY</div>
            <div style="color:#0f172a;font-size:12px;font-weight:900;margin-top:2px;">&#10003; Grade A Near-Mint</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:condition_badge:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. LUXURY BOUTIQUE CONSIGNMENT CERTIFICATE
// Matte black card with metallic champagne gold hairline rules for designer goods
// ─────────────────────────────────────────────────────────────────────────────
function designerLuxuryReport(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#09090b')
    const textCol = resolveText(p, '#fafafa')
    const gold = resolveAccent(p, '#d4af37')
    const title = conditionTitle(p)
    const subtitle = conditionSubtext(p)

    return `<!--[riazify:condition_badge:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid ${gold};border-radius:8px;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 22, 16, 22)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Content -->
          <td style="text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div style="color:${gold};font-size:9.5px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">
              ◆ LUXURY BOUTIQUE AUTHENTICATION ◆
            </div>
            <div style="color:${textCol};font-size:17px;font-weight:700;letter-spacing:0.5px;line-height:1.25;margin:0 0 4px 0;">
              ${title}
            </div>
            <div style="color:#a1a1aa;font-size:12px;font-weight:400;line-height:1.45;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Luxury Seal -->
          <td width="160" style="width:160px;text-align:right;vertical-align:middle;padding-left:16px;box-sizing:border-box;">
            <div style="background-color:#18181b;border:1px solid ${gold};border-radius:6px;padding:8px 12px;text-align:center;">
              <div style="color:${gold};font-size:11px;font-weight:900;letter-spacing:0.5px;">AUTHENTIC</div>
              <div style="color:#ffffff;font-size:9.5px;font-weight:700;margin-top:2px;">Clean Hardware</div>
              <div style="color:${gold};font-size:9px;font-weight:600;margin-top:2px;">Dust Bag Included</div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:condition_badge:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. MECHANIC OEM TESTED AUTO PARTS BADGE
// Rugged industrial slate card with caution hazard yellow accents for car parts
// ─────────────────────────────────────────────────────────────────────────────
function mechanicAutoTested(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#18181b')
    const textCol = resolveText(p, '#f4f4f5')
    const yellow = resolveAccent(p, '#f59e0b')
    const title = conditionTitle(p)
    const subtitle = conditionSubtext(p)

    return `<!--[riazify:condition_badge:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:2px solid ${yellow};border-radius:8px;overflow:hidden;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 14, 20, 14, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Gear Icon -->
          <td width="42" style="width:42px;vertical-align:middle;text-align:center;box-sizing:border-box;">
            <div style="font-size:26px;line-height:1;">⚙️</div>
          </td>

          <!-- Details -->
          <td style="text-align:left;vertical-align:middle;padding:0 14px;box-sizing:border-box;">
            <div style="margin-bottom:3px;">
              <span style="display:inline-block;background-color:${yellow};color:#000000;font-size:9.5px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:2px 7px;border-radius:2px;">
                TESTED OEM COMPONENT
              </span>
              <span style="color:#a1a1aa;font-size:11px;font-weight:700;margin-left:8px;">
                Mounting Tabs Intact &bull; Clean Pins
              </span>
            </div>
            <div style="color:${textCol};font-size:16px;font-weight:900;line-height:1.25;margin:0 0 3px 0;">
              ${title}
            </div>
            <div style="color:#d4d4d8;font-size:11.5px;font-weight:400;line-height:1.4;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Right Status Box -->
          <td width="150" style="width:150px;text-align:right;vertical-align:middle;box-sizing:border-box;">
            <div style="background-color:#27272a;border:1px solid #3f3f46;border-radius:6px;padding:7px 10px;text-align:center;">
              <div style="color:${yellow};font-size:12px;font-weight:900;">BENCH TESTED</div>
              <div style="color:#10b981;font-size:9.5px;font-weight:800;margin-top:2px;">&#10003; 100% Operational</div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:condition_badge:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. OPEN BOX COMPLETE & ACCESSORY AUDIT STRIP
// Soft lilac card explaining open-box status and confirming all original accessories
// ─────────────────────────────────────────────────────────────────────────────
function openBoxCompleteStrip(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#ffffff')
    const textCol = resolveText(p, '#0f172a')
    const purple = resolveAccent(p, '#9333ea')
    const title = conditionTitle(p)
    const subtitle = conditionSubtext(p)

    return `<!--[riazify:condition_badge:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #e9d5ff;border-radius:8px;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 14, 18, 14, 18)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Box Icon -->
          <td width="42" style="width:42px;vertical-align:middle;text-align:center;box-sizing:border-box;">
            <div style="font-size:26px;line-height:1;">📦</div>
          </td>

          <!-- Main Info -->
          <td style="text-align:left;vertical-align:middle;padding:0 12px;box-sizing:border-box;">
            <div style="margin-bottom:3px;">
              <span style="display:inline-block;background-color:#f3e8ff;color:${purple};font-size:9.5px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:2px 7px;border-radius:3px;">
                OPEN BOX &bull; 100% COMPLETE
              </span>
              <span style="color:#6b7280;font-size:11px;font-weight:600;margin-left:8px;">
                Inspected & Repackaged
              </span>
            </div>
            <div style="color:${textCol};font-size:16px;font-weight:900;line-height:1.25;margin:0 0 3px 0;">
              ${title}
            </div>
            <div style="color:#4b5563;font-size:11.5px;font-weight:400;line-height:1.4;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Checklist -->
          <td width="150" style="width:150px;text-align:right;vertical-align:middle;padding-left:12px;border-left:1px solid #f3e8ff;box-sizing:border-box;">
            <div style="color:${purple};font-size:11px;font-weight:800;">&#10003; All Cables Included</div>
            <div style="color:#16a34a;font-size:10px;font-weight:700;margin-top:2px;">&#10003; Like-New Condition</div>
            <div style="color:#6b7280;font-size:9.5px;margin-top:2px;">Retail Packaging</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:condition_badge:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. BOUTIQUE SCANDINAVIAN MINIMALIST
// Snow-white card with delicate 1px border and wide typographic tracking
// ─────────────────────────────────────────────────────────────────────────────
function minimalNordicPill(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#ffffff')
    const textCol = resolveText(p, '#18181b')
    const accent = resolveAccent(p, '#71717a')
    const title = conditionTitle(p)
    const subtitle = conditionSubtext(p)

    return `<!--[riazify:condition_badge:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:1px solid #e4e4e7;border-radius:6px;background-color:${bgCol};">
  <tr>
    <td style="background-color:${bgCol};border-radius:6px;${pad(p, 18, 22, 18, 22)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Content -->
          <td style="text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div style="color:${accent};font-size:9.5px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:3px;">
              MERCHANDISE CONDITION
            </div>
            <div style="color:${textCol};font-size:16.5px;font-weight:600;letter-spacing:0.8px;line-height:1.25;margin:0 0 3px 0;">
              ${title}
            </div>
            <div style="color:#71717a;font-size:12px;font-weight:400;line-height:1.45;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Right Status -->
          <td width="150" style="width:150px;text-align:right;vertical-align:middle;padding-left:14px;box-sizing:border-box;">
            <div style="display:inline-block;border-left:1px solid #d4d4d8;padding-left:14px;text-align:left;">
              <div style="color:#18181b;font-size:11.5px;font-weight:700;">AUTHENTIC</div>
              <div style="color:#71717a;font-size:10px;font-weight:500;margin-top:2px;">Hand-Verified Lot</div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:condition_badge:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. HONEST PARTS & REPAIR TRANSPARENT DISCLOSURE
// Amber warning card with itemized defect transparency (zero surprise returns!)
// ─────────────────────────────────────────────────────────────────────────────
function asIsPartsHonest(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#fffbeb') // warm soft amber
    const textCol = resolveText(p, '#78350f')
    const red = resolveAccent(p, '#dc2626')
    const title = conditionTitle(p)
    const subtitle = conditionSubtext(p)

    return `<!--[riazify:condition_badge:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #fde68a;border-radius:8px;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 14, 18, 14, 18)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Warning Icon -->
          <td width="36" style="width:36px;vertical-align:middle;text-align:center;box-sizing:border-box;">
            <div style="font-size:24px;line-height:1;">⚠️</div>
          </td>

          <!-- Details -->
          <td style="text-align:left;vertical-align:middle;padding:0 12px;box-sizing:border-box;">
            <div style="margin-bottom:3px;">
              <span style="display:inline-block;background-color:#fee2e2;color:${red};font-size:9.5px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:2px 7px;border-radius:3px;">
                AS-IS &bull; FOR PARTS OR RESTORATION
              </span>
              <span style="color:#92400e;font-size:10.5px;font-weight:700;margin-left:8px;">
                Honest Defect Disclosure Below
              </span>
            </div>
            <div style="color:${textCol};font-size:16px;font-weight:900;line-height:1.25;margin:0 0 3px 0;">
              ${title}
            </div>
            <div style="color:#92400e;font-size:11.5px;font-weight:500;line-height:1.4;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Right Status Box -->
          <td width="140" style="width:140px;text-align:center;vertical-align:middle;border-left:1px dashed #fcd34d;padding-left:12px;box-sizing:border-box;">
            <div style="color:${red};font-size:12px;font-weight:900;">NO SURPRISES</div>
            <div style="color:#78350f;font-size:9.5px;font-weight:600;margin-top:2px;">Read Notes Carefully</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:condition_badge:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported Variant Registry (All 10 Distinct Layout Architectures)
// ─────────────────────────────────────────────────────────────────────────────
export const conditionBadgeVariants: BlockVariant[] = [
    {
        id: 'cond-inspected-grade-pill',
        label: 'Inspected Grade Pill',
        description: 'Certified inspection bar with high-contrast pill and circular QC seal',
        toHtml(props, id) { return inspectedGradePill(props, id) },
    },
    {
        id: 'cond-cosmetic-score-meter',
        label: 'Cosmetic Score Meter',
        description: 'A+ cosmetic grade score bar with 5-star condition meter',
        toHtml(props, id) { return cosmeticScoreMeter(props, id) },
    },
    {
        id: 'cond-factory-sealed-security',
        label: 'Factory Sealed Hologram',
        description: 'Tamper-evident factory sealed security hologram bar with zero-cycle verification',
        toHtml(props, id) { return factorySealedSecurity(props, id) },
    },
    {
        id: 'cond-collector-archive-tag',
        label: 'Archival Grading Tag',
        description: 'Vintage & collectible archival grading ticket with cut corners',
        toHtml(props, id) { return collectorArchiveTag(props, id) },
    },
    {
        id: 'cond-diagnostic-matrix-table',
        label: 'Hardware Diagnostic Matrix',
        description: '4-point hardware health check (Screen, Battery, Housing, Ports)',
        toHtml(props, id) { return diagnosticMatrixTable(props, id) },
    },
    {
        id: 'cond-designer-luxury-report',
        label: 'Luxury Consignment Report',
        description: 'High-end luxury condition certificate with gold rules for designer goods',
        toHtml(props, id) { return designerLuxuryReport(props, id) },
    },
    {
        id: 'cond-mechanic-auto-tested',
        label: 'Mechanic OEM Tested',
        description: 'Industrial OEM tested & donor vehicle verified auto parts badge',
        toHtml(props, id) { return mechanicAutoTested(props, id) },
    },
    {
        id: 'cond-open-box-complete-strip',
        label: 'Open Box Complete Strip',
        description: 'Customer return open-box complete with accessory audit',
        toHtml(props, id) { return openBoxCompleteStrip(props, id) },
    },
    {
        id: 'cond-minimal-nordic-pill',
        label: 'Minimalist Nordic Pill',
        description: 'Boutique Scandinavian minimalist hairline rule layout',
        toHtml(props, id) { return minimalNordicPill(props, id) },
    },
    {
        id: 'cond-as-is-parts-honest',
        label: 'Parts / Repair Disclosure',
        description: 'Transparent parts/repair honest defect disclosure card with zero surprises',
        toHtml(props, id) { return asIsPartsHonest(props, id) },
    },
]

// Backwards-compatible aliases
export const conditionVariants = conditionBadgeVariants

/**
 * Robust Variant Resolver:
 * Supports variant IDs with or without the 'cond-', 'condition-', or 'badge-' prefix
 * and matches shorthand IDs seamlessly.
 */
export function getConditionBadgeVariant(id: string): BlockVariant {
    if (!id) return conditionBadgeVariants[0]
    const clean = id
        .toLowerCase()
        .trim()
        .replace(/^cond[-_]/, '')
        .replace(/^condition[-_]/, '')
        .replace(/^badge[-_]/, '')
        .replace(/_/g, '-')

    const match = conditionBadgeVariants.find(v => {
        const vClean = v.id
            .toLowerCase()
            .replace(/^cond[-_]/, '')
            .replace(/^condition[-_]/, '')
            .replace(/^badge[-_]/, '')
            .replace(/_/g, '-')

        return (
            v.id === id ||
            vClean === clean ||
            v.id.endsWith(clean) ||
            clean.includes(vClean) ||
            vClean.includes(clean)
        )
    })

    return match ?? conditionBadgeVariants[0]
}

export const getConditionVariant = getConditionBadgeVariant
