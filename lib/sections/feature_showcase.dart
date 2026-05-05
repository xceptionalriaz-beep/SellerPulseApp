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

// ─── Feature Showcase ─────────────────────────────────────────
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
          // ── HEADER ───────────────────────────────────────
          Padding(
            padding: EdgeInsets.fromLTRB(
              isDesktop ? 60 : 20, 80, isDesktop ? 60 : 20, 60,
            ),
            child: Column(
              children: [
                _FadeSlideIn(
                  delay: const Duration(milliseconds: 100),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 6),
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
                ),
                const SizedBox(height: 16),
                _FadeSlideIn(
                  delay: const Duration(milliseconds: 200),
                  child: Text(
                    "Everything you need to scale,\nall in one dashboard.",
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
                const SizedBox(height: 14),
                _FadeSlideIn(
                  delay: const Duration(milliseconds: 300),
                  child: const Text(
                    "Stop jumping between 5 tools. DropNRest combines product research,\nad auditing and scammer protection in one place.",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 15,
                      color: Color(0xFF6B7280),
                      height: 1.65,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // ── TAB PILLS ────────────────────────────────────
          _FadeSlideIn(
            delay: const Duration(milliseconds: 350),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
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
          ),

          const SizedBox(height: 64),

          // ── FEATURE 1 ─────────────────────────────────────
          _FeatureRow(
            isDesktop: isDesktop,
            isImageLeft: false,
            badge: "PRODUCT RESEARCH",
            badgeColor: const Color(0xFFE8F2EC),
            badgeTextColor: const Color(0xFF2E6B3E),
            title: "Find Winning Products\nin Seconds.",
            description:
                "Ditch slow, outdated analytics. Spot high-demand, low-competition items instantly with live eBay and AliExpress sync. See real sell-through rates, average prices, and competition scores — all updated daily.",
            bullets: [
              "Live eBay & AliExpress product sync",
              "Sell-through rate & competition score",
              "Trending niches updated daily",
            ],
            bulletColor: const Color(0xFF2E6B3E),
            mockWidget: _ProductResearchMock(),
            animDelay: const Duration(milliseconds: 200),
          ),

          const SizedBox(height: 72),

          // ── FEATURE 2 ─────────────────────────────────────
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
            animDelay: const Duration(milliseconds: 200),
          ),

          const SizedBox(height: 72),

          // ── FEATURE 3 ─────────────────────────────────────
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
            animDelay: const Duration(milliseconds: 200),
          ),

          const SizedBox(height: 80),
        ],
      ),
    );
  }
}

// ─── Feature Row ──────────────────────────────────────────────
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
  final Duration animDelay;

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
    required this.animDelay,
  });

  @override
  Widget build(BuildContext context) {
    final textBlock = _FadeSlideIn(
      delay: animDelay,
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: isDesktop ? 40 : 20,
          vertical: isDesktop ? 0 : 24,
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
            const SizedBox(height: 16),
            Text(
              title,
              style: TextStyle(
                fontSize: isDesktop ? 30 : 24,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF111827),
                height: 1.2,
                letterSpacing: -0.4,
              ),
            ),
            const SizedBox(height: 14),
            Text(
              description,
              style: const TextStyle(
                fontSize: 15,
                color: Color(0xFF6B7280),
                height: 1.7,
              ),
            ),
            const SizedBox(height: 20),
            ...bullets.map((b) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        margin: const EdgeInsets.only(top: 7),
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: bulletColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          b,
                          style: const TextStyle(
                            fontSize: 14,
                            color: Color(0xFF374151),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                )),
          ],
        ),
      ),
    );

    final imageBlock = _FadeSlideIn(
      delay: Duration(milliseconds: animDelay.inMilliseconds + 150),
      child: mockWidget,
    );

    if (!isDesktop) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(children: [imageBlock, textBlock]),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 40),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: isImageLeft
            ? [Expanded(child: imageBlock), Expanded(child: textBlock)]
            : [Expanded(child: textBlock), Expanded(child: imageBlock)],
      ),
    );
  }
}

// ─── Tab Pill ─────────────────────────────────────────────────
class _TabPill extends StatelessWidget {
  final String label;
  final bool isActive;
  const _TabPill({required this.label, this.isActive = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: isActive
            ? const Color(0xFF111827)
            : const Color(0xFFF3F4F6),
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
          fontSize: 13,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

// ─── Mock: Product Research ───────────────────────────────────
class _ProductResearchMock extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: const Color(0xFFF0F9FF),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFBAE6FD)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Toolbar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
              border:
                  Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
            ),
            child: Row(
              children: [
                const Icon(Icons.search, size: 15,
                    color: Color(0xFF9CA3AF)),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text("wireless earbuds dropship",
                      style: TextStyle(
                          fontSize: 12, color: Color(0xFF374151))),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFF111827),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text("Search",
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          ),
          // Results
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              children: [
                _ResultRow("Wireless Earbuds Pro", "94", "89%",
                    const Color(0xFF16A34A)),
                const SizedBox(height: 6),
                _ResultRow("Bluetooth Headset X200", "87", "74%",
                    const Color(0xFF16A34A)),
                const SizedBox(height: 6),
                _ResultRow("TWS Earphones V3", "82", "68%",
                    const Color(0xFFD97706)),
                const SizedBox(height: 6),
                _ResultRow("Sport Earbuds Lite", "76", "55%",
                    const Color(0xFFD97706)),
              ],
            ),
          ),
          // Footer label
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 10),
            decoration: const BoxDecoration(
              color: Color(0xFFE0F2FE),
              borderRadius:
                  BorderRadius.vertical(bottom: Radius.circular(18)),
            ),
            child: const Center(
              child: Text(
                "📸  Product Research Tool — Screenshot goes here",
                style: TextStyle(
                    fontSize: 11,
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

class _ResultRow extends StatelessWidget {
  final String name;
  final String score;
  final String sell;
  final Color color;
  const _ResultRow(this.name, this.score, this.sell, this.color);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(name,
                style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF111827))),
          ),
          Text("$sell sell-through",
              style: const TextStyle(
                  fontSize: 11, color: Color(0xFF9CA3AF))),
          const SizedBox(width: 8),
          Container(
            width: 30,
            height: 22,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(5),
            ),
            child: Center(
              child: Text(score,
                  style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: color)),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Mock: Ad Auditor ─────────────────────────────────────────
class _AdAuditorMock extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFFDE68A)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius:
                  BorderRadius.vertical(top: Radius.circular(18)),
              border:
                  Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
            ),
            child: Row(
              children: [
                Container(
                  width: 30,
                  height: 30,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF3C7),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.warning_amber_rounded,
                      size: 16, color: Color(0xFFD97706)),
                ),
                const SizedBox(width: 8),
                const Text("Ad Fee Auditor",
                    style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                        color: Color(0xFF111827))),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 9, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEE2E2),
                    borderRadius: BorderRadius.circular(50),
                  ),
                  child: const Text("2 Alerts",
                      style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFFB91C1C))),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              children: [
                _AdRow("USB-C Hub 7-in-1", "45%", "Cannibalizing", true),
                const SizedBox(height: 6),
                _AdRow("Laptop Stand Aluminium", "38%", "High Spend", true),
                const SizedBox(height: 6),
                _AdRow("Phone Holder Car Mount", "12%", "Healthy", false),
                const SizedBox(height: 6),
                _AdRow("Wireless Charging Pad", "9%", "Healthy", false),
              ],
            ),
          ),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 10),
            decoration: const BoxDecoration(
              color: Color(0xFFFEF3C7),
              borderRadius:
                  BorderRadius.vertical(bottom: Radius.circular(18)),
            ),
            child: const Center(
              child: Text(
                "📸  Ad Auditor Tool — Screenshot goes here",
                style: TextStyle(
                    fontSize: 11,
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

class _AdRow extends StatelessWidget {
  final String listing;
  final String spend;
  final String status;
  final bool isWarn;
  const _AdRow(this.listing, this.spend, this.status, this.isWarn);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isWarn
              ? const Color(0xFFFDE68A)
              : const Color(0xFFE5E7EB),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(listing,
                style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF111827))),
          ),
          Text("Ad: $spend",
              style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: isWarn
                      ? const Color(0xFFD97706)
                      : const Color(0xFF9CA3AF))),
          const SizedBox(width: 6),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
            decoration: BoxDecoration(
              color: isWarn
                  ? const Color(0xFFFEE2E2)
                  : const Color(0xFFF0FDF4),
              borderRadius: BorderRadius.circular(50),
            ),
            child: Text(
              status,
              style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: isWarn
                      ? const Color(0xFFB91C1C)
                      : const Color(0xFF16A34A)),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Mock: Buyer Shield ───────────────────────────────────────
class _BuyerShieldMock extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFFECACA)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius:
                  BorderRadius.vertical(top: Radius.circular(18)),
              border:
                  Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
            ),
            child: Row(
              children: [
                Container(
                  width: 30,
                  height: 30,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEE2E2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.shield_outlined,
                      size: 16, color: Color(0xFFDC2626)),
                ),
                const SizedBox(width: 8),
                const Text("Buyer Shield",
                    style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                        color: Color(0xFF111827))),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 9, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEE2E2),
                    borderRadius: BorderRadius.circular(50),
                  ),
                  child: const Text("1 Blocked",
                      style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFFB91C1C))),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              children: [
                _BuyerRow("buyer_xyz99", "4x INR claims", "HIGH RISK",
                    const Color(0xFFDC2626), const Color(0xFFFEE2E2),
                    blocked: true),
                const SizedBox(height: 6),
                _BuyerRow("deals_hunter22", "2x returns", "MEDIUM",
                    const Color(0xFFD97706), const Color(0xFFFEF3C7)),
                const SizedBox(height: 6),
                _BuyerRow("top_buyer_uk", "99.8% feedback", "SAFE",
                    const Color(0xFF16A34A), const Color(0xFFF0FDF4)),
                const SizedBox(height: 6),
                _BuyerRow("fastship_deals", "2,400 purchases", "SAFE",
                    const Color(0xFF16A34A), const Color(0xFFF0FDF4)),
              ],
            ),
          ),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 10),
            decoration: const BoxDecoration(
              color: Color(0xFFFEE2E2),
              borderRadius:
                  BorderRadius.vertical(bottom: Radius.circular(18)),
            ),
            child: const Center(
              child: Text(
                "📸  Buyer Shield Tool — Screenshot goes here",
                style: TextStyle(
                    fontSize: 11,
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
  final String detail;
  final String risk;
  final Color riskColor;
  final Color riskBg;
  final bool blocked;

  const _BuyerRow(
      this.name, this.detail, this.risk, this.riskColor, this.riskBg,
      {this.blocked = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: blocked
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
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF111827))),
                Text(detail,
                    style: const TextStyle(
                        fontSize: 10, color: Color(0xFF9CA3AF))),
              ],
            ),
          ),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
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
          if (blocked) ...[
            const SizedBox(width: 6),
            const Icon(Icons.block_rounded,
                size: 14, color: Color(0xFFDC2626)),
          ],
        ],
      ),
    );
  }
}