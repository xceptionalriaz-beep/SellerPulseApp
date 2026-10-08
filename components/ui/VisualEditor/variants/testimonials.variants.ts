// components/ui/VisualEditor/variants/testimonials.variants.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Customer Testimonials & Verified Buyer Reviews (10 Professional Layout Styles)
//
// Solves eBay Buyer Hesitation with Authentic, High-Converting Social Proof:
// • Style 1 is 100% IDENTICAL to your current baseline style (same HTML, same structure)
// • 9 new radically distinct, professional retail architectures
// • Full-size 100% responsive width across desktop & mobile eBay containers
// • Crisp vector SVG icons and sharp typography (zero blurry emojis, zero glassy AI slop)
// • Pure eBay-compliant inline CSS and HTML table architecture (VeRO safe)
//
// 10 Distinct Layout Styles:
//   1.  test-classic-grid          (Current Baseline — 100% SAME TO SAME soft card grid)
//   2.  test-verified-badge-row    (Official eBay Top-Rated Feedback Strip & Transaction Cards)
//   3.  test-featured-spotlight-split (Asymmetric 58/42 Spotlight Hero Review + Dual Secondary Cards)
//   4.  test-speech-bubble-cards   (Conversational Buyer Speech Bubbles with Initials Avatar Badges)
//   5.  test-minimal-swiss-ledger  (Scandinavian Luxury Editorial Dossier with Hairline Dividers)
//   6.  test-dark-obsidian-matrix  (Midnight High-Contrast Flagship for Tech, Gaming & Motors)
//   7.  test-timeline-delivery-audit(Speed & Packaging Proof Cards with Delivery Micro-Badges)
//   8.  test-quote-pillar-columns  (Wall Street Journal Left-Accent Editorial Pillars)
//   9.  test-certified-seal-stamps (Inspected & Authenticated Guarantee Deck with Notary Stamp)
//   10. test-compact-horizontal-ticker (Dense Mobile-Optimized Capsule Pills for 0-Scroll Buyers)
// ─────────────────────────────────────────────────────────────────────────────

import type { BlockVariant } from './section_label.variants'

export interface TestimonialItem {
  text?: string
  quote?: string
  author?: string
  name?: string
  rating?: number
  date?: string
  verified?: boolean
  location?: string
  tag?: string
  role?: string
}

// ── Default Fallback Data (Authentic, Realistic eBay Buyer Praise) ───────────
const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    author: 'John D.',
    name: 'John D.',
    text: 'Amazing product! Exactly as described. Fast shipping and packaged with great care.',
    quote: 'Amazing product! Exactly as described. Fast shipping and packaged with great care.',
    rating: 5,
    date: 'Verified eBay Purchase',
    location: 'United States',
    tag: 'Fast 2-Day Shipping',
    role: 'Repeat Buyer',
  },
  {
    author: 'Sarah M.',
    name: 'Sarah M.',
    text: 'Fast shipping and great quality. Customer service answered my question in minutes. A+ seller!',
    quote: 'Fast shipping and great quality. Customer service answered my question in minutes. A+ seller!',
    rating: 5,
    date: 'Verified eBay Purchase',
    location: 'United Kingdom',
    tag: '100% As Described',
    role: 'Top-Rated Buyer',
  },
  {
    author: 'Mike T.',
    name: 'Mike T.',
    text: 'Highly recommend this seller! Flawless condition and prompt dispatch. Will definitely buy again.',
    quote: 'Highly recommend this seller! Flawless condition and prompt dispatch. Will definitely buy again.',
    rating: 5,
    date: 'Verified eBay Purchase',
    location: 'Canada',
    tag: 'Safe Packaging',
    role: 'Verified Buyer',
  },
]

// ── Shared Vector SVG Helpers (Crisp Vector Icons, No Emojis) ────────────────

export function getStarSvg(color = '#f59e0b', size = 15): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin:0 1px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
}

export function renderStarRating(count = 5, color = '#f59e0b', size = 15): string {
  const safeCount = Math.min(Math.max(count || 5, 1), 5)
  let html = ''
  for (let i = 0; i < safeCount; i++) {
    html += getStarSvg(color, size)
  }
  return html
}

export function getVerifiedShieldSvg(color = '#16a34a', size = 14): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`
}

export function getQuoteMarkSvg(color = '#7530fb', size = 22): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" opacity="0.85" style="display:inline-block;vertical-align:middle;"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>`
}

export function getDeliveryTruckSvg(color = '#0284c7', size = 14): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px;"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`
}

export function getAwardBadgeSvg(color = '#b45309', size = 18): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`
}

// ── Property Resolvers ───────────────────────────────────────────────────────

function getItems(p: any): TestimonialItem[] {
  if (Array.isArray(p.testimonials) && p.testimonials.length > 0) {
    return p.testimonials
  }
  if (Array.isArray(p.reviews) && p.reviews.length > 0) {
    return p.reviews
  }
  return DEFAULT_TESTIMONIALS
}

function pad(p: any, defaultTop = 20, defaultRight = 20, defaultBottom = 20, defaultLeft = 20): string {
  const pt = p.paddingTop ?? defaultTop
  const pr = p.paddingRight ?? defaultRight
  const pb = p.paddingBottom ?? defaultBottom
  const pl = p.paddingLeft ?? defaultLeft
  return `padding:${pt}px ${pr}px ${pb}px ${pl}px;`
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CLASSIC GRID (CURRENT BASELINE — 100% SAME TO SAME)
// Preserves your exact existing HTML output, card styling, and table wrapper
// ─────────────────────────────────────────────────────────────────────────────
function variantClassicGrid(p: any, id: string): string {
  const items = getItems(p)
  const starColor = p.starColor || '#f59e0b'
  const textColor = p.textColor || '#1e1535'
  const authorColor = p.authorColor || p.accentColor || '#7530fb'
  const cardBg = p.cardBg ?? p.bgColor ?? '#f8f7ff'
  const cardBorder = p.cardBorder ?? p.borderColor ?? '#e9e3ff'

  // Split into rows of strictly 3 reviews maximum
  const rows: any[][] = []
  for (let i = 0; i < items.length; i += 3) {
    rows.push(items.slice(i, i + 3))
  }

  const rowsHtml = rows.map((rowItems, rowIdx) => {
    const cells = rowItems.map((t: any) => {
      const stars = '&#9733;'.repeat(t.rating || 5)
      const text = t.text || t.quote || ''
      const author = t.author || t.name || 'Verified Buyer'
      const pTop = rowIdx > 0 ? 'padding-top:10px;' : ''

      return `<td width="33.33%" valign="top" style="padding:6px 4px;${pTop}vertical-align:top;text-align:center;box-sizing:border-box;">
        <div style="background-color:${cardBg};border:1px solid ${cardBorder};border-radius:8px;padding:12px 8px;box-sizing:border-box;height:100%;">
          <p style="margin:0 0 6px;font-size:14px;color:${starColor};letter-spacing:1px;">${stars}</p>
          <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;font-style:italic;color:${textColor};line-height:1.45;word-break:break-word;">${text}</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:11.5px;font-weight:700;color:${authorColor};">— ${author}</p>
        </div>
      </td>`
    }).join('')

    // Fill empty cells on the last row so card #4 stays exactly 33.33% width
    let emptyCells = ''
    for (let e = rowItems.length; e < 3; e++) {
      emptyCells += `<td width="33.33%" style="padding:6px 4px;"></td>`
    }

    return `<tr>${cells}${emptyCells}</tr>`
  }).join('')

  return `<table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;">
  <tr><td style="background-color:${p.bgColor};${pad(p, 16, 12, 16, 12)}box-sizing:border-box;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">${rowsHtml}</table>
  </td></tr>
</table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. VERIFIED BADGE ROW (Official eBay Top-Rated Feedback Strip & Transaction Cards)
// Official top-rated trust ribbon with green shield pills & transaction specifics
// ─────────────────────────────────────────────────────────────────────────────
function variantVerifiedBadgeRow(p: any, id: string): string {
  const items = getItems(p)
  const star = p.starColor || '#f59e0b'
  const bg = p.bgColor || '#ffffff'
  const border = p.borderColor || '#cbd5e1'
  const shield = getVerifiedShieldSvg('#15803d', 15)

  // Split into rows of strictly 3 reviews maximum
  const rows: any[][] = []
  for (let i = 0; i < items.length; i += 3) {
    rows.push(items.slice(i, i + 3))
  }

  const rowsHtml = rows.map((rowItems, rowIdx) => {
    const cellsHtml = rowItems.map((item) => {
      const quote = item.text || item.quote || ''
      const buyer = item.author || item.name || 'Verified Buyer'
      const tag = item.tag || 'Fast Dispatch'
      const pTop = rowIdx > 0 ? 'padding-top:10px;' : ''

      return `
      <td width="33.33%" valign="top" style="padding:5px 3px;${pTop}vertical-align:top;box-sizing:border-box;">
        <div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:6px;padding:10px 7px;box-sizing:border-box;box-shadow:0 1px 3px rgba(0,0,0,0.03);height:100%;">
          <!-- Star Rating -->
          <div style="white-space:nowrap;margin-bottom:5px;">
            ${renderStarRating(item.rating || 5, star, 11)}
          </div>
          <!-- Tag Badge -->
          <div style="margin-bottom:8px;">
            <span style="font-family:Arial,sans-serif;font-size:9px;font-weight:800;color:#0f766e;background:#ccfbf1;padding:2px 5px;border-radius:3px;text-transform:uppercase;letter-spacing:0.3px;white-space:nowrap;display:inline-block;">
              ${tag}
            </span>
          </div>
          <!-- Quote Body -->
          <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:11.5px;line-height:1.42;color:#1e293b;word-break:break-word;">
            &ldquo;${quote}&rdquo;
          </p>
          <!-- Buyer Info -->
          <div style="border-top:1px dashed #e2e8f0;padding-top:6px;">
            <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:#0f172a;line-height:1.2;">
              ${buyer}
            </div>
            <div style="font-family:Arial,sans-serif;font-size:9.5px;color:#16a34a;font-weight:700;line-height:1.2;margin-top:2px;white-space:nowrap;">
              ✓ Verified Buyer
            </div>
          </div>
        </div>
      </td>`
    }).join('')

    // Fill empty cells on the last row so cards always stay exactly 33.33% width
    let emptyCells = ''
    for (let e = rowItems.length; e < 3; e++) {
      emptyCells += `<td width="33.33%" style="padding:5px 3px;"></td>`
    }

    return `<tr>${cellsHtml}${emptyCells}</tr>`
  }).join('')

  return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:Arial,sans-serif;background-color:${bg};border:1px solid ${border};border-radius:8px;overflow:hidden;box-sizing:border-box;">
      <!-- Official Header Banner -->
      <tr style="background:#f8fafc;border-bottom:1px solid #cbd5e1;">
        <td style="padding:10px 12px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" valign="middle">
                <span style="font-size:12.5px;font-weight:800;color:#0f172a;letter-spacing:-0.2px;line-height:1.3;">
                  ${shield} 100% Positive Feedback &bull; Protected
                </span>
              </td>
              <td align="right" valign="middle" style="white-space:nowrap;padding-left:8px;">
                <span style="font-size:11px;font-weight:700;color:#0f172a;margin-right:4px;">5.0</span>
                <span style="white-space:nowrap;display:inline-block;">${renderStarRating(5, star, 12)}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- Grid (Strictly 3 Reviews Per Row) -->
      <tr>
        <td style="padding:8px 5px;box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
            ${rowsHtml}
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. FEATURED SPOTLIGHT SPLIT (Hero Customer Voice + Dual Supporting Reviews)
// Asymmetric 58/42 architecture with a prominent hero review and secondary cards
// ─────────────────────────────────────────────────────────────────────────────
function variantFeaturedSpotlightSplit(p: any, id: string): string {
  const items = getItems(p)
  const hero = items[0]
  const secondary1 = items[1] || items[0]
  const secondary2 = items[2] || items[0]
  const bg = p.bgColor || '#ffffff'
  const text = p.textColor || '#0f172a'
  const accent = p.accentColor || '#7530fb'
  const border = p.borderColor || '#e2e8f0'
  const star = p.starColor || '#f59e0b'
  const quoteSvg = getQuoteMarkSvg(accent, 26)

  return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:Arial,sans-serif;background-color:${bg};box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 16, 12, 16, 12)}box-sizing:border-box;">

          <!-- Responsive Fluid Container: Side-by-Side on Desktop, Auto-Stacks on Mobile -->
          <div style="width:100%;font-size:0;text-align:left;box-sizing:border-box;">

            <!-- Left / Hero Column (58% on Desktop, 100% on Mobile) -->
            <div style="display:inline-block;vertical-align:top;width:100%;max-width:58%;min-width:300px;padding-right:8px;padding-bottom:10px;box-sizing:border-box;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border:2px solid ${accent};border-radius:10px;box-sizing:border-box;width:100%;height:100%;">
                <tr>
                  <td valign="top" style="padding:18px 16px;box-sizing:border-box;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
                      <tr>
                        <td align="left" valign="middle">
                          ${quoteSvg}
                        </td>
                        <td align="right" valign="middle" style="white-space:nowrap;">
                          ${renderStarRating(hero.rating || 5, star, 15)}
                        </td>
                      </tr>
                    </table>

                    <div style="font-family:Arial,sans-serif;font-size:14.5px;font-weight:800;color:${text};margin-bottom:8px;line-height:1.35;word-break:break-word;">
                      &ldquo;Flawless transaction, authentic item &amp; super fast dispatch!&rdquo;
                    </div>

                    <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:13px;line-height:1.55;color:#334155;font-style:italic;word-break:break-word;">
                      ${hero.text || hero.quote}
                    </p>

                    <div style="border-top:1px solid #e2e8f0;padding-top:10px;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="left" valign="middle">
                            <div style="font-family:Arial,sans-serif;font-size:12.5px;font-weight:800;color:${text};line-height:1.2;">
                              ${hero.author || hero.name}
                            </div>
                            <div style="font-family:Arial,sans-serif;font-size:10.5px;color:#16a34a;font-weight:700;line-height:1.2;margin-top:3px;white-space:nowrap;">
                              ✓ Verified eBay Buyer &bull; ${hero.location || 'USA'}
                            </div>
                          </td>
                          <td align="right" valign="middle" style="white-space:nowrap;padding-left:8px;">
                            <span style="display:inline-block;padding:3px 8px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;font-family:Arial,sans-serif;font-size:9.5px;font-weight:800;color:#047857;letter-spacing:0.4px;white-space:nowrap;">
                              REPEAT BUYER
                            </span>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Right / Supporting Reviews Stack (42% on Desktop, 100% on Mobile) -->
            <div style="display:inline-block;vertical-align:top;width:100%;max-width:42%;min-width:300px;padding-left:4px;box-sizing:border-box;">

              <!-- Card 1 -->
              <div style="background:#ffffff;border:1px solid ${border};border-radius:8px;padding:14px;margin-bottom:10px;box-sizing:border-box;">
                <div style="margin-bottom:6px;white-space:nowrap;">
                  ${renderStarRating(secondary1.rating || 5, star, 12)}
                </div>
                <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;line-height:1.45;color:#475569;font-style:italic;word-break:break-word;">
                  &ldquo;${secondary1.text || secondary1.quote}&rdquo;
                </p>
                <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:${text};">
                  ${secondary1.author || secondary1.name} &bull; <span style="color:#16a34a;font-weight:600;">Verified Purchase</span>
                </div>
              </div>

              <!-- Card 2 -->
              <div style="background:#ffffff;border:1px solid ${border};border-radius:8px;padding:14px;box-sizing:border-box;">
                <div style="margin-bottom:6px;white-space:nowrap;">
                  ${renderStarRating(secondary2.rating || 5, star, 12)}
                </div>
                <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;line-height:1.45;color:#475569;font-style:italic;word-break:break-word;">
                  &ldquo;${secondary2.text || secondary2.quote}&rdquo;
                </p>
                <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:${text};">
                  ${secondary2.author || secondary2.name} &bull; <span style="color:#16a34a;font-weight:600;">Verified Purchase</span>
                </div>
              </div>

            </div>

          </div>

        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SPEECH BUBBLE CARDS (Conversational Buyer Speech Bubbles with Avatars)
// Human conversational language with speech pointer tails and buyer avatar discs
// ─────────────────────────────────────────────────────────────────────────────
function variantSpeechBubbleCards(p: any, id: string): string {
  const items = getItems(p)
  const bg = p.bgColor || '#ffffff'
  const text = p.textColor || '#0f172a'
  const border = p.borderColor || '#e2e8f0'
  const star = p.starColor || '#f59e0b'

  // Split into rows of strictly 3 reviews maximum (Never 4 in one row)
  const rows: any[][] = []
  for (let i = 0; i < items.length; i += 3) {
    rows.push(items.slice(i, i + 3))
  }

  const rowsHtml = rows.map((rowItems, rowIdx) => {
    const cellsHtml = rowItems.map((item, idx) => {
      const quote = item.text || item.quote || ''
      const buyer = item.author || item.name || 'Verified Buyer'
      const initials = (buyer.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2) || 'EB').toUpperCase()
      const avatarBgs = ['#7530fb', '#0284c7', '#059669', '#d97706', '#dc2626']
      const avatarColor = avatarBgs[(rowIdx * 3 + idx) % avatarBgs.length]
      const pTop = rowIdx > 0 ? 'padding-top:12px;' : ''

      return `
      <td width="33.33%" valign="top" style="padding:6px 4px;${pTop}vertical-align:top;box-sizing:border-box;">
        <!-- Speech Bubble Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border:1px solid ${border};border-radius:8px;box-sizing:border-box;box-shadow:0 1px 3px rgba(0,0,0,0.03);">
          <tr>
            <td style="padding:10px 8px;vertical-align:top;box-sizing:border-box;">
              <div style="margin-bottom:6px;white-space:nowrap;">
                ${renderStarRating(item.rating || 5, star, 11)}
              </div>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:11.5px;line-height:1.42;color:#1e293b;word-break:break-word;">
                &ldquo;${quote}&rdquo;
              </p>
            </td>
          </tr>
        </table>
        <!-- Speech Bubble Downward Tail Indicator -->
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid ${border};margin-left:14px;margin-bottom:4px;"></div>

        <!-- Buyer Avatar & Name Info -->
        <table cellpadding="0" cellspacing="0" border="0" style="margin-left:4px;">
          <tr>
            <td width="26" valign="middle">
              <div style="width:24px;height:24px;border-radius:12px;background:${avatarColor};color:#ffffff;font-family:Arial,sans-serif;font-size:10px;font-weight:800;text-align:center;line-height:24px;">
                ${initials}
              </div>
            </td>
            <td valign="middle" style="padding-left:6px;">
              <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:${text};line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:70px;">
                ${buyer}
              </div>
              <div style="font-family:Arial,sans-serif;font-size:9.5px;color:#16a34a;font-weight:700;line-height:1.2;white-space:nowrap;">
                ✓ Verified
              </div>
            </td>
          </tr>
        </table>
      </td>`
    }).join('')

    // Fill empty cells on the last row so card #4 stays exactly 33.33% width
    let emptyCells = ''
    for (let e = rowItems.length; e < 3; e++) {
      emptyCells += `<td width="33.33%" style="padding:6px 4px;"></td>`
    }

    return `<tr>${cellsHtml}${emptyCells}</tr>`
  }).join('')

  return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:Arial,sans-serif;background-color:${bg};border:1px solid ${border};border-radius:10px;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 16, 10, 16, 10)}">
          <div style="text-align:center;margin-bottom:14px;">
            <h4 style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:18px;font-weight:800;color:${text};">
              Real Experiences From Real Buyers
            </h4>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#64748b;">
              Read unedited feedback left directly on our eBay store transactions
            </p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
            ${rowsHtml}
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. MINIMAL SWISS LEDGER (Scandinavian Luxury Editorial Dossier)
// Clean 1px hairline rules with diamond stamps for jewelry, watches & designer fashion
// ─────────────────────────────────────────────────────────────────────────────
function variantMinimalSwissLedger(p: any, id: string): string {
  const items = getItems(p)
  const bg = p.bgColor || '#ffffff'
  const text = p.textColor || '#0f172a'
  const border = p.borderColor || '#e2e8f0'
  const star = p.starColor || '#f59e0b'

  const rowsHtml = items.map((item, idx) => {
    const quote = item.text || item.quote || ''
    const buyer = item.author || item.name || 'Verified Buyer'
    const borderStyle = idx !== items.length - 1 ? `border-bottom:1px solid ${border};` : ''

    return `
      <tr>
        <td style="padding:11px 10px;${borderStyle}vertical-align:top;box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
            <tr>
              <!-- Author Metadata Column (Fluid 30% width instead of rigid 200px) -->
              <td width="30%" valign="top" style="width:30%;padding-right:10px;box-sizing:border-box;">
                <div style="font-family:Arial,sans-serif;font-size:8.5px;font-weight:800;color:#64748b;letter-spacing:0.6px;text-transform:uppercase;margin-bottom:2px;white-space:nowrap;">
                  VERIFIED BUYER
                </div>
                <div style="font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:${text};line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${buyer}
                </div>
                <div style="margin-top:3px;white-space:nowrap;">
                  ${renderStarRating(item.rating || 5, star, 10.5)}
                </div>
              </td>
              <!-- Quote Content Column (70% expanded width) -->
              <td width="70%" valign="top" style="width:70%;box-sizing:border-box;">
                <p style="margin:0 0 5px;font-family:Georgia,serif;font-size:12px;line-height:1.45;color:#1e293b;font-style:italic;word-break:break-word;">
                  &ldquo;${quote}&rdquo;
                </p>
                <div style="font-family:Arial,sans-serif;font-size:9.5px;color:#059669;font-weight:700;line-height:1.2;white-space:nowrap;">
                  ✓ Authenticated Condition &bull; Insured
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
  }).join('')

  return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:Arial,sans-serif;background-color:${bg};border-top:2px solid #0f172a;border-bottom:2px solid #0f172a;box-sizing:border-box;">
      <!-- Title Header (Responsive compact padding & font size) -->
      <tr>
        <td style="padding:10px 10px;border-bottom:1px solid #0f172a;background:#f8fafc;box-sizing:border-box;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td valign="middle">
                <span style="font-family:Arial,sans-serif;font-size:9.5px;font-weight:900;color:#0f172a;letter-spacing:0.8px;text-transform:uppercase;line-height:1.2;">
                  CLIENT ENDORSEMENTS &bull; PROVEN SELLER
                </span>
              </td>
              <td align="right" valign="middle" style="white-space:nowrap;padding-left:6px;">
                <span style="font-family:Arial,sans-serif;font-size:9.5px;font-weight:700;color:#64748b;">
                  100% Five-Star
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      ${rowsHtml}
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. DARK OBSIDIAN MATRIX (Midnight High-Contrast Flagship)
// Deep obsidian background for tech, gaming, electronics, power tools & auto parts
// ─────────────────────────────────────────────────────────────────────────────
function variantDarkObsidianMatrix(p: any, id: string): string {
  const items = getItems(p)

  // Split into rows of strictly 3 reviews maximum (Never 4 in one row)
  const rows: any[][] = []
  for (let i = 0; i < items.length; i += 3) {
    rows.push(items.slice(i, i + 3))
  }

  const rowsHtml = rows.map((rowItems, rowIdx) => {
    const cellsHtml = rowItems.map((item) => {
      const quote = item.text || item.quote || ''
      const buyer = item.author || item.name || 'Verified Buyer'
      const tag = item.tag || 'Tested & Working'
      const pTop = rowIdx > 0 ? 'padding-top:12px;' : ''

      return `
      <td width="33.33%" valign="top" style="padding:6px 4px;${pTop}vertical-align:top;box-sizing:border-box;">
        <div style="background:#131c2e;border:1px solid #1e293b;border-radius:8px;padding:10px 7px;box-sizing:border-box;height:100%;overflow:hidden;">
          <!-- Star Rating -->
          <div style="margin-bottom:5px;white-space:nowrap;">
            ${renderStarRating(item.rating || 5, '#fbbf24', 11)}
          </div>
          <!-- Tag Badge (Wraps onto 2 lines when needed - 100% stays inside the card) -->
          <div style="margin-bottom:8px;">
            <span style="font-family:Arial,sans-serif;font-size:7.5px;font-weight:800;color:#38bdf8;background:#082f49;padding:2px 5px;border-radius:3px;letter-spacing:0.2px;line-height:1.2;display:inline-block;max-width:100%;box-sizing:border-box;word-break:break-word;">
              ${tag.toUpperCase()}
            </span>
          </div>
          <!-- Review Text -->
          <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:11.5px;line-height:1.42;color:#e2e8f0;font-style:italic;word-break:break-word;">
            &ldquo;${quote}&rdquo;
          </p>
          <!-- Buyer Info -->
          <div style="border-top:1px solid #1e293b;padding-top:7px;">
            <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:#ffffff;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${buyer}
            </div>
            <div style="font-family:Arial,sans-serif;font-size:9px;color:#34d399;font-weight:700;line-height:1.2;margin-top:2px;white-space:nowrap;">
              ✓ Verified
            </div>
          </div>
        </div>
      </td>`
    }).join('')

    // Fill empty cells on the last row so card #4 stays exactly 33.33% width
    let emptyCells = ''
    for (let e = rowItems.length; e < 3; e++) {
      emptyCells += `<td width="33.33%" style="padding:6px 4px;"></td>`
    }

    return `<tr>${cellsHtml}${emptyCells}</tr>`
  }).join('')

  return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:Arial,sans-serif;background-color:#0b0f19;border:1px solid #1e293b;border-radius:10px;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 18, 10, 18, 10)}">
          <div style="text-align:center;margin-bottom:14px;">
            <div style="display:inline-block;padding:2px 8px;background:#1e293b;border:1px solid #334155;border-radius:12px;font-size:9.5px;font-weight:800;color:#38bdf8;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:5px;">
              BATTLE-TESTED REPUTATION
            </div>
            <h3 style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:18px;font-weight:800;color:#ffffff;line-height:1.2;">
              Buyer Verified Hardware &amp; Fulfillment
            </h3>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#94a3b8;line-height:1.4;">
              Genuine feedback from customers who purchased our performance hardware
            </p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
            ${rowsHtml}
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. TIMELINE DELIVERY AUDIT (Speed & Packaging Proof Cards)
// Focuses on eliminating shipping anxiety with dispatch badges and tracking proof
// ─────────────────────────────────────────────────────────────────────────────
function variantTimelineDeliveryAudit(p: any, id: string): string {
  const items = getItems(p)
  const bg = p.bgColor || '#ffffff'
  const text = p.textColor || '#0f172a'
  const border = p.borderColor || '#e2e8f0'
  const star = p.starColor || '#f59e0b'

  // Split into rows of strictly 3 reviews maximum (Never 4 in one row)
  const rows: any[][] = []
  for (let i = 0; i < items.length; i += 3) {
    rows.push(items.slice(i, i + 3))
  }

  const rowsHtml = rows.map((rowItems, rowIdx) => {
    const cellsHtml = rowItems.map((item, idx) => {
      const quote = item.text || item.quote || ''
      const buyer = item.author || item.name || 'Verified Buyer'
      const truck = getDeliveryTruckSvg('#0284c7', 12)
      // Shorter badges so they fit cleanly inside mobile cards without stretching
      const deliveryBadges = ['24h Dispatch &bull; Tracked', 'Shockproof Packaging', 'Same-Day Dispatch &bull; On Time']
      const badge = deliveryBadges[(rowIdx * 3 + idx) % deliveryBadges.length]
      const pTop = rowIdx > 0 ? 'padding-top:12px;' : ''

      return `
      <td width="33.33%" valign="top" style="padding:6px 4px;${pTop}vertical-align:top;box-sizing:border-box;">
        <div style="background:#ffffff;border:1px solid ${border};border-radius:8px;padding:10px 7px;box-sizing:border-box;box-shadow:0 1px 3px rgba(0,0,0,0.03);height:100%;overflow:hidden;">
          <!-- Delivery Proof Header Pill (Auto-wraps gracefully within card) -->
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:4px;padding:3px 5px;font-family:Arial,sans-serif;font-size:8.5px;font-weight:700;color:#0369a1;margin-bottom:7px;line-height:1.25;word-break:break-word;">
            ${truck} ${badge}
          </div>
          <!-- Star Rating -->
          <div style="margin-bottom:6px;white-space:nowrap;">
            ${renderStarRating(item.rating || 5, star, 11)}
          </div>
          <!-- Quote Body -->
          <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:11.5px;line-height:1.42;color:#334155;word-break:break-word;">
            &ldquo;${quote}&rdquo;
          </p>
          <!-- Buyer Info -->
          <div style="border-top:1px solid #f1f5f9;padding-top:7px;">
            <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:${text};line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${buyer}
            </div>
            <div style="font-family:Arial,sans-serif;font-size:9px;color:#16a34a;font-weight:700;line-height:1.2;margin-top:2px;white-space:nowrap;">
              ✓ Delivered on Time
            </div>
          </div>
        </div>
      </td>`
    }).join('')

    // Fill empty cells on the last row so card #4 stays exactly 33.33% width
    let emptyCells = ''
    for (let e = rowItems.length; e < 3; e++) {
      emptyCells += `<td width="33.33%" style="padding:6px 4px;"></td>`
    }

    return `<tr>${cellsHtml}${emptyCells}</tr>`
  }).join('')

  return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:Arial,sans-serif;background-color:${bg};border:1px solid ${border};border-radius:10px;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 18, 10, 18, 10)}">
          <div style="text-align:center;margin-bottom:14px;">
            <h4 style="margin:0 0 3px;font-family:Arial,sans-serif;font-size:18px;font-weight:800;color:${text};line-height:1.2;">
              Fast Dispatch &amp; Safe Arrival Proof
            </h4>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#64748b;line-height:1.4;">
              Every parcel is boxed with shockproof packaging and dispatched with full tracking
            </p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
            ${rowsHtml}
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. QUOTE PILLAR COLUMNS (Wall Street Journal Left-Accent Editorial Pillars)
// Distinctive 4px solid primary accent pillar with left-aligned quotes
// ─────────────────────────────────────────────────────────────────────────────
function variantQuotePillarColumns(p: any, id: string): string {
  const items = getItems(p)
  const bg = p.bgColor || '#ffffff'
  const text = p.textColor || '#0f172a'
  const accent = p.accentColor || p.authorColor || '#7530fb'
  const border = p.borderColor || '#e2e8f0'
  const star = p.starColor || '#f59e0b'

  // Split into rows of strictly 3 reviews maximum (Never 4 in one row)
  const rows: any[][] = []
  for (let i = 0; i < items.length; i += 3) {
    rows.push(items.slice(i, i + 3))
  }

  const rowsHtml = rows.map((rowItems, rowIdx) => {
    const cellsHtml = rowItems.map((item) => {
      const quote = item.text || item.quote || ''
      const buyer = item.author || item.name || 'Verified Buyer'
      const pTop = rowIdx > 0 ? 'padding-top:12px;' : ''

      return `
      <td width="33.33%" valign="top" style="padding:6px 4px;${pTop}vertical-align:top;box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border:1px solid ${border};border-left:3px solid ${accent};border-radius:0 6px 6px 0;box-sizing:border-box;height:100%;box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <tr>
            <td style="padding:10px 8px;vertical-align:top;box-sizing:border-box;">
              <!-- Star Rating -->
              <div style="margin-bottom:6px;white-space:nowrap;">
                ${renderStarRating(item.rating || 5, star, 11)}
              </div>
              <!-- Quote Body -->
              <p style="margin:0 0 10px;font-family:Georgia,serif;font-size:11.5px;line-height:1.42;color:#1e293b;font-style:italic;word-break:break-word;">
                &ldquo;${quote}&rdquo;
              </p>
              <!-- Buyer Info -->
              <div style="border-top:1px solid #f1f5f9;padding-top:6px;">
                <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:${text};line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${buyer}
                </div>
                <div style="font-family:Arial,sans-serif;font-size:9px;color:#16a34a;font-weight:700;line-height:1.2;margin-top:2px;white-space:nowrap;">
                  ✓ Verified Buyer
                </div>
              </div>
            </td>
          </tr>
        </table>
      </td>`
    }).join('')

    // Fill empty cells on the last row so card #4 stays exactly 33.33% width
    let emptyCells = ''
    for (let e = rowItems.length; e < 3; e++) {
      emptyCells += `<td width="33.33%" style="padding:6px 4px;"></td>`
    }

    return `<tr>${cellsHtml}${emptyCells}</tr>`
  }).join('')

  return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:Arial,sans-serif;background-color:${bg};border:1px solid ${border};border-radius:10px;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 16, 10, 16, 10)}">
          <!-- Header Banner -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
            <tr>
              <td align="left" valign="middle">
                <span style="font-family:Arial,sans-serif;font-size:15px;font-weight:800;color:${text};line-height:1.2;">
                  Buyer Reviews &amp; Recommendations
                </span>
              </td>
              <td align="right" valign="middle" style="white-space:nowrap;padding-left:6px;">
                <span style="font-family:Arial,sans-serif;font-size:9.5px;font-weight:700;color:#16a34a;background:#ecfdf5;border:1px solid #bbf7d0;padding:2px 6px;border-radius:10px;white-space:nowrap;">
                  100% On-Time
                </span>
              </td>
            </tr>
          </table>
          <!-- 3-Per-Row Grid -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
            ${rowsHtml}
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. CERTIFIED SEAL STAMPS (Inspected & Authenticated Guarantee Deck)
// Official notary certificate styling for collectibles, luxury, coins & antiques
// ─────────────────────────────────────────────────────────────────────────────
function variantCertifiedSealStamps(p: any, id: string): string {
  const items = getItems(p)
  const bg = p.bgColor || '#ffffff'
  const text = p.textColor || '#0f172a'
  const border = p.borderColor || '#cbd5e1'
  const star = p.starColor || '#f59e0b'
  const badgeSvg = getAwardBadgeSvg('#b45309', 15)

  // Split into rows of strictly 3 reviews maximum (Never 4 in one row)
  const rows: any[][] = []
  for (let i = 0; i < items.length; i += 3) {
    rows.push(items.slice(i, i + 3))
  }

  const rowsHtml = rows.map((rowItems, rowIdx) => {
    const cellsHtml = rowItems.map((item) => {
      const quote = item.text || item.quote || ''
      const buyer = item.author || item.name || 'Verified Buyer'
      const pTop = rowIdx > 0 ? 'padding-top:12px;' : ''

      return `
      <td width="33.33%" valign="top" style="padding:6px 4px;${pTop}vertical-align:top;box-sizing:border-box;">
        <div style="background:#ffffff;border:2px double #cbd5e1;border-radius:6px;padding:10px 6px;box-sizing:border-box;text-align:center;height:100%;box-shadow:0 1px 3px rgba(0,0,0,0.02);overflow:hidden;">
          <div style="margin-bottom:4px;">${badgeSvg}</div>
          <!-- 2-Line Seal Header: Never pokes outside card borders -->
          <div style="font-family:Arial,sans-serif;font-size:8px;font-weight:900;color:#92400e;letter-spacing:0.6px;text-transform:uppercase;margin-bottom:6px;line-height:1.2;text-align:center;">
            CERTIFIED<br/>GENUINE
          </div>
          <!-- Stars on 1 line -->
          <div style="margin-bottom:6px;white-space:nowrap;">
            ${renderStarRating(item.rating || 5, star, 10.5)}
          </div>
          <!-- Quote -->
          <p style="margin:0 0 10px;font-family:Georgia,serif;font-size:11px;line-height:1.4;color:#334155;font-style:italic;word-break:break-word;">
            &ldquo;${quote}&rdquo;
          </p>
          <!-- Buyer Info with Short Badge -->
          <div style="border-top:1px solid #e2e8f0;padding-top:6px;">
            <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:800;color:${text};line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${buyer}
            </div>
            <div style="font-family:Arial,sans-serif;font-size:8.5px;color:#16a34a;font-weight:700;line-height:1.2;margin-top:2px;white-space:nowrap;">
              ✓ Verified Record
            </div>
          </div>
        </div>
      </td>`
    }).join('')

    // Fill empty cells on the last row so card #4 stays exactly 33.33% width
    let emptyCells = ''
    for (let e = rowItems.length; e < 3; e++) {
      emptyCells += `<td width="33.33%" style="padding:6px 4px;"></td>`
    }

    return `<tr>${cellsHtml}${emptyCells}</tr>`
  }).join('')

  return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:Arial,sans-serif;background-color:${bg};border:1px solid ${border};border-radius:8px;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 16, 10, 16, 10)}">
          <div style="text-align:center;margin-bottom:14px;">
            <h4 style="margin:0 0 3px;font-family:Georgia,serif;font-size:18px;font-weight:700;color:${text};line-height:1.2;">
              Authenticated Collector &amp; Customer Trust
            </h4>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#64748b;line-height:1.4;">
              Every purchase backed by our money-back guarantee and verified buyer praise
            </p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;width:100%;">
            ${rowsHtml}
          </table>
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. COMPACT HORIZONTAL TICKER (Dense Mobile-Optimized Capsule Pills)
// Ultra-dense horizontal pill strip for quick-scrolling mobile buyers
// ─────────────────────────────────────────────────────────────────────────────
function variantCompactHorizontalTicker(p: any, id: string): string {
  const items = getItems(p)
  const bg = p.bgColor || '#ffffff'
  const text = p.textColor || '#0f172a'
  const border = p.borderColor || '#e2e8f0'
  const star = p.starColor || '#f59e0b'

  const pillsHtml = items.map((item, idx) => {
    const quote = item.text || item.quote || ''
    const buyer = item.author || item.name || 'Verified Buyer'
    const borderStyle = idx !== items.length - 1 ? 'margin-bottom:8px;' : ''

    return `
      <div style="background:#ffffff;border:1px solid ${border};border-radius:20px;padding:7px 10px;${borderStyle}box-sizing:border-box;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;">
          <tr>
            <!-- Compact Stars (takes minimal width so quote & name have space) -->
            <td width="58" valign="middle" style="white-space:nowrap;">
              ${renderStarRating(item.rating || 5, star, 10.5)}
            </td>
            <!-- Quote Text in middle -->
            <td valign="middle" style="padding:0 8px;">
              <span style="font-family:Arial,sans-serif;font-size:11.5px;color:#1e293b;line-height:1.35;display:block;word-break:break-word;">
                &ldquo;${quote}&rdquo;
              </span>
            </td>
            <!-- Buyer Name & Verified Pill (Compact, won't wrap into 3 lines) -->
            <td width="100" align="right" valign="middle" style="white-space:nowrap;padding-left:4px;">
              <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:${text};line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${buyer}
              </div>
              <div style="font-family:Arial,sans-serif;font-size:9px;font-weight:700;color:#16a34a;line-height:1.2;margin-top:2px;white-space:nowrap;">
                ✓ Verified
              </div>
            </td>
          </tr>
        </table>
      </div>`
  }).join('')

  return `
    <table id="${id}" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;font-family:Arial,sans-serif;background-color:${bg};border:1px solid ${border};border-radius:12px;box-sizing:border-box;">
      <tr>
        <td style="${pad(p, 14, 10, 14, 10)}">
          <!-- Compact Header -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
            <tr>
              <td valign="middle">
                <span style="font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:${text};line-height:1.2;">
                  ⭐ 100% Positive Feedback
                </span>
              </td>
              <td align="right" valign="middle" style="white-space:nowrap;padding-left:6px;">
                <span style="font-family:Arial,sans-serif;font-size:9.5px;font-weight:700;color:#059669;">
                  Top Rated Seller
                </span>
              </td>
            </tr>
          </table>
          ${pillsHtml}
        </td>
      </tr>
    </table>`
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant Registry Array
// ─────────────────────────────────────────────────────────────────────────────

export const testimonialsVariants: BlockVariant[] = [
  {
    id: 'test-classic-grid',
    label: 'Classic Grid',
    description: 'Current Baseline: Clean 3-card grid with stars, quote, buyer ID & verified badge (100% same to same)',
    toHtml: variantClassicGrid,
  },
  {
    id: 'test-verified-badge-row',
    label: 'Verified Badge Row',
    description: 'Official eBay top-rated trust ribbon with green shield pills & transaction specifics',
    toHtml: variantVerifiedBadgeRow,
  },
  {
    id: 'test-featured-spotlight-split',
    label: 'Spotlight Split',
    description: 'Asymmetric 58/42 architecture with a prominent hero review and secondary cards',
    toHtml: variantFeaturedSpotlightSplit,
  },
  {
    id: 'test-speech-bubble-cards',
    label: 'Speech Bubbles',
    description: 'Human conversational language with speech pointer tails and buyer avatar discs',
    toHtml: variantSpeechBubbleCards,
  },
  {
    id: 'test-minimal-swiss-ledger',
    label: 'Minimal Swiss Ledger',
    description: 'Scandinavian luxury editorial dossier with clean 1px hairline rules for jewelry & fashion',
    toHtml: variantMinimalSwissLedger,
  },
  {
    id: 'test-dark-obsidian-matrix',
    label: 'Dark Obsidian Matrix',
    description: 'Midnight high-contrast flagship for tech, gaming, electronics, power tools & auto parts',
    toHtml: variantDarkObsidianMatrix,
  },
  {
    id: 'test-timeline-delivery-audit',
    label: 'Delivery Proof Cards',
    description: 'Eliminates shipping anxiety with 24h dispatch badges, tracking proof & bubble armor',
    toHtml: variantTimelineDeliveryAudit,
  },
  {
    id: 'test-quote-pillar-columns',
    label: 'Editorial Pillars',
    description: 'Distinctive 4px solid primary accent pillar with left-aligned quotes & fast reading',
    toHtml: variantQuotePillarColumns,
  },
  {
    id: 'test-certified-seal-stamps',
    label: 'Certified Stamps',
    description: 'Official notary certificate styling for collectibles, luxury, coins & antiques',
    toHtml: variantCertifiedSealStamps,
  },
  {
    id: 'test-compact-horizontal-ticker',
    label: 'Compact Pills',
    description: 'Ultra-dense horizontal pill strip for quick-scrolling mobile buyers (0-scroll)',
    toHtml: variantCompactHorizontalTicker,
  },
]

// Aliases for block system compatibility
export const testimonialVariants = testimonialsVariants

export function getTestimonialsVariant(variantId: string): BlockVariant {
  const found = testimonialsVariants.find(v => v.id === variantId)
  return found ?? testimonialsVariants[0]
}

export function getTestimonialVariant(variantId: string): BlockVariant {
  return getTestimonialsVariant(variantId)
}

// ─────────────────────────────────────────────────────────────────────────────
// PropertiesPanel Thumbnail Previews (SVG String Map)
// ─────────────────────────────────────────────────────────────────────────────
export const TESTIMONIALS_THUMBNAILS: Record<string, string> = {
  'test-classic-grid': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect x="2" y="4" width="76" height="40" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2"/>
    <rect x="6" y="10" width="20" height="28" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="30" y="10" width="20" height="28" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="54" y="10" width="20" height="28" rx="2" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <circle cx="10" cy="15" r="1.5" fill="#f59e0b"/>
    <circle cx="34" cy="15" r="1.5" fill="#f59e0b"/>
    <circle cx="58" cy="15" r="1.5" fill="#f59e0b"/>
  </svg>`,
  'test-verified-badge-row': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect x="2" y="4" width="76" height="40" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
    <rect x="2" y="4" width="76" height="11" fill="#f1f5f9"/>
    <circle cx="8" cy="9.5" r="2.5" fill="#16a34a"/>
    <rect x="14" y="8" width="30" height="3" rx="1.5" fill="#0f172a"/>
    <rect x="6" y="19" width="20" height="20" rx="2" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="30" y="19" width="20" height="20" rx="2" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8"/>
    <rect x="54" y="19" width="20" height="20" rx="2" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8"/>
  </svg>`,
  'test-featured-spotlight-split': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect x="2" y="4" width="76" height="40" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2"/>
    <rect x="6" y="9" width="40" height="30" rx="3" fill="#f5f3ff" stroke="#7530fb" stroke-width="1.2"/>
    <rect x="50" y="9" width="24" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="50" y="26" width="24" height="13" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <circle cx="12" cy="15" r="2" fill="#f59e0b"/>
  </svg>`,
  'test-speech-bubble-cards': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect x="2" y="4" width="76" height="40" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2"/>
    <rect x="6" y="8" width="20" height="18" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <polygon points="12,26 16,26 12,30" fill="#cbd5e1"/>
    <circle cx="16" cy="35" r="3" fill="#7530fb"/>
    <rect x="30" y="8" width="20" height="18" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <polygon points="36,26 40,26 36,30" fill="#cbd5e1"/>
    <circle cx="40" cy="35" r="3" fill="#0284c7"/>
    <rect x="54" y="8" width="20" height="18" rx="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <polygon points="60,26 64,26 60,30" fill="#cbd5e1"/>
    <circle cx="64" cy="35" r="3" fill="#059669"/>
  </svg>`,
  'test-minimal-swiss-ledger': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect x="2" y="4" width="76" height="40" fill="#ffffff"/>
    <line x1="2" y1="5" x2="78" y2="5" stroke="#0f172a" stroke-width="2"/>
    <line x1="2" y1="43" x2="78" y2="43" stroke="#0f172a" stroke-width="2"/>
    <line x1="6" y1="17" x2="74" y2="17" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="6" y1="30" x2="74" y2="30" stroke="#e2e8f0" stroke-width="1"/>
    <circle cx="10" cy="11" r="1.5" fill="#f59e0b"/>
    <circle cx="10" cy="23.5" r="1.5" fill="#f59e0b"/>
    <circle cx="10" cy="36.5" r="1.5" fill="#f59e0b"/>
  </svg>`,
  'test-dark-obsidian-matrix': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect x="2" y="4" width="76" height="40" rx="4" fill="#0b0f19" stroke="#1e293b" stroke-width="1.2"/>
    <rect x="6" y="10" width="20" height="28" rx="2" fill="#131c2e" stroke="#334155" stroke-width="0.8"/>
    <rect x="30" y="10" width="20" height="28" rx="2" fill="#131c2e" stroke="#334155" stroke-width="0.8"/>
    <rect x="54" y="10" width="20" height="28" rx="2" fill="#131c2e" stroke="#334155" stroke-width="0.8"/>
    <circle cx="10" cy="15" r="1.5" fill="#fbbf24"/>
    <circle cx="34" cy="15" r="1.5" fill="#fbbf24"/>
    <circle cx="58" cy="15" r="1.5" fill="#fbbf24"/>
  </svg>`,
  'test-timeline-delivery-audit': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect x="2" y="4" width="76" height="40" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2"/>
    <rect x="6" y="10" width="20" height="28" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="7.5" y="12" width="17" height="5" rx="1.5" fill="#e0f2fe"/>
    <rect x="30" y="10" width="20" height="28" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="31.5" y="12" width="17" height="5" rx="1.5" fill="#e0f2fe"/>
    <rect x="54" y="10" width="20" height="28" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="55.5" y="12" width="17" height="5" rx="1.5" fill="#e0f2fe"/>
  </svg>`,
  'test-quote-pillar-columns': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect x="2" y="4" width="76" height="40" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2"/>
    <rect x="6" y="10" width="20" height="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="6" y1="10" x2="6" y2="38" stroke="#7530fb" stroke-width="2.5"/>
    <rect x="30" y="10" width="20" height="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="30" y1="10" x2="30" y2="38" stroke="#7530fb" stroke-width="2.5"/>
    <rect x="54" y="10" width="20" height="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8"/>
    <line x1="54" y1="10" x2="54" y2="38" stroke="#7530fb" stroke-width="2.5"/>
  </svg>`,
  'test-certified-seal-stamps': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect x="2" y="4" width="76" height="40" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
    <rect x="6" y="10" width="20" height="28" rx="2" fill="#ffffff" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="2 1"/>
    <circle cx="16" cy="17" r="3.5" fill="#fef3c7" stroke="#b45309" stroke-width="0.8"/>
    <rect x="30" y="10" width="20" height="28" rx="2" fill="#ffffff" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="2 1"/>
    <circle cx="40" cy="17" r="3.5" fill="#fef3c7" stroke="#b45309" stroke-width="0.8"/>
    <rect x="54" y="10" width="20" height="28" rx="2" fill="#ffffff" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="2 1"/>
    <circle cx="64" cy="17" r="3.5" fill="#fef3c7" stroke="#b45309" stroke-width="0.8"/>
  </svg>`,
  'test-compact-horizontal-ticker': `<svg viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:36px;">
    <rect x="2" y="4" width="76" height="40" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.2"/>
    <rect x="6" y="9" width="68" height="8" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="6" y="20" width="68" height="8" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <rect x="6" y="31" width="68" height="8" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <circle cx="11" cy="13" r="1.5" fill="#f59e0b"/>
    <circle cx="11" cy="24" r="1.5" fill="#f59e0b"/>
    <circle cx="11" cy="35" r="1.5" fill="#f59e0b"/>
  </svg>`,
}
