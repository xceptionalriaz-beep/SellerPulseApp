// lib/pages/competitor_research/store_results_screen.dart
//
// SellerPulse — Store Scan Results Screen
// Shows: Store Overview, Best Sellers, AI Scores, Gap Finder,
//        Keyword Radar, Price Undercut Calculator, One-tap Save
// Depends on: competitor_service.dart

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:fl_chart/fl_chart.dart';
import 'services/competitor_service.dart';

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
class _C {
  static const bg = Color(0xFFF8FAFC);
  static const surface = Color(0xFF0F172A);
  static const surfaceHover = Color(0xFFF1F5F9);
  static const border = Color(0xFFE2E8F0);
  static const accent = Color(0xFF5CB800);
  static const accentDim = Color(0xFFE8FFB0);
  static const textPrimary = Color(0xFF0F172A);
  static const textSecondary = Color(0xFF64748B);
  static const textHint = Color(0xFF94A3B8);
  static const error = Color(0xFFFF4D6A);
  static const warning = Color(0xFFFFB800);
  static const rising = Color(0xFF00E5A0);
  static const risingDim = Color(0x2200E5A0);
  static const fadingDim = Color(0x33FF4D6A);
  static const warningDim = Color(0x33FFB800);
}

// ─────────────────────────────────────────────
// STORE RESULTS SCREEN
// ─────────────────────────────────────────────

class StoreResultsScreen extends StatefulWidget {
  final StoreScanResult result;
  const StoreResultsScreen({super.key, required this.result});

  @override
  State<StoreResultsScreen> createState() => _StoreResultsScreenState();
}

class _StoreResultsScreenState extends State<StoreResultsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _service = CompetitorService();

  // Filter state
  String _sortBy = 'opportunity'; // opportunity / revenue / sold / price
  String _filterTrend = 'all';    // all / rising / stable / fading
  String _searchProducts = '';

  // Saved ideas tracker
  final Set<String> _savedIds = {};

  // Watchlist state
  bool _onWatchlist = false;
  bool _watchlistLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _checkWatchlist();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _checkWatchlist() async {
    final on = await _service.isOnWatchlist(
        widget.result.overview.username);
    if (mounted) {
      setState(() {
        _onWatchlist = on;
        _watchlistLoading = false;
      });
    }
  }

  Future<void> _toggleWatchlist() async {
    if (_onWatchlist) {
      await _service.removeFromWatchlist(
          widget.result.overview.username);
    } else {
      await _service.addToWatchlist(widget.result.overview);
    }
    setState(() => _onWatchlist = !_onWatchlist);
    _showSnack(_onWatchlist ? 'Added to watchlist' : 'Removed from watchlist');
  }

  Future<void> _toggleSave(ScannedProduct product) async {
    if (_savedIds.contains(product.itemId)) {
      await _service.removeFromListingIdeas(product.itemId);
      setState(() => _savedIds.remove(product.itemId));
      _showSnack('Removed from Listing Ideas');
    } else {
      await _service.saveToListingIdeas(product);
      setState(() => _savedIds.add(product.itemId));
      _showSnack('✓ Saved to Listing Ideas');
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg,
            style: GoogleFonts.inter(fontSize: 13, color: Colors.black)),
        backgroundColor: _C.accent,
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  // Filtered + sorted product list
  List<ScannedProduct> get _filteredProducts {
    var list = [...widget.result.products];

    // Search filter
    if (_searchProducts.isNotEmpty) {
      list = list
          .where((p) => p.title
              .toLowerCase()
              .contains(_searchProducts.toLowerCase()))
          .toList();
    }

    // Trend filter
    if (_filterTrend != 'all') {
      list = list.where((p) => p.trend == _filterTrend).toList();
    }

    // Sort
    switch (_sortBy) {
      case 'opportunity':
        list.sort((a, b) => b.opportunityScore.compareTo(a.opportunityScore));
        break;
      case 'revenue':
        list.sort((a, b) => b.revenue.compareTo(a.revenue));
        break;
      case 'sold':
        list.sort((a, b) => b.soldCount.compareTo(a.soldCount));
        break;
      case 'price':
        list.sort((a, b) => b.price.compareTo(a.price));
        break;
    }

    return list;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _C.bg,
      body: Column(
        children: [
          _buildTopBar(),
          _buildStoreOverviewCard(),
          _buildTabBar(),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildProductsTab(),
                _buildGapFinderTab(),
                _buildKeywordRadarTab(),
                _buildPriceAnalysisTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────
  // TOP BAR
  // ─────────────────────────────────────────────

  Widget _buildTopBar() {
    final o = widget.result.overview;
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 16),
      decoration: BoxDecoration(
        color: _C.surface,
        border: Border(bottom: BorderSide(color: _C.border)),
      ),
      child: Row(
        children: [
          // Back button
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: _C.bg,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: _C.border),
              ),
              child: const Icon(Icons.arrow_back_rounded,
                  size: 18, color: _C.textSecondary),
            ),
          ),
          const SizedBox(width: 16),

          // Store avatar + name
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: _C.accentDim,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(
              child: Text(
                o.username.isNotEmpty
                    ? o.username[0].toUpperCase()
                    : '?',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: _C.accent,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                o.storeName ?? o.username,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: _C.textPrimary,
                ),
              ),
              Text(
                'eBay • ${o.feedbackPercent.toStringAsFixed(1)}% positive feedback',
                style: GoogleFonts.inter(
                    fontSize: 12, color: _C.textSecondary),
              ),
            ],
          ),

          const Spacer(),

          // Scanned at
          Text(
            'Scanned ${_timeAgo(widget.result.scannedAt)}',
            style: GoogleFonts.inter(
                fontSize: 12, color: _C.textHint),
          ),
          const SizedBox(width: 16),

          // Watchlist button
          _watchlistLoading
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                      color: _C.accent, strokeWidth: 2))
              : _TopBarButton(
                  icon: _onWatchlist
                      ? Icons.visibility
                      : Icons.visibility_outlined,
                  label: _onWatchlist ? 'Watching' : 'Watch',
                  active: _onWatchlist,
                  onTap: _toggleWatchlist,
                ),
          const SizedBox(width: 8),

          // Open in eBay
          _TopBarButton(
            icon: Icons.open_in_new_rounded,
            label: 'View Store',
            active: false,
            onTap: () {
              // Launch URL — add url_launcher if needed
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(o.storeUrl ?? ''),
                  backgroundColor: _C.surface,
                ),
              );
            },
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  // ─────────────────────────────────────────────
  // STORE OVERVIEW CARD — 6 key metrics
  // ─────────────────────────────────────────────

  Widget _buildStoreOverviewCard() {
    final o = widget.result.overview;
    final metrics = [
      _Metric(
        label: 'Est. Revenue',
        value: '\$${_fmt(o.estimatedRevenue)}',
        icon: Icons.attach_money_rounded,
        color: _C.accent,
      ),
      _Metric(
        label: 'Total Sold',
        value: _fmtInt(o.totalSold),
        icon: Icons.shopping_bag_outlined,
        color: _C.rising,
      ),
      _Metric(
        label: 'Active Listings',
        value: _fmtInt(o.activeListings),
        icon: Icons.list_alt_rounded,
        color: const Color(0xFF60A5FA),
      ),
      _Metric(
        label: 'Avg Price',
        value: '\$${o.avgPrice.toStringAsFixed(2)}',
        icon: Icons.sell_outlined,
        color: const Color(0xFFA78BFA),
      ),
      _Metric(
        label: 'Sell-Through',
        value: '${o.sellThroughRate.toStringAsFixed(1)}%',
        icon: Icons.trending_up_rounded,
        color: _C.warning,
      ),
      _Metric(
        label: 'Feedback',
        value: '${o.feedbackScore}',
        icon: Icons.star_rounded,
        color: const Color(0xFFFB923C),
      ),
    ];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        color: _C.surface,
        border: Border(bottom: BorderSide(color: _C.border)),
      ),
      child: Row(
        children: metrics.asMap().entries.map((entry) {
          final i = entry.key;
          final m = entry.value;
          return Expanded(
            child: Container(
              margin: EdgeInsets.only(right: i < metrics.length - 1 ? 10 : 0),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: _C.bg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: _C.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(m.icon, size: 14, color: m.color),
                      const SizedBox(width: 6),
                      Text(
                        m.label,
                        style: GoogleFonts.inter(
                            fontSize: 11, color: _C.textSecondary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    m.value,
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: m.color,
                    ),
                  ),
                ],
              ),
            )
                .animate(delay: Duration(milliseconds: 60 * i))
                .fadeIn(duration: 300.ms)
                .slideY(begin: 0.05, end: 0),
          );
        }).toList(),
      ),
    );
  }

  // ─────────────────────────────────────────────
  // TAB BAR
  // ─────────────────────────────────────────────

  Widget _buildTabBar() {
    return Container(
      color: _C.surface,
      child: TabBar(
        controller: _tabController,
        labelStyle: GoogleFonts.spaceGrotesk(
            fontSize: 13, fontWeight: FontWeight.w600),
        unselectedLabelStyle:
            GoogleFonts.inter(fontSize: 13),
        labelColor: _C.accent,
        unselectedLabelColor: _C.textSecondary,
        indicatorColor: _C.accent,
        indicatorSize: TabBarIndicatorSize.label,
        indicatorWeight: 2,
        dividerColor: _C.border,
        tabs: [
          Tab(
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              const Icon(Icons.inventory_2_outlined, size: 15),
              const SizedBox(width: 6),
              Text('Products (${widget.result.products.length})'),
            ]),
          ),
          Tab(
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              const Icon(Icons.manage_search_rounded, size: 15),
              const SizedBox(width: 6),
              Text('Gap Finder (${widget.result.gaps.length})'),
            ]),
          ),
          const Tab(
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.key_rounded, size: 15),
              SizedBox(width: 6),
              Text('Keywords'),
            ]),
          ),
          const Tab(
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.price_change_outlined, size: 15),
              SizedBox(width: 6),
              Text('Price Analysis'),
            ]),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────
  // TAB 1 — PRODUCTS
  // ─────────────────────────────────────────────

  Widget _buildProductsTab() {
    final products = _filteredProducts;

    return Column(
      children: [
        // Filter bar
        Container(
          padding: const EdgeInsets.fromLTRB(24, 14, 24, 14),
          decoration: BoxDecoration(
            color: _C.bg,
            border: Border(bottom: BorderSide(color: _C.border)),
          ),
          child: Row(
            children: [
              // Search
              Expanded(
                flex: 3,
                child: Container(
                  height: 38,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: _C.surface,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: _C.border),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.search_rounded,
                          size: 16, color: _C.textHint),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          onChanged: (v) =>
                              setState(() => _searchProducts = v),
                          style: GoogleFonts.inter(
                              fontSize: 13, color: _C.textPrimary),
                          decoration: InputDecoration(
                            hintText: 'Search products...',
                            hintStyle: GoogleFonts.inter(
                                fontSize: 13, color: _C.textHint),
                            border: InputBorder.none,
                            isDense: true,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),

              // Sort
              _FilterChip(
                label: 'Sort: ${_sortLabel(_sortBy)}',
                icon: Icons.sort_rounded,
                onTap: _showSortSheet,
              ),
              const SizedBox(width: 8),

              // Trend filter
              _FilterChip(
                label: _filterTrend == 'all'
                    ? 'All trends'
                    : _filterTrend.capitalize(),
                icon: Icons.trending_up_rounded,
                active: _filterTrend != 'all',
                onTap: _showTrendFilter,
              ),

              const SizedBox(width: 8),

              // Count
              Text(
                '${products.length} products',
                style: GoogleFonts.inter(
                    fontSize: 12, color: _C.textHint),
              ),
            ],
          ),
        ),

        // Product list
        Expanded(
          child: products.isEmpty
              ? Center(
                  child: Text('No products match your filters',
                      style: GoogleFonts.inter(
                          fontSize: 14, color: _C.textSecondary)),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(24),
                  itemCount: products.length,
                  itemBuilder: (context, index) {
                    final product = products[index];
                    return _ProductCard(
                      product: product,
                      isSaved: _savedIds.contains(product.itemId),
                      onSave: () => _toggleSave(product),
                      onCopyTitle: () => _copyTitle(product),
                      onCalculatePrice: () =>
                          _showPriceCalculator(context, product),
                    )
                        .animate(
                            delay: Duration(milliseconds: 40 * index))
                        .fadeIn(duration: 250.ms)
                        .slideY(begin: 0.03, end: 0);
                  },
                ),
        ),
      ],
    );
  }

  // ─────────────────────────────────────────────
  // TAB 2 — GAP FINDER
  // ─────────────────────────────────────────────

  Widget _buildGapFinderTab() {
    final gaps = widget.result.gaps;

    return gaps.isEmpty
        ? Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.check_circle_outline_rounded,
                    color: _C.rising, size: 48),
                const SizedBox(height: 12),
                Text('No major gaps found',
                    style: GoogleFonts.spaceGrotesk(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: _C.textPrimary)),
                const SizedBox(height: 8),
                Text('This seller covers most high-demand categories',
                    style: GoogleFonts.inter(
                        fontSize: 13, color: _C.textSecondary)),
              ],
            ),
          )
        : ListView.builder(
            padding: const EdgeInsets.all(24),
            itemCount: gaps.length,
            itemBuilder: (context, index) {
              final gap = gaps[index];
              return _GapCard(gap: gap)
                  .animate(delay: Duration(milliseconds: 80 * index))
                  .fadeIn(duration: 300.ms)
                  .slideY(begin: 0.04, end: 0);
            },
          );
  }

  // ─────────────────────────────────────────────
  // TAB 3 — KEYWORD RADAR
  // ─────────────────────────────────────────────

  Widget _buildKeywordRadarTab() {
    final keywords = widget.result.topKeywords;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: _C.accentDim,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.key_rounded,
                    color: _C.accent, size: 20),
              ),
              const SizedBox(width: 14),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Keyword Radar',
                      style: GoogleFonts.spaceGrotesk(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: _C.textPrimary)),
                  Text(
                      'Top keywords extracted from this seller\'s titles',
                      style: GoogleFonts.inter(
                          fontSize: 12, color: _C.textSecondary)),
                ],
              ),
              const Spacer(),
              _ActionButton(
                icon: Icons.copy_rounded,
                label: 'Copy all',
                onTap: () {
                  Clipboard.setData(
                      ClipboardData(text: keywords.join(', ')));
                  _showSnack('Keywords copied to clipboard');
                },
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Keyword chips — sized by frequency rank
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: keywords.asMap().entries.map((entry) {
              final rank = entry.key;
              final kw = entry.value;
              final size = rank < 3
                  ? 15.0
                  : rank < 8
                      ? 13.0
                      : 12.0;
              final opacity = 1.0 - (rank * 0.035);

              return GestureDetector(
                onTap: () {
                  Clipboard.setData(ClipboardData(text: kw));
                  _showSnack('"$kw" copied');
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: Color.lerp(
                        _C.accentDim, _C.surface, rank / keywords.length),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: _C.accent
                          .withOpacity(opacity.clamp(0.1, 0.6)),
                    ),
                  ),
                  child: Text(
                    kw,
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: size,
                      fontWeight: rank < 5
                          ? FontWeight.w600
                          : FontWeight.w500,
                      color: _C.textPrimary
                          .withOpacity(opacity.clamp(0.5, 1.0)),
                    ),
                  ),
                ),
              )
                  .animate(
                      delay: Duration(milliseconds: 40 * rank))
                  .fadeIn(duration: 250.ms)
                  .scale(begin: const Offset(0.9, 0.9));
            }).toList(),
          ),

          const SizedBox(height: 32),

          // Use in your listings tip
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: _C.accentDim,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                  color: _C.accent.withOpacity(0.2)),
            ),
            child: Row(
              children: [
                const Icon(Icons.lightbulb_outline_rounded,
                    color: _C.accent, size: 20),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(
                    'Use these keywords in your eBay listing titles to rank higher in search results. '
                    'The top keywords are what buyers are already searching for in this niche.',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: _C.textSecondary,
                      height: 1.6,
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

  // ─────────────────────────────────────────────
  // TAB 4 — PRICE ANALYSIS
  // ─────────────────────────────────────────────

  Widget _buildPriceAnalysisTab() {
    final products = widget.result.products;
    if (products.isEmpty) {
      return Center(
        child: Text('No price data available',
            style: GoogleFonts.inter(
                fontSize: 14, color: _C.textSecondary)),
      );
    }

    final prices = products.map((p) => p.price).toList()..sort();
    final avgPrice = prices.reduce((a, b) => a + b) / prices.length;
    final minPrice = prices.first;
    final maxPrice = prices.last;

    // Price buckets for chart
    final buckets = <String, int>{
      '\$0–25': 0,
      '\$25–50': 0,
      '\$50–100': 0,
      '\$100–200': 0,
      '\$200+': 0,
    };
    for (final p in prices) {
      if (p < 25) buckets['\$0–25'] = buckets['\$0–25']! + 1;
      else if (p < 50) buckets['\$25–50'] = buckets['\$25–50']! + 1;
      else if (p < 100) buckets['\$50–100'] = buckets['\$50–100']! + 1;
      else if (p < 200) buckets['\$100–200'] = buckets['\$100–200']! + 1;
      else buckets['\$200+'] = buckets['\$200+']! + 1;
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Price summary cards
          Row(
            children: [
              _PriceStatCard(
                  label: 'Min Price', value: '\$${minPrice.toStringAsFixed(2)}',
                  color: _C.rising),
              const SizedBox(width: 12),
              _PriceStatCard(
                  label: 'Avg Price', value: '\$${avgPrice.toStringAsFixed(2)}',
                  color: _C.accent),
              const SizedBox(width: 12),
              _PriceStatCard(
                  label: 'Max Price', value: '\$${maxPrice.toStringAsFixed(2)}',
                  color: _C.error),
            ],
          ).animate().fadeIn(duration: 300.ms),

          const SizedBox(height: 28),

          Text('Price Distribution',
              style: GoogleFonts.spaceGrotesk(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: _C.textPrimary)),
          const SizedBox(height: 4),
          Text('How many products fall into each price range',
              style: GoogleFonts.inter(
                  fontSize: 12, color: _C.textSecondary)),
          const SizedBox(height: 20),

          // Bar chart
          SizedBox(
            height: 200,
            child: BarChart(
              BarChartData(
                backgroundColor: Colors.transparent,
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  getDrawingHorizontalLine: (_) => FlLine(
                    color: _C.border,
                    strokeWidth: 0.5,
                  ),
                ),
                borderData: FlBorderData(show: false),
                titlesData: FlTitlesData(
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, _) {
                        final labels = buckets.keys.toList();
                        if (value.toInt() < labels.length) {
                          return Padding(
                            padding: const EdgeInsets.only(top: 6),
                            child: Text(
                              labels[value.toInt()],
                              style: GoogleFonts.inter(
                                  fontSize: 10,
                                  color: _C.textSecondary),
                            ),
                          );
                        }
                        return const SizedBox();
                      },
                      reservedSize: 28,
                    ),
                  ),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 32,
                      getTitlesWidget: (value, _) => Text(
                        value.toInt().toString(),
                        style: GoogleFonts.inter(
                            fontSize: 10, color: _C.textSecondary),
                      ),
                    ),
                  ),
                  topTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false)),
                ),
                barGroups: buckets.values
                    .toList()
                    .asMap()
                    .entries
                    .map(
                      (e) => BarChartGroupData(
                        x: e.key,
                        barRods: [
                          BarChartRodData(
                            toY: e.value.toDouble(),
                            color: _C.accent,
                            width: 32,
                            borderRadius: BorderRadius.circular(4),
                            backDrawRodData: BackgroundBarChartRodData(
                              show: true,
                              toY: (buckets.values
                                      .reduce((a, b) => a > b ? a : b))
                                  .toDouble(),
                              color: _C.border.withOpacity(0.3),
                            ),
                          ),
                        ],
                      ),
                    )
                    .toList(),
              ),
            ).animate().fadeIn(delay: 100.ms, duration: 400.ms),
          ),

          const SizedBox(height: 32),

          // Sweet spot insight
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: _C.accentDim,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _C.accent.withOpacity(0.2)),
            ),
            child: Row(
              children: [
                const Icon(Icons.lightbulb_outline_rounded,
                    color: _C.accent, size: 20),
                const SizedBox(width: 14),
                Expanded(
                  child: RichText(
                    text: TextSpan(
                      style: GoogleFonts.inter(
                          fontSize: 13,
                          color: _C.textSecondary,
                          height: 1.6),
                      children: [
                        const TextSpan(
                            text:
                                'Sweet spot for entry: price between '),
                        TextSpan(
                          text:
                              '\$${(avgPrice * 0.85).toStringAsFixed(0)} – \$${(avgPrice * 1.15).toStringAsFixed(0)}',
                          style: const TextStyle(
                              color: _C.accent,
                              fontWeight: FontWeight.w600),
                        ),
                        const TextSpan(
                            text:
                                '. This undercuts the average slightly while staying competitive.'),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ).animate().fadeIn(delay: 200.ms, duration: 300.ms),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────

  void _copyTitle(ScannedProduct product) {
    // Generate optimized title using keywords
    final keywords = product.topKeywords.take(5).join(' ');
    final optimizedTitle =
        '${product.title} $keywords'.trim().substring(
              0,
              ('${product.title} $keywords'.trim().length)
                  .clamp(0, 80),
            );
    Clipboard.setData(ClipboardData(text: optimizedTitle));
    _showSnack('Optimized title copied!');
  }

  void _showPriceCalculator(
      BuildContext context, ScannedProduct product) {
    showModalBottomSheet(
      context: context,
      backgroundColor: _C.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      isScrollControlled: true,
      builder: (_) => _PriceCalculatorSheet(product: product),
    );
  }

  void _showSortSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: _C.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _SortSheet(
        current: _sortBy,
        onSelect: (v) {
          setState(() => _sortBy = v);
          Navigator.pop(context);
        },
      ),
    );
  }

  void _showTrendFilter() {
    showModalBottomSheet(
      context: context,
      backgroundColor: _C.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _TrendFilterSheet(
        current: _filterTrend,
        onSelect: (v) {
          setState(() => _filterTrend = v);
          Navigator.pop(context);
        },
      ),
    );
  }

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

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

  String _sortLabel(String s) {
    switch (s) {
      case 'opportunity': return 'AI Score';
      case 'revenue': return 'Revenue';
      case 'sold': return 'Sold';
      case 'price': return 'Price';
      default: return s;
    }
  }

  String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }
}

// ─────────────────────────────────────────────
// PRODUCT CARD WIDGET
// ─────────────────────────────────────────────

class _ProductCard extends StatefulWidget {
  final ScannedProduct product;
  final bool isSaved;
  final VoidCallback onSave;
  final VoidCallback onCopyTitle;
  final VoidCallback onCalculatePrice;

  const _ProductCard({
    required this.product,
    required this.isSaved,
    required this.onSave,
    required this.onCopyTitle,
    required this.onCalculatePrice,
  });

  @override
  State<_ProductCard> createState() => _ProductCardState();
}

class _ProductCardState extends State<_ProductCard> {
  bool _expanded = false;
  bool _hovering = false;

  @override
  Widget build(BuildContext context) {
    final p = widget.product;
    final trendColor = p.trend == 'rising'
        ? _C.rising
        : p.trend == 'fading'
            ? _C.error
            : _C.warning;
    final trendBg = p.trend == 'rising'
        ? _C.risingDim
        : p.trend == 'fading'
            ? _C.fadingDim
            : _C.warningDim;

    return MouseRegion(
      onEnter: (_) => setState(() => _hovering = true),
      onExit: (_) => setState(() => _hovering = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: _hovering ? _C.surfaceHover : _C.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: _hovering ? _C.accent.withOpacity(0.3) : _C.border,
          ),
        ),
        child: Column(
          children: [
            // Main row
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Product image / placeholder
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: _C.bg,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: _C.border),
                      image: p.imageUrl != null
                          ? DecorationImage(
                              image: NetworkImage(p.imageUrl!),
                              fit: BoxFit.cover,
                            )
                          : null,
                    ),
                    child: p.imageUrl == null
                        ? const Icon(Icons.inventory_2_outlined,
                            size: 24, color: _C.textHint)
                        : null,
                  ),
                  const SizedBox(width: 14),

                  // Title + badges
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          p.title,
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            color: _C.textPrimary,
                            height: 1.4,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            // Trend badge
                            _Badge(
                              label: p.trend.capitalize(),
                              color: trendColor,
                              bg: trendBg,
                            ),
                            const SizedBox(width: 6),
                            // Condition
                            _Badge(
                              label: p.condition,
                              color: _C.textSecondary,
                              bg: _C.bg,
                            ),
                            const SizedBox(width: 6),
                            if (p.freeShipping)
                              _Badge(
                                label: 'Free Ship',
                                color: _C.rising,
                                bg: _C.risingDim,
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 14),

                  // AI Score + metrics
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      // AI Score
                      _ScoreCircle(score: p.opportunityScore),
                      const SizedBox(height: 8),
                      Text(
                        '\$${p.price.toStringAsFixed(2)}',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: _C.textPrimary,
                        ),
                      ),
                      Text(
                        '${p.soldCount} sold',
                        style: GoogleFonts.inter(
                            fontSize: 11, color: _C.textSecondary),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Action bar
            Container(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: Row(
                children: [
                  // Revenue
                  _MiniStat(
                      label: 'Revenue',
                      value:
                          '\$${p.revenue >= 1000 ? '${(p.revenue / 1000).toStringAsFixed(1)}K' : p.revenue.toStringAsFixed(0)}'),
                  const SizedBox(width: 16),
                  // Sell-through
                  _MiniStat(
                      label: 'Sell-through',
                      value:
                          '${p.sellThrough.toStringAsFixed(1)}%'),
                  const SizedBox(width: 16),
                  // Watchers
                  _MiniStat(
                      label: 'Watchers',
                      value: p.watchCount.toString()),

                  const Spacer(),

                  // Price calculator
                  _IconAction(
                    icon: Icons.calculate_outlined,
                    tooltip: 'Price calculator',
                    onTap: widget.onCalculatePrice,
                  ),
                  const SizedBox(width: 6),

                  // Copy title
                  _IconAction(
                    icon: Icons.title_rounded,
                    tooltip: 'Copy optimized title',
                    onTap: widget.onCopyTitle,
                  ),
                  const SizedBox(width: 6),

                  // Expand keywords
                  _IconAction(
                    icon: _expanded
                        ? Icons.expand_less_rounded
                        : Icons.expand_more_rounded,
                    tooltip: 'Keywords',
                    onTap: () =>
                        setState(() => _expanded = !_expanded),
                  ),
                  const SizedBox(width: 6),

                  // Save to listing ideas
                  GestureDetector(
                    onTap: widget.onSave,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 7),
                      decoration: BoxDecoration(
                        color: widget.isSaved
                            ? _C.accentDim
                            : _C.bg,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: widget.isSaved
                              ? _C.accent
                              : _C.border,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            widget.isSaved
                                ? Icons.bookmark_rounded
                                : Icons.bookmark_outline_rounded,
                            size: 14,
                            color: widget.isSaved
                                ? _C.accent
                                : _C.textSecondary,
                          ),
                          const SizedBox(width: 5),
                          Text(
                            widget.isSaved ? 'Saved' : 'Save idea',
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                              color: widget.isSaved
                                  ? _C.accent
                                  : _C.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Expanded keywords
            if (_expanded)
              Container(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Divider(color: _C.border, height: 1),
                    const SizedBox(height: 12),
                    Text('Top keywords',
                        style: GoogleFonts.inter(
                            fontSize: 11, color: _C.textSecondary)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: p.topKeywords
                          .map((kw) => _Badge(
                                label: kw,
                                color: _C.accent.withOpacity(0.8),
                                bg: _C.accentDim,
                              ))
                          .toList(),
                    ),
                  ],
                ),
              ).animate().fadeIn(duration: 200.ms),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
// GAP CARD
// ─────────────────────────────────────────────

class _GapCard extends StatelessWidget {
  final GapProduct gap;
  const _GapCard({required this.gap});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: _C.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _C.border),
      ),
      child: Row(
        children: [
          // Demand indicator
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: _C.accentDim,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                '${gap.estimatedDemand.toInt()}',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: _C.accent,
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(gap.title,
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: _C.textPrimary,
                    )),
                const SizedBox(height: 4),
                Text(gap.reason,
                    style: GoogleFonts.inter(
                        fontSize: 12,
                        color: _C.textSecondary,
                        height: 1.5)),
              ],
            ),
          ),

          const SizedBox(width: 16),

          // Demand bar
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('Demand',
                  style: GoogleFonts.inter(
                      fontSize: 10, color: _C.textHint)),
              const SizedBox(height: 4),
              SizedBox(
                width: 80,
                child: LinearProgressIndicator(
                  value: gap.estimatedDemand / 100,
                  backgroundColor: _C.border,
                  valueColor:
                      const AlwaysStoppedAnimation(_C.accent),
                  borderRadius: BorderRadius.circular(2),
                  minHeight: 6,
                ),
              ),
              const SizedBox(height: 4),
              Text(gap.category,
                  style: GoogleFonts.inter(
                      fontSize: 10, color: _C.textSecondary)),
            ],
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────
// PRICE CALCULATOR BOTTOM SHEET
// ─────────────────────────────────────────────

class _PriceCalculatorSheet extends StatefulWidget {
  final ScannedProduct product;
  const _PriceCalculatorSheet({required this.product});

  @override
  State<_PriceCalculatorSheet> createState() =>
      _PriceCalculatorSheetState();
}

class _PriceCalculatorSheetState
    extends State<_PriceCalculatorSheet> {
  final _costController = TextEditingController();
  double? _suggestedPrice;
  double? _profit;
  double? _roi;

  void _calculate() {
    final cost = double.tryParse(_costController.text);
    if (cost == null) return;

    final competitorPrice = widget.product.price;
    // Undercut by 5–8%
    final sellPrice = competitorPrice * 0.94;
    // eBay final value fee ~13.25% + $0.30
    final ebayFee = sellPrice * 0.1325 + 0.30;
    final profit = sellPrice - cost - ebayFee;
    final roi = cost > 0 ? (profit / cost * 100) : 0.0;

    setState(() {
      _suggestedPrice = sellPrice;
      _profit = profit;
      _roi = roi;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: _C.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),

          Text('Price Undercut Calculator',
              style: GoogleFonts.spaceGrotesk(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: _C.textPrimary)),
          const SizedBox(height: 4),
          Text(
            'Competitor sells at \$${widget.product.price.toStringAsFixed(2)} — find your ideal sell price',
            style: GoogleFonts.inter(
                fontSize: 12, color: _C.textSecondary),
          ),
          const SizedBox(height: 20),

          // Cost input
          Text('Your sourcing cost (USD)',
              style: GoogleFonts.inter(
                  fontSize: 12, color: _C.textSecondary)),
          const SizedBox(height: 8),
          TextField(
            controller: _costController,
            keyboardType: TextInputType.number,
            onChanged: (_) => _calculate(),
            style: GoogleFonts.spaceGrotesk(
                fontSize: 15, color: _C.textPrimary),
            decoration: InputDecoration(
              prefixText: '\$  ',
              prefixStyle: GoogleFonts.inter(
                  fontSize: 14, color: _C.textSecondary),
              filled: true,
              fillColor: _C.bg,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide:
                    const BorderSide(color: _C.border),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide:
                    const BorderSide(color: _C.accent),
              ),
            ),
          ),

          if (_suggestedPrice != null) ...[
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: _CalcResult(
                    label: 'Your sell price',
                    value:
                        '\$${_suggestedPrice!.toStringAsFixed(2)}',
                    color: _C.accent,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _CalcResult(
                    label: 'Net profit',
                    value:
                        '\$${_profit!.toStringAsFixed(2)}',
                    color: _profit! >= 0
                        ? _C.rising
                        : _C.error,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _CalcResult(
                    label: 'ROI',
                    value: '${_roi!.toStringAsFixed(1)}%',
                    color: _roi! >= 20
                        ? _C.rising
                        : _roi! >= 0
                            ? _C.warning
                            : _C.error,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              '* Includes eBay final value fee (13.25%) + \$0.30 per order',
              style: GoogleFonts.inter(
                  fontSize: 11, color: _C.textHint),
            ),
          ],
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────
// SORT SHEET
// ─────────────────────────────────────────────

class _SortSheet extends StatelessWidget {
  final String current;
  final Function(String) onSelect;
  const _SortSheet({required this.current, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    final options = [
      ('opportunity', 'AI Opportunity Score', Icons.auto_awesome_rounded),
      ('revenue', 'Revenue (highest first)', Icons.attach_money_rounded),
      ('sold', 'Units Sold (highest first)', Icons.shopping_bag_outlined),
      ('price', 'Price (highest first)', Icons.sell_outlined),
    ];

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Sort by',
              style: GoogleFonts.spaceGrotesk(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: _C.textPrimary)),
          const SizedBox(height: 16),
          ...options.map((o) => ListTile(
                leading: Icon(o.$3,
                    color: current == o.$1
                        ? _C.accent
                        : _C.textSecondary,
                    size: 20),
                title: Text(o.$2,
                    style: GoogleFonts.inter(
                        fontSize: 14,
                        color: current == o.$1
                            ? _C.accent
                            : _C.textPrimary)),
                trailing: current == o.$1
                    ? const Icon(Icons.check_rounded,
                        color: _C.accent, size: 18)
                    : null,
                onTap: () => onSelect(o.$1),
                contentPadding: EdgeInsets.zero,
              )),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────
// TREND FILTER SHEET
// ─────────────────────────────────────────────

class _TrendFilterSheet extends StatelessWidget {
  final String current;
  final Function(String) onSelect;
  const _TrendFilterSheet(
      {required this.current, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    final options = [
      ('all', 'All products', Icons.apps_rounded, _C.textSecondary),
      ('rising', 'Rising 📈', Icons.trending_up_rounded, _C.rising),
      ('stable', 'Stable ➡️', Icons.trending_flat_rounded, _C.warning),
      ('fading', 'Fading 📉', Icons.trending_down_rounded, _C.error),
    ];

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Filter by trend',
              style: GoogleFonts.spaceGrotesk(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: _C.textPrimary)),
          const SizedBox(height: 16),
          ...options.map((o) => ListTile(
                leading:
                    Icon(o.$3, color: o.$4, size: 20),
                title: Text(o.$2,
                    style: GoogleFonts.inter(
                        fontSize: 14,
                        color: current == o.$1
                            ? _C.accent
                            : _C.textPrimary)),
                trailing: current == o.$1
                    ? const Icon(Icons.check_rounded,
                        color: _C.accent, size: 18)
                    : null,
                onTap: () => onSelect(o.$1),
                contentPadding: EdgeInsets.zero,
              )),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────
// SMALL REUSABLE WIDGETS
// ─────────────────────────────────────────────

class _Metric {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  _Metric(
      {required this.label,
      required this.value,
      required this.icon,
      required this.color});
}

class _ScoreCircle extends StatelessWidget {
  final int score;
  const _ScoreCircle({required this.score});

  Color get _color {
    if (score >= 8) return _C.accent;
    if (score >= 6) return _C.rising;
    if (score >= 4) return _C.warning;
    return _C.error;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 38,
      height: 38,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: _color, width: 2),
        color: _color.withOpacity(0.1),
      ),
      child: Center(
        child: Text(
          score.toString(),
          style: GoogleFonts.spaceGrotesk(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: _color,
          ),
        ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  final String label;
  final Color color;
  final Color bg;
  const _Badge(
      {required this.label, required this.color, required this.bg});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding:
          const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(4),
        border:
            Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(label,
          style: GoogleFonts.inter(
              fontSize: 10,
              fontWeight: FontWeight.w500,
              color: color)),
    );
  }
}

class _MiniStat extends StatelessWidget {
  final String label;
  final String value;
  const _MiniStat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: GoogleFonts.inter(
                fontSize: 10, color: _C.textHint)),
        Text(value,
            style: GoogleFonts.spaceGrotesk(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: _C.textSecondary)),
      ],
    );
  }
}

class _IconAction extends StatelessWidget {
  final IconData icon;
  final String tooltip;
  final VoidCallback onTap;
  const _IconAction(
      {required this.icon,
      required this.tooltip,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(7),
          decoration: BoxDecoration(
            color: _C.bg,
            borderRadius: BorderRadius.circular(7),
            border: Border.all(color: _C.border),
          ),
          child: Icon(icon, size: 15, color: _C.textSecondary),
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool active;
  final VoidCallback onTap;
  const _FilterChip(
      {required this.label,
      required this.icon,
      this.active = false,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: active ? _C.accentDim : _C.surface,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
              color: active
                  ? _C.accent.withOpacity(0.5)
                  : _C.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon,
                size: 14,
                color: active ? _C.accent : _C.textSecondary),
            const SizedBox(width: 6),
            Text(label,
                style: GoogleFonts.inter(
                    fontSize: 12,
                    color:
                        active ? _C.accent : _C.textSecondary)),
            const SizedBox(width: 4),
            Icon(Icons.keyboard_arrow_down_rounded,
                size: 14,
                color: active ? _C.accent : _C.textHint),
          ],
        ),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _ActionButton(
      {required this.icon,
      required this.label,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: _C.surface,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: _C.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 15, color: _C.textSecondary),
            const SizedBox(width: 6),
            Text(label,
                style: GoogleFonts.inter(
                    fontSize: 13, color: _C.textSecondary)),
          ],
        ),
      ),
    );
  }
}

class _TopBarButton extends StatefulWidget {
  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;
  const _TopBarButton(
      {required this.icon,
      required this.label,
      required this.active,
      required this.onTap});

  @override
  State<_TopBarButton> createState() => _TopBarButtonState();
}

class _TopBarButtonState extends State<_TopBarButton> {
  bool _hovering = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _hovering = true),
      onExit: (_) => setState(() => _hovering = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding:
              const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: widget.active
                ? _C.accentDim
                : _hovering
                    ? _C.surfaceHover
                    : _C.bg,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: widget.active
                  ? _C.accent.withOpacity(0.5)
                  : _C.border,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(widget.icon,
                  size: 15,
                  color: widget.active ? _C.accent : _C.textSecondary),
              const SizedBox(width: 6),
              Text(widget.label,
                  style: GoogleFonts.inter(
                      fontSize: 13,
                      color: widget.active
                          ? _C.accent
                          : _C.textSecondary)),
            ],
          ),
        ),
      ),
    );
  }
}

class _PriceStatCard extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _PriceStatCard(
      {required this.label,
      required this.value,
      required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: _C.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: _C.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: GoogleFonts.inter(
                    fontSize: 12, color: _C.textSecondary)),
            const SizedBox(height: 6),
            Text(value,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: color,
                )),
          ],
        ),
      ),
    );
  }
}

class _CalcResult extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _CalcResult(
      {required this.label,
      required this.value,
      required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style: GoogleFonts.inter(
                  fontSize: 11, color: _C.textSecondary)),
          const SizedBox(height: 4),
          Text(value,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: color,
              )),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────
// STRING EXTENSION
// ─────────────────────────────────────────────

extension StringExt on String {
  String capitalize() =>
      isEmpty ? this : '${this[0].toUpperCase()}${substring(1)}';
}
