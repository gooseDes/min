import 'package:material_ui/material_ui.dart';
import 'package:motor/motor.dart';

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
    return SingleMotionBuilder(
      motion: const MaterialSpringMotion.expressiveSpatialDefault(),
      value: isSelected ? 1 : 0,
      builder: (context, value, child) => Icon(icon, fill: value.clamp(0, 1)),
    );
  }
}
