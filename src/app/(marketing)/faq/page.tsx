"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { PageHero } from "@/components/marketing/PageHero";
import { HeroBg, Section } from "@/components/marketing/pages/bits";
import { Icon } from "@/components/ui/Icon";
import { faqs } from "@/lib/seed";
import type { Faq } from "@/lib/types";

const GROUPS: { key: Faq["group"]; label: string }[] = [
  { key: "buying", label: "Buying" },
  { key: "trust", label: "Trust & verification" },
  { key: "money", label: "Payments & contracts" },
  { key: "selling", label: "For product companies" },
];

export default function FaqPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(faqs[0]?.q ?? null);
  const [active, setActive] = useState<Faq["group"]>("buying");

  const grouped = useMemo(() => {
    const term = q.trim().toLowerCase();
    return GROUPS.map((g) => ({
      ...g,
      items: faqs.filter((f) => f.group === g.key && (!term || f.q.toLowerCase().includes(term) || f.a.toLowerCase().includes(term))),
    }));
  }, [q]);
  const total = grouped.reduce((s, g) => s + g.items.length, 0);

  useEffect(() => {
    const els = GROUPS.map((g) => document.getElementById(`faq-${g.key}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vis) setActive(vis.target.id.replace("faq-", "") as Faq["group"]);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [grouped]);

  const jump = (key: Faq["group"]) => {
    setActive(key);
    document.getElementById(`faq-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <PageHero
        eyebrow="Help centre"
        title="Straight answers."
        aside={
          <label className="flex h-[60px] w-full items-center gap-3 rounded-full border border-white/20 bg-white/10 px-[22px] transition-colors focus-within:border-white/50 md:w-[520px]">
            <Icon name="search" size={20} strokeWidth={1.75} className="shrink-0 text-white" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search questions"
              className="w-full bg-transparent text-base leading-5 text-white outline-none placeholder:text-white/60"
            />
            {q && (
              <button onClick={() => setQ("")} aria-label="Clear search" className="text-white/70 hover:text-white">
                <Icon name="x" size={16} />
              </button>
            )}
          </label>
        }
      >
        <HeroBg image="radial-gradient(ellipse 60% 90% at 100% 0%, #2F6BD8 0%, #2F6BD800 60%), linear-gradient(#08152F,#08152F)" />
      </PageHero>

      <Section className="flex flex-col items-start gap-10 pb-20 pt-12 md:pb-[112px] md:pt-20 lg:flex-row lg:gap-16">
        <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-[260px]">
          <div className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {grouped.map((g) => (
              <button
                key={g.key}
                onClick={() => jump(g.key)}
                className={clsx("relative flex shrink-0 items-center justify-between gap-4 rounded-lg px-4 py-3 text-left text-[15px] leading-[18px] transition-colors", active === g.key ? "font-medium text-white" : "text-ink hover:bg-mist")}
              >
                {active === g.key && <motion.span layoutId="faq-active" className="absolute inset-0 rounded-lg bg-ink" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                <span className="relative whitespace-nowrap">{g.label}</span>
                <span className={clsx("relative text-[13px] leading-4", active === g.key ? "text-white/60" : "text-muted")}>{g.items.length}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 hidden border-t border-mist pt-6 lg:flex">
            <Link href="/contact" className="flex w-full items-center gap-[14px] rounded-lg border border-mist bg-white p-[18px] shadow-[0_20px_40px_-24px_#0C1F454D] transition-transform hover:-translate-y-0.5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-night shadow-[0_0_0_3px_#fff,0_0_0_4.5px_#14804A]" style={{ backgroundImage: "linear-gradient(135deg, #7FB6FF 0%, #2F6BD8 100%)" }}>
                AS
              </span>
              <span className="flex grow basis-0 flex-col gap-0.5">
                <span className="text-[15px] font-semibold leading-[18px] text-ink">Asha Rahman</span>
                <span className="text-xs leading-4 text-muted">Your DGIX advisor · online</span>
              </span>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mist text-ink"><Icon name="chat" size={18} strokeWidth={1.75} /></span>
            </Link>
          </div>
        </aside>

        <div className="flex w-full grow basis-0 flex-col gap-14">
          {total === 0 && (
            <div className="flex flex-col items-start gap-4 rounded-lg bg-mist p-8">
              <div className="text-[22px] leading-7 text-ink">No answers match “{q}”.</div>
              <Link href="/contact" className="text-[15px] font-semibold text-primary underline underline-offset-4">Ask an advisor instead</Link>
            </div>
          )}
          {grouped.map((g) =>
            g.items.length === 0 ? null : (
              <div key={g.key} id={`faq-${g.key}`} className="flex scroll-mt-6 flex-col gap-5">
                <h2 className="text-[30px] leading-[38px] md:text-[36px] md:leading-[44px] font-light tracking-tight text-ink">{g.label}</h2>
                <div className="flex flex-col border-t border-ink">
                  {g.items.map((f) => {
                    const isOpen = open === f.q;
                    return (
                      <div key={f.q} className="border-b border-mist">
                        <button onClick={() => setOpen(isOpen ? null : f.q)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-6 py-[22px] text-left">
                          <span className={clsx("text-[17px] leading-[22px] text-ink md:text-[18px]", isOpen && "font-medium")}>{f.q}</span>
                          <span className={clsx("flex size-[34px] shrink-0 items-center justify-center rounded-full transition-colors", isOpen ? "bg-ink text-white" : "border border-line text-ink")}>
                            <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }} className="flex">
                              <Icon name={isOpen ? "minus" : "plus"} size={16} strokeWidth={1.75} />
                            </motion.span>
                          </span>
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                              <p className="max-w-[720px] pb-[22px] text-base leading-[26px] text-muted">{f.a}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ),
          )}
        </div>
      </Section>
    </>
  );
}
