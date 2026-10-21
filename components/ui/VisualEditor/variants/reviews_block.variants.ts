// components/ui/VisualEditor/variants/reviews_block.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Customer Reviews Block — 10 Professional eBay Listing Variants
//
// Design rules:
//   • Every variant has a STRUCTURALLY DIFFERENT layout — not colour variations
//   • Table-based HTML only — 100% eBay-compliant, zero JavaScript, zero <div>
//   • PRO variants show eBay-specific elements: DSR ratings, feedback %, badges
//   • Stars always rendered as SVG (crisp at any size, not emoji)
//   • No third-party branding — all badge/label text is seller-controlled
//
// 9 Variants:
//   FREE:
//   1. rev-star-cards            — 3-up card grid, yellow stars, buyer quote
//   2. rev-bold-quote-strip      — Dark panel + trust bar (feedback %) + 3 serif quotes
//   3. rev-verified-buyer-rows   — Horizontal rows, green verified badge, initials avatar
//   PRO:
//   4. rev-magazine-editorial    — Broadsheet masthead + 3 numbered editorial columns + footer
//   5. rev-avatar-rating-cards   — eBay scoreboard metrics + 3 cards with DSR ratings
//   6. rev-dark-luxury           — Analytics stats (Total Reviews, Avg Rating, bar chart) + stacked reviewer rows
//   7. rev-trust-score-banner    — Big 4.9★ hero rating left, reviews stacked right
//   8. rev-minimal-serif-grid    — Hero review + 2 numbered support reviews, pure typography
//   9. rev-trustpilot-showcase   — Store score badge + headline + 3 titled green-star cards
//  10. rev-rating-breakdown-grid — Rating bar chart (5★→1★) + heading/desc + avatar card grid [PRO]
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockVariant {
  id: string
  label: string
  description: string
  thumbnail?: string
  toHtml: (props: any, id: string) => string
}

export interface ReviewItem {
  text?: string
  quote?: string
  author?: string
  name?: string
  rating?: number
  date?: string
  location?: string
}

// ── Default Reviews ───────────────────────────────────────────────────────────
const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    text: 'Exactly as described. Arrived two days early and packaging was excellent. Will definitely order again.',
    author: 'Sarah M.',
    rating: 5,
    date: 'Verified eBay Purchase',
    location: 'United States',
  },
  {
    text: 'Great quality for the price. Seller answered my question within the hour. Highly recommend.',
    author: 'James T.',
    rating: 5,
    date: 'Verified eBay Purchase',
    location: 'United Kingdom',
  },
  {
    text: 'Item was in perfect condition. Fast dispatch, well packaged. A+ seller — saved to favourites.',
    author: 'Linda R.',
    rating: 5,
    date: 'Verified eBay Purchase',
    location: 'Canada',
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function resolveReviews(p: any): ReviewItem[] {
  if (Array.isArray(p.reviews) && p.reviews.length > 0) return p.reviews
  if (Array.isArray(p.testimonials) && p.testimonials.length > 0) return p.testimonials
  return DEFAULT_REVIEWS
}

function pad(p: any, dT = 20, dR = 24, dB = 20, dL = 24): string {
  return `padding:${p.paddingTop ?? dT}px ${p.paddingRight ?? dR}px ${p.paddingBottom ?? dB}px ${p.paddingLeft ?? dL}px;`
}

function resolveAccent(p: any): string { return p.accentColor ?? p.chevronColor ?? '#7530fb' }
function resolveBg(p: any, fallback = '#ffffff'): string { return p.bgColor ?? fallback }
function resolveStarColor(p: any): string { return p.starColor ?? '#f59e0b' }
function resolveTextColor(p: any, fallback = '#111827'): string { return p.textColor ?? p.questionColor ?? fallback }
function resolveSubColor(p: any, fallback = '#6b7280'): string { return p.authorColor ?? p.answerColor ?? fallback }
function resolveBorder(p: any, fallback = '#e5e7eb'): string { return p.borderColor ?? fallback }

/** Render N filled SVG stars in a row */
function stars(count: number, color: string, size = 14): string {
  const n = Math.min(Math.max(Math.round(count ?? 5), 1), 5)
  const star = (c: string, s: number) =>
    `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${c}" style="display:inline-block;vertical-align:middle;margin:0 1px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
  return Array.from({ length: n }, () => star(color, size)).join('')
}

/** Initials from a name string */
function initials(name: string): string {
  if (!name) return 'V'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function outerWrap(id: string, inner: string): string {
  return `<!--[riazify:reviews_block:${id}]-->
<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="display:table !important;width:100% !important;min-width:100% !important;max-width:100% !important;box-sizing:border-box;margin:0;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr><td>${inner}</td></tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. STAR CARDS  [FREE]
// 3-up card grid. Yellow star row at top, italic quote, buyer name.
// Classic, recognisable, works for any product category.
// ─────────────────────────────────────────────────────────────────────────────
function starCards(p: any, id: string): string {
  const bg = resolveBg(p)
  const accent = resolveAccent(p)
  const starCol = resolveStarColor(p)
  const textCol = resolveTextColor(p)
  const subCol = resolveSubColor(p)
  const borderCol = resolveBorder(p)
  const reviews = resolveReviews(p)

  // Group into rows of 3
  const rows: ReviewItem[][] = []
  for (let i = 0; i < reviews.length; i += 3) rows.push(reviews.slice(i, i + 3))

  const rowsHtml = rows.map((row, ri) => {
    const cells = row.map(r => {
      const quote = r.text ?? r.quote ?? ''
      const author = r.author ?? r.name ?? 'Verified Buyer'
      const date = r.date ?? 'Verified Purchase'
      return `
      <td width="${Math.floor(100 / Math.min(row.length, 3))}%" valign="top" style="padding:${ri > 0 ? '8' : '0'}px 4px 0;vertical-align:top;box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#ffffff;border:1px solid ${borderCol};border-radius:8px;height:100%;">
          <tr>
            <td style="padding:14px 14px 6px;border-bottom:1px solid ${borderCol};">
              <p style="margin:0;">${stars(r.rating ?? 5, starCol, 14)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 14px 6px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-style:italic;color:${textCol};line-height:1.6;">&ldquo;${quote}&rdquo;</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 14px 14px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:${accent};">&#8212; ${author}</p>
              <p style="margin:2px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${subCol};">${date}</p>
            </td>
          </tr>
        </table>
      </td>`
    }).join('')
    // fill empty cells on last row
    let fill = ''
    for (let e = row.length; e < 3; e++) fill += `<td width="${Math.floor(100/3)}%" style="padding:0 4px;"></td>`
    return `<tr>${cells}${fill}</tr>`
  }).join('')

  const inner = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bg};">
  <tr>
    <td style="${pad(p, 20, 16, 20, 16)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:14px;">
        <tr>
          <td>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:${accent};letter-spacing:0.1em;text-transform:uppercase;">What Our Buyers Say</p>
          </td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;table-layout:fixed;">${rowsHtml}</table>
    </td>
  </tr>
</table>`
  return outerWrap(id, inner)
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. BOLD QUOTE STRIP  [FREE]
// Dark panel with seller trust bar at top: star score + Positive Feedback %.
// Three buyer quotes in serif italic, stacked with oversized " marks.
// Stops the eye — social proof communicated instantly.
// ─────────────────────────────────────────────────────────────────────────────
function boldQuoteStrip(p: any, id: string): string {
  const sectionBg  = p.questionBg ?? '#1e1535'
  const starCol    = resolveStarColor(p)
  const accent     = resolveAccent(p)
  const feedbackPct = p.feedbackPct ?? '99.8'
  const reviews    = resolveReviews(p)

  const rows = reviews.map((r, i) => {
    const quote  = r.text ?? r.quote ?? ''
    const author = r.author ?? r.name ?? 'Verified Buyer'
    const date   = r.date ?? 'Verified eBay Purchase'
    return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;${i > 0 ? 'padding-top:18px;border-top:1px solid rgba(255,255,255,0.08);' : ''}${i < reviews.length - 1 ? 'padding-bottom:18px;' : ''}">
      <tr>
        <td width="28" valign="top" style="width:28px;padding-right:12px;padding-top:4px;">
          <p style="margin:0;font-family:Georgia,serif;font-size:44px;line-height:0.75;color:${accent};opacity:0.8;">&ldquo;</p>
        </td>
        <td valign="top">
          <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-style:italic;color:#f0f0f0;line-height:1.7;">${quote}</p>
          <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr>
              <td style="padding-right:10px;vertical-align:middle;">
                <p style="margin:0;">${stars(r.rating ?? 5, starCol, 11)}</p>
              </td>
              <td style="vertical-align:middle;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#ffffff;">&#8212; ${author}&nbsp;<span style="font-weight:400;color:rgba(255,255,255,0.45);">&middot; ${date}</span></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
  }).join('')

  return outerWrap(id, `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${sectionBg};border-left:4px solid ${accent};">
  <tr>
    <td>
      <!-- Trust bar -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.08);">
        <tr>
          <td style="padding:11px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td style="vertical-align:middle;">
                  <p style="margin:0;">${stars(5, starCol, 13)}<span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#ffffff;vertical-align:middle;margin-left:8px;">5.0 / 5.0</span></p>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:rgba(22,163,74,0.2);border:1px solid rgba(22,163,74,0.45);border-radius:4px;">
                    <tr>
                      <td style="padding:4px 10px;">
                        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#4ade80;letter-spacing:0.03em;">&#10003; ${feedbackPct}% Positive Feedback</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <!-- Quotes -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="${pad(p, 20, 24, 20, 24)}box-sizing:border-box;">
            ${rows}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`)
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. VERIFIED BUYER ROWS  [FREE]
// Each review as a horizontal row. Left: green shield + initial circle.
// Right: stars + quote + name. Hairline between rows. Clean, efficient.
// ─────────────────────────────────────────────────────────────────────────────
function verifiedBuyerRows(p: any, id: string): string {
  const bg = resolveBg(p)
  const textCol = resolveTextColor(p)
  const subCol = resolveSubColor(p)
  const starCol = resolveStarColor(p)
  const borderCol = resolveBorder(p)
  const reviews = resolveReviews(p)

  const rows = reviews.map((r, i) => {
    const quote = r.text ?? r.quote ?? ''
    const author = r.author ?? r.name ?? 'Verified Buyer'
    const date = r.date ?? ''
    const ini = initials(author)
    return `
    <tr>
      <td style="padding:${i === 0 ? '0' : '16px'} 0 16px;border-bottom:${i === reviews.length - 1 ? 'none' : `1px solid ${borderCol}`};box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
          <tr>
            <td width="40" style="width:40px;vertical-align:top;padding-right:12px;">
              <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td style="width:36px;height:36px;background-color:#16a34a;border-radius:50%;text-align:center;line-height:36px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#ffffff;">${ini}</td>
                </tr>
                <tr>
                  <td style="padding-top:4px;text-align:center;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:8px;font-weight:700;color:#16a34a;letter-spacing:0.03em;">&#10003;&nbsp;Verified</p>
                  </td>
                </tr>
              </table>
            </td>
            <td style="vertical-align:top;">
              <p style="margin:0 0 3px;">${stars(r.rating ?? 5, starCol, 13)}</p>
              <p style="margin:0 0 5px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${textCol};line-height:1.6;">&ldquo;${quote}&rdquo;</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:${textCol};">${author}${date ? `<span style="font-weight:400;color:${subCol};margin-left:6px;">&#8901; ${date}</span>` : ''}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
  }).join('')

  const inner = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bg};">
  <tr>
    <td style="${pad(p)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:14px;">
        <tr>
          <td style="border-bottom:2px solid ${borderCol};padding-bottom:12px;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${textCol};">Buyer Reviews</p>
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
// 4. MAGAZINE EDITORIAL  [PRO]
// Broadsheet newspaper layout. Bold uppercase masthead with "CUSTOMER FEEDBACK"
// + "VERIFIED PURCHASES" badge on right. Thick top rule. Below: 3 editorial
// columns separated by hairlines, each numbered (01 / 02 / 03) with italic
// serif quote, author in small caps, and a green "POSITIVE FEEDBACK" badge.
// Footer: total feedback count attribution line.
// ─────────────────────────────────────────────────────────────────────────────
function magazineEditorial(p: any, id: string): string {
  const bg         = resolveBg(p)
  const textCol    = resolveTextColor(p)
  const subCol     = resolveSubColor(p)
  const starCol    = resolveStarColor(p)
  const accent     = resolveAccent(p)
  const borderCol  = resolveBorder(p)
  const reviews    = resolveReviews(p)
  const totalCount = p.reviewCount ?? '2,400'

  const nums = ['01', '02', '03']
  const cols = reviews.slice(0, 3).map((r, i) => {
    const quote  = r.text ?? r.quote ?? ''
    const author = r.author ?? r.name ?? 'Verified Buyer'
    const date   = r.date ?? 'Verified eBay Purchase'
    const isLast = i === 2
    return `
    <td width="33%" valign="top" style="width:33.33%;padding:0 ${isLast ? '0' : '20px'} 0 ${i === 0 ? '0' : '20px'};vertical-align:top;${i < 2 ? `border-right:1px solid ${borderCol};` : ''}box-sizing:border-box;">
      <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:900;color:${borderCol};line-height:1;">${nums[i]}</p>
      <p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:13px;font-style:italic;color:${textCol};line-height:1.75;">&ldquo;${quote}&rdquo;</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-top:1px solid ${borderCol};">
        <tr>
          <td style="padding-top:10px;">
            <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:${textCol};letter-spacing:0.06em;text-transform:uppercase;">${author}</p>
            <p style="margin:0 0 6px;">${stars(r.rating ?? 5, starCol, 10)}</p>
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:3px;">
              <tr>
                <td style="padding:3px 8px;">
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:700;color:#16a34a;letter-spacing:0.04em;">&#10003; POSITIVE FEEDBACK</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>`
  }).join('')

  return outerWrap(id, `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bg};">
  <tr>
    <td style="${pad(p, 24, 28, 28, 28)}box-sizing:border-box;">
      <!-- Masthead -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-top:3px solid ${textCol};margin-bottom:20px;">
        <tr>
          <td style="padding-top:10px;vertical-align:middle;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:900;color:${textCol};letter-spacing:0.14em;text-transform:uppercase;">Customer Feedback</p>
          </td>
          <td align="right" style="vertical-align:middle;padding-top:10px;">
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${accent};border-radius:3px;">
              <tr>
                <td style="padding:4px 10px;">
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:700;color:#ffffff;letter-spacing:0.08em;">VERIFIED PURCHASES</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top:10px;border-bottom:1px solid ${borderCol};font-size:0;">&nbsp;</td>
        </tr>
      </table>
      <!-- 3-column editorial grid -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;table-layout:fixed;">
        <tr>${cols}</tr>
      </table>
      <!-- Footer -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-top:1px solid ${borderCol};margin-top:20px;">
        <tr>
          <td style="padding-top:12px;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${subCol};">All reviews from verified eBay purchases &nbsp;&middot;&nbsp; <span style="font-weight:700;color:${textCol};">${totalCount}+ positive feedbacks</span></p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`)
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. AVATAR RATING CARDS  [PRO]
// eBay Seller Scoreboard: dashboard metrics row at top (Feedback Score,
// Positive %, Items Sold, Seller Status). Below: 3 cards each with a green
// "POSITIVE FEEDBACK" badge, initials avatar, review text, and DSR mini-ratings
// (Item as Described · Dispatch Speed · Communication) with star rows.
// ─────────────────────────────────────────────────────────────────────────────
function avatarRatingCards(p: any, id: string): string {
  const bg            = resolveBg(p)
  const textCol       = resolveTextColor(p)
  const subCol        = resolveSubColor(p)
  const starCol       = resolveStarColor(p)
  const accent        = resolveAccent(p)
  const borderCol     = resolveBorder(p)
  const reviews       = resolveReviews(p)
  const feedbackScore = p.feedbackScore ?? '4,832'
  const feedbackPct   = p.feedbackPct   ?? '99.8'
  const itemsSold     = p.itemsSold     ?? '12,400+'
  const sellerStatus  = p.sellerStatus  ?? 'Top Rated'

  const metrics = [
    { label: 'Feedback Score', value: feedbackScore, col: textCol },
    { label: 'Positive Feedback', value: `${feedbackPct}%`, col: '#16a34a' },
    { label: 'Items Sold', value: itemsSold, col: accent },
    { label: 'Seller Status', value: sellerStatus, col: '#d97706' },
  ]

  const metricTiles = metrics.map((m, i) => `
    <td width="25%" style="padding:14px 10px;text-align:center;${i < 3 ? `border-right:1px solid ${borderCol};` : ''}vertical-align:middle;box-sizing:border-box;">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:900;color:${m.col};line-height:1;">${m.value}</p>
      <p style="margin:4px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:700;color:${subCol};letter-spacing:0.05em;text-transform:uppercase;">${m.label}</p>
    </td>`).join('')

  const dsrRow = (label: string) =>
    `<tr><td style="padding:2px 0;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:9px;color:${subCol};">${label}</p></td><td align="right">${stars(5, starCol, 9)}</td></tr></table></td></tr>`

  const cards = reviews.slice(0, 3).map((r, i) => {
    const quote  = r.text ?? r.quote ?? ''
    const author = r.author ?? r.name ?? 'Verified Buyer'
    const date   = r.date ?? 'Verified eBay Purchase'
    const ini    = initials(author)
    return `
    <td width="33%" valign="top" style="width:33.33%;padding:0 ${i < 2 ? '6px' : '0'} 0 ${i > 0 ? '6px' : '0'};vertical-align:top;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#ffffff;border:1px solid ${borderCol};border-radius:8px;">
        <tr>
          <td style="background-color:#f0fdf4;border-bottom:1px solid #bbf7d0;padding:6px 12px;border-radius:8px 8px 0 0;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:700;color:#16a34a;letter-spacing:0.06em;">&#10003; POSITIVE FEEDBACK</p>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 12px 8px;">
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td width="32" style="width:32px;vertical-align:middle;padding-right:10px;">
                  <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="width:30px;height:30px;background-color:${accent};border-radius:50%;text-align:center;line-height:30px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#ffffff;">${ini}</td>
                    </tr>
                  </table>
                </td>
                <td style="vertical-align:middle;">
                  <p style="margin:0 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:${textCol};">${author}</p>
                  <p style="margin:0;">${stars(r.rating ?? 5, starCol, 10)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 12px 10px;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${textCol};line-height:1.65;">&ldquo;${quote}&rdquo;</p>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 12px 12px;border-top:1px solid ${borderCol};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              ${dsrRow('Item as Described')}
              ${dsrRow('Dispatch Speed')}
              ${dsrRow('Communication')}
            </table>
            <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:9px;color:${subCol};">${date}</p>
          </td>
        </tr>
      </table>
    </td>`
  }).join('')

  return outerWrap(id, `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bg};">
  <tr>
    <td style="${pad(p, 20, 20, 20, 20)}box-sizing:border-box;">
      <!-- Seller metrics dashboard -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:1px solid ${borderCol};border-radius:8px;background-color:#f9fafb;margin-bottom:16px;">
        <tr>${metricTiles}</tr>
      </table>
      <!-- Review cards with DSR ratings -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;table-layout:fixed;">
        <tr>${cards}</tr>
      </table>
    </td>
  </tr>
</table>`)
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. DARK LUXURY  [PRO]  — now: REVIEW ANALYTICS DASHBOARD
// Header row: section title (left) + date range (right).
// Stats panel (3 columns): Total Reviews + growth badge | Average Rating + stars
// | Coloured mini rating-distribution bar chart.
// Below: Stacked reviewer rows — square initials avatar, name, "Total Spend" +
// "Total Review" meta, star row + date right-aligned, review text, then
// decorative "Public Comment" / "Direct Message" outline buttons (no links,
// 100% eBay safe — purely visual).
// ─────────────────────────────────────────────────────────────────────────────
function darkLuxury(p: any, id: string): string {
  const bg        = resolveBg(p, '#ffffff')
  const textCol   = resolveTextColor(p)
  const subCol    = resolveSubColor(p)
  const starCol   = resolveStarColor(p)
  const accent    = resolveAccent(p)
  const borderCol = resolveBorder(p)
  const reviews   = resolveReviews(p)

  // Header props
  const sectionTitle = p.sectionTitle ?? 'Reviews'
  const dateRange    = p.dateRange    ?? 'January 2023 – December 2023'
  const totalReviews = p.totalReviews ?? '2.8K'
  const reviewGrowth = p.reviewGrowth ?? '+21%'

  // Average rating computed from reviews
  const avg    = reviews.reduce((s: number, r: ReviewItem) => s + (r.rating ?? 5), 0) / reviews.length
  const avgStr = avg.toFixed(1)

  // Rating breakdown counts: [5★, 4★, 3★, 2★, 1★]
  const ratingCounts: number[] = p.ratingCounts ?? [2000, 1000, 500, 200, 8]
  const maxCount = Math.max(...ratingCounts, 1)
  const fmtCount = (n: number) => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : String(n)

  // Coloured bar palette matching the screenshot
  const barColors = ['#22c55e', '#3b82f6', '#eab308', '#f97316', '#ef4444']

  // Pre-build mini bar rows for the 3rd stats column
  const miniBarRows = [5, 4, 3, 2, 1].map((star, i) => {
    const count = ratingCounts[5 - star] ?? 0
    const pct   = Math.max(Math.round((count / maxCount) * 100), 3)
    return `
    <tr>
      <td style="padding:2px 5px 2px 0;white-space:nowrap;vertical-align:middle;">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:9px;color:${subCol};line-height:1;">${star}</p>
      </td>
      <td style="padding:2px 6px 2px 0;vertical-align:middle;">
        <table width="72" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:72px;background-color:${borderCol};border-radius:99px;height:5px;">
          <tr>
            <td width="${pct}%" style="width:${pct}%;background-color:${barColors[i]};border-radius:99px;height:5px;font-size:0;line-height:0;">&nbsp;</td>
            <td style="height:5px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
        </table>
      </td>
      <td style="padding:2px 0;white-space:nowrap;vertical-align:middle;">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:9px;color:${subCol};line-height:1;">${fmtCount(count)}</p>
      </td>
    </tr>`
  }).join('')

  // Avatar colour palette
  const avatarPalette = [accent, '#16a34a', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ef4444']

  // Stacked review rows
  const reviewRows = reviews.slice(0, 4).map((r: ReviewItem, i: number) => {
    const name      = r.author ?? r.name ?? 'Verified Buyer'
    const quote     = r.text ?? r.quote ?? ''
    const date      = r.date ?? 'Verified eBay Purchase'
    const rating    = r.rating ?? 5
    const ini       = initials(name)
    const spend     = (r as any).spend       ?? '$200'
    const revCount  = (r as any).reviewCount ?? '14'
    const avatarBg  = avatarPalette[i % avatarPalette.length]
    const heartCol  = rating >= 4 ? accent : borderCol

    return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;${i > 0 ? `border-top:1px solid ${borderCol};margin-top:0;padding-top:20px;` : 'padding-bottom:20px;'}${i > 0 ? 'padding-bottom:20px;' : ''}">
      <tr>
        <!-- Square initials avatar -->
        <td width="58" valign="top" style="width:58px;vertical-align:top;padding-top:${i > 0 ? '20px' : '0'};">
          <table width="50" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:50px;height:50px;background-color:${avatarBg};border-radius:8px;">
            <tr>
              <td align="center" style="text-align:center;vertical-align:middle;width:50px;height:50px;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:700;color:#ffffff;line-height:50px;">${ini}</p>
              </td>
            </tr>
          </table>
        </td>
        <!-- Review body -->
        <td valign="top" style="vertical-align:top;padding-left:14px;padding-top:${i > 0 ? '20px' : '0'};">
          <!-- Name row + stars/date right -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:10px;">
            <tr>
              <td valign="top" style="vertical-align:top;">
                <p style="margin:0 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${textCol};">${name}</p>
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${subCol};">Total Spend: ${spend}</p>
                <p style="margin:1px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${subCol};">Total Review: ${revCount}</p>
              </td>
              <td align="right" valign="top" style="text-align:right;vertical-align:top;white-space:nowrap;padding-left:12px;">
                <p style="margin:0 0 3px;">${stars(rating, starCol, 13)}</p>
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${subCol};">${date}</p>
              </td>
            </tr>
          </table>
          <!-- Review text -->
          <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${subCol};line-height:1.75;">${quote}</p>
          <!-- Decorative action buttons (visual only — no links, 100% eBay safe) -->
          <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr>
              <td style="padding-right:8px;">
                <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:1px solid ${borderCol};border-radius:6px;">
                  <tr><td style="padding:6px 16px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${textCol};white-space:nowrap;">Public Comment</p>
                  </td></tr>
                </table>
              </td>
              <td style="padding-right:8px;">
                <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:1px solid ${borderCol};border-radius:6px;">
                  <tr><td style="padding:6px 16px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${textCol};white-space:nowrap;">Direct Message</p>
                  </td></tr>
                </table>
              </td>
              <td>
                <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:30px;height:30px;border:1px solid ${borderCol};border-radius:6px;">
                  <tr><td align="center" style="text-align:center;vertical-align:middle;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${heartCol};">&#9825;</p>
                  </td></tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
  }).join('')

  return outerWrap(id, `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bg};">
  <tr>
    <td style="${pad(p, 24, 20, 20, 20)}box-sizing:border-box;">

      <!-- HEADER: title left, date range right -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:16px;">
        <tr>
          <td valign="middle" style="vertical-align:middle;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:800;color:${textCol};">${sectionTitle}</p>
          </td>
          <td align="right" valign="middle" style="text-align:right;vertical-align:middle;white-space:nowrap;padding-left:12px;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${subCol};">${dateRange}</p>
          </td>
        </tr>
      </table>

      <!-- STATS PANEL: 3 columns -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#f9fafb;border:1px solid ${borderCol};border-radius:10px;margin-bottom:22px;">
        <tr>
          <!-- Col 1: Total Reviews + growth -->
          <td width="34%" valign="middle" style="width:34%;padding:18px 20px;vertical-align:middle;border-right:1px solid ${borderCol};box-sizing:border-box;">
            <p style="margin:0 0 5px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;color:${subCol};">Total Reviews</p>
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:5px;">
              <tr>
                <td valign="baseline" style="padding-right:8px;">
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:800;color:${textCol};line-height:1;">${totalReviews}</p>
                </td>
                <td valign="baseline">
                  <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#dcfce7;border-radius:4px;">
                    <tr><td style="padding:3px 7px;">
                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#16a34a;white-space:nowrap;">${reviewGrowth} &#x2197;</p>
                    </td></tr>
                  </table>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${subCol};">Growth in reviews on this year</p>
          </td>
          <!-- Col 2: Average Rating + stars -->
          <td width="32%" valign="middle" style="width:32%;padding:18px 20px;vertical-align:middle;border-right:1px solid ${borderCol};box-sizing:border-box;">
            <p style="margin:0 0 5px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;color:${subCol};">Average Rating</p>
            <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:800;color:${textCol};line-height:1;">${avgStr}</p>
            <p style="margin:0 0 5px;">${stars(Math.round(avg), starCol, 15)}</p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${subCol};">Average rating on this year</p>
          </td>
          <!-- Col 3: Coloured rating distribution bars -->
          <td valign="middle" style="vertical-align:middle;padding:18px 20px;box-sizing:border-box;">
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${miniBarRows}</table>
          </td>
        </tr>
      </table>

      <!-- REVIEW ROWS: stacked with avatar, meta, text, action buttons -->
      ${reviewRows}

    </td>
  </tr>
</table>`)
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. TRUST SCORE BANNER  [PRO]
// Left column: giant "4.9" hero rating number, stars, "Based on X reviews".
// Right column: 3 short review quotes stacked. Like Amazon's review summary.
// The most conversion-focused layout — buyers see the score before reading.
// ─────────────────────────────────────────────────────────────────────────────
function trustScoreBanner(p: any, id: string): string {
  const bg = resolveBg(p)
  const textCol = resolveTextColor(p)
  const subCol = resolveSubColor(p)
  const starCol = resolveStarColor(p)
  const accent = resolveAccent(p)
  const borderCol = resolveBorder(p)
  const reviews = resolveReviews(p)

  // Calculate average rating
  const avg = reviews.reduce((s, r) => s + (r.rating ?? 5), 0) / reviews.length
  const displayAvg = avg.toFixed(1)

  const reviewList = reviews.slice(0, 4).map((r, i) => {
    const quote = r.text ?? r.quote ?? ''
    const author = r.author ?? r.name ?? 'Verified Buyer'
    return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;${i > 0 ? `border-top:1px solid ${borderCol};padding-top:10px;` : ''}${i < Math.min(reviews.length, 4) - 1 ? 'padding-bottom:10px;' : ''}">
      <tr>
        <td>
          <p style="margin:0 0 2px;">${stars(r.rating ?? 5, starCol, 10)}</p>
          <p style="margin:0 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${textCol};line-height:1.5;">&ldquo;${quote.length > 90 ? quote.slice(0, 87) + '&hellip;' : quote}&rdquo;</p>
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:${subCol};">&#8212; ${author}</p>
        </td>
      </tr>
    </table>`
  }).join('')

  const inner = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bg};border:1px solid ${borderCol};border-radius:8px;border-left:4px solid ${accent};">
  <tr>
    <td style="${pad(p)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td width="38%" style="width:38%;vertical-align:middle;border-right:1px solid ${borderCol};padding-right:20px;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:${accent};letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Buyer Rating</p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:52px;font-weight:900;color:${textCol};line-height:1;">${displayAvg}</p>
            <p style="margin:4px 0;">${stars(Math.round(avg), starCol, 16)}</p>
            <p style="margin:4px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${subCol};">out of 5.0</p>
            <p style="margin:2px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${subCol};">Based on ${reviews.length} review${reviews.length !== 1 ? 's' : ''}</p>
          </td>
          <td style="vertical-align:top;padding-left:20px;">
            ${reviewList}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
  return outerWrap(id, inner)
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. MINIMAL SERIF GRID  [PRO]
// Typographic manifesto — asymmetric hierarchy:
// HERO: First review at full width, 17px italic serif, large 72px open-quote,
//       author with 2px rule below quote text, right-aligned stars.
// SUPPORT: Remaining 2 reviews side-by-side, numbered 02/03, 13px italic,
//          thin rule separator, small-caps author + "Verified eBay Purchase".
// Zero backgrounds, zero card boxes — pure typography and space.
// ─────────────────────────────────────────────────────────────────────────────
function minimalSerifGrid(p: any, id: string): string {
  const bg        = resolveBg(p)
  const textCol   = resolveTextColor(p)
  const subCol    = resolveSubColor(p)
  const starCol   = resolveStarColor(p)
  const accent    = resolveAccent(p)
  const borderCol = resolveBorder(p)
  const reviews   = resolveReviews(p)

  const hero   = reviews[0] ?? DEFAULT_REVIEWS[0]
  const others = reviews.slice(1, 3)

  const heroQuote  = hero.text ?? hero.quote ?? ''
  const heroAuthor = hero.author ?? hero.name ?? 'Verified Buyer'
  const heroDate   = hero.date ?? 'Verified eBay Purchase'

  const supportCols = others.map((r, i) => {
    const quote  = r.text ?? r.quote ?? ''
    const author = r.author ?? r.name ?? 'Verified Buyer'
    const date   = r.date ?? 'Verified eBay Purchase'
    return `
    <td width="50%" valign="top" style="width:50%;${i === 0 ? `padding-right:24px;border-right:1px solid ${borderCol};` : 'padding-left:24px;'}vertical-align:top;box-sizing:border-box;">
      <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:${subCol};letter-spacing:0.06em;">0${i + 2}</p>
      <p style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:13px;font-style:italic;color:${textCol};line-height:1.75;">&ldquo;${quote}&rdquo;</p>
      <p style="margin:0 0 5px;">${stars(r.rating ?? 5, starCol, 11)}</p>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${subCol};letter-spacing:0.04em;text-transform:uppercase;">${author} &middot; ${date}</p>
    </td>`
  }).join('')

  return outerWrap(id, `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bg};">
  <tr>
    <td style="${pad(p, 28, 32, 28, 32)}box-sizing:border-box;">
      <!-- Hero review: full-width with large open-quote -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:28px;">
        <tr>
          <td width="52" valign="top" style="width:52px;vertical-align:top;padding-top:0;">
            <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:72px;line-height:0.62;color:${accent};opacity:0.35;">&ldquo;</p>
          </td>
          <td valign="top" style="vertical-align:top;padding-left:8px;">
            <p style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:17px;font-style:italic;color:${textCol};line-height:1.75;">${heroQuote}&rdquo;</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-top:2px solid ${textCol};">
              <tr>
                <td style="padding-top:12px;vertical-align:middle;">
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:${textCol};letter-spacing:0.05em;text-transform:uppercase;">${heroAuthor}</p>
                  <p style="margin:2px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${subCol};">${heroDate}</p>
                </td>
                <td align="right" style="padding-top:12px;vertical-align:middle;">
                  <p style="margin:0;">${stars(hero.rating ?? 5, starCol, 13)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <!-- Supporting reviews: 2-column, numbered -->
      ${others.length > 0 ? `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border-top:1px solid ${borderCol};">
        <tr>
          <td style="padding-top:22px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;table-layout:fixed;">
              <tr>${supportCols}</tr>
            </table>
          </td>
        </tr>
      </table>` : ''}
    </td>
  </tr>
</table>`)
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. RATING BREAKDOWN GRID  [PRO]
// LEFT PANEL: Star rating bar chart (5★→1★) with counts.
// RIGHT PANEL: Section title + description paragraph + two CTA buttons.
// BELOW: Grid of avatar review cards (up to 6) — circle initials, name, date,
//        star/score on the right, review text below.
// Most information-dense layout — ideal for sellers with many reviews.
// ─────────────────────────────────────────────────────────────────────────────
function ratingBreakdownGrid(p: any, id: string): string {
  const bg        = resolveBg(p)
  const textCol   = resolveTextColor(p)
  const subCol    = resolveSubColor(p)
  const starCol   = resolveStarColor(p)
  const accent    = resolveAccent(p)
  const borderCol = resolveBorder(p)
  const reviews   = resolveReviews(p)

  const sectionTitle = p.sectionTitle ?? 'Customer Ratings'
  const sectionDesc  = p.sectionDesc  ?? 'Every review below comes from a verified eBay purchase — honest feedback from real buyers who received the item.'

  // Rating breakdown counts: index 0 = 5-star, index 4 = 1-star
  const ratingCounts: number[] = p.ratingCounts ?? [989, 4500, 50, 16, 8]
  const maxCount = Math.max(...ratingCounts, 1)

  const fmtCount = (n: number) =>
    n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'K' : String(n)

  // Horizontal bar rows (5★ → 1★)
  const barRows = [5, 4, 3, 2, 1].map(star => {
    const idx   = 5 - star
    const count = ratingCounts[idx] ?? 0
    const pct   = Math.max(Math.round((count / maxCount) * 100), 2)
    return `
    <tr>
      <td style="padding:3px 6px 3px 0;white-space:nowrap;vertical-align:middle;">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:${textCol};line-height:1;">${star}</p>
      </td>
      <td style="padding:3px 4px 3px 0;vertical-align:middle;">
        <p style="margin:0;line-height:1;">${stars(1, starCol, 10)}</p>
      </td>
      <td style="padding:3px 8px 3px 0;vertical-align:middle;width:100%;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${borderCol};border-radius:99px;height:7px;overflow:hidden;">
          <tr>
            <td width="${pct}%" style="width:${pct}%;background-color:${accent};border-radius:99px;height:7px;font-size:0;line-height:0;">&nbsp;</td>
            <td style="height:7px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
        </table>
      </td>
      <td style="padding:3px 0;vertical-align:middle;white-space:nowrap;text-align:right;">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${subCol};line-height:1;">${fmtCount(count)}</p>
      </td>
    </tr>`
  }).join('')

  // Avatar colours — cycle through accent + fixed palette
  const avatarPalette = [accent, '#16a34a', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ef4444']

  // Card grid — up to 6 reviews, rows of 3
  const cardList = reviews.slice(0, 6)
  const cardRows: typeof cardList[] = []
  for (let i = 0; i < cardList.length; i += 3) cardRows.push(cardList.slice(i, i + 3))

  const cardRowsHtml = cardRows.map((row, ri) => {
    const cells = row.map((r, ci) => {
      const name   = r.author ?? r.name ?? 'Verified Buyer'
      const quote  = r.text ?? r.quote ?? ''
      const date   = r.date ?? 'Verified eBay Purchase'
      const rating = r.rating ?? 5
      const ini    = initials(name)
      const avatarBg = avatarPalette[(ri * 3 + ci) % avatarPalette.length]
      const truncated = quote.length > 115 ? quote.slice(0, 112) + '&hellip;' : quote

      return `
      <td width="33%" valign="top" style="width:33%;padding:${ri > 0 ? '10' : '0'}px 4px 0;vertical-align:top;box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#ffffff;border:1px solid ${borderCol};border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,0.05);">
          <tr>
            <td style="padding:14px 14px 10px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td width="38" style="width:38px;vertical-align:middle;">
                    <table width="34" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:34px;height:34px;background-color:${avatarBg};border-radius:50%;">
                      <tr>
                        <td align="center" style="text-align:center;vertical-align:middle;width:34px;height:34px;">
                          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#ffffff;line-height:34px;">${ini}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td valign="middle" style="vertical-align:middle;padding-left:10px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:${textCol};line-height:1.2;">${name}</p>
                    <p style="margin:2px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${subCol};line-height:1.2;">${date}</p>
                  </td>
                  <td align="right" valign="middle" style="text-align:right;vertical-align:middle;white-space:nowrap;">
                    <p style="margin:0;line-height:1;">${stars(1, starCol, 12)}<span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:${textCol};vertical-align:middle;">&nbsp;${rating}.0</span></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 14px 14px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${subCol};line-height:1.65;">${truncated}</p>
            </td>
          </tr>
        </table>
      </td>`
    }).join('')

    let fill = ''
    for (let e = row.length; e < 3; e++) fill += `<td width="33%" style="padding:0 4px;"></td>`
    return `<tr>${cells}${fill}</tr>`
  }).join('')

  return outerWrap(id, `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bg};">
  <tr>
    <td style="${pad(p, 24, 20, 24, 20)}box-sizing:border-box;">

      <!-- TOP: bars (left) + heading/desc/buttons (right) -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:20px;">
        <tr>

          <!-- LEFT: star breakdown bars -->
          <td width="40%" valign="middle" style="width:40%;vertical-align:middle;padding-right:24px;border-right:1px solid ${borderCol};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${barRows}</table>
          </td>

          <!-- RIGHT: title + description + CTA buttons -->
          <td valign="middle" style="vertical-align:middle;padding-left:24px;">
            <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:800;color:${textCol};line-height:1.15;">${sectionTitle}</p>
            <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${subCol};line-height:1.7;">${sectionDesc}</p>
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding-right:8px;">
                  <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${accent};border-radius:6px;">
                    <tr><td style="padding:9px 16px;">
                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#ffffff;white-space:nowrap;">View All Feedback</p>
                    </td></tr>
                  </table>
                </td>
                <td>
                  <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:1.5px solid ${accent};border-radius:6px;">
                    <tr><td style="padding:8px 16px;">
                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:${accent};white-space:nowrap;">Read Reviews</p>
                    </td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>

        </tr>
      </table>

      <!-- BOTTOM: avatar review card grid -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;table-layout:fixed;">${cardRowsHtml}</table>

    </td>
  </tr>
</table>`)
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG THUMBNAILS
// ─────────────────────────────────────────────────────────────────────────────

export const REVIEWS_BLOCK_THUMBNAILS: Record<string, string> = {

  'rev-star-cards': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#f9fafb"/>
    <rect x="4" y="6" width="22" height="18" rx="3" fill="#fff" stroke="#e5e7eb" stroke-width="0.8"/>
    <line x1="7" y1="11" x2="18" y2="11" stroke="#f59e0b" stroke-width="1.5"/>
    <line x1="7" y1="16" x2="23" y2="16" stroke="#6b7280" stroke-width="0.8"/>
    <line x1="7" y1="20" x2="19" y2="20" stroke="#7530fb" stroke-width="0.9"/>
    <rect x="29" y="6" width="22" height="18" rx="3" fill="#fff" stroke="#e5e7eb" stroke-width="0.8"/>
    <line x1="32" y1="11" x2="43" y2="11" stroke="#f59e0b" stroke-width="1.5"/>
    <line x1="32" y1="16" x2="48" y2="16" stroke="#6b7280" stroke-width="0.8"/>
    <line x1="32" y1="20" x2="44" y2="20" stroke="#7530fb" stroke-width="0.9"/>
    <rect x="54" y="6" width="22" height="18" rx="3" fill="#fff" stroke="#e5e7eb" stroke-width="0.8"/>
    <line x1="57" y1="11" x2="68" y2="11" stroke="#f59e0b" stroke-width="1.5"/>
    <line x1="57" y1="16" x2="73" y2="16" stroke="#6b7280" stroke-width="0.8"/>
    <line x1="57" y1="20" x2="69" y2="20" stroke="#7530fb" stroke-width="0.9"/>
  </svg>`,

  'rev-bold-quote-strip': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#1e1535"/>
    <rect x="0" y="0" width="3" height="52" fill="#7530fb"/>
    <!-- trust bar -->
    <rect x="0" y="0" width="80" height="10" fill="rgba(255,255,255,0.05)"/>
    <line x1="4" y1="5" x2="32" y2="5" stroke="#f59e0b" stroke-width="1.5"/>
    <rect x="50" y="2" width="26" height="7" rx="2" fill="rgba(22,163,74,0.3)" stroke="rgba(22,163,74,0.6)" stroke-width="0.6"/>
    <line x1="53" y1="5.5" x2="73" y2="5.5" stroke="#4ade80" stroke-width="0.8"/>
    <!-- quotes -->
    <text x="5" y="21" font-family="Georgia,serif" font-size="14" fill="#7530fb" opacity="0.8">&ldquo;</text>
    <line x1="16" y1="17" x2="72" y2="17" stroke="rgba(255,255,255,0.75)" stroke-width="0.9"/>
    <line x1="16" y1="22" x2="68" y2="22" stroke="rgba(255,255,255,0.45)" stroke-width="0.8"/>
    <line x1="16" y1="27" x2="55" y2="27" stroke="#f59e0b" stroke-width="0.9"/>
    <line x1="4" y1="32" x2="76" y2="32" stroke="rgba(255,255,255,0.06)" stroke-width="0.7"/>
    <line x1="16" y1="37" x2="70" y2="37" stroke="rgba(255,255,255,0.75)" stroke-width="0.9"/>
    <line x1="16" y1="42" x2="60" y2="42" stroke="rgba(255,255,255,0.45)" stroke-width="0.8"/>
    <line x1="16" y1="47" x2="50" y2="47" stroke="#f59e0b" stroke-width="0.9"/>
  </svg>`,

  'rev-verified-buyer-rows': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#fff"/>
    <circle cx="12" cy="14" r="6" fill="#16a34a"/>
    <line x1="21" y1="11" x2="38" y2="11" stroke="#f59e0b" stroke-width="1.2"/>
    <line x1="21" y1="16" x2="70" y2="16" stroke="#111827" stroke-width="1"/>
    <line x1="21" y1="21" x2="62" y2="21" stroke="#6b7280" stroke-width="0.8"/>
    <line x1="6" y1="28" x2="74" y2="28" stroke="#e5e7eb" stroke-width="0.8"/>
    <circle cx="12" cy="36" r="6" fill="#16a34a"/>
    <line x1="21" y1="33" x2="38" y2="33" stroke="#f59e0b" stroke-width="1.2"/>
    <line x1="21" y1="38" x2="68" y2="38" stroke="#111827" stroke-width="1"/>
    <line x1="21" y1="43" x2="56" y2="43" stroke="#6b7280" stroke-width="0.8"/>
  </svg>`,

  'rev-magazine-editorial': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#fff"/>
    <!-- masthead thick rule -->
    <rect x="5" y="5" width="70" height="2.5" fill="#111827"/>
    <!-- masthead text + badge -->
    <line x1="5" y1="13" x2="42" y2="13" stroke="#111827" stroke-width="1.1"/>
    <rect x="54" y="9" width="20" height="7" rx="2" fill="#7530fb"/>
    <!-- divider -->
    <line x1="5" y1="19" x2="75" y2="19" stroke="#e5e7eb" stroke-width="0.8"/>
    <!-- 3 editorial columns with vertical dividers -->
    <line x1="31" y1="22" x2="31" y2="50" stroke="#e5e7eb" stroke-width="0.7"/>
    <line x1="56" y1="22" x2="56" y2="50" stroke="#e5e7eb" stroke-width="0.7"/>
    <!-- col 1 -->
    <line x1="7" y1="24" x2="12" y2="24" stroke="#d1d5db" stroke-width="1.5"/>
    <line x1="7" y1="29" x2="27" y2="29" stroke="#111827" stroke-width="0.9"/>
    <line x1="7" y1="33" x2="25" y2="33" stroke="#6b7280" stroke-width="0.7"/>
    <rect x="7" y="42" width="18" height="5" rx="1.5" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="0.5"/>
    <!-- col 2 -->
    <line x1="34" y1="24" x2="39" y2="24" stroke="#d1d5db" stroke-width="1.5"/>
    <line x1="34" y1="29" x2="52" y2="29" stroke="#111827" stroke-width="0.9"/>
    <line x1="34" y1="33" x2="50" y2="33" stroke="#6b7280" stroke-width="0.7"/>
    <rect x="34" y="42" width="18" height="5" rx="1.5" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="0.5"/>
    <!-- col 3 -->
    <line x1="59" y1="24" x2="64" y2="24" stroke="#d1d5db" stroke-width="1.5"/>
    <line x1="59" y1="29" x2="76" y2="29" stroke="#111827" stroke-width="0.9"/>
    <line x1="59" y1="33" x2="74" y2="33" stroke="#6b7280" stroke-width="0.7"/>
    <rect x="59" y="42" width="18" height="5" rx="1.5" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="0.5"/>
  </svg>`,

  'rev-avatar-rating-cards': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#f9fafb"/>
    <!-- metrics dashboard row -->
    <rect x="5" y="4" width="70" height="14" rx="3" fill="#fff" stroke="#e5e7eb" stroke-width="0.7"/>
    <line x1="22" y1="6" x2="22" y2="16" stroke="#e5e7eb" stroke-width="0.6"/>
    <line x1="40" y1="6" x2="40" y2="16" stroke="#e5e7eb" stroke-width="0.6"/>
    <line x1="58" y1="6" x2="58" y2="16" stroke="#e5e7eb" stroke-width="0.6"/>
    <line x1="8" y1="10" x2="19" y2="10" stroke="#111827" stroke-width="1.4"/>
    <line x1="8" y1="14" x2="16" y2="14" stroke="#6b7280" stroke-width="0.6"/>
    <line x1="25" y1="10" x2="36" y2="10" stroke="#16a34a" stroke-width="1.4"/>
    <line x1="25" y1="14" x2="33" y2="14" stroke="#6b7280" stroke-width="0.6"/>
    <line x1="43" y1="10" x2="54" y2="10" stroke="#7530fb" stroke-width="1.4"/>
    <line x1="43" y1="14" x2="51" y2="14" stroke="#6b7280" stroke-width="0.6"/>
    <line x1="61" y1="10" x2="72" y2="10" stroke="#d97706" stroke-width="1.4"/>
    <line x1="61" y1="14" x2="69" y2="14" stroke="#6b7280" stroke-width="0.6"/>
    <!-- 3 DSR cards -->
    <rect x="5" y="21" width="21" height="28" rx="3" fill="#fff" stroke="#e5e7eb" stroke-width="0.7"/>
    <rect x="5" y="21" width="21" height="5" rx="3" fill="#f0fdf4"/>
    <circle cx="13" cy="33" r="4" fill="#7530fb"/>
    <line x1="19" y1="31" x2="25" y2="31" stroke="#111827" stroke-width="0.7"/>
    <line x1="8" y1="41" x2="24" y2="41" stroke="#e5e7eb" stroke-width="0.5"/>
    <line x1="8" y1="44" x2="22" y2="44" stroke="#6b7280" stroke-width="0.5"/>
    <rect x="30" y="21" width="21" height="28" rx="3" fill="#fff" stroke="#e5e7eb" stroke-width="0.7"/>
    <rect x="30" y="21" width="21" height="5" rx="3" fill="#f0fdf4"/>
    <circle cx="38" cy="33" r="4" fill="#7530fb"/>
    <line x1="44" y1="31" x2="49" y2="31" stroke="#111827" stroke-width="0.7"/>
    <line x1="33" y1="41" x2="49" y2="41" stroke="#e5e7eb" stroke-width="0.5"/>
    <line x1="33" y1="44" x2="47" y2="44" stroke="#6b7280" stroke-width="0.5"/>
    <rect x="55" y="21" width="21" height="28" rx="3" fill="#fff" stroke="#e5e7eb" stroke-width="0.7"/>
    <rect x="55" y="21" width="21" height="5" rx="3" fill="#f0fdf4"/>
    <circle cx="63" cy="33" r="4" fill="#7530fb"/>
    <line x1="69" y1="31" x2="74" y2="31" stroke="#111827" stroke-width="0.7"/>
    <line x1="58" y1="41" x2="74" y2="41" stroke="#e5e7eb" stroke-width="0.5"/>
    <line x1="58" y1="44" x2="72" y2="44" stroke="#6b7280" stroke-width="0.5"/>
  </svg>`,

  'rev-dark-luxury': `<svg viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="56" fill="#ffffff"/>
    <!-- Header: title left, date right -->
    <line x1="4" y1="6" x2="22" y2="6" stroke="#111827" stroke-width="1.4"/>
    <line x1="58" y1="6" x2="76" y2="6" stroke="#9ca3af" stroke-width="0.7"/>
    <!-- Stats panel (3 cols, light gray bg) -->
    <rect x="4" y="11" width="72" height="16" rx="2" fill="#f3f4f6" stroke="#e5e7eb" stroke-width="0.5"/>
    <!-- Col dividers -->
    <line x1="29" y1="12" x2="29" y2="26" stroke="#e5e7eb" stroke-width="0.5"/>
    <line x1="54" y1="12" x2="54" y2="26" stroke="#e5e7eb" stroke-width="0.5"/>
    <!-- Col 1: big number + growth badge -->
    <line x1="7" y1="15" x2="16" y2="15" stroke="#111827" stroke-width="1.5"/>
    <rect x="17" y="13" width="8" height="4" rx="1" fill="#dcfce7"/>
    <line x1="7" y1="22" x2="19" y2="22" stroke="#9ca3af" stroke-width="0.6"/>
    <!-- Col 2: big number + stars -->
    <line x1="32" y1="15" x2="41" y2="15" stroke="#111827" stroke-width="1.5"/>
    <line x1="32" y1="19" x2="50" y2="19" stroke="#f59e0b" stroke-width="1.2"/>
    <line x1="32" y1="22" x2="44" y2="22" stroke="#9ca3af" stroke-width="0.6"/>
    <!-- Col 3: mini colored bars (5★→1★) -->
    <rect x="57" y="13" width="16" height="1.5" rx="1" fill="#22c55e"/>
    <rect x="57" y="16" width="12" height="1.5" rx="1" fill="#3b82f6"/>
    <rect x="57" y="19" width="8"  height="1.5" rx="1" fill="#eab308"/>
    <rect x="57" y="22" width="5"  height="1.5" rx="1" fill="#f97316"/>
    <rect x="57" y="25" width="2"  height="1.5" rx="1" fill="#ef4444"/>
    <!-- Review row 1 -->
    <rect x="4" y="31" width="8" height="8" rx="1.5" fill="#6366f1"/>
    <line x1="15" y1="33" x2="30" y2="33" stroke="#111827" stroke-width="0.9"/>
    <line x1="15" y1="36" x2="26" y2="36" stroke="#9ca3af" stroke-width="0.6"/>
    <line x1="15" y1="38" x2="24" y2="38" stroke="#9ca3af" stroke-width="0.6"/>
    <line x1="60" y1="33" x2="76" y2="33" stroke="#f59e0b" stroke-width="0.9"/>
    <!-- Review row 2 -->
    <rect x="4" y="44" width="8" height="8" rx="1.5" fill="#16a34a"/>
    <line x1="15" y1="46" x2="32" y2="46" stroke="#111827" stroke-width="0.9"/>
    <line x1="15" y1="49" x2="27" y2="49" stroke="#9ca3af" stroke-width="0.6"/>
    <line x1="15" y1="51" x2="25" y2="51" stroke="#9ca3af" stroke-width="0.6"/>
    <line x1="60" y1="46" x2="76" y2="46" stroke="#f59e0b" stroke-width="0.9"/>
  </svg>`,

  'rev-trust-score-banner': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#fff" stroke="#e5e7eb" stroke-width="0.8"/>
    <rect x="0" y="0" width="3" height="52" fill="#7530fb"/>
    <text x="8" y="28" font-family="Arial" font-size="22" font-weight="900" fill="#111827">4.9</text>
    <line x1="8" y1="33" x2="32" y2="33" stroke="#f59e0b" stroke-width="1.5"/>
    <line x1="8" y1="38" x2="28" y2="38" stroke="#6b7280" stroke-width="0.8"/>
    <line x1="38" y1="6" x2="38" y2="46" stroke="#e5e7eb" stroke-width="0.8"/>
    <line x1="43" y1="11" x2="56" y2="11" stroke="#f59e0b" stroke-width="1"/>
    <line x1="43" y1="16" x2="74" y2="16" stroke="#111827" stroke-width="0.9"/>
    <line x1="43" y1="21" x2="68" y2="21" stroke="#6b7280" stroke-width="0.7"/>
    <line x1="43" y1="27" x2="74" y2="27" stroke="#e5e7eb" stroke-width="0.7"/>
    <line x1="43" y1="32" x2="58" y2="32" stroke="#f59e0b" stroke-width="1"/>
    <line x1="43" y1="37" x2="70" y2="37" stroke="#111827" stroke-width="0.9"/>
    <line x1="43" y1="42" x2="64" y2="42" stroke="#6b7280" stroke-width="0.7"/>
  </svg>`,

  'rev-minimal-serif-grid': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#fff"/>
    <!-- hero: large open-quote + serif text -->
    <text x="5" y="18" font-family="Georgia,serif" font-size="18" fill="#7530fb" opacity="0.3">&ldquo;</text>
    <line x1="16" y1="12" x2="74" y2="12" stroke="#111827" stroke-width="1.1"/>
    <line x1="16" y1="17" x2="72" y2="17" stroke="#111827" stroke-width="1.1"/>
    <line x1="16" y1="22" x2="60" y2="22" stroke="#6b7280" stroke-width="0.8"/>
    <!-- hero author rule + name -->
    <line x1="16" y1="27" x2="74" y2="27" stroke="#111827" stroke-width="1.4"/>
    <line x1="16" y1="31" x2="38" y2="31" stroke="#111827" stroke-width="0.9"/>
    <line x1="50" y1="30" x2="66" y2="30" stroke="#f59e0b" stroke-width="0.9"/>
    <!-- horizontal separator -->
    <line x1="6" y1="36" x2="74" y2="36" stroke="#e5e7eb" stroke-width="0.8"/>
    <!-- 2 support cols -->
    <line x1="40" y1="38" x2="40" y2="52" stroke="#e5e7eb" stroke-width="0.7"/>
    <line x1="7" y1="39" x2="10" y2="39" stroke="#d1d5db" stroke-width="1.2"/>
    <line x1="7" y1="43" x2="36" y2="43" stroke="#6b7280" stroke-width="0.7"/>
    <line x1="7" y1="47" x2="34" y2="47" stroke="#6b7280" stroke-width="0.7"/>
    <line x1="43" y1="39" x2="46" y2="39" stroke="#d1d5db" stroke-width="1.2"/>
    <line x1="43" y1="43" x2="72" y2="43" stroke="#6b7280" stroke-width="0.7"/>
    <line x1="43" y1="47" x2="68" y2="47" stroke="#6b7280" stroke-width="0.7"/>
  </svg>`,

  'rev-trustpilot-showcase': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#fff"/>
    <!-- score badge -->
    <rect x="6" y="5" width="20" height="8" rx="2" fill="#00b67a"/>
    <line x1="28" y1="9" x2="44" y2="9" stroke="#00b67a" stroke-width="1.4"/>
    <line x1="46" y1="9" x2="60" y2="9" stroke="#111827" stroke-width="1.1"/>
    <!-- headline -->
    <line x1="6" y1="18" x2="74" y2="18" stroke="#111827" stroke-width="1.2"/>
    <line x1="14" y1="22" x2="66" y2="22" stroke="#6b7280" stroke-width="0.7"/>
    <!-- 3 cards -->
    <rect x="6" y="26" width="20" height="20" rx="3" fill="#fff" stroke="#e5e7eb" stroke-width="0.8"/>
    <line x1="8" y1="30" x2="18" y2="30" stroke="#00b67a" stroke-width="1.1"/>
    <line x1="8" y1="34" x2="24" y2="34" stroke="#111827" stroke-width="0.8"/>
    <line x1="8" y1="38" x2="22" y2="38" stroke="#6b7280" stroke-width="0.6"/>
    <line x1="8" y1="42" x2="20" y2="42" stroke="#7530fb" stroke-width="0.7"/>
    <rect x="30" y="26" width="20" height="20" rx="3" fill="#fff" stroke="#e5e7eb" stroke-width="0.8"/>
    <line x1="32" y1="30" x2="42" y2="30" stroke="#00b67a" stroke-width="1.1"/>
    <line x1="32" y1="34" x2="48" y2="34" stroke="#111827" stroke-width="0.8"/>
    <line x1="32" y1="38" x2="46" y2="38" stroke="#6b7280" stroke-width="0.6"/>
    <line x1="32" y1="42" x2="44" y2="42" stroke="#7530fb" stroke-width="0.7"/>
    <rect x="54" y="26" width="20" height="20" rx="3" fill="#fff" stroke="#e5e7eb" stroke-width="0.8"/>
    <line x1="56" y1="30" x2="66" y2="30" stroke="#00b67a" stroke-width="1.1"/>
    <line x1="56" y1="34" x2="72" y2="34" stroke="#111827" stroke-width="0.8"/>
    <line x1="56" y1="38" x2="70" y2="38" stroke="#6b7280" stroke-width="0.6"/>
    <line x1="56" y1="42" x2="68" y2="42" stroke="#7530fb" stroke-width="0.7"/>
  </svg>`,

  'rev-rating-breakdown-grid': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#f9fafb"/>
    <!-- LEFT: 5-star breakdown bars -->
    <!-- 5★ long bar -->
    <line x1="2" y1="6" x2="7" y2="6" stroke="#111827" stroke-width="1.4"/>
    <rect x="9" y="4.5" width="19" height="3" rx="1.5" fill="#e5e7eb"/>
    <rect x="9" y="4.5" width="17" height="3" rx="1.5" fill="#7530fb"/>
    <line x1="30" y1="6" x2="34" y2="6" stroke="#9ca3af" stroke-width="0.9"/>
    <!-- 4★ medium bar -->
    <line x1="2" y1="11" x2="7" y2="11" stroke="#111827" stroke-width="1.4"/>
    <rect x="9" y="9.5" width="19" height="3" rx="1.5" fill="#e5e7eb"/>
    <rect x="9" y="9.5" width="13" height="3" rx="1.5" fill="#7530fb"/>
    <line x1="30" y1="11" x2="34" y2="11" stroke="#9ca3af" stroke-width="0.9"/>
    <!-- 3★ short bar -->
    <line x1="2" y1="16" x2="7" y2="16" stroke="#111827" stroke-width="1.4"/>
    <rect x="9" y="14.5" width="19" height="3" rx="1.5" fill="#e5e7eb"/>
    <rect x="9" y="14.5" width="4" height="3" rx="1.5" fill="#7530fb"/>
    <line x1="30" y1="16" x2="34" y2="16" stroke="#9ca3af" stroke-width="0.9"/>
    <!-- 2★ tiny bar -->
    <line x1="2" y1="21" x2="7" y2="21" stroke="#111827" stroke-width="1.4"/>
    <rect x="9" y="19.5" width="19" height="3" rx="1.5" fill="#e5e7eb"/>
    <rect x="9" y="19.5" width="2" height="3" rx="1.5" fill="#7530fb"/>
    <line x1="30" y1="21" x2="34" y2="21" stroke="#9ca3af" stroke-width="0.9"/>
    <!-- 1★ minimal bar -->
    <line x1="2" y1="26" x2="7" y2="26" stroke="#111827" stroke-width="1.4"/>
    <rect x="9" y="24.5" width="19" height="3" rx="1.5" fill="#e5e7eb"/>
    <rect x="9" y="24.5" width="1.5" height="3" rx="1.5" fill="#7530fb"/>
    <line x1="30" y1="26" x2="34" y2="26" stroke="#9ca3af" stroke-width="0.9"/>
    <!-- vertical divider -->
    <line x1="37" y1="3" x2="37" y2="29" stroke="#e5e7eb" stroke-width="0.8"/>
    <!-- RIGHT: title + desc lines + 2 buttons -->
    <line x1="40" y1="7" x2="72" y2="7" stroke="#111827" stroke-width="1.8"/>
    <line x1="40" y1="11.5" x2="77" y2="11.5" stroke="#9ca3af" stroke-width="0.8"/>
    <line x1="40" y1="14.5" x2="75" y2="14.5" stroke="#9ca3af" stroke-width="0.8"/>
    <line x1="40" y1="17.5" x2="68" y2="17.5" stroke="#9ca3af" stroke-width="0.8"/>
    <rect x="40" y="21" width="16" height="6" rx="2" fill="#7530fb"/>
    <rect x="58" y="21" width="16" height="6" rx="2" fill="none" stroke="#7530fb" stroke-width="0.9"/>
    <!-- BOTTOM: 3 avatar cards -->
    <rect x="2" y="31" width="23" height="18" rx="3" fill="#fff" stroke="#e5e7eb" stroke-width="0.8"/>
    <circle cx="8" cy="37.5" r="4" fill="#7530fb"/>
    <line x1="14" y1="35.5" x2="23" y2="35.5" stroke="#111827" stroke-width="0.9"/>
    <line x1="14" y1="39" x2="23" y2="39" stroke="#9ca3af" stroke-width="0.7"/>
    <line x1="4" y1="43.5" x2="23" y2="43.5" stroke="#9ca3af" stroke-width="0.7"/>
    <line x1="4" y1="46.5" x2="20" y2="46.5" stroke="#9ca3af" stroke-width="0.7"/>
    <rect x="28" y="31" width="23" height="18" rx="3" fill="#fff" stroke="#e5e7eb" stroke-width="0.8"/>
    <circle cx="34" cy="37.5" r="4" fill="#16a34a"/>
    <line x1="40" y1="35.5" x2="49" y2="35.5" stroke="#111827" stroke-width="0.9"/>
    <line x1="40" y1="39" x2="49" y2="39" stroke="#9ca3af" stroke-width="0.7"/>
    <line x1="30" y1="43.5" x2="49" y2="43.5" stroke="#9ca3af" stroke-width="0.7"/>
    <line x1="30" y1="46.5" x2="46" y2="46.5" stroke="#9ca3af" stroke-width="0.7"/>
    <rect x="55" y="31" width="23" height="18" rx="3" fill="#fff" stroke="#e5e7eb" stroke-width="0.8"/>
    <circle cx="61" cy="37.5" r="4" fill="#0ea5e9"/>
    <line x1="67" y1="35.5" x2="76" y2="35.5" stroke="#111827" stroke-width="0.9"/>
    <line x1="67" y1="39" x2="76" y2="39" stroke="#9ca3af" stroke-width="0.7"/>
    <line x1="57" y1="43.5" x2="76" y2="43.5" stroke="#9ca3af" stroke-width="0.7"/>
    <line x1="57" y1="46.5" x2="73" y2="46.5" stroke="#9ca3af" stroke-width="0.7"/>
  </svg>`,
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. SCORE SHOWCASE  [PRO]
// Aggregate score header (store badge · green star bar · score · label) + bold
// section headline + 3 titled review cards with green stars.
// Seller puts their own store name in the badge — no third-party branding.
// ─────────────────────────────────────────────────────────────────────────────
function scoreShowcase(p: any, id: string): string {
  const bg       = resolveBg(p, '#ffffff')
  const accent   = resolveAccent(p)
  const starCol  = resolveStarColor(p)
  const textCol  = resolveTextColor(p)
  const subCol   = resolveSubColor(p)
  const borderCol = resolveBorder(p)
  const reviews  = resolveReviews(p)

  // Default review titles — sellers can override via props
  const defaultTitles = [
    'First time buying — won\'t be the last',
    'Outstanding Customer Service',
    'Amazing from start to finish',
  ]

  const badgeName  = p.badgeName    ?? p.storeName ?? '★ Verified Reviews'
  const scoreNum   = p.trustScore   ?? '4.9'
  const scoreLabel = p.trustLabel   ?? 'Excellent'
  const scoreCount = p.reviewCount  ?? '2,847'
  const headline   = p.sectionTitle ?? 'What Our Buyers Say About Us'

  // Green star bar (5 filled green stars)
  const greenStar = (s: number) =>
    `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="#00b67a" style="display:inline-block;vertical-align:middle;margin:0 1px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
  const greenStars = (n: number, size: number) =>
    Array.from({ length: n }, () => greenStar(size)).join('')

  // Score header bar
  const header = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
  <tr>
    <td align="center" style="padding:${p.paddingTop ?? 28}px ${p.paddingRight ?? 24}px 18px;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;display:inline-table;">
        <tr>
          <td style="padding-right:16px;vertical-align:middle;">
            <!-- Store badge — seller sets their own name -->
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background:#00b67a;border-radius:4px;">
              <tr>
                <td style="padding:6px 10px;">
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#ffffff;letter-spacing:0.5px;white-space:nowrap;">${badgeName}</p>
                </td>
              </tr>
            </table>
          </td>
          <td style="padding-right:12px;vertical-align:middle;">
            <p style="margin:0;">${greenStars(5, 18)}</p>
          </td>
          <td style="padding-right:6px;vertical-align:middle;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:800;color:${textCol};line-height:1;">${scoreNum}</p>
          </td>
          <td style="vertical-align:middle;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${textCol};line-height:1.1;">${scoreLabel}</p>
            <p style="margin:2px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${subCol};">${scoreCount} reviews</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:0 ${p.paddingRight ?? 24}px 24px;">
      <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:${textCol};line-height:1.3;text-align:center;">${headline}</p>
    </td>
  </tr>
</table>`

  // Review cards — each has a green star row, bold title, italic quote, author
  const first3 = reviews.slice(0, 3)
  const colW = Math.floor(100 / first3.length)

  const cards = first3.map((r, i) => {
    const quote   = r.text ?? r.quote ?? ''
    const author  = r.author ?? r.name ?? 'Verified Buyer'
    const date    = r.date ?? 'Verified eBay Purchase'
    const title   = (p.reviewTitles ?? defaultTitles)[i] ?? defaultTitles[i % 3]
    return `
    <td width="${colW}%" valign="top" style="padding:0 6px;vertical-align:top;box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background:#ffffff;border:1px solid ${borderCol};border-radius:10px;height:100%;">
        <tr>
          <td style="padding:16px 16px 8px;">
            <p style="margin:0 0 8px;">${greenStars(r.rating ?? 5, 15)}</p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${textCol};line-height:1.35;">${title}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 16px 10px;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-style:italic;color:${subCol};line-height:1.6;">&ldquo;${quote}&rdquo;</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 16px 16px;border-top:1px solid ${borderCol};">
            <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:${accent};">&#8212; ${author}</p>
            <p style="margin:2px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${subCol};">${date}</p>
          </td>
        </tr>
      </table>
    </td>`
  }).join('')

  const cardsRow = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
  <tr>
    <td style="padding:0 ${p.paddingLeft ?? 18}px ${p.paddingBottom ?? 28}px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>${cards}</tr>
      </table>
    </td>
  </tr>
</table>`

  return outerWrap(id, `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bg};">
  <tr><td>${header}${cardsRow}</td></tr>
</table>`)
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const reviewsBlockVariants: BlockVariant[] = [
  {
    id: 'rev-star-cards',
    label: 'Star Cards',
    description: '3-up card grid with yellow star rating. Classic layout any buyer recognises instantly.',
    thumbnail: REVIEWS_BLOCK_THUMBNAILS['rev-star-cards'],
    toHtml(props, id) { return starCards(props, id) },
  },
  {
    id: 'rev-bold-quote-strip',
    label: 'Bold Quote Strip',
    description: 'Dark panel with trust bar (5-star rating + Positive Feedback %) and 3 serif buyer quotes. Stops the eye.',
    thumbnail: REVIEWS_BLOCK_THUMBNAILS['rev-bold-quote-strip'],
    toHtml(props, id) { return boldQuoteStrip(props, id) },
  },
  {
    id: 'rev-verified-buyer-rows',
    label: 'Verified Buyer Rows',
    description: 'Horizontal rows with green verified badge and initial circle avatar. Clean and trustworthy.',
    thumbnail: REVIEWS_BLOCK_THUMBNAILS['rev-verified-buyer-rows'],
    toHtml(props, id) { return verifiedBuyerRows(props, id) },
  },
  {
    id: 'rev-magazine-editorial',
    label: 'Magazine Editorial',
    description: 'PRO — Broadsheet newspaper masthead + 3 numbered editorial columns with "POSITIVE FEEDBACK" badges and feedback count footer.',
    thumbnail: REVIEWS_BLOCK_THUMBNAILS['rev-magazine-editorial'],
    toHtml(props, id) { return magazineEditorial(props, id) },
  },
  {
    id: 'rev-avatar-rating-cards',
    label: 'Avatar Rating Cards',
    description: 'PRO — eBay Seller Scoreboard: metrics dashboard (Feedback Score, Positive %, Items Sold, Status) + 3 cards with DSR ratings.',
    thumbnail: REVIEWS_BLOCK_THUMBNAILS['rev-avatar-rating-cards'],
    toHtml(props, id) { return avatarRatingCards(props, id) },
  },
  {
    id: 'rev-dark-luxury',
    label: 'Dark Luxury',
    description: 'PRO — Analytics dashboard: Total Reviews + Average Rating stats + colour-coded star bars + stacked buyer rows with spend info and action buttons.',
    thumbnail: REVIEWS_BLOCK_THUMBNAILS['rev-dark-luxury'],
    toHtml(props, id) { return darkLuxury(props, id) },
  },
  {
    id: 'rev-trust-score-banner',
    label: 'Trust Score Banner',
    description: 'PRO — Giant 4.9★ hero rating left, review quotes stacked right. Highest converting layout.',
    thumbnail: REVIEWS_BLOCK_THUMBNAILS['rev-trust-score-banner'],
    toHtml(props, id) { return trustScoreBanner(props, id) },
  },
  {
    id: 'rev-minimal-serif-grid',
    label: 'Minimal Serif Grid',
    description: 'PRO — Typographic hierarchy: hero review at 17px italic serif with large open-quote, then 2 numbered support reviews side-by-side.',
    thumbnail: REVIEWS_BLOCK_THUMBNAILS['rev-minimal-serif-grid'],
    toHtml(props, id) { return minimalSerifGrid(props, id) },
  },
  {
    id: 'rev-trustpilot-showcase',
    label: 'Score Showcase',
    description: 'PRO — Store badge + score + headline + 3 titled review cards with green stars. Highest-trust layout.',
    thumbnail: REVIEWS_BLOCK_THUMBNAILS['rev-trustpilot-showcase'],
    toHtml(props, id) { return scoreShowcase(props, id) },
  },
  {
    id: 'rev-rating-breakdown-grid',
    label: 'Rating Breakdown Grid',
    description: 'PRO — Star rating bar chart (5★→1★ with counts) + section heading & CTA buttons + grid of avatar review cards.',
    thumbnail: REVIEWS_BLOCK_THUMBNAILS['rev-rating-breakdown-grid'],
    toHtml(props, id) { return ratingBreakdownGrid(props, id) },
  },
]

export function getReviewsBlockVariant(id?: string): BlockVariant {
  if (!id) return reviewsBlockVariants[0]
  return reviewsBlockVariants.find(v => v.id === id) || reviewsBlockVariants[0]
}

export const REVIEWS_FREE_VARIANTS = new Set([
  'rev-star-cards',
  'rev-bold-quote-strip',
  'rev-verified-buyer-rows',
])
