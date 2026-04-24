import 'dart:math' as math;
import 'package:fl_chart/fl_chart.dart';

enum MarketState { stable, momentum, uncertain }

class VolatilitySensor {
  /// The threshold for switching brains. 
  /// 0.15 (15%) is the industry standard for identifying a "Breakout" trend.
  static const double volatilityThreshold = 0.15;

  static MarketState detectState(List<FlSpot> spots) {
    if (spots.length < 5) return MarketState.uncertain;

    // 1. Calculate the Mean (Average Sales)
    double sumY = spots.map((s) => s.y).reduce((a, b) => a + b);
    double mean = sumY / spots.length;

    if (mean == 0) return MarketState.uncertain;

// 2. Calculate Standard Deviation (How much it bounces)
    // ✨ FIX: Added .toDouble() after math.pow
    double sumSquaredDiff = spots.map((s) => math.pow(s.y - mean, 2).toDouble()).reduce((a, b) => a + b);
    double standardDeviation = math.sqrt(sumSquaredDiff / spots.length);

    // 3. Calculate Coefficient of Variation (CV)
    double cv = standardDeviation / mean;
    
    // 4. Brain Switching Logic
    if (cv >= volatilityThreshold) {
      return MarketState.momentum; // Trigger the "Fast-Moving" brain
    } else {
      return MarketState.stable; // Trigger the "Stable-Baseline" brain
    }
  }
}