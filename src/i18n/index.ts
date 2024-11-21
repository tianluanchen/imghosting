import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import zh from "./locales/zh.json";
import { onLocalStorageChange } from "@/helpers/storageEvt";

i18next
    .use(I18nextBrowserLanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: "en",
        debug: false,
        interpolation: {
            escapeValue: false
        },
        resources: {
            en: {
                translation: en
            },
            zh: {
                translation: zh
            }
        }
    });

onLocalStorageChange("i18nextLng", ({ newValue }) => {
    newValue && i18next.changeLanguage(newValue);
});

export const lngs = [
    { key: "zh", label: "中文" },
    { key: "en", label: "English" }
];

export default i18next;
