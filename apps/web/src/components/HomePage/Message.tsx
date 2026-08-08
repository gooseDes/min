import apiClient from "@/client";
import { parseMessageContent } from "@/utils";
import Icon from "@components/Icon";
import { faReply, faTrash } from "@fortawesome/free-solid-svg-icons";
import useLocalStorage from "@hooks/useLocalStorage";
import useTranslation from "@hooks/useTranslation";
import type { MessageData, MessageDataWithSender, UserData } from "@min/api-client";
import { dateToString } from "@min/api-client/utils";
import { scrollMessagesContainerToBottom } from "@services/appControlService";
import { openDropdown } from "@services/dropdownService";
import { setMessagePrefix } from "@services/inputControlService";
import { AnimatePresence, motion } from "framer-motion";
import Markdown from "markdown-to-jsx";
import { memo, useEffect, useRef, useState } from "react";
import styles from "./Message.module.scss";

export interface MessageProps {
  msg: MessageDataWithSender;
  type?: "header" | "regular";
  className?: string;
  shown?: boolean;
  animDelay?: number;
}

function MyImage({ src, alt, shown }: { src: string; alt: string; shown: boolean }) {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const currentElement = ref.current;
    if (!currentElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.1,
      },
    );

    observer.observe(currentElement);

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  return (
    <motion.img
      ref={ref}
      className={styles.image}
      src={src}
      alt={alt}
      onLoad={() => {
        scrollMessagesContainerToBottom(isVisible && shown ? "smooth" : "auto");
        setLoaded(true);
      }}
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: loaded ? 1 : 0, scaleY: loaded ? 1 : 0 }}
    />
  );
}

const Message = memo(function Message(props: MessageProps) {
  const { msg, type = "header", className = "", shown = false } = props;

  const { t } = useTranslation();
  const [user] = useLocalStorage("user");

  const [replyingToMessage, setReplyingToMessage] = useState<MessageData | null>(null);
  const [replyingToSender, setReplyingToSender] = useState<UserData | null>(null);

  const content = parseMessageContent(msg.content);
  const side = user.id === msg.sender.id ? "right" : "left";

  useEffect(() => {
    const fetchReply = async () => {
      if (content.isReply) {
        const messageRes = await apiClient.fetchMessage({ messageId: content.replyingToId });
        if (messageRes.success) {
          setReplyingToMessage(messageRes.message);
          const senderRes = await apiClient.fetchUser({ userId: messageRes.message.senderId });
          if (senderRes.success) {
            setReplyingToSender(senderRes.user);
          }
        }
      }
    };
    fetchReply();
  }, [content.isReply, content.replyingToId]);

  const deleteMessage = async () => {
    const res = await apiClient.deleteMessage({ messageId: msg.id });
    if (!res.success) alert(res.message);
  };

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: shown ? 1 : 0 }}
        exit={{ opacity: 0 }}
        className={`${styles.container} ${side === "left" ? styles.containerLeft : styles.containerRight} ${className}`}
        onContextMenu={e => {
          e.preventDefault();
          openDropdown({
            title: t.message_actions,
            items: [
              { icon: faReply, label: t.reply, onPress: () => setMessagePrefix(`/reply ${msg.id}\n`) },
              { icon: faTrash, label: t.delete, onPress: () => deleteMessage() },
            ],
            x: e.clientX,
            y: e.clientY,
          });
        }}
      >
        <motion.img
          src={`${import.meta.env.MIN_API_URL}/avatars/${msg.sender.avatar}.webp`}
          alt=""
          className={styles.senderAvatar}
          style={{ display: type === "header" ? "block" : "none" }}
          animate={{ scale: shown ? 1 : 0, opacity: shown ? 1 : 0 }}
        />
        <motion.div
          className={`${styles.message} ${side === "left" ? styles.left : styles.right}`}
          animate={{ translateX: shown ? 0 : side === "left" ? -200 : 200, scale: shown ? 1 : 0 }}
        >
          <p className={styles.senderName} style={{ display: type === "header" ? "block" : "none" }}>
            {msg.sender.username}
          </p>
          <div className={styles.replyContainer} style={{ display: content.isReply ? "flex" : "none" }}>
            <Icon icon={faReply} size={12} />
            <p>{`${replyingToSender?.username || "Idk"}: ${replyingToMessage?.content || "Loading..."}`}</p>
          </div>
          <Markdown
            options={{
              overrides: { img: ({ src, alt }) => <MyImage src={src} alt={alt} shown={shown} /> },
              disableParsingRawHTML: true,
              forceBlock: false,
            }}
            className={styles.text}
          >
            {content.text}
          </Markdown>
          <p className={styles.sentAt}>{dateToString(msg.sentAt, "en-US", false)}</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

export default Message;
