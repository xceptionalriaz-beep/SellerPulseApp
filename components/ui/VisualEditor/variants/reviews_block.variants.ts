// components/ui/VisualEditor/variants/reviews_block.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Customer Reviews Block — 8 Professional eBay Listing Variants
//
// Design rules:
//   • Every variant has a completely different LAYOUT CONCEPT — not just colours
//   • Table-based HTML only — 100% eBay-compliant, zero JavaScript, zero <div>
//   • PRO variants are visibly more impressive — sellers see the value instantly
//   • Clean backgrounds — no noise, no gradients that feel cheap
//   • Stars always rendered as SVG (crisp at any size, not emoji)
//   • Answers always visible — eBay does not allow JavaScript
//
// 8 Variants:
//   FREE:
//   1. rev-star-cards          — 3-up card grid, yellow stars, buyer quote
//   2. rev-bold-quote-strip    — Full-width accent strip, large quote mark
//   3. rev-verified-buyer-rows — Horizontal row per review, green verified badge
//   PRO:
//   4. rev-magazine-editorial  — Huge italic serif quote, editorial magazine feel
//   5. rev-avatar-rating-cards — Initial circle avatar, Trustpilot-style layout
//   6. rev-dark-luxury         — Charcoal bg, gold stars, premium brand aesthetic
//   7. rev-trust-score-banner  — Big 4.9★ hero rating left, reviews stacked right
//   8. rev-minimal-serif-grid  — 2-column, Apple-clean, hairline dividers only
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
        for (let e = row.length; e < 3; e++) fill += `<td width="${Math.floor(100 / 3)}%" style="padding:0 4px;"></td>`
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
// Full-width accent background. Huge decorative " mark. White text.
// One review per row, stacked. Stops the eye. Works for any seller.
// ─────────────────────────────────────────────────────────────────────────────
function boldQuoteStrip(p: any, id: string): string {
    const sectionBg = p.questionBg ?? '#1e1535'
    const starCol = resolveStarColor(p)
    const accent = resolveAccent(p)
    const reviews = resolveReviews(p)

    const rows = reviews.map((r, i) => {
        const quote = r.text ?? r.quote ?? ''
        const author = r.author ?? r.name ?? 'Verified Buyer'
        const date = r.date ?? ''
        return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;${i > 0 ? `border-top:1px solid rgba(255,255,255,0.1);padding-top:20px;margin-top:20px;` : ''}">
      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr>
              <td width="36" style="width:36px;vertical-align:top;padding-top:2px;">
                <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:52px;line-height:0.8;color:${accent};opacity:0.6;">&ldquo;</p>
              </td>
              <td style="vertical-align:top;padding-left:10px;">
                <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#ffffff;line-height:1.65;font-style:italic;">${quote}</p>
                <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="vertical-align:middle;padding-right:10px;">
                      <p style="margin:0;">${stars(r.rating ?? 5, starCol, 12)}</p>
                    </td>
                    <td style="vertical-align:middle;">
                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#ffffff;">&#8212; ${author}${date ? `<span style="font-weight:400;color:rgba(255,255,255,0.55);margin-left:6px;">${date}</span>` : ''}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
    }).join('')

    const inner = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${sectionBg};border-left:4px solid ${accent};">
  <tr>
    <td style="${pad(p, 22, 24, 22, 24)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:16px;">
        <tr>
          <td>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:${accent};letter-spacing:0.12em;text-transform:uppercase;">Customer Reviews</p>
          </td>
        </tr>
      </table>
      ${rows}
    </td>
  </tr>
</table>`
    return outerWrap(id, inner)
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
// Huge italic serif quote fills the full width. Thin rule. Name in small caps.
// Inspired by WSJ, Monocle, editorial luxury print. Nothing else looks like this.
// ─────────────────────────────────────────────────────────────────────────────
function magazineEditorial(p: any, id: string): string {
    const bg = resolveBg(p)
    const textCol = resolveTextColor(p)
    const subCol = resolveSubColor(p)
    const starCol = resolveStarColor(p)
    const accent = resolveAccent(p)
    const borderCol = resolveBorder(p)
    const reviews = resolveReviews(p)

    const items = reviews.map((r, i) => {
        const quote = r.text ?? r.quote ?? ''
        const author = r.author ?? r.name ?? 'Verified Buyer'
        const date = r.date ?? ''
        return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;${i > 0 ? `border-top:1px solid ${borderCol};padding-top:22px;` : ''}${i < reviews.length - 1 ? 'padding-bottom:22px;' : ''}">
      <tr><td>
        <p style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:17px;font-style:italic;color:${textCol};line-height:1.6;letter-spacing:0.01em;">&ldquo;${quote}&rdquo;</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
          <tr>
            <td width="28" style="width:28px;vertical-align:middle;">
              <p style="margin:0;">${stars(r.rating ?? 5, starCol, 11)}</p>
            </td>
            <td style="vertical-align:middle;padding-left:8px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:${subCol};letter-spacing:0.08em;text-transform:uppercase;">${author}${date ? ` &nbsp;&#8901;&nbsp; <span style="font-weight:400;">${date}</span>` : ''}</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>`
    }).join('')

    const inner = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bg};">
  <tr>
    <td style="${pad(p, 24, 28, 24, 28)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td width="3" style="width:3px;background-color:${accent};font-size:0;">&nbsp;</td>
          <td style="padding-left:12px;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:${accent};letter-spacing:0.12em;text-transform:uppercase;">Customer Reviews</p>
          </td>
        </tr>
      </table>
      ${items}
    </td>
  </tr>
</table>`
    return outerWrap(id, inner)
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. AVATAR RATING CARDS  [PRO]
// Initials circle avatar (accent colour). Name + stars as card header.
// Quote text in card body. Trustpilot/Google Review aesthetic.
// Modern, trustworthy, instantly familiar to buyers.
// ─────────────────────────────────────────────────────────────────────────────
function avatarRatingCards(p: any, id: string): string {
    const bg = resolveBg(p)
    const textCol = resolveTextColor(p)
    const subCol = resolveSubColor(p)
    const starCol = resolveStarColor(p)
    const accent = resolveAccent(p)
    const borderCol = resolveBorder(p)
    const reviews = resolveReviews(p)

    const cards = reviews.map((r, i) => {
        const quote = r.text ?? r.quote ?? ''
        const author = r.author ?? r.name ?? 'Verified Buyer'
        const date = r.date ?? 'Verified Purchase'
        const ini = initials(author)
        return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#ffffff;border:1px solid ${borderCol};border-radius:8px;margin-bottom:${i === reviews.length - 1 ? 0 : 10}px;">
      <tr>
        <td style="padding:14px 16px 10px;border-bottom:1px solid ${borderCol};">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr>
              <td width="40" style="width:40px;vertical-align:middle;padding-right:12px;">
                <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="width:38px;height:38px;background-color:${accent};border-radius:50%;text-align:center;line-height:38px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;">${ini}</td>
                  </tr>
                </table>
              </td>
              <td style="vertical-align:middle;">
                <p style="margin:0 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:${textCol};">${author}</p>
                <p style="margin:0 0 3px;">${stars(r.rating ?? 5, starCol, 12)}</p>
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${subCol};">${date}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px 14px;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${textCol};line-height:1.65;">&ldquo;${quote}&rdquo;</p>
        </td>
      </tr>
    </table>`
    }).join('')

    const inner = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bg};">
  <tr>
    <td style="${pad(p)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:14px;">
        <tr>
          <td>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:${accent};letter-spacing:0.1em;text-transform:uppercase;">Verified Buyer Reviews</p>
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
// 6. DARK LUXURY  [PRO]
// Deep charcoal background. Gold stars. White quotes. Thin gold divider lines.
// For watches, jewellery, premium fashion, collectibles, high-end electronics.
// ─────────────────────────────────────────────────────────────────────────────
function darkLuxury(p: any, id: string): string {
    const sectionBg = p.questionBg ?? '#111827'
    const accent = resolveAccent(p)
    const starCol = resolveStarColor(p)
    const reviews = resolveReviews(p)

    const items = reviews.map((r, i) => {
        const quote = r.text ?? r.quote ?? ''
        const author = r.author ?? r.name ?? 'Verified Buyer'
        const date = r.date ?? ''
        return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;${i > 0 ? `border-top:1px solid rgba(212,175,55,0.2);padding-top:18px;` : ''}${i < reviews.length - 1 ? 'padding-bottom:18px;' : ''}">
      <tr><td>
        <p style="margin:0 0 8px;">${stars(r.rating ?? 5, starCol, 13)}</p>
        <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-style:italic;color:#e5e7eb;line-height:1.65;">&ldquo;${quote}&rdquo;</p>
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#d4af37;letter-spacing:0.04em;">&#8212; ${author}${date ? `<span style="font-weight:400;color:rgba(255,255,255,0.4);margin-left:6px;">${date}</span>` : ''}</p>
      </td></tr>
    </table>`
    }).join('')

    const inner = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${sectionBg};border-top:2px solid #d4af37;">
  <tr>
    <td style="${pad(p, 22, 24, 22, 24)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:18px;">
        <tr>
          <td>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#d4af37;letter-spacing:0.14em;text-transform:uppercase;">Customer Reviews</p>
          </td>
        </tr>
      </table>
      ${items}
    </td>
  </tr>
</table>`
    return outerWrap(id, inner)
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
// 2-column layout. Italic serif quote fills each column cell.
// Zero borders, zero backgrounds — just type, hairlines, and whitespace.
// Apple, Aesop, Glossier-level restraint. For premium and lifestyle brands.
// ─────────────────────────────────────────────────────────────────────────────
function minimalSerifGrid(p: any, id: string): string {
    const bg = resolveBg(p)
    const textCol = resolveTextColor(p)
    const subCol = resolveSubColor(p)
    const starCol = resolveStarColor(p)
    const accent = resolveAccent(p)
    const borderCol = resolveBorder(p)
    const reviews = resolveReviews(p)

    // Pair reviews into rows of 2
    const rows: ReviewItem[][] = []
    for (let i = 0; i < reviews.length; i += 2) rows.push(reviews.slice(i, i + 2))

    const rowsHtml = rows.map((row, ri) => {
        const cells = row.map((r, ci) => {
            const quote = r.text ?? r.quote ?? ''
            const author = r.author ?? r.name ?? 'Verified Buyer'
            const date = r.date ?? ''
            return `
      <td width="50%" valign="top" style="width:50%;padding:${ri > 0 ? '20px' : '0'} ${ci === 0 ? '20px 0 0' : '0 0 0 20px'};vertical-align:top;${ci === 0 ? `border-right:1px solid ${borderCol};` : ''}box-sizing:border-box;">
        <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-style:italic;color:${textCol};line-height:1.7;">&ldquo;${quote}&rdquo;</p>
        <p style="margin:0 0 4px;">${stars(r.rating ?? 5, starCol, 11)}</p>
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${subCol};letter-spacing:0.06em;text-transform:uppercase;">${author}${date ? ` &nbsp;&#8901;&nbsp; ${date}` : ''}</p>
      </td>`
        }).join('')
        // fill if odd
        let fill = ''
        if (row.length < 2) fill = `<td width="50%" style="width:50%;padding-left:20px;border-left:1px solid ${borderCol};"></td>`
        return `<tr style="${ri > 0 ? `border-top:1px solid ${borderCol};` : ''}">${cells}${fill}</tr>`
    }).join('')

    const inner = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:${bg};">
  <tr>
    <td style="${pad(p, 24, 24, 24, 24)}box-sizing:border-box;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td style="border-bottom:2px solid ${textCol};padding-bottom:12px;">
            <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:${textCol};letter-spacing:0.02em;">Customer Reviews</p>
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
    <text x="9" y="22" font-family="Georgia,serif" font-size="22" fill="#7530fb" opacity="0.5">&ldquo;</text>
    <line x1="22" y1="14" x2="70" y2="14" stroke="rgba(255,255,255,0.7)" stroke-width="1"/>
    <line x1="22" y1="20" x2="74" y2="20" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"/>
    <line x1="22" y1="26" x2="60" y2="26" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"/>
    <line x1="22" y1="32" x2="44" y2="32" stroke="#f59e0b" stroke-width="1"/>
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
    <rect x="6" y="6" width="3" height="10" fill="#7530fb"/>
    <line x1="13" y1="10" x2="36" y2="10" stroke="#7530fb" stroke-width="0.7"/>
    <line x1="6" y1="20" x2="74" y2="20" stroke="#e5e7eb" stroke-width="1.2"/>
    <line x1="6" y1="27" x2="72" y2="27" stroke="#111827" stroke-width="1.3"/>
    <line x1="6" y1="32" x2="68" y2="32" stroke="#111827" stroke-width="1.3"/>
    <line x1="6" y1="37" x2="58" y2="37" stroke="#6b7280" stroke-width="0.8"/>
    <line x1="6" y1="42" x2="38" y2="42" stroke="#f59e0b" stroke-width="0.9"/>
    <line x1="6" y1="47" x2="52" y2="47" stroke="#6b7280" stroke-width="0.7"/>
  </svg>`,

    'rev-avatar-rating-cards': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#f9fafb"/>
    <rect x="6" y="5" width="68" height="20" rx="4" fill="#fff" stroke="#e5e7eb" stroke-width="0.8"/>
    <circle cx="16" cy="15" r="6" fill="#7530fb"/>
    <line x1="26" y1="11" x2="46" y2="11" stroke="#111827" stroke-width="1.2"/>
    <line x1="26" y1="15" x2="42" y2="15" stroke="#f59e0b" stroke-width="1"/>
    <line x1="26" y1="19" x2="38" y2="19" stroke="#6b7280" stroke-width="0.7"/>
    <line x1="10" y1="25" x2="70" y2="25" stroke="#e5e7eb" stroke-width="0.8"/>
    <rect x="6" y="29" width="68" height="18" rx="4" fill="#fff" stroke="#e5e7eb" stroke-width="0.8"/>
    <circle cx="16" cy="38" r="6" fill="#7530fb"/>
    <line x1="26" y1="34" x2="44" y2="34" stroke="#111827" stroke-width="1.2"/>
    <line x1="26" y1="38" x2="40" y2="38" stroke="#f59e0b" stroke-width="1"/>
    <line x1="26" y1="42" x2="62" y2="42" stroke="#6b7280" stroke-width="0.7"/>
  </svg>`,

    'rev-dark-luxury': `<svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect width="80" height="52" fill="#111827"/>
    <rect x="0" y="0" width="80" height="2" fill="#d4af37"/>
    <line x1="6" y1="10" x2="30" y2="10" stroke="#d4af37" stroke-width="0.7"/>
    <line x1="6" y1="16" x2="72" y2="16" stroke="rgba(255,255,255,0.7)" stroke-width="1"/>
    <line x1="6" y1="21" x2="65" y2="21" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"/>
    <line x1="6" y1="26" x2="48" y2="26" stroke="#d4af37" stroke-width="0.8"/>
    <line x1="6" y1="31" x2="74" y2="31" stroke="rgba(212,175,55,0.25)" stroke-width="0.8"/>
    <line x1="6" y1="37" x2="70" y2="37" stroke="rgba(255,255,255,0.7)" stroke-width="1"/>
    <line x1="6" y1="42" x2="58" y2="42" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"/>
    <line x1="6" y1="47" x2="44" y2="47" stroke="#d4af37" stroke-width="0.8"/>
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
    <line x1="6" y1="11" x2="74" y2="11" stroke="#111827" stroke-width="1.5"/>
    <line x1="40" y1="16" x2="40" y2="48" stroke="#e5e7eb" stroke-width="0.8"/>
    <line x1="8" y1="18" x2="36" y2="18" stroke="#111827" stroke-width="1"/>
    <line x1="8" y1="23" x2="34" y2="23" stroke="#6b7280" stroke-width="0.8"/>
    <line x1="8" y1="28" x2="30" y2="28" stroke="#6b7280" stroke-width="0.8"/>
    <line x1="8" y1="33" x2="26" y2="33" stroke="#f59e0b" stroke-width="0.9"/>
    <line x1="8" y1="37" x2="30" y2="37" stroke="#6b7280" stroke-width="0.7"/>
    <line x1="44" y1="18" x2="72" y2="18" stroke="#111827" stroke-width="1"/>
    <line x1="44" y1="23" x2="70" y2="23" stroke="#6b7280" stroke-width="0.8"/>
    <line x1="44" y1="28" x2="66" y2="28" stroke="#6b7280" stroke-width="0.8"/>
    <line x1="44" y1="33" x2="62" y2="33" stroke="#f59e0b" stroke-width="0.9"/>
    <line x1="44" y1="37" x2="68" y2="37" stroke="#6b7280" stroke-width="0.7"/>
  </svg>`,
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
        description: 'Full-width dark background with large quote marks and white text. Stops the eye.',
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
        description: 'PRO — Huge italic serif quotes fill the full width. Editorial magazine style.',
        thumbnail: REVIEWS_BLOCK_THUMBNAILS['rev-magazine-editorial'],
        toHtml(props, id) { return magazineEditorial(props, id) },
    },
    {
        id: 'rev-avatar-rating-cards',
        label: 'Avatar Rating Cards',
        description: 'PRO — Initials circle avatar with name, stars and quote. Trustpilot / Google Reviews feel.',
        thumbnail: REVIEWS_BLOCK_THUMBNAILS['rev-avatar-rating-cards'],
        toHtml(props, id) { return avatarRatingCards(props, id) },
    },
    {
        id: 'rev-dark-luxury',
        label: 'Dark Luxury',
        description: 'PRO — Deep charcoal background, gold stars and divider lines. Premium brand aesthetic.',
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
        description: 'PRO — 2-column italic serif layout. No borders, just hairlines and whitespace. Apple-level restraint.',
        thumbnail: REVIEWS_BLOCK_THUMBNAILS['rev-minimal-serif-grid'],
        toHtml(props, id) { return minimalSerifGrid(props, id) },
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
