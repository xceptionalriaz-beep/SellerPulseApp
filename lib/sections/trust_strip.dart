import 'package:flutter/material.dart';

class TrustStrip extends StatelessWidget {
  const TrustStrip({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 40),
      decoration: const BoxDecoration(
        color: Color(0xFFFFFFFF),
        border: Border(
          top: BorderSide(color: Color(0xFFE2E8F0)),
          bottom: BorderSide(color: Color(0xFFE2E8F0)),
        ),
      ),
      child: Column(
        children: [
          const Text(
            "TRUSTED BY DROPSHIPPERS & WHOLESALE SELLERS WORLDWIDE",
            style: TextStyle(
              color: Color(0xFF64748B), 
              fontSize: 12, 
              fontWeight: FontWeight.bold, 
              letterSpacing: 1.5
            ),
          ),
          const SizedBox(height: 30),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildTrustLogo(Icons.shopping_cart, "eBay Sellers"),
              const SizedBox(width: 60),
              _buildTrustLogo(Icons.local_shipping, "AliExpress Sync"),
              const SizedBox(width: 60),
              _buildTrustLogo(Icons.storefront, "Shopify Integrations"),
            ],
          )
        ],
      ),
    );
  }

  // A small helper widget just for this file
  Widget _buildTrustLogo(IconData icon, String label) {
    return Row(
      children: [
        Icon(icon, color: Colors.grey, size: 28),
        const SizedBox(width: 8),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 18, fontWeight: FontWeight.w600)),
      ],
    );
  }
}