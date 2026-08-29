import 'package:flutter_riverpod/flutter_riverpod.dart';

class SelectedChatIdNotifier extends Notifier<int?> {
  @override
  int? build() {
    return null;
  }

  void openChat(int chatId) {
    state = chatId;
  }

  void closeChat() {
    state = null;
  }
}

final selectedChatIdProvider = NotifierProvider<SelectedChatIdNotifier, int?>(
  () => SelectedChatIdNotifier(),
);
