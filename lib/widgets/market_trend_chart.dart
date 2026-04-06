import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

class MarketTrendChart extends StatefulWidget {
  final String searchQuery;
  
  const MarketTrendChart({super.key, required this.searchQuery});

  @override
  State<MarketTrendChart> createState() => _MarketTrendChartState();
}

class _MarketTrendChartState extends State<MarketTrendChart> {
  String _selectedTime = "30D";

  @override
  Widget build(BuildContext context) {
    String displayQuery = widget.searchQuery.isEmpty ? "Overall Market" : widget.searchQuery;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white, 
        borderRadius: BorderRadius.circular(16), 
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 15, offset: Offset(0, 5))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // --- HEADER & TIMEFRAME TOGGLES ---
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("📈 SEARCH TREND (\"$displayQuery\")", style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B), letterSpacing: 1.1)),
              Row(
                children: [
                  _buildTimeToggle("7D"), _buildTimeToggle("30D"),
                  _buildTimeToggle("90D"), _buildTimeToggle("1Y"),
                ],
              )
            ],
          ),
          const SizedBox(height: 5),
          
          // --- LEGEND ---
          Row(
            children: [
              Container(width: 10, height: 10, decoration: const BoxDecoration(color: Color(0xFF8FFF00), shape: BoxShape.circle, boxShadow: [BoxShadow(color: Color(0xFF8FFF00), blurRadius: 4)])),
              const SizedBox(width: 5),
              const Text("Sales Vol", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
              const SizedBox(width: 15),
              Container(width: 10, height: 10, decoration: const BoxDecoration(color: Colors.blue, shape: BoxShape.circle, boxShadow: [BoxShadow(color: Colors.blue, blurRadius: 4)])),
              const SizedBox(width: 5),
              const Text("Avg Price", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
            ],
          ),
          
          const SizedBox(height: 25),
          
          // --- THE UPGRADED INTERACTIVE CHART ENGINE ---
          Expanded(
            child: LineChart(
              LineChartData(
                // Grid styling
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  getDrawingHorizontalLine: (value) => FlLine(color: Colors.grey.shade100, strokeWidth: 1, dashArray: [5, 5])
                ),
                // Hide default numbers around the chart
                titlesData: const FlTitlesData(show: false),
                borderData: FlBorderData(show: false),
                // ✨ Enables the hover tooltips!
                lineTouchData: const LineTouchData(handleBuiltInTouches: true), 
                
                lineBarsData: [
                  // 🟢 The Sales Line (Neon Green)
                  LineChartBarData(
                    spots: _getSalesData(),
                    isCurved: true,
                    color: const Color(0xFF8FFF00),
                    barWidth: 4,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: false),
                    // Adds the beautiful glowing fade underneath the line
                    belowBarData: BarAreaData(show: true, color: const Color(0xFF8FFF00).withOpacity(0.15)), 
                  ),
                  
                  // 🔵 The Average Price Line (Blue)
                  LineChartBarData(
                    spots: _getPriceData(),
                    isCurved: true,
                    color: Colors.blue,
                    barWidth: 3,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: false),
                  ),
                ],
              ),
              // ✨ Smooth animation when you click the 7D/30D buttons!
              duration: const Duration(milliseconds: 350), 
              curve: Curves.easeInOut,
            ),
          )
        ],
      ),
    );
  }

  // ✨ DYNAMIC DATA GENERATORS ✨
  // These change the shape of the graph when you click the time buttons!
  List<FlSpot> _getSalesData() {
    if (_selectedTime == "7D") return const [FlSpot(0, 1), FlSpot(1, 2.5), FlSpot(2, 2.0), FlSpot(3, 4), FlSpot(4, 5)];
    if (_selectedTime == "90D") return const [FlSpot(0, 3), FlSpot(1, 4), FlSpot(2, 1.5), FlSpot(3, 5), FlSpot(4, 7)];
    if (_selectedTime == "1Y") return const [FlSpot(0, 1), FlSpot(1, 2), FlSpot(2, 5), FlSpot(3, 3), FlSpot(4, 6)];
    // Default 30D (Similar to your original custom paint curve)
    return const [FlSpot(0, 2), FlSpot(1, 2.5), FlSpot(2, 4), FlSpot(3, 3.5), FlSpot(4, 5), FlSpot(5, 4.5), FlSpot(6, 6)]; 
  }

  List<FlSpot> _getPriceData() {
    if (_selectedTime == "7D") return const [FlSpot(0, 3.5), FlSpot(1, 3.2), FlSpot(2, 3.4), FlSpot(3, 3.1), FlSpot(4, 3.0)];
    if (_selectedTime == "90D") return const [FlSpot(0, 2.5), FlSpot(1, 2.8), FlSpot(2, 3.0), FlSpot(3, 2.9), FlSpot(4, 3.2)];
    if (_selectedTime == "1Y") return const [FlSpot(0, 4.0), FlSpot(1, 3.5), FlSpot(2, 3.2), FlSpot(3, 3.6), FlSpot(4, 3.1)];
    // Default 30D
    return const [FlSpot(0, 3), FlSpot(1, 2.8), FlSpot(2, 3.2), FlSpot(3, 3.1), FlSpot(4, 2.9), FlSpot(5, 3.3), FlSpot(6, 3.5)]; 
  }

  // --- YOUR ORIGINAL BUTTON UI ---
  Widget _buildTimeToggle(String label) {
    bool isActive = _selectedTime == label;
    return InkWell(
      onTap: () => setState(() => _selectedTime = label),
      borderRadius: BorderRadius.circular(6),
      child: Container(
        margin: const EdgeInsets.only(left: 6),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF8FFF00) : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(label, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: isActive ? Colors.black : const Color(0xFF94A3B8))),
      ),
    );
  }
}