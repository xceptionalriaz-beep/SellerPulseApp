import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'landing_page.dart'; 
// ✨ Your new Master Dashboard import!
import 'product_research/product_research_master.dart';
import 'inventory_page.dart'; 
import 'profit_calculator.dart'; 
import 'admin_management_page.dart'; 
import 'title_builder/title_builder_main.dart'; 

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  
  int _selectedIndex = 0;

  final Color neonGreen = const Color(0xFF8FFF00);
  final Color deepNavy = const Color(0xFF131B2F);

  User? get user => Supabase.instance.client.auth.currentUser;
  bool get isOwner => user?.email == 'xceptionalriaz@gmail.com';

  String get _userInitial {
    final name = user?.userMetadata?['full_name']?.toString() ?? "";
    return name.isNotEmpty ? name.substring(0, 1).toUpperCase() : "S";
  }

  Future<void> _logout() async {
    await Supabase.instance.client.auth.signOut();
    if (mounted) {
      Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (context) => const PublicLandingPage()), (route) => false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isDesktop = MediaQuery.of(context).size.width > 900;

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: const Color(0xFFF8FAFC),
      drawer: !isDesktop ? _buildMobileDrawer() : null,

      body: Padding(
        padding: const EdgeInsets.all(10.0), 
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (isDesktop) _buildSlimRail(),

            Expanded(
              child: Stack( 
                children: [
                  Column(
                    children: [
                      if (!isDesktop) _buildMobileHeader(),
                      
                      Expanded(
                        child: Padding(
                          padding: EdgeInsets.only(left: isDesktop ? 15 : 0),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(24),
                            child: _buildCurrentScreen(),
                          ),
                        ),
                      ),
                    ],
                  ),
                  
                  // ✨ FLOATING ACTION CORNER (Desktop Only)
                  if (isDesktop)
                    Positioned(
                      top: 15,
                      right: 25,
                      child: Row(
                        children: [
                          _buildFloatingIcon(Icons.notifications_outlined, "Notifications"),
                          const SizedBox(width: 15),
                          CircleAvatar(
                            radius: 16,
                            backgroundColor: neonGreen, 
                            child: Text(_userInitial, style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13)),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFloatingIcon(IconData icon, String label) {
    return Tooltip(
      message: label,
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.white.withAlpha(200),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: const Color(0xFF64748B), size: 22),
      ),
    );
  }

  // --- MOBILE COMPONENTS ---

  Widget _buildMobileHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: const Icon(Icons.menu_rounded, color: Colors.black, size: 28),
            onPressed: () => _scaffoldKey.currentState?.openDrawer(),
          ),
          
          const Icon(Icons.shield, color: Color(0xFF8FFF00), size: 24),
          
          Row(
            children: [
              IconButton(
                onPressed: () {},
                icon: const Icon(Icons.notifications_outlined, color: Color(0xFF64748B), size: 22),
              ),
              CircleAvatar(
                radius: 14,
                backgroundColor: neonGreen,
                child: Text(_userInitial, style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 12)),
              ),
              const SizedBox(width: 5),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMobileDrawer() {
    return Drawer(
      backgroundColor: deepNavy,
      width: 250,
      child: Column(
        children: [
          const SizedBox(height: 50),
          const Icon(Icons.shield, color: Color(0xFF8FFF00), size: 40),
          const SizedBox(height: 30),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              children: [
                _drawerItem(Icons.dashboard_rounded, "Dashboard", 0),
                _drawerItem(Icons.search_rounded, "Product Research", 1),
                _drawerItem(Icons.text_fields_rounded, "Title Builder", 2),
                _drawerItem(Icons.calculate_rounded, "Profit Calculator", 3),
                _drawerItem(Icons.inventory_2_rounded, "Inventory", 4),
                const Divider(color: Colors.white10, height: 40),
                _drawerItem(Icons.settings_rounded, "Settings", 5),
                if (isOwner) _drawerItem(Icons.admin_panel_settings_rounded, "Admin Center", 6),
              ],
            ),
          ),
          ListTile(
            leading: const Icon(Icons.logout_rounded, color: Colors.white54),
            title: const Text("Log Out", style: TextStyle(color: Colors.white54, fontWeight: FontWeight.bold)),
            onTap: _logout,
          ),
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _drawerItem(IconData icon, String title, int index) {
    bool isActive = _selectedIndex == index;
    return ListTile(
      selected: isActive,
      selectedTileColor: neonGreen.withAlpha(20),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      leading: Icon(icon, color: isActive ? neonGreen : Colors.white54),
      title: Text(title, style: TextStyle(color: isActive ? Colors.white : Colors.white54, fontWeight: isActive ? FontWeight.bold : FontWeight.normal)),
      onTap: () {
        setState(() {
          _selectedIndex = index;
        });
        Navigator.pop(context);
      },
    );
  }

  // --- DESKTOP COMPONENTS ---
  Widget _buildSlimRail() {
    return Container(
      width: 60, 
      decoration: BoxDecoration(
        color: deepNavy, 
        borderRadius: BorderRadius.circular(30), 
        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 15, offset: Offset(4, 0))],
      ),
      child: Column(
        children: [
          const SizedBox(height: 30),
          const Icon(Icons.shield, color: Color(0xFF8FFF00), size: 24),
          const SizedBox(height: 35),
          _sidebarItem(icon: Icons.dashboard_rounded, title: "Dashboard", index: 0),
          _sidebarItem(icon: Icons.search_rounded, title: "Product Research", index: 1),
          _sidebarItem(icon: Icons.text_fields_rounded, title: "Title Builder", index: 2),
          _sidebarItem(icon: Icons.calculate_rounded, title: "Profit Calculator", index: 3),
          _sidebarItem(icon: Icons.inventory_2_rounded, title: "Inventory", index: 4),
          const Spacer(),
          _sidebarItem(icon: Icons.settings_rounded, title: "Settings", index: 5), 
          if (isOwner)
            _sidebarItem(icon: Icons.admin_panel_settings_rounded, title: "Admin Center", index: 6),
          const SizedBox(height: 10),
          IconButton(onPressed: _logout, icon: const Icon(Icons.logout_rounded, color: Colors.white54, size: 20)),
          const SizedBox(height: 25),
        ],
      ),
    );
  }

  Widget _sidebarItem({required IconData icon, required String title, required int index}) {
    final bool isActive = _selectedIndex == index;
    return Tooltip(
      message: title,
      child: InkWell(
        onTap: () => setState(() {
          _selectedIndex = index;
        }),
        hoverColor: Colors.transparent,
        child: SizedBox(
          height: 52, width: 60,
          child: Stack(
            alignment: Alignment.center,
            children: [
              if (isActive)
                Positioned(
                  left: 0,
                  child: Container(
                    width: 3, height: 24,
                    decoration: BoxDecoration(color: neonGreen, borderRadius: const BorderRadius.only(topRight: Radius.circular(10), bottomRight: Radius.circular(10)), boxShadow: [BoxShadow(color: neonGreen.withAlpha(200), blurRadius: 10)]),
                  ),
                ),
              TweenAnimationBuilder<double>(
                tween: Tween(begin: 0.8, end: isActive ? 1.0 : 0.8),
                duration: const Duration(milliseconds: 500),
                curve: Curves.elasticOut,
                builder: (context, scale, child) => Transform.scale(scale: isActive ? scale : 1.0, child: child),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  width: 38, height: 38,
                  decoration: BoxDecoration(shape: BoxShape.circle, color: isActive ? neonGreen.withAlpha(40) : Colors.transparent),
                  child: Icon(icon, color: isActive ? neonGreen : Colors.white54, size: isActive ? 22 : 20),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCurrentScreen() {
    switch (_selectedIndex) {
      case 0: return _buildDashboardHome();
      // ✨ Case 1 seamlessly routes to your new Master Dashboard!
      case 1: return const ProductResearchMaster(); 
      case 2: return const TitleBuilderMain();
      case 3: return const ProfitCalculatorPage();
      case 4: return const InventoryPage();
      case 5: return const Center(child: Text("User Settings", style: TextStyle(fontSize: 20, color: Colors.grey)));
      case 6: return isOwner ? const AdminManagementPage() : const Center(child: Text("404", style: TextStyle(color: Colors.grey)));
      default: return const SizedBox.shrink();
    }
  }

  Widget _buildDashboardHome() {
    final String rawName = user?.userMetadata?['full_name']?.toString() ?? "";
    final String displayName = rawName.isNotEmpty ? rawName : "Seller";
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20), 
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Welcome back, $displayName! 👋", style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
          const SizedBox(height: 40),
          Wrap(
            spacing: 20, runSpacing: 20,
            children: [
              _buildStatCard("Total Revenue", "\$12,450.00", "+14.5%", Icons.attach_money),
              _buildStatCard("Active Listings", "842", "+12", Icons.inventory_2_outlined),
              _buildStatCard("Net Profit", "\$4,120.50", "+8.2%", Icons.trending_up, isHighlight: true),
              _buildStatCard("Pending Orders", "18", "Needs shipping", Icons.local_shipping_outlined),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, String subtitle, IconData icon, {bool isHighlight = false}) {
    return Container(
      width: 250, padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: isHighlight ? neonGreen : Colors.white, borderRadius: BorderRadius.circular(24), boxShadow: isHighlight ? [BoxShadow(color: neonGreen.withAlpha(77), blurRadius: 20, offset: const Offset(0, 10))] : []),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start, 
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: TextStyle(color: isHighlight ? Colors.black87 : const Color(0xFF64748B), fontWeight: FontWeight.w600)),
              Icon(icon, color: isHighlight ? Colors.black : const Color(0xFF64748B), size: 20),
            ],
          ),
          const SizedBox(height: 15),
          Text(value, style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: isHighlight ? Colors.black : const Color(0xFF1E293B))),
          const SizedBox(height: 5),
          Text(subtitle, style: TextStyle(fontSize: 13, color: isHighlight ? Colors.black54 : Colors.green.shade600, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}