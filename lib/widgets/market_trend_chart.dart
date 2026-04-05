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
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // --- HEADER & TIMEFRAME TOGGLES ---
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("📈 SEARCH TREND (\"${widget.searchQuery}\")", style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B), letterSpacing: 1.1)),
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
              Container(width: 10, height: 10, decoration: const BoxDecoration(color: Color(0xFF8FFF00), shape: BoxShape.circle)),
              const SizedBox(width: 5),
              const Text("Sales Vol", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
              const SizedBox(width: 15),
              Container(width: 10, height: 10, decoration: const BoxDecoration(color: Colors.blue, shape: BoxShape.circle)),
              const SizedBox(width: 5),
              const Text("Avg Price", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
            ],
          ),
          
          const SizedBox(height: 15),
          
          // --- THE DUAL-LINE CHART CANVAS ---
          Expanded(
            child: CustomPaint(
              size: const Size(double.infinity, double.infinity),
              painter: _ProTrendLinePainter(), // Draws the upgraded chart!
            ),
          )
        ],
      ),
    );
  }

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

// ✨ THE UPGRADED CHART PAINTER ✨
class _ProTrendLinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    // 1. Grid Lines
    final gridPaint = Paint()..color = Colors.grey.shade100..strokeWidth = 1;
    canvas.drawLine(Offset(0, size.height * 0.33), Offset(size.width, size.height * 0.33), gridPaint);
    canvas.drawLine(Offset(0, size.height * 0.66), Offset(size.width, size.height * 0.66), gridPaint);
    canvas.drawLine(Offset(0, size.height), Offset(size.width, size.height), gridPaint);

    // 2. The Seasonality Flag (Vertical Line)
    final flagPaint = Paint()..color = Colors.orange.shade200..strokeWidth = 2;
    double flagX = size.width * 0.75; 
    canvas.drawLine(Offset(flagX, 0), Offset(flagX, size.height), flagPaint);
    
    // 3. The Sales Line (Neon Green)
    final salesLine = Paint()..color = const Color(0xFF8FFF00)..strokeWidth = 4..style = PaintingStyle.stroke..strokeCap = StrokeCap.round;
    final salesFill = Paint()..color = const Color(0xFF8FFF00).withAlpha(30)..style = PaintingStyle.fill;

    final path = Path();
    path.moveTo(0, size.height * 0.8);
    path.quadraticBezierTo(size.width * 0.2, size.height * 0.9, size.width * 0.35, size.height * 0.5); 
    path.quadraticBezierTo(size.width * 0.45, size.height * 0.2, size.width * 0.6, size.height * 0.6); // Dip
    path.quadraticBezierTo(size.width * 0.75, size.height * 0.1, size.width * 0.85, size.height * 0.3); // Peak near flag
    path.quadraticBezierTo(size.width * 0.95, size.height * 0.4, size.width, size.height * 0.2); 

    final fillPath = Path.from(path);
    fillPath.lineTo(size.width, size.height);
    fillPath.lineTo(0, size.height);
    fillPath.close();
    
    canvas.drawPath(fillPath, salesFill);
    canvas.drawPath(path, salesLine);

    // 4. The Average Price Line (Blue)
    final priceLine = Paint()..color = Colors.blue.withAlpha(150)..strokeWidth = 2..style = PaintingStyle.stroke..strokeCap = StrokeCap.round;
    final pricePath = Path();
    pricePath.moveTo(0, size.height * 0.4);
    pricePath.quadraticBezierTo(size.width * 0.3, size.height * 0.45, size.width * 0.5, size.height * 0.6); // Price drops
    pricePath.quadraticBezierTo(size.width * 0.7, size.height * 0.8, size.width, size.height * 0.85); // Price bottoms out
    canvas.drawPath(pricePath, priceLine);

    // 5. Data Dots (Peak and Valley)
    final dotPaint = Paint()..color = Colors.black..style = PaintingStyle.fill;
    final glowPaint = Paint()..color = const Color(0xFF8FFF00)..style = PaintingStyle.fill;
    
    // Peak Dot
    canvas.drawCircle(Offset(size.width * 0.72, size.height * 0.17), 6, glowPaint);
    canvas.drawCircle(Offset(size.width * 0.72, size.height * 0.17), 3, dotPaint);

    // Valley Dot
    canvas.drawCircle(Offset(size.width * 0.2, size.height * 0.88), 6, Paint()..color = Colors.redAccent);
    canvas.drawCircle(Offset(size.width * 0.2, size.height * 0.88), 3, dotPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}