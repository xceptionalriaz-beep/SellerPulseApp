import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';

// ✨ This object holds all the finalized data to send back to the UI
class MarketResearchResult {
  final String nicheTotalActive;
  final String nicheAvgPrice;
  final String nicheMarketVol;
  final String nicheSuccessRate;
  final Color nicheSuccessColor;
  final double nicheSaturationScore;
  final String nicheAdInsight;
  final List<FlSpot> historicalSalesData;
  final List<dynamic> liveProducts;

  MarketResearchResult({
    required this.nicheTotalActive,
    required this.nicheAvgPrice,
    required this.nicheMarketVol,
    required this.nicheSuccessRate,
    required this.nicheSuccessColor,
    required this.nicheSaturationScore,
    required this.nicheAdInsight,
    required this.historicalSalesData,
    required this.liveProducts,
  });
}

class MarketBrainService {
  // --- THE PRO BACKEND ENGINE ---
  static Future<MarketResearchResult> conductResearch(String query, int currentPage) async {
    final supabase = Supabase.instance.client;
    final cleanQuery = query.toLowerCase().trim();

    // =====================================================================
    // ⚡ PHASE 1: THE CACHE INTERCEPTOR (Lightning Fast Loading)
    // Only check cache for Page 1 of the results.
    // =====================================================================
    if (currentPage == 1) {
      try {
        final cachedData = await supabase
            .from('market_cache')
            .select()
            .eq('search_query', cleanQuery)
            // Ensure data is less than 24 hours old
            .gte('created_at', DateTime.now().subtract(const Duration(hours: 24)).toIso8601String())
            .order('created_at', ascending: false)
            .limit(1)
            .maybeSingle();

        if (cachedData != null) {
          debugPrint("⚡ CACHE HIT: Loaded '$cleanQuery' instantly from Supabase!");
          
          // Rebuild the Chart Spots from JSON
          List<FlSpot> cachedSpots = (cachedData['trend_data'] as List)
              .map((e) => FlSpot((e['x'] as num).toDouble(), (e['y'] as num).toDouble()))
              .toList();

          return MarketResearchResult(
            nicheTotalActive: cachedData['total_active'],
            nicheAvgPrice: cachedData['avg_price'],
            nicheMarketVol: cachedData['market_vol'],
            nicheSuccessRate: cachedData['success_rate'],
            nicheSuccessColor: Color(int.parse(cachedData['success_color'], radix: 16)),
            nicheSaturationScore: (cachedData['saturation_score'] as num).toDouble(),
            nicheAdInsight: cachedData['ad_insight'],
            historicalSalesData: cachedSpots,
            liveProducts: cachedData['products'] as List<dynamic>,
          );
        }
      } catch (e) {
        debugPrint("⚠️ Cache Read Failed, proceeding to fresh fetch: $e");
      }
    }

    // =====================================================================
    // 🐢 PHASE 2: FRESH FETCH & AI CALCULATION
    // =====================================================================
    final response = await supabase.functions.invoke(
      'ebay-search', 
      body: {'query': query, 'page': currentPage},
    );

    final data = response.data;
    if (data != null && data is Map && data['error'] != null) {
      throw Exception(data['error']);
    }

    final List itemSummaries = data['itemSummaries'] ?? [];
    final int totalEbayListings = int.tryParse(data['total']?.toString() ?? '0') ?? 0; 

    // 1. DATA BRIDGE: Fetch/Calculate Trend
    final List? dynamicTrend = data['historicalTrend'];
    List<FlSpot> newTrendData = [];
    
    if (dynamicTrend != null && dynamicTrend.isNotEmpty) {
      for (int i = 0; i < dynamicTrend.length; i++) {
        newTrendData.add(FlSpot(i.toDouble(), (dynamicTrend[i]['volume'] as num).toDouble()));
      }
    } else {
      final int seed = query.hashCode;
      final math.Random seededRandom = math.Random(seed);
      double baseDailySales = (totalEbayListings * 0.05) / 30;
      
      for (int i = 0; i <= 30; i++) {
        double noise = (seededRandom.nextDouble() - 0.5) * 0.7;
        double trendFactor = (seededRandom.nextDouble() > 0.5 ? 1.15 : 0.85);
        double dailyValue = (baseDailySales + (baseDailySales * noise)) * (1 + (i * 0.01 * (trendFactor - 1)));
        newTrendData.add(FlSpot(i.toDouble(), dailyValue.clamp(0, double.infinity)));
      }
    }

    // 2. ✨ THE AI SENTIMENT BRAIN
    double baseStr = (totalEbayListings < 1000) ? 60.0 : (totalEbayListings > 50000 ? 15.0 : 35.0);
    double calculatedSTR = (baseStr + (math.Random(query.hashCode).nextDouble() - 0.5) * 20).clamp(5.0, 95.0);

    double firstVal = newTrendData.first.y;
    double lastVal = newTrendData.last.y;
    bool isTrendingUp = lastVal > firstVal;

    String sentimentLabel;
    Color sentimentColor;

    if (isTrendingUp && calculatedSTR > 50) {
      sentimentLabel = "🚀 STRONG BULLISH";
      sentimentColor = const Color(0xFF16A34A); 
    } else if (!isTrendingUp && calculatedSTR < 25) {
      sentimentLabel = "⚠️ HIGH RISK (Saturated)";
      sentimentColor = const Color(0xFFDC2626); 
    } else if (isTrendingUp && calculatedSTR < 40) {
      sentimentLabel = "📈 SPECULATIVE GROWTH";
      sentimentColor = const Color(0xFF2563EB); 
    } else {
      sentimentLabel = "⚖️ NEUTRAL / STEADY";
      sentimentColor = const Color(0xFF475569); 
    }

    // 3. ✨ THE COMPETITOR SATURATION ENGINE
    double densityScore = (100.0 - calculatedSTR).clamp(5.0, 95.0);
    
    String insight;
    if (densityScore > 75) {
      insight = "High Saturation. Est. 12-15% Ad Rate needed to rank.";
    } else if (densityScore > 40) {
      insight = "Moderate Competition. Est. 5-8% Ad Rate needed.";
    } else {
      insight = "Low Competition. Organic ranking highly possible.";
    }

    double totalPrice = 0.0;
    int validPrices = 0;
    for (var item in itemSummaries) {
      final priceData = item['price'];
      if (priceData != null && priceData['value'] != null) {
        totalPrice += double.tryParse(priceData['value'].toString()) ?? 0.0;
        validPrices++;
      }
    }

    double calculatedAvgPrice = validPrices > 0 ? (totalPrice / validPrices) : 0.0;
    double calculatedMarketVol = calculatedAvgPrice * (totalEbayListings * 0.10);

    final moneyFormat = NumberFormat.currency(locale: 'en_US', symbol: '\$', decimalDigits: 2);
    final compactFormat = NumberFormat.compactCurrency(locale: 'en_US', symbol: '\$', decimalDigits: 0);

    // =====================================================================
    // 🧠 PRODUCT MAPPING & INTELLIGENCE EXTRACTION
    // =====================================================================
    final mappedProducts = itemSummaries.map((item) {
      final priceData = item['price'];
      final imageData = item['image'];
      
      // Attempt to pull real data from standard eBay Buy API response
      final sellerData = item['seller']; 
      final locationData = item['itemLocation'];

      // ✨ THE UNIQUE IDENTIFIER (Crucial for Bulk Actions)
      // We look for itemId, fallback to web URL, fallback to random hash
      final String itemId = item['itemId'] ?? item['itemWebUrl'] ?? 'id_${math.Random().nextInt(9999999)}';

      // Extract or Simulate Seller Username
      String sellerName = sellerData != null && sellerData['username'] != null 
          ? sellerData['username'] 
          : 'PowerSeller_${math.Random().nextInt(9999)}';

      // Extract or Simulate Feedback Score
      double feedback = sellerData != null && sellerData['feedbackScore'] != null
          ? (double.tryParse(sellerData['feedbackScore'].toString()) ?? 0.0) 
          : (math.Random().nextInt(15000).toDouble()); 

      // Extract or Simulate Item Location Country
      String itemLoc = locationData != null && locationData['country'] != null
          ? locationData['country']
          : 'US';

      // Simulate Dropshipping behavior (15% chance they are registered in CN but item is in US)
      String sellerLoc = itemLoc;
      if (sellerData == null || sellerData['registeredCountry'] == null) {
        if (math.Random().nextDouble() > 0.85) {
          sellerLoc = 'CN';
        }
      } else {
        sellerLoc = sellerData['registeredCountry'];
      }

      int activeListings = math.Random().nextInt(4000) + 10;

      // ✨ DEMAND & SAFETY INTELLIGENCE (Simulated until eBay API provides it)
      int soldCount = math.Random().nextInt(300);
      int watchers = (soldCount * 0.2).toInt() + math.Random().nextInt(15);
      List<String> dates = ["Today", "Yesterday", "2026-04-09", "2026-03-20"];
      String lastSold = dates[math.Random().nextInt(dates.length)];
      
      bool isVero = math.Random().nextDouble() > 0.95; // 5% chance of brand protection
      String trend = ["up", "down", "stable"][math.Random().nextInt(3)];
      
      String catPath = "Home & Garden > Pet Supplies";
      if (item['categories'] != null && (item['categories'] as List).isNotEmpty) {
        catPath = item['categories'][0]['categoryName'] ?? catPath;
      }

      return {
        "itemId": itemId, // 👈 Added Unique ID here
        "title": item['title'] ?? 'Unknown Product',
        "image": imageData != null ? imageData['imageUrl'] : 'https://via.placeholder.com/150',
        "sales": "\$${priceData != null ? priceData['value'] : '0.00'}", 
        "itemWebUrl": item['itemWebUrl'],
        "sellerUsername": sellerName,
        "sellerFeedbackScore": feedback,
        "itemLocationCountry": itemLoc,
        "sellerRegisteredCountry": sellerLoc,
        "totalActiveListings": activeListings,
        // Passing the intelligence fields so UI doesn't have to guess
        "totalSold": soldCount,
        "lastSoldDate": lastSold,
        "watchCount": watchers,
        "isVero": isVero,
        "category": catPath,
        "trend": trend,
        "upc": item['gtin'] ?? null,
      };
    }).toList();

    final result = MarketResearchResult(
      nicheTotalActive: "${NumberFormat.decimalPattern().format(totalEbayListings)}+ listings",
      nicheAvgPrice: moneyFormat.format(calculatedAvgPrice),
      nicheMarketVol: compactFormat.format(calculatedMarketVol),
      nicheSuccessRate: "${calculatedSTR.toStringAsFixed(1)}% ($sentimentLabel)",
      nicheSuccessColor: sentimentColor,
      nicheSaturationScore: densityScore,
      nicheAdInsight: insight,
      historicalSalesData: newTrendData,
      liveProducts: mappedProducts,
    );

    // =====================================================================
    // 💾 PHASE 3: SAVE TO CACHE
    // =====================================================================
    if (currentPage == 1) {
      try {
        await supabase.from('market_cache').insert({
          'user_id': supabase.auth.currentUser?.id, 
          'search_query': cleanQuery,
          'total_active': result.nicheTotalActive,
          'avg_price': result.nicheAvgPrice,
          'market_vol': result.nicheMarketVol,
          'success_rate': result.nicheSuccessRate,
          'success_color': result.nicheSuccessColor.value.toRadixString(16), 
          'saturation_score': result.nicheSaturationScore,
          'ad_insight': result.nicheAdInsight,
          'trend_data': result.historicalSalesData.map((e) => {'x': e.x, 'y': e.y}).toList(), 
          'products': result.liveProducts, 
        });
        debugPrint("💾 CACHE SAVED: Stored '$cleanQuery' in Supabase.");
      } catch (e) {
        debugPrint("⚠️ Cache Write Failed: $e");
      }
    }

    return result;
  }
}