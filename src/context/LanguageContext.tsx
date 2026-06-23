import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';

type Language = 'en' | 'rw' | 'fr' | 'sw' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
    googleTranslateElementInstance?: any;
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const googleLanguageCodeMap: Record<Language, string> = {
  en: 'en', rw: 'rw', fr: 'fr', sw: 'sw', ar: 'ar',
};

const isValidLanguage = (v: string | null): v is Language =>
  v === 'en' || v === 'rw' || v === 'fr' || v === 'sw' || v === 'ar';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const latestLanguageRef = useRef<Language>('en');
  const hasAppliedOnceRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem('dashboard_language');
    if (isValidLanguage(saved)) {
      setLanguageState(saved);
      latestLanguageRef.current = saved;
    }
  }, []);

  const hideTranslateBanner = useCallback(() => {
    document.querySelectorAll<HTMLElement>('.goog-te-banner-frame, .skiptranslate').forEach((el) => {
      el.style.cssText = 'display:none!important;visibility:hidden!important;height:0!important;';
    });
    document.body.style.top = '0';
    document.body.style.position = 'static';
  }, []);

  const applyGoogleTranslation = useCallback((lang: Language) => {
    const code = googleLanguageCodeMap[lang];
    const hostname = window.location.hostname;
    const hasDomain = hostname.includes('.');
    const expires = 'Thu, 01 Jan 1970 00:00:00 GMT';

    if (code === 'en') {
      document.cookie = `googtrans=;expires=${expires};path=/;`;
      if (hasDomain) document.cookie = `googtrans=;expires=${expires};path=/;domain=${hostname};`;
    } else {
      const val = `/en/${code}`;
      document.cookie = `googtrans=${val};path=/;`;
      if (hasDomain) document.cookie = `googtrans=${val};path=/;domain=${hostname};`;
    }

    let attempts = 0;
    const dispatch = () => {
      const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (combo) {
        combo.value = code === 'en' ? 'en' : code;
        combo.dispatchEvent(new Event('change'));
      } else if (attempts++ < 25) {
        setTimeout(dispatch, 200);
      }
    };
    dispatch();
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    latestLanguageRef.current = language;
    if (!hasAppliedOnceRef.current) { hasAppliedOnceRef.current = true; return; }
    applyGoogleTranslation(language);
    setTimeout(hideTranslateBanner, 300);
  }, [language, applyGoogleTranslation, hideTranslateBanner]);

  useEffect(() => {
    const init = () => {
      const el = document.getElementById('google_translate_element');
      if (!el) { setTimeout(init, 200); return; }
      if (window.google?.translate?.TranslateElement && !window.googleTranslateElementInstance) {
        window.googleTranslateElementInstance = new window.google.translate.TranslateElement(
          { pageLanguage: 'en', includedLanguages: 'en,rw,fr,sw,ar', autoDisplay: false },
          'google_translate_element'
        );
      }
      applyGoogleTranslation(latestLanguageRef.current);
      setTimeout(hideTranslateBanner, 100);
    };

    window.googleTranslateElementInit = init;

    if (!document.getElementById('google-translate-script')) {
      const s = document.createElement('script');
      s.id = 'google-translate-script';
      s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      s.async = true;
      s.onload = () => setTimeout(hideTranslateBanner, 500);
      document.body.appendChild(s);
    } else {
      init();
    }

    const observer = new MutationObserver(() => hideTranslateBanner());
    observer.observe(document.body, { childList: true, subtree: true });
    const interval = setInterval(hideTranslateBanner, 2000);

    return () => { observer.disconnect(); clearInterval(interval); };
  }, [applyGoogleTranslation, hideTranslateBanner]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('dashboard_language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <div id="google_translate_element" style={{ display: 'none' }} />
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export type { Language };
