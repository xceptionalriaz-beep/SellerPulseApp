import 'package:flutter/material.dart';

// ✨ IMPORT THE NEW TAB FILES
import 'tabs/overview_tab.dart';
import 'tabs/ebay_manager_tab.dart';
import 'tabs/billing_tab.dart';

class UserProfilePage extends StatefulWidget {
  const UserProfilePage({super.key});

  @override
  State<UserProfilePage> createState() => _UserProfilePageState();
}

class _UserProfilePageState extends State<UserProfilePage> {
  int _selectedSettingsTab = 0;

  @override
  Widget build(BuildContext context) {
    final bool isMobile = MediaQuery.of(context).size.width < 800;

    return Container(
      color: const Color(0xFFF4F7FA),
      child: isMobile ? _buildMobileLayout() : _buildDesktopLayout(),
    );
  }

  // --- DESKTOP LAYOUT ---
  Widget _buildDesktopLayout() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1. MENU
        Container(
          width: 260,
          margin: const EdgeInsets.only(left: 16, top: 16, bottom: 16),
          padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [BoxShadow(color: Colors.black.withAlpha(10), blurRadius: 15, offset: const Offset(0, 5))],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: _buildMenuItems(isMobile: false),
          ),
        ),
        const SizedBox(width: 24),
        
        // 2. CONTENT
        Expanded(
          // ✨ NEON GREEN SCROLLBAR THEME
          child: Theme(
            data: Theme.of(context).copyWith(
              scrollbarTheme: ScrollbarThemeData(
                thumbColor: WidgetStateProperty.all(const Color(0xFF8FFF00)), 
                thickness: WidgetStateProperty.all(6.0), 
                radius: const Radius.circular(10), 
              ),
            ),
            child: SingleChildScrollView(
              // ✨ INNER PADDING FOR BREATHING ROOM
              child: Padding(
                padding: const EdgeInsets.only(top: 16, right: 32, bottom: 24), 
                child: _buildTabContent(),
              ),
            ),
          ),
        )
      ],
    );
  }

  // --- MOBILE LAYOUT ---
  Widget _buildMobileLayout() {
    return Column(
      children: [
        // 1. MENU
        Container(
          height: 70, 
          margin: const EdgeInsets.only(top: 16, left: 16, right: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 10, offset: const Offset(0, 2))],
          ),
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            children: _buildMenuItems(isMobile: true),
          ),
        ),
        const SizedBox(height: 16),
        
        // 2. CONTENT
        Expanded(
          // ✨ NEON GREEN SCROLLBAR THEME (MOBILE)
          child: Theme(
            data: Theme.of(context).copyWith(
              scrollbarTheme: ScrollbarThemeData(
                thumbColor: WidgetStateProperty.all(const Color(0xFF8FFF00)), 
                thickness: WidgetStateProperty.all(6.0), 
                radius: const Radius.circular(10), 
              ),
            ),
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.only(left: 16, right: 16, bottom: 24),
                child: _buildTabContent(),
              ),
            ),
          ),
        )
      ],
    );
  }

  List<Widget> _buildMenuItems({required bool isMobile}) {
    return [
      if (!isMobile)
        const Padding(
          padding: EdgeInsets.only(left: 10, bottom: 20),
          child: Text("Settings", style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
        ),
      _buildNavTab(0, Icons.person_outline, "Overview", isMobile),
      _buildNavTab(1, Icons.public, "Marketplace", isMobile), 
      _buildNavTab(2, Icons.bookmark_outline, "Vault", isMobile), 
      _buildNavTab(3, Icons.credit_card, "Billing", isMobile), 
      _buildNavTab(4, Icons.security, "Security", isMobile),
    ];
  }

  Widget _buildNavTab(int index, IconData icon, String title, bool isMobile) {
    final bool isActive = _selectedSettingsTab == index;
    return InkWell(
      onTap: () => setState(() => _selectedSettingsTab = index),
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        margin: EdgeInsets.only(bottom: isMobile ? 0 : 8, right: isMobile ? 8 : 0),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF0F172A) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 20, color: isActive ? Colors.white : const Color(0xFF64748B)),
            const SizedBox(width: 8),
            Text(title, style: TextStyle(fontWeight: isActive ? FontWeight.bold : FontWeight.w600, color: isActive ? Colors.white : const Color(0xFF64748B), fontSize: 13)),
          ],
        ),
      ),
    );
  }

  // ✨ THE ROUTER
  Widget _buildTabContent() {
    switch (_selectedSettingsTab) {
      case 0: return const OverviewTab();
      case 1: return const EbayManagerTab();
      case 3: return const BillingTab();
      default: return const Center(child: Text("Coming Soon"));
    }
  }
}