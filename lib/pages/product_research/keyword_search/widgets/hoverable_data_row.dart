import 'package:flutter/material.dart';

class HoverableDataRow extends StatefulWidget {
  final String imageUrl, title, flag, score, sales, returns, risk, margin, actionLabel;
  final String? veroWord;
  final Color actionColor;
  final bool isSelected;

  const HoverableDataRow({
    super.key, required this.imageUrl, required this.title, this.veroWord, required this.flag, 
    required this.score, required this.sales, required this.returns, required this.risk, 
    required this.margin, required this.actionColor, required this.actionLabel, required this.isSelected
  });

  @override
  State<HoverableDataRow> createState() => _HoverableDataRowState();
}

class _HoverableDataRowState extends State<HoverableDataRow> {
  bool _isHovering = false;
  late bool _isChecked;

  @override
  void initState() {
    super.initState();
    _isChecked = widget.isSelected;
  }

  @override
  void didUpdateWidget(covariant HoverableDataRow oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isSelected != oldWidget.isSelected) {
      _isChecked = widget.isSelected;
    }
  }

  Widget _buildTitleWithVeroHighlight(String title, String? veroWord) {
    if (veroWord == null || veroWord.isEmpty || !title.toLowerCase().contains(veroWord.toLowerCase())) {
      return Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B), fontSize: 13));
    }
    int startIndex = title.toLowerCase().indexOf(veroWord.toLowerCase());
    String part1 = title.substring(0, startIndex);
    String highlight = title.substring(startIndex, startIndex + veroWord.length);
    String part2 = title.substring(startIndex + veroWord.length);

    return RichText(
      text: TextSpan(
        style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B), fontSize: 13, fontFamily: 'Roboto'),
        children: [
          TextSpan(text: part1),
          WidgetSpan(
            alignment: PlaceholderAlignment.middle,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
              decoration: BoxDecoration(color: Colors.red.shade100, borderRadius: BorderRadius.circular(4), border: Border.all(color: Colors.red.shade300)),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.warning_amber_rounded, size: 12, color: Colors.red),
                  const SizedBox(width: 2),
                  Text(highlight, style: TextStyle(color: Colors.red.shade900, fontWeight: FontWeight.w900, fontSize: 12)),
                ],
              ),
            ),
          ),
          TextSpan(text: part2),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovering = true),
      onExit: (_) => setState(() => _isHovering = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        decoration: BoxDecoration(
          color: _isHovering ? const Color(0xFF8FFF00).withAlpha(15) : Colors.transparent,
          border: const Border(bottom: BorderSide(color: Color(0xFFF1F5F9)))
        ),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 15),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Checkbox(
              value: _isChecked, 
              onChanged: (val) => setState(() => _isChecked = val!), 
              activeColor: const Color(0xFF8FFF00), checkColor: Colors.black
            ),
            
            Expanded(
              flex: 4,
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      widget.imageUrl, width: 44, height: 44, fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(width: 44, height: 44, color: Colors.grey.shade200, child: const Icon(Icons.image_not_supported, size: 16, color: Colors.grey)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(widget.flag, style: const TextStyle(fontSize: 18)),
                  const SizedBox(width: 8),
                  Expanded(child: _buildTitleWithVeroHighlight(widget.title, widget.veroWord)), 
                ],
              ),
            ),
            
            Expanded(flex: 1, child: Text(widget.score, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13))),
            Expanded(flex: 1, child: Text(widget.sales, style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF1E293B), fontSize: 13))),
            Expanded(flex: 1, child: Text(widget.returns, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
            Expanded(flex: 1, child: Text(widget.risk, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
            Expanded(flex: 1, child: Text(widget.margin, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13))),
            
            Expanded(
              flex: 1, 
              child: Align(
                alignment: Alignment.centerRight,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(color: widget.actionColor.withAlpha(20), borderRadius: BorderRadius.circular(8), border: Border.all(color: widget.actionColor.withAlpha(100))),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.search, size: 14, color: widget.actionColor),
                      const SizedBox(width: 4),
                      Text(widget.actionLabel, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: widget.actionColor)),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}