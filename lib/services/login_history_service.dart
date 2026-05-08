// ═══════════════════════════════════════════════════════════════════════════
// lib/services/login_history_service.dart
// ═══════════════════════════════════════════════════════════════════════════
// Logs login events to login_history table
// Captures: device info, IP address, location, timestamp
// ═══════════════════════════════════════════════════════════════════════════

import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html show window;

class LoginHistoryService {
  static final _supabase = Supabase.instance.client;

  // ── Main method: call this after every successful login ─────────────────
  static Future<void> logLogin() async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return;

    try {
      // Get device info
      final deviceInfo = _getDeviceInfo();

      // Get IP + location via free API
      String ipAddress    = 'Unknown';
      String locationName = 'Unknown';

      try {
        final result = await _supabase.functions.invoke(
          'get-login-info',
          body: {},
        );
        final data = result.data as Map<String, dynamic>? ?? {};
        ipAddress    = data['ip']       ?? 'Unknown';
        locationName = data['location'] ?? 'Unknown';
      } catch (_) {
        // Edge function not available — use fallback
        try {
          // Direct IP lookup as fallback (client side)
          ipAddress    = await _getIpFallback();
          locationName = 'Location unavailable';
        } catch (_) {}
      }

      // Save to login_history
      // Insert with exact columns: user_id, ip_address, device_info, login_at
      await _supabase.from('login_history').insert({
        'user_id'    : userId,
        'login_at'   : DateTime.now().toIso8601String(),
        'ip_address' : ipAddress,
        'device_info': deviceInfo,
      });

      debugPrint('✅ Login logged: $deviceInfo | $ipAddress | $locationName');

    } catch (e) {
      debugPrint('Login history error (non-critical): $e');
    }
  }

  // ── Get device info from browser user agent ─────────────────────────────
  static String _getDeviceInfo() {
    if (!kIsWeb) {
      // Mobile app
      return 'Mobile App';
    }

    try {
      final userAgent = html.window.navigator.userAgent.toLowerCase();
      String browser = 'Browser';
      String os      = 'Unknown OS';

      // Detect browser
      if (userAgent.contains('edg/'))         browser = 'Edge';
      else if (userAgent.contains('chrome'))  browser = 'Chrome';
      else if (userAgent.contains('firefox')) browser = 'Firefox';
      else if (userAgent.contains('safari'))  browser = 'Safari';
      else if (userAgent.contains('opera'))   browser = 'Opera';

      // Detect OS
      if (userAgent.contains('windows nt'))      os = 'Windows';
      else if (userAgent.contains('macintosh'))   os = 'macOS';
      else if (userAgent.contains('linux'))       os = 'Linux';
      else if (userAgent.contains('android'))     os = 'Android';
      else if (userAgent.contains('iphone'))      os = 'iPhone';
      else if (userAgent.contains('ipad'))        os = 'iPad';

      return '$os • $browser';
    } catch (e) {
      return 'Web Browser';
    }
  }

  // ── IP fallback via public API ───────────────────────────────────────────
  static Future<String> _getIpFallback() async {
    // This is a free public API - no key needed
    try {
      // Can't use http package directly due to CORS on web
      // Return placeholder - Edge Function handles the real IP
      return 'Web Client';
    } catch (_) {
      return 'Unknown';
    }
  }
}