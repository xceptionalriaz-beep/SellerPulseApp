import 'package:flutter/material.dart';
import '../../widgets/market_trend_chart.dart';

class ProductListViewPage extends StatefulWidget {
  final String searchQuery;
  final Function(String) onSearch; 
  
  const ProductListViewPage({super.key, required this.searchQuery, required this.onSearch});

  @override
  State<ProductListViewPage> createState() => _ProductListViewPageState();
}

class _ProductListViewPageState extends State<ProductListViewPage> {
  bool _hideVero = false;
  bool _minMargin = false;
  bool _usOnly = false;
  bool _dropshipSafe = true; 
  bool _hideAds = false;     
  bool _selectAll = false;
  int _currentPage = 1;

  late TextEditingController _topSearchController;
  
  // ✨ NEW: The list that holds all the keyword "Chips"
  List<String> _searchTags = [];

  @override
  void initState() {
    super.initState();
    _topSearchController = TextEditingController();
    
    // Automatically turn their initial search into the first chip!
    if (widget.searchQuery.isNotEmpty) {
      // Split by comma just in case they typed "dog, cat" in the launchpad
      _searchTags = widget.searchQuery.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
    }
  }

  @override
  void dispose() {
    _topSearchController.dispose();
    super.dispose();
  }

  // ✨ NEW: Logic to add a tag
  void _addTag(String value) {
    String cleanValue = value.replaceAll(',', '').trim();
    if (cleanValue.isNotEmpty && !_searchTags.contains(cleanValue)) {
      setState(() {
        _searchTags.add(cleanValue);
        _topSearchController.clear();
      });
    } else {
      _topSearchController.clear();
    }
  }

  // ✨ NEW: The Advanced Filters Modal
  void _showAdvancedFilters(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          child: Container(
            width: 500, padding: const EdgeInsets.all(30),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text("⚙️ Advanced Filters", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                    IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
                  ],
                ),
                const SizedBox(height: 20),
                const Text("Price Range (\$)", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                Row(
                  children: [
                    Expanded(child: TextField(decoration: InputDecoration(hintText: "Min", border: OutlineInputBorder(borderRadius: BorderRadius.circular(8))))),
                    const Padding(padding: EdgeInsets.symmetric(horizontal: 10), child: Text("-")),
                    Expanded(child: TextField(decoration: InputDecoration(hintText: "Max", border: OutlineInputBorder(borderRadius: BorderRadius.circular(8))))),
                  ],
                ),
                const SizedBox(height: 20),
                const Text("Minimum Monthly Sales", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                const SizedBox(height: 10),
                Slider(value: 50, min: 0, max: 500, activeColor: const Color(0xFF8FFF00), thumbColor: const Color(0xFF131B2F), onChanged: (val) {}),
                const SizedBox(height: 30),
                SizedBox(
                  width: double.infinity, height: 50,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF131B2F), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                    child: const Text("Apply Filters", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                  ),
                )
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildNeonIcon(IconData icon) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: const BoxDecoration(color: Color(0xFF8FFF00), shape: BoxShape.circle),
      child: Icon(icon, color: Colors.black, size: 18),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Generate a beautiful title based on their tags
    String displayTitle = _searchTags.isEmpty ? "All Market Results" : "Market Results for \"${_searchTags.join(', ')}\"";

    return Padding(
      padding: const EdgeInsets.all(30.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // --- 1. HEADER ROW ---
          Row(
            children: [
              _buildNeonIcon(Icons.list_alt),
              const SizedBox(width: 15),
              // Truncate title if it gets too long
              SizedBox(
                width: 300, 
                child: Text(displayTitle, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)), overflow: TextOverflow.ellipsis),
              ),
              
              const Spacer(), 
              
              // ✨ THE UPGRADED MULTI-TAG SEARCH BAR ✨
              Container(
                width: 450, height: 46, // Made slightly taller to fit chips nicely
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.grey.shade300)),
                child: Row(
                  children: [
                    const SizedBox(width: 12),
                    const Icon(Icons.search, size: 18, color: Color(0xFF94A3B8)),
                    const SizedBox(width: 8),
                    
                    Expanded(
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            // Draw the Chips
                            ..._searchTags.map((tag) => Padding(
                              padding: const EdgeInsets.only(right: 6.0),
                              child: Chip(
                                label: Text(tag, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                onDeleted: () => setState(() => _searchTags.remove(tag)),
                                backgroundColor: const Color(0xFF8FFF00).withAlpha(40),
                                side: BorderSide.none,
                                deleteIcon: const Icon(Icons.close, size: 14),
                                visualDensity: VisualDensity.compact,
                                padding: EdgeInsets.zero,
                              ),
                            )),
                            
                            // The actual text input field
                            SizedBox(
                              width: 150, // Minimum width for typing
                              child: TextField(
                                controller: _topSearchController,
                                decoration: InputDecoration(
                                  hintText: _searchTags.isEmpty ? "Type keyword & hit Enter..." : "Add more...",
                                  hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
                                  border: InputBorder.none,
                                  isDense: true,
                                ),
                                onSubmitted: _addTag, // Adds tag on Enter
                                onChanged: (value) {
                                  // Adds tag if they type a comma!
                                  if (value.endsWith(',')) {
                                    _addTag(value);
                                  }
                                },
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    
                    // The Scan Button fires the search with ALL tags combined!
                    _MiniScanButton(onTap: () {
                      // If there is leftover text in the box, add it as a tag first
                      if (_topSearchController.text.trim().isNotEmpty) {
                        _addTag(_topSearchController.text);
                      }
                      if (_searchTags.isNotEmpty) {
                        widget.onSearch(_searchTags.join(', '));
                      }
                    }),
                  ],
                ),
              ),
              const SizedBox(width: 15),
              
              _buildTopButton(Icons.tune, "Advanced Filters", onTap: () => _showAdvancedFilters(context)),
              const SizedBox(width: 10),
              _buildTopButton(Icons.sort, "Sort: Opp Score 🔥", isHighlight: true, onTap: () {}),
            ],
          ),
          const SizedBox(height: 20),

          // --- 2. NICHE OVERVIEW & TREND CHART ---
          SizedBox(
            height: 180, 
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(
                  flex: 4,
                  child: Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text("📊 NICHE OVERVIEW", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B), letterSpacing: 1.1)),
                        const SizedBox(height: 10),
                        _buildNicheStatRow(Icons.monetization_on_outlined, "Market Vol:", "\$142,500"),
                        _buildNicheStatRow(Icons.sell_outlined, "Avg Price:", "\$16.50"),
                        _buildNicheStatRow(Icons.track_changes, "Success Rate:", "64% (High)", valueColor: Colors.green),
                        _buildNicheStatRow(Icons.inventory_2_outlined, "Total Active:", "140,000+ listings"),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 20),
                Expanded(flex: 7, child: MarketTrendChart(searchQuery: widget.searchQuery)),
              ],
            ),
          ),
          const SizedBox(height: 25),

          // --- 3. QUICK FILTERS & ACTIONS BAR ---
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                const Text("⚡ QUICK FILTERS: ", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B), fontSize: 13)),
                const SizedBox(width: 10),
                _buildQuickFilter("Hide VERO", _hideVero, (val) => setState(() => _hideVero = val!)),
                const SizedBox(width: 15),
                _buildQuickFilter("Min 30% Margin", _minMargin, (val) => setState(() => _minMargin = val!)),
                const SizedBox(width: 15),
                _buildQuickFilter("US Shippers", _usOnly, (val) => setState(() => _usOnly = val!)),
                const SizedBox(width: 15),
                _buildQuickFilter("Dropship Safe", _dropshipSafe, (val) => setState(() => _dropshipSafe = val!)),
                const SizedBox(width: 15),
                _buildQuickFilter("Hide Ads", _hideAds, (val) => setState(() => _hideAds = val!)),
                
                const SizedBox(width: 30),
                Container(width: 1, height: 20, color: Colors.grey.shade300),
                const SizedBox(width: 20),
                
                Checkbox(value: _selectAll, onChanged: (val) => setState(() => _selectAll = val!), activeColor: const Color(0xFF8FFF00), checkColor: Colors.black),
                const Text("Select All", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                const SizedBox(width: 20),
                
                _buildActionBtn(Icons.download, "Export Selected"),
                const SizedBox(width: 10),
                _buildActionBtn(Icons.save, "Save Selected"),
              ],
            ),
          ),
          const SizedBox(height: 15),

          // --- 4. THE DATA TABLE ---
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white, borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
                boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 20, offset: Offset(0, 10))],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 15),
                      color: const Color(0xFFF8FAFC),
                      child: Row(
                        children: [
                          const SizedBox(width: 40), 
                          _headerText("PRODUCT", flex: 4),
                          _headerText("SCORE", flex: 1),
                          _headerText("SALES", flex: 1),
                          _headerText("RETURNS", flex: 1),
                          _headerText("VERO RISK", flex: 1),
                          _headerText("MARGIN", flex: 1),
                          _headerText("ACTION", flex: 1, alignRight: true),
                        ],
                      ),
                    ),
                    const Divider(height: 1, color: Color(0xFFE2E8F0)),
                    
                    Expanded(
                      child: ListView(
                        children: [
                          _HoverableDataRow(
                            imageUrl: "https://m.media-amazon.com/images/I/71N-A3BqK-L._AC_SX679_.jpg", title: "Chewy Bone Dog Toy Indestructible Tough Play 📦", veroWord: null,
                            flag: "🇺🇸", score: "🔥 98", sales: "142 (850%)", returns: "🟢 2% (Safe)", risk: "🛡️ Safe", margin: "🟢 42%", actionColor: Colors.redAccent, actionLabel: "Ali",
                            isSelected: _selectAll,
                          ),
                          _HoverableDataRow(
                            imageUrl: "https://m.media-amazon.com/images/I/71o0S4K-dIL._AC_SX679_.jpg", title: "Chuckit! Classic Launcher Dog Toy Thrower 26M 📷", veroWord: "Chuckit!", 
                            flag: "🇨🇳", score: "⭐ 74", sales: "89 (120%)", returns: "🔴 14% (High)", risk: "⚠️ Med", margin: "🟢 31%", actionColor: Colors.orange, actionLabel: "Amz",
                            isSelected: _selectAll,
                          ),
                          _HoverableDataRow(
                            imageUrl: "https://m.media-amazon.com/images/I/61KxT3YVvVL._AC_SX679_.jpg", title: "KONG Classic Dog Toy Durable Natural Rubber 🎨", veroWord: "KONG",
                            flag: "🇺🇸", score: "❌ 12", sales: "410 (2100%)", returns: "🟡 8% (Med)", risk: "🛑 VERO", margin: "🔴 8%", actionColor: Colors.blue, actionLabel: "Wal",
                            isSelected: _selectAll,
                          ),
                          _HoverableDataRow(
                            imageUrl: "https://m.media-amazon.com/images/I/71x4nUqNnNL._AC_SX679_.jpg", title: "Earth Rated Dog Poop Bags, Extra Thick and Strong", veroWord: null,
                            flag: "🇨🇳", score: "⭐ 82", sales: "650 (400%)", returns: "🟢 1% (Safe)", risk: "🛡️ Safe", margin: "🟢 28%", actionColor: Colors.orange, actionLabel: "Amz",
                            isSelected: _selectAll,
                          ),
                          
                          const SizedBox(height: 20),
                          const Divider(height: 1, color: Color(0xFFE2E8F0)),
                          Padding(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              children: [
                                const Text("Showing Results 1 - 50 of 140,000", style: TextStyle(color: Color(0xFF64748B), fontSize: 13, fontWeight: FontWeight.bold)),
                                const SizedBox(height: 15),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    _buildPageNavBtn("Previous", Icons.chevron_left, isDisabled: _currentPage == 1),
                                    const SizedBox(width: 10),
                                    _buildPageNumber(1), _buildPageNumber(2), _buildPageNumber(3), _buildPageNumber(4),
                                    const Padding(padding: EdgeInsets.symmetric(horizontal: 10), child: Text("...", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey))),
                                    _buildPageNumber(10), _buildPageNumber(20),
                                    const SizedBox(width: 10),
                                    _buildPageNavBtn("Next", Icons.chevron_right, isNext: true),
                                  ],
                                ),
                              ],
                            ),
                          )
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  // --- HELPER WIDGETS ---

  Widget _buildNicheStatRow(IconData icon, String label, String value, {Color? valueColor}) {
    return Row(
      children: [
        Icon(icon, size: 18, color: const Color(0xFF94A3B8)),
        const SizedBox(width: 10),
        Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
        const Spacer(),
        Text(value, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: valueColor ?? const Color(0xFF1E293B))),
      ],
    );
  }

  Widget _buildPageNumber(int page) {
    bool isActive = _currentPage == page;
    return InkWell(
      onTap: () => setState(() => _currentPage = page),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        width: 36, height: 36,
        decoration: BoxDecoration(color: isActive ? const Color(0xFF8FFF00) : Colors.transparent, borderRadius: BorderRadius.circular(8), border: Border.all(color: isActive ? const Color(0xFF8FFF00) : Colors.grey.shade300)),
        alignment: Alignment.center,
        child: Text(page.toString(), style: TextStyle(fontWeight: FontWeight.bold, color: isActive ? Colors.black : const Color(0xFF1E293B))),
      ),
    );
  }

  Widget _buildPageNavBtn(String label, IconData icon, {bool isNext = false, bool isDisabled = false}) {
    return OutlinedButton(
      onPressed: isDisabled ? null : () { setState(() => isNext ? _currentPage++ : _currentPage--); },
      style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14), side: BorderSide(color: isDisabled ? Colors.grey.shade200 : Colors.grey.shade300), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
      child: Row(
        children: [
          if (!isNext) Icon(icon, size: 16, color: isDisabled ? Colors.grey : const Color(0xFF1E293B)),
          if (!isNext) const SizedBox(width: 6),
          Text(label, style: TextStyle(fontWeight: FontWeight.bold, color: isDisabled ? Colors.grey : const Color(0xFF1E293B))),
          if (isNext) const SizedBox(width: 6),
          if (isNext) Icon(icon, size: 16, color: isDisabled ? Colors.grey : const Color(0xFF1E293B)),
        ],
      ),
    );
  }

  Widget _buildQuickFilter(String label, bool value, ValueChanged<bool?> onChanged) {
    return Row(
      children: [
        SizedBox(height: 24, width: 24, child: Checkbox(value: value, onChanged: onChanged, activeColor: const Color(0xFF8FFF00), checkColor: Colors.black, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)))),
        const SizedBox(width: 8),
        Text(label, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF1E293B), fontSize: 13)),
      ],
    );
  }

  Widget _headerText(String text, {required int flex, bool alignRight = false}) {
    return Expanded(flex: flex, child: Text(text, textAlign: alignRight ? TextAlign.right : TextAlign.left, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF64748B))));
  }

  Widget _buildTopButton(IconData icon, String label, {bool isHighlight = false, required VoidCallback onTap}) {
    return OutlinedButton.icon(
      onPressed: onTap, icon: Icon(icon, size: 16, color: isHighlight ? Colors.black : const Color(0xFF64748B)), 
      label: Text(label, style: TextStyle(color: isHighlight ? Colors.black : const Color(0xFF64748B), fontWeight: isHighlight ? FontWeight.bold : FontWeight.normal)),
      style: OutlinedButton.styleFrom(backgroundColor: isHighlight ? const Color(0xFF8FFF00) : Colors.transparent, side: BorderSide(color: isHighlight ? const Color(0xFF8FFF00) : Colors.grey.shade300), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
    );
  }

  Widget _buildActionBtn(IconData icon, String label) {
    return OutlinedButton.icon(
      onPressed: () {}, icon: Icon(icon, size: 16, color: const Color(0xFF131B2F)), label: Text(label, style: const TextStyle(color: Color(0xFF131B2F), fontWeight: FontWeight.bold)),
      style: OutlinedButton.styleFrom(side: BorderSide(color: Colors.grey.shade300), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
    );
  }
}

// =========================================================================
// ✨ MAGIC WIDGETS BELOW ✨
// =========================================================================

class _MiniScanButton extends StatefulWidget {
  final VoidCallback onTap;
  const _MiniScanButton({required this.onTap});

  @override
  State<_MiniScanButton> createState() => _MiniScanButtonState();
}

class _MiniScanButtonState extends State<_MiniScanButton> {
  bool _isHovering = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovering = true),
      onExit: (_) => setState(() => _isHovering = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(horizontal: 16),
          height: double.infinity,
          decoration: BoxDecoration(color: _isHovering ? const Color(0xFF8FFF00) : const Color(0xFF131B2F), borderRadius: const BorderRadius.horizontal(right: Radius.circular(7))),
          alignment: Alignment.center,
          child: Text("SCAN", style: TextStyle(color: _isHovering ? Colors.black : Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
        ),
      ),
    );
  }
}

class _HoverableDataRow extends StatefulWidget {
  final String imageUrl, title, flag, score, sales, returns, risk, margin, actionLabel;
  final String? veroWord;
  final Color actionColor;
  final bool isSelected;

  const _HoverableDataRow({
    required this.imageUrl, required this.title, this.veroWord, required this.flag, 
    required this.score, required this.sales, required this.returns, required this.risk, 
    required this.margin, required this.actionColor, required this.actionLabel, required this.isSelected
  });

  @override
  State<_HoverableDataRow> createState() => _HoverableDataRowState();
}

class _HoverableDataRowState extends State<_HoverableDataRow> {
  bool _isHovering = false;
  late bool _isChecked;

  @override
  void initState() {
    super.initState();
    _isChecked = widget.isSelected;
  }

  @override
  void didUpdateWidget(covariant _HoverableDataRow oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isSelected != oldWidget.isSelected) {
      _isChecked = widget.isSelected;
    }
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
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 15),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Checkbox(
              value: _isChecked, 
              onChanged: (val) => setState(() => _isChecked = val!), 
              activeColor: const Color(0xFF8FFF00), checkColor: Colors.black
            ),
            
            Expanded(
              flex: 4,
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
                  Text(widget.flag, style: const TextStyle(fontSize: 18)),
                  const SizedBox(width: 8),
                  Expanded(child: _buildTitleWithVeroHighlight(widget.title, widget.veroWord)), 
                ],
              ),
            ),
            
            Expanded(flex: 1, child: Text(widget.score, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13))),
            Expanded(flex: 1, child: Text(widget.sales, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF1E293B), fontSize: 13))),
            Expanded(flex: 1, child: Text(widget.returns, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
            Expanded(flex: 1, child: Text(widget.risk, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
            Expanded(flex: 1, child: Text(widget.margin, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13))),
            
            Expanded(
              flex: 1, 
              child: Align(
                alignment: Alignment.centerRight,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(color: widget.actionColor.withAlpha(20), borderRadius: BorderRadius.circular(8), border: Border.all(color: widget.actionColor.withAlpha(100))),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.search, size: 14, color: widget.actionColor),
                      const SizedBox(width: 4),
                      Text(widget.actionLabel, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: widget.actionColor)),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTitleWithVeroHighlight(String title, String? veroWord) {
    if (veroWord == null || veroWord.isEmpty || !title.toLowerCase().contains(veroWord.toLowerCase())) {
      return Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B), fontSize: 13));
    }
    int startIndex = title.toLowerCase().indexOf(veroWord.toLowerCase());
    String part1 = title.substring(0, startIndex);
    String highlight = title.substring(startIndex, startIndex + veroWord.length);
    String part2 = title.substring(startIndex + veroWord.length);

    return RichText(
      text: TextSpan(
        style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B), fontSize: 13, fontFamily: 'Roboto'),
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
                  Text(highlight, style: TextStyle(color: Colors.red.shade900, fontWeight: FontWeight.w900, fontSize: 12)),
                ],
              ),
            ),
          ),
          TextSpan(text: part2),
        ],
      ),
    );
  }
}