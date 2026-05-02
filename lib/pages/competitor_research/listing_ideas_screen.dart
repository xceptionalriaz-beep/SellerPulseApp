// lib/pages/competitor_research/listing_ideas_screen.dart
//
// SellerPulse — Listing Ideas Board
// Shows all products the user saved from competitor scans
// One-tap copy title, open on eBay, remove from board

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
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
  static const rising = Color(0xFF00E5A0);
  static const risingDim = Color(0x2200E5A0);
}

// ─────────────────────────────────────────────
// LISTING IDEAS SCREEN
// ─────────────────────────────────────────────

class ListingIdeasScreen extends StatefulWidget {
  const ListingIdeasScreen({super.key});

  @override
  State<ListingIdeasScreen> createState() => _ListingIdeasScreenState();
}

class _ListingIdeasScreenState extends State<ListingIdeasScreen> {
  final _service = CompetitorService();

  List<Map<String, dynamic>> _ideas = [];
  bool _loading = true;
  String _search = '';
  String _sortBy = 'saved_at'; // saved_at / score / price / revenue

  @override
  void initState() {
    super.initState();
    _loadIdeas();
  }

  Future<void> _loadIdeas() async {
    setState(() => _loading = true);
    try {
      final data = await _service.loadListingIdeas();
      if (mounted) setState(() => _ideas = data);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _removeIdea(String itemId, String title) async {
    await _service.removeFromListingIdeas(itemId);
    setState(() => _ideas.removeWhere((i) => i['item_id'] == itemId));
    _showSnack('Removed "$title"');
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg,
            style: GoogleFonts.inter(fontSize: 13, color: Colors.black)),
        backgroundColor: _C.accent,
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  List<Map<String, dynamic>> get _filtered {
    var list = [..._ideas];

    // Search
    if (_search.isNotEmpty) {
      list = list
          .where((i) => (i['title'] ?? '')
              .toString()
              .toLowerCase()
              .contains(_search.toLowerCase()))
          .toList();
    }

    // Sort
    switch (_sortBy) {
      case 'score':
        list.sort((a, b) =>
            (b['opportunity_score'] ?? 0).compareTo(a['opportunity_score'] ?? 0));
        break;
      case 'price':
        list.sort((a, b) =>
            (b['price'] ?? 0.0).compareTo(a['price'] ?? 0.0));
        break;
      case 'revenue':
        list.sort((a, b) =>
            (b['revenue'] ?? 0.0).compareTo(a['revenue'] ?? 0.0));
        break;
      default:
        list.sort((a, b) =>
            (b['saved_at'] ?? '').compareTo(a['saved_at'] ?? ''));
    }

    return list;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _C.bg,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          _buildToolbar(),
          Expanded(child: _buildContent()),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────
  // HEADER
  // ─────────────────────────────────────────────

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(32, 32, 32, 20),
      decoration: BoxDecoration(
        color: _C.surface,
        border: Border(bottom: BorderSide(color: _C.border)),
      ),
      child: Row(
        children: [
          // Back
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

          // Icon
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: _C.accentDim,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.bookmark_rounded,
                color: _C.accent, size: 20),
          ),
          const SizedBox(width: 14),

          // Title
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Listing Ideas',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: _C.textPrimary,
                  letterSpacing: -0.3,
                ),
              ),
              Text(
                'Products saved from competitor scans',
                style: GoogleFonts.inter(
                    fontSize: 13, color: _C.textSecondary),
              ),
            ],
          ),

          const Spacer(),

          // Count badge
          if (_ideas.isNotEmpty)
            Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 14, vertical: 7),
              decoration: BoxDecoration(
                color: _C.accentDim,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                    color: _C.accent.withOpacity(0.3)),
              ),
              child: Text(
                '${_ideas.length} saved',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: _C.accent,
                ),
              ),
            ),

          const SizedBox(width: 12),

          // Refresh
          GestureDetector(
            onTap: _loadIdeas,
            child: Container(
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(
                color: _C.bg,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: _C.border),
              ),
              child: const Icon(Icons.refresh_rounded,
                  size: 17, color: _C.textSecondary),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms);
  }

  // ─────────────────────────────────────────────
  // TOOLBAR
  // ─────────────────────────────────────────────

  Widget _buildToolbar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(32, 14, 32, 14),
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
                          setState(() => _search = v),
                      style: GoogleFonts.inter(
                          fontSize: 13, color: _C.textPrimary),
                      decoration: InputDecoration(
                        hintText: 'Search your saved ideas...',
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

          // Sort dropdown
          _SortDropdown(
            value: _sortBy,
            onChanged: (v) => setState(() => _sortBy = v),
          ),

          const SizedBox(width: 12),

          // Result count
          Text(
            '${_filtered.length} of ${_ideas.length}',
            style: GoogleFonts.inter(
                fontSize: 12, color: _C.textHint),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 50.ms, duration: 300.ms);
  }

  // ─────────────────────────────────────────────
  // CONTENT
  // ─────────────────────────────────────────────

  Widget _buildContent() {
    if (_loading) {
      return const Center(
        child: CircularProgressIndicator(
            color: _C.accent, strokeWidth: 2),
      );
    }

    if (_ideas.isEmpty) {
      return _buildEmptyState();
    }

    final items = _filtered;

    if (items.isEmpty) {
      return Center(
        child: Text(
          'No ideas match your search',
          style: GoogleFonts.inter(
              fontSize: 14, color: _C.textSecondary),
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(32),
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 380,
        mainAxisSpacing: 14,
        crossAxisSpacing: 14,
        childAspectRatio: 0.78,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) {
        return _IdeaCard(
          idea: items[index],
          onRemove: () => _removeIdea(
            items[index]['item_id'] ?? '',
            items[index]['title'] ?? '',
          ),
          onCopyTitle: () {
            final title = items[index]['title'] ?? '';
            final keywords = (items[index]['top_keywords']
                        as List<dynamic>?)
                    ?.take(4)
                    .join(' ') ??
                '';
            final full = '$title $keywords'.trim();
            Clipboard.setData(ClipboardData(
                text: full.length > 80
                    ? full.substring(0, 80)
                    : full));
            _showSnack('Title copied!');
          },
        )
            .animate(
                delay: Duration(milliseconds: 50 * index))
            .fadeIn(duration: 280.ms)
            .slideY(begin: 0.04, end: 0);
      },
    );
  }

  // ─────────────────────────────────────────────
  // EMPTY STATE
  // ─────────────────────────────────────────────

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: _C.accentDim,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.bookmark_outline_rounded,
                color: _C.accent, size: 32),
          ),
          const SizedBox(height: 20),
          Text(
            'No listing ideas yet',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: _C.textPrimary,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Scan a competitor store and tap\n"Save idea" on any product to add it here.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 14,
              color: _C.textSecondary,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 28),
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 24, vertical: 12),
              decoration: BoxDecoration(
                color: _C.accent,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.radar_rounded,
                      size: 16, color: Colors.black),
                  const SizedBox(width: 8),
                  Text(
                    'Scan a store now',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: Colors.black,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.05, end: 0),
    );
  }
}

// ─────────────────────────────────────────────
// IDEA CARD — grid card for saved product
// ─────────────────────────────────────────────

class _IdeaCard extends StatefulWidget {
  final Map<String, dynamic> idea;
  final VoidCallback onRemove;
  final VoidCallback onCopyTitle;

  const _IdeaCard({
    required this.idea,
    required this.onRemove,
    required this.onCopyTitle,
  });

  @override
  State<_IdeaCard> createState() => _IdeaCardState();
}

class _IdeaCardState extends State<_IdeaCard> {
  bool _hovering = false;

  @override
  Widget build(BuildContext context) {
    final idea = widget.idea;
    final title = idea['title'] ?? '';
    final price = (idea['price'] ?? 0.0).toDouble();
    final revenue = (idea['revenue'] ?? 0.0).toDouble();
    final sold = idea['sold_count'] ?? 0;
    final score = idea['opportunity_score'] ?? 5;
    final imageUrl = idea['image_url'];
    final keywords =
        (idea['top_keywords'] as List<dynamic>?)?.cast<String>() ?? [];
    final savedAt = idea['saved_at'] != null
        ? DateTime.tryParse(idea['saved_at'])
        : null;

    final scoreColor = score >= 8
        ? _C.accent
        : score >= 6
            ? _C.rising
            : score >= 4
                ? const Color(0xFFFFB800)
                : _C.error;

    return MouseRegion(
      onEnter: (_) => setState(() => _hovering = true),
      onExit: (_) => setState(() => _hovering = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        decoration: BoxDecoration(
          color: _hovering ? _C.surfaceHover : _C.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color:
                _hovering ? _C.accent.withOpacity(0.3) : _C.border,
          ),
          boxShadow: _hovering
              ? [
                  BoxShadow(
                    color: _C.accent.withOpacity(0.06),
                    blurRadius: 20,
                    spreadRadius: 2,
                  )
                ]
              : [],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product image
            Stack(
              children: [
                Container(
                  height: 140,
                  decoration: BoxDecoration(
                    color: _C.bg,
                    borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(16)),
                    image: imageUrl != null
                        ? DecorationImage(
                            image: NetworkImage(imageUrl),
                            fit: BoxFit.cover,
                          )
                        : null,
                  ),
                  child: imageUrl == null
                      ? Center(
                          child: Icon(Icons.inventory_2_outlined,
                              size: 36, color: _C.textHint),
                        )
                      : null,
                ),

                // AI Score badge
                Positioned(
                  top: 10,
                  left: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: scoreColor.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                          color: scoreColor.withOpacity(0.4)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.auto_awesome_rounded,
                            size: 11, color: scoreColor),
                        const SizedBox(width: 4),
                        Text(
                          '$score/10',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: scoreColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Remove button
                Positioned(
                  top: 10,
                  right: 10,
                  child: GestureDetector(
                    onTap: () => _confirmRemove(context),
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: _C.surface.withOpacity(0.9),
                        shape: BoxShape.circle,
                        border: Border.all(color: _C.border),
                      ),
                      child: const Icon(Icons.close_rounded,
                          size: 13, color: _C.textSecondary),
                    ),
                  ),
                ),
              ],
            ),

            // Content
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title
                    Text(
                      title,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: _C.textPrimary,
                        height: 1.4,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),

                    const SizedBox(height: 10),

                    // Price + sold
                    Row(
                      children: [
                        Text(
                          '\$${price.toStringAsFixed(2)}',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: _C.textPrimary,
                          ),
                        ),
                        const Spacer(),
                        Text(
                          '$sold sold',
                          style: GoogleFonts.inter(
                              fontSize: 11,
                              color: _C.textSecondary),
                        ),
                      ],
                    ),

                    const SizedBox(height: 4),

                    // Revenue
                    Text(
                      'Est. \$${revenue >= 1000 ? '${(revenue / 1000).toStringAsFixed(1)}K' : revenue.toStringAsFixed(0)} revenue',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: _C.rising,
                      ),
                    ),

                    const Spacer(),

                    // Keywords
                    if (keywords.isNotEmpty) ...[
                      Wrap(
                        spacing: 4,
                        runSpacing: 4,
                        children: keywords.take(3).map((kw) {
                          return Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: _C.accentDim,
                              borderRadius:
                                  BorderRadius.circular(4),
                            ),
                            child: Text(
                              kw,
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                color: _C.accent
                                    .withOpacity(0.8),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 10),
                    ],

                    // Action buttons
                    Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: widget.onCopyTitle,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  vertical: 8),
                              decoration: BoxDecoration(
                                color: _C.accentDim,
                                borderRadius:
                                    BorderRadius.circular(8),
                                border: Border.all(
                                    color: _C.accent
                                        .withOpacity(0.3)),
                              ),
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.copy_rounded,
                                      size: 12,
                                      color: _C.accent),
                                  const SizedBox(width: 5),
                                  Text(
                                    'Copy title',
                                    style: GoogleFonts.inter(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: _C.accent,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),

                    // Saved date
                    if (savedAt != null) ...[
                      const SizedBox(height: 8),
                      Text(
                        'Saved ${_timeAgo(savedAt)}',
                        style: GoogleFonts.inter(
                            fontSize: 10, color: _C.textHint),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmRemove(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: _C.surface,
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16)),
        title: Text('Remove idea?',
            style: GoogleFonts.spaceGrotesk(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: _C.textPrimary)),
        content: Text(
          'This product will be removed from your Listing Ideas board.',
          style: GoogleFonts.inter(
              fontSize: 13, color: _C.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel',
                style: GoogleFonts.inter(
                    color: _C.textSecondary)),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              widget.onRemove();
            },
            child: Text('Remove',
                style: GoogleFonts.inter(color: _C.error)),
          ),
        ],
      ),
    );
  }

  String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}

// ─────────────────────────────────────────────
// SORT DROPDOWN
// ─────────────────────────────────────────────

class _SortDropdown extends StatelessWidget {
  final String value;
  final Function(String) onChanged;

  const _SortDropdown(
      {required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    final options = {
      'saved_at': 'Newest first',
      'score': 'AI Score',
      'revenue': 'Revenue',
      'price': 'Price',
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      height: 38,
      decoration: BoxDecoration(
        color: _C.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _C.border),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          dropdownColor: _C.surface,
          style: GoogleFonts.inter(
              fontSize: 12, color: _C.textSecondary),
          icon: const Icon(Icons.keyboard_arrow_down_rounded,
              size: 16, color: _C.textHint),
          items: options.entries
              .map((e) => DropdownMenuItem(
                    value: e.key,
                    child: Text(e.value),
                  ))
              .toList(),
          onChanged: (v) {
            if (v != null) onChanged(v);
          },
        ),
      ),
    );
  }
}
