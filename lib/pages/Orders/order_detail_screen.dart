// lib/pages/orders/order_detail_screen.dart
//
// SellerPulse - Order Detail Panel (Right Sliding Drawer)
// Comprehensive seller protection view with all risk info

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════
class _C {
  static const bg          = Color(0xFFF8FAFC);
  static const surface     = Color(0xFFFFFFFF);
  static const surfaceHover= Color(0xFFF1F5F9);
  static const border      = Color(0xFFE2E8F0);
  static const accent      = Color(0xFF8FFF00);   // Neon green
  static const accentDark  = Color(0xFF131B2F);   // Dark blue (text on green)
  static const accentDim   = Color(0xFFEEFFCC);
  static const textPrimary = Color(0xFF131B2F);
  static const textSecondary = Color(0xFF64748B);
  static const textHint    = Color(0xFF94A3B8);

  static const riskLow     = Color(0xFF00C48C);
  static const riskMedium  = Color(0xFFFFB800);
  static const riskHigh    = Color(0xFFFF4D6A);
  static const riskLowBg   = Color(0xFFE6FFF5);
  static const riskMedBg   = Color(0xFFFFF8E1);
  static const riskHighBg  = Color(0xFFFFEEF1);
}

// ═══════════════════════════════════════════════════════════════
// SHOW PANEL FUNCTION
// ═══════════════════════════════════════════════════════════════
void showOrderDetailPanel(BuildContext context, Map<String, dynamic> order) {
  showGeneralDialog(
    context: context,
    barrierDismissible: true,
    barrierLabel: 'Close',
    barrierColor: Colors.black54,
    transitionDuration: const Duration(milliseconds: 320),
    pageBuilder: (context, _, __) {
      return Align(
        alignment: Alignment.centerRight,
        child: Material(
          color: Colors.transparent,
          child: Container(
            width: MediaQuery.of(context).size.width * 0.46,
            constraints: const BoxConstraints(minWidth: 520, maxWidth: 720),
            height: MediaQuery.of(context).size.height,
            color: _C.bg,
            child: OrderDetailPanel(order: order),
          ),
        ),
      );
    },
    transitionBuilder: (context, animation, _, child) {
      return SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(1, 0),
          end: Offset.zero,
        ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic)),
        child: child,
      );
    },
  );
}

// ═══════════════════════════════════════════════════════════════
// ORDER DETAIL PANEL
// ═══════════════════════════════════════════════════════════════
class OrderDetailPanel extends StatefulWidget {
  final Map<String, dynamic> order;
  const OrderDetailPanel({super.key, required this.order});

  @override
  State<OrderDetailPanel> createState() => _OrderDetailPanelState();
}

class _OrderDetailPanelState extends State<OrderDetailPanel> {
  final _supabase = Supabase.instance.client;
  Map<String, dynamic>? _checklist;
  bool _showBuyerHistory = false;
  List<Map<String, dynamic>> _evidenceList = [];
  bool _loadingEvidence = false;
  bool _isShipped = false;  // ← ADD THIS LINE
  Map<String, dynamic>? _shipInfo;
  List<Map<String, dynamic>> _sentMessages = [];

  // Mock buyer history for display
  final List<Map<String, dynamic>> _buyerHistory = [
    {'date': 'Oct 20', 'item': 'iPhone 14 Pro', 'price': '\$899', 'outcome': 'RETURNED', 'reason': 'Not as described', 'isRed': true},
    {'date': 'Sep 15', 'item': 'MacBook Air M2', 'price': '\$1,199', 'outcome': 'DISPUTED', 'reason': 'Item damaged', 'isRed': true},
    {'date': 'Aug 30', 'item': 'Sony Camera', 'price': '\$450', 'outcome': 'RETURNED', 'reason': 'Not as described', 'isRed': true},
    {'date': 'Jul 12', 'item': 'Samsung Watch', 'price': '\$380', 'outcome': 'KEPT', 'reason': '', 'isRed': false},
    {'date': 'Jun 5', 'item': 'AirPods Pro', 'price': '\$249', 'outcome': 'RETURNED', 'reason': 'Missing accessories', 'isRed': true},
  ];

@override
void initState() {
  super.initState();
  _loadChecklist();
  _loadEvidence();
  _loadShipInfo();        // ADD THIS
  _loadSentMessages();    // ADD THIS
}

  void _loadChecklist() {
    final raw = widget.order['protection_checklist'];
    if (raw != null) {
      setState(() => _checklist = Map<String, dynamic>.from(raw));
    }
  }

  Future<void> _loadEvidence() async {
    setState(() => _loadingEvidence = true);
    try {
      final data = await _supabase
          .from('order_evidence')
          .select()
          .eq('order_id', widget.order['id'])
          .order('created_at', ascending: false);
      
      setState(() {
        _evidenceList = List<Map<String, dynamic>>.from(data);
        _loadingEvidence = false;
      });
    } catch (e) {
      debugPrint('Error loading evidence: $e');
      setState(() => _loadingEvidence = false);
    }
  }

  Future<void> _loadShipInfo() async {
  final status = widget.order['order_status'] as String? ?? '';
  final tracking = widget.order['tracking_number'] as String?;
  if (status == 'shipped' && tracking != null) {
    setState(() {
      _isShipped = true;
      _shipInfo = {
        'carrier': widget.order['carrier'] ?? 'Unknown',
        'tracking': tracking,
        'shipped_at': widget.order['shipped_at'],
        'expected_delivery': widget.order['expected_delivery'],
        'signature_required': widget.order['signature_required'] ?? false,
        'insurance_amount': widget.order['insurance_amount'],
      };
    });
  }
}

Future<void> _loadSentMessages() async {
  try {
    final data = await _supabase.from('sent_messages').select()
        .eq('order_id', widget.order['id']).order('sent_at', ascending: false);
    setState(() => _sentMessages = List<Map<String, dynamic>>.from(data));
  } catch (_) {}
}

Future<void> _toggleStep(String key) async {
  print('🔄 TOGGLE CLICKED - Key: $key');
  print('📋 Checklist before: $_checklist');
  
  if (_checklist == null) {
    print('❌ Checklist is NULL!');
    return;
  }
  
  setState(() {
    _checklist![key]['completed'] = !(_checklist![key]['completed'] ?? false);
    _checklist![key]['timestamp'] = _checklist![key]['completed']
        ? DateTime.now().toIso8601String()
        : null;
  });
  
  print('✅ Checklist after: $_checklist');
  
  try {
    await _supabase.from('protected_orders').update({
      'protection_checklist': _checklist,
      'checklist_completed': _allDone,
    }).eq('id', widget.order['id']);
    print('💾 Saved to database!');
  } catch (e) {
    print('❌ Database error: $e');
    debugPrint('Checklist error: $e');
  }
}

bool get _allDone =>
    _checklist == null ? false : _checklist!.values.every((s) => s['completed'] == true);

int get _doneCount =>
    _checklist == null ? 0 : _checklist!.values.where((s) => s['completed'] == true).length;

int get _totalCount => _checklist?.length ?? 0;

double get _pct => _totalCount == 0 ? 0 : _doneCount / _totalCount;

// ─── Helpers ───────────────────────────────────────────────
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

// ─── checklist step descriptions ───────────────────────────
final List<Map<String, String>> _steps = [
  {
    'label': 'Record item video before packing',
    'warning': 'Without this: Cannot prove item condition to eBay',
  },
  {
    'label': 'Film packing process (uncut video)',
    'warning': "Without this: Buyer can claim 'wrong item sent'",
  },
  {
    'label': 'Use signature-required shipping',
    'warning': "Without this: Buyer can claim 'never received'",
  },
  {
    'label': 'Send pre-shipment message to buyer',
    'warning': 'Without this: No communication record if disputed',
  },
  {
    'label': 'Upload evidence to vault',
    'warning': 'Without this: No proof stored for eBay case',
  },
];

@override
Widget build(BuildContext context) {
  final riskLevel    = widget.order['risk_level']        as String? ?? 'LOW';
  final riskScore    = widget.order['risk_score']        as int?    ?? 0;
  final itemTitle    = widget.order['item_title']        as String? ?? 'Unknown Item';
  final itemPrice    = widget.order['item_price']        as num?    ?? 0.0;
  final buyerName    = widget.order['buyer_username']    as String? ?? 'Unknown';
  final orderId      = widget.order['ebay_order_id']                ?? 'Unknown';
  final orderStatus  = widget.order['order_status']      as String? ?? 'pending';
  final createdAt    = DateTime.tryParse(widget.order['created_at'] ?? '');
  final profile      = widget.order['buyer_profiles'];
  final returnRate   = profile?['return_rate']  as num? ?? 0.0;
  final disputeCount = profile?['dispute_count'] as int? ?? 0;
  final aiAnalysis   = profile?['ai_analysis']  as String?;
  final patterns     = profile?['risk_patterns'] as List<dynamic>? ?? [];

  final rc  = _riskColor(riskLevel);
  final rbg = _riskBg(riskLevel);

  // Financial risk
  final potentialLoss = itemPrice;
  final isSafe        = _allDone;
  final daysUntilDeadline = 3; // mock

  return Column(
    children: [
      // ══════ HEADER ══════════════════════════════════════════
      _buildHeader(orderId, createdAt),

      // ══════ BODY ════════════════════════════════════════════
      Expanded(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [

              // 1. ALERT BANNER
              _buildAlertBanner(riskLevel, rc, rbg, potentialLoss, daysUntilDeadline, isSafe),
              const SizedBox(height: 16),

              // 2. ORDER SUMMARY + RISK SCORE (side by side)
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(child: _buildOrderSummary(itemTitle, itemPrice, buyerName, orderStatus)),
                  const SizedBox(width: 12),
                  Expanded(child: _buildRiskScore(riskLevel, riskScore, rc, rbg, returnRate, disputeCount)),
                ],
              ),
              const SizedBox(height: 16),

              // 3. WHY IS THIS BUYER RISKY
              _buildWhyRisky(rc, rbg, riskLevel, patterns, aiAnalysis),
              const SizedBox(height: 16),

              // 4. PROTECTION CHECKLIST
              if (_checklist != null && _checklist!.isNotEmpty)
                _buildChecklist(rc),
              const SizedBox(height: 16),

              // 5. EVIDENCE VAULT
              _buildEvidenceVault(),
              const SizedBox(height: 16),

              // 6. BUYER HISTORY
              _buildBuyerHistory(rc),
              const SizedBox(height: 16),

              // 7. SHIPPING
              _buildShipping(riskLevel, rc),
              const SizedBox(height: 16),

              // 8. QUICK ACTIONS
              _buildQuickActions(rc),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    ],
  );
}

  // ═══════════════════════════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════════════════════════
  Widget _buildHeader(String orderId, DateTime? createdAt) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 12, 16),
      decoration: BoxDecoration(
        color: _C.surface,
        border: Border(bottom: BorderSide(color: _C.border)),
      ),
      child: Row(
        children: [
          // Neon green shield logo
          Container(
            width: 32, height: 32,
            decoration: BoxDecoration(
              color: _C.accent,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.shield, size: 18, color: _C.accentDark),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Order #$orderId',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 16, fontWeight: FontWeight.w700,
                    color: _C.textPrimary,
                  ),
                ),
                if (createdAt != null)
                  Text(
                    _formatDate(createdAt),
                    style: GoogleFonts.inter(fontSize: 12, color: _C.textHint),
                  ),
              ],
            ),
          ),
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.close, size: 20, color: _C.textSecondary),
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 1. ALERT BANNER
  // ═══════════════════════════════════════════════════════════════
  Widget _buildAlertBanner(String riskLevel, Color rc, Color rbg,
      num potentialLoss, int daysLeft, bool isSafe) {
    if (isSafe) {
      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: _C.accentDim,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: _C.accent.withOpacity(0.4)),
        ),
        child: Row(
          children: [
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(
                color: _C.accent,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.verified, size: 20, color: _C.accentDark),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('ORDER PROTECTED ✓',
                    style: GoogleFonts.spaceGrotesk(fontSize: 13,
                        fontWeight: FontWeight.w700, color: _C.accentDark)),
                  Text('All protection steps completed. Safe to ship!',
                    style: GoogleFonts.inter(fontSize: 11, color: _C.textSecondary)),
                ],
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: rbg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: rc.withOpacity(0.4), width: 2),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 36, height: 36,
                decoration: BoxDecoration(
                  color: rc,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.warning_rounded, size: 20, color: Colors.white),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      riskLevel == 'HIGH'
                          ? '⚠️ DO NOT SHIP - Action Required!'
                          : '⚠️ Extra Caution Required',
                      style: GoogleFonts.spaceGrotesk(fontSize: 13,
                          fontWeight: FontWeight.w700, color: rc),
                    ),
                    Text('Complete all protection steps first',
                      style: GoogleFonts.inter(fontSize: 11, color: _C.textSecondary)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _alertStat('💰 At Risk', '\$${potentialLoss.toStringAsFixed(2)}', rc)),
              const SizedBox(width: 8),
              Expanded(child: _alertStat('📅 Ship Deadline', '$daysLeft days', rc)),
              const SizedBox(width: 8),
              Expanded(child: _alertStat('🛡️ Protection',
                  '${_doneCount}/${_totalCount} done', rc)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _alertStat(String label, String value, Color rc) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.6),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Text(value, style: GoogleFonts.spaceGrotesk(
              fontSize: 14, fontWeight: FontWeight.w700, color: rc)),
          const SizedBox(height: 2),
          Text(label, style: GoogleFonts.inter(fontSize: 9,
              fontWeight: FontWeight.w600, color: _C.textSecondary)),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 2. ORDER SUMMARY CARD
  // ═══════════════════════════════════════════════════════════════
  Widget _buildOrderSummary(String title, num price, String buyer, String status) {
    Color statusColor = status == 'shipped'
        ? const Color(0xFF1976D2)
        : status == 'delivered'
            ? _C.riskLow
            : _C.textSecondary;

    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionLabel('ORDER SUMMARY'),
          const SizedBox(height: 12),
          Text(title,
            style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600,
                color: _C.textPrimary),
            maxLines: 2, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 6),
          Text('\$${price.toStringAsFixed(2)}',
            style: GoogleFonts.spaceGrotesk(fontSize: 20,
                fontWeight: FontWeight.w800, color: _C.textPrimary)),
          const SizedBox(height: 12),
          const Divider(height: 1, color: _C.border),
          const SizedBox(height: 10),
          _miniRow(Icons.person_outline, 'Buyer', buyer),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.circle, size: 8, color: _C.textHint),
              const SizedBox(width: 8),
              Text('Status: ',
                style: GoogleFonts.inter(fontSize: 11, color: _C.textSecondary)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(status.toUpperCase(),
                  style: GoogleFonts.inter(fontSize: 9,
                      fontWeight: FontWeight.w700, color: statusColor)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 2B. RISK SCORE CARD
  // ═══════════════════════════════════════════════════════════════
  Widget _buildRiskScore(String lvl, int score, Color rc, Color rbg,
      num returnRate, int disputes) {
    return _card(
      color: rbg,
      borderColor: rc.withOpacity(0.3),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: rc,
                  borderRadius: BorderRadius.circular(5),
                ),
                child: Text('$lvl RISK',
                  style: GoogleFonts.inter(fontSize: 9,
                      fontWeight: FontWeight.w700, color: Colors.white,
                      letterSpacing: 0.4)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text('$score',
            style: GoogleFonts.spaceGrotesk(fontSize: 36,
                fontWeight: FontWeight.w800, color: rc)),
          Text('out of 100',
            style: GoogleFonts.inter(fontSize: 10, color: _C.textHint)),
          const SizedBox(height: 8),
          // Score bar
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: score / 100,
              backgroundColor: Colors.white.withOpacity(0.5),
              valueColor: AlwaysStoppedAnimation<Color>(rc),
              minHeight: 6,
            ),
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, color: Color(0xFFE2E8F0)),
          const SizedBox(height: 10),
          _miniStat('Return Rate', '${returnRate.toStringAsFixed(0)}%', rc),
          const SizedBox(height: 4),
          _miniStat('Disputes', disputes.toString(), rc),
        ],
      ),
    );
  }

  Widget _miniStat(String label, String value, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label,
          style: GoogleFonts.inter(fontSize: 11, color: _C.textSecondary)),
        Text(value,
          style: GoogleFonts.spaceGrotesk(fontSize: 13,
              fontWeight: FontWeight.w700, color: color)),
      ],
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 3. WHY IS THIS BUYER RISKY
  // ═══════════════════════════════════════════════════════════════
  Widget _buildWhyRisky(Color rc, Color rbg, String lvl,
      List<dynamic> patterns, String? ai) {
    final flags = [
      'Serial INAD claimer (12 cases in 8 months)',
      'Returns 65% of high-value electronics',
      "Always claims 'Not as described' after 15-25 days",
      'Never accepts partial refunds - always full return',
    ];

    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 28, height: 28,
                decoration: BoxDecoration(
                  color: _C.accent,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: _C.accentDark, width: 1.5),
                ),
                child: const Icon(Icons.crisis_alert, size: 16, color: _C.accentDark),
              ),
              const SizedBox(width: 8),
              Text('WHY THIS BUYER IS RISKY',
                style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700,
                    color: _C.textHint, letterSpacing: 0.5)),
            ],
          ),
          const SizedBox(height: 14),

          // AI Analysis if available
          if (ai != null && ai.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: _C.bg,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: _C.border),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.psychology_outlined, size: 16, color: _C.accent),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('AI ANALYSIS',
                          style: GoogleFonts.inter(fontSize: 9,
                              fontWeight: FontWeight.w700, color: _C.accent,
                              letterSpacing: 0.5)),
                        const SizedBox(height: 4),
                        Text(ai,
                          style: GoogleFonts.inter(fontSize: 12,
                              color: _C.textPrimary, height: 1.4)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],

          // Detected patterns chips
          if (patterns.isNotEmpty) ...[
            Wrap(
              spacing: 6, runSpacing: 6,
              children: patterns.map((p) => Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: rc.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: rc.withOpacity(0.3)),
                ),
                child: Text(p.toString().replaceAll('_', ' '),
                  style: GoogleFonts.inter(fontSize: 10,
                      fontWeight: FontWeight.w600, color: rc)),
              )).toList(),
            ),
            const SizedBox(height: 12),
          ],

          // Red flags list
          Text('DETECTED RED FLAGS',
            style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w700,
                color: _C.textHint, letterSpacing: 0.5)),
          const SizedBox(height: 8),
          ...flags.map((f) => Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  margin: const EdgeInsets.only(top: 3),
                  width: 6, height: 6,
                  decoration: BoxDecoration(
                    color: rc,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(f,
                    style: GoogleFonts.inter(fontSize: 12, color: _C.textPrimary, height: 1.4)),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 4. PROTECTION CHECKLIST
  // ═══════════════════════════════════════════════════════════════
  Widget _buildChecklist(Color rc) {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 28, height: 28,
                decoration: BoxDecoration(
                  color: _C.accent,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: _C.accentDark, width: 1.5),
                ),
                child: const Icon(Icons.shield, size: 16, color: _C.accentDark),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text('PROTECTION CHECKLIST',
                  style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700,
                      color: _C.textHint, letterSpacing: 0.5)),
              ),
              // Progress badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: _allDone ? _C.accent : rc.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                    color: _allDone ? _C.accentDark.withOpacity(0.3) : rc.withOpacity(0.3),
                  ),
                ),
                child: Text(
                  '${(_pct * 100).toStringAsFixed(0)}%',
                  style: GoogleFonts.spaceGrotesk(fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: _allDone ? _C.accentDark : rc),
                ),
              ),
            ],
          ),

          const SizedBox(height: 6),
          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: _pct,
              backgroundColor: _C.border,
              valueColor: AlwaysStoppedAnimation<Color>(_allDone ? _C.accent : rc),
              minHeight: 4,
            ),
          ),

          const SizedBox(height: 14),

          ...(_checklist!.entries.toList().asMap().entries.map((e) {
            final idx      = e.key;
            final stepKey  = e.value.key;
            final stepData = e.value.value;
            final done     = stepData['completed'] ?? false;
            final label    = idx < _steps.length ? _steps[idx]['label']! : stepData['label'] ?? '';
            final warning  = idx < _steps.length ? _steps[idx]['warning']! : '';

            return _checklistRow(idx + 1, label, warning, done,
                () => _toggleStep(stepKey));
          }).toList()),
        ],
      ),
    );
  }

  Widget _checklistRow(int num, String label, String warning,
      bool done, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: done ? _C.accentDim : _C.bg,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: done ? _C.accent.withOpacity(0.5) : _C.border,
              width: done ? 1.5 : 1,
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Checkbox
              Container(
                width: 22, height: 22,
                decoration: BoxDecoration(
                  color: done ? _C.accent : Colors.transparent,
                  borderRadius: BorderRadius.circular(5),
                  border: Border.all(
                    color: done ? _C.accent : _C.border, width: 2),
                ),
                child: done
                    ? const Icon(Icons.check, size: 14, color: _C.accentDark)
                    : null,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(label,
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: done ? FontWeight.w600 : FontWeight.w500,
                        color: done ? _C.accentDark : _C.textPrimary,
                      ),
                    ),
                    if (!done && warning.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.info_outline, size: 11,
                              color: Color(0xFFFFB800)),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(warning,
                              style: GoogleFonts.inter(fontSize: 10,
                                  color: _C.textSecondary, height: 1.3)),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 5. EVIDENCE VAULT (Link-Based)
  // ═══════════════════════════════════════════════════════════════
  Widget _buildEvidenceVault() {
    final evidenceTypes = [
      {'type': 'serial_number', 'icon': Icons.photo_camera, 'label': 'Serial number close-up'},
      {'type': 'item_photos', 'icon': Icons.photo_library, 'label': 'Item from all angles'},
      {'type': 'packing_video', 'icon': Icons.videocam, 'label': 'Packing video (uncut, 2-5 min)'},
      {'type': 'shipping_label', 'icon': Icons.local_shipping, 'label': 'Shipping label + tracking'},
      {'type': 'weight_receipt', 'icon': Icons.receipt, 'label': 'Weight receipt from carrier'},
    ];

    final uploadedTypes = _evidenceList.map((e) => e['evidence_type']).toSet();

    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 28, height: 28,
                decoration: BoxDecoration(
                  color: _C.accent,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: _C.accentDark, width: 1.5),
                ),
                child: const Icon(Icons.folder_open, size: 16, color: _C.accentDark),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text('EVIDENCE VAULT',
                  style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700,
                      color: _C.textHint, letterSpacing: 0.5)),
              ),
              Text('${_evidenceList.length} files',
                style: GoogleFonts.inter(fontSize: 11,
                    fontWeight: FontWeight.w600, color: _C.textSecondary)),
            ],
          ),
          const SizedBox(height: 14),

          // Required evidence checklist
          Text('REQUIRED EVIDENCE',
            style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w700,
                color: _C.textHint, letterSpacing: 0.5)),
          const SizedBox(height: 8),
          
          ...evidenceTypes.map((e) {
            final uploaded = uploadedTypes.contains(e['type']);
            return Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                children: [
                  Icon(
                    uploaded ? Icons.check_circle : Icons.radio_button_unchecked,
                    size: 16,
                    color: uploaded ? _C.accent : _C.textHint,
                  ),
                  const SizedBox(width: 8),
                  Icon(e['icon'] as IconData, size: 14, color: _C.textSecondary),
                  const SizedBox(width: 6),
                  Text(e['label'] as String,
                    style: GoogleFonts.inter(fontSize: 12, color: _C.textSecondary)),
                ],
              ),
            );
          }),

          const SizedBox(height: 14),

          // Uploaded evidence list
          if (_evidenceList.isNotEmpty) ...[
            Text('UPLOADED EVIDENCE',
              style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w700,
                  color: _C.textHint, letterSpacing: 0.5)),
            const SizedBox(height: 8),
            
            ..._evidenceList.map((evidence) => _evidenceItem(evidence)),
            
            const SizedBox(height: 12),
          ],

          // Add evidence button
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _showAddEvidenceDialog,
              icon: const Icon(Icons.add_link, size: 16),
              label: const Text('Add Evidence Link'),
              style: OutlinedButton.styleFrom(
                foregroundColor: _C.accent,
                side: BorderSide(color: _C.accent, width: 1.5),
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _evidenceItem(Map<String, dynamic> evidence) {
    final type = evidence['evidence_type'] as String;
    final url = evidence['link_url'] as String;
    final provider = evidence['cloud_provider'] as String?;
    final notes = evidence['notes'] as String?;
    final createdAt = DateTime.parse(evidence['created_at']);

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _C.accentDim.withOpacity(0.4),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _C.accent.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          // Type icon
          Container(
            width: 32, height: 32,
            decoration: BoxDecoration(
              color: _C.accent.withOpacity(0.2),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Icon(_getEvidenceIcon(type), size: 16, color: _C.accentDark),
          ),
          const SizedBox(width: 12),
          
          // Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _getEvidenceLabel(type),
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: _C.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Icon(_getCloudIcon(provider), size: 11, color: _C.textHint),
                    const SizedBox(width: 4),
                    Text(
                      '${_formatCloudProvider(provider)} • ${_formatDate(createdAt)}',
                      style: GoogleFonts.inter(fontSize: 10, color: _C.textHint),
                    ),
                  ],
                ),
                if (notes != null && notes.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    notes,
                    style: GoogleFonts.inter(fontSize: 11, color: _C.textSecondary),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
          
          // View button
          IconButton(
            icon: Icon(Icons.open_in_new, size: 18, color: _C.accent),
            onPressed: () => _openLink(url),
            tooltip: 'View',
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
          const SizedBox(width: 8),
          
          // Delete button
          IconButton(
            icon: Icon(Icons.delete_outline, size: 18, color: _C.riskHigh),
            onPressed: () => _deleteEvidence(evidence['id']),
            tooltip: 'Delete',
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
        ],
      ),
    );
  }

  void _showAddEvidenceDialog() {
    final linkController = TextEditingController();
    final notesController = TextEditingController();
    String selectedType = 'packing_video';

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Add Evidence Link',
          style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w700)),
        content: SingleChildScrollView(
          child: SizedBox(
            width: 400,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Evidence type dropdown
                Text('Evidence Type',
                  style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                DropdownButtonFormField<String>(
                  value: selectedType,
                  decoration: InputDecoration(
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'serial_number', child: Text('📸 Serial Number Close-up')),
                    DropdownMenuItem(value: 'item_photos', child: Text('📷 Item from All Angles')),
                    DropdownMenuItem(value: 'packing_video', child: Text('🎥 Packing Video')),
                    DropdownMenuItem(value: 'shipping_label', child: Text('📦 Shipping Label')),
                    DropdownMenuItem(value: 'weight_receipt', child: Text('📄 Weight Receipt')),
                  ],
                  onChanged: (val) => selectedType = val!,
                ),
                
                const SizedBox(height: 16),
                
                // Link input
                Text('Paste Shareable Link',
                  style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                TextField(
                  controller: linkController,
                  decoration: InputDecoration(
                    hintText: 'https://drive.google.com/file/...',
                    hintStyle: GoogleFonts.inter(fontSize: 13, color: _C.textHint),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    contentPadding: const EdgeInsets.all(12),
                    prefixIcon: const Icon(Icons.link, size: 20),
                  ),
                ),
                
                const SizedBox(height: 12),
                
                // Helper text
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: _C.accentDim,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.info_outline, size: 16, color: _C.accent),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Upload to Google Drive/Photos/Dropbox and paste the shareable link here',
                          style: GoogleFonts.inter(fontSize: 11, color: _C.accentDark),
                        ),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 16),
                
                // Optional notes
                Text('Notes (Optional)',
                  style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                TextField(
                  controller: notesController,
                  maxLines: 2,
                  decoration: InputDecoration(
                    hintText: 'e.g., "Uncut 3min packing video"',
                    hintStyle: GoogleFonts.inter(fontSize: 13, color: _C.textHint),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    contentPadding: const EdgeInsets.all(12),
                  ),
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (linkController.text.trim().isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please paste a link first!')),
                );
                return;
              }
              
              await _saveEvidenceLink(
                type: selectedType,
                url: linkController.text.trim(),
                notes: notesController.text.trim(),
              );
              
              if (ctx.mounted) Navigator.pop(ctx);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: _C.accent,
              foregroundColor: _C.accentDark,
            ),
            child: const Text('Add Evidence'),
          ),
        ],
      ),
    );
  }

  Future<void> _saveEvidenceLink({
    required String type,
    required String url,
    required String notes,
  }) async {
    try {
      // Detect cloud provider from URL
      String provider = 'other';
      if (url.contains('drive.google.com')) provider = 'google_drive';
      if (url.contains('photos.google.com') || url.contains('photos.app.goo.gl')) {
        provider = 'google_photos';
      }
      if (url.contains('dropbox.com')) provider = 'dropbox';
      if (url.contains('icloud.com')) provider = 'icloud';
      
      await _supabase.from('order_evidence').insert({
        'order_id': widget.order['id'],
        'user_id': _supabase.auth.currentUser?.id,
        'evidence_type': type,
        'link_url': url,
        'cloud_provider': provider,
        'notes': notes.isEmpty ? null : notes,
      });
      
      await _loadEvidence(); // Reload list
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('✅ Evidence link added successfully!'),
            backgroundColor: _C.accent,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  Future<void> _deleteEvidence(String id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Delete Evidence?',
          style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w700)),
        content: const Text('Are you sure you want to remove this evidence link?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: _C.riskHigh),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await _supabase.from('order_evidence').delete().eq('id', id);
        await _loadEvidence();
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Evidence deleted')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e')),
          );
        }
      }
    }
  }

  void _openLink(String url) async {
    try {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Could not open link')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error opening link: $e')),
        );
      }
    }
  }

  IconData _getEvidenceIcon(String type) {
    switch (type) {
      case 'serial_number': return Icons.photo_camera;
      case 'item_photos': return Icons.photo_library;
      case 'packing_video': return Icons.videocam;
      case 'shipping_label': return Icons.local_shipping;
      case 'weight_receipt': return Icons.receipt;
      default: return Icons.insert_drive_file;
    }
  }

  String _getEvidenceLabel(String type) {
    switch (type) {
      case 'serial_number': return 'Serial Number Close-up';
      case 'item_photos': return 'Item from All Angles';
      case 'packing_video': return 'Packing Video';
      case 'shipping_label': return 'Shipping Label';
      case 'weight_receipt': return 'Weight Receipt';
      default: return 'Evidence';
    }
  }

  IconData _getCloudIcon(String? provider) {
    switch (provider) {
      case 'google_drive': return Icons.cloud;
      case 'google_photos': return Icons.photo;
      case 'dropbox': return Icons.cloud_queue;
      case 'icloud': return Icons.cloud_circle;
      default: return Icons.link;
    }
  }

  String _formatCloudProvider(String? provider) {
    switch (provider) {
      case 'google_drive': return 'Google Drive';
      case 'google_photos': return 'Google Photos';
      case 'dropbox': return 'Dropbox';
      case 'icloud': return 'iCloud';
      default: return 'Link';
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 6. BUYER HISTORY
  // ═══════════════════════════════════════════════════════════════
  Widget _buildBuyerHistory(Color rc) {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GestureDetector(
            onTap: () => setState(() => _showBuyerHistory = !_showBuyerHistory),
            child: Row(
              children: [
                Container(
                  width: 28, height: 28,
                  decoration: BoxDecoration(
                    color: _C.accent,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: _C.accentDark, width: 1.5),
                  ),
                  child: const Icon(Icons.history, size: 16, color: _C.accentDark),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text('BUYER HISTORY & PATTERNS',
                    style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700,
                        color: _C.textHint, letterSpacing: 0.5)),
                ),
                Icon(
                  _showBuyerHistory ? Icons.expand_less : Icons.expand_more,
                  size: 20, color: _C.textHint,
                ),
              ],
            ),
          ),

          if (_showBuyerHistory) ...[
            const SizedBox(height: 14),

            // Stats row
            Row(
              children: [
                Expanded(child: _histStat('Account Age', '2 Years')),
                const SizedBox(width: 8),
                Expanded(child: _histStat('Total Buys', '47 items')),
                const SizedBox(width: 8),
                Expanded(child: _histStat('Win Rate', '72%')),
              ],
            ),
            const SizedBox(height: 14),

            Text('LAST 5 TRANSACTIONS',
              style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w700,
                  color: _C.textHint, letterSpacing: 0.5)),
            const SizedBox(height: 8),

            ..._buyerHistory.map((h) => Container(
              margin: const EdgeInsets.only(bottom: 6),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: (h['isRed'] as bool)
                    ? _C.riskHighBg
                    : _C.accentDim.withOpacity(0.5),
                borderRadius: BorderRadius.circular(7),
                border: Border.all(
                  color: (h['isRed'] as bool)
                      ? _C.riskHigh.withOpacity(0.2)
                      : _C.accent.withOpacity(0.2),
                ),
              ),
              child: Row(
                children: [
                  Text(h['date'] as String,
                    style: GoogleFonts.inter(fontSize: 10,
                        fontWeight: FontWeight.w600, color: _C.textHint)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(h['item'] as String,
                      style: GoogleFonts.inter(fontSize: 11,
                          color: _C.textPrimary),
                      overflow: TextOverflow.ellipsis),
                  ),
                  const SizedBox(width: 4),
                  Text(h['price'] as String,
                    style: GoogleFonts.spaceGrotesk(fontSize: 11,
                        fontWeight: FontWeight.w700, color: _C.textPrimary)),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                    decoration: BoxDecoration(
                      color: (h['isRed'] as bool)
                          ? _C.riskHigh
                          : _C.accent,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(h['outcome'] as String,
                      style: GoogleFonts.inter(
                        fontSize: 8,
                        fontWeight: FontWeight.w700,
                        color: (h['isRed'] as bool)
                            ? Colors.white
                            : _C.accentDark,
                      )),
                  ),
                ],
              ),
            )),
          ] else ...[
            const SizedBox(height: 10),
            Text('Tap to view buyer\'s transaction history and patterns',
              style: GoogleFonts.inter(fontSize: 11, color: _C.textSecondary)),
          ],
        ],
      ),
    );
  }

  Widget _histStat(String label, String value) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: _C.bg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _C.border),
      ),
      child: Column(
        children: [
          Text(value,
            style: GoogleFonts.spaceGrotesk(fontSize: 14,
                fontWeight: FontWeight.w700, color: _C.textPrimary)),
          const SizedBox(height: 2),
          Text(label,
            style: GoogleFonts.inter(fontSize: 9,
                fontWeight: FontWeight.w600, color: _C.textHint)),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 7. SHIPPING REQUIREMENTS
  // ═══════════════════════════════════════════════════════════════
  Widget _buildShipping(String riskLevel, Color rc) {
    final requirements = riskLevel == 'HIGH'
        ? ['Signature on delivery (MANDATORY)', 'Insurance: Full item value', 'GPS tracking enabled', 'UPS or FedEx recommended']
        : riskLevel == 'MEDIUM'
            ? ['Tracking number required', 'Insurance recommended', 'Keep shipping receipt']
            : ['Standard shipping acceptable', 'Keep tracking number'];

    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 28, height: 28,
                decoration: BoxDecoration(
                  color: _C.accent,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: _C.accentDark, width: 1.5),
                ),
                child: const Icon(Icons.local_shipping, size: 16, color: _C.accentDark),
              ),
              const SizedBox(width: 8),
              Text('SHIPPING REQUIREMENTS',
                style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700,
                    color: _C.textHint, letterSpacing: 0.5)),
            ],
          ),
          const SizedBox(height: 12),

          if (riskLevel == 'HIGH')
            Container(
              padding: const EdgeInsets.all(10),
              margin: const EdgeInsets.only(bottom: 10),
              decoration: BoxDecoration(
                color: rc.withOpacity(0.1),
                borderRadius: BorderRadius.circular(7),
                border: Border.all(color: rc.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Icon(Icons.warning_amber, size: 16, color: rc),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text('HIGH RISK - Extra shipping protection required!',
                      style: GoogleFonts.inter(fontSize: 11,
                          fontWeight: FontWeight.w600, color: rc)),
                  ),
                ],
              ),
            ),

          ...requirements.map((r) => Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(
              children: [
                Icon(Icons.check_circle, size: 14, color: _C.accent),
                const SizedBox(width: 8),
                Text(r,
                  style: GoogleFonts.inter(fontSize: 12, color: _C.textPrimary)),
              ],
            ),
          )),
          const SizedBox(height: 12),

          // Not shipped info
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: _C.bg,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(Icons.info_outline, size: 16, color: _C.textHint),
                const SizedBox(width: 8),
                Text('Not shipped yet',
                  style: GoogleFonts.inter(fontSize: 12, color: _C.textSecondary)),
              ],
            ),
          ),
          const SizedBox(height: 12),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _allDone ? _showMarkAsShippedDialog : null,
              icon: const Icon(Icons.local_shipping_outlined, size: 16),
              label: Text(_allDone ? 'Mark as Shipped' : 'Complete checklist first'),
              style: ElevatedButton.styleFrom(
                backgroundColor: _allDone ? _C.accent : _C.border,
                foregroundColor: _allDone ? _C.accentDark : _C.textHint,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 8. QUICK ACTIONS
  // ═══════════════════════════════════════════════════════════════
  Widget _buildQuickActions(Color rc) {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 28, height: 28,
                decoration: BoxDecoration(
                  color: _C.accent,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: _C.accentDark, width: 1.5),
                ),
                child: const Icon(Icons.bolt, size: 16, color: _C.accentDark),
              ),
              const SizedBox(width: 8),
              Text('QUICK ACTIONS',
                style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700,
                    color: _C.textHint, letterSpacing: 0.5)),
            ],
          ),
          const SizedBox(height: 14),

          // Message template button
          _actionButton(
            icon: Icons.message_outlined,
            label: 'Send Pre-Shipment Message',
            subtitle: 'Template: Notify buyer with tracking proof',
            color: const Color(0xFF1976D2),
            onTap: _showMessageTemplateDialog,
          ),
          const SizedBox(height: 8),

          // eBay policy button
          _actionButton(
            icon: Icons.policy_outlined,
            label: 'View eBay INAD Policy',
            subtitle: 'How to win Item Not As Described cases',
            color: const Color(0xFF9C27B0),
            onTap: () => _snack('eBay policy link coming soon!'),
          ),
          const SizedBox(height: 8),

          // Cancel/refund button
          _actionButton(
            icon: Icons.cancel_outlined,
            label: 'Cancel This Order',
            subtitle: 'Refund now to avoid potential dispute loss',
            color: _C.riskHigh,
            onTap: () => _showCancelDialog(),
          ),
        ],
      ),
    );
  }

  Widget _actionButton({
    required IconData icon,
    required String label,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.05),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Row(
          children: [
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, size: 18, color: color),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                    style: GoogleFonts.inter(fontSize: 13,
                        fontWeight: FontWeight.w600, color: _C.textPrimary)),
                  Text(subtitle,
                    style: GoogleFonts.inter(fontSize: 10, color: _C.textSecondary)),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, size: 12, color: _C.textHint),
          ],
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════
  Widget _card({required Widget child, Color? color, Color? borderColor}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color ?? _C.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor ?? _C.border),
      ),
      child: child,
    );
  }

  Widget _sectionLabel(String text) {
    return Text(text,
      style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700,
          color: _C.textHint, letterSpacing: 0.5));
  }

  Widget _miniRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 13, color: _C.textHint),
        const SizedBox(width: 6),
        Text('$label: ',
          style: GoogleFonts.inter(fontSize: 11, color: _C.textSecondary)),
        Expanded(
          child: Text(value,
            style: GoogleFonts.inter(fontSize: 11,
                fontWeight: FontWeight.w600, color: _C.textPrimary),
            overflow: TextOverflow.ellipsis),
        ),
      ],
    );
  }

  void _snack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  void _showCancelDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Cancel Order?',
          style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w700)),
        content: Text(
          'Are you sure you want to cancel and refund this order? This action cannot be undone.',
          style: GoogleFonts.inter(fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Keep Order'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              _snack('Order cancellation coming soon!');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: _C.riskHigh,
              foregroundColor: Colors.white,
            ),
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );
  }

  void _showMessageTemplateDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Message Templates'),
        content: Text('Template system will be added in next update!'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Close'),
          ),
        ],
      ),
    );
  }

void _showMarkAsShippedDialog() {
  final trackingCtrl = TextEditingController();
  String carrier = 'UPS';
  bool sigRequired = true;
  bool insurance = true;
  final insuranceAmt = (widget.order['item_price'] as num?)?.toDouble() ?? 0.0;
  bool autoMessage = true;
  DateTime shipDate = DateTime.now();
  DateTime expectedDelivery = DateTime.now().add(const Duration(days: 3));

  showDialog(
    context: context,
    builder: (ctx) => StatefulBuilder(
      builder: (ctx, setInner) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Container(
              width: 32, height: 32,
              decoration: BoxDecoration(
                color: _C.accent,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.local_shipping, size: 18, color: _C.accentDark),
            ),
            const SizedBox(width: 10),
            Text('Mark as Shipped',
              style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w700, fontSize: 18)),
          ],
        ),
        content: SingleChildScrollView(
          child: SizedBox(
            width: 420,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                
                // ─ Carrier ─
                Text('Carrier *',
                  style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                Theme(
                  data: Theme.of(context).copyWith(
                    hoverColor: Colors.transparent,
                    splashColor: Colors.transparent,
                    highlightColor: Colors.transparent,
                    focusColor: Colors.transparent,
                  ),
                  child: DropdownButtonFormField<String>(
                    isExpanded: true,
                    value: carrier,
                    icon: const Icon(Icons.keyboard_arrow_down, size: 16, color: Color(0xFF0F172A)),
                    dropdownColor: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    focusColor: Colors.transparent,
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 4, vertical: 0),
                      enabledBorder: UnderlineInputBorder(
                        borderSide: BorderSide(color: Colors.black.withAlpha(150), width: 1.2),
                      ),
                      focusedBorder: const UnderlineInputBorder(
                        borderSide: BorderSide(color: Color(0xFF8FFF00), width: 2.0),
                      ),
                    ),
                    
                    selectedItemBuilder: (BuildContext context) {
                      return ['UPS', 'FedEx', 'USPS', 'DHL', 'Other'].map<Widget>((item) {
                        return Text(
                          item,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 13,
                            color: Color(0xFF1E293B),
                            fontWeight: FontWeight.w700,
                          ),
                        );
                      }).toList();
                    },

                    items: ['UPS', 'FedEx', 'USPS', 'DHL', 'Other'].map((item) {
                      final isSelected = carrier == item;
                      
                      return DropdownMenuItem(
                        value: item,
                        child: StatefulBuilder(
                          builder: (context, setDropdownState) {
                            bool isHovered = false;
                            
                            return MouseRegion(
                              onEnter: (_) => setDropdownState(() => isHovered = true),
                              onExit: (_) => setDropdownState(() => isHovered = false),
                              child: Container(
                                width: double.infinity,
                                alignment: Alignment.centerLeft,
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                margin: const EdgeInsets.symmetric(vertical: 2),
                                decoration: BoxDecoration(
                                  color: isSelected ? const Color(0xFF8FFF00) : Colors.transparent,
                                  borderRadius: BorderRadius.circular(25),
                                  border: Border.all(
                                    color: (isHovered && !isSelected) 
                                        ? const Color(0xFF8FFF00) 
                                        : Colors.transparent,
                                    width: 1.5,
                                  ),
                                ),
                                child: Text(
                                  item,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: isSelected ? Colors.black : const Color(0xFF0F172A),
                                    fontWeight: isSelected ? FontWeight.w900 : FontWeight.w500,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            );
                          },
                        ),
                      );
                    }).toList(),
                    
                    onChanged: (v) {
                      setInner(() {
                        carrier = v!;
                        int days = carrier == 'UPS' ? 3 : carrier == 'FedEx' ? 2 : 5;
                        expectedDelivery = shipDate.add(Duration(days: days));
                      });
                    },
                  ),
                ),

                const SizedBox(height: 14),
                
                // ─ Tracking ─
                Text('Tracking Number *',
                  style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                TextField(
                  controller: trackingCtrl,
                  decoration: InputDecoration(
                    hintText: '1Z999AA10123456784',
                    hintStyle: GoogleFonts.inter(fontSize: 13, color: _C.textHint),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    contentPadding: const EdgeInsets.all(12),
                    prefixIcon: const Icon(Icons.confirmation_number, size: 20),
                  ),
                ),
                const SizedBox(height: 14),
                
                // ─ Ship Date ─
                Text('Ship Date *',
                  style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                InkWell(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: ctx,
                      initialDate: shipDate,
                      firstDate: DateTime.now().subtract(const Duration(days: 3)),
                      lastDate: DateTime.now().add(const Duration(days: 1)),
                    );
                    if (picked != null) {
                      setInner(() {
                        shipDate = picked;
                        int days = carrier == 'UPS' ? 3 : carrier == 'FedEx' ? 2 : 5;
                        expectedDelivery = shipDate.add(Duration(days: days));
                      });
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                    decoration: BoxDecoration(
                      border: Border.all(color: _C.border),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today, size: 16, color: _C.textHint),
                        const SizedBox(width: 8),
                        Text(
                          '${shipDate.month}/${shipDate.day}/${shipDate.year}',
                          style: GoogleFonts.inter(fontSize: 14, color: _C.textPrimary),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                
                // ─ Expected Delivery (UPDATED COLORS) ─
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF8FFF00), // ← UPDATED: Neon green background
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.schedule, size: 16, color: Colors.black), // ← Black icon
                      const SizedBox(width: 8),
                      Text('Expected Delivery: ',
                        style: GoogleFonts.inter(fontSize: 12, color: Colors.black)), // ← Black text
                      Text(
                        '${expectedDelivery.month}/${expectedDelivery.day}/${expectedDelivery.year}',
                        style: GoogleFonts.inter(fontSize: 12, 
                            fontWeight: FontWeight.w700, color: Colors.black), // ← Black text
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                
                // ─ Options (UPDATED CHECKBOXES WITH SHADOW) ─
                Text('Shipping Options',
                  style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                
                CheckboxListTile(
                  value: sigRequired,
                  onChanged: (v) => setInner(() => sigRequired = v!),
                  title: Text('Signature Required',
                    style: GoogleFonts.inter(fontSize: 13)),
                  subtitle: Text('Recommended for high-risk orders',
                    style: GoogleFonts.inter(fontSize: 11, color: _C.textHint)),
                  controlAffinity: ListTileControlAffinity.leading,
                  contentPadding: EdgeInsets.zero,
                  activeColor: _C.accent,
                  checkColor: Colors.black, // ← Black checkmark
                  side: BorderSide(color: _C.border, width: 2), // ← Visible border
                ),
                
                CheckboxListTile(
                  value: insurance,
                  onChanged: (v) => setInner(() => insurance = v!),
                  title: Text('Insurance (\$${insuranceAmt.toStringAsFixed(2)})',
                    style: GoogleFonts.inter(fontSize: 13)),
                  subtitle: Text('Full item value coverage',
                    style: GoogleFonts.inter(fontSize: 11, color: _C.textHint)),
                  controlAffinity: ListTileControlAffinity.leading,
                  contentPadding: EdgeInsets.zero,
                  activeColor: _C.accent,
                  checkColor: Colors.black, // ← Black checkmark
                  side: BorderSide(color: _C.border, width: 2), // ← Visible border
                ),
                
                CheckboxListTile(
                  value: autoMessage,
                  onChanged: (v) => setInner(() => autoMessage = v!),
                  title: Text('Auto-send tracking to buyer',
                    style: GoogleFonts.inter(fontSize: 13)),
                  subtitle: Text('Pre-shipment message with tracking info',
                    style: GoogleFonts.inter(fontSize: 11, color: _C.textHint)),
                  controlAffinity: ListTileControlAffinity.leading,
                  contentPadding: EdgeInsets.zero,
                  activeColor: _C.accent,
                  checkColor: Colors.black, // ← Black checkmark
                  side: BorderSide(color: _C.border, width: 2), // ← Visible border
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton.icon(
            onPressed: () async {
              if (trackingCtrl.text.trim().isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please enter tracking number')),
                );
                return;
              }
              
              try {
                await _supabase.from('protected_orders').update({
                  'order_status': 'shipped',
                  'tracking_number': trackingCtrl.text.trim(),
                  'carrier': carrier,
                  'shipped_at': shipDate.toIso8601String(),
                  'expected_delivery': expectedDelivery.toIso8601String(),
                  'signature_required': sigRequired,
                  'insurance_amount': insurance ? insuranceAmt : null,
                }).eq('id', widget.order['id']);
                
                if (autoMessage) {
                  await _supabase.from('sent_messages').insert({
                    'order_id': widget.order['id'],
                    'template_name': 'Pre-Shipment (Auto)',
                    'recipient': widget.order['buyer_username'],
                    'body': 'Your order has shipped! Tracking: ${trackingCtrl.text.trim()}',
                    'sent_via': 'auto',
                  });
                }
                
                if (ctx.mounted) Navigator.pop(ctx);
                
                if (mounted) {
                  showDialog(
                    context: context,
                    builder: (_) => AlertDialog(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      title: Row(
                        children: [
                          Container(
                            width: 40, height: 40,
                            decoration: BoxDecoration(
                              color: _C.accent,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.check, color: Colors.black),
                          ),
                          const SizedBox(width: 12),
                          Text('Order Shipped!',
                            style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w700)),
                        ],
                      ),
                      content: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('✅ Tracking: ${trackingCtrl.text.trim()}',
                            style: GoogleFonts.inter(fontSize: 14)),
                          const SizedBox(height: 4),
                          Text('✅ Expected: ${expectedDelivery.month}/${expectedDelivery.day}',
                            style: GoogleFonts.inter(fontSize: 14)),
                          if (autoMessage) ...[
                            const SizedBox(height: 4),
                            Text('✅ Buyer notified automatically',
                              style: GoogleFonts.inter(fontSize: 14)),
                          ],
                        ],
                      ),
                      actions: [
                        ElevatedButton(
                          onPressed: () {
                            Navigator.pop(context);
                            Navigator.pop(context);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _C.accent,
                            foregroundColor: Colors.black,
                          ),
                          child: const Text('Done'),
                        ),
                      ],
                    ),
                  );
                }
              } catch (e) {
                if (ctx.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e')),
                  );
                }
              }
            },
            icon: const Icon(Icons.check, size: 18),
            label: const Text('Mark as Shipped'),
            style: ElevatedButton.styleFrom(
              backgroundColor: _C.accent,
              foregroundColor: Colors.black,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            ),
          ),
        ],
      ),
    ),
  );
}
}