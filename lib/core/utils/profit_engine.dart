// lib/core/utils/profit_engine.dart

/// Holds all the user-defined settings for the profit calculation.
/// This will eventually be saved to SharedPreferences so it persists.
class ProfitSettings {
  // --- Core Settings ---
  final double categoryFeePercent; // Default: 13.25%
  final double fixedFee;           // Default: $0.30
  final double adRatePercent;      // Promoted Listings (Default: 2.0%)
  final double sourcingTaxPercent; // Tax paid on Amazon/Supplier (Default: 7.0%)
  final double defaultShipping;    // Default: $5.00
  final double intlFeePercent;     // eBay Cross-Border Fee (Default: 1.65%)
  final double fxFeePercent;       // Bank Currency Conversion (Default: 2.0%)

  // --- Advanced Settings ---
  final bool isAdvancedEnabled;    // Is the Pro toggle on?
  final double defectRatePercent;  // Return/Loss Buffer (Default: 2.0%)
  final double payoutFeePercent;   // Payoneer/Bank Withdrawal Fee (Default: 1.5%)
  final double cashbackPercent;    // Credit Card/Portal Rewards (Default: 2.0%)

  const ProfitSettings({
    this.categoryFeePercent = 13.25,
    this.fixedFee = 0.30,
    this.adRatePercent = 2.0,
    this.sourcingTaxPercent = 7.0,
    this.defaultShipping = 5.0,
    this.intlFeePercent = 1.65,
    this.fxFeePercent = 2.0,
    this.isAdvancedEnabled = false,
    this.defectRatePercent = 2.0,
    this.payoutFeePercent = 1.5,
    this.cashbackPercent = 2.0,
  });
}

/// The receipt of the calculation to show in the Deep Dive UI
class ProfitResult {
  final double netProfit;
  final double profitMargin; // Renamed to clearly indicate Profit Margin
  final double roi;
  
  // The Receipt Breakdown
  final double trueBuyCost;
  final double totalEbayFees;
  final double advancedDeductions;
  final double totalCashback;

  ProfitResult({
    required this.netProfit,
    required this.profitMargin,
    required this.roi,
    required this.trueBuyCost,
    required this.totalEbayFees,
    required this.advancedDeductions,
    required this.totalCashback,
  });
}

class ProfitEngine {
  /// The Global Truth Equation
  static ProfitResult calculate({
    required double sellingPrice,
    required double buyPrice,
    double? shippingCost, // Per-item override, or falls back to default
    ProfitSettings settings = const ProfitSettings(), // Uses defaults if not provided
  }) {
    // 0. Fallback Guards
    if (sellingPrice <= 0 || buyPrice <= 0) {
      return ProfitResult(
        netProfit: 0, 
        roi: 0, 
        profitMargin: 0, 
        trueBuyCost: 0, 
        totalEbayFees: 0, 
        advancedDeductions: 0, 
        totalCashback: 0
      );
    }

    double actualShipping = shippingCost ?? settings.defaultShipping;

    // =================================================================
    // 1. CALCULATE TRUE SOURCING COST
    // =================================================================
    double taxCost = buyPrice * (settings.sourcingTaxPercent / 100);
    double baseBuyCost = buyPrice + taxCost;
    
    // Add Bank Foreign Exchange Fee
    double fxCost = baseBuyCost * (settings.fxFeePercent / 100);
    double trueBuyCost = baseBuyCost + fxCost;

    // =================================================================
    // 2. CALCULATE EBAY FEES
    // =================================================================
    double totalEbayPercent = settings.categoryFeePercent + settings.adRatePercent + settings.intlFeePercent;
    double ebayFees = (sellingPrice * (totalEbayPercent / 100)) + settings.fixedFee;

    // =================================================================
    // 3. CALCULATE ADVANCED FACTORS (If Enabled)
    // =================================================================
    double defectCost = 0.0;
    double payoutCost = 0.0;
    double cashbackValue = 0.0;

    if (settings.isAdvancedEnabled) {
      // Defect rate applies to the total sale price (loss of revenue)
      defectCost = sellingPrice * (settings.defectRatePercent / 100);
      
      // Payout fee applies to what eBay actually transfers to you
      double netFromEbay = sellingPrice - ebayFees;
      if (netFromEbay > 0) {
        payoutCost = netFromEbay * (settings.payoutFeePercent / 100);
      }

      // Cashback is earned on the True Buy Cost
      cashbackValue = trueBuyCost * (settings.cashbackPercent / 100);
    }

    double advancedDeductions = defectCost + payoutCost;

    // =================================================================
    // 4. THE FINAL TRUTH EQUATION
    // =================================================================
    double netProfit = sellingPrice - trueBuyCost - ebayFees - actualShipping - advancedDeductions + cashbackValue;

    // Calculate ROI and Margin safely to avoid division by zero
    double roi = trueBuyCost > 0 ? (netProfit / trueBuyCost) * 100 : 0.0;
    double margin = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0.0;

    return ProfitResult(
      netProfit: netProfit,
      roi: roi,
      profitMargin: margin,
      trueBuyCost: trueBuyCost,
      totalEbayFees: ebayFees,
      advancedDeductions: advancedDeductions,
      totalCashback: cashbackValue,
    );
  }
}