import 'package:flutter/material.dart';

class ChromeExtensionTab extends StatelessWidget {
  const ChromeExtensionTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Chrome Extension Control Center", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
          const SizedBox(height: 4),
          const Text("Manage live browser extensions, OTA updates, and user alerts.", style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
          const SizedBox(height: 24),
          
          Row(
            children: [
              Expanded(child: _buildExtensionStatCard("Active Installs", "12,405", "+342 this week")),
              const SizedBox(width: 16),
              Expanded(child: _buildExtensionStatCard("Daily Active Users", "4,200", "34% engagement")),
              const SizedBox(width: 16),
              Expanded(child: _buildExtensionStatCard("Current Version", "v2.4.1", "Approved by Google")),
            ],
          ),
          const SizedBox(height: 32),
          
          Row(
            crossAxisAlignment: CrossAxisAlignment.start, // ✨ SAFEGUARD: Prevents layout stretching
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("Push Over-The-Air Update", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      const SizedBox(height: 12),
                      TextField(maxLines: 2, decoration: InputDecoration(hintText: "Release notes...", filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)))),
                      const SizedBox(height: 12),
                      ElevatedButton.icon(onPressed: (){}, icon: const Icon(Icons.system_update_alt), label: const Text("Push to Clients"), style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A), foregroundColor: Colors.white)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.red.shade200)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("Broadcast Extension Warning", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.redAccent)),
                      const SizedBox(height: 12),
                      TextField(maxLines: 2, decoration: InputDecoration(hintText: "Warning message...", filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)))),
                      const SizedBox(height: 12),
                      ElevatedButton.icon(onPressed: (){}, icon: const Icon(Icons.warning_amber_rounded), label: const Text("Alert All Users"), style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, foregroundColor: Colors.white, elevation: 0)),
                    ],
                  ),
                ),
              )
            ],
          )
        ],
      )
    );
  }

  Widget _buildExtensionStatCard(String title, String value, String subtitle) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
          const SizedBox(height: 4),
          Text(subtitle, style: const TextStyle(fontSize: 11, color: Color(0xFF16A34A), fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}