"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AppLocale = "en" | "bn" | "ar";

const STORAGE_KEY = "dgix_locale";

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

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (next: AppLocale) => void;
  t: (key: string, fallback?: string) => string;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (k, fb) => fb ?? DICT.en[k] ?? k,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "bn" || saved === "ar") {
        setLocaleState(saved);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // ignore storage errors
    }
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      t: (key: string, fallback?: string) => DICT[locale][key] ?? DICT.en[key] ?? fallback ?? key,
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  const options: { code: AppLocale; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "bn", label: "বাংলা" },
    { code: "ar", label: "العربية" },
  ];
  return (
    <div
      role="group"
      aria-label="Language switcher"
      className={`inline-flex items-center rounded-lg border border-[#DCE4F2] bg-[#F6F8FC] p-0.5 text-xs ${className}`}
    >
      {options.map((opt) => (
        <button
          key={opt.code}
          type="button"
          onClick={() => setLocale(opt.code)}
          className={
            locale === opt.code
              ? "rounded-md bg-night px-2 py-1 font-semibold text-paper transition"
              : "rounded-md px-2 py-1 font-medium text-muted transition hover:text-ink"
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
