import 'package:flutter/material.dart';

class InfrastructureMonitorTab extends StatefulWidget {
  final bool isMobile;
  final bool startChartAnimation;

  const InfrastructureMonitorTab({
    super.key,
    required this.isMobile,
    required this.startChartAnimation,
  });

  @override
  State<InfrastructureMonitorTab> createState() => _InfrastructureMonitorTabState();
}

class _InfrastructureMonitorTabState extends State<InfrastructureMonitorTab> {
  // Local state for the uptime toggle buttons
  String _apiStatus = "Operational";

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ✨ PHASE 6 UPDATE: PUBLIC UPTIME STATUS MANAGER
          _buildUptimeManager(),
          const SizedBox(height: 24),
          if (widget.isMobile)
            Column(
              children: [
                _buildServerGauge("Supabase DB", 0.52, "4.2 GB / 8 GB", false),
                const SizedBox(height: 16),
                _buildServerGauge("Vercel Bandwidth", 0.45, "45 GB / 100 GB", false),
                const SizedBox(height: 16),
                _buildServerGauge("Websockets", 0.85, "1,204 Connected", true),
              ],
            )
          else
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(child: _buildServerGauge("Supabase Database", 0.52, "4.2 GB / 8 GB Used", false)),
                const SizedBox(width: 16),
                Expanded(child: _buildServerGauge("Vercel Bandwidth", 0.45, "45 GB / 100 GB", false)),
                const SizedBox(width: 16),
                Expanded(child: _buildServerGauge("Active Websockets", 0.85, "1,204 Connected", true)), 
              ],
            ),
          const SizedBox(height: 24),
          _buildB2BAPIHub(),
        ],
      )
    );
  }

  // ✨ PHASE 6 WIDGET: UPTIME STATUS MANAGER
  Widget _buildUptimeManager() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Expanded(child: Text("Public 'Uptime Status' Page Manager", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)))),
              const SizedBox(width: 12),
              TextButton.icon(onPressed: (){}, icon: const Icon(Icons.open_in_new, size: 14), label: const Text("View status.sellerpulse.com", overflow: TextOverflow.ellipsis,)),
            ],
          ),
          const SizedBox(height: 4),
          const Text("Manually override the public system status if eBay or Amazon APIs go down to prevent support ticket flooding.", style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
          const SizedBox(height: 24),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                SizedBox(width: 200, child: _buildStatusToggle("Operational", Icons.check_circle, Colors.green, _apiStatus == "Operational")),
                const SizedBox(width: 16),
                SizedBox(width: 200, child: _buildStatusToggle("Degraded", Icons.warning_amber_rounded, Colors.orangeAccent, _apiStatus == "Degraded")),
                const SizedBox(width: 16),
                SizedBox(width: 200, child: _buildStatusToggle("Major Outage", Icons.error_outline, Colors.redAccent, _apiStatus == "Major Outage")),
              ]
            ),
          )
        ],
      )
    );
  }

  Widget _buildStatusToggle(String title, IconData icon, Color color, bool isActive) {
    return InkWell(
      onTap: () => setState(() => _apiStatus = title),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: isActive ? color.withAlpha(20) : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isActive ? color : const Color(0xFFE2E8F0), width: isActive ? 2 : 1),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: isActive ? color : const Color(0xFF94A3B8), size: 20),
            const SizedBox(width: 8),
            Expanded(child: Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: isActive ? color : const Color(0xFF64748B)), maxLines: 1, overflow: TextOverflow.ellipsis)),
          ],
        )
      )
    );
  }

  Widget _buildServerGauge(String title, double percentage, String subtitle, bool isWarning) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Column(
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF0F172A)), textAlign: TextAlign.center),
          const SizedBox(height: 20),
          SizedBox(
            height: 120, width: 120,
            child: TweenAnimationBuilder<double>(
              tween: Tween<double>(begin: 0.0, end: widget.startChartAnimation ? percentage : 0.0),
              duration: const Duration(milliseconds: 1500), // USER ORIGINAL
              curve: Curves.easeOutCubic, // USER ORIGINAL
              builder: (context, value, _) => Stack(
                fit: StackFit.expand,
                children: [
                  const CircularProgressIndicator(value: 1.0, strokeWidth: 12, color: Color(0xFFF1F5F9)), 
                  CircularProgressIndicator(value: value, strokeWidth: 12, color: isWarning && value > 0.8 ? Colors.redAccent : const Color(0xFF8FFF00)), 
                  Center(child: Text("${(value * 100).toInt()}%", style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold))),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(subtitle, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  // ✨ PHASE 5: B2B API HUB
  Widget _buildB2BAPIHub() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Expanded(child: Text("B2B 'White-Label' API Monetization", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)))),
              const SizedBox(width: 12),
              ElevatedButton.icon(onPressed: (){}, icon: const Icon(Icons.add, size: 16), label: const Text("Issue New Key"), style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A), foregroundColor: Colors.white)),
            ],
          ),
          const SizedBox(height: 4),
          const Text("Manage third-party startups paying to access your VeRO & Profit Engine APIs.", style: TextStyle(color: Color(0xFF64748B), fontSize: 13)),
          const SizedBox(height: 24),
          
          _buildB2BPartnerRow("AutoLister Pro", "sk_live_x89f...", "42,500 Calls", "\$425.00"),
          _buildB2BPartnerRow("Dropship Ninja", "sk_live_a12b...", "18,200 Calls", "\$182.00"),
        ],
      )
    );
  }

  Widget _buildB2BPartnerRow(String name, String key, String usage, String rev) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12), padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Wrap(
        spacing: 16,
        runSpacing: 16,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.business, color: Color(0xFF64748B), size: 20),
              const SizedBox(width: 16),
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A))), Text("API Key: $key", style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)))]),
            ],
          ),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [Text(usage, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A))), const Text("This Month", style: TextStyle(fontSize: 11, color: Color(0xFF64748B)))]),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [Text(rev, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF16A34A))), const Text("B2B Revenue", style: TextStyle(fontSize: 11, color: Color(0xFF64748B)))]),
        ],
      ),
    );
  }
}