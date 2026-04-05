import 'package:flutter/material.dart';

class NeonIcon extends StatelessWidget {
  final IconData icon;
  
  const NeonIcon({super.key, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: const BoxDecoration(
        color: Color(0xFF8FFF00),
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: Colors.black, size: 18),
    );
  }
}