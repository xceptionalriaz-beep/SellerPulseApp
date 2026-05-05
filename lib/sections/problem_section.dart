import 'package:flutter/material.dart';

class ProblemSection extends StatelessWidget {
  const ProblemSection({super.key});

  @override
  Widget build(BuildContext context) {
    final bool isDesktop = MediaQuery.of(context).size.width > 800;

    return Container(
      width: double.infinity,
      color: const Color(0xFFF9F8F6),
      padding: EdgeInsets.symmetric(
        vertical: 96,
        horizontal: isDesktop ? 60 : 24,
      ),
      child: Column(
        children: [
          // ── LABEL ──────────────────────────────────────────
          Container(
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

          const SizedBox(height: 20),

          // ── HEADLINE ───────────────────────────────────────
          const Text(
            "If you are relying on\noutdated tools...",
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
            "You are losing money to these 3 profit killers:",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 17,
              color: Color(0xFF6B7280),
              height: 1.6,
            ),
          ),

          const SizedBox(height: 56),

          // ── PROBLEM CARDS ──────────────────────────────────
          Container(
            constraints: const BoxConstraints(maxWidth: 1000),
            child: isDesktop
                ? Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: _problemCards()
                        .expand((card) => [
                              Expanded(child: card),
                              if (card != _problemCards().last)
                                const SizedBox(width: 20),
                            ])
                        .toList(),
                  )
                : Column(
                    children: _problemCards()
                        .map((c) => Padding(
                              padding: const EdgeInsets.only(bottom: 16),
                              child: c,
                            ))
                        .toList(),
                  ),
          ),

          const SizedBox(height: 64),

          // ── BOTTOM CALLOUT ─────────────────────────────────
          Container(
            constraints: const BoxConstraints(maxWidth: 640),
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              color: const Color(0xFF0F1117),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E2D1E),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.trending_up_rounded,
                    color: Color(0xFF4ADE80),
                    size: 24,
                  ),
                ),
                const SizedBox(width: 18),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "DropNRest fixes all three.",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        "One dashboard. Real-time data. Profit protection built-in.",
                        style: TextStyle(
                          color: Color(0xFF9CA3AF),
                          fontSize: 14,
                          height: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _problemCards() {
    return [
      _ProblemCard(
        emoji: "❌",
        color: const Color(0xFFFEF2F2),
        borderColor: const Color(0xFFFECACA),
        accentColor: const Color(0xFFDC2626),
        title: "Blind Sourcing",
        description:
            "Guessing what products will sell and wasting money on dead inventory that just sits in your store.",
        stat: "67% of sellers",
        statLabel: "pick the wrong products",
      ),
      _ProblemCard(
        emoji: "💸",
        color: const Color(0xFFFFFBEB),
        borderColor: const Color(0xFFFDE68A),
        accentColor: const Color(0xFFD97706),
        title: "Ad Fee Traps",
        description:
            "eBay's new 'Any-Click' fees silently eating 40%+ of your organic profit without you even knowing.",
        stat: "40% profit",
        statLabel: "lost to hidden ad fees",
      ),
      _ProblemCard(
        emoji: "🚨",
        color: const Color(0xFFF0FDF4),
        borderColor: const Color(0xFFBBF7D0),
        accentColor: const Color(0xFF16A34A),
        title: "Serial Scammers",
        description:
            "Buyers who repeatedly claim 'Item Not Received' to steal your stock and tank your seller rating.",
        stat: "1 in 12 orders",
        statLabel: "flagged as high-risk",
      ),
    ];
  }
}

class _ProblemCard extends StatelessWidget {
  final String emoji;
  final Color color;
  final Color borderColor;
  final Color accentColor;
  final String title;
  final String description;
  final String stat;
  final String statLabel;

  const _ProblemCard({
    required this.emoji,
    required this.color,
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
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon circle
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: borderColor),
            ),
            child: Center(
              child: Text(emoji, style: const TextStyle(fontSize: 24)),
            ),
          ),

          const SizedBox(height: 20),

          Text(
            title,
            style: const TextStyle(
              fontSize: 19,
              fontWeight: FontWeight.w700,
              color: Color(0xFF111827),
            ),
          ),

          const SizedBox(height: 10),

          Text(
            description,
            style: const TextStyle(
              fontSize: 14.5,
              color: Color(0xFF6B7280),
              height: 1.65,
            ),
          ),

          const SizedBox(height: 24),

          // Stat pill
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: borderColor),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  stat,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: accentColor,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  statLabel,
                  style: TextStyle(
                    fontSize: 13,
                    color: accentColor.withOpacity(0.75),
                    fontWeight: FontWeight.w500,
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