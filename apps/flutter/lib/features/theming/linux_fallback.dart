import 'dart:io';

import 'package:flutter/material.dart';
import 'package:min_flutter/core/hex_to_color_ext.dart';

class LinuxAccentColorFallback {
  static Future<Color> getAccentColor() async {
    const fallbackColor = Colors.blue;
    if (!Platform.isLinux) {
      return fallbackColor;
    }
    try {
      final homePath = Platform.environment["HOME"];
      final gtk3ConfigFile = File("$homePath/.config/gtk-3.0/gtk.css");
      final gtk4ConfigFile = File("$homePath/.config/gtk-4.0/gtk.css");
      final gtk3Exists = await gtk3ConfigFile.exists();
      final gtk4Exists = await gtk4ConfigFile.exists();
      if (!gtk3Exists && !gtk4Exists) {
        return fallbackColor;
      }

      final gtkTheme = await (gtk3Exists ? gtk3ConfigFile : gtk4ConfigFile)
          .readAsLines();
      final accentColor = gtkTheme.firstWhere(
        (line) => line.contains("accent_color"),
      );

      final color = accentColor.split(" ")[2].trim().replaceAll(";", "");
      return color.toColor();
    } catch (_) {
      return fallbackColor;
    }
  }
}
