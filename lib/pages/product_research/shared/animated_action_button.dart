import 'package:flutter/material.dart';

class AnimatedActionButton extends StatefulWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const AnimatedActionButton({
    super.key, 
    required this.icon, 
    required this.label, 
    required this.onTap
  });

  @override
  State<AnimatedActionButton> createState() => _AnimatedActionButtonState();
}

class _AnimatedActionButtonState extends State<AnimatedActionButton> {
  bool _isHovering = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovering = true),
      onExit: (_) => setState(() => _isHovering = false),
      child: InkWell(
        onTap: widget.onTap,
        borderRadius: BorderRadius.circular(8),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: _isHovering ? const Color(0xFF8FFF00) : Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: _isHovering ? const Color(0xFF8FFF00) : Colors.grey.shade300),
          ),
          child: Row(
            children: [
              Icon(widget.icon, size: 16, color: const Color(0xFF131B2F)),
              const SizedBox(width: 6),
              Text(
                widget.label, 
                style: const TextStyle(color: Color(0xFF131B2F), fontWeight: FontWeight.bold)
              ),
            ],
          ),
        ),
      ),
    );
  }
}