// components/ui/VisualEditor/variants/free_shipping.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Free Shipping Banner — 10 Radically Distinct, High-Converting Retail Layouts
// Built specifically for high-converting eBay & e-commerce listings.
// Zero generic AI-slop, zero cheesy glassmorphism, zero fake neon glows.
// 100% authentic, tangible, battle-tested logistics designs that buyers trust.
//
// 1. ship-express-courier-strip   — Express carrier dispatch strip with tracking badge
// 2. ship-two-tone-split          — Asymmetric 2-tone cost vs logistics checklist split
// 3. ship-warehouse-direct-matrix — 3-column warehouse fulfillment specification grid
// 4. ship-minimalist-editorial    — High-end boutique minimalist hairline rule layout
// 5. ship-parcel-post-ticket      — Vintage airmail postal parcel ticket with postmark
// 6. ship-stepper-tracker-bar     — Visual 4-step package transit tracker timeline
// 7. ship-heavy-duty-cargo        — Industrial rugged heavy freight & cargo dispatch bar
// 8. ship-global-transit-matrix   — Dual-tier domestic vs international air transit table
// 9. ship-urgent-cutoff-bar       — Same-day dispatch cutoff timer & live hub status
// 10. ship-white-glove-guarantee  — Luxury white-glove & fragile packaging certificate
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

function titleText(p: any, fallback = 'Fast & Free Domestic Shipping'): string {
    return p.heading ?? p.title ?? p.shippingTitle ?? p.bannerTitle ?? fallback
}

function subText(p: any, fallback = 'Guaranteed safe delivery with real-time tracking uploaded directly to eBay.'): string {
    return p.subText ?? p.subtitle ?? p.shippingSubtext ?? p.bannerSubtitle ?? fallback
}

function badgeLabel(p: any, fallback = 'SAME-DAY DISPATCH'): string {
    return p.badgeText ?? p.badge ?? p.tag ?? fallback
}

function dispatchTime(p: any, fallback = 'Within 24 Hours'): string {
    return p.dispatchTime ?? p.handlingTime ?? p.cutoff ?? fallback
}

function carrierName(p: any, fallback = 'USPS Priority & FedEx Tracked'): string {
    return p.carrier ?? p.courier ?? p.carrierName ?? fallback
}

/**
 * Dynamic background resolver:
 * Only preserves user override if they explicitly altered it from default initial slate/white.
 */
function resolveBg(p: any, signatureBg: string): string {
    if (!p.bgColor || p.bgColor.toLowerCase() === '#f8fafc' || p.bgColor.toLowerCase() === '#ffffff') {
        return signatureBg
    }
    return p.bgColor
}

/**
 * Dynamic text resolver.
 */
function resolveText(p: any, signatureText: string, isLightVariant = false): string {
    if (!p.textColor || p.textColor.toLowerCase() === '#0f172a' || (isLightVariant && p.textColor.toLowerCase() === '#ffffff')) {
        return signatureText
    }
    return p.textColor
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. EXPRESS COURIER STRIP (High-Conversion Corporate Carrier Bar)
// Horizontal dark-slate container with prominent amber dispatch pill & tracking badge.
// ─────────────────────────────────────────────────────────────────────────────
function expressCourierStrip(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#0f172a')
    const textCol = resolveText(p, '#ffffff')
    const accent = p.accentColor ?? '#f59e0b'
    const title = titleText(p, 'Fast & Free Domestic Shipping')
    const subtitle = subText(p, 'Orders placed before 2:00 PM EST ship the same business day.')
    const tag = badgeLabel(p, '⚡ SAME-DAY DISPATCH')
    const carrier = carrierName(p, 'USPS PRIORITY / FEDEX 2-DAY')

    return `<!--[riazify:free_shipping:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border-radius:8px;${pad(p, 16, 22, 16, 22)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Left Icon Pill + Content -->
          <td style="text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div style="margin-bottom:6px;">
              <span style="display:inline-block;background-color:${accent};color:#0f172a;font-size:10px;font-weight:900;letter-spacing:1.2px;text-transform:uppercase;padding:3.5px 9px;border-radius:4px;vertical-align:middle;">
                ${tag}
              </span>
              <span style="display:inline-block;color:#94a3b8;font-size:11px;font-weight:700;margin-left:8px;vertical-align:middle;">
                &bull; 100% Free Shipping Included
              </span>
            </div>
            <div style="color:${textCol};font-size:18px;font-weight:800;letter-spacing:0.2px;line-height:1.25;margin:0 0 4px 0;">
              ${title}
            </div>
            <div style="color:#cbd5e1;font-size:12px;font-weight:400;line-height:1.4;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Right Carrier Badge Pill -->
          <td width="200" style="width:200px;text-align:right;vertical-align:middle;padding-left:14px;box-sizing:border-box;">
            <div style="display:inline-block;background-color:#1e293b;border:1px solid #334155;border-radius:6px;padding:8px 14px;text-align:center;">
              <div style="color:${accent};font-size:13px;font-weight:900;line-height:1;margin-bottom:3px;">
                &#10003; VERIFIED COURIER
              </div>
              <div style="color:#f8fafc;font-size:10px;font-weight:700;letter-spacing:0.5px;line-height:1.2;">
                ${carrier}
              </div>
              <div style="color:#38bdf8;font-size:9.5px;font-weight:600;margin-top:2px;">
                End-to-End Tracking
              </div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:free_shipping:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DUAL-TONE SPLIT (Asymmetric 2-Tone Cost vs Logistics Checklist Split)
// Deep navy left block highlighting $0.00 cost with clean right checklist.
// ─────────────────────────────────────────────────────────────────────────────
function dualtoneSplit(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#0f172a')
    const splitBg = p.accentColor ?? '#2563eb'
    const title = titleText(p, 'Complimentary Expedited Delivery')
    const subtitle = subText(p, 'We pack every order with industrial care to ensure flawless arrival.')
    const tag = badgeLabel(p, 'FREE FREIGHT')

    return `<!--[riazify:free_shipping:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:#ffffff;border:2px solid #e2e8f0;border-radius:8px;overflow:hidden;padding:0;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Solid Cobalt Left Block -->
          <td width="170" style="width:170px;background-color:${splitBg};padding:22px 14px;text-align:center;vertical-align:middle;box-sizing:border-box;">
            <div style="color:#bfdbfe;font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin-bottom:2px;">
              SHIPPING COST
            </div>
            <div style="color:#ffffff;font-size:36px;font-weight:900;letter-spacing:1px;line-height:1;margin-bottom:2px;">
              $0.00
            </div>
            <div style="color:#ffffff;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">
              100% FREE
            </div>
            <div style="display:inline-block;background-color:rgba(0,0,0,0.25);color:#ffffff;font-size:9px;font-weight:800;padding:2px 8px;border-radius:3px;letter-spacing:0.5px;">
              ${tag}
            </div>
          </td>

          <!-- Right Content with Delivery Reassurance Checklist -->
          <td style="${pad(p, 16, 20, 16, 20)}text-align:left;vertical-align:middle;background-color:#ffffff;box-sizing:border-box;">
            <div style="color:#1e3a8a;font-size:10.5px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:4px;">
              &#10003; GUARANTEED SAFE TRANSIT
            </div>
            <div style="color:#0f172a;font-size:17px;font-weight:800;letter-spacing:0.1px;line-height:1.3;margin-bottom:4px;">
              ${title}
            </div>
            <div style="color:#64748b;font-size:12px;font-weight:400;line-height:1.4;margin-bottom:10px;">
              ${subtitle}
            </div>

            <!-- Bullet Matrix -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding:2px 0;vertical-align:middle;color:#1e293b;font-size:11.5px;font-weight:600;">
                  <span style="color:#16a34a;font-weight:900;margin-right:4px;">&#10003;</span> In-Stock &amp; Ready for Immediate Dispatch
                </td>
              </tr>
              <tr>
                <td style="padding:2px 0;vertical-align:middle;color:#1e293b;font-size:11.5px;font-weight:600;">
                  <span style="color:#16a34a;font-weight:900;margin-right:4px;">&#10003;</span> Official eBay Tracking Uploaded Automatically
                </td>
              </tr>
              <tr>
                <td style="padding:2px 0;vertical-align:middle;color:#1e293b;font-size:11.5px;font-weight:600;">
                  <span style="color:#16a34a;font-weight:900;margin-right:4px;">&#10003;</span> Fully Insured Against In-Transit Loss or Breakage
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:free_shipping:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. WAREHOUSE DIRECT MATRIX (3-Column Logistics Fulfillment Grid)
// Clean 3-box feature matrix showing Speed, Security, and Tracking side-by-side.
// ─────────────────────────────────────────────────────────────────────────────
function warehouseDirectMatrix(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#f8fafc')
    const borderCol = p.borderColor ?? '#cbd5e1'
    const title = titleText(p, 'Direct-From-Warehouse Fulfillment')
    const tag = badgeLabel(p, 'LOGISTICS SPECIFICATION')
    const isCustomDarkBg = p.bgColor && p.bgColor !== '#f8fafc' && p.bgColor !== '#ffffff'
    const titleCol = isCustomDarkBg ? '#ffffff' : '#0f172a'
    const tagCol = isCustomDarkBg ? '#93c5fd' : '#2563eb'

    return `<!--[riazify:free_shipping:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:2px solid ${borderCol};border-radius:8px;${pad(p, 16, 16, 16, 16)}box-sizing:border-box;">

      <!-- Top Title Bar -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:12px;">
        <tr>
          <td style="text-align:left;vertical-align:middle;">
            <span style="color:${tagCol};font-size:10px;font-weight:900;letter-spacing:1.8px;text-transform:uppercase;">
              &#9632; ${tag}
            </span>
            <div style="color:${titleCol};font-size:17px;font-weight:800;letter-spacing:0.2px;line-height:1.25;margin-top:2px;">
              ${title}
            </div>
          </td>
          <td style="text-align:right;vertical-align:middle;">
            <span style="display:inline-block;background-color:#16a34a;color:#ffffff;font-size:10px;font-weight:800;letter-spacing:1px;padding:4px 10px;border-radius:4px;">
              100% FREE SHIPPING
            </span>
          </td>
        </tr>
      </table>

      <!-- 3-Column Spec Cards -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Col 1: Speed -->
          <td width="33.3%" style="padding:0 5px 0 0;vertical-align:top;box-sizing:border-box;">
            <div style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:6px;padding:12px 10px;text-align:center;box-sizing:border-box;">
              <div style="font-size:22px;line-height:1;margin-bottom:4px;color:#2563eb;">&#128666;</div>
              <div style="color:#0f172a;font-size:13px;font-weight:800;margin-bottom:3px;">Same-Day Dispatch</div>
              <div style="color:#64748b;font-size:11px;font-weight:500;line-height:1.35;">Orders processed rapidly from our domestic distribution center.</div>
            </div>
          </td>

          <!-- Col 2: Packaging -->
          <td width="33.3%" style="padding:0 2.5px;vertical-align:top;box-sizing:border-box;">
            <div style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:6px;padding:12px 10px;text-align:center;box-sizing:border-box;">
              <div style="font-size:22px;line-height:1;margin-bottom:4px;color:#2563eb;">&#128230;</div>
              <div style="color:#0f172a;font-size:13px;font-weight:800;margin-bottom:3px;">Armor-Packed</div>
              <div style="color:#64748b;font-size:11px;font-weight:500;line-height:1.35;">Heavy-gauge boxes, bubble-wrap &amp; anti-static protection.</div>
            </div>
          </td>

          <!-- Col 3: GPS Tracking -->
          <td width="33.3%" style="padding:0 0 0 5px;vertical-align:top;box-sizing:border-box;">
            <div style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:6px;padding:12px 10px;text-align:center;box-sizing:border-box;">
              <div style="font-size:22px;line-height:1;margin-bottom:4px;color:#2563eb;">&#128269;</div>
              <div style="color:#0f172a;font-size:13px;font-weight:800;margin-bottom:3px;">Live GPS Tracking</div>
              <div style="color:#64748b;font-size:11px;font-weight:500;line-height:1.35;">Official tracking uploaded directly to your eBay purchase history.</div>
            </div>
          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>
<!--[/riazify:free_shipping:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. MINIMALIST EDITORIAL (Boutique Luxury Hairline Rule Layout)
// Ultra-clean white background with crisp 1px borders & spaced uppercase tracking.
// ─────────────────────────────────────────────────────────────────────────────
function minimalistEditorial(p: any, id: string): string {
    const f = p.fontFamily ? `${p.fontFamily}, 'Helvetica Neue', Arial, sans-serif` : "'Helvetica Neue', Arial, sans-serif"
    const bgCol = resolveBg(p, '#ffffff')
    const borderCol = p.borderColor ?? '#e2e8f0'
    const textCol = resolveText(p, '#0f172a', true)
    const title = titleText(p, 'COMPLIMENTARY DOMESTIC SHIPPING')
    const subtitle = subText(p, 'Insured delivery &middot; Signature tracking &middot; Dispatched within 24 hours')

    return `<!--[riazify:free_shipping:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border-top:1px solid ${borderCol};border-bottom:1px solid ${borderCol};${pad(p, 18, 16, 18, 16)}text-align:center;box-sizing:border-box;">

      <!-- Primary Editorial Headline -->
      <div style="color:${textCol};font-size:14px;font-weight:700;letter-spacing:3px;text-transform:uppercase;line-height:1.4;margin-bottom:5px;">
        &mdash; ${title} &mdash;
      </div>

      <!-- Feature Separator Row -->
      <div style="color:#64748b;font-size:11px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;line-height:1.4;">
        ${subtitle}
      </div>

      <!-- Micro Reassurance Divider -->
      <div style="margin-top:8px;">
        <span style="display:inline-block;border:1px solid #cbd5e1;padding:2px 10px;border-radius:2px;font-size:9.5px;font-weight:700;letter-spacing:1.2px;color:#475569;text-transform:uppercase;">
          No Import Fees &middot; No Handling Surcharges
        </span>
      </div>

    </td>
  </tr>
</table>
<!--[/riazify:free_shipping:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PARCEL POST TICKET (Vintage Air Mail Postal Ticket with Postmark)
// Physical parcel aesthetic with classic dashed airmail frame & cancellation seal.
// ─────────────────────────────────────────────────────────────────────────────
function parcelPostTicket(p: any, id: string): string {
    const f = p.fontFamily ? `${p.fontFamily}, 'Courier New', Courier, monospace` : "'Courier New', Courier, monospace"
    const bgCol = resolveBg(p, '#fefce8')
    const title = titleText(p, 'PRIORITY AIR PARCEL POST')
    const subtitle = subText(p, 'Handled under postal priority protocols with barcode tracking.')
    const tag = badgeLabel(p, 'OFFICIAL AIR MAIL')

    return `<!--[riazify:free_shipping:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:2px dashed #b45309;border-radius:6px;${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Left Cancellation Seal -->
          <td width="90" style="width:90px;text-align:center;vertical-align:middle;padding-right:14px;box-sizing:border-box;">
            <div style="width:72px;height:72px;border:2px solid #b45309;border-radius:50%;margin:0 auto;text-align:center;box-sizing:border-box;padding-top:10px;">
              <div style="color:#b45309;font-size:8px;font-weight:900;letter-spacing:1px;line-height:1;">POSTAGE</div>
              <div style="color:#b45309;font-size:18px;font-weight:900;line-height:1.2;">PAID</div>
              <div style="color:#b45309;font-size:7.5px;font-weight:700;letter-spacing:0.5px;">&star; FREE &star;</div>
            </div>
          </td>

          <!-- Middle Ticket Content -->
          <td style="text-align:left;vertical-align:middle;box-sizing:border-box;border-left:1px dashed #d97706;padding-left:14px;">
            <div style="color:#b45309;font-size:9.5px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin-bottom:3px;">
              &bull; ${tag} &bull; DISPATCH TICKET
            </div>
            <div style="color:#451a03;font-size:17px;font-weight:900;letter-spacing:0.5px;line-height:1.2;margin-bottom:4px;">
              ${title}
            </div>
            <div style="color:#78350f;font-family:Arial,sans-serif;font-size:11.5px;font-weight:500;line-height:1.4;margin-bottom:6px;">
              ${subtitle}
            </div>
            <div style="font-family:monospace;font-size:10px;color:#92400e;letter-spacing:1px;">
              ||| |||| || |||||| | ||||||| ||| ||| #TRK-EXP-4892
            </div>
          </td>

          <!-- Right Stamp Badge -->
          <td width="130" style="width:130px;text-align:right;vertical-align:middle;box-sizing:border-box;">
            <div style="background-color:#ffffff;border:1px solid #d97706;padding:8px 10px;border-radius:4px;text-align:center;">
              <div style="color:#b45309;font-size:11px;font-weight:900;letter-spacing:1px;line-height:1;">
                COST: $0.00
              </div>
              <div style="color:#0f172a;font-family:Arial,sans-serif;font-size:9.5px;font-weight:700;margin-top:2px;">
                Priority Delivery
              </div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:free_shipping:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. STEPPER TRACKER BAR (Visual 4-Step Order Transit Timeline)
// Real-world package tracking progress line simulating live order progression.
// ─────────────────────────────────────────────────────────────────────────────
function stepperTrackerBar(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#ffffff')
    const borderCol = p.borderColor ?? '#cbd5e1'
    const title = titleText(p, 'Transparent 4-Step Delivery Roadmap')
    const tag = badgeLabel(p, 'REAL-TIME TRACKING INCLUDED')

    return `<!--[riazify:free_shipping:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:2px solid ${borderCol};border-radius:8px;${pad(p, 16, 16, 16, 16)}box-sizing:border-box;">

      <!-- Header -->
      <div style="text-align:center;margin-bottom:14px;">
        <span style="display:inline-block;background-color:#0f172a;color:#ffffff;font-size:9.5px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:3px 10px;border-radius:3px;margin-bottom:4px;">
          ${tag}
        </span>
        <div style="color:#0f172a;font-size:16px;font-weight:800;letter-spacing:0.1px;margin:2px 0 0 0;">
          ${title}
        </div>
      </div>

      <!-- 4-Step Progress Stepper -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Step 1 -->
          <td width="25%" style="text-align:center;vertical-align:top;padding:0 4px;box-sizing:border-box;">
            <div style="width:24px;height:24px;border-radius:50%;background-color:#16a34a;color:#ffffff;font-size:11px;font-weight:900;line-height:24px;margin:0 auto 6px auto;text-align:center;">
              &#10003;
            </div>
            <div style="color:#0f172a;font-size:11px;font-weight:800;line-height:1.2;">1. Verified</div>
            <div style="color:#64748b;font-size:9.5px;font-weight:500;line-height:1.3;margin-top:2px;">Payment Confirmed</div>
          </td>

          <!-- Step 2 -->
          <td width="25%" style="text-align:center;vertical-align:top;padding:0 4px;box-sizing:border-box;">
            <div style="width:24px;height:24px;border-radius:50%;background-color:#16a34a;color:#ffffff;font-size:11px;font-weight:900;line-height:24px;margin:0 auto 6px auto;text-align:center;">
              &#10003;
            </div>
            <div style="color:#0f172a;font-size:11px;font-weight:800;line-height:1.2;">2. Packed</div>
            <div style="color:#64748b;font-size:9.5px;font-weight:500;line-height:1.3;margin-top:2px;">Padded Protective Box</div>
          </td>

          <!-- Step 3 -->
          <td width="25%" style="text-align:center;vertical-align:top;padding:0 4px;box-sizing:border-box;">
            <div style="width:24px;height:24px;border-radius:50%;background-color:#2563eb;color:#ffffff;font-size:11px;font-weight:900;line-height:24px;margin:0 auto 6px auto;text-align:center;">
              3
            </div>
            <div style="color:#0f172a;font-size:11px;font-weight:800;line-height:1.2;">3. In Transit</div>
            <div style="color:#64748b;font-size:9.5px;font-weight:500;line-height:1.3;margin-top:2px;">Real-Time GPS Tracking</div>
          </td>

          <!-- Step 4 -->
          <td width="25%" style="text-align:center;vertical-align:top;padding:0 4px;box-sizing:border-box;">
            <div style="width:24px;height:24px;border-radius:50%;background-color:#0f172a;color:#ffffff;font-size:11px;font-weight:900;line-height:24px;margin:0 auto 6px auto;text-align:center;">
              4
            </div>
            <div style="color:#0f172a;font-size:11px;font-weight:800;line-height:1.2;">4. Delivered</div>
            <div style="color:#16a34a;font-size:9.5px;font-weight:800;line-height:1.3;margin-top:2px;">100% Free Shipping</div>
          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>
<!--[/riazify:free_shipping:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. HEAVY-DUTY CARGO (Industrial Rugged Heavy Freight & Cargo Dispatch Bar)
// High-visibility hazard strobe accents & bold industrial typography for tools/auto parts.
// ─────────────────────────────────────────────────────────────────────────────
function heavyDutyCargo(p: any, id: string): string {
    const f = p.fontFamily ? `${p.fontFamily}, 'Impact', Arial Black, sans-serif` : "'Impact', Arial Black, sans-serif"
    const bgCol = resolveBg(p, '#18181b')
    const yellow = p.accentColor ?? '#facc15'
    const title = titleText(p, 'HEAVY CARGO &bull; FAST & FREE DISPATCH')
    const subtitle = subText(p, 'Reinforced packaging for heavy freight, tools, hardware & auto components.')
    const tag = badgeLabel(p, 'ZERO SURCHARGES')

    return `<!--[riazify:free_shipping:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${font(p)};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:2px solid ${yellow};border-radius:6px;overflow:hidden;padding:0;box-sizing:border-box;">

      <!-- Top Caution Strip -->
      <div style="background-color:${yellow};color:#18181b;font-size:9.5px;font-weight:900;letter-spacing:2px;text-align:center;padding:3px 0;line-height:1;">
        &#9888; COMMERCIAL INDUSTRIAL LOGISTICS &bull; DIRECT DISPATCH &#9888;
      </div>

      <!-- Main Body -->
      <div style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
          <tr>
            <td style="text-align:left;vertical-align:middle;">
              <div style="color:${yellow};font-family:${f};font-size:22px;letter-spacing:1px;line-height:1.2;margin-bottom:4px;">
                ${title}
              </div>
              <div style="color:#d4d4d8;font-size:12px;font-weight:500;line-height:1.4;">
                ${subtitle}
              </div>
            </td>
            <td width="160" style="width:160px;text-align:right;vertical-align:middle;padding-left:14px;">
              <div style="background-color:#27272a;border:1px solid #3f3f46;border-radius:4px;padding:8px 12px;text-align:center;">
                <div style="color:${yellow};font-size:11px;font-weight:900;letter-spacing:1px;">
                  ${tag}
                </div>
                <div style="color:#ffffff;font-size:10px;font-weight:700;margin-top:2px;">
                  Fully Insured Freight
                </div>
              </div>
            </td>
          </tr>
        </table>
      </div>

    </td>
  </tr>
</table>
<!--[/riazify:free_shipping:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. GLOBAL TRANSIT MATRIX (Domestic & Worldwide Air Transit Banner)
// Deep maritime navy container with side-by-side domestic vs international breakdown.
// ─────────────────────────────────────────────────────────────────────────────
function globalTransitMatrix(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#0c4a6e')
    const title = titleText(p, 'Worldwide & Domestic Shipping Solutions')
    const tag = badgeLabel(p, 'GLOBAL & DOMESTIC LOGISTICS')

    return `<!--[riazify:free_shipping:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border-radius:8px;${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">

      <!-- Top Title -->
      <div style="text-align:center;margin-bottom:12px;">
        <span style="color:#38bdf8;font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">
          &#9992; ${tag}
        </span>
        <div style="color:#ffffff;font-size:18px;font-weight:800;letter-spacing:0.2px;line-height:1.25;margin-top:2px;">
          ${title}
        </div>
      </div>

      <!-- 2-Tier Breakdown Table -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Tier 1: Domestic -->
          <td width="50%" style="padding:0 6px 0 0;vertical-align:top;box-sizing:border-box;">
            <div style="background-color:#075985;border:1px solid #0284c7;border-radius:6px;padding:12px 14px;box-sizing:border-box;">
              <div style="color:#38bdf8;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;">
                DOMESTIC DESTINATIONS
              </div>
              <div style="color:#ffffff;font-size:14px;font-weight:800;margin-bottom:3px;">
                100% Free Expedited Delivery
              </div>
              <div style="color:#e0f2fe;font-size:11px;font-weight:400;line-height:1.35;">
                Delivered in 1-3 business days with USPS Priority / FedEx Ground tracking.
              </div>
            </div>
          </td>

          <!-- Tier 2: International -->
          <td width="50%" style="padding:0 0 0 6px;vertical-align:top;box-sizing:border-box;">
            <div style="background-color:#075985;border:1px solid #0284c7;border-radius:6px;padding:12px 14px;box-sizing:border-box;">
              <div style="color:#38bdf8;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;">
                INTERNATIONAL BUYERS
              </div>
              <div style="color:#ffffff;font-size:14px;font-weight:800;margin-bottom:3px;">
                eBay Global Shipping Program
              </div>
              <div style="color:#e0f2fe;font-size:11px;font-weight:400;line-height:1.35;">
                Full international customs clearance, duty tracking &amp; seamless air transit.
              </div>
            </div>
          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>
<!--[/riazify:free_shipping:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. URGENT CUTOFF BAR (Same-Day Cutoff Timer & Live Hub Status)
// Urgency-driven retail banner with prominent digital cutoff clock display.
// ─────────────────────────────────────────────────────────────────────────────
function urgentCutoffBar(p: any, id: string): string {
    const f = font(p)
    const bgCol = resolveBg(p, '#064e3b')
    const accent = p.accentColor ?? '#34d399'
    const title = titleText(p, 'Order Now for Guaranteed Same-Day Dispatch!')
    const subtitle = subText(p, 'Our fulfillment center is actively packaging orders.')
    const tag = badgeLabel(p, 'ACTIVE DISPATCH HUB')

    return `<!--[riazify:free_shipping:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:2px solid #059669;border-radius:8px;${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <!-- Left Info & Status -->
          <td style="text-align:left;vertical-align:middle;box-sizing:border-box;">
            <div style="margin-bottom:4px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:#10b981;margin-right:6px;vertical-align:middle;"></span>
              <span style="color:${accent};font-size:10px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;vertical-align:middle;">
                ${tag}
              </span>
            </div>
            <div style="color:#ffffff;font-size:17px;font-weight:800;letter-spacing:0.2px;line-height:1.25;margin:0 0 3px 0;">
              ${title}
            </div>
            <div style="color:#a7f3d0;font-size:11.5px;font-weight:400;line-height:1.4;margin:0;">
              ${subtitle}
            </div>
          </td>

          <!-- Right Cutoff Timer Clock Mockup -->
          <td width="220" style="width:220px;text-align:right;vertical-align:middle;padding-left:14px;box-sizing:border-box;">
            <div style="display:inline-block;background-color:#022c22;border:1px solid #047857;border-radius:6px;padding:8px 12px;text-align:center;">
              <div style="color:#6ee7b7;font-size:9.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:3px;">
                TODAY'S CUTOFF COUNTDOWN
              </div>
              <div style="font-family:monospace;color:#ffffff;font-size:18px;font-weight:900;letter-spacing:1.5px;line-height:1;">
                02 : 45 : 30
              </div>
              <div style="color:#a7f3d0;font-size:9px;font-weight:600;margin-top:2px;">
                HRS &nbsp;&nbsp; MIN &nbsp;&nbsp; SEC
              </div>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<!--[/riazify:free_shipping:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. WHITE-GLOVE GUARANTEE (Luxury White Glove & Fragile Handling Certificate)
// Aristocratic double-bordered container with gold seal for collectibles & luxury items.
// ─────────────────────────────────────────────────────────────────────────────
function whiteGloveGuarantee(p: any, id: string): string {
    const f = p.fontFamily ? `${p.fontFamily}, Georgia, serif` : 'Georgia, serif'
    const bgCol = resolveBg(p, '#fafaf9')
    const gold = p.accentColor ?? '#b45309'
    const textCol = resolveText(p, '#1c1917', true)
    const title = titleText(p, 'Certified White-Glove Packaging & Delivery')
    const subtitle = subText(p, 'Multi-tier electrostatic protection, reinforced corners, and 100% transit damage guarantee.')
    const tag = badgeLabel(p, 'PREMIER HANDLING PLEDGE')

    return `<!--[riazify:free_shipping:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;font-family:${f};border-collapse:collapse;margin:0 auto;">
  <tr>
    <td style="background-color:${bgCol};border:2px solid ${gold};${pad(p, 16, 20, 16, 20)}border-radius:4px;text-align:center;box-sizing:border-box;">
      <div style="border:1px solid ${gold};padding:18px 24px;border-radius:2px;box-sizing:border-box;">

        <!-- Wax Seal / Emblem -->
        <div style="color:${gold};font-size:20px;line-height:1;margin-bottom:4px;">
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
          100% Free Shipping &middot; Fully Insured Against Transit Damage
        </div>

      </div>
    </td>
  </tr>
</table>
<!--[/riazify:free_shipping:${id}]-->`
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export const freeShippingVariants: BlockVariant[] = [
    {
        id: 'ship-express-courier-strip',
        label: 'Express Courier Strip',
        description: 'Corporate carrier dispatch strip with tracking badge and same-day pill',
        toHtml(props, id) { return expressCourierStrip(props, id) },
    },
    {
        id: 'ship-two-tone-split',
        label: 'Dual-Tone Split',
        description: 'Asymmetric 2-tone split: $0.00 cost callout on left, delivery checklist on right',
        toHtml(props, id) { return dualtoneSplit(props, id) },
    },
    {
        id: 'ship-warehouse-direct-matrix',
        label: 'Warehouse Fulfillment Matrix',
        description: '3-column specification grid detailing speed, packaging armor, and GPS tracking',
        toHtml(props, id) { return warehouseDirectMatrix(props, id) },
    },
    {
        id: 'ship-minimalist-editorial',
        label: 'Minimalist Editorial',
        description: 'High-end boutique luxury strip with crisp hairline borders and spaced uppercase tracking',
        toHtml(props, id) { return minimalistEditorial(props, id) },
    },
    {
        id: 'ship-parcel-post-ticket',
        label: 'Postal Airmail Ticket',
        description: 'Vintage airmail parcel ticket with dashed borders, circular postmark and barcode',
        toHtml(props, id) { return parcelPostTicket(props, id) },
    },
    {
        id: 'ship-stepper-tracker-bar',
        label: '4-Step Transit Stepper',
        description: 'Visual order timeline showing Verified -> Packed -> In Transit -> Delivered',
        toHtml(props, id) { return stepperTrackerBar(props, id) },
    },
    {
        id: 'ship-heavy-duty-cargo',
        label: 'Heavy Cargo Freight Bar',
        description: 'Rugged industrial dark bar with hazard accents for tools, auto parts, and heavy goods',
        toHtml(props, id) { return heavyDutyCargo(props, id) },
    },
    {
        id: 'ship-global-transit-matrix',
        label: 'Worldwide & Domestic Matrix',
        description: 'Dual-tier breakdown covering fast free domestic delivery alongside Global Shipping',
        toHtml(props, id) { return globalTransitMatrix(props, id) },
    },
    {
        id: 'ship-urgent-cutoff-bar',
        label: 'Same-Day Cutoff Countdown',
        description: 'Urgency-driven retail banner with live dispatch status and cutoff countdown clock',
        toHtml(props, id) { return urgentCutoffBar(props, id) },
    },
    {
        id: 'ship-white-glove-guarantee',
        label: 'White-Glove Luxury Certificate',
        description: 'Double-bordered certificate with gold seal for delicate, fragile, or luxury items',
        toHtml(props, id) { return whiteGloveGuarantee(props, id) },
    },
]

// Alias for backwards compatibility if callers look for shippingBannerVariants
export const shippingBannerVariants = freeShippingVariants

/**
 * Robust Variant Resolver:
 * Supports variant IDs with or without the 'ship-', 'shipping-', or 'free-shipping-' prefix
 * and matches shorthand IDs seamlessly.
 */
export function getFreeShippingVariant(id: string): BlockVariant {
    if (!id) return freeShippingVariants[0]

    const clean = id
        .toLowerCase()
        .trim()
        .replace(/^ship[-_]/, '')
        .replace(/^shipping[-_]/, '')
        .replace(/^free[-_]shipping[-_]/, '')
        .replace(/_/g, '-')

    const match = freeShippingVariants.find(v => {
        const vClean = v.id
            .toLowerCase()
            .replace(/^ship[-_]/, '')
            .replace(/^shipping[-_]/, '')
            .replace(/^free[-_]shipping[-_]/, '')
            .replace(/_/g, '-')

        return (
            v.id === id ||
            vClean === clean ||
            v.id.endsWith(clean) ||
            clean.includes(vClean) ||
            vClean.includes(clean)
        )
    })

    return match ?? freeShippingVariants[0]
}

// Alias for callers looking for getShippingBannerVariant
export const getShippingBannerVariant = getFreeShippingVariant
