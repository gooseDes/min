import { TranslationContext } from "@contexts/TranslationContext";
import { useContext } from "react";

function useTranslation() {
    const context = useContext(TranslationContext);
    if (!context) throw new Error("useTranslation must be used within a TranslationProvider");
    return context;
}

export default useTranslation;
