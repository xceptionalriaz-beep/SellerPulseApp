import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';

class AffiliateVaultTab extends StatefulWidget {
  const AffiliateVaultTab({super.key});

  @override
  State<AffiliateVaultTab> createState() => _AffiliateVaultTabState();
}

class _AffiliateVaultTabState extends State<AffiliateVaultTab> {
  final Map<String, TextEditingController> _controllers = {
    'amazon': TextEditingController(),
    'ebay': TextEditingController(),
    'aliexpress': TextEditingController(),
    'walmart': TextEditingController(),
    'cj': TextEditingController(),
    'target': TextEditingController(),
    'homedepot': TextEditingController(),
    'temu': TextEditingController(),
    'autods': TextEditingController(),
  };

  final Map<String, bool> _obscureText = {};
  bool _isSaving = false;
  bool _isLoading = true;
  String _lastSyncTime = "Not Synced";

  final Color neonGreen = const Color(0xFF8FFF00);
  final Color deepNavy = const Color(0xFF0F172A);

  @override
  void initState() {
    super.initState();
    _controllers.forEach((key, _) => _obscureText[key] = false);
    _initializeVault();
  }

  @override
  void dispose() {
    _controllers.forEach((_, controller) => controller.dispose());
    super.dispose();
  }

  Future<void> _initializeVault() async {
    try {
      for (var key in _controllers.keys) {
        final data = await Supabase.instance.client
            .from('api_fleet_config')
            .select()
            .eq('platform_name', '${key}_affiliate')
            .maybeSingle();
        
        if (data != null && mounted) {
          _controllers[key]!.text = data['primary_key_1'] ?? '';
        }
      }
      if (mounted) setState(() => _lastSyncTime = DateFormat('HH:mm:ss').format(DateTime.now()));
    } catch (e) {
      debugPrint("Vault Error: $e");
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _deployToProduction() async {
    setState(() => _isSaving = true);
    try {
      for (var entry in _controllers.entries) {
        await Supabase.instance.client.from('api_fleet_config').upsert({
          'platform_name': '${entry.key}_affiliate',
          'primary_key_1': entry.value.text.trim(),
        }, onConflict: 'platform_name');
      }

      if (mounted) {
        _lastSyncTime = DateFormat('HH:mm:ss').format(DateTime.now());
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: const Text("🚀 REVENUE ENGINE DEPLOYED", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          backgroundColor: neonGreen,
          behavior: SnackBarBehavior.floating,
        ));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("🚨 Sync Failed")));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return Center(child: CircularProgressIndicator(color: neonGreen));

    return LayoutBuilder(
      builder: (context, constraints) {
        int crossAxisCount = constraints.maxWidth > 900 ? 2 : 1;
        double itemHeight = 180; 

        return SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              const SizedBox(height: 30),
              _buildSafetyProtocol(),
              const SizedBox(height: 40),

              const Text("GLOBAL MARKETPLACE CHANNELS", 
                style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF94A3B8), fontSize: 11, letterSpacing: 1.8)),
              const SizedBox(height: 20),
              
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: crossAxisCount,
                crossAxisSpacing: 24,
                mainAxisSpacing: 24,
                childAspectRatio: constraints.maxWidth > 900 ? (constraints.maxWidth / 2) / itemHeight : constraints.maxWidth / itemHeight,
                children: [
                  _buildAffiliateCard("Amazon Associates", "amazon", Icons.shopping_cart_checkout, "https://amazon.com/s?tag="),
                  _buildAffiliateCard("eBay Partner Network", "ebay", Icons.storefront, "https://ebay.com?campid="),
                  _buildAffiliateCard("AliExpress Portal", "aliexpress", Icons.rocket_launch_outlined, "https://s.click.aliexpress.com/e/"),
                  _buildAffiliateCard("Walmart Affiliates", "walmart", Icons.local_mall_outlined, "https://walmart.com?affid="),
                  _buildAffiliateCard("CJ Dropshipping", "cj", Icons.hub, "https://cjdropshipping.com?token="),
                  _buildAffiliateCard("Target Partners", "target", Icons.track_changes, "https://target.com?ref="),
                  _buildAffiliateCard("Home Depot", "homedepot", Icons.home_work_outlined, "https://homedepot.com?tag="),
                  _buildAffiliateCard("Temu Global", "temu", Icons.shopping_bag_outlined, "https://temu.com/affid="),
                ],
              ),

              const SizedBox(height: 45),
              const Text("SOFTWARE & SAAS PARTNERS", 
                style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF94A3B8), fontSize: 11, letterSpacing: 1.8)),
              const SizedBox(height: 20),
              
              _buildAffiliateCard(
                "AutoDS Integration Link",
                "autods",
                Icons.bolt,
                "https://autods.com/register?ref=",
                subtitle: "Monetize product imports via your personal referral tunnel.",
              ),

              const SizedBox(height: 60),
              _buildActionFooter(),
            ],
          ),
        );
      },
    );
  }

  Widget _buildAffiliateCard(String title, String key, IconData icon, String previewBase, {String? subtitle}) {
    final controller = _controllers[key]!;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: const [BoxShadow(color: Color(0x06000000), blurRadius: 12, offset: Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: deepNavy, borderRadius: BorderRadius.circular(8)),
                child: Icon(icon, color: neonGreen, size: 18),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                    if (subtitle != null) Text(subtitle, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                  ],
                ),
              ),
              // ✨ THE UPGRADE: NEON STATUS PULSE
              if (controller.text.isNotEmpty)
                TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0.6, end: 1.0),
                  duration: const Duration(seconds: 2),
                  curve: Curves.easeInOut,
                  builder: (context, opacity, child) {
                    return Opacity(
                      opacity: opacity,
                      child: Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: neonGreen.withAlpha((opacity * 100).toInt()),
                              blurRadius: 10 * opacity,
                              spreadRadius: 2 * opacity,
                            )
                          ],
                        ),
                        child: Icon(Icons.verified_user_rounded, color: neonGreen, size: 18),
                      ),
                    );
                  },
                  onEnd: () => setState(() {}),
                ),
            ],
          ),
          const SizedBox(height: 16),
          TextField(
            controller: controller,
            obscureText: _obscureText[key]!,
            onChanged: (val) => setState(() {}),
            cursorColor: Colors.black,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1.1),
            decoration: InputDecoration(
              hintText: "Paste Tag / ID...",
              filled: true,
              fillColor: const Color(0xFFF8FAFC),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: neonGreen, width: 2)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
              suffixIcon: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(icon: Icon(_obscureText[key]! ? Icons.visibility_off : Icons.visibility, size: 16), onPressed: () => setState(() => _obscureText[key] = !_obscureText[key]!)),
                  IconButton(icon: const Icon(Icons.copy_all_rounded, size: 16), onPressed: () {
                    Clipboard.setData(ClipboardData(text: controller.text));
                  }),
                ],
              ),
            ),
          ),
          if (controller.text.isNotEmpty) ...[
            const SizedBox(height: 10),
            Text("LIVE: $previewBase${controller.text}", 
              style: const TextStyle(fontSize: 9, color: Color(0xFF94A3B8), fontWeight: FontWeight.w500), 
              overflow: TextOverflow.ellipsis
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Affiliate Vault", style: TextStyle(fontSize: 34, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: -0.8)),
            const SizedBox(height: 4),
            Row(
              children: [
                Container(width: 8, height: 8, decoration: BoxDecoration(color: neonGreen, shape: BoxShape.circle, boxShadow: [BoxShadow(color: neonGreen.withAlpha(200), blurRadius: 8)])),
                const SizedBox(width: 8),
                const Text("Monetization Pulse: Active", style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold, fontSize: 13)),
              ],
            ),
          ],
        ),
        _buildSyncBadge(),
      ],
    );
  }

  Widget _buildSyncBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(color: deepNavy, borderRadius: BorderRadius.circular(12), border: Border.all(color: neonGreen.withAlpha(50))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text("VAULT LAST SYNC", style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: neonGreen.withAlpha(180), letterSpacing: 1.2)),
          const SizedBox(height: 2),
          Text(_lastSyncTime, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.white)),
        ],
      ),
    );
  }

  Widget _buildSafetyProtocol() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: neonGreen.withAlpha(15), borderRadius: BorderRadius.circular(16), border: Border.all(color: neonGreen.withAlpha(60))),
      child: Row(
        children: [
          Icon(Icons.shield_rounded, color: neonGreen, size: 24),
          const SizedBox(width: 14),
          const Expanded(
            child: Text(
              "Global Deployment Protocol: Changes saved here will instantly inject tracking IDs into every live search result. Use extreme caution.",
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF1E293B), height: 1.4),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionFooter() {
    return Align(
      alignment: Alignment.centerRight,
      child: Container(
        height: 54, width: 320,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: neonGreen.withAlpha(100), blurRadius: 20, offset: const Offset(0, 10), spreadRadius: -5)],
        ),
        child: ElevatedButton.icon(
          onPressed: _isSaving ? null : _deployToProduction,
          icon: _isSaving 
            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 3))
            : const Icon(Icons.offline_bolt_rounded, color: Colors.black, size: 22),
          label: Text(_isSaving ? "SYNCHRONIZING..." : "DEPLOY REVENUE ENGINE", 
            style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w900, letterSpacing: 1.2, fontSize: 13)),
          style: ElevatedButton.styleFrom(backgroundColor: neonGreen, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)), elevation: 0),
        ),
      ),
    );
  }
}