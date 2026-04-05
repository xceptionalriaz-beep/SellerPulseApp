import 'package:flutter/material.dart';

class NicheOverviewCard extends StatelessWidget {
  const NicheOverviewCard({super.key});

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
          _buildNicheStatRow(Icons.monetization_on_outlined, "Market Vol:", "\$142,500"),
          _buildNicheStatRow(Icons.sell_outlined, "Avg Price:", "\$16.50"),
          _buildNicheStatRow(Icons.track_changes, "Success Rate:", "64% (High)", valueColor: Colors.green),
          _buildNicheStatRow(Icons.inventory_2_outlined, "Total Active:", "140,000+ listings"),
        ],
      ),
    );
  }
}