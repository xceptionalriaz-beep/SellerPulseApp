// lib/pages/competitor_research/competitor_research_main.dart
//
// SellerPulse — Competitor Research Main Screen
// Matches app design: dark navy sidebar, white content, #AAFF00 green accent
// Depends on: competitor_service.dart (already created)

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'services/competitor_service.dart';
import 'store_results_screen.dart';

// ─────────────────────────────────────────────
// DESIGN TOKENS — matches your existing app
// ─────────────────────────────────────────────
class _C {
  static const bg = Color(0xFFF8FAFC);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceHover = Color(0xFFF1F5F9);
  static const border = Color(0xFFE2E8F0);
  static const accent = Color(0xFF5CB800);
  static const accentDim = Color(0xFFE8FFB0);
  static const textPrimary = Color(0xFF0F172A);
  static const textSecondary = Color(0xFF64748B);
  static const textHint = Color(0xFF94A3B8);
  static const error = Color(0xFFFF4D6A);
  static const warning = Color(0xFFFFB800);
  static const rising = Color(0xFF00C48C);
  static const fading = Color(0xFFFF4D6A);
}

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────

class CompetitorResearchMain extends StatefulWidget {
  const CompetitorResearchMain({super.key});

  @override
  State<CompetitorResearchMain> createState() =>
      _CompetitorResearchMainState();
}

class _CompetitorResearchMainState
    extends State<CompetitorResearchMain>
    with SingleTickerProviderStateMixin {

  final _searchController = TextEditingController();
  final _focusNode = FocusNode();
  final _service = CompetitorService();

  bool _isScanning = false;
  bool _isFocused = false;
  String? _errorMessage;
  List<Map<String, dynamic>> _scanHistory = [];
  bool _historyLoading = true;

  // Scan progress stages
  int _scanStage = 0;
  final _scanStages = [
    '🔍  Connecting to eBay...',
    '📦  Fetching store listings...',
    '📊  Analysing products...',
    '🧠  Running AI scoring...',
    '🎯  Finding gaps...',
    '💾  Saving results...',
  ];

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() {
      setState(() => _isFocused = _focusNode.hasFocus);
    });
    _loadHistory();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  Future<void> _loadHistory() async {
    setState(() => _historyLoading = true);
    try {
      final history = await _service.loadScanHistory();
      setState(() {
        _scanHistory = history;
        _historyLoading = false;
      });
    } catch (_) {
      setState(() => _historyLoading = false);
    }
  }

  Future<void> _startScan() async {
    final username = _searchController.text.trim();
    if (username.isEmpty) {
      setState(() => _errorMessage = 'Enter an eBay username to scan');
      return;
    }

    // Dismiss keyboard
    _focusNode.unfocus();

    setState(() {
      _isScanning = true;
      _errorMessage = null;
      _scanStage = 0;
    });

    // Animate through scan stages
    for (int i = 0; i < _scanStages.length; i++) {
      await Future.delayed(const Duration(milliseconds: 700));
      if (mounted) setState(() => _scanStage = i);
    }

    try {
      final result = await _service.scanStore(username);

      if (!mounted) return;

      // Navigate to results screen
      await Navigator.push(
        context,
        PageRouteBuilder(
          pageBuilder: (_, animation, __) =>
              StoreResultsScreen(result: result),
          transitionsBuilder: (_, animation, __, child) {
            return FadeTransition(
              opacity: animation,
              child: SlideTransition(
                position: Tween<Offset>(
                  begin: const Offset(0.03, 0),
                  end: Offset.zero,
                ).animate(CurvedAnimation(
                  parent: animation,
                  curve: Curves.easeOutCubic,
                )),
                child: child,
              ),
            );
          },
          transitionDuration: const Duration(milliseconds: 400),
        ),
      );

      // Refresh history after returning
      _loadHistory();
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage =
              'Could not scan "$username". Check the username and try again.';
        });
      }
    } finally {
      if (mounted) setState(() => _isScanning = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _C.bg,
      body: Row(
        children: [
          // ── Main Content ──
          Expanded(
            child: _isScanning
                ? _buildScanningState()
                : _buildIdleState(),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────
  // IDLE STATE — search + history
  // ─────────────────────────────────────────────

  Widget _buildIdleState() {
    return CustomScrollView(
      slivers: [
        // Header
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(40, 48, 40, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title row
                Row(
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: _C.accentDim,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.radar_rounded,
                        color: _C.accent,
                        size: 22,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Competitor Research',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: _C.textPrimary,
                            letterSpacing: -0.3,
                          ),
                        ),
                        Text(
                          'Scan any eBay store. Find winning products instantly.',
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: _C.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    // Listing ideas button
                    _GhostButton(
                      icon: Icons.bookmark_outline_rounded,
                      label: 'Listing Ideas',
                      onTap: () {
                        Navigator.pushNamed(
                            context, '/competitor/listing-ideas');
                      },
                    ),
                    const SizedBox(width: 10),
                    _GhostButton(
                      icon: Icons.visibility_outlined,
                      label: 'Watchlist',
                      onTap: () {
                        Navigator.pushNamed(
                            context, '/competitor/watchlist');
                      },
                    ),
                  ],
                )
                    .animate()
                    .fadeIn(duration: 400.ms)
                    .slideY(begin: -0.05, end: 0),

                const SizedBox(height: 40),

                // ── Search Bar ──
                _SearchBar(
                  controller: _searchController,
                  focusNode: _focusNode,
                  isFocused: _isFocused,
                  errorMessage: _errorMessage,
                  onScan: _startScan,
                ).animate().fadeIn(delay: 100.ms, duration: 400.ms),

                const SizedBox(height: 16),

                // Quick tip
                Row(
                  children: [
                    const Icon(Icons.info_outline_rounded,
                        size: 13, color: _C.textHint),
                    const SizedBox(width: 6),
                    Text(
                      'Enter an eBay username (e.g. "techdealsusa") — not a store URL',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: _C.textHint,
                      ),
                    ),
                  ],
                ).animate().fadeIn(delay: 150.ms, duration: 400.ms),

                const SizedBox(height: 48),

                // ── Stats strip ──
                _StatsStrip()
                    .animate()
                    .fadeIn(delay: 200.ms, duration: 400.ms),

                const SizedBox(height: 48),

                // ── Scan History ──
                Row(
                  children: [
                    Text(
                      'Recent Scans',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: _C.textPrimary,
                      ),
                    ),
                    const Spacer(),
                    if (_scanHistory.isNotEmpty)
                      TextButton(
                        onPressed: _loadHistory,
                        child: Text(
                          'Refresh',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: _C.textSecondary,
                          ),
                        ),
                      ),
                  ],
                ).animate().fadeIn(delay: 250.ms, duration: 400.ms),

                const SizedBox(height: 16),
              ],
            ),
          ),
        ),

        // History list
        if (_historyLoading)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 40),
              child: Center(
                child: CircularProgressIndicator(
                  color: _C.accent,
                  strokeWidth: 2,
                ),
              ),
            ),
          )
        else if (_scanHistory.isEmpty)
          SliverToBoxAdapter(
            child: _EmptyHistory(
              onScanPressed: () => _focusNode.requestFocus(),
            ).animate().fadeIn(delay: 300.ms, duration: 400.ms),
          )
        else
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(40, 0, 40, 40),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) => _HistoryCard(
                  scan: _scanHistory[index],
                  onTap: () async {
                    // Re-scan the same store
                    _searchController.text =
                        _scanHistory[index]['username'] ?? '';
                    _startScan();
                  },
                )
                    .animate(delay: Duration(milliseconds: 60 * index))
                    .fadeIn(duration: 300.ms)
                    .slideY(begin: 0.04, end: 0),
                childCount: _scanHistory.length,
              ),
            ),
          ),
      ],
    );
  }

  // ─────────────────────────────────────────────
  // SCANNING STATE — animated progress
  // ─────────────────────────────────────────────

  Widget _buildScanningState() {
    final username = _searchController.text.trim();

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Pulsing radar icon
          TweenAnimationBuilder<double>(
            tween: Tween(begin: 0.95, end: 1.05),
            duration: const Duration(milliseconds: 900),
            builder: (_, scale, child) => Transform.scale(
              scale: scale,
              child: child,
            ),
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: _C.accentDim,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: _C.accent.withOpacity(0.25),
                    blurRadius: 32,
                    spreadRadius: 8,
                  ),
                ],
              ),
              child: const Icon(
                Icons.radar_rounded,
                color: _C.accent,
                size: 36,
              ),
            ),
          ),

          const SizedBox(height: 28),

          Text(
            'Scanning "$username"',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: _C.textPrimary,
            ),
          ),

          const SizedBox(height: 8),

          Text(
            _scanStages[_scanStage],
            style: GoogleFonts.inter(
              fontSize: 14,
              color: _C.textSecondary,
            ),
          ).animate(key: ValueKey(_scanStage)).fadeIn(duration: 300.ms),

          const SizedBox(height: 32),

          // Progress bar
          Container(
            width: 280,
            height: 4,
            decoration: BoxDecoration(
              color: _C.border,
              borderRadius: BorderRadius.circular(2),
            ),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: (_scanStage + 1) / _scanStages.length,
              child: Container(
                decoration: BoxDecoration(
                  color: _C.accent,
                  borderRadius: BorderRadius.circular(2),
                  boxShadow: [
                    BoxShadow(
                      color: _C.accent.withOpacity(0.4),
                      blurRadius: 8,
                    ),
                  ],
                ),
              ),
            ),
          ),

          const SizedBox(height: 12),

          Text(
            '${((_scanStage + 1) / _scanStages.length * 100).round()}%',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: _C.accent,
            ),
          ),

          const SizedBox(height: 40),

          TextButton(
            onPressed: () => setState(() => _isScanning = false),
            child: Text(
              'Cancel',
              style: GoogleFonts.inter(
                fontSize: 13,
                color: _C.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────
// SEARCH BAR WIDGET
// ─────────────────────────────────────────────

class _SearchBar extends StatelessWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final bool isFocused;
  final String? errorMessage;
  final VoidCallback onScan;

  const _SearchBar({
    required this.controller,
    required this.focusNode,
    required this.isFocused,
    required this.errorMessage,
    required this.onScan,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          height: 56,
          decoration: BoxDecoration(
            color: _C.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: errorMessage != null
                  ? _C.error
                  : isFocused
                      ? _C.accent
                      : _C.border,
              width: isFocused ? 1.5 : 1,
            ),
            boxShadow: isFocused
                ? [
                    BoxShadow(
                      color: _C.accent.withOpacity(0.12),
                      blurRadius: 20,
                      spreadRadius: 2,
                    ),
                  ]
                : [],
          ),
          child: Row(
            children: [
              const SizedBox(width: 18),
              Icon(
                Icons.store_outlined,
                size: 20,
                color: isFocused ? _C.accent : _C.textSecondary,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: KeyboardListener(
                  focusNode: FocusNode(),
                  onKeyEvent: (event) {
                    if (event is KeyDownEvent &&
                        event.logicalKey == LogicalKeyboardKey.enter) {
                      onScan();
                    }
                  },
                  child: TextField(
                    controller: controller,
                    focusNode: focusNode,
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 15,
                      color: _C.textPrimary,
                      fontWeight: FontWeight.w500,
                    ),
                    decoration: InputDecoration(
                      hintText: 'Enter eBay username (e.g. techdealsusa)',
                      hintStyle: GoogleFonts.inter(
                        fontSize: 14,
                        color: _C.textHint,
                      ),
                      border: InputBorder.none,
                      isDense: true,
                    ),
                    onSubmitted: (_) => onScan(),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              _ScanButton(onTap: onScan),
              const SizedBox(width: 8),
            ],
          ),
        ),

        // Error message
        if (errorMessage != null) ...[
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.error_outline_rounded,
                  size: 13, color: _C.error),
              const SizedBox(width: 6),
              Text(
                errorMessage!,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  color: _C.error,
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }
}

// ─────────────────────────────────────────────
// SCAN BUTTON
// ─────────────────────────────────────────────

class _ScanButton extends StatefulWidget {
  final VoidCallback onTap;
  const _ScanButton({required this.onTap});

  @override
  State<_ScanButton> createState() => _ScanButtonState();
}

class _ScanButtonState extends State<_ScanButton> {
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
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          decoration: BoxDecoration(
            color: _hovering ? _C.accent : _C.accent.withOpacity(0.9),
            borderRadius: BorderRadius.circular(10),
            boxShadow: _hovering
                ? [
                    BoxShadow(
                      color: _C.accent.withOpacity(0.35),
                      blurRadius: 16,
                      spreadRadius: 2,
                    ),
                  ]
                : [],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.radar_rounded, size: 16, color: Colors.black),
              const SizedBox(width: 8),
              Text(
                'Scan Store',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Colors.black,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
// STATS STRIP
// ─────────────────────────────────────────────

class _StatsStrip extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final stats = [
      ('Products Scored', 'AI 1–10', Icons.auto_awesome_rounded),
      ('Gap Finder', 'Auto-detect', Icons.manage_search_rounded),
      ('Keyword Radar', 'From titles', Icons.key_rounded),
      ('Listing Ideas', 'One-tap save', Icons.bookmark_add_outlined),
    ];

    return Row(
      children: stats.asMap().entries.map((entry) {
        final i = entry.key;
        final stat = entry.value;
        return Expanded(
          child: Container(
            margin: EdgeInsets.only(right: i < stats.length - 1 ? 12 : 0),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _C.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _C.border),
            ),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: _C.accentDim,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(stat.$3, size: 18, color: _C.accent),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      stat.$1,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: _C.textSecondary,
                      ),
                    ),
                    Text(
                      stat.$2,
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: _C.textPrimary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}

// ─────────────────────────────────────────────
// EMPTY HISTORY
// ─────────────────────────────────────────────

class _EmptyHistory extends StatelessWidget {
  final VoidCallback onScanPressed;
  const _EmptyHistory({required this.onScanPressed});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(40, 0, 40, 40),
      child: Container(
        padding: const EdgeInsets.all(40),
        decoration: BoxDecoration(
          color: _C.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: _C.border),
        ),
        child: Column(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: _C.accentDim,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.radar_rounded,
                  color: _C.accent, size: 26),
            ),
            const SizedBox(height: 16),
            Text(
              'No scans yet',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: _C.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Scan your first competitor store above\nto find winning products instantly.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 13,
                color: _C.textSecondary,
                height: 1.6,
              ),
            ),
            const SizedBox(height: 20),
            GestureDetector(
              onTap: onScanPressed,
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 20, vertical: 10),
                decoration: BoxDecoration(
                  color: _C.accentDim,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: _C.accent.withOpacity(0.3)),
                ),
                child: Text(
                  'Start your first scan →',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: _C.accent,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────
// HISTORY CARD
// ─────────────────────────────────────────────

class _HistoryCard extends StatefulWidget {
  final Map<String, dynamic> scan;
  final VoidCallback onTap;

  const _HistoryCard({required this.scan, required this.onTap});

  @override
  State<_HistoryCard> createState() => _HistoryCardState();
}

class _HistoryCardState extends State<_HistoryCard> {
  bool _hovering = false;

  @override
  Widget build(BuildContext context) {
    final username = widget.scan['username'] ?? '';
    final storeName = widget.scan['store_name'];
    final revenue = (widget.scan['estimated_revenue'] ?? 0.0).toDouble();
    final sold = widget.scan['total_sold'] ?? 0;
    final scannedAt = widget.scan['scanned_at'] != null
        ? DateTime.tryParse(widget.scan['scanned_at'])
        : null;

    return MouseRegion(
      onEnter: (_) => setState(() => _hovering = true),
      onExit: (_) => setState(() => _hovering = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: _hovering ? _C.surfaceHover : _C.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: _hovering
                  ? _C.accent.withOpacity(0.3)
                  : _C.border,
            ),
          ),
          child: Row(
            children: [
              // Store avatar
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: _C.accentDim,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Center(
                  child: Text(
                    username.isNotEmpty
                        ? username[0].toUpperCase()
                        : '?',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: _C.accent,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 14),

              // Name + date
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      storeName ?? username,
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: _C.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      scannedAt != null
                          ? _formatDate(scannedAt)
                          : 'Recently scanned',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: _C.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),

              // Revenue
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '\$${_formatNumber(revenue)}',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: _C.accent,
                    ),
                  ),
                  Text(
                    '$sold sold',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: _C.textSecondary,
                    ),
                  ),
                ],
              ),

              const SizedBox(width: 16),

              // Re-scan arrow
              Icon(
                Icons.arrow_forward_ios_rounded,
                size: 14,
                color: _hovering ? _C.accent : _C.textHint,
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${dt.day}/${dt.month}/${dt.year}';
  }

  String _formatNumber(double n) {
    if (n >= 1000000) return '${(n / 1000000).toStringAsFixed(1)}M';
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(1)}K';
    return n.toStringAsFixed(0);
  }
}

// ─────────────────────────────────────────────
// GHOST BUTTON
// ─────────────────────────────────────────────

class _GhostButton extends StatefulWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _GhostButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  State<_GhostButton> createState() => _GhostButtonState();
}

class _GhostButtonState extends State<_GhostButton> {
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
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: _hovering ? _C.surfaceHover : _C.surface,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: _hovering ? _C.accent.withOpacity(0.4) : _C.border,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(widget.icon, size: 15,
                  color: _hovering ? _C.accent : _C.textSecondary),
              const SizedBox(width: 6),
              Text(
                widget.label,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: _hovering ? _C.accent : _C.textSecondary,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
