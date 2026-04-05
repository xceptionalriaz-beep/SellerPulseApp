import 'package:flutter/material.dart';

class CommandCenter extends StatelessWidget {
  final String currency;
  final List<String> categoryFees, storeTiers, sellerLevels, processors;
  final bool isInternational; 
  
  final String selectedCategory, selectedStoreTier, selectedSellerLevel, selectedProcessor;

  // ✨ NEW: Added controllers so the external Search Bar can type into these inputs!
  final TextEditingController? salePriceController;
  final TextEditingController? buyerShippingController;

  final Function(double) onItemCostChanged, onShippingCostChanged, onSalePriceChanged, onBuyerShippingChanged, onAdRateChanged, onTaxRateChanged;
  final Function(String?) onCategoryChanged, onStoreTierChanged, onSellerLevelChanged, onProcessorChanged;
  final Function(bool) onInternationalChanged; 

  const CommandCenter({
    super.key, required this.currency, required this.categoryFees, required this.storeTiers, required this.sellerLevels, 
    required this.processors, required this.isInternational, 
    required this.selectedCategory, required this.selectedStoreTier, required this.selectedSellerLevel, required this.selectedProcessor,
    this.salePriceController, this.buyerShippingController, // ✨ Added to constructor
    required this.onItemCostChanged, required this.onShippingCostChanged, required this.onSalePriceChanged, 
    required this.onBuyerShippingChanged, required this.onCategoryChanged, required this.onStoreTierChanged, 
    required this.onSellerLevelChanged, required this.onAdRateChanged, required this.onTaxRateChanged,
    required this.onProcessorChanged, required this.onInternationalChanged
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white, 
        borderRadius: BorderRadius.circular(16), 
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))],
      ),
      child: ScrollConfiguration(
        behavior: ScrollConfiguration.of(context).copyWith(scrollbars: false),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("COMMAND CENTER", style: TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
              const SizedBox(height: 20),
              
              Row(
                children: [
                  Expanded(child: _buildInput("Item Cost", "How much you paid to buy this item.", currency, onItemCostChanged)),
                  const SizedBox(width: 12),
                  Expanded(child: _buildInput("Shipping Cost", "How much it costs YOU to ship this item to the buyer.", currency, onShippingCostChanged)),
                ],
              ),
              const SizedBox(height: 12),
              
              Row(
                children: [
                  // ✨ Connect the Sale Price Controller here!
                  Expanded(child: _buildInput("Selling Price", "The price you will list this item for.", currency, onSalePriceChanged, controller: salePriceController)),
                  const SizedBox(width: 12),
                  // ✨ Connect the Buyer Shipping Controller here!
                  Expanded(child: _buildInput("Buyer Paid Ship", "How much your customers are going to pay for shipping.", currency, onBuyerShippingChanged, controller: buyerShippingController)),
                ],
              ),
              const Padding(padding: EdgeInsets.symmetric(vertical: 16), child: Divider(color: Color(0xFFE2E8F0))),
              
              _buildSearchableCategory(context, "eBay Category", "What category does your product belong to? Search to find it faster.", selectedCategory, categoryFees, onCategoryChanged),
              const SizedBox(height: 12),
              
              Row(
                children: [
                  Expanded(child: _buildDropdown("Store Tier", "Do you have a paid eBay Store subscription?", selectedStoreTier, storeTiers, onStoreTierChanged)),
                  const SizedBox(width: 12),
                  Expanded(child: _buildDropdown("Seller Level", "Your current eBay seller rating level.", selectedSellerLevel, sellerLevels, onSellerLevelChanged)),
                ],
              ),
              const SizedBox(height: 12),
              
              Row(
                children: [
                  Expanded(child: _buildInput("Promoted Ad Rate", "Are you paying eBay to promote this item? Put the % here.", "%", onAdRateChanged, isSuffix: true)),
                  const SizedBox(width: 12),
                  Expanded(child: _buildInput("Est. Buyer Tax", "The average sales tax your buyer pays.", "%", onTaxRateChanged, isSuffix: true)),
                ],
              ),

              const Padding(padding: EdgeInsets.symmetric(vertical: 16), child: Divider(color: Color(0xFFE2E8F0))),
              
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Flexible(child: _buildLabelWithHelp("International Sale", "Turn ON if the buyer is in a different country. eBay adds a 1.65% cross-border fee.")),
                  Switch(
                    value: isInternational,
                    onChanged: onInternationalChanged,
                    activeThumbColor: const Color(0xFF8FFF00),
                    activeTrackColor: const Color(0xFF0F172A),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              _buildDropdown(
                "Payment Processor", 
                "Select 'Managed' if eBay pays you directly, or 'PayPal' if you use the old payment system.", 
                selectedProcessor, processors, onProcessorChanged
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLabelWithHelp(String label, String tooltip) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Flexible(
          child: Text(label, style: const TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold, fontSize: 12), overflow: TextOverflow.ellipsis),
        ),
        const SizedBox(width: 6),
        Tooltip(
          message: tooltip,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          margin: const EdgeInsets.symmetric(horizontal: 10),
          constraints: const BoxConstraints(maxWidth: 220), 
          decoration: ShapeDecoration(color: const Color(0xFF0F172A), shape: _TooltipSpeechBubbleShape()),
          textStyle: const TextStyle(color: Colors.white, fontSize: 12, height: 1.4, fontWeight: FontWeight.w500),
          preferBelow: false, verticalOffset: 15, waitDuration: Duration.zero, triggerMode: TooltipTriggerMode.tap,
          child: const Icon(Icons.info_outline, size: 15, color: Color(0xFF94A3B8)),
        ),
      ],
    );
  }

  // ✨ NEW: Added 'controller' to the function parameters so TextFormField can use it
  Widget _buildInput(String label, String tooltip, String symbol, Function(double) onChanged, {bool isSuffix = false, TextEditingController? controller}) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        _buildLabelWithHelp(label, tooltip),
        const SizedBox(height: 6),
        SizedBox(height: 40, child: TextFormField(
            controller: controller, // ✨ Applied the controller here
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            onChanged: (val) => onChanged(double.tryParse(val) ?? 0.0),
            style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A), fontSize: 14),
            decoration: InputDecoration(
              filled: true, fillColor: const Color(0xFFF8FAFC), 
              prefixText: !isSuffix ? "$symbol " : null, suffixText: isSuffix ? " $symbol" : null,
              prefixStyle: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
              suffixStyle: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 0),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF8FFF00), width: 1.5)),
            ),
          ),
        ),
    ]);
  }

  Widget _buildSearchableCategory(BuildContext context, String label, String tooltip, String currentValue, List<String> items, Function(String?) onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start, 
      children: [
        _buildLabelWithHelp(label, tooltip),
        const SizedBox(height: 6),
        InkWell(
          onTap: () => _showSearchDialog(context, currentValue, items, onChanged),
          borderRadius: BorderRadius.circular(8),
          child: Container(
            height: 40, width: double.infinity, padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(8), border: Border.all(color: const Color(0xFFE2E8F0))),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(child: Text(currentValue, style: const TextStyle(fontSize: 12, color: Color(0xFF0F172A), fontWeight: FontWeight.w600), overflow: TextOverflow.ellipsis)),
                const Icon(Icons.search, color: Color(0xFF64748B), size: 16),
              ],
            ),
          ),
        ),
      ]
    );
  }

  void _showSearchDialog(BuildContext context, String currentValue, List<String> items, Function(String?) onChanged) {
    showGeneralDialog(
      context: context,
      barrierDismissible: true, // Click outside to close
      barrierLabel: "Category Search",
      barrierColor: const Color(0xFF0F172A).withOpacity(0.4), // Premium dark overlay
      transitionDuration: const Duration(milliseconds: 250), // Sweet spot for speed
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        var curve = Curves.easeOutCubic;
        var scaleAnimation = Tween(begin: 0.95, end: 1.0).chain(CurveTween(curve: curve)).animate(animation);
        var fadeAnimation = Tween(begin: 0.0, end: 1.0).chain(CurveTween(curve: curve)).animate(animation);

        return ScaleTransition(
          scale: scaleAnimation,
          child: FadeTransition(
            opacity: fadeAnimation,
            child: child,
          ),
        );
      },
      pageBuilder: (context, animation, secondaryAnimation) {
        String searchQuery = "";
        return StatefulBuilder(
          builder: (context, setDialogState) {
            List<String> filteredItems = items.where((item) => item.toLowerCase().contains(searchQuery.toLowerCase())).toList();
            
            return Dialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              backgroundColor: Colors.white,
              child: Container(
                width: 450, height: 500,
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text("Select eBay Category", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                        IconButton(icon: const Icon(Icons.close, color: Color(0xFF64748B)), onPressed: () => Navigator.pop(context)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      autofocus: true,
                      decoration: InputDecoration(
                        hintText: "Search (e.g., 'Watches', 'Shoes')",
                        prefixIcon: const Icon(Icons.search, color: Color(0xFF64748B)),
                        filled: true, fillColor: const Color(0xFFF1F5F9),
                        contentPadding: const EdgeInsets.symmetric(vertical: 0),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                      ),
                      onChanged: (val) => setDialogState(() => searchQuery = val),
                    ),
                    const SizedBox(height: 16),
                    Expanded(
                      child: ListView.builder(
                        physics: const BouncingScrollPhysics(), // Adds iOS-style bounce scroll
                        itemCount: filteredItems.length,
                        itemBuilder: (context, index) {
                          bool isSelected = filteredItems[index] == currentValue;
                          return InkWell(
                            onTap: () {
                              onChanged(filteredItems[index]);
                              Navigator.pop(context); 
                            },
                            borderRadius: BorderRadius.circular(8),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                              margin: const EdgeInsets.only(bottom: 4),
                              decoration: BoxDecoration(
                                color: isSelected ? const Color(0xFF8FFF00).withAlpha(40) : Colors.transparent,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                filteredItems[index], 
                                style: TextStyle(
                                  color: isSelected ? const Color(0xFF0F172A) : const Color(0xFF475569),
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildDropdown(String label, String tooltip, String value, List<String> items, Function(String?) onChanged) {
    String safeValue = items.contains(value) ? value : (items.isNotEmpty ? items.first : "");
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        _buildLabelWithHelp(label, tooltip),
        const SizedBox(height: 6),
        Container(height: 40, width: double.infinity, padding: const EdgeInsets.symmetric(horizontal: 10),
          decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(8), border: Border.all(color: const Color(0xFFE2E8F0))),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              isExpanded: true, value: safeValue, menuMaxHeight: 400, 
              icon: const Icon(Icons.unfold_more, color: Color(0xFF64748B), size: 16),
              style: const TextStyle(fontSize: 12, color: Color(0xFF0F172A), fontWeight: FontWeight.w600),
              onChanged: onChanged,
              items: items.map((String item) => DropdownMenuItem(value: item, child: Text(item, overflow: TextOverflow.ellipsis))).toList(),
            ),
          ),
        ),
    ]);
  }
}

class _TooltipSpeechBubbleShape extends ShapeBorder {
  @override EdgeInsetsGeometry get dimensions => EdgeInsets.zero;
  @override Path getInnerPath(Rect rect, {TextDirection? textDirection}) => Path();
  @override Path getOuterPath(Rect rect, {TextDirection? textDirection}) {
    final path = Path();
    path.addRRect(RRect.fromRectAndRadius(rect, const Radius.circular(8.0)));
    const double arrowW = 10.0, arrowH = 6.0;
    final double cX = rect.center.dx, bY = rect.bottom;
    path.moveTo(cX - arrowW / 2, bY); path.lineTo(cX, bY + arrowH); path.lineTo(cX + arrowW / 2, bY); path.close();
    return path;
  }
  @override void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {}
  @override ShapeBorder scale(double t) => this;
}