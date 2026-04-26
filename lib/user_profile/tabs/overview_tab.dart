import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart'; // ✨ NEW: Needed for eBay Login

class OverviewTab extends StatefulWidget {
  const OverviewTab({super.key});

  @override
  State<OverviewTab> createState() => _OverviewTabState();
}

class _OverviewTabState extends State<OverviewTab> {
  // Edit Form Controllers
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _businessController;

  String _userName = "Seller";
  String _userEmail = "";
  String _userInitial = "S";
  String _joinedDate = "Joined Recently"; 
  
  // ✨ Avatar & Gender State
  String _userGender = "unspecified"; 

  // ✨ Analytics State
  int _scansUsed = 84;
  int _scansLimit = 100;
  int _savedProductsCount = 12;
  int _trackedSellersCount = 3;
  String _safeSourcingScore = "98%";

  // ✨ UI & eBay States
  bool _isEditing = false;
  bool _isLoading = false; 
  bool _isEbayConnected = false; 
  bool _isConnectingEbay = false;
  String _ebayStoreName = "Reaz_Tech_Store"; // Will fetch from DB later

  @override
  void initState() {
    super.initState();
    final user = Supabase.instance.client.auth.currentUser;

    final String rawName = user?.userMetadata?['full_name']?.toString() ?? "";
    final String rawEmail = user?.email ?? "";
    final String rawBusiness = user?.userMetadata?['business_name']?.toString() ?? "";
    
    _userGender = user?.userMetadata?['gender']?.toString() ?? "unspecified";

    _userName = rawName.isEmpty ? "Seller" : rawName;
    _userEmail = rawEmail;
    _userInitial = _userName[0].toUpperCase();
    
    _joinedDate = _formatDate(user?.createdAt);

    _nameController = TextEditingController(text: rawName);
    _emailController = TextEditingController(text: rawEmail);
    _businessController = TextEditingController(text: rawBusiness); 
    
    _loadAnalyticsData(); 
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _businessController.dispose();
    super.dispose();
  }

  String _formatDate(String? isoDate) {
    if (isoDate == null) return "Joined Recently";
    try {
      final date = DateTime.parse(isoDate);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return "Joined ${months[date.month - 1]} ${date.year}";
    } catch (e) {
      return "Joined Recently";
    }
  }

  Future<void> _loadAnalyticsData() async {
    // NOTE: When your tables are ready, you will query them here!
  }

  String _getSmartAvatarUrl() {
    final user = Supabase.instance.client.auth.currentUser;
    
    final googlePhoto = user?.userMetadata?['picture'];
    if (googlePhoto != null) {
      return googlePhoto.toString();
    }

    final String seed = user?.email ?? "default";
    
    if (_userGender == 'male') {
      return "https://api.dicebear.com/9.x/adventurer-neutral/png?seed=${seed}male&backgroundColor=b6e3f4";
    } else if (_userGender == 'female') {
      return "https://api.dicebear.com/9.x/lorelei/png?seed=${seed}female&backgroundColor=ffdfbf";
    }

    return "https://api.dicebear.com/9.x/initials/png?seed=$seed&backgroundColor=0f172a,8fff00";
  }

  Future<void> _saveProfileData() async {
    setState(() => _isLoading = true);
    
    try {
      await Supabase.instance.client.auth.updateUser(
        UserAttributes(data: {
          'full_name': _nameController.text,
          'business_name': _businessController.text, 
          'gender': _userGender, 
        }),
      );

      setState(() {
        _userName = _nameController.text;
        _userInitial = _userName.isNotEmpty ? _userName[0].toUpperCase() : "S";
        _isEditing = false;
        _isLoading = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Profile Updated Successfully!"), backgroundColor: Color(0xFF0F172A)));
      }
    } catch(e) {
       setState(() => _isLoading = false);
       if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e"), backgroundColor: Colors.redAccent));
    }
  }

  // ✨ THE LIVE EBAY OAUTH LOGIN FUNCTION
  Future<void> _startEbayOAuth() async {
    setState(() => _isConnectingEbay = true);

    try {
      // 1. Fetch your App ID from your 'api_fleet_config' table
      final vaultData = await Supabase.instance.client
          .from('api_fleet_config') 
          .select('primary_key_1') 
          .eq('platform_name', 'ebay') 
          .single(); 

      final String appId = vaultData['primary_key_1'];

      // 🏆 YOUR OFFICIAL GENERATED RUNAME
      const String ruName = "Reazify_LLC-ReazifyL-Seller-qpmttkudp"; 

      if (appId.isEmpty || appId == 'EMPTY') {
        throw "eBay App ID is missing in your Admin Vault.";
      }

      final String userId = Supabase.instance.client.auth.currentUser!.id; // ✨ Get the user's ID

      final Uri ebayAuthUrl = Uri.parse(
        'https://auth.ebay.com/oauth2/authorize'
        '?client_id=$appId'
        '&response_type=code'
        '&redirect_uri=$ruName'
        '&scope=https://api.ebay.com/oauth/api_scope/sell.account.readonly '
        'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly '
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly'
        '&state=$userId' // ✨ THE NAMETAG! We pass their Supabase ID to eBay
      );

      // 3. Launch the official eBay Sign-in Page
      if (await canLaunchUrl(ebayAuthUrl)) {
        await launchUrl(
          ebayAuthUrl, 
          mode: LaunchMode.externalApplication,
        );
      } else {
        throw "Could not open the browser. Please check your internet connection.";
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Connection Error: $e"), 
            backgroundColor: Colors.redAccent
          )
        );
      }
    } finally {
      if (mounted) setState(() => _isConnectingEbay = false); 
    }
  }
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildContentCard(
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            child: _isEditing ? _buildEditState() : _buildViewState(),
          ),
        ),

        if (!_isEditing) ...[
          const SizedBox(height: 24),
          
          _buildContentCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Usage & Analytics", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                const SizedBox(height: 20),
                Wrap(
                  spacing: 24,
                  runSpacing: 24,
                  children: [
                    _buildStatColumn("Market Scans", "$_scansUsed / $_scansLimit", Icons.search),
                    _buildStatColumn("Saved Products", "$_savedProductsCount", Icons.bookmark),
                    _buildStatColumn("Tracked Sellers", "$_trackedSellersCount", Icons.storefront),
                    _buildStatColumn("Safe Sourcing", _safeSourcingScore, Icons.shield),
                  ],
                ),
              ],
            )
          ),
        ]
      ],
    );
  }

  Widget _buildViewState() {
    final bool isMobile = MediaQuery.of(context).size.width < 600;
    
    return Column(
      key: const ValueKey('view'),
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(isMobile ? 30 : 40),
              child: Container(
                width: isMobile ? 60 : 80,
                height: isMobile ? 60 : 80,
                color: const Color(0xFFE2E8F0), 
                child: Image.network(
                  _getSmartAvatarUrl(),
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Center(
                    child: Text(_userInitial, style: TextStyle(fontSize: isMobile ? 24 : 32, fontWeight: FontWeight.w900, color: const Color(0xFF0F172A)))
                  ),
                ),
              ),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(_userName, style: TextStyle(fontSize: isMobile ? 20 : 24, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A))),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 12,
                    runSpacing: 8,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(Icons.star, color: Colors.amber, size: 16),
                          SizedBox(width: 4),
                          Text("Pro Member", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF64748B), fontSize: 12)),
                        ],
                      ),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.cake, color: Colors.grey, size: 14),
                          const SizedBox(width: 4),
                          Text(_joinedDate, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                        decoration: BoxDecoration(color: const Color(0xFFEBF6D4), borderRadius: BorderRadius.circular(4)),
                        child: const Text("Active Sub", style: TextStyle(color: Color(0xFF16A34A), fontSize: 10, fontWeight: FontWeight.bold)),
                      )
                    ],
                  )
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        isMobile ? 
          Column(
            children: [
              SizedBox(width: double.infinity, child: _buildEditProfileBtn()),
              const SizedBox(height: 12),
              SizedBox(width: double.infinity, child: _buildConnectEbayBtn()),
            ],
          ) 
        : Row(
            children: [
              Expanded(child: _buildEditProfileBtn()),
              const SizedBox(width: 16),
              Expanded(child: _buildConnectEbayBtn()),
            ],
          )
      ],
    );
  }

  Widget _buildEditState() {
    final bool isMobile = MediaQuery.of(context).size.width < 600;
    
    return Column(
      key: const ValueKey('edit'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Row(
          children: [
            Icon(Icons.manage_accounts, color: Color(0xFF0F172A), size: 24),
            SizedBox(width: 10),
            Text("Edit Business Profile", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
          ],
        ),
        const SizedBox(height: 24),
        
        Center(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(45),
            child: Container(
              width: 90,
              height: 90,
              color: const Color(0xFFE2E8F0), 
              child: Image.network(
                _getSmartAvatarUrl(),
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Center(
                  child: Text(_userInitial, style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)))
                ),
              ),
            ),
          ),
        ),
        
        const SizedBox(height: 30),
        
        isMobile 
          ? Column(
              children: [
                _buildInputField("Full Name", _nameController, Icons.person_outline),
                const SizedBox(height: 16),
                _buildInputField("Email Address", _emailController, Icons.email_outlined, isReadOnly: true),
                const SizedBox(height: 16),
                _buildInputField("Legal Business Name", _businessController, Icons.business_outlined),
                const SizedBox(height: 16),
                _buildGenderDropdown(),
              ],
            )
          : Column(
              children: [
                Row(
                  children: [
                    Expanded(child: _buildInputField("Full Name", _nameController, Icons.person_outline)),
                    const SizedBox(width: 16),
                    Expanded(child: _buildInputField("Email Address", _emailController, Icons.email_outlined, isReadOnly: true)),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(flex: 2, child: _buildInputField("Legal Business Name", _businessController, Icons.business_outlined)),
                    const SizedBox(width: 16),
                    Expanded(flex: 1, child: _buildGenderDropdown()), 
                  ],
                ),
              ],
            ),
            
        const SizedBox(height: 24),
        
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            TextButton(
              onPressed: () {
                setState(() {
                  _nameController.text = _userName;
                  final user = Supabase.instance.client.auth.currentUser;
                  _userGender = user?.userMetadata?['gender']?.toString() ?? "unspecified";
                  _businessController.text = user?.userMetadata?['business_name']?.toString() ?? "";
                  _isEditing = false;
                });
              },
              style: TextButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14)),
              child: const Text("Cancel", style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(width: 12),
            ElevatedButton(
              onPressed: _isLoading ? null : _saveProfileData,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0F172A),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))
              ),
              child: _isLoading 
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text("Save Changes", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        )
      ],
    );
  }

  // =========================================================
  // HELPER WIDGETS
  // =========================================================
  
  Widget _buildGenderDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Gender", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B), fontSize: 12)),
        const SizedBox(height: 8),
        LayoutBuilder(
          builder: (context, constraints) {
            return Theme(
              data: Theme.of(context).copyWith(
                splashColor: Colors.transparent,
                highlightColor: Colors.transparent,
                hoverColor: Colors.transparent,
              ),
              child: PopupMenuButton<String>(
                position: PopupMenuPosition.under,
                offset: const Offset(0, 8),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(color: Colors.grey.shade200),
                ),
                color: Colors.white,
                elevation: 6,
                constraints: BoxConstraints(
                  minWidth: constraints.maxWidth,
                  maxWidth: constraints.maxWidth,
                ),
                onSelected: (String newValue) {
                  setState(() => _userGender = newValue);
                },
                itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
                  _buildPopupMenuItem('unspecified', 'Prefer not to say'),
                  _buildPopupMenuItem('male', 'Male'),
                  _buildPopupMenuItem('female', 'Female'),
                ],
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _userGender == 'male' ? 'Male' : _userGender == 'female' ? 'Female' : 'Prefer not to say',
                        style: const TextStyle(color: Colors.black, fontSize: 14),
                      ),
                      const Icon(Icons.keyboard_arrow_down, color: Color(0xFF94A3B8), size: 20),
                    ],
                  ),
                ),
              ),
            );
          }
        ),
      ],
    );
  }

  PopupMenuItem<String> _buildPopupMenuItem(String value, String text) {
    final isSelected = _userGender == value;
    
    return PopupMenuItem<String>(
      value: value,
      height: 40, 
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2), 
      child: StatefulBuilder(
        builder: (context, setItemState) {
          bool isHovered = false;
          return MouseRegion(
            onEnter: (_) => setItemState(() => isHovered = true),
            onExit: (_) => setItemState(() => isHovered = false),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10), 
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF8FFF00) : Colors.transparent,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isHovered && !isSelected ? const Color(0xFF8FFF00) : Colors.transparent,
                  width: 1.5,
                ),
              ),
              child: Text(
                text,
                style: TextStyle(
                  color: isSelected ? Colors.black : const Color(0xFF1E293B),
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  fontSize: 13,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildInputField(String label, TextEditingController controller, IconData icon, {bool isReadOnly = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B), fontSize: 12)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          readOnly: isReadOnly,
          style: TextStyle(color: isReadOnly ? Colors.grey.shade600 : Colors.black, fontSize: 14),
          decoration: InputDecoration(
            prefixIcon: Icon(icon, size: 18, color: Colors.grey.shade500),
            filled: true,
            fillColor: isReadOnly ? Colors.grey.shade100 : const Color(0xFFF8FAFC),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.grey.shade300)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.grey.shade300)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF0F172A), width: 1.5)),
          ),
        )
      ],
    );
  }

  Widget _buildEditProfileBtn() {
    return OutlinedButton.icon(
      onPressed: () => setState(() => _isEditing = true),
      icon: const Icon(Icons.edit, size: 16, color: Color(0xFF0F172A)),
      label: const Text("Edit Profile", style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 13)),
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(vertical: 14),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))
      ),
    );
  }

  // ✨ THE SMART EBAY BUTTON WITH ALL 3 STATES
  Widget _buildConnectEbayBtn() {
    if (_isEbayConnected) {
      return OutlinedButton.icon(
        onPressed: () => setState(() => _isEbayConnected = false), // Let them disconnect for testing
        icon: const Icon(Icons.check_circle, color: Color(0xFF16A34A), size: 16),
        label: Text("Connected: $_ebayStoreName", style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 13)),
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 14),
          backgroundColor: const Color(0xFFEBF6D4),
          side: const BorderSide(color: Color(0xFF16A34A), width: 1.5),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))
        ),
      );
    }

    return ElevatedButton.icon(
      onPressed: _isConnectingEbay ? null : _startEbayOAuth,
      icon: _isConnectingEbay 
        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2))
        : const Icon(Icons.shopping_cart_checkout, size: 16, color: Colors.black),
      label: Text(_isConnectingEbay ? "Connecting..." : "Connect eBay", style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13)),
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF8FFF00),
        disabledBackgroundColor: const Color(0xFF8FFF00).withAlpha(150),
        padding: const EdgeInsets.symmetric(vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        elevation: 0,
      ),
    );
  }

  Widget _buildContentCard({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: child,
    );
  }

  Widget _buildStatColumn(String label, String value, IconData icon) {
    return SizedBox(
      width: 130, 
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 14, color: Colors.grey),
              const SizedBox(width: 6),
              Expanded(child: Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.w600), overflow: TextOverflow.ellipsis)),
            ],
          ),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
        ],
      ),
    );
  }
}