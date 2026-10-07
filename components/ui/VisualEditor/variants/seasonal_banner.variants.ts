// components/ui/VisualEditor/variants/seasonal_banner.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Seasonal Banner — 10 Distinct, Compliance-Safe eBay Layout Styles (Polished)
// Dynamic Theme Binding: Each style provides its own signature background,
// typography, and responsive layout structure when switched on the canvas.
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
  id: string
  label: string
  description: string
  toHtml: (props: any, id: string) => string
}

// ─── Helpers & Color Overrides ───────────────────────────────────────────────
function pad(p: any, defaultT = 20, defaultR = 24, defaultB = 20, defaultL = 24): string {
  const top = p.paddingTop ?? defaultT
  const right = p.paddingRight ?? defaultR
  const bottom = p.paddingBottom ?? defaultB
  const left = p.paddingLeft ?? defaultL
  return `padding:${top}px ${right}px ${bottom}px ${left}px;`
}

function font(p: any, defaultFamily = 'Arial, Helvetica, sans-serif'): string {
  return p.fontFamily ? `${p.fontFamily}, Arial, sans-serif` : defaultFamily
}

function titleText(p: any, fallback = 'Seasonal Sale — Up To 50% Off!'): string {
  return p.bannerTitle ?? p.title ?? fallback
}

function subText(p: any, fallback = 'Limited time only · While stocks last'): string {
  return p.bannerSubtitle ?? p.subtitle ?? fallback
}

/**
 * Resolves background color: If p.bgColor is the default red (#dc2626) from
 * initial block creation or undefined, each style applies its own signature background.
 */
function resolveBg(p: any, signatureBg: string): string {
  if (!p.bgColor || p.bgColor.toLowerCase() === '#dc2626') {
    return signatureBg
  }
  return p.bgColor
}

/**
 * Resolves text color: If p.textColor is the default white (#ffffff) but the
 * variant is a light theme (e.g. Minimalist or Wholesale), use dark text.
 */
function resolveText(p: any, signatureText: string, isLightVariant = false): string {
  if (isLightVariant && (!p.textColor || p.textColor.toLowerCase() === '#ffffff')) {
    return signatureText
  }
  return p.textColor ?? signatureText
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. FESTIVE HOLIDAY RIBBON (Classic Default)
// Solid crimson/emerald container, centered festive emojis, bold uppercase tracking.
// ─────────────────────────────────────────────────────────────────────────────
function festiveRibbon(p: any, id: string): string {
  const f = font(p)
  const bgCol = p.bgColor ?? '#dc2626'
  const textCol = p.textColor ?? '#ffffff'
  const icon = p.icon ?? '&#127873; &#127876; &#127873;' // 🎁 🎄 🎁
  const title = titleText(p)
  const subtitle = subText(p)
  const badge = p.badgeText ?? 'HOLIDAY SPECIAL'

  return `<!--[riazify:seasonal_banner:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 20, 24, 20, 24)}border-radius:10px;text-align:center;box-sizing:border-box;">
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;max-width:600px;margin:0 auto;box-sizing:border-box;">

        <div style="display:inline-flex;align-items:center;justify-content:center;gap:8px;line-height:1;margin-bottom:2px;">
          <span style="font-size:22px;line-height:1;">${icon}</span>
        </div>

        ${badge ? `
        <div style="display:inline-block;background-color:rgba(0,0,0,0.22);color:#fef08a;border:1px solid rgba(254,240,138,0.35);font-size:10px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;padding:3px 12px;border-radius:100px;line-height:1.3;box-sizing:border-box;">
          ${badge}
        </div>` : ''}

        <div style="color:${textCol};font-size:22px;font-weight:800;letter-spacing:0.4px;line-height:1.25;margin:2px 0 0 0;text-shadow:0 1px 3px rgba(0,0,0,0.25);">
          ${title}
        </div>

        <div style="color:rgba(255,255,255,0.92);font-size:13px;font-weight:500;letter-spacing:0.3px;line-height:1.4;margin:0;">
          ${subtitle}
        </div>

      </div>
    </td>
  </tr>
</table>
<!--[/riazify:seasonal_banner:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. NEON CYBER FLASH BANNER
// Pitch-black background (#09090b) with glowing neon cyan border and text.
// ─────────────────────────────────────────────────────────────────────────────
function neonCyber(p: any, id: string): string {
  const f = font(p, "'Courier New', Courier, monospace, Arial")
  const bgCol = resolveBg(p, '#09090b')
  const neonCyan = p.accentColor ?? '#22d3ee'
  const textCol = p.textColor ?? '#ffffff'
  const title = titleText(p, 'CYBER HOLIDAY FLASH — 50% OFF')
  const subtitle = subText(p, 'LIMITED RUN // VERIFIED INSTANT DISPATCH // STOCK DEPLETING')
  const tag = p.badgeText ?? '// SYSTEM ALERT: FLASH DEAL //'

  return `<!--[riazify:seasonal_banner:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:2px solid ${neonCyan};box-shadow:0 0 16px rgba(34,211,238,0.35), inset 0 0 12px rgba(34,211,238,0.12);${pad(p, 18, 24, 18, 24)}border-radius:8px;text-align:center;box-sizing:border-box;">
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;box-sizing:border-box;">

        <div style="color:${neonCyan};font-size:10.5px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;line-height:1;display:inline-block;padding:3px 10px;background-color:rgba(34,211,238,0.12);border:1px solid rgba(34,211,238,0.3);border-radius:4px;">
          ${tag}
        </div>

        <div style="color:${textCol};font-size:21px;font-weight:900;letter-spacing:1.2px;text-transform:uppercase;line-height:1.25;margin:2px 0 0 0;text-shadow:0 0 10px rgba(34,211,238,0.7);">
          ${title}
        </div>

        <div style="color:rgba(255,255,255,0.78);font-size:12px;font-weight:600;letter-spacing:1px;line-height:1.4;margin:0;">
          ${subtitle}
        </div>

      </div>
    </td>
  </tr>
</table>
<!--[/riazify:seasonal_banner:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DUAL-TONE SPLIT PROMO BOX
// Actual side-by-side flex/table container: left color-blocked discount, right details.
// ─────────────────────────────────────────────────────────────────────────────
function dualtoneSplit(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#1e1b4b')
  const splitBg = p.accentColor ?? '#ec4899'
  const textCol = p.textColor ?? '#ffffff'
  const title = titleText(p, 'Seasonal Holiday Showcase')
  const subtitle = subText(p, 'Direct savings on top-rated inventory · Authentic guarantee')
  const discount = p.discountText ?? '50% OFF'
  const discountSub = p.discountSub ?? 'STOREWIDE'

  return `<!--[riazify:seasonal_banner:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border-radius:10px;overflow:hidden;padding:0;box-sizing:border-box;box-shadow:0 4px 16px rgba(0,0,0,0.15);">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Left Color-Blocked Discount Badge -->
          <td width="220" style="width:220px;background-color:${splitBg};padding:22px 20px;text-align:center;vertical-align:middle;box-sizing:border-box;">
            <div style="color:#ffffff;font-size:28px;font-weight:900;letter-spacing:0.5px;line-height:1;margin-bottom:4px;text-shadow:0 1px 3px rgba(0,0,0,0.25);">
              ${discount}
            </div>
            <div style="color:rgba(255,255,255,0.95);font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;line-height:1.2;">
              ${discountSub}
            </div>
          </td>

          <!-- Right Promotional Content -->
          <td style="${pad(p, 18, 24, 18, 24)}text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div style="color:#f472b6;font-size:10px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;margin-bottom:4px;line-height:1;">
              &#10022; LIMITED EDITION EVENT
            </div>
            <div style="color:${textCol};font-size:19px;font-weight:800;letter-spacing:0.3px;line-height:1.3;margin-bottom:5px;">
              ${title}
            </div>
            <div style="color:rgba(255,255,255,0.82);font-size:12.5px;font-weight:500;line-height:1.45;">
              ${subtitle}
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:seasonal_banner:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. COUNTDOWN URGENCY BOX (Static Edition)
// Deep charcoal/black (#111827) with static countdown time-block boxes.
// Mobile Responsive: Stacks vertically (copy top, countdown bottom) on mobile.
// ─────────────────────────────────────────────────────────────────────────────
function countdownUrgency(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#111827')
  const textCol = p.textColor ?? '#ffffff'
  const accent = p.accentColor ?? '#ef4444'
  const title = titleText(p, 'Holiday Flash Sale Ending Soon!')
  const subtitle = subText(p, 'Orders placed today dispatch within 24 hours')
  const hours = p.hours ?? '12'
  const minutes = p.minutes ?? '45'
  const seconds = p.seconds ?? '30'

  return `<!--[riazify:seasonal_banner:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:1.5px solid ${accent};${pad(p, 16, 20, 16, 20)}border-radius:10px;box-sizing:border-box;">
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;box-sizing:border-box;">

        <!-- Copy Section (Full width on mobile, left-aligned) -->
        <div style="flex:1 1 240px;min-width:220px;text-align:left;box-sizing:border-box;">
          <div style="display:inline-flex;align-items:center;gap:6px;background-color:rgba(239,68,68,0.18);border:1px solid rgba(239,68,68,0.4);color:#fca5a5;font-size:9.5px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:2px 8px;border-radius:4px;margin-bottom:4px;line-height:1.2;">
            <span>&#9888;</span> TIME CRITICAL PROMOTION
          </div>
          <div style="color:${textCol};font-size:18px;font-weight:800;letter-spacing:0.3px;line-height:1.3;margin-bottom:3px;">
            ${title}
          </div>
          <div style="color:rgba(255,255,255,0.75);font-size:12px;font-weight:500;line-height:1.4;">
            ${subtitle}
          </div>
        </div>

        <!-- Static Countdown Block Badges (Centered & neatly proportioned on mobile) -->
        <div style="flex:0 0 auto;margin:0 auto;text-align:center;box-sizing:border-box;">
          <div style="display:inline-flex;align-items:center;justify-content:center;gap:5px;">

            <!-- Hours -->
            <div style="display:flex;flex-direction:column;align-items:center;background-color:#1f2937;border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:5px 8px;min-width:44px;box-sizing:border-box;">
              <span style="color:${accent};font-size:16px;font-weight:900;line-height:1;">${hours}</span>
              <span style="color:#9ca3af;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-top:2px;">HRS</span>
            </div>

            <span style="color:#ef4444;font-size:14px;font-weight:900;line-height:1;">:</span>

            <!-- Mins -->
            <div style="display:flex;flex-direction:column;align-items:center;background-color:#1f2937;border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:5px 8px;min-width:44px;box-sizing:border-box;">
              <span style="color:#ffffff;font-size:16px;font-weight:900;line-height:1;">${minutes}</span>
              <span style="color:#9ca3af;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-top:2px;">MIN</span>
            </div>

            <span style="color:#ef4444;font-size:14px;font-weight:900;line-height:1;">:</span>

            <!-- Secs -->
            <div style="display:flex;flex-direction:column;align-items:center;background-color:#1f2937;border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:5px 8px;min-width:44px;box-sizing:border-box;">
              <span style="color:#ffffff;font-size:16px;font-weight:900;line-height:1;">${seconds}</span>
              <span style="color:#9ca3af;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin-top:2px;">SEC</span>
            </div>

          </div>
        </div>

      </div>
    </td>
  </tr>
</table>
<!--[/riazify:seasonal_banner:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. MINIMALIST HOLIDAY ELEGANCE
// Soft neutral background (#fafaf9), thin gold framing, dark refined typography.
// ─────────────────────────────────────────────────────────────────────────────
function minimalistElegance(p: any, id: string): string {
  const f = p.fontFamily ? `${p.fontFamily}, Georgia, serif` : 'Georgia, serif'
  const bgCol = resolveBg(p, '#fafaf9')
  const gold = p.accentColor ?? '#b45309'
  const textCol = resolveText(p, '#1c1917', true)
  const title = titleText(p, 'The Seasonal Collection')
  const subtitle = subText(p, 'Enjoy curated complimentary gift packaging on selected orders.')
  const tag = p.badgeText ?? 'EST. HOLIDAY EDITION'

  return `<!--[riazify:seasonal_banner:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid #e7e5e4;${pad(p, 22, 28, 22, 28)}border-radius:8px;text-align:center;box-sizing:border-box;">
      <div style="border:1px solid rgba(180,83,9,0.25);padding:18px 24px;border-radius:4px;box-sizing:border-box;">

        <div style="color:${gold};font-size:9.5px;font-weight:700;letter-spacing:3px;text-transform:uppercase;line-height:1;margin-bottom:6px;">
          &#10022; ${tag} &#10022;
        </div>

        <div style="color:${textCol};font-size:22px;font-weight:400;letter-spacing:1.5px;line-height:1.3;margin:0 0 6px 0;">
          ${title}
        </div>

        <div style="color:#78716c;font-family:Arial,sans-serif;font-size:12px;font-weight:500;letter-spacing:0.5px;line-height:1.45;margin:0;">
          ${subtitle}
        </div>

      </div>
    </td>
  </tr>
</table>
<!--[/riazify:seasonal_banner:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. GLASSMORPHISM FROST BANNER
// Frosted glass card with backdrop-filter: blur(12px), translucent border & snowflake.
// ─────────────────────────────────────────────────────────────────────────────
function glassmorphismFrost(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#0f172a')
  const textCol = p.textColor ?? '#ffffff'
  const title = titleText(p, 'Winter Frost Collection — Up to 40% Off')
  const subtitle = subText(p, 'Warm winter essentials backed by our 30-day money back guarantee')
  const tag = p.badgeText ?? 'FROST SPECIAL'

  return `<!--[riazify:seasonal_banner:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 16, 20, 16, 20)}border-radius:12px;box-sizing:border-box;">
      <div style="background-color:rgba(255,255,255,0.08);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.2);border-radius:10px;padding:20px 24px;text-align:center;box-sizing:border-box;box-shadow:0 8px 32px rgba(0,0,0,0.25);">

        <div style="display:inline-flex;align-items:center;gap:6px;background-color:rgba(255,255,255,0.12);color:#93c5fd;font-size:10px;font-weight:800;letter-spacing:1.5px;padding:3px 12px;border-radius:100px;margin-bottom:8px;line-height:1.2;">
          <span style="font-size:12px;">&#10052;</span> ${tag}
        </div>

        <div style="color:${textCol};font-size:20px;font-weight:800;letter-spacing:0.35px;line-height:1.3;margin-bottom:4px;">
          ${title}
        </div>

        <div style="color:rgba(255,255,255,0.85);font-size:12.5px;font-weight:500;letter-spacing:0.2px;line-height:1.4;margin:0;">
          ${subtitle}
        </div>

      </div>
    </td>
  </tr>
</table>
<!--[/riazify:seasonal_banner:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. GRADIENT BURST FLASH BANNER
// Vibrant energetic linear gradient fill (indigo to pink to orange) with white typography.
// ─────────────────────────────────────────────────────────────────────────────
function gradientBurst(p: any, id: string): string {
  const f = font(p)
  const textCol = p.textColor ?? '#ffffff'
  const title = titleText(p, 'MEGA SEASONAL CLEARANCE')
  const subtitle = subText(p, 'Massive discounts across all department inventory')
  const badge = p.badgeText ?? 'SPECIAL PROMO EVENT'
  const gradient = p.gradient ?? 'linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #f97316 100%)'

  return `<!--[riazify:seasonal_banner:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background:${gradient};${pad(p, 20, 24, 20, 24)}border-radius:12px;text-align:center;box-shadow:0 4px 14px rgba(236,72,153,0.3);box-sizing:border-box;">
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;box-sizing:border-box;">

        <div style="display:inline-block;background-color:rgba(0,0,0,0.25);color:#ffffff;border:1px solid rgba(255,255,255,0.3);font-size:9.5px;font-weight:800;letter-spacing:2px;text-transform:uppercase;padding:3px 12px;border-radius:100px;line-height:1.2;">
          ${badge}
        </div>

        <div style="color:${textCol};font-size:22px;font-weight:900;letter-spacing:0.5px;text-transform:uppercase;line-height:1.25;margin:3px 0 0 0;text-shadow:0 1px 3px rgba(0,0,0,0.25);">
          ${title}
        </div>

        <div style="color:rgba(255,255,255,0.92);font-size:13px;font-weight:600;letter-spacing:0.3px;line-height:1.4;margin:0;">
          ${subtitle}
        </div>

      </div>
    </td>
  </tr>
</table>
<!--[/riazify:seasonal_banner:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. WHOLESALE CLEARANCE STROBE BAR
// Solid amber (#f59e0b) with dark slate text (#0f172a) and industrial styling.
// ─────────────────────────────────────────────────────────────────────────────
function wholesaleStrobe(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#f59e0b')
  const textCol = resolveText(p, '#0f172a', true)
  const title = titleText(p, 'BULK CLEARANCE EVENT — WHOLESALE RATES')
  const subtitle = subText(p, 'Direct liquidation pricing · Multi-item freight discounts available')
  const tag = p.badgeText ?? 'B2B COMMERCIAL PRICING'

  return `<!--[riazify:seasonal_banner:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:2px solid #b45309;${pad(p, 16, 24, 16, 24)}border-radius:6px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <td width="48" style="width:48px;vertical-align:middle;text-align:center;font-size:26px;color:#78350f;box-sizing:border-box;">
            &#9888;
          </td>
          <td style="vertical-align:middle;text-align:left;padding-left:10px;box-sizing:border-box;">
            <div style="color:#78350f;font-size:10px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;line-height:1;margin-bottom:3px;">
              ${tag}
            </div>
            <div style="color:${textCol};font-size:18px;font-weight:900;letter-spacing:0.5px;text-transform:uppercase;line-height:1.25;margin-bottom:3px;">
              ${title}
            </div>
            <div style="color:#451a03;font-size:12px;font-weight:700;line-height:1.35;">
              ${subtitle}
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:seasonal_banner:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. GIFT SEASON HOLIDAY CARD
// Rounded-xl card (16px) with deep holiday pine/emerald (#065f46) & bow badge.
// ─────────────────────────────────────────────────────────────────────────────
function giftCard(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#065f46')
  const textCol = p.textColor ?? '#ffffff'
  const title = titleText(p, 'The Gift Giving Season')
  const subtitle = subText(p, 'Find the perfect present with fast expedited domestic shipping')
  const tag = p.badgeText ?? 'GIFT INSPIRATION'

  return `<!--[riazify:seasonal_banner:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:1.5px solid rgba(255,255,255,0.2);${pad(p, 22, 24, 22, 24)}border-radius:16px;box-shadow:0 8px 24px rgba(6,95,70,0.28);text-align:center;box-sizing:border-box;">
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;max-width:560px;margin:0 auto;box-sizing:border-box;">

        <div style="display:inline-flex;align-items:center;gap:6px;background-color:rgba(255,255,255,0.16);color:#a7f3d0;font-size:10px;font-weight:800;letter-spacing:1.6px;padding:4px 14px;border-radius:100px;line-height:1.2;">
          <span>&#127873;</span> ${tag}
        </div>

        <div style="color:${textCol};font-size:22px;font-weight:800;letter-spacing:0.3px;line-height:1.3;margin-top:2px;">
          ${title}
        </div>

        <div style="color:rgba(255,255,255,0.9);font-size:12.5px;font-weight:500;line-height:1.4;">
          ${subtitle}
        </div>

      </div>
    </td>
  </tr>
</table>
<!--[/riazify:seasonal_banner:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. ELITE LUXURY HOLIDAY HEADER
// Deep charcoal (#0f172a) with metallic champagne gold (#d4af37) & 3px tracking.
// ─────────────────────────────────────────────────────────────────────────────
function eliteLuxury(p: any, id: string): string {
  const f = p.fontFamily ? `${p.fontFamily}, Georgia, serif` : 'Georgia, serif'
  const bgCol = resolveBg(p, '#0f172a')
  const gold = p.accentColor ?? '#d4af37'
  const textCol = p.textColor ?? '#f8fafc'
  const title = titleText(p, 'Holiday Private Reserve')
  const subtitle = subText(p, 'Strictly curated authentic items · Discreet express packaging')
  const tag = p.badgeText ?? 'EXCLUSIVE SEASONAL SELECTION'

  return `<!--[riazify:seasonal_banner:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border-top:2px solid ${gold};border-bottom:2px solid ${gold};${pad(p, 22, 28, 22, 28)}text-align:center;box-sizing:border-box;">
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;box-sizing:border-box;">

        <div style="color:${gold};font-size:9.5px;font-weight:700;letter-spacing:3px;text-transform:uppercase;line-height:1;">
          &#10022; ${tag} &#10022;
        </div>

        <div style="color:${textCol};font-size:22px;font-weight:400;letter-spacing:3px;text-transform:uppercase;line-height:1.25;margin:2px 0 0 0;">
          ${title}
        </div>

        <div style="color:#94a3b8;font-family:Arial,sans-serif;font-size:12px;font-weight:500;letter-spacing:0.8px;line-height:1.4;">
          ${subtitle}
        </div>

      </div>
    </td>
  </tr>
</table>
<!--[/riazify:seasonal_banner:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export const seasonalBannerVariants: BlockVariant[] = [
  {
    id: 'seasonal-festive-ribbon',
    label: 'Festive Ribbon',
    description: 'Classic crimson banner with festive emojis, uppercase tracking, and holiday badge',
    toHtml(props, id) { return festiveRibbon(props, id) },
  },
  {
    id: 'seasonal-neon-cyber',
    label: 'Neon Cyber Flash',
    description: 'Deep black background with glowing cyan border and high-contrast flash messaging',
    toHtml(props, id) { return neonCyber(props, id) },
  },
  {
    id: 'seasonal-dualtone-split',
    label: 'Dual-Tone Split',
    description: 'Split color-block container highlighting bold discount percentage and promotion details',
    toHtml(props, id) { return dualtoneSplit(props, id) },
  },
  {
    id: 'seasonal-countdown-urgency',
    label: 'Countdown Urgency',
    description: 'Compliance-safe static hours/mins/secs countdown boxes with time-critical clearance copy',
    toHtml(props, id) { return countdownUrgency(props, id) },
  },
  {
    id: 'seasonal-minimalist-elegance',
    label: 'Minimalist Elegance',
    description: 'Sophisticated neutral banner with thin gold framing lines and tracked serif typography',
    toHtml(props, id) { return minimalistElegance(props, id) },
  },
  {
    id: 'seasonal-glassmorphism-frost',
    label: 'Glassmorphism Frost',
    description: 'Frosted glass container with translucent borders and winter snowflake motif',
    toHtml(props, id) { return glassmorphismFrost(props, id) },
  },
  {
    id: 'seasonal-gradient-burst',
    label: 'Gradient Burst',
    description: 'Vibrant multi-color linear gradient fill with crisp typography and badge highlights',
    toHtml(props, id) { return gradientBurst(props, id) },
  },
  {
    id: 'seasonal-wholesale-strobe',
    label: 'Wholesale Strobe Bar',
    description: 'High-visibility industrial amber clearance bar for volume liquidators and B2B sellers',
    toHtml(props, id) { return wholesaleStrobe(props, id) },
  },
  {
    id: 'seasonal-gift-card',
    label: 'Gift Season Card',
    description: 'Rounded holiday card styled like a gift box with festive emerald accents',
    toHtml(props, id) { return giftCard(props, id) },
  },
  {
    id: 'seasonal-elite-luxury',
    label: 'Elite Luxury Header',
    description: 'Midnight background with champagne gold lettering and wide luxury letter-spacing',
    toHtml(props, id) { return eliteLuxury(props, id) },
  },
]

/**
 * Robust Variant Resolver:
 * Supports variant IDs with or without the 'seasonal-' prefix and matches
 * shorthand IDs seamlessly (e.g. 'neon-cyber' -> 'seasonal-neon-cyber').
 */
export function getSeasonalBannerVariant(id: string): BlockVariant {
  if (!id) return seasonalBannerVariants[0]

  const clean = id.toLowerCase().trim().replace(/^seasonal[-_]/, '').replace(/_/g, '-')

  const match = seasonalBannerVariants.find(v => {
    const vClean = v.id.toLowerCase().replace(/^seasonal[-_]/, '').replace(/_/g, '-')
    return (
      v.id === id ||
      vClean === clean ||
      v.id.endsWith(clean) ||
      clean.includes(vClean) ||
      vClean.includes(clean)
    )
  })

  return match ?? seasonalBannerVariants[0]
}
