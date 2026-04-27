import 'package:flutter/material.dart';

class AdminHudSection extends StatelessWidget {
  const AdminHudSection({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Row(
        children: [
          _buildHUDCard(
            title: "Active Subscribers",
            value: "842",
            subtitle: "Total: 1,020. (+12 today)",
            child: const SizedBox(
              width: 50, height: 50,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  CircularProgressIndicator(value: 0.82, backgroundColor: Color(0xFFF1F5F9), color: Color(0xFF0F172A), strokeWidth: 6),
                  Center(child: Text("842", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13))),
                ],
              ),
            ),
          ),
          const SizedBox(width: 16),
          _buildHUDCard(
            title: "Plan Distribution",
            value: "Pro Plans: 547",
            subtitle: "Free: 300  |  Elite: 173",
            child: Row(
              children: [
                _buildMiniBar(0.8, const Color(0xFF8FFF00)),
                const SizedBox(width: 4),
                _buildMiniBar(0.4, const Color(0xFF0F172A)),
                const SizedBox(width: 4),
                _buildMiniBar(0.2, const Color(0xFF64748B)),
              ],
            ),
          ),
          const SizedBox(width: 16),
          _buildHUDCard(
            title: "Account Health",
            value: "3 Risk Users",
            subtitle: "Past Due: 1 user (Emma W.)",
            child: const SizedBox(
              width: 50, height: 50,
              child: CircularProgressIndicator(value: 0.15, backgroundColor: Color(0xFFF1F5F9), color: Colors.orange, strokeWidth: 6),
            ),
          ),
          const SizedBox(width: 16),
          _buildHUDCard(
            title: "Dispute Center",
            value: "1 Active Dispute",
            subtitle: "Mike Ross (\$99.00)",
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: Colors.red.shade50, shape: BoxShape.circle),
              child: const Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 24),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHUDCard({required String title, required String value, required String subtitle, required Widget child}) {
    return Container(
      width: 280,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [BoxShadow(color: Color(0x02000000), blurRadius: 8, offset: Offset(0, 4))]
      ),
      child: Row(
        children: [
          child,
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                const SizedBox(height: 4),
                Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8))),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMiniBar(double fill, Color color) {
    return Container(
      width: 12, height: 40,
      decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(4)),
      alignment: Alignment.bottomCenter,
      child: FractionallySizedBox(
        heightFactor: fill,
        child: Container(decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4))),
      ),
    );
  }
}