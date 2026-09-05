import 'dart:async';
import 'dart:convert';

import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:http/http.dart' as http;
import 'package:logger/logger.dart';
import 'package:min_types/index.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

part 'client.freezed.dart';

final logger = Logger(
  printer: PrettyPrinter(
    methodCount: 2,
    errorMethodCount: 8,
    lineLength: 128,
    colors: true,
    printEmojis: true,
  ),
);

@freezed
sealed class AuthResult with _$AuthResult {
  const factory AuthResult.success({
    required String token,
    required String username,
    required int id,
  }) = _Success;

  const factory AuthResult.failure({required String message}) = _Failure;
}

class ApiClient {
  final String url;
  io.Socket? socket;
  Completer<io.Socket>? _socketCompleter;
  int _lastRequestId = 0;

  ApiClient({required this.url});

  Future<AuthResult> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$url/login'),
      headers: {'Content-Type': 'application/json; charset=UTF-8'},
      body: jsonEncode({"email": email, "password": password}),
    );

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (data.containsKey('token')) {
      return AuthResult.success(
        token: data['token'],
        username: data['username'],
        id: data['id'],
      );
    } else {
      return AuthResult.failure(message: data['msg'] ?? 'Unknown error');
    }
  }

  void initSocket(String token) {
    socket = io.io(
      url,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .enableAutoConnect()
          .setAuth({'token': token})
          .build(),
    );
    if (_socketCompleter != null) {
      _socketCompleter!.complete(socket!);
      _socketCompleter = null;
    }
    socket!.onConnect((_) {
      logger.i('Socket successfully connected!');
    });
    socket!.onConnectError((e) {
      logger.e('Socket connection error: $e');
    });
    socket!.onDisconnect((_) {
      logger.i('Socket disconnected');
    });
    socket!.onError((e) {
      logger.e('Socket error: $e');
    });
  }

  /// Returns the socket. If it's not initialized, waits for it to connect and then returns.
  Future<io.Socket> getSocket() async {
    if (socket != null) {
      _socketCompleter = null;
      return socket!;
    }
    _socketCompleter = Completer<io.Socket>();
    return _socketCompleter!.future;
  }

  Future<T> baseSocketRequest<T>(
    String event,
    T Function(dynamic) resultHandler, [
    Map<String, dynamic>? data,
  ]) async {
    final completer = Completer<T>();
    final requestId = ++_lastRequestId;
    void handler(data) {
      if (data['requestId'] != requestId) return;

      if (data['success']) {
        completer.complete(resultHandler(data));
      } else {
        completer.completeError(data['msg']);
      }
    }

    (await getSocket()).on(event, handler);
    (await getSocket()).emit(event, {...(data ?? {}), 'requestId': requestId});
    return completer.future;
  }

  Future<List<ChatDataWithParticipants>> fetchChats() async {
    return baseSocketRequest(
      'fetchChats',
      (data) => data['chats'].map<ChatDataWithParticipants>((c) {
        try {
          return ChatDataWithParticipants.fromJson(c);
        } catch (e) {
          return ChatDataWithParticipants(
            id: 0,
            name: 'Error',
            participants: [],
            type: ChatType.private,
          );
        }
      }).toList(),
    );
  }

  Future<List<MessageDataWithSender>> fetchChatMessages(int chatId) async {
    return baseSocketRequest(
      'fetchChatMessages',
      (data) => data['messages'].map<MessageDataWithSender>((m) {
        try {
          return MessageDataWithSender.fromJson(m);
        } catch (e) {
          return MessageDataWithSender(
            id: 0,
            chatId: chatId,
            content: 'Error',
            isSeen: false,
            seenAt: DateTime.now(),
            sender: Sender(id: 0, username: 'Error', avatar: 'image'),
            senderId: 0,
            sentAt: DateTime.now(),
          );
        }
      }).toList(),
      {'chatId': chatId},
    );
  }

  // Utility methods
  String avatarToUrl(String? avatar) {
    return '$url/avatars/$avatar.webp';
  }
}
