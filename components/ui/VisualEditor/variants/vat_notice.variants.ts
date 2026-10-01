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
    const title = resolveHeading(p, 'VAT Registered Business')
    const vat = resolveVatNumber(p, '{{VAT_NUMBER}}')
    const sub = resolveText(p, 'Full VAT invoice included with your order.')

    return `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}border:1px solid ${borderCol};border-radius:6px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="32" valign="top" style="padding-right:10px;font-size:16px;">
            &#128196;
          </td>
          <td valign="top">
            <p style="margin:0 0 2px;font-family:${f};font-size:13px;font-weight:700;color:${titleCol};">
              ${title}
            </p>
            <p style="margin:0;font-family:${f};font-size:12px;color:${textCol};line-height:1.5;">
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

    return `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};background-color:${bgCol};border:2px solid ${borderCol};border-radius:8px;overflow:hidden;box-sizing:border-box;">
  <!-- Top Official Security Rule -->
  <tr style="background:#0f172a;">
    <td style="padding:7px 18px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-family:'Courier New',Courier,monospace;font-size:9.5px;font-weight:800;color:#38bdf8;letter-spacing:1.5px;text-transform:uppercase;">
            TAX COMPLIANCE REGISTER // DOMESTIC COMMERCIAL ENTITY
          </td>
          <td align="right">
            <span style="display:inline-block;padding:2px 7px;background:#064e3b;border:1px solid ${accent};border-radius:3px;font-family:${f};font-size:9px;font-weight:800;color:#34d399;text-transform:uppercase;">
              ✓ VERIFIED ACTIVE
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Main Certificate Body -->
  <tr>
    <td style="${pad(p, 14, 18, 14, 18)}background-color:${bgCol};">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="42" valign="middle" style="padding-right:14px;">
            <div style="width:42px;height:42px;border-radius:21px;background:#ecfdf5;border:2px solid #a7f3d0;text-align:center;line-height:42px;font-size:20px;">
              🏛️
            </div>
          </td>
          <td valign="middle">
            <div style="font-family:${f};font-size:14px;font-weight:800;color:#0f172a;line-height:1.3;margin-bottom:3px;">
              ${title}
            </div>
            <div style="font-family:${f};font-size:12px;color:#475569;line-height:1.45;">
              ${sub}
            </div>
          </td>
          <td width="190" align="right" valign="middle" style="padding-left:12px;">
            <div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:6px;padding:6px 12px;text-align:center;">
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
  style="width:100%;max-width:700px;font-family:${f};background-color:${bgCol};border:1px solid ${borderCol};border-radius:8px;overflow:hidden;box-sizing:border-box;">
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

    return `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};background-color:${bgCol};border-top:2px solid #0f172a;border-bottom:1px solid ${borderCol};box-sizing:border-box;">
  <tr>
    <td style="${pad(p, 14, 16, 14, 16)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
              <span style="font-family:${f};font-size:9.5px;font-weight:800;letter-spacing:1.8px;color:#64748b;text-transform:uppercase;">
                COMMERCIAL ACCREDITATION • SECTION 09
              </span>
              <span style="font-family:'Courier New',Courier,monospace;font-size:11.5px;font-weight:700;color:#0f172a;letter-spacing:0.8px;">
                VAT REG NO: [ ${vat} ]
              </span>
            </div>
            <div style="font-family:${f};font-size:14px;font-weight:800;color:#0f172a;letter-spacing:0.2px;margin-bottom:3px;">
              ${title}
            </div>
            <div style="font-family:${f};font-size:12px;color:#64748b;line-height:1.5;">
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

    return `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};background-color:${bgCol};border:1px solid ${borderCol};border-radius:8px;overflow:hidden;box-sizing:border-box;">
  <tr>
    <!-- Left 26% Dark Pillar -->
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
    <!-- Right 74% Credentials & Copy -->
    <td width="74%" valign="middle" style="${pad(p, 14, 18, 14, 18)}background:#f8fafc;box-sizing:border-box;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <span style="font-family:${f};font-size:14px;font-weight:800;color:#0f172a;">
          ${title}
        </span>
        <span style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:800;color:#0f172a;background:#e2e8f0;padding:2px 6px;border-radius:3px;">
          ${vat}
        </span>
      </div>
      <div style="font-family:${f};font-size:12px;color:#475569;line-height:1.5;">
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

    return `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};background-color:${bgCol};border:1px solid ${borderCol};border-left:5px solid ${accent};border-radius:6px;overflow:hidden;box-sizing:border-box;">
  <tr>
    <td style="${pad(p, 14, 18, 14, 18)}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="display:inline-block;padding:2px 8px;background:#dbeafe;border:1px solid #bfdbfe;border-radius:3px;font-family:${f};font-size:9.5px;font-weight:800;color:${accent};text-transform:uppercase;">
          🛡️ REGISTERED LEGAL ENTITY
        </span>
        <span style="font-family:${f};font-size:10px;font-weight:700;color:#64748b;">
          JURISDICTION: UNITED KINGDOM
        </span>
      </div>
      <div style="font-family:${f};font-size:14px;font-weight:800;color:#0f172a;margin-bottom:4px;">
        ${title}
      </div>
      <div style="font-family:${f};font-size:12px;color:#475569;line-height:1.5;margin-bottom:9px;">
        ${sub}
      </div>
      <table cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:4px;">
        <tr>
          <td style="font-family:'Courier New',Courier,monospace;font-size:11px;color:#0f172a;font-weight:700;padding:6px 14px;">
            VAT NO: <strong>${vat}</strong>
          </td>
          <td style="border-left:1px solid #cbd5e1;padding:6px 14px;font-family:'Courier New',Courier,monospace;font-size:11px;color:#64748b;">
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

    return `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};background-color:${bgCol};border:1px solid ${borderCol};border-radius:28px;box-sizing:border-box;">
  <tr>
    <td style="${pad(p, 8, 16, 8, 16)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="24" valign="middle">
            <span style="font-size:14px;color:${accent};">✓</span>
          </td>
          <td valign="middle">
            <span style="font-family:${f};font-size:12.5px;font-weight:800;color:#0f172a;">
              VAT Registered Business
            </span>
            <span style="color:#94a3b8;margin:0 6px;">|</span>
            <span style="font-family:'Courier New',Courier,monospace;font-size:11.5px;font-weight:700;color:#334155;">
              ${vat}
            </span>
            <span style="color:#94a3b8;margin:0 6px;">|</span>
            <span style="font-family:${f};font-size:11.5px;color:#64748b;">
              Tax Invoice Included
            </span>
          </td>
          <td align="right" valign="middle">
            <span style="display:inline-block;padding:3px 9px;background:#ffffff;border:1px solid #cbd5e1;border-radius:12px;font-family:${f};font-size:9.5px;font-weight:800;color:#0f172a;">
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
  style="width:100%;max-width:700px;font-family:${f};background-color:${bgCol};border:2px dashed ${borderCol};border-radius:8px;box-sizing:border-box;">
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
    const bgCol = resolveBg(p, '#f8f7ff')
    const borderCol = resolveBorder(p, '#ddd6fe')
    const accent = resolveAccent(p, '#7530fb')
    const title = resolveHeading(p, 'Paperless Electronic VAT Invoice')
    const vat = resolveVatNumber(p, 'GB 123 4567 89')
    const sub = resolveText(p, 'Your official PDF VAT receipt is dispatched directly to your registered email upon checkout for seamless Xero/QuickBooks sync.')

    return `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};background-color:${bgCol};border:1px solid ${borderCol};border-radius:8px;box-sizing:border-box;">
  <tr>
    <td style="${pad(p, 14, 18, 14, 18)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="38" valign="middle" style="padding-right:12px;">
            <div style="width:38px;height:38px;border-radius:8px;background:#f3eeff;border:1px solid #ddd6fe;text-align:center;line-height:38px;font-size:19px;">
              ⚡
            </div>
          </td>
          <td valign="middle">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;">
              <span style="font-family:${f};font-size:14px;font-weight:800;color:#1e1535;">
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
          <td width="150" align="right" valign="middle" style="padding-left:10px;">
            <div style="background:#ffffff;border:1px solid #ddd6fe;border-radius:6px;padding:6px 10px;text-align:center;">
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

    return `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};background-color:${bgCol};border:1px solid ${borderCol};border-radius:8px;overflow:hidden;box-sizing:border-box;">
  <tr style="background:#0f172a;">
    <td style="padding:7px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <span style="font-family:${f};font-size:10px;font-weight:800;color:#38bdf8;letter-spacing:1px;text-transform:uppercase;">
              🇬🇧 UK VAT + 🇪🇺 EU IOSS / CUSTOMS COMPLIANT
            </span>
          </td>
          <td align="right">
            <span style="font-family:'Courier New',Courier,monospace;font-size:10.5px;font-weight:800;color:#ffffff;">
              ${vat}
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="${pad(p, 12, 16, 12, 16)}background-color:${bgCol};">
      <div style="font-family:${f};font-size:13.5px;font-weight:800;color:#0f172a;margin-bottom:3px;">
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
