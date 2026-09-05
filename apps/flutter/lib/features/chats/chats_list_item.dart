import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:min_flutter/core/client.dart';
import 'package:min_flutter/core/fetch_and_save.dart';
import 'package:min_flutter/core/ui/profile_thing.dart';
import 'package:min_flutter/features/chats/selected_chat_provider.dart';
import 'package:min_flutter/features/storage/database_provider.dart';

class ChatsListItem extends ConsumerWidget {
  final int chatId;
  final ProfileThingType type;

  const ChatsListItem({super.key, required this.chatId, required this.type});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chat = ref.watch(singleChatProvider(chatId));
    if (chat == null) return const SizedBox.shrink();

    return ProfileThing(
      type: type,
      name: chat.name,
      undername: "WIP",
      avatarUrl: apiClient.avatarToUrl(chat.avatar),
      onTap: () {
        ref.read(selectedChatIdProvider.notifier).openChat(chatId);
        requestChatUpdate(ref, chatId);
      },
    );
  }
}
