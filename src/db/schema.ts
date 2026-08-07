import { boolean, int, json, mysqlEnum, mysqlTable, primaryKey, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const usersTable = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 64 }),
  email: varchar("email", { length: 64 }),
  password: varchar("password", { length: 64 }),
  avatar: varchar("avatar", { length: 64 }).default("replace"),
});

export const chatsTable = mysqlTable("chats", {
  id: int("id").primaryKey().autoincrement(),
  type: mysqlEnum("type", ["private", "group"]).default("group"),
  name: varchar("name", { length: 64 }),
});

export const chatUsersTable = mysqlTable(
  "chat_users",
  {
    chatId: int("chat_id")
      .notNull()
      .references(() => chatsTable.id, { onDelete: "cascade" }),
    userId: int("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
  },
  t => [primaryKey({ columns: [t.chatId, t.userId] })],
);

export const messagesTable = mysqlTable("messages", {
  id: int("id").primaryKey().autoincrement(),
  chatId: int("chat_id")
    .notNull()
    .references(() => chatsTable.id, { onDelete: "cascade" }),
  senderId: int("sender_id")
    .notNull()
    .references(() => usersTable.id),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  seen: boolean("seen").default(false),
  seenAt: timestamp("seen_at"),
});

export const subscriptionsTable = mysqlTable("subscriptions", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  subscription: json("subscription").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emojisTable = mysqlTable("emojis", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 64 }).notNull(),
  uploaderId: int("uploader_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const turnKeysTable = mysqlTable("turn_keys", {
  id: int("id").primaryKey().autoincrement(),
  api_key: varchar("api_key", { length: 128 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  availableFor: int("available_for").default(14400),
  chatId: int("chat_id")
    .notNull()
    .references(() => chatsTable.id, { onDelete: "cascade" }),
});

export const fcmTokensTable = mysqlTable("fcm_tokens", {
  id: int("id").primaryKey().autoincrement(),
  token: varchar("token", { length: 256 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});
