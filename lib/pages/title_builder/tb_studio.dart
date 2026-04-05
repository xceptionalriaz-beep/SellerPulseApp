import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// 🚀 Imports for both of your powerful logic engines!
import 'title_spinner_engine.dart'; 
import 'title_cleaner_engine.dart';

class TbStudio extends StatelessWidget {
  final TextEditingController controller;
  final int charCount;
  final int veroCount; 
  final int duplicateCount; 

  const TbStudio({
    super.key,
    required this.controller,
    required this.charCount,
    required this.veroCount, 
    required this.duplicateCount, 
  });

  // 🚀 THE NEW CLEAN TRIGGER
  void _cleanTitle() {
    String currentText = controller.text;
    if (currentText.isEmpty) return;

    // Send it to the engine!
    String polishedTitle = TitleCleanerEngine.clean(currentText);
    
    controller.text = polishedTitle;
    controller.selection = TextSelection.fromPosition(TextPosition(offset: polishedTitle.length));
  }

  // 🚀 THE SPIN TRIGGER 
  void _spinTitle() {
    String currentText = controller.text;
    if (currentText.isEmpty) return;

    String newTitle = TitleSpinnerEngine.spin(currentText, lockCount: 3); 
    
    controller.text = newTitle;
    controller.selection = TextSelection.fromPosition(TextPosition(offset: newTitle.length));
  }

  // 🚀 THE AI OPTIMIZE SIMULATOR
  void _runAIOptimize(BuildContext context) {
    FocusScope.of(context).unfocus();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Row(
          children: [
            Icon(Icons.auto_awesome, color: Colors.white),
            SizedBox(width: 10),
            Text("🚀 AI Engine warming up... (Ready for API connection!)", style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        backgroundColor: Colors.purple.shade600,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        duration: const Duration(seconds: 3),
      )
    );
  }

  @override
  Widget build(BuildContext context) {
    // Math to calculate the strength meter colors and progress
    double progress = (charCount / 80).clamp(0.0, 1.0);
    Color strengthColor = charCount > 80 
        ? Colors.red 
        : (charCount >= 65 ? const Color(0xFF10B981) : Colors.orange);

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white, 
        borderRadius: BorderRadius.circular(16), 
        border: Border.all(color: Colors.grey.shade200), 
        boxShadow: const [BoxShadow(color: Color(0x05000000), blurRadius: 10)]
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("THE AUTO TITLE BUILDER", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.grey)),
          const SizedBox(height: 15),
          
          // --- THE TEXT BOX AREA ---
          Container(
            decoration: BoxDecoration(
              border: Border.all(color: Colors.blue.shade300, width: 1.5),
              borderRadius: BorderRadius.circular(8),
              color: Colors.white,
            ),
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.only(left: 15, right: 5, top: 5),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: TextField(
                          controller: controller, 
                          maxLines: 2,
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Color(0xFF0F172A)),
                          decoration: const InputDecoration(border: InputBorder.none, isDense: true),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.copy, color: Colors.blue),
                        tooltip: "Copy Title",
                        onPressed: () {
                          Clipboard.setData(ClipboardData(text: controller.text));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text("Title Copied!", style: TextStyle(fontWeight: FontWeight.bold)), backgroundColor: Colors.blue, behavior: SnackBarBehavior.floating)
                          );
                        },
                      )
                    ],
                  ),
                ),
                // Mobile Cutoff Visual Line
                Stack(
                  alignment: Alignment.center,
                  children: [
                    Container(height: 1, color: Colors.blue.shade200, margin: const EdgeInsets.symmetric(horizontal: 10)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      color: Colors.white,
                      child: const Text("Mobile Cutoff", style: TextStyle(fontSize: 10, color: Colors.blue, fontWeight: FontWeight.bold)),
                    )
                  ],
                ),
                const SizedBox(height: 10),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // --- ALERTS ROW ---
          Row(
            children: [
              const Text("Alerts: ", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey, fontSize: 13)),
              const SizedBox(width: 8),
              
              _pillBadge(
                "$duplicateCount Duplicate${duplicateCount != 1 ? 's' : ''}", 
                duplicateCount > 0 ? Colors.orange.shade700 : Colors.grey.shade600, 
                duplicateCount > 0 ? Colors.orange.shade50 : Colors.grey.shade100
              ),
              const SizedBox(width: 8),
              
              _pillBadge(
                "$veroCount VeRO Risk${veroCount != 1 ? 's' : ''}", 
                veroCount > 0 ? Colors.red.shade700 : Colors.green.shade700, 
                veroCount > 0 ? Colors.red.shade50 : Colors.green.shade50
              ),
            ],
          ),
          const SizedBox(height: 15),
          
          // --- STRENGTH METER ---
          Row(
            children: [
              const Text("Strength: ", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey, fontSize: 13)),
              const SizedBox(width: 8),
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: LinearProgressIndicator(
                    value: progress, 
                    minHeight: 10, 
                    backgroundColor: Colors.grey.shade200, 
                    valueColor: AlwaysStoppedAnimation<Color>(strengthColor)
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Text("${((progress) * 100).toInt()}%", style: TextStyle(fontWeight: FontWeight.bold, color: strengthColor, fontSize: 14)),
            ],
          ),
          const SizedBox(height: 25),

          // --- ACTION BUTTONS ---
          Row(
            children: [
              const Text("Actions: ", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey, fontSize: 13)),
              const SizedBox(width: 10),
              _actionBtn("✨ AI Optimize", Colors.purple.shade600, Colors.purple.shade50, () => _runAIOptimize(context)),
              const SizedBox(width: 10),
              // 🚀 THE CLEAN BUTTON IS NOW WIRED TO THE ENGINE
              _actionBtn("🧹 Clean", Colors.blue.shade700, Colors.blue.shade50, _cleanTitle), 
              const SizedBox(width: 10),
              _actionBtn("🔄 Spin", Colors.teal.shade700, Colors.teal.shade50, _spinTitle),
            ],
          )
        ],
      ),
    );
  }

  // --- LOCAL HELPER WIDGETS ---

  Widget _pillBadge(String text, Color textColor, Color bgColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(20), border: Border.all(color: textColor.withOpacity(0.3))),
      child: Text(text, style: TextStyle(color: textColor, fontSize: 12, fontWeight: FontWeight.bold)),
    );
  }

  Widget _actionBtn(String text, Color textColor, Color bgColor, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(8), border: Border.all(color: textColor.withOpacity(0.3))),
        child: Text(text, style: TextStyle(color: textColor, fontWeight: FontWeight.bold, fontSize: 13)),
      ),
    );
  }
}