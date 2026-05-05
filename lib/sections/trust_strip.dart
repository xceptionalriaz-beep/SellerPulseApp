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
          // Label
          _FadeSlideIn(
            delay: const Duration(milliseconds: 100),
            child: const Text(
              "TRUSTED BY DROPSHIPPERS & WHOLESALE SELLERS WORLDWIDE",
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Color(0xFF6B7280),
                fontSize: 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 2.0,
              ),
            ),
          ),

          const SizedBox(height: 40),

          // Stats
          _FadeSlideIn(
            delay: const Duration(milliseconds: 250),
            child: LayoutBuilder(builder: (ctx, constraints) {
              final useRow = constraints.maxWidth > 600;
              final stats = [
                ("180,000+", "Dropshippers & Sellers"),
                ("94,000,000+", "Products Analyzed"),
                ("2,383,000+", "Items Researched"),
                ("4.8 / 5", "Average Rating"),
              ];

              if (useRow) {
                return Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    for (int i = 0; i < stats.length; i++) ...[
                      _statItem(stats[i].$1, stats[i].$2),
                      if (i < stats.length - 1)
                        Container(
                          width: 1,
                          height: 44,
                          color: const Color(0xFF1F2937),
                          margin: const EdgeInsets.symmetric(horizontal: 32),
                        ),
                    ],
                  ],
                );
              } else {
                return Wrap(
                  alignment: WrapAlignment.center,
                  spacing: 28,
                  runSpacing: 24,
                  children: stats
                      .map((s) => _statItem(s.$1, s.$2))
                      .toList(),
                );
              }
            }),
          ),

          const SizedBox(height: 40),

          Container(height: 1, color: const Color(0xFF1F2937)),

          const SizedBox(height: 36),

          // Platform badges
          _FadeSlideIn(
            delay: const Duration(milliseconds: 400),
            child: Wrap(
              alignment: WrapAlignment.center,
              spacing: 36,
              runSpacing: 18,
              children: [
                _platformBadge(Icons.shopping_cart_outlined, "eBay Sellers"),
                _platformBadge(Icons.local_shipping_outlined, "AliExpress Sync"),
                _platformBadge(Icons.storefront_outlined, "Shopify Integrations"),
                _platformBadge(Icons.sync_alt_rounded, "AutoDS Compatible"),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _statItem(String number, String label) {
    return Column(
      children: [
        Text(
          number,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 26,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 5),
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFF6B7280),
            fontSize: 12,
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
        Icon(icon, color: const Color(0xFF4B5563), size: 18),
        const SizedBox(width: 7),
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFF4B5563),
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}