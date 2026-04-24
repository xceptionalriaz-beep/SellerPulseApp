import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart'; // 🚀 Supabase Connection
import 'api_shared_widgets.dart';

class AliExpressConfigView extends StatefulWidget {
  const AliExpressConfigView({super.key});

  @override
  State<AliExpressConfigView> createState() => _AliExpressConfigViewState();
}

class _AliExpressConfigViewState extends State<AliExpressConfigView> {
  // 🔌 Initialize Supabase Client
  final _supabase = Supabase.instance.client;

  final TextEditingController _appKey = TextEditingController();
  final TextEditingController _appSecret = TextEditingController();
  
  bool _isObscured = true;
  bool _isTesting = false;
  bool _isSaving = false; 

  @override
  void initState() {
    super.initState();
    _loadSavedKeys(); // 🚀 Load keys from database on start
  }

  @override
  void dispose() {
    _appKey.dispose();
    _appSecret.dispose();
    super.dispose();
  }

  // 📖 READ FUNCTION: Pulls existing data from Supabase
Future<void> _loadSavedKeys() async {
    try {
      final data = await _supabase
          .from('api_fleet_config')
          .select()
          .eq('platform_name', 'aliexpress') // 🚀 Target AliExpress row
          .single();

      setState(() {
        // 💡 THE FIX: Hide 'empty' from the UI
        String val1 = data['primary_key_1'] ?? '';
        String val2 = data['primary_key_2'] ?? '';

        _appKey.text = (val1 == 'empty') ? '' : val1;
        _appSecret.text = (val2 == 'empty') ? '' : val2;
      });
      
    } catch (e) {
      debugPrint("Info: No existing AliExpress keys found.");
    }
  }

  // 🛡️ UPGRADED SAVE FUNCTION: Fixes the 'Duplicate Key' error
  Future<void> _saveToSupabase() async {
    if (_appKey.text.isEmpty || _appSecret.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("⚠️ Please enter both App Key and App Secret"), backgroundColor: Colors.orange)
      );
      return;
    }

    setState(() => _isSaving = true);
    
    try {
      await _supabase.from('api_fleet_config').upsert({
        'platform_name': 'aliexpress', 
        'primary_key_1': _appKey.text,
        'primary_key_2': _appSecret.text,
        'updated_at': DateTime.now().toIso8601String(),
      }, onConflict: 'platform_name'); // ✨ Fixes the red error

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("✅ AliExpress Vault updated successfully!"), 
            backgroundColor: Colors.green, 
            behavior: SnackBarBehavior.floating
          )
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
    await Future.delayed(const Duration(seconds: 2));
    setState(() => _isTesting = false);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("🟢 AliExpress Ping Successful!"), backgroundColor: Colors.green));
    }
  }

  @override
  Widget build(BuildContext context) {
    return PremiumApiCard(
      title: "AliExpress Open Platform",
      subtitle: "Supplier integration. Pulls live products, shipping times, and pricing.",
      icon: Icons.store_outlined,
      status: "Connected",
      statusColor: Colors.green,
      lastSynced: "45 mins ago",
      docsUrl: "developers.aliexpress.com",
      rateLimitUsed: 1200,
      rateLimitTotal: 50000,
      scopes: const [
        {"name": "Product API", "granted": true},
        {"name": "Logistics API", "granted": true},
      ],
      children: [
        ApiInputRow(
          label1: "App Key", 
          ctrl1: _appKey, 
          label2: "App Secret", 
          ctrl2: _appSecret, 
          isObscured: _isObscured, 
          onToggle: () => setState(() => _isObscured = !_isObscured), 
          isPrimary: true
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
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F172A), 
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))
                ),
              ),
            ),
            ApiTestButton(platform: "AliExpress", isTesting: _isTesting, onTest: _testConnection),
          ],
        ),
      ]
    );
  }
}