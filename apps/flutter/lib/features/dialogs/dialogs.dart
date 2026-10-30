import 'package:go_router/go_router.dart';
import 'package:material_3_expressive/material_3_expressive.dart';
import 'package:material_symbols_icons/material_symbols_icons.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/logger.dart';
import 'package:min_flutter/core/router.dart';

void showError(String message, [Object? exception, StackTrace? trace]) {
  final context = rootNavigatorKey.currentState?.context;
  if (context == null || !context.mounted) return;

  M3EDialog.show(
    context,
    dialog: M3EDialog(
      icon: const Icon(Symbols.error_rounded),
      title: "Error",
      content: Text(
        exception != null ? '$message: ${exception.toString()}' : message,
      ),
      actions: [
        M3EButton(
          label: const Text("OK"),
          onPressed: () {
            if (context.canPop()) context.pop();
          },
        ),
      ],
    ),
  );

  if (exception != null || trace != null)
    logger.e(message, error: exception, stackTrace: trace);
}
