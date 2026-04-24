import 'package:flutter/material.dart';
import 'vault_directory_modal.dart'; // 🚀 Connects to File #6

class ApiFleetHeader extends StatelessWidget {
  final bool isGlobalSandboxMode;
  final ValueChanged<bool> onSandboxToggle;

  const ApiFleetHeader({
    super.key,
    required this.isGlobalSandboxMode,
    required this.onSandboxToggle,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Global API Command Center", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
            const SizedBox(height: 8),
            const Text("Manage rate limits, failovers, and security scopes isolated by platform.", style: TextStyle(color: Color(0xFF64748B), fontSize: 14)),
            const SizedBox(height: 12),
            Row(
              children: const [
                Icon(Icons.history, size: 14, color: Color(0xFF94A3B8)),
                SizedBox(width: 6),
                Text("Last updated by Admin (Reaz) on April 5th, 2026", style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8), fontStyle: FontStyle.italic)),
              ],
            )
          ],
        ),
        
        Row(
          children: [
            // VAULT DIRECTORY BUTTON
            OutlinedButton.icon(
              onPressed: () => VaultDirectoryModal.show(context),
              icon: const Icon(Icons.list_alt, size: 16, color: Color(0xFF0F172A)),
              label: const Text("Vault Directory", style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold)),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                side: const BorderSide(color: Color(0xFFE2E8F0)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
              ),
            ),
            const SizedBox(width: 16),
            
            // GLOBAL MASTER SWITCH
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
              child: Row(
                children: [
                  Icon(isGlobalSandboxMode ? Icons.science : Icons.public, color: isGlobalSandboxMode ? Colors.orange : Colors.green, size: 18),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("Global Routing", style: TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                      Text(isGlobalSandboxMode ? "SANDBOX MODE" : "PRODUCTION MODE", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: isGlobalSandboxMode ? Colors.orange : Colors.green)),
                    ],
                  ),
                  const SizedBox(width: 16),
                  Switch(
                    value: !isGlobalSandboxMode,
                    onChanged: (val) => onSandboxToggle(!val),
                    activeColor: Colors.green,
                    inactiveThumbColor: Colors.orange,
                    inactiveTrackColor: Colors.orange.withOpacity(0.2),
                  )
                ],
              ),
            )
          ],
        )
      ],
    );
  }
}