import 'package:flutter/material.dart';

class SeasonalRadar extends StatelessWidget {
  const SeasonalRadar({super.key});

  Widget _buildRadarItem(String event, String time, String trending) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(event, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(color: Colors.orange.withAlpha(20), borderRadius: BorderRadius.circular(6)),
              child: Text(time, style: const TextStyle(color: Colors.orange, fontWeight: FontWeight.bold, fontSize: 12)),
            )
          ],
        ),
        const SizedBox(height: 5),
        Text(trending, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.calendar_month, color: Color(0xFF64748B), size: 20), SizedBox(width: 10),
              Text("SEASONAL RADAR (Source Now!)", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            ],
          ),
          const SizedBox(height: 20),
          _buildRadarItem("🎓 Graduation Season", "In 40 Days", "Trending: Gift boxes, dorm decor"),
          const Divider(height: 30),
          _buildRadarItem("🏖️ Summer Travel", "In 60 Days", "Trending: Luggage tags, neck pillows"),
        ],
      ),
    );
  }
}