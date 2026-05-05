import 'package:flutter/material.dart';

// ─── Stat data model (no Dart 3 records) ─────────────────────
class _Stat {
  final String number;
  final String label;
  const _Stat(this.number, this.label);
}

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
    _slide = Tween<Offset>(begin: const Offset(0, 0.1), end: Offset.zero)
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

// ─── TrustStrip ───────────────────────────────────────────────
class TrustStrip extends StatelessWidget {
  const TrustStrip({super.key});

  static const List<_Stat> _stats = [
    _Stat("180,000+", "Dropshippers & Sellers"),
    _Stat("94,000,000+", "Products Analyzed"),
    _Stat("2,383,000+", "Items Researched"),
    _Stat("4.8 / 5", "Average Rating"),
  ];

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

          // Stats row
          _FadeSlideIn(
            delay: const Duration(milliseconds: 250),
            child: LayoutBuilder(builder: (ctx, constraints) {
              final useRow = constraints.maxWidth > 600;
              if (useRow) {
                return Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    for (int i = 0; i < _stats.length; i++) ...[
                      _StatItem(number: _stats[i].number, label: _stats[i].label),
                      if (i < _stats.length - 1)
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
                  children: _stats
                      .map((s) => _StatItem(number: s.number, label: s.label))
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
              children: const [
                _PlatformBadge(icon: Icons.shopping_cart_outlined, label: "eBay Sellers"),
                _PlatformBadge(icon: Icons.local_shipping_outlined, label: "AliExpress Sync"),
                _PlatformBadge(icon: Icons.storefront_outlined, label: "Shopify Integrations"),
                _PlatformBadge(icon: Icons.sync_alt_rounded, label: "AutoDS Compatible"),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String number;
  final String label;
  const _StatItem({required this.number, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(number,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 26,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.5,
            )),
        const SizedBox(height: 5),
        Text(label,
            style: const TextStyle(
              color: Color(0xFF6B7280),
              fontSize: 12,
              fontWeight: FontWeight.w500,
            )),
      ],
    );
  }
}

class _PlatformBadge extends StatelessWidget {
  final IconData icon;
  final String label;
  const _PlatformBadge({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: const Color(0xFF4B5563), size: 18),
        const SizedBox(width: 7),
        Text(label,
            style: const TextStyle(
              color: Color(0xFF4B5563),
              fontSize: 14,
              fontWeight: FontWeight.w600,
            )),
      ],
    );
  }
}