import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_3_expressive/material_3_expressive.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/safe_area_insets_provider.dart';
import 'package:min_flutter/core/theme_ext.dart';
import 'package:min_flutter/core/ui/animated_fill_icon.dart';
import 'package:min_flutter/features/chats/chat_navigation.dart';
import 'package:motor/motor.dart';

class ScaffoldWithTabs extends ConsumerWidget {
  const ScaffoldWithTabs({required this.child, super.key});
  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chat = ref.watch(chatNavigationProvider);
    print(chat);
    final navigationShell = child as StatefulNavigationShell;

    final padding = MediaQuery.paddingOf(context);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(safeAreaInsetsProvider.notifier).update(padding);
    });

    return Scaffold(
      body: navigationShell,
      extendBody: true,
      bottomNavigationBar: SingleMotionBuilder(
        motion: const MaterialSpringMotion.expressiveSpatialDefault(),
        value: chat != null && chat != -1 ? 1 : 0,
        builder: (context, value, child) =>
            Transform.translate(offset: Offset(0, value * 100), child: child),
        child: M3ENavigationBar(
          backgroundColor: context.colorScheme.surfaceContainer,
          wideDestinationWidth: 145,
          selectedIndex: navigationShell.currentIndex,
          onDestinationSelected: (int index) => navigationShell.goBranch(index),
          destinations: [
            M3ENavigationBarDestination(
              icon: AnimatedFillIcon(
                icon: Symbols.home_rounded,
                isSelected: navigationShell.currentIndex == 0,
              ),
              label: 'Home',
            ),
            M3ENavigationBarDestination(
              icon: AnimatedFillIcon(
                icon: Symbols.person_rounded,
                isSelected: navigationShell.currentIndex == 1,
              ),
              label: 'Profile',
            ),
            M3ENavigationBarDestination(
              icon: AnimatedFillIcon(
                icon: Symbols.settings_rounded,
                isSelected: navigationShell.currentIndex == 2,
              ),
              label: 'Settings',
            ),
          ],
        ),
      ),
    );
  }
}
