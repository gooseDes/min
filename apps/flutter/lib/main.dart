import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:min_flutter/core/device_type.dart';
import 'package:min_flutter/core/router.dart';
import 'package:min_flutter/features/theming/linux_fallback.dart';
import 'package:system_theme/system_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemTheme.fallbackColor = await LinuxAccentColorFallback.getAccentColor();
  await SystemTheme.accentColor.load();
  runApp(const ProviderScope(child: MinApp()));
}

class MinApp extends ConsumerWidget {
  const MinApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return SystemThemeBuilder(
      builder: (context, systemAccent) {
        return MaterialApp.router(
          routerConfig: router,
          title: 'Min',
          theme: ThemeData(
            useMaterial3: true,
            brightness: Brightness.light,
            colorScheme: ColorScheme.fromSeed(
              seedColor: systemAccent.accent,
              brightness: Brightness.light,
            ),
            splashFactory: DeviceType.isMobile
                ? InkSparkle.splashFactory
                : InkRipple.splashFactory,
            splashColor: systemAccent.accent.withValues(alpha: 0.05),
            highlightColor: Colors.transparent,
          ),
          darkTheme: ThemeData(
            useMaterial3: true,
            brightness: Brightness.dark,
            colorScheme: ColorScheme.fromSeed(
              seedColor: systemAccent.accent,
              brightness: Brightness.dark,
            ),
            splashFactory: DeviceType.isMobile
                ? InkSparkle.splashFactory
                : InkRipple.splashFactory,
            splashColor: systemAccent.accent.withValues(alpha: 0.05),
            highlightColor: Colors.transparent,
          ),
          themeMode: ThemeMode.system,
          scrollBehavior: const MaterialScrollBehavior().copyWith(
            dragDevices: {
              PointerDeviceKind.mouse,
              PointerDeviceKind.touch,
              PointerDeviceKind.stylus,
              PointerDeviceKind.trackpad,
              PointerDeviceKind.unknown,
            },
          ),
        );
      },
    );
  }
}
