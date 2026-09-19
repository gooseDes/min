import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:min_api/index.dart';
import 'package:min_flutter/core/client.dart';
import 'package:min_flutter/core/fetch_and_save.dart';
import 'package:min_flutter/features/dialogs/dialogs.dart';
import 'package:min_flutter/features/storage/secure_storage.dart';
import 'package:min_flutter/features/storage/storage.dart';

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
  ApiSubscription? _messagesSubscription;

  @override
  AuthState build() {
    init(ref);
    return AuthState(isAuthenticated: false);
  }

  Future<void> init(Ref ref) async {
    final secStorage = SecureStorage();
    final token = await secStorage.getToken();
    final storage = Storage();
    final userId = await storage.get(StorageKey.userId);
    final username = await storage.get(StorageKey.userUsername);
    if (userId != null && username != null && token != null) {
      state = AuthState(isAuthenticated: true, username: username, id: userId);
      apiClient.initSocket(token);
      _messagesSubscription = await apiClient.subscribeToNewMessages((message) {
        requestAddingMessage(ref, message);
      });
    }
  }

  Future<void> login(String email, String password) async {
    final response = await apiClient.login(email, password);
    response.when(
      success: (token, username, id) async {
        state = AuthState(isAuthenticated: true, username: username, id: id);
        final secStorage = SecureStorage();
        await secStorage.saveToken(token);
        final storage = Storage();
        await storage.set(StorageKey.userId, id);
        await storage.set(StorageKey.userUsername, username);
        apiClient.initSocket(token);
        _messagesSubscription = await apiClient.subscribeToNewMessages((
          message,
        ) {
          requestAddingMessage(ref, message);
        });
      },
      failure: (message) {
        state = AuthState(isAuthenticated: false);
        showError(message);
      },
    );
  }

  void logout() {
    state = AuthState(isAuthenticated: false);
    _messagesSubscription?.unsubscribe();
    _messagesSubscription = null;
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(
  () => AuthNotifier(),
);
