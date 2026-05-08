// ═══════════════════════════════════════════════════════════════════════════
// lib/user_profile/user_profile_page.dart - UPDATED
// ═══════════════════════════════════════════════════════════════════════════

import 'package:flutter/material.dart';
import 'tabs/overview_tab.dart';
import 'tabs/ebay_manager_tab.dart';
import 'tabs/tool_usage_tab.dart';
import 'tabs/billing_tab.dart';
import 'tabs/vault_tab.dart';
import 'tabs/security_tab.dart';

class UserProfilePage extends StatefulWidget {
  const UserProfilePage({super.key});
  @override
  State<UserProfilePage> createState() => _UserProfilePageState();
}

class _UserProfilePageState extends State<UserProfilePage> {
  int _selectedTab = 0;

  // Tab definitions — icon + short label for mobile + full label for desktop
  static const _tabs = [
    {'icon': Icons.person_outline,     'short': 'Me',       'label': 'Overview'},
    {'icon': Icons.public,             'short': 'Market',   'label': 'Marketplace'},
    {'icon': Icons.bar_chart_outlined, 'short': 'Usage',    'label': 'Tool Usage'},
    {'icon': Icons.bookmark_outline,   'short': 'Vault',    'label': 'Vault'},
    {'icon': Icons.credit_card,        'short': 'Billing',  'label': 'Billing'},
    {'icon': Icons.security,           'short': 'Security', 'label': 'Security'},
  ];

  @override
  Widget build(BuildContext context) {
    final bool isMobile = MediaQuery.of(context).size.width < 800;
    return Container(
      color: const Color(0xFFF4F7FA),
      child: isMobile ? _buildMobileLayout() : _buildDesktopLayout(),
    );
  }

  Widget _buildDesktopLayout() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Menu
        Container(
          width: 260,
          margin: const EdgeInsets.only(left: 16, top: 16, bottom: 16),
          padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 15, offset: const Offset(0, 5))],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: _buildMenuItems(isMobile: false),
          ),
        ),
        const SizedBox(width: 24),
        // Content
        Expanded(
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
                padding: const EdgeInsets.only(top: 16, right: 32, bottom: 24),
                child: _buildTabContent(),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMobileLayout() {
    final screenW = MediaQuery.of(context).size.width;
    // On very small screens show icons only, on medium show icon+short label
    final showLabels = screenW > 400;

    return Column(children: [
      Container(
        height: showLabels ? 64 : 60,
        margin: const EdgeInsets.only(top: 12, left: 12, right: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 10, offset: const Offset(0, 2))],
        ),
        child: Row(
          children: _tabs.asMap().entries.map((e) {
            final idx      = e.key;
            final tab      = e.value;
            final isActive = _selectedTab == idx;
            return Expanded(
              child: GestureDetector(
                onTap: () => setState(() => _selectedTab = idx),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: isActive
                        ? const Color(0xFF0F172A)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        tab['icon'] as IconData,
                        size: 18,
                        color: isActive
                            ? Colors.white
                            : const Color(0xFF94A3B8),
                      ),
                      if (showLabels) ...[
                        const SizedBox(height: 3),
                        Text(
                          tab['short'] as String,
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: isActive
                                ? FontWeight.bold
                                : FontWeight.w500,
                            color: isActive
                                ? Colors.white
                                : const Color(0xFF94A3B8),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
      const SizedBox(height: 12),
      Expanded(
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
              padding: const EdgeInsets.only(left: 12, right: 12, bottom: 24),
              child: _buildTabContent(),
            ),
          ),
        ),
      ),
    ]);
  }

  List<Widget> _buildMenuItems({required bool isMobile}) {
    return [
      if (!isMobile)
        const Padding(
          padding: EdgeInsets.only(left: 10, bottom: 20),
          child: Text('Settings',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900,
                  color: Color(0xFF0F172A))),
        ),
      ..._tabs.asMap().entries.map((e) =>
          _navTab(e.key, e.value['icon'] as IconData,
              e.value['label'] as String, isMobile)),
    ];
  }

  Widget _navTab(int index, IconData icon, String title, bool isMobile) {
    final isActive = _selectedTab == index;
    return InkWell(
      onTap: () => setState(() => _selectedTab = index),
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        margin: EdgeInsets.only(bottom: isMobile ? 0 : 8, right: isMobile ? 8 : 0),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF0F172A) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 20,
              color: isActive ? Colors.white : const Color(0xFF64748B)),
          const SizedBox(width: 8),
          Text(title,
              style: TextStyle(
                  fontWeight: isActive ? FontWeight.bold : FontWeight.w600,
                  color: isActive ? Colors.white : const Color(0xFF64748B),
                  fontSize: 13)),
        ]),
      ),
    );
  }

  Widget _buildTabContent() {
    switch (_selectedTab) {
      case 0: return OverviewTab(onTabChange: (i) => setState(() => _selectedTab = i));
      case 1: return const EbayManagerTab();
      case 2: return const ToolUsageTab();
      case 3: return const VaultTab();
      case 4: return const BillingTab();
      case 5: return const SecurityTab();
      default:
        return Center(
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(Icons.construction_outlined,
                size: 48, color: Colors.grey.shade300),
            const SizedBox(height: 16),
            Text('Coming Soon',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold,
                    color: Colors.grey.shade400)),
          ]),
        );
    }
  }
}