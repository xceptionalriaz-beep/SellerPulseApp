import 'package:flutter/material.dart';

class EbaySearchBar extends StatefulWidget {
  // ✨ UPGRADED: Now sends back Category ID instead of a string category
  final Function(double price, double shipping, String categoryId, String title, String imageUrl, String soldCount) onFetch;
  
  const EbaySearchBar({super.key, required this.onFetch});

  @override
  State<EbaySearchBar> createState() => _EbaySearchBarState();
}

class _EbaySearchBarState extends State<EbaySearchBar> {
  final TextEditingController _urlController = TextEditingController();
  bool _isFetching = false;

  void _simulateFetch() async {
    if (_urlController.text.isEmpty) return;
    
    setState(() => _isFetching = true);

    // ✨ SIMULATE EBAY API DELAY
    await Future.delayed(const Duration(seconds: 2));
    
    // ✨ PASS SMART DUMMY DATA UP TO THE DASHBOARD
    widget.onFetch(
      189.99, 
      0.00, 
      "179697", // ✨ The Numeric Category ID
      "Nike Air Force 1 '07 Premium Men's Casual Shoes White with Velcro Strap", // ✨ Contains Nike & Velcro
      "https://di2ponv0v5otw.cloudfront.net/posts/2021/11/04/6184501a3c64c8d5f3089456/m_61845037ef11cab328f52f36.jpg", // ✨ Real image link
      "5,842"
    );
    
    setState(() => _isFetching = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("✅ Product Fetched! Scanning for VeRO risks..."),
          backgroundColor: Color(0xFF16A34A),
          duration: Duration(seconds: 3),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: SizedBox(
            height: 40,
            child: TextField(
              controller: _urlController,
              style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A)),
              decoration: InputDecoration(
                hintText: "Paste eBay Item URL to Auto-Fill...",
                hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                prefixIcon: const Icon(Icons.link, color: Color(0xFF94A3B8), size: 18),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF8FFF00), width: 1.5)),
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),
        SizedBox(
          height: 40,
          child: ElevatedButton(
            onPressed: _isFetching ? null : _simulateFetch,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0F172A),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              elevation: 0,
            ),
            child: _isFetching 
              ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Color(0xFF8FFF00), strokeWidth: 2))
              : const Text("Fetch", style: TextStyle(color: Color(0xFF8FFF00), fontWeight: FontWeight.bold, fontSize: 13)),
          ),
        )
      ],
    );
  }
}