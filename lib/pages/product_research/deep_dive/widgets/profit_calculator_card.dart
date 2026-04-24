import 'package:flutter/material.dart';
import '../../shared/neon_icon.dart';

class ProfitCalculatorCard extends StatefulWidget {
  final double salePrice;
  const ProfitCalculatorCard({super.key, required this.salePrice});

  @override
  State<ProfitCalculatorCard> createState() => _ProfitCalculatorCardState();
}

class _ProfitCalculatorCardState extends State<ProfitCalculatorCard> {
  late double _sourcingCost;

  @override
  void initState() {
    super.initState();
    // Default the sourcing cost to roughly 40% of the sale price
    _sourcingCost = widget.salePrice * 0.4;
  }

  @override
  Widget build(BuildContext context) {
    double ebayFees = widget.salePrice * 0.1325;
    double netProfit = widget.salePrice - _sourcingCost - ebayFees;
    int margin = widget.salePrice > 0 ? ((netProfit / widget.salePrice) * 100).round() : 0;

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
              NeonIcon(icon: Icons.calculate_outlined), SizedBox(width: 10),
              Text("Profit Calculator", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
            ],
          ),
          const SizedBox(height: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text("Est. Sourcing Cost:", style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                    Text("\$${_sourcingCost.toStringAsFixed(2)}", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
                Slider(
                  value: _sourcingCost, min: 1.0, max: widget.salePrice > 1 ? widget.salePrice : 100.0,
                  activeColor: const Color(0xFF8FFF00), inactiveColor: Colors.grey.shade200, thumbColor: const Color(0xFF131B2F),
                  onChanged: (val) => setState(() => _sourcingCost = val),
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text("Est. eBay Fees:", style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                    Text("-\$${ebayFees.toStringAsFixed(2)} (13.25%)", style: const TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
                  ],
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.all(15),
                  decoration: BoxDecoration(color: const Color(0xFF131B2F), borderRadius: BorderRadius.circular(12)),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text("NET PROFIT:", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      Text("\$${netProfit.toStringAsFixed(2)} ($margin%)", style: const TextStyle(color: Color(0xFF8FFF00), fontSize: 18, fontWeight: FontWeight.bold)),
                    ],
                  ),
                )
              ],
            ),
          ),
        ],
      ),
    );
  }
}