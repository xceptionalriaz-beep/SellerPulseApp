import 'package:flutter/material.dart';
import 'dart:math';
import 'dart:ui' as ui;

class ProfitReceiptCard extends StatelessWidget {
  final String currency;
  final double totalRevenue;
  final double totalCosts;
  final double calculatedEbayFee;
  final double adFeeAmount;
  final double taxRate;
  final double taxAmount;
  final double totalFeeNoStore;
  final double totalFeeStore;
  final double netProfit;
  final double profitMargin;
  final double roi;
  final double breakEvenPrice;
  final double salePrice;

  const ProfitReceiptCard({
    super.key, required this.currency, required this.totalRevenue, required this.totalCosts,
    required this.calculatedEbayFee, required this.adFeeAmount, required this.taxRate,
    required this.taxAmount, required this.totalFeeNoStore, required this.totalFeeStore,
    required this.netProfit, required this.profitMargin, required this.roi,
    required this.breakEvenPrice, required this.salePrice,
  });

  Color _getBadgeBorderColor() => profitMargin > 30 ? const Color(0xFF8FFF00) : (profitMargin >= 15 ? Colors.orangeAccent : Colors.redAccent);
  Color _getBadgeBgColor() => profitMargin > 30 ? const Color(0xFF8FFF00) : (profitMargin >= 15 ? Colors.orangeAccent.withAlpha(30) : Colors.redAccent.withAlpha(30));
  Color _getBadgeTextColor() => profitMargin > 30 ? Colors.black : (profitMargin >= 15 ? Colors.orangeAccent : Colors.redAccent);
  String _getBadgeText() => profitMargin > 30 ? "🔥 HIGH POTENTIAL" : (profitMargin >= 15 ? "⚖️ BALANCED" : "⚠️ RISKY MARGIN");

  @override
  Widget build(BuildContext context) {
    double shopifyFeePercent = 2.9, shopifyFixedFee = 0.30;
    double shopifyCalculatedFee = totalRevenue > 0 ? (totalRevenue * (shopifyFeePercent / 100)) + shopifyFixedFee : 0.0;
    double shopifyTotalFees = shopifyCalculatedFee;
    double shopifyNetProfit = totalRevenue - totalCosts - shopifyTotalFees;
    double shopifyMargin = totalRevenue > 0 ? (shopifyNetProfit / totalRevenue) * 100 : 0.0;

    double profitBeforeAds = netProfit + adFeeAmount;
    double maxSafeAdRate = totalRevenue > 0 ? (profitBeforeAds / totalRevenue) * 100 : 0.0;
    double currentAdRatePercent = totalRevenue > 0 ? (adFeeAmount / totalRevenue) * 100 : 0.0;
    double adDangerProgress = maxSafeAdRate > 0 ? min(currentAdRatePercent / maxSafeAdRate, 1.0) : 0.0;

    return ValueListenableBuilder<bool>(
      valueListenable: ValueNotifier<bool>(false),
      builder: (context, showShopifyCompare, child) {
        return StatefulBuilder(
          builder: (context, setState) {
            double activeEbayFee = showShopifyCompare ? shopifyCalculatedFee : calculatedEbayFee;
            double activeTotalFees = showShopifyCompare ? shopifyTotalFees : (calculatedEbayFee + adFeeAmount);
            double activeNetProfit = showShopifyCompare ? shopifyNetProfit : netProfit;
            PieData targetChartData = PieData(totalRevenue, activeNetProfit, totalCosts, activeTotalFees);

            return Container(
              padding: const EdgeInsets.all(20), 
              decoration: BoxDecoration(
                color: Colors.white, borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.grey.shade200),
                boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 20, offset: Offset(0, 10))],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // --- HEADER ---
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text("TRANSACTION BREAKDOWN", style: TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.bold, letterSpacing: 1.0, fontSize: 11)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: _getBadgeBgColor(), borderRadius: BorderRadius.circular(20), border: Border.all(color: _getBadgeBorderColor(), width: 1.5)),
                        child: Text(_getBadgeText(), style: TextStyle(color: _getBadgeTextColor(), fontWeight: FontWeight.w900, fontSize: 9)),
                      )
                    ],
                  ),
                  const SizedBox(height: 12),

                  // --- SHOPIFY TOGGLE ---
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(10)),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text("Compare with Shopify/Stripe", style: TextStyle(color: Color(0xFF1E293B), fontWeight: FontWeight.w600, fontSize: 11)),
                        Transform.scale(
                          scale: 0.8,
                          child: Switch(value: showShopifyCompare, activeThumbColor: const Color(0xFF8FFF00), onChanged: (val) => setState(() => showShopifyCompare = val)),
                        )
                      ],
                    ),
                  ),
                  const SizedBox(height: 15),

                  // --- ✨ NEW: COMPACT SIDE-BY-SIDE CHART & RECEIPT ---
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Donut Chart (Left)
                      SizedBox(
                        height: 100, width: 100, 
                        child: TweenAnimationBuilder<PieData>(
                          tween: PieDataTween(end: targetChartData),
                          duration: const Duration(milliseconds: 1000), curve: Curves.easeOutCubic,
                          builder: (context, data, child) {
                            return CustomPaint(painter: DonutChartPainter(revenue: data.revenue, profit: data.profit, costs: data.costs, fees: data.fees), child: child);
                          },
                          child: Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Text("Total Rev", style: TextStyle(color: Color(0xFF64748B), fontSize: 9)),
                                Text("$currency${totalRevenue.toStringAsFixed(2)}", style: const TextStyle(color: Color(0xFF1E293B), fontSize: 13, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 20),
                      // Receipt List (Right)
                      Expanded(
                        child: Column(
                          children: [
                            _buildReceiptRow("Rev (Price+Ship)", totalRevenue, isPositive: true),
                            const Divider(color: Color(0xFFE2E8F0), height: 8),
                            _buildReceiptRow("Item & Shipping", totalCosts, color: Colors.redAccent),
                            _buildReceiptRow(showShopifyCompare ? "Shopify Fee" : "eBay Fee", activeEbayFee, color: Colors.orange.shade700),
                            if (!showShopifyCompare) _buildReceiptRow("Promoted Ad", adFeeAmount, color: Colors.orange.shade700),
                            _buildReceiptRow("Sales Tax ($taxRate%)", taxAmount, color: const Color(0xFF94A3B8)),
                          ],
                        ),
                      )
                    ],
                  ),
                  const SizedBox(height: 15),

                  // --- BEST OFFER STRATEGY CURVE ---
                  const Text("BEST OFFER STRATEGY CURVE", style: TextStyle(color: Color(0xFF64748B), fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                  const SizedBox(height: 5),
                  Container(
                    height: 50, width: double.infinity, padding: const EdgeInsets.only(top: 5, right: 5),
                    child: CustomPaint(painter: BestOfferLineChartPainter(breakEvenPrice: breakEvenPrice, currentPrice: salePrice, currentProfit: activeNetProfit)),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("Break Even ($currency${breakEvenPrice.toStringAsFixed(2)})", style: const TextStyle(color: Colors.redAccent, fontSize: 8, fontWeight: FontWeight.bold)),
                      Text("Current Price ($currency${salePrice.toStringAsFixed(2)})", style: const TextStyle(color: Color(0xFF16A34A), fontSize: 8, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // --- VOLUME & AD DANGER (Side by Side to save space) ---
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        flex: 5,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text("VOLUME PROJECTION", style: TextStyle(color: Color(0xFF64748B), fontSize: 9, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                _buildVolumeCard("10x", activeNetProfit * 10),
                                const SizedBox(width: 4),
                                _buildVolumeCard("50x", activeNetProfit * 50),
                              ],
                            )
                          ],
                        ),
                      ),
                      if (!showShopifyCompare) const SizedBox(width: 15),
                      if (!showShopifyCompare) Expanded(
                        flex: 4,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text("MAX AD RATE: ${maxSafeAdRate.toStringAsFixed(1)}%", style: const TextStyle(color: Colors.redAccent, fontSize: 9, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            Container(
                              height: 10, width: double.infinity,
                              decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), gradient: const LinearGradient(colors: [Color(0xFF8FFF00), Colors.yellow, Colors.redAccent], stops: [0.0, 0.6, 1.0])),
                              child: Stack(
                                children: [
                                  AnimatedPositioned(
                                    duration: const Duration(milliseconds: 500), curve: Curves.easeOutCubic,
                                    left: adDangerProgress > 0 ? (adDangerProgress * 100) - 2 : 0, 
                                    top: 0, bottom: 0, child: Container(width: 4, decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(2))),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  
                  const Spacer(),
                  
                  // --- BOTTOM DASHBOARD ---
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
                    child: Column(
                      children: [
                        const Text("NET PROFIT", style: TextStyle(color: Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)),
                        Text(
                          activeNetProfit >= 0 ? "+$currency${activeNetProfit.toStringAsFixed(2)}" : "-$currency${(activeNetProfit * -1).toStringAsFixed(2)}", 
                          style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: activeNetProfit >= 0 ? const Color(0xFF16A34A) : Colors.redAccent) 
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildStatBlock("MARGIN", "${(showShopifyCompare ? shopifyMargin : profitMargin).toStringAsFixed(1)}%"),
                            Container(width: 1, height: 20, color: Colors.grey.shade300),
                            _buildStatBlock("ROI", "${(showShopifyCompare ? shopifyNetProfit : roi).toStringAsFixed(1)}%"),
                            Container(width: 1, height: 20, color: Colors.grey.shade300),
                            _buildStatBlock("BREAK EVEN", "$currency${breakEvenPrice.toStringAsFixed(2)}"),
                          ],
                        )
                      ],
                    ),
                  )
                ],
              ),
            );
          }
        );
      }
    );
  }

  Widget _buildVolumeCard(String label, double projectedProfit) {
    bool isPositive = projectedProfit >= 0;
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 6),
        decoration: BoxDecoration(color: isPositive ? const Color(0xFF8FFF00).withAlpha(20) : Colors.redAccent.withAlpha(20), borderRadius: BorderRadius.circular(6), border: Border.all(color: isPositive ? const Color(0xFF8FFF00) : Colors.redAccent)),
        child: Column(
          children: [
            Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 9, fontWeight: FontWeight.bold)),
            Text(isPositive ? "+$currency${projectedProfit.toStringAsFixed(0)}" : "-$currency${(projectedProfit * -1).toStringAsFixed(0)}", style: TextStyle(color: isPositive ? const Color(0xFF16A34A) : Colors.redAccent, fontSize: 12, fontWeight: FontWeight.w900)),
          ],
        ),
      ),
    );
  }

  Widget _buildStatBlock(String label, String value) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(color: Color(0xFF1E293B), fontSize: 13, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildReceiptRow(String label, double amount, {bool isPositive = false, Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 11)),
          Text(amount == 0 ? "$currency 0.00" : "${isPositive ? '+' : '-'}$currency${amount.abs().toStringAsFixed(2)}", style: TextStyle(color: color ?? (isPositive ? const Color(0xFF16A34A) : const Color(0xFF1E293B)), fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

// --- SMART ANIMATION & PAINTERS ---
class PieData { final double revenue, profit, costs, fees; PieData(this.revenue, this.profit, this.costs, this.fees); }
class PieDataTween extends Tween<PieData> {
  PieDataTween({super.begin, super.end});
  double _lerp(double? a, double? b, double t) => (a ?? 0.0) + ((b ?? 0.0) - (a ?? 0.0)) * t;
  @override PieData lerp(double t) => PieData(_lerp(begin?.revenue, end?.revenue, t), _lerp(begin?.profit, end?.profit, t), _lerp(begin?.costs, end?.costs, t), _lerp(begin?.fees, end?.fees, t));
}

class DonutChartPainter extends CustomPainter {
  final double revenue, profit, costs, fees;
  DonutChartPainter({required this.revenue, required this.profit, required this.costs, required this.fees});
  @override void paint(Canvas canvas, Size size) {
    if (revenue <= 0) return; 
    double profitAngle = (max(profit, 0) / revenue) * 2 * pi, costsAngle = (costs / revenue) * 2 * pi, feesAngle = (fees / revenue) * 2 * pi;
    Paint paint = Paint()..style = PaintingStyle.stroke..strokeWidth = 10..strokeCap = StrokeCap.round;
    Rect rect = Rect.fromCircle(center: Offset(size.width / 2, size.height / 2), radius: size.width / 2);
    double startAngle = -pi / 2; 
    if (profit > 0) { paint.color = const Color(0xFF8FFF00); canvas.drawArc(rect, startAngle, profitAngle, false, paint); startAngle += profitAngle; }
    paint.color = Colors.redAccent; canvas.drawArc(rect, startAngle, costsAngle, false, paint); startAngle += costsAngle;
    paint.color = Colors.orangeAccent; canvas.drawArc(rect, startAngle, feesAngle, false, paint);
  }
  @override bool shouldRepaint(covariant CustomPainter oldDelegate) => true; 
}

class BestOfferLineChartPainter extends CustomPainter {
  final double breakEvenPrice, currentPrice, currentProfit;
  BestOfferLineChartPainter({required this.breakEvenPrice, required this.currentPrice, required this.currentProfit});
  @override void paint(Canvas canvas, Size size) {
    if (currentPrice <= 0 || breakEvenPrice <= 0 || currentPrice <= breakEvenPrice) return;
    Paint dashPaint = Paint()..color = Colors.redAccent.withAlpha(100)..strokeWidth = 1.0..style = PaintingStyle.stroke;
    double dashWidth = 4, dashSpace = 4, startX = 0;
    while (startX < size.width) { canvas.drawLine(Offset(startX, size.height), Offset(startX + dashWidth, size.height), dashPaint); startX += dashWidth + dashSpace; }
    Paint linePaint = Paint()..color = const Color(0xFF8FFF00)..strokeWidth = 2.5..strokeCap = StrokeCap.round..style = PaintingStyle.stroke;
    Path path = Path()..moveTo(0, size.height)..quadraticBezierTo(size.width * 0.4, size.height * 0.8, size.width, 5);
    canvas.drawPath(path, linePaint);
    Paint gradientPaint = Paint()..shader = ui.Gradient.linear(const Offset(0, 5), Offset(0, size.height), [const Color(0xFF8FFF00).withAlpha(80), const Color(0xFF8FFF00).withAlpha(0)])..style = PaintingStyle.fill;
    Path fillPath = Path.from(path)..lineTo(size.width, size.height)..lineTo(0, size.height)..close();
    canvas.drawPath(fillPath, gradientPaint);
    canvas.drawCircle(Offset(size.width, 5), 4, Paint()..color = const Color(0xFF1E293B)..style = PaintingStyle.fill);
    canvas.drawCircle(Offset(size.width, 5), 4, Paint()..color = const Color(0xFF8FFF00)..strokeWidth = 2..style = PaintingStyle.stroke);
  }
  @override bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}