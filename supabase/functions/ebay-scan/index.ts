// supabase/functions/ebay-scan/index.ts
//
// SellerPulse — eBay Scan Edge Function
// Runs server-side on Supabase — no CORS issues
// Fetches API keys from api_fleet_config, calls eBay API, returns results

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── 1. Parse request body ──
    const { username } = await req.json();
    if (!username) {
      return new Response(
        JSON.stringify({ error: "username is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 2. Get Supabase client using service role key ──
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // ── 3. Fetch eBay API keys from your vault ──
    const { data: vaultData, error: vaultError } = await supabase
      .from("api_fleet_config")
      .select("primary_key_1, primary_key_2")
      .eq("platform_name", "ebay")
      .single();

    if (vaultError || !vaultData) {
      return new Response(
        JSON.stringify({ error: "eBay API keys not found in vault" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const clientId = vaultData.primary_key_1;
    const clientSecret = vaultData.primary_key_2;

    if (!clientId || clientId === "empty") {
      return new Response(
        JSON.stringify({ error: "eBay App ID missing in Admin → API Vault" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 4. Get eBay OAuth token ──
    const credentials = btoa(`${clientId}:${clientSecret}`);
    const tokenResponse = await fetch(
      "https://api.ebay.com/identity/v1/oauth2/token",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
      }
    );

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      return new Response(
        JSON.stringify({ error: `eBay auth failed: ${err}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // ── 5. Fetch seller listings ──
    const listingsUrl =
      `https://api.ebay.com/buy/browse/v1/item_summary/search` +
      `?q=a&filter=sellers%3A%7B${username}%7D&limit=100&sort=BEST_MATCH`;

    const listingsResponse = await fetch(listingsUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
        "Content-Type": "application/json",
      },
    });

    if (!listingsResponse.ok) {
      const err = await listingsResponse.text();
      return new Response(
        JSON.stringify({ error: `Failed to fetch listings: ${err}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const listingsData = await listingsResponse.json();
    const items = listingsData.itemSummaries ?? [];

    // ── 6. Process items — build products + metrics ──
    let totalRevenue = 0;
    let totalSold = 0;
    let totalPrice = 0;

    const products = items.map((item: any) => {
      const price = parseFloat(item.price?.value ?? "0");
      const sold = item.soldQuantity ?? 0;
      const available = item.availableQuantity ?? 1;
      const revenue = price * sold;
      const sellThrough =
        sold + available > 0 ? (sold / (sold + available)) * 100 : 0;

      totalRevenue += revenue;
      totalSold += sold;
      totalPrice += price;

      // AI Opportunity Score
      const score = calculateScore(sold, revenue, sellThrough,
        item.watchCount ?? 0, price);

      // Trend
      const trend = sold > 20 && (item.watchCount ?? 0) > 10
        ? "rising"
        : sold < 3 && available > 10
        ? "fading"
        : "stable";

      // Keywords
      const keywords = extractKeywords(item.title ?? "");

      return {
        itemId: item.itemId ?? "",
        title: item.title ?? "",
        price,
        soldCount: sold,
        revenue,
        sellThrough,
        imageUrl: item.image?.imageUrl ?? null,
        category: item.categoryPath ?? null,
        condition: item.condition ?? "Unknown",
        freeShipping:
          item.shippingOptions?.[0]?.shippingCostType === "FREE",
        watchCount: item.watchCount ?? 0,
        listingType:
          item.buyingOptions?.includes("FIXED_PRICE")
            ? "FixedPrice"
            : "Auction",
        trend,
        opportunityScore: score,
        ebayUrl: item.itemWebUrl ?? null,
        topKeywords: keywords,
      };
    });

    // Sort by opportunity score
    products.sort(
      (a: any, b: any) => b.opportunityScore - a.opportunityScore
    );

    const avgPrice = items.length > 0 ? totalPrice / items.length : 0;
    const sellThrough =
      items.length + totalSold > 0
        ? (totalSold / (items.length + totalSold)) * 100
        : 0;

    // ── 7. Build store overview ──
    const firstItem = items[0] ?? {};
    const seller = firstItem.seller ?? {};

    const overview = {
      username,
      storeName: seller.username === username ? null : seller.storeName ?? null,
      feedbackScore: seller.feedbackScore ?? 0,
      feedbackPercent:
        parseFloat(seller.feedbackPercentage ?? "100"),
      activeListings: items.length,
      totalSold,
      estimatedRevenue: totalRevenue,
      avgPrice,
      sellThroughRate: sellThrough,
      storeUrl: `https://www.ebay.com/str/${username}`,
    };

    // ── 8. Extract top keywords ──
    const allKeywords: string[] = [];
    for (const p of products) allKeywords.push(...p.topKeywords);
    const freq: Record<string, number> = {};
    for (const kw of allKeywords) freq[kw] = (freq[kw] ?? 0) + 1;
    const topKeywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([kw]) => kw);

    // ── 9. Gap finder ──
    const sellerCategories = new Set(
      products.map((p: any) => (p.category ?? "").toLowerCase())
    );
    const demandMap: Record<string, number> = {
      Electronics: 92, "Sporting Goods": 78, "Home & Garden": 85,
      "Health & Beauty": 80, "Toys & Hobbies": 74,
      "Clothing, Shoes & Accessories": 88,
      Collectibles: 70, "Auto Parts": 82,
    };
    const reasonMap: Record<string, string> = {
      Electronics: "High search volume, fast-moving items",
      "Sporting Goods": "Growing category, low competition",
      "Home & Garden": "Evergreen demand, high margins",
      "Health & Beauty": "Repeat buyers, strong sell-through",
      "Toys & Hobbies": "Seasonal spikes, great ROI",
      "Clothing, Shoes & Accessories": "High volume, easy to source",
      Collectibles: "Passionate buyers, premium pricing",
      "Auto Parts": "High AOV, low return rate",
    };

    const gaps = Object.entries(demandMap)
      .filter(([cat]) =>
        ![...sellerCategories].some((c) =>
          c.includes(cat.toLowerCase())
        )
      )
      .slice(0, 6)
      .map(([cat, demand]) => ({
        title: `${cat} products`,
        category: cat,
        estimatedDemand: demand,
        reason: reasonMap[cat],
      }));

    // ── 10. Return full result ──
    return new Response(
      JSON.stringify({ overview, products, gaps, topKeywords }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${err.message}` }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// ── Helpers ──

function calculateScore(
  sold: number, revenue: number, sellThrough: number,
  watchCount: number, price: number
): number {
  let score = 0;
  if (sold >= 100) score += 30;
  else if (sold >= 50) score += 22;
  else if (sold >= 20) score += 15;
  else if (sold >= 5) score += 8;
  else score += 2;

  if (revenue >= 5000) score += 25;
  else if (revenue >= 1000) score += 18;
  else if (revenue >= 500) score += 12;
  else if (revenue >= 100) score += 6;
  else score += 2;

  if (sellThrough >= 80) score += 25;
  else if (sellThrough >= 60) score += 18;
  else if (sellThrough >= 40) score += 12;
  else if (sellThrough >= 20) score += 6;
  else score += 2;

  if (watchCount >= 50) score += 10;
  else if (watchCount >= 20) score += 7;
  else if (watchCount >= 10) score += 4;
  else score += 1;

  if (price >= 10 && price <= 80) score += 10;
  else if (price > 80 && price <= 150) score += 6;
  else score += 2;

  return Math.min(10, Math.max(1, Math.round((score / 100) * 9 + 1)));
}

function extractKeywords(title: string): string[] {
  const stopWords = new Set([
    "for", "the", "and", "with", "new", "used", "lot",
    "set", "pack", "pcs", "piece", "pieces", "inch",
    "free", "shipping", "fast", "buy", "sale", "best",
    "top", "quality", "great", "original", "genuine",
  ]);
  return [
    ...new Set(
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(" ")
        .filter((w) => w.length > 3 && !stopWords.has(w))
    ),
  ].slice(0, 8);
}