import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Import translations
import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';
import esES from './locales/es-ES.json';
import frFR from './locales/fr-FR.json';
import zhCN from './locales/zh-CN.json';

// Types
export type Locale = 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR' | 'zh-CN';

export interface LocaleInfo {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LOCALES: LocaleInfo[] = [
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'en-US', name: 'English (US)', nativeName: 'English (US)', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español (España)', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French (France)', nativeName: 'Français (France)', flag: '🇫🇷' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
];

type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = { [key: string]: TranslationValue };

const translations: Record<Locale, Translations> = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES,
  'fr-FR': frFR,
  'zh-CN': zhCN,
};

// Helper to get nested value from object using dot notation
function getNestedValue(obj: Translations, path: string): string {
  const keys = path.split('.');
  let current: TranslationValue = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return path; // Return the key if translation not found
    }
  }
  
  return typeof current === 'string' ? current : path;
}

// Country to locale mapping for geolocation
const COUNTRY_LOCALE_MAP: Record<string, Locale> = {
  // Portuguese
  'BR': 'pt-BR', 'PT': 'pt-BR', 'AO': 'pt-BR', 'MZ': 'pt-BR',
  // Spanish
  'ES': 'es-ES', 'MX': 'es-ES', 'AR': 'es-ES', 'CO': 'es-ES', 'CL': 'es-ES', 'PE': 'es-ES', 'VE': 'es-ES', 'EC': 'es-ES', 'GT': 'es-ES', 'CU': 'es-ES', 'BO': 'es-ES', 'DO': 'es-ES', 'HN': 'es-ES', 'PY': 'es-ES', 'SV': 'es-ES', 'NI': 'es-ES', 'CR': 'es-ES', 'PA': 'es-ES', 'UY': 'es-ES',
  // French
  'FR': 'fr-FR', 'CA': 'fr-FR', 'BE': 'fr-FR', 'CH': 'fr-FR', 'SN': 'fr-FR', 'CI': 'fr-FR', 'CM': 'fr-FR', 'MG': 'fr-FR', 'ML': 'fr-FR',
  // Chinese
  'CN': 'zh-CN', 'TW': 'zh-CN', 'HK': 'zh-CN', 'SG': 'zh-CN',
  // English (default for many countries)
  'US': 'en-US', 'GB': 'en-US', 'AU': 'en-US', 'NZ': 'en-US', 'IE': 'en-US', 'ZA': 'en-US', 'IN': 'en-US', 'PH': 'en-US', 'NG': 'en-US', 'KE': 'en-US',
};

// Detect locale by geolocation (async)
export async function detectLocaleByGeolocation(): Promise<Locale | null> {
  try {
    // Use a free IP geolocation API
    const response = await fetch('https://ipapi.co/json/', { 
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });
    if (!response.ok) return null;
    
    const data = await response.json();
    const countryCode = data.country_code;
    
    if (countryCode && COUNTRY_LOCALE_MAP[countryCode]) {
      return COUNTRY_LOCALE_MAP[countryCode];
    }
    
    return null;
  } catch (error) {
    console.log('Geolocation detection failed, using browser language');
    return null;
  }
}

// Detect browser language
function detectBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'pt-BR';
  
  const browserLang = navigator.language || (navigator as any).userLanguage;
  
  if (browserLang.startsWith('pt')) return 'pt-BR';
  if (browserLang.startsWith('es')) return 'es-ES';
  if (browserLang.startsWith('en')) return 'en-US';
  if (browserLang.startsWith('fr')) return 'fr-FR';
  if (browserLang.startsWith('zh')) return 'zh-CN';
  
  return 'pt-BR'; // Default to Portuguese
}

// Get stored locale or detect from browser
function getInitialLocale(): Locale {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('sbar-locale') as Locale;
    if (stored && translations[stored]) {
      return stored;
    }
  }
  return detectBrowserLocale();
}

// Context
interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  locales: LocaleInfo[];
  currentLocaleInfo: LocaleInfo;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Provider
interface I18nProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
  onLocaleChange?: (locale: Locale) => void;
  userPreferredLocale?: Locale | null;
}

export function I18nProvider({ children, defaultLocale, onLocaleChange, userPreferredLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Priority: userPreferredLocale > stored locale > defaultLocale > browser detection
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('sbar-locale') as Locale;
      if (stored && translations[stored]) {
        return stored;
      }
    }
    // If defaultLocale is explicitly provided, use it and save to localStorage
    if (defaultLocale) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sbar-locale', defaultLocale);
      }
      return defaultLocale;
    }
    return getInitialLocale();
  });
  const [initialized, setInitialized] = useState(false);
  const [geoDetected, setGeoDetected] = useState(false);

  // Try geolocation detection on first visit (no stored locale)
  // Skip geolocation when defaultLocale is explicitly provided
  useEffect(() => {
    const hasStoredLocale = typeof localStorage !== 'undefined' && localStorage.getItem('sbar-locale');
    
    if (!hasStoredLocale && !geoDetected && !userPreferredLocale && !defaultLocale) {
      detectLocaleByGeolocation().then((detectedLocale) => {
        if (detectedLocale) {
          setLocaleState(detectedLocale);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('sbar-locale', detectedLocale);
          }
          console.log(`Locale detected by geolocation: ${detectedLocale}`);
        }
        setGeoDetected(true);
      });
    } else {
      setGeoDetected(true);
    }
  }, [geoDetected, userPreferredLocale, defaultLocale]);

  // Sync with user's preferred locale from database when available
  useEffect(() => {
    if (userPreferredLocale && !initialized) {
      setLocaleState(userPreferredLocale);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sbar-locale', userPreferredLocale);
      }
      setInitialized(true);
    }
  }, [userPreferredLocale, initialized]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sbar-locale', newLocale);
    }
    // Update document lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
    }
    // Notify parent about locale change (for saving to database)
    if (onLocaleChange) {
      onLocaleChange(newLocale);
    }
  }, [onLocaleChange]);

  // Set initial document lang
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  // Translation function with parameter interpolation
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let translation = getNestedValue(translations[locale], key);
    
    // Interpolate parameters
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
      });
    }
    
    return translation;
  }, [locale]);

  const currentLocaleInfo = SUPPORTED_LOCALES.find(l => l.code === locale) || SUPPORTED_LOCALES[0];

  const value: I18nContextType = {
    locale,
    setLocale,
    t,
    locales: SUPPORTED_LOCALES,
    currentLocaleInfo,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook
export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}

// Export for direct use
export { translations };
