import 'dart:math';

import 'package:cached_network_image_ce/cached_network_image.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:markdown_widget/markdown_widget.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/client.dart';
import 'package:min_flutter/core/datetime_ext.dart';
import 'package:min_flutter/core/flutter_theme_bridge.dart';
import 'package:min_flutter/core/theme_ext.dart';
import 'package:min_flutter/core/ui/markdown_config.dart';
import 'package:min_flutter/features/auth/auth_provider.dart';
import 'package:min_flutter/features/chats/message_actions.dart';
import 'package:min_flutter/features/chats/message_entrance.dart';
import 'package:min_flutter/features/chats/reply_preview_provider.dart';
import 'package:min_flutter/features/chats/utils.dart';
import 'package:min_flutter/features/settings/settings_provider.dart';
import 'package:min_types/index.dart';

class Message extends HookConsumerWidget {
  const Message({
    super.key,
    required this.message,
    required this.isFirstInGroup,
    this.center = false,
    this.enableImageHero = true,
    this.shouldAnimate = true,
    this.entranceIndex = 0,
  });

  final MessageDataWithSender message;
  final bool isFirstInGroup;
  final bool center;
  final bool enableImageHero;
  final bool shouldAnimate;
  final int entranceIndex;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsProvider);
    final userId = ref.watch(authProvider).id;
    final isMy = userId == message.senderId;
    final entranceMsgAmount = (MediaQuery.sizeOf(context).height / 50).ceil();
    final isColoredInPrimary = settings.enableColorOwnMessages.value && isMy;
    final replyId = parseReplyId(message.content);
    final replyPreview = replyId == null
        ? null
        : ref.watch(replyPreviewProvider(replyId));

    return GestureDetector(
      onTapUp: (tap) {
        openMessageActions(context, message);
      },
      child: Container(
        color: Colors.transparent,
        child: Align(
          alignment: center
              ? Alignment.center
              : (isMy ? Alignment.centerRight : Alignment.centerLeft),
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: min(MediaQuery.sizeOf(context).width * 0.8, 480),
            ),
            child: MessageEntrance(
              id: message.id,
              direction: isMy
                  ? MessageEntranceDirection.right
                  : MessageEntranceDirection.left,
              animate: shouldAnimate && entranceIndex < entranceMsgAmount,
              delay: entranceIndex < entranceMsgAmount
                  ? Duration(milliseconds: entranceIndex * 50)
                  : Duration.zero,
              child: Column(
                crossAxisAlignment: isMy
                    ? CrossAxisAlignment.end
                    : CrossAxisAlignment.start,
                children: [
                  if (isFirstInGroup)
                    Padding(
                      padding: const EdgeInsets.only(left: 4, top: 8),
                      child: CircleAvatar(
                        backgroundImage: CachedNetworkImageProvider(
                          apiClient.avatarToUrl(message.sender.avatar),
                        ),
                      ),
                    ),
                  AnimatedSize(
                    curve: Curves.fastOutSlowIn,
                    duration: const Duration(milliseconds: 300),
                    child: Card.filled(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.only(
                          topLeft: isMy
                              ? const Radius.circular(12)
                              : Radius.zero,
                          topRight: isMy
                              ? Radius.zero
                              : const Radius.circular(12),
                          bottomLeft: const Radius.circular(12),
                          bottomRight: const Radius.circular(12),
                        ),
                      ),
                      color: isColoredInPrimary
                          ? context.colorScheme.primaryContainer
                          : context.colorScheme.surfaceContainer,
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: IntrinsicWidth(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              if (isFirstInGroup)
                                Text(
                                  isMy ? 'You' : message.sender.username,
                                  style: context.typography.baseline.titleSmall
                                      .copyWith(
                                        color: isColoredInPrimary
                                            ? context
                                                  .colorScheme
                                                  .onPrimaryContainer
                                            : context.colorScheme.onSurface,
                                      ),
                                  textAlign: TextAlign.left,
                                ),
                              if (replyPreview != null)
                                Row(
                                  spacing: 4,
                                  children: [
                                    const Icon(Symbols.reply_rounded, size: 16),
                                    Expanded(
                                      child: Text(
                                        replyPreview.when(
                                          data: (preview) =>
                                              '${preview.username}: ${stripCommands(preview.content)}',
                                          loading: () => '...',
                                          error: (e, _) => 'Error: $e',
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: context.textTheme.bodySmall
                                            ?.copyWith(
                                              color:
                                                  context.colorScheme.secondary,
                                            ),
                                      ),
                                    ),
                                  ],
                                ),
                              Flexible(
                                child: FlutterThemeBridge(
                                  child: MarkdownBlock(
                                    data: stripCommands(message.content),
                                    config: generateMarkdownConfig(
                                      context,
                                      isColoredInPrimary
                                          ? context
                                                .colorScheme
                                                .onPrimaryContainer
                                          : context.colorScheme.onSurface,
                                      enableImageHero,
                                    ),
                                  ),
                                ),
                              ),
                              Text(
                                message.sentAt.toPrettyString(),
                                style: context.typography.baseline.labelSmall
                                    .copyWith(
                                      color: isColoredInPrimary
                                          ? context
                                                .colorScheme
                                                .onPrimaryContainer
                                          : context.colorScheme.onSurface,
                                    ),
                                textWidthBasis: TextWidthBasis.parent,
                                textAlign: TextAlign.right,
                              ),
                            ],
                          ),
                        ),
                      ),
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
