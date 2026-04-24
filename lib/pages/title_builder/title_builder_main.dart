import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:provider/provider.dart'; // ✨ NEW: Provider Tool
import 'package:sellerpulse/providers/market_provider.dart'; // ✨ NEW: The Brain

import 'tb_top_bar.dart';
import 'tb_studio.dart';
import 'tb_pro_hud.dart';
import 'tb_keyword_tables.dart';
import 'tb_settings_panel.dart'; 

class TitleBuilderMain extends StatefulWidget {
  const TitleBuilderMain({super.key});

  @override
  State<TitleBuilderMain> createState() => _TitleBuilderMainState();
}

class _TitleBuilderMainState extends State<TitleBuilderMain> with SingleTickerProviderStateMixin {
  final TextEditingController titleController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _slideAnimation;
  
  int charCount = 30;
  List<String> flaggedVero = [];
  List<String> flaggedDuplicates = [];
  List<Map<String, dynamic>> veroDatabase = [];

  // 🚀 Master Filters
  String activeTimeframe = "30D";
  String activeMarket = "eBay";
  String activeLocation = "US";

  // ⚙️ Settings
  bool autoCapitalize = true;
  bool autoCopy = false;
  String veroMode = "Strict";

  // ✨ NEW: MASTER DATA MEMORY
  // These hold the data that comes back from your Admin Dashboard APIs
  bool isFetchingData = false;
  List<Map<String, String>> longTailKeywords = [];
  List<Map<String, String>> genericKeywords = [];

  @override
  void initState() {
    super.initState();
    
    _animationController = AnimationController(
      vsync: this, 
      duration: const Duration(milliseconds: 250), 
    );
    
    final curve = CurvedAnimation(parent: _animationController, curve: Curves.easeOutCubic);
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(curve);
    _slideAnimation = Tween<double>(begin: 15.0, end: 0.0).animate(curve);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _animationController.forward();
    });

    _loadVeroDatabase();
    titleController.addListener(_analyzeTitle);
  }

  Future<void> _loadVeroDatabase() async {
    try {
      final data = await Supabase.instance.client.from('vero_brands').select('brand_name, risk_level');
      if (mounted) {
        setState(() => veroDatabase = List<Map<String, dynamic>>.from(data));
        _analyzeTitle(); 
      }
    } catch (e) {
      debugPrint("VeRO Load Error: $e");
    }
  }

  // 🔌 API CONNECTION POINT: EXTRACT ITEM ID
  Future<void> _handleExtract(String itemId) async {
    if (itemId.isEmpty) return;
    
    setState(() => isFetchingData = true);

    // ⏳ Simulates calling your eBay API
    await Future.delayed(const Duration(seconds: 2));

    setState(() {
      titleController.text = "Extracted Title for Item $itemId";
      isFetchingData = false;
    });
  }

  // 🔌 API CONNECTION POINT: SEARCH SEED KEYWORD
  Future<void> _handleSearch(String keyword) async {
    if (keyword.isEmpty) return;
    
    // 🚀 THE NERVE CONNECTION: Tell the "Brain" to calculate the new charts!
    context.read<MarketProvider>().updateSearch(keyword);

    setState(() => isFetchingData = true);

    // ⏳ Simulate API Delay
    await Future.delayed(const Duration(seconds: 2));

    setState(() {
      // This is where you will eventually map your real API response
      longTailKeywords = [
        {'kw': '$keyword pro max', 'search': '25,400', 'comp': '120', 'sales': '890'},
        {'kw': 'Genuine $keyword oem', 'search': '18,200', 'comp': '80', 'sales': '450'},
        {'kw': '$keyword black edition', 'search': '12,100', 'comp': '45', 'sales': '210'},
        {'kw': 'Fast $keyword usb-c', 'search': '9,800', 'comp': '30', 'sales': '195'},
      ];
      genericKeywords = [
        {'kw': keyword, 'search': '45,000', 'comp': '500', 'sales': '1,200'},
        {'kw': 'Adapter', 'search': '30,000', 'comp': '200', 'sales': '600'},
        {'kw': 'Premium', 'search': '15,000', 'comp': '100', 'sales': '300'},
      ];
      isFetchingData = false;
    });
  }

  void _analyzeTitle() {
    final text = titleController.text;
    final words = text.toLowerCase().split(RegExp(r'\s+')).where((w) => w.isNotEmpty).toList();
    
    List<String> newVeroFlags = [];
    List<String> newDuplicates = [];
    Set<String> seenWords = {};

    for (var word in words) {
      if (['for', 'with', 'and', 'the', 'in', 'on', 'a', 'to', 'of'].contains(word)) continue;
      if (seenWords.contains(word) && !newDuplicates.contains(word)) newDuplicates.add(word);
      seenWords.add(word);
    }

    if (veroDatabase.isNotEmpty) {
      for (var brand in veroDatabase) {
        String brandName = brand['brand_name'].toString();
        if (RegExp(r'\b' + RegExp.escape(brandName) + r'\b', caseSensitive: false).hasMatch(text)) {
          newVeroFlags.add(brandName);
        }
      }
    }

    setState(() {
      charCount = text.length;
      flaggedVero = newVeroFlags;
      flaggedDuplicates = newDuplicates;
    });
  }

  void injectKeyword(String kw) {
    final currentText = titleController.text;
    final separator = (currentText.isEmpty || currentText.endsWith(' ')) ? '' : ' ';
    final newText = '$currentText$separator$kw ';
    
    setState(() {
      titleController.text = newText;
      titleController.selection = TextSelection.fromPosition(TextPosition(offset: newText.length));
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    _scrollController.dispose();
    titleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bool isDesktop = MediaQuery.of(context).size.width > 1100;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      endDrawer: TbSettingsPanel(
        autoCapitalize: autoCapitalize,
        onAutoCapitalizeChanged: (val) => setState(() => autoCapitalize = val),
        autoCopy: autoCopy,
        onAutoCopyChanged: (val) => setState(() => autoCopy = val),
        veroMode: veroMode,
        onVeroModeChanged: (val) => setState(() => veroMode = val),
      ),
      body: AnimatedBuilder(
        animation: _animationController,
        builder: (context, child) {
          return Opacity(
            opacity: _fadeAnimation.value,
            child: Transform.translate(
              offset: Offset(0, _slideAnimation.value),
              child: child,
            ),
          );
        },
        child: ScrollConfiguration(
          behavior: ScrollConfiguration.of(context).copyWith(scrollbars: false),
          child: SingleChildScrollView(
            controller: _scrollController,
            physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
            padding: EdgeInsets.all(isDesktop ? 30.0 : 15.0), 
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("SellerPulse Pro Title Builder", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                const SizedBox(height: 20),
                
                TbTopBar(
                  selectedTimeframe: activeTimeframe,
                  onTimeframeChanged: (val) => setState(() => activeTimeframe = val),
                  selectedMarket: activeMarket,
                  onMarketChanged: (val) => setState(() => activeMarket = val),
                  selectedLocation: activeLocation,
                  onLocationChanged: (val) => setState(() => activeLocation = val),
                  // 🚀 PASSED THE API HANDLERS
                  onExtract: _handleExtract,
                  onSearch: _handleSearch,
                ),
                
                const SizedBox(height: 30),

                if (isDesktop) ...[
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        flex: 65, 
                        child: TbStudio(controller: titleController, charCount: charCount, veroCount: flaggedVero.length, duplicateCount: flaggedDuplicates.length)
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        flex: 35, 
                        child: TbProHud(veroCount: flaggedVero.length, currentTitle: titleController.text, timeframe: activeTimeframe)
                      ),
                    ],
                  ),
                ] else ...[
                  TbStudio(controller: titleController, charCount: charCount, veroCount: flaggedVero.length, duplicateCount: flaggedDuplicates.length),
                  const SizedBox(height: 20),
                  TbProHud(veroCount: flaggedVero.length, currentTitle: titleController.text, timeframe: activeTimeframe),
                ],
                
                const SizedBox(height: 30),

                // 🚀 PASSED THE DYNAMIC DATA TO TABLES
                TbKeywordTables(
                  currentTitle: titleController.text,
                  onInject: injectKeyword,
                  veroDatabase: veroDatabase,
                  longTailData: longTailKeywords,
                  genericData: genericKeywords,
                  isLoading: isFetchingData,
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }
}