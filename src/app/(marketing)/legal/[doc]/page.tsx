"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import clsx from "clsx";
import { PageHero } from "@/components/marketing/PageHero";
import { HeroBg, Section } from "@/components/marketing/pages/bits";
import { COOKIE_ROWS, LEGAL } from "@/components/marketing/pages/legal";
import { Icon } from "@/components/ui/Icon";

const typeColor = { Essential: "text-success", Preference: "text-primary", Analytics: "text-warning", Marketing: "text-danger" } as const;

export default function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc: key } = use(params);
  const doc = LEGAL.find((d) => d.key === key);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!doc) return;
    const els = doc.sections.map((_, i) => document.getElementById(`s-${i + 1}`)).filter(Boolean) as HTMLElement[];
    const onScroll = () => {
      const line = window.innerHeight * 0.3;
      let idx = 0;
      els.forEach((el, i) => {
        if (el.getBoundingClientRect().top <= line) idx = i;
      });
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) idx = els.length - 1;
      setActive(idx);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [doc]);

  if (!doc) notFound();

  const jump = (i: number) => document.getElementById(`s-${i + 1}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      <PageHero
        eyebrow={
          <div className="flex flex-wrap gap-1.5">
            {LEGAL.map((d) => (
              <Link key={d.key} href={`/legal/${d.key}`} className={clsx("rounded-full px-4 py-2 text-sm leading-[18px]", d.key === doc.key ? "bg-white font-semibold text-night" : "border border-white/25 text-white hover:bg-white/8")}>
                {d.label}
              </Link>
            ))}
          </div>
        }
        title={<span className="block text-[44px] leading-[46px] md:text-[80px] md:leading-[82px]">{doc.title}</span>}
        aside={
          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="text-sm leading-[18px] text-white/70">Effective 1 December 2026 · Version 1.0</div>
            <button onClick={() => window.print()} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/22 bg-white/8 px-[18px] text-sm font-medium text-white hover:bg-white/14">
              <Icon name="download" size={18} strokeWidth={1.75} /> Download PDF
            </button>
          </div>
        }
      >
        <HeroBg image="radial-gradient(ellipse 60% 90% at 100% 0%, #2F6BD8 0%, #2F6BD800 60%), linear-gradient(#08152F,#08152F)" />
      </PageHero>

      <Section className="flex flex-col items-start gap-10 pb-20 pt-12 md:pb-[112px] md:pt-[72px] lg:flex-row lg:gap-20">
        <nav className="sticky top-0 z-10 -mx-4 w-[calc(100%+32px)] shrink-0 border-b border-mist bg-white/95 px-4 py-2 backdrop-blur lg:top-6 lg:mx-0 lg:w-[280px] lg:border-0 lg:bg-transparent lg:p-0">
          <div className="hidden px-[14px] pb-[10px] text-[13px] font-medium leading-4 text-muted lg:block">On this page</div>
          <div className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {doc.sections.map((s, i) => (
              <button key={s.h} onClick={() => jump(i)} className={clsx("relative shrink-0 whitespace-nowrap rounded-lg px-[14px] py-[10px] text-left text-sm leading-[18px] transition-colors", active === i ? "font-medium text-white" : "text-muted hover:text-ink")}>
                {active === i && <motion.span layoutId="legal-toc" className="absolute inset-0 rounded-lg bg-ink" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                <span className="relative">{i + 1}. {s.h}</span>
              </button>
            ))}
          </div>
        </nav>

        <article className="flex w-full min-w-0 max-w-[760px] grow basis-0 flex-col gap-10">
          <div className="flex flex-col gap-[14px] rounded-lg bg-mist p-6 md:p-7" style={{ backgroundImage: "radial-gradient(ellipse 60% 100% at 100% 0%, #C9DCFF 0%, #C9DCFF00 60%)" }}>
            <div className="flex items-center gap-[10px] text-ink">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z" /></svg>
              <span className="text-[18px] font-semibold leading-[22px]">In plain words</span>
            </div>
            <p className="text-base leading-[27px] text-ink">{doc.plain}</p>
          </div>
          {doc.sections.map((s, i) => (
            <section key={s.h} id={`s-${i + 1}`} className="flex scroll-mt-24 flex-col gap-[14px] lg:scroll-mt-8">
              <h2 className="text-[24px] leading-[30px] md:text-[28px] md:leading-[34px] tracking-[-0.02em] text-ink">{i + 1}. {s.h}</h2>
              {s.p && <p className="text-base leading-7 text-[#3A4766]">{s.p}</p>}
              {s.table && (
                <div className="overflow-x-auto rounded-lg border border-mist">
                  <div className="min-w-[560px]">
                    <div className="flex bg-[#F6F8FC] px-5 py-3 text-xs font-semibold uppercase leading-4 tracking-tight text-muted">
                      <div className="grow-[1.2] basis-0">Name</div>
                      <div className="grow basis-0">Type</div>
                      <div className="grow-[2] basis-0">Purpose</div>
                      <div className="w-20 shrink-0">Expires</div>
                    </div>
                    {COOKIE_ROWS.map((r) => (
                      <div key={r.name} className="flex border-t border-mist px-5 py-[14px] text-sm leading-[18px] text-[#3A4766]">
                        <div className="grow-[1.2] basis-0 font-mono text-[13px] leading-4 text-ink">{r.name}</div>
                        <div className={clsx("grow basis-0", typeColor[r.type])}>{r.type}</div>
                        <div className="grow-[2] basis-0">{r.purpose}</div>
                        <div className="w-20 shrink-0">{r.expires}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ))}
          <div className="flex items-center gap-[10px] rounded-lg border border-[#F3D9B0] bg-[#FFFBF4] px-[18px] py-[14px] text-[13px] leading-4 text-[#6B4A12]">
            <Icon name="info" size={18} strokeWidth={1.75} className="shrink-0 text-warning" />
            Design draft. Wording must be approved by Daffodil Group&apos;s counsel before publishing.
          </div>
        </article>
      </Section>
    </>
  );
}
