import 'package:flutter/material.dart';

class FeatureRoadmapTab extends StatelessWidget {
  const FeatureRoadmapTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Expanded(child: Text("User Roadmap & Feature Voting", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)))),
              const SizedBox(width: 12),
              TextButton.icon(onPressed: (){}, icon: const Icon(Icons.open_in_new, size: 14), label: const Text("View Public Board")),
            ],
          ),
          const SizedBox(height: 4),
          const Text("Stop guessing. Build exactly what your paying customers are begging for.", style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
          const SizedBox(height: 24),
          _buildRoadmapItem("Amazon CA & UK Integration", "Allow users to fetch products from Amazon CA.", 412, "In Progress", Colors.blue),
          _buildRoadmapItem("Walmart Drop Shipping Support", "Add Walmart as a source supplier.", 385, "Planned", Colors.orange),
          _buildRoadmapItem("Dark Mode UI", "A toggle for night mode in the dashboard.", 150, "Under Review", Colors.purple),
        ],
      )
    );
  }

  Widget _buildRoadmapItem(String title, String desc, int votes, String status, Color statusColor) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12), padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8), border: Border.all(color: const Color(0xFFE2E8F0))),
            child: Column(children: [const Icon(Icons.arrow_upward, size: 16, color: Color(0xFF64748B)), const SizedBox(height: 4), Text(votes.toString(), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16))]),
          ),
          const SizedBox(width: 16),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF0F172A))), Text(desc, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)))])),
          Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), decoration: BoxDecoration(color: statusColor.withAlpha(20), borderRadius: BorderRadius.circular(20), border: Border.all(color: statusColor.withAlpha(50))), child: Text(status, style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 11))),
        ],
      ),
    );
  }
}