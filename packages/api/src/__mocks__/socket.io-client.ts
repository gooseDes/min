import { inputEndpoints, outputEndpoints } from "@/apiSchemas";
import { MessageDataWithSender, WebSocketEvent, WebSocketOnlyReceiveEvent } from "@/types";
import { toDate } from "@/utils";
import z from "zod";

type Listener = (...args: any[]) => void;

type Listeners = Map<string, Array<Listener>>;
type InferInput<E extends WebSocketEvent> = z.infer<(typeof inputEndpoints)[E]>;
type InferOutput<E extends WebSocketEvent> = z.infer<(typeof outputEndpoints)[E]>;

class MockSocket {
  public connected = false;
  private listeners: Listeners = new Map();

  constructor(
    public url: string,
    public opts: any,
  ) {
    queueMicrotask(() => {
      this.connected = true;
      this.emitEvent("connect");
    });
  }

  on(event: string, callback: Listener) {
    const current = this.listeners.get(event) ?? [];
    current.push(callback);
    this.listeners.set(event, current);
    return this;
  }

  once(event: string, callback: Listener) {
    const wrapper = (data: any) => {
      this.off(event, wrapper);
      callback(data);
    };
    return this.on(event, wrapper);
  }

  off(event: string, callback: Listener) {
    const current = this.listeners.get(event);
    if (!current) return this;
    this.listeners.set(
      event,
      current.filter(listener => listener !== callback),
    );
    return this;
  }

  emit(event: WebSocketEvent, data?: any) {
    if (event in inputEndpoints) {
      queueMicrotask(() => {
        const inputSchema = inputEndpoints[event];
        const outputSchema = outputEndpoints[event];
        if (inputSchema) {
          const parsed = inputSchema.safeParse(data);
          if (!parsed.success) {
            this.emitEvent(event, { success: false, message: `Invalid input data: ${parsed.error.message}` });
            return this;
          } else {
            const fail = (message: string) => {
              this.emitEvent(event, { success: false, message: `Failed ${event}: ${message}` });
              return this;
            };
            const success = (data: z.infer<typeof outputSchema>) => {
              this.emitEvent(event, { success: true, ...data });
              return this;
            };
            switch (event) {
              case "sendMessage": {
                const inputData = parsed.data as InferInput<typeof event>;
                if (inputData.chatId !== 1) {
                  fail("You are not in this chat");
                }
                this.emitEvent("newMessage", {
                  id: 1,
                  chatId: inputData.chatId,
                  senderId: 1,
                  sender: { id: 1, username: "Test User", avatar: "image" },
                  content: inputData.content,
                  sentAt: toDate(1000),
                  isSeen: false,
                  seenAt: null,
                } satisfies MessageDataWithSender);
                success({} satisfies InferOutput<typeof event>);
                break;
              }
              case "fetchChatMessages": {
                success({
                  messages: [
                    {
                      id: 1,
                      chatId: 1,
                      senderId: 1,
                      sender: { id: 1, username: "Test User", avatar: "image" },
                      content: "Test Message",
                      sentAt: toDate(1000).toISOString(),
                      isSeen: false,
                      seenAt: toDate(1000).toISOString(),
                    },
                  ],
                } satisfies InferOutput<typeof event>);
                break;
              }
              case "fetchMyUsername": {
                success({ username: "Test User" } satisfies InferOutput<typeof event>);
                break;
              }
              case "createChat": {
                const inputData = data as InferInput<typeof event>;
                if (inputData.username === "Another User")
                  success({
                    chat: {
                      id: 1,
                      name: "Another User",
                      participants: [
                        { id: 1, username: "Test User", avatar: "image" },
                        { id: 2, username: "Another User", avatar: "image" },
                      ],
                    },
                  } satisfies InferOutput<typeof event>);
                else fail("Cannot create chat with yourself");
                break;
              }
              case "fetchChats": {
                success({
                  chats: [
                    {
                      id: 1,
                      name: "Another User",
                      participants: [
                        { id: 1, username: "Test User", avatar: "image" },
                        { id: 2, username: "Another User", avatar: "image" },
                      ],
                    },
                  ],
                } satisfies InferOutput<typeof event>);
                break;
              }
              case "fetchUserInfo": {
                const inputData = parsed.data as InferInput<typeof event>;
                if (inputData.userId === 1 || inputData.username === "Test User")
                  success({ user: { id: 1, username: "Test User", avatar: "image" } } satisfies InferOutput<typeof event>);
                else fail("No such user");
                break;
              }
              case "fetchChatId": {
                success({ chatId: 1 } satisfies InferOutput<typeof event>);
                break;
              }
              case "fetchCustomEmojis": {
                success({ emojis: [{ id: 1, name: "test_emoji", uploaderId: 1 }] } satisfies InferOutput<typeof event>);
                break;
              }
              case "seenAll": {
                success({} satisfies InferOutput<typeof event>);
                break;
              }
              case "deleteMessage": {
                const inputData = parsed.data as InferInput<typeof event>;
                if (inputData.messageId === 1) success({} satisfies InferOutput<typeof event>);
                else fail("Message not found");
                break;
              }
              case "linkFcmToken": {
                const inputData = parsed.data as InferInput<typeof event>;
                if (inputData.token === "tok_123") success({} satisfies InferOutput<typeof event>);
                else fail("Token already exists");
                break;
              }
              case "fetchMessage": {
                const inputData = parsed.data as InferInput<typeof event>;
                if (inputData.messageId === 1)
                  success({
                    message: {
                      id: 1,
                      chatId: 1,
                      senderId: 1,
                      content: "Test Message",
                      sentAt: toDate(1000).toISOString(),
                      isSeen: false,
                      seenAt: toDate(1000).toISOString(),
                    },
                  } satisfies InferOutput<typeof event>);
                else if (inputData.messageId === 2) fail("You are not in this chat");
                else fail("Message not found");
                break;
              }
              default:
                break;
            }
          }

          this.emitEvent(event, { success: true, data: parsed.data });
          return this;
        }
      });
      return this;
    }
    /*
    if (event === "msg") {
      queueMicrotask(() => {
        if (!data || !data.text || !data.chat) {
          this.emitEvent("error", { msg: "No data provided" });
          return;
        }
        if (data.chat !== 1) {
          this.emitEvent("error", { msg: "You are not in this chat" });
          return;
        }
        this.emit("message", {
          id: 1,
          text: data.text,
          author_id: 1,
          author_avatar: "image",
          author: "user",
          chat: data.chat,
          sent_at: 1000,
        });
        this.emitEvent("messageSent", {});
      });
      return this;
    }

    if (event === "getUserInfo") {
      queueMicrotask(() => {
        if (!data || (!data.id && !data.name)) {
          this.emit("error", { msg: "No data provided" });
          return;
        }
        if (data.name !== "user" && data.id !== 1) {
          this.emit("error", { msg: "No such user" });
          return;
        }
        this.emit("userInfo", {
          user: { id: 1, name: "user", avatar: "image" },
        });
      });
      return this;
    }

    if (event === "getMessage") {
      queueMicrotask(() => {
        if (!data || !data.messageId) {
          this.emit("error", { msg: "messageId is required" });
          return;
        }
        if (data.messageId !== 1 && data.messageId !== 2) {
          this.emit("error", { msg: "Message not found" });
          return;
        }
        if (data.messageId === 2) {
          this.emit("error", { msg: "You are not in this chat" });
          return;
        }
        this.emit("requestedMessage", {
          message: {
            id: 1,
            content: "Hello",
            senderId: 1,
            chatId: 1,
            sentAt: 1000,
            seen: false,
            seenAt: 1000,
          },
        });
      });
      return this;
    }

    if (event === "getChats") {
      queueMicrotask(() => {
        this.emit("chats", {
          chats: [
            {
              id: 1,
              type: "private",
              name: "someone",
              participants: [
                { id: 1, name: "user", avatar: "image" },
                { id: 2, name: "someone", avatar: "image" },
              ],
            },
          ],
        });
      });
      return this;
    }

    if (event === "getChatHistory") {
      queueMicrotask(() => {
        this.emit("history", {
          messages: [
            {
              id: 1,
              chat_id: 1,
              author_id: 1,
              author_avatar: "image",
              author: "someone",
              text: "Hello",
              sent_at: 1000,
              seen: false,
              seen_at: 1000,
            },
          ],
        });
      });
      return this;
    }

    if (event === "createChat") {
      queueMicrotask(() => {
        if (!data || !data.nickname) {
          this.emit("createChatResult", {
            success: false,
            msg: "No data provided",
          });
          return;
        }

        if (data.nickname === "user") {
          this.emit("createChatResult", {
            success: false,
            msg: "Cannot create chat with yourself",
          });
          return;
        }

        this.emit("createChatResult", {
          success: true,
          chatId: 1,
          chatName: data.nickname,
          users: [
            { id: 1, username: "user", avatar: "image" },
            { id: 2, username: data.nickname, avatar: "image" },
          ],
        });
      });
      return this;
    }

    if (event === "addFcmToken") {
      queueMicrotask(() => {
        if (!data || !data.token) {
          this.emit("error", { msg: "No data provided" });
          return;
        }
        if (data.token === "old_token") {
          this.emit("error", { msg: "Token already exists" });
          return;
        }
        this.emit("fcmTokenAdded", {});
      });
      return this;
    }

    if (event === "deleteMessage") {
      queueMicrotask(() => {
        if (!data || !data.message) {
          this.emit("error", { msg: "No data provided" });
          return;
        }
        if (data.message !== 1) {
          this.emit("error", { msg: "Message not found" });
          return;
        }
        this.emitEvent("deleteMessage", { message: data.message });
        this.emit("messageDeleted", {});
      });
      return this;
    }
    */

    this.emitEvent(event, data);
    return this;
  }

  disconnect() {
    this.connected = false;
    this.emitEvent("disconnect");
  }

  private emitEvent(event: WebSocketEvent | WebSocketOnlyReceiveEvent, data?: any) {
    const callbacks = this.listeners.get(event);
    if (!callbacks) return;
    callbacks.slice().forEach(callback => callback(data));
  }
}

export function io(url: string, opts: any) {
  return new MockSocket(url, opts);
}

export type Socket = MockSocket;
