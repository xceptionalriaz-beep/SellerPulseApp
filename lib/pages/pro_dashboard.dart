import 'package:flutter/material.dart';
import 'dart:math';
import '../widgets/math_engine.dart'; 

class ProDashboard extends StatelessWidget {
  final String currency;
  final double currentPrice;
  final CalculatorResult result;

  const ProDashboard({
    super.key, 
    required this.currency, 
    required this.currentPrice, 
    required this.result
  });

  @override
  Widget build(BuildContext context) {
    double safeAdRate = result.totalRevenue > 0 ? ((result.netProfit + result.adFee) / result.totalRevenue) * 100 : 0.0;
    double currentAdRatePercent = result.totalRevenue > 0 ? (result.adFee / result.totalRevenue) * 100 : 0.0;
    double adDangerProgress = safeAdRate > 0 ? (currentAdRatePercent / safeAdRate).clamp(0.0, 1.0) : 0.0;

    // ✨ WIDGET EXTRACTION: We build these first so we can easily rearrange them!
    Widget kpi1 = Expanded(child: _buildKPICard("NET PROFIT", result.netProfit >= 0 ? "+$currency${result.netProfit.toStringAsFixed(2)}" : "-$currency${(result.netProfit * -1).toStringAsFixed(2)}", result.netProfit >= 0 ? const Color(0xFF16A34A) : Colors.redAccent));
    Widget kpi2 = Expanded(child: _buildKPICard("MARGIN", "${result.profitMargin.toStringAsFixed(1)}%", const Color(0xFF0F172A)));
    Widget kpi3 = Expanded(child: _buildKPICard("ROI", result.totalCosts > 0 ? "${result.roi.toStringAsFixed(1)}%" : (result.netProfit > 0 ? "∞" : "0.0%"), const Color(0xFF0F172A)));
    Widget kpi4 = Expanded(child: _buildKPICard("BREAK EVEN", "$currency${result.breakEvenPrice.toStringAsFixed(2)}", Colors.orange.shade700));

    Widget donutChart = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("REVENUE SPLIT", style: TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.0)),
        const SizedBox(height: 20),
        Center(
          child: SizedBox(
            height: 160, width: 160, 
            child: AnimatedDonutChart(
              currency: currency, revenue: result.totalRevenue, profit: result.netProfit, 
              costs: result.totalCosts, ebayFees: result.ebayFee + result.paymentFee, adFee: result.adFee, 
            ),
          ),
        ),
        const SizedBox(height: 20),
      ],
    );

    Widget ledger = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("TRANSACTION LEDGER", style: TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.0)),
        const SizedBox(height: 12), 
        _buildLedgerRow("Revenue (Price + Ship)", result.totalRevenue, isPositive: true),
        const Padding(padding: EdgeInsets.symmetric(vertical: 6), child: Divider(color: Color(0xFFE2E8F0))), 
        _buildLedgerRow("Item & Shipping Costs", result.totalCosts, color: Colors.redAccent),
        _buildLedgerRow("eBay Final Value Fee", result.ebayFee, color: Colors.orange.shade700),
        if (result.paymentFee > 0) _buildLedgerRow("PayPal Fee", result.paymentFee, color: Colors.orange.shade700),
        _buildLedgerRow("Promoted Ad Fee", result.adFee, color: Colors.indigoAccent),
        const SizedBox(height: 20), 
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text("AD DANGER ZONE", style: TextStyle(color: Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.bold)),
            Text("Max Safe: ${safeAdRate.toStringAsFixed(1)}%", style: const TextStyle(color: Colors.redAccent, fontSize: 10, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 6), 
        Container(
          height: 10, width: double.infinity, decoration: BoxDecoration(borderRadius: BorderRadius.circular(5), gradient: const LinearGradient(colors: [Color(0xFF8FFF00), Colors.yellow, Colors.redAccent], stops: [0.0, 0.6, 1.0])),
          child: AnimatedAlign(
            duration: const Duration(milliseconds: 600), curve: Curves.easeOutCubic, alignment: Alignment(-1.0 + (adDangerProgress * 2), 0.0),
            child: Container(width: 4, decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(2))),
          ),
        ),
      ],
    );

    // ✨ MAGIC RESPONSIVE BUILDER FOR THE DASHBOARD INTERIOR
    return LayoutBuilder(
      builder: (context, constraints) {
        bool isNarrow = constraints.maxWidth < 700; // Breakpoint for stacking the cards

        return Column(
          children: [
            // ROW 1: KPIs
            if (isNarrow)
              Column(
                children: [
                  Row(children: [kpi1, const SizedBox(width: 16), kpi2]),
                  const SizedBox(height: 16),
                  Row(children: [kpi3, const SizedBox(width: 16), kpi4]),
                ],
              )
            else
              Row(
                children: [kpi1, const SizedBox(width: 16), kpi2, const SizedBox(width: 16), kpi3, const SizedBox(width: 16), kpi4],
              ),
            
            const SizedBox(height: 16),

            // ROW 2: UNIFIED REVENUE SPLIT & LEDGER CARD
            Container(
              padding: const EdgeInsets.all(20), 
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0)), boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))]),
              child: isNarrow
                // Stack vertically on small screens
                ? Column(
                    children: [
                      donutChart,
                      const Padding(padding: EdgeInsets.symmetric(vertical: 16.0), child: Divider(color: Color(0xFFE2E8F0))),
                      ledger,
                    ],
                  )
                // Side-by-side on large screens
                : IntrinsicHeight(
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(flex: 4, child: donutChart),
                        const SizedBox(width: 20),
                        const VerticalDivider(color: Color(0xFFE2E8F0), thickness: 1, width: 1),
                        const SizedBox(width: 20),
                        Expanded(flex: 5, child: ledger),
                      ],
                    ),
                  ),
            ),
            const SizedBox(height: 16),

            // ROW 3: THE INTERACTIVE FORECASTER
            SizedBox(
              height: 220, 
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0)), boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))]),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text("WHAT-IF FORECASTER (DRAG TO TEST)", style: TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.0)),
                        Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(6)), child: const Text("INTERACTIVE", style: TextStyle(color: Color(0xFF8FFF00), fontSize: 9, fontWeight: FontWeight.bold))),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Expanded(
                      child: InteractiveForecaster(currency: currency, currentPrice: currentPrice, result: result),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      }
    );
  }

  Widget _buildKPICard(String title, String value, Color valueColor) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0)), boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.0)),
          const SizedBox(height: 8),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(value, style: TextStyle(color: valueColor, fontSize: 24, fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
  }

  Widget _buildLedgerRow(String label, double amount, {bool isPositive = false, Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2), 
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(child: Text(label, style: const TextStyle(color: Color(0xFF0F172A), fontSize: 13), overflow: TextOverflow.ellipsis)),
          const SizedBox(width: 8),
          Text(amount == 0 ? "$currency 0.00" : "${isPositive ? '+' : '-'}$currency${amount.abs().toStringAsFixed(2)}", style: TextStyle(color: color ?? (isPositive ? const Color(0xFF16A34A) : const Color(0xFF0F172A)), fontSize: 14, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class AnimatedDonutChart extends ImplicitlyAnimatedWidget {
  final double revenue, profit, costs, ebayFees, adFee;
  final String currency;

  const AnimatedDonutChart({
    super.key, required this.revenue, required this.profit, required this.costs, required this.ebayFees, required this.adFee, required this.currency,
    super.duration = const Duration(milliseconds: 800), super.curve = Curves.easeOutCubic,
  });

  @override
  AnimatedWidgetBaseState<AnimatedDonutChart> createState() => _AnimatedDonutChartState();
}

class _AnimatedDonutChartState extends AnimatedWidgetBaseState<AnimatedDonutChart> {
  Tween<double>? _revenueTween, _profitTween, _costsTween, _ebayFeesTween, _adFeesTween;

  @override
  void forEachTween(TweenVisitor<dynamic> visitor) {
    _revenueTween = visitor(_revenueTween, widget.revenue, (dynamic value) => Tween<double>(begin: value as double)) as Tween<double>?;
    _profitTween = visitor(_profitTween, widget.profit, (dynamic value) => Tween<double>(begin: value as double)) as Tween<double>?;
    _costsTween = visitor(_costsTween, widget.costs, (dynamic value) => Tween<double>(begin: value as double)) as Tween<double>?;
    _ebayFeesTween = visitor(_ebayFeesTween, widget.ebayFees, (dynamic value) => Tween<double>(begin: value as double)) as Tween<double>?;
    _adFeesTween = visitor(_adFeesTween, widget.adFee, (dynamic value) => Tween<double>(begin: value as double)) as Tween<double>?;
  }

  @override
  Widget build(BuildContext context) {
    double currentRev = _revenueTween?.evaluate(animation) ?? 0.0;
    double currentProfit = _profitTween?.evaluate(animation) ?? 0.0;
    double currentCosts = _costsTween?.evaluate(animation) ?? 0.0;
    double currentEbayFees = _ebayFeesTween?.evaluate(animation) ?? 0.0;
    double currentAdFees = _adFeesTween?.evaluate(animation) ?? 0.0;

    return CustomPaint(
      painter: DonutChartPainter(
        revenue: currentRev, profit: currentProfit, costs: currentCosts, ebayFees: currentEbayFees, adFee: currentAdFees,
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text("Total Rev", style: TextStyle(color: Color(0xFF64748B), fontSize: 11)),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text("${widget.currency}${currentRev.toStringAsFixed(2)}", style: const TextStyle(color: Color(0xFF0F172A), fontSize: 18, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}

class DonutChartPainter extends CustomPainter {
  final double revenue, profit, costs, ebayFees, adFee;
  DonutChartPainter({required this.revenue, required this.profit, required this.costs, required this.ebayFees, required this.adFee});

  @override void paint(Canvas canvas, Size size) {
    if (revenue <= 0) return; 
    double profitAngle = (max(profit, 0) / revenue) * 2 * pi;
    double costsAngle = (costs / revenue) * 2 * pi;
    double ebayFeesAngle = (ebayFees / revenue) * 2 * pi;
    double adFeesAngle = (adFee / revenue) * 2 * pi;

    double strokeW = 14.0;
    Paint paint = Paint()..style = PaintingStyle.stroke..strokeWidth = strokeW..strokeCap = StrokeCap.round; 
    double safeRadius = (min(size.width, size.height) / 2) - (strokeW / 2);
    Rect rect = Rect.fromCircle(center: Offset(size.width / 2, size.height / 2), radius: safeRadius);
    double startAngle = -pi / 2; 

    if (profit > 0) { 
      paint.color = const Color(0xFF8FFF00); 
      canvas.drawArc(rect, startAngle, profitAngle, false, paint); 
      startAngle += profitAngle; 
    }
    paint.color = Colors.redAccent; canvas.drawArc(rect, startAngle, costsAngle, false, paint); startAngle += costsAngle;
    paint.color = Colors.orangeAccent; canvas.drawArc(rect, startAngle, ebayFeesAngle, false, paint); startAngle += ebayFeesAngle;
    paint.color = Colors.indigoAccent; canvas.drawArc(rect, startAngle, adFeesAngle, false, paint);
  }
  @override bool shouldRepaint(covariant CustomPainter oldDelegate) => true; 
}

class InteractiveForecaster extends StatefulWidget {
  final String currency;
  final double currentPrice;
  final CalculatorResult result; 

  const InteractiveForecaster({
    super.key, required this.currency, required this.currentPrice, required this.result
  });

  @override State<InteractiveForecaster> createState() => _InteractiveForecasterState();
}

class _InteractiveForecasterState extends State<InteractiveForecaster> {
  double _dragValue = 0.5;

  Widget _buildSimStat(String label, String value, Color valueColor) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.bold)),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(value, style: TextStyle(color: valueColor, fontSize: 18, fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    double adRateDecimal = widget.result.totalRevenue > 0 ? (widget.result.adFee / widget.result.totalRevenue) : 0.0;

    double minPrice = widget.result.breakEvenPrice;
    double maxPrice = max(widget.currentPrice * 1.5, widget.result.breakEvenPrice + 50);
    double simPrice = minPrice + (_dragValue * (maxPrice - minPrice));
    
    double simEbayFee = (simPrice * widget.result.taxMultiplier * widget.result.activeFeeDecimal) + widget.result.ebayFixedFee;
    double simPayPalFee = (simPrice * widget.result.taxMultiplier * widget.result.paymentFeeDecimal) + widget.result.paymentFixedFee;
    double simAdFee = simPrice * adRateDecimal;
    double simTotalFees = simEbayFee + simPayPalFee + simAdFee;

    double simProfit = simPrice - widget.result.totalCosts - simTotalFees;
    double simMargin = simPrice > 0 ? (simProfit / simPrice) * 100 : 0.0;

    String roiDisplay;
    if (widget.result.totalCosts > 0) {
      double simRoi = (simProfit / widget.result.totalCosts) * 100;
      roiDisplay = "${simRoi.toStringAsFixed(1)}%";
    } else {
      roiDisplay = simProfit > 0 ? "∞" : "0.0%";
    }

    Color healthColor = simProfit < 0 ? Colors.redAccent : (simMargin < 15 ? Colors.amber.shade600 : const Color(0xFF16A34A));
    Color sliderTrackColor = simProfit < 0 ? Colors.redAccent : (simMargin < 15 ? Colors.amber.shade400 : const Color(0xFF8FFF00));

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildSimStat("Sim Price", "${widget.currency}${simPrice.toStringAsFixed(2)}", const Color(0xFF0F172A)),
            const SizedBox(width: 8),
            _buildSimStat("Est. Profit", "${widget.currency}${simProfit.toStringAsFixed(2)}", healthColor),
            const SizedBox(width: 8),
            _buildSimStat("ROI", roiDisplay, healthColor),
            const SizedBox(width: 8),
            _buildSimStat("Margin", "${simMargin.toStringAsFixed(1)}%", healthColor),
          ],
        ),
        
        Padding(
          padding: const EdgeInsets.only(top: 8.0, bottom: 4.0),
          child: Text("At this price, total fees will be: ${widget.currency}${simTotalFees.toStringAsFixed(2)}", 
            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontStyle: FontStyle.italic, fontWeight: FontWeight.w500)
          ),
        ),

        Expanded(
          child: SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: sliderTrackColor, 
              inactiveTrackColor: const Color(0xFFE2E8F0),
              thumbColor: const Color(0xFF0F172A), 
              overlayColor: sliderTrackColor.withAlpha(30),
              trackHeight: 8.0, 
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 10.0),
            ),
            child: Slider(
              value: _dragValue,
              onChanged: (val) => setState(() => _dragValue = val),
            ),
          ),
        ),
        
        const Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text("Break Even Area", style: TextStyle(color: Colors.redAccent, fontSize: 10, fontWeight: FontWeight.bold)),
            Text("High Profit Area", style: TextStyle(color: Color(0xFF16A34A), fontSize: 10, fontWeight: FontWeight.bold)),
          ],
        )
      ],
    );
  }
}