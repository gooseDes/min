import type { MessageDataWithSender } from "@min/api-client";
import { motion } from "framer-motion";
import { useImperativeHandle, useRef, useState, type Ref } from "react";
import { flushSync } from "react-dom";
import Message from "./Message";
import styles from "./MessagesContainer.module.scss";

type ListMessageData = MessageDataWithSender & { shown: boolean; type: "header" | "regular" };

export interface MessagesContainerHandle {
    scrollToBottom: (behavior: ScrollBehavior) => void;
    clearMessages: () => Promise<void>;
    setMessages: (messages: MessageDataWithSender[]) => Promise<void>;
    addMessage: (message: MessageDataWithSender) => void;
    removeMessage: (messageId: number) => void;
}

export interface MessagesContainerProps {
    ref?: Ref<MessagesContainerHandle>;
}

function MessagesContainer(props: MessagesContainerProps) {
    const { ref } = props;

    const [messages, setMessages] = useState<ListMessageData[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [animationProgress, setAnimationProgress] = useState<number>(0);
    const [showMessages, setShowMessages] = useState<boolean>(false);

    const isAtBottom = () => {
        if (!containerRef.current) return false;

        return (
            Math.abs(
                containerRef.current?.scrollHeight - containerRef.current?.scrollTop - containerRef.current?.clientHeight,
            ) < 200
        );
    };

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        if (!containerRef.current) return;

        containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior });
    };

    useImperativeHandle(ref, () => ({
        scrollToBottom: (behavior: ScrollBehavior = "smooth") => scrollToBottom(behavior),
        clearMessages: () => {
            return new Promise(resolve => {
                setShowMessages(false);
                setAnimationProgress(0);

                setTimeout(() => {
                    setMessages([]);
                    resolve();
                }, 100);
            });
        },
        setMessages: async (msgs: MessageDataWithSender[]) => {
            setShowMessages(true);
            const newMessages: ListMessageData[] = [];
            msgs.forEach((msg, index) => {
                let type: "header" | "regular";

                if (index === 0) type = "header";
                else type = msgs[index - 1].sender.id !== msg.sender.id ? "header" : "regular";

                newMessages.push({ shown: true, type: type, ...msg });
            });
            flushSync(() => setMessages(newMessages));
            if (containerRef.current) {
                containerRef.current.scrollTop = containerRef.current.scrollHeight;
            }
            for (let i = 0; i < 15; i++) {
                setTimeout(() => setAnimationProgress(prev => prev + 1), i * 50);
            }
        },
        addMessage: (msg: MessageDataWithSender) => {
            if (!containerRef.current) return;
            flushSync(() =>
                setMessages(prev => [
                    ...prev,
                    { shown: true, type: prev[prev.length - 1]?.sender.id === msg.sender.id ? "regular" : "header", ...msg },
                ]),
            );
            if (isAtBottom()) scrollToBottom();
        },
        removeMessage: (msgId: number) => {
            flushSync(() => setMessages(prev => prev.filter(m => m.id !== msgId)));
            if (isAtBottom()) scrollToBottom();
        },
    }));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.container}
            ref={containerRef}
        >
            {messages.map((msg, index) => {
                const indexFromBottom = messages.length - index - 1;
                return (
                    <Message
                        key={msg.id}
                        msg={msg}
                        type={msg.type}
                        className={`message-${msg.id}`}
                        shown={showMessages && (animationProgress > indexFromBottom || indexFromBottom >= 15)}
                    />
                );
            })}
        </motion.div>
    );
}

export default MessagesContainer;
