// lib/pages/orders/notifications_panel.dart
//
// SellerPulse - Notifications Panel (Slide-in from right)
// Shows: High-risk alerts + Ship deadline reminders

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'notifications_service.dart';

// ═══════════════════════════════════════════════════════════════
// SHOW PANEL FUNCTION - Call this to open the panel
// ═══════════════════════════════════════════════════════════════
void showNotificationsPanel(BuildContext context) {
  showGeneralDialog(
    context: context,
    barrierDismissible: true,
    barrierLabel: 'Close',
    barrierColor: Colors.black45,
    transitionDuration: const Duration(milliseconds: 300),
    pageBuilder: (context, _, __) => Align(
      alignment: Alignment.centerRight,
      child: Material(
        color: Colors.transparent,
        child: Container(
          width: 400,
          height: MediaQuery.of(context).size.height,
          color: const Color(0xFFF8FAFC),
          child: const NotificationsPanel(),
        ),
      ),
    ),
    transitionBuilder: (context, animation, _, child) => SlideTransition(
      position: Tween<Offset>(
        begin: const Offset(1, 0),
        end: Offset.zero,
      ).animate(CurvedAnimation(
        parent: animation,
        curve: Curves.easeOutCubic,
      )),
      child: child,
    ),
  );
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS PANEL WIDGET
// ═══════════════════════════════════════════════════════════════
class NotificationsPanel extends StatefulWidget {
  const NotificationsPanel({super.key});

  @override
  State<NotificationsPanel> createState() => _NotificationsPanelState();
}

class _NotificationsPanelState extends State<NotificationsPanel> {
  List<AppNotification> _notifications = [];
  bool _isLoading = true;
  final Set<String> _readIds = {};

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() => _isLoading = true);
    final list = await NotificationsService.getNotifications();
    setState(() {
      _notifications = list;
      _isLoading = false;
    });
  }

  void _markAllRead() {
    setState(() {
      for (var n in _notifications) {
        _readIds.add(n.id);
      }
    });
  }

  int get _unreadCount =>
      _notifications.where((n) => !_readIds.contains(n.id)).length;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // ─ Header ─
        _buildHeader(),

        // ─ Body ─
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _notifications.isEmpty
                  ? _buildEmptyState()
                  : _buildNotificationsList(),
        ),
      ],
    );
  }

  // ─ Header ─
  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 12, 16),
      decoration: const BoxDecoration(
        color: Color(0xFFFFFFFF),
        border: Border(
          bottom: BorderSide(color: Color(0xFFE2E8F0)),
        ),
      ),
      child: Row(
        children: [
          // Bell icon with badge
          Stack(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: const Color(0xFF8FFF00),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.notifications,
                    size: 20, color: Color(0xFF131B2F)),
              ),
              if (_unreadCount > 0)
                Positioned(
                  right: 0,
                  top: 0,
                  child: Container(
                    width: 16,
                    height: 16,
                    decoration: const BoxDecoration(
                      color: Color(0xFFFF4D6A),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        _unreadCount > 9 ? '9+' : '$_unreadCount',
                        style: const TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Notifications',
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF131B2F),
                  ),
                ),
                Text(
                  '$_unreadCount unread',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: const Color(0xFF94A3B8),
                  ),
                ),
              ],
            ),
          ),
          // Mark all read button
          if (_unreadCount > 0)
            TextButton(
              onPressed: _markAllRead,
              child: Text(
                'Mark all read',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  color: const Color(0xFF8FFF00),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.close,
                size: 20, color: Color(0xFF94A3B8)),
          ),
        ],
      ),
    );
  }

  // ─ Notifications List ─
  Widget _buildNotificationsList() {
    final highRisk =
        _notifications.where((n) => n.type == 'high_risk').toList();
    final deadlines =
        _notifications.where((n) => n.type == 'ship_deadline').toList();

    return RefreshIndicator(
      onRefresh: _loadNotifications,
      color: const Color(0xFF8FFF00),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ─ High Risk Section ─
          if (highRisk.isNotEmpty) ...[
            _sectionHeader(
              '🚨 High-Risk Alerts',
              '${highRisk.length} order${highRisk.length > 1 ? 's' : ''} need attention',
              const Color(0xFFFF4D6A),
            ),
            const SizedBox(height: 8),
            ...highRisk.map((n) => _notificationCard(n)),
            const SizedBox(height: 16),
          ],

          // ─ Deadline Reminders Section ─
          if (deadlines.isNotEmpty) ...[
            _sectionHeader(
              '⏰ Deadline Reminders',
              '${deadlines.length} order${deadlines.length > 1 ? 's' : ''} pending action',
              const Color(0xFFFFB800),
            ),
            const SizedBox(height: 8),
            ...deadlines.map((n) => _notificationCard(n)),
          ],
        ],
      ),
    );
  }

  // ─ Section Header ─
  Widget _sectionHeader(String title, String subtitle, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 32,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF131B2F),
                  ),
                ),
                Text(
                  subtitle,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: const Color(0xFF64748B),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─ Notification Card ─
  Widget _notificationCard(AppNotification notification) {
    final isRead = _readIds.contains(notification.id);
    final isHighRisk = notification.type == 'high_risk';
    final color =
        isHighRisk ? const Color(0xFFFF4D6A) : const Color(0xFFFFB800);
    final bgColor = isHighRisk
        ? const Color(0xFFFFEEF1)
        : const Color(0xFFFFF8E1);

    return GestureDetector(
      onTap: () => setState(() => _readIds.add(notification.id)),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isRead ? const Color(0xFFFFFFFF) : bgColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isRead ? const Color(0xFFE2E8F0) : color.withOpacity(0.3),
            width: isRead ? 1 : 1.5,
          ),
          boxShadow: isRead
              ? []
              : [
                  BoxShadow(
                    color: color.withOpacity(0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: color.withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                isHighRisk
                    ? Icons.warning_rounded
                    : Icons.access_time_rounded,
                size: 18,
                color: color,
              ),
            ),
            const SizedBox(width: 12),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          notification.title,
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF131B2F),
                          ),
                        ),
                      ),
                      // Unread dot
                      if (!isRead)
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: color,
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    notification.message,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: const Color(0xFF64748B),
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Time + Order ID
                  Row(
                    children: [
                      Icon(Icons.access_time,
                          size: 11, color: const Color(0xFF94A3B8)),
                      const SizedBox(width: 4),
                      Text(
                        _timeAgo(notification.createdAt),
                        style: GoogleFonts.inter(
                          fontSize: 10,
                          color: const Color(0xFF94A3B8),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: color.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '#${notification.ebayOrderId.length > 12 ? notification.ebayOrderId.substring(0, 12) + '...' : notification.ebayOrderId}',
                          style: GoogleFonts.inter(
                            fontSize: 9,
                            fontWeight: FontWeight.w600,
                            color: color,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─ Empty State ─
  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: const Color(0xFFEEFFCC),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Icon(Icons.notifications_none,
                size: 40, color: Color(0xFF8FFF00)),
          ),
          const SizedBox(height: 20),
          Text(
            'All caught up! 🎉',
            style: GoogleFonts.spaceGrotesk(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF131B2F),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'No alerts or reminders right now.',
            style: GoogleFonts.inter(
              fontSize: 13,
              color: const Color(0xFF94A3B8),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Pull down to refresh',
            style: GoogleFonts.inter(
              fontSize: 12,
              color: const Color(0xFF94A3B8),
            ),
          ),
        ],
      ),
    );
  }

  String _timeAgo(DateTime dateTime) {
    final diff = DateTime.now().difference(dateTime);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${dateTime.day}/${dateTime.month}';
  }
}