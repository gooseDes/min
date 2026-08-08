import { setItem } from "@hooks/useLocalStorage";
import { swRegistration } from "@services/otherRefs";

export function isTauri() {
    return !!(window as any).__TAURI__;
}

export function requestNotificationPermission() {
    if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
            if (!("PushManager" in window)) {
                return console.warn("Push notifications are not supported on this browser.");
            }
            if (permission === "granted") {
                if (swRegistration.current) {
                    const base64 = import.meta.env.MIN_VAPID_PUBLIC.replace(/-/g, "+").replace(/_/g, "/");
                    const convertedKey = Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer;

                    swRegistration.current.pushManager
                        .subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: convertedKey,
                        })
                        .then(subscription => {
                            fetch(`${import.meta.env.MIN_API_URL}/subscribe`, {
                                method: "POST",
                                body: JSON.stringify({ token: localStorage.getItem("token"), subscription }),
                                headers: { "Content-Type": "application/json" },
                            })
                                .then(res => res.json())
                                .then(data => {
                                    console.log(data);
                                    if (data.ok) {
                                        new Notification("Success", {
                                            icon: "/logo192.png",
                                            badge: "/badge.png",
                                            body: "You will now receive push notifications",
                                        });
                                    } else {
                                        console.warn(data.msg);
                                    }
                                });
                        });
                } else {
                    console.warn("Trying to subscribe to push notifications while swRegistration is null");
                }
            }
        });
    }
}

export function setCurrentAppState(state: string) {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: "SET_APP_STATE",
            state: state,
        });
    }

    setItem("appState", state);
}

interface NotReplyMessage {
    isReply: false;
    replyingToId: null;
    text: string;
}

interface ReplyMessage {
    isReply: true;
    replyingToId: number;
    text: string;
}

export type MessageContent = NotReplyMessage | ReplyMessage;

export function parseMessageContent(text: string): MessageContent {
    const lines = text.split("\n");
    if (lines[0].startsWith("/reply ")) {
        return {
            text: lines.slice(1).join("\n"),
            replyingToId: parseInt(lines[0].substring(7)),
            isReply: true,
        };
    }
    return {
        text: lines.join("\n"),
        replyingToId: null,
        isReply: false,
    };
}
