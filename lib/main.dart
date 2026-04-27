import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:provider/provider.dart'; 
import 'package:flutter_dotenv/flutter_dotenv.dart'; 
import 'package:sellerpulse/providers/market_provider.dart'; 
import 'auth_gate.dart'; 

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  String? errorMessage;

  try {
    // 1. Load the .env file (Works locally AND now works perfectly on Vercel!)
    await dotenv.load(fileName: ".env");

    // 2. Grab the keys
    final String url = dotenv.env['SUPABASE_URL'] ?? '';
    final String key = dotenv.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '';

    // 3. Safety Check & Connect
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
    // 🛑 If anything fails, show our beautiful safety net
    if (error != null) {
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        home: Scaffold(
          backgroundColor: const Color(0xFF0F172A),
          body: Center(
            child: Container(
              width: 500,
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.check_circle_outline, color: Colors.redAccent, size: 60),
                  const SizedBox(height: 24),
                  const Text("Connection Interrupted", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                  const SizedBox(height: 16),
                  Text(error!, style: const TextStyle(color: Colors.red, fontWeight: FontWeight.w600), textAlign: TextAlign.center),
                ],
              ),
            ),
          ),
        ),
      );
    }

    // ✅ If it works, load the app!
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => MarketProvider()),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'SellerPulse',
        theme: ThemeData(scaffoldBackgroundColor: const Color(0xFFF8FAFC)),
        home: const AuthGate(),
      ),
    );
  }
}