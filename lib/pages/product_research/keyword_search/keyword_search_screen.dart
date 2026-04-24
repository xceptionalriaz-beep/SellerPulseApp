import 'dart:convert';
import 'dart:js_interop'; 
import 'package:web/web.dart' as web;
import 'package:fl_chart/fl_chart.dart'; 
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../widgets/market_trend_chart.dart'; 
import '../../../../core/services/market_brain_service.dart'; 
import '../../../../core/utils/profit_engine.dart'; 

import '../shared/neon_icon.dart';
import '../shared/universal_scan_button.dart';
import 'widgets/niche_overview_card.dart';
import 'widgets/intelligence_row.dart'; 

import 'models/search_filters.dart';
import 'widgets/filter_hub.dart';
import 'widgets/profit_settings_dialog.dart';

class KeywordSearchScreen extends StatefulWidget {
  final String searchQuery;
  final Function(String) onSearch; 
  
  const KeywordSearchScreen({super.key, required this.searchQuery, required this.onSearch});

  @override
  State<KeywordSearchScreen> createState() => _KeywordSearchScreenState();
}

class _KeywordSearchScreenState extends State<KeywordSearchScreen> {
  final ScrollController _mainScrollController = ScrollController();

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

  bool _selectAll = false;
  Set<String> _selectedItemIds = {}; 
  Map<String, double> _itemProfits = {}; 

  bool _showFilters = true;
  final SearchFilters _activeFilters = SearchFilters();
  
  Map<String, dynamic>? _activeDeepDiveProduct;
  ProfitSettings _globalProfitSettings = const ProfitSettings();

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
    _mainScrollController.dispose(); 
    super.dispose();
  }

  Future<void> _fetchLiveData(String query) async {
    if (query.isEmpty) return;
    
    setState(() {
      _isLoading = true;
      _liveProducts.clear(); 
      _historicalSalesData.clear(); 
      _errorMessage = ""; 
      _selectedItemIds.clear(); 
      _selectAll = false;
    });

    try {
      final result = await MarketBrainService.conductResearch(query, _currentPage, filters: _activeFilters);

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
        _showFilters = false; 
        _fetchLiveData(_searchTags.join(', '));
      });
    } else {
      _topSearchController.clear();
    }
  }

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

  Future<void> _saveToWatchlist() async {
    final supabase = Supabase.instance.client;
    final userId = supabase.auth.currentUser?.id;

    if (userId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Please log in to save items.")));
      return;
    }

    setState(() => _isLoading = true);

    try {
      final countResponse = await supabase
          .from('user_watchlist')
          .select('id')
          .eq('user_id', userId)
          .count(CountOption.exact);

      int currentSavedCount = countResponse.count;
      int itemsTryingToSave = _selectedItemIds.length;

      const int FREE_TIER_LIMIT = 50;

      if (currentSavedCount + itemsTryingToSave > FREE_TIER_LIMIT) {
        setState(() => _isLoading = false);
        _showUpgradeDialog(currentSavedCount, FREE_TIER_LIMIT);
        return; 
      }

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

  void _downloadCSV() {
    List<List<String>> rows = [
      [
        "Product Title", 
        "eBay Item ID",
        "eBay Price", 
        "Buy Cost", 
        "Est. Net Profit", 
        "Total Sold",
        "Watchers",
        "Category",
        "eBay Link",
        "Sourcing Link (Lens)"
      ]
    ];

    for (var id in _selectedItemIds) {
      final item = _liveProducts.firstWhere(
        (p) => (p["itemId"] ?? p["itemWebUrl"] ?? p.toString()) == id, 
        orElse: () => {}
      );
      
      if (item.isNotEmpty) {
        String cleanTitle = (item["title"] ?? "Unknown").replaceAll('"', '""').replaceAll(',', ' ');
        double ebayPrice = double.tryParse(item["sales"].toString().replaceAll(RegExp(r'[^\d.]'), '')) ?? 0.0;
        double profit = _itemProfits[id] ?? 0.0;
        double buyCost = _itemProfits[id] != null ? (ebayPrice - profit - _globalProfitSettings.defaultShipping) : 0.0;
        if (buyCost < 0) buyCost = 0.0;
        
        rows.add([
          cleanTitle,
          item["itemId"]?.toString() ?? "N/A",
          item["sales"]?.toString() ?? "0",
          "\$${buyCost.toStringAsFixed(2)}",
          "\$${profit.toStringAsFixed(2)}",
          item["totalSold"]?.toString() ?? "0",
          item["watchCount"]?.toString() ?? "0",
          item["category"]?.toString() ?? "N/A",
          item["itemWebUrl"]?.toString() ?? "No Link",
          "https://lens.google.com/uploadbyurl?url=${Uri.encodeComponent(item["image"] ?? '')}"
        ]);
      }
    }

    String csvContent = rows.map((row) => row.map((field) => '"$field"').join(',')).join('\n');
    final contentWithBOM = '\uFEFF$csvContent';
    final bytes = utf8.encode(contentWithBOM);
    
    final blob = web.Blob([bytes.toJS].toJS, web.BlobPropertyBag(type: 'text/csv;charset=utf-8'));
    final url = web.URL.createObjectURL(blob);
    
    final anchor = web.document.createElement('a') as web.HTMLAnchorElement;
    anchor.href = url;
    anchor.download = "SellerPulse_Research_${DateTime.now().millisecondsSinceEpoch}.csv";
    
    anchor.click();
    
    web.URL.revokeObjectURL(url);
  }

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
        RawScrollbar(
          controller: _mainScrollController,
          thumbColor: const Color(0xFF8FFF00), 
          radius: const Radius.circular(20), 
          thickness: 8, 
          interactive: true,
          child: CustomScrollView(
            controller: _mainScrollController,
            slivers: [
              SliverPadding(
                padding: const EdgeInsets.only(left: 30.0, right: 30.0, top: 30.0, bottom: 15.0),
                sliver: SliverToBoxAdapter(
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
                                              hintText: _searchTags.isEmpty ? "Type keyword..." : "Add more...",
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
                                  text: "SEARCH", 
                                  width: 90, 
                                  borderRadius: 7, 
                                  fontSize: 13,
                                  onTap: () {
                                    if (_topSearchController.text.trim().isNotEmpty) _addTag(_topSearchController.text);
                                    if (_searchTags.isNotEmpty) widget.onSearch(_searchTags.join(', '));
                                  }
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 15),
                          
                          _buildTopButton(Icons.tune, "Advanced Filters", isHighlight: _showFilters, onTap: () {
                            setState(() => _showFilters = !_showFilters);
                          }),
                          
                          const SizedBox(width: 10),
                          _buildTopButton(Icons.sort, "Sort: Opp Score 🔥", isHighlight: false, onTap: () {}),

                          const SizedBox(width: 10),
                          IconButton(
                            onPressed: () {
                              showDialog(
                                context: context,
                                barrierDismissible: false,
                                builder: (context) => ProfitSettingsDialog(
                                  currentSettings: _globalProfitSettings,
                                  onSave: (newSettings) {
                                    setState(() {
                                      _globalProfitSettings = newSettings;
                                    });
                                  },
                                ),
                              );
                            },
                            icon: const Icon(Icons.settings, color: Color(0xFF64748B)),
                            tooltip: "Global Profit Settings",
                          ),
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

                      AnimatedSize(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOutCubic,
                        child: _showFilters ? Padding(
                          padding: const EdgeInsets.only(top: 20),
                          child: FilterHub(
                            filters: _activeFilters,
                          ),
                        ) : const SizedBox.shrink(),
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
                    ],
                  ),
                ),
              ),

              SliverPersistentHeader(
                pinned: true,
                delegate: _StickyTableHeaderDelegate(),
              ),

              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 30.0),
                sliver: SliverToBoxAdapter(
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white, 
                      borderRadius: const BorderRadius.vertical(bottom: Radius.circular(16)),
                      border: Border(
                        left: BorderSide(color: Colors.grey.shade200),
                        right: BorderSide(color: Colors.grey.shade200),
                        bottom: BorderSide(color: Colors.grey.shade200),
                      ),
                      boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 20, offset: Offset(0, 10))],
                    ),
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(bottom: Radius.circular(16)),
                      child: Column(
                        children: [
                          if (_isLoading)
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 100),
                              child: Center(child: CircularProgressIndicator(color: Color(0xFF8FFF00))),
                            )
                          else if (_errorMessage.isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 50),
                              child: Center(child: Text(_errorMessage, style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold), textAlign: TextAlign.center)),
                            )
                          else if (_liveProducts.isEmpty)
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 100),
                              child: Center(child: Text("No products found. Try a different search!", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey))),
                            )
                          else
                            ListView.builder(
                              shrinkWrap: true, 
                              physics: const NeverScrollableScrollPhysics(), 
                              itemCount: _liveProducts.length,
                              itemBuilder: (context, index) {
                                final item = _liveProducts[index];
                                final String rowId = item["itemId"] ?? item["itemWebUrl"] ?? "id_$index"; 
                                
                                return IntelligenceRow(
                                  itemId: rowId,
                                  profitSettings: _globalProfitSettings,
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
                                  onPulseCheck: () {
                                    setState(() => _activeDeepDiveProduct = item as Map<String, dynamic>);
                                  },
                                  
                                  imageUrl: item["image"] ?? "", 
                                  title: item["title"] ?? "Unknown Product", 
                                  price: item["sales"]?.toString() ?? "0", 
                                  sellerUsername: item["sellerUsername"] ?? "Unknown",
                                  sellerFeedbackScore: (item["sellerFeedbackScore"] as num?)?.toDouble() ?? 0.0,
                                  itemLocationCountry: item["itemLocationCountry"] ?? "N/A",
                                  sellerRegisteredCountry: item["sellerRegisteredCountry"] ?? "N/A",
                                  totalActiveListings: item["totalActiveListings"] ?? 0,
                                  itemWebUrl: item["itemWebUrl"],
                                  totalSold: item["totalSold"] ?? 0, 
                                  lastSoldDate: item["lastSoldDate"] ?? "N/A", 
                                  watchCount: item["watchCount"] ?? 0,
                                  veroMatches: item["veroMatches"] ?? [],
                                  categoryPath: item["category"] ?? "Unknown",
                                  priceTrend: item["trend"] ?? "none", 
                                  upc: item["upc"],
                                  
                                  aiVelocity: (item["ai_velocity"] as num?)?.toDouble() ?? 0.0,
                                  riskScore: item["risk_score"]?.toString() ?? "Medium",
                                  demandHeat: (item["demand_heat"] as num?)?.toDouble() ?? 0.05,
                                );
                              },
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
                                  onPressed: _liveProducts.length >= 25 && !_isLoading ? () {
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
                ),
              ),
              
              const SliverToBoxAdapter(child: SizedBox(height: 100)),
            ],
          ),
        ),

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
                  
                  ElevatedButton.icon(
                    onPressed: _saveToWatchlist,
                    icon: const Icon(Icons.bookmark, color: Colors.black, size: 16),
                    label: const Text("Save to Watchlist", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF8FFF00), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20))),
                  ),
                  const SizedBox(width: 10),
                  
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

        if (_activeDeepDiveProduct != null)
          Positioned.fill(
            child: GestureDetector(
              onTap: () => setState(() => _activeDeepDiveProduct = null),
              child: Container(color: Colors.black.withAlpha(100)),
            ),
          ),

        AnimatedPositioned(
          duration: const Duration(milliseconds: 350),
          curve: Curves.easeOutCubic,
          top: 0, bottom: 0,
          right: _activeDeepDiveProduct != null ? 0 : -500, 
          width: 450,
          child: _buildDeepDivePanel(),
        ),
      ],
    );
  }

  // ✨ HELPER: FULLY UPGRADED DEEP DIVE WITH VISUAL BAR
  Widget _buildDeepDivePanel() {
    if (_activeDeepDiveProduct == null) return const SizedBox.shrink();
    final item = _activeDeepDiveProduct!;
    
    double sellingPrice = double.tryParse(item["sales"]?.toString().replaceAll(RegExp(r'[^\d.]'), '') ?? "0") ?? 0.0;
    
    // Estimate buy cost based on the profit amount the user has entered so far
    final String rowId = item["itemId"] ?? item["itemWebUrl"] ?? "";
    double profitAmount = _itemProfits[rowId] ?? 0.0;
    double estimatedBuyCost = 0.0;
    
    if (profitAmount != 0) {
       estimatedBuyCost = sellingPrice - profitAmount - (sellingPrice * (_globalProfitSettings.categoryFeePercent/100)) - _globalProfitSettings.fixedFee - _globalProfitSettings.defaultShipping;
       if (estimatedBuyCost < 0) estimatedBuyCost = 0;
    }

    // Run the numbers through our Enterprise Profit Engine
    final ProfitResult result = ProfitEngine.calculate(
      sellingPrice: sellingPrice,
      buyPrice: estimatedBuyCost,
      settings: _globalProfitSettings,
    );

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(50), blurRadius: 30, offset: const Offset(-10, 0))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            color: const Color(0xFFF8FAFC),
            child: Row(
              children: [
                const Expanded(child: Text("Deep Dive Analysis", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)))),
                IconButton(icon: const Icon(Icons.close), onPressed: () => setState(() => _activeDeepDiveProduct = null))
              ],
            ),
          ),
          
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(item["image"] ?? "", width: 80, height: 80, fit: BoxFit.cover, errorBuilder: (c, e, s) => Container(width: 80, height: 80, color: Colors.grey.shade200)),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item["title"] ?? "Unknown", maxLines: 3, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      const SizedBox(height: 10),
                      Text("Seller: ${item["sellerUsername"] ?? "Unknown"}", style: TextStyle(color: Colors.blueGrey.shade600, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("💰 The Truth Equation", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF64748B))),
                const SizedBox(height: 15),
                _buildFeeRow("Selling Price", "\$${sellingPrice.toStringAsFixed(2)}", isPositive: true),
                _buildFeeRow("True Sourcing Cost (Inc. Tax)", "-\$${result.trueBuyCost.toStringAsFixed(2)}", isNegative: true),
                _buildFeeRow("Total eBay Fees", "-\$${result.totalEbayFees.toStringAsFixed(2)}", isNegative: true),
                _buildFeeRow("Shipping Cost", "-\$${_globalProfitSettings.defaultShipping.toStringAsFixed(2)}", isNegative: true),
                
                if (_globalProfitSettings.isAdvancedEnabled && result.advancedDeductions > 0)
                  _buildFeeRow("Advanced Deductions", "-\$${result.advancedDeductions.toStringAsFixed(2)}", isNegative: true),
                
                if (_globalProfitSettings.isAdvancedEnabled && result.totalCashback > 0)
                  _buildFeeRow("Hidden Cashback Profit", "+\$${result.totalCashback.toStringAsFixed(2)}", isPositive: true),
                  
                const Padding(padding: EdgeInsets.symmetric(vertical: 8), child: Divider()),
                
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text("Net Profit", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                    Text(
                      "\$${result.netProfit.toStringAsFixed(2)}", 
                      style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: result.netProfit > 0 ? Colors.green.shade700 : Colors.red.shade700)
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          Expanded(
            child: Container(
              width: double.infinity,
              color: const Color(0xFFF8FAFC),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Visual Margin Breakdown", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                  const SizedBox(height: 15),
                  
                  if (sellingPrice > 0 && estimatedBuyCost > 0) ...[
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Row(
                        children: [
                          Expanded(flex: (result.trueBuyCost * 100).toInt(), child: Container(height: 24, color: Colors.blue)),
                          Expanded(flex: ((result.totalEbayFees + _globalProfitSettings.defaultShipping + result.advancedDeductions) * 100).toInt(), child: Container(height: 24, color: Colors.red.shade400)),
                          if (result.netProfit > 0)
                            Expanded(flex: (result.netProfit * 100).toInt(), child: Container(height: 24, color: const Color(0xFF8FFF00))),
                        ],
                      ),
                    ),
                    const SizedBox(height: 15),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildLegendItem(Colors.blue, "Sourcing"),
                        _buildLegendItem(Colors.red.shade400, "Fees"),
                        _buildLegendItem(const Color(0xFF8FFF00), "Profit (${result.profitMargin.toStringAsFixed(1)}%)"),
                      ],
                    )
                  ] else ...[
                     const Center(child: Text("Enter a Buy Cost in the table\nto see the visual breakdown.", style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic))),
                  ]
                ],
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Row(
      children: [
        Container(width: 12, height: 12, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3))),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
      ],
    );
  }

  Widget _buildFeeRow(String label, String amount, {bool isPositive = false, bool isNegative = false, bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontWeight: isBold ? FontWeight.w900 : FontWeight.normal, fontSize: isBold ? 14 : 13)),
          Text(amount, style: TextStyle(
            fontWeight: isBold ? FontWeight.w900 : FontWeight.bold, 
            fontSize: isBold ? 14 : 13,
            color: isNegative ? Colors.red : (isPositive ? Colors.green.shade700 : Colors.black)
          )),
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

  Widget _buildTopButton(IconData icon, String label, {bool isHighlight = false, required VoidCallback onTap}) {
    return OutlinedButton.icon(
      onPressed: onTap, icon: Icon(icon, size: 16, color: isHighlight ? Colors.black : const Color(0xFF64748B)), 
      label: Text(label, style: TextStyle(color: isHighlight ? Colors.black : const Color(0xFF64748B), fontWeight: isHighlight ? FontWeight.bold : FontWeight.normal)),
      style: OutlinedButton.styleFrom(
        backgroundColor: isHighlight ? const Color(0xFF8FFF00) : Colors.transparent, 
        side: BorderSide(color: isHighlight ? const Color(0xFF8FFF00) : Colors.grey.shade300), 
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))
      ),
    );
  }
}

class _StickyTableHeaderDelegate extends SliverPersistentHeaderDelegate {
  @override
  double get minExtent => 46.0; 
  @override
  double get maxExtent => 46.0;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 30.0), 
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC), 
        borderRadius: const BorderRadius.vertical(top: Radius.circular(16)), 
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: shrinkOffset > 0 
            ? [BoxShadow(color: Colors.black.withAlpha(15), blurRadius: 6, offset: const Offset(0, 3))] 
            : [],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 15),
      child: Row(
        children: [
          const SizedBox(width: 48), 
          _headerText("PRODUCT", flex: 8),
          _headerText("SELLER", flex: 4),
          _headerText("FEEDBACK", flex: 2), 
          _headerText("TRENDS", flex: 2), 
          _headerText("TOTAL SALE", flex: 2), 
          _headerText("WATCH", flex: 2),      
          _headerText("PRICE", flex: 2),
          _headerText("BUY", flex: 2),
          _headerText("PROFIT", flex: 2),
          _headerText("", flex: 3, alignRight: true),
        ],
      ),
    );
  }

  Widget _headerText(String text, {required int flex, bool alignRight = false}) {
    return Expanded(
      flex: flex, 
      child: Text(
        text, 
        textAlign: alignRight ? TextAlign.right : TextAlign.left, 
        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFF64748B))
      )
    );
  }

  @override
  bool shouldRebuild(_StickyTableHeaderDelegate oldDelegate) => false;
}