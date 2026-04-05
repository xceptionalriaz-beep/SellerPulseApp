import 'package:flutter/material.dart';

class ProductResearchLaunchpad extends StatefulWidget {
  final Function(String) onSearch; // ✨ NEW: The wire that connects to the Dashboard!

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
    
    // ✨ FIX: This sends the search word up to the Dashboard's Traffic Cop!
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
                    _buildTrendChip("+410%", "Stanley Tumblers"),
                    const SizedBox(width: 15),
                    _buildTrendChip("+250%", "Golf Polos"),
                    const SizedBox(width: 15),
                    _buildTrendChip("+180%", "Desk Mats"),
                  ],
                ),

                const SizedBox(height: 40),

                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(child: _buildSeasonalRadar()),
                    const SizedBox(width: 30),
                    Expanded(child: _buildRecentSearches()),
                  ],
                )
              ],
            ),
          )
        ],
      ),
    );
  }

  // ✨ FIX: Clicking a trend instantly searches it!
  Widget _buildTrendChip(String spike, String name) {
    return InkWell(
      onTap: () => widget.onSearch(name), 
      borderRadius: BorderRadius.circular(30),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(30), border: Border.all(color: Colors.grey.shade200)),
        child: Row(
          children: [
            const Icon(Icons.trending_up, color: Colors.green, size: 16), const SizedBox(width: 6),
            Text(spike, style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)), const SizedBox(width: 8),
            Text(name, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
          ],
        ),
      ),
    );
  }

  Widget _buildSeasonalRadar() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.calendar_month, color: Color(0xFF64748B), size: 20), SizedBox(width: 10),
              Text("SEASONAL RADAR (Source Now!)", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            ],
          ),
          const SizedBox(height: 20),
          _buildRadarItem("🎓 Graduation Season", "In 40 Days", "Trending: Gift boxes, dorm decor"),
          const Divider(height: 30),
          _buildRadarItem("🏖️ Summer Travel", "In 60 Days", "Trending: Luggage tags, neck pillows"),
        ],
      ),
    );
  }

  Widget _buildRadarItem(String event, String time, String trending) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(event, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(color: Colors.orange.withAlpha(20), borderRadius: BorderRadius.circular(6)),
              child: Text(time, style: const TextStyle(color: Colors.orange, fontWeight: FontWeight.bold, fontSize: 12)),
            )
          ],
        ),
        const SizedBox(height: 5),
        Text(trending, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
      ],
    );
  }

  Widget _buildRecentSearches() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.push_pin, color: Color(0xFF64748B), size: 20), SizedBox(width: 10),
              Text("PINNED & RECENT", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            ],
          ),
          const SizedBox(height: 20),
          _buildSearchItem(Icons.push_pin, "Logitech G502 Mouse", "Pinned", true),
          const SizedBox(height: 15),
          _buildSearchItem(Icons.push_pin, "Dog Toys", "Pinned", true),
          const Divider(height: 30),
          _buildSearchItem(Icons.history, "https://ebay.com/itm/882...", "Analyzed 1 hr ago", false, query: "https://ebay.com/itm/882"),
        ],
      ),
    );
  }

  Widget _buildSearchItem(IconData icon, String title, String subtitle, bool isPinned, {String? query}) {
    return Row(
      children: [
        Icon(icon, size: 16, color: isPinned ? Colors.blue : const Color(0xFF94A3B8)), const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14), overflow: TextOverflow.ellipsis),
              Text(subtitle, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
            ],
          ),
        ),
        TextButton(
          onPressed: () => widget.onSearch(query ?? title), // ✨ FIX: Clicking scans instantly!
          child: const Text("Scan", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF131B2F))),
        )
      ],
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