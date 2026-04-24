import 'package:flutter/material.dart';
import '../widgets/animated_cta_button.dart'; // <-- We added your custom button!

class PricingSection extends StatelessWidget {
  const PricingSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: const Color(0xFFF8FAFC), 
      padding: const EdgeInsets.symmetric(vertical: 100, horizontal: 20),
      child: Column(
        children: [
          const Text(
            "Stop overpaying for ZIK Analytics.",
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 40, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
          ),
          const SizedBox(height: 16),
          const Text(
            "Simple pricing. No hidden renewal fees. No \$1 trial gimmicks.",
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 18, color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 60),

          // The 3 Pricing Cards
          Container(
            constraints: const BoxConstraints(maxWidth: 1100), 
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end, 
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // 1. STARTER TIER
                Expanded(
                  child: _buildPricingCard(
                    title: "Starter",
                    price: "\$19",
                    subtitle: "Cancel ZIK. Start here.",
                    features: ["Unlimited Product Research", "Manual Scammer Checks", "Basic Ad Auditor", "Standard Support"],
                    isHighlighted: false,
                    badgeText: "",
                  ),
                ),
                const SizedBox(width: 24),
                
                // 2. PRO TIER (The Zik-Killer)
                Expanded(
                  child: _buildPricingCard(
                    title: "Pro",
                    price: "\$29",
                    subtitle: "Half the price of ZIK Pro+.",
                    features: ["Unlimited Product Research", "Auto-Block Scammers", "Live Ad Fee Alerts", "Competitor Tracking", "Priority Support"],
                    isHighlighted: true, 
                    badgeText: "BEST VALUE",
                  ),
                ),
                const SizedBox(width: 24),
                
                // 3. ELITE TIER
                Expanded(
                  child: _buildPricingCard(
                    title: "Elite",
                    price: "\$59",
                    subtitle: "For multi-store dropshippers.",
                    features: ["Everything in Pro", "Connect 3 eBay Accounts", "Wholesale Supplier DB", "AutoDS & Shopify Sync", "24/7 VIP Support"],
                    isHighlighted: false,
                    badgeText: "POWER SELLER",
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }

  // --- Helper Widget to build the cards ---
  Widget _buildPricingCard({
    required String title,
    required String price,
    required String subtitle,
    required List<String> features,
    required bool isHighlighted,
    required String badgeText,
  }) {
    final bgColor = isHighlighted ? const Color(0xFF1E293B) : Colors.white;
    final textColor = isHighlighted ? Colors.white : const Color(0xFF1E293B);
    final subtitleColor = isHighlighted ? Colors.blue.shade200 : const Color(0xFF64748B);
    final borderColor = isHighlighted ? Colors.transparent : Colors.grey.shade300;

    return Container(
      padding: const EdgeInsets.all(40),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor, width: 2),
        boxShadow: isHighlighted 
            ? [BoxShadow(color: Colors.blue.withOpacity(0.2), blurRadius: 30, offset: const Offset(0, 15))] 
            : [],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (badgeText.isNotEmpty)
            Container(
              margin: const EdgeInsets.only(bottom: 20),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: isHighlighted ? const Color(0xFF2563EB) : Colors.green.shade100, 
                borderRadius: BorderRadius.circular(20)
              ),
              child: Text(
                badgeText, 
                style: TextStyle(
                  color: isHighlighted ? Colors.white : Colors.green.shade800, 
                  fontSize: 12, 
                  fontWeight: FontWeight.bold
                )
              ),
            ),
          Text(title, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: textColor)),
          const SizedBox(height: 10),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(price, style: TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: textColor)),
              Text("/mo", style: TextStyle(fontSize: 18, color: subtitleColor)),
            ],
          ),
          const SizedBox(height: 10),
          Text(subtitle, style: TextStyle(fontSize: 16, color: subtitleColor)),
          const SizedBox(height: 30),
          
          ...features.map((feature) => Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Row(
              children: [
                Icon(Icons.check_circle, color: isHighlighted ? const Color(0xFF2563EB) : Colors.green, size: 20),
                const SizedBox(width: 12),
                Expanded(child: Text(feature, style: TextStyle(color: textColor, fontSize: 16))),
              ],
            ),
          )),
          
          const SizedBox(height: 40),
          
          // --- ✨ YOUR NEW ANIMATED BUTTON IS HERE ✨ ---
          SizedBox(
            width: double.infinity,
            child: AnimatedCtaButton(
              text: "Start Free 7-Day Trial",
              isSmall: true, 
              onPressed: () {},
            ),
          ),
          // ----------------------------------------------
          
          const SizedBox(height: 12),
          const Center(
            child: Text("No credit card required.", style: TextStyle(color: Colors.grey, fontSize: 12)),
          )
        ],
      ),
    );
  }
}