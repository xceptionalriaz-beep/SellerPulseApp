import 'package:flutter/material.dart';

class ProblemSection extends StatelessWidget {
  const ProblemSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: const Color(0xFFF8FAFC), // A slight off-white color
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 20),
      child: Column(
        children: [
          const Text(
            "If you are relying on outdated tools...",
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
          ),
          const SizedBox(height: 16),
          const Text(
            "You are losing money to these 3 profit killers:",
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 18, color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 60),
          
          // The 3 Problem Columns
          Container(
            constraints: const BoxConstraints(maxWidth: 1000), // Keeps it looking good on wide screens
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildProblemColumn(
                  "❌", 
                  "Blind Sourcing", 
                  "Guessing what products will sell and wasting money on dead inventory."
                ),
                const SizedBox(width: 40),
                _buildProblemColumn(
                  "💸", 
                  "Ad Fee Traps", 
                  "eBay’s new 'Any-Click' fees eating 40% of your organic profit."
                ),
                const SizedBox(width: 40),
                _buildProblemColumn(
                  "🚨", 
                  "Serial Scammers", 
                  "Buyers who claim 'Item Not Received' and steal your stock."
                ),
              ],
            ),
          )
        ],
      ),
    );
  }

  // Helper widget to build the 3 columns cleanly
  Widget _buildProblemColumn(String emoji, String title, String description) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 48)),
          const SizedBox(height: 20),
          Text(title, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
          const SizedBox(height: 12),
          Text(
            description, 
            textAlign: TextAlign.center, 
            style: const TextStyle(fontSize: 16, color: Color(0xFF64748B), height: 1.5)
          ),
        ],
      ),
    );
  }
}