import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_3_expressive/material_3_expressive.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/logger.dart';
import 'package:min_flutter/features/settings/settings_provider.dart';
import 'package:min_flutter/features/settings/settings_switch.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            M3EButton(
              label: const Text('Show logs'),
              onPressed: () async {
                if (!context.mounted) return;

                M3EDialog.showFullScreen(
                  context,
                  title: 'Logs',
                  body: InteractiveViewer(
                    constrained: false,
                    scaleEnabled: false,
                    child: Text(
                      MemoryOutput.logHistory.join('\n'),
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 12,
                      ),
                    ),
                  ),
                );
              },
            ),
            Expanded(
              child: ListView.builder(
                itemCount: settings.fields.length,
                itemBuilder: (context, index) {
                  final key = settings.fields.keys.elementAt(index);
                  return SettingsSwitch(settingKey: key);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
