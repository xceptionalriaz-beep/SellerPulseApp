import 'package:flutter/material.dart';

class WebhooksTab extends StatelessWidget {
  const WebhooksTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Slack & Discord Webhooks", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
          const SizedBox(height: 4),
          const Text("Get instantly pinged in your team chat when important events happen.", style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
          const SizedBox(height: 24),
          TextField(
            decoration: InputDecoration(
              hintText: "https://discord.com/api/webhooks/...",
              prefixIcon: const Icon(Icons.webhook),
              filled: true, fillColor: const Color(0xFFF8FAFC),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 12, runSpacing: 12,
            children: [
              _buildWebhookToggle("New Upgrades", true),
              _buildWebhookToggle("Cancellations", true),
              _buildWebhookToggle("API Failures", true),
              _buildWebhookToggle("New Free Trials", false),
            ],
          )
        ],
      )
    );
  }

  Widget _buildWebhookToggle(String label, bool isOn) {
    return Container(
      width: 200, padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(border: Border.all(color: const Color(0xFFE2E8F0)), borderRadius: BorderRadius.circular(8)),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween, 
        children: [
          Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)), 
          Transform.scale(
            scale: 0.8, 
            child: Switch(value: isOn, onChanged: (v){}, activeThumbColor: const Color(0xFF0F172A))
          )
        ]
      ),
    );
  }
}