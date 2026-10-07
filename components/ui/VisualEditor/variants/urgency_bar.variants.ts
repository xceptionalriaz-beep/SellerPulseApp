// components/ui/VisualEditor/variants/urgency_bar.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Urgency Stock Bar (10 Professional Layout Styles)
//
// Solves buyer hesitation & procrastination on eBay through authentic scarcity,
// social proof, and dispatch velocity. Built for genuine conversion lift.
//
// 10 Distinct Layout Styles:
//   1.  urgency-classic-pulse             (Current Style — Preserved 100% Identical)
//   2.  urgency-inventory-progress-track  (Visual Depletion Meter / Two-Tone Bar)
//   3.  urgency-high-velocity-ticker      (Live Social Proof & Fast Sales Velocity)
//   4.  urgency-industrial-caution-stripe (Automotive Parts, Motors & Heavy Tools)
//   5.  urgency-warehouse-clearance-dossier (Surplus Overstock & Liquidation Lot)
//   6.  urgency-minimalist-hairline-banner(Luxury Apparel, Boutiques & Designer)
//   7.  urgency-split-hero-countdown-dispatch (Dual Stock + Same-Day Dispatch Cutoff)
//   8.  urgency-bold-dark-midnight-alert  (High-End Consumer Tech & Gaming Hardware)
//   9.  urgency-collector-vault-numbered-batch (Rare Coins, Cards, Collectibles & Art)
//   10. urgency-compact-inline-capsule    (Mobile-First Floating Capsule Micro Pill)
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockVariant } from './hero_header.variants'

function pad(p: any): string {
  return `padding:${p.paddingTop ?? 14}px ${p.paddingRight ?? 20}px ${p.paddingBottom ?? 14}px ${p.paddingLeft ?? 20}px;`
}

function resolveText(p: any): string {
  return p.text ?? p.headingText ?? p.message ?? 'Only {{QUANTITY}} Left in Stock — Order Soon!'
}

function resolveQty(p: any): string {
  if (p.quantity) return String(p.quantity)
  return '{{QUANTITY}}'
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLASSIC PULSE (CURRENT STYLE — 100% IDENTICAL TO CURRENT IMPLEMENTATION)
// ─────────────────────────────────────────────────────────────────────────────
function variantClassicPulse(p: any, id: string): string {
  const dot = (p.showIcon ?? true)
    ? `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:${p.iconColor ?? '#ef4444'};margin-right:8px;vertical-align:middle;"></span>`
    : ''
  const text = resolveText(p)
  const align = p.align ?? 'center'
  const fontSize = p.fontSize ?? 13
  const fontWeight = p.fontWeight ?? '700'
  const textColor = p.textColor ?? '#991b1b'
  const bgColor = p.bgColor ?? '#fee2e2'
  const radius = p.borderRadius ?? 8

  return `<!--[riazify:urgency_bar:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgColor};${pad(p)}text-align:${align};border-radius:${radius}px;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:${fontSize}px;font-weight:${fontWeight};color:${textColor};line-height:1.4;">${dot}${text}</p>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. INVENTORY PROGRESS TRACK (Visual Stock Depletion Meter)
// ─────────────────────────────────────────────────────────────────────────────
function variantInventoryProgressTrack(p: any, id: string): string {
  const text = resolveText(p)
  const qty = resolveQty(p)
  const textColor = p.textColor ?? '#0f172a'
  const accent = p.iconColor ?? '#ea580c'
  const bgColor = p.bgColor ?? '#ffffff'
  const radius = p.borderRadius ?? 8
  const percentClaimed = p.percentRemaining ? (100 - p.percentRemaining) : 84

  return `<!--[riazify:urgency_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .ub-ipt-table-${id} { width: 100% !important; min-width: 100% !important; }
    .ub-ipt-top-${id} tr { display: flex !important; flex-direction: column !important; gap: 4px !important; }
    .ub-ipt-top-${id} td { width: 100% !important; text-align: left !important; }
    .ub-ipt-bot-${id} tr { display: flex !important; justify-content: space-between !important; }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" class="ub-ipt-table-${id}" style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;background-color:${bgColor};border:1.5px solid #fed7aa;border-radius:${radius}px;font-family:Arial,Helvetica,sans-serif;box-sizing:border-box;">
  <tr>
    <td style="${pad(p)}">
      <table class="ub-ipt-top-${id}" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:8px;">
        <tr>
          <td style="vertical-align:middle;text-align:left;">
            <span style="display:inline-block;padding:2px 8px;background-color:#ffedd5;color:#c2410c;font-size:10px;font-weight:800;border-radius:4px;text-transform:uppercase;letter-spacing:0.5px;margin-right:6px;">Live Inventory</span>
            <span style="font-size:13px;font-weight:700;color:${textColor};vertical-align:middle;">${text}</span>
          </td>
          <td style="vertical-align:middle;text-align:right;white-space:nowrap;">
            <span style="font-size:12px;font-weight:800;color:${accent};">${qty} Units Left</span>
          </td>
        </tr>
      </table>
      <!-- Progress Bar Track -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#f1f5f9;border-radius:4px;height:6px;overflow:hidden;margin-bottom:6px;">
        <tr>
          <td width="${percentClaimed}%" style="background-color:${accent};height:6px;"></td>
          <td width="${100 - percentClaimed}%" style="background-color:#f1f5f9;height:6px;"></td>
        </tr>
      </table>
      <table class="ub-ipt-bot-${id}" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="font-size:11px;color:#64748b;">High demand &bull; Reserve subject to checkout availability.</td>
          <td style="font-size:11px;font-weight:700;color:#c2410c;text-align:right;white-space:nowrap;">${percentClaimed}% Claimed</td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. HIGH VELOCITY TICKER (Live Velocity & Watch Count Social Proof)
// ─────────────────────────────────────────────────────────────────────────────
function variantHighVelocityTicker(p: any, id: string): string {
  const text = resolveText(p)
  const qty = resolveQty(p)
  const textColor = p.textColor ?? '#1e1535'
  const accent = p.iconColor ?? '#7530fb'
  const bgColor = p.bgColor ?? '#f8f7ff'
  const radius = p.borderRadius ?? 8

  return `<!--[riazify:urgency_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .ub-hvt-table-${id} { width: 100% !important; min-width: 100% !important; }
    .ub-hvt-row-${id} { display: flex !important; flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 8px !important; }
    .ub-hvt-icon-${id} { display: inline-block !important; margin: 0 auto !important; }
    .ub-hvt-text-${id} { text-align: center !important; width: 100% !important; padding: 0 !important; }
    .ub-hvt-badge-${id} { text-align: center !important; width: 100% !important; padding: 0 !important; }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" class="ub-hvt-table-${id}" style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;background-color:${bgColor};border:1.5px solid #ede9fe;border-radius:${radius}px;font-family:Arial,Helvetica,sans-serif;box-sizing:border-box;">
  <tr>
    <td style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr class="ub-hvt-row-${id}">
          <td class="ub-hvt-icon-${id}" width="36" style="width:36px;vertical-align:middle;text-align:left;">
            <div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;background-color:#ede9fe;border-radius:50%;color:${accent};">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="${accent}" fill-opacity="0.2"/>
              </svg>
            </div>
          </td>
          <td class="ub-hvt-text-${id}" style="vertical-align:middle;text-align:left;padding:0 8px;">
            <p style="margin:0 0 2px;font-size:13px;font-weight:800;color:${textColor};line-height:1.3;">
              ${text}
            </p>
            <p style="margin:0;font-size:11px;color:#6b7280;line-height:1.3;">
              Trending item with multiple watchers &bull; Ships from verified domestic inventory
            </p>
          </td>
          <td class="ub-hvt-badge-${id}" style="vertical-align:middle;text-align:right;white-space:nowrap;">
            <div style="display:inline-block;padding:5px 12px;background-color:#ffffff;border:1px solid #ddd6fe;border-radius:20px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
              <span style="font-size:12px;font-weight:800;color:${accent};">${qty} Remaining</span>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. INDUSTRIAL CAUTION STRIPE (Automotive Parts, Motors & Heavy Tools)
// ─────────────────────────────────────────────────────────────────────────────
function variantIndustrialCautionStripe(p: any, id: string): string {
  const text = resolveText(p)
  const qty = resolveQty(p)
  const textColor = '#ffffff'
  const accent = p.iconColor ?? '#f59e0b'
  const bgColor = '#18181b'
  const radius = p.borderRadius ?? 6

  return `<!--[riazify:urgency_bar:${id}]-->
<style>
  @media only screen and (max-width: 768px) {
    .ub-ics-table-${id} {
      width: 100% !important;
      min-width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
    }
    .ub-ics-pad-${id} {
      padding: 14px 14px !important;
      text-align: center !important;
    }
    .ub-ics-row-${id} {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      gap: 10px !important;
      width: 100% !important;
    }
    .ub-ics-left-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
    }
    .ub-ics-badge-wrap-${id} {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      margin: 0 auto 6px auto !important;
    }
    .ub-ics-title-${id} {
      text-align: center !important;
      margin: 0 !important;
    }
    .ub-ics-right-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="ub-ics-table-${id}"
  style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;background-color:${bgColor};border:none;border-left:4px solid ${accent};border-radius:${radius}px;font-family:Arial,Helvetica,sans-serif;box-sizing:border-box;">
  <tr>
    <td class="ub-ics-pad-${id}" style="${pad(p)}vertical-align:middle;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr class="ub-ics-row-${id}">

          <!-- Left: Allocation Notice & Headline Text -->
          <td class="ub-ics-left-${id}" style="vertical-align:middle;text-align:left;">
            <div class="ub-ics-badge-wrap-${id}" style="margin-bottom:4px;">
              <span style="display:inline-flex;align-items:center;padding:2px 8px;background-color:#27272a;border:1px solid ${accent};color:${accent};font-size:10px;font-weight:900;letter-spacing:0.8px;border-radius:3px;text-transform:uppercase;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Warehouse Allocation Notice
              </span>
            </div>
            <p class="ub-ics-title-${id}" style="margin:2px 0 0;font-size:13px;font-weight:800;color:${textColor};letter-spacing:0.3px;line-height:1.35;">
              ${text}
            </p>
          </td>

          <!-- Right: Batch Count Pill -->
          <td class="ub-ics-right-${id}" style="vertical-align:middle;text-align:right;white-space:nowrap;padding-left:14px;">
            <span style="display:inline-block;padding:6px 14px;background-color:${accent};color:#000000;font-size:12px;font-weight:900;border-radius:4px;letter-spacing:0.5px;text-transform:uppercase;">
              Batch: ${qty} Left
            </span>
          </td>

        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. WAREHOUSE CLEARANCE DOSSIER (Surplus Overstock & Liquidation Lot)
// ─────────────────────────────────────────────────────────────────────────────
function variantWarehouseClearanceDossier(p: any, id: string): string {
  const text = resolveText(p)
  const qty = resolveQty(p)
  const textColor = p.textColor ?? '#1c1917'
  const accent = p.iconColor ?? '#b91c1c'
  const bgColor = p.bgColor ?? '#fffdfa'
  const radius = p.borderRadius ?? 6

  return `<!--[riazify:urgency_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .ub-wcd-table-${id} {
      width: 100% !important;
      min-width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
    }
    .ub-wcd-pad-${id} {
      padding: 16px 14px !important;
      text-align: center !important;
    }
    .ub-wcd-row-${id} {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      gap: 10px !important;
      width: 100% !important;
    }
    .ub-wcd-icon-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      margin: 0 auto !important;
    }
    .ub-wcd-icon-circle-${id} {
      margin: 0 auto !important;
    }
    .ub-wcd-text-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 !important;
    }
    .ub-wcd-badge-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="ub-wcd-table-${id}"
  style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;background-color:${bgColor};border:1.5px dashed #d6d3d1;border-radius:${radius}px;font-family:Arial,Helvetica,sans-serif;box-sizing:border-box;">
  <tr>
    <td class="ub-wcd-pad-${id}" style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr class="ub-wcd-row-${id}">

          <!-- 1. Icon (Top in Middle on Mobile) -->
          <td class="ub-wcd-icon-${id}" width="36" style="width:36px;vertical-align:middle;text-align:center;">
            <div class="ub-wcd-icon-circle-${id}" style="width:28px;height:28px;line-height:26px;border:1.5px solid ${accent};border-radius:50%;color:${accent};font-size:12px;font-weight:900;margin:0 auto;">
              &#10003;
            </div>
          </td>

          <!-- 2. Text (Center in Middle on Mobile) -->
          <td class="ub-wcd-text-${id}" style="vertical-align:middle;padding-left:10px;text-align:left;">
            <span style="font-size:10px;font-weight:900;color:${accent};text-transform:uppercase;letter-spacing:0.8px;">
              [Official Clearance Lot]
            </span>
            <p style="margin:2px 0 0;font-size:13px;font-weight:800;color:${textColor};line-height:1.35;">
              ${text}
            </p>
          </td>

          <!-- 3. Badge (Bottom in Middle on Mobile) -->
          <td class="ub-wcd-badge-${id}" style="vertical-align:middle;text-align:right;white-space:nowrap;padding-left:12px;">
            <div style="display:inline-block;padding:5px 12px;background-color:#fee2e2;border:1px solid #fecaca;border-radius:4px;color:${accent};font-size:12px;font-weight:800;">
              Only ${qty} Remaining
            </div>
          </td>

        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. MINIMALIST HAIRLINE BANNER (Luxury Apparel, Boutiques & Designer)
// ─────────────────────────────────────────────────────────────────────────────
function variantMinimalistHairlineBanner(p: any, id: string): string {
  const text = resolveText(p)
  const qty = resolveQty(p)
  const textColor = p.textColor ?? '#0f172a'
  const accent = p.iconColor ?? '#0f172a'
  const bgColor = p.bgColor ?? '#ffffff'

  return `<!--[riazify:urgency_bar:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;background-color:${bgColor};border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="padding:14px 18px;text-align:center;">
      <table cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin:0 auto;">
        <tr>
          <td style="vertical-align:middle;padding-right:8px;">
            <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background-color:${accent};"></span>
          </td>
          <td style="vertical-align:middle;font-size:12px;font-weight:700;color:${textColor};letter-spacing:0.6px;text-transform:uppercase;">
            ${text}
          </td>
          <td style="vertical-align:middle;padding:0 8px;color:#cbd5e1;font-size:14px;">|</td>
          <td style="vertical-align:middle;font-size:12px;font-weight:800;color:${accent};">
            ${qty} in Stock
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. SPLIT HERO COUNTDOWN DISPATCH (Dual Stock Alert + Same-Day Cutoff)
// ─────────────────────────────────────────────────────────────────────────────
function variantSplitHeroCountdownDispatch(p: any, id: string): string {
  const text = resolveText(p)
  const qty = resolveQty(p)
  const textColor = p.textColor ?? '#0f172a'
  const accent = p.iconColor ?? '#dc2626'
  const bgColor = p.bgColor ?? '#ffffff'
  const radius = p.borderRadius ?? 8

  return `<!--[riazify:urgency_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .ub-shc-table-${id} { width: 100% !important; min-width: 100% !important; }
    .ub-shc-row-${id} { display: flex !important; flex-direction: column !important; width: 100% !important; }
    .ub-shc-col1-${id} { width: 100% !important; border-right: none !important; border-bottom: 1px solid #e2e8f0 !important; padding: 12px 14px !important; }
    .ub-shc-col2-${id} { width: 100% !important; padding: 12px 14px !important; }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" class="ub-shc-table-${id}" style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;background-color:${bgColor};border:1.5px solid #e2e8f0;border-radius:${radius}px;font-family:Arial,Helvetica,sans-serif;box-sizing:border-box;">
  <tr class="ub-shc-row-${id}">
    <!-- Left Column: Stock Scarcity -->
    <td class="ub-shc-col1-${id}" width="50%" style="padding:14px 16px;border-right:1px solid #e2e8f0;vertical-align:middle;box-sizing:border-box;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td width="28" style="vertical-align:middle;">
            <div style="width:24px;height:24px;display:flex;align-items:center;justify-content:center;background-color:#fee2e2;border-radius:50%;color:${accent};font-size:12px;font-weight:900;">
              !
            </div>
          </td>
          <td style="vertical-align:middle;padding-left:6px;">
            <p style="margin:0;font-size:12px;font-weight:800;color:${accent};text-transform:uppercase;letter-spacing:0.3px;">Low Stock Alert</p>
            <p style="margin:2px 0 0;font-size:12px;color:${textColor};font-weight:700;">${qty} remaining</p>
          </td>
        </tr>
      </table>
    </td>
    <!-- Right Column: Fast Dispatch Reassurance -->
    <td class="ub-shc-col2-${id}" width="50%" style="padding:14px 16px;vertical-align:middle;box-sizing:border-box;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td width="28" style="vertical-align:middle;">
            <div style="width:24px;height:24px;display:flex;align-items:center;justify-content:center;background-color:#dcfce7;border-radius:50%;color:#16a34a;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 18H3c-.6 0-1-.4-1-1V5c0-.6.4-1 1-1h11c.6 0 1 .4 1 1v4"/>
                <path d="M14 9h4.5l3.5 4.5V17c0 .6-.4 1-1 1h-2"/>
                <circle cx="7" cy="18" r="2"/>
                <circle cx="17" cy="18" r="2"/>
              </svg>
            </div>
          </td>
          <td style="vertical-align:middle;padding-left:6px;">
            <p style="margin:0;font-size:12px;font-weight:800;color:#166534;text-transform:uppercase;letter-spacing:0.3px;">Fast Fulfillment</p>
            <p style="margin:2px 0 0;font-size:12px;color:#475569;">Orders before 2pm ship today</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. BOLD DARK MIDNIGHT ALERT (High-End Consumer Tech & Gaming Hardware)
// ─────────────────────────────────────────────────────────────────────────────
function variantBoldDarkMidnightAlert(p: any, id: string): string {
  const text = resolveText(p)
  const qty = resolveQty(p)
  const textColor = '#ffffff'
  const accent = p.iconColor ?? '#b8fa33'
  const bgColor = '#090d16'

  return `<!--[riazify:urgency_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .ub-bdm-table-${id} { width: 100% !important; min-width: 100% !important; border-radius: 0 !important; }
    .ub-bdm-pad-${id} { padding: 14px 12px !important; text-align: center !important; }
    .ub-bdm-row-${id} { display: flex !important; flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 8px !important; width: 100% !important; }
    .ub-bdm-left-${id} { width: 100% !important; text-align: center !important; }
    .ub-bdm-right-${id} { width: 100% !important; text-align: center !important; padding-left: 0 !important; }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="ub-bdm-table-${id}"
  style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;background-color:${bgColor};border:none;border-radius:0;font-family:Arial,Helvetica,sans-serif;box-sizing:border-box;">
  <tr>
    <td class="ub-bdm-pad-${id}" style="${pad(p)}border-radius:0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr class="ub-bdm-row-${id}">
          <td class="ub-bdm-left-${id}" style="vertical-align:middle;text-align:left;">
            <div style="display:inline-block;padding:2px 8px;background-color:#1e293b;border-radius:4px;color:${accent};font-size:10px;font-weight:900;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:4px;">
              [Stock Status: Urgent]
            </div>
            <p style="margin:2px 0 0;font-size:13px;font-weight:800;color:${textColor};line-height:1.35;">
              ${text}
            </p>
          </td>
          <td class="ub-bdm-right-${id}" style="vertical-align:middle;text-align:right;white-space:nowrap;padding-left:14px;">
            <div style="display:inline-block;padding:6px 14px;background-color:${accent};border-radius:4px;color:#000000;font-size:13px;font-weight:900;letter-spacing:0.3px;">
              ${qty} Remaining
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. COLLECTOR VAULT NUMBERED BATCH (Coins, Cards, Collectibles & Art)
// ─────────────────────────────────────────────────────────────────────────────
function variantCollectorVaultNumberedBatch(p: any, id: string): string {
  const text = resolveText(p)
  const qty = resolveQty(p)
  const textColor = p.textColor ?? '#1e1535'
  const accent = p.iconColor ?? '#b45309'
  const bgColor = p.bgColor ?? '#fefce8'
  const radius = p.borderRadius ?? 6

  return `<!--[riazify:urgency_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .ub-cvn-table-${id} {
      width: 100% !important;
      min-width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
    }
    .ub-cvn-pad-${id} {
      padding: 16px 14px !important;
      text-align: center !important;
    }
    .ub-cvn-row-${id} {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      gap: 10px !important;
      width: 100% !important;
    }
    .ub-cvn-icon-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      margin: 0 auto !important;
    }
    .ub-cvn-icon-circle-${id} {
      margin: 0 auto !important;
    }
    .ub-cvn-text-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 !important;
    }
    .ub-cvn-badge-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  class="ub-cvn-table-${id}"
  style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;background-color:${bgColor};border:1px solid #fde68a;border-radius:${radius}px;font-family:Arial,Helvetica,sans-serif;box-sizing:border-box;">
  <tr>
    <td class="ub-cvn-pad-${id}" style="${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr class="ub-cvn-row-${id}">

          <!-- 1. Star Icon (Centered at Top on Mobile) -->
          <td class="ub-cvn-icon-${id}" width="36" style="width:36px;vertical-align:middle;text-align:center;">
            <div class="ub-cvn-icon-circle-${id}" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;background-color:#ffffff;border:1px solid #fde68a;border-radius:50%;color:${accent};margin:0 auto;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="${accent}" stroke="${accent}" stroke-width="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
          </td>

          <!-- 2. Texts (Centered in Middle on Mobile) -->
          <td class="ub-cvn-text-${id}" style="vertical-align:middle;text-align:left;padding-left:10px;">
            <p style="margin:0;font-size:10px;font-weight:900;color:${accent};text-transform:uppercase;letter-spacing:1px;">
              Authenticated Collector Batch
            </p>
            <p style="margin:2px 0 0;font-size:13px;font-weight:800;color:${textColor};line-height:1.35;">
              ${text}
            </p>
          </td>

          <!-- 3. Allocation Tag (Centered at Bottom on Mobile) -->
          <td class="ub-cvn-badge-${id}" style="vertical-align:middle;text-align:right;white-space:nowrap;padding-left:12px;">
            <span style="display:inline-block;font-family:monospace;font-size:12px;font-weight:900;color:${accent};background-color:#ffffff;border:1px solid #fde68a;padding:5px 10px;border-radius:4px;">
              [#${qty} OF ALLOCATION]
            </span>
          </td>

        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. COMPACT INLINE CAPSULE (Floating Multi-Badge Dark Capsule Pill)
// ─────────────────────────────────────────────────────────────────────────────
function variantCompactInlineCapsule(p: any, id: string): string {
  const text = resolveText(p)
  const qty = resolveQty(p)
  const capsuleBg = p.bgColor && p.bgColor !== '#fee2e2' && p.bgColor !== '#ffffff' ? p.bgColor : '#0f172a'
  const textColor = '#ffffff'
  const badgeBg = p.iconColor ?? '#dc2626'

  return `<!--[riazify:urgency_bar:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .ub-cic-table-${id} { width: 100% !important; min-width: 100% !important; }
    .ub-cic-pill-${id} { width: 100% !important; border-radius: 12px !important; padding: 10px 12px !important; box-sizing: border-box !important; }
    .ub-cic-row-${id} { display: flex !important; flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 6px !important; }
    .ub-cic-text-${id} { white-space: normal !important; text-align: center !important; padding: 0 !important; }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" class="ub-cic-table-${id}" style="width:100% !important;min-width:100% !important;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td align="center" style="padding:10px 0;text-align:center;">
      <div class="ub-cic-pill-${id}" style="display:inline-block;background-color:${capsuleBg};border:1.5px solid #334155;border-radius:50px;padding:6px 14px;box-shadow:0 3px 10px rgba(0,0,0,0.15);max-width:100%;box-sizing:border-box;">
        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;border-collapse:separate;border-spacing:0;">
          <tr class="ub-cic-row-${id}">
            <!-- Left Badge -->
            <td style="vertical-align:middle;padding-right:10px;">
              <span style="display:inline-flex;align-items:center;padding:3px 10px;background-color:${badgeBg};color:#ffffff;font-size:10px;font-weight:900;border-radius:20px;letter-spacing:0.5px;text-transform:uppercase;white-space:nowrap;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#ffffff"/>
                </svg>
                LOW STOCK
              </span>
            </td>
            <!-- Center Text -->
            <td class="ub-cic-text-${id}" style="vertical-align:middle;padding-right:12px;text-align:left;">
              <span style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:${textColor};letter-spacing:0.2px;line-height:1.2;">
                ${text}
              </span>
            </td>
            <!-- Right Live Count Pill -->
            <td style="vertical-align:middle;">
              <span style="display:inline-block;padding:3px 10px;background-color:#1e293b;color:#38bdf8;border:1px solid #334155;font-size:10px;font-weight:800;border-radius:20px;white-space:nowrap;">
                ${qty} Left
              </span>
            </td>
          </tr>
        </table>
      </div>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT DEFINITIONS & REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export const urgencyBarVariants: BlockVariant[] = [
  {
    id: 'urgency-classic-pulse',
    label: 'Classic Pulse',
    description: 'Current soft red card with animated-feel pulsating dot',
    toHtml: variantClassicPulse,
  },
  {
    id: 'urgency-inventory-progress-track',
    label: 'Progress Meter',
    description: 'Two-tone claimed progress bar with allocation meter',
    toHtml: variantInventoryProgressTrack,
  },
  {
    id: 'urgency-high-velocity-ticker',
    label: 'Velocity Ticker',
    description: 'Trending sales speed pill with watchers and social proof',
    toHtml: variantHighVelocityTicker,
  },
  {
    id: 'urgency-industrial-caution-stripe',
    label: 'Caution Stripe',
    description: 'Rugged dark charcoal with amber warning bar for parts & tools',
    toHtml: variantIndustrialCautionStripe,
  },
  {
    id: 'urgency-warehouse-clearance-dossier',
    label: 'Clearance Lot',
    description: 'Surplus liquidation manifest with dashed border stamp',
    toHtml: variantWarehouseClearanceDossier,
  },
  {
    id: 'urgency-minimalist-hairline-banner',
    label: 'Minimal Hairline',
    description: 'Understated luxury hairline frame for fashion & jewelry',
    toHtml: variantMinimalistHairlineBanner,
  },
  {
    id: 'urgency-split-hero-countdown-dispatch',
    label: 'Dual Dispatch',
    description: '50/50 split connecting stock scarcity with cutoff times',
    toHtml: variantSplitHeroCountdownDispatch,
  },
  {
    id: 'urgency-bold-dark-midnight-alert',
    label: 'Midnight Tech',
    description: 'High-contrast obsidian with neon lime badge for electronics',
    toHtml: variantBoldDarkMidnightAlert,
  },
  {
    id: 'urgency-collector-vault-numbered-batch',
    label: 'Collector Vault',
    description: 'Authenticated serial batch release for rare cards & coins',
    toHtml: variantCollectorVaultNumberedBatch,
  },
  {
    id: 'urgency-compact-inline-capsule',
    label: 'Compact Capsule',
    description: 'Floating high-contrast dark capsule pill with live low stock and status chips',
    toHtml: variantCompactInlineCapsule,
  },
]

export function getUrgencyBarVariant(variantId: string): BlockVariant {
  const found = urgencyBarVariants.find(v => v.id === variantId)
  return found ?? urgencyBarVariants[0]
}
