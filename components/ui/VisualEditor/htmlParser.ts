// components/ui/VisualEditor/htmlParser.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — HTML → Block[] Parser
//
// Pure TypeScript — no React, no DOM APIs (runs in Node + browser).
// Imported by VisualEditor.tsx when user switches from Code → Visual mode.
//
// Strategy — two-pass parsing:
//
//   Pass 1 (FAST — always tried first):
//     Looks for <!-- BLOCK:type:id --> comment markers that our toHtml()
//     functions embed. If found, reconstructs blocks exactly with their ids.
//     This covers the happy path: user built in visual mode, switched to code,
//     made minor text edits, switches back.
//
//   Pass 2 (HEURISTIC — fallback):
//     If no BLOCK comments found (e.g. hand-written HTML, imported template,
//     AI-generated HTML), scans the raw HTML for known patterns and tries to
//     map them to the closest block type with sensible extracted props.
//     Returns a `warnings` array listing anything that couldn't be parsed.
//
//   Failure mode:
//     If neither pass finds anything usable, returns an empty block array +
//     a single warning. The caller (VisualEditor.tsx) shows the warning banner
//     "Some custom code may not be editable visually" and keeps the HTML intact
//     in the code editor state.
//
// ─────────────────────────────────────────────────────────────────────────────

import {
    Block,
    BlockType,
    BlockProps,
    generateId,
    getDefinition,
    BLOCK_DEFINITIONS,
    // prop types needed for heuristic extraction
    HeadingProps,
    ParagraphProps,
    ImageProps,
    ProductTitleProps,
    ProductImageProps,
    ProductDescriptionProps,
    PriceBlockProps,
    DividerProps,
    BannerProps,
    TrustBadgesProps,
    ShippingInfoProps,
    ReturnsPolicyProps,
    SellerInfoProps,
    CtaBannerProps,
    SpecsTableProps,
    BulletListProps,
} from './blocks'

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ParseResult {
    blocks: Block[]
    /** Strategy used — callers can show different UI for each */
    strategy: 'block-comments' | 'heuristic' | 'empty'
    /** Human-readable warnings shown in the visual editor warning banner */
    warnings: string[]
    /** true when the HTML had content but we could not parse ANY of it */
    failed: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * parseHtml(html) → ParseResult
 *
 * Main export. Call this when switching from Code Editor → Visual Editor.
 * Always returns a ParseResult — never throws.
 */
export function parseHtml(html: string): ParseResult {
    const trimmed = html.trim()

    // Empty document
    if (!trimmed || trimmed === '' || isEmptyDocument(trimmed)) {
        return {
            blocks: [],
            strategy: 'empty',
            warnings: [],
            failed: false,
        }
    }

    // Pass 1 — block comment markers
    const pass1 = parseByComments(trimmed)
    if (pass1.blocks.length > 0) {
        return { ...pass1, strategy: 'block-comments', failed: false }
    }

    // Pass 2 — heuristic pattern matching
    const pass2 = parseByHeuristics(trimmed)
    if (pass2.blocks.length > 0) {
        return { ...pass2, strategy: 'heuristic', failed: false }
    }

    // Total failure — return empty with warning
    return {
        blocks: [],
        strategy: 'heuristic',
        warnings: [
            'This template uses custom HTML that cannot be converted to visual blocks. ' +
            'Your code is preserved — switch back to Code Editor to continue editing.',
        ],
        failed: true,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** True when the HTML is just a bare document shell with no meaningful body content */
function isEmptyDocument(html: string): boolean {
    // Strip the document shell
    const body = extractBody(html)
    // Remove whitespace-only content and empty table wrappers
    const stripped = body
        .replace(/<table[^>]*>\s*<\/table>/gi, '')
        .replace(/\s+/g, '')
    return stripped.length === 0
}

/** Extract content between <body> tags, or return the whole string if no body tag */
function extractBody(html: string): string {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    return bodyMatch ? bodyMatch[1] : html
}

/** Extract inline style value — e.g. extractStyle('color:#ff0000;font-size:14px', 'color') → '#ff0000' */
function extractStyle(styleStr: string, prop: string): string {
    const regex = new RegExp(prop + '\\s*:\\s*([^;]+)', 'i')
    const match = styleStr.match(regex)
    return match ? match[1].trim() : ''
}

/** Extract attribute value from an HTML tag string */
function extractAttr(tag: string, attr: string): string {
    const regex = new RegExp(attr + '\\s*=\\s*["\']([^"\']*)["\']', 'i')
    const match = tag.match(regex)
    return match ? match[1].trim() : ''
}

/** Strip all HTML tags from a string, decode basic entities */
function stripTags(html: string): string {
    return html
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#10003;/g, '✓')
        .replace(/&#8594;/g, '→')
        .replace(/&#9733;/g, '★')
        .trim()
}

/** Parse a px value like '14px' → 14 */
function parsePx(val: string): number {
    const n = parseInt(val, 10)
    return isNaN(n) ? 0 : n
}

/** Safe parseInt with fallback */
function safeInt(val: string, fallback: number): number {
    const n = parseInt(val, 10)
    return isNaN(n) ? fallback : n
}

/** Get default props for a block type (deep clone) */
function defaultPropsFor(type: BlockType): BlockProps {
    const def = getDefinition(type)
    if (!def) throw new Error(`No definition for ${type}`)
    return JSON.parse(JSON.stringify(def.defaultProps))
}

// ─────────────────────────────────────────────────────────────────────────────
// PASS 1 — BLOCK COMMENT PARSING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scans for <!-- BLOCK:type:id --> ... <!-- /BLOCK:type:id --> pairs
 * and reconstructs Block instances from them.
 *
 * For each matched block:
 *   - Restores the original id (so re-generating HTML is identical)
 *   - Extracts props by running the heuristic extractor on the inner HTML
 *     (since we don't serialise props as JSON — we serialise as HTML)
 */
function parseByComments(html: string): { blocks: Block[]; warnings: string[] } {
    const blocks: Block[] = []
    const warnings: string[] = []

    // Match all <!-- BLOCK:type:id --> ... <!-- /BLOCK:type:id --> regions
    const BLOCK_RE = /<!--\s*BLOCK:([a-z_]+):([a-z0-9]+)\s*-->([\s\S]*?)<!--\s*\/BLOCK:\1:\2\s*-->/g

    let match: RegExpExecArray | null
    while ((match = BLOCK_RE.exec(html)) !== null) {
        const [, rawType, id, innerHtml] = match
        const type = rawType as BlockType

        // Verify this is a known block type
        const def = getDefinition(type)
        if (!def) {
            warnings.push(`Unknown block type "${type}" — skipped.`)
            continue
        }

        // Extract props from the inner HTML
        const props = extractPropsFromHtml(type, innerHtml.trim())

        blocks.push({ id, type, props })
    }

    return { blocks, warnings }
}

// ─────────────────────────────────────────────────────────────────────────────
// PASS 2 — HEURISTIC PARSING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * When no BLOCK comments exist, scan the HTML body for recognisable patterns.
 * Each heuristic returns null if it doesn't match, or a Block if it does.
 * We run them in priority order on each top-level table/section.
 */
function parseByHeuristics(html: string): { blocks: Block[]; warnings: string[] } {
    const blocks: Block[] = []
    const warnings: string[] = []
    const body = extractBody(html)

    // Split into top-level sections by splitting on <table ... > boundaries
    // Each top-level table becomes a candidate for one block
    const sections = splitIntoSections(body)

    for (const section of sections) {
        if (!section.trim()) continue

        const block =
            tryHeading(section) ||
            tryProductTitle(section) ||
            tryPriceBlock(section) ||
            tryProductImage(section) ||
            tryImage(section) ||
            tryDivider(section) ||
            tryBulletList(section) ||
            trySpecsTable(section) ||
            tryTrustBadges(section) ||
            tryShippingInfo(section) ||
            tryReturnsPolicy(section) ||
            trySellerInfo(section) ||
            tryBanner(section) ||
            tryCtaBanner(section) ||
            tryProductDescription(section) ||
            tryParagraph(section)

        if (block) {
            blocks.push(block)
        } else {
            // Could not map this section — wrap it as a full_width_section
            // to preserve the HTML rather than discard it
            const fallbackProps = defaultPropsFor('full_width_section') as any
            fallbackProps.content = section.trim()
            blocks.push({
                id: generateId(),
                type: 'full_width_section',
                props: fallbackProps,
            })
            warnings.push(
                'One section could not be identified and was wrapped as a Full Width Section. ' +
                'Check it in the Properties panel.'
            )
        }
    }

    return { blocks, warnings }
}

/**
 * Split body HTML into top-level sections.
 * Strategy: split on </table> boundaries, keeping each <table>...</table> together.
 * Non-table content between tables is grouped into its own chunk.
 */
function splitIntoSections(body: string): string[] {
    const sections: string[] = []

    // Match top-level tables
    const TABLE_RE = /<table[\s\S]*?<\/table>/gi
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = TABLE_RE.exec(body)) !== null) {
        // Content before this table
        const before = body.slice(lastIndex, match.index).trim()
        if (before) sections.push(before)

        sections.push(match[0])
        lastIndex = match.index + match[0].length
    }

    // Remaining content after last table
    const after = body.slice(lastIndex).trim()
    if (after) sections.push(after)

    return sections.filter(s => s.trim().length > 0)
}

// ─────────────────────────────────────────────────────────────────────────────
// PROP EXTRACTOR DISPATCHER
// Used by Pass 1 to rebuild props from inner HTML of a known block type
// ─────────────────────────────────────────────────────────────────────────────

function extractPropsFromHtml(type: BlockType, html: string): BlockProps {
    switch (type) {
        case 'heading': return extractHeadingProps(html)
        case 'product_title': return extractProductTitleProps(html)
        case 'paragraph': return extractParagraphProps(html)
        case 'price_block': return extractPriceBlockProps(html)
        case 'product_image': return extractProductImageProps(html)
        case 'image': return extractImageProps(html)
        case 'divider': return extractDividerProps(html)
        case 'bullet_list': return extractBulletListProps(html)
        case 'specs_table': return extractSpecsTableProps(html)
        case 'trust_badges': return extractTrustBadgesProps(html)
        case 'shipping_info': return extractShippingInfoProps(html)
        case 'returns_policy': return extractReturnsPolicyProps(html)
        case 'seller_info': return extractSellerInfoProps(html)
        case 'banner': return extractBannerProps(html)
        case 'cta_banner': return extractCtaBannerProps(html)
        case 'product_description': return extractProductDescriptionProps(html)
        default:
            // For layout blocks and gallery_row, return defaults
            // (their inner content is complex multi-slot HTML)
            return defaultPropsFor(type)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// INDIVIDUAL PROP EXTRACTORS
// Each returns a fully-typed BlockProps for its block type
// ─────────────────────────────────────────────────────────────────────────────

function extractHeadingProps(html: string): HeadingProps {
    const base = defaultPropsFor('heading') as HeadingProps

    // Extract outer td background
    const tdBg = html.match(/background-color:\s*([^;'"]+)/i)
    if (tdBg) base.bgColor = tdBg[1].trim()

    // Extract the heading tag
    const hMatch = html.match(/<(h[1-4])[^>]*style="([^"]*)"[^>]*>([\s\S]*?)<\/\1>/i)
    if (hMatch) {
        base.level = hMatch[1] as HeadingProps['level']
        const style = hMatch[2]
        base.text = stripTags(hMatch[3])

        const color = extractStyle(style, 'color')
        if (color) base.color = color

        const fs = extractStyle(style, 'font-size')
        if (fs) base.fontSize = parsePx(fs)

        const fw = extractStyle(style, 'font-weight')
        if (fw) base.fontWeight = fw as HeadingProps['fontWeight']

        const ta = extractStyle(style, 'text-align')
        if (ta) base.align = ta as HeadingProps['align']

        // Detect accent border
        const bl = extractStyle(style, 'border-left')
        if (bl) {
            base.borderBottom = true
            const colorMatch = bl.match(/#[0-9a-f]{3,6}/i)
            if (colorMatch) base.accentColor = colorMatch[0]
        } else {
            base.borderBottom = false
        }
    }

    return base
}

function extractProductTitleProps(html: string): ProductTitleProps {
    const base = defaultPropsFor('product_title') as ProductTitleProps

    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
    if (h1Match) {
        base.text = stripTags(h1Match[1])
        const styleMatch = h1Match[0].match(/style="([^"]*)"/i)
        if (styleMatch) {
            const style = styleMatch[1]
            const color = extractStyle(style, 'color')
            if (color) base.color = color
            const fs = extractStyle(style, 'font-size')
            if (fs) base.fontSize = parsePx(fs)
        }
    }

    // Condition text
    const condMatch = html.match(/Condition:[^<]*<strong[^>]*>([\s\S]*?)<\/strong>/i)
    if (condMatch) {
        base.showCondition = true
        base.conditionText = condMatch[1].trim()
    } else {
        base.showCondition = false
    }

    return base
}

function extractParagraphProps(html: string): ParagraphProps {
    const base = defaultPropsFor('paragraph') as ParagraphProps

    const pMatch = html.match(/<p[^>]*style="([^"]*)"[^>]*>([\s\S]*?)<\/p>/i)
    if (pMatch) {
        const style = pMatch[1]
        base.text = stripTags(pMatch[2])

        const color = extractStyle(style, 'color')
        if (color) base.color = color

        const fs = extractStyle(style, 'font-size')
        if (fs) base.fontSize = parsePx(fs)

        const lh = extractStyle(style, 'line-height')
        if (lh) base.lineHeight = parseFloat(lh)

        const ta = extractStyle(style, 'text-align')
        if (ta) base.align = ta as ParagraphProps['align']
    }

    return base
}

function extractPriceBlockProps(html: string): PriceBlockProps {
    const base = defaultPropsFor('price_block') as PriceBlockProps

    const pMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
    if (pMatch) {
        const styleMatch = pMatch[0].match(/style="([^"]*)"/i)
        if (styleMatch) {
            const color = extractStyle(styleMatch[1], 'color')
            if (color) base.priceColor = color
            const fs = extractStyle(styleMatch[1], 'font-size')
            if (fs) base.priceFontSize = parsePx(fs)
        }
        // Extract price text — first text node (before any spans)
        const priceText = pMatch[1].replace(/<span[\s\S]*?<\/span>/gi, '').trim()
        if (priceText) base.priceText = stripTags(priceText)
    }

    // Detect sale badge
    const badgeMatch = html.match(/<span[^>]*background-color:\s*([^;'"]+)[^>]*>([\s\S]*?)<\/span>/i)
    if (badgeMatch) {
        base.showBadge = true
        base.badgeBg = badgeMatch[1].trim()
        base.badgeText = stripTags(badgeMatch[2])
    }

    return base
}

function extractProductImageProps(html: string): ProductImageProps {
    const base = defaultPropsFor('product_image') as ProductImageProps

    const imgMatch = html.match(/<img([^>]*)>/i)
    if (imgMatch) {
        const tag = imgMatch[1]
        const src = extractAttr('<img' + tag + '>', 'src')
        if (src) base.src = src

        const alt = extractAttr('<img' + tag + '>', 'alt')
        if (alt) base.alt = alt

        const styleMatch = tag.match(/style="([^"]*)"/i)
        if (styleMatch) {
            const mw = extractStyle(styleMatch[1], 'max-width')
            if (mw) base.maxWidth = parsePx(mw)

            const br = extractStyle(styleMatch[1], 'border-radius')
            if (br) base.borderRadius = parsePx(br)

            const margin = extractStyle(styleMatch[1], 'margin')
            if (margin.includes('auto')) base.align = 'center'
        }
    }

    return base
}

function extractImageProps(html: string): ImageProps {
    const base = defaultPropsFor('image') as ImageProps

    const imgMatch = html.match(/<img([^>]*)>/i)
    if (imgMatch) {
        const tag = '<img' + imgMatch[1] + '>'
        const src = extractAttr(tag, 'src')
        if (src) base.src = src

        const alt = extractAttr(tag, 'alt')
        if (alt) base.alt = alt

        const styleMatch = imgMatch[1].match(/style="([^"]*)"/i)
        if (styleMatch) {
            const br = extractStyle(styleMatch[1], 'border-radius')
            if (br) base.borderRadius = parsePx(br)
        }
    }

    // Detect link wrapper
    const aMatch = html.match(/href="([^"]*)"/i)
    if (aMatch) base.linkUrl = aMatch[1]

    return base
}

function extractDividerProps(html: string): DividerProps {
    const base = defaultPropsFor('divider') as DividerProps

    const hrMatch = html.match(/<hr[^>]*style="([^"]*)"[^>]*>/i)
    if (hrMatch) {
        const style = hrMatch[1]

        // Gradient divider
        if (style.includes('linear-gradient')) {
            base.lineStyle = 'gradient'
        } else {
            const borderTop = extractStyle(style, 'border-top')
            if (borderTop) {
                const parts = borderTop.split(' ')
                const thickness = parts.find(p => p.endsWith('px'))
                if (thickness) base.thickness = parsePx(thickness)

                const styleType = parts.find(p =>
                    ['solid', 'dashed', 'dotted'].includes(p)
                )
                if (styleType) base.lineStyle = styleType as DividerProps['lineStyle']

                const color = parts.find(p => p.startsWith('#'))
                if (color) base.color = color
            }
        }

        const width = extractStyle(style, 'width')
        if (width && width.endsWith('%')) {
            base.widthPercent = parseInt(width, 10)
        }
    }

    return base
}

function extractBulletListProps(html: string): BulletListProps {
    const base = defaultPropsFor('bullet_list') as BulletListProps

    // Find all item text cells (second td in each row)
    const itemMatches = [...html.matchAll(/<td[^>]*valign="top"[^>]*>\s*([\s\S]*?)\s*<\/td>/gi)]
    const items: string[] = []

    // Items are in pairs: [bullet, text, bullet, text, ...]
    // Take every second match (the text cells)
    for (let i = 1; i < itemMatches.length; i += 2) {
        const text = stripTags(itemMatches[i][1]).trim()
        if (text) items.push(text)
    }

    if (items.length > 0) base.items = items

    // Detect bullet style from first bullet cell
    const bulletMatch = html.match(/<td[^>]*width="20"[^>]*>([\s\S]*?)<\/td>/i)
    if (bulletMatch) {
        const bulletChar = stripTags(bulletMatch[1]).trim()
        if (bulletChar === '✓' || bulletChar === '&#10003;') base.bulletStyle = 'check'
        else if (bulletChar === '→' || bulletChar === '&#8594;') base.bulletStyle = 'arrow'
        else if (bulletChar === '★' || bulletChar === '&#9733;') base.bulletStyle = 'star'
        else base.bulletStyle = 'disc'

        // Bullet color
        const styleMatch = bulletMatch[0].match(/color:\s*([^;'"]+)/i)
        if (styleMatch) base.bulletColor = styleMatch[1].trim()
    }

    return base
}

function extractSpecsTableProps(html: string): SpecsTableProps {
    const base = defaultPropsFor('specs_table') as SpecsTableProps

    // Extract title
    const titleMatch = html.match(/border-left:[^>]*>([\s\S]*?)<\/p>/i)
    if (titleMatch) {
        base.showTitle = true
        base.titleText = stripTags(titleMatch[1]).trim()
    }

    // Extract rows — look for pairs of <td> in each <tr>
    const rows: Array<{ key: string; value: string }> = []
    const trMatches = [...html.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)]

    for (const trMatch of trMatches) {
        const tdMatches = [...trMatch[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)]
        if (tdMatches.length >= 2) {
            const key = stripTags(tdMatches[0][1]).trim()
            const value = stripTags(tdMatches[1][1]).trim()
            if (key && value) rows.push({ key, value })
        }
    }

    if (rows.length > 0) base.rows = rows

    return base
}

function extractTrustBadgesProps(html: string): TrustBadgesProps {
    const base = defaultPropsFor('trust_badges') as TrustBadgesProps

    // Each badge is a <td> with a <div> containing icon p + text p
    const badges: Array<{ icon: string; text: string }> = []
    const divMatches = [...html.matchAll(/<div[^>]*>([\s\S]*?)<\/div>/gi)]

    for (const divMatch of divMatches) {
        const pMatches = [...divMatch[1].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
        if (pMatches.length >= 2) {
            const icon = stripTags(pMatches[0][1]).trim()
            const text = stripTags(pMatches[1][1]).trim()
            if (text) badges.push({ icon, text })
        }
    }

    if (badges.length > 0) base.badges = badges

    return base
}

function extractShippingInfoProps(html: string): ShippingInfoProps {
    const base = defaultPropsFor('shipping_info') as ShippingInfoProps

    // Extract bg from outer td
    const bgMatch = html.match(/background-color:\s*([^;'"]+)/i)
    if (bgMatch) base.bgColor = bgMatch[1].trim()

    // Extract text content
    const pMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
    if (pMatch) {
        const parts = stripTags(pMatch[1]).split('•').map(p => p.trim()).filter(Boolean)
        if (parts[0]) base.shippingText = parts[0].replace(/^[^\w]*/, '').trim()
        if (parts[1]) base.dispatchText = parts[1]
        if (parts[2]) base.locationText = parts[2]

        const styleMatch = pMatch[0].match(/color:\s*([^;'"]+)/i)
        if (styleMatch) base.textColor = styleMatch[1].trim()
    }

    return base
}

function extractReturnsPolicyProps(html: string): ReturnsPolicyProps {
    const base = defaultPropsFor('returns_policy') as ReturnsPolicyProps

    const bgMatch = html.match(/background-color:\s*([^;'"]+)/i)
    if (bgMatch) base.bgColor = bgMatch[1].trim()

    const pMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
    if (pMatch) {
        const full = stripTags(pMatch[1]).replace(/^[^\w]*/, '').trim()
        const parts = full.split('•').map(p => p.trim()).filter(Boolean)

        // First part is either the period text or the policy
        if (parts.length >= 2) {
            base.showPeriod = true
            // First bold part is periodText, rest is policyText
            const strongMatch = pMatch[1].match(/<strong>([\s\S]*?)<\/strong>/i)
            if (strongMatch) {
                base.periodText = stripTags(strongMatch[1]).trim()
                base.policyText = parts.slice(1).join(' ').trim()
            }
        } else {
            base.showPeriod = false
            base.policyText = full
        }
    }

    return base
}

function extractSellerInfoProps(html: string): SellerInfoProps {
    const base = defaultPropsFor('seller_info') as SellerInfoProps

    const bgMatch = html.match(/background-color:\s*([^;'"]+)/i)
    if (bgMatch) base.bgColor = bgMatch[1].trim()

    // First <p> = name + badge
    const pMatches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    if (pMatches[0]) {
        // Remove badge span, get name
        const nameHtml = pMatches[0][1].replace(/<span[\s\S]*?<\/span>/gi, '')
        base.sellerName = stripTags(nameHtml).trim()

        // Badge
        const badgeMatch = pMatches[0][1].match(/<span[^>]*>([\s\S]*?)<\/span>/i)
        if (badgeMatch) {
            base.showBadge = true
            base.badgeText = stripTags(badgeMatch[1]).trim()
        } else {
            base.showBadge = false
        }
    }

    if (pMatches[1]) {
        const parts = stripTags(pMatches[1][1]).split('•').map(p => p.trim())
        if (parts[0]) base.tagline = parts[0]
        if (parts[1]) base.feedbackText = parts[1]
    }

    return base
}

function extractBannerProps(html: string): BannerProps {
    const base = defaultPropsFor('banner') as BannerProps

    // Detect gradient
    const gradientMatch = html.match(/linear-gradient\([^)]+\)/i)
    if (gradientMatch) {
        base.bgGradient = true
        const colorMatches = gradientMatch[0].match(/#[0-9a-f]{3,6}/gi)
        if (colorMatches?.[0]) base.gradientFrom = colorMatches[0]
        if (colorMatches?.[1]) base.gradientTo = colorMatches[1]
    } else {
        const bgMatch = html.match(/background-color:\s*([^;'"]+)/i)
        if (bgMatch) base.bgColor = bgMatch[1].trim()
        base.bgGradient = false
    }

    const h2Match = html.match(/<h2[^>]*style="([^"]*)"[^>]*>([\s\S]*?)<\/h2>/i)
    if (h2Match) {
        base.headingText = stripTags(h2Match[2]).trim()
        const color = extractStyle(h2Match[1], 'color')
        if (color) base.headingColor = color
        const fs = extractStyle(h2Match[1], 'font-size')
        if (fs) base.headingSize = parsePx(fs)
    }

    const pMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
    if (pMatch) {
        base.subText = stripTags(pMatch[1]).trim()
        const styleMatch = pMatch[0].match(/style="([^"]*)"/i)
        if (styleMatch) {
            const color = extractStyle(styleMatch[1], 'color')
            if (color) base.subColor = color
        }
    }

    return base
}

function extractCtaBannerProps(html: string): CtaBannerProps {
    const base = defaultPropsFor('cta_banner') as CtaBannerProps

    const gradientMatch = html.match(/linear-gradient\([^)]+\)/i)
    if (gradientMatch) {
        base.bgGradient = true
        const colorMatches = gradientMatch[0].match(/#[0-9a-f]{3,6}/gi)
        if (colorMatches?.[0]) base.gradientFrom = colorMatches[0]
        if (colorMatches?.[1]) base.gradientTo = colorMatches[1]
    } else {
        const bgMatch = html.match(/background-color:\s*([^;'"]+)/i)
        if (bgMatch) base.bgColor = bgMatch[1].trim()
    }

    const pMatches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    if (pMatches[0]) {
        base.headingText = stripTags(pMatches[0][1]).trim()
        const styleMatch = pMatches[0][0].match(/style="([^"]*)"/i)
        if (styleMatch) {
            const color = extractStyle(styleMatch[1], 'color')
            if (color) base.textColor = color
        }
    }
    if (pMatches[1]) {
        base.subText = stripTags(pMatches[1][1]).trim()
        const styleMatch = pMatches[1][0].match(/style="([^"]*)"/i)
        if (styleMatch) {
            const color = extractStyle(styleMatch[1], 'color')
            if (color) base.subTextColor = color
        }
    }

    return base
}

function extractProductDescriptionProps(html: string): ProductDescriptionProps {
    const base = defaultPropsFor('product_description') as ProductDescriptionProps

    // Title block (the border-left p)
    const titleMatch = html.match(/border-left:[^>]*>([\s\S]*?)<\/p>/i)
    if (titleMatch) {
        base.showTitle = true
        base.titleText = stripTags(titleMatch[1]).trim()
    } else {
        base.showTitle = false
    }

    // Main description p — last <p> in the block
    const pMatches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    const lastP = pMatches[pMatches.length - 1]
    if (lastP) {
        base.text = stripTags(lastP[1]).trim()
        const styleMatch = lastP[0].match(/style="([^"]*)"/i)
        if (styleMatch) {
            const color = extractStyle(styleMatch[1], 'color')
            if (color) base.color = color
            const fs = extractStyle(styleMatch[1], 'font-size')
            if (fs) base.fontSize = parsePx(fs)
            const lh = extractStyle(styleMatch[1], 'line-height')
            if (lh) base.lineHeight = parseFloat(lh)
        }
    }

    return base
}

// ─────────────────────────────────────────────────────────────────────────────
// HEURISTIC DETECTORS
// Each tries to recognise a section as a specific block type.
// Returns Block or null.
// ─────────────────────────────────────────────────────────────────────────────

function tryHeading(html: string): Block | null {
    if (!/<h[1-4][^>]*>/i.test(html)) return null

    // Make sure it's not a product title (which has condition text below)
    const hasCondition = /condition:/i.test(html)
    if (hasCondition) return null

    // Make sure it's a simple heading, not a banner/CTA
    const hasSubP = (html.match(/<p[^>]*>/gi) || []).length > 1
    if (hasSubP) return null

    return {
        id: generateId(),
        type: 'heading',
        props: extractHeadingProps(html),
    }
}

function tryProductTitle(html: string): Block | null {
    // Product title: has <h1> AND either {{PRODUCT_TITLE}} or condition text
    if (!/<h1[^>]*>/i.test(html)) return null
    const text = stripTags(html)
    const hasPlaceholder = text.includes('PRODUCT_TITLE') || text.includes('ITEM_CONDITION')
    const hasCondition = /condition:/i.test(html)
    if (!hasPlaceholder && !hasCondition) return null

    return {
        id: generateId(),
        type: 'product_title',
        props: extractProductTitleProps(html),
    }
}

function tryPriceBlock(html: string): Block | null {
    const text = stripTags(html)
    const hasPricePlaceholder = text.includes('ITEM_PRICE') || text.includes('PRICE')
    const hasLargeFont = /font-size:\s*(2[4-9]|3[0-9]|4[0-9])\s*px/i.test(html)
    if (!hasPricePlaceholder && !hasLargeFont) return null
    if (/<h[1-4][^>]*>/i.test(html)) return null

    return {
        id: generateId(),
        type: 'price_block',
        props: extractPriceBlockProps(html),
    }
}

function tryProductImage(html: string): Block | null {
    if (!/<img[^>]*>/i.test(html)) return null
    const text = stripTags(html).trim()
    const srcMatch = html.match(/src="([^"]*)"/i)
    if (!srcMatch) return null

    const src = srcMatch[1]
    const isProductImg = src.includes('MAIN_IMAGE') ||
        src.includes('IMAGE_URL') ||
        src.includes('ebayimg') ||
        src.includes('i.ebayimg')

    // No other text content — pure image block
    if (!isProductImg && text.length > 10) return null

    return {
        id: generateId(),
        type: 'product_image',
        props: extractProductImageProps(html),
    }
}

function tryImage(html: string): Block | null {
    if (!/<img[^>]*>/i.test(html)) return null
    // Already handled by tryProductImage — only reach here if not a product image
    const imgCount = (html.match(/<img[^>]*>/gi) || []).length
    if (imgCount !== 1) return null

    return {
        id: generateId(),
        type: 'image',
        props: extractImageProps(html),
    }
}

function tryDivider(html: string): Block | null {
    if (!/<hr[^>]*>/i.test(html)) return null
    return {
        id: generateId(),
        type: 'divider',
        props: extractDividerProps(html),
    }
}

function tryBulletList(html: string): Block | null {
    // Bullet list has multiple rows with a narrow bullet td (width=20)
    const hasBulletCell = /width="20"/i.test(html) || /width:\s*20px/i.test(html)
    if (!hasBulletCell) return null

    const rowCount = (html.match(/<tr>/gi) || []).length
    if (rowCount < 2) return null

    return {
        id: generateId(),
        type: 'bullet_list',
        props: extractBulletListProps(html),
    }
}

function trySpecsTable(html: string): Block | null {
    // Specs table: multiple rows of key-value pairs
    const trCount = (html.match(/<tr>/gi) || []).length
    if (trCount < 2) return null

    // Each row has exactly 2 td cells
    const trMatches = [...html.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)]
    let validRowCount = 0
    for (const tr of trMatches) {
        const tdCount = (tr[1].match(/<td[^>]*>/gi) || []).length
        if (tdCount === 2) validRowCount++
    }

    if (validRowCount < 2) return null

    // Make sure it's not a two-column layout (those have larger content in each cell)
    const avgTdLength = trMatches.reduce((sum, tr) => {
        const tds = [...tr[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)]
        return sum + tds.reduce((s, td) => s + stripTags(td[1]).length, 0)
    }, 0) / (validRowCount * 2)

    // Specs table cells are short (key=label, value=data)
    if (avgTdLength > 80) return null

    return {
        id: generateId(),
        type: 'specs_table',
        props: extractSpecsTableProps(html),
    }
}

function tryTrustBadges(html: string): Block | null {
    // Trust badges: multiple cells each with icon + short text
    const tdCount = (html.match(/<td[^>]*>/gi) || []).length
    if (tdCount < 3) return null

    const text = stripTags(html)
    const trustWords = ['authentic', 'trusted', 'dispatch', 'return', 'rating', 'fast', 'seller', 'genuine']
    const matchCount = trustWords.filter(w => text.toLowerCase().includes(w)).length

    if (matchCount < 2) return null

    return {
        id: generateId(),
        type: 'trust_badges',
        props: extractTrustBadgesProps(html),
    }
}

function tryShippingInfo(html: string): Block | null {
    const text = stripTags(html).toLowerCase()
    const shippingWords = ['dispatch', 'shipping', 'delivery', 'tracked', 'postage']
    const matchCount = shippingWords.filter(w => text.includes(w)).length
    if (matchCount < 2) return null

    // Single row, single paragraph
    const trCount = (html.match(/<tr>/gi) || []).length
    if (trCount > 2) return null

    return {
        id: generateId(),
        type: 'shipping_info',
        props: extractShippingInfoProps(html),
    }
}

function tryReturnsPolicy(html: string): Block | null {
    const text = stripTags(html).toLowerCase()
    const returnWords = ['return', 'refund', 'money back', 'day returns']
    const matchCount = returnWords.filter(w => text.includes(w)).length
    if (matchCount < 1) return null

    const trCount = (html.match(/<tr>/gi) || []).length
    if (trCount > 2) return null

    return {
        id: generateId(),
        type: 'returns_policy',
        props: extractReturnsPolicyProps(html),
    }
}

function trySellerInfo(html: string): Block | null {
    const text = stripTags(html).toLowerCase()
    const sellerWords = ['seller', 'feedback', 'rated', 'SELLER_NAME', 'top rated']
    const matchCount = sellerWords.filter(w => text.includes(w.toLowerCase())).length
    if (matchCount < 1) return null

    const trCount = (html.match(/<tr>/gi) || []).length
    if (trCount > 2) return null

    return {
        id: generateId(),
        type: 'seller_info',
        props: extractSellerInfoProps(html),
    }
}

function tryBanner(html: string): Block | null {
    // Banner: has gradient OR dark background + heading + subtitle
    const hasDarkBg = /background(?:-color)?:\s*(#1e1535|#7530fb|#0f0e1a|#1a1828)/i.test(html)
    const hasGradient = /linear-gradient/i.test(html)
    if (!hasDarkBg && !hasGradient) return null

    const hasH2 = /<h2[^>]*>/i.test(html)
    if (!hasH2) return null

    // CTA banners have very short content — banners have subtitle
    const pCount = (html.match(/<p[^>]*>/gi) || []).length
    if (pCount < 1) return null

    // Differentiate from CTA banner — banners don't have the "buy with confidence" pattern
    const text = stripTags(html).toLowerCase()
    const isCta = text.includes('confidence') || text.includes('secure payment') || text.includes('buy with')
    if (isCta) return null

    return {
        id: generateId(),
        type: 'banner',
        props: extractBannerProps(html),
    }
}

function tryCtaBanner(html: string): Block | null {
    // CTA banner: dark/gradient bg + short heading + subtext (no h2, uses p)
    const hasDarkBg = /background(?:-color)?:\s*(#1e1535|#7530fb|#0f0e1a)/i.test(html)
    const hasGradient = /linear-gradient/i.test(html)
    if (!hasDarkBg && !hasGradient) return null

    const hasH2 = /<h2[^>]*>/i.test(html)
    if (hasH2) return null // That's a banner, not a CTA

    const pCount = (html.match(/<p[^>]*>/gi) || []).length
    if (pCount < 1) return null

    return {
        id: generateId(),
        type: 'cta_banner',
        props: extractCtaBannerProps(html),
    }
}

function tryProductDescription(html: string): Block | null {
    const text = stripTags(html)
    const hasDescPlaceholder = text.includes('ITEM_DESCRIPTION') || text.includes('DESCRIPTION')
    if (!hasDescPlaceholder) return null

    return {
        id: generateId(),
        type: 'product_description',
        props: extractProductDescriptionProps(html),
    }
}

function tryParagraph(html: string): Block | null {
    // Last resort for any section with text content
    const hasPara = /<p[^>]*>/i.test(html)
    if (!hasPara) return null

    const text = stripTags(html).trim()
    if (!text || text.length < 2) return null

    return {
        id: generateId(),
        type: 'paragraph',
        props: extractParagraphProps(html),
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY EXPORTS (used by VisualEditor.tsx for warning display)
// ─────────────────────────────────────────────────────────────────────────────

/** Human-readable description of what the parse result means */
export function describeResult(result: ParseResult): string {
    if (result.failed) {
        return 'Custom code detected — visual editing unavailable for this template.'
    }
    if (result.strategy === 'block-comments') {
        return `Loaded ${result.blocks.length} block${result.blocks.length !== 1 ? 's' : ''} from your template.`
    }
    if (result.strategy === 'heuristic') {
        return `Converted ${result.blocks.length} section${result.blocks.length !== 1 ? 's' : ''} from existing HTML. Some properties may need adjusting.`
    }
    return 'Starting with a blank canvas.'
}
