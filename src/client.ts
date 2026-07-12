import {
    ApiClientOptions,
    AttachImageResult,
    CreateChatConfig,
    CreateChatResult,
    DeleteMessageConfig,
    DeleteMessageResult,
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
    WebSocketEmitEvent,
    WebSocketEvent,
} from "./types";
import { RNImageToBlob, toDate } from "./utils";
import { Subscription, WebSocketClient } from "./websocket";

export class ApiClient {
    private url: string;
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

    private socketFetchBase(
        emitEvent: WebSocketEmitEvent,
        event: WebSocketEvent,
        data: any,
        successCallback: (data: any) => void,
        errorCallback: (data: any) => void,
    ): void {
        let successSub: Subscription;
        let errorSub: Subscription;

        const cleanup = () => {
            successSub.remove();
            errorSub.remove();
        };

        successSub = this.socket.subscribe(
            event,
            data => {
                cleanup();
                successCallback(data);
            },
            { once: true },
        );

        errorSub = this.socket.subscribe(
            "error",
            data => {
                cleanup();
                errorCallback(data);
            },
            { once: true },
        );

        this.socket.emit(emitEvent, data);
    }

    private socketFetchBaseNoError(
        emitEvent: WebSocketEmitEvent,
        event: WebSocketEvent,
        data: any,
        callback: (data: any) => void,
    ): void {
        let successSub: Subscription;

        successSub = this.socket.subscribe(
            event,
            data => {
                successSub.remove();
                callback(data);
            },
            { once: true },
        );

        this.socket.emit(emitEvent, data);
    }

    /**
     * Requires socket
     */
    async fetchUser(config: FetchUserInfoConfig): Promise<FetchUserInfoResult> {
        return new Promise<FetchUserInfoResult>(resolve => {
            this.socketFetchBase(
                "getUserInfo",
                "userInfo",
                "username" in config ? { name: config.username } : { id: config.userId },
                data =>
                    resolve({ success: true, user: { id: data.user.id, username: data.user.name, avatar: data.user.avatar } }),
                data => resolve({ success: false, message: data.msg }),
            );
        });
    }

    /**
     * Requires socket
     */
    async fetchMessage(config: FetchMessageInfoConfig): Promise<FetchMessageInfoResult> {
        return new Promise<FetchMessageInfoResult>(resolve => {
            this.socketFetchBase(
                "getMessage",
                "requestedMessage",
                { messageId: config.messageId },
                data =>
                    resolve({
                        success: true,
                        message: {
                            id: data.message.id,
                            content: data.message.content,
                            senderId: data.message.senderId,
                            chatId: data.message.chatId,
                            sentAt: toDate(data.message.sentAt),
                            isSeen: data.message.seen,
                            seenAt: toDate(data.message.seenAt),
                        },
                    }),
                data => resolve({ success: false, message: data.msg }),
            );
        });
    }

    /**
     * Requires socket
     */
    async fetchChats(): Promise<FetchChatsResult> {
        return new Promise<FetchChatsResult>(resolve => {
            this.socketFetchBase(
                "getChats",
                "chats",
                {},
                data =>
                    resolve({
                        success: true,
                        chats: data.chats.map((c: any) => ({
                            id: c.id,
                            name: c.name,
                            type: c.type,
                            participants: c.participants.map((p: any) => ({
                                id: p.id,
                                username: p.name,
                                avatar: p.avatar,
                            })),
                        })),
                    }),
                data => resolve({ success: false, message: data.msg }),
            );
        });
    }

    /**
     * Requires socket
     */
    async fetchChatMessages(config: FetchChatMessagesConfig): Promise<FetchChatMessagesResult> {
        return new Promise<FetchChatMessagesResult>(resolve => {
            this.socketFetchBase(
                "getChatHistory",
                "history",
                { chat: config.chatId },
                data =>
                    resolve({
                        success: true,
                        messages: data.messages.map((m: any) => ({
                            id: m.id,
                            chatId: m.chat_id,
                            senderId: m.author_id,
                            content: m.text,
                            sentAt: toDate(m.sent_at),
                            isSeen: m.seen,
                            seenAt: toDate(m.seen_at),
                            sender: {
                                id: m.author_id,
                                username: m.author,
                                avatar: m.author_avatar,
                            },
                        })),
                    }),
                data => resolve({ success: false, message: data.msg }),
            );
        });
    }

    /**
     * Requires socket
     */
    async createChat(config: CreateChatConfig): Promise<CreateChatResult> {
        return new Promise<CreateChatResult>(resolve => {
            this.socketFetchBaseNoError("createChat", "createChatResult", { nickname: config.targetUsername }, data => {
                if (data.success) {
                    resolve({
                        success: true,
                        chat: {
                            id: data.chatId,
                            name: data.chatName,
                            type: "private",
                            participants: data.users.map((u: any) => ({ id: u.id, username: u.username, avatar: u.avatar })),
                        },
                    });
                } else {
                    resolve({ success: false, message: data.msg });
                }
            });
        });
    }

    /**
     * Requires socket
     */
    async sendMessage(config: SendMessageConfig): Promise<SendMessageResult> {
        return new Promise<SendMessageResult>(resolve => {
            this.socketFetchBase(
                "msg",
                "messageSent",
                { chat: config.chatId, text: config.content },
                _ => resolve({ success: true }),
                data => resolve({ success: false, message: data.msg }),
            );
        });
    }

    /**
     * Requires socket
     */
    async deleteMessage(config: DeleteMessageConfig): Promise<DeleteMessageResult> {
        return new Promise<DeleteMessageResult>(resolve => {
            this.socketFetchBase(
                "deleteMessage",
                "messageDeleted",
                { message: config.messageId },
                _ => resolve({ success: true }),
                data => resolve({ success: false, message: data.msg }),
            );
        });
    }

    /**
     * Requires socket
     */
    async linkFcmToken(config: LinkFcmTokenConfig): Promise<LinkFcmTokenResult> {
        return new Promise<LinkFcmTokenResult>(resolve => {
            this.socketFetchBase(
                "addFcmToken",
                "fcmTokenAdded",
                { token: config.token },
                _ => resolve({ success: true }),
                data => resolve({ success: false, message: data.msg }),
            );
        });
    }

    /**
     * Requires socket
     */
    subscribeToMessages(callback: (message: MessageDataWithSender) => void): Subscription {
        return this.socket.subscribe("message", (data: any) =>
            callback({
                id: data.id,
                content: data.text,
                senderId: data.author_id,
                chatId: data.chat,
                sentAt: toDate(data.sent_at),
                isSeen: false,
                seenAt: null,
                sender: { id: data.author_id, username: data.author, avatar: data.author_avatar },
            }),
        );
    }

    /**
     * Requires socket
     */
    subscribeToDeletingMessages(callback: (id: number) => void): Subscription {
        return this.socket.subscribe("deleteMessage", (data: any) => callback(data.message));
    }
}
