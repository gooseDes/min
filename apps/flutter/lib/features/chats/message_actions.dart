import 'dart:ui';

import 'package:go_router/go_router.dart';
import 'package:material_3_expressive/material_3_expressive.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/client.dart';
import 'package:min_flutter/core/theme_ext.dart';
import 'package:min_flutter/core/ui/progressive_enter_column.dart';
import 'package:min_flutter/features/chats/message.dart';
import 'package:min_types/index.dart';

void openMessageActions(BuildContext context, MessageDataWithSender message) {
  Navigator.of(context).push(
    PageRouteBuilder(
      opaque: false,
      transitionDuration: const Duration(milliseconds: 300),
      transitionsBuilder: (_, animation, _, child) => FadeTransition(
        opacity: CurvedAnimation(
          parent: animation,
          curve: Curves.fastOutSlowIn,
        ),
        child: child,
      ),
      pageBuilder: (_, _, _) => MessageActionsPage(message: message),
    ),
  );
}

class MessageActionsPage extends StatelessWidget {
  final MessageDataWithSender message;
  const MessageActionsPage({super.key, required this.message});

  @override
  Widget build(BuildContext context) {
    return BackdropFilter(
      filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
      child: Container(
        color: Colors.black45,
        child: SafeArea(
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: () {
              if (context.canPop()) context.pop();
            },
            child: ProgressiveEnterColumn(
              mainAxisAlignment: MainAxisAlignment.center,
              spacing: 8,
              children: [
                const Expanded(flex: 2, child: SizedBox()),
                IgnorePointer(
                  child: Message(
                    message: message,
                    isFirstInGroup: true,
                    center: true,
                    enableImageHero: false,
                  ),
                ),
                M3EButtonGroup(
                  size: M3EButtonSize.md,
                  actions: [
                    const M3EButtonGroupAction(
                      enabled: false,
                      icon: Icon(Symbols.edit_rounded),
                      label: Text("Edit"),
                      decoration: M3EButtonDecoration(
                        /*backgroundColor: WidgetStateProperty.all<Color>(
                          context.colorScheme.primary,
                        ),
                        foregroundColor: WidgetStateProperty.all<Color>(
                          context.colorScheme.onPrimary,
                        ),*/
                      ),
                    ),
                    const M3EButtonGroupAction(
                      enabled: false,
                      icon: Icon(Symbols.reply_rounded),
                      label: Text("Reply"),
                      decoration: M3EButtonDecoration(
                        /*backgroundColor: WidgetStateProperty.all<Color>(
                          context.colorScheme.primary,
                        ),
                        foregroundColor: WidgetStateProperty.all<Color>(
                          context.colorScheme.onPrimary,
                        ),*/
                      ),
                    ),
                  ],
                  onSelectedIndicesChanged: (ind) {},
                ),
                M3EButtonGroup(
                  size: M3EButtonSize.md,
                  actions: [
                    M3EButtonGroupAction(
                      icon: const Icon(Symbols.delete_rounded),
                      label: const Text("Delete"),
                      decoration: M3EButtonDecoration(
                        backgroundColor: WidgetStateProperty.all<Color>(
                          context.colorScheme.errorContainer,
                        ),
                        foregroundColor: WidgetStateProperty.all<Color>(
                          context.colorScheme.onErrorContainer,
                        ),
                      ),
                    ),
                    const M3EButtonGroupAction(
                      enabled: false,
                      icon: Icon(Symbols.info_rounded),
                    ),
                  ],
                  onSelectedIndexChanged: (ind) async {
                    switch (ind) {
                      case 0: // Delete
                        await apiClient.deleteMessage(message.id);
                        break;
                    }
                    if (context.mounted && context.canPop()) context.pop();
                  },
                ),
                const Expanded(flex: 1, child: SizedBox()),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
