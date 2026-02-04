import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import language resources
import en from "../languages/en.json";
import fr from "../languages/fr.json";
import de from "../languages/de.json";
import es from "../languages/es.json";
import it from "../languages/it.json";
import tr from "../languages/tr.json";
import ru from "../languages/ru.json";
import zh from "../languages/zh.json";
import ja from "../languages/ja.json";
import ko from "../languages/ko.json";

// Language storage key
const LANGUAGE_STORAGE_KEY = "user_language";

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
] as const;

export type SupportedLanguageCode =
  (typeof SUPPORTED_LANGUAGES)[number]["code"];

// Language detection function
const detectLanguage = async (): Promise<string> => {
  try {
    // First, check if user has manually selected a language
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (
      storedLanguage &&
      SUPPORTED_LANGUAGES.some((lang) => lang.code === storedLanguage)
    ) {
      return storedLanguage;
    }

    // If no stored language, detect from device locale
    const deviceLocales = Localization.getLocales();

    for (const locale of deviceLocales) {
      const languageCode = locale.languageCode;

      // Check if we support this language
      if (SUPPORTED_LANGUAGES.some((lang) => lang.code === languageCode)) {
        return languageCode as string;
      }
    }

    // Fallback to English if no supported language found
    return "en";
  } catch (error) {
    console.warn("Error detecting language:", error);
    return "en";
  }
};

// Language persistence functions
export const saveLanguage = async (
  languageCode: SupportedLanguageCode
): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
  } catch (error) {
    console.warn("Error saving language preference:", error);
  }
};

export const getSavedLanguage =
  async (): Promise<SupportedLanguageCode | null> => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (
        savedLanguage &&
        SUPPORTED_LANGUAGES.some((lang) => lang.code === savedLanguage)
      ) {
        return savedLanguage as SupportedLanguageCode;
      }
      return null;
    } catch (error) {
      console.warn("Error getting saved language:", error);
      return null;
    }
  };

// Initialize i18next
const initI18n = async (): Promise<void> => {
  const detectedLanguage = await detectLanguage();

  await i18next.use(initReactI18next).init({
    lng: detectedLanguage,
    fallbackLng: "en",
    debug: __DEV__, // Enable debug in development

    // Resources
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      es: { translation: es },
      de: { translation: de },
      it: { translation: it },
      tr: { translation: tr },
      ru: { translation: ru },
      ja: { translation: ja },
      ko: { translation: ko },
      zh: { translation: zh },
    },

    // Options
    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },

    compatibilityJSON: "v4",
  });
};

// Change language function
export const changeLanguage = async (
  languageCode: SupportedLanguageCode
): Promise<void> => {
  try {
    await i18next.changeLanguage(languageCode);
    await saveLanguage(languageCode);
  } catch (error) {
    console.warn("Error changing language:", error);
  }
};

// Get current language
export const getCurrentLanguage = (): SupportedLanguageCode => {
  const currentLang = i18next.language;
  return SUPPORTED_LANGUAGES.some((lang) => lang.code === currentLang)
    ? (currentLang as SupportedLanguageCode)
    : "en";
};

// Get language display name
export const getLanguageDisplayName = (code: SupportedLanguageCode): string => {
  const language = SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
  return language?.nativeName || code;
};

// Initialize and export
initI18n();

export default i18next;
