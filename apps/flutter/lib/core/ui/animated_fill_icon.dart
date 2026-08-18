import 'package:flutter/material.dart';

class AnimatedFillIcon extends StatelessWidget {
  final IconData icon;
  final bool isSelected;

  const AnimatedFillIcon({
    super.key,
    required this.icon,
    required this.isSelected,
  });

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0, end: isSelected ? 1 : 0),
      duration: const Duration(milliseconds: 200),
      builder: (context, fillValue, child) {
        return Icon(icon, fill: fillValue);
      },
    );
  }
}
