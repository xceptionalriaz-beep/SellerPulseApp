// components/ui/VisualEditor/variants/limited_time_offer.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Limited Time Offer — 10 Radically Distinct, High-Converting Retail Layouts
// Built specifically for high-converting eBay & e-commerce listings.
// Zero generic AI-slop, zero cheesy glassmorphism, zero fake neon glows.
// 100% authentic, tangible, battle-tested retail architectures that buyers trust.
//
// 1. lto-flash-sale-ticker       — High-velocity crimson ticker with 4 digital countdown boxes
// 2. lto-clearance-stamped-tag   — Physical inventory clearance stub with notched circular stamp
// 3. lto-midnight-vip-exclusive  — Boutique black & gold hairline VIP allocation card
// 4. lto-industrial-hazard-alert — Heavy-duty black & safety-yellow hazard overstock bar
// 5. lto-circular-coupon-clip    — Vintage newspaper circular clip coupon with scissor cut-line
// 6. lto-live-scarcity-meter     — Real-time inventory depletion & velocity scarcity meter
// 7. lto-multibuy-volume-matrix  — 3-column eBay volume pricing (Buy 1, Buy 2, Buy 3+ Tier Grid)
// 8. lto-scandinavian-editorial  — High-end minimalist boutique layout with hairline rules
// 9. lto-cyber-terminal-deal     — Dark console tech terminal with bracket tags & spec checkmarks
// 10. lto-holiday-gift-ribbon    — Stitched emerald/wine holiday gift banner with extended returns
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
  id: string
  label: string
  description: string
  toHtml: (props: any, id: string) => string
}

// ─── Shared Helpers & Dynamic Resolvers ─────────────────────────────────────
function pad(p: any, defaultT = 16, defaultR = 24, defaultB = 16, defaultL = 24): string {
  const top = p.paddingTop ?? defaultT
  const right = p.paddingRight ?? defaultR
  const bottom = p.paddingBottom ?? defaultB
  const left = p.paddingLeft ?? defaultL
  return `padding:${top}px ${right}px ${bottom}px ${left}px;`
}

function font(p: any, defaultFamily = 'Arial, Helvetica, sans-serif'): string {
  return p.fontFamily ? `${p.fontFamily}, Arial, sans-serif` : defaultFamily
}

function dealTitle(p: any, fallback = 'Limited Time Promotional Offer'): string {
  return p.dealTitle ?? p.bannerTitle ?? p.heading ?? p.title ?? fallback
}

function dealSubtext(p: any, fallback = 'Special promotional pricing is active for a limited time only. While supplies last.'): string {
  return p.dealSubtext ?? p.bannerSubtitle ?? p.subText ?? p.subtitle ?? fallback
}

function badgeText(p: any, fallback = '⚡ LIMITED TIME DEAL'): string {
  return p.badgeText ?? p.badge ?? p.tag ?? fallback
}

function discountCallout(p: any, fallback = 'SAVE UP TO 40% OFF'): string {
  return p.discountText ?? p.savingsText ?? p.discount ?? p.savings ?? fallback
}

function expiryNotice(p: any, fallback = 'Ends Sunday at Midnight EST'): string {
  return p.expiryText ?? p.countdown ?? p.timer ?? p.expiryNotice ?? fallback
}

/**
 * List of known template defaults across blocks and previous variants.
 * If current bgColor matches any of these default palette tokens,
 * the layout style applies its own signature background so each style
 * displays with rich, professional colors rather than inheriting clashing reds or whites.
 */
const KNOWN_DEFAULT_BGS = [
  '#dc2626', // Flash Sale Red
  '#ffffff', // White
  '#f8fafc', // Slate 50
  '#f8f7ff', // Purple 50
  '#1e1535', // Dark Purple
  '#0f172a', // Slate 900
  '#18181b', // Zinc 900
  '#09090b', // Zinc 950
  '#090d16', // Dark Terminal Navy
  '#064e3b', // Holiday Emerald
  '#fffdfa', // Cream Ivory
]

/**
 * Dynamic background resolver:
 * Automatically adapts to each style's signature background while preserving
 * user-chosen custom color overrides.
 */
function resolveBg(p: any, signatureBg: string): string {
  if (!p.bgColor) return signatureBg
  const val = p.bgColor.toLowerCase().trim()
  if (KNOWN_DEFAULT_BGS.includes(val)) {
    return signatureBg
  }
  return p.bgColor
}

/**
 * Dynamic text resolver:
 * Ensures crisp contrast according to the variant's palette.
 */
function resolveText(p: any, signatureText: string): string {
  if (!p.textColor) return signatureText
  const val = p.textColor.toLowerCase().trim()
  if (
    val === '#ffffff' ||
    val === '#0f172a' ||
    val === '#1e1535' ||
    val === '#18181b' ||
    val === '#1c1917' ||
    val === '#f4f4f5' ||
    val === '#fafafa' ||
    val === '#f1f5f9'
  ) {
    return signatureText
  }
  return p.textColor
}

/**
 * Dynamic accent color resolver.
 */
function resolveAccent(p: any, signatureAccent: string): string {
  if (!p.accentColor) return signatureAccent
  const val = p.accentColor.toLowerCase().trim()
  const KNOWN_ACCENTS = [
    '#fef08a', '#7530fb', '#b8fa33', '#f59e0b', '#b91c1c',
    '#d4af37', '#0284c7', '#f97316', '#2563eb', '#71717a',
    '#06b6d4', '#fbbf24', '#ffffff', '#000000'
  ]
  if (KNOWN_ACCENTS.includes(val)) {
    return signatureAccent
  }
  return p.accentColor
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. FLASH SALE RED TICKER BAR
// High-velocity crimson ticker with 4 digital countdown boxes (Days / Hrs / Mins / Secs)
// ─────────────────────────────────────────────────────────────────────────────
function flashSaleTicker(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#dc2626')
  const textCol = resolveText(p, '#ffffff')
  const accent = resolveAccent(p, '#fef08a') // pale electric yellow
  const title = dealTitle(p, '⚡ FLASH SALE — SPECIAL PROMOTIONAL EVENT')
  const subtitle = dealSubtext(p, 'Instant markdown applied at checkout. Quantities are strictly limited.')
  const tag = badgeText(p, 'ENDS SOON')
  const discount = discountCallout(p, 'UP TO 50% OFF')

  return `<!--[riazify:limited_time_offer:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border-radius:8px;${pad(p, 16, 22, 16, 22)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Left: Urgency Title & Discount Callout -->
          <td style="text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div style="margin-bottom:6px;">
              <span style="display:inline-block;background-color:#991b1b;color:${accent};font-size:10px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:3.5px 8px;border-radius:4px;vertical-align:middle;border:1px solid #b91c1c;">
                ${tag}
              </span>
              <span style="display:inline-block;color:${accent};font-size:12px;font-weight:900;letter-spacing:0.5px;margin-left:8px;vertical-align:middle;">
                ★ ${discount}
              </span>
            </div>
            <div style="color:${textCol};font-size:18px;font-weight:800;letter-spacing:0.2px;line-height:1.25;margin:0 0 4px 0;">
              ${title}
            </div>
            <div style="color:#fee2e2;font-size:12px;font-weight:400;line-height:1.4;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Right: Digital Countdown Grid -->
          <td width="230" style="width:230px;text-align:right;vertical-align:middle;padding-left:14px;box-sizing:border-box;">
            <table cellpadding="0" cellspacing="2" border="0" align="right" style="border-collapse:separate;margin:0;">
              <tr>
                <td align="center" style="background-color:#18181b;border-radius:4px;padding:6px 7px;min-width:38px;">
                  <div style="color:#ffffff;font-size:16px;font-weight:900;line-height:1;font-family:monospace;">01</div>
                  <div style="color:#a1a1aa;font-size:8px;font-weight:700;letter-spacing:0.5px;margin-top:2px;">${p.label1 ?? 'DAYS'}</div>
                </td>
                <td style="color:${accent};font-weight:900;font-size:14px;padding:0 2px;">:</td>
                <td align="center" style="background-color:#18181b;border-radius:4px;padding:6px 7px;min-width:38px;">
                  <div style="color:#ffffff;font-size:16px;font-weight:900;line-height:1;font-family:monospace;">14</div>
                  <div style="color:#a1a1aa;font-size:8px;font-weight:700;letter-spacing:0.5px;margin-top:2px;">${p.label2 ?? 'HOURS'}</div>
                </td>
                <td style="color:${accent};font-weight:900;font-size:14px;padding:0 2px;">:</td>
                <td align="center" style="background-color:#18181b;border-radius:4px;padding:6px 7px;min-width:38px;">
                  <div style="color:#ffffff;font-size:16px;font-weight:900;line-height:1;font-family:monospace;">28</div>
                  <div style="color:#a1a1aa;font-size:8px;font-weight:700;letter-spacing:0.5px;margin-top:2px;">${p.label3 ?? 'MINS'}</div>
                </td>
                <td style="color:${accent};font-weight:900;font-size:14px;padding:0 2px;">:</td>
                <td align="center" style="background-color:#18181b;border-radius:4px;padding:6px 7px;min-width:38px;">
                  <div style="color:${accent};font-size:16px;font-weight:900;line-height:1;font-family:monospace;">45</div>
                  <div style="color:#a1a1aa;font-size:8px;font-weight:700;letter-spacing:0.5px;margin-top:2px;">${p.label4 ?? 'SECS'}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:limited_time_offer:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. RETAIL CLEARANCE STAMPED TAG
// Parchment/ivory liquidation stub with circular red inspection stamp
// ─────────────────────────────────────────────────────────────────────────────
function clearanceStampedTag(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#fffdfa')
  const textCol = resolveText(p, '#1c1917')
  const accent = resolveAccent(p, '#b91c1c')
  const title = dealTitle(p, 'INVENTORY CLEARANCE SALE — FINAL MARKDOWN')
  const subtitle = dealSubtext(p, 'Genuine factory overstock. Priced to liquidate quickly to make warehouse room.')
  const discount = discountCallout(p, 'MASSIVE SAVINGS')
  const expiry = expiryNotice(p, 'While Surplus Allocation Lasts')

  return `<!--[riazify:limited_time_offer:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:2px solid #e7e5e4;border-radius:8px;${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Circular Red Inspection Stamp -->
          <td width="72" style="width:72px;vertical-align:middle;padding-right:16px;box-sizing:border-box;">
            <div style="width:68px;height:68px;border:2.5px dashed ${accent};border-radius:50%;text-align:center;box-sizing:border-box;padding:8px 2px;">
              <div style="color:${accent};font-size:8px;font-weight:900;letter-spacing:0.5px;line-height:1.1;text-transform:uppercase;">${p.stampLine1 ?? 'OFFICIAL'}</div>
              <div style="color:${accent};font-size:11px;font-weight:900;line-height:1.2;margin:2px 0;">${p.stampLine2 ?? 'CLEAR'}</div>
              <div style="color:${accent};font-size:7.5px;font-weight:800;letter-spacing:0.5px;line-height:1;">${p.stampLine3 ?? 'MARKED'}</div>
            </div>
          </td>

          <!-- Main Liquidation Details -->
          <td style="text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div style="margin-bottom:4px;">
              <span style="display:inline-block;background-color:#fee2e2;color:${accent};font-size:10px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:2px 7px;border-radius:3px;">
                ${p.clearanceLot ?? 'CLEARANCE LOT'}
              </span>
              <span style="color:#78716c;font-size:11px;font-weight:600;margin-left:8px;">
                &bull; ${expiry}
              </span>
            </div>
            <div style="color:${textCol};font-size:16px;font-weight:900;letter-spacing:0.1px;line-height:1.25;margin:0 0 3px 0;">
              ${title}
            </div>
            <div style="color:#57534e;font-size:12px;font-weight:400;line-height:1.4;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Right: Price Tag Stub -->
          <td width="160" style="width:160px;text-align:right;vertical-align:middle;padding-left:14px;border-left:1.5px dashed #d6d3d1;box-sizing:border-box;">
            <div style=\"color:#78716c;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;\">
              ${p.specialStatus ?? 'SPECIAL STATUS'}
            </div>
            <div style="color:${accent};font-size:16px;font-weight:900;line-height:1.2;">
              ${discount}
            </div>
            <div style="color:#16a34a;font-size:10.5px;font-weight:800;margin-top:3px;">
              &#10003; 100% Guaranteed
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:limited_time_offer:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. MIDNIGHT BLACK & GOLD VIP EXCLUSIVE
// Luxury matte black & metallic champagne gold border with diamond glyph
// ─────────────────────────────────────────────────────────────────────────────
function midnightVipExclusive(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#09090b')
  const textCol = resolveText(p, '#fafafa')
  const gold = resolveAccent(p, '#d4af37')
  const title = dealTitle(p, 'VIP ALLOCATION — EXCLUSIVE PROMOTIONAL INVITATION')
  const subtitle = dealSubtext(p, 'Includes complimentary white-glove courier packaging and priority handling on this listing.')
  const tag = badgeText(p, '◆ VIP EXCLUSIVE ◆')
  const discount = discountCallout(p, 'PREMIUM CONCIERGE BENEFIT')

  return `<!--[riazify:limited_time_offer:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:1.5px solid ${gold};border-radius:8px;${pad(p, 18, 24, 18, 24)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Left: Gold VIP Branding & Text -->
          <td style="text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div style="color:${gold};font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">
              ${tag}
            </div>
            <div style="color:${textCol};font-size:17px;font-weight:700;letter-spacing:0.5px;line-height:1.3;margin:0 0 4px 0;">
              ${title}
            </div>
            <div style="color:#a1a1aa;font-size:12px;font-weight:400;line-height:1.45;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Right: Champagne Gold Badge -->
          <td width="200" style="width:200px;text-align:right;vertical-align:middle;padding-left:16px;box-sizing:border-box;">
            <div style="display:inline-block;background-color:#18181b;border:1px solid ${gold};border-radius:6px;padding:9px 14px;text-align:center;">
              <div style=\"color:${gold};font-size:9.5px;font-weight:900;letter-spacing:1px;text-transform:uppercase;margin-bottom:3px;\">
                ${p.availabilityNote ?? 'LIMITED AVAILABILITY'}
              </div>
              <div style="color:#ffffff;font-size:12px;font-weight:800;letter-spacing:0.3px;">
                ${discount}
              </div>
              <div style=\"color:${gold};font-size:9.5px;font-weight:600;margin-top:3px;\">
                ${p.sellerNote ?? 'Direct From Verified Seller'}
              </div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:limited_time_offer:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. INDUSTRIAL HAZARD OVERSTOCK ALERT
// Heavy duty black & warning safety-yellow stripes with contractor caution
// ─────────────────────────────────────────────────────────────────────────────
function industrialHazardAlert(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#18181b')
  const textCol = resolveText(p, '#f4f4f5')
  const yellow = resolveAccent(p, '#f59e0b')
  const title = dealTitle(p, '⚠️ SURPLUS LOT NOTICE — CONTRACTOR BULK RATE ACTIVE')
  const subtitle = dealSubtext(p, 'Direct distributor allocation. Promotional surplus rate valid only while current bin inventory lasts.')
  const tag = badgeText(p, 'CAUTION: OVERSTOCK')
  const discount = discountCallout(p, 'HEAVY DISCOUNT LOT')

  return `<!--[riazify:limited_time_offer:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:2px solid ${yellow};border-radius:8px;overflow:hidden;background-color:${bgCol};">
  <!-- Top Caution Hazard Bar -->
  <tr>
    <td style="background-color:${yellow};color:#000000;font-size:9.5px;font-weight:900;letter-spacing:2px;text-align:center;padding:5px 0;text-transform:uppercase;">
      /// PROMOTIONAL OVERSTOCK LOT /// FACTORY DIRECT SURPLUS /// LIMITED INVENTORY ///
    </td>
  </tr>
  <tr>
    <td style="background-color:${bgCol};${pad(p, 16, 22, 16, 22)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Main Content -->
          <td style="text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div style="margin-bottom:6px;">
              <span style="display:inline-block;background-color:${yellow};color:#000000;font-size:10px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:2px 7px;border-radius:2px;">
                ${tag}
              </span>
              <span style=\"color:#a1a1aa;font-size:11px;font-weight:700;margin-left:8px;\">
                ${p.gradeNote ?? 'Commercial & Industrial Grade'}
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
          <td width="170" style="width:170px;text-align:right;vertical-align:middle;padding-left:14px;box-sizing:border-box;">
            <div style="background-color:#27272a;border:1.5px solid #3f3f46;border-radius:6px;padding:8px 12px;text-align:center;">
              <div style="color:${yellow};font-size:13px;font-weight:900;line-height:1.2;">
                ${discount}
              </div>
              <div style=\"color:#e4e4e7;font-size:10px;font-weight:700;margin-top:2px;\">
                ${p.dispatchNote ?? 'IMMEDIATE DISPATCH'}
              </div>
              <div style="color:#10b981;font-size:9.5px;font-weight:800;margin-top:2px;">
                &#10003; 100% Genuine OEM
              </div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:limited_time_offer:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. SUNDAY CIRCULAR CLIP-OUT COUPON
// Retro dashed border with cut-out scissor marker and authentic voucher details
// ─────────────────────────────────────────────────────────────────────────────
function circularCouponClip(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#0f172a')
  const accent = resolveAccent(p, '#0284c7')
  const title = dealTitle(p, 'OFFICIAL STORE COUPON · SAVE INSTANTLY AT CHECKOUT')
  const subtitle = dealSubtext(p, 'Clip this deal: promotional discount is automatically calculated when you purchase from this eBay listing.')
  const tag = badgeText(p, '✂ CLIP & SAVE')
  const discount = discountCallout(p, 'SPECIAL SAVINGS APPLIED')

  return `<!--[riazify:limited_time_offer:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:2px dashed #94a3b8;border-radius:8px;${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Scissor Icon & Cut Line -->
          <td width="36" style="width:36px;vertical-align:middle;text-align:center;box-sizing:border-box;">
            <div style="font-size:24px;line-height:1;color:${accent};">✂</div>
          </td>

          <!-- Main Coupon Content -->
          <td style="text-align:left;vertical-align:middle;padding:0 14px;box-sizing:border-box;">
            <div style="margin-bottom:3px;">
              <span style="display:inline-block;background-color:#e0f2fe;color:${accent};font-size:9.5px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:2px 7px;border-radius:3px;">
                ${tag}
              </span>
              <span style=\"color:#64748b;font-size:10.5px;font-weight:700;margin-left:8px;\">
                ${p.couponScope ?? 'Valid For This eBay Item Only'}
              </span>
            </div>
            <div style="color:${textCol};font-size:16px;font-weight:900;line-height:1.25;margin:0 0 3px 0;">
              ${title}
            </div>
            <div style="color:#475569;font-size:11.5px;font-weight:400;line-height:1.4;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Barcode / Value Box -->
          <td width="150" style="width:150px;text-align:center;vertical-align:middle;border-left:1px dashed #cbd5e1;padding-left:12px;box-sizing:border-box;">
            <div style="color:${accent};font-size:15px;font-weight:900;line-height:1.2;">
              ${discount}
            </div>
            <!-- Simulated Barcode Lines -->
            <div style="letter-spacing:2px;font-family:monospace;font-size:13px;color:#334155;margin:3px 0 2px 0;line-height:1;">
              ||||| | |||| || |||
            </div>
            <div style=\"color:#64748b;font-size:8.5px;font-weight:700;letter-spacing:1px;\">
              ${p.cartNote ?? 'AUTO-APPLIED IN CART'}
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:limited_time_offer:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. LIVE INVENTORY SCARCITY METER
// Dynamic velocity bar showing percentage claimed & remaining units warning
// ─────────────────────────────────────────────────────────────────────────────
function liveScarcityMeter(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#0f172a')
  const textCol = resolveText(p, '#ffffff')
  const accent = resolveAccent(p, '#f97316') // hot energetic orange
  const title = dealTitle(p, '🔥 HIGH DEMAND — LIMITED REMAINING UNITS AT THIS PRICE')
  const subtitle = dealSubtext(p, 'Inventory velocity is extremely high today. Units in cart are not reserved until payment is completed.')
  const tag = badgeText(p, '⚡ LIVE VELOCITY ALERT')
  const discount = discountCallout(p, '88% CLAIMED')

  return `<!--[riazify:limited_time_offer:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border-radius:8px;${pad(p, 16, 22, 16, 22)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Title & Subtitle -->
          <td style="text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div style="margin-bottom:6px;">
              <span style="display:inline-block;background-color:${accent};color:#0f172a;font-size:10px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:2px 8px;border-radius:4px;">
                ${tag}
              </span>
              <span style="color:#fb923c;font-size:11px;font-weight:800;margin-left:8px;">
                ● Live Inventory Tracker
              </span>
            </div>
            <div style="color:${textCol};font-size:17px;font-weight:900;letter-spacing:0.2px;line-height:1.25;margin:0 0 4px 0;">
              ${title}
            </div>
            <div style="color:#94a3b8;font-size:12px;font-weight:400;line-height:1.4;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Scarcity Bar & Counter -->
          <td width="200" style="width:200px;text-align:right;vertical-align:middle;padding-left:16px;box-sizing:border-box;">
            <div style="background-color:#1e293b;border:1px solid #334155;border-radius:6px;padding:8px 12px;text-align:left;">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                <span style=\"color:#f8fafc;font-size:10px;font-weight:800;\">${p.scarcityLabel ?? 'ALMOST SOLD OUT'}</span>
                <span style="color:${accent};font-size:10px;font-weight:900;float:right;">${discount}</span>
              </div>
              <!-- Progress Bar -->
              <div style="width:100%;height:8px;background-color:#334155;border-radius:4px;overflow:hidden;margin:4px 0;">
                <div style="width:88%;height:100%;background-color:${accent};border-radius:4px;"></div>
              </div>
              <div style="color:#38bdf8;font-size:9.5px;font-weight:700;margin-top:3px;text-align:center;">
                &#9888; Only a few units remaining in stock
              </div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:limited_time_offer:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. BUY MORE SAVE MORE VOLUME MATRIX
// 3-Column multi-buy volume pricing (Buy 1, Buy 2, Buy 3+)
// ─────────────────────────────────────────────────────────────────────────────
function multibuyVolumeMatrix(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#0f172a')
  const accent = resolveAccent(p, '#2563eb')
  const title = dealTitle(p, 'MULTI-BUY VOLUME SAVINGS — BUY MORE & SAVE BIG')
  const subtitle = dealSubtext(p, 'Automatic tier discounts applied in eBay cart when purchasing multiple quantities.')
  const tag = badgeText(p, 'TIERED VOLUME PRICING')

  return `<!--[riazify:limited_time_offer:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #e2e8f0;border-radius:8px;overflow:hidden;background-color:${bgCol};">
  <!-- Header Bar -->
  <tr>
    <td style="background-color:#f8fafc;border-bottom:1px solid #e2e8f0;${pad(p, 12, 18, 12, 18)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="text-align:left;">
            <span style="display:inline-block;background-color:#dbeafe;color:${accent};font-size:9.5px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:2px 7px;border-radius:3px;">
              ${tag}
            </span>
            <span style="color:${textCol};font-size:14px;font-weight:900;margin-left:8px;vertical-align:middle;">
              ${title}
            </span>
          </td>
          <td style="text-align:right;color:#64748b;font-size:11px;font-weight:600;">
            ${subtitle}
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- 3-Tier Grid -->
  <tr>
    <td style="padding:12px 14px;box-sizing:border-box;background-color:${bgCol};">
      <table width="100%" cellpadding="0" cellspacing="8" border="0" style="border-collapse:separate;">
        <tr>
          <!-- Tier 1 -->
          <td width="33%" align="center" style="background-color:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:10px 8px;">
            <div style=\"color:#64748b;font-size:10px;font-weight:800;text-transform:uppercase;\">${p.tier1Label ?? 'BUY 1 ITEM'}</div>
            <div style=\"color:#0f172a;font-size:14px;font-weight:900;margin:3px 0;\">${p.tier1Price ?? 'STANDARD PRICE'}</div>
            <div style=\"color:#64748b;font-size:10px;font-weight:600;\">${p.tier1Note ?? 'Standard Value'}</div>
          </td>

          <!-- Tier 2 (Highlighted) -->
          <td width="33%" align="center" style="background-color:#eff6ff;border:1.5px solid ${accent};border-radius:6px;padding:10px 8px;position:relative;">
            <div style="color:${accent};font-size:10px;font-weight:900;text-transform:uppercase;">${p.tier2Label ?? '★ BUY 2 ITEMS ★'}</div>
            <div style="color:${accent};font-size:16px;font-weight:900;margin:3px 0;">${p.tier2Price ?? 'EXTRA 10% OFF'}</div>
            <div style="color:#1d4ed8;font-size:10px;font-weight:700;">${p.tier2Note ?? 'Most Popular Choice'}</div>
          </td>

          <!-- Tier 3 -->
          <td width="33%" align="center" style="background-color:#f0fdf4;border:1.5px solid #16a34a;border-radius:6px;padding:10px 8px;">
            <div style="color:#15803d;font-size:10px;font-weight:900;text-transform:uppercase;">${p.tier3Label ?? 'BUY 3 OR MORE'}</div>
            <div style="color:#15803d;font-size:16px;font-weight:900;margin:3px 0;">${p.tier3Price ?? 'EXTRA 20% OFF'}</div>
            <div style="color:#16a34a;font-size:10px;font-weight:800;">${p.tier3Note ?? 'Maximum Bulk Savings'}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:limited_time_offer:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. BOUTIQUE SCANDINAVIAN MINIMALIST
// Delicate 1px hairline rules, wide typographic tracking, muted quiet tones
// ─────────────────────────────────────────────────────────────────────────────
function scandinavianEditorial(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveText(p, '#18181b')
  const accent = resolveAccent(p, '#71717a')
  const title = dealTitle(p, 'SEASONAL ARCHIVE PROMOTION')
  const subtitle = dealSubtext(p, 'Curated pieces offered at private promotional rates for a short duration. Calculated at final checkout.')
  const tag = badgeText(p, 'CURATED ALLOCATION')
  const discount = discountCallout(p, 'SPECIAL INVITATION SAVINGS')

  return `<!--[riazify:limited_time_offer:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:1px solid #e4e4e7;border-radius:6px;background-color:${bgCol};">
  <tr>
    <td style="background-color:${bgCol};border-radius:6px;${pad(p, 20, 24, 20, 24)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Editorial Typography Header -->
          <td style="text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div style="color:${accent};font-size:9.5px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:4px;">
              ${tag}
            </div>
            <div style="color:${textCol};font-size:17px;font-weight:600;letter-spacing:1px;line-height:1.3;margin:0 0 4px 0;">
              ${title}
            </div>
            <div style="color:#71717a;font-size:12px;font-weight:400;line-height:1.5;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Subtle Right Pill -->
          <td width="180" style="width:180px;text-align:right;vertical-align:middle;padding-left:16px;box-sizing:border-box;">
            <div style="display:inline-block;border-left:1px solid #d4d4d8;padding-left:14px;text-align:left;">
              <div style="color:#18181b;font-size:12.5px;font-weight:700;letter-spacing:0.5px;">
                ${discount}
              </div>
              <div style=\"color:#71717a;font-size:10px;font-weight:500;margin-top:2px;\">
                ${p.applyNote ?? 'Applied at eBay purchase'}
              </div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:limited_time_offer:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. DARK CYBER TECH TERMINAL
// Deep matte navy/black terminal with electric cyan/emerald accents and spec checkmarks
// ─────────────────────────────────────────────────────────────────────────────
function cyberTerminalDeal(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#090d16')
  const textCol = resolveText(p, '#f1f5f9')
  const cyan = resolveAccent(p, '#06b6d4')
  const emerald = '#10b981'
  const title = dealTitle(p, 'SYS.PROMO: HARDWARE FLASH EVENT ACTIVE')
  const subtitle = dealSubtext(p, 'Priority tech allocation. All orders include factory sealed serial verification & same-day tracking dispatch.')
  const tag = badgeText(p, '[SYS_ACTIVE // CYCLE_2026]')
  const discount = discountCallout(p, 'SPECIAL HARDWARE RATE')

  return `<!--[riazify:limited_time_offer:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:1.5px solid #1e293b;border-radius:8px;overflow:hidden;background-color:${bgCol};">
  <!-- Terminal Top Bar -->
  <tr>
    <td style="background-color:#0f172a;border-bottom:1px solid #1e293b;padding:5px 14px;">
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:#ef4444;margin-right:4px;"></span>
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:#f59e0b;margin-right:4px;"></span>
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:#10b981;margin-right:8px;"></span>
      <span style="color:#64748b;font-size:9.5px;font-family:monospace;letter-spacing:1px;">terminal@deals ~ session://lto_verified</span>
    </td>
  </tr>
  <tr>
    <td style="background-color:${bgCol};${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Content -->
          <td style="text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div style="color:${cyan};font-size:10px;font-weight:900;letter-spacing:1.5px;font-family:monospace;margin-bottom:4px;">
              ${tag}
            </div>
            <div style="color:${textCol};font-size:16.5px;font-weight:800;letter-spacing:0.2px;line-height:1.25;margin:0 0 4px 0;">
              ${title}
            </div>
            <div style="color:#94a3b8;font-size:12px;font-weight:400;line-height:1.4;margin:0 0 8px 0;">
              ${subtitle}
            </div>
            <!-- Spec Checklist -->
            <div style="color:${emerald};font-size:10.5px;font-weight:700;font-family:monospace;">
              [&#10003;] FACTORY SEALED &nbsp;&bull;&nbsp; [&#10003;] DISPATCH <24H &nbsp;&bull;&nbsp; [&#10003;] 100% AUTHENTIC
            </div>
          </td>

          <!-- Right Status Box -->
          <td width="170" style="width:170px;text-align:right;vertical-align:middle;padding-left:14px;box-sizing:border-box;">
            <div style="background-color:#0f172a;border:1px solid ${cyan};border-radius:6px;padding:8px 12px;text-align:center;">
              <div style="color:${cyan};font-size:13px;font-weight:900;line-height:1.2;font-family:monospace;">
                ${discount}
              </div>
              <div style=\"color:#38bdf8;font-size:9.5px;font-weight:700;margin-top:3px;\">
                ${p.activationNote ?? 'Instant Activation'}
              </div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:limited_time_offer:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. HOLIDAY GIFT & EXTENDED RETURNS RIBBON
// Deep emerald velvet / wine container with stitched borders and holiday guarantees
// ─────────────────────────────────────────────────────────────────────────────
function holidayGiftRibbon(p: any, id: string): string {
  const f = font(p)
  const bgCol = resolveBg(p, '#064e3b') // rich festive forest emerald
  const textCol = resolveText(p, '#ffffff')
  const gold = resolveAccent(p, '#fbbf24')
  const title = dealTitle(p, 'HOLIDAY GIFT EVENT — EXTENDED 60-DAY RETURNS INCLUDED')
  const subtitle = dealSubtext(p, 'Buy early with peace of mind. Every order placed during this event enjoys extended gift returns and complimentary insurance.')
  const tag = badgeText(p, '🎁 HOLIDAY PROMOTION')
  const discount = discountCallout(p, 'PEACE-OF-MIND GUARANTEE')

  return `<!--[riazify:limited_time_offer:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;border:2px solid ${gold};border-radius:8px;overflow:hidden;background-color:${bgCol};">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 16, 22, 16, 22)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Left Icon & Details -->
          <td width="42" style="width:42px;vertical-align:middle;text-align:center;box-sizing:border-box;">
            <div style="font-size:26px;line-height:1;">🎀</div>
          </td>

          <td style="text-align:left;vertical-align:middle;padding:0 12px;box-sizing:border-box;">
            <div style="margin-bottom:4px;">
              <span style="display:inline-block;background-color:#022c22;color:${gold};font-size:10px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:2px 8px;border-radius:4px;border:1px solid ${gold};">
                ${tag}
              </span>
              <span style=\"color:#a7f3d0;font-size:11px;font-weight:700;margin-left:8px;\">
                ${p.dispatchGuarantee ?? 'Guaranteed Pre-Holiday Dispatch'}
              </span>
            </div>
            <div style="color:${textCol};font-size:17px;font-weight:800;letter-spacing:0.2px;line-height:1.25;margin:0 0 3px 0;">
              ${title}
            </div>
            <div style="color:#d1fae5;font-size:12px;font-weight:400;line-height:1.4;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Right Guarantee Box -->
          <td width="170" style="width:170px;text-align:right;vertical-align:middle;padding-left:12px;box-sizing:border-box;">
            <div style="background-color:#022c22;border:1px solid ${gold};border-radius:6px;padding:8px 12px;text-align:center;">
              <div style="color:${gold};font-size:12px;font-weight:900;line-height:1.2;">
                ${discount}
              </div>
              <div style="color:#ffffff;font-size:9.5px;font-weight:700;margin-top:2px;">
                60-Day Return Window
              </div>
              <div style="color:#6ee7b7;font-size:9px;font-weight:800;margin-top:2px;">
                &#10003; Free Replacements
              </div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:limited_time_offer:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported Variant Registry (All 10 Distinct Layout Architectures)
// ─────────────────────────────────────────────────────────────────────────────
export const limitedTimeOfferVariants: BlockVariant[] = [
  {
    id: 'lto-flash-sale-ticker',
    label: 'Flash Sale Red Ticker',
    description: 'High-velocity crimson ticker with 4 digital countdown boxes (Days/Hrs/Mins/Secs)',
    toHtml(props, id) { return flashSaleTicker(props, id) },
  },
  {
    id: 'lto-clearance-stamped-tag',
    label: 'Clearance Stamped Stub',
    description: 'Parchment liquidation stub with authentic circular red inspection stamp',
    toHtml(props, id) { return clearanceStampedTag(props, id) },
  },
  {
    id: 'lto-midnight-vip-exclusive',
    label: 'Midnight VIP Card',
    description: 'Luxury matte black & champagne gold hairline card for high-end boutique listings',
    toHtml(props, id) { return midnightVipExclusive(props, id) },
  },
  {
    id: 'lto-industrial-hazard-alert',
    label: 'Industrial Hazard Strip',
    description: 'Heavy-duty black & safety-yellow hazard alert for auto parts and tools',
    toHtml(props, id) { return industrialHazardAlert(props, id) },
  },
  {
    id: 'lto-circular-coupon-clip',
    label: 'Newspaper Clip Coupon',
    description: 'Retro circular coupon with dashed border, cut scissors, and simulated barcode',
    toHtml(props, id) { return circularCouponClip(props, id) },
  },
  {
    id: 'lto-live-scarcity-meter',
    label: 'Live Scarcity Meter',
    description: 'Urgent stock velocity card with live progress bar and remaining units warning',
    toHtml(props, id) { return liveScarcityMeter(props, id) },
  },
  {
    id: 'lto-multibuy-volume-matrix',
    label: 'Multi-Buy Volume Matrix',
    description: '3-column volume pricing grid: Buy 1, Buy 2 (10% Off), Buy 3+ (20% Off)',
    toHtml(props, id) { return multibuyVolumeMatrix(props, id) },
  },
  {
    id: 'lto-scandinavian-editorial',
    label: 'Scandinavian Editorial',
    description: 'High-end minimalist boutique layout with hairline rules and wide letter tracking',
    toHtml(props, id) { return scandinavianEditorial(props, id) },
  },
  {
    id: 'lto-cyber-terminal-deal',
    label: 'Cyber Tech Terminal',
    description: 'Dark terminal console with bracket tags, cyan accents, and hardware checkmarks',
    toHtml(props, id) { return cyberTerminalDeal(props, id) },
  },
  {
    id: 'lto-holiday-gift-ribbon',
    label: 'Holiday Gift Ribbon',
    description: 'Festive emerald/wine ribbon banner with extended 60-day return guarantee',
    toHtml(props, id) { return holidayGiftRibbon(props, id) },
  },
]

// Backwards-compatible aliases
export const limitedOfferVariants = limitedTimeOfferVariants
export const dealBannerVariants = limitedTimeOfferVariants

/**
 * Robust Variant Resolver:
 * Supports variant IDs with or without the 'lto-', 'deal-', or 'offer-' prefix
 * and matches shorthand IDs seamlessly.
 */
export function getLimitedTimeOfferVariant(id: string): BlockVariant {
  if (!id) return limitedTimeOfferVariants[0]
  const clean = id
    .toLowerCase()
    .trim()
    .replace(/^lto[-_]/, '')
    .replace(/^deal[-_]/, '')
    .replace(/^offer[-_]/, '')
    .replace(/_/g, '-')

  const match = limitedTimeOfferVariants.find(v => {
    const vClean = v.id
      .toLowerCase()
      .replace(/^lto[-_]/, '')
      .replace(/^deal[-_]/, '')
      .replace(/^offer[-_]/, '')
      .replace(/_/g, '-')

    return (
      v.id === id ||
      vClean === clean ||
      v.id.endsWith(clean) ||
      clean.includes(vClean) ||
      vClean.includes(clean)
    )
  })

  return match ?? limitedTimeOfferVariants[0]
}

// Aliases for callers looking for getLimitedOfferVariant or getDealBannerVariant
export const getLimitedOfferVariant = getLimitedTimeOfferVariant
export const getDealBannerVariant = getLimitedTimeOfferVariant
