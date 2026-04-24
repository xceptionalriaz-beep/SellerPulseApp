import 'package:flutter/material.dart';
// ✨ IMPORT: Path to your master responsive widget
import '../../widgets/responsive_action_header.dart';

class RoleBuilderTab extends StatelessWidget {
  const RoleBuilderTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white, 
        borderRadius: BorderRadius.circular(16), 
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ✨ UPGRADED: Using the Master Widget to handle title, subtitle, and responsive button
          ResponsiveActionHeader(
            title: "Team Access & Role Builder (RBAC)",
            subtitle: "Create strict permission roles for your VAs and customer support team.",
            actionButton: ElevatedButton.icon(
              onPressed: () {}, 
              icon: const Icon(Icons.person_add, size: 16), 
              label: const Text("Invite Staff", style: TextStyle(fontWeight: FontWeight.bold)), 
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0F172A), 
                foregroundColor: Colors.white, 
                elevation: 0,
              ),
            ),
          ),
          const SizedBox(height: 24),
          _buildRoleItem("Support Agent", "Can view CRM and Helpdesk. Cannot see Revenue or API Keys.", ["CRM Access", "Helpdesk View", "Ghost Mode"], 2),
          const SizedBox(height: 16),
          _buildRoleItem("Developer", "Can view and rotate API keys. Cannot view User CRM or Revenue.", ["API Access", "System Logs", "VeRO List"], 1),
        ],
      ),
    );
  }

  Widget _buildRoleItem(String title, String desc, List<String> perms, int users) {
    return Container(
      padding: const EdgeInsets.all(16), 
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC), 
        borderRadius: BorderRadius.circular(12), 
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12), 
            decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, border: Border.all(color: const Color(0xFFE2E8F0))), 
            child: const Icon(Icons.shield_outlined, color: Color(0xFF0F172A)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start, 
              children: [
                Text(
                  title, 
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF0F172A)),
                ), 
                Text(
                  desc, 
                  style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                ), 
                const SizedBox(height: 8), 
                Wrap(
                  spacing: 8, 
                  runSpacing: 8, 
                  children: perms.map((p) => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4), 
                    decoration: BoxDecoration(color: const Color(0xFFDCFCE7), borderRadius: BorderRadius.circular(4)), 
                    child: Text(
                      p, 
                      style: const TextStyle(fontSize: 10, color: Color(0xFF16A34A), fontWeight: FontWeight.bold),
                    ),
                  )).toList(),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12), 
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8), border: Border.all(color: const Color(0xFFE2E8F0))), 
            child: Column(
              children: [
                Text(users.toString(), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)), 
                const Text("Staff", style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
              ],
            ),
          ),
        ],
      ),
    );
  }
}