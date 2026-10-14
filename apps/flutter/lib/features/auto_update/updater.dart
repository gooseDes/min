import 'dart:convert';
import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:material_symbols_icons/material_symbols_icons.dart';
import 'package:min_api/index.dart';
import 'package:path_provider/path_provider.dart';
import 'package:material_3_expressive/material_3_expressive.dart';

class FetchedVersion {
  final String version;
  final String releaseTag;

  const FetchedVersion({required this.version, required this.releaseTag});
}

class UpdaterService {
  static const MethodChannel _channel = MethodChannel(
    'com.goose.min_flutter/updater',
  );

  static Future<String> getCurrentAppVersion() async {
    try {
      final String version = await _channel.invokeMethod('getAppVersion');
      return version;
    } on PlatformException catch (e) {
      return 'Error while trying to get current app version: ${e.message}';
    }
  }

  static Future<FetchedVersion> fetchLatestVersion() async {
    try {
      final response = await http.get(
        Uri.parse(
          "https://github.com/gooseDes/min/releases/latest/download/flutter-latest.json",
        ),
      );

      if (response.statusCode != 200) {
        throw HttpException(
          'Request for latest version failed with status: ${response.statusCode}',
        );
      }

      final Map<String, dynamic> data = jsonDecode(response.body);

      return FetchedVersion(
        version: data['version']?.toString() ?? 'unknown',
        releaseTag: data['release_tag']?.toString() ?? 'unknown',
      );
    } catch (error, stackTrace) {
      logger.e(
        'An error occurred during latest version fetching',
        error: error,
        stackTrace: stackTrace,
      );
      rethrow;
    }
  }

  static Future<String> getCpuArchitecture() async {
    final String arch = await _channel.invokeMethod('getCpuArchitecture');
    return arch;
  }

  static Future<File> downloadByTag(
    String tag,
    void Function(double) onProgress,
  ) async {
    final arch = await getCpuArchitecture();
    final url =
        'https://github.com/gooseDes/min/releases/download/$tag/app-$arch-release.apk';
    logger.i('Downloading $url...');
    final client = http.Client();
    try {
      final response = await client.send(http.Request('GET', Uri.parse(url)));

      if (response.statusCode != 200) {
        throw HttpException(
          'Request for latest version APK failed with status: ${response.statusCode}',
        );
      }

      final totalBytes = response.contentLength;
      int receivedBytes = 0;

      final file = File('${(await getTemporaryDirectory()).path}/update.apk');
      final fileSink = file.openWrite();

      await response.stream.forEach((chunk) {
        fileSink.add(chunk);
        receivedBytes += chunk.length;

        if (totalBytes != null && totalBytes > 0) {
          double progress = receivedBytes / totalBytes;
          double percentage = progress * 100;
          onProgress(percentage);
        }
      });

      await fileSink.close();

      logger.i('Download complete!');

      return file;
    } finally {
      client.close();
    }
  }

  static Future<bool> installApk(File file) async {
    logger.i('Installing ${file.path}...');
    final bool isSuccess = await _channel.invokeMethod('installApk', {
      'path': file.path,
    });

    if (isSuccess)
      logger.i('Installation complete!');
    else
      logger.e('Installation failed.');
    return isSuccess;
  }

  static Future<void> checkForUpdates(GlobalKey<NavigatorState> navKey) async {
    final currentVersion = await UpdaterService.getCurrentAppVersion();
    final latestVersion = await UpdaterService.fetchLatestVersion();
    if (currentVersion != latestVersion.version) {
      final navContext = navKey.currentContext;
      if (navContext == null || !navContext.mounted) return;
      M3EDialog.show(
        navContext,
        dialog: M3EDialog(
          title: "New Version is Available",
          icon: const Icon(Symbols.update_rounded),
          content: Text(
            'You can update the app: $currentVersion -> ${latestVersion.version}. It\'s highly recommended to do as soon as possible!',
          ),
          actions: [
            M3EButton.text(
              onPressed: () => Navigator.pop(navContext),
              child: const Text('Later'),
            ),
            M3EButton.text(
              onPressed: () async {
                Navigator.pop(navContext);
                if (!navContext.mounted) return;

                final ValueNotifier<double> progressNotifier =
                    ValueNotifier<double>(0.0);

                void progress(double progressValue) {
                  progressNotifier.value = progressValue;
                }

                M3EDialog.show(
                  navContext,
                  barrierDismissible: false,
                  dialog: M3EDialog(
                    icon: const Icon(Symbols.update_rounded),
                    title: "Downloading...",
                    content: ValueListenableBuilder<double>(
                      valueListenable: progressNotifier,
                      builder: (context, currentProgress, child) {
                        return Align(
                          alignment: Alignment.center,
                          child: M3EProgressIndicator.linear(
                            value: currentProgress / 100,
                          ),
                        );
                      },
                    ),
                  ),
                );
                final apk = await UpdaterService.downloadByTag(
                  latestVersion.releaseTag,
                  progress,
                );
                if (!navContext.mounted) return;
                Navigator.pop(navContext);
                M3EDialog.show(
                  navContext,
                  dialog: const M3EDialog(
                    icon: Icon(Symbols.update_rounded),
                    title: "Installing...",
                    content: Align(
                      alignment: Alignment.center,
                      child: M3ELoadingIndicator(
                        variant: M3ELoadingIndicatorVariant.contained,
                      ),
                    ),
                  ),
                );
                await UpdaterService.installApk(apk);
              },
              child: const Text('Update'),
            ),
          ],
        ),
      );
    }
  }
}
