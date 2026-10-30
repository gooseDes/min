import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:min_flutter/core/client.dart';
import 'package:min_flutter/features/storage/database_provider.dart';
import 'package:min_types/index.dart';

Future<void> requestChatListUpdate(WidgetRef ref) async {
  final db = ref.read(databaseProvider);
  final chats = await apiClient.fetchChats();

  // Leave chats adding/updating
  final addingFuture = db.addChatsWithParticipants(chats);

  // Delete chats that are no longer on server
  final newChatIds = chats.map((chat) => chat.id);
  final dbChatIds = await db.getChatIds();
  final toDelete = dbChatIds.where((id) => !newChatIds.contains(id));
  for (final id in toDelete) {
    await db.deleteChat(id);
  }

  // Come back to initial task
  await addingFuture;
}

Future<void> requestChatUpdate(WidgetRef ref, int chatId) async {
  final db = ref.read(databaseProvider);
  final msgs = await apiClient.fetchChatMessages(chatId);

  // Leave messages adding/updating
  final addingFuture = db.addMessagesWithSenders(msgs);

  // Delete messages that are no longer on server
  final newMsgIds = msgs.map((msg) => msg.id);
  final dbMsgIds = await db.getMessageIdsInChat(chatId);
  final toDelete = dbMsgIds.where((id) => !newMsgIds.contains(id));
  for (final id in toDelete) {
    await db.deleteMessage(id);
  }

  // Come back to initial task
  await addingFuture;
}

Future<void> requestAddingMessage(
  Ref ref,
  MessageDataWithSender message,
) async {
  final db = ref.read(databaseProvider);
  await db.addMessageWithSender(message);
}

Future<void> requestMessageDeletion(Ref ref, int messageId) async {
  final db = ref.read(databaseProvider);
  await db.deleteMessage(messageId);
}
