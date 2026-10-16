import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:min_flutter/features/settings/settings_state.dart';
import 'package:min_flutter/features/storage/storage.dart';

class SettingsNotifier extends Notifier<SettingsState> {
  @override
  SettingsState build() {
    const initial = SettingsState();
    _init(initial);
    return initial;
  }

  Future<void> _init(SettingsState initial) async {
    final storage = Storage();

    var tempState = initial;

    for (final field in tempState.fields.keys) {
      final value = await storage.rawGet<bool>(field);
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
