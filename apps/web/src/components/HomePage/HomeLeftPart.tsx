import LeftPart from "@components/LeftPart";
import { faComments } from "@fortawesome/free-regular-svg-icons";
import useTranslation from "@hooks/useTranslation";
import type { ChatData } from "@min/api-client";
import { chatsContainerRef } from "@services/appControlService";
import ChatsContainer from "./ChatsContainer";
import CreateChatButton from "./CreateChatButton";
import UserPanel from "./UserPanel";

export interface LeftPartProps {
  onChatClick: (chat: ChatData) => void;
  ref?: React.RefObject<HTMLDivElement | null>;
}

function HomeLeftPart(props: LeftPartProps) {
  const { onChatClick, ref } = props;

  const { t } = useTranslation();

  return (
    <LeftPart headerIcon={faComments} headerTitle={t.chats} ref={ref} outsidePanelChildren={<UserPanel />}>
      <ChatsContainer onClick={onChatClick} ref={chatsContainerRef} />
      <CreateChatButton />
    </LeftPart>
  );
}

export default HomeLeftPart;
