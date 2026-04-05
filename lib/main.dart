import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:provider/provider.dart'; // ✨ NEW: The Provider tool
import 'package:sellerpulse/providers/market_provider.dart'; // ✨ NEW: Importing the Brain
import 'auth_gate.dart'; 

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Connect to your Supabase database
  await Supabase.initialize(
    url: 'https://ohgejewwsnbyouozymcc.supabase.co',
    anonKey: 'sb_publishable_ZOhK9AUzgabwXvIRKeO8Kg_HYmIfulB',
  );
  
  runApp(
    // ✨ UPGRADE: We wrap the app here so the Brain can talk to all screens
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