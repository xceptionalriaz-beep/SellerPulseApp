import 'package:flutter/material.dart';
import 'command_center.dart';
import 'pro_dashboard.dart';
import '../widgets/math_engine.dart'; 
import '../widgets/page_wrapper.dart'; 
import '../widgets/ebay_search_bar.dart'; 

class ProfitCalculatorPage extends StatefulWidget {
  const ProfitCalculatorPage({super.key});
  @override State<ProfitCalculatorPage> createState() => _ProfitCalculatorPageState();
}

class _ProfitCalculatorPageState extends State<ProfitCalculatorPage> {
  String _activeCountry = "US"; 
  double _itemCost = 0.0, _shippingCost = 0.0, _salePrice = 0.0, _buyerShipping = 0.0; 
  String _selectedCategory = "Other Categories (Default) - 13.25%";
  String _storeTier = "No Store", _sellerLevel = "Standard";
  double _adRate = 0.0, _taxRate = 8.0; 
  String _paymentProcessor = "Managed"; 
  final List<String> _processors = ["Managed", "PayPal"];
  bool _isInternational = false;

  final TextEditingController _salePriceController = TextEditingController();
  final TextEditingController _buyerShippingController = TextEditingController();

  // ✨ NEW STATE VARIABLES FOR THE BOTTOM BAR
  bool _hasFetchedProduct = false;
  String _fetchedTitle = "";
  String _fetchedImageUrl = "";
  String _fetchedSoldCount = "";
  bool _hasVeroRisk = false;

  // ✨ THE MASTER VERO DATABASE (Expanded)
  final List<String> _veroKeywords = [
    'apple', 'nike', 'velcro', 'rolex', 'gucci', 'adidas', 'bluetooth', 'onesie', 
    'yeti', 'popsocket', 'canon', 'sony', 'bose', 'fitbit', 'gopro', 'ugg', 'zippo',
    'louis vuitton', 'chanel', 'prada', 'hermes', 'burberry', 'ray-ban', 'oakley'
  ];

  // ✨ THE SMART CATEGORY MAPPER
  final Map<String, String> _ebayCategoryMap = {
    "179697": "Consumer Electronics - 9.00%",
    "15032": "Cell Phones & Smartphones - 9.00%",
    "11450": "Clothing, Shoes & Accessories - 13.25%",
    "260324": "Athletic Shoes (Over \$150) - 8.00%",
  };

  final Map<String, double> _categoryFees = { 
    "Other Categories (Default) - 13.25%": 13.25, "Books, Magazines, Movies, Music - 14.95%": 14.95, 
    "Music > Records - 13.25%": 13.25, "Cameras & Photos - 9.00%": 9.00,
    "Cell Phones & Smartphones - 9.00%": 9.00, "Computers/Tablets & Networking - 9.00%": 9.00,
    "Consumer Electronics - 9.00%": 9.00, "Video Games > Consoles - 9.00%": 9.00,
    "Video Games > Games - 13.25%": 13.25, "Clothing, Shoes & Accessories - 13.25%": 13.25,
    "Women's Bags (Over \$2k) - 9.00%": 9.00, "Athletic Shoes (Over \$150) - 8.00%": 8.00,
    "Jewelry & Watches - 13.25%": 13.25, "Watches (Under \$1k) - 15.00%": 15.00,
    "Watches (Over \$1k) - 6.50%": 6.50, "Guitars & Basses - 6.35%": 6.35,
    "Heavy Equipment, Food Trucks - 3.00%": 3.00, "eBay Motors > Parts & Accessories - 13.25%": 13.25,
    "Automotive Tools & Supplies - 10.00%": 10.00, "eBay Motors > Tires - 9.50%": 9.50
  };

  final List<String> _storeTiers = ["No Store", "Basic Store (-1.25% Fee)", "Premium Store (-1.25% Fee)"];
  final List<String> _sellerLevels = ["Standard", "Top Rated Plus (-10% Final Fee)", "Below Standard (+6% Penalty)"];

  String get _currency { switch (_activeCountry) { case "UK": return "£"; case "DE": case "FR": case "IT": case "ES": return "€"; case "AU": return "A\$"; case "CA": return "C\$"; default: return "\$"; } }

  // ✨ UPGRADED FETCH HANDLER
  void _handleProductFetched(double price, double shipping, String categoryId, String title, String imageUrl, String soldCount) {
    setState(() {
      _salePrice = price;
      _buyerShipping = shipping;
      
      // ✨ MAGIC MAPPING
      _selectedCategory = _ebayCategoryMap[categoryId] ?? "Other Categories (Default) - 13.25%";
      
      _salePriceController.text = price.toStringAsFixed(2);
      _buyerShippingController.text = shipping.toStringAsFixed(2);
      
      // Update the bottom bar data
      _fetchedTitle = title;
      _fetchedImageUrl = imageUrl;
      _fetchedSoldCount = soldCount;
      _hasFetchedProduct = true;

      // Scan title to see if it triggers the red warning UI
      _hasVeroRisk = _checkIfTitleHasVero(title);
    });
  }

  // ✨ VERO ENGINE: Checks if title contains bad words
  bool _checkIfTitleHasVero(String title) {
    String lowerTitle = " ${title.toLowerCase()} "; // Pad with spaces to match whole words
    for (String brand in _veroKeywords) {
      if (lowerTitle.contains(" $brand ")) return true;
    }
    return false;
  }

  @override
  void dispose() {
    _salePriceController.dispose();
    _buyerShippingController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    CalculatorResult result = MathEngine.calculate(
      itemCost: _itemCost, shippingCost: _shippingCost, salePrice: _salePrice, buyerShipping: _buyerShipping,
      taxRate: _taxRate, adRate: _adRate, category: _selectedCategory, storeTier: _storeTier,
      sellerLevel: _sellerLevel, country: _activeCountry, paymentProcessor: _paymentProcessor, 
      isInternational: _isInternational, categoryFees: _categoryFees,
    );

    Widget commandCenterPanel = CommandCenter(
      currency: _currency, categoryFees: _categoryFees.keys.toList(), storeTiers: _storeTiers, sellerLevels: _sellerLevels,
      processors: _processors, isInternational: _isInternational, selectedCategory: _selectedCategory,
      selectedStoreTier: _storeTier, selectedSellerLevel: _sellerLevel, selectedProcessor: _paymentProcessor,
      salePriceController: _salePriceController, buyerShippingController: _buyerShippingController,
      onItemCostChanged: (v) => setState(() => _itemCost = v), onShippingCostChanged: (v) => setState(() => _shippingCost = v),
      onSalePriceChanged: (v) => setState(() => _salePrice = v), onBuyerShippingChanged: (v) => setState(() => _buyerShipping = v),
      onCategoryChanged: (v) => setState(() => _selectedCategory = v!), onStoreTierChanged: (v) => setState(() => _storeTier = v!),
      onSellerLevelChanged: (v) => setState(() => _sellerLevel = v!), onAdRateChanged: (v) => setState(() => _adRate = v),
      onTaxRateChanged: (v) => setState(() => _taxRate = v), onProcessorChanged: (v) => setState(() => _paymentProcessor = v!), 
      onInternationalChanged: (v) => setState(() => _isInternational = v), 
    );

    return PageWrapper(
      child: LayoutBuilder(
        builder: (context, constraints) {
          bool isDesktop = constraints.maxWidth > 1000;

          return Column( 
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              
              if (isDesktop)
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Row(
                      children: [
                        Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.analytics, color: Color(0xFF8FFF00), size: 24)),
                        const SizedBox(width: 15),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text("SellerPulse Pro Dashboard", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                            Text("Advanced margin & forecasting for $_activeCountry.", style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
                          ],
                        ),
                      ],
                    ),
                    Expanded(child: Padding(padding: const EdgeInsets.symmetric(horizontal: 60.0), child: EbaySearchBar(onFetch: _handleProductFetched))),
                    Row(children: ["US", "UK", "AU", "CA", "DE", "FR", "IT", "ES"].map((c) => _buildCountryTab(c)).toList())
                  ],
                )
              else
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(8)), child: const Icon(Icons.analytics, color: Color(0xFF8FFF00), size: 24)),
                        const SizedBox(width: 15),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text("SellerPulse Pro Dashboard", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                            Text("Advanced margin & forecasting for $_activeCountry.", style: const TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    EbaySearchBar(onFetch: _handleProductFetched),
                    const SizedBox(height: 16),
                    Wrap(spacing: 8, runSpacing: 8, children: ["US", "UK", "AU", "CA", "DE", "FR", "IT", "ES"].map((c) => _buildCountryTab(c)).toList())
                  ],
                ),
              
              const SizedBox(height: 24),

              if (isDesktop)
                Expanded(
                  child: Column(
                    children: [
                      // The Main Dashboard Layout
                      Expanded(
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start, 
                          children: [
                            Expanded(flex: 4, child: SingleChildScrollView(physics: const BouncingScrollPhysics(), child: commandCenterPanel)),
                            const SizedBox(width: 24), 
                            Expanded(flex: 7, child: ProDashboard(currency: _currency, currentPrice: _salePrice, result: result))
                          ],
                        ),
                      ),
                      // ✨ THE NEW BOTTOM BAR
                      if (_hasFetchedProduct) ...[
                        const SizedBox(height: 16),
                        _buildProductPreviewBar(),
                      ]
                    ],
                  ),
                )
              else
                Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    commandCenterPanel,
                    const SizedBox(height: 24),
                    ProDashboard(currency: _currency, currentPrice: _salePrice, result: result),
                    if (_hasFetchedProduct) ...[
                      const SizedBox(height: 24),
                      _buildProductPreviewBar(),
                    ]
                  ],
                ),
            ],
          );
        }
      ),
    );
  }

  // ✨ THE VERO PRODUCT PREVIEW BAR
  Widget _buildProductPreviewBar() {
    // ✨ THE PROXY BYPASS (Fixes CORS issues for loading real images on web)
    String proxyUrl = "https://wsrv.nl/?url=";
    String displayImage = _fetchedImageUrl.startsWith('http') ? "$proxyUrl${Uri.encodeComponent(_fetchedImageUrl)}" : "";

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        color: _hasVeroRisk ? const Color(0xFFFEF2F2) : Colors.white, // Red tint if dangerous!
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _hasVeroRisk ? Colors.redAccent.withAlpha(100) : const Color(0xFFE2E8F0), width: 2),
        boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))],
      ),
      child: Row(
        children: [
          // 1. Thumbnail Image (✨ NOW USING PROXY)
          Container(
            height: 48, width: 48, clipBehavior: Clip.antiAlias,
            decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(8), border: Border.all(color: const Color(0xFFE2E8F0))),
            child: displayImage.isEmpty 
              ? const Icon(Icons.image_outlined, color: Color(0xFF94A3B8), size: 24)
              : Image.network(displayImage, fit: BoxFit.cover, errorBuilder: (c, e, s) => const Icon(Icons.broken_image_outlined, size: 20)),
          ),
          const SizedBox(width: 16),
          
          // 2. VeRO RichText Title
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (_hasVeroRisk)
                  const Padding(
                    padding: EdgeInsets.only(bottom: 4),
                    child: Row(children: [Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 14), SizedBox(width: 4), Text("VeRO Risk Detected", style: TextStyle(color: Colors.redAccent, fontSize: 10, fontWeight: FontWeight.bold))]),
                  ),
                RichText(
                  maxLines: 1, overflow: TextOverflow.ellipsis,
                  text: TextSpan(children: _buildVeroHighlightedTitle(_fetchedTitle)),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),

          // 3. Total Sold Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(20)),
            child: Row(
              children: [
                const Icon(Icons.local_fire_department, color: Colors.orangeAccent, size: 16),
                const SizedBox(width: 6),
                Text("$_fetchedSoldCount Sold", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
              ],
            ),
          )
        ],
      ),
    );
  }

  // ✨ VERO RICHTEXT HIGHLIGHTER (Makes bad words red!)
  List<TextSpan> _buildVeroHighlightedTitle(String title) {
    List<TextSpan> spans = [];
    List<String> words = title.split(' ');

    for (String word in words) {
      String cleanWord = word.replaceAll(RegExp(r'[^\w\s]+'), '').toLowerCase();
      if (_veroKeywords.contains(cleanWord)) {
        spans.add(TextSpan(text: "$word ", style: const TextStyle(color: Colors.redAccent, fontWeight: FontWeight.w900, backgroundColor: Color(0xFFFFE4E6))));
      } else {
        spans.add(TextSpan(text: "$word ", style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.w600, fontSize: 14)));
      }
    }
    return spans;
  }

  Widget _buildCountryTab(String countryCode) {
    bool isActive = _activeCountry == countryCode;
    return InkWell(
      onTap: () => setState(() { _activeCountry = countryCode; _taxRate = countryCode == "US" ? 8.0 : (countryCode == "UK" ? 20.0 : 10.0); }),
      borderRadius: BorderRadius.circular(20),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200), margin: const EdgeInsets.only(left: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(color: isActive ? const Color(0xFF0F172A) : Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: isActive ? const Color(0xFF0F172A) : const Color(0xFFE2E8F0))),
        child: Text(countryCode, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: isActive ? Colors.white : const Color(0xFF64748B))),
      ),
    );
  }
}