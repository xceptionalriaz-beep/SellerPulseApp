import 'package:flutter/material.dart';

class RecentSearches extends StatelessWidget {
  final Function(String) onSearch;

  const RecentSearches({super.key, required this.onSearch});

  Widget _buildSearchItem(IconData icon, String title, String subtitle, bool isPinned, {String? query}) {
    return Row(
      children: [
        Icon(icon, size: 16, color: isPinned ? Colors.blue : const Color(0xFF94A3B8)), const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14), overflow: TextOverflow.ellipsis),
              Text(subtitle, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
            ],
          ),
        ),
        TextButton(
          onPressed: () => onSearch(query ?? title),
          child: const Text("Scan", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF131B2F))),
        )
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
              Icon(Icons.push_pin, color: Color(0xFF64748B), size: 20), SizedBox(width: 10),
              Text("PINNED & RECENT", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            ],
          ),
          const SizedBox(height: 20),
          _buildSearchItem(Icons.push_pin, "Logitech G502 Mouse", "Pinned", true),
          const SizedBox(height: 15),
          _buildSearchItem(Icons.push_pin, "Dog Toys", "Pinned", true),
          const Divider(height: 30),
          _buildSearchItem(Icons.history, "https://ebay.com/itm/882...", "Analyzed 1 hr ago", false, query: "https://ebay.com/itm/882"),
        ],
      ),
    );
  }
}