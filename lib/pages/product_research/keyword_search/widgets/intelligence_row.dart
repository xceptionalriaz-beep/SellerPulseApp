import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart'; // ✨ Added for comma formatting
import '../../../../../core/utils/profit_engine.dart';

class IntelligenceRow extends StatefulWidget {
  // ✨ UNIQUE ID & STATE CONTROL (For Bulk Actions)
  final String itemId; 
  final bool isSelected;
  final ValueChanged<bool?> onSelect;
  final ValueChanged<double>? onProfitChanged;

  final String imageUrl;
  final String title;
  final String price;
  final String sellerUsername;
  final double sellerFeedbackScore;
  final String itemLocationCountry;
  final String sellerRegisteredCountry;
  final int totalActiveListings;
  
  // ✨ NEW: The direct link to the eBay listing
  final String? itemWebUrl; 
  
  // ✨ DEMAND DATA - Kept in model, but removed from display
  final int totalSold;
  final String lastSoldDate; 
  final int watchCount;

  // ✨ ADVANCED SAFETY & TREND DATA
  final bool isVero; 
  final String categoryPath; 
  final String priceTrend; 
  final String? upc; 

  const IntelligenceRow({
    super.key, 
    required this.itemId, 
    required this.isSelected, 
    required this.onSelect, 
    this.onProfitChanged, 
    required this.imageUrl, 
    required this.title, 
    required this.price,
    required this.sellerUsername,
    required this.sellerFeedbackScore,
    required this.itemLocationCountry,
    required this.sellerRegisteredCountry,
    required this.totalActiveListings,
    this.itemWebUrl, 
    required this.totalSold, 
    required this.lastSoldDate, 
    required this.watchCount,
    required this.isVero, 
    required this.categoryPath, 
    required this.priceTrend, 
    this.upc,
  });

  @override
  State<IntelligenceRow> createState() => _IntelligenceRowState();
}

class _IntelligenceRowState extends State<IntelligenceRow> {
  bool _isHovering = false;
  bool _isImageHovering = false; // ✨ NEW: Tracks if mouse is over the image specifically
  final TextEditingController _amzPriceController = TextEditingController();
  ProfitResult? _liveProfit; 

  // --- INTELLIGENCE LOGIC ENGINES ---
  bool get _isLikelyDropshipping => widget.itemLocationCountry != widget.sellerRegisteredCountry;
  // bool get _isHot => widget.lastSoldDate.contains("2026") || widget.lastSoldDate.contains("Today"); // Logic not needed for display anymore

  Color get _strengthColor {
    if (widget.sellerFeedbackScore > 10000) return Colors.red;
    if (widget.sellerFeedbackScore > 500) return Colors.orange;
    return Colors.green;
  }

  // --- ACTIONS ---
  void _calculateRowProfit(String amzPriceString) {
    if (amzPriceString.isEmpty) {
      setState(() => _liveProfit = null);
      if (widget.onProfitChanged != null) widget.onProfitChanged!(0.0); // Send 0 profit to parent
      return;
    }
    double amzPrice = double.tryParse(amzPriceString) ?? 0.0;
    String cleanEbayPrice = widget.price.replaceAll(RegExp(r'[^\d.]'), '');
    double ebayPrice = double.tryParse(cleanEbayPrice) ?? 0.0;

    final result = ProfitEngine.calculate(sellingPrice: ebayPrice, buyPrice: amzPrice, shippingCost: 5.00);
    setState(() => _liveProfit = result);
    
    // Send the calculated profit up to the main screen for the Bulk Action Hub!
    if (widget.onProfitChanged != null) {
      widget.onProfitChanged!(result.netProfit);
    }
  }

  // ✨ NEW: Launches the eBay item URL in a new tab
  Future<void> _launchItemUrl() async {
    if (widget.itemWebUrl != null && widget.itemWebUrl!.isNotEmpty) {
      final Uri url = Uri.parse(widget.itemWebUrl!);
      if (!await launchUrl(url)) debugPrint('Could not launch $url');
    } else {
      debugPrint('No URL available for this product.');
    }
  }

  Future<void> _launchSearch(String baseUrl, String queryParam) async {
    String query = Uri.encodeComponent(widget.title);
    final Uri url = Uri.parse('$baseUrl?$queryParam=$query');
    if (!await launchUrl(url)) debugPrint('Could not launch $url');
  }

  Future<void> _launchGoogleLens() async {
    String encodedUrl = Uri.encodeComponent(widget.imageUrl);
    final Uri url = Uri.parse('https://lens.google.com/uploadbyurl?url=$encodedUrl');
    if (!await launchUrl(url)) debugPrint('Could not launch Google Lens');
  }

  void _navigateToCompetitorResearch() {
    debugPrint("🚀 Analyzing ${widget.sellerUsername}...");
  }

  @override
  Widget build(BuildContext context) {
    // ✨ Formats the number with commas (e.g., 18904 -> 18,904)
    final String formattedFeedback = NumberFormat.decimalPattern().format(widget.sellerFeedbackScore.toInt());

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovering = true),
      onExit: (_) => setState(() => _isHovering = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        decoration: BoxDecoration(
          color: widget.isSelected 
              ? const Color(0xFF8FFF00).withAlpha(25) 
              : (_isHovering ? const Color(0xFF8FFF00).withAlpha(15) : Colors.white),
          border: const Border(bottom: BorderSide(color: Color(0xFFF1F5F9)))
        ),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              width: 48,
              child: Checkbox(
                value: widget.isSelected, 
                onChanged: widget.onSelect, 
                activeColor: const Color(0xFF8FFF00), 
                checkColor: Colors.black
              ),
            ),
            
            // 1. PRODUCT & SAFETY (Flex 8)
            Expanded(
              flex: 8,
              child: Row(
                children: [
                  // ✨ UPGRADED: Interactive Image Stack
                  MouseRegion(
                    cursor: SystemMouseCursors.click, // Changes to hand pointer
                    onEnter: (_) => setState(() => _isImageHovering = true),
                    onExit: (_) => setState(() => _isImageHovering = false),
                    child: GestureDetector(
                      onTap: _launchItemUrl, // Opens eBay in new tab
                      child: Stack(
                        children: [
                          AnimatedContainer(
                            duration: const Duration(milliseconds: 150),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(6),
                              // Creates the Neon Green border on hover
                              border: Border.all(
                                color: _isImageHovering ? const Color(0xFF8FFF00) : Colors.transparent,
                                width: 2,
                              ),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(4), // Slightly smaller to fit inside border seamlessly
                              child: Image.network(
                                widget.imageUrl, width: 34, height: 34, fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) => Container(width: 34, height: 34, color: Colors.grey.shade200, child: const Icon(Icons.image_not_supported, size: 14, color: Colors.grey)),
                              ),
                            ),
                          ),
                          if (widget.isVero)
                            Positioned(
                              right: -2, 
                              bottom: -2, 
                              child: Container(
                                decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle), 
                                child: const Icon(Icons.shield, color: Colors.red, size: 12)
                              )
                            ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          widget.title, 
                          maxLines: 2, 
                          overflow: TextOverflow.ellipsis, 
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B), fontSize: 11)
                        ),
                        const SizedBox(height: 2),
                        Text(
                          widget.categoryPath, 
                          maxLines: 1, 
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(fontSize: 9, color: Colors.grey.shade500, fontWeight: FontWeight.w500)
                        ),
                      ],
                    ),
                  ), 
                ],
              ),
            ),

            // 2. SELLER & SPY (Flex 4)
            Expanded(
              flex: 4,
              child: Row(
                children: [
                  Text(_getFlagEmoji(widget.sellerRegisteredCountry), style: const TextStyle(fontSize: 14)),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      widget.sellerUsername, 
                      overflow: TextOverflow.ellipsis, 
                      style: TextStyle(fontSize: 11, color: Colors.blueGrey.shade700, fontWeight: FontWeight.bold)
                    ),
                  ),
                  const SizedBox(width: 4),
                  InkWell(
                    onTap: _navigateToCompetitorResearch,
                    child: const Icon(Icons.analytics_outlined, size: 14, color: Color(0xFF8FFF00)),
                  ),
                ],
              ),
            ),

            // 3. ✨ UPGRADED FEEDBACK (Flex 2)
            Expanded(
              flex: 2,
              child: Align(
                alignment: Alignment.centerLeft,
                // ✨ Removed the background color/container completely as requested!
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // ✨ Neon Green Star Icon Added
                    const Icon(Icons.star, size: 13, color: Color(0xFF8FFF00)),
                    const SizedBox(width: 4),
                    Text(
                      formattedFeedback, // ✨ Formatted with commas
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: _strengthColor) // Keeps your original dynamic colors
                    ),
                    if (_isLikelyDropshipping) ...[
                      const SizedBox(width: 4),
                      const Icon(Icons.warning_amber_rounded, size: 12, color: Colors.red),
                    ]
                  ],
                ),
              ),
            ),

            // ❌ Step 4: DEMAND HEAT/TOTAL SALE COLUMN REMOVED FROM HERE

            // 5. WATCHERS (Flex 2)
            Expanded(
              flex: 2,
              child: Row(
                children: [
                  const Icon(Icons.visibility_outlined, size: 12, color: Colors.blueGrey),
                  const SizedBox(width: 4),
                  Text("${widget.watchCount}", style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                ],
              ),
            ),
            
            // 6. PRICE & TREND (Flex 2)
            Expanded(
              flex: 2, 
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(widget.price, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF1E293B))),
                  if (widget.priceTrend != "stable") ...[
                    const SizedBox(width: 2),
                    Icon(
                      widget.priceTrend == "up" ? Icons.trending_up : Icons.trending_down, 
                      size: 14, 
                      color: widget.priceTrend == "up" ? Colors.green : Colors.red
                    ),
                  ]
                ],
              )
            ),
            
            // 7. BUY INPUT (Flex 2)
            Expanded(
              flex: 2,
              child: Align(
                alignment: Alignment.centerLeft,
                child: SizedBox(
                  height: 28, width: 55,
                  child: TextField(
                    controller: _amzPriceController,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                    decoration: InputDecoration(
                      hintText: "Cost", 
                      hintStyle: TextStyle(fontSize: 10, color: Colors.grey.shade400),
                      contentPadding: EdgeInsets.zero, 
                      filled: true, 
                      fillColor: Colors.white,
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(4), borderSide: BorderSide(color: Colors.grey.shade300)),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(4), borderSide: const BorderSide(color: Colors.orange)),
                    ),
                    onChanged: _calculateRowProfit, 
                  ),
                ),
              ),
            ),
            
            // 8. PROFIT (Flex 2)
            Expanded(
              flex: 2, 
              child: Align(
                alignment: Alignment.centerLeft,
                child: _liveProfit == null 
                  ? const Text("-", style: TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.bold))
                  : Text(
                      "\$${_liveProfit!.netProfit.toStringAsFixed(2)}", 
                      style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: _liveProfit!.netProfit > 0 ? Colors.green.shade700 : Colors.red.shade700),
                    ),
              )
            ),

            // 9. ACTION HUB (Flex 3)
            Expanded(
              flex: 3, 
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  _buildSmallActionIcon(
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Amazon_icon.svg/128px-Amazon_icon.svg.png', 
                    () => _launchSearch('https://www.amazon.com/s', 'k'),
                    Icons.shopping_cart, Colors.orange
                  ),
                  const SizedBox(width: 4),
                  _buildSmallActionIcon(
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Aliexpress_logo.svg/128px-Aliexpress_logo.svg.png', 
                    () => _launchSearch('https://www.aliexpress.com/wholesale', 'SearchText'),
                    Icons.storefront, Colors.red
                  ),
                  const SizedBox(width: 4),
                  _buildSmallActionIcon(
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Google_Lens_-_new_logo.png/120px-Google_Lens_-_new_logo.png', 
                    _launchGoogleLens,
                    Icons.image_search, Colors.blue
                  ),
                  const SizedBox(width: 6),
                  IconButton(
                    icon: const Icon(Icons.bookmark_border, size: 18, color: Color(0xFF94A3B8)),
                    onPressed: () {},
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSmallActionIcon(String url, VoidCallback onTap, IconData fallbackIcon, Color fallbackColor) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(color: Colors.white, border: Border.all(color: Colors.grey.shade200), borderRadius: BorderRadius.circular(4)),
        child: Image.network(
          url, 
          width: 14, 
          height: 14,
          errorBuilder: (context, error, stackTrace) => Icon(fallbackIcon, size: 14, color: fallbackColor),
        ),
      ),
    );
  }

  String _getFlagEmoji(String countryCode) {
    if (countryCode.toUpperCase() == 'US') return '🇺🇸';
    if (countryCode.toUpperCase() == 'CN') return '🇨🇳';
    if (countryCode.toUpperCase() == 'UK' || countryCode.toUpperCase() == 'GB') return '🇬🇧';
    if (countryCode.toUpperCase() == 'CA') return '🇨🇦';
    return '🏳️'; 
  }
}