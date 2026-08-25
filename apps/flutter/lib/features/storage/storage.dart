import 'package:shared_preferences/shared_preferences.dart';

enum StorageKey<T> {
  userId<int>(),
  userUsername<String>(),
  userAvatar<String>(),
}

class Storage {
  final prefs = SharedPreferencesAsync();

  Future<T?> get<T>(StorageKey<T> key) async {
    if (T == int) return await prefs.getInt(key.name) as T?;
    if (T == String) return await prefs.getString(key.name) as T?;
    if (T == bool) return await prefs.getBool(key.name) as T?;
    if (T == double) return await prefs.getDouble(key.name) as T?;
    if (T == List<String>) return await prefs.getStringList(key.name) as T?;

    throw ArgumentError('Unsupported type: $T');
  }

  Future<void> set<T>(StorageKey<T> key, T value) async {
    if (T == int) return await prefs.setInt(key.name, value as int);
    if (T == String) return await prefs.setString(key.name, value as String);
    if (T == bool) return await prefs.setBool(key.name, value as bool);
    if (T == double) return await prefs.setDouble(key.name, value as double);
    if (T == List<String>)
      return await prefs.setStringList(key.name, value as List<String>);

    throw ArgumentError('Unsupported type: $T');
  }
}
