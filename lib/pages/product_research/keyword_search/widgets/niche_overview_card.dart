import 'package:flutter/material.dart';

class NicheOverviewCard extends StatelessWidget {
  // ✨ These slots will now receive real data from your Search Screen
  final String marketVol;
  final String avgPrice;
  final String successRate;
  final String totalActive;
  final Color successColor;

  const NicheOverviewCard({
    super.key,
    this.marketVol = "\$0",
    this.avgPrice = "\$0",
    this.successRate = "0%",
    this.totalActive = "0",
    this.successColor = Colors.grey,
  });

  Widget _buildNicheStatRow(IconData icon, String label, String value, {Color? valueColor}) {
    return Row(
      children: [
        Icon(icon, size: 18, color: const Color(0xFF94A3B8)),
        const SizedBox(width: 10),
        Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
        const Spacer(),
        Text(value, style: TextStyle(
          fontWeight: FontWeight.bold, 
          fontSize: 13, 
          color: valueColor ?? const Color(0xFF1E293B)
        )),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white, 
        borderRadius: BorderRadius.circular(16), 
        border: Border.all(color: Colors.grey.shade200)
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text("📊 NICHE OVERVIEW", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B), letterSpacing: 1.1)),
          const SizedBox(height: 10),
          // ✨ Now using the dynamic variables instead of static text
          _buildNicheStatRow(Icons.monetization_on_outlined, "Market Vol:", marketVol),
          _buildNicheStatRow(Icons.sell_outlined, "Avg Price:", avgPrice),
          _buildNicheStatRow(Icons.track_changes, "Success Rate:", successRate, valueColor: successColor),
          _buildNicheStatRow(Icons.inventory_2_outlined, "Total Active:", totalActive),
        ],
      ),
    );
  }
}