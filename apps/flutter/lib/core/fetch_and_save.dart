import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:min_flutter/core/client.dart';
import 'package:min_flutter/features/storage/database_provider.dart';

Future<void> requestChatListUpdate(WidgetRef ref) async {
  final db = ref.read(databaseProvider);
  final chats = await apiClient.fetchChats();
  for (final chat in chats) {
    await db.addChatWithParticipants(chat);
  }
}
