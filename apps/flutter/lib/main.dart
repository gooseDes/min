import 'dart:io';
import 'dart:ui';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:material_3_expressive/material_3_expressive.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/client.dart';
import 'package:min_flutter/core/logger.dart';
import 'package:min_flutter/core/router.dart';
import 'package:min_flutter/features/auth/auth_provider.dart';
import 'package:min_flutter/features/auto_update/updater.dart';
import 'package:min_flutter/features/dialogs/loading_provider.dart';
import 'package:min_flutter/features/settings/settings_provider.dart';
import 'package:min_flutter/features/theming/linux_fallback.dart';
import 'package:system_theme/system_theme.dart';
import 'package:flutter_localizations/flutter_localizations.dart' as fl;
import 'package:http/http.dart' as http;
import 'dart:ui' as ui;

final FlutterLocalNotificationsPlugin localNotifications =
    FlutterLocalNotificationsPlugin();

Future<void> initLocalNotifications() async {
  const AndroidInitializationSettings androidSettings =
      AndroidInitializationSettings('@mipmap/ic_launcher');

  const InitializationSettings initSettings = InitializationSettings(
    android: androidSettings,
  );

  await localNotifications.initialize(
    settings: initSettings,
    onDidReceiveNotificationResponse: (NotificationResponse response) {
      logger.i('Notification clicked: ${response.payload}');
    },
  );
}

Future<Uint8List> circleAvatar(Uint8List bytes, {int size = 512}) async {
  final codec = await ui.instantiateImageCodec(
    bytes,
    targetWidth: size,
    targetHeight: size,
  );
  final image = (await codec.getNextFrame()).image;

  final recorder = ui.PictureRecorder();
  final canvas = ui.Canvas(recorder);
  final rect = ui.Rect.fromLTWH(0, 0, size.toDouble(), size.toDouble());

  canvas.clipPath(ui.Path()..addOval(rect));
  canvas.drawImageRect(
    image,
    ui.Rect.fromLTWH(0, 0, image.width.toDouble(), image.height.toDouble()),
    rect,
    ui.Paint()..isAntiAlias = true,
  );

  final out = await recorder.endRecording().toImage(size, size);
  final data = await out.toByteData(format: ui.ImageByteFormat.png);
  return data!.buffer.asUint8List();
}

Future<void> showPushNotification(Map<String, dynamic> data) async {
  Uint8List? avatarBytes;

  try {
    final http.Response response = await http.get(
      Uri.parse('${apiClient.url}/avatars/${data['authorAvatar']}.webp'),
    );
    avatarBytes = await circleAvatar(response.bodyBytes);
  } catch (e) {
    logger.w('Failed to download avatar image: $e');
  }

  AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
    'min_channel',
    'Min Notifications',
    importance: Importance.max,
    priority: Priority.high,
    playSound: true,
    category: AndroidNotificationCategory.message,
    styleInformation: MessagingStyleInformation(
      const Person(name: 'You', key: 'you'),
      groupConversation: false,
      messages: [
        Message(
          data['text'],
          DateTime.now(),
          Person(
            name: '${data['authorName']}',
            key: '${data['authorId']}',
            important: true,
            icon: avatarBytes != null
                ? ByteArrayAndroidIcon(avatarBytes)
                : null,
          ),
        ),
      ],
    ),
    shortcutId: '${data['authorId']}',
  );

  NotificationDetails platformDetails = NotificationDetails(
    android: androidDetails,
  );

  int notificationId = DateTime.now().millisecondsSinceEpoch ~/ 1000;

  await localNotifications.show(
    id: notificationId,
    title: null,
    body: null,
    notificationDetails: platformDetails,
  );
}

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  logger.i('Handling a background message: ${message.messageId}');
  final data = message.data;
  logger.i('Payload Data: $data');

  await initLocalNotifications();
  await showPushNotification(data);
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemTheme.fallbackColor = await LinuxAccentColorFallback.getAccentColor();
  await SystemTheme.accentColor.load();
  if (Platform.isAndroid) {
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  }
  runApp(const ProviderScope(child: MinApp()));
}

class MinApp extends HookConsumerWidget {
  const MinApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final settings = ref.watch(settingsProvider);
    final isLoading = ref.watch(isLoadingProvider);

    Future<Function> initializeActualFcmMessages() async {
      final fcm = FirebaseMessaging.instance;

      NotificationSettings settings = await fcm.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        String? token = await fcm.getToken();
        logger.i('FCM Token: $token');

        if (token != null) apiClient.linkFcmToken(token);

        final foregroundSub = FirebaseMessaging.onMessage.listen((message) {
          logger.i('Fcm notification (Foreground): ${message.data}');
        });

        final openedAppSub = FirebaseMessaging.onMessageOpenedApp.listen((
          message,
        ) {
          logger.i('Message clicked from background');
        });

        RemoteMessage? initialMessage = await fcm.getInitialMessage();
        if (initialMessage != null) {
          logger.i('App is opened from killed state');
        }

        return () {
          foregroundSub.cancel();
          openedAppSub.cancel();
        };
      } else {
        logger.w('FCM is not authorized');
        return () {};
      }
    }

    ref.listen(authProvider, (prev, next) {
      if (Platform.isAndroid &&
          !(prev?.isAuthenticated ?? false) &&
          next.isAuthenticated) {
        initializeActualFcmMessages();
      }
    });

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
                              key: const ValueKey('loading'),
                              filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
                              child: const M3ELoadingIndicator(
                                variant: M3ELoadingIndicatorVariant.contained,
                              ),
                            )
                          : const SizedBox.shrink(key: ValueKey('empty')),
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
