import 'package:flutter/material.dart';

class TbSettingsPanel extends StatelessWidget {
  final bool autoCapitalize;
  final Function(bool) onAutoCapitalizeChanged;
  
  final bool autoCopy;
  final Function(bool) onAutoCopyChanged;
  
  final String veroMode;
  final Function(String) onVeroModeChanged;

  const TbSettingsPanel({
    super.key,
    required this.autoCapitalize,
    required this.onAutoCapitalizeChanged,
    required this.autoCopy,
    required this.onAutoCopyChanged,
    required this.veroMode,
    required this.onVeroModeChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: const Color(0xFFF8FAFC), // Matches your app background
      width: 320, // Nice wide panel
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // --- HEADER ---
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border(bottom: BorderSide(color: Colors.grey.shade200))
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.tune, color: Color(0xFF1E293B)),
                      SizedBox(width: 10),
                      Text("Pro Settings", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.grey),
                    onPressed: () => Navigator.of(context).pop(), // Slides the drawer closed
                  )
                ],
              ),
            ),

            // --- SETTINGS LIST ---
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(20),
                physics: const BouncingScrollPhysics(),
                children: [
                  const Text("TITLE STUDIO", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
                  const SizedBox(height: 15),
                  
                  // Auto-Capitalize Toggle
                  _buildToggleRow(
                    icon: Icons.text_format,
                    title: "Auto-Capitalize Words",
                    subtitle: "Forces first letter of every word to uppercase.",
                    value: autoCapitalize,
                    onChanged: onAutoCapitalizeChanged,
                  ),
                  
                  const SizedBox(height: 10),
                  
                  // Auto-Copy Toggle
                  _buildToggleRow(
                    icon: Icons.copy_all,
                    title: "Auto-Copy at 80 Chars",
                    subtitle: "Automatically copies title when perfect length is hit.",
                    value: autoCopy,
                    onChanged: onAutoCopyChanged,
                  ),

                  const SizedBox(height: 30),
                  const Text("SAFETY & VERO", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
                  const SizedBox(height: 15),

                  // VeRO Mode Selector
                  Container(
                    padding: const EdgeInsets.all(15),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.shade200)),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.shield_outlined, color: Color(0xFF1E293B), size: 20),
                            SizedBox(width: 10),
                            Text("VeRO Warning Level", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                          ],
                        ),
                        const SizedBox(height: 15),
                        Row(
                          children: [
                            Expanded(child: _buildVeroButton("Strict", veroMode, onVeroModeChanged)),
                            const SizedBox(width: 10),
                            Expanded(child: _buildVeroButton("Relaxed", veroMode, onVeroModeChanged)),
                          ],
                        )
                      ],
                    ),
                  )
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --- HELPER WIDGETS ---

  Widget _buildToggleRow({required IconData icon, required String title, required String subtitle, required bool value, required Function(bool) onChanged}) {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.shade200)),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, color: const Color(0xFF1D70F5), size: 20),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(fontSize: 11, color: Colors.grey)),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeThumbColor: const Color(0xFF0F172A),
            activeTrackColor: const Color(0xFF8FFF00), // 🚀 Your Neon Green!
            inactiveThumbColor: Colors.grey.shade400,
            inactiveTrackColor: Colors.grey.shade200,
          )
        ],
      ),
    );
  }

  Widget _buildVeroButton(String mode, String currentMode, Function(String) onTap) {
    bool isActive = mode == currentMode;
    return GestureDetector(
      onTap: () => onTap(mode),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: isActive ? const Color(0xFF1E293B) : Colors.grey.shade300),
        ),
        alignment: Alignment.center,
        child: Text(
          mode, 
          style: TextStyle(
            fontWeight: FontWeight.bold, 
            color: isActive ? const Color(0xFF8FFF00) : Colors.grey.shade600 // Neon Green text if active
          )
        ),
      ),
    );
  }
}