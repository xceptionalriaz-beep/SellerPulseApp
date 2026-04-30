import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/foundation.dart'; // For kIsWeb

class SessionTracker {
  /// Captures the IP, Platform, and Browser of the current user
  static Future<Map<String, String>> getLoginMetadata() async {
    String ip = "Unknown IP";
    String platform = "Unknown Platform";
    String browser = "Unknown Browser";

    // 1. Grab the Public IP Address safely
    try {
      final response = await http.get(Uri.parse('https://api.ipify.org?format=json')).timeout(const Duration(seconds: 3));
      if (response.statusCode == 200) {
        ip = jsonDecode(response.body)['ip'];
      }
    } catch (e) {
      debugPrint("IP Fetch Error: $e");
    }

    // 2. Grab the Device Hardware & Browser Info
    DeviceInfoPlugin deviceInfo = DeviceInfoPlugin();
    try {
      if (kIsWeb) {
        WebBrowserInfo webInfo = await deviceInfo.webBrowserInfo;
        
        // ✨ CLEANUP LOGIC for Web Platforms
        String rawPlatform = webInfo.platform ?? "Web UI";
        if (rawPlatform.contains("Win32")) platform = "Windows";
        else if (rawPlatform.contains("MacIntel")) platform = "macOS";
        else platform = rawPlatform;
        
        // Clean up Browser Name (e.g., "CHROME" -> "Chrome")
        String rawBrowser = webInfo.browserName.name;
        browser = rawBrowser.substring(0, 1).toUpperCase() + rawBrowser.substring(1).toLowerCase();

      } else if (Platform.isAndroid) {
        AndroidDeviceInfo androidInfo = await deviceInfo.androidInfo;
        platform = "Android ${androidInfo.version.release}";
        browser = "Mobile App";
      } else if (Platform.isIOS) {
        IosDeviceInfo iosInfo = await deviceInfo.iosInfo;
        platform = "iOS ${iosInfo.systemVersion}";
        browser = "Mobile App";
      } else if (Platform.isWindows) {
        platform = "Windows PC";
        browser = "Desktop App";
      } else if (Platform.isMacOS) {
        platform = "Mac Computer";
        browser = "Desktop App";
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