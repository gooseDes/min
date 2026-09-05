import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:min_flutter/core/theme_ext.dart';
import 'package:min_flutter/features/auth/auth_provider.dart';
import 'package:min_flutter/features/storage/database_provider.dart';

class Message extends ConsumerWidget {
  final int chatId;
  final int messageId;

  const Message({super.key, required this.chatId, required this.messageId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final message = ref.watch(
      singleMessageProvider((chatId: chatId, messageId: messageId)),
    );
    final userId = ref.watch(authProvider).id;

    return Row(
      mainAxisAlignment: userId == message?.senderId
          ? MainAxisAlignment.end
          : MainAxisAlignment.start,
      children: [
        Flexible(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final maxWidth = constraints.maxWidth * 0.8;

              return ConstrainedBox(
                constraints: BoxConstraints(maxWidth: maxWidth),
                child: Card.filled(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  color: context.colorScheme.surfaceContainer,
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Text(message?.content ?? 'Unknown'),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
