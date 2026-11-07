import 'package:logger/logger.dart';

import 'dart:io';
import 'package:path_provider/path_provider.dart';

final _ansi = RegExp(r'\x1B\[[0-9;?]*[ -/]*[@-~]');

String stripAnsi(String text) => text.replaceAll(_ansi, '');

class MemoryOutput extends LogOutput {
  static final List<String> logHistory = [];
  final int maxLines;

  MemoryOutput({this.maxLines = 500});

  @override
  void output(OutputEvent event) {
    for (var line in event.lines) {
      if (logHistory.length >= maxLines) {
        logHistory.removeAt(0);
      }
      logHistory.add(stripAnsi(line));
    }
  }
}

class FileOutput extends LogOutput {
  File? _file;
  IOSink? _sink;

  FileOutput();

  @override
  Future<void> init() async {
    await super.init();
    await _initFile();
  }

  Future<void> _initFile() async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final logFilePath =
          '${directory.path}/min_logs_${DateTime.now().millisecondsSinceEpoch}.txt';
      _file = File(logFilePath);
      _sink = _file?.openWrite(mode: FileMode.write);
    } catch (e) {
      print('Failed to initialize log file: $e');
    }
  }

  @override
  void output(OutputEvent event) {
    for (var line in event.lines) {
      _sink?.writeln(line);
    }
  }

  @override
  Future<void> destroy() async {
    await _sink?.flush();
    await _sink?.close();
    super.destroy();
  }
}

final logger = Logger(
  printer: PrettyPrinter(
    methodCount: 2,
    errorMethodCount: 8,
    lineLength: 128,
    colors: true,
    printEmojis: true,
  ),
  filter: ProductionFilter(),
  output: MultiOutput([ConsoleOutput(), MemoryOutput(), FileOutput()]),
);
