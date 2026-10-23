import 'package:cached_network_image_ce/cached_network_image.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:markdown_widget/markdown_widget.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/client.dart';
import 'package:min_flutter/core/datetime_ext.dart';
import 'package:min_flutter/core/flutter_theme_bridge.dart';
import 'package:min_flutter/core/theme_ext.dart';
import 'package:min_flutter/core/ui/markdown_config.dart';
import 'package:min_flutter/features/auth/auth_provider.dart';
import 'package:min_flutter/features/chats/message_entrance.dart';
import 'package:min_flutter/features/settings/settings_provider.dart';
import 'package:min_types/index.dart';

class Message extends ConsumerWidget {
  const Message({
    super.key,
    required this.message,
    required this.isFirstInGroup,
    this.shouldAnimate = true,
    this.entranceIndex = 0,
  });

  final MessageDataWithSender message;
  final bool isFirstInGroup;
  final bool shouldAnimate;
  final int entranceIndex;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsProvider);
    final userId = ref.watch(authProvider).id;
    final isMy = userId == message.senderId;
    final entranceMsgAmount = (MediaQuery.sizeOf(context).height / 50).ceil();
    final isColoredInPrimary = settings.enableColorOwnMessages.value && isMy;

    return Align(
      alignment: isMy ? Alignment.centerRight : Alignment.centerLeft,
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.sizeOf(context).width * 0.8,
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
                  padding: const EdgeInsets.symmetric(horizontal: 4),
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
                      topLeft: isMy ? const Radius.circular(12) : Radius.zero,
                      topRight: isMy ? Radius.zero : const Radius.circular(12),
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
                                        ? context.colorScheme.onPrimaryContainer
                                        : context.colorScheme.onSurface,
                                  ),
                              textAlign: TextAlign.left,
                            ),
                          Flexible(
                            child: FlutterThemeBridge(
                              child: MarkdownBlock(
                                data: message.content,
                                config: generateMarkdownConfig(
                                  context,
                                  isColoredInPrimary
                                      ? context.colorScheme.onPrimaryContainer
                                      : context.colorScheme.onSurface,
                                ),
                              ),
                            ),
                          ),
                          Text(
                            message.sentAt.toPrettyString(),
                            style: context.typography.baseline.labelSmall
                                .copyWith(
                                  color: isColoredInPrimary
                                      ? context.colorScheme.onPrimaryContainer
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
    );
  }
}
