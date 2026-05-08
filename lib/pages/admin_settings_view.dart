import 'package:flutter/material.dart';

// ✨ IMPORT YOUR SETTINGS TABS
import 'admin_settings_tabs/user_crm_tab.dart';
import 'admin_settings_tabs/role_builder_tab.dart';
import 'admin_settings_tabs/security_logs_tab.dart';
import 'admin_settings_tabs/promo_manager_tab.dart';
import 'admin_settings_tabs/kill_switches_tab.dart';
import 'admin_settings_tabs/plan_limits_tab.dart';
import 'admin_settings_tabs/email_automations_tab.dart';
import 'admin_settings_tabs/webhooks_tab.dart';
import 'admin_settings_tabs/gamification_tab.dart';
import 'admin_settings_tabs/api_vault_complete.dart';
import 'admin_settings_tabs/affiliate_vault_tab.dart';
import 'admin_settings_tabs/founder_ops_tab.dart';

class AdminSettingsView extends StatefulWidget {
  final bool isMobile;
  final bool isInvestorMode;

  const AdminSettingsView({
    super.key,
    required this.isMobile,
    required this.isInvestorMode,
  });

  @override
  State<AdminSettingsView> createState() => _AdminSettingsViewState();
}

class _AdminSettingsViewState extends State<AdminSettingsView> {
  int _activeSettingsTab = 0;
  
  // ✨ NEW: Controls the slide-out Drawer on Mobile
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  final List<Map<String, dynamic>> _menuItems = [
    {"title": "User CRM", "icon": Icons.people_outline},
    {"title": "Role Builder", "icon": Icons.admin_panel_settings_outlined},
    {"title": "Security Logs", "icon": Icons.security_outlined},
    {"title": "Promos & Codes", "icon": Icons.local_offer_outlined},
    {"title": "Kill Switches", "icon": Icons.power_settings_new},
    {"title": "Plan Limits", "icon": Icons.tune},
    {"title": "Emails", "icon": Icons.email_outlined},
    {"title": "Webhooks", "icon": Icons.webhook},
    {"title": "Gamification", "icon": Icons.sports_esports_outlined},
    {"title": "API Fleet", "icon": Icons.vpn_key_outlined},
    {"title": "Affiliate Vault", "icon": Icons.monetization_on_outlined},
    {"title": "Founder Ops", "icon": Icons.insights_rounded}, 
  ];

  @override
  Widget build(BuildContext context) {
    // 🖥️ If Desktop: Show the Enterprise Split-View
    if (!widget.isMobile) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildDesktopSidebar(),
          const SizedBox(width: 24),
          Expanded(child: _buildContentArea()),
        ],
      );
    } 
    
    // 📱 If Mobile: Show the Scaffold with a Slide-Out Drawer
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: Colors.transparent, // Keeps your page background
      drawer: _buildMobileDrawer(),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildMobileHeader(),
          const SizedBox(height: 16),
          Expanded(child: _buildContentArea()),
        ],
      ),
    );
  }

  // ----------------------------------------------------------------------
  // 🖥️ DESKTOP: PERMANENT LEFT SIDEBAR
  // ----------------------------------------------------------------------
  Widget _buildDesktopSidebar() {
    return Container(
      width: 260,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))],
      ),
      child: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.only(left: 12, bottom: 16),
              child: Text("PLATFORM MANAGEMENT", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8), letterSpacing: 1.2)),
            ),
            ...List.generate(_menuItems.length, (index) {
              return _buildSidebarItem(_menuItems[index]["title"], _menuItems[index]["icon"], index);
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildSidebarItem(String title, IconData icon, int index) {
    bool isActive = _activeSettingsTab == index;
    return InkWell(
      onTap: () => setState(() => _activeSettingsTab = index),
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 4),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFFF1F5F9) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isActive ? const Color(0xFFE2E8F0) : Colors.transparent),
        ),
        child: Row(
          children: [
            Icon(icon, size: 20, color: isActive ? const Color(0xFF0F172A) : const Color(0xFF64748B)),
            const SizedBox(width: 12),
            Text(
              title, 
              style: TextStyle(
                color: isActive ? const Color(0xFF0F172A) : const Color(0xFF64748B), 
                fontWeight: isActive ? FontWeight.bold : FontWeight.w600, 
                fontSize: 14
              )
            ),
          ],
        ),
      ),
    );
  }

  // ----------------------------------------------------------------------
  // 📱 MOBILE: HEADER & SLIDE-OUT DRAWER
  // ----------------------------------------------------------------------
  Widget _buildMobileHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.menu, color: Color(0xFF0F172A)),
            onPressed: () => _scaffoldKey.currentState?.openDrawer(),
          ),
          const SizedBox(width: 8),
          Text(
            _menuItems[_activeSettingsTab]["title"], 
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))
          ),
        ],
      ),
    );
  }

  Widget _buildMobileDrawer() {
    return Drawer(
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.horizontal(right: Radius.circular(24)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.only(top: 60, left: 24, bottom: 24),
            child: const Text("PLATFORM MGMT", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8), letterSpacing: 1.2)),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              physics: const BouncingScrollPhysics(),
              itemCount: _menuItems.length,
              itemBuilder: (context, index) {
                bool isActive = _activeSettingsTab == index;
                return ListTile(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  selected: isActive,
                  selectedTileColor: const Color(0xFFF1F5F9),
                  leading: Icon(_menuItems[index]["icon"], color: isActive ? const Color(0xFF0F172A) : const Color(0xFF64748B)),
                  title: Text(
                    _menuItems[index]["title"], 
                    style: TextStyle(fontWeight: isActive ? FontWeight.bold : FontWeight.w600, color: isActive ? const Color(0xFF0F172A) : const Color(0xFF64748B))
                  ),
                  onTap: () {
                    setState(() => _activeSettingsTab = index);
                    Navigator.pop(context); // Closes the drawer automatically
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  // ----------------------------------------------------------------------
  // 🛡️ DYNAMIC CONTENT AREA
  // ----------------------------------------------------------------------
  Widget _buildContentArea() {
    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))],
      ),
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        child: _getSettingsContent(),
      ),
    );
  }

  Widget _getSettingsContent() {
    switch (_activeSettingsTab) {
      case 0: return UserCrmTab(isInvestorMode: widget.isInvestorMode, key: const ValueKey("crm"));
      case 1: return const RoleBuilderTab(key: ValueKey("roles"));
      case 2: return SecurityLogsTab(isInvestorMode: widget.isInvestorMode, key: const ValueKey("logs"));
      case 3: return PromoManagerTab(isMobile: widget.isMobile, key: const ValueKey("promos"));
      case 4: return const KillSwitchesTab(key: ValueKey("kill"));
      case 5: return const PlanLimitsTab(key: ValueKey("limits"));
      case 6: return const EmailAutomationsTab(key: ValueKey("emails"));
      case 7: return const WebhooksTab(key: ValueKey("hooks"));
      case 8: return const GamificationTab(key: ValueKey("game"));
      case 9: return const ApiVaultPage(key: ValueKey("api"));
      case 10: return const AffiliateVaultTab(key: ValueKey("affiliate"));
      case 11: return const FounderOpsTab(key: ValueKey("founder_ops"));
      default: return _buildPlaceholder("Module Active");
    }
  }

  Widget _buildPlaceholder(String text) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.construction, size: 64, color: Color(0xFFCBD5E1)),
            const SizedBox(height: 16),
            Text(text, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
          ],
        ),
      ),
    );
  }
}