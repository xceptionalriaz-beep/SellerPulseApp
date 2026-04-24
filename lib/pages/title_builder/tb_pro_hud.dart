import 'package:flutter/material.dart';
import 'dart:math';

// ✨ NEW: The Radar Dish Imports
import 'package:provider/provider.dart'; 
import 'package:sellerpulse/providers/market_provider.dart'; 

class TbProHud extends StatelessWidget {
  final int veroCount;
  final String currentTitle; 
  final String timeframe; 

  const TbProHud({
    super.key, 
    required this.veroCount, 
    this.currentTitle = "", 
    required this.timeframe,
  });

  @override
  Widget build(BuildContext context) {
    // 🚀 THE RADAR DISH: This wraps your entire UI and listens to the Brain!
    return Consumer<MarketProvider>(
      builder: (context, market, child) {
        
        bool isEmpty = currentTitle.trim().isEmpty;
        bool isSafe = veroCount == 0;
        bool isLoading = market.isLoading; // ✨ NEW: Checks if the API is currently fetching

        // 🚀 DYNAMIC CHART DATA (Connected to the Brain)
        List<double> chartData;
        String peakText;
        
        if (isEmpty) {
          chartData = [0, 0, 0, 0, 0, 0, 0, 0];
          peakText = "(--)";
        } else if (isLoading) {
          chartData = [0, 0, 0, 0, 0, 0, 0, 0]; // Flatline while loading
          peakText = "(ANALYZING...)";
        } else {
          // ✨ NEW: Pulls the real array of numbers from your Provider!
          chartData = market.trendData.isNotEmpty ? market.trendData : [0, 0, 0, 0, 0, 0, 0]; 
          peakText = timeframe == "7D" ? "(Peak Thursday)" : (timeframe == "12M" ? "(Peak Nov)" : "(Peak Day 14)");
        }

        // 🚀 DYNAMIC COMPETITION LOGIC (Connected to the Brain)
        double saturScore = 0.0; 
        String saturLabel = "Awaiting Search...";
        Color saturColor = Colors.white38;

        if (isLoading) {
          saturLabel = "Analyzing Market...";
          saturColor = Colors.cyanAccent; // Cool loading color
        } else if (!isEmpty) {
          // ✨ NEW: Pulls the exact score from your Provider!
          saturScore = market.saturScore; 
          
          if (saturScore > 0.70) {
            saturLabel = "High (Saturated)";
            saturColor = Colors.redAccent;
          } else if (saturScore > 0.40) {
            saturLabel = "Moderate Comp.";
            saturColor = Colors.orange;
          } else {
            saturLabel = "Low (Opportunity)";
            saturColor = const Color(0xFF8FFF00);
          }
        }

        Color activeIconColor = (isEmpty || isLoading) ? Colors.white24 : const Color(0xFF8FFF00);

        // ==========================================
        // YOUR EXACT UI DESIGN STARTS HERE
        // ==========================================
        return Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A), 
            borderRadius: BorderRadius.circular(16), 
            border: Border.all(color: Colors.white.withOpacity(0.05)),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 15, offset: const Offset(0, 5))
            ]
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min, 
            crossAxisAlignment: CrossAxisAlignment.stretch, 
            children: [
              // --- HEADER ---
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    "PRO CHARTS & SAFETY HUD", 
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.white54, letterSpacing: 1)
                  ),
                  _liveIndicator(isEmpty || isLoading),
                ],
              ),
              const SizedBox(height: 16),
              
              // --- 1. VeRO RISK ---
              _hudRow(
                _iconBadge(isSafe ? Icons.shield_outlined : Icons.warning_amber_rounded, isEmpty ? Colors.white24 : (isSafe ? const Color(0xFF8FFF00) : Colors.redAccent)), 
                "VeRO Risk:", 
                isEmpty 
                  ? const Text("Awaiting Search...", style: TextStyle(color: Colors.white38, fontSize: 11, fontStyle: FontStyle.italic))
                  : Text(
                      isSafe ? "SECURE (0 flags)" : "HIGH RISK ($veroCount flags)", 
                      style: TextStyle(color: isSafe ? const Color(0xFF8FFF00) : Colors.redAccent, fontWeight: FontWeight.w900, fontSize: 13)
                    ),
                tooltip: "Account Safety Check.\nShows if this brand often takes down eBay listings."
              ),
              _hudDivider(),
              
              // --- 2. SPECIFICS ---
              _hudRow(
                _iconBadge(Icons.sell_outlined, activeIconColor), 
                "Specifics:", 
                isLoading ? const Text("Analyzing...", style: TextStyle(color: Colors.cyanAccent, fontSize: 11, fontStyle: FontStyle.italic)) : _buildSmartSpecifics(currentTitle, isEmpty),
                tooltip: "Key item details.\nAutomatically finds the Brand, Model, or Color."
              ),
              _hudDivider(),
              
              // --- 3. COMPETITION ---
              _hudRow(
                _iconBadge(Icons.speed_rounded, activeIconColor), 
                "Competition:", 
                _inlineSaturMeter(saturScore, saturLabel, saturColor),
                tooltip: "How easy it is to rank.\nGreen means high buyer demand and low competition."
              ),
              _hudDivider(),
              
              // --- 4. TOP WORDS ---
              _hudRow(
                _iconBadge(Icons.data_usage_rounded, activeIconColor), 
                "Top Words:", 
                (isEmpty || isLoading)
                  ? Text(isLoading ? "Analyzing Data..." : "Awaiting Search...", style: TextStyle(color: isLoading ? Colors.cyanAccent : Colors.white38, fontSize: 11, fontStyle: FontStyle.italic))
                  : Wrap(spacing: 6, runSpacing: 6, children: [_wordChip("1. Fast", "85%"), _wordChip("2. OEM", "60%")]),
                tooltip: "The most profitable keywords.\nPercentages show how much they drive sales."
              ),
              
              const SizedBox(height: 20), 
              
              // --- 5. TREND VISUALIZER ---
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("$timeframe Trend Visualizer", style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                  Text(peakText, style: TextStyle(color: (isEmpty || isLoading) ? Colors.white38 : const Color(0xFF8FFF00), fontSize: 10, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 8),
              
              Container(
                height: 60, 
                width: double.infinity, 
                decoration: BoxDecoration(border: Border(bottom: BorderSide(color: Colors.white.withOpacity(0.05), width: 1))),
                child: _animatedHeroChart(chartData, isEmpty || isLoading),
              )
            ],
          ),
        );
      },
    );
  }

  // ==========================================
  // HELPERS (100% UNCHANGED)
  // ==========================================

  Widget _iconBadge(IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withOpacity(0.2))
      ),
      child: Icon(icon, size: 14, color: color),
    );
  }

  Widget _hudRow(Widget icon, String label, Widget content, {String? tooltip}) {
    Widget labelWidget = Text(
      label, 
      style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)
    );

    Widget finalLabelWidget = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        labelWidget,
        if (tooltip != null) ...[
          const SizedBox(width: 4),
          const Icon(Icons.info_outline_rounded, color: Colors.white30, size: 14),
        ]
      ],
    );

    if (tooltip != null) {
      finalLabelWidget = Tooltip(
        message: tooltip,
        preferBelow: false, 
        verticalOffset: 14, 
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        textStyle: const TextStyle(color: Color(0xFF0F172A), fontSize: 11, fontWeight: FontWeight.bold, height: 1.4),
        textAlign: TextAlign.center, 
        triggerMode: TooltipTriggerMode.tap, 
        decoration: const ShapeDecoration(
          color: Color(0xFFE1F8C2), 
          shape: TooltipShapeBorder(arrowWidth: 10, arrowHeight: 6, radius: 8), 
          shadows: [BoxShadow(color: Colors.black26, blurRadius: 10, offset: Offset(0, 4))],
        ),
        child: Padding(
          padding: const EdgeInsets.only(left: 6.0, right: 6.0),
          child: finalLabelWidget,
        ),
      );
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center, 
      children: [
        icon,
        const SizedBox(width: 10),
        SizedBox(width: 105, child: finalLabelWidget), 
        Expanded(child: content),
      ],
    );
  }

  Widget _hudDivider() => const Divider(color: Colors.white10, height: 16); 

  Widget _liveIndicator(bool isStandby) {
    Color color = isStandby ? Colors.white38 : const Color(0xFF8FFF00);
    return Row(
      children: [
        Container(width: 6, height: 6, decoration: BoxDecoration(color: color, shape: BoxShape.circle, boxShadow: isStandby ? null : [BoxShadow(color: color.withOpacity(0.5), blurRadius: 4)])),
        const SizedBox(width: 6),
        Text(isStandby ? "STANDBY" : "LIVE", style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _inlineSaturMeter(double score, String label, Color labelColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(label, style: TextStyle(color: labelColor, fontWeight: FontWeight.w600, fontSize: 11, fontStyle: score == 0 ? FontStyle.italic : FontStyle.normal)),
        const SizedBox(height: 6),
        Stack(
          alignment: Alignment.centerLeft,
          clipBehavior: Clip.none,
          children: [
            Container(
              height: 6,
              width: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(3),
                gradient: LinearGradient(colors: score == 0 ? [Colors.white10, Colors.white10] : [const Color(0xFF8FFF00), Colors.orange, Colors.redAccent])
              ),
            ),
            TweenAnimationBuilder<double>(
              tween: Tween<double>(begin: 0, end: score.clamp(0.0, 1.0)),
              duration: const Duration(milliseconds: 600),
              curve: Curves.easeOutCubic,
              builder: (context, val, child) {
                return FractionallySizedBox(
                  widthFactor: val,
                  child: Align(
                    alignment: Alignment.centerRight,
                    child: Container(
                      width: 12, height: 12,
                      decoration: BoxDecoration(color: score == 0 ? Colors.grey : Colors.white, shape: BoxShape.circle, border: Border.all(color: const Color(0xFF0F172A), width: 2), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 4)])
                    ),
                  ),
                );
              }
            )
          ],
        )
      ],
    );
  }

  Widget _buildSmartSpecifics(String title, bool isEmpty) {
    if (isEmpty || title.trim().isEmpty) {
      return const Text("Awaiting Search...", style: TextStyle(color: Colors.white38, fontSize: 11, fontStyle: FontStyle.italic));
    }
    
    final stopWords = {'for', 'with', 'and', 'the', 'in', 'on', 'a', 'to', 'of', 'genuine', 'new', 'original', 'fast'};
    final words = title.replaceAll(RegExp(r'[^\w\s\-]'), '').split(RegExp(r'\s+'));
    final tags = words.where((w) => w.isNotEmpty && !stopWords.contains(w.toLowerCase())).take(3).toList();
    
    if (tags.isEmpty) {
      return const Text("No specifics found", style: TextStyle(color: Colors.white38, fontSize: 11, fontStyle: FontStyle.italic));
    }

    return Wrap(
      spacing: 6, runSpacing: 6,
      children: tags.map((tag) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(color: Colors.white.withOpacity(0.08), borderRadius: BorderRadius.circular(4)),
        child: Text("${tag[0].toUpperCase()}${tag.substring(1)}", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
      )).toList(),
    );
  }

  Widget _wordChip(String word, String percent) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: Colors.orange.withOpacity(0.15), borderRadius: BorderRadius.circular(4), border: Border.all(color: Colors.orange.withOpacity(0.3))),
      child: Row(
        mainAxisSize: MainAxisSize.min, 
        children: [
          Text(word, style: const TextStyle(color: Colors.orangeAccent, fontSize: 11, fontWeight: FontWeight.bold)),
          const SizedBox(width: 4),
          Text("($percent)", style: TextStyle(color: Colors.orange.shade200, fontSize: 10)),
        ],
      ),
    );
  }

  Widget _animatedHeroChart(List<double> dataPoints, bool isEmpty) {
    return TweenAnimationBuilder(
      key: ValueKey(dataPoints.toString()), 
      tween: Tween<double>(begin: 0.0, end: 1.0),
      duration: const Duration(milliseconds: 1000), 
      curve: Curves.easeOutQuart,
      builder: (context, value, child) {
        return ClipRect(
          child: Align(
            alignment: Alignment.centerLeft,
            widthFactor: value, 
            child: SizedBox(
              width: double.infinity, height: double.infinity,
              child: CustomPaint(painter: _HeroLinePainter(data: dataPoints, isEmpty: isEmpty)),
            ),
          ),
        );
      }
    );
  }
}

// ==========================================
// CUSTOM PAINTER FOR NEON CURVE (100% UNCHANGED)
// ==========================================
class _HeroLinePainter extends CustomPainter {
  final List<double> data;
  final bool isEmpty;
  
  _HeroLinePainter({required this.data, this.isEmpty = false});

  @override
  void paint(Canvas canvas, Size size) {
    if (data.isEmpty) return;

    final maxData = data.reduce(max);
    final minData = data.reduce(min);
    final range = maxData - minData == 0 ? 1 : maxData - minData;

    final path = Path();
    final widthStep = size.width / (data.length - 1);

    for (int i = 0; i < data.length; i++) {
      final x = i * widthStep;
      final y = (size.height * 0.9) - ((data[i] - minData) / range) * (size.height * 0.8);
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        final prevX = (i - 1) * widthStep;
        final prevY = (size.height * 0.9) - ((data[i - 1] - minData) / range) * (size.height * 0.8);
        path.cubicTo(prevX + (widthStep / 2), prevY, x - (widthStep / 2), y, x, y);
      }
    }

    final fillPath = Path.from(path)..lineTo(size.width, size.height)..lineTo(0, size.height)..close();
    
    Color primaryColor = isEmpty ? Colors.white24 : const Color(0xFF8FFF00);
    
    final fillPaint = Paint()..shader = LinearGradient(
        begin: Alignment.topCenter, end: Alignment.bottomCenter,
        colors: [primaryColor.withOpacity(0.5), primaryColor.withOpacity(0.0)],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    canvas.drawPath(fillPath, fillPaint);
    final linePaint = Paint()..color = primaryColor..style = PaintingStyle.stroke..strokeWidth = 2.5..strokeCap = StrokeCap.round;
    canvas.drawPath(path, linePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true; 
}

// ==========================================
// CUSTOM TOOLTIP BORDER WITH ARROW (100% UNCHANGED)
// ==========================================
class TooltipShapeBorder extends ShapeBorder {
  final double arrowWidth;
  final double arrowHeight;
  final double radius;

  const TooltipShapeBorder({
    this.arrowWidth = 12.0,
    this.arrowHeight = 6.0,
    this.radius = 8.0,
  });

  @override
  EdgeInsetsGeometry get dimensions => EdgeInsets.only(bottom: arrowHeight);

  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) => Path();

  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) {
    rect = Rect.fromPoints(rect.topLeft, rect.bottomRight - Offset(0, arrowHeight));
    return Path()
      ..addRRect(RRect.fromRectAndRadius(rect, Radius.circular(radius)))
      ..moveTo(rect.bottomCenter.dx - arrowWidth / 2, rect.bottom) 
      ..lineTo(rect.bottomCenter.dx, rect.bottom + arrowHeight)    
      ..lineTo(rect.bottomCenter.dx + arrowWidth / 2, rect.bottom) 
      ..close();
  }

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {}

  @override
  ShapeBorder scale(double t) => this;
}