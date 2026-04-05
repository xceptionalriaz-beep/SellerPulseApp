import 'package:flutter/material.dart';
import '../../shared/neon_icon.dart';

class AiListingCard extends StatelessWidget {
  final String optimizedTitle;
  final String suggestedPrice;

  const AiListingCard({super.key, required this.optimizedTitle, required this.suggestedPrice});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF8FFF00), width: 2), 
        boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 5))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              NeonIcon(icon: Icons.auto_awesome), SizedBox(width: 10),
              Text("AI Listing Assistant", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            ],
          ),
          const SizedBox(height: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Optimized Title:", style: TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 5),
                Container(
                  padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(8)),
                  child: Row(
                    children: [
                      const Icon(Icons.copy, size: 14, color: Colors.blue), const SizedBox(width: 8),
                      Expanded(child: Text(optimizedTitle, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold))),
                    ],
                  ),
                ),
                const SizedBox(height: 15),
                const Text("Suggested Price:", style: TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 5),
                Container(
                  padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(8)),
                  child: Row(
                    children: [
                      const Icon(Icons.copy, size: 14, color: Colors.blue), const SizedBox(width: 8),
                      Text(suggestedPrice, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                      const Text(" (Win BuyBox)", style: TextStyle(fontSize: 12, color: Colors.green)),
                    ],
                  ),
                ),
                const Spacer(),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.edit_document, size: 16),
                    label: const Text("Generate Description"),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF131B2F), foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                )
              ],
            ),
          ),
        ],
      ),
    );
  }
}