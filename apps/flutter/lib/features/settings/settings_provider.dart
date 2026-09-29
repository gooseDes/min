import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:min_flutter/features/settings/settings_state.dart';
import 'package:min_flutter/features/storage/storage.dart';

class SettingsNotifier extends Notifier<SettingsState> {
  @override
  SettingsState build() {
    _init();
    return const SettingsState();
  }

  Future<void> _init() async {
    final storage = Storage();

    var tempState = state;

    for (final field in tempState.fields.keys) {
      final value = await storage.rawGet(field);
      if (value != null) {
        final updater = tempState.fields[field]?.updater;
        if (updater != null) {
          tempState = updater(value);
        }
      }
    }

    state = tempState;
  }

  Future<void> update(SettingsState Function(SettingsState) func) async {
    state = func(state);
  }
}

final settingsProvider = NotifierProvider<SettingsNotifier, SettingsState>(
  () => SettingsNotifier(),
);
