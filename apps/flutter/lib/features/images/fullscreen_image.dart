import 'dart:ui';

import 'package:cached_network_image_ce/cached_network_image.dart';
import 'package:material_ui/material_ui.dart';

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

class FullscreenImagePage extends StatelessWidget {
  final String url;
  const FullscreenImagePage({super.key, required this.url});

  @override
  Widget build(BuildContext context) {
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
                    minScale: 1,
                    maxScale: 10,
                    child: CachedNetworkImage(imageUrl: url),
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
