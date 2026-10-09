extension DateTimeExt on DateTime {
  String toPrettyString() {
    final now = DateTime.now();
    final dateWithoutYear = '$day.$month';
    final time = '$hour:$minute';
    if (now.day == day && now.month == month && now.year == year) {
      return 'Today, $time';
    } else if (now.day == day + 1 && now.month == month && now.year == year) {
      return 'Yesterday, $time';
    } else if (now.year == year) {
      return '$dateWithoutYear, $time';
    } else {
      return '$dateWithoutYear.$year';
    }
  }
}
