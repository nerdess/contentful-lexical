import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import deTranslation from './locales/de/translation.json';
import enTranslation from './locales/en/translation.json';

type TranslationResource = typeof enTranslation;

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: TranslationResource;
    };
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      de: {
        translation: deTranslation,
      },
    },
    fallbackLng: 'de',
    lng: import.meta.env.DEV ? 'en' : 'de',
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
