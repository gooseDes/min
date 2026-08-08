import useLocalStorage from "@hooks/useLocalStorage";
import type { ChatData } from "@min/api-client";
import { stagger, useAnimate } from "framer-motion";
import { useImperativeHandle, useState, type MouseEvent, type Ref } from "react";
import { flushSync } from "react-dom";
import ClickableProfile from "../ClickableProfile";
import styles from "./ChatsContainer.module.scss";

export interface ChatsContainerHandle {
    setChats: (chats: ChatData[]) => Promise<void>;
    addChat: (chat: ChatData) => Promise<void>;
}

export interface ChatsContainerProps {
    ref?: Ref<ChatsContainerHandle>;
    onClick?: (chat: ChatData, e: MouseEvent<HTMLDivElement>) => void;
}

function ChatsContainer(props: ChatsContainerProps) {
    const [scope, animate] = useAnimate();
    const [user] = useLocalStorage("user");
    const [chats, setChats] = useState<ChatData[]>([]);
    const { ref, onClick } = props;

    useImperativeHandle(ref, () => ({
        setChats: async (chats: ChatData[]) => {
            flushSync(() => setChats(chats));
            await animate(".chatItem", { opacity: 0, translateX: -200, scale: 0 }, { duration: 0 });
            return Promise.all([
                animate(".chatItem", { opacity: 1 }, { delay: stagger(0.05) }),
                animate(
                    ".chatItem",
                    { translateX: 0, scale: 1 },
                    { type: "spring", damping: 15, stiffness: 250, delay: stagger(0.05) },
                ),
            ]).then();
        },
        addChat: async (chat: ChatData) => {
            flushSync(() => setChats(prev => [...prev, chat]));
            await animate(".chatItem", { opacity: 1 });
        },
    }));

    return (
        <div className={styles.container} ref={scope}>
            {chats.map(chat => (
                <ClickableProfile
                    key={chat.id}
                    className="chatItem"
                    style={{ opacity: 0 }}
                    image={`${import.meta.env.MIN_API_URL}/avatars/${
                        chat.participants?.find(participant => (participant?.id || -1) !== user.id)?.avatar || "default"
                    }.webp`}
                    text={chat.name}
                    isInList={true}
                    onClick={e => onClick?.(chat, e)}
                />
            ))}
        </div>
    );
}

export default ChatsContainer;
