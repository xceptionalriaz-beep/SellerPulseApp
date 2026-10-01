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
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
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
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border-top:2px solid ${borderCol};border-bottom:2px solid ${borderCol};${pad(p, 12, 16, 12, 16)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Solid Dark Badge -->
          <td width="130" style="width:130px;vertical-align:middle;text-align:left;box-sizing:border-box;">
            <div style="display:inline-flex;align-items:center;gap:6px;background-color:#0f172a;color:#ffffff;font-size:10.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:6px 12px;border-radius:4px;line-height:1;">
              <span>&#128737;</span> ${days}-DAY POLICY
            </div>
          </td>

          <!-- Center Text -->
          <td style="vertical-align:middle;text-align:left;padding:0 16px;box-sizing:border-box;">
            <div style="color:${textCol};font-size:13.5px;font-weight:700;line-height:1.3;margin-bottom:2px;">
              ${title}
            </div>
            <div style="color:#64748b;font-size:11.5px;font-weight:500;line-height:1.35;">
              ${subtitle}
            </div>
          </td>

          <!-- Right Tag -->
          <td width="110" style="width:110px;vertical-align:middle;text-align:right;box-sizing:border-box;">
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
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border-left:5px solid ${emerald};border-radius:6px;${pad(p, 18, 24, 18, 24)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Solid Shield Icon Square -->
          <td width="70" style="width:70px;vertical-align:middle;text-align:center;box-sizing:border-box;padding-right:16px;">
            <div style="display:inline-flex;flex-direction:column;align-items:center;justify-content:center;width:60px;height:60px;background-color:#1e293b;border:1.5px solid #334155;border-radius:6px;">
              <span style="font-size:22px;line-height:1;margin-bottom:2px;color:#ffffff;">&#128737;</span>
              <span style="color:${emerald};font-size:10px;font-weight:900;letter-spacing:0.5px;">${days}D</span>
            </div>
          </td>

          <!-- Details & Clear Terms -->
          <td style="vertical-align:middle;text-align:left;box-sizing:border-box;">
            <div style="color:${emerald};font-size:10px;font-weight:900;letter-spacing:1.8px;text-transform:uppercase;margin-bottom:3px;">
              &#10003; VERIFIED BUYER PROTECTION
            </div>
            <div style="color:#ffffff;font-size:17px;font-weight:800;letter-spacing:0.2px;line-height:1.3;margin-bottom:4px;">
              ${title}
            </div>
            <div style="color:#94a3b8;font-size:12px;font-weight:500;line-height:1.4;margin-bottom:6px;">
              ${subtitle}
            </div>
            <div style="color:#cbd5e1;font-size:11px;font-weight:700;display:flex;gap:14px;flex-wrap:wrap;">
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
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border-radius:8px;overflow:hidden;padding:0;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Solid Accent Left Block -->
          <td width="180" style="width:180px;background-color:${splitBg};padding:24px 16px;text-align:center;vertical-align:middle;box-sizing:border-box;">
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
          <td style="${pad(p, 18, 22, 18, 22)}text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div style="color:#a5b4fc;font-size:10px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;margin-bottom:3px;">
              &#10003; SIMPLE 3-STEP REFUND PROCESS
            </div>
            <div style="color:#ffffff;font-size:17px;font-weight:800;letter-spacing:0.2px;line-height:1.3;margin-bottom:4px;">
              ${title}
            </div>
            <div style="color:#cbd5e1;font-size:12px;font-weight:500;line-height:1.4;margin-bottom:10px;">
              ${subtitle}
            </div>

            <!-- Steps Table -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding-right:8px;vertical-align:middle;">
                  <span style="display:inline-block;width:18px;height:18px;line-height:18px;border-radius:50%;background-color:#6366f1;color:#ffffff;text-align:center;font-size:10px;font-weight:900;">1</span>
                  <span style="color:#f1f5f9;font-size:11px;font-weight:700;margin-left:4px;">Contact Us</span>
                </td>
                <td style="padding-right:8px;vertical-align:middle;">
                  <span style="display:inline-block;width:18px;height:18px;line-height:18px;border-radius:50%;background-color:#6366f1;color:#ffffff;text-align:center;font-size:10px;font-weight:900;">2</span>
                  <span style="color:#f1f5f9;font-size:11px;font-weight:700;margin-left:4px;">Return Item</span>
                </td>
                <td style="vertical-align:middle;">
                  <span style="display:inline-block;width:18px;height:18px;line-height:18px;border-radius:50%;background-color:#6366f1;color:#ffffff;text-align:center;font-size:10px;font-weight:900;">3</span>
                  <span style="color:#f1f5f9;font-size:11px;font-weight:700;margin-left:4px;">Receive Payout</span>
                </td>
              </tr>
            </table>
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
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
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
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
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
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 16, 20, 16, 20)}border-radius:8px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Circular White Seal -->
          <td width="52" style="width:52px;vertical-align:middle;text-align:center;box-sizing:border-box;">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;background-color:#ffffff;border-radius:50%;color:#059669;font-size:22px;line-height:44px;">
              &#10003;
            </div>
          </td>

          <!-- Center Messaging -->
          <td style="vertical-align:middle;text-align:left;padding:0 14px;box-sizing:border-box;">
            <div style="color:#ffffff;font-size:17px;font-weight:900;letter-spacing:0.3px;line-height:1.25;margin-bottom:3px;">
              ${title}
            </div>
            <div style="color:#dcfce7;font-size:12px;font-weight:600;line-height:1.35;">
              ${subtitle}
            </div>
          </td>

          <!-- Right Pill Badge -->
          <td width="130" style="width:130px;vertical-align:middle;text-align:right;box-sizing:border-box;">
            <div style="display:inline-block;background-color:#ffffff;color:#065f46;font-size:11px;font-weight:900;letter-spacing:0.8px;text-transform:uppercase;padding:7px 14px;border-radius:4px;white-space:nowrap;">
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
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
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
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
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
// 10. 3-COLUMN COMMERCIAL VERIFIED MATRIX (3 Separate Comparison Policy Cards)
// Clear, solid, multi-column breakdown: Protection, 30-Day Window, Rapid Payout.
// ─────────────────────────────────────────────────────────────────────────────
function verifiedMatrix(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#f8fafc')
    const borderCol = p.borderColor ?? '#e2e8f0'
    const days = daysCount(p)

    return `<!--[riazify:money_back:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:2px solid ${borderCol};${pad(p, 16, 16, 16, 16)}border-radius:8px;box-sizing:border-box;">

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
          <td width="33%" style="padding:0 6px;vertical-align:top;box-sizing:border-box;">
            <div style="background-color:#ffffff;border:1px solid #cbd5e1;border-radius:6px;padding:12px 10px;text-align:center;box-sizing:border-box;">
              <div style="font-size:22px;margin-bottom:4px;color:#0284c7;">&#128737;</div>
              <div style="color:#0f172a;font-size:13px;font-weight:800;margin-bottom:3px;">Full Protection</div>
              <div style="color:#64748b;font-size:11px;font-weight:500;line-height:1.35;">Guaranteed refund if item does not match description.</div>
            </div>
          </td>

          <!-- Col 2 -->
          <td width="33%" style="padding:0 6px;vertical-align:top;box-sizing:border-box;">
            <div style="background-color:#ffffff;border:1px solid #cbd5e1;border-radius:6px;padding:12px 10px;text-align:center;box-sizing:border-box;">
              <div style="font-size:22px;margin-bottom:4px;color:#0284c7;">&#128197;</div>
              <div style="color:#0f172a;font-size:13px;font-weight:800;margin-bottom:3px;">${days}-Day Window</div>
              <div style="color:#64748b;font-size:11px;font-weight:500;line-height:1.35;">Generous return timeframe with zero buyer pressure.</div>
            </div>
          </td>

          <!-- Col 3 -->
          <td width="33%" style="padding:0 6px;vertical-align:top;box-sizing:border-box;">
            <div style="background-color:#ffffff;border:1px solid #cbd5e1;border-radius:6px;padding:12px 10px;text-align:center;box-sizing:border-box;">
              <div style="font-size:22px;margin-bottom:4px;color:#0284c7;">&#9889;</div>
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
