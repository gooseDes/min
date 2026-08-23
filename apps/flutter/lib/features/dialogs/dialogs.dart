import 'package:flutter/material.dart';
import 'package:min_flutter/core/router.dart';

void showError(String message) {
  final BuildContext? context = rootNavigatorKey.currentState?.context;

  if (context != null) {
    showAdaptiveDialog(
      context: context,
      builder: (ctx) => AlertDialog.adaptive(
        title: const Text("Error"),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
}
