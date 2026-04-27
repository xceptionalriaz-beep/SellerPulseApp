import 'package:flutter/material.dart';
import '../../services/ebay_service.dart';

// ✨ UPGRADE: We add WidgetsBindingObserver to detect when the pop-up closes
class EbayManagerTab extends StatefulWidget {
  const EbayManagerTab({super.key});

  @override
  State<EbayManagerTab> createState() => _EbayManagerTabState();
}

class _EbayManagerTabState extends State<EbayManagerTab> with WidgetsBindingObserver {
  bool _isLoading = true;
  bool _isEbayConnected = false;
  bool _isConnectingEbay = false;
  
  String _ebayStoreName = "eBay Account";
  String _feedbackScore = "100%"; 
  String _activeListings = "Syncing..."; 

  @override
  void initState() {
    super.initState();
    // Start listening to the app lifecycle (detecting when they return from the pop-up)
    WidgetsBinding.instance.addObserver(this);
    _checkEbayConnection();
  }

  @override
  void dispose() {
    // Stop listening when the page closes
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  // ✨ THE MAGIC DETECTOR: This fires automatically when the user closes the eBay pop-up
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      // If the user just came back to the app, check the database instantly!
      if (!_isEbayConnected) {
        _checkEbayConnection();
      }
    }
  }

  Future<void> _checkEbayConnection() async {
    try {
      final data = await EbayService.checkConnection();

      if (mounted) {
        setState(() {
          _isEbayConnected = data != null;
          
          if (_isEbayConnected && data?['ebay_user_id'] != null) {
            _ebayStoreName = data!['ebay_user_id'];
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint("Error checking eBay connection: $e");
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _disconnectEbay() async {
    setState(() => _isLoading = true);
    try {
      await EbayService.disconnect();
      if (mounted) {
        setState(() {
          _isEbayConnected = false;
          _ebayStoreName = "eBay Account";
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("eBay Account Disconnected"), backgroundColor: Colors.orange),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Failed to disconnect"), backgroundColor: Colors.redAccent),
        );
      }
    }
  }

  Future<void> _startEbayOAuth() async {
    setState(() => _isConnectingEbay = true);
    try {
      await EbayService.connectEbay(); 
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(e.toString()), backgroundColor: Colors.redAccent));
      }
    } finally {
      if (mounted) setState(() => _isConnectingEbay = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF0F172A)));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Marketplace Integrations",
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
        ),
        const SizedBox(height: 8),
        const Text(
          "Connect your sales channels to unlock AI velocity and deep inventory insights.",
          style: TextStyle(fontSize: 14, color: Colors.grey),
        ),
        const SizedBox(height: 24),
        
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 400),
          child: _isEbayConnected ? _buildConnectedCard() : _buildInvitationCard(),
        ),
      ],
    );
  }

  // 🔴 STATE: NOT CONNECTED
  Widget _buildInvitationCard() {
    return Container(
      key: const ValueKey('not_connected'),
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.shopping_bag_outlined, color: Color(0xFF0F172A), size: 28),
              ),
              const SizedBox(width: 16),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("eBay Seller Account", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                    Text("Unlock omnichannel data", style: TextStyle(fontSize: 13, color: Colors.grey)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          _buildFeatureRow(Icons.auto_graph, "Real-time AI sales velocity calculations"),
          const SizedBox(height: 12),
          _buildFeatureRow(Icons.inventory_2_outlined, "Sync and monitor active listings"),
          const SizedBox(height: 12),
          _buildFeatureRow(Icons.security, "100% secure read-only OAuth connection"),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isConnectingEbay ? null : _startEbayOAuth,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF8FFF00),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
              child: _isConnectingEbay
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2))
                  : const Text("Connect eBay Store", style: TextStyle(color: Colors.black, fontSize: 15, fontWeight: FontWeight.bold)),
            ),
          )
        ],
      ),
    );
  }

  // 🟢 STATE: CONNECTED (PREMIUM CARD)
  Widget _buildConnectedCard() {
    return Container(
      key: const ValueKey('connected'),
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: const Color(0xFF8FFF00).withAlpha(30), blurRadius: 20, offset: const Offset(0, 8))
        ],
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFF8FFF00), width: 2),
                ),
                child: const CircleAvatar(
                  radius: 24,
                  backgroundColor: Colors.white,
                  child: Icon(Icons.storefront, color: Color(0xFF0F172A), size: 28),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(_ebayStoreName, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
                        const SizedBox(width: 8),
                        const Icon(Icons.verified, color: Colors.blue, size: 18),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 14),
                        const SizedBox(width: 4),
                        Text("$_feedbackScore Positive Feedback", style: TextStyle(fontSize: 13, color: Colors.grey.shade300)),
                      ],
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF8FFF00).withAlpha(20),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF8FFF00).withAlpha(100)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Icon(Icons.circle, color: Color(0xFF8FFF00), size: 10),
                    SizedBox(width: 6),
                    Text("Live Sync", style: TextStyle(color: Color(0xFF8FFF00), fontSize: 12, fontWeight: FontWeight.bold)),
                  ],
                ),
              )
            ],
          ),
          const SizedBox(height: 24),
          const Divider(color: Colors.white24),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Active Listings", style: TextStyle(color: Colors.grey, fontSize: 12)),
                  const SizedBox(height: 4),
                  Text(_activeListings, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                ],
              ),
              OutlinedButton.icon(
                onPressed: _disconnectEbay,
                icon: const Icon(Icons.link_off, size: 16, color: Colors.white70),
                label: const Text("Disconnect", style: TextStyle(color: Colors.white70)),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.white24),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              )
            ],
          )
        ],
      ),
    );
  }

  Widget _buildFeatureRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 18, color: const Color(0xFF16A34A)),
        const SizedBox(width: 12),
        Text(text, style: const TextStyle(fontSize: 14, color: Color(0xFF334155), fontWeight: FontWeight.w500)),
      ],
    );
  }
}