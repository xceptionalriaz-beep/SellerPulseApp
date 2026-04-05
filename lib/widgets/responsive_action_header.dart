import 'package:flutter/material.dart';

class ResponsiveActionHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget actionButton;

  const ResponsiveActionHeader({
    super.key,
    required this.title,
    this.subtitle,
    required this.actionButton,
  });

  @override
  Widget build(BuildContext context) {
    // The widget measures its own available space!
    return LayoutBuilder(
      builder: (context, constraints) {
        bool isMobile = constraints.maxWidth < 600;

        // ✨ MOBILE LAYOUT: Stacked with a full-width button
        if (isMobile) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              if (subtitle != null && subtitle!.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(subtitle!, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
              ],
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: actionButton,
              ),
            ],
          );
        }

        // ✨ DESKTOP LAYOUT: Side-by-side
        return Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                  if (subtitle != null && subtitle!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(subtitle!, style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 16),
            actionButton,
          ],
        );
      },
    );
  }
}