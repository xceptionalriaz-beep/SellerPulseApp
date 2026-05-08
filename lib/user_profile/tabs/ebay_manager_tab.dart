// ═══════════════════════════════════════════════════════════════════════════
// lib/user_profile/tabs/ebay_manager_tab.dart - COMPLETE REDESIGN
// ═══════════════════════════════════════════════════════════════════════════
// States:
// 1. Not Connected  → Feature preview card + CTA
// 2. Connected      → Dark premium card with live stats
// 3. Syncing        → Progress animation
// 4. Error          → Smart reconnect prompt
// + Sync history log
// + Coming soon platform grid
// ═══════════════════════════════════════════════════════════════════════════

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../services/ebay_service.dart';

// ─── Colors ───────────────────────────────────────────────────────────────
class _C {
  static const bg      = Color(0xFFF4F7FA);
  static const surface = Color(0xFFFFFFFF);
  static const navy    = Color(0xFF0F172A);
  static const navy2   = Color(0xFF1E293B);
  static const accent  = Color(0xFF8FFF00);
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
class EbayManagerTab extends StatefulWidget {
  const EbayManagerTab({super.key});
  @override
  State<EbayManagerTab> createState() => _EbayManagerTabState();
}

class _EbayManagerTabState extends State<EbayManagerTab>
    with WidgetsBindingObserver, TickerProviderStateMixin {

  // ── State ────────────────────────────────────────────────────────────────
  bool _isLoading    = true;
  bool _isConnecting = false;
  bool _isSyncing    = false;

  EbayConnectionData? _conn;
  List<Map<String, dynamic>> _syncHistory = [];
  double _safeBuyerPct = 0;

  // ── Animation ─────────────────────────────────────────────────────────
  late AnimationController _pulseCtrl;
  late Animation<double>   _pulseAnim;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);

    _pulseCtrl = AnimationController(
      vsync  : this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _pulseAnim = Tween<double>(begin: 0.4, end: 1.0).animate(
      CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut),
    );

    _loadAll();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _pulseCtrl.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && _conn == null) {
      _loadAll();
    }
  }

  Future<void> _loadAll() async {
    setState(() => _isLoading = true);
    try {
      final conn = await EbayService.checkConnection();
      List<Map<String, dynamic>> history = [];
      double safePct = 0;

      if (conn != null) {
        // Load sync history
        final supabase = Supabase.instance.client;
        final userId   = supabase.auth.currentUser?.id;
        if (userId != null) {
          try {
            final h = await supabase
                .from('order_sync_logs')
                .select()
                .eq('user_id', userId)
                .order('started_at', ascending: false)
                .limit(3);
            history = List<Map<String, dynamic>>.from(h);
          } catch (_) {}

          // Safe buyer percentage
          try {
            final buyers = await supabase
                .from('buyer_profiles')
                .select('risk_level');
            if ((buyers as List).isNotEmpty) {
              final low = buyers
                  .where((b) => (b['risk_level'] ?? '').toString().toUpperCase() == 'LOW')
                  .length;
              safePct = (low / buyers.length * 100);
            }
          } catch (_) {}
        }
      }

      if (mounted) {
        setState(() {
          _conn         = conn;
          _syncHistory  = history;
          _safeBuyerPct = safePct;
          _isLoading    = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // ── Connect ───────────────────────────────────────────────────────────────
  Future<void> _connect() async {
    setState(() => _isConnecting = true);

    // Safety timeout: if user closes popup manually, stop loading after 60s
    Future.delayed(const Duration(seconds: 60), () {
      if (mounted && _isConnecting) setState(() => _isConnecting = false);
    });

    await EbayService.connectEbay(
      onSuccess: () async {
        await Future.delayed(const Duration(milliseconds: 800));
        await _loadAll();
        if (mounted) {
          setState(() => _isConnecting = false);
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('🎉 eBay Store Connected!'),
            backgroundColor: Color(0xFF00C48C),
          ));
        }
      },
      onError: (err) {
        if (mounted) {
          setState(() => _isConnecting = false);
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text('❌ $err'),
            backgroundColor: Colors.redAccent,
          ));
        }
      },
    );

    // After popup closes (any reason) — always stop loading
    if (mounted && _isConnecting) setState(() => _isConnecting = false);
  }

  // ── Sync ──────────────────────────────────────────────────────────────────
  Future<void> _sync() async {
    setState(() => _isSyncing = true);
    try {
      final result = await EbayService.syncOrders();
      await _loadAll();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(result['success'] == true
              ? '✅ Synced ${result['ordersFound']} orders (${result['ordersNew']} new)'
              : '⚠️ Sync completed with issues'),
          backgroundColor: result['success'] == true ? _C.green : Colors.orange,
        ));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('❌ Sync failed: $e'),
          backgroundColor: _C.red,
        ));
      }
    } finally {
      if (mounted) setState(() => _isSyncing = false);
    }
  }

  // ── Disconnect ────────────────────────────────────────────────────────────
  Future<void> _disconnect() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Disconnect eBay?',
            style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w700)),
        content: Text(
          'Your synced orders and data will remain. You can reconnect anytime.',
          style: GoogleFonts.inter(color: _C.txt2),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Cancel',
                style: GoogleFonts.inter(color: _C.txt2)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
                backgroundColor: _C.red,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8))),
            child: Text('Disconnect',
                style: GoogleFonts.inter(color: Colors.white,
                    fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
    if (ok != true) return;
    setState(() => _isLoading = true);
    await EbayService.disconnect();
    await _loadAll();
  }

  // ════════════════════════════════════════════════════════════════════════
  // BUILD
  // ════════════════════════════════════════════════════════════════════════
  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      // Header
      Text('Marketplace Integrations',
          style: GoogleFonts.spaceGrotesk(
              fontSize: 24, fontWeight: FontWeight.w700, color: _C.txt1)),
      const SizedBox(height: 6),
      Text('Connect your sales channels to unlock full SellerPulse features.',
          style: GoogleFonts.inter(fontSize: 14, color: _C.txt2)),
      const SizedBox(height: 28),

      // eBay Card
      if (_isLoading)
        _buildSkeleton()
      else
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 450),
          switchInCurve : Curves.easeOutCubic,
          switchOutCurve: Curves.easeInCubic,
          child: _conn != null
              ? _buildConnectedCard()
              : _buildNotConnectedCard(),
        ),

      const SizedBox(height: 32),

      // Coming Soon
      _buildComingSoonSection(),
    ]);
  }

  // ── NOT CONNECTED CARD ───────────────────────────────────────────────────
  Widget _buildNotConnectedCard() {
    return Container(
      key: const ValueKey('not_connected'),
      decoration: BoxDecoration(
        color: _C.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _C.border),
        boxShadow: [BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 16, offset: const Offset(0, 4))],
      ),
      child: Column(children: [
        // Top section
        Padding(
          padding: const EdgeInsets.all(28),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start,
              children: [
            // Title row
            Row(children: [
              Container(
                width: 52, height: 52,
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: _C.border),
                ),
                child: const Icon(Icons.shopping_bag_outlined,
                    color: _C.txt1, size: 26),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Text('eBay Seller Account',
                      style: GoogleFonts.spaceGrotesk(
                          fontSize: 18, fontWeight: FontWeight.w700,
                          color: _C.txt1)),
                  const SizedBox(height: 4),
                  Text('Unlock omnichannel data and AI risk analysis',
                      style: GoogleFonts.inter(
                          fontSize: 13, color: _C.txt2)),
                ]),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text('Not Connected',
                    style: GoogleFonts.inter(
                        fontSize: 11, color: _C.txt3,
                        fontWeight: FontWeight.w600)),
              ),
            ]),
            const SizedBox(height: 28),

            // Features 2x2 grid
            Row(children: [
              Expanded(child: Column(children: [
                _featureRow(Icons.auto_graph,
                    'Real-time AI velocity', _C.blue),
                const SizedBox(height: 14),
                _featureRow(Icons.shield_outlined,
                    'Buyer risk scoring', _C.green),
              ])),
              const SizedBox(width: 20),
              Expanded(child: Column(children: [
                _featureRow(Icons.sync,
                    'Auto order sync', _C.orange),
                const SizedBox(height: 14),
                _featureRow(Icons.notifications_outlined,
                    'Risk alerts', _C.red),
              ])),
            ]),

            const SizedBox(height: 28),

            // Preview stats (blurred/locked)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: _C.border),
              ),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Row(children: [
                  const Icon(Icons.lock_outline,
                      size: 14, color: _C.txt3),
                  const SizedBox(width: 6),
                  Text('Connect to unlock your dashboard',
                      style: GoogleFonts.inter(
                          fontSize: 12, color: _C.txt3,
                          fontWeight: FontWeight.w600)),
                ]),
                const SizedBox(height: 14),
                LayoutBuilder(builder: (ctx, cs) {
                  final isMobile = cs.maxWidth < 400;
                  if (isMobile) {
                    return Column(children: [
                      Row(children: [Expanded(child: _lockedStat('Orders Tracked', '—')), Expanded(child: _lockedStat('Active Listings', '—'))]),
                      const SizedBox(height: 8),
                      Row(children: [Expanded(child: _lockedStat('Safe Buyers', '—')), Expanded(child: _lockedStat('Revenue', '—'))]),
                    ]);
                  }
                  return Row(children: [
                    _lockedStat('Orders Tracked', '—'),
                    _lockedStat('Active Listings', '—'),
                    _lockedStat('Safe Buyers', '—'),
                    _lockedStat('Revenue', '—'),
                  ]);
                }),
              ]),
            ),

            const SizedBox(height: 24),

            // CTA button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isConnecting ? null : _connect,
                style: ElevatedButton.styleFrom(
                  backgroundColor: _C.accent,
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
                child: _isConnecting
                    ? Row(mainAxisSize: MainAxisSize.min, children: [
                        const SizedBox(width: 18, height: 18,
                            child: CircularProgressIndicator(
                                color: Colors.black, strokeWidth: 2)),
                        const SizedBox(width: 12),
                        Text('Opening eBay...',
                            style: GoogleFonts.inter(
                                color: Colors.black,
                                fontWeight: FontWeight.bold,
                                fontSize: 15)),
                      ])
                    : Row(mainAxisSize: MainAxisSize.min, children: [
                        const Icon(Icons.link, color: Colors.black, size: 20),
                        const SizedBox(width: 10),
                        Text('Connect eBay Store',
                            style: GoogleFonts.inter(
                                color: Colors.black,
                                fontWeight: FontWeight.bold,
                                fontSize: 15)),
                      ]),
              ),
            ),
          ]),
        ),
      ]),
    );
  }

  // ── CONNECTED CARD ───────────────────────────────────────────────────────
  Widget _buildConnectedCard() {
    final conn         = _conn!;
    final isExpiring   = conn.daysUntilExpiry < 30 && conn.daysUntilExpiry > 0;
    final isExpired    = conn.isTokenExpired;
    final isSyncError  = conn.syncStatus == 'error';

    return Container(
      key: const ValueKey('connected'),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: _C.accent.withOpacity(0.15),
            blurRadius: 24, offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(children: [
        Padding(
          padding: const EdgeInsets.all(28),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start,
              children: [

            // ── Header row ────────────────────────────────────────────────
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Avatar
                Container(
                  padding: const EdgeInsets.all(3),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: _C.accent, width: 2),
                  ),
                  child: const CircleAvatar(
                    radius: 26,
                    backgroundColor: Colors.white,
                    child: Icon(Icons.storefront,
                        color: _C.navy, size: 26),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Row(children: [
                      Text(conn.ebayUsername,
                          style: GoogleFonts.spaceGrotesk(
                              fontSize: 20, fontWeight: FontWeight.w700,
                              color: Colors.white)),
                      const SizedBox(width: 8),
                      const Icon(Icons.verified,
                          color: Colors.blue, size: 16),
                    ]),
                    const SizedBox(height: 4),
                    if (conn.feedbackScore.isNotEmpty)
                      Row(children: [
                        const Icon(Icons.star,
                            color: Colors.amber, size: 13),
                        const SizedBox(width: 4),
                        Text('${conn.feedbackScore} Positive Feedback',
                            style: GoogleFonts.inter(
                                fontSize: 12,
                                color: Colors.grey.shade400)),
                      ]),
                  ]),
                ),
                // Live badge with pulse
                AnimatedBuilder(
                  animation: _pulseAnim,
                  builder: (_, __) => Opacity(
                    opacity: _isSyncing ? 1.0 : _pulseAnim.value,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: _C.accent.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                            color: _C.accent.withOpacity(0.4)),
                      ),
                      child: Row(mainAxisSize: MainAxisSize.min,
                          children: [
                        Container(
                          width: 7, height: 7,
                          decoration: BoxDecoration(
                            color: _isSyncing
                                ? _C.orange : _C.accent,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          _isSyncing ? 'Syncing' : 'Live',
                          style: GoogleFonts.inter(
                              color: _isSyncing
                                  ? _C.orange : _C.accent,
                              fontSize: 11,
                              fontWeight: FontWeight.bold),
                        ),
                      ]),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // ── Warning banners ───────────────────────────────────────────
            if (isExpired || isSyncError)
              _warningBanner(
                icon   : Icons.error_outline,
                color  : _C.red,
                message: 'eBay token expired. Reconnect to resume syncing.',
                action : 'Reconnect',
                onTap  : _connect,
              )
            else if (isExpiring)
              _warningBanner(
                icon   : Icons.warning_amber_rounded,
                color  : _C.orange,
                message: 'Token expires in ${conn.daysUntilExpiry} days.',
                action : 'Renew',
                onTap  : _connect,
              ),

            if (isExpired || isSyncError || isExpiring)
              const SizedBox(height: 20),

            // ── Stats grid (responsive 2x2 mobile / 4x1 desktop) ───────
            LayoutBuilder(builder: (ctx, cs) {
              final isMobile = cs.maxWidth < 500;
              final s1 = _darkStat('Orders Synced', conn.ordersSynced.toString(), Icons.shopping_bag_outlined, _C.blue);
              final s2 = _darkStat('Safe Buyers', _safeBuyerPct > 0 ? '${_safeBuyerPct.toStringAsFixed(0)}%' : '—', Icons.shield_outlined, _C.green);
              final s3 = _darkStat('Last Sync', conn.lastSyncText, Icons.sync, _C.accent);
              final s4 = _darkStat('Token', '${conn.daysUntilExpiry}d left', Icons.key_outlined, conn.daysUntilExpiry < 7 ? _C.red : _C.orange);
              if (isMobile) {
                return Column(children: [
                  Row(children: [Expanded(child: s1), const SizedBox(width: 10), Expanded(child: s2)]),
                  const SizedBox(height: 10),
                  Row(children: [Expanded(child: s3), const SizedBox(width: 10), Expanded(child: s4)]),
                ]);
              }
              return Row(children: [
                Expanded(child: s1), const SizedBox(width: 12),
                Expanded(child: s2), const SizedBox(width: 12),
                Expanded(child: s3), const SizedBox(width: 12),
                Expanded(child: s4),
              ]);
            }),

            const SizedBox(height: 20),
            const Divider(color: Colors.white12),
            const SizedBox(height: 20),

            // ── Sync progress bar ─────────────────────────────────────────
            Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
              Text('Orders this month',
                  style: GoogleFonts.inter(
                      fontSize: 12, color: Colors.grey)),
              Text('${conn.ordersSynced} synced',
                  style: GoogleFonts.inter(
                      fontSize: 12,
                      color: _C.accent,
                      fontWeight: FontWeight.bold)),
            ]),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: (conn.ordersSynced / 500).clamp(0.0, 1.0),
                backgroundColor: Colors.white12,
                color: _C.accent,
                minHeight: 5,
              ),
            ),
            const SizedBox(height: 6),
            Text('${conn.ordersSynced}/500 order limit',
                style: GoogleFonts.inter(
                    fontSize: 10, color: Colors.grey)),

            const SizedBox(height: 24),

            // ── Action buttons ────────────────────────────────────────────
            Row(children: [
              // Sync Now
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: _isSyncing ? null : _sync,
                  icon: _isSyncing
                      ? const SizedBox(width: 14, height: 14,
                          child: CircularProgressIndicator(
                              color: Colors.black, strokeWidth: 2))
                      : const Icon(Icons.sync,
                          color: Colors.black, size: 16),
                  label: Text(
                    _isSyncing ? 'Syncing...' : 'Sync Now',
                    style: GoogleFonts.inter(
                        color: Colors.black,
                        fontWeight: FontWeight.bold,
                        fontSize: 13),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _C.accent,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              // Refresh
              _iconBtn(Icons.refresh, Colors.white54, _loadAll),
              const SizedBox(width: 8),
              // Disconnect
              _iconBtn(Icons.link_off, _C.red.withOpacity(0.7),
                  _disconnect),
            ]),
          ]),
        ),

        // ── Sync history ──────────────────────────────────────────────────
        if (_syncHistory.isNotEmpty)
          Container(
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: Colors.white12)),
            ),
            padding: const EdgeInsets.fromLTRB(28, 20, 28, 24),
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
              Row(children: [
                const Icon(Icons.history, size: 13, color: Colors.grey),
                const SizedBox(width: 6),
                Text('Sync History',
                    style: GoogleFonts.inter(
                        fontSize: 12, color: Colors.grey,
                        fontWeight: FontWeight.w600)),
              ]),
              const SizedBox(height: 14),
              ..._syncHistory.map((log) => _syncHistoryRow(log)),
            ]),
          ),
      ]),
    );
  }

  // ── COMING SOON SECTION ───────────────────────────────────────────────────
  Widget _buildComingSoonSection() {
    final platforms = [
      {
        'name'    : 'Amazon Seller',
        'icon'    : Icons.shopping_cart_outlined,
        'color'   : const Color(0xFFFF9900),
        'feature' : 'FBA inventory sync',
      },
      {
        'name'    : 'Shopify',
        'icon'    : Icons.store_outlined,
        'color'   : const Color(0xFF96BF48),
        'feature' : 'Multi-store management',
      },
      {
        'name'    : 'Walmart',
        'icon'    : Icons.local_mall_outlined,
        'color'   : const Color(0xFF0071DC),
        'feature' : 'Marketplace analytics',
      },
      {
        'name'    : 'Etsy',
        'icon'    : Icons.handyman_outlined,
        'color'   : const Color(0xFFF56400),
        'feature' : 'Handmade item tracking',
      },
    ];

    return Column(crossAxisAlignment: CrossAxisAlignment.start,
        children: [
      Row(children: [
        Text('Coming Soon',
            style: GoogleFonts.spaceGrotesk(
                fontSize: 16, fontWeight: FontWeight.w700,
                color: _C.txt1)),
        const SizedBox(width: 12),
        Container(
          padding: const EdgeInsets.symmetric(
              horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: _C.navy,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text('4 Platforms',
              style: GoogleFonts.inter(
                  fontSize: 11, color: _C.accent,
                  fontWeight: FontWeight.w700)),
        ),
      ]),
      const SizedBox(height: 16),
      LayoutBuilder(builder: (ctx, cs) {
        final cols  = cs.maxWidth < 500 ? 1 : cs.maxWidth < 800 ? 2 : 4;
        final ratio = cols == 1 ? 4.5 : cols == 2 ? 3.0 : 2.2;
        return GridView.count(
          crossAxisCount  : cols,
          shrinkWrap      : true,
          physics         : const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 12,
          mainAxisSpacing : 12,
          childAspectRatio: ratio,
          children: platforms.map((p) =>
              _comingSoonCard(
                name   : p['name'] as String,
                icon   : p['icon'] as IconData,
                color  : p['color'] as Color,
                feature: p['feature'] as String,
              )).toList(),
        );
      }),
    ]);
  }

  // ════════════════════════════════════════════════════════════════════════
  // SMALL WIDGETS
  // ════════════════════════════════════════════════════════════════════════

  Widget _featureRow(IconData icon, String text, Color color) {
    return Row(children: [
      Container(
        width: 32, height: 32,
        decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8)),
        child: Icon(icon, color: color, size: 16),
      ),
      const SizedBox(width: 10),
      Expanded(
        child: Text(text,
            style: GoogleFonts.inter(
                fontSize: 13, color: _C.txt1,
                fontWeight: FontWeight.w500)),
      ),
    ]);
  }

  Widget _lockedStat(String label, String value) {
    return Expanded(
      child: Column(children: [
        Text(value,
            style: GoogleFonts.spaceGrotesk(
                fontSize: 18, fontWeight: FontWeight.w700,
                color: _C.txt3)),
        const SizedBox(height: 4),
        Text(label,
            style: GoogleFonts.inter(
                fontSize: 10, color: _C.txt3),
            textAlign: TextAlign.center),
      ]),
    );
  }

  Widget _darkStat(String label, String value,
      IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(height: 6),
          Text(value,
              style: GoogleFonts.spaceGrotesk(
                  fontSize: 14, fontWeight: FontWeight.w700,
                  color: Colors.white),
              maxLines: 1,
              overflow: TextOverflow.ellipsis),
          const SizedBox(height: 2),
          Text(label,
              style: GoogleFonts.inter(
                  fontSize: 9, color: Colors.grey),
              maxLines: 1,
              overflow: TextOverflow.ellipsis),
        ]),
      ),
    );
  }

  Widget _iconBtn(IconData icon, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        width: 44, height: 44,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
              color: Colors.white.withOpacity(0.1)),
        ),
        child: Icon(icon, color: color, size: 18),
      ),
    );
  }

  Widget _warningBanner({
    required IconData   icon,
    required Color      color,
    required String     message,
    required String     action,
    required VoidCallback onTap,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(
          horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(children: [
        Icon(icon, color: color, size: 16),
        const SizedBox(width: 10),
        Expanded(
          child: Text(message,
              style: GoogleFonts.inter(
                  fontSize: 12, color: color,
                  fontWeight: FontWeight.w500)),
        ),
        TextButton(
          onPressed: onTap,
          style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(
                  horizontal: 12, vertical: 6)),
          child: Text(action,
              style: GoogleFonts.inter(
                  color: color, fontWeight: FontWeight.bold,
                  fontSize: 12)),
        ),
      ]),
    );
  }

  Widget _syncHistoryRow(Map<String, dynamic> log) {
    final success  = log['status'] == 'success';
    final found    = (log['orders_found'] ?? 0) as int;
    final newOrds  = (log['orders_new']   ?? 0) as int;
    final started  = log['started_at'] != null
        ? DateTime.tryParse(log['started_at'].toString()) : null;
    final completed = log['completed_at'] != null
        ? DateTime.tryParse(log['completed_at'].toString()) : null;

    String duration = '';
    if (started != null && completed != null) {
      final secs = completed.difference(started).inSeconds;
      duration = secs < 60 ? '${secs}s' : '${secs ~/ 60}m ${secs % 60}s';
    }

    String timeAgo = '';
    if (started != null) {
      final diff = DateTime.now().difference(started);
      if (diff.inMinutes < 60) timeAgo = '${diff.inMinutes}m ago';
      else if (diff.inHours < 24) timeAgo = '${diff.inHours}h ago';
      else timeAgo = '${diff.inDays}d ago';
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(children: [
        Icon(
          success ? Icons.check_circle : Icons.error,
          size: 14,
          color: success ? _C.green : _C.red,
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            success
                ? '$found orders • $newOrds new${duration.isNotEmpty ? ' • $duration' : ''}'
                : 'Sync failed${log['error_msg'] != null ? ': ${log['error_msg']}' : ''}',
            style: GoogleFonts.inter(
                fontSize: 12,
                color: success ? Colors.grey.shade300 : _C.red),
          ),
        ),
        Text(timeAgo,
            style: GoogleFonts.inter(
                fontSize: 10, color: Colors.grey)),
      ]),
    );
  }

  Widget _comingSoonCard({
    required String  name,
    required IconData icon,
    required Color   color,
    required String  feature,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(
          horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: _C.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _C.border),
      ),
      child: Row(children: [
        Container(
          width: 36, height: 36,
          decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8)),
          child: Icon(icon, color: color, size: 18),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
            Text(name,
                style: GoogleFonts.inter(
                    fontSize: 13, fontWeight: FontWeight.w700,
                    color: _C.txt1)),
            Text(feature,
                style: GoogleFonts.inter(
                    fontSize: 10, color: _C.txt3),
                maxLines: 1,
                overflow: TextOverflow.ellipsis),
          ]),
        ),
        Container(
          padding: const EdgeInsets.symmetric(
              horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text('Soon',
              style: GoogleFonts.inter(
                  fontSize: 10, color: _C.txt3,
                  fontWeight: FontWeight.w600)),
        ),
      ]),
    );
  }

  Widget _buildSkeleton() {
    return Container(
      height: 420,
      decoration: BoxDecoration(
        color: _C.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _C.border),
      ),
      child: const Center(
        child: CircularProgressIndicator(
            color: Color(0xFF8FFF00)),
      ),
    );
  }
}