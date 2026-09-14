import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';

class SafeAreaInsetsNotifier extends Notifier<EdgeInsets> {
  @override
  EdgeInsets build() {
    return EdgeInsets.zero;
  }

  void update(EdgeInsets insets) {
    state = insets;
  }
}

final safeAreaInsetsProvider =
    NotifierProvider<SafeAreaInsetsNotifier, EdgeInsets>(
      () => SafeAreaInsetsNotifier(),
    );
