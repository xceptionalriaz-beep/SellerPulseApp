import 'package:flutter/material.dart';

class FeatureShowcase extends StatelessWidget {
  const FeatureShowcase({super.key});

  @override
  Widget build(BuildContext context) {
    final bool isDesktop = MediaQuery.of(context).size.width > 900;

    return Container(
      width: double.infinity,
      color: Colors.white,
      child: Column(
        children: [
          // ── SECTION HEADER ─────────────────────────────────
          Padding(
            padding: EdgeInsets.fromLTRB(
              isDesktop ? 60 : 24,
              96,
              isDesktop ? 60 : 24,
              72,
            ),
            child: Column(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F2EC),
                    borderRadius: BorderRadius.circular(50),
                  ),
                  child: const Text(
                    "THE SOLUTION",
                    style: TextStyle(
                      color: Color(0xFF2E6B3E),
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.5,
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                const Text(
                  "Everything you need to scale,\nall in one dashboard.",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 40,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF111827),
                    height: 1.15,
                    letterSpacing: -0.8,
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  "Stop jumping between 5 different tools. DropNRest combines\nproduct research, ad auditing and scammer protection in one place.",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 17,
                    color: Color(0xFF6B7280),
                    height: 1.65,
                  ),
                ),
              ],
            ),
          ),

          // ── TAB PILLS ──────────────────────────────────────
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              children: [
                _TabPill(label: "Product Research", isActive: true),
                _TabPill(label: "Ad Fee Auditor"),
                _TabPill(label: "Buyer Shield"),
                _TabPill(label: "Competitor Tracking"),
                _TabPill(label: "AliExpress Sync"),
              ],
            ),
          ),

          const SizedBox(height: 72),

          // ── FEATURE 1: Product Research ─────────────────────
          _FeatureRow(
            isDesktop: isDesktop,
            isImageLeft: false,
            badge: "PRODUCT RESEARCH",
            badgeColor: const Color(0xFFE8F2EC),
            badgeTextColor: const Color(0xFF2E6B3E),
            title: "Find Winning Products\nin Seconds.",
            description:
                "Ditch slow, outdated analytics. Spot high-demand, low-competition items instantly with our live eBay and AliExpress sync. See real sell-through rates, average prices, and competition scores — all updated daily.",
            bullets: [
              "Live eBay & AliExpress product sync",
              "Sell-through rate & competition score",
              "Trending niches updated daily",
            ],
            bulletColor: const Color(0xFF2E6B3E),
            mockWidget: _ProductResearchMock(),
          ),

          const SizedBox(height: 80),

          // ── FEATURE 2: Ad Auditor ───────────────────────────
          _FeatureRow(
            isDesktop: isDesktop,
            isImageLeft: true,
            badge: "AD FEE AUDITOR",
            badgeColor: const Color(0xFFFFFBEB),
            badgeTextColor: const Color(0xFFB45309),
            title: "Never Overpay for\neBay Ads Again.",
            description:
                "Our auditor monitors your Any-Click ad spend in real time. If an ad is cannibalizing your organic sales, we alert you immediately so you can pause it before it drains your margin.",
            bullets: [
              "Real-time Any-Click spend tracking",
              "Cannibalization alerts",
              "ROI breakdown per listing",
            ],
            bulletColor: const Color(0xFFD97706),
            mockWidget: _AdAuditorMock(),
          ),

          const SizedBox(height: 80),

          // ── FEATURE 3: Buyer Shield ─────────────────────────
          _FeatureRow(
            isDesktop: isDesktop,
            isImageLeft: false,
            badge: "BUYER SHIELD",
            badgeColor: const Color(0xFFFEF2F2),
            badgeTextColor: const Color(0xFFB91C1C),
            title: "Block Scammers\nBefore You Ship.",
            description:
                "Access a crowdsourced database of high-risk buyers. Get instant alerts on serial returners and INR claimers so you can cancel the order before it costs you.",
            bullets: [
              "Crowdsourced high-risk buyer database",
              "Instant INR & return pattern alerts",
              "Auto-block repeat offenders",
            ],
            bulletColor: const Color(0xFFDC2626),
            mockWidget: _BuyerShieldMock(),
          ),

          const SizedBox(height: 96),
        ],
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════
// FEATURE ROW — alternating layout
// ════════════════════════════════════════════════════════════
class _FeatureRow extends StatelessWidget {
  final bool isDesktop;
  final bool isImageLeft;
  final String badge;
  final Color badgeColor;
  final Color badgeTextColor;
  final String title;
  final String description;
  final List<String> bullets;
  final Color bulletColor;
  final Widget mockWidget;

  const _FeatureRow({
    required this.isDesktop,
    required this.isImageLeft,
    required this.badge,
    required this.badgeColor,
    required this.badgeTextColor,
    required this.title,
    required this.description,
    required this.bullets,
    required this.bulletColor,
    required this.mockWidget,
  });

  @override
  Widget build(BuildContext context) {
    final textBlock = Expanded(
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: isDesktop ? 48 : 24,
          vertical: isDesktop ? 0 : 32,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
              decoration: BoxDecoration(
                color: badgeColor,
                borderRadius: BorderRadius.circular(50),
              ),
              child: Text(
                badge,
                style: TextStyle(
                  color: badgeTextColor,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.4,
                ),
              ),
            ),
            const SizedBox(height: 18),
            Text(
              title,
              style: const TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.w800,
                color: Color(0xFF111827),
                height: 1.2,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              description,
              style: const TextStyle(
                fontSize: 16,
                color: Color(0xFF6B7280),
                height: 1.7,
              ),
            ),
            const SizedBox(height: 24),
            ...bullets.map(
              (b) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(top: 6),
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: bulletColor,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        b,
                        style: const TextStyle(
                          fontSize: 15,
                          color: Color(0xFF374151),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );

    final imageBlock = Expanded(child: mockWidget);

    if (!isDesktop) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 0),
        child: Column(
          children: [imageBlock, textBlock],
        ),
      );
    }

    return Container(
      constraints: const BoxConstraints(maxWidth: 1200),
      padding: const EdgeInsets.symmetric(horizontal: 40),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: isImageLeft
            ? [imageBlock, textBlock]
            : [textBlock, imageBlock],
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════
// TAB PILL
// ════════════════════════════════════════════════════════════
class _TabPill extends StatelessWidget {
  final String label;
  final bool isActive;
  const _TabPill({required this.label, this.isActive = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(right: 10),
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 9),
      decoration: BoxDecoration(
        color: isActive ? const Color(0xFF111827) : const Color(0xFFF3F4F6),
        borderRadius: BorderRadius.circular(50),
        border: Border.all(
          color: isActive
              ? const Color(0xFF111827)
              : const Color(0xFFE5E7EB),
        ),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: isActive ? Colors.white : const Color(0xFF6B7280),
          fontSize: 13.5,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════
// MOCK UI CARDS — placeholder until real screenshots are ready
// ════════════════════════════════════════════════════════════

class _ProductResearchMock extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(12),
      height: 380,
      decoration: BoxDecoration(
        color: const Color(0xFFF0F9FF),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFBAE6FD)),
      ),
      child: Column(
        children: [
          // Mock toolbar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
            ),
            child: Row(
              children: [
                const Icon(Icons.search, size: 16, color: Color(0xFF9CA3AF)),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    "wireless earbuds dropship",
                    style: TextStyle(fontSize: 13, color: Color(0xFF374151)),
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFF111827),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    "Search",
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
          // Mock results
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: List.generate(
                  4,
                  (i) => _MockResultRow(
                    name: [
                      "Wireless Earbuds Pro",
                      "Bluetooth Headset X200",
                      "TWS Earphones V3",
                      "Sport Earbuds Lite"
                    ][i],
                    score: ["94", "87", "82", "76"][i],
                    color: [
                      const Color(0xFF16A34A),
                      const Color(0xFF16A34A),
                      const Color(0xFFD97706),
                      const Color(0xFFD97706),
                    ][i],
                    sellThrough: ["89%", "74%", "68%", "55%"][i],
                  ),
                ),
              ),
            ),
          ),
          // Bottom tag
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0xFFE0F2FE),
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(20)),
            ),
            child: const Center(
              child: Text(
                "📸  Product Research Tool — Screenshot goes here",
                style: TextStyle(
                    fontSize: 12,
                    color: Color(0xFF0369A1),
                    fontWeight: FontWeight.w500),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MockResultRow extends StatelessWidget {
  final String name;
  final String score;
  final Color color;
  final String sellThrough;

  const _MockResultRow({
    required this.name,
    required this.score,
    required this.color,
    required this.sellThrough,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(name,
                style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF111827))),
          ),
          Text("$sellThrough sell-through",
              style:
                  const TextStyle(fontSize: 12, color: Color(0xFF9CA3AF))),
          const SizedBox(width: 10),
          Container(
            width: 34,
            height: 24,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Center(
              child: Text(score,
                  style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: color)),
            ),
          ),
        ],
      ),
    );
  }
}

class _AdAuditorMock extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(12),
      height: 380,
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFFDE68A)),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
            ),
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF3C7),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.warning_amber_rounded,
                      size: 18, color: Color(0xFFD97706)),
                ),
                const SizedBox(width: 10),
                const Text("Ad Fee Auditor",
                    style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                        color: Color(0xFF111827))),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEE2E2),
                    borderRadius: BorderRadius.circular(50),
                  ),
                  child: const Text("2 Alerts",
                      style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFFB91C1C))),
                ),
              ],
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _AdAlertRow(
                    listing: "USB-C Hub 7-in-1",
                    spend: "45%",
                    status: "Cannibalizing",
                    isWarning: true,
                  ),
                  const SizedBox(height: 8),
                  _AdAlertRow(
                    listing: "Laptop Stand Aluminium",
                    spend: "38%",
                    status: "High Spend",
                    isWarning: true,
                  ),
                  const SizedBox(height: 8),
                  _AdAlertRow(
                    listing: "Phone Holder Car Mount",
                    spend: "12%",
                    status: "Healthy",
                    isWarning: false,
                  ),
                  const SizedBox(height: 8),
                  _AdAlertRow(
                    listing: "Wireless Charging Pad",
                    spend: "9%",
                    status: "Healthy",
                    isWarning: false,
                  ),
                ],
              ),
            ),
          ),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0xFFFEF3C7),
              borderRadius:
                  BorderRadius.vertical(bottom: Radius.circular(20)),
            ),
            child: const Center(
              child: Text(
                "📸  Ad Auditor Tool — Screenshot goes here",
                style: TextStyle(
                    fontSize: 12,
                    color: Color(0xFF92400E),
                    fontWeight: FontWeight.w500),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AdAlertRow extends StatelessWidget {
  final String listing;
  final String spend;
  final String status;
  final bool isWarning;

  const _AdAlertRow({
    required this.listing,
    required this.spend,
    required this.status,
    required this.isWarning,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isWarning
              ? const Color(0xFFFDE68A)
              : const Color(0xFFE5E7EB),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(listing,
                style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF111827))),
          ),
          Text("Ad: $spend",
              style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: isWarning
                      ? const Color(0xFFD97706)
                      : const Color(0xFF9CA3AF))),
          const SizedBox(width: 8),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: isWarning
                  ? const Color(0xFFFEE2E2)
                  : const Color(0xFFF0FDF4),
              borderRadius: BorderRadius.circular(50),
            ),
            child: Text(
              status,
              style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: isWarning
                      ? const Color(0xFFB91C1C)
                      : const Color(0xFF16A34A)),
            ),
          ),
        ],
      ),
    );
  }
}

class _BuyerShieldMock extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(12),
      height: 380,
      decoration: BoxDecoration(
        color: const Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFFECACA)),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
            ),
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEE2E2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.shield_outlined,
                      size: 18, color: Color(0xFFDC2626)),
                ),
                const SizedBox(width: 10),
                const Text("Buyer Shield",
                    style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                        color: Color(0xFF111827))),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEE2E2),
                    borderRadius: BorderRadius.circular(50),
                  ),
                  child: const Text("1 Blocked",
                      style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFFB91C1C))),
                ),
              ],
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _BuyerRow(
                      name: "buyer_xyz99",
                      risk: "HIGH RISK",
                      detail: "4x INR claims",
                      isBlocked: true),
                  const SizedBox(height: 8),
                  _BuyerRow(
                      name: "deals_hunter22",
                      risk: "MEDIUM",
                      detail: "2x returns",
                      isBlocked: false),
                  const SizedBox(height: 8),
                  _BuyerRow(
                      name: "top_buyer_uk",
                      risk: "SAFE",
                      detail: "99.8% feedback",
                      isBlocked: false),
                  const SizedBox(height: 8),
                  _BuyerRow(
                      name: "fastship_deals",
                      risk: "SAFE",
                      detail: "2,400 purchases",
                      isBlocked: false),
                ],
              ),
            ),
          ),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0xFFFEE2E2),
              borderRadius:
                  BorderRadius.vertical(bottom: Radius.circular(20)),
            ),
            child: const Center(
              child: Text(
                "📸  Buyer Shield Tool — Screenshot goes here",
                style: TextStyle(
                    fontSize: 12,
                    color: Color(0xFF991B1B),
                    fontWeight: FontWeight.w500),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BuyerRow extends StatelessWidget {
  final String name;
  final String risk;
  final String detail;
  final bool isBlocked;

  const _BuyerRow({
    required this.name,
    required this.risk,
    required this.detail,
    required this.isBlocked,
  });

  @override
  Widget build(BuildContext context) {
    final Color riskColor = risk == "HIGH RISK"
        ? const Color(0xFFDC2626)
        : risk == "MEDIUM"
            ? const Color(0xFFD97706)
            : const Color(0xFF16A34A);

    final Color riskBg = risk == "HIGH RISK"
        ? const Color(0xFFFEE2E2)
        : risk == "MEDIUM"
            ? const Color(0xFFFEF3C7)
            : const Color(0xFFF0FDF4);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isBlocked
              ? const Color(0xFFFECACA)
              : const Color(0xFFE5E7EB),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name,
                    style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF111827))),
                Text(detail,
                    style: const TextStyle(
                        fontSize: 11, color: Color(0xFF9CA3AF))),
              ],
            ),
          ),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: riskBg,
              borderRadius: BorderRadius.circular(50),
            ),
            child: Text(risk,
                style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: riskColor)),
          ),
          if (isBlocked) ...[
            const SizedBox(width: 6),
            const Icon(Icons.block_rounded,
                size: 16, color: Color(0xFFDC2626)),
          ],
        ],
      ),
    );
  }
}