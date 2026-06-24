import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';

export type Language = 'en' | 'rw' | 'bm' | 'fr' | 'sw' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
    googleTranslateElementInstance?: any;
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const englishMap: Record<string, string> = {
  'common.loading': 'Loading...',
  'common.submit': 'Submit',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.close': 'Close',
  'common.search': 'Search',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.approve': 'Approve',
  'common.reject': 'Reject',
  'common.refresh': 'Refresh',
  'common.noData': 'No data found',
  'common.actions': 'Actions',
  'common.status': 'Status',
  'common.date': 'Date',
  'common.notes': 'Notes',
  'common.all': 'All',
  'common.pending': 'Pending',
  'common.approved': 'Approved',
  'common.rejected': 'Rejected',
  'nav.dashboard': 'Dashboard',
  'nav.jobs': 'Jobs',
  'nav.employees': 'Employees',
  'nav.stock': 'Stock',
  'nav.reports': 'Reports',
  'nav.settings': 'Settings',
  'nav.notifications': 'Notifications',
  'nav.leave': 'My Leave',
  'nav.profile': 'Profile & Password',
  'nav.logout': 'Logout',
  'nav.help': 'Help & Support',
  'lang.en': 'English',
  'lang.rw': 'Kinyarwanda',
  'lang.bm': 'Bambara',
  'lang.fr': 'Français',
  'lang.sw': 'Kiswahili',
  'lang.ar': 'العربية',
};

const kinyarwandaMap: Record<string, string> = {
  'common.loading': 'Gutegereza...',
  'common.submit': 'Ohereza',
  'common.back': 'Garuka',
  'common.next': 'Komeza',
  'common.close': 'Funga',
  'common.search': 'Shakisha',
  'common.cancel': 'Hagarika',
  'common.save': 'Bika',
  'common.delete': 'Siba',
  'common.edit': 'Hindura',
  'common.approve': 'Emeza',
  'common.reject': 'Tangira',
  'common.refresh': 'Vugurura',
  'common.noData': 'Nta makuru abonetse',
  'common.actions': 'Ibikorwa',
  'common.status': 'Imimerere',
  'common.date': 'Itariki',
  'common.notes': 'Ibisobanuro',
  'common.all': 'Byose',
  'common.pending': 'Bitegerezwa',
  'common.approved': 'Byemejwe',
  'common.rejected': 'Byanzwe',
  'nav.dashboard': 'Ikibaho',
  'nav.jobs': 'Imirimo',
  'nav.employees': 'Abakozi',
  'nav.stock': 'Ububiko',
  'nav.reports': 'Raporo',
  'nav.settings': 'Igenamiterere',
  'nav.notifications': 'Amatangazo',
  'nav.leave': 'Uruhushya rwanjye',
  'nav.profile': 'Umwirondoro & Ijambo banga',
  'nav.logout': 'Sohoka',
  'nav.help': 'Ubufasha',
  'lang.en': 'Icyongereza',
  'lang.rw': 'Ikinyarwanda',
  'lang.bm': 'Bambara',
  'lang.fr': 'Igifaransa',
  'lang.sw': 'Kiswahili',
  'lang.ar': 'Icyarabu',
};

const manualTranslations: Record<Language, Record<string, string>> = {
  en: {},
  rw: kinyarwandaMap,
  bm: {},
  fr: {},
  sw: {},
  ar: {},
};

const googleLanguageCodeMap: Record<Language, string> = {
  en: 'en', rw: 'rw', bm: 'bm', fr: 'fr', sw: 'sw', ar: 'ar',
};

const isValidLanguage = (v: string | null): v is Language =>
  v === 'en' || v === 'rw' || v === 'bm' || v === 'fr' || v === 'sw' || v === 'ar';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const latestLanguageRef = useRef<Language>('en');
  const hasAppliedOnceRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (isValidLanguage(saved)) {
      setLanguageState(saved);
      latestLanguageRef.current = saved;
    }
  }, []);

  const updateHtmlLang = useCallback((lang: Language) => {
    document.documentElement.lang = lang;
  }, []);

  const hideTranslateBanner = useCallback(() => {
    document.querySelectorAll<HTMLElement>('.goog-te-banner-frame, .skiptranslate').forEach((el) => {
      el.style.cssText = 'display:none!important;visibility:hidden!important;height:0!important;max-height:0!important;overflow:hidden!important;';
    });
    document.querySelectorAll<HTMLElement>('iframe[title*="translate"], iframe[name*="google"]').forEach((el) => {
      el.style.cssText = 'display:none!important;visibility:hidden!important;height:0!important;width:0!important;';
    });
    document.body.style.top = '0';
    document.body.style.position = 'static';
    document.body.classList.remove('top');
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
        if (combo.value !== code) combo.value = code;
        combo.dispatchEvent(new Event('change'));
      } else if (attempts++ < 25) {
        setTimeout(dispatch, 200);
      }
    };
    dispatch();
  }, []);

  useEffect(() => { updateHtmlLang(language); }, [language, updateHtmlLang]);

  useEffect(() => {
    latestLanguageRef.current = language;
    if (!hasAppliedOnceRef.current) { hasAppliedOnceRef.current = true; return; }
    applyGoogleTranslation(language);
    setTimeout(hideTranslateBanner, 300);
  }, [language, applyGoogleTranslation, hideTranslateBanner]);

  useEffect(() => {
    const initElement = () => {
      const el = document.getElementById('google_translate_element');
      if (!el) { setTimeout(initElement, 200); return; }
      if (window.google?.translate?.TranslateElement) {
        if (!window.googleTranslateElementInstance) {
          window.googleTranslateElementInstance = new window.google.translate.TranslateElement(
            { pageLanguage: 'en', includedLanguages: 'en,rw,bm,fr,sw,ar', autoDisplay: false },
            'google_translate_element'
          );
        }
        applyGoogleTranslation(latestLanguageRef.current);
        setTimeout(hideTranslateBanner, 100);
      }
    };

    window.googleTranslateElementInit = initElement;

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onload = () => setTimeout(hideTranslateBanner, 500);
      document.body.appendChild(script);
    } else {
      initElement();
    }

    const observer = new MutationObserver((mutations) => {
      const shouldHide = mutations.some((m) =>
        Array.from(m.addedNodes).some((n) => {
          if (n.nodeType !== 1) return false;
          const el = n as Element;
          return (
            el.classList?.contains('goog-te-banner-frame') ||
            el.classList?.contains('skiptranslate') ||
            !!el.querySelector?.('.goog-te-banner-frame, .skiptranslate') ||
            (el.tagName === 'IFRAME' && (el.getAttribute('title')?.includes('translate') || el.getAttribute('name')?.includes('google')))
          );
        })
      );
      if (shouldHide) hideTranslateBanner();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    hideTranslateBanner();
    const interval = setInterval(hideTranslateBanner, 2000);
    return () => { observer.disconnect(); clearInterval(interval); };
  }, [applyGoogleTranslation, hideTranslateBanner]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string =>
    manualTranslations[language]?.[key] ?? englishMap[key] ?? key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
