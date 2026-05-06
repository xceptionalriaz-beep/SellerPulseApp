// lib/pages/orders/buyer_profile_panel.dart
//
// SellerPulse - Buyer Profile Deep Dive Panel
// Slide-in from right | eBay risk score | Similar buyer patterns

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════
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
  static const riskLowBg    = Color(0xFFE6FFF5);
  static const riskMedBg    = Color(0xFFFFF8E1);
  static const riskHighBg   = Color(0xFFFFEEF1);
  static const blue         = Color(0xFF1976D2);
}

// ═══════════════════════════════════════════════════════════════
// SHOW PANEL FUNCTION
// ═══════════════════════════════════════════════════════════════
void showBuyerProfilePanel(
    BuildContext context, String buyerUsername) {
  showGeneralDialog(
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
          width: MediaQuery.of(context).size.width * 0.44,
          constraints: const BoxConstraints(minWidth: 500, maxWidth: 700),
          height: MediaQuery.of(context).size.height,
          color: _C.bg,
          child: BuyerProfilePanel(buyerUsername: buyerUsername),
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
}

// ═══════════════════════════════════════════════════════════════
// BUYER PROFILE PANEL
// ═══════════════════════════════════════════════════════════════
class BuyerProfilePanel extends StatefulWidget {
  final String buyerUsername;
  const BuyerProfilePanel({super.key, required this.buyerUsername});

  @override
  State<BuyerProfilePanel> createState() => _BuyerProfilePanelState();
}

class _BuyerProfilePanelState extends State<BuyerProfilePanel> {
  final _supabase = Supabase.instance.client;

  bool _isLoading = true;
  Map<String, dynamic>? _profile;
  List<Map<String, dynamic>> _buyerOrders = [];
  List<Map<String, dynamic>> _similarBuyers = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      await Future.wait([
        _loadProfile(),
        _loadBuyerOrders(),
      ]);
      await _loadSimilarBuyers();
    } catch (e) {
      debugPrint('Buyer profile error: $e');
    }
    setState(() => _isLoading = false);
  }

  Future<void> _loadProfile() async {
    try {
      final data = await _supabase
          .from('buyer_profiles')
          .select('*')
          .eq('ebay_buyer_username', widget.buyerUsername)
          .maybeSingle();
      setState(() => _profile = data);
    } catch (_) {}
  }

  Future<void> _loadBuyerOrders() async {
    try {
      final userId = _supabase.auth.currentUser?.id;
      if (userId == null) return;
      final data = await _supabase
          .from('protected_orders')
          .select('*')
          .eq('user_id', userId)
          .eq('buyer_username', widget.buyerUsername)
          .order('created_at', ascending: false);
      setState(() => _buyerOrders = List<Map<String, dynamic>>.from(data));
    } catch (_) {}
  }

  Future<void> _loadSimilarBuyers() async {
    try {
      final userId = _supabase.auth.currentUser?.id;
      if (userId == null) return;

      // Get buyer risk score and patterns to find similar buyers
      final riskScore = _profile?['risk_score'] as int? ?? 0;
      final riskLevel = _profile?['risk_level'] as String? ?? 'LOW';

      // Find buyers with similar risk level from this seller's orders
      final data = await _supabase
          .from('protected_orders')
          .select('buyer_username, risk_level, risk_score, buyer_profiles(*)')
          .eq('user_id', userId)
          .eq('risk_level', riskLevel)
          .neq('buyer_username', widget.buyerUsername)
          .order('risk_score', ascending: false)
          .limit(5);

      // Deduplicate by buyer username
      final seen = <String>{};
      final unique = <Map<String, dynamic>>[];
      for (var row in data) {
        final name = row['buyer_username'] as String? ?? '';
        if (!seen.contains(name)) {
          seen.add(name);
          unique.add(row);
        }
      }

      setState(() => _similarBuyers = unique);
    } catch (_) {}
  }

  Color _riskColor(String lvl) {
    if (lvl == 'HIGH') return _C.riskHigh;
    if (lvl == 'MEDIUM') return _C.riskMedium;
    return _C.riskLow;
  }

  Color _riskBg(String lvl) {
    if (lvl == 'HIGH') return _C.riskHighBg;
    if (lvl == 'MEDIUM') return _C.riskMedBg;
    return _C.riskLowBg;
  }

  String _formatDate(DateTime d) {
    final diff = DateTime.now().difference(d);
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${d.day}/${d.month}/${d.year}';
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _buildHeader(),
        Expanded(
          child: _isLoading
              ? _buildLoadingState()
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildProfileHero(),
                      const SizedBox(height: 16),
                      _buildRiskScoreCard(),
                      const SizedBox(height: 16),
                      _buildKeyStats(),
                      const SizedBox(height: 16),
                      _buildRiskPatterns(),
                      const SizedBox(height: 16),
                      _buildAIAnalysis(),
                      const SizedBox(height: 16),
                      _buildOrderHistory(),
                      const SizedBox(height: 16),
                      _buildSimilarBuyers(),
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
        ),
      ],
    );
  }

  // ─ Loading State ─
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
          Text('Loading buyer profile...',
            style: GoogleFonts.inter(
              fontSize: 14, color: _C.textSecondary)),
        ],
      ),
    );
  }

  // ─ Header ─
  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 12, 16),
      decoration: BoxDecoration(
        color: _C.surface,
        border: Border(bottom: BorderSide(color: _C.border)),
      ),
      child: Row(
        children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              color: _C.accent,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.person_search,
                size: 20, color: _C.accentDark),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Buyer Profile',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: _C.textPrimary,
                  )),
                Text(widget.buyerUsername,
                  style: GoogleFonts.inter(
                    fontSize: 12, color: _C.textHint)),
              ],
            ),
          ),
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.close,
                size: 20, color: _C.textSecondary),
          ),
        ],
      ),
    );
  }

  // ─ 1. Profile Hero ─
  Widget _buildProfileHero() {
    final riskLevel = _profile?['risk_level'] as String? ?? 'LOW';
    final riskScore = _profile?['risk_score'] as int? ?? 0;
    final rc = _riskColor(riskLevel);
    final rbg = _riskBg(riskLevel);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [rbg, _C.surface],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: rc.withOpacity(0.3), width: 1.5),
      ),
      child: Row(
        children: [
          // Avatar
          Container(
            width: 64, height: 64,
            decoration: BoxDecoration(
              color: rc.withOpacity(0.15),
              shape: BoxShape.circle,
              border: Border.all(color: rc.withOpacity(0.4), width: 2),
            ),
            child: Center(
              child: Text(
                widget.buyerUsername.isNotEmpty
                    ? widget.buyerUsername[0].toUpperCase()
                    : '?',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: rc,
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),

          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(widget.buyerUsername,
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: _C.textPrimary,
                  )),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: rc,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text('$riskLevel RISK',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                          letterSpacing: 0.5,
                        )),
                    ),
                    const SizedBox(width: 8),
                    Text('eBay Buyer',
                      style: GoogleFonts.inter(
                        fontSize: 12, color: _C.textSecondary)),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(Icons.shopping_bag_outlined,
                        size: 14, color: _C.textHint),
                    const SizedBox(width: 4),
                    Text('${_buyerOrders.length} order${_buyerOrders.length != 1 ? 's' : ''} with you',
                      style: GoogleFonts.inter(
                        fontSize: 12, color: _C.textSecondary)),
                  ],
                ),
              ],
            ),
          ),

          // Risk score circle
          Container(
            width: 70, height: 70,
            decoration: BoxDecoration(
              color: _C.surface,
              shape: BoxShape.circle,
              border: Border.all(color: rc, width: 3),
              boxShadow: [
                BoxShadow(
                  color: rc.withOpacity(0.2),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('$riskScore',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: rc,
                  )),
                Text('/ 100',
                  style: GoogleFonts.inter(
                    fontSize: 9, color: _C.textHint)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─ 2. Risk Score Card ─
  Widget _buildRiskScoreCard() {
    final riskLevel = _profile?['risk_level'] as String? ?? 'LOW';
    final riskScore = _profile?['risk_score'] as int? ?? 0;
    final rc = _riskColor(riskLevel);

    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionTitle('📊 eBay Risk Score Breakdown', icon: Icons.analytics),
          const SizedBox(height: 16),

          // Score bar
          Row(
            children: [
              Text('0', style: GoogleFonts.inter(fontSize: 10, color: _C.textHint)),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(
                      value: riskScore / 100,
                      backgroundColor: _C.border,
                      valueColor: AlwaysStoppedAnimation<Color>(rc),
                      minHeight: 12,
                    ),
                  ),
                ),
              ),
              Text('100', style: GoogleFonts.inter(fontSize: 10, color: _C.textHint)),
            ],
          ),
          const SizedBox(height: 12),

          // Score labels
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _scoreZone('0-30', 'LOW', _C.riskLow, riskScore <= 30),
              _scoreZone('31-60', 'MEDIUM', _C.riskMedium,
                  riskScore > 30 && riskScore <= 60),
              _scoreZone('61-100', 'HIGH', _C.riskHigh, riskScore > 60),
            ],
          ),
          const SizedBox(height: 16),

          // What the score means
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: rc.withOpacity(0.06),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: rc.withOpacity(0.2)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.info_outline, size: 16, color: rc),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _getRiskExplanation(riskLevel, riskScore),
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: _C.textPrimary,
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getRiskExplanation(String level, int score) {
    if (level == 'HIGH') {
      return 'Score $score/100 — This buyer has a high probability of filing disputes or returns. Extra protection steps are strongly recommended before shipping.';
    } else if (level == 'MEDIUM') {
      return 'Score $score/100 — This buyer has shown some risk indicators. Complete the protection checklist and consider using signature-required shipping.';
    } else {
      return 'Score $score/100 — This buyer appears to be low risk. Standard shipping practices should be sufficient, but always follow the checklist.';
    }
  }

  Widget _scoreZone(String range, String label, Color color, bool isActive) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: isActive ? color.withOpacity(0.1) : Colors.transparent,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(
          color: isActive ? color : Colors.transparent,
          width: 1.5,
        ),
      ),
      child: Column(
        children: [
          Text(range,
            style: GoogleFonts.inter(
              fontSize: 10,
              color: isActive ? color : _C.textHint,
              fontWeight: FontWeight.w600,
            )),
          Text(label,
            style: GoogleFonts.inter(
              fontSize: 11,
              color: isActive ? color : _C.textHint,
              fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
            )),
        ],
      ),
    );
  }

  // ─ 3. Key Stats ─
  Widget _buildKeyStats() {
    final returnRate = (_profile?['return_rate'] as num?)?.toDouble() ?? 0.0;
    final disputeCount = _profile?['dispute_count'] as int? ?? 0;
    final totalOrders = _buyerOrders.length;
    final shippedOrders = _buyerOrders
        .where((o) => o['order_status'] == 'shipped' || o['order_status'] == 'delivered')
        .length;
    final totalValue = _buyerOrders
        .fold<double>(0, (sum, o) => sum + ((o['item_price'] as num?)?.toDouble() ?? 0));

    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionTitle('📈 Key Statistics', icon: Icons.bar_chart),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _statItem('Return Rate',
                  '${returnRate.toStringAsFixed(0)}%',
                  returnRate > 30 ? _C.riskHigh : _C.riskLow,
                  Icons.replay_rounded)),
              const SizedBox(width: 12),
              Expanded(child: _statItem('Disputes',
                  '$disputeCount',
                  disputeCount > 2 ? _C.riskHigh : _C.textSecondary,
                  Icons.gavel_rounded)),
              const SizedBox(width: 12),
              Expanded(child: _statItem('Orders With You',
                  '$totalOrders',
                  _C.blue,
                  Icons.shopping_bag_outlined)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _statItem('Shipped',
                  '$shippedOrders/$totalOrders',
                  _C.riskLow,
                  Icons.local_shipping_outlined)),
              const SizedBox(width: 12),
              Expanded(child: _statItem('Total Value',
                  '\$${totalValue.toStringAsFixed(2)}',
                  _C.blue,
                  Icons.attach_money)),
              const SizedBox(width: 12),
              Expanded(child: _statItem('Platform',
                  'eBay',
                  _C.textSecondary,
                  Icons.store_outlined)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _statItem(String label, String value, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.06),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(height: 8),
          Text(value,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: color,
            )),
          const SizedBox(height: 2),
          Text(label,
            style: GoogleFonts.inter(
              fontSize: 10,
              color: _C.textSecondary,
              fontWeight: FontWeight.w500,
            )),
        ],
      ),
    );
  }

  // ─ 4. Risk Patterns ─
  Widget _buildRiskPatterns() {
    final patterns = (_profile?['risk_patterns'] as List<dynamic>?) ?? [];

    if (patterns.isEmpty) return const SizedBox();

    final patternDescriptions = {
      'serial_returner': '📦 Serial Returner — Returns items frequently after use',
      'inad_claimer': '⚠️ INAD Claimer — Often claims "Item Not As Described"',
      'high_dispute_rate': '⚖️ High Dispute Rate — Files disputes regularly',
      'fast_returner': '⚡ Fast Returner — Returns within days of receiving',
      'late_claimer': '🕐 Late Claimer — Files claims just before deadline',
      'electronics_risk': '📱 Electronics Risk — High return rate on electronics',
    };

    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionTitle('🚩 Detected Risk Patterns', icon: Icons.flag_outlined),
          const SizedBox(height: 14),
          ...patterns.map((p) {
            final desc = patternDescriptions[p.toString()] ??
                '⚠️ ${p.toString().replaceAll('_', ' ').toUpperCase()}';
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: _C.riskHighBg,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: _C.riskHigh.withOpacity(0.2)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 8, height: 8,
                    decoration: const BoxDecoration(
                      color: _C.riskHigh,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(desc,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: _C.textPrimary,
                        height: 1.4,
                      )),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  // ─ 5. AI Analysis ─
  Widget _buildAIAnalysis() {
    final ai = _profile?['ai_analysis'] as String?;
    if (ai == null || ai.isEmpty) return const SizedBox();

    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionTitle('🤖 AI Risk Analysis', icon: Icons.psychology_outlined),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: _C.accentDim,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: _C.accent.withOpacity(0.3)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 32, height: 32,
                  decoration: BoxDecoration(
                    color: _C.accent,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.auto_awesome,
                      size: 16, color: _C.accentDark),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('AI Assessment',
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: _C.accentDark,
                          letterSpacing: 0.5,
                        )),
                      const SizedBox(height: 6),
                      Text(ai,
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: _C.textPrimary,
                          height: 1.5,
                        )),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─ 6. Order History ─
  Widget _buildOrderHistory() {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _sectionTitle('🛍️ Order History With You',
                  icon: Icons.history),
              const Spacer(),
              Text('${_buyerOrders.length} total',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  color: _C.textSecondary,
                )),
            ],
          ),
          const SizedBox(height: 14),

          if (_buyerOrders.isEmpty)
            _emptyState('No orders from this buyer yet')
          else
            ..._buyerOrders.map((order) {
              final status = order['order_status'] as String? ?? 'pending';
              final price = (order['item_price'] as num?)?.toDouble() ?? 0;
              final title = order['item_title'] as String? ?? 'Unknown';
              final riskLevel = order['risk_level'] as String? ?? 'LOW';
              final createdAt = DateTime.tryParse(order['created_at'] ?? '');
              final rc = _riskColor(riskLevel);
              final isShipped = status == 'shipped' || status == 'delivered';

              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: _C.bg,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: _C.border),
                ),
                child: Row(
                  children: [
                    // Risk dot
                    Container(
                      width: 8, height: 8,
                      decoration: BoxDecoration(
                        color: rc,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(title,
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: _C.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis),
                          const SizedBox(height: 2),
                          Text(createdAt != null ? _formatDate(createdAt) : '-',
                            style: GoogleFonts.inter(
                              fontSize: 10, color: _C.textHint)),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text('\$${price.toStringAsFixed(2)}',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: _C.textPrimary,
                      )),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: isShipped
                            ? _C.riskLow.withOpacity(0.1)
                            : _C.textHint.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(status.toUpperCase(),
                        style: GoogleFonts.inter(
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                          color: isShipped ? _C.riskLow : _C.textHint,
                        )),
                    ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }

  // ─ 7. Similar Buyers ─
  Widget _buildSimilarBuyers() {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionTitle('👥 Similar Risk Buyers',
              icon: Icons.group_outlined),
          const SizedBox(height: 6),
          Text(
            'Buyers with similar return/dispute patterns',
            style: GoogleFonts.inter(
              fontSize: 11, color: _C.textSecondary),
          ),
          const SizedBox(height: 14),

          if (_similarBuyers.isEmpty)
            _emptyState('No similar buyers found in your orders')
          else
            ..._similarBuyers.map((buyer) {
              final username = buyer['buyer_username'] as String? ?? 'Unknown';
              final riskLevel = buyer['risk_level'] as String? ?? 'LOW';
              final riskScore = buyer['risk_score'] as int? ?? 0;
              final profile = buyer['buyer_profiles'];
              final returnRate =
                  (profile?['return_rate'] as num?)?.toDouble() ?? 0.0;
              final rc = _riskColor(riskLevel);
              final rbg = _riskBg(riskLevel);

              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: rbg.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: rc.withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    // Avatar
                    Container(
                      width: 36, height: 36,
                      decoration: BoxDecoration(
                        color: rc.withOpacity(0.15),
                        shape: BoxShape.circle,
                        border: Border.all(
                            color: rc.withOpacity(0.3), width: 1.5),
                      ),
                      child: Center(
                        child: Text(
                          username.isNotEmpty
                              ? username[0].toUpperCase()
                              : '?',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: rc,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Info
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(username,
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: _C.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis),
                          const SizedBox(height: 2),
                          Text('Return rate: ${returnRate.toStringAsFixed(0)}%',
                            style: GoogleFonts.inter(
                              fontSize: 11, color: _C.textSecondary)),
                        ],
                      ),
                    ),

                    // Risk badge
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: rc,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(riskLevel,
                            style: GoogleFonts.inter(
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            )),
                        ),
                        const SizedBox(height: 4),
                        Text('Score: $riskScore',
                          style: GoogleFonts.inter(
                            fontSize: 10, color: _C.textSecondary)),
                      ],
                    ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }

  // ─ Helpers ─
  Widget _card({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _C.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _C.border),
      ),
      child: child,
    );
  }

  Widget _sectionTitle(String text, {required IconData icon}) {
    return Row(
      children: [
        Container(
          width: 28, height: 28,
          decoration: BoxDecoration(
            color: _C.accent,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: _C.accentDark, width: 1.5),
          ),
          child: Icon(icon, size: 14, color: _C.accentDark),
        ),
        const SizedBox(width: 8),
        Text(text,
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: _C.textHint,
            letterSpacing: 0.5,
          )),
      ],
    );
  }

  Widget _emptyState(String msg) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 20),
      child: Center(
        child: Text(msg,
          style: GoogleFonts.inter(
            fontSize: 13, color: _C.textHint)),
      ),
    );
  }
}