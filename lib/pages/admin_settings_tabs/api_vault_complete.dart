// ═══════════════════════════════════════════════════════════════════════════
// API VAULT 2.2 - WITH EDGE FUNCTION PROXY (CORS FIX)
// ═══════════════════════════════════════════════════════════════════════════
// ✅ Keys load correctly from database
// ✅ Test Connection uses Supabase Edge Function (no CORS error)
// ✅ Health score calculated locally (no RPC needed)
// ✅ Save uses UPDATE not upsert (no NOT NULL constraint error)
// ✅ Test results logged to api_test_results table
// ✅ Key changes logged to api_key_history table
// ✅ Smart notifications banner
// ✅ Last test result shown inline (success/fail with ms)
// ✅ Expiry warnings + rate limit visualization
// ═══════════════════════════════════════════════════════════════════════════

import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:google_fonts/google_fonts.dart';

class _C {
  static const bg        = Color(0xFFF8FAFC);
  static const surface   = Color(0xFFFFFFFF);
  static const border    = Color(0xFFE2E8F0);
  static const navy      = Color(0xFF0F172A);
  static const txt1      = Color(0xFF0F172A);
  static const txt2      = Color(0xFF64748B);
  static const txt3      = Color(0xFF94A3B8);
  static const green     = Color(0xFF00C48C);
  static const orange    = Color(0xFFFFB800);
  static const red       = Color(0xFFFF4D6A);
  static const blue      = Color(0xFF1D70F5);
  static const accent    = Color(0xFF8FFF00);
  static const accentDim = Color(0xFFE8FFB0);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════

class ApiVaultPage extends StatefulWidget {
  const ApiVaultPage({super.key});
  @override
  State<ApiVaultPage> createState() => _ApiVaultPageState();
}

class _ApiVaultPageState extends State<ApiVaultPage> {
  final _supabase = Supabase.instance.client;
  String _selectedPlatform   = 'ebay';
  bool   _isProductionMode   = true;
  int    _activeNotifications = 0;
  List<Map<String, dynamic>> _notifications = [];

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    try {
      final userId = _supabase.auth.currentUser?.id;
      if (userId == null) return;
      final data = await _supabase
          .from('api_notifications')
          .select()
          .eq('user_id', userId)
          .eq('is_read', false)
          .eq('is_dismissed', false)
          .order('priority', ascending: false)
          .limit(10);
      if (mounted) {
        setState(() {
          _notifications      = List<Map<String, dynamic>>.from(data);
          _activeNotifications = _notifications.length;
        });
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: _C.bg,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            const SizedBox(height: 24),
            if (_activeNotifications > 0) ...[
              _buildNotificationsBanner(),
              const SizedBox(height: 24),
            ],
            _buildPlatformTabs(),
            const SizedBox(height: 24),
            _buildSelectedPlatform(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Text('Global API Command Center',
                style: GoogleFonts.spaceGrotesk(
                    fontSize: 24, fontWeight: FontWeight.w700, color: _C.txt1)),
            if (_activeNotifications > 0) ...[
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                    color: _C.red, borderRadius: BorderRadius.circular(12)),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  const Icon(Icons.notifications_active, size: 12, color: Colors.white),
                  const SizedBox(width: 4),
                  Text('$_activeNotifications',
                      style: GoogleFonts.inter(
                          fontSize: 11, fontWeight: FontWeight.w700,
                          color: Colors.white)),
                ]),
              ),
            ],
          ]),
          const SizedBox(height: 6),
          Text('Manage rate limits, failovers, and security scopes.',
              style: GoogleFonts.inter(fontSize: 14, color: _C.txt2)),
        ]),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
              color: _C.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _C.border)),
          child: Row(children: [
            Icon(_isProductionMode ? Icons.public : Icons.science,
                color: _isProductionMode ? _C.green : _C.orange, size: 18),
            const SizedBox(width: 12),
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Global Routing',
                  style: GoogleFonts.inter(
                      fontSize: 10, color: _C.txt2, fontWeight: FontWeight.bold)),
              Text(_isProductionMode ? 'PRODUCTION MODE' : 'SANDBOX MODE',
                  style: GoogleFonts.inter(
                      fontSize: 12, fontWeight: FontWeight.bold,
                      color: _isProductionMode ? _C.green : _C.orange)),
            ]),
            const SizedBox(width: 12),
            Switch(
              value: _isProductionMode,
              onChanged: (v) => setState(() => _isProductionMode = v),
              activeColor: _C.green,
              inactiveThumbColor: _C.orange,
            ),
          ]),
        ),
      ],
    );
  }

  Widget _buildNotificationsBanner() {
    final critical  = _notifications.where((n) => (n['priority'] ?? 0) >= 4).length;
    final isCrit    = critical > 0;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isCrit ? const Color(0xFFFEF2F2) : const Color(0xFFFFFBEB),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
            color: isCrit ? Colors.red.shade200 : Colors.orange.shade200),
      ),
      child: Row(children: [
        Icon(isCrit ? Icons.error : Icons.warning_amber_rounded,
            color: isCrit ? Colors.red : Colors.orange, size: 22),
        const SizedBox(width: 12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('$_activeNotifications Active Alert${_activeNotifications > 1 ? 's' : ''}',
                style: GoogleFonts.inter(
                    fontSize: 13, fontWeight: FontWeight.w700,
                    color: isCrit ? Colors.red.shade800 : Colors.orange.shade800)),
            Text(isCrit
                ? '$critical critical issue${critical > 1 ? 's' : ''} require immediate attention'
                : 'Review your API configuration',
                style: GoogleFonts.inter(
                    fontSize: 12,
                    color: isCrit ? Colors.red.shade700 : Colors.orange.shade700)),
          ]),
        ),
        TextButton(
          onPressed: _showNotificationsModal,
          child: Text('View All',
              style: GoogleFonts.inter(
                  fontWeight: FontWeight.w700,
                  color: isCrit ? Colors.red : Colors.orange)),
        ),
      ]),
    );
  }

  void _showNotificationsModal() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('API Notifications',
            style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w700)),
        content: SizedBox(
          width: 500,
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: _notifications.length,
            itemBuilder: (_, i) {
              final n        = _notifications[i];
              final priority = (n['priority'] ?? 1) as int;
              final color    = priority >= 4
                  ? Colors.red : priority >= 3 ? Colors.orange : Colors.blue;
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                    color: color.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: color.withOpacity(0.3))),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  Row(children: [
                    Icon(Icons.notifications_active, size: 14, color: color),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(n['title'] ?? '',
                          style: GoogleFonts.inter(
                              fontSize: 13, fontWeight: FontWeight.w700,
                              color: color)),
                    ),
                  ]),
                  const SizedBox(height: 6),
                  Text(n['message'] ?? '',
                      style: GoogleFonts.inter(fontSize: 12, color: _C.txt2)),
                ]),
              );
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () async {
              final userId = _supabase.auth.currentUser?.id;
              // Log test result - wrapped in try/catch so RLS error doesn't crash the test
      if (userId != null) {
                await _supabase
                    .from('api_notifications')
                    .update({'is_read': true})
                    .eq('user_id', userId)
                    .eq('is_read', false);
                await _loadNotifications();
              }
              if (ctx.mounted) Navigator.pop(ctx);
            },
            child: const Text('Mark All Read'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx),
            style: ElevatedButton.styleFrom(backgroundColor: _C.navy),
            child: const Text('Close', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Widget _buildPlatformTabs() {
    final tabs = [
      {'id': 'ebay',       'name': 'eBay Network',  'icon': Icons.shopping_cart,  'locked': false},
      {'id': 'aliexpress', 'name': 'AliExpress',    'icon': Icons.shopping_bag,   'locked': true},
      {'id': 'openai',     'name': 'OpenAI Engine', 'icon': Icons.psychology,     'locked': true},
      {'id': 'amazon',     'name': 'Amazon SP-API', 'icon': Icons.lock,           'locked': true},
    ];
    return Row(
      children: tabs.map((t) {
        final isSelected = _selectedPlatform == t['id'];
        final isLocked   = t['locked'] as bool;
        return Padding(
          padding: const EdgeInsets.only(right: 12),
          child: InkWell(
            onTap: isLocked
                ? null
                : () => setState(() => _selectedPlatform = t['id'] as String),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                color: isSelected ? _C.navy : _C.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: isSelected ? _C.navy : _C.border),
              ),
              child: Row(children: [
                Icon(t['icon'] as IconData,
                    color: isSelected ? Colors.white : _C.txt2, size: 16),
                const SizedBox(width: 8),
                Text(t['name'] as String,
                    style: GoogleFonts.inter(
                        fontSize: 13, fontWeight: FontWeight.bold,
                        color: isSelected ? Colors.white : _C.txt2)),
                if (isLocked) ...[
                  const SizedBox(width: 8),
                  Icon(Icons.lock, size: 12,
                      color: isSelected ? Colors.white54 : _C.txt3),
                ],
              ]),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildSelectedPlatform() {
    if (_selectedPlatform == 'ebay') {
      return EbayConfigPanel(onRefresh: _loadNotifications);
    }
    return _LockedPanel(platform: _selectedPlatform);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LOCKED PANEL
// ═══════════════════════════════════════════════════════════════════════════

class _LockedPanel extends StatelessWidget {
  final String platform;
  const _LockedPanel({required this.platform});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(64),
      decoration: BoxDecoration(
          color: _C.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: _C.border)),
      child: Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Icon(Icons.lock_outline, size: 56, color: _C.txt3),
          const SizedBox(height: 16),
          Text('${platform.toUpperCase()} Integration',
              style: GoogleFonts.spaceGrotesk(
                  fontSize: 18, fontWeight: FontWeight.w700, color: _C.txt2)),
          const SizedBox(height: 8),
          Text('Coming soon — keys can be added when integration is ready.',
              style: GoogleFonts.inter(fontSize: 13, color: _C.txt3)),
        ]),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EBAY CONFIG PANEL
// ═══════════════════════════════════════════════════════════════════════════

class EbayConfigPanel extends StatefulWidget {
  final VoidCallback onRefresh;
  const EbayConfigPanel({super.key, required this.onRefresh});
  @override
  State<EbayConfigPanel> createState() => _EbayConfigPanelState();
}

class _EbayConfigPanelState extends State<EbayConfigPanel> {
  final _supabase = Supabase.instance.client;

  final _appIdCtrl      = TextEditingController();
  final _certIdCtrl     = TextEditingController();
  final _backupAppCtrl  = TextEditingController();
  final _backupCertCtrl = TextEditingController();

  bool _obscureCert       = true;
  bool _obscureBackupCert = true;
  bool _isSaving          = false;
  bool _isTesting         = false;
  bool _isLoading         = true;

  String    _status          = 'disconnected';
  int       _daysUntilExpiry = 0;
  int       _rateLimitUsed   = 0;
  int       _rateLimitTotal  = 5000;
  int       _requestsToday   = 0;
  int       _healthScore     = 0;
  DateTime? _lastTested;
  List<Map<String, dynamic>> _scopes = [];

  bool?   _lastTestSuccess;
  int?    _lastTestMs;
  String? _lastTestError;

  @override
  void initState() {
    super.initState();
    _loadFromDatabase();
  }

  @override
  void dispose() {
    _appIdCtrl.dispose();
    _certIdCtrl.dispose();
    _backupAppCtrl.dispose();
    _backupCertCtrl.dispose();
    super.dispose();
  }

  // ── Load ──────────────────────────────────────────────────────────────────
  Future<void> _loadFromDatabase() async {
    setState(() => _isLoading = true);
    try {
      final data = await _supabase
          .from('api_fleet_config')
          .select()
          .eq('platform_name', 'ebay')
          .single();

      String safe(dynamic v) {
        final s = (v ?? '').toString().trim();
        return s == 'EMPTY' ? '' : s;
      }

      _appIdCtrl.text      = safe(data['primary_key_1']);
      _certIdCtrl.text     = safe(data['primary_key_2']);
      _backupAppCtrl.text  = safe(data['backup_key_1']);
      _backupCertCtrl.text = safe(data['backup_key_2']);

      _status         = (data['status']            ?? 'disconnected').toString();
      _rateLimitUsed  = (data['rate_limit_used']   ?? 0) as int;
      _rateLimitTotal = (data['rate_limit_total']  ?? 5000) as int;
      _requestsToday  = (data['requests_today']    ?? 0) as int;

      _daysUntilExpiry = 0;
      if (data['expires_at'] != null) {
        final exp = DateTime.tryParse(data['expires_at'].toString());
        if (exp != null) {
          _daysUntilExpiry = exp.difference(DateTime.now()).inDays;
        }
      }

      if (data['last_tested_at'] != null) {
        _lastTested = DateTime.tryParse(data['last_tested_at'].toString());
      }

      if (data['scopes'] != null && data['scopes'] is List) {
        _scopes = List<Map<String, dynamic>>.from(data['scopes'] as List);
      }

      // Health score - local calculation
      final pct = _rateLimitTotal > 0
          ? (_rateLimitUsed / _rateLimitTotal * 100).round() : 0;
      if (_status == 'expired')                                    _healthScore = 0;
      else if (_status == 'error')                                 _healthScore = 25;
      else if (pct > 95)                                           _healthScore = 40;
      else if (pct > 85)                                           _healthScore = 60;
      else if (_daysUntilExpiry > 0 && _daysUntilExpiry <= 7)     _healthScore = 50;
      else if (_daysUntilExpiry > 7 && _daysUntilExpiry <= 30)    _healthScore = 75;
      else if (_status == 'connected')                             _healthScore = 100;
      else                                                         _healthScore = 30;

    } catch (e) {
      debugPrint('Load error: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  Future<void> _saveToVault() async {
    if (_appIdCtrl.text.trim().isEmpty) {
      _showSnackbar('⚠️ Primary App ID is required', Colors.orange); return;
    }
    if (_certIdCtrl.text.trim().isEmpty) {
      _showSnackbar('⚠️ Primary Cert ID is required', Colors.orange); return;
    }
    setState(() => _isSaving = true);
    try {
      final userId = _supabase.auth.currentUser?.id;

      // UPDATE — row already exists, avoids NOT NULL on primary_key_1
      await _supabase.from('api_fleet_config').update({
        'primary_key_1': _appIdCtrl.text.trim(),
        'primary_key_2': _certIdCtrl.text.trim(),
        'backup_key_1' : _backupAppCtrl.text.trim().isEmpty
            ? 'EMPTY' : _backupAppCtrl.text.trim(),
        'backup_key_2' : _backupCertCtrl.text.trim().isEmpty
            ? 'EMPTY' : _backupCertCtrl.text.trim(),
        'updated_at'   : DateTime.now().toIso8601String(),
        'status'       : 'connected',
      }).eq('platform_name', 'ebay');

      if (userId != null && _appIdCtrl.text.trim().length >= 8) {
        await _supabase.from('api_key_history').insert({
          'user_id'        : userId,
          'platform_name'  : 'ebay',
          'action'         : 'updated',
          'key_fingerprint': _appIdCtrl.text.trim().substring(0, 8),
          'key_type'       : 'primary',
          'changed_by'     : _supabase.auth.currentUser?.email ?? 'admin',
          'notes'          : 'Keys updated via API Vault',
        });
      }

      _showSnackbar('✅ eBay Vault saved successfully!', Colors.green);
      await _loadFromDatabase();
      widget.onRefresh();
    } catch (e) {
      _showSnackbar('❌ Save failed: $e', Colors.red);
    } finally {
      setState(() => _isSaving = false);
    }
  }

  // ── Test via Edge Function ────────────────────────────────────────────────
  Future<void> _testConnection() async {
    if (_appIdCtrl.text.trim().isEmpty || _certIdCtrl.text.trim().isEmpty) {
      _showSnackbar('⚠️ Enter your keys and Save to Vault first', Colors.orange);
      return;
    }

    setState(() {
      _isTesting       = true;
      _lastTestSuccess = null;
      _lastTestError   = null;
      _lastTestMs      = null;
    });

    final start  = DateTime.now();
    final userId = _supabase.auth.currentUser?.id;

    try {
      // ✅ Supabase Edge Function — bypasses browser CORS completely
      final result = await _supabase.functions.invoke(
        'ebay-proxy',
        body: {
          'appId'   : _appIdCtrl.text.trim(),
          'devId'   : _backupAppCtrl.text.trim(),
          'certId'  : _certIdCtrl.text.trim(),
          'testMode': true, // Uses Finding API - no user token needed
        },
      );

      final ms      = DateTime.now().difference(start).inMilliseconds;
      final data    = result.data as Map<String, dynamic>? ?? {};
      final success = data['success'] == true;
      final errMsg  = data['errorMessage'] as String?;
      final resTime = (data['responseTime'] as num?)?.toInt() ?? ms;

      setState(() {
        _lastTestSuccess = success;
        _lastTestMs      = resTime;
        _lastTestError   = errMsg;
      });

      // Log test result - graceful try/catch so RLS never crashes the test
      if (userId != null) {
        try {
          await _supabase.from('api_test_results').insert({
            'user_id'         : userId,
            'platform_name'   : 'ebay',
            'test_type'       : 'manual',
            'success'         : success,
            'response_time_ms': resTime,
            'response_code'   : (data['status'] as num?)?.toInt() ?? (success ? 200 : 400),
            'key_used'        : 'primary',
            if (!success && errMsg != null) 'error_message': errMsg,
          });
        } catch (logErr) {
          debugPrint('Test log warning: $logErr');
        }
      }

      await _supabase.from('api_fleet_config').update({
        'status'        : success ? 'connected' : 'error',
        'last_tested_at': DateTime.now().toIso8601String(),
      }).eq('platform_name', 'ebay');

      _showSnackbar(
        success
            ? '🟢 eBay Connection Successful! (${resTime}ms)'
            : '❌ ${errMsg ?? 'Connection failed — check your keys'}',
        success ? Colors.green : Colors.red,
      );

      await _loadFromDatabase();
      widget.onRefresh();

    } catch (e) {
      final ms = DateTime.now().difference(start).inMilliseconds;
      setState(() {
        _lastTestSuccess = false;
        _lastTestError   = e.toString();
        _lastTestMs      = ms;
      });

      // Log test result - wrapped in try/catch so RLS error doesn't crash the test
      if (userId != null) {
        try {
          await _supabase.from('api_test_results').insert({
            'user_id'      : userId,
            'platform_name': 'ebay',
            'test_type'    : 'manual',
            'success'      : false,
            'error_message': e.toString(),
            'key_used'     : 'primary',
          });
        } catch (_) {}
      }

      // Friendly message if Edge Function not deployed yet
      final isNotDeployed = e.toString().contains('404') ||
          e.toString().contains('not found') ||
          e.toString().contains('FunctionException');

      _showSnackbar(
        isNotDeployed
            ? '⚠️ Deploy "ebay-proxy" Edge Function in Supabase first!'
            : '❌ Test error: $e',
        isNotDeployed ? Colors.orange : Colors.red,
      );
    } finally {
      setState(() => _isTesting = false);
    }
  }

  void _showSnackbar(String msg, Color color) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: color,
      behavior: SnackBarBehavior.floating,
      duration: const Duration(seconds: 4),
    ));
  }

  String get _lastTestedText {
    if (_lastTested == null) return 'Never tested';
    final d = DateTime.now().difference(_lastTested!);
    if (d.inMinutes < 1)  return 'Just now';
    if (d.inMinutes < 60) return '${d.inMinutes} mins ago';
    if (d.inHours < 24)   return '${d.inHours} hours ago';
    return '${d.inDays} days ago';
  }

  Color    get _hColor => _healthScore >= 80 ? _C.green : _healthScore >= 50 ? _C.orange : _C.red;
  IconData get _hIcon  => _healthScore >= 80 ? Icons.check_circle : _healthScore >= 50 ? Icons.warning_amber_rounded : Icons.error;
  double   get _usagePct => _rateLimitTotal > 0 ? (_rateLimitUsed / _rateLimitTotal).clamp(0.0, 1.0) : 0;

  // ════════════════════════════════════════════════════════════════════════
  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Container(
        height: 200,
        decoration: BoxDecoration(
            color: _C.surface, borderRadius: BorderRadius.circular(16),
            border: Border.all(color: _C.border)),
        child: const Center(child: CircularProgressIndicator()),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: _C.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _C.border),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04),
            blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

        // ── Metrics section ───────────────────────────────────────────────
        Padding(
          padding: const EdgeInsets.all(24),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

            // Title + health score
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Row(children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: _C.bg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: _C.border)),
                  child: const Icon(Icons.shopping_cart_outlined, size: 20, color: _C.txt1),
                ),
                const SizedBox(width: 16),
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Text('eBay Developer Config',
                        style: GoogleFonts.inter(fontSize: 16,
                            fontWeight: FontWeight.bold, color: _C.txt1)),
                    const SizedBox(width: 12),
                    InkWell(
                      onTap: () {},
                      child: Row(children: [
                        Icon(Icons.open_in_new, size: 12, color: Colors.blue.shade600),
                        const SizedBox(width: 4),
                        Text('developer.ebay.com/docs',
                            style: TextStyle(color: Colors.blue.shade600,
                                fontSize: 11, decoration: TextDecoration.underline)),
                      ]),
                    ),
                  ]),
                  const SizedBox(height: 4),
                  Row(children: [
                    Text('Live market data, catalog searches, and VeRO validation.',
                        style: GoogleFonts.inter(fontSize: 12, color: _C.txt2)),
                    const SizedBox(width: 12),
                    const Icon(Icons.sync, size: 12, color: _C.txt3),
                    const SizedBox(width: 4),
                    Text('Last ping: $_lastTestedText',
                        style: GoogleFonts.inter(fontSize: 11, color: _C.txt3,
                            fontStyle: FontStyle.italic)),
                  ]),
                ]),
              ]),
              // Health badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                    color: _hColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: _hColor.withOpacity(0.3))),
                child: Row(children: [
                  Icon(_hIcon, color: _hColor, size: 18),
                  const SizedBox(width: 10),
                  Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Health Score',
                        style: GoogleFonts.inter(fontSize: 10, color: _C.txt2,
                            fontWeight: FontWeight.bold)),
                    Text('$_healthScore/100',
                        style: GoogleFonts.inter(fontSize: 16,
                            fontWeight: FontWeight.bold, color: _hColor)),
                  ]),
                ]),
              ),
            ]),

            // Expiry warning
            if (_daysUntilExpiry > 0 && _daysUntilExpiry < 30) ...[
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: _daysUntilExpiry < 7
                      ? const Color(0xFFFEF2F2) : const Color(0xFFFFFBEB),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                      color: (_daysUntilExpiry < 7 ? _C.red : _C.orange).withOpacity(0.4)),
                ),
                child: Row(children: [
                  Icon(Icons.warning_amber_rounded,
                      color: _daysUntilExpiry < 7 ? _C.red : _C.orange, size: 18),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      _daysUntilExpiry < 7
                          ? '🚨 URGENT: Keys expire in $_daysUntilExpiry days! Rotate immediately.'
                          : 'Action Required: Keys expire in $_daysUntilExpiry days.',
                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.bold,
                          color: _daysUntilExpiry < 7
                              ? Colors.red.shade800 : Colors.orange.shade800),
                    ),
                  ),
                ]),
              ),
            ],

            // Last test result
            if (_lastTestSuccess != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: (_lastTestSuccess! ? _C.green : _C.red).withOpacity(0.08),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                      color: (_lastTestSuccess! ? _C.green : _C.red).withOpacity(0.3)),
                ),
                child: Row(children: [
                  Icon(_lastTestSuccess! ? Icons.check_circle : Icons.error,
                      color: _lastTestSuccess! ? _C.green : _C.red, size: 16),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      _lastTestSuccess!
                          ? '✅ Connection successful — response in ${_lastTestMs}ms'
                          : '❌ ${_lastTestError ?? 'Connection failed'}',
                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600,
                          color: _lastTestSuccess! ? _C.green : _C.red),
                    ),
                  ),
                  InkWell(
                    onTap: () => setState(() => _lastTestSuccess = null),
                    child: const Icon(Icons.close, size: 14, color: _C.txt3),
                  ),
                ]),
              ),
            ],

            // Rate limit + scopes
            const SizedBox(height: 24),
            Row(children: [
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    Text('Daily Rate Limit',
                        style: GoogleFonts.inter(fontSize: 12,
                            fontWeight: FontWeight.bold, color: _C.txt1)),
                    Text('$_rateLimitUsed / $_rateLimitTotal reqs',
                        style: GoogleFonts.inter(fontSize: 12,
                            fontWeight: FontWeight.bold, color: _C.txt2)),
                  ]),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(
                    value: _usagePct,
                    backgroundColor: const Color(0xFFF1F5F9),
                    color: _usagePct > 0.85 ? _C.red
                        : _usagePct > 0.70 ? _C.orange : _C.green,
                    minHeight: 6,
                    borderRadius: BorderRadius.circular(3),
                  ),
                  const SizedBox(height: 6),
                  Row(children: [
                    Text('${(_usagePct * 100).toStringAsFixed(0)}% used',
                        style: GoogleFonts.inter(fontSize: 10, color: _C.txt3)),
                    const Spacer(),
                    Text('$_requestsToday requests today',
                        style: GoogleFonts.inter(fontSize: 10, color: _C.txt3)),
                  ]),
                ]),
              ),
              const SizedBox(width: 40),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Active Scopes',
                      style: GoogleFonts.inter(fontSize: 12,
                          fontWeight: FontWeight.bold, color: _C.txt1)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8, runSpacing: 8,
                    children: (_scopes.isEmpty
                        ? [
                            {'name': 'Read Catalog',    'granted': true},
                            {'name': 'Search Items',    'granted': true},
                            {'name': 'Create Listings', 'granted': false},
                            {'name': 'Issue Refunds',   'granted': false},
                          ]
                        : _scopes)
                        .map((s) => _ScopeBadge(
                              name: s['name'] as String,
                              granted: s['granted'] as bool))
                        .toList(),
                  ),
                ]),
              ),
            ]),
          ]),
        ),

        const Divider(height: 1, color: _C.border),

        // ── Form section ──────────────────────────────────────────────────
        Container(
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: _C.bg,
            borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(16),
                bottomRight: Radius.circular(16)),
          ),
          child: Column(children: [
            _KeyRow(
              label1: 'Primary App ID',   hint1: 'e.g. ReazifyL-SellerPu-PRD-...',
              label2: 'Primary Cert ID',  hint2: 'e.g. PRD-f605e695...',
              ctrl1: _appIdCtrl,          ctrl2: _certIdCtrl,
              obscure: _obscureCert,
              onToggle: () => setState(() => _obscureCert = !_obscureCert),
              isPrimary: true,
            ),
            const SizedBox(height: 20),
            _KeyRow(
              label1: 'Fallback App ID',  hint1: 'Paste Fallback App ID...',
              label2: 'Fallback Cert ID', hint2: 'Paste Fallback Cert ID...',
              ctrl1: _backupAppCtrl,      ctrl2: _backupCertCtrl,
              obscure: _obscureBackupCert,
              onToggle: () => setState(() => _obscureBackupCert = !_obscureBackupCert),
              isPrimary: false,
            ),
            const SizedBox(height: 24),

            // Action buttons
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              SizedBox(
                height: 44,
                child: ElevatedButton.icon(
                  onPressed: _isSaving ? null : _saveToVault,
                  icon: _isSaving
                      ? const SizedBox(width: 16, height: 16,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.cloud_upload_outlined, size: 18),
                  label: Text(_isSaving ? 'Saving...' : 'Save to Vault'),
                  style: ElevatedButton.styleFrom(
                      backgroundColor: _C.navy,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8))),
                ),
              ),
              OutlinedButton.icon(
                onPressed: _isTesting ? null : _testConnection,
                icon: _isTesting
                    ? const SizedBox(width: 14, height: 14,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: _C.txt1))
                    : const Icon(Icons.wifi_tethering, size: 16, color: _C.txt1),
                label: Text(_isTesting ? 'Testing...' : 'Test eBay Connection',
                    style: GoogleFonts.inter(
                        fontWeight: FontWeight.bold, color: _C.txt1)),
                style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: _C.border),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 12)),
              ),
            ]),

            const SizedBox(height: 16),
            // Info note about Edge Function
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                  color: _C.accentDim,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: _C.accent.withOpacity(0.4))),
              child: Row(children: [
                const Icon(Icons.info_outline, size: 14, color: _C.navy),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Test uses Supabase Edge Function "ebay-proxy" to bypass browser CORS. '
                    'Deploy it in Supabase Dashboard → Edge Functions.',
                    style: GoogleFonts.inter(fontSize: 11, color: _C.navy),
                  ),
                ),
              ]),
            ),
          ]),
        ),
      ]),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SCOPE BADGE
// ═══════════════════════════════════════════════════════════════════════════

class _ScopeBadge extends StatelessWidget {
  final String name;
  final bool granted;
  const _ScopeBadge({required this.name, required this.granted});
  @override
  Widget build(BuildContext context) {
    final color  = granted ? _C.green : _C.red;
    final bg     = granted ? const Color(0xFFF0FDF4) : const Color(0xFFFEF2F2);
    final border = granted ? const Color(0xFFBBF7D0) : const Color(0xFFFECACA);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: bg,
          border: Border.all(color: border),
          borderRadius: BorderRadius.circular(4)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(granted ? Icons.check : Icons.close, size: 10, color: color),
        const SizedBox(width: 4),
        Text(name, style: TextStyle(color: color, fontSize: 10,
            fontWeight: FontWeight.bold)),
      ]),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// KEY ROW
// ═══════════════════════════════════════════════════════════════════════════

class _KeyRow extends StatelessWidget {
  final String label1, hint1, label2, hint2;
  final TextEditingController ctrl1, ctrl2;
  final bool obscure, isPrimary;
  final VoidCallback onToggle;
  const _KeyRow({
    required this.label1, required this.hint1,
    required this.label2, required this.hint2,
    required this.ctrl1,  required this.ctrl2,
    required this.obscure, required this.onToggle,
    required this.isPrimary,
  });

  InputDecoration _dec(String hint, {Widget? suffix}) => InputDecoration(
    hintText: hint,
    hintStyle: GoogleFonts.inter(color: _C.txt3, fontSize: 13),
    filled: true, fillColor: Colors.white,
    contentPadding: const EdgeInsets.symmetric(horizontal: 12),
    suffixIcon: suffix,
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(6),
        borderSide: const BorderSide(color: _C.border)),
    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6),
        borderSide: const BorderSide(color: _C.border)),
    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6),
        borderSide: const BorderSide(color: _C.blue)),
  );

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Expanded(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Text(label1, style: GoogleFonts.inter(fontSize: 12,
                fontWeight: FontWeight.w600, color: const Color(0xFF475569))),
            if (!isPrimary) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                    color: const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: Colors.blue.shade100)),
                child: Text('STANDBY',
                    style: GoogleFonts.inter(fontSize: 9, color: Colors.blue,
                        fontWeight: FontWeight.bold)),
              ),
            ],
          ]),
          const SizedBox(height: 8),
          SizedBox(height: 40,
            child: TextField(controller: ctrl1,
                style: GoogleFonts.inter(fontSize: 13, color: _C.txt1),
                decoration: _dec(hint1))),
        ]),
      ),
      const SizedBox(width: 20),
      Expanded(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label2, style: GoogleFonts.inter(fontSize: 12,
              fontWeight: FontWeight.w600, color: const Color(0xFF475569))),
          const SizedBox(height: 8),
          SizedBox(height: 40,
            child: TextField(controller: ctrl2, obscureText: obscure,
                style: GoogleFonts.inter(fontSize: 13, color: _C.txt1),
                decoration: _dec(hint2, suffix: IconButton(
                  icon: Icon(obscure ? Icons.visibility_off : Icons.visibility,
                      color: _C.txt3, size: 16),
                  onPressed: onToggle,
                )))),
        ]),
      ),
    ]);
  }
}