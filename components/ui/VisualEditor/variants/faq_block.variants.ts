// components/ui/VisualEditor/variants/faq_block.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// FAQ Section — 10 High-Converting, Professional eBay Retail Variants
// Engineered for eBay listing templates to answer buyer doubts before they leave,
// eliminate repetitive messages, set clear return/warranty expectations,
// and guarantee 100% compliant, JS-free table rendering across all devices.
//
// Focus: Clean typography, durable table-based HTML, zero AI-slop, zero glassy filters.
//
// 1.  faq-classic-stacked         — Current clean question bars with white answer section (KEPT 100% SAME)
// 2.  faq-boxed-cards-grid        — Independent crisp white cards with subtle borders & Q chip
// 3.  faq-accent-rail-left        — 3.5px solid vertical accent rail flanking each question
// 4.  faq-numbered-circle-steps   — Prominent numbered circular badges (01, 02, 03) for high readability
// 5.  faq-split-speech-bubbles    — Two-tone conversational Q&A bubbles with distinct visual hierarchy
// 6.  faq-minimalist-hairline-rule— High-end Scandinavian zero-fill design with delicate hairline dividers
// 7.  faq-industrial-technical-ledger — Gunmetal & amber fitment ledger for auto parts, tools & hardware
// 8.  faq-luxury-serif-editorial  — Roman serif typography with gold hairlines for watches & luxury goods
// 9.  faq-verified-trust-shield   — Verified buyer protection callouts with green reassurance badges
// 10. faq-compact-mobile-accordion— Mobile-first compact row ribbon with minimal vertical footprint
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
  id: string
  label: string
  description: string
  thumbnail?: string
  toHtml: (props: any, id: string) => string
}

export interface FaqItem {
  id?: string
  question: string
  answer: string
}

// ── Shared Helpers & Dynamic Resolvers ─────────────────────────────────────

function pad(p: any, defaultT = 16, defaultR = 24, defaultB = 16, defaultL = 24): string {
  const top = p.paddingTop ?? defaultT
  const right = p.paddingRight ?? defaultR
  const bottom = p.paddingBottom ?? defaultB
  const left = p.paddingLeft ?? defaultL
  return `padding:${top}px ${right}px ${bottom}px ${left}px;`
}

function resolveBg(p: any, fallback = '#ffffff'): string {
  return p.bgColor ?? fallback
}

function resolveQuestionBg(p: any, fallback = '#f8f7ff'): string {
  return p.questionBg ?? fallback
}

function resolveQuestionCol(p: any, fallback = '#1e1535'): string {
  return p.questionColor ?? p.color ?? fallback
}

function resolveAnswerCol(p: any, fallback = '#374151'): string {
  return p.answerColor ?? fallback
}

function resolveAccentCol(p: any, fallback = '#7530fb'): string {
  return p.accentColor ?? p.chevronColor ?? fallback
}

function resolveBorderCol(p: any, fallback = '#ede9fe'): string {
  return p.borderColor ?? fallback
}

const DEFAULT_FAQ_ITEMS: FaqItem[] = [
  { id: '1', question: 'What is the warranty?', answer: 'All items come with a 30-day money back guarantee.' },
  { id: '2', question: 'How long does shipping take?', answer: 'Most orders ship within 24 hours.' },
  { id: '3', question: 'Do you accept returns?', answer: 'Yes, we accept returns within 30 days.' },
]

function resolveItems(p: any): FaqItem[] {
  if (Array.isArray(p.items) && p.items.length > 0) {
    return p.items
  }
  return DEFAULT_FAQ_ITEMS
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLASSIC STACKED (CURRENT STYLE — KEPT 100% IDENTICAL)
// ─────────────────────────────────────────────────────────────────────────────
function classicStacked(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const qBg = resolveQuestionBg(p, '#f8f7ff')
  const qCol = resolveQuestionCol(p, '#1e1535')
  const aCol = resolveAnswerCol(p, '#374151')
  const borderCol = resolveBorderCol(p, '#ede9fe')
  const items = resolveItems(p)

  const rows = items.map(item => `
    <tr>
      <td style="background-color:${qBg};padding:10px 14px;border-bottom:1px solid ${borderCol};">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${qCol};">
          ${item.question}
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:10px 14px 16px;background-color:#ffffff;">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${aCol};line-height:1.5;">
          ${item.answer}
        </p>
      </td>
    </tr>
  `).join('')

  return `<!--[riazify:faq_block:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:1px solid ${borderCol};border-radius:6px;overflow:hidden;">
        ${rows}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. BOXED CARDS GRID (Independent Crisp White Cards with Q Chip)
// ─────────────────────────────────────────────────────────────────────────────
function boxedCardsGrid(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const qCol = resolveQuestionCol(p, '#0f172a')
  const aCol = resolveAnswerCol(p, '#475569')
  const accent = resolveAccentCol(p, '#7530fb')
  const items = resolveItems(p)

  const cards = items.map((item, index) => `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;background-color:#ffffff;margin-bottom:${index === items.length - 1 ? 0 : 10}px;">
      <tr>
        <td style="padding:12px 16px 8px;border-bottom:1px solid #f1f5f9;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background-color:#f1f5f9;color:${accent};font-size:10px;font-weight:900;padding:2px 6px;border-radius:4px;margin-right:8px;text-align:center;">
                Q
              </td>
              <td style="padding-left:8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${qCol};line-height:1.3;">
                ${item.question}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 16px 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${aCol};line-height:1.55;">
          ${item.answer}
        </td>
      </tr>
    </table>
  `).join('')

  return `<!--[riazify:faq_block:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}box-sizing:border-box;">
      ${cards}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ACCENT RAIL LEFT (Left Vertical Indicator Rail)
// ─────────────────────────────────────────────────────────────────────────────
function accentRailLeft(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const qCol = resolveQuestionCol(p, '#0f172a')
  const aCol = resolveAnswerCol(p, '#475569')
  const accent = resolveAccentCol(p, '#7530fb')
  const items = resolveItems(p)

  const itemsHtml = items.map((item, index) => `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:${index === items.length - 1 ? 0 : 14}px;">
      <tr>
        <td width="3.5" style="width:3.5px;background-color:${accent};border-radius:2px;font-size:1px;line-height:1px;">&nbsp;</td>
        <td style="padding-left:12px;">
          <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:800;color:${qCol};line-height:1.3;">
            ${item.question}
          </p>
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${aCol};line-height:1.5;">
            ${item.answer}
          </p>
        </td>
      </tr>
    </table>
  `).join('')

  return `<!--[riazify:faq_block:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid #e2e8f0;border-radius:8px;${pad(p, 18, 20, 18, 20)}box-sizing:border-box;">
      ${itemsHtml}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. NUMBERED CIRCLE STEPS (01, 02, 03 Circular Badges)
// ─────────────────────────────────────────────────────────────────────────────
function numberedCircleSteps(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const qCol = resolveQuestionCol(p, '#0f172a')
  const aCol = resolveAnswerCol(p, '#475569')
  const accent = resolveAccentCol(p, '#2563eb')
  const items = resolveItems(p)

  const rows = items.map((item, idx) => {
    const num = (idx + 1).toString().padStart(2, '0')
    const isLast = idx === items.length - 1
    return `
      <tr>
        <td width="36" valign="top" style="width:36px;padding-right:12px;padding-bottom:${isLast ? 0 : 16}px;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="width:28px;height:28px;background-color:#eff6ff;color:${accent};border:1px solid #dbeafe;border-radius:50%;text-align:center;line-height:28px;font-size:11px;font-weight:800;">
                ${num}
              </td>
            </tr>
          </table>
        </td>
        <td valign="top" style="padding-bottom:${isLast ? 0 : 16}px;border-bottom:${isLast ? 'none' : '1px solid #f1f5f9'};">
          <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:800;color:${qCol};line-height:1.3;">
            ${item.question}
          </p>
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${aCol};line-height:1.55;">
            ${item.answer}
          </p>
        </td>
      </tr>
    `
  }).join('')

  return `<!--[riazify:faq_block:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid #e2e8f0;border-radius:8px;${pad(p, 18, 20, 18, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        ${rows}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. SPLIT SPEECH BUBBLES (Conversational Q & A Hierarchy)
// ─────────────────────────────────────────────────────────────────────────────
function splitSpeechBubbles(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const qCol = resolveQuestionCol(p, '#0f172a')
  const aCol = resolveAnswerCol(p, '#334155')
  const accent = resolveAccentCol(p, '#7530fb')
  const items = resolveItems(p)

  const bubbles = items.map((item, index) => `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:${index === items.length - 1 ? 0 : 12}px;">
      <tr>
        <td style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:8px 12px;">
          <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${qCol};">
            <span style="color:${accent};font-weight:900;margin-right:4px;">Q:</span> ${item.question}
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 10px 0 10px;box-sizing:border-box;">
          <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:${aCol};line-height:1.5;">
            <strong style="color:#059669;margin-right:4px;">A:</strong> ${item.answer}
          </p>
        </td>
      </tr>
    </table>
  `).join('')

  return `<!--[riazify:faq_block:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid #e2e8f0;border-radius:8px;${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      ${bubbles}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. MINIMALIST HAIRLINE RULE (Clean Scandinavian Dividers)
// ─────────────────────────────────────────────────────────────────────────────
function minimalistHairlineRule(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const qCol = resolveQuestionCol(p, '#0f172a')
  const aCol = resolveAnswerCol(p, '#64748b')
  const items = resolveItems(p)

  const rows = items.map((item, idx) => `
    <tr>
      <td style="padding:${idx === 0 ? '0' : '14px'} 0 14px;border-bottom:${idx === items.length - 1 ? 'none' : '1px solid #e2e8f0'};">
        <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:${qCol};">
          ${item.question}
        </p>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:${aCol};line-height:1.55;">
          ${item.answer}
        </p>
      </td>
    </tr>
  `).join('')

  return `<!--[riazify:faq_block:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 16, 24, 16, 24)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        ${rows}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. INDUSTRIAL TECHNICAL LEDGER (Gunmetal & Amber Fitment Ledger)
// ─────────────────────────────────────────────────────────────────────────────
function industrialTechnicalLedger(p: any, id: string): string {
  const qCol = resolveQuestionCol(p, '#f8fafc')
  const aCol = resolveAnswerCol(p, '#94a3b8')
  const items = resolveItems(p)

  const entries = items.map((item, idx) => `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#1e293b;border:1px solid #334155;border-left:3.5px solid #f59e0b;border-radius:4px;margin-bottom:${idx === items.length - 1 ? 0 : 10}px;">
      <tr>
        <td style="padding:10px 14px 6px;">
          <span style="font-family:'Courier New',Courier,monospace;font-size:10px;font-weight:800;color:#f59e0b;letter-spacing:1px;text-transform:uppercase;">
            FAQ REF [0${idx + 1}] //
          </span>
          <p style="margin:2px 0 0;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${qCol};line-height:1.3;">
            ${item.question}
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 14px 10px;font-family:Arial,sans-serif;font-size:12px;color:${aCol};line-height:1.5;">
          ${item.answer}
        </td>
      </tr>
    </table>
  `).join('')

  return `<!--[riazify:faq_block:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:#0f172a;border-radius:6px;${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      ${entries}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. LUXURY SERIF EDITORIAL (Roman Serif Ivory Card with Gold Hairlines)
// ─────────────────────────────────────────────────────────────────────────────
function luxurySerifEditorial(p: any, id: string): string {
  const bgCol = resolveBg(p, '#fafaf9')
  const qCol = resolveQuestionCol(p, '#1c1917')
  const aCol = resolveAnswerCol(p, '#78716c')
  const items = resolveItems(p)

  const rows = items.map((item, idx) => `
    <tr>
      <td style="padding:${idx === 0 ? '0' : '14px'} 0 14px;border-bottom:${idx === items.length - 1 ? 'none' : '1px solid #e7e5e4'};">
        <p style="margin:0 0 5px;font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:600;color:${qCol};font-style:italic;">
          &bull; ${item.question}
        </p>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:${aCol};line-height:1.6;padding-left:14px;">
          ${item.answer}
        </p>
      </td>
    </tr>
  `).join('')

  return `<!--[riazify:faq_block:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:Georgia,serif;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid #e7e5e4;border-top:2px solid #b45309;${pad(p, 18, 24, 18, 24)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        ${rows}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. VERIFIED TRUST SHIELD (Reassurance Badges for Returns & Warranty)
// ─────────────────────────────────────────────────────────────────────────────
function verifiedTrustShield(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const qCol = resolveQuestionCol(p, '#0f172a')
  const aCol = resolveAnswerCol(p, '#334155')
  const items = resolveItems(p)

  const cards = items.map((item, index) => `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:1px solid #bbf7d0;background-color:#f0fdf4;border-radius:6px;margin-bottom:${index === items.length - 1 ? 0 : 10}px;">
      <tr>
        <td width="28" valign="top" style="width:28px;padding:10px 0 10px 12px;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="width:20px;height:20px;background-color:#16a34a;color:#ffffff;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:900;">
                &#10003;
              </td>
            </tr>
          </table>
        </td>
        <td valign="top" style="padding:10px 14px 10px 8px;">
          <p style="margin:0 0 3px;font-family:Arial,sans-serif;font-size:13px;font-weight:800;color:#166534;line-height:1.3;">
            ${item.question}
          </p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:${aCol};line-height:1.5;">
            ${item.answer}
          </p>
        </td>
      </tr>
    </table>
  `).join('')

  return `<!--[riazify:faq_block:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};border:1px solid #e2e8f0;border-radius:8px;${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      ${cards}
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. COMPACT MOBILE ACCORDION (Mobile-First Inline Chevron Ribbon)
// ─────────────────────────────────────────────────────────────────────────────
function compactMobileAccordion(p: any, id: string): string {
  const bgCol = resolveBg(p, '#ffffff')
  const qCol = resolveQuestionCol(p, '#0f172a')
  const aCol = resolveAnswerCol(p, '#475569')
  const accent = resolveAccentCol(p, '#7530fb')
  const items = resolveItems(p)

  const rows = items.map((item, idx) => `
    <tr>
      <td style="padding:8px 12px;background-color:#f8fafc;border:1px solid #e2e8f0;border-bottom:none;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${qCol};">
              ${item.question}
            </td>
            <td align="right" style="width:16px;font-size:14px;color:${accent};font-weight:bold;">
              &rsaquo;
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 12px 12px;background-color:#ffffff;border:1px solid #e2e8f0;border-top:none;margin-bottom:8px;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:${aCol};line-height:1.45;">
          ${item.answer}
        </p>
      </td>
    </tr>
  `).join('')

  return `<!--[riazify:faq_block:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="background-color:${bgCol};${pad(p, 10, 14, 10, 14)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        ${rows}
      </table>
    </td>
  </tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG THUMBNAIL PREVIEWS (For Visual Editor Sidebar)
// ─────────────────────────────────────────────────────────────────────────────

export const FAQ_BLOCK_THUMBNAILS: Record<string, string> = {
  // 1. Classic Stacked
  'faq-classic-stacked': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="8" width="68" height="9" rx="2" fill="#f8f7ff" stroke="#ede9fe" stroke-width="0.8"/>
    <line x1="10" y1="12.5" x2="42" y2="12.5" stroke="#1e1535" stroke-width="1.5"/>
    <line x1="10" y1="21" x2="62" y2="21" stroke="#64748b" stroke-width="1"/>
    <rect x="6" y="27" width="68" height="9" rx="2" fill="#f8f7ff" stroke="#ede9fe" stroke-width="0.8"/>
    <line x1="10" y1="31.5" x2="46" y2="31.5" stroke="#1e1535" stroke-width="1.5"/>
    <line x1="10" y1="40" x2="56" y2="40" stroke="#64748b" stroke-width="1"/>
  </svg>`,

  // 2. Boxed Cards Grid
  'faq-boxed-cards-grid': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="7" width="68" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="9" y="10" width="5" height="5" rx="1" fill="#7530fb"/>
    <line x1="17" y1="12.5" x2="48" y2="12.5" stroke="#0f172a" stroke-width="1.5"/>
    <line x1="9" y1="18" x2="64" y2="18" stroke="#64748b" stroke-width="1"/>
    <rect x="6" y="26" width="68" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="9" y="29" width="5" height="5" rx="1" fill="#7530fb"/>
    <line x1="17" y1="31.5" x2="52" y2="31.5" stroke="#0f172a" stroke-width="1.5"/>
    <line x1="9" y1="37" x2="60" y2="37" stroke="#64748b" stroke-width="1"/>
  </svg>`,

  // 3. Accent Rail Left
  'faq-accent-rail-left': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="9" width="2.5" height="13" rx="1" fill="#7530fb"/>
    <line x1="12" y1="12" x2="54" y2="12" stroke="#0f172a" stroke-width="1.5"/>
    <line x1="12" y1="18" x2="66" y2="18" stroke="#64748b" stroke-width="1"/>
    <rect x="6" y="26" width="2.5" height="13" rx="1" fill="#7530fb"/>
    <line x1="12" y1="29" x2="48" y2="29" stroke="#0f172a" stroke-width="1.5"/>
    <line x1="12" y1="35" x2="62" y2="35" stroke="#64748b" stroke-width="1"/>
  </svg>`,

  // 4. Numbered Circle Steps
  'faq-numbered-circle-steps': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <circle cx="12" cy="15" r="4.5" fill="#eff6ff" stroke="#2563eb" stroke-width="0.8"/>
    <line x1="20" y1="13" x2="58" y2="13" stroke="#0f172a" stroke-width="1.5"/>
    <line x1="20" y1="18" x2="68" y2="18" stroke="#64748b" stroke-width="1"/>
    <circle cx="12" cy="33" r="4.5" fill="#eff6ff" stroke="#2563eb" stroke-width="0.8"/>
    <line x1="20" y1="31" x2="52" y2="31" stroke="#0f172a" stroke-width="1.5"/>
    <line x1="20" y1="36" x2="64" y2="36" stroke="#64748b" stroke-width="1"/>
  </svg>`,

  // 5. Split Speech Bubbles
  'faq-split-speech-bubbles': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="8" width="56" height="7" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="10" y1="11.5" x2="46" y2="11.5" stroke="#7530fb" stroke-width="1.2"/>
    <line x1="16" y1="19" x2="66" y2="19" stroke="#059669" stroke-width="1.2"/>
    <rect x="6" y="27" width="56" height="7" rx="2" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="10" y1="30.5" x2="42" y2="30.5" stroke="#7530fb" stroke-width="1.2"/>
    <line x1="16" y1="38" x2="62" y2="38" stroke="#059669" stroke-width="1.2"/>
  </svg>`,

  // 6. Minimalist Hairline Rule
  'faq-minimalist-hairline-rule': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="8" y1="10" x2="52" y2="10" stroke="#0f172a" stroke-width="1.5"/>
    <line x1="8" y1="16" x2="68" y2="16" stroke="#64748b" stroke-width="1"/>
    <line x1="8" y1="23" x2="72" y2="23" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="8" y1="29" x2="48" y2="29" stroke="#0f172a" stroke-width="1.5"/>
    <line x1="8" y1="35" x2="64" y2="35" stroke="#64748b" stroke-width="1"/>
  </svg>`,

  // 7. Industrial Technical Ledger
  'faq-industrial-technical-ledger': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#0f172a"/>
    <rect x="6" y="8" width="68" height="14" rx="2" fill="#1e293b" stroke="#334155" stroke-width="0.8"/>
    <rect x="6" y="8" width="2" height="14" fill="#f59e0b"/>
    <line x1="12" y1="12" x2="28" y2="12" stroke="#f59e0b" stroke-width="1"/>
    <line x1="12" y1="17" x2="56" y2="17" stroke="#94a3b8" stroke-width="1"/>
    <rect x="6" y="26" width="68" height="14" rx="2" fill="#1e293b" stroke="#334155" stroke-width="0.8"/>
    <rect x="6" y="26" width="2" height="14" fill="#f59e0b"/>
    <line x1="12" y1="30" x2="32" y2="30" stroke="#f59e0b" stroke-width="1"/>
    <line x1="12" y1="35" x2="60" y2="35" stroke="#94a3b8" stroke-width="1"/>
  </svg>`,

  // 8. Luxury Serif Editorial
  'faq-luxury-serif-editorial': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#fafaf9" stroke="#e7e5e4" stroke-width="1"/>
    <line x1="6" y1="8" x2="74" y2="8" stroke="#b45309" stroke-width="1.2"/>
    <line x1="10" y1="15" x2="48" y2="15" stroke="#1c1917" stroke-width="1.5"/>
    <line x1="14" y1="21" x2="66" y2="21" stroke="#78716c" stroke-width="1"/>
    <line x1="10" y1="28" x2="70" y2="28" stroke="#e7e5e4" stroke-width="0.8"/>
    <line x1="10" y1="34" x2="44" y2="34" stroke="#1c1917" stroke-width="1.5"/>
    <line x1="14" y1="40" x2="62" y2="40" stroke="#78716c" stroke-width="1"/>
  </svg>`,

  // 9. Verified Trust Shield
  'faq-verified-trust-shield': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="8" width="68" height="14" rx="2" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="0.8"/>
    <circle cx="12" cy="15" r="3" fill="#16a34a"/>
    <line x1="18" y1="13" x2="48" y2="13" stroke="#166534" stroke-width="1.5"/>
    <line x1="18" y1="18" x2="64" y2="18" stroke="#334155" stroke-width="1"/>
    <rect x="6" y="26" width="68" height="14" rx="2" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="0.8"/>
    <circle cx="12" cy="33" r="3" fill="#16a34a"/>
    <line x1="18" y1="31" x2="44" y2="31" stroke="#166534" stroke-width="1.5"/>
    <line x1="18" y1="36" x2="60" y2="36" stroke="#334155" stroke-width="1"/>
  </svg>`,

  // 10. Compact Mobile Accordion
  'faq-compact-mobile-accordion': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    <rect x="6" y="8" width="68" height="8" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="10" y1="12" x2="46" y2="12" stroke="#0f172a" stroke-width="1.2"/>
    <path d="M68 10.5l2 1.5-2 1.5" stroke="#7530fb" stroke-width="1" fill="none"/>
    <line x1="10" y1="20" x2="62" y2="20" stroke="#64748b" stroke-width="1"/>
    <rect x="6" y="26" width="68" height="8" rx="1.5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="10" y1="30" x2="42" y2="30" stroke="#0f172a" stroke-width="1.2"/>
    <path d="M68 28.5l2 1.5-2 1.5" stroke="#7530fb" stroke-width="1" fill="none"/>
    <line x1="10" y1="38" x2="58" y2="38" stroke="#64748b" stroke-width="1"/>
  </svg>`,
}

export function getFaqBlockThumbnailSvg(id: string): string {
  const key = Object.keys(FAQ_BLOCK_THUMBNAILS).find(k => {
    const clean = id.toLowerCase().replace(/_/g, '-')
    const vClean = k.toLowerCase().replace(/_/g, '-')
    return k === id || vClean === clean || k.endsWith(clean) || id.endsWith(k)
  })
  return key ? FAQ_BLOCK_THUMBNAILS[key] : FAQ_BLOCK_THUMBNAILS['faq-classic-stacked']
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const faqBlockVariants: BlockVariant[] = [
  {
    id: 'faq-classic-stacked',
    label: 'Classic Stacked',
    description: 'Current clean question bars with white answer section',
    thumbnail: FAQ_BLOCK_THUMBNAILS['faq-classic-stacked'],
    toHtml(props, id) { return classicStacked(props, id) },
  },
  {
    id: 'faq-boxed-cards-grid',
    label: 'Boxed Question Cards',
    description: 'Independent crisp white cards with subtle borders & Q chip',
    thumbnail: FAQ_BLOCK_THUMBNAILS['faq-boxed-cards-grid'],
    toHtml(props, id) { return boxedCardsGrid(props, id) },
  },
  {
    id: 'faq-accent-rail-left',
    label: 'Accent Rail Left',
    description: '3.5px solid vertical accent rail flanking each question',
    thumbnail: FAQ_BLOCK_THUMBNAILS['faq-accent-rail-left'],
    toHtml(props, id) { return accentRailLeft(props, id) },
  },
  {
    id: 'faq-numbered-circle-steps',
    label: 'Numbered Inquiries',
    description: 'Prominent numbered circular badges (01, 02, 03) for high readability',
    thumbnail: FAQ_BLOCK_THUMBNAILS['faq-numbered-circle-steps'],
    toHtml(props, id) { return numberedCircleSteps(props, id) },
  },
  {
    id: 'faq-split-speech-bubbles',
    label: 'Split Q&A Bubbles',
    description: 'Two-tone conversational Q&A bubbles with distinct visual hierarchy',
    thumbnail: FAQ_BLOCK_THUMBNAILS['faq-split-speech-bubbles'],
    toHtml(props, id) { return splitSpeechBubbles(props, id) },
  },
  {
    id: 'faq-minimalist-hairline-rule',
    label: 'Minimalist Hairline',
    description: 'High-end Scandinavian zero-fill design with delicate hairline dividers',
    thumbnail: FAQ_BLOCK_THUMBNAILS['faq-minimalist-hairline-rule'],
    toHtml(props, id) { return minimalistHairlineRule(props, id) },
  },
  {
    id: 'faq-industrial-technical-ledger',
    label: 'Industrial Fitment Ledger',
    description: 'Gunmetal & amber fitment ledger for auto parts, tools & hardware',
    thumbnail: FAQ_BLOCK_THUMBNAILS['faq-industrial-technical-ledger'],
    toHtml(props, id) { return industrialTechnicalLedger(props, id) },
  },
  {
    id: 'faq-luxury-serif-editorial',
    label: 'Luxury Serif Editorial',
    description: 'Roman serif typography with gold hairlines for watches & luxury goods',
    thumbnail: FAQ_BLOCK_THUMBNAILS['faq-luxury-serif-editorial'],
    toHtml(props, id) { return luxurySerifEditorial(props, id) },
  },
  {
    id: 'faq-verified-trust-shield',
    label: 'Verified Trust Shield',
    description: 'Verified buyer protection callouts with green reassurance badges',
    thumbnail: FAQ_BLOCK_THUMBNAILS['faq-verified-trust-shield'],
    toHtml(props, id) { return verifiedTrustShield(props, id) },
  },
  {
    id: 'faq-compact-mobile-accordion',
    label: 'Compact Mobile Accordion',
    description: 'Mobile-first compact row ribbon with minimal vertical footprint',
    thumbnail: FAQ_BLOCK_THUMBNAILS['faq-compact-mobile-accordion'],
    toHtml(props, id) { return compactMobileAccordion(props, id) },
  },
]

// Backwards-compatible aliases
export const faqVariants = faqBlockVariants
export const faqSectionVariants = faqBlockVariants

export function getFaqBlockVariant(id?: string): BlockVariant {
  if (!id) return faqBlockVariants[0]
  return faqBlockVariants.find(v => v.id === id) || faqBlockVariants[0]
}
export const getFaqVariant = getFaqBlockVariant
