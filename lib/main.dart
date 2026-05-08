import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:sellerpulse/providers/market_provider.dart';
import 'auth_gate.dart';
import 'pages/auth/reset_password_page.dart';                    // ← NEW
import 'pages/competitor_research/competitor_research_main.dart';
import 'pages/competitor_research/listing_ideas_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  String? errorMessage;

  try {
    await dotenv.load(fileName: ".env");

    final String url = dotenv.env['SUPABASE_URL'] ?? '';
    final String key = dotenv.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '';

    if (key.isEmpty || url.isEmpty) {
      errorMessage = "Error: Keys are missing from the .env file!";
    } else {
      await Supabase.initialize(url: url, anonKey: key);
    }
  } catch (e) {
    errorMessage = "Startup Failed: $e";
  }

  runApp(SellerPulseApp(error: errorMessage));
}

class SellerPulseApp extends StatelessWidget {
  final String? error;
  const SellerPulseApp({super.key, this.error});

  @override
  Widget build(BuildContext context) {
    // 🛑 Error screen
    if (error != null) {
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        home: Scaffold(
          backgroundColor: const Color(0xFF0F172A),
          body: Center(
            child: Container(
              width: 500,
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16)),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.check_circle_outline,
                      color: Colors.redAccent, size: 60),
                  const SizedBox(height: 24),
                  const Text("Connection Interrupted",
                      style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0F172A))),
                  const SizedBox(height: 16),
                  Text(error!,
                      style: const TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.w600),
                      textAlign: TextAlign.center),
                ],
              ),
            ),
          ),
        ),
      );
    }

    // ✅ Main app
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => MarketProvider()),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'SellerPulse',
        theme: ThemeData(
            scaffoldBackgroundColor: const Color(0xFFF8FAFC)),

        // ── Entry point ──
        home: const _AppRoot(),                                  // ← CHANGED

        // ── Routes ──
        routes: {
          '/competitor'              : (context) => const CompetitorResearchMain(),
          '/competitor/listing-ideas': (context) => const ListingIdeasScreen(),
          '/reset-password'          : (context) => const ResetPasswordPage(), // ← NEW
        },
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// _AppRoot — listens for auth events including password recovery
// ═══════════════════════════════════════════════════════════════════════════

class _AppRoot extends StatefulWidget {
  const _AppRoot();
  @override
  State<_AppRoot> createState() => _AppRootState();
}

class _AppRootState extends State<_AppRoot> {
  @override
  void initState() {
    super.initState();

    // ✅ Listen for auth state changes
    Supabase.instance.client.auth.onAuthStateChange.listen((data) {
      if (!mounted) return;

      final event = data.event;

      // When user clicks the reset password link in email
      if (event == AuthChangeEvent.passwordRecovery) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(
              builder: (_) => const ResetPasswordPage()),
          (route) => false,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    // Just show AuthGate as normal
    return const AuthGate();
  }
}