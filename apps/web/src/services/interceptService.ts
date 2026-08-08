import type { ClickInterceptorHandle } from "@components/ClickInterceptor";
import React from "react";

export const clickInterceptorRef = React.createRef<ClickInterceptorHandle>();

export function interceptClick(callback: () => void) {
    clickInterceptorRef.current?.interceptClick(() => callback);
}

export function cancelInterception() {
    clickInterceptorRef.current?.cancelInterception();
}
