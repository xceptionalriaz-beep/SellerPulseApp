// components/ui/VisualEditor/variants/shipping_info.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Shipping Info & Fast Dispatch Badges (10 Professional Layout Styles)
//
// Solves eBay Buyer Shipping Anxiety with Clear, High-Converting Proof:
// • Style 1 is 100% IDENTICAL to your current baseline style (same HTML, same structure)
// • 9 new radically distinct, professional logistics architectures
// • Full 100% responsive width across desktop & mobile eBay containers
// • Crisp vector SVG icons (Zero emojis, zero blurry icons, zero glassy AI slop)
// • Pure eBay-compliant inline CSS and HTML table architecture (VeRO safe)
//
// 10 Distinct Layout Styles:
//   1.  ship-classic-card          (Current Baseline — 100% SAME TO SAME card with green accent stripe)
//   2.  ship-three-pillar-strip    (Official 3-Column Logistics Grid: Dispatch, Transit & Packaging)
//   3.  ship-dispatch-cutoff-bar   (Urgent Cutoff Alert: "Order Before 3PM for Same-Day Dispatch")
//   4.  ship-carrier-post-ticket   (Official Postal Waybill with Perforated Edge & Tracking Stamp)
//   5.  ship-stepper-timeline      (Visual 3-Step Transit Stepper: Ordered → Dispatched → Delivered)
//   6.  ship-dark-obsidian-cargo   (Midnight High-Contrast Flagship for Tech, Motors & Hardware)
//   7.  ship-minimalist-swiss      (Scandinavian Luxury Editorial Ledger with Clean 1px Hairlines)
//   8.  ship-warehouse-direct      (Domestic Warehouse Assurance with Verified UK/US Local Depot Badge)
//   9.  ship-compact-capsule       (Dense Mobile-Optimized Capsule Strip for 0-Scroll Buyers)
//   10. ship-white-glove-security  (Insured Fragile Parcel Seal with Shockproof Bubble Armor Proof)
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockVariant } from './section_label.variants'

export interface ShippingInfoProps {
    shippingText?: string
    dispatchText?: string
    locationText?: string
    bgColor?: string
    textColor?: string
    iconColor?: string
    accentColor?: string
    iconBg?: string
    borderRadius?: number
    paddingTop?: number
    paddingBottom?: number
    paddingLeft?: number
    paddingRight?: number
}

// ── Shared Vector SVG Icons (Sharp, Scalable, Zero Emojis) ────────────────────

export function getTruckSvg(color = '#16a34a', size = 18): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`
}

export function getClockSvg(color = '#d97706', size = 18): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
}

export function getPackageSvg(color = '#2563eb', size = 18): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M16.5 9.4 7.55 4.24a1.78 1.78 0 0 0-2.5 1.55v12.42a1.78 1.78 0 0 0 2.5 1.55L16.5 14.6a1.78 1.78 0 0 0 0-3.1Z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>`
}

export function getShieldCheckSvg(color = '#16a34a', size = 18): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`
}

export function getMapPinSvg(color = '#0284c7', size = 15): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:3px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`
}

// ── Property Resolvers ───────────────────────────────────────────────────────

function getShippingText(p: any): string {
    return p.shippingText || '{{SHIPPING_TIME}} — Fast & Free UK Delivery'
}

function getDispatchText(p: any): string {
    return p.dispatchText || 'Same Day Dispatch Before 3pm'
}

function getLocationText(p: any): string {
    return p.locationText || 'UK-Based Warehouse — Fully Tracked'
}

function pad(p: any, defaultTop = 16, defaultRight = 20, defaultBottom = 16, defaultLeft = 20): string {
    const pt = p.paddingTop ?? defaultTop
    const pr = p.paddingRight ?? defaultRight
    const pb = p.paddingBottom ?? defaultBottom
    const pl = p.paddingLeft ?? defaultLeft
    return `padding:${pt}px ${pr}px ${pb}px ${pl}px;`
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLASSIC CARD (CURRENT BASELINE — 100% SAME TO SAME)
// Preserves your exact existing HTML output, card styling, and table wrapper
// ─────────────────────────────────────────────────────────────────────────────
function variantClassicCard(p: any, id: string): string {
    const shippingText = getShippingText(p)
    const dispatchText = getDispatchText(p)
    const locationText = getLocationText(p)
    const bg = p.bgColor || '#ffffff'
    const text = p.textColor || '#1e1535'
    const accent = p.accentColor || '#16a34a'
    const iconBg = p.iconBg || '#f0fdf4'
    const radius = p.borderRadius ?? 8
    const truck = getTruckSvg(p.iconColor || accent, 20)

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p, 16, 16, 16, 16)}border-radius:${radius}px;border:1px solid #e5e7eb;box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="4" style="width:4px;background-color:${accent};border-radius:2px;">&nbsp;</td>
              <td style="padding:0 0 0 14px;vertical-align:middle;box-sizing:border-box;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="38" height="38" style="width:38px;height:38px;text-align:center;background-color:${iconBg};border-radius:8px;vertical-align:middle;box-sizing:border-box;">
                      ${truck}
                    </td>
                    <td style="padding-left:12px;vertical-align:middle;box-sizing:border-box;">
                      <p style="margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${text};line-height:1.4;">
                        ${shippingText}
                      </p>
                      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#475569;line-height:1.5;word-break:break-word;">
                        ${dispatchText} &bull; ${locationText}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. THREE PILLAR STRIP (Official 3-Column Logistics Proof Grid)
// [1] Same-Day Dispatch  |  [2] Tracked Courier  |  [3] Safe Packaging
// ─────────────────────────────────────────────────────────────────────────────
function variantThreePillarStrip(p: any, id: string): string {
    const bg = p.bgColor || '#ffffff'
    const text = p.textColor || '#0f172a'
    const border = '#e2e8f0'
    const truck = getTruckSvg('#16a34a', 16)
    const clock = getClockSvg('#d97706', 16)
    const pkg = getPackageSvg('#2563eb', 16)

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:Arial,sans-serif;background-color:${bg};border:1px solid ${border};border-radius:8px;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 12, 8, 12, 8)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
            <tr>
              <!-- Col 1: Dispatch -->
              <td width="33.33%" valign="middle" align="center" style="padding:4px 6px;border-right:1px solid ${border};box-sizing:border-box;">
                <div style="margin-bottom:3px;">${clock}</div>
                <div style="font-size:11px;font-weight:800;color:${text};line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  Same-Day Cutoff
                </div>
                <div style="font-size:9.5px;color:#16a34a;font-weight:700;line-height:1.2;margin-top:2px;white-space:nowrap;">
                  Before 3PM Orders
                </div>
              </td>
              <!-- Col 2: Speed -->
              <td width="33.33%" valign="middle" align="center" style="padding:4px 6px;border-right:1px solid ${border};box-sizing:border-box;">
                <div style="margin-bottom:3px;">${truck}</div>
                <div style="font-size:11px;font-weight:800;color:${text};line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  Fast &amp; Free UK
                </div>
                <div style="font-size:9.5px;color:#0284c7;font-weight:700;line-height:1.2;margin-top:2px;white-space:nowrap;">
                  1-2 Business Days
                </div>
              </td>
              <!-- Col 3: Packaging -->
              <td width="33.33%" valign="middle" align="center" style="padding:4px 6px;box-sizing:border-box;">
                <div style="margin-bottom:3px;">${pkg}</div>
                <div style="font-size:11px;font-weight:800;color:${text};line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  Shockproof Boxed
                </div>
                <div style="font-size:9.5px;color:#64748b;font-weight:700;line-height:1.2;margin-top:2px;white-space:nowrap;">
                  Fully Insured
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DISPATCH CUTOFF BAR (Urgent Warehouse Cutoff Alert)
// High conversion countdown badge "ORDER BEFORE 3PM FOR SAME-DAY DISPATCH"
// ─────────────────────────────────────────────────────────────────────────────
function variantDispatchCutoffBar(p: any, id: string): string {
    const shippingText = getShippingText(p)
    const locationText = getLocationText(p)
    const bg = p.bgColor || '#ffffff'
    const text = p.textColor || '#0f172a'
    const clock = getClockSvg('#d97706', 15)
    const truck = getTruckSvg('#16a34a', 14)

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:Arial,sans-serif;background-color:${bg};border:1px solid #fde68a;border-radius:8px;overflow:hidden;box-sizing:border-box;">
      <!-- Urgent Cutoff Header Banner -->
      <tr style="background:#fffbeb;border-bottom:1px solid #fef08a;">
        <td style="padding:6px 12px;box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" valign="middle">
                <span style="font-size:10.5px;font-weight:800;color:#92400e;letter-spacing:0.3px;">
                  ${clock} <span style="margin-left:3px;">SAME-DAY DISPATCH ACTIVE</span>
                </span>
              </td>
              <td align="right" valign="middle" style="white-space:nowrap;">
                <span style="font-size:9.5px;font-weight:800;color:#ffffff;background:#d97706;padding:2px 6px;border-radius:3px;">
                  CUTOFF 3PM
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- Shipping Details Body -->
      <tr>
        <td style="${pad(p, 10, 12, 10, 12)}box-sizing:border-box;">
          <div style="font-size:12.5px;font-weight:800;color:${text};line-height:1.25;margin-bottom:3px;">
            ${truck} <span style="margin-left:4px;">${shippingText}</span>
          </div>
          <div style="font-size:11px;color:#64748b;line-height:1.35;word-break:break-word;">
            Dispatched via Express Courier &bull; ${locationText}
          </div>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CARRIER POST TICKET (Official Postal Waybill with Perforated Stamp)
// Authentic logistics manifest layout with barcode proof & tracking stamp
// ─────────────────────────────────────────────────────────────────────────────
function variantCarrierPostTicket(p: any, id: string): string {
    const shippingText = getShippingText(p)
    const dispatchText = getDispatchText(p)
    const bg = p.bgColor || '#fafaf9'
    const text = p.textColor || '#1c1917'
    const pin = getMapPinSvg('#0369a1', 14)

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:Arial,sans-serif;background-color:${bg};border:1px dashed #d6d3d1;border-radius:8px;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 12, 14, 12, 14)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <!-- Stamp Box on Left -->
              <td width="55" valign="middle" style="width:55px;padding-right:12px;box-sizing:border-box;">
                <div style="width:48px;height:42px;border:1.5px solid #0369a1;border-radius:4px;background:#f0f9ff;text-align:center;box-sizing:border-box;padding-top:4px;">
                  <div style="font-size:8px;font-weight:900;color:#0369a1;letter-spacing:0.5px;text-transform:uppercase;">TRACKED</div>
                  <div style="font-size:12px;font-weight:900;color:#0369a1;line-height:1.1;">24/48</div>
                  <div style="font-size:7px;color:#0284c7;font-weight:700;">POST</div>
                </div>
              </td>
              <!-- Details Center -->
              <td valign="middle" style="box-sizing:border-box;">
                <div style="font-size:9.5px;font-weight:800;color:#0369a1;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:2px;">
                  ${pin} OFFICIAL DISPATCH RECORD
                </div>
                <div style="font-size:12.5px;font-weight:800;color:${text};line-height:1.2;margin-bottom:2px;">
                  ${shippingText}
                </div>
                <div style="font-size:11px;color:#57534e;line-height:1.35;word-break:break-word;">
                  ${dispatchText} &bull; Barcoded &amp; Scanned
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. STEPPER TIMELINE (Visual 3-Step Transit Stepper)
// [Ordered Today] ──→ [Dispatched in 24h] ──→ [At Your Door]
// ─────────────────────────────────────────────────────────────────────────────
function variantStepperTimeline(p: any, id: string): string {
    const bg = p.bgColor || '#ffffff'
    const text = p.textColor || '#0f172a'
    const border = '#e2e8f0'

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:Arial,sans-serif;background-color:${bg};border:1px solid ${border};border-radius:10px;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 12, 10, 12, 10)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
            <tr>
              <!-- Step 1 -->
              <td width="33.33%" valign="top" align="center" style="padding:0 3px;box-sizing:border-box;">
                <div style="width:20px;height:20px;border-radius:50%;background:#dcfce7;border:1.5px solid #16a34a;color:#16a34a;font-size:9px;font-weight:900;line-height:18px;margin:0 auto 4px;">
                  1
                </div>
                <div style="font-size:10.5px;font-weight:800;color:${text};line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  Order Confirmed
                </div>
                <div style="font-size:9px;color:#16a34a;font-weight:700;line-height:1.2;margin-top:2px;white-space:nowrap;">
                  Processed Fast
                </div>
              </td>
              <!-- Step 2 -->
              <td width="33.33%" valign="top" align="center" style="padding:0 3px;box-sizing:border-box;">
                <div style="width:20px;height:20px;border-radius:50%;background:#dbeafe;border:1.5px solid #2563eb;color:#2563eb;font-size:9px;font-weight:900;line-height:18px;margin:0 auto 4px;">
                  2
                </div>
                <div style="font-size:10.5px;font-weight:800;color:${text};line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  Same-Day Dispatch
                </div>
                <div style="font-size:9px;color:#2563eb;font-weight:700;line-height:1.2;margin-top:2px;white-space:nowrap;">
                  Fully Tracked
                </div>
              </td>
              <!-- Step 3 -->
              <td width="33.33%" valign="top" align="center" style="padding:0 3px;box-sizing:border-box;">
                <div style="width:20px;height:20px;border-radius:50%;background:#f1f5f9;border:1.5px solid #64748b;color:#64748b;font-size:9px;font-weight:900;line-height:18px;margin:0 auto 4px;">
                  3
                </div>
                <div style="font-size:10.5px;font-weight:800;color:${text};line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  Safe Arrival
                </div>
                <div style="font-size:9px;color:#64748b;font-weight:700;line-height:1.2;margin-top:2px;white-space:nowrap;">
                  At Your Door
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. DARK OBSIDIAN CARGO (Midnight High-Contrast Flagship)
// Deep obsidian slate for tech, gaming, auto parts & power tools (Zero glare)
// ─────────────────────────────────────────────────────────────────────────────
function variantDarkObsidianCargo(p: any, id: string): string {
    const shippingText = getShippingText(p)
    const dispatchText = getDispatchText(p)
    const locationText = getLocationText(p)
    const bg = '#0f172a'
    const truck = getTruckSvg('#38bdf8', 18)

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:Arial,sans-serif;background-color:${bg};border-radius:8px;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 12, 16, 12, 16)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="36" valign="middle" style="width:36px;padding-right:12px;box-sizing:border-box;">
                <div style="width:32px;height:32px;border-radius:6px;background:#1e293b;border:1px solid #334155;text-align:center;line-height:30px;display:inline-block;">
                  ${truck}
                </div>
              </td>
              <td valign="middle" style="box-sizing:border-box;">
                <div style="margin-bottom:3px;">
                  <span style="font-size:8.5px;font-weight:800;color:#38bdf8;background:#082f49;border:1px solid #0369a1;padding:2px 5px;border-radius:3px;letter-spacing:0.4px;text-transform:uppercase;margin-right:6px;vertical-align:middle;">
                    LOGISTICS VERIFIED
                  </span>
                  <span style="font-size:12.5px;font-weight:800;color:#ffffff;vertical-align:middle;line-height:1.2;">
                    ${shippingText}
                  </span>
                </div>
                <div style="font-size:11px;color:#94a3b8;line-height:1.35;word-break:break-word;">
                  ${dispatchText} &bull; ${locationText}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. MINIMALIST SWISS (Scandinavian Luxury Editorial Ledger)
// Clean 1px hairline rules for luxury, designer fashion, jewelry & collectibles
// ─────────────────────────────────────────────────────────────────────────────
function variantMinimalistSwiss(p: any, id: string): string {
    const shippingText = getShippingText(p)
    const dispatchText = getDispatchText(p)
    const locationText = getLocationText(p)
    const bg = p.bgColor || '#ffffff'
    const text = p.textColor || '#0f172a'

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:Arial,sans-serif;background-color:${bg};border-top:2px solid #0f172a;border-bottom:2px solid #0f172a;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 12, 14, 12, 14)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <!-- Category Header Column -->
              <td width="100" valign="top" style="width:100px;padding-right:12px;border-right:1px solid #e2e8f0;box-sizing:border-box;">
                <div style="font-size:8.5px;font-weight:900;color:#64748b;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:2px;">
                  FULFILMENT
                </div>
                <div style="font-size:11px;font-weight:800;color:#16a34a;line-height:1.2;white-space:nowrap;">
                  ✓ On-Time Delivery
                </div>
              </td>
              <!-- Content Column -->
              <td valign="top" style="padding-left:14px;box-sizing:border-box;">
                <div style="font-size:12px;font-weight:800;color:${text};line-height:1.2;margin-bottom:3px;">
                  ${shippingText}
                </div>
                <div style="font-size:11px;color:#475569;line-height:1.4;word-break:break-word;">
                  ${dispatchText} &bull; ${locationText}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. WAREHOUSE DIRECT (Domestic Warehouse Assurance with Depot Badge)
// Guarantees genuine domestic stock shipped directly from physical warehouse
// ─────────────────────────────────────────────────────────────────────────────
function variantWarehouseDirect(p: any, id: string): string {
    const shippingText = getShippingText(p)
    const dispatchText = getDispatchText(p)
    const locationText = getLocationText(p)
    const bg = p.bgColor || '#ffffff'
    const text = p.textColor || '#0f172a'
    const pin = getMapPinSvg('#16a34a', 15)

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:Arial,sans-serif;background-color:${bg};border:1px solid #cbd5e1;border-radius:8px;box-sizing:border-box;box-shadow:0 1px 3px rgba(0,0,0,0.03);">
      <tr>
        <td style="${pad(p, 12, 14, 12, 14)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td valign="middle" style="box-sizing:border-box;">
                <div style="font-size:12.5px;font-weight:800;color:${text};line-height:1.2;margin-bottom:3px;">
                  ${shippingText}
                </div>
                <div style="font-size:11px;color:#475569;line-height:1.4;word-break:break-word;">
                  ${dispatchText} &bull; ${locationText}
                </div>
              </td>
              <!-- Verified Domestic Badge on Right -->
              <td align="right" valign="middle" style="white-space:nowrap;padding-left:10px;box-sizing:border-box;">
                <span style="display:inline-block;padding:4px 8px;background:#f0fdf4;border:1px solid #86efac;border-radius:4px;font-size:9.5px;font-weight:800;color:#166534;letter-spacing:0.3px;white-space:nowrap;">
                  ${pin} LOCAL DEPOT
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. COMPACT CAPSULE (Dense Mobile-Optimized Pill for 0-Scroll Buyers)
// Ultra-compact single pill bar designed to minimize listing height
// ─────────────────────────────────────────────────────────────────────────────
function variantCompactCapsule(p: any, id: string): string {
    const shippingText = getShippingText(p)
    const dispatchText = getDispatchText(p)
    const bg = p.bgColor || '#f8fafc'
    const text = p.textColor || '#0f172a'
    const truck = getTruckSvg('#16a34a', 15)

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:Arial,sans-serif;background-color:${bg};border:1px solid #e2e8f0;border-radius:24px;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 8, 14, 8, 14)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" valign="middle" style="box-sizing:border-box;">
                <span style="font-size:12px;font-weight:800;color:${text};vertical-align:middle;line-height:1.2;">
                  ${truck} <span style="margin-left:4px;">${shippingText}</span>
                </span>
                <span style="font-size:11px;color:#64748b;margin-left:6px;vertical-align:middle;white-space:nowrap;">
                  &bull; ${dispatchText}
                </span>
              </td>
              <td align="right" valign="middle" style="white-space:nowrap;padding-left:8px;box-sizing:border-box;">
                <span style="font-size:9px;font-weight:800;color:#16a34a;background:#dcfce7;padding:2px 6px;border-radius:10px;white-space:nowrap;">
                  ✓ Tracked
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. WHITE GLOVE SECURITY (Insured Fragile Parcel with Bubble Armor Seal)
// Guarantees shockproof packaging, protective boxing & transit insurance
// ─────────────────────────────────────────────────────────────────────────────
function variantWhiteGloveSecurity(p: any, id: string): string {
    const shippingText = getShippingText(p)
    const locationText = getLocationText(p)
    const bg = p.bgColor || '#ffffff'
    const text = p.textColor || '#0f172a'
    const shield = getShieldCheckSvg('#16a34a', 18)

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:Arial,sans-serif;background-color:${bg};border:1px solid #bbf7d0;border-radius:8px;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 12, 14, 12, 14)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <!-- Shield Check on Left -->
              <td width="36" valign="middle" style="width:36px;padding-right:10px;box-sizing:border-box;">
                <div style="width:32px;height:32px;border-radius:50%;background:#f0fdf4;border:1px solid #86efac;text-align:center;line-height:30px;display:inline-block;">
                  ${shield}
                </div>
              </td>
              <!-- Content -->
              <td valign="middle" style="box-sizing:border-box;">
                <div style="font-size:12.5px;font-weight:800;color:${text};line-height:1.2;margin-bottom:3px;">
                  ${shippingText} &bull; <span style="font-size:11px;color:#16a34a;font-weight:700;">Insured &amp; Signed</span>
                </div>
                <div style="font-size:11px;color:#475569;line-height:1.35;word-break:break-word;">
                  Packaged in Shockproof Armor &bull; ${locationText}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant Registry Array
// ─────────────────────────────────────────────────────────────────────────────

export const shippingInfoVariants: BlockVariant[] = [
    {
        id: 'ship-classic-card',
        label: 'Classic Card',
        description: 'Current Baseline: Green accent stripe card with truck icon & dispatch info (100% same to same)',
        toHtml: variantClassicCard,
    },
    {
        id: 'ship-three-pillar-strip',
        label: '3-Pillar Logistics',
        description: 'Triple column micro-grid highlighting Same-Day Cutoff, 1-2 Day Transit & Insured Boxed',
        toHtml: variantThreePillarStrip,
    },
    {
        id: 'ship-dispatch-cutoff-bar',
        label: 'Cutoff Countdown',
        description: 'High-urgency Amber warehouse cutoff ribbon: "Order Before 3PM for Same-Day Dispatch"',
        toHtml: variantDispatchCutoffBar,
    },
    {
        id: 'ship-carrier-post-ticket',
        label: 'Postal Waybill',
        description: 'Courier transit waybill styling with dashed perimeter, tracked stamp & barcode badge',
        toHtml: variantCarrierPostTicket,
    },
    {
        id: 'ship-stepper-timeline',
        label: 'Transit Stepper',
        description: 'Visual 3-step logistics progress flow: [Ordered] → [Dispatched] → [At Your Door]',
        toHtml: variantStepperTimeline,
    },
    {
        id: 'ship-dark-obsidian-cargo',
        label: 'Dark Obsidian',
        description: 'Midnight high-contrast tech freight strip with cyan verified badge for motors & tools',
        toHtml: variantDarkObsidianCargo,
    },
    {
        id: 'ship-minimalist-swiss',
        label: 'Minimal Swiss',
        description: 'Scandinavian luxury editorial ledger with clean 1px hairlines for watches & fashion',
        toHtml: variantMinimalistSwiss,
    },
    {
        id: 'ship-warehouse-direct',
        label: 'Local Depot',
        description: 'Domestic local warehouse assurance with green verified depot badge',
        toHtml: variantWarehouseDirect,
    },
    {
        id: 'ship-compact-capsule',
        label: 'Compact Capsule',
        description: 'Ultra-dense 0-scroll rounded pill for quick-scrolling mobile buyers',
        toHtml: variantCompactCapsule,
    },
    {
        id: 'ship-white-glove-security',
        label: 'Shockproof Armor',
        description: 'Insured fragile parcel guarantee with tamper-evident seal & protective box proof',
        toHtml: variantWhiteGloveSecurity,
    },
]

// Aliases for block system compatibility
export const shippingVariants = shippingInfoVariants

export function getShippingInfoVariant(variantId: string): BlockVariant {
    const found = shippingInfoVariants.find(v => v.id === variantId)
    return found ?? shippingInfoVariants[0]
}
