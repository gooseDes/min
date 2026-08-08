import IconButton from "@components/IconButton";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import useNavigation from "@hooks/useNavigation";
import { closeUserPopup } from "@services/popupService";
import styles from "./UserPanelButton.module.scss";

function SettingsButton() {
    const navigate = useNavigation();

    return (
        <IconButton
            onClick={() => {
                navigate("settings");
                closeUserPopup();
            }}
            className={styles.iconButton}
            icon={faCog}
            size={24}
            layoutId="user-panel-settings-button"
        />
    );
}

export default SettingsButton;
