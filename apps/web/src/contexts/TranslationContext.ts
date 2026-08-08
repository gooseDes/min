import { type Language } from "@/translation";
import { createContext } from "react";

interface TranslationContextProps {
    lang: string;
    t: Language;
    changeLanguage: (lang_code?: string) => void;
}

export const TranslationContext = createContext<TranslationContextProps | undefined>(undefined);
