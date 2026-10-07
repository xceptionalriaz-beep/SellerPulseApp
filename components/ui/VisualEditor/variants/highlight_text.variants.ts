// components/ui/VisualEditor/variants/highlight_text.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Highlight Text — 10 High-Converting, Professional eBay Retail Variants
// Engineered for eBay listing templates to immediately capture skim-readers,
// broadcast critical selling points (fitment, dispatch speed, condition, offers),
// and drive instant purchasing action.
//
// Focus: Clean typography, durable table-based HTML, zero AI-slop, zero glassy filters.
//
// 1.  ht-classic-neon-strip          — Current bright neon lime strip with lightning bolt (KEPT 100% SAME)
// 2.  ht-urgent-crimson-tape         — High-urgency alert ribbon for stock alerts, fitment & cutoffs
// 3.  ht-minimalist-hairline-capsule — Scandinavian clean floating capsule with precision accent outline
// 4.  ht-industrial-spec-ticker      — Gunmetal & amber technical spec rail for auto parts & hardware
// 5.  ht-luxury-gold-crest           — Editorial Roman serif flanked by gold hairlines for luxury goods
// 6.  ht-pill-badge-duo              — Segmented dual-tone badge with bold category chip & clear message
// 7.  ht-stitched-coupon-voucher     — Perforated coupon voucher with dashed border for discount psychology
// 8.  ht-verified-trust-emerald      — Mint & emerald reassurance banner with verified buyer protection badge
// 9.  ht-bold-dark-impact            — Deep obsidian bar with electric high-contrast streetwear / gaming typography
// 10. ht-compact-bullet-pip          — Streamlined mobile-first single line rail engineered for smartphone screens
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
  id: string
  label: string
  description: string
  thumbnail?: string
  toHtml: (props: any, id: string) => string
}

// ── Shared Helpers & Dynamic Resolvers ─────────────────────────────────────

function pad(p: any, defaultT = 16, defaultR = 24, defaultB = 16, defaultL = 24): string {
  const top = p.paddingTop ?? defaultT
  const right = p.paddingRight ?? defaultR
  const bottom = p.paddingBottom ?? defaultB
  const left = p.paddingLeft ?? defaultL
  return `padding:${top}px ${right}px ${bottom}px ${left}px;`
}

function resolveBg(p: any, fallback = '#b8fa33'): string {
  return p.bgColor ?? fallback
}

function resolveTextCol(p: any, fallback = '#1e1535'): string {
  return p.textColor ?? p.color ?? fallback
}

function resolveAccentCol(p: any, fallback = '#7530fb'): string {
  return p.accentColor ?? fallback
}

const DEFAULT_SAMPLE_TEXT = 'Special Offer: Free Same-Day Dispatch On All Orders Before 2PM'

function resolveText(p: any, fallback = DEFAULT_SAMPLE_TEXT): string {
  const raw = p.text ?? p.highlightText ?? p.content ?? fallback
  // If empty or still using the raw placeholder tag, show high-converting sample text
  if (!raw || raw === '{{HIGHLIGHT_TEXT}}' || raw.trim() === '') {
    return DEFAULT_SAMPLE_TEXT
  }
  return raw
}

function resolveFontSize(p: any, fallback = 15): number {
  return p.fontSize ?? fallback
}

function resolveBorder(p: any, defaultBorder = 'border:none;'): string {
  if (p.showBorder === false) return 'border:none;'
  if (p.borderColor) {
    const width = p.borderWidth ?? 1
    const style = p.borderStyle ?? 'solid'
    return `border:${width}px ${style} ${p.borderColor};`
  }
  return defaultBorder
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLASSIC NEON STRIP (CURRENT STYLE — KEPT 100% IDENTICAL)
// ─────────────────────────────────────────────────────────────────────────────
function classicNeonStrip(p: any, id: string): string {
  const bgCol = resolveBg(p, '#b8fa33')
  const textCol = resolveTextCol(p, '#1e1535')
  const text = resolveText(p, '{{HIGHLIGHT_TEXT}}')
  const fs = resolveFontSize(p, 15)
  const border = resolveBorder(p, 'border:none;')

  return `<!--[riazify:highlight_text:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}text-align:center;border-radius:4px;${border}box-sizing:border-box;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:${fs}px;font-weight:700;color:${textCol};line-height:1.4;">
        &#9889; ${text}
      </p>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. URGENT CRIMSON TAPE (High-Urgency Alert & Warning Ribbon)
// Perfect for fitment warnings, low stock alerts, and same-day dispatch cutoffs
// ─────────────────────────────────────────────────────────────────────────────
function urgentCrimsonTape(p: any, id: string): string {
  const text = resolveText(p, '{{HIGHLIGHT_TEXT}}')
  const fs = resolveFontSize(p, 13)

  return `<!--[riazify:highlight_text:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:#fef2f2;border:1px solid #fecaca;border-left:4px solid #dc2626;border-radius:4px;${pad(p, 14, 18, 14, 18)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td width="26" valign="middle" style="width:26px;font-size:16px;color:#dc2626;line-height:1;">
            &#9888;
          </td>
          <td valign="middle">
            <span style="background-color:#fee2e2;color:#991b1b;font-size:10px;font-weight:800;padding:2px 6px;border-radius:3px;letter-spacing:0.8px;text-transform:uppercase;margin-right:6px;display:inline-block;vertical-align:middle;">
              IMPORTANT
            </span>
            <span style="font-size:${fs}px;font-weight:700;color:#991b1b;line-height:1.4;vertical-align:middle;">
              ${text}
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. MINIMALIST HAIRLINE CAPSULE (Scandinavian Precision Pill Card)
// Sleek, fully rounded pill capsule with zero clashing inner borders
// ─────────────────────────────────────────────────────────────────────────────
function minimalistHairlineCapsule(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveTextCol(p, '#0f172a')
  const text = resolveText(p, '{{HIGHLIGHT_TEXT}}')
  const fs = resolveFontSize(p, 13)
  const accent = resolveAccentCol(p, '#7530fb')

  // Ensure the hairline pill always has its signature clean rounded border
  const borderCol = p.borderColor ?? (textCol !== '#0f172a' ? textCol : accent)
  const borderWidth = p.borderWidth ?? 1.5
  const borderStyle = p.borderStyle ?? 'solid'
  const border = `border:${borderWidth}px ${borderStyle} ${borderCol};`

  return `<!--[riazify:highlight_text:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:separate;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td align="center" style="background-color:${bgCol};border-radius:100px;${border}${pad(p, 12, 24, 12, 24)}text-align:center;box-sizing:border-box;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:${fs}px;font-weight:700;color:${textCol};letter-spacing:0.5px;text-transform:uppercase;line-height:1.4;">
        <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background-color:${accent};margin-right:8px;vertical-align:middle;"></span>
        <span style="vertical-align:middle;">${text}</span>
      </p>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. INDUSTRIAL SPEC TICKER (Gunmetal & Amber Technical Rail)
// High-authority industrial aesthetic for auto parts, tools & hardware
// ─────────────────────────────────────────────────────────────────────────────
function industrialSpecTicker(p: any, id: string): string {
  const text = resolveText(p, '{{HIGHLIGHT_TEXT}}')
  const fs = resolveFontSize(p, 12)

  return `<!--[riazify:highlight_text:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:#0f172a;border-left:4px solid #f59e0b;border-radius:4px;${pad(p, 12, 18, 12, 18)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td>
            <span style="font-family:'Courier New',Courier,monospace;font-size:10px;font-weight:800;color:#f59e0b;letter-spacing:1px;text-transform:uppercase;padding-right:8px;">
              FITMENT SPEC //
            </span>
            <span style="font-family:'Courier New',Courier,monospace;font-size:${fs}px;font-weight:700;color:#f8fafc;letter-spacing:0.3px;">
              ${text}
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. LUXURY GOLD CREST (Editorial Roman Serif Flanked by Gold Hairlines)
// Refined elegance for fine watches, jewelry, antiques & boutique collectibles
// ─────────────────────────────────────────────────────────────────────────────
function luxuryGoldCrest(p: any, id: string): string {
  const text = resolveText(p, '{{HIGHLIGHT_TEXT}}')
  const fs = resolveFontSize(p, 13)

  return `<!--[riazify:highlight_text:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;font-family:Georgia,'Times New Roman',serif;">
  <tr>
    <td style="background-color:#fafaf9;border:1px solid #e7e5e4;border-top:2px solid #b45309;${pad(p, 16, 20, 16, 20)}text-align:center;box-sizing:border-box;">
      <table cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin:0 auto;">
        <tr>
          <td style="padding-right:12px;color:#b45309;font-size:12px;">
            &mdash;&mdash; &#10022;
          </td>
          <td style="font-size:${fs}px;font-weight:700;color:#1c1917;letter-spacing:1.2px;text-transform:uppercase;font-style:italic;">
            ${text}
          </td>
          <td style="padding-left:12px;color:#b45309;font-size:12px;">
            &#10022; &mdash;&mdash;
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. PILL BADGE DUO (Segmented Dual-Tone Badge Rail)
// Modern enterprise tech retail layout (e.g. Best Buy / Apple)
// ─────────────────────────────────────────────────────────────────────────────
function pillBadgeDuo(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const text = resolveText(p, '{{HIGHLIGHT_TEXT}}')
  const fs = resolveFontSize(p, 12)
  const accent = resolveAccentCol(p, '#7530fb')

  return `<!--[riazify:highlight_text:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid #e2e8f0;border-radius:8px;${pad(p, 10, 14, 10, 14)}box-sizing:border-box;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="background-color:${accent};color:#ffffff;font-size:10px;font-weight:800;padding:4px 9px;border-radius:5px;letter-spacing:0.8px;text-transform:uppercase;white-space:nowrap;">
            SPECIAL
          </td>
          <td style="padding-left:10px;font-size:${fs}px;font-weight:700;color:#0f172a;line-height:1.4;">
            ${text}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. STITCHED COUPON VOUCHER (Perforated Discount & Savings Card)
// Proven coupon/voucher psychology triggers buyer fear-of-missing-out
// ─────────────────────────────────────────────────────────────────────────────
function stitchedCouponVoucher(p: any, id: string): string {
  const text = resolveText(p, '{{HIGHLIGHT_TEXT}}')
  const fs = resolveFontSize(p, 13)

  return `<!--[riazify:highlight_text:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:#fffdfa;border:1.5px dashed #0284c7;border-radius:6px;${pad(p, 14, 20, 14, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td width="24" valign="middle" style="width:24px;font-size:14px;color:#0284c7;line-height:1;">
            &#9986;
          </td>
          <td valign="middle">
            <span style="font-family:'Courier New',Courier,monospace;font-size:10px;font-weight:800;color:#0284c7;letter-spacing:1px;text-transform:uppercase;margin-right:8px;">
              PROMO CODE APPLIED:
            </span>
            <span style="font-size:${fs}px;font-weight:800;color:#0f172a;line-height:1.4;">
              ${text}
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. VERIFIED TRUST EMERALD (Official Buyer Protection Reassurance)
// Reassures skeptical buyers on authenticity, returns, and seller credibility
// ─────────────────────────────────────────────────────────────────────────────
function verifiedTrustEmerald(p: any, id: string): string {
  const text = resolveText(p, '{{HIGHLIGHT_TEXT}}')
  const fs = resolveFontSize(p, 13)

  return `<!--[riazify:highlight_text:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;${pad(p, 12, 18, 12, 18)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td width="22" valign="middle" style="width:22px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:18px;height:18px;background-color:#16a34a;color:#ffffff;border-radius:50%;text-align:center;line-height:18px;font-size:10px;font-weight:800;">
                  &#10003;
                </td>
              </tr>
            </table>
          </td>
          <td valign="middle" style="padding-left:8px;">
            <span style="font-size:10px;font-weight:800;color:#166534;letter-spacing:0.8px;text-transform:uppercase;margin-right:6px;">
              VERIFIED GUARANTEE:
            </span>
            <span style="font-size:${fs}px;font-weight:700;color:#15803d;line-height:1.4;">
              ${text}
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. BOLD DARK IMPACT (Obsidian Streetwear / Gaming Neon Bar)
// Deep obsidian finish with energetic double-slashes for gaming & sneakers
// ─────────────────────────────────────────────────────────────────────────────
function boldDarkImpact(p: any, id: string): string {
  const text = resolveText(p, '{{HIGHLIGHT_TEXT}}')
  const fs = resolveFontSize(p, 13)

  return `<!--[riazify:highlight_text:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:#18181b;border:1px solid #27272a;border-radius:6px;${pad(p, 14, 20, 14, 20)}text-align:center;box-sizing:border-box;">
      <p style="margin:0;font-size:${fs}px;font-weight:800;letter-spacing:1px;text-transform:uppercase;line-height:1.4;">
        <span style="color:#b8fa33;margin-right:8px;">//</span>
        <span style="color:#ffffff;">${text}</span>
        <span style="color:#b8fa33;margin-left:8px;">//</span>
      </p>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. COMPACT BULLET PIP (Streamlined Mobile-First Single Line Rail)
// Zero text overflow or awkward line collision on 375px mobile smartphones
// ─────────────────────────────────────────────────────────────────────────────
function compactBulletPip(p: any, id: string): string {
  const text = resolveText(p, '{{HIGHLIGHT_TEXT}}')
  const fs = resolveFontSize(p, 12)
  const accent = resolveAccentCol(p, '#7530fb')

  return `<!--[riazify:highlight_text:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;${pad(p, 9, 14, 9, 14)}box-sizing:border-box;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="padding-right:8px;color:${accent};font-size:14px;line-height:1;font-weight:900;">
            &#9642;
          </td>
          <td style="font-size:${fs}px;font-weight:700;color:#0f172a;letter-spacing:0.2px;line-height:1.4;">
            ${text}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG THUMBNAIL PREVIEWS (For Visual Editor Sidebar)
// ─────────────────────────────────────────────────────────────────────────────

export const HIGHLIGHT_TEXT_THUMBNAILS: Record<string, string> = {
  // 1. Classic Neon Strip
  'ht-classic-neon-strip': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="15" width="68" height="18" rx="2" fill="#b8fa33"/>
    <path d="M16 20l-2 4h3l-1 4 4-5h-3l1-3z" fill="#1e1535"/>
    <line x1="24" y1="24" x2="68" y2="24" stroke="#1e1535" stroke-width="2"/>
  </svg>`,

  // 2. Urgent Crimson Tape
  'ht-urgent-crimson-tape': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="15" width="68" height="18" rx="2" fill="#fef2f2" stroke="#fecaca" stroke-width="0.8"/>
    <rect x="6" y="15" width="3" height="18" fill="#dc2626"/>
    <rect x="12" y="20" width="14" height="8" rx="1.5" fill="#fee2e2"/>
    <line x1="30" y1="24" x2="68" y2="24" stroke="#991b1b" stroke-width="1.8"/>
  </svg>`,

  // 3. Minimalist Hairline Capsule
  'ht-minimalist-hairline-capsule': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="10" y="17" width="60" height="14" rx="7" fill="#ffffff" stroke="#7530fb" stroke-width="1.2"/>
    <circle cx="17" cy="24" r="2" fill="#7530fb"/>
    <line x1="23" y1="24" x2="62" y2="24" stroke="#0f172a" stroke-width="1.8"/>
  </svg>`,

  // 4. Industrial Spec Ticker
  'ht-industrial-spec-ticker': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#0f172a"/>
    <rect x="6" y="15" width="3" height="18" fill="#f59e0b"/>
    <line x1="13" y1="24" x2="28" y2="24" stroke="#f59e0b" stroke-width="1.2"/>
    <line x1="32" y1="24" x2="70" y2="24" stroke="#f8fafc" stroke-width="1.8"/>
  </svg>`,

  // 5. Luxury Gold Crest
  'ht-luxury-gold-crest': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#fafaf9" stroke="#e7e5e4" stroke-width="1"/>
    <line x1="6" y1="15" x2="74" y2="15" stroke="#b45309" stroke-width="1.2"/>
    <line x1="12" y1="24" x2="26" y2="24" stroke="#b45309" stroke-width="1"/>
    <line x1="30" y1="24" x2="50" y2="24" stroke="#1c1917" stroke-width="1.8"/>
    <line x1="54" y1="24" x2="68" y2="24" stroke="#b45309" stroke-width="1"/>
  </svg>`,

  // 6. Pill Badge Duo
  'ht-pill-badge-duo': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="16" width="68" height="16" rx="4" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="8" y="18" width="16" height="12" rx="3" fill="#7530fb"/>
    <line x1="28" y1="24" x2="68" y2="24" stroke="#0f172a" stroke-width="1.8"/>
  </svg>`,

  // 7. Stitched Coupon Voucher
  'ht-stitched-coupon-voucher': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="15" width="68" height="18" rx="3" fill="#fffdfa" stroke="#0284c7" stroke-width="1.2" stroke-dasharray="2 1.5"/>
    <circle cx="14" cy="24" r="2.5" fill="#0284c7"/>
    <line x1="20" y1="24" x2="68" y2="24" stroke="#0f172a" stroke-width="1.8"/>
  </svg>`,

  // 8. Verified Trust Emerald
  'ht-verified-trust-emerald': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#bbf7d0" stroke-width="1"/>
    <rect x="6" y="15" width="68" height="18" rx="3" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="0.8"/>
    <circle cx="14" cy="24" r="3.5" fill="#16a34a"/>
    <line x1="22" y1="24" x2="68" y2="24" stroke="#166534" stroke-width="1.8"/>
  </svg>`,

  // 9. Bold Dark Impact
  'ht-bold-dark-impact': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#18181b"/>
    <line x1="12" y1="28" x2="16" y2="20" stroke="#b8fa33" stroke-width="1.5"/>
    <line x1="15" y1="28" x2="19" y2="20" stroke="#b8fa33" stroke-width="1.5"/>
    <line x1="24" y1="24" x2="56" y2="24" stroke="#ffffff" stroke-width="2"/>
    <line x1="61" y1="28" x2="65" y2="20" stroke="#b8fa33" stroke-width="1.5"/>
    <line x1="64" y1="28" x2="68" y2="20" stroke="#b8fa33" stroke-width="1.5"/>
  </svg>`,

  // 10. Compact Bullet Pip
  'ht-compact-bullet-pip': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="17" width="68" height="14" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="11" y="22" width="4" height="4" fill="#7530fb"/>
    <line x1="19" y1="24" x2="68" y2="24" stroke="#0f172a" stroke-width="1.8"/>
  </svg>`,
}

export function getHighlightTextThumbnailSvg(id: string): string {
  const key = Object.keys(HIGHLIGHT_TEXT_THUMBNAILS).find(k => {
    const clean = id.toLowerCase().replace(/_/g, '-')
    const vClean = k.toLowerCase().replace(/_/g, '-')
    return k === id || vClean === clean || k.endsWith(clean) || id.endsWith(k)
  })
  return key ? HIGHLIGHT_TEXT_THUMBNAILS[key] : HIGHLIGHT_TEXT_THUMBNAILS['ht-classic-neon-strip']
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const highlightTextVariants: BlockVariant[] = [
  {
    id: 'ht-classic-neon-strip',
    label: 'Classic Neon Strip',
    description: 'Current bright neon lime strip with lightning bolt & high-impact text',
    thumbnail: HIGHLIGHT_TEXT_THUMBNAILS['ht-classic-neon-strip'],
    toHtml(props, id) { return classicNeonStrip(props, id) },
  },
  {
    id: 'ht-urgent-crimson-tape',
    label: 'Urgent Crimson Alert',
    description: 'Emergency warning tape with warning badge for fitment & stock alerts',
    thumbnail: HIGHLIGHT_TEXT_THUMBNAILS['ht-urgent-crimson-tape'],
    toHtml(props, id) { return urgentCrimsonTape(props, id) },
  },
  {
    id: 'ht-minimalist-hairline-capsule',
    label: 'Minimalist Hairline Pill',
    description: 'Scandinavian clean floating capsule with precision accent outline',
    thumbnail: HIGHLIGHT_TEXT_THUMBNAILS['ht-minimalist-hairline-capsule'],
    toHtml(props, id) { return minimalistHairlineCapsule(props, id) },
  },
  {
    id: 'ht-industrial-spec-ticker',
    label: 'Industrial Spec Ticker',
    description: 'Gunmetal & amber technical spec rail for auto parts, tools & hardware',
    thumbnail: HIGHLIGHT_TEXT_THUMBNAILS['ht-industrial-spec-ticker'],
    toHtml(props, id) { return industrialSpecTicker(props, id) },
  },
  {
    id: 'ht-luxury-gold-crest',
    label: 'Luxury Gold Crest',
    description: 'Editorial Roman serif flanked by gold hairlines for boutique jewelry & watches',
    thumbnail: HIGHLIGHT_TEXT_THUMBNAILS['ht-luxury-gold-crest'],
    toHtml(props, id) { return luxuryGoldCrest(props, id) },
  },
  {
    id: 'ht-pill-badge-duo',
    label: 'Pill Badge Duo',
    description: 'Segmented dual-tone badge with category chip for retail promotions',
    thumbnail: HIGHLIGHT_TEXT_THUMBNAILS['ht-pill-badge-duo'],
    toHtml(props, id) { return pillBadgeDuo(props, id) },
  },
  {
    id: 'ht-stitched-coupon-voucher',
    label: 'Stitched Coupon Voucher',
    description: 'Perforated discount voucher with dashed border for promotional psychology',
    thumbnail: HIGHLIGHT_TEXT_THUMBNAILS['ht-stitched-coupon-voucher'],
    toHtml(props, id) { return stitchedCouponVoucher(props, id) },
  },
  {
    id: 'ht-verified-trust-emerald',
    label: 'Verified Trust Emerald',
    description: 'Mint & emerald reassurance banner with buyer protection verified checkmark',
    thumbnail: HIGHLIGHT_TEXT_THUMBNAILS['ht-verified-trust-emerald'],
    toHtml(props, id) { return verifiedTrustEmerald(props, id) },
  },
  {
    id: 'ht-bold-dark-impact',
    label: 'Bold Dark Impact',
    description: 'Obsidian streetwear & gaming bar with electric double slashes (//)',
    thumbnail: HIGHLIGHT_TEXT_THUMBNAILS['ht-bold-dark-impact'],
    toHtml(props, id) { return boldDarkImpact(props, id) },
  },
  {
    id: 'ht-compact-bullet-pip',
    label: 'Compact Bullet Pip',
    description: 'Streamlined mobile-first single line rail engineered for smartphone screens',
    thumbnail: HIGHLIGHT_TEXT_THUMBNAILS['ht-compact-bullet-pip'],
    toHtml(props, id) { return compactBulletPip(props, id) },
  },
]

// Backwards-compatible aliases
export const highlightVariants = highlightTextVariants
export const highlightTextBlockVariants = highlightTextVariants

export function getHighlightTextVariant(id?: string): BlockVariant {
  if (!id) return highlightTextVariants[0]
  return highlightTextVariants.find(v => v.id === id) || highlightTextVariants[0]
}
export const getHighlightVariant = getHighlightTextVariant
