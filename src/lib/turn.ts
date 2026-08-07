import { Connection } from "mysql2/promise";
import { objectToJson } from "./utils";

export class Turn {
  db: Connection;

  constructor(db: Connection) {
    this.db = db;
  }

  async createTurnCredentials(chatId: number = 1) {
    const response = await fetch(
      `https://${process.env.METERED_DOMAIN}.metered.live/api/v1/turn/credential?secretKey=${process.env.METERED_SECRET}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expiryInSeconds: 14400,
          label: `chat-${chatId}`,
        }),
      },
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || `Failed to create TURN credentials:\n${objectToJson(data)}`);
    await this.db.query("INSERT INTO turn_keys (api_key, available_for, chat_id) VALUES (?, ?, ?)", [
      data.apiKey,
      data.expiryInSeconds,
      chatId,
    ]);
    return data;
  }

  async getTurnCredentials(chatId: number = 1) {
    const [rows] = await this.db.query("SELECT * FROM turn_keys WHERE chat_id = ? ORDER BY created_at DESC LIMIT 1", [chatId]);
    if (!rows || (rows as any[]).length === 0) {
      return this.createTurnCredentials(chatId);
    } else {
      const keyData = (rows as any[])[0];
      const createdAt = new Date(keyData.created_at);
      const now = new Date();
      const diffInSeconds = (now.getTime() - createdAt.getTime()) / 1000;
      if (diffInSeconds >= keyData.available_for) {
        return this.createTurnCredentials(chatId);
      } else {
        return { apiKey: keyData.api_key, expiryInSeconds: keyData.available_for - diffInSeconds };
      }
    }
  }

  async getTurnUrls(chatId: number = 1) {
    const credentials = await this.getTurnCredentials(chatId);
    const response = await fetch(
      `https://${process.env.METERED_DOMAIN}.metered.live/api/v1/turn/credentials?apiKey=${credentials.apiKey}`,
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || `Failed to get TURN URLs:\n${objectToJson(data)}`);
    return data;
  }
}
