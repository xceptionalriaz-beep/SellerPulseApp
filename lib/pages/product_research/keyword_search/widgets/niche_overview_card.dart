import 'package:flutter/material.dart';

class NicheOverviewCard extends StatelessWidget {
  final String marketVol;
  final String avgPrice;
  final String successRate; 
  final String totalActive;
  final Color successColor;
  final double saturationScore; 
  final String adInsight;

  const NicheOverviewCard({
    super.key,
    this.marketVol = "\$0",
    this.avgPrice = "\$0",
    this.successRate = "0%",
    this.totalActive = "0",
    this.successColor = Colors.grey,
    this.saturationScore = 0.0,
    this.adInsight = "Analyzing...",
  });

  // Helper for rows - shrunk fonts to 11px
  Widget _buildNicheStatRow(IconData icon, String label, String value, {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4.0), 
      child: Row(
        children: [
          Icon(icon, size: 14, color: const Color(0xFF94A3B8)),
          const SizedBox(width: 6),
          Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 11)),
          const Spacer(),
          Text(value, style: TextStyle(
            fontWeight: FontWeight.bold, 
            fontSize: 11, 
            color: valueColor ?? const Color(0xFF1E293B)
          )),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    String strPercentage = successRate;
    String sentimentBadge = "";
    if (successRate.contains(" (")) {
      final parts = successRate.split(" (");
      strPercentage = parts[0];
      sentimentBadge = parts[1].replaceAll(")", ""); 
    }

    Color satColor = Colors.green.shade500;
    if (saturationScore > 75) satColor = Colors.red.shade500;
    else if (saturationScore > 40) satColor = Colors.orange.shade500;

    return Container(
      padding: const EdgeInsets.all(12), // 📉 Tightened from 16 to 12
      decoration: BoxDecoration(
        color: Colors.white, 
        borderRadius: BorderRadius.circular(16), 
        border: Border.all(color: Colors.grey.shade100),
        boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 10, offset: Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("📊 NICHE OVERVIEW", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B), letterSpacing: 1.1, fontSize: 11)),
          const SizedBox(height: 8),
          
          // --- AI SENTIMENT PILL ---
          if (sentimentBadge.isNotEmpty) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 5), 
              decoration: BoxDecoration(
                color: successColor.withAlpha(20), 
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: successColor.withAlpha(80)), 
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    sentimentBadge.contains("BULLISH") ? Icons.rocket_launch : 
                    sentimentBadge.contains("RISK") ? Icons.warning_amber_rounded : Icons.trending_up, 
                    size: 12, color: successColor
                  ),
                  const SizedBox(width: 4),
                  Text(sentimentBadge, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: successColor)),
                ],
              ),
            ),
            const SizedBox(height: 8),
          ],

          // --- CORE STATS ---
          _buildNicheStatRow(Icons.monetization_on_outlined, "Market Vol:", marketVol),
          _buildNicheStatRow(Icons.sell_outlined, "Avg Price:", avgPrice),
          _buildNicheStatRow(Icons.inventory_2_outlined, "Total Active:", totalActive),
          _buildNicheStatRow(Icons.track_changes, "Success (STR):", strPercentage, valueColor: successColor),
          
          const Spacer(), // Pushes competition map to the absolute bottom
          const Divider(color: Color(0xFFF1F5F9), height: 8),

          // --- COMPETITOR SATURATION MAP ---
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text("Competition Density", style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                  Text("${saturationScore.toStringAsFixed(0)}/100", style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: satColor)),
                ],
              ),
              const SizedBox(height: 4),
              
              // Progress Bar using FractionallySizedBox (Cleaner & Less Lines)
              Stack(
                children: [
                  Container(height: 4, width: double.infinity, decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(2))),
                  FractionallySizedBox(
                    widthFactor: (saturationScore / 100).clamp(0.0, 1.0),
                    child: Container(height: 4, decoration: BoxDecoration(color: satColor, borderRadius: BorderRadius.circular(2))),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              
              // Ad Insight - Forced to one line to guarantee no overflow
              Row(
                children: [
                  const Icon(Icons.lightbulb_outline, size: 10, color: Colors.amber),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      adInsight, 
                      style: const TextStyle(fontSize: 8, color: Color(0xFF94A3B8), fontStyle: FontStyle.italic), 
                      maxLines: 1, 
                      overflow: TextOverflow.ellipsis
                    ),
                  ),
                ],
              ),
            ],
          )
        ],
      ),
    );
  }
}