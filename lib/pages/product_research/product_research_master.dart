import 'package:flutter/material.dart';

// Import your two tool screens (Adjust these paths to match your folders!)
import 'keyword_search/keyword_search_screen.dart'; 
import 'deep_dive/deep_dive_screen.dart';

class ProductResearchMaster extends StatefulWidget {
  const ProductResearchMaster({super.key});

  @override
  State<ProductResearchMaster> createState() => _ProductResearchMasterState();
}

class _ProductResearchMasterState extends State<ProductResearchMaster> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    // length: 2 because we have 2 tabs right now. We can increase this later!
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), // Standard SaaS background
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ✨ THE NEW TAB BAR (The area you marked)
          Container(
            padding: const EdgeInsets.only(left: 30, top: 20),
            color: Colors.white,
            width: double.infinity,
            child: TabBar(
              controller: _tabController,
              isScrollable: true, // Keeps tabs aligned to the left
              indicatorColor: const Color(0xFF8FFF00), // Neon Green active line
              indicatorWeight: 4,
              labelColor: const Color(0xFF0F172A), // Dark Navy for active tab
              unselectedLabelColor: const Color(0xFF94A3B8), // Light grey for inactive
              labelStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
              unselectedLabelStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
              dividerColor: Colors.transparent, // Removes default flutter ugly line
              tabAlignment: TabAlignment.start, // Aligns tabs strictly to the left
              tabs: const [
                Tab(text: "Marketplace Research"),
                Tab(text: "Deep Dive Analysis"),
                // Tab(text: "Competitor Spy"), <-- We can easily add this later!
              ],
            ),
          ),
          
          // A clean subtle line separating tabs from content
          Container(height: 1, color: Colors.grey.shade200),

          // ✨ THE ACTUAL CONTENT (Switches based on the tab clicked)
          Expanded(
            child: TabBarView(
              controller: _tabController,
              physics: const NeverScrollableScrollPhysics(), // Prevents swipe-to-change so charts don't break
              children: [
                // TAB 1: Your beautiful Keyword Research Screen
                KeywordSearchScreen(
                  searchQuery: "", 
                  onSearch: (val) {
                    debugPrint("Searching for: $val");
                  }
                ),
                
                // TAB 2: The Deep Dive Page you just showed me
                const ProductDeepDivePage(
                  productUrl: "", 
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}