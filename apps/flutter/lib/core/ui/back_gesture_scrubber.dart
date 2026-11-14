import 'package:material_ui/material_ui.dart';
import 'package:flutter/services.dart';

class BackGestureScrubber extends StatefulWidget {
  const BackGestureScrubber({super.key, required this.child});

  final Widget child;

  @override
  State<BackGestureScrubber> createState() => _BackGestureScrubberState();
}

class _BackGestureScrubberState extends State<BackGestureScrubber>
    with WidgetsBindingObserver {
  ModalRoute<dynamic>? _route;
  bool _active = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _route = ModalRoute.of(context);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  bool get _canHandle {
    final route = _route;
    return route != null &&
        route.isCurrent &&
        !route.isFirst &&
        !route.willHandlePopInternally &&
        route.popDisposition != RoutePopDisposition.doNotPop;
  }

  @override
  bool handleStartBackGesture(PredictiveBackEvent backEvent) {
    if (backEvent.isButtonEvent || !_canHandle) return false;
    _active = true;

    _route!.handleStartBackGesture(progress: 1 - backEvent.progress);
    return true;
  }

  @override
  void handleUpdateBackGestureProgress(PredictiveBackEvent backEvent) {
    if (!_active) return;
    _route?.handleUpdateBackGestureProgress(progress: 1 - backEvent.progress);
  }

  @override
  void handleCommitBackGesture() {
    if (!_active) return;
    _active = false;
    final route = _route;
    if (route == null) return;
    final navigator = route.navigator;
    navigator?.pop();
    navigator?.didStopUserGesture();
  }

  @override
  void handleCancelBackGesture() {
    if (!_active) return;
    _active = false;
    _route?.handleCancelBackGesture();
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
