import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type HTMLProps } from "react";
import styles from "./Icon.module.scss";

export interface IconProps extends HTMLProps<HTMLDivElement> {
  icon: IconProp;
  size?: number;
  color?: string;
}

function Icon(props: IconProps) {
  const { icon, size, className, color, ...rest } = props;

  return (
    <div className={[className, styles.container].filter(Boolean).join(" ")} {...rest}>
      <FontAwesomeIcon icon={icon} fontSize={size} color={color} />
    </div>
  );
}

export default Icon;
