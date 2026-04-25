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
  
  // ✨ Avatar & Gender State Variables
  String? _avatarUrl;
  String _userGender = "unspecified"; 
  bool _isUploadingImage = false;

  bool _isEditing = false;
  bool _isLoading = false; 

  @override
  void initState() {
    super.initState();
    _notesController = TextEditingController();

    final user = Supabase.instance.client.auth.currentUser;
    final String rawName = user?.userMetadata?['full_name']?.toString() ?? "Reaz Uddin";
    final String rawEmail = user?.email ?? "xceptionalriaz@gmail.com";
    
    // Load existing metadata
    _avatarUrl = user?.userMetadata?['avatar_url']?.toString();
    _userGender = user?.userMetadata?['gender']?.toString() ?? "unspecified";

    _userName = rawName;
    _userEmail = rawEmail;
    _userInitial = rawName.isNotEmpty ? rawName[0].toUpperCase() : "S";

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

  // ✨ UPGRADED: Smart Avatar Logic (Professional Neutral Faces)
  String _getSmartAvatarUrl() {
    final user = Supabase.instance.client.auth.currentUser;
    
    // 1. Manual Upload (Highest Priority)
    if (_avatarUrl != null && _avatarUrl!.isNotEmpty) {
      return _avatarUrl!;
    }

    // 2. Google Account Photo
    final googlePhoto = user?.userMetadata?['picture'];
    if (googlePhoto != null) {
      return googlePhoto.toString();
    }

    // 3. DiceBear Automatic Avatars
    final String seed = user?.email ?? "default";
    
    if (_userGender == 'male') {
      // ✨ FIX: "adventurer-neutral" removes angry/weird expressions!
      return "https://api.dicebear.com/9.x/adventurer-neutral/png?seed=${seed}male&backgroundColor=b6e3f4";
    } else if (_userGender == 'female') {
      // Lorelei style creates beautiful, calm female faces
      return "https://api.dicebear.com/9.x/lorelei/png?seed=${seed}female&backgroundColor=ffdfbf";
    }

    // Default Neutral Initials
    return "https://api.dicebear.com/9.x/initials/png?seed=$seed&backgroundColor=0f172a,8fff00";
  }

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

      final fileExt = image.path.split('.').last;
      final fileName = '${user.id}-${DateTime.now().millisecondsSinceEpoch}.$fileExt';
      final filePath = 'public/$fileName';

      await Supabase.instance.client.storage.from('avatars').uploadBinary(
            filePath,
            bytes,
            fileOptions: FileOptions(contentType: 'image/$fileExt'),
          );
      
      final String imageUrl = Supabase.instance.client.storage.from('avatars').getPublicUrl(filePath);
      
      await Supabase.instance.client.auth.updateUser(
        UserAttributes(data: {'avatar_url': imageUrl}),
      );
      
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
      await Supabase.instance.client.auth.updateUser(
        UserAttributes(data: {
          'full_name': _nameController.text,
          'gender': _userGender, 
          'avatar_url': _avatarUrl, 
        }),
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
          child: Column(
            children: [
              GestureDetector(
                onTap: _isUploadingImage ? null : _pickAndUploadImage,
                child: MouseRegion(
                  cursor: SystemMouseCursors.click,
                  child: Stack(
                    alignment: Alignment.bottomRight,
                    children: [
                      ClipRRect(
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
              const SizedBox(height: 8),
              
              if (_avatarUrl != null && _avatarUrl!.isNotEmpty)
                TextButton.icon(
                  onPressed: () {
                    setState(() => _avatarUrl = null); 
                  },
                  icon: const Icon(Icons.delete_outline, size: 16, color: Colors.redAccent),
                  label: const Text("Remove Custom Photo", style: TextStyle(color: Colors.redAccent, fontSize: 12)),
                ),
            ],
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
                _buildGenderDropdown(), // ✨ UPDATED GENDER DROPDOWN
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
                    Expanded(child: _buildInputField("Legal Business Name", _businessController, Icons.business_outlined)),
                    const SizedBox(width: 16),
                    Expanded(child: _buildGenderDropdown()), // ✨ UPDATED GENDER DROPDOWN
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
  
  // ✨ UPGRADED: Clean "Gender" Dropdown
  Widget _buildGenderDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Gender", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B), fontSize: 12)),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: Colors.grey.shade300),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _userGender.isEmpty ? 'unspecified' : _userGender,
              isExpanded: true,
              icon: const Icon(Icons.arrow_drop_down, color: Colors.grey),
              style: const TextStyle(color: Colors.black, fontSize: 14),
              items: const [
                DropdownMenuItem(value: 'unspecified', child: Text("Prefer not to say")),
                DropdownMenuItem(value: 'male', child: Text("Male")),
                DropdownMenuItem(value: 'female', child: Text("Female")),
              ],
              onChanged: (String? newValue) {
                if (newValue != null) {
                  setState(() => _userGender = newValue);
                }
              },
            ),
          ),
        ),
      ],
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