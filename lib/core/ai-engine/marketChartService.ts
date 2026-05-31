// lib/core/ai-engine/marketChartService.ts
// Converted 1:1 from lib/core/services/market_chart_service.dart

import { VolatilitySensor, MarketState, DataPoint } from './volatilitySensor'
import { HybridRegressor }   from './hybridRegressor'
import { ConfidenceScorer, ForecastSafetyMetrics } from './confidenceScorer'

// ── ChartPackage (matches Dart ChartPackage class) ────────────
export interface ChartPackage {
  currentData:    DataPoint[]           // filtered + normalized
  forecastData:   DataPoint[]           // AI predicted future
  safety:         ForecastSafetyMetrics // confidence shadow band
  percentChange:  number                // % change first → last
  marketState:    MarketState           // stable | momentum | uncertain
  predictionDays: number                // 3 | 7 | 15
}

// ── MarketChartService (matches Dart MarketChartService) ──────
export class MarketChartService {

  static prepareData({
    fullData,
    timeFrame,
  }: {
    fullData:  DataPoint[]
    timeFrame: string        // '7D' | '30D' | '90D' | '1Y'
  }): ChartPackage {

    // 1. Filter data based on time toggle
    // matches Dart: daysToShow + predictionDays logic
    const daysToShow      = timeFrame === '7D' ? 7  : timeFrame === '90D' ? 90 : 30
    const predictionDays  = timeFrame === '7D' ? 3  : timeFrame === '90D' ? 15 : 7

    // Safely slice — matches Dart: math.max(0, fullData.length - daysToShow - 1)
    const startIndex  = Math.max(0, fullData.length - daysToShow - 1)
    const slicedData  = fullData.slice(startIndex)

    // Re-normalize X axis to start at 0
    // matches Dart: spot.x - firstX
    const firstX      = slicedData.length > 0 ? slicedData[0].x : 0
    const currentData = slicedData.map(spot => ({
      x: spot.x - firstX,
      y: spot.y,
    }))

    // 2. Activate AI Brain on real data
    // matches Dart: VolatilitySensor.detectState + _calculateCV
    const marketState = VolatilitySensor.detectState(currentData)
    const cv          = MarketChartService._calculateCV(currentData)

    // 3. Generate forecast + safety metrics
    // matches Dart: HybridRegressor.calculateForecast + ConfidenceScorer.evaluate
    const forecastData = HybridRegressor.calculateForecast({
      historicalData: currentData,
      state:          marketState,
      forecastDays:   predictionDays,
    })

    const safety = ConfidenceScorer.evaluate({
      forecastSpots:   forecastData,
      state:           marketState,
      volatilityIndex: cv,
    })

    // 4. Header stats — % change
    // matches Dart: (last - first) / first * 100
    let percentChange = 0
    if (currentData.length >= 2 && currentData[0].y !== 0) {
      const first = currentData[0].y
      const last  = currentData[currentData.length - 1].y
      percentChange = ((last - first) / first) * 100
    }

    return {
      currentData,
      forecastData,
      safety,
      percentChange,
      marketState,
      predictionDays,
    }
  }

  // ── _calculateCV (matches Dart _calculateCV) ─────────────────
  private static _calculateCV(spots: DataPoint[]): number {
    if (spots.length === 0) return 0
    const mean = spots.reduce((a, b) => a + b.y, 0) / spots.length
    if (mean === 0) return 0
    const sumSq = spots.reduce((a, b) => a + Math.pow(b.y - mean, 2), 0)
    return Math.sqrt(sumSq / spots.length) / mean
  }
}