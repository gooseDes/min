import 'package:flutter_riverpod/flutter_riverpod.dart';

class ReplyState {
  final int id;
  final String senderUsername;
  final String content;

  ReplyState({
    required this.id,
    required this.senderUsername,
    required this.content,
  });
}

class ReplyNotifier extends Notifier<ReplyState?> {
  @override
  build() {
    return null;
  }

  void replyTo({
    required int id,
    required String senderUsername,
    required String content,
  }) {
    state = ReplyState(
      id: id,
      senderUsername: senderUsername,
      content: content,
    );
  }

  void clear() {
    state = null;
  }
}

final replyProvider = NotifierProvider<ReplyNotifier, ReplyState?>(
  () => ReplyNotifier(),
);
