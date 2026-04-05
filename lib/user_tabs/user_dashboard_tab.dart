import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class UserDashboardTab extends StatefulWidget {
  const UserDashboardTab({super.key});

  @override
  State<UserDashboardTab> createState() => _UserDashboardTabState();
}

class _UserDashboardTabState extends State<UserDashboardTab> {
  final _supabase = Supabase.instance.client;
  final TextEditingController _searchController = TextEditingController();
  
  List<Map<String, dynamic>> _veroDatabase = [];
  bool _isLoading = true;

  // ✨ Dummy products to show your users how the scanner works instantly
  final List<Map<String, String>> _scannedProducts = [
    {'title': 'Wireless Earbuds Pro for iPhone', 'price': '\$24.99', 'image': '📱'},
    {'title': 'Heavy Duty 50ft Garden Hose', 'price': '\$35.00', 'image': '💧'},
    {'title': 'Nike Air Max Running Shoes', 'price': '\$120.00', 'image': '👟'},
    {'title': 'Generic Leather Men\'s Wallet', 'price': '\$18.50', 'image': '👛'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchVeroList();
  }

  // 1. SILENTLY LOAD THE DATABASE IN THE BACKGROUND
  Future<void> _fetchVeroList() async {
    try {
      // Users only need to READ the names and risk levels
      final data = await _supabase.from('vero_brands').select('brand_name, risk_level');
      if (mounted) {
        setState(() {
          _veroDatabase = List<Map<String, dynamic>>.from(data);
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // 2. THE BRAIN: INSTANT TITLE SCANNER
  Map<String, dynamic>? _checkVero(String title) {
    for (var brand in _veroDatabase) {
      String brandName = brand['brand_name'];
      
      // ✨ Smart Regex: Looks for exact whole words only!
      // This stops "Pineapple" from triggering the "Apple" warning.
      RegExp regExp = RegExp(r'\b' + RegExp.escape(brandName) + r'\b', caseSensitive: false);
      
      if (regExp.hasMatch(title)) {
        return brand; // VeRO Match Found!
      }
    }
    return null; // Safe to list!
  }

  // 3. ALLOW USERS TO TEST THEIR OWN TITLES
  void _searchCustomProduct() {
    final title = _searchController.text.trim();
    if (title.isEmpty) return;

    setState(() {
      _scannedProducts.insert(0, {
        'title': title,
        'price': '\$??.??',
        'image': '🔍',
      });
      _searchController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return _isLoading 
      ? const Center(child: CircularProgressIndicator(color: Color(0xFF0F172A)))
      : Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // --- TOP SEARCH BAR ---
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Product Analyzer", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                  const SizedBox(height: 8),
                  const Text("Paste an Amazon/AliExpress title here. We will instantly scan it for VeRO risks before you list it on eBay.", style: TextStyle(color: Color(0xFF64748B), fontSize: 14)),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          onSubmitted: (_) => _searchCustomProduct(),
                          decoration: InputDecoration(
                            hintText: "Try typing 'Apple Watch' or 'Generic Desk'...",
                            prefixIcon: const Icon(Icons.search, color: Color(0xFF64748B)),
                            filled: true, fillColor: const Color(0xFFF8FAFC),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      ElevatedButton(
                        onPressed: _searchCustomProduct,
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A), padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 18), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                        child: const Text("Analyze Title", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                      )
                    ],
                  )
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            const Text("Recent Scans", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
            const SizedBox(height: 16),

            // --- PRODUCT GRID ---
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                  maxCrossAxisExtent: 400,
                  childAspectRatio: 1.2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                ),
                itemCount: _scannedProducts.length,
                itemBuilder: (context, index) {
                  final product = _scannedProducts[index];
                  // ✨ THE MAGIC HAPPENS HERE: Scan the title instantly
                  final veroData = _checkVero(product['title']!);
                  
                  return _buildProductCard(product, veroData);
                },
              ),
            )
          ],
        );
  }

  // --- THE DYNAMIC PRODUCT CARD ---
  Widget _buildProductCard(Map<String, String> product, Map<String, dynamic>? veroData) {
    final bool isSafe = veroData == null;
    final String riskLevel = veroData?['risk_level'] ?? '';
    
    // Determine colors based on risk
    Color borderColor = const Color(0xFFE2E8F0);
    Color badgeColor = const Color(0xFF10B981); // Green for safe
    String badgeText = "100% Safe to List";
    IconData badgeIcon = Icons.check_circle;
    String warningMessage = "";

    if (!isSafe) {
      if (riskLevel == 'Critical Ban') {
        borderColor = Colors.redAccent;
        badgeColor = Colors.redAccent;
        badgeText = "CRITICAL VERO BAN";
        badgeIcon = Icons.warning_rounded;
        warningMessage = "DANGER: Do not list this item! This brand actively issues instant VeRO strikes that can permanently suspend your eBay account.";
      } else if (riskLevel == 'High Risk') {
        borderColor = Colors.orange;
        badgeColor = Colors.orange;
        badgeText = "HIGH RISK VERO";
        badgeIcon = Icons.error_outline;
        warningMessage = "WARNING: High chance of a VeRO strike. We highly recommend skipping this product to protect your account.";
      } else {
        borderColor = Colors.amber;
        badgeColor = Colors.amber;
        badgeText = "CAUTION REQUIRED";
        badgeIcon = Icons.info_outline;
        warningMessage = "CAUTION: You can sell this, but do not use their trademarked text or stock images. Take your own photos.";
      }
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor, width: isSafe ? 1 : 2.5),
        boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 8, offset: Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ALERT BANNER
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
            decoration: BoxDecoration(color: badgeColor.withAlpha(20), borderRadius: const BorderRadius.vertical(top: Radius.circular(14))),
            child: Row(
              children: [
                Icon(badgeIcon, color: badgeColor, size: 16),
                const SizedBox(width: 8),
                Text(badgeText, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: badgeColor)),
              ],
            ),
          ),
          
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Fake Product Image/Icon
                  Container(
                    height: 60, width: 60,
                    decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(12)),
                    child: Center(child: Text(product['image']!, style: const TextStyle(fontSize: 28))),
                  ),
                  const SizedBox(height: 12),
                  
                  // Product Title
                  Text(product['title']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF0F172A)), maxLines: 2, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 4),
                  Text(product['price']!, style: const TextStyle(fontSize: 14, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                  
                  const Spacer(),
                  
                  // Explainer Text
                  if (!isSafe)
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(color: badgeColor.withAlpha(15), borderRadius: BorderRadius.circular(8)),
                      child: Text(warningMessage, style: TextStyle(fontSize: 11, color: badgeColor.withAlpha(200), fontWeight: FontWeight.w600, height: 1.3)),
                    )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}