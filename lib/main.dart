import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:provider/provider.dart'; 
import 'package:flutter_dotenv/flutter_dotenv.dart'; 

import 'package:sellerpulse/providers/market_provider.dart'; 
import 'auth_gate.dart'; 

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // ✨ 1. Load the dummy file so Vercel doesn't crash looking for assets
  try {
    await dotenv.load(fileName: ".env.example");
  } catch (e) {
    debugPrint("Placeholder .env.example not found.");
  }
  
  // ✨ 2. Try to load your real private .env (will only work on your local laptop)
  try {
    await dotenv.load(fileName: ".env");
  } catch (e) {
    debugPrint("Real .env not found (this is expected and normal on Vercel).");
  }

  // ✨ 3. The "Smart Switch": Checks the file first, then checks Vercel's Dashboard Settings!
  final String supabaseUrl = dotenv.maybeGet('SUPABASE_URL') ?? 
                             const String.fromEnvironment('SUPABASE_URL', defaultValue: 'https://ohgejewwsnbyouozymcc.supabase.co');
                             
  final String supabaseKey = dotenv.maybeGet('SUPABASE_SERVICE_ROLE_KEY') ?? 
                             const String.fromEnvironment('SUPABASE_SERVICE_ROLE_KEY');

  // ✨ 4. Connect to Supabase
  await Supabase.initialize(
    url: supabaseUrl,
    anonKey: supabaseKey,
  );
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => MarketProvider()),
      ],
      child: const SellerPulseApp(),
    ),
  );
}

class SellerPulseApp extends StatelessWidget {
  const SellerPulseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'SellerPulse',
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFFF8FAFC), 
      ),
      // The app still starts at the AuthGate to check if user is logged in
      home: const AuthGate(), 
    );
  }
}