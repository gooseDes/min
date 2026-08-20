import { chatSchemaWithParticipants, emojiSchema, messageSchema, messageSchemaWithSender, userSchema } from "@min/schemas";
import { and, asc, desc, eq, inArray, ne, or, sql } from "drizzle-orm";
import { writeFileSync } from "fs";
import { IncomingMessage, Server, ServerResponse } from "http";
import { Logger } from "pino";
import * as webpush from "web-push";
import z from "zod";
import { db } from "./db";
import {
  chatsTable,
  chatUsersTable,
  emojisTable,
  fcmTokensTable,
  messagesTable,
  subscriptionsTable,
  usersTable,
} from "./db/schema";
import ApiDescriptor, { fail } from "./lib/apiDescriptor";
import { fcm } from "./lib/firebaseAdmin";
import { Turn } from "./lib/turn";
import { jsonToObject, toDate, zodObjectToObject } from "./lib/utils";
import { MessageDataWithSender, UserData } from "./types/api";

function createSocketEndpoints(server: Server<typeof IncomingMessage, typeof ServerResponse>, logger: Logger, _turn: Turn) {
  const api = new ApiDescriptor(server, logger);

  api.addEndpoint("sendMessage", z.object({ content: z.string(), chatId: z.uint32() }), z.object({}), async (socket, data) => {
    // Saving to db
    const inserted = await db
      .insert(messagesTable)
      .values({ chatId: data.chatId, senderId: socket.user.id, content: data.content })
      .$returningId();
    const inserted_data = await db.query.messagesTable.findFirst({
      where: eq(messagesTable.id, inserted[0].id),
    });
    if (!inserted_data) return fail("Failed to save message");

    // Getting avatar
    const avatar = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, socket.user.id),
      columns: { avatar: true },
    });
    const author_avatar = avatar?.avatar || "null";

    // Sending to everyone
    const to_send: MessageDataWithSender = {
      id: inserted[0].id,
      content: data.content,
      senderId: socket.user.id,
      sender: { id: socket.user.id, username: socket.user.name, avatar: author_avatar },
      chatId: data.chatId,
      sentAt: toDate(inserted_data.sentAt.getTime() / 1000),
      isSeen: false,
      seenAt: null,
    };
    api.io.to(`chat:${data.chatId}`).emit("newMessage", to_send);

    // Sending webpush messages
    const chat_users = await db.query.chatUsersTable.findMany({
      where: eq(chatUsersTable.chatId, data.chatId),
      columns: { userId: true },
    });
    chat_users.forEach(async row => {
      const subscriptions = await db.query.subscriptionsTable.findMany({
        where: eq(subscriptionsTable.userId, row.userId),
        columns: { id: true, subscription: true },
      });
      if (row.userId != socket.user.id) {
        const chatId = await db.query.chatUsersTable.findFirst({
          where: and(eq(chatUsersTable.userId, row.userId), eq(chatUsersTable.chatId, data.chatId)),
          columns: { chatId: true },
        });

        if (chatId) {
          const chatUsers = await db
            .select({
              id: usersTable.id,
              name: usersTable.name,
              avatar: usersTable.avatar,
            })
            .from(usersTable)
            .innerJoin(chatUsersTable, eq(usersTable.id, chatUsersTable.userId))
            .where(eq(chatUsersTable.chatId, chatId.chatId));

          const payload = JSON.stringify({
            chat: { id: chatId.chatId, participants: chatUsers },
            author: { id: socket.user.id, username: socket.user.name, avatar: author_avatar },
            message: data.content,
            recipient: { id: row.userId },
          });
          subscriptions.forEach(sub => {
            try {
              const subscription = jsonToObject(sub.subscription);
              webpush.sendNotification(subscription, payload).catch(err => {
                console.error("Push failed for", subscription.endpoint, err);
                db.delete(subscriptionsTable).where(eq(subscriptionsTable.id, sub.id)).execute().catch();
              });
            } catch (error) {
              console.log(error);
            }
          });
        }
      }
    });

    // Sending FCM messages
    const users = await db.query.chatUsersTable.findMany({
      where: and(eq(chatUsersTable.chatId, data.chatId), ne(chatUsersTable.userId, socket.user.id)),
      columns: { userId: true },
    });
    if (users.length) {
      const tokens = await db.query.fcmTokensTable.findMany({
        where: inArray(
          fcmTokensTable.userId,
          users.map(user => user.userId),
        ),
        columns: {
          token: true,
        },
      });

      if (tokens.length) {
        await fcm.sendEachForMulticast({
          data: {
            authorName: String(to_send.sender.username),
            text: String(to_send.content),
            authorId: String(to_send.senderId),
            authorAvatar: String(author_avatar),
            chatId: String(data.chatId),
            messageId: String(to_send.id),
            sentAt: String(to_send.sentAt),
          },
          android: {
            priority: "high",
          },
          tokens: tokens.map(token => token.token),
        });
      }
    }
    return {};
  });

  api.addEndpoint(
    "fetchChatMessages",
    z.object({ chatId: z.uint32(), currentMessages: z.uint32().optional() }),
    z.object({ messages: z.array(messageSchemaWithSender) }),
    async (socket, data) => {
      const sub = db
        .select({
          id: messagesTable.id,
          chatId: messagesTable.chatId,
          content: messagesTable.content,
          sentAt: sql<number>`UNIX_TIMESTAMP(${messagesTable.sentAt})`.as("sent_at"),
          senderId: messagesTable.senderId,
          seen: messagesTable.seen,
          seenAt: sql<number>`UNIX_TIMESTAMP(${messagesTable.seenAt})`.as("seen_at"),
          senderName: usersTable.name,
          senderAvatar: usersTable.avatar,
        })
        .from(messagesTable)
        .innerJoin(usersTable, eq(messagesTable.senderId, usersTable.id))
        .where(eq(messagesTable.chatId, data.chatId))
        .orderBy(desc(messagesTable.sentAt))
        .limit(100)
        .offset(data?.currentMessages || 0)
        .as("sub");

      const history = await db.select().from(sub).orderBy(asc(sub.sentAt));

      // const maxId = Math.max(...history.map(hist => hist.id));
      const messages: MessageDataWithSender[] = history.map(msg => ({
        id: msg.id,
        chatId: msg.chatId,
        senderId: msg.senderId,
        sender: { id: msg.senderId, username: msg.senderName, avatar: msg.senderAvatar },
        content: msg.content,
        sentAt: toDate(msg.sentAt),
        isSeen: msg.seen,
        seenAt: toDate(msg.seenAt),
      }));
      return { messages };
    },
  );

  api.addEndpoint("fetchMyUsername", z.object({}), z.object({ username: z.string() }), async (socket, _data) => {
    return { username: socket.user.name };
  });

  api.addEndpoint(
    "createChat",
    z.object({ username: z.string() }),
    z.object({ chat: chatSchemaWithParticipants }),
    async (socket, data) => {
      if (data.username === socket.user.name) {
        return fail("Cannot create chat with yourself");
      }
      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.name, data.username),
        columns: { id: true, name: true, avatar: true },
      });
      if (!user) {
        return fail("No such user");
      }
      const chatUsers = [socket.user.id, user.id];
      const chatName = chatUsers.sort().join("-");
      const chat_id = await db.query.chatsTable.findFirst({
        where: eq(chatsTable.name, chatName),
        columns: { id: true },
      });
      if (chat_id) {
        return fail("Chat already exists");
      }
      const insertedChat = await db.insert(chatsTable).values({ type: "private", name: chatName }).$returningId();
      for (const id of chatUsers) {
        await db.insert(chatUsersTable).values({ chatId: insertedChat[0].id, userId: id });
      }
      (await api.io.fetchSockets())
        .filter((s: any) => chatUsers.includes(s.user.id))
        .forEach(s => {
          s.join(`chat:${insertedChat[0].id}`);
        });
      return {
        chat: {
          id: insertedChat[0].id,
          name: user.name,
          type: "private" as const,
          participants: [
            { id: socket.user.id, username: socket.user.name, avatar: socket.user.avatar },
            { id: user.id, username: user.name, avatar: user.avatar },
          ],
        },
      };
    },
  );

  api.addEndpoint(
    "fetchChats",
    z.object({}),
    z.object({ chats: z.array(chatSchemaWithParticipants) }),
    async (socket, _data) => {
      const otherUser = db
        .select({
          chatId: chatUsersTable.chatId,
          name: usersTable.name,
        })
        .from(chatUsersTable)
        .innerJoin(usersTable, eq(chatUsersTable.userId, usersTable.id))
        .where(ne(chatUsersTable.userId, socket.user.id))
        .as("other_user");

      const chats = await db
        .select({
          id: chatsTable.id,
          type: chatsTable.type,
          name: sql<string>`
          CASE
            WHEN ${chatsTable.type} = 'private' THEN ${otherUser.name}
            ELSE ${chatsTable.name}
          END
        `.as("name"),
        })
        .from(chatsTable)
        .leftJoin(otherUser, eq(otherUser.chatId, chatsTable.id))
        .where(
          inArray(
            chatsTable.id,
            db.select({ chatId: chatUsersTable.chatId }).from(chatUsersTable).where(eq(chatUsersTable.userId, socket.user.id)),
          ),
        );

      if (chats.length <= 0) {
        return { chats: [] };
      }

      const chatIds = chats.map(c => c.id);
      const participants = await db
        .select({
          chatId: chatUsersTable.chatId,
          userId: usersTable.id,
          username: usersTable.name,
          avatar: usersTable.avatar,
        })
        .from(chatUsersTable)
        .leftJoin(usersTable, eq(chatUsersTable.userId, usersTable.id))
        .where(inArray(chatUsersTable.chatId, chatIds));

      const participantsByChat: Record<string, UserData[]> = {};
      for (const p of participants) {
        if (!participantsByChat[p.chatId]) participantsByChat[p.chatId] = [];
        participantsByChat[p.chatId].push({ id: p.userId || 0, username: p.username || "Unknown", avatar: p.avatar || "null" });
      }
      const chatsWithParticipants = chats.map(chat => ({
        ...chat,
        type: "private" as const,
        participants: participantsByChat[chat.id] || [],
      }));
      return { chats: chatsWithParticipants };
    },
  );

  api.addEndpoint(
    "fetchUserInfo",
    z
      .object({
        userId: z.number(),
        username: z.string(),
      })
      .partial(),
    z.object({ user: userSchema }),
    async (_socket, data) => {
      const user = await db.query.usersTable.findFirst({
        where: or(eq(usersTable.id, data?.userId || 0), eq(usersTable.name, data?.username || "")),
        columns: { id: true, name: true, avatar: true },
      });
      if (!user) return fail("User not found");
      return { user: { id: user?.id, username: user?.name, avatar: user?.avatar } };
    },
  );

  api.addEndpoint(
    "fetchChatId",
    z
      .object({
        userId: z.number(),
        username: z.string(),
      })
      .partial(),
    z.object({ chatId: z.number() }),
    async (socket, data) => {
      const user_id = await db.query.usersTable.findFirst({
        where: or(eq(usersTable.id, data.userId || 0), eq(usersTable.name, data.username || "")),
        columns: { id: true },
      });
      if (!user_id) return fail("User not found");
      data.userId = user_id.id;
      const chatUsers = [socket.user.id, data.userId];
      const chatName = chatUsers.sort().join("-");
      const chat = await db.query.chatsTable.findFirst({ where: eq(chatsTable.name, chatName), columns: { id: true } });
      if (chat) {
        return { chatId: chat.id };
      } else {
        return fail("No chat found");
      }
    },
  );

  api.addEndpoint("fetchCustomEmojis", z.object({}), z.object({ emojis: z.array(emojiSchema) }), async (socket, _data) => {
    const emojis = await db.query.emojisTable.findMany({ where: eq(emojisTable.uploaderId, socket.user.id) });
    return { emojis };
  });

  api.addEndpoint("seenAll", z.object({ chatId: z.uint32() }), z.object({}), async (socket, data) => {
    await db
      .update(messagesTable)
      .set({ seen: true, seenAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(messagesTable.chatId, data.chatId), ne(messagesTable.senderId, socket.user.id)));
    api.io.to(`chat:${data.chatId}`).emit("seenAll", { chat: data.chatId });
    return {};
  });

  api.addEndpoint("deleteMessage", z.object({ messageId: z.uint32() }), z.object({}), async (socket, data) => {
    const messageToDelete = await db.query.messagesTable.findFirst({ where: eq(messagesTable.id, data.messageId) });
    if (!messageToDelete) return fail("No such message");
    await db.delete(messagesTable).where(eq(messagesTable.id, messageToDelete.id));
    api.io.to(`chat:${messageToDelete.chatId}`).emit("messageDeleted", { message: messageToDelete.id });
    return {};
  });

  /* Deprecated
    socket.on("joinVoice", async data => {
        if (!data || !data.chat) {
            socket.emit("error", { msg: "Chat ID is required" });
            return;
        }
        socket.join(`voice:${data.chat}`);
        const sockets = await api.io.in(`voice:${data.chat}`).fetchSockets();
        const participants = sockets.map((socket: any) => {
            return { id: socket.user.id, name: socket.user.name };
        });
        socket.emit("joinedVoice", {
            role: (api.io.sockets.adapter.rooms.get(`voice:${data.chat}`)?.size || 0) >= 2 ? "answer" : "offer",
            participants,
        });
        socket.to(`voice:${data.chat}`).emit("userJoined", { user: socket.user });
    });

    socket.on("voiceAction", data => {
        socket.to(`voice:${data.chat}`).emit("voiceAction", data);
    });

    socket.on("getTurnUrls", async data => {
        try {
            if (!data || !data.chat) {
                return socket.emit("error", { msg: "Chat ID is required" });
            }
            const chatExists = await db.query.chatsTable.findFirst({
                where: eq(chatsTable.id, data.chat),
                columns: { id: true },
            });
            if (chatExists) {
                return socket.emit("error", { msg: "No such chat" });
            }
            if (data.chat !== 1) {
                const isInChat = await db.query.chatUsersTable.findFirst({
                    where: and(eq(chatUsersTable.chatId, data.chat), eq(chatUsersTable.userId, socket.user.id)),
                });
                if (!isInChat) {
                    return socket.emit("error", { msg: "You are not in this chat" });
                }
            }
            const urls = await turn.getTurnUrls(data.chat);
            socket.emit("turnUrls", { urls: urls });
        } catch (error) {
            socket.emit("error", { msg: "Unexpected error while getting turn credentials" });
            logger.error(
                `Unexpected error while getting turn credentials for chat ${data.chat} by ${formatUser(socket.user)}:\n${error}`,
            );
        }
    });
    */

  api.addEndpoint("linkFcmToken", z.object({ token: z.string() }), z.object({}), async (socket, data) => {
    const tokenExists = await db.query.fcmTokensTable.findFirst({
      where: eq(fcmTokensTable.token, data.token),
      columns: { id: true },
    });
    if (tokenExists) {
      return fail("This token is already linked to your account");
    }
    await db.insert(fcmTokensTable).values({ token: data.token, userId: socket.user.id });
    return {};
  });

  api.addEndpoint(
    "fetchMessage",
    z.object({ messageId: z.number() }),
    z.object({ message: messageSchema }),
    async (socket, data) => {
      const message = await db.query.messagesTable.findFirst({ where: eq(messagesTable.id, data.messageId) });
      if (!message) {
        return fail("Message not found");
      }
      if (message.chatId !== 1) {
        const inChat = await db.query.chatUsersTable.findFirst({
          where: and(eq(chatUsersTable.chatId, message.chatId), eq(chatUsersTable.userId, socket.user.id)),
        });
        if (!inChat) {
          return fail("You are not in this chat");
        }
      }
      const { seen, ...rest } = message;
      return { message: { isSeen: seen, ...rest } };
    },
  );

  if (process.env.CREATE_API_DESCRIPTION === "true") {
    const result: Record<string, { input: any; output: any }> = {};
    Object.keys(api.registry).forEach(name => {
      result[name] = {
        input: zodObjectToObject(api.registry[name].inputSchema),
        output: zodObjectToObject(api.registry[name].outputSchema),
      };
    });
    writeFileSync("api.json", JSON.stringify(result, null, 2));
    process.exit(0);
  }
}

export default createSocketEndpoints;
