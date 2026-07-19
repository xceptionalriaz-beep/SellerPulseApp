// lib/profit-engine.ts
// Single source of truth for ALL profit calculation math in Riazify.
// All numbers-in → numbers-out logic lives here.
// Verified against official eBay US fee page July 2026.

// =============================================================================
// TYPES
// =============================================================================

export interface ProfitSettings {
  // --- Core Settings ---
  categoryFeePercent: number   // eBay FVF % for chosen category
  fixedFee: number   // Per-order fee ($0.30 ≤$10, $0.40 >$10)
  adRatePercent: number   // Promoted Listings %
  sourcingTaxPercent: number   // Tax paid when sourcing stock (advanced only)
  defaultShipping: number   // What seller pays to ship
  intlFeePercent: number   // eBay cross-border fee % (default 1.65%)
  fxFeePercent: number   // Bank currency conversion fee (advanced only)

  // --- Advanced Settings ---
  isAdvancedEnabled: boolean
  defectRatePercent: number
  payoutFeePercent: number
  cashbackPercent: number

  // --- Extended fields ---
  buyerPaidShipping: number
  buyerTaxPercent: number
  isInternationalSale: boolean
  includeRegulatoryFee: boolean
  regulatoryFeePercent: number
  storeDiscountPercent: number
  sellerLevelAdjustPercent: number

  // --- US tiered fee fields ---
  usCategoryKey: string   // key into US_TIERED_FEES
  hasStore: boolean  // true = Basic/Premium/Anchor/Enterprise
  isTopRatedPlus: boolean  // true = 10% off FVF amount (not the %)
  isUSMarket: boolean  // true = use US tiered fee calc

  // --- US seller performance penalty fields ---
  isBelowStandard: boolean
  belowStandardMonths: number   // 0 = not BS, 1-3 = +6%, 4+ = +7%
  isVeryHighINAD: boolean
  inadMonths: number   // US: 1-3 = +5%, 4+ = +6% | UK: 1-3 = +4%, 4+ = +5%

  // --- UK-specific fields ---
  isUKMarket: boolean
  ukCategoryKey: string
  isVATRegistered: boolean
  ukIntlDestination: 'eurozone' | 'us_canada' | 'other' | 'none'
  ukReducedPerOrder: boolean
  // CA fields
  isCAMarket: boolean
  caCategoryKey: string
  caHasStore: boolean
  caIntlDestination: 'none' | 'us' | 'other'

  // AU fields
  isAUMarket: boolean
  auProPlan: 'starter' | 'basic' | 'featured' | 'anchor'
  auCategoryTier: 1 | 2 | 3 | 4
  isGSTRegistered: boolean
  auIsInternational: boolean

  // DE fields
  isDEMarket: boolean
  deCategoryKey: string
  deHasShop: boolean
  deIsPlatinShop: boolean   // 10% off ALL FVF incl. fixed per-order
  deIsPremiumService: boolean   // 10% off variable FVF only
  deIsVATRegistered: boolean   // false = all fees × 1.19
  deIntlDestination: 'none' | 'eurozone' | 'europe_other' | 'uk' | 'other'
  deBelowStdCategoryGroup: 'standard' | 'recommerce' | 'tech' | 'fashion_jewelry'
  deINADCategoryGroup: 'standard' | 'auto_parts'

  // FR fields
  isFRMarket: boolean
  frCategoryKey: string
  frIsVATRegistered: boolean   // false = all fees × 1.20
  frIntlDestination: 'none' | 'eurozone' | 'europe_other' | 'uk' | 'other'

  // IT fields
  isITMarket: boolean
  itCategoryKey: string
  itIsVATRegistered: boolean
  itIntlDestination: 'none' | 'eurozone' | 'europe_other' | 'uk' | 'other'

  // ES fields
  isESMarket: boolean
  esCategoryKey: string
  esIsVATRegistered: boolean
  esIntlDestination: 'none' | 'eurozone' | 'europe_other' | 'uk' | 'other'

  // AT fields
  isATMarket: boolean
  atCategoryKey: string
  atHasShop: boolean
  atIsVATRegistered: boolean
  atIntlDestination: 'none' | 'eurozone' | 'europe_other' | 'uk' | 'other'

  // IE fields
  isIEMarket: boolean
  ieCategoryKey: string
  ieIsVATRegistered: boolean
  ieIntlDestination: 'none' | 'eurozone' | 'europe_other' | 'uk' | 'other'

  // NL fields — reuses IE fee table (identical rates), 21% Dutch VAT
  isNLMarket: boolean
  nlCategoryKey: string
  nlIsVATRegistered: boolean
  nlIntlDestination: 'none' | 'eurozone' | 'europe_other' | 'uk' | 'other'

  // PL fields — currency PLN, thresholds in PLN not EUR
  isPLMarket: boolean
  plCategoryKey: string
  plIsVATRegistered: boolean
  plIntlDestination: 'none' | 'eurozone' | 'europe_other' | 'uk' | 'other'

  // BE fields — reuses IE fee table (identical rates), 21% Belgian VAT
  // Covers both benl.ebay.be and befr.ebay.be (same fees, different languages)
  isBEMarket: boolean
  beCategoryKey: string
  beIsVATRegistered: boolean
  beIntlDestination: 'none' | 'eurozone' | 'europe_other' | 'uk' | 'other'

  // CH fields — currency CHF, thresholds in CHF, unique intl fee structure
  isCHMarket: boolean
  chCategoryKey: string
  chIsVATRegistered: boolean   // false = all fees x 1.081 (Swiss VAT is 8.1%)
  chIntlDestination: 'none' | 'europe_other' | 'us_canada' | 'uk_other'
}

export const DEFAULT_SETTINGS: ProfitSettings = {
  categoryFeePercent: 13.6,
  fixedFee: 0.40,
  adRatePercent: 0,
  sourcingTaxPercent: 7.0,
  defaultShipping: 0,
  intlFeePercent: 1.65,
  fxFeePercent: 2.0,
  isAdvancedEnabled: false,
  defectRatePercent: 2.0,
  payoutFeePercent: 1.5,
  cashbackPercent: 2.0,
  buyerPaidShipping: 0,
  buyerTaxPercent: 0,
  isInternationalSale: false,
  includeRegulatoryFee: false,
  regulatoryFeePercent: 0,
  storeDiscountPercent: 0,
  sellerLevelAdjustPercent: 0,
  usCategoryKey: 'default',
  hasStore: false,
  isTopRatedPlus: false,
  isUSMarket: false,
  isBelowStandard: false,
  belowStandardMonths: 0,
  isVeryHighINAD: false,
  inadMonths: 0,
  // UK fields
  isUKMarket: false,
  ukCategoryKey: 'default',
  isVATRegistered: true,
  ukIntlDestination: 'none',
  ukReducedPerOrder: false,
  // CA fields
  isCAMarket: false,
  caCategoryKey: 'default',
  caHasStore: false,
  caIntlDestination: 'none',
  // AU fields
  isAUMarket: false,
  auProPlan: 'starter',
  auCategoryTier: 2,
  isGSTRegistered: true,
  auIsInternational: false,
  // DE fields
  isDEMarket: false,
  deCategoryKey: 'default',
  deHasShop: false,
  deIsPlatinShop: false,
  deIsPremiumService: false,
  deIsVATRegistered: true,
  deIntlDestination: 'none',
  deBelowStdCategoryGroup: 'standard',
  deINADCategoryGroup: 'standard',
  // FR fields
  isFRMarket: false,
  frCategoryKey: 'default',
  frIsVATRegistered: true,
  frIntlDestination: 'none',
  // IT fields
  isITMarket: false,
  itCategoryKey: 'default',
  itIsVATRegistered: true,
  itIntlDestination: 'none',
  // ES fields
  isESMarket: false,
  esCategoryKey: 'default',
  esIsVATRegistered: true,
  esIntlDestination: 'none',
  // AT fields
  isATMarket: false,
  atCategoryKey: 'default',
  atHasShop: false,
  atIsVATRegistered: true,
  atIntlDestination: 'none',
  // IE fields
  isIEMarket: false,
  ieCategoryKey: 'default',
  ieIsVATRegistered: true,
  ieIntlDestination: 'none',
  // NL fields
  isNLMarket: false,
  nlCategoryKey: 'default',
  nlIsVATRegistered: true,
  nlIntlDestination: 'none',
  // PL fields
  isPLMarket: false,
  plCategoryKey: 'default',
  plIsVATRegistered: true,
  plIntlDestination: 'none',
  // BE fields
  isBEMarket: false,
  beCategoryKey: 'default',
  beIsVATRegistered: true,
  beIntlDestination: 'none',
  // CH fields
  isCHMarket: false,
  chCategoryKey: 'default',
  chIsVATRegistered: true,
  chIntlDestination: 'none',
}

export interface ProfitResult {
  netProfit: number
  profitMargin: number
  roi: number
  trueBuyCost: number
  totalCosts: number
  totalRevenue: number
  totalEbayFees: number
  finalValueFeeOnly: number   // FVF before ad/regulatory/cross-border
  promotedAdFee: number
  regulatoryFee: number
  crossBorderFee: number
  advancedDeductions: number
  totalCashback: number
  breakEvenPrice: number
  maxSafeAdRatePercent: number
  effectiveCatFeePercent: number
  topRatedDiscount: number   // dollar amount saved from TRP discount
  belowStandardPenalty: number   // extra dollar amount for below standard
  inadPenalty: number   // extra dollar amount for Very High INAD returns
  vatOnFees: number   // UK only: 20% VAT charged on fees
  ukIntlFee: number   // UK only: 3-tier international fee
  caIntlFee: number   // CA only: 2-tier international fee
  auIntlFee: number   // AU only: 1.1% flat international fee
  auGSTSaving: number   // AU only: GST saving for registered sellers
  deIntlFee: number   // DE only: 4-tier international fee
  deVATOnFees: number   // DE only: 19% VAT on fees (non-VAT registered)
  frIntlFee: number   // FR only
  frVATOnFees: number   // FR only: 20% VAT
  itIntlFee: number   // IT only
  itVATOnFees: number   // IT only: 22% VAT
  esIntlFee: number   // ES only
  esVATOnFees: number   // ES only: 21% VAT
  atIntlFee: number   // AT only
  atVATOnFees: number   // AT only: 20% VAT
  ieIntlFee: number   // IE only
  ieVATOnFees: number   // IE only: 23% VAT
  nlIntlFee: number   // NL only
  nlVATOnFees: number   // NL only: 21% VAT
  plIntlFee: number   // PL only
  plVATOnFees: number   // PL only: 23% VAT
  beIntlFee: number   // BE only
  beVATOnFees: number   // BE only: 21% VAT
  chIntlFee: number   // CH only
  chVATOnFees: number   // CH only: 8.1% Swiss VAT
}

// =============================================================================
// US TIERED FEE TABLE
// Verified against official eBay US fee page (ebay.com/help/selling/fees)
// =============================================================================

export type USCategoryKey =
  | 'default'
  | 'books_movies_music'
  | 'coins'
  | 'coins_bullion'
  | 'collectibles_trading_cards'
  | 'handbags'
  | 'jewelry'
  | 'watches'
  | 'guitars'
  | 'athletic_shoes'
  | 'nfts'
  | 'heavy_equipment'

// Bracket structure: array of { upTo, rate } where upTo = Infinity for the last bracket
// FVF = sum of (rate × portion of sale within each bracket)
interface FeeBracket {
  upTo: number   // upper bound of this bracket (Infinity = no cap)
  rate: number   // % rate for this bracket
}

// For categories where rate simply switches based on total sale price (not progressive)
// we model as: if price <= threshold → rate1, else → rate2 for entire sale
interface PriceSwitchFee {
  type: 'switch'
  threshold: number
  rateBelow: number
  rateAbove: number
  noPerOrder: boolean  // true = per order fee is not charged (e.g. athletic shoes $150+)
}

interface ProgressiveFee {
  type: 'progressive'
  brackets: FeeBracket[]
}

interface FlatFee {
  type: 'flat'
  rate: number
}

type FeeStructure = PriceSwitchFee | ProgressiveFee | FlatFee

interface USCategoryFee {
  noStore: FeeStructure
  hasStore: FeeStructure
  label: string
}

export const US_TIERED_FEES: Record<USCategoryKey, USCategoryFee> = {

  default: {
    label: 'Other categories (default)',
    noStore: { type: 'progressive', brackets: [{ upTo: 7500, rate: 13.6 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 2500, rate: 12.35 }, { upTo: Infinity, rate: 2.35 }] },
  },

  books_movies_music: {
    label: 'Books, movies, music',
    noStore: { type: 'progressive', brackets: [{ upTo: 7500, rate: 15.3 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 7500, rate: 15.3 }, { upTo: Infinity, rate: 2.35 }] },
  },

  coins: {
    label: 'Coins & paper money (non-bullion)',
    noStore: { type: 'progressive', brackets: [{ upTo: 7500, rate: 13.25 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 2500, rate: 13.25 }, { upTo: Infinity, rate: 2.35 }] },
  },

  coins_bullion: {
    label: 'Coins & paper money > Bullion',
    // Rate switches based on total sale (not progressive)
    noStore: { type: 'switch', threshold: 7500, rateBelow: 13.6, rateAbove: 7.0, noPerOrder: false },
    hasStore: { type: 'switch', threshold: 7500, rateBelow: 13.6, rateAbove: 7.0, noPerOrder: false },
  },

  collectibles_trading_cards: {
    label: 'Comics, trading cards & collectibles',
    noStore: { type: 'progressive', brackets: [{ upTo: 7500, rate: 13.25 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 2500, rate: 12.35 }, { upTo: Infinity, rate: 2.35 }] },
  },

  handbags: {
    label: "Women's bags & handbags",
    // Rate switches based on total sale
    noStore: { type: 'switch', threshold: 2000, rateBelow: 15.0, rateAbove: 9.0, noPerOrder: false },
    hasStore: { type: 'switch', threshold: 2000, rateBelow: 13.0, rateAbove: 7.0, noPerOrder: false },
  },

  jewelry: {
    label: 'Jewelry & watches (non-watch)',
    // Rate switches based on total sale
    noStore: { type: 'switch', threshold: 5000, rateBelow: 15.0, rateAbove: 9.0, noPerOrder: false },
    hasStore: { type: 'switch', threshold: 5000, rateBelow: 15.0, rateAbove: 9.0, noPerOrder: false },
  },

  watches: {
    label: 'Watches, parts & accessories',
    // 3-tier progressive bracket
    noStore: {
      type: 'progressive',
      brackets: [
        { upTo: 1000, rate: 15.0 },
        { upTo: 7500, rate: 6.5 },
        { upTo: Infinity, rate: 3.0 },
      ],
    },
    hasStore: {
      type: 'progressive',
      brackets: [
        { upTo: 1000, rate: 12.5 },
        { upTo: 5000, rate: 4.0 },
        { upTo: Infinity, rate: 3.0 },
      ],
    },
  },

  guitars: {
    label: 'Musical instruments & gear > Guitars & basses',
    noStore: { type: 'progressive', brackets: [{ upTo: 7500, rate: 6.7 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 2500, rate: 6.7 }, { upTo: Infinity, rate: 2.35 }] },
  },

  athletic_shoes: {
    label: "Athletic shoes (men's & women's)",
    // 8% if sale >= $150 (no per order fee), 13.6% if sale < $150
    noStore: { type: 'switch', threshold: 150, rateBelow: 13.6, rateAbove: 8.0, noPerOrder: true },
    hasStore: { type: 'switch', threshold: 150, rateBelow: 13.6, rateAbove: 8.0, noPerOrder: true },
  },

  nfts: {
    label: 'NFTs (all categories)',
    noStore: { type: 'flat', rate: 5.0 },
    hasStore: { type: 'flat', rate: 5.0 },
  },

  heavy_equipment: {
    label: 'Heavy equipment, commercial printing, food trucks',
    noStore: { type: 'progressive', brackets: [{ upTo: 15000, rate: 3.0 }, { upTo: Infinity, rate: 0.5 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 15000, rate: 3.0 }, { upTo: Infinity, rate: 0.5 }] },
  },
}

// =============================================================================
// UK FEE TABLE
// Verified against official eBay UK fee page (ebay.co.uk/help/selling/fees)
// Last updated: 12 February 2026
// KEY DIFFERENCE FROM US: UK store subscription does NOT change FVF % rates.
// Store tier only affects listing fee allowances. One table serves all store tiers.
// =============================================================================

export type UKCategoryKey =
  | 'default'                    // 12.9% — Everything Else (safest fallback)
  | 'antiques'                   // 10.9%
  | 'art'                        // 10.9%
  | 'baby'                       // 10.9%
  | 'books_comics'               // 9.9%
  | 'business_industrial'        // 12.5%
  | 'cameras_general'            // 9.9%
  | 'cameras_specific'           // 6.9% up to £1,000 → 3%
  | 'clothes_general'            // 11.9%
  | 'handbags'                   // 12.9% up to £800 → 7%
  | 'trainers'                   // 11.9% / 7% if ≥£100
  | 'coins'                      // 10.9% up to £450 → 3%
  | 'collectables'               // 10.9%
  | 'computers_general'          // 9.9%
  | 'computers_specific'         // 6.9% up to £1,000 → 3%
  | 'crafts'                     // 12.9%
  | 'dolls_bears'                // 10.9%
  | 'event_tickets'              // 12.9%
  | 'films_tv'                   // 9.9%
  | 'garden_patio'               // 10.9%
  | 'health_beauty'              // 10.9%
  | 'hair_wigs'                  // 11.9%
  | 'electronic_smoking'         // 12.9%
  | 'holidays_travel'            // 7.9% up to £650 → 3%
  | 'home_general'               // 11.9% up to £500 → 7.9%
  | 'home_appliances'            // 6.9% up to £400 → 3%
  | 'home_power_strips'          // 9.9% up to £250 → 7.9%
  | 'home_furniture'             // 10.9% up to £500 → 7.9% up to £1,000 → 3%
  | 'jewellery'                  // 14.9% up to £1,000 → 4%
  | 'watches'                    // 12.9% up to £750 → 3%
  | 'mobiles_general'            // 9.9%
  | 'mobiles_phones'             // 6.9% up to £1,000 → 3%
  | 'music'                      // 9.9%
  | 'musical_instruments'        // 10.9%
  | 'nfts'                       // 5%
  | 'pet_supplies'               // 12.9%
  | 'pottery_glass'              // 10.9%
  | 'sound_vision_general'       // 9.9%
  | 'sound_vision_specific'      // 6.9% up to £1,000 → 3%
  | 'sporting_goods'             // 10.9%
  | 'sports_memorabilia'         // 10.9%
  | 'stamps'                     // 10.9%
  | 'toys_games'                 // 10.9%
  | 'tents'                      // 10.9% up to £250 → 7.9%
  | 'vehicle_parts_general'      // 9.5% up to £750 → 3%
  | 'vehicle_parts_specific'     // 6.9% up to £750 → 3%
  | 'video_games'                // 9.9%
  | 'video_game_consoles'        // 6.9% up to £400 → 2%
  | 'wholesale'                  // 12.9%
  | 'memorials'                  // 11.9%

interface UKCategoryFee {
  label: string
  structure: FeeStructure        // single table — no hasStore variant for UK
  reducedPerOrder?: boolean      // true = £0.10 per-order applies for orders ≤£10
}

export const UK_TIERED_FEES: Record<UKCategoryKey, UKCategoryFee> = {
  default: { label: 'Everything Else (default)', structure: { type: 'flat', rate: 12.9 } },
  antiques: { label: 'Antiques', structure: { type: 'flat', rate: 10.9 } },
  art: { label: 'Art (general)', structure: { type: 'flat', rate: 10.9 } },
  baby: { label: 'Baby', structure: { type: 'flat', rate: 10.9 } },
  books_comics: { label: 'Books, Comics & Magazines', structure: { type: 'flat', rate: 9.9 } },
  business_industrial: { label: 'Business, Office & Industrial', structure: { type: 'flat', rate: 12.5 } },
  cameras_general: { label: 'Cameras & Photography (general)', structure: { type: 'flat', rate: 9.9 } },
  cameras_specific: { label: 'Cameras — Camcorders/Digital/Film/Lenses', structure: { type: 'progressive', brackets: [{ upTo: 1000, rate: 6.9 }, { upTo: Infinity, rate: 3.0 }] } },
  clothes_general: { label: 'Clothes, Shoes & Accessories (general)', structure: { type: 'flat', rate: 11.9 } },
  handbags: { label: "Women's Bags & Handbags", structure: { type: 'progressive', brackets: [{ upTo: 800, rate: 12.9 }, { upTo: Infinity, rate: 7.0 }] } },
  trainers: { label: 'Trainers — men\'s & women\'s', structure: { type: 'switch', threshold: 100, rateBelow: 11.9, rateAbove: 7.0, noPerOrder: false } },
  coins: { label: 'Coins', structure: { type: 'progressive', brackets: [{ upTo: 450, rate: 10.9 }, { upTo: Infinity, rate: 3.0 }] }, reducedPerOrder: true },
  collectables: { label: 'Collectables (general)', structure: { type: 'flat', rate: 10.9 }, reducedPerOrder: true },
  computers_general: { label: 'Computers, Tablets & Networking (general)', structure: { type: 'flat', rate: 9.9 } },
  computers_specific: { label: 'Computers — Desktops/Laptops/Tablets/Drives', structure: { type: 'progressive', brackets: [{ upTo: 1000, rate: 6.9 }, { upTo: Infinity, rate: 3.0 }] } },
  crafts: { label: 'Crafts', structure: { type: 'flat', rate: 12.9 } },
  dolls_bears: { label: 'Dolls & Bears', structure: { type: 'flat', rate: 10.9 } },
  event_tickets: { label: 'Event Tickets', structure: { type: 'flat', rate: 12.9 } },
  films_tv: { label: 'Films & TV (general)', structure: { type: 'flat', rate: 9.9 } },
  garden_patio: { label: 'Garden & Patio', structure: { type: 'flat', rate: 10.9 } },
  health_beauty: { label: 'Health & Beauty (general)', structure: { type: 'flat', rate: 10.9 } },
  hair_wigs: { label: 'Hair Extensions & Wigs', structure: { type: 'flat', rate: 11.9 } },
  electronic_smoking: { label: 'Electronic Smoking', structure: { type: 'flat', rate: 12.9 } },
  holidays_travel: { label: 'Holidays & Travel', structure: { type: 'progressive', brackets: [{ upTo: 650, rate: 7.9 }, { upTo: Infinity, rate: 3.0 }] } },
  home_general: { label: 'Home, Furniture & DIY (general)', structure: { type: 'progressive', brackets: [{ upTo: 500, rate: 11.9 }, { upTo: Infinity, rate: 7.9 }] }, reducedPerOrder: true },
  home_appliances: { label: 'Home — Appliances & DIY Tools', structure: { type: 'progressive', brackets: [{ upTo: 400, rate: 6.9 }, { upTo: Infinity, rate: 3.0 }] }, reducedPerOrder: true },
  home_power_strips: { label: 'Home — Power Strips & Surge Protectors', structure: { type: 'progressive', brackets: [{ upTo: 250, rate: 9.9 }, { upTo: Infinity, rate: 7.9 }] }, reducedPerOrder: true },
  home_furniture: { label: 'Home — Furniture, Bath & Plumbing', structure: { type: 'progressive', brackets: [{ upTo: 500, rate: 10.9 }, { upTo: 1000, rate: 7.9 }, { upTo: Infinity, rate: 3.0 }] }, reducedPerOrder: true },
  jewellery: { label: 'Jewellery & Watches (general)', structure: { type: 'progressive', brackets: [{ upTo: 1000, rate: 14.9 }, { upTo: Infinity, rate: 4.0 }] } },
  watches: { label: 'Watches, Parts & Accessories', structure: { type: 'progressive', brackets: [{ upTo: 750, rate: 12.9 }, { upTo: Infinity, rate: 3.0 }] } },
  mobiles_general: { label: 'Mobile Phones & Communication (general)', structure: { type: 'flat', rate: 9.9 } },
  mobiles_phones: { label: 'Mobile & Smart Phones', structure: { type: 'progressive', brackets: [{ upTo: 1000, rate: 6.9 }, { upTo: Infinity, rate: 3.0 }] } },
  music: { label: 'Music (general)', structure: { type: 'flat', rate: 9.9 } },
  musical_instruments: { label: 'Musical Instruments & DJ Equipment', structure: { type: 'flat', rate: 10.9 } },
  nfts: { label: 'NFTs (all categories)', structure: { type: 'flat', rate: 5.0 } },
  pet_supplies: { label: 'Pet Supplies', structure: { type: 'flat', rate: 12.9 } },
  pottery_glass: { label: 'Pottery, Ceramics & Glass', structure: { type: 'flat', rate: 10.9 } },
  sound_vision_general: { label: 'Sound & Vision (general)', structure: { type: 'flat', rate: 9.9 } },
  sound_vision_specific: { label: 'Sound & Vision — DVD/Headphones/HiFi/TV', structure: { type: 'progressive', brackets: [{ upTo: 1000, rate: 6.9 }, { upTo: Infinity, rate: 3.0 }] } },
  sporting_goods: { label: 'Sporting Goods', structure: { type: 'flat', rate: 10.9 } },
  sports_memorabilia: { label: 'Sports Memorabilia (general)', structure: { type: 'flat', rate: 10.9 } },
  stamps: { label: 'Stamps', structure: { type: 'flat', rate: 10.9 } },
  toys_games: { label: 'Toys & Games (general)', structure: { type: 'flat', rate: 10.9 } },
  tents: { label: 'Tents', structure: { type: 'progressive', brackets: [{ upTo: 250, rate: 10.9 }, { upTo: Infinity, rate: 7.9 }] } },
  vehicle_parts_general: { label: 'Vehicle Parts & Accessories (general)', structure: { type: 'progressive', brackets: [{ upTo: 750, rate: 9.5 }, { upTo: Infinity, rate: 3.0 }] } },
  vehicle_parts_specific: { label: 'Vehicle Parts — Tyres/GPS/Power Tools', structure: { type: 'progressive', brackets: [{ upTo: 750, rate: 6.9 }, { upTo: Infinity, rate: 3.0 }] } },
  video_games: { label: 'Video Games & Consoles (general)', structure: { type: 'flat', rate: 9.9 } },
  video_game_consoles: { label: 'Video Game Consoles', structure: { type: 'progressive', brackets: [{ upTo: 400, rate: 6.9 }, { upTo: Infinity, rate: 2.0 }] } },
  wholesale: { label: 'Wholesale & Job Lots', structure: { type: 'flat', rate: 12.9 } },
  memorials: { label: 'Memorials & Funerals', structure: { type: 'flat', rate: 11.9 } },
}

// UK international fee rates by destination
export const UK_INTL_FEES = {
  none: 0,
  eurozone: 1.05,
  us_canada: 1.8,
  other: 2.0,
}

// =============================================================================
// CA FEE TABLE
// Verified against official eBay CA fee pages (ebay.ca) + Gemini audit 2026
// KEY FACTS:
//   - NO regulatory fee (Canada is exempt)
//   - NO C$0.10 reduced per-order exception (that's UK only)
//   - Store subscribers get lower FVF rates AND threshold drops $7,500 → $2,500
//   - INAD penalty: flat +5 percentage points (no 4+ month scaling unlike US/UK)
//   - Below Standard: +6pts (1-3 months), +7pts (4+ months) — % OF FVF amount
//   - International: US 0.4%, all others 1.0%
// =============================================================================

export type CACategoryKey =
  | 'default'                  // Most categories — 13.6% / 12.7% store
  | 'books_movies_music'       // 15.3% both tiers
  | 'coins'                    // 13.25% / 9% store
  | 'coins_bullion'            // switch / 3-bracket store
  | 'collectibles_cards'       // 13.25% / 12.35% store
  | 'guitars'                  // 6.7% both tiers
  | 'musical_instruments'      // same as default / 10.35% store
  | 'dj_pro_audio'             // same as default / 9.35% store
  | 'cameras'                  // same as default / 9.35% store
  | 'cell_phones'              // same as default / 9.35% store
  | 'computers'                // same as default / 9.35% store
  | 'computers_specific'       // same as default / 7.35% store
  | 'consumer_electronics'     // same as default / 9.35% store
  | 'video_games'              // same as default / 9.35% store
  | 'video_game_consoles'      // same as default / 7.35% store
  | 'athletic_shoes'           // 8% ≥$150 (no per-order) / 7% store
  | 'heavy_equipment'          // 3% / 2.5% store
  | 'motors_parts'             // 11.5% / same store
  | 'motors_gps'               // 9.35% / same store
  | 'motors_tires'             // 9.5% / same store
  | 'stamps'                   // same as default / 9.7% store
  | 'nfts'                     // 5% flat both tiers

interface CACategoryFee {
  label: string
  noStore: FeeStructure
  hasStore: FeeStructure
}

export const CA_TIERED_FEES: Record<CACategoryKey, CACategoryFee> = {
  default: {
    label: 'Other categories (default)',
    noStore: { type: 'progressive', brackets: [{ upTo: 7500, rate: 13.6 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 2500, rate: 12.7 }, { upTo: Infinity, rate: 2.35 }] },
  },
  books_movies_music: {
    label: 'Books, movies, music & TV',
    noStore: { type: 'progressive', brackets: [{ upTo: 7500, rate: 15.3 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 2500, rate: 15.3 }, { upTo: Infinity, rate: 2.35 }] },
  },
  coins: {
    label: 'Coins & paper money (non-bullion)',
    noStore: { type: 'progressive', brackets: [{ upTo: 7500, rate: 13.25 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 4000, rate: 9.0 }, { upTo: Infinity, rate: 2.35 }] },
  },
  coins_bullion: {
    label: 'Coins & paper money > Bullion',
    noStore: { type: 'switch', threshold: 7500, rateBelow: 13.6, rateAbove: 7.0, noPerOrder: false },
    // Store: 3-bracket — 7.5% ≤$1,500 / 5% $1,500-$10,000 / 4.5% >$10,000
    hasStore: { type: 'progressive', brackets: [{ upTo: 1500, rate: 7.5 }, { upTo: 10000, rate: 5.0 }, { upTo: Infinity, rate: 4.5 }] },
  },
  collectibles_cards: {
    label: 'Comics, trading cards & collectibles',
    noStore: { type: 'progressive', brackets: [{ upTo: 7500, rate: 13.25 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 2500, rate: 12.35 }, { upTo: Infinity, rate: 2.35 }] },
  },
  guitars: {
    label: 'Musical instruments > Guitars & basses',
    noStore: { type: 'progressive', brackets: [{ upTo: 7500, rate: 6.7 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 2500, rate: 6.7 }, { upTo: Infinity, rate: 2.35 }] },
  },
  musical_instruments: {
    label: 'Musical instruments & gear (general)',
    noStore: { type: 'progressive', brackets: [{ upTo: 7500, rate: 13.6 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 2500, rate: 10.35 }, { upTo: Infinity, rate: 2.35 }] },
  },
  dj_pro_audio: {
    label: 'DJ equipment & pro audio',
    noStore: { type: 'progressive', brackets: [{ upTo: 7500, rate: 13.6 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 2500, rate: 9.35 }, { upTo: Infinity, rate: 2.35 }] },
  },
  cameras: {
    label: 'Cameras & photography',
    noStore: { type: 'progressive', brackets: [{ upTo: 7500, rate: 13.6 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 2500, rate: 9.35 }, { upTo: Infinity, rate: 2.35 }] },
  },
  cell_phones: {
    label: 'Cell phones & accessories',
    noStore: { type: 'progressive', brackets: [{ upTo: 7500, rate: 13.6 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 2500, rate: 9.35 }, { upTo: Infinity, rate: 2.35 }] },
  },
  computers: {
    label: 'Computers, tablets & networking (general)',
    noStore: { type: 'progressive', brackets: [{ upTo: 7500, rate: 13.6 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 2500, rate: 9.35 }, { upTo: Infinity, rate: 2.35 }] },
  },
  computers_specific: {
    label: 'Computers — Desktops/Laptops/Tablets/HDDs/Monitors/Printers',
    noStore: { type: 'progressive', brackets: [{ upTo: 7500, rate: 13.6 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 2500, rate: 7.35 }, { upTo: Infinity, rate: 2.35 }] },
  },
  consumer_electronics: {
    label: 'Consumer electronics (general)',
    noStore: { type: 'progressive', brackets: [{ upTo: 7500, rate: 13.6 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 2500, rate: 9.35 }, { upTo: Infinity, rate: 2.35 }] },
  },
  video_games: {
    label: 'Video games & consoles (general)',
    noStore: { type: 'progressive', brackets: [{ upTo: 7500, rate: 13.6 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 2500, rate: 9.35 }, { upTo: Infinity, rate: 2.35 }] },
  },
  video_game_consoles: {
    label: 'Video game consoles',
    noStore: { type: 'progressive', brackets: [{ upTo: 7500, rate: 13.6 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 2500, rate: 7.35 }, { upTo: Infinity, rate: 2.35 }] },
  },
  athletic_shoes: {
    label: "Athletic shoes (men's & women's)",
    // No store: 8% if ≥$150 (no per-order fee), 13.6% if <$150
    noStore: { type: 'switch', threshold: 150, rateBelow: 13.6, rateAbove: 8.0, noPerOrder: true },
    // Store: 7% if ≥$150 (no per-order fee), 12.7% if <$150
    hasStore: { type: 'switch', threshold: 150, rateBelow: 12.7, rateAbove: 7.0, noPerOrder: true },
  },
  heavy_equipment: {
    label: 'Heavy equipment, printing presses, food trucks',
    noStore: { type: 'progressive', brackets: [{ upTo: 15000, rate: 3.0 }, { upTo: Infinity, rate: 0.5 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 15000, rate: 2.5 }, { upTo: Infinity, rate: 0.5 }] },
  },
  motors_parts: {
    label: 'eBay Motors — parts & accessories (general)',
    noStore: { type: 'progressive', brackets: [{ upTo: 1000, rate: 11.5 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 1000, rate: 11.5 }, { upTo: Infinity, rate: 2.35 }] },
  },
  motors_gps: {
    label: 'eBay Motors — GPS & in-car technology',
    noStore: { type: 'progressive', brackets: [{ upTo: 1000, rate: 9.35 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 1000, rate: 9.35 }, { upTo: Infinity, rate: 2.35 }] },
  },
  motors_tires: {
    label: 'eBay Motors — tires',
    noStore: { type: 'progressive', brackets: [{ upTo: 1000, rate: 9.5 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 1000, rate: 9.5 }, { upTo: Infinity, rate: 2.35 }] },
  },
  stamps: {
    label: 'Stamps',
    noStore: { type: 'progressive', brackets: [{ upTo: 7500, rate: 13.6 }, { upTo: Infinity, rate: 2.35 }] },
    hasStore: { type: 'progressive', brackets: [{ upTo: 2500, rate: 9.7 }, { upTo: Infinity, rate: 2.35 }] },
  },
  nfts: {
    label: 'NFTs (all categories)',
    noStore: { type: 'flat', rate: 5.0 },
    hasStore: { type: 'flat', rate: 5.0 },
  },
}

// CA international fee rates
export const CA_INTL_FEES = {
  none: 0,
  us: 0.4,
  other: 1.0,
}

// =============================================================================
// CA FVF CALCULATOR
// Two tables (noStore / hasStore) — CA store tier DOES change FVF rates
// Returns { fvfAmount, noPerOrder }
// =============================================================================

export function calcCAFVF(
  totalRevenue: number,
  categoryKey: CACategoryKey,
  hasStore: boolean,
): { fvfAmount: number; noPerOrder: boolean } {

  const cat = CA_TIERED_FEES[categoryKey] ?? CA_TIERED_FEES['default']
  const structure = hasStore ? cat.hasStore : cat.noStore

  if (structure.type === 'flat') {
    return { fvfAmount: totalRevenue * (structure.rate / 100), noPerOrder: false }
  }

  if (structure.type === 'switch') {
    const rate = totalRevenue <= structure.threshold ? structure.rateBelow : structure.rateAbove
    return {
      fvfAmount: totalRevenue * (rate / 100),
      noPerOrder: structure.noPerOrder && totalRevenue >= structure.threshold,
    }
  }

  // Progressive brackets
  let fvfAmount = 0
  let remaining = totalRevenue
  let prevUpTo = 0

  for (const bracket of structure.brackets) {
    if (remaining <= 0) break
    const bracketSize = bracket.upTo === Infinity ? remaining : Math.min(remaining, bracket.upTo - prevUpTo)
    const portionInBracket = Math.min(remaining, bracketSize)
    fvfAmount += portionInBracket * (bracket.rate / 100)
    remaining -= portionInBracket
    prevUpTo = bracket.upTo
    if (bracket.upTo === Infinity) break
  }

  return { fvfAmount, noPerOrder: false }
}

// =============================================================================
// AU FEE TABLE
// Verified against official eBay AU Pro fee page (ebay.com.au) 2026
// KEY FACTS:
//   - Completely restructured May 2026 — "eBay Pro" replaced eBay Stores
//   - All rates are INCLUSIVE of 10% GST
//   - GST-registered sellers (ABN) can claim GST back → effective rate ÷ 1.1
//   - 4 Pro plans: Starter / Basic / Featured / Anchor
//   - 4 category tiers — plan × tier = exact FVF %
//   - Single A$4,000 threshold for ALL categories
//   - Above A$4,000: Starter = 2.5%, Basic/Featured/Anchor = 2.75%
//   - Penalties: % of TOTAL SALE (not % of FVF like US/CA)
//   - INAD penalty: +5.5%/+6.6% — SAME as Below Standard (Gemini was wrong)
//   - International: 1.1% flat, no destination tiers
//   - No regulatory fee
// =============================================================================

export type AUProPlan = 'starter' | 'basic' | 'featured' | 'anchor'
export type AUCategoryTier = 1 | 2 | 3 | 4

// AU_FVF_TABLE[tier][plan] = FVF % (incl. GST) up to A$4,000
// All rates verified from official eBay AU Pro fee page
export const AU_FVF_TABLE: Record<AUCategoryTier, Record<AUProPlan, number>> = {
  // Tier 1: Home Appliances & Technology Devices
  1: { starter: 13.4, basic: 8.03, featured: 7.26, anchor: 6.82 },
  // Tier 2: All other categories (default)
  2: { starter: 13.4, basic: 11.44, featured: 10.34, anchor: 9.68 },
  // Tier 3: Vehicle Parts & Accessories
  3: { starter: 12.43, basic: 11.22, featured: 11.22, anchor: 10.56 },
  // Tier 4: Business & Industrial, Collectables, Fashion, Media, Sporting Goods, Tech Accessories
  4: { starter: 13.09, basic: 11.77, featured: 11.77, anchor: 11.11 },
}

// Above A$4,000 rate by plan
export const AU_ABOVE_THRESHOLD_RATE: Record<AUProPlan, number> = {
  starter: 2.5,
  basic: 2.75,
  featured: 2.75,
  anchor: 2.75,
}

// Fixed order fee by plan
export const AU_ORDER_FEE: Record<AUProPlan, number> = {
  starter: 0.30,
  basic: 0.33,
  featured: 0.33,
  anchor: 0.33,
}

// AU category tier labels for UI
export const AU_CATEGORY_TIERS: Record<AUCategoryTier, string> = {
  1: 'Tier 1 — Home Appliances & Technology Devices',
  2: 'Tier 2 — All other categories (default)',
  3: 'Tier 3 — Vehicle Parts & Accessories',
  4: 'Tier 4 — Business & Industrial, Collectables, Fashion, Media, Sporting Goods, Tech Accessories',
}

// AU Pro plan labels for UI
export const AU_PRO_PLAN_LABELS: Record<AUProPlan, string> = {
  starter: 'Pro Starter — no monthly fee',
  basic: 'Pro Basic — A$27.45/mo',
  featured: 'Pro Featured — A$82.45/mo',
  anchor: 'Pro Anchor — A$604.95/mo',
}

// =============================================================================
// AU FVF CALCULATOR
// Progressive: lower rate up to A$4,000, then above-threshold rate
// Returns { fvfAmount, orderFee }
// =============================================================================

export function calcAUFVF(
  totalRevenue: number,
  tier: AUCategoryTier,
  plan: AUProPlan,
): { fvfAmount: number; orderFee: number } {

  const belowRate = AU_FVF_TABLE[tier][plan] / 100
  const aboveRate = AU_ABOVE_THRESHOLD_RATE[plan] / 100
  const threshold = 4000

  let fvfAmount = 0
  if (totalRevenue <= threshold) {
    fvfAmount = totalRevenue * belowRate
  } else {
    fvfAmount = (threshold * belowRate) + ((totalRevenue - threshold) * aboveRate)
  }

  const orderFee = AU_ORDER_FEE[plan]

  return { fvfAmount, orderFee }
}

// =============================================================================
// DE FEE TABLE
// Verified against official eBay.de business seller fee page + Gemini audit 2026
// KEY FACTS:
//   - All fees EXCLUSIVE of 19% German VAT (Mehrwertsteuer)
//   - VAT-registered sellers (USt-IdNr.) pay fees as shown
//   - Non-VAT-registered sellers: all fees × 1.19
//   - Per-order: €0.35 (≤€10) / €0.45 (>€10)
//   - No regulatory fee (costs bundled into category rates)
//   - eBay Premium Service toggle: 10% off variable FVF only
//   - Platin-Shop: 10% off ALL FVF (variable + fixed per-order fee)
//   - July 1 2026: Tech categories restructured — New=7% flat / Used/Refurbished=5% flat
//   - Below Standard: category override rates (NOT simple +6% like US/CA)
//   - INAD: separate category override rates
//   - International: Eurozone+Sweden 0% / Europe non-Euro 1.6% / UK 1.2% / Other 3.3%
// =============================================================================

export type DECategoryKey =
  // Tech — July 2026 restructure (flat 7% new / 5% used, no progressive cap)
  | 'tech_new'                  // 7% flat (new condition)
  | 'tech_used'                 // 5% flat (used/refurbished)
  // Auto & Motorrad
  | 'auto_parts'                // 12% up to €990 → 3%
  | 'auto_electronics'          // 6.5% up to €990 (no shop) / €300 (shop) → 3%
  | 'auto_tires'                // 6.5% up to €990 → 3%
  | 'auto_clothing'             // 11% up to €990 → 3%
  // Garden/Home/Business
  | 'business_industrial'       // 12% up to €990 → 3%
  | 'garden_patio'              // 12% up to €990 (no shop) / €200 (shop) → 3%
  | 'home_improvement'          // 12% up to €990 (no shop) / €400 (shop) → 3%
  // Fashion/Watches/Jewelry/Coins
  | 'clothing'                  // 12% up to €990 → 3%
  | 'sneakers_over100'          // 7% up to €990 → 3%
  | 'sneakers_under100'         // 12% flat
  | 'watches_jewelry'           // 16% up to €990 (no shop) / €500 (shop) → 3%
  | 'watch_parts'               // 14% up to €990 (no shop) / €400 (shop) → 3%
  | 'wristwatches'              // 11% up to €990 (no shop) / €400 (shop) → 3%
  | 'coins'                     // 6.5% up to €990 → 3%
  // Media
  | 'media'                     // 12% up to €990 → 3% (films/music/tickets/games/books)
  // Musical instruments
  | 'musical_instruments'       // 11% up to €990 (no shop) / €400 (shop) → 3%
  // NFTs
  | 'nfts'                      // 5% flat
  // Standard 11% categories
  | 'standard_11'               // model making/travel/trading cards/TCGs
  // Standard 12% categories (default)
  | 'default'                   // antiques/beauty/stamps/baby/crafts/food/pets/office/furniture/collectibles/toys/sports

interface DECategoryFee {
  label: string
  noShop: FeeStructure
  hasShop: FeeStructure         // Basis/Top/Premium shop changes some thresholds
  isTech: boolean              // true = July 2026 flat rate applies (condition toggle)
}

export const DE_TIERED_FEES: Record<DECategoryKey, DECategoryFee> = {
  // Tech — July 2026 restructure (flat rates, no progressive cap)
  tech_new: {
    label: 'Technology & Electronics — New condition (July 2026)',
    noShop: { type: 'flat', rate: 7.0 },
    hasShop: { type: 'flat', rate: 7.0 },
    isTech: true,
  },
  tech_used: {
    label: 'Technology & Electronics — Used / Refurbished (July 2026)',
    noShop: { type: 'flat', rate: 5.0 },
    hasShop: { type: 'flat', rate: 5.0 },
    isTech: true,
  },
  // Auto & Motorrad
  auto_parts: {
    label: 'Auto & Motorrad — Parts (general)',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 12.0 }, { upTo: Infinity, rate: 3.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 12.0 }, { upTo: Infinity, rate: 3.0 }] },
    isTech: false,
  },
  auto_electronics: {
    label: 'Auto & Motorrad — Electronics, GPS, entertainment',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 6.5 }, { upTo: Infinity, rate: 3.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 300, rate: 6.5 }, { upTo: Infinity, rate: 3.0 }] },
    isTech: false,
  },
  auto_tires: {
    label: 'Auto & Motorrad — Wheels, rims & tires',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 6.5 }, { upTo: Infinity, rate: 3.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 6.5 }, { upTo: Infinity, rate: 3.0 }] },
    isTech: false,
  },
  auto_clothing: {
    label: 'Auto & Motorrad — Clothing & safety gear',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 11.0 }, { upTo: Infinity, rate: 3.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 11.0 }, { upTo: Infinity, rate: 3.0 }] },
    isTech: false,
  },
  // Garden/Home/Business
  business_industrial: {
    label: 'Business & Industrial',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 12.0 }, { upTo: Infinity, rate: 3.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 12.0 }, { upTo: Infinity, rate: 3.0 }] },
    isTech: false,
  },
  garden_patio: {
    label: 'Garden & Patio',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 12.0 }, { upTo: Infinity, rate: 3.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 200, rate: 12.0 }, { upTo: Infinity, rate: 3.0 }] },
    isTech: false,
  },
  home_improvement: {
    label: 'Home improvement & DIY',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 12.0 }, { upTo: Infinity, rate: 3.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 400, rate: 12.0 }, { upTo: Infinity, rate: 3.0 }] },
    isTech: false,
  },
  // Fashion/Watches/Jewelry/Coins
  clothing: {
    label: 'Clothing & accessories',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 12.0 }, { upTo: Infinity, rate: 3.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 12.0 }, { upTo: Infinity, rate: 3.0 }] },
    isTech: false,
  },
  sneakers_over100: {
    label: 'Sneakers ≥€100',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 7.0 }, { upTo: Infinity, rate: 3.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 7.0 }, { upTo: Infinity, rate: 3.0 }] },
    isTech: false,
  },
  sneakers_under100: {
    label: 'Sneakers <€100',
    noShop: { type: 'flat', rate: 12.0 },
    hasShop: { type: 'flat', rate: 12.0 },
    isTech: false,
  },
  watches_jewelry: {
    label: 'Watches & Jewelry (general)',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 16.0 }, { upTo: Infinity, rate: 3.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 500, rate: 16.0 }, { upTo: Infinity, rate: 3.0 }] },
    isTech: false,
  },
  watch_parts: {
    label: 'Watch parts & accessories',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 14.0 }, { upTo: Infinity, rate: 3.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 400, rate: 14.0 }, { upTo: Infinity, rate: 3.0 }] },
    isTech: false,
  },
  wristwatches: {
    label: 'Wristwatches & pocket watches',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 11.0 }, { upTo: Infinity, rate: 3.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 400, rate: 11.0 }, { upTo: Infinity, rate: 3.0 }] },
    isTech: false,
  },
  coins: {
    label: 'Coins & numismatics',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 6.5 }, { upTo: Infinity, rate: 3.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 6.5 }, { upTo: Infinity, rate: 3.0 }] },
    isTech: false,
  },
  // Media
  media: {
    label: 'Media — Films, Music, Tickets, Games, Books',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 12.0 }, { upTo: Infinity, rate: 3.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 12.0 }, { upTo: Infinity, rate: 3.0 }] },
    isTech: false,
  },
  // Musical instruments
  musical_instruments: {
    label: 'Musical instruments (general)',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 11.0 }, { upTo: Infinity, rate: 3.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 400, rate: 11.0 }, { upTo: Infinity, rate: 3.0 }] },
    isTech: false,
  },
  // NFTs
  nfts: {
    label: 'NFTs (all categories)',
    noShop: { type: 'flat', rate: 5.0 },
    hasShop: { type: 'flat', rate: 5.0 },
    isTech: false,
  },
  // Standard 11%
  standard_11: {
    label: 'Model making, Travel, Trading Cards, TCGs',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 11.0 }, { upTo: Infinity, rate: 3.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 11.0 }, { upTo: Infinity, rate: 3.0 }] },
    isTech: false,
  },
  // Default 12%
  default: {
    label: 'Other categories (default) — Antiques, Beauty, Baby, Pets, Toys, Sports, etc.',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 12.0 }, { upTo: Infinity, rate: 3.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 12.0 }, { upTo: Infinity, rate: 3.0 }] },
    isTech: false,
  },
}

// DE international fee rates
export const DE_INTL_FEES = {
  none: 0,
  eurozone: 0,     // Eurozone + Sweden — FREE
  europe_other: 1.6,   // Europe non-Eurozone non-UK
  uk: 1.2,
  other: 3.3,
}

// DE Below Standard override rates by category group
// COMPLETELY DIFFERENT from US/CA — DE replaces the base rate with these override rates
export const DE_BELOW_STANDARD_RATES = {
  standard: { upTo990: 20, above: 14 },  // default categories
  recommerce: { upTo990: 11, above: 5 },  // re-commerce standard
  tech: { upTo990: 11, above: 3 },  // tech categories
  fashion_jewelry: { upTo990: 18, above: 3 },  // clothing/watches/jewelry/coins
}

// DE Very High INAD override rates
export const DE_INAD_RATES = {
  standard: { upTo990: 17, above: 3 },
  auto_parts: { upTo990: 16, above: 3 },
}

// =============================================================================
// DE FVF CALCULATOR
// Returns { fvfAmount } — no per-order fee variation by category for DE
// hasShop = true for Basis/Top/Premium/Platin
// =============================================================================

export function calcDEFVF(
  totalRevenue: number,
  categoryKey: DECategoryKey,
  hasShop: boolean,
): { fvfAmount: number } {

  const cat = DE_TIERED_FEES[categoryKey] ?? DE_TIERED_FEES['default']
  const structure = hasShop ? cat.hasShop : cat.noShop

  if (structure.type === 'flat') {
    return { fvfAmount: totalRevenue * (structure.rate / 100) }
  }

  if (structure.type === 'switch') {
    const rate = totalRevenue <= (structure as any).threshold
      ? (structure as any).rateBelow
      : (structure as any).rateAbove
    return { fvfAmount: totalRevenue * (rate / 100) }
  }

  // Progressive brackets
  let fvfAmount = 0
  let remaining = totalRevenue
  let prevUpTo = 0

  for (const bracket of (structure as any).brackets) {
    if (remaining <= 0) break
    const bracketSize = bracket.upTo === Infinity ? remaining : Math.min(remaining, bracket.upTo - prevUpTo)
    const portionInBracket = Math.min(remaining, bracketSize)
    fvfAmount += portionInBracket * (bracket.rate / 100)
    remaining -= portionInBracket
    prevUpTo = bracket.upTo
    if (bracket.upTo === Infinity) break
  }

  return { fvfAmount }
}

// DE Below Standard FVF override calculator
// Replaces base FVF entirely — adds +1% to both rates if 4+ consecutive months
export function calcDEBelowStandardFVF(
  totalRevenue: number,
  categoryGroup: keyof typeof DE_BELOW_STANDARD_RATES,
  isExtended: boolean, // true = 4+ consecutive months → +1% to override rates
): number {
  const rates = DE_BELOW_STANDARD_RATES[categoryGroup]
  const bonus = isExtended ? 1 : 0
  const rate990 = (rates.upTo990 + bonus) / 100
  const rateAbove = (rates.above + bonus) / 100
  const threshold = 990

  if (totalRevenue <= threshold) return totalRevenue * rate990
  return (threshold * rate990) + ((totalRevenue - threshold) * rateAbove)
}

// DE Very High INAD FVF override calculator
export function calcDEINADFVF(
  totalRevenue: number,
  categoryGroup: keyof typeof DE_INAD_RATES,
  isExtended: boolean,
): number {
  const rates = DE_INAD_RATES[categoryGroup]
  const bonus = isExtended ? 1 : 0
  const rate990 = (rates.upTo990 + bonus) / 100
  const rateAbove = (rates.above + bonus) / 100
  const threshold = 990

  if (totalRevenue <= threshold) return totalRevenue * rate990
  return (threshold * rate990) + ((totalRevenue - threshold) * rateAbove)
}
// =============================================================================
// FR FEE TABLE
// Verified against official eBay.fr business seller fee page + Gemini audit 2026
// KEY FACTS:
//   - All fees EXCLUSIVE of 20% French VAT (TVA)
//   - VAT-registered sellers pay fees as shown
//   - Non-VAT-registered sellers: all fees × 1.20
//   - Per-order: flat €0.35 (NO split for ≤€10 / >€10 like DE)
//   - Regulatory fee: 0.35% on total sale
//   - Shop subscriptions do NOT change FVF % (unlike DE/US/CA)
//   - Top Rated: 10% off variable FVF only
//   - Below Standard: +6/+7 percentage POINTS (UK-style math)
//   - Very High INAD: +4/+5 percentage POINTS (same as UK)
//   - International: Eurozone+Sweden 0% / Europe non-Euro 1.6% / UK 1.2% / Other 3.3%
// =============================================================================

export type FRCategoryKey =
  | 'electronics_devices'      // 5% flat
  | 'electronics_accessories'  // 7.5% flat
  | 'auto_parts'               // 9% flat
  | 'tires_wheels'             // 5% up to €500 → 2% above
  | 'home_garden'              // 9% flat
  | 'watches_handbags'         // 12% up to €990 → 2% above
  | 'jewelry'                  // 12% up to €990 → 4% above
  | 'fashion'                  // 12% flat
  | 'collectibles'             // 9% up to €990 → 2% above
  | 'default'                  // 9% flat (all other categories)

interface FRCategoryFee {
  label: string
  structure: FeeStructure   // single table — shop tier does NOT change FVF in FR
}

export const FR_TIERED_FEES: Record<FRCategoryKey, FRCategoryFee> = {
  electronics_devices: {
    label: 'Electronics — devices (photo, phones, computers, consoles)',
    structure: { type: 'flat', rate: 5.0 },
  },
  electronics_accessories: {
    label: 'Electronics — tech accessories',
    structure: { type: 'flat', rate: 7.5 },
  },
  auto_parts: {
    label: 'Auto & Moto — parts & accessories',
    structure: { type: 'flat', rate: 9.0 },
  },
  tires_wheels: {
    label: 'Tires & wheels',
    structure: { type: 'progressive', brackets: [{ upTo: 500, rate: 5.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  home_garden: {
    label: 'Home, Garden, DIY, Pets, Baby, Appliances',
    structure: { type: 'flat', rate: 9.0 },
  },
  watches_handbags: {
    label: "Watches & Women's bags & handbags",
    structure: { type: 'progressive', brackets: [{ upTo: 990, rate: 12.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  jewelry: {
    label: 'Jewelry & watches (excl. watches subcategory)',
    structure: { type: 'progressive', brackets: [{ upTo: 990, rate: 12.0 }, { upTo: Infinity, rate: 4.0 }] },
  },
  fashion: {
    label: 'Fashion — clothing, luggage & beauty',
    structure: { type: 'flat', rate: 12.0 },
  },
  collectibles: {
    label: 'Collectibles — art, antiques, coins, stamps, toys, trading cards',
    structure: { type: 'progressive', brackets: [{ upTo: 990, rate: 9.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  default: {
    label: 'Other categories — musical instruments, music, games, books, boats',
    structure: { type: 'flat', rate: 9.0 },
  },
}

// FR international fee rates — same 4-tier as DE
export const FR_INTL_FEES = {
  none: 0,
  eurozone: 0,
  europe_other: 1.6,
  uk: 1.2,
  other: 3.3,
}

// =============================================================================
// FR FVF CALCULATOR
// Single table — FR shop tier does NOT change FVF %
// =============================================================================

export function calcFRFVF(
  totalRevenue: number,
  categoryKey: FRCategoryKey,
): { fvfAmount: number } {

  const cat = FR_TIERED_FEES[categoryKey] ?? FR_TIERED_FEES['default']
  const structure = cat.structure

  if (structure.type === 'flat') {
    return { fvfAmount: totalRevenue * (structure.rate / 100) }
  }

  // Progressive brackets
  let fvfAmount = 0
  let remaining = totalRevenue
  let prevUpTo = 0

  for (const bracket of (structure as any).brackets) {
    if (remaining <= 0) break
    const bracketSize = bracket.upTo === Infinity ? remaining : Math.min(remaining, bracket.upTo - prevUpTo)
    const portionInBracket = Math.min(remaining, bracketSize)
    fvfAmount += portionInBracket * (bracket.rate / 100)
    remaining -= portionInBracket
    prevUpTo = bracket.upTo
    if (bracket.upTo === Infinity) break
  }

  return { fvfAmount }
}

// =============================================================================
// IT FEE TABLE
// Verified against official eBay.it business seller fee page 2026
// KEY FACTS:
//   - All fees EXCLUSIVE of 22% Italian VAT (IVA) — different from FR (20%)
//   - Per-order: flat €0.35 (same as FR, no split)
//   - Regulatory fee: 0.35% on total sale
//   - Shop subscriptions do NOT change FVF %
//   - Top Rated: 10% off variable FVF only
//   - Below Standard: +6/+7 percentage POINTS (UK-style math)
//   - Very High INAD: +4/+5 percentage POINTS (same as FR/UK)
//   - International: Eurozone+Sweden 0% / Europe non-Euro 1.6% / UK 1.2% / Other 3.3%
//   - IT has unique category rates — significantly different from FR
// =============================================================================

export type ITCategoryKey =
  | 'moto_parts'             // 12% flat
  | 'auto_parts'             // 12.5% flat (higher than moto)
  | 'tires_wheels'           // 6.5% up to €500 → 2% above
  | 'home_fmcg'              // 11% flat (home/crafts/baby/food)
  | 'garden_outdoor'         // 12% flat
  | 'garden_furniture'       // 12% up to €250 → 10% above
  | 'home_spare_parts'       // 9.5% flat
  | 'tech_devices'           // 6.5% flat
  | 'tech_accessories'       // 8.5% flat
  | 'other_electronics'      // 9.5% flat
  | 'trading_cards'          // 6.5% up to €990 → 2% above
  | 'art_collectibles'       // 11% up to €990 → 2% above
  | 'comics'                 // 6.5% flat
  | 'watches'                // 11% up to €100 → 5% up to €990 → 2% above (3 brackets)
  | 'jewelry'                // 11% up to €990 → 4% above
  | 'shoes'                  // 11% up to €100 → 5% above (2 brackets)
  | 'bags_handbags'          // 11% up to €990 → 2% above
  | 'beauty_electric'        // 6.5% flat
  | 'default'                // 11% flat (clothing/beauty/sports/music/DVD/books/games/B2B)

interface ITCategoryFee {
  label: string
  structure: FeeStructure
}

export const IT_TIERED_FEES: Record<ITCategoryKey, ITCategoryFee> = {
  moto_parts: {
    label: 'Moto parts & accessories',
    structure: { type: 'flat', rate: 12.0 },
  },
  auto_parts: {
    label: 'Auto parts & accessories (cat. 6030)',
    structure: { type: 'flat', rate: 12.5 },
  },
  tires_wheels: {
    label: 'Tires & wheels',
    structure: { type: 'progressive', brackets: [{ upTo: 500, rate: 6.5 }, { upTo: Infinity, rate: 2.0 }] },
  },
  home_fmcg: {
    label: 'Home décor & FMCG (home/crafts/baby/food)',
    structure: { type: 'flat', rate: 11.0 },
  },
  garden_outdoor: {
    label: 'Garden & outdoor',
    structure: { type: 'flat', rate: 12.0 },
  },
  garden_furniture: {
    label: 'Garden furniture, pools & sheds',
    structure: { type: 'progressive', brackets: [{ upTo: 250, rate: 12.0 }, { upTo: Infinity, rate: 10.0 }] },
  },
  home_spare_parts: {
    label: 'Home & garden spare parts',
    structure: { type: 'flat', rate: 9.5 },
  },
  tech_devices: {
    label: 'Tech — devices (phones, TV, laptops, consoles, appliances)',
    structure: { type: 'flat', rate: 6.5 },
  },
  tech_accessories: {
    label: 'Tech — accessories (TV/instruments/photo/phones/computers broad)',
    structure: { type: 'flat', rate: 8.5 },
  },
  other_electronics: {
    label: 'Other electronic accessories (mobile/laptop/TV/photo accessories)',
    structure: { type: 'flat', rate: 9.5 },
  },
  trading_cards: {
    label: 'Trading cards & collectible characters',
    structure: { type: 'progressive', brackets: [{ upTo: 990, rate: 6.5 }, { upTo: Infinity, rate: 2.0 }] },
  },
  art_collectibles: {
    label: 'Art, antiques, toys, stamps, coins & collectibles',
    structure: { type: 'progressive', brackets: [{ upTo: 990, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  comics: {
    label: 'Comics (all types)',
    structure: { type: 'flat', rate: 6.5 },
  },
  watches: {
    label: 'Watches (3-bracket: 11% → 5% → 2%)',
    // 11% up to €100 / 5% from €100 to €990 / 2% above €990
    structure: { type: 'progressive', brackets: [{ upTo: 100, rate: 11.0 }, { upTo: 990, rate: 5.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  jewelry: {
    label: 'Jewelry & watches (excl. watches subcategory)',
    structure: { type: 'progressive', brackets: [{ upTo: 990, rate: 11.0 }, { upTo: Infinity, rate: 4.0 }] },
  },
  shoes: {
    label: "Shoes — men's & women's (11% → 5%)",
    // 11% up to €100 / 5% above €100
    structure: { type: 'progressive', brackets: [{ upTo: 100, rate: 11.0 }, { upTo: Infinity, rate: 5.0 }] },
  },
  bags_handbags: {
    label: 'Bags & handbags',
    structure: { type: 'progressive', brackets: [{ upTo: 990, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  beauty_electric: {
    label: 'Beauty & health — electric devices',
    structure: { type: 'flat', rate: 6.5 },
  },
  default: {
    label: 'Other categories — clothing, beauty, sports, music, DVD, books, games, B2B',
    structure: { type: 'flat', rate: 11.0 },
  },
}

// IT international fee rates — same 4-tier as DE/FR
export const IT_INTL_FEES = {
  none: 0,
  eurozone: 0,
  europe_other: 1.6,
  uk: 1.2,
  other: 3.3,
}

// =============================================================================
// IT FVF CALCULATOR
// Single table — IT shop tier does NOT change FVF %
// =============================================================================

export function calcITFVF(
  totalRevenue: number,
  categoryKey: ITCategoryKey,
): { fvfAmount: number } {

  const cat = IT_TIERED_FEES[categoryKey] ?? IT_TIERED_FEES['default']
  const structure = cat.structure

  if (structure.type === 'flat') {
    return { fvfAmount: totalRevenue * (structure.rate / 100) }
  }

  // Progressive brackets (handles 2-bracket and 3-bracket categories)
  let fvfAmount = 0
  let remaining = totalRevenue
  let prevUpTo = 0

  for (const bracket of (structure as any).brackets) {
    if (remaining <= 0) break
    const bracketSize = bracket.upTo === Infinity ? remaining : Math.min(remaining, bracket.upTo - prevUpTo)
    const portionInBracket = Math.min(remaining, bracketSize)
    fvfAmount += portionInBracket * (bracket.rate / 100)
    remaining -= portionInBracket
    prevUpTo = bracket.upTo
    if (bracket.upTo === Infinity) break
  }

  return { fvfAmount }
}

// =============================================================================
// ES FEE TABLE
// Verified against official eBay.es business seller fee page 2026
// KEY FACTS:
//   - All fees EXCLUSIVE of 21% Spanish VAT (IVA) — different from IT (22%), FR (20%)
//   - Per-order: €0.35 (≤€10) / €0.45 (>€10) — same split as DE, NOT flat like FR/IT
//   - Regulatory fee: 0.35% on total sale
//   - Shop subscriptions do NOT change FVF %
//   - Top Rated (Excelente): 10% off variable FVF only — Gemini said 20% but official page says 10%
//   - Below Standard: +6/+7 percentage POINTS (UK-style math)
//   - Very High INAD: +4/+5 percentage POINTS
//   - International: Eurozone+Sweden 0% / Europe non-Euro 1.6% / UK 1.2% / Other 3.3%
//   - Default: 9% up to €990 → 2% — most categories
//   - Tech threshold is €300 (not €500) — verified from official page
// =============================================================================

export type ESCategoryKey =
  | 'tech_devices'        // 5% up to €300 → 2% above
  | 'beauty_electric'     // 5% up to €300 → 2% above (same as tech devices)
  | 'tech_accessories'    // 7.5% up to €200 → 2% above
  | 'auto_electronics'    // 9% up to €300 → 2% above
  | 'tires_wheels'        // 5% up to €500 → 2% above
  | 'watches_jewelry'     // 9% up to €400 → 2% above (combined — no split like other markets)
  | 'home_garden'         // 9% up to €200 → 2% above
  | 'musical_instruments' // 9% up to €300 → 2% above
  | 'default'             // 9% up to €990 → 2% above (most categories)

interface ESCategoryFee {
  label: string
  structure: FeeStructure
}

export const ES_TIERED_FEES: Record<ESCategoryKey, ESCategoryFee> = {
  tech_devices: {
    label: 'Tech devices (cameras, computers, phones, TVs, consoles, appliances)',
    structure: { type: 'progressive', brackets: [{ upTo: 300, rate: 5.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  beauty_electric: {
    label: 'Beauty & health — electric devices (shavers, hairdryers, massagers)',
    structure: { type: 'progressive', brackets: [{ upTo: 300, rate: 5.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  tech_accessories: {
    label: 'Tech accessories (cables, memory cards, software, accessories)',
    structure: { type: 'progressive', brackets: [{ upTo: 200, rate: 7.5 }, { upTo: Infinity, rate: 2.0 }] },
  },
  auto_electronics: {
    label: 'Auto electronics (GPS, car entertainment, parking assistance)',
    structure: { type: 'progressive', brackets: [{ upTo: 300, rate: 9.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  tires_wheels: {
    label: 'Tires & wheels',
    structure: { type: 'progressive', brackets: [{ upTo: 500, rate: 5.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  watches_jewelry: {
    label: 'Watches & jewelry (combined)',
    structure: { type: 'progressive', brackets: [{ upTo: 400, rate: 9.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  home_garden: {
    label: 'Home, garden & DIY (terraza, jardín, bricolaje)',
    structure: { type: 'progressive', brackets: [{ upTo: 200, rate: 9.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  musical_instruments: {
    label: 'Musical instruments',
    structure: { type: 'progressive', brackets: [{ upTo: 300, rate: 9.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  default: {
    label: 'Other categories (default) — clothing, sports, collectibles, books, etc.',
    structure: { type: 'progressive', brackets: [{ upTo: 990, rate: 9.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
}

// ES international fee rates — same 4-tier as DE/FR/IT
export const ES_INTL_FEES = {
  none: 0,
  eurozone: 0,
  europe_other: 1.6,
  uk: 1.2,
  other: 3.3,
}

// =============================================================================
// ES FVF CALCULATOR
// Single table — ES shop tier does NOT change FVF %
// =============================================================================

export function calcESFVF(
  totalRevenue: number,
  categoryKey: ESCategoryKey,
): { fvfAmount: number } {

  const cat = ES_TIERED_FEES[categoryKey] ?? ES_TIERED_FEES['default']
  const structure = cat.structure

  // All ES categories use progressive brackets
  let fvfAmount = 0
  let remaining = totalRevenue
  let prevUpTo = 0

  for (const bracket of (structure as any).brackets) {
    if (remaining <= 0) break
    const bracketSize = bracket.upTo === Infinity ? remaining : Math.min(remaining, bracket.upTo - prevUpTo)
    const portionInBracket = Math.min(remaining, bracketSize)
    fvfAmount += portionInBracket * (bracket.rate / 100)
    remaining -= portionInBracket
    prevUpTo = bracket.upTo
    if (bracket.upTo === Infinity) break
  }

  return { fvfAmount }
}

// =============================================================================
// AT FEE TABLE
// Verified against official eBay.at business seller fee page 2026
// KEY FACTS:
//   - All fees EXCLUSIVE of 20% Austrian VAT (USt)
//   - Per-order: €0.35 (≤€10) / €0.45 (>€10) — same as DE
//   - Regulatory fee: 0.35% on total sale
//   - Shop subscription DOES change thresholds (similar to DE but different rates)
//   - NO July 2026 tech restructure (condition-based flat rates)
//   - Platin-Shop available via eBay.de for AT sellers
//   - Below Standard: +6/+7 percentage POINTS (UK-style)
//   - Very High INAD: +4/+5 percentage POINTS
//   - International: Eurozone+Sweden 0% / Europe non-Euro 1.6% / UK 1.2% / Other 3.3%
// =============================================================================

export type ATCategoryKey =
  | 'tech_devices'           // 6.5% up to €300 (shop) / €990 (no shop) → 2%
  | 'tech_accessories'       // 11% up to €200 (shop) / €990 (no shop) → 2%
  | 'auto_parts'             // 12% up to €990 → 2%
  | 'auto_electronics'       // 6.5% up to €300 (shop) / €990 (no shop) → 2%
  | 'auto_tires'             // 6.5% up to €990 → 2%
  | 'auto_clothing'          // 11% up to €990 → 2%
  | 'business_industrial'    // 11% up to €990 → 2%
  | 'garden_diy'             // 12% up to €200 (shop) / €990 (no shop) → 2%
  | 'clothing'               // 12% up to €990 → 2%
  | 'watches_jewelry'        // 14% up to €400 (shop) / €990 (no shop) → 2%
  | 'wristwatches'           // 11% up to €400 (shop) / €990 (no shop) → 2%
  | 'media'                  // 9% up to €990 → 2%
  | 'musical_instruments'    // 11% up to €300 (shop) / €990 (no shop) → 2%
  | 'nfts'                   // 5% flat
  | 'default'                // 11% up to €990 → 2%

interface ATCategoryFee {
  label: string
  noShop: FeeStructure
  hasShop: FeeStructure
}

export const AT_TIERED_FEES: Record<ATCategoryKey, ATCategoryFee> = {
  tech_devices: {
    label: 'Tech — devices (computers, phones, TV, consoles, appliances)',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 6.5 }, { upTo: Infinity, rate: 2.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 300, rate: 6.5 }, { upTo: Infinity, rate: 2.0 }] },
  },
  tech_accessories: {
    label: 'Tech — accessories (cables, peripherals, photo accessories)',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 200, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  auto_parts: {
    label: 'Auto & Motorrad — parts & accessories (general)',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 12.0 }, { upTo: Infinity, rate: 2.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 12.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  auto_electronics: {
    label: 'Auto — electronics, GPS, entertainment, parking assist',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 6.5 }, { upTo: Infinity, rate: 2.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 300, rate: 6.5 }, { upTo: Infinity, rate: 2.0 }] },
  },
  auto_tires: {
    label: 'Auto — tires, wheels & rims',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 6.5 }, { upTo: Infinity, rate: 2.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 6.5 }, { upTo: Infinity, rate: 2.0 }] },
  },
  auto_clothing: {
    label: 'Auto — clothing, safety gear, motor oil, travel',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  business_industrial: {
    label: 'Business & Industrial',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  garden_diy: {
    label: 'Garden, patio & DIY (Heimwerker)',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 12.0 }, { upTo: Infinity, rate: 2.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 200, rate: 12.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  clothing: {
    label: 'Clothing & accessories',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 12.0 }, { upTo: Infinity, rate: 2.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 12.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  watches_jewelry: {
    label: 'Watches & jewelry (general)',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 14.0 }, { upTo: Infinity, rate: 2.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 400, rate: 14.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  wristwatches: {
    label: 'Wristwatches, pocket watches & accessories',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 400, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  media: {
    label: 'Media — films, music, tickets, games',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 9.0 }, { upTo: Infinity, rate: 2.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 9.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  musical_instruments: {
    label: 'Musical instruments',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 300, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  nfts: {
    label: 'NFTs (all categories)',
    noShop: { type: 'flat', rate: 5.0 },
    hasShop: { type: 'flat', rate: 5.0 },
  },
  default: {
    label: 'Other categories — antiques, baby, crafts, beauty, stamps, books, pets, furniture, toys, sports, coins, collectibles',
    noShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
    hasShop: { type: 'progressive', brackets: [{ upTo: 990, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
}

// AT international fee rates — same 4-tier as DE/FR/IT/ES
export const AT_INTL_FEES = {
  none: 0,
  eurozone: 0,
  europe_other: 1.6,
  uk: 1.2,
  other: 3.3,
}

// =============================================================================
// AT FVF CALCULATOR
// Two tables (noShop / hasShop) — shop changes thresholds on some categories
// =============================================================================

export function calcATFVF(
  totalRevenue: number,
  categoryKey: ATCategoryKey,
  hasShop: boolean,
): { fvfAmount: number } {

  const cat = AT_TIERED_FEES[categoryKey] ?? AT_TIERED_FEES['default']
  const structure = hasShop ? cat.hasShop : cat.noShop

  if (structure.type === 'flat') {
    return { fvfAmount: totalRevenue * (structure.rate / 100) }
  }

  let fvfAmount = 0
  let remaining = totalRevenue
  let prevUpTo = 0

  for (const bracket of (structure as any).brackets) {
    if (remaining <= 0) break
    const bracketSize = bracket.upTo === Infinity ? remaining : Math.min(remaining, bracket.upTo - prevUpTo)
    const portionInBracket = Math.min(remaining, bracketSize)
    fvfAmount += portionInBracket * (bracket.rate / 100)
    remaining -= portionInBracket
    prevUpTo = bracket.upTo
    if (bracket.upTo === Infinity) break
  }

  return { fvfAmount }
}

// =============================================================================
// IE FEE TABLE
// Verified against official eBay.ie business seller fee page 2026
// KEY FACTS:
//   - All fees EXCLUSIVE of 23% Irish VAT (highest VAT of all markets)
//   - Per-order: €0.35 (≤€10) / €0.45 (>€10) — same as DE/ES/AT
//   - Regulatory fee: 0.35% on total sale
//   - Shop subscriptions do NOT change FVF % — Basic €19.50 / Featured €39.50 / Anchor €149.50
//   - Top Rated: 10% off variable FVF only
//   - Below Standard: +6/+7 percentage POINTS (UK-style math)
//   - Very High INAD: +4/+5 percentage POINTS
//   - International: Eurozone+Sweden 0% / Europe non-Euro 1.6% / UK 1.2% / Other 3.3%
//   - UNIQUE: Electronic accessories at 6.5% (lower than most markets)
//   - UNIQUE: Appliances at 11% (higher than core tech 6.5%)
//   - UNIQUE: Jewellery & Watches combined at 11% (much lower than DE/AT)
//   - UNIQUE: No shop threshold changes (unlike AT/DE)
// =============================================================================

export type IECategoryKey =
  | 'tech_core'           // 6.5% up to €300 → 2% (computers, cameras, phones, consoles, sound)
  | 'tech_appliances'     // 11% up to €300 → 2% (appliances, electric personal care)
  | 'tech_accessories'    // 6.5% up to €200 → 2% (all electronic accessories)
  | 'auto_electronics'    // 11% up to €300 → 2% (in-car entertainment, GPS, dash cams)
  | 'auto_tires'          // 6.5% up to €990 → 2% (wheels, tyres, parts)
  | 'jewellery_watches'   // 11% up to €400 → 2% (combined — no split)
  | 'home_garden'         // 11% up to €200 → 2% (garden, patio, DIY)
  | 'musical_instruments' // 11% up to €300 → 2%
  | 'nfts'                // 5% flat
  | 'default'             // 11% up to €990 → 2% (all other categories)

interface IECategoryFee {
  label: string
  structure: FeeStructure  // single table — IE shop does NOT change FVF %
}

export const IE_TIERED_FEES: Record<IECategoryKey, IECategoryFee> = {
  tech_core: {
    label: 'Tech — core devices (computers, cameras, phones, consoles, sound & vision)',
    structure: { type: 'progressive', brackets: [{ upTo: 300, rate: 6.5 }, { upTo: Infinity, rate: 2.0 }] },
  },
  tech_appliances: {
    label: 'Tech — appliances & electric personal care (shavers, oral care, hair)',
    structure: { type: 'progressive', brackets: [{ upTo: 300, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  tech_accessories: {
    label: 'Electronics accessories (TV, camera, tablet, printer, phone, laptop, audio accessories)',
    structure: { type: 'progressive', brackets: [{ upTo: 200, rate: 6.5 }, { upTo: Infinity, rate: 2.0 }] },
  },
  auto_electronics: {
    label: 'Auto/Moto — electronics (in-car entertainment, GPS, dash cams, parking)',
    structure: { type: 'progressive', brackets: [{ upTo: 300, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  auto_tires: {
    label: 'Auto/Moto — tyres, wheels & parts',
    structure: { type: 'progressive', brackets: [{ upTo: 990, rate: 6.5 }, { upTo: Infinity, rate: 2.0 }] },
  },
  jewellery_watches: {
    label: 'Jewellery & watches (combined — including clocks)',
    structure: { type: 'progressive', brackets: [{ upTo: 400, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  home_garden: {
    label: 'Home & garden — garden, patio & DIY materials',
    structure: { type: 'progressive', brackets: [{ upTo: 200, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  musical_instruments: {
    label: 'Musical instruments & DJ equipment',
    structure: { type: 'progressive', brackets: [{ upTo: 300, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  nfts: {
    label: 'NFTs (all categories)',
    structure: { type: 'flat', rate: 5.0 },
  },
  default: {
    label: 'Other categories (default) — clothing, sports, collectibles, books, beauty, etc.',
    structure: { type: 'progressive', brackets: [{ upTo: 990, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
}

// IE international fee rates — same 4-tier as all European markets
export const IE_INTL_FEES = {
  none: 0,
  eurozone: 0,
  europe_other: 1.6,
  uk: 1.2,
  other: 3.3,
}

// =============================================================================
// IE FVF CALCULATOR
// Single table — IE shop does NOT change FVF %
// =============================================================================

export function calcIEFVF(
  totalRevenue: number,
  categoryKey: IECategoryKey,
): { fvfAmount: number } {

  const cat = IE_TIERED_FEES[categoryKey] ?? IE_TIERED_FEES['default']
  const structure = cat.structure

  if (structure.type === 'flat') {
    return { fvfAmount: totalRevenue * (structure.rate / 100) }
  }

  let fvfAmount = 0
  let remaining = totalRevenue
  let prevUpTo = 0

  for (const bracket of (structure as any).brackets) {
    if (remaining <= 0) break
    const bracketSize = bracket.upTo === Infinity ? remaining : Math.min(remaining, bracket.upTo - prevUpTo)
    const portionInBracket = Math.min(remaining, bracketSize)
    fvfAmount += portionInBracket * (bracket.rate / 100)
    remaining -= portionInBracket
    prevUpTo = bracket.upTo
    if (bracket.upTo === Infinity) break
  }

  return { fvfAmount }
}

// =============================================================================
// PL FEE TABLE
// Verified against official eBay.pl business seller fee page 2026
// KEY FACTS:
//   - Currency: Polish Złoty (PLN) — NOT Euro like other European markets
//   - All fees EXCLUSIVE of 23% Polish VAT (same rate as Ireland)
//   - Per-order: 1.35 zł (≤45 zł) / 1.90 zł (>45 zł) — in PLN, not EUR
//   - Regulatory fee: 0.35% on total sale
//   - Shop subscriptions do NOT change FVF % — Mały 89zł / Duży 179zł / Mega 669zł
//   - Top Rated (Najlepszy Sprzedawca): 10% off variable FVF only
//   - Below Standard: +6 percentage POINTS (UK-style math) — NO +7% after 4 months
//   - International: Eurozone+Sweden 0% / Europe non-Euro 1.6% / UK 1.2% / Other 3.3%
//   - All thresholds in PLN (approx 4.5x the Euro equivalents)
// =============================================================================

export type PLCategoryKey =
  | 'tech_core'           // 6.5% up to 1,400 zł → 2%
  | 'tech_appliances'     // 11% up to 1,400 zł → 2%
  | 'tech_accessories'    // 6.5% up to 900 zł → 2%
  | 'auto_electronics'    // 11% up to 1,400 zł → 2%
  | 'auto_tires'          // 6.5% up to 4,600 zł → 2%
  | 'jewellery_watches'   // 11% up to 1,900 zł → 2%
  | 'home_garden'         // 11% up to 900 zł → 2%
  | 'musical_instruments' // 11% up to 1,400 zł → 2%
  | 'default'             // 11% up to 4,600 zł → 2%

interface PLCategoryFee {
  label: string
  structure: FeeStructure
}

export const PL_TIERED_FEES: Record<PLCategoryKey, PLCategoryFee> = {
  tech_core: {
    label: 'Tech — urządzenia elektroniczne (TV, komputery, kamery, telefony, konsole)',
    structure: { type: 'progressive', brackets: [{ upTo: 1400, rate: 6.5 }, { upTo: Infinity, rate: 2.0 }] },
  },
  tech_appliances: {
    label: 'Tech — sprzęt AGD i urządzenia pielęgnacyjne (elektryczne)',
    structure: { type: 'progressive', brackets: [{ upTo: 1400, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  tech_accessories: {
    label: 'Akcesoria elektroniczne (kable, akcesoria do telefonów, kamer, laptopów)',
    structure: { type: 'progressive', brackets: [{ upTo: 900, rate: 6.5 }, { upTo: Infinity, rate: 2.0 }] },
  },
  auto_electronics: {
    label: 'Auto/Moto — elektronika (multimedia, GPS, kamery, systemy parkowania)',
    structure: { type: 'progressive', brackets: [{ upTo: 1400, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  auto_tires: {
    label: 'Auto/Moto — felgi i opony',
    structure: { type: 'progressive', brackets: [{ upTo: 4600, rate: 6.5 }, { upTo: Infinity, rate: 2.0 }] },
  },
  jewellery_watches: {
    label: 'Biżuteria i zegarki',
    structure: { type: 'progressive', brackets: [{ upTo: 1900, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  home_garden: {
    label: 'Dom i ogród — ogród, taras i majsterkowanie',
    structure: { type: 'progressive', brackets: [{ upTo: 900, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  musical_instruments: {
    label: 'Instrumenty muzyczne',
    structure: { type: 'progressive', brackets: [{ upTo: 1400, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  default: {
    label: 'Pozostałe kategorie (domyślna) — odzież, sport, kolekcje, książki, uroda itp.',
    structure: { type: 'progressive', brackets: [{ upTo: 4600, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
}

// PL international fee rates — same 4-tier as all European markets
export const PL_INTL_FEES = {
  none: 0,
  eurozone: 0,
  europe_other: 1.6,
  uk: 1.2,
  other: 3.3,
}

// =============================================================================
// PL FVF CALCULATOR
// Single table — PL shop does NOT change FVF %
// NOTE: Thresholds are in PLN not EUR
// =============================================================================

export function calcPLFVF(
  totalRevenue: number,
  categoryKey: PLCategoryKey,
): { fvfAmount: number } {

  const cat = PL_TIERED_FEES[categoryKey] ?? PL_TIERED_FEES['default']
  const structure = cat.structure

  let fvfAmount = 0
  let remaining = totalRevenue
  let prevUpTo = 0

  for (const bracket of (structure as any).brackets) {
    if (remaining <= 0) break
    const bracketSize = bracket.upTo === Infinity ? remaining : Math.min(remaining, bracket.upTo - prevUpTo)
    const portionInBracket = Math.min(remaining, bracketSize)
    fvfAmount += portionInBracket * (bracket.rate / 100)
    remaining -= portionInBracket
    prevUpTo = bracket.upTo
    if (bracket.upTo === Infinity) break
  }

  return { fvfAmount }
}

// =============================================================================
// CH FEE TABLE
// Verified against official eBay.ch business seller fee page 2026
// KEY FACTS:
//   - Currency: Swiss Franc (CHF) — NOT Euro
//   - All fees EXCLUSIVE of 8.1% Swiss VAT (lowest VAT of all markets, non-EU)
//   - Per-order: CHF 0.55 (≤CHF 10) / CHF 0.65 (>CHF 10) — in CHF
//   - Regulatory fee: 0.35% on total sale
//   - Shop: Basis CHF19.50 / Top CHF49.50 / Premium CHF159.50 — no FVF change
//   - Top Rated: 10% off variable FVF only
//   - Below Standard: +6/+7 percentage POINTS (same as DE/AT)
//   - UNIQUE international structure: Switzerland itself is in the FREE tier
//     - Eurozone + Sweden + Switzerland: FREE
//     - Europe (non-Euro/non-Sweden/non-CH/non-UK): 1.6%
//     - USA & Canada: 1.2%
//     - UK + All other: 3.3%
//   - Category rates identical to IE/NL/BE but thresholds in CHF not EUR
//   - NFTs: 5% flat (confirmed)
// =============================================================================

export type CHCategoryKey =
  | 'tech_core'           // 6.5% up to CHF 300 → 2%
  | 'tech_appliances'     // 11% up to CHF 300 → 2%
  | 'tech_accessories'    // 6.5% up to CHF 200 → 2%
  | 'auto_electronics'    // 11% up to CHF 300 → 2%
  | 'auto_tires'          // 6.5% up to CHF 990 → 2%
  | 'home_garden'         // 11% up to CHF 200 → 2%
  | 'watches_jewelry'     // 11% up to CHF 400 → 2%
  | 'musical_instruments' // 11% up to CHF 300 → 2%
  | 'nfts'                // 5% flat
  | 'default'             // 11% up to CHF 990 → 2%

interface CHCategoryFee {
  label: string
  structure: FeeStructure
}

export const CH_TIERED_FEES: Record<CHCategoryKey, CHCategoryFee> = {
  tech_core: {
    label: 'Tech — Geräte (computers, cameras, phones, consoles, memory cards, TV)',
    structure: { type: 'progressive', brackets: [{ upTo: 300, rate: 6.5 }, { upTo: Infinity, rate: 2.0 }] },
  },
  tech_appliances: {
    label: 'Tech — Haushaltsgeräte & elektrische Pflegegeräte (appliances, shavers, hair styling)',
    structure: { type: 'progressive', brackets: [{ upTo: 300, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  tech_accessories: {
    label: 'Tech — Zubehör (all electronic accessories, cables, peripherals)',
    structure: { type: 'progressive', brackets: [{ upTo: 200, rate: 6.5 }, { upTo: Infinity, rate: 2.0 }] },
  },
  auto_electronics: {
    label: 'Auto & Motorrad — Elektronik (car entertainment, dashcams, GPS, parking)',
    structure: { type: 'progressive', brackets: [{ upTo: 300, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  auto_tires: {
    label: 'Auto & Motorrad — Autoreifen & Felgen (tyres and rims)',
    structure: { type: 'progressive', brackets: [{ upTo: 990, rate: 6.5 }, { upTo: Infinity, rate: 2.0 }] },
  },
  home_garden: {
    label: 'Haus & Garten — Garten, Terrasse & Heimwerker (garden, patio, DIY)',
    structure: { type: 'progressive', brackets: [{ upTo: 200, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  watches_jewelry: {
    label: 'Uhren und Schmuck (watches & jewelry combined)',
    structure: { type: 'progressive', brackets: [{ upTo: 400, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  musical_instruments: {
    label: 'Musikinstrumente (musical instruments)',
    structure: { type: 'progressive', brackets: [{ upTo: 300, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
  nfts: {
    label: 'NFTs (Digitale Ware — all NFT categories)',
    structure: { type: 'flat', rate: 5.0 },
  },
  default: {
    label: 'Other categories (default) — 11% up to CHF 990',
    structure: { type: 'progressive', brackets: [{ upTo: 990, rate: 11.0 }, { upTo: Infinity, rate: 2.0 }] },
  },
}

// CH international fee rates — UNIQUE structure
// Switzerland itself is in the free tier (not a eurozone member but treated as free)
export const CH_INTL_FEES = {
  none: 0,    // Domestic / Eurozone + Sweden + Switzerland
  europe_other: 1.6,  // Europe excl. Eurozone/Sweden/CH/UK
  us_canada: 1.2,  // USA & Canada
  uk_other: 3.3,  // UK + all other countries
}

// =============================================================================
// CH FVF CALCULATOR
// Single table — CH shop does NOT change FVF %
// NOTE: Thresholds are in CHF not EUR
// =============================================================================

export function calcCHFVF(
  totalRevenue: number,
  categoryKey: CHCategoryKey,
): { fvfAmount: number } {

  const cat = CH_TIERED_FEES[categoryKey] ?? CH_TIERED_FEES['default']
  const structure = cat.structure

  if (structure.type === 'flat') {
    return { fvfAmount: totalRevenue * (structure.rate / 100) }
  }

  let fvfAmount = 0
  let remaining = totalRevenue
  let prevUpTo = 0

  for (const bracket of (structure as any).brackets) {
    if (remaining <= 0) break
    const bracketSize = bracket.upTo === Infinity ? remaining : Math.min(remaining, bracket.upTo - prevUpTo)
    const portionInBracket = Math.min(remaining, bracketSize)
    fvfAmount += portionInBracket * (bracket.rate / 100)
    remaining -= portionInBracket
    prevUpTo = bracket.upTo
    if (bracket.upTo === Infinity) break
  }

  return { fvfAmount }
}

// =============================================================================
// UK FVF CALCULATOR
// Single table (no hasStore variant) — UK store tier does NOT change FVF %
// Returns { fvfAmount, noPerOrder }
// =============================================================================

export function calcUKFVF(
  totalRevenue: number,
  categoryKey: UKCategoryKey,
): { fvfAmount: number; noPerOrder: boolean; reducedPerOrder: boolean } {

  const cat = UK_TIERED_FEES[categoryKey] ?? UK_TIERED_FEES['default']
  const { structure, reducedPerOrder = false } = cat

  if (structure.type === 'flat') {
    return { fvfAmount: totalRevenue * (structure.rate / 100), noPerOrder: false, reducedPerOrder }
  }

  if (structure.type === 'switch') {
    const rate = totalRevenue <= structure.threshold ? structure.rateBelow : structure.rateAbove
    return {
      fvfAmount: totalRevenue * (rate / 100),
      noPerOrder: false,
      reducedPerOrder,
    }
  }

  // Progressive brackets
  let fvfAmount = 0
  let remaining = totalRevenue
  let prevUpTo = 0

  for (const bracket of structure.brackets) {
    if (remaining <= 0) break
    const bracketSize = bracket.upTo === Infinity ? remaining : Math.min(remaining, bracket.upTo - prevUpTo)
    const portionInBracket = Math.min(remaining, bracketSize)
    fvfAmount += portionInBracket * (bracket.rate / 100)
    remaining -= portionInBracket
    prevUpTo = bracket.upTo
    if (bracket.upTo === Infinity) break
  }

  return { fvfAmount, noPerOrder: false, reducedPerOrder }
}

// =============================================================================
// TIERED FVF CALCULATOR (US)
// Handles progressive brackets, price-switch categories, and flat fees.
// Returns { fvfAmount, noPerOrder }
// =============================================================================

export function calcTieredFVF(
  totalRevenue: number,
  categoryKey: USCategoryKey,
  hasStore: boolean,
): { fvfAmount: number; noPerOrder: boolean } {

  const cat = US_TIERED_FEES[categoryKey] ?? US_TIERED_FEES['default']
  const structure = hasStore ? cat.hasStore : cat.noStore

  if (structure.type === 'flat') {
    return { fvfAmount: totalRevenue * (structure.rate / 100), noPerOrder: false }
  }

  if (structure.type === 'switch') {
    const rate = totalRevenue <= structure.threshold ? structure.rateBelow : structure.rateAbove
    return {
      fvfAmount: totalRevenue * (rate / 100),
      noPerOrder: structure.noPerOrder && totalRevenue >= structure.threshold,
    }
  }

  // Progressive bracket calculation (like income tax brackets)
  // Each bracket's rate only applies to the portion of revenue within that bracket
  let fvfAmount = 0
  let remaining = totalRevenue
  let prevUpTo = 0

  for (const bracket of structure.brackets) {
    if (remaining <= 0) break
    const bracketSize = bracket.upTo === Infinity ? remaining : Math.min(remaining, bracket.upTo - prevUpTo)
    const portionInBracket = Math.min(remaining, bracketSize)
    fvfAmount += portionInBracket * (bracket.rate / 100)
    remaining -= portionInBracket
    prevUpTo = bracket.upTo
    if (bracket.upTo === Infinity) break
  }

  return { fvfAmount, noPerOrder: false }
}

// =============================================================================
// TYPES — ProfitEngine.calcInsertion()
// =============================================================================

export type InsertionCategoryType = 'regular' | 'motors' | 'realestate'

export interface InsertionFeeSettings {
  listingsUsedThisMonth: number
  freeAllowance: number
  unitsPerListing: number
  categoryType: InsertionCategoryType
}

export interface InsertionFeeResult {
  feeApplies: boolean
  feeFlat: number
  feePerUnit: number
  listingsOver: number
  isUnlimited: boolean
}

// =============================================================================
// TYPES — ProfitEngine.calcBulk()
// =============================================================================

export interface BulkSettings {
  unitsPurchased: number
  buyPricePerUnit: number
  profitPerUnit: number
  sellThroughPercent: number
  timeToSellDays: number
  bulkShipOverride: number
  regularShipping: number
  isRealisticMode: boolean
}

export interface BulkResult {
  totalInvestment: number
  unitsExpectedToSell: number
  unitsDeadStock: number
  deadStockLoss: number
  grossBulkProfit: number
  realBulkProfit: number
  bulkROI: number
  shippingSavingPerUnit: number
  salesPerDay: number
  monthsToClear: number
  breakEvenDay: number
  dollarPerDollarPerMonth: number
  velocityTier: 'EXCELLENT' | 'GOOD' | 'OK' | 'POOR'
  optimisticBreakEvenUnits: number
  realisticBreakEvenUnits: number
  currentBreakEvenUnits: number
  recoveryUnits: number
  profitUnits: number
  pureProfitValue: number
  recoveryPct: number
  profitPct: number
  deadStockPct: number
  bulkVsSingleDiffPercent: number
  showLowSellThroughWarning: boolean
  showSlowVelocityWarning: boolean
  showDeadCapitalWarning: boolean
}

// =============================================================================
// TYPES — ProfitEngine.calcScenarios()
// =============================================================================

export interface ScenarioSettings {
  sellingPrice: number
  buyPrice: number
  adjustedNetProfit: number
  totalCosts: number
  feeRateFraction: number
  perOrderFee: number
  insertionFeePerUnit: number
  currencySymbol: string
  bestOfferPrice: number
  targetProfit: number
  targetMargin: number
  reverseMode: 'profit' | 'margin'
  returnRatePercent: number
  returnShippingCost: number
  buyerPaidShipping: number
}

export interface ScenarioResult {
  offerNetProfit: number
  offerMargin: number
  offerRoi: number
  offerImpactPct: number
  offerVerdict: 'accept' | 'marginal' | 'breakeven' | 'reject'
  requiredPrice: number
  priceGap: number
  verifiedProfit: number
  verifiedMargin: number
  isImpossible: boolean
  successCount: number
  returnCount: number
  totalSuccessProfit: number
  totalReturnLoss: number
  netAfterReturns: number
  effectivePerUnit: number
  marginErosionPct: number
  showHighReturnWarning: boolean
}

// =============================================================================
// ENGINE CLASS
// =============================================================================

export class ProfitEngine {

  // ---------------------------------------------------------------------------
  // 1. CORE CALCULATION — per-sale profit
  // ---------------------------------------------------------------------------
  static calculate({
    sellingPrice,
    buyPrice,
    shippingCost,
    settings = DEFAULT_SETTINGS,
  }: {
    sellingPrice: number
    buyPrice: number
    shippingCost?: number
    settings?: ProfitSettings
  }): ProfitResult {

    if (sellingPrice <= 0 || buyPrice < 0) {
      return {
        netProfit: 0, profitMargin: 0, roi: 0,
        trueBuyCost: 0, totalCosts: 0, totalRevenue: 0,
        totalEbayFees: 0, finalValueFeeOnly: 0, promotedAdFee: 0,
        regulatoryFee: 0, crossBorderFee: 0, advancedDeductions: 0,
        totalCashback: 0, breakEvenPrice: 0, maxSafeAdRatePercent: 0,
        effectiveCatFeePercent: 0, topRatedDiscount: 0, belowStandardPenalty: 0,
        inadPenalty: 0, vatOnFees: 0, ukIntlFee: 0, caIntlFee: 0,
        auIntlFee: 0, auGSTSaving: 0, deIntlFee: 0, deVATOnFees: 0,
        frIntlFee: 0, frVATOnFees: 0, itIntlFee: 0, itVATOnFees: 0, esIntlFee: 0, esVATOnFees: 0, atIntlFee: 0, atVATOnFees: 0, ieIntlFee: 0, ieVATOnFees: 0, nlIntlFee: 0, nlVATOnFees: 0, plIntlFee: 0, plVATOnFees: 0, beIntlFee: 0, beVATOnFees: 0, chIntlFee: 0, chVATOnFees: 0,
      }
    }

    const actualShipping = shippingCost ?? settings.defaultShipping

    // ── 1. Revenue base ──────────────────────────────────────────────────────
    const buyerPaidShip = settings.buyerPaidShipping ?? 0
    const preTaxRevenue = sellingPrice + buyerPaidShip
    const taxCollected = preTaxRevenue * ((settings.buyerTaxPercent ?? 0) / 100)
    const totalRevenue = preTaxRevenue + taxCollected

    // ── 2. True sourcing cost ────────────────────────────────────────────────
    const taxCost = settings.isAdvancedEnabled ? buyPrice * (settings.sourcingTaxPercent / 100) : 0
    const baseBuyCost = buyPrice + taxCost
    const fxCost = settings.isAdvancedEnabled ? baseBuyCost * (settings.fxFeePercent / 100) : 0
    const trueBuyCost = baseBuyCost + fxCost
    const totalCosts = trueBuyCost + actualShipping

    // ── 3. Final Value Fee ───────────────────────────────────────────────────
    let rawFVF = 0
    let noPerOrder = false
    let reducedPerOrderApplies = false
    let effectiveCatFeePercent = 0

    if (settings.isUSMarket) {
      // US: use tiered fee lookup with hasStore variant
      const key = (settings.usCategoryKey ?? 'default') as USCategoryKey
      const tiered = calcTieredFVF(totalRevenue, key, settings.hasStore ?? false)
      rawFVF = tiered.fvfAmount
      noPerOrder = tiered.noPerOrder
      effectiveCatFeePercent = totalRevenue > 0 ? (rawFVF / totalRevenue) * 100 : 0

    } else if (settings.isUKMarket) {
      // UK: single table (no hasStore variant)
      const key = (settings.ukCategoryKey ?? 'default') as UKCategoryKey
      const ukFVF = calcUKFVF(totalRevenue, key)
      rawFVF = ukFVF.fvfAmount
      noPerOrder = ukFVF.noPerOrder
      reducedPerOrderApplies = ukFVF.reducedPerOrder
      effectiveCatFeePercent = totalRevenue > 0 ? (rawFVF / totalRevenue) * 100 : 0

    } else if (settings.isCAMarket) {
      // CA: two tables (noStore / hasStore)
      const key = (settings.caCategoryKey ?? 'default') as CACategoryKey
      const caFVF = calcCAFVF(totalRevenue, key, settings.caHasStore ?? false)
      rawFVF = caFVF.fvfAmount
      noPerOrder = caFVF.noPerOrder
      effectiveCatFeePercent = totalRevenue > 0 ? (rawFVF / totalRevenue) * 100 : 0

    } else if (settings.isAUMarket) {
      // AU: 4-plan × 4-tier lookup, single A$4,000 threshold
      const plan = (settings.auProPlan ?? 'starter') as AUProPlan
      const tier = (settings.auCategoryTier ?? 2) as AUCategoryTier
      const auFVF = calcAUFVF(totalRevenue, tier, plan)
      rawFVF = auFVF.fvfAmount
      noPerOrder = false
      effectiveCatFeePercent = totalRevenue > 0 ? (rawFVF / totalRevenue) * 100 : 0
        ; (settings as any)._auOrderFee = auFVF.orderFee

    } else if (settings.isDEMarket) {
      // DE: two tables (noShop / hasShop), July 2026 tech restructure
      const key = (settings.deCategoryKey ?? 'default') as DECategoryKey
      const deFVF = calcDEFVF(totalRevenue, key, settings.deHasShop ?? false)
      rawFVF = deFVF.fvfAmount
      noPerOrder = false
      effectiveCatFeePercent = totalRevenue > 0 ? (rawFVF / totalRevenue) * 100 : 0

    } else if (settings.isFRMarket) {
      // FR: single table, shop does NOT change FVF %
      const key = (settings.frCategoryKey ?? 'default') as FRCategoryKey
      const frFVF = calcFRFVF(totalRevenue, key)
      rawFVF = frFVF.fvfAmount
      noPerOrder = false
      effectiveCatFeePercent = totalRevenue > 0 ? (rawFVF / totalRevenue) * 100 : 0

    } else if (settings.isITMarket) {
      // IT: single table, shop does NOT change FVF %
      const key = (settings.itCategoryKey ?? 'default') as ITCategoryKey
      const itFVF = calcITFVF(totalRevenue, key)
      rawFVF = itFVF.fvfAmount
      noPerOrder = false
      effectiveCatFeePercent = totalRevenue > 0 ? (rawFVF / totalRevenue) * 100 : 0

    } else if (settings.isESMarket) {
      // ES: single table, shop does NOT change FVF %
      const key = (settings.esCategoryKey ?? 'default') as ESCategoryKey
      const esFVF = calcESFVF(totalRevenue, key)
      rawFVF = esFVF.fvfAmount
      noPerOrder = false
      effectiveCatFeePercent = totalRevenue > 0 ? (rawFVF / totalRevenue) * 100 : 0

    } else if (settings.isATMarket) {
      // AT: two tables (noShop / hasShop) — shop changes thresholds
      const key = (settings.atCategoryKey ?? 'default') as ATCategoryKey
      const atFVF = calcATFVF(totalRevenue, key, settings.atHasShop ?? false)
      rawFVF = atFVF.fvfAmount
      noPerOrder = false
      effectiveCatFeePercent = totalRevenue > 0 ? (rawFVF / totalRevenue) * 100 : 0

    } else if (settings.isIEMarket) {
      // IE: single table, shop does NOT change FVF %
      const key = (settings.ieCategoryKey ?? 'default') as IECategoryKey
      const ieFVF = calcIEFVF(totalRevenue, key)
      rawFVF = ieFVF.fvfAmount
      noPerOrder = false
      effectiveCatFeePercent = totalRevenue > 0 ? (rawFVF / totalRevenue) * 100 : 0

    } else if (settings.isNLMarket) {
      // NL: identical fee structure to IE, reuses IE fee table
      const key = (settings.nlCategoryKey ?? 'default') as IECategoryKey
      const nlFVF = calcIEFVF(totalRevenue, key)
      rawFVF = nlFVF.fvfAmount
      noPerOrder = false
      effectiveCatFeePercent = totalRevenue > 0 ? (rawFVF / totalRevenue) * 100 : 0

    } else if (settings.isPLMarket) {
      // PL: single table, PLN thresholds, shop does NOT change FVF %
      const key = (settings.plCategoryKey ?? 'default') as PLCategoryKey
      const plFVF = calcPLFVF(totalRevenue, key)
      rawFVF = plFVF.fvfAmount
      noPerOrder = false
      effectiveCatFeePercent = totalRevenue > 0 ? (rawFVF / totalRevenue) * 100 : 0

    } else if (settings.isBEMarket) {
      // BE: identical fee structure to IE/NL, reuses IE fee table
      const key = (settings.beCategoryKey ?? 'default') as IECategoryKey
      const beFVF = calcIEFVF(totalRevenue, key)
      rawFVF = beFVF.fvfAmount
      noPerOrder = false
      effectiveCatFeePercent = totalRevenue > 0 ? (rawFVF / totalRevenue) * 100 : 0

    } else if (settings.isCHMarket) {
      // CH: single table, CHF thresholds, shop does NOT change FVF %
      const key = (settings.chCategoryKey ?? 'default') as CHCategoryKey
      const chFVF = calcCHFVF(totalRevenue, key)
      rawFVF = chFVF.fvfAmount
      noPerOrder = false
      effectiveCatFeePercent = totalRevenue > 0 ? (rawFVF / totalRevenue) * 100 : 0

    } else {
      // Non-US/UK: flat % calculation
      const storeDiscount = settings.storeDiscountPercent ?? 0
      const sellerAdj = settings.sellerLevelAdjustPercent ?? 0
      effectiveCatFeePercent = Math.max(settings.categoryFeePercent - storeDiscount + sellerAdj, 0)
      rawFVF = totalRevenue * (effectiveCatFeePercent / 100)
    }

    // ── 4. Top Rated Plus / Premium Service / Platin: 10% off variable FVF ──
    // US/CA: Top Rated Plus — 10% off FVF amount, NOT per-order fee
    // UK: Top Rated Premium Service — same
    // AU: Top Rated — same
    // DE Premium Service: 10% off variable FVF only
    // DE Platin-Shop: 10% off ALL FVF (variable + fixed) — variable part here, fixed in step 6
    const isPlatinDE = settings.isDEMarket && (settings.deIsPlatinShop ?? false)
    const topRatedDiscount = ((settings.isTopRatedPlus ?? false) || isPlatinDE) ? rawFVF * 0.10 : 0
    const fvfAfterTRP = rawFVF - topRatedDiscount

    // ── 5. Performance penalties ─────────────────────────────────────────────
    // US: penalty = % OF the FVF amount (e.g. fvfAfterTRP × 0.06)
    // UK: penalty = percentage POINTS added to the RATE (e.g. 9.9% → 15.9%)
    //     i.e. penalty = totalRevenue × (penaltyPoints / 100)
    // Rule for both: if BOTH Below Standard AND Very High INAD → only Below Standard applies

    let belowStandardPenalty = 0
    let inadPenalty = 0

    const isBelowStd = settings.isBelowStandard ?? false
    const bsMonths = settings.belowStandardMonths ?? 0
    const isHighINAD = settings.isVeryHighINAD ?? false
    const iMonths = settings.inadMonths ?? 0

    if (settings.isUKMarket) {
      // UK: add percentage POINTS to revenue
      // Below Standard: +6pts (1-3mo) / +7pts (4+mo)
      // Very High INAD: +4pts (1-3mo) / +5pts (4+mo)
      if (isBelowStd) {
        const bsPoints = bsMonths >= 4 ? 7 : 6
        belowStandardPenalty = totalRevenue * (bsPoints / 100)
      } else if (isHighINAD) {
        const inadPoints = iMonths >= 4 ? 5 : 4
        inadPenalty = totalRevenue * (inadPoints / 100)
      }
    } else if (settings.isCAMarket) {
      // CA: % OF FVF amount, INAD flat +5% no scaling
      if (isBelowStd) {
        const bsRate = bsMonths >= 4 ? 0.07 : 0.06
        belowStandardPenalty = fvfAfterTRP * bsRate
      } else if (isHighINAD) {
        inadPenalty = fvfAfterTRP * 0.05
      }
    } else if (settings.isAUMarket) {
      // AU: % of TOTAL SALE AMOUNT (different from all other markets)
      // Below Standard: +5.5% (1-3mo) / +6.6% (4+mo) of total sale
      // Very High INAD: SAME rates as Below Standard (+5.5% / +6.6%)
      // If BOTH → only Below Standard applies
      if (isBelowStd) {
        const bsRate = bsMonths >= 4 ? 0.066 : 0.055
        belowStandardPenalty = totalRevenue * bsRate
      } else if (isHighINAD) {
        const inadRate = iMonths >= 4 ? 0.066 : 0.055
        inadPenalty = totalRevenue * inadRate
      }
    } else if (settings.isDEMarket) {
      // DE: COMPLETELY DIFFERENT penalty structure
      // Instead of +% on FVF, DE REPLACES the base FVF with override rates
      // Below Standard: 20%/14% (standard) / 11%/5% (recommerce) / 11%/3% (tech) / 18%/3% (fashion/jewelry)
      // INAD: 17%/3% (standard) / 16%/3% (auto parts)
      // After 4+ months: +1% to both override rates
      // Only ONE penalty applies (Below Standard takes priority)
      const isExtended = bsMonths >= 4 || iMonths >= 4

      if (isBelowStd) {
        const group = (settings.deBelowStdCategoryGroup ?? 'standard') as keyof typeof DE_BELOW_STANDARD_RATES
        // Override: recalculate FVF from scratch using penalty rates
        const penaltyFVF = calcDEBelowStandardFVF(totalRevenue, group, isExtended && bsMonths >= 4)
        belowStandardPenalty = Math.max(penaltyFVF - rawFVF, 0) // difference vs base rate
      } else if (isHighINAD) {
        const group = (settings.deINADCategoryGroup ?? 'standard') as keyof typeof DE_INAD_RATES
        const penaltyFVF = calcDEINADFVF(totalRevenue, group, isExtended && iMonths >= 4)
        inadPenalty = Math.max(penaltyFVF - rawFVF, 0)
      }
    } else if (settings.isFRMarket || settings.isITMarket || settings.isESMarket || settings.isATMarket || settings.isIEMarket || settings.isNLMarket || settings.isPLMarket || settings.isBEMarket || settings.isCHMarket) {
      // FR/IT: UK-style penalty — percentage POINTS added to rate (applied to total revenue)
      // Below Standard: +6pts (1-3mo) / +7pts (4+mo)
      // Very High INAD: +4pts (1-3mo) / +5pts (4+mo)
      if (isBelowStd) {
        const bsPoints = bsMonths >= 4 ? 7 : 6
        belowStandardPenalty = totalRevenue * (bsPoints / 100)
      } else if (isHighINAD) {
        const inadPoints = iMonths >= 4 ? 5 : 4
        inadPenalty = totalRevenue * (inadPoints / 100)
      }
    } else {
      // US/CA and others: % OF FVF amount
      // Below Standard: +6% (1-3mo) / +7% (4+mo)
      // Very High INAD: +5% (1-3mo) / +6% (4+mo)
      if (isBelowStd) {
        const bsRate = bsMonths >= 4 ? 0.07 : 0.06
        belowStandardPenalty = fvfAfterTRP * bsRate
      } else if (isHighINAD) {
        const inadRate = iMonths >= 4 ? 0.06 : 0.05
        inadPenalty = fvfAfterTRP * inadRate
      }
    }

    const finalFVF = fvfAfterTRP + belowStandardPenalty + inadPenalty

    // ── 6. Per-order fee ─────────────────────────────────────────────────────
    let perOrderFee = noPerOrder ? 0 : settings.fixedFee
    // UK reduced per-order: £0.10 for orders ≤£10 in Collectables/Home/DIY
    if (settings.isUKMarket && reducedPerOrderApplies && totalRevenue <= 10) {
      perOrderFee = 0.10
    }
    // AU: use plan-specific per-order fee
    if (settings.isAUMarket) {
      perOrderFee = (settings as any)._auOrderFee ?? AU_ORDER_FEE['starter']
    }
    // DE: Platin-Shop gets 10% off per-order fee too (unique to DE)
    if (settings.isDEMarket && settings.deIsPlatinShop) {
      perOrderFee = perOrderFee * 0.90
    }

    const finalValueFeeOnly = finalFVF + perOrderFee

    // ── 7. Promoted Listings ─────────────────────────────────────────────────
    const promotedAdFee = totalRevenue * (settings.adRatePercent / 100)

    // ── 8. Regulatory fee ────────────────────────────────────────────────────
    const regulatoryFee = (settings.includeRegulatoryFee && settings.regulatoryFeePercent)
      ? totalRevenue * (settings.regulatoryFeePercent / 100)
      : 0

    // ── 9. International fee ─────────────────────────────────────────────────
    let crossBorderFee = 0
    let ukIntlFee = 0
    let caIntlFee = 0
    let auIntlFee = 0
    let deIntlFee = 0
    let frIntlFee = 0
    let itIntlFee = 0
    let esIntlFee = 0
    let atIntlFee = 0
    let ieIntlFee = 0
    let nlIntlFee = 0
    let plIntlFee = 0
    let beIntlFee = 0
    let chIntlFee = 0

    if (settings.isUKMarket) {
      const dest = settings.ukIntlDestination ?? 'none'
      const ukRate = UK_INTL_FEES[dest] ?? 0
      ukIntlFee = totalRevenue * (ukRate / 100)
    } else if (settings.isCAMarket) {
      const dest = settings.caIntlDestination ?? 'none'
      const caRate = CA_INTL_FEES[dest] ?? 0
      caIntlFee = totalRevenue * (caRate / 100)
    } else if (settings.isAUMarket) {
      if (settings.auIsInternational) {
        auIntlFee = totalRevenue * 0.011
      }
    } else if (settings.isDEMarket) {
      // DE: 4-tier international fee
      const dest = settings.deIntlDestination ?? 'none'
      const deRate = DE_INTL_FEES[dest as keyof typeof DE_INTL_FEES] ?? 0
      deIntlFee = totalRevenue * (deRate / 100)
    } else if (settings.isFRMarket) {
      // FR: same 4-tier as DE
      const dest = settings.frIntlDestination ?? 'none'
      const frRate = FR_INTL_FEES[dest as keyof typeof FR_INTL_FEES] ?? 0
      frIntlFee = totalRevenue * (frRate / 100)
    } else if (settings.isITMarket) {
      // IT: same 4-tier as DE/FR
      const dest = settings.itIntlDestination ?? 'none'
      const itRate = IT_INTL_FEES[dest as keyof typeof IT_INTL_FEES] ?? 0
      itIntlFee = totalRevenue * (itRate / 100)
    } else if (settings.isESMarket) {
      // ES: same 4-tier as DE/FR/IT
      const dest = settings.esIntlDestination ?? 'none'
      const esRate = ES_INTL_FEES[dest as keyof typeof ES_INTL_FEES] ?? 0
      esIntlFee = totalRevenue * (esRate / 100)
    } else if (settings.isATMarket) {
      const dest = settings.atIntlDestination ?? 'none'
      const atRate = AT_INTL_FEES[dest as keyof typeof AT_INTL_FEES] ?? 0
      atIntlFee = totalRevenue * (atRate / 100)
    } else if (settings.isIEMarket) {
      const dest = settings.ieIntlDestination ?? 'none'
      const ieRate = IE_INTL_FEES[dest as keyof typeof IE_INTL_FEES] ?? 0
      ieIntlFee = totalRevenue * (ieRate / 100)
    } else if (settings.isNLMarket) {
      const dest = settings.nlIntlDestination ?? 'none'
      const nlRate = IE_INTL_FEES[dest as keyof typeof IE_INTL_FEES] ?? 0
      nlIntlFee = totalRevenue * (nlRate / 100)
    } else if (settings.isPLMarket) {
      const dest = settings.plIntlDestination ?? 'none'
      const plRate = PL_INTL_FEES[dest as keyof typeof PL_INTL_FEES] ?? 0
      plIntlFee = totalRevenue * (plRate / 100)
    } else if (settings.isBEMarket) {
      const dest = settings.beIntlDestination ?? 'none'
      const beRate = IE_INTL_FEES[dest as keyof typeof IE_INTL_FEES] ?? 0
      beIntlFee = totalRevenue * (beRate / 100)
    } else if (settings.isCHMarket) {
      // CH: unique 4-tier — Switzerland itself in free tier
      const dest = settings.chIntlDestination ?? 'none'
      const chRate = CH_INTL_FEES[dest as keyof typeof CH_INTL_FEES] ?? 0
      chIntlFee = totalRevenue * (chRate / 100)
    } else if (settings.isInternationalSale) {
      crossBorderFee = totalRevenue * (settings.intlFeePercent / 100)
    }

    // ── 10. VAT on fees ───────────────────────────────────────────────────────
    // UK: 20% VAT on fees for non-VAT-registered sellers
    // DE: 19% VAT on fees for non-VAT-registered sellers (USt-IdNr.)
    let vatOnFees = 0
    let deVATOnFees = 0
    if (settings.isUKMarket && !(settings.isVATRegistered ?? true)) {
      const feesBeforeVAT = finalValueFeeOnly + promotedAdFee + regulatoryFee + ukIntlFee
      vatOnFees = feesBeforeVAT * 0.20
    }
    if (settings.isDEMarket && !(settings.deIsVATRegistered ?? true)) {
      const feesBeforeVAT = finalValueFeeOnly + promotedAdFee + deIntlFee
      deVATOnFees = feesBeforeVAT * 0.19
    }
    let frVATOnFees = 0
    if (settings.isFRMarket && !(settings.frIsVATRegistered ?? true)) {
      const feesBeforeVAT = finalValueFeeOnly + promotedAdFee + regulatoryFee + frIntlFee
      frVATOnFees = feesBeforeVAT * 0.20
    }
    let itVATOnFees = 0
    if (settings.isITMarket && !(settings.itIsVATRegistered ?? true)) {
      // Italy VAT is 22% (different from FR 20%)
      const feesBeforeVAT = finalValueFeeOnly + promotedAdFee + regulatoryFee + itIntlFee
      itVATOnFees = feesBeforeVAT * 0.22
    }
    let esVATOnFees = 0
    if (settings.isESMarket && !(settings.esIsVATRegistered ?? true)) {
      const feesBeforeVAT = finalValueFeeOnly + promotedAdFee + regulatoryFee + esIntlFee
      esVATOnFees = feesBeforeVAT * 0.21
    }
    let atVATOnFees = 0
    if (settings.isATMarket && !(settings.atIsVATRegistered ?? true)) {
      const feesBeforeVAT = finalValueFeeOnly + promotedAdFee + regulatoryFee + atIntlFee
      atVATOnFees = feesBeforeVAT * 0.20
    }
    let ieVATOnFees = 0
    if (settings.isIEMarket && !(settings.ieIsVATRegistered ?? true)) {
      const feesBeforeVAT = finalValueFeeOnly + promotedAdFee + regulatoryFee + ieIntlFee
      ieVATOnFees = feesBeforeVAT * 0.23
    }
    let nlVATOnFees = 0
    if (settings.isNLMarket && !(settings.nlIsVATRegistered ?? true)) {
      const feesBeforeVAT = finalValueFeeOnly + promotedAdFee + regulatoryFee + nlIntlFee
      nlVATOnFees = feesBeforeVAT * 0.21
    }
    let plVATOnFees = 0
    if (settings.isPLMarket && !(settings.plIsVATRegistered ?? true)) {
      const feesBeforeVAT = finalValueFeeOnly + promotedAdFee + regulatoryFee + plIntlFee
      plVATOnFees = feesBeforeVAT * 0.23
    }
    let beVATOnFees = 0
    if (settings.isBEMarket && !(settings.beIsVATRegistered ?? true)) {
      const feesBeforeVAT = finalValueFeeOnly + promotedAdFee + regulatoryFee + beIntlFee
      beVATOnFees = feesBeforeVAT * 0.21
    }
    let chVATOnFees = 0
    if (settings.isCHMarket && !(settings.chIsVATRegistered ?? true)) {
      // Switzerland VAT is 8.1% — lowest of all markets, non-EU
      const feesBeforeVAT = finalValueFeeOnly + promotedAdFee + regulatoryFee + chIntlFee
      chVATOnFees = feesBeforeVAT * 0.081
    }

    // ── 11. AU GST saving (GST-registered sellers only) ──────────────────────
    // All AU fees are displayed inclusive of 10% GST
    // GST-registered sellers can claim GST back → effective fees = fees ÷ 1.1
    // We show this as a positive saving in the ledger
    let auGSTSaving = 0
    if (settings.isAUMarket && (settings.isGSTRegistered ?? true)) {
      const totalFeesInclGST = finalValueFeeOnly + promotedAdFee + auIntlFee
      auGSTSaving = totalFeesInclGST - (totalFeesInclGST / 1.1)
    }

    const totalEbayFees = finalValueFeeOnly + promotedAdFee + regulatoryFee
      + crossBorderFee + ukIntlFee + caIntlFee + auIntlFee + deIntlFee + frIntlFee + itIntlFee + esIntlFee + atIntlFee + ieIntlFee + nlIntlFee + plIntlFee + beIntlFee + chIntlFee
      + vatOnFees + deVATOnFees + frVATOnFees + itVATOnFees + esVATOnFees + atVATOnFees + ieVATOnFees + nlVATOnFees + plVATOnFees + beVATOnFees + chVATOnFees
      - auGSTSaving

    // ── 10. Advanced factors ─────────────────────────────────────────────────
    let defectCost = 0
    let payoutCost = 0
    let totalCashback = 0

    if (settings.isAdvancedEnabled) {
      defectCost = totalRevenue * (settings.defectRatePercent / 100)
      const netFromEbay = totalRevenue - totalEbayFees
      if (netFromEbay > 0) payoutCost = netFromEbay * (settings.payoutFeePercent / 100)
      totalCashback = baseBuyCost * (settings.cashbackPercent / 100)
    }

    const advancedDeductions = defectCost + payoutCost

    // ── 11. Final truth equation ──────────────────────────────────────────────
    const netProfit =
      totalRevenue - totalCosts - totalEbayFees - advancedDeductions + totalCashback

    const roi = trueBuyCost > 0 ? (netProfit / trueBuyCost) * 100 : 0
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    // ── 12. Break-even price ─────────────────────────────────────────────────
    // For US tiered categories this is approximate — exact break-even
    // requires iterative solving since FVF rate changes with price.
    // We use the effective rate at current price as a close approximation.
    const totalFeeRateFraction = Math.min(
      (effectiveCatFeePercent
        + settings.adRatePercent
        + (settings.includeRegulatoryFee ? (settings.regulatoryFeePercent ?? 0) : 0)
        + (settings.isInternationalSale ? settings.intlFeePercent : 0)
        + (settings.isAdvancedEnabled ? settings.defectRatePercent : 0)
      ) / 100,
      0.95
    )
    const breakEvenPrice = (totalCosts + perOrderFee) / (1 - totalFeeRateFraction)

    // ── 13. Max safe ad rate ──────────────────────────────────────────────────
    const profitBeforeAds = netProfit + promotedAdFee
    const maxSafeAdRatePercent = totalRevenue > 0 ? (profitBeforeAds / totalRevenue) * 100 : 0

    return {
      netProfit,
      profitMargin: margin,
      roi,
      trueBuyCost,
      totalCosts,
      totalRevenue,
      totalEbayFees,
      finalValueFeeOnly,
      promotedAdFee,
      regulatoryFee,
      crossBorderFee,
      advancedDeductions,
      totalCashback,
      breakEvenPrice,
      maxSafeAdRatePercent,
      effectiveCatFeePercent,
      topRatedDiscount,
      belowStandardPenalty,
      inadPenalty,
      vatOnFees,
      ukIntlFee,
      caIntlFee,
      auIntlFee,
      auGSTSaving,
      deIntlFee,
      deVATOnFees,
      frIntlFee,
      frVATOnFees,
      itIntlFee,
      itVATOnFees,
      esIntlFee,
      esVATOnFees,
      atIntlFee,
      atVATOnFees,
      ieIntlFee,
      ieVATOnFees,
      nlIntlFee,
      nlVATOnFees,
      plIntlFee,
      plVATOnFees,
      beIntlFee,
      beVATOnFees,
      chIntlFee,
      chVATOnFees,
    }
  }

  // ---------------------------------------------------------------------------
  // 2. INSERTION FEE CALCULATION
  // ---------------------------------------------------------------------------
  static readonly INSERTION_FEES: Record<InsertionCategoryType, number> = {
    regular: 0.35,
    motors: 7.50,
    realestate: 35.00,
  }

  static calcInsertion(s: InsertionFeeSettings): InsertionFeeResult {
    const isUnlimited = s.freeAllowance === Infinity
    const unitsPerListing = Math.max(s.unitsPerListing, 1)
    const listingsOver = Math.max(s.listingsUsedThisMonth - s.freeAllowance, 0)
    const feeApplies =
      !isUnlimited &&
      (s.listingsUsedThisMonth > s.freeAllowance || s.categoryType !== 'regular')
    const feeFlat = feeApplies ? ProfitEngine.INSERTION_FEES[s.categoryType] : 0
    const feePerUnit = feeFlat / unitsPerListing
    return { feeApplies, feeFlat, feePerUnit, listingsOver, isUnlimited }
  }

  // ---------------------------------------------------------------------------
  // 3. BULK & VOLUME ANALYSIS
  // ---------------------------------------------------------------------------
  static calcBulk(s: BulkSettings): BulkResult {
    const unitsPurchased = Math.max(s.unitsPurchased, 1)
    const sellThroughPct = s.isRealisticMode
      ? Math.min(Math.max(s.sellThroughPercent, 0), 100) : 100
    const timeToSellDays = Math.max(s.timeToSellDays, 1)
    const shippingSaving = s.isRealisticMode && s.bulkShipOverride > 0
      ? Math.max(s.regularShipping - s.bulkShipOverride, 0) : 0

    const unitsExpectedToSell = Math.floor(unitsPurchased * (sellThroughPct / 100))
    const unitsDeadStock = unitsPurchased - unitsExpectedToSell
    const totalInvestment = unitsPurchased * s.buyPricePerUnit
    const bulkProfitPerUnit = s.profitPerUnit + shippingSaving
    const grossBulkProfit = unitsExpectedToSell * bulkProfitPerUnit
    const deadStockLoss = unitsDeadStock * s.buyPricePerUnit
    const realBulkProfit = grossBulkProfit - (s.isRealisticMode ? deadStockLoss : 0)
    const bulkROI = totalInvestment > 0 ? (realBulkProfit / totalInvestment) * 100 : 0
    const salesPerDay = timeToSellDays > 0 ? unitsExpectedToSell / timeToSellDays : 0
    const monthsToClear = timeToSellDays / 30
    const breakEvenDay = bulkProfitPerUnit > 0 && salesPerDay > 0
      ? Math.ceil(totalInvestment / (bulkProfitPerUnit * salesPerDay)) : 0
    const dollarPerDollarPerMonth = totalInvestment > 0 && monthsToClear > 0
      ? realBulkProfit / totalInvestment / monthsToClear : 0

    const velocityTier =
      dollarPerDollarPerMonth >= 0.5 ? 'EXCELLENT' :
        dollarPerDollarPerMonth >= 0.25 ? 'GOOD' :
          dollarPerDollarPerMonth >= 0.10 ? 'OK' : 'POOR'

    const isProfitable = bulkProfitPerUnit > 0
    const optimisticBreakEvenUnits = isProfitable ? Math.ceil(totalInvestment / bulkProfitPerUnit) : 0
    const realisticBreakEvenUnits = isProfitable
      ? Math.ceil((totalInvestment + deadStockLoss) / bulkProfitPerUnit) : 0
    const currentBreakEvenUnits = s.isRealisticMode ? realisticBreakEvenUnits : optimisticBreakEvenUnits
    const recoveryUnits = Math.min(currentBreakEvenUnits, unitsPurchased)
    const profitUnits = Math.max(unitsExpectedToSell - recoveryUnits, 0)
    const pureProfitValue = profitUnits * bulkProfitPerUnit
    const recoveryPct = (recoveryUnits / unitsPurchased) * 100
    const profitPct = (profitUnits / unitsPurchased) * 100
    const deadStockPct = (unitsDeadStock / unitsPurchased) * 100
    const bulkVsSingleDiffPercent = s.profitPerUnit > 0
      ? ((bulkProfitPerUnit / s.profitPerUnit - 1) * 100) : 0

    return {
      totalInvestment, unitsExpectedToSell, unitsDeadStock, deadStockLoss,
      grossBulkProfit, realBulkProfit, bulkROI, shippingSavingPerUnit: shippingSaving,
      salesPerDay, monthsToClear, breakEvenDay, dollarPerDollarPerMonth,
      velocityTier: velocityTier as BulkResult['velocityTier'],
      optimisticBreakEvenUnits, realisticBreakEvenUnits, currentBreakEvenUnits,
      recoveryUnits, profitUnits, pureProfitValue,
      recoveryPct, profitPct, deadStockPct, bulkVsSingleDiffPercent,
      showLowSellThroughWarning: s.isRealisticMode && sellThroughPct < 60 && unitsPurchased >= 20,
      showSlowVelocityWarning: s.isRealisticMode && timeToSellDays > 180 && unitsPurchased >= 50,
      showDeadCapitalWarning: s.isRealisticMode && dollarPerDollarPerMonth < 0.10 && unitsPurchased >= 20,
    }
  }

  // ---------------------------------------------------------------------------
  // 4. SCENARIOS — Best Offer / Reverse Price / Return Impact
  // ---------------------------------------------------------------------------
  static calcScenarios(s: ScenarioSettings): ScenarioResult {

    // Best Offer
    const offerRevenue = s.bestOfferPrice + s.buyerPaidShipping
    const offerFees = offerRevenue * s.feeRateFraction + s.perOrderFee
    const offerNetProfit = offerRevenue - s.totalCosts - offerFees - s.insertionFeePerUnit
    const offerMargin = offerRevenue > 0 ? (offerNetProfit / offerRevenue) * 100 : 0
    const offerRoi = s.totalCosts > 0 ? (offerNetProfit / s.totalCosts) * 100 : 0
    const offerImpactPct = s.adjustedNetProfit !== 0
      ? ((offerNetProfit - s.adjustedNetProfit) / Math.abs(s.adjustedNetProfit)) * 100 : 0
    const offerVerdict: ScenarioResult['offerVerdict'] =
      offerNetProfit > s.adjustedNetProfit * 0.7 ? 'accept' :
        offerNetProfit > 0 ? 'marginal' :
          offerNetProfit === 0 ? 'breakeven' : 'reject'

    // Reverse Price
    const marginDenom = 1 - s.feeRateFraction - (s.targetMargin / 100)
    const isImpossible = s.reverseMode === 'margin' && marginDenom <= 0
    const requiredPrice = isImpossible ? 0 : s.reverseMode === 'profit'
      ? (s.targetProfit + s.totalCosts + s.perOrderFee + s.insertionFeePerUnit) / (1 - s.feeRateFraction)
      : marginDenom > 0 ? (s.totalCosts + s.perOrderFee + s.insertionFeePerUnit) / marginDenom : 0
    const priceGap = requiredPrice - s.sellingPrice
    const verifyRevenue = requiredPrice + s.buyerPaidShipping
    const verifyFees = verifyRevenue * s.feeRateFraction + s.perOrderFee
    const verifiedProfit = verifyRevenue - s.totalCosts - verifyFees - s.insertionFeePerUnit
    const verifiedMargin = verifyRevenue > 0 ? (verifiedProfit / verifyRevenue) * 100 : 0

    // Return Impact
    const returnRate = Math.min(Math.max(s.returnRatePercent, 0), 100)
    const salesCount = 100
    const returnCount = Math.round(salesCount * (returnRate / 100))
    const successCount = salesCount - returnCount
    const revenueLost = s.sellingPrice + s.buyerPaidShipping
    const feesKept = revenueLost * s.feeRateFraction + s.perOrderFee
    const returnCostEach = s.returnShippingCost + s.totalCosts + feesKept
    const totalReturnLoss = returnCount * returnCostEach
    const totalSuccessProfit = successCount * s.adjustedNetProfit
    const netAfterReturns = totalSuccessProfit - totalReturnLoss
    const effectivePerUnit = salesCount > 0 ? netAfterReturns / salesCount : 0
    const marginErosionPct = s.adjustedNetProfit > 0
      ? ((s.adjustedNetProfit - effectivePerUnit) / s.adjustedNetProfit) * 100 : 0

    return {
      offerNetProfit, offerMargin, offerRoi, offerImpactPct, offerVerdict,
      requiredPrice, priceGap, verifiedProfit, verifiedMargin, isImpossible,
      successCount, returnCount, totalSuccessProfit, totalReturnLoss,
      netAfterReturns, effectivePerUnit, marginErosionPct,
      showHighReturnWarning: returnRate > 15,
    }
  }
}
