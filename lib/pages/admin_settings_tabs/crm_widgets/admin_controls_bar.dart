import 'package:flutter/material.dart';

class AdminControlsBar extends StatelessWidget {
  final Function(String) onSearch;
  final VoidCallback onAddUser;

  const AdminControlsBar({
    super.key, 
    required this.onSearch, 
    required this.onAddUser,
  });

  @override
  Widget build(BuildContext context) {
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

          // 🎭 FILTER CHIPS
          _buildFilterChip("Active Tiers", Icons.filter_list),
          _buildFilterChip("Expired Trials", Icons.timer_off_outlined),
          _buildFilterChip("Past Due", Icons.warning_amber_rounded, isAlert: true),
          _buildFilterChip("Support waiting", Icons.support_agent),

          const SizedBox(width: 16),

          // ➕ ADD NEW USER BUTTON (CEO Control)
          ElevatedButton.icon(
            onPressed: onAddUser,
            icon: const Icon(Icons.add, size: 16, color: Colors.white),
            label: const Text("Add New User", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0F172A), // Dark Slate
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18), 
              elevation: 0, 
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
            ),
          )
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, IconData icon, {bool isAlert = false}) {
    return Container(
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white, 
        borderRadius: BorderRadius.circular(12), 
        border: Border.all(color: const Color(0xFFE2E8F0))
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: isAlert ? Colors.orange : const Color(0xFF64748B)),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF334155))),
        ],
      ),
    );
  }
}