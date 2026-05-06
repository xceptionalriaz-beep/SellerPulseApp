// lib/pages/orders/notifications_service.dart
//
// SellerPulse - Notifications Service
// Generates alerts for: High-risk orders + Ship deadline reminders

import 'package:supabase_flutter/supabase_flutter.dart';

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION MODEL
// ═══════════════════════════════════════════════════════════════
class AppNotification {
  final String id;
  final String type; // 'high_risk' | 'ship_deadline'
  final String title;
  final String message;
  final String orderId;
  final String ebayOrderId;
  final DateTime createdAt;
  bool isRead;

  AppNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    required this.orderId,
    required this.ebayOrderId,
    required this.createdAt,
    this.isRead = false,
  });
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS SERVICE
// ═══════════════════════════════════════════════════════════════
class NotificationsService {
  static final _supabase = Supabase.instance.client;

  // Generate notifications from orders
  static Future<List<AppNotification>> getNotifications() async {
    final notifications = <AppNotification>[];

    try {
      final userId = _supabase.auth.currentUser?.id;
      if (userId == null) return [];

      final orders = await _supabase
          .from('protected_orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', ascending: false);

      for (var order in orders) {
        final riskLevel = order['risk_level'] as String? ?? 'LOW';
        final orderStatus = order['order_status'] as String? ?? 'pending';
        final checklistDone = order['checklist_completed'] as bool? ?? false;
        final createdAt = DateTime.tryParse(order['created_at'] ?? '') ?? DateTime.now();
        final ebayId = order['ebay_order_id'] ?? 'Unknown';
        final itemTitle = order['item_title'] ?? 'Unknown Item';
        final orderId = order['id'] as String;
        final daysSinceCreated = DateTime.now().difference(createdAt).inDays;

        // ─ HIGH RISK ALERT ─
        if (riskLevel == 'HIGH' && !checklistDone && orderStatus != 'shipped') {
          notifications.add(AppNotification(
            id: 'high_risk_$orderId',
            type: 'high_risk',
            title: '🚨 High-Risk Order Alert!',
            message: 'Order #$ebayId ($itemTitle) needs protection before shipping!',
            orderId: orderId,
            ebayOrderId: ebayId,
            createdAt: createdAt,
          ));
        }

        // ─ SHIP DEADLINE REMINDER ─
        // Alert if order is 2+ days old, not shipped, and checklist not complete
        if (daysSinceCreated >= 2 &&
            orderStatus != 'shipped' &&
            orderStatus != 'delivered' &&
            !checklistDone) {
          notifications.add(AppNotification(
            id: 'deadline_$orderId',
            type: 'ship_deadline',
            title: '⏰ Ship Deadline Reminder',
            message: 'Order #$ebayId is $daysSinceCreated days old and not shipped yet!',
            orderId: orderId,
            ebayOrderId: ebayId,
            createdAt: createdAt,
          ));
        }

        // ─ CHECKLIST INCOMPLETE BUT OLD ─
        if (daysSinceCreated >= 1 &&
            !checklistDone &&
            orderStatus != 'shipped' &&
            riskLevel == 'MEDIUM') {
          notifications.add(AppNotification(
            id: 'checklist_$orderId',
            type: 'ship_deadline',
            title: '📋 Checklist Incomplete',
            message: 'Medium-risk order #$ebayId still needs protection steps completed.',
            orderId: orderId,
            ebayOrderId: ebayId,
            createdAt: createdAt,
          ));
        }
      }

      // Sort: high_risk first, then by date
      notifications.sort((a, b) {
        if (a.type == 'high_risk' && b.type != 'high_risk') return -1;
        if (b.type == 'high_risk' && a.type != 'high_risk') return 1;
        return b.createdAt.compareTo(a.createdAt);
      });

    } catch (e) {
      // Return empty list on error
    }

    return notifications;
  }
}