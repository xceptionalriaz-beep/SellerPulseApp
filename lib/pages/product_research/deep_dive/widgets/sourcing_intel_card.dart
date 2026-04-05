import 'package:flutter/material.dart';
import '../../shared/neon_icon.dart';

class SourcingIntelCard extends StatelessWidget {
  final String stockLeft;
  final String veroRisk;
  final String keywords;

  const SourcingIntelCard({super.key, required this.stockLeft, required this.veroRisk, required this.keywords});

  Widget _buildInfoRow(IconData icon, String label, String value, {Color? valueColor}) {
    return Row(
      children: [
        Icon(icon, size: 16, color: const Color(0xFF64748B)), const SizedBox(width: 8),
        Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)), const SizedBox(width: 5),
        Expanded(child: Text(value, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: valueColor ?? const Color(0xFF1E293B)), overflow: TextOverflow.ellipsis)),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200, width: 1),
        boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 5))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              NeonIcon(icon: Icons.travel_explore), SizedBox(width: 10),
              Text("Sourcing & Intel", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            ],
          ),
          const SizedBox(height: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Matches (Click to open):", style: TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _AnimatedSourceButton(domain: "amazon.com", price: "\$24.00", color: Colors.orange),
                    _AnimatedSourceButton(domain: "walmart.com", price: "\$25.50", color: Colors.blue),
                    _AnimatedSourceButton(domain: "aliexpress.com", price: "\$22.00", color: Colors.redAccent),
                  ],
                ),
                const Spacer(),
                const Divider(),
                const Spacer(),
                _buildInfoRow(Icons.inventory_2_outlined, "Stock Spy:", stockLeft, valueColor: Colors.redAccent),
                const SizedBox(height: 12),
                _buildInfoRow(Icons.warning_amber_rounded, "VERO Risk:", veroRisk, valueColor: veroRisk.contains("HIGH") ? Colors.redAccent : Colors.green),
                const SizedBox(height: 12),
                _buildInfoRow(Icons.key, "Top Keywords:", keywords),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _AnimatedSourceButton extends StatefulWidget {
  final String domain;
  final String price;
  final Color color;
  const _AnimatedSourceButton({required this.domain, required this.price, required this.color});
  @override
  State<_AnimatedSourceButton> createState() => _AnimatedSourceButtonState();
}

class _AnimatedSourceButtonState extends State<_AnimatedSourceButton> {
  bool _isHovering = false;
  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovering = true),
      onExit: (_) => setState(() => _isHovering = false),
      child: GestureDetector(
        onTap: () {}, 
        child: AnimatedScale(
          scale: _isHovering ? 1.08 : 1.0,
          duration: const Duration(milliseconds: 150),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: widget.color.withAlpha(20), borderRadius: BorderRadius.circular(10), 
              border: Border.all(color: widget.color.withAlpha(100), width: _isHovering ? 2 : 1),
            ),
            child: Row(
              children: [
                Image.network(
                  'https://www.google.com/s2/favicons?domain=${widget.domain}&sz=64',
                  width: 16, height: 16,
                  errorBuilder: (context, error, stackTrace) => Icon(Icons.shopping_bag, size: 16, color: widget.color),
                ),
                const SizedBox(width: 6),
                Text(widget.price, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: widget.color)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}