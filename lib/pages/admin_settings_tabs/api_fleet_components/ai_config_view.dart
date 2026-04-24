import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart'; // 🚀 Supabase Connection
import 'api_shared_widgets.dart';

class AiConfigView extends StatefulWidget {
  const AiConfigView({super.key});

  @override
  State<AiConfigView> createState() => _AiConfigViewState();
}

class _AiConfigViewState extends State<AiConfigView> {
  // 🔌 Initialize Supabase Client
  final _supabase = Supabase.instance.client;

  final TextEditingController _apiKey = TextEditingController();
  final TextEditingController _orgId = TextEditingController();
  
  bool _isObscured = true;
  bool _isTesting = false;
  bool _isSaving = false; 

  @override
  void initState() {
    super.initState();
    _loadSavedKeys(); // 🚀 Load existing AI keys on start
  }

  @override
  void dispose() {
    _apiKey.dispose();
    _orgId.dispose();
    super.dispose();
  }

  // 📖 READ FUNCTION: Pulls existing data from Supabase
Future<void> _loadSavedKeys() async {
    try {
      final data = await _supabase
          .from('api_fleet_config')
          .select()
          .eq('platform_name', 'openai') // 🚀 Target OpenAI row
          .single();

      setState(() {
        // 💡 THE FIX: Hide 'empty' from the UI
        String val1 = data['primary_key_1'] ?? '';
        String val2 = data['primary_key_2'] ?? '';

        _apiKey.text = (val1 == 'empty') ? '' : val1;
        _orgId.text = (val2 == 'empty') ? '' : val2;
      });
      
    } catch (e) {
      debugPrint("Info: No existing OpenAI keys found.");
    }
  }

  // 🛡️ UPGRADED SAVE FUNCTION: Fixes the 'Duplicate Key' error
  Future<void> _saveToSupabase() async {
    if (_apiKey.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("⚠️ Please enter your OpenAI API Secret Key"), backgroundColor: Colors.orange)
      );
      return;
    }

    setState(() => _isSaving = true);
    
    try {
      await _supabase.from('api_fleet_config').upsert({
        'platform_name': 'openai', 
        'primary_key_1': _apiKey.text,
        'primary_key_2': _orgId.text,
        'updated_at': DateTime.now().toIso8601String(),
      }, onConflict: 'platform_name'); // ✨ Prevents duplicate row errors

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("✅ OpenAI Vault updated successfully!"), 
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
    // TODO: Replace with real OpenAI ping check later
    await Future.delayed(const Duration(seconds: 2));
    setState(() => _isTesting = false);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("🟢 OpenAI Ping Successful!"), backgroundColor: Colors.green));
    }
  }

  @override
  Widget build(BuildContext context) {
    return PremiumApiCard(
      title: "SellerPulse AI Engine (OpenAI)",
      subtitle: "Powers automated Title Generation and Item Specifics extraction.",
      icon: Icons.auto_awesome_outlined,
      status: "Connected",
      statusColor: Colors.green,
      lastSynced: "Just now",
      docsUrl: "platform.openai.com",
      spendCurrent: 42.50,
      spendLimit: 100.00,
      scopes: const [
        {"name": "Text Generation", "granted": true},
        {"name": "Image Gen", "granted": false},
      ],
      children: [
        ApiInputRow(
          label1: "API Secret Key", 
          ctrl1: _apiKey, 
          label2: "Organization ID (Optional)", 
          ctrl2: _orgId, 
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
            ApiTestButton(platform: "OpenAI", isTesting: _isTesting, onTest: _testConnection),
          ],
        ),
      ]
    );
  }
}