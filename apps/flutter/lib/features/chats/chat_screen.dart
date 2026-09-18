import 'package:cached_network_image_ce/cached_network_image.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:inspire_blur/inspire_blur.dart';
import 'package:material_3_expressive/material_3_expressive.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/client.dart';
import 'package:min_flutter/core/safe_area_insets_provider.dart';
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
    final safeAreaPadding = ref.watch(safeAreaInsetsProvider);

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
              style: M3ETheme.of(context).typography.baseline.headlineSmall
                  .copyWith(
                    fontVariations: const [
                      FontVariation("GRAD", 100),
                      FontVariation("wght", 500),
                      FontVariation("ROND", 100),
                    ],
                  ),
            ),
          ],
        ),
        leading: M3EIconButton(
          icon: const Icon(Symbols.arrow_back),
          onPressed: () {
            ref.read(selectedChatIdProvider.notifier).closeChat();
          },
        ),
      ),
      body: Padding(
        padding: EdgeInsets.only(bottom: safeAreaPadding.bottom),
        child: Card.filled(
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(24)),
          ),
          color: context.colorScheme.surface,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Positioned.fill(
                    child: messagesAsync.when(
                      data: (messages) => ListView.builder(
                        reverse: true,
                        itemCount: messages.length,
                        padding: const EdgeInsets.only(bottom: 90, top: 64),
                        scrollCacheExtent: const ScrollCacheExtent.viewport(1),
                        itemBuilder: (ctx, ind) {
                          final index = messages.length - 1 - ind;
                          final message = messages[index];
                          final isFirstInGroup =
                              index <= 0 ||
                              message.senderId != messages[index - 1].senderId;

                          return Message(
                            key: ValueKey(message.id),
                            message: message,
                            isFirstInGroup: isFirstInGroup,
                            entranceIndex: ind,
                            shouldAnimate: true,
                          );
                        },
                      ),
                      loading: () => const CircularProgressIndicator(),
                      error: (error, stack) => Text(error.toString()),
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 150,
                    child: Inspire.backdropBlur(
                      config: InspireBlurConfig.bottomToTop(sigma: 5),
                    ),
                  ),
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 64,
                    child: Inspire.backdropBlur(
                      config: InspireBlurConfig.topToBottom(sigma: 5),
                    ),
                  ),
                  Positioned(
                    bottom: 12,
                    left: 0,
                    right: 0,
                    height: 72,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      spacing: 12,
                      children: [
                        Expanded(
                          child: Card.filled(
                            margin: EdgeInsets.zero,
                            color: context.colorScheme.surfaceContainerLow,
                            elevation: 3,
                            child: const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 16),
                              child: Row(
                                mainAxisSize: MainAxisSize.max,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Expanded(
                                    child: TextField(
                                      keyboardType: TextInputType.multiline,
                                      minLines: 1,
                                      maxLines: 2,
                                      decoration: InputDecoration(
                                        border: InputBorder.none,
                                        focusedBorder: InputBorder.none,
                                        enabledBorder: InputBorder.none,
                                        errorBorder: InputBorder.none,
                                        disabledBorder: InputBorder.none,
                                        hintText: 'Your message goes here...',
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        M3EIconButton(
                          icon: const Icon(Symbols.send_rounded, size: 32),
                          variant: M3EIconButtonVariant.filled,
                          size: M3EIconButtonSize.md,
                          shape: M3EIconButtonShapeVariant.round,
                          onPressed: () {},
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
