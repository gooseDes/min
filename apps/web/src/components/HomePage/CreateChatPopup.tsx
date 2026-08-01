import apiClient from "@/client";
import Icon from "@components/Icon";
import type { PopupHandle } from "@components/Popup";
import Popup from "@components/Popup";
import { faArrowLeft, faCheck } from "@fortawesome/free-solid-svg-icons";
import useTranslation from "@hooks/useTranslation";
import { addChatToContainer } from "@services/appControlService";
import { closeCreateChatPopup } from "@services/popupService";
import { motion } from "framer-motion";
import { useState, type Ref } from "react";
import styles from "./CreateChatPopup.module.scss";

export interface CreateChatPopupProps {
    ref?: Ref<PopupHandle>;
}

function CreateChatPopup(props: CreateChatPopupProps) {
    const { ref } = props;

    const { t } = useTranslation();

    const [username, setUsername] = useState<string>("");

    const handleSubmit = async () => {
        const targetUsername = username.trim();
        if (targetUsername) {
            const res = await apiClient.createChat({ targetUsername });
            if (res.success) {
                setUsername("");
                closeCreateChatPopup();
                addChatToContainer(res.chat);
            } else {
                alert(res.message);
            }
        } else {
            alert("Username is required");
        }
    };

    return (
        <Popup
            width={800}
            height={600}
            x="center"
            y="center"
            layoutId="add-chat"
            title={t.new_chat}
            closeCallback={closeCreateChatPopup}
            ref={ref}
        >
            <p>{t.enter_username}</p>
            <form
                className={styles.form}
                onSubmit={e => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={closeCreateChatPopup}
                >
                    <Icon icon={faArrowLeft} size={24} />
                </motion.button>
                <input
                    type="text"
                    placeholder={t.username_placeholder}
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} type="submit">
                    <Icon icon={faCheck} size={24} />
                </motion.button>
            </form>
        </Popup>
    );
}

export default CreateChatPopup;
