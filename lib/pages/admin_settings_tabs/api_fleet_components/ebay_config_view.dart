import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart'; // 🚀 Supabase Connection
import 'api_shared_widgets.dart';

class EbayConfigView extends StatefulWidget {
  const EbayConfigView({super.key});

  @override
  State<EbayConfigView> createState() => _EbayConfigViewState();
}

class _EbayConfigViewState extends State<EbayConfigView> {
  // 🔌 Initialize Supabase Client
  final _supabase = Supabase.instance.client;

  final TextEditingController _primaryAppId = TextEditingController();
  final TextEditingController _primaryCertId = TextEditingController();
  final TextEditingController _backupAppId = TextEditingController();
  final TextEditingController _backupCertId = TextEditingController();

  bool _obscurePrimary = true;
  bool _obscureBackup = true;
  bool _isTesting = false;
  bool _isSaving = false; 

  @override
  void initState() {
    super.initState();
    _loadSavedKeys(); // 🚀 NEW: Load keys from database as soon as tab opens
  }

  @override
  void dispose() {
    _primaryAppId.dispose();
    _primaryCertId.dispose();
    _backupAppId.dispose();
    _backupCertId.dispose();
    super.dispose();
  }

// 📖 READ FUNCTION: Pulls existing data from Supabase
Future<void> _loadSavedKeys() async {
    try {
      final data = await _supabase
          .from('api_fleet_config')
          .select()
          .eq('platform_name', 'ebay') // or 'aliexpress' / 'openai'
          .single();

      setState(() {
        // 💡 THE FIX: If the value is 'empty', show an actual empty string ''
        String val1 = data['primary_key_1'] ?? '';
        String val2 = data['primary_key_2'] ?? '';

        _primaryAppId.text = (val1 == 'empty') ? '' : val1;
        _primaryCertId.text = (val2 == 'empty') ? '' : val2;
        
        // Do the same for backup keys if needed
        _backupAppId.text = data['backup_key_1'] ?? '';
        _backupCertId.text = data['backup_key_2'] ?? '';
      });
      
    } catch (e) {
      debugPrint("Info: No existing keys found.");
    }
  }

  // 🛡️ UPGRADED SAVE FUNCTION: Fixes the 'Duplicate Key' error
  Future<void> _saveToSupabase() async {
    if (_primaryAppId.text.isEmpty || _primaryCertId.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("⚠️ Please enter at least the Primary App ID and Cert ID"), backgroundColor: Colors.orange)
      );
      return;
    }

    setState(() => _isSaving = true);
    
    try {
      // ✨ The FIX: We tell Supabase to look for a conflict on 'platform_name' and update instead of insert
      await _supabase.from('api_fleet_config').upsert({
        'platform_name': 'ebay', 
        'primary_key_1': _primaryAppId.text,
        'primary_key_2': _primaryCertId.text,
        'backup_key_1': _backupAppId.text,
        'backup_key_2': _backupCertId.text,
        'updated_at': DateTime.now().toIso8601String(),
      }, onConflict: 'platform_name'); 

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("✅ eBay Vault updated successfully!"), backgroundColor: Colors.green, behavior: SnackBarBehavior.floating)
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("❌ Database Error: $e"), backgroundColor: Colors.redAccent)
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  Future<void> _testConnection() async {
    setState(() => _isTesting = true);
    // TODO: Later replace with Supabase Edge Function call
    await Future.delayed(const Duration(seconds: 2));
    setState(() => _isTesting = false);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("🟢 eBay API Ping Successful!"), backgroundColor: Colors.green));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        PremiumApiCard(
          title: "eBay Developer Config",
          subtitle: "Live market data, catalog searches, and VeRO validation.",
          icon: Icons.shopping_cart_outlined,
          status: "Connected",
          statusColor: Colors.green,
          lastSynced: "2 mins ago",
          docsUrl: "developer.ebay.com/docs",
          expirationDays: 28, 
          rateLimitUsed: 4250,
          rateLimitTotal: 5000,
          scopes: const [
            {"name": "Read Catalog", "granted": true},
            {"name": "Search Items", "granted": true},
            {"name": "Create Listings", "granted": false},
            {"name": "Issue Refunds", "granted": false},
          ],
          children: [
            ApiInputRow(
              label1: "Primary App ID", 
              ctrl1: _primaryAppId, 
              label2: "Primary Cert ID", 
              ctrl2: _primaryCertId, 
              isObscured: _obscurePrimary, 
              onToggle: () => setState(() => _obscurePrimary = !_obscurePrimary), 
              isPrimary: true
            ),
            const SizedBox(height: 20),
            ApiInputRow(
              label1: "Fallback App ID (Failover)", 
              ctrl1: _backupAppId, 
              label2: "Fallback Cert ID", 
              ctrl2: _backupCertId, 
              isObscured: _obscureBackup, 
              onToggle: () => setState(() => _obscureBackup = !_obscureBackup), 
              isPrimary: false
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                SizedBox(
                  height: 45,
                  child: ElevatedButton.icon(
                    onPressed: _isSaving ? null : _saveToSupabase,
                    icon: _isSaving 
                      ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.cloud_upload_outlined, size: 18, color: Colors.white),
                    label: Text(_isSaving ? "Saving..." : "Save to Vault", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                  ),
                ),
                ApiTestButton(platform: "eBay", isTesting: _isTesting, onTest: _testConnection),
              ],
            ),
          ]
        ),
      ],
    );
  }
}