import 'dart:convert';

import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:http/http.dart' as http;

part 'client.freezed.dart';

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
}
