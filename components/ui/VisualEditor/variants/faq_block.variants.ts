// components/ui/VisualEditor/variants/faq_block.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// FAQ Section — 12 Professional eBay Listing Variants
//
// Design philosophy: Clear typographic hierarchy, generous spacing, purposeful
// colour. Every variant has a reason to exist. None look like AI-generated
// templates. All are 100% eBay-compliant — table-based HTML, zero JavaScript.
//
// 1.  faq-classic-stacked         — Professional stacked list with left accent rail
// 2.  faq-boxed-cards-grid        — Numbered answer cards with clean borders
// 3.  faq-accent-rail-left        — Full accordion-open style, most asked variant
// 4.  faq-numbered-circle-steps   — Two-column policy grid (Q left, A right)
// 5.  faq-split-speech-bubbles    — Dark premium cards on navy background
// 6.  faq-minimalist-hairline-rule— Apple-style minimal typography, hairline dividers
// 7.  faq-industrial-technical-ledger — Gunmetal & amber ledger for auto/tools
// 8.  faq-luxury-serif-editorial  — Serif ivory card with gold accent for luxury goods
// 9.  faq-verified-trust-shield   — Green trust badges for returns & warranty focus
// 10. faq-compact-mobile-accordion— Alternating stripe rows, mobile-optimised
// 11. faq-clean-chevron-accordion — ▼ chevron badge open accordion (professional)
// 12. faq-dark-toggle-accordion   — Dark header bars with purple accent, high contrast
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

// ── Shared Helpers ─────────────────────────────────────────────────────────

function pad(p: any, dT = 20, dR = 24, dB = 20, dL = 24): string {
  return `padding:${p.paddingTop ?? dT}px ${p.paddingRight ?? dR}px ${p.paddingBottom ?? dB}px ${p.paddingLeft ?? dL}px;`
}

function resolveBg(p: any, fallback = '#ffffff'): string { return p.bgColor ?? fallback }
function resolveQCol(p: any, fallback = '#111827'): string { return p.questionColor ?? p.color ?? fallback }
function resolveACol(p: any, fallback = '#4b5563'): string { return p.answerColor ?? fallback }
function resolveAccent(p: any, fallback = '#7530fb'): string { return p.accentColor ?? p.chevronColor ?? fallback }
function resolveBorder(p: any, fallback = '#e5e7eb'): string { return p.borderColor ?? fallback }

const DEFAULT_FAQ_ITEMS: FaqItem[] = [
  { id: '1', question: 'What is the warranty on this item?', answer: 'All items come with a 30-day money back guarantee. If you are not fully satisfied, contact us and we will make it right.' },
  { id: '2', question: 'How long does shipping take?', answer: 'Most orders ship within 24 hours. Standard delivery typically takes 3–5 business days after dispatch.' },
  { id: '3', question: 'Do you accept returns?', answer: 'Yes, we accept returns within 30 days of delivery. Items must be in original condition. Return shipping is on us.' },
]

function resolveItems(p: any): FaqItem[] {
  if (Array.isArray(p.faqs) && p.faqs.length > 0) return p.faqs
  if (Array.isArray(p.items) && p.items.length > 0) return p.items
  return DEFAULT_FAQ_ITEMS
}

// Outer wrapper identical across all variants — eBay-safe, 100% width
function outerWrap(id: string, inner: string): string {
  return `<!--[riazify:faq_block:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr><td>${inner}</td></tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PROFESSIONAL STACKED
// White background. "FREQUENTLY ASKED QUESTIONS" eyebrow in accent caps.
// Each item: 3 px purple left rail, bold question, grey answer. Hairline rule.
// The professional default every general seller should use.
// ─────────────────────────────────────────────────────────────────────────────
function classicStacked(p: any, id: string): string {
  const bg = resolveBg(p, '#ffffff')
  const qCol = resolveQCol(p, '#111827')
  const aCol = resolveACol(p, '#4b5563')
  const accent = resolveAccent(p, '#7530fb')
  const border = resolveBorder(p, '#e5e7eb')
  const items = resolveItems(p)

  const rows = items.map((item, i) => `
    <tr>
      <td style="padding:${i === 0 ? '0' : '16px'} 0 16px;border-bottom:${i === items.length - 1 ? 'none' : `1px solid ${border}`};box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
          <tr>
            <td width="3" style="width:3px;min-width:3px;background-color:${accent};vertical-align:top;font-size:0;line-height:0;">&nbsp;</td>
            <td style="padding-left:14px;vertical-align:top;">
              <p style="margin:0 0 5px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${qCol};line-height:1.4;">${item.question}</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${aCol};line-height:1.65;">${item.answer}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('')

  const inner = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bg};">
  <tr>
    <td style="${pad(p, 24, 24, 24, 24)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="padding-bottom:14px;border-bottom:2px solid ${border};">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:${accent};letter-spacing:0.1em;text-transform:uppercase;">Frequently Asked Questions</p>
          </td>
        </tr>
        <tr><td style="padding-top:16px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${rows}</table>
        </td></tr>
      </table>
    </td>
  </tr>
</table>`
  return outerWrap(id, inner)
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. NUMBERED ANSWER CARDS
// Each FAQ in its own white card with a clean "01" "02" number badge top-right.
// Subtle border, no gimmick backgrounds. Confident, editorial feel.
// Best for sellers with 3–5 key questions.
// ─────────────────────────────────────────────────────────────────────────────
function boxedCardsGrid(p: any, id: string): string {
  const bg = resolveBg(p, '#f8f8fb')
  const qCol = resolveQCol(p, '#111827')
  const aCol = resolveACol(p, '#4b5563')
  const accent = resolveAccent(p, '#7530fb')
  const items = resolveItems(p)

  const cards = items.map((item, i) => `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:${i === items.length - 1 ? 0 : 10}px;">
      <tr>
        <td style="padding:14px 16px 0 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr>
              <td style="vertical-align:top;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${qCol};line-height:1.4;">${item.question}</p>
              </td>
              <td width="30" style="width:30px;text-align:right;vertical-align:top;padding-left:8px;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:900;color:${accent};opacity:0.3;line-height:1;">${String(i + 1).padStart(2, '0')}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 16px 14px 16px;border-top:1px solid #f3f4f6;margin-top:10px;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${aCol};line-height:1.65;">${item.answer}</p>
        </td>
      </tr>
    </table>`).join('')

  const inner = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bg};">
  <tr><td style="${pad(p, 20, 20, 20, 20)}box-sizing:border-box;">${cards}</td></tr>
</table>`
  return outerWrap(id, inner)
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. OPEN ACCORDION STYLE
// The most requested FAQ look. Every question appears as an "open" accordion row.
// Question: soft lavender header bar with question bold and ▼ expanded badge.
// Answer: clean white area below with comfortable indent.
// Note: answers always visible — eBay does not allow JavaScript.
// ─────────────────────────────────────────────────────────────────────────────
function accentRailLeft(p: any, id: string): string {
  const bg = resolveBg(p, '#ffffff')
  const qCol = resolveQCol(p, '#1e1535')
  const aCol = resolveACol(p, '#374151')
  const accent = resolveAccent(p, '#7530fb')
  const qBg = p.questionBg ?? '#f5f3ff'
  const border = resolveBorder(p, '#ddd6fe')
  const items = resolveItems(p)

  const rows = items.map((item, i) => `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:1px solid ${border};border-radius:6px;overflow:hidden;margin-bottom:${i === items.length - 1 ? 0 : 8}px;">
      <tr>
        <td style="background-color:${qBg};padding:12px 14px 12px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr>
              <td style="vertical-align:middle;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${qCol};line-height:1.35;">${item.question}</p>
              </td>
              <td width="60" style="width:60px;text-align:right;vertical-align:middle;padding-left:10px;white-space:nowrap;">
                <span style="font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:700;color:${accent};letter-spacing:0.04em;border:1px solid ${accent};border-radius:3px;padding:1px 5px;text-transform:uppercase;">Open</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background-color:#ffffff;padding:12px 16px 14px 16px;border-top:1px solid ${border};">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${aCol};line-height:1.65;">${item.answer}</p>
        </td>
      </tr>
    </table>`).join('')

  const inner = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bg};">
  <tr><td style="${pad(p, 20, 20, 20, 20)}box-sizing:border-box;">${rows}</td></tr>
</table>`
  return outerWrap(id, inner)
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. POLICY DOCUMENT GRID
// Two-column table. Left: bold question. Right: clear answer.
// Header row in small caps. Alternating row backgrounds for readability.
// Best for sellers with 5+ quick-answer FAQs.
// ─────────────────────────────────────────────────────────────────────────────
function numberedCircleSteps(p: any, id: string): string {
  const bg = resolveBg(p, '#ffffff')
  const qCol = resolveQCol(p, '#111827')
  const aCol = resolveACol(p, '#4b5563')
  const accent = resolveAccent(p, '#7530fb')
  const border = resolveBorder(p, '#e5e7eb')
  const items = resolveItems(p)

  const rows = items.map((item, i) => {
    const rowBg = i % 2 === 0 ? '#ffffff' : '#f9fafb'
    return `
    <tr style="background-color:${rowBg};">
      <td width="44%" style="width:44%;padding:12px 14px 12px 16px;border-bottom:1px solid ${border};vertical-align:top;border-right:1px solid ${border};">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${qCol};line-height:1.45;">${item.question}</p>
      </td>
      <td style="padding:12px 16px 12px 14px;border-bottom:1px solid ${border};vertical-align:top;">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${aCol};line-height:1.6;">${item.answer}</p>
      </td>
    </tr>`
  }).join('')

  const inner = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bg};">
  <tr>
    <td style="${pad(p, 20, 20, 20, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:1px solid ${border};border-radius:6px;overflow:hidden;">
        <tr style="background-color:${accent};">
          <td width="44%" style="width:44%;padding:9px 14px 9px 16px;border-right:1px solid rgba(255,255,255,0.2);">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#ffffff;letter-spacing:0.08em;text-transform:uppercase;">Question</p>
          </td>
          <td style="padding:9px 16px 9px 14px;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#ffffff;letter-spacing:0.08em;text-transform:uppercase;">Answer</p>
          </td>
        </tr>
        ${rows}
      </table>
    </td>
  </tr>
</table>`
  return outerWrap(id, inner)
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. DARK PREMIUM CARDS
// Deep navy background. Each FAQ in a white-bordered card with clean layout.
// White bold question, grey answer. Small numbered accent in corner.
// For electronics, gaming, tech, premium brand sellers.
// ─────────────────────────────────────────────────────────────────────────────
function splitSpeechBubbles(p: any, id: string): string {
  const sectionBg = p.questionBg ?? '#0f172a'
  const qCol = '#ffffff'
  const aCol = '#9ca3af'
  const accent = resolveAccent(p, '#7530fb')
  const items = resolveItems(p)

  const cards = items.map((item, i) => `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:8px;margin-bottom:${i === items.length - 1 ? 0 : 10}px;">
      <tr>
        <td style="padding:14px 16px 10px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr>
              <td style="vertical-align:top;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${qCol};line-height:1.4;">${item.question}</p>
              </td>
              <td width="20" style="width:20px;text-align:right;vertical-align:top;padding-left:8px;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:900;color:${accent};line-height:1.2;">${String(i + 1).padStart(2, '0')}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0 16px 14px 16px;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${aCol};line-height:1.65;">${item.answer}</p>
        </td>
      </tr>
    </table>`).join('')

  const inner = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${sectionBg};border-top:3px solid ${accent};border-radius:6px;">
  <tr>
    <td style="${pad(p, 20, 20, 20, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:16px;">
        <tr>
          <td>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:${accent};letter-spacing:0.1em;text-transform:uppercase;">Frequently Asked Questions</p>
          </td>
        </tr>
      </table>
      ${cards}
    </td>
  </tr>
</table>`
  return outerWrap(id, inner)
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. APPLE-STYLE MINIMAL
// Pure typography. No borders, no coloured backgrounds, no badges.
// Bold question, grey answer, hairline rule between items.
// The most refined, confident design — for brands that don't need decoration.
// ─────────────────────────────────────────────────────────────────────────────
function minimalistHairlineRule(p: any, id: string): string {
  const bg = resolveBg(p, '#ffffff')
  const qCol = resolveQCol(p, '#111827')
  const aCol = resolveACol(p, '#6b7280')
  const accent = resolveAccent(p, '#7530fb')
  const border = resolveBorder(p, '#e5e7eb')
  const items = resolveItems(p)

  const rows = items.map((item, i) => `
    <tr>
      <td style="padding:${i === 0 ? '0' : '18px'} 0 18px;border-bottom:${i === items.length - 1 ? 'none' : `1px solid ${border}`};">
        <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:${qCol};line-height:1.35;">${item.question}</p>
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${aCol};line-height:1.7;">${item.answer}</p>
      </td>
    </tr>`).join('')

  const inner = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bg};">
  <tr>
    <td style="${pad(p, 24, 24, 24, 24)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:18px;">
        <tr>
          <td>
            <p style="margin:0 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:${qCol};letter-spacing:-0.01em;line-height:1.2;">FAQs</p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${aCol};">Answers to the questions buyers ask most.</p>
          </td>
        </tr>
        <tr><td style="padding-top:14px;border-bottom:2px solid ${qCol};font-size:0;">&nbsp;</td></tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${rows}</table>
    </td>
  </tr>
</table>`
  return outerWrap(id, inner)
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. INDUSTRIAL TECHNICAL LEDGER
// Gunmetal dark background, amber reference numbers, monospace header labels.
// For auto parts, tools, hardware, industrial equipment sellers.
// ─────────────────────────────────────────────────────────────────────────────
function industrialTechnicalLedger(p: any, id: string): string {
  const qCol = resolveQCol(p, '#f8fafc')
  const aCol = resolveACol(p, '#94a3b8')
  const items = resolveItems(p)

  const entries = items.map((item, i) => `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#1e293b;border:1px solid #334155;border-left:3px solid #f59e0b;border-radius:4px;margin-bottom:${i === items.length - 1 ? 0 : 10}px;">
      <tr>
        <td style="padding:10px 14px 6px 14px;">
          <p style="margin:0 0 3px 0;font-family:'Courier New',Courier,monospace;font-size:9px;font-weight:700;color:#f59e0b;letter-spacing:1.5px;text-transform:uppercase;">FAQ.REF.${String(i + 1).padStart(2, '0')}</p>
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${qCol};line-height:1.35;">${item.question}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 14px 10px 14px;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${aCol};line-height:1.55;">${item.answer}</p>
        </td>
      </tr>
    </table>`).join('')

  const inner = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#0f172a;border-radius:6px;">
  <tr>
    <td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:14px;">
        <tr>
          <td>
            <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:9px;font-weight:700;color:#f59e0b;letter-spacing:2px;text-transform:uppercase;">// TECHNICAL FAQ REFERENCE</p>
          </td>
        </tr>
      </table>
      ${entries}
    </td>
  </tr>
</table>`
  return outerWrap(id, inner)
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. LUXURY SERIF EDITORIAL
// Warm ivory card, serif typography, thin gold accent border at top.
// For watches, jewellery, collectibles, luxury fashion sellers.
// ─────────────────────────────────────────────────────────────────────────────
function luxurySerifEditorial(p: any, id: string): string {
  const bg = resolveBg(p, '#fafaf9')
  const qCol = resolveQCol(p, '#1c1917')
  const aCol = resolveACol(p, '#78716c')
  const border = resolveBorder(p, '#e7e5e4')
  const items = resolveItems(p)

  const rows = items.map((item, i) => `
    <tr>
      <td style="padding:${i === 0 ? '0' : '16px'} 0 16px;border-bottom:${i === items.length - 1 ? 'none' : `1px solid ${border}`};">
        <p style="margin:0 0 6px 0;font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:600;color:${qCol};line-height:1.35;font-style:italic;">${item.question}</p>
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${aCol};line-height:1.7;padding-left:12px;">${item.answer}</p>
      </td>
    </tr>`).join('')

  const inner = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bg};border:1px solid ${border};border-top:2px solid #b45309;border-radius:4px;">
  <tr>
    <td style="${pad(p, 22, 24, 22, 24)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:16px;">
        <tr>
          <td>
            <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:11px;color:#b45309;letter-spacing:0.12em;text-transform:uppercase;">Questions &amp; Answers</p>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${rows}</table>
    </td>
  </tr>
</table>`
  return outerWrap(id, inner)
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. VERIFIED TRUST SHIELD
// Each FAQ framed as a guarantee: green check badge, reassurance wording.
// Buyers trust green. Use for return policy, warranty, shipping guarantee FAQs.
// ─────────────────────────────────────────────────────────────────────────────
function verifiedTrustShield(p: any, id: string): string {
  const bg = resolveBg(p, '#ffffff')
  const qCol = resolveQCol(p, '#14532d')
  const aCol = resolveACol(p, '#374151')
  const items = resolveItems(p)

  const cards = items.map((item, i) => `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#f0fdf4;border:1px solid #bbf7d0;border-left:3px solid #16a34a;border-radius:4px;margin-bottom:${i === items.length - 1 ? 0 : 8}px;">
      <tr>
        <td width="36" style="width:36px;padding:12px 0 12px 12px;vertical-align:top;">
          <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr>
              <td style="width:22px;height:22px;background-color:#16a34a;border-radius:50%;text-align:center;line-height:22px;font-size:12px;font-weight:900;color:#ffffff;">&#10003;</td>
            </tr>
          </table>
        </td>
        <td style="padding:12px 14px 12px 6px;vertical-align:top;">
          <p style="margin:0 0 3px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${qCol};line-height:1.35;">${item.question}</p>
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${aCol};line-height:1.55;">${item.answer}</p>
        </td>
      </tr>
    </table>`).join('')

  const inner = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bg};">
  <tr>
    <td style="${pad(p, 20, 20, 20, 20)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:14px;">
        <tr>
          <td>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#16a34a;letter-spacing:0.1em;text-transform:uppercase;">&#10003; Our Buyer Guarantees</p>
          </td>
        </tr>
      </table>
      ${cards}
    </td>
  </tr>
</table>`
  return outerWrap(id, inner)
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. ALTERNATING STRIPE ROWS
// Clean Q/A alternating pattern. Q row: soft lavender stripe, A row: white.
// No cards, no badges. Very scannable. Great for mobile-first buyers.
// ─────────────────────────────────────────────────────────────────────────────
function compactMobileAccordion(p: any, id: string): string {
  const bg = resolveBg(p, '#ffffff')
  const qCol = resolveQCol(p, '#111827')
  const aCol = resolveACol(p, '#4b5563')
  const accent = resolveAccent(p, '#7530fb')
  const border = resolveBorder(p, '#e5e7eb')
  const qBg = p.questionBg ?? '#f5f3ff'
  const items = resolveItems(p)

  const rows = items.map((item, i) => `
    <tr>
      <td style="background-color:${qBg};padding:11px 14px;border-bottom:1px solid ${border};">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${qCol};line-height:1.4;">${item.question}</p>
      </td>
    </tr>
    <tr>
      <td style="background-color:#ffffff;padding:10px 14px 14px 22px;border-bottom:${i === items.length - 1 ? 'none' : `1px solid ${border}`};">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${aCol};line-height:1.65;">${item.answer}</p>
      </td>
    </tr>`).join('')

  const inner = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bg};">
  <tr>
    <td style="${pad(p, 16, 16, 16, 16)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:12px;">
        <tr>
          <td>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:${accent};letter-spacing:0.1em;text-transform:uppercase;">Frequently Asked Questions</p>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:1px solid ${border};border-radius:6px;overflow:hidden;">${rows}</table>
    </td>
  </tr>
</table>`
  return outerWrap(id, inner)
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. CLEAN CHEVRON ACCORDION
// Classic accordion visual: lavender question header bar, ▼ purple circle badge,
// white answer area with border. All expanded — eBay doesn't allow JavaScript.
// ─────────────────────────────────────────────────────────────────────────────
function cleanChevronAccordion(p: any, id: string): string {
  const bg = resolveBg(p, '#ffffff')
  const qCol = resolveQCol(p, '#1e1535')
  const aCol = resolveACol(p, '#4b5563')
  const accent = resolveAccent(p, '#7530fb')
  const qBg = p.questionBg ?? '#f8f7ff'
  const border = resolveBorder(p, '#e5e7eb')
  const items = resolveItems(p)

  const rows = items.map((item, i) => `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:1px solid ${border};border-radius:6px;overflow:hidden;margin-bottom:${i === items.length - 1 ? 0 : 8}px;">
      <tr>
        <td style="background-color:${qBg};padding:12px 14px 12px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr>
              <td style="vertical-align:middle;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${qCol};line-height:1.35;">${item.question}</p>
              </td>
              <td width="24" style="width:24px;text-align:right;padding-left:10px;vertical-align:middle;">
                <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-left:auto;">
                  <tr>
                    <td style="width:20px;height:20px;background-color:${accent};border-radius:50%;text-align:center;line-height:20px;font-size:9px;color:#ffffff;font-weight:900;">&#9660;</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background-color:#ffffff;padding:12px 16px 14px 16px;border-top:1px solid ${border};">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${aCol};line-height:1.65;">${item.answer}</p>
        </td>
      </tr>
    </table>`).join('')

  const inner = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bg};">
  <tr><td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">${rows}</td></tr>
</table>`
  return outerWrap(id, inner)
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. DARK TOGGLE ACCORDION
// Dark navy/charcoal question bars. White question text, ▼ purple badge right.
// Light grey answer area below with purple top accent line. High contrast.
// ─────────────────────────────────────────────────────────────────────────────
function darkToggleAccordion(p: any, id: string): string {
  const bg = resolveBg(p, '#ffffff')
  const aCol = resolveACol(p, '#374151')
  const accent = resolveAccent(p, '#7530fb')
  const headerBg = p.questionBg ?? '#1e1535'
  const border = resolveBorder(p, '#e5e7eb')
  const items = resolveItems(p)

  const rows = items.map((item, i) => `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:1px solid ${border};border-radius:8px;overflow:hidden;margin-bottom:${i === items.length - 1 ? 0 : 10}px;">
      <tr>
        <td style="background-color:${headerBg};padding:13px 16px 13px 18px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr>
              <td style="vertical-align:middle;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;line-height:1.35;letter-spacing:0.01em;">&#9654;&nbsp;&nbsp;${item.question}</p>
              </td>
              <td width="26" style="width:26px;text-align:right;padding-left:10px;vertical-align:middle;">
                <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-left:auto;">
                  <tr>
                    <td style="width:20px;height:20px;background-color:${accent};border-radius:3px;text-align:center;line-height:20px;font-size:9px;color:#ffffff;font-weight:900;">&#9660;</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background-color:#f9fafb;padding:12px 18px 16px 18px;border-top:2px solid ${accent};">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${aCol};line-height:1.65;">${item.answer}</p>
        </td>
      </tr>
    </table>`).join('')

  const inner = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bg};">
  <tr><td style="${pad(p, 16, 20, 16, 20)}box-sizing:border-box;">${rows}</td></tr>
</table>`
  return outerWrap(id, inner)
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG THUMBNAIL PREVIEWS
// ─────────────────────────────────────────────────────────────────────────────

export const FAQ_BLOCK_THUMBNAILS: Record<string, string> = {

  'faq-classic-stacked': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#ffffff"/>
    <rect x="6" y="6" width="68" height="1.5" fill="#e5e7eb"/>
    <line x1="6" y1="11" x2="22" y2="11" stroke="#7530fb" stroke-width="0.8"/>
    <rect x="6" y="15" width="2.5" height="10" rx="1" fill="#7530fb"/>
    <line x1="12" y1="18" x2="52" y2="18" stroke="#111827" stroke-width="1.5"/>
    <line x1="12" y1="23" x2="66" y2="23" stroke="#6b7280" stroke-width="1"/>
    <line x1="6" y1="28" x2="74" y2="28" stroke="#e5e7eb" stroke-width="0.8"/>
    <rect x="6" y="32" width="2.5" height="10" rx="1" fill="#7530fb"/>
    <line x1="12" y1="35" x2="44" y2="35" stroke="#111827" stroke-width="1.5"/>
    <line x1="12" y1="40" x2="60" y2="40" stroke="#6b7280" stroke-width="1"/>
    <line x1="6" y1="45" x2="74" y2="45" stroke="#e5e7eb" stroke-width="0.8"/>
  </svg>`,

  'faq-boxed-cards-grid': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#f8f8fb"/>
    <rect x="6" y="6" width="68" height="17" rx="4" fill="#ffffff" stroke="#e5e7eb" stroke-width="0.8"/>
    <line x1="11" y1="14" x2="48" y2="14" stroke="#111827" stroke-width="1.5"/>
    <text x="67" y="14" font-family="Arial" font-size="7" fill="#7530fb" font-weight="900" opacity="0.3" text-anchor="end">01</text>
    <line x1="6" y1="23" x2="74" y2="23" stroke="#f3f4f6" stroke-width="0.8"/>
    <line x1="11" y1="19" x2="62" y2="19" stroke="#4b5563" stroke-width="0.8"/>
    <rect x="6" y="29" width="68" height="17" rx="4" fill="#ffffff" stroke="#e5e7eb" stroke-width="0.8"/>
    <line x1="11" y1="37" x2="44" y2="37" stroke="#111827" stroke-width="1.5"/>
    <text x="67" y="37" font-family="Arial" font-size="7" fill="#7530fb" font-weight="900" opacity="0.3" text-anchor="end">02</text>
    <line x1="6" y1="43" x2="74" y2="43" stroke="#f3f4f6" stroke-width="0.8"/>
    <line x1="11" y1="40" x2="58" y2="40" stroke="#4b5563" stroke-width="0.8"/>
  </svg>`,

  'faq-accent-rail-left': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#ffffff"/>
    <rect x="6" y="6" width="68" height="17" rx="3" fill="#f5f3ff" stroke="#ddd6fe" stroke-width="0.8"/>
    <line x1="11" y1="12" x2="54" y2="12" stroke="#1e1535" stroke-width="1.5"/>
    <text x="67" y="13" font-family="Arial" font-size="5.5" fill="#7530fb" font-weight="700" text-anchor="end">Open</text>
    <line x1="6" y1="23" x2="74" y2="23" stroke="#ddd6fe" stroke-width="0.8"/>
    <line x1="11" y1="19" x2="62" y2="19" stroke="#4b5563" stroke-width="0.8"/>
    <rect x="6" y="29" width="68" height="17" rx="3" fill="#f5f3ff" stroke="#ddd6fe" stroke-width="0.8"/>
    <line x1="11" y1="35" x2="46" y2="35" stroke="#1e1535" stroke-width="1.5"/>
    <text x="67" y="36" font-family="Arial" font-size="5.5" fill="#7530fb" font-weight="700" text-anchor="end">Open</text>
    <line x1="6" y1="46" x2="74" y2="46" stroke="#ddd6fe" stroke-width="0.8"/>
    <line x1="11" y1="42" x2="58" y2="42" stroke="#4b5563" stroke-width="0.8"/>
  </svg>`,

  'faq-numbered-circle-steps': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#ffffff"/>
    <rect x="6" y="6" width="68" height="9" rx="2" fill="#7530fb"/>
    <line x1="10" y1="10.5" x2="24" y2="10.5" stroke="#ffffff" stroke-width="1.2"/>
    <line x1="44" y1="10.5" x2="70" y2="10.5" stroke="#ffffff" stroke-width="1.2"/>
    <rect x="6" y="17" width="32" height="13" rx="0" fill="#ffffff" stroke="#e5e7eb" stroke-width="0.8"/>
    <rect x="40" y="17" width="34" height="13" rx="0" fill="#f9fafb" stroke="#e5e7eb" stroke-width="0.8"/>
    <line x1="10" y1="22" x2="30" y2="22" stroke="#111827" stroke-width="1.2"/>
    <line x1="44" y1="22" x2="66" y2="22" stroke="#4b5563" stroke-width="0.9"/>
    <line x1="10" y1="26" x2="26" y2="26" stroke="#4b5563" stroke-width="0.8"/>
    <line x1="44" y1="26" x2="62" y2="26" stroke="#4b5563" stroke-width="0.8"/>
    <rect x="6" y="32" width="32" height="13" rx="0" fill="#f9fafb" stroke="#e5e7eb" stroke-width="0.8"/>
    <rect x="40" y="32" width="34" height="13" rx="0" fill="#ffffff" stroke="#e5e7eb" stroke-width="0.8"/>
    <line x1="10" y1="37" x2="28" y2="37" stroke="#111827" stroke-width="1.2"/>
    <line x1="44" y1="37" x2="68" y2="37" stroke="#4b5563" stroke-width="0.9"/>
    <line x1="10" y1="41" x2="24" y2="41" stroke="#4b5563" stroke-width="0.8"/>
    <line x1="44" y1="41" x2="60" y2="41" stroke="#4b5563" stroke-width="0.8"/>
  </svg>`,

  'faq-split-speech-bubbles': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#0f172a"/>
    <rect x="6" y="6" width="68" height="17" rx="4" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.8"/>
    <line x1="11" y1="13" x2="50" y2="13" stroke="#ffffff" stroke-width="1.5"/>
    <text x="67" y="13" font-family="Arial" font-size="7" fill="#7530fb" font-weight="900" text-anchor="end">01</text>
    <line x1="11" y1="19" x2="62" y2="19" stroke="#9ca3af" stroke-width="0.9"/>
    <rect x="6" y="28" width="68" height="17" rx="4" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="0.8"/>
    <line x1="11" y1="35" x2="44" y2="35" stroke="#ffffff" stroke-width="1.5"/>
    <text x="67" y="35" font-family="Arial" font-size="7" fill="#7530fb" font-weight="900" text-anchor="end">02</text>
    <line x1="11" y1="41" x2="58" y2="41" stroke="#9ca3af" stroke-width="0.9"/>
  </svg>`,

  'faq-minimalist-hairline-rule': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#ffffff"/>
    <line x1="6" y1="9" x2="22" y2="9" stroke="#111827" stroke-width="2"/>
    <line x1="6" y1="14" x2="40" y2="14" stroke="#6b7280" stroke-width="0.7"/>
    <line x1="6" y1="19" x2="52" y2="19" stroke="#e5e7eb" stroke-width="1.5"/>
    <line x1="6" y1="24" x2="56" y2="24" stroke="#111827" stroke-width="1.5"/>
    <line x1="6" y1="29" x2="70" y2="29" stroke="#6b7280" stroke-width="0.7"/>
    <line x1="6" y1="34" x2="66" y2="34" stroke="#6b7280" stroke-width="0.7"/>
    <line x1="6" y1="39" x2="74" y2="39" stroke="#e5e7eb" stroke-width="1.5"/>
    <line x1="6" y1="44" x2="48" y2="44" stroke="#111827" stroke-width="1.5"/>
    <line x1="6" y1="49" x2="64" y2="49" stroke="#6b7280" stroke-width="0.7"/>
  </svg>`,

  'faq-industrial-technical-ledger': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#0f172a"/>
    <rect x="6" y="7" width="68" height="16" rx="2" fill="#1e293b" stroke="#334155" stroke-width="0.8"/>
    <rect x="6" y="7" width="2.5" height="16" rx="0" fill="#f59e0b"/>
    <line x1="12" y1="12" x2="32" y2="12" stroke="#f59e0b" stroke-width="0.9"/>
    <line x1="12" y1="17" x2="58" y2="17" stroke="#94a3b8" stroke-width="0.9"/>
    <rect x="6" y="27" width="68" height="16" rx="2" fill="#1e293b" stroke="#334155" stroke-width="0.8"/>
    <rect x="6" y="27" width="2.5" height="16" rx="0" fill="#f59e0b"/>
    <line x1="12" y1="32" x2="36" y2="32" stroke="#f59e0b" stroke-width="0.9"/>
    <line x1="12" y1="37" x2="54" y2="37" stroke="#94a3b8" stroke-width="0.9"/>
  </svg>`,

  'faq-luxury-serif-editorial': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#fafaf9" stroke="#e7e5e4" stroke-width="0.8"/>
    <rect x="0" y="0" width="80" height="2.5" fill="#b45309"/>
    <line x1="8" y1="9" x2="34" y2="9" stroke="#b45309" stroke-width="0.7"/>
    <line x1="8" y1="16" x2="54" y2="16" stroke="#1c1917" stroke-width="1.4"/>
    <line x1="14" y1="22" x2="66" y2="22" stroke="#78716c" stroke-width="0.8"/>
    <line x1="8" y1="28" x2="72" y2="28" stroke="#e7e5e4" stroke-width="0.8"/>
    <line x1="8" y1="34" x2="46" y2="34" stroke="#1c1917" stroke-width="1.4"/>
    <line x1="14" y1="40" x2="62" y2="40" stroke="#78716c" stroke-width="0.8"/>
    <line x1="8" y1="46" x2="72" y2="46" stroke="#e7e5e4" stroke-width="0.8"/>
  </svg>`,

  'faq-verified-trust-shield': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#ffffff"/>
    <rect x="6" y="7" width="68" height="16" rx="3" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="0.8"/>
    <rect x="6" y="7" width="2.5" height="16" fill="#16a34a"/>
    <circle cx="14" cy="15" r="3.5" fill="#16a34a"/>
    <line x1="20" y1="13" x2="54" y2="13" stroke="#14532d" stroke-width="1.3"/>
    <line x1="20" y1="18" x2="66" y2="18" stroke="#374151" stroke-width="0.9"/>
    <rect x="6" y="28" width="68" height="16" rx="3" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="0.8"/>
    <rect x="6" y="28" width="2.5" height="16" fill="#16a34a"/>
    <circle cx="14" cy="36" r="3.5" fill="#16a34a"/>
    <line x1="20" y1="34" x2="48" y2="34" stroke="#14532d" stroke-width="1.3"/>
    <line x1="20" y1="39" x2="60" y2="39" stroke="#374151" stroke-width="0.9"/>
  </svg>`,

  'faq-compact-mobile-accordion': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#ffffff"/>
    <rect x="6" y="6" width="68" height="8" fill="#f5f3ff" stroke="#e5e7eb" stroke-width="0.8"/>
    <line x1="11" y1="10" x2="52" y2="10" stroke="#111827" stroke-width="1.4"/>
    <rect x="6" y="14" width="68" height="9" fill="#ffffff" stroke="#e5e7eb" stroke-width="0.8"/>
    <line x1="16" y1="18.5" x2="64" y2="18.5" stroke="#4b5563" stroke-width="0.9"/>
    <rect x="6" y="23" width="68" height="8" fill="#f5f3ff" stroke="#e5e7eb" stroke-width="0.8"/>
    <line x1="11" y1="27" x2="46" y2="27" stroke="#111827" stroke-width="1.4"/>
    <rect x="6" y="31" width="68" height="9" fill="#ffffff" stroke="#e5e7eb" stroke-width="0.8"/>
    <line x1="16" y1="35.5" x2="60" y2="35.5" stroke="#4b5563" stroke-width="0.9"/>
    <rect x="6" y="40" width="68" height="8" fill="#f5f3ff" stroke="#e5e7eb" stroke-width="0.8"/>
    <line x1="11" y1="44" x2="54" y2="44" stroke="#111827" stroke-width="1.4"/>
  </svg>`,

  'faq-clean-chevron-accordion': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#ffffff"/>
    <rect x="6" y="5" width="68" height="11" rx="3" fill="#f8f7ff" stroke="#e5e7eb" stroke-width="0.8"/>
    <line x1="11" y1="10.5" x2="50" y2="10.5" stroke="#1e1535" stroke-width="1.5"/>
    <circle cx="67" cy="10.5" r="4" fill="#7530fb"/>
    <path d="M65 9.5l2 2 2-2" stroke="#ffffff" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <rect x="6" y="18" width="68" height="7" fill="#ffffff" stroke="#e5e7eb" stroke-width="0.8"/>
    <line x1="11" y1="21.5" x2="64" y2="21.5" stroke="#4b5563" stroke-width="0.9"/>
    <rect x="6" y="27" width="68" height="11" rx="3" fill="#f8f7ff" stroke="#e5e7eb" stroke-width="0.8"/>
    <line x1="11" y1="32.5" x2="46" y2="32.5" stroke="#1e1535" stroke-width="1.5"/>
    <circle cx="67" cy="32.5" r="4" fill="#7530fb"/>
    <path d="M65 31.5l2 2 2-2" stroke="#ffffff" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <rect x="6" y="40" width="68" height="7" fill="#ffffff" stroke="#e5e7eb" stroke-width="0.8"/>
    <line x1="11" y1="43.5" x2="58" y2="43.5" stroke="#4b5563" stroke-width="0.9"/>
  </svg>`,

  'faq-dark-toggle-accordion': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#ffffff"/>
    <rect x="6" y="5" width="68" height="12" rx="3" fill="#1e1535"/>
    <line x1="12" y1="11" x2="52" y2="11" stroke="#ffffff" stroke-width="1.5"/>
    <rect x="65" y="7.5" width="6" height="6" rx="1.5" fill="#7530fb"/>
    <path d="M67 10l1 1.5 1-1.5" stroke="#ffffff" stroke-width="0.9" fill="none" stroke-linecap="round"/>
    <rect x="6" y="19" width="68" height="8" fill="#f9fafb"/>
    <rect x="6" y="19" width="68" height="2" fill="#7530fb"/>
    <line x1="11" y1="24" x2="60" y2="24" stroke="#374151" stroke-width="0.9"/>
    <rect x="6" y="29" width="68" height="12" rx="3" fill="#1e1535"/>
    <line x1="12" y1="35" x2="48" y2="35" stroke="#ffffff" stroke-width="1.5"/>
    <rect x="65" y="31.5" width="6" height="6" rx="1.5" fill="#7530fb"/>
    <path d="M67 34l1 1.5 1-1.5" stroke="#ffffff" stroke-width="0.9" fill="none" stroke-linecap="round"/>
    <rect x="6" y="43" width="68" height="7" fill="#f9fafb"/>
    <line x1="11" y1="47" x2="56" y2="47" stroke="#374151" stroke-width="0.9"/>
  </svg>`,
}

export function getFaqBlockThumbnailSvg(id: string): string {
  const clean = id.toLowerCase().replace(/_/g, '-')
  const key = Object.keys(FAQ_BLOCK_THUMBNAILS).find(k => k === id || k === clean || k.endsWith(clean) || id.endsWith(k))
  return key ? FAQ_BLOCK_THUMBNAILS[key] : FAQ_BLOCK_THUMBNAILS['faq-classic-stacked']
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const faqBlockVariants: BlockVariant[] = [
  {
    id: 'faq-classic-stacked',
    label: 'Professional Stacked',
    description: 'Clean left accent rail, bold questions, grey answers. The professional default for any seller.',
    thumbnail: FAQ_BLOCK_THUMBNAILS['faq-classic-stacked'],
    toHtml(props, id) { return classicStacked(props, id) },
  },
  {
    id: 'faq-boxed-cards-grid',
    label: 'Numbered Answer Cards',
    description: 'Each FAQ in its own white card with a subtle numbered badge. Confident, editorial style.',
    thumbnail: FAQ_BLOCK_THUMBNAILS['faq-boxed-cards-grid'],
    toHtml(props, id) { return boxedCardsGrid(props, id) },
  },
  {
    id: 'faq-accent-rail-left',
    label: 'Open Accordion Style',
    description: 'Lavender question header with Open badge, white answer below. Looks like a real accordion.',
    thumbnail: FAQ_BLOCK_THUMBNAILS['faq-accent-rail-left'],
    toHtml(props, id) { return accentRailLeft(props, id) },
  },
  {
    id: 'faq-numbered-circle-steps',
    label: 'Policy Document Grid',
    description: 'Two-column table with Question | Answer layout. Best for 5+ short-answer FAQs.',
    thumbnail: FAQ_BLOCK_THUMBNAILS['faq-numbered-circle-steps'],
    toHtml(props, id) { return numberedCircleSteps(props, id) },
  },
  {
    id: 'faq-split-speech-bubbles',
    label: 'Dark Premium Cards',
    description: 'Navy background, white-bordered cards, numbered items. For tech, gaming and premium sellers.',
    thumbnail: FAQ_BLOCK_THUMBNAILS['faq-split-speech-bubbles'],
    toHtml(props, id) { return splitSpeechBubbles(props, id) },
  },
  {
    id: 'faq-minimalist-hairline-rule',
    label: 'Apple-Style Minimal',
    description: 'Zero decoration — just clean typography and hairline dividers. Refined and confident.',
    thumbnail: FAQ_BLOCK_THUMBNAILS['faq-minimalist-hairline-rule'],
    toHtml(props, id) { return minimalistHairlineRule(props, id) },
  },
  {
    id: 'faq-industrial-technical-ledger',
    label: 'Industrial Ledger',
    description: 'Gunmetal dark with amber reference codes. For auto parts, tools and industrial sellers.',
    thumbnail: FAQ_BLOCK_THUMBNAILS['faq-industrial-technical-ledger'],
    toHtml(props, id) { return industrialTechnicalLedger(props, id) },
  },
  {
    id: 'faq-luxury-serif-editorial',
    label: 'Luxury Serif Editorial',
    description: 'Warm ivory, serif typography, gold accent. For watches, jewellery and collectibles.',
    thumbnail: FAQ_BLOCK_THUMBNAILS['faq-luxury-serif-editorial'],
    toHtml(props, id) { return luxurySerifEditorial(props, id) },
  },
  {
    id: 'faq-verified-trust-shield',
    label: 'Buyer Guarantee Cards',
    description: 'Green checkmark badges frame each FAQ as a buyer guarantee. Perfect for return policy blocks.',
    thumbnail: FAQ_BLOCK_THUMBNAILS['faq-verified-trust-shield'],
    toHtml(props, id) { return verifiedTrustShield(props, id) },
  },
  {
    id: 'faq-compact-mobile-accordion',
    label: 'Alternating Stripe Rows',
    description: 'Q rows in soft lavender, A rows in white. Clean, scannable and mobile-friendly.',
    thumbnail: FAQ_BLOCK_THUMBNAILS['faq-compact-mobile-accordion'],
    toHtml(props, id) { return compactMobileAccordion(props, id) },
  },
  {
    id: 'faq-clean-chevron-accordion',
    label: 'Chevron Accordion',
    description: 'Lavender question bars with purple ▼ badge. Clean open-accordion look sellers and buyers recognise.',
    thumbnail: FAQ_BLOCK_THUMBNAILS['faq-clean-chevron-accordion'],
    toHtml(props, id) { return cleanChevronAccordion(props, id) },
  },
  {
    id: 'faq-dark-toggle-accordion',
    label: 'Dark Toggle Accordion',
    description: 'Dark navy question headers, purple accent on answer area. High contrast, high impact.',
    thumbnail: FAQ_BLOCK_THUMBNAILS['faq-dark-toggle-accordion'],
    toHtml(props, id) { return darkToggleAccordion(props, id) },
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
