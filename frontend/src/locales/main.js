import { createI18n } from "vue-i18n";
import en from "./en";

export const i18n = createI18n({
    legacy: false,
    globalInjection: true, // REQUIRED
    locale: localStorage.getItem("language") || "en",
    fallbackLocale: "en",
    messages: {
        en,
    },
});
