import 'package:flutter/material.dart';
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

  /// ✨ Helper method to trigger the beautiful slide-in animation
  static void show(BuildContext context, Map<String, dynamic> user, Function(String, String, dynamic) onUserUpdated) {
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: "Close",
      barrierColor: Colors.black.withOpacity(0.3), // Darken background
      transitionDuration: const Duration(milliseconds: 300),
      pageBuilder: (context, animation, secondaryAnimation) {
        return UserDetailDrawer(user: user, onUserUpdated: onUserUpdated);
      },
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        return BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 4 * animation.value, sigmaY: 4 * animation.value), // Glassmorphism Blur
          child: SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(1.0, 0.0), // Slide from the right
              end: Offset.zero,
            ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic)),
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

  @override
  void initState() {
    super.initState();
    // Pre-fill existing note if they have one
    _noteController.text = widget.user['dispute']?.toString() ?? '';
  }

  // 🛡️ Data extraction helpers (No Dummy Data!)
  String _safeString(dynamic value, {String fallback = ''}) => value?.toString().trim() ?? fallback;
  
  double _calculateMRR(String plan) {
    final cleanPlan = plan.toLowerCase();
    if (cleanPlan.contains('elite')) return 99.00;
    if (cleanPlan.contains('pro')) return 49.00;
    return 0.00; // Free Trial
  }

  @override
  Widget build(BuildContext context) {
    final user = widget.user;
    final String name = _safeString(user['name'], fallback: 'Unknown User');
    final String email = _safeString(user['email'], fallback: 'No Email Provided');
    final String plan = _safeString(user['plan'], fallback: 'Free Trial');
    final String status = _safeString(user['status'], fallback: 'Active');
    final double usage = user['usage'] is double ? user['usage'] : 0.0;
    final String joinDate = _safeString(user['joinDate'], fallback: 'Unknown');
    final String avatarUrl = _safeString(user['avatarUrl']);
    final String initials = _safeString(user['initials'], fallback: 'U');
    
    final double mrr = _calculateMRR(plan);
    final bool hasAvatar = avatarUrl.isNotEmpty;

    return Align(
      alignment: Alignment.centerRight,
      child: Material(
        elevation: 24,
        borderRadius: const BorderRadius.horizontal(left: Radius.circular(24)),
        child: Container(
          width: 420, // Perfect SaaS Sidebar Width
          height: double.infinity,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.horizontal(left: Radius.circular(24)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ❌ Close Button Row
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
                      // 👤 1. HERO IDENTITY SECTION
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
                            
                            // Status Badges
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                _buildBadge(plan, const Color(0xFFF1F5F9), const Color(0xFF334155)),
                                const SizedBox(width: 8),
                                _buildBadge(
                                  status, 
                                  status == 'Active' ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1), 
                                  status == 'Active' ? Colors.green : Colors.redAccent,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      
                      const SizedBox(height: 32),
                      const Divider(color: Color(0xFFF1F5F9)),
                      const SizedBox(height: 24),

                      // 📊 2. METRICS GRID
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
                      
                      // ⚡ 3. USAGE BAR (Neon Green)
                      const Text("PLAN USAGE", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2, color: Color(0xFF94A3B8))),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text("${(usage * 100).toInt()}% Used", style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                                Text(plan, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                              ],
                            ),
                            const SizedBox(height: 12),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(6),
                              child: LinearProgressIndicator(
                                value: usage,
                                minHeight: 8,
                                backgroundColor: const Color(0xFFE2E8F0),
                                color: const Color(0xFF8FFF00), // ✨ Neon Green Signature
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 32),

                      // 📝 4. ADMIN SUPPORT NOTES
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
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF8FFF00), width: 2)), // Neon Green Focus
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

  Widget _buildBadge(String text, Color bgColor, Color textColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(20)),
      child: Text(text, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: textColor)),
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

  // 💾 Save Logic
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