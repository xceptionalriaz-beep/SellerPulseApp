import 'package:flutter/material.dart';
import '../sections/hero_banner.dart'; 
import '../sections/trust_strip.dart'; 
import '../sections/problem_section.dart';
import '../sections/feature_showcase.dart';
import '../sections/pricing_section.dart'; 
import '../widgets/animated_cta_button.dart';
import 'signup_page.dart'; 
import 'login_page.dart'; 

class PublicLandingPage extends StatelessWidget {
  const PublicLandingPage({super.key});

  @override
  Widget build(BuildContext context) {
    // ✨ 1. THE BREAKPOINT: Determines if we are on Mobile or Desktop
    final bool isDesktop = MediaQuery.of(context).size.width > 900;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), 
      // ✨ 2. THE DRAWER: Only attach the drawer if we are on a smaller screen
      drawer: !isDesktop ? _buildDrawer(context) : null,
      body: Column(
        children: [
          // 1. TOP ANNOUNCEMENT BAR
          Container(
            width: double.infinity,
            color: const Color(0xFF1E293B), 
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: const Text(
              "🚀 Launch Special: Get 50% off your first 3 months!",
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500),
            ),
          ),

          const SizedBox(height: 12), 

          // 2. THE PROPORTIONAL, FLOATING PILL HEADER
          // We wrap this in a Builder so the Hamburger Icon can find the Scaffold to open the Drawer
          Builder(
            builder: (BuildContext innerContext) {
              return Center(
                child: Container(
                  constraints: const BoxConstraints(maxWidth: 1200), 
                  margin: const EdgeInsets.symmetric(horizontal: 20), 
                  // Slightly tighter padding on mobile to fit the button and logo
                  padding: EdgeInsets.symmetric(horizontal: isDesktop ? 30 : 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF8FFF00), 
                    borderRadius: BorderRadius.circular(50), 
                    boxShadow: const [
                      BoxShadow(color: Color(0x1A000000), blurRadius: 20, offset: Offset(0, 10)),
                    ],
                  ),
                  // ✨ 3. DYNAMIC HEADER SWAP
                  child: isDesktop ? _buildDesktopHeader(innerContext) : _buildMobileHeader(innerContext),
                ),
              );
            }
          ),
          
          const SizedBox(height: 30),
          
          // 3. SCROLLABLE CONTENT 
          const Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  HeroBanner(), 
                  TrustStrip(), 
                  ProblemSection(),
                  FeatureShowcase(),
                  PricingSection(), 
                ],
              ), 
            ),
          )
        ],
      ),
    );
  }

  // ===========================================================================
  // 🖥️ DESKTOP HEADER (Wide & Spacious)
  // ===========================================================================
  Widget _buildDesktopHeader(BuildContext context) {
    return Row(
      children: [
        // GROUP 1: LOGO
        const Row(
          children: [
            Icon(Icons.shield, color: Colors.black, size: 28),
            SizedBox(width: 8),
            Text("SellerPulse", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.black)),
          ],
        ),
        
        const SizedBox(width: 40), 
        
        // GROUP 2: MENU LINKS
        Row(
          children: [
            _navLink("Features", hasArrow: true),
            const SizedBox(width: 25), 
            _navLink("Free Tools"),
            const SizedBox(width: 25),
            _navLink("Integrations"),
            const SizedBox(width: 25),
            _navLink("Resources"),
            const SizedBox(width: 25),
            _navLink("Pricing"),
          ],
        ),
        
        const Spacer(), 
        
        // GROUP 3: ACTIONS
        Row(
          children: [
            TextButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const LoginPage()),
                );
              }, 
              child: const Row(
                children: [
                  Icon(Icons.person, color: Colors.black, size: 20), 
                  SizedBox(width: 6),
                  Text("Sign in", style: TextStyle(color: Colors.black, fontSize: 16, fontWeight: FontWeight.bold)),
                ],
              )
            ),
            
            const SizedBox(width: 15),
            
            AnimatedCtaButton(
              text: "Start Free Trial",
              isSmall: true, 
              hoverColor: Colors.white,
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const SignupPage()),
                );
              },
            ),
          ],
        ),
      ],
    );
  }

  // ===========================================================================
  // 📱 MOBILE HEADER (Compact & Centered)
  // ===========================================================================
  Widget _buildMobileHeader(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // LEFT: Hamburger Menu Icon
        IconButton(
          icon: const Icon(Icons.menu, color: Colors.black, size: 28),
          onPressed: () => Scaffold.of(context).openDrawer(),
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(),
        ),

        // CENTER: Logo (Slightly smaller text to prevent squishing)
        const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.shield, color: Colors.black, size: 24),
            SizedBox(width: 6),
            Text("SellerPulse", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black)),
          ],
        ),

        // RIGHT: CTA Button (Shortened to "Free Trial" to ensure it fits safely on iPhones)
        AnimatedCtaButton(
          text: "Free Trial",
          isSmall: true, 
          hoverColor: Colors.white,
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const SignupPage()),
            );
          },
        ),
      ],
    );
  }

  // ===========================================================================
  // ☰ SIDE DRAWER (Slides out on Mobile)
  // ===========================================================================
  Widget _buildDrawer(BuildContext context) {
    return Drawer(
      backgroundColor: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          DrawerHeader(
            decoration: const BoxDecoration(
              color: Color(0xFF1E293B), // Dark background for the header
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: const BoxDecoration(color: Color(0xFF8FFF00), shape: BoxShape.circle),
                  child: const Icon(Icons.shield, color: Colors.black, size: 28),
                ),
                const SizedBox(height: 12),
                const Text("SellerPulse", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
              ],
            ),
          ),
          
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                _drawerLink(context, "Features", Icons.star_outline),
                _drawerLink(context, "Free Tools", Icons.build_circle_outlined),
                _drawerLink(context, "Integrations", Icons.extension_outlined),
                _drawerLink(context, "Resources", Icons.library_books_outlined),
                _drawerLink(context, "Pricing", Icons.monetization_on_outlined),
                
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                  child: Divider(color: Color(0xFFE2E8F0)),
                ),
                
                // ✨ CRITICAL: Mobile Sign In Button
                ListTile(
                  leading: const Icon(Icons.login, color: Colors.black),
                  title: const Text("Sign In", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.black)),
                  onTap: () {
                    Navigator.pop(context); // Close the drawer first
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const LoginPage()),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Helper for Desktop Links
  Widget _navLink(String text, {bool hasArrow = false}) {
    return TextButton(
      onPressed: () {},
      child: Row(
        children: [
          Text(text, style: const TextStyle(color: Colors.black, fontSize: 16, fontWeight: FontWeight.bold)),
          if (hasArrow) const Icon(Icons.keyboard_arrow_down, color: Colors.black, size: 20),
        ],
      ),
    );
  }

  // Helper for Mobile Drawer Links
  Widget _drawerLink(BuildContext context, String text, IconData icon) {
    return ListTile(
      leading: Icon(icon, color: const Color(0xFF64748B)),
      title: Text(text, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF334155))),
      trailing: const Icon(Icons.chevron_right, size: 16, color: Color(0xFFCBD5E1)),
      onTap: () {
        // Navigation logic for these pages goes here later!
        Navigator.pop(context); 
      },
    );
  }
}