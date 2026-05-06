// lib/pages/dashboard_home.dart
//
// SellerPulse - Dashboard Home Page
// Quick stats + Recent activity + Charts

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:fl_chart/fl_chart.dart';

class _C {
  static const bg           = Color(0xFFF8FAFC);
  static const surface      = Color(0xFFFFFFFF);
  static const border       = Color(0xFFE2E8F0);
  static const accent       = Color(0xFF8FFF00);
  static const accentDark   = Color(0xFF131B2F);
  static const accentDim    = Color(0xFFEEFFCC);
  static const textPrimary  = Color(0xFF131B2F);
  static const textSecondary= Color(0xFF64748B);
  static const textHint     = Color(0xFF94A3B8);
  static const riskLow      = Color(0xFF00C48C);
  static const riskMedium   = Color(0xFFFFB800);
  static const riskHigh     = Color(0xFFFF4D6A);
  static const blue         = Color(0xFF1976D2);
}

class DashboardHome extends StatefulWidget {
  final VoidCallback? onGoToOrders;
  final VoidCallback? onGoToAnalytics;
  const DashboardHome({super.key, this.onGoToOrders, this.onGoToAnalytics});

  @override
  State<DashboardHome> createState() => _DashboardHomeState();
}

class _DashboardHomeState extends State<DashboardHome> {
  final _supabase = Supabase.instance.client;

  bool _isLoading = true;

  // Stats
  int _totalOrders = 0;
  int _highRiskOrders = 0;
  int _protectedOrders = 0;
  int _shippedOrders = 0;
  double _totalRevenue = 0;
  double _protectedValue = 0;
  double _estimatedSaved = 0;
  int _totalMessages = 0;

  // Chart data
  List<FlSpot> _revenueTrend = [];
  List<FlSpot> _protectionTrend = [];
  List<Map<String, dynamic>> _dailyData = [];

  // Recent activity
  List<Map<String, dynamic>> _recentActivity = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      await Future.wait([
        _loadStats(),
        _loadRecentActivity(),
      ]);
    } catch (e) {
      debugPrint('Dashboard error: $e');
    }
    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _loadStats() async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return;

    final orders = await _supabase
        .from('protected_orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', ascending: true);

    final messages = await _supabase
        .from('sent_messages')
        .select('id')
        .eq('user_id', userId);

    int high = 0, protected = 0, shipped = 0;
    double revenue = 0, protectedVal = 0;

    final Map<String, Map<String, dynamic>> dailyMap = {};

    for (var o in orders) {
      final price = (o['item_price'] as num?)?.toDouble() ?? 0;
      final risk = '${o['risk_level'] ?? ''}'.trim().toUpperCase();
      final status = '${o['order_status'] ?? ''}'.trim().toLowerCase();
      final isProtected = o['checklist_completed'] == true;

      revenue += price;
      if (risk == 'HIGH') high++;
      if (isProtected) {
        protected++;
        protectedVal += price;
      }
      if (status == 'shipped' || status == 'delivered') shipped++;

      // Daily data for charts
      final date = DateTime.tryParse(o['created_at'] ?? '');
      if (date != null) {
        final key = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
        if (!dailyMap.containsKey(key)) {
          dailyMap[key] = {'revenue': 0.0, 'protected': 0, 'total': 0};
        }
        dailyMap[key]!['revenue'] = (dailyMap[key]!['revenue'] as double) + price;
        dailyMap[key]!['total'] = (dailyMap[key]!['total'] as int) + 1;
        if (isProtected) {
          dailyMap[key]!['protected'] = (dailyMap[key]!['protected'] as int) + 1;
        }
      }
    }

    // Build chart data - last 14 days
    final sortedKeys = dailyMap.keys.toList()..sort();
    final last14 = sortedKeys.length > 14
        ? sortedKeys.sublist(sortedKeys.length - 14)
        : sortedKeys;

    final revSpots = <FlSpot>[];
    final protSpots = <FlSpot>[];
    final daily = <Map<String, dynamic>>[];

    for (int i = 0; i < last14.length; i++) {
      final key = last14[i];
      final rev = (dailyMap[key]!['revenue'] as double);
      final prot = (dailyMap[key]!['protected'] as int).toDouble();
      revSpots.add(FlSpot(i.toDouble(), rev));
      protSpots.add(FlSpot(i.toDouble(), prot));
      daily.add({'date': key, ...dailyMap[key]!});
    }

    if (mounted) {
      setState(() {
        _totalOrders = orders.length;
        _highRiskOrders = high;
        _protectedOrders = protected;
        _shippedOrders = shipped;
        _totalRevenue = revenue;
        _protectedValue = protectedVal;
        _estimatedSaved = protectedVal * 0.15;
        _totalMessages = messages.length;
        _revenueTrend = revSpots;
        _protectionTrend = protSpots;
        _dailyData = daily;
      });
    }
  }

  Future<void> _loadRecentActivity() async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return;

    // Get recent orders
    final orders = await _supabase
        .from('protected_orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', ascending: false)
        .limit(5);

    // Get recent messages
    final messages = await _supabase
        .from('sent_messages')
        .select('*')
        .eq('user_id', userId)
        .order('sent_at', ascending: false)
        .limit(5);

    // Combine and sort by date
    final activities = <Map<String, dynamic>>[];

    for (var o in orders) {
      activities.add({
        'type': 'order',
        'title': o['item_title'] ?? 'Unknown Item',
        'subtitle': '${o['risk_level'] ?? 'LOW'} RISK • \$${(o['item_price'] as num?)?.toStringAsFixed(2) ?? '0.00'}',
        'time': o['created_at'],
        'risk': o['risk_level'],
        'status': o['order_status'],
        'protected': o['checklist_completed'],
        'buyer': o['buyer_username'],
      });
    }

    for (var m in messages) {
      activities.add({
        'type': 'message',
        'title': 'Message sent to ${m['recipient'] ?? 'buyer'}',
        'subtitle': m['template_name'] ?? 'Custom message',
        'time': m['sent_at'],
      });
    }

    // Sort by time
    activities.sort((a, b) {
      final aTime = DateTime.tryParse(a['time'] ?? '') ?? DateTime(2000);
      final bTime = DateTime.tryParse(b['time'] ?? '') ?? DateTime(2000);
      return bTime.compareTo(aTime);
    });

    if (mounted) {
      setState(() => _recentActivity = activities.take(10).toList());
    }
  }

  String _timeAgo(DateTime d) {
    final diff = DateTime.now().difference(d);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${d.day}/${d.month}/${d.year}';
  }

  @override
  Widget build(BuildContext context) {
    final userName = _supabase.auth.currentUser?.userMetadata?['full_name']
        ?.toString().split(' ').first ?? 'Seller';
    final hour = DateTime.now().hour;
    final greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return Scaffold(
      backgroundColor: _C.bg,
      body: _isLoading
          ? _buildLoadingState()
          : RefreshIndicator(
              onRefresh: _loadData,
              color: _C.accent,
              child: TweenAnimationBuilder<double>(
                tween: Tween(begin: 0.0, end: 1.0),
                duration: const Duration(milliseconds: 500),
                curve: Curves.easeOut,
                builder: (context, val, child) => Opacity(
                  opacity: val,
                  child: Transform.translate(
                    offset: Offset(0, 20 * (1 - val)),
                    child: child,
                  ),
                ),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(40, 48, 40, 40),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // ─ Header ─
                      _buildHeader(greeting, userName),
                      const SizedBox(height: 32),

                      // ─ Alert Banner (if high risk) ─
                      if (_highRiskOrders > 0) ...[
                        _buildAlertBanner(),
                        const SizedBox(height: 24),
                      ],

                      // ─ Stats Cards ─
                      _buildStatsGrid(),
                      const SizedBox(height: 28),

                      // ─ Charts Row ─
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(flex: 3, child: _buildRevenueChart()),
                          const SizedBox(width: 20),
                          Expanded(flex: 2, child: _buildRiskDonut()),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // ─ Bottom Row ─
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(flex: 3, child: _buildRecentActivity()),
                          const SizedBox(width: 20),
                          Expanded(flex: 2, child: _buildQuickActions()),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
    );
  }

  // ─ Loading ─────────────────────────────────────────────────
  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 60, height: 60,
            decoration: BoxDecoration(
              color: _C.accentDim,
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Padding(
              padding: EdgeInsets.all(16),
              child: CircularProgressIndicator(
                color: _C.accent, strokeWidth: 3),
            ),
          ),
          const SizedBox(height: 16),
          Text('Loading dashboard...',
            style: GoogleFonts.inter(fontSize: 14, color: _C.textSecondary)),
        ],
      ),
    );
  }

  // ─ Header ──────────────────────────────────────────────────
  Widget _buildHeader(String greeting, String userName) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('$greeting, $userName! 👋',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 28, fontWeight: FontWeight.w700,
                  color: _C.textPrimary, letterSpacing: -0.5,
                )),
              const SizedBox(height: 6),
              Text('Here\'s your SellerPulse overview for today',
                style: GoogleFonts.inter(
                  fontSize: 14, color: _C.textSecondary)),
            ],
          ),
        ),
        // Refresh button
        IconButton(
          onPressed: _loadData,
          icon: const Icon(Icons.refresh, color: _C.textSecondary),
          tooltip: 'Refresh',
        ),
      ],
    );
  }

  // ─ Alert Banner ────────────────────────────────────────────
  Widget _buildAlertBanner() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF1F0),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _C.riskHigh.withOpacity(0.3), width: 1.5),
      ),
      child: Row(
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              color: _C.riskHigh.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.warning_amber_rounded,
                color: _C.riskHigh, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '⚠️ $_highRiskOrders High-Risk ${_highRiskOrders == 1 ? 'Order Needs' : 'Orders Need'} Protection',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 14, fontWeight: FontWeight.w700,
                    color: _C.textPrimary)),
                const SizedBox(height: 2),
                Text('Complete protection checklists before shipping',
                  style: GoogleFonts.inter(
                    fontSize: 12, color: _C.textSecondary)),
              ],
            ),
          ),
          const SizedBox(width: 12),
          MouseRegion(
            cursor: SystemMouseCursors.click,
            child: GestureDetector(
              onTap: widget.onGoToOrders,
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: _C.riskHigh,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text('View Orders',
                  style: GoogleFonts.inter(
                    fontSize: 12, fontWeight: FontWeight.w700,
                    color: Colors.white)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─ Stats Grid ──────────────────────────────────────────────
  Widget _buildStatsGrid() {
    final protectionRate = _totalOrders > 0
        ? (_protectedOrders / _totalOrders * 100).toStringAsFixed(0)
        : '0';

    final stats = [
      {
        'icon': Icons.attach_money_rounded,
        'label': 'Total Revenue',
        'value': '\$${_totalRevenue.toStringAsFixed(2)}',
        'sub': 'From ${_totalOrders} orders',
        'color': _C.blue,
        'bg': const Color(0xFFE3F2FD),
      },
      {
        'icon': Icons.verified_outlined,
        'label': 'Orders Protected',
        'value': '$_protectedOrders/$_totalOrders',
        'sub': '$protectionRate% protection rate',
        'color': _C.accent,
        'bg': _C.accentDim,
      },
      {
        'icon': Icons.savings_outlined,
        'label': 'Est. Money Saved',
        'value': '\$${_estimatedSaved.toStringAsFixed(2)}',
        'sub': 'From dispute prevention',
        'color': _C.riskLow,
        'bg': const Color(0xFFE6FFF5),
      },
      {
        'icon': Icons.local_shipping_outlined,
        'label': 'Orders Shipped',
        'value': '$_shippedOrders',
        'sub': 'Out of $_totalOrders total',
        'color': const Color(0xFF9C27B0),
        'bg': const Color(0xFFF3E5F5),
      },
      {
        'icon': Icons.error_outline_rounded,
        'label': 'High Risk Orders',
        'value': '$_highRiskOrders',
        'sub': 'Need attention',
        'color': _C.riskHigh,
        'bg': const Color(0xFFFFEEF1),
      },
      {
        'icon': Icons.message_outlined,
        'label': 'Messages Sent',
        'value': '$_totalMessages',
        'sub': 'To buyers',
        'color': _C.textSecondary,
        'bg': const Color(0xFFF1F5F9),
      },
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 2.2,
      ),
      itemCount: stats.length,
      itemBuilder: (context, index) {
        final s = stats[index];
        return TweenAnimationBuilder<double>(
          tween: Tween(begin: 0.0, end: 1.0),
          duration: Duration(milliseconds: 300 + (index * 50)),
          curve: Curves.easeOut,
          builder: (context, val, child) => Opacity(
            opacity: val,
            child: Transform.translate(
              offset: Offset(0, 15 * (1 - val)),
              child: child,
            ),
          ),
          child: Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: _C.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: _C.border),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.03),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(
                    color: s['bg'] as Color,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(s['icon'] as IconData,
                      color: s['color'] as Color, size: 22),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(s['value'] as String,
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 20, fontWeight: FontWeight.w800,
                          color: _C.textPrimary)),
                      const SizedBox(height: 2),
                      Text(s['label'] as String,
                        style: GoogleFonts.inter(
                          fontSize: 12, fontWeight: FontWeight.w600,
                          color: _C.textSecondary)),
                      Text(s['sub'] as String,
                        style: GoogleFonts.inter(
                          fontSize: 10, color: _C.textHint)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // ─ Revenue Chart ───────────────────────────────────────────
  Widget _buildRevenueChart() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: _C.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _C.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('Revenue Trend',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 16, fontWeight: FontWeight.w700,
                  color: _C.textPrimary)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _C.accentDim,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text('Last 14 days',
                  style: GoogleFonts.inter(
                    fontSize: 10, color: _C.accentDark,
                    fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 180,
            child: _revenueTrend.isEmpty
                ? _emptyChart('No revenue data yet')
                : LineChart(
                    LineChartData(
                      lineTouchData: LineTouchData(
                        enabled: true,
                        touchTooltipData: LineTouchTooltipData(
                          getTooltipColor: (_) => _C.accentDark,
                          getTooltipItems: (spots) => spots.map((spot) {
                            return LineTooltipItem(
                              '\$${spot.y.toStringAsFixed(2)}',
                              GoogleFonts.inter(
                                fontSize: 11, color: _C.accent,
                                fontWeight: FontWeight.w600),
                            );
                          }).toList(),
                        ),
                      ),
                      gridData: FlGridData(
                        show: true,
                        drawVerticalLine: false,
                        getDrawingHorizontalLine: (_) =>
                            FlLine(color: _C.border, strokeWidth: 1),
                      ),
                      titlesData: FlTitlesData(
                        leftTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            reservedSize: 45,
                            getTitlesWidget: (value, _) => Text(
                              '\$${value.toInt()}',
                              style: GoogleFonts.inter(
                                  fontSize: 9, color: _C.textHint),
                            ),
                          ),
                        ),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            reservedSize: 24,
                            interval: _dailyData.length > 7 ? 3 : 1,
                            getTitlesWidget: (value, _) {
                              final idx = value.toInt();
                              if (idx >= 0 && idx < _dailyData.length) {
                                final date = _dailyData[idx]['date'] as String;
                                final parts = date.split('-');
                                if (parts.length >= 3) {
                                  return Padding(
                                    padding: const EdgeInsets.only(top: 4),
                                    child: Text('${parts[2]}/${parts[1]}',
                                      style: GoogleFonts.inter(
                                          fontSize: 9, color: _C.textHint)),
                                  );
                                }
                              }
                              return const SizedBox();
                            },
                          ),
                        ),
                        rightTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false)),
                        topTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false)),
                      ),
                      borderData: FlBorderData(show: false),
                      minY: 0,
                      lineBarsData: [
                        LineChartBarData(
                          spots: _revenueTrend,
                          isCurved: true,
                          color: _C.blue,
                          barWidth: 3,
                          isStrokeCapRound: true,
                          dotData: FlDotData(
                            show: true,
                            getDotPainter: (spot, _, __, ___) =>
                                FlDotCirclePainter(
                              radius: 3,
                              color: _C.blue,
                              strokeWidth: 2,
                              strokeColor: Colors.white,
                            ),
                          ),
                          belowBarData: BarAreaData(
                            show: true,
                            color: _C.blue.withOpacity(0.08),
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

  // ─ Risk Donut ──────────────────────────────────────────────
  Widget _buildRiskDonut() {
    final high = _highRiskOrders;
    final medium = _totalOrders - _highRiskOrders -
        (_totalOrders - _highRiskOrders - (_protectedOrders > 0 ? 0 : 0));
    // Count medium and low directly
    int med = 0, low = 0;
    // We don't have these counts directly - calculate from total
    // For now use estimated split
    final remaining = _totalOrders - high;

    final sections = <PieChartSectionData>[];
    if (high > 0) {
      sections.add(PieChartSectionData(
        value: high.toDouble(), color: _C.riskHigh,
        title: '$high', radius: 50,
        titleStyle: GoogleFonts.spaceGrotesk(
          fontSize: 12, fontWeight: FontWeight.w800,
          color: Colors.white),
      ));
    }
    if (remaining > 0) {
      sections.add(PieChartSectionData(
        value: remaining.toDouble(),
        color: _C.riskLow,
        title: '$remaining', radius: 45,
        titleStyle: GoogleFonts.spaceGrotesk(
          fontSize: 12, fontWeight: FontWeight.w800,
          color: Colors.white),
      ));
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: _C.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _C.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Risk Overview',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 16, fontWeight: FontWeight.w700,
              color: _C.textPrimary)),
          const SizedBox(height: 20),
          SizedBox(
            height: 140,
            child: sections.isEmpty
                ? _emptyChart('No orders yet')
                : PieChart(PieChartData(
                    sectionsSpace: 3,
                    centerSpaceRadius: 40,
                    sections: sections,
                  )),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _legendDot(_C.riskHigh, 'High Risk ($high)'),
              const SizedBox(width: 16),
              _legendDot(_C.riskLow, 'Others ($remaining)'),
            ],
          ),
          const SizedBox(height: 16),
          // Protection rate bar
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Protection Rate',
                    style: GoogleFonts.inter(
                      fontSize: 12, fontWeight: FontWeight.w600,
                      color: _C.textSecondary)),
                  Text(
                    _totalOrders > 0
                        ? '${(_protectedOrders / _totalOrders * 100).toStringAsFixed(0)}%'
                        : '0%',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 13, fontWeight: FontWeight.w700,
                      color: _C.accent)),
                ],
              ),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: _totalOrders > 0
                      ? _protectedOrders / _totalOrders : 0,
                  backgroundColor: _C.border,
                  valueColor:
                      const AlwaysStoppedAnimation<Color>(_C.accent),
                  minHeight: 8,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _legendDot(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 10, height: 10,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 5),
        Text(label,
          style: GoogleFonts.inter(
            fontSize: 11, color: _C.textSecondary,
            fontWeight: FontWeight.w500)),
      ],
    );
  }

  // ─ Recent Activity ─────────────────────────────────────────
  Widget _buildRecentActivity() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: _C.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _C.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('Recent Activity',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 16, fontWeight: FontWeight.w700,
                  color: _C.textPrimary)),
              const Spacer(),
              MouseRegion(
                cursor: SystemMouseCursors.click,
                child: GestureDetector(
                  onTap: widget.onGoToOrders,
                  child: Text('View all →',
                    style: GoogleFonts.inter(
                      fontSize: 12, color: _C.accent,
                      fontWeight: FontWeight.w600)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (_recentActivity.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 24),
              child: Center(
                child: Text('No activity yet',
                  style: GoogleFonts.inter(
                    fontSize: 13, color: _C.textHint)),
              ),
            )
          else
            ...(_recentActivity.asMap().entries.map((e) {
              final index = e.key;
              final activity = e.value;
              return TweenAnimationBuilder<double>(
                tween: Tween(begin: 0.0, end: 1.0),
                duration: Duration(milliseconds: 300 + (index * 40)),
                curve: Curves.easeOut,
                builder: (context, val, child) => Opacity(
                  opacity: val,
                  child: Transform.translate(
                    offset: Offset(20 * (1 - val), 0),
                    child: child,
                  ),
                ),
                child: _buildActivityItem(activity),
              );
            })),
        ],
      ),
    );
  }

  Widget _buildActivityItem(Map<String, dynamic> activity) {
    final type = activity['type'] as String;
    final title = activity['title'] as String;
    final subtitle = activity['subtitle'] as String? ?? '';
    final timeStr = activity['time'] as String?;
    final time = timeStr != null ? DateTime.tryParse(timeStr) : null;
    final risk = activity['risk'] as String?;
    final isOrder = type == 'order';
    final isMessage = type == 'message';
    final isShipped = activity['status'] == 'shipped';

    Color iconColor;
    Color iconBg;
    IconData icon;

    if (isMessage) {
      iconColor = _C.blue;
      iconBg = const Color(0xFFE3F2FD);
      icon = Icons.message_outlined;
    } else if (isShipped) {
      iconColor = _C.blue;
      iconBg = const Color(0xFFE3F2FD);
      icon = Icons.local_shipping_outlined;
    } else if (risk == 'HIGH') {
      iconColor = _C.riskHigh;
      iconBg = const Color(0xFFFFEEF1);
      icon = Icons.warning_amber_rounded;
    } else if (risk == 'MEDIUM') {
      iconColor = _C.riskMedium;
      iconBg = const Color(0xFFFFF8E1);
      icon = Icons.shield_outlined;
    } else {
      iconColor = _C.riskLow;
      iconBg = const Color(0xFFE6FFF5);
      icon = Icons.check_circle_outline;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _C.bg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: _C.border),
      ),
      child: Row(
        children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              color: iconBg,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: iconColor, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                  style: GoogleFonts.inter(
                    fontSize: 12, fontWeight: FontWeight.w600,
                    color: _C.textPrimary),
                  maxLines: 1, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 2),
                Text(subtitle,
                  style: GoogleFonts.inter(
                    fontSize: 11, color: _C.textSecondary),
                  maxLines: 1, overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(time != null ? _timeAgo(time) : '-',
            style: GoogleFonts.inter(
              fontSize: 10, color: _C.textHint)),
        ],
      ),
    );
  }

  // ─ Quick Actions ───────────────────────────────────────────
  Widget _buildQuickActions() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: _C.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _C.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Quick Actions',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 16, fontWeight: FontWeight.w700,
              color: _C.textPrimary)),
          const SizedBox(height: 16),

          _actionButton(
            icon: Icons.shield_outlined,
            label: 'View All Orders',
            subtitle: '$_totalOrders total orders',
            color: _C.accent,
            bg: _C.accentDim,
            onTap: widget.onGoToOrders,
          ),
          const SizedBox(height: 10),

          _actionButton(
            icon: Icons.warning_amber_rounded,
            label: 'High Risk Orders',
            subtitle: '$_highRiskOrders need attention',
            color: _C.riskHigh,
            bg: const Color(0xFFFFEEF1),
            onTap: widget.onGoToOrders,
          ),
          const SizedBox(height: 10),

          _actionButton(
            icon: Icons.insights_rounded,
            label: 'View Analytics',
            subtitle: 'Charts & monthly report',
            color: _C.blue,
            bg: const Color(0xFFE3F2FD),
            onTap: widget.onGoToAnalytics,
          ),
          const SizedBox(height: 10),

          _actionButton(
            icon: Icons.savings_outlined,
            label: 'Money Saved',
            subtitle: '\$${_estimatedSaved.toStringAsFixed(2)} from disputes',
            color: _C.riskLow,
            bg: const Color(0xFFE6FFF5),
            onTap: null,
          ),

          const SizedBox(height: 20),

          // Value Protected card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF131B2F), Color(0xFF1E2D4F)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 32, height: 32,
                      decoration: BoxDecoration(
                        color: _C.accent.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.security,
                          color: _C.accent, size: 16),
                    ),
                    const SizedBox(width: 10),
                    Text('Total Value Protected',
                      style: GoogleFonts.inter(
                        fontSize: 12, color: Colors.white70,
                        fontWeight: FontWeight.w500)),
                  ],
                ),
                const SizedBox(height: 12),
                Text('\$${_protectedValue.toStringAsFixed(2)}',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 26, fontWeight: FontWeight.w800,
                    color: _C.accent)),
                const SizedBox(height: 4),
                Text('of \$${_totalRevenue.toStringAsFixed(2)} total revenue',
                  style: GoogleFonts.inter(
                    fontSize: 11, color: Colors.white54)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _actionButton({
    required IconData icon,
    required String label,
    required String subtitle,
    required Color color,
    required Color bg,
    required VoidCallback? onTap,
  }) {
    return MouseRegion(
      cursor: onTap != null
          ? SystemMouseCursors.click
          : SystemMouseCursors.basic,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: _C.bg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: _C.border),
          ),
          child: Row(
            children: [
              Container(
                width: 36, height: 36,
                decoration: BoxDecoration(
                  color: bg,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: color, size: 18),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(label,
                      style: GoogleFonts.inter(
                        fontSize: 12, fontWeight: FontWeight.w600,
                        color: _C.textPrimary)),
                    Text(subtitle,
                      style: GoogleFonts.inter(
                        fontSize: 10, color: _C.textSecondary)),
                  ],
                ),
              ),
              if (onTap != null)
                Icon(Icons.arrow_forward_ios,
                    size: 12, color: _C.textHint),
            ],
          ),
        ),
      ),
    );
  }

  Widget _emptyChart(String msg) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.bar_chart, size: 36, color: Colors.grey.shade300),
          const SizedBox(height: 8),
          Text(msg,
            style: GoogleFonts.inter(fontSize: 13, color: _C.textHint)),
        ],
      ),
    );
  }
}