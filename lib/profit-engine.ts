// lib/profit-engine.ts
// Converted 1:1 from lib/core/utils/profit_engine.dart

/// Holds all the user-defined settings for the profit calculation.
/// This will eventually be saved to localStorage so it persists.
export interface ProfitSettings {
  // --- Core Settings ---
  categoryFeePercent: number  // Default: 13.25%
  fixedFee:           number  // Default: $0.30
  adRatePercent:      number  // Promoted Listings (Default: 2.0%)
  sourcingTaxPercent: number  // Tax paid on Amazon/Supplier (Default: 7.0%)
  defaultShipping:    number  // Default: $5.00
  intlFeePercent:     number  // eBay Cross-Border Fee (Default: 1.65%)
  fxFeePercent:       number  // Bank Currency Conversion (Default: 2.0%)

  // --- Advanced Settings ---
  isAdvancedEnabled: boolean  // Is the Pro toggle on?
  defectRatePercent: number   // Return/Loss Buffer (Default: 2.0%)
  payoutFeePercent:  number   // Payoneer/Bank Withdrawal Fee (Default: 1.5%)
  cashbackPercent:   number   // Credit Card/Portal Rewards (Default: 2.0%)
}

export const DEFAULT_SETTINGS: ProfitSettings = {
  categoryFeePercent: 13.25,
  fixedFee:           0.30,
  adRatePercent:      2.0,
  sourcingTaxPercent: 7.0,
  defaultShipping:    5.0,
  intlFeePercent:     1.65,
  fxFeePercent:       2.0,
  isAdvancedEnabled:  false,
  defectRatePercent:  2.0,
  payoutFeePercent:   1.5,
  cashbackPercent:    2.0,
}

/// The receipt of the calculation to show in the UI
export interface ProfitResult {
  netProfit:           number
  profitMargin:        number  // Renamed to clearly indicate Profit Margin
  roi:                 number

  // The Receipt Breakdown
  trueBuyCost:         number
  totalEbayFees:       number
  advancedDeductions:  number
  totalCashback:       number
}

export class ProfitEngine {
  /// The Global Truth Equation
  static calculate({
    sellingPrice,
    buyPrice,
    shippingCost,
    settings = DEFAULT_SETTINGS,
  }: {
    sellingPrice:  number
    buyPrice:      number
    shippingCost?: number   // Per-item override, or falls back to default
    settings?:     ProfitSettings
  }): ProfitResult {

    // 0. Fallback Guards
    if (sellingPrice <= 0 || buyPrice <= 0) {
      return {
        netProfit:          0,
        roi:                0,
        profitMargin:       0,
        trueBuyCost:        0,
        totalEbayFees:      0,
        advancedDeductions: 0,
        totalCashback:      0,
      }
    }

    const actualShipping = shippingCost ?? settings.defaultShipping

    // =================================================================
    // 1. CALCULATE TRUE SOURCING COST
    // =================================================================
    const taxCost     = buyPrice * (settings.sourcingTaxPercent / 100)
    const baseBuyCost = buyPrice + taxCost

    // Add Bank Foreign Exchange Fee
    const fxCost     = baseBuyCost * (settings.fxFeePercent / 100)
    const trueBuyCost = baseBuyCost + fxCost

    // =================================================================
    // 2. CALCULATE EBAY FEES
    // =================================================================
    const totalEbayPercent = settings.categoryFeePercent + settings.adRatePercent + settings.intlFeePercent
    const ebayFees         = (sellingPrice * (totalEbayPercent / 100)) + settings.fixedFee

    // =================================================================
    // 3. CALCULATE ADVANCED FACTORS (If Enabled)
    // =================================================================
    let defectCost    = 0.0
    let payoutCost    = 0.0
    let cashbackValue = 0.0

    if (settings.isAdvancedEnabled) {
      // Defect rate applies to the total sale price (loss of revenue)
      defectCost = sellingPrice * (settings.defectRatePercent / 100)

      // Payout fee applies to what eBay actually transfers to you
      const netFromEbay = sellingPrice - ebayFees
      if (netFromEbay > 0) {
        payoutCost = netFromEbay * (settings.payoutFeePercent / 100)
      }

      // Cashback is earned on the True Buy Cost
      cashbackValue = trueBuyCost * (settings.cashbackPercent / 100)
    }

    const advancedDeductions = defectCost + payoutCost

    // =================================================================
    // 4. THE FINAL TRUTH EQUATION
    // =================================================================
    const netProfit = sellingPrice - trueBuyCost - ebayFees - actualShipping - advancedDeductions + cashbackValue

    // Calculate ROI and Margin safely to avoid division by zero
    const roi    = trueBuyCost  > 0 ? (netProfit / trueBuyCost)  * 100 : 0.0
    const margin = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0.0

    return {
      netProfit,
      roi,
      profitMargin:       margin,
      trueBuyCost,
      totalEbayFees:      ebayFees,
      advancedDeductions,
      totalCashback:      cashbackValue,
    }
  }
}
