// components/ui/VisualEditor/variants/numbered_list.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// NUMBERED LIST VARIANTS (10 High-Converting Full-Width Retail Layouts)
// 100% Full-Width Stretch • Zero Empty Space • Mobile 375px Responsive
// ─────────────────────────────────────────────────────────────────────────────
import type { BlockVariant } from './hero_header.variants'
import { getIconSvg } from '../IconLibrary'

export interface NumberedListStyleDefinition {
    id: string
    name: string
    label?: string
    description: string
    previewSvg: string
}

export interface StepItem {
    num: number
    title: string
    text: string
    icon?: string
}

// ─── Helpers & Resolvers ─────────────────────────────────────────────────────

function pad(p: any): string {
    const top = p.paddingTop ?? p.marginTop ?? 16
    const right = p.paddingRight ?? 24
    const bottom = p.paddingBottom ?? p.marginBottom ?? 16
    const left = p.paddingLeft ?? 24
    return `padding:${top}px ${right}px ${bottom}px ${left}px;`
}

function resolveBg(p: any): string {
    return p.bgColor ?? p.backgroundColor ?? p.cardBg ?? '#ffffff'
}

function resolveText(p: any): string {
    return p.textColor ?? p.color ?? '#1e1535'
}

function resolveNumColor(p: any): string {
    return p.numberColor ?? p.circleColor ?? p.accentColor ?? p.primaryColor ?? '#7530fb'
}

function parseSteps(p: any): StepItem[] {
    const raw = p.items ?? p.steps ?? p.list ?? p.content ?? p.text

    if (Array.isArray(raw) && raw.length > 0) {
        return raw.map((item: any, idx: number) => {
            if (typeof item === 'string') {
                const parts = item.split(/[-–—:|]/)
                if (parts.length >= 2) {
                    return {
                        num: idx + 1,
                        title: parts[0].trim(),
                        text: parts.slice(1).join(' - ').trim(),
                    }
                }
                return {
                    num: idx + 1,
                    title: `Step ${idx + 1}`,
                    text: item.trim(),
                }
            }
            return {
                num: item.num ?? item.number ?? idx + 1,
                title: item.title ?? item.name ?? `Step ${idx + 1}`,
                text: item.text ?? item.description ?? item.content ?? '',
                icon: item.icon,
            }
        })
    }

    if (typeof raw === 'string' && raw.trim().length > 0) {
        const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
        if (lines.length > 0) {
            return lines.map((line, idx) => {
                const cleaned = line.replace(/^\d+[\.\)\-]\s*/, '')
                const parts = cleaned.split(/[-–—:|]/)
                if (parts.length >= 2) {
                    return {
                        num: idx + 1,
                        title: parts[0].trim(),
                        text: parts.slice(1).join(' - ').trim(),
                    }
                }
                return {
                    num: idx + 1,
                    title: `Step ${idx + 1}`,
                    text: cleaned,
                }
            })
        }
    }

    return [
        { num: 1, title: 'Step one', text: 'First instruction — select options and verify fitment specifications.' },
        { num: 2, title: 'Step two', text: 'Second instruction — processed and packaged within 24 hours.' },
        { num: 3, title: 'Step three', text: 'Third instruction — delivered to your door with full tracking.' },
    ]
}

// ─────────────────────────────────────────────────────────────────────────────
// 10 FULL-WIDTH LAYOUT STYLES
// ─────────────────────────────────────────────────────────────────────────────

// 1. Classic Badge Circles (Full-Width Clean Rows)
export function variantClassicBadge(p: any, id: string): string {
    const steps = parseSteps(p)
    const numCol = resolveNumColor(p)
    const textCol = resolveText(p)
    const bgCol = resolveBg(p)
    const fSize = p.fontSize ? (typeof p.fontSize === 'number' ? `${p.fontSize}px` : p.fontSize) : '15px'
    const lHeight = p.lineHeight ?? '1.6'

    const rows = steps.map((s, idx) => `
    <tr style="border-bottom:${idx === steps.length - 1 ? 'none' : '1px solid #f1f5f9'};">
      <td width="40" valign="top" style="padding:12px 14px 12px 0;">
        <div style="width:28px;height:28px;border-radius:50%;background-color:${numCol};color:#ffffff;font-size:13px;font-weight:700;line-height:28px;text-align:center;font-family:Arial,sans-serif;">
          ${s.num}
        </div>
      </td>
      <td valign="top" style="padding:12px 0;line-height:${lHeight};">
        <span style="font-family:Arial,sans-serif;font-size:${fSize};font-weight:700;color:${textCol};">${s.title}</span>
        ${s.text ? `<span style="font-family:Arial,sans-serif;font-size:${fSize};color:${textCol};opacity:0.85;"> &mdash; ${s.text}</span>` : ''}
      </td>
    </tr>
  `).join('')

    return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;min-width:100%!important;max-width:100%!important;background-color:${bgCol};">
      <tr>
        <td style="${pad(p)}">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;">
            ${rows}
          </table>
        </td>
      </tr>
    </table>`
}

// 2. Horizontal Stepper Bar (Connected Progress Milestone Nodes)
export function variantHorizontalStepper(p: any, id: string): string {
    const steps = parseSteps(p)
    const numCol = resolveNumColor(p)
    const textCol = resolveText(p)
    const bgCol = resolveBg(p)

    const cols = steps.map((s, idx) => {
        const isLast = idx === steps.length - 1
        return `
      <td width="${Math.floor(100 / steps.length)}%" valign="top" style="padding:0 8px;text-align:center;position:relative;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="padding-bottom:10px;">
              <div style="width:34px;height:34px;border-radius:50%;background-color:${numCol};color:#ffffff;font-size:14px;font-weight:800;line-height:34px;text-align:center;margin:0 auto;box-shadow:0 2px 8px ${numCol}44;">
                ${s.num}
              </div>
            </td>
          </tr>
          <tr>
            <td align="center">
              <div style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${textCol};line-height:1.3;margin-bottom:4px;">${s.title}</div>
              <div style="font-family:Arial,sans-serif;font-size:11px;color:${textCol};opacity:0.75;line-height:1.4;">${s.text}</div>
            </td>
          </tr>
        </table>
      </td>
    `}).join('')

    return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;min-width:100%!important;max-width:100%!important;background-color:${bgCol};">
      <tr>
        <td style="${pad(p)}">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;">
            <tr>
              ${cols}
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

// 3. Connected Vertical Spine (Roadmap Timeline)
export function variantVerticalSpine(p: any, id: string): string {
    const steps = parseSteps(p)
    const numCol = resolveNumColor(p)
    const textCol = resolveText(p)
    const bgCol = resolveBg(p)

    const rows = steps.map((s, idx) => {
        const isLast = idx === steps.length - 1
        return `
      <tr>
        <td width="36" valign="top" align="center" style="padding-right:14px;">
          <div style="width:28px;height:28px;border-radius:50%;background-color:${numCol};color:#ffffff;font-size:12px;font-weight:800;line-height:28px;text-align:center;">
            ${s.num}
          </div>
          ${!isLast ? `<div style="width:2px;height:36px;background-color:${numCol}33;margin:4px auto 0 auto;"></div>` : ''}
        </td>
        <td valign="top" style="padding-bottom:${isLast ? '0' : '16px'};">
          <div style="font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:${textCol};line-height:1.3;margin-bottom:2px;">${s.title}</div>
          <div style="font-family:Arial,sans-serif;font-size:12px;color:${textCol};opacity:0.8;line-height:1.5;">${s.text}</div>
        </td>
      </tr>
    `}).join('')

    return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;min-width:100%!important;max-width:100%!important;background-color:${bgCol};">
      <tr>
        <td style="${pad(p)}">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;">
            ${rows}
          </table>
        </td>
      </tr>
    </table>`
}

// 4. Step Benefit Cards (Bordered Cards with Numeral Headers)
export function variantStepCards(p: any, id: string): string {
    const steps = parseSteps(p)
    const numCol = resolveNumColor(p)
    const textCol = resolveText(p)
    const bgCol = resolveBg(p)

    const cards = steps.map((s) => `
    <tr>
      <td style="padding-bottom:10px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;background:#ffffff;border:1px solid #e2e8f0;border-left:4px solid ${numCol};border-radius:6px;padding:12px 16px;">
          <tr>
            <td width="42" valign="middle">
              <span style="font-family:Arial,sans-serif;font-size:18px;font-weight:900;color:${numCol};">0${s.num}</span>
            </td>
            <td valign="middle">
              <div style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${textCol};margin-bottom:2px;">${s.title}</div>
              <div style="font-family:Arial,sans-serif;font-size:12px;color:${textCol};opacity:0.8;line-height:1.4;">${s.text}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('')

    return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;min-width:100%!important;max-width:100%!important;background-color:${bgCol};">
      <tr>
        <td style="${pad(p)}">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;">
            ${cards}
          </table>
        </td>
      </tr>
    </table>`
}

// 5. Minimalist Editorial (Scandinavian Hairline Separators)
export function variantMinimalEditorial(p: any, id: string): string {
    const steps = parseSteps(p)
    const numCol = resolveNumColor(p)
    const textCol = resolveText(p)
    const bgCol = resolveBg(p)

    const rows = steps.map((s, idx) => `
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td width="38" valign="top" style="padding:14px 10px 14px 0;">
        <span style="font-family:Georgia,serif;font-size:16px;font-weight:700;color:${numCol};">0${s.num}.</span>
      </td>
      <td valign="top" style="padding:14px 0;">
        <div style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.3px;color:${textCol};margin-bottom:3px;text-transform:uppercase;">${s.title}</div>
        <div style="font-family:Arial,sans-serif;font-size:12px;color:${textCol};opacity:0.75;line-height:1.5;">${s.text}</div>
      </td>
    </tr>
  `).join('')

    return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;min-width:100%!important;max-width:100%!important;background-color:${bgCol};">
      <tr>
        <td style="${pad(p)}">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;border-top:1px solid #e2e8f0;">
            ${rows}
          </table>
        </td>
      </tr>
    </table>`
}

// 6. Pill Capsule Strips (Rounded Strips with Tag Number)
export function variantPillCapsule(p: any, id: string): string {
    const steps = parseSteps(p)
    const numCol = resolveNumColor(p)
    const textCol = resolveText(p)
    const bgCol = resolveBg(p)

    const pills = steps.map((s) => `
    <tr>
      <td style="padding-bottom:8px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;background:#f8fafc;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;">
          <tr>
            <td width="36" align="center" style="background-color:${numCol};color:#ffffff;font-family:Arial,sans-serif;font-size:12px;font-weight:800;padding:8px 0;">
              ${s.num}
            </td>
            <td style="padding:8px 16px;">
              <span style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${textCol};">${s.title}</span>
              ${s.text ? `<span style="font-family:Arial,sans-serif;font-size:12px;color:${textCol};opacity:0.8;"> &mdash; ${s.text}</span>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('')

    return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;min-width:100%!important;max-width:100%!important;background-color:${bgCol};">
      <tr>
        <td style="${pad(p)}">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;">
            ${pills}
          </table>
        </td>
      </tr>
    </table>`
}

// 7. Two-Column Step Grid (2x2 Side-by-Side Boxes)
export function variantTwoColGrid(p: any, id: string): string {
    const steps = parseSteps(p)
    const numCol = resolveNumColor(p)
    const textCol = resolveText(p)
    const bgCol = resolveBg(p)

    const pairs: StepItem[][] = []
    for (let i = 0; i < steps.length; i += 2) {
        pairs.push([steps[i], steps[i + 1]].filter(Boolean))
    }

    const gridRows = pairs.map((pair) => `
    <tr>
      ${pair.map(s => `
        <td width="50%" valign="top" style="padding:5px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;">
            <tr>
              <td width="30" valign="top">
                <div style="width:24px;height:24px;border-radius:4px;background-color:${numCol};color:#ffffff;font-size:12px;font-weight:800;line-height:24px;text-align:center;">
                  ${s.num}
                </div>
              </td>
              <td valign="top" style="padding-left:8px;">
                <div style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${textCol};">${s.title}</div>
                <div style="font-family:Arial,sans-serif;font-size:11px;color:${textCol};opacity:0.8;line-height:1.4;margin-top:2px;">${s.text}</div>
              </td>
            </tr>
          </table>
        </td>
      `).join('')}
      ${pair.length === 1 ? '<td width="50%"></td>' : ''}
    </tr>
  `).join('')

    return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;min-width:100%!important;max-width:100%!important;background-color:${bgCol};">
      <tr>
        <td style="${pad(p)}">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;margin:0 -5px;">
            ${gridRows}
          </table>
        </td>
      </tr>
    </table>`
}

// 8. Industrial Monospace Block ([STEP 01] Heavy-Duty Caution Strip)
export function variantIndustrialStrip(p: any, id: string): string {
    const steps = parseSteps(p)
    const numCol = resolveNumColor(p)
    const textCol = resolveText(p)
    const bgCol = resolveBg(p)

    const rows = steps.map((s, idx) => `
    <tr>
      <td style="padding:10px 14px;background:${idx % 2 === 0 ? '#f8fafc' : '#ffffff'};border:1px solid #cbd5e1;border-bottom:2px solid #94a3b8;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;">
          <tr>
            <td width="80" valign="middle">
              <span style="display:inline-block;padding:2px 8px;background:${numCol};color:#ffffff;font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:900;border-radius:2px;">
                STEP 0${s.num}
              </span>
            </td>
            <td valign="middle" style="padding-left:10px;">
              <span style="font-family:Arial,sans-serif;font-size:13px;font-weight:800;color:${textCol};">${s.title}</span>
              ${s.text ? `<span style="font-family:Arial,sans-serif;font-size:12px;color:${textCol};opacity:0.85;"> &mdash; ${s.text}</span>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td height="5"></td></tr>
  `).join('')

    return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;min-width:100%!important;max-width:100%!important;background-color:${bgCol};">
      <tr>
        <td style="${pad(p)}">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;">
            ${rows}
          </table>
        </td>
      </tr>
    </table>`
}

// 9. Gradient Ribbon Flow (Left Gradient Band)
export function variantGradientRibbon(p: any, id: string): string {
    const steps = parseSteps(p)
    const numCol = resolveNumColor(p)
    const textCol = resolveText(p)
    const bgCol = resolveBg(p)

    const cards = steps.map((s) => `
    <tr>
      <td style="padding-bottom:10px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
          <tr>
            <td width="38" align="center" style="background:linear-gradient(180deg, ${numCol} 0%, ${numCol}dd 100%);color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:900;">
              ${s.num}
            </td>
            <td style="padding:12px 16px;">
              <div style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${textCol};">${s.title}</div>
              <div style="font-family:Arial,sans-serif;font-size:12px;color:${textCol};opacity:0.8;line-height:1.4;margin-top:2px;">${s.text}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('')

    return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;min-width:100%!important;max-width:100%!important;background-color:${bgCol};">
      <tr>
        <td style="${pad(p)}">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;">
            ${cards}
          </table>
        </td>
      </tr>
    </table>`
}

// 10. Compact Mobile Mini-Strip (0-Scroll High-Density)
export function variantCompactMini(p: any, id: string): string {
    const steps = parseSteps(p)
    const numCol = resolveNumColor(p)
    const textCol = resolveText(p)
    const bgCol = resolveBg(p)

    const items = steps.map((s) => `
    <tr>
      <td width="22" valign="middle" style="padding:4px 0;">
        <span style="display:inline-block;width:18px;height:18px;border-radius:50%;background-color:${numCol};color:#ffffff;font-size:10px;font-weight:800;line-height:18px;text-align:center;">
          ${s.num}
        </span>
      </td>
      <td valign="middle" style="padding:4px 8px;">
        <span style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:${textCol};">${s.title}</span>
        ${s.text ? `<span style="font-family:Arial,sans-serif;font-size:11px;color:${textCol};opacity:0.75;"> &mdash; ${s.text}</span>` : ''}
      </td>
    </tr>
  `).join('')

    return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;min-width:100%!important;max-width:100%!important;background-color:${bgCol};">
      <tr>
        <td style="${pad(p)}">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%!important;">
            ${items}
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// MASTER DISPATCHER
// ─────────────────────────────────────────────────────────────────────────────
export function renderNumberedListHtml(block: any, id: string = ''): string {
    const p = block?.props || block || {}
    const variantId = p.variant || p.layoutStyle || 'num-classic-badge'

    switch (variantId) {
        case 'num-horizontal-stepper':
        case 'horizontal_stepper':
            return variantHorizontalStepper(p, id)
        case 'num-vertical-spine':
        case 'vertical_spine':
            return variantVerticalSpine(p, id)
        case 'num-step-cards':
        case 'step_cards':
            return variantStepCards(p, id)
        case 'num-minimal-editorial':
        case 'minimal_editorial':
            return variantMinimalEditorial(p, id)
        case 'num-pill-capsule':
        case 'pill_capsule':
            return variantPillCapsule(p, id)
        case 'num-two-col-grid':
        case 'two_col_grid':
            return variantTwoColGrid(p, id)
        case 'num-industrial-strip':
        case 'industrial_strip':
            return variantIndustrialStrip(p, id)
        case 'num-gradient-ribbon':
        case 'gradient_ribbon':
            return variantGradientRibbon(p, id)
        case 'num-compact-mini':
        case 'compact_mini':
            return variantCompactMini(p, id)
        case 'num-classic-badge':
        case 'classic_badge':
        default:
            return variantClassicBadge(p, id)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// THUMBNAILS (For Right Inspector 2-Column Grid)
// ─────────────────────────────────────────────────────────────────────────────
export const NUMBERED_LIST_THUMBNAILS: Record<string, string> = {
    'num-classic-badge': `<svg viewBox="0 0 80 48" fill="none" style="width:100%;height:36px;"><rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0"/><circle cx="14" cy="14" r="5" fill="#7530fb"/><line x1="24" y1="14" x2="68" y2="14" stroke="#1e1535" stroke-width="1.8"/><circle cx="14" cy="26" r="5" fill="#7530fb"/><line x1="24" y1="26" x2="64" y2="26" stroke="#1e1535" stroke-width="1.8"/><circle cx="14" cy="38" r="5" fill="#7530fb"/><line x1="24" y1="38" x2="58" y2="38" stroke="#1e1535" stroke-width="1.8"/></svg>`,
    'num-horizontal-stepper': `<svg viewBox="0 0 80 48" fill="none" style="width:100%;height:36px;"><rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0"/><line x1="16" y1="20" x2="64" y2="20" stroke="#cbd5e1" stroke-width="1.5"/><circle cx="16" cy="20" r="5" fill="#7530fb"/><line x1="10" y1="30" x2="22" y2="30" stroke="#1e1535" stroke-width="1.2"/><circle cx="40" cy="20" r="5" fill="#7530fb"/><line x1="34" y1="30" x2="46" y2="30" stroke="#1e1535" stroke-width="1.2"/><circle cx="64" cy="20" r="5" fill="#7530fb"/><line x1="58" y1="30" x2="70" y2="30" stroke="#1e1535" stroke-width="1.2"/></svg>`,
    'num-vertical-spine': `<svg viewBox="0 0 80 48" fill="none" style="width:100%;height:36px;"><rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0"/><line x1="16" y1="10" x2="16" y2="38" stroke="#cbd5e1" stroke-width="1.5"/><circle cx="16" cy="12" r="4.5" fill="#7530fb"/><line x1="26" y1="12" x2="68" y2="12" stroke="#1e1535" stroke-width="1.6"/><circle cx="16" cy="24" r="4.5" fill="#7530fb"/><line x1="26" y1="24" x2="62" y2="24" stroke="#1e1535" stroke-width="1.6"/><circle cx="16" cy="36" r="4.5" fill="#7530fb"/><line x1="26" y1="36" x2="56" y2="36" stroke="#1e1535" stroke-width="1.6"/></svg>`,
    'num-step-cards': `<svg viewBox="0 0 80 48" fill="none" style="width:100%;height:36px;"><rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0"/><rect x="8" y="7" width="64" height="9" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/><rect x="8" y="7" width="3" height="9" fill="#7530fb"/><line x1="16" y1="11.5" x2="62" y2="11.5" stroke="#1e1535" stroke-width="1.4"/><rect x="8" y="19" width="64" height="9" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/><rect x="8" y="19" width="3" height="9" fill="#7530fb"/><line x1="16" y1="23.5" x2="58" y2="23.5" stroke="#1e1535" stroke-width="1.4"/><rect x="8" y="31" width="64" height="9" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/><rect x="8" y="31" width="3" height="9" fill="#7530fb"/><line x1="16" y1="35.5" x2="52" y2="35.5" stroke="#1e1535" stroke-width="1.4"/></svg>`,
    'num-minimal-editorial': `<svg viewBox="0 0 80 48" fill="none" style="width:100%;height:36px;"><rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0"/><line x1="8" y1="18" x2="72" y2="18" stroke="#f1f5f9" stroke-width="1"/><line x1="8" y1="32" x2="72" y2="32" stroke="#f1f5f9" stroke-width="1"/><line x1="12" y1="12" x2="20" y2="12" stroke="#7530fb" stroke-width="2"/><line x1="26" y1="12" x2="68" y2="12" stroke="#1e1535" stroke-width="1.4"/><line x1="12" y1="26" x2="20" y2="26" stroke="#7530fb" stroke-width="2"/><line x1="26" y1="26" x2="62" y2="26" stroke="#1e1535" stroke-width="1.4"/><line x1="12" y1="40" x2="20" y2="40" stroke="#7530fb" stroke-width="2"/><line x1="26" y1="40" x2="56" y2="40" stroke="#1e1535" stroke-width="1.4"/></svg>`,
    'num-pill-capsule': `<svg viewBox="0 0 80 48" fill="none" style="width:100%;height:36px;"><rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0"/><rect x="8" y="7" width="64" height="10" rx="5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/><circle cx="13" cy="12" r="3.5" fill="#7530fb"/><line x1="20" y1="12" x2="62" y2="12" stroke="#1e1535" stroke-width="1.4"/><rect x="8" y="20" width="64" height="10" rx="5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/><circle cx="13" cy="25" r="3.5" fill="#7530fb"/><line x1="20" y1="25" x2="56" y2="25" stroke="#1e1535" stroke-width="1.4"/><rect x="8" y="33" width="64" height="10" rx="5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/><circle cx="13" cy="38" r="3.5" fill="#7530fb"/><line x1="20" y1="38" x2="50" y2="38" stroke="#1e1535" stroke-width="1.4"/></svg>`,
    'num-two-col-grid': `<svg viewBox="0 0 80 48" fill="none" style="width:100%;height:36px;"><rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0"/><rect x="6" y="8" width="31" height="14" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/><circle cx="12" cy="15" r="3" fill="#7530fb"/><line x1="18" y1="15" x2="33" y2="15" stroke="#1e1535" stroke-width="1.2"/><rect x="43" y="8" width="31" height="14" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/><circle cx="49" cy="15" r="3" fill="#7530fb"/><line x1="55" y1="15" x2="70" y2="15" stroke="#1e1535" stroke-width="1.2"/><rect x="6" y="26" width="31" height="14" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/><circle cx="12" cy="33" r="3" fill="#7530fb"/><line x1="18" y1="33" x2="33" y2="33" stroke="#1e1535" stroke-width="1.2"/><rect x="43" y="26" width="31" height="14" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/><circle cx="49" cy="33" r="3" fill="#7530fb"/><line x1="55" y1="33" x2="70" y2="33" stroke="#1e1535" stroke-width="1.2"/></svg>`,
    'num-industrial-strip': `<svg viewBox="0 0 80 48" fill="none" style="width:100%;height:36px;"><rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0"/><rect x="6" y="8" width="68" height="9" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.8"/><rect x="8" y="10" width="10" height="5" fill="#7530fb"/><line x1="22" y1="12.5" x2="66" y2="12.5" stroke="#1e1535" stroke-width="1.2"/><rect x="6" y="20" width="68" height="9" fill="#ffffff" stroke="#94a3b8" stroke-width="0.8"/><rect x="8" y="22" width="10" height="5" fill="#7530fb"/><line x1="22" y1="24.5" x2="60" y2="24.5" stroke="#1e1535" stroke-width="1.2"/><rect x="6" y="32" width="68" height="9" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.8"/><rect x="8" y="34" width="10" height="5" fill="#7530fb"/><line x1="22" y1="36.5" x2="55" y2="36.5" stroke="#1e1535" stroke-width="1.2"/></svg>`,
    'num-gradient-ribbon': `<svg viewBox="0 0 80 48" fill="none" style="width:100%;height:36px;"><rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0"/><rect x="8" y="7" width="64" height="10" rx="2" fill="#ffffff" stroke="#e2e8f0"/><rect x="8" y="7" width="10" height="10" fill="#7530fb"/><line x1="22" y1="12" x2="64" y2="12" stroke="#1e1535" stroke-width="1.4"/><rect x="8" y="20" width="64" height="10" rx="2" fill="#ffffff" stroke="#e2e8f0"/><rect x="8" y="20" width="10" height="10" fill="#7530fb"/><line x1="22" y1="25" x2="58" y2="25" stroke="#1e1535" stroke-width="1.4"/><rect x="8" y="33" width="64" height="10" rx="2" fill="#ffffff" stroke="#e2e8f0"/><rect x="8" y="33" width="10" height="10" fill="#7530fb"/><line x1="22" y1="38" x2="50" y2="38" stroke="#1e1535" stroke-width="1.4"/></svg>`,
    'num-compact-mini': `<svg viewBox="0 0 80 48" fill="none" style="width:100%;height:36px;"><rect width="80" height="48" rx="4" fill="#ffffff" stroke="#e2e8f0"/><circle cx="12" cy="11" r="3.5" fill="#7530fb"/><line x1="19" y1="11" x2="68" y2="11" stroke="#1e1535" stroke-width="1.2"/><circle cx="12" cy="20" r="3.5" fill="#7530fb"/><line x1="19" y1="20" x2="62" y2="20" stroke="#1e1535" stroke-width="1.2"/><circle cx="12" cy="29" r="3.5" fill="#7530fb"/><line x1="19" y1="29" x2="56" y2="29" stroke="#1e1535" stroke-width="1.2"/><circle cx="12" cy="38" r="3.5" fill="#7530fb"/><line x1="19" y1="38" x2="50" y2="38" stroke="#1e1535" stroke-width="1.2"/></svg>`,
}

export const NUMBERED_LIST_STYLES: NumberedListStyleDefinition[] = [
    { id: 'num-classic-badge', name: 'Classic Badge Circles', description: 'Full-width clean rows with centered circular numbered badges', previewSvg: NUMBERED_LIST_THUMBNAILS['num-classic-badge'] },
    { id: 'num-horizontal-stepper', name: 'Horizontal Stepper', description: 'Milestone progress track connecting ordered nodes', previewSvg: NUMBERED_LIST_THUMBNAILS['num-horizontal-stepper'] },
    { id: 'num-vertical-spine', name: 'Vertical Spine Timeline', description: 'Roadmap vertical line connecting step nodes', previewSvg: NUMBERED_LIST_THUMBNAILS['num-vertical-spine'] },
    { id: 'num-step-cards', name: 'Numbered Benefit Cards', description: 'Distinct bordered cards with bold numeral headers', previewSvg: NUMBERED_LIST_THUMBNAILS['num-step-cards'] },
    { id: 'num-minimal-editorial', name: 'Minimalist Editorial', description: 'Scandinavian hairline separators with classic numbering', previewSvg: NUMBERED_LIST_THUMBNAILS['num-minimal-editorial'] },
    { id: 'num-pill-capsule', name: 'Pill Capsule Strips', description: 'Rounded pill strips with solid colored number tag', previewSvg: NUMBERED_LIST_THUMBNAILS['num-pill-capsule'] },
    { id: 'num-two-col-grid', name: 'Two-Column Step Grid', description: '2-column side-by-side numbered boxes', previewSvg: NUMBERED_LIST_THUMBNAILS['num-two-col-grid'] },
    { id: 'num-industrial-strip', name: 'Industrial Monospace', description: 'Heavy-duty [STEP 01] caution strip for tools & parts', previewSvg: NUMBERED_LIST_THUMBNAILS['num-industrial-strip'] },
    { id: 'num-gradient-ribbon', name: 'Gradient Ribbon', description: 'Cards with left vertical gradient brand ribbon', previewSvg: NUMBERED_LIST_THUMBNAILS['num-gradient-ribbon'] },
    { id: 'num-compact-mini', name: 'Compact Mini-Strip', description: '0-scroll high-density compact mobile layout', previewSvg: NUMBERED_LIST_THUMBNAILS['num-compact-mini'] },
]

export const numberedListVariants: BlockVariant[] = NUMBERED_LIST_STYLES.map(s => ({
    id: s.id,
    label: s.name,
    description: s.description,
    thumbnail: s.previewSvg,
    toHtml: (p: any, id: string = '') => renderNumberedListHtml({ props: { ...p, variant: s.id } }, id),
}))

export const numberedListBlockVariants = numberedListVariants

export function getNumberedListVariant(variantId?: string): BlockVariant {
    const cleanId = (variantId || '').replace(/^num-/, '')
    const found = numberedListVariants.find(v => v.id === variantId || v.id.replace(/^num-/, '') === cleanId)
    return found ?? numberedListVariants[0]
}
