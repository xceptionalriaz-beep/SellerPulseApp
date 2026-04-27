import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:provider/provider.dart'; 
import 'package:flutter_dotenv/flutter_dotenv.dart'; 
import 'package:sellerpulse/providers/market_provider.dart'; 
import 'auth_gate.dart'; 

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  String? errorMessage;
  String debugInfo = "Starting init...";

  try {
    // 1. Try to load the REAL .env first
    try {
      await dotenv.load(fileName: ".env");
      debugInfo = "Loaded .env successfully";
    } catch (e) {
      debugInfo = ".env load failed, trying .env.example";
      try {
        await dotenv.load(fileName: ".env.example");
        debugInfo = "Loaded .env.example successfully";
      } catch (ee) {
        debugInfo = "No .env files found in assets!";
      }
    }

    // 2. Collect Keys
    final String url = dotenv.maybeGet('SUPABASE_URL') ?? 
                       const String.fromEnvironment('SUPABASE_URL', defaultValue: 'https://ohgejewwsnbyouozymcc.supabase.co');
    
    final String key = dotenv.maybeGet('SUPABASE_SERVICE_ROLE_KEY') ?? 
                       const String.fromEnvironment('SUPABASE_SERVICE_ROLE_KEY');

    // 3. Validation Check
    if (key.isEmpty) {
      errorMessage = "Supabase Key is empty! \n$debugInfo \n\nCheck if .env is added to pubspec.yaml assets.";
    } else {
      // Show first 5 chars for debugging
      final maskedKey = "${key.substring(0, 5)}...";
      debugPrint("Connecting to Supabase with key: $maskedKey");

      await Supabase.initialize(
        url: url,
        anonKey: key,
      );
    }
  } catch (e) {
    errorMessage = "Critical Failure: $e \n\nDebug: $debugInfo";
  }

  runApp(SellerPulseApp(error: errorMessage));
}

class SellerPulseApp extends StatelessWidget {
  final String? error;
  const SellerPulseApp({super.key, this.error});

  @override
  Widget build(BuildContext context) {
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
                  const Icon(Icons.hub_rounded, color: Colors.redAccent, size: 60),
                  const SizedBox(height: 24),
                  const Text("Connection Failed", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(8)),
                    child: Text(error!, style: const TextStyle(color: Colors.red, fontSize: 13, fontFamily: 'monospace'), textAlign: TextAlign.left),
                  ),
                  const SizedBox(height: 24),
                  const Text("ACTION: Check pubspec.yaml assets and restart the debugger.", style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ),
        ),
      );
    }

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