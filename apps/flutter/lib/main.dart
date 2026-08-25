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
        final splashFactory = DeviceType.isMobile
            ? InkSparkle.splashFactory
            : InkRipple.splashFactory;
        final splashColor = systemAccent.accent.withValues(alpha: 0.05);
        const highlightColor = Colors.transparent;
        const fontFamily = 'Rubik';

        return MaterialApp.router(
          routerConfig: router,
          title: 'Min',

          theme: ThemeData(
            useMaterial3: true,
            brightness: Brightness.light,
            fontFamily: fontFamily,
            splashFactory: splashFactory,
            splashColor: splashColor,
            highlightColor: highlightColor,
            colorScheme: ColorScheme.fromSeed(
              seedColor: systemAccent.accent,
              brightness: Brightness.light,
            ),
          ),

          darkTheme: ThemeData(
            useMaterial3: true,
            brightness: Brightness.dark,
            fontFamily: fontFamily,
            splashFactory: splashFactory,
            splashColor: splashColor,
            highlightColor: highlightColor,
            colorScheme: ColorScheme.fromSeed(
              seedColor: systemAccent.accent,
              brightness: Brightness.dark,
            ),
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
