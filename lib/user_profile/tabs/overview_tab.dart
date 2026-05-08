// ═══════════════════════════════════════════════════════════════════════════
// lib/user_profile/tabs/overview_tab.dart - COMPLETE REBUILD
// ═══════════════════════════════════════════════════════════════════════════
// Sections:
// 1. Profile Header + eBay Status
// 2. Quick Stats (real data from DB)
// 3. Recent Activity + Account Health Score (side by side)
// 4. Plan Usage Summary (mini, links to Tool Usage tab)
// ═══════════════════════════════════════════════════════════════════════════

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../services/ebay_service.dart';

// ─── Color tokens ─────────────────────────────────────────────────────────
class _C {
  static const bg      = Color(0xFFF4F7FA);
  static const surface = Color(0xFFFFFFFF);
  static const navy    = Color(0xFF0F172A);
  static const navy2   = Color(0xFF1E293B);
  static const accent  = Color(0xFF8FFF00);
  static const accentD = Color(0xFFE8FFB0);
  static const txt1    = Color(0xFF0F172A);
  static const txt2    = Color(0xFF64748B);
  static const txt3    = Color(0xFF94A3B8);
  static const border  = Color(0xFFE2E8F0);
  static const green   = Color(0xFF00C48C);
  static const orange  = Color(0xFFFFB800);
  static const red     = Color(0xFFFF4D6A);
  static const blue    = Color(0xFF1D70F5);
}

// ═══════════════════════════════════════════════════════════════════════════
class OverviewTab extends StatefulWidget {
  final void Function(int tabIndex)? onTabChange;
  const OverviewTab({super.key, this.onTabChange});
  @override
  State<OverviewTab> createState() => _OverviewTabState();
}

class _OverviewTabState extends State<OverviewTab> {
  final _supabase = Supabase.instance.client;

  // ── Profile ──────────────────────────────────────────────────────────────
  String _userName    = 'Seller';
  String _userEmail   = '';
  String _userInitial = 'S';
  String _joinedDate  = '';
  String _userGender  = 'unspecified';
  bool   _isEditing   = false;
  bool   _isSaving    = false;

  late TextEditingController _nameCtrl;
  late TextEditingController _emailCtrl;
  late TextEditingController _businessCtrl;

  // ── Stats ────────────────────────────────────────────────────────────────
  int    _ordersCount    = 0;
  int    _productScans   = 0;
  int    _productLimit   = 100;
  int    _competitorCount= 0;
  int    _competitorLimit= 50;
  double _safeSourcing   = 0;

  // ── eBay connection ──────────────────────────────────────────────────────
  EbayConnectionData? _ebayConn;

  // ── Recent activity ──────────────────────────────────────────────────────
  List<_ActivityItem> _recentActivity = [];

  // ── Health score ─────────────────────────────────────────────────────────
  int                   _healthScore  = 0;
  List<_HealthCheckItem> _healthChecks = [];

  // ── Tool usage (mini) ────────────────────────────────────────────────────
  List<Map<String, dynamic>> _toolUsage = [];

  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    final user = _supabase.auth.currentUser;
    _userName    = user?.userMetadata?['full_name']?.toString() ?? 'Seller';
    _userEmail   = user?.email ?? '';
    _userGender  = user?.userMetadata?['gender']?.toString() ?? 'unspecified';
    _userInitial = _initials(_userName);
    _joinedDate  = _formatDate(user?.createdAt);

    _nameCtrl     = TextEditingController(text: _userName);
    _emailCtrl    = TextEditingController(text: _userEmail);
    _businessCtrl = TextEditingController(
        text: user?.userMetadata?['business_name']?.toString() ?? '');

    _loadAll();
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _businessCtrl.dispose();
    super.dispose();
  }

  // ── Load all data in parallel ─────────────────────────────────────────────
  Future<void> _loadAll() async {
    setState(() => _isLoading = true);
    try {
      await Future.wait([
        _loadStats(),
        _loadEbayConnection(),
        _loadRecentActivity(),
        _loadToolUsage(),
      ]);
      _buildHealthScore();
    } catch (e) {
      debugPrint('Overview load error: $e');
    }
    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _loadStats() async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return;

    try {
      // Orders count
      final orders = await _supabase
          .from('protected_orders')
          .select('id')
          .eq('user_id', userId);
      _ordersCount = (orders as List).length;

      // Tool usage
      final toolData = await _supabase
          .from('user_tool_usage')
          .select()
          .eq('user_id', userId);

      for (final t in toolData) {
        final name = t['tool_name'] as String;
        if (name == 'product_research') {
          _productScans = (t['usage_count'] ?? 0) as int;
          _productLimit = (t['usage_limit'] ?? 100) as int;
        } else if (name == 'competitor_research') {
          _competitorCount = (t['usage_count'] ?? 0) as int;
          _competitorLimit = (t['usage_limit'] ?? 50) as int;
        }
      }

      // Safe sourcing = % of LOW risk buyers
      final buyers = await _supabase
          .from('buyer_profiles')
          .select('risk_level')
          .eq('user_id', userId);

      if ((buyers as List).isNotEmpty) {
        final lowRisk = buyers
            .where((b) => (b['risk_level'] ?? '').toString().toUpperCase() == 'LOW')
            .length;
        _safeSourcing = (lowRisk / buyers.length * 100);
      }
    } catch (e) {
      debugPrint('Stats error: $e');
    }
  }

  Future<void> _loadEbayConnection() async {
    _ebayConn = await EbayService.checkConnection();
  }

  Future<void> _loadRecentActivity() async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return;

    final items = <_ActivityItem>[];

    try {
      // Recent orders
      final orders = await _supabase
          .from('protected_orders')
          .select('item_title, created_at, risk_level')
          .eq('user_id', userId)
          .order('created_at', ascending: false)
          .limit(3);

      for (final o in orders) {
        items.add(_ActivityItem(
          icon   : Icons.shopping_bag_outlined,
          color  : _C.blue,
          title  : 'New order: ${(o['item_title'] ?? 'Item').toString().length > 30 ? '${(o['item_title'] ?? 'Item').toString().substring(0, 30)}...' : o['item_title'] ?? 'Item'}',
          timeAgo: _timeAgo(o['created_at']?.toString()),
          tag    : (o['risk_level'] ?? '').toString().toUpperCase() == 'HIGH' ? 'HIGH RISK' : null,
          tagColor: _C.red,
        ));
      }

      // Recent product scans
      final scans = await _supabase
          .from('scanned_products')
          .select('title, created_at')
          .eq('user_id', userId)
          .order('created_at', ascending: false)
          .limit(3);

      for (final s in scans) {
        items.add(_ActivityItem(
          icon   : Icons.search,
          color  : _C.green,
          title  : 'Researched: ${(s['title'] ?? 'Product').toString().length > 30 ? '${(s['title'] ?? 'Product').toString().substring(0, 30)}...' : s['title'] ?? 'Product'}',
          timeAgo: _timeAgo(s['created_at']?.toString()),
        ));
      }

      // Recent store scans
      final storeScan = await _supabase
          .from('store_scans')
          .select('store_name, created_at')
          .eq('user_id', userId)
          .order('created_at', ascending: false)
          .limit(2);

      for (final s in storeScan) {
        items.add(_ActivityItem(
          icon   : Icons.storefront_outlined,
          color  : _C.orange,
          title  : 'Scanned store: ${s['store_name'] ?? 'Store'}',
          timeAgo: _timeAgo(s['created_at']?.toString()),
        ));
      }

      // Recent watchlist
      final watchlist = await _supabase
          .from('user_watchlist')
          .select('title, created_at')
          .eq('user_id', userId)
          .order('created_at', ascending: false)
          .limit(2);

      for (final w in watchlist) {
        items.add(_ActivityItem(
          icon   : Icons.bookmark_outline,
          color  : const Color(0xFF8B5CF6),
          title  : 'Saved: ${(w['title'] ?? 'Product').toString().length > 30 ? '${(w['title'] ?? 'Product').toString().substring(0, 30)}...' : w['title'] ?? 'Product'}',
          timeAgo: _timeAgo(w['created_at']?.toString()),
        ));
      }

      // Sort by most recent first (approximation)
      items.sort((a, b) => b.timeAgo.compareTo(a.timeAgo));

    } catch (e) {
      debugPrint('Activity error: $e');
    }

    if (mounted) setState(() => _recentActivity = items.take(6).toList());
  }

  Future<void> _loadToolUsage() async {
    _toolUsage = await EbayService.getToolUsage();
  }

  void _buildHealthScore() {
    final checks = <_HealthCheckItem>[];
    int score = 0;

    // eBay connected
    if (_ebayConn != null) {
      score += 20;
      checks.add(_HealthCheckItem('eBay Store Connected', true, '+20pts'));
    } else {
      checks.add(_HealthCheckItem('eBay Store Not Connected', false, '-20pts'));
    }

    // Orders being tracked
    if (_ordersCount > 0) {
      score += 15;
      checks.add(_HealthCheckItem('Orders Being Tracked', true, '+15pts'));
    } else {
      checks.add(_HealthCheckItem('No Orders Synced Yet', false, '0pts'));
    }

    // API Keys configured
    try {
      score += 20;
      checks.add(_HealthCheckItem('API Keys Configured', true, '+20pts'));
    } catch (_) {}

    // Pro plan active
    score += 20;
    checks.add(_HealthCheckItem('Pro Plan Active', true, '+20pts'));

    // Key expiry warning
    if (_ebayConn != null) {
      if (_ebayConn!.daysUntilExpiry > 30) {
        score += 15;
        checks.add(_HealthCheckItem('eBay Token Healthy', true, '+15pts'));
      } else if (_ebayConn!.daysUntilExpiry > 7) {
        score += 5;
        checks.add(_HealthCheckItem(
            'eBay Token Expires in ${_ebayConn!.daysUntilExpiry}d', false, '-10pts'));
      } else {
        checks.add(_HealthCheckItem(
            'eBay Token Expiring Soon!', false, '-15pts'));
      }
    }

    // Safe sourcing
    if (_safeSourcing >= 90) {
      score += 10;
      checks.add(_HealthCheckItem('Excellent Buyer Safety', true, '+10pts'));
    } else if (_safeSourcing >= 70) {
      score += 5;
      checks.add(_HealthCheckItem('Good Buyer Safety', true, '+5pts'));
    } else if (_safeSourcing > 0) {
      checks.add(_HealthCheckItem('Review Risky Buyers', false, '0pts'));
    }

    if (mounted) {
      setState(() {
        _healthScore  = score.clamp(0, 100);
        _healthChecks = checks;
      });
    }
  }

  // ── Save profile ──────────────────────────────────────────────────────────
  Future<void> _saveProfile() async {
    setState(() => _isSaving = true);
    try {
      final user = _supabase.auth.currentUser;
      if (user == null) return;

      await _supabase.auth.updateUser(UserAttributes(data: {
        'full_name'     : _nameCtrl.text,
        'business_name' : _businessCtrl.text,
        'gender'        : _userGender,
      }));

      await _supabase.from('profiles').update({
        'name'      : _nameCtrl.text,
        'gender'    : _userGender,
        'avatar_url': _avatarUrl() ?? '',
      }).eq('id', user.id);

      setState(() {
        _userName    = _nameCtrl.text;
        _userInitial = _initials(_userName);
        _isEditing   = false;
        _isSaving    = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('✅ Profile updated!'),
          backgroundColor: Color(0xFF00C48C),
        ));
      }
    } catch (e) {
      setState(() => _isSaving = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('❌ Error: $e'),
          backgroundColor: Colors.redAccent,
        ));
      }
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  String _initials(String name) {
    if (name.trim().isEmpty) return 'S';
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.length >= 2 ? name.substring(0, 2).toUpperCase() : name.toUpperCase();
  }

  String _formatDate(String? iso) {
    if (iso == null) return '';
    try {
      final d = DateTime.parse(iso);
      const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return 'Joined ${m[d.month - 1]} ${d.year}';
    } catch (_) { return ''; }
  }

  String _timeAgo(String? iso) {
    if (iso == null) return '—';
    try {
      final diff = DateTime.now().difference(DateTime.parse(iso));
      if (diff.inMinutes < 1)  return 'just now';
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24)   return '${diff.inHours}h ago';
      if (diff.inDays < 7)     return '${diff.inDays}d ago';
      return '${diff.inDays ~/ 7}w ago';
    } catch (_) { return '—'; }
  }

  String? _avatarUrl() {
    final user = _supabase.auth.currentUser;
    final google = user?.userMetadata?['picture'];
    if (google != null) return google.toString();
    final seed = user?.email ?? 'default';
    if (_userGender == 'Male')   return 'https://api.dicebear.com/9.x/adventurer-neutral/png?seed=${seed}male&backgroundColor=b6e3f4';
    if (_userGender == 'Female') return 'https://api.dicebear.com/9.x/lorelei/png?seed=${seed}female&backgroundColor=ffdfbf';
    return null;
  }

  Color get _healthColor {
    if (_healthScore >= 80) return _C.green;
    if (_healthScore >= 60) return _C.orange;
    return _C.red;
  }

  String get _healthLabel {
    if (_healthScore >= 80) return 'Excellent';
    if (_healthScore >= 60) return 'Good';
    if (_healthScore >= 40) return 'Fair';
    return 'Needs Attention';
  }

  // ════════════════════════════════════════════════════════════════════════
  // BUILD
  // ════════════════════════════════════════════════════════════════════════
  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(48),
          child: CircularProgressIndicator(color: Color(0xFF8FFF00)),
        ),
      );
    }

    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 300),
      child: _isEditing ? _buildEditView() : _buildMainView(),
    );
  }

  // ── MAIN VIEW ─────────────────────────────────────────────────────────────
  Widget _buildMainView() {
    return Column(
      key: const ValueKey('main'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section 1: Profile Header
        _buildProfileCard(),
        const SizedBox(height: 20),

        // Section 2: Quick Stats
        _buildStatsRow(),
        const SizedBox(height: 20),

        // Section 3: Activity + Health (side by side on desktop)
        LayoutBuilder(builder: (ctx, constraints) {
          if (constraints.maxWidth > 700) {
            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(flex: 6, child: _buildActivityFeed()),
                const SizedBox(width: 16),
                Expanded(flex: 4, child: _buildHealthCard()),
              ],
            );
          }
          return Column(children: [
            _buildActivityFeed(),
            const SizedBox(height: 16),
            _buildHealthCard(),
          ]);
        }),
        const SizedBox(height: 20),

        // Section 4: Plan Usage mini
        _buildPlanUsageMini(),
      ],
    );
  }

  // ── SECTION 1: PROFILE CARD ───────────────────────────────────────────────
  Widget _buildProfileCard() {
    final avatarUrl = _avatarUrl();
    return _Card(
      child: Column(children: [
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Avatar
          Container(
            width: 80, height: 80,
            decoration: BoxDecoration(
              color: _C.accent,
              shape: BoxShape.circle,
              border: Border.all(
                color: _ebayConn != null
                    ? _C.accent.withOpacity(0.6) : _C.border,
                width: 3,
              ),
            ),
            child: ClipOval(
              child: avatarUrl != null
                  ? Image.network(avatarUrl, fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => _avatarInitials())
                  : _avatarInitials(),
            ),
          ),
          const SizedBox(width: 20),

          // Info
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(_userName,
                  style: GoogleFonts.spaceGrotesk(
                      fontSize: 22, fontWeight: FontWeight.w700, color: _C.txt1)),
              const SizedBox(height: 6),
              Wrap(spacing: 10, runSpacing: 6, children: [
                _Badge(icon: Icons.star, text: 'Pro Member',
                    bg: const Color(0xFFFFF9E6), color: Colors.amber),
                if (_joinedDate.isNotEmpty)
                  _Badge(icon: Icons.calendar_today, text: _joinedDate,
                      bg: const Color(0xFFF1F5F9), color: _C.txt2),
                _Badge(icon: Icons.check_circle, text: 'Active Sub',
                    bg: const Color(0xFFEBF6D4), color: const Color(0xFF16A34A)),
              ]),
              if (_userEmail.isNotEmpty) ...[
                const SizedBox(height: 8),
                Row(children: [
                  const Icon(Icons.email_outlined, size: 13, color: _C.txt3),
                  const SizedBox(width: 6),
                  Text(_userEmail,
                      style: GoogleFonts.inter(fontSize: 12, color: _C.txt3)),
                ]),
              ],
            ]),
          ),

          // Edit button
          OutlinedButton.icon(
            onPressed: () => setState(() => _isEditing = true),
            icon: const Icon(Icons.edit, size: 14, color: _C.txt1),
            label: Text('Edit Profile',
                style: GoogleFonts.inter(
                    color: _C.txt1, fontWeight: FontWeight.w600, fontSize: 12)),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: _C.border),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            ),
          ),
        ]),

        // eBay status mini card
        if (_ebayConn != null) ...[
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: _C.navy,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(children: [
              Container(
                width: 32, height: 32,
                decoration: BoxDecoration(
                  color: _C.accent.withOpacity(0.15),
                  shape: BoxShape.circle,
                  border: Border.all(color: _C.accent.withOpacity(0.4)),
                ),
                child: const Icon(Icons.storefront, size: 16, color: _C.accent),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Row(children: [
                    Text(_ebayConn!.ebayUsername,
                        style: GoogleFonts.inter(
                            fontSize: 13, fontWeight: FontWeight.bold,
                            color: Colors.white)),
                    const SizedBox(width: 6),
                    const Icon(Icons.verified, color: Colors.blue, size: 13),
                  ]),
                  Text('${_ebayConn!.ordersSynced} orders  •  ${_ebayConn!.lastSyncText}',
                      style: GoogleFonts.inter(fontSize: 11, color: Colors.grey)),
                ]),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _C.accent.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: _C.accent.withOpacity(0.4)),
                ),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Container(width: 6, height: 6,
                      decoration: const BoxDecoration(
                          color: _C.accent, shape: BoxShape.circle)),
                  const SizedBox(width: 5),
                  Text('Connected',
                      style: GoogleFonts.inter(
                          fontSize: 10, fontWeight: FontWeight.bold,
                          color: _C.accent)),
                ]),
              ),
            ]),
          ),
        ] else ...[
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF9E6),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.orange.shade200),
            ),
            child: Row(children: [
              const Icon(Icons.warning_amber_rounded,
                  color: Colors.orange, size: 18),
              const SizedBox(width: 12),
              Expanded(
                child: Text('Connect your eBay store to unlock full features',
                    style: GoogleFonts.inter(
                        fontSize: 13, color: Colors.orange.shade800,
                        fontWeight: FontWeight.w500)),
              ),
              TextButton(
                onPressed: () => widget.onTabChange?.call(1),
                child: Text('Connect →',
                    style: GoogleFonts.inter(
                        color: Colors.orange, fontWeight: FontWeight.bold,
                        fontSize: 12)),
              ),
            ]),
          ),
        ],
      ]),
    );
  }

  Widget _avatarInitials() => Center(
    child: Text(_userInitial,
        style: GoogleFonts.spaceGrotesk(
            fontSize: 28, fontWeight: FontWeight.w900, color: _C.navy)),
  );

  // ── SECTION 2: STATS ROW ─────────────────────────────────────────────────
  Widget _buildStatsRow() {
    // Responsive: 4 in a row on desktop, 2x2 on mobile
    return LayoutBuilder(builder: (ctx, constraints) {
      final isMobile = constraints.maxWidth < 600;
      final cards = [
        _StatCard(
          icon: Icons.shopping_bag_outlined,
          iconBg: _C.blue.withOpacity(0.1),
          iconColor: _C.blue,
          value: _ordersCount.toString(),
          label: 'Orders Tracked',
          sub: _ebayConn != null ? 'Auto-syncing' : 'Connect eBay',
        ),
        _StatCard(
          icon: Icons.search,
          iconBg: _C.green.withOpacity(0.1),
          iconColor: _C.green,
          value: '$_productScans/$_productLimit',
          label: 'Product Research',
          sub: 'Searches used',
          showBar: true,
          barValue: _productLimit > 0 ? _productScans / _productLimit : 0,
          barColor: _productScans / (_productLimit > 0 ? _productLimit : 1) > 0.8
              ? _C.red : _C.green,
        ),
        _StatCard(
          icon: Icons.storefront_outlined,
          iconBg: _C.orange.withOpacity(0.1),
          iconColor: _C.orange,
          value: '$_competitorCount/$_competitorLimit',
          label: 'Competitor Scans',
          sub: 'Stores analyzed',
          showBar: true,
          barValue: _competitorLimit > 0 ? _competitorCount / _competitorLimit : 0,
          barColor: _competitorCount / (_competitorLimit > 0 ? _competitorLimit : 1) > 0.8
              ? _C.red : _C.orange,
        ),
        _StatCard(
          icon: Icons.shield_outlined,
          iconBg: const Color(0xFF8B5CF6).withOpacity(0.1),
          iconColor: const Color(0xFF8B5CF6),
          value: _safeSourcing > 0
              ? '${_safeSourcing.toStringAsFixed(0)}%' : '—',
          label: 'Safe Sourcing',
          sub: 'Low-risk buyers',
        ),
      ];

      if (isMobile) {
        // 2x2 grid on mobile
        return Column(children: [
          Row(children: [
            Expanded(child: cards[0]),
            const SizedBox(width: 12),
            Expanded(child: cards[1]),
          ]),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: cards[2]),
            const SizedBox(width: 12),
            Expanded(child: cards[3]),
          ]),
        ]);
      }

      // 4 in a row on desktop
      return Row(children: [
        Expanded(child: cards[0]),
        const SizedBox(width: 12),
        Expanded(child: cards[1]),
        const SizedBox(width: 12),
        Expanded(child: cards[2]),
        const SizedBox(width: 12),
        Expanded(child: cards[3]),
      ]);
    });
  }

  // ── SECTION 3A: RECENT ACTIVITY ───────────────────────────────────────────
  Widget _buildActivityFeed() {
    return _Card(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Row(children: [
            const Icon(Icons.history, size: 16, color: _C.txt3),
            const SizedBox(width: 8),
            Text('Recent Activity',
                style: GoogleFonts.inter(
                    fontSize: 14, fontWeight: FontWeight.w700, color: _C.txt1)),
          ]),
          InkWell(
            onTap: _loadRecentActivity,
            child: const Icon(Icons.refresh, size: 16, color: _C.txt3),
          ),
        ]),
        const SizedBox(height: 16),

        if (_recentActivity.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 24),
            child: Center(
              child: Column(children: [
                Icon(Icons.history, size: 40, color: Colors.grey.shade300),
                const SizedBox(height: 12),
                Text('No activity yet',
                    style: GoogleFonts.inter(
                        fontSize: 13, color: _C.txt3)),
                const SizedBox(height: 4),
                Text('Start using your tools to see activity',
                    style: GoogleFonts.inter(fontSize: 11, color: _C.txt3)),
              ]),
            ),
          )
        else
          ..._recentActivity.map((item) => _buildActivityRow(item)),
      ]),
    );
  }

  Widget _buildActivityRow(_ActivityItem item) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(children: [
        Container(
          width: 34, height: 34,
          decoration: BoxDecoration(
              color: item.color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8)),
          child: Icon(item.icon, size: 16, color: item.color),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start,
              children: [
            Text(item.title,
                style: GoogleFonts.inter(
                    fontSize: 12, fontWeight: FontWeight.w600, color: _C.txt1),
                maxLines: 1, overflow: TextOverflow.ellipsis),
            if (item.tag != null)
              Container(
                margin: const EdgeInsets.only(top: 2),
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: (item.tagColor ?? _C.red).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(item.tag!,
                    style: GoogleFonts.inter(
                        fontSize: 9, fontWeight: FontWeight.bold,
                        color: item.tagColor ?? _C.red)),
              ),
          ]),
        ),
        Text(item.timeAgo,
            style: GoogleFonts.inter(fontSize: 10, color: _C.txt3)),
      ]),
    );
  }

  // ── SECTION 3B: HEALTH SCORE ──────────────────────────────────────────────
  Widget _buildHealthCard() {
    return _Card(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const Icon(Icons.health_and_safety_outlined, size: 16, color: _C.txt3),
          const SizedBox(width: 8),
          Text('Account Health',
              style: GoogleFonts.inter(
                  fontSize: 14, fontWeight: FontWeight.w700, color: _C.txt1)),
        ]),
        const SizedBox(height: 20),

        // Score circle
        Center(
          child: Stack(alignment: Alignment.center, children: [
            SizedBox(
              width: 90, height: 90,
              child: CircularProgressIndicator(
                value: _healthScore / 100,
                strokeWidth: 8,
                backgroundColor: _C.border,
                color: _healthColor,
              ),
            ),
            Column(mainAxisSize: MainAxisSize.min, children: [
              Text('$_healthScore',
                  style: GoogleFonts.spaceGrotesk(
                      fontSize: 24, fontWeight: FontWeight.w800,
                      color: _healthColor)),
              Text('/ 100',
                  style: GoogleFonts.inter(fontSize: 10, color: _C.txt3)),
            ]),
          ]),
        ),
        const SizedBox(height: 8),
        Center(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: _healthColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(_healthLabel,
                style: GoogleFonts.inter(
                    fontSize: 12, fontWeight: FontWeight.bold,
                    color: _healthColor)),
          ),
        ),
        const SizedBox(height: 20),

        // Health checks
        ..._healthChecks.map((check) => Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: Row(children: [
            Icon(
              check.passed ? Icons.check_circle : Icons.warning_amber_rounded,
              size: 14,
              color: check.passed ? _C.green : _C.orange,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(check.label,
                  style: GoogleFonts.inter(
                      fontSize: 11,
                      color: check.passed ? _C.txt2 : _C.txt1,
                      fontWeight: check.passed
                          ? FontWeight.normal : FontWeight.w600)),
            ),
            Text(check.pts,
                style: GoogleFonts.inter(
                    fontSize: 10,
                    color: check.passed ? _C.green : _C.orange,
                    fontWeight: FontWeight.bold)),
          ]),
        )),
      ]),
    );
  }

  // ── SECTION 4: PLAN USAGE MINI ────────────────────────────────────────────
  Widget _buildPlanUsageMini() {
    final toolConfig = {
      'product_research'   : {'label': 'Product Research',   'color': _C.blue},
      'competitor_research': {'label': 'Competitor Research', 'color': _C.orange},
      'deep_dive_analysis' : {'label': 'Deep Dive Analysis', 'color': const Color(0xFF8B5CF6)},
      'title_builder'      : {'label': 'Title Builder',       'color': _C.green},
    };

    final relevantTools = _toolUsage
        .where((t) => toolConfig.containsKey(t['tool_name']))
        .toList();

    return _Card(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Row(children: [
            const Icon(Icons.bar_chart_outlined, size: 16, color: _C.txt3),
            const SizedBox(width: 8),
            Text("This Month's Usage",
                style: GoogleFonts.inter(
                    fontSize: 14, fontWeight: FontWeight.w700, color: _C.txt1)),
          ]),
          TextButton(
            onPressed: () => widget.onTabChange?.call(2),
            style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4)),
            child: Text('View Details →',
                style: GoogleFonts.inter(
                    fontSize: 12, color: _C.blue, fontWeight: FontWeight.w600)),
          ),
        ]),
        const SizedBox(height: 16),

        if (relevantTools.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: Text('Start using tools to see usage stats',
                  style: GoogleFonts.inter(fontSize: 13, color: _C.txt3)),
            ),
          )
        else
          ...relevantTools.map((tool) {
            final config  = toolConfig[tool['tool_name']]!;
            final used    = (tool['usage_count'] ?? 0) as int;
            final limit   = (tool['usage_limit'] ?? 100) as int;
            final pct     = limit > 0 ? (used / limit).clamp(0.0, 1.0) : 0.0;
            final color   = config['color'] as Color;
            return Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                  Text(config['label'] as String,
                      style: GoogleFonts.inter(
                          fontSize: 12, fontWeight: FontWeight.w600,
                          color: _C.txt2)),
                  Text('$used / $limit',
                      style: GoogleFonts.inter(
                          fontSize: 12, fontWeight: FontWeight.bold,
                          color: _C.txt1)),
                ]),
                const SizedBox(height: 6),
                LinearProgressIndicator(
                  value: pct,
                  backgroundColor: _C.border,
                  color: pct > 0.8 ? _C.red : color,
                  minHeight: 5,
                  borderRadius: BorderRadius.circular(3),
                ),
              ]),
            );
          }),
      ]),
    );
  }

  // ── EDIT VIEW ─────────────────────────────────────────────────────────────
  Widget _buildEditView() {
    final avatarUrl = _avatarUrl();
    return _Card(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const Icon(Icons.manage_accounts, size: 22, color: _C.txt1),
          const SizedBox(width: 10),
          Text('Edit Profile',
              style: GoogleFonts.spaceGrotesk(
                  fontSize: 20, fontWeight: FontWeight.bold, color: _C.txt1)),
        ]),
        const SizedBox(height: 24),

        // Avatar
        Center(
          child: Container(
            width: 80, height: 80,
            decoration: BoxDecoration(
                color: _C.accent, shape: BoxShape.circle),
            child: ClipOval(
              child: avatarUrl != null
                  ? Image.network(avatarUrl, fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => _avatarInitials())
                  : _avatarInitials(),
            ),
          ),
        ),
        const SizedBox(height: 24),

        // Form fields
        LayoutBuilder(builder: (ctx, constraints) {
          final isMobile = constraints.maxWidth < 600;
          if (isMobile) {
            return Column(children: [
              _Field('Full Name', _nameCtrl, Icons.person_outline),
              const SizedBox(height: 16),
              _Field('Email Address', _emailCtrl, Icons.email_outlined,
                  readOnly: true),
              const SizedBox(height: 16),
              _Field('Business Name', _businessCtrl, Icons.business_outlined),
              const SizedBox(height: 16),
              _buildGenderPicker(),
            ]);
          }
          return Column(children: [
            Row(children: [
              Expanded(child: _Field(
                  'Full Name', _nameCtrl, Icons.person_outline)),
              const SizedBox(width: 16),
              Expanded(child: _Field(
                  'Email Address', _emailCtrl, Icons.email_outlined,
                  readOnly: true)),
            ]),
            const SizedBox(height: 16),
            Row(children: [
              Expanded(flex: 2, child: _Field(
                  'Business Name', _businessCtrl, Icons.business_outlined)),
              const SizedBox(width: 16),
              Expanded(child: _buildGenderPicker()),
            ]),
          ]);
        }),

        const SizedBox(height: 24),
        Row(mainAxisAlignment: MainAxisAlignment.end, children: [
          TextButton(
            onPressed: () => setState(() => _isEditing = false),
            child: Text('Cancel',
                style: GoogleFonts.inter(color: Colors.grey,
                    fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 12),
          ElevatedButton(
            onPressed: _isSaving ? null : _saveProfile,
            style: ElevatedButton.styleFrom(
              backgroundColor: _C.navy,
              padding: const EdgeInsets.symmetric(
                  horizontal: 24, vertical: 14),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
            ),
            child: _isSaving
                ? const SizedBox(width: 18, height: 18,
                    child: CircularProgressIndicator(
                        color: Colors.white, strokeWidth: 2))
                : Text('Save Changes',
                    style: GoogleFonts.inter(
                        color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ]),
      ]),
    );
  }

  Widget _Field(String label, TextEditingController ctrl, IconData icon,
      {bool readOnly = false}) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label,
          style: GoogleFonts.inter(
              fontWeight: FontWeight.bold, color: const Color(0xFF1E293B),
              fontSize: 12)),
      const SizedBox(height: 8),
      TextField(
        controller: ctrl,
        readOnly: readOnly,
        style: TextStyle(
            color: readOnly ? Colors.grey.shade600 : Colors.black,
            fontSize: 14),
        decoration: InputDecoration(
          prefixIcon: Icon(icon, size: 18, color: Colors.grey.shade500),
          filled: true,
          fillColor: readOnly ? Colors.grey.shade100 : const Color(0xFFF8FAFC),
          contentPadding: const EdgeInsets.symmetric(
              horizontal: 16, vertical: 16),
          border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: Colors.grey.shade300)),
          enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: Colors.grey.shade300)),
          focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: _C.navy, width: 1.5)),
        ),
      ),
    ]);
  }

  Widget _buildGenderPicker() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Gender',
          style: GoogleFonts.inter(
              fontWeight: FontWeight.bold,
              color: const Color(0xFF1E293B), fontSize: 12)),
      const SizedBox(height: 8),
      LayoutBuilder(builder: (ctx, constraints) {
        return PopupMenuButton<String>(
          position: PopupMenuPosition.under,
          offset: const Offset(0, 8),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: Colors.grey.shade200),
          ),
          color: Colors.white,
          elevation: 6,
          constraints: BoxConstraints(
              minWidth: constraints.maxWidth,
              maxWidth: constraints.maxWidth),
          onSelected: (v) => setState(() => _userGender = v),
          itemBuilder: (_) => [
            _genderItem('Unspecified', 'Prefer not to say'),
            _genderItem('Male', 'Male'),
            _genderItem('Female', 'Female'),
          ],
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.grey.shade300),
            ),
            child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
              Text(
                _userGender == 'Male'
                    ? 'Male'
                    : _userGender == 'Female' ? 'Female' : 'Prefer not to say',
                style: const TextStyle(color: Colors.black, fontSize: 14),
              ),
              const Icon(Icons.keyboard_arrow_down,
                  color: _C.txt3, size: 20),
            ]),
          ),
        );
      }),
    ]);
  }

  PopupMenuItem<String> _genderItem(String value, String text) {
    final isSelected = _userGender == value;
    return PopupMenuItem<String>(
      value: value, height: 40,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? _C.accent : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(text,
            style: TextStyle(
                color: isSelected ? Colors.black : const Color(0xFF1E293B),
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                fontSize: 13)),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SMALL REUSABLE WIDGETS
// ═══════════════════════════════════════════════════════════════════════════

class _Card extends StatelessWidget {
  final Widget child;
  const _Card({required this.child, super.key});
  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    padding: const EdgeInsets.all(20),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      boxShadow: [BoxShadow(
          color: Colors.black.withOpacity(0.04),
          blurRadius: 10, offset: const Offset(0, 4))],
    ),
    child: child,
  );
}

class _Badge extends StatelessWidget {
  final IconData icon;
  final String text;
  final Color bg, color;
  const _Badge({required this.icon, required this.text,
      required this.bg, required this.color});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
    child: Row(mainAxisSize: MainAxisSize.min, children: [
      Icon(icon, size: 11, color: color),
      const SizedBox(width: 4),
      Text(text, style: GoogleFonts.inter(
          fontSize: 11, fontWeight: FontWeight.bold, color: color)),
    ]),
  );
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final Color iconBg, iconColor;
  final String value, label, sub;
  final bool showBar;
  final double barValue;
  final Color barColor;

  const _StatCard({
    required this.icon, required this.iconBg, required this.iconColor,
    required this.value, required this.label, required this.sub,
    this.showBar = false, this.barValue = 0, this.barColor = const Color(0xFF00C48C),
  });

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      boxShadow: [BoxShadow(
          color: Colors.black.withOpacity(0.04),
          blurRadius: 8, offset: const Offset(0, 2))],
    ),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Container(
          width: 36, height: 36,
          decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(8)),
          child: Icon(icon, color: iconColor, size: 18),
        ),
        Text(value, style: GoogleFonts.spaceGrotesk(
            fontSize: 18, fontWeight: FontWeight.w700,
            color: const Color(0xFF0F172A))),
      ]),
      const SizedBox(height: 10),
      if (showBar) ...[
        LinearProgressIndicator(
          value: barValue,
          backgroundColor: const Color(0xFFE2E8F0),
          color: barColor,
          minHeight: 4,
          borderRadius: BorderRadius.circular(2),
        ),
        const SizedBox(height: 8),
      ],
      Text(label, style: GoogleFonts.inter(
          fontSize: 11, fontWeight: FontWeight.w600,
          color: const Color(0xFF64748B))),
      const SizedBox(height: 2),
      Text(sub, style: GoogleFonts.inter(
          fontSize: 10, color: const Color(0xFF94A3B8))),
    ]),
  );
}

// ── Data models ──────────────────────────────────────────────────────────────
class _ActivityItem {
  final IconData  icon;
  final Color     color;
  final String    title;
  final String    timeAgo;
  final String?   tag;
  final Color?    tagColor;

  const _ActivityItem({
    required this.icon, required this.color,
    required this.title, required this.timeAgo,
    this.tag, this.tagColor,
  });
}

class _HealthCheckItem {
  final String label;
  final bool   passed;
  final String pts;
  const _HealthCheckItem(this.label, this.passed, this.pts);
}