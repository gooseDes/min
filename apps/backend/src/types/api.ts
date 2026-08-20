export interface UserData {
  id: number;
  username: string;
  avatar: string;
}

export interface ChatData {
  id: number;
  name: string;
}

export interface ChatDataWithParticipants extends ChatData {
  participants: UserData[];
}

export interface EmojiData {
  id: number;
  name: string;
  uploaderId: number;
}

export interface MessageData {
  id: number;
  chatId: number;
  senderId: number;
  content: string;
  sentAt: Date;
  isSeen: boolean;
  seenAt: Date | null;
}

export interface MessageDataWithSender extends MessageData {
  sender: UserData;
}
