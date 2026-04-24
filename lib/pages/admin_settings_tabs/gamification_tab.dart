import 'package:flutter/material.dart';
// ✨ IMPORT: Make sure this path matches where you saved the master widget!
import '../../widgets/responsive_action_header.dart';

class GamificationTab extends StatelessWidget {
  const GamificationTab({super.key});

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
          // ✨ UPGRADED: Replaced Row, Expanded, and subtitle Text with one clean widget
          ResponsiveActionHeader(
            title: "User Gamification & Quests",
            subtitle: "Increase trial conversions by making your software addictive through rewards.",
            actionButton: ElevatedButton.icon(
              onPressed: () {}, 
              icon: const Icon(Icons.add, size: 16), 
              label: const Text("New Quest"), 
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0F172A), 
                foregroundColor: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 24),
          _buildQuestCard("Quest 1: Run your first product search", "Reward: Unlock 3 free days of Elite!", true),
          _buildQuestCard("Quest 2: Connect your eBay Store", "Reward: Free 1-on-1 Strategy Call", true),
          _buildQuestCard("Quest 3: Find 5 Profitable Items", "Reward: Unlock Secret Suppliers List", false),
        ],
      ),
    );
  }

  Widget _buildQuestCard(String title, String reward, bool isActive) {
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
            Icons.emoji_events, 
            color: isActive ? const Color(0xFF8FFF00) : const Color(0xFF94A3B8), 
            size: 28,
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
                  reward, 
                  style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          Switch(
            value: isActive, 
            onChanged: (v) {}, 
            activeThumbColor: const Color(0xFF8FFF00), 
            activeTrackColor: const Color(0xFF0F172A),
          ),
        ],
      ),
    );
  }
}