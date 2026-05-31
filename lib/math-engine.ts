// lib/math-engine.ts
// Converted 1:1 from lib/widgets/math_engine.dart

export interface CalculatorResult {
  totalRevenue:       number
  totalCosts:         number
  taxAmount:          number
  ebayFee:            number
  paymentFee:         number
  adFee:              number
  totalFees:          number
  netProfit:          number
  profitMargin:       number
  roi:                number
  breakEvenPrice:     number
  // Expose these for the interactive forecaster
  activeFeeDecimal:   number
  taxMultiplier:      number
  ebayFixedFee:       number
  paymentFeeDecimal:  number
  paymentFixedFee:    number
}

export class MathEngine {
  static calculate({
    itemCost,
    shippingCost,
    salePrice,
    buyerShipping,
    taxRate,
    adRate,
    category,
    storeTier,
    sellerLevel,
    country,
    paymentProcessor,
    isInternational,
    categoryFees,
  }: {
    itemCost:          number
    shippingCost:      number
    salePrice:         number
    buyerShipping:     number
    taxRate:           number
    adRate:            number
    category:          string
    storeTier:         string
    sellerLevel:       string
    country:           string
    paymentProcessor:  string
    isInternational:   boolean  // ✨ NEW: Accepts the International toggle state
    categoryFees:      Record<string, number>
  }): CalculatorResult {

    // 1. Core Totals
    const totalRevenue   = salePrice + buyerShipping
    const totalCosts     = itemCost + shippingCost
    const taxAmount      = totalRevenue * (taxRate / 100)
    const totalSaleBasis = totalRevenue + taxAmount  // Fees are charged on Price + Shipping + Tax

    // 2. eBay Percentage Calculation
    let baseFeePercent = categoryFees[category] ?? 13.25
    if (storeTier !== 'No Store' && storeTier.includes('Store')) baseFeePercent -= 1.25
    if (sellerLevel.includes('Penalty')) baseFeePercent += 6.0

    let activeFeeDecimal = baseFeePercent / 100
    if (sellerLevel.includes('Top Rated')) activeFeeDecimal *= 0.90  // 10% discount on the FVF amount

    // ✨ NEW: Adds the 1.65% International Cross-Border Fee if the toggle is ON!
    if (isInternational) activeFeeDecimal += 0.0165

    // 3. Payment Processor Routing
    let ebayFixedFee      = (country === 'DE' || country === 'FR' || country === 'IT' || country === 'ES') ? 0.35 : 0.30
    let paymentFeeDecimal = 0.0
    let paymentFixedFee   = 0.0

    if (paymentProcessor === 'PayPal') {
      paymentFeeDecimal = 0.029  // PayPal charges 2.9%
      paymentFixedFee   = 0.30   // PayPal charges $0.30 fixed
      ebayFixedFee      = 0.0    // eBay drops their fixed fee if PayPal handles it
    }

    // 4. Calculate Fee Amounts
    const ebayFeeAmount    = totalRevenue > 0 ? (totalSaleBasis * activeFeeDecimal) + ebayFixedFee   : 0.0
    const paymentFeeAmount = totalRevenue > 0 ? (totalSaleBasis * paymentFeeDecimal) + paymentFixedFee : 0.0
    const adFeeAmount      = totalRevenue > 0 ? totalRevenue * (adRate / 100)                         : 0.0

    const totalFees = ebayFeeAmount + paymentFeeAmount + adFeeAmount

    // 5. Profit Metrics
    const netProfit    = totalRevenue - totalCosts - totalFees
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0.0
    const roi          = totalCosts   > 0 ? (netProfit / totalCosts)   * 100 : 0.0

    // 6. 100% Accurate Break Even Formula (Includes PayPal & International impact)
    const taxMultiplier       = 1 + (taxRate / 100)
    const combinedFeeDecimal  = (taxMultiplier * activeFeeDecimal) + (taxMultiplier * paymentFeeDecimal) + (adRate / 100)
    const divisor             = 1 - combinedFeeDecimal
    const breakEvenPrice      = divisor > 0 ? (totalCosts + ebayFixedFee + paymentFixedFee) / divisor : 0.0

    return {
      totalRevenue,
      totalCosts,
      taxAmount,
      ebayFee:           ebayFeeAmount,
      paymentFee:        paymentFeeAmount,
      adFee:             adFeeAmount,
      totalFees,
      netProfit,
      profitMargin,
      roi,
      breakEvenPrice,
      activeFeeDecimal,
      taxMultiplier,
      ebayFixedFee,
      paymentFeeDecimal,
      paymentFixedFee,
    }
  }
}