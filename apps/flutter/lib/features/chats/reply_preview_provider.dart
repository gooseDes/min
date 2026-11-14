import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:min_flutter/core/fetched_providers.dart';

class ReplyPreview {
  final String content;
  final String username;

  const ReplyPreview({required this.content, required this.username});
}

final replyPreviewProvider = FutureProvider.autoDispose
    .family<ReplyPreview, int>((ref, messageId) async {
      final message = await ref.watch(
        messageByIdCachedProvider(messageId).future,
      );
      final user = await ref.watch(
        userByIdCachedProvider(message.senderId).future,
      );

      return ReplyPreview(content: message.content, username: user.username);
    });
