import type { MessageInputHandle } from "@components/HomePage/MessageInput";
import React from "react";

export const messageInputRef = React.createRef<MessageInputHandle>();

export function setMessagePrefix(messagePrefix: string) {
    if (messageInputRef.current) {
        messageInputRef.current.setMessagePrefix(messagePrefix);
    }
}
