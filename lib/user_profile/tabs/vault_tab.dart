// ═══════════════════════════════════════════════════════════════════════════
// lib/user_profile/tabs/vault_tab.dart
// ═══════════════════════════════════════════════════════════════════════════
// 3 sections:
// 1. Saved Products    (user_watchlist)
// 2. Tracked Sellers  (watchlist + store_scans)
// 3. Research History (scanned_products - 835 rows, paginated)
// ✅ Mobile friendly
// ✅ Search + filter
// ✅ Pagination (20 per page)
// ═══════════════════════════════════════════════════════════════════════════

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

// ─── Colors ───────────────────────────────────────────────────────────────
class _C {
  static const bg      = Color(0xFFF4F7FA);
  static const surface = Color(0xFFFFFFFF);
  static const navy    = Color(0xFF0F172A);
  static const accent  = Color(0xFF8FFF00);
  static const txt1    = Color(0xFF0F172A);
  static const txt2    = Color(0xFF64748B);
  static const txt3    = Color(0xFF94A3B8);
  static const border  = Color(0xFFE2E8F0);
  static const green   = Color(0xFF00C48C);
  static const orange  = Color(0xFFFFB800);
  static const red     = Color(0xFFFF4D6A);
  static const blue    = Color(0xFF1D70F5);
  static const purple  = Color(0xFF8B5CF6);
}

// ═══════════════════════════════════════════════════════════════════════════
class VaultTab extends StatefulWidget {
  const VaultTab({super.key});
  @override
  State<VaultTab> createState() => _VaultTabState();
}

class _VaultTabState extends State<VaultTab> {
  // ✅ Manual tab index — no TabController/TabBarView (avoids freeze in SingleChildScrollView)
  int _tab = 0;

  static const _tabs = [
    {'icon': '💾', 'label': 'Saved'},
    {'icon': '🕵️', 'label': 'Sellers'},
    {'icon': '🔍', 'label': 'History'},
  ];

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      // Header
      Text('My Vault',
          style: GoogleFonts.spaceGrotesk(
              fontSize: 24, fontWeight: FontWeight.w700, color: _C.txt1)),
      const SizedBox(height: 6),
      Text('Your saved products, tracked sellers and research history.',
          style: GoogleFonts.inter(fontSize: 14, color: _C.txt2)),
      const SizedBox(height: 20),

      // Custom tab bar (no TabController needed)
      Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: _C.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: _C.border),
        ),
        child: Row(children: _tabs.asMap().entries.map((e) {
          final isActive = _tab == e.key;
          final tab      = e.value;
          return Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _tab = e.key),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: isActive ? _C.navy : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${tab["icon"]} ${tab["label"]}',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
                    color: isActive ? Colors.white : _C.txt2,
                  ),
                ),
              ),
            ),
          );
        }).toList()),
      ),
      const SizedBox(height: 16),

      // Tab content — renders inline, no height constraints needed
      AnimatedSwitcher(
        duration: const Duration(milliseconds: 200),
        child: KeyedSubtree(
          key: ValueKey(_tab),
          child: _tab == 0
              ? const _SavedProductsSection()
              : _tab == 1
                  ? const _TrackedSellersSection()
                  : const _ResearchHistorySection(),
        ),
      ),
    ]);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: SAVED PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════

class _SavedProductsSection extends StatefulWidget {
  const _SavedProductsSection();
  @override
  State<_SavedProductsSection> createState() => _SavedProductsSectionState();
}

class _SavedProductsSectionState extends State<_SavedProductsSection> {
  final _supabase = Supabase.instance.client;
  List<Map<String, dynamic>> _items = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) { setState(() => _loading = false); return; }
    try {
      // Load from user_watchlist (manually saved products)
      final watchData = await _supabase
          .from('user_watchlist')
          .select()
          .eq('user_id', userId)
          .order('created_at', ascending: false);

      // Also load from listing_ideas (saved from product research)
      final ideasData = await _supabase
          .from('listing_ideas')
          .select()
          .eq('user_id', userId)
          .order('saved_at', ascending: false);

      final combined = <Map<String, dynamic>>[];

      // Add watchlist items
      for (final item in watchData) {
        combined.add({
          'id'        : item['id'],
          'title'     : item['title'] ?? 'Product',
          'price'     : item['price']?.toString() ?? '0',
          'image_url' : item['image_url'],
          'ebay_id'   : item['ebay_id'],
          'source'    : 'watchlist',
        });
      }

      // Add listing ideas
      for (final item in ideasData) {
        combined.add({
          'id'        : item['id'],
          'title'     : item['title'] ?? 'Product',
          'price'     : item['price']?.toString() ?? '0',
          'image_url' : item['image_url'],
          'ebay_url'  : item['ebay_url'],
          'score'     : item['opportunity_score'] ?? 0,
          'source'    : 'listing_ideas',
        });
      }

      if (mounted) setState(() {
        _items   = combined;
        _loading = false;
      });
    } catch (e) {
      debugPrint('Saved load error: $e');
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _delete(String id, String source) async {
    final table = source == 'listing_ideas' ? 'listing_ideas' : 'user_watchlist';
    await _supabase.from(table).delete().eq('id', id);
    _load();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator(color: Color(0xFF8FFF00)));

    if (_items.isEmpty) {
      return _EmptyState(
        icon: Icons.bookmark_outline,
        title: 'No Saved Products Yet',
        subtitle: 'Save products from the Product Research tool to track them here.',
        color: _C.blue,
      );
    }

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      _SectionHeader(title: 'Saved Products', count: _items.length, color: _C.blue),
      const SizedBox(height: 12),
      // Table header
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
          border: Border.all(color: _C.border),
        ),
        child: Row(children: [
          const SizedBox(width: 44), const SizedBox(width: 10),
          Expanded(child: Text('PRODUCT', style: GoogleFonts.inter(
              fontSize: 10, fontWeight: FontWeight.bold, color: _C.txt3))),
          const SizedBox(width: 80),
          const SizedBox(width: 32),
          const SizedBox(width: 4),
          const SizedBox(width: 32),
        ]),
      ),
      Container(
        decoration: BoxDecoration(
          color: _C.surface,
          borderRadius: const BorderRadius.vertical(bottom: Radius.circular(10)),
          border: Border.all(color: _C.border),
        ),
        child: Column(children: _items.map((item) =>
            _SavedProductCard(
              item: item,
              onDelete: () => _delete(item['id'], item['source'] ?? 'watchlist'),
            )).toList()),
      ),
    ]);
  }
}

class _SavedProductCard extends StatelessWidget {
  final Map<String, dynamic> item;
  final VoidCallback onDelete;
  const _SavedProductCard({required this.item, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    final price    = item['price']?.toString() ?? '0';
    final title    = item['title'] ?? 'Product';
    final imageUrl = item['image_url'] as String?;
    final ebayId   = item['ebay_id'] as String?;
    final ebayUrl  = item['ebay_url'] as String?;
    final score    = item['score'] as int?;
    final source   = item['source'] as String?;

    // Build open URL
    String? openUrl;
    if (ebayUrl != null)       openUrl = ebayUrl;
    else if (ebayId != null)   openUrl = 'https://www.ebay.com/itm/$ebayId';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: _C.border.withOpacity(0.5))),
      ),
      child: Row(children: [
        // Image
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: imageUrl != null
              ? Image.network(imageUrl, width: 44, height: 44, fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => _PlaceholderImg(size: 44))
              : _PlaceholderImg(size: 44),
        ),
        const SizedBox(width: 10),
        // Title + source badge
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start,
            children: [
          Text(title, style: GoogleFonts.inter(fontSize: 12,
              fontWeight: FontWeight.w600, color: _C.txt1),
              maxLines: 1, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 3),
          Row(children: [
            Text('\$$price', style: GoogleFonts.spaceGrotesk(
                fontSize: 13, fontWeight: FontWeight.w700, color: _C.blue)),
            const SizedBox(width: 8),
            if (source == 'listing_ideas')
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: _C.accent.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text('Idea', style: GoogleFonts.inter(
                    fontSize: 9, color: _C.navy, fontWeight: FontWeight.bold)),
              ),
          ]),
        ])),
        // Score
        if (score != null) ...[
          Container(
            width: 28, height: 28,
            decoration: BoxDecoration(
              color: (score >= 8 ? _C.green : score >= 5 ? _C.orange : _C.red).withOpacity(0.1),
              shape: BoxShape.circle,
              border: Border.all(color: (score >= 8 ? _C.green : score >= 5 ? _C.orange : _C.red).withOpacity(0.4)),
            ),
            child: Center(child: Text('$score', style: GoogleFonts.inter(
                fontSize: 10, fontWeight: FontWeight.bold,
                color: score >= 8 ? _C.green : score >= 5 ? _C.orange : _C.red))),
          ),
          const SizedBox(width: 8),
        ],
        // Actions
        if (openUrl != null) ...[
          _IconBtn(Icons.open_in_new, _C.blue, () async {
            final url = Uri.parse(openUrl!);
            if (await canLaunchUrl(url)) launchUrl(url);
          }),
          const SizedBox(width: 4),
        ],
        _IconBtn(Icons.delete_outline, _C.red, onDelete),
      ]),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2: TRACKED SELLERS
// ═══════════════════════════════════════════════════════════════════════════

class _TrackedSellersSection extends StatefulWidget {
  const _TrackedSellersSection();
  @override
  State<_TrackedSellersSection> createState() => _TrackedSellersSectionState();
}

class _TrackedSellersSectionState extends State<_TrackedSellersSection> {
  final _supabase = Supabase.instance.client;
  List<Map<String, dynamic>> _scans   = [];
  List<Map<String, dynamic>> _watched = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) { setState(() => _loading = false); return; }
    try {
      final results = await Future.wait([
        _supabase.from('store_scans').select()
            .eq('user_id', userId)
            .order('scanned_at', ascending: false),
        _supabase.from('watchlist').select()
            .eq('user_id', userId)
            .order('added_at', ascending: false),
      ]);
      if (mounted) setState(() {
        _scans   = List<Map<String, dynamic>>.from(results[0]);
        _watched = List<Map<String, dynamic>>.from(results[1]);
        _loading = false;
      });
    } catch (e) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _removeWatch(String id) async {
    await _supabase.from('watchlist').delete().eq('id', id);
    _load();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator(color: Color(0xFF8FFF00)));

    final total = _scans.length + _watched.length;
    if (total == 0) {
      return _EmptyState(
        icon: Icons.storefront_outlined,
        title: 'No Tracked Sellers',
        subtitle: 'Scan competitor stores in the\nCompetitor Research tool.',
        color: _C.orange,
      );
    }

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      // Watchlist
      if (_watched.isNotEmpty) ...[
        _SectionHeader(title: 'Watchlist', count: _watched.length, color: _C.purple),
        const SizedBox(height: 12),
        ..._watched.map((w) => _WatchlistCard(item: w,
            onRemove: () => _removeWatch(w['id']))),
        const SizedBox(height: 24),
      ],

      // Recent scans
      if (_scans.isNotEmpty) ...[
        _SectionHeader(title: 'Recent Scans', count: _scans.length, color: _C.orange),
        const SizedBox(height: 12),
        // Table header
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
            border: Border.all(color: _C.border),
          ),
          child: Row(children: [
            Expanded(flex: 3, child: Text('SELLER', style: GoogleFonts.inter(
                fontSize: 10, fontWeight: FontWeight.bold, color: _C.txt3))),
            SizedBox(width: 60, child: Text('LISTINGS', style: GoogleFonts.inter(
                fontSize: 10, fontWeight: FontWeight.bold, color: _C.txt3),
                textAlign: TextAlign.center)),
            SizedBox(width: 70, child: Text('REVENUE', style: GoogleFonts.inter(
                fontSize: 10, fontWeight: FontWeight.bold, color: _C.txt3),
                textAlign: TextAlign.center)),
            SizedBox(width: 70, child: Text('FEEDBACK', style: GoogleFonts.inter(
                fontSize: 10, fontWeight: FontWeight.bold, color: _C.txt3),
                textAlign: TextAlign.center)),
            SizedBox(width: 60, child: Text('AVG \$', style: GoogleFonts.inter(
                fontSize: 10, fontWeight: FontWeight.bold, color: _C.txt3),
                textAlign: TextAlign.center)),
            const SizedBox(width: 32),
          ]),
        ),
        Container(
          decoration: BoxDecoration(
            color: _C.surface,
            borderRadius: const BorderRadius.vertical(bottom: Radius.circular(10)),
            border: Border.all(color: _C.border),
          ),
          child: Column(children: _scans.map((s) => _StoreScanCard(scan: s)).toList()),
        ),
      ],
    ]);
  }
}

class _WatchlistCard extends StatelessWidget {
  final Map<String, dynamic> item;
  final VoidCallback onRemove;
  const _WatchlistCard({required this.item, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    final username  = item['username'] ?? 'Seller';
    final storeName = item['store_name'] ?? username;
    final revenue   = item['last_revenue'];
    final sold      = item['last_sold'] ?? 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _C.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _C.purple.withOpacity(0.3)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03),
            blurRadius: 6, offset: const Offset(0, 2))],
      ),
      child: Row(children: [
        Container(
          width: 44, height: 44,
          decoration: BoxDecoration(
            color: _C.purple.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Icon(Icons.storefront, color: _C.purple, size: 22),
        ),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start,
            children: [
          Text(storeName, style: GoogleFonts.inter(
              fontSize: 14, fontWeight: FontWeight.bold, color: _C.txt1)),
          Text('@$username', style: GoogleFonts.inter(
              fontSize: 11, color: _C.txt3)),
        ])),
        if (revenue != null)
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text('\$${(revenue as num).toStringAsFixed(0)}',
                style: GoogleFonts.spaceGrotesk(fontSize: 14,
                    fontWeight: FontWeight.w700, color: _C.green)),
            Text('$sold sold', style: GoogleFonts.inter(
                fontSize: 10, color: _C.txt3)),
          ]),
        const SizedBox(width: 10),
        _IconBtn(Icons.bookmark_remove, _C.red, onRemove),
      ]),
    );
  }
}

class _StoreScanCard extends StatelessWidget {
  final Map<String, dynamic> scan;
  const _StoreScanCard({required this.scan});

  static String _timeAgo(DateTime dt) {
    final d = DateTime.now().difference(dt);
    if (d.inMinutes < 60) return '${d.inMinutes}m ago';
    if (d.inHours < 24)   return '${d.inHours}h ago';
    if (d.inDays < 7)     return '${d.inDays}d ago';
    return '${dt.day}/${dt.month}/${dt.year}';
  }

  @override
  Widget build(BuildContext context) {
    final username  = scan['username'] ?? 'Store';
    final listings  = scan['active_listings'] ?? 0;
    final revenue   = (scan['estimated_revenue'] as num?)?.toStringAsFixed(0) ?? '0';
    final feedback  = (scan['feedback_percent'] as num?)?.toStringAsFixed(1) ?? '—';
    final avgPrice  = (scan['avg_price'] as num?)?.toStringAsFixed(0) ?? '—';
    final storeUrl  = scan['store_url'] as String?;
    final scannedAt = scan['scanned_at'] != null
        ? DateTime.tryParse(scan['scanned_at'].toString()) : null;
    final timeAgo   = scannedAt != null ? _timeAgo(scannedAt) : '';

    return Container(
      margin: const EdgeInsets.only(bottom: 1),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: _C.surface,
        border: Border(bottom: BorderSide(color: _C.border)),
      ),
      child: Row(children: [
        // Username
        Expanded(flex: 3, child: Column(
          crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(username, style: GoogleFonts.inter(
              fontSize: 13, fontWeight: FontWeight.w600, color: _C.txt1),
              overflow: TextOverflow.ellipsis),
          Text(timeAgo, style: GoogleFonts.inter(fontSize: 10, color: _C.txt3)),
        ])),
        // Listings
        SizedBox(width: 60, child: Text('$listings',
            style: GoogleFonts.inter(fontSize: 13, color: _C.blue,
                fontWeight: FontWeight.w600),
            textAlign: TextAlign.center)),
        // Revenue
        SizedBox(width: 70, child: Text('\$$revenue',
            style: GoogleFonts.inter(fontSize: 13, color: _C.green,
                fontWeight: FontWeight.w600),
            textAlign: TextAlign.center)),
        // Feedback
        SizedBox(width: 70, child: Text('$feedback%',
            style: GoogleFonts.inter(fontSize: 13, color: _C.orange,
                fontWeight: FontWeight.w600),
            textAlign: TextAlign.center)),
        // Avg Price
        SizedBox(width: 60, child: Text('\$$avgPrice',
            style: GoogleFonts.inter(fontSize: 13, color: _C.purple,
                fontWeight: FontWeight.w600),
            textAlign: TextAlign.center)),
        // Action
        SizedBox(width: 32,
          child: storeUrl != null
            ? _IconBtn(Icons.open_in_new, _C.blue, () async {
                final url = Uri.parse(storeUrl);
                if (await canLaunchUrl(url)) launchUrl(url);
              })
            : const SizedBox()),
      ]),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3: RESEARCH HISTORY (835 rows, paginated)
// ═══════════════════════════════════════════════════════════════════════════

class _ResearchHistorySection extends StatefulWidget {
  const _ResearchHistorySection();
  @override
  State<_ResearchHistorySection> createState() => _ResearchHistorySectionState();
}

class _ResearchHistorySectionState extends State<_ResearchHistorySection> {
  final _supabase     = Supabase.instance.client;
  final _searchCtrl   = TextEditingController();

  List<Map<String, dynamic>> _items      = [];
  String   _searchQuery  = '';
  String   _trendFilter  = 'all';
  int      _page         = 0;
  int      _total        = 0;
  bool     _loading      = true;
  bool     _loadingMore  = false;
  static const _pageSize = 20;

  @override
  void initState() { super.initState(); _load(reset: true); }

  @override
  void dispose() { _searchCtrl.dispose(); super.dispose(); }

  Future<void> _load({bool reset = false}) async {
    if (reset) { setState(() { _loading = true; _page = 0; _items = []; }); }

    try {
      // Build base query
      var baseQuery = _supabase.from('scanned_products').select();

      if (_searchQuery.isNotEmpty) {
        baseQuery = baseQuery.ilike('title', '%$_searchQuery%');
      }
      if (_trendFilter != 'all') {
        baseQuery = baseQuery.eq('trend', _trendFilter);
      }

      // Get total count separately on first load or reset
      if (reset || _total == 0) {
        try {
          var countQuery = _supabase.from('scanned_products').select();
          if (_searchQuery.isNotEmpty) {
            countQuery = countQuery.ilike('title', '%$_searchQuery%');
          }
          if (_trendFilter != 'all') {
            countQuery = countQuery.eq('trend', _trendFilter);
          }
          final countResult = await countQuery;
          if (mounted) setState(() => _total = (countResult as List).length);
        } catch (_) {}
      }

      final from = _page * _pageSize;
      final to   = from + _pageSize - 1;

      final response = await baseQuery
          .order('opportunity_score', ascending: false)
          .range(from, to);

      if (mounted) {
        setState(() {
          if (reset) {
            _items = List<Map<String, dynamic>>.from(response);
          } else {
            _items.addAll(List<Map<String, dynamic>>.from(response));
          }
          _loading     = false;
          _loadingMore = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() { _loading = false; _loadingMore = false; });
    }
  }

  Future<void> _loadMore() async {
    if (_loadingMore) return;
    setState(() { _loadingMore = true; _page++; });
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      _SectionHeader(title: 'Research History', count: _total, color: _C.green),
      const SizedBox(height: 12),

      // Search + Filter row
      LayoutBuilder(builder: (ctx, cs) {
        final isMobile = cs.maxWidth < 500;
        final searchBar = _SearchBar(
          controller: _searchCtrl,
          onChanged: (v) {
            setState(() => _searchQuery = v);
            _load(reset: true);
          },
        );
        final filterChips = _FilterChips(
          selected: _trendFilter,
          onChanged: (v) { setState(() => _trendFilter = v); _load(reset: true); },
        );
        if (isMobile) {
          return Column(children: [
            searchBar, const SizedBox(height: 8), filterChips,
          ]);
        }
        return Row(children: [
          Expanded(child: searchBar),
          const SizedBox(width: 12),
          filterChips,
        ]);
      }),
      const SizedBox(height: 16),

      // Results
      if (_loading)
        const Center(child: Padding(
          padding: EdgeInsets.all(32),
          child: CircularProgressIndicator(color: Color(0xFF8FFF00)),
        ))
      else if (_items.isEmpty)
        _EmptyState(
          icon: Icons.search_off,
          title: 'No Results Found',
          subtitle: _searchQuery.isNotEmpty
              ? 'Try a different search term'
              : 'Start using Product Research to build history',
          color: _C.green,
        )
      else ...[
        // Table header
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
            border: Border.all(color: _C.border),
          ),
          child: Row(children: [
            const SizedBox(width: 44),
            const SizedBox(width: 10),
            Expanded(child: Text('PRODUCT', style: GoogleFonts.inter(
                fontSize: 10, fontWeight: FontWeight.bold, color: _C.txt3))),
            SizedBox(width: 55, child: Text('PRICE', style: GoogleFonts.inter(
                fontSize: 10, fontWeight: FontWeight.bold, color: _C.txt3),
                textAlign: TextAlign.center)),
            SizedBox(width: 50, child: Text('SOLD', style: GoogleFonts.inter(
                fontSize: 10, fontWeight: FontWeight.bold, color: _C.txt3),
                textAlign: TextAlign.center)),
            SizedBox(width: 55, child: Text('SCORE', style: GoogleFonts.inter(
                fontSize: 10, fontWeight: FontWeight.bold, color: _C.txt3),
                textAlign: TextAlign.center)),
            SizedBox(width: 65, child: Text('TREND', style: GoogleFonts.inter(
                fontSize: 10, fontWeight: FontWeight.bold, color: _C.txt3),
                textAlign: TextAlign.center)),
            const SizedBox(width: 32),
          ]),
        ),
        // Product rows
        Container(
          decoration: BoxDecoration(
            color: _C.surface,
            borderRadius: const BorderRadius.vertical(bottom: Radius.circular(10)),
            border: Border.all(color: _C.border),
          ),
          child: Column(children: _items.map((item) =>
              _ProductHistoryCard(item: item)).toList()),
        ),

        // Load more
        if (_items.length < _total) ...[
          const SizedBox(height: 20),
          Center(
            child: _loadingMore
                ? const CircularProgressIndicator(color: Color(0xFF8FFF00))
                : OutlinedButton.icon(
                    onPressed: _loadMore,
                    icon: const Icon(Icons.expand_more, size: 18),
                    label: Text(
                      'Load More (${_total - _items.length} remaining)',
                      style: GoogleFonts.inter(fontWeight: FontWeight.w600),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: _C.border),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 24, vertical: 12),
                    ),
                  ),
          ),
        ],

        const SizedBox(height: 8),
        Center(
          child: Text('Showing ${_items.length} of $_total items',
              style: GoogleFonts.inter(fontSize: 11, color: _C.txt3)),
        ),
      ],
    ]);
  }
}

class _ProductHistoryCard extends StatelessWidget {
  final Map<String, dynamic> item;
  const _ProductHistoryCard({required this.item});

  @override
  Widget build(BuildContext context) {
    final title    = item['title'] ?? 'Product';
    final price    = (item['price'] as num?)?.toDouble() ?? 0;
    final score    = item['opportunity_score'] ?? 0;
    final trend    = item['trend'] ?? 'stable';
    final imageUrl = item['image_url'] as String?;
    final ebayUrl  = item['ebay_url'] as String?;
    final sold     = item['sold_count'] ?? 0;

    Color trendColor; IconData trendIcon; String trendText;
    switch (trend) {
      case 'rising': trendColor=_C.green; trendIcon=Icons.trending_up; trendText='Rising'; break;
      case 'fading': trendColor=_C.red; trendIcon=Icons.trending_down; trendText='Fading'; break;
      default:       trendColor=_C.orange; trendIcon=Icons.trending_flat; trendText='Stable';
    }
    final scoreColor = score >= 8 ? _C.green : score >= 5 ? _C.orange : _C.red;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: _C.border.withOpacity(0.5))),
      ),
      child: Row(children: [
        // Tiny image
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: imageUrl != null
            ? Image.network(imageUrl, width: 44, height: 44, fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => _PlaceholderImg(size: 44))
            : _PlaceholderImg(size: 44),
        ),
        const SizedBox(width: 10),
        // Title
        Expanded(
          child: Text(title,
              style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500, color: _C.txt1),
              maxLines: 2, overflow: TextOverflow.ellipsis),
        ),
        // Price
        SizedBox(width: 55,
          child: Text('\$${price.toStringAsFixed(0)}',
              style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w700, color: _C.txt1),
              textAlign: TextAlign.center)),
        // Sold
        SizedBox(width: 50,
          child: Text('$sold',
              style: GoogleFonts.inter(fontSize: 12, color: _C.txt2),
              textAlign: TextAlign.center)),
        // Score
        SizedBox(width: 55,
          child: Center(child: Container(
            width: 28, height: 28,
            decoration: BoxDecoration(
              color: scoreColor.withOpacity(0.1),
              shape: BoxShape.circle,
              border: Border.all(color: scoreColor.withOpacity(0.4)),
            ),
            child: Center(child: Text('$score',
                style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: scoreColor))),
          ))),
        // Trend
        SizedBox(width: 65,
          child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(trendIcon, size: 12, color: trendColor),
            const SizedBox(width: 3),
            Text(trendText, style: GoogleFonts.inter(fontSize: 10, color: trendColor, fontWeight: FontWeight.w600)),
          ])),
        // Link
        SizedBox(width: 32,
          child: ebayUrl != null
            ? _IconBtn(Icons.open_in_new, _C.blue, () async {
                final url = Uri.parse(ebayUrl);
                if (await canLaunchUrl(url)) launchUrl(url);
              })
            : const SizedBox()),
      ]),
    );
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// SMALL REUSABLE WIDGETS
// ═══════════════════════════════════════════════════════════════════════════

class _SectionHeader extends StatelessWidget {
  final String title;
  final int count;
  final Color color;
  const _SectionHeader({required this.title, required this.count, required this.color});

  @override
  Widget build(BuildContext context) => Row(children: [
    Text(title, style: GoogleFonts.inter(
        fontSize: 15, fontWeight: FontWeight.w700, color: _C.txt1)),
    const SizedBox(width: 8),
    Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text('$count', style: GoogleFonts.inter(
          fontSize: 11, fontWeight: FontWeight.bold, color: color)),
    ),
  ]);
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title, subtitle;
  final Color color;
  const _EmptyState({required this.icon, required this.title,
      required this.subtitle, required this.color});

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(40),
    child: Center(
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Container(
          width: 72, height: 72,
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, size: 36, color: color),
        ),
        const SizedBox(height: 16),
        Text(title, style: GoogleFonts.spaceGrotesk(
            fontSize: 16, fontWeight: FontWeight.w700, color: _C.txt1)),
        const SizedBox(height: 8),
        Text(subtitle, style: GoogleFonts.inter(
            fontSize: 13, color: _C.txt2, height: 1.5),
            textAlign: TextAlign.center),
      ]),
    ),
  );
}

class _SearchBar extends StatelessWidget {
  final TextEditingController controller;
  final ValueChanged<String> onChanged;
  const _SearchBar({required this.controller, required this.onChanged});

  @override
  Widget build(BuildContext context) => Container(
    height: 42,
    decoration: BoxDecoration(
      color: _C.surface,
      borderRadius: BorderRadius.circular(10),
      border: Border.all(color: _C.border),
    ),
    child: TextField(
      controller: controller,
      onChanged: onChanged,
      style: GoogleFonts.inter(fontSize: 13, color: _C.txt1),
      decoration: InputDecoration(
        hintText: 'Search products...',
        hintStyle: GoogleFonts.inter(fontSize: 13, color: _C.txt3),
        prefixIcon: const Icon(Icons.search, size: 18, color: _C.txt3),
        suffixIcon: controller.text.isNotEmpty
            ? IconButton(
                icon: const Icon(Icons.close, size: 16, color: _C.txt3),
                onPressed: () { controller.clear(); onChanged(''); })
            : null,
        border: InputBorder.none,
        contentPadding: const EdgeInsets.symmetric(vertical: 12),
      ),
    ),
  );
}

class _FilterChips extends StatelessWidget {
  final String selected;
  final ValueChanged<String> onChanged;
  const _FilterChips({required this.selected, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    final filters = [
      {'value': 'all',    'label': 'All',    'color': _C.txt2},
      {'value': 'rising', 'label': '🔥 Rising', 'color': _C.green},
      {'value': 'stable', 'label': '📈 Stable', 'color': _C.orange},
      {'value': 'fading', 'label': '📉 Fading', 'color': _C.red},
    ];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(children: filters.map((f) {
        final isActive = selected == f['value'];
        final color    = f['color'] as Color;
        return GestureDetector(
          onTap: () => onChanged(f['value'] as String),
          child: Container(
            margin: const EdgeInsets.only(right: 8),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: isActive ? _C.navy : _C.surface,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                  color: isActive ? _C.navy : _C.border),
            ),
            child: Text(f['label'] as String,
                style: GoogleFonts.inter(
                    fontSize: 12, fontWeight: FontWeight.w600,
                    color: isActive ? Colors.white : color)),
          ),
        );
      }).toList()),
    );
  }
}

class _IconBtn extends StatelessWidget {
  final IconData icon;
  final Color color;
  final VoidCallback onTap;
  const _IconBtn(this.icon, this.color, this.onTap);

  @override
  Widget build(BuildContext context) => InkWell(
    onTap: onTap,
    borderRadius: BorderRadius.circular(8),
    child: Container(
      width: 32, height: 32,
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Icon(icon, size: 16, color: color),
    ),
  );
}

class _PlaceholderImg extends StatelessWidget {
  final double size;
  const _PlaceholderImg({this.size = 50});

  @override
  Widget build(BuildContext context) => Container(
    width: size, height: size,
    decoration: BoxDecoration(
      color: const Color(0xFFF1F5F9),
      borderRadius: BorderRadius.circular(8),
    ),
    child: const Icon(Icons.image_outlined, color: _C.txt3, size: 22),
  );
}