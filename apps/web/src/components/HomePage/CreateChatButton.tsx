import Icon from "@components/Icon";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { isCreateChatPopupVisible, openCreateChatPopup, subscribeToCreateChatPopup } from "@services/popupService";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import styles from "./CreateChatButton.module.scss";

function CreateChatButton() {
    const [isPopupOpen, setIsPopupOpen] = useState(isCreateChatPopupVisible());

    useEffect(() => {
        const unsubscribe = subscribeToCreateChatPopup(() => {
            setIsPopupOpen(isCreateChatPopupVisible());
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <AnimatePresence>
            {!isPopupOpen && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={styles.button}
                    layoutId="add-chat"
                    onClick={() => openCreateChatPopup()}
                >
                    <Icon icon={faPlus} size={24} />
                </motion.button>
            )}
        </AnimatePresence>
    );
}

export default CreateChatButton;
