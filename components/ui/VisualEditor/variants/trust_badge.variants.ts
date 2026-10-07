// components/ui/VisualEditor/variants/trust_badge.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Trust & Satisfaction Badge (10 Professional Layout Styles)
//
// Solves eBay Buyer Skepticism through Conversion-Engineered Risk Reversal.
//
// 10 Distinct Layout Styles:
//   1. trust-banner-soft           (Current Baseline — 100% Identical Soft Card)
//   2. trust-seal-ribbon-badge     (Official Inspected & Certified Seal)
//   3. trust-split-counter-bar     (Executive Dual-Block 100% Pledge)
//   4. trust-gold-gilded-crest     (Luxury & Fine Goods Heritage Gold Seal)
//   5. trust-cyber-shield-tech     (Consumer Electronics Midnight Shield)
//   6. trust-clean-hairline-capsule(Minimalist Modern Clean Retail Banner)
//   7. trust-money-back-stamp      (Direct 30-Day Money Back Guarantee Stamp)
//   8. trust-handshake-pledge      (Top-Rated Seller Personal Service Promise)
//   9. trust-industrial-motors-spec(Heavy-Duty Fitment & Quality Guarantee)
//   10. trust-verified-buyer-pill  (eBay Buyer Protection Security Strip)
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockVariant } from './hero_header.variants'

function pad(p: any): string {
    const top = p.paddingTop ?? 16
    const bottom = p.paddingBottom ?? 16
    const left = p.paddingLeft ?? 24
    const right = p.paddingRight ?? 24
    return `padding:${top}px ${right}px ${bottom}px ${left}px;`
}

const SHIELD_SVG = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`
const MEDAL_SVG = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;"><circle cx="12" cy="8" r="6"/><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.77.51l-4.222-2.815-4.222 2.815a.5.5 0 0 1-.77-.51l1.515-8.526"/></svg>`
const STAR_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="vertical-align:middle;display:inline-block;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
const CHECK_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;"><polyline points="20 6 9 17 4 12"/></svg>`
const LOCK_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`

function resolveText(p: any): string {
    return p.text && p.text.trim() !== '' ? p.text : '100% Satisfaction Guaranteed or Your Money Back'
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. BANNER SOFT (CURRENT BASELINE — 100% IDENTICAL)
// ─────────────────────────────────────────────────────────────────────────────
function variantBannerSoft(p: any, id: string): string {
    const text = resolveText(p)
    const color = p.color ?? p.textColor ?? '#7530fb'
    const bgColor = p.bgColor ?? '#f3eeff'
    const borderColor = p.borderColor ?? '#ede9fe'
    const borderStyle = p.showBorder ? `border:1px solid ${borderColor};` : ''
    const sub = p.subtext ? `<br/><span style="font-family:Arial,sans-serif;font-size:12px;color:#6b7280;margin-top:4px;display:inline-block;">${p.subtext}</span>` : ''

    return `<!--[riazify:trust_badge:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgColor};${borderStyle}${pad(p)}border-radius:8px;text-align:${p.align ?? 'center'};">
      <span style="display:inline-block;vertical-align:middle;margin-right:8px;color:${color};">
        ${SHIELD_SVG}
      </span>
      <span style="font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:${color};vertical-align:middle;">
        ${text}
      </span>
      ${sub}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SEAL RIBBON BADGE (Official Inspected & Certified Seal)
// ─────────────────────────────────────────────────────────────────────────────
function variantSealRibbonBadge(p: any, id: string): string {
    const text = resolveText(p)
    const color = p.color ?? '#7530fb'
    const subtext = p.subtext && p.subtext.trim() !== '' ? p.subtext : 'Full 30-Day Money Back Protection • Zero Risk Purchase'

    return `<!--[riazify:trust_badge:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:#ffffff;border:1px solid #e2e8f0;border-left:5px solid ${color};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td width="64" style="width:64px;vertical-align:middle;text-align:center;padding:16px 8px 16px 20px;">
      <div style="width:44px;height:44px;background-color:#f8f7ff;border:1.5px solid ${color};border-radius:50%;line-height:44px;text-align:center;color:${color};margin:0 auto;">
        ${MEDAL_SVG}
      </div>
    </td>
    <td style="vertical-align:middle;padding:16px 20px 16px 12px;text-align:left;">
      <div style="font-size:10px;font-weight:900;color:${color};letter-spacing:1px;text-transform:uppercase;margin-bottom:3px;">
        &check; CERTIFIED BUYER GUARANTEE
      </div>
      <div style="font-size:14px;font-weight:800;color:#0f172a;line-height:1.3;">
        ${text}
      </div>
      <div style="font-size:12px;font-weight:500;color:#64748b;margin-top:3px;">
        ${subtext}
      </div>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SPLIT COUNTER BAR (Executive Dual-Block 100% Pledge)
// ─────────────────────────────────────────────────────────────────────────────
function variantSplitCounterBar(p: any, id: string): string {
    const text = resolveText(p)
    const color = p.color ?? '#7530fb'
    const subtext = p.subtext && p.subtext.trim() !== '' ? p.subtext : 'Your satisfaction is fully backed by our replacement or refund promise.'

    return `<!--[riazify:trust_badge:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td width="130" style="width:130px;background-color:${color};color:#ffffff;text-align:center;vertical-align:middle;padding:16px 12px;">
      <div style="font-size:22px;font-weight:900;line-height:1;letter-spacing:-0.5px;">100%</div>
      <div style="font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-top:2px;">GUARANTEED</div>
    </td>
    <td style="vertical-align:middle;padding:14px 24px;text-align:left;color:#ffffff;">
      <div style="font-size:14px;font-weight:800;color:#ffffff;line-height:1.3;">
        ${text}
      </div>
      <div style="font-size:12px;color:#94a3b8;margin-top:3px;line-height:1.4;">
        ${subtext}
      </div>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. GOLD GILDED CREST (Luxury & Fine Goods Heritage Gold Seal)
// ─────────────────────────────────────────────────────────────────────────────
function variantGoldGildedCrest(p: any, id: string): string {
    const text = resolveText(p)
    const subtext = p.subtext && p.subtext.trim() !== '' ? p.subtext : 'Authenticity Inspected & Pristine Condition Pledged Prior to Dispatch'

    return `<!--[riazify:trust_badge:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:#fffdfa;border:1px solid #fde68a;font-family:Georgia,serif,Arial;">
  <tr>
    <td style="padding:4px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #ca8a04;border-collapse:collapse;">
        <tr>
          <td style="padding:16px 24px;text-align:center;vertical-align:middle;">
            <div style="color:#b45309;font-size:10px;font-weight:900;letter-spacing:1.8px;text-transform:uppercase;font-family:Arial,sans-serif;margin-bottom:4px;">
              &#9733; PREMIUM QUALITY CERTIFICATE &#9733;
            </div>
            <div style="font-size:15px;font-weight:700;color:#1c1917;letter-spacing:0.3px;line-height:1.4;">
              ${text}
            </div>
            <div style="font-size:12px;color:#78716c;margin-top:4px;font-family:Arial,sans-serif;">
              ${subtext}
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. CYBER SHIELD TECH (Consumer Electronics Midnight Shield)
// ─────────────────────────────────────────────────────────────────────────────
function variantCyberShieldTech(p: any, id: string): string {
    const text = resolveText(p)
    const neon = '#b8fa33'
    const subtext = p.subtext && p.subtext.trim() !== '' ? p.subtext : 'Bench-Tested Quality Assurance • Same-Day Dispatch Pledged'

    return `<!--[riazify:trust_badge:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:#090d16;border:1px solid #1e293b;border-left:4px solid ${neon};font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td width="50" style="width:50px;text-align:center;vertical-align:middle;padding:14px 6px 14px 18px;color:${neon};">
      ${SHIELD_SVG}
    </td>
    <td style="vertical-align:middle;padding:14px 20px 14px 10px;text-align:left;">
      <div style="font-size:13px;font-weight:800;color:#ffffff;letter-spacing:0.3px;">
        ${text}
      </div>
      <div style="font-size:11px;font-weight:500;color:#94a3b8;margin-top:2px;">
        ${subtext}
      </div>
    </td>
    <td width="90" style="width:90px;text-align:right;vertical-align:middle;padding-right:20px;">
      <span style="display:inline-block;padding:4px 10px;background-color:#1e293b;border:1px solid #334155;color:${neon};font-size:10px;font-weight:900;letter-spacing:0.5px;border-radius:4px;text-transform:uppercase;">
        VERIFIED
      </span>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. CLEAN HAIRLINE CAPSULE (Minimalist Modern Clean Retail Banner)
// ─────────────────────────────────────────────────────────────────────────────
function variantCleanHairlineCapsule(p: any, id: string): string {
    const text = resolveText(p)
    const color = p.color ?? '#0f172a'

    return `<!--[riazify:trust_badge:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:#ffffff;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="padding:16px 20px;text-align:center;vertical-align:middle;">
      <span style="display:inline-block;width:24px;height:24px;background-color:#f1f5f9;border-radius:50%;color:${color};text-align:center;line-height:24px;vertical-align:middle;margin-right:10px;">
        ${CHECK_SVG}
      </span>
      <span style="font-size:13px;font-weight:800;color:#0f172a;letter-spacing:0.5px;text-transform:uppercase;vertical-align:middle;">
        ${text}
      </span>
      <span style="display:inline-block;margin:0 12px;color:#cbd5e1;vertical-align:middle;">&bull;</span>
      <span style="font-size:12px;font-weight:600;color:#64748b;vertical-align:middle;">
        Official Verified Guarantee
      </span>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. MONEY BACK STAMP (Direct 30-Day Money Back Guarantee Stamp)
// ─────────────────────────────────────────────────────────────────────────────
function variantMoneyBackStamp(p: any, id: string): string {
    const text = resolveText(p)
    const color = p.color ?? '#dc2626'
    const subtext = p.subtext && p.subtext.trim() !== '' ? p.subtext : 'Not completely satisfied? Contact us for an immediate resolution or refund.'

    return `<!--[riazify:trust_badge:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:#fff5f5;border:1.5px dashed #fca5a5;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td width="90" style="width:90px;text-align:center;vertical-align:middle;padding:14px 12px 14px 18px;">
      <div style="border:2px solid ${color};border-radius:8px;padding:6px 8px;text-align:center;background-color:#ffffff;">
        <div style="font-size:18px;font-weight:900;color:${color};line-height:1;">30</div>
        <div style="font-size:9px;font-weight:900;color:${color};text-transform:uppercase;letter-spacing:0.5px;margin-top:2px;">DAY REFUND</div>
      </div>
    </td>
    <td style="vertical-align:middle;padding:14px 20px 14px 8px;text-align:left;">
      <div style="font-size:14px;font-weight:800;color:#991b1b;line-height:1.3;">
        ${text}
      </div>
      <div style="font-size:12px;color:#7f1d1d;margin-top:3px;line-height:1.4;">
        ${subtext}
      </div>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. HANDSHAKE PLEDGE (Top-Rated Seller Personal Service Promise)
// ─────────────────────────────────────────────────────────────────────────────
function variantHandshakePledge(p: any, id: string): string {
    const text = resolveText(p)
    const color = p.color ?? '#7530fb'

    return `<!--[riazify:trust_badge:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:#faf5ff;border:1px solid #e9d5ff;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="padding:16px 24px;text-align:center;vertical-align:middle;">
      <div style="margin-bottom:6px;">
        <span style="color:#eab308;margin:0 1px;">${STAR_SVG}</span>
        <span style="color:#eab308;margin:0 1px;">${STAR_SVG}</span>
        <span style="color:#eab308;margin:0 1px;">${STAR_SVG}</span>
        <span style="color:#eab308;margin:0 1px;">${STAR_SVG}</span>
        <span style="color:#eab308;margin:0 1px;">${STAR_SVG}</span>
      </div>
      <div style="font-size:14px;font-weight:800;color:#581c87;line-height:1.3;">
        ${text}
      </div>
      <div style="font-size:12px;color:#7e22ce;margin-top:4px;">
        &ldquo;We treat every customer with fairness and care. If you are not delighted, we make it right.&rdquo;
      </div>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. INDUSTRIAL MOTORS SPEC (Heavy-Duty Fitment & Quality Guarantee)
// ─────────────────────────────────────────────────────────────────────────────
function variantIndustrialMotorsSpec(p: any, id: string): string {
    const text = resolveText(p)
    const amber = '#f59e0b'

    return `<!--[riazify:trust_badge:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:#18181b;border:1px solid #27272a;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="height:4px;background-color:${amber};font-size:1px;line-height:1px;">&nbsp;</td>
  </tr>
  <tr>
    <td style="padding:14px 20px;vertical-align:middle;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="36" style="vertical-align:middle;color:${amber};">
            ${SHIELD_SVG}
          </td>
          <td style="vertical-align:middle;text-align:left;">
            <div style="font-size:10px;font-weight:900;color:${amber};text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">
              COMMERCIAL GRADE SPECIFICATION
            </div>
            <div style="font-size:13px;font-weight:800;color:#ffffff;line-height:1.3;">
              ${text}
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. VERIFIED BUYER PILL (eBay Buyer Protection Security Strip)
// ─────────────────────────────────────────────────────────────────────────────
function variantVerifiedBuyerPill(p: any, id: string): string {
    const text = resolveText(p)

    return `<!--[riazify:trust_badge:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;border-collapse:collapse;background-color:#ffffff;border:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td align="center" style="padding:12px 18px;text-align:center;">
      <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;border-collapse:separate;border-spacing:0;background-color:#f8fafc;border:1px solid #cbd5e1;border-radius:50px;">
        <tr>
          <td style="padding:6px 14px;vertical-align:middle;color:#0284c7;">
            ${LOCK_SVG}
          </td>
          <td style="padding:6px 16px 6px 0;vertical-align:middle;text-align:left;">
            <span style="font-size:12px;font-weight:800;color:#0f172a;">
              ${text}
            </span>
            <span style="display:inline-block;margin:0 8px;color:#94a3b8;">&bull;</span>
            <span style="font-size:11px;font-weight:600;color:#16a34a;">
              &check; eBay Buyer Protection
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT REGISTRY (10 Layout Styles)
// ─────────────────────────────────────────────────────────────────────────────
export const trustBadgeVariants: BlockVariant[] = [
    {
        id: 'trust-banner-soft',
        label: 'Soft Card',
        description: 'Current baseline soft card container with centered shield icon & guarantee text',
        toHtml: variantBannerSoft,
    },
    {
        id: 'trust-seal-ribbon-badge',
        label: 'Certified Ribbon',
        description: 'Authoritative certified badge with ribbon medal & buyer protection details',
        toHtml: variantSealRibbonBadge,
    },
    {
        id: 'trust-split-counter-bar',
        label: 'Split Counter',
        description: 'Executive color-blocked bar with bold 100% block & comprehensive promise',
        toHtml: variantSplitCounterBar,
    },
    {
        id: 'trust-gold-gilded-crest',
        label: 'Gold Crest',
        description: 'Luxury antique gold double border certificate for jewelry & watches',
        toHtml: variantGoldGildedCrest,
    },
    {
        id: 'trust-cyber-shield-tech',
        label: 'Cyber Shield',
        description: 'High-contrast midnight tech strip with electric neon shield & verified stamp',
        toHtml: variantCyberShieldTech,
    },
    {
        id: 'trust-clean-hairline-capsule',
        label: 'Clean Hairline',
        description: 'Minimalist modern retail banner with top/bottom hairline rules & checkmark',
        toHtml: variantCleanHairlineCapsule,
    },
    {
        id: 'trust-money-back-stamp',
        label: 'Refund Stamp',
        description: 'Stitched crimson 30-day money back guarantee stamp with immediate return terms',
        toHtml: variantMoneyBackStamp,
    },
    {
        id: 'trust-handshake-pledge',
        label: '5-Star Promise',
        description: 'Top-rated seller customer promise with 5-star acclaim & personal pledge',
        toHtml: variantHandshakePledge,
    },
    {
        id: 'trust-industrial-motors-spec',
        label: 'Motors Fitment',
        description: 'Rugged dark card with amber safety line for auto parts & tools',
        toHtml: variantIndustrialMotorsSpec,
    },
    {
        id: 'trust-verified-buyer-pill',
        label: 'Buyer Protection',
        description: 'Official eBay buyer protection security capsule strip with lock emblem',
        toHtml: variantVerifiedBuyerPill,
    },
]

export function getTrustBadgeVariant(variantId: string): BlockVariant {
    const found = trustBadgeVariants.find(v => v.id === variantId)
    return found ?? trustBadgeVariants[0]
}
