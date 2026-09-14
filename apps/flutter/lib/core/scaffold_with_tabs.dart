import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:material_3_expressive/material_3_expressive.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/theme_ext.dart';
import 'package:min_flutter/core/ui/animated_fill_icon.dart';
import 'package:min_flutter/features/chats/selected_chat_provider.dart';
import 'package:motor/motor.dart';

class ScaffoldWithTabs extends ConsumerWidget {
  const ScaffoldWithTabs({required this.child, super.key});
  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedChatId = ref.watch(selectedChatIdProvider);
    final navigationShell = child as StatefulNavigationShell;

    return Scaffold(
      body: navigationShell,
      extendBody: true,
      bottomNavigationBar: SingleMotionBuilder(
        motion: const MaterialSpringMotion.standardSpatialDefault(),
        value: selectedChatId == null ? 0 : 1,
        builder: (context, progress, child) {
          return FractionalTranslation(
            translation: Offset(0.0, progress),
            child: child,
          );
        },
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
              label: "Home",
            ),
            M3ENavigationBarDestination(
              icon: AnimatedFillIcon(
                icon: Symbols.person_rounded,
                isSelected: navigationShell.currentIndex == 1,
              ),
              label: "Profile",
            ),
            M3ENavigationBarDestination(
              icon: AnimatedFillIcon(
                icon: Symbols.settings_rounded,
                isSelected: navigationShell.currentIndex == 2,
              ),
              label: "Settings",
            ),
          ],
        ),
      ),
    );
  }
}
