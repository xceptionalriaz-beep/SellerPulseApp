// app/dashboard/listing-generator/types/listing.types.ts
// ─────────────────────────────────────────────────────────────
// Riazify — Listing Studio
// All TypeScript types for the Listing Generator tool.
// Matches the listing_drafts, listing_templates, listing_photos,
// bulk_upload_jobs, dropship_suppliers, dropship_products,
// dropship_price_rules, dropship_price_history,
// and dropship_stock_alerts Supabase tables.
// ─────────────────────────────────────────────────────────────

// ── Shared ───────────────────────────────────────────────────

export type Json = string | number | boolean | null | Record<string, unknown> | Json[]

// ── Seller Types ─────────────────────────────────────────────
// Defines HOW the seller is listing the product

export type SellerType =
    | 'own_stock'    // Seller owns the item (used, new, vintage)
    | 'wholesale'    // Bought in bulk from wholesaler
    | 'retail_arb'  // Retail arbitrage (Argos, Tesco, etc.)
    | 'dropship'    // Dropshipping from supplier
    | 'pod'         // Print on demand (Printful, Printify)
    | 'reseller'    // Thrift/vintage/charity shop reseller

// ── Source Platforms ─────────────────────────────────────────
// Which platform the product is sourced from

export type SourcePlatform =
    // Chinese suppliers
    | 'aliexpress'
    | 'cj_dropshipping'
    | 'dhgate'
    | 'banggood'
    | 'alibaba'
    | 'temu'
    // US retail
    | 'amazon'
    | 'amazon_uk'
    | 'walmart'
    | 'home_depot'
    | 'wayfair'
    | 'costco'
    | 'target'
    // UK retail
    | 'argos'
    // Print on demand
    | 'printful'
    | 'printify'
    | 'redbubble'
    // Other
    | 'etsy'
    | 'own'
    | 'wholesale_supplier'
    | 'other'

// ── Listing Status ───────────────────────────────────────────

export type ListingStatus =
    | 'draft'      // Being worked on, not ready
    | 'ready'      // Completed, ready to publish
    | 'published'  // Live on eBay
    | 'ended'      // Listing ended/sold
    | 'scheduled'  // Scheduled to go live

// ── VeRO Status ──────────────────────────────────────────────

export type VeroStatus =
    | 'unchecked'  // Not checked yet
    | 'clear'      // No VeRO brands found
    | 'warning'    // Possible VeRO brand detected
    | 'flagged'    // Confirmed VeRO brand detected

// ── Condition ────────────────────────────────────────────────

export type ItemCondition =
    | 'New'
    | 'New with tags'
    | 'New without tags'
    | 'New with defects'
    | 'Used - Like New'
    | 'Used - Good'
    | 'Used - Acceptable'
    | 'For parts or not working'

// ── Shipping ─────────────────────────────────────────────────

export type ShippingCarrier =
    | 'royal_mail'
    | 'evri'
    | 'dpd'
    | 'hermes'
    | 'parcelforce'
    | 'ups'
    | 'fedex'
    | 'collect_plus'
    | 'other'

export type ShippingType =
    | 'fixed'       // Fixed price shipping
    | 'free'        // Free shipping
    | 'calculated'  // Calculated by buyer location

export type DispatchDays = 0 | 1 | 2 | 3 | 4 | 5

export type ReturnsPolicy =
    | '30_day_buyer_pays'
    | '30_day_seller_pays'
    | '60_day_buyer_pays'
    | '60_day_seller_pays'
    | 'no_returns'

// ── Markup Rule Type ─────────────────────────────────────────

export type MarkupType = 'percentage' | 'fixed'

// ── Rounding Rule ────────────────────────────────────────────

export type RoundingRule =
    | 'nearest_99'   // £9.99, £19.99
    | 'nearest_95'   // £9.95, £19.95
    | 'nearest_50'   // £9.50, £19.50
    | 'exact'        // No rounding

// ── Bulk Upload Status ───────────────────────────────────────

export type BulkJobStatus =
    | 'pending'     // Waiting to start
    | 'processing'  // Currently processing
    | 'done'        // Completed successfully
    | 'failed'      // Failed with errors
    | 'partial'     // Completed with some errors

// ── Supplier Connection Status ───────────────────────────────

export type SupplierConnectionStatus =
    | 'connected'
    | 'disconnected'
    | 'error'
    | 'pending'

// ── Stock Alert Type ─────────────────────────────────────────

export type StockAlertType =
    | 'out_of_stock'   // Supplier went OOS
    | 'low_stock'      // Supplier stock low
    | 'price_increase' // Supplier price went up
    | 'price_decrease' // Supplier price went down
    | 'listing_at_risk'// Margin now negative

export type AlertSeverity = 'info' | 'warning' | 'critical'

// ─────────────────────────────────────────────────────────────
// CORE INTERFACES
// ─────────────────────────────────────────────────────────────

// ── Listing Photo ────────────────────────────────────────────

export interface ListingPhoto {
    id: string
    listing_id: string
    user_id: string
    original_url: string
    processed_url: string | null
    thumbnail_url: string | null
    bg_removed: boolean
    bg_removed_at: string | null
    is_main: boolean
    sort_order: number
    file_name: string | null
    file_size: number | null
    width: number | null
    height: number | null
    mime_type: string
    created_at: string
    updated_at: string
}

// ── Health Score Breakdown ───────────────────────────────────

export interface HealthBreakdown {
    title_score: number        // 0-20 pts — length + keywords
    description_score: number  // 0-20 pts — length + formatting
    photo_score: number        // 0-20 pts — count + quality
    specifics_score: number    // 0-20 pts — mandatory fields filled
    pricing_score: number      // 0-10 pts — margin > 0
    shipping_score: number     // 0-10 pts — shipping set up
    total: number              // 0-100
    grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F'
}

// ── Shipping Details ─────────────────────────────────────────

export interface ShippingDetails {
    carrier: ShippingCarrier | null
    service: string | null
    type: ShippingType
    cost: number
    free_shipping: boolean
    dispatch_days: DispatchDays
    returns_policy: ReturnsPolicy
    estimated_delivery: string | null
}

// ── Pricing Details ──────────────────────────────────────────

export interface PricingDetails {
    sell_price: number
    buy_price: number | null
    shipping_cost: number
    ebay_fee: number
    payment_fee: number
    total_fees: number
    net_profit: number
    margin: number
    roi: number
    vat_registered: boolean
    best_offer_enabled: boolean
    best_offer_accept: number | null
    best_offer_decline: number | null
}

// ── Item Specifics ───────────────────────────────────────────

export interface ItemSpecific {
    name: string
    value: string
    is_mandatory: boolean
    is_filled: boolean
}

// ─────────────────────────────────────────────────────────────
// LISTING DRAFT
// Matches listing_drafts table
// ─────────────────────────────────────────────────────────────

export interface ListingDraft {
    id: string
    user_id: string

    // SELLER TYPE
    seller_type: SellerType
    source_platform: SourcePlatform | null

    // STEP 1 — Product & SEO
    product_name: string | null
    category: string | null
    category_id: string | null
    condition: ItemCondition | null
    sku: string | null
    item_specifics: Record<string, string>

    // STEP 2 — Title
    title: string | null
    title_score: number
    title_keywords: string[]

    // STEP 3 — Description
    description_html: string | null
    description_text: string | null
    template_id: string | null

    // STEP 4 — Pricing
    sell_price: number | null
    buy_price: number | null
    shipping_cost: number
    ebay_fee: number
    payment_fee: number
    total_fees: number
    net_profit: number
    margin: number
    roi: number
    vat_registered: boolean
    best_offer_enabled: boolean
    best_offer_accept: number | null
    best_offer_decline: number | null
    quantity: number
    out_of_stock_option: boolean

    // STEP 5 — Shipping
    shipping_carrier: ShippingCarrier | null
    shipping_service: string | null
    shipping_type: ShippingType
    free_shipping: boolean
    dispatch_days: DispatchDays
    returns_policy: ReturnsPolicy

    // PHOTOS
    photos: ListingPhoto[]
    main_photo_url: string | null
    photo_count: number

    // HEALTH & RISK
    health_score: number
    health_breakdown: HealthBreakdown | null
    vero_status: VeroStatus
    vero_brands_found: string[]
    vero_checked_at: string | null

    // DROPSHIP FIELDS
    supplier_url: string | null
    supplier_product_id: string | null
    supplier_price: number | null
    supplier_currency: string
    supplier_images: string[]
    supplier_variants: SupplierVariant[]
    supplier_stock: number | null
    supplier_rating: number | null
    supplier_shipping_days: number | null
    markup_percentage: number | null
    markup_rule_id: string | null
    auto_reprice: boolean
    stock_sync: boolean
    last_supplier_check: string | null

    // WHOLESALE FIELDS
    cost_per_unit: number | null
    units_bought: number | null
    wholesale_moq: number | null

    // RETAIL ARB FIELDS
    purchase_location: string | null
    purchase_date: string | null
    receipt_price: number | null

    // POD FIELDS
    pod_provider: string | null
    pod_product_id: string | null
    pod_variant_id: string | null
    pod_design_url: string | null

    // RESELLER FIELDS
    item_provenance: string | null
    sourced_from: string | null

    // STATUS
    status: ListingStatus
    current_step: number
    published_at: string | null
    ebay_listing_id: string | null
    ebay_item_url: string | null

    // EXPORT
    exported_csv_at: string | null
    bulk_job_id: string | null

    // TIMESTAMPS
    created_at: string
    updated_at: string
    last_viewed_at: string
}

// ── Insert type (for creating new drafts) ────────────────────

export type ListingDraftInsert = Partial<Omit<ListingDraft, 'id' | 'created_at' | 'updated_at'>> & {
    user_id: string
    seller_type: SellerType
}

// ── Update type ──────────────────────────────────────────────

export type ListingDraftUpdate = Partial<Omit<ListingDraft, 'id' | 'user_id' | 'created_at'>>

// ─────────────────────────────────────────────────────────────
// LISTING TEMPLATE
// Matches listing_templates table
// ─────────────────────────────────────────────────────────────

export interface ListingTemplate {
    id: string
    user_id: string | null
    name: string
    description: string | null
    category: string | null
    category_id: string | null
    description_html: string | null
    description_text: string | null
    item_specifics: Record<string, string>
    shipping_json: Partial<ShippingDetails>
    variables: string[]
    is_system: boolean
    is_shared: boolean
    thumbnail_url: string | null
    use_count: number
    last_used_at: string | null
    created_at: string
    updated_at: string
}

// ─────────────────────────────────────────────────────────────
// BULK UPLOAD JOB
// Matches bulk_upload_jobs table
// ─────────────────────────────────────────────────────────────

export interface BulkUploadError {
    row: number
    field: string | null
    message: string
}

export interface BulkUploadJob {
    id: string
    user_id: string
    file_name: string
    file_type: 'csv' | 'xlsx'
    file_size: number | null
    total_rows: number
    processed_rows: number
    success_count: number
    error_count: number
    skipped_count: number
    column_map: Record<string, string>
    errors_json: BulkUploadError[]
    status: BulkJobStatus
    created_at: string
    started_at: string | null
    completed_at: string | null
}

// ── Column map for bulk upload ────────────────────────────────

export interface ColumnMapping {
    csv_column: string         // Column name in user's CSV
    ebay_field: string         // eBay field it maps to
    is_required: boolean       // Is this field required?
    is_mapped: boolean         // Has it been mapped?
    sample_value: string | null // First row sample value
}

// ─────────────────────────────────────────────────────────────
// DROPSHIP SUPPLIER
// Matches dropship_suppliers table
// ─────────────────────────────────────────────────────────────

export interface DropshipSupplier {
    id: string
    user_id: string
    platform: SourcePlatform
    display_name: string
    platform_logo_url: string | null
    region: string
    is_connected: boolean
    api_key: string | null
    api_secret: string | null
    access_token: string | null
    account_email: string | null
    products_imported: number
    active_listings: number
    total_orders: number
    last_synced_at: string | null
    last_tested_at: string | null
    connection_status: SupplierConnectionStatus
    default_markup: number
    auto_reprice: boolean
    stock_sync: boolean
    sync_frequency: 'hourly' | 'daily' | 'weekly'
    created_at: string
    updated_at: string
}

// ─────────────────────────────────────────────────────────────
// DROPSHIP PRODUCT
// Matches dropship_products table
// ─────────────────────────────────────────────────────────────

export interface SupplierVariant {
    id: string
    name: string
    value: string
    price: number | null
    stock: number | null
    sku: string | null
    image_url: string | null
}

export interface DropshipProduct {
    id: string
    user_id: string
    supplier_id: string | null
    platform: SourcePlatform
    supplier_url: string
    supplier_product_id: string | null
    supplier_sku: string | null
    supplier_title: string | null
    supplier_description: string | null
    supplier_images: string[]
    supplier_variants: SupplierVariant[]
    supplier_category: string | null
    supplier_brand: string | null
    supplier_rating: number | null
    supplier_reviews: number
    supplier_price: number | null
    supplier_currency: string
    supplier_price_gbp: number | null
    shipping_cost: number
    shipping_days: number | null
    shipping_from: string | null
    supplier_stock: number
    is_in_stock: boolean
    low_stock_threshold: number
    ebay_title: string | null
    ebay_description: string | null
    ebay_category: string | null
    ebay_item_specifics: Record<string, string>
    suggested_price_gbp: number | null
    markup_applied: number | null
    linked_listing_id: string | null
    is_listed: boolean
    listed_at: string | null
    last_price_check_at: string | null
    last_stock_check_at: string | null
    price_changed: boolean
    stock_changed: boolean
    imported_at: string
    updated_at: string
}

// ─────────────────────────────────────────────────────────────
// DROPSHIP PRICE RULE
// Matches dropship_price_rules table
// ─────────────────────────────────────────────────────────────

export interface PriceRangeRule {
    min_price: number
    max_price: number
    markup_type: MarkupType
    markup_value: number
}

export interface DropshipPriceRule {
    id: string
    user_id: string
    rule_name: string
    platform: SourcePlatform | null
    is_default: boolean
    markup_type: MarkupType
    markup_value: number
    min_profit_gbp: number
    min_margin_pct: number
    currency_from: string
    currency_to: string
    rounding_rule: RoundingRule
    include_shipping: boolean
    include_ebay_fee: boolean
    vat_registered: boolean
    range_rules: PriceRangeRule[]
    created_at: string
    updated_at: string
}

// ─────────────────────────────────────────────────────────────
// DROPSHIP PRICE HISTORY
// Matches dropship_price_history table
// ─────────────────────────────────────────────────────────────

export interface DropshipPriceHistory {
    id: string
    product_id: string
    user_id: string
    old_price: number | null
    new_price: number | null
    old_price_gbp: number | null
    new_price_gbp: number | null
    price_diff: number | null
    percentage_change: number | null
    currency: string
    old_ebay_price: number | null
    new_ebay_price: number | null
    old_margin: number | null
    new_margin: number | null
    action_taken: string
    auto_repriced: boolean
    listing_ended: boolean
    changed_at: string
}

// ─────────────────────────────────────────────────────────────
// DROPSHIP STOCK ALERT
// Matches dropship_stock_alerts table
// ─────────────────────────────────────────────────────────────

export interface DropshipStockAlert {
    id: string
    user_id: string
    product_id: string
    listing_id: string | null
    alert_type: StockAlertType
    severity: AlertSeverity
    title: string
    message: string | null
    old_value: string | null
    new_value: string | null
    platform: SourcePlatform | null
    action_required: string | null
    action_taken: string | null
    is_read: boolean
    is_resolved: boolean
    resolved_at: string | null
    auto_actioned: boolean
    created_at: string
}

// ─────────────────────────────────────────────────────────────
// PLAN LIMITS (listing-related fields only)
// ─────────────────────────────────────────────────────────────

export interface ListingPlanLimits {
    has_listing_generator: boolean
    has_bulk_listing: boolean
    has_listing_templates: boolean
    max_listing_drafts: number        // -1 = unlimited
    max_listing_generations: number   // -1 = unlimited
    max_bulk_listings: number         // -1 = unlimited
    has_dropship_import: boolean
    has_price_monitor: boolean
    has_stock_sync: boolean
    has_pod_integration: boolean
    has_auto_reprice: boolean
    max_supplier_imports: number      // -1 = unlimited
    max_monitored_products: number    // -1 = unlimited
    max_price_rules: number           // -1 = unlimited
    has_aliexpress: boolean
    has_cj_dropshipping: boolean
    has_amazon_import: boolean
    has_walmart_import: boolean
    has_dhgate: boolean
    has_banggood: boolean
    has_uk_suppliers: boolean
}

// ─────────────────────────────────────────────────────────────
// UI STATE TYPES
// Used in components, not in DB
// ─────────────────────────────────────────────────────────────

// ── Wizard Step ──────────────────────────────────────────────

export type WizardStep = 1 | 2 | 3 | 4

export interface WizardStepConfig {
    id: WizardStep
    label: string
    description: string
    icon: string
    isComplete: boolean
    isActive: boolean
}

// ── Listing Filter ───────────────────────────────────────────

export type ListingStatusFilter = 'all' | ListingStatus

export interface ListingFilters {
    status: ListingStatusFilter
    search: string
    category: string | null
    health_below: number | null
    vero_status: VeroStatus | null
    seller_type: SellerType | null
    sort_by: 'newest' | 'oldest' | 'price_high' | 'price_low' | 'health_high' | 'health_low'
}

// ── Bulk Selection ───────────────────────────────────────────

export interface BulkSelection {
    selected_ids: string[]
    all_selected: boolean
}

// ── Drawer State ─────────────────────────────────────────────

export type DrawerType = 'title_builder' | 'profit_calculator' | null

export interface DrawerState {
    open: DrawerType
    confirmed_title: string | null
    confirmed_price: number | null
}

// ── Listing Metric Cards ─────────────────────────────────────

export interface ListingMetrics {
    total: number
    active: number
    drafts: number
    ended: number
    scheduled: number
    vero_flagged: number
    avg_health_score: number
    week_change: number
}

// ── VeRO Check Result ────────────────────────────────────────

export interface VeroCheckResult {
    status: VeroStatus
    brands_found: VeroBrandMatch[]
    checked_at: string
}

export interface VeroBrandMatch {
    brand_name: string
    risk_level: 'High Risk' | 'Critical Ban' | 'Caution'
    evidence_url: string | null
    matched_keyword: string | null
}

// ── Supplier Import Result ───────────────────────────────────

export interface SupplierImportResult {
    success: boolean
    product: DropshipProduct | null
    error: string | null
    vero_warning: VeroCheckResult | null
}

// ── CSV Export Row ───────────────────────────────────────────
// Matches eBay File Exchange format

export interface EbayFileExchangeRow {
    Action: 'Add' | 'Revise' | 'End'
    Title: string
    Description: string
    Category: string
    ConditionID: string
    StartPrice: number
    Quantity: number
    Format: 'FixedPrice'
    Duration: 'GTC'
    ShippingType: string
    ShippingService: string
    ShippingServiceCost: number
    DispatchTimeMax: number
    ReturnsAcceptedOption: string
    ReturnPolicyPeriod: string
    SKU: string
    PicURL: string
    [key: string]: string | number  // Item specifics
}
