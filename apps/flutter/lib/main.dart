import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:min_flutter/core/device_type.dart';
import 'package:min_flutter/core/router.dart';

void main() {
  runApp(const ProviderScope(child: MinApp()));
}

class MinApp extends ConsumerWidget {
  const MinApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      routerConfig: router,
      title: 'Min',
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        primarySwatch: Colors.blue,
        splashFactory: DeviceType.isMobile
            ? InkSparkle.splashFactory
            : InkRipple.splashFactory,
        splashColor: const Color(0xFF6750A4).withValues(alpha: 0.02),
        highlightColor: Colors.transparent,
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        primarySwatch: Colors.blue,
        splashFactory: DeviceType.isMobile
            ? InkSparkle.splashFactory
            : InkRipple.splashFactory,
        splashColor: const Color(0xFF6750A4).withValues(alpha: 0.02),
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
  }
}
