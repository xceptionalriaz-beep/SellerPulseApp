import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; 
import 'dart:math';
import '../../../services/crm_service.dart';
import 'user_detail_drawer.dart'; 

class AdminUserTable extends StatefulWidget {
  final List<Map<String, dynamic>> allUsers; 
  final bool isInvestorMode;
  final String searchQuery;
  final String selectedFilter; 
  final Function(String, String, dynamic) onUserUpdated; 

  const AdminUserTable({
    super.key, 
    required this.allUsers,
    required this.isInvestorMode,
    required this.searchQuery,
    required this.selectedFilter, 
    required this.onUserUpdated,
  });

  @override
  State<AdminUserTable> createState() => _AdminUserTableState();
}

class _AdminUserTableState extends State<AdminUserTable> {

  Future<void> _showSupportNoteDialog(BuildContext context, String userId, String userName) async {
    final TextEditingController noteController = TextEditingController();
    bool isSubmitting = false;

    await showDialog(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: Text("Flag $userName for Support", style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Enter the specific issue or reason:", style: TextStyle(fontSize: 13, color: Color(0xFF64748B))),
                  const SizedBox(height: 12),
                  TextField(
                    controller: noteController,
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText: "e.g., eBay sync failing, requested refund...",
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.grey.shade300)),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF0F172A))),
                    ),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(dialogContext),
                  child: const Text("Cancel", style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                ),
                ElevatedButton(
                  onPressed: isSubmitting ? null : () async {
                    if (noteController.text.trim().isEmpty) return;
                    
                    setDialogState(() => isSubmitting = true);
                    
                    widget.onUserUpdated(userId, 'dispute_note', noteController.text.trim());

                    try {
                      await CrmService.updateSupportNote(userId, noteController.text.trim());
                      if (context.mounted) {
                        Navigator.pop(dialogContext);
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Support flag added!"), backgroundColor: Color(0xFF0F172A)));
                      }
                    } catch (e) {
                      setDialogState(() => isSubmitting = false);
                      widget.onUserUpdated(userId, 'dispute_note', null);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e"), backgroundColor: Colors.redAccent));
                      }
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F172A),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: isSubmitting 
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text("Save Note", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ],
            );
          }
        );
      }
    );
  }

  // ✨ NEW: The Device Manager Popup Dialog
  Future<void> _showDeviceManagerDialog(BuildContext context, String userId, String userName) async {
    showDialog(
      context: context,
      builder: (dialogContext) {
        return Dialog(
          backgroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Container(
            width: 500,
            padding: const EdgeInsets.all(24),
            child: FutureBuilder<List<Map<String, dynamic>>>(
              future: CrmService.fetchUserDevices(userId),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const SizedBox(height: 200, child: Center(child: CircularProgressIndicator(color: Color(0xFF0F172A))));
                }
                
                final devices = snapshot.data ?? [];

                return Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text("Active Devices: $userName", style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                            const Text("Manage active sessions and revoke access.", style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                          ],
                        ),
                        IconButton(onPressed: () => Navigator.pop(dialogContext), icon: const Icon(Icons.close, color: Colors.grey)),
                      ],
                    ),
                    const SizedBox(height: 20),
                    if (devices.isEmpty)
                       const Padding(padding: EdgeInsets.all(20), child: Center(child: Text("No active devices found.")))
                    else
                      ...devices.map((device) => Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: device['is_current'] == true ? const Color(0xFFF8FAFC) : Colors.white,
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                          borderRadius: BorderRadius.circular(12)
                        ),
                        child: Row(
                          children: [
                            Icon(device['platform'].toString().contains('iOS') || device['platform'].toString().contains('Android') ? Icons.phone_iphone : Icons.computer, color: const Color(0xFF64748B)),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text("${device['platform']} • ${device['browser']}", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A))),
                                      if (device['is_current'] == true) ...[
                                        const SizedBox(width: 8),
                                        Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: const Color(0xFF8FFF00).withAlpha(50), borderRadius: BorderRadius.circular(4)), child: const Text("Current", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)))),
                                      ]
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text("IP: ${device['ip_address']} • Last Active: ${device['last_active']}", style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                                ],
                              ),
                            ),
                            if (device['is_current'] != true)
                              OutlinedButton(
                                onPressed: () async {
                                  try {
                                    await CrmService.removeUserDevice(userId, device['device_id']);
                                    if (context.mounted) {
                                      Navigator.pop(dialogContext);
                                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Device session revoked."), backgroundColor: Colors.green));
                                    }
                                  } catch (e) {
                                    if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Failed to remove: $e"), backgroundColor: Colors.redAccent));
                                  }
                                },
                                style: OutlinedButton.styleFrom(foregroundColor: Colors.redAccent, side: const BorderSide(color: Colors.redAccent)),
                                child: const Text("Revoke", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              )
                          ],
                        ),
                      )).toList(),
                  ],
                );
              }
            ),
          ),
        );
      }
    );
  }

  @override
  Widget build(BuildContext context) {
    List<Map<String, dynamic>> liveUsers = widget.allUsers;
    
    if (widget.searchQuery.isNotEmpty) {
      final query = widget.searchQuery.toLowerCase();
      liveUsers = liveUsers.where((user) {
        final name = (user['name'] ?? '').toString().toLowerCase();
        final email = (user['email'] ?? '').toString().toLowerCase();
        return name.contains(query) || email.contains(query);
      }).toList();
    }

    if (widget.selectedFilter != 'All') {
      liveUsers = liveUsers.where((user) {
        final plan = user['plan_name'] ?? 'Free Trial';
        final status = user['account_status'] ?? 'Active';
        final dispute = user['dispute_note'];

        if (widget.selectedFilter == 'Active Tiers') {
          return status == 'Active' && plan != 'Free Trial';
        } else if (widget.selectedFilter == 'Expired Trials') {
          return status == 'Expired' && plan == 'Free Trial';
        } else if (widget.selectedFilter == 'Past Due') {
          return status == 'Past Due';
        } else if (widget.selectedFilter == 'Support waiting') {
          return dispute != null && dispute.toString().trim().isNotEmpty;
        }
        
        return true; 
      }).toList();
    }

    return Container(
      width: double.infinity,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))]
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final bool isDesktop = constraints.maxWidth > 1100;
          
          if (!isDesktop) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildMobileHeader(),
                const Divider(height: 1, color: Color(0xFFE2E8F0)),
                if (liveUsers.isEmpty)
                  _buildEmptyState()
                else
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    children: liveUsers.map((dbUser) {
                      final formattedUser = _formatDatabaseUser(dbUser);
                      return _buildMobileCard(formattedUser, dbUser);
                    }).toList(),
                  ),
              ],
            );
          }

          final double tableWidth = max(1050.0, constraints.maxWidth);
          
          return SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            child: SizedBox(
              width: tableWidth, 
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildTableHeader(),
                  const Divider(height: 1, color: Color(0xFFE2E8F0)),
                  
                  if (liveUsers.isEmpty)
                    _buildEmptyState()
                  else
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      children: liveUsers.map((dbUser) {
                        final formattedUser = _formatDatabaseUser(dbUser);
                        return Column(
                          children: [
                            _buildDataRow(formattedUser, dbUser), 
                            const Divider(height: 1, color: Color(0xFFF1F5F9)),
                          ],
                        );
                      }).toList(),
                    ),
                ],
              ),
            ),
          );
        }
      ),
    );
  }

  // -------------------------------------------------------------------------
  // ✨ UNIVERSAL ACTION BUTTONS (Works on Mobile AND Desktop)
  // -------------------------------------------------------------------------
  Widget _buildActionButtons(Map<String, dynamic> user, Map<String, dynamic> rawUser) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        OutlinedButton(
          onPressed: () {
            UserDetailDrawer.show(context, rawUser, widget.onUserUpdated);
          },
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 12), 
            side: const BorderSide(color: Color(0xFFE2E8F0)), 
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))
          ),
          child: const Text("Detailed Profile", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        ),
        const SizedBox(width: 8),
        
        PopupMenuButton<String>(
          icon: const Icon(Icons.more_vert, size: 20, color: Color(0xFF94A3B8)),
          color: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          onSelected: (value) async {
            final String userId = user['id']; 
            
            if (value.startsWith('change_plan_')) {
                final String newPlan = value.replaceFirst('change_plan_', '');
                
                widget.onUserUpdated(userId, 'plan_name', newPlan);
                widget.onUserUpdated(userId, 'account_status', 'Active'); 
                try {
                  await CrmService.updateUserPlan(userId, newPlan);
                  await CrmService.updateUserStatus(userId, 'Active');
                  if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Switched to $newPlan!"), backgroundColor: Colors.green));
                } catch (e) {
                  widget.onUserUpdated(userId, 'plan_name', user['plan']);
                  if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Failed to change plan: $e"), backgroundColor: Colors.redAccent));
                }
            } else if (value == 'manage_devices') {
                // ✨ TRIGGER NEW DEVICE MANAGER DIALOG
                _showDeviceManagerDialog(context, userId, user['name']);
            } else if (value == 'suspend') {
                widget.onUserUpdated(userId, 'account_status', 'Past Due');
                try {
                  await CrmService.updateUserStatus(userId, 'Past Due');
                  if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("User Suspended!"), backgroundColor: Colors.orange));
                } catch (e) {
                  widget.onUserUpdated(userId, 'account_status', 'Active');
                  if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Failed to suspend: $e"), backgroundColor: Colors.redAccent));
                }
            } else if (value == 'reactivate') { 
                widget.onUserUpdated(userId, 'account_status', 'Active');
                try {
                  await CrmService.updateUserStatus(userId, 'Active');
                  if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("User Reactivated!"), backgroundColor: Colors.green));
                } catch (e) {
                  widget.onUserUpdated(userId, 'account_status', 'Past Due');
                  if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Failed to reactivate: $e"), backgroundColor: Colors.redAccent));
                }
            } else if (value == 'expire_trial') {
                widget.onUserUpdated(userId, 'account_status', 'Expired');
                try {
                  await CrmService.updateUserStatus(userId, 'Expired');
                  if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Trial marked as Expired!"), backgroundColor: Colors.redAccent));
                } catch (e) {
                  widget.onUserUpdated(userId, 'account_status', 'Active');
                  if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Failed to expire: $e"), backgroundColor: Colors.redAccent));
                }
            } else if (value == 'flag_support') {
                _showSupportNoteDialog(context, userId, user['name']);
            } else if (value == 'resolve_support') {
                widget.onUserUpdated(userId, 'dispute_note', null);
                try {
                  await CrmService.updateSupportNote(userId, null);
                  if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Issue resolved!"), backgroundColor: Color(0xFF16A34A)));
                } catch (e) {
                  if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Failed to resolve: $e"), backgroundColor: Colors.redAccent));
                }
            }
          },
          itemBuilder: (context) {
            final List<String> availablePlans = ['Free Trial', 'Pro Plan', 'Elite Plan'];
            
            return [
              ...availablePlans.where((plan) => plan != user['plan']).map((plan) => 
                PopupMenuItem(
                  value: 'change_plan_$plan', 
                  child: Text("Switch to $plan", style: const TextStyle(fontWeight: FontWeight.w600))
                )
              ),

              const PopupMenuDivider(),

              // ✨ NEW DEVICE OPTION
              const PopupMenuItem(value: 'manage_devices', child: Text("Manage Devices", style: TextStyle(fontWeight: FontWeight.w600))),
              
              const PopupMenuDivider(),

              if (user['plan'] == 'Free Trial' && user['status'] != 'Expired')
                const PopupMenuItem(value: 'expire_trial', child: Text("Force Expire Trial", style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.w600))),

              if (user['dispute'] == null || user['dispute'].toString().trim().isEmpty)
                const PopupMenuItem(value: 'flag_support', child: Text("Flag for Support", style: TextStyle(color: Colors.orange, fontWeight: FontWeight.w600)))
              else
                const PopupMenuItem(value: 'resolve_support', child: Text("Resolve Support Issue", style: TextStyle(color: Colors.green, fontWeight: FontWeight.w600))),
                
              if (user['status'] == 'Expired' && user['plan'] == 'Free Trial')
                const PopupMenuItem(value: 'reactivate', child: Text("Extend Trial", style: TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.w600)))
              else if (user['status'] == 'Past Due' || user['status'] == 'Expired')
                const PopupMenuItem(value: 'reactivate', child: Text("Reactivate User", style: TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.w600)))
              else
                const PopupMenuItem(value: 'suspend', child: Text("Suspend User", style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.w600))),
            ];
          },
        ),
      ],
    );
  }

  // -------------------------------------------------------------------------
  // 📱 MOBILE CARD LAYOUT (Always Visible Data)
  // -------------------------------------------------------------------------
  Widget _buildMobileHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Text("USERS LIST", style: _headerStyle()),
    );
  }

  Widget _buildMobileCard(Map<String, dynamic> user, Map<String, dynamic> rawUser) {
    Color statusColor = Colors.green;
    Color statusBg = Colors.green.withAlpha(20);
    if (user['status'] == 'Expired') { statusColor = Colors.red; statusBg = Colors.red.withAlpha(20); }
    if (user['status'] == 'Past Due') { statusColor = Colors.orange; statusBg = Colors.orange.withAlpha(20); }

    String displayName = widget.isInvestorMode ? "${user['name'].split(' ')[0]} ***" : user['name'];
    String displayEmail = widget.isInvestorMode ? "${user['email'][0]}***@${user['email'].split('@')[1]}" : user['email'];
    bool hasAvatar = user['avatarUrl'] != null && user['avatarUrl'].toString().isNotEmpty;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [BoxShadow(color: Color(0x04000000), blurRadius: 10, offset: Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(width: 16, height: 16, decoration: BoxDecoration(border: Border.all(color: const Color(0xFFCBD5E1)), borderRadius: BorderRadius.circular(4))),
              const SizedBox(width: 12),
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
                    Text(displayEmail, style: const TextStyle(color: Color(0xFF64748B), fontSize: 11), overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          Row(
            children: [
              Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(6)), child: Text(user['plan'], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF334155)))),
              const SizedBox(width: 8),
              Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: statusBg, borderRadius: BorderRadius.circular(6)), child: Text(user['status'], style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: statusColor))),
            ],
          ),
          
          const Padding(padding: EdgeInsets.symmetric(vertical: 16), child: Divider(height: 1, color: Color(0xFFF1F5F9))),
          
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("JOIN DATE", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8))),
                    const SizedBox(height: 4),
                    Text(user['joinDate'], style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF0F172A), fontSize: 12)),
                    Text(user['time'], style: const TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("ACCOUNT ID", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8))),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Text(user['shortId'], style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w600, color: Color(0xFF334155), fontSize: 12)),
                        const SizedBox(width: 6),
                        InkWell(
                          onTap: () {
                            Clipboard.setData(ClipboardData(text: user['id']));
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("ID Copied to clipboard"), duration: Duration(seconds: 1)));
                          },
                          child: const Icon(Icons.copy, size: 14, color: Color(0xFF94A3B8)),
                        )
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("PLATFORM & LOGIN", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8))),
                    const SizedBox(height: 4),
                    Text("${user['platform']} • ${user['browser']}", style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF0F172A), fontSize: 12), overflow: TextOverflow.ellipsis),
                    Text(user['ip'], style: const TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("DEVICES", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8))),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(6), border: Border.all(color: const Color(0xFFE2E8F0))),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.devices, size: 12, color: Color(0xFF64748B)),
                          const SizedBox(width: 4),
                          Text(user['deviceCount'], style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF334155), fontSize: 12)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          const Padding(padding: EdgeInsets.symmetric(vertical: 16), child: Divider(height: 1, color: Color(0xFFF1F5F9))),
          
          _buildActionButtons(user, rawUser),
        ],
      ),
    );
  }

  // -------------------------------------------------------------------------
  // 🖥️ DATA FORMATTING
  // -------------------------------------------------------------------------
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

    String? finalAvatarUrl = dbData['avatar_url'];
    if (finalAvatarUrl == null || finalAvatarUrl.trim().isEmpty) {
       finalAvatarUrl = dbData['avatarUrl'];
    }
    String? gender = dbData['gender'];

    if (finalAvatarUrl == null || finalAvatarUrl.trim().isEmpty) {
      if (gender == 'Male' || gender == 'male') {
        finalAvatarUrl = "https://cdn-icons-png.flaticon.com/512/4140/4140048.png"; 
      } else if (gender == 'Female' || gender == 'female') {
        finalAvatarUrl = "https://cdn-icons-png.flaticon.com/512/4140/4140047.png"; 
      }
    }

    final String fullId = dbData['id']?.toString() ?? "Unknown";
    final String shortId = dbData['display_id']?.toString() ?? "Generating..."; 

    final String platform = dbData['device_platform'] ?? "Unknown";
    final String browser = dbData['browser_agent'] ?? "Browser";
    final String ip = dbData['last_login_ip'] ?? "No IP Logged";
    final String deviceCount = platform == 'Unknown' ? "0" : "1";

    double usageVal = 0.5;
    if (dbData['usage_score'] != null) {
      usageVal = (dbData['usage_score'] as num).toDouble();
    }

    return {
      "id": fullId, 
      "shortId": shortId, 
      "name": name,
      "initials": getInitials(name), 
      "email": email,
      "plan": dbData['plan_name'] ?? "Free Trial", 
      "status": dbData['account_status'] ?? "Active", 
      "joinDate": joinDate,
      "time": time,
      "usage": usageVal, 
      "dispute": dbData['dispute_note'], 
      "avatarUrl": finalAvatarUrl, 
      "platform": platform,
      "browser": browser,
      "ip": ip,
      "deviceCount": deviceCount,
    };
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
          Expanded(flex: 2, child: Text("ACCOUNT ID", style: _headerStyle())),
          Expanded(flex: 2, child: Text("PLATFORM & LOGIN", style: _headerStyle())),
          Expanded(flex: 1, child: Text("DEVICES", style: _headerStyle())),
          Expanded(flex: 2, child: Align(alignment: Alignment.centerRight, child: Text("ACTION", style: _headerStyle()))),
        ],
      ),
    );
  }

  TextStyle _headerStyle() => const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8), letterSpacing: 1);

  Widget _buildEmptyState() {
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.group_off_outlined, size: 40, color: Color(0xFF94A3B8)),
            const SizedBox(height: 16),
            Text(
              "No users match '${widget.selectedFilter}'", 
              style: const TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold)
            ),
          ],
        )
      )
    );
  }

  Widget _buildDataRow(Map<String, dynamic> user, Map<String, dynamic> rawUser) {
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
                      Text(displayEmail, style: const TextStyle(color: Color(0xFF64748B), fontSize: 11), overflow: TextOverflow.ellipsis),
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
            child: Row(
              children: [
                Text(user['shortId'], style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w600, color: Color(0xFF334155), fontSize: 12)),
                const SizedBox(width: 6),
                InkWell(
                  onTap: () {
                    Clipboard.setData(ClipboardData(text: user['id']));
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("ID Copied to clipboard"), duration: Duration(seconds: 1)));
                  },
                  child: const Icon(Icons.copy, size: 14, color: Color(0xFF94A3B8)),
                )
              ],
            ),
          ),
          Expanded(
            flex: 2,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("${user['platform']} • ${user['browser']}", style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF0F172A), fontSize: 12), overflow: TextOverflow.ellipsis),
                Text(user['ip'], style: const TextStyle(color: Color(0xFF64748B), fontSize: 11)),
              ],
            ),
          ),
          Expanded(
            flex: 1,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(6), border: Border.all(color: const Color(0xFFE2E8F0))),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.devices, size: 12, color: Color(0xFF64748B)),
                  const SizedBox(width: 4),
                  Text(user['deviceCount'], style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF334155), fontSize: 12)),
                ],
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: _buildActionButtons(user, rawUser),
          ),
        ],
      ),
    );
  }
}