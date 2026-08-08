import type { UserData } from "@min/api-client";
import { useState, type Dispatch, type SetStateAction } from "react";

interface LocalStorageMap {
    user: UserData;
    appState: string;
}

const initialValues: LocalStorageMap = {
    user: { id: -1, username: "unknown", avatar: "" },
    appState: "normal",
};

import { useCallback, useEffect } from "react";

const LOCAL_STORAGE_EVENT = "local-storage-update";

export function getItem<K extends keyof LocalStorageMap>(key: K): LocalStorageMap[K] {
    if (typeof window === "undefined") return initialValues[key];
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValues[key];
    } catch (error) {
        console.error("Error reading localStorage key", key, error);
        return initialValues[key];
    }
}

export function setItem<K extends keyof LocalStorageMap>(key: K, value: LocalStorageMap[K]): void {
    try {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(value));
        }
    } catch (error) {
        console.error("Error setting localStorage key", key, error);
    }
}

function useLocalStorage<K extends keyof LocalStorageMap>(
    key: K,
): [LocalStorageMap[K], Dispatch<SetStateAction<LocalStorageMap[K]>>, () => void] {
    const [storedValue, setStoredValue] = useState<LocalStorageMap[K]>(() => getItem<K>(key));

    const setValue: Dispatch<SetStateAction<LocalStorageMap[K]>> = useCallback(
        value => {
            try {
                if (typeof window === "undefined") return;

                setStoredValue(currentValue => {
                    const valueToStore = value instanceof Function ? value(currentValue) : value;
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));

                    window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_EVENT, { detail: { key, value: valueToStore } }));

                    return valueToStore;
                });
            } catch (error) {
                console.error("Error setting localStorage key", key, error);
            }
        },
        [key],
    );

    const removeValue = useCallback(() => {
        try {
            if (typeof window === "undefined") return;

            window.localStorage.removeItem(key);
            setStoredValue(initialValues[key]);

            window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_EVENT, { detail: { key, value: initialValues[key] } }));
        } catch (error) {
            console.error("Error removing localStorage key", key, error);
        }
    }, [key]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const handleLocalUpdate = (e: Event) => {
            const customEvent = e as CustomEvent<{ key: string; value: any }>;
            if (customEvent.detail.key === key) {
                setStoredValue(customEvent.detail.value);
            }
        };

        const handleStorageUpdate = (e: StorageEvent) => {
            if (e.key === key) {
                setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValues[key]);
            }
        };

        window.addEventListener(LOCAL_STORAGE_EVENT, handleLocalUpdate);
        window.addEventListener("storage", handleStorageUpdate);

        return () => {
            window.removeEventListener(LOCAL_STORAGE_EVENT, handleLocalUpdate);
            window.removeEventListener("storage", handleStorageUpdate);
        };
    }, [key]);

    return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
