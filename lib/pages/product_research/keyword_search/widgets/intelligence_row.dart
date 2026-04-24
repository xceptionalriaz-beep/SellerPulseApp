import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart' hide TextDirection;
import 'package:fl_chart/fl_chart.dart'; 
import 'dart:math' as math; 
import '../../../../../core/utils/profit_engine.dart';
import 'package:flutter/services.dart'; 

class IntelligenceRow extends StatefulWidget {
  final String itemId; 
  final bool isSelected;
  final ValueChanged<bool?> onSelect;
  final ValueChanged<double>? onProfitChanged;
  final VoidCallback? onPulseCheck; 

  final String imageUrl;
  final String title;
  final String price;
  final String sellerUsername;
  final double sellerFeedbackScore;
  final String itemLocationCountry;
  final String sellerRegisteredCountry;
  final int totalActiveListings;
  final String? itemWebUrl; 
  
  final int totalSold;
  final String lastSoldDate; 
  final int watchCount;

  final List<dynamic> veroMatches; 
  
  final String categoryPath; 
  final String priceTrend; 
  final String? upc; 

  final double aiVelocity;
  final String riskScore;
  final double demandHeat;

  final ProfitSettings profitSettings;

  const IntelligenceRow({
    super.key, 
    required this.itemId, 
    required this.isSelected, 
    required this.onSelect, 
    this.onProfitChanged, 
    this.onPulseCheck, 
    required this.imageUrl, 
    required this.title, 
    required this.price,
    required this.sellerUsername,
    required this.sellerFeedbackScore,
    required this.itemLocationCountry,
    required this.sellerRegisteredCountry,
    required this.totalActiveListings,
    this.itemWebUrl, 
    required this.totalSold, 
    required this.lastSoldDate, 
    required this.watchCount,
    required this.veroMatches, 
    required this.categoryPath, 
    required this.priceTrend, 
    this.upc,
    required this.aiVelocity, 
    required this.riskScore,  
    required this.demandHeat,
    required this.profitSettings, 
  });

  @override
  State<IntelligenceRow> createState() => _IntelligenceRowState();
}

class _IntelligenceRowState extends State<IntelligenceRow> {
  bool _isHovering = false;
  bool _isImageHovering = false; 
  final TextEditingController _amzPriceController = TextEditingController();
  ProfitResult? _liveProfit; 

  bool get _isLikelyDropshipping => widget.itemLocationCountry != widget.sellerRegisteredCountry;
  
  Color get _strengthColor {
    if (widget.sellerFeedbackScore > 10000) return Colors.red;
    if (widget.sellerFeedbackScore > 500) return Colors.orange;
    return Colors.green;
  }

  // ✨ HELPER: Dynamic VeRO Color logic
  Color _getVeroColor(String severity) {
    final s = severity.toLowerCase();
    if (s.contains("critical") || s.contains("ban")) return Colors.red;
    if (s.contains("high")) return Colors.orange;
    if (s.contains("caution") || s.contains("yellow")) return Colors.amber;
    return Colors.red; 
  }

  // ✨ THE MAGIC: Slices the title and injects the Inline Badges
  List<InlineSpan> _buildSmartTitle() {
    if (widget.veroMatches.isEmpty) {
      return [TextSpan(text: widget.title)];
    }

    String lowerTitle = widget.title.toLowerCase();
    List<Map<String, dynamic>> foundIndices = [];

    // Find all exact positions of the dangerous words in the title
    for (var match in widget.veroMatches) {
      String tw = (match['triggered_word']?.toString() ?? "").toLowerCase();
      if (tw.isEmpty) continue;

      int startIndex = 0;
      while (true) {
        int index = lowerTitle.indexOf(tw, startIndex);
        if (index == -1) break;
        foundIndices.add({
          'start': index,
          'end': index + tw.length,
          'match': match,
          'original_text': widget.title.substring(index, index + tw.length) 
        });
        startIndex = index + tw.length;
      }
    }

    // Sort them so we read left to right
    foundIndices.sort((a, b) => a['start'].compareTo(b['start']));

    // Remove overlapping words to prevent rendering errors
    List<Map<String, dynamic>> cleanIndices = [];
    int lastEnd = 0;
    for (var f in foundIndices) {
      if (f['start'] >= lastEnd) {
        cleanIndices.add(f);
        lastEnd = f['end'];
      }
    }

    List<InlineSpan> spans = [];
    int currentIndex = 0;

    // Piece the sentence back together, injecting the badges!
    for (var f in cleanIndices) {
      if (f['start'] > currentIndex) {
        spans.add(TextSpan(text: widget.title.substring(currentIndex, f['start'])));
      }

      final matchData = f['match'];
      Color badgeColor = _getVeroColor(matchData['severity']?.toString() ?? "");

      // Add the highlighted word + shield icon inline!
      spans.add(
        WidgetSpan(
          alignment: PlaceholderAlignment.middle,
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 2),
            padding: const EdgeInsets.only(left: 4, right: 4, top: 1, bottom: 1),
            decoration: BoxDecoration(
              color: badgeColor.withAlpha(25),
              border: Border.all(color: badgeColor.withAlpha(80)),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  f['original_text'],
                  style: TextStyle(fontWeight: FontWeight.w900, color: badgeColor, fontSize: 11),
                ),
                const SizedBox(width: 3),
                // ✨ UPGRADED: Custom Tooltip with Arrow Shape
                Tooltip(
                  message: "Brand: ${matchData['brand_name']}\nRisk: ${matchData['severity']}",
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6), 
                  decoration: const ShapeDecoration(
                    color: Color(0xFFEBF6D4), 
                    shape: _TooltipArrowShape(), // ✨ Connects the arrow shape below
                    shadows: [
                      BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2))
                    ],
                  ),
                  textStyle: const TextStyle(
                    color: Color(0xFF0F172A), 
                    fontSize: 10, 
                    fontWeight: FontWeight.w600,
                    height: 1.3,
                  ),
                  preferBelow: false, // ✨ Forces it to open ABOVE the text!
                  verticalOffset: 12, // Brings it down closer to the shield
                  child: Icon(Icons.shield, color: badgeColor, size: 10),
                ),
              ],
            ),
          ),
        ),
      );
      currentIndex = f['end'];
    }

    if (currentIndex < widget.title.length) {
      spans.add(TextSpan(text: widget.title.substring(currentIndex)));
    }

    return spans;
  }

  // ✨ THE FRESHNESS CALCULATOR (Upgraded to hide "Verified" clutter)
  Widget _buildLastSoldSignal() {
    // If there is no date from eBay, draw nothing!
    if (widget.lastSoldDate == "Verified" || widget.lastSoldDate == "N/A" || widget.lastSoldDate == "null" || widget.lastSoldDate.isEmpty) {
      return const SizedBox.shrink(); 
    }

    try {
      DateTime lastSold = DateTime.parse(widget.lastSoldDate);
      Duration diff = DateTime.now().difference(lastSold);

      String timeAgo;
      Color signalColor;
      bool showPulse = false;

      // 1. TODAY'S SALES (< 12 hours ago = Hot/Bright Green)
      if (diff.inHours < 12) {
        timeAgo = diff.inMinutes < 60 ? "${diff.inMinutes}m ago" : "${diff.inHours}h ago";
        signalColor = const Color(0xFF16A34A); 
        showPulse = true;
      } 
      // 2. YESTERDAY'S SALES (12 - 24 hours ago = Soft Green)
      else if (diff.inHours < 24) {
        timeAgo = "${diff.inHours}h ago";
        signalColor = const Color(0xFF4ADE80); 
        showPulse = false; 
      } 
      // 3. OLDER SALES (> 24 hours = Grey with 'd ago' shorthand)
      else {
        timeAgo = "${diff.inDays}d ago"; 
        signalColor = Colors.grey.shade500; 
        showPulse = false;
      }

      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showPulse) 
            Container(
              margin: const EdgeInsets.only(right: 4), 
              width: 4, height: 4, 
              decoration: BoxDecoration(color: signalColor, shape: BoxShape.circle)
            ),
          Text(timeAgo, style: TextStyle(fontSize: 9, color: signalColor, fontWeight: FontWeight.w900)),
        ],
      );
    } catch (e) {
      // If the date format is broken, draw nothing!
      return const SizedBox.shrink();
    }
  }

  void _calculateRowProfit(String amzPriceString) {
    double? amzPrice = double.tryParse(amzPriceString);
    
    if (amzPriceString.isEmpty || amzPrice == null) {
      setState(() => _liveProfit = null);
      if (widget.onProfitChanged != null) widget.onProfitChanged!(0.0); 
      return;
    }

    String cleanEbayPrice = widget.price.replaceAll(RegExp(r'[^\d.]'), '');
    double ebayPrice = double.tryParse(cleanEbayPrice) ?? 0.0;

    final result = ProfitEngine.calculate(
      sellingPrice: ebayPrice, 
      buyPrice: amzPrice, 
      settings: widget.profitSettings 
    );
    
    setState(() => _liveProfit = result);
    
    if (widget.onProfitChanged != null) {
      widget.onProfitChanged!(result.netProfit);
    }
  }

  Future<void> _launchItemUrl() async {
    if (widget.itemWebUrl != null && widget.itemWebUrl!.isNotEmpty) {
      final Uri url = Uri.parse(widget.itemWebUrl!);
      if (!await launchUrl(url)) debugPrint('Could not launch $url');
    }
  }

  Future<void> _launchSearch(String baseUrl, String queryParam) async {
    String query = Uri.encodeComponent(widget.title);
    final Uri url = Uri.parse('$baseUrl?$queryParam=$query');
    if (!await launchUrl(url)) debugPrint('Could not launch $url');
  }

  Future<void> _launchGoogleLens() async {
    String encodedUrl = Uri.encodeComponent(widget.imageUrl);
    final Uri url = Uri.parse('https://lens.google.com/uploadbyurl?url=$encodedUrl');
    if (!await launchUrl(url)) debugPrint('Could not launch Google Lens');
  }

  Widget _buildSparkline() {
    final random = math.Random(widget.itemId.hashCode);
    List<FlSpot> spots = [];

    double baseVelocity = widget.aiVelocity > 0 ? widget.aiVelocity : 5.0;
    double itemVolatility = (widget.demandHeat > 0.05 ? widget.demandHeat : random.nextDouble()) * 1.2;

    int phaseShift = random.nextInt(7); 
    double dailyDrift = (random.nextDouble() - 0.5) * 0.12; 

    for (int day = 0; day < 14; day++) {
      double cycle = ((day + phaseShift) % 7 >= 5) ? 1.35 : 0.85;
      double noise = 1.0 + ((random.nextDouble() - 0.5) * itemVolatility);
      double driftFactor = 1.0 + (day * dailyDrift);

      double plotY = baseVelocity * cycle * noise * driftFactor;
      if (plotY < 0.5) plotY = 0.5 + random.nextDouble(); 

      spots.add(FlSpot(day.toDouble(), plotY));
    }

    double minY = spots.map((e) => e.y).reduce(math.min);
    double maxY = spots.map((e) => e.y).reduce(math.max);
    
    minY = (minY * 0.5).clamp(0.0, double.infinity); 
    maxY = maxY * 1.15;

    const Color neonGreen = Color(0xFF8FFF00);

    return SizedBox(
      height: 32,
      width: 75,
      child: LineChart(
        LineChartData(
          minY: minY, 
          maxY: maxY, 
          gridData: const FlGridData(show: false),
          titlesData: const FlTitlesData(show: false),
          borderData: FlBorderData(show: false),
          lineTouchData: const LineTouchData(enabled: false), 
          lineBarsData: [
            LineChartBarData(
              spots: spots,
              isCurved: true,
              curveSmoothness: 0.35, 
              color: neonGreen.withAlpha(230),
              barWidth: 1.8,
              isStrokeCapRound: true,
              dotData: const FlDotData(show: false),
              belowBarData: BarAreaData(
                show: true,
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    neonGreen.withAlpha(76), 
                    neonGreen.withAlpha(0),  
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final String formattedFeedback = NumberFormat.decimalPattern().format(widget.sellerFeedbackScore.toInt());

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovering = true),
      onExit: (_) => setState(() => _isHovering = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        decoration: BoxDecoration(
          color: widget.isSelected 
              ? const Color(0xFF8FFF00).withAlpha(25) 
              : (_isHovering ? const Color(0xFF8FFF00).withAlpha(15) : Colors.white),
          border: const Border(bottom: BorderSide(color: Color(0xFFF1F5F9)))
        ),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        child: GestureDetector(
          behavior: HitTestBehavior.translucent,
          onTap: widget.onPulseCheck, 
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(
                width: 48,
                child: Checkbox(
                  value: widget.isSelected, 
                  onChanged: widget.onSelect, 
                  activeColor: const Color(0xFF8FFF00), 
                  checkColor: Colors.black
                ),
              ),
              
              // 1. PRODUCT COLUMN
              Expanded(
                flex: 8,
                child: Padding(
                  padding: const EdgeInsets.only(right: 20.0), 
                  child: Row(
                    children: [
                      MouseRegion(
                        cursor: SystemMouseCursors.click, 
                        onEnter: (_) => setState(() => _isImageHovering = true),
                        onExit: (_) => setState(() => _isImageHovering = false),
                        child: GestureDetector(
                          onTap: _launchItemUrl, 
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 150),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: _isImageHovering ? const Color(0xFF8FFF00) : Colors.transparent, width: 2),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(4), 
                              child: Image.network(
                                widget.imageUrl, width: 34, height: 34, fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) => Container(width: 34, height: 34, color: Colors.grey.shade200, child: const Icon(Icons.image_not_supported, size: 14, color: Colors.grey)),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            RichText(
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              text: TextSpan(
                                style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B), fontSize: 11, height: 1.4),
                                children: _buildSmartTitle(),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(widget.categoryPath, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 9, color: Colors.grey.shade500, fontWeight: FontWeight.w500)),
                          ],
                        ),
                      ), 
                    ],
                  ),
                ),
              ),

              // 2. SELLER COLUMN
              Expanded(
                flex: 4,
                child: Row(
                  children: [
                    Text(_getFlagEmoji(widget.sellerRegisteredCountry), style: const TextStyle(fontSize: 14)),
                    const SizedBox(width: 6),
                    Flexible(
                      child: Text(widget.sellerUsername, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 11, color: Colors.blueGrey.shade700, fontWeight: FontWeight.bold))
                    ),
                    const SizedBox(width: 6),
                    
                    Tooltip(
                      message: "Deep Scan Seller",
                      textStyle: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold),
                      decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(6)),
                      child: InkWell(
                        onTap: () {
                          debugPrint("Initiating Deep Scan for: ${widget.sellerUsername}");
                        },
                        borderRadius: BorderRadius.circular(4),
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF6366F1).withAlpha(20),
                            border: Border.all(color: const Color(0xFF6366F1).withAlpha(50)),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Icon(Icons.radar, size: 12, color: Color(0xFF6366F1)),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // 3. FEEDBACK
              Expanded(
                flex: 2,
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.star, size: 13, color: Color(0xFF8FFF00)),
                      const SizedBox(width: 4),
                      Text(formattedFeedback, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: _strengthColor)),
                      if (_isLikelyDropshipping) ...[
                        const SizedBox(width: 4),
                        const Icon(Icons.warning_amber_rounded, size: 12, color: Colors.red),
                      ]
                    ],
                  ),
                ),
              ),

              // 4. TREND COLUMN
              Expanded(
                flex: 2,
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: _buildSparkline(),
                ),
              ),

              // 5. TOTAL SALE (Upgraded to stack the number and the freshness signal)
              Expanded(
                flex: 2,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.shopping_bag_outlined, size: 13, color: Colors.blueGrey.shade400),
                        const SizedBox(width: 4),
                        Text("${widget.totalSold}", style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
                      ],
                    ),
                    const SizedBox(height: 2),
                    _buildLastSoldSignal(), // ✨ Injects the "3h ago" or "2d ago" right below the number!
                  ],
                ),
              ),

              // 6. WATCH
              Expanded(
                flex: 2,
                child: Row(
                  children: [
                    const Icon(Icons.visibility_outlined, size: 12, color: Colors.blueGrey),
                    const SizedBox(width: 4),
                    Text("${widget.watchCount}", style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                  ],
                ),
              ),
              
              // 7. PRICE
              Expanded(
                flex: 2, 
                child: Text(widget.price, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF1E293B)))
              ),
              
              // 8. BUY
              Expanded(
                flex: 2,
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: SizedBox(
                    height: 28, width: 55,
                    child: TextField(
                      controller: _amzPriceController,
                      textAlign: TextAlign.center,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      inputFormatters: [
                        FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*')),
                      ],
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                      decoration: InputDecoration(
                        hintText: "Cost", 
                        hintStyle: TextStyle(fontSize: 10, color: Colors.grey.shade400),
                        contentPadding: EdgeInsets.zero, 
                        filled: true, fillColor: Colors.white,
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(4), borderSide: BorderSide(color: Colors.grey.shade300)),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(4), borderSide: const BorderSide(color: Colors.orange)),
                      ),
                      onChanged: _calculateRowProfit, 
                    ),
                  ),
                ),
              ),
              
              // 9. PROFIT
              Expanded(
                flex: 2, 
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: _liveProfit == null 
                    ? const Text("-", style: TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.bold))
                    : Text("\$${_liveProfit!.netProfit.toStringAsFixed(2)}", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: _liveProfit!.netProfit > 0 ? Colors.green.shade700 : Colors.red.shade700)),
                )
              ),

              // 10. ACTION HUB
              Expanded(
                flex: 3, 
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    _buildSmallActionIcon('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Amazon_icon.svg/128px-Amazon_icon.svg.png', () => _launchSearch('https://www.amazon.com/s', 'k'), Icons.shopping_cart, Colors.orange),
                    const SizedBox(width: 4),
                    _buildSmallActionIcon('https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Aliexpress_logo.svg/128px-Aliexpress_logo.svg.png', () => _launchSearch('https://www.aliexpress.com/wholesale', 'SearchText'), Icons.storefront, Colors.red),
                    const SizedBox(width: 4),
                    _buildSmallActionIcon('https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Google_Lens_-_new_logo.png/120px-Google_Lens_-_new_logo.png', _launchGoogleLens, Icons.image_search, Colors.blue),
                    const SizedBox(width: 6),
                    IconButton(icon: const Icon(Icons.bookmark_border, size: 18, color: Color(0xFF94A3B8)), onPressed: () {}, padding: EdgeInsets.zero, constraints: const BoxConstraints()),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSmallActionIcon(String url, VoidCallback onTap, IconData fallbackIcon, Color fallbackColor) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(color: Colors.white, border: Border.all(color: Colors.grey.shade200), borderRadius: BorderRadius.circular(4)),
        child: Image.network(url, width: 14, height: 14, errorBuilder: (context, error, stackTrace) => Icon(fallbackIcon, size: 14, color: fallbackColor)),
      ),
    );
  }

  String _getFlagEmoji(String countryCode) {
    String code = countryCode.toUpperCase().trim();
    if (code == 'UK') code = 'GB'; 
    if (code.length != 2) return '🏳️';
    final int firstLetter = code.codeUnitAt(0) - 65 + 127462;
    final int secondLetter = code.codeUnitAt(1) - 65 + 127462;
    return String.fromCharCode(firstLetter) + String.fromCharCode(secondLetter);
  }
}

// ✨ Custom Shape to draw the little downward arrow on the Tooltip!
class _TooltipArrowShape extends ShapeBorder {
  final double arrowWidth = 10.0;
  final double arrowHeight = 5.0;

  const _TooltipArrowShape();

  @override
  EdgeInsetsGeometry get dimensions => EdgeInsets.only(bottom: arrowHeight);

  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) => Path();

  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) {
    // Draw the tight rounded box
    final RRect rrect = RRect.fromRectAndRadius(
      Rect.fromLTWH(rect.left, rect.top, rect.width, rect.height - arrowHeight),
      const Radius.circular(6),
    );
    final Path path = Path()..addRRect(rrect);
    
    // Draw the little arrow pointing down
    final double arrowCenterX = rect.left + rect.width / 2;
    final double arrowTopY = rect.bottom - arrowHeight;
    
    path.moveTo(arrowCenterX - (arrowWidth / 2), arrowTopY);
    path.lineTo(arrowCenterX, rect.bottom);
    path.lineTo(arrowCenterX + (arrowWidth / 2), arrowTopY);
    path.close();
    
    return path;
  }

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {}

  @override
  ShapeBorder scale(double t) => this;
}