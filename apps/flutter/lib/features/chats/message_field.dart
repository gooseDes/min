import 'dart:convert';
import 'dart:math';

import 'package:flutter/services.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:material_3_expressive/material_3_expressive.dart';
import 'package:material_symbols_icons/material_symbols_icons.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/client.dart';
import 'package:min_flutter/core/device_type.dart';
import 'package:min_flutter/core/theme_ext.dart';
import 'package:min_flutter/core/ui/common_alerts.dart';
import 'package:min_flutter/features/storage/database.dart';
import 'package:http/http.dart' as http;
import 'package:min_flutter/features/storage/secure_storage.dart';
import 'package:motor/motor.dart';

class MessageField extends HookWidget {
  const MessageField({super.key, required this.chat});

  final ChatWithAvatar? chat;

  @override
  Widget build(BuildContext context) {
    final fieldController = useTextEditingController();
    final fieldFocusNode = useFocusNode();
    final swipedLastUpdate = useState(0.0);
    final swipeResult = useState(1.0);
    const requiredSwipeDistance = 100.0;

    Future<void> send() async {
      final text = fieldController.text.trim();
      if (chat?.id != null && text.isNotEmpty) {
        fieldController.clear();
        fieldFocusNode.requestFocus();
        await apiClient.sendMessage(chat!.id, text);
      }
    }

    return GestureDetector(
      onHorizontalDragStart: (details) {
        swipedLastUpdate.value = details.globalPosition.dx;
      },
      onHorizontalDragUpdate: (details) {
        swipeResult.value -=
            (details.globalPosition.dx - swipedLastUpdate.value) /
            requiredSwipeDistance;
        swipedLastUpdate.value = details.globalPosition.dx;
      },
      onHorizontalDragEnd: (details) {
        swipedLastUpdate.value = 0;
        if (swipeResult.value > 0.5) {
          swipeResult.value = 1;
        } else {
          swipeResult.value = 0;
        }
      },
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 12 * swipeResult.value,
        children: [
          Expanded(
            child: Card.filled(
              margin: EdgeInsets.zero,
              color: context.colorScheme.surfaceContainerLow,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Row(
                  mainAxisSize: MainAxisSize.max,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SingleMotionBuilder(
                      value: swipeResult.value,
                      motion:
                          const MaterialSpringMotion.expressiveSpatialDefault(),
                      builder: (context, value, child) {
                        return Opacity(
                          opacity: value.clamp(0, 1),
                          child: Align(
                            alignment: Alignment.center,
                            widthFactor: max(value, 0),
                            child: child,
                          ),
                        );
                      },
                      child: IconButton(
                        icon: const Icon(Symbols.attach_file_add_rounded),
                        onPressed: () async {
                          final picked = await ImagePicker().pickImage(
                            source: ImageSource.gallery,
                          );
                          if (picked == null) return;

                          if (!context.mounted) return;
                          startLoading(context, 'Uploading...');

                          try {
                            var request = http.MultipartRequest(
                              'POST',
                              Uri.parse('${apiClient.url}/attach/'),
                            );

                            request.headers['Authorization'] =
                                'Bearer ${await SecureStorage().getToken()}';

                            final int fileLength = await picked.length();
                            final multipartFile = http.MultipartFile(
                              'attachments',
                              picked.readAsBytes().asStream(),
                              fileLength,
                              filename: picked.name,
                            );

                            request.files.add(multipartFile);

                            final response = await request.send();

                            if (response.statusCode == 200) {
                              final responseString = await response.stream
                                  .bytesToString();
                              final data = jsonDecode(responseString);
                              if (data['success'] && data['urls'].length != 0) {
                                final attachment =
                                    '![attachment](${apiClient.url}${data['urls'][0]})';
                                fieldController.text +=
                                    (fieldController.text.trim().isEmpty
                                    ? attachment
                                    : '\n$attachment');
                                if (!context.mounted) return;
                                if (context.canPop()) context.pop();
                              } else {
                                if (!context.mounted) return;
                                if (context.canPop()) context.pop();
                                showError(
                                  context,
                                  'You attachment was not loaded: ${data['message']}',
                                );
                              }
                            } else {
                              if (!context.mounted) return;
                              if (context.canPop()) context.pop();
                              showError(
                                context,
                                'You attachment was not loaded',
                              );
                            }
                          } catch (e, t) {
                            if (!context.mounted) return;
                            if (context.canPop()) context.pop();
                            showError(
                              context,
                              'While sending picked image to server',
                              e,
                              t,
                            );
                          }
                        },
                      ),
                    ),
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
          SingleMotionBuilder(
            value: swipeResult.value,
            motion: const MaterialSpringMotion.expressiveSpatialDefault(),
            builder: (context, value, child) {
              return Align(
                alignment: Alignment.center,
                widthFactor: max(value, 0),
                child: Transform.scale(
                  alignment: Alignment.center,
                  scale: max(value, 0),
                  child: Opacity(opacity: value.clamp(0, 1), child: child),
                ),
              );
            },
            child: M3EIconButton(
              icon: const Icon(Symbols.send_rounded, size: 32),
              variant: M3EIconButtonVariant.filled,
              size: M3EIconButtonSize.md,
              shape: M3EIconButtonShapeVariant.round,
              onPressed: send,
            ),
          ),
        ],
      ),
    );
  }
}
