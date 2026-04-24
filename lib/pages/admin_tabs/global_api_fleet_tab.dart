import 'package:flutter/material.dart';

class GlobalApiFleetTab extends StatelessWidget {
  final bool startChartAnimation;

  const GlobalApiFleetTab({
    super.key,
    required this.startChartAnimation,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: _buildSpeedometerCard("eBay Production API", 0.85, "4,250 / 5,000 requests", true)),
        const SizedBox(width: 16),
        Expanded(child: _buildSpeedometerCard("Amazon SP-API", 0.30, "1,500 / 5,000 requests", false)),
      ],
    );
  }

  Widget _buildSpeedometerCard(String title, double percentage, String subtitle, bool isWarning) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Column(
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A))),
          const SizedBox(height: 20),
          SizedBox(
            height: 120, width: 120,
            child: TweenAnimationBuilder<double>(
              tween: Tween<double>(begin: 0.0, end: startChartAnimation ? percentage : 0.0),
              duration: const Duration(seconds: 2),
              curve: Curves.easeOutCubic,
              builder: (context, value, _) => Stack(
                fit: StackFit.expand,
                children: [
                  const CircularProgressIndicator(value: 1.0, strokeWidth: 12, color: Color(0xFFF1F5F9)), 
                  CircularProgressIndicator(value: value, strokeWidth: 12, color: isWarning && value > 0.8 ? Colors.redAccent : const Color(0xFF8FFF00)), 
                  Center(child: Text("${(value * 100).toInt()}%", style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold))),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(subtitle, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}