import { motion } from "framer-motion";
import styles from "./RightPart.module.scss";

export interface RightPartProps {
    top?: React.ReactNode;
    children?: React.ReactNode;
    bottom?: React.ReactNode;
}

function RightPart(props: RightPartProps) {
    const { top, children, bottom } = props;

    return (
        <div className={styles.container}>
            {top}
            <motion.div layout className={styles.contentPanel}>
                {children}
            </motion.div>
            {bottom}
        </div>
    );
}

export default RightPart;
