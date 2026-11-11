import 'dart:async';

import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:material_ui/material_ui.dart';
import 'package:motor/motor.dart';

class EnterAnimation extends HookWidget {
  final Widget child;
  final Duration delay;
  final bool show;
  final bool changeBox;
  final bool enabled;
  final Widget Function(double, Widget?) animationBuilder;

  const EnterAnimation({
    super.key,
    required this.child,
    this.delay = Duration.zero,
    this.show = true,
    this.changeBox = false,
    this.enabled = true,
    required this.animationBuilder,
  });

  @override
  Widget build(BuildContext context) {
    final scale = useState(0.0);

    useEffect(() {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Timer(delay, () {
          if (context.mounted) {
            scale.value = show ? 1.0 : 0.0;
          }
        });
      });

      return () {};
    }, [show]);

    return enabled
        ? SingleMotionBuilder(
            motion: const MaterialSpringMotion.expressiveSpatialDefault(),
            value: scale.value,
            builder: (context, value, child) => changeBox
                ? Align(
                    heightFactor: value.clamp(0, 2),
                    child: animationBuilder(value, child),
                  )
                : animationBuilder(value, child),
            child: child,
          )
        : child;
  }
}
