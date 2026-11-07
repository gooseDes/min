import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/router.dart';
import 'package:min_flutter/features/chats/chats_screen.dart';

class AdaptiveShell extends StatelessWidget {
  final Widget child;
  const AdaptiveShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    if (!context.isExpanded) return child;
    return Row(
      children: [
        const SizedBox(width: 380, child: ChatsScreen()),
        const VerticalDivider(width: 1),
        Expanded(child: child),
      ],
    );
  }
}
