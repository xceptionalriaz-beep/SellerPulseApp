// components/ui/VisualEditor/variants/trust_badges.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Trust Badges — 6 layout variants
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
    id: string
    label: string
    description: string
    toHtml: (props: any, id: string) => string
}

function pad(p: any): string {
    return `padding:${p.paddingTop ?? 20}px ${p.paddingRight ?? 20}px ${p.paddingBottom ?? 20}px ${p.paddingLeft ?? 20}px;`
}

const FALLBACK_BADGES = [
    { icon: '🛡️', text: 'Genuine Product', subText: '100% Authentic' },
    { icon: '🚚', text: 'Fast Dispatch', subText: 'Same Day if before 3pm' },
    { icon: '↩', text: '30-Day Returns', subText: 'Hassle Free' },
    { icon: '⭐', text: 'Top Rated Seller', subText: '5000+ Reviews' },
]

export const trustBadgesVariants: BlockVariant[] = [

    // ── 1. Row of 4 ──────────────────────────────────────────────────────────
    {
        id: 'row',
        label: 'Row of 4',
        description: 'Icons above text, 4 badges in a horizontal row',
        toHtml(p: any, id: string): string {
            const badges = (p.badges?.length ? p.badges : FALLBACK_BADGES).slice(0, 4)
            const cols = badges.map((b: any) => `
      <td width="${Math.floor(100 / badges.length)}%" style="text-align:center;vertical-align:top;padding:0 8px;">
        <div style="display:block;font-size:28px;line-height:1;margin-bottom:8px;">${b.icon ?? '✓'}</div>
        <p style="margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:${p.textColor ?? '#1e1535'};">${b.text}</p>
        ${b.subText ? `<p style="margin:0;font-family:Arial,sans-serif;font-size:10px;color:${p.subTextColor ?? '#6b7280'};">${b.subText}</p>` : ''}
      </td>`).join('')
            return `<!--[riazify:trust_badges:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  <tr><td style="${pad(p)}">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>${cols}</tr>
    </table>
  </td></tr>
</table>
<!--[/riazify:trust_badges:${id}]-->`
        },
    },

    // ── 2. 2×2 Grid ──────────────────────────────────────────────────────────
    {
        id: 'grid',
        label: '2×2 Grid',
        description: 'Four badges in a 2 column grid',
        toHtml(p: any, id: string): string {
            const badges = (p.badges?.length ? p.badges : FALLBACK_BADGES).slice(0, 4)
            const rows = [badges.slice(0, 2), badges.slice(2, 4)]
            const rowHtml = rows.map((row: any[]) => `
      <tr>${row.map((b: any) => `
        <td width="50%" style="vertical-align:top;padding:8px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${p.badgeBg ?? '#f8f7ff'};border-radius:${p.borderRadius ?? 10}px;border:1px solid ${p.borderColor ?? '#ede9fe'};">
            <tr>
              <td style="padding:14px 16px;vertical-align:middle;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding-right:12px;vertical-align:middle;font-size:24px;line-height:1;">${b.icon ?? '✓'}</td>
                    <td style="vertical-align:middle;">
                      <p style="margin:0 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:${p.textColor ?? '#1e1535'};">${b.text}</p>
                      ${b.subText ? `<p style="margin:0;font-family:Arial,sans-serif;font-size:10px;color:${p.subTextColor ?? '#6b7280'};">${b.subText}</p>` : ''}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>`).join('')}</tr>`).join('')
            return `<!--[riazify:trust_badges:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  <tr><td style="${pad(p)}">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">${rowHtml}</table>
  </td></tr>
</table>
<!--[/riazify:trust_badges:${id}]-->`
        },
    },

    // ── 3. Horizontal Strip ───────────────────────────────────────────────────
    {
        id: 'strip',
        label: 'Horizontal Strip',
        description: 'Slim single row — icon left, text right inline',
        toHtml(p: any, id: string): string {
            const badges = (p.badges?.length ? p.badges : FALLBACK_BADGES).slice(0, 4)
            const items = badges.map((b: any, i: number) => `
        ${i > 0 ? `<td style="padding:0 12px;color:${p.borderColor ?? '#e5e7eb'};font-size:18px;">|</td>` : ''}
        <td style="white-space:nowrap;vertical-align:middle;padding:0 4px;">
          <span style="font-size:16px;vertical-align:middle;margin-right:6px;">${b.icon ?? '✓'}</span>
          <span style="font-family:Arial,sans-serif;font-size:12px;font-weight:600;color:${p.textColor ?? '#1e1535'};vertical-align:middle;">${b.text}</span>
        </td>`).join('')
            return `<!--[riazify:trust_badges:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#f8f7ff'};border-top:1px solid ${p.borderColor ?? '#ede9fe'};border-bottom:1px solid ${p.borderColor ?? '#ede9fe'};">
  <tr><td style="${pad(p)}text-align:center;">
    <table cellpadding="0" cellspacing="0" border="0" align="center">
      <tr>${items}</tr>
    </table>
  </td></tr>
</table>
<!--[/riazify:trust_badges:${id}]-->`
        },
    },

    // ── 4. Icon Only ──────────────────────────────────────────────────────────
    {
        id: 'icon-only',
        label: 'Icon Only',
        description: 'Just icons — minimal, clean',
        toHtml(p: any, id: string): string {
            const badges = (p.badges?.length ? p.badges : FALLBACK_BADGES).slice(0, 4)
            const cols = badges.map((b: any) => `
      <td width="${Math.floor(100 / badges.length)}%" style="text-align:center;padding:0 8px;">
        <div style="display:inline-block;width:48px;height:48px;border-radius:50%;background-color:${p.badgeBg ?? '#f0f7ff'};border:1px solid ${p.borderColor ?? '#ede9fe'};text-align:center;line-height:48px;font-size:22px;">${b.icon ?? '✓'}</div>
        <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:9px;font-weight:600;color:${p.subTextColor ?? '#9ca3af'};text-transform:uppercase;letter-spacing:0.06em;">${b.text}</p>
      </td>`).join('')
            return `<!--[riazify:trust_badges:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  <tr><td style="${pad(p)}text-align:center;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>${cols}</tr>
    </table>
  </td></tr>
</table>
<!--[/riazify:trust_badges:${id}]-->`
        },
    },

    // ── 5. Text Only ─────────────────────────────────────────────────────────
    {
        id: 'text-only',
        label: 'Text Only',
        description: 'No icons — text pill badges in a row',
        toHtml(p: any, id: string): string {
            const badges = (p.badges?.length ? p.badges : FALLBACK_BADGES)
            const pills = badges.map((b: any) => `
        <td style="padding:0 4px;">
          <span style="display:inline-block;background-color:${p.badgeBg ?? '#f0f7ff'};border:1px solid ${p.borderColor ?? '#ede9fe'};border-radius:20px;padding:5px 14px;font-family:Arial,sans-serif;font-size:11px;font-weight:600;color:${p.textColor ?? '#1e1535'};white-space:nowrap;">${b.text}</span>
        </td>`).join('')
            return `<!--[riazify:trust_badges:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#ffffff'};">
  <tr><td style="${pad(p)}text-align:center;">
    <table cellpadding="0" cellspacing="0" border="0" align="center">
      <tr>${pills}</tr>
    </table>
  </td></tr>
</table>
<!--[/riazify:trust_badges:${id}]-->`
        },
    },

    // ── 6. Credibility Row ────────────────────────────────────────────────────
    {
        id: 'credibility',
        label: 'Credibility Row',
        description: 'Star rating + feedback score + Top Rated badge',
        toHtml(p: any, id: string): string {
            const accentColor = p.iconColor ?? '#f59e0b'
            return `<!--[riazify:trust_badges:${id}]-->
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;background-color:${p.bgColor ?? '#fffbeb'};border-top:2px solid ${accentColor};border-bottom:2px solid ${accentColor};">
  <tr><td style="${pad(p)}">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="vertical-align:middle;text-align:center;padding-right:16px;border-right:1px solid #fde68a;">
          <p style="margin:0;font-size:20px;letter-spacing:3px;color:${accentColor};">★★★★★</p>
          <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:10px;color:#92400e;font-weight:600;">5-Star Rated</p>
        </td>
        <td style="vertical-align:middle;text-align:center;padding:0 16px;border-right:1px solid #fde68a;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:900;color:${p.textColor ?? '#1e1535'};">{{FEEDBACK_SCORE}}</p>
          <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:10px;color:#6b7280;">Positive Reviews</p>
        </td>
        <td style="vertical-align:middle;text-align:center;padding:0 16px;border-right:1px solid #fde68a;">
          <table cellpadding="0" cellspacing="0" border="0" align="center">
            <tr><td style="background-color:${accentColor};border-radius:4px;padding:4px 12px;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#1e1535;">★ Top Rated Seller</p>
            </td></tr>
          </table>
        </td>
        <td style="vertical-align:middle;text-align:center;padding-left:16px;">
          <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:600;color:${p.textColor ?? '#1e1535'};">{{FEEDBACK_PERCENT}}%</p>
          <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:10px;color:#6b7280;">Positive Feedback</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
<!--[/riazify:trust_badges:${id}]-->`
        },
    },

]

export function getTrustBadgesVariant(variantId: string): BlockVariant {
    return trustBadgesVariants.find(v => v.id === variantId) ?? trustBadgesVariants[0]
}
