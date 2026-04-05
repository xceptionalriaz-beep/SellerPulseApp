import 'package:flutter/material.dart';
import 'widgets/trend_chip.dart';
import 'widgets/seasonal_radar.dart';
import 'widgets/recent_searches.dart';

class ProductResearchLaunchpad extends StatefulWidget {
  final Function(String) onSearch; 

  const ProductResearchLaunchpad({super.key, required this.onSearch});

  @override
  State<ProductResearchLaunchpad> createState() => _ProductResearchLaunchpadState();
}

class _ProductResearchLaunchpadState extends State<ProductResearchLaunchpad> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _handleSearch() {
    String query = _searchController.text.trim();
    if (query.isEmpty) return;
    widget.onSearch(query); 
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(40.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: 40),
          
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(color: const Color(0xFF8FFF00).withAlpha(30), borderRadius: BorderRadius.circular(20)),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.shield, color: Color(0xFF8FFF00), size: 18),
                SizedBox(width: 8),
                Text("SELLERPULSE INTELLIGENCE", style: TextStyle(color: Color(0xFF131B2F), fontWeight: FontWeight.bold, letterSpacing: 1.2, fontSize: 12)),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Text("What do you want to sell today?", style: TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
          const SizedBox(height: 10),
          const Text("Enter a keyword to discover niches, or paste an eBay link for a Deep Dive.", style: TextStyle(fontSize: 16, color: Color(0xFF64748B))),
          
          const SizedBox(height: 40),

          Center(
            child: Container(
              width: 750, height: 65,
              decoration: BoxDecoration(
                color: Colors.white, borderRadius: BorderRadius.circular(16), 
                boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 20, offset: Offset(0, 10))],
                border: Border.all(color: Colors.grey.shade200)
              ),
              child: Row(
                children: [
                  const SizedBox(width: 20),
                  const Icon(Icons.search, color: Color(0xFF94A3B8), size: 28),
                  const SizedBox(width: 15),
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      style: const TextStyle(fontSize: 18),
                      decoration: const InputDecoration(hintText: "Paste an eBay link OR type a keyword...", hintStyle: TextStyle(color: Color(0xFF94A3B8), fontSize: 16), border: InputBorder.none),
                      onSubmitted: (_) => _handleSearch(),
                    ),
                  ),
                  _AnimatedLaunchpadScanButton(onTap: _handleSearch), 
                ],
              ),
            ),
          ),

          const SizedBox(height: 50),

          SizedBox(
            width: 900,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.local_fire_department, color: Colors.orange, size: 20), SizedBox(width: 8),
                    Text("LIVE TRENDS & MOVERS (Spiking last 24h)", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                  ],
                ),
                const SizedBox(height: 15),
                Row(
                  children: [
                    TrendChip(spike: "+410%", name: "Stanley Tumblers", onSearch: widget.onSearch),
                    const SizedBox(width: 15),
                    TrendChip(spike: "+250%", name: "Golf Polos", onSearch: widget.onSearch),
                    const SizedBox(width: 15),
                    TrendChip(spike: "+180%", name: "Desk Mats", onSearch: widget.onSearch),
                  ],
                ),

                const SizedBox(height: 40),

                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Expanded(child: SeasonalRadar()),
                    const SizedBox(width: 30),
                    Expanded(child: RecentSearches(onSearch: widget.onSearch)),
                  ],
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}

class _AnimatedLaunchpadScanButton extends StatefulWidget {
  final VoidCallback onTap;
  const _AnimatedLaunchpadScanButton({required this.onTap});

  @override
  State<_AnimatedLaunchpadScanButton> createState() => _AnimatedLaunchpadScanButtonState();
}

class _AnimatedLaunchpadScanButtonState extends State<_AnimatedLaunchpadScanButton> {
  bool _isHovering = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovering = true),
      onExit: (_) => setState(() => _isHovering = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: 140, height: double.infinity,
          decoration: BoxDecoration(color: _isHovering ? const Color(0xFF8FFF00) : const Color(0xFF131B2F), borderRadius: const BorderRadius.horizontal(right: Radius.circular(15))),
          alignment: Alignment.center,
          child: Text("SCAN NOW", style: TextStyle(color: _isHovering ? Colors.black : Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
        ),
      ),
    );
  }
}