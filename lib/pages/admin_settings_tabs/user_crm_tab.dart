import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // Required for copying password to clipboard
import 'dart:math';

import '../../../services/crm_service.dart';

import 'crm_widgets/admin_hud_section.dart';
import 'crm_widgets/admin_controls_bar.dart';
import 'crm_widgets/admin_user_table.dart';

class UserCrmTab extends StatefulWidget {
  final bool isInvestorMode;

  const UserCrmTab({super.key, required this.isInvestorMode});

  @override
  State<UserCrmTab> createState() => _UserCrmTabState();
}

class _UserCrmTabState extends State<UserCrmTab> {
  String _searchQuery = "";
  String _selectedFilter = "All";

  // ✨ THE MEMORY BANK
  List<Map<String, dynamic>> _allUsers = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUsers(); // Fetch the data exactly once when the tab opens
  }

  // ✨ THE ENTERPRISE DATABSE FETCH
  Future<void> _loadUsers() async {
    setState(() => _isLoading = true);
    final users = await CrmService.fetchAllUsers();
    if (mounted) {
      setState(() {
        _allUsers = users;
        _isLoading = false;
      });
    }
  }

  // ✨ OPTIMISTIC UI: Instantly updates the screen without waiting for the database!
  void _updateUserLocally(String userId, String field, dynamic newValue) {
    setState(() {
      final index = _allUsers.indexWhere((u) => u['id'] == userId);
      if (index != -1) {
        _allUsers[index][field] = newValue;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    // Show a clean loader while the memory bank fills up
    if (_isLoading) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(60.0),
          child: CircularProgressIndicator(color: Color(0xFF0F172A)),
        ),
      );
    }

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.only(bottom: 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // 1. The 4 Top Cards
          AdminHudSection(allUsers: _allUsers),
          
          const SizedBox(height: 24),
          
          // 2. The Search, Filters, and "Add New User" button
          AdminControlsBar(
            allUsers: _allUsers, // ✨ Pass memory to the badges
            onSearch: (query) {
              setState(() {
                _searchQuery = query;
              });
            },
            onAddUser: () => _showAddUserDialog(context),
            selectedFilter: _selectedFilter,
            onFilterChanged: (newFilter) {
              setState(() {
                _selectedFilter = newFilter;
              });
            },
            onRefresh: _loadUsers,
          ),
          
          const SizedBox(height: 16),
          
          // 3. The Main Live Database Table
          AdminUserTable(
            allUsers: _allUsers, // ✨ Pass memory to the table
            isInvestorMode: widget.isInvestorMode,
            searchQuery: _searchQuery,
            selectedFilter: _selectedFilter, 
            onUserUpdated: _updateUserLocally, // ✨ Pass the instant-update superpower!
          ),
        ],
      ),
    );
  }

  // ✨ THE SECURE "ADD USER" MODAL
  void _showAddUserDialog(BuildContext context) {
    final TextEditingController nameController = TextEditingController();
    final TextEditingController emailController = TextEditingController();
    String selectedPlan = 'Free Trial';
    String selectedGender = 'Unspecified'; // Defaults to Capitalized
    bool sendWelcomeEmail = true;
    bool isSubmitting = false;

    // ✨ Email Regex Validator
    bool isValidEmail(String email) {
      return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
    }

    // ✨ Password Generator (e.g., Rea#482)
    String generateTempPassword(String name) {
      final safeName = name.trim().replaceAll(' ', '');
      final prefix = safeName.length >= 3 ? safeName.substring(0, 3) : "User";
      final suffix = Random().nextInt(899) + 100; // Random 3 digit number
      return "$prefix#$suffix";
    }

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            
            // ✨ Live Validation Check
            bool isFormValid = nameController.text.trim().length >= 3 && isValidEmail(emailController.text.trim());

            return Dialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              backgroundColor: Colors.white,
              elevation: 10,
              child: Container(
                width: 450,
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.person_add_alt_1, color: Color(0xFF0F172A), size: 24),
                            SizedBox(width: 10),
                            Text("Add New User", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.grey),
                          onPressed: () => Navigator.pop(dialogContext),
                        )
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Inputs (With Live State Updating)
                    _buildDialogTextField(
                      label: "Full Name", 
                      controller: nameController, 
                      icon: Icons.person_outline,
                      onChanged: (val) => setDialogState(() {}), 
                    ),
                    const SizedBox(height: 16),
                    _buildDialogTextField(
                      label: "Email Address", 
                      controller: emailController, 
                      icon: Icons.email_outlined,
                      onChanged: (val) => setDialogState(() {}), 
                    ),
                    const SizedBox(height: 16),

                    // GENDER DROPDOWN
                    const Text("Select Gender", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B), fontSize: 12)),
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
                              setDialogState(() => selectedGender = newValue);
                            },
                            itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
                              _buildDropdownItem('Unspecified', selectedGender, "Prefer not to say"),
                              _buildDropdownItem('Male', selectedGender, "Male"),
                              _buildDropdownItem('Female', selectedGender, "Female"),
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
                                    selectedGender == 'Male' ? 'Male' : selectedGender == 'Female' ? 'Female' : 'Prefer not to say', 
                                    style: const TextStyle(color: Colors.black, fontSize: 14)
                                  ),
                                  const Icon(Icons.keyboard_arrow_down, color: Color(0xFF94A3B8), size: 20),
                                ],
                              ),
                            ),
                          ),
                        );
                      }
                    ),
                    const SizedBox(height: 16),

                    // Custom Reazify Dropdown for PLAN
                    const Text("Select Initial Plan", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B), fontSize: 12)),
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
                              setDialogState(() => selectedPlan = newValue);
                            },
                            itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
                              _buildDropdownItem('Free Trial', selectedPlan, 'Free Trial'),
                              _buildDropdownItem('Pro Plan', selectedPlan, 'Pro Plan'),
                              _buildDropdownItem('Elite Plan', selectedPlan, 'Elite Plan'),
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
                                  Text(selectedPlan, style: const TextStyle(color: Colors.black, fontSize: 14)),
                                  const Icon(Icons.keyboard_arrow_down, color: Color(0xFF94A3B8), size: 20),
                                ],
                              ),
                            ),
                          ),
                        );
                      }
                    ),
                    const SizedBox(height: 20),

                    // The Welcome Email Toggle
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.forward_to_inbox, color: Color(0xFF64748B), size: 20),
                              const SizedBox(width: 12),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: const [
                                  Text("Send Welcome Email", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A), fontSize: 13)),
                                  Text("Includes an auto-generated password.", style: TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                                ],
                              ),
                            ],
                          ),
                          Switch(
                            value: sendWelcomeEmail,
                            activeColor: const Color(0xFF8FFF00), 
                            activeTrackColor: const Color(0xFF0F172A), 
                            onChanged: (val) => setDialogState(() => sendWelcomeEmail = val),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 30),

                    // Action Buttons
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton(
                          onPressed: () => Navigator.pop(dialogContext),
                          child: const Text("Cancel", style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                        ),
                        const SizedBox(width: 12),
                        ElevatedButton(
                          onPressed: (!isFormValid || isSubmitting) ? null : () async {
                            try {
                              setDialogState(() => isSubmitting = true);
                              final tempPass = generateTempPassword(nameController.text);

                              await CrmService.createNewUser(
                                email: emailController.text.trim(),
                                fullName: nameController.text.trim(),
                                plan: selectedPlan,
                                tempPassword: tempPass,
                                gender: selectedGender, 
                                sendWelcomeEmail: sendWelcomeEmail,
                              );

                              // Refresh the table silently in the background!
                              _loadUsers();

                              if (context.mounted) {
                                Navigator.pop(dialogContext);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Row(
                                      children: [
                                        const Icon(Icons.check_circle, color: Color(0xFF8FFF00)),
                                        const SizedBox(width: 10),
                                        Expanded(
                                          child: Text(
                                            "User Created! Temp Pass: $tempPass", 
                                            style: const TextStyle(fontWeight: FontWeight.bold)
                                          )
                                        ),
                                      ],
                                    ),
                                    backgroundColor: const Color(0xFF0F172A),
                                    duration: const Duration(seconds: 8),
                                    action: SnackBarAction(
                                      label: "COPY PASS",
                                      textColor: const Color(0xFF8FFF00),
                                      onPressed: () {
                                        Clipboard.setData(ClipboardData(text: tempPass));
                                      },
                                    ),
                                  )
                                );
                              }
                            } catch (e) {
                              setDialogState(() => isSubmitting = false);
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text("Failed to create user: $e"),
                                    backgroundColor: Colors.redAccent,
                                  )
                                );
                              }
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isFormValid ? const Color(0xFF8FFF00) : const Color(0xFFE2E8F0),
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))
                          ),
                          child: isSubmitting
                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Color(0xFF0F172A), strokeWidth: 2))
                              : Text(
                                  "Create User", 
                                  style: TextStyle(
                                    color: isFormValid ? const Color(0xFF0F172A) : Colors.grey, 
                                    fontWeight: FontWeight.w900
                                  )
                                ),
                        )
                      ],
                    )
                  ],
                ),
              ),
            );
          }
        );
      }
    );
  }

  PopupMenuItem<String> _buildDropdownItem(String value, String currentSelection, String label) {
    final isSelected = currentSelection == value;
    
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
                label,
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

  Widget _buildDialogTextField({
    required String label, 
    required TextEditingController controller, 
    required IconData icon,
    required Function(String) onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B), fontSize: 12)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          onChanged: onChanged,
          style: const TextStyle(fontSize: 14),
          decoration: InputDecoration(
            prefixIcon: Icon(icon, size: 18, color: Colors.grey.shade500),
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.grey.shade300)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.grey.shade300)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF0F172A), width: 1.5)),
          ),
        )
      ],
    );
  }
}