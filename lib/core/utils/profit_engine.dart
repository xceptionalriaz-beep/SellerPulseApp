// lib/core/utils/profit_engine.dart

class ProfitResult {
  final double netProfit;
  final double margin;
  final double roi;

  ProfitResult({
    required this.netProfit,
    required this.margin,
    required this.roi,
  });
}

class ProfitEngine {
  /// Calculates the profit, margin, and ROI for an arbitrage product.
  /// 
  /// [sellingPrice] - The price the item sells for on eBay.
  /// [buyPrice] - The cost to buy the item from Amazon (or supplier).
  /// [shippingCost] - Estimated shipping cost to the buyer.
  /// [referralFeePercent] - eBay's category fee (Standard is usually 13.25%).
  /// [perOrderFee] - eBay's fixed transaction fee (Standard is $0.30).
  static ProfitResult calculate({
    required double sellingPrice,
    required double buyPrice,
    double shippingCost = 0.0,
    double referralFeePercent = 13.25, 
    double perOrderFee = 0.30,         
  }) {
    // If there is no selling price, return zeroed out stats
    if (sellingPrice <= 0) {
      return ProfitResult(netProfit: 0.0, margin: 0.0, roi: 0.0);
    }

    // 1. Calculate eBay Fees
    double ebayFee = (sellingPrice * (referralFeePercent / 100)) + perOrderFee;
    
    // 2. Calculate Total Expenses
    double totalExpenses = buyPrice + shippingCost + ebayFee;
    
    // 3. Final Net Profit
    double profit = sellingPrice - totalExpenses;
    
    // 4. Margin & ROI Math
    double margin = (profit / sellingPrice) * 100;
    
    // Protect against dividing by zero if the buy price hasn't been entered yet
    double roi = buyPrice > 0 ? (profit / buyPrice) * 100 : 0.0;

    return ProfitResult(
      netProfit: profit,
      margin: margin,
      roi: roi,
    );
  }
}