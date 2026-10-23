import 'package:cached_network_image_ce/cached_network_image.dart';
import 'package:markdown_widget/markdown_widget.dart';
import 'package:material_3_expressive/material_3_expressive.dart';
import 'package:material_ui/material_ui.dart';
import 'package:min_flutter/core/theme_ext.dart';
import 'package:min_flutter/features/images/fullscreen_image.dart';

MarkdownConfig generateMarkdownConfig(BuildContext context, Color textColor) {
  return MarkdownConfig(
    configs: [
      PConfig(
        textStyle:
            context.textTheme.bodyLarge?.copyWith(
              color: textColor,
              height: 1.0,
            ) ??
            const TextStyle(color: Colors.red),
      ),
      ImgConfig(
        builder: (url, attr) => GestureDetector(
          onTap: () => openImageInFullScreen(context, url),
          child: Hero(
            tag: url,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: CachedNetworkImage(
                imageUrl: url,
                placeholder: (context, url) => const Align(
                  alignment: Alignment.center,
                  child: M3ELoadingIndicator(),
                ),
              ),
            ),
          ),
        ),
      ),
    ],
  );
}
