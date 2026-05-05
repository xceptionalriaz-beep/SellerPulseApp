import 'package:flutter/material.dart';

class TrustStrip extends StatelessWidget {
  const TrustStrip({super.key});

  @override
  Widget build(BuildContext context) {
    final bool isDesktop = MediaQuery.of(context).size.width > 700;

    return Container(
      width: double.infinity,
      color: const Color(0xFF0F1117),
      padding: EdgeInsets.symmetric(
        vertical: 48,
        horizontal: isDesktop ? 60 : 24,
      ),
      child: Column(
        children: [
          // ── LABEL ──────────────────────────────────────────
          const Text(
            "TRUSTED BY DROPSHIPPERS & WHOLESALE SELLERS WORLDWIDE",
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Color(0xFF6B7280),
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 2.0,
            ),
          ),

          const SizedBox(height: 40),

          // ── STATS ROW ──────────────────────────────────────
          isDesktop
              ? Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: _statItems(),
                )
              : Wrap(
                  alignment: WrapAlignment.center,
                  spacing: 32,
                  runSpacing: 28,
                  children: _statItems(),
                ),

          const SizedBox(height: 48),

          // ── DIVIDER ────────────────────────────────────────
          Container(height: 1, color: const Color(0xFF1F2937)),

          const SizedBox(height: 40),

          // ── PLATFORM BADGES ────────────────────────────────
          Wrap(
            alignment: WrapAlignment.center,
            spacing: 40,
            runSpacing: 20,
            children: [
              _platformBadge(Icons.shopping_cart_outlined, "eBay Sellers"),
              _platformBadge(Icons.local_shipping_outlined, "AliExpress Sync"),
              _platformBadge(Icons.storefront_outlined, "Shopify Integrations"),
              _platformBadge(Icons.sync_alt_rounded, "AutoDS Compatible"),
            ],
          ),
        ],
      ),
    );
  }

  List<Widget> _statItems() {
    final stats = [
      ("180,000+", "Dropshippers & Sellers"),
      ("94,000,000+", "Products Analyzed"),
      ("2,383,000+", "Items Researched"),
      ("4.8 / 5", "Average Rating"),
    ];

    final List<Widget> items = [];
    for (int i = 0; i < stats.length; i++) {
      items.add(_statItem(stats[i].$1, stats[i].$2));
      if (i < stats.length - 1) {
        items.add(
          Container(
            width: 1,
            height: 48,
            color: const Color(0xFF1F2937),
            margin: const EdgeInsets.symmetric(horizontal: 40),
          ),
        );
      }
    }
    return items;
  }

  Widget _statItem(String number, String label) {
    return Column(
      children: [
        Text(
          number,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 28,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFF6B7280),
            fontSize: 13,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _platformBadge(IconData icon, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: const Color(0xFF4B5563), size: 20),
        const SizedBox(width: 8),
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFF4B5563),
            fontSize: 15,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}