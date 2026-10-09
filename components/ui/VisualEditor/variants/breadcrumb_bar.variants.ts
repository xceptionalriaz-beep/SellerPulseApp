// components/ui/VisualEditor/variants/breadcrumb_bar.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Breadcrumb Bar — 10 High-Converting, Professional eBay Retail Variants
// Engineered for eBay listing templates to establish clear store hierarchy,
// orient mobile buyers, build seller authority, and drive category browsing.
//
// Focus: Clean typography, durable table-based HTML, zero AI-slop, zero glassy filters.
//
// 1.  bb-classic-inline              — Current clean inline breadcrumb with soft background & chevrons (KEPT 100% SAME)
// 2.  bb-segmented-ribbon-pills      — Dual-pill retail badges with micro home icon & directional flow
// 3.  bb-boutique-luxury-slash       — High-end luxury serif with elegant forward slashes & refined tracking
// 4.  bb-industrial-technical-spec   — Charcoal tech spec rail with monospace department code & OEM chevron
// 5.  bb-minimalist-hairline-accent  — Crisp Apple-style minimal rail with 3px solid accent left anchor
// 6.  bb-trust-certified-channel     — Top-Rated merchant trust badge with shield icon & verified emerald pip
// 7.  bb-bold-contrast-banner        — High-impact obsidian sports & gaming bar with double slash '//' flow
// 8.  bb-catalog-index-tab           — Department archive tab with subtle dot-leader connecting trail
// 9.  bb-stepper-progress-nav        — Step-by-step numbered node trail (Store -> Category -> Active Item)
// 10. bb-compact-dot-bullet          — Ultra-compact mobile-first bullet trail with tracked small-caps
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
  id: string
  label: string
  description: string
  thumbnail?: string
  toHtml: (props: any, id: string) => string
}

// ── Shared Helpers & Dynamic Resolvers ─────────────────────────────────────

function pad(p: any, defaultT = 14, defaultR = 20, defaultB = 14, defaultL = 20): string {
  const top = p.paddingTop ?? defaultT
  const right = p.paddingRight ?? defaultR
  const bottom = p.paddingBottom ?? defaultB
  const left = p.paddingLeft ?? defaultL
  return `padding:${top}px ${right}px ${bottom}px ${left}px;`
}

function resolveBg(p: any, fallback = '#f8f7ff'): string {
  return p.bgColor ?? fallback
}

function resolveTextCol(p: any, fallback = '#1e1535'): string {
  return p.textColor ?? p.color ?? fallback
}

function resolveSepCol(p: any, fallback = '#7530fb'): string {
  return p.separatorColor ?? p.accentColor ?? fallback
}

function resolveSeller(p: any): string {
  return p.sellerName ?? p.storeName ?? (p.preserveTokens ? '{{SELLER_NAME}}' : 'Trusted Seller')
}

function resolveCategory(p: any): string {
  return p.category ?? p.categoryName ?? (p.preserveTokens ? '{{ITEM_CATEGORY}}' : '{{ITEM_CATEGORY}}')
}

function resolveTitle(p: any): string {
  return p.productTitle ?? p.title ?? (p.preserveTokens ? '{{PRODUCT_TITLE}}' : 'Premium Product Sample Listing')
}

function resolveBorder(p: any, defaultBorder = 'border:1px solid #ede9fe;'): string {
  if (p.showBorder === false) return 'border:none;'
  const color = p.borderColor ?? '#ede9fe'
  return `border:1px solid ${color};`
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLASSIC INLINE (CURRENT STYLE — KEPT 100% IDENTICAL)
// ─────────────────────────────────────────────────────────────────────────────
function classicInline(p: any, id: string): string {
  const bgCol = resolveBg(p, '#f8f7ff')
  const textCol = resolveTextCol(p, '#1e1535')
  const sepCol = resolveSepCol(p, '#7530fb')
  const seller = resolveSeller(p)
  const category = resolveCategory(p)
  const title = resolveTitle(p)
  const border = resolveBorder(p, 'border:1px solid #ede9fe;')

  return `<!--[riazify:breadcrumb_bar:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td width="100%" style="width:100%;background-color:${bgCol};border-radius:0;${border}${pad(p, 16, 24, 16, 24)}box-sizing:border-box;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="font-size:13px;line-height:1.5;color:${textCol};">
            <span style="color:${textCol};font-weight:600;">${seller}</span>
            <span style="display:inline-block;padding:0 8px;color:${sepCol};font-weight:700;">&rsaquo;</span>
            <span style="color:${textCol};font-weight:600;">${category}</span>
            <span style="display:inline-block;padding:0 8px;color:${sepCol};font-weight:700;">&rsaquo;</span>
            <span style="color:${textCol};font-weight:700;">${title}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SEGMENTED RIBBON PILLS (Dual-Pill Retail Navigation Badges)
// High-converting retail badges for consumer electronics and department stores
// ─────────────────────────────────────────────────────────────────────────────
function segmentedRibbonPills(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveTextCol(p, '#1e1535')
  const accent = resolveSepCol(p, '#7530fb')
  const seller = resolveSeller(p)
  const category = resolveCategory(p)
  const title = resolveTitle(p)

  return `<!--[riazify:breadcrumb_bar:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td width="100%" style="width:100%;background-color:${bgCol};border:1px solid #e2e8f0;border-radius:0;${pad(p, 12, 16, 12, 16)}box-sizing:border-box;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <!-- Store Badge -->
          <td style="background-color:${accent};color:#ffffff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:0;letter-spacing:0.3px;white-space:nowrap;">
            &#8962; ${seller}
          </td>
          <!-- Separator arrow -->
          <td style="padding:0 8px;color:#94a3b8;font-size:14px;font-weight:700;">
            &rarr;
          </td>
          <!-- Category Badge -->
          <td style="background-color:#f1f5f9;color:#334155;font-size:11px;font-weight:700;padding:4px 10px;border-radius:0;border:1px solid #e2e8f0;white-space:nowrap;">
            ${category}
          </td>
          <!-- Separator arrow -->
          <td style="padding:0 8px;color:#94a3b8;font-size:14px;font-weight:700;">
            &rarr;
          </td>
          <!-- Active Item -->
          <td style="font-size:12px;font-weight:700;color:${textCol};line-height:1.4;">
            ${title}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. BOUTIQUE LUXURY SLASH (Editorial Small-Caps with Forward Slashes)
// Designed for watches, vintage, fine jewelry, designer apparel & luxury goods
// ─────────────────────────────────────────────────────────────────────────────
function boutiqueLuxurySlash(p: any, id: string): string {
  const bgCol = resolveBg(p, '#fafaf9')
  const textCol = resolveTextCol(p, '#1c1917')
  const accent = resolveSepCol(p, '#854d0e')
  const seller = resolveSeller(p)
  const category = resolveCategory(p)
  const title = resolveTitle(p)

  return `<!--[riazify:breadcrumb_bar:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:Georgia,'Times New Roman',serif;">
  <tr>
    <td width="100%" style="width:100%;background-color:${bgCol};border-top:1px solid #e7e5e4;border-bottom:1px solid #e7e5e4;${pad(p, 12, 18, 12, 18)}box-sizing:border-box;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:#78716c;font-weight:600;">
            ${seller}
          </td>
          <td style="padding:0 10px;color:${accent};font-size:12px;font-weight:400;font-family:Arial,sans-serif;">
            /
          </td>
          <td style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#78716c;font-weight:600;">
            ${category}
          </td>
          <td style="padding:0 10px;color:${accent};font-size:12px;font-weight:400;font-family:Arial,sans-serif;">
            /
          </td>
          <td style="font-size:12px;letter-spacing:0.8px;color:${textCol};font-weight:700;font-style:italic;">
            ${title}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. INDUSTRIAL TECHNICAL SPEC (OEM Auto Parts, Industrial & Tools Rail)
// High-authority gunmetal & amber aesthetic with monospace catalogue codes
// ─────────────────────────────────────────────────────────────────────────────
function industrialTechnicalSpec(p: any, id: string): string {
  const textCol = resolveTextCol(p, '#f8fafc')
  const accent = resolveSepCol(p, '#f59e0b')
  const seller = resolveSeller(p)
  const category = resolveCategory(p)
  const title = resolveTitle(p)

  return `<!--[riazify:breadcrumb_bar:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td width="100%" style="width:100%;background-color:#0f172a;border-left:4px solid ${accent};border-radius:0;${pad(p, 10, 16, 10, 16)}box-sizing:border-box;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <!-- Monospace Store Code -->
          <td style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:0.5px;">
            ORIGIN: <span style="color:#ffffff;">${seller}</span>
          </td>
          <!-- Tech Pointer -->
          <td style="padding:0 10px;color:${accent};font-size:10px;">
            &#9658;
          </td>
          <!-- Category Dept -->
          <td style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:0.5px;">
            DEPT: <span style="color:#ffffff;">${category}</span>
          </td>
          <!-- Tech Pointer -->
          <td style="padding:0 10px;color:${accent};font-size:10px;">
            &#9658;
          </td>
          <!-- Part / Item Spec Title -->
          <td style="font-size:12px;font-weight:700;color:${textCol};letter-spacing:0.2px;">
            ${title}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. MINIMALIST HAIRLINE ACCENT (Clean Scandinavian Studio Design)
// Crisp white container with 3px solid accent left anchor and airy typography
// ─────────────────────────────────────────────────────────────────────────────
function minimalistHairlineAccent(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveTextCol(p, '#0f172a')
  const accent = resolveSepCol(p, '#7530fb')
  const seller = resolveSeller(p)
  const category = resolveCategory(p)
  const title = resolveTitle(p)

  return `<!--[riazify:breadcrumb_bar:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td width="100%" style="width:100%;background-color:${bgCol};border:1px solid #e2e8f0;border-left:3px solid ${accent};border-radius:0;${pad(p, 12, 18, 12, 18)}box-sizing:border-box;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="font-size:12px;color:#64748b;font-weight:500;">
            ${seller}
          </td>
          <td style="padding:0 8px;color:#cbd5e1;font-size:12px;font-weight:700;">
            /
          </td>
          <td style="font-size:12px;color:#64748b;font-weight:600;">
            ${category}
          </td>
          <td style="padding:0 8px;color:#cbd5e1;font-size:12px;font-weight:700;">
            /
          </td>
          <td style="font-size:12px;font-weight:700;color:${textCol};">
            ${title}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. TRUST CERTIFIED CHANNEL (Official Verified Merchant Shield Rail)
// Emphasizes Top-Rated seller status, guaranteed dispatch & verified authenticity
// ─────────────────────────────────────────────────────────────────────────────
function trustCertifiedChannel(p: any, id: string): string {
  const bgCol = resolveBg(p, '#f0fdf4')
  const textCol = resolveTextCol(p, '#064e3b')
  const accent = resolveSepCol(p, '#10b981')
  const seller = resolveSeller(p)
  const category = resolveCategory(p)
  const title = resolveTitle(p)

  return `<!--[riazify:breadcrumb_bar:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td width="100%" style="width:100%;background-color:${bgCol};border:1px solid #bbf7d0;border-radius:0;${pad(p, 12, 16, 12, 16)}box-sizing:border-box;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <!-- Verified Shield Badge -->
          <td style="padding-right:10px;vertical-align:middle;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="background-color:${accent};color:#ffffff;font-size:10px;font-weight:800;padding:3px 7px;border-radius:0;letter-spacing:0.6px;text-transform:uppercase;">
                  &#10003; VERIFIED
                </td>
              </tr>
            </table>
          </td>
          <td style="font-size:12px;font-weight:700;color:${textCol};">
            ${seller}
          </td>
          <td style="padding:0 8px;color:#86efac;font-size:14px;font-weight:700;">
            &rsaquo;
          </td>
          <td style="font-size:12px;font-weight:600;color:#047857;">
            ${category}
          </td>
          <td style="padding:0 8px;color:#86efac;font-size:14px;font-weight:700;">
            &rsaquo;
          </td>
          <td style="font-size:12px;font-weight:700;color:${textCol};">
            ${title}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. BOLD CONTRAST BANNER (Obsidian Sports, Streetwear & Gaming Bar)
// Deep dark finish with energetic slash dividers for maximum visual presence
// ─────────────────────────────────────────────────────────────────────────────
function boldContrastBanner(p: any, id: string): string {
  const textCol = resolveTextCol(p, '#ffffff')
  const accent = resolveSepCol(p, '#38bdf8')
  const seller = resolveSeller(p)
  const category = resolveCategory(p)
  const title = resolveTitle(p)

  return `<!--[riazify:breadcrumb_bar:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td width="100%" style="width:100%;background-color:#18181b;border-radius:0;border:1px solid #27272a;${pad(p, 14, 18, 14, 18)}box-sizing:border-box;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#a1a1aa;">
            ${seller}
          </td>
          <td style="padding:0 10px;color:${accent};font-size:12px;font-weight:900;">
            //
          </td>
          <td style="font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#e4e4e7;">
            ${category}
          </td>
          <td style="padding:0 10px;color:${accent};font-size:12px;font-weight:900;">
            //
          </td>
          <td style="font-size:12px;font-weight:800;color:${textCol};letter-spacing:0.3px;">
            ${title}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. CATALOG INDEX TAB (Department Archive with Dot-Leader Connectors)
// Evokes library archives and high-trust collectors' catalogues
// ─────────────────────────────────────────────────────────────────────────────
function catalogIndexTab(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveTextCol(p, '#1e293b')
  const accent = resolveSepCol(p, '#7530fb')
  const seller = resolveSeller(p)
  const category = resolveCategory(p)
  const title = resolveTitle(p)

  return `<!--[riazify:breadcrumb_bar:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td width="100%" style="width:100%;background-color:${bgCol};border:1px solid #cbd5e1;border-radius:0;${pad(p, 12, 16, 12, 16)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <!-- Index Tag -->
          <td style="width:1%;white-space:nowrap;padding-right:12px;">
            <span style="background-color:#f8fafc;color:${accent};border:1px solid #e2e8f0;font-size:10px;font-weight:800;padding:3px 8px;border-radius:0;letter-spacing:0.8px;text-transform:uppercase;">
              CATALOG INDEX
            </span>
          </td>
          <!-- Hierarchy -->
          <td style="font-size:12px;color:#64748b;line-height:1.4;">
            <strong style="color:${textCol};">${seller}</strong>
            <span style="color:#94a3b8;padding:0 6px;">&bull;</span>
            <strong style="color:${textCol};">${category}</strong>
            <span style="color:#94a3b8;padding:0 6px;">&bull;</span>
            <span style="color:${accent};font-weight:700;">${title}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. STEPPER PROGRESS NAV (Active Stepped Hierarchy: 1 Store -> 2 Category -> 3 Item)
// Visually reinforces product lineage through clean numbered circular nodes
// ─────────────────────────────────────────────────────────────────────────────
function stepperProgressNav(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const textCol = resolveTextCol(p, '#0f172a')
  const accent = resolveSepCol(p, '#7530fb')
  const seller = resolveSeller(p)
  const category = resolveCategory(p)
  const title = resolveTitle(p)

  return `<!--[riazify:breadcrumb_bar:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td width="100%" style="width:100%;background-color:${bgCol};border:1px solid #e2e8f0;border-radius:0;${pad(p, 12, 16, 12, 16)}box-sizing:border-box;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <!-- Step 1 Node -->
          <td style="width:18px;height:18px;background-color:#f1f5f9;color:#64748b;font-size:10px;font-weight:800;border-radius:50%;text-align:center;line-height:18px;">
            1
          </td>
          <td style="padding:0 8px 0 6px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">
            ${seller}
          </td>
          <!-- Connector line -->
          <td style="padding:0 6px;color:#cbd5e1;font-size:12px;">
            &mdash;
          </td>
          <!-- Step 2 Node -->
          <td style="width:18px;height:18px;background-color:#f1f5f9;color:#64748b;font-size:10px;font-weight:800;border-radius:50%;text-align:center;line-height:18px;">
            2
          </td>
          <td style="padding:0 8px 0 6px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">
            ${category}
          </td>
          <!-- Connector line -->
          <td style="padding:0 6px;color:#cbd5e1;font-size:12px;">
            &mdash;
          </td>
          <!-- Step 3 Active Node -->
          <td style="width:18px;height:18px;background-color:${accent};color:#ffffff;font-size:10px;font-weight:800;border-radius:50%;text-align:center;line-height:18px;">
            3
          </td>
          <td style="padding-left:6px;font-size:12px;font-weight:700;color:${textCol};">
            ${title}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. COMPACT DOT BULLET (Ultra-Compact Mobile-First Route)
// Zero overflow on small smartphones, clean bullet separators & neutral tracking
// ─────────────────────────────────────────────────────────────────────────────
function compactDotBullet(p: any, id: string): string {
  const bgCol = resolveBg(p, '#f8fafc')
  const textCol = resolveTextCol(p, '#0f172a')
  const accent = resolveSepCol(p, '#7530fb')
  const seller = resolveSeller(p)
  const category = resolveCategory(p)
  const title = resolveTitle(p)

  return `<!--[riazify:breadcrumb_bar:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td width="100%" style="width:100%;background-color:${bgCol};border:1px solid #e2e8f0;border-radius:0;${pad(p, 10, 14, 10, 14)}box-sizing:border-box;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="font-size:11px;font-weight:600;color:#64748b;letter-spacing:0.5px;">
            ${seller}
          </td>
          <td style="padding:0 8px;color:${accent};font-size:13px;font-weight:900;">
            &bull;
          </td>
          <td style="font-size:11px;font-weight:600;color:#64748b;letter-spacing:0.5px;">
            ${category}
          </td>
          <td style="padding:0 8px;color:${accent};font-size:13px;font-weight:900;">
            &bull;
          </td>
          <td style="font-size:11px;font-weight:700;color:${textCol};letter-spacing:0.2px;">
            ${title}
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

export const BREADCRUMB_BAR_THUMBNAILS: Record<string, string> = {
  // 1. Classic Inline
  'bb-classic-inline': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#ede9fe" stroke-width="1"/>
    <rect x="6" y="16" width="68" height="16" rx="3" fill="#f8f7ff" stroke="#ede9fe" stroke-width="1"/>
    <line x1="12" y1="24" x2="26" y2="24" stroke="#64748b" stroke-width="1.8"/>
    <path d="M30 22l2 2-2 2" stroke="#7530fb" stroke-width="1.5"/>
    <line x1="36" y1="24" x2="50" y2="24" stroke="#64748b" stroke-width="1.8"/>
    <path d="M54 22l2 2-2 2" stroke="#7530fb" stroke-width="1.5"/>
    <line x1="60" y1="24" x2="68" y2="24" stroke="#1e1535" stroke-width="2"/>
  </svg>`,

  // 2. Segmented Ribbon Pills
  'bb-segmented-ribbon-pills': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="18" width="18" height="12" rx="3" fill="#7530fb"/>
    <line x1="10" y1="24" x2="20" y2="24" stroke="#ffffff" stroke-width="1.5"/>
    <path d="M27 24h4m-2-2l2 2-2 2" stroke="#94a3b8" stroke-width="1.2"/>
    <rect x="34" y="18" width="18" height="12" rx="3" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.8"/>
    <line x1="38" y1="24" x2="48" y2="24" stroke="#334155" stroke-width="1.5"/>
    <path d="M55 24h4m-2-2l2 2-2 2" stroke="#94a3b8" stroke-width="1.2"/>
    <line x1="62" y1="24" x2="74" y2="24" stroke="#0f172a" stroke-width="2"/>
  </svg>`,

  // 3. Boutique Luxury Slash
  'bb-boutique-luxury-slash': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e7e5e4" stroke-width="1"/>
    <line x1="6" y1="16" x2="74" y2="16" stroke="#e7e5e4" stroke-width="1"/>
    <line x1="6" y1="32" x2="74" y2="32" stroke="#e7e5e4" stroke-width="1"/>
    <line x1="10" y1="24" x2="24" y2="24" stroke="#78716c" stroke-width="1.5"/>
    <line x1="28" y1="28" x2="32" y2="20" stroke="#854d0e" stroke-width="1.2"/>
    <line x1="36" y1="24" x2="48" y2="24" stroke="#78716c" stroke-width="1.5"/>
    <line x1="52" y1="28" x2="56" y2="20" stroke="#854d0e" stroke-width="1.2"/>
    <line x1="60" y1="24" x2="70" y2="24" stroke="#1c1917" stroke-width="2"/>
  </svg>`,

  // 4. Industrial Technical Spec
  'bb-industrial-technical-spec': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#0f172a"/>
    <rect x="6" y="16" width="3" height="16" fill="#f59e0b"/>
    <line x1="13" y1="24" x2="26" y2="24" stroke="#94a3b8" stroke-width="1.5"/>
    <polygon points="30 22 34 24 30 26" fill="#f59e0b"/>
    <line x1="38" y1="24" x2="50" y2="24" stroke="#94a3b8" stroke-width="1.5"/>
    <polygon points="54 22 58 24 54 26" fill="#f59e0b"/>
    <line x1="62" y1="24" x2="74" y2="24" stroke="#f8fafc" stroke-width="2"/>
  </svg>`,

  // 5. Minimalist Hairline Accent
  'bb-minimalist-hairline-accent': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="16" width="3" height="16" fill="#7530fb"/>
    <line x1="14" y1="24" x2="28" y2="24" stroke="#64748b" stroke-width="1.5"/>
    <line x1="32" y1="27" x2="35" y2="21" stroke="#cbd5e1" stroke-width="1.2"/>
    <line x1="39" y1="24" x2="52" y2="24" stroke="#64748b" stroke-width="1.5"/>
    <line x1="56" y1="27" x2="59" y2="21" stroke="#cbd5e1" stroke-width="1.2"/>
    <line x1="63" y1="24" x2="74" y2="24" stroke="#0f172a" stroke-width="2"/>
  </svg>`,

  // 6. Trust Certified Channel
  'bb-trust-certified-channel': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#bbf7d0" stroke-width="1"/>
    <rect x="6" y="16" width="68" height="16" rx="3" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1"/>
    <rect x="9" y="19" width="8" height="10" rx="1.5" fill="#10b981"/>
    <line x1="21" y1="24" x2="34" y2="24" stroke="#064e3b" stroke-width="1.5"/>
    <path d="M38 22l2 2-2 2" stroke="#10b981" stroke-width="1.5"/>
    <line x1="44" y1="24" x2="56" y2="24" stroke="#047857" stroke-width="1.5"/>
    <path d="M60 22l2 2-2 2" stroke="#10b981" stroke-width="1.5"/>
    <line x1="65" y1="24" x2="71" y2="24" stroke="#064e3b" stroke-width="2"/>
  </svg>`,

  // 7. Bold Contrast Banner
  'bb-bold-contrast-banner': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#18181b"/>
    <line x1="10" y1="24" x2="24" y2="24" stroke="#a1a1aa" stroke-width="1.5"/>
    <line x1="27" y1="28" x2="30" y2="20" stroke="#38bdf8" stroke-width="1.5"/>
    <line x1="30" y1="28" x2="33" y2="20" stroke="#38bdf8" stroke-width="1.5"/>
    <line x1="37" y1="24" x2="49" y2="24" stroke="#e4e4e7" stroke-width="1.5"/>
    <line x1="52" y1="28" x2="55" y2="20" stroke="#38bdf8" stroke-width="1.5"/>
    <line x1="55" y1="28" x2="58" y2="20" stroke="#38bdf8" stroke-width="1.5"/>
    <line x1="62" y1="24" x2="72" y2="24" stroke="#ffffff" stroke-width="2"/>
  </svg>`,

  // 8. Catalog Index Tab
  'bb-catalog-index-tab': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="8" y="19" width="16" height="10" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="11" y1="24" x2="21" y2="24" stroke="#7530fb" stroke-width="1.2"/>
    <line x1="28" y1="24" x2="42" y2="24" stroke="#1e293b" stroke-width="1.5"/>
    <circle cx="46" cy="24" r="1" fill="#94a3b8"/>
    <line x1="50" y1="24" x2="62" y2="24" stroke="#1e293b" stroke-width="1.5"/>
    <circle cx="66" cy="24" r="1" fill="#94a3b8"/>
    <line x1="70" y1="24" x2="74" y2="24" stroke="#7530fb" stroke-width="2"/>
  </svg>`,

  // 9. Stepper Progress Nav
  'bb-stepper-progress-nav': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <circle cx="12" cy="24" r="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
    <line x1="20" y1="24" x2="28" y2="24" stroke="#cbd5e1" stroke-width="1.5"/>
    <circle cx="34" cy="24" r="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
    <line x1="42" y1="24" x2="50" y2="24" stroke="#cbd5e1" stroke-width="1.5"/>
    <circle cx="56" cy="24" r="4" fill="#7530fb"/>
    <line x1="64" y1="24" x2="74" y2="24" stroke="#0f172a" stroke-width="2"/>
  </svg>`,

  // 10. Compact Dot Bullet
  'bb-compact-dot-bullet': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="17" width="68" height="14" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="12" y1="24" x2="24" y2="24" stroke="#64748b" stroke-width="1.5"/>
    <circle cx="28" cy="24" r="1.5" fill="#7530fb"/>
    <line x1="32" y1="24" x2="46" y2="24" stroke="#64748b" stroke-width="1.5"/>
    <circle cx="50" cy="24" r="1.5" fill="#7530fb"/>
    <line x1="54" y1="24" x2="68" y2="24" stroke="#0f172a" stroke-width="1.8"/>
  </svg>`,
}

export function getBreadcrumbBarThumbnailSvg(id: string): string {
  const key = Object.keys(BREADCRUMB_BAR_THUMBNAILS).find(k => {
    const clean = id.toLowerCase().replace(/_/g, '-')
    const vClean = k.toLowerCase().replace(/_/g, '-')
    return k === id || vClean === clean || k.endsWith(clean) || id.endsWith(k)
  })
  return key ? BREADCRUMB_BAR_THUMBNAILS[key] : BREADCRUMB_BAR_THUMBNAILS['bb-classic-inline']
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const breadcrumbBarVariants: BlockVariant[] = [
  {
    id: 'bb-classic-inline',
    label: 'Classic Inline',
    description: 'Current clean inline trail with soft background container and accent chevrons',
    thumbnail: BREADCRUMB_BAR_THUMBNAILS['bb-classic-inline'],
    toHtml(props, id) { return classicInline(props, id) },
  },
  {
    id: 'bb-segmented-ribbon-pills',
    label: 'Segmented Ribbon Pills',
    description: 'Dual-pill retail badges with store home icon and directional flow arrows',
    thumbnail: BREADCRUMB_BAR_THUMBNAILS['bb-segmented-ribbon-pills'],
    toHtml(props, id) { return segmentedRibbonPills(props, id) },
  },
  {
    id: 'bb-boutique-luxury-slash',
    label: 'Boutique Luxury Slash',
    description: 'Editorial boutique serif with elegant forward slashes and small-caps tracking',
    thumbnail: BREADCRUMB_BAR_THUMBNAILS['bb-boutique-luxury-slash'],
    toHtml(props, id) { return boutiqueLuxurySlash(props, id) },
  },
  {
    id: 'bb-industrial-technical-spec',
    label: 'Industrial Spec Rail',
    description: 'Gunmetal tech rail with amber accents, monospace department codes & OEM chevrons',
    thumbnail: BREADCRUMB_BAR_THUMBNAILS['bb-industrial-technical-spec'],
    toHtml(props, id) { return industrialTechnicalSpec(props, id) },
  },
  {
    id: 'bb-minimalist-hairline-accent',
    label: 'Minimalist Hairline Accent',
    description: 'Scandinavian minimal white card with 3px solid accent left anchor bar',
    thumbnail: BREADCRUMB_BAR_THUMBNAILS['bb-minimalist-hairline-accent'],
    toHtml(props, id) { return minimalistHairlineAccent(props, id) },
  },
  {
    id: 'bb-trust-certified-channel',
    label: 'Trust Certified Channel',
    description: 'Top-Rated merchant trust badge with shield icon and verified green indicator',
    thumbnail: BREADCRUMB_BAR_THUMBNAILS['bb-trust-certified-channel'],
    toHtml(props, id) { return trustCertifiedChannel(props, id) },
  },
  {
    id: 'bb-bold-contrast-banner',
    label: 'Bold Contrast Banner',
    description: 'Deep obsidian sports & streetwear bar with energetic double slashes (//)',
    thumbnail: BREADCRUMB_BAR_THUMBNAILS['bb-bold-contrast-banner'],
    toHtml(props, id) { return boldContrastBanner(props, id) },
  },
  {
    id: 'bb-catalog-index-tab',
    label: 'Catalog Index Tab',
    description: 'Department archive tab with subtle dot-leader connectors for collectibles',
    thumbnail: BREADCRUMB_BAR_THUMBNAILS['bb-catalog-index-tab'],
    toHtml(props, id) { return catalogIndexTab(props, id) },
  },
  {
    id: 'bb-stepper-progress-nav',
    label: 'Stepper Progress Nav',
    description: 'Step-by-step numbered hierarchy nodes showing sequential catalogue depth',
    thumbnail: BREADCRUMB_BAR_THUMBNAILS['bb-stepper-progress-nav'],
    toHtml(props, id) { return stepperProgressNav(props, id) },
  },
  {
    id: 'bb-compact-dot-bullet',
    label: 'Compact Dot Bullet',
    description: 'Ultra-compact mobile-first bullet trail engineered for smartphone screens',
    thumbnail: BREADCRUMB_BAR_THUMBNAILS['bb-compact-dot-bullet'],
    toHtml(props, id) { return compactDotBullet(props, id) },
  },
]

// Backwards-compatible aliases
export const breadcrumbVariants = breadcrumbBarVariants
export const breadcrumbBarBlockVariants = breadcrumbBarVariants

export function getBreadcrumbBarVariant(id?: string): BlockVariant {
  if (!id) return breadcrumbBarVariants[0]
  return breadcrumbBarVariants.find(v => v.id === id) || breadcrumbBarVariants[0]
}
export const getBreadcrumbVariant = getBreadcrumbBarVariant
