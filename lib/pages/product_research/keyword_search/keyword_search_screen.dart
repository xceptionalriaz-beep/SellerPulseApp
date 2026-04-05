import 'package:flutter/material.dart';
import 'dart:convert'; 
import 'package:http/http.dart' as http; 
import 'package:supabase_flutter/supabase_flutter.dart'; 

import '../../../widgets/market_trend_chart.dart'; 

import '../shared/neon_icon.dart';
import '../shared/universal_scan_button.dart';
import 'widgets/niche_overview_card.dart';
import 'widgets/advanced_filters_modal.dart';
import 'widgets/hoverable_data_row.dart';

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
  bool _selectAll = false;
  
  // ✨ The Pagination Variable is now actively used!
  int _currentPage = 1;

  late TextEditingController _topSearchController;
  List<String> _searchTags = [];
  
  bool _isLoading = false;
  List<dynamic> _liveProducts = [];

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
    });

    try {
      final response = await Supabase.instance.client
          .from('api_fleet_config')
          .select('api_key')
          .limit(1)
          .single();

      final String ebayKey = response['api_key'];

      // ✨ PAGE LOGIC ADDED HERE: Calculates how many items to skip based on _currentPage
      int offset = (_currentPage - 1) * 25;
      final String apiUrl = 'https://api.ebay.com/buy/browse/v1/item_summary/search?q=${Uri.encodeComponent(query)}&limit=25&offset=$offset';

      final ebayResponse = await http.get(
        Uri.parse(apiUrl),
        headers: {
          'Authorization': 'Bearer $ebayKey',
          'Content-Type': 'application/json',
        },
      );

      if (ebayResponse.statusCode == 200) {
        final data = json.decode(ebayResponse.body);
        final List itemSummaries = data['itemSummaries'] ?? [];

        setState(() {
          _liveProducts = itemSummaries.map((item) {
            final title = item['title'] ?? 'Unknown Product';
            final imageUrl = item['image']?['imageUrl'] ?? 'https://via.placeholder.com/150';
            final price = item['price']?['value'] ?? '0.00';
            
            return {
              "title": title,
              "image": imageUrl,
              "sales": "\$$price", 
              "itemWebUrl": item['itemWebUrl'] 
            };
          }).toList();
          
          _isLoading = false;
        });
      } else {
        print("❌ eBay API Error: ${ebayResponse.statusCode} - ${ebayResponse.body}");
        setState(() => _isLoading = false);
      }

    } catch (e) {
      print("❌ Error fetching live data: $e");
      setState(() => _isLoading = false);
    }
  }

  void _addTag(String value) {
    String cleanValue = value.replaceAll(',', '').trim();
    if (cleanValue.isNotEmpty && !_searchTags.contains(cleanValue)) {
      setState(() {
        _searchTags.add(cleanValue);
        _topSearchController.clear();
        _currentPage = 1; // ✨ Reset to page 1 on new search
        _fetchLiveData(_searchTags.join(', ')); // Fetch the new search
      });
    } else {
      _topSearchController.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    String displayTitle = _searchTags.isEmpty ? "All Market Results" : "Market Results for \"${_searchTags.join(', ')}\"";

    return Padding(
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
                                    if (_searchTags.isNotEmpty) {
                                      _fetchLiveData(_searchTags.join(', '));
                                    }
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
            height: 180, 
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Expanded(flex: 4, child: NicheOverviewCard()),
                const SizedBox(width: 20),
                Expanded(flex: 7, child: MarketTrendChart(searchQuery: widget.searchQuery)),
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
                Checkbox(value: _selectAll, onChanged: (val) => setState(() => _selectAll = val!), activeColor: const Color(0xFF8FFF00), checkColor: Colors.black),
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
                      child: _isLoading 
                        ? const Center(child: CircularProgressIndicator(color: Color(0xFF8FFF00))) 
                        : _liveProducts.isEmpty 
                          ? const Center(child: Text("No products found. Try a different search!"))
                          : ListView.builder(
                              itemCount: _liveProducts.length,
                              itemBuilder: (context, index) {
                                final item = _liveProducts[index];
                                return HoverableDataRow(
                                  imageUrl: item["image"] ?? "https://via.placeholder.com/150", 
                                  title: item["title"] ?? "Unknown Product", 
                                  veroWord: null,
                                  flag: "🇺🇸", score: "🔥 99", sales: item["sales"] ?? "0", 
                                  returns: "🟢 2% (Safe)", risk: "🛡️ Safe", margin: "🟢 40%", 
                                  actionColor: Colors.orange, actionLabel: "Amz",
                                  isSelected: _selectAll,
                                );
                              },
                            ),
                    ),
                    
                    // ✨ UI ADDED HERE: The Pagination Buttons!
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