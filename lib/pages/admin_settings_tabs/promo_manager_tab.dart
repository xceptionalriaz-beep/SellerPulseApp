import 'package:flutter/material.dart';

class PromoManagerTab extends StatelessWidget {
  final bool isMobile;

  const PromoManagerTab({
    super.key,
    required this.isMobile,
  });

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
              const Expanded(child: Text("Promo Code & Discount Manager", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)), overflow: TextOverflow.ellipsis)),
              const SizedBox(width: 8),
              ElevatedButton.icon(onPressed: (){}, icon: const Icon(Icons.add, size: 16), label: const Text("New Code", style: TextStyle(fontWeight: FontWeight.bold)), style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF8FFF00), foregroundColor: const Color(0xFF0F172A), elevation: 0)),
            ],
          ),
          const SizedBox(height: 4),
          const Text("Generate custom Stripe discount codes for marketing campaigns.", style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
          const SizedBox(height: 24),
          
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                SizedBox(width: 280, child: _buildPromoCard("BLACKFRIDAY50", "50% Off First 3 Months", "Active", "84 / 100 Used")),
                const SizedBox(width: 16),
                SizedBox(width: 280, child: _buildPromoCard("COMEBACK20", "20% Off Lifetime", "Active", "12 / ∞ Used")),
                const SizedBox(width: 16),
                SizedBox(width: 280, child: _buildPromoCard("LAUNCHPRO", "1 Month Free Elite", "Expired", "500 / 500 Used")),
              ],
            ),
          ),
          
          const SizedBox(height: 32),
          const Text("A/B Pricing Engine (Live Tests)", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
          const SizedBox(height: 16),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                SizedBox(width: 320, child: _buildABTestVariant("Variant A (Control)", "\$29/mo", "1,240", "4.2%", "\$1,508", false)),
                const SizedBox(width: 16),
                SizedBox(width: 320, child: _buildABTestVariant("Variant B (Test)", "\$39/mo", "1,255", "3.8%", "\$1,862", true)),
              ]
            ),
          )
        ],
      )
    );
  }

  Widget _buildPromoCard(String code, String desc, String status, String usage) {
    bool isActive = status == "Active";
    return Container(
      padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(4)), child: Text(code, style: const TextStyle(color: Color(0xFF8FFF00), fontWeight: FontWeight.bold, fontSize: 12))), Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: isActive ? const Color(0xFFDCFCE7) : const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(12)), child: Text(status, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isActive ? const Color(0xFF16A34A) : Colors.redAccent)))]),
          const SizedBox(height: 12),
          Text(desc, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
          const SizedBox(height: 8),
          Text(usage, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
        ],
      ),
    );
  }

  Widget _buildABTestVariant(String title, String price, String visitors, String conversion, String mrr, bool isWinner) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: isWinner ? const Color(0xFFDCFCE7) : const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12), border: Border.all(color: isWinner ? const Color(0xFF16A34A) : const Color(0xFFE2E8F0), width: isWinner ? 2 : 1)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: isWinner ? const Color(0xFF16A34A) : const Color(0xFF0F172A))),
              if (isWinner) Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: const Color(0xFF16A34A), borderRadius: BorderRadius.circular(20)), child: const Text("Winning", style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold))),
            ]
          ),
          const SizedBox(height: 12),
          Text(price, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(visitors, style: const TextStyle(fontWeight: FontWeight.bold)), const Text("Visitors", style: TextStyle(fontSize: 11, color: Color(0xFF64748B)))]),
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(conversion, style: const TextStyle(fontWeight: FontWeight.bold)), const Text("Conversion", style: TextStyle(fontSize: 11, color: Color(0xFF64748B)))]),
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(mrr, style: TextStyle(fontWeight: FontWeight.bold, color: isWinner ? const Color(0xFF16A34A) : const Color(0xFF0F172A))), const Text("MRR Generated", style: TextStyle(fontSize: 11, color: Color(0xFF64748B)))]),
            ]
          )
        ]
      )
    );
  }
}