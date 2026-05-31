// lib/core/ai-engine/confidenceScorer.ts
// Converted 1:1 from lib/core/ai_engine/confidence_scorer.dart

import { MarketState } from './volatilitySensor'

// ── ForecastSafetyMetrics (matches Dart class) ───────────────
export interface DataPoint { x: number; y: number }

export interface ForecastSafetyMetrics {
  confidenceScore: number     // e.g. 85
  confidenceLabel: string     // e.g. "High Confidence"
  upperBound:      DataPoint[] // top edge of the shadow
  lowerBound:      DataPoint[] // bottom edge of the shadow
}

// ── ConfidenceScorer (matches Dart ConfidenceScorer) ─────────
export class ConfidenceScorer {
  static evaluate({
    forecastSpots,
    state,
    volatilityIndex,
  }: {
    forecastSpots:   DataPoint[]
    state:           MarketState
    volatilityIndex: number       // CV calculated by VolatilitySensor
  }): ForecastSafetyMetrics {

    let score: number
    let label: string

    // 1. Confidence score based on MarketState & volatility
    if (state === MarketState.stable) {
      // Stable markets are easy to predict
      score = 100 - Math.min(Math.floor(volatilityIndex * 100), 15)
      label = 'High Confidence (Stable Market)'
    } else if (state === MarketState.momentum) {
      // Momentum markets are fast but risky
      score = 85 - Math.min(Math.floor(volatilityIndex * 100), 35)
      label = 'Medium Confidence (Volatile Trend)'
    } else {
      // Uncertain markets
      score = 40
      label = 'Low Confidence (Unpredictable)'
    }

    // Clamp score — matches Dart score.clamp(10, 99)
    score = Math.max(10, Math.min(99, score))

    // 2. Generate confidence shadow (interval)
    const upperBound: DataPoint[] = []
    const lowerBound: DataPoint[] = []

    // Base spread based on volatility — matches Dart baseSpread
    const baseSpread = volatilityIndex * 10

    forecastSpots.forEach((current, i) => {
      // Shadow widens further into the future — matches Dart i * 2.0
      const spread = baseSpread + i * 2.0

      // Low confidence = wide shadow, high confidence = tight shadow
      const shadowMultiplier = (100 - score) / 50

      const finalSpread = spread * shadowMultiplier

      upperBound.push({ x: current.x, y: current.y + finalSpread })
      lowerBound.push({ x: current.x, y: Math.max(0, current.y - finalSpread) })
    })

    return { confidenceScore: score, confidenceLabel: label, upperBound, lowerBound }
  }
}