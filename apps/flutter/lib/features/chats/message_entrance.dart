import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_ui/material_ui.dart';
import 'package:motor/motor.dart';

final _animatedMessageIdsProvider = Provider.autoDispose<Set<int>>(
  (ref) => <int>{},
);

enum MessageEntranceDirection { left, right }

class MessageEntrance extends ConsumerStatefulWidget {
  const MessageEntrance({
    super.key,
    required this.child,
    required this.animate,
    required this.id,
    this.delay = Duration.zero,
    this.direction = MessageEntranceDirection.left,
  });

  final Widget child;
  final bool animate;
  final int id;
  final Duration delay;
  final MessageEntranceDirection direction;

  @override
  ConsumerState<MessageEntrance> createState() => _MessageEntranceState();
}

class _MessageEntranceState extends ConsumerState<MessageEntrance> {
  bool _shown = false;

  @override
  void initState() {
    super.initState();

    ref.listenManual(_animatedMessageIdsProvider, (_, _) {});
    final animatedMessageIds = ref.read(_animatedMessageIdsProvider);

    if (!widget.animate || animatedMessageIds.contains(widget.id)) {
      _shown = true;
      return;
    }

    _shown = false;
    animatedMessageIds.add(widget.id);

    Future.delayed(widget.delay, () {
      if (mounted) setState(() => _shown = true);
    });
  }

  @override
  Widget build(BuildContext context) {
    final offset = Offset(
      widget.direction == MessageEntranceDirection.left ? -50 : 50,
      0,
    );
    return MotionBuilder(
      motion: const MaterialSpringMotion.expressiveSpatialDefault(),
      value: _shown ? Offset.zero : offset,
      from: offset,
      builder: (context, offset, child) =>
          Transform.translate(offset: offset, child: child),
      converter: const OffsetMotionConverter(),
      child: SingleMotionBuilder(
        motion: const MaterialSpringMotion.expressiveSpatialDefault(),
        value: _shown ? 1.0 : 0.0,
        builder: (context, scale, child) => Transform.scale(
          scale: scale,
          alignment: widget.direction == MessageEntranceDirection.left
              ? Alignment.centerLeft
              : Alignment.centerRight,
          child: child,
        ),
        child: SingleMotionBuilder(
          motion: const MaterialSpringMotion.expressiveEffectsDefault(),
          value: _shown ? 1.0 : 0.0,
          builder: (context, opacity, child) =>
              Opacity(opacity: opacity.clamp(0, 1), child: child),
          child: widget.child,
        ),
      ),
    );
  }
}
