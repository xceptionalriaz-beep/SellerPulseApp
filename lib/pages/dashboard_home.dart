// lib/pages/dashboard_home.dart
//
// SellerPulse — Dashboard Home
// Fully responsive: desktop, tablet, mobile & narrow Chrome tabs
// Changes vs old version:
//   - Removed: onGoToAnalytics, 6-card grid, Messages Sent, Shipped, High Risk cards
//   - Fixed:   Risk donut now shows HIGH / MEDIUM / LOW correctly
//   - Added:   At-Risk Revenue card, multi-alert banners, Action Centre,
//              stale order detection, no-tracking detection, protected value line on chart

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:fl_chart/fl_chart.dart';

class _C {
  static const bg            = Color(0xFFF8FAFC);
  static const surface       = Color(0xFFFFFFFF);
  static const border        = Color(0xFFE2E8F0);
  static const accent        = Color(0xFF8FFF00);
  static const accentDark    = Color(0xFF131B2F);
  static const accentDim     = Color(0xFFEEFFCC);
  static const textPrimary   = Color(0xFF131B2F);
  static const textSecondary = Color(0xFF64748B);
  static const textHint      = Color(0xFF94A3B8);
  static const riskLow       = Color(0xFF00C48C);
  static const riskMedium    = Color(0xFFFFB800);
  static const riskHigh      = Color(0xFFFF4D6A);
  static const blue          = Color(0xFF1976D2);
}

// Breakpoints: mobile < 600, tablet 600-959, desktop >= 960
class _BP {
  static bool isMobile(BuildContext ctx)  => MediaQuery.of(ctx).size.width < 600;
  static bool isTablet(BuildContext ctx)  => MediaQuery.of(ctx).size.width >= 600 && MediaQuery.of(ctx).size.width < 960;

  static double hPad(BuildContext ctx) {
    final w = MediaQuery.of(ctx).size.width;
    if (w < 600) return 16;
    if (w < 960) return 24;
    return 40;
  }
}

class DashboardHome extends StatefulWidget {
  final VoidCallback? onGoToOrders;
  const DashboardHome({super.key, this.onGoToOrders});

  @override
  State<DashboardHome> createState() => _DashboardHomeState();
}

class _DashboardHomeState extends State<DashboardHome> {
  final _supabase = Supabase.instance.client;
  bool _isLoading = true;

  // Counts
  int _totalOrders       = 0;
  int _highRiskOrders    = 0;
  int _mediumRiskOrders  = 0;
  int _lowRiskOrders     = 0;
  int _protectedOrders   = 0;
  int _shippedOrders     = 0;
  int _pendingOrders     = 0;
  int _staleOrders       = 0;  // pending > 7 days
  int _unprotectedHigh   = 0;  // HIGH + not protected
  int _noTrackingShipped = 0;  // shipped, no tracking
  int _totalMessages     = 0;

  // Financial
  double _totalRevenue   = 0;
  double _protectedValue = 0;
  double _atRiskRevenue  = 0;
  double _estimatedSaved = 0;

  // Charts
  List<FlSpot>               _revenueTrend   = [];
  List<FlSpot>               _protectedTrend = [];
  List<Map<String, dynamic>> _dailyData      = [];

  // Activity feed
  List<Map<String, dynamic>> _recentActivity = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  // =========================================================================
  // DATA
  // =========================================================================

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      await Future.wait([_loadStats(), _loadRecentActivity()]);
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

    // Single-pass — no extra DB calls
    int high = 0, medium = 0, low = 0;
    int prot = 0, shipped = 0, pending = 0, stale = 0;
    int unprotHigh = 0, noTracking = 0;
    double revenue = 0, protVal = 0, atRisk = 0;
    final Map<String, Map<String, dynamic>> dailyMap = {};
    final now = DateTime.now();

    for (var o in orders) {
      final price       = (o['item_price']  as num?)?.toDouble() ?? 0;
      final risk        = '${o['risk_level']    ?? ''}'.trim().toUpperCase();
      final status      = '${o['order_status']  ?? ''}'.trim().toLowerCase();
      final isProtected = o['checklist_completed'] == true;
      final tracking    = o['tracking_number'] as String?;
      final createdAt   = DateTime.tryParse(o['created_at'] ?? '');

      revenue += price;

      if (risk == 'HIGH')        high++;
      else if (risk == 'MEDIUM') medium++;
      else                       low++;

      if (isProtected) { prot++; protVal += price; }

      if (status == 'shipped' || status == 'delivered') {
        shipped++;
        if ((tracking == null || tracking.trim().isEmpty) && status == 'shipped') noTracking++;
      } else if (status == 'pending') {
        pending++;
        if (createdAt != null && now.difference(createdAt).inDays >= 7) stale++;
      }

      if (risk == 'HIGH' && !isProtected) { unprotHigh++; atRisk += price; }

      if (createdAt != null) {
        final key = '${createdAt.year}-${createdAt.month.toString().padLeft(2, '0')}-${createdAt.day.toString().padLeft(2, '0')}';
        if (!dailyMap.containsKey(key)) dailyMap[key] = {'revenue': 0.0, 'protected': 0, 'total': 0};
        dailyMap[key]!['revenue']   = (dailyMap[key]!['revenue']   as double) + price;
        dailyMap[key]!['total']     = (dailyMap[key]!['total']     as int)    + 1;
        if (isProtected) dailyMap[key]!['protected'] = (dailyMap[key]!['protected'] as int) + 1;
      }
    }

    final sortedKeys = dailyMap.keys.toList()..sort();
    final last14     = sortedKeys.length > 14 ? sortedKeys.sublist(sortedKeys.length - 14) : sortedKeys;
    final revSpots   = <FlSpot>[];
    final protSpots  = <FlSpot>[];
    final daily      = <Map<String, dynamic>>[];

    for (int i = 0; i < last14.length; i++) {
      final key = last14[i];
      revSpots.add(FlSpot(i.toDouble(), (dailyMap[key]!['revenue']   as double)));
      protSpots.add(FlSpot(i.toDouble(), (dailyMap[key]!['protected'] as int).toDouble()));
      daily.add({'date': key, ...dailyMap[key]!});
    }

    if (mounted) {
      setState(() {
        _totalOrders       = orders.length;
        _highRiskOrders    = high;
        _mediumRiskOrders  = medium;
        _lowRiskOrders     = low;
        _protectedOrders   = prot;
        _shippedOrders     = shipped;
        _pendingOrders     = pending;
        _staleOrders       = stale;
        _unprotectedHigh   = unprotHigh;
        _noTrackingShipped = noTracking;
        _totalRevenue      = revenue;
        _protectedValue    = protVal;
        _atRiskRevenue     = atRisk;
        _estimatedSaved    = protVal * 0.15;
        _totalMessages     = messages.length;
        _revenueTrend      = revSpots;
        _protectedTrend    = protSpots;
        _dailyData         = daily;
      });
    }
  }

  Future<void> _loadRecentActivity() async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return;

    final orders = await _supabase
        .from('protected_orders').select('*').eq('user_id', userId)
        .order('created_at', ascending: false).limit(6);

    final messages = await _supabase
        .from('sent_messages').select('*').eq('user_id', userId)
        .order('sent_at', ascending: false).limit(4);

    final activities = <Map<String, dynamic>>[];
    for (var o in orders) {
      activities.add({
        'type': 'order', 'id': o['id'],
        'title': o['item_title'] ?? 'Unknown Item',
        'subtitle': '${o['risk_level'] ?? 'LOW'} RISK • \$${(o['item_price'] as num?)?.toStringAsFixed(2) ?? '0.00'}',
        'time': o['created_at'], 'risk': o['risk_level'],
        'status': o['order_status'], 'protected': o['checklist_completed'],
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
    activities.sort((a, b) {
      final aT = DateTime.tryParse(a['time'] ?? '') ?? DateTime(2000);
      final bT = DateTime.tryParse(b['time'] ?? '') ?? DateTime(2000);
      return bT.compareTo(aT);
    });
    if (mounted) setState(() => _recentActivity = activities.take(10).toList());
  }

  // =========================================================================
  // BUILD
  // =========================================================================

  @override
  Widget build(BuildContext context) {
    final firstName = _supabase.auth.currentUser?.userMetadata?['full_name']
            ?.toString().split(' ').first ?? 'Seller';
    final hour    = DateTime.now().hour;
    final greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    final mobile  = _BP.isMobile(context);
    final pad     = _BP.hPad(context);

    if (_isLoading) return _buildLoading();

    return Scaffold(
      backgroundColor: _C.bg,
      body: RefreshIndicator(
        onRefresh: _loadData,
        color: _C.accent,
        child: TweenAnimationBuilder<double>(
          tween: Tween(begin: 0.0, end: 1.0),
          duration: const Duration(milliseconds: 450),
          curve: Curves.easeOut,
          builder: (ctx, val, child) => Opacity(opacity: val, child: child),
          child: SingleChildScrollView(
            padding: EdgeInsets.fromLTRB(pad, mobile ? 32 : 48, pad, 40),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(greeting, firstName),
                const SizedBox(height: 24),
                if (_unprotectedHigh > 0 || _staleOrders > 0 || _noTrackingShipped > 0) ...[
                  _buildAlertBanners(),
                  const SizedBox(height: 20),
                ],
                _buildStatCards(),
                const SizedBox(height: 24),
                _buildChartsRow(),
                const SizedBox(height: 24),
                _buildBottomRow(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoading() => Scaffold(
    backgroundColor: _C.bg,
    body: Center(child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(width: 60, height: 60,
          decoration: BoxDecoration(color: _C.accentDim, borderRadius: BorderRadius.circular(16)),
          child: const Padding(padding: EdgeInsets.all(16),
            child: CircularProgressIndicator(color: _C.accent, strokeWidth: 3))),
        const SizedBox(height: 16),
        Text('Loading dashboard…', style: GoogleFonts.inter(fontSize: 14, color: _C.textSecondary)),
      ],
    )),
  );

  // =========================================================================
  // HEADER
  // =========================================================================

  Widget _buildHeader(String greeting, String name) {
    return Row(children: [
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('$greeting, $name! 👋',
          style: GoogleFonts.spaceGrotesk(
            fontSize: _BP.isMobile(context) ? 22 : 28,
            fontWeight: FontWeight.w700, color: _C.textPrimary, letterSpacing: -0.5)),
        const SizedBox(height: 4),
        Text('Here\'s your SellerPulse overview for today',
          style: GoogleFonts.inter(fontSize: 13, color: _C.textSecondary)),
      ])),
      IconButton(onPressed: _loadData,
        icon: const Icon(Icons.refresh, color: _C.textSecondary), tooltip: 'Refresh'),
    ]);
  }

  // =========================================================================
  // ALERT BANNERS — hidden entirely when nothing is urgent
  // =========================================================================

  Widget _buildAlertBanners() {
    final alerts = <Map<String, dynamic>>[];

    if (_unprotectedHigh > 0) alerts.add({
      'color': _C.riskHigh, 'bg': const Color(0xFFFFF1F0),
      'icon': Icons.warning_amber_rounded,
      'text': '$_unprotectedHigh high-risk ${_unprotectedHigh == 1 ? 'order needs' : 'orders need'} protection',
      'sub': '\$${_atRiskRevenue.toStringAsFixed(2)} at risk — complete checklists before shipping',
      'action': 'View orders', 'onTap': widget.onGoToOrders,
    });

    if (_staleOrders > 0) alerts.add({
      'color': _C.riskMedium, 'bg': const Color(0xFFFFF8E1),
      'icon': Icons.schedule_rounded,
      'text': '$_staleOrders ${_staleOrders == 1 ? 'order has' : 'orders have'} been pending for 7+ days',
      'sub': 'Buyers may open a case — check these orders now',
      'action': 'View orders', 'onTap': widget.onGoToOrders,
    });

    if (_noTrackingShipped > 0) alerts.add({
      'color': _C.blue, 'bg': const Color(0xFFE3F2FD),
      'icon': Icons.local_shipping_outlined,
      'text': '$_noTrackingShipped shipped ${_noTrackingShipped == 1 ? 'order has' : 'orders have'} no tracking number',
      'sub': 'Add tracking to protect against "item not received" disputes',
      'action': 'View orders', 'onTap': widget.onGoToOrders,
    });

    return Column(
      children: alerts.asMap().entries.map((e) {
        final a = e.value;
        return TweenAnimationBuilder<double>(
          tween: Tween(begin: 0.0, end: 1.0),
          duration: Duration(milliseconds: 300 + e.key * 60),
          curve: Curves.easeOut,
          builder: (ctx, val, child) => Opacity(opacity: val, child: child),
          child: Container(
            margin: EdgeInsets.only(bottom: e.key < alerts.length - 1 ? 8 : 0),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: a['bg'] as Color,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: (a['color'] as Color).withOpacity(0.35), width: 1.5),
            ),
            child: Row(children: [
              Container(width: 38, height: 38,
                decoration: BoxDecoration(
                  color: (a['color'] as Color).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10)),
                child: Icon(a['icon'] as IconData, color: a['color'] as Color, size: 20)),
              const SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(a['text'] as String,
                  style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w700, color: _C.textPrimary)),
                const SizedBox(height: 2),
                Text(a['sub'] as String,
                  style: GoogleFonts.inter(fontSize: 11, color: _C.textSecondary)),
              ])),
              if (a['onTap'] != null) ...[
                const SizedBox(width: 10),
                GestureDetector(
                  onTap: a['onTap'] as VoidCallback?,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                    decoration: BoxDecoration(color: a['color'] as Color, borderRadius: BorderRadius.circular(8)),
                    child: Text(a['action'] as String,
                      style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white)),
                  ),
                ),
              ],
            ]),
          ),
        );
      }).toList(),
    );
  }

  // =========================================================================
  // 4 KPI STAT CARDS — 2×2 mobile/tablet, 1×4 desktop
  // =========================================================================

  Widget _buildStatCards() {
    final protRate = _totalOrders > 0
        ? (_protectedOrders / _totalOrders * 100).toStringAsFixed(0) : '0';

    final cards = [
      {'icon': Icons.attach_money_rounded, 'label': 'Total Revenue',
       'value': '\$${_totalRevenue.toStringAsFixed(2)}', 'sub': 'From $_totalOrders orders',
       'color': _C.blue, 'bg': const Color(0xFFE3F2FD)},
      {'icon': Icons.verified_outlined, 'label': 'Protection Rate',
       'value': '$protRate%', 'sub': '$_protectedOrders of $_totalOrders orders protected',
       'color': _C.accent, 'bg': _C.accentDim,
       'bar': _totalOrders > 0 ? _protectedOrders / _totalOrders : 0.0},
      {'icon': Icons.shield_outlined, 'label': 'At-Risk Revenue',
       'value': '\$${_atRiskRevenue.toStringAsFixed(2)}',
       'sub': '$_unprotectedHigh unprotected high-risk orders',
       'color': _unprotectedHigh > 0 ? _C.riskHigh : _C.riskLow,
       'bg': _unprotectedHigh > 0 ? const Color(0xFFFFEEF1) : const Color(0xFFE6FFF5)},
      {'icon': Icons.savings_outlined, 'label': 'Est. Money Saved',
       'value': '\$${_estimatedSaved.toStringAsFixed(2)}', 'sub': 'From dispute prevention',
       'color': _C.riskLow, 'bg': const Color(0xFFE6FFF5)},
    ];

    if (_BP.isMobile(context) || _BP.isTablet(context)) {
      return Column(children: [
        Row(children: [
          Expanded(child: _statCard(cards[0], 0)),
          const SizedBox(width: 12),
          Expanded(child: _statCard(cards[1], 1)),
        ]),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: _statCard(cards[2], 2)),
          const SizedBox(width: 12),
          Expanded(child: _statCard(cards[3], 3)),
        ]),
      ]);
    }

    return Row(children: cards.asMap().entries.map((e) => Expanded(
      child: Padding(padding: EdgeInsets.only(left: e.key > 0 ? 14 : 0),
        child: _statCard(e.value, e.key)))).toList());
  }

  Widget _statCard(Map<String, dynamic> s, int index) {
    final bar    = s['bar']    as double?;
    final mobile = _BP.isMobile(context);
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: Duration(milliseconds: 300 + index * 60),
      curve: Curves.easeOut,
      builder: (ctx, val, child) => Opacity(opacity: val,
        child: Transform.translate(offset: Offset(0, 12 * (1 - val)), child: child)),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: _C.surface,
          borderRadius: BorderRadius.circular(16), border: Border.all(color: _C.border)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(width: 38, height: 38,
              decoration: BoxDecoration(color: s['bg'] as Color, borderRadius: BorderRadius.circular(10)),
              child: Icon(s['icon'] as IconData, color: s['color'] as Color, size: 19)),
            const Spacer(),
            Flexible(child: Text(s['value'] as String,
              textAlign: TextAlign.right,
              style: GoogleFonts.spaceGrotesk(
                fontSize: mobile ? 16 : 19, fontWeight: FontWeight.w800, color: _C.textPrimary))),
          ]),
          const SizedBox(height: 10),
          Text(s['label'] as String,
            style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: _C.textSecondary)),
          const SizedBox(height: 2),
          Text(s['sub'] as String,
            style: GoogleFonts.inter(fontSize: 10, color: _C.textHint),
            maxLines: 2, overflow: TextOverflow.ellipsis),
          if (bar != null) ...[
            const SizedBox(height: 8),
            ClipRRect(borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(value: bar, backgroundColor: _C.border,
                valueColor: const AlwaysStoppedAnimation<Color>(_C.accent), minHeight: 5)),
          ],
        ]),
      ),
    );
  }

  // =========================================================================
  // CHARTS ROW
  // =========================================================================

  Widget _buildChartsRow() {
    final mobile = _BP.isMobile(context);
    final tablet = _BP.isTablet(context);
    if (mobile) return Column(children: [_buildRevenueChart(), const SizedBox(height: 16), _buildRiskDonut()]);
    return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Expanded(flex: tablet ? 1 : 3, child: _buildRevenueChart()),
      const SizedBox(width: 16),
      Expanded(flex: tablet ? 1 : 2, child: _buildRiskDonut()),
    ]);
  }

  Widget _buildRevenueChart() {
    final avgPrice = _totalOrders > 0 ? _totalRevenue / _totalOrders : 0.0;
    final protValueSpots = _protectedTrend.map((s) => FlSpot(s.x, s.y * avgPrice)).toList();

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: _C.surface,
        borderRadius: BorderRadius.circular(16), border: Border.all(color: _C.border)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Text('Revenue Trend', style: GoogleFonts.spaceGrotesk(
            fontSize: 15, fontWeight: FontWeight.w700, color: _C.textPrimary)),
          const Spacer(),
          Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: _C.accentDim, borderRadius: BorderRadius.circular(20)),
            child: Text('Last 14 days', style: GoogleFonts.inter(
              fontSize: 10, color: _C.accentDark, fontWeight: FontWeight.w600))),
        ]),
        const SizedBox(height: 8),
        Row(children: [
          _chartLegend(_C.blue, 'Revenue'),
          const SizedBox(width: 14),
          _chartLegend(_C.accent, 'Protected value'),
        ]),
        const SizedBox(height: 16),
        SizedBox(height: 170,
          child: _revenueTrend.isEmpty ? _emptyChart('No revenue data yet')
            : LineChart(LineChartData(
                lineTouchData: LineTouchData(enabled: true,
                  touchTooltipData: LineTouchTooltipData(
                    getTooltipColor: (_) => _C.accentDark,
                    getTooltipItems: (spots) => spots.map((s) => LineTooltipItem(
                      '${s.barIndex == 0 ? 'Revenue' : 'Protected'}: \$${s.y.toStringAsFixed(2)}',
                      GoogleFonts.inter(fontSize: 10, color: _C.accent, fontWeight: FontWeight.w600))).toList())),
                gridData: FlGridData(show: true, drawVerticalLine: false,
                  getDrawingHorizontalLine: (_) => FlLine(color: _C.border, strokeWidth: 1)),
                titlesData: FlTitlesData(
                  leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 48,
                    getTitlesWidget: (v, _) => Text('\$${v.toInt()}',
                      style: GoogleFonts.inter(fontSize: 9, color: _C.textHint)))),
                  bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 22,
                    interval: _dailyData.length > 7 ? 3 : 1,
                    getTitlesWidget: (v, _) {
                      final idx = v.toInt();
                      if (idx >= 0 && idx < _dailyData.length) {
                        final parts = (_dailyData[idx]['date'] as String).split('-');
                        if (parts.length >= 3) return Padding(padding: const EdgeInsets.only(top: 4),
                          child: Text('${parts[2]}/${parts[1]}',
                            style: GoogleFonts.inter(fontSize: 9, color: _C.textHint)));
                      }
                      return const SizedBox();
                    })),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles:   const AxisTitles(sideTitles: SideTitles(showTitles: false))),
                borderData: FlBorderData(show: false),
                minY: 0,
                lineBarsData: [
                  LineChartBarData(spots: _revenueTrend, isCurved: true, color: _C.blue,
                    barWidth: 2.5, isStrokeCapRound: true,
                    dotData: FlDotData(show: true, getDotPainter: (spot, pct, bar, idx) {
                      final isLast = idx == _revenueTrend.length - 1;
                      return FlDotCirclePainter(radius: isLast ? 5 : 3,
                        color: _C.blue, strokeWidth: 2, strokeColor: Colors.white);
                    }),
                    belowBarData: BarAreaData(show: true, color: _C.blue.withOpacity(0.07))),
                  if (protValueSpots.isNotEmpty)
                    LineChartBarData(spots: protValueSpots, isCurved: true, color: _C.accent,
                      barWidth: 2, isStrokeCapRound: true, dashArray: [5, 3],
                      dotData: const FlDotData(show: false),
                      belowBarData: BarAreaData(show: true, color: _C.accent.withOpacity(0.05))),
                ]))),
      ]),
    );
  }

  Widget _chartLegend(Color color, String label) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Container(width: 14, height: 3,
        decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2))),
      const SizedBox(width: 5),
      Text(label, style: GoogleFonts.inter(fontSize: 10, color: _C.textSecondary)),
    ]);
  }

  // ─── Risk Donut — FIXED: HIGH / MEDIUM / LOW properly loaded ─────────

  Widget _buildRiskDonut() {
    final sections = <PieChartSectionData>[];
    if (_highRiskOrders   > 0) sections.add(PieChartSectionData(value: _highRiskOrders.toDouble(),
      color: _C.riskHigh,   title: '$_highRiskOrders',   radius: 50,
      titleStyle: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.white)));
    if (_mediumRiskOrders > 0) sections.add(PieChartSectionData(value: _mediumRiskOrders.toDouble(),
      color: _C.riskMedium, title: '$_mediumRiskOrders', radius: 46,
      titleStyle: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.white)));
    if (_lowRiskOrders    > 0) sections.add(PieChartSectionData(value: _lowRiskOrders.toDouble(),
      color: _C.riskLow,    title: '$_lowRiskOrders',    radius: 42,
      titleStyle: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.white)));

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: _C.surface,
        borderRadius: BorderRadius.circular(16), border: Border.all(color: _C.border)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Risk Overview', style: GoogleFonts.spaceGrotesk(
          fontSize: 15, fontWeight: FontWeight.w700, color: _C.textPrimary)),
        const SizedBox(height: 16),
        SizedBox(height: 140,
          child: sections.isEmpty ? _emptyChart('No orders yet')
            : PieChart(PieChartData(
                sectionsSpace: sections.length == 1 ? 0 : 3,
                centerSpaceRadius: 38, sections: sections))),
        const SizedBox(height: 12),
        Wrap(spacing: 12, runSpacing: 6, children: [
          if (_highRiskOrders   > 0) _riskLegend(_C.riskHigh,   'High ($_highRiskOrders)'),
          if (_mediumRiskOrders > 0) _riskLegend(_C.riskMedium, 'Medium ($_mediumRiskOrders)'),
          if (_lowRiskOrders    > 0) _riskLegend(_C.riskLow,    'Low ($_lowRiskOrders)'),
        ]),
        const SizedBox(height: 14),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('Protection Rate', style: GoogleFonts.inter(
            fontSize: 11, fontWeight: FontWeight.w600, color: _C.textSecondary)),
          Text(_totalOrders > 0
              ? '${(_protectedOrders / _totalOrders * 100).toStringAsFixed(0)}%' : '0%',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 13, fontWeight: FontWeight.w700, color: _C.accent)),
        ]),
        const SizedBox(height: 6),
        ClipRRect(borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: _totalOrders > 0 ? _protectedOrders / _totalOrders : 0,
            backgroundColor: _C.border,
            valueColor: const AlwaysStoppedAnimation<Color>(_C.accent),
            minHeight: 7)),
      ]),
    );
  }

  Widget _riskLegend(Color color, String label) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Container(width: 9, height: 9,
        decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
      const SizedBox(width: 5),
      Text(label, style: GoogleFonts.inter(
        fontSize: 10, color: _C.textSecondary, fontWeight: FontWeight.w500)),
    ]);
  }

  // =========================================================================
  // BOTTOM ROW
  // =========================================================================

  Widget _buildBottomRow() {
    final mobile = _BP.isMobile(context);
    final tablet = _BP.isTablet(context);
    if (mobile) return Column(children: [
      _buildRecentActivity(), const SizedBox(height: 16), _buildActionCentre()]);
    return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Expanded(flex: tablet ? 1 : 3, child: _buildRecentActivity()),
      const SizedBox(width: 16),
      Expanded(flex: tablet ? 1 : 2, child: _buildActionCentre()),
    ]);
  }

  Widget _buildRecentActivity() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: _C.surface,
        borderRadius: BorderRadius.circular(16), border: Border.all(color: _C.border)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Text('Recent Activity', style: GoogleFonts.spaceGrotesk(
            fontSize: 15, fontWeight: FontWeight.w700, color: _C.textPrimary)),
          const Spacer(),
          GestureDetector(onTap: widget.onGoToOrders,
            child: Text('View all →', style: GoogleFonts.inter(
              fontSize: 12, color: _C.accent, fontWeight: FontWeight.w600))),
        ]),
        const SizedBox(height: 14),
        if (_recentActivity.isEmpty)
          Padding(padding: const EdgeInsets.symmetric(vertical: 20),
            child: Center(child: Text('No activity yet',
              style: GoogleFonts.inter(fontSize: 13, color: _C.textHint))))
        else
          ..._recentActivity.asMap().entries.map((e) =>
            TweenAnimationBuilder<double>(
              tween: Tween(begin: 0.0, end: 1.0),
              duration: Duration(milliseconds: 250 + e.key * 35),
              curve: Curves.easeOut,
              builder: (ctx, val, child) => Opacity(opacity: val,
                child: Transform.translate(offset: Offset(16 * (1 - val), 0), child: child)),
              child: _buildActivityItem(e.value))),
      ]),
    );
  }

  Widget _buildActivityItem(Map<String, dynamic> a) {
    final type      = a['type']   as String;
    final title     = a['title']  as String;
    final subtitle  = a['subtitle'] as String? ?? '';
    final time      = DateTime.tryParse(a['time'] as String? ?? '');
    final risk      = a['risk']   as String?;
    final isShipped = a['status'] == 'shipped';

    Color iconColor; Color iconBg; IconData icon;
    if      (type == 'message') { iconColor = _C.blue;       iconBg = const Color(0xFFE3F2FD); icon = Icons.message_outlined; }
    else if (isShipped)          { iconColor = _C.blue;       iconBg = const Color(0xFFE3F2FD); icon = Icons.local_shipping_outlined; }
    else if (risk == 'HIGH')     { iconColor = _C.riskHigh;   iconBg = const Color(0xFFFFEEF1); icon = Icons.warning_amber_rounded; }
    else if (risk == 'MEDIUM')   { iconColor = _C.riskMedium; iconBg = const Color(0xFFFFF8E1); icon = Icons.shield_outlined; }
    else                         { iconColor = _C.riskLow;    iconBg = const Color(0xFFE6FFF5); icon = Icons.check_circle_outline; }

    return MouseRegion(
      cursor: type == 'order' && widget.onGoToOrders != null
        ? SystemMouseCursors.click : SystemMouseCursors.basic,
      child: GestureDetector(
        onTap: type == 'order' ? widget.onGoToOrders : null,
        child: Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(11),
          decoration: BoxDecoration(color: _C.bg,
            borderRadius: BorderRadius.circular(10), border: Border.all(color: _C.border)),
          child: Row(children: [
            Container(width: 34, height: 34,
              decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(9)),
              child: Icon(icon, color: iconColor, size: 16)),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(title, style: GoogleFonts.inter(
                fontSize: 12, fontWeight: FontWeight.w600, color: _C.textPrimary),
                maxLines: 1, overflow: TextOverflow.ellipsis),
              const SizedBox(height: 1),
              Text(subtitle, style: GoogleFonts.inter(fontSize: 10, color: _C.textSecondary),
                maxLines: 1, overflow: TextOverflow.ellipsis),
            ])),
            const SizedBox(width: 6),
            Text(time != null ? _timeAgo(time) : '-',
              style: GoogleFonts.inter(fontSize: 10, color: _C.textHint)),
            if (type == 'order') ...[
              const SizedBox(width: 4),
              Icon(Icons.arrow_forward_ios, size: 10, color: _C.textHint),
            ],
          ]),
        ),
      ),
    );
  }

  // ─── Action Centre ────────────────────────────────────────────────────

  Widget _buildActionCentre() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: _C.surface,
        borderRadius: BorderRadius.circular(16), border: Border.all(color: _C.border)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Action Centre', style: GoogleFonts.spaceGrotesk(
          fontSize: 15, fontWeight: FontWeight.w700, color: _C.textPrimary)),
        const SizedBox(height: 14),

        if (_unprotectedHigh > 0)
          _actionItem(icon: Icons.shield_outlined, color: _C.riskHigh, bg: const Color(0xFFFFEEF1),
            label: 'Protect $_unprotectedHigh high-risk ${_unprotectedHigh == 1 ? 'order' : 'orders'}',
            sub: '\$${_atRiskRevenue.toStringAsFixed(2)} at risk right now',
            onTap: widget.onGoToOrders, urgent: true),

        if (_staleOrders > 0)
          _actionItem(icon: Icons.schedule_rounded, color: _C.riskMedium, bg: const Color(0xFFFFF8E1),
            label: '$_staleOrders ${_staleOrders == 1 ? 'order' : 'orders'} pending 7+ days',
            sub: 'Buyers may open a case — act now',
            onTap: widget.onGoToOrders, urgent: true),

        if (_noTrackingShipped > 0)
          _actionItem(icon: Icons.local_shipping_outlined, color: _C.blue, bg: const Color(0xFFE3F2FD),
            label: '$_noTrackingShipped ${_noTrackingShipped == 1 ? 'order' : 'orders'} missing tracking',
            sub: 'Dispute risk — add tracking numbers',
            onTap: widget.onGoToOrders),

        if (_pendingOrders > 0)
          _actionItem(icon: Icons.pending_outlined, color: _C.riskMedium, bg: const Color(0xFFFFF8E1),
            label: '$_pendingOrders ${_pendingOrders == 1 ? 'order' : 'orders'} awaiting shipment',
            sub: 'Ready to pack and ship',
            onTap: widget.onGoToOrders),

        _actionItem(icon: Icons.list_alt_outlined, color: _C.accent, bg: _C.accentDim,
          label: 'View all $_totalOrders orders',
          sub: 'Open the orders dashboard',
          onTap: widget.onGoToOrders),

        const SizedBox(height: 8),

        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: _C.accentDark, borderRadius: BorderRadius.circular(12)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Container(width: 30, height: 30,
                decoration: BoxDecoration(color: _C.accent.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8)),
                child: const Icon(Icons.security, color: _C.accent, size: 15)),
              const SizedBox(width: 10),
              Text('Total Value Protected', style: GoogleFonts.inter(
                fontSize: 11, color: Colors.white70, fontWeight: FontWeight.w500)),
            ]),
            const SizedBox(height: 10),
            Text('\$${_protectedValue.toStringAsFixed(2)}', style: GoogleFonts.spaceGrotesk(
              fontSize: 24, fontWeight: FontWeight.w800, color: _C.accent)),
            const SizedBox(height: 3),
            Text('of \$${_totalRevenue.toStringAsFixed(2)} total revenue',
              style: GoogleFonts.inter(fontSize: 10, color: Colors.white38)),
          ]),
        ),
      ]),
    );
  }

  Widget _actionItem({
    required IconData icon, required Color color, required Color bg,
    required String label, required String sub,
    required VoidCallback? onTap, bool urgent = false,
  }) {
    return MouseRegion(
      cursor: onTap != null ? SystemMouseCursors.click : SystemMouseCursors.basic,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(11),
          decoration: BoxDecoration(
            color: urgent ? color.withOpacity(0.05) : _C.bg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: urgent ? color.withOpacity(0.3) : _C.border,
              width: urgent ? 1.5 : 1)),
          child: Row(children: [
            Container(width: 34, height: 34,
              decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(9)),
              child: Icon(icon, color: color, size: 16)),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(label, style: GoogleFonts.inter(
                fontSize: 12, fontWeight: FontWeight.w600, color: _C.textPrimary)),
              Text(sub, style: GoogleFonts.inter(fontSize: 10, color: _C.textSecondary)),
            ])),
            if (onTap != null) Icon(Icons.arrow_forward_ios, size: 10, color: _C.textHint),
          ]),
        ),
      ),
    );
  }

  // =========================================================================
  // HELPERS
  // =========================================================================

  Widget _emptyChart(String msg) => Center(child: Column(
    mainAxisAlignment: MainAxisAlignment.center,
    children: [
      Icon(Icons.bar_chart, size: 32, color: Colors.grey.shade300),
      const SizedBox(height: 8),
      Text(msg, style: GoogleFonts.inter(fontSize: 12, color: _C.textHint)),
    ]));

  String _timeAgo(DateTime d) {
    final diff = DateTime.now().difference(d);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours   < 24) return '${diff.inHours}h ago';
    if (diff.inDays    < 7)  return '${diff.inDays}d ago';
    return '${d.day}/${d.month}';
  }
}