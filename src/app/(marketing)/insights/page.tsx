"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { PageHero } from "@/components/marketing/PageHero";
import { Reveal } from "@/components/marketing/Reveal";
import { HeroBg, Section } from "@/components/marketing/pages/bits";
import { FILTERS, VISUALS, type FilterKey } from "@/components/marketing/pages/insights";
import { Icon } from "@/components/ui/Icon";
import { articles } from "@/lib/seed";

export default function InsightsPage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const list = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter)!;
    return filter === "all" ? articles : articles.filter((a) => (f.tags as readonly string[]).includes(a.tag));
  }, [filter]);
  const [feature, ...rest] = list;

  return (
    <>
      <PageHero
        eyebrow="Insights"
        title={<>Buying across borders,<br className="hidden md:block" /> without the guesswork.</>}
        aside={
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={clsx(
                  "relative rounded-lg px-[18px] py-[10px] text-sm leading-[18px] transition-colors",
                  filter === f.key ? "font-semibold text-night" : "border border-white/25 text-white hover:bg-white/8",
                )}
              >
                {filter === f.key && <motion.span layoutId="insight-pill" className="absolute inset-0 rounded-full bg-white" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                <span className="relative">{f.label}</span>
              </button>
            ))}
          </div>
        }
      >
        <HeroBg image="radial-gradient(ellipse 60% 90% at 100% 0%, #2F6BD8 0%, #2F6BD800 60%), radial-gradient(ellipse 40% 70% at 85% 100%, #F6A11A4D 0%, #F6A11A00 65%), linear-gradient(#08152F,#08152F)" />
      </PageHero>

      <Section className="flex flex-col gap-5 pb-20 pt-10 md:pb-[112px] md:pt-[56px]">
        <AnimatePresence mode="wait">
          <motion.div key={filter} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }} className="flex flex-col gap-5">
            {feature ? (
              <Link
                href={`/insights/${feature.slug}`}
                className="group flex flex-col overflow-hidden rounded-lg bg-mist lg:flex-row"
                style={{ backgroundImage: "radial-gradient(ellipse 70% 90% at 100% 0%, #C9DCFF 0%, #C9DCFF00 60%)" }}
              >
                <div className="flex grow basis-0 flex-col justify-between gap-6 p-6 md:p-12">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-white px-3 py-1.5 text-[13px] font-semibold leading-4 text-ink">{feature.tag}</span>
                    <span className="text-[13px] leading-4 text-muted">{feature.minutes} min read</span>
                  </div>
                  <h2 className="text-[32px] leading-[38px] md:text-[44px] md:leading-[50px] font-light tracking-tight text-ink">{feature.title}</h2>
                  <span className="inline-flex h-12 items-center gap-2 self-start rounded-lg border-[1.5px] border-ink px-[22px] text-[15px] font-semibold leading-[18px] text-ink transition-colors group-hover:bg-ink group-hover:text-white">
                    Read the guide
                    <Icon name="arrowUpRight" size={18} strokeWidth={1.75} />
                  </span>
                </div>
                <div className="flex h-[280px] items-center justify-center md:h-[420px] lg:w-[620px] lg:shrink-0">
                  <div className="h-full w-full max-w-[560px] bg-cover bg-center transition-transform duration-700 group-hover:scale-105 [mask-image:radial-gradient(closest-side,#000_55%,transparent_100%)]" style={{ backgroundImage: "url(/media/insights-feature.webp)" }} />
                </div>
              </Link>
            ) : (
              <div className="rounded-lg bg-mist p-12 text-center text-muted">No articles in this topic yet.</div>
            )}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((a, i) => {
                const v = VISUALS[i % VISUALS.length];
                return (
                  <Reveal key={a.slug} delay={(i % 3) * 0.08}>
                    <Link href={`/insights/${a.slug}`} className="group flex h-full flex-col gap-5 rounded-lg border border-mist px-4 pb-6 pt-4 shadow-[0_24px_48px_-32px_#0C1F4559] transition-transform hover:-translate-y-1">
                      <div className={clsx("flex h-[220px] shrink-0 items-center justify-center overflow-hidden rounded-lg", v.cover && "bg-cover bg-center")} style={{ backgroundImage: v.cover ? `url(${v.img})` : v.bg }}>
                        {!v.cover && <div className="h-[225px] w-[300px] bg-cover bg-center transition-transform duration-700 group-hover:scale-110 [mask-image:radial-gradient(closest-side,#000_55%,transparent_100%)]" style={{ backgroundImage: `url(${v.img})` }} />}
                      </div>
                      <div className="flex flex-col gap-[10px] px-2">
                        <div className="text-[13px] leading-4 text-muted">{a.tag} · {a.minutes} min</div>
                        <div className="text-[22px] leading-[29px] tracking-[-0.02em] text-ink">{a.title}</div>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </Section>
    </>
  );
}
