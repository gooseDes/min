import 'package:cached_network_image_ce/cached_network_image.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/client.dart';
import 'package:min_flutter/core/theme_ext.dart';
import 'package:min_flutter/features/auth/auth_provider.dart';
import 'package:min_flutter/features/chats/message_entrance.dart';
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
    final userId = ref.watch(authProvider).id;
    final isMy = userId == message.senderId;
    final entranceMsgAmount = (MediaQuery.sizeOf(context).height / 50).ceil();

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
              Card.filled(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.only(
                    topLeft: isMy ? const Radius.circular(12) : Radius.zero,
                    topRight: isMy ? Radius.zero : const Radius.circular(12),
                    bottomLeft: const Radius.circular(12),
                    bottomRight: const Radius.circular(12),
                  ),
                ),
                color: context.colorScheme.surfaceContainer,
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (isFirstInGroup)
                        Text(
                          isMy ? 'You' : message.sender.username,
                          style: context.textTheme.bodyMedium?.copyWith(
                            color: context.colorScheme.secondary,
                          ),
                          textAlign: TextAlign.left,
                        ),
                      Flexible(
                        child: Text(
                          message.content,
                          textWidthBasis: TextWidthBasis.longestLine,
                        ),
                      ),
                    ],
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
