import apiClient from "@/client";
import type { PopupHandle } from "@components/Popup";
import Popup from "@components/Popup";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import useLocalStorage from "@hooks/useLocalStorage";
import useTranslation from "@hooks/useTranslation";
import { closeUserPopup } from "@services/popupService";
import { motion } from "framer-motion";
import { useEffect, useRef, useState, type Ref } from "react";
import EditProfileButton from "./buttons/EditProfileButton";
import SettingsButton from "./buttons/SettingsButton";
import SignInButton from "./buttons/SignInButton";
import EditableAvatar, { type EditableAvatarRef } from "./EditableAvatar";
import styles from "./UserPopup.module.scss";

export interface UserPopupProps {
  ref?: Ref<PopupHandle>;
}

function UserPopup(props: UserPopupProps) {
  const { ref } = props;

  const { t } = useTranslation();
  const [user, setUser] = useLocalStorage("user");

  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const avatarRef = useRef<EditableAvatarRef>(null);
  const wasEditingRef = useRef(false);

  useEffect(() => {
    if (wasEditingRef.current && !isEditMode) {
      const image = avatarRef.current?.getSelected();
      if (!image) return;

      const uploadAvatar = async () => {
        const res = await apiClient.uploadAvatar(localStorage.getItem("token") ?? "", image);
        if (res.success) {
          setUser(prev => ({ ...prev, avatar: res.avatar }));
          avatarRef.current?.clear();
        } else {
          alert(res.message);
        }
      };

      uploadAvatar();
    }

    wasEditingRef.current = isEditMode;
  }, [isEditMode, setUser]);

  return (
    <Popup
      width={400}
      height={600}
      x="left"
      y="bottom"
      layoutId="user-panel-container"
      title={t.profile}
      icon={faUserCircle}
      closeCallback={closeUserPopup}
      ref={ref}
    >
      <div className={styles.content}>
        <div className={styles.buttonsContainer}>
          <SettingsButton />
          <div style={{ flex: 1 }} />
          <EditProfileButton setState={setIsEditMode} />
          <SignInButton />
        </div>
        <EditableAvatar editable={isEditMode} ref={avatarRef} />
        <motion.h2 layoutId="user-panel-username">{user.username}</motion.h2>
      </div>
    </Popup>
  );
}

export default UserPopup;
