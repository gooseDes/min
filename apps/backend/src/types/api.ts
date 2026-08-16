import z from "zod";

export interface UserData {
  id: number;
  username: string;
  avatar: string;
}

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  avatar: z.string(),
});

export interface ChatData {
  id: number;
  name: string;
}

export const chatSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export interface ChatDataWithParticipants extends ChatData {
  participants: UserData[];
}

export const chatSchemaWithParticipants = chatSchema.extend({
  participants: z.array(userSchema),
});

export interface EmojiData {
  id: number;
  name: string;
  uploaderId: number;
}

export const emojiSchema = z.object({
  id: z.number(),
  name: z.string(),
  uploaderId: z.number(),
});

export interface MessageData {
  id: number;
  chatId: number;
  senderId: number;
  content: string;
  sentAt: Date;
  isSeen: boolean;
  seenAt: Date | null;
}

export const messageSchema = z.object({
  id: z.number(),
  chatId: z.number(),
  senderId: z.number(),
  content: z.string(),
  sentAt: z.date(),
  isSeen: z.boolean(),
  seenAt: z.date().nullable(),
});

export interface MessageDataWithSender extends MessageData {
  sender: UserData;
}

export const messageSchemaWithSender = messageSchema.extend({
  sender: userSchema,
});
