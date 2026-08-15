export interface ApiClientOptions {
  url: string;
}

export interface AuthUserData {
  id: number;
  username: string;
  email: string;
}

export interface UserData {
  id: number;
  username: string;
  avatar: string;
}

export interface MessageData {
  id: number;
  content: string;
  senderId: number;
  chatId: number;
  sentAt: Date;
  isSeen: boolean;
  seenAt: Date | null;
}

export interface MessageDataWithSender extends MessageData {
  sender: UserData;
}

export interface ChatData {
  id: number;
  type: "group" | "private";
  name: string;
  participants: UserData[];
}

export type RNFile = {
  uri: string;
  name: string;
  type: string;
};

export type Image = RNFile | File;

export type Failed = {
  success: false;
  message: string;
};

// Http types

export type HttpRequestOptions = {
  token?: string;
  body?: any;
};

export type LoginResult =
  | Failed
  | {
      success: true;
      token: string;
      user: AuthUserData;
    };

export type VerifyTokenResult =
  | Failed
  | {
      success: true;
      is_valid: boolean;
    };

export type JsonHttpRequestResult =
  | Failed
  | {
      success: true;
      data: any;
    };

export type AttachImageResult =
  | Failed
  | {
      success: true;
      urls: string[];
    };

export type UploadAvatarResult =
  | Failed
  | {
      success: true;
      url: string;
      avatar: string;
    };

// WebSocket types

export type WebSocketEvent =
  | "sendMessage"
  | "fetchChatMessages"
  | "fetchMyUsername"
  | "createChat"
  | "fetchChats"
  | "fetchUserInfo"
  | "fetchChatId"
  | "fetchCustomEmojis"
  | "seenAll"
  | "deleteMessage"
  | "linkFcmToken"
  | "fetchMessage";

export type WebSocketOnlyReceiveEvent =
  "connect" | "disconnect" | "connect_error" | "newMessage" | "messageDeleted" | "seenAll";

export type WebSocketSubscribeOptions = {
  once?: boolean;
};

export type FetchUserInfoConfig =
  | {
      userId: number;
    }
  | {
      username: string;
    };

export type FetchUserInfoResult =
  | Failed
  | {
      success: true;
      user: UserData;
    };

export type FetchMessageInfoConfig = {
  messageId: number;
};

export type FetchMessageInfoResult =
  | Failed
  | {
      success: true;
      message: MessageData;
    };

export type FetchChatsResult =
  | Failed
  | {
      success: true;
      chats: ChatData[];
    };

export type FetchChatMessagesConfig = {
  chatId: number;
};

export type FetchChatMessagesResult =
  | Failed
  | {
      success: true;
      messages: MessageDataWithSender[];
    };

export type CreateChatConfig = {
  targetUsername: string;
};

export type CreateChatResult =
  | Failed
  | {
      success: true;
      chat: ChatData;
    };

export type SendMessageConfig = {
  chatId: number;
  content: string;
};

export type SendMessageResult =
  | Failed
  | {
      success: true;
    };

export type DeleteMessageConfig = {
  messageId: number;
};

export type DeleteMessageResult =
  | Failed
  | {
      success: true;
    };

export type LinkFcmTokenConfig = {
  token: string;
};

export type LinkFcmTokenResult =
  | Failed
  | {
      success: true;
    };
