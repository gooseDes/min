import 'package:flutter_animate/flutter_animate.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/router.dart';
import 'package:min_flutter/core/theme_ext.dart';
import 'package:min_flutter/features/chats/chats_screen.dart';

class HomeRoot extends StatelessWidget {
  const HomeRoot({super.key});

  @override
  Widget build(BuildContext context) => context.isExpanded
      ? Align(
          alignment: Alignment.center,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Icon(Symbols.waving_hand_rounded, size: 128)
                  .animate()
                  .shake(rotation: 0.2, delay: const Duration(seconds: 1)),
              Text('Welcome!', style: context.textTheme.displayLarge),
              Text(
                'Click any of the chats to start chatting',
                style: context.textTheme.displaySmall,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        )
      : const ChatsScreen();
}
