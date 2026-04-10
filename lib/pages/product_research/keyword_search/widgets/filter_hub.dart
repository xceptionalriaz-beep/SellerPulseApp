import 'package:flutter/material.dart';
import '../models/search_filters.dart';

class FilterHub extends StatefulWidget {
  final SearchFilters filters;
  final VoidCallback onApply;

  const FilterHub({super.key, required this.filters, required this.onApply});

  @override
  State<FilterHub> createState() => _FilterHubState();
}

class _FilterHubState extends State<FilterHub> {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(color: const Color(0x0A000000), blurRadius: 20, offset: const Offset(0, 10))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("🌍 Global Market Filters", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFF0F172A))),
          const SizedBox(height: 16),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              // 1. Marketplace
              Expanded(
                flex: 2,
                child: _buildDropdown(
                  label: "MARKETPLACE",
                  value: widget.filters.marketplace,
                  items: [
                    {'val': 'US', 'label': '🇺🇸 eBay USA'},
                    {'val': 'UK', 'label': '🇬🇧 eBay UK'},
                    {'val': 'DE', 'label': '🇩🇪 eBay Germany'},
                    {'val': 'IT', 'label': '🇮🇹 eBay Italy'},
                  ],
                  onChanged: (val) => setState(() => widget.filters.marketplace = val!),
                ),
              ),
              const SizedBox(width: 16),

              // 2. Price Range
              Expanded(
                flex: 2,
                child: _buildRangeInput(
                  label: "PRICE (${widget.filters.currencySymbol})",
                  hintMin: "Min",
                  hintMax: "Max",
                  onMinChanged: (v) => widget.filters.minPrice = double.tryParse(v),
                  onMaxChanged: (v) => widget.filters.maxPrice = double.tryParse(v),
                ),
              ),
              const SizedBox(width: 16),

              // 3. Feedback Range (Spy Filter)
              Expanded(
                flex: 2,
                child: _buildRangeInput(
                  label: "SELLER FEEDBACK",
                  hintMin: "0",
                  hintMax: "500",
                  onMinChanged: (v) => widget.filters.minFeedback = int.tryParse(v) ?? 0,
                  onMaxChanged: (v) => widget.filters.maxFeedback = int.tryParse(v) ?? 1000000,
                ),
              ),
              const SizedBox(width: 16),

              // 4. Condition
              Expanded(
                flex: 2,
                child: _buildDropdown(
                  label: "CONDITION",
                  value: widget.filters.condition,
                  items: [
                    {'val': 'New', 'label': '✨ Brand New'},
                    {'val': 'Used', 'label': '📦 Used'},
                    {'val': 'Any', 'label': '🔄 Any'},
                  ],
                  onChanged: (val) => setState(() => widget.filters.condition = val!),
                ),
              ),
              const SizedBox(width: 24),

              // 5. APPLY BUTTON (Store Colors)
              ElevatedButton(
                onPressed: widget.onApply,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF8FFF00), // Neon Green
                  foregroundColor: Colors.black, // Dark text for contrast
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                child: const Text("APPLY FILTERS", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 0.5)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Text(text, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF64748B), letterSpacing: 0.5)),
    );
  }

  // ✨ Professional SaaS Dropdown
  Widget _buildDropdown({required String label, required String value, required List<Map<String, String>> items, required ValueChanged<String?> onChanged}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildLabel(label),
        DropdownButtonFormField<String>(
          value: value,
          icon: const Icon(Icons.keyboard_arrow_down, color: Color(0xFF94A3B8)),
          decoration: InputDecoration(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.grey.shade300)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF8FFF00), width: 2)), // Neon Green Focus
          ),
          items: items.map((item) => DropdownMenuItem(value: item['val'], child: Text(item['label']!, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))))).toList(),
          onChanged: onChanged,
        ),
      ],
    );
  }

  // ✨ Professional Range Input
  Widget _buildRangeInput({required String label, required String hintMin, required String hintMax, required ValueChanged<String> onMinChanged, required ValueChanged<String> onMaxChanged}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildLabel(label),
        Row(
          children: [
            Expanded(child: _inputBox(hintMin, onMinChanged)),
            const Padding(padding: EdgeInsets.symmetric(horizontal: 8), child: Text("-", style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold))),
            Expanded(child: _inputBox(hintMax, onMaxChanged)),
          ],
        ),
      ],
    );
  }

  Widget _inputBox(String hint, ValueChanged<String> onChanged) {
    return TextField(
      onChanged: onChanged,
      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
      textAlign: TextAlign.center,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        contentPadding: const EdgeInsets.symmetric(vertical: 14),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.grey.shade300)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF8FFF00), width: 2)), // Neon Green Focus
      ),
    );
  }
}