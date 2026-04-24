import 'package:flutter/material.dart';
import '../shared/neon_icon.dart';
import '../shared/universal_scan_button.dart';
import '../shared/animated_action_button.dart'; 

import 'widgets/competitor_xray_card.dart';
import 'widgets/velocity_chart_card.dart';
import 'widgets/profit_calculator_card.dart';
import 'widgets/sourcing_intel_card.dart';
import 'widgets/ai_listing_card.dart';

class ProductDeepDivePage extends StatefulWidget {
  final String productUrl;

  const ProductDeepDivePage({super.key, required this.productUrl});

  @override
  State<ProductDeepDivePage> createState() => _ProductDeepDivePageState();
}

class _ProductDeepDivePageState extends State<ProductDeepDivePage> {
  late TextEditingController _searchController;
  bool _isScraping = false;
  
  // ✨ NEW: This variable holds the dynamic data we pass to the cards!
  Map<String, dynamic>? _scrapedData;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController(text: widget.productUrl);
    if (widget.productUrl.isNotEmpty) {
      _startScrapingEngine(widget.productUrl);
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _startScrapingEngine(String url) async {
    setState(() => _isScraping = true);
    
    // Simulate web scraper time
    await Future.delayed(const Duration(seconds: 2));
    
    // ✨ Dynamic Data Generation based on the URL!
    // In the future, this is where your Supabase Edge Function will run the Python scraper
    setState(() {
      _scrapedData = {
        "title": url.contains("mouse") ? "Wireless Gaming Mouse" : "Dynamic Scraped Product",
        "price": "\$39.99",
        "rawPrice": 39.99, // Needed for math in the profit calculator
        "imageUrl": "https://m.media-amazon.com/images/I/61KxT3YVvVL._AC_SX679_.jpg", // Generic placeholder
        "seller": "EbayProStore",
        "totalSold": "1,425",
        "stockLeft": "2 Left (Low)",
        "veroRisk": "LOW (Safe)",
        "keywords": "\"Wireless\", \"Bluetooth\", \"Pro\"",
        "optimizedTitle": "Premium Dynamic Scraped Product - Free Shipping",
        "suggestedPrice": "\$38.50"
      };
      _isScraping = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const NeonIcon(icon: Icons.search),
              const SizedBox(width: 15),
              const Text("Deep Dive Analysis", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
              const Spacer(),
              
              Container(
                width: 500, height: 50,
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.shade300)),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        decoration: const InputDecoration(
                          hintText: "Paste eBay link...",
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                        ),
                      ),
                    ),
                    UniversalScanButton(
                      text: "SCAN ITEM", width: 120, 
                      onTap: () {
                        if (_searchController.text.isNotEmpty) {
                          _startScrapingEngine(_searchController.text);
                        }
                      }
                    ), 
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          Expanded(
            child: _isScraping 
                ? _buildLoadingState() 
                : _scrapedData == null 
                  ? const Center(child: Text("Paste an eBay link to begin analysis."))
                  : _buildAnalyzedData(),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(color: Color(0xFF8FFF00)),
          const SizedBox(height: 20),
          const Text("🤖 AI is scraping this eBay listing...", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
          const SizedBox(height: 8),
          Text("Analyzing competitors, stock levels, and VERO risk for:\n${_searchController.text}", textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFF64748B))),
        ],
      ),
    );
  }

  Widget _buildAnalyzedData() {
    return Column(
      children: [
        Expanded(
          flex: 4,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(flex: 2, child: CompetitorXrayCard(
                title: _scrapedData!['title'],
                price: _scrapedData!['price'],
                imageUrl: _scrapedData!['imageUrl'],
                seller: _scrapedData!['seller'],
              )),
              SizedBox(width: 20),
              Expanded(flex: 3, child: VelocityChartCard(
                totalSold: _scrapedData!['totalSold']
              )),
            ],
          ),
        ),
        const SizedBox(height: 20),
        Expanded(
          flex: 5,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(child: ProfitCalculatorCard(
                salePrice: _scrapedData!['rawPrice']
              )),
              SizedBox(width: 20),
              Expanded(child: SourcingIntelCard(
                stockLeft: _scrapedData!['stockLeft'],
                veroRisk: _scrapedData!['veroRisk'],
                keywords: _scrapedData!['keywords']
              )),
              SizedBox(width: 20),
              Expanded(child: AiListingCard(
                optimizedTitle: _scrapedData!['optimizedTitle'],
                suggestedPrice: _scrapedData!['suggestedPrice']
              )),
            ],
          ),
        ),
        const SizedBox(height: 15),
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            const Icon(Icons.bolt, color: Colors.amber, size: 20),
            const SizedBox(width: 5),
            const Text("QUICK ACTIONS: ", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
            const SizedBox(width: 15),
            AnimatedActionButton(icon: Icons.save, label: "Save", onTap: () {}),
            const SizedBox(width: 10),
            AnimatedActionButton(icon: Icons.download, label: "Images", onTap: () {}),
            const SizedBox(width: 10),
            AnimatedActionButton(icon: Icons.table_view, label: "CSV", onTap: () {}),
          ],
        )
      ],
    );
  }
}