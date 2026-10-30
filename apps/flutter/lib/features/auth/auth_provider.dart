import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:min_api/index.dart';
import 'package:min_flutter/core/client.dart';
import 'package:min_flutter/core/fetch_and_save.dart';
import 'package:min_flutter/features/dialogs/dialogs.dart';
import 'package:min_flutter/features/dialogs/loading_provider.dart';
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
  ApiSubscription? _messageDeletionSubscription;

  @override
  AuthState build() {
    _init(ref);
    return AuthState(isAuthenticated: false);
  }

  Future<void> _init(Ref ref) async {
    final secStorage = SecureStorage();
    final token = await secStorage.getToken();
    final storage = Storage();
    final userId = await storage.get(StorageKey.userId);
    final username = await storage.get(StorageKey.userUsername);
    if (userId != null && username != null && token != null) {
      state = AuthState(isAuthenticated: true, username: username, id: userId);
      await getReady(token);
    }
  }

  Future<void> getReady(String token) async {
    apiClient.initSocket(token);
    _messagesSubscription = await apiClient.subscribeToNewMessages((message) {
      requestAddingMessage(ref, message);
    });
    _messageDeletionSubscription = await apiClient.subscribeToMessageDeletion((
      messageId,
    ) {
      requestMessageDeletion(ref, messageId);
    });
  }

  Future<void> login({required String email, required String password}) async {
    ref.read(isLoadingProvider.notifier).startLoading('auth');
    final response = await apiClient.login(email, password);
    response.when(
      success: (token, username, id) async {
        state = AuthState(isAuthenticated: true, username: username, id: id);
        final secStorage = SecureStorage();
        await secStorage.saveToken(token);
        final storage = Storage();
        await storage.set(StorageKey.userId, id);
        await storage.set(StorageKey.userUsername, username);
        await getReady(token);
      },
      failure: (message) {
        state = AuthState(isAuthenticated: false);
        showError(message);
      },
    );
    ref.read(isLoadingProvider.notifier).endLoading('auth');
  }

  Future<void> register({
    required String email,
    required String username,
    required String password,
  }) async {
    ref.read(isLoadingProvider.notifier).startLoading('auth');
    final response = await apiClient.register(email, username, password);
    response.when(
      success: (token, username, id) async {
        state = AuthState(isAuthenticated: true, username: username, id: id);
        final secStorage = SecureStorage();
        await secStorage.saveToken(token);
        final storage = Storage();
        await storage.set(StorageKey.userId, id);
        await storage.set(StorageKey.userUsername, username);
        await getReady(token);
      },
      failure: (message) {
        state = AuthState(isAuthenticated: false);
        showError(message);
      },
    );
    ref.read(isLoadingProvider.notifier).endLoading('auth');
  }

  void logout() async {
    state = AuthState(isAuthenticated: false);
    _messagesSubscription?.unsubscribe();
    _messagesSubscription = null;
    _messageDeletionSubscription?.unsubscribe();
    _messageDeletionSubscription = null;
    apiClient.closeSocket();
    await SecureStorage().clearAll();
    await Storage().clear();
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(
  () => AuthNotifier(),
);
