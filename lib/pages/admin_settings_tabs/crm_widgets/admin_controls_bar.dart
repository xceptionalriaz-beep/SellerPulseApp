import 'package:flutter/material.dart';

class AdminControlsBar extends StatelessWidget {
  final Function(String) onSearch;
  final VoidCallback onAddUser;
  
  // ✨ NEW: The component now knows which filter is selected
  final String selectedFilter; 
  final Function(String) onFilterChanged; 

  const AdminControlsBar({
    super.key, 
    required this.onSearch, 
    required this.onAddUser,
    required this.selectedFilter,
    required this.onFilterChanged,
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

          // 🎭 FILTER CHIPS (Now Clickable & Dynamic!)
          _buildFilterChip("All", Icons.group), // ✨ Added an 'All' button to reset filters
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

  // ✨ UPGRADED: The filter chip handles taps and changes color if selected
  Widget _buildFilterChip(String label, IconData icon, {bool isAlert = false}) {
    final bool isActive = selectedFilter == label; // Checks if this button is the active one

    return Padding(
      padding: const EdgeInsets.only(right: 12),
      child: InkWell(
        onTap: () => onFilterChanged(label), // Tells the parent a new filter was clicked
        borderRadius: BorderRadius.circular(12),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            // ✨ Switches to Dark Slate when active
            color: isActive ? const Color(0xFF0F172A) : Colors.white, 
            borderRadius: BorderRadius.circular(12), 
            border: Border.all(color: isActive ? const Color(0xFF0F172A) : const Color(0xFFE2E8F0))
          ),
          child: Row(
            children: [
              // ✨ Switches to Neon Green when active
              Icon(icon, size: 16, color: isActive ? const Color(0xFF8FFF00) : (isAlert ? Colors.orange : const Color(0xFF64748B))),
              const SizedBox(width: 8),
              Text(
                label, 
                style: TextStyle(
                  fontSize: 12, 
                  fontWeight: FontWeight.bold, 
                  // ✨ Switches to White text when active
                  color: isActive ? Colors.white : const Color(0xFF334155)
                )
              ),
            ],
          ),
        ),
      ),
    );
  }
}