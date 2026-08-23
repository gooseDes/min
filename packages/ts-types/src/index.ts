import type { ChatData, ChatDataWithParticipants } from "./types";

export * from "./types";

export function toChatData<T>(data: T): T extends ChatDataWithParticipants ? ChatData : T {
  if (data && typeof data === "object" && "participants" in data) {
    const { participants: _, ...rest } = data as any;
    return rest as any;
  }
  return data as any;
}
