import 'package:cached_network_image_ce/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:min_flutter/core/client.dart';
import 'package:min_flutter/core/theme_ext.dart';
import 'package:min_flutter/features/chats/message.dart';
import 'package:min_flutter/features/chats/selected_chat_provider.dart';
import 'package:min_flutter/features/storage/database.dart';
import 'package:min_flutter/features/storage/database_provider.dart';

class ChatScreen extends ConsumerWidget {
  final ChatWithAvatar? chat;

  const ChatScreen({super.key, this.chat});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final messagesAsync = ref.watch(allMessagesProvider(chat?.id ?? 0));

    return Scaffold(
      backgroundColor: context.colorScheme.surfaceContainer,
      appBar: AppBar(
        backgroundColor: context.colorScheme.surfaceContainer,
        scrolledUnderElevation: 0.0,
        title: Row(
          spacing: 8,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            CircleAvatar(
              backgroundImage: CachedNetworkImageProvider(
                apiClient.avatarToUrl(chat?.avatar),
              ),
            ),
            Text(
              chat?.name ?? 'Unknown',
              style: context.textTheme.headlineSmall,
            ),
          ],
        ),
        leading: IconButton(
          icon: const Icon(Symbols.arrow_back),
          onPressed: () {
            ref.read(selectedChatIdProvider.notifier).closeChat();
          },
        ),
      ),
      body: Card.filled(
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(24)),
        ),
        color: context.colorScheme.surface,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: messagesAsync.when(
              data: (messages) => ListView.builder(
                reverse: true,
                itemCount: messages.length,
                itemBuilder: (ctx, ind) {
                  final index = messages.length - 1 - ind;
                  final message = messages[index];
                  final isFirstInGroup =
                      index == 0 ||
                      message.senderId != messages[index - 1].senderId;

                  return Message(
                    key: ValueKey(message.id),
                    message: message,
                    isFirstInGroup: isFirstInGroup,
                  );
                },
              ),
              loading: () => const CircularProgressIndicator(),
              error: (error, stack) => Text(error.toString()),
            ),
          ),
        ),
      ),
    );
  }
}
