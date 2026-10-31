import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/ui/enter_animation.dart';

class OpacityEnterAnimation extends StatelessWidget {
  final Widget child;
  final Duration delay;
  final bool show;
  final bool changeBox;

  const OpacityEnterAnimation({
    super.key,
    required this.child,
    this.delay = Duration.zero,
    this.show = true,
    this.changeBox = false,
  });

  @override
  Widget build(BuildContext context) {
    return EnterAnimation(
      animationBuilder: (value, child) =>
          Opacity(opacity: value.clamp(0, 1), child: child),
      delay: delay,
      show: show,
      changeBox: changeBox,
      child: child,
    );
  }
}
