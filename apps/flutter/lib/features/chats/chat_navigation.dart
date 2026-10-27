import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:min_flutter/core/router.dart';

class ChatNavigation extends Notifier<int?> {
  @override
  int? build() {
    final delegate = ref.watch(routerProvider).routerDelegate;

    int? read() => int.tryParse(
      delegate.currentConfiguration.pathParameters['chatId'] ?? '',
    );

    void sync() {
      if (!ref.mounted) return;
      final id = read();
      if (state != id) state = id;
    }

    delegate.addListener(sync);
    ref.onDispose(() => delegate.removeListener(sync));
    return read();
  }

  void openChat(int chatId) =>
      ref.read(routerProvider).push('/home/chat/$chatId');

  void closeChat() {
    final router = ref.read(routerProvider);
    router.canPop() ? router.pop() : router.go('/home');
  }
}

final chatNavigationProvider = NotifierProvider<ChatNavigation, int?>(
  ChatNavigation.new,
);
