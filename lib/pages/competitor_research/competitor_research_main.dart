// lib/pages/competitor_research/competitor_research_main.dart
//
// SellerPulse — Competitor Research — ALL IN ONE PAGE
// Search → Scan → Results all on the same screen, no page navigation

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:fl_chart/fl_chart.dart';
import 'services/competitor_service.dart';
import 'dart:math' as math;

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
class _C {
  static const bg         = Color(0xFFF8FAFC);
  static const white      = Color(0xFFFFFFFF);
  static const surface    = Color(0xFFF1F5F9);
  static const border     = Color(0xFFE2E8F0);
  static const accent     = Color(0xFF5CB800);
  static const accentDim  = Color(0xFFE8FFB0);
  static const navy       = Color(0xFF0F172A);
  static const textPri    = Color(0xFF0F172A);
  static const textSec    = Color(0xFF64748B);
  static const textHint   = Color(0xFF94A3B8);
  static const error      = Color(0xFFDC2626);
  static const success    = Color(0xFF16A34A);
  static const warning    = Color(0xFFD97706);
  static const blue       = Color(0xFF2563EB);
  static const purple     = Color(0xFF7C3AED);
  static const orange     = Color(0xFFEA580C);
}

// ─────────────────────────────────────────────
// MAIN SCREEN — single page, all states
// ─────────────────────────────────────────────

class CompetitorResearchMain extends StatefulWidget {
  const CompetitorResearchMain({super.key});

  @override
  State<CompetitorResearchMain> createState() =>
      _CompetitorResearchMainState();
}

class _CompetitorResearchMainState extends State<CompetitorResearchMain>
    with SingleTickerProviderStateMixin {
  final _searchCtrl = TextEditingController();
  final _focusNode  = FocusNode();
  final _service    = CompetitorService();
  late TabController _tabController;

  // ── Page states ──
  // 'idle'     → show search + history
  // 'scanning' → show progress animation
  // 'results'  → show scan results inline
  String _pageState = 'idle';

  bool   _isFocused     = false;
  String? _errorMsg;

  // Scan progress
  int _scanStage = 0;
  final _stages  = [
    '🔍  Connecting to eBay...',
    '📦  Fetching store listings...',
    '📊  Analysing products...',
    '🧠  Running AI scoring...',
    '🎯  Finding gaps...',
    '💾  Saving results...',
  ];

  // Results
  StoreScanResult? _result;
  List<Map<String, dynamic>> _history = [];
  bool _historyLoading = true;

  // Results filters
  String   _sortBy       = 'opportunity';
  String   _filterTrend  = 'all';
  String   _searchProd   = '';
  final Set<String> _savedIds = {};
  bool _onWatchlist      = false;
  bool _watchlistLoading = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _focusNode.addListener(() =>
        setState(() => _isFocused = _focusNode.hasFocus));
    _loadHistory();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _focusNode.dispose();
    _tabController.dispose();
    super.dispose();
  }

  // ─────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────

  Future<void> _loadHistory() async {
    setState(() => _historyLoading = true);
    try {
      final h = await _service.loadScanHistory();
      if (mounted) setState(() => _history = h);
    } catch (_) {}
    if (mounted) setState(() => _historyLoading = false);
  }

  Future<void> _startScan([String? username]) async {
    final name = username ?? _searchCtrl.text.trim();
    if (name.isEmpty) {
      setState(() => _errorMsg = 'Enter an eBay username to scan');
      return;
    }
    _searchCtrl.text = name;
    _focusNode.unfocus();

    setState(() {
      _pageState = 'scanning';
      _errorMsg  = null;
      _scanStage = 0;
      _result    = null;
    });

    // Animate stages
    for (int i = 0; i < _stages.length; i++) {
      await Future.delayed(const Duration(milliseconds: 600));
      if (mounted) setState(() => _scanStage = i);
    }

    try {
      final result = await _service.scanStore(name);
      if (!mounted) return;

      // Check watchlist
      final onWatch = await _service.isOnWatchlist(name);

      setState(() {
        _result        = result;
        _onWatchlist   = onWatch;
        _pageState     = 'results';
        _sortBy        = 'opportunity';
        _filterTrend   = 'all';
        _searchProd    = '';
        _savedIds.clear();
        _tabController.index = 0;
      });

      _loadHistory();
    } catch (e) {
      if (mounted) {
        setState(() {
          _pageState = 'idle';
          _errorMsg  = 'Could not scan "$name". Check the username and try again.';
        });
      }
    }
  }

  void _backToSearch() => setState(() {
    _pageState = 'idle';
    _errorMsg  = null;
  });

  Future<void> _toggleWatchlist() async {
    if (_result == null) return;
    if (_onWatchlist) {
      await _service.removeFromWatchlist(_result!.overview.username);
    } else {
      await _service.addToWatchlist(_result!.overview);
    }
    setState(() => _onWatchlist = !_onWatchlist);
    _snack(_onWatchlist ? 'Added to watchlist ✓' : 'Removed from watchlist');
  }

  Future<void> _toggleSave(ScannedProduct p) async {
    if (_savedIds.contains(p.itemId)) {
      await _service.removeFromListingIdeas(p.itemId);
      setState(() => _savedIds.remove(p.itemId));
      _snack('Removed from Listing Ideas');
    } else {
      await _service.saveToListingIdeas(p);
      setState(() => _savedIds.add(p.itemId));
      _snack('✓ Saved to Listing Ideas');
    }
  }

  void _snack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg, style: const TextStyle(
          color: Colors.black, fontWeight: FontWeight.w600)),
      backgroundColor: _C.accent,
      duration: const Duration(seconds: 2),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      margin: const EdgeInsets.all(16),
    ));
  }

  // ─────────────────────────────────────────────
  // BUILD
  // ─────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _C.bg,
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    switch (_pageState) {
      case 'scanning': return _scanningView();
      case 'results':  return _resultsView();
      default:         return _idleView();
    }
  }

  // ══════════════════════════════════════════════
  // IDLE VIEW — search + history
  // ══════════════════════════════════════════════

  Widget _idleView() {
    return CustomScrollView(slivers: [
      SliverToBoxAdapter(child: Padding(
        padding: const EdgeInsets.fromLTRB(32, 40, 32, 0),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

          // ── Header ──
          Row(children: [
            Container(
              width: 42, height: 42,
              decoration: BoxDecoration(
                color: _C.accentDim,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.radar_rounded, color: _C.accent, size: 22),
            ),
            const SizedBox(width: 14),
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Competitor Research', style: GoogleFonts.spaceGrotesk(
                fontSize: 22, fontWeight: FontWeight.w700, color: _C.textPri,
                letterSpacing: -0.3)),
              const Text('Scan any eBay store. Find winning products instantly.',
                style: TextStyle(fontSize: 13, color: _C.textSec)),
            ]),
            const Spacer(),
            _ghostBtn(Icons.bookmark_outline_rounded, 'Listing Ideas', () =>
                Navigator.pushNamed(context, '/competitor/listing-ideas')),
            const SizedBox(width: 8),
            _ghostBtn(Icons.visibility_outlined, 'Watchlist', () =>
                Navigator.pushNamed(context, '/competitor/watchlist')),
          ]).animate().fadeIn(duration: 350.ms).slideY(begin: -0.05, end: 0),

          const SizedBox(height: 32),

          // ── Search bar ──
          _searchBar().animate().fadeIn(delay: 80.ms, duration: 350.ms),

          const SizedBox(height: 10),

          // Hint
          const Row(children: [
            Icon(Icons.info_outline_rounded, size: 12, color: _C.textHint),
            SizedBox(width: 5),
            Text('Enter an eBay username (e.g. "techdealsusa") — not a store URL',
              style: TextStyle(fontSize: 11, color: _C.textHint)),
          ]).animate().fadeIn(delay: 120.ms, duration: 350.ms),

          const SizedBox(height: 32),

          // ── Feature strip ──
          _featureStrip().animate().fadeIn(delay: 160.ms, duration: 350.ms),

          const SizedBox(height: 36),

          // ── History header ──
          Row(children: [
            Text('Recent Scans', style: GoogleFonts.spaceGrotesk(
              fontSize: 16, fontWeight: FontWeight.w600, color: _C.textPri)),
            const Spacer(),
            if (_history.isNotEmpty)
              GestureDetector(
                onTap: _loadHistory,
                child: const Text('Refresh',
                  style: TextStyle(fontSize: 12, color: _C.textSec)),
              ),
          ]).animate().fadeIn(delay: 200.ms, duration: 350.ms),

          const SizedBox(height: 12),
        ]),
      )),

      // ── History list ──
      if (_historyLoading)
        const SliverToBoxAdapter(child: Padding(
          padding: EdgeInsets.symmetric(vertical: 40),
          child: Center(child: CircularProgressIndicator(
              color: _C.accent, strokeWidth: 2)),
        ))
      else if (_history.isEmpty)
        SliverToBoxAdapter(child: _emptyHistory()
          .animate().fadeIn(delay: 240.ms, duration: 350.ms))
      else
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(32, 0, 32, 40),
          sliver: SliverList(delegate: SliverChildBuilderDelegate(
            (ctx, i) => _historyCard(_history[i])
              .animate(delay: Duration(milliseconds: 50 * i))
              .fadeIn(duration: 250.ms).slideY(begin: 0.04, end: 0),
            childCount: _history.length,
          )),
        ),
    ]);
  }

  // ── Search bar widget ──
  Widget _searchBar() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: 54,
        decoration: BoxDecoration(
          color: _C.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: _errorMsg != null
                ? _C.error
                : _isFocused ? _C.accent : _C.border,
            width: _isFocused ? 1.5 : 1,
          ),
          boxShadow: _isFocused ? [BoxShadow(
            color: _C.accent.withOpacity(0.12),
            blurRadius: 16, spreadRadius: 2,
          )] : [],
        ),
        child: Row(children: [
          const SizedBox(width: 16),
          Icon(Icons.store_outlined, size: 18,
            color: _isFocused ? _C.accent : _C.textSec),
          const SizedBox(width: 12),
          Expanded(child: TextField(
            controller: _searchCtrl,
            focusNode: _focusNode,
            onSubmitted: (_) => _startScan(),
            style: const TextStyle(fontSize: 14, color: _C.textPri,
                fontWeight: FontWeight.w500),
            decoration: const InputDecoration(
              hintText: 'Enter eBay username (e.g. techdealsusa)',
              hintStyle: TextStyle(fontSize: 13, color: _C.textHint),
              border: InputBorder.none, isDense: true,
            ),
          )),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: _startScan,
            child: Container(
              margin: const EdgeInsets.all(6),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              decoration: BoxDecoration(
                color: _C.accent, borderRadius: BorderRadius.circular(8)),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                const Icon(Icons.radar_rounded, size: 15, color: Colors.black),
                const SizedBox(width: 7),
                Text('Scan Store', style: GoogleFonts.spaceGrotesk(
                  fontSize: 13, fontWeight: FontWeight.w700, color: Colors.black)),
              ]),
            ),
          ),
        ]),
      ),
      if (_errorMsg != null) ...[
        const SizedBox(height: 6),
        Row(children: [
          const Icon(Icons.error_outline_rounded, size: 12, color: _C.error),
          const SizedBox(width: 5),
          Text(_errorMsg!, style: const TextStyle(fontSize: 12, color: _C.error)),
        ]),
      ],
    ]);
  }

  // ── Feature strip ──
  Widget _featureStrip() {
    final items = [
      (Icons.auto_awesome_rounded, 'AI Score',    'Products scored 1–10'),
      (Icons.manage_search_rounded, 'Gap Finder', 'Auto-detect'),
      (Icons.key_rounded,          'Keywords',    'From titles'),
      (Icons.bookmark_add_outlined,'Listing Ideas','One-tap save'),
    ];
    return Row(children: items.asMap().entries.map((e) {
      final i = e.key;
      final item = e.value;
      return Expanded(child: Container(
        margin: EdgeInsets.only(right: i < 3 ? 10 : 0),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: _C.white, borderRadius: BorderRadius.circular(10),
          border: Border.all(color: _C.border),
        ),
        child: Row(children: [
          Container(
            width: 32, height: 32,
            decoration: BoxDecoration(
              color: _C.accentDim, borderRadius: BorderRadius.circular(8)),
            child: Icon(item.$1, size: 16, color: _C.accent),
          ),
          const SizedBox(width: 10),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(item.$2, style: const TextStyle(
              fontSize: 12, color: _C.textSec)),
            Text(item.$3, style: const TextStyle(
              fontSize: 13, fontWeight: FontWeight.w600, color: _C.textPri)),
          ]),
        ]),
      ));
    }).toList());
  }

  // ── Empty history ──
  Widget _emptyHistory() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(32, 0, 32, 40),
      child: Container(
        padding: const EdgeInsets.all(36),
        decoration: BoxDecoration(
          color: _C.white, borderRadius: BorderRadius.circular(14),
          border: Border.all(color: _C.border),
        ),
        child: Column(children: [
          Container(
            width: 52, height: 52,
            decoration: const BoxDecoration(color: _C.accentDim, shape: BoxShape.circle),
            child: const Icon(Icons.radar_rounded, color: _C.accent, size: 24),
          ),
          const SizedBox(height: 14),
          Text('No scans yet', style: GoogleFonts.spaceGrotesk(
            fontSize: 15, fontWeight: FontWeight.w600, color: _C.textPri)),
          const SizedBox(height: 6),
          const Text('Scan your first competitor store above\nto find winning products instantly.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 13, color: _C.textSec, height: 1.6)),
          const SizedBox(height: 18),
          GestureDetector(
            onTap: () => _focusNode.requestFocus(),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 9),
              decoration: BoxDecoration(
                color: _C.accentDim, borderRadius: BorderRadius.circular(8),
                border: Border.all(color: _C.accent.withOpacity(0.4))),
              child: Text('Start your first scan →', style: TextStyle(
                fontSize: 13, fontWeight: FontWeight.w600, color: _C.accent)),
            ),
          ),
        ]),
      ),
    );
  }

  // ── History card ──
  Widget _historyCard(Map<String, dynamic> scan) {
    final username = scan['username'] ?? '';
    final revenue  = (scan['estimated_revenue'] ?? 0.0).toDouble();
    final sold     = scan['total_sold'] ?? 0;
    final scannedAt = scan['scanned_at'] != null
        ? DateTime.tryParse(scan['scanned_at']) : null;

    return GestureDetector(
      onTap: () => _startScan(username),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: _C.white, borderRadius: BorderRadius.circular(10),
          border: Border.all(color: _C.border),
        ),
        child: Row(children: [
          Container(
            width: 38, height: 38,
            decoration: BoxDecoration(
              color: _C.accentDim, borderRadius: BorderRadius.circular(9)),
            child: Center(child: Text(
              username.isNotEmpty ? username[0].toUpperCase() : '?',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800,
                  color: _C.accent),
            )),
          ),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(username, style: const TextStyle(
              fontSize: 14, fontWeight: FontWeight.w600, color: _C.textPri)),
            Text(scannedAt != null ? _timeAgo(scannedAt) : 'Recently',
              style: const TextStyle(fontSize: 11, color: _C.textSec)),
          ])),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text('\$${_fmt(revenue)}', style: const TextStyle(
              fontSize: 14, fontWeight: FontWeight.w700, color: _C.accent)),
            Text('$sold sold', style: const TextStyle(
              fontSize: 11, color: _C.textSec)),
          ]),
          const SizedBox(width: 10),
          const Icon(Icons.arrow_forward_ios_rounded, size: 13, color: _C.textHint),
        ]),
      ),
    );
  }

  // ── Ghost button ──
  Widget _ghostBtn(IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: _C.white, borderRadius: BorderRadius.circular(8),
          border: Border.all(color: _C.border),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 14, color: _C.textSec),
          const SizedBox(width: 5),
          Text(label, style: const TextStyle(fontSize: 12, color: _C.textSec,
              fontWeight: FontWeight.w500)),
        ]),
      ),
    );
  }

  // ══════════════════════════════════════════════
  // SCANNING VIEW — progress animation
  // ══════════════════════════════════════════════

  Widget _scanningView() {
    final username = _searchCtrl.text.trim();
    return Center(child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Pulsing radar
        TweenAnimationBuilder<double>(
          tween: Tween(begin: 0.95, end: 1.05),
          duration: const Duration(milliseconds: 800),
          builder: (_, scale, child) =>
              Transform.scale(scale: scale, child: child),
          child: Container(
            width: 76, height: 76,
            decoration: BoxDecoration(
              color: _C.accentDim, shape: BoxShape.circle,
              boxShadow: [BoxShadow(
                color: _C.accent.withOpacity(0.25),
                blurRadius: 28, spreadRadius: 6)],
            ),
            child: const Icon(Icons.radar_rounded, color: _C.accent, size: 34),
          ),
        ),

        const SizedBox(height: 24),

        Text('Scanning "$username"', style: GoogleFonts.spaceGrotesk(
          fontSize: 19, fontWeight: FontWeight.w700, color: _C.textPri)),

        const SizedBox(height: 8),

        Text(_stages[_scanStage],
          style: const TextStyle(fontSize: 13, color: _C.textSec),
        ).animate(key: ValueKey(_scanStage)).fadeIn(duration: 250.ms),

        const SizedBox(height: 28),

        // Progress bar
        Container(
          width: 260, height: 4,
          decoration: BoxDecoration(
            color: _C.border, borderRadius: BorderRadius.circular(2)),
          child: FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: (_scanStage + 1) / _stages.length,
            child: Container(
              decoration: BoxDecoration(
                color: _C.accent, borderRadius: BorderRadius.circular(2),
                boxShadow: [BoxShadow(
                  color: _C.accent.withOpacity(0.4), blurRadius: 6)],
              ),
            ),
          ),
        ),

        const SizedBox(height: 10),

        Text('${((_scanStage + 1) / _stages.length * 100).round()}%',
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600,
              color: _C.accent)),

        const SizedBox(height: 32),

        GestureDetector(
          onTap: () => setState(() => _pageState = 'idle'),
          child: const Text('Cancel',
            style: TextStyle(fontSize: 13, color: _C.textSec)),
        ),
      ],
    ));
  }

  // ══════════════════════════════════════════════
  // RESULTS VIEW — inline on same page
  // ══════════════════════════════════════════════

  Widget _resultsView() {
    if (_result == null) return const SizedBox();
    final o = _result!.overview;

    return Column(children: [
      // ── Top bar ──
      Container(
        color: _C.white,
        padding: const EdgeInsets.fromLTRB(20, 14, 20, 12),
        child: Row(children: [
          // Back to search
          GestureDetector(
            onTap: _backToSearch,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: _C.bg, borderRadius: BorderRadius.circular(8),
                border: Border.all(color: _C.border)),
              child: const Icon(Icons.arrow_back_ios_new_rounded,
                  size: 15, color: _C.textSec),
            ),
          ),
          const SizedBox(width: 12),

          // Avatar
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              color: _C.accentDim, borderRadius: BorderRadius.circular(10)),
            child: Center(child: Text(
              o.username.isNotEmpty ? o.username[0].toUpperCase() : '?',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800,
                  color: _C.accent),
            )),
          ),
          const SizedBox(width: 10),

          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(o.storeName ?? o.username, style: GoogleFonts.spaceGrotesk(
              fontSize: 14, fontWeight: FontWeight.w700, color: _C.textPri)),
            Text('eBay • ${o.feedbackPercent.toStringAsFixed(1)}% feedback',
              style: const TextStyle(fontSize: 11, color: _C.textSec)),
          ]),

          const Spacer(),

          Text(_timeAgo(_result!.scannedAt),
            style: const TextStyle(fontSize: 11, color: _C.textHint)),
          const SizedBox(width: 14),

          // Watch
          GestureDetector(
            onTap: _toggleWatchlist,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
              decoration: BoxDecoration(
                color: _onWatchlist ? _C.accentDim : _C.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: _onWatchlist ? _C.accent : _C.border)),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(_onWatchlist ? Icons.visibility : Icons.visibility_outlined,
                  size: 14, color: _onWatchlist ? _C.accent : _C.textSec),
                const SizedBox(width: 5),
                Text(_onWatchlist ? 'Watching' : 'Watch',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600,
                    color: _onWatchlist ? _C.accent : _C.textSec)),
              ]),
            ),
          ),
          const SizedBox(width: 8),

          // New scan button
          GestureDetector(
            onTap: _backToSearch,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
              decoration: BoxDecoration(
                color: _C.accent, borderRadius: BorderRadius.circular(8)),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                const Icon(Icons.radar_rounded, size: 13, color: Colors.black),
                const SizedBox(width: 5),
                Text('New Scan', style: GoogleFonts.spaceGrotesk(
                  fontSize: 12, fontWeight: FontWeight.w700, color: Colors.black)),
              ]),
            ),
          ),
        ]),
      ),

      // ── Metrics strip ──
      _metricsStrip(o),

      // ── Tabs ──
      Container(
        color: _C.white,
        child: TabBar(
          controller: _tabController,
          labelColor: _C.accent,
          unselectedLabelColor: _C.textSec,
          indicatorColor: _C.accent,
          indicatorWeight: 2,
          indicatorSize: TabBarIndicatorSize.label,
          dividerColor: _C.border,
          labelStyle: GoogleFonts.spaceGrotesk(
              fontSize: 13, fontWeight: FontWeight.w600),
          unselectedLabelStyle: const TextStyle(fontSize: 13),
          tabs: [
            Tab(child: Row(mainAxisSize: MainAxisSize.min, children: [
              const Icon(Icons.inventory_2_outlined, size: 14),
              const SizedBox(width: 5),
              Text('Products (${_result!.products.length})'),
            ])),
            Tab(child: Row(mainAxisSize: MainAxisSize.min, children: [
              const Icon(Icons.manage_search_rounded, size: 14),
              const SizedBox(width: 5),
              Text('Gap Finder (${_result!.gaps.length})'),
            ])),
            const Tab(child: Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.key_rounded, size: 14),
              SizedBox(width: 5),
              Text('Keywords'),
            ])),
            const Tab(child: Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.price_change_outlined, size: 14),
              SizedBox(width: 5),
              Text('Price Analysis'),
            ])),
          ],
        ),
      ),

      // ── Tab content ──
      Expanded(child: TabBarView(
        controller: _tabController,
        children: [
          _productsTab(),
          _gapTab(),
          _keywordsTab(),
          _priceTab(),
        ],
      )),
    ]);
  }

  // ── Metrics strip ──
  Widget _metricsStrip(StoreOverview o) {
    final products    = _result!.products;
    final successful  = products.where((p) => p.soldCount > 0).length;
    final sucPct      = products.isNotEmpty
        ? (successful / products.length * 100).round() : 0;

    final metrics = [
      ('Est. Revenue',        '\$${_fmt(o.estimatedRevenue)}', Icons.attach_money_rounded,   _C.accent),
      ('Total Sold',          _fmtInt(o.totalSold),           Icons.shopping_bag_outlined,  _C.success),
      ('Active Listings',     _fmtInt(o.activeListings),      Icons.list_alt_rounded,        _C.blue),
      ('Avg Price',           '\$${o.avgPrice.toStringAsFixed(2)}', Icons.sell_outlined,    _C.purple),
      ('Sell-Through',        '${o.sellThroughRate.toStringAsFixed(1)}%', Icons.trending_up_rounded, _C.warning),
      ('Feedback',            '${o.feedbackScore}',           Icons.star_rounded,            _C.orange),
      ('Successful Listings', '$sucPct% ($successful/${products.length})', Icons.check_circle_outline, _C.success),
    ];

return Container(
      color: _C.white,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
      child: Row(
        children: metrics.asMap().entries.map((e) {
          final i = e.key;
          final m = e.value;
          return Expanded(
            child: Container(
              margin: EdgeInsets.only(right: i < metrics.length - 1 ? 8 : 0),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: _C.bg, borderRadius: BorderRadius.circular(10),
                border: Border.all(color: _C.border),
              ),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(children: [
                  Icon(m.$3, size: 11, color: m.$4),
                  const SizedBox(width: 4),
                  Flexible(child: Text(m.$1, style: const TextStyle(
                    fontSize: 9, color: _C.textSec),
                    overflow: TextOverflow.ellipsis)),
                ]),
                const SizedBox(height: 4),
                Text(m.$2, style: TextStyle(
                  fontSize: i == 6 ? 11 : 15,
                  fontWeight: FontWeight.w800, color: m.$4),
                  overflow: TextOverflow.ellipsis),
              ]),
            ).animate(delay: Duration(milliseconds: 35 * i))
             .fadeIn(duration: 200.ms).slideY(begin: 0.05, end: 0),
          );
        }).toList(),
      ),
    );
  }

  // ── Products tab ──
  Widget _productsTab() {
    var list = [..._result!.products];
    if (_searchProd.isNotEmpty) {
      list = list.where((p) =>
        p.title.toLowerCase().contains(_searchProd.toLowerCase())).toList();
    }
    if (_filterTrend != 'all') {
      list = list.where((p) => p.trend == _filterTrend).toList();
    }
    switch (_sortBy) {
      case 'opportunity': list.sort((a, b) => b.opportunityScore.compareTo(a.opportunityScore)); break;
      case 'revenue':     list.sort((a, b) => b.revenue.compareTo(a.revenue)); break;
      case 'sold':        list.sort((a, b) => b.soldCount.compareTo(a.soldCount)); break;
      case 'price':       list.sort((a, b) => b.price.compareTo(a.price)); break;
    }

    return Column(children: [
      // Filter bar
      Container(
        color: _C.white,
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
        child: Column(children: [
          // Search row
          Row(children: [
            Expanded(child: Container(
              height: 36,
              padding: const EdgeInsets.symmetric(horizontal: 10),
              decoration: BoxDecoration(
                color: _C.bg, borderRadius: BorderRadius.circular(8),
                border: Border.all(color: _C.border)),
              child: Row(children: [
                const Icon(Icons.search_rounded, size: 14, color: _C.textHint),
                const SizedBox(width: 7),
                Expanded(child: TextField(
                  onChanged: (v) => setState(() => _searchProd = v),
                  style: const TextStyle(fontSize: 13, color: _C.textPri),
                  decoration: const InputDecoration(
                    hintText: 'Search products...',
                    hintStyle: TextStyle(fontSize: 13, color: _C.textHint),
                    border: InputBorder.none, isDense: true,
                  ),
                )),
              ]),
            )),
            const SizedBox(width: 10),
            Text('${list.length} products',
              style: const TextStyle(fontSize: 11, color: _C.textHint)),
          ]),
          const SizedBox(height: 8),
          // Sort + Trend tabs
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(children: [
              const Text('SORT', style: TextStyle(fontSize: 9,
                fontWeight: FontWeight.w700, color: _C.textHint, letterSpacing: 0.8)),
              const SizedBox(width: 8),
              _inlineTab('opportunity', '⚡ AI Score', _sortBy,
                (v) => setState(() => _sortBy = v)),
              const SizedBox(width: 5),
              _inlineTab('revenue', '\$ Revenue', _sortBy,
                (v) => setState(() => _sortBy = v)),
              const SizedBox(width: 5),
              _inlineTab('sold', '📦 Sold', _sortBy,
                (v) => setState(() => _sortBy = v)),
              const SizedBox(width: 5),
              _inlineTab('price', '💲 Price', _sortBy,
                (v) => setState(() => _sortBy = v)),
              Container(height: 20, width: 1, color: _C.border,
                margin: const EdgeInsets.symmetric(horizontal: 10)),
              const Text('TREND', style: TextStyle(fontSize: 9,
                fontWeight: FontWeight.w700, color: _C.textHint, letterSpacing: 0.8)),
              const SizedBox(width: 8),
              _inlineTab('all', 'All', _filterTrend,
                (v) => setState(() => _filterTrend = v)),
              const SizedBox(width: 5),
              _inlineTab('rising', '📈 Rising', _filterTrend,
                (v) => setState(() => _filterTrend = v)),
              const SizedBox(width: 5),
              _inlineTab('stable', '➡️ Stable', _filterTrend,
                (v) => setState(() => _filterTrend = v)),
              const SizedBox(width: 5),
              _inlineTab('fading', '📉 Fading', _filterTrend,
                (v) => setState(() => _filterTrend = v)),
            ]),
          ),
        ]),
      ),

      // Table header
      Container(
        color: _C.bg,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(children: [
          const SizedBox(width: 36),
          const SizedBox(width: 56),
          const SizedBox(width: 10),
          const Expanded(flex: 5, child: _H('PRODUCT', left: true)),
          const Expanded(flex: 2, child: _H('TREND')),
          const Expanded(flex: 2, child: _H('SOLD')),
          const Expanded(flex: 1, child: _H('WATCH')),
          const Expanded(flex: 2, child: _H('PRICE')),
          const Expanded(flex: 1, child: _H('SCORE')),
          const Expanded(flex: 3, child: _H('ACTIONS')),
        ]),
      ),
      const Divider(height: 1, color: _C.border),

      // Product rows
      Expanded(
        child: list.isEmpty
          ? Center(child: Text('No products match',
              style: const TextStyle(fontSize: 14, color: _C.textSec)))
          : ListView.builder(
              itemCount: list.length,
              itemBuilder: (ctx, i) {
                final p = list[i];
                return _ProductRow(
                  product: p,
                  isSaved: _savedIds.contains(p.itemId),
                  onSave: () => _toggleSave(p),
                  onCopyTitle: () {
                    final kws = p.topKeywords.take(4).join(' ');
                    final full = '${p.title} $kws'.trim();
                    Clipboard.setData(ClipboardData(
                      text: full.length > 80 ? full.substring(0, 80) : full));
                    _snack('Title copied!');
                  },
                  onCalculatePrice: () => _showPriceCalc(p),
                ).animate(delay: Duration(milliseconds: 25 * i))
                 .fadeIn(duration: 180.ms);
              },
            ),
      ),
    ]);
  }

  // ── Gap tab ──
  Widget _gapTab() {
    final gaps = _result!.gaps;
    if (gaps.isEmpty) {
      return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        const Icon(Icons.check_circle_outline_rounded, color: _C.success, size: 44),
        const SizedBox(height: 10),
        Text('No major gaps found', style: GoogleFonts.spaceGrotesk(
          fontSize: 15, fontWeight: FontWeight.w600, color: _C.textPri)),
        const SizedBox(height: 5),
        const Text('This seller covers most high-demand categories',
          style: TextStyle(fontSize: 13, color: _C.textSec)),
      ]));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: gaps.length,
      itemBuilder: (ctx, i) => _GapCard(gap: gaps[i])
        .animate(delay: Duration(milliseconds: 60 * i)).fadeIn(duration: 220.ms),
    );
  }

  // ── Keywords tab ──
  Widget _keywordsTab() {
    final kws = _result!.topKeywords;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(color: _C.accentDim,
              borderRadius: BorderRadius.circular(10)),
            child: const Icon(Icons.key_rounded, color: _C.accent, size: 18),
          ),
          const SizedBox(width: 12),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Keyword Radar', style: GoogleFonts.spaceGrotesk(
              fontSize: 14, fontWeight: FontWeight.w700, color: _C.textPri)),
            const Text('Top keywords from this seller\'s titles',
              style: TextStyle(fontSize: 11, color: _C.textSec)),
          ]),
          const Spacer(),
          GestureDetector(
            onTap: () {
              Clipboard.setData(ClipboardData(text: kws.join(', ')));
              _snack('All keywords copied!');
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
              decoration: BoxDecoration(
                color: _C.white, borderRadius: BorderRadius.circular(8),
                border: Border.all(color: _C.border)),
              child: const Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.copy_rounded, size: 13, color: _C.textSec),
                SizedBox(width: 5),
                Text('Copy all', style: TextStyle(fontSize: 12, color: _C.textSec)),
              ]),
            ),
          ),
        ]),
        const SizedBox(height: 18),
        Wrap(spacing: 8, runSpacing: 8,
          children: kws.asMap().entries.map((e) {
            final rank = e.key;
            final kw   = e.value;
            final big  = rank < 3;
            return GestureDetector(
              onTap: () { Clipboard.setData(ClipboardData(text: kw)); _snack('"$kw" copied'); },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: big ? _C.accentDim : _C.bg,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: big ? _C.accent : _C.border)),
                child: Text(kw, style: TextStyle(
                  fontSize: big ? 14 : 12,
                  fontWeight: big ? FontWeight.w700 : FontWeight.w500,
                  color: big ? _C.accent : _C.textSec)),
              ),
            ).animate(delay: Duration(milliseconds: 25 * rank)).fadeIn(duration: 180.ms);
          }).toList(),
        ),
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: _C.accentDim, borderRadius: BorderRadius.circular(10),
            border: Border.all(color: _C.accent.withOpacity(0.3))),
          child: const Row(children: [
            Icon(Icons.lightbulb_outline_rounded, color: _C.accent, size: 16),
            SizedBox(width: 10),
            Expanded(child: Text(
              'Use these keywords in your eBay listing titles to rank higher in search results.',
              style: TextStyle(fontSize: 12, color: _C.textSec, height: 1.5))),
          ]),
        ),
      ]),
    );
  }

  // ── Price tab ──
  Widget _priceTab() {
    final products = _result!.products;
    if (products.isEmpty) {
      return const Center(child: Text('No price data',
        style: TextStyle(fontSize: 14, color: _C.textSec)));
    }
    final prices = products.map((p) => p.price).toList()..sort();
    final avg = prices.reduce((a, b) => a + b) / prices.length;
    final min = prices.first;
    final max = prices.last;
    final buckets = <String, int>{
      '\$0–25': 0, '\$25–50': 0, '\$50–100': 0, '\$100–200': 0, '\$200+': 0};
    for (final p in prices) {
      if (p < 25)       buckets['\$0–25']    = buckets['\$0–25']!    + 1;
      else if (p < 50)  buckets['\$25–50']   = buckets['\$25–50']!   + 1;
      else if (p < 100) buckets['\$50–100']  = buckets['\$50–100']!  + 1;
      else if (p < 200) buckets['\$100–200'] = buckets['\$100–200']! + 1;
      else              buckets['\$200+']    = buckets['\$200+']!    + 1;
    }
    final maxB = buckets.values.reduce((a, b) => a > b ? a : b).toDouble();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          _priceStat('Min Price', '\$${min.toStringAsFixed(2)}', _C.success),
          const SizedBox(width: 10),
          _priceStat('Avg Price', '\$${avg.toStringAsFixed(2)}', _C.accent),
          const SizedBox(width: 10),
          _priceStat('Max Price', '\$${max.toStringAsFixed(2)}', _C.error),
        ]),
        const SizedBox(height: 20),
        Text('Price Distribution', style: GoogleFonts.spaceGrotesk(
          fontSize: 14, fontWeight: FontWeight.w700, color: _C.textPri)),
        const SizedBox(height: 4),
        const Text('How many products fall into each price range',
          style: TextStyle(fontSize: 11, color: _C.textSec)),
        const SizedBox(height: 14),
        SizedBox(
          height: 180,
          child: BarChart(BarChartData(
            backgroundColor: Colors.transparent,
            gridData: FlGridData(show: true, drawVerticalLine: false,
              getDrawingHorizontalLine: (_) =>
                const FlLine(color: _C.border, strokeWidth: 0.5)),
            borderData: FlBorderData(show: false),
            titlesData: FlTitlesData(
              topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
              bottomTitles: AxisTitles(sideTitles: SideTitles(
                showTitles: true, reservedSize: 26,
                getTitlesWidget: (v, _) {
                  final labels = buckets.keys.toList();
                  if (v.toInt() < labels.length) {
                    return Padding(padding: const EdgeInsets.only(top: 5),
                      child: Text(labels[v.toInt()],
                        style: const TextStyle(fontSize: 9, color: _C.textSec)));
                  }
                  return const SizedBox();
                },
              )),
              leftTitles: AxisTitles(sideTitles: SideTitles(
                showTitles: true, reservedSize: 28,
                getTitlesWidget: (v, _) => Text(v.toInt().toString(),
                  style: const TextStyle(fontSize: 9, color: _C.textSec)),
              )),
            ),
            barGroups: buckets.values.toList().asMap().entries.map((e) =>
              BarChartGroupData(x: e.key, barRods: [
                BarChartRodData(
                  toY: e.value.toDouble(), color: _C.accent,
                  width: 32, borderRadius: BorderRadius.circular(4),
                  backDrawRodData: BackgroundBarChartRodData(
                    show: true, toY: maxB,
                    color: _C.border.withOpacity(0.3)),
                ),
              ])).toList(),
          )),
        ),
        const SizedBox(height: 18),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: _C.accentDim, borderRadius: BorderRadius.circular(10),
            border: Border.all(color: _C.accent.withOpacity(0.3))),
          child: Row(children: [
            const Icon(Icons.lightbulb_outline_rounded, color: _C.accent, size: 16),
            const SizedBox(width: 10),
            Expanded(child: RichText(text: TextSpan(
              style: const TextStyle(fontSize: 12, color: _C.textSec, height: 1.5),
              children: [
                const TextSpan(text: 'Sweet spot for entry: '),
                TextSpan(
                  text: '\$${(avg * 0.85).toStringAsFixed(0)} – \$${(avg * 1.15).toStringAsFixed(0)}',
                  style: const TextStyle(color: _C.accent, fontWeight: FontWeight.w700)),
                const TextSpan(text: '. Slightly undercuts the average while staying competitive.'),
              ],
            ))),
          ]),
        ),
      ]),
    );
  }

  // ── Price calc bottom sheet ──
  void _showPriceCalc(ScannedProduct p) {
    showModalBottomSheet(
      context: context,
      backgroundColor: _C.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _PriceCalcSheet(product: p),
    );
  }

  // ── Inline tab widget ──
  Widget _inlineTab(String value, String label, String current,
      Function(String) onTap) {
    final active = current == value;
    return GestureDetector(
      onTap: () => onTap(value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 130),
        padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 6),
        decoration: BoxDecoration(
          color: active ? _C.accentDim : _C.white,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(
            color: active ? _C.accent : _C.border,
            width: active ? 1.5 : 1)),
        child: Text(label, style: TextStyle(
          fontSize: 12,
          fontWeight: active ? FontWeight.w700 : FontWeight.w500,
          color: active ? _C.accent : _C.textSec)),
      ),
    );
  }

  // ── Helpers ──
  Widget _priceStat(String label, String value, Color color) => Expanded(
    child: Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: _C.white, borderRadius: BorderRadius.circular(10),
        border: Border.all(color: _C.border)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: const TextStyle(fontSize: 11, color: _C.textSec)),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: color)),
      ]),
    ),
  );

  String _fmt(double n) {
    if (n >= 1000000) return '${(n / 1000000).toStringAsFixed(1)}M';
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(1)}K';
    return n.toStringAsFixed(0);
  }
  String _fmtInt(int n) {
    if (n >= 1000000) return '${(n / 1000000).toStringAsFixed(1)}M';
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(1)}K';
    return n.toString();
  }
  String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'Scanned just now';
    if (diff.inMinutes < 60) return 'Scanned ${diff.inMinutes}m ago';
    if (diff.inHours < 24) return 'Scanned ${diff.inHours}h ago';
    return 'Scanned ${diff.inDays}d ago';
  }
}

// ══════════════════════════════════════════════
// TABLE HEADER CELL
// ══════════════════════════════════════════════

class _H extends StatelessWidget {
  final String text;
  final bool left;
  const _H(this.text, {this.left = false});

  @override
  Widget build(BuildContext context) => Text(text,
    textAlign: left ? TextAlign.left : TextAlign.center,
    style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w700,
      color: _C.textHint, letterSpacing: 0.7));
}

// ══════════════════════════════════════════════
// PRODUCT ROW
// ══════════════════════════════════════════════

class _ProductRow extends StatefulWidget {
  final ScannedProduct product;
  final bool isSaved;
  final VoidCallback onSave;
  final VoidCallback onCopyTitle;
  final VoidCallback onCalculatePrice;

  const _ProductRow({
    required this.product,
    required this.isSaved,
    required this.onSave,
    required this.onCopyTitle,
    required this.onCalculatePrice,
  });

  @override
  State<_ProductRow> createState() => _ProductRowState();
}

class _ProductRowState extends State<_ProductRow> {
  bool _hover    = false;
  bool _expanded = false;

  Color get _scoreColor {
    final s = widget.product.opportunityScore;
    if (s >= 8) return _C.accent;
    if (s >= 6) return _C.blue;
    if (s >= 4) return _C.warning;
    return _C.error;
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.product;
    final trendColor = p.trend == 'rising' ? _C.success
        : p.trend == 'fading' ? _C.error : _C.warning;

    return MouseRegion(
      onEnter: (_) => setState(() => _hover = true),
      onExit:  (_) => setState(() => _hover = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 120),
        decoration: BoxDecoration(
          color: _hover ? _C.bg : _C.white,
          border: const Border(bottom: BorderSide(color: _C.border))),
        child: Column(children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(crossAxisAlignment: CrossAxisAlignment.center, children: [

              // Checkbox
              SizedBox(width: 36, child: GestureDetector(
                onTap: widget.onSave,
                child: Container(
                  width: 18, height: 18,
                  decoration: BoxDecoration(
                    color: widget.isSaved ? _C.accent : _C.white,
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(
                      color: widget.isSaved ? _C.accent : _C.border,
                      width: 1.5)),
                  child: widget.isSaved
                    ? const Icon(Icons.check_rounded, size: 12, color: Colors.white)
                    : null,
                ),
              )),

              // Image
              Container(
                width: 56, height: 56,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  color: _C.bg,
                  border: Border.all(color: _C.border),
                  image: p.imageUrl != null
                    ? DecorationImage(image: NetworkImage(p.imageUrl!),
                        fit: BoxFit.cover) : null,
                ),
                child: p.imageUrl == null
                  ? const Icon(Icons.inventory_2_outlined, size: 20, color: _C.textHint)
                  : null,
              ),
              const SizedBox(width: 10),

              // Title + badges
              Expanded(flex: 5, child: Column(
                crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(p.title,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500,
                    color: _C.textPri, height: 1.4),
                  maxLines: 2, overflow: TextOverflow.ellipsis),
                if (p.category != null) ...[
                  const SizedBox(height: 2),
                  Text(p.category!, style: const TextStyle(fontSize: 10, color: _C.textHint)),
                ],
                const SizedBox(height: 3),
                Row(children: [
                  _tag(p.condition, _C.textSec, _C.bg),
                  if (p.freeShipping) ...[
                    const SizedBox(width: 4),
                    _tag('Free Ship', _C.success, const Color(0xFFDCFCE7)),
                  ],
                ]),
              ])),

              // Trend sparkline
              Expanded(flex: 2, child: Center(child: _Sparkline(trend: p.trend, itemId: p.itemId))),

              // Sold
              Expanded(flex: 2, child: Center(child: Column(children: [
                Text(p.soldCount.toString(), style: const TextStyle(
                  fontSize: 13, fontWeight: FontWeight.w700, color: _C.textPri)),
                const Text('sold', style: TextStyle(fontSize: 9, color: _C.textHint)),
              ]))),

              // Watch
              Expanded(flex: 1, child: Center(child: Row(
                mainAxisSize: MainAxisSize.min, children: [
                  const Icon(Icons.visibility_outlined, size: 11, color: _C.textHint),
                  const SizedBox(width: 2),
                  Text(p.watchCount.toString(), style: const TextStyle(
                    fontSize: 11, fontWeight: FontWeight.w600, color: _C.textSec)),
                ],
              ))),

              // Price
              Expanded(flex: 2, child: Center(child: Text(
                '\$${p.price.toStringAsFixed(2)}',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700,
                    color: _C.textPri)))),

              // AI Score
              Expanded(flex: 1, child: Center(child: Container(
                width: 34, height: 34,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _scoreColor.withOpacity(0.1),
                  border: Border.all(color: _scoreColor, width: 1.5)),
                child: Center(child: Text(p.opportunityScore.toString(),
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700,
                      color: _scoreColor))),
              ))),

              // Actions
              Expanded(flex: 3, child: Row(
                mainAxisAlignment: MainAxisAlignment.center, children: [
                _iconBtn(Icons.calculate_outlined, 'Price calc', widget.onCalculatePrice),
                const SizedBox(width: 4),
                _iconBtn(Icons.copy_rounded, 'Copy title', widget.onCopyTitle),
                const SizedBox(width: 4),
                _iconBtn(
                  _expanded ? Icons.expand_less_rounded : Icons.expand_more_rounded,
                  'Keywords', () => setState(() => _expanded = !_expanded)),
                const SizedBox(width: 4),
                GestureDetector(
                  onTap: widget.onSave,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 130),
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                    decoration: BoxDecoration(
                      color: widget.isSaved ? _C.accentDim : _C.white,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: widget.isSaved ? _C.accent : _C.border)),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      Icon(widget.isSaved
                        ? Icons.bookmark_rounded : Icons.bookmark_outline_rounded,
                        size: 12,
                        color: widget.isSaved ? _C.accent : _C.textSec),
                      const SizedBox(width: 3),
                      Text(widget.isSaved ? 'Saved' : 'Save',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600,
                          color: widget.isSaved ? _C.accent : _C.textSec)),
                    ]),
                  ),
                ),
              ])),
            ]),
          ),

          // Expanded keywords
          if (_expanded)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(122, 0, 16, 10),
              child: Wrap(spacing: 5, runSpacing: 5,
                children: p.topKeywords.map((kw) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                  decoration: BoxDecoration(
                    color: _C.accentDim, borderRadius: BorderRadius.circular(4)),
                  child: Text(kw, style: const TextStyle(
                    fontSize: 10, color: _C.accent, fontWeight: FontWeight.w500)),
                )).toList(),
              ),
            ).animate().fadeIn(duration: 140.ms),
        ]),
      ),
    );
  }

  Widget _tag(String label, Color color, Color bg) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
    decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(3)),
    child: Text(label, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: color)),
  );

  Widget _iconBtn(IconData icon, String tip, VoidCallback onTap) => Tooltip(
    message: tip,
    child: GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(5),
        decoration: BoxDecoration(
          color: _C.bg, borderRadius: BorderRadius.circular(5),
          border: Border.all(color: _C.border)),
        child: Icon(icon, size: 12, color: _C.textSec),
      ),
    ),
  );
}

// ══════════════════════════════════════════════
// SPARKLINE
// ══════════════════════════════════════════════

class _Sparkline extends StatelessWidget {
  final String trend;
  final String itemId;
  const _Sparkline({required this.trend, required this.itemId});

  @override
  Widget build(BuildContext context) {
    final random = math.Random(itemId.hashCode);
    final List<FlSpot> spots = [];

    double baseVelocity = trend == 'rising' ? 8.0
        : trend == 'fading' ? 3.0 : 5.5;
    double volatility = 0.3 + random.nextDouble() * 0.5;
    int phaseShift = random.nextInt(7);
    double dailyDrift = trend == 'rising'
        ? 0.04 + random.nextDouble() * 0.06
        : trend == 'fading'
            ? -(0.04 + random.nextDouble() * 0.06)
            : (random.nextDouble() - 0.5) * 0.04;

    for (int day = 0; day < 14; day++) {
      double cycle = ((day + phaseShift) % 7 >= 5) ? 1.35 : 0.85;
      double noise = 1.0 + ((random.nextDouble() - 0.5) * volatility);
      double drift = 1.0 + (day * dailyDrift);
      double y = baseVelocity * cycle * noise * drift;
      if (y < 0.5) y = 0.5 + random.nextDouble();
      spots.add(FlSpot(day.toDouble(), y));
    }

    double minY = spots.map((e) => e.y).reduce(math.min) * 0.5;
    double maxY = spots.map((e) => e.y).reduce(math.max) * 1.15;
    minY = minY.clamp(0.0, double.infinity);

    const neonGreen = Color(0xFF8FFF00);

    return Column(children: [
      SizedBox(
        height: 32,
        width: 75,
        child: LineChart(LineChartData(
          minY: minY,
          maxY: maxY,
          gridData: const FlGridData(show: false),
          titlesData: const FlTitlesData(show: false),
          borderData: FlBorderData(show: false),
          lineTouchData: const LineTouchData(enabled: false),
          lineBarsData: [
            LineChartBarData(
              spots: spots,
              isCurved: true,
              curveSmoothness: 0.35,
              color: neonGreen.withOpacity(0.9),
              barWidth: 1.8,
              isStrokeCapRound: true,
              dotData: const FlDotData(show: false),
              belowBarData: BarAreaData(
                show: true,
                color: neonGreen.withOpacity(0.08),
              ),
            ),
          ],
        )),
      ),
      const SizedBox(height: 3),
      Text(
        trend == 'rising' ? '📈 Rising'
            : trend == 'fading' ? '📉 Fading' : '➡️ Stable',
        style: TextStyle(
          fontSize: 9,
          fontWeight: FontWeight.w600,
          color: trend == 'rising'
              ? const Color(0xFF5CB800)
              : trend == 'fading'
                  ? const Color(0xFFDC2626)
                  : const Color(0xFFD97706),
        ),
      ),
    ]);
  }
}

// ══════════════════════════════════════════════
// GAP CARD
// ══════════════════════════════════════════════

class _GapCard extends StatelessWidget {
  final GapProduct gap;
  const _GapCard({required this.gap});

  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(bottom: 10),
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: _C.white, borderRadius: BorderRadius.circular(12),
      border: Border.all(color: _C.border)),
    child: Row(children: [
      Container(
        width: 46, height: 46,
        decoration: const BoxDecoration(color: _C.accentDim, shape: BoxShape.circle),
        child: Center(child: Text('${gap.estimatedDemand.toInt()}',
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800,
              color: _C.accent))),
      ),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(gap.title, style: const TextStyle(
          fontSize: 13, fontWeight: FontWeight.w600, color: _C.textPri)),
        const SizedBox(height: 3),
        Text(gap.reason, style: const TextStyle(
          fontSize: 11, color: _C.textSec, height: 1.5)),
      ])),
      const SizedBox(width: 12),
      Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
        const Text('Demand', style: TextStyle(fontSize: 9, color: _C.textHint)),
        const SizedBox(height: 4),
        SizedBox(width: 72, child: LinearProgressIndicator(
          value: gap.estimatedDemand / 100,
          backgroundColor: _C.border,
          valueColor: const AlwaysStoppedAnimation(_C.accent),
          borderRadius: BorderRadius.circular(2),
          minHeight: 5,
        )),
        const SizedBox(height: 3),
        Text(gap.category, style: const TextStyle(fontSize: 9, color: _C.textSec)),
      ]),
    ]),
  );
}

// ══════════════════════════════════════════════
// PRICE CALCULATOR SHEET
// ══════════════════════════════════════════════

class _PriceCalcSheet extends StatefulWidget {
  final ScannedProduct product;
  const _PriceCalcSheet({required this.product});

  @override
  State<_PriceCalcSheet> createState() => _PriceCalcSheetState();
}

class _PriceCalcSheetState extends State<_PriceCalcSheet> {
  final _ctrl = TextEditingController();
  double? _sell, _profit, _roi;

  void _calc() {
    final cost = double.tryParse(_ctrl.text);
    if (cost == null) return;
    final sell   = widget.product.price * 0.94;
    final fee    = sell * 0.1325 + 0.30;
    final profit = sell - cost - fee;
    final roi    = cost > 0 ? profit / cost * 100 : 0.0;
    setState(() { _sell = sell; _profit = profit; _roi = roi; });
  }

  @override
  Widget build(BuildContext context) => Padding(
    padding: EdgeInsets.only(
      left: 20, right: 20, top: 20,
      bottom: MediaQuery.of(context).viewInsets.bottom + 20),
    child: Column(mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start, children: [
      Center(child: Container(width: 32, height: 4,
        decoration: BoxDecoration(color: _C.border,
            borderRadius: BorderRadius.circular(2)))),
      const SizedBox(height: 16),
      Text('Price Undercut Calculator', style: GoogleFonts.spaceGrotesk(
        fontSize: 15, fontWeight: FontWeight.w700, color: _C.textPri)),
      const SizedBox(height: 3),
      Text('Competitor sells at \$${widget.product.price.toStringAsFixed(2)}',
        style: const TextStyle(fontSize: 12, color: _C.textSec)),
      const SizedBox(height: 14),
      const Text('Your sourcing cost (USD)',
        style: TextStyle(fontSize: 11, color: _C.textSec)),
      const SizedBox(height: 6),
      TextField(
        controller: _ctrl,
        keyboardType: TextInputType.number,
        onChanged: (_) => _calc(),
        style: GoogleFonts.spaceGrotesk(fontSize: 14, color: _C.textPri),
        decoration: InputDecoration(
          prefixText: '\$  ',
          filled: true, fillColor: _C.bg,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(9),
            borderSide: const BorderSide(color: _C.border)),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(9),
            borderSide: const BorderSide(color: _C.accent)),
        ),
      ),
      if (_sell != null) ...[
        const SizedBox(height: 16),
        Row(children: [
          _calcCard('Sell price', '\$${_sell!.toStringAsFixed(2)}', _C.accent),
          const SizedBox(width: 8),
          _calcCard('Net profit', '\$${_profit!.toStringAsFixed(2)}',
            _profit! >= 0 ? _C.success : _C.error),
          const SizedBox(width: 8),
          _calcCard('ROI', '${_roi!.toStringAsFixed(1)}%',
            _roi! >= 20 ? _C.success : _roi! >= 0 ? _C.warning : _C.error),
        ]),
        const SizedBox(height: 8),
        const Text('* Includes eBay final value fee (13.25%) + \$0.30',
          style: TextStyle(fontSize: 10, color: _C.textHint)),
      ],
    ]),
  );

  Widget _calcCard(String label, String value, Color color) => Expanded(
    child: Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(9),
        border: Border.all(color: color.withOpacity(0.2))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: const TextStyle(fontSize: 10, color: _C.textSec)),
        const SizedBox(height: 3),
        Text(value, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: color)),
      ]),
    ),
  );
}