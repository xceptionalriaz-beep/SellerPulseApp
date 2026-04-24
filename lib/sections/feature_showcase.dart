import 'package:flutter/material.dart';

class FeatureShowcase extends StatelessWidget {
  const FeatureShowcase({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 100, horizontal: 20),
      child: Column(
        children: [
          const Text(
            "Everything you need to scale, all in one dashboard.",
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
          ),
          const SizedBox(height: 80),

          // Feature 1: Product Research (Text Left, Image Right)
          _buildFeatureRow(
            isImageLeft: false,
            title: "Find Winning Products in Seconds.",
            description: "Ditch the slow, outdated ZIK analytics. Spot high-demand, low-competition items instantly with our live eBay and AliExpress sync.",
            mockScreenshot: _buildMockScreenshot(Icons.search, "Product Research Tool Active", Colors.blue.shade50),
          ),
          
          const SizedBox(height: 100),

          // Feature 2: Ad Auditor (Image Left, Text Right)
          _buildFeatureRow(
            isImageLeft: true,
            title: "Never Overpay for eBay Ads Again.",
            description: "Our auditor monitors your Any-Click ad spend. If an ad is cannibalizing your organic sales, we alert you immediately so you can pause it.",
            mockScreenshot: _buildMockScreenshot(Icons.warning_amber_rounded, "Warning: Ad Spend at 45%", Colors.orange.shade50),
          ),

          const SizedBox(height: 100),

          // Feature 3: Buyer Shield (Text Left, Image Right)
          _buildFeatureRow(
            isImageLeft: false,
            title: "Block Scammers Before You Ship.",
            description: "Access a crowdsourced database of high-risk buyers. Get instant alerts on serial returners so you can cancel the order and save your inventory.",
            mockScreenshot: _buildMockScreenshot(Icons.gpp_bad, "Alert: High Risk Buyer Blocked", Colors.red.shade50),
          ),
        ],
      ),
    );
  }

  // --- Helpers to make the code clean ---

  // This builds the Zig-Zag rows
  Widget _buildFeatureRow({required bool isImageLeft, required String title, required String description, required Widget mockScreenshot}) {
    // The text half of the row
    Widget textSection = Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFF1E293B), height: 1.2)),
            const SizedBox(height: 20),
            Text(description, style: const TextStyle(fontSize: 18, color: Color(0xFF64748B), height: 1.6)),
          ],
        ),
      ),
    );

    // The image half of the row
    Widget imageSection = Expanded(child: mockScreenshot);

    return Container(
      constraints: const BoxConstraints(maxWidth: 1100),
      child: Row(
        children: isImageLeft 
            ? [imageSection, textSection] 
            : [textSection, imageSection],
      ),
    );
  }

  // This builds a fake "Screenshot" box so your app doesn't crash looking for images
  Widget _buildMockScreenshot(IconData icon, String label, Color bgColor) {
    return Container(
      height: 350,
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade300, width: 2),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, 10))],
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 60, color: Colors.black54),
            const SizedBox(height: 16),
            Text(label, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.black54)),
            const SizedBox(height: 8),
            const Text("(Screenshot Image Goes Here)", style: TextStyle(color: Colors.black38)),
          ],
        ),
      ),
    );
  }
}