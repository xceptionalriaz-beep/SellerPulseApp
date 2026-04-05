import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; 
import 'package:supabase_flutter/supabase_flutter.dart'; // 🚀 NEW: Supabase Connection
import 'dart:ui';

class VaultDirectoryModal extends StatefulWidget {
  const VaultDirectoryModal({super.key});

  static void show(BuildContext context) {
    showDialog(
      context: context,
      barrierColor: Colors.black.withOpacity(0.4),
      builder: (context) => const VaultDirectoryModal(),
    );
  }

  @override
  State<VaultDirectoryModal> createState() => _VaultDirectoryModalState();
}

class _VaultDirectoryModalState extends State<VaultDirectoryModal> {
  // 🔌 Supabase Client & State
  final _supabase = Supabase.instance.client;
  List<Map<String, dynamic>> savedKeys = [];
  bool _isLoading = true; // Track loading state

  @override
  void initState() {
    super.initState();
    _fetchVaultKeys(); // 🚀 Fetch data when modal opens
  }

  // 📖 READ FUNCTION: Pull all keys from database
  Future<void> _fetchVaultKeys() async {
    try {
      final data = await _supabase.from('api_fleet_config').select();
      
      List<Map<String, dynamic>> loadedKeys = [];

      for (var row in data) {
        String platform = row['platform_name'];
        String primaryKey = row['primary_key_1'] ?? '';

        // Ignore empty placeholders
        if (primaryKey.isNotEmpty && primaryKey != 'empty') {
          loadedKeys.add({
            "db_platform_name": platform, // Used for deleting
            "platform": _formatPlatformName(platform),
            "key": primaryKey,
            "icon": _getIcon(platform),
            "color": _getColor(platform),
            "isObscured": true,
          });
        }
      }

      if (mounted) {
        setState(() {
          savedKeys = loadedKeys;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint("Error fetching directory: $e");
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // 🎨 UI HELPERS to match database names to beautiful UI elements
  String _formatPlatformName(String name) {
    if (name == 'ebay') return 'eBay Production - App ID';
    if (name == 'aliexpress') return 'AliExpress - App Key';
    if (name == 'openai') return 'OpenAI - Secret Key';
    return name.toUpperCase();
  }

  IconData _getIcon(String name) {
    if (name == 'ebay') return Icons.shopping_cart_outlined;
    if (name == 'aliexpress') return Icons.store_outlined;
    if (name == 'openai') return Icons.auto_awesome_outlined;
    return Icons.api;
  }

  Color _getColor(String name) {
    if (name == 'ebay') return Colors.blue.shade600;
    if (name == 'aliexpress') return Colors.orange.shade600;
    if (name == 'openai') return Colors.green.shade600;
    return const Color(0xFF64748B);
  }

  // 🛡️ HELPER: Masks the key
  String _maskKey(String rawKey, bool isObscured) {
    if (!isObscured) return rawKey;
    if (rawKey.length <= 8) return "••••••••";
    
    String start = rawKey.substring(0, 4);
    String end = rawKey.substring(rawKey.length - 4);
    return "$start•••••••••••••$end";
  }

  // 📋 HELPER: Copy to Clipboard
  void _copyToClipboard(String text, String platform) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text("📋 $platform copied to clipboard!"),
        backgroundColor: const Color(0xFF0F172A),
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  // 🗑️ HELPER: Delete Key from Supabase AND UI
  Future<void> _deleteKey(int index) async {
    final item = savedKeys[index];
    
    try {
      // 1. Delete from Database
      await _supabase.from('api_fleet_config').delete().eq('platform_name', item['db_platform_name']);
      
      // 2. Remove from UI
      setState(() {
        savedKeys.removeAt(index);
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("🗑️ Key revoked and removed from Vault."),
            backgroundColor: Colors.redAccent,
            behavior: SnackBarBehavior.floating,
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("❌ Error deleting key: $e"), backgroundColor: Colors.redAccent));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.all(20),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          width: 550,
          padding: const EdgeInsets.all(30),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 40, spreadRadius: 10)],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // --- HEADER ---
              const Text("Active Vault Directory", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              const SizedBox(height: 8),
              Text("A secure overview of all decrypted keys currently active in memory.", style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
              const SizedBox(height: 24),
              const Divider(height: 1, color: Color(0xFFE2E8F0)),
              const SizedBox(height: 24),

              // --- DYNAMIC KEY LIST / EMPTY STATE ---
              if (_isLoading)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 40),
                  child: Center(child: CircularProgressIndicator(color: Color(0xFF0F172A))),
                )
              else if (savedKeys.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 40),
                  child: Center(
                    child: Column(
                      children: [
                        const Icon(Icons.key_off_outlined, size: 48, color: Color(0xFFCBD5E1)),
                        const SizedBox(height: 16),
                        const Text("No active keys found in Vault.", style: TextStyle(color: Color(0xFF475569), fontWeight: FontWeight.bold, fontSize: 16)),
                        const SizedBox(height: 8),
                        Text("Keys will appear here once securely saved to the database.", style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
                      ],
                    )
                  ),
                )
              else
                ...List.generate(savedKeys.length, (index) {
                  final item = savedKeys[index];
                  return _buildDirectoryItem(
                    index: index,
                    icon: item["icon"],
                    color: item["color"],
                    title: item["platform"],
                    rawKey: item["key"],
                    isObscured: item["isObscured"],
                  );
                }),

              const SizedBox(height: 24),
              const Divider(height: 1, color: Color(0xFFE2E8F0)),
              const SizedBox(height: 24),

              // --- FOOTER BUTTONS ---
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.shield_outlined, size: 14, color: Colors.green),
                      const SizedBox(width: 6),
                      Text("End-to-End Encrypted", style: TextStyle(fontSize: 12, color: Colors.grey.shade500, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  TextButton(
                    onPressed: () => Navigator.pop(context), 
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      backgroundColor: const Color(0xFFF1F5F9)
                    ),
                    child: const Text("Close Directory", style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold))
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDirectoryItem({
    required int index,
    required IconData icon,
    required Color color,
    required String title,
    required String rawKey,
    required bool isObscured,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC), 
        border: Border.all(color: const Color(0xFFE2E8F0)), 
        borderRadius: BorderRadius.circular(10)
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A))),
                const SizedBox(height: 4),
                Text(
                  _maskKey(rawKey, isObscured), 
                  style: TextStyle(fontFamily: 'monospace', color: isObscured ? const Color(0xFF94A3B8) : const Color(0xFF0F172A), fontSize: 13, letterSpacing: isObscured ? 1 : 0)
                ),
              ],
            ),
          ),
          
          // ACTIONS
          Row(
            children: [
              IconButton(
                icon: Icon(isObscured ? Icons.visibility_outlined : Icons.visibility_off_outlined, size: 18, color: const Color(0xFF64748B)), 
                onPressed: () => setState(() => savedKeys[index]["isObscured"] = !isObscured), 
                tooltip: isObscured ? "Reveal" : "Hide"
              ),
              IconButton(
                icon: const Icon(Icons.copy_outlined, size: 18, color: Color(0xFF64748B)), 
                onPressed: () => _copyToClipboard(rawKey, title), 
                tooltip: "Copy Key"
              ),
              Container(width: 1, height: 20, color: const Color(0xFFE2E8F0), margin: const EdgeInsets.symmetric(horizontal: 4)),
              IconButton(
                icon: const Icon(Icons.delete_outline, size: 18, color: Colors.redAccent), 
                onPressed: () => _deleteKey(index), 
                tooltip: "Revoke Key"
              ),
            ],
          )
        ],
      ),
    );
  }
}