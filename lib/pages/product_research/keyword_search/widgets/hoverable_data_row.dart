import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart'; 
import '../../../../../core/utils/profit_engine.dart'; 

class HoverableDataRow extends StatefulWidget {
  final String imageUrl, title, flag, score, sales, returns, risk, margin, actionLabel;
  final String? veroWord;
  final Color actionColor;
  final bool isSelected;

  const HoverableDataRow({
    super.key, required this.imageUrl, required this.title, this.veroWord, required this.flag, 
    required this.score, required this.sales, required this.returns, required this.risk, 
    required this.margin, required this.actionColor, required this.actionLabel, required this.isSelected
  });

  @override
  State<HoverableDataRow> createState() => _HoverableDataRowState();
}

class _HoverableDataRowState extends State<HoverableDataRow> {
  bool _isHovering = false;
  late bool _isChecked;
  
  // ✨ ARBITRAGE CALCULATOR STATE
  final TextEditingController _amzPriceController = TextEditingController();
  ProfitResult? _liveProfit; 

  @override
  void initState() {
    super.initState();
    _isChecked = widget.isSelected;
  }

  @override
  void didUpdateWidget(covariant HoverableDataRow oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isSelected != oldWidget.isSelected) {
      _isChecked = widget.isSelected;
    }
  }

  @override
  void dispose() {
    _amzPriceController.dispose();
    super.dispose();
  }

  // ✨ THE DEEP LINK LAUNCHER
  Future<void> _launchAmazonSearch() async {
    String query = Uri.encodeComponent(widget.title);
    final Uri url = Uri.parse('https://www.amazon.com/s?k=$query');
    
    if (!await launchUrl(url)) {
      debugPrint('Could not launch $url');
    }
  }

  // ✨ THE REAL-TIME PROFIT CALCULATION
  void _calculateRowProfit(String amzPriceString) {
    if (amzPriceString.isEmpty) {
      setState(() => _liveProfit = null);
      return;
    }

    double amzPrice = double.tryParse(amzPriceString) ?? 0.0;
    String cleanEbayPrice = widget.sales.replaceAll(RegExp(r'[^\d.]'), '');
    double ebayPrice = double.tryParse(cleanEbayPrice) ?? 0.0;

    final result = ProfitEngine.calculate(
      sellingPrice: ebayPrice, 
      buyPrice: amzPrice,
      shippingCost: 5.00, 
    );

    setState(() {
      _liveProfit = result;
    });
  }

  Widget _buildTitleWithVeroHighlight(String title, String? veroWord) {
    if (veroWord == null || veroWord.isEmpty || !title.toLowerCase().contains(veroWord.toLowerCase())) {
      return Text(title, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B), fontSize: 12));
    }
    int startIndex = title.toLowerCase().indexOf(veroWord.toLowerCase());
    String part1 = title.substring(0, startIndex);
    String highlight = title.substring(startIndex, startIndex + veroWord.length);
    String part2 = title.substring(startIndex + veroWord.length);

    return RichText(
      maxLines: 2,
      overflow: TextOverflow.ellipsis,
      text: TextSpan(
        style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B), fontSize: 12, fontFamily: 'Roboto'),
        children: [
          TextSpan(text: part1),
          WidgetSpan(
            alignment: PlaceholderAlignment.middle,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              decoration: BoxDecoration(color: Colors.red.shade100, borderRadius: BorderRadius.circular(4), border: Border.all(color: Colors.red.shade300)),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.warning_amber_rounded, size: 12, color: Colors.red),
                  const SizedBox(width: 2),
                  Text(highlight, style: TextStyle(color: Colors.red.shade900, fontWeight: FontWeight.w900, fontSize: 11)),
                ],
              ),
            ),
          ),
          TextSpan(text: part2),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovering = true),
      onExit: (_) => setState(() => _isHovering = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        decoration: BoxDecoration(
          color: _isHovering ? const Color(0xFF8FFF00).withAlpha(15) : Colors.transparent,
          border: const Border(bottom: BorderSide(color: Color(0xFFF1F5F9)))
        ),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Checkbox(
              value: _isChecked, 
              onChanged: (val) => setState(() => _isChecked = val!), 
              activeColor: const Color(0xFF8FFF00), checkColor: Colors.black
            ),
            
            // 1. PRODUCT INFO (Flex: 10)
            Expanded(
              flex: 10,
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      widget.imageUrl, width: 44, height: 44, fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(width: 44, height: 44, color: Colors.grey.shade200, child: const Icon(Icons.image_not_supported, size: 16, color: Colors.grey)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(child: _buildTitleWithVeroHighlight(widget.title, widget.veroWord)), 
                ],
              ),
            ),
            
            // 2. EBAY PRICE (Flex: 3)
            Expanded(
              flex: 3, 
              child: Text(widget.sales, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF1E293B)))
            ),
            
            // 3. ✨ THE COMPACT BUY COST INPUT (Flex: 2)
            Expanded(
              flex: 2,
              child: Align(
                alignment: Alignment.centerLeft,
                child: Container(
                  height: 28, // Shorter height
                  width: 55,  // Compact width
                  margin: const EdgeInsets.only(right: 10),
                  child: TextField(
                    controller: _amzPriceController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                    decoration: InputDecoration(
                      hintText: "Cost \$",
                      hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 10),
                      contentPadding: EdgeInsets.zero,
                      filled: true,
                      fillColor: Colors.white,
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: BorderSide(color: Colors.grey.shade300)),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: Colors.orange)),
                    ),
                    onChanged: _calculateRowProfit, 
                  ),
                ),
              ),
            ),
            
            // 4. ✨ THE COMPACT LIVE PROFIT BADGE (Flex: 2)
            Expanded(
              flex: 2, 
              child: _liveProfit == null 
                ? const Text("-", style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold, fontSize: 11))
                : Align(
                    alignment: Alignment.centerLeft,
                    child: Container(
                      height: 28, 
                      width: 55, 
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: _liveProfit!.netProfit > 0 ? Colors.green.shade50 : Colors.red.shade50,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        "\$${_liveProfit!.netProfit.toStringAsFixed(2)}", 
                        style: TextStyle(
                          fontWeight: FontWeight.w900, 
                          fontSize: 11, 
                          color: _liveProfit!.netProfit > 0 ? Colors.green.shade700 : Colors.red.shade700
                        )
                      ),
                    ),
                  )
            ),

            // 5. ✨ THE NEW FAR-RIGHT ACTION GROUP (Flex: 4)
            Expanded(
              flex: 4, 
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  // Clickable Amazon Logo
                  InkWell(
                    onTap: _launchAmazonSearch,
                    borderRadius: BorderRadius.circular(6),
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.white, 
                        borderRadius: BorderRadius.circular(6), 
                        border: Border.all(color: Colors.grey.shade200)
                      ),
                      // PNG version of Amazon's "smile" logo
                      child: Image.network(
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Amazon_icon.svg/512px-Amazon_icon.svg.png', 
                        width: 16, height: 16,
                        errorBuilder: (context, error, stackTrace) => const Icon(Icons.shopping_cart, size: 16, color: Colors.orange),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Save/Bookmark Icon
                  IconButton(
                    icon: const Icon(Icons.bookmark_border, color: Color(0xFF94A3B8), size: 18),
                    onPressed: () {},
                    hoverColor: const Color(0xFF8FFF00).withAlpha(30),
                    constraints: const BoxConstraints(), // Removes default wide padding
                    padding: const EdgeInsets.all(8),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}