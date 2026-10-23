import 'package:flutter_riverpod/flutter_riverpod.dart';

class LoadingState {
  final bool isLoading;
  final List<String> eventsCausing;

  LoadingState({required this.eventsCausing, required this.isLoading});
}

class IsLoadingNotifier extends Notifier<LoadingState> {
  @override
  LoadingState build() {
    return LoadingState(eventsCausing: [], isLoading: false);
  }

  void startLoading(String eventTag) {
    state = LoadingState(
      eventsCausing: [...state.eventsCausing, eventTag],
      isLoading: true,
    );
  }

  void endLoading(String eventTag) {
    if (state.eventsCausing.contains(eventTag)) {
      final withoutThisTag = state.eventsCausing
          .where((element) => element != eventTag)
          .toList();
      state = LoadingState(
        eventsCausing: withoutThisTag,
        isLoading: withoutThisTag.isNotEmpty,
      );
    }
  }
}

final isLoadingProvider = NotifierProvider<IsLoadingNotifier, LoadingState>(
  () => IsLoadingNotifier(),
);
