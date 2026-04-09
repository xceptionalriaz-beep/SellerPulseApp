import 'package:fl_chart/fl_chart.dart';
import 'volatility_sensor.dart';

/// A simple class to hold our safety data together
class ForecastSafetyMetrics {
  final int confidenceScore; // e.g., 85
  final String confidenceLabel; // e.g., "High Confidence"
  final List<FlSpot> upperBound; // The top edge of the "Shadow"
  final List<FlSpot> lowerBound; // The bottom edge of the "Shadow"

  ForecastSafetyMetrics({
    required this.confidenceScore,
    required this.confidenceLabel,
    required this.upperBound,
    required this.lowerBound,
  });
}

class ConfidenceScorer {
  /// Calculates the safety metrics to protect the user from bad predictions.
  static ForecastSafetyMetrics evaluate({
    required List<FlSpot> forecastSpots,
    required MarketState state,
    required double volatilityIndex, // The CV calculated by the VolatilitySensor
  }) {
    int score;
    String label;

    // 1. Determine the Confidence Score based on Market State & Volatility
    if (state == MarketState.stable) {
      // Stable markets are easy to predict
      score = 100 - (volatilityIndex * 100).toInt().clamp(0, 15);
      label = "High Confidence (Stable Market)";
    } else if (state == MarketState.momentum) {
      // Momentum markets are fast but risky
      score = 85 - (volatilityIndex * 100).toInt().clamp(0, 35);
      label = "Medium Confidence (Volatile Trend)";
    } else {
      // Uncertain markets
      score = 40;
      label = "Low Confidence (Unpredictable)";
    }

    // Ensure score is within a logical bound
    score = score.clamp(10, 99);

    // 2. Generate the "Confidence Shadow" (Interval)
    List<FlSpot> upperBounds = [];
    List<FlSpot> lowerBounds = [];

    // The base spread (how wide the shadow starts) based on volatility
    double baseSpread = volatilityIndex * 10; 

    for (int i = 0; i < forecastSpots.length; i++) {
      FlSpot current = forecastSpots[i];
      
      // The shadow gets WIDER the further into the future we go (i * 1.5)
      double spread = baseSpread + (i * 2.0); 

      // If confidence is low, the shadow is huge. If high, the shadow is tight.
      double shadowMultiplier = (100 - score) / 50; 

      double finalSpread = spread * shadowMultiplier;

      // Add to bounds, ensuring the lower bound never predicts negative sales
      upperBounds.add(FlSpot(current.x, current.y + finalSpread));
      lowerBounds.add(FlSpot(current.x, (current.y - finalSpread).clamp(0, double.infinity)));
    }

    return ForecastSafetyMetrics(
      confidenceScore: score,
      confidenceLabel: label,
      upperBound: upperBounds,
      lowerBound: lowerBounds,
    );
  }
}