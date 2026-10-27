import 'package:collection/collection.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/ui/scale_enter_animation.dart';

class ProgressiveEnterColumn extends StatelessWidget {
  final List<Widget> children;
  final MainAxisAlignment mainAxisAlignment;
  final double spacing;

  const ProgressiveEnterColumn({
    super.key,
    required this.children,
    this.mainAxisAlignment = MainAxisAlignment.center,
    this.spacing = 0.0,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: mainAxisAlignment,
      spacing: spacing,
      children: children
          .mapIndexed(
            (index, child) => child is! Expanded
                ? ScaleEnterAnimation(
                    delay: Duration(milliseconds: index * 50),
                    child: child,
                  )
                : child,
          )
          .toList(),
    );
  }
}
