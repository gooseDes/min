import 'package:flutter/gestures.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_3_expressive/material_3_expressive.dart';
import 'package:material_ui/material_ui.dart';
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
        const fontFamily = 'GoogleSansFlex';

        return MaterialApp.router(
          routerConfig: router,
          title: 'Min',
          themeMode: ThemeMode.system,
          theme: ThemeData(
            useMaterial3: true,
            fontFamily: fontFamily,
            colorScheme: ColorScheme.fromSeed(
              seedColor: systemAccent.accent,
              brightness: Brightness.light,
            ),
          ),
          darkTheme: ThemeData(
            useMaterial3: true,
            fontFamily: fontFamily,
            colorScheme: ColorScheme.fromSeed(
              seedColor: systemAccent.accent,
              brightness: Brightness.dark,
            ),
          ),

          builder: (context, child) {
            final brightness = Theme.of(context).brightness;

            return M3ETheme(
              data:
                  (brightness == Brightness.light
                          ? M3EThemeData.light(seedColor: systemAccent.accent)
                          : M3EThemeData.dark(seedColor: systemAccent.accent))
                      .copyWith(
                        fontFamily: fontFamily,
                        variableFont: const M3EVariableFontConfig(
                          global: M3EVariableFontAxes(rond: 100),
                        ),
                      ),
              child: child ?? const SizedBox(),
            );
          },

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
