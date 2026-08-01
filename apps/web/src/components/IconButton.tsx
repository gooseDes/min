import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";
import Icon from "./Icon";
import styles from "./IconButton.module.scss";

export interface IconButtonProps extends HTMLMotionProps<"button"> {
    icon: IconProp;
    size?: number;
    color?: string;
}

function IconButton(props: IconButtonProps) {
    const { icon, size, className, color, ...rest } = props;

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`${styles.container} ${className}`}
            {...rest}
        >
            <Icon icon={icon} size={size} color={color} />
        </motion.button>
    );
}

export function AnimatedIconButton(props: IconButtonProps) {
    const { icon, size, className, color, ...rest } = props;

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`${styles.container} ${className}`}
            {...rest}
        >
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={(icon.valueOf() as any).iconName}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                >
                    <Icon icon={icon} size={size} color={color} />
                </motion.div>
            </AnimatePresence>
        </motion.button>
    );
}

export default IconButton;
