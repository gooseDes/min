import 'package:min_flutter/features/storage/database.dart';
import 'package:min_types/index.dart';

extension DbMessageX on DbMessage {
  MessageData toApi() {
    return MessageData(
      id: id,
      chatId: chatId,
      content: content,
      isSeen: isSeen,
      seenAt: seenAt,
      senderId: senderId,
      sentAt: sentAt,
    );
  }
}

extension DbUserX on DbUser {
  UserData toApi() {
    return UserData(id: id, avatar: avatar, username: username);
  }
}
