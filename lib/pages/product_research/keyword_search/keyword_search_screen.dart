import 'dart:convert';
import 'dart:html' as html;
import 'package:fl_chart/fl_chart.dart'; 
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../widgets/market_trend_chart.dart'; 
import '../../../../core/services/market_brain_service.dart'; 

import '../shared/neon_icon.dart';
import '../shared/universal_scan_button.dart';
import 'widgets/niche_overview_card.dart';
import 'widgets/advanced_filters_modal.dart';
// ✨ IMPORT THE NEW INTELLIGENCE ROW
import 'widgets/intelligence_row.dart'; 

class KeywordSearchScreen extends StatefulWidget {
  final String searchQuery;
  final Function(String) onSearch; 
  
  const KeywordSearchScreen({super.key, required this.searchQuery, required this.onSearch});

  @override
  State<KeywordSearchScreen> createState() => _KeywordSearchScreenState();
}

class _KeywordSearchScreenState extends State<KeywordSearchScreen> {
  bool _hideVero = false;
  bool _minMargin = false;
  bool _usOnly = false;
  bool _dropshipSafe = true;     
  bool _hideAds = false;     
  
  int _currentPage = 1;

  late TextEditingController _topSearchController;
  List<String> _searchTags = [];
  
  bool _isLoading = false;
  List<dynamic> _liveProducts = [];
  String _errorMessage = "";

  String _nicheMarketVol = "\$0";
  String _nicheAvgPrice = "\$0.00";
  String _nicheSuccessRate = "0%";
  String _nicheTotalActive = "0";
  Color _nicheSuccessColor = Colors.grey;
  double _nicheSaturationScore = 0.0;
  String _nicheAdInsight = "Analyzing competition...";
  List<FlSpot> _historicalSalesData = [];

  // ✨ BULK ACTION STATE TRACKERS
  bool _selectAll = false;
  Set<String> _selectedItemIds = {}; // Remembers which rows are checked
  Map<String, double> _itemProfits = {}; // Remembers the live profit of each row

  // Math to calculate total potential profit
  double get _totalPotentialProfit {
    double total = 0.0;
    for (String id in _selectedItemIds) {
      total += _itemProfits[id] ?? 0.0;
    }
    return total;
  }

  @override
  void initState() {
    super.initState();
    _topSearchController = TextEditingController();
    
    if (widget.searchQuery.isNotEmpty) {
      _searchTags = widget.searchQuery.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
      _fetchLiveData(widget.searchQuery); 
    }
  }

  @override
  void dispose() {
    _topSearchController.dispose();
    super.dispose();
  }

  Future<void> _fetchLiveData(String query) async {
    if (query.isEmpty) return;
    
    setState(() {
      _isLoading = true;
      _liveProducts.clear(); 
      _historicalSalesData.clear(); 
      _errorMessage = ""; 
      // Reset selections when page loads new data
      _selectedItemIds.clear(); 
      _selectAll = false;
    });

    try {
      final result = await MarketBrainService.conductResearch(query, _currentPage);

      setState(() {
        _nicheTotalActive = result.nicheTotalActive;
        _nicheAvgPrice = result.nicheAvgPrice;
        _nicheMarketVol = result.nicheMarketVol;
        _nicheSuccessRate = result.nicheSuccessRate;
        _nicheSuccessColor = result.nicheSuccessColor;
        _nicheSaturationScore = result.nicheSaturationScore;
        _nicheAdInsight = result.nicheAdInsight;
        _historicalSalesData = result.historicalSalesData;
        _liveProducts = result.liveProducts;
        _isLoading = false;
      });

    } catch (e) {
      setState(() {
        _errorMessage = "🚨 Backend Connection Issue: $e";
        _isLoading = false;
      });
    }
  }

  void _addTag(String value) {
    String cleanValue = value.replaceAll(',', '').trim();
    if (cleanValue.isNotEmpty && !_searchTags.contains(cleanValue)) {
      setState(() {
        _searchTags.add(cleanValue);
        _topSearchController.clear();
        _currentPage = 1; 
        _fetchLiveData(_searchTags.join(', '));
      });
    } else {
      _topSearchController.clear();
    }
  }

  // ✨ BULK SELECTION LOGIC
  void _toggleSelectAll(bool? val) {
    setState(() {
      _selectAll = val ?? false;
      if (_selectAll) {
        _selectedItemIds.clear();
        for (var item in _liveProducts) {
          String id = item["itemId"] ?? item["itemWebUrl"] ?? "unique_${_liveProducts.indexOf(item)}";
          _selectedItemIds.add(id);
        }
      } else {
        _selectedItemIds.clear();
      }
    });
  }

  // ✨ ACTION: SAVE TO SUPABASE WATCHLIST (With Free Tier Logic Gate)
  Future<void> _saveToWatchlist() async {
    final supabase = Supabase.instance.client;
    final userId = supabase.auth.currentUser?.id;

    if (userId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Please log in to save items.")));
      return;
    }

    setState(() => _isLoading = true);

    try {
      // 1. THE COUNT CHECK
      final countResponse = await supabase
          .from('user_watchlist')
          .select('id')
          .eq('user_id', userId)
          .count(CountOption.exact);

      int currentSavedCount = countResponse.count ?? 0;
      int itemsTryingToSave = _selectedItemIds.length;

      // 2. THE LOGIC GATE (Change this to 2 to test the popup immediately!)
      const int FREE_TIER_LIMIT = 2;

      if (currentSavedCount + itemsTryingToSave > FREE_TIER_LIMIT) {
        setState(() => _isLoading = false);
        _showUpgradeDialog(currentSavedCount, FREE_TIER_LIMIT);
        return; 
      }

      // 3. IF UNDER LIMIT, PROCEED TO SAVE
      final List<Map<String, dynamic>> itemsToSave = [];

      for (var id in _selectedItemIds) {
        final item = _liveProducts.firstWhere((p) => (p["itemId"] ?? p["itemWebUrl"] ?? p.toString()) == id, orElse: () => {});
        if (item.isNotEmpty) {
          itemsToSave.add({
            'user_id': userId,
            'ebay_id': id,
            'title': item['title'],
            'price': item['sales'],
            'image_url': item['image'],
          });
        }
      }

      await supabase.from('user_watchlist').upsert(itemsToSave, onConflict: 'user_id, ebay_id');

      setState(() { 
        _isLoading = false;
        _selectedItemIds.clear(); 
        _selectAll = false; 
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("🚀 Saved ${itemsToSave.length} items! (${currentSavedCount + itemsTryingToSave}/$FREE_TIER_LIMIT used)"), backgroundColor: Colors.green)
        );
      }

    } catch (e) {
      setState(() => _isLoading = false);
      debugPrint("Error saving to watchlist: $e");
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("🚨 Error saving items."), backgroundColor: Colors.red));
    }
  }

  // ✨ ACTION: EXPORT TO CSV (Fixed MIME Type and Commas)
  void _downloadCSV() {
    // 1. Create Headers
    List<List<String>> rows = [
      ["Title", "eBay Price", "Est. Profit", "Item Link"]
    ];

    // 2. Add Selected Data
    for (var id in _selectedItemIds) {
      final item = _liveProducts.firstWhere((p) => (p["itemId"] ?? p["itemWebUrl"] ?? p.toString()) == id, orElse: () => {});
      if (item.isNotEmpty) {
        rows.add([
          item["title"]?.replaceAll(',', '') ?? "Unknown", // Remove commas to prevent breaking CSV layout
          item["sales"] ?? "0",
          "\$${_itemProfits[id]?.toStringAsFixed(2) ?? '0.00'}",
          item["itemWebUrl"] ?? "No Link"
        ]);
      }
    }

    // 3. Generate CSV String
    String csvContent = rows.map((row) => row.map((field) => '"$field"').join(',')).join('\n');
    
    // 4. ✨ FIX: Explicitly set MIME type to 'text/csv'
    final bytes = utf8.encode(csvContent);
    final blob = html.Blob([bytes], 'text/csv'); 
    final url = html.Url.createObjectUrlFromBlob(blob);
    
    // 5. ✨ FIX: Ensure the extension is strictly .csv
    final anchor = html.AnchorElement(href: url)
      ..setAttribute("download", "SellerPulse_Export_${DateTime.now().millisecondsSinceEpoch}.csv")
      ..click();
      
    html.Url.revokeObjectUrl(url);
  }

  // ✨ THE PAYWALL POPUP
  void _showUpgradeDialog(int currentCount, int limit) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          child: Container(
            padding: const EdgeInsets.all(30),
            width: 400,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(15),
                  decoration: BoxDecoration(color: Colors.orange.withAlpha(20), shape: BoxShape.circle),
                  child: const Icon(Icons.workspace_premium, color: Colors.orange, size: 40),
                ),
                const SizedBox(height: 20),
                const Text("Watchlist Limit Reached", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),
                Text(
                  "You have $currentCount items saved. The Free Tier allows up to $limit items. Upgrade to Pro for an UNLIMITED watchlist.",
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 14, height: 1.5),
                ),
                const SizedBox(height: 30),
                SizedBox(
                  width: double.infinity,
                  height: 45,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                    onPressed: () {
                      Navigator.pop(context);
                      debugPrint("Navigating to Upgrade Screen...");
                    },
                    child: const Text("Upgrade to Pro", style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(height: 10),
                TextButton(onPressed: () => Navigator.pop(context), child: const Text("Maybe Later", style: TextStyle(color: Colors.grey)))
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    String displayTitle = _searchTags.isEmpty ? "All Market Results" : "Market Results for \"${_searchTags.join(', ')}\"";

    return Stack(
      children: [
        Padding(
          padding: const EdgeInsets.all(30.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const NeonIcon(icon: Icons.list_alt),
                  const SizedBox(width: 15),
                  SizedBox(
                    width: 300, 
                    child: Text(displayTitle, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)), overflow: TextOverflow.ellipsis),
                  ),
                  const Spacer(), 
                  
                  Container(
                    width: 450, height: 46, 
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
                                ..._searchTags.map((tag) => Padding(
                                  padding: const EdgeInsets.only(right: 6.0),
                                  child: Chip(
                                    label: Text(tag, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                    onDeleted: () {
                                      setState(() {
                                        _searchTags.remove(tag);
                                        if (_searchTags.isNotEmpty) _fetchLiveData(_searchTags.join(', '));
                                      });
                                    },
                                    backgroundColor: const Color(0xFF8FFF00).withAlpha(40),
                                    side: BorderSide.none,
                                    deleteIcon: const Icon(Icons.close, size: 14),
                                    visualDensity: VisualDensity.compact,
                                    padding: EdgeInsets.zero,
                                  ),
                                )),
                                SizedBox(
                                  width: 150, 
                                  child: TextField(
                                    controller: _topSearchController,
                                    decoration: InputDecoration(
                                      hintText: _searchTags.isEmpty ? "Type keyword & hit Enter..." : "Add more...",
                                      hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
                                      border: InputBorder.none,
                                      isDense: true,
                                    ),
                                    onSubmitted: _addTag,
                                    onChanged: (value) {
                                      if (value.endsWith(',')) _addTag(value);
                                    },
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        UniversalScanButton(
                          text: "SCAN", width: 80, borderRadius: 7, fontSize: 13,
                          onTap: () {
                            if (_topSearchController.text.trim().isNotEmpty) _addTag(_topSearchController.text);
                            if (_searchTags.isNotEmpty) widget.onSearch(_searchTags.join(', '));
                          }
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 15),
                  _buildTopButton(Icons.tune, "Advanced Filters", onTap: () {
                    showDialog(context: context, builder: (BuildContext context) => const AdvancedFiltersModal());
                  }),
                  const SizedBox(width: 10),
                  _buildTopButton(Icons.sort, "Sort: Opp Score 🔥", isHighlight: true, onTap: () {}),
                ],
              ),
              const SizedBox(height: 20),

              SizedBox(
                height: 280, 
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Expanded(
                      flex: 4, 
                      child: NicheOverviewCard(
                        marketVol: _nicheMarketVol,
                        avgPrice: _nicheAvgPrice,
                        successRate: _nicheSuccessRate,
                        totalActive: _nicheTotalActive,
                        successColor: _nicheSuccessColor,
                        saturationScore: _nicheSaturationScore, 
                        adInsight: _nicheAdInsight,
                      )
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      flex: 7, 
                      child: MarketTrendChart(
                        searchQuery: widget.searchQuery,
                        liveData: _historicalSalesData, 
                      )
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 25),

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
                    Checkbox(value: _selectAll, onChanged: _toggleSelectAll, activeColor: const Color(0xFF8FFF00), checkColor: Colors.black),
                    const Text("Select All", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                  ],
                ),
              ),
              const SizedBox(height: 15),

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
                              const SizedBox(width: 48), 
                              _headerText("PRODUCT", flex: 8),
                              _headerText("SELLER", flex: 4),
                              _headerText("FEEDBACK", flex: 2), 
                              _headerText("DEMAND", flex: 2),   
                              _headerText("WATCH", flex: 2),    
                              _headerText("PRICE", flex: 2),
                              _headerText("BUY", flex: 2),
                              _headerText("PROFIT", flex: 2),
                              _headerText("", flex: 3, alignRight: true),
                            ],
                          ),
                        ),
                        const Divider(height: 1, color: Color(0xFFE2E8F0)),
                        
                        Expanded(
                          child: _isLoading 
                            ? const Center(child: CircularProgressIndicator(color: Color(0xFF8FFF00))) 
                            : _errorMessage.isNotEmpty 
                              ? Center(child: Padding(padding: const EdgeInsets.all(20), child: Text(_errorMessage, style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold), textAlign: TextAlign.center)))
                              : _liveProducts.isEmpty 
                                ? const Center(child: Text("No products found. Try a different search!"))
                                : ListView.builder(
                                    itemCount: _liveProducts.length,
                                    itemBuilder: (context, index) {
                                      final item = _liveProducts[index];
                                      final String rowId = item["itemId"] ?? item["itemWebUrl"] ?? "id_$index"; 
                                      
                                      return IntelligenceRow(
                                        itemId: rowId,
                                        isSelected: _selectedItemIds.contains(rowId),
                                        onSelect: (bool? val) {
                                          setState(() {
                                            if (val == true) {
                                              _selectedItemIds.add(rowId);
                                            } else {
                                              _selectedItemIds.remove(rowId);
                                              _selectAll = false; 
                                            }
                                          });
                                        },
                                        onProfitChanged: (double profit) {
                                          Future.microtask(() => setState(() => _itemProfits[rowId] = profit));
                                        },
                                        imageUrl: item["image"] ?? "https://via.placeholder.com/150", 
                                        title: item["title"] ?? "Unknown Product", 
                                        price: item["sales"] ?? "0", 
                                        sellerUsername: item["sellerUsername"] ?? "Unknown",
                                        sellerFeedbackScore: (item["sellerFeedbackScore"] as num?)?.toDouble() ?? 0.0,
                                        itemLocationCountry: item["itemLocationCountry"] ?? "US",
                                        sellerRegisteredCountry: item["sellerRegisteredCountry"] ?? "US",
                                        totalActiveListings: item["totalActiveListings"] ?? 0,
                                        totalSold: item["totalSold"] ?? 45, 
                                        lastSoldDate: item["lastSoldDate"] ?? "Today", 
                                        watchCount: item["watchCount"] ?? 12,
                                        isVero: item["isVero"] ?? false, 
                                        categoryPath: item["category"] ?? "Home & Garden > Pet Supplies",
                                        priceTrend: item["trend"] ?? "up", 
                                        upc: item["upc"],
                                      );
                                    },
                                  ),
                        ),
                        
                        const Divider(height: 1, color: Color(0xFFE2E8F0)),
                        Container(
                          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 20),
                          color: Colors.white,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              TextButton.icon(
                                onPressed: _currentPage > 1 && !_isLoading ? () {
                                  setState(() => _currentPage--);
                                  _fetchLiveData(_searchTags.join(', '));
                                } : null,
                                icon: const Icon(Icons.chevron_left, size: 18),
                                label: const Text("Previous", style: TextStyle(fontWeight: FontWeight.bold)),
                              ),
                              Text("Page $_currentPage", style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                              TextButton(
                                onPressed: _liveProducts.length == 25 && !_isLoading ? () {
                                  setState(() => _currentPage++);
                                  _fetchLiveData(_searchTags.join(', '));
                                } : null,
                                child: const Row(
                                  children: [
                                    Text("Next", style: TextStyle(fontWeight: FontWeight.bold)),
                                    SizedBox(width: 5),
                                    Icon(Icons.chevron_right, size: 18),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                ),
              )
            ],
          ),
        ),

        // ✨ THE FLOATING BULK ACTION HUB ✨
        AnimatedPositioned(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOutCubic,
          bottom: _selectedItemIds.isNotEmpty ? 40 : -100, 
          left: 0,
          right: 0,
          child: Center(
            child: Container(
              height: 60,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A), 
                borderRadius: BorderRadius.circular(30),
                boxShadow: [BoxShadow(color: const Color(0xFF8FFF00).withAlpha(40), blurRadius: 20, spreadRadius: 5, offset: const Offset(0, 5))],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: Colors.white.withAlpha(20), borderRadius: BorderRadius.circular(20)),
                    child: Text("${_selectedItemIds.length} Selected", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                  ),
                  const SizedBox(width: 20),
                  
                  const Text("Total Profit: ", style: TextStyle(color: Colors.white70, fontSize: 13)),
                  Text(
                    "+\$${_totalPotentialProfit.toStringAsFixed(2)}", 
                    style: const TextStyle(color: Color(0xFF8FFF00), fontWeight: FontWeight.w900, fontSize: 16)
                  ),
                  const SizedBox(width: 25),
                  
                  // ✨ BOUND TO SUPABASE SAVE
                  ElevatedButton.icon(
                    onPressed: _saveToWatchlist,
                    icon: const Icon(Icons.bookmark, color: Colors.black, size: 16),
                    label: const Text("Save to Watchlist", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF8FFF00), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20))),
                  ),
                  const SizedBox(width: 10),
                  
                  // ✨ BOUND TO CSV EXPORT
                  OutlinedButton.icon(
                    onPressed: _downloadCSV,
                    icon: const Icon(Icons.download, color: Colors.white, size: 16),
                    label: const Text("CSV", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    style: OutlinedButton.styleFrom(side: BorderSide(color: Colors.white.withAlpha(50)), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20))),
                  ),
                  
                  const SizedBox(width: 10),
                  Container(width: 1, height: 30, color: Colors.white.withAlpha(20)),
                  const SizedBox(width: 10),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white70, size: 20),
                    onPressed: () => setState(() { _selectedItemIds.clear(); _selectAll = false; }),
                    tooltip: "Clear Selection",
                  )
                ],
              ),
            ),
          ),
        ),
      ],
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
}