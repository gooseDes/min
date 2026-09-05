import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:min_flutter/core/fetch_and_save.dart';
import 'package:min_flutter/core/theme_ext.dart';
import 'package:min_flutter/core/ui/profile_thing.dart';
import 'package:min_flutter/features/chats/chat_screen.dart';
import 'package:min_flutter/features/chats/chats_list_item.dart';
import 'package:min_flutter/features/chats/selected_chat_provider.dart';
import 'package:min_flutter/features/storage/database_provider.dart';

class ChatsScreen extends ConsumerStatefulWidget {
  const ChatsScreen({super.key});

  @override
  ConsumerState<ChatsScreen> createState() => _ChatsScreenState();
}

class _ChatsScreenState extends ConsumerState<ChatsScreen> {
  @override
  void initState() {
    super.initState();
    requestChatListUpdate(ref);
  }

  @override
  Widget build(BuildContext context) {
    final chatIds = ref.watch(chatIdsProvider);
    final selectedChatId = ref.watch(selectedChatIdProvider);
    final selectedChat = ref.watch(singleChatProvider(selectedChatId ?? 0));

    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 200),
      transitionBuilder: (Widget child, Animation<double> animation) {
        final slideTween = Tween<double>(begin: 30.0, end: 0.0);

        return FadeTransition(
          opacity: animation,
          child: AnimatedBuilder(
            animation: animation,
            builder: (context, child) {
              return Transform.translate(
                offset: Offset(
                  0,
                  slideTween.evaluate(
                    CurvedAnimation(
                      parent: animation,
                      curve: Curves.easeOut,
                      reverseCurve: Curves.easeIn,
                    ),
                  ),
                ),
                child: child,
              );
            },
            child: child,
          ),
        );
      },

      child: selectedChatId == null
          ? Scaffold(
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
              body: Padding(
                padding: const EdgeInsets.only(bottom: 8, left: 8, right: 8),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
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
              ),
              floatingActionButton: FloatingActionButton(
                child: const Icon(Symbols.chat_add_on_rounded),
                onPressed: () {},
              ),
            )
          : ChatScreen(chat: selectedChat),
    );
  }
}
