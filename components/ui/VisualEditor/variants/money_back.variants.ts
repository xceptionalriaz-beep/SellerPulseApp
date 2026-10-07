// components/ui/VisualEditor/variants/money_back.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Money Back Guarantee — 10 Authentic, Professional E-Commerce Layouts
// Built specifically for high-converting eBay listings.
// Zero artificial glassmorphism, zero neon glows, 100% solid, professional,
// tangible retail designs that look human-crafted and battle-tested.
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
  id: string
  label: string
  description: string
  toHtml: (props: any, id: string) => string
}

// ─── Helpers & Dynamic Resolvers ─────────────────────────────────────────────
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

function titleText(p: any, fallback = '30-Day Money Back Guarantee'): string {
  return p.heading ?? p.title ?? p.guaranteeTitle ?? fallback
}

function subText(p: any, fallback = 'Not satisfied? Return it for a full refund. No questions asked.'): string {
  return p.subText ?? p.subtitle ?? p.guaranteeSubtext ?? fallback
}

function daysCount(p: any, fallback = '30'): string {
  return p.days ?? p.periodDays ?? fallback
}

function resolveBg(p: any, signatureBg: string): string {
  if (!p.bgColor || p.bgColor.toLowerCase() === '#f0fdf4') {
    return signatureBg
  }
  return p.bgColor
}

function resolveText(p: any, signatureText: string, isLightVariant = false): string {
  if (!p.textColor || p.textColor.toLowerCase() === '#166534' || (isLightVariant && p.textColor.toLowerCase() === '#ffffff')) {
    return signatureText
  }
  return p.textColor
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. TRUST SHIELD GREEN (Classic Retail Seal with Reassurance Pills)
// Solid soft-green container with a crisp circular checkmark seal and 3 solid pills.
// ─────────────────────────────────────────────────────────────────────────────
function trustShieldGreen(p: any, id: string): string {
  const f = font(p)
  const bgCol = p.bgColor ?? '#f0fdf4'
  const borderCol = p.borderColor ?? '#bbf7d0'
  const textCol = p.textColor ?? '#166534'
  const title = titleText(p)
  const subtitle = subText(p)

  return `<!--[riazify:money_back:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:2px solid ${borderCol};${pad(p, 20, 24, 18, 24)}border-radius:8px;text-align:center;box-sizing:border-box;">
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;max-width:620px;margin:0 auto;box-sizing:border-box;">

        <!-- Crisp Solid Green Stamp -->
        <div style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;background-color:#16a34a;border:2px solid #ffffff;border-radius:50%;color:#ffffff;font-size:22px;line-height:44px;margin-bottom:2px;">
          &#10003;
        </div>

        <div style="color:${textCol};font-size:18px;font-weight:900;letter-spacing:0.2px;line-height:1.25;margin:0;">
          ${title}
        </div>

        <div style="color:#15803d;font-size:12.5px;font-weight:600;line-height:1.45;margin:0;">
          ${subtitle}
        </div>

        <!-- 3 Solid Micro-Badges -->
        <div style="display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:8px;margin-top:6px;width:100%;box-sizing:border-box;">
          <span style="display:inline-flex;align-items:center;gap:4px;background-color:#dcfce7;border:1px solid #86efac;color:#166534;font-size:11px;font-weight:700;padding:4px 12px;border-radius:4px;">
            &#10003; 100% Full Refund
          </span>
          <span style="display:inline-flex;align-items:center;gap:4px;background-color:#dcfce7;border:1px solid #86efac;color:#166534;font-size:11px;font-weight:700;padding:4px 12px;border-radius:4px;">
            &#128230; Hassle-Free Returns
          </span>
          <span style="display:inline-flex;align-items:center;gap:4px;background-color:#dcfce7;border:1px solid #86efac;color:#166534;font-size:11px;font-weight:700;padding:4px 12px;border-radius:4px;">
            &#9889; Prompt Processing
          </span>
        </div>

      </div>
    </td>
  </tr>
</table>
<!--[/riazify:money_back:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. MODERN MINIMALIST OUTLINE (Clean Horizontal Editorial Strip)
// Solid white, hairline top & bottom dividers, clean typography without box clutter.
// ─────────────────────────────────────────────────────────────────────────────
function minimalistOutline(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const borderCol = p.borderColor ?? '#e2e8f0'
  const textCol = resolveText(p, '#0f172a', true)
  const title = titleText(p)
  const subtitle = subText(p)
  const days = daysCount(p)

  return `<!--[riazify:money_back:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .min-tbl-${id},
    .min-tbl-${id} tbody,
    .min-tbl-${id} tr {
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    .min-badge-col-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      margin-bottom: 10px !important;
      box-sizing: border-box !important;
    }
    .min-text-col-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 4px !important;
      margin-bottom: 10px !important;
      box-sizing: border-box !important;
    }
    .min-tag-col-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      box-sizing: border-box !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border-top:2px solid ${borderCol};border-bottom:2px solid ${borderCol};${pad(p, 14, 16, 14, 16)}box-sizing:border-box;width:100%;">
      <table class="min-tbl-${id}" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Solid Dark Badge -->
          <td class="min-badge-col-${id}" width="130" style="width:130px;vertical-align:middle;text-align:left;box-sizing:border-box;">
            <div style="display:inline-flex;align-items:center;gap:6px;background-color:#0f172a;color:#ffffff;font-size:10.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:6px 12px;border-radius:4px;line-height:1;">
              <span>&#128737;</span> ${days}-DAY POLICY
            </div>
          </td>

          <!-- Center Text -->
          <td class="min-text-col-${id}" style="vertical-align:middle;text-align:left;padding:0 16px;box-sizing:border-box;">
            <div style="color:${textCol};font-size:14px;font-weight:800;line-height:1.3;margin-bottom:3px;">
              ${title}
            </div>
            <div style="color:#64748b;font-size:11.5px;font-weight:500;line-height:1.4;">
              ${subtitle}
            </div>
          </td>

          <!-- Right Tag -->
          <td class="min-tag-col-${id}" width="110" style="width:110px;vertical-align:middle;text-align:right;box-sizing:border-box;">
            <div style="display:inline-flex;align-items:center;color:#0369a1;font-size:11px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;">
              &#10003; 100% PROTECTED
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:money_back:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. BOLD DARK TRUST BAR (Executive Solid Navy/Charcoal with Bullet Checklist)
// High-authority solid dark block (#0f172a), solid green accent stripe, crisp bulleted points.
// ─────────────────────────────────────────────────────────────────────────────
function boldDarkTrust(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#0f172a')
  const emerald = p.accentColor ?? '#10b981'
  const title = titleText(p)
  const subtitle = subText(p)
  const days = daysCount(p)

  return `<!--[riazify:money_back:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .bdt-tbl-${id},
    .bdt-tbl-${id} tbody,
    .bdt-tbl-${id} tr {
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    .bdt-icon-col-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding-right: 0 !important;
      margin-bottom: 12px !important;
      box-sizing: border-box !important;
    }
    .bdt-icon-box-${id} {
      margin: 0 auto !important;
    }
    .bdt-text-col-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 !important;
      box-sizing: border-box !important;
    }
    .bdt-checklist-${id} {
      justify-content: center !important;
      text-align: center !important;
      gap: 8px !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border-left:5px solid ${emerald};border-radius:6px;${pad(p, 18, 24, 18, 24)}box-sizing:border-box;width:100%;">
      <table class="bdt-tbl-${id}" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Solid Shield Icon Square -->
          <td class="bdt-icon-col-${id}" width="70" style="width:70px;vertical-align:middle;text-align:center;box-sizing:border-box;padding-right:16px;">
            <div class="bdt-icon-box-${id}" style="display:inline-flex;flex-direction:column;align-items:center;justify-content:center;width:60px;height:60px;background-color:#1e293b;border:1.5px solid #334155;border-radius:6px;">
              <span style="font-size:22px;line-height:1;margin-bottom:2px;color:#ffffff;">&#128737;</span>
              <span style="color:${emerald};font-size:10px;font-weight:900;letter-spacing:0.5px;">${days}D</span>
            </div>
          </td>

          <!-- Details & Clear Terms -->
          <td class="bdt-text-col-${id}" style="vertical-align:middle;text-align:left;box-sizing:border-box;">
            <div style="color:${emerald};font-size:10px;font-weight:900;letter-spacing:1.8px;text-transform:uppercase;margin-bottom:3px;">
              &#10003; VERIFIED BUYER PROTECTION
            </div>
            <div style="color:#ffffff;font-size:17px;font-weight:800;letter-spacing:0.2px;line-height:1.3;margin-bottom:4px;">
              ${title}
            </div>
            <div style="color:#94a3b8;font-size:12px;font-weight:500;line-height:1.4;margin-bottom:8px;">
              ${subtitle}
            </div>
            <div class="bdt-checklist-${id}" style="color:#cbd5e1;font-size:11px;font-weight:700;display:flex;gap:14px;flex-wrap:wrap;">
              <span>&#10003; 100% Purchase Price Refund</span>
              <span>&#10003; No Re-Stocking Charges</span>
              <span>&#10003; Tracked Return Support</span>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:money_back:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. DUAL-TONE SPLIT (Solid Color-Block Split with 1-2-3 Return Process)
// Two distinct solid color blocks: left days window, right step-by-step roadmap.
// ─────────────────────────────────────────────────────────────────────────────
function dualtoneSplit(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#1e1b4b')
  const splitBg = p.accentColor ?? '#4338ca'
  const days = daysCount(p)
  const title = titleText(p)
  const subtitle = subText(p)

  return `<!--[riazify:money_back:${id}]-->
<style>
  .dts-steps-desktop-${id} {
    display: table !important;
    width: 100% !important;
  }
  .dts-steps-mobile-${id} {
    display: none !important;
  }

  @media only screen and (max-width: 680px) {
    .dts-left-col-${id} {
      width: 36% !important;
      padding: 16px 8px !important;
    }
    .dts-right-col-${id} {
      width: 64% !important;
      padding: 14px 10px !important;
      text-align: center !important;
    }
    .dts-text-wrap-${id} {
      text-align: center !important;
    }
    .dts-steps-desktop-${id} {
      display: none !important;
    }
    .dts-steps-mobile-${id} {
      display: block !important;
      margin: 0 auto !important;
      text-align: center !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border-radius:8px;overflow:hidden;padding:0;box-sizing:border-box;width:100%;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Solid Accent Left Block (Side background kept) -->
          <td class="dts-left-col-${id}" width="180" style="width:180px;background-color:${splitBg};padding:24px 16px;text-align:center;vertical-align:middle;box-sizing:border-box;">
            <div style="color:#ffffff;font-size:32px;font-weight:900;letter-spacing:0.5px;line-height:1;margin-bottom:4px;">
              ${days}
            </div>
            <div style="color:#ffffff;font-size:12px;font-weight:900;letter-spacing:2px;text-transform:uppercase;line-height:1.2;margin-bottom:6px;">
              DAYS RETURN
            </div>
            <div style="display:inline-block;background-color:#312e81;color:#e0e7ff;font-size:9.5px;font-weight:800;letter-spacing:1px;padding:3px 8px;border-radius:4px;">
              ZERO RISK
            </div>
          </td>

          <!-- Right Content with 1-2-3 Process Steps -->
          <td class="dts-right-col-${id}" style="${pad(p, 18, 22, 18, 22)}text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div class="dts-text-wrap-${id}">
              <div style="color:#a5b4fc;font-size:10px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;margin-bottom:3px;">
                &#10003; SIMPLE 3-STEP REFUND PROCESS
              </div>
              <div style="color:#ffffff;font-size:16px;font-weight:800;letter-spacing:0.2px;line-height:1.3;margin-bottom:4px;">
                ${title}
              </div>
              <div style="color:#cbd5e1;font-size:11.5px;font-weight:500;line-height:1.4;margin-bottom:10px;">
                ${subtitle}
              </div>
            </div>

            <!-- Desktop View: 1 Row with 3 Steps -->
            <table class="dts-steps-desktop-${id}" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding-right:8px;vertical-align:middle;white-space:nowrap;">
                  <span style="display:inline-block;width:18px;height:18px;line-height:18px;border-radius:50%;background-color:#6366f1;color:#ffffff;text-align:center;font-size:10px;font-weight:900;">1</span>
                  <span style="color:#f1f5f9;font-size:11px;font-weight:700;margin-left:4px;">Contact Us</span>
                </td>
                <td style="padding-right:8px;vertical-align:middle;white-space:nowrap;">
                  <span style="display:inline-block;width:18px;height:18px;line-height:18px;border-radius:50%;background-color:#6366f1;color:#ffffff;text-align:center;font-size:10px;font-weight:900;">2</span>
                  <span style="color:#f1f5f9;font-size:11px;font-weight:700;margin-left:4px;">Return Item</span>
                </td>
                <td style="vertical-align:middle;white-space:nowrap;">
                  <span style="display:inline-block;width:18px;height:18px;line-height:18px;border-radius:50%;background-color:#6366f1;color:#ffffff;text-align:center;font-size:10px;font-weight:900;">3</span>
                  <span style="color:#f1f5f9;font-size:11px;font-weight:700;margin-left:4px;">Receive Payout</span>
                </td>
              </tr>
            </table>

            <!-- Mobile View: 2 Rows (Row 1: Contact Us & Return Item | Row 2: Receive Payout in Middle) -->
            <div class="dts-steps-mobile-${id}">
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;border-collapse:collapse;">
                <tr>
                  <td align="center" style="padding:0 6px 6px 0;white-space:nowrap;">
                    <span style="display:inline-block;width:18px;height:18px;line-height:18px;border-radius:50%;background-color:#6366f1;color:#ffffff;text-align:center;font-size:10px;font-weight:900;">1</span>
                    <span style="color:#f1f5f9;font-size:10.5px;font-weight:700;margin-left:3px;">Contact Us</span>
                  </td>
                  <td align="center" style="padding:0 0 6px 6px;white-space:nowrap;">
                    <span style="display:inline-block;width:18px;height:18px;line-height:18px;border-radius:50%;background-color:#6366f1;color:#ffffff;text-align:center;font-size:10px;font-weight:900;">2</span>
                    <span style="color:#f1f5f9;font-size:10.5px;font-weight:700;margin-left:3px;">Return Item</span>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" align="center" style="padding-top:2px;white-space:nowrap;">
                    <span style="display:inline-block;width:18px;height:18px;line-height:18px;border-radius:50%;background-color:#6366f1;color:#ffffff;text-align:center;font-size:10px;font-weight:900;">3</span>
                    <span style="color:#f1f5f9;font-size:10.5px;font-weight:700;margin-left:3px;">Receive Payout</span>
                  </td>
                </tr>
              </table>
            </div>

          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:money_back:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. GOLDEN ELITE CREST (Classical Double-Framed Heritage Certificate)
// Warm cream solid background (#fafaf9), double solid gold borders, engraved crown crest.
// ─────────────────────────────────────────────────────────────────────────────
function goldenElite(p: any, id: string): string {
  const f = p.fontFamily ? `${p.fontFamily}, Georgia, serif` : 'Georgia, serif'
  const bgCol = resolveBg(p, '#fafaf9')
  const gold = p.accentColor ?? '#b45309'
  const textCol = resolveText(p, '#1c1917', true)
  const title = titleText(p, 'Guaranteed Authenticity & Protection')
  const subtitle = subText(p, 'Return in original condition within 30 days for an immediate courteous refund.')
  const tag = p.badgeText ?? 'OFFICIAL BUYER ASSURANCE'

  return `<!--[riazify:money_back:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:2px solid ${gold};${pad(p, 16, 20, 16, 20)}border-radius:4px;text-align:center;box-sizing:border-box;">
      <div style="border:1px solid ${gold};padding:18px 24px;border-radius:2px;box-sizing:border-box;">

        <!-- Ornate Crown Emblem -->
        <div style="color:${gold};font-size:18px;line-height:1;margin-bottom:4px;">
          &#9813;
        </div>

        <div style="color:${gold};font-size:9.5px;font-weight:700;letter-spacing:3px;text-transform:uppercase;line-height:1;margin-bottom:6px;">
          &#10022; ${tag} &#10022;
        </div>

        <div style="color:${textCol};font-size:20px;font-weight:400;letter-spacing:1px;line-height:1.3;margin:0 0 6px 0;">
          ${title}
        </div>

        <div style="color:#78716c;font-family:Arial,sans-serif;font-size:12px;font-weight:500;letter-spacing:0.4px;line-height:1.45;max-width:540px;margin:0 auto 10px auto;">
          ${subtitle}
        </div>

        <div style="display:inline-block;border-top:1px solid rgba(180,83,9,0.3);padding-top:6px;color:${gold};font-family:Arial,sans-serif;font-size:10.5px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
          Certified Authentic Seller &middot; 100% Satisfaction Pledged
        </div>

      </div>
    </td>
  </tr>
</table>
<!--[/riazify:money_back:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. MODERN RETAIL CARD (Crisp Solid White Card with Inset Policy Pill Grid)
// Grounded commercial retail card with solid slate insets, zero transparency/blur.
// ─────────────────────────────────────────────────────────────────────────────
function retailPolicyCard(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const borderCol = p.borderColor ?? '#cbd5e1'
  const textCol = resolveText(p, '#0f172a', true)
  const title = titleText(p)
  const subtitle = subText(p)
  const days = daysCount(p)

  return `<!--[riazify:money_back:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:2px solid ${borderCol};${pad(p, 18, 22, 18, 22)}border-radius:8px;text-align:center;box-sizing:border-box;">
      <div style="max-width:600px;margin:0 auto;box-sizing:border-box;">

        <div style="display:inline-block;background-color:#0f172a;color:#ffffff;font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:4px 12px;border-radius:4px;margin-bottom:8px;">
          VERIFIED MERCHANT POLICY
        </div>

        <div style="color:${textCol};font-size:18px;font-weight:900;letter-spacing:0.2px;line-height:1.3;margin-bottom:4px;">
          ${title}
        </div>

        <div style="color:#64748b;font-size:12.5px;font-weight:500;line-height:1.45;margin-bottom:12px;">
          ${subtitle}
        </div>

        <!-- 3 Solid Retail Inset Chips -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
          <tr>
            <td width="33%" style="padding:0 4px;vertical-align:top;box-sizing:border-box;">
              <div style="background-color:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:8px 6px;text-align:center;">
                <div style="color:#0f172a;font-size:13.5px;font-weight:900;">${days} DAYS</div>
                <div style="color:#64748b;font-size:10px;font-weight:700;text-transform:uppercase;margin-top:2px;">Return Window</div>
              </div>
            </td>
            <td width="33%" style="padding:0 4px;vertical-align:top;box-sizing:border-box;">
              <div style="background-color:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:8px 6px;text-align:center;">
                <div style="color:#0f172a;font-size:13.5px;font-weight:900;">100% PAID</div>
                <div style="color:#64748b;font-size:10px;font-weight:700;text-transform:uppercase;margin-top:2px;">Money Back</div>
              </div>
            </td>
            <td width="33%" style="padding:0 4px;vertical-align:top;box-sizing:border-box;">
              <div style="background-color:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:8px 6px;text-align:center;">
                <div style="color:#0f172a;font-size:13.5px;font-weight:900;">ZERO RISK</div>
                <div style="color:#64748b;font-size:10px;font-weight:700;text-transform:uppercase;margin-top:2px;">Buyer Protection</div>
              </div>
            </td>
          </tr>
        </table>

      </div>
    </td>
  </tr>
</table>
<!--[/riazify:money_back:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. SOLID EMERALD BUYER PROTECTION (High-Impact Rich Green Banner)
// Solid rich emerald fill (#059669) with white circular seal and bold white CTA badge.
// ─────────────────────────────────────────────────────────────────────────────
function solidEmeraldBanner(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#059669')
  const title = titleText(p)
  const subtitle = subText(p)

  return `<!--[riazify:money_back:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .emr-tbl-${id},
    .emr-tbl-${id} tbody,
    .emr-tbl-${id} tr {
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    .emr-seal-col-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      margin-bottom: 10px !important;
      box-sizing: border-box !important;
    }
    .emr-seal-${id} {
      margin: 0 auto !important;
    }
    .emr-text-col-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      padding: 0 4px !important;
      margin-bottom: 12px !important;
      box-sizing: border-box !important;
    }
    .emr-badge-col-${id} {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      box-sizing: border-box !important;
    }
    .emr-badge-${id} {
      display: inline-block !important;
      margin: 0 auto !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 16, 20, 16, 20)}border-radius:8px;box-sizing:border-box;width:100%;">
      <table class="emr-tbl-${id}" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Circular White Seal -->
          <td class="emr-seal-col-${id}" width="52" style="width:52px;vertical-align:middle;text-align:center;box-sizing:border-box;">
            <div class="emr-seal-${id}" style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;background-color:#ffffff;border-radius:50%;color:#059669;font-size:22px;line-height:44px;">
              &#10003;
            </div>
          </td>

          <!-- Center Messaging -->
          <td class="emr-text-col-${id}" style="vertical-align:middle;text-align:left;padding:0 14px;box-sizing:border-box;">
            <div style="color:#ffffff;font-size:17px;font-weight:900;letter-spacing:0.3px;line-height:1.25;margin-bottom:3px;">
              ${title}
            </div>
            <div style="color:#dcfce7;font-size:12px;font-weight:600;line-height:1.35;">
              ${subtitle}
            </div>
          </td>

          <!-- Right Pill Badge -->
          <td class="emr-badge-col-${id}" width="130" style="width:130px;vertical-align:middle;text-align:right;box-sizing:border-box;">
            <div class="emr-badge-${id}" style="display:inline-block;background-color:#ffffff;color:#065f46;font-size:11px;font-weight:900;letter-spacing:0.8px;text-transform:uppercase;padding:7px 14px;border-radius:4px;white-space:nowrap;">
              HASSLE-FREE
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:money_back:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. RISK-FREE WARRANTY TICKET (Authentic Dashed Certificate / Voucher Stamp)
// Real coupon/ticket styling with dashed border, red warranty stamp, and security serial.
// ─────────────────────────────────────────────────────────────────────────────
function riskFreeCard(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const borderCol = p.borderColor ?? '#94a3b8'
  const textCol = resolveText(p, '#0f172a', true)
  const title = titleText(p)
  const subtitle = subText(p)
  const days = daysCount(p)

  return `<!--[riazify:money_back:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:2px dashed ${borderCol};${pad(p, 18, 22, 18, 22)}border-radius:8px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Red Stub -->
          <td width="110" style="width:110px;vertical-align:middle;text-align:center;box-sizing:border-box;border-right:2px dashed ${borderCol};padding-right:14px;">
            <div style="display:inline-block;background-color:#dc2626;color:#ffffff;font-size:9.5px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:4px 8px;border-radius:3px;margin-bottom:4px;">
              OFFICIAL
            </div>
            <div style="color:#0f172a;font-size:18px;font-weight:900;line-height:1;margin-bottom:2px;">
              ${days} DAYS
            </div>
            <div style="color:#64748b;font-size:9.5px;font-weight:700;text-transform:uppercase;">
              WARRANTY
            </div>
          </td>

          <!-- Certificate Content -->
          <td style="vertical-align:middle;text-align:left;padding-left:18px;box-sizing:border-box;">
            <div style="color:${textCol};font-size:16.5px;font-weight:900;letter-spacing:0.2px;line-height:1.3;margin-bottom:3px;">
              ${title}
            </div>
            <div style="color:#475569;font-size:12px;font-weight:500;line-height:1.4;margin-bottom:6px;">
              ${subtitle}
            </div>
            <!-- Security Serial Line -->
            <div style="color:#64748b;font-family:Courier,monospace;font-size:10.5px;font-weight:700;letter-spacing:1px;">
              AUTHENTICATED SELLER POLICY &middot; CODE: MBG-${days}D-VERIFIED
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:money_back:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. HIGH-IMPACT SAFETY BAR (Heavy-Duty Solid Industrial Protection)
// Solid dark slate (#0f172a) with high-visibility amber security accents.
// ─────────────────────────────────────────────────────────────────────────────
function safetyBar(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#0f172a')
  const amber = p.accentColor ?? '#f59e0b'
  const title = titleText(p)
  const subtitle = subText(p)
  const days = daysCount(p)

  return `<!--[riazify:money_back:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:2px solid ${amber};${pad(p, 16, 20, 16, 20)}border-radius:6px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Amber Caution Badge -->
          <td width="50" style="width:50px;vertical-align:middle;text-align:center;font-size:26px;color:${amber};box-sizing:border-box;">
            &#9888;
          </td>

          <!-- Main Info -->
          <td style="vertical-align:middle;text-align:left;padding-left:10px;box-sizing:border-box;">
            <div style="color:${amber};font-size:10px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;line-height:1;margin-bottom:3px;">
              &#10003; ${days}-DAY RISK-FREE COMMERCIAL TERMS
            </div>
            <div style="color:#ffffff;font-size:17.5px;font-weight:900;letter-spacing:0.3px;line-height:1.25;margin-bottom:3px;">
              ${title}
            </div>
            <div style="color:#94a3b8;font-size:12px;font-weight:600;line-height:1.35;">
              ${subtitle}
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:money_back:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. 3-COLUMN COMMERCIAL VERIFIED MATRIX (Dynamic Icons & Icon Library Hook)
// ─────────────────────────────────────────────────────────────────────────────

// Comprehensive SVG dictionary converting icon names/slugs into authentic SVGs
function resolveIconSvg(rawVal: any, fallbackSvg: string, strokeColor = '#0284c7'): string {
  if (!rawVal) return fallbackSvg

  // If it's already an SVG string or image element, render as-is
  const str = String(rawVal).trim()
  if (str.startsWith('<svg') || str.startsWith('<img')) return str
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:image')) {
    return `<img src="${str}" width="22" height="22" style="display:inline-block;vertical-align:middle;object-fit:contain;" />`
  }

  // Clean slug name (e.g., "Flame / Thermal" -> "flame", "Flame" -> "flame")
  const key = str.toLowerCase().split('/')[0].trim().replace(/[^a-z0-9_-]/g, '')

  const svgWrap = (paths: string) =>
    `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">${paths}</svg>`

  const ICON_SVGS: Record<string, string> = {
    // Lifestyle & Nature (from your Icon Library panel)
    flame: svgWrap('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>'),
    thermal: svgWrap('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>'),
    fire: svgWrap('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>'),
    droplet: svgWrap('<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>'),
    water: svgWrap('<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>'),
    leaf: svgWrap('<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>'),
    eco: svgWrap('<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>'),
    heart: svgWrap('<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>'),
    care: svgWrap('<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>'),
    sun: svgWrap('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>'),
    energy: svgWrap('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/>'),
    moon: svgWrap('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),
    night: svgWrap('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),
    weight: svgWrap('<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/>'),
    ultralight: svgWrap('<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/>'),
    feather: svgWrap('<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/>'),
    gem: svgWrap('<path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>'),
    pristine: svgWrap('<path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>'),
    diamond: svgWrap('<path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>'),
    watch: svgWrap('<circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 13.5 13.5"/><path d="M16.51 17.35l-.85 3.65H8.34l-.85-3.65"/><path d="M7.49 6.65l.85-3.65h7.32l.85 3.65"/>'),
    clock: svgWrap('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
    eyewear: svgWrap('<circle cx="6" cy="15" r="4"/><circle cx="18" cy="15" r="4"/><path d="M14 15a2 2 0 0 0-4 0"/><path d="M2.5 13 5 7c.7-1.3 1.4-2 3-2"/><path d="M21.5 13 19 7c-.7-1.3-1.4-2-3-2"/>'),
    color: svgWrap('<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.992 6.012 17.461 2 12 2z"/>'),
    scale: svgWrap('<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h18"/>'),
    umbrella: svgWrap('<path d="M22 12a10.06 10.06 0 0 0-20 0Z"/><path d="M12 12v8a2 2 0 0 0 4 0"/><path d="M12 2v1"/>'),
    rainproof: svgWrap('<path d="M22 12a10.06 10.06 0 0 0-20 0Z"/><path d="M12 12v8a2 2 0 0 0 4 0"/><path d="M12 2v1"/>'),
    material: svgWrap('<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>'),
    sparkles: svgWrap('<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>'),
    plated: svgWrap('<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>'),
    mountain: svgWrap('<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>'),
    tent: svgWrap('<path d="M19 20 10 4 1 20h18z"/><path d="m10 4 9 16"/><path d="M14 20h7"/>'),
    snowflake: svgWrap('<path d="m10 20-1.25-2.5L6 18"/><path d="M10 4 8.75 6.5 6 6"/><path d="m14 20 1.25-2.5L18 18"/><path d="m14 4 1.25 2.5L18 6"/><path d="m17 21-3-6h-4l-3 6"/><path d="m17 3-3 6h-4L7 3"/><path d="M2 12h20"/><path d="m20 10-2.5 1.25L18 14"/><path d="m4 10 2.5 1.25L6 14"/><path d="m20 14-2.5-1.25L18 10"/><path d="m4 14 2.5-1.25L6 10"/>'),
    coffee: svgWrap('<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>'),
    camera: svgWrap('<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>'),
    music: svgWrap('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'),

    // Core Guarantee Icons
    shield: svgWrap('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>'),
    protection: svgWrap('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>'),
    scratch: svgWrap('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>'),
    calendar: svgWrap('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
    window: svgWrap('<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
    zap: svgWrap('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'),
    payout: svgWrap('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'),
    bolt: svgWrap('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'),
    lightning: svgWrap('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'),
    check: svgWrap('<polyline points="20 6 9 17 4 12"/>'),
    truck: svgWrap('<rect width="16" height="13" x="1" y="6" rx="2"/><polygon points="17 8 20 8 23 11 23 16 17 16 17 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>'),
    star: svgWrap('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
    award: svgWrap('<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>'),
    lock: svgWrap('<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
  }

  // Exact match or partial match
  if (ICON_SVGS[key]) return ICON_SVGS[key]
  for (const k of Object.keys(ICON_SVGS)) {
    if (key.includes(k) || k.includes(key)) return ICON_SVGS[k]
  }

  return fallbackSvg
}

function verifiedMatrix(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#f8fafc')
  const borderCol = p.borderColor ?? '#e2e8f0'
  const days = daysCount(p)

  // Default Vector SVGs
  const defaultIcon0 = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`
  const defaultIcon1 = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
  const defaultIcon2 = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`

  // Dynamic icon resolver (supports icon replacement from library by slug, name, or raw SVG)
  const getRawIcon = (idx: number) => {
    const feat = p.features?.[idx]
    if (typeof feat === 'string') return feat
    if (feat?.icon) return feat.icon
    if (p.icons?.[idx]) return p.icons[idx]
    if (p[`icon${idx + 1}`]) return p[`icon${idx + 1}`]
    if (p[`mb_icon_${idx}`]) return p[`mb_icon_${idx}`]
    return null
  }

  const icon0 = resolveIconSvg(getRawIcon(0), defaultIcon0, '#0284c7')
  const icon1 = resolveIconSvg(getRawIcon(1), defaultIcon1, '#0284c7')
  const icon2 = resolveIconSvg(getRawIcon(2), defaultIcon2, '#0284c7')

  return `<!--[riazify:money_back:${id}]-->
<style>
  @media only screen and (max-width: 680px) {
    .vmb-col-${id} {
      display: block !important;
      width: 100% !important;
      padding: 0 0 8px 0 !important;
      box-sizing: border-box !important;
    }
  }
</style>
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100% !important;min-width:100% !important;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:2px solid ${borderCol};${pad(p, 16, 16, 16, 16)}border-radius:8px;box-sizing:border-box;width:100%;">

      <!-- Header -->
      <div style="text-align:center;margin-bottom:12px;">
        <span style="color:#0284c7;font-size:10.5px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">
          &#10003; VERIFIED BUYER SATISFACTION GUARANTEE
        </span>
      </div>

      <!-- 3-Column Policy Matrix -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Col 1 -->
          <td class="vmb-col-${id}" width="33%" style="padding:0 6px;vertical-align:top;box-sizing:border-box;">
            <div style="background-color:#ffffff;border:1px solid #cbd5e1;border-radius:6px;padding:12px 10px;text-align:center;box-sizing:border-box;">
              <div data-feature-index="0" data-block-id="${id}" style="width:36px;height:36px;margin:0 auto 6px auto;display:flex;align-items:center;justify-content:center;border-radius:8px;cursor:pointer;box-sizing:border-box;">
                ${icon0}
              </div>
              <div style="color:#0f172a;font-size:13px;font-weight:800;margin-bottom:3px;">Full Protection</div>
              <div style="color:#64748b;font-size:11px;font-weight:500;line-height:1.35;">Guaranteed refund if item does not match description.</div>
            </div>
          </td>

          <!-- Col 2 -->
          <td class="vmb-col-${id}" width="33%" style="padding:0 6px;vertical-align:top;box-sizing:border-box;">
            <div style="background-color:#ffffff;border:1px solid #cbd5e1;border-radius:6px;padding:12px 10px;text-align:center;box-sizing:border-box;">
              <div data-feature-index="1" data-block-id="${id}" style="width:36px;height:36px;margin:0 auto 6px auto;display:flex;align-items:center;justify-content:center;border-radius:8px;cursor:pointer;box-sizing:border-box;">
                ${icon1}
              </div>
              <div style="color:#0f172a;font-size:13px;font-weight:800;margin-bottom:3px;">${days}-Day Window</div>
              <div style="color:#64748b;font-size:11px;font-weight:500;line-height:1.35;">Generous return timeframe with zero buyer pressure.</div>
            </div>
          </td>

          <!-- Col 3 -->
          <td class="vmb-col-${id}" width="33%" style="padding:0 6px;vertical-align:top;box-sizing:border-box;">
            <div style="background-color:#ffffff;border:1px solid #cbd5e1;border-radius:6px;padding:12px 10px;text-align:center;box-sizing:border-box;">
              <div data-feature-index="2" data-block-id="${id}" style="width:36px;height:36px;margin:0 auto 6px auto;display:flex;align-items:center;justify-content:center;border-radius:8px;cursor:pointer;box-sizing:border-box;">
                ${icon2}
              </div>
              <div style="color:#0f172a;font-size:13px;font-weight:800;margin-bottom:3px;">Prompt Payout</div>
              <div style="color:#64748b;font-size:11px;font-weight:500;line-height:1.35;">Funds credited promptly upon safe receipt of item.</div>
            </div>
          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>
<!--[/riazify:money_back:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export const moneyBackVariants: BlockVariant[] = [
  {
    id: 'mb-trust-shield-green',
    label: 'Trust Shield Green',
    description: 'Classic centered embossed seal with 3 reassurance micro-badges',
    toHtml(props, id) { return trustShieldGreen(props, id) },
  },
  {
    id: 'mb-minimalist-outline',
    label: 'Modern Minimalist',
    description: 'Compact 1-line horizontal editorial strip with inline guarantee terms',
    toHtml(props, id) { return minimalistOutline(props, id) },
  },
  {
    id: 'mb-bold-dark-trust',
    label: 'Bold Dark Trust Bar',
    description: 'Executive navy block with solid shield badge and return policy checklist',
    toHtml(props, id) { return boldDarkTrust(props, id) },
  },
  {
    id: 'mb-dualtone-split',
    label: 'Dual-Tone Split',
    description: 'Solid color-block return stamp on the left paired with a 1-2-3 return process',
    toHtml(props, id) { return dualtoneSplit(props, id) },
  },
  {
    id: 'mb-golden-elite',
    label: 'Golden Elite Crest',
    description: 'Classical certificate layout with corner rules, gold crest, and serif tracking',
    toHtml(props, id) { return goldenElite(props, id) },
  },
  {
    id: 'mb-glassmorphism-trust',
    label: 'Modern Retail Card',
    description: 'Crisp white commercial card with 3 solid metric chips and zero blur effects',
    toHtml(props, id) { return retailPolicyCard(props, id) },
  },
  {
    id: 'mb-gradient-trust',
    label: 'Solid Emerald Banner',
    description: 'Solid rich emerald protection banner with circular white seal and CTA pill',
    toHtml(props, id) { return solidEmeraldBanner(props, id) },
  },
  {
    id: 'mb-risk-free-card',
    label: 'Risk-Free Warranty Ticket',
    description: 'Physical warranty certificate card with dashed border and security serial stamp',
    toHtml(props, id) { return riskFreeCard(props, id) },
  },
  {
    id: 'mb-neon-secure',
    label: 'High-Impact Safety Bar',
    description: 'Solid dark industrial protection bar with bold amber caution highlights',
    toHtml(props, id) { return safetyBar(props, id) },
  },
  {
    id: 'mb-verified-banner',
    label: '3-Column Verified Matrix',
    description: '3-column security policy matrix covering protection, days window, and fast payout',
    toHtml(props, id) { return verifiedMatrix(props, id) },
  },
]

/**
 * Robust Variant Resolver:
 * Supports variant IDs with or without the 'mb-' prefix and matches
 * shorthand IDs seamlessly.
 */
export function getMoneyBackVariant(id: string): BlockVariant {
  if (!id) return moneyBackVariants[0]

  const clean = id.toLowerCase().trim().replace(/^mb[-_]/, '').replace(/_/g, '-')

  const match = moneyBackVariants.find(v => {
    const vClean = v.id.toLowerCase().replace(/^mb[-_]/, '').replace(/_/g, '-')
    return (
      v.id === id ||
      vClean === clean ||
      v.id.endsWith(clean) ||
      clean.includes(vClean) ||
      vClean.includes(clean)
    )
  })

  return match ?? moneyBackVariants[0]
}
