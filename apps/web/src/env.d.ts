/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly MIN_API_URL: string;
    readonly MIN_VAPID_PUBLIC: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
