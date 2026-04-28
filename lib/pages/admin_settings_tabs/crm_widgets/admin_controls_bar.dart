import 'package:flutter/material.dart';

class AdminControlsBar extends StatelessWidget {
  final List<Map<String, dynamic>> allUsers; // ✨ Accepts the memory bank from the Boss!
  final Function(String) onSearch;
  final VoidCallback onAddUser;
  final String selectedFilter; 
  final Function(String) onFilterChanged;
  final VoidCallback onRefresh; 

  const AdminControlsBar({
    super.key, 
    required this.allUsers, // ✨ Required parameter
    required this.onSearch, 
    required this.onAddUser,
    required this.selectedFilter,
    required this.onFilterChanged,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    // ✨ INSTANT COUNTING: No loading, no streams. Just fast local math.
    int supportCount = allUsers.where((user) {
      final note = user['dispute_note'];
      return note != null && note.toString().trim().isNotEmpty;
    }).length;

    int pastDueCount = allUsers.where((user) => user['account_status'] == 'Past Due').length;

    int expiredCount = allUsers.where((user) => user['account_status'] == 'Expired' && user['plan_name'] == 'Free Trial').length;

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Row(
        children: [
          // 🔍 SEARCH BOX
          Container(
            width: 250,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.white, 
              borderRadius: BorderRadius.circular(12), 
              border: Border.all(color: const Color(0xFFE2E8F0))
            ),
            child: Row(
              children: [
                const Icon(Icons.search, size: 18, color: Color(0xFF94A3B8)),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    onChanged: onSearch,
                    decoration: const InputDecoration(
                      hintText: "Search users...", 
                      border: InputBorder.none, 
                      isDense: true, 
                      contentPadding: EdgeInsets.symmetric(vertical: 12)
                    ),
                    style: const TextStyle(fontSize: 13),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9), 
                    borderRadius: BorderRadius.circular(4)
                  ),
                  child: const Text(
                    "Cmd+K", 
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF64748B))
                  ),
                )
              ],
            ),
          ),
          
          const SizedBox(width: 16),

          // 🎭 FILTER CHIPS (Powered by local memory)
          _buildFilterChip("All", Icons.group), 
          _buildFilterChip("Active Tiers", Icons.filter_list),
          _buildFilterChip("Expired Trials", Icons.timer_off_outlined, badgeCount: expiredCount),
          _buildFilterChip("Past Due", Icons.warning_amber_rounded, isAlert: true, badgeCount: pastDueCount),
          _buildFilterChip("Support waiting", Icons.support_agent, badgeCount: supportCount),

          const SizedBox(width: 16),

          // ✨ THE REFRESH BUTTON
          Tooltip(
            message: "Sync with Database",
            child: InkWell(
              onTap: onRefresh,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: const Icon(Icons.refresh_rounded, size: 20, color: Color(0xFF64748B)),
              ),
            ),
          ),
          
          const SizedBox(width: 12),

          // ➕ ADD NEW USER BUTTON
          ElevatedButton.icon(
            onPressed: onAddUser,
            icon: const Icon(Icons.add, size: 16, color: Colors.white),
            label: const Text("Add New User", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0F172A), 
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18), 
              elevation: 0, 
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
            ),
          )
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, IconData icon, {bool isAlert = false, int? badgeCount}) {
    final bool isActive = selectedFilter == label; 

    return Padding(
      padding: const EdgeInsets.only(right: 12),
      child: InkWell(
        onTap: () => onFilterChanged(label), 
        borderRadius: BorderRadius.circular(12),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: isActive ? const Color(0xFF0F172A) : Colors.white, 
            borderRadius: BorderRadius.circular(12), 
            border: Border.all(color: isActive ? const Color(0xFF0F172A) : const Color(0xFFE2E8F0))
          ),
          child: Row(
            children: [
              Icon(icon, size: 16, color: isActive ? const Color(0xFF8FFF00) : (isAlert ? Colors.orange : const Color(0xFF64748B))),
              const SizedBox(width: 8),
              Text(
                label, 
                style: TextStyle(
                  fontSize: 12, 
                  fontWeight: FontWeight.bold, 
                  color: isActive ? Colors.white : const Color(0xFF334155)
                )
              ),
              if (badgeCount != null && badgeCount > 0) ...[
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: isActive ? const Color(0xFF8FFF00) : Colors.redAccent, 
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    badgeCount.toString(),
                    style: TextStyle(
                      color: isActive ? const Color(0xFF0F172A) : Colors.white, 
                      fontSize: 10, 
                      fontWeight: FontWeight.bold
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}