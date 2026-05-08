// ═══════════════════════════════════════════════════════════════════════════
// lib/pages/auth/reset_password_page.dart
// ═══════════════════════════════════════════════════════════════════════════
// Shown after user clicks reset link in email
// Supabase automatically handles the token — we just show the new password form
// ═══════════════════════════════════════════════════════════════════════════

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ResetPasswordPage extends StatefulWidget {
  const ResetPasswordPage({super.key});
  @override
  State<ResetPasswordPage> createState() => _ResetPasswordPageState();
}

class _ResetPasswordPageState extends State<ResetPasswordPage> {
  final _supabase  = Supabase.instance.client;
  final _newCtrl   = TextEditingController();
  final _confCtrl  = TextEditingController();

  bool _showNew    = false;
  bool _showConf   = false;
  bool _isLoading  = false;
  bool _isDone     = false;

  @override
  void dispose() {
    _newCtrl.dispose();
    _confCtrl.dispose();
    super.dispose();
  }

  // Password strength calculator
  Map<String, dynamic> _strength(String pass) {
    if (pass.isEmpty) return {'value': 0.0, 'color': Colors.grey, 'label': ''};
    int score = 0;
    if (pass.length >= 8)                          score++;
    if (pass.length >= 12)                         score++;
    if (RegExp(r'[A-Z]').hasMatch(pass))           score++;
    if (RegExp(r'[0-9]').hasMatch(pass))           score++;
    if (RegExp(r'[!@#\$%^&*]').hasMatch(pass))     score++;
    if (score <= 1) return {'value': 0.2, 'color': const Color(0xFFFF4D6A), 'label': 'Weak'};
    if (score <= 2) return {'value': 0.4, 'color': const Color(0xFFFFB800), 'label': 'Fair'};
    if (score <= 3) return {'value': 0.6, 'color': const Color(0xFFFFB800), 'label': 'Good'};
    if (score <= 4) return {'value': 0.8, 'color': const Color(0xFF00C48C), 'label': 'Strong'};
    return               {'value': 1.0, 'color': const Color(0xFF00C48C), 'label': 'Very Strong'};
  }

  Future<void> _setNewPassword() async {
    final newP = _newCtrl.text.trim();
    final conf = _confCtrl.text.trim();

    if (newP.isEmpty || conf.isEmpty) {
      _snack('⚠️ Please fill all fields', Colors.orange); return;
    }
    if (newP != conf) {
      _snack('❌ Passwords do not match', const Color(0xFFFF4D6A)); return;
    }
    if (newP.length < 8) {
      _snack('❌ Password must be at least 8 characters', const Color(0xFFFF4D6A)); return;
    }

    setState(() => _isLoading = true);
    try {
      // Supabase automatically has the session from the reset token
      // Just update the password directly
      await _supabase.auth.updateUser(UserAttributes(password: newP));
      setState(() { _isDone = true; _isLoading = false; });
    } on AuthException catch (e) {
      setState(() => _isLoading = false);
      _snack('❌ ${e.message}', const Color(0xFFFF4D6A));
    } catch (e) {
      setState(() => _isLoading = false);
      _snack('❌ Error: ${e.toString()}', const Color(0xFFFF4D6A));
    }
  }

  void _snack(String msg, Color color) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: color,
      behavior: SnackBarBehavior.floating,
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FA),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 440),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo
                Container(
                  width: 64, height: 64,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(Icons.shield, color: Color(0xFF8FFF00), size: 32),
                ),
                const SizedBox(height: 24),

                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 400),
                  child: _isDone ? _buildSuccessView() : _buildFormView(),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ── Form View ──────────────────────────────────────────────────────────
  Widget _buildFormView() {
    final strength = _strength(_newCtrl.text);
    return Container(
      key: const ValueKey('form'),
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 20, offset: const Offset(0, 8))],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Header
        Text('Set New Password',
            style: GoogleFonts.spaceGrotesk(
                fontSize: 24, fontWeight: FontWeight.w700,
                color: const Color(0xFF0F172A))),
        const SizedBox(height: 8),
        Text('Choose a strong password for your SellerPulse account.',
            style: GoogleFonts.inter(fontSize: 14, color: const Color(0xFF64748B))),
        const SizedBox(height: 28),

        // New Password
        _fieldLabel('New Password'),
        const SizedBox(height: 6),
        _passField(_newCtrl, _showNew,
            () => setState(() => _showNew = !_showNew),
            hint: 'Enter new password',
            onChanged: (_) => setState(() {})),

        // Strength bar
        if (_newCtrl.text.isNotEmpty) ...[
          const SizedBox(height: 10),
          Row(children: [
            Expanded(child: LinearProgressIndicator(
              value: strength['value'] as double,
              backgroundColor: const Color(0xFFE2E8F0),
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

        const SizedBox(height: 16),

        // Confirm Password
        _fieldLabel('Confirm New Password'),
        const SizedBox(height: 6),
        _passField(_confCtrl, _showConf,
            () => setState(() => _showConf = !_showConf),
            hint: 'Confirm new password'),

        // Match indicator
        if (_confCtrl.text.isNotEmpty && _newCtrl.text.isNotEmpty) ...[
          const SizedBox(height: 8),
          Row(children: [
            Icon(
              _newCtrl.text == _confCtrl.text
                  ? Icons.check_circle : Icons.cancel,
              size: 14,
              color: _newCtrl.text == _confCtrl.text
                  ? const Color(0xFF00C48C) : const Color(0xFFFF4D6A),
            ),
            const SizedBox(width: 6),
            Text(
              _newCtrl.text == _confCtrl.text
                  ? 'Passwords match' : 'Passwords do not match',
              style: GoogleFonts.inter(fontSize: 11,
                  color: _newCtrl.text == _confCtrl.text
                      ? const Color(0xFF00C48C) : const Color(0xFFFF4D6A),
                  fontWeight: FontWeight.w500),
            ),
          ]),
        ],

        const SizedBox(height: 24),

        // Password tips
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Password Tips:',
                style: GoogleFonts.inter(fontSize: 11,
                    fontWeight: FontWeight.bold, color: const Color(0xFF64748B))),
            const SizedBox(height: 6),
            _tip('At least 8 characters', _newCtrl.text.length >= 8),
            _tip('One uppercase letter', RegExp(r'[A-Z]').hasMatch(_newCtrl.text)),
            _tip('One number', RegExp(r'[0-9]').hasMatch(_newCtrl.text)),
            _tip('One special character (!@#\$)',
                RegExp(r'[!@#\$%^&*]').hasMatch(_newCtrl.text)),
          ]),
        ),

        const SizedBox(height: 24),

        // Submit button
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _setNewPassword,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0F172A),
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            child: _isLoading
                ? const SizedBox(width: 20, height: 20,
                    child: CircularProgressIndicator(
                        color: Colors.white, strokeWidth: 2))
                : Text('Set New Password',
                    style: GoogleFonts.inter(color: Colors.white,
                        fontWeight: FontWeight.bold, fontSize: 15)),
          ),
        ),
      ]),
    );
  }

  // ── Success View ───────────────────────────────────────────────────────
  Widget _buildSuccessView() {
    return Container(
      key: const ValueKey('success'),
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 20, offset: const Offset(0, 8))],
      ),
      child: Column(children: [
        // Success icon
        Container(
          width: 72, height: 72,
          decoration: BoxDecoration(
            color: const Color(0xFF00C48C).withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.check_circle,
              color: Color(0xFF00C48C), size: 40),
        ),
        const SizedBox(height: 20),
        Text('Password Updated!',
            style: GoogleFonts.spaceGrotesk(
                fontSize: 22, fontWeight: FontWeight.w700,
                color: const Color(0xFF0F172A))),
        const SizedBox(height: 10),
        Text('Your password has been changed successfully.\nYou can now sign in with your new password.',
            style: GoogleFonts.inter(fontSize: 14,
                color: const Color(0xFF64748B), height: 1.6),
            textAlign: TextAlign.center),
        const SizedBox(height: 28),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () {
              // Navigate to login or home
              Navigator.of(context).pushNamedAndRemoveUntil(
                  '/', (route) => false);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0F172A),
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            child: Text('Go to App',
                style: GoogleFonts.inter(color: Colors.white,
                    fontWeight: FontWeight.bold, fontSize: 15)),
          ),
        ),
      ]),
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────
  Widget _fieldLabel(String text) => Text(text,
      style: GoogleFonts.inter(fontSize: 12,
          fontWeight: FontWeight.w600, color: const Color(0xFF475569)));

  Widget _passField(
    TextEditingController ctrl,
    bool obscure,
    VoidCallback onToggle, {
    String hint = '',
    ValueChanged<String>? onChanged,
  }) {
    return TextField(
      controller: ctrl,
      obscureText: obscure,
      onChanged: onChanged,
      style: GoogleFonts.inter(fontSize: 14, color: const Color(0xFF0F172A)),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: GoogleFonts.inter(color: const Color(0xFF94A3B8)),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        contentPadding: const EdgeInsets.symmetric(
            horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(
                color: Color(0xFF0F172A), width: 1.5)),
        suffixIcon: IconButton(
          icon: Icon(obscure ? Icons.visibility_off : Icons.visibility,
              size: 18, color: const Color(0xFF94A3B8)),
          onPressed: onToggle,
        ),
      ),
    );
  }

  Widget _tip(String text, bool met) => Padding(
    padding: const EdgeInsets.only(top: 4),
    child: Row(children: [
      Icon(met ? Icons.check : Icons.circle_outlined,
          size: 12,
          color: met ? const Color(0xFF00C48C) : const Color(0xFF94A3B8)),
      const SizedBox(width: 6),
      Text(text, style: GoogleFonts.inter(
          fontSize: 11,
          color: met ? const Color(0xFF00C48C) : const Color(0xFF94A3B8))),
    ]),
  );
}