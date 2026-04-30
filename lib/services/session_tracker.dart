import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/foundation.dart'; // For kIsWeb

class SessionTracker {
  /// Captures the IP, Platform, and Browser of the current user
  static Future<Map<String, String>> getLoginMetadata() async {
    String ip = "No IP Logged";
    String platform = "Unknown";
    String browser = "Browser";

    // ==========================================
    // 1. BULLETPROOF IP FETCH (With Fallback for iPhones)
    // ==========================================
    try {
      final response = await http.get(Uri.parse('https://api.ipify.org?format=json')).timeout(const Duration(seconds: 3));
      if (response.statusCode == 200) {
        ip = jsonDecode(response.body)['ip'];
      }
    } catch (e) {
      debugPrint("Primary IP Fetch Failed, trying backup: $e");
      try {
        // Backup API if Apple/Safari blocks the first one
        final backupResponse = await http.get(Uri.parse('https://ipapi.co/json/')).timeout(const Duration(seconds: 3));
        if (backupResponse.statusCode == 200) {
          ip = jsonDecode(backupResponse.body)['ip'];
        }
      } catch (e2) {
        debugPrint("Backup IP Fetch Failed: $e2");
      }
    }

    // ==========================================
    // 2. BULLETPROOF DEVICE FETCH
    // ==========================================
    try {
      DeviceInfoPlugin deviceInfo = DeviceInfoPlugin();
      
      if (kIsWeb) {
        WebBrowserInfo webInfo = await deviceInfo.webBrowserInfo;
        String rawPlatform = webInfo.platform ?? "Web UI";
        
        // Mobile & Desktop Cleanup Filters
        if (rawPlatform.contains("Win32") || rawPlatform.contains("Windows")) platform = "Windows";
        else if (rawPlatform.contains("MacIntel") || rawPlatform.contains("Mac")) platform = "macOS";
        else if (rawPlatform.contains("iPhone")) platform = "iPhone";
        else if (rawPlatform.contains("iPad")) platform = "iPad";
        else if (rawPlatform.contains("Android")) platform = "Android";
        else platform = rawPlatform;
        
        // Clean up Browser Name (Crash-proof substring)
        String rawBrowser = webInfo.browserName.name; 
        if (rawBrowser.isNotEmpty) {
          browser = rawBrowser[0].toUpperCase() + rawBrowser.substring(1).toLowerCase();
        } else {
          browser = "Web Browser";
        }

      } else {
        // If you ever launch this as a real App Store app!
        if (Platform.isAndroid) {
          platform = "Android App";
          browser = "Native";
        } else if (Platform.isIOS) {
          platform = "iOS App";
          browser = "Native";
        } else if (Platform.isWindows) {
          platform = "Windows App";
          browser = "Native";
        } else if (Platform.isMacOS) {
          platform = "Mac App";
          browser = "Native";
        }
      }
    } catch (e) {
      debugPrint("Device Fetch Error: $e");
    }

    return {
      'last_login_ip': ip,
      'device_platform': platform,
      'browser_agent': browser,
    };
  }
}