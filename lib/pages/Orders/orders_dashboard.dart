// lib/pages/orders/orders_dashboard.dart
//
// SellerPulse - Orders Dashboard (Buyer Risk Protection Tool)
// Main screen showing all orders with risk levels and protection status

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS - Match your existing app
// ═══════════════════════════════════════════════════════════════
class _C {
  static const bg = Color(0xFFF8FAFC);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceHover = Color(0xFFF1F5F9);
  static const border = Color(0xFFE2E8F0);
  static const accent = Color(0xFF5CB800);  // Your neon green
  static const accentDim = Color(0xFFE8FFB0);
  static const textPrimary = Color(0xFF0F172A);
  static const textSecondary = Color(0xFF64748B);
  static const textHint = Color(0xFF94A3B8);
  
  // Risk level colors
  static const riskLow = Color(0xFF00C48C);     // Green
  static const riskMedium = Color(0xFFFFB800);  // Amber
  static const riskHigh = Color(0xFFFF4D6A);    // Red
}

// ═══════════════════════════════════════════════════════════════
// MAIN ORDERS DASHBOARD
// ═══════════════════════════════════════════════════════════════

class OrdersDashboard extends StatefulWidget {
  const OrdersDashboard({super.key});

  @override
  State<OrdersDashboard> createState() => _OrdersDashboardState();
}

class _OrdersDashboardState extends State<OrdersDashboard> {
  final _supabase = Supabase.instance.client;
  
  // State
  bool _isLoading = true;
  String _selectedFilter = 'all'; // all, low, medium, high
  List<Map<String, dynamic>> _orders = [];
  
  // Stats
  int _lowRiskCount = 0;
  int _mediumRiskCount = 0;
  int _highRiskCount = 0;
  int _protectedCount = 0;
  int _totalOrders = 0;

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    setState(() => _isLoading = true);
    
    try {
      final userId = _supabase.auth.currentUser?.id;
      if (userId == null) return;

      // Fetch orders with buyer profile data
      final data = await _supabase
          .from('protected_orders')
          .select('''
            *,
            buyer_profiles (
              ebay_buyer_username,
              risk_score,
              risk_level,
              risk_patterns,
              ai_analysis
            )
          ''')
          .eq('user_id', userId)
          .order('created_at', ascending: false);

      // Calculate stats
      int low = 0, medium = 0, high = 0, protected = 0;
      
      for (var order in data) {
        final riskLevel = order['risk_level'] as String?;
        if (riskLevel == 'LOW') low++;
        else if (riskLevel == 'MEDIUM') medium++;
        else if (riskLevel == 'HIGH') high++;
        
        // Count protected orders (checklist completed)
        if (order['checklist_completed'] == true) protected++;
      }

      setState(() {
        _orders = List<Map<String, dynamic>>.from(data);
        _totalOrders = data.length;
        _lowRiskCount = low;
        _mediumRiskCount = medium;
        _highRiskCount = high;
        _protectedCount = protected;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error loading orders: $e');
      setState(() => _isLoading = false);
    }
  }

  List<Map<String, dynamic>> get _filteredOrders {
    if (_selectedFilter == 'all') return _orders;
    return _orders.where((o) => 
      o['risk_level']?.toString().toLowerCase() == _selectedFilter
    ).toList();
  }

  @override
  Widget build(BuildContext context) {
    final userName = _supabase.auth.currentUser?.userMetadata?['full_name'] ?? 'Seller';
    
    return Scaffold(
      backgroundColor: _C.bg,
      body: CustomScrollView(
        slivers: [
          // ── Header Section ──
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(40, 48, 40, 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Welcome message
                  Text(
                    'Welcome back, $userName! 👋',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                      color: _C.textPrimary,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Protect your orders from risky buyers',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: _C.textSecondary,
                    ),
                  ),
                  
                  const SizedBox(height: 32),
                  
                  // ── Stats Cards ──
                  _buildStatsRow(),
                  
                  const SizedBox(height: 32),
                  
                  // ── High Risk Alert (if any) ──
                  if (_highRiskCount > 0) _buildHighRiskAlert(),
                ],
              ),
            ),
          ),
          
          // ── Filter Tabs ──
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 40),
              child: _buildFilterTabs(),
            ),
          ),
          
          // ── Table Header ──
          SliverToBoxAdapter(
            child: Container(
              margin: const EdgeInsets.fromLTRB(40, 16, 40, 0),
              padding: const EdgeInsets.fromLTRB(20, 12, 50, 12), // ← Extra right padding
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(8),
                  topRight: Radius.circular(8),
                ),
                border: Border.all(color: _C.border),
              ),
              child: Row(
                children: [
                  SizedBox(width: 90, child: _headerText('Risk')),
                  const SizedBox(width: 16),
                  SizedBox(width: 180, child: _headerText('Order ID')),
                  const SizedBox(width: 16),
                  Expanded(flex: 3, child: _headerText('Item')),
                  const SizedBox(width: 16),
                  SizedBox(width: 130, child: _headerText('Buyer')),
                  const SizedBox(width: 16),
                  SizedBox(width: 100, child: _headerText('Risk Score')),
                  const SizedBox(width: 16),
                  SizedBox(width: 70, child: _headerText('Returns')),
                  const SizedBox(width: 12),
                  SizedBox(width: 60, child: _headerText('Disputes')),
                  const SizedBox(width: 16),
                  SizedBox(width: 110, child: _headerText('Protection')),
                  const SizedBox(width: 16),
                  SizedBox(width: 80, child: _headerText('Status')),
                  const SizedBox(width: 16),
                  SizedBox(width: 110, child: _headerText('Price')),
                  const SizedBox(width: 16),
                  SizedBox(width: 80, child: _headerText('Time')),
                  const SizedBox(width: 16),
                ],
              ),
            ),
          ),
          
          // ── Orders List ──
          if (_isLoading)
            const SliverFillRemaining(
              child: Center(child: CircularProgressIndicator()),
            )
          else if (_filteredOrders.isEmpty)
            SliverFillRemaining(
              child: _buildEmptyState(),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(40, 0, 40, 40),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final order = _filteredOrders[index];
                    return _OrderCard(
                      order: order,
                      onTap: () => _openOrderDetails(order),
                    );
                  },
                  childCount: _filteredOrders.length,
                ),
              ),
            ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // STATS ROW
  // ═══════════════════════════════════════════════════════════════
  Widget _buildStatsRow() {
    return Row(
      children: [
        Expanded(
          child: _StatCard(
            icon: Icons.shield_outlined,
            iconColor: _C.riskLow,
            label: 'Low Risk',
            value: _lowRiskCount.toString(),
            subtitle: 'Safe to ship',
            backgroundColor: const Color(0xFFE6FFF0),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _StatCard(
            icon: Icons.warning_amber_rounded,
            iconColor: _C.riskMedium,
            label: 'Medium Risk',
            value: _mediumRiskCount.toString(),
            subtitle: 'Extra care needed',
            backgroundColor: const Color(0xFFFFF3E6),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _StatCard(
            icon: Icons.error_outline_rounded,
            iconColor: _C.riskHigh,
            label: 'High Risk',
            value: _highRiskCount.toString(),
            subtitle: 'Action required',
            backgroundColor: const Color(0xFFFFE6E6),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _StatCard(
            icon: Icons.verified_outlined,
            iconColor: _C.accent,
            label: 'Protected',
            value: '$_protectedCount/$_totalOrders',
            subtitle: _totalOrders > 0 
              ? '${((_protectedCount / _totalOrders) * 100).toStringAsFixed(0)}% complete'
              : '0%',
            backgroundColor: _C.accentDim,
          ),
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // HIGH RISK ALERT
  // ═══════════════════════════════════════════════════════════════
  Widget _buildHighRiskAlert() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF1F0),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _C.riskHigh.withOpacity(0.3), width: 2),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: _C.riskHigh.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.notification_important_rounded, 
              color: _C.riskHigh, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '⚠️ URGENT: $_highRiskCount High-Risk ${_highRiskCount == 1 ? 'Order' : 'Orders'} Need${_highRiskCount == 1 ? 's' : ''} Protection',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: _C.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Complete protection checklists before shipping to avoid disputes',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: _C.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          TextButton(
            onPressed: () => setState(() => _selectedFilter = 'high'),
            style: TextButton.styleFrom(
              backgroundColor: _C.riskHigh,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: Text(
              'View Orders',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // FILTER TABS
  // ═══════════════════════════════════════════════════════════════
  Widget _buildFilterTabs() {
    return Row(
      children: [
        _FilterChip(
          label: 'All Orders',
          count: _totalOrders,
          isActive: _selectedFilter == 'all',
          onTap: () => setState(() => _selectedFilter = 'all'),
        ),
        const SizedBox(width: 12),
        _FilterChip(
          label: '🟢 Low Risk',
          count: _lowRiskCount,
          isActive: _selectedFilter == 'low',
          onTap: () => setState(() => _selectedFilter = 'low'),
        ),
        const SizedBox(width: 12),
        _FilterChip(
          label: '🟡 Medium Risk',
          count: _mediumRiskCount,
          isActive: _selectedFilter == 'medium',
          onTap: () => setState(() => _selectedFilter = 'medium'),
        ),
        const SizedBox(width: 12),
        _FilterChip(
          label: '🔴 High Risk',
          count: _highRiskCount,
          isActive: _selectedFilter == 'high',
          onTap: () => setState(() => _selectedFilter = 'high'),
        ),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // EMPTY STATE
  // ═══════════════════════════════════════════════════════════════
  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: _C.accentDim,
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Icon(Icons.shopping_bag_outlined, 
              size: 40, color: _C.accent),
          ),
          const SizedBox(height: 24),
          Text(
            _selectedFilter == 'all' 
              ? 'No orders yet' 
              : 'No ${_selectedFilter} risk orders',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: _C.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Orders will appear here when buyers place orders',
            style: GoogleFonts.inter(
              fontSize: 14,
              color: _C.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  void _openOrderDetails(Map<String, dynamic> order) {
  
    // TODO: Navigate to order detail screen
    debugPrint('Open order: ${order['ebay_order_id']}');
  }
    Widget _headerText(String text) {
    return Text(
      text.toUpperCase(),
      style: GoogleFonts.inter(
        fontSize: 10,
        fontWeight: FontWeight.w700,
        color: _C.textHint,
        letterSpacing: 0.5,
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// STAT CARD WIDGET
// ═══════════════════════════════════════════════════════════════
class _StatCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;
  final String subtitle;
  final Color backgroundColor;

  const _StatCard({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.value,
    required this.subtitle,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
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
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: backgroundColor,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: iconColor, size: 20),
              ),
              const Spacer(),
              Text(
                value,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: _C.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: _C.textSecondary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: GoogleFonts.inter(
              fontSize: 12,
              color: _C.textHint,
            ),
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// FILTER CHIP WIDGET
// ═══════════════════════════════════════════════════════════════
class _FilterChip extends StatelessWidget {
  final String label;
  final int count;
  final bool isActive;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.count,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isActive ? _C.accent : _C.surface,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isActive ? _C.accent : _C.border,
            width: isActive ? 2 : 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: isActive ? Colors.white : _C.textPrimary,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: isActive 
                  ? Colors.white.withOpacity(0.2)
                  : _C.border,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                count.toString(),
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: isActive ? Colors.white : _C.textSecondary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// COMPACT ORDER ROW - Table-style design
// Replace the existing _OrderCard widget with this
// ═══════════════════════════════════════════════════════════════

class _OrderCard extends StatefulWidget {
  final Map<String, dynamic> order;
  final VoidCallback onTap;

  const _OrderCard({
    required this.order,
    required this.onTap,
  });

  @override
  State<_OrderCard> createState() => _OrderCardState();
}

class _OrderCardState extends State<_OrderCard> {
  bool _hovering = false;

  @override
  Widget build(BuildContext context) {
    final riskLevel = widget.order['risk_level'] as String? ?? 'LOW';
    final riskScore = widget.order['risk_score'] as int? ?? 0;
    final itemTitle = widget.order['item_title'] as String? ?? 'Unknown Item';
    final itemPrice = widget.order['item_price'] as num? ?? 0.0;
    final buyerUsername = widget.order['buyer_username'] as String? ?? 'Unknown Buyer';
    final checklistCompleted = widget.order['checklist_completed'] as bool? ?? false;
    final createdAt = DateTime.tryParse(widget.order['created_at'] ?? '');
    final orderStatus = widget.order['order_status'] as String? ?? 'pending';
    final orderId = widget.order['ebay_order_id'] ?? 'Unknown';
    
    // Get buyer profile data
    final buyerProfile = widget.order['buyer_profiles'];
    final returnRate = buyerProfile?['return_rate'] as num? ?? 0.0;
    final disputeCount = buyerProfile?['dispute_count'] as int? ?? 0;
    
    // Determine colors
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
      onEnter: (_) => setState(() => _hovering = true),
      onExit: (_) => setState(() => _hovering = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          margin: const EdgeInsets.only(bottom: 1),
          padding: const EdgeInsets.fromLTRB(20, 14, 40, 14),
          decoration: BoxDecoration(
            color: _hovering ? _C.surfaceHover : _C.surface,
            border: Border(
              left: BorderSide(color: _hovering ? riskColor.withOpacity(0.3) : _C.border, width: 1),
              right: BorderSide(color: _hovering ? riskColor.withOpacity(0.3) : _C.border, width: 1),
              bottom: BorderSide(color: _hovering ? riskColor.withOpacity(0.3) : _C.border, width: 1),
            ),
          ),
          child: Row(
            children: [
              // ── Risk Badge ──
              Container(
                width: 90,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: riskBgColor,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  '$riskLevel RISK',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: riskColor,
                    letterSpacing: 0.3,
                  ),
                ),
              ),
              
              const SizedBox(width: 16),
              
              // ── Order ID ──
              SizedBox(
                width: 180,
                child: Text(
                  'Order #$orderId',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: _C.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              
              const SizedBox(width: 16),
              
              // ── Item Title ──
              Expanded(
                flex: 3,
                child: Text(
                  itemTitle,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: _C.textPrimary,
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              
              const SizedBox(width: 16),
              
              // ── Buyer ──
              SizedBox(
                width: 130,
                child: Row(
                  children: [
                    Icon(Icons.person_outline, size: 14, color: _C.textHint),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        buyerUsername,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: _C.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(width: 16),
              
              // ── Risk Score with Bar ──
              SizedBox(
                width: 100,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Score: $riskScore/100',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: _C.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      height: 3,
                      decoration: BoxDecoration(
                        color: _C.border,
                        borderRadius: BorderRadius.circular(2),
                      ),
                      child: FractionallySizedBox(
                        alignment: Alignment.centerLeft,
                        widthFactor: riskScore / 100,
                        child: Container(
                          decoration: BoxDecoration(
                            color: riskColor,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(width: 16),
              
              // ── Return Rate ──
              if (returnRate > 0)
                SizedBox(
                  width: 70,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: returnRate > 30 ? riskBgColor : _C.bg,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      '${returnRate.toStringAsFixed(0)}% ret.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        color: returnRate > 30 ? riskColor : _C.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                )
              else
                const SizedBox(width: 70),
              
              const SizedBox(width: 12),
              
              // ── Disputes ──
              SizedBox(
                width: 60,
                child: disputeCount > 0
                  ? Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: _C.riskHigh.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        '$disputeCount disp.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          color: _C.riskHigh,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    )
                  : Text(
                      '0 disp.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        color: _C.textHint,
                      ),
                    ),
              ),
              
              const SizedBox(width: 16),
              
              // ── Protection Status ──
              SizedBox(
                width: 110,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: checklistCompleted 
                      ? _C.accent.withOpacity(0.1)
                      : riskColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(
                      color: checklistCompleted 
                        ? _C.accent.withOpacity(0.3)
                        : riskColor.withOpacity(0.3),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        checklistCompleted ? Icons.verified : Icons.shield_outlined,
                        size: 12,
                        color: checklistCompleted ? _C.accent : riskColor,
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          checklistCompleted ? 'Protected' : 'Need action',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: checklistCompleted ? _C.accent : riskColor,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(width: 16),
              
              // ── Status ──
              SizedBox(
                width: 80,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: orderStatus == 'delivered' 
                      ? _C.accent.withOpacity(0.1)
                      : orderStatus == 'shipped'
                        ? const Color(0xFFE3F2FD)
                        : _C.bg,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    orderStatus.toUpperCase(),
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                      color: orderStatus == 'delivered'
                        ? _C.accent
                        : orderStatus == 'shipped'
                          ? const Color(0xFF1976D2)
                          : _C.textSecondary,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
              
              const SizedBox(width: 20),
              
              // ── Price ──
              SizedBox(
                width: 110,
                child: Text(
                  '\$${itemPrice.toStringAsFixed(2)}',
                  textAlign: TextAlign.right,
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: _C.textPrimary,
                  ),
                ),
              ),
              
              const SizedBox(width: 16),
              
              // ── Time Ago ──
              SizedBox(
                width: 80,
                child: Text(
                  createdAt != null ? _timeAgo(createdAt) : '-',
                  textAlign: TextAlign.right,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: _C.textHint,
                  ),
                ),
              ),
              
              const SizedBox(width: 16),
              
              // ── Arrow ──
              Icon(
                Icons.arrow_forward_ios_rounded,
                size: 12,
                color: _hovering ? _C.accent : _C.textHint,
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _timeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final diff = now.difference(dateTime);
    
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${dateTime.day}/${dateTime.month}';
  }
}