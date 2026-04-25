import 'package:flutter/material.dart';

class ProfileDrawer extends StatelessWidget {
  const ProfileDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: Colors.white,
      surfaceTintColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.horizontal(left: Radius.circular(24)),
      ),
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // --- 1. HEADER (Identity) ---
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 30, 24, 20),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: const Color(0xFF8FFF00),
                    child: const Text(
                      "R",
                      style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "Reaz Uddin", 
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 2),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F172A),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            "SellerPulse Pro",
                            style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900),
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.grey),
                    onPressed: () => Navigator.of(context).pop(),
                  )
                ],
              ),
            ),
            
            const Divider(color: Color(0xFFF1F5F9), thickness: 1.5, height: 1),

            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 10),
                children: [
                  // --- 2. THE RESEARCH VAULT ---
                  _buildSectionHeader("RESEARCH VAULT"),
                  _buildMenuItem(Icons.bookmark_outlined, "Saved Products", "12 items tracked", const Color(0xFF6366F1)),
                  _buildMenuItem(Icons.storefront, "Watched Sellers", "3 power sellers", const Color(0xFFEC4899)),
                  _buildMenuItem(Icons.history, "Search History", "Recent queries", Colors.blueGrey),

                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 10),
                    child: Divider(color: Color(0xFFF1F5F9), thickness: 1.5),
                  ),

                  // --- 3. MARKETPLACE PREFERENCES ---
                  _buildSectionHeader("MARKETPLACE SETTINGS"),
                  _buildMenuItem(Icons.public, "Default Marketplace", "eBay US (ebay.com)", Colors.grey.shade700),
                  _buildMenuItem(Icons.attach_money, "Display Currency", "USD (\$)", Colors.grey.shade700),
                  
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 10),
                    child: Divider(color: Color(0xFFF1F5F9), thickness: 1.5),
                  ),

                  // --- 4. SUBSCRIPTION & LIMITS ---
                  _buildSectionHeader("USAGE & BILLING"),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: const [
                              Text("Market Scans", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B))),
                              Text("84 / 100", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF6366F1))),
                            ],
                          ),
                          const SizedBox(height: 10),
                          LinearProgressIndicator(
                            value: 0.84,
                            backgroundColor: Colors.grey.shade200,
                            color: const Color(0xFF6366F1),
                            minHeight: 6,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          const SizedBox(height: 14),
                          SizedBox(
                            width: double.infinity,
                            child: OutlinedButton(
                              onPressed: () {},
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: Color(0xFF0F172A)),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                              ),
                              child: const Text("Manage Subscription", style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold)),
                            ),
                          )
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // --- 5. LOGOUT FOOTER ---
            const Divider(color: Color(0xFFF1F5F9), thickness: 1.5, height: 1),
            Padding(
              padding: const EdgeInsets.all(24),
              child: InkWell(
                onTap: () {
                  // Logout logic here
                },
                child: Row(
                  children: const [
                    Icon(Icons.logout, color: Colors.redAccent, size: 20),
                    SizedBox(width: 12),
                    Text("Sign Out", style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 15)),
                  ],
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 15, 24, 5),
      child: Text(
        title,
        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFF94A3B8), letterSpacing: 1.2),
      ),
    );
  }

  Widget _buildMenuItem(IconData icon, String title, String subtitle, Color iconColor) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 2),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: iconColor.withAlpha(20),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(icon, color: iconColor, size: 18),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF1E293B))),
      subtitle: Text(subtitle, style: TextStyle(fontSize: 11, color: Colors.grey.shade500, fontWeight: FontWeight.w500)),
      trailing: const Icon(Icons.chevron_right, size: 18, color: Color(0xFFCBD5E1)),
      onTap: () {
        // Handle click
      },
    );
  }
}