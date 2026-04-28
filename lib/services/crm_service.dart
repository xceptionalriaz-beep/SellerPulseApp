import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter/foundation.dart';

class CrmService {
  // A private shortcut to your Supabase client
  static final SupabaseClient _supabase = Supabase.instance.client;

  // ✨ 1. THE LIVE FEED
  static Stream<List<Map<String, dynamic>>> getAdminUserStream() {
    return _supabase
        .from('profiles') 
        .stream(primaryKey: ['id'])
        .order('created_at', ascending: false); 
  }

  // ✨ 2. FOUNDER OVERRIDE ACTIONS
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

  // ✨ 4. LIVE SUPPORT FLAG MANAGEMENT
  static Future<void> updateSupportNote(String userId, String? note) async {
    try {
      await _supabase
          .from('profiles')
          .update({'dispute_note': note}) // Sends the real note, or sends 'null' to clear it
          .eq('id', userId);
    } catch (e) {
      debugPrint("CRM Service Error (Support Note): $e");
      throw Exception("Failed to update support note.");
    }
  }

  // ✨ 5. CREATE NEW USER 
  static Future<void> createNewUser({
    required String email,
    required String fullName,
    required String plan,
    required String tempPassword,
    required String gender, // ✨ FIXED: The Service now expects the gender!
    required bool sendWelcomeEmail,
  }) async {
    try {
      // ✨ AUTO-ASSIGN AVATAR URL BASED ON GENDER
      String avatarUrl = "";
      if (gender == 'Male') {
        avatarUrl = "https://cdn-icons-png.flaticon.com/512/4140/4140048.png"; 
      } else if (gender == 'Female') {
        avatarUrl = "https://cdn-icons-png.flaticon.com/512/4140/4140047.png";
      }

      final UserResponse res = await _supabase.auth.admin.createUser(
        AdminUserAttributes(
          email: email,
          password: tempPassword,
          emailConfirm: true, 
          userMetadata: {
            'full_name': fullName,
            'plan_name': plan,
            'gender': gender, // Save Gender
            'avatar_url': avatarUrl, // Save Auto-Avatar
            'account_status': 'Active',
          },
        ),
      );

      if (res.user != null) {
        // Force update the public.profiles table
        await _supabase.from('profiles').update({
          'name': fullName,
          'plan_name': plan,
          'gender': gender, // Save Gender
          'avatar_url': avatarUrl, // Save Auto-Avatar
          'account_status': 'Active',
        }).eq('id', res.user!.id);
      }

      if (sendWelcomeEmail) {
        debugPrint("Welcome email trigger flagged for: $email");
      }

    } catch (e) {
      debugPrint("CRM Service Error (Create User): $e");
      throw "Failed to create user: $e";
    }
  }
}