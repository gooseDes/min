package com.goose.min_flutter

import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import io.flutter.embedding.android.FlutterActivity
import io.flutter.plugin.common.MethodChannel
import io.flutter.embedding.engine.FlutterEngine
import java.io.File

class MainActivity : FlutterActivity() {
    private val channel = "com.goose.min_flutter/updater"
    private val requestCodeInstallPermission = 1234
    private var pendingApkPath: String? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, channel).setMethodCallHandler { call, result ->
            if (call.method == "getAppVersion") {
                val packageManager = context.packageManager
                val packageName = context.packageName

                val appVersion =
                    packageManager.getPackageInfo(packageName, PackageManager.PackageInfoFlags.of(0)).versionName

                result.success(appVersion)
            } else if (call.method == "getCpuArchitecture") {
                result.success(Build.SUPPORTED_ABIS.firstOrNull() ?: "armeabi-v7a")
            } else if (call.method == "installApk") {
                val path = call.argument<String>("path")
                if (path != null) {
                    pendingApkPath = path
                    val installed = tryInstallApk()
                    if (installed) result.success(true) else result.error("ERROR", "Failed to start installation", null)
                } else {
                    result.error("INVALID_ARGUMENT", "path is null", null)
                }
            } else {
                result.notImplemented()
            }
        }
    }

    private fun tryInstallApk(): Boolean {
        val filePath = pendingApkPath ?: return false
        val file = File(filePath)
        if (!file.exists()) return false

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (!context.packageManager.canRequestPackageInstalls()) {
                val intent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                    data = Uri.parse("package:${context.packageName}")
                }
                startActivityForResult(intent, requestCodeInstallPermission)
                return false
            }
        }

        executeInstallation(file)
        return true
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == requestCodeInstallPermission) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (context.packageManager.canRequestPackageInstalls()) {
                    pendingApkPath?.let { filePath ->
                        executeInstallation(File(filePath))
                    }
                } else {
                    pendingApkPath = null
                }
            }
        }
    }

    private fun executeInstallation(file: File) {
        val intent = Intent(Intent.ACTION_VIEW).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }

        val uri: Uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
        } else {
            Uri.fromFile(file)
        }

        intent.setDataAndType(uri, "application/vnd.android.package-archive")
        context.startActivity(intent)

        pendingApkPath = null
    }
}
