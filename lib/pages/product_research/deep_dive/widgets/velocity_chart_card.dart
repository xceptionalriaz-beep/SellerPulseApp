import 'package:flutter/material.dart';
import '../../shared/neon_icon.dart';

class VelocityChartCard extends StatelessWidget {
  final String totalSold;
  
  const VelocityChartCard({super.key, required this.totalSold});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200, width: 1),
        boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 5))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              NeonIcon(icon: Icons.show_chart), SizedBox(width: 10),
              Text("30-Day Sales Velocity", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            ],
          ),
          const SizedBox(height: 20),
          Expanded(
            child: Column(
              children: [
                Expanded(
                  child: Container(
                    width: double.infinity,
                    decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.shade200)),
                    child: const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.bar_chart, size: 80, color: Color(0xFFE2E8F0)),
                          SizedBox(height: 10),
                          Text("[ Dynamic Chart rendering engine ]", style: TextStyle(color: Color(0xFF94A3B8))),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    const NeonIcon(icon: Icons.trending_up),
                    const SizedBox(width: 10),
                    Text("Sales are trending UP this week! ($totalSold Total Sold)", style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                  ],
                )
              ],
            ),
          ),
        ],
      ),
    );
  }
}