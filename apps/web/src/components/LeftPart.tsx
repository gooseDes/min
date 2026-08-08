import Divider from "@components/Divider";
import Icon from "@components/Icon";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faComments } from "@fortawesome/free-regular-svg-icons/faComments";
import styles from "./LeftPart.module.scss";

export interface LeftPartProps {
    headerIcon?: IconProp;
    headerTitle?: string;
    ref?: React.RefObject<HTMLDivElement | null>;
    children?: React.ReactNode;
    outsidePanelChildren?: React.ReactNode;
}

function LeftPart(props: LeftPartProps) {
    const { ref, headerIcon, headerTitle, children, outsidePanelChildren } = props;

    return (
        <div ref={ref} className={styles.container}>
            <div className={`${styles.contentPanel} ${outsidePanelChildren ? styles.withOutsideContent : ""}`}>
                <div className={styles.header}>
                    <Icon icon={headerIcon ?? faComments} size={24} />
                    <h1>{headerTitle ?? "title"}</h1>
                </div>
                <Divider />
                {children}
            </div>
            {outsidePanelChildren}
        </div>
    );
}

export default LeftPart;
