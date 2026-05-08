import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ApiNotificationService {
  static final _supabase = Supabase.instance.client;
  
  /// Check for warnings and show notifications
  static Future<void> checkAndNotify(BuildContext context) async {
    final config = await _supabase
        .from('api_fleet_config')
        .select()
        .eq('platform_name', 'ebay')
        .single();
    
    // Check 1: Rate limit warning (85%+)
    final usage = config['rate_limit_used'] ?? 0;
    final total = config['rate_limit_total'] ?? 5000;
    final percentage = (usage / total * 100).round();
    
    if (percentage >= 85 && percentage < 95) {
      _showWarning(context, 
        '⚠️ API Limit Warning', 
        'eBay API usage at $percentage%. Consider upgrading or optimizing calls.',
        Colors.orange,
      );
    } else if (percentage >= 95) {
      _showWarning(context,
        '🚨 Critical: API Limit',
        'eBay API at $percentage%! Some features may be disabled.',
        Colors.red,
      );
    }
    
    // Check 2: Key expiration (30 days or less)
    if (config['expires_at'] != null) {
      final expiresAt = DateTime.parse(config['expires_at']);
      final daysLeft = expiresAt.difference(DateTime.now()).inDays;
      
      if (daysLeft <= 7 && daysLeft > 0) {
        _showWarning(context,
          '🔑 Keys Expiring Soon',
          'eBay keys expire in $daysLeft days. Rotate immediately!',
          Colors.red,
        );
      } else if (daysLeft <= 30) {
        _showWarning(context,
          '⏰ Key Rotation Reminder',
          'eBay keys expire in $daysLeft days.',
          Colors.orange,
        );
      }
    }
    
    // Check 3: Status errors
    if (config['status'] == 'error' || config['status'] == 'expired') {
      _showWarning(context,
        '❌ API Connection Error',
        'eBay API is not responding. Check Admin → API Vault.',
        Colors.red,
      );
    }
  }
  
  static void _showWarning(
    BuildContext context, 
    String title, 
    String message,
    Color color,
  ) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(Icons.warning_amber, color: Colors.white),
            SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(title, style: TextStyle(fontWeight: FontWeight.bold)),
                  Text(message, style: TextStyle(fontSize: 12)),
                ],
              ),
            ),
          ],
        ),
        backgroundColor: color,
        duration: Duration(seconds: 5),
        action: SnackBarAction(
          label: 'SETTINGS',
          textColor: Colors.white,
          onPressed: () {
            // Navigate to API Vault
          },
        ),
      ),
    );
  }
}