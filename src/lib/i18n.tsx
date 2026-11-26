"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

/**
 * Lightweight English / Bangla switch for the public site.
 * Text is keyed by its English wording: anything missing from BN stays in English.
 */
export type Lang = "en" | "bn";

const BN: Record<string, string> = {
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

const KEY = "dgix_lang";
type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (en: string) => string };
const LangCtx = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (s) => s });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "bn" || saved === "en") setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(KEY, l); } catch {}
  }, []);

  const t = useCallback((en: string) => (lang === "bn" ? BN[en] ?? en : en), [lang]);
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);

/** Translate a fixed English string: <T>Solutions</T>. Safe inside server components. */
export function T({ children }: { children: string }) {
  const { t } = useLang();
  return <>{t(children)}</>;
}

/** "বাংলা" / "English" switch. */
export function LanguageToggle({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const { lang, setLang } = useLang();
  const next: Lang = lang === "en" ? "bn" : "en";
  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      lang={next}
      aria-label={next === "bn" ? "Switch to Bangla" : "ইংরেজিতে দেখুন"}
      className={
        className ??
        (tone === "dark"
          ? "inline-flex h-10 items-center rounded-lg px-3 text-[15px] text-white/72 transition-colors hover:text-white"
          : "inline-flex h-10 items-center rounded-lg px-3 text-[15px] text-ink/70 transition-colors hover:text-ink")
      }
    >
      {next === "bn" ? "বাংলা" : "English"}
    </button>
  );
}
