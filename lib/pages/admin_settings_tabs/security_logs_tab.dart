import 'package:flutter/material.dart';

class SecurityLogsTab extends StatelessWidget {
  final bool isInvestorMode;

  const SecurityLogsTab({
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
    final logs = [
      {"icon": Icons.gpp_bad, "color": Colors.redAccent, "event": "Failed Login (5 Attempts)", "user": "admin@dropkings.com", "ip": "192.168.1.42 (Russia)", "time": "2 mins ago"},
      {"icon": Icons.vpn_key, "color": Colors.orange, "event": "eBay API Key Rotated", "user": "System Admin", "ip": "Internal", "time": "1 hr ago"},
      {"icon": Icons.password, "color": Colors.blue, "event": "Password Reset Requested", "user": "sarah.j@gmail.com", "ip": "104.22.1.9 (USA)", "time": "3 hrs ago"},
    ];

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Security & Audit Logs", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                    SizedBox(height: 4),
                    Text("Monitor suspicious activities, failed logins, and system changes.", style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
                  ]
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.download, size: 16),
                label: const Text("Export Full Database", style: TextStyle(fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, foregroundColor: Colors.white, elevation: 0),
              )
            ]
          ),
          const SizedBox(height: 32),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.red.shade200)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(children: [Icon(Icons.gpp_maybe, color: Colors.redAccent), SizedBox(width: 8), Expanded(child: Text("🚨 Fraud & Password-Sharing Sentinel", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.redAccent), overflow: TextOverflow.ellipsis))]),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text("User ${_obscureText("mike@dropkings.com", isEmail: true)} logged in from New York, London, and Tokyo within 3 hours. Suspected Elite account sharing.", style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A)))
                    ),
                    const SizedBox(width: 16),
                    ElevatedButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.lock, size: 14),
                      label: const Text("Lock Account", style: TextStyle(fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A), foregroundColor: Colors.white, elevation: 0),
                    )
                  ],
                )
              ]
            ),
          ),
          const SizedBox(height: 32),
          const Text("Standard Audit Logs", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
          const SizedBox(height: 16),

          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: logs.map((l) => Container(
                width: 800,
                margin: const EdgeInsets.only(bottom: 12), padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
                child: Row(
                  children: [
                    Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: (l['color'] as Color).withAlpha(20), shape: BoxShape.circle), child: Icon(l['icon'] as IconData, color: l['color'] as Color, size: 20)),
                    const SizedBox(width: 16),
                    Expanded(flex: 2, child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(l['event'] as String, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))), Text(_obscureText(l['user'] as String, isEmail: true), style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)))])),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(_obscureText(l['ip'] as String), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)), const Text("IP Address", style: TextStyle(fontSize: 11, color: Color(0xFF64748B)))])),
                    Text(l['time'] as String, style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
                    const SizedBox(width: 16),
                    if (l['color'] == Colors.redAccent)
                      ElevatedButton(onPressed: (){}, style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, foregroundColor: Colors.white, elevation: 0, padding: const EdgeInsets.symmetric(horizontal: 12)), child: const Text("Block IP", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)))
                    else
                      const SizedBox(width: 85) 
                  ],
                ),
              )).toList(),
            ),
          )
        ],
      )
    );
  }
}