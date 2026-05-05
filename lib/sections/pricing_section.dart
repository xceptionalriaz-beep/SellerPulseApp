import 'package:flutter/material.dart';
import '../widgets/animated_cta_button.dart';

class PricingSection extends StatelessWidget {
  const PricingSection({super.key});

  @override
  Widget build(BuildContext context) {
    final bool isDesktop = MediaQuery.of(context).size.width > 900;

    return Container(
      width: double.infinity,
      color: const Color(0xFFF9F8F6),
      padding: EdgeInsets.symmetric(
        vertical: 96,
        horizontal: isDesktop ? 60 : 20,
      ),
      child: Column(
        children: [
          // ── LABEL ──────────────────────────────────────────
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFFE8F2EC),
              borderRadius: BorderRadius.circular(50),
            ),
            child: const Text(
              "PRICING",
              style: TextStyle(
                color: Color(0xFF2E6B3E),
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.5,
              ),
            ),
          ),

          const SizedBox(height: 20),

          const Text(
            "Stop overpaying for ZIK Analytics.",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 40,
              fontWeight: FontWeight.w800,
              color: Color(0xFF111827),
              height: 1.15,
              letterSpacing: -0.8,
            ),
          ),

          const SizedBox(height: 14),

          const Text(
            "Simple pricing. No hidden renewal fees.\nNo \$1 trial gimmicks.",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 17,
              color: Color(0xFF6B7280),
              height: 1.6,
            ),
          ),

          const SizedBox(height: 16),

          // ZIK comparison pill
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(50),
              border: Border.all(color: const Color(0xFFE5E7EB)),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.bolt_rounded,
                    size: 16, color: Color(0xFF2E6B3E)),
                SizedBox(width: 6),
                Text(
                  "Up to 60% cheaper than ZIK Analytics Pro+",
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF374151),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 56),

          // ── PRICING CARDS ──────────────────────────────────
          Container(
            constraints: const BoxConstraints(maxWidth: 1100),
            child: isDesktop
                ? Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Expanded(
                        child: _PricingCard(
                          title: "Starter",
                          price: "\$19",
                          subtitle: "Cancel ZIK. Start here.",
                          features: [
                            "Unlimited Product Research",
                            "Manual Scammer Checks",
                            "Basic Ad Auditor",
                            "eBay & AliExpress Sync",
                            "Standard Support",
                          ],
                          isHighlighted: false,
                          badge: "",
                        ),
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        child: _PricingCard(
                          title: "Pro",
                          price: "\$29",
                          subtitle: "Half the price of ZIK Pro+.",
                          features: [
                            "Unlimited Product Research",
                            "Auto-Block Scammers",
                            "Live Ad Fee Alerts",
                            "Competitor Tracking",
                            "Shopify Integration",
                            "Priority Support",
                          ],
                          isHighlighted: true,
                          badge: "BEST VALUE",
                        ),
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        child: _PricingCard(
                          title: "Elite",
                          price: "\$59",
                          subtitle: "For multi-store dropshippers.",
                          features: [
                            "Everything in Pro",
                            "Connect 3 eBay Accounts",
                            "Wholesale Supplier DB",
                            "AutoDS & Shopify Sync",
                            "Advanced Analytics",
                            "24/7 VIP Support",
                          ],
                          isHighlighted: false,
                          badge: "POWER SELLER",
                        ),
                      ),
                    ],
                  )
                : Column(
                    children: [
                      _PricingCard(
                        title: "Starter",
                        price: "\$19",
                        subtitle: "Cancel ZIK. Start here.",
                        features: [
                          "Unlimited Product Research",
                          "Manual Scammer Checks",
                          "Basic Ad Auditor",
                          "Standard Support",
                        ],
                        isHighlighted: false,
                        badge: "",
                      ),
                      const SizedBox(height: 20),
                      _PricingCard(
                        title: "Pro",
                        price: "\$29",
                        subtitle: "Half the price of ZIK Pro+.",
                        features: [
                          "Everything in Starter",
                          "Auto-Block Scammers",
                          "Live Ad Fee Alerts",
                          "Competitor Tracking",
                          "Priority Support",
                        ],
                        isHighlighted: true,
                        badge: "BEST VALUE",
                      ),
                      const SizedBox(height: 20),
                      _PricingCard(
                        title: "Elite",
                        price: "\$59",
                        subtitle: "For multi-store dropshippers.",
                        features: [
                          "Everything in Pro",
                          "3 eBay Accounts",
                          "Wholesale Supplier DB",
                          "AutoDS & Shopify Sync",
                          "24/7 VIP Support",
                        ],
                        isHighlighted: false,
                        badge: "POWER SELLER",
                      ),
                    ],
                  ),
          ),

          const SizedBox(height: 48),

          // ── BOTTOM TRUST ROW ───────────────────────────────
          Wrap(
            alignment: WrapAlignment.center,
            spacing: 32,
            runSpacing: 16,
            children: [
              _TrustItem(Icons.lock_outline_rounded, "256-bit SSL Secure"),
              _TrustItem(Icons.cancel_outlined, "Cancel anytime"),
              _TrustItem(
                  Icons.credit_card_off_outlined, "No credit card needed"),
              _TrustItem(Icons.support_agent_outlined, "7-day free trial"),
            ],
          ),
        ],
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════
// PRICING CARD
// ════════════════════════════════════════════════════════════
class _PricingCard extends StatelessWidget {
  final String title;
  final String price;
  final String subtitle;
  final List<String> features;
  final bool isHighlighted;
  final String badge;

  const _PricingCard({
    required this.title,
    required this.price,
    required this.subtitle,
    required this.features,
    required this.isHighlighted,
    required this.badge,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: isHighlighted ? const Color(0xFF111827) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isHighlighted
              ? Colors.transparent
              : const Color(0xFFE5E7EB),
          width: 1.5,
        ),
        boxShadow: isHighlighted
            ? [
                const BoxShadow(
                  color: Color(0x33000000),
                  blurRadius: 40,
                  offset: Offset(0, 20),
                )
              ]
            : [],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Badge
          if (badge.isNotEmpty)
            Container(
              margin: const EdgeInsets.only(bottom: 18),
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
              decoration: BoxDecoration(
                color: isHighlighted
                    ? const Color(0xFF8FFF00)
                    : const Color(0xFFE8F2EC),
                borderRadius: BorderRadius.circular(50),
              ),
              child: Text(
                badge,
                style: TextStyle(
                  color: isHighlighted
                      ? const Color(0xFF111827)
                      : const Color(0xFF2E6B3E),
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.2,
                ),
              ),
            ),

          // Plan name
          Text(
            title,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: isHighlighted ? Colors.white : const Color(0xFF111827),
            ),
          ),

          const SizedBox(height: 14),

          // Price
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                price,
                style: TextStyle(
                  fontSize: 48,
                  fontWeight: FontWeight.w800,
                  color:
                      isHighlighted ? Colors.white : const Color(0xFF111827),
                  letterSpacing: -1,
                ),
              ),
              Text(
                " /mo",
                style: TextStyle(
                  fontSize: 16,
                  color: isHighlighted
                      ? Colors.white54
                      : const Color(0xFF9CA3AF),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),

          Text(
            subtitle,
            style: TextStyle(
              fontSize: 14,
              color: isHighlighted
                  ? const Color(0xFF9CA3AF)
                  : const Color(0xFF6B7280),
              height: 1.5,
            ),
          ),

          const SizedBox(height: 28),

          // Divider
          Divider(
            color: isHighlighted
                ? const Color(0xFF1F2937)
                : const Color(0xFFF3F4F6),
            height: 1,
          ),

          const SizedBox(height: 24),

          // Features
          ...features.map(
            (f) => Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 20,
                    height: 20,
                    decoration: BoxDecoration(
                      color: isHighlighted
                          ? const Color(0xFF1F2937)
                          : const Color(0xFFE8F2EC),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.check_rounded,
                      size: 12,
                      color: isHighlighted
                          ? const Color(0xFF8FFF00)
                          : const Color(0xFF2E6B3E),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      f,
                      style: TextStyle(
                        fontSize: 14.5,
                        color: isHighlighted
                            ? const Color(0xFFD1D5DB)
                            : const Color(0xFF374151),
                        height: 1.4,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 32),

          // CTA
          SizedBox(
            width: double.infinity,
            child: AnimatedCtaButton(
              text: "Start Free 7-Day Trial",
              isSmall: true,
              onPressed: () {},
            ),
          ),

          const SizedBox(height: 10),

          Center(
            child: Text(
              "No credit card required.",
              style: TextStyle(
                fontSize: 12,
                color: isHighlighted
                    ? const Color(0xFF6B7280)
                    : const Color(0xFF9CA3AF),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════
// TRUST ITEM
// ════════════════════════════════════════════════════════════
class _TrustItem extends StatelessWidget {
  final IconData icon;
  final String label;
  const _TrustItem(this.icon, this.label);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: const Color(0xFF9CA3AF)),
        const SizedBox(width: 7),
        Text(
          label,
          style: const TextStyle(
            fontSize: 13.5,
            color: Color(0xFF6B7280),
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}