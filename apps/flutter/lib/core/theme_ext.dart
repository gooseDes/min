import 'package:material_3_expressive/material_3_expressive.dart';
import 'package:material_ui/material_ui.dart';

extension BuildContextExt on BuildContext {
  M3EColorScheme get colorScheme => M3ETheme.of(this).colorScheme;
  TextTheme get textTheme => M3ETheme.of(this).textTheme;
  M3ETypography get typography => M3ETheme.of(this).typography;
}
