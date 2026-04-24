import 'package:flutter/material.dart';

class UniversalScanButton extends StatefulWidget {
  final VoidCallback onTap;
  final String text;
  final double? width;
  final double borderRadius;
  final double fontSize;

  const UniversalScanButton({
    super.key, 
    required this.onTap, 
    this.text = "SCAN", 
    this.width,
    this.borderRadius = 11.0,
    this.fontSize = 16.0,
  });

  @override
  State<UniversalScanButton> createState() => _UniversalScanButtonState();
}

class _UniversalScanButtonState extends State<UniversalScanButton> {
  bool _isHovering = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovering = true),
      onExit: (_) => setState(() => _isHovering = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: widget.width,
          height: double.infinity,
          padding: widget.width == null ? const EdgeInsets.symmetric(horizontal: 16) : null,
          decoration: BoxDecoration(
            color: _isHovering ? const Color(0xFF8FFF00) : const Color(0xFF131B2F),
            borderRadius: BorderRadius.horizontal(right: Radius.circular(widget.borderRadius)),
          ),
          alignment: Alignment.center,
          child: Text(
            widget.text,
            style: TextStyle(
              color: _isHovering ? Colors.black : Colors.white, 
              fontWeight: FontWeight.bold,
              fontSize: widget.fontSize,
            ),
          ),
        ),
      ),
    );
  }
}