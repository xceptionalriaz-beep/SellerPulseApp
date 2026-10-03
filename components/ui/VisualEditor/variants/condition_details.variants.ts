// components/ui/VisualEditor/variants/condition_details.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Condition Details — 10 Radically Distinct, High-Converting Retail Layouts
// Built specifically for high-converting eBay & e-commerce listings.
// Zero generic AI-slop, zero cheesy glassmorphism, zero fake neon glows.
// 100% authentic, tangible, battle-tested retail architectures that buyers trust.
//
// 1. cd-cosmetic-grade-split       — Current classic 30/70 split: cosmetic grade stars + notes (KEPT 100% IDENTICAL)
// 2. cd-certified-refurb-diagnostic— Certified Tech Refurbishment & Multi-Point Diagnostic Audit
// 3. cd-archival-vintage-tier      — Collector Comic / Card / Vinyl 5-tier visual grading scale track
// 4. cd-open-box-inventory-audit   — Open Box complete accessory verification & inspection checklist
// 5. cd-honest-wear-transparency   — Pre-Owned apparel & everyday second-hand honest flaw disclosure
// 6. cd-parts-repair-warning       — Salvage / Parts & Repair amber industrial hazard warning dossier
// 7. cd-jeweler-curator-provenance — Haute horlogerie & estate jewelry curator appraisal with gold rules
// 8. cd-automotive-core-fitment    — Auto parts & mechanical component inspection plaque with OEM metrics
// 9. cd-scandinavian-minimal-ledger— Scandinavian minimalist studio hairline wear ledger with wide tracking
// 10. cd-mobile-compact-badge-strip— High-density mobile thumb-scan strip engineered for rapid phone scanning
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
  id: string
  label: string
  description: string
  thumbnail?: string
  toHtml: (props: any, id: string) => string
}

// ─── Shared Helpers & Dynamic Resolvers ─────────────────────────────────────
function pad(p: any, defaultT = 16, defaultR = 20, defaultB = 16, defaultL = 20): string {
  const top = p.paddingTop ?? defaultT
  const right = p.paddingRight ?? defaultR
  const bottom = p.paddingBottom ?? defaultB
  const left = p.paddingLeft ?? defaultL
  return `padding:${top}px ${right}px ${bottom}px ${left}px;`
}

function font(p: any, defaultFamily = 'Arial, Helvetica, sans-serif'): string {
  return p.fontFamily ? `${p.fontFamily}, Arial, sans-serif` : defaultFamily
}

function condTitle(p: any, fallback = '{{ITEM_CONDITION}}'): string {
  return p.conditionText ?? p.condition ?? p.heading ?? fallback
}

function condNotes(
  p: any,
  fallback = '{{CONDITION_NOTES}}'
): string {
  return p.conditionNotes ?? p.subText ?? p.notes ?? fallback
}

const KNOWN_DEFAULT_BGS = [
  '#f8f7ff', // Default purple tint
  '#ffffff', // White
  '#f8fafc', // Slate 50
  '#dc2626', // Red
  '#1e1535', // Dark Purple
  '#0f172a', // Slate 900
  '#18181b', // Zinc 900
  '#09090b', // Zinc 950
  '#090d16', // Dark Navy
  '#064e3b', // Emerald
  '#fffdfa', // Cream Ivory
  '#f0fdf4', // Mint Green
  '#161324', // Deep Plum
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
    val === '#7530fb' ||
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
    '#7530fb', '#b8fa33', '#f59e0b', '#b91c1c', '#d4af37',
    '#0284c7', '#f97316', '#2563eb', '#71717a', '#06b6d4',
    '#fbbf24', '#10b981', '#16a34a'
  ]
  if (KNOWN_ACCENTS.includes(val)) {
    return signatureAccent
  }
  return p.accentColor
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLASSIC COSMETIC GRADE SPLIT (CURRENT STYLE — KEPT 100% UNCHANGED)
// Headline condition with 30% cosmetic grade star box and 66% condition notes box
// ─────────────────────────────────────────────────────────────────────────────
function cosmeticGradeSplit(p: any, id: string): string {
  const f = font(p)
  const bgCol = p.bgColor ?? '#ffffff'
  const condition = condTitle(p, 'Brand New')
  const notes = condNotes(p, '{{CONDITION_NOTES}}')
  const accent = p.accentColor ?? '#7530fb'

  return `<!--[riazify:condition_details:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};${pad(p)}">
      <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#1e1535;">
        Condition: <span style="color:${accent};">${condition}</span>
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="30%" style="padding:8px;background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;text-align:center;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#166534;">
              ${p.badgeLabel ?? 'COSMETIC GRADE'}
            </p>
            <p style="margin:4px 0 0;font-size:20px;color:#16a34a;">
              &#9733;&#9733;&#9733;&#9733;&#9733;
            </p>
          </td>
          <td width="4%"></td>
          <td width="66%" style="padding:12px;background-color:#f8f7ff;border:1px solid #ede9fe;border-radius:6px;vertical-align:top;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#1f1d2e;line-height:1.7;">
              ${notes}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:condition_details:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CERTIFIED TECH REFURBISHMENT & MULTI-POINT AUDIT
// Slate header with 3-badge hardware health check for phones, laptops & gadgets
// ─────────────────────────────────────────────────────────────────────────────
function certifiedRefurbDiagnostic(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#0f172a')
  const accent = resolveAccent(p, '#2563eb')
  const condition = condTitle(p, 'Certified Refurbished (Grade A+)')
  const notes = condNotes(p, 'Unit in pristine mechanical condition. Thoroughly sanitized, factory reset, and tested across all hardware modules.')

  return `<!--[riazify:condition_details:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #e2e8f0;border-radius:8px;overflow:hidden;background-color:${bgCol};">
  <!-- Top Technical Header -->
  <tr>
    <td style="background-color:#0f172a;padding:10px 18px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <span style="background-color:${accent};color:#ffffff;font-size:9.5px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:2px 7px;border-radius:3px;">
              ${p.headerBadge ?? '30-POINT DIAGNOSTIC AUDIT'}
            </span>
            <span style="color:#ffffff;font-size:13.5px;font-weight:800;margin-left:8px;letter-spacing:0.3px;">
              ${condition}
            </span>
          </td>
          <td align="right" style="color:#22c55e;font-size:10.5px;font-weight:700;font-family:monospace;">
            ${p.statusBadge ?? '[100% OPERATIONAL]'}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- 3 Checkpoints Strip -->
  <tr>
    <td style="background-color:#f8fafc;border-bottom:1px solid #e2e8f0;padding:8px 18px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="33%" style="font-size:11px;font-weight:700;color:#166534;">
            ${p.check1 ?? '✓ Battery &bull; 85%+ Capacity Tested'}
          </td>
          <td width="33%" style="font-size:11px;font-weight:700;color:#166534;text-align:center;">
            ${p.check2 ?? '✓ Screen &bull; Zero Dead Pixels'}
          </td>
          <td width="33%" style="font-size:11px;font-weight:700;color:#166534;text-align:right;">
            ${p.check3 ?? '✓ Reset &bull; Sanitized &amp; Ready'}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Condition Notes Body -->
  <tr>
    <td style="${pad(p, 14, 18, 14, 18)}box-sizing:border-box;">
      <div style="color:#64748b;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">
        EXACT COSMETIC &amp; FUNCTIONAL DISCLOSURE:
      </div>
      <div style="color:${textCol};font-size:13px;line-height:1.6;font-weight:500;">
        ${notes}
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:condition_details:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. COLLECTOR ARCHIVAL 5-TIER GRADING SCALE TRACK
// Visual tier track (Mint, NM, VF, Good, Fair) for comics, cards, coins & vinyl
// ─────────────────────────────────────────────────────────────────────────────
function archivalVintageTier(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#fffdfa')
  const textCol = resolveText(p, '#1c1917')
  const emerald = resolveAccent(p, '#059669')
  const condition = condTitle(p, 'Near Mint (NM 9.0)')
  const notes = condNotes(p, 'Carefully preserved in collector sleeve. Minor edge handling consistent with gentle storage. Spine completely tight with zero splits.')

  return `<!--[riazify:condition_details:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:2px solid #d6d3d1;border-radius:6px;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 14, 16, 14, 16)}box-sizing:border-box;">
      <!-- Title & Archival Tier -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
        <tr>
          <td>
            <span style="color:#78716c;font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">
              COLLECTOR CONDITION APPRAISAL &bull;
            </span>
            <span style="color:${textCol};font-size:15px;font-weight:900;margin-left:6px;">
              ${condition}
            </span>
          </td>
          <td align="right">
            <span style="background-color:#ecfdf5;color:${emerald};border:1px solid #a7f3d0;font-size:10px;font-weight:900;padding:3px 8px;border-radius:3px;">
              ARCHIVAL VERIFIED
            </span>
          </td>
        </tr>
      </table>
      <!-- 5-Step Visual Tier Bar -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #d6d3d1;border-radius:4px;overflow:hidden;margin-bottom:12px;text-align:center;">
        <tr>
          <td width="20%" style="padding:6px;background-color:#f5f5f4;color:#a8a29e;font-size:10px;font-weight:700;border-right:1px solid #d6d3d1;">
            MINT
          </td>
          <td width="20%" style="padding:6px;background-color:${emerald};color:#ffffff;font-size:10px;font-weight:900;border-right:1px solid #d6d3d1;">
            ★ NEAR MINT
          </td>
          <td width="20%" style="padding:6px;background-color:#f5f5f4;color:#78716c;font-size:10px;font-weight:700;border-right:1px solid #d6d3d1;">
            VERY FINE
          </td>
          <td width="20%" style="padding:6px;background-color:#f5f5f4;color:#a8a29e;font-size:10px;font-weight:700;border-right:1px solid #d6d3d1;">
            GOOD
          </td>
          <td width="20%" style="padding:6px;background-color:#f5f5f4;color:#a8a29e;font-size:10px;font-weight:700;">
            FAIR
          </td>
        </tr>
      </table>
      <!-- Flaw & Preservation Ledger -->
      <div style="background-color:#ffffff;border:1px dashed #d6d3d1;border-radius:4px;padding:10px 14px;box-sizing:border-box;">
        <div style="color:#78716c;font-size:9.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:3px;">
          PRESERVATION &amp; FLAW DISCLOSURE:
        </div>
        <div style="color:${textCol};font-size:12.5px;line-height:1.6;font-weight:500;">
          ${notes}
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:condition_details:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. OPEN BOX COMPLETE ACCESSORY VERIFICATION CHECKLIST
// 2-column checklist matrix for customer returns, appliances & unboxed electronics
// ─────────────────────────────────────────────────────────────────────────────
function openBoxInventoryAudit(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#0f172a')
  const accent = resolveAccent(p, '#9333ea')
  const condition = condTitle(p, 'Open Box — 100% Complete & Tested')
  const notes = condNotes(p, 'Customer return in flawless working order. Verified complete with original retail packaging, cables, documentation, and all factory accessories.')

  return `<!--[riazify:condition_details:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #ede9fe;border-radius:8px;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
        <tr>
          <td>
            <span style="background-color:#f5f3ff;color:${accent};font-size:9.5px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:3px 8px;border-radius:3px;">
              📦 OPEN BOX VERIFICATION
            </span>
            <span style="color:${textCol};font-size:15px;font-weight:900;margin-left:8px;vertical-align:middle;">
              ${condition}
            </span>
          </td>
          <td align="right" style="color:#64748b;font-size:11px;font-weight:700;">
            INSPECTED LOT
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Left Column: Accessory Checklist -->
          <td width="38%" valign="top" style="padding-right:12px;box-sizing:border-box;">
            <div style="background-color:#faf5ff;border:1px solid #f3e8ff;border-radius:6px;padding:10px 12px;box-sizing:border-box;">
              <div style="color:${accent};font-size:10px;font-weight:900;letter-spacing:0.5px;margin-bottom:6px;">
                AUDIT CHECKLIST:
              </div>
              <div style="color:#1e1b4b;font-size:11.5px;font-weight:700;line-height:1.8;">
                ${p.check1 ?? '✓ Retail Packaging Present'}<br>
                ${p.check2 ?? '✓ All Cables Included'}<br>
                ${p.check3 ?? '✓ Manuals &amp; Inserts Present'}<br>
                ${p.check4 ?? '✓ No Cosmetic Imperfections'}
              </div>
            </div>
          </td>
          <!-- Right Column: Condition Notes -->
          <td width="62%" valign="top" style="padding-left:4px;box-sizing:border-box;">
            <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px 14px;box-sizing:border-box;">
              <div style="color:#64748b;font-size:9.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">
                CONDITION SUMMARY:
              </div>
              <div style="color:${textCol};font-size:12.5px;line-height:1.6;font-weight:500;">
                ${notes}
              </div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:condition_details:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PRE-OWNED APPAREL & EVERYDAY GOODS HONEST WEAR DISCLOSURE
// Reassuring wear rating score + friendly disclosure callout to eliminate disputes
// ─────────────────────────────────────────────────────────────────────────────
function honestWearTransparency(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#0f172a')
  const amber = resolveAccent(p, '#f59e0b')
  const condition = condTitle(p, 'Excellent Pre-Owned Condition')
  const notes = condNotes(p, 'Gently worn 2-3 times with excellent fabric integrity. No stains, pulls, tears, or loose stitching. Stored in a smoke-free, pet-free home environment.')

  return `<!--[riazify:condition_details:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #fed7aa;border-radius:8px;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
        <tr>
          <td>
            <span style="background-color:#fff7ed;color:#c2410c;font-size:9.5px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:3px 8px;border-radius:3px;">
              🔍 TRANSPARENT WEAR REPORT
            </span>
            <span style="color:${textCol};font-size:15px;font-weight:900;margin-left:8px;vertical-align:middle;">
              ${condition}
            </span>
          </td>
          <td align="right">
            <span style="background-color:#f0fdf4;border:1px solid #bbf7d0;color:#166534;font-size:10px;font-weight:800;padding:3px 8px;border-radius:3px;">
              ${p.ratingBadge ?? 'RATING: 9 / 10'}
            </span>
          </td>
        </tr>
      </table>
      <!-- Quoted Honest Disclosure Box -->
      <div style="background-color:#fffaf5;border-left:3px solid ${amber};border-radius:4px;padding:12px 16px;box-sizing:border-box;">
        <div style="color:#9a3412;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:3px;">
          HONEST SELLER DISCLOSURE &amp; INSPECTION NOTES:
        </div>
        <div style="color:${textCol};font-size:13px;line-height:1.6;font-weight:500;">
          "${notes}"
        </div>
        <div style="color:#78716c;font-size:11px;margin-top:6px;font-style:italic;">
          ${p.laundryNote ?? '✓ Fully laundered and sanitized according to manufacturer garment standards.'}
        </div>
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:condition_details:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. SALVAGE / PARTS & REPAIR INDUSTRIAL HAZARD WARNING DOSSIER
// Amber & slate hazard warning card for defective electronics & project lots
// ─────────────────────────────────────────────────────────────────────────────
function partsRepairWarning(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#1e293b')
  const textCol = resolveText(p, '#f8fafc')
  const amber = resolveAccent(p, '#f59e0b')
  const condition = condTitle(p, 'For Parts or Not Working')
  const notes = condNotes(p, 'Device powers on but displays blinking error code E-04. Sold strictly as-is for spare components, teardown, or repair projects. No returns accepted for stated defects.')

  return `<!--[riazify:condition_details:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:2px solid #334155;border-radius:8px;overflow:hidden;background-color:${bgCol};">
  <!-- Top Warning Ribbon -->
  <tr>
    <td style="background-color:#b45309;padding:8px 16px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <span style="color:#ffffff;font-size:11.5px;font-weight:900;letter-spacing:1px;font-family:Arial,sans-serif;">
              ${p.warningBanner ?? '⚠ AS-IS SALVAGE NOTICE &bull; FOR PARTS / REPAIR ONLY'}
            </span>
          </td>
          <td align="right" style="color:#fef3c7;font-size:10px;font-weight:700;font-family:monospace;">
            ${p.statusBadge ?? 'NON-FUNCTIONING'}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Content Body -->
  <tr>
    <td style="${pad(p, 14, 18, 14, 18)}box-sizing:border-box;">
      <div style="color:${amber};font-size:15px;font-weight:900;margin-bottom:6px;">
        ${condition}
      </div>
      <!-- Defect Diagnosis Box -->
      <div style="background-color:#0f172a;border:1px solid #334155;border-left:3px solid #dc2626;border-radius:4px;padding:10px 14px;margin-bottom:8px;box-sizing:border-box;">
        <div style="color:#f87171;font-size:10px;font-weight:800;letter-spacing:1px;font-family:monospace;margin-bottom:3px;">
          [DIAGNOSED DEFECTS &amp; SALVAGE DISCLOSURE]:
        </div>
        <div style="color:${textCol};font-size:12.5px;line-height:1.5;font-weight:500;">
          ${notes}
        </div>
      </div>
      <div style="color:#94a3b8;font-size:11px;font-family:monospace;">
        ${p.disclaimer ?? '* By bidding or purchasing, you acknowledge this unit requires technical repair or parts harvesting.'}
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:condition_details:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. HAUTE HORLOGERIE & ESTATE JEWELRY CURATOR ASSESSMENT
// Obsidian with double 18k champagne gold hairline plaque frame & Roman pillars
// ─────────────────────────────────────────────────────────────────────────────
function jewelerCuratorProvenance(p: any, id: string): string {
  const f = font(p, 'Georgia, Garamond, serif')
  const bgCol = resolveBg(p, '#09090b')
  const textCol = resolveText(p, '#fafafa')
  const gold = resolveAccent(p, '#d4af37')
  const condition = condTitle(p, 'Near Mint Collector Grade')
  const notes = condNotes(p, 'Case and bezel retain sharp factory bevels with no deep scratches or dings. Dial and indices 100% original. Movement tested on timegrapher keeping accurate timing.')

  return `<!--[riazify:condition_details:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:2px solid ${gold};border-radius:8px;background-color:${bgCol};box-shadow:0 4px 18px rgba(0,0,0,0.4);">
  <tr>
    <td style="padding:4px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid rgba(212,175,55,0.4);border-radius:4px;padding:16px 20px;">
        <!-- Plaque Title -->
        <tr>
          <td style="text-align:center;padding-bottom:10px;">
            <div style="color:${gold};font-size:9.5px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;font-family:Arial,sans-serif;">
              ✦ MASTER CURATOR CONDITION APPRAISAL ✦
            </div>
            <div style="color:#ffffff;font-size:18px;font-weight:400;margin-top:4px;">
              ${condition}
            </div>
            <div style="color:${gold};font-size:10px;margin-top:4px;">
              ─── ◆ ───
            </div>
          </td>
        </tr>
        <!-- Appraisal Ledger Text -->
        <tr>
          <td style="background-color:#141416;border:1px solid #27272a;border-radius:4px;padding:12px 16px;">
            <div style="color:${textCol};font-size:13px;line-height:1.7;font-weight:400;">
              ${notes}
            </div>
            <div style="margin-top:8px;padding-top:8px;border-top:1px solid #27272a;color:#a1a1aa;font-size:10.5px;font-family:Arial,sans-serif;">
              ${p.auditNote ?? 'Audited under 10x binocular magnification by certified specialist.'}
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:condition_details:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. AUTO PARTS & MECHANICAL COMPONENT INSPECTION PLAQUE
// Industrial workshop plaque with 3-column physical assessment metrics
// ─────────────────────────────────────────────────────────────────────────────
function automotiveCoreFitment(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#0f172a')
  const textCol = resolveText(p, '#f8fafc')
  const amber = resolveAccent(p, '#f59e0b')
  const condition = condTitle(p, 'Tested OEM Used — Excellent Functionality')
  const notes = condNotes(p, 'Removed from low-mileage donor vehicle. Thoroughly inspected for structural integrity with zero cracks, stripped threads, or fluid leaks.')

  return `<!--[riazify:condition_details:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:2px solid #1e293b;border-radius:8px;overflow:hidden;background-color:${bgCol};">
  <!-- Mechanical Header Bar -->
  <tr>
    <td style="background-color:#1e293b;padding:8px 16px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <span style="color:${amber};font-size:10px;font-weight:900;letter-spacing:1px;font-family:monospace;">
              ⚙ MECHANICAL COMPONENT AUDIT &bull;
            </span>
            <span style="color:#ffffff;font-size:13.5px;font-weight:800;margin-left:6px;">
              ${condition}
            </span>
          </td>
          <td align="right" style="color:#22c55e;font-size:10px;font-family:monospace;font-weight:700;">
            ${p.benchStatus ?? 'BENCH TESTED: 100% OK'}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- 3 Physical Assessment Metrics -->
  <tr>
    <td style="background-color:#090d16;border-bottom:1px solid #1e293b;padding:8px 16px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="33%" style="color:#94a3b8;font-size:10.5px;font-family:monospace;">
            ${p.metric1 ?? '[1] HOUSING: INTACT'}
          </td>
          <td width="33%" style="color:#94a3b8;font-size:10.5px;font-family:monospace;text-align:center;">
            ${p.metric2 ?? '[2] MOUNTS: ZERO CRACKS'}
          </td>
          <td width="33%" style="color:#94a3b8;font-size:10.5px;font-family:monospace;text-align:right;">
            ${p.metric3 ?? '[3] OEM FIT: DIRECT BOLT-ON'}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Workshop Notes -->
  <tr>
    <td style="${pad(p, 14, 16, 14, 16)}box-sizing:border-box;">
      <div style="color:${textCol};font-size:12.5px;line-height:1.6;">
        ${notes}
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:condition_details:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. SCANDINAVIAN MINIMALIST STUDIO WEAR LEDGER
// Architectural whitespace with whisper-thin hairlines for designer furniture & decor
// ─────────────────────────────────────────────────────────────────────────────
function scandinavianMinimalLedger(p: any, id: string): string {
  const f = font(p, 'Georgia, serif')
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#18181b')
  const accent = resolveAccent(p, '#71717a')
  const condition = condTitle(p, 'Pristine Studio Condition')
  const notes = condNotes(p, 'Exhibition display piece with virtually zero signs of handling. Materials retain original matte texture and finish.')

  return `<!--[riazify:condition_details:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:1px solid #e4e4e7;border-radius:8px;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 18, 24, 18, 24)}box-sizing:border-box;">
      <div style="border-bottom:1px solid #18181b;padding-bottom:8px;margin-bottom:10px;">
        <span style="font-family:Arial,sans-serif;color:${accent};font-size:9.5px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">
          CONDITION LEDGER &bull;
        </span>
        <span style="font-family:Arial,sans-serif;color:${textCol};font-size:14.5px;font-weight:700;margin-left:6px;">
          ${condition}
        </span>
      </div>
      <div style="color:${textCol};font-size:14px;line-height:1.7;font-weight:400;margin-bottom:10px;">
        ${notes}
      </div>
      <div style="font-family:Arial,sans-serif;color:${accent};font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
        ${p.auditBadge ?? '✓ AUDITED &bull; SMOKE-FREE ENVIRONMENT'}
      </div>
    </td>
  </tr>
</table>
<!--[/riazify:condition_details:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. HIGH-DENSITY MOBILE THUMB-SCAN STRIP
// Triple-check horizontal inspection capsule strip with full-width notes card
// ─────────────────────────────────────────────────────────────────────────────
function mobileCompactBadgeStrip(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#0f172a')
  const blue = resolveAccent(p, '#2563eb')
  const emerald = '#16a34a'
  const condition = condTitle(p, 'Brand New & Sealed')
  const notes = condNotes(p, 'Unopened retail package with intact factory seals. 100% manufacturer warranty included.')

  return `<!--[riazify:condition_details:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #e2e8f0;border-radius:8px;background-color:${bgCol};box-shadow:0 2px 8px rgba(0,0,0,0.04);">
  <tr>
    <td style="${pad(p, 14, 18, 14, 18)}box-sizing:border-box;">
      <!-- Header Capsule Line -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
        <tr>
          <td align="left" valign="middle">
            <span style="display:inline-block;padding:4px 10px;background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:20px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:${blue};letter-spacing:0.5px;text-transform:uppercase;">
              ✓ VERIFIED CONDITION
            </span>
            <span style="display:inline-block;margin-left:8px;font-family:Arial,sans-serif;font-size:15px;font-weight:900;color:${textCol};">
              ${condition}
            </span>
          </td>
          <td align="right" valign="middle">
            <span style="display:inline-block;padding:3px 8px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#64748b;letter-spacing:0.5px;">
              ID: EB-${id.slice(0, 6).toUpperCase()} &bull; 100% AUDITED
            </span>
          </td>
        </tr>
      </table>

      <!-- 3-Chip Inspection Matrix -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
        <tr>
          <td width="32%" style="padding:8px 10px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;box-sizing:border-box;">
            <div style="font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">
              ${p.chip1Label ?? 'PHYSICAL HOUSING'}
            </div>
            <div style="font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:${textCol};margin-top:2px;">
              ${p.chip1Value ?? 'Pristine Condition'}
            </div>
          </td>
          <td width="2%"></td>
          <td width="32%" style="padding:8px 10px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;box-sizing:border-box;">
            <div style="font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">
              ${p.chip2Label ?? 'FUNCTIONAL CHECK'}
            </div>
            <div style="font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:${emerald};margin-top:2px;">
              ${p.chip2Value ?? '100% Tested Working'}
            </div>
          </td>
          <td width="2%"></td>
          <td width="32%" style="padding:8px 10px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;box-sizing:border-box;">
            <div style="font-family:Arial,sans-serif;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">
              ${p.chip3Label ?? 'ACCESSORIES'}
            </div>
            <div style="font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:${textCol};margin-top:2px;">
              ${p.chip3Value ?? 'Complete Retail Set'}
            </div>
          </td>
        </tr>
      </table>

      <!-- Full-Width Notes Card with Left Blue Accent -->
      <div style="padding:10px 14px;background-color:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid ${blue};border-radius:0 6px 6px 0;margin-bottom:8px;">
        <div style="font-family:Arial,sans-serif;font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:3px;">
          SELLER INSPECTION &amp; CONDITION NOTES
        </div>
        <div style="font-family:${f};font-size:12px;line-height:1.6;color:${textCol};font-weight:500;">
          ${notes}
        </div>
      </div>

      <!-- Bottom Micro Reassurance -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="left">
            <span style="font-family:Arial,sans-serif;font-size:10px;color:#94a3b8;font-weight:600;">
              🛡️ Hand-inspected prior to secure dispatch &bull; Packaged in anti-static wrap
            </span>
          </td>
          <td align="right">
            <span style="font-family:Arial,sans-serif;font-size:10px;color:${blue};font-weight:700;">
              ZERO-SURPRISE GUARANTEE
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:condition_details:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Thumbnail Representations for Visual Editor Carousel & Panels
// (Exact match for viewBox="0 0 80 48" style={{ width: '100%', height: 36 }})
// ─────────────────────────────────────────────────────────────────────────────
export const CONDITION_DETAILS_THUMBNAILS: Record<string, string> = {
  'cd-cosmetic-grade-split': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="5" y="4" width="28" height="3.5" rx="0.5" fill="#1e1535"/>
    <rect x="36" y="4" width="20" height="3.5" rx="0.5" fill="#7530fb"/>
    {/* Left 30% Green Cosmetic Grade Box */}
    <rect x="5" y="12" width="22" height="30" rx="3" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="0.8"/>
    <rect x="8" y="16" width="16" height="2" fill="#166534"/>
    <text x="16" y="27" font-size="8" fill="#16a34a" text-anchor="middle">★★★★★</text>
    {/* Right 66% Notes Box */}
    <rect x="30" y="12" width="45" height="30" rx="3" fill="#f8f7ff" stroke="#ede9fe" stroke-width="0.8"/>
    <line x1="34" y1="18" x2="71" y2="18" stroke="#1f1d2e" stroke-width="1.2"/>
    <line x1="34" y1="24" x2="68" y2="24" stroke="#64748b" stroke-width="1.2"/>
    <line x1="34" y1="30" x2="60" y2="30" stroke="#64748b" stroke-width="1.2"/>
  </svg>`,

  'cd-certified-refurb-diagnostic': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect width="80" height="9" fill="#0f172a"/>
    <rect x="4" y="2.5" width="26" height="4" rx="1" fill="#2563eb"/>
    <rect x="33" y="3.5" width="30" height="2" fill="#ffffff"/>
    <circle cx="75" cy="4.5" r="1.5" fill="#22c55e"/>
    <rect x="0" y="9" width="80" height="7" fill="#f8fafc"/>
    <line x1="0" y1="16" x2="80" y2="16" stroke="#e2e8f0" stroke-width="0.8"/>
    <circle cx="6" cy="12.5" r="1" fill="#166534"/>
    <circle cx="32" cy="12.5" r="1" fill="#166534"/>
    <circle cx="58" cy="12.5" r="1" fill="#166534"/>
    <rect x="4" y="20" width="22" height="2" fill="#64748b"/>
    <line x1="4" y1="26" x2="76" y2="26" stroke="#0f172a" stroke-width="1.4"/>
    <line x1="4" y1="32" x2="72" y2="32" stroke="#64748b" stroke-width="1.4"/>
    <line x1="4" y1="38" x2="58" y2="38" stroke="#64748b" stroke-width="1.4"/>
  </svg>`,

  'cd-archival-vintage-tier': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#fffdfa" stroke="#d6d3d1" stroke-width="1"/>
    <rect x="4" y="3" width="24" height="3" fill="#78716c"/>
    <rect x="30" y="3" width="28" height="3" fill="#1c1917"/>
    <rect x="62" y="2.5" width="14" height="4" rx="1" fill="#059669"/>
    {/* 5-Step Scale Bar */}
    <rect x="4" y="9" width="72" height="7" fill="#f5f5f4" stroke="#d6d3d1" stroke-width="0.6"/>
    <rect x="18" y="9" width="15" height="7" fill="#059669"/>
    <line x1="18" y1="9" x2="18" y2="16" stroke="#d6d3d1" stroke-width="0.6"/>
    <line x1="33" y1="9" x2="33" y2="16" stroke="#d6d3d1" stroke-width="0.6"/>
    <line x1="48" y1="9" x2="48" y2="16" stroke="#d6d3d1" stroke-width="0.6"/>
    <line x1="63" y1="9" x2="63" y2="16" stroke="#d6d3d1" stroke-width="0.6"/>
    {/* Notes Box */}
    <rect x="4" y="19" width="72" height="24" rx="2" fill="#ffffff" stroke="#d6d3d1" stroke-dasharray="2 1" stroke-width="0.8"/>
    <line x1="8" y1="25" x2="68" y2="25" stroke="#1c1917" stroke-width="1.2"/>
    <line x1="8" y1="31" x2="64" y2="31" stroke="#78716c" stroke-width="1.2"/>
    <line x1="8" y1="37" x2="52" y2="37" stroke="#78716c" stroke-width="1.2"/>
  </svg>`,

  'cd-open-box-inventory-audit': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#ede9fe" stroke-width="1"/>
    <rect x="4" y="3" width="22" height="3.5" rx="1" fill="#9333ea"/>
    <rect x="29" y="3" width="34" height="3.5" rx="0.5" fill="#0f172a"/>
    {/* Left Checklist */}
    <rect x="4" y="10" width="27" height="33" rx="2" fill="#faf5ff" stroke="#f3e8ff" stroke-width="0.8"/>
    <circle cx="8" cy="15" r="1.2" fill="#9333ea"/>
    <line x1="12" y1="15" x2="26" y2="15" stroke="#1e1b4b" stroke-width="1"/>
    <circle cx="8" cy="22" r="1.2" fill="#9333ea"/>
    <line x1="12" y1="22" x2="26" y2="22" stroke="#1e1b4b" stroke-width="1"/>
    <circle cx="8" cy="29" r="1.2" fill="#9333ea"/>
    <line x1="12" y1="29" x2="26" y2="29" stroke="#1e1b4b" stroke-width="1"/>
    <circle cx="8" cy="36" r="1.2" fill="#9333ea"/>
    <line x1="12" y1="36" x2="26" y2="36" stroke="#1e1b4b" stroke-width="1"/>
    {/* Right Notes */}
    <rect x="34" y="10" width="42" height="33" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="38" y1="16" x2="72" y2="16" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="38" y1="22" x2="70" y2="22" stroke="#64748b" stroke-width="1.2"/>
    <line x1="38" y1="28" x2="66" y2="28" stroke="#64748b" stroke-width="1.2"/>
    <line x1="38" y1="34" x2="56" y2="34" stroke="#64748b" stroke-width="1.2"/>
  </svg>`,

  'cd-honest-wear-transparency': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#fed7aa" stroke-width="1"/>
    <rect x="4" y="3" width="22" height="3" rx="1" fill="#ffedd5"/>
    <rect x="28" y="3" width="30" height="3" fill="#0f172a"/>
    <rect x="62" y="2.5" width="14" height="4" rx="1" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="0.6"/>
    {/* Quoted Callout Box */}
    <rect x="4" y="10" width="72" height="33" rx="2" fill="#fffaf5"/>
    <line x1="4" y1="10" x2="4" y2="43" stroke="#f59e0b" stroke-width="2"/>
    <rect x="8" y="14" width="28" height="2" fill="#c2410c"/>
    <line x1="8" y1="20" x2="70" y2="20" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="8" y1="26" x2="68" y2="26" stroke="#475569" stroke-width="1.2"/>
    <line x1="8" y1="32" x2="58" y2="32" stroke="#475569" stroke-width="1.2"/>
    <line x1="8" y1="38" x2="44" y2="38" stroke="#166534" stroke-width="1"/>
  </svg>`,

  'cd-parts-repair-warning': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <rect width="80" height="8" fill="#b45309"/>
    <path d="M4 6L6 2.5H2L4 6Z" fill="#ffffff"/>
    <rect x="9" y="3" width="40" height="2.5" fill="#ffffff"/>
    <rect x="4" y="12" width="32" height="3" fill="#f59e0b"/>
    {/* Red Bordered Defect Box */}
    <rect x="4" y="18" width="72" height="22" rx="2" fill="#0f172a" stroke="#334155" stroke-width="0.8"/>
    <line x1="4" y1="18" x2="4" y2="40" stroke="#dc2626" stroke-width="2"/>
    <rect x="8" y="21" width="26" height="2" fill="#f87171"/>
    <line x1="8" y1="27" x2="70" y2="27" stroke="#f8fafc" stroke-width="1.2"/>
    <line x1="8" y1="33" x2="60" y2="33" stroke="#94a3b8" stroke-width="1.2"/>
    <line x1="4" y1="44" x2="54" y2="44" stroke="#94a3b8" stroke-width="0.8"/>
  </svg>`,

  'cd-jeweler-curator-provenance': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#09090b" stroke="#d4af37" stroke-width="1"/>
    <rect x="2" y="2" width="76" height="44" rx="2" stroke="#d4af37" stroke-width="0.5" stroke-opacity="0.4"/>
    <rect x="22" y="5" width="36" height="2" fill="#d4af37"/>
    <rect x="18" y="9" width="44" height="3.5" fill="#ffffff"/>
    <circle cx="40" cy="15" r="1" fill="#d4af37"/>
    {/* Inner Box */}
    <rect x="5" y="19" width="70" height="23" rx="2" fill="#141416" stroke="#27272a" stroke-width="0.8"/>
    <line x1="9" y1="24" x2="71" y2="24" stroke="#fafafa" stroke-width="1.2"/>
    <line x1="9" y1="30" x2="66" y2="30" stroke="#a1a1aa" stroke-width="1.2"/>
    <line x1="9" y1="36" x2="48" y2="36" stroke="#d4af37" stroke-width="0.8"/>
  </svg>`,

  'cd-automotive-core-fitment': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#0f172a" stroke="#1e3a5f" stroke-width="1"/>
    <rect width="80" height="8" fill="#1e293b"/>
    <rect x="4" y="2.5" width="22" height="3" fill="#f59e0b"/>
    <rect x="28" y="2.5" width="34" height="3" fill="#ffffff"/>
    <circle cx="75" cy="4" r="1.2" fill="#22c55e"/>
    {/* 3 Metrics Strip */}
    <rect x="0" y="8" width="80" height="7" fill="#090d16"/>
    <line x1="0" y1="15" x2="80" y2="15" stroke="#1e293b" stroke-width="0.8"/>
    <rect x="4" y="11" width="18" height="2" fill="#94a3b8"/>
    <rect x="30" y="11" width="18" height="2" fill="#94a3b8"/>
    <rect x="56" y="11" width="18" height="2" fill="#94a3b8"/>
    {/* Notes */}
    <line x1="4" y1="22" x2="76" y2="22" stroke="#f8fafc" stroke-width="1.2"/>
    <line x1="4" y1="29" x2="70" y2="29" stroke="#94a3b8" stroke-width="1.2"/>
    <line x1="4" y1="36" x2="52" y2="36" stroke="#94a3b8" stroke-width="1.2"/>
  </svg>`,

  'cd-scandinavian-minimal-ledger': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e4e4e7" stroke-width="1"/>
    <rect x="5" y="5" width="24" height="2.5" fill="#71717a"/>
    <rect x="32" y="5" width="28" height="2.5" fill="#18181b"/>
    <line x1="5" y1="11" x2="75" y2="11" stroke="#18181b" stroke-width="1"/>
    <line x1="5" y1="18" x2="75" y2="18" stroke="#18181b" stroke-width="1.2"/>
    <line x1="5" y1="25" x2="72" y2="25" stroke="#52525b" stroke-width="1.2"/>
    <line x1="5" y1="32" x2="60" y2="32" stroke="#52525b" stroke-width="1.2"/>
    <rect x="5" y="40" width="30" height="2" fill="#71717a"/>
  </svg>`,

  'cd-mobile-compact-badge-strip': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    {/* Top Header Capsule Line */}
    <rect x="4" y="4" width="28" height="5" rx="2.5" fill="#2563eb"/>
    <rect x="35" y="4" width="41" height="5" rx="2.5" fill="#f1f5f9"/>
    {/* 3 Inspection Metric Chips */}
    <rect x="4" y="12" width="22" height="11" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.7"/>
    <rect x="7" y="14.5" width="16" height="2" fill="#64748b"/>
    <rect x="7" y="18" width="12" height="2.5" fill="#0f172a"/>
    <rect x="29" y="12" width="22" height="11" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.7"/>
    <rect x="32" y="14.5" width="16" height="2" fill="#64748b"/>
    <rect x="32" y="18" width="12" height="2.5" fill="#16a34a"/>
    <rect x="54" y="12" width="22" height="11" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.7"/>
    <rect x="57" y="14.5" width="16" height="2" fill="#64748b"/>
    <rect x="57" y="18" width="12" height="2.5" fill="#0f172a"/>
    {/* Full-Width Notes Card with Left Accent Border */}
    <rect x="4" y="26" width="72" height="18" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.7"/>
    <line x1="4" y1="26" x2="4" y2="44" stroke="#2563eb" stroke-width="2"/>
    <line x1="9" y1="31" x2="68" y2="31" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="9" y1="36" x2="55" y2="36" stroke="#64748b" stroke-width="1.2"/>
    <line x1="9" y1="40.5" x2="35" y2="40.5" stroke="#94a3b8" stroke-width="0.8"/>
  </svg>`,
}

export function getConditionDetailsThumbnailSvg(id: string): string {
  const clean = id
    .toLowerCase()
    .trim()
    .replace(/^cd[-_]/, '')
    .replace(/_/g, '-')

  const key = Object.keys(CONDITION_DETAILS_THUMBNAILS).find(k => {
    const kClean = k.toLowerCase().replace(/^cd[-_]/, '').replace(/_/g, '-')
    return k === id || kClean === clean || k.endsWith(clean) || clean.includes(kClean)
  })

  return key ? CONDITION_DETAILS_THUMBNAILS[key] : CONDITION_DETAILS_THUMBNAILS['cd-cosmetic-grade-split']
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported Variant Registry (All 10 Radically Distinct Architectures)
// ─────────────────────────────────────────────────────────────────────────────
export const conditionDetailsVariants: BlockVariant[] = [
  {
    id: 'cd-cosmetic-grade-split',
    label: 'Cosmetic Grade Stars Split',
    description: 'Classic 30/70 split: cosmetic grade stars box + condition disclosure notes',
    thumbnail: CONDITION_DETAILS_THUMBNAILS['cd-cosmetic-grade-split'],
    toHtml(props, id) { return cosmeticGradeSplit(props, id) },
  },
  {
    id: 'cd-certified-refurb-diagnostic',
    label: 'Certified Refurb Diagnostic',
    description: 'Certified Tech Refurbishment & Multi-Point Diagnostic Audit with battery/screen pass',
    thumbnail: CONDITION_DETAILS_THUMBNAILS['cd-certified-refurb-diagnostic'],
    toHtml(props, id) { return certifiedRefurbDiagnostic(props, id) },
  },
  {
    id: 'cd-archival-vintage-tier',
    label: 'Collector Archival Tier Scale',
    description: 'Visual 5-step grading scale (Mint, NM, VF, Good, Fair) for cards, vinyl & comics',
    thumbnail: CONDITION_DETAILS_THUMBNAILS['cd-archival-vintage-tier'],
    toHtml(props, id) { return archivalVintageTier(props, id) },
  },
  {
    id: 'cd-open-box-inventory-audit',
    label: 'Open Box Inventory Audit',
    description: 'Open Box complete accessory audit & inspection checklist for customer returns',
    thumbnail: CONDITION_DETAILS_THUMBNAILS['cd-open-box-inventory-audit'],
    toHtml(props, id) { return openBoxInventoryAudit(props, id) },
  },
  {
    id: 'cd-honest-wear-transparency',
    label: 'Honest Wear Transparency',
    description: 'Pre-owned apparel & second-hand honest wear rating & friendly flaw callout',
    thumbnail: CONDITION_DETAILS_THUMBNAILS['cd-honest-wear-transparency'],
    toHtml(props, id) { return honestWearTransparency(props, id) },
  },
  {
    id: 'cd-parts-repair-warning',
    label: 'Salvage / Parts & Repair Warning',
    description: 'Amber industrial hazard warning card for defective electronics & mechanic parts',
    thumbnail: CONDITION_DETAILS_THUMBNAILS['cd-parts-repair-warning'],
    toHtml(props, id) { return partsRepairWarning(props, id) },
  },
  {
    id: 'cd-jeweler-curator-provenance',
    label: 'Jeweler Curator Appraisal',
    description: 'Haute horlogerie & estate jewelry curator appraisal with 18k gold rules',
    thumbnail: CONDITION_DETAILS_THUMBNAILS['cd-jeweler-curator-provenance'],
    toHtml(props, id) { return jewelerCuratorProvenance(props, id) },
  },
  {
    id: 'cd-automotive-core-fitment',
    label: 'Automotive Mechanical Audit',
    description: 'Used car parts & mechanical component inspection plaque with OEM fitment checks',
    thumbnail: CONDITION_DETAILS_THUMBNAILS['cd-automotive-core-fitment'],
    toHtml(props, id) { return automotiveCoreFitment(props, id) },
  },
  {
    id: 'cd-scandinavian-minimal-ledger',
    label: 'Scandinavian Minimal Ledger',
    description: 'Architectural whitespace & hairline wear ledger for designer decor & furniture',
    thumbnail: CONDITION_DETAILS_THUMBNAILS['cd-scandinavian-minimal-ledger'],
    toHtml(props, id) { return scandinavianMinimalLedger(props, id) },
  },
  {
    id: 'cd-mobile-compact-badge-strip',
    label: 'Mobile Condition Capsule Strip',
    description: 'Triple-check horizontal inspection capsule strip with full-width notes card for mobile phones',
    thumbnail: CONDITION_DETAILS_THUMBNAILS['cd-mobile-compact-badge-strip'],
    toHtml(props, id) { return mobileCompactBadgeStrip(props, id) },
  },
]

// Backwards-compatible aliases
export const detailsVariants = conditionDetailsVariants

/**
 * Robust Variant Resolver:
 * Supports variant IDs with or without the 'cd-' prefix
 * and matches shorthand IDs seamlessly.
 */
export function getConditionDetailsVariant(id: string): BlockVariant {
  if (!id) return conditionDetailsVariants[0]
  const clean = id
    .toLowerCase()
    .trim()
    .replace(/^cd[-_]/, '')
    .replace(/_/g, '-')

  const match = conditionDetailsVariants.find(v => {
    const vClean = v.id.toLowerCase().replace(/^cd[-_]/, '').replace(/_/g, '-')
    return (
      v.id === id ||
      vClean === clean ||
      v.id.endsWith(clean) ||
      clean.includes(vClean) ||
      vClean.includes(clean)
    )
  })

  return match ?? conditionDetailsVariants[0]
}
