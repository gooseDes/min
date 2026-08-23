import 'package:dart_api/index.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:min_flutter/core/client.dart';
import 'package:min_flutter/features/auth/secure_storage.dart';
import 'package:min_flutter/features/dialogs/dialogs.dart';

class AuthState {
  final bool isAuthenticated;
  final String? username;
  final int? id;

  AuthState({required this.isAuthenticated, this.username, this.id});

  AuthState copyWith({bool? isAuthenticated, String? username, int? id}) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      username: username ?? this.username,
      id: id ?? this.id,
    );
  }
}

class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() {
    return AuthState(isAuthenticated: false);
  }

  Future<void> login(String email, String password) async {
    final response = await apiClient.login(email, password);
    response.when(
      success: (token, username, id) async {
        state = AuthState(isAuthenticated: true, username: username, id: id);
        final storage = SecureStorageService();
        await storage.saveToken(token);
      },
      failure: (message) {
        state = AuthState(isAuthenticated: false);
        showError(message);
      },
    );
  }

  void logout() {
    state = AuthState(isAuthenticated: false);
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(() {
  return AuthNotifier();
});
