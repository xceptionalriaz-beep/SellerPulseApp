// lib/pages/competitor_research/services/competitor_service.dart
//
// SellerPulse — Competitor Research Service
// Handles: eBay API calls, Supabase persistence, AI scoring, gap finder
// Matches existing patterns from ebay_service.dart & market_brain_service.dart

import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';

// ─────────────────────────────────────────────
// MODELS
// ─────────────────────────────────────────────

class StoreOverview {
  final String username;
  final String? storeName;
  final int feedbackScore;
  final double feedbackPercent;
  final int activeListings;
  final int totalSold;
  final double estimatedRevenue;
  final double avgPrice;
  final double sellThroughRate;
  final String? country;
  final String? memberSince;
  final String? storeUrl;

  StoreOverview({
    required this.username,
    this.storeName,
    required this.feedbackScore,
    required this.feedbackPercent,
    required this.activeListings,
    required this.totalSold,
    required this.estimatedRevenue,
    required this.avgPrice,
    required this.sellThroughRate,
    this.country,
    this.memberSince,
    this.storeUrl,
  });

  factory StoreOverview.fromEbayJson(Map<String, dynamic> json) {
    final seller = json['seller'] ?? {};
    final feedback = seller['feedbackScore'] ?? 0;
    final percent = double.tryParse(
          seller['positiveFeedbackPercent']?.toString() ?? '0',
        ) ??
        0.0;

    return StoreOverview(
      username: seller['username'] ?? '',
      storeName: seller['storeName'],
      feedbackScore: feedback is int ? feedback : int.tryParse(feedback.toString()) ?? 0,
      feedbackPercent: percent,
      activeListings: json['activeListings'] ?? 0,
      totalSold: json['totalSold'] ?? 0,
      estimatedRevenue: (json['estimatedRevenue'] ?? 0.0).toDouble(),
      avgPrice: (json['avgPrice'] ?? 0.0).toDouble(),
      sellThroughRate: (json['sellThroughRate'] ?? 0.0).toDouble(),
      country: seller['feedbackRatingStar'],
      memberSince: seller['memberSince'],
      storeUrl: 'https://www.ebay.com/str/${seller['username'] ?? ''}',
    );
  }

  Map<String, dynamic> toMap() => {
        'username': username,
        'store_name': storeName,
        'feedback_score': feedbackScore,
        'feedback_percent': feedbackPercent,
        'active_listings': activeListings,
        'total_sold': totalSold,
        'estimated_revenue': estimatedRevenue,
        'avg_price': avgPrice,
        'sell_through_rate': sellThroughRate,
        'country': country,
        'member_since': memberSince,
        'store_url': storeUrl,
      };
}

// ─────────────────────────────────────────────

class ScannedProduct {
  final String itemId;
  final String title;
  final double price;
  final int soldCount;
  final double revenue;
  final double sellThrough;
  final String? imageUrl;
  final String? category;
  final String condition;
  final bool freeShipping;
  final int watchCount;
  final String listingType; // FixedPrice / Auction
  final String trend;       // rising / stable / fading
  final int opportunityScore; // 1–10 AI score
  final String? ebayUrl;
  final List<String> topKeywords;

  ScannedProduct({
    required this.itemId,
    required this.title,
    required this.price,
    required this.soldCount,
    required this.revenue,
    required this.sellThrough,
    this.imageUrl,
    this.category,
    required this.condition,
    required this.freeShipping,
    required this.watchCount,
    required this.listingType,
    required this.trend,
    required this.opportunityScore,
    this.ebayUrl,
    required this.topKeywords,
  });

  factory ScannedProduct.fromEbayItem(Map<String, dynamic> item) {
    final price = double.tryParse(
          item['price']?['value']?.toString() ?? '0',
        ) ??
        0.0;
    final sold = item['soldQuantity'] ?? 0;
    final revenue = price * sold;
    final active = item['availableQuantity'] ?? 1;
    final sellThrough = (sold + active) > 0
        ? (sold / (sold + active) * 100)
        : 0.0;

    final keywords = _extractKeywords(item['title'] ?? '');
    final score = _calculateOpportunityScore(
      sold: sold,
      revenue: revenue,
      sellThrough: sellThrough,
      watchCount: item['watchCount'] ?? 0,
      price: price,
    );
    final trend = _calculateTrend(item);

    return ScannedProduct(
      itemId: item['itemId'] ?? '',
      title: item['title'] ?? '',
      price: price,
      soldCount: sold,
      revenue: revenue,
      sellThrough: sellThrough,
      imageUrl: item['image']?['imageUrl'],
      category: item['categoryPath'],
      condition: item['condition'] ?? 'Unknown',
      freeShipping: item['shippingOptions']?[0]?['shippingCostType'] == 'FREE',
      watchCount: item['watchCount'] ?? 0,
      listingType: item['buyingOptions']?.contains('FIXED_PRICE') == true
          ? 'FixedPrice'
          : 'Auction',
      trend: trend,
      opportunityScore: score,
      ebayUrl: item['itemWebUrl'],
      topKeywords: keywords,
    );
  }

  Map<String, dynamic> toMap(String scanId) => {
        'scan_id': scanId,
        'item_id': itemId,
        'title': title,
        'price': price,
        'sold_count': soldCount,
        'revenue': revenue,
        'sell_through': sellThrough,
        'image_url': imageUrl,
        'category': category,
        'condition': condition,
        'free_shipping': freeShipping,
        'watch_count': watchCount,
        'listing_type': listingType,
        'trend': trend,
        'opportunity_score': opportunityScore,
        'ebay_url': ebayUrl,
        'top_keywords': topKeywords,
      };
}

// ─────────────────────────────────────────────

class StoreScanResult {
  final String scanId;
  final StoreOverview overview;
  final List<ScannedProduct> products;
  final List<GapProduct> gaps;
  final List<String> topKeywords;
  final DateTime scannedAt;

  StoreScanResult({
    required this.scanId,
    required this.overview,
    required this.products,
    required this.gaps,
    required this.topKeywords,
    required this.scannedAt,
  });

  // Best sellers sorted by revenue
  List<ScannedProduct> get bestSellers {
    final sorted = [...products];
    sorted.sort((a, b) => b.revenue.compareTo(a.revenue));
    return sorted;
  }

  // Products with opportunity score >= 7
  List<ScannedProduct> get hotOpportunities =>
      products.where((p) => p.opportunityScore >= 7).toList();

  // Rising trend products
  List<ScannedProduct> get risingProducts =>
      products.where((p) => p.trend == 'rising').toList();
}

// ─────────────────────────────────────────────

class GapProduct {
  final String title;
  final String category;
  final double estimatedDemand;
  final String reason;

  GapProduct({
    required this.title,
    required this.category,
    required this.estimatedDemand,
    required this.reason,
  });

  Map<String, dynamic> toMap(String scanId) => {
        'scan_id': scanId,
        'title': title,
        'category': category,
        'estimated_demand': estimatedDemand,
        'reason': reason,
      };
}

// ─────────────────────────────────────────────
// MAIN SERVICE
// ─────────────────────────────────────────────

class CompetitorService {
  static final CompetitorService _instance = CompetitorService._internal();
  factory CompetitorService() => _instance;
  CompetitorService._internal();

  final _supabase = Supabase.instance.client;

  // ── eBay OAuth token (reuses your existing pattern from ebay_service.dart) ──
  String? _accessToken;
  DateTime? _tokenExpiry;

  String get _ebayBaseUrl =>
      'https://api.ebay.com'; // Switch to sandbox for testing

  // ─────────────────────────────────────────────
  // AUTHENTICATION
  // ─────────────────────────────────────────────

  Future<String> _getAccessToken() async {
    // Return cached token if still valid
    if (_accessToken != null &&
        _tokenExpiry != null &&
        DateTime.now().isBefore(_tokenExpiry!)) {
      return _accessToken!;
    }

    final vaultData = await _supabase
        .from('api_fleet_config')
        .select('primary_key_1, primary_key_2')
        .eq('platform_name', 'ebay')
        .single();

    final String clientId = vaultData['primary_key_1'] ?? '';
    final String clientSecret = vaultData['primary_key_2'] ?? '';

    if (clientId.isEmpty || clientId == 'empty') {
      throw Exception('eBay App ID missing. Add it in Admin → API Vault.');
    }

    final credentials = base64Encode(
      utf8.encode('$clientId:$clientSecret'),
    );

    final response = await http.post(
      Uri.parse('$_ebayBaseUrl/identity/v1/oauth2/token'),
      headers: {
        'Authorization': 'Basic $credentials',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
          '&scope=https://api.ebay.com/oauth/api_scope',
    );

    if (response.statusCode != 200) {
      throw Exception('eBay auth failed: ${response.body}');
    }

    final data = jsonDecode(response.body);
    _accessToken = data['access_token'];
    _tokenExpiry = DateTime.now().add(
      Duration(seconds: data['expires_in'] ?? 7200),
    );

    return _accessToken!;
  }

  // ─────────────────────────────────────────────
  // MAIN SCAN — Entry point called from UI
  // ─────────────────────────────────────────────

  Future<StoreScanResult> scanStore(String username) async {
    try {
      final token = await _getAccessToken();

      // 1. Fetch seller's active listings
      final listings = await _fetchSellerListings(username, token);

      // 2. Fetch sold items (last 30 days)
      final soldItems = await _fetchSoldItems(username, token);

      // 3. Build store overview
      final overview = _buildStoreOverview(username, listings, soldItems);

      // 4. Build scanned products list
      final products = _buildProductList(listings, soldItems);

      // 5. Run gap finder
      final gaps = _runGapFinder(products, username);

      // 6. Extract top keywords across all titles
      final keywords = _extractTopKeywords(products);

      // 7. Save scan to Supabase
      final scanId = await _saveScanToSupabase(
        overview: overview,
        products: products,
        gaps: gaps,
        keywords: keywords,
      );

      return StoreScanResult(
        scanId: scanId,
        overview: overview,
        products: products,
        gaps: gaps,
        topKeywords: keywords,
        scannedAt: DateTime.now(),
      );
    } catch (e) {
      debugPrint('CompetitorService.scanStore error: $e');
      rethrow;
    }
  }

  // ─────────────────────────────────────────────
  // EBAY API CALLS
  // ─────────────────────────────────────────────

  Future<List<Map<String, dynamic>>> _fetchSellerListings(
    String username,
    String token,
  ) async {
    final uri = Uri.parse(
      '$_ebayBaseUrl/buy/browse/v1/item_summary/search'
      '?q=&seller=$username&limit=200&sort=BEST_MATCH',
    );

    final response = await http.get(uri, headers: {
      'Authorization': 'Bearer $token',
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      'Content-Type': 'application/json',
    });

    if (response.statusCode != 200) {
      throw Exception('Failed to fetch listings: ${response.statusCode}');
    }

    final data = jsonDecode(response.body);
    return List<Map<String, dynamic>>.from(
      data['itemSummaries'] ?? [],
    );
  }

  Future<List<Map<String, dynamic>>> _fetchSoldItems(
    String username,
    String token,
  ) async {
    // Uses Finding API for sold/completed items
    final uri = Uri.parse(
      '$_ebayBaseUrl/buy/browse/v1/item_summary/search'
      '?q=&seller=$username&filter=buyingOptions:{FIXED_PRICE}'
      '&filter=itemLocationCountry:US&limit=200',
    );

    final response = await http.get(uri, headers: {
      'Authorization': 'Bearer $token',
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
    });

    if (response.statusCode != 200) return [];

    final data = jsonDecode(response.body);
    return List<Map<String, dynamic>>.from(
      data['itemSummaries'] ?? [],
    );
  }

  // ─────────────────────────────────────────────
  // DATA PROCESSING
  // ─────────────────────────────────────────────

  StoreOverview _buildStoreOverview(
    String username,
    List<Map<String, dynamic>> listings,
    List<Map<String, dynamic>> soldItems,
  ) {
    double totalRevenue = 0;
    int totalSold = 0;
    double totalPrice = 0;

    for (final item in soldItems) {
      final price = double.tryParse(
            item['price']?['value']?.toString() ?? '0',
          ) ??
          0.0;
      final sold = item['soldQuantity'] ?? 1;
      totalRevenue += price * sold;
      totalSold += (sold as int);
      totalPrice += price;
    }

    final avgPrice = soldItems.isNotEmpty
        ? totalPrice / soldItems.length
        : 0.0;
    final sellThrough = (listings.length + totalSold) > 0
        ? (totalSold / (listings.length + totalSold) * 100)
        : 0.0;

    // Extract seller info from first item if available
    final firstItem = listings.isNotEmpty ? listings.first : {};
    final seller = firstItem['seller'] ?? {};

    return StoreOverview(
      username: username,
      storeName: seller['username'] == username
          ? null
          : seller['storeName'],
      feedbackScore: seller['feedbackScore'] ?? 0,
      feedbackPercent: double.tryParse(
            seller['feedbackPercentage']?.toString() ?? '100',
          ) ??
          100.0,
      activeListings: listings.length,
      totalSold: totalSold,
      estimatedRevenue: totalRevenue,
      avgPrice: avgPrice,
      sellThroughRate: sellThrough,
      storeUrl: 'https://www.ebay.com/str/$username',
    );
  }

  List<ScannedProduct> _buildProductList(
    List<Map<String, dynamic>> listings,
    List<Map<String, dynamic>> soldItems,
  ) {
    // Merge listings with sold data
    final soldMap = <String, Map<String, dynamic>>{};
    for (final item in soldItems) {
      soldMap[item['itemId']] = item;
    }

    final products = <ScannedProduct>[];
    for (final listing in listings) {
      final id = listing['itemId'];
      final merged = {
        ...listing,
        if (soldMap.containsKey(id)) ...soldMap[id]!,
      };
      products.add(ScannedProduct.fromEbayItem(merged));
    }

    // Sort by opportunity score descending
    products.sort((a, b) => b.opportunityScore.compareTo(a.opportunityScore));
    return products;
  }

  // ─────────────────────────────────────────────
  // GAP FINDER — Our killer feature
  // ─────────────────────────────────────────────

  List<GapProduct> _runGapFinder(
    List<ScannedProduct> products,
    String username,
  ) {
    // Extract categories seller IS selling in
    final sellerCategories = products
        .map((p) => p.category ?? '')
        .where((c) => c.isNotEmpty)
        .toSet();

    // High-demand eBay categories the seller is NOT in
    // (In production: fetch from eBay category trends API)
    final highDemandCategories = {
      'Electronics': 'High search volume, fast-moving items',
      'Sporting Goods': 'Growing category, low competition',
      'Home & Garden': 'Evergreen demand, high margins',
      'Health & Beauty': 'Repeat buyers, strong sell-through',
      'Toys & Hobbies': 'Seasonal spikes, great ROI',
      'Clothing, Shoes & Accessories': 'High volume, easy to source',
      'Collectibles': 'Passionate buyers, premium pricing',
      'Auto Parts': 'High AOV, low return rate',
    };

    final gaps = <GapProduct>[];

    for (final entry in highDemandCategories.entries) {
      // Check if seller is missing this category
      final inCategory = sellerCategories
          .any((c) => c.toLowerCase().contains(entry.key.toLowerCase()));

      if (!inCategory) {
        gaps.add(GapProduct(
          title: '${entry.key} products',
          category: entry.key,
          estimatedDemand: _estimateCategoryDemand(entry.key),
          reason: entry.value,
        ));
      }
    }

    // Also find sub-gaps: categories they're in but have very few listings
    final categoryCounts = <String, int>{};
    for (final p in products) {
      if (p.category != null) {
        categoryCounts[p.category!] =
            (categoryCounts[p.category!] ?? 0) + 1;
      }
    }

    for (final entry in categoryCounts.entries) {
      if (entry.value < 3) {
        gaps.add(GapProduct(
          title: 'More ${entry.key} listings',
          category: entry.key,
          estimatedDemand: 65.0,
          reason: 'Seller has only ${entry.value} item(s) here — big room to expand',
        ));
      }
    }

    return gaps.take(6).toList(); // Return top 6 gaps
  }

  double _estimateCategoryDemand(String category) {
    const demands = {
      'Electronics': 92.0,
      'Sporting Goods': 78.0,
      'Home & Garden': 85.0,
      'Health & Beauty': 80.0,
      'Toys & Hobbies': 74.0,
      'Clothing, Shoes & Accessories': 88.0,
      'Collectibles': 70.0,
      'Auto Parts': 82.0,
    };
    return demands[category] ?? 65.0;
  }

  // ─────────────────────────────────────────────
  // KEYWORD EXTRACTION
  // ─────────────────────────────────────────────

  List<String> _extractTopKeywords(List<ScannedProduct> products) {
    final allKeywords = <String>[];
    for (final p in products) {
      allKeywords.addAll(p.topKeywords);
    }

    // Count frequency
    final freq = <String, int>{};
    for (final kw in allKeywords) {
      freq[kw] = (freq[kw] ?? 0) + 1;
    }

    // Sort by frequency and return top 20
    final sorted = freq.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));

    return sorted.take(20).map((e) => e.key).toList();
  }

  // ─────────────────────────────────────────────
  // SUPABASE — Save & Load scans
  // ─────────────────────────────────────────────

  Future<String> _saveScanToSupabase({
    required StoreOverview overview,
    required List<ScannedProduct> products,
    required List<GapProduct> gaps,
    required List<String> keywords,
  }) async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) throw Exception('User not authenticated');

    // Insert scan record
    final scanInsert = await _supabase
        .from('store_scans')
        .insert({
          'user_id': userId,
          'scanned_at': DateTime.now().toIso8601String(),
          'top_keywords': keywords,
          ...overview.toMap(),
        })
        .select('id')
        .single();

    final scanId = scanInsert['id'].toString();

    // Insert products in batch
    if (products.isNotEmpty) {
      await _supabase.from('scanned_products').insert(
        products.map((p) => p.toMap(scanId)).toList(),
      );
    }

    // Insert gaps
    if (gaps.isNotEmpty) {
      await _supabase.from('scan_gaps').insert(
        gaps.map((g) => g.toMap(scanId)).toList(),
      );
    }

    return scanId;
  }

  // Load past scans for history
  Future<List<Map<String, dynamic>>> loadScanHistory() async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return [];

    final data = await _supabase
        .from('store_scans')
        .select('id, username, store_name, scanned_at, estimated_revenue, total_sold')
        .eq('user_id', userId)
        .order('scanned_at', ascending: false)
        .limit(20);

    return List<Map<String, dynamic>>.from(data);
  }

  // Load full scan by ID (for revisiting)
  Future<Map<String, dynamic>?> loadScanById(String scanId) async {
    final scan = await _supabase
        .from('store_scans')
        .select()
        .eq('id', scanId)
        .maybeSingle();

    if (scan == null) return null;

    final products = await _supabase
        .from('scanned_products')
        .select()
        .eq('scan_id', scanId)
        .order('opportunity_score', ascending: false);

    final gaps = await _supabase
        .from('scan_gaps')
        .select()
        .eq('scan_id', scanId);

    return {
      'scan': scan,
      'products': products,
      'gaps': gaps,
    };
  }

  // ─────────────────────────────────────────────
  // LISTING IDEAS BOARD — Save / Load / Delete
  // ─────────────────────────────────────────────

  Future<void> saveToListingIdeas(ScannedProduct product) async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return;

    await _supabase.from('listing_ideas').upsert({
      'user_id': userId,
      'item_id': product.itemId,
      'title': product.title,
      'price': product.price,
      'sold_count': product.soldCount,
      'revenue': product.revenue,
      'image_url': product.imageUrl,
      'opportunity_score': product.opportunityScore,
      'top_keywords': product.topKeywords,
      'ebay_url': product.ebayUrl,
      'saved_at': DateTime.now().toIso8601String(),
    });
  }

  Future<void> removeFromListingIdeas(String itemId) async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return;

    await _supabase
        .from('listing_ideas')
        .delete()
        .eq('user_id', userId)
        .eq('item_id', itemId);
  }

  Future<List<Map<String, dynamic>>> loadListingIdeas() async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return [];

    final data = await _supabase
        .from('listing_ideas')
        .select()
        .eq('user_id', userId)
        .order('saved_at', ascending: false);

    return List<Map<String, dynamic>>.from(data);
  }

  // ─────────────────────────────────────────────
  // WATCHLIST
  // ─────────────────────────────────────────────

  Future<void> addToWatchlist(StoreOverview store) async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return;

    await _supabase.from('watchlist').upsert({
      'user_id': userId,
      'username': store.username,
      'store_name': store.storeName,
      'added_at': DateTime.now().toIso8601String(),
      'last_revenue': store.estimatedRevenue,
      'last_sold': store.totalSold,
    });
  }

  Future<void> removeFromWatchlist(String username) async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return;

    await _supabase
        .from('watchlist')
        .delete()
        .eq('user_id', userId)
        .eq('username', username);
  }

  Future<List<Map<String, dynamic>>> loadWatchlist() async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return [];

    final data = await _supabase
        .from('watchlist')
        .select()
        .eq('user_id', userId)
        .order('added_at', ascending: false);

    return List<Map<String, dynamic>>.from(data);
  }

  Future<bool> isOnWatchlist(String username) async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return false;

    final data = await _supabase
        .from('watchlist')
        .select('id')
        .eq('user_id', userId)
        .eq('username', username)
        .maybeSingle();

    return data != null;
  }
}

// ─────────────────────────────────────────────
// STATIC HELPERS (pure functions — no state)
// ─────────────────────────────────────────────

// Extracts meaningful keywords from an eBay title
List<String> _extractKeywords(String title) {
  final stopWords = {
    'for', 'the', 'and', 'with', 'new', 'used', 'lot',
    'set', 'pack', 'pcs', 'piece', 'pieces', 'inch',
    'free', 'shipping', 'fast', 'buy', 'sale', 'best',
    'top', 'quality', 'great', 'original', 'genuine',
    'authentic', 'vintage', 'rare', 'nice', 'good',
  };

  return title
      .toLowerCase()
      .replaceAll(RegExp(r'[^a-z0-9\s]'), '')
      .split(' ')
      .where((w) => w.length > 3 && !stopWords.contains(w))
      .toSet()
      .take(8)
      .toList();
}

// AI Opportunity Score — 1 to 10
// Based on: sold count, revenue, sell-through, watch count, price
int _calculateOpportunityScore({
  required int sold,
  required double revenue,
  required double sellThrough,
  required int watchCount,
  required double price,
}) {
  double score = 0;

  // Sold count (max 30 pts)
  if (sold >= 100) score += 30;
  else if (sold >= 50) score += 22;
  else if (sold >= 20) score += 15;
  else if (sold >= 5) score += 8;
  else score += 2;

  // Revenue (max 25 pts)
  if (revenue >= 5000) score += 25;
  else if (revenue >= 1000) score += 18;
  else if (revenue >= 500) score += 12;
  else if (revenue >= 100) score += 6;
  else score += 2;

  // Sell-through rate (max 25 pts)
  if (sellThrough >= 80) score += 25;
  else if (sellThrough >= 60) score += 18;
  else if (sellThrough >= 40) score += 12;
  else if (sellThrough >= 20) score += 6;
  else score += 2;

  // Watch count (max 10 pts)
  if (watchCount >= 50) score += 10;
  else if (watchCount >= 20) score += 7;
  else if (watchCount >= 10) score += 4;
  else score += 1;

  // Price sweet spot $10–$80 (max 10 pts)
  if (price >= 10 && price <= 80) score += 10;
  else if (price > 80 && price <= 150) score += 6;
  else score += 2;

  // Convert to 1–10 scale
  return ((score / 100) * 9 + 1).round().clamp(1, 10);
}

// Trend detection — rising / stable / fading
String _calculateTrend(Map<String, dynamic> item) {
  // In production: compare against historical data from Supabase
  // For now: use sell-through + watch count as proxy
  final sold = item['soldQuantity'] ?? 0;
  final watches = item['watchCount'] ?? 0;
  final available = item['availableQuantity'] ?? 1;

  if (sold > 20 && watches > 10) return 'rising';
  if (sold < 3 && available > 10) return 'fading';
  return 'stable';
}