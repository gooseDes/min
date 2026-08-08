import { useImperativeHandle, useState, type Ref } from "react";
import styles from "./ClickInterceptor.module.scss";

export interface ClickInterceptorHandle {
  interceptClick: (callback: () => void) => void;
  cancelInterception: () => void;
}

export interface ClickInterceptorProps {
  ref: Ref<ClickInterceptorHandle>;
}

function ClickInterceptor(props: ClickInterceptorProps) {
  const { ref } = props;

  const [doIntercept, setDoIntercept] = useState<boolean>(false);
  const [interceptCallback, setInterceptCallback] = useState<(() => void) | null>(null);

  useImperativeHandle(ref, () => ({
    interceptClick: (callback: () => void) => {
      setDoIntercept(true);
      setInterceptCallback(callback);
    },
    cancelInterception: () => {
      setDoIntercept(false);
      setInterceptCallback(null);
    },
  }));

  const handleClick = () => {
    if (interceptCallback) {
      interceptCallback();
      setDoIntercept(false);
      setInterceptCallback(null);
    }
  };

  return (
    <div
      className={styles.container}
      style={{
        pointerEvents: doIntercept ? "auto" : "none",
        //backgroundColor: doIntercept ? "rgba(0, 0, 0, 0.5)" : "transparent",
      }}
      onClick={handleClick}
    />
  );
}

export default ClickInterceptor;
