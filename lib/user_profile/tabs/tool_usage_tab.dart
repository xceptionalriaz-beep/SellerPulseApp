// ═══════════════════════════════════════════════════════════════════════════
// lib/user_profile/tabs/tool_usage_tab.dart - NEW
// ═══════════════════════════════════════════════════════════════════════════

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../services/ebay_service.dart';

class ToolUsageTab extends StatefulWidget {
  const ToolUsageTab({super.key});
  @override
  State<ToolUsageTab> createState() => _ToolUsageTabState();
}

class _ToolUsageTabState extends State<ToolUsageTab> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _toolUsage = [];
  EbayConnectionData? _ebayConnection;

  // Tool display config
  final _toolConfig = {
    'product_research'   : {'label': 'Product Research',    'icon': Icons.search,             'color': const Color(0xFF1D70F5)},
    'competitor_research': {'label': 'Competitor Research',  'icon': Icons.storefront_outlined, 'color': const Color(0xFFFFB800)},
    'deep_dive_analysis' : {'label': 'Deep Dive Analysis',  'icon': Icons.analytics_outlined,  'color': const Color(0xFF8B5CF6)},
    'title_builder'      : {'label': 'Title Builder',        'icon': Icons.title,               'color': const Color(0xFF00C48C)},
    'profit_calculator'  : {'label': 'Profit Calculator',   'icon': Icons.calculate_outlined,  'color': const Color(0xFFEC4899)},
    'ebay_orders'        : {'label': 'eBay Orders Sync',    'icon': Icons.shopping_bag_outlined,'color': const Color(0xFF8FFF00)},
  };

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final results = await Future.wait([
        EbayService.getToolUsage(),
        EbayService.checkConnection(),
      ]);
      if (mounted) {
        setState(() {
          _toolUsage      = results[0] as List<Map<String, dynamic>>;
          _ebayConnection = results[1] as EbayConnectionData?;
          _isLoading      = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      // Header
      Text('Tool Usage & Limits',
          style: GoogleFonts.spaceGrotesk(
              fontSize: 24, fontWeight: FontWeight.w700,
              color: const Color(0xFF0F172A))),
      const SizedBox(height: 8),
      Text('Track your usage across all SellerPulse tools.',
          style: GoogleFonts.inter(fontSize: 14, color: Colors.grey)),
      const SizedBox(height: 24),

      if (_isLoading)
        const Center(child: CircularProgressIndicator(color: Color(0xFF0F172A)))
      else ...[
        // Plan summary card
        _buildPlanSummaryCard(),
        const SizedBox(height: 20),

        // Tool cards
        ..._toolConfig.entries.map((entry) {
          final toolKey  = entry.key;
          final config   = entry.value;
          final usage    = _toolUsage.firstWhere(
            (t) => t['tool_name'] == toolKey,
            orElse: () => {'usage_count': 0, 'usage_limit': 100, 'reset_date': null},
          );
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _buildToolCard(
              label     : config['label'] as String,
              icon      : config['icon'] as IconData,
              color     : config['color'] as Color,
              used      : (usage['usage_count'] ?? 0) as int,
              limit     : (usage['usage_limit'] ?? 100) as int,
              resetDate : usage['reset_date']?.toString(),
              toolKey   : toolKey,
            ),
          );
        }),
      ],
    ]);
  }

  Widget _buildPlanSummaryCard() {
    final supabase = Supabase.instance.client;
    final user     = supabase.auth.currentUser;
    final plan     = user?.userMetadata?['plan']?.toString() ?? 'Pro';

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(
            color: const Color(0xFF8FFF00).withOpacity(0.1),
            blurRadius: 20, offset: const Offset(0, 8))],
      ),
      child: Row(children: [
        // Plan badge
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: const Color(0xFF8FFF00).withOpacity(0.15),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFF8FFF00).withOpacity(0.4)),
          ),
          child: Text(plan.toUpperCase(),
              style: GoogleFonts.inter(
                  color: const Color(0xFF8FFF00),
                  fontWeight: FontWeight.w800, fontSize: 13)),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('${plan} Plan Active',
                style: GoogleFonts.inter(
                    color: Colors.white, fontWeight: FontWeight.bold,
                    fontSize: 15)),
            const SizedBox(height: 4),
            Text('Limits reset monthly. Upgrade for higher limits.',
                style: GoogleFonts.inter(fontSize: 12, color: Colors.grey)),
          ]),
        ),
        // eBay connection status
        Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Row(mainAxisSize: MainAxisSize.min, children: [
            Container(
              width: 8, height: 8,
              decoration: BoxDecoration(
                color: _ebayConnection != null
                    ? const Color(0xFF8FFF00) : Colors.grey,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 6),
            Text(
              _ebayConnection != null ? 'eBay Connected' : 'eBay Not Connected',
              style: GoogleFonts.inter(
                  fontSize: 11,
                  color: _ebayConnection != null
                      ? const Color(0xFF8FFF00) : Colors.grey,
                  fontWeight: FontWeight.w600),
            ),
          ]),
          if (_ebayConnection != null) ...[
            const SizedBox(height: 4),
            Text(_ebayConnection!.ebayUsername,
                style: GoogleFonts.inter(fontSize: 10, color: Colors.grey)),
          ],
        ]),
      ]),
    );
  }

  Widget _buildToolCard({
    required String  label,
    required IconData icon,
    required Color   color,
    required int     used,
    required int     limit,
    required String  toolKey,
    String?          resetDate,
  }) {
    final isUnlimited = limit >= 999999;
    final pct         = isUnlimited ? 0.0 : (used / limit).clamp(0.0, 1.0);
    final isNearLimit = pct > 0.8;
    final isAtLimit   = pct >= 1.0;

    Color barColor = color;
    if (isAtLimit)   barColor = const Color(0xFFFF4D6A);
    else if (isNearLimit) barColor = const Color(0xFFFFB800);

    String resetText = '';
    if (resetDate != null) {
      try {
        final date = DateTime.parse(resetDate);
        final days = date.difference(DateTime.now()).inDays;
        resetText  = 'Resets in $days days';
      } catch (_) {}
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isAtLimit
              ? const Color(0xFFFF4D6A).withOpacity(0.3)
              : isNearLimit
                  ? const Color(0xFFFFB800).withOpacity(0.3)
                  : const Color(0xFFE2E8F0),
        ),
        boxShadow: [BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(children: [
        Row(children: [
          // Icon
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start,
                children: [
              Text(label, style: GoogleFonts.inter(
                  fontSize: 14, fontWeight: FontWeight.w700,
                  color: const Color(0xFF0F172A))),
              if (resetText.isNotEmpty) ...[
                const SizedBox(height: 2),
                Text(resetText,
                    style: GoogleFonts.inter(
                        fontSize: 11, color: const Color(0xFF94A3B8))),
              ],
            ]),
          ),
          // Usage count
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text(
              isUnlimited ? '$used' : '$used / $limit',
              style: GoogleFonts.spaceGrotesk(
                  fontSize: 16, fontWeight: FontWeight.w700,
                  color: isAtLimit
                      ? const Color(0xFFFF4D6A)
                      : const Color(0xFF0F172A)),
            ),
            Text(isUnlimited ? 'unlimited' : 'uses',
                style: GoogleFonts.inter(
                    fontSize: 10, color: const Color(0xFF94A3B8))),
          ]),
        ]),

        if (!isUnlimited) ...[
          const SizedBox(height: 14),
          LinearProgressIndicator(
            value: pct,
            backgroundColor: const Color(0xFFF1F5F9),
            color: barColor,
            minHeight: 5,
            borderRadius: BorderRadius.circular(3),
          ),
          const SizedBox(height: 6),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text('${(pct * 100).toStringAsFixed(0)}% used',
                style: GoogleFonts.inter(
                    fontSize: 10, color: const Color(0xFF94A3B8))),
            if (isAtLimit)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFFF4D6A).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text('Limit reached — upgrade plan',
                    style: GoogleFonts.inter(
                        fontSize: 10, fontWeight: FontWeight.w600,
                        color: const Color(0xFFFF4D6A))),
              )
            else if (isNearLimit)
              Text('Near limit',
                  style: GoogleFonts.inter(
                      fontSize: 10, color: const Color(0xFFFFB800),
                      fontWeight: FontWeight.w600)),
          ]),
        ],
      ]),
    );
  }
}