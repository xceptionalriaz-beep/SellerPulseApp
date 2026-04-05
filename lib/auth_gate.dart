import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'pages/landing_page.dart';
import 'pages/dashboard_page.dart';

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    // StreamBuilder constantly listens to Supabase to see if the user is logged in or out
    return StreamBuilder<AuthState>(
      stream: Supabase.instance.client.auth.onAuthStateChange,
      builder: (context, snapshot) {
        
        // 1. While the app is checking the database, show a sleek loading screen
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            backgroundColor: Color(0xFF131B2F), // Dark slate
            body: Center(
              child: CircularProgressIndicator(color: Color(0xFF8FFF00)), // Neon green spinner
            ),
          );
        }

        // 2. The check is complete! Do they have a valid VIP Session?
        final session = snapshot.hasData ? snapshot.data!.session : null;

        if (session != null) {
          // YES: They are logged in. Send them straight to the Dashboard!
          return const DashboardPage();
        } else {
          // NO: They are not logged in. Send them to the Public Landing Page!
          return const PublicLandingPage();
        }
      },
    );
  }
}