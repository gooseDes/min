import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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
    return Text(message?.content ?? 'Unknown');
  }
}
