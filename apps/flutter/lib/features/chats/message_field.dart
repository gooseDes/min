import 'package:flutter/services.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:material_3_expressive/material_3_expressive.dart';
import 'package:material_symbols_icons/material_symbols_icons.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/client.dart';
import 'package:min_flutter/core/device_type.dart';
import 'package:min_flutter/core/theme_ext.dart';
import 'package:min_flutter/features/storage/database.dart';

class MessageField extends HookWidget {
  const MessageField({super.key, required this.chat});

  final ChatWithAvatar? chat;

  @override
  Widget build(BuildContext context) {
    final fieldController = useTextEditingController();
    final fieldFocusNode = useFocusNode();

    Future<void> send() async {
      final text = fieldController.text.trim();
      if (chat?.id != null && text.isNotEmpty) {
        fieldController.clear();
        fieldFocusNode.requestFocus();
        await apiClient.sendMessage(chat!.id, text);
      }
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: 12,
      children: [
        Expanded(
          child: Card.filled(
            margin: EdgeInsets.zero,
            color: context.colorScheme.surfaceContainerLow,
            elevation: 3,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisSize: MainAxisSize.max,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Expanded(
                    child: TextField(
                      controller: fieldController,
                      focusNode: fieldFocusNode,
                      keyboardType: TextInputType.multiline,
                      minLines: 1,
                      maxLines: null,
                      textInputAction: DeviceType.isMobile
                          ? TextInputAction.newline
                          : TextInputAction.send,
                      onSubmitted: (_) {
                        if (!HardwareKeyboard.instance.isShiftPressed) {
                          send();
                        } else {
                          fieldController.text = '${fieldController.text}\n';
                        }
                        fieldFocusNode.requestFocus();
                      },
                      decoration: const InputDecoration(
                        border: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        errorBorder: InputBorder.none,
                        disabledBorder: InputBorder.none,
                        hintText: 'Your message goes here...',
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        M3EIconButton(
          icon: const Icon(Symbols.send_rounded, size: 32),
          variant: M3EIconButtonVariant.filled,
          size: M3EIconButtonSize.md,
          shape: M3EIconButtonShapeVariant.round,
          onPressed: send,
        ),
      ],
    );
  }
}
