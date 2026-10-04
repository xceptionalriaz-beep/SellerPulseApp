// components/ui/VisualEditor/variants/authenticity_guarantee.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Authenticity Guarantee — 10 Radically Distinct, High-Converting Retail Layouts
// Built specifically for high-converting eBay & e-commerce listings.
// Zero generic AI-slop, zero cheesy glassmorphism, zero fake neon glows.
// 100% authentic, tangible, battle-tested retail architectures that buyers trust.
//
// 1. auth-ebay-blue-official-shield   — Institutional eBay Royal Blue verified shield & trust pill bar
// 2. auth-luxury-atelier-wax-seal     — Atelier Obsidian & 24K Gold Provenance Plaque with Roman cards
// 3. auth-sneaker-streetwear-pass     — Streetwear & Sneaker Hype Tag with volt lime accents & barcode
// 4. auth-security-tamper-evident     — Tamper-evident holographic security ribbon for tech & sealed goods
// 5. auth-psa-graded-slab-vault       — PSA / BGS collector graded slab label for cards, comics & coins
// 6. auth-manufacturer-oem-seal       — Industrial OEM factory-direct pedigree plaque for auto & tools
// 7. auth-swiss-minimalist-dossier    — Asymmetrical Scandinavian minimalist editorial hairline manifesto
// 8. auth-triple-badge-crest-matrix   — 3-pillar visual shield matrix (Direct, Inspected, Money-Back)
// 9. auth-vintage-notary-parchment    — Warm aged notary provenance certificate with crimson seal & signature
// 10. auth-sports-memorabilia-holotag — Stadium dark navy autographed memorabilia hologram security pass
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
  id: string
  label: string
  description: string
  thumbnail?: string
  toHtml: (props: any, id: string) => string
}

// ─── Shared Helpers & Dynamic Resolvers ─────────────────────────────────────
function pad(p: any, defaultT = 18, defaultR = 24, defaultB = 18, defaultL = 24): string {
  const top = p.paddingTop ?? defaultT
  const right = p.paddingRight ?? defaultR
  const bottom = p.paddingBottom ?? defaultB
  const left = p.paddingLeft ?? defaultL
  return `padding:${top}px ${right}px ${bottom}px ${left}px;`
}

function font(p: any, defaultFamily = 'Arial, Helvetica, sans-serif'): string {
  return p.fontFamily ? `${p.fontFamily}, Arial, sans-serif` : defaultFamily
}

function authTitle(p: any, fallback = '100% Authenticity Guaranteed'): string {
  return p.heading ?? p.title ?? p.authTitle ?? p.bannerTitle ?? fallback
}

function authSubtext(
  p: any,
  fallback = 'Every item verified genuine. Sourced directly from authorised distributors.'
): string {
  return p.subText ?? p.subtitle ?? p.authSubtext ?? p.description ?? fallback
}

interface AuthPoint {
  title: string
  sub?: string
}

function getPoints(p: any): AuthPoint[] {
  if (Array.isArray(p.points) && p.points.length > 0) {
    return p.points.map((pt: any) =>
      typeof pt === 'string' ? { title: pt } : { title: pt.title ?? pt.text ?? 'Verified', sub: pt.sub }
    )
  }
  if (Array.isArray(p.items) && p.items.length > 0) {
    return p.items.map((it: any) =>
      typeof it === 'string' ? { title: it } : { title: it.title ?? it.text ?? 'Verified', sub: it.sub }
    )
  }
  return [
    { title: 'Official Supplier', sub: 'Direct authorized pipeline' },
    { title: 'Anti-counterfeit Checked', sub: 'Multi-point inspection' },
    { title: 'Money Back Guarantee', sub: '100% complete refund protection' },
  ]
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
// 1. EBAY BLUE VERIFIED AUTHORITY SHIELD
// Official institutional Royal Blue frame with certification shield & trust pills
// ─────────────────────────────────────────────────────────────────────────────
function ebayBlueOfficialShield(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#0053a0')
  const textCol = resolveText(p, '#ffffff')
  const accent = resolveAccent(p, '#38bdf8')
  const title = authTitle(p, '100% AUTHENTICITY GUARANTEED')
  const sub = authSubtext(p, 'Every item verified genuine. Sourced directly from authorised distributors.')
  const points = getPoints(p)

  const pillsHtml = points.map(pt => {
    return `<td align="center" style="padding:4px 6px;">
      <div style="background-color:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);border-radius:999px;padding:6px 14px;box-sizing:border-box;white-space:nowrap;">
        <span style="color:${accent};font-size:12px;font-weight:900;margin-right:5px;">✓</span>
        <span style="color:#ffffff;font-size:12px;font-weight:700;letter-spacing:0.2px;">${pt.title}</span>
      </div>
    </td>`
  }).join('')

  return `<!--[riazify:authenticity_guarantee:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:100%;box-sizing:border-box;font-family:${f};border-collapse:collapse;margin:0 auto;border-radius:10px;overflow:hidden;background-color:${bgCol};box-shadow:0 4px 14px rgba(0,83,160,0.18);">
  <tr>
    <td style="${pad(p, 20, 24, 20, 24)}text-align:center;box-sizing:border-box;">
      <!-- Shield Emblem & Category Tag -->
      <div style="margin-bottom:8px;">
        <div style="display:inline-block;width:38px;height:38px;border-radius:50%;background-color:rgba(255,255,255,0.15);border:1.5px solid rgba(255,255,255,0.4);text-align:center;line-height:36px;font-size:20px;color:#ffffff;margin-bottom:6px;">
          🛡
        </div>
        <div style="color:${accent};font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">
          VERIFIED RETAIL PEDIGREE
        </div>
      </div>
      <!-- Heading -->
      <div style="color:${textCol};font-size:20px;font-weight:900;letter-spacing:0.5px;margin-bottom:6px;">
        ${title}
      </div>
      <!-- Subtitle -->
      <div style="color:rgba(255,255,255,0.85);font-size:13px;line-height:1.5;max-width:640px;margin:0 auto 16px auto;">
        ${sub}
      </div>
      <!-- 3 Pill Trust Bar -->
      <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;max-width:100%;">
        <tr>
          ${pillsHtml}
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:authenticity_guarantee:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ATELIER OBSIDIAN & 24K GOLD PROVENANCE PLAQUE
// Haute horlogerie & designer dossier frame with Roman-numeral provenance pillars
// ─────────────────────────────────────────────────────────────────────────────
function luxuryAtelierWaxSeal(p: any, id: string): string {
  const f = font(p, 'Georgia, Garamond, serif')
  const bgCol = resolveBg(p, '#09090b')
  const textCol = resolveText(p, '#fafafa')
  const gold = resolveAccent(p, '#d4af37')
  const title = authTitle(p, 'ATELIER PROVENANCE & AUTHENTICITY PLEDGE')
  const sub = authSubtext(p, 'Certified 100% genuine luxury goods. Sourced through licensed private clients and authorized European boutiques.')
  const points = getPoints(p)

  const romanNumerals = ['I', 'II', 'III', 'IV']
  const cardsHtml = points.slice(0, 3).map((pt, i) => {
    return `<td width="33.33%" valign="top" style="padding:5px;box-sizing:border-box;">
      <div style="background-color:#121214;border:1px solid #27272a;border-top:2px solid ${gold};padding:12px 10px;text-align:center;box-sizing:border-box;border-radius:4px;">
        <div style="color:${gold};font-size:10px;letter-spacing:1px;font-weight:700;font-family:Arial,sans-serif;">
          ${romanNumerals[i] ?? '•'}. PILLAR
        </div>
        <div style="color:${textCol};font-size:12.5px;font-weight:700;margin-top:4px;font-family:Arial,sans-serif;">
          ${pt.title}
        </div>
        ${pt.sub ? `<div style="color:#a1a1aa;font-size:10px;margin-top:2px;font-family:Arial,sans-serif;">${pt.sub}</div>` : ''}
      </div>
    </td>`
  }).join('')

  return `<!--[riazify:authenticity_guarantee:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:100%;box-sizing:border-box;font-family:${f};border-collapse:collapse;margin:0 auto;border:2px solid ${gold};border-radius:8px;background-color:${bgCol};box-shadow:0 6px 24px rgba(0,0,0,0.5);">
  <tr>
    <td style="padding:4px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid rgba(212,175,55,0.4);border-radius:4px;">
        <!-- Crest Header -->
        <tr>
          <td style="background-color:#141416;border-bottom:1px solid ${gold};padding:18px 20px 14px 20px;text-align:center;box-sizing:border-box;">
            <div style="color:${gold};font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">
              ✦ OFFICIAL CERTIFICATE OF GENUINE HERITAGE ✦
            </div>
            <div style="color:#ffffff;font-size:18px;font-weight:400;letter-spacing:0.5px;margin-top:4px;">
              ${title}
            </div>
            <div style="color:#a1a1aa;font-size:12px;max-width:620px;margin:8px auto 0 auto;font-family:Arial,sans-serif;line-height:1.5;">
              ${sub}
            </div>
          </td>
        </tr>
        <!-- 3 Provenance Pillar Cards -->
        <tr>
          <td style="padding:14px 12px;box-sizing:border-box;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                ${cardsHtml}
              </tr>
            </table>
          </td>
        </tr>
        <!-- Curator Signoff Footer -->
        <tr>
          <td style="background-color:#141416;border-top:1px solid #27272a;padding:8px 16px;box-sizing:border-box;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="color:${gold};font-size:9.5px;font-family:Arial,sans-serif;letter-spacing:1px;font-weight:700;">
                  [ VERIFIED ATELIER PEDIGREE &bull; NO REPLICAS ]
                </td>
                <td align="right" style="color:#71717a;font-size:9.5px;font-family:Georgia,serif;font-style:italic;">
                  Archival Lot Guarantee #AUTH-LUX-2026
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:authenticity_guarantee:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. STREETWEAR & SNEAKER HYPE LEGIT CHECK TICKET
// Hypebeast verification hangtag with neon volt lime accents, barcode & audit checks
// ─────────────────────────────────────────────────────────────────────────────
function sneakerStreetwearPass(p: any, id: string): string {
  const f = font(p, 'Consolas, Monaco, Courier New, monospace')
  const bgCol = resolveBg(p, '#0a0a0c')
  const textCol = resolveText(p, '#ffffff')
  const volt = resolveAccent(p, '#b8fa33')
  const title = authTitle(p, 'VERIFIED AUTHENTIC // MULTI-POINT AUDIT')
  const sub = authSubtext(p, 'Inspected under high-intensity UV lighting, stitching alignment, and factory box codes.')
  const points = getPoints(p)

  const checksHtml = points.map(pt => {
    return `<td width="33.33%" valign="top" style="padding:4px;box-sizing:border-box;">
      <div style="background-color:#141419;border:1px solid #27272a;border-left:3px solid ${volt};padding:8px 10px;box-sizing:border-box;border-radius:3px;">
        <div style="color:${volt};font-size:9.5px;font-weight:900;font-family:monospace;">[PASS // OK]</div>
        <div style="color:${textCol};font-size:11.5px;font-weight:800;font-family:Arial,sans-serif;margin-top:2px;">${pt.title}</div>
      </div>
    </td>`
  }).join('')

  return `<!--[riazify:authenticity_guarantee:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:100%;box-sizing:border-box;font-family:${f};border-collapse:collapse;margin:0 auto;border:2px solid #27272a;border-radius:8px;overflow:hidden;background-color:${bgCol};">
  <!-- Top Hangtag Header -->
  <tr>
    <td style="background-color:#121216;border-bottom:2px solid ${volt};padding:10px 16px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <span style="background-color:${volt};color:#000000;font-size:9.5px;font-weight:900;letter-spacing:1px;padding:2px 7px;border-radius:3px;font-family:monospace;">
              LEGIT CHECK: VERIFIED
            </span>
            <span style="color:#a1a1aa;font-size:10px;font-family:monospace;margin-left:8px;">
              PASS TAG #AUTH-99420-SNKRS
            </span>
          </td>
          <td align="right" style="color:${volt};font-size:10px;font-family:monospace;font-weight:700;">
            [100% DEADSTOCK]
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Title & Barcode Strip -->
  <tr>
    <td style="padding:14px 18px 10px 18px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="top" style="padding-right:12px;">
            <div style="color:${textCol};font-size:16px;font-weight:900;font-family:Arial,sans-serif;letter-spacing:0.3px;">
              ${title}
            </div>
            <div style="color:#a1a1aa;font-size:12px;font-family:Arial,sans-serif;margin-top:4px;line-height:1.4;">
              ${sub}
            </div>
          </td>
          <td width="120" align="right" valign="top">
            <div style="font-family:monospace;font-size:12px;color:#71717a;letter-spacing:-1px;">
              ||| | ||||| || |||||| | ||||
            </div>
            <div style="color:${volt};font-size:8.5px;font-family:monospace;font-weight:700;margin-top:2px;">
              TAMPER SEAL ACTIVE
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- 3 Audit Check Blocks -->
  <tr>
    <td style="padding:6px 14px 14px 14px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${checksHtml}
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:authenticity_guarantee:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. TAMPER-EVIDENT HOLOGRAPHIC SECURITY RIBBON
// Metallic security border with holographic sheen bar for electronics & sealed retail
// ─────────────────────────────────────────────────────────────────────────────
function securityTamperEvident(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#0f172a')
  const textCol = resolveText(p, '#f8fafc')
  const cyan = resolveAccent(p, '#06b6d4')
  const title = authTitle(p, 'FACTORY SEALED & TAMPER-EVIDENT AUTHENTIC')
  const sub = authSubtext(p, 'Serialized package verification ensures you receive an uncompromised, 100% brand-new genuine product.')
  const points = getPoints(p)

  const itemsHtml = points.map(pt => {
    return `<td width="33.33%" valign="top" style="padding:5px;box-sizing:border-box;">
      <div style="background-color:rgba(15,23,42,0.8);border:1px solid #334155;border-radius:6px;padding:10px 8px;text-align:center;box-sizing:border-box;">
        <div style="font-size:14px;margin-bottom:3px;">🔒</div>
        <div style="color:#ffffff;font-size:12px;font-weight:800;">${pt.title}</div>
        <div style="color:#94a3b8;font-size:10px;margin-top:2px;">Audit Confirmed</div>
      </div>
    </td>`
  }).join('')

  return `<!--[riazify:authenticity_guarantee:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:100%;box-sizing:border-box;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #334155;border-radius:8px;overflow:hidden;background-color:${bgCol};">
  <!-- Holographic Simulated Gradient Band -->
  <tr>
    <td style="background:linear-gradient(90deg, #0284c7 0%, #7c3aed 50%, #059669 100%);padding:4px 16px;text-align:center;box-sizing:border-box;">
      <span style="color:#ffffff;font-size:9.5px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">
        ★ OFFICIAL SECURITY HOLOGRAM &bull; VOID IF COMPROMISED ★
      </span>
    </td>
  </tr>
  <!-- Content Body -->
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <div style="text-align:center;margin-bottom:12px;">
        <div style="color:${cyan};font-size:10px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:4px;">
          AUTHENTICITY PROTOCOL ACTIVE
        </div>
        <div style="color:${textCol};font-size:18px;font-weight:900;letter-spacing:0.3px;">
          ${title}
        </div>
        <div style="color:#94a3b8;font-size:12.5px;line-height:1.4;max-width:620px;margin:6px auto 0 auto;">
          ${sub}
        </div>
      </div>
      <!-- 3 Security Cards -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${itemsHtml}
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:authenticity_guarantee:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PSA / BGS COLLECTOR GRADED SLAB VAULT
// Acrylic slab label styling with red header, gold grade emblem & barcode
// ─────────────────────────────────────────────────────────────────────────────
function psaGradedSlabVault(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#0f172a')
  const red = resolveAccent(p, '#b91c1c')
  const title = authTitle(p, 'CERTIFIED COLLECTOR ARCHIVE // 100% AUTHENTIC')
  const sub = authSubtext(p, 'Permanent verification guarantee for trading cards, comics, numismatics & rare memorabilia.')
  const points = getPoints(p)

  const rowsHtml = points.map((pt, idx) => {
    return `<td width="33.33%" valign="top" style="padding:4px 8px;border-right:${idx === 2 ? 'none' : '1px solid #e2e8f0'};box-sizing:border-box;">
      <div style="color:#64748b;font-size:9.5px;font-weight:800;text-transform:uppercase;">CRITERIA #0${idx + 1}</div>
      <div style="color:${textCol};font-size:12px;font-weight:900;margin-top:2px;">${pt.title}</div>
      <div style="color:#16a34a;font-size:10px;font-weight:700;margin-top:1px;">✓ VERIFIED PASS</div>
    </td>`
  }).join('')

  return `<!--[riazify:authenticity_guarantee:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:100%;box-sizing:border-box;font-family:${f};border-collapse:collapse;margin:0 auto;border:2px solid #cbd5e1;border-radius:8px;overflow:hidden;background-color:${bgCol};box-shadow:0 3px 12px rgba(0,0,0,0.06);">
  <!-- Top Red Slab Label Header -->
  <tr>
    <td style="background-color:${red};padding:10px 18px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <span style="color:#ffffff;font-size:13px;font-weight:900;letter-spacing:1px;font-family:Arial,sans-serif;">
              COLLECTOR VAULT CERTIFICATION
            </span>
          </td>
          <td align="right">
            <span style="background-color:#ffffff;color:${red};font-size:10.5px;font-weight:900;padding:3px 8px;border-radius:3px;">
              GRADE: AUTHENTIC // GEM
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Title & Barcode Info -->
  <tr>
    <td style="padding:14px 18px 8px 18px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="top" style="padding-right:12px;">
            <div style="color:${textCol};font-size:16px;font-weight:900;letter-spacing:0.2px;">
              ${title}
            </div>
            <div style="color:#64748b;font-size:12px;margin-top:4px;line-height:1.4;">
              ${sub}
            </div>
          </td>
          <td width="130" align="right" valign="top">
            <div style="font-family:monospace;font-size:11px;color:#94a3b8;letter-spacing:-0.5px;">
              |||| | ||||| || ||||||
            </div>
            <div style="color:#64748b;font-size:9px;font-family:monospace;margin-top:2px;">
              CERT #EB-998234-SLAB
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Criteria Matrix Bar -->
  <tr>
    <td style="padding:8px 14px 14px 14px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:8px 4px;">
        <tr>
          ${rowsHtml}
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:authenticity_guarantee:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. INDUSTRIAL OEM DIRECT SUPPLY CERTIFICATE
// Slate & safety-amber industrial plaque for auto parts, tools & equipment
// ─────────────────────────────────────────────────────────────────────────────
function manufacturerOemSeal(p: any, id: string): string {
  const f = font(p)
  const rows = getPoints(p)
  const bgCol = resolveBg(p, '#1e293b')
  const textCol = resolveText(p, '#f8fafc')
  const amber = resolveAccent(p, '#f59e0b')
  const title = authTitle(p, '100% GENUINE OEM SPECIFICATION GUARANTEE')
  const sub = authSubtext(p, 'Engineered to exact manufacturer tolerances. Zero cheap knockoffs, clones, or grey-market counterfeits.')

  const cellsHtml = rows.map(r => {
    return `<td width="33.33%" valign="top" style="padding:4px;box-sizing:border-box;">
      <div style="background-color:#0f172a;border:1px solid #334155;border-top:2px solid ${amber};padding:10px 8px;box-sizing:border-box;border-radius:3px;">
        <div style="color:${amber};font-size:9.5px;font-family:monospace;font-weight:700;">★ OEM STANDARD</div>
        <div style="color:#ffffff;font-size:12px;font-weight:800;margin-top:2px;">${r.title}</div>
      </div>
    </td>`
  }).join('')

  return `<!--[riazify:authenticity_guarantee:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:100%;box-sizing:border-box;font-family:${f};border-collapse:collapse;margin:0 auto;border:2px solid #334155;border-radius:8px;overflow:hidden;background-color:${bgCol};">
  <!-- Top Stamped Header -->
  <tr>
    <td style="background-color:#0f172a;border-bottom:1px solid #334155;padding:8px 16px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <span style="color:${amber};font-size:10px;font-weight:900;letter-spacing:1px;font-family:monospace;">
              [ FACTORY OEM CERTIFIED ]
            </span>
          </td>
          <td align="right" style="color:#94a3b8;font-size:10px;font-family:monospace;">
            TOLERANCE: 100% ORIGINAL
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Plaque Main Body -->
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <div style="color:${textCol};font-size:17px;font-weight:900;letter-spacing:0.3px;margin-bottom:4px;">
        ${title}
      </div>
      <div style="color:#94a3b8;font-size:12.5px;line-height:1.4;margin-bottom:12px;">
        ${sub}
      </div>
      <!-- 3 Technical Blocks -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${cellsHtml}
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:authenticity_guarantee:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. SCANDINAVIAN MINIMALIST EDITORIAL MANIFESTO
// Asymmetrical fashion magazine split with left badge and airy hairline typography
// ─────────────────────────────────────────────────────────────────────────────
function swissMinimalistDossier(p: any, id: string): string {
  const f = font(p, 'Georgia, serif')
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#18181b')
  const accent = resolveAccent(p, '#71717a')
  const title = authTitle(p, 'The Authenticity Manifesto')
  const sub = authSubtext(p, 'We believe in absolute transparency. Every piece in our collection is strictly examined and certified authentic before shipment.')
  const points = getPoints(p)

  const itemsHtml = points.map((pt, i) => {
    return `<tr>
      <td width="28" valign="top" style="padding:6px 0;font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:${accent};">
        0${i + 1}.
      </td>
      <td valign="top" style="padding:6px 0;font-family:Arial,sans-serif;font-size:12.5px;font-weight:700;color:${textCol};">
        ${pt.title}
        ${pt.sub ? `<div style="font-size:11px;color:#71717a;font-weight:500;margin-top:1px;">${pt.sub}</div>` : ''}
      </td>
    </tr>`
  }).join('')

  return `<!--[riazify:authenticity_guarantee:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:100%;box-sizing:border-box;border-collapse:collapse;margin:0 auto;border:1px solid #e4e4e7;border-radius:8px;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 20, 24, 20, 24)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Left Column: Editorial Spine -->
          <td width="36%" valign="top" style="padding-right:20px;border-right:1px solid #e4e4e7;box-sizing:border-box;">
            <div style="font-family:Arial,sans-serif;color:${accent};font-size:9px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">
              ASSURANCE &bull; VOL. 01
            </div>
            <div style="font-family:${f};color:${textCol};font-size:22px;font-weight:400;letter-spacing:-0.2px;line-height:1.2;margin-top:8px;">
              ${title}
            </div>
            <div style="width:24px;height:1.5px;background-color:${textCol};margin:12px 0;"></div>
            <div style="font-family:Arial,sans-serif;color:#71717a;font-size:11.5px;line-height:1.5;">
              ${sub}
            </div>
          </td>
          <!-- Right Column: Numbered Manifesto -->
          <td width="64%" valign="top" style="padding-left:22px;box-sizing:border-box;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${itemsHtml}
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:authenticity_guarantee:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. 3-PILLAR SECURITY SHIELD MATRIX
// High-converting 3-card elevated grid (Direct Source, Inspection, Full Refund)
// ─────────────────────────────────────────────────────────────────────────────
function tripleBadgeCrestMatrix(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#0f172a')
  const accent = resolveAccent(p, '#2563eb')
  const title = authTitle(p, 'Complete Buyer Protection & Authenticity')
  const sub = authSubtext(p, 'Triple-layer safeguards so you can purchase with total peace of mind.')
  const points = getPoints(p)

  const icons = ['🛡', '🔍', '↩']
  const cardsHtml = points.slice(0, 3).map((pt, i) => {
    return `<td width="33.33%" valign="top" style="padding:6px;box-sizing:border-box;">
      <div style="background-color:#f8fafc;border:1.5px solid #e2e8f0;border-radius:8px;padding:14px 10px;text-align:center;box-sizing:border-box;">
        <div style="font-size:20px;margin-bottom:6px;">${icons[i]}</div>
        <div style="color:${textCol};font-size:13px;font-weight:900;margin-bottom:3px;">${pt.title}</div>
        <div style="color:#64748b;font-size:10.5px;line-height:1.4;">${pt.sub ?? 'Guaranteed 100% Genuine'}</div>
      </div>
    </td>`
  }).join('')

  return `<!--[riazify:authenticity_guarantee:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:100%;box-sizing:border-box;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #e2e8f0;border-radius:10px;background-color:${bgCol};box-shadow:0 2px 8px rgba(0,0,0,0.04);">
  <tr>
    <td style="${pad(p, 18, 20, 18, 20)}box-sizing:border-box;">
      <!-- Title -->
      <div style="text-align:center;margin-bottom:14px;">
        <span style="display:inline-block;background-color:#eff6ff;color:${accent};font-size:9.5px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:2px 8px;border-radius:3px;">
          AUTHENTIC GUARANTEE
        </span>
        <div style="color:${textCol};font-size:17px;font-weight:900;margin-top:5px;">
          ${title}
        </div>
        <div style="color:#64748b;font-size:12px;margin-top:2px;">
          ${sub}
        </div>
      </div>
      <!-- 3 Elevated Cards -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${cardsHtml}
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:authenticity_guarantee:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. VINTAGE NOTARY PROVENANCE CERTIFICATE
// Warm parchment ticket with engraved borders, crimson stamp & signature
// ─────────────────────────────────────────────────────────────────────────────
function vintageNotaryParchment(p: any, id: string): string {
  const f = font(p, 'Georgia, Garamond, serif')
  const bgCol = resolveBg(p, '#fffefb')
  const textCol = resolveText(p, '#1c1917')
  const red = resolveAccent(p, '#b91c1c')
  const title = authTitle(p, 'OFFICIAL NOTARIZED CERTIFICATE OF AUTHENTICITY')
  const sub = authSubtext(p, 'Attestation of genuine heritage. Sourced from verified private estates and authenticated collectors.')
  const points = getPoints(p)

  const itemsHtml = points.map(pt => {
    return `<td width="33.33%" valign="top" style="padding:6px;box-sizing:border-box;">
      <div style="border:1px dashed #d6d3d1;padding:8px 6px;text-align:center;background-color:#faf8f5;border-radius:3px;">
        <div style="color:${red};font-size:10px;font-weight:700;">★ VERIFIED ★</div>
        <div style="color:${textCol};font-size:11.5px;font-weight:800;font-family:Arial,sans-serif;margin-top:2px;">${pt.title}</div>
      </div>
    </td>`
  }).join('')

  return `<!--[riazify:authenticity_guarantee:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:100%;box-sizing:border-box;font-family:${f};border-collapse:collapse;margin:0 auto;border:2px solid #d6d3d1;border-radius:6px;background-color:${bgCol};">
  <tr>
    <td style="padding:4px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #d6d3d1;padding:16px 20px;text-align:center;">
        <!-- Notary Header -->
        <tr>
          <td>
            <div style="display:inline-block;border:2px solid ${red};padding:3px 10px;border-radius:3px;color:${red};font-size:9.5px;font-weight:900;letter-spacing:1px;font-family:Arial,sans-serif;margin-bottom:8px;">
              [ NOTARIAL ARCHIVE &bull; PEDIGREE RECORD ]
            </div>
            <div style="color:${textCol};font-size:18px;font-weight:700;letter-spacing:0.3px;">
              ${title}
            </div>
            <div style="color:#57534e;font-size:12px;font-family:Georgia,serif;font-style:italic;max-width:620px;margin:6px auto 14px auto;line-height:1.4;">
              "${sub}"
            </div>
          </td>
        </tr>
        <!-- 3 Attestation Boxes -->
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                ${itemsHtml}
              </tr>
            </table>
          </td>
        </tr>
        <!-- Bottom Seal & Docket Number -->
        <tr>
          <td style="padding-top:14px;border-top:1px dashed #d6d3d1;margin-top:12px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="text-align:left;color:#78716c;font-size:10px;font-family:Arial,sans-serif;">
                  DOCKET LOT: #AUTH-ESTATE-9924
                </td>
                <td style="text-align:right;color:${red};font-size:10px;font-weight:700;font-family:Arial,sans-serif;">
                  SEAL RECORDED &bull; 100% GENUINE
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:authenticity_guarantee:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. SPORTS & AUTOGRAPH MEMORABILIA HOLOGRAM PASS
// Stadium navy card with metallic bevels & witnessed signing hologram medallion
// ─────────────────────────────────────────────────────────────────────────────
function sportsMemorabiliaHolotag(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#070f1e')
  const textCol = resolveText(p, '#f8fafc')
  const silver = '#94a3b8'
  const gold = resolveAccent(p, '#fbbf24')
  const title = authTitle(p, 'AUTHENTICATED WITNESSED SIGNING // MEMORABILIA')
  const sub = authSubtext(p, 'Tamper-proof serialized hologram permanently matched to official sports authentication database.')
  const points = getPoints(p)

  const itemsHtml = points.map(pt => {
    return `<td width="33.33%" valign="top" style="padding:4px;box-sizing:border-box;">
      <div style="background-color:#0b192e;border:1px solid #1e3a5f;border-top:2px solid ${gold};padding:10px 8px;text-align:center;box-sizing:border-box;border-radius:3px;">
        <div style="color:${gold};font-size:9.5px;font-weight:900;">★ HOLO-TAGGED ★</div>
        <div style="color:#ffffff;font-size:12px;font-weight:800;margin-top:2px;">${pt.title}</div>
      </div>
    </td>`
  }).join('')

  return `<!--[riazify:authenticity_guarantee:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:100%;box-sizing:border-box;font-family:${f};border-collapse:collapse;margin:0 auto;border:2px solid #1e3a5f;border-radius:8px;overflow:hidden;background-color:${bgCol};box-shadow:0 4px 18px rgba(0,0,0,0.4);">
  <!-- Hologram Pass Header -->
  <tr>
    <td style="background-color:#0c1a2e;border-bottom:1px solid #1e3a5f;padding:10px 18px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background-color:${gold};margin-right:6px;vertical-align:middle;"></span>
            <span style="color:#ffffff;font-size:12px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">
              AUTHENTIC SPORTS MEMORABILIA
            </span>
          </td>
          <td align="right" style="color:${silver};font-size:10px;font-family:monospace;">
            HOLOGRAM #SPO-77491-AUTH
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Body -->
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <div style="color:${textCol};font-size:17px;font-weight:900;letter-spacing:0.3px;margin-bottom:4px;">
        ${title}
      </div>
      <div style="color:#94a3b8;font-size:12.5px;line-height:1.4;margin-bottom:12px;">
        ${sub}
      </div>
      <!-- 3 Hologram Points -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${itemsHtml}
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:authenticity_guarantee:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Thumbnail Representations for Visual Editor Carousel & Panels
// ─────────────────────────────────────────────────────────────────────────────
export const AUTHENTICITY_THUMBNAILS: Record<string, string> = {
  'auth-ebay-blue-official-shield': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#0053a0" stroke="#003d75" stroke-width="1"/>
    <circle cx="40" cy="11" r="5" fill="#ffffff" fill-opacity="0.2"/>
    <path d="M40 7L43 10V14L40 16L37 14V10L40 7Z" fill="#38bdf8"/>
    <rect x="18" y="19" width="44" height="4" rx="1" fill="#ffffff"/>
    <rect x="22" y="25" width="36" height="2.5" rx="0.5" fill="#bae6fd"/>
    <rect x="6" y="32" width="20" height="9" rx="4.5" fill="#ffffff" fill-opacity="0.15"/>
    <rect x="30" y="32" width="20" height="9" rx="4.5" fill="#ffffff" fill-opacity="0.15"/>
    <rect x="54" y="32" width="20" height="9" rx="4.5" fill="#ffffff" fill-opacity="0.15"/>
  </svg>`,

  'auth-luxury-atelier-wax-seal': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#09090b" stroke="#d4af37" stroke-width="1"/>
    <rect x="2" y="2" width="76" height="44" rx="2" stroke="#d4af37" stroke-width="0.5" stroke-opacity="0.4"/>
    <rect x="2.5" y="2.5" width="75" height="9" fill="#141416"/>
    <line x1="2.5" y1="11.5" x2="77.5" y2="11.5" stroke="#d4af37" stroke-width="0.7"/>
    <circle cx="40" cy="5.5" r="1" fill="#d4af37"/>
    <rect x="24" y="8" width="32" height="2" fill="#ffffff"/>
    <rect x="4" y="16" width="22" height="18" fill="#121214" stroke="#27272a" stroke-width="0.8"/>
    <line x1="4" y1="16" x2="26" y2="16" stroke="#d4af37" stroke-width="1.2"/>
    <rect x="29" y="16" width="22" height="18" fill="#121214" stroke="#27272a" stroke-width="0.8"/>
    <line x1="29" y1="16" x2="51" y2="16" stroke="#d4af37" stroke-width="1.2"/>
    <rect x="54" y="16" width="22" height="18" fill="#121214" stroke="#27272a" stroke-width="0.8"/>
    <line x1="54" y1="16" x2="76" y2="16" stroke="#d4af37" stroke-width="1.2"/>
    <line x1="2" y1="38" x2="78" y2="38" stroke="#27272a" stroke-width="0.6"/>
    <rect x="6" y="41" width="30" height="2" fill="#d4af37"/>
  </svg>`,

  'auth-sneaker-streetwear-pass': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#0a0a0c" stroke="#27272a" stroke-width="1"/>
    <rect width="80" height="8" fill="#121216"/>
    <line x1="0" y1="8" x2="80" y2="8" stroke="#b8fa33" stroke-width="1"/>
    <rect x="4" y="2.5" width="24" height="3" rx="0.5" fill="#b8fa33"/>
    <rect x="4" y="12" width="46" height="4" rx="0.5" fill="#ffffff"/>
    <g fill="#71717a">
      <rect x="64" y="11" width="1" height="5"/>
      <rect x="66" y="11" width="1.5" height="5"/>
      <rect x="69" y="11" width="1" height="5"/>
      <rect x="71" y="11" width="2" height="5"/>
      <rect x="74" y="11" width="1" height="5"/>
    </g>
    <rect x="4" y="21" width="22" height="16" fill="#141419" stroke="#27272a" stroke-width="0.8"/>
    <line x1="4" y1="21" x2="4" y2="37" stroke="#b8fa33" stroke-width="1.5"/>
    <rect x="29" y="21" width="22" height="16" fill="#141419" stroke="#27272a" stroke-width="0.8"/>
    <line x1="29" y1="21" x2="29" y2="37" stroke="#b8fa33" stroke-width="1.5"/>
    <rect x="54" y="21" width="22" height="16" fill="#141419" stroke="#27272a" stroke-width="0.8"/>
    <line x1="54" y1="21" x2="54" y2="37" stroke="#b8fa33" stroke-width="1.5"/>
  </svg>`,

  'auth-security-tamper-evident': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#0f172a" stroke="#334155" stroke-width="1"/>
    <path d="M0 0H80V5H0V0Z" fill="url(#tamper_grad)"/>
    <defs>
      <linearGradient id="tamper_grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="50%" stop-color="#7c3aed"/>
        <stop offset="100%" stop-color="#059669"/>
      </linearGradient>
    </defs>
    <rect x="20" y="8" width="40" height="3" fill="#06b6d4"/>
    <rect x="14" y="13" width="52" height="4.5" rx="0.5" fill="#f8fafc"/>
    <rect x="4" y="22" width="22" height="16" rx="2" fill="#0f172a" stroke="#334155" stroke-width="0.8"/>
    <circle cx="15" cy="27" r="2" fill="#06b6d4"/>
    <rect x="29" y="22" width="22" height="16" rx="2" fill="#0f172a" stroke="#334155" stroke-width="0.8"/>
    <circle cx="40" cy="27" r="2" fill="#06b6d4"/>
    <rect x="54" y="22" width="22" height="16" rx="2" fill="#0f172a" stroke="#334155" stroke-width="0.8"/>
    <circle cx="65" cy="27" r="2" fill="#06b6d4"/>
  </svg>`,

  'auth-psa-graded-slab-vault': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect width="80" height="9" fill="#b91c1c"/>
    <rect x="4" y="3" width="30" height="3" fill="#ffffff"/>
    <rect x="56" y="2.5" width="20" height="4" rx="1" fill="#ffffff"/>
    <rect x="4" y="13" width="44" height="4" fill="#0f172a"/>
    <g fill="#94a3b8">
      <rect x="62" y="12" width="1" height="5"/>
      <rect x="64" y="12" width="1.5" height="5"/>
      <rect x="67" y="12" width="1" height="5"/>
      <rect x="69" y="12" width="2" height="5"/>
      <rect x="72" y="12" width="1" height="5"/>
    </g>
    <rect x="4" y="22" width="72" height="18" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="28" y1="22" x2="28" y2="40" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="52" y1="22" x2="52" y2="40" stroke="#e2e8f0" stroke-width="0.8"/>
  </svg>`,

  'auth-manufacturer-oem-seal': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <rect width="80" height="7" fill="#0f172a"/>
    <rect x="4" y="2" width="24" height="3" fill="#f59e0b"/>
    <rect x="4" y="11" width="50" height="4" fill="#f8fafc"/>
    <rect x="4" y="17" width="60" height="2.5" fill="#94a3b8"/>
    <rect x="4" y="24" width="22" height="16" fill="#0f172a" stroke="#334155" stroke-width="0.8"/>
    <line x1="4" y1="24" x2="26" y2="24" stroke="#f59e0b" stroke-width="1.2"/>
    <rect x="29" y="24" width="22" height="16" fill="#0f172a" stroke="#334155" stroke-width="0.8"/>
    <line x1="29" y1="24" x2="51" y2="24" stroke="#f59e0b" stroke-width="1.2"/>
    <rect x="54" y="24" width="22" height="16" fill="#0f172a" stroke="#334155" stroke-width="0.8"/>
    <line x1="54" y1="24" x2="76" y2="24" stroke="#f59e0b" stroke-width="1.2"/>
  </svg>`,

  'auth-swiss-minimalist-dossier': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e4e4e7" stroke-width="1"/>
    <rect x="4" y="6" width="16" height="2" fill="#71717a"/>
    <rect x="4" y="11" width="22" height="5" fill="#18181b"/>
    <line x1="4" y1="19" x2="14" y2="19" stroke="#18181b" stroke-width="1"/>
    <rect x="4" y="23" width="20" height="16" fill="#f4f4f5"/>
    <line x1="28" y1="4" x2="28" y2="44" stroke="#e4e4e7" stroke-width="0.8"/>
    <rect x="34" y="8" width="40" height="8" rx="1" fill="#fafafa"/>
    <rect x="34" y="20" width="40" height="8" rx="1" fill="#fafafa"/>
    <rect x="34" y="32" width="40" height="8" rx="1" fill="#fafafa"/>
  </svg>`,

  'auth-triple-badge-crest-matrix': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="26" y="4" width="28" height="3" rx="1" fill="#eff6ff"/>
    <rect x="18" y="9" width="44" height="4" rx="0.5" fill="#0f172a"/>
    <rect x="4" y="17" width="22" height="24" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <circle cx="15" cy="24" r="3" fill="#2563eb" fill-opacity="0.2"/>
    <rect x="7" y="30" width="16" height="3" fill="#0f172a"/>
    <rect x="29" y="17" width="22" height="24" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <circle cx="40" cy="24" r="3" fill="#2563eb" fill-opacity="0.2"/>
    <rect x="32" y="30" width="16" height="3" fill="#0f172a"/>
    <rect x="54" y="17" width="22" height="24" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <circle cx="65" cy="24" r="3" fill="#2563eb" fill-opacity="0.2"/>
    <rect x="57" y="30" width="16" height="3" fill="#0f172a"/>
  </svg>`,

  'auth-vintage-notary-parchment': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#fffefb" stroke="#d6d3d1" stroke-width="1.2"/>
    <rect x="2" y="2" width="76" height="44" rx="2" stroke="#d6d3d1" stroke-width="0.6" stroke-dasharray="2 1"/>
    <rect x="24" y="6" width="32" height="3" rx="0.5" fill="#b91c1c"/>
    <rect x="14" y="11" width="52" height="4" fill="#1c1917"/>
    <rect x="5" y="19" width="21" height="16" fill="#faf8f5" stroke="#d6d3d1" stroke-width="0.6" stroke-dasharray="1.5 1"/>
    <rect x="29.5" y="19" width="21" height="16" fill="#faf8f5" stroke="#d6d3d1" stroke-width="0.6" stroke-dasharray="1.5 1"/>
    <rect x="54" y="19" width="21" height="16" fill="#faf8f5" stroke="#d6d3d1" stroke-width="0.6" stroke-dasharray="1.5 1"/>
    <line x1="6" y1="39" x2="74" y2="39" stroke="#d6d3d1" stroke-width="0.6" stroke-dasharray="2 1"/>
    <rect x="6" y="42" width="24" height="2" fill="#78716c"/>
    <rect x="52" y="42" width="22" height="2" fill="#b91c1c"/>
  </svg>`,

  'auth-sports-memorabilia-holotag': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#070f1e" stroke="#1e3a5f" stroke-width="1"/>
    <rect width="80" height="8" fill="#0c1a2e"/>
    <circle cx="6" cy="4" r="1.5" fill="#fbbf24"/>
    <rect x="10" y="2.5" width="34" height="3" fill="#ffffff"/>
    <rect x="4" y="12" width="52" height="4" fill="#f8fafc"/>
    <rect x="4" y="18" width="60" height="2.5" fill="#94a3b8"/>
    <rect x="4" y="24" width="22" height="16" fill="#0b192e" stroke="#1e3a5f" stroke-width="0.8"/>
    <line x1="4" y1="24" x2="26" y2="24" stroke="#fbbf24" stroke-width="1.2"/>
    <rect x="29" y="24" width="22" height="16" fill="#0b192e" stroke="#1e3a5f" stroke-width="0.8"/>
    <line x1="29" y1="24" x2="51" y2="24" stroke="#fbbf24" stroke-width="1.2"/>
    <rect x="54" y="24" width="22" height="16" fill="#0b192e" stroke="#1e3a5f" stroke-width="0.8"/>
    <line x1="54" y1="24" x2="76" y2="24" stroke="#fbbf24" stroke-width="1.2"/>
  </svg>`,
}

export function getAuthenticityThumbnailSvg(id: string): string {
  const clean = id
    .toLowerCase()
    .trim()
    .replace(/^auth[-_]/, '')
    .replace(/_/g, '-')

  const key = Object.keys(AUTHENTICITY_THUMBNAILS).find(k => {
    const kClean = k.toLowerCase().replace(/^auth[-_]/, '').replace(/_/g, '-')
    return k === id || kClean === clean || k.endsWith(clean) || clean.includes(kClean)
  })

  return key ? AUTHENTICITY_THUMBNAILS[key] : AUTHENTICITY_THUMBNAILS['auth-ebay-blue-official-shield']
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported Variant Registry (All 10 Radically Distinct Architectures)
// ─────────────────────────────────────────────────────────────────────────────
export const authenticityGuaranteeVariants: BlockVariant[] = [
  {
    id: 'auth-ebay-blue-official-shield',
    label: 'Official eBay Blue Shield',
    description: 'Institutional eBay Royal Blue verified shield with 3-pill trust bar',
    thumbnail: AUTHENTICITY_THUMBNAILS['auth-ebay-blue-official-shield'],
    toHtml(props, id) { return ebayBlueOfficialShield(props, id) },
  },
  {
    id: 'auth-luxury-atelier-wax-seal',
    label: 'Atelier Gold Provenance Plaque',
    description: 'Obsidian & 24K gold provenance plaque with Roman-numeral luxury pillar cards',
    thumbnail: AUTHENTICITY_THUMBNAILS['auth-luxury-atelier-wax-seal'],
    toHtml(props, id) { return luxuryAtelierWaxSeal(props, id) },
  },
  {
    id: 'auth-sneaker-streetwear-pass',
    label: 'Streetwear Hype Audit Pass',
    description: 'Sneaker & streetwear legit check hangtag with neon volt lime accents & barcode',
    thumbnail: AUTHENTICITY_THUMBNAILS['auth-sneaker-streetwear-pass'],
    toHtml(props, id) { return sneakerStreetwearPass(props, id) },
  },
  {
    id: 'auth-security-tamper-evident',
    label: 'Tamper-Evident Security Ribbon',
    description: 'Holographic metallic security band for electronics & sealed retail goods',
    thumbnail: AUTHENTICITY_THUMBNAILS['auth-security-tamper-evident'],
    toHtml(props, id) { return securityTamperEvident(props, id) },
  },
  {
    id: 'auth-psa-graded-slab-vault',
    label: 'PSA Collector Graded Slab',
    description: 'Acrylic grading slab label for trading cards, coins, comics & collectibles',
    thumbnail: AUTHENTICITY_THUMBNAILS['auth-psa-graded-slab-vault'],
    toHtml(props, id) { return psaGradedSlabVault(props, id) },
  },
  {
    id: 'auth-manufacturer-oem-seal',
    label: 'Manufacturer OEM Seal',
    description: 'Industrial factory-direct pedigree plaque with safety-amber accents for auto & tools',
    thumbnail: AUTHENTICITY_THUMBNAILS['auth-manufacturer-oem-seal'],
    toHtml(props, id) { return manufacturerOemSeal(props, id) },
  },
  {
    id: 'auth-swiss-minimalist-dossier',
    label: 'Scandinavian Minimalist Manifesto',
    description: 'Asymmetrical boutique magazine split with left spine & numbered hairline manifesto',
    thumbnail: AUTHENTICITY_THUMBNAILS['auth-swiss-minimalist-dossier'],
    toHtml(props, id) { return swissMinimalistDossier(props, id) },
  },
  {
    id: 'auth-triple-badge-crest-matrix',
    label: '3-Pillar Security Shield Matrix',
    description: 'High-converting 3-card elevated grid (Direct Source, Inspection, Full Refund)',
    thumbnail: AUTHENTICITY_THUMBNAILS['auth-triple-badge-crest-matrix'],
    toHtml(props, id) { return tripleBadgeCrestMatrix(props, id) },
  },
  {
    id: 'auth-vintage-notary-parchment',
    label: 'Vintage Notary Provenance Certificate',
    description: 'Warm parchment certificate with engraved borders, crimson stamp & notary docket',
    thumbnail: AUTHENTICITY_THUMBNAILS['auth-vintage-notary-parchment'],
    toHtml(props, id) { return vintageNotaryParchment(props, id) },
  },
  {
    id: 'auth-sports-memorabilia-holotag',
    label: 'Sports Memorabilia Holo-Pass',
    description: 'Stadium dark navy card with witnessed signing hologram medallion for autographed items',
    thumbnail: AUTHENTICITY_THUMBNAILS['auth-sports-memorabilia-holotag'],
    toHtml(props, id) { return sportsMemorabiliaHolotag(props, id) },
  },
]

// Backwards-compatible aliases
export const authenticityVariants = authenticityGuaranteeVariants

/**
 * Robust Variant Resolver:
 * Supports variant IDs with or without the 'auth-' prefix
 * and matches shorthand IDs seamlessly.
 */
export function getAuthenticityGuaranteeVariant(id: string): BlockVariant {
  if (!id) return authenticityGuaranteeVariants[0]
  const clean = id
    .toLowerCase()
    .trim()
    .replace(/^auth[-_]/, '')
    .replace(/_/g, '-')

  const match = authenticityGuaranteeVariants.find(v => {
    const vClean = v.id.toLowerCase().replace(/^auth[-_]/, '').replace(/_/g, '-')
    return (
      v.id === id ||
      vClean === clean ||
      v.id.endsWith(clean) ||
      clean.includes(vClean) ||
      vClean.includes(clean)
    )
  })

  return match ?? authenticityGuaranteeVariants[0]
}

export const getAuthenticityVariant = getAuthenticityGuaranteeVariant
