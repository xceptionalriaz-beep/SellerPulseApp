import 'package:flutter/material.dart';
import '../../shared/neon_icon.dart';

class CompetitorXrayCard extends StatelessWidget {
  final String title;
  final String price;
  final String imageUrl;
  final String seller;

  const CompetitorXrayCard({
    super.key, required this.title, required this.price, 
    required this.imageUrl, required this.seller
  });

  Widget _buildInfoRow(IconData icon, String label, String value, {Color? valueColor}) {
    return Row(
      children: [
        Icon(icon, size: 16, color: const Color(0xFF64748B)), const SizedBox(width: 8),
        Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)), const SizedBox(width: 5),
        Expanded(child: Text(value, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: valueColor ?? const Color(0xFF1E293B)), overflow: TextOverflow.ellipsis)),
      ],
    );
  }

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
              NeonIcon(icon: Icons.document_scanner_outlined), SizedBox(width: 10),
              Text("Competitor X-Ray", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            ],
          ),
          const SizedBox(height: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Row(
                  children: [
                    Container(
                      width: 80, height: 80,
                      decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.shade200)),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(imageUrl, fit: BoxFit.cover, errorBuilder: (c,e,s) => const Icon(Icons.mouse, size: 40, color: Color(0xFF64748B))),
                      ),
                    ),
                    const SizedBox(width: 15),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16), maxLines: 2, overflow: TextOverflow.ellipsis),
                          const SizedBox(height: 4),
                          Text("Seller: $seller", style: const TextStyle(color: Colors.blue, fontSize: 13, decoration: TextDecoration.underline)),
                        ],
                      ),
                    )
                  ],
                ),
                const Spacer(),
                _buildInfoRow(Icons.sell_outlined, "Sold Price:", price),
                const SizedBox(height: 10),
                _buildInfoRow(Icons.local_fire_department_outlined, "Demand:", "EXTREME (Top 1%)", valueColor: Colors.orange.shade700),
                const SizedBox(height: 10),
                _buildInfoRow(Icons.track_changes_outlined, "Listing Quality:", "C (Beat them!)", valueColor: Colors.green.shade600),
              ],
            ),
          ),
        ],
      ),
    );
  }
}