import { http, HttpResponse } from "msw";

export const testUrl = "https://api.example.com";

export const httpHandlers = [
  http.post<never, any>(`${testUrl}/login`, async ({ request }) => {
    const { email, password } = await request.json();
    if (email === "user@example.com" && password === "pass")
      return HttpResponse.json({ token: "tok_123", id: 1, username: "user" });
    return HttpResponse.json({ msg: "Invalid credentials" }, { status: 400 });
  }),

  http.post<never, any>(`${testUrl}/register`, async ({ request }) => {
    const { username, email, password } = await request.json();
    if (email === "user@example.com" || username === "user")
      return HttpResponse.json({ msg: "Username or email already in use" }, { status: 400 });
    return HttpResponse.json({ token: "tok_456", id: 2 });
  }),

  http.post<never, any>(`${testUrl}/verify`, async ({ request }) => {
    const { token } = await request.json();
    if (token === "tok_valid") return HttpResponse.json({ valid: true });
    return HttpResponse.json({ valid: false, msg: "Invalid token" });
  }),

  http.post<never, any>(`${testUrl}/attach`, async ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.includes("tok_valid")) return HttpResponse.json({ success: false, msg: "Unauthorized" }, { status: 400 });
    return HttpResponse.json({ success: true, urls: ["https://example.com/image.webp"] });
  }),

  http.post<never, any>(`${testUrl}/upload-avatar`, async ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.includes("tok_valid")) return HttpResponse.json({ success: false, msg: "Unauthorized" }, { status: 400 });
    return HttpResponse.json({ success: true, url: "https://example.com/avatar_suffix.webp", avatar: "avatar_suffix" });
  }),
];

/*
export const wsHandler = wsChannel.addEventListener("connection", connection => {
    const io = toSocketIo(connection);

    // msg → emits "message"
    io.server.on("msg", (data: any) => {
        console.log("msg", data);
        if (!data || !data.text || !data.chat)
            return io.client.emit("error", "Message is empty or some required arguments are missing");
        io.client.emit("message", {
            id: 1,
            text: data.text,
            author_id: 1,
            author_avatar: "image",
            author: "author",
            chat: data.chat,
            sent_at: 1000,
        });
    });

    // getChatHistory → emits "history"
    io.server.on("getChatHistory", (data: any) => {
        if (!data || !data.chat) return io.client.emit("error", { msg: "Chat ID is required to get chat history" });
        io.client.emit("history", {
            chat: data.chat,
            messages: [
                {
                    id: 1,
                    chat_id: data.chat,
                    author_id: 1,
                    author_avatar: "image",
                    author: "author",
                    text: "Hello",
                    sent_at: 1000,
                    seen: false,
                },
            ],
            lastIndex: 1,
        });
    });

    // getName → emits "username"
    io.server.on("getName", (_data: any) => {
        io.client.emit("username", "author");
    });

    // getChats → emits "chats"
    io.server.on("getChats", (_data: any) => {
        io.client.emit("chats", {
            chats: [
                {
                    id: 1,
                    type: "group",
                    name: "Default Chat",
                    participants: [{ id: 1, name: "author", avatar: "image" }],
                },
            ],
        });
    });

    // createChat → emits "createChatResult"
    io.server.on("createChat", (data: any) => {
        if (!data || !data.nickname) return io.client.emit("createChatResult", { success: false, msg: "Nickname is required" });
        if (data.nickname === "author")
            return io.client.emit("createChatResult", { success: false, msg: "Cannot create chat with yourself" });
        io.client.emit("createChatResult", {
            success: true,
            chatId: 2,
            chatName: "1-2",
            users: [1, 2],
        });
    });

    // getUserInfo → emits "userInfo"
    io.server.on("getUserInfo", (data: any) => {
        if (!data || (!data.id && !data.name)) return io.client.emit("error", { msg: "No data provided" });
        if (data?.name !== "user" && data?.id !== 1) return io.client.emit("error", { msg: "No such user" });
        io.client.emit("userInfo", {
            user: { id: 1, name: "user", avatar: "image" },
        });
    });

    // getChatWith → emits "getChatWithResult"
    io.server.on("getChatWith", (data: any) => {
        if (!data || (!data.id && !data.name)) return io.client.emit("error", { msg: "No data provided" });
        io.client.emit("getChatWithResult", { chatId: 2 });
    });

    // getCustomEmojis → emits "customEmojis"
    io.server.on("getCustomEmojis", (_data: any) => {
        io.client.emit("customEmojis", {
            emojis: [{ id: 1, name: "smile", uploaderId: 1 }],
        });
    });

    // seenAll → emits "seenAll"
    io.server.on("seenAll", (data: any) => {
        if (!data || !data.chat) return io.client.emit("error", { msg: "Chat ID is required" });
        io.client.emit("seenAll", { chat: data.chat });
    });

    // deleteMessage → emits "deleteMessage"
    io.server.on("deleteMessage", (data: any) => {
        if (!data || !data.message) return io.client.emit("error", { msg: "Message ID is required" });
        io.client.emit("deleteMessage", { message: data.message });
    });

    // getMessage → emits "requestedMessage"
    io.server.on("getMessage", (data: any) => {
        if (!data || !data.messageId) return io.client.emit("error", { msg: "messageId is required" });
        io.client.emit("requestedMessage", {
            message: {
                id: data.messageId,
                chat_id: 1,
                author_id: 1,
                author_avatar: "image",
                author: "author",
                text: "Hello",
                sent_at: 1000,
                seen: false,
            },
        });
    });
});
 */
