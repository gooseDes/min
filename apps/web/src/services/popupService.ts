import type { PopupHandle } from "@components/Popup";
import React from "react";
import { setIsAppBlurred } from "./appControlService";

// Create Chat Popup
export const createChatPopupRef = React.createRef<PopupHandle>();

let isCreateChatPopupOpen = false;
const createChatPopupListeners = new Set<() => void>();

export const subscribeToCreateChatPopup = (listener: () => void) => {
    createChatPopupListeners.add(listener);
    return () => createChatPopupListeners.delete(listener);
};

const notifyCreateChatPopupListeners = () => {
    createChatPopupListeners.forEach(listener => listener());
};

export const isCreateChatPopupVisible = () => isCreateChatPopupOpen;

export const openCreateChatPopup = () => {
    setIsAppBlurred(true);
    isCreateChatPopupOpen = true;
    notifyCreateChatPopupListeners();
    createChatPopupRef.current?.open();
};

export const closeCreateChatPopup = () => {
    setIsAppBlurred(false);
    isCreateChatPopupOpen = false;
    notifyCreateChatPopupListeners();
    createChatPopupRef.current?.close();
};

// User Popup
export const userPopupRef = React.createRef<PopupHandle>();

let isUserPopupOpen = false;
const userPopupListeners = new Set<() => void>();

export const subscribeToUserPopup = (listener: () => void) => {
    userPopupListeners.add(listener);
    return () => userPopupListeners.delete(listener);
};

const notifyUserPopupListeners = () => {
    userPopupListeners.forEach(listener => listener());
};

export const isUserPopupVisible = () => isUserPopupOpen;

export const openUserPopup = () => {
    setIsAppBlurred(true);
    isUserPopupOpen = true;
    notifyUserPopupListeners();
    userPopupRef.current?.open();
};

export const closeUserPopup = () => {
    setIsAppBlurred(false);
    isUserPopupOpen = false;
    notifyUserPopupListeners();
    userPopupRef.current?.close();
};
