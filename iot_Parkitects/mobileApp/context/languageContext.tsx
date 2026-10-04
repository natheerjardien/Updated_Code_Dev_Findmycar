import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'en' | 'af' | 'xh';

type TranslationKey = keyof typeof translations.en;

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: TranslationKey) => string;
};

const translations = {
  en: {
    settings: 'Settings',
    account: 'Account',
    preferences: 'Preferences',
    language: 'Language',
    permissions: 'Permissions',
    location: 'Location',
    emailNotifications: 'Email Notifications',
    pushNotifications: 'Push Notifications',
    resources: 'Resources',
    accessibility: 'Accessibility',
    reportBug: 'Report Bug',
    rateParkitech: 'Rate Parkitech',
    parkingRules: 'Campus Parking Rules',
    logout: 'Log Out',

    selectLanguage: 'Select Language',
    chooseLanguage: 'Choose the language for Parkitech.',
  },

  af: {
    settings: 'Instellings',
    account: 'Rekening',
    preferences: 'Voorkeure',
    language: 'Taal',
    permissions: 'Toestemmings',
    location: 'Ligging',
    emailNotifications: 'E-poskennisgewings',
    pushNotifications: 'Drukkennisgewings',
    resources: 'Hulpbronne',
    accessibility: 'Toeganklikheid',
    reportBug: 'Rapporteer ’n Probleem',
    rateParkitech: 'Beoordeel Parkitech',
    parkingRules: 'Kampusparkeerreëls',
    logout: 'Teken Uit',

    selectLanguage: 'Kies Taal',
    chooseLanguage: 'Kies die taal vir Parkitech.',
  },

  xh: {
    settings: 'Iisetingi',
    account: 'Iakhawunti',
    preferences: 'Izinto ozikhethayo',
    language: 'Ulwimi',
    permissions: 'Iimvume',
    location: 'Indawo',
    emailNotifications: 'Izaziso ze-imeyile',
    pushNotifications: 'Izaziso zokutyhala',
    resources: 'Izixhobo',
    accessibility: 'Ukufikeleleka',
    reportBug: 'Xela Ingxaki',
    rateParkitech: 'Kala iParkitech',
    parkingRules: 'Imithetho Yokupaka Ekhampasini',
    logout: 'Phuma',

    selectLanguage: 'Khetha Ulwimi',
    chooseLanguage: 'Khetha ulwimi lweParkitech.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // English is the default language
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('appLanguage');

      if (
        savedLanguage === 'en' ||
        savedLanguage === 'af' ||
        savedLanguage === 'xh'
      ) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.error('Language loading error:', error);
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    try {
      setLanguageState(newLanguage);

      await AsyncStorage.setItem(
        'appLanguage',
        newLanguage
      );
    } catch (error) {
      console.error('Language saving error:', error);
    }
  };

  const t = (key: TranslationKey) => {
    return translations[language][key];
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      'useLanguage must be used inside LanguageProvider'
    );
  }

  return context;
}