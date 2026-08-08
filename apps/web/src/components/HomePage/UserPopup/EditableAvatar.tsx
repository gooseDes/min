import Icon from "@components/Icon";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import useLocalStorage from "@hooks/useLocalStorage";
import { AnimatePresence, motion } from "framer-motion";
import { useImperativeHandle, useRef, useState, type Ref } from "react";
import styles from "./EditableAvatars.module.scss";

export interface EditableAvatarRef {
    getSelected: () => File | undefined;
    clear: () => void;
}

export interface EditableAvatarProps {
    ref?: Ref<EditableAvatarRef>;
    editable?: boolean;
}

function EditableAvatar(props: EditableAvatarProps) {
    const { editable, ref } = props;

    const [user] = useLocalStorage("user");

    const [avatar, setAvatar] = useState<string | undefined>();

    const selected = useRef<File | undefined>(undefined);

    useImperativeHandle(ref, () => ({
        getSelected: () => selected.current,
        clear: () => {
            selected.current = undefined;
            setAvatar(undefined);
        },
    }));

    const buttonVariants = {
        initial: { opacity: 0, scale: 0 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0 },
        hover: { opacity: 1, scale: 1 },
        tap: { opacity: 1, scale: 1 },
    };

    const iconVariants = {
        initial: (avatar: string | undefined) => ({
            scale: avatar ? 0.5 : 1,
            x: avatar ? 80 : 0,
            y: avatar ? 80 : 0,
        }),
        animate: (avatar: string | undefined) => ({
            scale: avatar ? 0.5 : 1,
            x: avatar ? 80 : 0,
            y: avatar ? 80 : 0,
        }),
        exit: (avatar: string | undefined) => ({
            scale: avatar ? 0.5 : 1,
            x: avatar ? 80 : 0,
            y: avatar ? 80 : 0,
        }),
        hover: (_avatar: string | undefined) => ({
            scale: 1.1,
            x: 0,
            y: 0,
        }),
        tap: (_avatar: string | undefined) => ({
            scale: 0.9,
            x: 0,
            y: 0,
        }),
    };

    const upload = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async e => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                selected.current = file;
                setAvatar(URL.createObjectURL(file));
            }
        };
        input.click();
    };

    return (
        <div className={styles.container}>
            <motion.div
                className={styles.container}
                animate={{ filter: !avatar && editable ? "brightness(75%)" : "brightness(100%)" }}
            >
                <motion.img
                    className={styles.image}
                    layoutId="user-panel-avatar"
                    src={avatar ?? `${import.meta.env.MIN_API_URL}/avatars/${user.avatar}.webp`}
                />
            </motion.div>
            <AnimatePresence>
                {editable && (
                    <motion.button
                        variants={buttonVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        whileHover="hover"
                        whileTap="tap"
                        className={styles.uploadButton}
                        onClick={upload}
                    >
                        <motion.div style={{ flex: 1 }} variants={iconVariants} custom={avatar}>
                            <Icon icon={faUpload} size={64} className={styles.uploadIcon} />
                        </motion.div>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}

export default EditableAvatar;
