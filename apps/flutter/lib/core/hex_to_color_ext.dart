import 'package:flutter/material.dart';

extension HexColor on String {
  Color toColor() {
    String hexString = this;

    if (hexString.startsWith('#')) {
      hexString = hexString.substring(1);
    }

    if (hexString.length == 6) {
      hexString = 'FF$hexString';
    }

    return Color(int.parse(hexString, radix: 16));
  }
}
