import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter/foundation.dart'; // ✨ NEW: Lets us detect if we are on Web
import 'dart:html' as html; // ✨ NEW: Lets us command the desktop web browser to use a pop-up

class EbayService {
  // A private shortcut to your Supabase client
  static final SupabaseClient _supabase = Supabase.instance.client;

  // ✨ 1. CHECK CONNECTION STATUS
  // Returns a Map with the user's data if connected, or null if not connected.
  static Future<Map<String, dynamic>?> checkConnection() async {
    final user = _supabase.auth.currentUser;
    if (user == null) return null;

    try {
      final data = await _supabase
          .from('ebay_connections')
          .select('id, ebay_user_id')
          .eq('user_id', user.id)
          .maybeSingle();
          
      return data; // Will return the row data, or null if no row exists
    } catch (e) {
      debugPrint("eBay Service Error (Check Connection): $e");
      return null;
    }
  }

  // ✨ 2. LAUNCH OAUTH HANDSHAKE (UPGRADED FOR WEB POP-UPS & MOBILE IN-APP BROWSER)
  static Future<void> connectEbay() async {
    try {
      final vaultData = await _supabase
          .from('api_fleet_config')
          .select('primary_key_1')
          .eq('platform_name', 'ebay')
          .single();

      final String appId = vaultData['primary_key_1'];
      const String ruName = "Reazify_LLC-ReazifyL-Seller-qpmttkudp";
      
      if (appId.isEmpty || appId == 'EMPTY') throw "eBay App ID is missing in vault.";

      final String userId = _supabase.auth.currentUser!.id;

      // ✨ CRITICAL FIREWALL FIX: We manually encode the scope to guarantee %20
      final String rawScope = 'https://api.ebay.com/oauth/api_scope/sell.account.readonly '
                              'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly '
                              'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly';
                              
      final String encodedScope = Uri.encodeComponent(rawScope);

      final String fullUrl = 'https://auth.ebay.com/oauth2/authorize'
          '?client_id=$appId'
          '&response_type=code'
          '&redirect_uri=$ruName'
          '&scope=$encodedScope'
          '&state=$userId';

      // ✨ THE CROSS-PLATFORM ROUTER
      if (kIsWeb) {
        // On Web: Open a floating centered pop-up window (500x750)
        html.window.open(
          fullUrl, 
          'eBayAuth', 
          'width=500,height=750,left=300,top=100,scrollbars=yes,status=no,resizable=yes'
        );
      } else {
        // On Mobile App (iOS/Android): Open the sliding in-app browser sheet
        final Uri ebayAuthUrl = Uri.parse(fullUrl);
        if (await canLaunchUrl(ebayAuthUrl)) {
          await launchUrl(
            ebayAuthUrl, 
            mode: LaunchMode.inAppBrowserView, 
          );
        } else {
          throw "Could not open the browser.";
        }
      }
    } catch (e) {
      throw Exception("Failed to start eBay connection: $e");
    }
  }

  // ✨ 3. DISCONNECT ACCOUNT
  static Future<void> disconnect() async {
    final user = _supabase.auth.currentUser;
    if (user == null) return;

    try {
      await _supabase
          .from('ebay_connections')
          .delete()
          .eq('user_id', user.id);
    } catch (e) {
      debugPrint("eBay Service Error (Disconnect): $e");
      throw Exception("Failed to disconnect eBay account.");
    }
  }
}