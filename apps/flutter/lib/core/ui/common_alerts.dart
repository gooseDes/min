import 'package:material_3_expressive/material_3_expressive.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/logger.dart';

void showError(
  BuildContext context,
  String message, [
  Object? exception,
  StackTrace? trace,
]) {
  if (!context.mounted) return;

  M3EDialog.show(
    context,
    dialog: M3EDialog(
      icon: const Icon(Symbols.error_rounded),
      title: "Error",
      content: Text('$message: ${exception.toString()}'),
      actions: [
        M3EButton(
          label: const Text("OK"),
          onPressed: () {
            Navigator.of(context).pop();
          },
        ),
      ],
    ),
  );

  if (exception != null || trace != null)
    logger.e(message, error: exception, stackTrace: trace);
}
