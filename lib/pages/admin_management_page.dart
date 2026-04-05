import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:ui';
import '../widgets/page_wrapper.dart';
import '../widgets/user_crm_table.dart';

// ✨ DASHBOARD TABS
import 'admin_tabs/revenue_analytics_tab.dart';
import 'admin_tabs/global_api_fleet_tab.dart';
import 'admin_tabs/vero_command_center_tab.dart';
import 'admin_tabs/affiliate_center_tab.dart';
import 'admin_tabs/feature_roadmap_tab.dart';
import 'admin_tabs/infrastructure_monitor_tab.dart';
import 'admin_tabs/competitor_xray_tab.dart';
import 'admin_tabs/chrome_extension_tab.dart';

// ✨ SETTINGS TABS
import 'admin_settings_tabs/role_builder_tab.dart';
import 'admin_settings_tabs/security_logs_tab.dart';
import 'admin_settings_tabs/promo_manager_tab.dart';
import 'admin_settings_tabs/kill_switches_tab.dart';
import 'admin_settings_tabs/plan_limits_tab.dart';
import 'admin_settings_tabs/email_automations_tab.dart';
import 'admin_settings_tabs/webhooks_tab.dart';
import 'admin_settings_tabs/gamification_tab.dart';
// 🚀 NEW: We use "as vault" so it doesn't conflict with the Dashboard tab!
import 'admin_settings_tabs/global_api_fleet_tab.dart' as vault; 

class AdminManagementPage extends StatefulWidget {
  const AdminManagementPage({super.key});

  @override
  State<AdminManagementPage> createState() => _AdminManagementPageState();
}

class _AdminManagementPageState extends State<AdminManagementPage> with TickerProviderStateMixin {
  bool _isSettingsMode = false;
  int _activeDashboardTab = 0;
  int _activeSettingsTab = 0;
  
  bool _investorMode = false;
  final String _apiStatus = "Operational";
  bool _startChartAnimation = false;

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 300), () {
      if (mounted) setState(() => _startChartAnimation = true);
    });
  }

  // ✨ CMD+K GLOBAL COMMAND PALETTE
  void _showCommandPalette() {
    showDialog(
      context: context,
      barrierColor: Colors.black.withAlpha(100),
      builder: (context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.all(20),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(
              width: 650,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 40, spreadRadius: 10)],
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const TextField(
                    autofocus: true,
                    style: TextStyle(fontSize: 18, color: Color(0xFF0F172A)),
                    decoration: InputDecoration(
                      hintText: "Search users, settings, or execute commands...",
                      hintStyle: TextStyle(color: Color(0xFF94A3B8), fontSize: 18),
                      prefixIcon: Padding(padding: EdgeInsets.all(20), child: Icon(Icons.search, size: 24, color: Color(0xFF64748B))),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(vertical: 24, horizontal: 20),
                    )
                  ),
                  const Divider(height: 1, color: Color(0xFFE2E8F0)),
                  Container(
                    padding: const EdgeInsets.all(8),
                    color: const Color(0xFFF8FAFC),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Padding(padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8), child: Text("QUICK ACTIONS", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)))),
                        _buildCommandItem(Icons.person, "Search User: Mike Ross", "CRM"),
                        _buildCommandItem(Icons.warning_amber_rounded, "Trigger Emergency Kill Switch", "System", isDanger: true),
                        _buildCommandItem(Icons.visibility_off, "Toggle Investor Mode", "Settings"),
                        _buildCommandItem(Icons.bar_chart, "Jump to Revenue Analytics", "Navigation"),
                      ],
                    ),
                  )
                ],
              ),
            ),
          ),
        );
      }
    );
  }

  Widget _buildCommandItem(IconData icon, String title, String tag, {bool isDanger = false}) {
    return ListTile(
      leading: Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: isDanger ? Colors.red.withAlpha(20) : const Color(0xFFE2E8F0), borderRadius: BorderRadius.circular(8)), child: Icon(icon, color: isDanger ? Colors.redAccent : const Color(0xFF0F172A), size: 16)),
      title: Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: isDanger ? Colors.redAccent : const Color(0xFF0F172A))),
      trailing: Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: Colors.white, border: Border.all(color: const Color(0xFFE2E8F0)), borderRadius: BorderRadius.circular(4)), child: Text(tag, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF64748B)))),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      hoverColor: Colors.white,
      onTap: () => Navigator.pop(context),
    );
  }

  String _obscureText(String text, {bool isEmail = false}) {
    if (!_investorMode) return text;
    if (isEmail) {
      var parts = text.split('@');
      if (parts.length != 2) return text;
      return '${parts[0][0]}***@${parts[1]}';
    }
    return '${text[0]}***';
  }

  @override
  Widget build(BuildContext context) {
    bool isMobile = MediaQuery.of(context).size.width < 950;

    return Focus(
      autofocus: true,
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent && 
            event.logicalKey == LogicalKeyboardKey.keyK && 
            (HardwareKeyboard.instance.isControlPressed || HardwareKeyboard.instance.isMetaPressed)) {
          _showCommandPalette();
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: PageWrapper(
        // ✨ THE MASTER FIX: One single scroll view for the entire page. No straitjackets!
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.only(bottom: 80),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(isMobile),
              const SizedBox(height: 24),
              
              // Animated Switcher with NO height locks! It grows naturally.
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 400),
                layoutBuilder: (Widget? currentChild, List<Widget> previousChildren) {
                  return Stack(
                    alignment: Alignment.topCenter,
                    children: <Widget>[
                      ...previousChildren,
                      if (currentChild != null) currentChild,
                    ],
                  );
                },
                child: _isSettingsMode 
                    ? _buildSettingsLayout(isMobile, key: const ValueKey('settings')) 
                    : _buildDashboardLayout(isMobile, key: const ValueKey('dashboard')),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ----------------------------------------------------------------------
  // 🖥️ HEADER COMPONENT
  // ----------------------------------------------------------------------
  Widget _buildHeader(bool isMobile) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(10),
            boxShadow: [BoxShadow(color: const Color(0xFF8FFF00).withAlpha(50), blurRadius: 10, spreadRadius: 1)],
          ),
          child: const Icon(Icons.admin_panel_settings, color: Color(0xFF8FFF00), size: 28),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("SaaS Founder Command Center", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)), overflow: TextOverflow.ellipsis),
              if (!isMobile)
                Text(
                  _isSettingsMode ? "Manage users, team access, and platform security." : "Monitor MRR, analytics, and global platform health.", 
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 13), 
                  overflow: TextOverflow.ellipsis
                ),
            ],
          ),
        ),

        if (!isMobile) ...[
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: _investorMode ? Colors.purple.withAlpha(20) : Colors.transparent,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: _investorMode ? Colors.purpleAccent.withAlpha(100) : const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                Icon(Icons.visibility_off, color: _investorMode ? Colors.purpleAccent : const Color(0xFF94A3B8), size: 16),
                const SizedBox(width: 8),
                Text("Investor Mode", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: _investorMode ? Colors.purpleAccent : const Color(0xFF64748B))),
                const SizedBox(width: 4),
                Transform.scale(
                  scale: 0.7,
                  child: Switch(
                    value: _investorMode, 
                    onChanged: (v) => setState(() => _investorMode = v),
                    activeThumbColor: Colors.purpleAccent,
                    activeTrackColor: Colors.purple.withAlpha(50),
                  ),
                )
              ],
            ),
          ),

          _isSettingsMode
              ? ElevatedButton.icon(
                  onPressed: () => setState(() => _isSettingsMode = false),
                  icon: const Icon(Icons.arrow_back, color: Color(0xFF0F172A), size: 16),
                  label: const Text("Back to Dashboard", style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.white, side: const BorderSide(color: Color(0xFFE2E8F0)), elevation: 0, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14)),
                )
              : ElevatedButton.icon(
                  onPressed: () => setState(() => _isSettingsMode = true),
                  icon: const Icon(Icons.settings_outlined, color: Color(0xFF0F172A), size: 18),
                  label: const Text("Admin Settings", style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF8FFF00), elevation: 0, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14)),
                )
        ] else ...[
          Container(
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8), border: Border.all(color: const Color(0xFFE2E8F0))),
            child: PopupMenuButton<int>(
              icon: const Icon(Icons.more_vert, color: Color(0xFF0F172A)),
              offset: const Offset(0, 45),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              onSelected: (value) {
                if (value == 0) setState(() => _investorMode = !_investorMode);
                if (value == 1) setState(() => _isSettingsMode = !_isSettingsMode);
              },
              itemBuilder: (context) => [
                PopupMenuItem(
                  value: 0,
                  child: Row(children: [
                    Icon(Icons.visibility_off, color: _investorMode ? Colors.purpleAccent : const Color(0xFF94A3B8), size: 18),
                    const SizedBox(width: 12),
                    Text("Investor Mode: ${_investorMode ? 'ON' : 'OFF'}", style: TextStyle(fontWeight: FontWeight.bold, color: _investorMode ? Colors.purpleAccent : const Color(0xFF0F172A))),
                  ]),
                ),
                PopupMenuItem(
                  value: 1,
                  child: Row(children: [
                    Icon(_isSettingsMode ? Icons.arrow_back : Icons.settings_outlined, color: const Color(0xFF0F172A), size: 18),
                    const SizedBox(width: 12),
                    Text(_isSettingsMode ? "Back to Dashboard" : "Admin Settings", style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                  ]),
                ),
              ],
            ),
          )
        ]
      ],
    );
  }

  // ----------------------------------------------------------------------
  // ⚙️ VIEW 2: THE SETTINGS LAYOUT
  // ----------------------------------------------------------------------
  Widget _buildSettingsLayout(bool isMobile, {Key? key}) {
    if (isMobile) {
      return Column(
        key: key,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 10, runSpacing: 10,
            children: [
              _buildPillTab("User CRM", Icons.people_outline, 0, isSettings: true),
              _buildPillTab("Role Builder", Icons.admin_panel_settings_outlined, 1, isSettings: true),
              _buildPillTab("Security Logs", Icons.security_outlined, 2, isSettings: true),
              _buildPillTab("Promos & Codes", Icons.local_offer_outlined, 3, isSettings: true),
              _buildPillTab("Kill Switches", Icons.power_settings_new, 4, isSettings: true),
              _buildPillTab("Plan Limits", Icons.tune, 5, isSettings: true),
              _buildPillTab("Emails", Icons.email_outlined, 6, isSettings: true),
              _buildPillTab("Webhooks", Icons.webhook, 7, isSettings: true),
              _buildPillTab("Gamification", Icons.sports_esports_outlined, 8, isSettings: true),
              _buildPillTab("API Vault", Icons.vpn_key_outlined, 9, isSettings: true), // 🚀 NEW
            ],
          ),
          const SizedBox(height: 24),
          _getSettingsContent(isMobile),
        ],
      );
    }

    return Row(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // LEFT SIDEBAR
        Container(
          width: 250,
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))]
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSidebarItem("User CRM", Icons.people_outline, 0),
              _buildSidebarItem("Role Builder", Icons.admin_panel_settings_outlined, 1),
              _buildSidebarItem("Security Logs", Icons.security_outlined, 2),
              _buildSidebarItem("Promos & Codes", Icons.local_offer_outlined, 3),
              _buildSidebarItem("Kill Switches", Icons.power_settings_new, 4),
              _buildSidebarItem("Plan Limits", Icons.tune, 5),
              _buildSidebarItem("Emails", Icons.email_outlined, 6),
              _buildSidebarItem("Webhooks", Icons.webhook, 7),
              _buildSidebarItem("Gamification", Icons.sports_esports_outlined, 8),
              _buildSidebarItem("API Vault", Icons.vpn_key_outlined, 9), // 🚀 NEW
            ],
          ),
        ),
        const SizedBox(width: 24),
        // RIGHT CONTENT AREA
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))]
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: _getSettingsContent(isMobile),
              ),
            ),
          ),
        )
      ],
    );
  }

  Widget _getSettingsContent(bool isMobile) {
    switch (_activeSettingsTab) {
      case 0: return UserCrmTable(isInvestorMode: _investorMode, key: const ValueKey("crm"));
      case 1: return const RoleBuilderTab(key: ValueKey("roles"));
      case 2: return SecurityLogsTab(isInvestorMode: _investorMode, key: const ValueKey("logs"));
      case 3: return PromoManagerTab(isMobile: isMobile, key: const ValueKey("promo"));
      case 4: return const KillSwitchesTab(key: ValueKey("killswitches"));
      case 5: return const PlanLimitsTab(key: ValueKey("limits"));
      case 6: return const EmailAutomationsTab(key: ValueKey("emails"));
      case 7: return const WebhooksTab(key: ValueKey("webhooks"));
      case 8: return const GamificationTab(key: ValueKey("gamification"));
      // 🚀 NEW: Connects to the vault using our special alias
      case 9: return const vault.GlobalApiFleetTab(key: ValueKey("api_vault")); 
      default: return _buildPlaceholder("Settings Module Active");
    }
  }

  Widget _buildSidebarItem(String title, IconData icon, int index) {
    bool isActive = _activeSettingsTab == index;
    return InkWell(
      onTap: () => setState(() => _activeSettingsTab = index),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFFF1F5F9) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, size: 18, color: isActive ? const Color(0xFF0F172A) : const Color(0xFF64748B)),
            const SizedBox(width: 12),
            Text(title, style: TextStyle(color: isActive ? const Color(0xFF0F172A) : const Color(0xFF64748B), fontWeight: isActive ? FontWeight.bold : FontWeight.w600, fontSize: 13)),
          ],
        ),
      ),
    );
  }

  // ----------------------------------------------------------------------
  // 📊 VIEW 1: THE MAIN DASHBOARD
  // ----------------------------------------------------------------------
  Widget _buildDashboardLayout(bool isMobile, {Key? key}) {
    return Column(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 10),
        
        if (!isMobile) 
          Row(
            children: [
              Expanded(child: _buildStatCard("Monthly Recurring Revenue", "\$12,450", "+14% this month", Icons.attach_money, isHighlight: true, delay: 0)),
              const SizedBox(width: 16),
              Expanded(child: _buildStatCard("Active Subscribers", "842", "+12 new today", Icons.people_alt_outlined, delay: 100)),
              const SizedBox(width: 16),
              Expanded(child: _buildStatCard("Trial Conversion Rate", "24.5%", "Industry avg: 15%", Icons.insights, delay: 200)),
              const SizedBox(width: 16),
              Expanded(child: _buildStatCard("Churn Rate", "2.1%", "Healthy", Icons.trending_down, isGood: true, delay: 300)),
            ],
          )
        else
          Column( 
            children: [
              Row(children: [
                Expanded(child: _buildStatCard("MRR", "\$12,450", "+14%", Icons.attach_money, isHighlight: true, delay: 0)),
                const SizedBox(width: 16),
                Expanded(child: _buildStatCard("Users", "842", "+12", Icons.people_alt_outlined, delay: 100)),
              ]),
              const SizedBox(height: 16),
              Row(children: [
                Expanded(child: _buildStatCard("Conversion", "24.5%", "Avg 15%", Icons.insights, delay: 200)),
                const SizedBox(width: 16),
                Expanded(child: _buildStatCard("Churn", "2.1%", "Healthy", Icons.trending_down, isGood: true, delay: 300)),
              ]),
            ],
          ),
        
        const SizedBox(height: 30),

        if (!isMobile)
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(flex: 7, child: _buildMainContentArea(isMobile)),
              const SizedBox(width: 24),
              Expanded(flex: 3, child: _buildRightSidebarTools()),
            ],
          )
        else
          Column(
            children: [
              _buildMainContentArea(isMobile),
              const SizedBox(height: 24),
              _buildRightSidebarTools(),
            ],
          ),
      ],
    );
  }

  Widget _buildMainContentArea(bool isMobile) {
    Widget tabContent = AnimatedSwitcher(
      duration: const Duration(milliseconds: 400),
      child: _activeDashboardTab == 0 
          ? RevenueAnalyticsTab(isDesktop: !isMobile, isInvestorMode: _investorMode, startChartAnimation: _startChartAnimation, key: const ValueKey("revenue")) 
          : _activeDashboardTab == 1 
              ? GlobalApiFleetTab(startChartAnimation: _startChartAnimation, key: const ValueKey("api"))
              : _activeDashboardTab == 2
                  ? const VeroCommandCenterTab(key: ValueKey("vero"))
                  : _activeDashboardTab == 3
                      ? AffiliateCenterTab(isInvestorMode: _investorMode, key: const ValueKey("affiliate"))
                      : _activeDashboardTab == 4
                          ? const FeatureRoadmapTab(key: ValueKey("roadmap"))
                          : _activeDashboardTab == 5
                              ? InfrastructureMonitorTab(isMobile: isMobile, startChartAnimation: _startChartAnimation, key: const ValueKey("infra"))
                              : _activeDashboardTab == 6
                                  ? const CompetitorXRayTab(key: ValueKey("xray"))
                                  : _activeDashboardTab == 7 
                                      ? const ChromeExtensionTab(key: ValueKey("chrome"))
                                      : const SizedBox.shrink(), 
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  _buildPillTab("Revenue Analytics", Icons.bar_chart, 0),
                  _buildPillTab("Global API Fleet", Icons.hub_outlined, 1),
                  _buildPillTab("VeRO Master List", Icons.shield_outlined, 2),
                  _buildPillTab("Affiliates & Partners", Icons.handshake_outlined, 3),
                  _buildPillTab("Feature Roadmap", Icons.map, 4), 
                  _buildPillTab("Infrastructure", Icons.dns_outlined, 5), 
                  _buildPillTab("Competitor Intelligence", Icons.visibility_outlined, 6), 
                  _buildPillTab("Extensions & Apps", Icons.extension_outlined, 7), 
                ],
              ),
            ),
            if (!isMobile) ...[
              const SizedBox(width: 16),
              _buildSystemHealthBar(),
            ]
          ],
        ),
        if (isMobile) ...[
          const SizedBox(height: 16),
          _buildSystemHealthBar(),
        ],
        const SizedBox(height: 24),

        // ✨ No height locks here! The tab content grows to its true size
        tabContent,
      ],
    );
  }

  // --- UI HELPER COMPONENTS ---

  Widget _buildSystemHealthBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildHealthDot(Colors.green, "Database"),
          const SizedBox(width: 12),
          _buildHealthDot(Colors.green, "Auth Server"),
          const SizedBox(width: 12),
          _buildHealthDot(_apiStatus == "Operational" ? Colors.green : (_apiStatus == "Degraded" ? Colors.orangeAccent : Colors.redAccent), "API Config"),
        ],
      ),
    );
  }

  Widget _buildHealthDot(Color color, String label) {
    return Row(
      children: [
        Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle, boxShadow: [BoxShadow(color: color.withAlpha(100), blurRadius: 4)])),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
      ],
    );
  }

  Widget _buildRightSidebarTools() {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: const Color(0xFF8FFF00).withAlpha(30), blurRadius: 15)]),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(children: [Icon(Icons.campaign, color: Color(0xFF8FFF00)), SizedBox(width: 8), Text("Global Broadcast", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16))]),
              const SizedBox(height: 16),
              TextField(
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  hintText: "Type a message to alert all users...", hintStyle: const TextStyle(color: Colors.white54),
                  filled: true, fillColor: Colors.white.withAlpha(20),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF8FFF00), foregroundColor: const Color(0xFF0F172A), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                  child: const Text("Push to All Users", style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              )
            ],
          ),
        ),
        const SizedBox(height: 20),

        Row(
          children: [
            Expanded(
              child: Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.red.shade100)), child: const Column(children: [Text("3", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.redAccent)), Text("Open Tickets", style: TextStyle(color: Colors.redAccent, fontSize: 12, fontWeight: FontWeight.bold))])),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.orange.shade100)), child: const Column(children: [Text("1", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.orange)), Text("Bug Reports", style: TextStyle(color: Colors.orange, fontSize: 12, fontWeight: FontWeight.bold))])),
            ),
          ],
        ),
        const SizedBox(height: 20),

        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Live Activity Feed", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A))),
              const SizedBox(height: 16),
              _buildLogItem(Icons.arrow_upward, Colors.green, "${_obscureText("Sarah Jenkins")} upgraded to Elite Plan.", "Just now"),
              _buildLogItem(Icons.warning_amber_rounded, Colors.orange, "eBay API limit reached 85%.", "5 mins ago"),
              _buildLogItem(Icons.credit_card_off, Colors.redAccent, "${_obscureText("Mike Ross")} payment declined.", "12 mins ago"),
              _buildLogItem(Icons.person_add, Colors.blue, "New user signed up (Free Trial).", "1 hour ago"),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildLogItem(IconData icon, Color color, String text, String time) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: color.withAlpha(20), shape: BoxShape.circle), child: Icon(icon, color: color, size: 14)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(text, style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A))), Text(time, style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)))]))
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, String subtitle, IconData icon, {bool isHighlight = false, bool isGood = false, required int delay}) {
    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0.0, end: 1.0),
      duration: Duration(milliseconds: 600 + delay), 
      curve: Curves.easeOutCubic,
      builder: (context, opacity, child) {
        return Opacity(
          opacity: opacity,
          child: Transform.translate(
            offset: Offset(0, 20 * (1 - opacity)), 
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isHighlight ? const Color(0xFF0F172A) : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: isHighlight ? null : Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: isHighlight ? [BoxShadow(color: const Color(0xFF0F172A).withAlpha(80), blurRadius: 15, offset: const Offset(0, 5))] : const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(child: Text(title, style: TextStyle(color: isHighlight ? const Color(0xFF94A3B8) : const Color(0xFF64748B), fontSize: 13, fontWeight: FontWeight.bold), overflow: TextOverflow.ellipsis)),
                      Icon(icon, color: isHighlight ? const Color(0xFF8FFF00) : const Color(0xFF94A3B8), size: 18),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(value, style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: isHighlight ? Colors.white : const Color(0xFF0F172A))),
                  const SizedBox(height: 4),
                  Text(subtitle, style: TextStyle(color: isHighlight ? const Color(0xFF8FFF00) : (isGood ? const Color(0xFF16A34A) : const Color(0xFF64748B)), fontSize: 12, fontWeight: FontWeight.bold), overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
          ),
        );
      }
    );
  }

  Widget _buildPillTab(String title, IconData icon, int index, {bool isSettings = false}) {
    bool isActive = isSettings ? (_activeSettingsTab == index) : (_activeDashboardTab == index);
    return InkWell(
      onTap: () => setState(() {
        if (isSettings) {
          _activeSettingsTab = index;
        } else {
          _activeDashboardTab = index;
          _startChartAnimation = false; 
          Future.delayed(const Duration(milliseconds: 100), () {
            if (mounted) setState(() => _startChartAnimation = true);
          });
        }
      }),
      borderRadius: BorderRadius.circular(8),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF0F172A) : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isActive ? const Color(0xFF0F172A) : const Color(0xFFE2E8F0)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: isActive ? const Color(0xFF8FFF00) : const Color(0xFF64748B), size: 18),
            const SizedBox(width: 8),
            Text(title, style: TextStyle(color: isActive ? Colors.white : const Color(0xFF64748B), fontWeight: FontWeight.bold, fontSize: 13)),
          ],
        ),
      ),
    );
  }

  Widget _buildPlaceholder(String text) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.construction, size: 48, color: Color(0xFFE2E8F0)),
          const SizedBox(height: 16),
          Text(text, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
        ],
      ),
    );
  }
}