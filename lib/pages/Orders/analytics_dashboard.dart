// lib/pages/orders/analytics_dashboard.dart
//
// SellerPulse - Analytics Dashboard
// Polish v2: All 8 analytics fixes applied

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:fl_chart/fl_chart.dart';
import 'export_service.dart';

class _C {
  static const bg          = Color(0xFFF8FAFC);
  static const surface     = Color(0xFFFFFFFF);
  static const border      = Color(0xFFE2E8F0);
  static const accent      = Color(0xFF8FFF00);
  static const accentDark  = Color(0xFF131B2F);
  static const accentDim   = Color(0xFFEEFFCC);
  static const textPrimary = Color(0xFF131B2F);
  static const textSecondary = Color(0xFF64748B);
  static const textHint    = Color(0xFF94A3B8);
  static const riskLow     = Color(0xFF00C48C);
  static const riskMedium  = Color(0xFFFFB800);
  static const riskHigh    = Color(0xFFFF4D6A);
  static const blue        = Color(0xFF1976D2);
}

class AnalyticsDashboard extends StatefulWidget {
  const AnalyticsDashboard({super.key});

  @override
  State<AnalyticsDashboard> createState() => _AnalyticsDashboardState();
}

class _AnalyticsDashboardState extends State<AnalyticsDashboard> {
  final _supabase = Supabase.instance.client;

  bool _isLoading = true;
  bool _isSwitchingRange = false; // FIX #14
  String _timeRange = '30';

  List<Map<String, dynamic>> _orders = [];

  int _totalOrders = 0;
  int _protectedOrders = 0;
  int _shippedOrders = 0;
  int _highRiskOrders = 0;
  int _mediumRiskOrders = 0;
  int _lowRiskOrders = 0;
  double _totalValue = 0;
  double _protectedValue = 0;
  double _estimatedSaved = 0;

  List<FlSpot> _protectionTrend = [];
  List<Map<String, dynamic>> _dailyOrders = [];

  // FIX #16: Tooltip tracking
  int _lineTouchedIndex = -1;
  int _barTouchedIndex = -1;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData({bool isSwitching = false}) async {
    // FIX #14: Show loading when switching range
    if (isSwitching) {
      setState(() => _isSwitchingRange = true);
    } else {
      setState(() => _isLoading = true);
    }

    try {
      final userId = _supabase.auth.currentUser?.id;
      if (userId == null) return;

      var query = _supabase
          .from('protected_orders')
          .select('*')
          .eq('user_id', userId);

      if (_timeRange != 'all') {
        final days = int.parse(_timeRange);
        final from = DateTime.now().subtract(Duration(days: days));
        query = query.gte('created_at', from.toIso8601String());
      }

      final data = await query.order('created_at', ascending: true);
      _orders = List<Map<String, dynamic>>.from(data);
      _computeStats();
      _computeChartData();
    } catch (e) {
      debugPrint('Analytics error: $e');
    }

    if (mounted) {
      setState(() {
        _isLoading = false;
        _isSwitchingRange = false;
      });
    }
  }

  void _computeStats() {
    _totalOrders = _orders.length;
    _protectedOrders = 0;
    _shippedOrders = 0;
    _highRiskOrders = 0;
    _mediumRiskOrders = 0;
    _lowRiskOrders = 0;
    _totalValue = 0;
    _protectedValue = 0;

    for (var o in _orders) {
      final price = (o['item_price'] as num?)?.toDouble() ?? 0.0;
      final risk = o['risk_level'] as String? ?? 'LOW';
      final protected = o['checklist_completed'] as bool? ?? false;
      final status = o['order_status'] as String? ?? 'pending';

      _totalValue += price;
      if (protected) {
        _protectedOrders++;
        _protectedValue += price;
      }
      if (status == 'shipped' || status == 'delivered') _shippedOrders++;
      if (risk == 'HIGH') _highRiskOrders++;
      else if (risk == 'MEDIUM') _mediumRiskOrders++;
      else _lowRiskOrders++;
    }

    final highRiskProtectedValue = _orders
        .where((o) =>
            o['risk_level'] == 'HIGH' &&
            (o['checklist_completed'] as bool? ?? false))
        .fold<double>(
            0,
            (sum, o) =>
                sum + ((o['item_price'] as num?)?.toDouble() ?? 0));
    _estimatedSaved = highRiskProtectedValue * 0.15;
  }

  void _computeChartData() {
    final Map<String, int> dailyMap = {};
    final Map<String, int> protectedMap = {};

    for (var o in _orders) {
      final date = DateTime.tryParse(o['created_at'] ?? '');
      if (date == null) continue;
      final key =
          '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
      dailyMap[key] = (dailyMap[key] ?? 0) + 1;
      if (o['checklist_completed'] == true) {
        protectedMap[key] = (protectedMap[key] ?? 0) + 1;
      }
    }

    final sortedKeys = dailyMap.keys.toList()..sort();
    _protectionTrend = [];
    _dailyOrders = [];

    for (int i = 0; i < sortedKeys.length; i++) {
      final key = sortedKeys[i];
      final total = dailyMap[key] ?? 0;
      final protected = protectedMap[key] ?? 0;
      _protectionTrend.add(FlSpot(i.toDouble(), protected.toDouble()));
      _dailyOrders.add({
        'date': key,
        'total': total,
        'protected': protected,
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // FIX #9: Full loading state
    if (_isLoading) {
      return Scaffold(
        backgroundColor: _C.bg,
        body: Center(
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
                    color: _C.accent,
                    strokeWidth: 3,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text('Loading analytics...',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: _C.textSecondary,
                )),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: _C.bg,
      body: CustomScrollView(
        slivers: [
          // Header
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(40, 48, 40, 24),
              child: Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Analytics',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 28,
                          fontWeight: FontWeight.w700,
                          color: _C.textPrimary,
                          letterSpacing: -0.5,
                        )),
                      const SizedBox(height: 6),
                      Text('Order protection insights & trends',
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          color: _C.textSecondary,
                        )),
                    ],
                  ),
                  const Spacer(),
                  // Export PDF button
                  MouseRegion(
                    cursor: SystemMouseCursors.click,
                    child: GestureDetector(
                      onTap: () => ExportService.exportAnalyticsToPDF(
                        context: context,
                        orders: _orders,
                        timeRange: _timeRange,
                        totalOrders: _totalOrders,
                        protectedOrders: _protectedOrders,
                        shippedOrders: _shippedOrders,
                        highRiskOrders: _highRiskOrders,
                        mediumRiskOrders: _mediumRiskOrders,
                        lowRiskOrders: _lowRiskOrders,
                        totalValue: _totalValue,
                        protectedValue: _protectedValue,
                        estimatedSaved: _estimatedSaved,
                      ),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 10),
                        decoration: BoxDecoration(
                          color: const Color(0xFF131B2F),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.picture_as_pdf,
                                size: 16, color: Color(0xFF8FFF00)),
                            const SizedBox(width: 8),
                            Text('Export PDF',
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              )),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  _buildTimeRangePicker(),
                ],
              ),
            ),
          ),

          // FIX #15: Animated stats cards
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 40),
              child: _buildStatsCards(),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 24)),

          // FIX #14: Show loading overlay when switching range
          if (_isSwitchingRange)
            SliverToBoxAdapter(
              child: Container(
                height: 200,
                alignment: Alignment.center,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const CircularProgressIndicator(color: _C.accent),
                    const SizedBox(height: 12),
                    Text('Updating charts...',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        color: _C.textSecondary,
                      )),
                  ],
                ),
              ),
            )
          else ...[
            // Charts Row
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(flex: 3, child: _buildLineChart()),
                    const SizedBox(width: 20),
                    Expanded(flex: 2, child: _buildPieChart()),
                  ],
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 20)),

            // Bar Chart
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: _buildBarChart(),
              ),
            ),

            // Monthly Report
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(40, 20, 40, 40),
                child: _buildMonthlyReport(),
              ),
            ),
          ],
        ],
      ),
    );
  }

  // FIX #14: Time range picker with loading
  Widget _buildTimeRangePicker() {
    return Container(
      decoration: BoxDecoration(
        color: _C.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: _C.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _timeBtn('7', '7 Days'),
          _timeBtn('30', '30 Days'),
          _timeBtn('all', 'All Time'),
        ],
      ),
    );
  }

  Widget _timeBtn(String value, String label) {
    final isActive = _timeRange == value;
    return GestureDetector(
      onTap: () {
        if (_timeRange == value) return;
        setState(() => _timeRange = value);
        _loadData(isSwitching: true);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isActive ? _C.accent : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(label,
          style: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isActive ? _C.accentDark : _C.textSecondary,
          )),
      ),
    );
  }

  // FIX #15: Animated stats cards
  Widget _buildStatsCards() {
    final protectionRate = _totalOrders > 0
        ? (_protectedOrders / _totalOrders * 100).toStringAsFixed(0)
        : '0';

    final cards = [
      {
        'icon': Icons.verified_outlined,
        'iconBg': _C.accentDim,
        'iconColor': _C.accentDark,
        'label': 'Orders Protected',
        'value': '$_protectedOrders/$_totalOrders',
        'sub': '$protectionRate% protection rate',
        'subColor': _C.riskLow,
        'delay': 0,
      },
      {
        'icon': Icons.savings_outlined,
        'iconBg': const Color(0xFFE8F5E9),
        'iconColor': _C.riskLow,
        'label': 'Est. Money Saved',
        'value': '\$${_estimatedSaved.toStringAsFixed(2)}',
        'sub': 'From dispute prevention',
        'subColor': _C.riskLow,
        'delay': 100,
      },
      {
        'icon': Icons.attach_money,
        'iconBg': const Color(0xFFE3F2FD),
        'iconColor': _C.blue,
        'label': 'Total Value Protected',
        'value': '\$${_protectedValue.toStringAsFixed(2)}',
        'sub': 'of \$${_totalValue.toStringAsFixed(2)} total',
        'subColor': _C.blue,
        'delay': 200,
      },
      {
        'icon': Icons.local_shipping_outlined,
        'iconBg': const Color(0xFFF3E5F5),
        'iconColor': const Color(0xFF9C27B0),
        'label': 'Orders Shipped',
        'value': '$_shippedOrders',
        'sub': '${_totalOrders > 0 ? (_shippedOrders / _totalOrders * 100).toStringAsFixed(0) : 0}% of all orders',
        'subColor': const Color(0xFF9C27B0),
        'delay': 300,
      },
    ];

    return Row(
      children: cards.asMap().entries.map((e) {
        final card = e.value;
        final delay = card['delay'] as int;
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(left: e.key > 0 ? 16 : 0),
            child: TweenAnimationBuilder<double>(
              tween: Tween(begin: 0.0, end: 1.0),
              duration: Duration(milliseconds: 400 + delay),
              curve: Curves.easeOut,
              builder: (ctx, val, child) => Opacity(
                opacity: val,
                child: Transform.translate(
                  offset: Offset(0, 20 * (1 - val)),
                  child: child,
                ),
              ),
              child: _statCard(
                icon: card['icon'] as IconData,
                iconBg: card['iconBg'] as Color,
                iconColor: card['iconColor'] as Color,
                label: card['label'] as String,
                value: card['value'] as String,
                sub: card['sub'] as String,
                subColor: card['subColor'] as Color,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _statCard({
    required IconData icon,
    required Color iconBg,
    required Color iconColor,
    required String label,
    required String value,
    required String sub,
    required Color subColor,
  }) {
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
              Container(
                width: 40, height: 40,
                decoration: BoxDecoration(
                  color: iconBg,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: iconColor, size: 20),
              ),
              const Spacer(),
              Text(value,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: _C.textPrimary,
                )),
            ],
          ),
          const SizedBox(height: 12),
          Text(label,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: _C.textSecondary,
            )),
          const SizedBox(height: 4),
          Text(sub,
            style: GoogleFonts.inter(
              fontSize: 11,
              color: subColor,
              fontWeight: FontWeight.w600,
            )),
        ],
      ),
    );
  }

  // FIX #11 #16: Line Chart with proper dates + tooltips
  Widget _buildLineChart() {
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
              Text('Protection Trend',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: _C.textPrimary,
                )),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _C.accentDim,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text('Protected orders per day',
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    color: _C.accentDark,
                    fontWeight: FontWeight.w600,
                  )),
              ),
            ],
          ),
          const SizedBox(height: 24),
          SizedBox(
            height: 200,
            child: _protectionTrend.isEmpty
                ? _emptyChart('No data for this period')
                : LineChart(
                    LineChartData(
                      // FIX #16: Touch tooltip
                      lineTouchData: LineTouchData(
                        enabled: true,
                        touchTooltipData: LineTouchTooltipData(
                          getTooltipColor: (_) => _C.accentDark,
                          getTooltipItems: (spots) => spots.map((spot) {
                            final idx = spot.x.toInt();
                            final date = idx < _dailyOrders.length
                                ? _dailyOrders[idx]['date'] as String
                                : '';
                            return LineTooltipItem(
                              '${spot.y.toInt()} protected\n$date',
                              GoogleFonts.inter(
                                fontSize: 11,
                                color: _C.accent,
                                fontWeight: FontWeight.w600,
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                      gridData: FlGridData(
                        show: true,
                        drawVerticalLine: false,
                        horizontalInterval: 1,
                        getDrawingHorizontalLine: (_) =>
                            FlLine(color: _C.border, strokeWidth: 1),
                      ),
                      titlesData: FlTitlesData(
                        leftTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            reservedSize: 30,
                            interval: 1,
                            getTitlesWidget: (value, _) => Text(
                              value.toInt().toString(),
                              style: GoogleFonts.inter(fontSize: 10, color: _C.textHint),
                            ),
                          ),
                        ),
                        // FIX #11: Better date formatting
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            reservedSize: 24,
                            interval: _dailyOrders.length <= 7
                                ? 1
                                : (_dailyOrders.length / 5).ceilToDouble(),
                            getTitlesWidget: (value, _) {
                              final idx = value.toInt();
                              if (idx >= 0 && idx < _dailyOrders.length) {
                                final date = _dailyOrders[idx]['date'] as String;
                                final parts = date.split('-');
                                if (parts.length >= 3) {
                                  return Padding(
                                    padding: const EdgeInsets.only(top: 4),
                                    child: Text(
                                      '${parts[2]}/${parts[1]}',
                                      style: GoogleFonts.inter(
                                        fontSize: 9,
                                        color: _C.textHint,
                                      ),
                                    ),
                                  );
                                }
                              }
                              return const SizedBox();
                            },
                          ),
                        ),
                        rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      ),
                      borderData: FlBorderData(show: false),
                      minY: 0,
                      lineBarsData: [
                        LineChartBarData(
                          spots: _protectionTrend,
                          isCurved: true,
                          color: _C.accent,
                          barWidth: 3,
                          isStrokeCapRound: true,
                          dotData: FlDotData(
                            show: true,
                            getDotPainter: (spot, _, __, ___) =>
                                FlDotCirclePainter(
                              radius: 4,
                              color: _C.accent,
                              strokeWidth: 2,
                              strokeColor: Colors.white,
                            ),
                          ),
                          belowBarData: BarAreaData(
                            show: true,
                            color: _C.accent.withOpacity(0.1),
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

  // FIX #12: Pie chart handles single risk level
  Widget _buildPieChart() {
    // FIX #12: Build sections only for existing risk levels
    final sections = <PieChartSectionData>[];
    if (_highRiskOrders > 0) {
      sections.add(PieChartSectionData(
        value: _highRiskOrders.toDouble(),
        color: _C.riskHigh,
        title: '$_highRiskOrders',
        radius: 50,
        titleStyle: GoogleFonts.spaceGrotesk(
          fontSize: 12,
          fontWeight: FontWeight.w800,
          color: Colors.white,
        ),
      ));
    }
    if (_mediumRiskOrders > 0) {
      sections.add(PieChartSectionData(
        value: _mediumRiskOrders.toDouble(),
        color: _C.riskMedium,
        title: '$_mediumRiskOrders',
        radius: 45,
        titleStyle: GoogleFonts.spaceGrotesk(
          fontSize: 12,
          fontWeight: FontWeight.w800,
          color: Colors.white,
        ),
      ));
    }
    if (_lowRiskOrders > 0) {
      sections.add(PieChartSectionData(
        value: _lowRiskOrders.toDouble(),
        color: _C.riskLow,
        title: '$_lowRiskOrders',
        radius: 40,
        titleStyle: GoogleFonts.spaceGrotesk(
          fontSize: 12,
          fontWeight: FontWeight.w800,
          color: Colors.white,
        ),
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
          Text('Risk Breakdown',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: _C.textPrimary,
            )),
          const SizedBox(height: 20),
          SizedBox(
            height: 160,
            child: sections.isEmpty
                ? _emptyChart('No orders yet')
                : sections.length == 1
                    // FIX #12: Single section - show as full circle
                    ? PieChart(PieChartData(
                        sectionsSpace: 0,
                        centerSpaceRadius: 40,
                        sections: sections,
                      ))
                    : PieChart(PieChartData(
                        sectionsSpace: 3,
                        centerSpaceRadius: 40,
                        sections: sections,
                      )),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 12,
            runSpacing: 8,
            alignment: WrapAlignment.center,
            children: [
              if (_highRiskOrders > 0)
                _legendItem(_C.riskHigh, 'High', _highRiskOrders),
              if (_mediumRiskOrders > 0)
                _legendItem(_C.riskMedium, 'Medium', _mediumRiskOrders),
              if (_lowRiskOrders > 0)
                _legendItem(_C.riskLow, 'Low', _lowRiskOrders),
            ],
          ),
        ],
      ),
    );
  }

  Widget _legendItem(Color color, String label, int count) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10, height: 10,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 5),
        Text('$label ($count)',
          style: GoogleFonts.inter(
            fontSize: 11,
            color: _C.textSecondary,
            fontWeight: FontWeight.w600,
          )),
      ],
    );
  }

  // FIX #10 #16: Bar chart with better width + tooltips
  Widget _buildBarChart() {
    if (_dailyOrders.isEmpty) {
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
            Text('Orders Overview',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: _C.textPrimary,
              )),
            const SizedBox(height: 24),
            SizedBox(height: 200, child: _emptyChart('No data for this period')),
          ],
        ),
      );
    }

    // FIX #10: Dynamic bar width based on data count
    final barWidth = _dailyOrders.length > 20
        ? 8.0
        : _dailyOrders.length > 10
            ? 12.0
            : 16.0;

    final maxY = _dailyOrders.isEmpty
        ? 5.0
        : (_dailyOrders
                    .map((d) => d['total'] as int)
                    .reduce((a, b) => a > b ? a : b)
                    .toDouble() +
                2);

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
              Text('Orders Overview',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: _C.textPrimary,
                )),
              const Spacer(),
              Row(
                children: [
                  _barLegend(_C.accentDark.withOpacity(0.15), 'Total'),
                  const SizedBox(width: 12),
                  _barLegend(_C.accent, 'Protected'),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),
          SizedBox(
            height: 200,
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: maxY,
                // FIX #16: Bar tooltips
                barTouchData: BarTouchData(
                  enabled: true,
                  touchTooltipData: BarTouchTooltipData(
                    getTooltipColor: (_) => _C.accentDark,
                    getTooltipItem: (group, groupIndex, rod, rodIndex) {
                      final data = _dailyOrders[group.x.toInt()];
                      final label = rodIndex == 0 ? 'Total' : 'Protected';
                      final value = rodIndex == 0
                          ? data['total']
                          : data['protected'];
                      return BarTooltipItem(
                        '$label: $value',
                        GoogleFonts.inter(
                          fontSize: 11,
                          color: _C.accent,
                          fontWeight: FontWeight.w600,
                        ),
                      );
                    },
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
                      reservedSize: 28,
                      getTitlesWidget: (value, _) => Text(
                        value.toInt().toString(),
                        style: GoogleFonts.inter(fontSize: 10, color: _C.textHint),
                      ),
                    ),
                  ),
                  // FIX #11: Better date labels for bar chart
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 24,
                      getTitlesWidget: (value, _) {
                        final idx = value.toInt();
                        if (idx >= 0 && idx < _dailyOrders.length) {
                          final date = _dailyOrders[idx]['date'] as String;
                          final parts = date.split('-');
                          if (parts.length >= 3) {
                            return Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text(
                                '${parts[2]}/${parts[1]}',
                                style: GoogleFonts.inter(
                                  fontSize: 9,
                                  color: _C.textHint,
                                ),
                              ),
                            );
                          }
                        }
                        return const SizedBox();
                      },
                    ),
                  ),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                borderData: FlBorderData(show: false),
                // FIX #10: Dynamic bar width
                barGroups: _dailyOrders.asMap().entries.map((e) {
                  final idx = e.key;
                  final total = (e.value['total'] as int).toDouble();
                  final protected = (e.value['protected'] as int).toDouble();
                  return BarChartGroupData(
                    x: idx,
                    barRods: [
                      BarChartRodData(
                        toY: total,
                        color: _C.accentDark.withOpacity(0.12),
                        width: barWidth,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      BarChartRodData(
                        toY: protected,
                        color: _C.accent,
                        width: barWidth,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ],
                  );
                }).toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _barLegend(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 12, height: 12,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(3),
          ),
        ),
        const SizedBox(width: 5),
        Text(label,
          style: GoogleFonts.inter(
            fontSize: 11,
            color: _C.textSecondary,
            fontWeight: FontWeight.w600,
          )),
      ],
    );
  }

  // FIX #13: Monthly report with empty state
  Widget _buildMonthlyReport() {
    final Map<String, Map<String, dynamic>> monthly = {};
    for (var o in _orders) {
      final date = DateTime.tryParse(o['created_at'] ?? '');
      if (date == null) continue;
      final key = '${date.year}-${date.month.toString().padLeft(2, '0')}';
      if (!monthly.containsKey(key)) {
        monthly[key] = {'total': 0, 'protected': 0, 'value': 0.0, 'high': 0};
      }
      monthly[key]!['total'] = (monthly[key]!['total'] as int) + 1;
      if (o['checklist_completed'] == true) {
        monthly[key]!['protected'] = (monthly[key]!['protected'] as int) + 1;
      }
      monthly[key]!['value'] = (monthly[key]!['value'] as double) +
          ((o['item_price'] as num?)?.toDouble() ?? 0);
      if (o['risk_level'] == 'HIGH') {
        monthly[key]!['high'] = (monthly[key]!['high'] as int) + 1;
      }
    }

    final sortedMonths = monthly.keys.toList()..sort((a, b) => b.compareTo(a));

    final monthNames = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

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
          Text('Monthly Protection Report',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: _C.textPrimary,
            )),
          const SizedBox(height: 4),
          Text('Breakdown of protection activity by month',
            style: GoogleFonts.inter(fontSize: 12, color: _C.textSecondary)),
          const SizedBox(height: 20),

          // Table header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Expanded(flex: 2, child: _colHeader('MONTH')),
                Expanded(child: _colHeader('ORDERS')),
                Expanded(child: _colHeader('PROTECTED')),
                Expanded(child: _colHeader('HIGH RISK')),
                Expanded(child: _colHeader('VALUE')),
                Expanded(child: _colHeader('RATE')),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // FIX #13: Empty state for monthly report
          if (sortedMonths.isEmpty)
            Container(
              padding: const EdgeInsets.all(40),
              child: Center(
                child: Column(
                  children: [
                    Icon(Icons.bar_chart, size: 48, color: Colors.grey.shade300),
                    const SizedBox(height: 12),
                    Text('No data for the selected period',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        color: _C.textHint,
                      )),
                    const SizedBox(height: 4),
                    Text('Try selecting "All Time" to see your data',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: _C.textHint,
                      )),
                    const SizedBox(height: 12),
                    GestureDetector(
                      onTap: () {
                        setState(() => _timeRange = 'all');
                        _loadData(isSwitching: true);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: _C.accentDim,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text('View All Time',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: _C.accentDark,
                            fontWeight: FontWeight.w600,
                          )),
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            ...sortedMonths.map((month) {
              final data = monthly[month]!;
              final total = data['total'] as int;
              final protected = data['protected'] as int;
              final high = data['high'] as int;
              final value = data['value'] as double;
              final rate = total > 0
                  ? (protected / total * 100).toStringAsFixed(0)
                  : '0';
              final rateInt = int.tryParse(rate) ?? 0;
              final rateColor = rateInt >= 80
                  ? _C.riskLow
                  : rateInt >= 50
                      ? _C.riskMedium
                      : _C.riskHigh;

              final parts = month.split('-');
              final monthName =
                  '${monthNames[int.parse(parts[1])]} ${parts[0]}';

              return Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 14),
                margin: const EdgeInsets.only(bottom: 4),
                decoration: BoxDecoration(
                  color: _C.bg,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: _C.border),
                ),
                child: Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: Text(monthName,
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: _C.textPrimary,
                        )),
                    ),
                    Expanded(
                      child: Text('$total',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: _C.textPrimary,
                          fontWeight: FontWeight.w600,
                        )),
                    ),
                    Expanded(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.verified, size: 12, color: _C.accent),
                          const SizedBox(width: 4),
                          Text('$protected',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              color: _C.textPrimary,
                              fontWeight: FontWeight.w600,
                            )),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Text('$high',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: high > 0 ? _C.riskHigh : _C.textHint,
                          fontWeight: FontWeight.w600,
                        )),
                    ),
                    Expanded(
                      child: Text(
                        '\$${value.toStringAsFixed(2)}',
                        textAlign: TextAlign.right,
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: _C.textPrimary,
                        )),
                    ),
                    Expanded(
                      child: Align(
                        alignment: Alignment.centerRight,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: rateColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text('$rate%',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: rateColor,
                            )),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }

  Widget _colHeader(String text) {
    return Text(text,
      style: GoogleFonts.inter(
        fontSize: 10,
        fontWeight: FontWeight.w700,
        color: _C.textHint,
        letterSpacing: 0.5,
      ));
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