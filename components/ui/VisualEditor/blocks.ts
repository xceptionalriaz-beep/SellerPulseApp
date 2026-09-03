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
    | 'Conversion'
    | 'Header & Footer'
    | 'Typography'

// ── All block type keys ──────────────────────────────────────────────────────
export type BlockType =
    // Layout
    | 'full_width_section'
    | 'two_column'
    | 'three_column'
    | 'container'
    | 'four_column'
    | 'sidebar_layout'
    | 'full_width_hero'
    | 'spacer'
    | 'border_box'
    // Content
    | 'heading'
    | 'paragraph'
    | 'bullet_list'
    | 'divider'
    | 'numbered_list'
    | 'quote_block'
    | 'warning_box'
    | 'info_box'
    | 'data_table'
    | 'badge_row'
    // Product
    | 'product_title'
    | 'price_block'
    | 'product_image'
    | 'product_description'
    | 'specs_table'
    | 'product_variants'
    | 'compatibility_table'
    | 'condition_details'
    | 'whats_in_the_box'
    | 'key_features_grid'
    | 'product_comparison'
    // Media
    | 'image'
    | 'banner'
    | 'gallery_row'
    | 'single_image'
    | 'video_placeholder'
    | 'logo_bar'
    | 'before_after'
    // eBay Specific
    | 'trust_badges'
    | 'shipping_info'
    | 'returns_policy'
    | 'seller_info'
    | 'cta_banner'
    | 'payment_methods'
    | 'dispatch_timer'
    | 'bundle_deal'
    | 'feedback_score'
    | 'vat_notice'
    | 'international_shipping'
    | 'authenticity_guarantee'
    // Conversion
    | 'policy_tabs'
    | 'nav_bar'
    | 'urgency_bar'
    | 'cross_sell'
    | 'button_block'
    | 'rectangle'
    | 'hero_header'
    | 'raw_html'
    | 'money_back'
    | 'free_shipping_banner'
    | 'why_buy_from_us'
    | 'satisfaction_guarantee'
    | 'limited_time_offer'
    // Header & Footer
    | 'store_header'
    | 'category_nav'
    | 'seasonal_banner'
    | 'store_footer'
    | 'social_links'
    | 'breadcrumb_bar'
    // Typography
    | 'page_title'
    | 'section_label'
    | 'pull_quote'
    | 'highlight_text'
    | 'price_tag'

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
    | PolicyTabsProps
    | NavBarProps
    | UrgencyBarProps
    | CrossSellProps
    | ButtonBlockProps
    | RectangleProps
    | HeroHeaderProps
    | RawHtmlProps

// ── Shared common props (present on every block) ────────────────────────────
export interface CommonProps {
    // Background
    bgColor: string
    bgGradient: boolean
    bgGradientFrom: string
    bgGradientTo: string
    bgGradientDir: number      // degrees

    // Spacing
    paddingTop: number
    paddingBottom: number
    paddingLeft: number
    paddingRight: number

    // Border
    showBorder: boolean
    borderColor: string
    borderWidth: number
    borderStyle: 'solid' | 'dashed' | 'dotted'
    borderRadius: number

    // Shadow (canvas only — email clients strip box-shadow)
    showShadow: boolean
    shadowColor: string
    shadowX: number
    shadowY: number
    shadowBlur: number
    shadowSpread: number

    // Typography override
    fontFamily: string
}

const DEFAULT_COMMON: CommonProps = {
    // Background
    bgColor: '#ffffff',
    bgGradient: false,
    bgGradientFrom: '#7530fb',
    bgGradientTo: '#1e1535',
    bgGradientDir: 135,

    // Spacing
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 24,
    paddingRight: 24,

    // Border
    showBorder: false,
    borderColor: '#ede9fe',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 0,

    // Shadow
    showShadow: false,
    shadowColor: 'rgba(0,0,0,0.10)',
    shadowX: 0,
    shadowY: 4,
    shadowBlur: 12,
    shadowSpread: 0,

    // Typography
    fontFamily: 'Arial, Helvetica, sans-serif',
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
    gap: number               // px gap between columns    leftBg: string                // left column background
    rightBg: string               // right column background
}

// ── Three Column ─────────────────────────────────────────────────────────────
export interface ThreeColumnProps extends CommonProps {
    col1Content: string
    col2Content: string
    col3Content: string
    gap: number
    col1Bg: string
    col2Bg: string
    col3Bg: string
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
    bulletStyle: 'disc' | 'check' | 'arrow' | 'star'
}

// ── Divider ───────────────────────────────────────────────────────────────────
export interface DividerProps extends CommonProps {
    color: string
    thickness: number         // px
    lineStyle: 'solid' | 'dashed' | 'dotted' | 'gradient'
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
    conditionColor: string    // condition text colour
    conditionFontSize: number // condition text size
}

// ── Price Block ───────────────────────────────────────────────────────────────
export interface PriceBlockProps extends CommonProps {
    priceText: string         // default: {{ITEM_PRICE}}
    priceColor: string
    priceFontSize: number
    priceFontWeight: string
    priceAlign: 'left' | 'center' | 'right'
    showOriginal: boolean
    originalText: string
    originalColor: string
    originalFontSize: number
    showBadge: boolean
    badgeText: string
    badgeBg: string
    badgeColor: string
    badgeFontSize: number
    badgeBorderRadius: number
    borderRadius: number
    variant: string           // price block layout variant
    // Urgency
    urgencyText: string
    urgencyColor: string
    urgencyBg: string
    // Range
    priceRangeMax: string
    // Auction
    bidCount: string
    timeLeft: string
    reserveMet: boolean
    // Bundle
    bundleTier1Qty: number
    bundleTier1Price: string
    bundleTier2Qty: number
    bundleTier2Price: string
    bundleTier3Qty: number
    bundleTier3Price: string
    // Finance
    monthlyPrice: string
    financeText: string
    // Trade
    tradePrice: string
    rrpText: string
    tradeCta: string
    // Shipping highlight
    deliveryText: string
    deliveryDate: string
    deliveryColor: string
    // Savings
    savingsText: string
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
    borderWidth: number       // border thickness in px (default 1)
    objectFit: 'contain' | 'cover' | 'fill'
    variant: string           // 'single' | 'split' | 'gallery' | 'fullwidth' | 'zoom'
    // Split variant
    imagePosition: 'left' | 'right'
    imageWidthPercent: number // 30–60
    verticalAlign: 'top' | 'middle' | 'bottom'
    descriptionText: string
    descriptionTitle: string
    descriptionColor: string
    descriptionFontSize: number
    // Gallery variant
    image2Url: string
    image3Url: string
    image4Url: string
    image5Url: string
    imageCount: number        // 2–5 thumbnails
    thumbHeight: number
    thumbBorderRadius: number
    showThumbBorder: boolean
    // Full width variant
    minHeight: number
    overlayText: string
    overlayColor: string
    // Zoom variant
    showZoomHint: boolean
    // Comparison variant
    label1: string
    label2: string
    // Before/After variant
    beforeLabel: string
    afterLabel: string
    accentColor: string
    // Lifestyle variant
    lifestyleSubtext: string
    nameFontSize: number
    // Polaroid variant
    polaroidCaption: string
}

// ── Product Description ───────────────────────────────────────────────────────
export interface ProductDescriptionProps extends CommonProps {
    text: string              // default: {{ITEM_DESCRIPTION}}
    color: string
    fontSize: number
    fontWeight: string        // body text weight (default '400')
    lineHeight: number
    showTitle: boolean
    titleText: string
    titleColor: string
    titleFontSize: number     // title font size (default 16)
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
    variant: string
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
    bgColor: string           // container background colour
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
    subTextColor: string      // alias for subColor for panel consistency
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
    objectFit: 'cover' | 'contain'   // image fit
    thumbHeight: number               // thumbnail height px
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
    align: 'left' | 'center' | 'right'  // badge row alignment
    subTextColor: string
    variant: string
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
    iconColor: string         // icon colour
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
// CONVERSION BLOCKS — NEW
// ─────────────────────────────────────────────────────────────────────────────

// ── Policy Tabs ───────────────────────────────────────────────────────────────
export interface PolicyTabsProps extends CommonProps {
    tabs: Array<{
        label: string
        content: string
    }>
    activeBg: string          // active tab background
    activeText: string        // active tab text colour
    inactiveBg: string
    inactiveText: string
    borderColor: string
    borderRadius: number
    fontSize: number
    contentBg: string
    variant: string
}

// ── Navigation Bar ────────────────────────────────────────────────────────────
export interface NavBarProps extends CommonProps {
    links: Array<{ label: string; url: string }>
    bgColor: string
    textColor: string
    hoverColor: string
    separator: string         // '|' or '•' or '·'
    align: 'left' | 'center' | 'right'
    fontSize: number
    fontWeight: string        // link font weight (default '700')
    letterSpacing: number     // px converted to em in toHtml (default 3 = 0.03em)
    borderRadius: number
    variant: string
}

// ── Urgency Bar ───────────────────────────────────────────────────────────────
export interface UrgencyBarProps extends CommonProps {
    text: string              // e.g. "Only {{QUANTITY}} Left — Order Soon!"
    bgColor: string
    textColor: string
    iconColor: string
    borderRadius: number
    showIcon: boolean
    pulse: boolean            // adds pulsing dot
    align: 'left' | 'center' | 'right'
    fontSize: number
}

// ── Cross-Sell Grid ───────────────────────────────────────────────────────────
export interface CrossSellProps extends CommonProps {
    title: string
    titleColor: string
    columns: 2 | 3 | 4
    items: Array<{
        imageUrl: string
        title: string
        price: string
        url: string
    }>
    cardBg: string
    cardBorder: string
    borderRadius: number
    showPrice: boolean
    gap: number
}

// ── Button Block ──────────────────────────────────────────────────────────────
export interface ButtonBlockProps extends CommonProps {
    label: string
    url: string
    variant: 'primary' | 'secondary' | 'outline' | 'dark' | 'accent'
    bgColor: string
    textColor: string
    borderColor: string
    borderRadius: number
    fontSize: number
    fontWeight: '600' | '700' | '800'
    align: 'left' | 'center' | 'right'
    fullWidth: boolean
    paddingV: number          // vertical padding inside button
    paddingH: number          // horizontal padding inside button
}

// ── Rectangle ─────────────────────────────────────────────────────────────────
export interface RectangleProps extends CommonProps {
    height: number            // px
    fillColor: string
    borderColor: string
    borderWidth: number
    borderRadius: number
    content: string           // optional HTML inside
    align: 'left' | 'center' | 'right'
}

// ── Hero Header ───────────────────────────────────────────────────────────────
export interface HeroHeaderProps extends CommonProps {
    storeName: string         // default: {{SELLER_NAME}}
    tagline: string
    bgColor: string
    bgGradient: boolean
    gradientFrom: string
    gradientTo: string
    textColor: string
    taglineColor: string
    logoUrl: string           // optional logo image
    showLogo: boolean
    height: number            // px min-height
    align: 'left' | 'center' | 'right'
    borderRadius: number
    nameFontSize: number      // store name font size (default 26)
    taglineFontSize: number   // tagline font size (default 13)
    nameFontWeight: string    // store name font weight (default 900)
    variant: string           // layout variant id
    categoryBadge: string     // category variant badge text
    saleBadgeText: string     // seasonal variant badge text
}

// ── Raw HTML ──────────────────────────────────────────────────────────────────
export interface RawHtmlProps extends CommonProps {
    code: string              // raw HTML — passed through sanitiseHtml on export
    label: string             // internal label shown on canvas card
}

// Variant system imports
import { getHeroVariant as _getHeroVariant } from './variants/hero_header.variants'
import { getProductImageVariant as _getProductImageVariant } from './variants/product_image.variants'
import { getPriceVariant as _getPriceVariant } from './variants/price_block.variants'
import { getTrustBadgesVariant as _getTBVariant } from './variants/trust_badges.variants'
import { getNavBarVariant as _getNavBarVariant } from './variants/nav_bar.variants'
import { getSpecsTableVariant as _getSpecsVariant } from './variants/specs_table.variants'
import { getPolicyTabsVariant as _getPolicyTabsVariant } from './variants/policy_tabs.variants'

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

// Universal block wrapper style — background + border (shadow omitted: email clients strip it)
function blockStyles(p: CommonProps): string {
    const bg = p.bgGradient
        ? `background:linear-gradient(${p.bgGradientDir ?? 135}deg,${p.bgGradientFrom ?? '#7530fb'},${p.bgGradientTo ?? '#1e1535'});`
        : `background-color:${p.bgColor};`
    const border = p.showBorder
        ? `border:${p.borderWidth ?? 1}px ${p.borderStyle ?? 'solid'} ${p.borderColor ?? '#ede9fe'};border-radius:${p.borderRadius ?? 0}px;`
        : ''
    return bg + border
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
            leftBg: '#ffffff',
            rightBg: '#ffffff',
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
            col1Bg: '#ffffff',
            col2Bg: '#ffffff',
            col3Bg: '#ffffff',
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
            bulletStyle: 'check',
        } as BulletListProps,
        toHtml(props, id) {
            const p = props as BulletListProps
            const bulletMap: Record<string, string> = {
                disc: '•',
                check: '&#10003;',
                arrow: '&#8594;',
                star: '&#9733;',
            }
            const bullet = bulletMap[p.bulletStyle] || '•'
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
            lineStyle: 'solid',
            widthPercent: 100,
        } as DividerProps,
        toHtml(props, id) {
            const p = props as DividerProps
            let hrStyle: string
            if (p.lineStyle === 'gradient') {
                hrStyle = `border:none;height:${p.thickness}px;background:linear-gradient(to right,#7530fb,#b8fa33);width:${p.widthPercent}%;margin:0 auto;display:block;`
            } else {
                hrStyle = `border:none;border-top:${p.thickness}px ${p.lineStyle} ${p.color};width:${p.widthPercent}%;margin:0 auto;display:block;`
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
            conditionColor: '#6b7280',
            conditionFontSize: 13,
        } as ProductTitleProps,
        toHtml(props, id) {
            const p = props as ProductTitleProps
            const conditionHtml = p.showCondition
                ? `<p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:${p.conditionFontSize ?? 13}px;color:${p.conditionColor ?? '#6b7280'};">Condition: <strong style="color:${p.conditionColor ?? '#6b7280'};">${p.conditionText}</strong></p>`
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
            priceFontWeight: '900',
            priceAlign: 'left',
            showOriginal: false,
            originalText: '{{ORIGINAL_PRICE}}',
            originalColor: '#9ca3af',
            originalFontSize: 16,
            showBadge: false,
            badgeText: 'SALE',
            badgeBg: '#b8fa33',
            badgeColor: '#1e1535',
            badgeFontSize: 11,
            badgeBorderRadius: 4,
            borderRadius: 10,
            variant: 'simple',
            urgencyText: 'Only {{QUANTITY}} left in stock',
            urgencyColor: '#991b1b',
            urgencyBg: '#fef2f2',
            priceRangeMax: '{{PRICE_MAX}}',
            bidCount: '{{BID_COUNT}}',
            timeLeft: '{{TIME_LEFT}}',
            reserveMet: true,
            bundleTier1Qty: 2,
            bundleTier1Price: '{{BUNDLE_PRICE_2}}',
            bundleTier2Qty: 3,
            bundleTier2Price: '{{BUNDLE_PRICE_3}}',
            bundleTier3Qty: 5,
            bundleTier3Price: '{{BUNDLE_PRICE_5}}',
            monthlyPrice: '{{MONTHLY_PRICE}}',
            financeText: '0% interest available — Subject to status',
            tradePrice: '{{TRADE_PRICE}}',
            rrpText: '{{RRP_PRICE}}',
            tradeCta: 'Contact us for bulk pricing',
            deliveryText: 'FREE UK Delivery',
            deliveryDate: '{{DELIVERY_DATE}}',
            deliveryColor: '#16a34a',
            savingsText: 'Save {{DISCOUNT_AMOUNT}}',
        } as PriceBlockProps,
        toHtml(props, id) {
            const p = props as PriceBlockProps
            return _getPriceVariant(p.variant ?? 'simple').toHtml(p, id)
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
            borderWidth: 1,
            objectFit: 'contain',
            variant: 'single',
            // Split
            imagePosition: 'left',
            imageWidthPercent: 45,
            verticalAlign: 'middle',
            descriptionText: '{{ITEM_DESCRIPTION}}',
            descriptionTitle: '{{PRODUCT_TITLE}}',
            descriptionColor: '#475569',
            descriptionFontSize: 13,
            // Gallery
            image2Url: '{{IMAGE_2_URL}}',
            image3Url: '{{IMAGE_3_URL}}',
            image4Url: '{{IMAGE_4_URL}}',
            image5Url: '{{IMAGE_5_URL}}',
            imageCount: 4,
            thumbHeight: 80,
            thumbBorderRadius: 6,
            showThumbBorder: true,
            // Fullwidth
            minHeight: 300,
            overlayText: '',
            overlayColor: 'rgba(0,0,0,0)',
            // Zoom
            showZoomHint: true,
            // Comparison
            label1: 'Front',
            label2: 'Back',
            beforeLabel: 'Before',
            afterLabel: 'After',
            accentColor: '#1d4ed8',
            lifestyleSubtext: '',
            nameFontSize: 20,
            polaroidCaption: '',
        } as ProductImageProps,
        toHtml(props, id) {
            const p = props as ProductImageProps
            return _getProductImageVariant(p.variant ?? 'single').toHtml(p, id)
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
            fontWeight: '400',
            titleFontSize: 16,
        } as ProductDescriptionProps,
        toHtml(props, id) {
            const p = props as ProductDescriptionProps
            const titleHtml = p.showTitle
                ? `<p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:${p.titleFontSize ?? 16}px;font-weight:700;color:${p.titleColor};border-left:4px solid #7530fb;padding-left:12px;">${p.titleText}</p>`
                : ''
            return wrapBlock('product_description', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}">
      ${titleHtml}
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:${p.fontSize}px;font-weight:${p.fontWeight ?? '400'};line-height:${p.lineHeight};color:${p.color};">
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
            variant: 'full',
        } as SpecsTableProps,
        toHtml(props, id) {
            const p = props as SpecsTableProps
            return _getSpecsVariant(p.variant ?? 'full').toHtml(p, id)
        }
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
            subTextColor: 'rgba(255,255,255,0.75)',
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
            objectFit: 'cover',
            thumbHeight: 80,
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
            align: 'center',
            subTextColor: '#6b7280',
            variant: 'row',
        } as TrustBadgesProps,
        toHtml(props, id) {
            const p = props as TrustBadgesProps
            return _getTBVariant(p.variant ?? 'row').toHtml(p, id)
        }
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

    // ── CONVERSION BLOCKS ────────────────────────────────────────────────────

    {
        type: 'policy_tabs',
        label: 'Policy Tabs',
        category: 'Conversion',
        icon: 'panel-top',
        description: 'Shipping / Returns / Payment / Warranty tabs',
        defaultProps: {
            ...DEFAULT_COMMON,
            bgColor: '#ffffff',
            paddingTop: 0,
            paddingBottom: 0,
            tabs: [
                { label: 'Shipping', content: 'Free UK delivery on all orders. Standard: 2–3 business days. Express: next day available. International shipping available via eBay Global Shipping Programme.' },
                { label: 'Returns', content: '30-day free returns. Item must be in original condition and packaging. Buyer pays return postage unless item is not as described.' },
                { label: 'Payment', content: 'We accept PayPal, credit/debit cards via eBay checkout. All payments are processed securely through eBay.' },
                { label: 'Warranty', content: '12-month manufacturer warranty on all items. Contact us within warranty period for any issues.' },
            ],
            activeBg: '#7530fb',
            activeText: '#ffffff',
            inactiveBg: '#f8f7ff',
            inactiveText: '#6b7280',
            borderColor: '#ede9fe',
            borderRadius: 8,
            fontSize: 13,
            contentBg: '#ffffff',
            variant: 'tabbed',
        } as PolicyTabsProps,
        toHtml(props, id) {
            const p = props as PolicyTabsProps
            return _getPolicyTabsVariant(p.variant ?? 'tabbed').toHtml(p, id)
        }
    },

    {
        type: 'nav_bar',
        label: 'Navigation Bar',
        category: 'Conversion',
        icon: 'navigation',
        description: 'Store category links row',
        defaultProps: {
            ...DEFAULT_COMMON,
            paddingTop: 12,
            paddingBottom: 12,
            bgColor: '#1e1535',
            links: [
                { label: 'All Items', url: '#' },
                { label: 'Electronics', url: '#' },
                { label: 'Clothing', url: '#' },
                { label: 'Home & Garden', url: '#' },
                { label: 'Contact Us', url: '#' },
            ],
            textColor: '#ffffff',
            hoverColor: '#b8fa33',
            separator: '•',
            align: 'center',
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 3,
            borderRadius: 0,
            variant: 'dark',
        } as NavBarProps,
        toHtml(props, id) {
            const p = props as NavBarProps
            return _getNavBarVariant(p.variant ?? 'dark').toHtml(p, id)
        }
    },

    {
        type: 'urgency_bar',
        label: 'Urgency Stock Bar',
        category: 'Conversion',
        icon: 'flame',
        description: 'Low stock / urgency callout banner',
        defaultProps: {
            ...DEFAULT_COMMON,
            paddingTop: 12,
            paddingBottom: 12,
            text: 'Only {{QUANTITY}} Left in Stock — Order Soon!',
            bgColor: '#fee2e2',
            textColor: '#991b1b',
            iconColor: '#ef4444',
            borderRadius: 8,
            showIcon: true,
            pulse: true,
            align: 'center',
            fontSize: 13,
        } as UrgencyBarProps,
        toHtml(props, id) {
            const p = props as UrgencyBarProps
            const dot = p.showIcon
                ? `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:${p.iconColor};margin-right:8px;vertical-align:middle;"></span>`
                : ''
            return wrapBlock('urgency_bar', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}border-radius:${p.borderRadius}px;text-align:${p.align};">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:${p.fontSize}px;font-weight:800;color:${p.textColor};letter-spacing:0.02em;">
        ${dot}${p.text}
      </p>
    </td>
  </tr>
</table>`
            )
        },
    },

    {
        type: 'cross_sell',
        label: 'Cross-Sell Grid',
        category: 'Conversion',
        icon: 'grid-2x2',
        description: '4-card related product recommendation grid',
        defaultProps: {
            ...DEFAULT_COMMON,
            bgColor: '#f8f7ff',
            paddingTop: 20,
            paddingBottom: 20,
            title: 'You May Also Like',
            titleColor: '#1e1535',
            columns: 4,
            items: [
                { imageUrl: '{{IMAGE_2_URL}}', title: '{{RELATED_TITLE_1}}', price: '{{RELATED_PRICE_1}}', url: '#' },
                { imageUrl: '{{IMAGE_3_URL}}', title: '{{RELATED_TITLE_2}}', price: '{{RELATED_PRICE_2}}', url: '#' },
                { imageUrl: '{{IMAGE_4_URL}}', title: '{{RELATED_TITLE_3}}', price: '{{RELATED_PRICE_3}}', url: '#' },
                { imageUrl: '{{IMAGE_5_URL}}', title: '{{RELATED_TITLE_4}}', price: '{{RELATED_PRICE_4}}', url: '#' },
            ],
            cardBg: '#ffffff',
            cardBorder: '#ede9fe',
            borderRadius: 8,
            showPrice: true,
            gap: 10,
        } as CrossSellProps,
        toHtml(props, id) {
            const p = props as CrossSellProps
            const colWidth = Math.floor(100 / p.columns)
            const cells = p.items.slice(0, p.columns).map(item =>
                `<td width="${colWidth}%" valign="top" style="padding:${p.gap / 2}px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${p.cardBg};border:1px solid ${p.cardBorder};border-radius:${p.borderRadius}px;overflow:hidden;">
            <tr><td style="padding:0;">
              <img src="${item.imageUrl}" alt="${item.title}" width="100%" style="width:100%;height:auto;display:block;border-radius:${p.borderRadius}px ${p.borderRadius}px 0 0;" />
            </td></tr>
            <tr><td style="padding:8px 10px;">
              <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#1e1535;line-height:1.4;">${item.title}</p>
              ${p.showPrice ? `<p style="margin:0;font-family:Arial,sans-serif;font-size:12px;font-weight:800;color:#7530fb;">${item.price}</p>` : ''}
            </td></tr>
          </table>
        </td>`
            ).join('')
            return wrapBlock('cross_sell', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}">
      <p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:16px;font-weight:700;color:${p.titleColor};border-left:4px solid #7530fb;padding-left:12px;">${p.title}</p>
      <table width="100%" cellpadding="0" cellspacing="${p.gap}" border="0">
        <tr>${cells}</tr>
      </table>
    </td>
  </tr>
</table>`
            )
        },
    },

    {
        type: 'button_block',
        label: 'Button',
        category: 'Conversion',
        icon: 'mouse-pointer-click',
        description: 'CTA button — Buy Now, Ask Question, Visit Store',
        defaultProps: {
            ...DEFAULT_COMMON,
            paddingTop: 16,
            paddingBottom: 16,
            label: 'Buy It Now',
            url: '#',
            variant: 'primary',
            bgColor: '#7530fb',
            textColor: '#ffffff',
            borderColor: '#7530fb',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: '700',
            align: 'center',
            fullWidth: false,
            paddingV: 14,
            paddingH: 40,
        } as ButtonBlockProps,
        toHtml(props, id) {
            const p = props as ButtonBlockProps
            const width = p.fullWidth ? 'width:100%;display:block;' : 'display:inline-block;'
            return wrapBlock('button_block', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}text-align:${p.align};">
      <a href="${p.url}"
        style="${width}padding:${p.paddingV}px ${p.paddingH}px;background-color:${p.bgColor};color:${p.textColor};font-family:Arial,sans-serif;font-size:${p.fontSize}px;font-weight:${p.fontWeight};text-decoration:none;border-radius:${p.borderRadius}px;border:2px solid ${p.borderColor};letter-spacing:0.03em;text-align:center;">
        ${p.label}
      </a>
    </td>
  </tr>
</table>`
            )
        },
    },

    {
        type: 'rectangle',
        label: 'Rectangle',
        category: 'Conversion',
        icon: 'square',
        description: 'Shape container for background fills and callouts',
        defaultProps: {
            ...DEFAULT_COMMON,
            paddingTop: 0,
            paddingBottom: 0,
            height: 60,
            fillColor: '#f3eeff',
            borderColor: '#ede9fe',
            borderWidth: 1,
            borderRadius: 8,
            content: '',
            align: 'center',
        } as RectangleProps,
        toHtml(props, id) {
            const p = props as RectangleProps
            return wrapBlock('rectangle', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.fillColor};height:${p.height}px;min-height:${p.height}px;border:${p.borderWidth}px solid ${p.borderColor};border-radius:${p.borderRadius}px;text-align:${p.align};vertical-align:middle;${pad(p)}">
      ${p.content || '&nbsp;'}
    </td>
  </tr>
</table>`
            )
        },
    },

    {
        type: 'hero_header',
        label: 'Hero Header',
        category: 'Conversion',
        icon: 'layout-panel-top',
        description: 'Store logo, name and tagline banner',
        defaultProps: {
            ...DEFAULT_COMMON,
            paddingTop: 28,
            paddingBottom: 28,
            storeName: '{{SELLER_NAME}}',
            tagline: 'Trusted eBay Seller · Fast Dispatch · Top Rated',
            bgColor: '#1e1535',
            bgGradient: true,
            gradientFrom: '#7530fb',
            gradientTo: '#1e1535',
            textColor: '#ffffff',
            taglineColor: 'rgba(255,255,255,0.7)',
            logoUrl: '',
            showLogo: false,
            height: 120,
            align: 'center',
            borderRadius: 0,
            nameFontSize: 26,
            taglineFontSize: 13,
            nameFontWeight: '900',
            variant: 'gradient',
            categoryBadge: 'Specialist Seller',
            saleBadgeText: 'SALE',
        } as HeroHeaderProps,
        toHtml(props, id) {
            const p = props as HeroHeaderProps
            // Delegate to variant system — import at top of file
            const variant = _getHeroVariant(p.variant ?? 'gradient')
            return variant.toHtml(p, id)
        },
    },

    {
        type: 'raw_html',
        label: 'Raw HTML',
        category: 'Conversion',
        icon: 'code-2',
        description: 'Paste custom HTML code directly',
        defaultProps: {
            ...DEFAULT_COMMON,
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            code: '<!-- Paste your custom HTML here -->',
            label: 'Custom HTML Block',
        } as RawHtmlProps,
        toHtml(props, id) {
            const p = props as RawHtmlProps
            return wrapBlock('raw_html', id, p.code)
        },
    },

]


    // ─────────────────────────────────────────────────────────────────────────────
    // EXTENDED BLOCK DEFINITIONS
    // ─────────────────────────────────────────────────────────────────────────────
    ; (BLOCK_DEFINITIONS as BlockDefinition[]).push(

        // ── LAYOUT (new) ─────────────────────────────────────────────────────────

        {
            type: 'four_column' as BlockType,
            label: 'Four Column',
            category: 'Layout' as BlockCategory,
            icon: 'columns',
            description: '4 equal columns for specs or features',
            defaultProps: { ...DEFAULT_COMMON } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('four_column' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr>
  <td width="25%" style="background-color:${p.bgColor};${pad(p)}vertical-align:top;"><p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#1f1d2e;">Column 1</p></td>
  <td width="25%" style="background-color:${p.bgColor};${pad(p)}vertical-align:top;"><p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#1f1d2e;">Column 2</p></td>
  <td width="25%" style="background-color:${p.bgColor};${pad(p)}vertical-align:top;"><p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#1f1d2e;">Column 3</p></td>
  <td width="25%" style="background-color:${p.bgColor};${pad(p)}vertical-align:top;"><p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#1f1d2e;">Column 4</p></td>
</tr></table>`)
            },
        },

        {
            type: 'spacer' as BlockType,
            label: 'Spacer',
            category: 'Layout' as BlockCategory,
            icon: 'minus',
            description: 'Vertical whitespace gap between sections',
            defaultProps: { ...DEFAULT_COMMON, paddingTop: 24, paddingBottom: 24 } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('spacer' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="height:${(p.paddingTop || 24) + (p.paddingBottom || 24)}px;background-color:${p.bgColor};font-size:1px;line-height:1px;">&nbsp;</td></tr></table>`)
            },
        },

        {
            type: 'border_box' as BlockType,
            label: 'Border Box',
            category: 'Layout' as BlockCategory,
            icon: 'square',
            description: 'Content inside a decorative border frame',
            defaultProps: { ...DEFAULT_COMMON, showBorder: true, borderWidth: 2, borderColor: '#7530fb', borderRadius: 8 } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('border_box' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}border:${p.borderWidth || 2}px solid ${p.borderColor || '#7530fb'};border-radius:${p.borderRadius || 8}px;"><p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#1f1d2e;">Your content goes here inside this decorative border box.</p></td></tr></table>`)
            },
        },

        {
            type: 'sidebar_layout' as BlockType,
            label: 'Sidebar Layout',
            category: 'Layout' as BlockCategory,
            icon: 'layout',
            description: '70/30 split — image left, text right',
            defaultProps: { ...DEFAULT_COMMON } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('sidebar_layout' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr>
  <td width="70%" style="background-color:${p.bgColor};${pad(p)}vertical-align:top;"><img src="{{MAIN_IMAGE_URL}}" alt="Product" style="width:100%;max-width:100%;height:auto;display:block;"></td>
  <td width="30%" style="background-color:${p.bgColor};${pad(p)}vertical-align:top;"><h3 style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:16px;color:#1e1535;">{{PRODUCT_TITLE}}</h3><p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#6b7280;">{{ITEM_DESCRIPTION}}</p></td>
</tr></table>`)
            },
        },

        // ── CONTENT (new) ────────────────────────────────────────────────────────

        {
            type: 'numbered_list' as BlockType,
            label: 'Numbered List',
            category: 'Content' as BlockCategory,
            icon: 'list',
            description: 'Step-by-step numbered instructions',
            defaultProps: { ...DEFAULT_COMMON } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                const items = ['Step one — first instruction', 'Step two — second instruction', 'Step three — third instruction']
                const rows = items.map((item, i) =>
                    `<tr><td width="28" valign="top" style="padding-right:10px;padding-bottom:10px;"><span style="background-color:#7530fb;color:#fff;border-radius:50%;width:22px;height:22px;display:inline-block;text-align:center;line-height:22px;font-size:12px;font-family:Arial,sans-serif;font-weight:700;">${i + 1}</span></td><td valign="top" style="padding-bottom:10px;font-family:Arial,sans-serif;font-size:14px;color:#1f1d2e;line-height:1.6;">${item}</td></tr>`
                ).join('')
                return wrapBlock('numbered_list' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}"><table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table></td></tr></table>`)
            },
        },

        {
            type: 'quote_block' as BlockType,
            label: 'Quote Block',
            category: 'Content' as BlockCategory,
            icon: 'quote',
            description: 'Highlighted customer testimonial or review',
            defaultProps: { ...DEFAULT_COMMON, bgColor: '#f3eeff' } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('quote_block' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:#f3eeff;${pad(p)}border-left:4px solid #7530fb;"><p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:22px;color:#7530fb;font-weight:700;">&ldquo;</p><p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:14px;color:#1f1d2e;line-height:1.7;font-style:italic;">Excellent product, exactly as described. Fast delivery and great packaging.</p><p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;font-weight:700;">— Verified Buyer &#9733;&#9733;&#9733;&#9733;&#9733;</p></td></tr></table>`)
            },
        },

        {
            type: 'warning_box' as BlockType,
            label: 'Warning Box',
            category: 'Content' as BlockCategory,
            icon: 'alert',
            description: 'Amber warning notice — read before buying',
            defaultProps: { ...DEFAULT_COMMON } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('warning_box' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:#fef9c3;${pad(p)}border:1px solid #fbbf24;border-radius:8px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="32" valign="top" style="padding-right:10px;font-size:18px;">&#9888;</td><td valign="top"><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#92400e;">Please Read Before Buying</p><p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#78350f;line-height:1.6;">Please check compatibility before purchasing. Returns only accepted if unused and in original packaging.</p></td></tr></table></td></tr></table>`)
            },
        },

        {
            type: 'info_box' as BlockType,
            label: 'Info Box',
            category: 'Content' as BlockCategory,
            icon: 'info',
            description: 'Blue informational notice with icon',
            defaultProps: { ...DEFAULT_COMMON } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('info_box' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:#eff6ff;${pad(p)}border:1px solid #bfdbfe;border-radius:8px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="32" valign="top" style="padding-right:10px;font-size:18px;">&#8505;</td><td valign="top"><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#1e40af;">Important Information</p><p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#1d4ed8;line-height:1.6;">This item ships from a UK warehouse. All items are genuine. VAT invoice available on request.</p></td></tr></table></td></tr></table>`)
            },
        },

        {
            type: 'data_table' as BlockType,
            label: 'Data Table',
            category: 'Content' as BlockCategory,
            icon: 'table',
            description: 'Two-column alternating row data table',
            defaultProps: { ...DEFAULT_COMMON } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                const rows = [['Brand', '{{BRAND}}'], ['Model', '{{MPN}}'], ['Condition', '{{ITEM_CONDITION}}'], ['Weight', '{{WEIGHT}}'], ['Country', '{{ORIGIN}}']]
                const rowHtml = rows.map((r, i) =>
                    `<tr style="background-color:${i % 2 === 0 ? '#f8f7ff' : '#fff'};"><td style="padding:8px 14px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#1e1535;border:1px solid #ede9fe;width:40%;">${r[0]}</td><td style="padding:8px 14px;font-family:Arial,sans-serif;font-size:13px;color:#6b7280;border:1px solid #ede9fe;">${r[1]}</td></tr>`
                ).join('')
                return wrapBlock('data_table' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}"><table width="100%" cellpadding="0" cellspacing="0" border="0">${rowHtml}</table></td></tr></table>`)
            },
        },

        {
            type: 'badge_row' as BlockType,
            label: 'Badge Row',
            category: 'Content' as BlockCategory,
            icon: 'tag',
            description: 'Inline badges — Genuine · New · UK Stock',
            defaultProps: { ...DEFAULT_COMMON } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                const badges = ['&#10003; Genuine', '&#128230; UK Stock', '&#9733; Top Rated', '&#128260; Easy Returns']
                const cells = badges.map(b => `<td style="padding:4px 6px;"><span style="display:inline-block;padding:4px 12px;background-color:#f3eeff;color:#7530fb;font-family:Arial,sans-serif;font-size:12px;font-weight:700;border-radius:100px;border:1px solid #ede9fe;">${b}</span></td>`).join('')
                return wrapBlock('badge_row' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}"><table cellpadding="0" cellspacing="4" border="0"><tr>${cells}</tr></table></td></tr></table>`)
            },
        },

        // ── PRODUCT (new) ─────────────────────────────────────────────────────────

        {
            type: 'product_variants' as BlockType,
            label: 'Product Variants',
            category: 'Product' as BlockCategory,
            icon: 'layers',
            description: 'Colour and size options display',
            defaultProps: { ...DEFAULT_COMMON } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                const colours = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#000', '#fff']
                const swatches = colours.map(c => `<td style="padding:3px;"><span style="display:inline-block;width:24px;height:24px;background-color:${c};border-radius:50%;border:2px solid #e5e7eb;"></span></td>`).join('')
                const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
                const sizeCells = sizes.map(s => `<td style="padding:3px;"><span style="display:inline-block;padding:4px 10px;border:1px solid #ede9fe;border-radius:4px;font-family:Arial,sans-serif;font-size:12px;color:#1f1d2e;">${s}</span></td>`).join('')
                return wrapBlock('product_variants' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}"><p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#1e1535;">Colours:</p><table cellpadding="0" cellspacing="0" border="0"><tr>${swatches}</tr></table><p style="margin:12px 0 8px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#1e1535;">Sizes:</p><table cellpadding="0" cellspacing="0" border="0"><tr>${sizeCells}</tr></table></td></tr></table>`)
            },
        },

        {
            type: 'compatibility_table' as BlockType,
            label: 'Compatibility Table',
            category: 'Product' as BlockCategory,
            icon: 'check',
            description: 'Compatible models list',
            defaultProps: { ...DEFAULT_COMMON } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                const models = ['Model A 2019-2023', 'Model B 2020-2024', 'Model C Pro All years', 'Model D Mini 2021+']
                const rows = models.map((m, i) => `<tr style="background-color:${i % 2 === 0 ? '#f0fdf4' : '#fff'};"><td style="padding:8px 14px;font-family:Arial,sans-serif;font-size:13px;color:#166534;border:1px solid #bbf7d0;">&#10003;</td><td style="padding:8px 14px;font-family:Arial,sans-serif;font-size:13px;color:#1f1d2e;border:1px solid #bbf7d0;">${m}</td></tr>`).join('')
                return wrapBlock('compatibility_table' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}"><p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#1e1535;">&#9989; Compatible With:</p><table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table></td></tr></table>`)
            },
        },

        {
            type: 'condition_details' as BlockType,
            label: 'Condition Details',
            category: 'Product' as BlockCategory,
            icon: 'star',
            description: 'Graded condition explanation block',
            defaultProps: { ...DEFAULT_COMMON } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('condition_details' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}"><p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#1e1535;">Condition: <span style="color:#7530fb;">{{ITEM_CONDITION}}</span></p><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="30%" style="padding:8px;background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;text-align:center;"><p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#166534;">COSMETIC GRADE</p><p style="margin:4px 0 0;font-size:20px;">&#9733;&#9733;&#9733;&#9733;&#9733;</p></td><td width="4%"></td><td width="66%" style="padding:12px;background-color:#f8f7ff;border:1px solid #ede9fe;border-radius:6px;vertical-align:top;"><p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#1f1d2e;line-height:1.7;">{{CONDITION_NOTES}}</p></td></tr></table></td></tr></table>`)
            },
        },

        {
            type: 'whats_in_the_box' as BlockType,
            label: "What's In The Box",
            category: 'Product' as BlockCategory,
            icon: 'package',
            description: 'Checklist of included items',
            defaultProps: { ...DEFAULT_COMMON } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                const items = ['1x Main Unit', '1x Power Cable', '1x User Manual', '1x Warranty Card', '2x AAA Batteries']
                const rows = items.map(item => `<tr><td width="24" valign="top" style="padding-right:8px;padding-bottom:6px;font-size:14px;color:#16a34a;">&#9632;</td><td valign="top" style="padding-bottom:6px;font-family:Arial,sans-serif;font-size:13px;color:#1f1d2e;line-height:1.5;">${item}</td></tr>`).join('')
                return wrapBlock('whats_in_the_box' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}"><p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#1e1535;">&#128230; What's In The Box</p><table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table></td></tr></table>`)
            },
        },

        {
            type: 'key_features_grid' as BlockType,
            label: 'Key Features Grid',
            category: 'Product' as BlockCategory,
            icon: 'grid',
            description: '3-column feature highlights with icons',
            defaultProps: { ...DEFAULT_COMMON } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                const features = [
                    { icon: '&#9889;', title: 'High Performance', text: 'Engineered for maximum efficiency' },
                    { icon: '&#128272;', title: 'Secure & Reliable', text: 'Built to last with premium materials' },
                    { icon: '&#127775;', title: 'Premium Quality', text: 'Rigorously tested before dispatch' },
                ]
                const cells = features.map(f => `<td width="33%" style="padding:12px;text-align:center;vertical-align:top;"><p style="margin:0 0 6px;font-size:24px;">${f.icon}</p><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#1e1535;">${f.title}</p><p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;">${f.text}</p></td>`).join('')
                return wrapBlock('key_features_grid' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table></td></tr></table>`)
            },
        },

        {
            type: 'product_comparison' as BlockType,
            label: 'Product Comparison',
            category: 'Product' as BlockCategory,
            icon: 'table',
            description: 'This vs competitors comparison table',
            defaultProps: { ...DEFAULT_COMMON } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                const rows = [['Feature', 'Our Product', 'Competitor'], ['Quality', '&#9733;&#9733;&#9733;&#9733;&#9733;', '&#9733;&#9733;&#9733;'], ['Warranty', '2 Years', '6 Months'], ['UK Stock', '&#10003; Yes', '&#10007; No'], ['Returns', '30 Days', '14 Days']]
                const rowHtml = rows.map((r, i) => `<tr style="background-color:${i === 0 ? '#7530fb' : i % 2 === 0 ? '#f8f7ff' : '#fff'};"><td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;font-weight:${i === 0 ? '700' : '400'};color:${i === 0 ? '#fff' : '#1f1d2e'};border:1px solid ${i === 0 ? '#7530fb' : '#ede9fe'};">${r[0]}</td><td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;font-weight:${i === 0 ? '700' : '600'};color:${i === 0 ? '#fff' : '#7530fb'};border:1px solid ${i === 0 ? '#7530fb' : '#ede9fe'};text-align:center;">${r[1]}</td><td style="padding:10px 14px;font-family:Arial,sans-serif;font-size:13px;color:${i === 0 ? '#fff' : '#9ca3af'};border:1px solid ${i === 0 ? '#7530fb' : '#ede9fe'};text-align:center;">${r[2]}</td></tr>`).join('')
                return wrapBlock('product_comparison' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}"><table width="100%" cellpadding="0" cellspacing="0" border="0">${rowHtml}</table></td></tr></table>`)
            },
        },

        // ── MEDIA (new) ──────────────────────────────────────────────────────────

        {
            type: 'single_image' as BlockType,
            label: 'Single Image',
            category: 'Media' as BlockCategory,
            icon: 'image',
            description: 'Centred image with optional caption',
            defaultProps: { ...DEFAULT_COMMON } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('single_image' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}text-align:center;"><img src="{{MAIN_IMAGE_URL}}" alt="{{PRODUCT_TITLE}}" style="max-width:100%;height:auto;display:inline-block;border-radius:8px;"><p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#9ca3af;font-style:italic;">{{PRODUCT_TITLE}}</p></td></tr></table>`)
            },
        },

        {
            type: 'video_placeholder' as BlockType,
            label: 'Video Placeholder',
            category: 'Media' as BlockCategory,
            icon: 'play',
            description: 'YouTube thumbnail with play button overlay',
            defaultProps: { ...DEFAULT_COMMON } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('video_placeholder' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}text-align:center;"><div style="display:inline-block;width:100%;max-width:560px;background-color:#000;border-radius:8px;position:relative;"><img src="{{VIDEO_THUMBNAIL_URL}}" alt="Product Video" style="width:100%;height:auto;display:block;opacity:0.8;border-radius:8px;"></div><p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;">&#9654; Watch the product video</p></td></tr></table>`)
            },
        },

        {
            type: 'logo_bar' as BlockType,
            label: 'Logo Bar',
            category: 'Media' as BlockCategory,
            icon: 'image',
            description: 'Brand and certification logos row',
            defaultProps: { ...DEFAULT_COMMON, bgColor: '#f8f7ff' } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                const logos = ['&#127968;', '&#9989;', '&#127881;', '&#127942;', '&#128081;']
                const cells = logos.map(l => `<td style="padding:8px 16px;text-align:center;font-size:28px;">${l}</td>`).join('')
                return wrapBlock('logo_bar' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}text-align:center;"><p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;">Trusted Brands &amp; Certifications</p><table align="center" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table></td></tr></table>`)
            },
        },

        {
            type: 'before_after' as BlockType,
            label: 'Before / After',
            category: 'Media' as BlockCategory,
            icon: 'columns',
            description: 'Two images side by side comparison',
            defaultProps: { ...DEFAULT_COMMON } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('before_after' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="48%" style="text-align:center;vertical-align:top;"><div style="background-color:#f3f4f6;border-radius:8px;padding:8px;"><p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Before</p><img src="{{IMAGE_BEFORE}}" alt="Before" style="width:100%;height:auto;display:block;border-radius:4px;"></div></td><td width="4%" style="text-align:center;font-size:20px;color:#9ca3af;">&#8594;</td><td width="48%" style="text-align:center;vertical-align:top;"><div style="background-color:#f0fdf4;border-radius:8px;padding:8px;border:1px solid #bbf7d0;"><p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">After</p><img src="{{IMAGE_AFTER}}" alt="After" style="width:100%;height:auto;display:block;border-radius:4px;"></div></td></tr></table></td></tr></table>`)
            },
        },

        // ── EBAY SPECIFIC (new) ──────────────────────────────────────────────────

        {
            type: 'payment_methods' as BlockType,
            label: 'Payment Methods',
            category: 'eBay Specific' as BlockCategory,
            icon: 'credit-card',
            description: 'PayPal, Visa, Mastercard accepted icons',
            defaultProps: { ...DEFAULT_COMMON, bgColor: '#f8f7ff' } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                const methods = ['PayPal', 'Visa', 'Mastercard', 'Amex', 'Apple Pay']
                const cells = methods.map(m => `<td style="padding:4px 6px;"><span style="display:inline-block;padding:5px 12px;background:#fff;border:1px solid #e5e7eb;border-radius:4px;font-family:Arial,sans-serif;font-size:12px;color:#1f1d2e;font-weight:600;">&#128179; ${m}</span></td>`).join('')
                return wrapBlock('payment_methods' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}text-align:center;"><p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Secure Payment Methods</p><table align="center" cellpadding="0" cellspacing="4" border="0"><tr>${cells}</tr></table></td></tr></table>`)
            },
        },

        {
            type: 'dispatch_timer' as BlockType,
            label: 'Dispatch Timer',
            category: 'eBay Specific' as BlockCategory,
            icon: 'clock',
            description: 'Order today for same day dispatch notice',
            defaultProps: { ...DEFAULT_COMMON, bgColor: '#f0fdf4' } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('dispatch_timer' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:#f0fdf4;${pad(p)}border:1px solid #bbf7d0;border-radius:8px;text-align:center;"><p style="margin:0 0 4px;font-size:24px;">&#9201;</p><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#166534;">Order in the next <span style="color:#dc2626;">{{HOURS_LEFT}} hours</span> for Same Day Dispatch</p><p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#16a34a;">&#128230; Dispatched same working day if ordered by 2pm</p></td></tr></table>`)
            },
        },

        {
            type: 'bundle_deal' as BlockType,
            label: 'Bundle Deal',
            category: 'eBay Specific' as BlockCategory,
            icon: 'gift',
            description: 'Buy more save more offer block',
            defaultProps: { ...DEFAULT_COMMON, bgColor: '#1e1535' } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                const deals = [{ qty: 'Buy 1', price: '{{ITEM_PRICE}}', save: '' }, { qty: 'Buy 2', price: '{{PRICE_2}}', save: 'Save 10%' }, { qty: 'Buy 3+', price: '{{PRICE_3}}', save: 'Save 20%' }]
                const cells = deals.map((d, i) => `<td width="33%" style="padding:12px;text-align:center;"><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:${i === 0 ? '#9ca3af' : '#b8fa33'};text-transform:uppercase;">${d.qty}</p><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:20px;font-weight:700;color:#fff;">${d.price}</p>${d.save ? `<span style="background-color:#b8fa33;color:#1e1535;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:2px 8px;border-radius:100px;">${d.save}</span>` : '<span style="font-family:Arial,sans-serif;font-size:11px;color:#6b7280;">each</span>'}</td>`).join('<td style="width:1px;background-color:#3d3858;"></td>')
                return wrapBlock('bundle_deal' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:#1e1535;${pad(p)}border-radius:8px;"><p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#fff;text-align:center;">&#127873; Bundle &amp; Save</p><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table></td></tr></table>`)
            },
        },

        {
            type: 'feedback_score' as BlockType,
            label: 'Feedback Score',
            category: 'eBay Specific' as BlockCategory,
            icon: 'star',
            description: 'Seller rating display with stars',
            defaultProps: { ...DEFAULT_COMMON, bgColor: '#f8f7ff' } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('feedback_score' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="60%" style="vertical-align:middle;padding-right:20px;"><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#1e1535;">&#11088; {{SELLER_FEEDBACK}}% Positive Feedback</p><p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#6b7280;">Top Rated eBay Seller</p><p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:20px;color:#f59e0b;">&#9733;&#9733;&#9733;&#9733;&#9733;</p></td><td width="40%" style="text-align:center;vertical-align:middle;"><div style="background-color:#7530fb;color:#fff;border-radius:8px;padding:12px;"><p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Seller Since</p><p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:18px;font-weight:700;">{{MEMBER_SINCE}}</p></div></td></tr></table></td></tr></table>`)
            },
        },

        {
            type: 'vat_notice' as BlockType,
            label: 'VAT Notice',
            category: 'eBay Specific' as BlockCategory,
            icon: 'file',
            description: 'VAT registered seller invoice notice',
            defaultProps: { ...DEFAULT_COMMON, bgColor: '#f8fafc' } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('vat_notice' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:#f8fafc;${pad(p)}border:1px solid #e2e8f0;border-radius:6px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="32" valign="top" style="padding-right:10px;font-size:16px;">&#128196;</td><td valign="top"><p style="margin:0 0 2px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#1e1535;">VAT Registered Business</p><p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;">VAT No: {{VAT_NUMBER}} &middot; Full VAT invoice included with your order.</p></td></tr></table></td></tr></table>`)
            },
        },

        {
            type: 'international_shipping' as BlockType,
            label: 'International Shipping',
            category: 'eBay Specific' as BlockCategory,
            icon: 'globe',
            description: 'Customs and import duty warning notice',
            defaultProps: { ...DEFAULT_COMMON, bgColor: '#fff7ed' } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('international_shipping' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:#fff7ed;${pad(p)}border:1px solid #fed7aa;border-radius:8px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="32" valign="top" style="padding-right:10px;font-size:18px;">&#127760;</td><td valign="top"><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#c2410c;">International Buyers — Import Duties Notice</p><p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#9a3412;line-height:1.6;">Import duties and taxes are not included in the price. These are the buyer's responsibility. Please check your country's customs rules before purchasing.</p></td></tr></table></td></tr></table>`)
            },
        },

        {
            type: 'authenticity_guarantee' as BlockType,
            label: 'Authenticity Guarantee',
            category: 'eBay Specific' as BlockCategory,
            icon: 'shield',
            description: 'Genuine product certificate style block',
            defaultProps: { ...DEFAULT_COMMON, bgColor: '#1e1535' } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('authenticity_guarantee' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:#1e1535;${pad(p)}border-radius:8px;text-align:center;"><p style="margin:0 0 4px;font-size:32px;">&#128737;</p><p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:16px;font-weight:700;color:#b8fa33;">100% Authenticity Guaranteed</p><p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.7);">Every item verified genuine. Sourced directly from authorised distributors.</p><table align="center" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 12px;font-family:Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.5);">&#10003; Official Supplier</td><td style="padding:0 12px;font-family:Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.5);">&#10003; Anti-counterfeit Checked</td><td style="padding:0 12px;font-family:Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.5);">&#10003; Money Back</td></tr></table></td></tr></table>`)
            },
        },

        // ── CONVERSION (new) ─────────────────────────────────────────────────────

        {
            type: 'money_back' as BlockType,
            label: 'Money Back Guarantee',
            category: 'Conversion' as BlockCategory,
            icon: 'shield',
            description: '30-day money back guarantee badge block',
            defaultProps: { ...DEFAULT_COMMON, bgColor: '#f0fdf4' } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('money_back' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:#f0fdf4;${pad(p)}border:1px solid #bbf7d0;border-radius:8px;text-align:center;"><p style="margin:0 0 4px;font-size:28px;">&#128260;</p><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#166534;">30-Day Money Back Guarantee</p><p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#16a34a;">Not satisfied? Return it for a full refund. No questions asked.</p></td></tr></table>`)
            },
        },

        {
            type: 'free_shipping_banner' as BlockType,
            label: 'Free Shipping Banner',
            category: 'Conversion' as BlockCategory,
            icon: 'truck',
            description: 'Green free shipping callout banner',
            defaultProps: { ...DEFAULT_COMMON, bgColor: '#16a34a' } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('free_shipping_banner' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:#16a34a;${pad(p)}text-align:center;"><p style="margin:0;font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#fff;">&#128230; FREE Shipping &mdash; Dispatched Within 24 Hours &#9989;</p></td></tr></table>`)
            },
        },

        {
            type: 'why_buy_from_us' as BlockType,
            label: 'Why Buy From Us',
            category: 'Conversion' as BlockCategory,
            icon: 'star',
            description: '3-column trust icons block',
            defaultProps: { ...DEFAULT_COMMON } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                const points = [{ icon: '&#9989;', title: '100% Authentic', text: 'All items genuine & verified' }, { icon: '&#128230;', title: 'Fast Dispatch', text: 'Same day if ordered by 2pm' }, { icon: '&#128260;', title: 'Easy Returns', text: '30-day hassle-free returns' }]
                const cells = points.map(pt => `<td width="33%" style="padding:16px 12px;text-align:center;vertical-align:top;"><p style="margin:0 0 6px;font-size:28px;">${pt.icon}</p><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#1e1535;">${pt.title}</p><p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;">${pt.text}</p></td>`).join('')
                return wrapBlock('why_buy_from_us' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}"><p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#1e1535;text-align:center;">Why Shop With Us?</p><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table></td></tr></table>`)
            },
        },

        {
            type: 'satisfaction_guarantee' as BlockType,
            label: 'Satisfaction Guarantee',
            category: 'Conversion' as BlockCategory,
            icon: 'star',
            description: 'Star rating and satisfaction guarantee block',
            defaultProps: { ...DEFAULT_COMMON, bgColor: '#f8f7ff' } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('satisfaction_guarantee' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}border:1px solid #ede9fe;border-radius:8px;text-align:center;"><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:22px;color:#f59e0b;">&#9733;&#9733;&#9733;&#9733;&#9733;</p><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#7530fb;">100% Satisfaction Guaranteed</p><p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#6b7280;">Trusted by thousands of eBay buyers. Your satisfaction is our priority.</p></td></tr></table>`)
            },
        },

        {
            type: 'limited_time_offer' as BlockType,
            label: 'Limited Time Offer',
            category: 'Conversion' as BlockCategory,
            icon: 'clock',
            description: 'Countdown-style limited offer banner',
            defaultProps: { ...DEFAULT_COMMON, bgColor: '#dc2626' } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('limited_time_offer' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:#dc2626;${pad(p)}text-align:center;"><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:2px;">&#9200; Limited Time Offer</p><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:22px;font-weight:700;color:#fff;">{{DISCOUNT_PERCENT}}% OFF Today Only</p><p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.8);">Was <s>{{ORIGINAL_PRICE}}</s> &mdash; Now <strong>{{ITEM_PRICE}}</strong></p></td></tr></table>`)
            },
        },

        // ── HEADER & FOOTER ──────────────────────────────────────────────────────

        {
            type: 'store_header' as BlockType,
            label: 'Store Header',
            category: 'Header & Footer' as BlockCategory,
            icon: 'store',
            description: 'Logo, store name and tagline banner',
            defaultProps: { ...DEFAULT_COMMON, bgColor: '#7530fb' } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('store_header' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background:linear-gradient(135deg,#7530fb 0%,#1e1535 100%);${pad(p)}text-align:center;"><h1 style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:700;color:#ffffff;">{{SELLER_NAME}}</h1><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:rgba(255,255,255,0.7);">Quality products &middot; Fast dispatch &middot; Trusted eBay seller</p></td></tr></table>`)
            },
        },

        {
            type: 'category_nav' as BlockType,
            label: 'Category Navigation',
            category: 'Header & Footer' as BlockCategory,
            icon: 'menu',
            description: 'Horizontal store category link bar',
            defaultProps: { ...DEFAULT_COMMON, bgColor: '#1e1535', paddingTop: 10, paddingBottom: 10 } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                const cats = ['Electronics', 'Clothing', 'Home & Garden', 'Collectibles', 'Auto Parts']
                const links = cats.map(c => `<td style="padding:0 12px;"><a href="#" style="font-family:Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.8);text-decoration:none;font-weight:600;">${c}</a></td>`).join('')
                return wrapBlock('category_nav' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:#1e1535;${pad(p)}"><table align="center" cellpadding="0" cellspacing="0" border="0"><tr>${links}</tr></table></td></tr></table>`)
            },
        },

        {
            type: 'seasonal_banner' as BlockType,
            label: 'Seasonal Banner',
            category: 'Header & Footer' as BlockCategory,
            icon: 'star',
            description: 'Seasonal sale themed header banner',
            defaultProps: { ...DEFAULT_COMMON, bgColor: '#dc2626' } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('seasonal_banner' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background:linear-gradient(135deg,#dc2626 0%,#7f1d1d 100%);${pad(p)}text-align:center;"><p style="margin:0 0 4px;font-size:28px;">&#127873; &#127876; &#127873;</p><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:20px;font-weight:700;color:#fff;">Seasonal Sale &mdash; Up To 50% Off!</p><p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.8);">Limited time only &middot; While stocks last</p></td></tr></table>`)
            },
        },

        {
            type: 'store_footer' as BlockType,
            label: 'Store Footer',
            category: 'Header & Footer' as BlockCategory,
            icon: 'layout',
            description: 'Footer with links and copyright',
            defaultProps: { ...DEFAULT_COMMON, bgColor: '#1e1535' } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                const links = ['All Listings', 'Contact Us', 'Returns Policy', 'Feedback']
                const cells = links.map(l => `<td style="padding:0 12px;"><a href="#" style="font-family:Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.6);text-decoration:none;">${l}</a></td>`).join('')
                return wrapBlock('store_footer' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:#1e1535;${pad(p)}text-align:center;"><table align="center" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table><p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.3);">&copy; {{SELLER_NAME}} &middot; All rights reserved</p></td></tr></table>`)
            },
        },

        {
            type: 'social_links' as BlockType,
            label: 'Social Links Bar',
            category: 'Header & Footer' as BlockCategory,
            icon: 'share',
            description: 'Social media icon links row',
            defaultProps: { ...DEFAULT_COMMON, bgColor: '#f8f7ff' } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                const socials = [{ icon: '&#128248;', label: 'Instagram', color: '#e1306c' }, { icon: '&#128444;', label: 'Facebook', color: '#1877f2' }, { icon: '&#128140;', label: 'Twitter', color: '#1da1f2' }, { icon: '&#127910;', label: 'YouTube', color: '#ff0000' }]
                const cells = socials.map(s => `<td style="padding:0 10px;text-align:center;"><p style="margin:0 0 2px;font-size:20px;">${s.icon}</p><p style="margin:0;font-family:Arial,sans-serif;font-size:10px;color:${s.color};font-weight:700;">${s.label}</p></td>`).join('')
                return wrapBlock('social_links' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}text-align:center;"><p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;">Follow us for deals &amp; updates</p><table align="center" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table></td></tr></table>`)
            },
        },

        {
            type: 'breadcrumb_bar' as BlockType,
            label: 'Breadcrumb Bar',
            category: 'Header & Footer' as BlockCategory,
            icon: 'chevron-right',
            description: 'Home > Category > Item navigation bar',
            defaultProps: { ...DEFAULT_COMMON, bgColor: '#f8f7ff', paddingTop: 10, paddingBottom: 10 } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('breadcrumb_bar' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}"><p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#9ca3af;"><a href="#" style="color:#7530fb;text-decoration:none;">{{SELLER_NAME}}</a> &rsaquo; <a href="#" style="color:#7530fb;text-decoration:none;">{{ITEM_CATEGORY}}</a> &rsaquo; <span style="color:#1f1d2e;font-weight:600;">{{PRODUCT_TITLE}}</span></p></td></tr></table>`)
            },
        },

        // ── TYPOGRAPHY ────────────────────────────────────────────────────────────

        {
            type: 'page_title' as BlockType,
            label: 'Page Title',
            category: 'Typography' as BlockCategory,
            icon: 'type',
            description: 'Large H1 with decorative underline',
            defaultProps: { ...DEFAULT_COMMON } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('page_title' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}"><h1 style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:700;color:#1e1535;line-height:1.2;">{{PRODUCT_TITLE}}</h1><div style="width:60px;height:4px;background-color:#7530fb;border-radius:2px;"></div></td></tr></table>`)
            },
        },

        {
            type: 'section_label' as BlockType,
            label: 'Section Label',
            category: 'Typography' as BlockCategory,
            icon: 'type',
            description: 'Small uppercase category label with accent',
            defaultProps: { ...DEFAULT_COMMON, paddingTop: 8, paddingBottom: 4 } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('section_label' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}"><p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#7530fb;text-transform:uppercase;letter-spacing:3px;">{{SECTION_LABEL}}</p></td></tr></table>`)
            },
        },

        {
            type: 'pull_quote' as BlockType,
            label: 'Pull Quote',
            category: 'Typography' as BlockCategory,
            icon: 'quote',
            description: 'Large styled quote with accent colour',
            defaultProps: { ...DEFAULT_COMMON } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('pull_quote' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}text-align:center;"><p style="margin:0 0 8px;font-family:Georgia,serif;font-size:36px;color:#ede9fe;line-height:1;">&ldquo;</p><p style="margin:0;font-family:Georgia,serif;font-size:18px;color:#1e1535;line-height:1.6;font-style:italic;">Quality is not an act, it is a habit. Every item we sell reflects our commitment to excellence.</p><p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#7530fb;font-weight:700;">— {{SELLER_NAME}}</p></td></tr></table>`)
            },
        },

        {
            type: 'highlight_text' as BlockType,
            label: 'Highlight Text',
            category: 'Typography' as BlockCategory,
            icon: 'type',
            description: 'Coloured background text callout',
            defaultProps: { ...DEFAULT_COMMON, bgColor: '#b8fa33' } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('highlight_text' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:#b8fa33;${pad(p)}text-align:center;border-radius:4px;"><p style="margin:0;font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#1e1535;">&#9889; {{HIGHLIGHT_TEXT}}</p></td></tr></table>`)
            },
        },

        {
            type: 'price_tag' as BlockType,
            label: 'Price Tag',
            category: 'Typography' as BlockCategory,
            icon: 'tag',
            description: 'Decorative was/now price display',
            defaultProps: { ...DEFAULT_COMMON } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps
                return wrapBlock('price_tag' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="vertical-align:bottom;padding-right:12px;"><p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#9ca3af;text-decoration:line-through;">Was {{ORIGINAL_PRICE}}</p></td><td style="vertical-align:bottom;"><p style="margin:0;font-family:Arial,sans-serif;font-size:32px;font-weight:700;color:#7530fb;">{{ITEM_PRICE}}</p></td><td style="vertical-align:bottom;padding-left:10px;"><span style="display:inline-block;background-color:#dc2626;color:#fff;font-family:Arial,sans-serif;font-size:12px;font-weight:700;padding:4px 10px;border-radius:4px;">SAVE {{DISCOUNT_PERCENT}}%</span></td></tr></table></td></tr></table>`)
            },
        },

    )


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
    'Conversion',
    'Header & Footer',
    'Typography',
]

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK FACTORY
// Creates a fresh Block instance from a definition
// ─────────────────────────────────────────────────────────────────────────────
export function createBlock(type: BlockType, settings?: Partial<CanvasSettings>): Block {
    const def = getDefinition(type)
    if (!def) throw new Error(`Unknown block type: ${type}`)
    // Apply global tokens to new block defaults when settings are provided
    const tokenOverrides: Partial<CommonProps> = settings ? {
        borderRadius: settings.borderRadiusBase ?? 0,
        paddingTop: settings.spacingBase ?? 16,
        paddingBottom: settings.spacingBase ?? 16,
        fontFamily: settings.fontStack ?? 'Arial, Helvetica, sans-serif',
    } : {}
    return {
        id: generateId(),
        type,
        props: { ...def.defaultProps, ...tokenOverrides },
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS SETTINGS
// Global settings passed to assembleDocument to control the document shell
// ─────────────────────────────────────────────────────────────────────────────
export interface CanvasSettings {
    maxWidth: number             // px — canvas content max-width (600–800)
    bgColor: string              // outer body background
    canvasBg: string             // inner table/canvas background
    fontStack: string            // CSS font-family value
    textColor: string            // global body text colour
    linkColor: string            // global <a> colour
    align: 'center' | 'left'    // canvas alignment inside body

    // ── Global Design Tokens (Phase 2) ───────────────────────────────────────
    primaryColor: string         // brand primary — buttons, accents, links
    accentColor: string          // brand accent — badges, highlights
    headingColor: string         // h1/h2/h3 colour across all blocks
    headingFont: string          // heading font stack
    borderRadiusBase: number     // global default border radius (px)
    spacingBase: number          // global base spacing multiplier (px)
    mobileFontScale: number      // % scale for mobile font sizes (default 90)
    mobilePaddingScale: number   // % scale for mobile padding (default 80)
}

export const DEFAULT_CANVAS_SETTINGS: CanvasSettings = {
    maxWidth: 700,
    bgColor: '#f8f8f8',
    canvasBg: '#ffffff',
    fontStack: 'Arial, Helvetica, sans-serif',
    textColor: '#1f1d2e',
    linkColor: '#7530fb',
    align: 'center',

    // Global tokens
    primaryColor: '#7530fb',
    accentColor: '#b8fa33',
    headingColor: '#1e1535',
    headingFont: 'Arial, Helvetica, sans-serif',
    borderRadiusBase: 8,
    spacingBase: 16,
    mobileFontScale: 90,
    mobilePaddingScale: 80,
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL DOCUMENT ASSEMBLER
// Wraps all block HTML in a valid eBay-safe document shell
// ─────────────────────────────────────────────────────────────────────────────
export function assembleDocument(blocks: Block[], settings: CanvasSettings = DEFAULT_CANVAS_SETTINGS): string {
    if (blocks.length === 0) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: ${settings.fontStack}; background: ${settings.bgColor}; color: ${settings.textColor}; }
    table { border-collapse: collapse; }
    a { color: ${settings.linkColor}; }
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
    body { margin: 0; padding: 0; font-family: ${settings.fontStack}; background: ${settings.bgColor}; color: ${settings.textColor}; }
    table { border-collapse: collapse; }
    img { border: 0; display: block; }
    a { color: ${settings.primaryColor ?? settings.linkColor}; text-decoration: none; }
    h1, h2, h3 { color: ${settings.headingColor ?? settings.textColor}; font-family: ${settings.headingFont ?? settings.fontStack}; }
    @media only screen and (max-width: 480px) {
      .block-text { font-size: ${settings.mobileFontScale ?? 90}% !important; }
      td[class="block-pad"] { padding-left: ${Math.round(16 * (settings.mobilePaddingScale ?? 80) / 100)}px !important; padding-right: ${Math.round(16 * (settings.mobilePaddingScale ?? 80) / 100)}px !important; }
    }
  </style>
</head>
<body>
<table width="${settings.maxWidth}" cellpadding="0" cellspacing="0" border="0" align="${settings.align}"
  style="width:100%;max-width:${settings.maxWidth}px;margin:0 ${settings.align === 'center' ? 'auto' : '0'};background:${settings.canvasBg};">

${bodyHtml}

</table>
</body>
</html>`
}
