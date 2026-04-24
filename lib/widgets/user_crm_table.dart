import 'package:flutter/material.dart';
import 'dart:math';

class UserCrmTable extends StatefulWidget {
  final bool isInvestorMode;

  const UserCrmTable({super.key, required this.isInvestorMode});

  @override
  State<UserCrmTable> createState() => _UserCrmTableState();
}

class _UserCrmTableState extends State<UserCrmTable> {
  final List<Map<String, dynamic>> _users = [
    {
      "name": "Mike Ross",
      "email": "mike@dropkings.com",
      "plan": "Elite Plan",
      "status": "Active",
      "joinDate": "Mar 12, 2024",
      "time": "3:40 PM",
      "usage": 0.8,
      "dispute": null,
      "avatarColor": Colors.blueGrey,
    },
    {
      "name": "Sarah Jenkins",
      "email": "sarah.j@gmail.com",
      "plan": "Pro Plan",
      "status": "Active",
      "joinDate": "May 11, 2024",
      "time": "9:00 PM",
      "usage": 0.45,
      "dispute": "\$99.00 / mut\nRecent support",
      "avatarColor": Colors.teal,
    },
    {
      "name": "Sarah Jenkins",
      "email": "sarah.j@gmail.com",
      "plan": "Pro Plan",
      "status": "Expired",
      "joinDate": "May 14, 2024",
      "time": "9:00 PM",
      "usage": 0.1,
      "dispute": null,
      "avatarColor": Colors.teal,
    },
    {
      "name": "David Chen",
      "email": "david.chen22@yahoo.com",
      "plan": "Free Trial",
      "status": "Past Due",
      "joinDate": "May 14, 2024",
      "time": "9:00 PM",
      "usage": 0.95,
      "dispute": null,
      "avatarColor": Colors.orangeAccent,
    },
    {
      "name": "Emma Watson",
      "email": "emma@ebayseller.co.uk",
      "plan": "Pro Plan",
      "status": "Past Due",
      "joinDate": "May 14, 2024",
      "time": "9:00 PM",
      "usage": 0.6,
      "dispute": "\$99.00 / mut\nMike Ross (\$99)",
      "avatarColor": Colors.purpleAccent,
    },
  ];

  @override
  Widget build(BuildContext context) {
    // ✨ THE FIX: Notice there are NO vertical "Expanded" widgets here!
    // It is just a safe, natural column that hugs its content perfectly.
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        _buildTopHUD(),
        const SizedBox(height: 24),
        _buildTableControls(),
        const SizedBox(height: 16),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10, offset: Offset(0, 4))]
          ),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            child: SizedBox(
              width: 1050,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildTableHeader(),
                  const Divider(height: 1, color: Color(0xFFE2E8F0)),
                  // ✨ We MAP the rows instead of using ListView. This stops all freezing.
                  ..._users.map((user) => Column(
                    children: [
                      _buildDataRow(user),
                      const Divider(height: 1, color: Color(0xFFF1F5F9)),
                    ],
                  )),
                ],
              ),
            ),
          ),
        )
      ],
    );
  }

  Widget _buildTopHUD() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Row(
        children: [
          _buildHUDCard(
            title: "Active Subscribers",
            value: "842",
            subtitle: "Total: 1,020. (+12 today)",
            child: const SizedBox(
              width: 50, height: 50,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  CircularProgressIndicator(value: 0.82, backgroundColor: Color(0xFFF1F5F9), color: Color(0xFF0F172A), strokeWidth: 6),
                  Center(child: Text("842", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13))),
                ],
              ),
            ),
          ),
          const SizedBox(width: 16),
          _buildHUDCard(
            title: "Plan Distribution",
            value: "Pro Plans: 547",
            subtitle: "Free: 300  |  Elite: 173",
            child: Row(
              children: [
                _buildMiniBar(0.8, const Color(0xFF8FFF00)),
                const SizedBox(width: 4),
                _buildMiniBar(0.4, const Color(0xFF0F172A)),
                const SizedBox(width: 4),
                _buildMiniBar(0.2, const Color(0xFF64748B)),
              ],
            ),
          ),
          const SizedBox(width: 16),
          _buildHUDCard(
            title: "Account Health",
            value: "3 Risk Users",
            subtitle: "Past Due: 1 user (Emma W.)",
            child: const SizedBox(
              width: 50, height: 50,
              child: CircularProgressIndicator(value: 0.15, backgroundColor: Color(0xFFF1F5F9), color: Colors.orange, strokeWidth: 6),
            ),
          ),
          const SizedBox(width: 16),
          _buildHUDCard(
            title: "Dispute Center",
            value: "1 Active Dispute",
            subtitle: "Mike Ross (\$99.00)",
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: Colors.red.shade50, shape: BoxShape.circle),
              child: const Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 24),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHUDCard({required String title, required String value, required String subtitle, required Widget child}) {
    return Container(
      width: 280,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [BoxShadow(color: Color(0x02000000), blurRadius: 8, offset: Offset(0, 4))]
      ),
      child: Row(
        children: [
          child,
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                const SizedBox(height: 4),
                Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8))),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMiniBar(double fill, Color color) {
    return Container(
      width: 12, height: 40,
      decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(4)),
      alignment: Alignment.bottomCenter,
      child: FractionallySizedBox(
        heightFactor: fill,
        child: Container(decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4))),
      ),
    );
  }

  Widget _buildTableControls() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          Container(
            width: 250,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
            child: Row(
              children: [
                const Icon(Icons.search, size: 18, color: Color(0xFF94A3B8)),
                const SizedBox(width: 8),
                const Expanded(
                  child: TextField(
                    decoration: InputDecoration(hintText: "Search users...", border: InputBorder.none, isDense: true, contentPadding: EdgeInsets.symmetric(vertical: 12)),
                    style: TextStyle(fontSize: 13),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(4)),
                  child: const Text("Cmd+K", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF64748B))),
                )
              ],
            ),
          ),
          const SizedBox(width: 16),
          _buildFilterChip("Active Tiers", Icons.filter_list),
          _buildFilterChip("Expired Trials", Icons.timer_off_outlined),
          _buildFilterChip("Past Due", Icons.warning_amber_rounded, isAlert: true),
          _buildFilterChip("Support waiting", Icons.support_agent),
          const SizedBox(width: 16),
          ElevatedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.add, size: 16, color: Colors.white),
            label: const Text("Add New User", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A), padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16), elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
          )
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, IconData icon, {bool isAlert = false}) {
    return Container(
      margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Row(
        children: [
          Icon(icon, size: 16, color: isAlert ? Colors.orange : const Color(0xFF64748B)),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF334155))),
        ],
      ),
    );
  }

  Widget _buildTableHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        children: [
          const SizedBox(width: 32),
          Expanded(flex: 3, child: Text("USER", style: _headerStyle())),
          Expanded(flex: 2, child: Text("PLAN / STATUS", style: _headerStyle())),
          Expanded(flex: 2, child: Text("JOIN DATE", style: _headerStyle())),
          Expanded(flex: 2, child: Text("ACTIVITY", style: _headerStyle())),
          Expanded(flex: 2, child: Text("DISPUTE", style: _headerStyle())),
          Expanded(flex: 2, child: Align(alignment: Alignment.centerRight, child: Text("ACTION", style: _headerStyle()))),
        ],
      ),
    );
  }

  TextStyle _headerStyle() => const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8), letterSpacing: 1);

  Widget _buildDataRow(Map<String, dynamic> user) {
    Color statusColor = Colors.green;
    Color statusBg = Colors.green.withAlpha(20);
    if (user['status'] == 'Expired') { statusColor = Colors.red; statusBg = Colors.red.withAlpha(20); }
    if (user['status'] == 'Past Due') { statusColor = Colors.orange; statusBg = Colors.orange.withAlpha(20); }

    String displayName = widget.isInvestorMode ? "${user['name'].split(' ')[0]} ***" : user['name'];
    String displayEmail = widget.isInvestorMode ? "${user['email'][0]}***@${user['email'].split('@')[1]}" : user['email'];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        children: [
          Container(width: 16, height: 16, decoration: BoxDecoration(border: Border.all(color: const Color(0xFFCBD5E1)), borderRadius: BorderRadius.circular(4))),
          const SizedBox(width: 16),
          Expanded(
            flex: 3,
            child: Row(
              children: [
                CircleAvatar(backgroundColor: user['avatarColor'].withAlpha(30), radius: 18, child: Text(user['name'][0], style: TextStyle(color: user['avatarColor'], fontWeight: FontWeight.bold, fontSize: 14))),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(displayName, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A), fontSize: 13)),
                      Text(displayEmail, style: const TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            flex: 2,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(6)), child: Text(user['plan'], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF334155)))),
                    const SizedBox(width: 8),
                    Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), decoration: BoxDecoration(color: statusBg, borderRadius: BorderRadius.circular(6)), child: Text(user['status'], style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: statusColor))),
                  ],
                ),
                const SizedBox(height: 8),
                Container(
                  width: 100,
                  height: 4,
                  decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(2)),
                  child: FractionallySizedBox(alignment: Alignment.centerLeft, widthFactor: user['usage'], child: Container(decoration: BoxDecoration(color: statusColor, borderRadius: BorderRadius.circular(2)))),
                )
              ],
            ),
          ),
          Expanded(
            flex: 2,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(user['joinDate'], style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF0F172A), fontSize: 12)),
                Text(user['time'], style: const TextStyle(color: Color(0xFF64748B), fontSize: 11)),
              ],
            ),
          ),
          Expanded(
            flex: 2,
            child: _buildFakeSparkline(statusColor),
          ),
          Expanded(
            flex: 2,
            child: user['dispute'] != null 
              ? Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                  decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(6)),
                  child: Text(user['dispute'], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.redAccent)),
                )
              : const SizedBox(),
          ),
          Expanded(
            flex: 2,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton(
                  onPressed: () {},
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 12), side: const BorderSide(color: Color(0xFFE2E8F0)), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                  child: const Text("Detailed Profile", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                ),
                const SizedBox(width: 8),
                const Icon(Icons.more_vert, size: 20, color: Color(0xFF94A3B8)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFakeSparkline(Color color) {
    final random = Random();
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: List.generate(15, (index) {
        double height = 5 + random.nextInt(25).toDouble();
        return Container(
          margin: const EdgeInsets.only(right: 2),
          width: 3, height: height,
          decoration: BoxDecoration(color: color.withAlpha(100 + random.nextInt(155)), borderRadius: BorderRadius.circular(2)),
        );
      }),
    );
  }
}