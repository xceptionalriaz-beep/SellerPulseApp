import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; 
import 'dart:ui';
import '../../../services/crm_service.dart';

class UserDetailDrawer extends StatefulWidget {
  final Map<String, dynamic> user;
  final Function(String, String, dynamic) onUserUpdated;

  const UserDetailDrawer({
    super.key,
    required this.user,
    required this.onUserUpdated,
  });

  static void show(BuildContext context, Map<String, dynamic> user, Function(String, String, dynamic) onUserUpdated) {
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: "Close",
      barrierColor: Colors.black.withOpacity(0.3),
      transitionDuration: const Duration(milliseconds: 300),
      pageBuilder: (context, animation, secondaryAnimation) {
        return UserDetailDrawer(user: user, onUserUpdated: onUserUpdated);
      },
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        return BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 4 * animation.value, sigmaY: 4 * animation.value),
          child: SlideTransition(
            position: Tween<Offset>(begin: const Offset(1.0, 0.0), end: Offset.zero)
                .animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic)),
            child: child,
          ),
        );
      },
    );
  }

  @override
  State<UserDetailDrawer> createState() => _UserDetailDrawerState();
}

class _UserDetailDrawerState extends State<UserDetailDrawer> {
  final TextEditingController _noteController = TextEditingController();
  
  bool _isSavingNote = false;
  bool _isResettingPass = false;
  bool _isLoggingOut = false;
  
  bool _isLoadingStores = true;
  bool _isLoadingDevices = true; // ✨ NEW: Device Loading State
  
  List<Map<String, dynamic>> _connectedStores = [];
  List<Map<String, dynamic>> _activeDevices = []; // ✨ NEW: Active Devices List
  
  late String _currentPlan;
  late String _currentStatus;

  @override
  void initState() {
    super.initState();
    _noteController.text = widget.user['dispute_note']?.toString() ?? '';
    _currentPlan = _safeString(widget.user['plan_name'], fallback: 'Free Trial');
    _currentStatus = _safeString(widget.user['account_status'], fallback: 'Active');
    _fetchUserData();
  }

  Future<void> _fetchUserData() async {
    try {
      // ✨ Fetches BOTH stores and devices simultaneously!
      final stores = await CrmService.getConnectedStores(widget.user['id']);
      final devices = await CrmService.fetchUserDevices(widget.user['id']);
      
      if (mounted) {
        setState(() {
          _connectedStores = stores;
          _isLoadingStores = false;
          _activeDevices = devices;
          _isLoadingDevices = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingStores = false;
          _isLoadingDevices = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Could not load data: $e"), backgroundColor: Colors.redAccent));
      }
    }
  }

  // ✨ BULLETPROOF STRING EXTRACTOR
  String _safeString(dynamic value, {String fallback = ''}) {
    if (value == null) return fallback;
    String str = value.toString().trim();
    if (str.toLowerCase() == 'null' || str.isEmpty) return fallback;
    return str;
  }
  
  // ✨ DOUBLE INITIALS EXTRACTOR
  String _getInitials(String name) {
    String cleanName = name.trim();
    if (cleanName.isEmpty) return 'U'; 
    
    List<String> parts = cleanName.split(RegExp(r'\s+'));
    if (parts.length == 1) {
      return parts[0][0].toUpperCase();
    }
    return (parts.first[0] + parts.last[0]).toUpperCase();
  }
  
  String _monthName(int month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  }

  double _calculateMRR(String plan) {
    final cleanPlan = plan.toLowerCase();
    if (cleanPlan.contains('elite')) return 99.00;
    if (cleanPlan.contains('pro')) return 49.00;
    return 0.00; 
  }

  @override
  Widget build(BuildContext context) {
    final user = widget.user;
    final String name = _safeString(user['name'], fallback: 'Unknown User');
    final String email = _safeString(user['email'], fallback: 'No Email Provided');
    
    // 🎨 ULTIMATE AVATAR RESOLVER
    String avatarUrl = _safeString(user['avatar_url']);
    if (avatarUrl.isEmpty) avatarUrl = _safeString(user['avatarUrl']); 
    
    String gender = _safeString(user['gender']).toLowerCase();
    if (gender.isEmpty) gender = _safeString(user['Gender']).toLowerCase();

    if (avatarUrl.isEmpty) {
      if (gender == 'male') {
        avatarUrl = "https://cdn-icons-png.flaticon.com/512/4140/4140048.png";
      } else if (gender == 'female') {
        avatarUrl = "https://cdn-icons-png.flaticon.com/512/4140/4140047.png";
      }
    }

    final bool hasAvatar = avatarUrl.isNotEmpty;
    final String initials = _getInitials(name); 
    
    // 📅 ULTIMATE DATE RESOLVER
    String rawDate = _safeString(user['created_at']);
    if (rawDate.isEmpty) rawDate = _safeString(user['createdAt']); 
    
    String joinDate = 'Unknown';
    if (rawDate.isNotEmpty) {
      try {
        DateTime dt = DateTime.parse(rawDate);
        joinDate = "${_monthName(dt.month)} ${dt.day}, ${dt.year}";
      } catch (e) {
        joinDate = rawDate.split('T')[0];
      }
    }

    // 📡 DYNAMIC SYSTEM METADATA EXTRACTOR
    final String shortId = _safeString(user['display_id'], fallback: 'Generating...'); // ✨ NEW: Short ID
    final String fullId = _safeString(user['id'], fallback: 'Unknown');
    final String lastLoginIp = _safeString(user['last_login_ip'], fallback: 'Unknown IP');
    final String devicePlatform = _safeString(user['device_platform'], fallback: 'Unknown Device');
    final String browserAgent = _safeString(user['browser_agent'], fallback: 'Unknown Browser');
    final String platformDisplay = (devicePlatform == 'Unknown Device' && browserAgent == 'Unknown Browser') 
        ? 'No data recorded' 
        : "$devicePlatform • $browserAgent";
    
    final double mrr = _calculateMRR(_currentPlan);
    
    int maxStores = _currentPlan.toLowerCase().contains('elite') ? 5 : (_currentPlan.toLowerCase().contains('pro') ? 2 : 1);
    int currentStores = _connectedStores.length;
    double usage = maxStores > 0 ? currentStores / maxStores : 0.0;
    
    bool isOverLimit = usage > 1.0;
    Color progressBarColor = isOverLimit ? Colors.redAccent : const Color(0xFF8FFF00);
    double displayUsage = isOverLimit ? 1.0 : usage; 

    return Align(
      alignment: Alignment.centerRight,
      child: Material(
        elevation: 24,
        borderRadius: const BorderRadius.horizontal(left: Radius.circular(24)),
        child: Container(
          width: 420, 
          height: double.infinity,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.horizontal(left: Radius.circular(24)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: IconButton(
                  icon: const Icon(Icons.close, color: Color(0xFF64748B)),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ),

              Expanded(
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 32.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 👤 HERO
                      Center(
                        child: Column(
                          children: [
                            CircleAvatar(
                              radius: 48,
                              backgroundColor: hasAvatar ? Colors.transparent : const Color(0xFF8FFF00),
                              backgroundImage: hasAvatar ? NetworkImage(avatarUrl) : null,
                              child: !hasAvatar 
                                ? Text(initials, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))) 
                                : null,
                            ),
                            const SizedBox(height: 16),
                            Text(name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                            const SizedBox(height: 4),
                            Text(email, style: const TextStyle(fontSize: 14, color: Color(0xFF64748B))),
                            const SizedBox(height: 16),
                            
                            // ✨ REAZIFY CUSTOM DROPDOWNS
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                // Custom Plan Dropdown
                                PopupMenuButton<String>(
                                  tooltip: "Change Plan",
                                  color: Colors.white,
                                  elevation: 12,
                                  shadowColor: const Color(0x2A000000), 
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                  offset: const Offset(0, 44), 
                                  child: _buildBadge(_currentPlan, const Color(0xFFF1F5F9), const Color(0xFF0F172A), hasIcon: true),
                                  onSelected: (newPlan) async {
                                    try {
                                      await CrmService.updateUserPlan(user['id'], newPlan);
                                      widget.onUserUpdated(user['id'], 'plan_name', newPlan);
                                      setState(() => _currentPlan = newPlan);
                                      if(mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Upgraded to $newPlan!"), backgroundColor: const Color(0xFF8FFF00)));
                                    } catch(e) {
                                      if(mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e"), backgroundColor: Colors.redAccent));
                                    }
                                  },
                                  itemBuilder: (context) => [
                                    _buildNeonMenuItem('Free Trial', _currentPlan),
                                    _buildNeonMenuItem('Pro Plan', _currentPlan),
                                    _buildNeonMenuItem('Elite Plan', _currentPlan),
                                  ],
                                ),
                                const SizedBox(width: 8),
                                
                                // Custom Status Dropdown
                                PopupMenuButton<String>(
                                  tooltip: "Change Status",
                                  color: Colors.white,
                                  elevation: 12,
                                  shadowColor: const Color(0x2A000000),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                  offset: const Offset(0, 44),
                                  child: _buildBadge(
                                    _currentStatus, 
                                    _currentStatus == 'Active' ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1), 
                                    _currentStatus == 'Active' ? Colors.green : Colors.redAccent,
                                    hasIcon: true,
                                  ),
                                  onSelected: (newStatus) async {
                                    try {
                                      await CrmService.updateUserStatus(user['id'], newStatus);
                                      widget.onUserUpdated(user['id'], 'account_status', newStatus);
                                      setState(() => _currentStatus = newStatus);
                                      if(mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Status changed to $newStatus!"), backgroundColor: Colors.green));
                                    } catch(e) {
                                      if(mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Failed: $e"), backgroundColor: Colors.redAccent));
                                    }
                                  },
                                  itemBuilder: (context) => [
                                    _buildNeonMenuItem('Active', _currentStatus, label: "Set to Active"),
                                    _buildNeonMenuItem('Past Due', _currentStatus, label: "Set to Past Due"),
                                    _buildNeonMenuItem('Expired', _currentStatus, label: "Set to Expired"),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      
                      const SizedBox(height: 24),
                      
                      // ⚡ QUICK ACTIONS
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _buildQuickAction(Icons.email_outlined, "Email", false, () {
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Launching Email Client...")));
                          }),
                          const SizedBox(width: 16),
                          _buildQuickAction(Icons.lock_reset_outlined, "Reset Pass", _isResettingPass, () async {
                              setState(() => _isResettingPass = true);
                              try {
                                await CrmService.sendPasswordReset(email);
                                if(mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Password reset link sent!"), backgroundColor: Colors.green));
                              } catch (e) {
                                if(mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e"), backgroundColor: Colors.redAccent));
                              } finally {
                                if(mounted) setState(() => _isResettingPass = false);
                              }
                          }),
                          const SizedBox(width: 16),
                          _buildQuickAction(Icons.logout_outlined, "Force Logout", _isLoggingOut, () async {
                              setState(() => _isLoggingOut = true);
                              try {
                                await CrmService.forceLogoutUser(user['id']);
                                if(mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("User sessions terminated."), backgroundColor: Colors.orange));
                              } catch (e) {
                                if(mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e"), backgroundColor: Colors.redAccent));
                              } finally {
                                if(mounted) setState(() => _isLoggingOut = false);
                              }
                          }, isDanger: true),
                        ],
                      ),

                      const SizedBox(height: 32),
                      const Divider(color: Color(0xFFF1F5F9)),
                      const SizedBox(height: 24),

                      // 📊 METRICS
                      const Text("ACCOUNT METRICS", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2, color: Color(0xFF94A3B8))),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(child: _buildMetricCard("Monthly Value", "\$${mrr.toStringAsFixed(0)}", Icons.payments_outlined)),
                          const SizedBox(width: 12),
                          Expanded(child: _buildMetricCard("Member Since", joinDate, Icons.calendar_today_outlined)),
                        ],
                      ),
                      
                      const SizedBox(height: 24),
                      
                      // ⚡ DETAILED USAGE
                      const Text("PLAN USAGE", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2, color: Color(0xFF94A3B8))),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isOverLimit ? Colors.redAccent.withOpacity(0.02) : const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: isOverLimit ? Colors.redAccent.withOpacity(0.4) : const Color(0xFFE2E8F0)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Text("${(usage * 100).toInt()}% Used", style: TextStyle(fontWeight: FontWeight.bold, color: isOverLimit ? Colors.redAccent : const Color(0xFF0F172A))),
                                    if (isOverLimit) ...[
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(color: Colors.redAccent.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                                        child: const Text("⚠️ Over Limit", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.redAccent)),
                                      )
                                    ]
                                  ],
                                ),
                                Text(_currentPlan, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                              ],
                            ),
                            const SizedBox(height: 12),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(6),
                              child: LinearProgressIndicator(
                                value: displayUsage,
                                minHeight: 8,
                                backgroundColor: const Color(0xFFE2E8F0),
                                color: progressBarColor, 
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text("$currentStores / $maxStores Stores Connected", style: TextStyle(fontSize: 11, fontWeight: isOverLimit ? FontWeight.bold : FontWeight.normal, color: isOverLimit ? Colors.redAccent : const Color(0xFF64748B))),
                          ],
                        ),
                      ),

                      const SizedBox(height: 32),
                      
                      // 🛒 LIVE STORES
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text("CONNECTED STORES", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2, color: Color(0xFF94A3B8))),
                          if (!_isLoadingStores)
                            Text("$currentStores Active", style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.green)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      
                      if (_isLoadingStores)
                        const Center(child: Padding(padding: EdgeInsets.all(16.0), child: CircularProgressIndicator(color: Color(0xFF0F172A))))
                      else if (_connectedStores.isNotEmpty)
                        ..._connectedStores.map((store) => _buildStoreItem(store['name'], "Last synced: ${store['last_sync']}")).toList()
                      else
                        Container(
                           padding: const EdgeInsets.all(16),
                           decoration: BoxDecoration(border: Border.all(color: const Color(0xFFE2E8F0)), borderRadius: BorderRadius.circular(12)),
                           child: const Center(child: Text("No stores connected yet", style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13))),
                        ),

                      const SizedBox(height: 32),
                      const Divider(color: Color(0xFFF1F5F9)),
                      const SizedBox(height: 24),

                      // 📱 ✨ NEW: ACTIVE DEVICES SECTION
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text("ACTIVE DEVICES", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2, color: Color(0xFF94A3B8))),
                          if (!_isLoadingDevices)
                            Text("${_activeDevices.length} Online", style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.green)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      
                      if (_isLoadingDevices)
                        const Center(child: Padding(padding: EdgeInsets.all(16.0), child: CircularProgressIndicator(color: Color(0xFF0F172A))))
                      else if (_activeDevices.isNotEmpty)
                        ..._activeDevices.map((device) => _buildDeviceItem(device)).toList()
                      else
                        Container(
                           padding: const EdgeInsets.all(16),
                           decoration: BoxDecoration(border: Border.all(color: const Color(0xFFE2E8F0)), borderRadius: BorderRadius.circular(12)),
                           child: const Center(child: Text("No active sessions recorded", style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13))),
                        ),

                      const SizedBox(height: 32),
                      const Divider(color: Color(0xFFF1F5F9)),
                      const SizedBox(height: 24),

                      // 📝 ADMIN SUPPORT NOTES
                      const Text("ADMIN SUPPORT NOTES", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2, color: Color(0xFF94A3B8))),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _noteController,
                        maxLines: 4,
                        decoration: InputDecoration(
                          hintText: "Add a private note about this user...",
                          filled: true,
                          fillColor: const Color(0xFFF8FAFC),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade300)),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF8FFF00), width: 2)), 
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isSavingNote ? null : _saveAdminNote,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0F172A),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: _isSavingNote 
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                            : const Text("Save Note", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        ),
                      ),
                      
                      const SizedBox(height: 32),
                      const Divider(color: Color(0xFFF1F5F9)),
                      const SizedBox(height: 24),

                      // 🔐 ✨ UPDATED: SYSTEM METADATA
                      const Text("SYSTEM METADATA", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2, color: Color(0xFF94A3B8))),
                      const SizedBox(height: 16),
                      _buildSystemRow("Display ID", shortId, copyable: true), // Short ID
                      const SizedBox(height: 12),
                      _buildSystemRow("Account UUID", fullId, copyable: true), // Secret Database ID
                      const SizedBox(height: 12),
                      _buildSystemRow("Last Login IP", lastLoginIp), 
                      const SizedBox(height: 12),
                      _buildSystemRow("Platform", platformDisplay),
                      
                      const SizedBox(height: 32),
                      const Divider(color: Color(0xFFF1F5F9)),
                      const SizedBox(height: 24),
                      
                      // 🚨 DANGER ZONE
                      const Text("DANGER ZONE", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.redAccent, letterSpacing: 1.2)),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          onPressed: () => _showDeleteConfirmation(context, name, fullId),
                          icon: const Icon(Icons.delete_forever_outlined, size: 16),
                          label: const Text("Delete User Account"),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.redAccent,
                            side: BorderSide(color: Colors.redAccent.withOpacity(0.3)),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // --- UI Helpers & Logic ---
  
  // ✨ NEW: Device Item Builder
  Widget _buildDeviceItem(Map<String, dynamic> device) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: device['is_current'] == true ? const Color(0xFFF8FAFC) : Colors.white,
        border: Border.all(color: const Color(0xFFE2E8F0)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(device['platform'].toString().contains('iOS') || device['platform'].toString().contains('Android') ? Icons.phone_iphone : Icons.computer, color: const Color(0xFF94A3B8), size: 18),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text("${device['platform']} • ${device['browser']}", style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                    if (device['is_current'] == true) ...[
                      const SizedBox(width: 8),
                      Container(padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2), decoration: BoxDecoration(color: const Color(0xFF8FFF00).withOpacity(0.3), borderRadius: BorderRadius.circular(4)), child: const Text("Current", style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)))),
                    ]
                  ],
                ),
                Text("IP: ${device['ip_address']} • Active: ${device['last_active']}", style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
              ],
            ),
          ),
          if (device['is_current'] != true)
            InkWell(
              onTap: () async {
                try {
                  await CrmService.removeUserDevice(widget.user['id'], device['device_id']);
                  setState(() { _activeDevices.removeWhere((d) => d['device_id'] == device['device_id']); });
                  if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Session revoked."), backgroundColor: Colors.green));
                } catch (e) {
                  if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Failed: $e"), backgroundColor: Colors.redAccent));
                }
              },
              child: const Text("Revoke", style: TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.bold)),
            )
        ],
      ),
    );
  }

  PopupMenuItem<String> _buildNeonMenuItem(String value, String currentValue, {String? label}) {
    final bool isSelected = value == currentValue;
    return PopupMenuItem<String>(
      value: value,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), 
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF8FFF00) : Colors.transparent, 
          borderRadius: BorderRadius.circular(10), 
        ),
        child: Text(
          label ?? value, 
          style: TextStyle(
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w600, 
            color: const Color(0xFF0F172A), 
            fontSize: 13
          ),
        ),
      ),
    );
  }

  void _showDeleteConfirmation(BuildContext context, String userName, String userId) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text("Delete User?", style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
        content: Text("Are you absolutely sure you want to permanently delete $userName? This action cannot be undone and will erase all connected data."),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Cancel", style: TextStyle(color: Color(0xFF64748B)))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            onPressed: () async {
              Navigator.pop(ctx); 
              try {
                 await CrmService.deleteUser(userId);
                 widget.onUserUpdated(userId, 'deleted', true); 
                 if(mounted) {
                    Navigator.pop(context); 
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("$userName deleted successfully"), backgroundColor: Colors.redAccent));
                 }
              } catch(e) {
                 if(mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e"), backgroundColor: Colors.redAccent));
              }
            },
            child: const Text("Delete Forever", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          )
        ]
      )
    );
  }

  Widget _buildSystemRow(String label, String value, {bool copyable = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
        Row(
          children: [
            SizedBox(
              width: 150,
              child: Text(
                value, 
                textAlign: TextAlign.right,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            if (copyable) ...[
              const SizedBox(width: 8),
              InkWell(
                onTap: () {
                  Clipboard.setData(ClipboardData(text: value));
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Copied to clipboard"), duration: Duration(seconds: 1)));
                },
                child: const Icon(Icons.copy_rounded, size: 14, color: Color(0xFF94A3B8)),
              )
            ]
          ],
        ),
      ],
    );
  }

  Widget _buildQuickAction(IconData icon, String label, bool isLoading, VoidCallback onTap, {bool isDanger = false}) {
    return InkWell(
      onTap: isLoading ? null : onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          border: Border.all(color: isDanger ? Colors.red.withOpacity(0.3) : const Color(0xFFE2E8F0)),
          borderRadius: BorderRadius.circular(8),
          color: isDanger ? Colors.red.withOpacity(0.05) : Colors.white,
        ),
        child: isLoading 
          ? SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: isDanger ? Colors.redAccent : const Color(0xFF0F172A)))
          : Row(
              children: [
                Icon(icon, size: 14, color: isDanger ? Colors.redAccent : const Color(0xFF64748B)),
                const SizedBox(width: 6),
                Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isDanger ? Colors.redAccent : const Color(0xFF334155))),
              ],
            ),
      ),
    );
  }

  Widget _buildBadge(String text, Color bgColor, Color textColor, {bool hasIcon = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(20)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(text, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: textColor)),
          if (hasIcon) ...[
            const SizedBox(width: 4),
            Icon(Icons.keyboard_arrow_down, size: 14, color: textColor),
          ]
        ],
      ),
    );
  }

  Widget _buildMetricCard(String title, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: const Color(0xFF94A3B8), size: 20),
          const SizedBox(height: 12),
          Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
          const SizedBox(height: 4),
          Text(title, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
        ],
      ),
    );
  }

  Widget _buildStoreItem(String storeName, String syncStatus) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFE2E8F0)),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          const Icon(Icons.storefront_outlined, color: Color(0xFF94A3B8), size: 18),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(storeName, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                Text(syncStatus, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(4),
            decoration: const BoxDecoration(color: Color(0xFF8FFF00), shape: BoxShape.circle),
            child: const Icon(Icons.check, size: 10, color: Color(0xFF0F172A)),
          )
        ],
      ),
    );
  }

  Future<void> _saveAdminNote() async {
    setState(() => _isSavingNote = true);
    final String userId = widget.user['id'];
    final String note = _noteController.text.trim();

    try {
      await CrmService.updateSupportNote(userId, note.isEmpty ? null : note);
      widget.onUserUpdated(userId, 'dispute_note', note.isEmpty ? null : note);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Profile updated successfully!"), backgroundColor: Color(0xFF8FFF00), behavior: SnackBarBehavior.floating),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error: $e"), backgroundColor: Colors.redAccent, behavior: SnackBarBehavior.floating),
        );
      }
    } finally {
      if (mounted) setState(() => _isSavingNote = false);
    }
  }
}