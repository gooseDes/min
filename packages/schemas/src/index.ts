import { z } from "zod";

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  avatar: z.string(),
});

export const chatSchema = z.object({
  id: z.number(),
  type: z.enum(["group", "private"] as const),
  name: z.string(),
});

export const chatSchemaWithParticipants = chatSchema.extend({
  participants: z.array(userSchema),
});

export const emojiSchema = z.object({
  id: z.number(),
  name: z.string(),
  uploaderId: z.number(),
});

export const messageSchema = z.object({
  id: z.number(),
  chatId: z.number(),
  senderId: z.number(),
  content: z.string(),
  sentAt: z.date(),
  isSeen: z.boolean(),
  seenAt: z.date().nullable(),
});

export const messageSchemaWithSender = messageSchema.extend({
  sender: userSchema,
});
