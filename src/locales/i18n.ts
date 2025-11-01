import i18n from 'i18next';
import detector from 'i18next-browser-languagedetector';
import { reactI18nextModule } from 'react-i18next';

import translationEN from './en/translation.json';
import translationJP from './jp/translation.json';

// the translations
const resources = {
  en: {
    translation: translationEN,
  },
  jp: {
    translation: translationJP,
  },
};

i18n
  .use(detector)
  .use(reactI18nextModule as any) // passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // use en if detected lng is not available

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
