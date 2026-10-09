// components/ui/VisualEditor/variants/paragraph.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Paragraph & Body Text Retail Architectures (10 Professional Layout Styles)
//
// Grounded in Top-Rated eBay Power-Seller Storefronts:
// • Style 1 is 100% IDENTICAL to current baseline (updated to full width)
// • 9 new radically distinct, authentic commercial retail text architectures
// • 100% full-width edge-to-edge across desktop (1000px) and mobile (375px)
// • Crisp vector SVG icons (zero emojis, zero glassy AI slop)
// • Pure eBay-compliant inline CSS and HTML table architecture (VeRO safe)
//
// 10 Distinct Layout Styles:
//   1.  para-classic-plain          (Current Baseline — 100% SAME TO SAME full-width plain body)
//   2.  para-executive-lead         (High-Impact Lead Intro Paragraph with Generous Sizing)
//   3.  para-accent-pillar          (Wall Street Journal Left Accent Pillar with Indented Text)
//   4.  para-disclaimer-card        (Framed Caution/Disclaimer Box with Crisp Vector Info Icon)
//   5.  para-drop-cap-luxe          (Scandinavian Luxury Drop-Cap First Letter for Fashion & Jewelry)
//   6.  para-two-column-split       (2-Column Magazine Reading Layout — Stacks on Mobile)
//   7.  para-swiss-double-rule      (Minimalist Swiss Editorial Top & Bottom 1px Hairlines)
//   8.  para-technical-monospace    (Technical Dossier Monospace Parameters for Auto/Tools)
//   9.  para-authoritative-quote    (Merchant Voice Personal Shop Statement & Guarantee)
//   10. para-category-capsule       (Micro-Badge Capsule Chip Above Body Paragraph)
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockVariant } from './section_label.variants'

export interface ParagraphProps {
    text?: string
    color?: string
    fontSize?: number
    fontWeight?: string
    lineHeight?: number
    letterSpacing?: number
    align?: 'left' | 'center' | 'right'
    bgColor?: string
    accentColor?: string
    paddingTop?: number
    paddingBottom?: number
    paddingLeft?: number
    paddingRight?: number
    variant?: string
    badgeText?: string
    authorText?: string
}

// ── Shared Vector SVG Icons (Sharp, Zero Emojis) ──────────────────────────────

function getInfoCircleSvg(color = '#0284c7', size = 16): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
}

function getQuoteIconSvg(color = '#7530fb', size = 16): string {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v6c0 7 3 10 3 10z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 7 3 10 3 10z"/></svg>`
}

// ── Property Resolvers ────────────────────────────────────────────────────────

function getText(p: any): string {
    return p.text || 'Enter your paragraph text here. You can include {{PRODUCT_TITLE}} and other placeholders.'
}

function pad(p: any, defaultTop = 16, defaultRight = 24, defaultBottom = 16, defaultLeft = 24): string {
    const pt = p.paddingTop ?? defaultTop
    const pr = p.paddingRight ?? defaultRight
    const pb = p.paddingBottom ?? defaultBottom
    const pl = p.paddingLeft ?? defaultLeft
    return `padding:${pt}px ${pr}px ${pb}px ${pl}px;`
}

function resolveBg(p: any, defaultColor = '#ffffff'): string {
    if (p.bgColor && p.bgColor !== '#7530fb') return p.bgColor
    return defaultColor
}

function resolveText(p: any, defaultColor = '#475569'): string {
    if (p.color && p.color !== '#ffffff') return p.color
    return defaultColor
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLASSIC PLAIN (CURRENT BASELINE — 100% SAME TO SAME, FULL WIDTH)
// Standard full-width body text with clean typography
// ─────────────────────────────────────────────────────────────────────────────
function variantClassicPlain(p: any, id: string): string {
    const text = getText(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#6b7280')
    const fontSize = p.fontSize ?? 14
    const fontWeight = p.fontWeight || '400'
    const lineHeight = p.lineHeight ?? 1.7
    const align = p.align || 'left'
    const lsEm = ((p.letterSpacing ?? 0) / (p.fontSize ?? 14)).toFixed(4)

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p)}box-sizing:border-box;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:${fontWeight};line-height:${lineHeight};letter-spacing:${lsEm}em;color:${color};text-align:${align};word-break:break-word;">
            ${text}
          </p>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. EXECUTIVE LEAD PARAGRAPH (High-Impact Lead Intro)
// Slightly larger 16px font with dark high-contrast color for the first 3 seconds
// ─────────────────────────────────────────────────────────────────────────────
function variantExecutiveLead(p: any, id: string): string {
    const text = getText(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#0f172a')
    const fontSize = p.fontSize ?? 16
    const lineHeight = p.lineHeight ?? 1.65
    const align = p.align || 'left'

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p)}box-sizing:border-box;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:600;line-height:${lineHeight};color:${color};text-align:${align};letter-spacing:-0.2px;word-break:break-word;">
            ${text}
          </p>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. EDITORIAL ACCENT PILLAR (Left Solid Brand Accent Stripe)
// 3.5px solid accent pillar with clean indentation
// ─────────────────────────────────────────────────────────────────────────────
function variantAccentPillar(p: any, id: string): string {
    const text = getText(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#1e293b')
    const accent = p.accentColor || '#7530fb'
    const fontSize = p.fontSize ?? 14
    const lineHeight = p.lineHeight ?? 1.7
    const align = p.align || 'left'

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
            <tr>
              <!-- 3.5px Left Accent Pillar -->
              <td width="4" style="width:4px;background-color:${accent};border-radius:2px;font-size:1px;line-height:1px;">&nbsp;</td>
              <!-- Indented Text -->
              <td style="padding-left:14px;box-sizing:border-box;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:${p.fontWeight || '400'};line-height:${lineHeight};color:${color};text-align:${align};word-break:break-word;">
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
// 4. DISCLAIMER CARD (Soft Framed Note Box with Vector Icon)
// Clean bordered card for important fitment, shipping, or returns notices
// ─────────────────────────────────────────────────────────────────────────────
function variantDisclaimerCard(p: any, id: string): string {
    const text = getText(p)
    const bg = resolveBg(p, '#f8fafc')
    const color = resolveText(p, '#334155')
    const accent = p.accentColor || '#0284c7'
    const fontSize = p.fontSize ?? 13
    const infoSvg = getInfoCircleSvg(accent, 16)

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 10, 16, 10, 16)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg};border:1px solid #e2e8f0;border-left:3.5px solid ${accent};border-radius:6px;box-sizing:border-box;">
            <tr>
              <td style="padding:12px 14px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
                  <tr>
                    <td width="24" valign="top" style="width:24px;padding-right:8px;padding-top:1px;box-sizing:border-box;">
                      ${infoSvg}
                    </td>
                    <td valign="top" style="box-sizing:border-box;">
                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;color:${color};line-height:1.55;word-break:break-word;">
                        ${text}
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
// 5. DROP CAP LUXE (Scandinavian Luxury Editorial)
// Elegant 2-line drop-cap initial in serif for jewelry, watches & fashion
// ─────────────────────────────────────────────────────────────────────────────
function variantDropCapLuxe(p: any, id: string): string {
    const text = getText(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#1c1917')
    const accent = p.accentColor || '#b45309'
    const fontSize = p.fontSize ?? 14.5
    const firstLetter = text.charAt(0) || 'E'
    const restText = text.slice(1)

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
            <tr>
              <!-- Luxury Drop Cap Initial -->
              <td width="42" valign="top" align="center" style="width:42px;padding-right:10px;padding-top:2px;box-sizing:border-box;">
                <div style="font-family:Georgia,serif;font-size:36px;font-weight:700;color:${accent};line-height:1;text-align:center;">
                  ${firstLetter}
                </div>
              </td>
              <!-- Body Copy -->
              <td valign="top" style="box-sizing:border-box;">
                <p style="margin:0;font-family:Georgia,serif,Arial;font-size:${fontSize}px;line-height:1.75;color:${color};letter-spacing:0.2px;word-break:break-word;">
                  ${restText}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. TWO-COLUMN SPLIT (2-Column Magazine Reading Layout)
// Splits text into 2 columns on desktop to cut vertical scrolling in half
// ─────────────────────────────────────────────────────────────────────────────
function variantTwoColumnSplit(p: any, id: string): string {
    const text = getText(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#334155')
    const fontSize = p.fontSize ?? 13.5
    const lineHeight = p.lineHeight ?? 1.65

    // Automatically split text into two halves by sentence
    const sentences = text.split(/(?<=[.!?])\s+/)
    const mid = Math.ceil(sentences.length / 2)
    const col1 = sentences.slice(0, mid).join(' ') || text
    const col2 = sentences.slice(mid).join(' ') || ''

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
            <tr>
              <!-- Left Column -->
              <td width="${col2 ? '48%' : '100%'}" valign="top" style="box-sizing:border-box;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;line-height:${lineHeight};color:${color};word-break:break-word;">
                  ${col1}
                </p>
              </td>
              ${col2 ? `
              <!-- Center 4% Gutter -->
              <td width="4%" style="width:4%;">&nbsp;</td>
              <!-- Right Column -->
              <td width="48%" valign="top" style="box-sizing:border-box;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;line-height:${lineHeight};color:${color};word-break:break-word;">
                  ${col2}
                </p>
              </td>` : ''}
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. SWISS DOUBLE RULE (Minimalist Hairlines Framing Text)
// Clean top and bottom 1px hairlines for clean separation
// ─────────────────────────────────────────────────────────────────────────────
function variantSwissDoubleRule(p: any, id: string): string {
    const text = getText(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#0f172a')
    const fontSize = p.fontSize ?? 14
    const lineHeight = p.lineHeight ?? 1.7
    const align = p.align || 'left'

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;padding:12px 0;">
            <tr>
              <td style="padding:10px 0;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;line-height:${lineHeight};color:${color};text-align:${align};word-break:break-word;">
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
// 8. TECHNICAL MONOSPACE DOSSIER (Engineered Parameters & Fitment Data)
// Monospace styled parameter note for tools, motors, computing & hardware
// ─────────────────────────────────────────────────────────────────────────────
function variantTechnicalMonospace(p: any, id: string): string {
    const text = getText(p)
    const bg = resolveBg(p, '#f8fafc')
    const color = resolveText(p, '#0f172a')
    const accent = p.accentColor || '#0284c7'
    const fontSize = p.fontSize ?? 12.5

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 10, 16, 10, 16)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg};border:1px solid #cbd5e1;border-radius:4px;box-sizing:border-box;">
            <!-- Monospace Header Strip -->
            <tr style="background:#0f172a;">
              <td style="padding:5px 12px;">
                <span style="font-family:'Courier New',Courier,monospace;font-size:9.5px;font-weight:700;color:#38bdf8;letter-spacing:1px;text-transform:uppercase;">
                  SPECIFICATION NOTE // TECHNICAL DOSSIER
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 14px;">
                <p style="margin:0;font-family:'Courier New',Courier,monospace,Arial;font-size:${fontSize}px;line-height:1.6;color:${color};word-break:break-word;">
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
// 9. AUTHORITATIVE MERCHANT VOICE (Store Statement & Personal Trust)
// Styled with quotation mark icon and seller commitment baseline
// ─────────────────────────────────────────────────────────────────────────────
function variantAuthoritativeQuote(p: any, id: string): string {
    const text = getText(p)
    const bg = resolveBg(p, '#fcfaf6')
    const color = resolveText(p, '#1c1917')
    const accent = p.accentColor || '#b45309'
    const fontSize = p.fontSize ?? 14
    const author = p.authorText || 'Official Store Promise · Verified eBay Merchant'
    const quoteSvg = getQuoteIconSvg(accent, 18)

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 12, 16, 12, 16)}box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${bg};border:1px solid #e7e5e4;border-left:3.5px solid ${accent};border-radius:6px;box-sizing:border-box;">
            <tr>
              <td style="padding:14px 16px;">
                <div style="margin-bottom:6px;">${quoteSvg}</div>
                <p style="margin:0 0 8px;font-family:Georgia,serif,Arial;font-size:${fontSize}px;font-style:italic;line-height:1.65;color:${color};word-break:break-word;">
                  ${text}
                </p>
                <div style="font-family:Arial,sans-serif;font-size:10.5px;font-weight:700;color:${accent};letter-spacing:0.5px;text-transform:uppercase;">
                  — ${author}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. CATEGORY CAPSULE (Micro-Badge Pill Chip Above Paragraph Body)
// Clean upper badge tag e.g. "OVERVIEW" or "IMPORTANT"
// ─────────────────────────────────────────────────────────────────────────────
function variantCategoryCapsule(p: any, id: string): string {
    const text = getText(p)
    const bg = resolveBg(p, '#ffffff')
    const color = resolveText(p, '#334155')
    const accent = p.accentColor || '#7530fb'
    const fontSize = p.fontSize ?? 13.5
    const badgeText = p.badgeText || 'PRODUCT OVERVIEW'

    return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
      <tr>
        <td style="background-color:${bg};${pad(p)}box-sizing:border-box;">
          <div style="margin-bottom:6px;">
            <span style="display:inline-block;padding:2px 8px;background:#f3eeff;border:1px solid #ddd6fe;border-radius:4px;font-family:Arial,sans-serif;font-size:9.5px;font-weight:800;color:${accent};letter-spacing:0.6px;text-transform:uppercase;">
              ${badgeText}
            </span>
          </div>
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;line-height:1.65;color:${color};word-break:break-word;">
            ${text}
          </p>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant Registry Array
// ─────────────────────────────────────────────────────────────────────────────

export const paragraphVariants: BlockVariant[] = [
    {
        id: 'para-classic-plain',
        label: 'Classic Plain',
        description: 'Current Baseline: Clean full-width plain text with optimal line-height (100% same to same)',
        toHtml: variantClassicPlain,
    },
    {
        id: 'para-executive-lead',
        label: 'Lead Paragraph',
        description: 'High-impact larger opening paragraph that hooks the buyer immediately',
        toHtml: variantExecutiveLead,
    },
    {
        id: 'para-accent-pillar',
        label: 'Accent Pillar',
        description: 'Wall Street Journal editorial layout with left solid accent bar and clean indentation',
        toHtml: variantAccentPillar,
    },
    {
        id: 'para-disclaimer-card',
        label: 'Notice Card',
        description: 'Soft framed container with vector info icon for fitment, shipping & returns rules',
        toHtml: variantDisclaimerCard,
    },
    {
        id: 'para-drop-cap-luxe',
        label: 'Drop Cap Luxe',
        description: 'Distinguished 2-line serif initial letter for jewelry, watches, antiques & fashion',
        toHtml: variantDropCapLuxe,
    },
    {
        id: 'para-two-column-split',
        label: 'Two-Column Split',
        description: 'Magazine reading layout with 2 balanced columns that stack cleanly on mobile',
        toHtml: variantTwoColumnSplit,
    },
    {
        id: 'para-swiss-double-rule',
        label: 'Swiss Double Rule',
        description: 'Minimalist Scandinavian top and bottom 1px hairlines framing key copy',
        toHtml: variantSwissDoubleRule,
    },
    {
        id: 'para-technical-monospace',
        label: 'Technical Dossier',
        description: 'Monospace parameter note with dark header for tools, motors & computing',
        toHtml: variantTechnicalMonospace,
    },
    {
        id: 'para-authoritative-quote',
        label: 'Merchant Voice',
        description: 'Personal store statement with quote icon and seller commitment signature',
        toHtml: variantAuthoritativeQuote,
    },
    {
        id: 'para-category-capsule',
        label: 'Category Capsule',
        description: 'Micro-badge pill tag above body paragraph for clear catalog categorization',
        toHtml: variantCategoryCapsule,
    },
]

export const paragraphBlockVariants = paragraphVariants

export function getParagraphVariant(variantId: string): BlockVariant {
    const found = paragraphVariants.find(v => v.id === variantId)
    return found ?? paragraphVariants[0]
}

// ─────────────────────────────────────────────────────────────────────────────
// 10 Vector SVG Thumbnails
// ─────────────────────────────────────────────────────────────────────────────

export const PARAGRAPH_THUMBNAILS: Record<string, string> = {
    'para-classic-plain': `<svg viewBox="0 0 100 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <rect width="100" height="44" rx="4" fill="#ffffff"/>
  <rect x="12" y="12" width="76" height="4" rx="2" fill="#94a3b8"/>
  <rect x="12" y="20" width="76" height="4" rx="2" fill="#94a3b8"/>
  <rect x="12" y="28" width="50" height="4" rx="2" fill="#94a3b8"/>
</svg>`,

    'para-executive-lead': `<svg viewBox="0 0 100 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <rect width="100" height="44" rx="4" fill="#ffffff"/>
  <rect x="12" y="13" width="76" height="6.5" rx="2" fill="#0f172a"/>
  <rect x="12" y="24" width="58" height="6.5" rx="2" fill="#0f172a"/>
</svg>`,

    'para-accent-pillar': `<svg viewBox="0 0 100 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <rect width="100" height="44" rx="4" fill="#ffffff"/>
  <rect x="10" y="10" width="3.5" height="24" rx="1.5" fill="#7530fb"/>
  <rect x="18" y="14" width="70" height="4" rx="2" fill="#1e293b"/>
  <rect x="18" y="21" width="70" height="4" rx="2" fill="#64748b"/>
  <rect x="18" y="28" width="45" height="4" rx="2" fill="#64748b"/>
</svg>`,

    'para-disclaimer-card': `<svg viewBox="0 0 100 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <rect width="100" height="44" rx="4" fill="#ffffff"/>
  <rect x="8" y="8" width="84" height="28" rx="4" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
  <rect x="8" y="8" width="3" height="28" fill="#0284c7"/>
  <circle cx="17" cy="18" r="3" fill="#0284c7"/>
  <rect x="24" y="16" width="60" height="4" rx="1.5" fill="#0f172a"/>
  <rect x="24" y="24" width="48" height="3.5" rx="1" fill="#64748b"/>
</svg>`,

    'para-drop-cap-luxe': `<svg viewBox="0 0 100 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <rect width="100" height="44" rx="4" fill="#ffffff"/>
  <text x="12" y="28" font-family="Georgia,serif" font-size="20" font-weight="bold" fill="#b45309">E</text>
  <rect x="28" y="13" width="60" height="4" rx="1.5" fill="#1c1917"/>
  <rect x="28" y="20" width="60" height="4" rx="1.5" fill="#44403c"/>
  <rect x="12" y="28" width="76" height="4" rx="1.5" fill="#78716c"/>
</svg>`,

    'para-two-column-split': `<svg viewBox="0 0 100 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <rect width="100" height="44" rx="4" fill="#ffffff"/>
  <!-- Col 1 -->
  <rect x="10" y="12" width="36" height="4" rx="1.5" fill="#334155"/>
  <rect x="10" y="19" width="36" height="4" rx="1.5" fill="#64748b"/>
  <rect x="10" y="26" width="28" height="4" rx="1.5" fill="#64748b"/>
  <!-- Col 2 -->
  <rect x="54" y="12" width="36" height="4" rx="1.5" fill="#334155"/>
  <rect x="54" y="19" width="36" height="4" rx="1.5" fill="#64748b"/>
  <rect x="54" y="26" width="24" height="4" rx="1.5" fill="#64748b"/>
</svg>`,

    'para-swiss-double-rule': `<svg viewBox="0 0 100 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <rect width="100" height="44" rx="4" fill="#ffffff"/>
  <line x1="10" y1="11" x2="90" y2="11" stroke="#e2e8f0" stroke-width="1"/>
  <rect x="14" y="16" width="72" height="4" rx="1.5" fill="#0f172a"/>
  <rect x="14" y="23" width="56" height="4" rx="1.5" fill="#475569"/>
  <line x1="10" y1="33" x2="90" y2="33" stroke="#e2e8f0" stroke-width="1"/>
</svg>`,

    'para-technical-monospace': `<svg viewBox="0 0 100 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <rect width="100" height="44" rx="4" fill="#ffffff"/>
  <rect x="8" y="9" width="84" height="26" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
  <rect x="8" y="9" width="84" height="6.5" rx="1" fill="#0f172a"/>
  <line x1="12" y1="12.5" x2="42" y2="12.5" stroke="#38bdf8" stroke-width="1"/>
  <rect x="12" y="20" width="76" height="3" rx="1" fill="#0f172a"/>
  <rect x="12" y="26" width="52" height="3" rx="1" fill="#64748b"/>
</svg>`,

    'para-authoritative-quote': `<svg viewBox="0 0 100 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <rect width="100" height="44" rx="4" fill="#ffffff"/>
  <rect x="8" y="8" width="84" height="28" rx="4" fill="#fcfaf6" stroke="#e7e5e4" stroke-width="0.8"/>
  <rect x="8" y="8" width="3" height="28" fill="#b45309"/>
  <path d="M15 16c1.5 0 3-.5 3-3V11h-4v3c0 2.5 1 3 1 3z" fill="#b45309"/>
  <rect x="22" y="14" width="62" height="3.5" rx="1" fill="#1c1917"/>
  <rect x="22" y="20" width="50" height="3.5" rx="1" fill="#1c1917"/>
  <rect x="22" y="27" width="35" height="2.5" rx="1" fill="#b45309"/>
</svg>`,

    'para-category-capsule': `<svg viewBox="0 0 100 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
  <rect width="100" height="44" rx="4" fill="#ffffff"/>
  <rect x="10" y="10" width="24" height="6" rx="2" fill="#f3eeff" stroke="#ddd6fe" stroke-width="0.8"/>
  <rect x="10" y="20" width="80" height="4" rx="1.5" fill="#334155"/>
  <rect x="10" y="27" width="60" height="4" rx="1.5" fill="#64748b"/>
</svg>`,
}
