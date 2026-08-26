enum ChatType { group, private }

class ChatData {
  final double id;
  final String name;
  final ChatType type;

  ChatData({required this.id, required this.name, required this.type});
}

class ChatDataWithParticipants {
  final double id;
  final String name;
  final List<Participant> participants;
  final ChatType type;

  ChatDataWithParticipants({
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

class EmojiData {
  final double id;
  final String name;
  final double uploaderId;

  EmojiData({required this.id, required this.name, required this.uploaderId});
}

class MessageData {
  final double chatId;
  final String content;
  final double id;
  final bool isSeen;
  final DateTime? seenAt;
  final double senderId;
  final DateTime sentAt;

  MessageData({
    required this.chatId,
    required this.content,
    required this.id,
    required this.isSeen,
    required this.seenAt,
    required this.senderId,
    required this.sentAt,
  });
}

class MessageDataWithSender {
  final double chatId;
  final String content;
  final double id;
  final bool isSeen;
  final DateTime? seenAt;
  final Sender sender;
  final double senderId;
  final DateTime sentAt;

  MessageDataWithSender({
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

class UserData {
  final String avatar;
  final double id;
  final String username;

  UserData({required this.avatar, required this.id, required this.username});
}
