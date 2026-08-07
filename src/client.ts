import z from "zod";
import { inputEndpoints, outputEndpoints } from "./apiSchemas";
import {
  ApiClientOptions,
  AttachImageResult,
  CreateChatConfig,
  CreateChatResult,
  DeleteMessageConfig,
  DeleteMessageResult,
  Failed,
  FetchChatMessagesConfig,
  FetchChatMessagesResult,
  FetchChatsResult,
  FetchMessageInfoConfig,
  FetchMessageInfoResult,
  FetchUserInfoConfig,
  FetchUserInfoResult,
  HttpRequestOptions,
  Image,
  JsonHttpRequestResult,
  LinkFcmTokenConfig,
  LinkFcmTokenResult,
  LoginResult,
  MessageDataWithSender,
  SendMessageConfig,
  SendMessageResult,
  UploadAvatarResult,
  VerifyTokenResult,
  WebSocketEvent,
} from "./types";
import { RNImageToBlob, toDate } from "./utils";
import { Subscription, WebSocketClient } from "./websocket";

export class ApiClient {
  private url: string;
  private lastRequestId: number = 0;
  public socket: WebSocketClient;

  constructor(options: ApiClientOptions) {
    this.url = options.url;
    this.socket = new WebSocketClient(this.url);
  }

  async jsonHttpRequest(endpoint: string, data: any): Promise<JsonHttpRequestResult> {
    const response = await fetch(`${this.url}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    if (response.ok) {
      return { success: true, data: json };
    } else {
      return { success: false, message: json.msg };
    }
  }

  async httpRequest(endpoint: string, options?: HttpRequestOptions): Promise<JsonHttpRequestResult> {
    const { token, body } = options ?? {};
    const response = await fetch(`${this.url}/${endpoint}`, {
      method: "POST",
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
      body,
    });
    const json = await response.json();
    if (response.ok) {
      return { success: true, data: json };
    } else {
      return { success: false, message: json.msg };
    }
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const response = await this.jsonHttpRequest("login", { email, password });
    if (!response.success) {
      return { success: false, message: response.message };
    }
    return {
      success: true,
      token: response.data.token,
      user: { id: response.data.id, email: email, username: response.data.username },
    };
  }

  async register(username: string, email: string, password: string): Promise<LoginResult> {
    const response = await this.jsonHttpRequest("register", { username, email, password });
    if (!response.success) {
      return { success: false, message: response.message };
    }
    return { success: true, token: response.data.token, user: { id: response.data.id, email, username } };
  }

  async verifyToken(token: string): Promise<VerifyTokenResult> {
    const response = await this.jsonHttpRequest("verify", { token });
    if (!response.success) {
      return { success: false, message: response.message };
    }
    return {
      success: true,
      is_valid: response.data.valid,
    };
  }

  async attachImage(token: string, image: Image): Promise<AttachImageResult> {
    const formData = new FormData();

    // Web
    if (typeof File !== "undefined" && image instanceof File) {
      formData.append("attachments", image);
    }
    // React Native
    else if (image && typeof image === "object" && "uri" in image) {
      try {
        const blob = await RNImageToBlob(image);
        formData.append("attachments", blob, image.name);
      } catch (error) {
        console.error("Error while converting image:", error);
        /* @ts-ignore */
        formData.append("attachments", image);
      }
    } else {
      /* @ts-ignore */
      formData.append("attachments", image);
    }

    const response = await this.httpRequest("attach", { body: formData, token });
    if (!response.success) {
      return { success: false, message: response.message };
    }
    return { success: true, urls: response.data.urls };
  }

  async uploadAvatar(token: string, image: Image): Promise<UploadAvatarResult> {
    const formData = new FormData();
    if (image instanceof File) {
      formData.append("avatar", image);
    } else {
      try {
        const blob = await RNImageToBlob(image);
        formData.append("avatar", blob, image.name);
      } catch (error) {
        console.error("Error while converting image:", error);
        /* @ts-ignore */
        formData.append("avatar", image);
      }
    }
    const response = await this.httpRequest("upload-avatar", { body: formData, token });
    if (!response.success) {
      return { success: false, message: response.message };
    }
    return { success: true, url: response.data.url, avatar: response.data.avatar };
  }

  initSocket(token: string) {
    this.socket.init(token);
  }

  closeSocket() {
    this.socket.close();
  }

  resetSocket() {
    this.socket.reset();
  }

  subscribeToSocketConnectionSuccess(callback: () => void) {
    this.socket.subscribeToConnectionSuccess(callback);
  }

  subscribeToSocketConnectionError(callback: (error: Error) => void) {
    this.socket.subscribeToConnectionError(callback);
  }

  private socketFetchBase<T, E extends WebSocketEvent>(
    event: E,
    data: z.infer<(typeof inputEndpoints)[E]>,
    successCallback: (data: z.infer<(typeof outputEndpoints)[E]>) => T,
  ): Promise<T | Failed> {
    return new Promise<T | Failed>(resolve => {
      const requestId = ++this.lastRequestId;
      const sub = this.socket.subscribe(
        event,
        data => {
          if (!data?.requestId || data?.requestId === requestId) {
            sub.remove();
            if (data && data?.success) resolve(successCallback(data));
            else resolve({ success: false, message: data?.message });
          }
        },
        { once: true },
      );

      this.socket.emit(event, data);
    });
  }

  /**
   * Requires socket
   */
  async fetchUser(config: FetchUserInfoConfig): Promise<FetchUserInfoResult> {
    return this.socketFetchBase(
      "fetchUserInfo",
      "username" in config ? { username: config.username } : { userId: config.userId },
      data => ({ success: true, user: { id: data.user.id, username: data.user.username, avatar: data.user.avatar } }),
    );
  }

  /**
   * Requires socket
   */
  async fetchMessage(config: FetchMessageInfoConfig): Promise<FetchMessageInfoResult> {
    return this.socketFetchBase("fetchMessage", { messageId: config.messageId }, data => ({
      success: true,
      message: {
        id: data.message.id,
        content: data.message.content,
        senderId: data.message.senderId,
        chatId: data.message.chatId,
        sentAt: toDate(data.message.sentAt),
        isSeen: data.message.isSeen,
        seenAt: toDate(data.message.seenAt),
      },
    }));
  }

  /**
   * Requires socket
   */
  async fetchChats(): Promise<FetchChatsResult> {
    return this.socketFetchBase("fetchChats", {}, data => ({
      success: true,
      chats: data.chats.map(c => ({
        id: c.id,
        name: c.name,
        type: "private",
        participants: c.participants.map(p => ({
          id: p.id,
          username: p.username,
          avatar: p.avatar,
        })),
      })),
    }));
  }

  /**
   * Requires socket
   */
  async fetchChatMessages(config: FetchChatMessagesConfig): Promise<FetchChatMessagesResult> {
    return this.socketFetchBase("fetchChatMessages", { chatId: config.chatId }, data => ({
      success: true,
      messages: data.messages.map(m => ({
        id: m.id,
        chatId: m.chatId,
        senderId: m.senderId,
        content: m.content,
        sentAt: toDate(m.sentAt),
        isSeen: m.isSeen,
        seenAt: toDate(m.seenAt),
        sender: {
          id: m.sender.id,
          username: m.sender.username,
          avatar: m.sender.avatar,
        },
      })),
    }));
  }

  /**
   * Requires socket
   */
  async createChat(config: CreateChatConfig): Promise<CreateChatResult> {
    return this.socketFetchBase("createChat", { username: config.targetUsername }, data => {
      return {
        success: true,
        chat: {
          id: data.chat.id,
          name: data.chat.name,
          type: "private",
          participants: data.chat.participants.map(u => ({ id: u.id, username: u.username, avatar: u.avatar })),
        },
      };
    });
  }

  /**
   * Requires socket
   */
  async sendMessage(config: SendMessageConfig): Promise<SendMessageResult> {
    return this.socketFetchBase("sendMessage", { chatId: config.chatId, content: config.content }, _ => ({ success: true }));
  }

  /**
   * Requires socket
   */
  async deleteMessage(config: DeleteMessageConfig): Promise<DeleteMessageResult> {
    return this.socketFetchBase("deleteMessage", { messageId: config.messageId }, _ => ({ success: true }));
  }

  /**
   * Requires socket
   */
  async linkFcmToken(config: LinkFcmTokenConfig): Promise<LinkFcmTokenResult> {
    return this.socketFetchBase("linkFcmToken", { token: config.token }, _ => ({ success: true }));
  }

  /**
   * Requires socket
   */
  subscribeToMessages(callback: (message: MessageDataWithSender) => void): Subscription {
    return this.socket.subscribe("newMessage", (data: any) =>
      callback({
        id: data.id,
        content: data.content,
        senderId: data.senderId,
        chatId: data.chatId,
        sentAt: toDate(data.sentAt),
        isSeen: false,
        seenAt: null,
        sender: { id: data.sender.id, username: data.sender.username, avatar: data.sender.avatar },
      }),
    );
  }

  /**
   * Requires socket
   */
  subscribeToDeletingMessages(callback: (id: number) => void): Subscription {
    return this.socket.subscribe("messageDeleted", (data: any) => callback(data.message));
  }
}
