'use client'
// app/dashboard/tools/profit-calculator/page.tsx
// UI only ? all math lives in lib/profit-engine.ts

import { useState, useEffect, useCallback, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { createPortal } from 'react-dom'
import { Calculator, Info, Zap, History, Save, Trash2, X, Search } from 'lucide-react'
import KillSwitchBanner from '@/components/KillSwitchBanner'
import ProDropdown from '@/components/ui/ProDropdown'
import EbaySearchBar from '@/components/profit/EbaySearchBar'
import CommandCenter from '@/components/profit/CommandCenter'
import {
    ProfitEngine,
    ProfitSettings,
    ProfitResult,
    DEFAULT_SETTINGS,
    InsertionFeeResult,
    BulkResult,
    ScenarioResult,
    InsertionCategoryType,
    USCategoryKey,
    US_TIERED_FEES,
    USStoreTier,
    US_STORE_MONTHLY_FEE,
    UKStoreTier,
    UK_STORE_MONTHLY_FEE,
    UK_STORE_FREE_LISTINGS,
    UK_STORE_INSERTION_FEE,
    US_STORE_FREE_LISTINGS,
    US_STORE_INSERTION_FEE,
    COUNTRY_INSERTION_FEE,
    STANDARD_FREE_LISTINGS,
    calcTieredFVF,
    UKCategoryKey,
    UK_TIERED_FEES,
    UK_INTL_FEES,
    CACategoryKey,
    CA_TIERED_FEES,
    CA_INTL_FEES,
    AUProPlan,
    AUCategoryTier,
    AU_FVF_TABLE,
    AU_ABOVE_THRESHOLD_RATE,
    AU_ORDER_FEE,
    AU_CATEGORY_TIERS,
    AU_PRO_PLAN_LABELS,
    calcAUFVF,
    DECategoryKey,
    DE_TIERED_FEES,
    DE_INTL_FEES,
} from '@/lib/profit-engine'
import { CountrySettings } from '@/components/profit/CountrySettings'
import { CountryLedgerRows } from '@/components/profit/CountryLedgerRows'
import { getCategoryOptions, getStoreTierOptions, getSellerLevelOptions } from '@/components/profit/CountryCategoryOptions'
import { detectCategory } from '@/components/profit/CategoryDetector'

// ──? Brand palette (spec-exact) ──────────────────────────────────────────────?
const C = {
    lime: '#8fff00',
    limeDeep: '#4a8f00',
    limeTint: '#f4ffe6',
    dark: '#1a2410',
    border: '#e8ede2',
    muted: '#8a9e78',
    surface: '#ffffff',
    bg: '#f7f9f5',
    text: '#1a2410',
    red: '#b91c1c',
    amber: '#d97706',
    green: '#16a34a',
}

// ──? Country config ──────────────────────────────────────────────────────────?
type CountryCode = 'US' | 'UK' | 'AU' | 'CA' | 'DE' | 'FR' | 'IT' | 'ES' | 'AT' | 'BE' | 'IE' | 'NL' | 'PL' | 'CH'

interface CountryMeta {
    symbol: string
    defaultCatFee: number
    crossBorderFee: number
    regulatoryFee: number
    regFeeConfirmed: boolean
    perOrderLow: number
    perOrderHigh: number
    perOrderThresh: number
    flag: string
    label: string
    defaultPayoutFee: number   // eBay managed payments payout fee % for this country
}

const COUNTRIES: Record<CountryCode, CountryMeta> = {
    // ── North America ──────────────────────────────────────────────────────────
    US: { symbol: '$', defaultCatFee: 13.25, crossBorderFee: 1.65, regulatoryFee: 0, regFeeConfirmed: false, perOrderLow: 0.30, perOrderHigh: 0.40, perOrderThresh: 10, flag: 'us', label: 'United States', defaultPayoutFee: 0 },
    CA: { symbol: 'C$', defaultCatFee: 13.6, crossBorderFee: 0, regulatoryFee: 0, regFeeConfirmed: false, perOrderLow: 0.30, perOrderHigh: 0.40, perOrderThresh: 10, flag: 'ca', label: 'Canada', defaultPayoutFee: 0 },
    // ── Europe ────────────────────────────────────────────────────────────────
    UK: { symbol: '£', defaultCatFee: 12.8, crossBorderFee: 0, regulatoryFee: 0.35, regFeeConfirmed: true, perOrderLow: 0.30, perOrderHigh: 0.40, perOrderThresh: 10, flag: 'gb', label: 'United Kingdom', defaultPayoutFee: 0 },
    DE: { symbol: '€', defaultCatFee: 12.0, crossBorderFee: 0, regulatoryFee: 0, regFeeConfirmed: false, perOrderLow: 0.35, perOrderHigh: 0.45, perOrderThresh: 10, flag: 'de', label: 'Germany', defaultPayoutFee: 0 },
    FR: { symbol: '€', defaultCatFee: 9.0, crossBorderFee: 0, regulatoryFee: 0.35, regFeeConfirmed: true, perOrderLow: 0.35, perOrderHigh: 0.35, perOrderThresh: 0, flag: 'fr', label: 'France', defaultPayoutFee: 0 },
    IT: { symbol: '€', defaultCatFee: 11.0, crossBorderFee: 0, regulatoryFee: 0.35, regFeeConfirmed: true, perOrderLow: 0.35, perOrderHigh: 0.35, perOrderThresh: 0, flag: 'it', label: 'Italy', defaultPayoutFee: 0 },
    ES: { symbol: '€', defaultCatFee: 9.0, crossBorderFee: 0, regulatoryFee: 0.35, regFeeConfirmed: true, perOrderLow: 0.35, perOrderHigh: 0.45, perOrderThresh: 10, flag: 'es', label: 'Spain', defaultPayoutFee: 0 },
    AT: { symbol: '€', defaultCatFee: 11.0, crossBorderFee: 0, regulatoryFee: 0.35, regFeeConfirmed: true, perOrderLow: 0.35, perOrderHigh: 0.45, perOrderThresh: 10, flag: 'at', label: 'Austria', defaultPayoutFee: 0 },
    BE: { symbol: '€', defaultCatFee: 11.0, crossBorderFee: 0, regulatoryFee: 0.35, regFeeConfirmed: true, perOrderLow: 0.35, perOrderHigh: 0.45, perOrderThresh: 10, flag: 'be', label: 'Belgium', defaultPayoutFee: 0 },
    IE: { symbol: '€', defaultCatFee: 11.0, crossBorderFee: 0, regulatoryFee: 0.35, regFeeConfirmed: true, perOrderLow: 0.35, perOrderHigh: 0.45, perOrderThresh: 10, flag: 'ie', label: 'Ireland', defaultPayoutFee: 0 },
    NL: { symbol: '€', defaultCatFee: 11.0, crossBorderFee: 0, regulatoryFee: 0.35, regFeeConfirmed: true, perOrderLow: 0.35, perOrderHigh: 0.45, perOrderThresh: 10, flag: 'nl', label: 'Netherlands', defaultPayoutFee: 0 },
    PL: { symbol: 'zł', defaultCatFee: 11.0, crossBorderFee: 0, regulatoryFee: 0.35, regFeeConfirmed: true, perOrderLow: 1.35, perOrderHigh: 1.90, perOrderThresh: 45, flag: 'pl', label: 'Poland', defaultPayoutFee: 0 },
    CH: { symbol: 'CHF', defaultCatFee: 11.0, crossBorderFee: 0, regulatoryFee: 0.35, regFeeConfirmed: true, perOrderLow: 0.55, perOrderHigh: 0.65, perOrderThresh: 10, flag: 'ch', label: 'Switzerland', defaultPayoutFee: 0 },
    // ── Oceania ────────────────────────────────────────────────────────────────
    AU: { symbol: 'A$', defaultCatFee: 13.4, crossBorderFee: 0, regulatoryFee: 0, regFeeConfirmed: false, perOrderLow: 0.30, perOrderHigh: 0.30, perOrderThresh: 0, flag: 'au', label: 'Australia', defaultPayoutFee: 0 },
}

// Standard output VAT rates by country (0 = not applicable / not supported)
const OUTPUT_VAT_RATE: Record<CountryCode, number> = {
    US: 0,    // US sales tax is buyer-paid, not seller-remitted output VAT
    CA: 0,    // GST/HST varies by province — too complex for a single rate
    UK: 20,   // VAT standard rate
    DE: 19,   // MwSt standard rate
    FR: 20,   // TVA standard rate
    IT: 22,   // IVA standard rate
    ES: 21,   // IVA standard rate
    AT: 20,   // MwSt standard rate
    IE: 23,   // VAT standard rate
    NL: 21,   // BTW standard rate
    BE: 21,   // BTW/TVA standard rate
    PL: 23,   // VAT standard rate
    CH: 8.1,  // MWST standard rate (Switzerland, non-EU)
    AU: 10,   // GST standard rate (handled separately via auGSTSaving)
}


// ──? Category presets (US uses US_TIERED_FEES from engine, others use flat presets) ──
const CATEGORY_PRESETS: Record<CountryCode, { label: string; fee: number }[]> = {
    US: [], // US uses US_TIERED_FEES directly in the dropdown ? not this array

    UK: [
        { label: 'Other categories (default) ? 12.8%', fee: 12.8 },
        { label: 'Clothing and fashion ? 12.8%', fee: 12.8 },
        { label: 'Electronics ? 8%', fee: 8.0 },
        { label: 'Musical instruments ? 6.7%', fee: 6.7 },
        { label: 'Books and media ? 14%', fee: 14.0 },
    ],
    AU: [
        { label: 'Other categories (default) ? 13%', fee: 13.0 },
        { label: 'Electronics ? 8%', fee: 8.0 },
    ],
    CA: [
        { label: 'Other categories (default) ? 13.25%', fee: 13.25 },
        { label: 'Electronics ? 8%', fee: 8.0 },
    ],
    DE: [
        { label: 'Other categories (default) ? 12%', fee: 12.0 },
        { label: 'Electronics ? 6.5%', fee: 6.5 },
        { label: 'Books and media ? 12%', fee: 12.0 },
    ],
    FR: [
        { label: 'Other categories (default) — 9%', fee: 9.0 },
        { label: 'Electronics devices — 5%', fee: 5.0 },
        { label: 'Electronics accessories — 7.5%', fee: 7.5 },
        { label: 'Watches & handbags — 12%', fee: 12.0 },
        { label: 'Jewellery — 12%', fee: 12.0 },
        { label: 'Fashion — 12%', fee: 12.0 },
        { label: 'Tires & wheels — 5%', fee: 5.0 },
    ],
    IT: [
        { label: 'Other categories (default) — 11%', fee: 11.0 },
        { label: 'Tech devices — 6.5%', fee: 6.5 },
        { label: 'Tech accessories — 8.5%', fee: 8.5 },
        { label: 'Watches — 11%', fee: 11.0 },
        { label: 'Jewellery — 11%', fee: 11.0 },
        { label: 'Auto parts — 12.5%', fee: 12.5 },
        { label: 'Tires & wheels — 6.5%', fee: 6.5 },
    ],
    ES: [
        { label: 'Other categories (default) — 9%', fee: 9.0 },
        { label: 'Tech devices — 5%', fee: 5.0 },
        { label: 'Tech accessories — 7.5%', fee: 7.5 },
        { label: 'Watches & jewellery — 9%', fee: 9.0 },
        { label: 'Musical instruments — 9%', fee: 9.0 },
        { label: 'Tires & wheels — 5%', fee: 5.0 },
    ],
    AT: [
        { label: 'Other categories (default) — 11%', fee: 11.0 },
        { label: 'Tech devices — 6.5%', fee: 6.5 },
        { label: 'Tech accessories — 11%', fee: 11.0 },
        { label: 'Watches & jewellery — 14%', fee: 14.0 },
        { label: 'Auto parts — 12%', fee: 12.0 },
        { label: 'Tires & wheels — 6.5%', fee: 6.5 },
    ],
    BE: [
        { label: 'Other categories (default) — 11%', fee: 11.0 },
        { label: 'Tech core — 6.5%', fee: 6.5 },
        { label: 'Tech accessories — 6.5%', fee: 6.5 },
        { label: 'Jewellery & watches — 11%', fee: 11.0 },
        { label: 'Musical instruments — 11%', fee: 11.0 },
    ],
    IE: [
        { label: 'Other categories (default) — 11%', fee: 11.0 },
        { label: 'Tech core — 6.5%', fee: 6.5 },
        { label: 'Tech accessories — 6.5%', fee: 6.5 },
        { label: 'Jewellery & watches — 11%', fee: 11.0 },
        { label: 'Musical instruments — 11%', fee: 11.0 },
    ],
    NL: [
        { label: 'Other categories (default) — 11%', fee: 11.0 },
        { label: 'Tech core — 6.5%', fee: 6.5 },
        { label: 'Tech accessories — 6.5%', fee: 6.5 },
        { label: 'Jewellery & watches — 11%', fee: 11.0 },
        { label: 'Musical instruments — 11%', fee: 11.0 },
    ],
    PL: [
        { label: 'Other categories (default) — 11%', fee: 11.0 },
        { label: 'Tech core — 6.5%', fee: 6.5 },
        { label: 'Tech accessories — 6.5%', fee: 6.5 },
        { label: 'Jewellery & watches — 11%', fee: 11.0 },
    ],
    CH: [
        { label: 'Other categories (default) — 11%', fee: 11.0 },
        { label: 'Tech core — 6.5%', fee: 6.5 },
        { label: 'Tech accessories — 6.5%', fee: 6.5 },
        { label: 'Jewellery & watches — 11%', fee: 11.0 },
    ],
}

// ──? Local UI state ? separate from ProfitSettings ────────────────────────────
interface CalcState {
    sellingPrice: number
    buyPrice: number
    shippingCost: number
    buyerPaidShipping: number
    categoryFeePercent: number
    usCategoryKey: USCategoryKey
    usStoreTier: USStoreTier
    hasStore: boolean
    storeDiscount: number
    sellerLevelAdj: number
    isTopRatedPlus: boolean
    isBelowStandard: boolean
    belowStandardMonths: number
    isVeryHighINAD: boolean
    inadMonths: number
    // UK-specific
    isVATRegistered: boolean
    ukCategoryKey: string
    ukStoreTier: UKStoreTier
    ukIntlDestination: 'none' | 'eurozone' | 'us_canada' | 'other'
    ukReducedPerOrder: boolean
    // CA-specific
    caCategoryKey: string
    caHasStore: boolean
    caIntlDestination: 'none' | 'us' | 'other'
    // AU-specific
    auProPlan: AUProPlan
    auCategoryTier: AUCategoryTier
    isGSTRegistered: boolean
    auIsInternational: boolean
    // DE-specific
    deCategoryKey: string
    deHasShop: boolean
    deIsPlatinShop: boolean
    deIsPremiumService: boolean
    deIsVATRegistered: boolean
    deIntlDestination: 'none' | 'eurozone' | 'europe_other' | 'uk' | 'other'
    deBelowStdGroup: 'standard' | 'recommerce' | 'tech' | 'fashion_jewelry'
    deINADGroup: 'standard' | 'auto_parts'
    // FR-specific
    frCategoryKey: string
    frIsVATRegistered: boolean
    frIntlDestination: 'none' | 'eurozone' | 'europe_other' | 'uk' | 'other'
    // IT-specific
    itCategoryKey: string
    itIsVATRegistered: boolean
    itIntlDestination: 'none' | 'eurozone' | 'europe_other' | 'uk' | 'other'
    // ES-specific
    esCategoryKey: string
    esIsVATRegistered: boolean
    esIntlDestination: 'none' | 'eurozone' | 'europe_other' | 'uk' | 'other'
    // AT-specific
    atCategoryKey: string
    atHasShop: boolean
    atIsVATRegistered: boolean
    atIntlDestination: 'none' | 'eurozone' | 'europe_other' | 'uk' | 'other'
    // IE-specific
    ieCategoryKey: string
    ieIsVATRegistered: boolean
    ieIntlDestination: 'none' | 'eurozone' | 'europe_other' | 'uk' | 'other'
    // NL-specific (reuses IE fee structure)
    nlCategoryKey: string
    nlIsVATRegistered: boolean
    nlIntlDestination: 'none' | 'eurozone' | 'europe_other' | 'uk' | 'other'
    // PL-specific (currency PLN, thresholds in PLN)
    plCategoryKey: string
    plIsVATRegistered: boolean
    plIntlDestination: 'none' | 'eurozone' | 'europe_other' | 'uk' | 'other'
    // BE-specific (reuses IE fee structure, 21% Belgian VAT)
    beCategoryKey: string
    beIsVATRegistered: boolean
    beIntlDestination: 'none' | 'eurozone' | 'europe_other' | 'uk' | 'other'
    // CH-specific (currency CHF, unique intl tiers)
    chCategoryKey: string
    chIsVATRegistered: boolean
    chIntlDestination: 'none' | 'europe_other' | 'us_canada' | 'uk_other'
    adRatePercent: number
    buyerTaxPercent: number
    isInternational: boolean
    includeRegFee: boolean
    // Output VAT (sales VAT) — off by default, opt-in
    outputVATEnabled: boolean
    outputVATPercent: number
    // advanced
    isAdvancedEnabled: boolean
    sourcingTaxPercent: number
    fxFeePercent: number
    defectRatePercent: number
    payoutFeePercent: number
    cashbackPercent: number
}

const DEFAULT_CALC_STATE: CalcState = {
    sellingPrice: 0,
    buyPrice: 0,
    shippingCost: 0,
    buyerPaidShipping: 0,
    categoryFeePercent: 13.25,
    usCategoryKey: 'default' as USCategoryKey,
    usStoreTier: 'none' as USStoreTier,
    hasStore: false,
    storeDiscount: 0,
    sellerLevelAdj: 0,
    isTopRatedPlus: false,
    isBelowStandard: false,
    belowStandardMonths: 0,
    isVeryHighINAD: false,
    inadMonths: 0,
    // UK
    isVATRegistered: true,
    ukCategoryKey: 'default',
    ukStoreTier: 'none' as UKStoreTier,
    ukIntlDestination: 'none' as const,
    ukReducedPerOrder: false,
    // CA
    caCategoryKey: 'default',
    caHasStore: false,
    caIntlDestination: 'none' as const,
    // AU
    auProPlan: 'starter' as AUProPlan,
    auCategoryTier: 2 as AUCategoryTier,
    isGSTRegistered: true,
    auIsInternational: false,
    // DE
    deCategoryKey: 'default',
    deHasShop: false,
    deIsPlatinShop: false,
    deIsPremiumService: false,
    deIsVATRegistered: true,
    deIntlDestination: 'none' as const,
    deBelowStdGroup: 'standard' as const,
    deINADGroup: 'standard' as const,
    // FR
    frCategoryKey: 'default',
    frIsVATRegistered: true,
    frIntlDestination: 'none' as const,
    // IT
    itCategoryKey: 'default',
    itIsVATRegistered: true,
    itIntlDestination: 'none' as const,
    // ES
    esCategoryKey: 'default',
    esIsVATRegistered: true,
    esIntlDestination: 'none' as const,
    // AT
    atCategoryKey: 'default',
    atHasShop: false,
    atIsVATRegistered: true,
    atIntlDestination: 'none' as const,
    // IE
    ieCategoryKey: 'default',
    ieIsVATRegistered: true,
    ieIntlDestination: 'none' as const,
    // NL
    nlCategoryKey: 'default',
    nlIsVATRegistered: true,
    nlIntlDestination: 'none' as const,
    // PL
    plCategoryKey: 'default',
    plIsVATRegistered: true,
    plIntlDestination: 'none' as const,
    // BE
    beCategoryKey: 'default',
    beIsVATRegistered: true,
    beIntlDestination: 'none' as const,
    // CH
    chCategoryKey: 'default',
    chIsVATRegistered: true,
    chIntlDestination: 'none' as const,
    adRatePercent: 0,
    buyerTaxPercent: 0,
    isInternational: false,
    includeRegFee: false,
    outputVATEnabled: false,
    outputVATPercent: 0,
    isAdvancedEnabled: false,
    sourcingTaxPercent: DEFAULT_SETTINGS.sourcingTaxPercent,
    fxFeePercent: DEFAULT_SETTINGS.fxFeePercent,
    defectRatePercent: DEFAULT_SETTINGS.defectRatePercent,
    payoutFeePercent: 0,  // eBay managed payments — included in FVF
    cashbackPercent: DEFAULT_SETTINGS.cashbackPercent,
}

// ──? Map CalcState ? ProfitEngine.calculate() params ────────────────────────?
function runEngine(s: CalcState, meta: CountryMeta, country: CountryCode, overrideSellingPrice?: number): ProfitResult {
    const sp = overrideSellingPrice ?? s.sellingPrice
    const revenue = sp + s.buyerPaidShipping + (sp + s.buyerPaidShipping) * (s.buyerTaxPercent / 100)
    const perOrderFee = meta.perOrderThresh > 0 && revenue <= meta.perOrderThresh
        ? meta.perOrderLow : meta.perOrderHigh

    // For non-US: use flat % with store discount subtraction
    const baseCatFee = country !== 'US'
        ? Math.max(s.categoryFeePercent - s.storeDiscount, 0)
        : s.categoryFeePercent  // US: engine handles fee via usCategoryKey + hasStore

    const engineSettings: ProfitSettings = {
        // Core
        categoryFeePercent: baseCatFee,
        fixedFee: perOrderFee,
        adRatePercent: s.adRatePercent,
        sourcingTaxPercent: s.sourcingTaxPercent,
        defaultShipping: s.shippingCost,
        intlFeePercent: s.isInternational ? meta.crossBorderFee : 0,
        fxFeePercent: s.fxFeePercent,
        // Advanced
        isAdvancedEnabled: s.isAdvancedEnabled,
        defectRatePercent: s.defectRatePercent,
        payoutFeePercent: s.payoutFeePercent,
        cashbackPercent: s.cashbackPercent,
        // Extended
        buyerPaidShipping: s.buyerPaidShipping,
        buyerTaxPercent: s.buyerTaxPercent,
        isInternationalSale: s.isInternational,
        includeRegulatoryFee: s.includeRegFee,
        regulatoryFeePercent: meta.regulatoryFee,
        outputVATEnabled: s.outputVATEnabled,
        outputVATPercent: s.outputVATPercent,
        storeDiscountPercent: s.storeDiscount,
        sellerLevelAdjustPercent: 0, // handled via isTopRatedPlus / isBelowStandard below
        // US tiered fee fields
        isUSMarket: country === 'US',
        usCategoryKey: s.usCategoryKey,
        usStoreTier: s.usStoreTier,
        hasStore: s.usStoreTier !== 'none' && s.usStoreTier !== 'starter',
        // For DE: isTopRatedPlus maps to Premium Service toggle OR Platin shop
        // Platin gets 10% off via deIsPlatinShop flag directly in engine
        isTopRatedPlus: country === 'DE' ? s.deIsPremiumService : s.isTopRatedPlus,
        isBelowStandard: s.isBelowStandard,
        belowStandardMonths: s.belowStandardMonths,
        isVeryHighINAD: s.isVeryHighINAD,
        inadMonths: s.inadMonths,
        // UK fields
        isUKMarket: country === 'UK',
        ukCategoryKey: s.ukCategoryKey,
        ukStoreTier: s.ukStoreTier,
        isVATRegistered: s.isVATRegistered,
        ukIntlDestination: s.ukIntlDestination,
        ukReducedPerOrder: s.ukReducedPerOrder,
        // CA fields
        isCAMarket: country === 'CA',
        caCategoryKey: s.caCategoryKey,
        caHasStore: s.caHasStore,
        caIntlDestination: s.caIntlDestination,
        // AU fields
        isAUMarket: country === 'AU',
        auProPlan: s.auProPlan,
        auCategoryTier: s.auCategoryTier,
        isGSTRegistered: s.isGSTRegistered,
        auIsInternational: s.auIsInternational,
        // DE fields
        isDEMarket: country === 'DE',
        // FR fields
        isFRMarket: country === 'FR',
        // IT fields
        isITMarket: country === 'IT',
        // ES fields
        isESMarket: country === 'ES',
        // AT fields
        isATMarket: country === 'AT',
        // IE fields
        isIEMarket: country === 'IE',
        // NL fields
        isNLMarket: country === 'NL',
        // PL fields
        isPLMarket: country === 'PL',
        // BE fields
        isBEMarket: country === 'BE',
        // CH fields
        isCHMarket: country === 'CH',
        chCategoryKey: s.chCategoryKey,
        chIsVATRegistered: s.chIsVATRegistered,
        chIntlDestination: s.chIntlDestination,
        beCategoryKey: s.beCategoryKey,
        beIsVATRegistered: s.beIsVATRegistered,
        beIntlDestination: s.beIntlDestination,
        plCategoryKey: s.plCategoryKey,
        plIsVATRegistered: s.plIsVATRegistered,
        plIntlDestination: s.plIntlDestination,
        nlCategoryKey: s.nlCategoryKey,
        nlIsVATRegistered: s.nlIsVATRegistered,
        nlIntlDestination: s.nlIntlDestination,
        ieCategoryKey: s.ieCategoryKey,
        ieIsVATRegistered: s.ieIsVATRegistered,
        ieIntlDestination: s.ieIntlDestination,
        atCategoryKey: s.atCategoryKey,
        atHasShop: s.atHasShop,
        atIsVATRegistered: s.atIsVATRegistered,
        atIntlDestination: s.atIntlDestination,
        esCategoryKey: s.esCategoryKey,
        esIsVATRegistered: s.esIsVATRegistered,
        esIntlDestination: s.esIntlDestination,
        itCategoryKey: s.itCategoryKey,
        itIsVATRegistered: s.itIsVATRegistered,
        itIntlDestination: s.itIntlDestination,
        frCategoryKey: s.frCategoryKey,
        frIsVATRegistered: s.frIsVATRegistered,
        frIntlDestination: s.frIntlDestination,
        deCategoryKey: s.deCategoryKey,
        deHasShop: s.deHasShop,
        deIsPlatinShop: s.deIsPlatinShop,
        deIsPremiumService: s.deIsPremiumService,
        deIsVATRegistered: s.deIsVATRegistered,
        deIntlDestination: s.deIntlDestination,
        deBelowStdCategoryGroup: s.deBelowStdGroup,
        deINADCategoryGroup: s.deINADGroup,
    }

    return ProfitEngine.calculate({
        sellingPrice: sp,
        buyPrice: s.buyPrice,
        shippingCost: s.shippingCost,
        settings: engineSettings,
    })
}

// ──? Format large numbers for display ────────────────────────────────────────
function formatNum(n: number, prefix = '', suffix = '', decimals = 2): string {
    const sign = n < 0 ? '-' : ''
    const abs = Math.abs(n)
    if (abs >= 1000000) return `${sign}${prefix}${(abs / 1000000).toFixed(1)}M${suffix}`
    return `${sign}${prefix}${abs.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`
}

function formatPct(n: number): string {
    const abs = Math.abs(n)
    if (abs >= 10000) return `${(abs / 1000).toFixed(1)}K%`
    if (abs >= 1000) return `${abs.toFixed(0)}%`
    return `${abs.toFixed(1)}%`
}
function SectionLabel({ children }: { children: string }) {
    return <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', color: C.muted, margin: 0 }}>{children}</p>
}

// ── Hover tooltip (instant, wide) ────────────────────────────?
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
    const [show, setShow] = useState(false)
    const ref = useRef<HTMLSpanElement>(null)
    const [pos, setPos] = useState({ top: 0, left: 0 })

    function updatePos() {
        if (!ref.current) return
        const r = ref.current.getBoundingClientRect()
        setPos({ top: r.top - 10 + window.scrollY, left: r.left + r.width / 2 })
    }

    return (
        <span
            ref={ref}
            style={{ display: 'inline-flex', alignItems: 'center', cursor: 'default' }}
            onMouseEnter={() => { updatePos(); setShow(true) }}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            {show && typeof window !== 'undefined' && createPortal(
                <div style={{
                    position: 'fixed', zIndex: 9999,
                    top: pos.top, left: pos.left,
                    transform: 'translate(-50%, -100%)',
                    pointerEvents: 'none',
                }}>
                    <div style={{
                        position: 'relative', padding: '8px 14px', borderRadius: 8,
                        display: 'table',
                        maxWidth: 200,
                        fontSize: 12, lineHeight: 1.5, fontWeight: 500,
                        color: '#ffffff', backgroundColor: C.dark,
                        fontFamily: "'Inter', sans-serif",
                        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                        textAlign: 'center',
                        wordBreak: 'break-word',
                    }}>
                        {text}
                        <div style={{
                            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                            top: '100%', width: 0, height: 0,
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: `7px solid ${C.dark}`,
                        }} />
                    </div>
                </div>,
                document.body
            )}
        </span>
    )
}

function InputField({ label, value, onChange, prefix, suffix, tooltip }: {
    label: string; value: string; onChange: (v: string) => void
    prefix?: string; suffix?: string; tooltip?: string
}) {
    const [focused, setFocused] = useState(false)
    // Format number with commas when not focused
    const displayValue = !focused && value !== '' && !isNaN(parseFloat(value))
        ? parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
        : value
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{label}</label>
                {tooltip && <Tooltip text={tooltip}><Info size={10} color={C.muted} /></Tooltip>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${focused ? C.lime : C.border}`, borderRadius: 8, background: C.surface, padding: '0 8px', transition: 'border-color 0.15s' }}>
                {prefix && <span style={{ fontSize: 12, color: C.muted, marginRight: 2, flexShrink: 0 }}>{prefix}</span>}
                <input
                    type="text" inputMode="decimal"
                    value={displayValue}
                    onChange={e => onChange(e.target.value.replace(/[^0-9.]/g, ''))}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    style={{ flex: 1, height: 34, border: 'none', outline: 'none', fontSize: 13, color: C.text, background: 'transparent', minWidth: 0 }}
                />
                {suffix && <span style={{ fontSize: 12, color: C.muted, marginLeft: 2, flexShrink: 0 }}>{suffix}</span>}
            </div>
        </div>
    )
}

// SelectField removed ? using ProDropdown from @/components/ui/ProDropdown

function Toggle({ label, checked, onChange, tooltip }: {
    label: string; checked: boolean; onChange: (v: boolean) => void; tooltip?: string
}) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{label}</span>
                {tooltip && <Tooltip text={tooltip}><Info size={10} color={C.muted} /></Tooltip>}
            </div>
            <button onClick={() => onChange(!checked)}
                style={{ position: 'relative', width: 38, height: 21, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, background: checked ? C.lime : C.border, transition: 'background 0.2s' }}>
                <span style={{ position: 'absolute', top: 2.5, left: checked ? 19 : 2, width: 16, height: 16, borderRadius: '50%', background: C.surface, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', display: 'block' }} />
            </button>
        </div>
    )
}

function StatCard({ label, value, color, tooltip }: { label: string; value: string; color: string; tooltip?: string }) {
    const [displayed, setDisplayed] = useState(value)
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        if (value === displayed) return
        setVisible(false)
        const t = setTimeout(() => {
            setDisplayed(value)
            setVisible(true)
        }, 120)
        return () => clearTimeout(t)
    }, [value])

    return (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', flex: 1, cursor: 'default', textAlign: 'center', position: 'relative' }}>
            {tooltip && <div style={{ position: 'absolute', top: 8, right: 8 }}><Tooltip text={tooltip}><Info size={10} color={C.muted} /></Tooltip></div>}
            <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.5px', margin: '0 0 6px' }}>{label}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <p style={{ fontSize: 22, fontWeight: 800, color, margin: 0, lineHeight: 1, opacity: visible ? 1 : 0, transition: 'opacity 0.12s ease' }}>{displayed}</p>
            </div>
        </div>
    )
}

function LedgerRow({ label, amount, color, symbol }: { label: string; amount: number; color: string; symbol: string }) {
    const absAmount = Math.abs(amount)
    const fullVal = `${amount >= 0 ? '+' : '-'}${symbol}${absAmount.toFixed(2)}`
    const displayVal = absAmount >= 10000
        ? formatNum(absAmount, symbol)
        : `${symbol}${absAmount.toFixed(2)}`
    const finalDisplay = `${amount >= 0 ? '+' : '−'}${displayVal}`

    const [displayed, setDisplayed] = useState(finalDisplay)
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        if (finalDisplay === displayed) return
        setVisible(false)
        const t = setTimeout(() => {
            setDisplayed(finalDisplay)
            setVisible(true)
        }, 120)
        return () => clearTimeout(t)
    }, [finalDisplay])

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }} title={fullVal}>
            <span style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color, opacity: visible ? 1 : 0, transition: 'opacity 0.12s ease' }}>{displayed}</span>
        </div>
    )
}

function DonutChart({ revenue, profit, costs, fees }: { revenue: number; profit: number; costs: number; fees: number }) {
    const cx = 65, cy = 65, r = 44, sw = 26
    const circ = 2 * Math.PI * r
    if (revenue <= 0) return (
        <svg width="130" height="130" viewBox="0 0 130 130">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={sw} />
        </svg>
    )
    const profitPct = Math.max(profit, 0) / revenue
    const costsPct = Math.min(costs / revenue, 1)
    const feesPct = Math.min(fees / revenue, 1 - profitPct - costsPct)
    function arc(pct: number, off: number, color: string) {
        if (pct <= 0.005) return null
        const dash = pct * circ
        return <circle key={color} cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw}
            strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ * (0.25 - off)} strokeLinecap="round" />
    }
    let off = 0
    const segs = []
    if (profitPct > 0.005) { segs.push(arc(profitPct, off, C.lime)); off += profitPct }
    if (costsPct > 0.005) { segs.push(arc(costsPct, off, C.red)); off += costsPct }
    if (feesPct > 0.005) { segs.push(arc(feesPct, off, C.amber)) }
    return (
        <svg width="130" height="130" viewBox="0 0 130 130">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={sw} />
            {segs}
        </svg>
    )
}

// ──? Main page ────────────────────────────────────────────────────────────────
export default function ProfitCalculatorPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const [country, setCountry] = useState<CountryCode>('US')
    const meta = COUNTRIES[country]
    const sym = meta.symbol

    const [state, setState] = useState<CalcState>({ ...DEFAULT_CALC_STATE })
    const [result, setResult] = useState<ProfitResult | null>(null)
    const [simPrice, setSimPrice] = useState(20)
    // ── Level 2: Reverse price calculator state ──────────────────?
    const [poTargetMarginStr, setPoTargetMarginStr] = useState('')
    const [poTargetProfitStr, setPoTargetProfitStr] = useState('')
    const [poReverseMode, setPoReverseMode] = useState<'margin' | 'profit'>('margin')
    // ── Level 3: Price slider state ──────────────────────────────?
    const [poSliderActive, setPoSliderActive] = useState(false)
    const [simResult, setSimResult] = useState<ProfitResult | null>(null)

    // Controlled string states for inputs
    const [sellPriceStr, setSellPriceStr] = useState('')
    const [buyPriceStr, setBuyPriceStr] = useState('')
    const [shipCostStr, setShipCostStr] = useState('0.00')
    const [buyerShipStr, setBuyerShipStr] = useState('0.00')
    const [adRateStr, setAdRateStr] = useState('0.00')
    const [buyerTaxStr, setBuyerTaxStr] = useState('0.00')
    const [catFeeStr, setCatFeeStr] = useState('13.25')
    const [sourcingTaxStr, setSourcingTaxStr] = useState(String(DEFAULT_SETTINGS.sourcingTaxPercent))
    const [fxFeeStr, setFxFeeStr] = useState(String(DEFAULT_SETTINGS.fxFeePercent))
    const [defectRateStr, setDefectRateStr] = useState(String(DEFAULT_SETTINGS.defectRatePercent))
    const [payoutFeeStr, setPayoutFeeStr] = useState('0')  // eBay managed payments — no separate payout fee
    const [cashbackStr, setCashbackStr] = useState(String(DEFAULT_SETTINGS.cashbackPercent))

    // Insertion fee state
    const [listingsUsedStr, setListingsUsedStr] = useState('0')
    const [unitsPerListing, setUnitsPerListing] = useState('1')
    const [categoryType, setCategoryType] = useState('regular') // regular | motors | realestate

    // Bulk & volume analysis state
    const [bulkEnabled, setBulkEnabled] = useState(false)
    const [unitsPurchasedStr, setUnitsPurchasedStr] = useState('1')
    const [bulkMode, setBulkMode] = useState<'simple' | 'realistic'>('simple')
    const [sellThroughStr, setSellThroughStr] = useState('85')
    const [timeToSellStr, setTimeToSellStr] = useState('90')
    const [bulkShipOverrideStr, setBulkShipOverrideStr] = useState('')

    // ── Save / history state ────────────────────────────────────────────────?
    interface SavedItem {
        id: string
        product_name: string
        country: string
        sell_price: number
        buy_price: number
        net_profit: number
        margin: number
        roi: number
        settings_json: any
        last_viewed_at: string
    }
    const [productName, setProductName] = useState('')
    const [fetchedItem, setFetchedItem] = useState<{ title: string; price: number; shipping: number; image: string; sold: number; currency: string; condition: string; seller: string; sellerFeedback: string; returns: boolean; returnPeriod: number; marketplace: CountryCode; selectedCountry: CountryCode; sellerCountry: string; category: string } | null>(null)
    const [savedItems, setSavedItems] = useState<SavedItem[]>([])
    const [historyOpen, setHistoryOpen] = useState(false)
    const [historySearch, setHistorySearch] = useState('')
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
    const [undoItem, setUndoItem] = useState<SavedItem | null>(null)

    // ── Scenarios state ──────────────────────────────────────────────────────
    const [scenarioTab, setScenarioTab] = useState<'offer' | 'reverse' | 'returns'>('offer')
    const [bestOfferPrice, setBestOfferPrice] = useState(0) // updated when sellingPrice changes
    const [targetProfitStr, setTargetProfitStr] = useState('10')
    const [targetMarginStr, setTargetMarginStr] = useState('30')
    const [reverseMode, setReverseMode] = useState<'profit' | 'margin'>('profit')
    const [returnRateStr, setReturnRateStr] = useState('10')
    const [returnShippingStr, setReturnShippingStr] = useState('5.00')

    // ── History multi-select & compare ──────────────────────────────────────?
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [compareOpen, setCompareOpen] = useState(false)

    // ── Profit-per-hour state ────────────────────────────────────────────────
    const [minutesPerUnitStr, setMinutesPerUnitStr] = useState('0')

    // Track usage on mount
    useEffect(() => {
        async function trackUsage() {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session?.user) return
                const uid = session.user.id
                const { data: existing } = await supabase
                    .from('user_tool_usage').select('usage_count')
                    .eq('user_id', uid).eq('tool_name', 'profit_calculator').single()
                if (!existing) {
                    await supabase.from('user_tool_usage').insert({ user_id: uid, tool_name: 'profit_calculator', usage_count: 1, usage_limit: null })
                } else {
                    await supabase.from('user_tool_usage').update({ usage_count: (existing.usage_count ?? 0) + 1 }).eq('user_id', uid).eq('tool_name', 'profit_calculator')
                }
            } catch (_) { /* silent ? never break calculator */ }
        }
        trackUsage()
    }, [])

    // Reset category fee and country-specific settings when country changes
    useEffect(() => {
        const fee = COUNTRIES[country].defaultCatFee
        const meta = COUNTRIES[country]
        setCatFeeStr(String(fee))
        setPayoutFeeStr(String(meta.defaultPayoutFee))
        setState(prev => ({
            ...prev,
            categoryFeePercent: fee,
            usCategoryKey: 'default' as USCategoryKey,
            usStoreTier: 'none' as USStoreTier,
            hasStore: false,
            ukCategoryKey: 'default',
            ukIntlDestination: 'none' as const,
            ukReducedPerOrder: false,
            caCategoryKey: 'default',
            caHasStore: false,
            caIntlDestination: 'none' as const,
            auProPlan: 'starter' as AUProPlan,
            auCategoryTier: 2 as AUCategoryTier,
            isGSTRegistered: true,
            auIsInternational: false,
            deCategoryKey: 'default',
            deHasShop: false,
            deIsPlatinShop: false,
            deIsPremiumService: false,
            deIsVATRegistered: true,
            deIntlDestination: 'none' as const,
            deBelowStdGroup: 'standard' as const,
            deINADGroup: 'standard' as const,
            frCategoryKey: 'default',
            frIsVATRegistered: true,
            frIntlDestination: 'none' as const,
            itCategoryKey: 'default',
            itIsVATRegistered: true,
            itIntlDestination: 'none' as const,
            esCategoryKey: 'default',
            esIsVATRegistered: true,
            esIntlDestination: 'none' as const,
            atCategoryKey: 'default',
            atHasShop: false,
            atIsVATRegistered: true,
            atIntlDestination: 'none' as const,
            ieCategoryKey: 'default',
            ieIsVATRegistered: true,
            ieIntlDestination: 'none' as const,
            nlCategoryKey: 'default',
            nlIsVATRegistered: true,
            nlIntlDestination: 'none' as const,
            plCategoryKey: 'default',
            plIsVATRegistered: true,
            plIntlDestination: 'none' as const,
            beCategoryKey: 'default',
            beIsVATRegistered: true,
            beIntlDestination: 'none' as const,
            chCategoryKey: 'default',
            chIsVATRegistered: true,
            chIntlDestination: 'none' as const,
            // UK regulatory fee is confirmed ? auto-enable when switching to UK
            includeRegFee: meta.regFeeConfirmed,
            // Reset output VAT to country standard rate (disabled by default)
            outputVATEnabled: false,
            outputVATPercent: OUTPUT_VAT_RATE[country] ?? 0,
            // Reset payout fee to country-specific eBay managed payments default
            payoutFeePercent: meta.defaultPayoutFee,
            // Reset seller level when switching countries
            isTopRatedPlus: false,
            isBelowStandard: false,
            belowStandardMonths: 0,
            isVeryHighINAD: false,
            inadMonths: 0,
        }))
    }, [country])

    // Sync best-offer default to 90% of current selling price
    useEffect(() => {
        setBestOfferPrice(state.sellingPrice * 0.9)
    }, [state.sellingPrice])

    // Recalculate whenever state changes
    useEffect(() => {
        const r = runEngine(state, meta, country)
        setResult(r)
        const simR = runEngine(state, meta, country, simPrice)
        setSimResult(simR)
    }, [state, meta, simPrice])

    function patch(partial: Partial<CalcState>) {
        setState(prev => ({ ...prev, ...partial }))
    }

    function profitColor(n: number) {
        if (n > 0) return C.green
        if (n < 0) return C.red
        return C.muted
    }

    // ── Insertion fee — via engine ──────────────────────────────────────────
    // US: use usStoreTier for correct free allowance + per-listing fee
    // Non-US: 250 free listings (standard allowance), country-specific per-listing fee
    const freeAllowance = country === 'US'
        ? (US_STORE_FREE_LISTINGS[state.usStoreTier] ?? STANDARD_FREE_LISTINGS)
        : country === 'UK'
            ? (UK_STORE_FREE_LISTINGS[state.ukStoreTier] ?? 300)
            : STANDARD_FREE_LISTINGS
    const insertionFeePerListing = country === 'US'
        ? (US_STORE_INSERTION_FEE[state.usStoreTier] ?? 0.35)
        : country === 'UK'
            ? (UK_STORE_INSERTION_FEE[state.ukStoreTier] ?? 0.30)
            : (COUNTRY_INSERTION_FEE[country] ?? 0.35)
    const listingsUsed = parseInt(listingsUsedStr) || 0
    const unitsPerListingN = parseInt(unitsPerListing) || 1

    const insertionResult: InsertionFeeResult = ProfitEngine.calcInsertion({
        listingsUsedThisMonth: listingsUsed,
        freeAllowance,
        unitsPerListing: unitsPerListingN,
        // Motors/RE category types only apply to US; non-US always uses regular
        categoryType: country === 'US' ? categoryType as InsertionCategoryType : 'regular',
        insertionFeePerListing,
    })
    const { feeApplies: insertionFeeApplies, feePerUnit: insertionFeePerUnit, isUnlimited } = insertionResult

    // ── Core result values from engine ──────────────────────────────────────?
    const netProfit = result?.netProfit ?? 0
    const margin = result?.profitMargin ?? 0
    const roi = result?.roi ?? 0
    const revenue = result?.totalRevenue ?? (state.sellingPrice + state.buyerPaidShipping)
    const totalCosts = result?.totalCosts ?? 0
    const totalEbayFees = result?.totalEbayFees ?? 0
    const fvf = result?.finalValueFeeOnly ?? 0
    const cashbackVal = result?.totalCashback ?? 0
    const advDeduct = result?.advancedDeductions ?? 0
    const breakEven = result?.breakEvenPrice ?? 0
    const maxSafeAdRate = result?.maxSafeAdRatePercent ?? 0
    const topRatedDiscount = result?.topRatedDiscount ?? 0
    const belowStdPenalty = result?.belowStandardPenalty ?? 0
    const inadPenalty = result?.inadPenalty ?? 0
    const vatOnFees = result?.vatOnFees ?? 0

    // ── Price Optimizer calculations ────────────────────────────?
    // effectiveFeeRate = what % of revenue goes to eBay fees
    // Min price for X% margin = totalCosts / (1 - effectiveFeeRate - X%)
    // This is accurate because eBay fees scale with price
    const effectiveFeeRate = revenue > 0 ? totalEbayFees / revenue : 0.135
    const minFor15 = effectiveFeeRate < 0.85 ? totalCosts / (1 - effectiveFeeRate - 0.15) : 0
    const minFor25 = effectiveFeeRate < 0.75 ? totalCosts / (1 - effectiveFeeRate - 0.25) : 0
    const hasValidCosts = totalCosts > 0 && revenue > 0

    // ── Level 2: Reverse price calculator ────────────────────────
    // Mode A: user enters target margin % ? we show min sell price
    const poTargetMargin = parseFloat(poTargetMarginStr) || 0
    const minForTargetMargin = poTargetMargin > 0 && effectiveFeeRate < (1 - poTargetMargin / 100)
        ? totalCosts / (1 - effectiveFeeRate - poTargetMargin / 100)
        : 0

    // Mode B: user enters target profit amount ? we show min sell price
    const poTargetProfit = parseFloat(poTargetProfitStr) || 0
    const minForTargetProfit = poTargetProfit > 0
        ? (totalCosts + poTargetProfit) / (1 - effectiveFeeRate)
        : 0

    // What margin % does the current price achieve
    const currentMarginPct = revenue > 0 ? margin : 0

    // ── Level 3: Slider range ────────────────────────────────────?
    // Range: from 80% of break-even (deep loss) to 150% of 25% margin price
    const poSliderMin = breakEven > 0 ? Math.max(breakEven * 0.7, 0.01) : 0.01
    const poSliderMax = minFor25 > 0 ? minFor25 * 1.6 : breakEven * 2.5
    const poSliderStep = poSliderMax > 100 ? 0.5 : 0.1
    // Slider value tracks selling price
    const poSliderValue = state.sellingPrice > 0 ? Math.min(Math.max(state.sellingPrice, poSliderMin), poSliderMax) : breakEven
    const poSliderProfit = poSliderValue > 0 ? poSliderValue * (1 - effectiveFeeRate) - totalCosts : 0
    const poSliderMargin = poSliderValue > 0 ? (poSliderProfit / poSliderValue) * 100 : 0
    const poSliderPct = poSliderMax > poSliderMin ? ((poSliderValue - poSliderMin) / (poSliderMax - poSliderMin)) * 100 : 0
    const ukIntlFee = result?.ukIntlFee ?? 0
    const caIntlFee = result?.caIntlFee ?? 0
    const auIntlFee = result?.auIntlFee ?? 0
    const auGSTSaving = result?.auGSTSaving ?? 0
    const deIntlFee = result?.deIntlFee ?? 0
    const deVATOnFees = result?.deVATOnFees ?? 0
    const frIntlFee = result?.frIntlFee ?? 0
    const frVATOnFees = result?.frVATOnFees ?? 0
    const itIntlFee = result?.itIntlFee ?? 0
    const itVATOnFees = result?.itVATOnFees ?? 0
    const esIntlFee = result?.esIntlFee ?? 0
    const esVATOnFees = result?.esVATOnFees ?? 0
    const atIntlFee = result?.atIntlFee ?? 0
    const atVATOnFees = result?.atVATOnFees ?? 0
    const ieIntlFee = result?.ieIntlFee ?? 0
    const ieVATOnFees = result?.ieVATOnFees ?? 0
    const nlIntlFee = result?.nlIntlFee ?? 0
    const nlVATOnFees = result?.nlVATOnFees ?? 0
    const plIntlFee = result?.plIntlFee ?? 0
    const plVATOnFees = result?.plVATOnFees ?? 0
    const beIntlFee = result?.beIntlFee ?? 0
    const beVATOnFees = result?.beVATOnFees ?? 0
    const chIntlFee = result?.chIntlFee ?? 0
    const chVATOnFees = result?.chVATOnFees ?? 0

    // Ad danger zone
    const adFee = result?.promotedAdFee ?? 0
    const regFeeAmt = result?.regulatoryFee ?? 0
    const adDangerProgress = maxSafeAdRate > 0
        ? Math.min((state.adRatePercent / maxSafeAdRate) * 100, 100)
        : 0

    // Adjusted net profit (includes insertion fee per unit)
    const adjustedNetProfit = netProfit - insertionFeePerUnit

    // Profit per hour
    const minutesPerUnit = parseFloat(minutesPerUnitStr) || 0
    const hourlyRate = minutesPerUnit > 0 && adjustedNetProfit > 0
        ? (adjustedNetProfit / minutesPerUnit) * 60
        : 0

    // Fee rate fraction (used by scenarios)
    const perOrderFee = revenue <= meta.perOrderThresh ? meta.perOrderLow : meta.perOrderHigh
    const totalFeeRatePct =
        Math.max(state.categoryFeePercent - state.storeDiscount + state.sellerLevelAdj, 0)
        + (state.isInternational ? meta.crossBorderFee : 0)
        + state.adRatePercent
        + (state.includeRegFee ? meta.regulatoryFee : 0)
        + (state.isAdvancedEnabled ? state.defectRatePercent : 0)
    const feeRateFraction = Math.min(totalFeeRatePct / 100, 0.95)

    // ── Bulk analysis ? via engine ────────────────────────────────────────────
    const unitsPurchased = Math.max(parseInt(unitsPurchasedStr) || 1, 1)
    const bulkShipOverride = bulkMode === 'realistic' && bulkShipOverrideStr !== ''
        ? parseFloat(bulkShipOverrideStr) || state.shippingCost
        : 0

    const bulkResult: BulkResult = ProfitEngine.calcBulk({
        unitsPurchased,
        buyPricePerUnit: state.buyPrice,
        profitPerUnit: adjustedNetProfit,
        sellThroughPercent: bulkMode === 'simple' ? 100 : parseFloat(sellThroughStr) || 85,
        timeToSellDays: bulkMode === 'simple' ? 90 : parseInt(timeToSellStr) || 90,
        bulkShipOverride,
        regularShipping: state.shippingCost,
        isRealisticMode: bulkMode === 'realistic',
    })

    // Destructure bulk result for use in JSX
    const {
        totalInvestment, unitsExpectedToSell, unitsDeadStock, deadStockLoss,
        grossBulkProfit, realBulkProfit, bulkROI,
        shippingSavingPerUnit, salesPerDay, monthsToClear, breakEvenDay,
        dollarPerDollarPerMonth, velocityTier: bulkVelocityTier,
        optimisticBreakEvenUnits, realisticBreakEvenUnits, currentBreakEvenUnits,
        recoveryUnits, profitUnits, pureProfitValue,
        recoveryPct, profitPct: profitPct2, deadStockPct,
        bulkVsSingleDiffPercent: bulkVsSingleDiff,
        showLowSellThroughWarning, showSlowVelocityWarning, showDeadCapitalWarning,
    } = bulkResult

    const bulkAdjustedProfitPerUnit = adjustedNetProfit + shippingSavingPerUnit
    const deadStockUnits = unitsDeadStock
    const singleSaleProfit = adjustedNetProfit
    const deadStockValue = unitsDeadStock * state.buyPrice
    const isProfitable = bulkAdjustedProfitPerUnit > 0
    const currentBreakEven = currentBreakEvenUnits
    const sellThroughPct = bulkMode === 'simple' ? 100 : parseFloat(sellThroughStr) || 85
    const timeToSellDays = bulkMode === 'simple' ? 90 : parseInt(timeToSellStr) || 90

    // Velocity tier color mapping (UI concern, stays in page)
    const velocityTier = {
        EXCELLENT: { label: 'EXCELLENT', color: C.green },
        GOOD: { label: 'GOOD', color: C.green },
        OK: { label: 'OK', color: C.amber },
        POOR: { label: 'POOR', color: C.red },
    }[bulkVelocityTier]

    // ── Scenarios ? via engine ────────────────────────────────────────────────
    const scenarioResult: ScenarioResult = ProfitEngine.calcScenarios({
        sellingPrice: state.sellingPrice,
        buyPrice: state.buyPrice,
        adjustedNetProfit,
        totalCosts,
        feeRateFraction,
        perOrderFee,
        insertionFeePerUnit,
        currencySymbol: sym,
        bestOfferPrice,
        targetProfit: parseFloat(targetProfitStr) || 0,
        targetMargin: parseFloat(targetMarginStr) || 0,
        reverseMode,
        returnRatePercent: parseFloat(returnRateStr) || 0,
        returnShippingCost: parseFloat(returnShippingStr) || 0,
        buyerPaidShipping: state.buyerPaidShipping,
    })

    // Destructure scenario result for use in JSX
    const {
        offerNetProfit: bestOfferNet,
        offerMargin: bestOfferMargin,
        offerRoi: bestOfferRoi,
        offerImpactPct: offerImpact,
        offerVerdict,
        requiredPrice: reverseRequiredPrice,
        priceGap: currentPriceGap,
        verifiedProfit: reverseVerifyProfit,
        verifiedMargin: reverseVerifyMargin,
        isImpossible,
        successCount,
        returnCount,
        totalSuccessProfit,
        totalReturnLoss,
        netAfterReturns,
        effectivePerUnit,
        marginErosionPct: marginErosion,
        showHighReturnWarning,
    } = scenarioResult

    const targetProfit = parseFloat(targetProfitStr) || 0
    const targetMargin = parseFloat(targetMarginStr) || 0
    const returnRate = parseFloat(returnRateStr) || 0
    const marginDenom = 1 - feeRateFraction - (targetMargin / 100)
    const originalNet = adjustedNetProfit

    const simNet = simResult?.netProfit ?? 0
    const simMargin = simResult?.profitMargin ?? 0
    const simRoi = simResult?.roi ?? 0
    const simFees = simResult?.totalEbayFees ?? 0
    const sliderMax = Math.max(state.sellingPrice * 3, 50)

    // ── Smart slider gradients ────────────────────────────────────────────────

    // 1. What-If Forecaster ? red below break-even, yellow marginal, lime healthy
    const wifMin = 1
    const wifMax = sliderMax
    const wifBreakEvenPct = wifMax > wifMin ? Math.min(((breakEven - wifMin) / (wifMax - wifMin)) * 100, 95) : 10
    const wifMarginalPct = Math.min(wifBreakEvenPct + 10, 90)
    const wifGradient = `linear-gradient(to right,
    ${C.red} 0%,
    ${C.red} ${wifBreakEvenPct.toFixed(1)}%,
    #facc15 ${wifMarginalPct.toFixed(1)}%,
    ${C.lime} 100%)`

    // 2. Best Offer ? red below break-even of listing, yellow marginal, lime healthy
    const boMin = 0.01
    const boMax = state.sellingPrice > 0 ? state.sellingPrice : 100
    const boBreakEvenPct = boMax > boMin ? Math.min(((breakEven - boMin) / (boMax - boMin)) * 100, 95) : 10
    const boMarginalPct = Math.min(boBreakEvenPct + 8, 90)
    const boGradient = `linear-gradient(to right,
    ${C.red} 0%,
    ${C.red} ${boBreakEvenPct.toFixed(1)}%,
    #facc15 ${boMarginalPct.toFixed(1)}%,
    ${C.lime} 100%)`

    // 3. Sell-through ? fixed zones: <60% red, 60-75% yellow, >75% lime
    // Slider min=30, max=100 ? convert thresholds to %
    const stMin = 30, stMax = 100
    const st60Pct = ((60 - stMin) / (stMax - stMin)) * 100  // 42.9%
    const st75Pct = ((75 - stMin) / (stMax - stMin)) * 100  // 64.3%
    const sellThroughGradient = `linear-gradient(to right,
    ${C.red} 0%,
    ${C.red} ${st60Pct.toFixed(1)}%,
    #facc15 ${st75Pct.toFixed(1)}%,
    ${C.lime} 100%)`

    // 4. Return rate ? inverted: 0-5% lime, 5-15% yellow, >15% red
    // Slider min=0, max=50 ? convert thresholds to %
    const rrMin = 0, rrMax = 50
    const rr5Pct = ((5 - rrMin) / (rrMax - rrMin)) * 100  // 10%
    const rr15Pct = ((15 - rrMin) / (rrMax - rrMin)) * 100  // 30%
    const returnRateGradient = `linear-gradient(to right,
    ${C.lime} 0%,
    ${C.lime} ${rr5Pct.toFixed(1)}%,
    #facc15 ${rr15Pct.toFixed(1)}%,
    ${C.red} 100%)`

    function resetAll() {
        const defaultFee = country === 'US' ? 13.6 : meta.defaultCatFee
        setState({
            ...DEFAULT_CALC_STATE,
            categoryFeePercent: defaultFee,
            usCategoryKey: 'default',
            usStoreTier: 'none' as USStoreTier,
            hasStore: false,
            isTopRatedPlus: false,
            isBelowStandard: false,
            belowStandardMonths: 0,
            isVeryHighINAD: false,
            inadMonths: 0,
            isVATRegistered: true,
            ukCategoryKey: 'default',
            ukIntlDestination: 'none' as const,
            caCategoryKey: 'default',
            caHasStore: false,
            caIntlDestination: 'none' as const,
            auProPlan: 'starter' as AUProPlan,
            auCategoryTier: 2 as AUCategoryTier,
            isGSTRegistered: true,
            auIsInternational: false,
            deCategoryKey: 'default',
            deHasShop: false,
            deIsPlatinShop: false,
            deIsPremiumService: false,
            deIsVATRegistered: true,
            deIntlDestination: 'none' as const,
            deBelowStdGroup: 'standard' as const,
            deINADGroup: 'standard' as const,
            frCategoryKey: 'default',
            frIsVATRegistered: true,
            frIntlDestination: 'none' as const,
            itCategoryKey: 'default',
            itIsVATRegistered: true,
            itIntlDestination: 'none' as const,
            esCategoryKey: 'default',
            esIsVATRegistered: true,
            esIntlDestination: 'none' as const,
            atCategoryKey: 'default',
            atHasShop: false,
            atIsVATRegistered: true,
            atIntlDestination: 'none' as const,
            ieCategoryKey: 'default',
            ieIsVATRegistered: true,
            ieIntlDestination: 'none' as const,
            nlCategoryKey: 'default',
            nlIsVATRegistered: true,
            nlIntlDestination: 'none' as const,
            plCategoryKey: 'default',
            plIsVATRegistered: true,
            plIntlDestination: 'none' as const,
            beCategoryKey: 'default',
            beIsVATRegistered: true,
            beIntlDestination: 'none' as const,
            chCategoryKey: 'default',
            chIsVATRegistered: true,
            chIntlDestination: 'none' as const,
        })
        setSellPriceStr('20'); setBuyPriceStr('5'); setShipCostStr('0.00')
        setBuyerShipStr('0.00'); setAdRateStr('0.00'); setBuyerTaxStr('0.00')
        setCatFeeStr(String(defaultFee))
        setSourcingTaxStr(String(DEFAULT_SETTINGS.sourcingTaxPercent))
        setFxFeeStr(String(DEFAULT_SETTINGS.fxFeePercent))
        setDefectRateStr(String(DEFAULT_SETTINGS.defectRatePercent))
        setPayoutFeeStr(String(COUNTRIES[country]?.defaultPayoutFee ?? DEFAULT_SETTINGS.payoutFeePercent))
        setCashbackStr(String(DEFAULT_SETTINGS.cashbackPercent))
        setListingsUsedStr('0')
        setUnitsPerListing('1')
        setCategoryType('regular')
        setBulkEnabled(false)
        setUnitsPurchasedStr('1')
        setBulkMode('simple')
        setSellThroughStr('85')
        setTimeToSellStr('90')
        setBulkShipOverrideStr('')
        setMinutesPerUnitStr('0')
        setSimPrice(20)
    }

    // ── History: load all saved items from Supabase on mount ────────────────?
    useEffect(() => {
        async function loadHistory() {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session?.user) return
                const { data, error } = await supabase
                    .from('profit_calculator_history')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .order('last_viewed_at', { ascending: false })
                    .limit(50)
                if (error) throw error
                setSavedItems(data ?? [])
            } catch (_) { /* silent */ }
        }
        loadHistory()
    }, [])

    // ── Check if current product name matches an existing saved item ────────?
    const existingItem = productName.trim()
        ? savedItems.find(i => i.product_name.toLowerCase() === productName.trim().toLowerCase())
        : null

    // ── Save current calculation ────────────────────────────────────────────?
    async function saveCalculation(mode: 'update' | 'new') {
        if (!productName.trim()) return
        setSaveStatus('saving')
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.user) { setSaveStatus('error'); return }

            // Full snapshot of everything we need to restore
            const settingsJson = {
                state,
                country,
                catFeeStr,
                listingsUsedStr,
                unitsPerListing,
                categoryType,
                bulkEnabled,
                unitsPurchasedStr,
                bulkMode,
                sellThroughStr,
                timeToSellStr,
                bulkShipOverrideStr,
                sourcingTaxStr,
                fxFeeStr,
                defectRateStr,
                payoutFeeStr,
                cashbackStr,
            }

            const row = {
                user_id: session.user.id,
                product_name: productName.trim(),
                country,
                sell_price: state.sellingPrice,
                buy_price: state.buyPrice,
                net_profit: adjustedNetProfit,
                margin,
                roi,
                settings_json: settingsJson,
                updated_at: new Date().toISOString(),
                last_viewed_at: new Date().toISOString(),
            }

            if (mode === 'update' && existingItem) {
                const { data, error } = await supabase
                    .from('profit_calculator_history')
                    .update(row)
                    .eq('id', existingItem.id)
                    .select().single()
                if (error) throw error
                setSavedItems(prev => [data, ...prev.filter(i => i.id !== existingItem.id)])
            } else {
                const { data, error } = await supabase
                    .from('profit_calculator_history')
                    .insert(row)
                    .select().single()
                if (error) throw error
                setSavedItems(prev => [data, ...prev])
            }

            setSaveStatus('saved')
            setTimeout(() => setSaveStatus('idle'), 2000)
        } catch (_) {
            setSaveStatus('error')
            setTimeout(() => setSaveStatus('idle'), 3000)
        }
    }

    // ── Load a saved calculation back into the calculator ────────────────────
    async function loadCalculation(item: SavedItem) {
        const s = item.settings_json
        if (!s) return

        setCountry(item.country as CountryCode)
        setProductName(item.product_name)

        // Restore full state — but always re-derive includeRegFee from the
        // loaded country's regFeeConfirmed so UK reg fee never bleeds to other countries
        const loadedCountry = (item.country as CountryCode) ?? 'US'
        const loadedMeta = COUNTRIES[loadedCountry]
        if (s.state) setState({ ...s.state, includeRegFee: loadedMeta?.regFeeConfirmed ?? false })
        if (s.catFeeStr) setCatFeeStr(s.catFeeStr)
        if (s.listingsUsedStr !== undefined) setListingsUsedStr(s.listingsUsedStr)
        if (s.unitsPerListing !== undefined) setUnitsPerListing(s.unitsPerListing)
        if (s.categoryType) setCategoryType(s.categoryType)
        if (s.bulkEnabled !== undefined) setBulkEnabled(s.bulkEnabled)
        if (s.unitsPurchasedStr !== undefined) setUnitsPurchasedStr(s.unitsPurchasedStr)
        if (s.bulkMode) setBulkMode(s.bulkMode)
        if (s.sellThroughStr !== undefined) setSellThroughStr(s.sellThroughStr)
        if (s.timeToSellStr !== undefined) setTimeToSellStr(s.timeToSellStr)
        if (s.bulkShipOverrideStr !== undefined) setBulkShipOverrideStr(s.bulkShipOverrideStr)
        if (s.sourcingTaxStr !== undefined) setSourcingTaxStr(s.sourcingTaxStr)
        if (s.fxFeeStr !== undefined) setFxFeeStr(s.fxFeeStr)
        if (s.defectRateStr !== undefined) setDefectRateStr(s.defectRateStr)
        if (s.payoutFeeStr !== undefined) setPayoutFeeStr(s.payoutFeeStr)
        if (s.cashbackStr !== undefined) setCashbackStr(s.cashbackStr)

        // Restore controlled string inputs from state
        if (s.state) {
            setBuyPriceStr(String(s.state.buyPrice))
            setShipCostStr(String(s.state.shippingCost))
            setSellPriceStr(String(s.state.sellingPrice))
            setBuyerShipStr(String(s.state.buyerPaidShipping))
            setAdRateStr(String(s.state.adRatePercent))
            setBuyerTaxStr(String(s.state.buyerTaxPercent))
        }

        setHistoryOpen(false)

        // Bump last_viewed_at server-side and locally
        try {
            await supabase
                .from('profit_calculator_history')
                .update({ last_viewed_at: new Date().toISOString() })
                .eq('id', item.id)
            setSavedItems(prev => [
                { ...item, last_viewed_at: new Date().toISOString() },
                ...prev.filter(i => i.id !== item.id),
            ])
        } catch (_) { /* silent */ }
    }

    // ── Delete with undo ────────────────────────────────────────────────────?
    async function deleteCalculation(item: SavedItem) {
        setSavedItems(prev => prev.filter(i => i.id !== item.id))
        setUndoItem(item)
        setTimeout(() => setUndoItem(null), 5000)
        try {
            await supabase.from('profit_calculator_history').delete().eq('id', item.id)
        } catch (_) {
            // rollback on failure
            setSavedItems(prev => [item, ...prev])
            setUndoItem(null)
        }
    }

    async function undoDelete() {
        if (!undoItem) return
        try {
            const { data, error } = await supabase
                .from('profit_calculator_history')
                .insert({
                    user_id: undoItem.settings_json?.user_id ?? undoItem['user_id' as keyof SavedItem],
                    product_name: undoItem.product_name,
                    country: undoItem.country,
                    sell_price: undoItem.sell_price,
                    buy_price: undoItem.buy_price,
                    net_profit: undoItem.net_profit,
                    margin: undoItem.margin,
                    roi: undoItem.roi,
                    settings_json: undoItem.settings_json,
                })
                .select().single()
            if (error) throw error
            setSavedItems(prev => [data, ...prev])
            setUndoItem(null)
        } catch (_) {
            setUndoItem(null)
        }
    }

    // ── Multi-select helpers ────────────────────────────────────────────────?
    function toggleSelect(id: string) {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else if (next.size < 3) next.add(id)
            return next
        })
    }

    function clearSelection() {
        setSelectedIds(new Set())
    }

    // ── CSV Export ──────────────────────────────────────────────────────────?
    function exportCSV(items: SavedItem[]) {
        if (items.length === 0) return
        const headers = ['Product Name', 'Country', 'Sell Price', 'Buy Price', 'Net Profit', 'Margin %', 'ROI %', 'Saved At']
        const rows = items.map(i => [
            `"${(i.product_name ?? '').replace(/"/g, '""')}"`,
            i.country,
            Number(i.sell_price).toFixed(2),
            Number(i.buy_price).toFixed(2),
            Number(i.net_profit).toFixed(2),
            Number(i.margin).toFixed(2),
            Number(i.roi).toFixed(2),
            new Date(i.last_viewed_at).toISOString().split('T')[0],
        ].join(','))
        const csv = [headers.join(','), ...rows].join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `riazify-profit-calculations-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const selectedItems = savedItems.filter(i => selectedIds.has(i.id))

    // ── Filtered list for search ────────────────────────────────────────────?
    const filteredHistory = historySearch.trim()
        ? savedItems.filter(i => i.product_name.toLowerCase().includes(historySearch.toLowerCase()))
        : savedItems

    function timeAgo(iso: string): string {
        const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
        if (seconds < 60) return 'just now'
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
        return `${Math.floor(seconds / 604800)}w ago`
    }

    return (
        <KillSwitchBanner toolKey="profit_calculator">
            <div style={{ fontFamily: "'Inter', sans-serif", background: C.bg, minHeight: '100vh', padding: '24px', color: C.text }}>

                {/* ── Page header + search bar + save + history all in one row ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                    <div style={{ flexShrink: 0 }}>
                        <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0 }}>Profit Calculator</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <span
                                className={`fi fi-${meta.flag}`}
                                style={{ width: 16, height: 16, borderRadius: '50%', display: 'inline-block', backgroundSize: 'cover', flexShrink: 0 }}
                            />
                            <p style={{ fontSize: 12, color: C.muted, margin: 0, fontWeight: 600 }}>— {meta.label}</p>
                        </div>
                    </div>

                    {/* URL fetch bar ? real eBay API */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <EbaySearchBar
                            currentCountry={country}
                            onFetch={(price, shipping, categoryId, title, imageUrl, soldCount, currency, itemUrl, condition, seller, sellerFeedback, returns, returnPeriod, site, sellerCountry) => {
                                // Detect country — itemUrl is most reliable
                                function detectCountryFromSite(site: string, itemUrl: string, currency: string, sellerCountry: string): CountryCode {
                                    // 1. Check itemUrl first — most accurate
                                    if (itemUrl.includes('ebay.co.uk')) return 'UK'
                                    if (itemUrl.includes('ebay.com.au')) return 'AU'
                                    if (itemUrl.includes('ebay.ca')) return 'CA'
                                    if (itemUrl.includes('ebay.de')) return 'DE'
                                    if (itemUrl.includes('ebay.fr')) return 'FR'
                                    if (itemUrl.includes('ebay.it')) return 'IT'
                                    if (itemUrl.includes('ebay.es')) return 'ES'
                                    if (itemUrl.includes('ebay.at')) return 'AT'
                                    if (itemUrl.includes('ebay.be')) return 'BE'
                                    if (itemUrl.includes('ebay.ie')) return 'IE'
                                    if (itemUrl.includes('ebay.nl')) return 'NL'
                                    if (itemUrl.includes('ebay.pl')) return 'PL'
                                    if (itemUrl.includes('ebay.ch')) return 'CH'
                                    // 2. Check site field (skip EBAY_US as it's often wrong)
                                    const siteMap: Record<string, CountryCode> = {
                                        'EBAY_GB': 'UK', 'EBAY_DE': 'DE', 'EBAY_FR': 'FR',
                                        'EBAY_IT': 'IT', 'EBAY_ES': 'ES', 'EBAY_AU': 'AU',
                                        'EBAY_CA': 'CA', 'EBAY_AT': 'AT', 'EBAY_BE': 'BE',
                                        'EBAY_NL': 'NL', 'EBAY_PL': 'PL', 'EBAY_CH': 'CH',
                                        'EBAY_IE': 'IE',
                                    }
                                    if (site && siteMap[site]) return siteMap[site]
                                    // 3. Currency fallback (only non-ambiguous ones)
                                    if (currency === 'GBP') return 'UK'
                                    if (currency === 'AUD') return 'AU'
                                    if (currency === 'CAD') return 'CA'
                                    if (currency === 'PLN') return 'PL'
                                    if (currency === 'CHF') return 'CH'
                                    // 4. Default to US
                                    return 'US'
                                }

                                // All category detection via CategoryDetector.ts
                                const detectedCountry = detectCountryFromSite(site, itemUrl, currency, sellerCountry)
                                const detectedCategory = detectCategory(categoryId, 'US') as USCategoryKey
                                const ukCategory = detectCategory(categoryId, 'UK')
                                const caCategory = detectCategory(categoryId, 'CA')
                                const deCategory = detectCategory(categoryId, 'DE')
                                const frCategory = detectCategory(categoryId, 'FR')
                                const itCategory = detectCategory(categoryId, 'IT')
                                const esCategory = detectCategory(categoryId, 'ES')
                                const atCategory = detectCategory(categoryId, 'AT')
                                const ieCategory = detectCategory(categoryId, 'IE')
                                const beCategory = detectCategory(categoryId, 'BE')
                                const nlCategory2 = detectCategory(categoryId, 'NL')
                                const plCategory2 = detectCategory(categoryId, 'PL')
                                const chCategory2 = detectCategory(categoryId, 'CH')
                                const auRaw = parseInt(detectCategory(categoryId, 'AU'))
                                const auTier = ([1, 2, 3, 4, 5].includes(auRaw) ? auRaw : 2) as AUCategoryTier

                                // Check if original pasted URL has a clear marketplace domain
                                const pastedUrl = itemUrl.split('|')[1] ?? ''
                                const urlCountryMap: Record<string, CountryCode> = {
                                    'ebay.co.uk': 'UK', 'ebay.com.au': 'AU', 'ebay.ca': 'CA',
                                    'ebay.de': 'DE', 'ebay.fr': 'FR', 'ebay.it': 'IT',
                                    'ebay.es': 'ES', 'ebay.at': 'AT', 'ebay.be': 'BE',
                                    'ebay.ie': 'IE', 'ebay.nl': 'NL', 'ebay.pl': 'PL',
                                    'ebay.ch': 'CH', 'ebay.com': 'US',
                                }
                                const pastedCountry = Object.entries(urlCountryMap).find(([domain]) => pastedUrl.includes(domain))?.[1]

                                // Only auto-switch for reliable signals
                                const reliableCurrencies = ['GBP', 'AUD', 'CAD', 'CHF', 'PLN']
                                const hasUrlSignal = !!pastedCountry
                                const hasReliableCurrency = reliableCurrencies.includes(currency)
                                const isUSItem = (site === 'EBAY_US' || itemUrl.includes('ebay.com')) && currency === 'USD'
                                const shouldAutoSwitch = hasUrlSignal || hasReliableCurrency || isUSItem

                                // If pasted URL has clear domain, use that country directly
                                const finalCountry = pastedCountry ?? detectedCountry

                                // Reset all fields first
                                setFetchedItem(null)
                                setState({ ...DEFAULT_CALC_STATE })
                                setBuyPriceStr('')
                                setShipCostStr(String(shipping))
                                setSellPriceStr(String(price))
                                setAdRateStr('0')
                                setBuyerTaxStr('0')
                                // Auto-select country only when reliable
                                if (shouldAutoSwitch) {
                                    setCountry(finalCountry)
                                    // includeRegFee must match the new country — not DEFAULT_CALC_STATE false
                                    patch({ includeRegFee: COUNTRIES[finalCountry]?.regFeeConfirmed ?? false })
                                }
                                // Fill with fetched data
                                const targetCountry = shouldAutoSwitch ? finalCountry : country
                                patch({
                                    sellingPrice: price,
                                    shippingCost: shipping,
                                    buyPrice: 0,
                                    usCategoryKey: detectedCategory,
                                    ukCategoryKey: ukCategory,
                                    caCategoryKey: caCategory,
                                    deCategoryKey: deCategory,
                                    frCategoryKey: frCategory,
                                    itCategoryKey: itCategory,
                                    esCategoryKey: esCategory,
                                    atCategoryKey: atCategory,
                                    beCategoryKey: beCategory,
                                    ieCategoryKey: ieCategory,
                                    nlCategoryKey: nlCategory2,
                                    plCategoryKey: plCategory2,
                                    chCategoryKey: chCategory2,
                                    auCategoryTier: auTier,
                                    categoryFeePercent: COUNTRIES[targetCountry]?.defaultCatFee ?? 13.25,
                                })
                                if (title) setProductName(title)
                                setFetchedItem({ title, price, shipping, image: imageUrl, sold: parseInt(soldCount) || 0, currency, condition, seller, sellerFeedback, returns, returnPeriod, marketplace: finalCountry, selectedCountry: (country || 'US') as CountryCode, sellerCountry, category: categoryId.split('|').pop()?.trim() ?? '' })
                            }} />
                    </div>

                    {/* Product name + Save + Save as new */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <input
                            placeholder="Product name..."
                            value={productName}
                            onChange={e => setProductName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && productName.trim()) saveCalculation(existingItem ? 'update' : 'new') }}
                            style={{ width: 140, height: 36, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 12px', fontSize: 13, background: C.surface, color: C.text, outline: 'none' }}
                        />
                        <button
                            onClick={() => saveCalculation(existingItem ? 'update' : 'new')}
                            disabled={!productName.trim() || saveStatus === 'saving'}
                            style={{
                                height: 36, padding: '0 14px', borderRadius: 8, border: 'none',
                                background: !productName.trim() ? C.border : (saveStatus === 'saved' ? C.green : C.dark),
                                color: !productName.trim() ? C.muted : (saveStatus === 'saved' ? C.surface : C.lime),
                                fontWeight: 700, fontSize: 12, cursor: productName.trim() ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s', flexShrink: 0,
                            }}
                        >
                            <Save size={13} />
                            {saveStatus === 'saving' ? 'Saving...'
                                : saveStatus === 'saved' ? 'Saved!'
                                    : saveStatus === 'error' ? 'Error'
                                        : existingItem ? 'Update' : 'Save'}
                        </button>
                        {existingItem && (
                            <button
                                onClick={() => saveCalculation('new')}
                                style={{ height: 36, padding: '0 10px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: C.muted, fontWeight: 600, fontSize: 11, cursor: 'pointer', flexShrink: 0 }}
                            >
                                Save as new
                            </button>
                        )}
                    </div>

                    {/* History button */}
                    <button
                        onClick={() => setHistoryOpen(true)}
                        style={{
                            height: 36, padding: '0 14px', borderRadius: 8, flexShrink: 0,
                            border: `1px solid ${C.border}`, background: C.surface, color: C.text,
                            fontWeight: 700, fontSize: 12, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}
                    >
                        <History size={14} />
                        History
                        {savedItems.length > 0 && (
                            <span style={{ background: C.lime, color: C.dark, padding: '1px 7px', borderRadius: 999, fontSize: 10, fontWeight: 800 }}>
                                {savedItems.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* ── Country flags row — item preview left, flags right ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>

                    {/* Left — fetched item preview */}
                    {fetchedItem ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, marginRight: 16 }}>
                            {fetchedItem.image && (
                                <img src={fetchedItem.image} alt={fetchedItem.title}
                                    style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, border: `1px solid ${C.border}`, flexShrink: 0 }} />
                            )}
                            <div style={{ minWidth: 0, flex: 1 }}>
                                {/* Line 1 — full title, single line with ellipsis */}
                                <p style={{
                                    fontSize: 12, fontWeight: 700, color: C.text,
                                    margin: '0 0 3px',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                    {fetchedItem.title}
                                </p>
                                {/* Line 2 — all details */}
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'nowrap', overflow: 'hidden' }}>
                                    {/* Listed marketplace badge */}
                                    <span style={{ fontSize: 10, fontWeight: 700, color: C.dark, background: C.lime, padding: '1px 6px', borderRadius: 4, flexShrink: 0 }}>
                                        eBay {fetchedItem.marketplace}
                                    </span>
                                    {/* Price with correct currency symbol */}
                                    <span style={{ fontSize: 12, fontWeight: 800, color: C.green, flexShrink: 0 }}>
                                        {fetchedItem.currency === 'GBP' ? '£' : fetchedItem.currency === 'EUR' ? '€' : fetchedItem.currency === 'CHF' ? 'CHF ' : fetchedItem.currency === 'AUD' ? 'A$' : fetchedItem.currency === 'CAD' ? 'C$' : fetchedItem.currency === 'PLN' ? 'zł' : '$'}{fetchedItem.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    {/* Shipping */}
                                    {fetchedItem.shipping > 0 ? (
                                        <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>
                                            · +{fetchedItem.currency === 'GBP' ? '£' : fetchedItem.currency === 'EUR' ? '€' : fetchedItem.currency === 'CHF' ? 'CHF ' : fetchedItem.currency === 'AUD' ? 'A$' : fetchedItem.currency === 'CAD' ? 'C$' : fetchedItem.currency === 'PLN' ? 'zł' : '$'}{fetchedItem.shipping.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ship
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: 11, color: C.green, flexShrink: 0 }}>· Free shipping</span>
                                    )}
                                    {/* Condition */}
                                    {fetchedItem.condition && (
                                        <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>· {fetchedItem.condition}</span>
                                    )}
                                    {/* Sold count */}
                                    {fetchedItem.sold > 0 && (
                                        <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>· {fetchedItem.sold.toLocaleString()} sold</span>
                                    )}
                                    {/* Seller + feedback */}
                                    {fetchedItem.seller && (
                                        <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>
                                            · {fetchedItem.seller}{fetchedItem.sellerFeedback ? ` (${fetchedItem.sellerFeedback}%)` : ''}
                                        </span>
                                    )}
                                    {/* Returns */}
                                    {fetchedItem.returns && Number(fetchedItem.returnPeriod) > 0 ? (
                                        <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>· {fetchedItem.returnPeriod}d returns</span>
                                    ) : !fetchedItem.returns ? (
                                        <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>· No returns</span>
                                    ) : null}
                                    {/* Seller country */}
                                    {fetchedItem.sellerCountry && (
                                        <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>· Seller: {({
                                            'US': 'United States', 'GB': 'United Kingdom', 'DE': 'Germany',
                                            'FR': 'France', 'IT': 'Italy', 'ES': 'Spain', 'CA': 'Canada',
                                            'AU': 'Australia', 'AT': 'Austria', 'BE': 'Belgium', 'NL': 'Netherlands',
                                            'PL': 'Poland', 'CH': 'Switzerland', 'IE': 'Ireland', 'CN': 'China',
                                            'JP': 'Japan', 'KR': 'South Korea', 'IN': 'India', 'IL': 'Israel',
                                            'SG': 'Singapore', 'HK': 'Hong Kong', 'TW': 'Taiwan', 'TH': 'Thailand',
                                            'MY': 'Malaysia', 'PH': 'Philippines', 'VN': 'Vietnam', 'PK': 'Pakistan',
                                            'BR': 'Brazil', 'MX': 'Mexico', 'RU': 'Russia', 'UA': 'Ukraine',
                                            'TR': 'Turkey', 'SA': 'Saudi Arabia', 'AE': 'UAE', 'ZA': 'South Africa',
                                            'NG': 'Nigeria', 'EG': 'Egypt', 'AR': 'Argentina', 'CL': 'Chile',
                                            'NZ': 'New Zealand', 'SE': 'Sweden', 'NO': 'Norway', 'DK': 'Denmark',
                                            'FI': 'Finland', 'PT': 'Portugal', 'GR': 'Greece', 'CZ': 'Czech Republic',
                                            'HU': 'Hungary', 'RO': 'Romania', 'BG': 'Bulgaria', 'HR': 'Croatia',
                                        } as Record<string, string>)[fetchedItem.sellerCountry] ?? fetchedItem.sellerCountry}</span>
                                    )}
                                    {/* Category */}
                                    {fetchedItem.category && (
                                        <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>· {fetchedItem.category}</span>
                                    )}
                                </div>
                                {/* Mismatch note — when selected marketplace differs from item's primary marketplace */}
                                {fetchedItem.marketplace !== fetchedItem.selectedCountry && (
                                    <p style={{ fontSize: 10, color: C.amber, fontWeight: 600, margin: '3px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.amber, display: 'inline-block', flexShrink: 0 }} />
                                        Primary listing is eBay {COUNTRIES[fetchedItem.marketplace]?.label ?? fetchedItem.marketplace} — auto-switched from eBay {COUNTRIES[fetchedItem.selectedCountry]?.label ?? fetchedItem.selectedCountry}. Select a different flag if needed.
                                    </p>
                                )}
                            </div>
                            <button onClick={() => setFetchedItem(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, flexShrink: 0, fontSize: 18, lineHeight: 1, padding: '0 4px' }}>
                                ×
                            </button>
                        </div>
                    ) : (
                        <div style={{ flex: 1 }} />
                    )}

                    {/* Right — country flags */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {(Object.keys(COUNTRIES) as CountryCode[]).map(c => (
                            <div key={c} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                {country === c && (
                                    <span style={{ fontSize: 9, fontWeight: 700, color: C.dark, letterSpacing: '0.3px' }}>
                                        {c}
                                    </span>
                                )}
                                <button
                                    onClick={() => setCountry(c)}
                                    title={COUNTRIES[c].label}
                                    style={{
                                        width: 38, height: 38, borderRadius: '50%',
                                        border: `2.5px solid ${country === c ? C.lime : C.border}`,
                                        background: C.surface,
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'border-color 0.15s, box-shadow 0.15s',
                                        boxShadow: country === c ? `0 0 0 2px ${C.lime}` : 'none',
                                        flexShrink: 0,
                                        padding: 0,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <span
                                        className={`fi fi-${COUNTRIES[c].flag}`}
                                        style={{ width: 28, height: 28, borderRadius: '50%', display: 'block', backgroundSize: 'cover' }}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>


                {/* ── Main grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '580px 1fr', gap: 16, alignItems: 'start' }}>

                    {/* ── LEFT: Command Center ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <CommandCenter
                            currency={sym}
                            country={country}
                            categoryOptions={getCategoryOptions(country, state)}
                            storeTierOptions={getStoreTierOptions(country)}
                            sellerLevelOptions={getSellerLevelOptions(country)}
                            itemCost={buyPriceStr}
                            shippingCost={shipCostStr}
                            sellingPrice={sellPriceStr}
                            buyerPaidShipping={buyerShipStr}
                            adRate={adRateStr}
                            buyerTax={buyerTaxStr}
                            selectedCategory={
                                country === 'US' ? state.usCategoryKey
                                    : country === 'UK' ? state.ukCategoryKey
                                        : country === 'CA' ? state.caCategoryKey
                                            : country === 'AU' ? String(state.auCategoryTier)
                                                : country === 'DE' ? state.deCategoryKey
                                                    : country === 'FR' ? state.frCategoryKey
                                                        : country === 'IT' ? state.itCategoryKey
                                                            : country === 'ES' ? state.esCategoryKey
                                                                : country === 'AT' ? state.atCategoryKey
                                                                    : country === 'IE' ? state.ieCategoryKey
                                                                        : country === 'NL' ? state.nlCategoryKey
                                                                            : country === 'PL' ? state.plCategoryKey
                                                                                : country === 'BE' ? state.beCategoryKey
                                                                                    : country === 'CH' ? state.chCategoryKey
                                                                                        : catFeeStr
                            }
                            selectedStoreTier={
                                country === 'US' ? state.usStoreTier
                                    : country === 'UK' ? state.ukStoreTier
                                        : country === 'CA' ? (state.caHasStore ? 'has_store' : 'no_store')
                                            : country === 'AU' ? state.auProPlan
                                                : country === 'DE' ? (state.deIsPlatinShop ? 'platin' : state.deHasShop ? 'has_shop' : 'no_shop')
                                                    : country === 'FR' ? '0'
                                                        : country === 'IT' ? '0'
                                                            : country === 'ES' ? '0'
                                                                : country === 'AT' ? (state.atHasShop ? 'has_shop' : 'no_shop')
                                                                    : country === 'IE' ? '0'
                                                                        : country === 'NL' ? '0'
                                                                            : country === 'PL' ? '0'
                                                                                : country === 'BE' ? '0'
                                                                                    : country === 'CH' ? '0'
                                                                                        : String(state.storeDiscount)
                            }
                            selectedSellerLevel={
                                (country === 'US' || country === 'UK' || country === 'CA' || country === 'AU' || country === 'DE' || country === 'FR' || country === 'IT' || country === 'ES' || country === 'AT' || country === 'IE' || country === 'NL' || country === 'PL' || country === 'BE' || country === 'CH')
                                    ? state.isTopRatedPlus || (country === 'DE' && state.deIsPremiumService) ? 'trp'
                                        : state.isBelowStandard && state.belowStandardMonths >= 4 ? 'bs_long'
                                            : state.isBelowStandard ? 'bs_short'
                                                : state.isVeryHighINAD && state.inadMonths >= 4 ? 'inad_long'
                                                    : state.isVeryHighINAD ? 'inad_short'
                                                        : 'standard'
                                    : String(state.sellerLevelAdj)
                            }
                            isInternational={state.isInternational}
                            includeRegFee={state.includeRegFee}
                            regFeeConfirmed={meta.regFeeConfirmed}
                            regulatoryFeeRate={meta.regulatoryFee}
                            isAdvancedEnabled={state.isAdvancedEnabled}
                            outputVATEnabled={state.outputVATEnabled}
                            outputVATPercent={state.outputVATPercent}
                            hasOutputVATRate={OUTPUT_VAT_RATE[country] > 0}
                            sourcingTax={sourcingTaxStr}
                            fxFee={fxFeeStr}
                            defectRate={defectRateStr}
                            payoutFee={payoutFeeStr}
                            defaultPayoutFee={meta.defaultPayoutFee}
                            cashback={cashbackStr}
                            onItemCostChange={v => { setBuyPriceStr(v); patch({ buyPrice: parseFloat(v) || 0 }) }}
                            onShippingCostChange={v => { setShipCostStr(v); patch({ shippingCost: parseFloat(v) || 0 }) }}
                            onSellingPriceChange={v => { setSellPriceStr(v); const n = parseFloat(v) || 0; patch({ sellingPrice: n }); setSimPrice(n) }}
                            onBuyerPaidShipChange={v => { setBuyerShipStr(v); patch({ buyerPaidShipping: parseFloat(v) || 0 }) }}
                            onAdRateChange={v => { setAdRateStr(v); patch({ adRatePercent: parseFloat(v) || 0 }) }}
                            onBuyerTaxChange={v => { setBuyerTaxStr(v); patch({ buyerTaxPercent: parseFloat(v) || 0 }) }}
                            onCategoryChange={v => {
                                if (country === 'US') {
                                    patch({ usCategoryKey: v as USCategoryKey })
                                } else if (country === 'UK') {
                                    patch({ ukCategoryKey: v })
                                } else if (country === 'CA') {
                                    patch({ caCategoryKey: v })
                                } else if (country === 'AU') {
                                    patch({ auCategoryTier: parseInt(v) as AUCategoryTier })
                                } else if (country === 'DE') {
                                    patch({ deCategoryKey: v })
                                } else if (country === 'FR') {
                                    patch({ frCategoryKey: v })
                                } else if (country === 'IT') {
                                    patch({ itCategoryKey: v })
                                } else if (country === 'ES') {
                                    patch({ esCategoryKey: v })
                                } else if (country === 'AT') {
                                    patch({ atCategoryKey: v })
                                } else if (country === 'IE') {
                                    patch({ ieCategoryKey: v })
                                } else if (country === 'NL') {
                                    patch({ nlCategoryKey: v })
                                } else if (country === 'PL') {
                                    patch({ plCategoryKey: v })
                                } else if (country === 'BE') {
                                    patch({ beCategoryKey: v })
                                } else if (country === 'CH') {
                                    patch({ chCategoryKey: v })
                                } else {
                                    setCatFeeStr(v); patch({ categoryFeePercent: parseFloat(v) || meta.defaultCatFee })
                                }
                            }}
                            onStoreTierChange={v => {
                                if (country === 'US') {
                                    const tier = v as USStoreTier
                                    patch({
                                        usStoreTier: tier,
                                        hasStore: tier !== 'none' && tier !== 'starter',
                                        storeDiscount: 0,
                                    })
                                } else if (country === 'UK') {
                                    patch({ ukStoreTier: v as UKStoreTier, storeDiscount: 0 })
                                } else if (country === 'CA') {
                                    patch({ caHasStore: v === 'has_store', storeDiscount: 0 })
                                } else if (country === 'AU') {
                                    patch({ auProPlan: v as AUProPlan })
                                } else if (country === 'AT') {
                                    patch({ atHasShop: v === 'has_shop' })
                                } else if (country === 'DE') {
                                    patch({ deHasShop: v === 'has_shop' || v === 'platin', deIsPlatinShop: v === 'platin' })
                                } else {
                                    patch({ storeDiscount: parseFloat(v) || 0, hasStore: parseFloat(v) > 0 })
                                }
                            }}
                            onSellerLevelChange={v => {
                                if (country === 'US' || country === 'UK' || country === 'CA' || country === 'AU' || country === 'DE' || country === 'FR' || country === 'IT' || country === 'ES' || country === 'AT' || country === 'IE' || country === 'NL' || country === 'PL' || country === 'BE' || country === 'CH') {
                                    patch({
                                        isTopRatedPlus: v === 'trp' && country !== 'DE',
                                        deIsPremiumService: v === 'trp' && country === 'DE',
                                        isBelowStandard: v === 'bs_short' || v === 'bs_long',
                                        belowStandardMonths: v === 'bs_long' ? 4 : v === 'bs_short' ? 1 : 0,
                                        isVeryHighINAD: v === 'inad_short' || v === 'inad_long',
                                        inadMonths: v === 'inad_long' ? 4 : v === 'inad_short' ? 1 : 0,
                                        sellerLevelAdj: 0,
                                    })
                                } else {
                                    patch({ sellerLevelAdj: parseFloat(v) || 0 })
                                }
                            }}
                            onInternationalChange={v => patch({ isInternational: v })}
                            onRegFeeChange={v => {
                                // UK regulatory fee is mandatory ? cannot be disabled
                                if (country === 'UK') return
                                patch({ includeRegFee: v })
                            }}
                            onOutputVATChange={(enabled, percent) => {
                                patch({ outputVATEnabled: enabled, outputVATPercent: percent })
                            }}
                            onAdvancedChange={v => patch({ isAdvancedEnabled: v })}
                            onSourcingTaxChange={v => { setSourcingTaxStr(v); patch({ sourcingTaxPercent: parseFloat(v) || 0 }) }}
                            onFxFeeChange={v => { setFxFeeStr(v); patch({ fxFeePercent: parseFloat(v) || 0 }) }}
                            onDefectRateChange={v => { setDefectRateStr(v); patch({ defectRatePercent: parseFloat(v) || 0 }) }}
                            onPayoutFeeChange={v => { setPayoutFeeStr(v); patch({ payoutFeePercent: parseFloat(v) || 0 }) }}
                            onCashbackChange={v => { setCashbackStr(v); patch({ cashbackPercent: parseFloat(v) || 0 }) }}
                            onReset={resetAll}
                        />

                        {/* ── UK-specific controls ── */}
                        <CountrySettings
                            country={country}
                            state={state}
                            patch={patch}
                        />

                        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <SectionLabel>LISTING / INSERTION FEE</SectionLabel>
                                {isUnlimited && (
                                    <span style={{ fontSize: 9, fontWeight: 700, color: C.green, background: '#dcfce7', padding: '2px 6px', borderRadius: 999 }}>
                                        UNLIMITED ? NO FEE
                                    </span>
                                )}
                                {insertionFeeApplies && (
                                    <span style={{ fontSize: 9, fontWeight: 700, color: C.red, background: '#fee2e2', padding: '2px 6px', borderRadius: 999 }}>
                                        FEE APPLIES
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <InputField
                                    label="Listings used this month"
                                    value={listingsUsedStr}
                                    tooltip={`Your free allowance is ${freeAllowance.toLocaleString()} listings/month. Extra listings cost ${sym}${insertionFeePerListing.toFixed(2)} each.`}
                                    onChange={v => setListingsUsedStr(v.replace(/[^0-9]/g, ''))}
                                />
                                <InputField
                                    label="Units per listing"
                                    value={unitsPerListing}
                                    tooltip="How many units are listed under this single listing. Fee is split across all units."
                                    onChange={v => setUnitsPerListing(v.replace(/[^0-9]/g, ''))}
                                />
                            </div>
                            {/* Motors/RE category type — US only (non-US always regular) */}
                            {country === 'US' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <label style={{ fontSize: 11, fontWeight: 600, color: C.text }}>Listing category type</label>
                                        <Tooltip text="Motors and Real Estate always charge an insertion fee regardless of your free allowance"><Info size={10} color={C.muted} /></Tooltip>
                                    </div>
                                    <ProDropdown
                                        prefix=""
                                        currentValue={categoryType}
                                        options={[
                                            { val: 'regular', label: 'Regular listing', enabled: true },
                                            { val: 'motors', label: 'eBay Motors (vehicles)', enabled: true },
                                            { val: 'realestate', label: 'Real Estate', enabled: true },
                                        ]}
                                        onChanged={v => setCategoryType(v)}
                                        width="full"
                                        maxItems={3}
                                    />
                                </div>
                            )}
                            {!isUnlimited && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ color: C.muted }}>Free allowance used</span>
                                            <Tooltip text="How many of your free monthly listings you have used. Extra listings beyond this incur a fee."><Info size={10} color={C.muted} /></Tooltip>
                                        </div>
                                        <span style={{ fontWeight: 700, color: listingsUsed > freeAllowance ? C.red : C.green }}>
                                            {listingsUsed.toLocaleString()} / {freeAllowance.toLocaleString()}
                                        </span>
                                    </div>
                                    <div style={{ height: 6, borderRadius: 999, background: C.border, overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${Math.min((listingsUsed / freeAllowance) * 100, 100)}%`,
                                            background: listingsUsed > freeAllowance ? C.red : C.lime,
                                            borderRadius: 999, transition: 'width 0.3s',
                                        }} />
                                    </div>
                                    {insertionFeeApplies && (
                                        <p style={{ fontSize: 10, color: C.red, margin: 0, fontWeight: 600 }}>
                                            {country === 'US' && categoryType !== 'regular'
                                                ? `${categoryType === 'motors' ? 'Motors' : 'Real Estate'} listings always charge an insertion fee`
                                                : `Exceeded free allowance by ${(listingsUsed - freeAllowance).toLocaleString()} listings — ${sym}${insertionFeePerListing.toFixed(2)}/listing fee applies`
                                            } — split across {unitsPerListingN} unit{unitsPerListingN > 1 ? 's' : ''} = {sym}{insertionFeePerUnit.toFixed(4)}/unit
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Time per unit ? only shows when advanced is on */}
                        {state.isAdvancedEnabled && (
                            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                                <InputField label="Time per unit (minutes)" value={minutesPerUnitStr} suffix="min"
                                    tooltip="Total time per unit: sourcing + listing + packing + shipping. Reveals your effective hourly rate."
                                    onChange={v => setMinutesPerUnitStr(v)} />
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: Results ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* ── 2-COLUMN RESULTS LAYOUT ── */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>

                            {/* ── LEFT COLUMN: Revenue/Ledger + What-If ── */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {/* 4 stat cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', position: 'relative', textAlign: 'center' }}>
                                        <div style={{ position: 'absolute', top: 8, right: 8 }}>
                                            <Tooltip text={`Exact: ${adjustedNetProfit >= 0 ? '+' : '-'}${sym}${Math.abs(adjustedNetProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}><Info size={10} color={C.muted} /></Tooltip>
                                        </div>
                                        <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.5px', margin: '0 0 6px' }}>NET PROFIT</p>
                                        <p style={{ fontSize: 22, fontWeight: 800, color: profitColor(adjustedNetProfit), margin: 0, lineHeight: 1 }}>
                                            {adjustedNetProfit >= 0 ? '+' : '-'}{formatNum(adjustedNetProfit, sym)}
                                        </p>
                                        {hourlyRate > 0 && (
                                            <p style={{ fontSize: 10, color: C.limeDeep, margin: '4px 0 0', fontWeight: 700 }}>
                                                {sym}{hourlyRate.toFixed(2)}/hr
                                            </p>
                                        )}
                                    </div>
                                    <StatCard label="MARGIN"
                                        value={`${margin >= 0 ? '' : '-'}${formatPct(margin)}`}
                                        color={profitColor(margin)}
                                        tooltip={`Profit margin: how much of each sale you keep after all costs and fees. Exact: ${margin.toFixed(2)}%`}
                                    />
                                    <StatCard label="ROI"
                                        value={`${roi >= 0 ? '' : '-'}${formatPct(roi)}`}
                                        color={profitColor(roi)}
                                        tooltip={`Return on investment: profit as % of your total costs. Exact: ${roi.toFixed(2)}%`}
                                    />
                                    <StatCard label="BREAK EVEN"
                                        value={`${formatNum(breakEven, sym)}`}
                                        color={C.amber}
                                        tooltip={`Minimum sell price to cover all costs with 0% profit. Exact: ${sym}${breakEven.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                    />
                                </div>
                                {/* Revenue split + Ledger */}
                                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: 'grid', gridTemplateColumns: '170px 1fr', gap: 20 }}>
                                    <div>
                                        <SectionLabel>REVENUE SPLIT</SectionLabel>
                                        <div style={{ position: 'relative', width: 130, height: 130, marginTop: 10 }}>
                                            <DonutChart revenue={revenue} profit={netProfit} costs={totalCosts} fees={fvf + adFee + regFeeAmt} />
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', gap: 2 }}>
                                                <span style={{ fontSize: 9, color: C.muted, display: 'block', lineHeight: 1 }}>Total rev</span>
                                                <span title={`${sym}${revenue.toFixed(2)}`} style={{ fontSize: revenue >= 10000 ? 10 : 13, fontWeight: 900, color: C.text, display: 'block', lineHeight: 1 }}>
                                                    {sym}{revenue >= 1000000 ? `${(revenue / 1000000).toFixed(1)}M` : revenue >= 10000 ? `${(revenue / 1000).toFixed(1)}K` : revenue.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                                <SectionLabel>TRANSACTION LEDGER</SectionLabel>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    {[{ dot: C.lime, label: 'Net profit' }, { dot: C.red, label: 'Your costs' }, { dot: C.amber, label: 'eBay fees' }].map(({ dot, label }) => (
                                                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                                                            <span style={{ fontSize: 9, color: C.muted, whiteSpace: 'nowrap' }}>{label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                <LedgerRow label="Revenue (price + ship)" amount={revenue} color={C.green} symbol={sym} />
                                                <div style={{ height: 1, background: C.border }} />
                                                <LedgerRow label="Item and shipping costs" amount={-totalCosts} color={C.red} symbol={sym} />
                                                <LedgerRow label="eBay final value fee" amount={-fvf} color={C.amber} symbol={sym} />
                                                {insertionFeeApplies && (
                                                    <LedgerRow label={`Insertion fee (${unitsPerListingN} units)`} amount={-insertionFeePerUnit} color={C.amber} symbol={sym} />
                                                )}
                                                {state.includeRegFee && regFeeAmt > 0 && (
                                                    <LedgerRow label="Regulatory operating fee" amount={-regFeeAmt} color={C.amber} symbol={sym} />
                                                )}
                                                {state.outputVATEnabled && (result?.outputVATOwed ?? 0) > 0 && (
                                                    <LedgerRow label={`Output VAT (${state.outputVATPercent}%) on sales`} amount={-(result?.outputVATOwed ?? 0)} color={C.amber} symbol={sym} />
                                                )}
                                                {adFee > 0 && (
                                                    <LedgerRow label="Promoted ad fee" amount={-adFee} color={C.amber} symbol={sym} />
                                                )}
                                                {state.isInternational && (
                                                    <LedgerRow label={`Cross-border fee (${meta.crossBorderFee}%)`} amount={-(revenue * meta.crossBorderFee / 100)} color={C.amber} symbol={sym} />
                                                )}
                                                {topRatedDiscount > 0 && (
                                                    <LedgerRow label="Top Rated Plus discount (?10% FVF)" amount={topRatedDiscount} color={C.green} symbol={sym} />
                                                )}
                                                {belowStdPenalty > 0 && (
                                                    <LedgerRow
                                                        label={`Below Standard penalty (${state.belowStandardMonths >= 4 ? '+7%' : '+6%'} FVF)`}
                                                        amount={-belowStdPenalty} color={C.red} symbol={sym}
                                                    />
                                                )}
                                                {inadPenalty > 0 && (
                                                    <LedgerRow
                                                        label={`Very High INAD penalty (${state.inadMonths >= 4 ? '+6%' : '+5%'} FVF)`}
                                                        amount={-inadPenalty} color={C.red} symbol={sym}
                                                    />
                                                )}
                                                <CountryLedgerRows
                                                    state={state}
                                                    sym={sym}
                                                    ukIntlFee={ukIntlFee}
                                                    caIntlFee={caIntlFee}
                                                    auIntlFee={auIntlFee}
                                                    auGSTSaving={auGSTSaving}
                                                    deIntlFee={deIntlFee}
                                                    deVATOnFees={deVATOnFees}
                                                    frIntlFee={frIntlFee}
                                                    frVATOnFees={frVATOnFees}
                                                    itIntlFee={itIntlFee}
                                                    itVATOnFees={itVATOnFees}
                                                    esIntlFee={esIntlFee}
                                                    esVATOnFees={esVATOnFees}
                                                    atIntlFee={atIntlFee}
                                                    atVATOnFees={atVATOnFees}
                                                    ieIntlFee={ieIntlFee}
                                                    ieVATOnFees={ieVATOnFees}
                                                    nlIntlFee={nlIntlFee}
                                                    nlVATOnFees={nlVATOnFees}
                                                    plIntlFee={plIntlFee}
                                                    plVATOnFees={plVATOnFees}
                                                    beIntlFee={beIntlFee}
                                                    beVATOnFees={beVATOnFees}
                                                    chIntlFee={chIntlFee}
                                                    chVATOnFees={chVATOnFees}
                                                />
                                                {vatOnFees > 0 && (
                                                    <LedgerRow
                                                        label="VAT on fees (20% ? not VAT registered)"
                                                        amount={-vatOnFees} color={C.red} symbol={sym}
                                                    />
                                                )}
                                                {state.isAdvancedEnabled && advDeduct > 0 && (
                                                    <LedgerRow label="Advanced deductions" amount={-advDeduct} color={C.red} symbol={sym} />
                                                )}
                                                {state.isAdvancedEnabled && cashbackVal > 0 && (
                                                    <LedgerRow label="Cashback / rewards" amount={cashbackVal} color={C.green} symbol={sym} />
                                                )}
                                            </div>
                                        </div>

                                        {/* Ad danger zone */}
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                                <span style={{ fontSize: 10, fontWeight: 700, color: C.muted }}>AD DANGER ZONE</span>
                                                <span style={{ fontSize: 10, fontWeight: 700, color: C.red }}>Max safe: {formatPct(maxSafeAdRate)}</span>
                                            </div>
                                            <div style={{ position: 'relative', height: 8, borderRadius: 999, overflow: 'hidden', background: `linear-gradient(to right, ${C.lime}, #facc15, ${C.red})` }}>
                                                <div style={{ position: 'absolute', top: -2, left: `${Math.max(0, Math.min(state.adRatePercent > 0 ? adDangerProgress - 1 : 0, 98))}%`, width: 3, height: 12, background: C.dark, borderRadius: 2 }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* What-If Forecaster */}
                                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <SectionLabel>WHAT-IF FORECASTER (DRAG TO TEST)</SectionLabel>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: C.dark, borderRadius: 999, padding: '3px 10px' }}>
                                            <Zap size={10} color={C.lime} />
                                            <span style={{ fontSize: 10, fontWeight: 700, color: C.lime }}>INTERACTIVE</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
                                        <div style={{ border: `1px solid ${C.border}`, borderTop: `3px solid ${C.lime}`, borderRadius: 8, padding: 10 }}>
                                            <p style={{ fontSize: 10, color: C.muted, fontWeight: 600, margin: '0 0 2px' }}>Sim price</p>
                                            <p style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: 0 }}>{formatNum(simPrice, sym)}</p>
                                            <p style={{ fontSize: 9, color: C.muted, margin: '2px 0 0' }}>Total fees: {sym}{simFees >= 10000 ? formatNum(simFees, sym) : simFees.toFixed(2)}</p>
                                        </div>
                                        <div style={{ border: `1px solid ${C.border}`, borderTop: `3px solid ${profitColor(simNet)}`, borderRadius: 8, padding: 10 }}>
                                            <p style={{ fontSize: 10, color: C.muted, fontWeight: 600, margin: '0 0 2px' }}>Est. profit</p>
                                            <p style={{ fontSize: 16, fontWeight: 800, color: profitColor(simNet), margin: 0 }}>{simNet >= 0 ? '+' : '-'}{formatNum(simNet, sym)}</p>
                                        </div>
                                        <div style={{ border: `1px solid ${C.border}`, borderTop: `3px solid ${profitColor(simRoi)}`, borderRadius: 8, padding: 10 }}>
                                            <p style={{ fontSize: 10, color: C.muted, fontWeight: 600, margin: '0 0 2px' }}>ROI</p>
                                            <p style={{ fontSize: 16, fontWeight: 800, color: profitColor(simRoi), margin: 0 }}>{formatPct(simRoi)}</p>
                                        </div>
                                        <div style={{ border: `1px solid ${C.border}`, borderTop: `3px solid ${profitColor(simMargin)}`, borderRadius: 8, padding: 10 }}>
                                            <p style={{ fontSize: 10, color: C.muted, fontWeight: 600, margin: '0 0 2px' }}>Margin</p>
                                            <p style={{ fontSize: 16, fontWeight: 800, color: profitColor(simMargin), margin: 0 }}>{formatPct(simMargin)}</p>
                                        </div>
                                    </div>
                                    <div style={{ position: 'relative', width: '100%', height: 20, display: 'flex', alignItems: 'center' }}>
                                        <div style={{ position: 'absolute', left: 0, right: 0, height: 6, borderRadius: 999, background: wifGradient, pointerEvents: 'none' }} />
                                        <input type="range" min={1} max={poSliderMax} step={0.5} value={simPrice}
                                            onChange={e => setSimPrice(parseFloat(e.target.value))}
                                            style={{ width: '100%', accentColor: C.lime, cursor: 'pointer', position: 'relative', background: 'transparent', appearance: 'none', WebkitAppearance: 'none', height: 20, margin: 0 }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 700, marginTop: 4 }}>
                                        <span style={{ color: C.red }}>Break even: {formatNum(breakEven, sym)}</span>
                                        <span style={{ color: C.green }}>High profit area</span>
                                    </div>
                                </div>

                            </div>

                            {/* ── RIGHT COLUMN: Price Optimizer + Scenarios ── */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {/* ── PRICE OPTIMIZER ── */}
                                {hasValidCosts && (
                                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <SectionLabel>PRICE OPTIMIZER</SectionLabel>
                                            <span style={{ fontSize: 9, fontWeight: 700, color: C.muted, background: C.bg, padding: '2px 8px', borderRadius: 999, border: `1px solid ${C.border}` }}>
                                                MIN SELL PRICE
                                            </span>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>

                                            {/* Break-even */}
                                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.red, flexShrink: 0 }} />
                                                    <span style={{ fontSize: 9, fontWeight: 800, color: C.red, letterSpacing: '0.5px' }}>BREAK-EVEN</span>
                                                </div>
                                                <p style={{ fontSize: 20, fontWeight: 900, color: C.red, margin: '0 0 3px', lineHeight: 1 }}>
                                                    {sym}{breakEven.toFixed(2)}
                                                </p>
                                                <p style={{ fontSize: 10, color: '#ef4444', margin: 0 }}>0% margin — covers all costs</p>
                                                <div style={{ marginTop: 8, padding: '4px 8px', background: 'rgba(185,28,28,0.08)', borderRadius: 6 }}>
                                                    <p style={{ fontSize: 9, color: C.red, margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, flexShrink: 0, display: 'inline-block' }} />
                                                        Below this = loss on every sale
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Min for 15% margin */}
                                            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 14px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.amber, flexShrink: 0 }} />
                                                    <span style={{ fontSize: 9, fontWeight: 800, color: C.amber, letterSpacing: '0.5px' }}>SAFE FLOOR</span>
                                                </div>
                                                <p style={{ fontSize: 20, fontWeight: 900, color: C.amber, margin: '0 0 3px', lineHeight: 1 }}>
                                                    {minFor15 > 0 ? `${sym}${minFor15.toFixed(2)}` : '€'}
                                                </p>
                                                <p style={{ fontSize: 10, color: '#d97706', margin: 0 }}>15% margin — recommended minimum</p>
                                                {revenue > 0 && minFor15 > 0 && (
                                                    <div style={{ marginTop: 8, padding: '4px 8px', background: 'rgba(217,119,6,0.08)', borderRadius: 6 }}>
                                                        <p style={{ fontSize: 9, color: C.amber, margin: 0, fontWeight: 600 }}>
                                                            {revenue >= minFor15
                                                                ? `✓ Your price is ${sym}${(revenue - minFor15).toFixed(2)} above floor`
                                                                : `? Raise price by ${sym}${(minFor15 - revenue).toFixed(2)}`}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Min for 25% margin */}
                                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 14px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, flexShrink: 0 }} />
                                                    <span style={{ fontSize: 9, fontWeight: 800, color: C.green, letterSpacing: '0.5px' }}>SWEET SPOT</span>
                                                </div>
                                                <p style={{ fontSize: 20, fontWeight: 900, color: C.green, margin: '0 0 3px', lineHeight: 1 }}>
                                                    {minFor25 > 0 ? `${sym}${minFor25.toFixed(2)}` : '€'}
                                                </p>
                                                <p style={{ fontSize: 10, color: C.green, margin: 0 }}>25% margin — healthy profit zone</p>
                                                {revenue > 0 && minFor25 > 0 && (
                                                    <div style={{ marginTop: 8, padding: '4px 8px', background: 'rgba(22,163,74,0.08)', borderRadius: 6 }}>
                                                        <p style={{ fontSize: 9, color: C.green, margin: 0, fontWeight: 600 }}>
                                                            {revenue >= minFor25
                                                                ? `✓ You're in the sweet spot!`
                                                                : `? Need ${sym}${(minFor25 - revenue).toFixed(2)} more to hit 25%`}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                        </div>

                                        {/* Progress bar showing where current price sits */}
                                        {breakEven > 0 && minFor25 > 0 && (
                                            <div style={{ marginTop: 12 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: C.muted, marginBottom: 4 }}>
                                                    <span>Loss zone</span>
                                                    <span>Your price: {sym}{revenue.toFixed(2)}</span>
                                                    <span>Sweet spot +</span>
                                                </div>
                                                <div style={{ position: 'relative', height: 6, borderRadius: 999, background: C.border, overflow: 'hidden' }}>
                                                    {/* Zone colours */}
                                                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min((breakEven / poSliderMax) * 100, 40)}%`, background: '#fecaca' }} />
                                                    <div style={{ position: 'absolute', left: `${Math.min((breakEven / poSliderMax) * 100, 40)}%`, top: 0, bottom: 0, width: `${Math.min(((minFor15 - breakEven) / poSliderMax) * 100, 25)}%`, background: '#fde68a' }} />
                                                    <div style={{ position: 'absolute', left: `${Math.min((minFor15 / poSliderMax) * 100, 65)}%`, top: 0, bottom: 0, right: 0, background: '#bbf7d0' }} />
                                                    {/* Current price marker */}
                                                    <div style={{
                                                        position: 'absolute', top: -2, bottom: -2,
                                                        left: `${Math.min(Math.max((revenue / (poSliderMax)) * 100, 2), 98)}%`,
                                                        width: 3, borderRadius: 2,
                                                        background: profitColor(margin),
                                                        boxShadow: `0 0 4px ${profitColor(margin)}`,
                                                        transform: 'translateX(-50%)',
                                                    }} />
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: C.muted, marginTop: 3 }}>
                                                    <span style={{ color: C.red }}>{sym}{breakEven.toFixed(0)}</span>
                                                    <span style={{ color: C.amber }}>{sym}{minFor15.toFixed(0)}</span>
                                                    <span style={{ color: C.green }}>{sym}{minFor25.toFixed(0)}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Level 2: Reverse Price Calculator ── */}
                                        {hasValidCosts && (
                                            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                                    <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: 0 }}>What price do I need?</p>
                                                    {/* Mode toggle */}
                                                    <div style={{ display: 'flex', background: C.bg, borderRadius: 8, padding: 2, border: `1px solid ${C.border}` }}>
                                                        {(['margin', 'profit'] as const).map(mode => (
                                                            <button key={mode} onClick={() => { setPoReverseMode(mode); setPoTargetMarginStr(''); setPoTargetProfitStr('') }}
                                                                style={{
                                                                    padding: '3px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700,
                                                                    background: poReverseMode === mode ? C.lime : 'transparent',
                                                                    color: poReverseMode === mode ? C.dark : C.muted,
                                                                    transition: 'all 0.15s',
                                                                }}>
                                                                {mode === 'margin' ? 'By margin %' : `By profit ${sym}`}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'end' }}>
                                                    {/* Input */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                        <label style={{ fontSize: 10, fontWeight: 600, color: C.muted }}>
                                                            {poReverseMode === 'margin' ? 'Target margin %' : `Target profit (${sym})`}
                                                        </label>
                                                        <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${C.lime}`, borderRadius: 8, background: C.surface, padding: '0 10px', height: 36 }}>
                                                            <input
                                                                type="text" inputMode="decimal"
                                                                placeholder={poReverseMode === 'margin' ? 'e.g. 20' : 'e.g. 5.00'}
                                                                value={poReverseMode === 'margin' ? poTargetMarginStr : poTargetProfitStr}
                                                                onChange={e => {
                                                                    const v = e.target.value.replace(/[^0-9.]/g, '')
                                                                    poReverseMode === 'margin' ? setPoTargetMarginStr(v) : setPoTargetProfitStr(v)
                                                                }}
                                                                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, fontWeight: 700, color: C.text, background: 'transparent' }}
                                                            />
                                                            <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>
                                                                {poReverseMode === 'margin' ? '%' : sym}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Output */}
                                                    <div style={{
                                                        padding: '10px 14px', borderRadius: 8,
                                                        background: (() => {
                                                            const result = poReverseMode === 'margin' ? minForTargetMargin : minForTargetProfit
                                                            if (!result) return C.bg
                                                            return result <= revenue ? '#f0fdf4' : '#fef2f2'
                                                        })(),
                                                        border: `1px solid ${(() => {
                                                            const result = poReverseMode === 'margin' ? minForTargetMargin : minForTargetProfit
                                                            if (!result) return C.border
                                                            return result <= revenue ? '#bbf7d0' : '#fecaca'
                                                        })()}`,
                                                    }}>
                                                        {(() => {
                                                            const result = poReverseMode === 'margin' ? minForTargetMargin : minForTargetProfit
                                                            const input = poReverseMode === 'margin' ? targetMargin : targetProfit
                                                            if (!input) return (
                                                                <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Enter a target above ?</p>
                                                            )
                                                            if (!result) return (
                                                                <p style={{ fontSize: 11, color: C.red, margin: 0 }}>Not achievable at current costs</p>
                                                            )
                                                            const achievable = result <= revenue
                                                            return (
                                                                <>
                                                                    <p style={{ fontSize: 9, fontWeight: 700, color: achievable ? C.green : C.red, margin: '0 0 2px', letterSpacing: '0.5px' }}>
                                                                        {achievable ? 'MIN PRICE' : 'NEED TO LIST AT'}
                                                                    </p>
                                                                    <p style={{ fontSize: 18, fontWeight: 900, color: achievable ? C.green : C.red, margin: '0 0 2px', lineHeight: 1 }}>
                                                                        {sym}{result.toFixed(2)}
                                                                    </p>
                                                                    <p style={{ fontSize: 9, color: achievable ? C.green : C.red, margin: 0 }}>
                                                                        {achievable
                                                                            ? `Your ${sym}${revenue.toFixed(2)} beats this by ${sym}${(revenue - result).toFixed(2)}`
                                                                            : `Raise by ${sym}${(result - revenue).toFixed(2)} to hit target`}
                                                                    </p>
                                                                </>
                                                            )
                                                        })()}
                                                    </div>
                                                </div>

                                                {/* Quick preset buttons */}
                                                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                                                    <p style={{ fontSize: 10, color: C.muted, margin: '4px 0 0', flexShrink: 0 }}>Quick targets:</p>
                                                    {poReverseMode === 'margin'
                                                        ? [10, 15, 20, 25, 30, 40].map(pct => (
                                                            <button key={pct} onClick={() => setPoTargetMarginStr(String(pct))}
                                                                style={{
                                                                    padding: '3px 8px', borderRadius: 6, border: `1px solid ${C.border}`,
                                                                    background: poTargetMarginStr === String(pct) ? C.lime : C.bg,
                                                                    color: poTargetMarginStr === String(pct) ? C.dark : C.muted,
                                                                    fontSize: 10, fontWeight: 700, cursor: 'pointer',
                                                                }}>
                                                                {pct}%
                                                            </button>
                                                        ))
                                                        : [2, 5, 10, 15, 20, 50].map(amt => (
                                                            <button key={amt} onClick={() => setPoTargetProfitStr(String(amt))}
                                                                style={{
                                                                    padding: '3px 8px', borderRadius: 6, border: `1px solid ${C.border}`,
                                                                    background: poTargetProfitStr === String(amt) ? C.lime : C.bg,
                                                                    color: poTargetProfitStr === String(amt) ? C.dark : C.muted,
                                                                    fontSize: 10, fontWeight: 700, cursor: 'pointer',
                                                                }}>
                                                                {sym}{amt}
                                                            </button>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Level 3: Interactive Price Slider ── */}
                                        {hasValidCosts && breakEven > 0 && (
                                            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>

                                                {/* Header with toggle */}
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                                    <p style={{ fontSize: 11, fontWeight: 700, color: C.text, margin: 0 }}>
                                                        Live price slider
                                                    </p>
                                                    <button onClick={() => setPoSliderActive(s => !s)}
                                                        style={{
                                                            padding: '3px 10px', borderRadius: 6, border: `1px solid ${C.border}`,
                                                            background: poSliderActive ? C.lime : C.bg,
                                                            color: poSliderActive ? C.dark : C.muted,
                                                            fontSize: 10, fontWeight: 700, cursor: 'pointer',
                                                        }}>
                                                        {poSliderActive ? 'Hide slider' : 'Show slider'}
                                                    </button>
                                                </div>

                                                {poSliderActive && (
                                                    <>
                                                        {/* Live readout */}
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                                                            <div style={{ textAlign: 'center', padding: '8px 0', background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
                                                                <p style={{ fontSize: 9, color: C.muted, margin: '0 0 2px', fontWeight: 700 }}>SELL PRICE</p>
                                                                <p style={{ fontSize: 16, fontWeight: 900, color: C.text, margin: 0, lineHeight: 1 }}>
                                                                    {sym}{poSliderValue.toFixed(2)}
                                                                </p>
                                                            </div>
                                                            <div style={{ textAlign: 'center', padding: '8px 0', background: poSliderProfit >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius: 8, border: `1px solid ${poSliderProfit >= 0 ? '#bbf7d0' : '#fecaca'}` }}>
                                                                <p style={{ fontSize: 9, color: C.muted, margin: '0 0 2px', fontWeight: 700 }}>PROFIT</p>
                                                                <p style={{ fontSize: 16, fontWeight: 900, color: poSliderProfit >= 0 ? C.green : C.red, margin: 0, lineHeight: 1 }}>
                                                                    {poSliderProfit >= 0 ? '+' : ''}{sym}{Math.abs(poSliderProfit).toFixed(2)}
                                                                </p>
                                                            </div>
                                                            <div style={{ textAlign: 'center', padding: '8px 0', background: poSliderMargin >= 15 ? '#f0fdf4' : poSliderMargin >= 0 ? '#fffbeb' : '#fef2f2', borderRadius: 8, border: `1px solid ${poSliderMargin >= 15 ? '#bbf7d0' : poSliderMargin >= 0 ? '#fde68a' : '#fecaca'}` }}>
                                                                <p style={{ fontSize: 9, color: C.muted, margin: '0 0 2px', fontWeight: 700 }}>MARGIN</p>
                                                                <p style={{ fontSize: 16, fontWeight: 900, color: poSliderMargin >= 15 ? C.green : poSliderMargin >= 0 ? C.amber : C.red, margin: 0, lineHeight: 1 }}>
                                                                    {poSliderMargin.toFixed(1)}%
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* The slider */}
                                                        <div style={{ position: 'relative', padding: '0 4px' }}>
                                                            {/* Zone background track */}
                                                            <div style={{ position: 'relative', height: 8, borderRadius: 999, overflow: 'hidden', marginBottom: 6, background: C.border }}>
                                                                {/* Red zone: poSliderMin ? breakEven */}
                                                                <div style={{
                                                                    position: 'absolute', left: 0, top: 0, bottom: 0,
                                                                    width: `${Math.min(((breakEven - poSliderMin) / (poSliderMax - poSliderMin)) * 100, 100)}%`,
                                                                    background: 'linear-gradient(to right, #fca5a5, #fde68a)',
                                                                }} />
                                                                {/* Amber zone: breakEven ? minFor15 */}
                                                                <div style={{
                                                                    position: 'absolute', top: 0, bottom: 0,
                                                                    left: `${((breakEven - poSliderMin) / (poSliderMax - poSliderMin)) * 100}%`,
                                                                    width: `${minFor15 > 0 ? ((minFor15 - breakEven) / (poSliderMax - poSliderMin)) * 100 : 10}%`,
                                                                    background: 'linear-gradient(to right, #fde68a, #bbf7d0)',
                                                                }} />
                                                                {/* Green zone: minFor15 ? poSliderMax */}
                                                                <div style={{
                                                                    position: 'absolute', top: 0, bottom: 0,
                                                                    left: `${minFor15 > 0 ? ((minFor15 - poSliderMin) / (poSliderMax - poSliderMin)) * 100 : 40}%`,
                                                                    right: 0,
                                                                    background: 'linear-gradient(to right, #86efac, #4ade80)',
                                                                }} />
                                                            </div>

                                                            {/* Native range input */}
                                                            <input
                                                                type="range"
                                                                min={poSliderMin}
                                                                max={poSliderMax}
                                                                step={poSliderStep}
                                                                value={poSliderValue}
                                                                onChange={e => {
                                                                    const v = parseFloat(e.target.value)
                                                                    setSellPriceStr(v.toFixed(2))
                                                                    patch({ sellingPrice: v })
                                                                    setSimPrice(v)
                                                                }}
                                                                style={{
                                                                    width: '100%', appearance: 'none', WebkitAppearance: 'none',
                                                                    height: 8, borderRadius: 999, background: 'transparent',
                                                                    outline: 'none', cursor: 'pointer', position: 'relative', zIndex: 2,
                                                                    marginTop: -14,
                                                                }}
                                                            />

                                                            {/* Zone labels */}
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                                                <span style={{ fontSize: 9, color: C.red, fontWeight: 700 }}>LOSS</span>
                                                                <span style={{ fontSize: 9, color: C.amber, fontWeight: 700 }}>THIN</span>
                                                                <span style={{ fontSize: 9, color: C.green, fontWeight: 700 }}>PROFIT ?</span>
                                                            </div>
                                                        </div>

                                                        {/* Snap to key prices */}
                                                        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                                                            <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>Snap to:</span>
                                                            {[
                                                                { label: `Break-even ${sym}${breakEven.toFixed(2)}`, value: breakEven, color: C.red },
                                                                { label: `15% floor ${sym}${minFor15.toFixed(2)}`, value: minFor15, color: C.amber },
                                                                { label: `25% target ${sym}${minFor25.toFixed(2)}`, value: minFor25, color: C.green },
                                                            ].filter(s => s.value > 0).map(snap => (
                                                                <button key={snap.label}
                                                                    onClick={() => {
                                                                        setSellPriceStr(snap.value.toFixed(2))
                                                                        patch({ sellingPrice: snap.value })
                                                                        setSimPrice(snap.value)
                                                                    }}
                                                                    style={{
                                                                        padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                                                                        border: `1px solid ${snap.color}20`,
                                                                        background: Math.abs(poSliderValue - snap.value) < 0.01 ? snap.color : `${snap.color}15`,
                                                                        color: Math.abs(poSliderValue - snap.value) < 0.01 ? C.dark : snap.color,
                                                                        cursor: 'pointer',
                                                                    }}>
                                                                    {snap.label}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {/* Smart verdict */}
                                                        <div style={{
                                                            marginTop: 10, padding: '8px 12px', borderRadius: 8,
                                                            background: poSliderMargin >= 25 ? '#f0fdf4'
                                                                : poSliderMargin >= 15 ? '#fffbeb'
                                                                    : poSliderMargin >= 0 ? '#fef2f2'
                                                                        : '#fef2f2',
                                                            border: `1px solid ${poSliderMargin >= 25 ? '#bbf7d0' : poSliderMargin >= 15 ? '#fde68a' : '#fecaca'}`,
                                                        }}>
                                                            <p style={{ fontSize: 11, fontWeight: 700, margin: 0, color: poSliderMargin >= 25 ? C.green : poSliderMargin >= 15 ? C.amber : C.red }}>
                                                                {poSliderMargin >= 25 ? `Sweet spot — strong margin at ${sym}${poSliderValue.toFixed(2)}`
                                                                    : poSliderMargin >= 15 ? `Acceptable — thin but positive at ${sym}${poSliderValue.toFixed(2)}`
                                                                        : poSliderMargin >= 0 ? `Danger zone — barely covering costs`
                                                                            : `Loss — you lose ${sym}${Math.abs(poSliderProfit).toFixed(2)} at this price`}
                                                            </p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}


                                {/* ──────────────────────────────────────────────────────────────
                SCENARIOS ? Best Offer / Reverse Price / Return Impact
                ────────────────────────────────────────────────────────────── */}
                                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <SectionLabel>SCENARIOS</SectionLabel>
                                        <span style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: '0.3px' }}>PROFIT UNDER DIFFERENT CONDITIONS</span>
                                    </div>

                                    {/* Tab switcher */}
                                    <div style={{ display: 'flex', gap: 4, background: C.bg, padding: 4, borderRadius: 10, marginBottom: 14 }}>
                                        {[
                                            { id: 'offer' as const, label: 'Best Offer' },
                                            { id: 'reverse' as const, label: 'Reverse Price' },
                                            { id: 'returns' as const, label: 'Returns Impact' },
                                        ].map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setScenarioTab(tab.id)}
                                                style={{
                                                    flex: 1, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                                                    fontSize: 12, fontWeight: 700, letterSpacing: '0.2px',
                                                    background: scenarioTab === tab.id ? C.dark : 'transparent',
                                                    color: scenarioTab === tab.id ? C.lime : C.muted,
                                                    transition: 'all 0.15s',
                                                }}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* ── BEST OFFER TAB ── */}
                                    {scenarioTab === 'offer' && (
                                        <div>
                                            <p style={{ fontSize: 11, color: C.muted, margin: '0 0 12px' }}>
                                                A buyer offers you a lower price — is it still profitable? Drag the slider to test any offer.
                                            </p>

                                            {/* Big display of offer + resulting profit */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                                                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12 }}>
                                                    <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.4px', margin: 0 }}>BUYER OFFERS</p>
                                                    <p style={{ fontSize: 26, fontWeight: 900, color: C.dark, margin: '4px 0 0', lineHeight: 1 }}>
                                                        {formatNum(bestOfferPrice, sym)}
                                                    </p>
                                                    <p style={{ fontSize: 10, color: C.muted, margin: '4px 0 0' }}>
                                                        {state.sellingPrice > 0 ? `${((bestOfferPrice / state.sellingPrice) * 100).toFixed(0)}%` : '0%'} of your listing ({formatNum(state.sellingPrice, sym)})
                                                    </p>
                                                </div>
                                                <div style={{ background: profitColor(bestOfferNet) === C.green ? C.limeTint : profitColor(bestOfferNet) === C.red ? '#fee2e2' : C.bg, border: `1px solid ${profitColor(bestOfferNet)}`, borderRadius: 10, padding: 12 }}>
                                                    <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.4px', margin: 0 }}>YOUR NET PROFIT</p>
                                                    <p style={{ fontSize: 26, fontWeight: 900, color: profitColor(bestOfferNet), margin: '4px 0 0', lineHeight: 1 }}>
                                                        {bestOfferNet >= 0 ? "+" : "-"}{formatNum(bestOfferNet, sym)}
                                                    </p>
                                                    <p style={{ fontSize: 10, color: C.muted, margin: '4px 0 0' }}>
                                                        Margin: {formatPct(bestOfferMargin)} · ROI: {formatPct(bestOfferRoi)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Slider */}
                                            <div style={{ position: 'relative', width: '100%', height: 20, display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                                <div style={{ position: 'absolute', left: 0, right: 0, height: 6, borderRadius: 999, background: boGradient, pointerEvents: 'none' }} />
                                                <input
                                                    type="range"
                                                    min={0.01}
                                                    max={state.sellingPrice > 0 ? state.sellingPrice : 100}
                                                    step={0.01}
                                                    value={bestOfferPrice}
                                                    onChange={e => setBestOfferPrice(parseFloat(e.target.value))}
                                                    style={{ width: '100%', accentColor: C.lime, cursor: 'pointer', position: 'relative', background: 'transparent', appearance: 'none', WebkitAppearance: 'none', height: 20, margin: 0 }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 700 }}>
                                                <span style={{ color: C.red }}>Break even: {formatNum(breakEven, sym)}</span>
                                                <span style={{ color: C.dark }}>Your listing: {formatNum(state.sellingPrice, sym)}</span>
                                            </div>

                                            {/* Verdict banner */}
                                            <div style={{
                                                marginTop: 12,
                                                background: bestOfferNet > 0 ? C.limeTint : bestOfferNet < 0 ? '#fee2e2' : C.bg,
                                                border: `1px solid ${profitColor(bestOfferNet)}`,
                                                borderRadius: 8, padding: 10,
                                            }}>
                                                <p style={{ fontSize: 12, fontWeight: 700, color: profitColor(bestOfferNet), margin: 0 }}>
                                                    {bestOfferNet > originalNet * 0.7 ? 'Accept — solid profit'
                                                        : bestOfferNet > 0 ? 'Marginal ? accept only if you want the sale'
                                                            : bestOfferNet === 0 ? 'Break even ? no reason to accept'
                                                                : 'Reject ? you lose money at this price'}
                                                </p>
                                                {originalNet > 0 && bestOfferNet !== originalNet && (
                                                    <p style={{ fontSize: 10, color: C.muted, margin: '2px 0 0' }}>
                                                        {offerImpact < 0 ? 'Cuts your profit by ' : 'Boosts your profit by '}
                                                        {Math.abs(offerImpact).toFixed(1)}% vs your listed price.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── REVERSE PRICE TAB ── */}
                                    {scenarioTab === 'reverse' && (
                                        <div>
                                            <p style={{ fontSize: 11, color: C.muted, margin: '0 0 12px' }}>
                                                Enter your target profit or margin — get the minimum listing price you need to charge.
                                            </p>

                                            {/* Mode toggle */}
                                            <div style={{ display: 'flex', gap: 4, background: C.bg, padding: 3, borderRadius: 999, marginBottom: 12, width: 'fit-content' }}>
                                                {(['profit', 'margin'] as const).map(m => (
                                                    <button
                                                        key={m}
                                                        onClick={() => setReverseMode(m)}
                                                        style={{
                                                            padding: '4px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
                                                            fontSize: 11, fontWeight: 700,
                                                            background: reverseMode === m ? C.dark : 'transparent',
                                                            color: reverseMode === m ? C.lime : C.muted,
                                                        }}
                                                    >
                                                        Target {m === 'profit' ? 'Profit ($)' : 'Margin (%)'}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Input */}
                                            <div style={{ marginBottom: 14 }}>
                                                <InputField
                                                    label={reverseMode === 'profit' ? `Target net profit per unit` : `Target profit margin`}
                                                    value={reverseMode === 'profit' ? targetProfitStr : targetMarginStr}
                                                    prefix={reverseMode === 'profit' ? sym : undefined}
                                                    suffix={poReverseMode === 'margin' ? '%' : undefined}
                                                    tooltip={reverseMode === 'profit'
                                                        ? 'How much profit you want to make on every sale'
                                                        : 'Profit margin as % of selling price. 30% is healthy, 50%+ is excellent.'}
                                                    onChange={v => reverseMode === 'profit' ? setTargetProfitStr(v) : setTargetMarginStr(v)}
                                                />
                                            </div>

                                            {/* Result */}
                                            {marginDenom <= 0 && poReverseMode === 'margin' ? (
                                                <div style={{ background: '#fef3c7', border: `1px solid ${C.amber}`, borderRadius: 8, padding: 12, fontSize: 12 }}>
                                                    <p style={{ color: C.amber, fontWeight: 700, margin: 0 }}>Impossible target</p>
                                                    <p style={{ color: C.text, margin: '4px 0 0', fontSize: 11 }}>
                                                        eBay fees ({totalFeeRatePct.toFixed(1)}%) + your target margin ({targetMargin}%) exceeds 100%.
                                                        Lower your target margin or reduce fees (Store tier, seller level).
                                                    </p>
                                                </div>
                                            ) : reverseRequiredPrice > 0 ? (
                                                <>
                                                    {/* Big price hero */}
                                                    <div style={{ background: C.dark, borderRadius: 12, padding: 16, textAlign: 'center', marginBottom: 10 }}>
                                                        <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.5px', margin: 0 }}>
                                                            YOU MUST LIST AT
                                                        </p>
                                                        <p style={{ fontSize: 38, fontWeight: 900, color: C.lime, margin: '4px 0 0', lineHeight: 1 }}>
                                                            {formatNum(reverseRequiredPrice, sym)}
                                                        </p>
                                                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: '6px 0 0' }}>
                                                            to achieve {reverseMode === 'profit' ? `${sym}${targetProfit.toFixed(2)} profit` : `${targetMargin}% margin`}
                                                        </p>
                                                    </div>

                                                    {/* Gap vs current */}
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                                                        <div style={{ background: C.bg, borderRadius: 8, padding: 10 }}>
                                                            <p style={{ fontSize: 10, color: C.muted, fontWeight: 600, margin: 0 }}>Currently listed at</p>
                                                            <p style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: '2px 0 0' }}>{formatNum(state.sellingPrice, sym)}</p>
                                                        </div>
                                                        <div style={{ background: C.bg, borderRadius: 8, padding: 10 }}>
                                                            <p style={{ fontSize: 10, color: C.muted, fontWeight: 600, margin: 0 }}>Gap</p>
                                                            <p style={{ fontSize: 16, fontWeight: 800, color: currentPriceGap > 0 ? C.red : C.green, margin: '2px 0 0' }}>
                                                                {currentPriceGap >= 0 ? "+" : "-"}{formatNum(currentPriceGap, sym)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Verification */}
                                                    <div style={{ background: C.limeTint, borderLeft: `3px solid ${C.lime}`, padding: '8px 10px', borderRadius: 4, fontSize: 11 }}>
                                                        <p style={{ color: C.dark, margin: 0 }}>
                                                            ? At {formatNum(reverseRequiredPrice, sym)}: net profit {formatNum(reverseVerifyProfit, sym)} ({reverseVerifyMargin.toFixed(1)}% margin)
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <p style={{ fontSize: 12, color: C.muted, textAlign: 'center', padding: 20 }}>
                                                    Enter a target above to calculate the required listing price.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* ── RETURNS IMPACT TAB ── */}
                                    {scenarioTab === 'returns' && (
                                        <div>
                                            <p style={{ fontSize: 11, color: C.muted, margin: '0 0 12px' }}>
                                                Real returns eat into profit. Model your actual return rate + return shipping cost to see your true margin.
                                            </p>

                                            {/* Return rate slider + return shipping input */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 14 }}>
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                        <label style={{ fontSize: 11, fontWeight: 600, color: C.text }}>Return rate</label>
                                                        <span style={{ fontSize: 13, fontWeight: 800, color: returnRate <= 5 ? C.green : returnRate <= 15 ? C.amber : C.red }}>
                                                            {returnRate}%
                                                        </span>
                                                    </div>
                                                    <div style={{ position: 'relative', width: '100%', height: 20, display: 'flex', alignItems: 'center' }}>
                                                        <div style={{ position: 'absolute', left: 0, right: 0, height: 6, borderRadius: 999, background: returnRateGradient, pointerEvents: 'none' }} />
                                                        <input
                                                            type="range" min={0} max={50} step={1}
                                                            value={returnRate}
                                                            onChange={e => setReturnRateStr(e.target.value)}
                                                            style={{ width: '100%', accentColor: C.lime, cursor: 'pointer', background: 'transparent', appearance: 'none', WebkitAppearance: 'none', height: 20, margin: 0, position: 'relative' }}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, fontWeight: 700, color: C.muted, marginTop: 2 }}>
                                                        <span>0% Perfect</span>
                                                        <span>5% Great</span>
                                                        <span>15% Avg</span>
                                                        <span>30%+ Poor</span>
                                                    </div>
                                                </div>
                                                <InputField
                                                    label="Return shipping"
                                                    value={returnShippingStr}
                                                    prefix={sym}
                                                    tooltip="Cost YOU pay for return shipping label. eBay typically doesn't refund this to you."
                                                    onChange={v => setReturnShippingStr(v)}
                                                />
                                            </div>

                                            {/* Per 100 sales visualization */}
                                            <div style={{ background: C.bg, borderRadius: 10, padding: 12, marginBottom: 10 }}>
                                                <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.4px', margin: '0 0 8px' }}>PER 100 SALES</p>
                                                <div style={{ display: 'flex', height: 24, borderRadius: 6, overflow: 'hidden', marginBottom: 6 }}>
                                                    <div style={{ width: `${successCount}%`, background: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {successCount >= 15 && <span style={{ fontSize: 10, fontWeight: 800, color: C.dark }}>{successCount} sold</span>}
                                                    </div>
                                                    <div style={{ width: `${returnCount}%`, background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {returnCount >= 15 && <span style={{ fontSize: 10, fontWeight: 800, color: C.surface }}>{returnCount} returned</span>}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                                                    <span style={{ color: C.green, fontWeight: 700 }}>+ {formatNum(totalSuccessProfit, sym)} from {successCount} sales</span>
                                                    {returnCount > 0 && (
                                                        <span style={{ color: C.red, fontWeight: 700 }}>▼ {formatNum(totalReturnLoss, sym)} from {returnCount} returns</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Real per-unit profit */}
                                            <div style={{ background: C.dark, borderRadius: 10, padding: 14 }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11, marginBottom: 10 }}>
                                                    <div>
                                                        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: 600, margin: 0, letterSpacing: '0.3px' }}>ORIGINAL PROFIT</p>
                                                        <p style={{ fontSize: 18, fontWeight: 800, color: C.surface, margin: '2px 0 0' }}>{formatNum(originalNet, sym)}</p>
                                                        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', margin: 0 }}>per unit (no returns)</p>
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: 9, color: C.lime, fontWeight: 600, margin: 0, letterSpacing: '0.3px' }}>EFFECTIVE PROFIT</p>
                                                        <p style={{ fontSize: 18, fontWeight: 800, color: effectivePerUnit >= 0 ? C.lime : '#fca5a5', margin: '2px 0 0' }}>
                                                            {effectivePerUnit >= 0 ? "" : "-"}{formatNum(effectivePerUnit, sym)}
                                                        </p>
                                                        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', margin: 0 }}>per unit (with returns)</p>
                                                    </div>
                                                </div>
                                                {marginErosion > 0 && originalNet > 0 && (
                                                    <p style={{ fontSize: 10, color: '#fca5a5', margin: 0, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 8 }}>
                                                        Returns erode your profit by <strong>{marginErosion.toFixed(1)}%</strong> ? {formatNum(originalNet - effectivePerUnit, sym)} lost per unit on average.
                                                    </p>
                                                )}
                                            </div>

                                            {returnRate > 15 && (
                                                <div style={{ background: '#fef3c7', border: `1px solid ${C.amber}`, borderRadius: 8, padding: 10, marginTop: 10, fontSize: 11 }}>
                                                    <strong style={{ color: C.amber }}>High return rate warning:</strong> <span style={{ color: C.text }}>{returnRate}% returns is above the eBay average. Review product quality, listing accuracy, or shipping method.</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                            </div>

                        </div>
                        {/* ── END 2-COLUMN LAYOUT ── */}

                        {/* ── BULK & VOLUME ANALYSIS ──────────────────────────────────? */}
                        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: bulkEnabled ? 14 : 0 }}>
                                <SectionLabel>BULK &amp; VOLUME ANALYSIS</SectionLabel>
                                <Toggle
                                    label={bulkEnabled ? 'ON' : 'Turn on'}
                                    checked={bulkEnabled}
                                    onChange={setBulkEnabled}
                                    tooltip="Enable to model buying and selling multiple units ? bulk discounts, sell-through, profit velocity"
                                />
                            </div>

                            {bulkEnabled && (
                                <>
                                    {/* Mode toggle */}
                                    <div style={{ display: 'flex', gap: 6, background: C.bg, padding: 4, borderRadius: 999, marginBottom: 14, width: 'fit-content' }}>
                                        {(['simple', 'realistic'] as const).map(m => (
                                            <button
                                                key={m}
                                                onClick={() => setBulkMode(m)}
                                                style={{
                                                    padding: '4px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
                                                    fontSize: 11, fontWeight: 700, letterSpacing: '0.3px',
                                                    background: bulkMode === m ? C.dark : 'transparent',
                                                    color: bulkMode === m ? C.lime : C.muted,
                                                    transition: 'all 0.15s',
                                                }}
                                            >
                                                {m === 'simple' ? 'SIMPLE' : 'REALISTIC'}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Row 1 ? Units purchased + auto totals */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                                        <InputField
                                            label="Units purchased"
                                            value={unitsPurchasedStr}
                                            tooltip="How many units did you buy from your supplier"
                                            onChange={v => setUnitsPurchasedStr(v.replace(/[^0-9]/g, ''))}
                                        />
                                        <div>
                                            <label style={{ fontSize: 11, fontWeight: 600, color: C.text, display: 'block', marginBottom: 4 }}>Cost per unit</label>
                                            <div style={{ height: 34, border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '0 8px', background: C.bg, display: 'flex', alignItems: 'center', fontSize: 13, color: C.text, fontWeight: 600 }}>
                                                {formatNum(state.buyPrice, sym)}
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 11, fontWeight: 600, color: C.text, display: 'block', marginBottom: 4 }}>Total investment</label>
                                            <div style={{ height: 34, border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '0 8px', background: C.bg, display: 'flex', alignItems: 'center', fontSize: 13, color: C.text, fontWeight: 700 }}>
                                                {formatNum(totalInvestment, sym)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Realistic-mode extras */}
                                    {bulkMode === 'realistic' && (
                                        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>

                                            {/* Sell-through slider */}
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                    <label style={{ fontSize: 11, fontWeight: 600, color: C.text }}>Expected sell-through rate</label>
                                                    <span style={{ fontSize: 13, fontWeight: 800, color: sellThroughPct >= 75 ? C.green : sellThroughPct >= 60 ? C.amber : C.red }}>
                                                        {sellThroughPct.toFixed(0)}%
                                                    </span>
                                                </div>
                                                <div style={{ position: 'relative', width: '100%', height: 20, display: 'flex', alignItems: 'center' }}>
                                                    <div style={{ position: 'absolute', left: 0, right: 0, height: 6, borderRadius: 999, background: sellThroughGradient, pointerEvents: 'none' }} />
                                                    <input
                                                        type="range" min={30} max={100} step={1}
                                                        value={sellThroughPct}
                                                        onChange={e => setSellThroughStr(e.target.value)}
                                                        style={{ width: '100%', accentColor: C.lime, cursor: 'pointer', background: 'transparent', appearance: 'none', WebkitAppearance: 'none', height: 20, margin: 0, position: 'relative' }}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, fontWeight: 700, color: C.muted, marginTop: 2 }}>
                                                    <span>30% Poor</span>
                                                    <span>60% Avg</span>
                                                    <span>75% Good</span>
                                                    <span>90%+ Top</span>
                                                </div>
                                                <p style={{ fontSize: 10, color: C.muted, margin: '6px 0 0' }}>
                                                    You&apos;ll sell <strong style={{ color: C.text }}>{unitsExpectedToSell}</strong> units. {unitsDeadStock > 0 && <>Dead stock: <strong style={{ color: C.red }}>{unitsDeadStock} units ({formatNum(deadStockLoss, sym)} loss)</strong></>}
                                                </p>
                                            </div>

                                            {/* Time to sell + bulk shipping */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                                <InputField
                                                    label="Time to sell all (days)"
                                                    value={timeToSellStr}
                                                    tooltip="Realistic estimate ? how many days until you sell your expected units"
                                                    onChange={v => setTimeToSellStr(v.replace(/[^0-9]/g, ''))}
                                                />
                                                <InputField
                                                    label="Bulk shipping (override)"
                                                    value={bulkShipOverrideStr}
                                                    prefix={sym}
                                                    tooltip="Optional lower per-unit shipping rate when shipping in volume. Leave blank to use regular rate. Requires eBay-generated labels + managed payments for real commercial rates."
                                                    onChange={v => setBulkShipOverrideStr(v)}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Warning banners */}
                                    {showLowSellThroughWarning && (
                                        <div style={{ background: '#fef3c7', border: '1px solid #d97706', borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 11 }}>
                                            <strong style={{ color: C.amber }}>Low sell-through:</strong> <span style={{ color: C.text }}>at {sellThroughPct.toFixed(0)}%, {unitsDeadStock} of {unitsPurchased} units will stay unsold ({formatNum(deadStockLoss, sym)} loss).</span>
                                        </div>
                                    )}
                                    {showSlowVelocityWarning && (
                                        <div style={{ background: '#fef3c7', border: '1px solid #d97706', borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 11 }}>
                                            <strong style={{ color: C.amber }}>Slow velocity:</strong> <span style={{ color: C.text }}>{timeToSellDays} days is a long hold — your capital is tied up for {monthsToClear.toFixed(1)} months.</span>
                                        </div>
                                    )}
                                    {showDeadCapitalWarning && (
                                        <div style={{ background: '#fee2e2', border: '1px solid #b91c1c', borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 11 }}>
                                            <strong style={{ color: C.red }}>Poor return on capital:</strong> <span style={{ color: C.text }}>you&apos;re earning only {formatNum(dollarPerDollarPerMonth, sym)} per {sym}1 invested per month. Consider a faster-moving product.</span>
                                        </div>
                                    )}

                                    {/* Profit Reality box */}
                                    <div style={{ background: C.dark, borderRadius: 12, padding: 16, color: C.surface, marginBottom: 10 }}>
                                        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', color: C.lime, margin: '0 0 12px' }}>PROFIT REALITY</p>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, marginBottom: 12 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Per-unit profit</span>
                                                <span style={{ fontWeight: 700 }}>{formatNum(bulkAdjustedProfitPerUnit, sym)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'rgba(255,255,255,0.6)' }}>✓ {unitsExpectedToSell} sold</span>
                                                <span style={{ fontWeight: 700 }}>{formatNum(grossBulkProfit, sym)}</span>
                                            </div>
                                            {bulkMode === 'realistic' && deadStockLoss > 0 && (
                                                <>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>✗ Dead stock</span>
                                                        <span style={{ fontWeight: 700, color: '#fca5a5' }}>-{formatNum(deadStockLoss, sym)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>Investment</span>
                                                        <span style={{ fontWeight: 700 }}>{formatNum(totalInvestment, sym)}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Real profit hero */}
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 12 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                <span style={{ fontSize: 12, fontWeight: 700, color: C.lime, letterSpacing: '0.5px' }}>REAL PROFIT</span>
                                                <span style={{ fontSize: 26, fontWeight: 900, color: realBulkProfit >= 0 ? C.lime : '#fca5a5', lineHeight: 1 }}>
                                                    {realBulkProfit >= 0 ? "+" : "-"}{formatNum(realBulkProfit, sym)}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 6, color: 'rgba(255,255,255,0.7)' }}>
                                                <span>ROI: <strong style={{ color: C.surface }}>{formatPct(bulkROI)}</strong></span>
                                                {bulkMode === 'realistic' && breakEvenDay > 0 && (
                                                    <span>Break-even: <strong style={{ color: C.surface }}>Day {breakEvenDay}</strong></span>
                                                )}
                                                <span>Sales/day: <strong style={{ color: C.surface }}>{salesPerDay.toFixed(2)}</strong></span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── BREAK-EVEN LADDER ──────────────────────────────? */}
                                    {unitsPurchased > 1 && (
                                        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', color: C.muted, margin: '0 0 12px' }}>BREAK-EVEN LADDER</p>

                                            {!isProfitable ? (
                                                <div style={{ background: '#fee2e2', border: `1px solid ${C.red}`, borderRadius: 8, padding: 12, fontSize: 12 }}>
                                                    <p style={{ color: C.red, fontWeight: 700, margin: 0 }}>Impossible ? per-unit profit is negative</p>
                                                    <p style={{ color: C.text, margin: '4px 0 0', fontSize: 11 }}>
                                                        You&apos;d lose {formatNum(bulkAdjustedProfitPerUnit, sym)} on every unit sold.
                                                        Raise the selling price or lower your costs before buying in bulk.
                                                    </p>
                                                </div>
                                            ) : currentBreakEven <= 1 ? (
                                                <div style={{ background: C.limeTint, border: `1px solid ${C.lime}`, borderRadius: 8, padding: 12, fontSize: 12 }}>
                                                    <p style={{ color: C.limeDeep, fontWeight: 700, margin: 0 }}>Break-even in 1 sale</p>
                                                    <p style={{ color: C.text, margin: '4px 0 0', fontSize: 11 }}>
                                                        Your per-unit profit ({formatNum(bulkAdjustedProfitPerUnit, sym)}) covers your total investment ({formatNum(totalInvestment, sym)}) in a single unit.
                                                    </p>
                                                </div>
                                            ) : currentBreakEven > unitsPurchased ? (
                                                <div style={{ background: '#fef3c7', border: `1px solid ${C.amber}`, borderRadius: 8, padding: 12, fontSize: 12 }}>
                                                    <p style={{ color: C.amber, fontWeight: 700, margin: 0 }}>Break-even impossible at this quantity</p>
                                                    <p style={{ color: C.text, margin: '4px 0 0', fontSize: 11 }}>
                                                        You&apos;d need to sell {currentBreakEven} units to recover investment, but only bought {unitsPurchased}.
                                                        Reduce costs or buy fewer units.
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Headline number */}
                                                    <div style={{ textAlign: 'center', marginBottom: 14 }}>
                                                        <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>You&apos;ll break even after selling</p>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                                                            <span style={{ fontSize: 34, fontWeight: 900, color: C.dark, lineHeight: 1 }}>{currentBreakEven}</span>
                                                            <span style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>of {unitsPurchased} units</span>
                                                        </div>
                                                        {bulkMode === 'realistic' && realisticBreakEvenUnits !== optimisticBreakEvenUnits && (
                                                            <p style={{ fontSize: 10, color: C.muted, margin: '4px 0 0' }}>
                                                                Optimistic (no dead stock): {optimisticBreakEvenUnits} units
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Segmented bar */}
                                                    <div style={{ display: 'flex', width: '100%', height: 24, borderRadius: 6, overflow: 'hidden', background: C.border, marginBottom: 8 }}>
                                                        <div style={{ width: `${recoveryPct}%`, background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {recoveryPct >= 15 && (
                                                                <span style={{ fontSize: 10, fontWeight: 800, color: C.surface }}>{recoveryUnits}</span>
                                                            )}
                                                        </div>
                                                        <div style={{ width: `${profitPct2}%`, background: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {profitPct2 >= 15 && (
                                                                <span style={{ fontSize: 10, fontWeight: 800, color: C.dark }}>{profitUnits}</span>
                                                            )}
                                                        </div>
                                                        <div style={{ width: `${deadStockPct}%`, background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {deadStockPct >= 15 && (
                                                                <span style={{ fontSize: 10, fontWeight: 800, color: C.surface }}>{deadStockUnits}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Legend */}
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginBottom: 12 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <div style={{ width: 8, height: 8, background: C.red, borderRadius: 2 }} />
                                                            <span style={{ color: C.muted, fontWeight: 600 }}>Recover cost</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <div style={{ width: 8, height: 8, background: C.lime, borderRadius: 2 }} />
                                                            <span style={{ color: C.muted, fontWeight: 600 }}>Pure profit</span>
                                                        </div>
                                                        {deadStockUnits > 0 && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                <div style={{ width: 8, height: 8, background: C.dark, borderRadius: 2 }} />
                                                                <span style={{ color: C.muted, fontWeight: 600 }}>Dead stock</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Insight message */}
                                                    <div style={{ background: C.limeTint, borderLeft: `3px solid ${C.lime}`, padding: '8px 10px', borderRadius: 4, marginBottom: 10 }}>
                                                        <p style={{ fontSize: 11, color: C.dark, margin: 0, fontWeight: 600 }}>
                                                            ? Every sale after unit {currentBreakEven} = pure profit
                                                        </p>
                                                    </div>

                                                    {/* Detailed breakdown */}
                                                    <div style={{ background: C.bg, borderRadius: 8, padding: 10, fontSize: 11 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: C.muted }}>
                                                            <span>Recover investment (units 1 ? {currentBreakEven})</span>
                                                            <span style={{ color: C.red, fontWeight: 700 }}>-{formatNum(totalInvestment, sym)}</span>
                                                        </div>
                                                        {profitUnits > 0 && (
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: C.muted }}>
                                                                <span>Pure profit (units {currentBreakEven + 1} ? {recoveryUnits + profitUnits})</span>
                                                                <span style={{ color: C.green, fontWeight: 700 }}>+{formatNum(pureProfitValue, sym)}</span>
                                                            </div>
                                                        )}
                                                        {bulkMode === 'realistic' && deadStockUnits > 0 && (
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: C.muted }}>
                                                                <span>Dead stock loss ({deadStockUnits} units unsold)</span>
                                                                <span style={{ color: C.red, fontWeight: 700 }}>-{formatNum(deadStockValue, sym)}</span>
                                                            </div>
                                                        )}
                                                        <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                                                            <span style={{ fontWeight: 700, color: C.text }}>Real net</span>
                                                            <span style={{ fontWeight: 800, color: realBulkProfit >= 0 ? C.green : C.red }}>
                                                                {realBulkProfit >= 0 ? "+" : "-"}{formatNum(realBulkProfit, sym)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Star metric ? $/$/month */}
                                    {bulkMode === 'realistic' && totalInvestment > 0 && (
                                        <div style={{ background: `linear-gradient(135deg, ${C.limeTint} 0%, ${C.surface} 100%)`, border: `1.5px solid ${C.lime}`, borderRadius: 10, padding: 12, marginBottom: 10 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <p style={{ fontSize: 10, fontWeight: 700, color: C.limeDeep, margin: 0, letterSpacing: '0.5px' }}>? PER {sym}1 INVESTED PER MONTH</p>
                                                    <p style={{ fontSize: 22, fontWeight: 900, color: C.dark, margin: '2px 0 0' }}>{formatNum(dollarPerDollarPerMonth, sym)}</p>
                                                </div>
                                                <div style={{ background: velocityTier.color, color: C.surface, padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 800, letterSpacing: '0.5px' }}>
                                                    {velocityTier.label}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Bulk vs Single comparison */}
                                    {unitsPurchased > 1 && (
                                        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12 }}>
                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', color: C.muted, margin: '0 0 10px' }}>BULK VS SINGLE SALE</p>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: 8, fontSize: 11 }}>
                                                <div></div>
                                                <div style={{ textAlign: 'center', fontWeight: 700, color: C.muted, fontSize: 10 }}>SINGLE SALE</div>
                                                <div style={{ textAlign: 'center', fontWeight: 700, color: C.lime, fontSize: 10 }}>BUY {unitsPurchased}</div>

                                                <div style={{ color: C.muted }}>Per-unit profit</div>
                                                <div style={{ textAlign: 'center' }}>{sym}{singleSaleProfit.toFixed(2)}</div>
                                                <div style={{ textAlign: 'center', fontWeight: 700 }}>{formatNum(bulkAdjustedProfitPerUnit, sym)}</div>

                                                <div style={{ color: C.muted }}>Investment</div>
                                                <div style={{ textAlign: 'center' }}>{formatNum(state.buyPrice, sym)}</div>
                                                <div style={{ textAlign: 'center', fontWeight: 700 }}>{formatNum(totalInvestment, sym)}</div>

                                                <div style={{ color: C.muted }}>Total profit</div>
                                                <div style={{ textAlign: 'center' }}>{sym}{singleSaleProfit.toFixed(2)}</div>
                                                <div style={{ textAlign: 'center', fontWeight: 700, color: C.green }}>{formatNum(realBulkProfit, sym)}</div>
                                            </div>

                                            {shippingSavingPerUnit > 0.01 && (
                                                <p style={{ fontSize: 10, color: C.green, margin: '10px 0 0', fontWeight: 600 }}>
                                                    Bulk shipping saves you {sym}{shippingSavingPerUnit.toFixed(2)} per unit ({sym}{(shippingSavingPerUnit * unitsExpectedToSell).toFixed(2)} total)
                                                </p>
                                            )}
                                            {bulkVsSingleDiff !== 0 && singleSaleProfit > 0 && (
                                                <p style={{ fontSize: 11, textAlign: 'center', margin: '10px 0 0', fontWeight: 700, color: bulkVsSingleDiff > 0 ? C.green : C.red }}>
                                                    Bulk {bulkVsSingleDiff > 0 ? 'wins' : 'loses'} by {Math.abs(bulkVsSingleDiff).toFixed(1)}% per unit
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                    </div>
                </div>
                {/* end main grid */}

                {/* ── History drawer (slides from right) ── */}
                {historyOpen && (
                    <>
                        <div
                            onClick={() => setHistoryOpen(false)}
                            style={{
                                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                                zIndex: 9998, animation: 'fadeIn 0.15s ease',
                            }}
                        />
                        <div style={{
                            position: 'fixed', top: 0, right: 0, bottom: 0,
                            width: 400, background: C.surface, zIndex: 9999,
                            boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
                            display: 'flex', flexDirection: 'column',
                            animation: 'slideInRight 0.2s ease',
                        }}>
                            {/* Header */}
                            <div style={{ padding: 20, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                                <div>
                                    <p style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: 0 }}>Saved calculations</p>
                                    <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 0' }}>{savedItems.length} total</p>
                                </div>
                                <button onClick={() => setHistoryOpen(false)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: C.muted, display: 'flex' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Search */}
                            <div style={{ padding: '12px 20px', borderBottom: `1px solid ${C.border}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 10px', background: C.bg }}>
                                    <Search size={13} color={C.muted} />
                                    <input
                                        placeholder="Search saved products..."
                                        value={historySearch}
                                        onChange={e => setHistorySearch(e.target.value)}
                                        style={{ flex: 1, height: 32, border: 'none', outline: 'none', background: 'transparent', fontSize: 12, marginLeft: 8, color: C.text }}
                                    />
                                </div>
                            </div>

                            {/* List */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                                {filteredHistory.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '40px 20px', color: C.muted, fontSize: 12 }}>
                                        {savedItems.length === 0
                                            ? 'No saved calculations yet. Type a product name above and click Save to keep your research.'
                                            : 'No matches for that search.'}
                                    </div>
                                )}
                                {filteredHistory.map(item => {
                                    const isSelected = selectedIds.has(item.id)
                                    return (
                                        <div key={item.id} style={{
                                            border: `1px solid ${isSelected ? C.lime : C.border}`,
                                            borderRadius: 10, padding: 12, marginBottom: 10,
                                            background: isSelected ? C.limeTint : C.surface,
                                            transition: 'all 0.15s',
                                            boxShadow: isSelected ? `0 0 0 1px ${C.lime}` : 'none',
                                        }}>
                                            {/* Header row */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(item.id)}
                                                    disabled={!isSelected && selectedIds.size >= 3}
                                                    style={{ width: 16, height: 16, accentColor: C.lime, cursor: 'pointer', flexShrink: 0 }}
                                                />
                                                <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {item.product_name}
                                                </p>
                                                <span style={{ fontSize: 10, color: C.muted, flexShrink: 0 }}>
                                                    {timeAgo(item.last_viewed_at)}
                                                </span>
                                            </div>

                                            {/* Country + prices */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                                                <span
                                                    className={`fi fi-${COUNTRIES[item.country as CountryCode]?.flag ?? 'us'}`}
                                                    style={{ width: 16, height: 16, borderRadius: '50%', display: 'inline-block', backgroundSize: 'cover' }}
                                                />
                                                <span style={{ fontSize: 10, fontWeight: 700, color: C.muted }}>{item.country}</span>
                                                <span style={{ fontSize: 10, color: C.muted }}>·</span>
                                                <span style={{ fontSize: 10, color: C.muted }}>
                                                    Sell {COUNTRIES[item.country as CountryCode]?.symbol ?? '$'}{Number(item.sell_price).toFixed(2)}
                                                </span>
                                                <span style={{ fontSize: 10, color: C.muted }}>·</span>
                                                <span style={{ fontSize: 10, color: C.muted }}>
                                                    Buy {COUNTRIES[item.country as CountryCode]?.symbol ?? '$'}{Number(item.buy_price).toFixed(2)}
                                                </span>
                                            </div>

                                            {/* Metrics */}
                                            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                                                <div>
                                                    <p style={{ fontSize: 9, color: C.muted, fontWeight: 600, margin: 0 }}>PROFIT</p>
                                                    <p style={{ fontSize: 13, fontWeight: 800, color: Number(item.net_profit) >= 0 ? C.green : C.red, margin: 0 }}>
                                                        {Number(item.net_profit) >= 0 ? '+' : '-'}{COUNTRIES[item.country as CountryCode]?.symbol ?? '$'}{Math.abs(Number(item.net_profit)).toFixed(2)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: 9, color: C.muted, fontWeight: 600, margin: 0 }}>MARGIN</p>
                                                    <p style={{ fontSize: 13, fontWeight: 800, color: Number(item.margin) >= 0 ? C.green : C.red, margin: 0 }}>
                                                        {Number(item.margin).toFixed(1)}%
                                                    </p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: 9, color: C.muted, fontWeight: 600, margin: 0 }}>ROI</p>
                                                    <p style={{ fontSize: 13, fontWeight: 800, color: Number(item.roi) >= 0 ? C.green : C.red, margin: 0 }}>
                                                        {Number(item.roi).toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action buttons */}
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button
                                                    onClick={() => loadCalculation(item)}
                                                    style={{ flex: 1, height: 30, border: 'none', borderRadius: 6, background: C.lime, color: C.dark, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
                                                >
                                                    Load
                                                </button>
                                                <button
                                                    onClick={() => deleteCalculation(item)}
                                                    title="Delete"
                                                    style={{ width: 30, height: 30, border: `1px solid ${C.border}`, borderRadius: 6, background: C.surface, color: C.red, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Bottom action bar */}
                            <div style={{ padding: 12, borderTop: `1px solid ${C.border}`, background: C.bg, display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                                {selectedIds.size > 0 ? (
                                    <>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: C.dark }}>
                                            {selectedIds.size} selected
                                        </span>
                                        <button
                                            onClick={clearSelection}
                                            style={{ background: 'transparent', border: 'none', color: C.muted, fontSize: 11, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                            Clear
                                        </button>
                                        <div style={{ flex: 1 }} />
                                        <button
                                            onClick={() => exportCSV(selectedItems)}
                                            style={{ height: 30, padding: '0 12px', border: `1px solid ${C.border}`, borderRadius: 6, background: C.surface, color: C.text, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
                                        >
                                            Export CSV
                                        </button>
                                        <button
                                            onClick={() => setCompareOpen(true)}
                                            disabled={selectedIds.size < 2}
                                            style={{
                                                height: 30, padding: '0 14px', border: 'none', borderRadius: 6,
                                                background: selectedIds.size >= 2 ? C.lime : C.border,
                                                color: selectedIds.size >= 2 ? C.dark : C.muted,
                                                fontWeight: 700, fontSize: 11,
                                                cursor: selectedIds.size >= 2 ? 'pointer' : 'not-allowed',
                                            }}
                                        >
                                            Compare ({selectedIds.size})
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p style={{ fontSize: 10, color: C.muted, margin: 0, flex: 1 }}>
                                            Select 2-3 items to compare, or click Export All CSV
                                        </p>
                                        <button
                                            onClick={() => exportCSV(savedItems)}
                                            disabled={savedItems.length === 0}
                                            style={{
                                                height: 30, padding: '0 12px', border: `1px solid ${C.border}`, borderRadius: 6,
                                                background: savedItems.length > 0 ? C.surface : C.bg,
                                                color: savedItems.length > 0 ? C.text : C.muted,
                                                fontWeight: 700, fontSize: 11,
                                                cursor: savedItems.length > 0 ? 'pointer' : 'not-allowed',
                                            }}
                                        >
                                            Export all CSV
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* ── COMPARE MODAL ──────────────────────────────────────────────? */}
                {compareOpen && selectedItems.length >= 2 && (
                    <>
                        <div
                            onClick={() => setCompareOpen(false)}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000 }}
                        />
                        <div style={{
                            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            width: 'min(900px, 92vw)', maxHeight: '85vh', overflowY: 'auto',
                            background: C.surface, borderRadius: 16, zIndex: 10001,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        }}>
                            {/* Header */}
                            <div style={{ padding: 20, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: C.surface, zIndex: 1 }}>
                                <div>
                                    <p style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: 0 }}>Compare calculations</p>
                                    <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 0' }}>Best value in each row is highlighted</p>
                                </div>
                                <button onClick={() => setCompareOpen(false)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: C.muted, display: 'flex' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Table */}
                            <div style={{ padding: 20 }}>
                                {(() => {
                                    // find winners for each metric
                                    const bestProfit = Math.max(...selectedItems.map(i => Number(i.net_profit)))
                                    const bestMargin = Math.max(...selectedItems.map(i => Number(i.margin)))
                                    const bestRoi = Math.max(...selectedItems.map(i => Number(i.roi)))

                                    const rows = [
                                        {
                                            label: 'Country', render: (i: SavedItem) => (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span className={`fi fi-${COUNTRIES[i.country as CountryCode]?.flag ?? 'us'}`} style={{ width: 16, height: 16, borderRadius: '50%', display: 'inline-block', backgroundSize: 'cover' }} />
                                                    <span style={{ fontWeight: 700 }}>{i.country}</span>
                                                </div>
                                            )
                                        },
                                        { label: 'Sell price', render: (i: SavedItem) => `${COUNTRIES[i.country as CountryCode]?.symbol ?? '$'}${Number(i.sell_price).toFixed(2)}` },
                                        { label: 'Buy price', render: (i: SavedItem) => `${COUNTRIES[i.country as CountryCode]?.symbol ?? '$'}${Number(i.buy_price).toFixed(2)}` },
                                        { label: 'Net profit', render: (i: SavedItem) => `${Number(i.net_profit) >= 0 ? '+' : '-'}${COUNTRIES[i.country as CountryCode]?.symbol ?? '$'}${Math.abs(Number(i.net_profit)).toFixed(2)}`, isWinner: (i: SavedItem) => Number(i.net_profit) === bestProfit },
                                        { label: 'Margin', render: (i: SavedItem) => `${Number(i.margin).toFixed(1)}%`, isWinner: (i: SavedItem) => Number(i.margin) === bestMargin },
                                        { label: 'ROI', render: (i: SavedItem) => `${Number(i.roi).toFixed(1)}%`, isWinner: (i: SavedItem) => Number(i.roi) === bestRoi },
                                    ]

                                    return (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ textAlign: 'left', padding: '10px 12px', borderBottom: `2px solid ${C.border}`, fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', color: C.muted }}></th>
                                                        {selectedItems.map(i => (
                                                            <th key={i.id} style={{ textAlign: 'center', padding: '10px 12px', borderBottom: `2px solid ${C.border}`, fontSize: 12, fontWeight: 800, color: C.dark }}>
                                                                {i.product_name}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {rows.map((row, ri) => (
                                                        <tr key={ri} style={{ borderBottom: `1px solid ${C.border}` }}>
                                                            <td style={{ padding: '10px 12px', fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: '0.3px', textTransform: 'uppercase' }}>{row.label}</td>
                                                            {selectedItems.map(i => {
                                                                const isWinner = row.isWinner ? row.isWinner(i) : false
                                                                return (
                                                                    <td key={i.id} style={{
                                                                        padding: '10px 12px', textAlign: 'center',
                                                                        fontWeight: isWinner ? 800 : 500,
                                                                        color: isWinner ? C.dark : C.text,
                                                                        background: isWinner ? C.limeTint : 'transparent',
                                                                        position: 'relative',
                                                                    }}>
                                                                        {row.render(i)}
                                                                        {isWinner && (
                                                                            <span style={{ position: 'absolute', top: 4, right: 4, background: C.lime, color: C.dark, fontSize: 8, fontWeight: 800, padding: '1px 5px', borderRadius: 999, letterSpacing: '0.3px' }}>
                                                                                BEST
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                )
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                })()}

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => exportCSV(selectedItems)}
                                        style={{ height: 36, padding: '0 16px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.surface, color: C.text, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                                    >
                                        Export CSV
                                    </button>
                                    <button
                                        onClick={() => setCompareOpen(false)}
                                        style={{ height: 36, padding: '0 20px', border: 'none', borderRadius: 8, background: C.dark, color: C.lime, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ── Undo delete toast ── */}
                {undoItem && (
                    <div style={{
                        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                        background: C.dark, color: C.surface, padding: '12px 20px', borderRadius: 10,
                        display: 'flex', alignItems: 'center', gap: 12, zIndex: 10000,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.25)', fontSize: 13,
                    }}>
                        <span>Deleted &quot;{undoItem.product_name}&quot;</span>
                        <button
                            onClick={undoDelete}
                            style={{ background: C.lime, color: C.dark, border: 'none', padding: '6px 14px', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                        >
                            Undo
                        </button>
                    </div>
                )}

                {/* ── Fee verification trust label ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, flexShrink: 0 }} />
                    <p style={{ fontSize: 10, color: C.muted, margin: 0, fontWeight: 600 }}>
                        Fees for {country} last verified February 2026 — {meta.regFeeConfirmed ? 'regulatory fee confirmed' : 'regulatory fee unconfirmed, verify on your seller invoice'}
                    </p>
                </div>

                <style jsx>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
          input[type=range]::-webkit-slider-runnable-track { background: transparent; height: 6px; }
          input[type=range]::-moz-range-track { background: transparent; height: 6px; }
          input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #8fff00; border: 2px solid #fff; box-shadow: 0 0 0 1px #8fff00; margin-top: -5px; cursor: pointer; }
          input[type=range]::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: #8fff00; border: 2px solid #fff; box-shadow: 0 0 0 1px #8fff00; cursor: pointer; }
        `}</style>
            </div>
        </KillSwitchBanner>
    )
}
