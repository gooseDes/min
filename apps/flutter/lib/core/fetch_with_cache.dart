import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:min_flutter/core/client.dart';
import 'package:min_flutter/core/logger.dart';
import 'package:min_flutter/features/storage/database_provider.dart';
import 'package:min_types/index.dart';

void fetchMessageWithCache(
  WidgetRef ref, {
  required int messageId,
  required void Function(MessageData) onUpdate,
  void Function(Object? error, StackTrace? stackTrace)? onError,
}) {
  final db = ref.watch(databaseProvider);
  bool fetched = false;

  db
      .getMessage(messageId)
      .then((data) {
        if (!fetched) onUpdate(data);
      })
      .onError((error, stackTrace) {
        logger.w(
          'Could not get user\'s info from db when doing fetch with cache',
          error: error,
          stackTrace: stackTrace,
        );
      });

  apiClient
      .fetchMessage(messageId)
      .then((data) {
        fetched = true;
        onUpdate(data);
      })
      .onError((e, s) {
        onError?.call(e, s);
      });
}

void fetchUserWithCache(
  WidgetRef ref, {
  required int userId,
  required void Function(UserData) onUpdate,
  void Function(Object? error, StackTrace? stackTrace)? onError,
}) {
  final db = ref.watch(databaseProvider);
  bool fetched = false;

  db
      .getUser(userId)
      .then((data) {
        if (!fetched) onUpdate(data);
      })
      .onError((error, stackTrace) {
        logger.w(
          'Could not get user\'s info from db when doing fetch with cache',
          error: error,
          stackTrace: stackTrace,
        );
      });

  apiClient
      .fetchUser(userId)
      .then((data) {
        fetched = true;
        onUpdate(data);
      })
      .onError((e, s) {
        onError?.call(e, s);
      });
}
