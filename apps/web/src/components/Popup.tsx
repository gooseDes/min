import Divider from "@components/Divider";
import Icon from "@components/Icon";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { AnimatePresence, motion } from "framer-motion";
import { useImperativeHandle, useState, type ReactNode, type Ref } from "react";
import IconButton from "./IconButton";
import styles from "./Popup.module.scss";

export interface PopupHandle {
  open: () => void;
  close: () => void;
}

export interface PopupProps {
  ref?: Ref<PopupHandle>;
  title?: string;
  layoutId?: string;
  x?: "left" | "center" | "right";
  y?: "top" | "center" | "bottom";
  offsetX?: number;
  offsetY?: number;
  width: number;
  height: number;
  icon?: IconProp;
  closeCallback?: () => void;
  hasX?: boolean;
  children: ReactNode;
}

function Popup(props: PopupProps) {
  const {
    ref,
    title,
    children,
    layoutId,
    x = "center",
    y = "center",
    offsetX = 0,
    offsetY = 0,
    width,
    height,
    icon,
    closeCallback = () => setIsOpen(false),
    hasX = true,
  } = props;

  const [isOpen, setIsOpen] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          layoutId={layoutId}
          className={styles.container}
          style={{
            width,
            height,
            left:
              x === "left"
                ? `calc(${styles.padding} + ${offsetX}px)`
                : x === "center"
                  ? `calc(50% - ${width / 2}px + ${offsetX}px)`
                  : `calc(100% - ${width}px + ${styles.padding} + ${offsetX}px)`,
            top:
              y === "top"
                ? `calc(${styles.padding} + ${offsetY}px)`
                : y === "center"
                  ? `calc(50% - ${height / 2}px + ${offsetY}px)`
                  : `calc(100% - ${height}px - ${styles.padding} + ${offsetY}px)`,
          }}
        >
          <div className={styles.header}>
            {hasX && <IconButton icon={faXmark} className={styles.closeButton} size={32} onClick={closeCallback} />}
            {icon && <Icon icon={icon} size={32} />}
            <h1>{title}</h1>
          </div>
          <Divider />
          <div className={styles.content}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Popup;
