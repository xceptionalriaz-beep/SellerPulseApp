// lib/core/ai-engine/volatilitySensor.ts
// Converted 1:1 from lib/core/ai_engine/volatility_sensor.dart

export interface DataPoint { x: number; y: number }

// â”€â”€ MarketState enum (matches Dart enum MarketState) â”€â”€â”€â”€â”€â”€â”€â”€â”€
export enum MarketState {
  stable    = 'stable',
  momentum  = 'momentum',
  uncertain = 'uncertain',
}

export class VolatilitySensor {
  /**
   * The threshold for switching brains.
   * 0.15 (15%) is the industry standard for identifying a "Breakout" trend.
   * matches Dart: static const double volatilityThreshold = 0.15
   */
  static readonly volatilityThreshold = 0.15

  /**
   * Detects whether the market is stable, momentum, or uncertain.
   * matches Dart: detectState(List<FlSpot> spots)
   */
  static detectState(spots: DataPoint[]): MarketState {
    if (spots.length < 5) return MarketState.uncertain

    // 1. Mean (average sales) â€” matches Dart sumY / spots.length
    const sumY = spots.reduce((sum, s) => sum + s.y, 0)
    const mean = sumY / spots.length

    if (mean === 0) return MarketState.uncertain

    // 2. Standard deviation â€” matches Dart math.sqrt(sumSquaredDiff / spots.length)
    const sumSquaredDiff = spots.reduce((sum, s) => sum + Math.pow(s.y - mean, 2), 0)
    const standardDeviation = Math.sqrt(sumSquaredDiff / spots.length)

    // 3. Coefficient of Variation (CV) â€” matches Dart cv = standardDeviation / mean
    const cv = standardDeviation / mean

    // 4. Brain switching logic â€” matches Dart if/else
    if (cv >= VolatilitySensor.volatilityThreshold) {
      return MarketState.momentum  // Fast-moving brain
    } else {
      return MarketState.stable    // Stable baseline brain
    }
  }
}
