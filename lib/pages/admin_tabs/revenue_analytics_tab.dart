import 'package:flutter/material.dart';
import 'dart:math';

class RevenueAnalyticsTab extends StatelessWidget {
  final bool isDesktop;
  final bool isInvestorMode;
  final bool startChartAnimation;

  const RevenueAnalyticsTab({
    super.key,
    required this.isDesktop,
    required this.isInvestorMode,
    required this.startChartAnimation,
  });

  // ✨ HELPER: OBSCURES TEXT IF INVESTOR MODE IS ON
  String _obscureText(String text, {bool isEmail = false}) {
    if (!isInvestorMode) return text;
    if (isEmail) {
      var parts = text.split('@');
      if (parts.length != 2) return text;
      return '${parts[0][0]}***@${parts[1]}';
    }
    return '${text[0]}***';
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // FEATURE ADOPTION / USAGE METRICS
        if (isDesktop)
          Row(
            children: [
              Expanded(child: _buildMiniUsageStat("Calculations Run", "4,200", Icons.calculate_outlined)),
              const SizedBox(width: 16),
              Expanded(child: _buildMiniUsageStat("eBay Links Fetched", "1,850", Icons.link)),
              const SizedBox(width: 16),
              Expanded(child: _buildMiniUsageStat("VeRO Checks", "340", Icons.shield_outlined)),
            ],
          )
        else
          Column(
            children: [
              _buildMiniUsageStat("Calculations Run", "4,200", Icons.calculate_outlined),
              const SizedBox(height: 12),
              _buildMiniUsageStat("eBay Links Fetched", "1,850", Icons.link),
              const SizedBox(height: 12),
              _buildMiniUsageStat("VeRO Checks", "340", Icons.shield_outlined),
            ],
          ),
          
        const SizedBox(height: 24),

        // ✨ TALLER CHARTS TO BLOCK EMPTY SPACE
        if (isDesktop)
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(flex: 6, child: _buildRevenueAnalyticsChart()),
              const SizedBox(width: 24),
              Expanded(flex: 4, child: _buildPlanDistributionChart()), 
            ],
          )
        else
          Column(
            children: [
              _buildRevenueAnalyticsChart(),
              const SizedBox(height: 24),
              _buildPlanDistributionChart(),
            ],
          ),
        
        const SizedBox(height: 24),
        
        // ✨ ELIMINATED VERTICAL SCROLLING BY COMPACTING INTO COLUMNS!
        if (isDesktop)
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 6,
                child: Column(
                  children: [
                    _buildTransactionLedger(),
                    const SizedBox(height: 24),
                    _buildProfitAndLossTracker(),
                  ],
                ),
              ),
              const SizedBox(width: 24),
              Expanded(
                flex: 4,
                child: Column(
                  children: [
                    _buildGeographicHeatmap(),
                    const SizedBox(height: 24),
                    _buildTaxComplianceTracker(),
                    const SizedBox(height: 24),
                    _buildDisputeDefenseCenter(),
                  ],
                ),
              ), 
            ],
          )
        else
          Column(
            children: [
              _buildTransactionLedger(),
              const SizedBox(height: 24),
              _buildGeographicHeatmap(),
              const SizedBox(height: 24),
              _buildProfitAndLossTracker(),
              const SizedBox(height: 24),
              _buildTaxComplianceTracker(),
              const SizedBox(height: 24),
              _buildDisputeDefenseCenter(),
            ],
          ),
      ],
    );
  }

  Widget _buildMiniUsageStat(String title, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Row(
        children: [
          Icon(icon, size: 20, color: const Color(0xFF64748B)),
          const SizedBox(width: 12),
          // ✨ THE FIX FOR ISSUE 1: Added Expanded here so long text wraps beautifully!
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A))),
                Text(title, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildPlanDistributionChart() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0)), boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Plan Distribution", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
          const SizedBox(height: 4),
          const Text("User breakdown by active tier.", style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
          
          const SizedBox(height: 40),
          
          Center(
            child: SizedBox(
              height: 200, width: 200, 
              child: TweenAnimationBuilder<double>(
                tween: Tween<double>(begin: 0.0, end: startChartAnimation ? 1.0 : 0.0),
                duration: const Duration(milliseconds: 1500), 
                curve: Curves.easeOutCubic, 
                builder: (context, value, child) {
                  return CustomPaint(
                    painter: DonutChartPainter(
                      progress: value,
                      sections: [
                        ChartSection(value: 60, color: const Color(0xFFE2E8F0)), // Free
                        ChartSection(value: 30, color: const Color(0xFF0F172A)), // Pro
                        ChartSection(value: 10, color: const Color(0xFF8FFF00)), // Elite
                      ],
                    ),
                    child: Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text("${(value * 842).toInt()}", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 24, color: Color(0xFF0F172A))),
                          const Text("Total Users", style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
          
          const SizedBox(height: 44), 
          
          // Legend
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildChartLegend("Free", "60%", const Color(0xFFE2E8F0)),
              _buildChartLegend("Pro", "30%", const Color(0xFF0F172A)),
              _buildChartLegend("Elite", "10%", const Color(0xFF8FFF00)),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildChartLegend(String title, String percent, Color color) {
    return Row(
      children: [
        Container(width: 12, height: 12, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3))),
        const SizedBox(width: 6),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
            Text(percent, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
          ],
        )
      ],
    );
  }

  Widget _buildTransactionLedger() {
    final transactions = [
      {"icon": Icons.arrow_upward, "color": const Color(0xFF16A34A), "amount": "+\$99.00", "user": "Michael Scott", "plan": "Elite Upgrade", "time": "2 mins ago", "failed": false},
      {"icon": Icons.sync, "color": const Color(0xFF0F172A), "amount": "+\$49.00", "user": "Sarah Jenkins", "plan": "Pro Renewal", "time": "15 mins ago", "failed": false},
      {"icon": Icons.credit_card_off, "color": Colors.redAccent, "amount": "FAILED", "user": "David Chen", "plan": "Card Expired", "time": "1 hour ago", "failed": true},
      {"icon": Icons.arrow_upward, "color": const Color(0xFF16A34A), "amount": "+\$49.00", "user": "Emma Watson", "plan": "Pro Upgrade", "time": "3 hours ago", "failed": false},
    ];

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0)), boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Live Transaction Ledger", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              TextButton(onPressed: () {}, child: const Text("View All in Stripe", style: TextStyle(color: Color(0xFF64748B), fontSize: 12))),
            ],
          ),
          const SizedBox(height: 16),
          Column(
            children: transactions.map((t) {
              bool isFailed = t['failed'] as bool;
              return Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFF8FAFC)))),
                child: Row(
                  children: [
                    Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: (t['color'] as Color).withAlpha(20), shape: BoxShape.circle), child: Icon(t['icon'] as IconData, color: t['color'] as Color, size: 16)),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(_obscureText(t['user'] as String), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A))),
                          Text(t['plan'] as String, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(t['amount'] as String, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: isFailed ? Colors.redAccent : const Color(0xFF16A34A))),
                        Text(t['time'] as String, style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8))),
                      ],
                    )
                  ],
                ),
              );
            }).toList(),
          )
        ],
      ),
    );
  }

  Widget _buildRevenueAnalyticsChart() {
    List<double> dataPoints = [40, 45, 30, 50, 65, 55, 70, 80, 75, 90, 85, 100]; 
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0)), boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("30-Day MRR Growth", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
          const SizedBox(height: 4),
          const Text("Visual representation of daily revenue increases.", style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
          
          const SizedBox(height: 40), 
          
          SizedBox(
            height: 260,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: List.generate(dataPoints.length, (index) {
                return AnimatedContainer(
                  duration: Duration(milliseconds: 600 + (index * 100)), 
                  curve: Curves.easeOutBack, 
                  width: 24, 
                  height: startChartAnimation ? (dataPoints[index] * 1.8) : 0, 
                  decoration: BoxDecoration(color: index == dataPoints.length - 1 ? const Color(0xFF8FFF00) : const Color(0xFF0F172A), borderRadius: BorderRadius.circular(4)),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfitAndLossTracker() {
    double grossRevenue = 12450.00;
    int transactions = 310; 
    double stripeFee = (grossRevenue * 0.029) + (transactions * 0.30);
    double serverCosts = 45.00;
    double affiliatePayouts = 360.00;
    
    double totalCosts = stripeFee + serverCosts + affiliatePayouts;
    double netProfit = grossRevenue - totalCosts;
    double profitMargin = (netProfit / grossRevenue) * 100;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: const Color(0xFF8FFF00).withAlpha(40), blurRadius: 20)]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Expanded(child: Text("True Profit & Loss (P&L)", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white))),
              const SizedBox(width: 12),
              Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: const Color(0xFF8FFF00), borderRadius: BorderRadius.circular(20)), child: Text("${profitMargin.toStringAsFixed(1)}% Profit Margin", style: const TextStyle(color: Color(0xFF0F172A), fontSize: 12, fontWeight: FontWeight.bold))),
            ],
          ),
          const SizedBox(height: 4),
          const Text("Gross Revenue minus Server, API, and Affiliate expenses.", style: TextStyle(color: Colors.white70, fontSize: 13)),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(child: _buildPLStat("Gross Revenue", "\$${grossRevenue.toStringAsFixed(2)}", Colors.white, Icons.attach_money)),
              Container(width: 1, height: 50, color: Colors.white.withAlpha(50)),
              Expanded(child: _buildPLStat("Total Costs", "-\$${totalCosts.toStringAsFixed(2)}", Colors.redAccent, Icons.money_off)),
              Container(width: 1, height: 50, color: Colors.white.withAlpha(50)),
              Expanded(child: _buildPLStat("Net Profit", "\$${netProfit.toStringAsFixed(2)}", const Color(0xFF8FFF00), Icons.account_balance_wallet)),
            ],
          ),
          const SizedBox(height: 20),
          // ✨ THE FIX FOR ISSUE 2: Replaced the stubborn Row with a smart Wrap widget!
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.white.withAlpha(10), borderRadius: BorderRadius.circular(12)),
            child: Wrap(
              alignment: WrapAlignment.center,
              spacing: 16,
              runSpacing: 8,
              children: [
                const Text("Supabase: \$25/mo", style: TextStyle(color: Colors.white70, fontSize: 12)),
                const Text("Vercel: \$20/mo", style: TextStyle(color: Colors.white70, fontSize: 12)),
                Text("Stripe Fees: \$${stripeFee.toStringAsFixed(2)}/mo", style: const TextStyle(color: Colors.white70, fontSize: 12)),
                Text("Affiliates: \$${affiliatePayouts.toStringAsFixed(2)}/mo", style: const TextStyle(color: Colors.white70, fontSize: 12)),
              ],
            ),
          )
        ],
      )
    );
  }

  Widget _buildPLStat(String title, String value, Color valueColor, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.white54, size: 20),
        const SizedBox(height: 8),
        Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: valueColor)),
        Text(title, style: const TextStyle(fontSize: 12, color: Colors.white70)),
      ],
    );
  }

  Widget _buildDisputeDefenseCenter() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0)), boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Expanded(child: Text("Chargeback & Dispute Defense Center", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)))),
              const SizedBox(width: 12),
              Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(20)), child: const Text("1 Active Dispute", style: TextStyle(color: Colors.redAccent, fontSize: 12, fontWeight: FontWeight.bold))),
            ],
          ),
          const SizedBox(height: 4),
          const Text("Automatically generate PDF evidence from user logs to win Stripe disputes.", style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
          const SizedBox(height: 24),
          
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: Colors.red.withAlpha(20), shape: BoxShape.circle), child: const Icon(Icons.gavel, color: Colors.redAccent, size: 20)),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(_obscureText("David Chen (david.chen22@yahoo.com)", isEmail: true), style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                          const SizedBox(height: 4),
                          const Text("Disputed Amount: \$99.00 • Reason: Fraudulent", style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.picture_as_pdf, size: 14),
                    label: const Text("Submit Evidence (PDF)", style: TextStyle(fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A), foregroundColor: Colors.white, elevation: 0),
                  )
                )
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildTaxComplianceTracker() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0)), boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Expanded(child: Text("Global Tax & VAT Compliance", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)))),
              const SizedBox(width: 12),
              Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(20)), child: const Row(mainAxisSize: MainAxisSize.min, children: [Icon(Icons.warning_amber_rounded, size: 14, color: Colors.orange), SizedBox(width: 4), Text("1 Approaching Limit", style: TextStyle(color: Colors.orange, fontSize: 12, fontWeight: FontWeight.bold))])),
            ],
          ),
          const SizedBox(height: 4),
          const Text("Monitor regional revenue thresholds to prevent catastrophic audit risks.", style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
          const SizedBox(height: 24),
          
          _buildTaxBar("UK VAT Registration", "£80,500 / £85,000", 0.94, Colors.orange),
          const SizedBox(height: 16),
          _buildTaxBar("EU OSS Distance Selling", "€3,200 / €10,000", 0.32, const Color(0xFF16A34A)),
          const SizedBox(height: 16),
          _buildTaxBar("US Nexus (California)", "\$145k / \$500k", 0.29, const Color(0xFF16A34A)),
        ],
      )
    );
  }

  Widget _buildTaxBar(String title, String progressText, double percent, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A))),
            Text(progressText, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: color)),
          ],
        ),
        const SizedBox(height: 8),
        LinearProgressIndicator(
          value: percent,
          backgroundColor: const Color(0xFFF1F5F9),
          color: color,
          minHeight: 8,
          borderRadius: BorderRadius.circular(10),
        )
      ],
    );
  }

  Widget _buildGeographicHeatmap() {
    return Container(
      width: double.infinity, 
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: const Color(0xFF8FFF00).withAlpha(30), blurRadius: 15)]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(children: [Icon(Icons.map_outlined, color: Color(0xFF8FFF00)), SizedBox(width: 8), Text("Geographic Heatmap", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16))]),
          const SizedBox(height: 24),
          _buildHeatmapRow("United States", 0.65, "547 Users", const Color(0xFF8FFF00)),
          const SizedBox(height: 16),
          _buildHeatmapRow("United Kingdom", 0.20, "168 Users", Colors.blueAccent),
          const SizedBox(height: 16),
          _buildHeatmapRow("Australia", 0.10, "67 Users", Colors.orangeAccent),
          const SizedBox(height: 16),
          _buildHeatmapRow("Canada", 0.05, "42 Users", Colors.purpleAccent), 
          const SizedBox(height: 16),
          _buildHeatmapRow("Germany", 0.02, "18 Users", Colors.tealAccent), 
          const SizedBox(height: 16),
          _buildHeatmapRow("France", 0.015, "12 Users", Colors.pinkAccent), 
          const SizedBox(height: 16),
          _buildHeatmapRow("Italy", 0.01, "8 Users", Colors.cyanAccent), 
          const SizedBox(height: 16),
          _buildHeatmapRow("Spain", 0.005, "4 Users", Colors.yellowAccent), 
        ],
      )
    );
  }

  Widget _buildHeatmapRow(String country, double percent, String users, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(country, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
            Row(
              children: [
                Text(users, style: const TextStyle(color: Colors.white70, fontSize: 11)),
                const SizedBox(width: 12),
                Text("${(percent * 100).toInt()}%", style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
              ],
            ),
          ],
        ),
        const SizedBox(height: 8),
        TweenAnimationBuilder<double>(
          tween: Tween<double>(begin: 0, end: startChartAnimation ? percent : 0),
          duration: const Duration(milliseconds: 1000),
          curve: Curves.easeOutCubic,
          builder: (context, value, _) => LinearProgressIndicator(
            value: value,
            backgroundColor: Colors.white.withAlpha(20),
            color: color,
            minHeight: 6,
            borderRadius: BorderRadius.circular(10),
          ),
        )
      ],
    );
  }
}

// ✨ CUSTOM PAINTER FOR THE DONUT CHART
class ChartSection {
  final double value;
  final Color color;
  ChartSection({required this.value, required this.color});
}

class DonutChartPainter extends CustomPainter {
  final double progress;
  final List<ChartSection> sections;

  DonutChartPainter({required this.progress, required this.sections});

  @override
  void paint(Canvas canvas, Size size) {
    double total = sections.fold(0, (sum, item) => sum + item.value);
    double startAngle = -pi / 2; 
    
    Paint paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 20
      ..strokeCap = StrokeCap.round; 

    Rect rect = Rect.fromCircle(center: Offset(size.width / 2, size.height / 2), radius: size.width / 2);

    for (var section in sections) {
      double sweepAngle = (section.value / total) * 2 * pi * progress; 
      
      paint.color = section.color;
      canvas.drawArc(rect, startAngle, sweepAngle, false, paint);
      
      startAngle += sweepAngle;
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true; 
}