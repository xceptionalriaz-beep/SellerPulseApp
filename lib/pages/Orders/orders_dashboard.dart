// lib/pages/orders/orders_dashboard.dart
//
// SellerPulse — Orders Dashboard
// Fully responsive: desktop, tablet, mobile
// Changes vs old version:
//   - Removed: Returns + Disputes columns from table (moved to detail panel)
//   - Added:   "Not Protected" filter tab
//   - Added:   Column sort (Risk Score, Price)
//   - Added:   Analytics section (Protection Trend + Orders Overview charts)
//   - Added:   Monthly Report table (toggled)
//   - Added:   Export PDF + Time filter in header
//   - Added:   Revenue at risk bar
//   - Fixed:   N+1 buyer profile query → single batched query
//   - Fixed:   Entire row is clickable (no more tiny eye icon hunt)
//   - Responsive: table → card list on mobile/tablet

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:fl_chart/fl_chart.dart';
import 'order_detail_screen.dart';
import 'buyer_profile_panel.dart';
import 'export_service.dart';

class _C {
  static const bg            = Color(0xFFF8FAFC);
  static const surface       = Color(0xFFFFFFFF);
  static const surfaceHover  = Color(0xFFF1F5F9);
  static const border        = Color(0xFFE2E8F0);
  static const accent        = Color(0xFF8FFF00);
  static const accentDark    = Color(0xFF131B2F);
  static const accentDim     = Color(0xFFE8FFB0);
  static const textPrimary   = Color(0xFF131B2F);
  static const textSecondary = Color(0xFF64748B);
  static const textHint      = Color(0xFF94A3B8);
  static const riskLow       = Color(0xFF00C48C);
  static const riskMedium    = Color(0xFFFFB800);
  static const riskHigh      = Color(0xFFFF4D6A);
  static const blue          = Color(0xFF1976D2);
}

class _BP {
  static bool isMobile(BuildContext ctx)  => MediaQuery.of(ctx).size.width < 500;
  static bool isTablet(BuildContext ctx)  => MediaQuery.of(ctx).size.width >= 500 && MediaQuery.of(ctx).size.width < 860;
  static bool isDesktop(BuildContext ctx) => MediaQuery.of(ctx).size.width >= 960;
  static double hPad(BuildContext ctx) {
    final w = MediaQuery.of(ctx).size.width;
    if (w < 600) return 16;
    if (w < 960) return 24;
    return 40;
  }
}

enum _SortBy { none, riskScoreDesc, priceDesc, priceAsc, newest, oldest }

class OrdersDashboard extends StatefulWidget {
  const OrdersDashboard({super.key});
  @override
  State<OrdersDashboard> createState() => _OrdersDashboardState();
}

class _OrdersDashboardState extends State<OrdersDashboard> {
  final _supabase = Supabase.instance.client;

  bool   _isLoading      = true;
  bool   _hasError       = false;
  String _errorMessage   = '';
  bool   _isRefreshing   = false;
  bool   _showAnalytics  = false;
  bool   _showMonthly    = false;
  String _selectedFilter = 'all';
  String _timeRange      = '30';
  _SortBy _sortBy        = _SortBy.none;

  List<Map<String, dynamic>>            _orders        = [];
  Map<String, Map<String, dynamic>>     _buyerProfiles = {};
  Map<String, int>                      _messageCounts = {};
  RealtimeChannel?                      _realtimeChannel;

  final _searchController = TextEditingController();
  String _searchQuery = '';

  // Counts
  int    _lowRiskCount     = 0;
  int    _mediumRiskCount  = 0;
  int    _highRiskCount    = 0;
  int    _protectedCount   = 0;
  int    _unprotectedCount = 0;
  int    _totalOrders      = 0;
  int    _shippedCount     = 0;
  int    _todayCount       = 0;

  // Financial
  double _atRiskRevenue   = 0;   // HIGH + unprotected
  double _protectedValue  = 0;
  double _totalValue      = 0;

  // Analytics
  List<FlSpot>               _protectionTrend = [];
  List<Map<String, dynamic>> _dailyOrders     = [];

  @override
  void initState() {
    super.initState();
    _loadOrders();
    _loadMessageCounts();
    _setupRealtime();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _realtimeChannel?.unsubscribe();
    super.dispose();
  }

  // =========================================================================
  // REALTIME
  // =========================================================================

  void _setupRealtime() {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return;
    _realtimeChannel = _supabase
        .channel('orders_realtime')
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: 'protected_orders',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'user_id',
            value: userId,
          ),
          callback: (_) { _loadOrders(); _loadMessageCounts(); },
        )
        .subscribe();
  }

  // =========================================================================
  // DATA
  // =========================================================================

Future<void> _loadMessageCounts() async {
    try {
      final data = await _supabase.from('sent_messages').select('order_id');
      final counts = <String, int>{};
      for (var row in data) {
        final id = row['order_id'] as String;
        counts[id] = (counts[id] ?? 0) + 1;
      }
      if (mounted) setState(() => _messageCounts = counts);
    } catch (_) {}
  }

  Future<void> _loadOrders({bool isRefresh = false}) async {
    if (isRefresh) {
      setState(() => _isRefreshing = true);
    } else {
      setState(() { _isLoading = true; _hasError = false; });
    }

    try {
      final userId = _supabase.auth.currentUser?.id;
      if (userId == null) {
        setState(() {
          _isLoading = false; _isRefreshing = false;
          _hasError = true;  _errorMessage = 'Not logged in.';
        });
        return;
      }

      final data = await _supabase
          .from('protected_orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', ascending: false)
          .limit(200);

      // Single-pass counts + financials
      int low = 0, medium = 0, high = 0, prot = 0, unprot = 0, shipped = 0, today = 0;
      double atRisk = 0, protVal = 0, totalVal = 0;
      final Set<String> buyerNames = {};
      final now        = DateTime.now();
      final todayStart = DateTime(now.year, now.month, now.day);

      for (var o in data) {
        final risk        = '${o['risk_level']   ?? ''}'.trim().toUpperCase();
        final status      = '${o['order_status'] ?? ''}'.trim().toLowerCase();
        final isProtected = o['checklist_completed'] == true;
        final price       = (o['item_price'] as num?)?.toDouble() ?? 0;
        final buyer       = o['buyer_username'] as String?;
        final createdAt   = DateTime.tryParse(o['created_at'] ?? '');

        totalVal += price;

        if (risk == 'LOW')         low++;
        else if (risk == 'MEDIUM') medium++;
        else if (risk == 'HIGH')   high++;

        if (isProtected) { prot++; protVal += price; } else unprot++;
        if (status == 'shipped' || status == 'delivered') shipped++;
        if (buyer != null && buyer.isNotEmpty) buyerNames.add(buyer);
        if (risk == 'HIGH' && !isProtected) atRisk += price;
        if (createdAt != null && createdAt.isAfter(todayStart)) today++;
      }

      // Batched buyer profiles — single query
      final profiles = <String, Map<String, dynamic>>{};
      if (buyerNames.isNotEmpty) {
        try {
          final profileData = await _supabase
              .from('buyer_profiles')
              .select('*')
              .inFilter('ebay_buyer_username', buyerNames.toList());
          for (var p in profileData) {
            profiles[p['ebay_buyer_username'] as String] =
                Map<String, dynamic>.from(p);
          }
        } catch (_) {}
      }

      // Count how many orders each buyer has — for repeat badge
      final Map<String, int> buyerOrderCount = {};
      for (var o in data) {
        final buyer = o['buyer_username'] as String?;
        if (buyer != null && buyer.isNotEmpty) {
          buyerOrderCount[buyer] = (buyerOrderCount[buyer] ?? 0) + 1;
        }
      }
      // Inject order_count into each profile
      for (var buyer in buyerOrderCount.keys) {
        if (profiles.containsKey(buyer)) {
          profiles[buyer]!['order_count'] = buyerOrderCount[buyer]!;
        }
      }

      _buildAnalyticsData(data);

      if (mounted) {
        setState(() {
          _orders           = List<Map<String, dynamic>>.from(data);
          _buyerProfiles    = profiles;
          _totalOrders      = data.length;
          _lowRiskCount     = low;
          _mediumRiskCount  = medium;
          _highRiskCount    = high;
          _protectedCount   = prot;
          _unprotectedCount = unprot;
          _shippedCount     = shipped;
          _todayCount       = today;
          _atRiskRevenue    = atRisk;
          _protectedValue   = protVal;
          _totalValue       = totalVal;
          _isLoading        = false;
          _isRefreshing     = false;
          _hasError         = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading    = false;
          _isRefreshing = false;
          _hasError     = true;
          _errorMessage = 'Failed to load orders. Pull down to retry.';
        });
      }
    }
  }

  void _buildAnalyticsData(List<dynamic> orders) {
    final now  = DateTime.now();
    final from = _timeRange == 'all'
        ? null
        : now.subtract(Duration(days: int.parse(_timeRange)));

    final filtered = orders.where((o) {
      if (from == null) return true;
      final d = DateTime.tryParse(o['created_at'] ?? '');
      return d != null && d.isAfter(from);
    }).toList();

    final Map<String, int> dailyMap     = {};
    final Map<String, int> protectedMap = {};

    for (var o in filtered) {
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
    final trend = <FlSpot>[];
    final daily = <Map<String, dynamic>>[];

    for (int i = 0; i < sortedKeys.length; i++) {
      final key   = sortedKeys[i];
      final total = dailyMap[key] ?? 0;
      final prot  = protectedMap[key] ?? 0;
      trend.add(FlSpot(i.toDouble(), prot.toDouble()));
      daily.add({'date': key, 'total': total, 'protected': prot});
    }

    _protectionTrend = trend;
    _dailyOrders     = daily;
  }

  // =========================================================================
  // FILTER + SORT
  // =========================================================================

  List<Map<String, dynamic>> get _filteredOrders {
    List<Map<String, dynamic>> orders;

    switch (_selectedFilter) {
      case 'high':
        orders = _orders.where((o) =>
            '${o['risk_level'] ?? ''}'.trim().toUpperCase() == 'HIGH').toList();
        break;
      case 'medium':
        orders = _orders.where((o) =>
            '${o['risk_level'] ?? ''}'.trim().toUpperCase() == 'MEDIUM').toList();
        break;
      case 'low':
        orders = _orders.where((o) =>
            '${o['risk_level'] ?? ''}'.trim().toUpperCase() == 'LOW').toList();
        break;
      case 'shipped':
        orders = _orders.where((o) {
          final s = '${o['order_status'] ?? ''}'.trim().toLowerCase();
          return s == 'shipped' || s == 'delivered';
        }).toList();
        break;
      case 'not_shipped':
        orders = _orders.where((o) {
          final s = '${o['order_status'] ?? ''}'.trim().toLowerCase();
          return s != 'shipped' && s != 'delivered';
        }).toList();
        break;
      case 'not_protected':
        orders = _orders
            .where((o) => o['checklist_completed'] != true)
            .toList();
        break;
      default:
        orders = List.from(_orders);
    }

    final q = _searchQuery.trim().toLowerCase();
    if (q.isNotEmpty) {
      orders = orders.where((o) =>
          '${o['ebay_order_id']    ?? ''}'.toLowerCase().contains(q) ||
          '${o['item_title']       ?? ''}'.toLowerCase().contains(q) ||
          '${o['buyer_username']   ?? ''}'.toLowerCase().contains(q)).toList();
    }

    switch (_sortBy) {
      case _SortBy.riskScoreDesc:
        orders.sort((a, b) =>
            (b['risk_score'] as int? ?? 0)
                .compareTo(a['risk_score'] as int? ?? 0));
        break;
      case _SortBy.priceDesc:
        orders.sort((a, b) =>
            ((b['item_price'] as num?)?.toDouble() ?? 0)
                .compareTo((a['item_price'] as num?)?.toDouble() ?? 0));
        break;
      case _SortBy.priceAsc:
        orders.sort((a, b) =>
            ((a['item_price'] as num?)?.toDouble() ?? 0)
                .compareTo((b['item_price'] as num?)?.toDouble() ?? 0));
        break;
      case _SortBy.oldest:
        orders.sort((a, b) {
          final aT = DateTime.tryParse(a['created_at'] ?? '') ?? DateTime(2000);
          final bT = DateTime.tryParse(b['created_at'] ?? '') ?? DateTime(2000);
          return aT.compareTo(bT);
        });
        break;
      default:
        break;
    }

    return orders;
  }

  // =========================================================================
  // BUILD
  // =========================================================================

  @override
  Widget build(BuildContext context) {
    final mobile   = MediaQuery.of(context).size.width < 500;
    final pad      = _BP.hPad(context);
    final userName = _supabase.auth.currentUser
            ?.userMetadata?['full_name'] ?? 'Seller';

    return Scaffold(
      backgroundColor: _C.bg,
      body: TweenAnimationBuilder<double>(
        tween: Tween(begin: 0.0, end: 1.0),
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeOut,
        builder: (ctx, val, child) => Opacity(opacity: val, child: child),
        child: RefreshIndicator(
          onRefresh: () => _loadOrders(isRefresh: true),
          color: _C.accent,
          backgroundColor: _C.surface,
          child: CustomScrollView(
            slivers: [

              // ── Header + stats ─────────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(pad, mobile ? 32 : 48, pad, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildHeader(userName, mobile),
                      const SizedBox(height: 24),
                      _buildStatsRow(mobile),
                      const SizedBox(height: 12),
                      if (_hasError) _buildErrorBanner(),
                    ],
                  ),
                ),
              ),

              // ── Revenue at risk bar ─────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(pad, 0, pad, 12),
                  child: _buildRevenueAtRiskBar(mobile),
                ),
              ),

              // ── Analytics toggle ────────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: pad),
                  child: _buildAnalyticsToggleBar(),
                ),
              ),

              if (_showAnalytics) ...[
                SliverToBoxAdapter(child: SizedBox(height: 16)),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: pad),
                    child: _buildAnalyticsSection(mobile),
                  ),
                ),
                if (_showMonthly)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.fromLTRB(pad, 16, pad, 0),
                      child: _buildMonthlyReport(),
                    ),
                  ),
              ],

              // ── Unified toolbar ──────────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(pad, 20, pad, 0),
                  child: _buildUnifiedToolbar(mobile),
                ),
              ),

              // ── Table header (desktop) ──────────────────────────
              if (_BP.isDesktop(context))
                SliverToBoxAdapter(child: _buildTableHeader(pad)),

              // ── Orders list ─────────────────────────────────────
              if (_isLoading)
                SliverPadding(
                  padding: EdgeInsets.fromLTRB(pad, 0, pad, 40),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (_, __) => _buildSkeletonRow(), childCount: 5)),
                )
              else if (_filteredOrders.isEmpty)
                SliverFillRemaining(child: _buildEmptyState())
              else
                SliverPadding(
                  padding: EdgeInsets.fromLTRB(pad, 0, pad, 40),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (ctx, index) {
                        final order   = _filteredOrders[index];
                        final msgCount = _messageCounts[order['id']] ?? 0;
                        final isLast  = index == _filteredOrders.length - 1;
                        final profile = _buyerProfiles[
                            order['buyer_username'] as String? ?? ''];
                        return TweenAnimationBuilder<double>(
                          key: ValueKey(order['id']),
                          tween: Tween(begin: 0.0, end: 1.0),
                          duration: Duration(
                              milliseconds:
                                  200 + (index * 25).clamp(0, 500)),
                          curve: Curves.easeOut,
                          builder: (_, val, child) => Opacity(
                            opacity: val,
                            child: Transform.translate(
                                offset: Offset(0, 16 * (1 - val)),
                                child: child)),
                          child: _BP.isDesktop(context)
                              ? _DesktopOrderRow(
                                  order: order,
                                  profile: profile,
                                  messageCount: msgCount,
                                  isLast: isLast,
                                  onTap: () => _openOrderDetails(order),
                                  onBuyerTap: () => showBuyerProfilePanel(
                                      context,
                                      order['buyer_username']
                                              as String? ??
                                          ''),
                                )
                              : _MobileOrderCard(
                                  order: order,
                                  profile: profile,
                                  messageCount: msgCount,
                                  onTap: () => _openOrderDetails(order),
                                  onBuyerTap: () => showBuyerProfilePanel(
                                      context,
                                      order['buyer_username']
                                              as String? ??
                                          ''),
                                ),
                        );
                      },
                      childCount: _filteredOrders.length,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  // =========================================================================
  // HEADER
  // =========================================================================

  Widget _buildHeader(String userName, bool mobile) {
    return Row(children: [
      Expanded(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Welcome back, $userName! 👋',
            style: GoogleFonts.spaceGrotesk(
              fontSize: mobile ? 20 : 26,
              fontWeight: FontWeight.w700,
              color: _C.textPrimary,
              letterSpacing: -0.5)),
          const SizedBox(height: 4),
          Text('Protect your orders from risky buyers',
            style: GoogleFonts.inter(
                fontSize: 13, color: _C.textSecondary)),
        ]),
      ),
      // LIVE badge
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: _C.accent.withOpacity(0.15),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: _C.accent.withOpacity(0.4))),
        child: Row(children: [
          _isRefreshing
              ? const SizedBox(width: 7, height: 7,
                  child: CircularProgressIndicator(
                      strokeWidth: 1.5, color: _C.accent))
              : Container(width: 7, height: 7,
                  decoration: const BoxDecoration(
                      color: _C.accent, shape: BoxShape.circle)),
          const SizedBox(width: 5),
          Text(_isRefreshing ? 'UPDATING…' : 'LIVE',
            style: GoogleFonts.inter(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: _C.accentDark)),
        ]),
      ),
      const SizedBox(width: 8),
      IconButton(
        onPressed: () => _loadOrders(isRefresh: true),
        icon: _isRefreshing
            ? const SizedBox(width: 18, height: 18,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: _C.textSecondary))
            : const Icon(Icons.refresh,
                color: _C.textSecondary, size: 20),
        tooltip: 'Refresh'),
      IconButton(
        onPressed: () => ExportService.exportOrdersToCSV(
          context: context,
          orders: _filteredOrders,
          filterLabel: _selectedFilter == 'all'
              ? 'All Orders'
              : _selectedFilter
                  .replaceAll('_', ' ')
                  .toUpperCase(),
        ),
        icon: const Icon(Icons.download,
            color: _C.textSecondary, size: 20),
        tooltip: 'Export CSV'),
    ]);
  }

  // =========================================================================
  // STATS ROW
  // =========================================================================

  Widget _buildStatsRow(bool mobile) {
    final stats = [
      {'icon': Icons.shield_outlined,        'iconColor': _C.riskLow,    'bg': const Color(0xFFE6FFF0), 'label': 'Low Risk',    'value': '$_lowRiskCount',                 'sub': 'Safe to ship'},
      {'icon': Icons.warning_amber_rounded,   'iconColor': _C.riskMedium, 'bg': const Color(0xFFFFF3E6), 'label': 'Medium Risk', 'value': '$_mediumRiskCount',              'sub': 'Extra care needed'},
      {'icon': Icons.error_outline_rounded,   'iconColor': _C.riskHigh,   'bg': const Color(0xFFFFE6E6), 'label': 'High Risk',   'value': '$_highRiskCount',                'sub': 'Action required'},
      {'icon': Icons.local_shipping_outlined, 'iconColor': _C.blue,       'bg': const Color(0xFFE3F2FD), 'label': 'Shipped',     'value': '$_shippedCount/$_totalOrders',   'sub': 'Orders shipped'},
      {'icon': Icons.verified_outlined,       'iconColor': _C.accent,     'bg': _C.accentDim,            'label': 'Protected',   'value': '$_protectedCount/$_totalOrders', 'sub': _totalOrders > 0 ? '${(_protectedCount / _totalOrders * 100).toStringAsFixed(0)}% complete' : '0%'},
    ];

    if (mobile) {
      return Column(children: [
        Row(children: [
          Expanded(child: _miniStatCard(stats[0], 0)),
          const SizedBox(width: 8),
          Expanded(child: _miniStatCard(stats[1], 1)),
          const SizedBox(width: 8),
          Expanded(child: _miniStatCard(stats[2], 2)),
        ]),
        const SizedBox(height: 8),
        Row(children: [
          Expanded(child: _miniStatCard(stats[3], 3)),
          const SizedBox(width: 8),
          Expanded(child: _miniStatCard(stats[4], 4)),
        ]),
      ]);
    }

    return Row(
      children: stats.asMap().entries.map((e) => Expanded(
        child: Padding(
          padding: EdgeInsets.only(left: e.key > 0 ? 12 : 0),
          child: _miniStatCard(e.value, e.key)))).toList());
  }

  Widget _miniStatCard(Map<String, dynamic> s, int index) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: Duration(milliseconds: 300 + index * 50),
      curve: Curves.easeOut,
      builder: (ctx, val, child) => Opacity(
          opacity: val,
          child: Transform.translate(
              offset: Offset(0, 10 * (1 - val)), child: child)),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: _C.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: _C.border)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(
              width: 34, height: 34,
              decoration: BoxDecoration(
                  color: s['bg'] as Color,
                  borderRadius: BorderRadius.circular(9)),
              child: Icon(s['icon'] as IconData,
                  color: s['iconColor'] as Color, size: 17)),
            const Spacer(),
            Text(s['value'] as String,
              style: GoogleFonts.spaceGrotesk(
                fontSize: _BP.isMobile(context) ? 15 : 18,
                fontWeight: FontWeight.w700,
                color: _C.textPrimary)),
          ]),
          const SizedBox(height: 8),
          Text(s['label'] as String,
            style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: _C.textSecondary)),
          Text(s['sub'] as String,
            style: GoogleFonts.inter(
                fontSize: 10, color: _C.textHint)),
        ]),
      ),
    );
  }

  // =========================================================================
  // REVENUE AT RISK BAR  ← NEW
  // =========================================================================

Widget _buildRevenueAtRiskBar(bool mobile) {
  if (_totalOrders == 0) return const SizedBox.shrink();

  final protectedPct = _totalValue > 0
      ? (_protectedValue / _totalValue).clamp(0.0, 1.0)
      : 0.0;
  final atRiskPct = _totalValue > 0
      ? (_atRiskRevenue / _totalValue).clamp(0.0, 1.0)
      : 0.0;

  if (mobile) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
          color: _C.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: _C.border)),
      child: Column(children: [
        _riskBarSegment(
            value: '\$${_atRiskRevenue.toStringAsFixed(2)}',
            label: 'Revenue at risk',
            sub: '${_highRiskCount > 0 ? _highRiskCount : 'No'} unprotected HIGH orders',
            valueColor: _atRiskRevenue > 0 ? _C.riskHigh : _C.riskLow,
            barColor: _atRiskRevenue > 0 ? _C.riskHigh : _C.riskLow,
            barBg: _atRiskRevenue > 0
                ? const Color(0xFFFFE6E6)
                : const Color(0xFFE6FFF0),
            barFraction: atRiskPct,
            showDivider: false),
        const SizedBox(height: 10),
        _riskBarSegment(
            value: '\$${_protectedValue.toStringAsFixed(2)}',
            label: 'Value protected',
            sub: '$_protectedCount orders secured',
            valueColor: _C.riskLow,
            barColor: _C.riskLow,
            barBg: const Color(0xFFE6FFF0),
            barFraction: protectedPct,
            showDivider: false),
        const SizedBox(height: 10),
        _riskBarSegment(
            value: '$_todayCount',
            label: 'New today',
            sub: 'Orders since midnight',
            valueColor: _C.blue,
            barColor: _C.blue,
            barBg: const Color(0xFFE3F2FD),
            barFraction: _totalOrders > 0
                ? (_todayCount / _totalOrders).clamp(0.0, 1.0)
                : 0,
            showDivider: false),
        if (_atRiskRevenue > 0) ...[
          const SizedBox(height: 12),  // height not width — this is a Column
          MouseRegion(
            cursor: SystemMouseCursors.click,
            child: GestureDetector(
              onTap: () =>
                  setState(() => _selectedFilter = 'not_protected'),
              child: Container(
                width: double.infinity,
                padding:
                    const EdgeInsets.symmetric(vertical: 9),
                decoration: BoxDecoration(
                    color: _C.riskHigh,
                    borderRadius: BorderRadius.circular(8)),
                child: Text('Protect now →',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Colors.white)),
              ),  // closes Container
            ),    // closes GestureDetector
          ),      // closes MouseRegion
        ],        // closes if spread
      ]),         // closes Column children + Column
    );            // closes Container + return
  }

    // Desktop: horizontal bar
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      decoration: BoxDecoration(
        color: _C.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _C.border)),
      child: Row(crossAxisAlignment: CrossAxisAlignment.center, children: [
        // Segment 1 — At risk
        Expanded(child: _riskBarSegment(
          value: '\$${_atRiskRevenue.toStringAsFixed(2)}',
          label: 'Revenue at risk',
          sub: '${_highRiskCount > 0 ? _highRiskCount : 'No'} unprotected HIGH orders',
          valueColor: _atRiskRevenue > 0 ? _C.riskHigh : _C.riskLow,
          barColor: _atRiskRevenue > 0 ? _C.riskHigh : _C.riskLow,
          barBg: _atRiskRevenue > 0
              ? const Color(0xFFFFE6E6)
              : const Color(0xFFE6FFF0),
          barFraction: atRiskPct,
          showDivider: false)),
        // Divider
        Container(width: 1, height: 44, color: _C.border,
            margin: const EdgeInsets.symmetric(horizontal: 16)),
        // Segment 2 — Protected
        Expanded(child: _riskBarSegment(
          value: '\$${_protectedValue.toStringAsFixed(2)}',
          label: 'Value protected',
          sub: '$_protectedCount orders secured',
          valueColor: _C.riskLow,
          barColor: _C.riskLow,
          barBg: const Color(0xFFE6FFF0),
          barFraction: protectedPct,
          showDivider: false)),
        // Divider
        Container(width: 1, height: 44, color: _C.border,
            margin: const EdgeInsets.symmetric(horizontal: 16)),
        // Segment 3 — Today
        Expanded(child: _riskBarSegment(
          value: '$_todayCount',
          label: 'New today',
          sub: 'Orders since midnight',
          valueColor: _C.blue,
          barColor: _C.blue,
          barBg: const Color(0xFFE3F2FD),
          barFraction: _totalOrders > 0
              ? (_todayCount / _totalOrders).clamp(0.0, 1.0)
              : 0,
          showDivider: false)),
        // Protect now button — only if there's risk
        if (_atRiskRevenue > 0) ...[
          const SizedBox(width: 16),
          InkWell(
            onTap: () =>
                setState(() => _selectedFilter = 'not_protected'),
            mouseCursor: SystemMouseCursors.click,
            borderRadius: BorderRadius.circular(8),
            child: Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 16, vertical: 9),
              decoration: BoxDecoration(
                color: _C.riskHigh,
                borderRadius: BorderRadius.circular(8)),
              child: Text('Protect now →',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: Colors.white)),
            ),
          ),
        ],
      ]),
    );
  }

  Widget _riskBarSegment({
    required String value,
    required String label,
    required String sub,
    required Color valueColor,
    required Color barColor,
    required Color barBg,
    required double barFraction,
    required bool showDivider,
  }) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(value,
        style: GoogleFonts.spaceGrotesk(
          fontSize: 17,
          fontWeight: FontWeight.w700,
          color: valueColor)),
      const SizedBox(height: 2),
      Text(label,
        style: GoogleFonts.inter(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: _C.textSecondary)),
      Text(sub,
        style: GoogleFonts.inter(
            fontSize: 10, color: _C.textHint)),
      const SizedBox(height: 5),
      Container(
        height: 4,
        decoration: BoxDecoration(
            color: barBg,
            borderRadius: BorderRadius.circular(2)),
        child: FractionallySizedBox(
          alignment: Alignment.centerLeft,
          widthFactor: barFraction,
          child: Container(
            decoration: BoxDecoration(
                color: barColor,
                borderRadius: BorderRadius.circular(2))),
        ),
      ),
    ]);
  }

  // =========================================================================
  // ANALYTICS TOGGLE BAR
  // =========================================================================

  Widget _buildAnalyticsToggleBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: _C.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: _C.border)),
      child: Row(children: [
        Icon(Icons.bar_chart, size: 16, color: _C.textSecondary),
        const SizedBox(width: 8),
        Text('Order Analytics',
          style: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: _C.textPrimary)),
        const Spacer(),
        if (_showAnalytics) ...[
          _timeBtn('7',   '7D'),
          _timeBtn('30',  '30D'),
          _timeBtn('all', 'All'),
          const SizedBox(width: 10),
          GestureDetector(
            onTap: () => ExportService.exportAnalyticsToPDF(
              context: context,
              orders: _orders,
              timeRange: _timeRange,
              totalOrders: _totalOrders,
              protectedOrders: _protectedCount,
              shippedOrders: _shippedCount,
              highRiskOrders: _highRiskCount,
              mediumRiskOrders: _mediumRiskCount,
              lowRiskOrders: _lowRiskCount,
              totalValue: _totalValue,
              protectedValue: _protectedValue,
              estimatedSaved: _protectedValue * 0.15,
            ),
            child: Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: _C.accentDark,
                borderRadius: BorderRadius.circular(6)),
              child: Row(children: [
                const Icon(Icons.picture_as_pdf,
                    size: 13, color: _C.accent),
                const SizedBox(width: 5),
                Text('Export PDF',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: Colors.white)),
              ]),
            ),
          ),
          const SizedBox(width: 10),
          GestureDetector(
            onTap: () =>
                setState(() => _showMonthly = !_showMonthly),
            child: Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: _showMonthly ? _C.accent : _C.bg,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: _C.border)),
              child: Text('Monthly report',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: _showMonthly
                      ? _C.accentDark
                      : _C.textSecondary)),
            ),
          ),
          const SizedBox(width: 10),
        ],
        GestureDetector(
          onTap: () =>
              setState(() => _showAnalytics = !_showAnalytics),
          child: Container(
            padding: const EdgeInsets.symmetric(
                horizontal: 12, vertical: 5),
            decoration: BoxDecoration(
              color: _showAnalytics ? _C.accentDim : _C.bg,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(
                  color: _showAnalytics ? _C.accent : _C.border)),
            child: Row(children: [
              Text(_showAnalytics ? 'Hide' : 'Show',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: _showAnalytics
                      ? _C.accentDark
                      : _C.textSecondary)),
              const SizedBox(width: 4),
              Icon(
                _showAnalytics
                    ? Icons.keyboard_arrow_up
                    : Icons.keyboard_arrow_down,
                size: 14,
                color: _showAnalytics
                    ? _C.accentDark
                    : _C.textSecondary),
            ]),
          ),
        ),
      ]),
    );
  }

  Widget _timeBtn(String value, String label) {
    final active = _timeRange == value;
    return GestureDetector(
      onTap: () {
        if (_timeRange == value) return;
        setState(() {
          _timeRange = value;
          _buildAnalyticsData(_orders);
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        margin: const EdgeInsets.only(right: 4),
        padding:
            const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: active ? _C.accent : Colors.transparent,
          borderRadius: BorderRadius.circular(6)),
        child: Text(label,
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: active ? _C.accentDark : _C.textSecondary)),
      ),
    );
  }

  // =========================================================================
  // ANALYTICS SECTION
  // =========================================================================

  Widget _buildAnalyticsSection(bool mobile) {
    if (mobile) {
      return Column(children: [
        _buildProtectionTrendChart(),
        const SizedBox(height: 12),
        _buildOrdersBarChart(),
      ]);
    }
    return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Expanded(flex: 3, child: _buildProtectionTrendChart()),
      const SizedBox(width: 16),
      Expanded(flex: 2, child: _buildOrdersBarChart()),
    ]);
  }

  Widget _buildProtectionTrendChart() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: _C.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _C.border)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Text('Protection Trend',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: _C.textPrimary)),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(
                horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: _C.accentDim,
              borderRadius: BorderRadius.circular(20)),
            child: Text('Protected/day',
              style: GoogleFonts.inter(
                fontSize: 9,
                color: _C.accentDark,
                fontWeight: FontWeight.w600))),
        ]),
        const SizedBox(height: 16),
        SizedBox(
          height: 160,
          child: _protectionTrend.isEmpty
              ? _emptyChart('No data for this period')
              : LineChart(LineChartData(
                  lineTouchData: LineTouchData(
                    enabled: true,
                    touchTooltipData: LineTouchTooltipData(
                      getTooltipColor: (_) => _C.accentDark,
                      getTooltipItems: (spots) => spots.map((s) {
                        final idx = s.x.toInt();
                        final date = idx < _dailyOrders.length
                            ? _dailyOrders[idx]['date'] as String
                            : '';
                        return LineTooltipItem(
                          '${s.y.toInt()} protected\n$date',
                          GoogleFonts.inter(
                            fontSize: 10,
                            color: _C.accent,
                            fontWeight: FontWeight.w600));
                      }).toList())),
                  gridData: FlGridData(
                    show: true,
                    drawVerticalLine: false,
                    getDrawingHorizontalLine: (_) =>
                        FlLine(color: _C.border, strokeWidth: 1)),
                  titlesData: FlTitlesData(
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 28,
                        interval: 1,
                        getTitlesWidget: (v, _) => Text(
                          v.toInt().toString(),
                          style: GoogleFonts.inter(
                              fontSize: 9, color: _C.textHint)))),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 20,
                        interval: _dailyOrders.length <= 7
                            ? 1
                            : (_dailyOrders.length / 5)
                                .ceilToDouble(),
                        getTitlesWidget: (v, _) {
                          final idx = v.toInt();
                          if (idx >= 0 &&
                              idx < _dailyOrders.length) {
                            final parts =
                                (_dailyOrders[idx]['date'] as String)
                                    .split('-');
                            if (parts.length >= 3) {
                              return Padding(
                                padding:
                                    const EdgeInsets.only(top: 3),
                                child: Text('${parts[2]}/${parts[1]}',
                                  style: GoogleFonts.inter(
                                      fontSize: 8,
                                      color: _C.textHint)));
                            }
                          }
                          return const SizedBox();
                        })),
                    rightTitles: const AxisTitles(
                        sideTitles: SideTitles(showTitles: false)),
                    topTitles: const AxisTitles(
                        sideTitles: SideTitles(showTitles: false))),
                  borderData: FlBorderData(show: false),
                  minY: 0,
                  lineBarsData: [
                    LineChartBarData(
                      spots: _protectionTrend,
                      isCurved: true,
                      color: _C.accent,
                      barWidth: 2.5,
                      isStrokeCapRound: true,
                      dotData: FlDotData(
                        show: true,
                        getDotPainter: (_, __, ___, ____) =>
                            FlDotCirclePainter(
                              radius: 3,
                              color: _C.accent,
                              strokeWidth: 2,
                              strokeColor: Colors.white)),
                      belowBarData: BarAreaData(
                        show: true,
                        color: _C.accent.withOpacity(0.1)))]))),
        // Context note — fixes "going down" confusion
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.symmetric(
              horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(6)),
          child: Row(children: [
            Icon(Icons.info_outline,
                size: 12, color: _C.textHint),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                'Recent orders not yet protected will show lower — this is normal for a healthy store.',
                style: GoogleFonts.inter(
                    fontSize: 10, color: _C.textHint))),
          ]),
        ),
      ]),
    );
  }

  Widget _buildOrdersBarChart() {
    if (_dailyOrders.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: _C.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: _C.border)),
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
          Text('Orders Overview',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: _C.textPrimary)),
          const SizedBox(height: 16),
          SizedBox(
              height: 160,
              child: _emptyChart('No data for this period')),
        ]));
    }

    final barWidth = _dailyOrders.length > 20
        ? 7.0
        : _dailyOrders.length > 10
            ? 11.0
            : 15.0;
    final maxY = (_dailyOrders
                .map((d) => d['total'] as int)
                .reduce((a, b) => a > b ? a : b)
                .toDouble() +
            2);

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: _C.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _C.border)),
      child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
        Row(children: [
          Text('Orders Overview',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: _C.textPrimary)),
          const Spacer(),
          _barLegend(_C.accentDark.withOpacity(0.15), 'Total'),
          const SizedBox(width: 10),
          _barLegend(_C.accent, 'Protected'),
        ]),
        const SizedBox(height: 16),
        SizedBox(
          height: 160,
          child: BarChart(BarChartData(
            alignment: BarChartAlignment.spaceAround,
            maxY: maxY,
            barTouchData: BarTouchData(
              enabled: true,
              touchTooltipData: BarTouchTooltipData(
                getTooltipColor: (_) => _C.accentDark,
                getTooltipItem: (group, _, rod, rodIndex) {
                  final d = _dailyOrders[group.x.toInt()];
                  return BarTooltipItem(
                    '${rodIndex == 0 ? 'Total' : 'Protected'}: ${rodIndex == 0 ? d['total'] : d['protected']}',
                    GoogleFonts.inter(
                      fontSize: 10,
                      color: _C.accent,
                      fontWeight: FontWeight.w600));
                })),
            gridData: FlGridData(
              show: true,
              drawVerticalLine: false,
              getDrawingHorizontalLine: (_) =>
                  FlLine(color: _C.border, strokeWidth: 1)),
            titlesData: FlTitlesData(
              leftTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  reservedSize: 24,
                  getTitlesWidget: (v, _) => Text(
                    v.toInt().toString(),
                    style: GoogleFonts.inter(
                        fontSize: 9, color: _C.textHint)))),
              bottomTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  reservedSize: 20,
                  getTitlesWidget: (v, _) {
                    final idx = v.toInt();
                    if (idx >= 0 && idx < _dailyOrders.length) {
                      final parts =
                          (_dailyOrders[idx]['date'] as String)
                              .split('-');
                      if (parts.length >= 3) {
                        return Padding(
                          padding: const EdgeInsets.only(top: 3),
                          child: Text('${parts[2]}/${parts[1]}',
                            style: GoogleFonts.inter(
                                fontSize: 8, color: _C.textHint)));
                      }
                    }
                    return const SizedBox();
                  })),
              rightTitles: const AxisTitles(
                  sideTitles: SideTitles(showTitles: false)),
              topTitles: const AxisTitles(
                  sideTitles: SideTitles(showTitles: false))),
            borderData: FlBorderData(show: false),
            barGroups: _dailyOrders.asMap().entries.map((e) =>
              BarChartGroupData(x: e.key, barRods: [
                BarChartRodData(
                  toY: (e.value['total'] as int).toDouble(),
                  color: _C.accentDark.withOpacity(0.12),
                  width: barWidth,
                  borderRadius: BorderRadius.circular(3)),
                BarChartRodData(
                  toY: (e.value['protected'] as int).toDouble(),
                  color: _C.accent,
                  width: barWidth,
                  borderRadius: BorderRadius.circular(3)),
              ])).toList()))),
      ]),
    );
  }

  Widget _barLegend(Color color, String label) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Container(
        width: 10, height: 10,
        decoration: BoxDecoration(
            color: color, borderRadius: BorderRadius.circular(2))),
      const SizedBox(width: 4),
      Text(label,
        style: GoogleFonts.inter(
          fontSize: 10,
          color: _C.textSecondary,
          fontWeight: FontWeight.w600)),
    ]);
  }

  // =========================================================================
  // MONTHLY REPORT
  // =========================================================================

  Widget _buildMonthlyReport() {
    final Map<String, Map<String, dynamic>> monthly = {};
    for (var o in _orders) {
      final date = DateTime.tryParse(o['created_at'] ?? '');
      if (date == null) continue;
      final key =
          '${date.year}-${date.month.toString().padLeft(2, '0')}';
      if (!monthly.containsKey(key)) {
        monthly[key] = {
          'total': 0, 'protected': 0, 'value': 0.0, 'high': 0
        };
      }
      monthly[key]!['total'] =
          (monthly[key]!['total'] as int) + 1;
      if (o['checklist_completed'] == true) {
        monthly[key]!['protected'] =
            (monthly[key]!['protected'] as int) + 1;
      }
      monthly[key]!['value'] = (monthly[key]!['value'] as double) +
          ((o['item_price'] as num?)?.toDouble() ?? 0);
      if (o['risk_level'] == 'HIGH') {
        monthly[key]!['high'] =
            (monthly[key]!['high'] as int) + 1;
      }
    }

    final sortedMonths = monthly.keys.toList()
      ..sort((a, b) => b.compareTo(a));
    const months = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: _C.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _C.border)),
      child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
        Text('Monthly Protection Report',
          style: GoogleFonts.spaceGrotesk(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: _C.textPrimary)),
        const SizedBox(height: 4),
        Text('Breakdown by month',
          style: GoogleFonts.inter(
              fontSize: 11, color: _C.textSecondary)),
        const SizedBox(height: 14),
        Container(
          padding: const EdgeInsets.symmetric(
              horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(7)),
          child: Row(children: [
            Expanded(flex: 2, child: _colH('MONTH')),
            Expanded(child: _colH('ORDERS')),
            Expanded(child: _colH('PROTECTED')),
            Expanded(child: _colH('HIGH RISK')),
            Expanded(child: _colH('VALUE')),
            Expanded(child: _colH('RATE')),
          ])),
        const SizedBox(height: 6),
        if (sortedMonths.isEmpty)
          Padding(
            padding: const EdgeInsets.all(24),
            child: Center(
              child: Text('No data for selected period',
                style: GoogleFonts.inter(
                    fontSize: 13, color: _C.textHint))))
        else
          ...sortedMonths.map((month) {
            final d     = monthly[month]!;
            final total = d['total'] as int;
            final prot  = d['protected'] as int;
            final high  = d['high'] as int;
            final val   = d['value'] as double;
            final rate  = total > 0
                ? (prot / total * 100).toStringAsFixed(0)
                : '0';
            final rateInt = int.tryParse(rate) ?? 0;
            final rateColor = rateInt >= 80
                ? _C.riskLow
                : rateInt >= 50
                    ? _C.riskMedium
                    : _C.riskHigh;
            final parts = month.split('-');
            final mName =
                '${months[int.parse(parts[1])]} ${parts[0]}';
            return Container(
              margin: const EdgeInsets.only(bottom: 4),
              padding: const EdgeInsets.symmetric(
                  horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: _C.bg,
                borderRadius: BorderRadius.circular(7),
                border: Border.all(color: _C.border)),
              child: Row(children: [
                Expanded(
                  flex: 2,
                  child: Text(mName,
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: _C.textPrimary))),
                Expanded(
                  child: Text('$total',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: _C.textPrimary,
                      fontWeight: FontWeight.w600))),
                Expanded(
                  child: Row(
                      mainAxisAlignment:
                          MainAxisAlignment.center,
                      children: [
                    Icon(Icons.verified,
                        size: 11, color: _C.accent),
                    const SizedBox(width: 3),
                    Text('$prot',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: _C.textPrimary)),
                  ])),
                Expanded(
                  child: Text('$high',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: high > 0
                          ? _C.riskHigh
                          : _C.textHint,
                      fontWeight: FontWeight.w600))),
                Expanded(
                  child: Text(
                    '\$${val.toStringAsFixed(2)}',
                    textAlign: TextAlign.right,
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: _C.textPrimary))),
                Expanded(
                  child: Align(
                    alignment: Alignment.centerRight,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: rateColor.withOpacity(0.1),
                        borderRadius:
                            BorderRadius.circular(20)),
                      child: Text('$rate%',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: rateColor))))),
              ]));
          }),
      ]),
    );
  }

  Widget _colH(String t) => Text(t,
    style: GoogleFonts.inter(
      fontSize: 9,
      fontWeight: FontWeight.w700,
      color: _C.textHint,
      letterSpacing: 0.4));

  // =========================================================================
  // FILTER + ALERT
  // =========================================================================

  Widget _buildUnifiedToolbar(bool mobile) {
    if (mobile) {
      return Column(children: [
        // Row 1 — filter chips scrollable
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(children: [
            _filterChipCompact('All', _totalOrders, 'all', _C.accent),
            const SizedBox(width: 5),
            _filterChipCompact('Low', _lowRiskCount, 'low', _C.riskLow),
            const SizedBox(width: 5),
            _filterChipCompact('Med', _mediumRiskCount, 'medium', _C.riskMedium),
            const SizedBox(width: 5),
            _filterChipCompact('High', _highRiskCount, 'high', _C.riskHigh),
            const SizedBox(width: 5),
            _filterChipCompact('Shipped', _shippedCount, 'shipped', _C.blue),
            const SizedBox(width: 5),
            _filterChipCompact('Not Shipped', _totalOrders - _shippedCount, 'not_shipped', const Color(0xFFFF6B35)),
            const SizedBox(width: 5),
            _filterChipCompact('Not Protected', _unprotectedCount, 'not_protected', _C.riskHigh),
          ]),
        ),
        const SizedBox(height: 8),
        // Row 2 — search full width
        SizedBox(
          height: 38,
          child: TextField(
            controller: _searchController,
            onChanged: (v) => setState(() => _searchQuery = v),
            style: GoogleFonts.inter(fontSize: 12, color: _C.textPrimary),
            decoration: InputDecoration(
              hintText: 'Search orders…',
              hintStyle: GoogleFonts.inter(fontSize: 12, color: _C.textHint),
              prefixIcon: const Icon(Icons.search, size: 15, color: _C.textHint),
              suffixIcon: _searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.close, size: 13, color: _C.textHint),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                      })
                  : null,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: _C.border)),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: _C.border)),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: _C.accent)),
              contentPadding: const EdgeInsets.symmetric(
                  horizontal: 10, vertical: 8),
              isDense: true),
          )),
        const SizedBox(height: 8),
        // Row 3 — sort scrollable + compact alert
        Row(children: [
          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(children: [
                Text('Sort:',
                  style: GoogleFonts.inter(
                    fontSize: 10, fontWeight: FontWeight.w500,
                    color: _C.textHint)),
                const SizedBox(width: 6),
                _sortChip('Score ↓', _SortBy.riskScoreDesc),
                const SizedBox(width: 4),
                _sortChip('Price ↓', _SortBy.priceDesc),
                const SizedBox(width: 4),
                _sortChip('Price ↑', _SortBy.priceAsc),
                const SizedBox(width: 4),
                _sortChip('Newest', _SortBy.newest),
                const SizedBox(width: 4),
                _sortChip('Oldest', _SortBy.oldest),
              ]),
            )),
          if (_highRiskCount > 0) ...[
            const SizedBox(width: 8),
            InkWell(
              onTap: () => setState(() => _selectedFilter = 'high'),
              mouseCursor: SystemMouseCursors.click,
              borderRadius: BorderRadius.circular(6),
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 8, vertical: 5),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF1F0),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                      color: _C.riskHigh.withOpacity(0.35))),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  const Icon(Icons.warning_amber_rounded,
                      size: 12, color: _C.riskHigh),
                  const SizedBox(width: 4),
                  Text('$_highRiskCount',
                    style: GoogleFonts.inter(
                      fontSize: 11, fontWeight: FontWeight.w700,
                      color: _C.riskHigh)),
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: _C.accent,
                      borderRadius: BorderRadius.circular(4)),
                    child: Text('View',
                      style: GoogleFonts.inter(
                        fontSize: 10, fontWeight: FontWeight.w700,
                        color: _C.accentDark))),
                ]),
              ),
            ),
          ],
        ]),
      ]);
    }

    // ── Desktop: 2 clean rows ──────────────────────────────────
    return Column(children: [
      // Row 1 — filter chips + alert pushed right
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: _C.surface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: _C.border)),
        child: Row(children: [
          _filterChipCompact('All', _totalOrders, 'all', _C.accent),
          const SizedBox(width: 5),
          _filterChipCompact('Low', _lowRiskCount, 'low', _C.riskLow),
          const SizedBox(width: 5),
          _filterChipCompact('Medium', _mediumRiskCount, 'medium', _C.riskMedium),
          const SizedBox(width: 5),
          _filterChipCompact('High', _highRiskCount, 'high', _C.riskHigh),
          _toolbarDivider(),
          _filterChipCompact('Shipped', _shippedCount, 'shipped', _C.blue),
          const SizedBox(width: 5),
          _filterChipCompact('Not Shipped', _totalOrders - _shippedCount, 'not_shipped', const Color(0xFFFF6B35)),
          const SizedBox(width: 5),
          _filterChipCompact('Not Protected', _unprotectedCount, 'not_protected', _C.riskHigh),
          const Spacer(),
          if (_highRiskCount > 0)
            InkWell(
              onTap: () => setState(() => _selectedFilter = 'high'),
              mouseCursor: SystemMouseCursors.click,
              borderRadius: BorderRadius.circular(6),
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF1F0),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                      color: _C.riskHigh.withOpacity(0.35))),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  const Icon(Icons.warning_amber_rounded,
                      size: 13, color: _C.riskHigh),
                  const SizedBox(width: 5),
                  Text('$_highRiskCount unprotected',
                    style: GoogleFonts.inter(
                      fontSize: 11, fontWeight: FontWeight.w600,
                      color: _C.riskHigh)),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: _C.accent,
                      borderRadius: BorderRadius.circular(4)),
                    child: Text('View',
                      style: GoogleFonts.inter(
                        fontSize: 10, fontWeight: FontWeight.w700,
                        color: _C.accentDark))),
                ]),
              ),
            ),
        ]),
      ),
      const SizedBox(height: 8),
      // Row 2 — sort + search
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: _C.surface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: _C.border)),
        child: Row(children: [
          Text('Sort:',
            style: GoogleFonts.inter(
              fontSize: 11, fontWeight: FontWeight.w500,
              color: _C.textHint)),
          const SizedBox(width: 8),
          _sortChip('Score ↓', _SortBy.riskScoreDesc),
          const SizedBox(width: 4),
          _sortChip('Price ↓', _SortBy.priceDesc),
          const SizedBox(width: 4),
          _sortChip('Price ↑', _SortBy.priceAsc),
          const SizedBox(width: 4),
          _sortChip('Newest', _SortBy.newest),
          const SizedBox(width: 4),
          _sortChip('Oldest', _SortBy.oldest),
          _toolbarDivider(),
          // Search
          Expanded(
            child: SizedBox(
              height: 34,
              child: TextField(
                controller: _searchController,
                onChanged: (v) => setState(() => _searchQuery = v),
                style: GoogleFonts.inter(
                    fontSize: 12, color: _C.textPrimary),
                decoration: InputDecoration(
                  hintText: 'Search by order ID, item, or buyer…',
                  hintStyle: GoogleFonts.inter(
                      fontSize: 12, color: _C.textHint),
                  prefixIcon: const Icon(Icons.search,
                      size: 15, color: _C.textHint),
                  suffixIcon: _searchQuery.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.close,
                              size: 13, color: _C.textHint),
                          onPressed: () {
                            _searchController.clear();
                            setState(() => _searchQuery = '');
                          })
                      : null,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: _C.border)),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: _C.border)),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: _C.accent)),
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 8),
                  isDense: true),
              ),
            )),
        ]),
      ),
    ]);
  }

  Widget _toolbarDivider() {
    return Container(
      width: 1, height: 24,
      margin: const EdgeInsets.symmetric(horizontal: 10),
      color: _C.border);
  }

  Widget _filterChipCompact(
      String label, int count, String filter, Color activeColor) {
    final isActive = _selectedFilter == filter;
    return InkWell(
      onTap: () => setState(() => _selectedFilter = filter),
      mouseCursor: SystemMouseCursors.click,
      borderRadius: BorderRadius.circular(6),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
        decoration: BoxDecoration(
          color: isActive
              ? (activeColor == _C.accent
                  ? _C.accentDim
                  : activeColor.withOpacity(0.12))
              : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(
            color: isActive ? activeColor : Colors.transparent,
            width: isActive ? 1.5 : 1)),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Text(label,
            style: GoogleFonts.inter(
              fontSize: 12, fontWeight: FontWeight.w600,
              color: isActive
                  ? (activeColor == _C.accent
                      ? _C.accentDark
                      : activeColor)
                  : _C.textSecondary)),
          const SizedBox(width: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
            decoration: BoxDecoration(
              color: isActive
                  ? activeColor.withOpacity(0.15)
                  : _C.border,
              borderRadius: BorderRadius.circular(8)),
            child: Text('$count',
              style: GoogleFonts.inter(
                fontSize: 10, fontWeight: FontWeight.w700,
                color: isActive
                    ? (activeColor == _C.accent
                        ? _C.accentDark
                        : activeColor)
                    : _C.textSecondary))),
        ]),
      ),
    );
  }

  Widget _sortChip(String label, _SortBy sort) {
    final isActive = _sortBy == sort;
    return InkWell(
      onTap: () => setState(() =>
          _sortBy = _sortBy == sort ? _SortBy.none : sort),
      mouseCursor: SystemMouseCursors.click,
      borderRadius: BorderRadius.circular(6),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(
            horizontal: 7, vertical: 4),
        decoration: BoxDecoration(
          color: isActive ? _C.accentDark : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(
            color: isActive ? _C.accentDark : _C.border)),
        child: Text(label,
          style: GoogleFonts.inter(
            fontSize: 10, fontWeight: FontWeight.w600,
            color: isActive ? _C.accent : _C.textSecondary)),
      ),
    );
  }

  // =========================================================================
  // TABLE HEADER (desktop)
  // =========================================================================

Widget _buildTableHeader(double pad) {
    return Container(
      margin: EdgeInsets.fromLTRB(pad, 14, pad, 0),
      padding: const EdgeInsets.fromLTRB(18, 10, 18, 10),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(8),
          topRight: Radius.circular(8)),
        border: Border.all(color: _C.border)),
      child: Row(children: [
        SizedBox(width: 80,  child: _hdr('RISK')),
        const SizedBox(width: 14),
        SizedBox(width: 150, child: _hdr('ORDER ID')),
        const SizedBox(width: 14),
        Expanded(flex: 3,    child: _hdr('ITEM')),
        const SizedBox(width: 14),
        SizedBox(width: 120, child: _hdr('BUYER')),
        const SizedBox(width: 14),
        SizedBox(width: 120, child: _hdr('BUYER RISK')),
        const SizedBox(width: 14),
        GestureDetector(
          onTap: () => setState(() => _sortBy = _sortBy ==
                  _SortBy.riskScoreDesc
              ? _SortBy.none
              : _SortBy.riskScoreDesc),
          child: SizedBox(
            width: 90,
            child: Row(children: [
              _hdr('RISK SCORE'),
              const SizedBox(width: 3),
              Icon(
                _sortBy == _SortBy.riskScoreDesc
                    ? Icons.arrow_downward
                    : Icons.unfold_more,
                size: 11,
                color: _sortBy == _SortBy.riskScoreDesc
                    ? _C.accent
                    : _C.textHint),
            ]))),
        const SizedBox(width: 14),
        SizedBox(width: 100, child: _hdr('PROTECTION')),
        const SizedBox(width: 14),
        SizedBox(width: 100, child: _hdr('STATUS')),
        const SizedBox(width: 14),
        SizedBox(width: 30,  child: _hdr('MSG')),
        const SizedBox(width: 14),
        GestureDetector(
          onTap: () => setState(() {
            if (_sortBy == _SortBy.priceDesc)
              _sortBy = _SortBy.priceAsc;
            else if (_sortBy == _SortBy.priceAsc)
              _sortBy = _SortBy.none;
            else
              _sortBy = _SortBy.priceDesc;
          }),
          child: SizedBox(
            width: 80,
            child: Row(children: [
              _hdr('PRICE'),
              const SizedBox(width: 3),
              Icon(
                _sortBy == _SortBy.priceDesc
                    ? Icons.arrow_downward
                    : _sortBy == _SortBy.priceAsc
                        ? Icons.arrow_upward
                        : Icons.unfold_more,
                size: 11,
                color: (_sortBy == _SortBy.priceDesc ||
                        _sortBy == _SortBy.priceAsc)
                    ? _C.accent
                    : _C.textHint),
            ]))),
        const SizedBox(width: 14),
        SizedBox(width: 60,  child: _hdr('TIME')),
        const SizedBox(width: 14),
        const SizedBox(width: 24), // eye icon space
      ]),
    );
  }

  Widget _hdr(String t) => Text(t,
    style: GoogleFonts.inter(
      fontSize: 9,
      fontWeight: FontWeight.w700,
      color: _C.textHint,
      letterSpacing: 0.5));

  // =========================================================================
  // ERROR / EMPTY / SKELETON
  // =========================================================================

  Widget _buildErrorBanner() {
    return Container(
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFEEF1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
            color: _C.riskHigh.withOpacity(0.3))),
      child: Row(children: [
        const Icon(Icons.error_outline,
            color: _C.riskHigh, size: 18),
        const SizedBox(width: 10),
        Expanded(
          child: Text(_errorMessage,
            style: GoogleFonts.inter(
              fontSize: 12,
              color: _C.riskHigh,
              fontWeight: FontWeight.w500))),
        TextButton(
          onPressed: _loadOrders,
          child: Text('Retry',
            style: GoogleFonts.inter(
              fontSize: 11,
              color: _C.riskHigh,
              fontWeight: FontWeight.w700))),
      ]),
    );
  }

  Widget _buildSkeletonRow() {
    return Container(
      margin: const EdgeInsets.only(bottom: 1),
      padding: const EdgeInsets.fromLTRB(18, 12, 48, 12),
      decoration: BoxDecoration(
        color: _C.surface,
        border: Border(
          left:   BorderSide(color: _C.border),
          right:  BorderSide(color: _C.border),
          bottom: BorderSide(color: _C.border))),
      child: Row(children: [
        _shimmer(width: 90, height: 26, radius: 6),
        const SizedBox(width: 14),
        _shimmer(width: 150, height: 14),
        const SizedBox(width: 14),
        Expanded(child: _shimmer(height: 14)),
        const SizedBox(width: 14),
        _shimmer(width: 100, height: 14),
        const SizedBox(width: 14),
        _shimmer(width: 90, height: 22, radius: 4),
      ]),
    );
  }

  Widget _shimmer(
      {double? width, required double height, double radius = 4}) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.4, end: 1.0),
      duration: const Duration(milliseconds: 900),
      builder: (_, v, __) => Opacity(
        opacity: v,
        child: Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: _C.border,
            borderRadius: BorderRadius.circular(radius)))),
    );
  }

  Widget _buildEmptyState() {
    final msg = _searchQuery.isNotEmpty
        ? 'No results for "$_searchQuery"'
        : _selectedFilter == 'all'
            ? 'No orders yet'
            : _selectedFilter == 'not_protected'
                ? 'All orders are protected! 🎉'
                : 'No orders in this filter';
    return Center(
      child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
        Container(
          width: 72, height: 72,
          decoration: BoxDecoration(
            color: _C.accentDim,
            borderRadius: BorderRadius.circular(18)),
          child: Icon(
            _searchQuery.isNotEmpty
                ? Icons.search_off
                : Icons.shopping_bag_outlined,
            size: 36, color: _C.accent)),
        const SizedBox(height: 20),
        Text(msg,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: _C.textPrimary)),
        if (_searchQuery.isNotEmpty) ...[
          const SizedBox(height: 8),
          TextButton(
            onPressed: () {
              _searchController.clear();
              setState(() => _searchQuery = '');
            },
            child: Text('Clear search',
              style: GoogleFonts.inter(
                fontSize: 12,
                color: _C.accent,
                fontWeight: FontWeight.w600))),
        ],
      ]));
  }

  Widget _emptyChart(String msg) {
    return Center(
      child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
        Icon(Icons.bar_chart, size: 30, color: Colors.grey.shade300),
        const SizedBox(height: 8),
        Text(msg,
          style: GoogleFonts.inter(
              fontSize: 11, color: _C.textHint)),
      ]));
  }

  // =========================================================================
  // ORDER DETAIL PANEL
  // =========================================================================

  void _openOrderDetails(Map<String, dynamic> order) async {
    await showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Close',
      barrierColor: Colors.black54,
      transitionDuration: const Duration(milliseconds: 320),
      pageBuilder: (ctx, _, __) => Align(
        alignment: Alignment.centerRight,
        child: Material(
          color: Colors.transparent,
          child: Container(
            width: _BP.isMobile(ctx)
                ? MediaQuery.of(ctx).size.width
                : _BP.isTablet(ctx)
                    ? MediaQuery.of(ctx).size.width * 0.75
                    : MediaQuery.of(ctx).size.width * 0.46,
            constraints: _BP.isMobile(ctx)
                ? null
                : const BoxConstraints(
                    minWidth: 480, maxWidth: 720),
            height: MediaQuery.of(ctx).size.height,
            color: const Color(0xFFF8FAFC),
            child: OrderDetailPanel(order: order),
          ),
        ),
      ),
      transitionBuilder: (_, animation, __, child) =>
          SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(1, 0),
          end: Offset.zero,
        ).animate(CurvedAnimation(
            parent: animation, curve: Curves.easeOutCubic)),
        child: child),
    );
    if (mounted) {
      _loadOrders(isRefresh: true);
      _loadMessageCounts();
    }
  }
}

// =============================================================================
// DESKTOP ORDER ROW
// =============================================================================

class _DesktopOrderRow extends StatefulWidget {
  final Map<String, dynamic>  order;
  final Map<String, dynamic>? profile;
  final int          messageCount;
  final bool         isLast;
  final VoidCallback onTap;
  final VoidCallback onBuyerTap;

  const _DesktopOrderRow({
    required this.order,
    this.profile,
    required this.messageCount,
    required this.isLast,
    required this.onTap,
    required this.onBuyerTap,
  });

  @override
  State<_DesktopOrderRow> createState() => _DesktopOrderRowState();
}

class _DesktopOrderRowState extends State<_DesktopOrderRow> {
  bool _hovering = false;

  @override
  Widget build(BuildContext context) {
    final o           = widget.order;
    final riskLevel   = '${o['risk_level']   ?? 'LOW'}'.trim().toUpperCase();
    final riskScore   = o['risk_score']  as int?    ?? 0;
    final itemTitle   = o['item_title']  as String? ?? 'Unknown Item';
    final itemPrice   = (o['item_price'] as num?)?.toDouble() ?? 0.0;
    final buyer       = o['buyer_username'] as String? ?? 'Unknown';
    final protected   = o['checklist_completed'] as bool? ?? false;
    final createdAt   = DateTime.tryParse(o['created_at'] ?? '');
    final status      = '${o['order_status'] ?? 'pending'}'.trim().toLowerCase();
    final orderId     = o['ebay_order_id'] ?? 'Unknown';
    final isShipped   = status == 'shipped';
    final tracking    = o['tracking_number'] as String?;
    final carrier     = o['carrier']         as String?;

    Color riskColor; Color riskBg;
    switch (riskLevel) {
      case 'HIGH':   riskColor = _C.riskHigh;   riskBg = const Color(0xFFFFE6E6); break;
      case 'MEDIUM': riskColor = _C.riskMedium; riskBg = const Color(0xFFFFF3E6); break;
      default:       riskColor = _C.riskLow;    riskBg = const Color(0xFFE6FFF0);
    }

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hovering = true),
      onExit:  (_) => setState(() => _hovering = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 130),
          margin: const EdgeInsets.only(bottom: 1),
          padding: const EdgeInsets.fromLTRB(18, 13, 18, 13),
          decoration: BoxDecoration(
            color: _hovering
                ? _C.surfaceHover
                : isShipped
                    ? const Color(0xFFF0F7FF)
                    : _C.surface,
            border: Border(
              left:   BorderSide(color: _hovering ? riskColor.withOpacity(0.4) : isShipped ? _C.blue.withOpacity(0.3) : _C.border, width: isShipped ? 2 : 1),
              right:  BorderSide(color: _hovering ? riskColor.withOpacity(0.2) : _C.border),
              bottom: BorderSide(color: _hovering ? riskColor.withOpacity(0.2) : _C.border),
              top:    const BorderSide(color: Colors.transparent)),
            borderRadius: BorderRadius.zero),
          child: Row(children: [
            // Risk badge
            Container(
              width: 80,
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
              decoration: BoxDecoration(
                color: riskBg,
                borderRadius: BorderRadius.circular(6)),
              child: Text('$riskLevel RISK',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 9, fontWeight: FontWeight.w700,
                  color: riskColor, letterSpacing: 0.3))),
            const SizedBox(width: 14),
            // Order ID
            SizedBox(
              width: 150,
              child: Text('Order #$orderId',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 12, fontWeight: FontWeight.w600,
                  color: _C.textPrimary),
                maxLines: 1, overflow: TextOverflow.ellipsis)),
            const SizedBox(width: 14),
            // Item
            Expanded(
              flex: 3,
              child: Text(itemTitle,
                style: GoogleFonts.inter(
                  fontSize: 12, color: _C.textPrimary,
                  fontWeight: FontWeight.w500),
                maxLines: 1, overflow: TextOverflow.ellipsis)),
            const SizedBox(width: 14),
            // Buyer
            SizedBox(
              width: 120,
              child: Row(children: [
                Icon(Icons.person_outline, size: 12, color: _C.textHint),
                const SizedBox(width: 4),
                Expanded(
                  child: GestureDetector(
                    onTap: widget.onBuyerTap,
                    child: Text(buyer,
                      style: GoogleFonts.inter(
                        fontSize: 11, color: _C.textSecondary,
                        decoration: TextDecoration.underline,
                        decorationColor: _C.accent),
                      maxLines: 1, overflow: TextOverflow.ellipsis))),
              ])),
            const SizedBox(width: 14),
            // Buyer Risk — NEW column
            SizedBox(width: 120, child: _buildBuyerRiskBadges(widget.profile)),
            const SizedBox(width: 14),
            // Risk score
            SizedBox(
              width: 90,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('$riskScore/100',
                    style: GoogleFonts.inter(
                      fontSize: 10, fontWeight: FontWeight.w600,
                      color: _C.textSecondary)),
                  const SizedBox(height: 3),
                  Container(
                    height: 3,
                    decoration: BoxDecoration(
                      color: _C.border,
                      borderRadius: BorderRadius.circular(2)),
                    child: FractionallySizedBox(
                      alignment: Alignment.centerLeft,
                      widthFactor: (riskScore / 100).clamp(0.0, 1.0),
                      child: Container(
                        decoration: BoxDecoration(
                          color: riskColor,
                          borderRadius: BorderRadius.circular(2))))),
                ])),
            const SizedBox(width: 14),
            // Protection
            SizedBox(
              width: 100,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: protected
                      ? const Color(0xFFE6FFF5)
                      : riskColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(
                    color: protected
                        ? const Color(0xFF00C48C).withOpacity(0.4)
                        : riskColor.withOpacity(0.3))),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(
                    protected ? Icons.verified : Icons.shield_outlined,
                    size: 11,
                    color: protected ? const Color(0xFF00C48C) : riskColor),
                  const SizedBox(width: 5),
                  Expanded(
                    child: Text(
                      protected ? 'Protected' : 'Need action',
                      style: GoogleFonts.inter(
                        fontSize: 10, fontWeight: FontWeight.w700,
                        color: protected ? const Color(0xFF007A56) : riskColor),
                      maxLines: 1, overflow: TextOverflow.ellipsis)),
                ]))),
            const SizedBox(width: 14),
            // Status
            SizedBox(
              width: 100,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: isShipped
                          ? _C.blue.withOpacity(0.1)
                          : status == 'delivered'
                              ? const Color(0xFFE6FFF5)
                              : _C.bg,
                      borderRadius: BorderRadius.circular(4)),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      Icon(
                        isShipped ? Icons.local_shipping
                            : status == 'delivered' ? Icons.check_circle
                            : Icons.pending_outlined,
                        size: 9,
                        color: isShipped ? _C.blue
                            : status == 'delivered' ? const Color(0xFF007A56)
                            : _C.textSecondary),  // ← closing ) was missing here
                      const SizedBox(width: 3),
                      Flexible(
                        child: Text(status.toUpperCase(),
                          style: GoogleFonts.inter(
                            fontSize: 8, fontWeight: FontWeight.w700,
                            color: isShipped ? _C.blue
                                : status == 'delivered' ? const Color(0xFF007A56)
                                : _C.textSecondary,
                            letterSpacing: 0.4),
                          maxLines: 1, overflow: TextOverflow.ellipsis)),
                    ])),
                  if (isShipped && carrier != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      '$carrier${tracking != null ? ' • ${tracking.length > 6 ? tracking.substring(0, 6) : tracking}…' : ''}',
                      style: GoogleFonts.inter(fontSize: 8, color: _C.textHint),
                      maxLines: 1, overflow: TextOverflow.ellipsis),
                  ],
                ])),
            const SizedBox(width: 14),
            // Message count
            SizedBox(
              width: 30,
              child: widget.messageCount > 0
                  ? Tooltip(
                      message: '${widget.messageCount} message${widget.messageCount > 1 ? 's' : ''} sent',
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 3),
                        decoration: BoxDecoration(
                          color: _C.blue.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: _C.blue.withOpacity(0.3))),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.message_outlined, size: 9, color: _C.blue),
                            const SizedBox(width: 2),
                            Text('${widget.messageCount}',
                              style: GoogleFonts.inter(
                                fontSize: 9, fontWeight: FontWeight.w700,
                                color: _C.blue)),
                          ])))
                  : const SizedBox()),
            const SizedBox(width: 14),
            // Price
            SizedBox(
              width: 80,
              child: Text('\$${itemPrice.toStringAsFixed(2)}',
                textAlign: TextAlign.right,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 14, fontWeight: FontWeight.w700,
                  color: _C.textPrimary))),
            const SizedBox(width: 14),
            // Time
            SizedBox(
              width: 60,
              child: Text(
                createdAt != null ? _timeAgo(createdAt) : '-',
                textAlign: TextAlign.right,
                style: GoogleFonts.inter(fontSize: 10, color: _C.textHint))),
            const SizedBox(width: 14),
            // Eye icon — restored
            SizedBox(
              width: 24,
              child: Icon(Icons.visibility_outlined,
                size: 18,
                color: _hovering ? _C.accent : _C.textHint)),
          ]),
        ),
      ),
    );
  }

Widget _buildBuyerRiskBadges(Map<String, dynamic>? profile) {
    if (profile == null) {
      return Text('No history',
        style: GoogleFonts.inter(
          fontSize: 9, color: _C.textHint,
          fontStyle: FontStyle.italic));
    }

    final returnRate   = (profile['return_rate']  as num?)?.toDouble() ?? 0.0;
    final disputeCount =  profile['dispute_count'] as int? ?? 0;
    final isRepeat     = (profile['order_count']   as int? ?? 1) > 1;

    final retBad = returnRate > 15;
    final disBad = disputeCount > 0;

    return Wrap(
      spacing: 3,
      runSpacing: 3,
      children: [
        // Return rate — short text
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
          decoration: BoxDecoration(
            color: retBad
                ? const Color(0xFFFFE6E6)
                : const Color(0xFFE6FFF0),
            borderRadius: BorderRadius.circular(4)),
          child: Text(
            '↩ ${returnRate.toStringAsFixed(0)}%',
            style: GoogleFonts.inter(
              fontSize: 8, fontWeight: FontWeight.w600,
              color: retBad
                  ? const Color(0xFFA32D2D)
                  : const Color(0xFF3B6D11)))),
        // Dispute count — short text
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
          decoration: BoxDecoration(
            color: disBad
                ? const Color(0xFFFFE6E6)
                : const Color(0xFFE6FFF0),
            borderRadius: BorderRadius.circular(4)),
          child: Text(
            disBad ? '⚠ $disputeCount' : '✓',
            style: GoogleFonts.inter(
              fontSize: 8, fontWeight: FontWeight.w600,
              color: disBad
                  ? const Color(0xFFA32D2D)
                  : const Color(0xFF3B6D11)))),
        // Repeat buyer
        if (isRepeat)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
            decoration: BoxDecoration(
              color: const Color(0xFFEEEDFE),
              borderRadius: BorderRadius.circular(4)),
            child: Text('×2',
              style: GoogleFonts.inter(
                fontSize: 8, fontWeight: FontWeight.w600,
                color: const Color(0xFF3C3489)))),
      ],
    );
  }

  String _timeAgo(DateTime d) {
    final diff = DateTime.now().difference(d);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours   < 24) return '${diff.inHours}h ago';
    if (diff.inDays    < 7)  return '${diff.inDays}d ago';
    return '${d.day}/${d.month}';
  }
}

// =============================================================================
// MOBILE ORDER CARD
// =============================================================================

class _MobileOrderCard extends StatelessWidget {
  final Map<String, dynamic>  order;
  final Map<String, dynamic>? profile;
  final int          messageCount;
  final VoidCallback onTap;
  final VoidCallback onBuyerTap;

  const _MobileOrderCard({
    required this.order,
    this.profile,
    required this.messageCount,
    required this.onTap,
    required this.onBuyerTap,
  });

  @override
  Widget build(BuildContext context) {
    final riskLevel = '${order['risk_level'] ?? 'LOW'}'.trim().toUpperCase();
    final riskScore = order['risk_score']  as int?    ?? 0;
    final itemTitle = order['item_title']  as String? ?? 'Unknown Item';
    final itemPrice = (order['item_price'] as num?)?.toDouble() ?? 0.0;
    final buyer     = order['buyer_username'] as String? ?? 'Unknown';
    final protected = order['checklist_completed'] as bool? ?? false;
    final createdAt = DateTime.tryParse(order['created_at'] ?? '');
    final status    = '${order['order_status'] ?? 'pending'}'.trim().toLowerCase();
    final orderId   = order['ebay_order_id'] ?? 'Unknown';

    Color riskColor; Color riskBg;
    switch (riskLevel) {
      case 'HIGH':   riskColor = _C.riskHigh;   riskBg = const Color(0xFFFFE6E6); break;
      case 'MEDIUM': riskColor = _C.riskMedium; riskBg = const Color(0xFFFFF3E6); break;
      default:       riskColor = _C.riskLow;    riskBg = const Color(0xFFE6FFF0);
    }

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(top: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: _C.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: _C.border)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Row 1 — Risk badge + Order ID + Price
            Row(children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: riskBg,
                  borderRadius: BorderRadius.circular(5)),
                child: Text('$riskLevel RISK',
                  style: GoogleFonts.inter(
                    fontSize: 9, fontWeight: FontWeight.w700,
                    color: riskColor, letterSpacing: 0.3))),
              const SizedBox(width: 8),
              Text('Order #$orderId',
                style: GoogleFonts.inter(
                  fontSize: 11, color: _C.textSecondary)),
              const Spacer(),
              Text('\$${itemPrice.toStringAsFixed(2)}',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 15, fontWeight: FontWeight.w800,
                  color: _C.textPrimary)),
            ]),
            const SizedBox(height: 8),
            // Row 2 — Item title
            Text(itemTitle,
              style: GoogleFonts.inter(
                fontSize: 13, fontWeight: FontWeight.w600,
                color: _C.textPrimary),
              maxLines: 2, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 8),
            // Row 3 — Buyer + time
            Row(children: [
              Icon(Icons.person_outline, size: 12, color: _C.textHint),
              const SizedBox(width: 4),
              GestureDetector(
                onTap: onBuyerTap,
                child: Text(buyer,
                  style: GoogleFonts.inter(
                    fontSize: 11, color: _C.textSecondary,
                    decoration: TextDecoration.underline,
                    decorationColor: _C.accent))),
              const Spacer(),
              Text(createdAt != null ? _timeAgo(createdAt) : '-',
                style: GoogleFonts.inter(fontSize: 10, color: _C.textHint)),
            ]),
            // Row 4 — Buyer Risk badges
            const SizedBox(height: 6),
            _buildBuyerRiskBadges(profile),
            const SizedBox(height: 10),
            // Row 5 — Score + Protection + Status
            Row(children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Risk score: $riskScore/100',
                      style: GoogleFonts.inter(
                        fontSize: 10, color: _C.textSecondary)),
                    const SizedBox(height: 3),
                    Container(
                      height: 3,
                      decoration: BoxDecoration(
                        color: _C.border,
                        borderRadius: BorderRadius.circular(2)),
                      child: FractionallySizedBox(
                        alignment: Alignment.centerLeft,
                        widthFactor: (riskScore / 100).clamp(0.0, 1.0),
                        child: Container(
                          decoration: BoxDecoration(
                            color: riskColor,
                            borderRadius: BorderRadius.circular(2))))),
                  ])),
              const SizedBox(width: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: protected
                      ? const Color(0xFFE6FFF5)
                      : riskColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(
                    color: protected
                        ? const Color(0xFF00C48C).withOpacity(0.4)
                        : riskColor.withOpacity(0.3))),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(
                    protected ? Icons.verified : Icons.shield_outlined,
                    size: 11,
                    color: protected ? const Color(0xFF00C48C) : riskColor),
                  const SizedBox(width: 4),
                  Text(protected ? 'Protected' : 'Need action',
                    style: GoogleFonts.inter(
                      fontSize: 10, fontWeight: FontWeight.w700,
                      color: protected ? const Color.fromARGB(255, 8, 15, 4) : riskColor)),
                ])),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: status == 'shipped'
                      ? _C.blue.withOpacity(0.1)
                      : status == 'delivered'
                          ? const Color(0xFFE6FFF5)
                          : _C.bg,
                  borderRadius: BorderRadius.circular(4)),
                child: Text(status.toUpperCase(),
                  style: GoogleFonts.inter(
                    fontSize: 9, fontWeight: FontWeight.w700,
                    color: status == 'shipped'
                        ? _C.blue
                        : status == 'delivered'
                            ? const Color(0xFF007A56)
                            : _C.textSecondary,
                    letterSpacing: 0.4))),
            ]),
            if (messageCount > 0) ...[
              const SizedBox(height: 6),
              Row(children: [
                const Icon(Icons.message_outlined, size: 11, color: _C.blue),
                const SizedBox(width: 4),
                Text('$messageCount message${messageCount > 1 ? 's' : ''} sent',
                  style: GoogleFonts.inter(fontSize: 10, color: _C.blue)),
              ]),
            ],
          ]),
      ),
    );
  }

  Widget _buildBuyerRiskBadges(Map<String, dynamic>? profile) {
    if (profile == null) {
      return Text('No buyer history',
        style: GoogleFonts.inter(
          fontSize: 9, color: _C.textHint,
          fontStyle: FontStyle.italic));
    }

    final returnRate   = (profile['return_rate']  as num?)?.toDouble() ?? 0.0;
    final disputeCount =  profile['dispute_count'] as int? ?? 0;
    final isRepeat     = (profile['order_count']   as int? ?? 1) > 1;

    final retBad = returnRate > 15;
    final disBad = disputeCount > 0;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
          decoration: BoxDecoration(
            color: retBad ? const Color(0xFFFFE6E6) : const Color(0xFFE6FFF0),
            borderRadius: BorderRadius.circular(4)),
          child: Text('↩ ${returnRate.toStringAsFixed(0)}%',
            style: GoogleFonts.inter(
              fontSize: 9, fontWeight: FontWeight.w600,
              color: retBad
                  ? const Color(0xFFA32D2D)
                  : const Color(0xFF3B6D11)))),
        const SizedBox(width: 4),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
          decoration: BoxDecoration(
            color: disBad ? const Color(0xFFFFE6E6) : const Color(0xFFE6FFF0),
            borderRadius: BorderRadius.circular(4)),
          child: Text(disBad ? '⚠ $disputeCount disp.' : '✓ clean',
            style: GoogleFonts.inter(
              fontSize: 9, fontWeight: FontWeight.w600,
              color: disBad
                  ? const Color(0xFFA32D2D)
                  : const Color(0xFF3B6D11)))),
        if (isRepeat) ...[
          const SizedBox(width: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
            decoration: BoxDecoration(
              color: const Color(0xFFEEEDFE),
              borderRadius: BorderRadius.circular(4)),
            child: Text('↻ repeat',
              style: GoogleFonts.inter(
                fontSize: 9, fontWeight: FontWeight.w600,
                color: const Color(0xFF3C3489)))),
        ],
      ],
    );
  }

  String _timeAgo(DateTime d) {
    final diff = DateTime.now().difference(d);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours   < 24) return '${diff.inHours}h ago';
    if (diff.inDays    < 7)  return '${diff.inDays}d ago';
    return '${d.day}/${d.month}';
  }
}