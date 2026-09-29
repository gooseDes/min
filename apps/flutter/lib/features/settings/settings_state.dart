import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:min_flutter/features/settings/settings_field.dart';

part 'settings_state.freezed.dart';

class FieldValue<T> {
  final SettingsField field;
  final SettingsState Function(T) updater;

  FieldValue({required this.field, required this.updater});
}

@freezed
abstract class SettingsState with _$SettingsState {
  const SettingsState._();

  const factory SettingsState({
    @Default(SettingsField(key: "show_debug_info", type: bool, value: false))
    SettingsField showDebugInfo,
    @Default(
      SettingsField(key: "enable_progressive_blur", type: bool, value: true),
    )
    SettingsField enableProgressiveBlur,
  }) = _SettingsState;

  Map<String, FieldValue> get fields => {
    showDebugInfo.key: FieldValue(
      field: showDebugInfo,
      updater: (val) => copyWith.showDebugInfo(value: val),
    ),
    enableProgressiveBlur.key: FieldValue(
      field: enableProgressiveBlur,
      updater: (val) => copyWith.enableProgressiveBlur(value: val),
    ),
  };
}
