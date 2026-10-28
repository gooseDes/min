import 'dart:ui';

import 'package:cached_network_image_ce/cached_network_image.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:gal/gal.dart';
import 'package:go_router/go_router.dart';
import 'package:material_3_expressive/material_3_expressive.dart';
import 'package:material_symbols_icons/material_symbols_icons.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/ui/common_alerts.dart';
import 'package:min_flutter/core/ui/scale_enter_animation.dart';

void openImageInFullScreen(BuildContext context, String url) {
  Navigator.of(context).push(
    PageRouteBuilder(
      opaque: false,
      transitionDuration: const Duration(milliseconds: 300),
      transitionsBuilder: (_, animation, _, child) => FadeTransition(
        opacity: CurvedAnimation(
          parent: animation,
          curve: Curves.fastOutSlowIn,
        ),
        child: child,
      ),
      pageBuilder: (_, _, _) => FullscreenImagePage(url: url),
    ),
  );
}

class FullscreenImagePage extends HookWidget {
  final String url;
  const FullscreenImagePage({super.key, required this.url});

  @override
  Widget build(BuildContext context) {
    final zoomScale = useState(1.0);

    return BackdropFilter(
      filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
      child: Container(
        color: Colors.black45,
        child: Stack(
          children: [
            Positioned.fill(
              child: GestureDetector(
                onTap: () => Navigator.of(context).pop(),
                child: Hero(
                  tag: url,
                  child: InteractiveViewer(
                    maxScale: 10,
                    onInteractionUpdate: (update) {
                      zoomScale.value = update.scale;
                    },
                    child: CachedNetworkImage(imageUrl: url),
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: 100,
              left: 0,
              right: 0,
              child: Align(
                alignment: Alignment.center,
                child: ScaleEnterAnimation(
                  show: zoomScale.value < 1.1,
                  child: M3EButton(
                    icon: const Icon(Symbols.image_rounded),
                    label: const Text("Save"),
                    size: M3EButtonSize.md,
                    onPressed: () async {
                      try {
                        if (!await Gal.hasAccess(toAlbum: true))
                          await Gal.requestAccess(toAlbum: true);

                        final fileInfo = await DefaultCacheManager()
                            .getFileFromCache(url);

                        if (fileInfo?.file == null) {
                          if (context.mounted)
                            M3ESnackbar.show(
                              context,
                              message: "No such file in cache, somehow",
                            );
                          return;
                        }

                        Gal.putImage(fileInfo!.file.path, album: "Min");
                        if (context.mounted)
                          M3ESnackbar.show(
                            context,
                            message: "Image saved successfully!",
                          );
                      } catch (error, stack) {
                        if (context.mounted)
                          showError(
                            context,
                            "Error while saving image",
                            error,
                            stack,
                          );
                      } finally {
                        if (context.mounted && context.canPop()) context.pop();
                      }
                    },
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
