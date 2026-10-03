// components/ui/VisualEditor/variants/international_shipping.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// International Shipping — 10 High-Converting, Professional eBay Retail Variants
// Engineered for eBay listing templates to eliminate customs fee disputes,
// build cross-border buyer confidence, prevent "Item Not Received" claims,
// and guarantee smooth worldwide delivery across all continents.
//
// Focus: Clean typography, durable table-based HTML, zero AI-slop, zero glassy filters.
//
// 1.  is-classic-amber-notice       — Current warm amber notice with globe icon & duties disclaimer (KEPT 100% SAME)
// 2.  is-global-courier-track       — Cobalt express courier matrix with flight transit indicator & live tracking
// 3.  is-official-customs-declaration — Formal CN22/CN23 customs manifest ledger with inspection seal
// 4.  is-ebay-eis-managed-hub       — eBay International Shipping (eIS) certified hub protection banner
// 5.  is-minimalist-hairline-slate  — Clean Scandinavian white card with 3px solid ocean-blue left anchor
// 6.  is-duty-free-ioss-compliance  — EU/UK IOSS tax threshold card with zero double-charge guarantee
// 7.  is-stepper-transit-timeline   — 3-stage milestone path: Origin -> Customs Clearance -> Doorstep
// 8.  is-industrial-heavy-freight   — Gunmetal & amber logistics card for auto parts, machinery & equipment
// 9.  is-luxury-concierge-dossier   — High-value insured air courier with gold hairline accents & signature release
// 10. is-compact-pill-bullet        — Ultra-compact mobile-first travel ribbon engineered for smartphone screens
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

function resolveBg(p: any, fallback = '#fff7ed'): string {
    return p.bgColor ?? fallback
}

function resolveTextCol(p: any, fallback = '#9a3412'): string {
    return p.textColor ?? p.color ?? fallback
}

function resolveHeadingCol(p: any, fallback = '#c2410c'): string {
    return p.headingColor ?? p.titleColor ?? fallback
}

function resolveAccentCol(p: any, fallback = '#ea580c'): string {
    return p.accentColor ?? fallback
}

function resolveHeading(p: any, fallback = 'International Buyers — Import Duties Notice'): string {
    return p.heading ?? p.title ?? p.headingText ?? fallback
}

function resolveText(p: any, fallback = "Import duties and taxes are not included in the price. These are the buyer's responsibility. Please check your country's customs rules before purchasing."): string {
    return p.text ?? p.noticeText ?? p.subText ?? fallback
}

function resolveBorder(p: any, defaultBorder = 'border:1px solid #fed7aa;'): string {
    if (p.showBorder === false) return 'border:none;'
    const color = p.borderColor ?? '#fed7aa'
    return `border:1px solid ${color};`
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLASSIC AMBER NOTICE (CURRENT STYLE — KEPT 100% IDENTICAL)
// ─────────────────────────────────────────────────────────────────────────────
function classicAmberNotice(p: any, id: string): string {
    const bgCol = resolveBg(p, '#fff7ed')
    const border = resolveBorder(p, 'border:1px solid #fed7aa;')
    const heading = resolveHeading(p, 'International Buyers — Import Duties Notice')
    const headingCol = resolveHeadingCol(p, '#c2410c')
    const text = resolveText(p, "Import duties and taxes are not included in the price. These are the buyer's responsibility. Please check your country's customs rules before purchasing.")
    const textCol = resolveTextCol(p, '#9a3412')

    return `<!--[riazify:international_shipping:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}${border}border-radius:8px;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td width="32" valign="top" style="padding-right:10px;font-size:18px;line-height:1;width:32px;">
            &#127760;
          </td>
          <td valign="top" style="vertical-align:top;">
            <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${headingCol};line-height:1.4;">
              ${heading}
            </p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${textCol};line-height:1.6;">
              ${text}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GLOBAL COURIER TRACK (DHL/FedEx Air Transit Priority Matrix)
// High-reassurance express aviation tracking for overseas buyers
// ─────────────────────────────────────────────────────────────────────────────
function globalCourierTrack(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const heading = resolveHeading(p, 'Worldwide Express Shipping — Fully Tracked')
    const text = resolveText(p, 'Shipped via priority international air courier with full tracking from dispatch to your door. Customs paperwork completed accurately for rapid clearance.')

    return `<!--[riazify:international_shipping:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid #cbd5e1;border-radius:8px;${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <!-- Courier Header Row -->
          <td style="padding-bottom:10px;border-bottom:1px solid #f1f5f9;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align:middle;">
                  <span style="background-color:#0284c7;color:#ffffff;font-size:10px;font-weight:800;padding:3px 8px;border-radius:4px;letter-spacing:0.8px;text-transform:uppercase;">
                    &#9992; GLOBAL AIR TRANSIT
                  </span>
                </td>
                <td align="right" style="vertical-align:middle;font-size:11px;font-weight:700;color:#0284c7;">
                  DOOR-TO-DOOR TRACKING
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding-top:12px;">
            <p style="margin:0 0 6px;font-size:14px;font-weight:800;color:#0f172a;line-height:1.3;">
              ${heading}
            </p>
            <p style="margin:0 0 10px;font-size:12px;color:#475569;line-height:1.6;">
              ${text}
            </p>
            <!-- Courier Badge Indicators -->
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td style="background-color:#f8fafc;border:1px solid #e2e8f0;padding:4px 8px;border-radius:4px;font-size:11px;color:#334155;font-weight:600;padding-right:12px;">
                  &#10003; Commercial Invoice Included
                </td>
                <td style="width:8px;"></td>
                <td style="background-color:#f8fafc;border:1px solid #e2e8f0;padding:4px 8px;border-radius:4px;font-size:11px;color:#334155;font-weight:600;">
                  &#10003; Online Milestone Updates
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
// 3. OFFICIAL CUSTOMS DECLARATION (CN22/CN23 Customs Manifest Ledger)
// Official government & postal border clearance formatting for total transparency
// ─────────────────────────────────────────────────────────────────────────────
function officialCustomsDeclaration(p: any, id: string): string {
    const bgCol = resolveBg(p, '#fffdfa')
    const heading = resolveHeading(p, 'Official Export & Customs Notice')
    const text = resolveText(p, 'All export consignments are accompanied by official CN22/CN23 declarations. Harmonized tariff codes and item descriptions are declared strictly according to customs legislation.')

    return `<!--[riazify:international_shipping:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};border:1.5px dashed #d6d3d1;border-radius:6px;${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <!-- Manifest Header Banner -->
          <td style="background-color:#f5f5f4;padding:6px 12px;border:1px solid #e7e5e4;border-radius:4px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:800;color:#44403c;letter-spacing:0.5px;">
                  EXPORT CLEARANCE PROTOCOL · CN22/CN23
                </td>
                <td align="right" style="font-family:'Courier New',Courier,monospace;font-size:10px;font-weight:700;color:#78716c;">
                  STATUS: VERIFIED
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding-top:12px;">
            <p style="margin:0 0 5px;font-size:13px;font-weight:800;color:#1c1917;">
              ${heading}
            </p>
            <p style="margin:0 0 10px;font-size:12px;color:#57534e;line-height:1.6;">
              ${text}
            </p>
            <p style="margin:0;font-size:11px;color:#78716c;font-style:italic;line-height:1.4;">
              * Note: Local clearance procedures, brokerage handling, and statutory tariffs remain under destination jurisdiction.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. EBAY EIS MANAGED HUB (eBay International Shipping Program Protection)
// Highlights eBay's official central international distribution hub guarantee
// ─────────────────────────────────────────────────────────────────────────────
function ebayEisManagedHub(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const heading = resolveHeading(p, 'eBay International Shipping — Guaranteed Delivery')
    const text = resolveText(p, 'Dispatched via eBay Managed International Shipping. Once safely received at eBay domestic processing center, eBay manages global customs, air transit, and final delivery protection.')

    return `<!--[riazify:international_shipping:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid #bfdbfe;border-radius:8px;${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <!-- Hub Shield Icon -->
          <td width="36" valign="top" style="width:36px;padding-right:12px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:32px;height:32px;background-color:#eff6ff;color:#2563eb;border-radius:8px;text-align:center;line-height:32px;font-size:16px;border:1px solid #dbeafe;">
                  &#128737;
                </td>
              </tr>
            </table>
          </td>
          <td valign="top">
            <div style="margin-bottom:4px;">
              <span style="background-color:#dbeafe;color:#1e40af;font-size:10px;font-weight:800;padding:2px 7px;border-radius:4px;letter-spacing:0.5px;text-transform:uppercase;">
                EBAY MANAGED DISPATCH
              </span>
            </div>
            <p style="margin:0 0 5px;font-size:14px;font-weight:800;color:#0f172a;line-height:1.3;">
              ${heading}
            </p>
            <p style="margin:0;font-size:12px;color:#334155;line-height:1.6;">
              ${text}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. MINIMALIST HAIRLINE SLATE (Clean Scandinavian Studio Design)
// Crisp white card with 3px solid ocean-blue left anchor and balanced tracking
// ─────────────────────────────────────────────────────────────────────────────
function minimalistHairlineSlate(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const heading = resolveHeading(p, 'International Dispatch & Customs Guidelines')
    const text = resolveText(p, 'Worldwide shipping available. Please allow standard international transit times depending on destination customs clearance.')
    const accent = resolveAccentCol(p, '#0284c7')

    return `<!--[riazify:international_shipping:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid #e2e8f0;border-left:3.5px solid ${accent};border-radius:4px;${pad(p, 14, 20, 14, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td>
            <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f172a;line-height:1.4;">
              ${heading}
            </p>
            <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">
              ${text}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. DUTY FREE IOSS COMPLIANCE (EU & UK Post-Brexit Tax Threshold Card)
// Reassures buyers on VAT collection at checkout under £135 / €150 thresholds
// ─────────────────────────────────────────────────────────────────────────────
function dutyFreeIossCompliance(p: any, id: string): string {
    const bgCol = resolveBg(p, '#f0fdf4')
    const heading = resolveHeading(p, 'EU & UK Import VAT Paid at Checkout (IOSS Compliant)')
    const text = resolveText(p, 'For orders under statutory thresholds (£135 UK / €150 EU), eBay automatically collects VAT at point of sale. No unexpected customs release fee upon delivery.')

    return `<!--[riazify:international_shipping:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid #bbf7d0;border-radius:8px;${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <!-- Verified Pip -->
          <td width="28" valign="top" style="width:28px;padding-right:10px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:24px;height:24px;background-color:#16a34a;color:#ffffff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:800;">
                  &#10003;
                </td>
              </tr>
            </table>
          </td>
          <td valign="top">
            <p style="margin:0 0 5px;font-size:13px;font-weight:800;color:#166534;line-height:1.3;">
              ${heading}
            </p>
            <p style="margin:0;font-size:12px;color:#15803d;line-height:1.6;">
              ${text}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. STEPPER TRANSIT TIMELINE (3-Stage Milestone Path: 1 -> 2 -> 3)
// Visual progression from dispatch through export customs to final delivery
// ─────────────────────────────────────────────────────────────────────────────
function stepperTransitTimeline(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const heading = resolveHeading(p, 'International Shipment Progression')

    return `<!--[riazify:international_shipping:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid #e2e8f0;border-radius:8px;${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:800;color:#0f172a;">
        ${heading}
      </p>
      <!-- Stepper Columns -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <!-- Stage 1 -->
          <td width="30%" valign="top" style="background-color:#f8fafc;padding:10px;border-radius:6px;border:1px solid #e2e8f0;">
            <p style="margin:0 0 2px;font-size:10px;font-weight:800;color:#2563eb;text-transform:uppercase;">
              STEP 1: DISPATCH
            </p>
            <p style="margin:0;font-size:11px;color:#334155;font-weight:600;">
              Packed with CN22 customs slip within 24h
            </p>
          </td>
          <!-- Arrow -->
          <td width="5%" align="center" style="font-size:14px;color:#94a3b8;font-weight:bold;">
            &rarr;
          </td>
          <!-- Stage 2 -->
          <td width="30%" valign="top" style="background-color:#f8fafc;padding:10px;border-radius:6px;border:1px solid #e2e8f0;">
            <p style="margin:0 0 2px;font-size:10px;font-weight:800;color:#0284c7;text-transform:uppercase;">
              STEP 2: TRANSIT
            </p>
            <p style="margin:0;font-size:11px;color:#334155;font-weight:600;">
              Fast air courier with export clearance
            </p>
          </td>
          <!-- Arrow -->
          <td width="5%" align="center" style="font-size:14px;color:#94a3b8;font-weight:bold;">
            &rarr;
          </td>
          <!-- Stage 3 -->
          <td width="30%" valign="top" style="background-color:#f0fdf4;padding:10px;border-radius:6px;border:1px solid #bbf7d0;">
            <p style="margin:0 0 2px;font-size:10px;font-weight:800;color:#16a34a;text-transform:uppercase;">
              STEP 3: ARRIVAL
            </p>
            <p style="margin:0;font-size:11px;color:#15803d;font-weight:600;">
              Handed to destination carrier for delivery
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. INDUSTRIAL HEAVY FREIGHT (Gunmetal Logistics Card for Auto & Machinery)
// Heavy equipment & industrial parts packaging standard for overseas freight
// ─────────────────────────────────────────────────────────────────────────────
function industrialHeavyFreight(p: any, id: string): string {
    const heading = resolveHeading(p, 'Heavy Cargo & Industrial Export Packaging')
    const text = resolveText(p, 'Reinforced export-grade packaging engineered for international palletized handling. HS tariff codes and commercial documentation affixed to exterior.')

    return `<!--[riazify:international_shipping:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:#0f172a;border-left:4px solid #f59e0b;border-radius:4px;${pad(p, 14, 18, 14, 18)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td>
            <div style="margin-bottom:4px;">
              <span style="font-family:'Courier New',Courier,monospace;font-size:10px;font-weight:700;color:#f59e0b;letter-spacing:0.8px;">
                FREIGHT CARGO SPEC · EXPORT CLASS A
              </span>
            </div>
            <p style="margin:0 0 5px;font-size:13px;font-weight:800;color:#f8fafc;line-height:1.4;">
              ${heading}
            </p>
            <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
              ${text}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. LUXURY CONCIERGE DOSSIER (High-Value Insured Air Courier)
// Tailored for luxury watches, designer jewellery, and rare collectibles
// ─────────────────────────────────────────────────────────────────────────────
function luxuryConciergeDossier(p: any, id: string): string {
    const bgCol = resolveBg(p, '#fafaf9')
    const heading = resolveHeading(p, 'Fully Insured International Priority Transit')
    const text = resolveText(p, 'All luxury consignments travel via dedicated express air transport with signature required upon release. Complete declared value insurance provided.')

    return `<!--[riazify:international_shipping:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;font-family:Georgia,'Times New Roman',serif;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid #e7e5e4;border-top:2px solid #b45309;${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td align="center" style="padding-bottom:6px;">
            <span style="font-family:Arial,sans-serif;font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#b45309;">
              ✦ CONCIERGE AIR TRANSIT ✦
            </span>
          </td>
        </tr>
        <tr>
          <td align="center">
            <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#1c1917;line-height:1.3;font-style:italic;">
              ${heading}
            </p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#78716c;line-height:1.6;max-width:560px;">
              ${text}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. COMPACT PILL BULLET (Ultra-Compact Mobile-First Travel Ribbon)
// Single compact row with bullet separators engineered for 375px mobile screens
// ─────────────────────────────────────────────────────────────────────────────
function compactPillBullet(p: any, id: string): string {
    const bgCol = resolveBg(p, '#f8fafc')
    const heading = resolveHeading(p, 'Worldwide Shipping')
    const text = resolveText(p, 'Customs & duties buyer responsibility • Fast tracked air dispatch')

    return `<!--[riazify:international_shipping:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:700px;margin:0 auto;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid #e2e8f0;border-radius:6px;${pad(p, 10, 14, 10, 14)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="font-size:12px;color:#0f172a;line-height:1.4;">
            <strong style="color:#0284c7;">&#127757; ${heading}:</strong>
            <span style="color:#475569;margin-left:4px;">${text}</span>
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

export const INTERNATIONAL_SHIPPING_THUMBNAILS: Record<string, string> = {
    // 1. Classic Amber Notice
    'is-classic-amber-notice': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="8" width="68" height="32" rx="4" fill="#fff7ed" stroke="#fed7aa" stroke-width="1"/>
    <circle cx="15" cy="24" r="5" fill="#ea580c" fill-opacity="0.2" stroke="#ea580c" stroke-width="0.8"/>
    <line x1="24" y1="20" x2="66" y2="20" stroke="#c2410c" stroke-width="1.8"/>
    <line x1="24" y1="26" x2="58" y2="26" stroke="#9a3412" stroke-width="1.2"/>
  </svg>`,

    // 2. Global Courier Track
    'is-global-courier-track': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="6" y="8" width="22" height="6" rx="2" fill="#0284c7"/>
    <line x1="6" y1="19" x2="48" y2="19" stroke="#0f172a" stroke-width="1.8"/>
    <line x1="6" y1="26" x2="68" y2="26" stroke="#64748b" stroke-width="1.2"/>
    <rect x="6" y="32" width="24" height="6" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="34" y="32" width="24" height="6" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
  </svg>`,

    // 3. Official Customs Declaration
    'is-official-customs-declaration': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#fffdfa" stroke="#d6d3d1" stroke-width="1.5" stroke-dasharray="2 1.5"/>
    <rect x="6" y="8" width="68" height="8" rx="2" fill="#f5f5f4"/>
    <line x1="10" y1="12" x2="38" y2="12" stroke="#44403c" stroke-width="1.2"/>
    <line x1="8" y1="22" x2="46" y2="22" stroke="#1c1917" stroke-width="1.8"/>
    <line x1="8" y1="28" x2="68" y2="28" stroke="#78716c" stroke-width="1.2"/>
    <line x1="8" y1="36" x2="52" y2="36" stroke="#a8a29e" stroke-width="1"/>
  </svg>`,

    // 4. eBay eIS Managed Hub
    'is-ebay-eis-managed-hub': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#bfdbfe" stroke-width="1"/>
    <rect x="6" y="14" width="14" height="20" rx="3" fill="#eff6ff" stroke="#dbeafe" stroke-width="0.8"/>
    <rect x="25" y="12" width="20" height="5" rx="1.5" fill="#dbeafe"/>
    <line x1="25" y1="22" x2="68" y2="22" stroke="#0f172a" stroke-width="1.8"/>
    <line x1="25" y1="29" x2="62" y2="29" stroke="#334155" stroke-width="1.2"/>
  </svg>`,

    // 5. Minimalist Hairline Slate
    'is-minimalist-hairline-slate': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="12" width="3" height="24" rx="1" fill="#0284c7"/>
    <line x1="14" y1="20" x2="56" y2="20" stroke="#0f172a" stroke-width="1.8"/>
    <line x1="14" y1="27" x2="70" y2="27" stroke="#64748b" stroke-width="1.2"/>
  </svg>`,

    // 6. Duty Free IOSS Compliance
    'is-duty-free-ioss-compliance': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#bbf7d0" stroke-width="1"/>
    <rect x="6" y="8" width="68" height="32" rx="4" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
    <circle cx="15" cy="24" r="5" fill="#16a34a"/>
    <line x1="24" y1="20" x2="68" y2="20" stroke="#166534" stroke-width="1.8"/>
    <line x1="24" y1="27" x2="60" y2="27" stroke="#15803d" stroke-width="1.2"/>
  </svg>`,

    // 7. Stepper Transit Timeline
    'is-stepper-transit-timeline': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="8" y1="12" x2="38" y2="12" stroke="#0f172a" stroke-width="1.8"/>
    <rect x="6" y="18" width="20" height="18" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="30" y="18" width="20" height="18" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="54" y="18" width="20" height="18" rx="2" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="0.8"/>
  </svg>`,

    // 8. Industrial Heavy Freight
    'is-industrial-heavy-freight': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#0f172a"/>
    <rect x="6" y="10" width="3" height="28" rx="1" fill="#f59e0b"/>
    <line x1="14" y1="15" x2="38" y2="15" stroke="#f59e0b" stroke-width="1.2"/>
    <line x1="14" y1="22" x2="66" y2="22" stroke="#f8fafc" stroke-width="1.8"/>
    <line x1="14" y1="29" x2="56" y2="29" stroke="#94a3b8" stroke-width="1.2"/>
  </svg>`,

    // 9. Luxury Concierge Dossier
    'is-luxury-concierge-dossier': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#fafaf9" stroke="#e7e5e4" stroke-width="1"/>
    <line x1="6" y1="8" x2="74" y2="8" stroke="#b45309" stroke-width="1.5"/>
    <line x1="26" y1="15" x2="54" y2="15" stroke="#b45309" stroke-width="1"/>
    <line x1="16" y1="23" x2="64" y2="23" stroke="#1c1917" stroke-width="1.8"/>
    <line x1="20" y1="30" x2="60" y2="30" stroke="#78716c" stroke-width="1.2"/>
  </svg>`,

    // 10. Compact Pill Bullet
    'is-compact-pill-bullet': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="16" width="68" height="16" rx="3" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <circle cx="14" cy="24" r="2.5" fill="#0284c7"/>
    <line x1="20" y1="24" x2="40" y2="24" stroke="#0284c7" stroke-width="1.6"/>
    <circle cx="44" cy="24" r="1" fill="#94a3b8"/>
    <line x1="48" y1="24" x2="68" y2="24" stroke="#475569" stroke-width="1.2"/>
  </svg>`,
}

export function getInternationalShippingThumbnailSvg(id: string): string {
    const key = Object.keys(INTERNATIONAL_SHIPPING_THUMBNAILS).find(k => {
        const clean = id.toLowerCase().replace(/_/g, '-')
        const vClean = k.toLowerCase().replace(/_/g, '-')
        return k === id || vClean === clean || k.endsWith(clean) || id.endsWith(k)
    })
    return key ? INTERNATIONAL_SHIPPING_THUMBNAILS[key] : INTERNATIONAL_SHIPPING_THUMBNAILS['is-classic-amber-notice']
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const internationalShippingVariants: BlockVariant[] = [
    {
        id: 'is-classic-amber-notice',
        label: 'Classic Amber Notice',
        description: 'Current warm amber container with globe icon & customs duties disclaimer',
        thumbnail: INTERNATIONAL_SHIPPING_THUMBNAILS['is-classic-amber-notice'],
        toHtml(props, id) { return classicAmberNotice(props, id) },
    },
    {
        id: 'is-global-courier-track',
        label: 'Global Courier Track',
        description: 'Cobalt air courier matrix with transit badges & door-to-door tracking indicator',
        thumbnail: INTERNATIONAL_SHIPPING_THUMBNAILS['is-global-courier-track'],
        toHtml(props, id) { return globalCourierTrack(props, id) },
    },
    {
        id: 'is-official-customs-declaration',
        label: 'Customs Declaration Ledger',
        description: 'Formal CN22/CN23 customs manifest ledger with verification seal & border protocol',
        thumbnail: INTERNATIONAL_SHIPPING_THUMBNAILS['is-official-customs-declaration'],
        toHtml(props, id) { return officialCustomsDeclaration(props, id) },
    },
    {
        id: 'is-ebay-eis-managed-hub',
        label: 'eBay eIS Managed Hub',
        description: 'Official eBay International Shipping managed hub protection badge & guaranteed transit',
        thumbnail: INTERNATIONAL_SHIPPING_THUMBNAILS['is-ebay-eis-managed-hub'],
        toHtml(props, id) { return ebayEisManagedHub(props, id) },
    },
    {
        id: 'is-minimalist-hairline-slate',
        label: 'Minimalist Hairline Slate',
        description: 'Scandinavian clean white card with 3.5px solid ocean-blue left indicator bar',
        thumbnail: INTERNATIONAL_SHIPPING_THUMBNAILS['is-minimalist-hairline-slate'],
        toHtml(props, id) { return minimalistHairlineSlate(props, id) },
    },
    {
        id: 'is-duty-free-ioss-compliance',
        label: 'Duty-Free IOSS Compliance',
        description: 'EU & UK IOSS tax threshold card with zero double-charge delivery guarantee',
        thumbnail: INTERNATIONAL_SHIPPING_THUMBNAILS['is-duty-free-ioss-compliance'],
        toHtml(props, id) { return dutyFreeIossCompliance(props, id) },
    },
    {
        id: 'is-stepper-transit-timeline',
        label: 'Stepper Transit Timeline',
        description: '3-stage milestone progression path: Dispatch -> Transit -> Arrival',
        thumbnail: INTERNATIONAL_SHIPPING_THUMBNAILS['is-stepper-transit-timeline'],
        toHtml(props, id) { return stepperTransitTimeline(props, id) },
    },
    {
        id: 'is-industrial-heavy-freight',
        label: 'Industrial Heavy Freight',
        description: 'Charcoal & amber logistics card for machinery, auto parts & heavy export gear',
        thumbnail: INTERNATIONAL_SHIPPING_THUMBNAILS['is-industrial-heavy-freight'],
        toHtml(props, id) { return industrialHeavyFreight(props, id) },
    },
    {
        id: 'is-luxury-concierge-dossier',
        label: 'Luxury Concierge Dossier',
        description: 'Fine jewelry & luxury watch priority air courier with insurance & signature release',
        thumbnail: INTERNATIONAL_SHIPPING_THUMBNAILS['is-luxury-concierge-dossier'],
        toHtml(props, id) { return luxuryConciergeDossier(props, id) },
    },
    {
        id: 'is-compact-pill-bullet',
        label: 'Compact Pill Bullet',
        description: 'Ultra-compact mobile-first travel ribbon engineered for smartphone screens',
        thumbnail: INTERNATIONAL_SHIPPING_THUMBNAILS['is-compact-pill-bullet'],
        toHtml(props, id) { return compactPillBullet(props, id) },
    },
]

// Backwards-compatible aliases
export const internationalVariants = internationalShippingVariants
export const internationalShippingBlockVariants = internationalShippingVariants

export function getInternationalShippingVariant(id?: string): BlockVariant {
    if (!id) return internationalShippingVariants[0]
    return internationalShippingVariants.find(v => v.id === id) || internationalShippingVariants[0]
}
export const getInternationalVariant = getInternationalShippingVariant
