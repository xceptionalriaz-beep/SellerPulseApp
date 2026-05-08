import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:async';

import 'landing_page.dart';
import 'product_research/product_research_master.dart';
import 'inventory_page.dart';
import 'profit_calculator.dart';
import 'admin_management_page.dart';
import 'title_builder/title_builder_main.dart';
import '../user_profile/user_profile_page.dart';
import '../widgets/location_prompt.dart';
import 'competitor_research/competitor_research_main.dart';
import 'orders/orders_dashboard.dart';
// NEW: Import notifications
import 'orders/notifications_panel.dart';
import 'orders/notifications_service.dart';
import 'orders/analytics_dashboard.dart';
import 'dashboard_home.dart';

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

  late final StreamSubscription<AuthState> _authSubscription;

  bool _isLocationVerified = true;
  bool _isLoadingLocationStatus = true;

  // NEW: Notification count state
  int _notificationCount = 0;
  Timer? _notificationTimer;

  User? get user => Supabase.instance.client.auth.currentUser;
  bool get isOwner => user?.email == 'xceptionalriaz@gmail.com';

  @override
  void initState() {
    super.initState();
    _checkLocationVerification();
    _loadNotificationCount(); // NEW: Load count on start

    // NEW: Refresh notification count every 60 seconds
    _notificationTimer = Timer.periodic(
      const Duration(seconds: 60),
      (_) => _loadNotificationCount(),
    );

    _authSubscription =
        Supabase.instance.client.auth.onAuthStateChange.listen((data) {
      if (data.event == AuthChangeEvent.userUpdated) {
        if (mounted) setState(() {});
      }
    });
  }

  // NEW: Load notification count
  Future<void> _loadNotificationCount() async {
    final notifications = await NotificationsService.getNotifications();
    if (mounted) {
      setState(() => _notificationCount = notifications.length);
    }
  }

  Future<void> _checkLocationVerification() async {
    if (user == null) return;
    try {
      final data = await Supabase.instance.client
          .from('profiles')
          .select('is_location_verified')
          .eq('id', user!.id)
          .single();

      if (mounted) {
        setState(() {
          _isLocationVerified = data['is_location_verified'] == true;
          _isLoadingLocationStatus = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoadingLocationStatus = false);
    }
  }

  @override
  void dispose() {
    _authSubscription.cancel();
    _notificationTimer?.cancel(); // NEW: Cancel timer
    super.dispose();
  }

  String _getInitials(String name) {
    if (name.trim().isEmpty) return "S";
    List<String> parts = name.trim().split(RegExp(r'\s+'));
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    } else {
      return name.length >= 2
          ? name.substring(0, 2).toUpperCase()
          : name.toUpperCase();
    }
  }

  String get _userInitial {
    final name = user?.userMetadata?['full_name']?.toString() ?? "";
    return _getInitials(name);
  }

  String? _getSmartAvatarUrl() {
    if (user == null) return null;

    final googlePhoto = user?.userMetadata?['picture'];
    if (googlePhoto != null) return googlePhoto.toString();

    final String seed = user?.email ?? "default";
    final String gender =
        user?.userMetadata?['gender']?.toString() ?? "Unspecified";

    if (gender == 'Male') {
      return "https://api.dicebear.com/9.x/adventurer-neutral/png?seed=${seed}male&backgroundColor=b6e3f4";
    } else if (gender == 'Female') {
      return "https://api.dicebear.com/9.x/lorelei/png?seed=${seed}female&backgroundColor=ffdfbf";
    }

    return null;
  }

  Future<void> _logout() async {
    await Supabase.instance.client.auth.signOut();
    if (mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => const PublicLandingPage()),
        (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isDesktop = MediaQuery.of(context).size.width > 900;
    final String? currentAvatarUrl = _getSmartAvatarUrl();

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: const Color(0xFFF8FAFC),
      drawer: !isDesktop ? _buildMobileDrawer() : null,
      body: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.all(10.0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (isDesktop) _buildSlimRail(),
                Expanded(
                  child: Column(
                    children: [
                      // ─ TOP BAR (Desktop) ─
                      if (isDesktop)
                        Container(
                          height: 60,
                          padding:
                              const EdgeInsets.symmetric(horizontal: 25),
                          child: Row(
                            children: [
                              Text(
                                _selectedIndex == 5
                                    ? "Settings / Overview"
                                    : "Marketplace Research",
                                style: const TextStyle(
                                  color: Color(0xFF64748B),
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const Spacer(),

                              // NEW: Bell icon with badge
                              _buildNotificationBell(),

                              if (_selectedIndex != 5) ...[
                                const SizedBox(width: 15),
                                Builder(builder: (context) {
                                  return InkWell(
                                    borderRadius: BorderRadius.circular(16),
                                    onTap: () => setState(
                                        () => _selectedIndex = 8),
                                    child: ClipRRect(
                                      borderRadius:
                                          BorderRadius.circular(16),
                                      child: Container(
                                        width: 32,
                                        height: 32,
                                        color: neonGreen,
                                        child: currentAvatarUrl != null
                                            ? Image.network(
                                                currentAvatarUrl,
                                                fit: BoxFit.cover,
                                                errorBuilder: (context,
                                                        error,
                                                        stackTrace) =>
                                                    Center(
                                                  child: Text(
                                                    _userInitial,
                                                    style: const TextStyle(
                                                      color: Color(0xFF0F172A),
                                                      fontWeight:
                                                          FontWeight.bold,
                                                      fontSize: 13,
                                                    ),
                                                  ),
                                                ),
                                              )
                                            : Center(
                                                child: Text(
                                                  _userInitial,
                                                  style: const TextStyle(
                                                    color: Color(0xFF0F172A),
                                                    fontWeight:
                                                        FontWeight.w900,
                                                    fontSize: 13,
                                                    letterSpacing: 0.5,
                                                  ),
                                                ),
                                              ),
                                      ),
                                    ),
                                  );
                                }),
                              ],
                            ],
                          ),
                        ),

                      if (!isDesktop) _buildMobileHeader(currentAvatarUrl),

                      Expanded(
                        child: Padding(
                          padding: EdgeInsets.only(
                              left: isDesktop ? 15 : 0),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(24),
                            child: _buildCurrentScreen(),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          if (!_isLoadingLocationStatus &&
              !_isLocationVerified &&
              user != null)
            LocationPrompt(
              userId: user!.id,
              isVerified: _isLocationVerified,
            ),
        ],
      ),
    );
  }

  // NEW: Bell icon with red badge
  Widget _buildNotificationBell() {
    return Tooltip(
      message: 'Notifications',
      child: GestureDetector(
        onTap: () {
          // Open notification panel
          showNotificationsPanel(context);
          // Reload count after panel closes
          Future.delayed(const Duration(milliseconds: 500), () {
            _loadNotificationCount();
          });
        },
        child: Stack(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withAlpha(200),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.notifications_outlined,
                color: _notificationCount > 0
                    ? const Color(0xFFFF4D6A)
                    : const Color(0xFF64748B),
                size: 22,
              ),
            ),
            // RED BADGE with count
            if (_notificationCount > 0)
              Positioned(
                right: 4,
                top: 4,
                child: Container(
                  width: 16,
                  height: 16,
                  decoration: const BoxDecoration(
                    color: Color(0xFFFF4D6A),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      _notificationCount > 9
                          ? '9+'
                          : '$_notificationCount',
                      style: const TextStyle(
                        fontSize: 8,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildMobileHeader(String? currentAvatarUrl) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: const Icon(Icons.menu_rounded,
                color: Colors.black, size: 28),
            onPressed: () => _scaffoldKey.currentState?.openDrawer(),
          ),
          MouseRegion(
            cursor: SystemMouseCursors.click,
            child: GestureDetector(
              onTap: () => setState(() => _selectedIndex = 0),
              child: const Icon(Icons.shield,
                  color: Color(0xFF8FFF00), size: 24),
            ),
          ),
          Row(
            children: [
              // NEW: Mobile notification bell with badge
              Stack(
                children: [
                  IconButton(
                    onPressed: () {
                      showNotificationsPanel(context);
                      Future.delayed(const Duration(milliseconds: 500),
                          () => _loadNotificationCount());
                    },
                    icon: Icon(
                      Icons.notifications_outlined,
                      color: _notificationCount > 0
                          ? const Color(0xFFFF4D6A)
                          : const Color(0xFF64748B),
                      size: 22,
                    ),
                  ),
                  if (_notificationCount > 0)
                    Positioned(
                      right: 8,
                      top: 8,
                      child: Container(
                        width: 14,
                        height: 14,
                        decoration: const BoxDecoration(
                          color: Color(0xFFFF4D6A),
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            '$_notificationCount',
                            style: const TextStyle(
                              fontSize: 8,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              if (_selectedIndex != 5)
                Builder(builder: (context) {
                  return InkWell(
                    borderRadius: BorderRadius.circular(14),
                    onTap: () => setState(() => _selectedIndex = 8),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: Container(
                        width: 28,
                        height: 28,
                        color: neonGreen,
                        child: currentAvatarUrl != null
                            ? Image.network(
                                currentAvatarUrl,
                                fit: BoxFit.cover,
                                errorBuilder:
                                    (context, error, stackTrace) =>
                                        Center(
                                  child: Text(_userInitial,
                                      style: const TextStyle(
                                          color: Color(0xFF0F172A),
                                          fontWeight: FontWeight.bold,
                                          fontSize: 12)),
                                ),
                              )
                            : Center(
                                child: Text(_userInitial,
                                    style: const TextStyle(
                                        color: Color(0xFF0F172A),
                                        fontWeight: FontWeight.w900,
                                        fontSize: 11,
                                        letterSpacing: 0.5)),
                              ),
                      ),
                    ),
                  );
                }),
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
          MouseRegion(
            cursor: SystemMouseCursors.click,
            child: GestureDetector(
              onTap: () {
                setState(() => _selectedIndex = 0);
                Navigator.pop(context);
              },
              child:
                  const Icon(Icons.shield, color: Color(0xFF8FFF00), size: 40),
            ),
          ),
          const SizedBox(height: 30),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              children: [
                _drawerItem(Icons.dashboard_rounded, "Dashboard", 0),
                _drawerItem(Icons.search_rounded, "Product Research", 1),
                _drawerItem(Icons.text_fields_rounded, "Title Builder", 2),
                _drawerItem(
                    Icons.calculate_rounded, "Profit Calculator", 3),
                _drawerItem(Icons.inventory_2_rounded, "Inventory", 4),
                _drawerItem(
                    Icons.radar_rounded, "Competitor Research", 5),
                _drawerItem(Icons.shield_outlined, "Orders", 6),
                _drawerItem(Icons.insights, "Analytics", 7),
                const Divider(color: Colors.white10, height: 40),
                _drawerItem(Icons.settings_rounded, "Settings", 7),
                if (isOwner)
                  _drawerItem(Icons.admin_panel_settings_rounded,
                      "Admin Center", 8),
              ],
            ),
          ),
          ListTile(
            leading:
                const Icon(Icons.logout_rounded, color: Colors.white54),
            title: const Text("Log Out",
                style: TextStyle(
                    color: Colors.white54, fontWeight: FontWeight.bold)),
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
      shape:
          RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      leading: Icon(icon,
          color: isActive ? neonGreen : Colors.white54),
      title: Text(title,
          style: TextStyle(
              color: isActive ? Colors.white : Colors.white54,
              fontWeight:
                  isActive ? FontWeight.bold : FontWeight.normal)),
      onTap: () {
        setState(() => _selectedIndex = index);
        Navigator.pop(context);
      },
    );
  }

  Widget _buildSlimRail() {
    return Container(
      width: 60,
      decoration: BoxDecoration(
        color: deepNavy,
        borderRadius: BorderRadius.circular(30),
        boxShadow: const [
          BoxShadow(
              color: Colors.black12, blurRadius: 15, offset: Offset(4, 0))
        ],
      ),
      child: Column(
        children: [
          const SizedBox(height: 30),
          Tooltip(
            message: "Home",
            child: MouseRegion(
              cursor: SystemMouseCursors.click,
              child: GestureDetector(
                onTap: () => setState(() => _selectedIndex = 0),
                child: const Icon(Icons.shield,
                    color: Color(0xFF8FFF00), size: 24),
              ),
            ),
          ),
          const SizedBox(height: 35),
          _sidebarItem(
              icon: Icons.dashboard_rounded, title: "Dashboard", index: 0),
          _sidebarItem(
              icon: Icons.search_rounded,
              title: "Product Research",
              index: 1),
          _sidebarItem(
              icon: Icons.text_fields_rounded,
              title: "Title Builder",
              index: 2),
          _sidebarItem(
              icon: Icons.calculate_rounded,
              title: "Profit Calculator",
              index: 3),
          _sidebarItem(
              icon: Icons.inventory_2_rounded,
              title: "Inventory",
              index: 4),
          _sidebarItem(
              icon: Icons.radar_rounded,
              title: "Competitor Research",
              index: 5),
          _sidebarItem(
              icon: Icons.shield_outlined, title: "Orders", index: 6),
          _sidebarItem(
              icon: Icons.insights, title: "Analytics", index: 7),
          const Spacer(),
          _sidebarItem(
              icon: Icons.settings_rounded, title: "Settings", index: 8),
          if (isOwner)
            _sidebarItem(
                icon: Icons.admin_panel_settings_rounded,
                title: "Admin Center",
                index: 9),
          const SizedBox(height: 10),
          IconButton(
              onPressed: _logout,
              icon: const Icon(Icons.logout_rounded,
                  color: Colors.white54, size: 20)),
          const SizedBox(height: 25),
        ],
      ),
    );
  }

  Widget _sidebarItem(
      {required IconData icon,
      required String title,
      required int index}) {
    final bool isActive = _selectedIndex == index;
    return Tooltip(
      message: title,
      child: InkWell(
        onTap: () => setState(() => _selectedIndex = index),
        hoverColor: Colors.transparent,
        child: SizedBox(
          height: 52,
          width: 60,
          child: Stack(
            alignment: Alignment.center,
            children: [
              if (isActive)
                Positioned(
                  left: 0,
                  child: Container(
                    width: 3,
                    height: 24,
                    decoration: BoxDecoration(
                      color: neonGreen,
                      borderRadius: const BorderRadius.only(
                        topRight: Radius.circular(10),
                        bottomRight: Radius.circular(10),
                      ),
                      boxShadow: [
                        BoxShadow(
                            color: neonGreen.withAlpha(200),
                            blurRadius: 10)
                      ],
                    ),
                  ),
                ),
              TweenAnimationBuilder<double>(
                tween: Tween(begin: 0.8, end: isActive ? 1.0 : 0.8),
                duration: const Duration(milliseconds: 500),
                curve: Curves.elasticOut,
                builder: (context, scale, child) => Transform.scale(
                    scale: isActive ? scale : 1.0, child: child),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isActive
                        ? neonGreen.withAlpha(40)
                        : Colors.transparent,
                  ),
                  child: Icon(icon,
                      color: isActive ? neonGreen : Colors.white54,
                      size: isActive ? 22 : 20),
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
      case 0:
        return DashboardHome(
          onGoToOrders: () => setState(() => _selectedIndex = 6),
          onGoToAnalytics: () => setState(() => _selectedIndex = 8),
        );
      case 1:
        return const ProductResearchMaster();
      case 2:
        return const TitleBuilderMain();
      case 3:
        return const ProfitCalculatorPage();
      case 4:
        return const InventoryPage();
      case 5:
        return const CompetitorResearchMain();
      case 6:
        return const OrdersDashboard();
      case 7:
        return const AnalyticsDashboard();
      case 8:
        return const UserProfilePage();
      case 9:
        return isOwner
            ? const AdminManagementPage()
            : const Center(
                child: Text("404",
                    style: TextStyle(color: Colors.grey)));
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildDashboardHome() {
    final String rawName =
        user?.userMetadata?['full_name']?.toString() ?? "";
    final String displayName =
        rawName.isNotEmpty ? rawName : "Seller";
    return SingleChildScrollView(
      padding:
          const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Welcome back, $displayName! 👋",
              style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E293B))),
          const SizedBox(height: 40),
          Wrap(
            spacing: 20,
            runSpacing: 20,
            children: [
              _buildStatCard("Total Revenue", "\$12,450.00", "+14.5%",
                  Icons.attach_money),
              _buildStatCard(
                  "Active Listings", "842", "+12", Icons.inventory_2_outlined),
              _buildStatCard("Net Profit", "\$4,120.50", "+8.2%",
                  Icons.trending_up,
                  isHighlight: true),
              _buildStatCard("Pending Orders", "18", "Needs shipping",
                  Icons.local_shipping_outlined),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
      String title, String value, String subtitle, IconData icon,
      {bool isHighlight = false}) {
    return Container(
      width: 250,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: isHighlight ? neonGreen : Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: isHighlight
            ? [
                BoxShadow(
                    color: neonGreen.withAlpha(77),
                    blurRadius: 20,
                    offset: const Offset(0, 10))
              ]
            : [],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title,
                  style: TextStyle(
                      color: isHighlight
                          ? Colors.black87
                          : const Color(0xFF64748B),
                      fontWeight: FontWeight.w600)),
              Icon(icon,
                  color: isHighlight
                      ? Colors.black
                      : const Color(0xFF64748B),
                  size: 20),
            ],
          ),
          const SizedBox(height: 15),
          Text(value,
              style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: isHighlight
                      ? Colors.black
                      : const Color(0xFF1E293B))),
          const SizedBox(height: 5),
          Text(subtitle,
              style: TextStyle(
                  fontSize: 13,
                  color: isHighlight
                      ? Colors.black54
                      : Colors.green.shade600,
                  fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}