import 'package:flutter/material.dart';

class AdvancedFiltersModal extends StatefulWidget {
  // ✨ NEW: The modal now requires the saved memory to open!
  final Map<String, dynamic> savedFilters;
  
  const AdvancedFiltersModal({super.key, required this.savedFilters});

  @override
  State<AdvancedFiltersModal> createState() => _AdvancedFiltersModalState();
}

class _AdvancedFiltersModalState extends State<AdvancedFiltersModal> {
  int _activeTab = 0; 

  // --- Filter States ---
  late double _minMargin;
  late double _minSales;
  late double _minSTR; 
  late bool _hideAds;

  late double _maxReturns;
  late double _maxWeight;
  late bool _hideVero;
  late bool _hideHazmat;
  late String _negativeKeywords; 
  late String _selectedCountry;
  late bool _freeShippingOnly;

  late double _maxCompetitors;
  late double _maxListingAge; 
  late bool _lowStock;
  late bool _lazyCompetitors;
  late bool _excludeMegaSellers; 
  late bool _hideVariations;

  final List<String> _countries = ['Anywhere', 'United States', 'China', 'United Kingdom', 'Australia', 'Canada', 'European Union'];

  @override
  void initState() {
    super.initState();
    // ✨ NEW: When the popup opens, it loads the memory into the sliders!
    _minMargin = widget.savedFilters['minMargin'];
    _minSales = widget.savedFilters['minSales'];
    _minSTR = widget.savedFilters['minSTR'];
    _hideAds = widget.savedFilters['hideAds'];
    _maxReturns = widget.savedFilters['maxReturns'];
    _maxWeight = widget.savedFilters['maxWeight'];
    _hideVero = widget.savedFilters['hideVero'];
    _hideHazmat = widget.savedFilters['hideHazmat'];
    _negativeKeywords = widget.savedFilters['negativeKeywords'];
    _selectedCountry = widget.savedFilters['selectedCountry'];
    _freeShippingOnly = widget.savedFilters['freeShippingOnly'];
    _maxCompetitors = widget.savedFilters['maxCompetitors'];
    _maxListingAge = widget.savedFilters['maxListingAge'];
    _lowStock = widget.savedFilters['lowStock'];
    _lazyCompetitors = widget.savedFilters['lazyCompetitors'];
    _excludeMegaSellers = widget.savedFilters['excludeMegaSellers'];
    _hideVariations = widget.savedFilters['hideVariations'];
  }

  // ✨ NEW: The function that packages up all the settings to send back to the Dashboard
  void _applyAndSaveFilters() {
    Map<String, dynamic> updatedFilters = {
      'minMargin': _minMargin, 'minSales': _minSales, 'minSTR': _minSTR, 'hideAds': _hideAds,
      'maxReturns': _maxReturns, 'maxWeight': _maxWeight, 'hideVero': _hideVero,
      'hideHazmat': _hideHazmat, 'negativeKeywords': _negativeKeywords, 'selectedCountry': _selectedCountry,
      'freeShippingOnly': _freeShippingOnly, 'maxCompetitors': _maxCompetitors,
      'maxListingAge': _maxListingAge, 'lowStock': _lowStock, 'lazyCompetitors': _lazyCompetitors,
      'excludeMegaSellers': _excludeMegaSellers, 'hideVariations': _hideVariations,
    };
    
    // Closes the popup AND hands the data back!
    Navigator.pop(context, updatedFilters); 
  }

  void _applyPreset(String strategy) {
    setState(() {
      if (strategy == "Dropship") {
        _minMargin = 35; _minSTR = 300; _maxWeight = 2; _hideVero = true; _maxCompetitors = 15; _freeShippingOnly = true; _selectedCountry = 'United States';
      } else if (strategy == "Arbitrage") {
        _minMargin = 20; _minSTR = 500; _maxWeight = 10; _hideVero = false; _maxCompetitors = 5; _selectedCountry = 'Anywhere';
      } else if (strategy == "Hidden Gem") {
        _minMargin = 40; _minSales = 100; _maxCompetitors = 2; _excludeMegaSellers = true; _maxListingAge = 14; _selectedCountry = 'Anywhere';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        width: 850, height: 600, 
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 30, offset: Offset(0, 10))]),
        child: Column(
          children: [
            // HEADER & PRESETS
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: const BorderRadius.vertical(top: Radius.circular(16)), border: Border(bottom: BorderSide(color: Colors.grey.shade200))),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text("⚙️ Advanced Filters", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                      IconButton(icon: const Icon(Icons.close, color: Color(0xFF64748B)), onPressed: () => Navigator.pop(context)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      const Text("1-Click Strategies: ", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B), fontSize: 13)),
                      const SizedBox(width: 10),
                      _buildPresetBtn("🎯 Dropship Winner", () => _applyPreset("Dropship")),
                      const SizedBox(width: 10),
                      _buildPresetBtn("📦 Arbitrage Flip", () => _applyPreset("Arbitrage")),
                      const SizedBox(width: 10),
                      _buildPresetBtn("⭐ Hidden Gems", () => _applyPreset("Hidden Gem")),
                    ],
                  )
                ],
              ),
            ),
            
            // BODY
            Expanded(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Container(
                    width: 230,
                    padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 10),
                    decoration: BoxDecoration(color: const Color(0xFFF1F5F9), border: Border(right: BorderSide(color: Colors.grey.shade200))),
                    child: Column(
                      children: [
                        _buildTabButton(0, "💰 Financials & Velocity"),
                        const SizedBox(height: 10),
                        _buildTabButton(1, "🛡️ Risk & Exclusions"),
                        const SizedBox(height: 10),
                        _buildTabButton(2, "⚔️ Competitor Attack"),
                      ],
                    ),
                  ),
                  
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.all(30.0),
                      child: SingleChildScrollView(child: _buildActiveTabContent()), 
                    ),
                  )
                ],
              ),
            ),
            
            // FOOTER ACTION BUTTON
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              decoration: BoxDecoration(border: Border(top: BorderSide(color: Colors.grey.shade200))),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel", style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold))),
                  const SizedBox(width: 20),
                  ElevatedButton(
                    onPressed: _applyAndSaveFilters, // ✨ FIX: Uses the new save function!
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF131B2F), padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                    child: const Text("Apply Filters", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                  )
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  // --- CONTENT ROUTER ---
  Widget _buildActiveTabContent() {
    if (_activeTab == 0) return _buildFinancialsTab();
    if (_activeTab == 1) return _buildRiskTab();
    return _buildCompetitorTab();
  }

  // --- TAB 1: FINANCIALS ---
  Widget _buildFinancialsTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Selling Price Range (\$)", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(child: TextField(decoration: InputDecoration(hintText: "Min Price", border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)), isDense: true))),
            const Padding(padding: EdgeInsets.symmetric(horizontal: 15), child: Text("to", style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold))),
            Expanded(child: TextField(decoration: InputDecoration(hintText: "Max Price", border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)), isDense: true))),
          ],
        ),
        const SizedBox(height: 25),
        _buildSliderRow("Minimum Target Margin", _minMargin, 0, 100, "%", (val) => setState(() => _minMargin = val), "How much profit do you want to make after fees?"),
        const SizedBox(height: 25),
        _buildSliderRow("Minimum 30-Day Sales", _minSales, 0, 500, " sales", (val) => setState(() => _minSales = val), "Filter out slow-moving items."),
        const SizedBox(height: 25),
        _buildSliderRow("Minimum Sell-Through Rate (STR)", _minSTR, 0, 2000, "%", (val) => setState(() => _minSTR = val), "Items with > 300% STR sell faster than they are listed!"),
        const SizedBox(height: 25),
        _buildCheckRow("Hide Promoted Listings (Ads)", _hideAds, (val) => setState(() => _hideAds = val!)),
      ],
    );
  }

  // --- TAB 2: RISK & EXCLUSIONS ---
  Widget _buildRiskTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Negative Keywords (Comma separated)", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
        const SizedBox(height: 5),
        const Text("Hide garbage items. e.g., 'case, part, accessory, broken'", style: TextStyle(fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 8),
        TextField(
          controller: TextEditingController(text: _negativeKeywords), // Remembers text!
          decoration: InputDecoration(hintText: "e.g., case, cover, replacement", prefixIcon: const Icon(Icons.remove_circle_outline, color: Colors.redAccent), border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)), isDense: true),
          onChanged: (val) => _negativeKeywords = val,
        ),
        const SizedBox(height: 25),
        _buildDropdownRow("Shipper Location (Item Location)", _selectedCountry, _countries, (val) => setState(() => _selectedCountry = val!)),
        const SizedBox(height: 25),
        _buildSliderRow("Maximum Return Rate (INAD)", _maxReturns, 0, 25, "%", (val) => setState(() => _maxReturns = val), "Protect your account from defective products."),
        const SizedBox(height: 20),
        _buildSliderRow("Maximum Item Weight", _maxWeight, 0, 50, " lbs", (val) => setState(() => _maxWeight = val), "Heavy items eat your profit margins in shipping costs."),
        const SizedBox(height: 25),
        _buildCheckRow("Hide VERO / High-Risk Brands", _hideVero, (val) => setState(() => _hideVero = val!)),
        const SizedBox(height: 15),
        _buildCheckRow("Hide Hazmat (Batteries, Liquids, Knives)", _hideHazmat, (val) => setState(() => _hideHazmat = val!)),
        const SizedBox(height: 15),
        _buildCheckRow("Free Shipping Only", _freeShippingOnly, (val) => setState(() => _freeShippingOnly = val!)),
      ],
    );
  }

  // --- TAB 3: COMPETITOR ATTACK ---
  Widget _buildCompetitorTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSliderRow("Maximum Competitors", _maxCompetitors, 1, 50, " sellers", (val) => setState(() => _maxCompetitors = val), "Find hidden gems by keeping this below 5."),
        const SizedBox(height: 25),
        _buildSliderRow("Max Listing Age (Freshness)", _maxListingAge, 1, 365, " days", (val) => setState(() => _maxListingAge = val), "Find viral products listed recently (Set to 14-30 days)."),
        const SizedBox(height: 25),
        _buildCheckRow("Exclude Mega-Sellers (>10k Feedback)", _excludeMegaSellers, (val) => setState(() => _excludeMegaSellers = val!)),
        const SizedBox(height: 15),
        _buildCheckRow("Show Items where Competitor Stock < 5", _lowStock, (val) => setState(() => _lowStock = val!)),
        const SizedBox(height: 15),
        _buildCheckRow("Show \"Lazy\" Competitors (< 3 Photos)", _lazyCompetitors, (val) => setState(() => _lazyCompetitors = val!)),
        const SizedBox(height: 15),
        _buildCheckRow("Exclude Variation Listings (Purer Data)", _hideVariations, (val) => setState(() => _hideVariations = val!)),
      ],
    );
  }

  // --- HELPER WIDGETS ---

  Widget _buildDropdownRow(String label, String value, List<String> options, ValueChanged<String?> onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B), fontSize: 14)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(border: Border.all(color: Colors.grey.shade300), borderRadius: BorderRadius.circular(8)),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: value, isExpanded: true,
              icon: const Icon(Icons.keyboard_arrow_down, color: Color(0xFF64748B)),
              items: options.map((String item) {
                return DropdownMenuItem<String>(value: item, child: Text(item, style: const TextStyle(color: Color(0xFF1E293B))));
              }).toList(),
              onChanged: onChanged,
            ),
          ),
        )
      ],
    );
  }

  Widget _buildPresetBtn(String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(color: const Color(0xFF8FFF00).withAlpha(30), border: Border.all(color: const Color(0xFF8FFF00)), borderRadius: BorderRadius.circular(20)),
        child: Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF131B2F))),
      ),
    );
  }

  Widget _buildTabButton(int index, String label) {
    bool isActive = _activeTab == index;
    return InkWell(
      onTap: () => setState(() => _activeTab = index),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
        decoration: BoxDecoration(
          color: isActive ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isActive ? Colors.grey.shade300 : Colors.transparent),
          boxShadow: isActive ? [const BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2))] : []
        ),
        child: Text(label, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: isActive ? const Color(0xFF131B2F) : const Color(0xFF64748B))),
      ),
    );
  }

  Widget _buildSliderRow(String label, double value, double min, double max, String suffix, ValueChanged<double> onChanged, String helpText) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: const Color(0xFF8FFF00).withAlpha(40), borderRadius: BorderRadius.circular(6)),
              child: Text("${value.toInt()}$suffix", style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            )
          ],
        ),
        const SizedBox(height: 2),
        Text(helpText, style: const TextStyle(fontSize: 11, color: Colors.grey)), 
        Slider(value: value, min: min, max: max, activeColor: const Color(0xFF8FFF00), thumbColor: const Color(0xFF131B2F), onChanged: onChanged),
      ],
    );
  }

  Widget _buildCheckRow(String label, bool value, ValueChanged<bool?> onChanged) {
    return Row(
      children: [
        SizedBox(height: 24, width: 24, child: Checkbox(value: value, onChanged: onChanged, activeColor: const Color(0xFF8FFF00), checkColor: Colors.black, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)))),
        const SizedBox(width: 12),
        Expanded(child: Text(label, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B), fontSize: 14))),
      ],
    );
  }
}