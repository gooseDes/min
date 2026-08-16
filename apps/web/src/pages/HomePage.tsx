import apiClient from "@/client";
import { setCurrentAppState } from "@/utils";
import HomeLeftPart from "@components/HomePage/HomeLeftPart";
import HomeRightPart from "@components/HomePage/HomeRightPart";
import useLocalStorage from "@hooks/useLocalStorage";
import type { ChatData } from "@min/api";
import { messagesContainerRef, setChatsInContainer } from "@services/appControlService";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./HomePage.module.scss";

function HomePage() {
  const [user] = useLocalStorage("user");
  const leftPartRef = useRef<HTMLDivElement>(null);
  const [openedChat, setOpenedChat] = useState<ChatData | null>(null);

  useEffect(() => {
    apiClient.fetchChats().then(res => {
      if (res.success) {
        setChatsInContainer([{ id: 1, name: "Default Chat", type: "group", participants: [] }, ...res.chats]);
      }
    });

    const messageSub = apiClient.subscribeToMessages(msg => {
      messagesContainerRef.current?.addMessage(msg);
    });

    const deleteSub = apiClient.subscribeToDeletingMessages(msgId => {
      messagesContainerRef.current?.removeMessage(msgId);
    });

    return () => {
      messageSub.remove();
      deleteSub.remove();
    };
  }, []);

  const openChat = useCallback(async (chat: ChatData) => {
    const clearPromise = messagesContainerRef.current?.clearMessages();
    leftPartRef.current?.classList.add(styles.mobileHidden);
    setOpenedChat(chat);
    setCurrentAppState(`chat-${chat.id}`);
    const messagesRes = await apiClient.fetchChatMessages({ chatId: chat.id });
    if (messagesRes.success) {
      await clearPromise;
      await messagesContainerRef.current?.setMessages(messagesRes.messages);
    }
  }, []);

  const closeChat = useCallback(() => {
    leftPartRef.current?.classList.remove(styles.mobileHidden);
    setOpenedChat(null);
    setCurrentAppState("normal");
  }, []);

  return (
    <div className={styles.main}>
      <HomeLeftPart onChatClick={openChat} ref={leftPartRef} />
      <HomeRightPart openedChat={openedChat} user={user} closeChat={closeChat} />
    </div>
  );
}

export default HomePage;
