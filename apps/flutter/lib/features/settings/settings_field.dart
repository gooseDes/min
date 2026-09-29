import 'package:freezed_annotation/freezed_annotation.dart';

part 'settings_field.freezed.dart';

@freezed
abstract class SettingsField with _$SettingsField {
  const factory SettingsField({
    required String key,
    required Type type,
    required dynamic value,
  }) = _SettingsField;
}
