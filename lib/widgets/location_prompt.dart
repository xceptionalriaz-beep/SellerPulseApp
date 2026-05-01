import 'package:flutter/material.dart';
import '../../services/crm_service.dart';

class LocationPrompt extends StatefulWidget {
  final String userId;
  final bool isVerified;
  const LocationPrompt({super.key, required this.userId, required this.isVerified});

  @override
  State<LocationPrompt> createState() => _LocationPromptState();
}

class _LocationPromptState extends State<LocationPrompt> {
  bool _hideSession = false;

  @override
  Widget build(BuildContext context) {
    // If they already allowed it or we hid it for this session, show nothing
    if (widget.isVerified || _hideSession) return const SizedBox.shrink();

    return Positioned(
      bottom: 20,
      right: 20,
      child: Container(
        width: 280,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 20)],
          border: Border.all(color: const Color(0xFF8FFF00), width: 2), // Neon border
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Row(
              children: [
                Icon(Icons.location_on, color: Color(0xFF8FFF00), size: 20),
                SizedBox(width: 8),
                Text("Verify Account Location", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              "Help us protect your account by verifying your login city.",
              style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextButton(
                    onPressed: () => setState(() => _hideSession = true),
                    child: const Text("Later", style: TextStyle(fontSize: 11, color: Colors.grey)),
                  ),
                ),
                ElevatedButton(
                  onPressed: () async {
                    await CrmService.updateVerifiedLocation(widget.userId);
                    setState(() => _hideSession = true); // Hide once they click
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F172A),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text("Allow", style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }
}