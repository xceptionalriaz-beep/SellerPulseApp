import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter/foundation.dart'; 
import 'dart:html' as html; 

class BillingService {
  static final SupabaseClient _supabase = Supabase.instance.client;

  // ✨ LAUNCH SECURE LEMON SQUEEZY PORTAL
  static Future<void> updatePaymentMethod() async {
    try {
      // 1. Get the user ID to request their specific billing link
      final user = _supabase.auth.currentUser;
      if (user == null) throw "User not logged in.";

      // 2. Fetch the Secure Portal Link
      // NOTE: Eventually, this will call a Supabase Edge Function to generate a secure, one-time link.
      // For now, we use your base Lemon Squeezy store link. 
      // Replace this URL with your actual Lemon Squeezy store/customer portal URL.
      const String portalUrl = "https://reazify.lemonsqueezy.com/billing"; 

      // 3. ✨ THE CROSS-PLATFORM SMART ROUTER
      if (kIsWeb) {
        // On Web: Open a floating centered pop-up window (500x750)
        html.window.open(
          portalUrl, 
          'SecureBillingVault', 
          'width=500,height=750,left=300,top=100,scrollbars=yes,status=no,resizable=yes'
        );
      } else {
        // On Mobile App (iOS/Android): Open the sliding in-app browser sheet
        final Uri authUrl = Uri.parse(portalUrl);
        if (await canLaunchUrl(authUrl)) {
          await launchUrl(
            authUrl, 
            mode: LaunchMode.inAppBrowserView, 
          );
        } else {
          throw "Could not open the secure browser.";
        }
      }
    } catch (e) {
      debugPrint("Billing Error: $e");
      throw Exception("Failed to open the secure payment portal. Please try again.");
    }
  }
}