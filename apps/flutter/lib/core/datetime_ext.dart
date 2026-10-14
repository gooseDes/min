extension IntExt on int {
  String toTwoDigit() {
    final String str = toString();
    return str.length <= 1 ? '0$this' : str;
  }
}

extension DateTimeExt on DateTime {
  String toPrettyString() {
    final now = DateTime.now();
    final dateWithoutYear = '${day.toTwoDigit()}.${month.toTwoDigit()}';
    final time = '${hour.toTwoDigit()}:${minute.toTwoDigit()}';
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
