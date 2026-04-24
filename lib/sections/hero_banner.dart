import 'package:flutter/material.dart';
import '../widgets/animated_cta_button.dart';
import '../pages/signup_page.dart';

class HeroBanner extends StatelessWidget {
  const HeroBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.only(top: 80, bottom: 60, left: 20, right: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Text(
            "Stop leaving your profit on the table.",
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 56, fontWeight: FontWeight.bold, color: Color(0xFF1E293B), height: 1.1),
          ),
          const SizedBox(height: 24),
          const Text(
            "The all-in-one toolkit to find winning products, audit hidden ad fees,\nand block eBay scammers before you ever ship a box.",
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 20, color: Color(0xFF64748B), height: 1.5), 
          ),
          const SizedBox(height: 40),
          
          // --- ✨ THE CONNECTED ANIMATED BUTTON ✨ ---
          AnimatedCtaButton(
            text: "Start My Free 7-Day Trial",
            onPressed: () {
              // This is the bridge that slides the user to the Signup Page!
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const SignupPage()),
              );
            },
          ),
          // ----------------------------------------------
          
          const SizedBox(height: 16),
          const Text("No credit card required. Cancel anytime.", style: TextStyle(color: Color(0xFF64748B), fontSize: 14)),
        ],
      ),
    );
  }
}