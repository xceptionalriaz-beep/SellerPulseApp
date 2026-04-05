import 'package:flutter/material.dart';

class ProductDeepDivePage extends StatefulWidget {
  const ProductDeepDivePage({super.key});

  @override
  State<ProductDeepDivePage> createState() => _ProductDeepDivePageState();
}

class _ProductDeepDivePageState extends State<ProductDeepDivePage> {
  final TextEditingController _searchController = TextEditingController(text: "https://www.ebay.com/itm/123456789");
  double _sourcingCost = 22.00;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

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
    double salePrice = 49.99;
    double ebayFees = salePrice * 0.1325;
    double netProfit = salePrice - _sourcingCost - ebayFees;
    int margin = ((netProfit / salePrice) * 100).round();

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // --- HEADER & SHORT SEARCH BAR ---
          Row(
            children: [
              _buildNeonIcon(Icons.search),
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
                    const AnimatedScanButton(), 
                  ],
                ),
              ),
            ],
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

          const SizedBox(height: 15),

          // ✨ THE NEW ANIMATED QUICK ACTIONS
          const Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Icon(Icons.bolt, color: Colors.amber, size: 20),
              SizedBox(width: 5),
              Text("QUICK ACTIONS: ", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
              SizedBox(width: 15),
              AnimatedActionButton(icon: Icons.save, label: "Save"),
              SizedBox(width: 10),
              AnimatedActionButton(icon: Icons.download, label: "Images"),
              SizedBox(width: 10),
              AnimatedActionButton(icon: Icons.table_view, label: "CSV"),
            ],
          )
        ],
      ),
    );
  }

  // 1. COMPETITOR X-RAY CARD
  Widget _buildXRayCard() {
    return _buildCard(
      title: "Competitor X-Ray", icon: Icons.document_scanner_outlined,
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
      title: "30-Day Sales Velocity", icon: Icons.show_chart,
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
      title: "Profit Calculator", icon: Icons.calculate_outlined,
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
            value: _sourcingCost, min: 5.0, max: 40.0,
            activeColor: const Color(0xFF8FFF00), inactiveColor: Colors.grey.shade200, thumbColor: const Color(0xFF131B2F),
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
      title: "Sourcing & Intel", icon: Icons.travel_explore,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Matches (Click to open):", style: TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          
          // ✨ THE NEW ANIMATED LOGO BUTTONS ✨
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              AnimatedSourceButton(domain: "amazon.com", price: "\$24.00", color: Colors.orange),
              AnimatedSourceButton(domain: "walmart.com", price: "\$25.50", color: Colors.blue),
              AnimatedSourceButton(domain: "aliexpress.com", price: "\$22.00", color: Colors.redAccent),
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
      title: "AI Listing Assistant", icon: Icons.auto_awesome, isHighlight: true,
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

  Widget _buildCard({required String title, required IconData icon, required Widget child, bool isHighlight = false}) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isHighlight ? const Color(0xFF8FFF00) : Colors.grey.shade200, width: isHighlight ? 2 : 1),
        boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 5))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _buildNeonIcon(icon), const SizedBox(width: 10),
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
        Icon(icon, size: 16, color: const Color(0xFF64748B)), const SizedBox(width: 8),
        Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)), const SizedBox(width: 5),
        Expanded(child: Text(value, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: valueColor ?? const Color(0xFF1E293B)), overflow: TextOverflow.ellipsis)),
      ],
    );
  }
}

// =========================================================================
// ✨ MAGIC CUSTOM WIDGETS BELOW ✨
// =========================================================================

// 1. The Real Logo Pop-Up Button
class AnimatedSourceButton extends StatefulWidget {
  final String domain;
  final String price;
  final Color color;

  const AnimatedSourceButton({super.key, required this.domain, required this.price, required this.color});

  @override
  State<AnimatedSourceButton> createState() => _AnimatedSourceButtonState();
}

class _AnimatedSourceButtonState extends State<AnimatedSourceButton> {
  bool _isHovering = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovering = true),
      onExit: (_) => setState(() => _isHovering = false),
      child: GestureDetector(
        onTap: () {}, // Opens affiliate link!
        child: AnimatedScale(
          scale: _isHovering ? 1.08 : 1.0, // This makes it "pop up"
          duration: const Duration(milliseconds: 150),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: widget.color.withAlpha(20), 
              borderRadius: BorderRadius.circular(10), 
              border: Border.all(color: widget.color.withAlpha(100), width: _isHovering ? 2 : 1), // Thicker border on hover
            ),
            child: Row(
              children: [
                // Uses Google's Favicon API to grab the real logo automatically!
                Image.network(
                  'https://www.google.com/s2/favicons?domain=${widget.domain}&sz=64',
                  width: 16, height: 16,
                  errorBuilder: (context, error, stackTrace) => Icon(Icons.shopping_bag, size: 16, color: widget.color),
                ),
                const SizedBox(width: 6),
                Text(widget.price, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: widget.color)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// 2. The Quick Action Button (Turns Neon Green on Hover!)
class AnimatedActionButton extends StatefulWidget {
  final IconData icon;
  final String label;

  const AnimatedActionButton({super.key, required this.icon, required this.label});

  @override
  State<AnimatedActionButton> createState() => _AnimatedActionButtonState();
}

class _AnimatedActionButtonState extends State<AnimatedActionButton> {
  bool _isHovering = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovering = true),
      onExit: (_) => setState(() => _isHovering = false),
      child: InkWell(
        onTap: () {},
        borderRadius: BorderRadius.circular(8),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: _isHovering ? const Color(0xFF8FFF00) : Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: _isHovering ? const Color(0xFF8FFF00) : Colors.grey.shade300),
          ),
          child: Row(
            children: [
              Icon(widget.icon, size: 16, color: const Color(0xFF131B2F)),
              const SizedBox(width: 6),
              Text(
                widget.label, 
                style: const TextStyle(color: Color(0xFF131B2F), fontWeight: FontWeight.bold)
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// 3. The Scan Button (Turns Neon Green!)
class AnimatedScanButton extends StatefulWidget {
  const AnimatedScanButton({super.key});

  @override
  State<AnimatedScanButton> createState() => _AnimatedScanButtonState();
}

class _AnimatedScanButtonState extends State<AnimatedScanButton> {
  bool _isHovering = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovering = true),
      onExit: (_) => setState(() => _isHovering = false),
      child: GestureDetector(
        onTap: () {}, 
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: 120, height: double.infinity,
          decoration: BoxDecoration(
            color: _isHovering ? const Color(0xFF8FFF00) : const Color(0xFF131B2F),
            borderRadius: const BorderRadius.horizontal(right: Radius.circular(11)),
          ),
          alignment: Alignment.center,
          child: Text(
            "SCAN ITEM",
            style: TextStyle(color: _isHovering ? Colors.black : Colors.white, fontWeight: FontWeight.bold),
          ),
        ),
      ),
    );
  }
}