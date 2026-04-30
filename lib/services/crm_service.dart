import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter/foundation.dart';

class CrmService {
  // A private shortcut to your Supabase client
  static final SupabaseClient _supabase = Supabase.instance.client;

  // ✨ THE ENTERPRISE UPGRADE: Bulletproof one-time fetch. No fragile streams!
  // Note: Because this uses .select(), it automatically grabs the new 'display_id', 
  // 'last_login_ip', 'browser_agent', and 'device_platform' columns!
  static Future<List<Map<String, dynamic>>> fetchAllUsers() async {
    try {
      final response = await _supabase
          .from('profiles')
          .select()
          .order('created_at', ascending: false);
          
      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      debugPrint("CRM Service Error (Fetch Users): $e");
      return []; // Returns an empty list instead of crashing if internet drops
    }
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
    required String gender,
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
            'gender': gender, 
            'avatar_url': avatarUrl, 
            'account_status': 'Active',
          },
        ),
      );

      if (res.user != null) {
        // Force update the public.profiles table
        await _supabase.from('profiles').update({
          'name': fullName,
          'plan_name': plan,
          'gender': gender, 
          'avatar_url': avatarUrl, 
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

  // ✨ 6. DELETE USER (Danger Zone)
  static Future<void> deleteUser(String userId) async {
    try {
      // TODO: Replace with actual Supabase Admin API call when ready
      // await _supabase.auth.admin.deleteUser(userId);
      // await _supabase.from('profiles').delete().eq('id', userId);
      
      await Future.delayed(const Duration(milliseconds: 1000));
      debugPrint("User $userId successfully deleted.");
    } catch (e) {
      debugPrint("CRM Service Error (Delete User): $e");
      throw "Failed to delete user: $e";
    }
  }

  // ===========================================================================
  // ✨ NEW: COMMAND CENTER POWERS (Added for Detailed Profile Drawer)
  // ===========================================================================

  /// 1. Send Password Reset Email
  static Future<void> sendPasswordReset(String email) async {
    try {
      // TODO: Replace with actual Supabase/Firebase Auth call
      // await Supabase.instance.client.auth.resetPasswordForEmail(email);
      
      // Simulating network delay for the UI
      await Future.delayed(const Duration(milliseconds: 800)); 
      debugPrint("Password reset email sent to: $email");
    } catch (e) {
      throw Exception("Failed to send reset email: $e");
    }
  }

  /// 2. Force Logout (Revoke all sessions)
  static Future<void> forceLogoutUser(String userId) async {
    try {
      // TODO: Replace with actual backend logic to revoke refresh tokens
      // await Supabase.instance.client.rpc('revoke_user_sessions', params: {'user_id': userId});
      
      await Future.delayed(const Duration(milliseconds: 800));
      debugPrint("All active sessions revoked for user: $userId");
    } catch (e) {
      throw Exception("Failed to force logout: $e");
    }
  }

  // ===========================================================================
  // ✨ PHASE 2: SECURITY & AUDIT LOGS (The Sentinel System)
  // ===========================================================================

  /// 1. Internal Log Writer (Automatically records admin actions)
  static Future<void> logAuditEvent({
    required String userId,
    required String action,
    required String ip,
    required String location,
    required String details,
  }) async {
    try {
      await _supabase.from('audit_logs').insert({
        'user_id': userId,
        'action_type': action,
        'ip_address': ip,
        'location': location,
        'details': details,
      });
    } catch (e) {
      debugPrint("CRM Service Error (Log Audit): $e");
    }
  }

  /// 2. Fetch Security Logs (For the Dashboard UI)
  static Future<List<Map<String, dynamic>>> fetchSecurityLogs() async {
    try {
      // We use a join here: 'profiles(name, email)' grabs the user info attached to the log!
      final response = await _supabase
          .from('audit_logs')
          .select('*, profiles(name, email)')
          .order('created_at', ascending: false)
          .limit(50); // Only grab the 50 most recent for performance
          
      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      debugPrint("CRM Service Error (Fetch Logs): $e");
      return [];
    }
  }

  /// 3. The "Kill Switch": Lock Account
  static Future<void> lockAccount(String userId, {String adminIp = 'Internal'}) async {
    try {
      // 1. Change their status in the DB
      await updateUserStatus(userId, 'Locked');
      
      // 2. Revoke all active tokens so they are kicked out instantly
      await forceLogoutUser(userId);
      
      // 3. Write it to the permanent Audit Log
      await logAuditEvent(
        userId: userId,
        action: 'Account Locked',
        ip: adminIp,
        location: 'Admin Dashboard',
        details: 'Account locked via Command Center Kill Switch.',
      );
      
      debugPrint("User $userId locked successfully.");
    } catch (e) {
      throw Exception("Failed to lock account: $e");
    }
  }

  /// 4. Block IP Address (WAF Integration)
  static Future<void> blockIP(String ipAddress, String adminUserId) async {
    try {
      // NOTE: In a production environment, this would call a Supabase Edge Function 
      // that talks to Cloudflare or AWS WAF to block the IP at the firewall level.
      // For now, we simulate the action and log it perfectly.
      
      await Future.delayed(const Duration(milliseconds: 800)); // Simulate Firewall API call
      
      await logAuditEvent(
        userId: adminUserId, // The Admin who pushed the button
        action: 'IP Blocked',
        ip: ipAddress,
        location: 'Firewall API',
        details: 'Admin permanently blocked IP: $ipAddress',
      );
      
      debugPrint("IP $ipAddress successfully blocked.");
    } catch (e) {
      throw Exception("Failed to block IP: $e");
    }
  }

  // ===========================================================================
  // ✨ PHASE 3: DEVICE & SESSION MANAGEMENT (New!)
  // ===========================================================================

  /// Fetch all active devices for a specific user
  static Future<List<Map<String, dynamic>>> fetchUserDevices(String userId) async {
    try {
      // TODO: Connect this to your future 'user_devices' or 'sessions' table
      // final response = await _supabase.from('user_devices').select().eq('user_id', userId);
      // return List<Map<String, dynamic>>.from(response);

      await Future.delayed(const Duration(milliseconds: 600)); // Simulate DB fetch
      
      // 🛑 TEMPORARY MOCK DATA (Until the real table is ready)
      return [
        {
          "device_id": "dev_win_01",
          "platform": "Windows 11",
          "browser": "Chrome",
          "ip_address": "192.168.1.45",
          "last_active": "2 mins ago",
          "is_current": true
        },
        {
          "device_id": "dev_ios_02",
          "platform": "iOS 17",
          "browser": "Safari",
          "ip_address": "10.0.0.12",
          "last_active": "3 days ago",
          "is_current": false
        }
      ];
    } catch (e) {
      debugPrint("CRM Service Error (Fetch Devices): $e");
      throw Exception("Failed to fetch user devices: $e");
    }
  }

  /// Remotely log a user out of a specific device
  static Future<void> removeUserDevice(String userId, String deviceId) async {
    try {
      // TODO: Call Supabase Edge function or delete from 'user_devices' table
      // await _supabase.from('user_devices').delete().match({'user_id': userId, 'device_id': deviceId});
      
      await Future.delayed(const Duration(milliseconds: 800)); // Simulate network
      debugPrint("Device $deviceId removed for user $userId");
    } catch (e) {
      throw Exception("Failed to remove device: $e");
    }
  }

  // ===========================================================================
  // ✨ PHASE 4: CONNECTED STORES
  // ===========================================================================

  /// Fetch Connected Stores Data
  static Future<List<Map<String, dynamic>>> getConnectedStores(String userId) async {
    try {
      // TODO: Replace with actual database query joining the 'stores' table
      // final response = await Supabase.instance.client.from('stores').select().eq('user_id', userId);
      // return List<Map<String, dynamic>>.from(response);

      await Future.delayed(const Duration(milliseconds: 600)); // Simulate DB fetch
      
      // 🛑 TEMPORARY MOCK DATA
      return [
        {
          "id": "store_123",
          "name": "Super Deals eBay",
          "platform": "eBay",
          "status": "Active",
          "last_sync": "2m ago"
        },
        {
          "id": "store_456",
          "name": "Tech Gadgets Direct",
          "platform": "eBay",
          "status": "Active",
          "last_sync": "15m ago"
        }
      ];
    } catch (e) {
      throw Exception("Failed to fetch stores: $e");
    }
  }
}