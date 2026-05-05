import 'package:flutter/material.dart';
import '../widgets/animated_cta_button.dart';

// ─── Fade+Slide animation ─────────────────────────────────────
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
    _slide = Tween<Offset>(begin: const Offset(0, 0.08), end: Offset.zero)
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
  Widget build(BuildContext context) => FadeTransition(
      opacity: _opacity,
      child: SlideTransition(position: _slide, child: widget.child));
}

// ─── Main Section ─────────────────────────────────────────────
class PricingSection extends StatelessWidget {
  const PricingSection({super.key});

  @override
  Widget build(BuildContext context) {
    final bool isDesktop = MediaQuery.of(context).size.width > 900;

    return Container(
      width: double.infinity,
      color: const Color(0xFFF6F7F9),
      padding: EdgeInsets.symmetric(
        vertical: 80,
        horizontal: isDesktop ? 48 : 20,
      ),
      child: Column(
        children: [
          // ── HEADER ─────────────────────────────────────
          _FadeSlideIn(
            delay: const Duration(milliseconds: 80),
            child: Text(
              "Simple, transparent pricing",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: isDesktop ? 36 : 26,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF111827),
                letterSpacing: -0.6,
              ),
            ),
          ),

          const SizedBox(height: 10),

          _FadeSlideIn(
            delay: const Duration(milliseconds: 160),
            child: const Text(
              "Start free. Upgrade when you're ready. Cancel anytime.",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: Color(0xFF6B7280),
                height: 1.5,
              ),
            ),
          ),

          const SizedBox(height: 48),

          // ── CARDS ──────────────────────────────────────
          LayoutBuilder(builder: (ctx, constraints) {
            final useRow = constraints.maxWidth > 800;

            final cards = [
              _FadeSlideIn(
                delay: const Duration(milliseconds: 150),
                child: _PricingCard(
                  title: "Starter",
                  tagline: "Perfect for new eBay sellers.",
                  originalPrice: null,
                  price: "\$19",
                  period: "per month",
                  ctaLabel: "Get Starter",
                  ctaColor: const Color(0xFF374151),
                  isRecommended: false,
                  features: const [
                    "Unlimited Product Research",
                    "Manual Scammer Checks",
                    "Basic Ad Auditor",
                    "eBay & AliExpress Sync",
                    "Standard Support",
                  ],
                  featuresHeader: "Key features:",
                ),
              ),
              _FadeSlideIn(
                delay: const Duration(milliseconds: 260),
                child: _PricingCard(
                  title: "Pro",
                  tagline: "For sellers ready to scale faster.",
                  originalPrice: "\$49",
                  price: "\$29",
                  period: "per month",
                  ctaLabel: "Get Pro",
                  ctaColor: const Color(0xFF2563EB),
                  isRecommended: true,
                  features: const [
                    "Everything in Starter, plus:",
                    "Auto-Block Scammers",
                    "Live Ad Fee Alerts",
                    "Competitor Tracking",
                    "Shopify Integration",
                    "Priority Support",
                  ],
                  featuresHeader: "Everything in Starter, plus:",
                ),
              ),
              _FadeSlideIn(
                delay: const Duration(milliseconds: 370),
                child: _PricingCard(
                  title: "Elite",
                  tagline: "Built for multi-store power sellers.",
                  originalPrice: "\$99",
                  price: "\$59",
                  period: "per month",
                  ctaLabel: "Get Elite",
                  ctaColor: const Color(0xFF7C3AED),
                  isRecommended: false,
                  features: const [
                    "Connect 3 eBay Accounts",
                    "Wholesale Supplier Database",
                    "AutoDS & Shopify Sync",
                    "Advanced Analytics Dashboard",
                    "24/7 VIP Support",
                  ],
                  featuresHeader: "Everything in Pro, plus:",
                ),
              ),
            ];

            if (useRow) {
              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(child: cards[0]),
                  const SizedBox(width: 16),
                  Expanded(child: cards[1]),
                  const SizedBox(width: 16),
                  Expanded(child: cards[2]),
                ],
              );
            } else {
              return Column(
                children: [
                  cards[0],
                  const SizedBox(height: 16),
                  cards[1],
                  const SizedBox(height: 16),
                  cards[2],
                ],
              );
            }
          }),

          const SizedBox(height: 36),

          // ── COMPARE LINK ───────────────────────────────
          _FadeSlideIn(
            delay: const Duration(milliseconds: 480),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                TextButton(
                  onPressed: () {},
                  child: const Text(
                    "Compare all features",
                    style: TextStyle(
                      color: Color(0xFF6B7280),
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      decoration: TextDecoration.underline,
                      decorationColor: Color(0xFF6B7280),
                    ),
                  ),
                ),
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
  final String tagline;
  final String? originalPrice;
  final String price;
  final String period;
  final String ctaLabel;
  final Color ctaColor;
  final bool isRecommended;
  final List<String> features;
  final String featuresHeader;

  const _PricingCard({
    required this.title,
    required this.tagline,
    required this.originalPrice,
    required this.price,
    required this.period,
    required this.ctaLabel,
    required this.ctaColor,
    required this.isRecommended,
    required this.features,
    required this.featuresHeader,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // ── RECOMMENDED BADGE (sits above card) ──────────
        if (isRecommended)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 8),
            decoration: BoxDecoration(
              color: ctaColor,
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: const Center(
              child: Text(
                "Recommended",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.2,
                ),
              ),
            ),
          )
        else
          // Invisible spacer to keep card tops aligned
          const SizedBox(height: 37),

        // ── CARD BODY ────────────────────────────────────
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(28),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(isRecommended ? 0 : 16),
              topRight: Radius.circular(isRecommended ? 0 : 16),
              bottomLeft: const Radius.circular(16),
              bottomRight: const Radius.circular(16),
            ),
            border: Border.all(
              color: isRecommended
                  ? ctaColor
                  : const Color(0xFFE5E7EB),
              width: isRecommended ? 2 : 1.5,
            ),
            boxShadow: isRecommended
                ? [
                    BoxShadow(
                      color: ctaColor.withOpacity(0.12),
                      blurRadius: 32,
                      offset: const Offset(0, 8),
                    ),
                  ]
                : [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Title
              Text(
                title,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF111827),
                  letterSpacing: -0.3,
                ),
              ),

              const SizedBox(height: 6),

              // Tagline
              Text(
                tagline,
                style: const TextStyle(
                  fontSize: 13.5,
                  color: Color(0xFF6B7280),
                  height: 1.5,
                ),
              ),

              const SizedBox(height: 20),

              // Price row
              if (originalPrice != null)
                Text(
                  originalPrice!,
                  style: const TextStyle(
                    fontSize: 18,
                    color: Color(0xFFB0B7C3),
                    fontWeight: FontWeight.w600,
                    decoration: TextDecoration.lineThrough,
                    decorationColor: Color(0xFFB0B7C3),
                    decorationThickness: 2,
                  ),
                ),

              if (originalPrice != null) const SizedBox(height: 2),

              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    price,
                    style: const TextStyle(
                      fontSize: 48,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF111827),
                      letterSpacing: -2,
                      height: 1.0,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 4),

              Text(
                period,
                style: const TextStyle(
                  fontSize: 13,
                  color: Color(0xFF9CA3AF),
                  fontWeight: FontWeight.w500,
                ),
              ),

              const SizedBox(height: 24),

              // CTA button
              SizedBox(
                width: double.infinity,
                height: 46,
                child: ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ctaColor,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    textStyle: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  child: Text(ctaLabel),
                ),
              ),

              const SizedBox(height: 10),

              // Free trial link
              Center(
                child: GestureDetector(
                  onTap: () {},
                  child: RichText(
                    text: TextSpan(
                      text: "or ",
                      style: const TextStyle(
                        fontSize: 13,
                        color: Color(0xFF9CA3AF),
                      ),
                      children: [
                        TextSpan(
                          text: "start free trial",
                          style: TextStyle(
                            fontSize: 13,
                            color: ctaColor,
                            fontWeight: FontWeight.w600,
                            decoration: TextDecoration.underline,
                            decorationColor: ctaColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 28),

              // Divider
              const Divider(color: Color(0xFFF3F4F6), height: 1),

              const SizedBox(height: 22),

              // Features header
              Text(
                featuresHeader,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF374151),
                ),
              ),

              const SizedBox(height: 14),

              // Features list — skip first item if it's the header
              ...features
                  .where((f) => f != featuresHeader)
                  .map((f) => Padding(
                        padding: const EdgeInsets.only(bottom: 11),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Padding(
                              padding: const EdgeInsets.only(top: 3),
                              child: Icon(
                                Icons.check,
                                size: 15,
                                color: ctaColor,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                f,
                                style: const TextStyle(
                                  fontSize: 13.5,
                                  color: Color(0xFF374151),
                                  height: 1.45,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ),
                      )),

              const SizedBox(height: 20),

              // Compare link
              Center(
                child: TextButton(
                  onPressed: () {},
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text(
                    "Compare all features",
                    style: TextStyle(
                      color: Color(0xFF9CA3AF),
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      decoration: TextDecoration.underline,
                      decorationColor: Color(0xFFD1D5DB),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}