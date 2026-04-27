import 'package:flutter/material.dart';
import 'dart:math';
import '../../../services/crm_service.dart'; 

class AdminUserTable extends StatefulWidget {
  final bool isInvestorMode;
  final String searchQuery;

  const AdminUserTable({
    super.key, 
    required this.isInvestorMode,
    required this.searchQuery,
  });

  @override
  State<AdminUserTable> createState() => _AdminUserTableState();
}

class _AdminUserTableState extends State<AdminUserTable> {

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))]
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        child: SizedBox(
          width: 1050,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildTableHeader(),
              const Divider(height: 1, color: Color(0xFFE2E8F0)),
              
              StreamBuilder<List<Map<String, dynamic>>>(
                stream: CrmService.getAdminUserStream(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Padding(
                      padding: EdgeInsets.all(40.0),
                      child: Center(child: CircularProgressIndicator(color: Color(0xFF0F172A))),
                    );
                  }

                  if (snapshot.hasError) {
                    return Padding(
                      padding: const EdgeInsets.all(40.0),
                      child: Center(child: Text("Error: ${snapshot.error}", style: const TextStyle(color: Colors.red))),
                    );
                  }

                  if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return _buildEmptyState();
                  }

                  List<Map<String, dynamic>> liveUsers = snapshot.data!;
                  
                  if (widget.searchQuery.isNotEmpty) {
                    final query = widget.searchQuery.toLowerCase();
                    liveUsers = liveUsers.where((user) {
                      final name = (user['name'] ?? '').toString().toLowerCase();
                      final email = (user['email'] ?? '').toString().toLowerCase();
                      return name.contains(query) || email.contains(query);
                    }).toList();
                  }

                  if (liveUsers.isEmpty) {
                    return const Padding(
                      padding: EdgeInsets.all(40),
                      child: Center(child: Text("No users match your search.", style: TextStyle(color: Colors.grey, fontWeight: FontWeight.w500))),
                    );
                  }

                  return Column(
                    mainAxisSize: MainAxisSize.min,
                    children: liveUsers.map((dbUser) {
                      final formattedUser = _formatDatabaseUser(dbUser);
                      
                      return Column(
                        children: [
                          _buildDataRow(formattedUser),
                          const Divider(height: 1, color: Color(0xFFF1F5F9)),
                        ],
                      );
                    }).toList(),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Map<String, dynamic> _formatDatabaseUser(Map<String, dynamic> dbData) {
    final String email = dbData['email'] ?? "unknown@user.com";
    
    String name = dbData['name'] ?? "";
    if (name.isEmpty) {
      name = email.split('@')[0];
    }

    String joinDate = "Today";
    String time = "Just Now";
    if (dbData['created_at'] != null) {
      try {
        final dt = DateTime.parse(dbData['created_at']).toLocal();
        final months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        joinDate = "${months[dt.month - 1]} ${dt.day}, ${dt.year}";
        
        int hour = dt.hour;
        String ampm = hour >= 12 ? "PM" : "AM";
        hour = hour > 12 ? hour - 12 : (hour == 0 ? 12 : hour);
        String minute = dt.minute.toString().padLeft(2, '0');
        time = "$hour:$minute $ampm";
      } catch (e) {
        debugPrint("Date parse error: $e");
      }
    }

    String getInitials(String n) {
      if (n.trim().isEmpty) return "S";
      List<String> parts = n.trim().split(RegExp(r'\s+'));
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      } else {
        return n.length >= 2 ? n.substring(0, 2).toUpperCase() : n.toUpperCase();
      }
    }

    // ✨ THE NEW "AUTO-AVATAR" LOGIC
    String? finalAvatarUrl = dbData['avatar_url'];
    String? gender = dbData['gender'];

    // If they haven't uploaded a custom photo, check their gender!
    if (finalAvatarUrl == null || finalAvatarUrl.trim().isEmpty) {
      if (gender == 'Male') {
        finalAvatarUrl = "https://cdn-icons-png.flaticon.com/512/4140/4140048.png"; // Default Male
      } else if (gender == 'Female') {
        finalAvatarUrl = "https://cdn-icons-png.flaticon.com/512/4140/4140047.png"; // Default Female
      }
    }

    return {
      "name": name,
      "initials": getInitials(name), 
      "email": email,
      "plan": dbData['plan_name'] ?? "Free Trial", 
      "status": dbData['account_status'] ?? "Active", 
      "joinDate": joinDate,
      "time": time,
      "usage": dbData['usage_score'] ?? 0.5, 
      "dispute": dbData['dispute_note'], 
      "avatarUrl": finalAvatarUrl, // ✨ Pass the smart URL here
    };
  }

  Widget _buildEmptyState() {
    return const Padding(
      padding: EdgeInsets.all(40),
      child: Center(
        child: Text(
          "Waiting for your first superstar user...", 
          style: TextStyle(color: Colors.grey, fontSize: 14, fontWeight: FontWeight.w500)
        )
      ),
    );
  }

  Widget _buildTableHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        children: [
          const SizedBox(width: 32),
          Expanded(flex: 3, child: Text("USER", style: _headerStyle())),
          Expanded(flex: 2, child: Text("PLAN / STATUS", style: _headerStyle())),
          Expanded(flex: 2, child: Text("JOIN DATE", style: _headerStyle())),
          Expanded(flex: 2, child: Text("ACTIVITY", style: _headerStyle())),
          Expanded(flex: 2, child: Text("DISPUTE", style: _headerStyle())),
          Expanded(flex: 2, child: Align(alignment: Alignment.centerRight, child: Text("ACTION", style: _headerStyle()))),
        ],
      ),
    );
  }

  TextStyle _headerStyle() => const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8), letterSpacing: 1);

  Widget _buildDataRow(Map<String, dynamic> user) {
    Color statusColor = Colors.green;
    Color statusBg = Colors.green.withAlpha(20);
    if (user['status'] == 'Expired') { statusColor = Colors.red; statusBg = Colors.red.withAlpha(20); }
    if (user['status'] == 'Past Due') { statusColor = Colors.orange; statusBg = Colors.orange.withAlpha(20); }

    String displayName = widget.isInvestorMode ? "${user['name'].split(' ')[0]} ***" : user['name'];
    String displayEmail = widget.isInvestorMode ? "${user['email'][0]}***@${user['email'].split('@')[1]}" : user['email'];

    bool hasAvatar = user['avatarUrl'] != null && user['avatarUrl'].toString().isNotEmpty;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        children: [
          Container(width: 16, height: 16, decoration: BoxDecoration(border: Border.all(color: const Color(0xFFCBD5E1)), borderRadius: BorderRadius.circular(4))),
          const SizedBox(width: 16),
          Expanded(
            flex: 3,
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: hasAvatar ? Colors.transparent : const Color(0xFF8FFF00), 
                  radius: 18, 
                  backgroundImage: hasAvatar ? NetworkImage(user['avatarUrl']) : null,
                  child: !hasAvatar 
                      ? Text(user['initials'], style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.w800, fontSize: 13, letterSpacing: 0.5))
                      : null,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(displayName, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A), fontSize: 13)),
                      Text(displayEmail, style: const TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            flex: 2,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(6)), child: Text(user['plan'], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF334155)))),
                    const SizedBox(width: 8),
                    Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: statusBg, borderRadius: BorderRadius.circular(6)), child: Text(user['status'], style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: statusColor))),
                  ],
                ),
                const SizedBox(height: 8),
                Container(
                  width: 100,
                  height: 4,
                  decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(2)),
                  child: FractionallySizedBox(alignment: Alignment.centerLeft, widthFactor: user['usage'], child: Container(decoration: BoxDecoration(color: statusColor, borderRadius: BorderRadius.circular(2)))),
                )
              ],
            ),
          ),
          Expanded(
            flex: 2,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(user['joinDate'], style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF0F172A), fontSize: 12)),
                Text(user['time'], style: const TextStyle(color: Color(0xFF64748B), fontSize: 11)),
              ],
            ),
          ),
          Expanded(
            flex: 2,
            child: _buildFakeSparkline(statusColor),
          ),
          Expanded(
            flex: 2,
            child: user['dispute'] != null 
              ? Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                  decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(6)),
                  child: Text(user['dispute'], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.redAccent)),
                )
              : const SizedBox(),
          ),
          Expanded(
            flex: 2,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton(
                  onPressed: () {},
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 12), side: const BorderSide(color: Color(0xFFE2E8F0)), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                  child: const Text("Detailed Profile", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                ),
                const SizedBox(width: 8),
                const Icon(Icons.more_vert, size: 20, color: Color(0xFF94A3B8)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFakeSparkline(Color color) {
    final random = Random();
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: List.generate(15, (index) {
        double height = 5 + random.nextInt(25).toDouble();
        return Container(
          margin: const EdgeInsets.only(right: 2),
          width: 3, height: height,
          decoration: BoxDecoration(color: color.withAlpha(100 + random.nextInt(155)), borderRadius: BorderRadius.circular(2)),
        );
      }),
    );
  }
}