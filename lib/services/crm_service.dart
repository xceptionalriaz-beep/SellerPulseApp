import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter/foundation.dart';

class CrmService {
  // A private shortcut to your Supabase client
  static final SupabaseClient _supabase = Supabase.instance.client;

  // ✨ 1. THE LIVE FEED
  // This opens a real-time socket to your 'profiles' table. 
  // Any time a new user signs up, this stream instantly updates your CRM UI.
  static Stream<List<Map<String, dynamic>>> getAdminUserStream() {
    return _supabase
        .from('profiles') // Ensure your Supabase table is named exactly this
        .stream(primaryKey: ['id'])
        .order('created_at', ascending: false); // Puts the newest signups at the very top
  }

  // ✨ 2. FOUNDER OVERRIDE ACTIONS
  // Use this when you click a button in your CRM to manually upgrade or downgrade a user.
  static Future<void> updateUserPlan(String userId, String newPlan) async {
    try {
      await _supabase
          .from('profiles')
          .update({'plan_name': newPlan})
          .eq('id', userId);
    } catch (e) {
      debugPrint("CRM Service Error (Update Plan): $e");
      throw Exception("Failed to update user plan. Check database permissions.");
    }
  }

  // ✨ 3. ACCOUNT STATUS MANAGEMENT
  // Example function for flagging users or marking them as Past Due
  static Future<void> updateUserStatus(String userId, String newStatus) async {
    try {
      await _supabase
          .from('profiles')
          .update({'account_status': newStatus})
          .eq('id', userId);
    } catch (e) {
      debugPrint("CRM Service Error (Update Status): $e");
      throw Exception("Failed to update user status.");
    }
  }
}