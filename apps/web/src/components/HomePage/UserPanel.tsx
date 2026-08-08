import clickableProfileStyles from "@components/ClickableProfile.module.scss";
import useLocalStorage from "@hooks/useLocalStorage";
import { isUserPopupVisible, openUserPopup, subscribeToUserPopup } from "@services/popupService";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import styles from "./UserPanel.module.scss";
import SettingsButton from "./UserPopup/buttons/SettingsButton";
import SignInButton from "./UserPopup/buttons/SignInButton";

function UserPanel() {
  const [user] = useLocalStorage("user");

  const [isPopupOpen, setIsPopupOpen] = useState(isUserPopupVisible());

  useEffect(() => {
    const unsubscribe = subscribeToUserPopup(() => {
      setIsPopupOpen(isUserPopupVisible());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AnimatePresence>
      {!isPopupOpen && (
        <motion.div className={styles.container} layoutId="user-panel-container">
          <motion.button
            className={clickableProfileStyles.container}
            style={{ flex: 1 }}
            whileHover={{ scale: 1 }}
            whileTap={{ scale: 1 }}
            onClick={openUserPopup}
          >
            <motion.img src={`${import.meta.env.MIN_API_URL}/avatars/${user.avatar}.webp`} layoutId="user-panel-avatar" />
            <motion.p layoutId="user-panel-username">{user.username}</motion.p>
          </motion.button>
          <SettingsButton />
          <SignInButton />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default UserPanel;
