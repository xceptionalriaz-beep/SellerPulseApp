// lib/core/ai-engine/hybridRegressor.ts
// Converted 1:1 from lib/core/ai_engine/hybrid_regressor.dart

import { MarketState } from './volatilitySensor'

export interface DataPoint { x: number; y: number }

export class HybridRegressor {
  /**
   * The "Brain" — calculates the future forecast line.
   * Weights data differently based on whether market is Stable or Volatile.
   */
  static calculateForecast({
    historicalData,
    state,
    forecastDays,
    demandHeat = 0.5,
  }: {
    historicalData: DataPoint[]
    state:          MarketState
    forecastDays:   number
    demandHeat?:    number  // influences upward curve from cloud data
  }): DataPoint[] {
    if (historicalData.length < 5) return []

    // 1. Anchor — long-term slope (matches Dart _calculateLinearSlope)
    const longTermSlope = HybridRegressor._calculateLinearSlope(historicalData)

    // 2. Sprint — short-term velocity from last 7 data points
    const recentStart  = Math.max(0, historicalData.length - 7)
    const recentData   = historicalData.slice(recentStart)
    const shortTermSlope = HybridRegressor._calculateLinearSlope(recentData)

    // 3. Elite weighting logic — matches Dart momentum/stable branches
    let finalSlope: number
    if (state === MarketState.momentum) {
      // Fast-moving market — trust recent 7-day sprint (80% weight)
      finalSlope = shortTermSlope * 0.8 + longTermSlope * 0.2
    } else {
      // Stable market — trust long-term anchor (80% weight)
      finalSlope = longTermSlope * 0.8 + shortTermSlope * 0.2
    }

    // 4. Realism modifier — demand heat curves slope up or flattens it
    // matches Dart: heatMultiplier = 0.8 + (demandHeat * 0.4)
    const heatMultiplier = 0.8 + demandHeat * 0.4
    finalSlope *= heatMultiplier

    // 5. Generate forecast points — smooth daily spots
    const lastPoint = historicalData[historicalData.length - 1]
    const forecast: DataPoint[] = [lastPoint] // start from today

    // Anti-crash ceiling — matches Dart maxHistoricalY * 2.5
    const maxHistoricalY   = Math.max(...historicalData.map(p => p.y))
    const absoluteCeiling  = Math.max(10, maxHistoricalY * 2.5)

    for (let i = 1; i <= forecastDays; i++) {
      const nextX = lastPoint.x + i

      // Damping factor — future = less aggressive slope
      // matches Dart: math.pow(0.92, i)
      const damping = Math.pow(0.92, i)
      const nextY   = lastPoint.y + finalSlope * i * damping

      // Safety clamp — never below 0, never above ceiling
      forecast.push({
        x: nextX,
        y: Math.max(0, Math.min(nextY, absoluteCeiling)),
      })
    }

    return forecast
  }

  /**
   * Basic linear regression to find trend direction.
   * matches Dart _calculateLinearSlope
   */
  private static _calculateLinearSlope(points: DataPoint[]): number {
    const n = points.length
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0

    for (const p of points) {
      sumX  += p.x
      sumY  += p.y
      sumXY += p.x * p.y
      sumX2 += p.x * p.x
    }

    const denominator = n * sumX2 - sumX * sumX
    if (denominator === 0) return 0

    return (n * sumXY - sumX * sumY) / denominator
  }
}