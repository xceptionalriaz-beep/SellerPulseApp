import 'package:flutter/material.dart';

class UserProfilePage extends StatefulWidget {
  const UserProfilePage({super.key});

  @override
  State<UserProfilePage> createState() => _UserProfilePageState();
}

class _UserProfilePageState extends State<UserProfilePage> {
  int _selectedSettingsTab = 0;

  @override
  Widget build(BuildContext context) {
    // The main background is slightly off-white so the white cards pop!
    return Container(
      color: const Color(0xFFF4F7FA),
      padding: const EdgeInsets.all(24),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // --- 1. FLOATING SIDEBAR MENU ---
          Container(
            width: 260,
            padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(color: Colors.black.withAlpha(10), blurRadius: 15, offset: const Offset(0, 5))
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Padding(
                  padding: EdgeInsets.only(left: 10, bottom: 20),
                  child: Text("Settings", style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                ),
                _buildNavTab(0, Icons.person_outline, "Overview"),
                _buildNavTab(1, Icons.public, "Marketplace Config"),
                _buildNavTab(2, Icons.bookmark_outline, "Research Vault"),
                _buildNavTab(3, Icons.credit_card, "Billing & Usage"),
                _buildNavTab(4, Icons.security, "Security"),
              ],
            ),
          ),

          const SizedBox(width: 24), // Gap between menu and content

          // --- 2. MAIN CONTENT AREA ---
          Expanded(
            child: SingleChildScrollView(
              child: _buildTabContent(),
            ),
          )
        ],
      ),
    );
  }

  // Sidebar Menu Item Builder
  Widget _buildNavTab(int index, IconData icon, String title) {
    final bool isActive = _selectedSettingsTab == index;
    return InkWell(
      onTap: () => setState(() => _selectedSettingsTab = index),
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        margin: const EdgeInsets.only(bottom: 8),
        decoration: BoxDecoration(
          // ✨ Dark pill for active state, just like your reference image!
          color: isActive ? const Color(0xFF0F172A) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, size: 20, color: isActive ? Colors.white : const Color(0xFF64748B)),
            const SizedBox(width: 12),
            Text(
              title, 
              style: TextStyle(
                fontWeight: isActive ? FontWeight.bold : FontWeight.w600,
                color: isActive ? Colors.white : const Color(0xFF64748B),
                fontSize: 14,
              )
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabContent() {
    switch (_selectedSettingsTab) {
      case 0: return _buildOverviewTab();
      case 1: return const Center(child: Text("Marketplace Config"));
      default: return const Center(child: Text("Coming Soon"));
    }
  }

  // --- THE NEW "CARD BASED" OVERVIEW TAB ---
  Widget _buildOverviewTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // CARD 1: Profile Header
        _buildContentCard(
          child: Column(
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: const Color(0xFFE2E8F0),
                    backgroundImage: const NetworkImage('https://i.pravatar.cc/150?img=11'), // Placeholder avatar
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("Reaz Uddin", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.star, color: Colors.amber, size: 18),
                            const SizedBox(width: 4),
                            const Text("Pro Member", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                            const SizedBox(width: 16),
                            const Icon(Icons.cake, color: Colors.grey, size: 16),
                            const SizedBox(width: 4),
                            const Text("Joined April 2024", style: TextStyle(color: Colors.grey)),
                            const SizedBox(width: 12),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: const Color(0xFFEBF6D4), borderRadius: BorderRadius.circular(6)),
                              child: const Text("Active Subscription", style: TextStyle(color: Color(0xFF16A34A), fontSize: 11, fontWeight: FontWeight.bold)),
                            )
                          ],
                        )
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.edit, size: 18, color: Color(0xFF0F172A)),
                      label: const Text("Edit Profile", style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold)),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: const BorderSide(color: Color(0xFFE2E8F0)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.shopping_cart_checkout, size: 18, color: Colors.black),
                      label: const Text("Connect eBay Store", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF8FFF00),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        elevation: 0,
                      ),
                    ),
                  )
                ],
              )
            ],
          ),
        ),

        const SizedBox(height: 24),

        // CARD 2: Quick Analytics (Like the reference image)
        _buildContentCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Usage & Analytics", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildStatColumn("Market Scans", "84 / 100", Icons.search),
                  _buildStatColumn("Saved Products", "12", Icons.bookmark),
                  _buildStatColumn("Tracked Sellers", "3", Icons.storefront),
                  _buildStatColumn("Safe Sourcing", "98%", Icons.shield),
                ],
              ),
            ],
          )
        ),

        const SizedBox(height: 24),

        // CARD 3: Internal Notes / Private Settings
        _buildContentCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Private Notes / Global Blocklist", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              const SizedBox(height: 16),
              TextField(
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: "Add keywords you always want to block (e.g., Apple, Nike)...",
                  hintStyle: const TextStyle(color: Colors.grey, fontSize: 14),
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                ),
              ),
            ],
          )
        )
      ],
    );
  }

  // Helper to draw the white cards with shadows
  Widget _buildContentCard({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 10, offset: const Offset(0, 4))
        ],
      ),
      child: child,
    );
  }

  Widget _buildStatColumn(String label, String value, IconData icon) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 16, color: Colors.grey),
            const SizedBox(width: 6),
            Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.w600)),
          ],
        ),
        const SizedBox(height: 8),
        Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
      ],
    );
  }
}