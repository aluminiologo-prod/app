import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import enCommon from '../locales/en/common.json';
import enAuth from '../locales/en/auth.json';
import enTransfers from '../locales/en/transfers.json';
import enOnboarding from '../locales/en/onboarding.json';

import esCommon from '../locales/es/common.json';
import esAuth from '../locales/es/auth.json';
import esTransfers from '../locales/es/transfers.json';
import esOnboarding from '../locales/es/onboarding.json';

const deviceLanguage = getLocales()[0]?.languageCode ?? 'en';
const lng = ['es', 'en'].includes(deviceLanguage) ? deviceLanguage : 'en';

i18n.use(initReactI18next).init({
  lng,
  fallbackLng: 'en',
  resources: {
    en: {
      common: enCommon,
      auth: enAuth,
      transfers: enTransfers,
      onboarding: enOnboarding,
    },
    es: {
      common: esCommon,
      auth: esAuth,
      transfers: esTransfers,
      onboarding: esOnboarding,
    },
  },
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export default i18n;
