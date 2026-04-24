import 'dart:math' as math;
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart'; 

// ✨ IMPORT THE NEW CHART SERVICE (No need to import AI engines here anymore!)
import '../core/services/market_chart_service.dart';
import '../core/ai_engine/volatility_sensor.dart'; // Only needed for the enum type MarketState
import '../core/ai_engine/confidence_scorer.dart'; // ✨ ADD THIS LINE

class MarketTrendChart extends StatefulWidget {
  final String searchQuery;
  final List<FlSpot>? liveData; 
  
  const MarketTrendChart({
    super.key, 
    required this.searchQuery,
    this.liveData, 
  });

  @override
  State<MarketTrendChart> createState() => _MarketTrendChartState();
}

class _MarketTrendChartState extends State<MarketTrendChart> with SingleTickerProviderStateMixin {
  String _selectedTime = "30D";
  
  final Color neonGreen = const Color(0xFF8FFF00);
  final Color deepNavy = const Color(0xFF131B2F);

  late AnimationController _animController;
  late Animation<double> _sweepAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200));
    _sweepAnimation = CurvedAnimation(parent: _animController, curve: Curves.easeInOutQuart);
    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  // ✨ THE NEW BUILD METHOD WITH FADE-IN LOGIC
  @override
  Widget build(BuildContext context) {
    String displayQuery = widget.searchQuery.isEmpty ? "Overall Market" : widget.searchQuery;
    
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 600), // Professional slow fade
      switchInCurve: Curves.easeInQuad,
      switchOutCurve: Curves.easeOutQuad,
      child: (widget.liveData == null || widget.liveData!.isEmpty)
          ? _buildLoadingState(displayQuery)
          : _buildChartState(displayQuery),
    );
  }

  // --- WIDGET: THE LOADING STATE ---
  Widget _buildLoadingState(String query) {
    return Container(
      key: const ValueKey('loading_state'), // 🔑 Unique Key for animation
      height: 280, // Match the height of the chart state
      padding: const EdgeInsets.fromLTRB(20, 20, 55, 10),
      decoration: BoxDecoration(
        color: Colors.white, 
        borderRadius: BorderRadius.circular(16), 
        border: Border.all(color: Colors.grey.shade100),
        boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 15, offset: Offset(0, 5))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
           Text(
              "📈 SALES TREND & FORECAST (\"$query\")", 
              style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B), fontSize: 12, letterSpacing: 1.1)
           ),
           const Spacer(),
           Center(
             child: Column(
               mainAxisAlignment: MainAxisAlignment.center,
               children: [
                 const SizedBox(
                   height: 30, width: 30,
                   child: CircularProgressIndicator(color: Color(0xFF8FFF00), strokeWidth: 3),
                 ),
                 const SizedBox(height: 15),
                 Text("Analyzing Market Data for \"$query\"...", style: const TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.bold, fontSize: 11)),
               ],
             ),
           ),
           const Spacer(),
        ]
      )
    );
  }

  // --- WIDGET: THE CLEANED CHART STATE ---
  Widget _buildChartState(String displayQuery) {
    // ✨ ONE LINE: Ask the Brain for all the math and data
    final ChartPackage package = MarketChartService.prepareData(
      fullData: widget.liveData!,
      timeFrame: _selectedTime,
    );

    return Container(
      key: const ValueKey('chart_state'), // 🔑 Unique Key for animation
      height: 280, // Explicit height to prevent jumpiness
      padding: const EdgeInsets.fromLTRB(20, 20, 55, 10),
      decoration: BoxDecoration(
        color: Colors.white, 
        borderRadius: BorderRadius.circular(16), 
        border: Border.all(color: Colors.grey.shade100),
        boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 15, offset: Offset(0, 5))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // --- TOP HEADER ---
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "📈 SALES TREND & FORECAST (\"$displayQuery\")", 
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B), fontSize: 12, letterSpacing: 1.1)
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        "${package.percentChange >= 0 ? '+' : ''}${package.percentChange.toStringAsFixed(1)}%",
                        style: TextStyle(
                          color: package.percentChange >= 0 ? Colors.green : Colors.red,
                          fontWeight: FontWeight.w900,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(width: 5),
                      Text("vs last period", style: TextStyle(color: Colors.grey.shade400, fontSize: 12)),
                      
                      const SizedBox(width: 20),
                      
                      // Market Saturation Bar
                      Container(
                        height: 24,
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.grey.shade200)
                        ),
                        child: Row(
                          children: [
                            const Text("Saturation: ", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8))),
                            Container(
                              width: 60, height: 6,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(3),
                                gradient: LinearGradient(
                                  colors: [Colors.red.shade400, Colors.orange.shade300, neonGreen],
                                  stops: const [0.1, 0.5, 0.9],
                                )
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text("Low (Ideal)", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: neonGreen)),
                          ],
                        ),
                      ),
                      
                      const SizedBox(width: 10),

                      // AI Confidence Badge
                      Container(
                        height: 24,
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: package.safety.confidenceScore > 70 ? neonGreen.withAlpha(30) : Colors.orange.withAlpha(30),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: package.safety.confidenceScore > 70 ? neonGreen.withAlpha(100) : Colors.orange.withAlpha(100))
                        ),
                        child: Row(
                          children: [
                            Text(package.marketState == MarketState.momentum ? "⚡" : "⚓", style: const TextStyle(fontSize: 10)),
                            const SizedBox(width: 4),
                            Text(
                              "AI Confidence: ${package.safety.confidenceScore}%", 
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: package.safety.confidenceScore > 70 ? Colors.green.shade700 : Colors.orange.shade800)
                            ),
                          ],
                        ),
                      )
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(8)),
                child: Row(
                  children: [
                    _buildTimeToggle("7D"), _buildTimeToggle("30D"),
                    _buildTimeToggle("90D"), _buildTimeToggle("1Y"),
                  ],
                ),
              )
            ],
          ),
          
          const SizedBox(height: 35), 
          
          // --- THE ANIMATED & RESPONSIVE CHART ---
          Expanded(
            child: LayoutBuilder(
              builder: (context, constraints) {
                bool isSmallScreen = constraints.maxWidth < 600;
                double tiltAngle = isSmallScreen ? -math.pi / 5 : 0;
                double bottomSpace = isSmallScreen ? 40 : 25;

                return AnimatedBuilder(
                  animation: _sweepAnimation,
                  builder: (context, child) {
                    return ClipRect(
                      clipper: WidthClipper(widthFactor: _sweepAnimation.value),
                      child: child,
                    );
                  },
                  child: LineChart(
                    _buildProMeasurementData(
                      package.currentData, 
                      package.forecastData, 
                      package.safety, 
                      tiltAngle, 
                      bottomSpace, 
                      package.predictionDays
                    ),
                    duration: Duration.zero, 
                  ),
                );
              }
            ),
          )
        ],
      ),
    );
  }

  // --- YOUR ORIGINAL UNTOUCHED CHART STYLING ---
  LineChartData _buildProMeasurementData(
    List<FlSpot> currentData, 
    List<FlSpot> forecastData, 
    ForecastSafetyMetrics safety, 
    double tiltAngle, 
    double bottomSpace,
    int predictionDays
  ) {
    double baseMaxX = _selectedTime == "7D" ? 7 : (_selectedTime == "90D" ? 90 : 30);
    double totalMaxX = baseMaxX + predictionDays + 2.0; 
    double xInterval = _selectedTime == "7D" ? 2 : (_selectedTime == "90D" ? 20 : 6);

    double highestPoint = [...currentData, ...forecastData].map((s) => s.y).reduce(math.max);
    
    // Add extra space at the top based on the height of the data (prevents cutoffs)
    double calculatedMaxY = highestPoint + (highestPoint * 0.2).clamp(15.0, 1000000.0); 

    return LineChartData(
      minX: 0, maxX: totalMaxX,
      minY: 0, maxY: calculatedMaxY, 
      
      gridData: FlGridData(
        show: true, 
        drawVerticalLine: false,
        horizontalInterval: math.max(1, calculatedMaxY / 4), // Dynamically adjust grid lines safely
        getDrawingHorizontalLine: (value) => FlLine(color: Colors.blue.shade100.withAlpha(100), strokeWidth: 1),
      ),
      
      extraLinesData: ExtraLinesData(
        extraLinesOnTop: false, 
        verticalLines: [
          VerticalLine(
            x: baseMaxX * 0.5, 
            color: Colors.orange.withAlpha(120), 
            strokeWidth: 1, 
            dashArray: [5, 5],
            label: VerticalLineLabel(
              show: true,
              alignment: Alignment.topRight,
              padding: const EdgeInsets.only(left: 6, top: 0),
              labelResolver: (line) => '📉 \$5 Price Drop Event',
              style: TextStyle(color: Colors.orange.shade700, fontSize: 10, fontWeight: FontWeight.bold),
            ),
          ),
          VerticalLine(
            x: baseMaxX, 
            color: Colors.grey.withAlpha(150), 
            strokeWidth: 1,
            dashArray: [3, 3],
            label: VerticalLineLabel(
              show: true,
              alignment: Alignment.topLeft, 
              padding: const EdgeInsets.only(right: 6, top: 0),
              labelResolver: (line) => 'TODAY',
              style: const TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold),
            ),
          )
        ]
      ),

      titlesData: FlTitlesData(
        show: true,
        rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        
        leftTitles: AxisTitles(
          sideTitles: SideTitles(
            showTitles: true,
            reservedSize: 40,
            interval: math.max(1, calculatedMaxY / 4),
            getTitlesWidget: (value, meta) {
              if (value == 0 || value == meta.max) return const SizedBox.shrink();
              return Text(
                NumberFormat.compact().format(value), 
                style: const TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold, fontSize: 11)
              );
            },
          ),
        ),
        
        bottomTitles: AxisTitles(
          sideTitles: SideTitles(
            showTitles: true,
            reservedSize: bottomSpace, 
            interval: xInterval,
            getTitlesWidget: (value, meta) {
              if (value < 0 || value > meta.max) return const SizedBox.shrink();
              
              int daysDifference = value.toInt() - baseMaxX.toInt();
              DateTime date = DateTime.now().add(Duration(days: daysDifference));
              String formattedDate = DateFormat('MM-dd').format(date); 
              
              Widget labelWidget;

              if (daysDifference > 0) {
                // Prevent overlapping AI labels at the end of the chart
                if (value == meta.max && (value % xInterval != 0)) {
                  double previousTick = (value / xInterval).floorToDouble() * xInterval;
                  if (value - previousTick < (xInterval * 0.6)) {
                    return const SizedBox.shrink(); 
                  }
                }

                labelWidget = Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text("AI •", style: TextStyle(color: Colors.green.shade700, fontWeight: FontWeight.w900, fontSize: 9)),
                    const SizedBox(width: 4),
                    Text(formattedDate, style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.w900, fontSize: 9)),
                  ],
                );
              } else {
                labelWidget = Text(
                  formattedDate,
                  style: const TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.w600, fontSize: 9)
                );
              }

              return SideTitleWidget(
                meta: meta,
                angle: tiltAngle, 
                space: 8,
                child: labelWidget,
              );
            },
          ),
        ),
      ),
      
      borderData: FlBorderData(show: false),

      lineTouchData: LineTouchData(
        handleBuiltInTouches: true,
        touchTooltipData: LineTouchTooltipData(
          getTooltipColor: (spot) => Colors.transparent, 
          fitInsideHorizontally: true, 
          fitInsideVertically: true, 
          tooltipMargin: 8,
          getTooltipItems: (touchedSpots) {
            return touchedSpots.map((spot) {
              if (spot.barIndex > 1) return null;
              return LineTooltipItem(
                spot.barIndex == 0 ? '📦 Vol: ${NumberFormat.compact().format(spot.y)}' : 'AI Forecast: ${NumberFormat.compact().format(spot.y)}',
                const TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 13), 
              );
            }).toList();
          },
        ),
      ),

      lineBarsData: [
        LineChartBarData(
          spots: currentData,
          isCurved: true,
          curveSmoothness: 0.35,
          color: neonGreen,
          barWidth: 3, 
          isStrokeCapRound: true,
          dotData: const FlDotData(show: false), 
          belowBarData: BarAreaData(
            show: true,
            gradient: LinearGradient(
              colors: [neonGreen.withAlpha(140), neonGreen.withAlpha(10)], 
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
          ),
        ),
        
        LineChartBarData(
          spots: forecastData,
          isCurved: true,
          curveSmoothness: 0.35,
          color: neonGreen,
          barWidth: 3,
          isStrokeCapRound: true,
          dashArray: [6, 6],
          dotData: FlDotData(
            show: true, 
            checkToShowDot: (spot, barData) => spot.x == barData.spots.last.x,
            getDotPainter: (spot, percent, barData, index) => FlDotCirclePainter(radius: 4, color: Colors.white, strokeWidth: 2, strokeColor: neonGreen),
          ),
          belowBarData: BarAreaData(show: false), 
        ),

        LineChartBarData(
          spots: safety.upperBound,
          isCurved: true,
          color: Colors.transparent,
          barWidth: 0,
          dotData: const FlDotData(show: false),
        ),

        LineChartBarData(
          spots: safety.lowerBound,
          isCurved: true,
          color: Colors.transparent,
          barWidth: 0,
          dotData: const FlDotData(show: false),
        ),
      ],
      
      betweenBarsData: [
        BetweenBarsData(
          fromIndex: 2, 
          toIndex: 3,   
          color: neonGreen.withAlpha(25), 
        )
      ]
    );
  }

  Widget _buildTimeToggle(String label) {
    bool isActive = _selectedTime == label;
    return GestureDetector(
      onTap: () {
        if (_selectedTime != label) {
          setState(() => _selectedTime = label);
          _animController.reset();
          _animController.forward();
        }
      },
      child: Container(
        margin: const EdgeInsets.only(left: 4),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isActive ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
          boxShadow: isActive ? [const BoxShadow(color: Colors.black12, blurRadius: 4)] : [],
        ),
        child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isActive ? Colors.black : const Color(0xFF94A3B8))),
      ),
    );
  }
}

class WidthClipper extends CustomClipper<Rect> {
  final double widthFactor;
  WidthClipper({required this.widthFactor});

  @override
  Rect getClip(Size size) {
    return Rect.fromLTWH(0, 0, size.width * widthFactor, size.height);
  }

  @override
  bool shouldReclip(WidthClipper oldClipper) => oldClipper.widthFactor != widthFactor;
}