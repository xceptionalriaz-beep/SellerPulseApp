import 'package:fl_chart/fl_chart.dart';
import 'volatility_sensor.dart';

class HybridRegressor {
  /// This is the "Brain" that calculates the future line.
  /// It weights data differently based on whether the market is Stable or Volatile.
  static List<FlSpot> calculateForecast({
    required List<FlSpot> historicalData,
    required MarketState state,
    required int forecastDays,
  }) {
    if (historicalData.length < 5) return [];

    // 1. Get the "Anchor" (Long-term slope - usually 90 days of trend)
    double longTermSlope = _calculateLinearSlope(historicalData);

    // 2. Get the "Sprint" (Short-term velocity - last 7 data points)
    List<FlSpot> recentData = historicalData.sublist(
      historicalData.length - 7.clamp(0, historicalData.length),
    );
    double shortTermSlope = _calculateLinearSlope(recentData);

    // 3. ✨ THE ELITE WEIGHTING LOGIC
    double finalSlope;
    if (state == MarketState.momentum) {
      // If market is "Fast-Moving", we trust the recent 7-day sprint (80% weight)
      finalSlope = (shortTermSlope * 0.8) + (longTermSlope * 0.2);
    } else {
      // If market is "Stable", we trust the long-term anchor (80% weight)
      finalSlope = (longTermSlope * 0.8) + (shortTermSlope * 0.2);
    }

    // 4. Generate the Forecast Points
    FlSpot lastPoint = historicalData.last;
    List<FlSpot> forecast = [lastPoint]; // Start from Today

    for (int i = 1; i <= 3; i++) { // We predict 3 main "milestone" spots
      double nextX = lastPoint.x + (forecastDays / 3 * i);
      // We add a "Damping Factor" (0.9) to ensure the line doesn't look "fake" or too aggressive
      double nextY = lastPoint.y + (finalSlope * (forecastDays / 3 * i) * 0.9);
      
      // Ensure the AI never predicts less than 0 sales, but allows infinite upside
      forecast.add(FlSpot(nextX, nextY.clamp(0, double.infinity)));
    }

    return forecast;
  }

  /// Basic Linear Regression to find the trend direction
  static double _calculateLinearSlope(List<FlSpot> points) {
    int n = points.length;
    double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (var p in points) {
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumX2 += p.x * p.x;
    }

    double denominator = (n * sumX2 - sumX * sumX);
    if (denominator == 0) return 0;
    
    return (n * sumXY - sumX * sumY) / denominator;
  }
}