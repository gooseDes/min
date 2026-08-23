enum ChatType { group, private }

class ChatSchema {
  final double id;
  final String name;
  final ChatType type;

  ChatSchema({required this.id, required this.name, required this.type});
}

class ChatSchemaWithParticipants {
  final double id;
  final String name;
  final List<Participant> participants;
  final ChatType type;

  ChatSchemaWithParticipants({
    required this.id,
    required this.name,
    required this.participants,
    required this.type,
  });
}

class Participant {
  final String avatar;
  final double id;
  final String username;

  Participant({required this.avatar, required this.id, required this.username});
}

class EmojiSchema {
  final double id;
  final String name;
  final double uploaderId;

  EmojiSchema({required this.id, required this.name, required this.uploaderId});
}

class MessageSchema {
  final double chatId;
  final String content;
  final double id;
  final bool isSeen;
  final DateTime? seenAt;
  final double senderId;
  final DateTime sentAt;

  MessageSchema({
    required this.chatId,
    required this.content,
    required this.id,
    required this.isSeen,
    required this.seenAt,
    required this.senderId,
    required this.sentAt,
  });
}

class MessageSchemaWithSender {
  final double chatId;
  final String content;
  final double id;
  final bool isSeen;
  final DateTime? seenAt;
  final Sender sender;
  final double senderId;
  final DateTime sentAt;

  MessageSchemaWithSender({
    required this.chatId,
    required this.content,
    required this.id,
    required this.isSeen,
    required this.seenAt,
    required this.sender,
    required this.senderId,
    required this.sentAt,
  });
}

class Sender {
  final String avatar;
  final double id;
  final String username;

  Sender({required this.avatar, required this.id, required this.username});
}

class UserSchema {
  final String avatar;
  final double id;
  final String username;

  UserSchema({required this.avatar, required this.id, required this.username});
}
