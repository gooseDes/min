import 'package:collection/collection.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:min_flutter/features/auth/auth_provider.dart';
import 'package:min_flutter/features/storage/database.dart';

final databaseProvider = Provider<AppDatabase>((ref) {
  final db = AppDatabase();
  ref.onDispose(() => db.close());
  return db;
});

// Chats
final allChatsProvider = StreamProvider<List<ChatWithAvatar>>((ref) {
  final auth = ref.watch(authProvider);
  final db = ref.watch(databaseProvider);
  return db.watchChats(auth.id!);
});

final chatIdsProvider = Provider<List<int>>((ref) {
  final chats = ref.watch(allChatsProvider).value ?? [];
  return chats.map((chat) => chat.id).toList();
});

final singleChatProvider = Provider.family<ChatWithAvatar?, int>((
  ref,
  int chatId,
) {
  final chats = ref.watch(allChatsProvider).value ?? [];
  return chats.firstWhereOrNull((chat) => chat.id == chatId);
});

// Messages
final allMessagesProvider = StreamProvider.family<List<DbMessage>, int>((
  ref,
  int chatId,
) {
  final db = ref.watch(databaseProvider);
  return db.watchMessages(chatId);
});

final messageIdsProvider = Provider.family<List<int>, int>((ref, int chatId) {
  final messages = ref.watch(allMessagesProvider(chatId)).value ?? [];
  return messages.map((message) => message.id).toList();
});

final singleMessageProvider =
    Provider.family<DbMessage?, ({int chatId, int messageId})>((ref, args) {
      final messages = ref.watch(allMessagesProvider(args.chatId)).value ?? [];
      return messages.firstWhereOrNull(
        (message) => message.id == args.messageId,
      );
    });
