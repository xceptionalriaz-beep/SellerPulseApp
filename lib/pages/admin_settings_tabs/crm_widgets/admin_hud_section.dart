import 'package:flutter/material.dart';

class AdminHudSection extends StatelessWidget {
  final List<Map<String, dynamic>> allUsers;

  const AdminHudSection({super.key, required this.allUsers});

  double _safeRatio(num part, num total) {
    if (total <= 0 || part <= 0) return 0.0;
    return (part / total).clamp(0.0, 1.0);
  }

  String _clean(dynamic value, {String fallback = ''}) {
    if (value == null) return fallback.toLowerCase();
    return value.toString().trim().toLowerCase();
  }

  @override
  Widget build(BuildContext context) {
    final int totalUsers = allUsers.length;

    final int activeSubs = allUsers.where((u) {
      final status = _clean(u['account_status']);
      final plan = _clean(u['plan_name']);
      return status == 'active' && plan != 'free trial';
    }).length;
    
    final double activeRatio = _safeRatio(activeSubs, totalUsers);

    final int freeCount = allUsers.where((u) => _clean(u['plan_name']) == 'free trial').length;
    final int proCount = allUsers.where((u) => _clean(u['plan_name']) == 'pro plan').length;
    final int eliteCount = allUsers.where((u) => _clean(u['plan_name']) == 'elite plan').length;

    final pastDueUsers = allUsers.where((u) => _clean(u['account_status']) == 'past due').toList();
    final expiredUsers = allUsers.where((u) => _clean(u['account_status']) == 'expired').toList();
    final int riskTotal = pastDueUsers.length + expiredUsers.length;
    final double riskRatio = _safeRatio(riskTotal, totalUsers);
    
    double revenueAtRisk = 0.0;
    for (var user in [...pastDueUsers, ...expiredUsers]) {
      final plan = _clean(user['plan_name']);
      if (plan == 'pro plan') revenueAtRisk += 49.00; 
      if (plan == 'elite plan') revenueAtRisk += 99.00; 
    }

    String healthSubtitle = "All accounts healthy";
    if (riskTotal > 0) {
      healthSubtitle = "\$${revenueAtRisk.toStringAsFixed(0)} MRR at risk";
    }

    final disputeUsers = allUsers.where((u) {
      final note = u['dispute_note'];
      return note != null && note.toString().trim().isNotEmpty;
    }).toList();
    
    final int disputeTotal = disputeUsers.length;
    String disputeSubtitle = "No active issues";
    if (disputeTotal > 0) {
      String fullName = (disputeUsers.first['name'] ?? 'Unknown').toString().trim();
      String firstName = fullName.split(' ').isNotEmpty ? fullName.split(' ')[0] : 'User';
      disputeSubtitle = "Queue: $firstName";
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        // ✨ FIX: Force exactly 2 columns on mobile/tablet to create the 2x2 Grid!
        int crossAxisCount = constraints.maxWidth > 1200 ? 4 : 2;
        
        // ✨ Adjust aspect ratio so boxes are tall enough to fit the text cleanly on small phones
        double aspectRatio = constraints.maxWidth > 1200 ? 2.8 : (constraints.maxWidth > 500 ? 2.5 : 1.6);

        return GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: crossAxisCount,
          crossAxisSpacing: 12, // slightly tighter spacing for mobile
          mainAxisSpacing: 12,
          childAspectRatio: aspectRatio,
          children: [
            _buildHUDCard(
              title: "Active Subscribers",
              value: "$activeSubs",
              subtitle: "Total: $totalUsers accounts",
              child: SizedBox(
                width: 44, height: 44, // Slightly smaller icon for mobile grid
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    CircularProgressIndicator(value: activeRatio, backgroundColor: const Color(0xFFF1F5F9), color: const Color(0xFF0F172A), strokeWidth: 5),
                    Center(child: Text("$activeSubs", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                  ],
                ),
              ),
            ),
            
            _buildHUDCard(
              title: "Plan Distribution",
              value: "Pro Plans: $proCount",
              subtitle: "Free: $freeCount | Elite: $eliteCount",
              child: Row(
                children: [
                  _buildMiniBar(_safeRatio(freeCount, totalUsers), const Color(0xFF8FFF00)),
                  const SizedBox(width: 4),
                  _buildMiniBar(_safeRatio(proCount, totalUsers), const Color(0xFF0F172A)),
                  const SizedBox(width: 4),
                  _buildMiniBar(_safeRatio(eliteCount, totalUsers), const Color(0xFF64748B)),
                ],
              ),
            ),

            _buildHUDCard(
              title: "Account Health",
              value: "$riskTotal Risk Users",
              subtitle: healthSubtitle,
              child: SizedBox(
                width: 44, height: 44,
                child: CircularProgressIndicator(
                  value: riskTotal > 0 ? (riskRatio < 0.1 ? 0.1 : riskRatio) : 0.0, 
                  backgroundColor: const Color(0xFFF1F5F9), 
                  color: riskTotal > 0 ? Colors.orange : Colors.green, 
                  strokeWidth: 5
                ),
              ),
            ),

            _buildHUDCard(
              title: "Dispute Center",
              value: "$disputeTotal Issues",
              subtitle: disputeSubtitle,
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: disputeTotal > 0 ? Colors.red.shade50 : Colors.green.shade50, shape: BoxShape.circle),
                child: Icon(
                  disputeTotal > 0 ? Icons.warning_amber_rounded : Icons.check_circle_outline, 
                  color: disputeTotal > 0 ? Colors.redAccent : Colors.green, 
                  size: 22
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildHUDCard({required String title, required String value, required String subtitle, required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(12), // ✨ Reduced padding to fit the 2x2 grid comfortably
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [BoxShadow(color: Color(0x02000000), blurRadius: 8, offset: Offset(0, 4))]
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          child,
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(title, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF64748B)), maxLines: 1, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 2),
                Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)), maxLines: 1, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)), maxLines: 1, overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMiniBar(double fill, Color color) {
    double safeFill = fill < 0.1 && fill > 0 ? 0.1 : fill;
    if (fill <= 0) safeFill = 0.05; 

    return Container(
      width: 10, height: 36,
      decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(3)),
      alignment: Alignment.bottomCenter,
      child: FractionallySizedBox(
        heightFactor: safeFill,
        child: Container(decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3))),
      ),
    );
  }
}