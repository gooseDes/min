import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/ui/enter_animation.dart';

class ScaleEnterAnimation extends StatelessWidget {
  final Widget child;
  final Duration delay;
  final bool show;
  final bool changeBox;
  final bool enabled;

  const ScaleEnterAnimation({
    super.key,
    required this.child,
    this.delay = Duration.zero,
    this.show = true,
    this.changeBox = false,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    return EnterAnimation(
      animationBuilder: (value, child) => Opacity(
        opacity: value.clamp(0, 1),
        child: Transform.scale(
          alignment: Alignment.center,
          scale: value,
          child: child,
        ),
      ),
      delay: delay,
      show: show,
      changeBox: changeBox,
      enabled: enabled,
      child: child,
    );
  }
}
