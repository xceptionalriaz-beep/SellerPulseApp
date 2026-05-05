import 'package:flutter/material.dart';
import '../widgets/animated_cta_button.dart';

// ─── Reusable fade+slide animation widget ────────────────────
class _FadeSlideIn extends StatefulWidget {
  final Widget child;
  final Duration delay;
  const _FadeSlideIn({required this.child, this.delay = Duration.zero});

  @override
  State<_FadeSlideIn> createState() => _FadeSlideInState();
}

class _FadeSlideInState extends State<_FadeSlideIn>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _opacity;
  late Animation<Offset> _slide;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 650));
    _opacity = Tween<double>(begin: 0, end: 1)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));
    _slide =
        Tween<Offset>(begin: const Offset(0, 0.1), end: Offset.zero)
            .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));
    Future.delayed(widget.delay, () {
      if (mounted) _ctrl.forward();
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _opacity,
      child: SlideTransition(position: _slide, child: widget.child),
    );
  }
}

// ─── Pricing Section ──────────────────────────────────────────
class PricingSection extends StatelessWidget {
  const PricingSection({super.key});

  @override
  Widget build(BuildContext context) {
    final bool isDesktop = MediaQuery.of(context).size.width > 900;

    return Container(
      width: double.infinity,
      color: const Color(0xFFF9F8F6),
      padding: EdgeInsets.symmetric(
        vertical: 80,
        horizontal: isDesktop ? 60 : 20,
      ),
      child: Column(
        children: [
          // Label
          _FadeSlideIn(
            delay: const Duration(milliseconds: 100),
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
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
          ),

          const SizedBox(height: 18),

          _FadeSlideIn(
            delay: const Duration(milliseconds: 200),
            child: Text(
              "Stop overpaying for ZIK Analytics.",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: isDesktop ? 38 : 26,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF111827),
                height: 1.15,
                letterSpacing: -0.5,
              ),
            ),
          ),

          const SizedBox(height: 12),

          _FadeSlideIn(
            delay: const Duration(milliseconds: 280),
            child: const Text(
              "Simple pricing. No hidden renewal fees. No \$1 trial gimmicks.",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 15,
                color: Color(0xFF6B7280),
                height: 1.6,
              ),
            ),
          ),

          const SizedBox(height: 16),

          _FadeSlideIn(
            delay: const Duration(milliseconds: 340),
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(50),
                border: Border.all(color: const Color(0xFFE5E7EB)),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.bolt_rounded,
                      size: 15, color: Color(0xFF2E6B3E)),
                  SizedBox(width: 6),
                  Flexible(
                    child: Text(
                      "Up to 60% cheaper than ZIK Analytics Pro+",
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF374151),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 48),

          // ── CARDS ─────────────────────────────────────────
          LayoutBuilder(builder: (ctx, constraints) {
            final useRow = constraints.maxWidth > 800;
            if (useRow) {
              return IntrinsicHeight(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Expanded(
                      child: _FadeSlideIn(
                        delay: const Duration(milliseconds: 200),
                        child: _PricingCard(
                          title: "Starter",
                          price: "\$19",
                          subtitle: "Cancel ZIK. Start here.",
                          features: const [
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
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _FadeSlideIn(
                        delay: const Duration(milliseconds: 330),
                        child: _PricingCard(
                          title: "Pro",
                          price: "\$29",
                          subtitle: "Half the price of ZIK Pro+.",
                          features: const [
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
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _FadeSlideIn(
                        delay: const Duration(milliseconds: 460),
                        child: _PricingCard(
                          title: "Elite",
                          price: "\$59",
                          subtitle: "For multi-store dropshippers.",
                          features: const [
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
                    ),
                  ],
                ),
              );
            } else {
              return Column(
                children: [
                  _FadeSlideIn(
                    delay: const Duration(milliseconds: 200),
                    child: _PricingCard(
                      title: "Starter",
                      price: "\$19",
                      subtitle: "Cancel ZIK. Start here.",
                      features: const [
                        "Unlimited Product Research",
                        "Manual Scammer Checks",
                        "Basic Ad Auditor",
                        "Standard Support",
                      ],
                      isHighlighted: false,
                      badge: "",
                    ),
                  ),
                  const SizedBox(height: 16),
                  _FadeSlideIn(
                    delay: const Duration(milliseconds: 300),
                    child: _PricingCard(
                      title: "Pro",
                      price: "\$29",
                      subtitle: "Half the price of ZIK Pro+.",
                      features: const [
                        "Everything in Starter",
                        "Auto-Block Scammers",
                        "Live Ad Fee Alerts",
                        "Competitor Tracking",
                        "Priority Support",
                      ],
                      isHighlighted: true,
                      badge: "BEST VALUE",
                    ),
                  ),
                  const SizedBox(height: 16),
                  _FadeSlideIn(
                    delay: const Duration(milliseconds: 400),
                    child: _PricingCard(
                      title: "Elite",
                      price: "\$59",
                      subtitle: "For multi-store dropshippers.",
                      features: const [
                        "Everything in Pro",
                        "3 eBay Accounts",
                        "Wholesale Supplier DB",
                        "AutoDS & Shopify Sync",
                        "24/7 VIP Support",
                      ],
                      isHighlighted: false,
                      badge: "POWER SELLER",
                    ),
                  ),
                ],
              );
            }
          }),

          const SizedBox(height: 40),

          // Trust row
          _FadeSlideIn(
            delay: const Duration(milliseconds: 500),
            child: Wrap(
              alignment: WrapAlignment.center,
              spacing: 28,
              runSpacing: 14,
              children: const [
                _TrustItem(Icons.lock_outline_rounded, "256-bit SSL"),
                _TrustItem(Icons.cancel_outlined, "Cancel anytime"),
                _TrustItem(Icons.credit_card_off_outlined,
                    "No credit card needed"),
                _TrustItem(
                    Icons.support_agent_outlined, "7-day free trial"),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Pricing Card ─────────────────────────────────────────────
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
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: isHighlighted ? const Color(0xFF111827) : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isHighlighted
              ? Colors.transparent
              : const Color(0xFFE5E7EB),
          width: 1.5,
        ),
        boxShadow: isHighlighted
            ? [
                const BoxShadow(
                  color: Color(0x2A000000),
                  blurRadius: 40,
                  offset: Offset(0, 16),
                )
              ]
            : [],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (badge.isNotEmpty)
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
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
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.1,
                ),
              ),
            ),

          Text(
            title,
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: isHighlighted ? Colors.white : const Color(0xFF111827),
            ),
          ),

          const SizedBox(height: 12),

          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                price,
                style: TextStyle(
                  fontSize: 44,
                  fontWeight: FontWeight.w800,
                  color: isHighlighted
                      ? Colors.white
                      : const Color(0xFF111827),
                  letterSpacing: -1,
                ),
              ),
              Text(
                " /mo",
                style: TextStyle(
                  fontSize: 14,
                  color: isHighlighted
                      ? Colors.white54
                      : const Color(0xFF9CA3AF),
                ),
              ),
            ],
          ),

          const SizedBox(height: 6),

          Text(
            subtitle,
            style: TextStyle(
              fontSize: 13,
              color: isHighlighted
                  ? const Color(0xFF9CA3AF)
                  : const Color(0xFF6B7280),
              height: 1.4,
            ),
          ),

          const SizedBox(height: 22),

          Divider(
            color: isHighlighted
                ? const Color(0xFF1F2937)
                : const Color(0xFFF3F4F6),
            height: 1,
          ),

          const SizedBox(height: 20),

          ...features.map((f) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(top: 3),
                      width: 18,
                      height: 18,
                      decoration: BoxDecoration(
                        color: isHighlighted
                            ? const Color(0xFF1F2937)
                            : const Color(0xFFE8F2EC),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.check_rounded,
                        size: 11,
                        color: isHighlighted
                            ? const Color(0xFF8FFF00)
                            : const Color(0xFF2E6B3E),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        f,
                        style: TextStyle(
                          fontSize: 13.5,
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
              )),

          const SizedBox(height: 24),

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
                fontSize: 11,
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

// ─── Trust Item ───────────────────────────────────────────────
class _TrustItem extends StatelessWidget {
  final IconData icon;
  final String label;
  const _TrustItem(this.icon, this.label);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 15, color: const Color(0xFF9CA3AF)),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(
            fontSize: 13,
            color: Color(0xFF6B7280),
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}