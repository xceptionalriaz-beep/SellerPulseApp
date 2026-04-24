import 'package:flutter/material.dart';
import '../sections/hero_banner.dart'; 
import '../sections/trust_strip.dart'; 
import '../sections/problem_section.dart';
import '../sections/feature_showcase.dart';
import '../sections/pricing_section.dart'; 
import '../widgets/animated_cta_button.dart';
import 'signup_page.dart'; 
import 'login_page.dart'; // ✨ NEW: Imported the Login Page

class PublicLandingPage extends StatelessWidget {
  const PublicLandingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), 
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
          Center(
            child: Container(
              constraints: const BoxConstraints(maxWidth: 1200), 
              margin: const EdgeInsets.symmetric(horizontal: 20), 
              padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF8FFF00), 
                borderRadius: BorderRadius.circular(50), 
                boxShadow: const [
                  BoxShadow(color: Color(0x1A000000), blurRadius: 20, offset: Offset(0, 10)),
                ],
              ),
              child: Row(
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
                      // --- ✨ NAVIGATION TO LOGIN PAGE ✨ ---
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
                      // ------------------------------------
                      
                      const SizedBox(width: 15),
                      
                      // --- ✨ NAVIGATION TO SIGNUP PAGE ✨ ---
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
                      // -----------------------------------
                    ],
                  ),
                ],
              ),
            ),
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

  // Helper to keep the menu code clean
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
}