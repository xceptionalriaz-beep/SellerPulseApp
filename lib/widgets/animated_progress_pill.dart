import 'package:flutter/material.dart';

class AnimatedProgressPill extends StatelessWidget {
  final int currentStep;
  final Function(int) onStepTapped;

  const AnimatedProgressPill({
    super.key,
    required this.currentStep,
    required this.onStepTapped,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF8FFF00), 
        borderRadius: BorderRadius.circular(50),
        boxShadow: const [BoxShadow(color: Color(0x4D8FFF00), blurRadius: 20, offset: Offset(0, 10))],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min, 
        children: [
          _animatedStepTab(emojiIcon: "🛡️", label: "Create Account", stepNumber: 0),
          _stepDivider(),
          _animatedStepTab(emojiIcon: "📧", label: "Verify Email", stepNumber: 1),
          _stepDivider(),
          _animatedStepTab(emojiIcon: "🚀", label: "Start Trial", stepNumber: 2),
        ],
      ),
    );
  }

  Widget _stepDivider() {
    return Container(width: 40, height: 1, color: Colors.black.withAlpha(26), margin: const EdgeInsets.symmetric(horizontal: 10));
  }

  Widget _animatedStepTab({required String emojiIcon, required String label, required int stepNumber}) {
    final bool isActive = currentStep == stepNumber;
    final bool isCompleted = currentStep > stepNumber;
    final Color baseColor = isActive || isCompleted ? Colors.black : const Color(0xB3000000); 
    final FontWeight fontWeight = isActive ? FontWeight.bold : FontWeight.w600;

    return GestureDetector(
      onTap: () => onStepTapped(stepNumber),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10),
        child: Column(
          children: [
            Text(emojiIcon, style: const TextStyle(fontSize: 22)), 
            const SizedBox(height: 8),
            Text(label, style: TextStyle(color: baseColor, fontSize: 16, fontWeight: fontWeight)),
            const SizedBox(height: 8),
            Container(
              width: 100, height: isActive ? 2 : (isCompleted ? 1 : 0),
              color: baseColor.withAlpha( isActive ? 255 : (isCompleted ? 26 : 0) ), 
            ),
          ],
        ),
      ),
    );
  }
}