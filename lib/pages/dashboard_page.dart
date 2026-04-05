import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// Your original files
import 'landing_page.dart'; 
import 'product_research/deep_dive/deep_dive_screen.dart';
import 'product_research/launchpad/launchpad_screen.dart';
import 'product_research/keyword_search/keyword_search_screen.dart';
import 'inventory_page.dart'; 
import 'profit_calculator.dart'; 
import 'admin_management_page.dart'; 

// ✨ THE NEW TITLE BUILDER ✨
import 'title_builder/title_builder_main.dart'; 

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  int _selectedIndex = 0;
  
  // ✨ YOUR ORIGINAL SMART ROUTER VARIABLES ✨
  int _researchState = 0; // 0 = Launchpad, 1 = Deep Dive, 2 = List View
  String _currentQuery = ""; 

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

  // ✨ YOUR ORIGINAL TRAFFIC COP FUNCTION ✨
  void _runSmartSearch(String query) {
    setState(() {
      _currentQuery = query;
      // If the user typed an ebay URL...
      if (query.toLowerCase().contains("ebay.com")) {
        _researchState = 1; // Send to Deep Dive!
      } else {
        _researchState = 2; // Send to List View!
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final bool isDesktop = MediaQuery.of(context).size.width > 900;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Row(
        children: [
          if (isDesktop) _buildSidebar(),

          Expanded(
            child: Column(
              children: [
                _buildTopBar(isDesktop),
                
                Expanded(
                  child: _selectedIndex == 0 
                      ? _buildDashboardHome() 
                      : _selectedIndex == 1
                          ? _buildProductResearchArea() // ✨ YOUR ORIGINAL RESEARCH ROUTER
                          : _selectedIndex == 2 
                              ? const TitleBuilderMain() // ✨ THE NEW TITLE BUILDER
                              : _selectedIndex == 3
                                  ? const ProfitCalculatorPage() 
                                  : _selectedIndex == 4
                                      ? const InventoryPage() 
                                      : _selectedIndex == 5 
                                          ? const Center(child: Text("User Settings (Coming Soon)", style: TextStyle(fontSize: 20, color: Colors.grey)))
                                          : _selectedIndex == 6 && isOwner 
                                              ? const AdminManagementPage() 
                                              : const Center(child: Text("404 - Not Found", style: TextStyle(fontSize: 20, color: Colors.grey))),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

// ✨ YOUR DECISION ENGINE FOR PRODUCT RESEARCH ✨
  Widget _buildProductResearchArea() {
    if (_researchState == 1) {
      // ✨ UPGRADED: Pass the URL to the Deep Dive!
      return ProductDeepDivePage(productUrl: _currentQuery); 
    } else if (_researchState == 2) {
      return KeywordSearchScreen(
        searchQuery: _currentQuery,
        onSearch: _runSmartSearch, 
      );
    } else {
      return ProductResearchLaunchpad(onSearch: _runSmartSearch);
    }
  }

  Widget _buildSidebar() {
    return Container(
      width: 280, color: const Color(0xFF131B2F), 
      child: Column(
        children: [
          const SizedBox(height: 40),
          const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.shield, color: Color(0xFF8FFF00), size: 28), SizedBox(width: 8),
              Text("SellerPulse", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
            ],
          ),
          const SizedBox(height: 50),
          
          _sidebarItem(icon: Icons.dashboard, title: "Dashboard", index: 0),
          _sidebarItem(icon: Icons.search, title: "Product Research", index: 1),
          // ✨ NEW: Title Builder Button
          _sidebarItem(icon: Icons.text_fields, title: "Title Builder", index: 2),
          _sidebarItem(icon: Icons.calculate_outlined, title: "Profit Calculator", index: 3),
          _sidebarItem(icon: Icons.inventory_outlined, title: "Inventory", index: 4),
          
          const Spacer(),
          _sidebarItem(icon: Icons.settings_outlined, title: "Settings", index: 5), 
          
          if (isOwner)
            _sidebarItem(icon: Icons.admin_panel_settings, title: "Admin Center", index: 6),
          
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: InkWell(
              onTap: _logout, borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 20),
                decoration: BoxDecoration(color: Colors.white.withAlpha(26), borderRadius: BorderRadius.circular(12)),
                child: const Row(
                  children: [Icon(Icons.logout, color: Colors.white70, size: 20), SizedBox(width: 15), Text("Log Out", style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold))],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _sidebarItem({required IconData icon, required String title, required int index}) {
    final bool isActive = _selectedIndex == index;
    const Color activeColor = Color(0xFF8FFF00);
    const Color inactiveColor = Colors.white54;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 5),
      child: InkWell(
        onTap: () => setState(() {
          _selectedIndex = index;
          // ✨ Resets Product Research back to Launchpad if clicked!
          if (index == 1) _researchState = 0; 
        }),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 20),
          decoration: BoxDecoration(color: isActive ? activeColor.withAlpha(26) : Colors.transparent, borderRadius: BorderRadius.circular(12)),
          child: Row(
            children: [
              Icon(icon, color: isActive ? activeColor : inactiveColor, size: 22), const SizedBox(width: 15),
              Text(title, style: TextStyle(color: isActive ? Colors.white : inactiveColor, fontWeight: isActive ? FontWeight.bold : FontWeight.w500, fontSize: 15)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTopBar(bool isDesktop) {
    return Container(
      height: 80, padding: const EdgeInsets.symmetric(horizontal: 30),
      decoration: BoxDecoration(color: Colors.white, border: Border(bottom: BorderSide(color: Colors.grey.shade200))),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          if (!isDesktop) const Icon(Icons.menu, color: Colors.black) else const SizedBox(),
          Row(
            children: [
              IconButton(onPressed: () {}, icon: const Icon(Icons.notifications_outlined, color: Color(0xFF64748B))),
              const SizedBox(width: 15),
              CircleAvatar(backgroundColor: const Color(0xFF8FFF00), child: Text(_userInitial, style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold))),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildDashboardHome() {
    final String rawName = user?.userMetadata?['full_name']?.toString() ?? "";
    final String displayName = rawName.isNotEmpty ? rawName : "Seller";

    return SingleChildScrollView(
      padding: const EdgeInsets.all(30),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Welcome back, $displayName! 👋", style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
          const SizedBox(height: 8),
          const Text("Here is what's happening with your eBay store today.", style: TextStyle(color: Color(0xFF64748B), fontSize: 16)),
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
      decoration: BoxDecoration(
        color: isHighlight ? const Color(0xFF8FFF00) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: isHighlight ? null : Border.all(color: Colors.grey.shade200),
        boxShadow: isHighlight ? [const BoxShadow(color: Color(0x4D8FFF00), blurRadius: 20, offset: Offset(0, 10))] : [],
      ),
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