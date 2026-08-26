import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:min_flutter/core/theme_ext.dart';
import 'package:min_flutter/core/ui/profile_thing.dart';

class ChatsScreen extends ConsumerWidget {
  const ChatsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    print("test");
    return Scaffold(
      appBar: AppBar(
        title: Center(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            spacing: 8,
            children: [
              const Icon(Symbols.chat_rounded),
              Text("Chats", style: context.textTheme.headlineSmall),
            ],
          ),
        ),
      ),
      body: Align(
        alignment: Alignment.topCenter,
        child: ListView.separated(
          shrinkWrap: true,
          itemCount: 11,
          itemBuilder: (context, index) {
            return ProfileThing(
              type: index == 0
                  ? ProfileThingType.top
                  : index == 10
                  ? ProfileThingType.bottom
                  : ProfileThingType.normal,
              name: "User $index",
              undername: "@user_$index",
            );
          },
          separatorBuilder: (context, index) {
            return const SizedBox(height: 0);
          },
        ),
      ),
      floatingActionButton: FloatingActionButton(
        child: const Icon(Symbols.chat_add_on_rounded),
        onPressed: () {},
      ),
    );
  }
}
