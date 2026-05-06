// lib/pages/orders/orders_dashboard.dart

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'order_detail_screen.dart';
import 'buyer_profile_panel.dart';
import 'export_service.dart';

class _C {
  static const bg = Color(0xFFF8FAFC);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceHover = Color(0xFFF1F5F9);
  static const border = Color(0xFFE2E8F0);
  static const accent = Color(0xFF8FFF00);
  static const accentDim = Color(0xFFE8FFB0);
  static const textPrimary = Color(0xFF131B2F);
  static const textSecondary = Color(0xFF64748B);
  static const textHint = Color(0xFF94A3B8);
  static const riskLow = Color(0xFF00C48C);
  static const riskMedium = Color(0xFFFFB800);
  static const riskHigh = Color(0xFFFF4D6A);
}

class OrdersDashboard extends StatefulWidget {
  const OrdersDashboard({super.key});
  @override
  State<OrdersDashboard> createState() => _OrdersDashboardState();
}

class _OrdersDashboardState extends State<OrdersDashboard> {
  final _supabase = Supabase.instance.client;

  bool _isLoading = true;
  bool _hasError = false;
  String _errorMessage = '';
  bool _isRefreshing = false;
  String _selectedFilter = 'all';
  List<Map<String, dynamic>> _orders = [];
  final _searchController = TextEditingController();
  String _searchQuery = '';

  int _lowRiskCount = 0;
  int _mediumRiskCount = 0;
  int _highRiskCount = 0;
  int _protectedCount = 0;
  int _totalOrders = 0;
  int _shippedCount = 0;
  Map<String, int> _messageCounts = {};
  RealtimeChannel? _realtimeChannel;

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
          callback: (payload) {
            _loadOrders();
            _loadMessageCounts();
          },
        )
        .subscribe();
  }

  Future<void> _loadMessageCounts() async {
    try {
      final data = await _supabase.from('sent_messages').select('order_id');
      final counts = <String, int>{};
      for (var row in data) {
        final orderId = row['order_id'] as String;
        counts[orderId] = (counts[orderId] ?? 0) + 1;
      }
      if (mounted) setState(() => _messageCounts = counts);
    } catch (_) {}
  }

  Future<void> _loadOrders({bool isRefresh = false}) async {
    if (isRefresh) {
      setState(() => _isRefreshing = true);
    } else {
      setState(() { 
        _isLoading = true; 
        _hasError = false; 
      });
    }

    try {
      final userId = _supabase.auth.currentUser?.id;
      if (userId == null) {
        setState(() {
          _isLoading = false;
          _isRefreshing = false;
          _hasError = true;
          _errorMessage = 'Not logged in.';
        });
        return;
      }

      // ✅ SIMPLE QUERY - no join first, just get orders
      final data = await _supabase
          .from('protected_orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', ascending: false)
          .limit(100);

      // ✅ SIMPLE COUNT - just use risk_level directly
      int low = 0, medium = 0, high = 0, protected = 0, shipped = 0;
      for (var order in data) {
        final risk = '${order['risk_level'] ?? ''}'.trim().toUpperCase();
        final status = '${order['order_status'] ?? ''}'.trim().toLowerCase();
        
        if (risk == 'LOW') low++;
        else if (risk == 'MEDIUM') medium++;
        else if (risk == 'HIGH') high++;
        
        if (order['checklist_completed'] == true) protected++;
        if (status == 'shipped' || status == 'delivered') shipped++;
      }

      // ✅ Now get buyer profiles separately
      final ordersWithProfiles = <Map<String, dynamic>>[];
      for (var order in data) {
        final buyer = order['buyer_username'] as String?;
        Map<String, dynamic>? profile;
        if (buyer != null) {
          try {
            final profileData = await _supabase
                .from('buyer_profiles')
                .select('*')
                .eq('ebay_buyer_username', buyer)
                .maybeSingle();
            profile = profileData;
          } catch (_) {}
        }
        ordersWithProfiles.add({...order, 'buyer_profiles': profile});
      }

      if (mounted) {
        setState(() {
          _orders = List<Map<String, dynamic>>.from(data);
          _totalOrders = data.length;
          _lowRiskCount = low;
          _mediumRiskCount = medium;
          _highRiskCount = high;
          _protectedCount = protected;
          _shippedCount = shipped;
          _isLoading = false;
          _isRefreshing = false;
          _hasError = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _isRefreshing = false;
          _hasError = true;
          _errorMessage = 'Failed to load orders. Pull down to retry.';
        });
      }
    }
  }

  // ✅ SIMPLE FILTER - direct string comparison
  List<Map<String, dynamic>> get _filteredOrders {
    List<Map<String, dynamic>> orders;

    switch (_selectedFilter) {
      case 'high':
        orders = _orders.where((o) =>
            '${o['risk_level'] ?? ''}'.trim().toUpperCase() == 'HIGH'
        ).toList();
        break;
      case 'medium':
        orders = _orders.where((o) =>
            '${o['risk_level'] ?? ''}'.trim().toUpperCase() == 'MEDIUM'
        ).toList();
        break;
      case 'low':
        orders = _orders.where((o) =>
            '${o['risk_level'] ?? ''}'.trim().toUpperCase() == 'LOW'
        ).toList();
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
      case 'all':
      default:
        orders = List.from(_orders);
    }

    final q = _searchQuery.trim().toLowerCase();
    if (q.isNotEmpty) {
      orders = orders.where((o) {
        return '${o['ebay_order_id'] ?? ''}'.toLowerCase().contains(q) ||
               '${o['item_title'] ?? ''}'.toLowerCase().contains(q) ||
               '${o['buyer_username'] ?? ''}'.toLowerCase().contains(q);
      }).toList();
    }

    return orders;
  }

  @override
  Widget build(BuildContext context) {
    final userName = _supabase.auth.currentUser?.userMetadata?['full_name'] ?? 'Seller';

    return Scaffold(
      backgroundColor: _C.bg,
      body: TweenAnimationBuilder<double>(
        tween: Tween(begin: 0.0, end: 1.0),
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeOut,
        builder: (context, val, child) => Opacity(
          opacity: val,
          child: child,
        ),
        child: RefreshIndicator(
          onRefresh: () => _loadOrders(isRefresh: true),
          color: _C.accent,
          backgroundColor: _C.surface,
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(40, 48, 40, 32),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Welcome back, $userName! 👋',
                                  style: GoogleFonts.spaceGrotesk(
                                    fontSize: 28, fontWeight: FontWeight.w700,
                                    color: _C.textPrimary, letterSpacing: -0.5,
                                  )),
                                const SizedBox(height: 8),
                                Text('Protect your orders from risky buyers',
                                  style: GoogleFonts.inter(fontSize: 14, color: _C.textSecondary)),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: const Color(0xFF8FFF00).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: const Color(0xFF8FFF00).withOpacity(0.4)),
                            ),
                            child: Row(
                              children: [
                                _isRefreshing
                                    ? const SizedBox(width: 8, height: 8,
                                        child: CircularProgressIndicator(strokeWidth: 1.5, color: Color(0xFF8FFF00)))
                                    : Container(width: 8, height: 8,
                                        decoration: const BoxDecoration(color: Color(0xFF8FFF00), shape: BoxShape.circle)),
                                const SizedBox(width: 6),
                                Text(_isRefreshing ? 'UPDATING...' : 'LIVE',
                                  style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700,
                                      color: const Color(0xFF131B2F))),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          IconButton(
                            onPressed: () => _loadOrders(isRefresh: true),
                            icon: _isRefreshing
                                ? const SizedBox(width: 20, height: 20,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: _C.textSecondary))
                                : const Icon(Icons.refresh, color: _C.textSecondary),
                          ),
                          IconButton(
                            onPressed: () => ExportService.exportOrdersToCSV(
                              context: context,
                              orders: _filteredOrders,
                              filterLabel: _selectedFilter == 'all'
                                  ? 'All Orders'
                                  : _selectedFilter.replaceAll('_', ' ').toUpperCase(),
                            ),
                            icon: const Icon(Icons.download, color: _C.textSecondary),
                            tooltip: 'Export to CSV',
                          ),
                        ],
                      ),
                      const SizedBox(height: 32),
                      _buildStatsRow(),
                      const SizedBox(height: 32),
                      if (_hasError) _buildErrorBanner(),
                    ],
                  ),
                ),
              ),

            // Filter + Alert row
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: Row(
                  children: [
                    Expanded(child: _buildFilterTabs()),
                    if (_highRiskCount > 0) ...[
                      const SizedBox(width: 16),
                      Container(
                        height: 44,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF1F0),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: _C.riskHigh.withOpacity(0.3)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.warning_amber_rounded, size: 16, color: _C.riskHigh),
                            const SizedBox(width: 8),
                            Text(
                              '⚠️ $_highRiskCount High-Risk ${_highRiskCount == 1 ? 'Order' : 'Orders'} Need Protection',
                              style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: _C.riskHigh),
                            ),
                            const SizedBox(width: 12),
                            MouseRegion(
                              cursor: SystemMouseCursors.click,
                              child: GestureDetector(
                                onTap: () => setState(() => _selectedFilter = 'high'),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: _C.accent,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text('View',
                                    style: GoogleFonts.inter(fontSize: 11,
                                        fontWeight: FontWeight.w700, color: const Color(0xFF131B2F))),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),

            // Search bar
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(40, 12, 40, 0),
                child: _buildSearchBar(),
              ),
            ),

            // Table header
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.fromLTRB(40, 16, 40, 0),
                padding: const EdgeInsets.fromLTRB(20, 12, 50, 12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(8), topRight: Radius.circular(8)),
                  border: Border.all(color: _C.border),
                ),
                child: Row(
                  children: [
                    SizedBox(width: 90, child: _headerText('RISK')),
                    const SizedBox(width: 16),
                    SizedBox(width: 180, child: _headerText('ORDER ID')),
                    const SizedBox(width: 16),
                    Expanded(flex: 3, child: _headerText('ITEM')),
                    const SizedBox(width: 16),
                    SizedBox(width: 130, child: _headerText('BUYER')),
                    const SizedBox(width: 16),
                    SizedBox(width: 100, child: _headerText('RISK SCORE')),
                    const SizedBox(width: 16),
                    SizedBox(width: 70, child: _headerText('RETURNS')),
                    const SizedBox(width: 12),
                    SizedBox(width: 60, child: _headerText('DISPUTES')),
                    const SizedBox(width: 16),
                    SizedBox(width: 110, child: _headerText('PROTECTION')),
                    const SizedBox(width: 16),
                    SizedBox(width: 120, child: _headerText('STATUS')),
                    const SizedBox(width: 16),
                    SizedBox(width: 40, child: _headerText('MSG')),
                    const SizedBox(width: 16),
                    SizedBox(width: 110, child: _headerText('PRICE')),
                    const SizedBox(width: 16),
                    SizedBox(width: 80, child: _headerText('TIME')),
                    const SizedBox(width: 12),
                    const SizedBox(width: 24),
                  ],
                ),
              ),
            ),

            // Orders list
            if (_isLoading)
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(40, 0, 40, 40),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => _buildSkeletonRow(), childCount: 5),
                ),
              )
            else if (_filteredOrders.isEmpty)
              SliverFillRemaining(child: _buildEmptyState())
              else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(40, 0, 40, 40),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final order = _filteredOrders[index];
                      final msgCount = _messageCounts[order['id']] ?? 0;
                      final isLast = index == _filteredOrders.length - 1;
                      return TweenAnimationBuilder<double>(
                        key: ValueKey(order['id']),
                        tween: Tween(begin: 0.0, end: 1.0),
                        duration: Duration(milliseconds: 200 + (index * 30).clamp(0, 600)),
                        curve: Curves.easeOut,
                        builder: (context, val, child) => Opacity(
                          opacity: val,
                          child: Transform.translate(
                            offset: Offset(0, 20 * (1 - val)),
                            child: child,
                          ),
                        ),
                        child: _OrderCard(
                          order: order,
                          messageCount: msgCount,
                          isLast: isLast,
                          onTap: () => _openOrderDetails(order),
                        ),
                      );
                    },
                    childCount: _filteredOrders.length,
                  ),
                ),
              ),
          ],        // ← closes slivers: [
        ),          // ← closes CustomScrollView
      ),            // ← closes RefreshIndicator
    ),              // ← closes TweenAnimationBuilder child:
  );               // ← closes return Scaffold
}                  // ← closes build()

  Widget _buildSearchBar() {
    return Container(
      height: 44,
      decoration: BoxDecoration(
        color: _C.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: _C.border),
      ),
      child: TextField(
        controller: _searchController,
        onChanged: (v) => setState(() => _searchQuery = v),
        style: GoogleFonts.inter(fontSize: 13, color: _C.textPrimary),
        decoration: InputDecoration(
          hintText: 'Search by order ID, item, or buyer...',
          hintStyle: GoogleFonts.inter(fontSize: 13, color: _C.textHint),
          prefixIcon: const Icon(Icons.search, size: 18, color: _C.textHint),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.close, size: 16, color: _C.textHint),
                  onPressed: () {
                    _searchController.clear();
                    setState(() => _searchQuery = '');
                  },
                )
              : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        ),
      ),
    );
  }

  Widget _buildErrorBanner() {
    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFFEEF1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: _C.riskHigh.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: _C.riskHigh, size: 20),
          const SizedBox(width: 12),
          Expanded(child: Text(_errorMessage,
            style: GoogleFonts.inter(fontSize: 13, color: _C.riskHigh, fontWeight: FontWeight.w500))),
          TextButton(
            onPressed: () => _loadOrders(),
            child: Text('Retry',
              style: GoogleFonts.inter(fontSize: 12, color: _C.riskHigh, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  Widget _buildSkeletonRow() {
    return Container(
      margin: const EdgeInsets.only(bottom: 1),
      padding: const EdgeInsets.fromLTRB(20, 14, 50, 14),
      decoration: BoxDecoration(
        color: _C.surface,
        border: Border(
          left: BorderSide(color: _C.border),
          right: BorderSide(color: _C.border),
          bottom: BorderSide(color: _C.border),
        ),
      ),
      child: Row(
        children: [
          _shimmer(width: 90, height: 28, radius: 6),
          const SizedBox(width: 16),
          _shimmer(width: 160, height: 16),
          const SizedBox(width: 16),
          Expanded(child: _shimmer(height: 16)),
          const SizedBox(width: 16),
          _shimmer(width: 100, height: 16),
          const SizedBox(width: 16),
          _shimmer(width: 90, height: 24, radius: 4),
          const SizedBox(width: 16),
          _shimmer(width: 60, height: 16),
          const SizedBox(width: 16),
          _shimmer(width: 80, height: 16),
          const SizedBox(width: 16),
          _shimmer(width: 70, height: 28, radius: 4),
          const SizedBox(width: 16),
          _shimmer(width: 80, height: 16),
        ],
      ),
    );
  }

  Widget _shimmer({double? width, required double height, double radius = 4}) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.4, end: 1.0),
      duration: const Duration(milliseconds: 900),
      builder: (context, value, child) => Opacity(
        opacity: value,
        child: Container(
          width: width, height: height,
          decoration: BoxDecoration(
            color: const Color(0xFFE2E8F0),
            borderRadius: BorderRadius.circular(radius),
          ),
        ),
      ),
    );
  }

  Widget _buildStatsRow() {
    return Row(
      children: [
        Expanded(child: _AnimatedStatCard(
          icon: Icons.shield_outlined, iconColor: _C.riskLow,
          label: 'Low Risk', value: _lowRiskCount.toString(),
          subtitle: 'Safe to ship', backgroundColor: const Color(0xFFE6FFF0),
        )),
        const SizedBox(width: 16),
        Expanded(child: _AnimatedStatCard(
          icon: Icons.warning_amber_rounded, iconColor: _C.riskMedium,
          label: 'Medium Risk', value: _mediumRiskCount.toString(),
          subtitle: 'Extra care needed', backgroundColor: const Color(0xFFFFF3E6),
        )),
        const SizedBox(width: 16),
        Expanded(child: _AnimatedStatCard(
          icon: Icons.error_outline_rounded, iconColor: _C.riskHigh,
          label: 'High Risk', value: _highRiskCount.toString(),
          subtitle: 'Action required', backgroundColor: const Color(0xFFFFE6E6),
        )),
        const SizedBox(width: 16),
        Expanded(child: _AnimatedStatCard(
          icon: Icons.local_shipping_outlined, iconColor: const Color(0xFF1976D2),
          label: 'Shipped', value: '$_shippedCount/$_totalOrders',
          subtitle: 'Orders shipped', backgroundColor: const Color(0xFFE3F2FD),
        )),
        const SizedBox(width: 16),
        Expanded(child: _AnimatedStatCard(
          icon: Icons.verified_outlined, iconColor: _C.accent,
          label: 'Protected', value: '$_protectedCount/$_totalOrders',
          subtitle: _totalOrders > 0
              ? '${((_protectedCount / _totalOrders) * 100).toStringAsFixed(0)}% complete'
              : '0%',
          backgroundColor: _C.accentDim,
        )),
      ],
    );
  }

  Widget _buildFilterTabs() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _FilterChip(label: 'All Orders', count: _totalOrders,
              isActive: _selectedFilter == 'all',
              onTap: () => setState(() => _selectedFilter = 'all')),
          const SizedBox(width: 12),
          _FilterChip(label: '🟢 Low Risk', count: _lowRiskCount,
              isActive: _selectedFilter == 'low',
              onTap: () => setState(() => _selectedFilter = 'low')),
          const SizedBox(width: 12),
          _FilterChip(label: '🟡 Medium Risk', count: _mediumRiskCount,
              isActive: _selectedFilter == 'medium',
              onTap: () => setState(() => _selectedFilter = 'medium')),
          const SizedBox(width: 12),
          _FilterChip(label: '🔴 High Risk', count: _highRiskCount,
              isActive: _selectedFilter == 'high',
              onTap: () => setState(() => _selectedFilter = 'high')),
          const SizedBox(width: 12),
          Container(height: 30, width: 1, color: _C.border),
          const SizedBox(width: 12),
          _FilterChip(label: '📦 Shipped', count: _shippedCount,
              isActive: _selectedFilter == 'shipped',
              activeColor: const Color(0xFF1976D2),
              onTap: () => setState(() => _selectedFilter = 'shipped')),
          const SizedBox(width: 12),
          _FilterChip(label: '📬 Not Shipped', count: _totalOrders - _shippedCount,
              isActive: _selectedFilter == 'not_shipped',
              activeColor: const Color(0xFFFF6B35),
              onTap: () => setState(() => _selectedFilter = 'not_shipped')),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    final message = _searchQuery.isNotEmpty
        ? 'No results for "$_searchQuery"'
        : _selectedFilter == 'all' ? 'No orders yet'
        : _selectedFilter == 'shipped' ? 'No shipped orders yet'
        : _selectedFilter == 'not_shipped' ? 'All orders shipped! 🎉'
        : 'No ${_selectedFilter} risk orders';

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80, height: 80,
            decoration: BoxDecoration(color: _C.accentDim, borderRadius: BorderRadius.circular(20)),
            child: Icon(_searchQuery.isNotEmpty ? Icons.search_off : Icons.shopping_bag_outlined,
                size: 40, color: _C.accent),
          ),
          const SizedBox(height: 24),
          Text(message,
            style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.w600, color: _C.textPrimary)),
          const SizedBox(height: 8),
          if (_searchQuery.isNotEmpty)
            TextButton(
              onPressed: () { _searchController.clear(); setState(() => _searchQuery = ''); },
              child: Text('Clear search',
                style: GoogleFonts.inter(fontSize: 13, color: _C.accent, fontWeight: FontWeight.w600)),
            ),
        ],
      ),
    );
  }

  void _openOrderDetails(Map<String, dynamic> order) async {
    await showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Close',
      barrierColor: Colors.black54,
      transitionDuration: const Duration(milliseconds: 320),
      pageBuilder: (context, _, __) => Align(
        alignment: Alignment.centerRight,
        child: Material(
          color: Colors.transparent,
          child: Container(
            width: MediaQuery.of(context).size.width * 0.46,
            constraints: const BoxConstraints(minWidth: 520, maxWidth: 720),
            height: MediaQuery.of(context).size.height,
            color: const Color(0xFFF8FAFC),
            child: OrderDetailPanel(order: order),
          ),
        ),
      ),
      transitionBuilder: (context, animation, _, child) => SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(1, 0),
          end: Offset.zero,
        ).animate(CurvedAnimation(
            parent: animation, curve: Curves.easeOutCubic)),
        child: child,
      ),
    );

    // ✅ Only runs AFTER panel is closed
    if (mounted) {
      _loadOrders(isRefresh: true);
      _loadMessageCounts();
    }
  }

  Widget _headerText(String text) => Text(text.toUpperCase(),
    style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700,
        color: _C.textHint, letterSpacing: 0.5));
}

// ═══ ANIMATED STAT CARD ═══
class _AnimatedStatCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor, backgroundColor;
  final String label, value, subtitle;
  const _AnimatedStatCard({required this.icon, required this.iconColor,
    required this.label, required this.value, required this.subtitle,
    required this.backgroundColor});

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: const Duration(milliseconds: 400),
      curve: Curves.easeOut,
      builder: (context, val, child) => Opacity(
        opacity: val,
        child: Transform.translate(offset: Offset(0, 10 * (1 - val)), child: child),
      ),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 40, height: 40,
                  decoration: BoxDecoration(color: backgroundColor, borderRadius: BorderRadius.circular(10)),
                  child: Icon(icon, color: iconColor, size: 20),
                ),
                const Spacer(),
                Text(value, style: GoogleFonts.spaceGrotesk(fontSize: 22,
                    fontWeight: FontWeight.w700, color: const Color(0xFF131B2F))),
              ],
            ),
            const SizedBox(height: 12),
            Text(label, style: GoogleFonts.inter(fontSize: 13,
                fontWeight: FontWeight.w600, color: const Color(0xFF64748B))),
            const SizedBox(height: 4),
            Text(subtitle, style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF94A3B8))),
          ],
        ),
      ),
    );
  }
}

// ═══ FILTER CHIP ═══
class _FilterChip extends StatelessWidget {
  final String label;
  final int count;
  final bool isActive;
  final VoidCallback onTap;
  final Color? activeColor;
  const _FilterChip({required this.label, required this.count,
    required this.isActive, required this.onTap, this.activeColor});

  @override
  Widget build(BuildContext context) {
    final color = activeColor ?? _C.accent;
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: isActive ? color : _C.surface,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: isActive ? color : _C.border, width: isActive ? 2 : 1),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(label, style: GoogleFonts.inter(
                fontSize: 13, fontWeight: FontWeight.w600,
                color: isActive
                    ? (color == _C.accent ? const Color(0xFF131B2F) : Colors.white)
                    : _C.textPrimary,
              )),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: isActive ? Colors.white.withOpacity(0.25) : _C.border,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text('$count', style: GoogleFonts.inter(
                  fontSize: 11, fontWeight: FontWeight.w700,
                  color: isActive
                      ? (color == _C.accent ? const Color(0xFF131B2F) : Colors.white)
                      : _C.textSecondary,
                )),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ═══ ORDER CARD ═══
class _OrderCard extends StatefulWidget {
  final Map<String, dynamic> order;
  final VoidCallback onTap;
  final int messageCount;
  final bool isLast;
  const _OrderCard({required this.order, required this.onTap,
    this.messageCount = 0, this.isLast = false});
  @override
  State<_OrderCard> createState() => _OrderCardState();
}

class _OrderCardState extends State<_OrderCard> {
  bool _hovering = false;

  @override
  Widget build(BuildContext context) {
    // ✅ SIMPLE direct read - no fallback to buyer_profiles
    final riskLevel = '${widget.order['risk_level'] ?? 'LOW'}'.trim().toUpperCase();
    final riskScore = widget.order['risk_score'] as int? ?? 0;
    final itemTitle = widget.order['item_title'] as String? ?? 'Unknown Item';
    final itemPrice = widget.order['item_price'] as num? ?? 0.0;
    final buyerUsername = widget.order['buyer_username'] as String? ?? 'Unknown';
    final checklistCompleted = widget.order['checklist_completed'] as bool? ?? false;
    final createdAt = DateTime.tryParse(widget.order['created_at'] ?? '');
    final orderStatus = '${widget.order['order_status'] ?? 'pending'}'.trim().toLowerCase();
    final orderId = widget.order['ebay_order_id'] ?? 'Unknown';
    final isShipped = orderStatus == 'shipped';
    final trackingNumber = widget.order['tracking_number'] as String?;
    final carrier = widget.order['carrier'] as String?;

    final buyerProfile = widget.order['buyer_profiles'] as Map<String, dynamic>?;
    final returnRate = (buyerProfile?['return_rate'] as num?)?.toDouble() ?? 0.0;
    final disputeCount = buyerProfile?['dispute_count'] as int? ?? 0;

    Color riskColor;
    Color riskBgColor;
    switch (riskLevel) {
      case 'HIGH':
        riskColor = _C.riskHigh;
        riskBgColor = const Color(0xFFFFE6E6);
        break;
      case 'MEDIUM':
        riskColor = _C.riskMedium;
        riskBgColor = const Color(0xFFFFF3E6);
        break;
      default:
        riskColor = _C.riskLow;
        riskBgColor = const Color(0xFFE6FFF0);
    }

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _hovering = true),
      onExit: (_) => setState(() => _hovering = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          margin: const EdgeInsets.only(bottom: 1),
          padding: const EdgeInsets.fromLTRB(20, 14, 50, 14),
          decoration: BoxDecoration(
            color: _hovering ? _C.surfaceHover : isShipped ? const Color(0xFFF0F7FF) : _C.surface,
            border: Border(
              left: BorderSide(
                color: _hovering ? riskColor.withOpacity(0.3)
                    : isShipped ? const Color(0xFF1976D2).withOpacity(0.3) : _C.border,
                width: isShipped ? 2 : 1,
              ),
              right: BorderSide(color: _hovering ? riskColor.withOpacity(0.3) : _C.border),
              bottom: BorderSide(color: _hovering ? riskColor.withOpacity(0.3) : _C.border),
              top: const BorderSide(color: Colors.transparent),
            ),
            borderRadius: BorderRadius.zero,
          ),
          child: Row(
            children: [
              // Risk Badge
              Container(
                width: 90,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(color: riskBgColor, borderRadius: BorderRadius.circular(6)),
                child: Text('$riskLevel RISK', textAlign: TextAlign.center,
                  style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700,
                      color: riskColor, letterSpacing: 0.3)),
              ),
              const SizedBox(width: 16),
              // Order ID
              SizedBox(width: 180,
                child: Text('Order #$orderId',
                  style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w600, color: _C.textPrimary),
                  maxLines: 1, overflow: TextOverflow.ellipsis)),
              const SizedBox(width: 16),
              // Item
              Expanded(flex: 3,
                child: Text(itemTitle,
                  style: GoogleFonts.inter(fontSize: 13, color: _C.textPrimary, fontWeight: FontWeight.w500),
                  maxLines: 1, overflow: TextOverflow.ellipsis)),
              const SizedBox(width: 16),
              // Buyer
              SizedBox(width: 130,
                child: Row(
                  children: [
                    Icon(Icons.person_outline, size: 14, color: _C.textHint),
                    const SizedBox(width: 6),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => showBuyerProfilePanel(context, buyerUsername),
                        child: Text(buyerUsername,
                          style: GoogleFonts.inter(fontSize: 12, color: _C.textSecondary,
                              decoration: TextDecoration.underline, decorationColor: _C.accent),
                          maxLines: 1, overflow: TextOverflow.ellipsis),
                      ),
                    ),
                  ],
                )),
              const SizedBox(width: 16),
              // Risk Score
              SizedBox(width: 100,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('Score: $riskScore/100',
                      style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: _C.textSecondary)),
                    const SizedBox(height: 4),
                    Container(height: 3,
                      decoration: BoxDecoration(color: _C.border, borderRadius: BorderRadius.circular(2)),
                      child: FractionallySizedBox(
                        alignment: Alignment.centerLeft,
                        widthFactor: (riskScore / 100).clamp(0.0, 1.0),
                        child: Container(decoration: BoxDecoration(color: riskColor, borderRadius: BorderRadius.circular(2))),
                      )),
                  ],
                )),
              const SizedBox(width: 16),
              // Return Rate
              SizedBox(width: 70,
                child: returnRate > 0
                    ? Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: returnRate > 30 ? riskBgColor : _C.bg,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text('${returnRate.toStringAsFixed(0)}% ret.',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.inter(fontSize: 10,
                              color: returnRate > 30 ? riskColor : _C.textSecondary,
                              fontWeight: FontWeight.w600)))
                    : const SizedBox()),
              const SizedBox(width: 12),
              // Disputes
              SizedBox(width: 60,
                child: disputeCount > 0
                    ? Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _C.riskHigh.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                        child: Text('$disputeCount disp.', textAlign: TextAlign.center,
                          style: GoogleFonts.inter(fontSize: 10, color: _C.riskHigh, fontWeight: FontWeight.w700)))
                    : Text('0 disp.', textAlign: TextAlign.center,
                        style: GoogleFonts.inter(fontSize: 10, color: _C.textHint))),
              const SizedBox(width: 16),
              // Protection
              SizedBox(width: 110,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: checklistCompleted ? _C.accent.withOpacity(0.1) : riskColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(
                      color: checklistCompleted ? _C.accent.withOpacity(0.3) : riskColor.withOpacity(0.3)),
                  ),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    Icon(checklistCompleted ? Icons.verified : Icons.shield_outlined,
                        size: 12, color: checklistCompleted ? _C.accent : riskColor),
                    const SizedBox(width: 6),
                    Expanded(child: Text(checklistCompleted ? 'Protected' : 'Need action',
                      style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700,
                          color: checklistCompleted ? _C.accent : riskColor),
                      maxLines: 1, overflow: TextOverflow.ellipsis)),
                  ]),
                )),
              const SizedBox(width: 16),
              // Status
              SizedBox(width: 120,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isShipped ? const Color(0xFF1976D2).withOpacity(0.1)
                            : orderStatus == 'delivered' ? _C.accent.withOpacity(0.1) : _C.bg,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Icon(
                          isShipped ? Icons.local_shipping
                              : orderStatus == 'delivered' ? Icons.check_circle : Icons.pending_outlined,
                          size: 10,
                          color: isShipped ? const Color(0xFF1976D2)
                              : orderStatus == 'delivered' ? _C.accent : _C.textSecondary,
                        ),
                        const SizedBox(width: 4),
                        Flexible(child: Text(orderStatus.toUpperCase(),
                          style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w700,
                            color: isShipped ? const Color(0xFF1976D2)
                                : orderStatus == 'delivered' ? _C.accent : _C.textSecondary,
                            letterSpacing: 0.5),
                          maxLines: 1, overflow: TextOverflow.ellipsis)),
                      ]),
                    ),
                    if (isShipped && carrier != null) ...[
                      const SizedBox(height: 3),
                      Text(
                        '$carrier${trackingNumber != null ? ' • ${trackingNumber.length > 6 ? trackingNumber.substring(0, 6) : trackingNumber}...' : ''}',
                        style: GoogleFonts.inter(fontSize: 9, color: _C.textHint),
                        maxLines: 1, overflow: TextOverflow.ellipsis),
                    ],
                  ],
                )),
              const SizedBox(width: 16),
              // Message count
              SizedBox(width: 40,
                child: widget.messageCount > 0
                    ? Tooltip(
                        message: '${widget.messageCount} message${widget.messageCount > 1 ? 's' : ''} sent',
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1976D2).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFF1976D2).withOpacity(0.3)),
                          ),
                          child: Row(mainAxisSize: MainAxisSize.min, mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.message_outlined, size: 10, color: Color(0xFF1976D2)),
                              const SizedBox(width: 2),
                              Text('${widget.messageCount}',
                                style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700,
                                    color: const Color(0xFF1976D2))),
                            ]),
                        ))
                    : const SizedBox()),
              const SizedBox(width: 16),
              // Price
              SizedBox(width: 110,
                child: Text('\$${itemPrice.toStringAsFixed(2)}', textAlign: TextAlign.right,
                  style: GoogleFonts.spaceGrotesk(fontSize: 15, fontWeight: FontWeight.w700, color: _C.textPrimary))),
              const SizedBox(width: 16),
              // Time
              SizedBox(width: 80,
                child: Text(createdAt != null ? _timeAgo(createdAt) : '-', textAlign: TextAlign.right,
                  style: GoogleFonts.inter(fontSize: 11, color: _C.textHint))),
              const SizedBox(width: 12),
              // Eye
              SizedBox(width: 24,
                child: Icon(Icons.visibility_outlined, size: 18,
                    color: _hovering ? _C.accent : _C.textHint)),
            ],
          ),
        ),
      ),
    );
  }

  String _timeAgo(DateTime dateTime) {
    final diff = DateTime.now().difference(dateTime);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${dateTime.day}/${dateTime.month}';
  }
}