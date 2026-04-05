import 'package:flutter/material.dart';

class AnimatedCtaButton extends StatefulWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isSmall;
  final Color baseColor; // <-- 1. Added a custom base color property!
  final Color hoverColor; 

  const AnimatedCtaButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isSmall = false,
    this.baseColor = Colors.black, // <-- 2. Default is still black!
    this.hoverColor = const Color(0xFF8FFF00), // Default is still neon green
  });

  @override
  State<AnimatedCtaButton> createState() => _AnimatedCtaButtonState();
}

class _AnimatedCtaButtonState extends State<AnimatedCtaButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    // 3. We logic to swap the text color automatically for maximum contrast!
    final bool isBaseColorLight = widget.baseColor.computeLuminance() > 0.5;
    final bool isHoverColorLight = widget.hoverColor.computeLuminance() > 0.5;

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: widget.onPressed,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeInOut,
          padding: EdgeInsets.symmetric(
            horizontal: widget.isSmall ? 24 : 40,
            vertical: widget.isSmall ? 12 : 20,
          ),
          decoration: BoxDecoration(
            // 4. Now it swaps between our two custom colors!
            color: _isHovered ? widget.hoverColor : widget.baseColor, 
            borderRadius: BorderRadius.circular(50), 
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(_isHovered ? 0.2 : 0.1),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: AnimatedDefaultTextStyle(
            duration: const Duration(milliseconds: 200),
            style: TextStyle(
              // 5. This makes the text black if the background is light, and white if it is dark!
              color: _isHovered 
                  ? (isHoverColorLight ? Colors.black : Colors.white)
                  : (isBaseColorLight ? Colors.black : Colors.white), 
              fontSize: widget.isSmall ? 14 : 18,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
            child: Text(widget.text),
          ),
        ),
      ),
    );
  }
}