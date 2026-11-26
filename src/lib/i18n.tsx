"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * One language system for the whole site.
 *
 * - Portals use keys: t("nav.home") from DICT (English, Bangla, Arabic). (Masum, feat/brd-gap-closure)
 * - The public site uses English text as the key: <T>Solutions</T> from TEXT_BN. (v1.7.0)
 * Anything without a translation falls back to English. Arabic switches the page to right-to-left.
 */
export type AppLocale = "en" | "bn" | "ar";

const STORAGE_KEY = "dgix_locale";
const LEGACY_KEY = "dgix_lang"; // v1.7.0 stored the choice here

const DICT: Record<AppLocale, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.requests": "Requests",
    "nav.demos": "Demos",
    "nav.offers": "Offers & contracts",
    "nav.projects": "Projects",
    "nav.billing": "Billing",
    "nav.licences": "Licences",
    "nav.support": "Support",
    "nav.products": "Products & passport",
    "nav.verification": "Verification",
    "nav.leads": "Leads & demos",
    "nav.orders": "Orders & delivery",
    "nav.payouts": "Payouts",
    "nav.agreement": "Agreement & contracts",
    "nav.today": "Today",
    "nav.matching": "Matching desk",
    "nav.review": "Product review",
    "nav.governance": "Council & audit",
    "nav.delivery": "Delivery",
    "nav.finance": "Finance & ledger",
    "nav.partners": "Partners & agreements",
    "nav.contracts": "Contracts & templates",
    "cta.new_request": "New request",
    "cta.add_product": "+ Add product",
    "cta.new_shortlist": "+ New shortlist",
    "cta.pay_invoice": "Pay invoice",
    "cta.download_receipt": "Download receipt",
    "label.verified_partner": "DGIX Verified Partner",
  },
  bn: {
    "nav.home": "হোম",
    "nav.requests": "রিকোয়েস্ট",
    "nav.demos": "ডেমো",
    "nav.offers": "অফার ও চুক্তি",
    "nav.projects": "প্রজেক্ট",
    "nav.billing": "বিলিং ও পেমেন্ট",
    "nav.licences": "লাইসেন্স",
    "nav.support": "সাপোর্ট",
    "nav.products": "প্রোডাক্ট ও পাসপোর্ট",
    "nav.verification": "ভেরিফিকেশন",
    "nav.leads": "লিড ও ডেমো",
    "nav.orders": "অর্ডার ও ডেলিভারি",
    "nav.payouts": "পেআউট",
    "nav.agreement": "চুক্তি ও এমওইউ",
    "nav.today": "আজকের সারসংক্ষেপ",
    "nav.matching": "ম্যাচিং ডেস্ক",
    "nav.review": "প্রোডাক্ট রিভিউ",
    "nav.governance": "কাউন্সিল ও অডিট",
    "nav.delivery": "ডেলিভারি",
    "nav.finance": "ফাইন্যান্স ও লেজার",
    "nav.partners": "পার্টনার ও চুক্তি",
    "nav.contracts": "কন্ট্রাক্ট ও টেমপ্লেট",
    "cta.new_request": "নতুন রিকোয়েস্ট",
    "cta.add_product": "+ প্রোডাক্ট যোগ করুন",
    "cta.new_shortlist": "+ নতুন শর্টলিস্ট",
    "cta.pay_invoice": "ইনভয়েস পরিশোধ করুন",
    "cta.download_receipt": "রসিদ ডাউনলোড",
    "label.verified_partner": "DGIX যাচাইকৃত পার্টনার",
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.requests": "الطلبات",
    "nav.demos": "العروض التوضيحية",
    "nav.offers": "العروض والعقود",
    "nav.projects": "المشاريع",
    "nav.billing": "الفواتير والدفع",
    "nav.licences": "التراخيص",
    "nav.support": "الدعم",
    "nav.products": "المنتجات والجواز",
    "nav.verification": "التحقق",
    "nav.leads": "العملاء والعروض",
    "nav.orders": "الطلبات والتسليم",
    "nav.payouts": "المدفوعات",
    "nav.agreement": "الاتفاقيات والعقود",
    "nav.today": "اليوم",
    "nav.matching": "مكتب المطابقة",
    "nav.review": "مراجعة المنتجات",
    "nav.governance": "المجلس والتدقيق",
    "nav.delivery": "التسليم",
    "nav.finance": "المالية والسجل",
    "nav.partners": "الشركاء والاتفاقيات",
    "nav.contracts": "العقود والنماذج",
    "cta.new_request": "طلب جديد",
    "cta.add_product": "+ إضافة منتج",
    "cta.new_shortlist": "+ قائمة مختصرة",
    "cta.pay_invoice": "دفع الفاتورة",
    "cta.download_receipt": "تنزيل الإيصال",
    "label.verified_partner": "شريك DGIX معتمد",
  },
};

/** Public-site text, keyed by its English wording. */
const TEXT_BN: Record<string, string> = {
  // Navigation and calls to action
  "Solutions": "সমাধান",
  "How it works": "কীভাবে কাজ করে",
  "Daffodil Verified": "ড্যাফোডিল ভেরিফায়েড",
  "Sell with us": "আমাদের সাথে বিক্রি করুন",
  "Sign in": "সাইন ইন",
  "Sign out": "সাইন আউট",
  "Get on board": "যুক্ত হোন",
  "Pricing": "মূল্য",
  "Get the app": "অ্যাপ নিন",
  "About": "আমাদের সম্পর্কে",
  "Contact": "যোগাযোগ",
  "Become a partner": "পার্টনার হোন",
  "Open my portal": "আমার পোর্টাল খুলুন",
  "Open console": "কনসোল খুলুন",
  "Get my shortlist": "আমার শর্টলিস্ট নিন",

  // Hero
  "Built in Bangladesh.": "বাংলাদেশে তৈরি।",
  "For the world.": "বিশ্বের জন্য।",
  "A Daffodil Group initiative": "ড্যাফোডিল গ্রুপের একটি উদ্যোগ",
  " to take promising Bangladeshi technology to global buyers, and bring global expertise and opportunity back to Bangladesh.":
    ", সম্ভাবনাময় বাংলাদেশি প্রযুক্তিকে বিশ্বের ক্রেতাদের কাছে পৌঁছে দিতে এবং বৈশ্বিক দক্ষতা ও সুযোগ বাংলাদেশে ফিরিয়ে আনতে।",
  "Try": "দেখুন",
  "HR & payroll": "এইচআর ও পেরোল",
  "Clinic billing": "ক্লিনিক বিলিং",
  "AI document reading": "এআই দিয়ে ডকুমেন্ট পড়া",
  "School management": "স্কুল ব্যবস্থাপনা",
  "Watch how DGIX works": "DGIX কীভাবে কাজ করে দেখুন",
  "How DGIX works": "DGIX কীভাবে কাজ করে",
  "From request to go-live, in one minute.": "অনুরোধ থেকে চালু হওয়া পর্যন্ত, এক মিনিটে।",

  // Home section headings
  "From idea to market.": "ধারণা থেকে বাজারে।",
  "Two ways into DGIX": "DGIX-এ যুক্ত হওয়ার দুটি পথ",
  "One exchange.": "একটাই এক্সচেঞ্জ।",
  "Both sides protected.": "দুই পক্ষই সুরক্ষিত।",
  "For buyers": "ক্রেতাদের জন্য",
  "For product companies": "প্রোডাক্ট কোম্পানির জন্য",
  "The difference": "পার্থক্য",
  "Why not go direct?": "সরাসরি কেন নয়?",
  "Most products won't make the cut. That's the point.": "বেশিরভাগ পণ্যই উত্তীর্ণ হয় না। সেটাই উদ্দেশ্য।",
  "The portfolio": "পোর্টফোলিও",
  "What Bangladesh builds.": "বাংলাদেশ যা তৈরি করে।",
  "Rooted in technology and education since 1990.": "১৯৯০ সাল থেকে প্রযুক্তি ও শিক্ষার শিকড়ে।",
  "Work with DGIX": "DGIX-এর সাথে কাজ করুন",
  "Take the next step.": "পরের ধাপ নিন।",
  "FAQ": "প্রশ্নোত্তর",
  "Straight answers.": "সোজাসাপ্টা উত্তর।",
  "DGIX for Android": "অ্যান্ড্রয়েডের জন্য DGIX",
  "Download the DGIX app today": "আজই DGIX অ্যাপ ডাউনলোড করুন",
  "More about the app": "অ্যাপ সম্পর্কে আরও",

  // Footer
  "You name it.": "আপনি বলুন।",
  "DGIX has it.": "DGIX-এ আছে।",
  "Get my verified shortlist": "আমার যাচাই করা শর্টলিস্ট নিন",
  "Buy": "কিনুন",
  "Trust": "আস্থা",
  "Partners": "পার্টনার",
  "Enrol your organisation": "প্রতিষ্ঠান নিবন্ধন করুন",
  "Android app": "অ্যান্ড্রয়েড অ্যাপ",
  "Support network": "সহায়তা নেটওয়ার্ক",
  "Sell through DGIX": "DGIX-এর মাধ্যমে বিক্রি করুন",
  "Events": "ইভেন্ট",
  "Insights": "ইনসাইটস",
  "A Daffodil Group initiative.": "ড্যাফোডিল গ্রুপের একটি উদ্যোগ।",
  "Privacy": "গোপনীয়তা",
  "Terms": "শর্তাবলি",
  "Cookies": "কুকিজ",
  "Language": "ভাষা",
};

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (next: AppLocale) => void;
  t: (key: string, fallback?: string) => string;
};

const lookup = (locale: AppLocale, key: string, fallback?: string) =>
  DICT[locale]?.[key] ?? (locale === "bn" ? TEXT_BN[key] : undefined) ?? DICT.en[key] ?? fallback ?? key;

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (k, fb) => lookup("en", k, fb),
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_KEY);
      if (saved === "en" || saved === "bn" || saved === "ar") setLocaleState(saved);
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
      window.localStorage.removeItem(LEGACY_KEY);
    } catch {
      // ignore storage errors
    }
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale: setLocaleState, t: (key: string, fallback?: string) => lookup(locale, key, fallback) }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

/* ---- v1.7.0 names, kept as aliases so public-site components don't change ---- */

export type Lang = AppLocale;
export const LanguageProvider = LocaleProvider;

export function useLang() {
  const { locale, setLocale, t } = useLocale();
  const tt = useCallback((en: string) => t(en, en), [t]);
  return { lang: locale, setLang: setLocale, t: tt };
}

/** Translate a fixed English string: <T>Solutions</T>. Safe inside server components. */
export function T({ children }: { children: string }) {
  const { t } = useLocale();
  return <>{t(children, children)}</>;
}

/** EN · বাংলা · العربية. `tone="dark"` for the public navigation, `light` for the portals. */
export function LanguageToggle({ className = "", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const { locale, setLocale } = useLocale();
  const options: { code: AppLocale; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "bn", label: "বাংলা" },
    { code: "ar", label: "العربية" },
  ];
  const dark = tone === "dark";
  // Only apply the default display when the caller doesn't set one (e.g. "hidden lg:inline-flex").
  const display = /(^|\s)(hidden|flex|inline-flex|block|grid)(\s|$)/.test(className) ? "" : "inline-flex";
  return (
    <div
      role="group"
      aria-label="Language"
      className={`${display} items-center rounded-lg border p-0.5 text-xs ${dark ? "border-white/18 bg-white/8" : "border-[#DCE4F2] bg-[#F6F8FC]"} ${className}`}
    >
      {options.map((opt) => {
        const on = locale === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            lang={opt.code}
            aria-pressed={on}
            onClick={() => setLocale(opt.code)}
            className={
              on
                ? `rounded-md px-2 py-1 font-semibold transition ${dark ? "bg-white text-night" : "bg-night text-paper"}`
                : `rounded-md px-2 py-1 font-medium transition ${dark ? "text-white/70 hover:text-white" : "text-muted hover:text-ink"}`
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
