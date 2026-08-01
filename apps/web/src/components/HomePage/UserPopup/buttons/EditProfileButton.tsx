import { AnimatedIconButton } from "@components/IconButton";
import { faCheck, faPencil } from "@fortawesome/free-solid-svg-icons";
import type React from "react";
import { useState } from "react";
import styles from "./UserPanelButton.module.scss";

export interface EditProfileButtonProps {
    setState: React.Dispatch<React.SetStateAction<boolean>>;
}

function EditProfileButton(props: EditProfileButtonProps) {
    const { setState } = props;

    const [isActive, setIsActive] = useState<boolean>(false);

    return (
        <AnimatedIconButton
            onClick={() =>
                setState(prev => {
                    setIsActive(!prev);
                    return !prev;
                })
            }
            className={styles.iconButton}
            icon={isActive ? faCheck : faPencil}
            size={24}
        />
    );
}

export default EditProfileButton;
