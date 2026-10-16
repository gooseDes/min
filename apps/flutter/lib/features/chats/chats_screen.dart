import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_3_expressive/material_3_expressive.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/fetch_and_save.dart';
import 'package:min_flutter/core/ui/profile_thing.dart';
import 'package:min_flutter/features/chats/chat_screen.dart';
import 'package:min_flutter/features/chats/chats_list_item.dart';
import 'package:min_flutter/features/chats/selected_chat_provider.dart';
import 'package:min_flutter/features/storage/database_provider.dart';
import 'package:motor/motor.dart';

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
    final safeAreaPadding = MediaQuery.paddingOf(context);

    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 200),
      transitionBuilder: (Widget child, Animation<double> animation) {
        return AnimatedBuilder(
          animation: animation,
          builder: (context, childNode) {
            final isEntering =
                animation.status == AnimationStatus.forward ||
                animation.status == AnimationStatus.completed;

            return SingleMotionBuilder(
              motion: const MaterialSpringMotion.standardSpatialDefault(),
              value: isEntering ? 1.0 : 2.0,
              builder: (context, springValue, child) {
                final xOffset = 30.0 * (1.0 - springValue);

                return FadeTransition(
                  opacity: animation,
                  child: Transform.translate(
                    offset: Offset(xOffset, 0),
                    child: child,
                  ),
                );
              },
              child: childNode,
            );
          },
          child: child,
        );
      },

      child: selectedChatId == null
          ? Scaffold(
              appBar: AppBar(
                title: const Center(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    spacing: 8,
                    children: [Icon(Symbols.chat_rounded), Text("Chats")],
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
              floatingActionButton: Padding(
                padding: EdgeInsets.only(bottom: safeAreaPadding.bottom),
                child: M3EFab(
                  size: M3EFabSize.regular,
                  icon: const Icon(Symbols.chat_add_on_rounded),
                  onPressed: () {},
                ),
              ),
            )
          : ChatScreen(chat: selectedChat),
    );
  }
}
