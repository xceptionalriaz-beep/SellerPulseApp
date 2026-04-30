import 'package:flutter/material.dart';

class AdminControlsBar extends StatelessWidget {
  final List<Map<String, dynamic>> allUsers; 
  final Function(String) onSearch;
  final VoidCallback onAddUser; 
  final String selectedFilter; 
  final Function(String) onFilterChanged;
  final VoidCallback onRefresh; 

  const AdminControlsBar({
    super.key, 
    required this.allUsers, 
    required this.onSearch, 
    required this.onAddUser,
    required this.selectedFilter,
    required this.onFilterChanged,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    int supportCount = allUsers.where((user) {
      final note = user['dispute_note'];
      return note != null && note.toString().trim().isNotEmpty;
    }).length;

    int pastDueCount = allUsers.where((user) => user['account_status'] == 'Past Due').length;
    int expiredCount = allUsers.where((user) => user['account_status'] == 'Expired' && user['plan_name'] == 'Free Trial').length;

    final searchBox = Container(
      height: 48,
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
            child: const Text("Cmd+K", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
          )
        ],
      ),
    );

    List<Widget> filterChips = [
      _buildFilterChip("All", Icons.group), 
      _buildFilterChip("Active Tiers", Icons.filter_list),
      _buildFilterChip("Expired Trials", Icons.timer_off_outlined, badgeCount: expiredCount),
      _buildFilterChip("Past Due", Icons.warning_amber_rounded, isAlert: true, badgeCount: pastDueCount),
      _buildFilterChip("Support waiting", Icons.support_agent, badgeCount: supportCount),
    ];

    final refreshButton = Tooltip(
      message: "Sync with Database",
      child: InkWell(
        onTap: onRefresh,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: const Icon(Icons.refresh_rounded, size: 20, color: Color(0xFF64748B)),
        ),
      ),
    );

    final desktopAddUserBtn = ElevatedButton.icon(
      onPressed: onAddUser,
      icon: const Icon(Icons.add, size: 16, color: Color(0xFF0F172A)),
      label: const Text("Add New User", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF8FFF00), 
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14), 
        elevation: 0, 
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
      ),
    );

    final mobileAddUserBtn = Tooltip(
      message: "Add New User",
      child: InkWell(
        onTap: onAddUser,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: const Color(0xFF8FFF00),
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Icon(Icons.person_add_alt_1, size: 20, color: Color(0xFF0F172A)),
        ),
      ),
    );

    return LayoutBuilder(
      builder: (context, constraints) {
        final bool isDesktop = constraints.maxWidth > 1100;

        if (isDesktop) {
          // 🖥️ DESKTOP LAYOUT
          return Row(
            children: [
              SizedBox(width: 250, child: searchBox), 
              const SizedBox(width: 24),
              
              // ✨ FIX: We wrapped the tabs in an 'Expanded' widget and aligned them with 'spaceEvenly'. 
              // This pulls them apart and fills that awkward empty gap perfectly!
              Expanded(
                child: Wrap(
                  alignment: WrapAlignment.spaceEvenly,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: filterChips,
                ),
              ),
              
              const SizedBox(width: 24),
              desktopAddUserBtn, 
              const SizedBox(width: 12),
              refreshButton,
            ],
          );
        } else {
          // 📱 MOBILE LAYOUT
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Expanded(child: searchBox),
                  const SizedBox(width: 12),
                  mobileAddUserBtn, 
                  const SizedBox(width: 12),
                  refreshButton,
                ],
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: filterChips,
              ),
            ],
          );
        }
      },
    );
  }

  Widget _buildFilterChip(String label, IconData icon, {bool isAlert = false, int? badgeCount}) {
    final bool isActive = selectedFilter == label; 

    return InkWell(
      onTap: () => onFilterChanged(label), 
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF0F172A) : Colors.white, 
          borderRadius: BorderRadius.circular(12), 
          border: Border.all(color: isActive ? const Color(0xFF0F172A) : const Color(0xFFE2E8F0))
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: isActive ? const Color(0xFF8FFF00) : (isAlert ? Colors.orange : const Color(0xFF64748B))),
            const SizedBox(width: 6),
            Text(
              label, 
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isActive ? Colors.white : const Color(0xFF334155))
            ),
            if (badgeCount != null && badgeCount > 0) ...[
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: isActive ? const Color(0xFF8FFF00) : Colors.redAccent, 
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  badgeCount.toString(),
                  style: TextStyle(color: isActive ? const Color(0xFF0F172A) : Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}