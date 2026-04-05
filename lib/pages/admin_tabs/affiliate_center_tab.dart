import 'package:flutter/material.dart';

class AffiliateCenterTab extends StatelessWidget {
  final bool isInvestorMode;

  const AffiliateCenterTab({
    super.key,
    required this.isInvestorMode,
  });

  // ✨ HELPER: OBSCURES TEXT IF INVESTOR MODE IS ON
  String _obscureText(String text, {bool isEmail = false}) {
    if (!isInvestorMode) return text;
    if (isEmail) {
      var parts = text.split('@');
      if (parts.length != 2) return text;
      return '${parts[0][0]}***@${parts[1]}';
    }
    return '${text[0]}***';
  }

  @override
  Widget build(BuildContext context) {
    final affiliates = [
      {"name": "Tech Hustler", "code": "TECH20", "clicks": "1,240", "signups": "42", "mrr": "\$1,260", "payout": "\$252.00"},
      {"name": "eBay Ninja", "code": "NINJA99", "clicks": "850", "signups": "18", "mrr": "\$540", "payout": "\$108.00"},
    ];
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Affiliate & Partner Command Center", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              ElevatedButton.icon(onPressed: (){}, icon: const Icon(Icons.add_link, size: 16), label: const Text("Generate Link", style: TextStyle(fontWeight: FontWeight.bold)), style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF8FFF00), foregroundColor: const Color(0xFF0F172A), elevation: 0)),
            ],
          ),
          const SizedBox(height: 4),
          const Text("Track your top promoters, referral clicks, and pending payouts.", style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
          const SizedBox(height: 24),
          
          Container(
            padding: const EdgeInsets.all(16),
            margin: const EdgeInsets.only(bottom: 24),
            decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(12)),
            child: Row(
              children: [
                Expanded(child: _buildAffiliateTier("🥉 Bronze", "1-10 Signups", "15% Comm.")),
                Container(width: 1, height: 40, color: Colors.white.withAlpha(30)),
                Expanded(child: _buildAffiliateTier("🥈 Silver", "11-50 Signups", "25% Comm.")),
                Container(width: 1, height: 40, color: Colors.white.withAlpha(30)),
                Expanded(child: _buildAffiliateTier("🥇 Gold", "50+ Signups", "40% Comm.", isHighlight: true)),
              ]
            )
          ),
          
          Column(
            children: affiliates.map((a) => Container(
              margin: const EdgeInsets.only(bottom: 12), padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
              child: Row(
                children: [
                  CircleAvatar(backgroundColor: const Color(0xFF0F172A), child: Text(a['name']![0], style: const TextStyle(color: Color(0xFF8FFF00), fontWeight: FontWeight.bold))),
                  const SizedBox(width: 16),
                  Expanded(flex: 2, child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(_obscureText(a['name']!), style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))), Text("Code: ${a['code']}", style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)))])),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(a['clicks']!, style: const TextStyle(fontWeight: FontWeight.bold)), const Text("Clicks", style: TextStyle(fontSize: 11, color: Color(0xFF64748B)))])),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(a['signups']!, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF16A34A))), const Text("Signups", style: TextStyle(fontSize: 11, color: Color(0xFF64748B)))])),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(a['mrr']!, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))), const Text("New MRR", style: TextStyle(fontSize: 11, color: Color(0xFF64748B)))])),
                  Column(crossAxisAlignment: CrossAxisAlignment.end, children: [Text(a['payout']!, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A), fontSize: 16)), const Text("Pending Payout", style: TextStyle(fontSize: 11, color: Color(0xFF64748B)))])
                ],
              ),
            )).toList(),
          )
        ],
      ),
    );
  }

  Widget _buildAffiliateTier(String title, String req, String payout, {bool isHighlight = false}) {
    return Column(
      children: [
        Text(title, style: TextStyle(color: isHighlight ? const Color(0xFF8FFF00) : Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
        const SizedBox(height: 4),
        Text(req, style: const TextStyle(color: Colors.white70, fontSize: 11)),
        Text(payout, style: TextStyle(color: isHighlight ? const Color(0xFF8FFF00) : Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
      ]
    );
  }
}