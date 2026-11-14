import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:min_flutter/core/client.dart';
import 'package:min_flutter/features/storage/database_provider.dart';
import 'package:min_types/index.dart';

final messageByIdCachedProvider = FutureProvider.autoDispose
    .family<MessageData, int>((ref, id) async {
      final db = ref.watch(databaseProvider);

      final cached = await db.getMessageOrNull(id);
      if (cached != null) return cached;

      return apiClient.fetchMessage(id);
    });

final userByIdCachedProvider = FutureProvider.autoDispose.family<UserData, int>(
  (ref, id) async {
    final db = ref.watch(databaseProvider);

    final cached = await db.getUserOrNull(id);
    if (cached != null) return cached;

    return apiClient.fetchUser(id);
  },
);
