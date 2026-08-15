import { testUrl } from "@/__mocks__/handlers";
import { toDate } from "@/utils";
import { WebSocketClient } from "@/websocket";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "@jest/globals";

const socket = new WebSocketClient(testUrl);

describe("WebSocketClient", () => {
  beforeAll(() => {
    socket.init("tok_123");
  });
  it("subscribes to events", done => {
    socket.subscribe(
      "newMessage",
      data => {
        try {
          expect(data).toEqual({
            id: 1,
            content: "text",
            senderId: 1,
            sender: {
              id: 1,
              username: "Test User",
              avatar: "image",
            },
            chatId: 1,
            sentAt: toDate(1000),
            isSeen: false,
            seenAt: null,
          });
          done();
        } catch (error: any) {
          done(error);
        }
      },
      { once: true },
    );

    socket.emit("sendMessage", {
      content: "text",
      chatId: 1,
    });
  });
});

afterEach(() => {
  socket.reset();
});

afterAll(() => {
  socket.close();
});
