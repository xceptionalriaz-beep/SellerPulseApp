// components/ui/VisualEditor/variants/satisfaction_guarantee.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Satisfaction Guarantee — 10 Radically Distinct, High-Converting Retail Layouts
// Built specifically for high-converting eBay & e-commerce listings.
// Zero generic AI-slop, zero cheesy glassmorphism, zero fake neon glows.
// 100% authentic, tangible, battle-tested retail architectures that buyers trust.
//
// 1. sg-golden-crest-emblem     — Royal golden laurel seal & heraldic merchant crest
// 2. sg-five-star-authority-card — High-volume PowerSeller 5.0 rating breakdown card
// 3. sg-split-contrast-promise   — Asymmetric deep slate vs emerald 3-commitment split
// 4. sg-engraved-warranty-ticket — Serialized security certificate with corner brackets
// 5. sg-handshake-seller-pledge  — Authentic small-business merchant letter & cursive signature
// 6. sg-three-pillar-shield-grid — 3-box protection matrix (Risk-Free, Instant Care, Safe Transit)
// 7. sg-minimalist-swiss-rule    — Architectural gallery minimalist hairline rule layout
// 8. sg-industrial-field-tested  — Rugged heavy-duty commercial assurance for tools & auto
// 9. sg-money-back-speed-ribbon  — High-velocity "Love It or Return It" direct conversion bar
// 10. sg-white-glove-concierge   — Aristocratic VIP concierge service assurance with bronze crest
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
  id: string
  label: string
  description: string
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

function guaranteeTitle(p: any, fallback = '100% Satisfaction Guaranteed'): string {
  return p.heading ?? p.title ?? p.guaranteeTitle ?? p.bannerTitle ?? fallback
}

function guaranteeSubtext(p: any, fallback = 'Trusted by thousands of eBay buyers. Your complete satisfaction is our highest priority.'): string {
  return p.subText ?? p.subtitle ?? p.guaranteeSubtext ?? p.bannerSubtitle ?? fallback
}

function badgeLabel(p: any, fallback = 'BUYER PROTECTION'): string {
  return p.badgeText ?? p.badge ?? p.tag ?? fallback
}

/**
 * List of known template defaults across blocks and previous variants.
 * When switching styles, if current bgColor is in this list, the style
 * automatically adopts its own signature palette.
 */
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
// 1. ROYAL GOLDEN CREST & LAUREL SEAL
// Deep navy container with ornate dual-ring gold laurel medal & star crest
// ─────────────────────────────────────────────────────────────────────────────
function goldenCrestEmblem(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#090d16')
  const textCol = resolveText(p, '#ffffff')
  const gold = resolveAccent(p, '#d4af37')
  const title = guaranteeTitle(p, '100% SATISFACTION GUARANTEED')
  const subtitle = guaranteeSubtext(p, 'Every purchase is backed by our direct merchant warranty. If you are not completely delighted, we will make it right.')
  const tag = badgeLabel(p, 'HERITAGE BUYER PROTECTION')

  return `<!--[riazify:satisfaction_guarantee:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .glc-tbl-${id},
    .glc-tbl-${id} tbody,
    .glc-tbl-${id} tr {
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    .glc-seal-col-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 0 12px 0 !important;
      box-sizing: border-box !important;
    }
    .glc-seal-box-${id} {
      margin: 0 auto !important;
    }
    .glc-text-col-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 0 14px 0 !important;
      box-sizing: border-box !important;
    }
    .glc-badges-col-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      border-left: none !important;
      border-top: 1px solid #1e293b !important;
      padding: 12px 0 0 0 !important;
      box-sizing: border-box !important;
    }
    .glc-badges-wrap-${id} {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      flex-wrap: wrap !important;
      gap: 6px 14px !important;
      text-align: center !important;
    }
    .glc-badges-wrap-${id} div {
      margin-bottom: 0 !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:1.5px solid ${gold};border-radius:0;${pad(p, 18, 20, 18, 20)}box-sizing:border-box;width:100%;">
      <table class="glc-tbl-${id}" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Left: Circular Gold Laurel Seal -->
          <td class="glc-seal-col-${id}" width="80" style="width:80px;vertical-align:middle;text-align:center;padding-right:16px;box-sizing:border-box;">
            <div class="glc-seal-box-${id}" style="width:72px;height:72px;border:2px solid ${gold};border-radius:50%;text-align:center;box-sizing:border-box;padding:8px 2px;background-color:#111827;">
              <div style="color:${gold};font-size:16px;line-height:1;">★</div>
              <div style="color:${gold};font-size:8px;font-weight:900;letter-spacing:1px;margin-top:2px;">100%</div>
              <div style="color:#ffffff;font-size:7px;font-weight:800;letter-spacing:0.5px;">GUARANTEED</div>
            </div>
          </td>

          <!-- Main Text -->
          <td class="glc-text-col-${id}" style="text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div style="margin-bottom:4px;">
              <span style="display:inline-block;color:${gold};font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">
                ◆ ${tag} ◆
              </span>
            </div>
            <div style="color:${textCol};font-size:17.5px;font-weight:800;letter-spacing:0.5px;line-height:1.25;margin:0 0 4px 0;">
              ${title}
            </div>
            <div style="color:#94a3b8;font-size:12px;font-weight:400;line-height:1.45;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Right: Trust Badges Checklist -->
          <td class="glc-badges-col-${id}" width="160" style="width:160px;text-align:right;vertical-align:middle;padding-left:14px;border-left:1px solid #1e293b;box-sizing:border-box;">
            <div class="glc-badges-wrap-${id}">
              <div style="color:${gold};font-size:11px;font-weight:800;margin-bottom:4px;white-space:nowrap;">&#10003; Zero-Risk Order</div>
              <div style="color:#e2e8f0;font-size:10px;font-weight:600;margin-bottom:4px;white-space:nowrap;">&#10003; 30-Day Resolution</div>
              <div style="color:#10b981;font-size:10px;font-weight:700;white-space:nowrap;">&#10003; Direct Support</div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:satisfaction_guarantee:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. POWERSELLER 5-STAR FEEDBACK BREAKDOWN
// Clean white retail card with prominent 5.0 rating block & 3-column micro-stats
// ─────────────────────────────────────────────────────────────────────────────
function fiveStarAuthorityCard(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#0f172a')
  const starCol = resolveAccent(p, '#f59e0b')
  const title = guaranteeTitle(p, 'TOP RATED SELLER — 100% SATISFACTION GUARANTEED')
  const subtitle = guaranteeSubtext(p, 'Over 10,000+ happy buyers trust our store for authentic merchandise, rapid dispatch, and dedicated customer care.')
  const tag = badgeLabel(p, 'VERIFIED POWERSELLER')

  return `<!--[riazify:satisfaction_guarantee:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .fsa-tbl-${id},
    .fsa-tbl-${id} tbody,
    .fsa-tbl-${id} tr {
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    .fsa-score-col-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 0 12px 0 !important;
      box-sizing: border-box !important;
    }
    .fsa-score-box-${id} {
      margin: 0 auto !important;
      max-width: 130px !important;
    }
    .fsa-text-col-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 0 14px 0 !important;
      box-sizing: border-box !important;
    }
    .fsa-badge-col-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      border-left: none !important;
      border-top: 1px solid #f1f5f9 !important;
      padding: 12px 0 0 0 !important;
      box-sizing: border-box !important;
    }
    .fsa-badge-box-${id} {
      display: inline-block !important;
      margin: 0 auto !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #e2e8f0;border-radius:0;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table class="fsa-tbl-${id}" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- 5.0 Score Box -->
          <td class="fsa-score-col-${id}" width="90" style="width:90px;text-align:center;vertical-align:middle;box-sizing:border-box;">
            <div class="fsa-score-box-${id}" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:0;padding:8px 6px;">
              <div style="color:${textCol};font-size:22px;font-weight:900;line-height:1;">5.0</div>
              <div style="color:${starCol};font-size:13px;margin:2px 0;">★★★★★</div>
              <div style="color:#64748b;font-size:8px;font-weight:700;letter-spacing:0.5px;">10,000+ REVIEWS</div>
            </div>
          </td>

          <!-- Content Details -->
          <td class="fsa-text-col-${id}" style="text-align:left;vertical-align:middle;padding:0 16px;box-sizing:border-box;">
            <div style="margin-bottom:4px;">
              <span style="display:inline-block;background-color:#fef3c7;color:#92400e;font-size:9.5px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:2px 7px;border-radius:0;">
                ${tag}
              </span>
              <span style="color:#16a34a;font-size:10.5px;font-weight:800;margin-left:8px;">
                ● 99.8% Positive Feedback
              </span>
            </div>
            <div style="color:${textCol};font-size:16px;font-weight:900;line-height:1.25;margin:0 0 4px 0;">
              ${title}
            </div>
            <div style="color:#475569;font-size:11.5px;font-weight:400;line-height:1.4;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Right Badge Pill -->
          <td class="fsa-badge-col-${id}" width="130" style="width:130px;text-align:center;vertical-align:middle;border-left:1px solid #f1f5f9;padding-left:12px;box-sizing:border-box;">
            <div class="fsa-badge-box-${id}" style="background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:0;padding:6px 12px;">
              <div style="color:#065f46;font-size:11px;font-weight:900;">&#10003; VERIFIED</div>
              <div style="color:#047857;font-size:9px;font-weight:700;margin-top:2px;">Money Back Guarantee</div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:satisfaction_guarantee:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ASYMMETRIC SLATE VS EMERALD PROMISE SPLIT
// Left deep slate block ("Our Pledge") vs Right 3-commitment emerald checklist
// ─────────────────────────────────────────────────────────────────────────────
function splitContrastPromise(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#0f172a')
  const green = resolveAccent(p, '#10b981')
  const title = guaranteeTitle(p, 'OUR SATISFACTION COMMITMENT')
  const subtitle = guaranteeSubtext(p, 'Shop with total confidence. We stand behind every listing 100%.')
  const tag = badgeLabel(p, 'ZERO RISK')

  return `<!--[riazify:satisfaction_guarantee:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;font-family:${f};border-collapse:separate !important;margin:0 auto;border:1.5px solid #e2e8f0;border-radius:8px !important;-webkit-border-radius:8px;background-color:${bgCol};box-sizing:border-box;">
  <tr>
    <td style="padding:6px;box-sizing:border-box;width:100%;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate !important;width:100%;">
        <tr>
          <!-- Left: Dark Box (Curved on all 4 corners) -->
          <td width="46%" style="width:46%;vertical-align:middle;padding:4px;box-sizing:border-box;">
            <div style="background-color:#0f172a;border-radius:8px !important;-webkit-border-radius:8px;padding:16px 14px;box-sizing:border-box;text-align:left;display:block;">
              <div style="color:${green};font-size:9px;font-weight:900;letter-spacing:1px;text-transform:uppercase;line-height:1.2;margin-bottom:4px;">
                ★ ${tag} GUARANTEE ★
              </div>
              <div style="color:#ffffff;font-size:15px;font-weight:900;letter-spacing:0.2px;line-height:1.25;margin:0 0 5px 0;">
                ${title}
              </div>
              <div style="color:#94a3b8;font-size:11px;font-weight:400;line-height:1.35;margin:0;">
                ${subtitle}
              </div>
            </div>
          </td>

          <!-- Right: 3-Commitment Checklist -->
          <td width="54%" style="width:54%;background-color:#ffffff;padding:8px 12px 8px 10px;vertical-align:middle;box-sizing:border-box;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
              <tr>
                <td width="20" valign="top" style="color:${green};font-size:14px;font-weight:900;line-height:1.2;padding-bottom:8px;">&#10003;</td>
                <td style="padding-bottom:8px;padding-left:4px;box-sizing:border-box;">
                  <div style="color:${textCol};font-size:12px;font-weight:800;line-height:1.25;">100% Accurate As Described</div>
                  <div style="color:#64748b;font-size:10px;line-height:1.3;margin-top:1px;">What you see in photos is exactly what arrives.</div>
                </td>
              </tr>
              <tr>
                <td width="20" valign="top" style="color:${green};font-size:14px;font-weight:900;line-height:1.2;padding-bottom:8px;">&#10003;</td>
                <td style="padding-bottom:8px;padding-left:4px;box-sizing:border-box;">
                  <div style="color:${textCol};font-size:12px;font-weight:800;line-height:1.25;">Lightning Fast Response</div>
                  <div style="color:#64748b;font-size:10px;line-height:1.3;margin-top:1px;">Real human support answers queries within hours.</div>
                </td>
              </tr>
              <tr>
                <td width="20" valign="top" style="color:${green};font-size:14px;font-weight:900;line-height:1.2;">&#10003;</td>
                <td style="padding-left:4px;box-sizing:border-box;">
                  <div style="color:${textCol};font-size:12px;font-weight:800;line-height:1.25;">Hassle-Free Full Refund</div>
                  <div style="color:#64748b;font-size:10px;line-height:1.3;margin-top:1px;">Simple returns with immediate payment reversal.</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:satisfaction_guarantee:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ENGRAVED SECURITY CERTIFICATE & SERIAL NUMBER
// Banknote styling with corner brackets, ornate border & serial registration
// ─────────────────────────────────────────────────────────────────────────────
function engravedWarrantyTicket(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#fffdfa')
  const textCol = resolveText(p, '#1c1917')
  const accent = resolveAccent(p, '#0284c7')
  const title = guaranteeTitle(p, 'CERTIFICATE OF QUALITY & BUYER SATISFACTION')
  const subtitle = guaranteeSubtext(p, 'Every unit in this listing has passed rigorous inspection. Full exchange or refund guaranteed if not 100% satisfied.')
  const tag = badgeLabel(p, 'OFFICIAL WARRANTY')

  return `<!--[riazify:satisfaction_guarantee:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:2px solid #cbd5e1;border-radius:0;padding:6px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="border:1px dashed #94a3b8;border-radius:0;width:100%;${pad(p, 14, 18, 14, 18)}box-sizing:border-box;">
        <tr>
          <!-- Content -->
          <td style="text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div style="color:#64748b;font-size:9px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:3px;">
              [⌜ CERTIFICATE ID: #EBAY-${id.slice(0, 6).toUpperCase()} ⌝]
            </div>
            <div style="color:${textCol};font-size:16px;font-weight:900;letter-spacing:0.3px;line-height:1.25;margin:0 0 3px 0;">
              ${title}
            </div>
            <div style="color:#475569;font-size:11.5px;font-weight:400;line-height:1.45;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Certified Seal Box -->
          <td width="150" style="width:150px;text-align:center;vertical-align:middle;padding-left:14px;border-left:1px dashed #cbd5e1;box-sizing:border-box;">
            <div style="color:${accent};font-size:13px;font-weight:900;letter-spacing:1px;line-height:1.1;">
              ★ 100% ★
            </div>
            <div style="color:#0f172a;font-size:10.5px;font-weight:900;margin:3px 0;">
              AUTHORIZED
            </div>
            <div style="color:#16a34a;font-size:9.5px;font-weight:800;">
              &#10003; Authentic Seller
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:satisfaction_guarantee:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. SMALL-BUSINESS MERCHANT PLEDGE & FOUNDER SIGNATURE
// Warm ivory card with stylized quotation, personal promise, and cursive signoff
// ─────────────────────────────────────────────────────────────────────────────
function handshakeSellerPledge(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#fffdfa')
  const textCol = resolveText(p, '#1c1917')
  const accent = resolveAccent(p, '#7530fb')
  const title = guaranteeTitle(p, 'A Personal Guarantee From Our Team')
  const subtitle = guaranteeSubtext(p, '"We are an independent small business. If you are not completely thrilled with your order, message us directly and we will replace or refund it immediately with zero hassle."')
  const tag = badgeLabel(p, 'OUR PROMISE')

  return `<!--[riazify:satisfaction_guarantee:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .hsp-tbl-${id},
    .hsp-tbl-${id} tbody,
    .hsp-tbl-${id} tr {
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    .hsp-icon-col-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 0 10px 0 !important;
      box-sizing: border-box !important;
    }
    .hsp-text-col-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 0 14px 0 !important;
      box-sizing: border-box !important;
    }
    .hsp-stamp-col-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      border-top: 1px solid #e7e5e4 !important;
      padding: 12px 0 0 0 !important;
      box-sizing: border-box !important;
    }
    .hsp-stamp-box-${id} {
      display: inline-block !important;
      margin: 0 auto !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #e7e5e4;border-radius:0;background-color:${bgCol};">
  <tr>
    <td style="${pad(p, 18, 22, 18, 22)}box-sizing:border-box;">
      <table class="hsp-tbl-${id}" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Stylized Handshake Icon -->
          <td class="hsp-icon-col-${id}" width="48" style="width:48px;vertical-align:top;text-align:center;box-sizing:border-box;">
            <div style="font-size:28px;line-height:1;">🤝</div>
          </td>

          <!-- Letter Content -->
          <td class="hsp-text-col-${id}" style="text-align:left;vertical-align:middle;padding:0 14px;box-sizing:border-box;">
            <div style="color:${accent};font-size:9.5px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:3px;">
              ${tag}
            </div>
            <div style="color:${textCol};font-size:16.5px;font-weight:900;line-height:1.3;margin:0 0 4px 0;">
              ${title}
            </div>
            <div style="color:#57534e;font-size:12px;font-weight:400;font-style:italic;line-height:1.5;margin:0 0 6px 0;">
              ${subtitle}
            </div>
            <div style="color:#78716c;font-size:11px;font-weight:700;letter-spacing:0.5px;">
              &mdash; The Customer Care & Quality Team
            </div>
          </td>

          <!-- Right Stamp -->
          <td class="hsp-stamp-col-${id}" width="130" style="width:130px;text-align:center;vertical-align:middle;box-sizing:border-box;">
            <div class="hsp-stamp-box-${id}" style="border:1.5px solid #d6d3d1;border-radius:0;padding:8px 14px;background-color:#ffffff;">
              <div style="color:#16a34a;font-size:14px;line-height:1;">&#10003;</div>
              <div style="color:#1c1917;font-size:10px;font-weight:900;margin-top:2px;">100% PLEDGE</div>
              <div style="color:#78716c;font-size:8.5px;font-weight:600;">Real Human Care</div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:satisfaction_guarantee:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. 3-PILLAR PROTECTION SHIELD MATRIX
// 3 distinct side-by-side cards (Risk-Free, Instant Resolution, Transit Insurance)
// ─────────────────────────────────────────────────────────────────────────────
function threePillarShieldGrid(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#0f172a')
  const accent = resolveAccent(p, '#2563eb')
  const title = guaranteeTitle(p, 'COMPLETE 3-WAY BUYER PROTECTION GUARANTEE')
  const subtitle = guaranteeSubtext(p, 'Every order placed with us is shielded by three unconditional buyer protections.')
  const tag = badgeLabel(p, 'TRIPLE SHIELD')

  return `<!--[riazify:satisfaction_guarantee:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .tps-hdr-tbl-${id},
    .tps-hdr-tbl-${id} tbody,
    .tps-hdr-tbl-${id} tr {
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    .tps-hdr-left-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      margin-bottom: 6px !important;
      box-sizing: border-box !important;
    }
    .tps-hdr-title-${id} {
      display: block !important;
      margin-left: 0 !important;
      margin-top: 5px !important;
      font-size: 15px !important;
      line-height: 1.3 !important;
    }
    .tps-hdr-right-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      line-height: 1.45 !important;
      padding: 0 4px !important;
      box-sizing: border-box !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #e2e8f0;border-radius:0;overflow:hidden;background-color:${bgCol};">
  <!-- Header Bar -->
  <tr>
    <td style="background-color:#f8fafc;border-bottom:1px solid #e2e8f0;${pad(p, 12, 18, 12, 18)}box-sizing:border-box;">
      <table class="tps-hdr-tbl-${id}" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Header Left: Tag & Title -->
          <td class="tps-hdr-left-${id}" style="text-align:left;vertical-align:middle;box-sizing:border-box;">
            <span style="display:inline-block;background-color:#dbeafe;color:${accent};font-size:9.5px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:2px 7px;border-radius:0;">
              ${tag}
            </span>
            <span class="tps-hdr-title-${id}" style="color:${textCol};font-size:14.5px;font-weight:900;margin-left:8px;vertical-align:middle;">
              ${title}
            </span>
          </td>

          <!-- Header Right: Subtext Description -->
          <td class="tps-hdr-right-${id}" style="text-align:right;color:#64748b;font-size:11px;font-weight:600;vertical-align:middle;box-sizing:border-box;">
            ${subtitle}
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- 3 Pillar Columns (Untouched) -->
  <tr>
    <td style="padding:12px 14px;box-sizing:border-box;background-color:${bgCol};">
      <table width="100%" cellpadding="0" cellspacing="8" border="0" style="border-collapse:separate;">
        <tr>
          <!-- Pillar 1 -->
          <td width="33%" align="center" style="background-color:#f8fafc;border:1px solid #cbd5e1;border-radius:0;padding:12px 8px;">
            <div style="font-size:20px;margin-bottom:4px;">🛡️</div>
            <div style="color:#0f172a;font-size:12px;font-weight:900;">100% Risk Free</div>
            <div style="color:#64748b;font-size:10px;line-height:1.4;margin-top:3px;">Full refund if item fails to match expectations.</div>
          </td>

          <!-- Pillar 2 -->
          <td width="33%" align="center" style="background-color:#eff6ff;border:1.5px solid ${accent};border-radius:0;padding:12px 8px;">
            <div style="font-size:20px;margin-bottom:4px;">⚡</div>
            <div style="color:${accent};font-size:12px;font-weight:900;">Rapid Care</div>
            <div style="color:#1d4ed8;font-size:10px;line-height:1.4;margin-top:3px;">Direct seller response within 2-4 business hours.</div>
          </td>

          <!-- Pillar 3 -->
          <td width="33%" align="center" style="background-color:#f0fdf4;border:1px solid #86efac;border-radius:0;padding:12px 8px;">
            <div style="font-size:20px;margin-bottom:4px;">📦</div>
            <div style="color:#15803d;font-size:12px;font-weight:900;">Safe Transit</div>
            <div style="color:#166534;font-size:10px;line-height:1.4;margin-top:3px;">Free immediate replacement if damaged in transit.</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:satisfaction_guarantee:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. BOUTIQUE SCANDINAVIAN MINIMALIST
// Understated pure white card with hairline rules and wide typographic tracking
// ─────────────────────────────────────────────────────────────────────────────
function minimalistSwissRule(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#18181b')
  const accent = resolveAccent(p, '#71717a')
  const title = guaranteeTitle(p, 'ASSURANCE OF QUALITY & CRAFTSMANSHIP')
  const subtitle = guaranteeSubtext(p, 'Every order is inspected by hand prior to secure packaging. Complete buyer peace of mind is unconditionally guaranteed.')
  const tag = badgeLabel(p, 'GUARANTEED STANDARD')

  return `<!--[riazify:satisfaction_guarantee:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .msr-tbl-${id},
    .msr-tbl-${id} tbody,
    .msr-tbl-${id} tr {
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    .msr-text-col-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 0 14px 0 !important;
      box-sizing: border-box !important;
    }
    .msr-status-col-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 12px 0 0 0 !important;
      border-top: 1px solid #e4e4e7 !important;
      box-sizing: border-box !important;
    }
    .msr-status-box-${id} {
      border-left: none !important;
      padding-left: 0 !important;
      display: inline-block !important;
      text-align: center !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;margin:0 auto;border:1px solid #e4e4e7;border-radius:0;background-color:${bgCol};">
  <tr>
    <td style="background-color:${bgCol};border-radius:0;${pad(p, 20, 24, 20, 24)}box-sizing:border-box;">
      <table class="msr-tbl-${id}" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Minimal Typography -->
          <td class="msr-text-col-${id}" style="text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div style="color:${accent};font-size:9.5px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:4px;">
              ${tag}
            </div>
            <div style="color:${textCol};font-size:16.5px;font-weight:600;letter-spacing:1px;line-height:1.3;margin:0 0 4px 0;">
              ${title}
            </div>
            <div style="color:#71717a;font-size:12px;font-weight:400;line-height:1.5;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Right Hairline Border & Status -->
          <td class="msr-status-col-${id}" width="160" style="width:160px;text-align:right;vertical-align:middle;padding-left:16px;box-sizing:border-box;">
            <div class="msr-status-box-${id}" style="display:inline-block;border-left:1px solid #d4d4d8;padding-left:14px;text-align:left;">
              <div style="color:#18181b;font-size:12px;font-weight:700;letter-spacing:0.5px;">
                100% PLEDGE
              </div>
              <div style="color:#71717a;font-size:10px;font-weight:500;margin-top:2px;">
                Hand-Inspected Lot
              </div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:satisfaction_guarantee:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. RUGGED INDUSTRIAL FIELD-TESTED BADGE
// Dark charcoal/slate card with safety yellow hazard accents for tools & auto parts
// ─────────────────────────────────────────────────────────────────────────────
function industrialFieldTested(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#18181b')
  const textCol = resolveText(p, '#f4f4f5')
  const yellow = resolveAccent(p, '#f59e0b')
  const title = guaranteeTitle(p, 'COMMERCIAL GRADE GUARANTEE — TESTED & VERIFIED')
  const subtitle = guaranteeSubtext(p, 'Built tough for rigorous everyday use. If this part fails to meet your performance standards, return it for an immediate replacement.')
  const tag = badgeLabel(p, 'HEAVY DUTY STANDARD')

  return `<!--[riazify:satisfaction_guarantee:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;font-family:${f};border-collapse:collapse;margin:0 auto;border:2px solid ${yellow};border-radius:0;overflow:hidden;background-color:${bgCol};">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 16, 22, 16, 22)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Content -->
          <td style="text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div style="margin-bottom:6px;">
              <span style="display:inline-block;background-color:${yellow};color:#000000;font-size:10px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:2px 7px;border-radius:2px;">
                ${tag}
              </span>
              <span style="color:#a1a1aa;font-size:11px;font-weight:700;margin-left:8px;">
                ● Workshop & Field Verified
              </span>
            </div>
            <div style="color:${textCol};font-size:16.5px;font-weight:900;letter-spacing:0.2px;line-height:1.25;margin:0 0 4px 0;">
              ${title}
            </div>
            <div style="color:#d4d4d8;font-size:12px;font-weight:400;line-height:1.4;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Right Status Box -->
          <td width="160" style="width:160px;text-align:right;vertical-align:middle;padding-left:14px;box-sizing:border-box;">
            <div style="background-color:#27272a;border:1.5px solid #3f3f46;border-radius:0;padding:8px 12px;text-align:center;">
              <div style="color:${yellow};font-size:13px;font-weight:900;line-height:1.2;">
                100% BACKED
              </div>
              <div style="color:#e4e4e7;font-size:10px;font-weight:700;margin-top:2px;">
                Direct Replacement
              </div>
              <div style="color:#10b981;font-size:9.5px;font-weight:800;margin-top:2px;">
                &#10003; OEM Verified
              </div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:satisfaction_guarantee:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. HIGH-VELOCITY "LOVE IT OR RETURN IT" RIBBON
// Deep sapphire/violet high-contrast conversion ribbon bar
// ─────────────────────────────────────────────────────────────────────────────
function moneyBackSpeedRibbon(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#1e1b4b') // deep indigo
  const textCol = resolveText(p, '#ffffff')
  const accent = resolveAccent(p, '#38bdf8') // electric sky cyan
  const title = guaranteeTitle(p, 'LOVE IT OR RETURN IT — 100% RISK-FREE TRIAL')
  const subtitle = guaranteeSubtext(p, 'Take 30 days to test and enjoy your item. Not completely thrilled? Return it for an instant 100% refund.')
  const tag = badgeLabel(p, 'ZERO RISK')

  return `<!--[riazify:satisfaction_guarantee:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border-radius:0;${pad(p, 16, 22, 16, 22)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Content -->
          <td style="text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div style="margin-bottom:5px;">
              <span style="display:inline-block;background-color:#312e81;color:${accent};font-size:10px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:2px 8px;border-radius:0;border:1px solid #4338ca;">
                ${tag}
              </span>
              <span style="color:#c7d2fe;font-size:11px;font-weight:700;margin-left:8px;">
                ★ 30-Day Hassle-Free Trial
              </span>
            </div>
            <div style="color:${textCol};font-size:17.5px;font-weight:900;letter-spacing:0.2px;line-height:1.25;margin:0 0 4px 0;">
              ${title}
            </div>
            <div style="color:#c7d2fe;font-size:12px;font-weight:400;line-height:1.4;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Right Action Pill -->
          <td width="160" style="width:160px;text-align:right;vertical-align:middle;padding-left:14px;box-sizing:border-box;">
            <div style="display:inline-block;background-color:#ffffff;color:#1e1b4b;font-size:11.5px;font-weight:900;letter-spacing:0.5px;padding:8px 14px;border-radius:0;text-align:center;">
              <div>&#10003; 100% REFUND</div>
              <div style="color:#4338ca;font-size:9.5px;font-weight:700;margin-top:2px;">No Questions Asked</div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:satisfaction_guarantee:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. ARISTOCRATIC WHITE-GLOVE VIP CONCIERGE ASSURANCE
// Deep plum velvet card with champagne bronze seal & dedicated VIP care
// ─────────────────────────────────────────────────────────────────────────────
function whiteGloveConcierge(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#161324') // deep plum obsidian
  const textCol = resolveText(p, '#ffffff')
  const bronze = resolveAccent(p, '#fbbf24')
  const title = guaranteeTitle(p, 'WHITE-GLOVE CONCIERGE & COLLECTOR ASSURANCE')
  const subtitle = guaranteeSubtext(p, 'Every transaction includes direct priority seller messaging, insured parcel packaging, and dedicated resolution.')
  const tag = badgeLabel(p, '✦ VIP CONCIERGE ✦')

  return `<!--[riazify:satisfaction_guarantee:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .wgv-tbl-${id},
    .wgv-tbl-${id} tbody,
    .wgv-tbl-${id} tr {
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    .wgv-icon-col-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 0 8px 0 !important;
      box-sizing: border-box !important;
    }
    .wgv-text-col-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 0 14px 0 !important;
      box-sizing: border-box !important;
    }
    .wgv-badge-col-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 12px 0 0 0 !important;
      border-top: 1px solid rgba(251, 191, 36, 0.25) !important;
      box-sizing: border-box !important;
    }
    .wgv-badge-box-${id} {
      display: inline-block !important;
      margin: 0 auto !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid ${bronze};border-radius:0;overflow:hidden;background-color:${bgCol};">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 18, 20, 18, 20)}box-sizing:border-box;">
      <table class="wgv-tbl-${id}" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Left Icon & Details -->
          <td class="wgv-icon-col-${id}" width="40" style="width:40px;vertical-align:middle;text-align:center;box-sizing:border-box;">
            <div style="font-size:24px;line-height:1;color:${bronze};">✦</div>
          </td>

          <td class="wgv-text-col-${id}" style="text-align:left;vertical-align:middle;padding:0 12px;box-sizing:border-box;">
            <div style="margin-bottom:6px;">
              <span style="display:inline-block;background-color:#231d38;color:${bronze};font-size:10px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:2px 8px;border-radius:0;border:1px solid ${bronze};">
                ${tag}
              </span>
              <span style="color:#e9d5ff;font-size:11px;font-weight:700;margin-left:8px;">
                Direct Seller Priority
              </span>
            </div>
            <div style="color:${textCol};font-size:17px;font-weight:800;letter-spacing:0.2px;line-height:1.25;margin:0 0 4px 0;">
              ${title}
            </div>
            <div style="color:#d8b4fe;font-size:12px;font-weight:400;line-height:1.4;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Right Badge -->
          <td class="wgv-badge-col-${id}" width="150" style="width:150px;text-align:right;vertical-align:middle;padding-left:12px;box-sizing:border-box;">
            <div class="wgv-badge-box-${id}" style="background-color:#231d38;border:1px solid ${bronze};border-radius:0;padding:8px 14px;text-align:center;">
              <div style="color:${bronze};font-size:12px;font-weight:900;line-height:1.2;">
                100% PLEDGE
              </div>
              <div style="color:#ffffff;font-size:9.5px;font-weight:700;margin-top:2px;">
                Priority Handling
              </div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:satisfaction_guarantee:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported Variant Registry (All 10 Distinct Layout Architectures)
// ─────────────────────────────────────────────────────────────────────────────
export const satisfactionGuaranteeVariants: BlockVariant[] = [
  {
    id: 'sg-golden-crest-emblem',
    label: 'Golden Laurel Crest',
    description: 'Royal golden wax seal & heraldic merchant crest for heritage credibility',
    toHtml(props, id) { return goldenCrestEmblem(props, id) },
  },
  {
    id: 'sg-five-star-authority-card',
    label: '5-Star Authority Card',
    description: 'High-volume PowerSeller 5.0 rating card with 10k+ verified reviews',
    toHtml(props, id) { return fiveStarAuthorityCard(props, id) },
  },
  {
    id: 'sg-split-contrast-promise',
    label: 'Contrast Promise Split',
    description: 'Asymmetric deep slate vs emerald 3-commitment resolution checklist',
    toHtml(props, id) { return splitContrastPromise(props, id) },
  },
  {
    id: 'sg-engraved-warranty-ticket',
    label: 'Engraved Security Ticket',
    description: 'Serialized certificate with corner brackets and authorized seal',
    toHtml(props, id) { return engravedWarrantyTicket(props, id) },
  },
  {
    id: 'sg-handshake-seller-pledge',
    label: 'Merchant Handshake Letter',
    description: 'Warm small-business founder pledge with quotation and team signature',
    toHtml(props, id) { return handshakeSellerPledge(props, id) },
  },
  {
    id: 'sg-three-pillar-shield-grid',
    label: '3-Pillar Shield Matrix',
    description: '3 side-by-side cards covering Risk-Free, Instant Care & Safe Transit',
    toHtml(props, id) { return threePillarShieldGrid(props, id) },
  },
  {
    id: 'sg-minimalist-swiss-rule',
    label: 'Boutique Minimalist Swiss',
    description: 'Understated pure white card with hairline rules and wide letter tracking',
    toHtml(props, id) { return minimalistSwissRule(props, id) },
  },
  {
    id: 'sg-industrial-field-tested',
    label: 'Industrial Field-Tested',
    description: 'Rugged heavy-duty commercial assurance for tools and auto parts',
    toHtml(props, id) { return industrialFieldTested(props, id) },
  },
  {
    id: 'sg-money-back-speed-ribbon',
    label: 'Speed Conversion Ribbon',
    description: 'High-velocity "Love It or Return It" direct conversion bar',
    toHtml(props, id) { return moneyBackSpeedRibbon(props, id) },
  },
  {
    id: 'sg-white-glove-concierge',
    label: 'White-Glove VIP Concierge',
    description: 'Deep plum velvet card with champagne bronze seal & VIP care',
    toHtml(props, id) { return whiteGloveConcierge(props, id) },
  },
]

// Backwards-compatible aliases
export const guaranteeVariants = satisfactionGuaranteeVariants
export const buyerProtectionVariants = satisfactionGuaranteeVariants

/**
 * Robust Variant Resolver:
 * Supports variant IDs with or without the 'sg-', 'guarantee-', or 'sat-' prefix
 * and matches shorthand IDs seamlessly.
 */
export function getSatisfactionGuaranteeVariant(id: string): BlockVariant {
  if (!id) return satisfactionGuaranteeVariants[0]
  const clean = id
    .toLowerCase()
    .trim()
    .replace(/^sg[-_]/, '')
    .replace(/^guarantee[-_]/, '')
    .replace(/^sat[-_]/, '')
    .replace(/_/g, '-')

  const match = satisfactionGuaranteeVariants.find(v => {
    const vClean = v.id
      .toLowerCase()
      .replace(/^sg[-_]/, '')
      .replace(/^guarantee[-_]/, '')
      .replace(/^sat[-_]/, '')
      .replace(/_/g, '-')

    return (
      v.id === id ||
      vClean === clean ||
      v.id.endsWith(clean) ||
      clean.includes(vClean) ||
      vClean.includes(clean)
    )
  })

  return match ?? satisfactionGuaranteeVariants[0]
}

export const getGuaranteeVariant = getSatisfactionGuaranteeVariant
