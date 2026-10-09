// components/ui/VisualEditor/variants/quote_block.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Customer Quote Block (10 Professional Layout Styles)
//
// Solves eBay Buyer Skepticism through Authentic, High-Converting Social Proof:
// • Full-size 100% responsive width across desktop & mobile eBay listing containers
// • High-definition crisp vector SVG icons (replacing inconsistent emojis)
// • Zero blurry glassmorphism / AI-slop — grounded in proven, high-converting eCommerce typography
// • Pure eBay-compliant inline CSS and HTML table architecture (VeRO safe)
//
// 10 Distinct Layout Styles:
//   1.  qb-classic-accent-pillar      (Current Baseline — 100% SAME TO SAME with Full-Width 100% Responsive Fix)
//   2.  qb-verified-buyer-card        (Official eBay Verified Purchase Card with Inline Star Badge & Checkmark)
//   3.  qb-editorial-wall-street      (Wall Street Journal / Financial Times Editorial Pillar with Hairline Kicker)
//   4.  qb-speech-bubble-tail         (Conversational Buyer Speech Bubble with Directional Arrow & Avatar Badge)
//   5.  qb-nordic-minimal-brackets    (Scandinavian Luxury Minimalist with Hairline Top/Bottom Frame & Diamond Accent)
//   6.  qb-inspected-technician-dossier (Technical / Workshop Quality Inspection Seal with Monospace Kicker)
//   7.  qb-midnight-obsidian-gold     (Midnight Obsidian Luxury Flagship with Golden Quotation Marks)
//   8.  qb-split-ribbon-showcase      (Dual-Tone Split Ribbon: Left Bold Brand Pillar + Right Expanded Quote)
//   9.  qb-certified-guarantee-seal   (Wax Seal / Notary Trust Stamp with Circular Seal SVG Badge)
//   10. qb-compact-horizontal-ticker  (Mobile-First Compact Pill Strip with Inline Stars & Micro-Quote)
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockVariant } from './section_label.variants'

export interface QuoteBlockProps {
    variant?: string
    quoteText?: string
    text?: string
    quote?: string
    content?: string
    author?: string
    authorText?: string
    attribution?: string
    role?: string
    rating?: number
    date?: string
    badgeText?: string
    verified?: boolean
    quoteColor?: string
    textColor?: string
    accentColor?: string
    starColor?: string
    borderColor?: string
    bgColor?: string
    fontSize?: number
    paddingTop?: number
    paddingBottom?: number
    paddingLeft?: number
    paddingRight?: number
}

// ── Shared Vector SVG Icons (Crisp, High-Resolution, No Emojis) ─────────────

// 5 Golden Stars Vector SVG
function renderStarsSvg(rating: number = 5, color: string = '#f59e0b'): string {
    const stars: string[] = []
    for (let i = 0; i < 5; i++) {
        const isFilled = i < rating
        stars.push(`
      <svg width="14" height="14" viewBox="0 0 24 24" fill="${isFilled ? color : 'none'}" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:2px;">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    `)
    }
    return stars.join('')
}

// Checkmark Shield SVG (Verified Authenticity)
function renderVerifiedShieldSvg(color: string = '#16a34a', size: number = 16): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="M9 12l2 2 4-4"></path>
  </svg>`
}

// Quotation Mark Glyph SVG
function renderQuoteMarkSvg(color: string = '#7530fb', size: number = 28): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" style="display:inline-block;vertical-align:middle;">
    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
  </svg>`
}

// Quality Inspector Stamp SVG
function renderInspectorBadgeSvg(color: string = '#0ea5e9', size: number = 18): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>`
}

// ── Shared Helpers & Dynamic Resolvers ─────────────────────────────────────

function pad(p: any, defaultT = 16, defaultR = 24, defaultB = 16, defaultL = 24): string {
    const top = p.paddingTop ?? defaultT
    const right = p.paddingRight ?? defaultR
    const bottom = p.paddingBottom ?? defaultB
    const left = p.paddingLeft ?? defaultL
    return `padding:${top}px ${right}px ${bottom}px ${left}px;`
}

function resolveQuote(p: any, fallback = 'Excellent product, exactly as described. Fast delivery and great packaging.'): string {
    return p.quoteText ?? p.text ?? p.quote ?? p.content ?? fallback
}

function resolveAuthor(p: any, fallback = '— Verified Buyer'): string {
    return p.author ?? p.attribution ?? p.authorText ?? fallback
}

function resolveAccent(p: any, fallback = '#7530fb'): string {
    return p.accentColor ?? p.quoteLineColor ?? fallback
}

function resolveBg(p: any, fallback = '#f3eeff'): string {
    if (!p.bgColor || p.bgColor.toLowerCase() === '#f3eeff' || p.bgColor.toLowerCase() === '#ffffff') {
        return fallback
    }
    return p.bgColor
}

function resolveText(p: any, fallback = '#1f1d2e'): string {
    return p.textColor ?? fallback
}

function resolveBorder(p: any, fallback = '#ede9fe'): string {
    return p.borderColor ?? fallback
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLASSIC ACCENT PILLAR (CURRENT BASELINE — 100% IDENTICAL WITH 100% FULL-WIDTH FIX)
// Solves: Preserves current visual branding while fixing the 700px cut-off to full 100% container width.
// ─────────────────────────────────────────────────────────────────────────────
function classicAccentPillar(p: any, id: string): string {
    const bgCol = resolveBg(p, '#f3eeff')
    const textCol = resolveText(p, '#1f1d2e')
    const accentCol = resolveAccent(p, '#7530fb')
    const quote = resolveQuote(p)
    const author = resolveAuthor(p, '— Verified Buyer')
    const starsSvg = renderStarsSvg(5, '#f59e0b')

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 18, 24, 18, 24)}border-left:4px solid ${accentCol};box-sizing:border-box;">
      <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:24px;color:${accentCol};font-weight:700;line-height:1;">&ldquo;</p>
      <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${textCol};line-height:1.7;font-style:italic;">
        ${quote}
      </p>
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7280;font-weight:700;padding-right:8px;">
            ${author}
          </td>
          <td valign="middle">
            ${starsSvg}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. VERIFIED BUYER CARD (OFFICIAL EBAY VERIFIED PURCHASE CARD)
// Solves: Directly removes buyer fear of counterfeit, broken, or misdescribed items.
// ─────────────────────────────────────────────────────────────────────────────
function verifiedBuyerCard(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const borderCol = resolveBorder(p, '#e2e8f0')
    const textCol = resolveText(p, '#0f172a')
    const accentCol = resolveAccent(p, '#16a34a')
    const quote = resolveQuote(p, 'Item was brand new in original box, dispatched within hours. Will definitely buy again!')
    const author = resolveAuthor(p, 'Verified eBay Buyer')
    const shieldSvg = renderVerifiedShieldSvg('#16a34a', 15)
    const starsSvg = renderStarsSvg(5, '#f59e0b')

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid ${borderCol};border-radius:10px;${pad(p, 20, 24, 20, 24)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
        <tr>
          <td align="left" valign="middle">
            <span style="display:inline-block;background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:20px;padding:3px 10px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:${accentCol};letter-spacing:0.5px;">
              ${shieldSvg} <span style="vertical-align:middle;margin-left:4px;">VERIFIED EBAY TRANSACTION</span>
            </span>
          </td>
          <td align="right" valign="middle">
            ${starsSvg}
          </td>
        </tr>
      </table>
      <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${textCol};line-height:1.65;font-style:italic;">
        &ldquo;${quote}&rdquo;
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #f1f5f9;padding-top:8px;">
        <tr>
          <td align="left" style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#334155;">
            ${author} &bull; <span style="font-weight:400;color:#64748b;">Fast Tracked Courier</span>
          </td>
          <td align="right" style="font-family:Arial,sans-serif;font-size:11px;color:#94a3b8;font-weight:600;">
            100% Positive Feedback
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. EDITORIAL WALL STREET (WALL STREET JOURNAL / FINANCIAL TIMES PILLAR)
// Solves: Gives prestige & high-value gravitas for luxury, watches, tools, and electronics.
// ─────────────────────────────────────────────────────────────────────────────
function editorialWallStreet(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const textCol = resolveText(p, '#0f172a')
    const accentCol = resolveAccent(p, '#7530fb')
    const quote = resolveQuote(p, 'Uncompromising build quality and attention to detail. Every single order is inspected prior to dispatch.')
    const author = resolveAuthor(p, '— Founder & Lead Merchant')

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bgCol};border-left:5px solid ${accentCol};border-top:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9;border-right:1px solid #f1f5f9;${pad(p, 20, 24, 20, 24)}box-sizing:border-box;">
      <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:10px;font-weight:800;color:${accentCol};text-transform:uppercase;letter-spacing:2px;">
        STORE PHILOSOPHY &bull; QUALITY ASSURANCE PLEDGE
      </p>
      <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:17px;color:${textCol};line-height:1.65;font-style:italic;">
        &ldquo;${quote}&rdquo;
      </p>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#475569;">
        ${author} <span style="font-weight:400;color:#94a3b8;margin-left:6px;">&bull; Hand-Inspected &bull; Top Rated Seller</span>
      </p>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SPEECH BUBBLE TAIL (CONVERSATIONAL BUYER SPEECH BUBBLE WITH AVATAR BADGE)
// Solves: Emotional buyer connection — looks like a genuine, unedited user testimonial.
// ─────────────────────────────────────────────────────────────────────────────
function speechBubbleTail(p: any, id: string): string {
    const bgCol = resolveBg(p, '#f8fafc')
    const borderCol = resolveBorder(p, '#e2e8f0')
    const textCol = resolveText(p, '#1e293b')
    const accentCol = resolveAccent(p, '#7530fb')
    const quote = resolveQuote(p, 'Incredible service! Super fast delivery, perfectly packed and matched the photos 100%.')
    const author = resolveAuthor(p, 'Verified Buyer (eBay Top Buyer)')
    const starsSvg = renderStarsSvg(5, '#f59e0b')

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <!-- Speech Bubble Box -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bgCol};border:1px solid ${borderCol};border-radius:12px;box-sizing:border-box;">
        <tr>
          <td style="padding:18px 22px;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${textCol};line-height:1.65;">
              &ldquo;${quote}&rdquo;
            </p>
          </td>
        </tr>
      </table>
      <!-- Downward Arrow Pointer -->
      <table cellpadding="0" cellspacing="0" border="0" style="margin-left:36px;margin-bottom:6px;">
        <tr>
          <td style="width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid ${borderCol};font-size:0;line-height:0;"></td>
        </tr>
      </table>
      <!-- Author row with initials avatar -->
      <table cellpadding="0" cellspacing="0" border="0" style="margin-left:24px;">
        <tr>
          <td width="32" height="32" align="center" valign="middle" style="width:32px;height:32px;background-color:${accentCol};color:#ffffff;font-family:Arial,sans-serif;font-size:12px;font-weight:800;border-radius:50%;text-align:center;">
            VB
          </td>
          <td valign="middle" style="padding-left:10px;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#1e293b;">
              ${author}
            </p>
            <div style="margin-top:2px;">
              ${starsSvg}
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. NORDIC MINIMAL BRACKETS (SCANDINAVIAN LUXURY WITH HAIRLINE ACCENT FRAME)
// Solves: High-end lifestyle and designer aesthetic with zero visual clutter.
// ─────────────────────────────────────────────────────────────────────────────
function nordicMinimalBrackets(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const borderCol = resolveBorder(p, '#e2e8f0')
    const textCol = resolveText(p, '#1e1535')
    const accentCol = resolveAccent(p, '#7530fb')
    const quote = resolveQuote(p, 'Exceptional craftsmanship. Sourced with care, delivered with speed, guaranteed with confidence.')
    const author = resolveAuthor(p, '— Verified Buyer & Collector')

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 24, 28, 24, 28)}box-sizing:border-box;text-align:center;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="border-top:1px solid ${borderCol};font-size:1px;line-height:1px;">&nbsp;</td>
          <td width="50" align="center" style="font-family:Arial,sans-serif;font-size:10px;font-weight:800;color:${accentCol};text-transform:uppercase;letter-spacing:2px;padding:0 12px;white-space:nowrap;">
            &diams; PLEDGE &diams;
          </td>
          <td style="border-top:1px solid ${borderCol};font-size:1px;line-height:1px;">&nbsp;</td>
        </tr>
      </table>
      <div style="padding:16px 20px;">
        <p style="margin:0 0 10px;font-family:Georgia,serif;font-size:16px;color:${textCol};line-height:1.7;font-style:italic;">
          &ldquo;${quote}&rdquo;
        </p>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:${accentCol};letter-spacing:1px;text-transform:uppercase;">
          ${author}
        </p>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="border-bottom:1px solid ${borderCol};font-size:1px;line-height:1px;">&nbsp;</td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. INSPECTED TECHNICIAN DOSSIER (WORKSHOP QUALITY & TECHNICAL AUDIT)
// Solves: In auto parts, motors, computers, and tools: proves rigorous bench testing.
// ─────────────────────────────────────────────────────────────────────────────
function inspectedTechnicianDossier(p: any, id: string): string {
    const bgCol = resolveBg(p, '#f8fafc')
    const borderCol = resolveBorder(p, '#cbd5e1')
    const textCol = resolveText(p, '#0f172a')
    const accentCol = resolveAccent(p, '#0284c7')
    const quote = resolveQuote(p, 'Fully tested and validated to OEM specifications. Guaranteed ready for immediate installation.')
    const author = resolveAuthor(p, 'Certified Workshop Inspection Lead')
    const badgeSvg = renderInspectorBadgeSvg(accentCol, 16)

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bgCol};border:2px dashed ${borderCol};border-radius:8px;${pad(p, 18, 22, 18, 22)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
        <tr>
          <td align="left">
            <span style="font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:700;color:${accentCol};letter-spacing:1px;">
              ${badgeSvg} <span style="vertical-align:middle;margin-left:4px;">TECHNICAL AUDIT &bull; QC PASS</span>
            </span>
          </td>
          <td align="right" style="font-family:'Courier New',Courier,monospace;font-size:10px;font-weight:700;color:#64748b;">
            SERIAL VERIFIED
          </td>
        </tr>
      </table>
      <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${textCol};line-height:1.6;font-weight:600;">
        &ldquo;${quote}&rdquo;
      </p>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#475569;">
        <strong>${author}</strong> &bull; <span style="color:#059669;font-weight:700;">Zero Defect Guarantee</span>
      </p>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. MIDNIGHT OBSIDIAN GOLD (FLAGSHIP HIGH-CONTRAST FOR GAMING, TECH & MOTORS)
// Solves: Provides maximum contrast on dark or high-performance product listings.
// ─────────────────────────────────────────────────────────────────────────────
function midnightObsidianGold(p: any, id: string): string {
    const isCustomDarkBg = p.bgColor && !['#f3eeff', '#ffffff', '#f8f8f8', '#f8f7ff', 'transparent'].includes(p.bgColor.toLowerCase())
    const bgCol = isCustomDarkBg ? p.bgColor : '#0f172a'
    const textCol = (!p.textColor || p.textColor === '#1f1d2e') ? '#f8fafc' : p.textColor
    const accentCol = (!p.accentColor || p.accentColor === '#7530fb') ? '#f59e0b' : p.accentColor
    const quote = resolveQuote(p, 'The performance is insane. Packed securely with tamper-proof seal. Five stars without hesitation.')
    const author = resolveAuthor(p, '— Power Buyer & Enthusiast')
    const starsSvg = renderStarsSvg(5, accentCol)
    const quoteSvg = renderQuoteMarkSvg(accentCol, 24)

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid rgba(255,255,255,0.12);border-radius:10px;${pad(p, 20, 24, 20, 24)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
        <tr>
          <td align="left">
            ${quoteSvg}
          </td>
          <td align="right">
            ${starsSvg}
          </td>
        </tr>
      </table>
      <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${textCol};line-height:1.65;font-style:italic;">
        &ldquo;${quote}&rdquo;
      </p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:${accentCol};letter-spacing:0.5px;">
        ${author} <span style="font-weight:400;color:#94a3b8;margin-left:6px;">&bull; Verified Hardware Transaction</span>
      </p>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. SPLIT RIBBON SHOWCASE (ASYMMETRIC DUAL-TONE BRAND PILLAR + EXPANDED REVIEW)
// Solves: Draws fast visual focus for buyers skimming listings on mobile devices.
// ─────────────────────────────────────────────────────────────────────────────
function splitRibbonShowcase(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const borderCol = resolveBorder(p, '#ede9fe')
    const textCol = resolveText(p, '#1e1535')
    const accentCol = resolveAccent(p, '#7530fb')
    const quote = resolveQuote(p, 'Ordered on Tuesday, arrived on Wednesday morning. Outstanding communication and genuine parts.')
    const author = resolveAuthor(p, 'Verified eBay Feedback')
    const quoteSvg = renderQuoteMarkSvg('#ffffff', 24)
    const starsSvg = renderStarsSvg(5, '#f59e0b')

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid ${borderCol};border-radius:10px;overflow:hidden;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;">
        <tr>
          <!-- Left Ribbon -->
          <td width="72" align="center" valign="middle" style="width:72px;background-color:${accentCol};padding:18px 8px;text-align:center;">
            ${quoteSvg}
            <div style="margin-top:6px;font-family:Arial,sans-serif;font-size:10px;font-weight:900;color:#ffffff;letter-spacing:0.5px;text-align:center;">
              5.0 ★
            </div>
          </td>
          <!-- Right Content -->
          <td valign="middle" style="${pad(p, 16, 20, 16, 20)}">
            <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${textCol};line-height:1.6;font-style:italic;">
              &ldquo;${quote}&rdquo;
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="left" style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#475569;">
                  ${author}
                </td>
                <td align="right">
                  ${starsSvg}
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
// 9. CERTIFIED GUARANTEE SEAL (CIRCULAR WAX EMBLEM WITH NOTARY PLEDGE)
// Solves: Eliminates buyer purchase hesitation with ironclad risk reversal.
// ─────────────────────────────────────────────────────────────────────────────
function certifiedGuaranteeSeal(p: any, id: string): string {
    const bgCol = resolveBg(p, '#fbfcfe')
    const borderCol = resolveBorder(p, '#dbeafe')
    const textCol = resolveText(p, '#1e293b')
    const accentCol = resolveAccent(p, '#1d4ed8')
    const quote = resolveQuote(p, 'If your item does not arrive in 100% perfect working order, we issue a prompt replacement or immediate refund.')
    const author = resolveAuthor(p, 'Direct Seller Guarantee &bull; 30-Day Hassle-Free Returns')

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bgCol};border:2px solid ${borderCol};border-radius:10px;${pad(p, 18, 22, 18, 22)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <!-- Seal Emblem -->
          <td width="48" valign="top" style="width:48px;padding-right:14px;">
            <div style="width:44px;height:44px;background-color:#eff6ff;border:2px solid ${accentCol};border-radius:50%;text-align:center;line-height:44px;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${accentCol}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;">
                <circle cx="12" cy="8" r="6"></circle>
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"></path>
              </svg>
            </div>
          </td>
          <!-- Text Body -->
          <td valign="top">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:${accentCol};text-transform:uppercase;letter-spacing:1px;">
              OFFICIAL BUYER PROTECTION GUARANTEE
            </p>
            <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${textCol};line-height:1.6;font-style:italic;">
              &ldquo;${quote}&rdquo;
            </p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#64748b;">
              ${author}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. COMPACT HORIZONTAL TICKER (MOBILE-OPTIMIZED STREAMLINED CAPSULE STRIP)
// Solves: Ideal for zero-scroll buyers browsing on mobile eBay apps.
// ─────────────────────────────────────────────────────────────────────────────
function compactHorizontalTicker(p: any, id: string): string {
    const bgCol = resolveBg(p, '#ffffff')
    const borderCol = resolveBorder(p, '#e2e8f0')
    const textCol = resolveText(p, '#0f172a')
    const accentCol = resolveAccent(p, '#7530fb')
    const quote = resolveQuote(p, 'Top rated item, pristine condition and fast courier dispatch.')
    const author = resolveAuthor(p, 'Verified Buyer')
    const starsSvg = renderStarsSvg(5, '#f59e0b')

    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;table-layout:fixed;border-collapse:collapse;box-sizing:border-box;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid ${borderCol};border-radius:30px;${pad(p, 10, 18, 10, 18)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="85" valign="middle" style="width:85px;padding-right:10px;white-space:nowrap;">
            <span style="display:inline-block;background-color:#f3eeff;color:${accentCol};font-family:Arial,sans-serif;font-size:10px;font-weight:800;padding:3px 8px;border-radius:12px;letter-spacing:0.5px;">
              FEEDBACK
            </span>
          </td>
          <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${textCol};line-height:1.4;font-style:italic;">
            &ldquo;${quote}&rdquo;
          </td>
          <td width="160" align="right" valign="middle" style="width:160px;padding-left:12px;white-space:nowrap;">
            ${starsSvg}
            <span style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#64748b;margin-left:6px;">
              ${author}
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// THUMBNAILS (Crisp Vector SVG Previews for VisualEditor PropertiesPanel)
// ─────────────────────────────────────────────────────────────────────────────

export const quoteBlockThumbnails: Record<string, string> = {
    'qb-classic-accent-pillar': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#f3eeff"/>
    <rect x="0" y="0" width="4" height="48" fill="#7530fb"/>
    <path d="M12 14 Q14 10 16 14 M18 14 Q20 10 22 14" stroke="#7530fb" stroke-width="2" fill="none"/>
    <rect x="12" y="20" width="58" height="4" rx="2" fill="#1f1d2e"/>
    <rect x="12" y="27" width="44" height="3" rx="1.5" fill="#6b7280"/>
    <rect x="12" y="34" width="28" height="3" rx="1.5" fill="#7530fb"/>
  </svg>`,

    'qb-verified-buyer-card': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
    <rect x="8" y="8" width="28" height="6" rx="3" fill="#f0fdf4" stroke="#bbf7d0"/>
    <circle cx="68" cy="11" r="2" fill="#f59e0b"/>
    <circle cx="63" cy="11" r="2" fill="#f59e0b"/>
    <circle cx="58" cy="11" r="2" fill="#f59e0b"/>
    <rect x="8" y="20" width="64" height="4" rx="2" fill="#0f172a"/>
    <rect x="8" y="27" width="48" height="3" rx="1.5" fill="#64748b"/>
    <line x1="8" y1="36" x2="72" y2="36" stroke="#f1f5f9" stroke-width="1"/>
    <rect x="8" y="40" width="30" height="3" rx="1.5" fill="#334155"/>
  </svg>`,

    'qb-editorial-wall-street': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0"/>
    <rect x="0" y="0" width="5" height="48" fill="#7530fb"/>
    <rect x="12" y="10" width="32" height="3" rx="1.5" fill="#7530fb"/>
    <rect x="12" y="18" width="56" height="5" rx="2" fill="#0f172a"/>
    <rect x="12" y="26" width="46" height="4" rx="2" fill="#0f172a"/>
    <rect x="12" y="35" width="34" height="3" rx="1.5" fill="#64748b"/>
  </svg>`,

    'qb-speech-bubble-tail': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect x="6" y="6" width="68" height="26" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
    <path d="M18 32 L24 32 L20 37 Z" fill="#cbd5e1"/>
    <rect x="14" y="13" width="52" height="4" rx="2" fill="#1e293b"/>
    <rect x="14" y="20" width="38" height="3" rx="1.5" fill="#64748b"/>
    <circle cx="20" cy="41" r="5" fill="#7530fb"/>
    <rect x="29" y="39" width="30" height="4" rx="2" fill="#1e293b"/>
  </svg>`,

    'qb-nordic-minimal-brackets': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#f1f5f9"/>
    <line x1="12" y1="12" x2="68" y2="12" stroke="#e2e8f0" stroke-width="1.5"/>
    <polygon points="40,9 43,12 40,15 37,12" fill="#7530fb"/>
    <rect x="16" y="20" width="48" height="4" rx="2" fill="#1e1535"/>
    <rect x="22" y="27" width="36" height="3" rx="1.5" fill="#64748b"/>
    <rect x="28" y="34" width="24" height="3" rx="1.5" fill="#7530fb"/>
    <line x1="12" y1="40" x2="68" y2="40" stroke="#e2e8f0" stroke-width="1.5"/>
  </svg>`,

    'qb-inspected-technician-dossier': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-dasharray="3 2"/>
    <circle cx="12" cy="12" r="3" fill="#0284c7"/>
    <rect x="18" y="10" width="34" height="4" rx="2" fill="#0284c7"/>
    <rect x="10" y="20" width="60" height="4" rx="2" fill="#0f172a"/>
    <rect x="10" y="27" width="45" height="3" rx="1.5" fill="#475569"/>
    <rect x="10" y="36" width="38" height="3" rx="1.5" fill="#059669"/>
  </svg>`,

    'qb-midnight-obsidian-gold': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#0f172a"/>
    <path d="M12 12 Q14 8 16 12" stroke="#f59e0b" stroke-width="2" fill="none"/>
    <circle cx="68" cy="12" r="2" fill="#f59e0b"/>
    <circle cx="63" cy="12" r="2" fill="#f59e0b"/>
    <circle cx="58" cy="12" r="2" fill="#f59e0b"/>
    <rect x="12" y="20" width="56" height="4" rx="2" fill="#f8fafc"/>
    <rect x="12" y="27" width="42" height="3" rx="1.5" fill="#94a3b8"/>
    <rect x="12" y="35" width="28" height="3" rx="1.5" fill="#f59e0b"/>
  </svg>`,

    'qb-split-ribbon-showcase': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#ede9fe"/>
    <rect x="0" y="0" width="18" height="48" fill="#7530fb"/>
    <circle cx="9" cy="16" r="3" fill="#ffffff"/>
    <rect x="4" y="26" width="10" height="4" rx="2" fill="#ffffff"/>
    <rect x="25" y="14" width="46" height="4" rx="2" fill="#1e1535"/>
    <rect x="25" y="21" width="36" height="3" rx="1.5" fill="#64748b"/>
    <rect x="25" y="30" width="24" height="3" rx="1.5" fill="#475569"/>
  </svg>`,

    'qb-certified-guarantee-seal': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#fbfcfe" stroke="#dbeafe" stroke-width="1.5"/>
    <circle cx="16" cy="24" r="8" fill="#eff6ff" stroke="#1d4ed8" stroke-width="1.5"/>
    <rect x="30" y="13" width="42" height="4" rx="2" fill="#1d4ed8"/>
    <rect x="30" y="20" width="44" height="4" rx="2" fill="#1e293b"/>
    <rect x="30" y="27" width="34" height="3" rx="1.5" fill="#64748b"/>
    <rect x="30" y="34" width="26" height="3" rx="1.5" fill="#3b82f6"/>
  </svg>`,

    'qb-compact-horizontal-ticker': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect x="4" y="14" width="72" height="20" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
    <rect x="10" y="19" width="14" height="10" rx="4" fill="#f3eeff"/>
    <rect x="28" y="22" width="28" height="4" rx="2" fill="#0f172a"/>
    <circle cx="62" cy="24" r="1.5" fill="#f59e0b"/>
    <circle cx="66" cy="24" r="1.5" fill="#f59e0b"/>
    <circle cx="70" cy="24" r="1.5" fill="#f59e0b"/>
  </svg>`,
}

// ── Block Variant Registry ──────────────────────────────────────────────────

export const quoteBlockVariants: BlockVariant[] = [
    {
        id: 'qb-classic-accent-pillar',
        label: 'Classic Accent Pillar',
        description: 'Current Baseline: Soft card with bold accent bar & verified stars (100% full width fix)',
        thumbnail: quoteBlockThumbnails['qb-classic-accent-pillar'],
        toHtml: classicAccentPillar,
    },
    {
        id: 'qb-verified-buyer-card',
        label: 'Verified Buyer Card',
        description: 'Official eBay verified transaction badge with 5 golden stars & trust footer',
        thumbnail: quoteBlockThumbnails['qb-verified-buyer-card'],
        toHtml: verifiedBuyerCard,
    },
    {
        id: 'qb-editorial-wall-street',
        label: 'Editorial Wall Street',
        description: 'High-gravitas 5px pillar with uppercase kicker & serif merchant pledge',
        thumbnail: quoteBlockThumbnails['qb-editorial-wall-street'],
        toHtml: editorialWallStreet,
    },
    {
        id: 'qb-speech-bubble-tail',
        label: 'Speech Bubble Chat',
        description: 'Authentic buyer speech bubble with directional tail & avatar badge',
        thumbnail: quoteBlockThumbnails['qb-speech-bubble-tail'],
        toHtml: speechBubbleTail,
    },
    {
        id: 'qb-nordic-minimal-brackets',
        label: 'Nordic Minimal Brackets',
        description: 'Scandinavian hairline divider frame with centered diamond accent',
        thumbnail: quoteBlockThumbnails['qb-nordic-minimal-brackets'],
        toHtml: nordicMinimalBrackets,
    },
    {
        id: 'qb-inspected-technician-dossier',
        label: 'Technician Inspection Dossier',
        description: 'Workshop QC pass card for tools, motors, cameras & auto parts',
        thumbnail: quoteBlockThumbnails['qb-inspected-technician-dossier'],
        toHtml: inspectedTechnicianDossier,
    },
    {
        id: 'qb-midnight-obsidian-gold',
        label: 'Midnight Obsidian Gold',
        description: 'High-contrast midnight dark flagship with warm gold quotations & stars',
        thumbnail: quoteBlockThumbnails['qb-midnight-obsidian-gold'],
        toHtml: midnightObsidianGold,
    },
    {
        id: 'qb-split-ribbon-showcase',
        label: 'Split Ribbon Showcase',
        description: 'Dual-tone 2-column card: left colored rating block + right expanded quote',
        thumbnail: quoteBlockThumbnails['qb-split-ribbon-showcase'],
        toHtml: splitRibbonShowcase,
    },
    {
        id: 'qb-certified-guarantee-seal',
        label: 'Certified Guarantee Seal',
        description: 'Engraved guarantee seal emblem with bold risk-reversal warranty pledge',
        thumbnail: quoteBlockThumbnails['qb-certified-guarantee-seal'],
        toHtml: certifiedGuaranteeSeal,
    },
    {
        id: 'qb-compact-horizontal-ticker',
        label: 'Compact Horizontal Ticker',
        description: 'Mobile-first slim capsule strip for zero-scroll buyers',
        thumbnail: quoteBlockThumbnails['qb-compact-horizontal-ticker'],
        toHtml: compactHorizontalTicker,
    },
]

export function getQuoteBlockVariant(id: string): BlockVariant {
    const found = quoteBlockVariants.find(v => v.id === id)
    return found ?? quoteBlockVariants[0]
}
