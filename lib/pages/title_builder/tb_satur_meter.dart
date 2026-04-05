import 'package:flutter/material.dart';
import 'dart:math' as math;

class TbSaturMeter extends StatelessWidget {
  final double score; // 0.0 to 1.0 (0 = Low Comp, 1 = High Comp)
  final String label;

  const TbSaturMeter({super.key, required this.score, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 80,
          width: 150,
          child: CustomPaint(
            painter: _GaugePainter(score: score),
            child: Align(
              alignment: Alignment.bottomCenter,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    "${(score * 100).toInt()}%",
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                  Text(
                    label,
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: _getScoreColor(score)),
                  ),
                  const SizedBox(height: 10),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Color _getScoreColor(double score) {
    if (score < 0.33) return const Color(0xFF8FFF00);
    if (score < 0.66) return Colors.orange;
    return Colors.redAccent;
  }
}

class _GaugePainter extends CustomPainter {
  final double score;
  _GaugePainter({required this.score});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height);
    final radius = size.width / 2;
    const strokeWidth = 15.0;

    // 1. Draw the Background Track (Grey)
    final paintBase = Paint()
      ..color = Colors.grey.shade200
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = strokeWidth;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius - 10),
      math.pi,
      math.pi,
      false,
      paintBase,
    );

    // 2. Draw the Colored Gradient Track
    final paintFill = Paint()
      ..shader = const SweepGradient(
        colors: [Color(0xFF8FFF00), Colors.orange, Colors.redAccent],
        stops: [0.33, 0.66, 1.0],
        startAngle: math.pi,
        endAngle: 0,
      ).createShader(Rect.fromCircle(center: center, radius: radius))
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = strokeWidth;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius - 10),
      math.pi,
      math.pi * score.clamp(0.0, 1.0),
      false,
      paintFill,
    );

    // 3. Draw the Needle (The Indicator)
    final paintNeedle = Paint()
      ..color = const Color(0xFF0F172A)
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;

    double needleAngle = math.pi + (math.pi * score.clamp(0.0, 1.0));
    Offset needleEnd = Offset(
      center.dx + (radius - 30) * math.cos(needleAngle),
      center.dy + (radius - 30) * math.sin(needleAngle),
    );

    canvas.drawLine(center, needleEnd, paintNeedle);
    canvas.drawCircle(center, 6, paintNeedle); // Needle base
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}