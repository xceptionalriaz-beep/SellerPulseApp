import 'package:flutter/material.dart';

class TrendChip extends StatelessWidget {
  final String spike;
  final String name;
  final Function(String) onSearch;

  const TrendChip({
    super.key, 
    required this.spike, 
    required this.name, 
    required this.onSearch
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => onSearch(name), 
      borderRadius: BorderRadius.circular(30),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white, 
          borderRadius: BorderRadius.circular(30), 
          border: Border.all(color: Colors.grey.shade200)
        ),
        child: Row(
          children: [
            const Icon(Icons.trending_up, color: Colors.green, size: 16), 
            const SizedBox(width: 6),
            Text(spike, style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)), 
            const SizedBox(width: 8),
            Text(name, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
          ],
        ),
      ),
    );
  }
}