import 'package:flutter/material.dart';

class PageWrapper extends StatelessWidget {
  final Widget child;
  final EdgeInsets padding;

  const PageWrapper({
    super.key, 
    required this.child, 
    this.padding = const EdgeInsets.all(24.0)
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9), 
      body: SafeArea(
        // ✨ THE FIX: We removed the LayoutBuilder and SingleChildScrollView!
        // This makes the wrapper a strict, unbreakable bounded box.
        // Now, your Expanded() widgets will never try to calculate "infinity".
        child: Padding(
          padding: padding, 
          child: child,
        ),
      ),
    );
  }
}