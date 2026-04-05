import 'package:flutter/material.dart';

class CompetitorXRayTab extends StatelessWidget {
  const CompetitorXRayTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Competitor Store X-Ray", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
          const SizedBox(height: 4),
          const Text("Paste an eBay store URL to reverse-engineer their best sellers and revenue.", style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: TextField(
                  decoration: InputDecoration(
                    hintText: "https://www.ebay.com/usr/TopTechDeals_99",
                    prefixIcon: const Icon(Icons.storefront, color: Color(0xFF94A3B8)),
                    filled: true, fillColor: const Color(0xFFF8FAFC),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.search, size: 18),
                label: const Text("Scan Store", style: TextStyle(fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A), foregroundColor: const Color(0xFF8FFF00), padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
              )
            ],
          ),
          const SizedBox(height: 32),
          
          // Mock Scan Results
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(12)),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              // ✨ FIX INCLUDED: Removed spaceAround to prevent the infinite width freeze bug!
              child: Row(
                children: [
                  _buildXRayStat("Target Store", "TechDeals_99", Icons.person),
                  Container(width: 1, height: 40, margin: const EdgeInsets.symmetric(horizontal: 30), color: Colors.white.withAlpha(30)),
                  _buildXRayStat("Est. Monthly Rev", "\$45,210", Icons.attach_money),
                  Container(width: 1, height: 40, margin: const EdgeInsets.symmetric(horizontal: 30), color: Colors.white.withAlpha(30)),
                  _buildXRayStat("Active Listings", "1,402", Icons.list),
                  Container(width: 1, height: 40, margin: const EdgeInsets.symmetric(horizontal: 30), color: Colors.white.withAlpha(30)),
                  _buildXRayStat("Sell-Through", "48%", Icons.trending_up),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          const Text("Top Selling Items (Last 30 Days)", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A))),
          const SizedBox(height: 16),
          _buildXRayProductRow("Apple AirPods Pro (2nd Gen)", "\$189.99", "342 Sold", "\$64,976 Rev"),
          _buildXRayProductRow("Sony WH-1000XM5 Headphones", "\$298.00", "125 Sold", "\$37,250 Rev"),
        ],
      )
    );
  }

  Widget _buildXRayStat(String title, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: const Color(0xFF8FFF00), size: 20),
        const SizedBox(height: 8),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        Text(title, style: const TextStyle(color: Colors.white70, fontSize: 12)),
      ],
    );
  }

  Widget _buildXRayProductRow(String title, String price, String sold, String rev) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12), padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Row(
        children: [
          Container(width: 40, height: 40, decoration: BoxDecoration(color: const Color(0xFFE2E8F0), borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.image, color: Color(0xFF94A3B8))),
          const SizedBox(width: 16),
          Expanded(child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A)))),
          SizedBox(width: 80, child: Text(price, style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)))),
          SizedBox(width: 80, child: Text(sold, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF16A34A)))),
          SizedBox(width: 100, child: Text(rev, textAlign: TextAlign.right, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A)))),
        ],
      ),
    );
  }
}