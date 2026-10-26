import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:material_ui/material_ui.dart';
import 'package:motor/motor.dart';

class ScaleEnterAnimation extends HookWidget {
  final Widget child;

  const ScaleEnterAnimation({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final scale = useState(0.0);

    useEffect(() {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (context.mounted) {
          scale.value = 1.0;
        }
      });

      return () {};
    }, []);

    return SingleMotionBuilder(
      motion: const MaterialSpringMotion.expressiveSpatialDefault(),
      value: scale.value,
      builder: (context, value, child) => Transform.scale(
        alignment: Alignment.center,
        scale: value,
        child: child,
      ),
      child: child,
    );
  }
}
