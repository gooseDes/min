String stripCommands(String text) {
  return text.startsWith('/') ? text.split('\n').sublist(1).join('\n') : text;
}

int? parseReplyId(String content) {
  final match = RegExp(r'^/reply\s+(\d+)').firstMatch(content);
  if (match == null) return null;

  final id = int.parse(match.group(1)!);
  return id >= 1 ? id : null;
}
