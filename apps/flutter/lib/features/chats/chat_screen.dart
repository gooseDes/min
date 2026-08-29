import 'package:cached_network_image_ce/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:min_flutter/core/client.dart';
import 'package:min_flutter/core/theme_ext.dart';
import 'package:min_flutter/features/chats/selected_chat_provider.dart';
import 'package:min_flutter/features/storage/database.dart';

class ChatScreen extends ConsumerWidget {
  final ChatWithAvatar? chat;

  const ChatScreen({super.key, this.chat});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
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
    );
  }
}
