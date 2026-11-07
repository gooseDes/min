String stripCommands(String text) {
  return text.startsWith('/') ? text.split('\n').sublist(1).join('\n') : text;
}
