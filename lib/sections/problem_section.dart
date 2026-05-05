import 'package:flutter/material.dart';

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

// ─── Main Section ─────────────────────────────────────────────
class ProblemSection extends StatelessWidget {
  const ProblemSection({super.key});

  @override
  Widget build(BuildContext context) {
    final w = MediaQuery.of(context).size.width;
    final bool isDesktop = w > 800;
    final double hPad = isDesktop ? 60 : 20;

    return Container(
      width: double.infinity,
      color: const Color(0xFFF9F8F6),
      padding: EdgeInsets.symmetric(vertical: 80, horizontal: hPad),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Label
          _FadeSlideIn(
            delay: const Duration(milliseconds: 100),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFFFEBEB),
                borderRadius: BorderRadius.circular(50),
              ),
              child: const Text(
                "THE PROBLEM",
                style: TextStyle(
                  color: Color(0xFFB91C1C),
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.5,
                ),
              ),
            ),
          ),

          const SizedBox(height: 20),

          // Headline
          _FadeSlideIn(
            delay: const Duration(milliseconds: 200),
            child: Text(
              "If you are relying on outdated tools...",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: isDesktop ? 38 : 26,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF111827),
                height: 1.2,
                letterSpacing: -0.5,
              ),
            ),
          ),

          const SizedBox(height: 12),

          _FadeSlideIn(
            delay: const Duration(milliseconds: 300),
            child: const Text(
              "You are losing money to these 3 profit killers:",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 15,
                color: Color(0xFF6B7280),
                height: 1.6,
              ),
            ),
          ),

          const SizedBox(height: 48),

          // Cards — use LayoutBuilder to avoid overflow
          LayoutBuilder(builder: (ctx, constraints) {
            final useRow = constraints.maxWidth > 700;
            final cards = [
              _FadeSlideIn(
                delay: const Duration(milliseconds: 200),
                child: _ProblemCard(
                  emoji: "❌",
                  bgColor: const Color(0xFFFEF2F2),
                  borderColor: const Color(0xFFFECACA),
                  accentColor: const Color(0xFFDC2626),
                  title: "Blind Sourcing",
                  description:
                      "Guessing what products will sell and wasting money on dead inventory that just sits in your store.",
                  stat: "67% of sellers",
                  statLabel: "pick wrong products",
                ),
              ),
              _FadeSlideIn(
                delay: const Duration(milliseconds: 350),
                child: _ProblemCard(
                  emoji: "💸",
                  bgColor: const Color(0xFFFFFBEB),
                  borderColor: const Color(0xFFFDE68A),
                  accentColor: const Color(0xFFD97706),
                  title: "Ad Fee Traps",
                  description:
                      "eBay's 'Any-Click' fees silently eating 40%+ of your organic profit without you even knowing.",
                  stat: "40% profit",
                  statLabel: "lost to hidden fees",
                ),
              ),
              _FadeSlideIn(
                delay: const Duration(milliseconds: 500),
                child: _ProblemCard(
                  emoji: "🚨",
                  bgColor: const Color(0xFFF0FDF4),
                  borderColor: const Color(0xFFBBF7D0),
                  accentColor: const Color(0xFF16A34A),
                  title: "Serial Scammers",
                  description:
                      "Buyers who claim 'Item Not Received' to steal your stock and tank your seller rating.",
                  stat: "1 in 12 orders",
                  statLabel: "flagged as high-risk",
                ),
              ),
            ];

            if (useRow) {
              return IntrinsicHeight(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Expanded(child: cards[0]),
                    const SizedBox(width: 14),
                    Expanded(child: cards[1]),
                    const SizedBox(width: 14),
                    Expanded(child: cards[2]),
                  ],
                ),
              );
            } else {
              return Column(
                children: [
                  cards[0],
                  const SizedBox(height: 14),
                  cards[1],
                  const SizedBox(height: 14),
                  cards[2],
                ],
              );
            }
          }),

          const SizedBox(height: 48),

          // Bottom callout
          _FadeSlideIn(
            delay: const Duration(milliseconds: 600),
            child: Container(
              constraints: const BoxConstraints(maxWidth: 580),
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: const Color(0xFF0F1117),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E2D1E),
                      borderRadius: BorderRadius.circular(11),
                    ),
                    child: const Icon(
                      Icons.trending_up_rounded,
                      color: Color(0xFF4ADE80),
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 16),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "DropNRest fixes all three.",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          "One dashboard. Real-time data. Profit protection built-in.",
                          style: TextStyle(
                            color: Color(0xFF9CA3AF),
                            fontSize: 13,
                            height: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Problem Card ─────────────────────────────────────────────
class _ProblemCard extends StatelessWidget {
  final String emoji;
  final Color bgColor;
  final Color borderColor;
  final Color accentColor;
  final String title;
  final String description;
  final String stat;
  final String statLabel;

  const _ProblemCard({
    required this.emoji,
    required this.bgColor,
    required this.borderColor,
    required this.accentColor,
    required this.title,
    required this.description,
    required this.stat,
    required this.statLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Icon
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: borderColor),
            ),
            child: Center(
              child: Text(emoji, style: const TextStyle(fontSize: 20)),
            ),
          ),
          const SizedBox(height: 16),

          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: Color(0xFF111827),
            ),
          ),
          const SizedBox(height: 8),

          Text(
            description,
            style: const TextStyle(
              fontSize: 13.5,
              color: Color(0xFF6B7280),
              height: 1.6,
            ),
          ),
          const SizedBox(height: 18),

          // Stat pill — use Wrap to prevent overflow
          Wrap(
            children: [
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                decoration: BoxDecoration(
                  color: bgColor,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: borderColor),
                ),
                child: Wrap(
                  children: [
                    Text(
                      stat,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: accentColor,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      statLabel,
                      style: TextStyle(
                        fontSize: 12,
                        color: accentColor.withOpacity(0.75),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}