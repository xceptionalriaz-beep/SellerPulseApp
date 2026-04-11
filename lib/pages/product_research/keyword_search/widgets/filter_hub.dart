import 'package:flutter/material.dart';
import '../models/search_filters.dart';

class FilterHub extends StatefulWidget {
  final SearchFilters filters;

  const FilterHub({super.key, required this.filters});

  @override
  State<FilterHub> createState() => _FilterHubState();
}

class _FilterHubState extends State<FilterHub> {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 15.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Marketplace Card
          _expandedCard(
            title: "Marketplace",
            icon: Icons.storefront_outlined,
            helpText: "Select which eBay country site\nto search (e.g., USA, UK, Germany).",
            child: _buildDropdown(
              value: widget.filters.marketplace,
              items: [
                {'val': 'US', 'label': '🇺🇸 ebay.com'},
                {'val': 'UK', 'label': '🇬🇧 ebay.co.uk'},
                {'val': 'DE', 'label': '🇩🇪 ebay.de'},
                {'val': 'IT', 'label': '🇮🇹 ebay.it'},
              ],
              onChanged: (val) => setState(() => widget.filters.marketplace = val!),
            ),
          ),

          // 2. Shipping Location Card
          _expandedCard(
            title: "Shipping Location",
            icon: Icons.local_shipping_outlined,
            helpText: "Filter results based on where\nthe item is physically located.",
            child: _buildDropdown(
              value: widget.filters.shipFrom,
              items: [
                {'val': 'Any', 'label': '🌎 Anywhere'},
                {'val': 'US', 'label': '🇺🇸 United States'},
                {'val': 'CN', 'label': '🇨🇳 China'},
              ],
              onChanged: (val) => setState(() => widget.filters.shipFrom = val!),
            ),
          ),

          // 3. Price Card
          _expandedCard(
            title: "Price (${widget.filters.currencySymbol})",
            icon: Icons.attach_money,
            helpText: "Set a minimum and maximum price\nto filter out low-value items.",
            child: _buildRangeInput(
              hintMin: "min",
              hintMax: "max",
              onMinChanged: (v) => widget.filters.minPrice = double.tryParse(v),
              onMaxChanged: (v) => widget.filters.maxPrice = double.tryParse(v),
            ),
          ),

          // 4. Feedback Card
          _expandedCard(
            title: "Feedback",
            icon: Icons.star_border,
            helpText: "Filter by the seller's feedback score\nto find new or experienced sellers.",
            child: _buildRangeInput(
              hintMin: "min",
              hintMax: "max",
              onMinChanged: (v) => widget.filters.minFeedback = int.tryParse(v) ?? 0,
              onMaxChanged: (v) => widget.filters.maxFeedback = int.tryParse(v) ?? 500,
            ),
          ),

          // 5. Condition Card
          _expandedCard(
            title: "Condition",
            icon: Icons.inventory_2_outlined,
            helpText: "Target New, Used, or Any items\nfor your product research.",
            child: _buildDropdown(
              value: widget.filters.condition,
              items: [
                {'val': 'New', 'label': '✨ New'},
                {'val': 'Used', 'label': '📦 Used'},
                {'val': 'Any', 'label': '🔄 Any'},
              ],
              onChanged: (val) => setState(() => widget.filters.condition = val!),
            ),
          ),

          // 6. Listing Type Card
          _expandedCard(
            title: "Listing Type",
            icon: Icons.sell_outlined,
            helpText: "Choose between Fixed Price\n(Buy It Now) or Auction listings.",
            child: _buildDropdown(
              value: widget.filters.listingType,
              items: [
                {'val': 'Fixed', 'label': '💰 Buy It Now'},
                {'val': 'Auction', 'label': '🔨 Auction'},
              ],
              onChanged: (val) => setState(() => widget.filters.listingType = val!),
            ),
          ),

          // 7. ✨ NEW: Sales Date Range Card
          _expandedCard(
            title: "Sales Range",
            icon: Icons.calendar_month_outlined,
            helpText: "Filter the sales volume by a\nspecific timeframe (e.g., Last 7 Days).",
            child: _buildDropdown(
              value: widget.filters.salesRange,
              items: [
                {'val': 'Total', 'label': '📅 Total'},
                {'val': '7 Days', 'label': '🔥 7 Days'},
                {'val': '15 Days', 'label': '📈 15 Days'},
                {'val': '30 Days', 'label': '📆 30 Days'},
              ],
              onChanged: (val) => setState(() => widget.filters.salesRange = val!),
            ),
          ),

          // 8. Min Sales Card
          _expandedCard(
            title: "Min Sales",
            icon: Icons.trending_up,
            helpText: "The 'Winner Filter'. Only show items\nthat have sold at least this many times.",
            child: _inputBox(
              "e.g. 5", 
              (v) => widget.filters.minSales = int.tryParse(v) ?? 0
            ),
          ),
        ],
      ),
    );
  }

  Widget _expandedCard({required String title, required IconData icon, required String helpText, required Widget child}) {
    return Expanded(
      flex: 1, 
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 6.0), 
        child: _buildFilterCard(title: title, icon: icon, helpText: helpText, child: child),
      ),
    );
  }

  Widget _buildFilterCard({required String title, required IconData icon, required String helpText, required Widget child}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(color: const Color(0x05000000), blurRadius: 10, offset: const Offset(0, 4))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min, 
        children: [
          Row(
            children: [
              Icon(icon, size: 14, color: const Color(0xFF0F172A)),
              Expanded( 
                child: Center(
                  child: Text(
                    title, 
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)), 
                    overflow: TextOverflow.ellipsis
                  ),
                ),
              ),
              Tooltip(
                message: helpText,
                preferBelow: false, 
                verticalOffset: 14, 
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                textAlign: TextAlign.center, 
                decoration: const ShapeDecoration(
                  color: Color(0xFFE4F9C3), 
                  shape: TooltipArrowShape(),
                ),
                textStyle: const TextStyle(
                  color: Color(0xFF0F172A), 
                  fontSize: 12, 
                  fontWeight: FontWeight.w600,
                  height: 1.4, 
                ),
                child: const Icon(Icons.help_outline, size: 14, color: Color(0xFF94A3B8)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          child, 
        ],
      ),
    );
  }

// --- 🎨 THE "ELITE" PILL DROPDOWN (Click-Flash Fixed) ---

  Widget _buildDropdown({required String value, required List<Map<String, String>> items, required ValueChanged<String?> onChanged}) {
    return SizedBox(
      height: 32,
      child: Theme(
        data: Theme.of(context).copyWith(
          hoverColor: Colors.transparent,
          splashColor: Colors.transparent,
          highlightColor: Colors.transparent,
          focusColor: Colors.transparent, 
        ),
        child: DropdownButtonFormField<String>(
          isExpanded: true,
          value: value,
          icon: const Icon(Icons.keyboard_arrow_down, size: 16, color: Color(0xFF0F172A)),
          dropdownColor: Colors.white, 
          borderRadius: BorderRadius.circular(20), 
          focusColor: Colors.transparent, 
          decoration: InputDecoration(
            contentPadding: const EdgeInsets.symmetric(horizontal: 4, vertical: 0),
            enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.black.withAlpha(150), width: 1.2)),
            focusedBorder: const UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF8FFF00), width: 2.0)),
          ),
          
          selectedItemBuilder: (BuildContext context) {
            return items.map<Widget>((item) {
              return Text(
                item['label']!, 
                overflow: TextOverflow.ellipsis, 
                style: const TextStyle(fontSize: 13, color: Color(0xFF1E293B), fontWeight: FontWeight.w700)
              );
            }).toList();
          },

          items: items.map((item) {
            bool isSelected = value == item['val'];
            bool isHovered = false; 
            
            return DropdownMenuItem(
              value: item['val'],
              child: StatefulBuilder(
                builder: (context, setState) {
                  return MouseRegion(
                    onEnter: (_) => setState(() => isHovered = true),
                    onExit: (_) => setState(() => isHovered = false),
                    child: Container(
                      width: double.infinity,
                      alignment: Alignment.centerLeft,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10), 
                      margin: const EdgeInsets.symmetric(vertical: 2), 
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF8FFF00) : Colors.transparent,
                        borderRadius: BorderRadius.circular(25),
                        border: Border.all(
                          color: (isHovered && !isSelected) ? const Color(0xFF8FFF00) : Colors.transparent, 
                          width: 1.5,
                        ),
                      ),
                      child: Text(
                        item['label']!, 
                        style: TextStyle(
                          fontSize: 13, 
                          color: isSelected ? Colors.black : const Color(0xFF0F172A), 
                          fontWeight: isSelected ? FontWeight.w900 : FontWeight.w500, 
                        ),
                        overflow: TextOverflow.ellipsis
                      ),
                    ),
                  );
                }
              ),
            );
          }).toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }

  Widget _buildRangeInput({required String hintMin, required String hintMax, required ValueChanged<String> onMinChanged, required ValueChanged<String> onMaxChanged}) {
    return Row(
      children: [
        Expanded(child: _inputBox(hintMin, onMinChanged)),
        const Padding(padding: EdgeInsets.symmetric(horizontal: 4), child: Text("-", style: TextStyle(color: Colors.grey, fontSize: 12))),
        Expanded(child: _inputBox(hintMax, onMaxChanged)),
      ],
    );
  }

  Widget _inputBox(String hint, ValueChanged<String> onChanged) {
    return SizedBox(
      height: 32,
      child: TextField(
        onChanged: onChanged,
        style: const TextStyle(fontSize: 13, color: Color(0xFF1E293B), fontWeight: FontWeight.w600),
        textAlign: TextAlign.center,
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
          contentPadding: const EdgeInsets.symmetric(horizontal: 0, vertical: 8), 
          enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.black.withAlpha(150), width: 1.2)),
          focusedBorder: const UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF8FFF00), width: 2.0)),
        ),
      ),
    );
  }
}

// Custom Shape for Tooltip Arrow
class TooltipArrowShape extends ShapeBorder {
  final double arrowWidth;
  final double arrowHeight;
  final double borderRadius;
  final Color borderColor;

  const TooltipArrowShape({
    this.arrowWidth = 14.0,
    this.arrowHeight = 7.0,
    this.borderRadius = 8.0,
    this.borderColor = const Color(0xFFC7E898),
  });

  @override
  EdgeInsetsGeometry get dimensions => EdgeInsets.only(bottom: arrowHeight);

  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) => _getPath(rect);

  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) => _getPath(rect);

  Path _getPath(Rect rect) {
    final r = Rect.fromLTRB(rect.left, rect.top, rect.right, rect.bottom - arrowHeight);
    final radius = Radius.circular(borderRadius);

    return Path()
      ..moveTo(r.left + borderRadius, r.top)
      ..lineTo(r.right - borderRadius, r.top)
      ..arcToPoint(Offset(r.right, r.top + borderRadius), radius: radius)
      ..lineTo(r.right, r.bottom - borderRadius)
      ..arcToPoint(Offset(r.right - borderRadius, r.bottom), radius: radius)
      ..lineTo(r.bottomCenter.dx + arrowWidth / 2, r.bottom)
      ..lineTo(r.bottomCenter.dx, r.bottom + arrowHeight)
      ..lineTo(r.bottomCenter.dx - arrowWidth / 2, r.bottom)
      ..lineTo(r.left + borderRadius, r.bottom)
      ..arcToPoint(Offset(r.left, r.bottom - borderRadius), radius: radius)
      ..lineTo(r.left, r.top + borderRadius)
      ..arcToPoint(Offset(r.left + borderRadius, r.top), radius: radius)
      ..close();
  }

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {
    final paint = Paint()
      ..color = borderColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;
    canvas.drawPath(_getPath(rect), paint);
  }

  @override
  ShapeBorder scale(double t) => this;
}