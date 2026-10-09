// components/ui/VisualEditor/variants/vat_notice.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// VAT Notice — 10 Radically Distinct, High-Converting Retail Layouts
// Built specifically for high-converting eBay & e-commerce B2B listings.
// Zero generic AI-slop, zero cheesy glassmorphism, zero fake neon glows.
// 100% authentic, tangible, battle-tested retail architectures that buyers trust.
//
// 1. vat-classic-card              — Current classic card with memo icon & subtitle (KEPT 100% IDENTICAL)
// 2. vat-official-certificate-badge— Official HMRC / Inland Revenue compliance certificate layout
// 3. vat-tax-breakdown-ledger      — Commercial B2B financial ledger showing Net, VAT & Gross breakdown
// 4. vat-minimalist-hairline-rule  — High-end Scandinavian luxury hairline rule layout with monospaced ID
// 5. vat-split-guarantee-ribbon    — Dual-tone 28/72 split pillar with bold VAT INVOICE badge & credentials
// 6. vat-corporate-security-seal   — Enterprise security seal dossier with legal entity & jurisdiction tags
// 7. vat-compact-pill-strip        — Ultra-dense horizontal capsule pill strip for 0-scroll mobile shoppers
// 8. vat-b2b-contractor-stamp      — Rugged tradesman & contractor invoice stamp with deduction disclaimer
// 9. vat-digital-download-vault    — Modern paperless digital PDF invoice download guarantee
// 10. vat-dual-jurisdiction-eu-uk  — Dual UK & EU cross-border tax registration & IOSS clearance strip
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
  id: string
  label: string
  description: string
  thumbnail?: string
  toHtml: (props: any, id: string) => string
}

// ── Shared Helpers & Dynamic Resolvers ─────────────────────────────────────

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

function resolveHeading(p: any, fallback = 'VAT Registered Business'): string {
  return p.heading ?? p.title ?? p.headingText ?? fallback
}

function resolveVatNumber(p: any, fallback = '{{VAT_NUMBER}}'): string {
  return p.vatNumber ?? p.vatNo ?? p.taxNumber ?? p.vatId ?? fallback
}

function resolveCompanyNumber(p: any, fallback = '{{COMPANY_NUMBER}}'): string {
  return p.companyNumber ?? p.crn ?? p.companyNo ?? p.registrationNumber ?? fallback
}

function resolveText(p: any, fallback = 'Full VAT invoice included with your order.'): string {
  return p.text ?? p.subText ?? p.noticeText ?? p.description ?? fallback
}

function resolveBg(p: any, signatureBg: string): string {
  if (!p.bgColor || p.bgColor.toLowerCase() === '#f8fafc' || p.bgColor.toLowerCase() === '#ffffff') {
    return signatureBg
  }
  return p.bgColor
}

function resolveBorder(p: any, signatureBorder: string): string {
  if (!p.borderColor || p.borderColor.toLowerCase() === '#e2e8f0' || p.borderColor.toLowerCase() === '#cbd5e1') {
    return signatureBorder
  }
  return p.borderColor
}

function resolveAccent(p: any, signatureAccent: string): string {
  if (!p.accentColor || p.accentColor.toLowerCase() === '#7530fb' || p.accentColor.toLowerCase() === '#059669') {
    return signatureAccent
  }
  return p.accentColor
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLASSIC CARD (CURRENT STYLE — 100% KEPT IDENTICAL)
// Matches user's exact current canvas block with file icon and clean border
// ─────────────────────────────────────────────────────────────────────────────
function classicCard(p: any, id: string): string {
  const f = font(p)
  const bgCol = p.bgColor || '#f8fafc'
  const borderCol = p.borderColor || '#e2e8f0'
  const titleCol = p.titleColor || '#1e1535'
  const textCol = p.textColor || '#64748b'
  const accent = resolveAccent(p, '#7530fb')
  const title = resolveHeading(p, 'VAT Registered Business')
  const vat = resolveVatNumber(p, '{{VAT_NUMBER}}')
  const sub = resolveText(p, 'Full VAT invoice included with your order.')

  return `<!--[riazify:vat_notice:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .vat-card-pad-${id} { padding: 14px 12px !important; text-align: center !important; }
    .vat-card-row-${id} { display: flex !important; flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 8px !important; }
    .vat-card-icon-${id} { width: 100% !important; text-align: center !important; padding: 0 !important; margin: 0 auto !important; }
    .vat-card-text-${id} { width: 100% !important; text-align: center !important; padding: 0 !important; }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td class="vat-card-pad-${id}" style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}border:1px solid ${borderCol};border-radius:8px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr class="vat-card-row-${id}">
          <!-- Vector Invoice Icon -->
          <td class="vat-card-icon-${id}" width="38" valign="top" style="width:38px;padding-right:12px;vertical-align:top;text-align:left;">
            <div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;background-color:#ede9fe;border-radius:6px;margin:0 auto;">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
              </svg>
            </div>
          </td>
          <!-- Title & Details -->
          <td class="vat-card-text-${id}" valign="top" style="vertical-align:top;text-align:left;">
            <p style="margin:0 0 3px;font-family:${f};font-size:13px;font-weight:800;color:${titleCol};line-height:1.3;">
              ${title}
            </p>
            <p style="margin:0;font-family:${f};font-size:12px;color:${textCol};line-height:1.45;">
              VAT No: ${vat} &middot; ${sub}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. OFFICIAL COMPLIANCE CERTIFICATE BADGE (HMRC / Tax Compliance Certified)
// Formal government-style certificate framing with official seal emblem & CRN
// ─────────────────────────────────────────────────────────────────────────────
function officialCertificateBadge(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#f8fafc')
  const borderCol = resolveBorder(p, '#cbd5e1')
  const accent = resolveAccent(p, '#059669')
  const title = resolveHeading(p, 'Official VAT Registered Business')
  const vat = resolveVatNumber(p, 'GB 123 4567 89')
  const crn = resolveCompanyNumber(p, 'Company Reg: 12498231')
  const sub = resolveText(p, 'Itemized VAT receipt with official tax breakdown automatically provided with every order.')

  return `<!--[riazify:vat_notice:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .hmrc-top-row-${id} { display: flex !important; flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 6px !important; }
    .hmrc-top-text-${id} { text-align: center !important; width: 100% !important; }
    .hmrc-top-badge-${id} { text-align: center !important; width: 100% !important; }
    .hmrc-pad-${id} { padding: 16px 12px !important; text-align: center !important; }
    .hmrc-body-row-${id} { display: flex !important; flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 10px !important; width: 100% !important; }
    .hmrc-icon-col-${id} { width: 100% !important; text-align: center !important; padding: 0 !important; margin: 0 auto !important; }
    .hmrc-text-col-${id} { width: 100% !important; text-align: center !important; }
    .hmrc-badge-col-${id} { width: 100% !important; text-align: center !important; padding: 0 !important; margin-top: 4px !important; }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;font-family:${f};background-color:${bgCol};border:2px solid ${borderCol};border-radius:8px;overflow:hidden;box-sizing:border-box;">
  <!-- Top Official Security Rule -->
  <tr style="background:#0f172a;">
    <td style="padding:8px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr class="hmrc-top-row-${id}">
          <td class="hmrc-top-text-${id}" style="font-family:'Courier New',Courier,monospace;font-size:9.5px;font-weight:800;color:#38bdf8;letter-spacing:1.5px;text-transform:uppercase;">
            TAX COMPLIANCE REGISTER // DOMESTIC COMMERCIAL ENTITY
          </td>
          <td class="hmrc-top-badge-${id}" align="right">
            <span style="display:inline-block;padding:2px 8px;background:#064e3b;border:1px solid ${accent};border-radius:3px;font-family:${f};font-size:9px;font-weight:800;color:#34d399;text-transform:uppercase;">
              ✓ VERIFIED ACTIVE
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Main Certificate Body -->
  <tr>
    <td class="hmrc-pad-${id}" style="${pad(p, 14, 18, 14, 18)}background-color:${bgCol};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr class="hmrc-body-row-${id}">
          <!-- Vector Government Landmark Icon (Centered on Mobile) -->
          <td class="hmrc-icon-col-${id}" width="46" valign="middle" style="width:46px;padding-right:14px;vertical-align:middle;text-align:left;">
            <div style="width:42px;height:42px;border-radius:50%;background:#ecfdf5;border:2px solid #a7f3d0;display:flex;align-items:center;justify-content:center;margin:0 auto;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="21" x2="21" y2="21"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <polyline points="12 3 2 10 22 10"/>
                <line x1="6" y1="10" x2="6" y2="21"/>
                <line x1="10" y1="10" x2="10" y2="21"/>
                <line x1="14" y1="10" x2="14" y2="21"/>
                <line x1="18" y1="10" x2="18" y2="21"/>
              </svg>
            </div>
          </td>
          <!-- Texts (Centered on Mobile) -->
          <td class="hmrc-text-col-${id}" valign="middle" style="vertical-align:middle;text-align:left;">
            <div style="font-family:${f};font-size:14px;font-weight:800;color:#0f172a;line-height:1.3;margin-bottom:3px;">
              ${title}
            </div>
            <div style="font-family:${f};font-size:12px;color:#475569;line-height:1.45;">
              ${sub}
            </div>
          </td>
          <!-- VAT Registration Card (Centered on Mobile) -->
          <td class="hmrc-badge-col-${id}" width="190" align="right" valign="middle" style="padding-left:12px;vertical-align:middle;text-align:right;">
            <div style="display:inline-block;background:#ffffff;border:1px solid #cbd5e1;border-radius:6px;padding:6px 14px;text-align:center;">
              <div style="font-family:'Courier New',Courier,monospace;font-size:11.5px;font-weight:900;color:#0f172a;">
                VAT: ${vat}
              </div>
              <div style="font-family:${f};font-size:9.5px;color:#64748b;margin-top:2px;">
                ${crn}
              </div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. TAX BREAKDOWN LEDGER (B2B Commercial Financial Table)
// High-conversion 3-column financial ledger table showing Net, 20% VAT, & Gross
// ─────────────────────────────────────────────────────────────────────────────
function taxBreakdownLedger(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const borderCol = resolveBorder(p, '#cbd5e1')
  const accent = resolveAccent(p, '#2563eb')
  const title = resolveHeading(p, 'B2B Tax Deductible Purchase')
  const vat = resolveVatNumber(p, 'GB 123 4567 89')
  const sub = resolveText(p, 'All listed prices include UK VAT at the standard rate. Complete VAT receipt issued.')

  return `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;width:100% !important;min-width:100% !important;font-family:${f};background-color:${bgCol};border:1px solid ${borderCol};border-radius:8px;overflow:hidden;box-sizing:border-box;">
  <!-- Header Bar -->
  <tr style="background:#f1f5f9;border-bottom:1px solid ${borderCol};">
    <td style="padding:10px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <span style="font-family:${f};font-size:13.5px;font-weight:800;color:#0f172a;">
              💳 ${title}
            </span>
          </td>
          <td align="right">
            <span style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:800;color:${accent};background:#eff6ff;padding:3px 8px;border-radius:4px;border:1px solid #bfdbfe;">
              TAX REG: ${vat}
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- 3-Column Ledger Grid -->
  <tr>
    <td style="${pad(p, 12, 16, 12, 16)}background-color:${bgCol};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="32%" style="padding:10px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;text-align:center;">
            <div style="font-family:${f};font-size:9.5px;color:#64748b;font-weight:700;text-transform:uppercase;">NET PRICE</div>
            <div style="font-family:${f};font-size:13px;font-weight:800;color:#0f172a;margin-top:2px;">100% Tax Deductible</div>
          </td>
          <td width="2%"></td>
          <td width="32%" style="padding:10px 12px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;text-align:center;">
            <div style="font-family:${f};font-size:9.5px;color:#1e40af;font-weight:700;text-transform:uppercase;">VAT INCLUDED</div>
            <div style="font-family:${f};font-size:13px;font-weight:900;color:${accent};margin-top:2px;">Standard Rate (20%)</div>
          </td>
          <td width="2%"></td>
          <td width="32%" style="padding:10px 12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;text-align:center;">
            <div style="font-family:${f};font-size:9.5px;color:#166534;font-weight:700;text-transform:uppercase;">INVOICE STATUS</div>
            <div style="font-family:${f};font-size:13px;font-weight:900;color:#16a34a;margin-top:2px;">Provided on Dispatch</div>
          </td>
        </tr>
      </table>
      <div style="font-family:${f};font-size:11.5px;color:#64748b;margin-top:9px;line-height:1.45;text-align:center;">
        ${sub}
      </div>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. MINIMALIST HAIRLINE EDITORIAL (Scandinavian Boutique & Luxury Apparel)
// Delicate 1px borders, generous letter-spacing, uppercase tracking, and clean rule
// ─────────────────────────────────────────────────────────────────────────────
function minimalistHairlineEditorial(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const borderCol = resolveBorder(p, '#e2e8f0')
  const title = resolveHeading(p, 'VAT Registration & Commercial Invoicing')
  const vat = resolveVatNumber(p, 'GB 123 4567 89')
  const sub = resolveText(p, 'We operate as a legally registered domestic commercial entity. Full VAT invoice with itemized tax schedule provided.')

  return `<!--[riazify:vat_notice:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .mhe-pad-${id} { padding: 16px 14px !important; text-align: center !important; }
    .mhe-top-bar-${id} { display: flex !important; flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 6px !important; margin-bottom: 8px !important; }
    .mhe-meta-text-${id} { text-align: center !important; width: 100% !important; }
    .mhe-vat-tag-${id} { text-align: center !important; width: 100% !important; }
    .mhe-title-${id} { text-align: center !important; }
    .mhe-sub-${id} { text-align: center !important; }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;font-family:${f};background-color:${bgCol};border-top:2px solid #0f172a;border-bottom:1px solid ${borderCol};box-sizing:border-box;">
  <tr>
    <td class="mhe-pad-${id}" style="${pad(p, 14, 16, 14, 16)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <td>
            <!-- Top Section Header & Monospace VAT ID -->
            <div class="mhe-top-bar-${id}" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <span class="mhe-meta-text-${id}" style="font-family:${f};font-size:9.5px;font-weight:800;letter-spacing:1.8px;color:#64748b;text-transform:uppercase;">
                COMMERCIAL ACCREDITATION &bull; SECTION 09
              </span>
              <span class="mhe-vat-tag-${id}" style="font-family:'Courier New',Courier,monospace;font-size:11.5px;font-weight:700;color:#0f172a;letter-spacing:0.8px;">
                VAT REG NO: [ ${vat} ]
              </span>
            </div>
            <!-- Main Title -->
            <div class="mhe-title-${id}" style="font-family:${f};font-size:14px;font-weight:800;color:#0f172a;letter-spacing:0.2px;margin-bottom:3px;line-height:1.3;">
              ${title}
            </div>
            <!-- Description Subtext -->
            <div class="mhe-sub-${id}" style="font-family:${f};font-size:12px;color:#64748b;line-height:1.5;">
              ${sub}
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. SPLIT GUARANTEE RIBBON (28/72 Asymmetrical Branded Pillar)
// Left bold navy/dark column with VAT INVOICE badge + Right registered tax credentials
// ─────────────────────────────────────────────────────────────────────────────
function splitGuaranteeRibbon(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#f8fafc')
  const borderCol = resolveBorder(p, '#cbd5e1')
  const accent = resolveAccent(p, '#f59e0b')
  const title = resolveHeading(p, 'VAT Registered Business')
  const vat = resolveVatNumber(p, 'GB 123 4567 89')
  const sub = resolveText(p, 'Purchases made through our eBay store include full commercial tax receipts. Ideal for B2B accounting & VAT reclaim.')

  return `<!--[riazify:vat_notice:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .sgr-right-wrap-${id} {
      display: flex !important;
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 5px !important;
      margin-bottom: 6px !important;
    }
    .sgr-right-pad-${id} {
      padding: 12px 14px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;font-family:${f};background-color:${bgCol};border:1px solid ${borderCol};border-radius:8px;overflow:hidden;box-sizing:border-box;">
  <tr>
    <!-- Left Dark Pillar (100% Untouched) -->
    <td width="26%" valign="middle" align="center" style="background:#0f172a;${pad(p, 16, 12, 16, 12)}box-sizing:border-box;">
      <div style="font-family:${f};font-size:9px;font-weight:900;letter-spacing:1.5px;color:${accent};text-transform:uppercase;margin-bottom:4px;">
        TAX COMPLIANT
      </div>
      <div style="font-family:${f};font-size:16px;font-weight:900;color:#ffffff;line-height:1.2;">
        VAT INVOICE
      </div>
      <div style="display:inline-block;margin-top:6px;padding:2px 8px;background:rgba(255,255,255,0.12);border-radius:12px;font-family:${f};font-size:9.5px;color:#cbd5e1;">
        Auto-Included
      </div>
    </td>
    <!-- Right White Body (Clean Stacking on Mobile) -->
    <td class="sgr-right-pad-${id}" width="74%" valign="middle" style="${pad(p, 14, 18, 14, 18)}background:#f8fafc;box-sizing:border-box;">
      <div class="sgr-right-wrap-${id}" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <span style="font-family:${f};font-size:14px;font-weight:800;color:#0f172a;line-height:1.3;">
          ${title}
        </span>
        <span style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:800;color:#0f172a;background:#e2e8f0;padding:2px 6px;border-radius:3px;display:inline-block;">
          ${vat}
        </span>
      </div>
      <div style="font-family:${f};font-size:12px;color:#475569;line-height:1.45;">
        ${sub}
      </div>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. CORPORATE SECURITY SEAL (Enterprise Legal Entity & Tax Authority Dossier)
// High-trust corporate framing with security badge, jurisdiction tag, and verified stamp
// ─────────────────────────────────────────────────────────────────────────────
function corporateSecuritySeal(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#f8fafc')
  const borderCol = resolveBorder(p, '#cbd5e1')
  const accent = resolveAccent(p, '#1e40af')
  const title = resolveHeading(p, 'Corporate Tax & VAT Disclosure')
  const vat = resolveVatNumber(p, 'GB 123 4567 89')
  const crn = resolveCompanyNumber(p, '12498231')
  const sub = resolveText(p, 'Trading as an authorized corporate supplier. Official HMRC-compliant VAT invoices supplied with every delivery.')

  return `<!--[riazify:vat_notice:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .css-card-table-${id} { width: 100% !important; min-width: 100% !important; }
    .css-pad-${id} { padding: 16px 12px !important; text-align: center !important; }
    .css-top-bar-${id} { display: flex !important; flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 6px !important; margin-bottom: 8px !important; }
    .css-top-badge-${id} { text-align: center !important; width: 100% !important; }
    .css-top-juris-${id} { text-align: center !important; width: 100% !important; }
    .css-title-${id} { text-align: center !important; }
    .css-sub-${id} { text-align: center !important; }
    .css-meta-table-${id} { width: 100% !important; margin: 0 auto !important; }
    .css-meta-row-${id} { display: flex !important; flex-direction: column !important; align-items: center !important; text-align: center !important; width: 100% !important; }
    .css-meta-cell1-${id} { width: 100% !important; text-align: center !important; border-bottom: 1px solid #e2e8f0 !important; border-right: none !important; }
    .css-meta-cell2-${id} { width: 100% !important; text-align: center !important; border-left: none !important; }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="css-card-table-${id}"
  style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;font-family:${f};background-color:${bgCol};border:1px solid ${borderCol};border-left:5px solid ${accent};border-radius:8px;overflow:hidden;box-sizing:border-box;">
  <tr>
    <td class="css-pad-${id}" style="${pad(p, 14, 18, 14, 18)}">
      <!-- Top Status Row -->
      <div class="css-top-bar-${id}" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span class="css-top-badge-${id}" style="display:inline-block;padding:2px 8px;background:#dbeafe;border:1px solid #bfdbfe;border-radius:3px;font-family:${f};font-size:9.5px;font-weight:800;color:${accent};text-transform:uppercase;">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px;">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          REGISTERED LEGAL ENTITY
        </span>
        <span class="css-top-juris-${id}" style="font-family:${f};font-size:10px;font-weight:700;color:#64748b;">
          JURISDICTION: UNITED KINGDOM
        </span>
      </div>

      <!-- Title & Subtitle -->
      <div class="css-title-${id}" style="font-family:${f};font-size:14px;font-weight:800;color:#0f172a;margin-bottom:4px;line-height:1.3;">
        ${title}
      </div>
      <div class="css-sub-${id}" style="font-family:${f};font-size:12px;color:#475569;line-height:1.5;margin-bottom:10px;">
        ${sub}
      </div>

      <!-- VAT & Company Reg Card -->
      <table class="css-meta-table-${id}" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:6px;box-sizing:border-box;">
        <tr class="css-meta-row-${id}">
          <td class="css-meta-cell1-${id}" style="font-family:'Courier New',Courier,monospace;font-size:11px;color:#0f172a;font-weight:700;padding:7px 14px;white-space:nowrap;">
            VAT NO: <strong>${vat}</strong>
          </td>
          <td class="css-meta-cell2-${id}" style="border-left:1px solid #cbd5e1;padding:7px 14px;font-family:'Courier New',Courier,monospace;font-size:11px;color:#64748b;white-space:nowrap;">
            COMPANY REG: <strong>${crn}</strong>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. COMPACT PILL STRIP (Ultra-Dense 0-Scroll Mobile Banner)
// Horizontal pill bar taking minimal vertical height on mobile apps
// ─────────────────────────────────────────────────────────────────────────────
function compactPillStrip(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#f1f5f9')
  const borderCol = resolveBorder(p, '#cbd5e1')
  const accent = resolveAccent(p, '#16a34a')
  const vat = resolveVatNumber(p, 'GB 123 4567 89')

  return `<!--[riazify:vat_notice:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .cps-table-${id} { width: 100% !important; min-width: 100% !important; border-radius: 12px !important; }
    .cps-pad-${id} { padding: 12px 10px !important; text-align: center !important; }
    .cps-row-${id} { display: flex !important; flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 6px !important; width: 100% !important; }
    .cps-icon-${id} { display: none !important; }
    .cps-pipe-${id} { display: none !important; }
    .cps-text-${id} { display: flex !important; flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 4px !important; width: 100% !important; }
    .cps-badge-${id} { text-align: center !important; width: 100% !important; margin-top: 4px !important; }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="cps-table-${id}"
  style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;font-family:${f};background-color:${bgCol};border:1px solid ${borderCol};border-radius:28px;box-sizing:border-box;">
  <tr>
    <td class="cps-pad-${id}" style="${pad(p, 8, 16, 8, 16)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr class="cps-row-${id}">
          <!-- Vector Checkmark Icon -->
          <td class="cps-icon-${id}" width="24" valign="middle" style="width:24px;vertical-align:middle;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </td>
          <!-- Details (Stacks cleanly into 3 lines on mobile) -->
          <td class="cps-text-${id}" valign="middle" style="vertical-align:middle;text-align:left;">
            <span style="font-family:${f};font-size:12.5px;font-weight:800;color:#0f172a;">
              VAT Registered Business
            </span>
            <span class="cps-pipe-${id}" style="color:#94a3b8;margin:0 6px;">|</span>
            <span style="font-family:'Courier New',Courier,monospace;font-size:11.5px;font-weight:700;color:#334155;">
              ${vat}
            </span>
            <span class="cps-pipe-${id}" style="color:#94a3b8;margin:0 6px;">|</span>
            <span style="font-family:${f};font-size:11.5px;color:#64748b;">
              Tax Invoice Included
            </span>
          </td>
          <!-- B2B Badge -->
          <td class="cps-badge-${id}" align="right" valign="middle" style="vertical-align:middle;text-align:right;">
            <span style="display:inline-block;padding:3px 10px;background:#ffffff;border:1px solid #cbd5e1;border-radius:12px;font-family:${f};font-size:9.5px;font-weight:800;color:#0f172a;">
              B2B READY
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. B2B CONTRACTOR STAMP (Industrial Tradesman, Mechanics & Construction)
// Heavy-duty warehouse / job-site stamped aesthetic with tax deductibility seal
// Fixed: Single-card table architecture, 100% full width, zero empty space gap!
// ─────────────────────────────────────────────────────────────────────────────
function b2bContractorStamp(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#fefce8')
  const borderCol = resolveBorder(p, '#b45309')
  const vat = resolveVatNumber(p, 'GB 123 4567 89')
  const title = resolveHeading(p, 'TRADE & COMMERCIAL VAT RECEIPT')
  const sub = resolveText(p, 'Essential for self-employed tradesmen, contractors & fleet operations. VAT schedule itemized for easy tax reporting.')

  return `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;width:100% !important;min-width:100% !important;font-family:${f};background-color:${bgCol};border:2px dashed ${borderCol};border-radius:8px;box-sizing:border-box;">
  <tr>
    <td style="${pad(p, 14, 18, 14, 18)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Left Circular Stamp -->
          <td width="72" valign="middle" align="center" style="padding-right:16px;">
            <div style="width:62px;height:62px;border-radius:31px;border:2px solid #b45309;background:#fef9c3;text-align:center;box-sizing:border-box;padding-top:7px;">
              <div style="font-family:'Courier New',Courier,monospace;font-size:8px;font-weight:900;color:#b45309;letter-spacing:1px;line-height:1;">TAX INVOICE</div>
              <div style="font-family:${f};font-size:17px;font-weight:900;color:#78350f;margin-top:2px;line-height:1.1;">20%</div>
              <div style="font-family:'Courier New',Courier,monospace;font-size:7.5px;font-weight:800;color:#b45309;line-height:1;">INCLUDED</div>
            </div>
          </td>
          <!-- Right Content -->
          <td valign="middle">
            <div style="font-family:'Courier New',Courier,monospace;font-size:13.5px;font-weight:900;color:#78350f;letter-spacing:0.5px;line-height:1.3;margin-bottom:3px;">
              ${title}
            </div>
            <div style="font-family:'Courier New',Courier,monospace;font-size:12px;font-weight:800;color:#b45309;margin-bottom:4px;">
              REGISTRATION ID: ${vat}
            </div>
            <div style="font-family:${f};font-size:12px;color:#78350f;line-height:1.45;">
              ${sub}
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. DIGITAL DOWNLOAD VAULT (Paperless Eco & Automated PDF Receipt Guarantee)
// Clean electronic styling emphasizing instant paperless accounting receipts
// ─────────────────────────────────────────────────────────────────────────────
function digitalDownloadVault(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#f8fafc')
  const borderCol = resolveBorder(p, '#ddd6fe')
  const accent = resolveAccent(p, '#7530fb')
  const title = resolveHeading(p, 'Paperless Electronic VAT Invoice')
  const vat = resolveVatNumber(p, 'GB 123 4567 89')
  const sub = resolveText(p, 'Your official PDF VAT receipt is dispatched directly to your registered email upon checkout for seamless Xero/QuickBooks sync.')

  return `<!--[riazify:vat_notice:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .ddv-pad-${id} { padding: 16px 12px !important; text-align: center !important; }
    .ddv-row-${id} { display: flex !important; flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 10px !important; width: 100% !important; }
    .ddv-icon-${id} { width: 100% !important; text-align: center !important; padding: 0 !important; margin: 0 auto !important; }
    .ddv-text-${id} { width: 100% !important; text-align: center !important; }
    .ddv-title-row-${id} { justify-content: center !important; }
    .ddv-badge-box-${id} { width: 100% !important; text-align: center !important; padding-left: 0 !important; }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;font-family:${f};background-color:${bgCol};border:1px solid ${borderCol};border-radius:8px;box-sizing:border-box;">
  <tr>
    <td class="ddv-pad-${id}" style="${pad(p, 14, 18, 14, 18)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr class="ddv-row-${id}">
          <!-- Vector Bolt Icon -->
          <td class="ddv-icon-${id}" width="42" valign="middle" style="width:42px;padding-right:12px;vertical-align:middle;text-align:left;">
            <div style="width:38px;height:38px;border-radius:8px;background:#f3eeff;border:1px solid #ddd6fe;display:flex;align-items:center;justify-content:center;margin:0 auto;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="${accent}" fill-opacity="0.15"/>
              </svg>
            </div>
          </td>
          <!-- Title & Subtitle -->
          <td class="ddv-text-${id}" valign="middle" style="vertical-align:middle;text-align:left;">
            <div class="ddv-title-row-${id}" style="display:flex;align-items:center;gap:8px;margin-bottom:3px;">
              <span style="font-family:${f};font-size:14px;font-weight:800;color:#1e1535;line-height:1.3;">
                ${title}
              </span>
              <span style="font-family:${f};font-size:9.5px;font-weight:700;color:${accent};background:#ffffff;padding:2px 7px;border-radius:10px;border:1px solid #ddd6fe;">
                DIGITAL PDF
              </span>
            </div>
            <div style="font-family:${f};font-size:12px;color:#6b7280;line-height:1.45;">
              ${sub}
            </div>
          </td>
          <!-- Registered Number Card (Centered on Mobile) -->
          <td class="ddv-badge-box-${id}" width="150" align="right" valign="middle" style="padding-left:10px;vertical-align:middle;text-align:right;">
            <div style="display:inline-block;background:#ffffff;border:1px solid #ddd6fe;border-radius:6px;padding:6px 12px;text-align:center;">
              <div style="font-family:${f};font-size:9px;font-weight:800;color:#6b7280;text-transform:uppercase;">REGISTERED NUMBER</div>
              <div style="font-family:'Courier New',Courier,monospace;font-size:12px;font-weight:900;color:${accent};margin-top:1px;">${vat}</div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. DUAL JURISDICTION UK & EU (Cross-Border Domestic & European IOSS)
// Reassures buyers in both UK and EU regarding VAT & customs clearance
// ─────────────────────────────────────────────────────────────────────────────
function dualJurisdictionEuUk(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#f8fafc')
  const borderCol = resolveBorder(p, '#cbd5e1')
  const title = resolveHeading(p, 'Dual Jurisdiction UK & EU Tax Compliant')
  const vat = resolveVatNumber(p, 'GB 123 4567 89')
  const sub = resolveText(p, 'UK domestic orders include 20% VAT invoice. European and international dispatches are processed with full customs declaration.')

  return `<!--[riazify:vat_notice:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .dju-top-row-${id} { display: flex !important; flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 4px !important; }
    .dju-top-text-${id} { text-align: center !important; width: 100% !important; }
    .dju-top-vat-${id} { text-align: center !important; width: 100% !important; }
    .dju-pad-${id} { text-align: center !important; padding: 14px 12px !important; }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;font-family:${f};background-color:${bgCol};border:1px solid ${borderCol};border-radius:8px;overflow:hidden;box-sizing:border-box;">
  <tr style="background:#0f172a;">
    <td style="padding:8px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr class="dju-top-row-${id}">
          <td class="dju-top-text-${id}">
            <span style="font-family:${f};font-size:10px;font-weight:800;color:#38bdf8;letter-spacing:1px;text-transform:uppercase;">
              UK VAT + EU IOSS / CUSTOMS COMPLIANT
            </span>
          </td>
          <td class="dju-top-vat-${id}" align="right">
            <span style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:800;color:#ffffff;background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:3px;">
              ${vat}
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td class="dju-pad-${id}" style="${pad(p, 12, 16, 12, 16)}background-color:${bgCol};">
      <div style="font-family:${f};font-size:13.5px;font-weight:800;color:#0f172a;margin-bottom:3px;line-height:1.3;">
        ${title}
      </div>
      <div style="font-family:${f};font-size:12px;color:#475569;line-height:1.45;">
        ${sub}
      </div>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// Accurate SVG Thumbnails (80x48 pixel-perfect representations of each layout)
// ─────────────────────────────────────────────────────────────────────────────

export const VAT_NOTICE_THUMBNAILS: Record<string, string> = {
  // 1. Classic Card
  'vat-classic-card': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="10" width="68" height="28" rx="3" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="11" y="18" width="8" height="12" rx="1" fill="#cbd5e1"/>
    <line x1="24" y1="19" x2="55" y2="19" stroke="#1e1535" stroke-width="1.5"/>
    <line x1="24" y1="26" x2="68" y2="26" stroke="#64748b" stroke-width="1"/>
  </svg>`,

  // 2. Official Certificate Badge
  'vat-official-certificate-badge': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="5" y="8" width="70" height="32" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="5" y="8" width="70" height="7" fill="#0f172a"/>
    <circle cx="15" cy="27" r="4" fill="#ecfdf5" stroke="#10b981" stroke-width="0.8"/>
    <line x1="23" y1="24" x2="48" y2="24" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="23" y1="30" x2="44" y2="30" stroke="#64748b" stroke-width="0.8"/>
    <rect x="53" y="20" width="18" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.6"/>
  </svg>`,

  // 3. Tax Breakdown Ledger
  'vat-tax-breakdown-ledger': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="5" y="6" width="70" height="36" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="5" y="6" width="70" height="8" fill="#f1f5f9"/>
    <line x1="9" y1="10" x2="35" y2="10" stroke="#0f172a" stroke-width="1.2"/>
    <rect x="9" y="19" width="18" height="18" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.6"/>
    <rect x="31" y="19" width="18" height="18" rx="1.5" fill="#eff6ff" stroke="#bfdbfe" stroke-width="0.6"/>
    <rect x="53" y="19" width="18" height="18" rx="1.5" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="0.6"/>
  </svg>`,

  // 4. Minimalist Hairline Editorial
  'vat-minimalist-hairline-rule': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="8" y1="12" x2="72" y2="12" stroke="#0f172a" stroke-width="1.5"/>
    <line x1="8" y1="18" x2="32" y2="18" stroke="#64748b" stroke-width="0.8"/>
    <line x1="48" y1="18" x2="72" y2="18" stroke="#0f172a" stroke-width="1"/>
    <line x1="8" y1="26" x2="42" y2="26" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="8" y1="32" x2="68" y2="32" stroke="#64748b" stroke-width="0.8"/>
    <line x1="8" y1="38" x2="72" y2="38" stroke="#e2e8f0" stroke-width="0.8"/>
  </svg>`,

  // 5. Split Guarantee Ribbon
  'vat-split-guarantee-ribbon': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="5" y="8" width="70" height="32" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="5" y="8" width="22" height="32" fill="#0f172a"/>
    <line x1="8" y1="18" x2="23" y2="18" stroke="#f59e0b" stroke-width="1.2"/>
    <line x1="8" y1="24" x2="25" y2="24" stroke="#ffffff" stroke-width="1.5"/>
    <line x1="33" y1="20" x2="56" y2="20" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="33" y1="28" x2="70" y2="28" stroke="#64748b" stroke-width="0.8"/>
  </svg>`,

  // 6. Corporate Security Seal
  'vat-corporate-security-seal': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="5" y="8" width="70" height="32" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="5" y="8" width="3" height="32" fill="#1e40af"/>
    <line x1="12" y1="15" x2="36" y2="15" stroke="#1e40af" stroke-width="1.2"/>
    <line x1="12" y1="21" x2="48" y2="21" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="12" y1="27" x2="68" y2="27" stroke="#64748b" stroke-width="0.8"/>
    <rect x="12" y="32" width="46" height="5" rx="1" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.6"/>
  </svg>`,

  // 7. Compact Pill Strip
  'vat-compact-pill-strip': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="17" width="68" height="14" rx="7" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.8"/>
    <circle cx="13" cy="24" r="2.5" fill="#16a34a"/>
    <line x1="19" y1="24" x2="46" y2="24" stroke="#0f172a" stroke-width="1.2"/>
    <rect x="56" y="20.5" width="14" height="7" rx="3.5" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.6"/>
  </svg>`,

  // 8. B2B Contractor Stamp
  'vat-b2b-contractor-stamp': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="5" y="8" width="70" height="32" rx="2" fill="#fefce8" stroke="#b45309" stroke-width="1" stroke-dasharray="2 1.5"/>
    <circle cx="18" cy="24" r="9" stroke="#b45309" stroke-width="1.2"/>
    <text x="18" y="26.5" font-size="6" font-weight="bold" fill="#78350f" text-anchor="middle">20%</text>
    <line x1="32" y1="19" x2="68" y2="19" stroke="#78350f" stroke-width="1.2"/>
    <line x1="32" y1="25" x2="58" y2="25" stroke="#b45309" stroke-width="1"/>
    <line x1="32" y1="31" x2="65" y2="31" stroke="#78350f" stroke-width="0.8"/>
  </svg>`,

  // 9. Digital Download Vault
  'vat-digital-download-vault': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="5" y="8" width="70" height="32" rx="3" fill="#f8f7ff" stroke="#ede9fe" stroke-width="0.8"/>
    <rect x="10" y="16" width="12" height="16" rx="2" fill="#f3eeff" stroke="#ddd6fe" stroke-width="0.8"/>
    <line x1="28" y1="19" x2="52" y2="19" stroke="#1e1535" stroke-width="1.2"/>
    <line x1="28" y1="27" x2="50" y2="27" stroke="#6b7280" stroke-width="0.8"/>
    <rect x="56" y="16" width="15" height="16" rx="2" fill="#ffffff" stroke="#ddd6fe" stroke-width="0.6"/>
  </svg>`,

  // 10. Dual Jurisdiction UK & EU
  'vat-dual-jurisdiction-eu-uk': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="5" y="8" width="70" height="32" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="5" y="8" width="70" height="8" fill="#0f172a"/>
    <line x1="9" y1="12" x2="38" y2="12" stroke="#38bdf8" stroke-width="1"/>
    <line x1="56" y1="12" x2="71" y2="12" stroke="#ffffff" stroke-width="1"/>
    <line x1="9" y1="24" x2="48" y2="24" stroke="#0f172a" stroke-width="1.2"/>
    <line x1="9" y1="31" x2="68" y2="31" stroke="#475569" stroke-width="0.8"/>
  </svg>`,
}

export function getVatNoticeThumbnailSvg(id: string): string {
  const clean = id
    .toLowerCase()
    .trim()
    .replace(/^vat[-_]/, '')
    .replace(/_/g, '-')

  const key = Object.keys(VAT_NOTICE_THUMBNAILS).find(k => {
    const kClean = k.toLowerCase().replace(/^vat[-_]/, '').replace(/_/g, '-')
    return k === id || kClean === clean || k.endsWith(clean) || clean.includes(kClean)
  })

  return key ? VAT_NOTICE_THUMBNAILS[key] : VAT_NOTICE_THUMBNAILS['vat-classic-card']
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported Variant Registry (All 10 Radically Distinct Architectures)
// ─────────────────────────────────────────────────────────────────────────────

export const vatNoticeVariants: BlockVariant[] = [
  {
    id: 'vat-classic-card',
    label: 'Classic VAT Card',
    description: 'Current classic soft-slate card with memo icon & clean border (KEPT 100% IDENTICAL)',
    thumbnail: VAT_NOTICE_THUMBNAILS['vat-classic-card'],
    toHtml(props, id) { return classicCard(props, id) },
  },
  {
    id: 'vat-official-certificate-badge',
    label: 'HMRC Certificate Badge',
    description: 'Official government compliance certificate layout with active tax registration seal',
    thumbnail: VAT_NOTICE_THUMBNAILS['vat-official-certificate-badge'],
    toHtml(props, id) { return officialCertificateBadge(props, id) },
  },
  {
    id: 'vat-tax-breakdown-ledger',
    label: 'B2B Tax Breakdown Ledger',
    description: '3-column commercial table highlighting Net, 20% VAT Rate, and invoice guarantee',
    thumbnail: VAT_NOTICE_THUMBNAILS['vat-tax-breakdown-ledger'],
    toHtml(props, id) { return taxBreakdownLedger(props, id) },
  },
  {
    id: 'vat-minimalist-hairline-rule',
    label: 'Minimalist Hairline Rule',
    description: 'Scandinavian clean hairline divider layout with uppercase tracking & monospaced ID',
    thumbnail: VAT_NOTICE_THUMBNAILS['vat-minimalist-hairline-rule'],
    toHtml(props, id) { return minimalistHairlineEditorial(props, id) },
  },
  {
    id: 'vat-split-guarantee-ribbon',
    label: 'Split Guarantee Ribbon',
    description: 'Dual-tone 26/74 split pillar with bold navy tax badge and seller credentials',
    thumbnail: VAT_NOTICE_THUMBNAILS['vat-split-guarantee-ribbon'],
    toHtml(props, id) { return splitGuaranteeRibbon(props, id) },
  },
  {
    id: 'vat-corporate-security-seal',
    label: 'Corporate Entity Seal',
    description: 'Enterprise disclosure card with UK tax jurisdiction and company registration number',
    thumbnail: VAT_NOTICE_THUMBNAILS['vat-corporate-security-seal'],
    toHtml(props, id) { return corporateSecuritySeal(props, id) },
  },
  {
    id: 'vat-compact-pill-strip',
    label: 'Mobile Capsule Pill Strip',
    description: 'Ultra-dense horizontal pill bar optimized for zero-scroll on mobile eBay apps',
    thumbnail: VAT_NOTICE_THUMBNAILS['vat-compact-pill-strip'],
    toHtml(props, id) { return compactPillStrip(props, id) },
  },
  {
    id: 'vat-b2b-contractor-stamp',
    label: 'Tradesman & Contractor Stamp',
    description: 'Industrial dashed border with 20% deduction circular stamp for trades & fleet',
    thumbnail: VAT_NOTICE_THUMBNAILS['vat-b2b-contractor-stamp'],
    toHtml(props, id) { return b2bContractorStamp(props, id) },
  },
  {
    id: 'vat-digital-download-vault',
    label: 'Digital PDF Invoice Vault',
    description: 'Paperless accounting notice guaranteeing direct electronic receipt for Xero/QuickBooks',
    thumbnail: VAT_NOTICE_THUMBNAILS['vat-digital-download-vault'],
    toHtml(props, id) { return digitalDownloadVault(props, id) },
  },
  {
    id: 'vat-dual-jurisdiction-eu-uk',
    label: 'Dual UK & EU IOSS Strip',
    description: 'Cross-border trading banner with UK domestic VAT and European customs clearance',
    thumbnail: VAT_NOTICE_THUMBNAILS['vat-dual-jurisdiction-eu-uk'],
    toHtml(props, id) { return dualJurisdictionEuUk(props, id) },
  },
]

// Backwards-compatible aliases
export const vatVariants = vatNoticeVariants
export const vatNoticeBlockVariants = vatNoticeVariants

/**
 * Robust Variant Resolver:
 * Supports variant IDs with or without the 'vat-' prefix
 * and matches shorthand IDs seamlessly.
 */
export function getVatNoticeVariant(id: string): BlockVariant {
  if (!id) return vatNoticeVariants[0]
  const clean = id
    .toLowerCase()
    .trim()
    .replace(/^vat[-_]/, '')
    .replace(/_/g, '-')

  const found = vatNoticeVariants.find(v => {
    const vClean = v.id.toLowerCase().replace(/^vat[-_]/, '').replace(/_/g, '-')
    return v.id === id || vClean === clean || v.id.endsWith(clean) || clean.includes(vClean)
  })

  return found ?? vatNoticeVariants[0]
}

export const getVatVariant = getVatNoticeVariant
