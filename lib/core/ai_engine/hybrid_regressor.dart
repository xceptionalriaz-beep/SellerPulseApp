import 'dart:math' as math;
import 'package:fl_chart/fl_chart.dart';
import 'volatility_sensor.dart'; 

class HybridRegressor {
  /// This is the "Brain" that calculates the future line.
  /// It weights data differently based on whether the market is Stable or Volatile.
  static List<FlSpot> calculateForecast({
    required List<FlSpot> historicalData,
    required MarketState state,
    required int forecastDays,
    double demandHeat = 0.5, // ✨ NEW: Directly influences the upward curve from the cloud!
  }) {
    if (historicalData.length < 5) return [];

    // 1. Get the "Anchor" (Long-term slope)
    double longTermSlope = _calculateLinearSlope(historicalData);

    // 2. Get the "Sprint" (Short-term velocity - last 7 data points)
    List<FlSpot> recentData = historicalData.sublist(
      (historicalData.length - 7).clamp(0, historicalData.length),
    );
    double shortTermSlope = _calculateLinearSlope(recentData);

    // 3. ✨ THE ELITE WEIGHTING LOGIC
    double finalSlope;
    if (state == MarketState.momentum) {
      // If market is "Fast-Moving", trust the recent 7-day sprint (80% weight)
      finalSlope = (shortTermSlope * 0.8) + (longTermSlope * 0.2);
    } else {
      // If market is "Stable", trust the long-term anchor (80% weight)
      finalSlope = (longTermSlope * 0.8) + (shortTermSlope * 0.2);
    }

    // ✨ 4. THE REALISM MODIFIER (Powered by Supabase Edge Function)
    // If demand heat is high, the slope naturally curves upward.
    // If demand heat is low, the slope flattens out.
    double heatMultiplier = 0.8 + (demandHeat * 0.4); 
    finalSlope *= heatMultiplier;

    // 5. Generate the Forecast Points (Smooth Daily Spots, not just 3!)
    FlSpot lastPoint = historicalData.last;
    List<FlSpot> forecast = [lastPoint]; // Start from Today

    // 🛡️ ANTI-CRASH PROTOCOL: Absolute Ceiling
    // Prevents the chart from predicting unrealistic "Infinity" numbers
    double maxHistoricalY = historicalData.map((e) => e.y).reduce(math.max);
    double absoluteCeiling = (maxHistoricalY * 2.5).clamp(10.0, double.infinity); 

    for (int i = 1; i <= forecastDays; i++) { 
      double nextX = lastPoint.x + i;
      
      // Damping Factor: The further into the future, the less aggressive the slope
      double damping = math.pow(0.92, i).toDouble(); 
      double nextY = lastPoint.y + (finalSlope * i * damping);
      
      // Safety Clamping: Never below 0, never above the ceiling
      forecast.add(FlSpot(nextX, nextY.clamp(0.0, absoluteCeiling)));
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