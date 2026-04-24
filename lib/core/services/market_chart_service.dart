import 'dart:math' as math;
import 'package:fl_chart/fl_chart.dart';

// Import the AI engines here instead of the UI file
import '../ai_engine/volatility_sensor.dart';
import '../ai_engine/hybrid_regressor.dart';
import '../ai_engine/confidence_scorer.dart';

// ✨ This package holds all the ready-to-draw data for the UI
class ChartPackage {
  final List<FlSpot> currentData;
  final List<FlSpot> forecastData;
  final ForecastSafetyMetrics safety;
  final double percentChange;
  final MarketState marketState;
  final int predictionDays;

  ChartPackage({
    required this.currentData,
    required this.forecastData,
    required this.safety,
    required this.percentChange,
    required this.marketState,
    required this.predictionDays,
  });
}

class MarketChartService {
  static ChartPackage prepareData({
    required List<FlSpot> fullData,
    required String timeFrame,
  }) {
    // 1. FILTER LIVE DATA BASED ON TIME TOGGLE (7D, 30D, 90D)
    int daysToShow = timeFrame == "7D" ? 7 : (timeFrame == "90D" ? 90 : 30);
    int predictionDays = timeFrame == "7D" ? 3 : (timeFrame == "90D" ? 15 : 7);

    // Safely slice the array to only show the requested days
    int startIndex = math.max(0, fullData.length - daysToShow - 1);
    List<FlSpot> slicedData = fullData.sublist(startIndex);
    
    // Re-normalize X axis to start at 0 so the chart draws properly from the left wall
    double firstX = slicedData.first.x;
    List<FlSpot> currentData = slicedData.map((spot) => FlSpot(spot.x - firstX, spot.y)).toList();

    // 2. ACTIVATE THE AI BRAIN ON THE REAL DATA
    final MarketState marketState = VolatilitySensor.detectState(currentData);
    final double cv = _calculateCV(currentData);
    
    // 3. Generate Forecast & Safety Metrics
    final List<FlSpot> forecastData = HybridRegressor.calculateForecast(
      historicalData: currentData,
      state: marketState,
      forecastDays: predictionDays,
    );
    
    final ForecastSafetyMetrics safety = ConfidenceScorer.evaluate(
      forecastSpots: forecastData,
      state: marketState,
      volatilityIndex: cv,
    );

    // 4. Header Stats (Safely calculated on real data)
    double percentChange = 0.0;
    if (currentData.length >= 2 && currentData.first.y != 0) {
      final double first = currentData.first.y;
      final double last = currentData.last.y;
      percentChange = ((last - first) / first) * 100;
    }

    return ChartPackage(
      currentData: currentData,
      forecastData: forecastData,
      safety: safety,
      percentChange: percentChange,
      marketState: marketState,
      predictionDays: predictionDays,
    );
  }

  // Quick helper to calculate Coefficient of Variation (CV)
  static double _calculateCV(List<FlSpot> spots) {
    if (spots.isEmpty) return 0;
    double mean = spots.map((s) => s.y).reduce((a, b) => a + b) / spots.length;
    if (mean == 0) return 0;
    
    double sumSq = spots.map((s) => math.pow(s.y - mean, 2).toDouble()).reduce((a, b) => a + b);
    return math.sqrt(sumSq / spots.length) / mean;
  }
}