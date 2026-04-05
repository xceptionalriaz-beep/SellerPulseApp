class CalculatorResult {
  final double totalRevenue, totalCosts, taxAmount, ebayFee, paymentFee, adFee, totalFees, netProfit, profitMargin, roi, breakEvenPrice;
  // Expose these for the interactive forecaster
  final double activeFeeDecimal, taxMultiplier, ebayFixedFee, paymentFeeDecimal, paymentFixedFee;

  CalculatorResult({
    required this.totalRevenue, required this.totalCosts, required this.taxAmount, required this.ebayFee, required this.paymentFee, 
    required this.adFee, required this.totalFees, required this.netProfit, required this.profitMargin, required this.roi, required this.breakEvenPrice,
    required this.activeFeeDecimal, required this.taxMultiplier, required this.ebayFixedFee, required this.paymentFeeDecimal, required this.paymentFixedFee,
  });
}

class MathEngine {
  static CalculatorResult calculate({
    required double itemCost, required double shippingCost, required double salePrice, required double buyerShipping, 
    required double taxRate, required double adRate, required String category, required String storeTier, 
    required String sellerLevel, required String country, required String paymentProcessor, 
    required bool isInternational, // ✨ NEW: Accepts the International toggle state
    required Map<String, double> categoryFees,
  }) {
    // 1. Core Totals
    double totalRevenue = salePrice + buyerShipping;
    double totalCosts = itemCost + shippingCost;
    double taxAmount = totalRevenue * (taxRate / 100);
    double totalSaleBasis = totalRevenue + taxAmount; // Fees are charged on Price + Shipping + Tax

    // 2. eBay Percentage Calculation
    double baseFeePercent = categoryFees[category] ?? 13.25;
    if (storeTier != "No Store" && storeTier.contains("Store")) baseFeePercent -= 1.25;
    if (sellerLevel.contains("Penalty")) baseFeePercent += 6.0;

    double activeFeeDecimal = baseFeePercent / 100;
    if (sellerLevel.contains("Top Rated")) activeFeeDecimal *= 0.90; // 10% discount on the FVF amount
    
    // ✨ NEW: Adds the 1.65% International Cross-Border Fee if the toggle is ON!
    if (isInternational) activeFeeDecimal += 0.0165; 

    // 3. Payment Processor Routing
    double ebayFixedFee = (country == "DE" || country == "FR" || country == "IT" || country == "ES") ? 0.35 : 0.30;
    double paymentFeeDecimal = 0.0;
    double paymentFixedFee = 0.0;

    if (paymentProcessor == "PayPal") {
      paymentFeeDecimal = 0.029; // PayPal charges 2.9%
      paymentFixedFee = 0.30;    // PayPal charges $0.30 fixed
      ebayFixedFee = 0.0;        // eBay drops their fixed fee if PayPal handles it
    }

    // 4. Calculate Fee Amounts
    double ebayFeeAmount = totalRevenue > 0 ? (totalSaleBasis * activeFeeDecimal) + ebayFixedFee : 0.0;
    double paymentFeeAmount = totalRevenue > 0 ? (totalSaleBasis * paymentFeeDecimal) + paymentFixedFee : 0.0;
    double adFeeAmount = totalRevenue > 0 ? totalRevenue * (adRate / 100) : 0.0;
    
    double totalFees = ebayFeeAmount + paymentFeeAmount + adFeeAmount;

    // 5. Profit Metrics
    double netProfit = totalRevenue - totalCosts - totalFees;
    double profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0.0;
    double roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0.0;

    // 6. 100% Accurate Break Even Formula (Includes PayPal & International impact)
    double taxMultiplier = 1 + (taxRate / 100);
    double combinedFeeDecimal = (taxMultiplier * activeFeeDecimal) + (taxMultiplier * paymentFeeDecimal) + (adRate / 100);
    double divisor = 1 - combinedFeeDecimal;
    double breakEvenPrice = divisor > 0 ? (totalCosts + ebayFixedFee + paymentFixedFee) / divisor : 0.0;

    return CalculatorResult(
      totalRevenue: totalRevenue, totalCosts: totalCosts, taxAmount: taxAmount, 
      ebayFee: ebayFeeAmount, paymentFee: paymentFeeAmount, adFee: adFeeAmount, totalFees: totalFees, 
      netProfit: netProfit, profitMargin: profitMargin, roi: roi, breakEvenPrice: breakEvenPrice,
      activeFeeDecimal: activeFeeDecimal, taxMultiplier: taxMultiplier, ebayFixedFee: ebayFixedFee, 
      paymentFeeDecimal: paymentFeeDecimal, paymentFixedFee: paymentFixedFee,
    );
  }
}