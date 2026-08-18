import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:min_flutter/core/ui/animated_fill_icon.dart';

class ScaffoldWithTabs extends StatelessWidget {
  const ScaffoldWithTabs({required this.child, super.key});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final navigationShell = child as StatefulNavigationShell;

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (int index) => navigationShell.goBranch(index),
        destinations: [
          NavigationDestination(
            icon: AnimatedFillIcon(
              icon: Symbols.home_rounded,
              isSelected: navigationShell.currentIndex == 0,
            ),
            label: "Home",
          ),
          NavigationDestination(
            icon: AnimatedFillIcon(
              icon: Symbols.person_rounded,
              isSelected: navigationShell.currentIndex == 1,
            ),
            label: "Profile",
          ),
          NavigationDestination(
            icon: AnimatedFillIcon(
              icon: Symbols.settings_rounded,
              isSelected: navigationShell.currentIndex == 2,
            ),
            label: "Settings",
          ),
        ],
      ),
    );
  }
}
