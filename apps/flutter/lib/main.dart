import 'dart:ui';

import 'package:flutter/foundation.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:material_3_expressive/material_3_expressive.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/router.dart';
import 'package:min_flutter/features/auto_update/updater.dart';
import 'package:min_flutter/features/dialogs/loading_provider.dart';
import 'package:min_flutter/features/settings/settings_provider.dart';
import 'package:min_flutter/features/theming/linux_fallback.dart';
import 'package:system_theme/system_theme.dart';
import 'package:flutter_localizations/flutter_localizations.dart' as fl;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemTheme.fallbackColor = await LinuxAccentColorFallback.getAccentColor();
  await SystemTheme.accentColor.load();
  runApp(const ProviderScope(child: MinApp()));
}

class MinApp extends HookConsumerWidget {
  const MinApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final settings = ref.watch(settingsProvider);
    final isLoading = ref.watch(isLoadingProvider);

    useEffect(() {
      if (!kDebugMode)
        WidgetsBinding.instance.addPostFrameCallback(
          (_) => UpdaterService.checkForUpdates(rootNavigatorKey),
        );

      return () {};
    }, []);

    const headingsTextTheme = TextTheme(
      displayLarge: TextStyle(fontWeight: FontWeight.w700),
      displayMedium: TextStyle(fontWeight: FontWeight.w700),
      displaySmall: TextStyle(fontWeight: FontWeight.w700),
      headlineLarge: TextStyle(fontWeight: FontWeight.w700),
      headlineMedium: TextStyle(fontWeight: FontWeight.w700),
      headlineSmall: TextStyle(fontWeight: FontWeight.w700),
      titleLarge: TextStyle(fontWeight: FontWeight.w600),
      titleMedium: TextStyle(fontWeight: FontWeight.w600),
      titleSmall: TextStyle(fontWeight: FontWeight.w600),
    );

    return SystemThemeBuilder(
      builder: (context, systemAccent) {
        const fontFamily = 'GoogleSansFlex';

        return MaterialApp.router(
          routerConfig: router,
          title: 'Min',
          themeMode: ThemeMode.system,
          showPerformanceOverlay: settings.showDebugInfo.value,

          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            fl.GlobalMaterialLocalizations.delegate,
            fl.GlobalWidgetsLocalizations.delegate,
          ],
          supportedLocales: const [Locale('en')],

          theme: ThemeData(
            useMaterial3: true,
            fontFamily: fontFamily,
            textTheme: headingsTextTheme,
            colorScheme: ColorScheme.fromSeed(
              seedColor: systemAccent.accent,
              brightness: Brightness.light,
            ),
          ),
          darkTheme: ThemeData(
            useMaterial3: true,
            fontFamily: fontFamily,
            textTheme: headingsTextTheme,
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
                          brand: M3EVariableFontAxes(wght: 600),
                        ),
                      ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  child ?? const SizedBox(),
                  Positioned.fill(
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 1000),
                      switchInCurve: Curves.fastLinearToSlowEaseIn,
                      switchOutCurve: Curves.fastLinearToSlowEaseIn,
                      transitionBuilder: (child, animation) =>
                          FadeTransition(opacity: animation, child: child),
                      child: isLoading.isLoading
                          ? BackdropFilter(
                              key: const ValueKey("loading"),
                              filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
                              child: const M3ELoadingIndicator(
                                variant: M3ELoadingIndicatorVariant.contained,
                              ),
                            )
                          : const SizedBox.shrink(key: ValueKey("empty")),
                    ),
                  ),
                ],
              ),
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
