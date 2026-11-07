import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/scaffold_with_tabs.dart';
import 'package:min_flutter/core/ui/adaptive_shell.dart';
import 'package:min_flutter/core/ui/home_root.dart';
import 'package:min_flutter/features/auth/auth_provider.dart';
import 'package:min_flutter/features/auth/login_screen.dart';
import 'package:min_flutter/features/chats/chat_screen.dart';
import 'package:min_flutter/features/profile/profile_screen.dart';
import 'package:min_flutter/features/settings/settings_screen.dart';

extension AdaptiveContext on BuildContext {
  bool get isExpanded => MediaQuery.sizeOf(this).width >= 840;
}

CustomTransitionPage buildPageBuilder(
  BuildContext context,
  GoRouterState state,
  Widget child,
) {
  return CustomTransitionPage(
    key: state.pageKey,
    child: child,
    transitionDuration: const Duration(milliseconds: 400),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      const begin = Offset(0.4, 0.0);
      const end = Offset.zero;
      const curve = Curves.easeOutCubic;

      final tween = Tween(
        begin: begin,
        end: end,
      ).chain(CurveTween(curve: curve));
      final offsetAnimation = animation.drive(tween);

      return SlideTransition(
        position: offsetAnimation,
        child: FadeTransition(opacity: animation, child: child),
      );
    },
  );
}

final rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');

final routerProvider = Provider<GoRouter>((ref) {
  final authNotifier = ValueNotifier<AuthState>(ref.read(authProvider));

  ref.listen(authProvider, (previous, next) {
    authNotifier.value = next;
  });

  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/home',
    refreshListenable: authNotifier,
    redirect: (BuildContext context, GoRouterState state) {
      final authState = ref.read(authProvider);
      final isLoggingIn = state.matchedLocation == '/login';

      if (!authState.isAuthenticated && !isLoggingIn) return '/login';
      if (authState.isAuthenticated && isLoggingIn) return '/home';

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        pageBuilder: (context, state) {
          return buildPageBuilder(context, state, const LoginScreen());
        },
      ),
      StatefulShellRoute.indexedStack(
        pageBuilder: (context, state, navigationShell) {
          return buildPageBuilder(
            context,
            state,
            ScaffoldWithTabs(child: navigationShell),
          );
        },
        branches: [
          StatefulShellBranch(
            routes: [
              ShellRoute(
                builder: (context, state, child) => AdaptiveShell(child: child),
                routes: [
                  GoRoute(
                    path: '/home',
                    builder: (context, state) => const HomeRoot(),
                    routes: [
                      GoRoute(
                        path: 'chat/:chatId',
                        pageBuilder: (context, state) {
                          final chatId = int.tryParse(
                            state.pathParameters['chatId'] ?? '',
                          );
                          if (chatId == null)
                            return const NoTransitionPage(child: SizedBox());
                          return buildPageBuilder(
                            context,
                            state,
                            ChatScreen(key: ValueKey(chatId), chatId: chatId),
                          );
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/settings',
                builder: (context, state) => const SettingsScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});
