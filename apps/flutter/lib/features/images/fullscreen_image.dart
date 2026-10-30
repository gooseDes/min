import 'dart:ui';

import 'package:cached_network_image_ce/cached_network_image.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:gal/gal.dart';
import 'package:go_router/go_router.dart';
import 'package:material_3_expressive/material_3_expressive.dart';
import 'package:material_symbols_icons/material_symbols_icons.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/ui/scale_enter_animation.dart';
import 'package:min_flutter/features/dialogs/dialogs.dart';

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
    final transformationController = useTransformationController();
    final zoomScale = useState(1.0);

    useEffect(() {
      void listener() {
        zoomScale.value = transformationController.value.getMaxScaleOnAxis();
      }

      transformationController.addListener(listener);

      return () => transformationController.removeListener(listener);
    }, [transformationController]);

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
                    transformationController: transformationController,
                    maxScale: 10,
                    child: CachedNetworkImage(imageUrl: url),
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: 16,
              left: 16,
              right: 16,
              child: Align(
                alignment: Alignment.bottomRight,
                child: ScaleEnterAnimation(
                  show: transformationController.value.getMaxScaleOnAxis() <= 1,
                  child: M3EIconButton(
                    icon: const Icon(Symbols.download_rounded),
                    size: M3EIconButtonSize.md,
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
                        showError("Error while saving image", error, stack);
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
