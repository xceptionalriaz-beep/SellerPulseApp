import 'package:flutter/material.dart';

class ProductResearchPage extends StatefulWidget {
  const ProductResearchPage({super.key});

  @override
  State<ProductResearchPage> createState() => _ProductResearchPageState();
}

class _ProductResearchPageState extends State<ProductResearchPage> {
  final TextEditingController _searchController = TextEditingController(text: "https://www.ebay.com/itm/123456789");
  double _sourcingCost = 22.00; // Interactive slider value!

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  // ✨ YOUR CUSTOM NEON ICON STYLING ✨
  Widget _buildNeonIcon(IconData icon) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: const BoxDecoration(
        color: Color(0xFF8FFF00),
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: Colors.black, size: 18),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Calculated mock profit based on the slider
    double salePrice = 49.99;
    double ebayFees = salePrice * 0.1325;
    double netProfit = salePrice - _sourcingCost - ebayFees;
    int margin = ((netProfit / salePrice) * 100).round();

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // --- HEADER & SEARCH BAR ---
          Row(
            children: [
              _buildNeonIcon(Icons.search),
              const SizedBox(width: 15),
              const Text("Deep Dive Analysis", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
              const Spacer(),
              _buildQuickActions(), // Top right actions!
            ],
          ),
          const SizedBox(height: 20),
          
          Container(
            height: 60,
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.shade300)),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    decoration: const InputDecoration(
                      hintText: "Paste eBay link or search keyword...",
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(horizontal: 20),
                    ),
                  ),
                ),
                Container(
                  width: 120, height: double.infinity,
                  decoration: const BoxDecoration(color: Color(0xFF131B2F), borderRadius: BorderRadius.horizontal(right: Radius.circular(11))),
                  child: TextButton(
                    onPressed: () {},
                    child: const Text("SCAN ITEM", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                )
              ],
            ),
          ),
          const SizedBox(height: 20),

          // --- TOP ROW: X-RAY & CHART ---
          Expanded(
            flex: 4,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(flex: 2, child: _buildXRayCard()),
                const SizedBox(width: 20),
                Expanded(flex: 3, child: _buildChartCard()),
              ],
            ),
          ),
          
          const SizedBox(height: 20),

          // --- BOTTOM ROW: PROFIT, INTEL, AI ---
          Expanded(
            flex: 5,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(child: _buildProfitCard(ebayFees, netProfit, margin)),
                const SizedBox(width: 20),
                Expanded(child: _buildIntelCard()),
                const SizedBox(width: 20),
                Expanded(child: _buildAICard()),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 1. COMPETITOR X-RAY CARD
  Widget _buildXRayCard() {
    return _buildCard(
      title: "Competitor X-Ray",
      icon: Icons.document_scanner_outlined,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Container(
                width: 80, height: 80,
                decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.shade200)),
                child: const Icon(Icons.mouse, size: 40, color: Color(0xFF64748B)),
              ),
              const SizedBox(width: 15),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Logitech G502 Hero Wireless Gaming Mouse", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16), maxLines: 2, overflow: TextOverflow.ellipsis),
                    SizedBox(height: 4),
                    Text("Seller: TechDealz (99%)", style: TextStyle(color: Colors.blue, fontSize: 13, decoration: TextDecoration.underline)),
                  ],
                ),
              )
            ],
          ),
          const Spacer(),
          _buildInfoRow(Icons.sell_outlined, "Sold Price:", "\$49.99"),
          const SizedBox(height: 10),
          _buildInfoRow(Icons.local_fire_department_outlined, "Demand:", "EXTREME (Top 1%)", valueColor: Colors.orange.shade700),
          const SizedBox(height: 10),
          _buildInfoRow(Icons.track_changes_outlined, "Listing Quality:", "C (Beat them!)", valueColor: Colors.green.shade600),
        ],
      ),
    );
  }

  // 2. VELOCITY CHART CARD
  Widget _buildChartCard() {
    return _buildCard(
      title: "30-Day Sales Velocity",
      icon: Icons.show_chart,
      child: Column(
        children: [
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.shade200)),
              child: const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.bar_chart, size: 80, color: Color(0xFFE2E8F0)),
                    SizedBox(height: 10),
                    Text("[ Chart rendering engine goes here ]", style: TextStyle(color: Color(0xFF94A3B8))),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _buildNeonIcon(Icons.trending_up),
              const SizedBox(width: 10),
              const Text("Sales are trending UP this week! (342 Total Sold)", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            ],
          )
        ],
      ),
    );
  }

  // 3. INTERACTIVE PROFIT CALCULATOR
  Widget _buildProfitCard(double fees, double netProfit, int margin) {
    return _buildCard(
      title: "Profit Calculator",
      icon: Icons.calculate_outlined,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Est. Sourcing Cost:", style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
              Text("\$${_sourcingCost.toStringAsFixed(2)}", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ],
          ),
          Slider(
            value: _sourcingCost,
            min: 5.0, max: 40.0,
            activeColor: const Color(0xFF8FFF00),
            inactiveColor: Colors.grey.shade200,
            thumbColor: const Color(0xFF131B2F),
            onChanged: (val) => setState(() => _sourcingCost = val),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Est. eBay Fees:", style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
              Text("-\$${fees.toStringAsFixed(2)} (13.25%)", style: const TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
            ],
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(color: const Color(0xFF131B2F), borderRadius: BorderRadius.circular(12)),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("NET PROFIT:", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                Text("\$${netProfit.toStringAsFixed(2)} ($margin%)", style: const TextStyle(color: Color(0xFF8FFF00), fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
          )
        ],
      ),
    );
  }

  // 4. SOURCING & INTEL CARD
  Widget _buildIntelCard() {
    return _buildCard(
      title: "Sourcing & Intel",
      icon: Icons.travel_explore,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Matches (Click to open):", style: TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildMiniSourceBtn(Icons.shopping_cart, "Amz", "\$24.00", Colors.orange),
              _buildMiniSourceBtn(Icons.storefront, "Wal", "\$25.50", Colors.blue),
              _buildMiniSourceBtn(Icons.factory, "Ali", "\$22.00", Colors.redAccent),
            ],
          ),
          const Spacer(),
          const Divider(),
          const Spacer(),
          _buildInfoRow(Icons.inventory_2_outlined, "Stock Spy:", "3 Left (Low)", valueColor: Colors.redAccent),
          const SizedBox(height: 12),
          _buildInfoRow(Icons.warning_amber_rounded, "VERO Risk:", "HIGH (Logitech)", valueColor: Colors.redAccent),
          const SizedBox(height: 12),
          _buildInfoRow(Icons.key, "Top Keywords:", "\"Hero\", \"Wireless\""),
        ],
      ),
    );
  }

  // 5. AI LISTING ASSISTANT
  Widget _buildAICard() {
    return _buildCard(
      title: "AI Listing Assistant",
      icon: Icons.auto_awesome,
      isHighlight: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Optimized Title:", style: TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 5),
          Container(
            padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(8)),
            child: const Row(
              children: [
                Icon(Icons.copy, size: 14, color: Colors.blue), SizedBox(width: 8),
                Expanded(child: Text("Logitech G502 Hero Gaming Mouse Wireless", style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold))),
              ],
            ),
          ),
          const SizedBox(height: 15),
          const Text("Suggested Price:", style: TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 5),
          Container(
            padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(8)),
            child: const Row(
              children: [
                Icon(Icons.copy, size: 14, color: Colors.blue), SizedBox(width: 8),
                Text("\$48.50 ", style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                Text("(Win BuyBox)", style: TextStyle(fontSize: 12, color: Colors.green)),
              ],
            ),
          ),
          const Spacer(),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.edit_document, size: 16),
              label: const Text("Generate Description"),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF131B2F), foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
          )
        ],
      ),
    );
  }

  // --- HELPER WIDGETS ---

  Widget _buildCard({required String title, required IconData icon, required Widget child, bool isHighlight = false}) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isHighlight ? const Color(0xFF8FFF00) : Colors.grey.shade200, width: isHighlight ? 2 : 1),
        boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 5))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _buildNeonIcon(icon),
              const SizedBox(width: 10),
              Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            ],
          ),
          const SizedBox(height: 20),
          Expanded(child: child),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value, {Color? valueColor}) {
    return Row(
      children: [
        Icon(icon, size: 16, color: const Color(0xFF64748B)),
        const SizedBox(width: 8),
        Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
        const SizedBox(width: 5),
        Expanded(child: Text(value, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: valueColor ?? const Color(0xFF1E293B)), overflow: TextOverflow.ellipsis)),
      ],
    );
  }

  Widget _buildMiniSourceBtn(IconData icon, String label, String price, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(color: color.withAlpha(20), borderRadius: BorderRadius.circular(8), border: Border.all(color: color.withAlpha(100))),
      child: Row(
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(price, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: color)),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Row(
      children: [
        _actionBtn(Icons.save, "Save"),
        const SizedBox(width: 10),
        _actionBtn(Icons.download, "Images"),
        const SizedBox(width: 10),
        _actionBtn(Icons.table_view, "CSV"),
      ],
    );
  }

  Widget _actionBtn(IconData icon, String label) {
    return OutlinedButton.icon(
      onPressed: () {},
      icon: Icon(icon, size: 16, color: const Color(0xFF131B2F)),
      label: Text(label, style: const TextStyle(color: Color(0xFF131B2F))),
      style: OutlinedButton.styleFrom(
        side: BorderSide(color: Colors.grey.shade300),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }
}