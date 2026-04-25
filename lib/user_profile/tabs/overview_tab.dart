import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:image_picker/image_picker.dart'; 

class OverviewTab extends StatefulWidget {
  const OverviewTab({super.key});

  @override
  State<OverviewTab> createState() => _OverviewTabState();
}

class _OverviewTabState extends State<OverviewTab> {
  late TextEditingController _notesController;
  
  // Edit Form Controllers
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _businessController;

  String _userName = "Seller";
  String _userEmail = "";
  String _userInitial = "S";
  
  // ✨ New Avatar State Variables
  String? _avatarUrl;
  bool _isUploadingImage = false;

  bool _isEditing = false;
  bool _isLoading = false; 

  @override
  void initState() {
    super.initState();
    _notesController = TextEditingController();

    // Pulling REAL data from your Supabase backend
    final user = Supabase.instance.client.auth.currentUser;
    final String rawName = user?.userMetadata?['full_name']?.toString() ?? "Reaz Uddin";
    final String rawEmail = user?.email ?? "xceptionalriaz@gmail.com";
    
    // Check if they already have an avatar saved in the database
    _avatarUrl = user?.userMetadata?['avatar_url']?.toString();

    _userName = rawName;
    _userEmail = rawEmail;
    _userInitial = rawName.isNotEmpty ? rawName[0].toUpperCase() : "S";

    // Initialize Form Controllers with current data
    _nameController = TextEditingController(text: _userName);
    _emailController = TextEditingController(text: _userEmail);
    _businessController = TextEditingController(text: "Reazify LLC"); 
  }

  @override
  void dispose() {
    _notesController.dispose();
    _nameController.dispose();
    _emailController.dispose();
    _businessController.dispose();
    super.dispose();
  }

  // ✨ THE ACTIVE IMAGE UPLOAD LOGIC
  Future<void> _pickAndUploadImage() async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    final picker = ImagePicker();
    final XFile? image = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 512, 
      imageQuality: 85,
    );
    
    if (image == null) return;

    setState(() => _isUploadingImage = true);

    try {
      final bytes = await image.readAsBytes();
      
      // 2MB Size Guard
      final int fileBytes = bytes.length;
      final double fileSizeInMB = fileBytes / (1024 * 1024);
      
      if (fileSizeInMB > 2.0) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("⚠️ Image too large! Please select a file under 2MB."), backgroundColor: Colors.redAccent)
          );
        }
        setState(() => _isUploadingImage = false);
        return; 
      }

      // ✨ SUPABASE SAVE OPERATION 
      final fileExt = image.path.split('.').last;
      final fileName = '${user.id}-${DateTime.now().millisecondsSinceEpoch}.$fileExt';
      final filePath = 'public/$fileName';

      // 1. Upload to the 'avatars' bucket
      await Supabase.instance.client.storage.from('avatars').uploadBinary(
            filePath,
            bytes,
            fileOptions: FileOptions(contentType: 'image/$fileExt'),
          );
      
      // 2. Get the Public URL
      final String imageUrl = Supabase.instance.client.storage.from('avatars').getPublicUrl(filePath);
      
      // 3. Update User Metadata permanently
      await Supabase.instance.client.auth.updateUser(
        UserAttributes(data: {'avatar_url': imageUrl}),
      );
      
      // 4. Update UI
      setState(() => _avatarUrl = imageUrl);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Success! Profile picture saved."), backgroundColor: Color(0xFF16A34A)));
      }

    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e"), backgroundColor: Colors.redAccent));
      }
    } finally {
      if (mounted) setState(() => _isUploadingImage = false);
    }
  }

  Future<void> _saveProfileData() async {
    setState(() => _isLoading = true);
    
    try {
      // Save name to Supabase
      await Supabase.instance.client.auth.updateUser(
        UserAttributes(data: {'full_name': _nameController.text}),
      );

      setState(() {
        _userName = _nameController.text;
        _userInitial = _userName.isNotEmpty ? _userName[0].toUpperCase() : "S";
        _isEditing = false;
        _isLoading = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Profile Updated Successfully!"), backgroundColor: Color(0xFF0F172A))
        );
      }
    } catch(e) {
       setState(() => _isLoading = false);
       if (mounted) {
         ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
       }
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
                    _buildStatColumn("Market Scans", "84 / 100", Icons.search),
                    _buildStatColumn("Saved Products", "12", Icons.bookmark),
                    _buildStatColumn("Tracked Sellers", "3", Icons.storefront),
                    _buildStatColumn("Safe Sourcing", "98%", Icons.shield),
                  ],
                ),
              ],
            )
          ),

          const SizedBox(height: 24),

          _buildContentCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Private Notes / Global Blocklist", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                const SizedBox(height: 16),
                TextField(
                  controller: _notesController,
                  maxLines: 3,
                  decoration: InputDecoration(
                    hintText: "Add keywords you always want to block (e.g., Apple, Nike)...",
                    hintStyle: const TextStyle(color: Colors.grey, fontSize: 13),
                    filled: true,
                    fillColor: const Color(0xFFF8FAFC),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                  ),
                ),
              ],
            )
          )
        ]
      ],
    );
  }

  // =========================================================
  // VIEW STATE
  // =========================================================
  Widget _buildViewState() {
    final bool isMobile = MediaQuery.of(context).size.width < 600;
    
    return Column(
      key: const ValueKey('view'),
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ✨ AVATAR (View Mode)
            CircleAvatar(
              radius: isMobile ? 30 : 40,
              backgroundColor: const Color(0xFFE2E8F0),
              backgroundImage: _avatarUrl != null ? NetworkImage(_avatarUrl!) : null,
              child: _avatarUrl == null 
                  ? Text(_userInitial, style: TextStyle(fontSize: isMobile ? 24 : 32, fontWeight: FontWeight.w900, color: const Color(0xFF0F172A)))
                  : null, 
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
                        children: const [
                          Icon(Icons.cake, color: Colors.grey, size: 14),
                          SizedBox(width: 4),
                          Text("Joined Apr 2024", style: TextStyle(color: Colors.grey, fontSize: 12)),
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

  // =========================================================
  // EDIT STATE
  // =========================================================
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
        
        // ✨ INTERACTIVE AVATAR UPLOAD (Edit Mode)
        Center(
          child: GestureDetector(
            onTap: _isUploadingImage ? null : _pickAndUploadImage,
            child: MouseRegion(
              cursor: SystemMouseCursors.click,
              child: Stack(
                alignment: Alignment.bottomRight,
                children: [
                  CircleAvatar(
                    radius: 45,
                    backgroundColor: const Color(0xFFE2E8F0),
                    backgroundImage: _avatarUrl != null ? NetworkImage(_avatarUrl!) : null,
                    child: _avatarUrl == null 
                        ? Text(_userInitial, style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)))
                        : null,
                  ),
                  if (_isUploadingImage)
                    const Positioned(
                      bottom: 0, right: 0,
                      child: CircleAvatar(radius: 16, backgroundColor: Colors.white, child: Padding(padding: EdgeInsets.all(4.0), child: CircularProgressIndicator(color: Color(0xFF8FFF00), strokeWidth: 3)))
                    )
                  else
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF8FFF00),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 3),
                        boxShadow: [BoxShadow(color: Colors.black.withAlpha(20), blurRadius: 5)]
                      ),
                      child: const Icon(Icons.camera_alt, size: 16, color: Colors.black),
                    ),
                ],
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
              ],
            )
          : Row(
              children: [
                Expanded(child: _buildInputField("Full Name", _nameController, Icons.person_outline)),
                const SizedBox(width: 16),
                Expanded(child: _buildInputField("Email Address", _emailController, Icons.email_outlined, isReadOnly: true)),
                const SizedBox(width: 16),
                Expanded(child: _buildInputField("Legal Business Name", _businessController, Icons.business_outlined)),
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

  Widget _buildConnectEbayBtn() {
    return ElevatedButton.icon(
      onPressed: () {},
      icon: const Icon(Icons.shopping_cart_checkout, size: 16, color: Colors.black),
      label: const Text("Connect eBay", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 13)),
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF8FFF00),
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