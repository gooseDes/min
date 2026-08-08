import ClickInterceptor from "@components/ClickInterceptor";
import Dropdown from "@components/Dropdown";
import CreateChatPopup from "@components/HomePage/CreateChatPopup";
import UserPopup from "@components/HomePage/UserPopup/UserPopup";
import { TranslationProvider } from "@contexts/TranslationProvider";
import useLocalStorage from "@hooks/useLocalStorage";
import useTranslation from "@hooks/useTranslation";
import SettingsPage from "@pages/SettingsPage";
import { rootLayoutRef } from "@services/appControlService";
import { dropdownRef } from "@services/dropdownService";
import { clickInterceptorRef } from "@services/interceptService";
import { swRegistration } from "@services/otherRefs";
import { createChatPopupRef, userPopupRef } from "@services/popupService";
import { LayoutGroup } from "framer-motion";
import { lazy, useEffect, useImperativeHandle, useState, type Ref } from "react";
import { createBrowserRouter, createHashRouter, Outlet, RouterProvider } from "react-router-dom";
import { initSocket } from "./client";
import MorphThing from "./components/MorphThing";
import styles from "./index.module.scss";
import { morphThingRef } from "./services/morphService";
import Translation from "./translation";
import { isTauri } from "./utils";

const HomePage = lazy(() => import("./pages/HomePage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));

export interface RootLayoutHandle {
    setIsBlurred: (isBlurred: boolean) => void;
}

export interface RootLayoutProps {
    ref: Ref<RootLayoutHandle>;
}

function RootLayout(props: RootLayoutProps) {
    const { ref } = props;

    const { changeLanguage } = useTranslation();
    const [_appState, setAppState] = useLocalStorage("appState");

    const [isBlurred, setIsBlurred] = useState<boolean>(false);

    useImperativeHandle(ref, () => ({
        setIsBlurred: (isBlurred: boolean) => setIsBlurred(isBlurred),
    }));

    useEffect(() => {
        initSocket();
        setAppState("normal");

        if (!isTauri() && "serviceWorker" in navigator) {
            const registerSW = () => {
                navigator.serviceWorker
                    .register(`/sw.js?apiUrl=${import.meta.env.MIN_API_URL}`)
                    .then(reg => {
                        swRegistration.current = reg;
                        console.log("Service Worker registered successfully:", reg.scope);
                    })
                    .catch(err => console.error("Service Worker registration failed:", err));
            };

            if (document.readyState === "complete") {
                registerSW();
            } else {
                window.addEventListener("load", registerSW);
                return () => window.removeEventListener("load", registerSW);
            }
        }
    }, [setAppState]);

    useEffect(() => {
        Translation.init();
        changeLanguage(Translation.lang);
    }, [changeLanguage]);

    return (
        <div className="app-container">
            <main className={styles.appContent}>
                <LayoutGroup id="layout_group">
                    <Outlet />
                    <div className={`${styles.blurrable} ${isBlurred ? styles.blurred : ""}`} />
                    <MorphThing ref={morphThingRef} />
                    <ClickInterceptor ref={clickInterceptorRef} />
                    <Dropdown ref={dropdownRef} />
                    <CreateChatPopup ref={createChatPopupRef} />
                    <UserPopup ref={userPopupRef} />
                </LayoutGroup>
            </main>
        </div>
    );
}

const createRouter = isTauri() ? createHashRouter : createBrowserRouter;

const router = createRouter([
    {
        path: "/",
        element: <RootLayout ref={rootLayoutRef} />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "auth", element: <AuthPage /> },
            { path: "settings", element: <SettingsPage /> },
        ],
    },
]);

function App() {
    return (
        <TranslationProvider>
            <RouterProvider router={router} />
        </TranslationProvider>
    );
}

export default App;
