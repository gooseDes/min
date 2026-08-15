import type { WebSocketEvent } from "@/types";
import { z } from "zod";

export const sendMessageInputSchema = z
  .object({ content: z.string(), chatId: z.number().int().gte(0).lte(4294967295) })
  .strict();
export const sendMessageOutputSchema = z.object({}).strict();

export const fetchChatMessagesInputSchema = z
  .object({
    chatId: z.number().int().gte(0).lte(4294967295),
    currentMessages: z.number().int().gte(0).lte(4294967295).optional(),
  })
  .strict();
export const fetchChatMessagesOutputSchema = z
  .object({
    messages: z.array(
      z
        .object({
          id: z.number(),
          chatId: z.number(),
          senderId: z.number(),
          content: z.string(),
          sentAt: z.string().datetime({ offset: true }),
          isSeen: z.boolean(),
          seenAt: z.string().datetime({ offset: true }),
          sender: z.object({ id: z.number(), username: z.string(), avatar: z.string() }).strict(),
        })
        .strict(),
    ),
  })
  .strict();

export const fetchMyUsernameInputSchema = z.object({}).strict();
export const fetchMyUsernameOutputSchema = z.object({ username: z.string() }).strict();

export const createChatInputSchema = z.object({ username: z.string() }).strict();
export const createChatOutputSchema = z
  .object({
    chat: z
      .object({
        id: z.number(),
        name: z.string(),
        participants: z.array(z.object({ id: z.number(), username: z.string(), avatar: z.string() }).strict()),
      })
      .strict(),
  })
  .strict();

export const fetchChatsInputSchema = z.object({}).strict();
export const fetchChatsOutputSchema = z
  .object({
    chats: z.array(
      z
        .object({
          id: z.number(),
          name: z.string(),
          participants: z.array(z.object({ id: z.number(), username: z.string(), avatar: z.string() }).strict()),
        })
        .strict(),
    ),
  })
  .strict();

export const fetchUserInfoInputSchema = z.object({ userId: z.number().optional(), username: z.string().optional() }).strict();
export const fetchUserInfoOutputSchema = z
  .object({ user: z.object({ id: z.number(), username: z.string(), avatar: z.string() }).strict() })
  .strict();

export const fetchChatIdInputSchema = z.object({ userId: z.number().optional(), username: z.string().optional() }).strict();
export const fetchChatIdOutputSchema = z.object({ chatId: z.number() }).strict();

export const fetchCustomEmojisInputSchema = z.object({}).strict();
export const fetchCustomEmojisOutputSchema = z
  .object({ emojis: z.array(z.object({ id: z.number(), name: z.string(), uploaderId: z.number() }).strict()) })
  .strict();

export const seenAllInputSchema = z.object({ chatId: z.number().int().gte(0).lte(4294967295) }).strict();
export const seenAllOutputSchema = z.object({}).strict();

export const deleteMessageInputSchema = z.object({ messageId: z.number().int().gte(0).lte(4294967295) }).strict();
export const deleteMessageOutputSchema = z.object({}).strict();

export const linkFcmTokenInputSchema = z.object({ token: z.string() }).strict();
export const linkFcmTokenOutputSchema = z.object({}).strict();

export const fetchMessageInputSchema = z.object({ messageId: z.number() }).strict();
export const fetchMessageOutputSchema = z
  .object({
    message: z
      .object({
        id: z.number(),
        chatId: z.number(),
        senderId: z.number(),
        content: z.string(),
        sentAt: z.string().datetime({ offset: true }),
        isSeen: z.boolean(),
        seenAt: z.string().datetime({ offset: true }),
      })
      .strict(),
  })
  .strict();

export const inputEndpoints = {
  sendMessage: sendMessageInputSchema,
  fetchChatMessages: fetchChatMessagesInputSchema,
  fetchMyUsername: fetchMyUsernameInputSchema,
  createChat: createChatInputSchema,
  fetchChats: fetchChatsInputSchema,
  fetchUserInfo: fetchUserInfoInputSchema,
  fetchChatId: fetchChatIdInputSchema,
  fetchCustomEmojis: fetchCustomEmojisInputSchema,
  seenAll: seenAllInputSchema,
  deleteMessage: deleteMessageInputSchema,
  linkFcmToken: linkFcmTokenInputSchema,
  fetchMessage: fetchMessageInputSchema,
} satisfies Record<WebSocketEvent, z.ZodObject>;

export const outputEndpoints = {
  sendMessage: sendMessageOutputSchema,
  fetchChatMessages: fetchChatMessagesOutputSchema,
  fetchMyUsername: fetchMyUsernameOutputSchema,
  createChat: createChatOutputSchema,
  fetchChats: fetchChatsOutputSchema,
  fetchUserInfo: fetchUserInfoOutputSchema,
  fetchChatId: fetchChatIdOutputSchema,
  fetchCustomEmojis: fetchCustomEmojisOutputSchema,
  seenAll: seenAllOutputSchema,
  deleteMessage: deleteMessageOutputSchema,
  linkFcmToken: linkFcmTokenOutputSchema,
  fetchMessage: fetchMessageOutputSchema,
} satisfies Record<WebSocketEvent, z.ZodObject>;
