// components/ui/VisualEditor/blocks.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Editor Block System
//
// Pure TypeScript — no React, no imports.
// Every other VisualEditor file imports from here.
//
// Each block has:
//   id         — unique instance id (uuid-like, generated at add time)
//   type       — which block definition to use
//   props      — editable properties for this instance
//   toHtml()   — generates eBay-safe table-based HTML from props
//
// HTML output rules (eBay compliance):
//   ✓ Table-based layout only — no div-based layout
//   ✓ All styles inline
//   ✓ No <script>, no external resources, no JS event handlers
//   ✓ HTTPS image URLs only
//   ✓ {{PLACEHOLDERS}} preserved as-is
//   ✓ Data attributes for round-trip parsing: data-block-type, data-block-id
// ─────────────────────────────────────────────────────────────────────────────

// ── ID generator ───────────────────────────────────────────────────────────
export function generateId(): string {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

// ── Block categories ────────────────────────────────────────────────────────
export type BlockCategory =
    | 'Layout'
    | 'Content'
    | 'Product'
    | 'Media'
    | 'eBay Specific'

// ── All block type keys ──────────────────────────────────────────────────────
export type BlockType =
    // Layout
    | 'full_width_section'
    | 'two_column'
    | 'three_column'
    | 'container'
    // Content
    | 'heading'
    | 'paragraph'
    | 'bullet_list'
    | 'divider'
    // Product
    | 'product_title'
    | 'price_block'
    | 'product_image'
    | 'product_description'
    | 'specs_table'
    // Media
    | 'image'
    | 'banner'
    | 'gallery_row'
    // eBay Specific
    | 'trust_badges'
    | 'shipping_info'
    | 'returns_policy'
    | 'seller_info'
    | 'cta_banner'

// ── Base block instance ─────────────────────────────────────────────────────
export interface Block {
    id: string
    type: BlockType
    props: BlockProps
}

// ── Union of all possible prop shapes ───────────────────────────────────────
// Every block type has its own props interface.
// BlockProps is the union — props on a Block instance is always one of these.
export type BlockProps =
    | FullWidthSectionProps
    | TwoColumnProps
    | ThreeColumnProps
    | ContainerProps
    | HeadingProps
    | ParagraphProps
    | BulletListProps
    | DividerProps
    | ProductTitleProps
    | PriceBlockProps
    | ProductImageProps
    | ProductDescriptionProps
    | SpecsTableProps
    | ImageProps
    | BannerProps
    | GalleryRowProps
    | TrustBadgesProps
    | ShippingInfoProps
    | ReturnsPolicyProps
    | SellerInfoProps
    | CtaBannerProps

// ── Shared common props (present on every block) ────────────────────────────
export interface CommonProps {
    bgColor: string        // background colour of the block's wrapper cell
    paddingTop: number     // px
    paddingBottom: number  // px
    paddingLeft: number    // px
    paddingRight: number   // px
}

const DEFAULT_COMMON: CommonProps = {
    bgColor: '#ffffff',
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 24,
    paddingRight: 24,
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT BLOCKS
// ─────────────────────────────────────────────────────────────────────────────

// ── Full Width Section ───────────────────────────────────────────────────────
export interface FullWidthSectionProps extends CommonProps {
    content: string           // HTML content inside the section
    borderColor: string
    borderWidth: number
    borderRadius: number
}

// ── Two Column ───────────────────────────────────────────────────────────────
export interface TwoColumnProps extends CommonProps {
    leftContent: string
    rightContent: string
    leftWidth: number         // percentage 0–100, right = 100-leftWidth
    gap: number               // px gap between columns
}

// ── Three Column ─────────────────────────────────────────────────────────────
export interface ThreeColumnProps extends CommonProps {
    col1Content: string
    col2Content: string
    col3Content: string
    gap: number
}

// ── Container ────────────────────────────────────────────────────────────────
export interface ContainerProps extends CommonProps {
    maxWidth: number          // px max-width of inner content
    content: string
    borderColor: string
    borderWidth: number
    borderRadius: number
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT BLOCKS
// ─────────────────────────────────────────────────────────────────────────────

// ── Heading ──────────────────────────────────────────────────────────────────
export interface HeadingProps extends CommonProps {
    text: string
    level: 'h1' | 'h2' | 'h3' | 'h4'
    color: string
    fontSize: number          // px
    align: 'left' | 'center' | 'right'
    fontWeight: '400' | '600' | '700' | '800' | '900'
    borderBottom: boolean     // decorative left-border accent
    accentColor: string       // left-border color when borderBottom = true
}

// ── Paragraph ────────────────────────────────────────────────────────────────
export interface ParagraphProps extends CommonProps {
    text: string
    color: string
    fontSize: number
    lineHeight: number        // e.g. 1.7
    align: 'left' | 'center' | 'right'
}

// ── Bullet List ──────────────────────────────────────────────────────────────
export interface BulletListProps extends CommonProps {
    items: string[]           // each item is a string (may contain placeholders)
    color: string
    fontSize: number
    bulletColor: string
    style: 'disc' | 'check' | 'arrow' | 'star'
}

// ── Divider ───────────────────────────────────────────────────────────────────
export interface DividerProps extends CommonProps {
    color: string
    thickness: number         // px
    style: 'solid' | 'dashed' | 'dotted' | 'gradient'
    widthPercent: number      // 0–100
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT BLOCKS
// ─────────────────────────────────────────────────────────────────────────────

// ── Product Title ─────────────────────────────────────────────────────────────
export interface ProductTitleProps extends CommonProps {
    text: string              // default: {{PRODUCT_TITLE}}
    color: string
    fontSize: number
    align: 'left' | 'center' | 'right'
    fontWeight: '600' | '700' | '800' | '900'
    showCondition: boolean
    conditionText: string     // default: {{ITEM_CONDITION}}
}

// ── Price Block ───────────────────────────────────────────────────────────────
export interface PriceBlockProps extends CommonProps {
    priceText: string         // default: {{ITEM_PRICE}}
    priceColor: string
    priceFontSize: number
    showOriginal: boolean
    originalText: string      // default: {{ORIGINAL_PRICE}}
    showBadge: boolean
    badgeText: string         // e.g. "SALE" or "{{DISCOUNT_PERCENT}} OFF"
    badgeBg: string
    badgeColor: string
    borderRadius: number
}

// ── Product Image ─────────────────────────────────────────────────────────────
export interface ProductImageProps extends CommonProps {
    src: string               // default: {{MAIN_IMAGE_URL}}
    alt: string               // default: {{PRODUCT_TITLE}}
    maxWidth: number          // px
    align: 'left' | 'center' | 'right'
    borderRadius: number
    showBorder: boolean
    borderColor: string
}

// ── Product Description ───────────────────────────────────────────────────────
export interface ProductDescriptionProps extends CommonProps {
    text: string              // default: {{ITEM_DESCRIPTION}}
    color: string
    fontSize: number
    lineHeight: number
    showTitle: boolean
    titleText: string
    titleColor: string
}

// ── Specs Table ───────────────────────────────────────────────────────────────
export interface SpecsTableProps extends CommonProps {
    rows: Array<{ key: string; value: string }>
    headerBg: string
    headerText: string
    rowBg: string
    altRowBg: string
    borderColor: string
    fontSize: number
    showTitle: boolean
    titleText: string
}

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA BLOCKS
// ─────────────────────────────────────────────────────────────────────────────

// ── Image ─────────────────────────────────────────────────────────────────────
export interface ImageProps extends CommonProps {
    src: string
    alt: string
    width: number             // px or percent
    widthUnit: 'px' | '%'
    align: 'left' | 'center' | 'right'
    borderRadius: number
    linkUrl: string           // optional click-through URL
}

// ── Banner ────────────────────────────────────────────────────────────────────
export interface BannerProps extends CommonProps {
    bgColor: string           // overrides CommonProps.bgColor for banner bg
    bgGradient: boolean
    gradientFrom: string
    gradientTo: string
    headingText: string
    headingColor: string
    headingSize: number
    subText: string
    subColor: string
    align: 'left' | 'center' | 'right'
    minHeight: number         // px
}

// ── Gallery Row ───────────────────────────────────────────────────────────────
export interface GalleryRowProps extends CommonProps {
    images: Array<{ src: string; alt: string }>  // up to 5
    gap: number
    borderRadius: number
    mainImageSrc: string      // large image on left
    showMain: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// EBAY SPECIFIC BLOCKS
// ─────────────────────────────────────────────────────────────────────────────

// ── Trust Badges Row ──────────────────────────────────────────────────────────
export interface TrustBadgesProps extends CommonProps {
    badges: Array<{ icon: string; text: string }>  // emoji icon + label
    iconColor: string
    textColor: string
    badgeBg: string
    borderColor: string
    borderRadius: number
}

// ── Shipping Info Bar ─────────────────────────────────────────────────────────
export interface ShippingInfoProps extends CommonProps {
    shippingText: string      // default: "{{SHIPPING_TIME}} — Fast & Free"
    dispatchText: string
    locationText: string
    bgColor: string
    textColor: string
    iconColor: string
    borderRadius: number
}

// ── Returns Policy ────────────────────────────────────────────────────────────
export interface ReturnsPolicyProps extends CommonProps {
    policyText: string        // default: {{RETURN_POLICY}}
    showPeriod: boolean
    periodText: string        // e.g. "30-Day Free Returns"
    bgColor: string
    textColor: string
    accentColor: string
    borderRadius: number
}

// ── Seller Info ───────────────────────────────────────────────────────────────
export interface SellerInfoProps extends CommonProps {
    sellerName: string        // default: {{SELLER_NAME}}
    tagline: string
    feedbackText: string
    showBadge: boolean
    badgeText: string         // e.g. "Top Rated Seller"
    bgColor: string
    textColor: string
    accentColor: string
}

// ── CTA Banner ────────────────────────────────────────────────────────────────
export interface CtaBannerProps extends CommonProps {
    headingText: string
    subText: string
    bgColor: string
    bgGradient: boolean
    gradientFrom: string
    gradientTo: string
    textColor: string
    subTextColor: string
    align: 'left' | 'center' | 'right'
    minHeight: number
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK DEFINITIONS
// Meta information for each block type — used by BlockLibrary sidebar
// ─────────────────────────────────────────────────────────────────────────────

export interface BlockDefinition {
    type: BlockType
    label: string
    category: BlockCategory
    icon: string                           // emoji icon for sidebar
    description: string                    // tooltip / subtitle
    defaultProps: BlockProps               // used when block is added to canvas
    toHtml: (props: BlockProps, id: string) => string   // generates eBay-safe HTML
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML WRAPPER HELPER
// Wraps block HTML in a table row with data attributes for parsing
// ─────────────────────────────────────────────────────────────────────────────
function wrapBlock(type: BlockType, id: string, innerHtml: string): string {
    return `<!-- BLOCK:${type}:${id} -->\n${innerHtml}\n<!-- /BLOCK:${type}:${id} -->`
}

// Padding shorthand helper
function pad(p: CommonProps): string {
    return `padding:${p.paddingTop}px ${p.paddingRight}px ${p.paddingBottom}px ${p.paddingLeft}px;`
}

// Text alignment
function textAlign(align: string): string {
    return `text-align:${align};`
}

// Margin map for image alignment
function imgMargin(align: 'left' | 'center' | 'right'): string {
    if (align === 'center') return 'margin:0 auto;'
    if (align === 'right') return 'margin:0 0 0 auto;'
    return 'margin:0;'
}

// ─────────────────────────────────────────────────────────────────────────────
// ALL BLOCK DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

export const BLOCK_DEFINITIONS: BlockDefinition[] = [

    // ── LAYOUT ──────────────────────────────────────────────────────────────

    {
        type: 'full_width_section',
        label: 'Full Width Section',
        category: 'Layout',
        icon: 'layout',
        description: 'Full-width container for any content',
        defaultProps: {
            ...DEFAULT_COMMON,
            content: '<p style="font-family:Arial,sans-serif;font-size:14px;color:#1f1d2e;margin:0;">Your content here</p>',
            borderColor: '#ede9fe',
            borderWidth: 0,
            borderRadius: 0,
        } as FullWidthSectionProps,
        toHtml(props, id) {
            const p = props as FullWidthSectionProps
            const border = p.borderWidth > 0 ? `border:${p.borderWidth}px solid ${p.borderColor};` : ''
            const radius = p.borderRadius > 0 ? `border-radius:${p.borderRadius}px;` : ''
            return wrapBlock('full_width_section', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}${border}${radius}">
      ${p.content}
    </td>
  </tr>
</table>`
            )
        },
    },

    {
        type: 'two_column',
        label: 'Two Column',
        category: 'Layout',
        icon: 'columns-2',
        description: 'Side-by-side two column layout',
        defaultProps: {
            ...DEFAULT_COMMON,
            leftContent: '<p style="font-family:Arial,sans-serif;font-size:14px;color:#1f1d2e;margin:0;">Left column</p>',
            rightContent: '<p style="font-family:Arial,sans-serif;font-size:14px;color:#1f1d2e;margin:0;">Right column</p>',
            leftWidth: 50,
            gap: 16,
        } as TwoColumnProps,
        toHtml(props, id) {
            const p = props as TwoColumnProps
            const rightWidth = 100 - p.leftWidth
            return wrapBlock('two_column', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="${p.leftWidth}%" valign="top" style="padding-right:${p.gap / 2}px;">
            ${p.leftContent}
          </td>
          <td width="${rightWidth}%" valign="top" style="padding-left:${p.gap / 2}px;">
            ${p.rightContent}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
            )
        },
    },

    {
        type: 'three_column',
        label: 'Three Column',
        category: 'Layout',
        icon: 'columns-3',
        description: 'Three equal column layout',
        defaultProps: {
            ...DEFAULT_COMMON,
            col1Content: '<p style="font-family:Arial,sans-serif;font-size:13px;color:#1f1d2e;margin:0;">Column 1</p>',
            col2Content: '<p style="font-family:Arial,sans-serif;font-size:13px;color:#1f1d2e;margin:0;">Column 2</p>',
            col3Content: '<p style="font-family:Arial,sans-serif;font-size:13px;color:#1f1d2e;margin:0;">Column 3</p>',
            gap: 12,
        } as ThreeColumnProps,
        toHtml(props, id) {
            const p = props as ThreeColumnProps
            return wrapBlock('three_column', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="33%" valign="top" style="padding-right:${p.gap / 2}px;">${p.col1Content}</td>
          <td width="34%" valign="top" style="padding-left:${p.gap / 2}px;padding-right:${p.gap / 2}px;">${p.col2Content}</td>
          <td width="33%" valign="top" style="padding-left:${p.gap / 2}px;">${p.col3Content}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
            )
        },
    },

    {
        type: 'container',
        label: 'Container',
        category: 'Layout',
        icon: 'square',
        description: 'Centered container with max-width',
        defaultProps: {
            ...DEFAULT_COMMON,
            maxWidth: 600,
            content: '<p style="font-family:Arial,sans-serif;font-size:14px;color:#1f1d2e;margin:0;">Container content</p>',
            borderColor: '#ede9fe',
            borderWidth: 1,
            borderRadius: 8,
        } as ContainerProps,
        toHtml(props, id) {
            const p = props as ContainerProps
            return wrapBlock('container', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};padding:${p.paddingTop}px ${p.paddingRight}px ${p.paddingBottom}px ${p.paddingLeft}px;">
      <table width="${p.maxWidth}" cellpadding="0" cellspacing="0" border="0" align="center"
        style="max-width:${p.maxWidth}px;width:100%;border:${p.borderWidth}px solid ${p.borderColor};border-radius:${p.borderRadius}px;">
        <tr><td style="padding:20px;">${p.content}</td></tr>
      </table>
    </td>
  </tr>
</table>`
            )
        },
    },

    // ── CONTENT ─────────────────────────────────────────────────────────────

    {
        type: 'heading',
        label: 'Heading',
        category: 'Content',
        icon: 'heading',
        description: 'Section heading H1 – H4',
        defaultProps: {
            ...DEFAULT_COMMON,
            text: 'Section Heading',
            level: 'h2',
            color: '#1e1535',
            fontSize: 22,
            align: 'left',
            fontWeight: '700',
            borderBottom: true,
            accentColor: '#7530fb',
        } as HeadingProps,
        toHtml(props, id) {
            const p = props as HeadingProps
            const border = p.borderBottom
                ? `border-left:4px solid ${p.accentColor};padding-left:12px;`
                : ''
            return wrapBlock('heading', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}">
      <${p.level} style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize}px;font-weight:${p.fontWeight};color:${p.color};${textAlign(p.align)}${border}">
        ${p.text}
      </${p.level}>
    </td>
  </tr>
</table>`
            )
        },
    },

    {
        type: 'paragraph',
        label: 'Paragraph',
        category: 'Content',
        icon: 'pilcrow',
        description: 'Body text paragraph',
        defaultProps: {
            ...DEFAULT_COMMON,
            text: 'Enter your paragraph text here. You can include {{PRODUCT_TITLE}} and other placeholders.',
            color: '#6b7280',
            fontSize: 14,
            lineHeight: 1.7,
            align: 'left',
        } as ParagraphProps,
        toHtml(props, id) {
            const p = props as ParagraphProps
            return wrapBlock('paragraph', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize}px;line-height:${p.lineHeight};color:${p.color};${textAlign(p.align)}">
        ${p.text}
      </p>
    </td>
  </tr>
</table>`
            )
        },
    },

    {
        type: 'bullet_list',
        label: 'Bullet List',
        category: 'Content',
        icon: 'list',
        description: 'Styled feature list with icons',
        defaultProps: {
            ...DEFAULT_COMMON,
            items: ['Feature one — describe your product benefit', 'Feature two — another key selling point', 'Feature three — quality guarantee'],
            color: '#1f1d2e',
            fontSize: 14,
            bulletColor: '#7530fb',
            style: 'check',
        } as BulletListProps,
        toHtml(props, id) {
            const p = props as BulletListProps
            const bulletMap: Record<string, string> = {
                disc: '•',
                check: '&#10003;',
                arrow: '&#8594;',
                star: '&#9733;',
            }
            const bullet = bulletMap[p.style] || '•'
            const rows = p.items.map(item =>
                `        <tr>
          <td width="20" valign="top" style="padding-right:8px;padding-bottom:8px;font-family:Arial,sans-serif;font-size:${p.fontSize}px;color:${p.bulletColor};font-weight:700;">${bullet}</td>
          <td valign="top" style="padding-bottom:8px;font-family:Arial,sans-serif;font-size:${p.fontSize}px;color:${p.color};line-height:1.6;">${item}</td>
        </tr>`
            ).join('\n')
            return wrapBlock('bullet_list', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
${rows}
      </table>
    </td>
  </tr>
</table>`
            )
        },
    },

    {
        type: 'divider',
        label: 'Divider',
        category: 'Content',
        icon: 'minus',
        description: 'Horizontal divider line',
        defaultProps: {
            ...DEFAULT_COMMON,
            paddingTop: 8,
            paddingBottom: 8,
            color: '#ede9fe',
            thickness: 1,
            style: 'solid',
            widthPercent: 100,
        } as DividerProps,
        toHtml(props, id) {
            const p = props as DividerProps
            let hrStyle: string
            if (p.style === 'gradient') {
                hrStyle = `border:none;height:${p.thickness}px;background:linear-gradient(to right,#7530fb,#b8fa33);width:${p.widthPercent}%;margin:0 auto;display:block;`
            } else {
                hrStyle = `border:none;border-top:${p.thickness}px ${p.style} ${p.color};width:${p.widthPercent}%;margin:0 auto;display:block;`
            }
            return wrapBlock('divider', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}">
      <hr style="${hrStyle}" />
    </td>
  </tr>
</table>`
            )
        },
    },

    // ── PRODUCT ──────────────────────────────────────────────────────────────

    {
        type: 'product_title',
        label: 'Product Title',
        category: 'Product',
        icon: 'tag',
        description: 'Main product title with condition badge',
        defaultProps: {
            ...DEFAULT_COMMON,
            paddingTop: 20,
            paddingBottom: 12,
            text: '{{PRODUCT_TITLE}}',
            color: '#1e1535',
            fontSize: 24,
            align: 'left',
            fontWeight: '800',
            showCondition: true,
            conditionText: '{{ITEM_CONDITION}}',
        } as ProductTitleProps,
        toHtml(props, id) {
            const p = props as ProductTitleProps
            const conditionHtml = p.showCondition
                ? `<p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;">Condition: <strong style="color:#7530fb;">${p.conditionText}</strong></p>`
                : ''
            return wrapBlock('product_title', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}">
      <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize}px;font-weight:${p.fontWeight};color:${p.color};${textAlign(p.align)}line-height:1.3;">
        ${p.text}
      </h1>
      ${conditionHtml}
    </td>
  </tr>
</table>`
            )
        },
    },

    {
        type: 'price_block',
        label: 'Price Block',
        category: 'Product',
        icon: 'badge-dollar-sign',
        description: 'Price display with optional sale badge',
        defaultProps: {
            ...DEFAULT_COMMON,
            bgColor: '#f8f7ff',
            paddingTop: 16,
            paddingBottom: 16,
            priceText: '{{ITEM_PRICE}}',
            priceColor: '#7530fb',
            priceFontSize: 32,
            showOriginal: false,
            originalText: '{{ORIGINAL_PRICE}}',
            showBadge: false,
            badgeText: 'SALE',
            badgeBg: '#b8fa33',
            badgeColor: '#1e1535',
            borderRadius: 10,
        } as PriceBlockProps,
        toHtml(props, id) {
            const p = props as PriceBlockProps
            const badgeHtml = p.showBadge
                ? `<span style="display:inline-block;background-color:${p.badgeBg};color:${p.badgeColor};font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px;margin-left:10px;vertical-align:middle;">${p.badgeText}</span>`
                : ''
            const originalHtml = p.showOriginal
                ? `<span style="font-family:Arial,sans-serif;font-size:16px;color:#9ca3af;text-decoration:line-through;margin-left:12px;vertical-align:middle;">${p.originalText}</span>`
                : ''
            return wrapBlock('price_block', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}border-radius:${p.borderRadius}px;">
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.priceFontSize}px;font-weight:900;color:${p.priceColor};line-height:1.2;">
        ${p.priceText}${badgeHtml}${originalHtml}
      </p>
    </td>
  </tr>
</table>`
            )
        },
    },

    {
        type: 'product_image',
        label: 'Product Image',
        category: 'Product',
        icon: 'image',
        description: 'Main product image with placeholder',
        defaultProps: {
            ...DEFAULT_COMMON,
            paddingTop: 12,
            paddingBottom: 12,
            src: '{{MAIN_IMAGE_URL}}',
            alt: '{{PRODUCT_TITLE}}',
            maxWidth: 500,
            align: 'center',
            borderRadius: 8,
            showBorder: false,
            borderColor: '#ede9fe',
        } as ProductImageProps,
        toHtml(props, id) {
            const p = props as ProductImageProps
            const border = p.showBorder ? `border:1px solid ${p.borderColor};` : ''
            return wrapBlock('product_image', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}${textAlign(p.align)}">
      <img src="${p.src}" alt="${p.alt}"
        width="${p.maxWidth}"
        style="max-width:${p.maxWidth}px;width:100%;height:auto;display:block;${imgMargin(p.align)}border-radius:${p.borderRadius}px;${border}" />
    </td>
  </tr>
</table>`
            )
        },
    },

    {
        type: 'product_description',
        label: 'Product Description',
        category: 'Product',
        icon: 'file-text',
        description: 'Full product description section',
        defaultProps: {
            ...DEFAULT_COMMON,
            text: '{{ITEM_DESCRIPTION}}',
            color: '#6b7280',
            fontSize: 14,
            lineHeight: 1.8,
            showTitle: true,
            titleText: 'Product Description',
            titleColor: '#1e1535',
        } as ProductDescriptionProps,
        toHtml(props, id) {
            const p = props as ProductDescriptionProps
            const titleHtml = p.showTitle
                ? `<p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:16px;font-weight:700;color:${p.titleColor};border-left:4px solid #7530fb;padding-left:12px;">${p.titleText}</p>`
                : ''
            return wrapBlock('product_description', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}">
      ${titleHtml}
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize}px;line-height:${p.lineHeight};color:${p.color};">
        ${p.text}
      </p>
    </td>
  </tr>
</table>`
            )
        },
    },

    {
        type: 'specs_table',
        label: 'Specs Table',
        category: 'Product',
        icon: 'table',
        description: 'Item specifics / specs table',
        defaultProps: {
            ...DEFAULT_COMMON,
            bgColor: '#f8f7ff',
            rows: [
                { key: 'Brand', value: '{{BRAND}}' },
                { key: 'Model', value: '{{MODEL}}' },
                { key: 'Condition', value: '{{ITEM_CONDITION}}' },
                { key: 'MPN', value: '{{MPN}}' },
                { key: 'EAN', value: '{{EAN}}' },
                { key: 'Weight', value: '{{WEIGHT}}' },
            ],
            headerBg: '#7530fb',
            headerText: '#ffffff',
            rowBg: '#ffffff',
            altRowBg: '#f8f7ff',
            borderColor: '#ede9fe',
            fontSize: 13,
            showTitle: true,
            titleText: 'Item Specifics',
        } as SpecsTableProps,
        toHtml(props, id) {
            const p = props as SpecsTableProps
            const titleHtml = p.showTitle
                ? `<p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:16px;font-weight:700;color:#1e1535;border-left:4px solid #7530fb;padding-left:12px;">${p.titleText}</p>`
                : ''
            const rows = p.rows.map((row, i) =>
                `        <tr>
          <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:${p.fontSize}px;font-weight:700;color:#1e1535;border:1px solid ${p.borderColor};background-color:${i % 2 === 0 ? p.rowBg : p.altRowBg};width:40%;">${row.key}</td>
          <td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:${p.fontSize}px;color:#6b7280;border:1px solid ${p.borderColor};background-color:${i % 2 === 0 ? p.rowBg : p.altRowBg};">${row.value}</td>
        </tr>`
            ).join('\n')
            return wrapBlock('specs_table', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}">
      ${titleHtml}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
${rows}
      </table>
    </td>
  </tr>
</table>`
            )
        },
    },

    // ── MEDIA ────────────────────────────────────────────────────────────────

    {
        type: 'image',
        label: 'Image',
        category: 'Media',
        icon: 'camera',
        description: 'Single image block',
        defaultProps: {
            ...DEFAULT_COMMON,
            src: 'https://via.placeholder.com/700x300/f3eeff/7530fb?text=Add+Image+URL',
            alt: 'Image',
            width: 100,
            widthUnit: '%',
            align: 'center',
            borderRadius: 0,
            linkUrl: '',
        } as ImageProps,
        toHtml(props, id) {
            const p = props as ImageProps
            const widthStyle = `width:${p.width}${p.widthUnit};max-width:100%;`
            const imgTag = `<img src="${p.src}" alt="${p.alt}" border="0"
        style="${widthStyle}height:auto;display:block;${imgMargin(p.align)}border-radius:${p.borderRadius}px;" />`
            const content = p.linkUrl
                ? `<a href="${p.linkUrl}" style="display:block;${imgMargin(p.align)}">${imgTag}</a>`
                : imgTag
            return wrapBlock('image', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}${textAlign(p.align)}">
      ${content}
    </td>
  </tr>
</table>`
            )
        },
    },

    {
        type: 'banner',
        label: 'Banner',
        category: 'Media',
        icon: 'megaphone',
        description: 'Hero banner with heading and subtext',
        defaultProps: {
            ...DEFAULT_COMMON,
            paddingTop: 32,
            paddingBottom: 32,
            bgColor: '#1e1535',
            bgGradient: true,
            gradientFrom: '#7530fb',
            gradientTo: '#1e1535',
            headingText: 'Welcome to Our Store',
            headingColor: '#ffffff',
            headingSize: 26,
            subText: 'Quality products · Fast dispatch · Trusted seller',
            subColor: 'rgba(255,255,255,0.75)',
            align: 'center',
            minHeight: 120,
        } as BannerProps,
        toHtml(props, id) {
            const p = props as BannerProps
            const bg = p.bgGradient
                ? `background:linear-gradient(135deg,${p.gradientFrom},${p.gradientTo});`
                : `background-color:${p.bgColor};`
            return wrapBlock('banner', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="${bg}${pad(p)}min-height:${p.minHeight}px;${textAlign(p.align)}">
      <h2 style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:${p.headingSize}px;font-weight:800;color:${p.headingColor};line-height:1.3;">
        ${p.headingText}
      </h2>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:${p.subColor};line-height:1.6;">
        ${p.subText}
      </p>
    </td>
  </tr>
</table>`
            )
        },
    },

    {
        type: 'gallery_row',
        label: 'Gallery Row',
        category: 'Media',
        icon: 'layout-grid',
        description: 'Product image gallery row',
        defaultProps: {
            ...DEFAULT_COMMON,
            paddingTop: 12,
            paddingBottom: 12,
            mainImageSrc: '{{MAIN_IMAGE_URL}}',
            showMain: true,
            images: [
                { src: '{{IMAGE_2_URL}}', alt: 'Product view 2' },
                { src: '{{IMAGE_3_URL}}', alt: 'Product view 3' },
            ],
            gap: 8,
            borderRadius: 6,
        } as GalleryRowProps,
        toHtml(props, id) {
            const p = props as GalleryRowProps
            const thumbWidth = Math.floor(100 / (p.images.length || 1))
            const thumbCells = p.images.map(img =>
                `          <td width="${thumbWidth}%" style="padding:${p.gap / 2}px;">
            <img src="${img.src}" alt="${img.alt}" border="0"
              style="width:100%;height:auto;display:block;border-radius:${p.borderRadius}px;" />
          </td>`
            ).join('\n')
            const mainHtml = p.showMain
                ? `<tr>
    <td style="padding-bottom:${p.gap}px;">
      <img src="${p.mainImageSrc}" alt="Main product image" border="0"
        style="width:100%;max-width:100%;height:auto;display:block;border-radius:${p.borderRadius}px;" />
    </td>
  </tr>` : ''
            return wrapBlock('gallery_row', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${mainHtml}
        <tr>
${thumbCells}
        </tr>
      </table>
    </td>
  </tr>
</table>`
            )
        },
    },

    // ── EBAY SPECIFIC ────────────────────────────────────────────────────────

    {
        type: 'trust_badges',
        label: 'Trust Badges Row',
        category: 'eBay Specific',
        icon: 'shield-check',
        description: 'eBay trust badges — authentic, shipping, returns, seller rating',
        defaultProps: {
            ...DEFAULT_COMMON,
            bgColor: '#f8f7ff',
            badges: [
                { icon: 'check', text: 'Authentic Product' },
                { icon: 'package', text: 'Fast Dispatch' },
                { icon: 'rotate-ccw', text: '30-Day Returns' },
                { icon: 'star', text: 'Top Rated Seller' },
            ],
            iconColor: '#7530fb',
            textColor: '#1e1535',
            badgeBg: '#ffffff',
            borderColor: '#ede9fe',
            borderRadius: 8,
        } as TrustBadgesProps,
        toHtml(props, id) {
            const p = props as TrustBadgesProps
            const colWidth = Math.floor(100 / p.badges.length)
            const cells = p.badges.map(b =>
                `        <td width="${colWidth}%" style="text-align:center;padding:12px 8px;">
          <div style="display:inline-block;background-color:${p.badgeBg};border:1px solid ${p.borderColor};border-radius:${p.borderRadius}px;padding:10px 14px;min-width:80px;">
            <p style="margin:0 0 4px;font-size:18px;">${b.icon}</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:${p.textColor};">${b.text}</p>
          </div>
        </td>`
            ).join('\n')
            return wrapBlock('trust_badges', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
${cells}
        </tr>
      </table>
    </td>
  </tr>
</table>`
            )
        },
    },

    {
        type: 'shipping_info',
        label: 'Shipping Info Bar',
        category: 'eBay Specific',
        icon: 'truck',
        description: 'Shipping time, dispatch and location bar',
        defaultProps: {
            ...DEFAULT_COMMON,
            paddingTop: 14,
            paddingBottom: 14,
            shippingText: '{{SHIPPING_TIME}}',
            dispatchText: 'Same Day Dispatch Before 3pm',
            locationText: 'UK-Based Seller — Fast & Tracked',
            bgColor: '#dcfce7',
            textColor: '#166534',
            iconColor: '#16a34a',
            borderRadius: 8,
        } as ShippingInfoProps,
        toHtml(props, id) {
            const p = props as ShippingInfoProps
            return wrapBlock('shipping_info', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}border-radius:${p.borderRadius}px;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${p.textColor};line-height:1.6;">
        &#128230; <strong>${p.shippingText}</strong> &bull; ${p.dispatchText} &bull; ${p.locationText}
      </p>
    </td>
  </tr>
</table>`
            )
        },
    },

    {
        type: 'returns_policy',
        label: 'Returns Policy',
        category: 'eBay Specific',
        icon: 'rotate-ccw',
        description: 'Returns policy block with period and terms',
        defaultProps: {
            ...DEFAULT_COMMON,
            paddingTop: 14,
            paddingBottom: 14,
            policyText: '{{RETURN_POLICY}}',
            showPeriod: true,
            periodText: '30-Day Free Returns',
            bgColor: '#e0f2fe',
            textColor: '#075985',
            accentColor: '#0ea5e9',
            borderRadius: 8,
        } as ReturnsPolicyProps,
        toHtml(props, id) {
            const p = props as ReturnsPolicyProps
            const period = p.showPeriod
                ? `<strong>${p.periodText}</strong> &bull; `
                : ''
            return wrapBlock('returns_policy', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}border-radius:${p.borderRadius}px;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:${p.textColor};line-height:1.6;">
        &#128260; ${period}${p.policyText}
      </p>
    </td>
  </tr>
</table>`
            )
        },
    },

    {
        type: 'seller_info',
        label: 'Seller Info',
        category: 'eBay Specific',
        icon: 'user',
        description: 'Seller name, tagline and feedback score',
        defaultProps: {
            ...DEFAULT_COMMON,
            bgColor: '#f8f7ff',
            sellerName: '{{SELLER_NAME}}',
            tagline: 'Trusted eBay Seller Since 2010',
            feedbackText: '99.8% Positive Feedback',
            showBadge: true,
            badgeText: 'Top Rated Seller',
            textColor: '#1e1535',
            accentColor: '#7530fb',
        } as SellerInfoProps,
        toHtml(props, id) {
            const p = props as SellerInfoProps
            const badge = p.showBadge
                ? `<span style="display:inline-block;background-color:#b8fa33;color:#1e1535;font-family:Arial,sans-serif;font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;margin-left:10px;vertical-align:middle;">${p.badgeText}</span>`
                : ''
            return wrapBlock('seller_info', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}">
      <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:16px;font-weight:700;color:${p.textColor};">
        ${p.sellerName}${badge}
      </p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;line-height:1.6;">
        ${p.tagline} &bull; <span style="color:${p.accentColor};font-weight:600;">${p.feedbackText}</span>
      </p>
    </td>
  </tr>
</table>`
            )
        },
    },

    {
        type: 'cta_banner',
        label: 'CTA Banner',
        category: 'eBay Specific',
        icon: 'bell',
        description: 'Call-to-action banner — end of listing',
        defaultProps: {
            ...DEFAULT_COMMON,
            paddingTop: 24,
            paddingBottom: 24,
            headingText: 'Buy with Confidence — Trusted eBay Seller',
            subText: 'All items are genuine &bull; Secure payment &bull; Fast dispatch',
            bgColor: '#1e1535',
            bgGradient: false,
            gradientFrom: '#7530fb',
            gradientTo: '#1e1535',
            textColor: '#b8fa33',
            subTextColor: 'rgba(255,255,255,0.6)',
            align: 'center',
            minHeight: 80,
        } as CtaBannerProps,
        toHtml(props, id) {
            const p = props as CtaBannerProps
            const bg = p.bgGradient
                ? `background:linear-gradient(135deg,${p.gradientFrom},${p.gradientTo});`
                : `background-color:${p.bgColor};`
            return wrapBlock('cta_banner', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="${bg}${pad(p)}min-height:${p.minHeight}px;${textAlign(p.align)}">
      <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:800;color:${p.textColor};">
        ${p.headingText}
      </p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:${p.subTextColor};">
        ${p.subText}
      </p>
    </td>
  </tr>
</table>`
            )
        },
    },

]

// ─────────────────────────────────────────────────────────────────────────────
// LOOKUP HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Get a block definition by type */
export function getDefinition(type: BlockType): BlockDefinition | undefined {
    return BLOCK_DEFINITIONS.find(d => d.type === type)
}

/** Get all definitions for a given category */
export function getByCategory(category: BlockCategory): BlockDefinition[] {
    return BLOCK_DEFINITIONS.filter(d => d.category === category)
}

/** All categories in display order */
export const BLOCK_CATEGORIES: BlockCategory[] = [
    'Layout',
    'Content',
    'Product',
    'Media',
    'eBay Specific',
]

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK FACTORY
// Creates a fresh Block instance from a definition
// ─────────────────────────────────────────────────────────────────────────────
export function createBlock(type: BlockType): Block {
    const def = getDefinition(type)
    if (!def) throw new Error(`Unknown block type: ${type}`)
    return {
        id: generateId(),
        type,
        props: { ...def.defaultProps },
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL DOCUMENT ASSEMBLER
// Wraps all block HTML in a valid eBay-safe document shell
// ─────────────────────────────────────────────────────────────────────────────
export function assembleDocument(blocks: Block[]): string {
    if (blocks.length === 0) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background: #f8f8f8; }
    table { border-collapse: collapse; }
  </style>
</head>
<body>
</body>
</html>`
    }

    const bodyHtml = blocks.map(block => {
        const def = getDefinition(block.type)
        if (!def) return ''
        return def.toHtml(block.props, block.id)
    }).join('\n\n')

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background: #f8f8f8; }
    table { border-collapse: collapse; }
    img { border: 0; display: block; }
  </style>
</head>
<body>
<table width="700" cellpadding="0" cellspacing="0" border="0" align="center"
  style="width:100%;max-width:700px;margin:0 auto;background:#ffffff;">

${bodyHtml}

</table>
</body>
</html>`
}
