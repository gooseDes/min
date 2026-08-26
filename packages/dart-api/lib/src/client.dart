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

  Future<List<ChatDataWithParticipants>> fetchChats() async {
    final completer = Completer<List<ChatDataWithParticipants>>();

    void handler(data) {
      if (data.success) {
        completer.complete(data);
      } else {
        completer.completeError(data);
      }
      socket!.off('fetchChats', handler);
    }

    socket!.on('fetchChats', handler);
    socket!.emit('fetchChats', {});

    return completer.future;
  }
}
