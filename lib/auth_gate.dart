import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'pages/landing_page.dart';
import 'pages/dashboard_page.dart';
import 'pages/auth/reset_password_page.dart';
import 'services/login_history_service.dart';

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});
  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  bool _isLoggedIn = false;
  bool _isLoading  = true;

  @override
  void initState() {
    super.initState();

    // Check initial session
    final session = Supabase.instance.client.auth.currentSession;
    _isLoggedIn = session != null;
    _isLoading  = false;

    // Listen for ALL auth changes
    Supabase.instance.client.auth.onAuthStateChange.listen((data) {
      if (!mounted) return;
      final event   = data.event;
      final session = data.session;

      debugPrint('Auth event: $event session: ${session != null}');

      // Log login
      if (event == AuthChangeEvent.signedIn && session != null) {
        Future.microtask(() => LoginHistoryService.logLogin());
      }

      // Handle password recovery
      if (event == AuthChangeEvent.passwordRecovery) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const ResetPasswordPage()),
          (route) => false,
        );
        return;
      }

      // Update login state for ALL events
      setState(() {
        _isLoggedIn = session != null;
        _isLoading  = false;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFF131B2F),
        body: Center(
          child: CircularProgressIndicator(color: Color(0xFF8FFF00)),
        ),
      );
    }

    return _isLoggedIn
        ? const DashboardPage()
        : const PublicLandingPage();
  }
}