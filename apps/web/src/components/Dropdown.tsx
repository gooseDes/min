import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { motion } from "framer-motion";
import { useImperativeHandle, useState, type Ref } from "react";
import Divider from "./Divider";
import styles from "./Dropdown.module.scss";
import Icon from "./Icon";

export interface DropdownItemData {
  icon?: IconProp;
  label?: string;
  onPress?: () => void;
}

export interface DropdownOpenOptions {
  title?: string;
  items?: DropdownItemData[];
  x?: number;
  y?: number;
  onClose?: () => void;
}

export interface DropdownHandle {
  open: (options: DropdownOpenOptions) => void;
  close: () => void;
}

export interface DropdownProps {
  ref: Ref<DropdownHandle>;
}

function Dropdown(props: DropdownProps) {
  const { ref } = props;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [items, setItems] = useState<DropdownItemData[]>([]);
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(0);
  const [onClose, setOnClose] = useState<(() => void) | undefined>(undefined);

  const close = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleItemClick = (item: DropdownItemData) => {
    if (item.onPress) {
      item.onPress();
    }
    close();
  };

  useImperativeHandle(ref, () => ({
    open: (options: DropdownOpenOptions) => {
      const { title, items, x, y, onClose } = options;
      setTitle(title ?? "");
      setItems(items ?? []);
      setIsOpen(true);
      setX(x ?? 0);
      setY(y ?? 0);
      setOnClose(onClose);
    },
    close: () => close(),
  }));

  return (
    <motion.div
      className={styles.container}
      animate={{ opacity: isOpen ? 1 : 0, scaleY: isOpen ? 1 : 0, scaleX: isOpen ? 1 : 0.8 }}
      style={{ top: y, left: x }}
    >
      {title && <h2 className={styles.title}>{title}</h2>}
      {title && <Divider />}
      {items &&
        items.map((item, ind) => (
          <motion.button
            key={ind}
            className={styles.button}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleItemClick(item)}
          >
            {item.icon && <Icon icon={item.icon} size={16} />}
            {item.label}
          </motion.button>
        ))}
    </motion.div>
  );
}

export default Dropdown;
