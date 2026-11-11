import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:min_flutter/core/client.dart';
import 'package:min_flutter/core/logger.dart';
import 'package:min_flutter/features/storage/database_provider.dart';
import 'package:min_types/index.dart';

void _fetchWithCache<T>({
  required Future<T> Function() fromDb,
  required Future<T> Function() fromApi,
  required void Function(T) onUpdate,
  required String what,
  void Function(Object? error, StackTrace? stackTrace)? onError,
}) {
  var fetched = false;

  fromDb()
      .then((data) {
        if (!fetched) onUpdate(data);
      })
      .onError((e, s) {
        logger.w('Could not get $what from db', error: e, stackTrace: s);
      });

  fromApi()
      .then((data) {
        fetched = true;
        onUpdate(data);
      })
      .onError((e, s) {
        logger.w('Could not fetch $what from api', error: e, stackTrace: s);
        onError?.call(e, s);
      });
}

void fetchMessageWithCache(
  WidgetRef ref, {
  required int messageId,
  required void Function(MessageData) onUpdate,
  void Function(Object? error, StackTrace? stackTrace)? onError,
}) {
  final db = ref.read(databaseProvider);
  _fetchWithCache(
    fromDb: () => db.getMessage(messageId),
    fromApi: () => apiClient.fetchMessage(messageId),
    onUpdate: onUpdate,
    onError: onError,
    what: 'message $messageId',
  );
}

void fetchUserWithCache(
  WidgetRef ref, {
  required int userId,
  required void Function(UserData) onUpdate,
  void Function(Object? error, StackTrace? stackTrace)? onError,
}) {
  final db = ref.read(databaseProvider);
  _fetchWithCache(
    fromDb: () => db.getUser(userId),
    fromApi: () => apiClient.fetchUser(userId),
    onUpdate: onUpdate,
    onError: onError,
    what: 'user $userId',
  );
}
