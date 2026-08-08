import IconButton from "@components/IconButton";
import { faSignIn, faSignOut } from "@fortawesome/free-solid-svg-icons";
import useLocalStorage from "@hooks/useLocalStorage";
import useNavigation from "@hooks/useNavigation";
import styles from "./UserPanelButton.module.scss";

function SignInButton() {
    const navigate = useNavigation();
    const [user] = useLocalStorage("user");

    return (
        <IconButton
            onClick={() => navigate("auth")}
            className={styles.iconButton}
            icon={user.id === -1 ? faSignIn : faSignOut}
            size={24}
            color={user.id === -1 ? "auto" : "#fcafa9"}
            layoutId="user-panel-sign-in-button"
        />
    );
}

export default SignInButton;
