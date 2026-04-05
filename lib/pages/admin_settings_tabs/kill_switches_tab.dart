import 'package:flutter/material.dart';

class KillSwitchesTab extends StatelessWidget {
  const KillSwitchesTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.red.shade200), boxShadow: [BoxShadow(color: Colors.red.withAlpha(10), blurRadius: 20)]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.warning_rounded, color: Colors.redAccent), 
              SizedBox(width: 8), 
              Expanded(child: Text("Global Kill Switches (Emergencies Only)", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)), overflow: TextOverflow.ellipsis))
            ]
          ),
          const SizedBox(height: 4),
          const Text("Instantly disable specific platform features if an external API goes down.", style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
          const SizedBox(height: 24),
          _buildToggleCard("eBay Product Research Tool", "Disables the fetch bar and product scraping.", true),
          const SizedBox(height: 12),
          _buildToggleCard("VeRO Brand Scanner", "Disables checking against the VeRO dictionary.", true),
          const SizedBox(height: 12),
          _buildToggleCard("Amazon FBA Calculator", "Disables Amazon API estimates.", false, isOffline: true),
        ],
      )
    );
  }

  Widget _buildToggleCard(String title, String desc, bool isActive, {bool isOffline = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(color: isOffline ? const Color(0xFFFEF2F2) : const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12), border: Border.all(color: isOffline ? Colors.red.shade200 : const Color(0xFFE2E8F0))),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                  Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: isOffline ? Colors.redAccent : const Color(0xFF0F172A))),
                  if (isOffline) ...[
                    const SizedBox(width: 8), 
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), 
                      decoration: BoxDecoration(color: Colors.redAccent, borderRadius: BorderRadius.circular(4)), 
                      child: const Text("OFFLINE", style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold))
                    )
                  ]
                ]),
                const SizedBox(height: 4),
                Text(desc, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
              ],
            ),
          ),
          Switch(
            value: isActive,
            onChanged: (val) {},
            activeThumbColor: const Color(0xFF8FFF00),
            activeTrackColor: const Color(0xFF0F172A),
            inactiveThumbColor: Colors.white,
            inactiveTrackColor: Colors.redAccent.withAlpha(150),
          )
        ],
      ),
    );
  }
}