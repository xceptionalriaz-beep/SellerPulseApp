import 'package:flutter/material.dart';

// 🚀 IMPORT YOUR NEW MODULAR COMPONENTS
import 'api_fleet_components/api_fleet_header.dart';
import 'api_fleet_components/ebay_config_view.dart';
import 'api_fleet_components/aliexpress_config_view.dart';
import 'api_fleet_components/ai_config_view.dart';

class GlobalApiFleetTab extends StatefulWidget {
  const GlobalApiFleetTab({super.key});

  @override
  State<GlobalApiFleetTab> createState() => _GlobalApiFleetTabState();
}

class _GlobalApiFleetTabState extends State<GlobalApiFleetTab> {
  // 🚀 GLOBAL STATE (Traffic Cop)
  bool _isGlobalSandboxMode = false;
  bool _isSavingAll = false;
  int _activeTabIndex = 0; 

  final List<String> _platforms = ["eBay Network", "AliExpress", "OpenAI Engine", "Amazon SP-API (Locked)"];

  // 🛡️ MASTER SAVE FUNCTION
  Future<void> _saveAllToVault() async {
    setState(() => _isSavingAll = true);
    // ⏳ Simulating saving to Supabase Database
    await Future.delayed(const Duration(seconds: 2));
    setState(() => _isSavingAll = false);
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text("✅ Global Fleet Config securely encrypted and saved."),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(30),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ==========================================
          // 1. TOP HEADER & GLOBAL CONTROLS
          // ==========================================
          // 🚀 Now powered by the isolated Header component!
          ApiFleetHeader(
            isGlobalSandboxMode: _isGlobalSandboxMode,
            onSandboxToggle: (val) => setState(() => _isGlobalSandboxMode = val),
          ),
          
          const SizedBox(height: 24),
          const Divider(height: 1, color: Color(0xFFE2E8F0)),
          const SizedBox(height: 24),

          // ==========================================
          // 2. THE PLATFORM TAB NAVIGATION
          // ==========================================
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: List.generate(_platforms.length, (index) {
                bool isActive = _activeTabIndex == index;
                bool isLocked = index == 3;
                return GestureDetector(
                  onTap: isLocked ? null : () => setState(() => _activeTabIndex = index),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.only(right: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    decoration: BoxDecoration(
                      color: isActive ? const Color(0xFF0F172A) : (isLocked ? const Color(0xFFF1F5F9) : Colors.white),
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(color: isActive ? const Color(0xFF0F172A) : const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      children: [
                        if (isLocked) 
                          const Icon(Icons.lock_outline, size: 14, color: Color(0xFF94A3B8)) 
                        else 
                          Icon(isActive ? Icons.hub : Icons.api, size: 14, color: isActive ? const Color(0xFF8FFF00) : const Color(0xFF64748B)),
                        const SizedBox(width: 8),
                        Text(_platforms[index], style: TextStyle(color: isActive ? Colors.white : (isLocked ? const Color(0xFF94A3B8) : const Color(0xFF64748B)), fontWeight: FontWeight.bold, fontSize: 13)),
                      ],
                    ),
                  ),
                );
              }),
            ),
          ),
          const SizedBox(height: 30),

          // ==========================================
          // 3. DYNAMIC TAB CONTENT (The Router)
          // ==========================================
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            child: _buildActivePlatformContent(),
          ),
          
          const SizedBox(height: 40),

          // ==========================================
          // 4. MASTER SAVE BUTTON
          // ==========================================
          Align(
            alignment: Alignment.centerRight,
            child: SizedBox(
              height: 48,
              width: 240,
              child: ElevatedButton.icon(
                onPressed: _isSavingAll ? null : _saveAllToVault,
                icon: _isSavingAll 
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.shield_outlined, size: 18, color: Colors.white),
                label: Text(_isSavingAll ? "Encrypting..." : "Commit Global Changes", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F172A),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  elevation: 0,
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  // ==========================================
  // PLATFORM CONTENT ROUTER
  // ==========================================
  // 🚀 Look how clean this is now! It just calls the isolated files.
  Widget _buildActivePlatformContent() {
    switch (_activeTabIndex) {
      case 0: return const EbayConfigView(key: ValueKey("ebay"));
      case 1: return const AliExpressConfigView(key: ValueKey("aliexpress"));
      case 2: return const AiConfigView(key: ValueKey("ai"));
      default: return const SizedBox.shrink();
    }
  }
}