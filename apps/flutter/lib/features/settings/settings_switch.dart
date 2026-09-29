import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:material_3_expressive/material_3_expressive.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/features/settings/settings_provider.dart';

class SettingsSwitch extends ConsumerWidget {
  final String settingKey;

  const SettingsSwitch({super.key, required this.settingKey});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsProvider);

    return Row(
      spacing: 8,
      children: [
        Text("$settingKey:"),
        M3ESwitch(
          value: settings.fields[settingKey]?.field.value,
          onChanged: (value) {
            if (settings.fields[settingKey] != null)
              ref
                  .read(settingsProvider.notifier)
                  .update(
                    (state) => settings.fields[settingKey]!.updater(value),
                  );
          },
        ),
      ],
    );
  }
}
