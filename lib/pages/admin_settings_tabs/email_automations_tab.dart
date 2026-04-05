import 'package:flutter/material.dart';
// ✨ IMPORT: Linking to your master responsive widget
import '../../widgets/responsive_action_header.dart';

class EmailAutomationsTab extends StatelessWidget {
  const EmailAutomationsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white, 
        borderRadius: BorderRadius.circular(16), 
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ✨ UPGRADED: Using the Master Widget to handle the header and button logic
          ResponsiveActionHeader(
            title: "Drip Campaigns & Email Automations",
            subtitle: "Manage your automated customer journey and recovery sequences.",
            actionButton: ElevatedButton.icon(
              onPressed: () {}, 
              icon: const Icon(Icons.add, size: 16), 
              label: const Text("New Flow"), 
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0F172A), 
                foregroundColor: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 24),
          _buildEmailFlowCard("Onboarding Sequence", "Trigger: New Signup", "3 Emails over 7 Days", "68% Open Rate", true),
          _buildEmailFlowCard("Failed Payment Rescue", "Trigger: Stripe Decline", "2 Emails over 3 Days", "42% Recovery Rate", true),
          _buildEmailFlowCard("Inactive User Nudge", "Trigger: 14 Days Offline", "1 Email", "0% Open Rate", false),
        ],
      ),
    );
  }

  Widget _buildEmailFlowCard(String title, String trigger, String emails, String stats, bool isActive) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12), 
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC), 
        borderRadius: BorderRadius.circular(12), 
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Icon(
            Icons.forward_to_inbox, 
            color: isActive ? const Color(0xFF16A34A) : const Color(0xFF94A3B8),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start, 
              children: [
                Text(
                  title, 
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A)),
                ), 
                Text(
                  "$trigger • $emails", 
                  style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end, 
            children: [
              Text(
                stats, 
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
              ), 
              Switch(
                value: isActive, 
                onChanged: (v) {}, 
                activeThumbColor: const Color(0xFF8FFF00), 
                activeTrackColor: const Color(0xFF0F172A),
              ),
            ],
          ),
        ],
      ),
    );
  }
}