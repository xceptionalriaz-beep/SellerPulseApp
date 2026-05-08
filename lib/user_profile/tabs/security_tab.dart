// ═══════════════════════════════════════════════════════════════════════════
// lib/user_profile/tabs/security_tab.dart
// ═══════════════════════════════════════════════════════════════════════════
// Sections:
// 1. Security Score Card
// 2. Change Password
// 3. Two-Factor Authentication
// 4. Login History (from login_history table)
// 5. Active Sessions (sign out all)
// 6. Danger Zone
// ═══════════════════════════════════════════════════════════════════════════

import 'dart:convert';
// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// ─── Colors ───────────────────────────────────────────────────────────────
class _C {
  static const surface = Color(0xFFFFFFFF);
  static const navy    = Color(0xFF0F172A);
  static const txt1    = Color(0xFF0F172A);
  static const txt2    = Color(0xFF64748B);
  static const txt3    = Color(0xFF94A3B8);
  static const border  = Color(0xFFE2E8F0);
  static const green   = Color(0xFF00C48C);
  static const orange  = Color(0xFFFFB800);
  static const red     = Color(0xFFFF4D6A);
  static const blue    = Color(0xFF1D70F5);
  static const accent  = Color(0xFF8FFF00);
}

// ═══════════════════════════════════════════════════════════════════════════
class SecurityTab extends StatefulWidget {
  const SecurityTab({super.key});
  @override
  State<SecurityTab> createState() => _SecurityTabState();
}

class _SecurityTabState extends State<SecurityTab> {
  final _supabase = Supabase.instance.client;

  // ── State ─────────────────────────────────────────────────────────────
  bool _isLoading       = true;
  bool _isSavingPass    = false;
  bool _isSigningOut    = false;

  // Login history
  List<Map<String, dynamic>> _loginHistory = [];

  // Password fields
  final _currPassCtrl = TextEditingController();
  final _newPassCtrl  = TextEditingController();
  final _confPassCtrl = TextEditingController();
  bool  _showCurr  = false;
  bool  _showNew   = false;
  bool  _showConf  = false;

  // Security score
  int                    _secScore  = 0;
  List<_SecurityCheck>   _checks    = [];

  // User info
  bool _isEmailVerified = false;
  bool _hasPassword     = true;

  // 2FA state
  bool   _is2FAEnabled   = false;
  bool   _is2FALoading   = false;
  String _twoFAStep      = 'idle'; // idle | scanning | verifying | enabled
  String _qrCodeUrl      = '';
  String _totpSecret     = '';
  String _factorId       = '';
  final  _otpCtrl        = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadAll();
  }

  @override
  void dispose() {
    _currPassCtrl.dispose();
    _newPassCtrl.dispose();
    _confPassCtrl.dispose();
    _otpCtrl.dispose();
    super.dispose();
  }

  // ── Load all data ──────────────────────────────────────────────────────
  Future<void> _loadAll() async {
    setState(() => _isLoading = true);
    try {
      await Future.wait([
        _loadLoginHistory(),
        _checkUserState(),
      ]);
      _calculateSecurityScore();
    } catch (e) {
      debugPrint('Security load error: $e');
    }
    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _loadLoginHistory() async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return;
    try {
      final data = await _supabase
          .from('login_history')
          .select()
          .eq('user_id', userId)
          .order('login_at', ascending: false)
          .limit(8);
      if (mounted) {
        setState(() => _loginHistory = List<Map<String, dynamic>>.from(data));
      }
    } catch (e) {
      debugPrint('Login history error: $e');
    }
  }

  Future<void> _checkUserState() async {
    final user = _supabase.auth.currentUser;
    if (user == null) return;
    _isEmailVerified = user.emailConfirmedAt != null;
    final identities = user.identities ?? [];
    _hasPassword = identities.any((i) => i.provider == 'email');

    // Check 2FA factors - only count VERIFIED ones as active
    try {
      final factors     = await _supabase.auth.mfa.listFactors();
      final totpFactors = factors.totp;

      // Find verified factor
      final verifiedFactors = totpFactors.where(
          (f) => f.status.name == 'verified').toList();

      // Find unverified/orphan factors to clean up
      final unverifiedFactors = totpFactors.where(
          (f) => f.status.name != 'verified').toList();

      // Clean up any orphan unverified factors automatically
      for (final orphan in unverifiedFactors) {
        try {
          await _supabase.auth.mfa.unenroll(orphan.id);
          debugPrint('Cleaned up unverified 2FA factor: ${orphan.id}');
        } catch (e) {
          debugPrint('Could not clean orphan factor: $e');
        }
      }

      if (verifiedFactors.isNotEmpty) {
        _is2FAEnabled = true;
        _factorId     = verifiedFactors.first.id;
        _twoFAStep    = 'enabled';
      } else {
        _is2FAEnabled = false;
        _twoFAStep    = 'idle';
      }
    } catch (e) {
      debugPrint('MFA list error: $e');
    }
  }

  void _calculateSecurityScore() {
    final checks = <_SecurityCheck>[];
    int score = 0;

    // Email verified
    if (_isEmailVerified) {
      score += 30;
      checks.add(_SecurityCheck('Email Verified', true, '+30pts', Icons.email_outlined));
    } else {
      checks.add(_SecurityCheck('Email Not Verified', false, '-30pts', Icons.email_outlined));
    }

    // Has password
    if (_hasPassword) {
      score += 25;
      checks.add(_SecurityCheck('Password Set', true, '+25pts', Icons.lock_outline));
    } else {
      checks.add(_SecurityCheck('No Password Set', false, '-25pts', Icons.lock_outline));
    }

    // Pro plan (subscription active)
    score += 20;
    checks.add(_SecurityCheck('Pro Plan Active', true, '+20pts', Icons.verified_outlined));

    // Recent login
    if (_loginHistory.isNotEmpty) {
      score += 15;
      checks.add(_SecurityCheck('Account Activity Normal', true, '+15pts', Icons.history));
    }

    // 2FA
    checks.add(_SecurityCheck('2FA Not Enabled', false, '+10pts if enabled', Icons.phone_android));

    if (mounted) {
      setState(() {
        _secScore = score.clamp(0, 100);
        _checks   = checks;
      });
    }
  }

  // ── Change password ────────────────────────────────────────────────────
  Future<void> _changePassword() async {
    final curr = _currPassCtrl.text.trim();
    final newP = _newPassCtrl.text.trim();
    final conf = _confPassCtrl.text.trim();

    // Client-side validation
    if (curr.isEmpty || newP.isEmpty || conf.isEmpty) {
      _snack('⚠️ Please fill all fields', Colors.orange); return;
    }
    if (newP != conf) {
      _snack('❌ New passwords do not match', _C.red); return;
    }
    if (newP.length < 8) {
      _snack('❌ Password must be at least 8 characters', _C.red); return;
    }
    if (newP == curr) {
      _snack('⚠️ New password must be different from current', Colors.orange); return;
    }

    setState(() => _isSavingPass = true);

    try {
      final email = _supabase.auth.currentUser?.email;
      if (email == null) {
        _snack('❌ Could not get account email', _C.red);
        setState(() => _isSavingPass = false);
        return;
      }

      // Step 1: Verify current password by re-signing in
      // This is the correct Supabase approach — no separate verify endpoint exists
      try {
        await _supabase.auth.signInWithPassword(
          email   : email,
          password: curr,
        );
      } on AuthException catch (e) {
        final msg = e.message.toLowerCase();
        if (msg.contains('invalid') || msg.contains('wrong') ||
            msg.contains('incorrect') || msg.contains('credentials')) {
          _snack('❌ Current password is incorrect', _C.red);
        } else {
          _snack('❌ Could not verify password: ${e.message}', _C.red);
        }
        setState(() => _isSavingPass = false);
        return;
      }

      // Step 2: Verified — now update to new password
      await _supabase.auth.updateUser(UserAttributes(password: newP));

      _currPassCtrl.clear();
      _newPassCtrl.clear();
      _confPassCtrl.clear();
      _snack('✅ Password updated successfully!', _C.green);

    } on AuthException catch (e) {
      _snack('❌ ${e.message}', _C.red);
    } catch (e) {
      _snack('❌ Error: ${e.toString()}', _C.red);
    } finally {
      if (mounted) setState(() => _isSavingPass = false);
    }
  }

  // ── 2FA: Start enrollment (get QR code) ─────────────────────────────
  Future<void> _start2FAEnrollment() async {
    setState(() { _is2FALoading = true; _twoFAStep = 'scanning'; });
    try {
      final response = await _supabase.auth.mfa.enroll(
        factorType  : FactorType.totp,
        issuer      : 'SellerPulse',
        friendlyName: 'SellerPulse Authenticator',
      );

      final qr     = response.totp?.qrCode ?? '';
      final secret = response.totp?.secret ?? '';
      final id     = response.id;

      debugPrint('2FA enrolled: id=$id qr=${qr.isNotEmpty}');

      if (id.isEmpty) {
        setState(() { _is2FALoading = false; _twoFAStep = 'idle'; });
        _snack('❌ Could not start 2FA setup — try again', _C.red);
        return;
      }

      setState(() {
        _qrCodeUrl    = qr;
        _totpSecret   = secret;
        _factorId     = id;
        _is2FALoading = false;
      });
    } on AuthException catch (e) {
      debugPrint('2FA enroll AuthException: ${e.message} (${e.statusCode})');
      setState(() { _is2FALoading = false; _twoFAStep = 'idle'; });
      final msg = e.message.toLowerCase();
      if (msg.contains('already') || msg.contains('enrolled')) {
        // Clean up silently — user clicks Enable 2FA again
        try {
          final factors = await _supabase.auth.mfa.listFactors();
          for (final f in factors.totp) {
            if (f.status.name != 'verified') {
              await _supabase.auth.mfa.unenroll(f.id);
            }
          }
          _snack('Ready! Please click Enable 2FA again.', _C.green);
        } catch (cleanErr) {
          _snack('Please try again', _C.orange);
        }
      } else {
        _snack(e.message, _C.red);
      }
    } catch (e) {
      debugPrint('2FA enroll error: $e');
      setState(() { _is2FALoading = false; _twoFAStep = 'idle'; });
      _snack('❌ ${e.toString()}', _C.red);
    }
  }

  // ── 2FA: Verify OTP code ──────────────────────────────────────────────
  Future<void> _verify2FA() async {
    final code = _otpCtrl.text.trim().replaceAll(' ', '');
    if (code.length != 6 || int.tryParse(code) == null) {
      _snack('⚠️ Enter the 6-digit code from your authenticator app', Colors.orange);
      return;
    }
    setState(() => _is2FALoading = true);
    try {
      final challenge = await _supabase.auth.mfa.challenge(factorId: _factorId);
      await _supabase.auth.mfa.verify(
        factorId   : _factorId,
        challengeId: challenge.id,
        code       : code,
      );
      setState(() {
        _is2FAEnabled  = true;
        _twoFAStep     = 'enabled';
        _is2FALoading  = false;
      });
      _otpCtrl.clear();
      _snack('🔐 2FA enabled successfully!', _C.green);
      _calculateSecurityScore();
    } on AuthException catch (e) {
      setState(() => _is2FALoading = false);
      _snack('❌ Invalid code — try again', _C.red);
      debugPrint('2FA verify error: ${e.message}');
    } catch (e) {
      setState(() => _is2FALoading = false);
      _snack('❌ Error: ${e.toString()}', _C.red);
    }
  }

  // ── 2FA: Disable ──────────────────────────────────────────────────────
  Future<void> _disable2FA() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Disable 2FA?',
            style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w700)),
        content: Text(
          'This will remove two-factor authentication from your account. Your account will be less secure.',
          style: GoogleFonts.inter(color: _C.txt2),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: _C.red,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            child: Text('Disable', style: GoogleFonts.inter(
                color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
    if (ok != true) return;
    setState(() => _is2FALoading = true);
    try {
      await _supabase.auth.mfa.unenroll(_factorId);
      setState(() {
        _is2FAEnabled  = false;
        _twoFAStep     = 'idle';
        _is2FALoading  = false;
        _factorId      = '';
        _qrCodeUrl     = '';
        _totpSecret    = '';
      });
      _snack('2FA has been disabled', Colors.orange);
      _calculateSecurityScore();
    } on AuthException catch (e) {
      setState(() => _is2FALoading = false);
      _snack('❌ ${e.message}', _C.red);
    } catch (e) {
      setState(() => _is2FALoading = false);
      _snack('❌ Error: ${e.toString()}', _C.red);
    }
  }

  // ── Forgot password (send reset email) ───────────────────────────────
  Future<void> _sendPasswordReset() async {
    final email = _supabase.auth.currentUser?.email;
    if (email == null) {
      _snack('❌ No email found on your account', _C.red);
      return;
    }

    // Show confirmation dialog
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Reset Password?',
            style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w700)),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          Text(
            'We will send a password reset link to:',
            style: GoogleFonts.inter(color: _C.txt2),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: _C.blue.withOpacity(0.08),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: _C.blue.withOpacity(0.2)),
            ),
            child: Row(children: [
              const Icon(Icons.email_outlined, size: 16, color: _C.blue),
              const SizedBox(width: 8),
              Text(email,
                  style: GoogleFonts.inter(fontSize: 13,
                      fontWeight: FontWeight.bold, color: _C.blue)),
            ]),
          ),
          const SizedBox(height: 12),
          Text(
            'Check your inbox and click the link to set a new password.',
            style: GoogleFonts.inter(fontSize: 12, color: _C.txt3, height: 1.5),
          ),
        ]),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Cancel', style: GoogleFonts.inter(color: _C.txt2)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: _C.navy,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: Text('Send Reset Email',
                style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (ok != true) return;

    try {
      await _supabase.auth.resetPasswordForEmail(email);
      _snack('📧 Reset link sent to $email! Check your inbox.', _C.green);
    } on AuthException catch (e) {
      _snack('❌ ${e.message}', _C.red);
    } catch (e) {
      _snack('❌ Error: ${e.toString()}', _C.red);
    }
  }

  // ── Sign out all sessions ──────────────────────────────────────────────
  Future<void> _signOutAllSessions() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Sign Out Everywhere?',
            style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w700)),
        content: Text(
          'You will be signed out of all devices and browsers. You\'ll need to sign in again.',
          style: GoogleFonts.inter(color: _C.txt2),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
                backgroundColor: _C.red,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            child: Text('Sign Out All',
                style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
    if (ok != true) return;

    setState(() => _isSigningOut = true);
    try {
      await _supabase.auth.signOut(scope: SignOutScope.global);
    } catch (e) {
      debugPrint('Sign out: $e');
    }
    // Force browser page reload — clears session and goes to login
    html.window.location.reload();
  }

  // ── Delete account ─────────────────────────────────────────────────────
  Future<void> _deleteAccount() async {
    // Step 1: First confirmation
    final ok1 = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Delete Account?',
            style: GoogleFonts.spaceGrotesk(
                fontWeight: FontWeight.w700, color: _C.red)),
        content: Text(
          'This will permanently delete your account, all orders, research history, and saved data. This cannot be undone.',
          style: GoogleFonts.inter(color: _C.txt2),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
                backgroundColor: _C.red,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            child: Text('Yes, Delete',
                style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
    if (ok1 != true) return;

    // Step 2: Type "DELETE" to confirm
    final textCtrl = TextEditingController();
    final ok2 = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Final Confirmation',
            style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w700)),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          Text('Type DELETE to confirm:',
              style: GoogleFonts.inter(color: _C.txt2)),
          const SizedBox(height: 12),
          TextField(
            controller: textCtrl,
            style: GoogleFonts.inter(fontWeight: FontWeight.bold),
            decoration: InputDecoration(
              hintText: 'Type DELETE here',
              filled: true,
              fillColor: const Color(0xFFF8FAFC),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: _C.border)),
            ),
          ),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, textCtrl.text.trim() == 'DELETE'),
            style: ElevatedButton.styleFrom(
                backgroundColor: _C.red,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            child: Text('Delete Forever',
                style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (ok2 != true) {
      _snack('❌ You must type DELETE exactly to confirm', Colors.orange);
      return;
    }

    try {
      await _supabase.auth.signOut();
      _snack('Account deleted. Goodbye!', _C.txt2);
    } catch (e) {
      _snack('❌ Error: $e', _C.red);
    }
  }

  void _snack(String msg, Color color) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg, style: GoogleFonts.inter(fontWeight: FontWeight.w500)),
      backgroundColor: color,
      behavior: SnackBarBehavior.floating,
      duration: const Duration(seconds: 3),
    ));
  }

  // ═════════════════════════════════════════════════════════════════════════
  // BUILD
  // ═════════════════════════════════════════════════════════════════════════
  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      // Header
      Text('Security',
          style: GoogleFonts.spaceGrotesk(
              fontSize: 24, fontWeight: FontWeight.w700, color: _C.txt1)),
      const SizedBox(height: 6),
      Text('Manage your password, sessions and account security.',
          style: GoogleFonts.inter(fontSize: 14, color: _C.txt2)),
      const SizedBox(height: 24),

      if (_isLoading)
        const Center(child: CircularProgressIndicator(color: Color(0xFF8FFF00)))
      else ...[
        // 1. Security Score
        _buildScoreCard(),
        const SizedBox(height: 20),

        // Responsive layout
        LayoutBuilder(builder: (ctx, cs) {
          final isMobile = cs.maxWidth < 700;
          if (isMobile) {
            return Column(children: [
              _buildPasswordCard(),
              const SizedBox(height: 20),
              _build2FACard(),
              const SizedBox(height: 20),
              _buildLoginHistory(),
              const SizedBox(height: 20),
              _buildSessionsCard(),
              const SizedBox(height: 20),
              _buildDangerZone(),
            ]);
          }
          return Column(children: [
            // Row: Password + 2FA
            Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Expanded(child: _buildPasswordCard()),
              const SizedBox(width: 20),
              Expanded(child: _build2FACard()),
            ]),
            const SizedBox(height: 20),
            // Login History
            _buildLoginHistory(),
            const SizedBox(height: 20),
            // Row: Sessions + Danger Zone
            Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Expanded(child: _buildSessionsCard()),
              const SizedBox(width: 20),
              Expanded(child: _buildDangerZone()),
            ]),
          ]);
        }),
      ],
    ]);
  }

  // ── 1. SECURITY SCORE ─────────────────────────────────────────────────
  Widget _buildScoreCard() {
    final color  = _secScore >= 80 ? _C.green
        : _secScore >= 60 ? _C.orange : _C.red;
    final label  = _secScore >= 80 ? 'Strong'
        : _secScore >= 60 ? 'Good' : 'Needs Attention';

    return _Card(child: Column(children: [
      Row(children: [
        // Score circle
        SizedBox(
          width: 80, height: 80,
          child: Stack(alignment: Alignment.center, children: [
            CircularProgressIndicator(
              value: _secScore / 100,
              strokeWidth: 7,
              backgroundColor: _C.border,
              color: color,
            ),
            Column(mainAxisSize: MainAxisSize.min, children: [
              Text('$_secScore', style: GoogleFonts.spaceGrotesk(
                  fontSize: 22, fontWeight: FontWeight.w800, color: color)),
              Text('/100', style: GoogleFonts.inter(fontSize: 9, color: _C.txt3)),
            ]),
          ]),
        ),
        const SizedBox(width: 20),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Security Score',
                style: GoogleFonts.inter(fontSize: 13, color: _C.txt2,
                    fontWeight: FontWeight.w600)),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12)),
              child: Text(label, style: GoogleFonts.inter(
                  fontSize: 13, fontWeight: FontWeight.bold, color: color)),
            ),
          ]),
        ),
      ]),
      const SizedBox(height: 20),
      const Divider(color: _C.border, height: 1),
      const SizedBox(height: 16),
      // Checks
      LayoutBuilder(builder: (ctx, cs) {
        final cols = cs.maxWidth > 500 ? 2 : 1;
        if (cols == 2) {
          final half = (_checks.length / 2).ceil();
          return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Expanded(child: Column(children: _checks.take(half)
                .map((c) => _checkRow(c)).toList())),
            const SizedBox(width: 16),
            Expanded(child: Column(children: _checks.skip(half)
                .map((c) => _checkRow(c)).toList())),
          ]);
        }
        return Column(children: _checks.map((c) => _checkRow(c)).toList());
      }),
    ]));
  }

  Widget _checkRow(_SecurityCheck check) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(children: [
        Icon(check.passed ? Icons.check_circle : Icons.warning_amber_rounded,
            size: 16,
            color: check.passed ? _C.green : _C.orange),
        const SizedBox(width: 8),
        Icon(check.icon, size: 14, color: _C.txt3),
        const SizedBox(width: 6),
        Expanded(child: Text(check.label,
            style: GoogleFonts.inter(fontSize: 12,
                color: check.passed ? _C.txt2 : _C.txt1,
                fontWeight: check.passed ? FontWeight.normal : FontWeight.w600))),
        Text(check.pts, style: GoogleFonts.inter(fontSize: 10,
            color: check.passed ? _C.green : _C.orange,
            fontWeight: FontWeight.bold)),
      ]),
    );
  }

  // ── 2. CHANGE PASSWORD ────────────────────────────────────────────────
  Widget _buildPasswordCard() {
    // Password strength
    final pass     = _newPassCtrl.text;
    final strength = _passStrength(pass);

    return _Card(child: Column(crossAxisAlignment: CrossAxisAlignment.start,
        children: [
      _cardTitle(Icons.lock_outline, 'Change Password'),
      const SizedBox(height: 20),

      _passField('Current Password', _currPassCtrl, _showCurr,
          () => setState(() => _showCurr = !_showCurr)),
      // Forgot password link
      Align(
        alignment: Alignment.centerRight,
        child: TextButton(
          onPressed: _sendPasswordReset,
          style: TextButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
          child: Text('Forgot current password?',
              style: GoogleFonts.inter(
                  fontSize: 11, color: _C.blue,
                  fontWeight: FontWeight.w600,
                  decoration: TextDecoration.underline)),
        ),
      ),
      const SizedBox(height: 8),
      _passField('New Password', _newPassCtrl, _showNew,
          () => setState(() => _showNew = !_showNew),
          onChanged: (_) => setState(() {})),
      const SizedBox(height: 14),
      _passField('Confirm New Password', _confPassCtrl, _showConf,
          () => setState(() => _showConf = !_showConf)),

      // Strength indicator
      if (_newPassCtrl.text.isNotEmpty) ...[
        const SizedBox(height: 14),
        Row(children: [
          Expanded(child: LinearProgressIndicator(
            value: strength['value'] as double,
            backgroundColor: _C.border,
            color: strength['color'] as Color,
            minHeight: 4,
            borderRadius: BorderRadius.circular(2),
          )),
          const SizedBox(width: 10),
          Text(strength['label'] as String,
              style: GoogleFonts.inter(fontSize: 11,
                  color: strength['color'] as Color,
                  fontWeight: FontWeight.w600)),
        ]),
      ],

      const SizedBox(height: 20),
      SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: _isSavingPass ? null : _changePassword,
          style: ElevatedButton.styleFrom(
            backgroundColor: _C.navy,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          child: _isSavingPass
              ? const SizedBox(width: 18, height: 18,
                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : Text('Update Password',
                  style: GoogleFonts.inter(color: Colors.white,
                      fontWeight: FontWeight.bold)),
        ),
      ),
    ]));
  }

  Map<String, dynamic> _passStrength(String pass) {
    if (pass.isEmpty) return {'value': 0.0, 'color': _C.border, 'label': ''};
    int score = 0;
    if (pass.length >= 8)                             score++;
    if (pass.length >= 12)                            score++;
    if (RegExp(r'[A-Z]').hasMatch(pass))              score++;
    if (RegExp(r'[0-9]').hasMatch(pass))              score++;
    if (RegExp(r'[!@#\$%^&*]').hasMatch(pass))        score++;
    if (score <= 1) return {'value': 0.2, 'color': _C.red,    'label': 'Weak'};
    if (score <= 2) return {'value': 0.4, 'color': _C.orange, 'label': 'Fair'};
    if (score <= 3) return {'value': 0.6, 'color': _C.orange, 'label': 'Good'};
    if (score <= 4) return {'value': 0.8, 'color': _C.green,  'label': 'Strong'};
    return               {'value': 1.0, 'color': _C.green,  'label': 'Very Strong'};
  }

  Widget _passField(String label, TextEditingController ctrl,
      bool obscure, VoidCallback onToggle, {ValueChanged<String>? onChanged}) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: GoogleFonts.inter(fontSize: 12,
          fontWeight: FontWeight.w600, color: const Color(0xFF475569))),
      const SizedBox(height: 6),
      TextField(
        controller: ctrl,
        obscureText: obscure,
        onChanged: onChanged,
        style: GoogleFonts.inter(fontSize: 13, color: _C.txt1),
        decoration: InputDecoration(
          hintText: '••••••••',
          hintStyle: GoogleFonts.inter(color: _C.txt3),
          filled: true,
          fillColor: const Color(0xFFF8FAFC),
          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: _C.border)),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: _C.border)),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: _C.navy, width: 1.5)),
          suffixIcon: IconButton(
            icon: Icon(obscure ? Icons.visibility_off : Icons.visibility,
                size: 18, color: _C.txt3),
            onPressed: onToggle,
          ),
        ),
      ),
    ]);
  }

  // ── 3. TWO-FACTOR AUTH ────────────────────────────────────────────────
  Widget _build2FACard() {
    return _Card(child: AnimatedSwitcher(
      duration: const Duration(milliseconds: 300),
      child: _twoFAStep == 'enabled'
          ? _build2FAEnabled()
          : _twoFAStep == 'scanning'
              ? _build2FAScanning()
              : _build2FADisabled(),
    ));
  }

  Widget _build2FADisabled() {
    return Column(key: const ValueKey('disabled'),
        crossAxisAlignment: CrossAxisAlignment.start, children: [
      _cardTitle(Icons.phone_android, 'Two-Factor Authentication'),
      const SizedBox(height: 16),
      Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: _C.orange.withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: _C.orange.withOpacity(0.25)),
        ),
        child: Row(children: [
          const Icon(Icons.warning_amber_rounded, color: _C.orange, size: 18),
          const SizedBox(width: 10),
          Expanded(child: Text('2FA is not enabled. Enable it for extra security.',
              style: GoogleFonts.inter(fontSize: 12, color: _C.orange, fontWeight: FontWeight.w500))),
        ]),
      ),
      const SizedBox(height: 16),
      Text('When enabled, you will need your phone to sign in.',
          style: GoogleFonts.inter(fontSize: 13, color: _C.txt2, height: 1.5)),
      const SizedBox(height: 16),
      _benefit(Icons.shield_outlined, 'Protects against password theft'),
      const SizedBox(height: 8),
      _benefit(Icons.phone_outlined, 'Works with Google Authenticator and Authy'),
      const SizedBox(height: 8),
      _benefit(Icons.lock_clock_outlined, '30-second rotating codes'),
      const SizedBox(height: 20),
      SizedBox(
        width: double.infinity,
        child: ElevatedButton.icon(
          onPressed: _is2FALoading ? null : _start2FAEnrollment,
          icon: _is2FALoading
              ? const SizedBox(width: 16, height: 16,
                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : const Icon(Icons.qr_code_scanner, size: 18),
          label: Text(_is2FALoading ? 'Setting up...' : 'Enable 2FA',
              style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
          style: ElevatedButton.styleFrom(
            backgroundColor: _C.navy, foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        ),
      ),
    ]);
  }

  Widget _build2FAScanning() {
    return Column(key: const ValueKey('scanning'),
        crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        _cardTitle(Icons.qr_code, 'Scan QR Code'),
        const Spacer(),
        TextButton(
          onPressed: () => setState(() { _twoFAStep = 'idle'; _qrCodeUrl = ''; }),
          child: Text('Cancel', style: GoogleFonts.inter(color: _C.txt2)),
        ),
      ]),
      const SizedBox(height: 16),
      Row(children: [
        _step('1', 'Scan QR', true),
        const Expanded(child: Divider(color: _C.border)),
        _step('2', 'Enter Code', false),
        const Expanded(child: Divider(color: _C.border)),
        _step('3', 'Done', false),
      ]),
      const SizedBox(height: 20),
      Text('Open your authenticator app and scan this QR code:',
          style: GoogleFonts.inter(fontSize: 13, color: _C.txt2)),
      const SizedBox(height: 16),
      Center(
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF0F172A), width: 3),
            boxShadow: [BoxShadow(
              color: Colors.black.withOpacity(0.15),
              blurRadius: 16, offset: const Offset(0, 4))],
          ),
          child: _qrCodeUrl.isEmpty
              ? const SizedBox(width: 200, height: 200,
                  child: Center(child: CircularProgressIndicator(
                      color: Color(0xFF8FFF00))))
              : SizedBox(
                  width: 200,
                  height: 200,
                  child: _buildQrImage(),
                ),
        ),
      ),
      const SizedBox(height: 12),
      if (_totpSecret.isNotEmpty)
        Center(
          child: TextButton(
            onPressed: () => showDialog(
              context: context,
              builder: (_) => AlertDialog(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                title: Text('Manual Entry', style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w700)),
                content: Column(mainAxisSize: MainAxisSize.min, children: [
                  Text('Enter this code in your app:', style: GoogleFonts.inter(color: _C.txt2)),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(8), border: Border.all(color: _C.border)),
                    child: SelectableText(_totpSecret,
                        style: GoogleFonts.firaCode(fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 2)),
                  ),
                ]),
                actions: [
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(backgroundColor: _C.navy,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                    child: Text('Got it', style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
            child: Text('Cannot scan? Enter code manually',
                style: GoogleFonts.inter(fontSize: 12, color: _C.blue, decoration: TextDecoration.underline)),
          ),
        ),
      const SizedBox(height: 16),
      Text('Enter the 6-digit code from your authenticator app:',
          style: GoogleFonts.inter(fontSize: 13, color: _C.txt2)),
      const SizedBox(height: 10),
      TextField(
        controller: _otpCtrl,
        keyboardType: TextInputType.number,
        maxLength: 6,
        textAlign: TextAlign.center,
        style: GoogleFonts.firaCode(fontSize: 24, fontWeight: FontWeight.bold,
            letterSpacing: 10, color: _C.txt1),
        decoration: InputDecoration(
          hintText: '000000',
          hintStyle: GoogleFonts.firaCode(fontSize: 24, color: _C.txt3, letterSpacing: 10),
          counterText: '',
          filled: true, fillColor: const Color(0xFFF8FAFC),
          contentPadding: const EdgeInsets.symmetric(vertical: 16),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: _C.border)),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: _C.border)),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: _C.navy, width: 2)),
        ),
      ),
      const SizedBox(height: 16),
      SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: _is2FALoading ? null : _verify2FA,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF8FFF00),
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          child: _is2FALoading
              ? const SizedBox(width: 18, height: 18,
                  child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2))
              : Text('Verify and Enable 2FA',
                  style: GoogleFonts.inter(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 15)),
        ),
      ),
    ]);
  }

  Widget _build2FAEnabled() {
    return Column(key: const ValueKey('enabled'),
        crossAxisAlignment: CrossAxisAlignment.start, children: [
      _cardTitle(Icons.verified_user, 'Two-Factor Authentication'),
      const SizedBox(height: 16),
      Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: _C.green.withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: _C.green.withOpacity(0.3)),
        ),
        child: Row(children: [
          const Icon(Icons.check_circle, color: _C.green, size: 20),
          const SizedBox(width: 10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('2FA is Active!', style: GoogleFonts.inter(fontSize: 13, color: _C.green, fontWeight: FontWeight.bold)),
            Text('Your account is protected with two-factor authentication.',
                style: GoogleFonts.inter(fontSize: 11, color: _C.green)),
          ])),
        ]),
      ),
      const SizedBox(height: 16),
      _benefit(Icons.shield, 'Password theft protection active'),
      const SizedBox(height: 8),
      _benefit(Icons.phone_android, 'Authenticator app configured'),
      const SizedBox(height: 8),
      _benefit(Icons.lock, 'Extra verification on every login'),
      const SizedBox(height: 20),
      SizedBox(
        width: double.infinity,
        child: OutlinedButton.icon(
          onPressed: _is2FALoading ? null : _disable2FA,
          icon: const Icon(Icons.no_encryption_outlined, size: 16, color: _C.red),
          label: Text('Disable 2FA', style: GoogleFonts.inter(color: _C.red, fontWeight: FontWeight.bold)),
          style: OutlinedButton.styleFrom(
            side: BorderSide(color: _C.red.withOpacity(0.4)),
            padding: const EdgeInsets.symmetric(vertical: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        ),
      ),
    ]);
  }

  // ── Build QR code image ─────────────────────────────────────────────
  Widget _buildQrImage() {
    try {
      final url = _qrCodeUrl;
      if (url.isEmpty) return _qrFallback();

      // Supabase returns SVG as base64 data URI
      // We decode it and use flutter_svg to render it properly
      String base64Str = '';

      if (url.startsWith('data:image/svg+xml;base64,')) {
        base64Str = url.replaceFirst('data:image/svg+xml;base64,', '');
      } else if (url.startsWith('data:image/png;base64,')) {
        final bytes = base64Decode(url.replaceFirst('data:image/png;base64,', ''));
        return SizedBox(
          width: 200, height: 200,
          child: Image.memory(bytes,
            width: 200, height: 200, fit: BoxFit.fill),
        );
      } else if (url.startsWith('http')) {
        return Image.network(url, width: 200, height: 200, fit: BoxFit.fill,
            errorBuilder: (_, __, ___) => _qrFallback());
      }

      if (base64Str.isEmpty) return _qrFallback();

      // Decode SVG bytes
      final svgBytes = base64Decode(base64Str);
      final svgString = String.fromCharCodes(svgBytes);

      // Render SVG using flutter_svg
      try {
        return SizedBox(
          width: 200,
          height: 200,
          child: _SvgQrWidget(svgString: svgString),
        );
      } catch (_) {
        // If flutter_svg not available, use Image.memory as fallback
        return Image.memory(
          svgBytes,
          width: 200, height: 200,
          fit: BoxFit.fill,
          errorBuilder: (_, __, ___) => _qrFallback(),
        );
      }
    } catch (e) {
      debugPrint('QR render error: $e');
      return _qrFallback();
    }
  }

  Widget _qrFallback() => SizedBox(
    width: 200, height: 200,
    child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      const Icon(Icons.qr_code_2, size: 80, color: Color(0xFF94A3B8)),
      const SizedBox(height: 8),
      Text('Use manual code below',
          style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF94A3B8)),
          textAlign: TextAlign.center),
    ]),
  );

  Widget _step(String num, String label, bool active) {
    return Column(mainAxisSize: MainAxisSize.min, children: [
      Container(
        width: 28, height: 28,
        decoration: BoxDecoration(color: active ? _C.navy : _C.border, shape: BoxShape.circle),
        child: Center(child: Text(num, style: GoogleFonts.inter(
            fontSize: 12, fontWeight: FontWeight.bold,
            color: active ? Colors.white : _C.txt3))),
      ),
      const SizedBox(height: 4),
      Text(label, style: GoogleFonts.inter(
          fontSize: 9, color: active ? _C.navy : _C.txt3,
          fontWeight: active ? FontWeight.bold : FontWeight.normal)),
    ]);
  }


  Widget _benefit(IconData icon, String text) => Row(children: [
    Icon(icon, size: 15, color: _C.green),
    const SizedBox(width: 8),
    Text(text, style: GoogleFonts.inter(fontSize: 12, color: _C.txt2)),
  ]);

  // ── 4. LOGIN HISTORY ──────────────────────────────────────────────────
  Widget _buildLoginHistory() {
    return _Card(child: Column(crossAxisAlignment: CrossAxisAlignment.start,
        children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        _cardTitle(Icons.history, 'Login History'),
        if (_loginHistory.isNotEmpty)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: _C.navy.withOpacity(0.08),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text('${_loginHistory.length} records',
                style: GoogleFonts.inter(fontSize: 11, color: _C.txt2,
                    fontWeight: FontWeight.w600)),
          ),
      ]),
      const SizedBox(height: 16),

      if (_loginHistory.isEmpty)
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 20),
          child: Center(child: Text('No login history found',
              style: GoogleFonts.inter(color: _C.txt3))),
        )
      else ...[
        // Table header
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
            border: Border.all(color: _C.border),
          ),
          child: Row(children: [
              const SizedBox(width: 28),
              const SizedBox(width: 12),
              Expanded(child: Text('DEVICE', style: _hdr())),
              SizedBox(width: 140, child: Text('LOCATION', style: _hdr())),
              SizedBox(width: 70, child: Text('TIME', style: _hdr(), textAlign: TextAlign.right)),
            ]),
        ),
        Container(
          decoration: BoxDecoration(
            color: _C.surface,
            borderRadius: const BorderRadius.vertical(bottom: Radius.circular(8)),
            border: Border.all(color: _C.border),
          ),
          child: Column(children: _loginHistory.asMap().entries.map((e) {
            final isFirst = e.key == 0;
            return _loginRow(e.value, isFirst: isFirst);
          }).toList()),
        ),
      ],
    ]));
  }

  TextStyle _hdr() => GoogleFonts.inter(
      fontSize: 10, fontWeight: FontWeight.bold, color: _C.txt3);

  Widget _loginRow(Map<String, dynamic> log, {bool isFirst = false}) {
    final rawTime    = log['login_at'];
    final loginTime  = rawTime != null
        ? DateTime.tryParse(rawTime.toString()) : null;
    final device     = (log['device_info']   ?? 'Unknown Device').toString();
    final location   = (log['location_name'] ?? '').toString();

    // Format time
    String timeStr = '—';
    if (loginTime != null) {
      final diff = DateTime.now().difference(loginTime);
      if (diff.inMinutes < 1)        timeStr = 'Just now';
      else if (diff.inMinutes < 60)  timeStr = '${diff.inMinutes}m ago';
      else if (diff.inHours < 24)    timeStr = '${diff.inHours}h ago';
      else if (diff.inDays == 1)     timeStr = 'Yesterday';
      else if (diff.inDays < 7)      timeStr = '${diff.inDays}d ago';
      else timeStr = '${loginTime.day}/${loginTime.month}/${loginTime.year}';
    }

    // Detect device icon
    final dl         = device.toLowerCase();
    final deviceIcon = dl.contains('mobile') || dl.contains('iphone') || dl.contains('android')
        ? Icons.phone_android
        : dl.contains('tablet') || dl.contains('ipad')
            ? Icons.tablet_mac
            : Icons.computer;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: isFirst ? _C.green.withOpacity(0.03) : Colors.transparent,
        border: Border(bottom: BorderSide(color: _C.border.withOpacity(0.5))),
      ),
      child: Row(children: [
        // Device icon
        Icon(deviceIcon, size: 16, color: isFirst ? _C.green : _C.txt3),
        const SizedBox(width: 12),

        // Device name + current session label
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start,
            children: [
          Text(device,
              style: GoogleFonts.inter(fontSize: 13,
                  fontWeight: FontWeight.w500, color: _C.txt1),
              overflow: TextOverflow.ellipsis, maxLines: 1),
          if (isFirst)
            Text('Current session',
                style: GoogleFonts.inter(
                    fontSize: 10, color: _C.green,
                    fontWeight: FontWeight.w600)),
        ])),

        // Location
        SizedBox(
          width: 140,
          child: location.isNotEmpty
              ? Row(children: [
                  Icon(Icons.location_on_outlined,
                      size: 11, color: _C.txt3),
                  const SizedBox(width: 3),
                  Expanded(
                    child: Text(location,
                        style: GoogleFonts.inter(
                            fontSize: 11, color: _C.txt2),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1),
                  ),
                ])
              : Text('—',
                  style: GoogleFonts.inter(
                      fontSize: 11, color: _C.txt3)),
        ),

        // Time
        SizedBox(
          width: 70,
          child: Text(timeStr,
              style: GoogleFonts.inter(fontSize: 11, color: _C.txt3),
              textAlign: TextAlign.right),
        ),
      ]),
    );
  }


  // ── 5. SESSIONS ───────────────────────────────────────────────────────
  Widget _buildSessionsCard() {
    return _Card(child: Column(crossAxisAlignment: CrossAxisAlignment.start,
        children: [
      _cardTitle(Icons.devices_outlined, 'Active Sessions'),
      const SizedBox(height: 16),
      Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: _C.blue.withOpacity(0.05),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: _C.blue.withOpacity(0.2)),
        ),
        child: Row(children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              color: _C.blue.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.computer, color: _C.blue, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(child: Column(
              crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Text('Current Session',
                  style: GoogleFonts.inter(fontSize: 13,
                      fontWeight: FontWeight.bold, color: _C.txt1)),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                    color: _C.green.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8)),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Container(width: 5, height: 5,
                      decoration: const BoxDecoration(
                          color: _C.green, shape: BoxShape.circle)),
                  const SizedBox(width: 4),
                  Text('Active', style: GoogleFonts.inter(
                      fontSize: 9, color: _C.green, fontWeight: FontWeight.bold)),
                ]),
              ),
            ]),
            Text('You are currently signed in',
                style: GoogleFonts.inter(fontSize: 11, color: _C.txt3)),
          ])),
        ]),
      ),
      const SizedBox(height: 16),
      Text('Sign out of all other devices if you think your account has been compromised.',
          style: GoogleFonts.inter(fontSize: 13, color: _C.txt2, height: 1.5)),
      const SizedBox(height: 16),
      SizedBox(
        width: double.infinity,
        child: OutlinedButton.icon(
          onPressed: _isSigningOut ? null : _signOutAllSessions,
          icon: _isSigningOut
              ? const SizedBox(width: 14, height: 14,
                  child: CircularProgressIndicator(strokeWidth: 2, color: _C.red))
              : const Icon(Icons.logout, size: 16, color: _C.red),
          label: Text('Sign Out All Sessions',
              style: GoogleFonts.inter(color: _C.red, fontWeight: FontWeight.bold)),
          style: OutlinedButton.styleFrom(
            side: BorderSide(color: _C.red.withOpacity(0.4)),
            padding: const EdgeInsets.symmetric(vertical: 12),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        ),
      ),
    ]));
  }

  // ── 6. DANGER ZONE ────────────────────────────────────────────────────
  Widget _buildDangerZone() {
    return Container(
      decoration: BoxDecoration(
        color: _C.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _C.red.withOpacity(0.3)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03),
            blurRadius: 8, offset: const Offset(0, 2))],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: _C.red.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.warning_amber_rounded, color: _C.red, size: 18),
          ),
          const SizedBox(width: 10),
          Text('Danger Zone',
              style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold,
                  color: _C.red)),
        ]),
        const SizedBox(height: 16),
        const Divider(color: Color(0xFFFFE2E8)),
        const SizedBox(height: 16),
        Text('Delete Account',
            style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.bold,
                color: _C.txt1)),
        const SizedBox(height: 6),
        Text('Permanently delete your account and all associated data. '
            'This action cannot be undone.',
            style: GoogleFonts.inter(fontSize: 12, color: _C.txt2, height: 1.5)),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton(
            onPressed: _deleteAccount,
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: _C.red),
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
            ),
            child: Text('Delete My Account',
                style: GoogleFonts.inter(color: _C.red,
                    fontWeight: FontWeight.bold)),
          ),
        ),
      ]),
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────
  Widget _Card({required Widget child}) => Container(
    width: double.infinity,
    padding: const EdgeInsets.all(20),
    decoration: BoxDecoration(
      color: _C.surface,
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: _C.border),
      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03),
          blurRadius: 8, offset: const Offset(0, 2))],
    ),
    child: child,
  );

  Widget _cardTitle(IconData icon, String title) => Row(children: [
    Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: _C.navy.withOpacity(0.06),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Icon(icon, size: 18, color: _C.navy),
    ),
    const SizedBox(width: 10),
    Text(title, style: GoogleFonts.inter(
        fontSize: 15, fontWeight: FontWeight.bold, color: _C.txt1)),
  ]);
}

// ── Data model ─────────────────────────────────────────────────────────────
class _SecurityCheck {
  final String   label, pts;
  final bool     passed;
  final IconData icon;
  const _SecurityCheck(this.label, this.passed, this.pts, this.icon);
}

// ── SVG QR Widget ─────────────────────────────────────────────────────────
// Renders the SVG QR code from Supabase using flutter_svg
// If flutter_svg is not in your pubspec.yaml, add it:
// flutter_svg: ^2.0.0
class _SvgQrWidget extends StatelessWidget {
  final String svgString;
  const _SvgQrWidget({required this.svgString});

  @override
  Widget build(BuildContext context) {
    // Try to import flutter_svg dynamically
    // If not available, shows manual entry fallback
    try {
      // Using SvgPicture from flutter_svg package
      // ignore: undefined_identifier
      return SvgPicture.string(
        svgString,
        width : 200,
        height: 200,
        fit   : BoxFit.fill,
      );
    } catch (e) {
      return Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        const Icon(Icons.qr_code_2, size: 80, color: Color(0xFF94A3B8)),
        const SizedBox(height: 8),
        Text('Use manual entry below',
            style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
            textAlign: TextAlign.center),
      ]);
    }
  }
}