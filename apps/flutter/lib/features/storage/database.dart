import 'package:drift/drift.dart';
import 'package:drift_flutter/drift_flutter.dart';
import 'package:min_types/index.dart';
import 'package:path_provider/path_provider.dart';

part 'database.g.dart';

@DataClassName('DbUser')
class UsersTable extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get username => text()();
  TextColumn get avatar => text()();
}

@DataClassName('DbChat')
class ChatsTable extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get name => text()();
  TextColumn get type => textEnum<ChatType>()();
}

@DataClassName('DbChatUser')
class ChatUsersTable extends Table {
  IntColumn get chatId =>
      integer().references(ChatsTable, #id, onDelete: KeyAction.cascade)();
  IntColumn get userId =>
      integer().references(UsersTable, #id, onDelete: KeyAction.cascade)();

  @override
  Set<Column> get primaryKey => {chatId, userId};
}

@DataClassName('DbMessage')
class MessagesTable extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get content => text()();
  IntColumn get senderId =>
      integer().references(UsersTable, #id, onDelete: KeyAction.cascade)();
  IntColumn get chatId =>
      integer().references(ChatsTable, #id, onDelete: KeyAction.cascade)();
  DateTimeColumn get sentAt => dateTime().withDefault(currentDateAndTime)();
}

extension type ChatWithAvatar(({DbChat chat, String? avatar}) record) {
  DbChat get chat => record.chat;

  int get id => record.chat.id;
  ChatType get type => record.chat.type;
  String get name => record.chat.name;
  String? get avatar => record.avatar;
}

@DriftDatabase(tables: [UsersTable, ChatsTable, ChatUsersTable, MessagesTable])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  static QueryExecutor _openConnection() {
    return driftDatabase(
      name: "min_db",
      native: DriftNativeOptions(
        databaseDirectory: getApplicationSupportDirectory,
        setup: (db) => db.execute('PRAGMA foreign_keys = ON;'),
      ),
    );
  }

  Future<int> addChatWithParticipants(ChatDataWithParticipants chat) async {
    return transaction(() async {
      final id = await into(chatsTable).insertOnConflictUpdate(
        ChatsTableCompanion.insert(
          id: Value(chat.id),
          name: chat.name,
          type: chat.type,
        ),
      );

      for (final participant in chat.participants) {
        await into(usersTable).insertOnConflictUpdate(
          UsersTableCompanion.insert(
            id: Value(participant.id),
            username: participant.username,
            avatar: participant.avatar,
          ),
        );

        await into(chatUsersTable).insert(
          ChatUsersTableCompanion.insert(
            chatId: chat.id,
            userId: participant.id,
          ),
          mode: InsertMode.insertOrIgnore,
        );
      }

      return id;
    });
  }

  Stream<List<ChatWithAvatar>> watchChats(int currentUserId) {
    final query = select(chatsTable).join([
      leftOuterJoin(
        chatUsersTable,
        chatUsersTable.chatId.equalsExp(chatsTable.id),
      ),
      leftOuterJoin(usersTable, usersTable.id.equalsExp(chatUsersTable.userId)),
    ]);
    query.where(
      chatUsersTable.userId.equals(currentUserId).not() |
          chatUsersTable.userId.isNull(),
    );

    query.groupBy([chatsTable.id]);

    return query.watch().map((rows) {
      return rows.map((row) {
        final chat = row.readTable(chatsTable);
        final otherUser = row.readTableOrNull(usersTable);

        final resolvedAvatar = otherUser?.avatar;

        return ChatWithAvatar((chat: chat, avatar: resolvedAvatar));
      }).toList();
    });
  }
}
