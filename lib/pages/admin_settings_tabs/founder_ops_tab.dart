import 'package:flutter/material.dart';

class FounderOpsTab extends StatefulWidget {
  const FounderOpsTab({super.key});

  @override
  State<FounderOpsTab> createState() => _FounderOpsTabState();
}

class _FounderOpsTabState extends State<FounderOpsTab> {
  final Color neonGreen = const Color(0xFF8FFF00);
  final Color deepNavy = const Color(0xFF0F172A);

  // Sample Checklist Data
  final List<Map<String, dynamic>> _weeklyTasks = [
    {"task": "Check Amazon Associates 24h Clicks", "done": false},
    {"task": "Verify CJ Dropshipping Pixel Status", "done": false},
    {"task": "Audit AutoDS Referral Conversion", "done": false},
    {"task": "Review Stripe/PayPal Dispute Center", "done": false},
    {"task": "Scan Security Logs for Brute Force", "done": false},
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          const SizedBox(height: 30),
          
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(flex: 6, child: _buildChecklist()),
              const SizedBox(width: 24),
              Expanded(flex: 4, child: _buildStrategyPanel()),
            ],
          ),
          
          const SizedBox(height: 30),
          _buildDeploymentShield(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Founder Control Center", style: TextStyle(fontSize: 34, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: -0.8)),
        const SizedBox(height: 8),
        Text("Reazify LLC Executive Operations", style: TextStyle(color: Colors.grey.shade600, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildChecklist() {
    // ✨ CEO SCORE CALCULATION
    int completed = _weeklyTasks.where((task) => task['done'] == true).length;
    double progress = completed / _weeklyTasks.length;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(Icons.checklist_rtl_rounded, color: neonGreen, size: 24),
                  const SizedBox(width: 12),
                  const Text("WEEKLY REVENUE PULSE", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 1.2)),
                ],
              ),
              // ✨ THE UPGRADE: Progress Ring
              Stack(
                alignment: Alignment.center,
                children: [
                  SizedBox(
                    width: 44, height: 44,
                    child: CircularProgressIndicator(
                      value: progress,
                      backgroundColor: neonGreen.withAlpha(40),
                      color: neonGreen,
                      strokeWidth: 5,
                    ),
                  ),
                  Text("${(progress * 100).toInt()}%", style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                ],
              )
            ],
          ),
          const SizedBox(height: 20),
          ..._weeklyTasks.map((item) => CheckboxListTile(
            value: item['done'],
            activeColor: neonGreen,
            checkColor: Colors.black,
            title: Text(item['task'], style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: item['done'] ? Colors.grey : deepNavy)),
            onChanged: (val) => setState(() => item['done'] = val),
            controlAffinity: ListTileControlAffinity.leading,
            contentPadding: EdgeInsets.zero,
          )).toList(),
        ],
      ),
    );
  }

  Widget _buildStrategyPanel() {
    return Column(
      children: [
        _buildStatTile("Marketplace Status", "8 Active", Icons.hub_outlined, neonGreen),
        const SizedBox(height: 16),
        _buildStatTile("Pending Payouts", "\$1,240.50", Icons.payments_outlined, Colors.blueAccent),
        const SizedBox(height: 16),
        _buildStatTile("API Efficiency", "99.8%", Icons.speed, Colors.purpleAccent),
      ],
    );
  }

  Widget _buildStatTile(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: deepNavy,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: color.withAlpha(40), blurRadius: 10)],
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: Colors.white60, fontSize: 11, fontWeight: FontWeight.bold)),
              Text(value, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildDeploymentShield() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [deepNavy, deepNavy.withAlpha(200)]),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: neonGreen.withAlpha(50)),
      ),
      child: Row(
        children: [
          Icon(Icons.shield_moon_outlined, color: neonGreen, size: 40),
          const SizedBox(width: 24),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("DEPLOYMENT GUARD ACTIVE", style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)),
                SizedBox(height: 4),
                Text("Next Scheduled System Update: Sunday, April 12 at 02:00 AM (Low Traffic Window)", style: TextStyle(color: Colors.white70, fontSize: 13)),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(backgroundColor: neonGreen, foregroundColor: Colors.black, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            child: const Text("RESCHEDULE", style: TextStyle(fontWeight: FontWeight.bold)),
          )
        ],
      ),
    );
  }
}