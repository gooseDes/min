import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { type HTMLProps } from "react";
import styles from "./ClickableProfile.module.scss";
import Icon from "./Icon";

export interface ClickableProfileProps extends HTMLProps<HTMLDivElement> {
  text?: string;
  image?: string;
  icon?: IconProp;
  isInList?: boolean;
}

function ClickableProfile(props: ClickableProfileProps) {
  const { text = "", icon, image, className, isInList = false, children, ...rest } = props;

  const classes = [className || "", styles.container, isInList ? styles.listItem : ""].filter(Boolean).join(" ");

  return (
    <div {...rest} className={classes}>
      {icon && <Icon size={24} icon={icon} />}
      {image && <img src={image} />}
      <p>{text}</p>
      {children}
    </div>
  );
}

export default ClickableProfile;
