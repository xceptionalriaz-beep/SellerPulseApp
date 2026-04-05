import 'package:flutter/material.dart';
import '../widgets/page_wrapper.dart'; // Using your existing wrapper!

class OwnerDashboardPage extends StatefulWidget {
  const OwnerDashboardPage({super.key});

  @override
  State<OwnerDashboardPage> createState() => _OwnerDashboardPageState();
}

class _OwnerDashboardPageState extends State<OwnerDashboardPage> {
  // eBay API Controllers
  final TextEditingController _ebayClientIdController = TextEditingController();
  final TextEditingController _ebayClientSecretController = TextEditingController();
  
  // Amazon API Controllers (For Future Proofing)
  final TextEditingController _amazonAppIdController = TextEditingController();
  final TextEditingController _amazonSecretController = TextEditingController();

  bool _obscureEbaySecret = true;
  bool _obscureAmazonSecret = true;

  @override
  void dispose() {
    _ebayClientIdController.dispose();
    _ebayClientSecretController.dispose();
    _amazonAppIdController.dispose();
    _amazonSecretController.dispose();
    super.dispose();
  }

  void _saveKeys(String platform) {
    // This is just the UI simulation. Later, this will save to Firebase!
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text("🔐 $platform API Keys safely encrypted and stored!"),
        backgroundColor: const Color(0xFF16A34A),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return PageWrapper(
      child: LayoutBuilder(
        builder: (context, constraints) {
          bool isDesktop = constraints.maxWidth > 800;

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ✨ HEADER SECTION
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [BoxShadow(color: const Color(0xFF8FFF00).withAlpha(50), blurRadius: 10, spreadRadius: 1)],
                    ),
                    child: const Icon(Icons.admin_panel_settings_rounded, color: Color(0xFF8FFF00), size: 28),
                  ),
                  const SizedBox(width: 16),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Owner API Command Center",
                        style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                      ),
                      Text(
                        "Securely manage platform connections. These keys are hidden from regular users.",
                        style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 30),

              // ✨ API CARDS GRID
              Expanded(
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  child: isDesktop
                      ? Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(child: _buildEbayCard()),
                            const SizedBox(width: 24),
                            Expanded(child: _buildAmazonCard()),
                          ],
                        )
                      : Column(
                          children: [
                            _buildEbayCard(),
                            const SizedBox(height: 24),
                            _buildAmazonCard(),
                          ],
                        ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  // ✨ EBAY CONFIGURATION CARD
  Widget _buildEbayCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.shopping_bag_outlined, color: Color(0xFF0F172A))),
              const SizedBox(width: 12),
              const Text("eBay Developer API", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              const Spacer(),
              Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: const Color(0xFFDCFCE7), borderRadius: BorderRadius.circular(20)), child: const Text("Active", style: TextStyle(color: Color(0xFF16A34A), fontSize: 12, fontWeight: FontWeight.bold))),
            ],
          ),
          const SizedBox(height: 8),
          const Text("Required to fetch live product data, titles, VeRO checks, and current sale prices.", style: TextStyle(fontSize: 13, color: Color(0xFF64748B))),
          const SizedBox(height: 24),
          
          _buildInputField("Client ID (App ID)", "Enter your eBay App ID", _ebayClientIdController, false),
          const SizedBox(height: 16),
          _buildInputField("Client Secret (Cert ID)", "Enter your highly confidential Secret", _ebayClientSecretController, true, 
            isObscured: _obscureEbaySecret, 
            onToggleVisibility: () => setState(() => _obscureEbaySecret = !_obscureEbaySecret)
          ),
          
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity, height: 45,
            child: ElevatedButton(
              onPressed: () => _saveKeys("eBay"),
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
              child: const Text("Save & Authenticate eBay", style: TextStyle(color: Color(0xFF8FFF00), fontWeight: FontWeight.bold)),
            ),
          )
        ],
      ),
    );
  }

  // ✨ AMAZON CONFIGURATION CARD (For Future Upgrades)
  Widget _buildAmazonCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.inventory_2_outlined, color: Color(0xFF0F172A))),
              const SizedBox(width: 12),
              const Text("Amazon SP-API", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              const Spacer(),
              Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(20)), child: const Text("Not Configured", style: TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.bold))),
            ],
          ),
          const SizedBox(height: 8),
          const Text("Required to unlock Amazon FBA calculators, BSR history, and fee estimates.", style: TextStyle(fontSize: 13, color: Color(0xFF64748B))),
          const SizedBox(height: 24),
          
          _buildInputField("SP-API App ID", "Enter your Amazon App ID", _amazonAppIdController, false),
          const SizedBox(height: 16),
          _buildInputField("AWS Client Secret", "Enter your AWS IAM Secret", _amazonSecretController, true, 
            isObscured: _obscureAmazonSecret, 
            onToggleVisibility: () => setState(() => _obscureAmazonSecret = !_obscureAmazonSecret)
          ),
          
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity, height: 45,
            child: ElevatedButton(
              onPressed: () => _saveKeys("Amazon"),
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF8FAFC), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)), elevation: 0, side: const BorderSide(color: Color(0xFFE2E8F0))),
              child: const Text("Save Amazon Keys", style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold)),
            ),
          )
        ],
      ),
    );
  }

  // ✨ REUSABLE INPUT FIELD WIDGET
  Widget _buildInputField(String label, String hint, TextEditingController controller, bool isPassword, {bool isObscured = false, VoidCallback? onToggleVisibility}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          obscureText: isPassword && isObscured,
          style: const TextStyle(fontSize: 14, color: Color(0xFF0F172A)),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF0F172A))),
            suffixIcon: isPassword 
              ? IconButton(
                  icon: Icon(isObscured ? Icons.visibility_off_outlined : Icons.visibility_outlined, color: const Color(0xFF94A3B8), size: 20),
                  onPressed: onToggleVisibility,
                )
              : null,
          ),
        ),
      ],
    );
  }
}