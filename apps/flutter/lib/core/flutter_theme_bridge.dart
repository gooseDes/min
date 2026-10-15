import 'package:flutter/material.dart' as fm;
import 'package:material_ui/material_ui.dart';

class FlutterThemeBridge extends StatelessWidget {
  const FlutterThemeBridge({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context);
    final c = t.colorScheme;
    final tt = t.textTheme;

    final data = fm.ThemeData(
      useMaterial3: true,
      brightness: c.brightness,
      fontFamily: tt.bodyMedium?.fontFamily,
      colorScheme: fm.ColorScheme(
        brightness: c.brightness,
        primary: c.primary,
        onPrimary: c.onPrimary,
        primaryContainer: c.primaryContainer,
        onPrimaryContainer: c.onPrimaryContainer,
        secondary: c.secondary,
        onSecondary: c.onSecondary,
        secondaryContainer: c.secondaryContainer,
        onSecondaryContainer: c.onSecondaryContainer,
        tertiary: c.tertiary,
        onTertiary: c.onTertiary,
        error: c.error,
        onError: c.onError,
        surface: c.surface,
        onSurface: c.onSurface,
        surfaceContainer: c.surfaceContainer,
        surfaceContainerHighest: c.surfaceContainerHighest,
        outline: c.outline,
        outlineVariant: c.outlineVariant,
      ),
      textTheme: fm.TextTheme(
        displayLarge: tt.displayLarge,
        displayMedium: tt.displayMedium,
        displaySmall: tt.displaySmall,
        headlineLarge: tt.headlineLarge,
        headlineMedium: tt.headlineMedium,
        headlineSmall: tt.headlineSmall,
        titleLarge: tt.titleLarge,
        titleMedium: tt.titleMedium,
        titleSmall: tt.titleSmall,
        bodyLarge: tt.bodyLarge,
        bodyMedium: tt.bodyMedium,
        bodySmall: tt.bodySmall,
        labelLarge: tt.labelLarge,
        labelMedium: tt.labelMedium,
        labelSmall: tt.labelSmall,
      ),
    );

    return fm.Theme(
      data: data,
      child: fm.Material(type: fm.MaterialType.transparency, child: child),
    );
  }
}
