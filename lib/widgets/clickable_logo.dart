import 'package:flutter/material.dart';
import '../pages/landing_page.dart'; 

class ClickableLogo extends StatelessWidget {
  final double iconSize;
  final double fontSize;

  const ClickableLogo({
    super.key, 
    this.iconSize = 32.0, // Default size
    this.fontSize = 24.0, // Default text size
  });

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: () {
          // The magic routing code that takes them back to the Landing Page
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (context) => const PublicLandingPage()),
            (route) => false, 
          );
        },
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min, // Keeps the click area tight around the logo
          children: [
            Icon(Icons.shield, color: Colors.black, size: iconSize),
            const SizedBox(width: 8),
            Text(
              "SellerPulse", 
              style: TextStyle(fontSize: fontSize, fontWeight: FontWeight.bold, color: Colors.black)
            ),
          ],
        ),
      ),
    );
  }
}