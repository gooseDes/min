import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:min_flutter/core/fetch_and_save.dart';
import 'package:min_flutter/core/theme_ext.dart';
import 'package:min_flutter/core/ui/profile_thing.dart';
import 'package:min_flutter/features/chats/chats_list_item.dart';
import 'package:min_flutter/features/storage/database_provider.dart';

class ChatsScreen extends ConsumerWidget {
  const ChatsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chatIds = ref.watch(chatIdsProvider);

    requestChatsListUpdate(ref);

    return Scaffold(
      appBar: AppBar(
        title: Center(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            spacing: 8,
            children: [
              const Icon(Symbols.chat_rounded),
              Text("Chats", style: context.textTheme.headlineSmall),
            ],
          ),
        ),
      ),
      body: Align(
        alignment: Alignment.topCenter,
        child: ListView.separated(
          shrinkWrap: true,
          itemCount: chatIds.length,
          itemBuilder: (context, index) {
            final chatId = chatIds[index];
            return ChatsListItem(
              type: index == 0
                  ? ProfileThingType.top
                  : index == chatIds.length - 1
                  ? ProfileThingType.bottom
                  : ProfileThingType.normal,
              chatId: chatId,
            );
          },
          separatorBuilder: (context, index) {
            return const SizedBox(height: 0);
          },
        ),
      ),
      floatingActionButton: FloatingActionButton(
        child: const Icon(Symbols.chat_add_on_rounded),
        onPressed: () {},
      ),
    );
  }
}
