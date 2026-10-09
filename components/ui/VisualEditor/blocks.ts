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
    | 'faq_block'
    | 'testimonial_block'
    | 'testimonials'
    | 'compatibility_block'
    | 'bundle_discount_banner'
    | 'store_nav_bar'
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
    | 'hero_product'
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
    | 'condition_badge'
    | 'item_specifics'
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
    | 'free_shipping'
    | 'why_buy_from_us'
    | 'satisfaction_guarantee'
    | 'limited_time_offer'
    | 'features'
    | 'features'
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
    | 'shipping_policy_block'
    | 'payment_methods_block'
    | 'urgency_timer_block'
    | 'trust_badge_block'

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
    | HeroProductProps
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
    | FeaturesProps
    | FAQBlockProps
    | TestimonialBlockProps
    | CompatibilityBlockProps
    | BundleDiscountBannerProps
    | StoreNavBarProps
    | ShippingPolicyBlockProps
    | PaymentMethodsBlockProps
    | UrgencyTimerBlockProps
    | TrustBadgeBlockProps
    | ConditionBadgeProps
    | ConditionDetailsProps
    | ItemSpecificsProps
    | AuthenticityGuaranteeProps
    | CompatibilityTableProps
    | KeyFeaturesGridProps
    | VatNoticeProps
    | FeedbackScoreProps
    | PullQuoteProps
    | SectionLabelProps
    | BreadcrumbBarProps
    | InternationalShippingProps
    | HighlightTextProps
    | WhyBuyFromUsProps
    | InfoBoxProps

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

// ── Four Column ─────────────────────────────────────────────────────────────
export interface FourColumnProps extends CommonProps {
    col1Content: string
    col2Content: string
    col3Content: string
    col4Content: string
    gap: number
    col1Bg: string
    col2Bg: string
    col3Bg: string
    col4Bg: string
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
    lineHeight: number        // e.g. 1.2
    letterSpacing: number     // px — converted to em in toHtml
    borderBottom: boolean     // decorative left-border accent
    accentColor: string       // left-border color when borderBottom = true
    variant?: string
    subtitle?: string
    badgeText?: string
}

// ── Paragraph ────────────────────────────────────────────────────────────────
export interface ParagraphProps extends CommonProps {
    text: string
    color: string
    fontSize: number
    fontWeight: '400' | '500' | '600' | '700'
    lineHeight: number        // e.g. 1.7
    letterSpacing: number
    align: 'left' | 'center' | 'right'
    variant?: string
    badgeText?: string
    authorText?: string
}

// ── Bullet List ──────────────────────────────────────────────────────────────
export interface BulletListProps extends CommonProps {
    items: string[]           // each item is a string (may contain placeholders)
    color: string
    fontSize: number
    fontWeight: '400' | '500' | '600' | '700'
    lineHeight: number        // e.g. 1.6
    letterSpacing: number     // px — converted to em in toHtml
    bulletColor: string
    bulletStyle: 'disc' | 'check' | 'arrow' | 'star'
    variant?: string
}

// ── Divider ───────────────────────────────────────────────────────────────────
export interface DividerProps extends CommonProps {
    color: string
    thickness: number         // px
    lineStyle: 'solid' | 'dashed' | 'dotted' | 'gradient'
    widthPercent: number      // 0–100
    variant?: string
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
    lineHeight: number        // e.g. 1.3
    letterSpacing: number     // px — converted to em in toHtml
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
    // Single variant — optional centered caption rendered directly under the image.
    // Sellers can use it for the item title, a feature note, or a short tagline.
    // Empty string = caption row is omitted entirely (no empty <p> rendered).
    caption: string
    captionColor: string
    captionFontSize: number
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
    // Optional inline box-shadow on the <img> — canvas-only depth treatment.
    // Email clients strip box-shadow so the email falls back to the
    // borderRadius + bgColor frame alone; the canvas preview shows the
    // full treatment. Preserved across Layout Style preset switches.
    shadow?: string
    shadowPreset?: 'none' | 'soft' | 'medium' | 'hard' | 'card'
    // Gallery
    mainImageMaxHeight?: number   // max-height on gallery main image (default 420)
    showScrollHint?: boolean      // show "Scroll to view all images" hint
    // Lifestyle
    lifestyleName?: string        // override product name in overlay (falls back to alt)
    lifestyleNameColor?: string   // colour of the product name text
    // Polaroid
    polaroidSuffix?: string       // text after " — " in caption (empty string = hide)
}

// ── Hero Product (2-column) ───────────────────────────────────────────────────
export interface HeroProductProps extends CommonProps {
    // Left column — image + thumbnails
    leftImage: string         // default: {{MAIN_IMAGE_URL}}
    thumb1: string            // default: {{IMAGE_2_URL}}
    thumb2: string            // default: {{IMAGE_3_URL}}
    thumb3: string            // default: {{IMAGE_4_URL}}
    thumb4: string            // default: {{IMAGE_5_URL}}
    leftBg: string            // image container background

    // Right column — title + price + bullets
    rightTitle: string        // default: {{PRODUCT_TITLE}}
    rightCondition: string    // default: {{ITEM_CONDITION}}
    rightPrice: string        // default: {{ITEM_PRICE}}
    rightOriginal: string     // default: {{ORIGINAL_PRICE}}
    showOriginal: boolean
    rightQuantity: string     // default: {{QUANTITY}}
    showScarcity: boolean
    rightBadgeText: string    // small pill text (e.g. "Brand New")

    // Bullets (4 hard-coded for high-converting eBay listings)
    rightBullets: string[]

    // Variant
    variant?: string          // 'default' | 'image-right' | 'stacked' | 'dark-hero' | 'with-gallery' | 'centered-hero'

    // Accent
    accentColor: string       // title underline, price, bullets
    scarcityBg: string
    scarcityColor: string

    // Optional price-line reassurance tags (added v2.1 — opt-in per template)
    stockBadgeText?: string   // e.g. "In Stock • Fast Shipping" — inline with price
    showStockBadge?: boolean  // default true if stockBadgeText set
    guaranteeTagText?: string // e.g. "100% Satisfaction Guarantee" — under price
    showGuaranteeTag?: boolean
    guaranteeTagBg?: string   // optional override; defaults to #f0fdf4
    guaranteeTagColor?: string// optional override; defaults to #166534
}

// ── Product Description ───────────────────────────────────────────────────────
export interface ProductVariantsProps extends CommonProps {
    variant: string
    // Colours
    colorCount: number
    color1: string; colorName1: string
    color2: string; colorName2: string
    color3: string; colorName3: string
    color4: string; colorName4: string
    color5: string; colorName5: string
    color6: string; colorName6: string
    // Sizes
    sizesText: string           // comma-separated: 'XS,S,M,L,XL,XXL'
    // Labels
    showColourLabel: boolean
    showSizeLabel: boolean
    colourLabel: string
    sizeLabel: string
    labelColor: string
    textColor: string
    // Swatch style
    swatchSize: number
    swatchShape: string         // 'circle' | 'square'
    swatchBorderColor: string
    // Pill style
    pillStyle: string           // 'outlined' | 'filled'
    accentColor: string
    // Accent selected
    selectedColorIndex: number
    selectedSizeIndex: number
    // Dark selector
    darkPanelBg: string
    // Availability grid
    unavailableSizes: string    // comma-separated out-of-stock sizes
    // Spec badges
    badge1Icon: string; badge1Text: string
    badge2Icon: string; badge2Text: string
    badge3Icon: string; badge3Text: string
    badge4Icon: string; badge4Text: string
}

export interface ProductDescriptionProps extends CommonProps {
    text: string              // default: {{ITEM_DESCRIPTION}}
    color: string
    fontSize: number
    fontWeight: string        // body text weight (default '400')
    lineHeight: number
    textAlign: string         // body text alignment (default 'left')
    letterSpacing: number     // body letter spacing px (default 0)
    showTitle: boolean
    titleText: string
    titleColor: string
    titleFontSize: number     // title font size (default 16)
    titleFontWeight: string   // title font weight (default '700')
    titleAlign: string        // title alignment (default 'left')
    titleLetterSpacing: number // title letter spacing px (default 0)
    splitItalic: boolean      // split-story: left column italic (default true)
    variant: string
    accentColor: string
    feature1: string
    feature2: string
    feature3: string
    darkBg: string
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

// ── Condition Badge ──────────────────────────────────────────────────────────
export interface ConditionBadgeProps extends CommonProps {
    condition: 'new' | 'used' | 'refurbished' | 'for_parts' | 'open_box'
    subText: string
    showIcon: boolean
    badgeRadius: number
}

// ── Condition Details ────────────────────────────────────────────────────────
export interface ConditionDetailsProps extends CommonProps {
    variant?: string
    condition?: string
    conditionNotes?: string
    heading?: string
    accentColor?: string
}

// ── Item Specifics ───────────────────────────────────────────────────────────
export interface ItemSpecificsProps extends CommonProps {
    rows: Array<{ key: string; value: string }>
    headerBg: string
    headerText: string
    evenRowBg: string
    oddRowBg: string
    borderColor: string
    keyColor: string
    valueColor: string
    fontSize: number
    showTitle: boolean
    titleText: string
}

// ── Authenticity Guarantee ───────────────────────────────────────────────────
export interface AuthenticityGuaranteeProps extends CommonProps {
    variant: string
    heading: string
    subText: string
    points: Array<{ title: string; sub?: string }>
    accentColor: string
    textColor: string
}

// ── Compatibility Table ───────────────────────────────────────────────────────
export interface CompatibilityTableProps extends CommonProps {
    variant?: string
    titleText?: string
    items?: Array<{ model: string; years?: string; make?: string; submodel?: string; notes?: string; status?: boolean; partNumber?: string }>
    models?: string[]
}

// ── Key Features Grid ────────────────────────────────────────────────────────
export interface KeyFeaturesGridProps extends CommonProps {
    variant?: string
    heading?: string
    subtitle?: string
    features?: Array<{
        icon?: string
        title?: string
        text?: string
        description?: string
        badge?: string
        metric?: string
        highlight?: boolean
    }>
    cardBg?: string
    cardBorder?: string
    iconColor?: string
    titleColor?: string
    accentColor?: string
}

// ── VAT Notice ───────────────────────────────────────────────────────────────
export interface VatNoticeProps extends CommonProps {
    variant?: string
    heading?: string
    vatNumber?: string
    companyNumber?: string
    text?: string
    accentColor?: string
    titleColor?: string
    cardBg?: string
    cardBorder?: string
}

// ── Feedback Score ──────────────────────────────────────────────────────────
export interface FeedbackScoreProps extends CommonProps {
    variant?: string
    feedbackScore?: string
    memberSince?: string
    heading?: string
    reviewCount?: string
    starColor?: string
    accentColor?: string
}

// ── Pull Quote ──────────────────────────────────────────────────────────────
export interface PullQuoteProps extends CommonProps {
    variant?: string
    quoteText?: string
    author?: string
    quoteColor?: string
    fontSize?: number
    accentColor?: string
}

// ── Section Label ───────────────────────────────────────────────────────────
export interface SectionLabelProps extends CommonProps {
    variant?: string
    text?: string
    label?: string
    labelText?: string
    heading?: string
    color?: string
    textColor?: string
    accentColor?: string
    fontSize?: number
    fontWeight?: string
    letterSpacing?: number
    align?: 'left' | 'center' | 'right'
}

// ── Breadcrumb Bar ───────────────────────────────────────────────────────────
export interface BreadcrumbBarProps extends CommonProps {
    variant?: string
    storeName?: string
    category?: string
    productTitle?: string
    sellerName?: string
    categoryName?: string
    title?: string
    textColor?: string
    separatorColor?: string
    accentColor?: string
    linkColor?: string
    activeColor?: string
    preserveTokens?: boolean
}

// ── International Shipping ───────────────────────────────────────────────────
export interface InternationalShippingProps extends CommonProps {
    variant?: string
    heading?: string
    title?: string
    headingText?: string
    text?: string
    noticeText?: string
    subText?: string
    headingColor?: string
    textColor?: string
    accentColor?: string
    preserveTokens?: boolean
}

// ── Highlight Text ───────────────────────────────────────────────────────────
export interface HighlightTextProps extends CommonProps {
    variant?: string
    text?: string
    highlightText?: string
    textColor?: string
    highlightColor?: string
    accentColor?: string
    fontSize?: number
    fontWeight?: string
    letterSpacing?: number
    align?: 'left' | 'center' | 'right'
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
    shadow?: string           // optional inline box-shadow on the <img>
    // (e.g. "0 4px 14px rgba(117,48,251,0.08)").
    // Canvas-only — email clients strip box-shadow.
}

// ── Banner ────────────────────────────────────────────────────────────────────
export interface BannerProps extends CommonProps {
    // bgColor already inherited from CommonProps (can be overridden)
    bgGradient: boolean      // inherit from CommonProps
    bgGradientMid?: string      // optional mid-stop for animated wave
    gradientFrom?: string
    gradientTo?: string
    gradientSpeed?: number     // seconds per loop for animated wave
    headingText: string
    headingColor: string
    headingSize: number
    subText: string
    subColor: string
    accentColor?: string      // optional accent stripe colour for diagonal variant
    align: 'left' | 'center' | 'right'
    // Optional enhancements for pet store banner
    badgeText?: string         // optional mini‑badge text above heading
    badgeBg?: string           // badge background colour
    badgeColor?: string        // badge text colour
    ctaText?: string           // CTA button label
    ctaUrl?: string            // CTA link URL
    ctaBgColor?: string        // CTA background colour
    ctaTextColor?: string      // CTA text colour
    ctaHoverBgColor?: string   // CTA hover background colour
    minHeight?: number         // optional min‑height override
    variant?: string          // layout variant id (required by block system)
    imageUrl?: string         // image url for split-image-text variant
    imagePosition?: 'left' | 'right' // position for split-image-text variant
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
    accentColor: string       // left-edge accent stripe colour
    iconBg: string            // icon-square background colour
    borderRadius: number
}

// ── Returns Policy ────────────────────────────────────────────────────────────
export interface ReturnsPolicyProps extends CommonProps {
    policyText: string        // default: {{RETURN_POLICY}}
    showPeriod: boolean
    periodText: string        // e.g. "30-Day Free Returns"
    bgColor: string
    textColor: string
    accentColor: string       // left-edge accent stripe colour
    iconColor: string         // icon colour
    iconBg: string            // icon-square background colour
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
    variant: string
}

// ── CTA Banner ────────────────────────────────────────────────────────────────
export interface CtaBannerProps extends CommonProps {
    variant?: string
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
    accentColor?: string
    linkUrl?: string
}

// ── Features / Trust Badges Bar ──────────────────────────────────────────────
export interface FeaturesProps extends CommonProps {
    features: Array<{ icon: string; label: string; subText?: string }>
    iconColor: string
    textColor: string
    variant?: string
    iconBg?: string
    cardBg?: string
    subTextColor?: string
    accentColor?: string
}

// ── Why Buy From Us ──────────────────────────────────────────────────────────
export interface WhyBuyFromUsProps extends CommonProps {
    variant?: string
    title: string
    reasons: Array<{ icon: string; title: string; desc: string }>
    titleColor: string
    descColor: string
    iconColor: string
    cardBg?: string
    cardBorder?: string
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
    variant?: string
    text: string              // e.g. "Only {{QUANTITY}} Left — Order Soon!"
    bgColor: string
    textColor: string
    iconColor: string
    borderRadius: number
    showIcon: boolean
    pulse: boolean            // adds pulsing dot
    align: 'left' | 'center' | 'right'
    fontSize: number
    quantity?: string | number
    percentRemaining?: number
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
    variant: 'button-solid' | 'button-outline' | 'button-rounded' | 'button-shadow' | 'button-gradient' | 'button-icon-left' | 'button-icon-right' | 'button-full-width' | 'button-minimal' | 'button-pulse' | 'solid' | 'outline' | 'rounded' | 'shadow' | 'gradient' | 'icon_left' | 'icon_right' | 'full_width' | 'minimal' | 'pulse' | 'primary' | 'secondary' | 'dark' | 'accent'
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
    variant?: string
    height: number            // px
    fillColor: string
    borderColor: string
    borderWidth: number
    borderRadius: number
    content: string           // optional HTML inside
    align: 'left' | 'center' | 'right'
    accentColor?: string
    badgeText?: string
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
    linkUrl?: string
}

// ── FAQ Block ─────────────────────────────────────────────────────────
export interface FAQBlockProps extends CommonProps {
    variant?: string
    faqs?: Array<{ question: string; answer: string }>
    items?: Array<{ id?: string; question: string; answer: string }>
    questionBg?: string
    questionColor: string
    answerColor: string
    chevronColor?: string
}

// ── Testimonial Block ───────────────────────────────────────────────
export interface TestimonialBlockProps extends CommonProps {
    variant?: string
    testimonials: Array<{
        text: string
        author: string
        rating: number
    }>
    textColor: string
    authorColor: string
    starColor: string
    bgColor: string
    borderRadius: number
}

// ── Compatibility Block ─────────────────────────────────────────────
export interface CompatibilityBlockProps extends CommonProps {
    compatibleModels: string[]
    incompatibleModels: string[]
    title: string
    iconColor: string
    compatibleColor: string
    incompatibleColor: string
}

// ── Bundle Discount Banner ────────────────────────────────────────
export interface BundleDiscountBannerProps extends CommonProps {
    discountPercentage: number
    minimumQty: number
    bannerText: string
    bgColor: string
    textColor: string
    accentColor: string
}

// ── Store Navigation Bar ──────────────────────────────────────────
export interface StoreNavBarProps extends CommonProps {
    links: Array<{ label: string; url: string }>
    bgColor: string
    textColor: string
    hoverColor: string
    fontSize: number
    fontWeight: string
    borderRadius: number
}

export interface ShippingPolicyBlockProps extends CommonProps {
    title: string
    policyText: string
    deliveryTime: string
    accentColor: string
}

export interface PaymentMethodsBlockProps extends CommonProps {
    title: string
    showPayPal: boolean
    showCreditCards: boolean
}

export interface UrgencyTimerBlockProps extends CommonProps {
    text: string
    timerColor: string
    bgColor: string
}

export interface TrustBadgeBlockProps extends CommonProps {
    variant?: string
    badgeText: string
    text?: string
    subtext?: string
    subText?: string
    textColor: string
    color?: string
}

export interface InfoBoxProps extends CommonProps {
    variant?: string
    title?: string
    heading?: string
    description?: string
    text?: string
    iconColor?: string
    accentColor?: string
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
import { getBannerVariant as _getBannerVariant } from './variants/banner.variants'
import { getButtonVariant as _getButtonVariant } from './variants/button_block.variants'
import { getFeatureVariant as _getFeatureVariant } from './variants/features.variants'
import { getProductDescriptionVariant as _getProductDescriptionVariant } from './variants/product_description.variants'
import { getProductVariantsVariant as _getProductVariantsVariant } from './variants/product_variants.variants'
import { getWhatsInTheBoxVariant as _getWhatsInTheBoxVariant } from './variants/whats_in_the_box.variants'
import { getHeroProductVariant as _getHeroProductVariant } from './variants/hero_product.variants'
import { getCtaBannerVariant as _getCtaBannerVariant } from './variants/cta_banner.variants'
import { getSellerInfoVariant as _getSellerInfoVariant } from './variants/seller_info.variants'
import { getSingleImageVariant as _getSingleImageVariant } from './variants/single_image.variants'
import { getLogoBarVariant as _getLogoBarVariant } from './variants/logo_bar.variants'
import { getBundleDealVariant as _getBundleDealVariant } from './variants/bundle_deal.variants'
import { getPriceTagVariant as _getPriceTagVariant } from './variants/price_tag.variants'
import { getStoreFooterVariant as _getStoreFooterVariant } from './variants/store_footer.variants'
import { getCategoryNavVariant as _getCategoryNavVariant } from './variants/category_nav.variants'
import { getSeasonalBannerVariant as _getSeasonalBannerVariant } from './variants/seasonal_banner.variants'
import { getMoneyBackVariant as _getMoneyBackVariant } from './variants/money_back.variants'
import { getFreeShippingVariant as _getFreeShippingVariant } from './variants/free_shipping.variants'
import { getLimitedTimeOfferVariant as _getLimitedTimeOfferVariant } from './variants/limited_time_offer.variants'
import { getSatisfactionGuaranteeVariant as _getSatisfactionGuaranteeVariant } from './variants/satisfaction_guarantee.variants'
import { getConditionBadgeVariant as _getConditionBadgeVariant } from './variants/condition_badge.variants'
import { getConditionDetailsVariant as _getConditionDetailsVariant } from './variants/condition_details.variants'
import { getItemSpecificsVariant as _getItemSpecificsVariant } from './variants/item_specifics.variants'
import { getAuthenticityGuaranteeVariant as _getAuthenticityGuaranteeVariant } from './variants/authenticity_guarantee.variants'
import { getCompatibilityTableVariant as _getCompatibilityTableVariant } from './variants/compatibility_table.variants'
import { getProductComparisonVariant as _getProductComparisonVariant } from './variants/product_comparison.variants'
import { getKeyFeaturesVariant as _getKeyFeaturesVariant } from './variants/key_features.variants'
import { getVatNoticeVariant } from './variants/vat_notice.variants'
import { getFeedbackScoreVariant } from './variants/feedback_score.variants'
import { getPullQuoteVariant } from './variants/pull_quote.variants'
import { getSectionLabelVariant } from './variants/section_label.variants'
import { getBreadcrumbBarVariant } from './variants/breadcrumb_bar.variants'
import { getInternationalShippingVariant } from './variants/international_shipping.variants'
import { getHighlightTextVariant } from './variants/highlight_text.variants'
import { getProductTitleVariant } from './variants/product_title.variants'
import { getFaqBlockVariant } from './variants/faq_block.variants'
import { getWhyBuyFromUsVariant } from './variants/why_buy_from_us.variants'
import { getUrgencyBarVariant } from './variants/urgency_bar.variants'
import { getRectangleVariant } from './variants/rectangle.variants'
import { getTrustBadgeVariant } from './variants/trust_badge.variants'
import { getTestimonialsVariant } from './variants/testimonials.variants'
import { getQuoteBlockVariant } from './variants/quote_block.variants'
import { getInfoBoxVariant } from './variants/info_box.variants'
import { getShippingInfoVariant } from './variants/shipping_info.variants'
import { getStoreHeaderVariant } from './variants/store_header.variants'
import { getHeadingVariant } from './variants/heading.variants'
import { getParagraphVariant } from './variants/paragraph.variants'
import { getBulletListVariant } from './variants/bullet_list.variants'
import { getDividerVariant } from './variants/divider.variants'
import { getNumberedListVariant } from './variants/numbered_list.variants'

// ─────────────────────────────────────────────────────────────────────────────
// SHARED SLOT PLACEHOLDERS
// Used wherever a block has an image or content dropzone.
// SVG scales to any width via viewBox — no fixed pixel size.
// ─────────────────────────────────────────────────────────────────────────────

export const IMAGE_PLACEHOLDER_SVG = `<svg viewBox="0 0 4 3" preserveAspectRatio="xMidYMid meet" width="100%" xmlns="http://www.w3.org/2000/svg" style="display:block;border-radius:6px;">
  <rect width="4" height="3" fill="#f3eeff" rx="0.12"/>
  <rect x="1.3" y="0.75" width="1.4" height="0.98" rx="0.08" fill="#ede9fe"/>
  <circle cx="1.62" cy="1.05" r="0.13" fill="#c4b5fd"/>
  <path d="M1.3 1.52 L1.75 1.08 L2.1 1.45 L2.35 1.22 L2.7 1.58 L2.7 1.73 L1.3 1.73Z" fill="#c4b5fd" opacity="0.7"/>
  <text x="2" y="2.2" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="0.17" fill="#7530fb" font-weight="700">Add Image</text>
</svg>`

export const CONTENT_PLACEHOLDER = `<div data-canvas-dropzone="content" style="width:100%;min-height:80px;background:#f8f8f8;border:1px dashed #ddd;border-radius:4px;display:flex;align-items:center;justify-content:center;cursor:pointer;"><span class="add-btn" style="font-family:Arial,sans-serif;font-size:13px;color:#6b7280;">+ Add Content</span></div>`

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
function wrapBlock(type: BlockType, id: string, innerHtml: string, props?: BlockProps): string {
    const linkUrl = (props as any)?.linkUrl
    const wrapped = linkUrl
        ? `<a href="${linkUrl}" style="display:block;text-decoration:none;color:inherit;">${innerHtml}</a>`
        : innerHtml
    return `<!-- BLOCK:${type}:${id} -->\n${wrapped}\n<!-- /BLOCK:${type}:${id} -->`
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
            content: CONTENT_PLACEHOLDER,
            borderColor: '#ede9fe',
            borderWidth: 0,
            borderRadius: 0,
        } as FullWidthSectionProps,
        toHtml(props, id) {
            const p = props as FullWidthSectionProps & any
            const border = p.borderWidth > 0 ? `border:${p.borderWidth}px solid ${p.borderColor};` : ''
            const radius = p.borderRadius > 0 ? `border-radius:${p.borderRadius}px;` : ''
            const innerPad = (p.innerPaddingTop || p.innerPaddingBottom || p.innerPaddingLeft || p.innerPaddingRight)
                ? `padding:${p.innerPaddingTop ?? 0}px ${p.innerPaddingRight ?? 0}px ${p.innerPaddingBottom ?? 0}px ${p.innerPaddingLeft ?? 0}px;`
                : ''
            const align = p.contentAlign ? `text-align:${p.contentAlign};` : ''
            const maxInner = p.capWidth && p.innerMaxWidth ? `max-width:${p.innerMaxWidth}px;margin:0 auto;` : 'width:100%;'
            return wrapBlock('full_width_section', id,
                `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;table-layout:fixed;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}${border}${radius};width:100%;">
      <div style="${innerPad}${align}${maxInner};width:100%;">${p.content}</div>
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
            leftContent: CONTENT_PLACEHOLDER.replace('data-canvas-dropzone="content"', 'data-canvas-dropzone="leftContent"'),
            rightContent: CONTENT_PLACEHOLDER.replace('data-canvas-dropzone="content"', 'data-canvas-dropzone="rightContent"'),
            leftWidth: 50,
            gap: 16,
            leftBg: '#ffffff',
            rightBg: '#ffffff',
        } as TwoColumnProps,
        toHtml(props, id) {
            const p = props as TwoColumnProps
            const rightWidth = 100 - p.leftWidth
            const rows = (p as any).rows && Array.isArray((p as any).rows) ? (p as any).rows : [{ leftContent: p.leftContent, rightContent: p.rightContent }]
            const pa = p as any
            const valign = pa.colAlign === 'middle' ? 'middle' : pa.colAlign === 'bottom' ? 'bottom' : 'top'
            const lPad = pa.leftPadding ? `padding:${pa.leftPadding}px;` : ''
            const rPad = pa.rightPadding ? `padding:${pa.rightPadding}px;` : ''
            const lRadius = pa.leftRadius ? `border-radius:${pa.leftRadius}px;` : ''
            const rRadius = pa.rightRadius ? `border-radius:${pa.rightRadius}px;` : ''
            const divider = pa.showDivider
                ? `<td width="${pa.dividerWidth ?? 1}px" style="width:${pa.dividerWidth ?? 1}px;background-color:${pa.dividerColor ?? '#ede9fe'};font-size:1px;line-height:1px;">&nbsp;</td>`
                : ''
            const rowsHtml = rows.map((r: any, idx: number) => `
        <tr>
          <td width="${p.leftWidth}%" valign="${valign}" style="padding-right:${p.gap / 2}px;${lPad}${lRadius}background-color:${pa.leftBg ?? 'transparent'}; ${idx > 0 ? 'padding-top:16px;' : ''}">
            <div style="width:100%;box-sizing:border-box;">${r.leftContent}</div>
          </td>
          ${divider}
          <td width="${rightWidth}%" valign="${valign}" style="padding-left:${p.gap / 2}px;${rPad}${rRadius}background-color:${pa.rightBg ?? 'transparent'}; ${idx > 0 ? 'padding-top:16px;' : ''}">
            <div style="width:100%;box-sizing:border-box;">${r.rightContent}</div>
          </td>
        </tr>
            `).join('')
            return wrapBlock('two_column', id,
                `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${rowsHtml}
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
            col1Content: CONTENT_PLACEHOLDER.replace('data-canvas-dropzone="content"', 'data-canvas-dropzone="col1Content"'),
            col2Content: CONTENT_PLACEHOLDER.replace('data-canvas-dropzone="content"', 'data-canvas-dropzone="col2Content"'),
            col3Content: CONTENT_PLACEHOLDER.replace('data-canvas-dropzone="content"', 'data-canvas-dropzone="col3Content"'),
            gap: 12,
            col1Bg: '#ffffff',
            col2Bg: '#ffffff',
            col3Bg: '#ffffff',
        } as ThreeColumnProps,
        toHtml(props, id) {
            const p = props as ThreeColumnProps
            const rows = (p as any).rows && Array.isArray((p as any).rows) ? (p as any).rows : [{ col1Content: p.col1Content, col2Content: p.col2Content, col3Content: p.col3Content }]
            const pa3 = p as any
            const valign3 = pa3.colAlign === 'middle' ? 'middle' : pa3.colAlign === 'bottom' ? 'bottom' : 'top'
            const w1 = pa3.customWidths ? (pa3.col1Width ?? 33) : 33
            const w2 = pa3.customWidths ? (pa3.col2Width ?? 34) : 34
            const w3 = pa3.customWidths ? (pa3.col3Width ?? 33) : 33
            const cp3 = pa3.colPadding ? `padding:${pa3.colPadding}px;` : ''
            const cr3 = pa3.colRadius ? `border-radius:${pa3.colRadius}px;` : ''
            const div3 = pa3.showDivider
                ? `<td width="${pa3.dividerWidth ?? 1}px" style="width:${pa3.dividerWidth ?? 1}px;background-color:${pa3.dividerColor ?? '#ede9fe'};font-size:1px;">&nbsp;</td>`
                : ''
            const rowsHtml = rows.map((r: any, idx: number) => `
        <tr>
          <td width="${w1}%" valign="${valign3}" style="padding-right:${p.gap / 2}px;${cp3}${cr3}background-color:${pa3.col1Bg ?? 'transparent'}; ${idx > 0 ? 'padding-top:16px;' : ''}">${r.col1Content}</td>
          ${div3}
          <td width="${w2}%" valign="${valign3}" style="padding-left:${p.gap / 2}px;padding-right:${p.gap / 2}px;${cp3}${cr3}background-color:${pa3.col2Bg ?? 'transparent'}; ${idx > 0 ? 'padding-top:16px;' : ''}">${r.col2Content}</td>
          ${div3}
          <td width="${w3}%" valign="${valign3}" style="padding-left:${p.gap / 2}px;${cp3}${cr3}background-color:${pa3.col3Bg ?? 'transparent'}; ${idx > 0 ? 'padding-top:16px;' : ''}">${r.col3Content}</td>
        </tr>
            `).join('')
            return wrapBlock('three_column', id,
                `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${rowsHtml}
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
            maxWidth: 1000,
            content: CONTENT_PLACEHOLDER,
            borderColor: '#ede9fe',
            borderWidth: 1,
            borderRadius: 8,
        } as ContainerProps,
        toHtml(props, id) {
            const p = props as ContainerProps & any
            const innerPad = `padding:${p.innerPaddingTop ?? 20}px ${p.innerPaddingRight ?? 24}px ${p.innerPaddingBottom ?? 20}px ${p.innerPaddingLeft ?? 24}px;`
            const textCol = p.textColor ? `color:${p.textColor};` : ''
            const align = p.textAlign ? `text-align:${p.textAlign};` : ''
            const overflow = p.overflowHidden ? 'overflow:hidden;' : ''
            return wrapBlock('container', id,
                `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;">
  <tr>
    <td style="background-color:${p.bgColor};padding:${p.paddingTop}px ${p.paddingRight}px ${p.paddingBottom}px ${p.paddingLeft}px;">
      <table width="${p.maxWidth}" cellpadding="0" cellspacing="0" border="0" align="center"
        style="max-width:${p.maxWidth}px;width:100%;border:${p.borderWidth}px solid ${p.borderColor};border-radius:${p.borderRadius}px;${overflow}">
        <tr><td style="${innerPad}${textCol}${align}">${p.content}</td></tr>
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
        description: 'Section heading H1 – H4 — 10 layout styles',
        defaultProps: {
            ...DEFAULT_COMMON,
            variant: 'hd-classic-accent-bar',
            text: 'Section Heading',
            level: 'h2',
            color: '#1e1535',
            fontSize: 22,
            align: 'left',
            fontWeight: '700',
            lineHeight: 1.2,
            letterSpacing: 0,
            borderBottom: true,
            accentColor: '#7530fb',
            icon: 'layers',
            iconName: 'layers',
            features: [{ icon: 'layers' }],
            subtitle: 'Verified product specifications & technical details',
            paddingTop: 16,
            paddingBottom: 16,
            paddingLeft: 24,
            paddingRight: 24,
        } as HeadingProps,
        toHtml(props, id) {
            const p = props as any
            const variantId = p.variant ?? 'hd-classic-accent-bar'
            return wrapBlock('heading', id, getHeadingVariant(variantId).toHtml(p, id), p)
        },
    },

    {
        type: 'paragraph',
        label: 'Paragraph',
        category: 'Content',
        icon: 'pilcrow',
        description: 'Body text paragraph — 10 layout styles',
        defaultProps: {
            ...DEFAULT_COMMON,
            variant: 'para-classic-plain',
            text: 'Enter your paragraph text here. You can include {{PRODUCT_TITLE}} and other placeholders.',
            color: '#6b7280',
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 1.7,
            letterSpacing: 0,
            align: 'left',
            paddingTop: 16,
            paddingBottom: 16,
            paddingLeft: 24,
            paddingRight: 24,
        } as ParagraphProps,
        toHtml(props, id) {
            const p = props as any
            const variantId = p.variant ?? 'para-classic-plain'
            return wrapBlock('paragraph', id, getParagraphVariant(variantId).toHtml(p, id), p)
        },
    },

    {
        type: 'bullet_list',
        label: 'Bullet List',
        category: 'Content',
        icon: 'list',
        description: 'Styled feature list with icons — 10 layout styles',
        defaultProps: {
            ...DEFAULT_COMMON,
            variant: 'bl-classic-check',
            items: ['Feature one — describe your product benefit', 'Feature two — another key selling point', 'Feature three — quality guarantee'],
            color: '#1f1d2e',
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 1.6,
            letterSpacing: 0,
            bulletColor: '#7530fb',
            bulletStyle: 'check',
            paddingTop: 16,
            paddingBottom: 16,
            paddingLeft: 24,
            paddingRight: 24,
        } as BulletListProps,
        toHtml(props, id) {
            const p = props as any
            const variantId = p.variant ?? 'bl-classic-check'
            return wrapBlock('bullet_list', id, getBulletListVariant(variantId).toHtml(p, id), p)
        },
    },

    {
        type: 'divider',
        label: 'Divider',
        category: 'Content',
        icon: 'minus',
        description: 'Horizontal divider line — 10 layout styles',
        defaultProps: {
            ...DEFAULT_COMMON,
            variant: 'div-minimal-diamond',
            paddingTop: 16,
            paddingBottom: 16,
            color: '#7530fb',
            thickness: 1,
            lineStyle: 'solid',
            widthPercent: 100,
        } as DividerProps,
        toHtml(props, id) {
            const p = props as any
            const variantId = p.variant ?? 'div-minimal-diamond'
            return wrapBlock('divider', id, getDividerVariant(variantId).toHtml(p, id), p)
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
            lineHeight: 1.3,
            letterSpacing: 0,
            showCondition: true,
            conditionText: '{{ITEM_CONDITION}}',
            conditionColor: '#6b7280',
            conditionFontSize: 13,
        } as ProductTitleProps,
        toHtml(props, id) {
            const p = props as any
            const variantId = p.variant ?? 'pt-classic-baseline'
            return wrapBlock('product_title', id, getProductTitleVariant(variantId).toHtml(p, id), p)
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
            // thumbHeight is preserved for backward compatibility but the
            // Gallery variant now renders thumbs as 1:1 squares (aspect-square)
            // so the value is no longer used by toHtml.
            thumbHeight: 80,
            thumbBorderRadius: 8,
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
            // Single variant — optional centered caption under the image
            caption: '',
            captionColor: '#475569',
            captionFontSize: 13,
            // Canvas-only depth treatment — preserved across Layout Style
            // preset switches because it's a top-level prop on the schema.
            shadow: '',
            shadowPreset: 'none',
            mainImageMaxHeight: 420,
            showScrollHint: true,
            lifestyleName: '',
            lifestyleNameColor: '#ffffff',
            polaroidSuffix: 'Premium Edition',
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
            textAlign: 'left',
            letterSpacing: 0,
            titleFontSize: 16,
            titleFontWeight: '700',
            titleAlign: 'left',
            titleLetterSpacing: 0,
            splitItalic: true,
            variant: 'plain',
            accentColor: '#7530fb',
            feature1: '✓ Premium Quality',
            feature2: '✓ Fast Dispatch',
            feature3: '✓ 30-Day Returns',
            darkBg: '#1e1535',
        } as ProductDescriptionProps,
        toHtml(props, id) {
            const p = props as ProductDescriptionProps
            return _getProductDescriptionVariant(p.variant ?? 'plain').toHtml(p, id)
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

    // ── HERO PRODUCT (2-column) ──────────────────────────────────────────────
    {
        type: 'hero_product',
        label: 'Hero Product',
        category: 'Product',
        icon: 'layout-template',
        description: 'High-converting 2-column hero: image + title + price + bullets',
        defaultProps: {
            ...DEFAULT_COMMON,
            paddingTop: 24,
            paddingBottom: 24,
            paddingLeft: 20,
            paddingRight: 20,
            // Left column
            leftImage: '{{MAIN_IMAGE_URL}}',
            thumb1: '{{IMAGE_2_URL}}',
            thumb2: '{{IMAGE_3_URL}}',
            thumb3: '{{IMAGE_4_URL}}',
            thumb4: '{{IMAGE_5_URL}}',
            leftBg: '#f9fafb',
            // Right column
            rightTitle: '{{PRODUCT_TITLE}}',
            rightCondition: '{{ITEM_CONDITION}}',
            rightPrice: '{{ITEM_PRICE}}',
            rightOriginal: '{{ORIGINAL_PRICE}}',
            showOriginal: true,
            rightQuantity: '{{QUANTITY}}',
            showScarcity: true,
            rightBadgeText: 'Brand New',
            rightBullets: [
                'Veterinarian-recommended deshedding tool',
                'Self-cleaning retractable bristles',
                'Reduces shedding by up to 95%',
                'Ergonomic non-slip handle — gentle on skin',
            ],
            // Accent
            accentColor: '#7530fb',
            scarcityBg: '#fef2f2',
            scarcityColor: '#991b1b',
            // Variant
            variant: 'hp-default',
        } as HeroProductProps,
        toHtml(props, id) {
            const p = props as HeroProductProps
            return _getHeroProductVariant(p.variant ?? 'hp-default').toHtml(props, id)
        },
    },

    {
        type: 'image',
        label: 'Image',
        category: 'Media',
        icon: 'image',
        description: 'Single image with optional caption and link',
        defaultProps: {
            ...DEFAULT_COMMON,
            src: '{{MAIN_IMAGE_URL}}',
            alt: '{{PRODUCT_TITLE}}',
            width: 100,
            widthUnit: '%',
            align: 'center',
            borderRadius: 8,
            linkUrl: '',
            bgColor: '#ffffff',
        } as ImageProps,
        toHtml(props, id) {
            const p = props as ImageProps
            // 'px' widths use a fixed pixel table, '%' widths stretch to the
            // container's 700px max so the image is always responsive.
            const widthStyle = p.widthUnit === 'px'
                ? `width:${p.width}px;max-width:100%;`
                : `width:100%;max-width:${p.width}%;`
            // Optional inline shadow — opt-in per template. When set it gives
            // the image a "premium banner" depth in the canvas preview; email
            // clients strip box-shadow so the email falls back to the rounded
            // corner + bgColor frame alone.
            const shadowStyle = p.shadow ? `box-shadow:${p.shadow};` : ''
            const imgHtml = `<img src="${p.src}" alt="${p.alt}" border="0" style="${widthStyle}height:auto;display:block;border-radius:${p.borderRadius}px;${shadowStyle}" />`
            const linked = p.linkUrl
                ? `<a href="${p.linkUrl}" style="text-decoration:none;display:inline-block;">${imgHtml}</a>`
                : imgHtml
            return wrapBlock('image', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}${textAlign(p.align)}">
      ${linked}
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
            subTextColor: 'rgba(255,255,255,0.75)',
            align: 'center',
            minHeight: 120,
            variant: 'simple',
            imageUrl: '',
            imagePosition: 'left',
            borderRadius: 8,
        } as BannerProps,
        toHtml(props, id) {
            const p = props as BannerProps
            return _getBannerVariant(p.variant ?? 'simple').toHtml(p, id)
        },
    },

    {
        type: 'features',
        label: 'Features Bar',
        category: 'Media',
        icon: 'grid-2x2',
        description: 'Icon-based feature highlights — 10 layout styles',
        defaultProps: {
            ...DEFAULT_COMMON,
            paddingTop: 20,
            paddingBottom: 20,
            features: [
                { icon: 'star', label: 'Top Quality', subText: 'Premium Materials' },
                { icon: 'truck', label: 'Fast Shipping', subText: 'Tracked Delivery' },
                { icon: 'return', label: 'Easy Returns', subText: '30-Day Policy' },
            ],
            iconColor: '#7530fb',
            textColor: '#1e1535',
            subTextColor: '#6b7280',
            iconBg: '#f3eeff',
            variant: 'simple-centered',
        } as FeaturesProps,
        toHtml(props, id) {
            const p = props as FeaturesProps
            return wrapBlock('features', id, _getFeatureVariant(p.variant ?? 'simple-centered').toHtml(p, id), p)
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
                { icon: '✅', text: 'Authentic Product' },
                { icon: '🚚', text: 'Fast Dispatch' },
                { icon: '↩️', text: '30-Day Returns' },
                { icon: '⭐', text: 'Top Rated Seller' },
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
        description: 'Fast dispatch and delivery guarantees — 10 layout styles',
        defaultProps: {
            ...DEFAULT_COMMON,
            variant: 'ship-classic-card',
            paddingTop: 16,
            paddingBottom: 16,
            shippingText: '{{SHIPPING_TIME}} — Fast & Free UK Delivery',
            dispatchText: 'Same Day Dispatch Before 3pm',
            locationText: 'UK-Based Seller — Fully Tracked',
            bgColor: '#ffffff',
            textColor: '#1e1535',
            iconColor: '#16a34a',
            accentColor: '#16a34a',
            iconBg: '#f0fdf4',
            borderRadius: 8,
        } as ShippingInfoProps,
        toHtml(props, id) {
            const p = props as any
            const variantId = p.variant ?? 'ship-classic-card'
            return wrapBlock('shipping_info', id, getShippingInfoVariant(variantId).toHtml(p, id), p)
        },
    },

    {
        type: 'returns_policy',
        label: 'Returns Policy',
        category: 'eBay Specific',
        icon: 'rotate-ccw',
        description: 'White card with Lucide rotate-ccw icon + blue accent stripe',
        defaultProps: {
            ...DEFAULT_COMMON,
            paddingTop: 16,
            paddingBottom: 16,
            policyText: '{{RETURN_POLICY}}',
            showPeriod: true,
            periodText: '30-Day Free Returns',
            bgColor: '#ffffff',
            textColor: '#1e1535',
            accentColor: '#3b82f6',
            iconColor: '#3b82f6',
            iconBg: '#eff6ff',
            borderRadius: 8,
        } as ReturnsPolicyProps,
        toHtml(props, id) {
            const p = props as ReturnsPolicyProps
            const period = p.showPeriod
                ? `<strong>${p.periodText}</strong> &mdash; `
                : ''
            return wrapBlock('returns_policy', id,
                `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}border-radius:${p.borderRadius}px;border:1px solid #e5e7eb;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="4" style="width:4px;background-color:${p.accentColor ?? '#3b82f6'};border-radius:2px;">&nbsp;</td>
          <td style="padding:0 0 0 14px;vertical-align:middle;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="36" height="36" style="width:36px;height:36px;text-align:center;background-color:${p.iconBg ?? '#eff6ff'};color:${p.iconColor ?? '#3b82f6'};border-radius:8px;font-size:18px;line-height:36px;vertical-align:middle;">rotate-ccw</td>
                <td style="padding-left:12px;vertical-align:middle;">
                  <p style="margin:0 0 3px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${p.textColor};line-height:1.4;">${period}${p.periodText}</p>
                  <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#475569;line-height:1.5;">${p.policyText}</p>
                </td>
              </tr>
            </table>
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
            variant: 'authority-split',
        } as SellerInfoProps,
        toHtml(props, id) {
            const p = props as SellerInfoProps
            return _getSellerInfoVariant(p.variant ?? 'authority-split')?.toHtml(props, id) ?? ''
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
            accentColor: '#7530fb',
            linkUrl: '#',
            buttonText: 'Shop Now',
            ribbonText: 'LIMITED TIME — ENDS MIDNIGHT',
        } as CtaBannerProps,
        toHtml(props, id) {
            const p = props as CtaBannerProps
            return _getCtaBannerVariant(p.variant ?? 'ctab-trust-bar')?.toHtml(props, id) ?? ''
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
        description: 'Low stock / urgency callout banner — 10 layout styles',
        defaultProps: {
            ...DEFAULT_COMMON,
            variant: 'urgency-classic-pulse',
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
            const p = props as any
            const variantId = p.variant ?? 'urgency-classic-pulse'
            return wrapBlock('urgency_bar', id, getUrgencyBarVariant(variantId).toHtml(p, id), p)
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
            variant: 'button-solid',
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
            return wrapBlock('button_block', id, _getButtonVariant(p.variant ?? 'solid').toHtml(p, id))
        },
    },

    {
        type: 'rectangle',
        label: 'Rectangle',
        category: 'Conversion',
        icon: 'square',
        description: 'Shape container for background fills and callouts — 10 layout styles',
        defaultProps: {
            ...DEFAULT_COMMON,
            variant: 'rect-solid-fill',
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
            const p = props as any
            const variantId = p.variant ?? 'rect-solid-fill'
            return wrapBlock('rectangle', id, getRectangleVariant(variantId).toHtml(p, id), p)
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
            icon: 'columns-2',
            description: '4 equal columns for specs or features',
            defaultProps: {
                ...DEFAULT_COMMON,
                col1Content: CONTENT_PLACEHOLDER.replace('data-canvas-dropzone="content"', 'data-canvas-dropzone="col1Content"'),
                col2Content: CONTENT_PLACEHOLDER.replace('data-canvas-dropzone="content"', 'data-canvas-dropzone="col2Content"'),
                col3Content: CONTENT_PLACEHOLDER.replace('data-canvas-dropzone="content"', 'data-canvas-dropzone="col3Content"'),
                col4Content: CONTENT_PLACEHOLDER.replace('data-canvas-dropzone="content"', 'data-canvas-dropzone="col4Content"'),
                gap: 8,
                col1Bg: '#ffffff',
                col2Bg: '#ffffff',
                col3Bg: '#ffffff',
                col4Bg: '#ffffff',
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as FourColumnProps
                const rows = (p as any).rows && Array.isArray((p as any).rows) ? (p as any).rows : [{ col1Content: p.col1Content, col2Content: p.col2Content, col3Content: p.col3Content, col4Content: p.col4Content }]
                const pa4 = p as any
                const valign4 = pa4.colAlign === 'middle' ? 'middle' : pa4.colAlign === 'bottom' ? 'bottom' : 'top'
                const fw1 = pa4.customWidths ? (pa4.col1Width ?? 25) : 25
                const fw2 = pa4.customWidths ? (pa4.col2Width ?? 25) : 25
                const fw3 = pa4.customWidths ? (pa4.col3Width ?? 25) : 25
                const fw4 = pa4.customWidths ? (pa4.col4Width ?? 25) : 25
                const cp4 = pa4.colPadding ? `padding:${pa4.colPadding}px;` : ''
                const cr4 = pa4.colRadius ? `border-radius:${pa4.colRadius}px;` : ''
                const rowsHtml = rows.map((r: any, idx: number) => `
        <tr>
          <td width="${fw1}%" valign="${valign4}" style="padding-right:${(p.gap || 8) / 2}px;${cp4}${cr4}background-color:${pa4.col1Bg ?? 'transparent'}; ${idx > 0 ? 'padding-top:16px;' : ''}">${r.col1Content}</td>
          <td width="${fw2}%" valign="${valign4}" style="padding-left:${(p.gap || 8) / 2}px;padding-right:${(p.gap || 8) / 2}px;${cp4}${cr4}background-color:${pa4.col2Bg ?? 'transparent'}; ${idx > 0 ? 'padding-top:16px;' : ''}">${r.col2Content}</td>
          <td width="${fw3}%" valign="${valign4}" style="padding-left:${(p.gap || 8) / 2}px;padding-right:${(p.gap || 8) / 2}px;${cp4}${cr4}background-color:${pa4.col3Bg ?? 'transparent'}; ${idx > 0 ? 'padding-top:16px;' : ''}">${r.col3Content}</td>
          <td width="${fw4}%" valign="${valign4}" style="padding-left:${(p.gap || 8) / 2}px;${cp4}${cr4}background-color:${pa4.col4Bg ?? 'transparent'}; ${idx > 0 ? 'padding-top:16px;' : ''}">${r.col4Content}</td>
        </tr>
                `).join('')
                return wrapBlock('four_column' as BlockType, id,
                    `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${rowsHtml}
      </table>
    </td>
  </tr>
</table>`)
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
                    `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;"><tr><td style="height:${(p.paddingTop || 24) + (p.paddingBottom || 24)}px;background-color:${p.bgColor};font-size:1px;line-height:1px;">&nbsp;</td></tr></table>`)
            },
        },

        {
            type: 'border_box' as BlockType,
            label: 'Border Box',
            category: 'Layout' as BlockCategory,
            icon: 'square',
            description: 'Content inside a decorative border frame',
            defaultProps: {
                ...DEFAULT_COMMON,
                showBorder: true,
                borderWidth: 2,
                borderColor: '#7530fb',
                borderRadius: 8,
                content: 'Your content goes here inside this decorative border box.',
                textColor: '#1f1d2e',
                fontSize: 14,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                return wrapBlock('border_box' as BlockType, id,
                    `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;"><tr><td style="background-color:${p.bgColor};${pad(p)}border:${p.borderWidth || 2}px solid ${p.borderColor || '#7530fb'};border-radius:${p.borderRadius || 8}px;"><p style="margin:0;font-family:Arial,sans-serif;font-size:${p.fontSize || 14}px;color:${p.textColor || '#1f1d2e'};">${p.content || 'Your content goes here inside this decorative border box.'}</p></td></tr></table>`)
            },
        },

        {
            type: 'sidebar_layout' as BlockType,
            label: 'Sidebar Layout',
            category: 'Layout' as BlockCategory,
            icon: 'layout',
            description: '70/30 split — image left, text right with dropzones. Supports multi-row (add more rows for stacked sections).',
            defaultProps: {
                ...DEFAULT_COMMON,
                leftImage: `<div data-canvas-dropzone="leftImage" style="width:100%;cursor:pointer;">${IMAGE_PLACEHOLDER_SVG}</div>`,
                rightContent: CONTENT_PLACEHOLDER.replace('data-canvas-dropzone="content"', 'data-canvas-dropzone="rightContent"'),
                gap: 16,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                const leftHtml = p.leftImage || ''
                const rightHtml = p.rightContent || ''
                const leftWidth = p.imageWidth ?? 70
                const rightWidth = 100 - leftWidth
                return wrapBlock('sidebar_layout' as BlockType, id,
                    `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;">
  <tr>
    <td style="background-color:${p.bgColor};${pad(p)}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;">
        <tr>
          <td width="${leftWidth}%" valign="${p.colAlign === 'middle' ? 'middle' : p.colAlign === 'bottom' ? 'bottom' : 'top'}" style="padding-right:${(p.gap || 16) / 2}px;background-color:${p.imageBg ?? 'transparent'};border-radius:${p.imageRadius ?? 0}px;">
            <div style="width:100%;box-sizing:border-box;">${leftHtml}</div>
          </td>
          <td width="${rightWidth}%" valign="${p.colAlign === 'middle' ? 'middle' : p.colAlign === 'bottom' ? 'bottom' : 'top'}" style="padding-left:${(p.gap || 16) / 2}px;${p.contentPadding ? `padding:${p.contentPadding}px;` : ''}">
            <div style="width:100%;box-sizing:border-box;">${rightHtml}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`)
            },
        },

        // ── CONTENT (new) ────────────────────────────────────────────────────────

        {
            type: 'numbered_list' as BlockType,
            label: 'Numbered List',
            category: 'Content' as BlockCategory,
            icon: 'list',
            description: 'Step-by-step numbered instructions — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'num-classic-badge',
                items: [
                    'Step one — first instruction',
                    'Step two — second instruction',
                    'Step three — third instruction',
                ],
                bgColor: '#ffffff',
                textColor: '#1e1535',
                accentColor: '#7530fb',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 24,
                paddingRight: 24,
                fontSize: 15,
                lineHeight: 1.6,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? p.layoutStyle ?? 'num-classic-badge'
                return wrapBlock('numbered_list' as BlockType, id, getNumberedListVariant(variantId).toHtml(p, id), p)
            },
        },

        {
            type: 'quote_block' as BlockType,
            label: 'Quote Block',
            category: 'Content' as BlockCategory,
            icon: 'quote',
            description: 'Highlighted customer review, founder pledge or technical praise — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'qb-classic-accent-pillar',
                bgColor: '#f3eeff',
                quote: 'Excellent product, exactly as described. Fast delivery and great packaging.',
                quoteText: 'Excellent product, exactly as described. Fast delivery and great packaging.',
                text: 'Excellent product, exactly as described. Fast delivery and great packaging.',
                author: '— Verified Buyer',
                accentColor: '#7530fb',
                textColor: '#1f1d2e',
                paddingTop: 18,
                paddingBottom: 18,
                paddingLeft: 24,
                paddingRight: 24,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'qb-classic-accent-pillar'
                return wrapBlock('quote_block' as BlockType, id, getQuoteBlockVariant(variantId).toHtml(p, id), p)
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
                const p = props as CommonProps & { [key: string]: any }
                return wrapBlock('warning_box' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor ?? '#fef9c3'};${pad(p)}border:1px solid ${p.borderColor ?? '#fbbf24'};border-radius:8px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="32" valign="top" style="padding-right:10px;font-size:18px;color:${p.accentColor ?? '#f59e0b'};">&#9888;</td><td valign="top"><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${p.textColor ?? '#92400e'};">Please Read Before Buying</p><p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:${p.textColor ?? '#78350f'};line-height:1.6;">Please check compatibility before purchasing. Returns only accepted if unused and in original packaging.</p></td></tr></table></td></tr></table>`)
            },
        },

        {
            type: 'info_box' as BlockType,
            label: 'Info Box',
            category: 'Content' as BlockCategory,
            icon: 'info',
            description: 'Informational notice with icon — 5 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'info-classic-banner',
                title: 'Important Information',
                description: 'This item ships from a UK warehouse. All items are genuine. VAT invoice available on request.',
                bgColor: '#ffffff',
                textColor: '#1e40af',
                borderColor: '#ede9fe',
                iconColor: '#3b82f6',
                accentColor: '#2563eb',
                showBorder: true,
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 24,
                paddingRight: 24,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'info-classic-banner'
                return wrapBlock('info_box' as BlockType, id, getInfoBoxVariant(variantId).toHtml(p, id), p)
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
                const p = props as CommonProps & { [key: string]: any }
                const rows = [['Brand', '{{BRAND}}'], ['Model', '{{MPN}}'], ['Condition', '{{ITEM_CONDITION}}'], ['Weight', '{{WEIGHT}}'], ['Country', '{{ORIGIN}}']]
                const rowHtml = rows.map((r, i) =>
                    `<tr style="background-color:${i % 2 === 0 ? (p.rowAltBg ?? '#f8f7ff') : (p.headerBg ? '#fff' : '#fff')};"><td style="padding:8px 14px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${p.headerText ?? '#1e1535'};border:1px solid ${p.borderColor ?? '#ede9fe'};width:40%;">${r[0]}</td><td style="padding:8px 14px;font-family:Arial,sans-serif;font-size:13px;color:${p.textColor ?? '#6b7280'};border:1px solid ${p.borderColor ?? '#ede9fe'};">${r[1]}</td></tr>`
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
                const p = props as CommonProps & { [key: string]: any }
                const badges = ['&#10003; Genuine', '&#128230; UK Stock', '&#9733; Top Rated', '&#128260; Easy Returns']
                const cells = badges.map(b => `<td style="padding:4px 6px;"><span style="display:inline-block;padding:4px 12px;background-color:${p.badgeBg ?? '#f3eeff'};color:${p.badgeText ?? '#7530fb'};font-family:Arial,sans-serif;font-size:12px;font-weight:700;border-radius:100px;border:1px solid ${p.badgeBorder ?? '#ede9fe'};">${b}</span></td>`).join('')
                return wrapBlock('badge_row' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor};${pad(p)}"><table cellpadding="0" cellspacing="4" border="0"><tr>${cells}</tr></table></td></tr></table>`)
            },
        },

        // ── PRODUCT (new) ─────────────────────────────────────────────────────────

        {
            type: 'product_variants' as BlockType,
            label: 'Product Variants',
            category: 'Product' as BlockCategory,
            icon: 'layout-grid',
            description: 'Colour swatches and size options — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'swatches-sizes',
                colorCount: 6,
                color1: '#ef4444', colorName1: 'Red',
                color2: '#3b82f6', colorName2: 'Blue',
                color3: '#22c55e', colorName3: 'Green',
                color4: '#f59e0b', colorName4: 'Amber',
                color5: '#000000', colorName5: 'Black',
                color6: '#ffffff', colorName6: 'White',
                sizesText: 'XS,S,M,L,XL,XXL',
                showColourLabel: true,
                showSizeLabel: true,
                colourLabel: 'Colours:',
                sizeLabel: 'Sizes:',
                labelColor: '#1e1535',
                textColor: '#1f1d2e',
                swatchSize: 24,
                swatchShape: 'circle',
                swatchBorderColor: '#e5e7eb',
                pillStyle: 'outlined',
                accentColor: '#7530fb',
                selectedColorIndex: 0,
                selectedSizeIndex: 2,
                darkPanelBg: '#1e1535',
                unavailableSizes: 'L',
                badge1Icon: '🎨', badge1Text: '6 Colours',
                badge2Icon: '📏', badge2Text: '6 Sizes',
                badge3Icon: '🔄', badge3Text: 'Easy Returns',
                badge4Icon: '📦', badge4Text: 'Fast Dispatch',
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as unknown as ProductVariantsProps
                return _getProductVariantsVariant(p.variant ?? 'swatches-sizes').toHtml(p, id)
            },
        },

        {
            type: 'compatibility_table' as BlockType,
            label: 'Compatibility Table',
            category: 'Product' as BlockCategory,
            icon: 'check',
            description: 'Compatible models list — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'compat-classic-zebra-table',
                titleText: 'Compatible With:',
                items: [
                    { model: 'Model A', years: '2019–2023', status: true },
                    { model: 'Model B', years: '2020–2024', status: true },
                    { model: 'Model C Pro', years: 'All years', status: true },
                    { model: 'Model D Mini', years: '2021+', status: true },
                ],
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 24,
                paddingRight: 24,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'compat-classic-zebra-table'
                return wrapBlock('compatibility_table' as BlockType, id, _getCompatibilityTableVariant(variantId).toHtml(p, id))
            },
        },

        {
            type: 'condition_details' as BlockType,
            label: 'Condition Details',
            category: 'Product' as BlockCategory,
            icon: 'star',
            description: 'Graded condition explanation block — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'cd-cosmetic-grade-split',
                condition: 'Brand New',
                conditionNotes: '{{CONDITION_NOTES}}',
                heading: 'Condition: Brand New',
                bgColor: '#ffffff',
                accentColor: '#7530fb',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 24,
                paddingRight: 24,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'cd-cosmetic-grade-split'
                return wrapBlock('condition_details' as BlockType, id, _getConditionDetailsVariant(variantId).toHtml(p, id))
            },
        },

        {
            type: 'whats_in_the_box' as BlockType,
            label: "What's In The Box",
            category: 'Product' as BlockCategory,
            icon: 'package',
            description: 'Checklist of included items',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'simple-list',
                heading: "📦 What's In The Box",
                items: ['1x Main Unit', '1x Power Cable', '1x User Manual', '1x Warranty Card', '2x AAA Batteries'],
                headingColor: '#1e1535',
                bulletColor: '#16a34a',
                textColor: '#1f1d2e',
                accentColor: '#7530fb',
                darkBg: '#1e1535',
                darkText: '#ffffff',
                darkAccent: '#b8fa33',
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as unknown as import('./variants/whats_in_the_box.variants').WhatsInTheBoxProps
                const variant = _getWhatsInTheBoxVariant(p.variant ?? 'simple-list')
                return variant.toHtml(p, id)
            },
        },

        {
            type: 'key_features_grid' as BlockType,
            label: 'Key Features Grid',
            category: 'Product' as BlockCategory,
            icon: 'grid',
            description: 'Core specifications and feature highlights — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'feat-classic-cards-grid',
                heading: 'Key Product Features',
                subtitle: 'Engineered for uncompromising performance, durability, and seamless installation',
                features: [
                    { icon: '&#9889;', title: 'High Performance', text: 'Engineered for maximum efficiency' },
                    { icon: '&#128272;', title: 'Secure & Reliable', text: 'Built to last with premium materials' },
                    { icon: '&#127775;', title: 'Premium Quality', text: 'Rigorously tested before dispatch' },
                ],
                cardBg: '#f8f7ff',
                cardBorder: '#e9e3ff',
                iconColor: '#7530fb',
                titleColor: '#1e1535',
                accentColor: '#7530fb',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 24,
                paddingRight: 24,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'feat-classic-cards-grid'
                return wrapBlock('key_features_grid' as BlockType, id, _getKeyFeaturesVariant(variantId).toHtml(p, id))
            },
        },

        {
            type: 'product_comparison' as BlockType,
            label: 'Product Comparison',
            category: 'Product' as BlockCategory,
            icon: 'table',
            description: 'This vs competitors comparison table — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'comp-classic-header-table',
                headerBg: '#7530fb',
                headerText: '#ffffff',
                altRowBg: '#f8f7ff',
                borderColor: '#ede9fe',
                accentColor: '#7530fb',
                rows: [
                    { feature: 'Quality', ourValue: '★★★★★', competitorValue: '★★★' },
                    { feature: 'Warranty', ourValue: '2 Years', competitorValue: '6 Months' },
                    { feature: 'UK Stock', ourValue: '✓ Yes', competitorValue: 'X No' },
                    { feature: 'Returns', ourValue: '30 Days', competitorValue: '14 Days' },
                ],
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 24,
                paddingRight: 24,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'comp-classic-header-table'
                return wrapBlock('product_comparison' as BlockType, id, _getProductComparisonVariant(variantId).toHtml(p, id))
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
                const p = props as CommonProps & { variant?: string }
                return _getSingleImageVariant(p.variant ?? 'classic-frame').toHtml(p, id)
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
            defaultProps: {
                ...DEFAULT_COMMON,
                bgColor: '#f8f7ff',
                logo1Url: '',
                logo2Url: '',
                logo3Url: '',
                logo4Url: '',
                logo5Url: '',
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps & {
                    variant?: string
                    caption?: string
                    captionColor?: string
                    accentColor?: string
                    logo1Url?: string
                    logo2Url?: string
                    logo3Url?: string
                    logo4Url?: string
                    logo5Url?: string
                }
                return _getLogoBarVariant(p.variant ?? 'flat-row').toHtml(p, id)
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
                const p = props as CommonProps & { [key: string]: any }
                return wrapBlock('before_after' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor ?? '#ffffff'};${pad(p)}"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="48%" style="text-align:center;vertical-align:top;"><div style="background-color:${p.labelBg ?? '#f3f4f6'};border-radius:8px;padding:8px;"><p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:${p.labelText ?? '#6b7280'};text-transform:uppercase;letter-spacing:1px;">Before</p><img src="{{IMAGE_BEFORE}}" alt="Before" style="width:100%;height:auto;display:block;border-radius:4px;"></div></td><td width="4%" style="text-align:center;font-size:20px;color:#9ca3af;">&#8594;</td><td width="48%" style="text-align:center;vertical-align:top;"><div style="background-color:${p.labelBg ?? '#f0fdf4'};border-radius:8px;padding:8px;border:1px solid ${p.borderColor ?? '#bbf7d0'};"><p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:${p.labelText ?? '#16a34a'};text-transform:uppercase;letter-spacing:1px;">After</p><img src="{{IMAGE_AFTER}}" alt="After" style="width:100%;height:auto;display:block;border-radius:4px;"></div></td></tr></table></td></tr></table>`)
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
                const p = props as CommonProps & { [key: string]: any }
                return wrapBlock('dispatch_timer' as BlockType, id,
                    `<table width="700" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;max-width:700px;"><tr><td style="background-color:${p.bgColor ?? '#f0fdf4'};${pad(p)}border:1px solid ${p.borderColor ?? '#bbf7d0'};border-radius:8px;text-align:center;"><p style="margin:0 0 4px;font-size:24px;">&#9201;</p><p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:${p.textColor ?? '#166534'};">Order in the next <span style="color:${p.accentColor ?? '#dc2626'};">{{HOURS_LEFT}} hours</span> for Same Day Dispatch</p><p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:${p.textColor ?? '#16a34a'};">&#128230; Dispatched same working day if ordered by 2pm</p></td></tr></table>`)
            },
        },

        {
            type: 'bundle_deal' as BlockType,
            label: 'Bundle Deal',
            category: 'eBay Specific' as BlockCategory,
            icon: 'gift',
            description: 'Buy more save more offer block',
            defaultProps: {
                ...DEFAULT_COMMON,
                bgColor: '#1e1535',
                priceColor: '#ffffff',
                badgeColor: '#b8fa33',
                badgeText: '#1e1535',
                heading: '🎁 Bundle & Save',
                qty1Label: 'Buy 1',
                qty2Label: 'Buy 2',
                qty3Label: 'Buy 3+',
                save2Label: 'Save 10%',
                save3Label: 'Save 20%',
                variant: 'tri-tier-columns',
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps & {
                    heading?: string
                    priceColor?: string
                    badgeColor?: string
                    badgeText?: string
                    qty1Label?: string
                    qty2Label?: string
                    qty3Label?: string
                    save2Label?: string
                    save3Label?: string
                    variant?: string
                }
                return wrapBlock('bundle_deal' as BlockType, id,
                    _getBundleDealVariant(p.variant ?? 'tri-tier-columns').toHtml(p, id))
            },
        },

        {
            type: 'feedback_score' as BlockType,
            label: 'Feedback Score',
            category: 'eBay Specific' as BlockCategory,
            icon: 'star',
            description: 'Seller rating display and verified reputation — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'fb-classic-split-card',
                bgColor: '#f8f7ff',
                textColor: '#1e1535',
                starColor: '#f59e0b',
                feedbackScore: '{{SELLER_FEEDBACK}}',
                memberSince: '{{MEMBER_SINCE}}',
                heading: 'Top Rated eBay Seller',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 24,
                paddingRight: 24,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'fb-classic-split-card'
                return wrapBlock('feedback_score' as BlockType, id, getFeedbackScoreVariant(variantId).toHtml(p, id))
            },
        },

        {
            type: 'vat_notice' as BlockType,
            label: 'VAT Notice',
            category: 'eBay Specific' as BlockCategory,
            icon: 'file',
            description: 'VAT registered seller invoice notice — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'vat-classic-card',
                heading: 'VAT Registered Business',
                vatNumber: '{{VAT_NUMBER}}',
                companyNumber: 'Company Reg: {{COMPANY_NUMBER}}',
                text: 'Full VAT invoice included with your order.',
                bgColor: '#f8fafc',
                textColor: '#64748b',
                titleColor: '#1e1535',
                borderColor: '#e2e8f0',
                accentColor: '#059669',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 24,
                paddingRight: 24,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'vat-classic-card'
                return wrapBlock('vat_notice' as BlockType, id, getVatNoticeVariant(variantId).toHtml(p, id))
            },
        },

        {
            type: 'international_shipping' as BlockType,
            label: 'International Shipping',
            category: 'eBay Specific' as BlockCategory,
            icon: 'globe',
            description: 'Customs and import duty warning notice — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'is-classic-amber-notice',
                bgColor: '#fff7ed',
                borderColor: '#fed7aa',
                showBorder: true,
                heading: 'International Buyers — Import Duties Notice',
                text: "Import duties and taxes are not included in the price. These are the buyer's responsibility. Please check your country's customs rules before purchasing.",
                headingColor: '#c2410c',
                textColor: '#9a3412',
                accentColor: '#ea580c',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 24,
                paddingRight: 24,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'is-classic-amber-notice'
                return wrapBlock('international_shipping' as BlockType, id, getInternationalShippingVariant(variantId).toHtml(p, id), p)
            },
        },

        {
            type: 'authenticity_guarantee' as BlockType,
            label: 'Authenticity Guarantee',
            category: 'eBay Specific' as BlockCategory,
            icon: 'shield',
            description: 'Genuine product certificate and verified authenticity banner — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'auth-ebay-blue-official-shield',
                heading: '100% Authenticity Guaranteed',
                subText: 'Every item verified genuine. Sourced directly from authorised distributors.',
                points: [
                    { title: 'Official Supplier', sub: 'Direct authorized pipeline' },
                    { title: 'Anti-counterfeit Checked', sub: 'Multi-point inspection' },
                    { title: 'Money Back Guarantee', sub: '100% complete refund protection' },
                ],
                bgColor: '#0053a0',
                textColor: '#ffffff',
                accentColor: '#38bdf8',
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 24,
                paddingRight: 24,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'auth-ebay-blue-official-shield'
                return wrapBlock('authenticity_guarantee' as BlockType, id, _getAuthenticityGuaranteeVariant(variantId).toHtml(p, id))
            },
        },

        {
            type: 'condition_badge' as BlockType,
            label: 'Condition Badge',
            category: 'eBay Specific' as BlockCategory,
            icon: 'tag',
            description: 'Item condition and inspection verification badge — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'cond-inspected-grade-pill',
                condition: 'new',
                heading: 'Condition: Brand New',
                subText: 'Pristine item. All functions and cosmetic standards thoroughly verified.',
                bgColor: '#ffffff',
                textColor: '#0f172a',
                accentColor: '#16a34a',
                paddingTop: 14,
                paddingBottom: 14,
                paddingLeft: 18,
                paddingRight: 18,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'cond-inspected-grade-pill'
                return wrapBlock('condition_badge' as BlockType, id, _getConditionBadgeVariant(variantId).toHtml(p, id))
            },
        },

        {
            type: 'item_specifics' as BlockType,
            label: 'Item Specifics',
            category: 'eBay Specific' as BlockCategory,
            icon: 'list',
            description: 'Item specifics and technical specification table — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'is-dual-column-zebra-card',
                titleText: 'Item Specifics & Technical Data',
                rows: [
                    { key: 'Condition', value: '{{ITEM_CONDITION}}' },
                    { key: 'Brand', value: '{{BRAND}}' },
                    { key: 'Model', value: '{{MODEL}}' },
                    { key: 'MPN / Part #', value: '{{MPN}}' },
                    { key: 'EAN / UPC', value: '{{EAN}}' },
                    { key: 'Colour', value: '{{COLOUR}}' },
                    { key: 'Size / Dimensions', value: '{{SIZE}}' },
                    { key: 'Material', value: '{{MATERIAL}}' },
                ],
                bgColor: '#ffffff',
                keyColor: '#0f172a',
                headerBg: '#2563eb',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 20,
                paddingRight: 20,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'is-dual-column-zebra-card'
                return wrapBlock('item_specifics' as BlockType, id, _getItemSpecificsVariant(variantId).toHtml(p, id))
            },
        },

        // ── CONVERSION (new) ─────────────────────────────────────────────────────

        {
            type: 'money_back' as BlockType,
            label: 'Money Back Guarantee',
            category: 'Conversion' as BlockCategory,
            icon: 'shield',
            description: '30-day money back guarantee badge block — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                bgColor: '#f0fdf4',
                textColor: '#166534',
                borderColor: '#bbf7d0',
                accentColor: '#10b981',
                variant: 'mb-trust-shield-green',
                heading: '30-Day Money Back Guarantee',
                subText: 'Not satisfied? Return it for a full refund. No questions asked.',
                days: '30',
                badgeText: '100% BUYER PROTECTION',
                paddingTop: 18,
                paddingBottom: 18,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps & {
                    variant?: string
                    bgColor?: string
                    textColor?: string
                    borderColor?: string
                    accentColor?: string
                    heading?: string
                    subText?: string
                    days?: string
                    badgeText?: string
                }
                const variantId = p.variant ?? 'mb-trust-shield-green'
                return wrapBlock('money_back' as BlockType, id, _getMoneyBackVariant(variantId).toHtml(p, id))
            },
        },

        {
            type: 'free_shipping' as BlockType,
            label: 'Free Shipping Banner',
            category: 'Trust & Badges' as BlockCategory,
            icon: 'truck',
            description: 'High-converting free shipping and fast dispatch logistics banner',
            defaultProps: {
                ...DEFAULT_COMMON,
                bgColor: '#0f172a',
                textColor: '#ffffff',
                accentColor: '#f59e0b',
                variant: 'ship-express-courier-strip',
                heading: 'Fast & Free Domestic Shipping',
                subText: 'Orders placed before 2:00 PM EST ship the same business day.',
                badgeText: '⚡ SAME-DAY DISPATCH',
                carrier: 'USPS PRIORITY / FEDEX 2-DAY',
                dispatchTime: 'Same Day',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 22,
                paddingRight: 22,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'ship-express-courier-strip'
                return wrapBlock('free_shipping' as BlockType, id, _getFreeShippingVariant(variantId).toHtml(p, id))
            },
        },

        {
            type: 'why_buy_from_us' as BlockType,
            label: 'Why Buy From Us',
            category: 'Conversion' as BlockCategory,
            icon: 'star',
            description: 'Highlight your unique selling points — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'why-classic-centered',
                title: 'Why Shop With Us?',
                reasons: [
                    { icon: 'shield-check', title: '100% Authentic Stock', desc: 'All items genuine & verified', text: 'All items genuine & verified' },
                    { icon: 'truck', title: 'Same-Day Fast Dispatch', desc: 'Orders before 2pm ship today', text: 'Orders before 2pm ship today' },
                    { icon: 'rotate-ccw', title: '30-Day Hassle-Free Returns', desc: '30-day hassle-free returns', text: '30-day hassle-free returns' },
                ],
                points: [
                    { icon: 'shield-check', title: '100% Authentic Stock', desc: 'All items genuine & verified', text: 'All items genuine & verified' },
                    { icon: 'truck', title: 'Same-Day Fast Dispatch', desc: 'Orders before 2pm ship today', text: 'Orders before 2pm ship today' },
                    { icon: 'rotate-ccw', title: '30-Day Hassle-Free Returns', desc: '30-day hassle-free returns', text: '30-day hassle-free returns' },
                ],
                titleColor: '#1e1535',
                descColor: '#6b7280',
                iconColor: '#7530fb',
                paddingTop: 24,
                paddingBottom: 24,
            } as unknown as WhyBuyFromUsProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'why-classic-centered'
                // Two-way synchronization: If the Icon Library updated `points`, sync to `reasons`. If it updated `reasons`, sync to `points`.
                if (Array.isArray(p.points) && Array.isArray(p.reasons)) {
                    p.points.forEach((pt: any, idx: number) => {
                        if (p.reasons[idx] && pt.icon && pt.icon !== p.reasons[idx].icon) {
                            p.reasons[idx].icon = pt.icon
                        } else if (p.reasons[idx] && p.reasons[idx].icon && p.reasons[idx].icon !== pt.icon) {
                            pt.icon = p.reasons[idx].icon
                        }
                    })
                } else if (Array.isArray(p.points) && !Array.isArray(p.reasons)) {
                    p.reasons = p.points
                } else if (Array.isArray(p.reasons) && !Array.isArray(p.points)) {
                    p.points = p.reasons
                }
                return wrapBlock('why_buy_from_us' as BlockType, id, getWhyBuyFromUsVariant(variantId).toHtml(p, id), p)
            },
        },

        {
            type: 'satisfaction_guarantee' as BlockType,
            label: 'Satisfaction Guarantee',
            category: 'Conversion' as BlockCategory,
            icon: 'star',
            description: 'Buyer trust and satisfaction pledge banner — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'sg-golden-crest-emblem',
                heading: '100% Satisfaction Guaranteed',
                subText: 'Every purchase is backed by our direct merchant warranty. If you are not completely delighted, we will make it right.',
                badgeText: 'HERITAGE BUYER PROTECTION',
                bgColor: '#090d16',
                textColor: '#ffffff',
                accentColor: '#d4af37',
                paddingTop: 18,
                paddingBottom: 18,
                paddingLeft: 24,
                paddingRight: 24,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'sg-golden-crest-emblem'
                return wrapBlock('satisfaction_guarantee' as BlockType, id, _getSatisfactionGuaranteeVariant(variantId).toHtml(p, id))
            },
        },

        {
            type: 'limited_time_offer' as BlockType,
            label: 'Limited Time Offer',
            category: 'Conversion' as BlockCategory,
            icon: 'clock',
            description: 'Urgent promotional and flash sale banner — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'lto-flash-sale-ticker',
                dealTitle: '⚡ FLASH SALE — SPECIAL PROMOTIONAL EVENT',
                dealSubtext: 'Instant markdown applied at checkout. Quantities are strictly limited.',
                badgeText: 'ENDS SOON',
                discountText: 'UP TO 50% OFF',
                expiryText: 'Ends Sunday at Midnight EST',
                bgColor: '#dc2626',
                textColor: '#ffffff',
                accentColor: '#fef08a',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 22,
                paddingRight: 22,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'lto-flash-sale-ticker'
                return wrapBlock('limited_time_offer' as BlockType, id, _getLimitedTimeOfferVariant(variantId).toHtml(p, id))
            },
        },

        // ── HEADER & FOOTER ──────────────────────────────────────────────────────

        {
            type: 'store_header' as BlockType,
            label: 'Store Header',
            category: 'Header & Footer' as BlockCategory,
            icon: 'store',
            description: 'Logo, store name and tagline banner — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'sh-classic-banner',
                storeName: '{{SELLER_NAME}}',
                tagline: 'Quality products · Fast dispatch · Trusted eBay seller',
                bgColor: '#7530fb',
                textColor: '#ffffff',
                accentColor: '#b8fa33',
                fontSize: 24,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'sh-classic-banner'
                return wrapBlock('store_header' as BlockType, id, getStoreHeaderVariant(variantId).toHtml(p, id), p)
            },
        },

        {
            type: 'seasonal_banner' as BlockType,
            label: 'Seasonal Banner',
            category: 'Header & Footer' as BlockCategory,
            icon: 'star',
            description: 'Seasonal sale themed header banner — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                bgColor: '#dc2626',
                textColor: '#ffffff',
                accentColor: '#fef08a',
                variant: 'seasonal-festive-ribbon',
                bannerTitle: 'Seasonal Sale — Up To 50% Off!',
                bannerSubtitle: 'Limited time only · While stocks last',
                badgeText: 'HOLIDAY SPECIAL',
                icon: '🎁 🎄 🎁',
                discountText: '50% OFF',
                discountSub: 'STOREWIDE',
                hours: '12',
                minutes: '45',
                seconds: '30',
                paddingTop: 20,
                paddingBottom: 20,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps & {
                    variant?: string
                    bgColor?: string
                    textColor?: string
                    accentColor?: string
                    bannerTitle?: string
                    bannerSubtitle?: string
                    badgeText?: string
                    icon?: string
                    discountText?: string
                    discountSub?: string
                    hours?: string
                    minutes?: string
                    seconds?: string
                }
                const variantId = p.variant ?? 'seasonal-festive-ribbon'
                return wrapBlock('seasonal_banner' as BlockType, id, _getSeasonalBannerVariant(variantId).toHtml(p, id))
            },
        },

        {
            type: 'store_footer' as BlockType,
            label: 'Store Footer',
            category: 'Header & Footer' as BlockCategory,
            icon: 'layout',
            description: 'Footer block with links and copyright',
            defaultProps: {
                ...DEFAULT_COMMON,
                bgColor: '#1e1535',
                textColor: '#ffffff',
                variant: 'classic-dark-band',
                sellerName: '{{SELLER_NAME}}',
                copyright: '© Trusted Seller · All rights reserved',
                link1Text: 'All Listings',
                link1Url: '#',
                link2Text: 'About Us',
                link2Url: '#',
                link3Text: 'Feedback',
                link3Url: '#',
                link4Text: 'Returns Policy',
                link4Url: '#',
                link5Text: 'Contact Us',
                link5Url: '#',
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps & {
                    variant?: string
                    bgColor?: string
                    textColor?: string
                    linkColor?: string
                    sellerName?: string
                    copyright?: string
                    link1Text?: string
                    link1Url?: string
                    link2Text?: string
                    link2Url?: string
                    link3Text?: string
                    link3Url?: string
                    link4Text?: string
                    link4Url?: string
                    link5Text?: string
                    link5Url?: string
                }
                const variantId = p.variant ?? 'classic-dark-band'
                return wrapBlock('store_footer' as BlockType, id, _getStoreFooterVariant(variantId).toHtml(p, id))
            },
        },


        {
            type: 'breadcrumb_bar' as BlockType,
            label: 'Breadcrumb Bar',
            category: 'Header & Footer' as BlockCategory,
            icon: 'chevron-right',
            description: 'Store > Category > Item navigation bar — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'bb-classic-inline',
                bgColor: '#f8f7ff',
                textColor: '#1e1535',
                separatorColor: '#7530fb',
                accentColor: '#7530fb',
                storeName: 'Trusted Seller',
                category: '{{ITEM_CATEGORY}}',
                productTitle: 'Premium Product Sample Listing',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 24,
                paddingRight: 24,
                showBorder: false,
                borderColor: '#ede9fe',
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'bb-classic-inline'
                return wrapBlock('breadcrumb_bar' as BlockType, id, getBreadcrumbBarVariant(variantId).toHtml(p, id), p)
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
                const p = props as CommonProps & { [key: string]: any }
                const text = p.text || '{{PRODUCT_TITLE}}'
                const textColor = p.textColor || p.color || '#1e1535'
                const accentColor = p.accentColor || '#7530fb'
                const fontSize = p.fontSize || 28
                const align = p.align || 'left'

                return wrapBlock('page_title' as BlockType, id,
                    `<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%;margin:0 auto;box-sizing:border-box;"><tr><td style="background-color:${p.bgColor};${pad(p)}box-sizing:border-box;"><h1 style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:700;color:${textColor};line-height:1.2;text-align:${align};">${text}</h1><div style="width:60px;height:4px;background-color:${accentColor};border-radius:2px;${align === 'center' ? 'margin:0 auto;' : align === 'right' ? 'margin-left:auto;' : ''}"></div></td></tr></table>`)
            },
        },

        {
            type: 'section_label' as BlockType,
            label: 'Section Label',
            category: 'Typography' as BlockCategory,
            icon: 'type',
            description: 'Small uppercase category label with accent — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'sl-classic-pill-capsule',
                text: '{{SECTION_LABEL}}',
                color: '#7530fb',
                textColor: '#1e1535',
                accentColor: '#7530fb',
                bgColor: '#ffffff',
                fontSize: 11,
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 24,
                paddingRight: 24,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'sl-classic-pill-capsule'
                return wrapBlock('section_label' as BlockType, id, getSectionLabelVariant(variantId).toHtml(p, id))
            },
        },

        {
            type: 'pull_quote' as BlockType,
            label: 'Pull Quote',
            category: 'Typography' as BlockCategory,
            icon: 'quote',
            description: 'Highlighted quotation, merchant statement or customer voice — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'pq-classic-serif-centered',
                quoteText: 'Quality is not an act, it is a habit. Every item we sell reflects our commitment to excellence.',
                author: '— {{SELLER_NAME}}',
                bgColor: '#ffffff',
                textColor: '#1e1535',
                accentColor: '#7530fb',
                quoteColor: '#ede9fe',
                fontSize: 18,
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 24,
                paddingRight: 24,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'pq-classic-serif-centered'
                return wrapBlock('pull_quote' as BlockType, id, getPullQuoteVariant(variantId).toHtml(p, id))
            },
        },

        {
            type: 'highlight_text' as BlockType,
            label: 'Highlight Text',
            category: 'Typography' as BlockCategory,
            icon: 'type',
            description: 'Coloured background text callout — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'ht-classic-neon-strip',
                bgColor: '#b8fa33',
                textColor: '#1e1535',
                text: '{{HIGHLIGHT_TEXT}}',
                fontSize: 15,
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 24,
                paddingRight: 24,
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'ht-classic-neon-strip'
                return wrapBlock('highlight_text' as BlockType, id, getHighlightTextVariant(variantId).toHtml(p, id), p)
            },
        },

        {
            type: 'price_tag' as BlockType,
            label: 'Price Tag',
            category: 'Typography' as BlockCategory,
            icon: 'tag',
            description: 'Decorative was/now price display — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                bgColor: '#ffffff',
                priceColor: '#1e1535',
                strikeColor: '#94a3b8',
                badgeColor: '#dc2626',
                badgeTextColor: '#ffffff',
                accentColor: '#1e1535',
                itemPrice: '{{ITEM_PRICE}}',
                originalPrice: '{{ORIGINAL_PRICE}}',
                discountPercent: '{{DISCOUNT_PERCENT}}',
                discountAmount: '{{DISCOUNT_AMOUNT}}',
                variant: 'classic-strike',
            } as unknown as BlockProps,
            toHtml(props, id) {
                const p = props as CommonProps & {
                    itemPrice?: string
                    originalPrice?: string
                    discountPercent?: string
                    discountAmount?: string
                    priceColor?: string
                    strikeColor?: string
                    badgeColor?: string
                    badgeTextColor?: string
                    accentColor?: string
                    variant?: string
                }
                return wrapBlock('price_tag' as BlockType, id,
                    _getPriceTagVariant(p.variant ?? 'classic-strike').toHtml(p, id))
            },
        },

        // ── NEW PROFESSIONAL CONTENT BLOCKS ─────────────────────────────────

        {
            type: 'faq_block' as BlockType,
            label: 'FAQ Section',
            category: 'Content' as BlockCategory,
            icon: 'help-circle',
            description: 'Frequently asked questions — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'faq-classic-stacked',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 24,
                paddingRight: 24,
                faqs: [
                    { question: 'What is the warranty?', answer: 'All items come with a 30-day money back guarantee.' },
                    { question: 'How long does shipping take?', answer: 'Most orders ship within 24 hours.' },
                    { question: 'Do you accept returns?', answer: 'Yes, we accept returns within 30 days.' },
                ],
                questionBg: '#f8f7ff',
                questionColor: '#1e1535',
                answerColor: '#374151',
                chevronColor: '#7530fb',
                borderColor: '#ede9fe',
            } as unknown as FAQBlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'faq-classic-stacked'
                return wrapBlock('faq_block' as BlockType, id, getFaqBlockVariant(variantId).toHtml(p, id), p)
            },
        },

        {
            type: 'testimonial_block' as BlockType,
            label: 'Testimonials',
            category: 'Content' as BlockCategory,
            icon: 'quote',
            description: 'Customer reviews and star ratings — 10 layout styles',
            defaultProps: {
                ...DEFAULT_COMMON,
                variant: 'test-classic-grid',
                paddingTop: 20,
                paddingBottom: 20,
                testimonials: [
                    { text: 'Amazing product! Exactly as described.', author: 'John D.', rating: 5 },
                    { text: 'Fast shipping and great quality.', author: 'Sarah M.', rating: 4 },
                    { text: 'Highly recommend this seller!', author: 'Mike T.', rating: 5 },
                ],
                textColor: '#1e1535',
                authorColor: '#7530fb',
                starColor: '#f59e0b',
            } as TestimonialBlockProps,
            toHtml(props, id) {
                const p = props as any
                const variantId = p.variant ?? 'test-classic-grid'
                return wrapBlock('testimonial_block' as BlockType, id, getTestimonialsVariant(variantId).toHtml(p, id), p)
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

    // ── Color Palette ─────────────────────────────────────────────────────────
    palette: string[]            // saved brand swatches (max 10)
}

export const DEFAULT_CANVAS_SETTINGS: CanvasSettings = {
    maxWidth: 1000,
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

    // Color palette — pre-seeded with brand colors
    palette: ['#7530fb', '#b8fa33', '#1e1535', '#ffffff', '#6b7280'],
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
