import Translation, { type Language, changeLanguage as changeLanguageFn } from "@/translation";
import { useCallback, useMemo, useState } from "react";
import { TranslationContext } from "./TranslationContext";

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lang, setLang] = useState(Translation.getCurrentLanguage());

    const changeLanguage = useCallback((lang_code?: string) => {
        const newLang = changeLanguageFn(lang_code);
        setLang(newLang);
    }, []);

    const t = useMemo(
        () =>
            new Proxy(
                {},
                {
                    get(_, key: string) {
                        const current = (Translation as any)[lang] || Translation.en;
                        return (current as any)[key] || (Translation.en as any)[key] || key;
                    },
                },
            ) as Language,
        [lang],
    );

    return <TranslationContext.Provider value={{ lang, t, changeLanguage }}>{children}</TranslationContext.Provider>;
};
