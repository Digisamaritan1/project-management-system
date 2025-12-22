import { createI18n } from 'vue-i18n';
import { english } from '@/locales/en';

const messages = {
  en: english
};
export const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages,
    fallbackLocale:'en'
  });
  